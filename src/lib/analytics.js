// What to study next, told the same way on every page: the skill map and
// its practice states, the one next step (nextStep, which follows the SAT
// Math plan in Learn), the "Start here" diagnostic and where it places a
// student in the plan, pacing, the trend across finished sets, and the
// weekly plan's counts. Pure logic with no DOM access; loads in Node and as
// a plain browser script (window.LiminalAnalytics, after window.LiminalRuns
// and window.LiminalProgress).
//
// Every accuracy here comes from LiminalProgress.stats, the one accuracy
// model: the retired fixed SAT banks are left out, a blank counts as wrong,
// and a correct answer after a hint is not counted as correct. Nothing here
// estimates a score; the states are practice guidance.
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(
    node ? require("./progress") : root.LiminalProgress,
    node ? require("./runs") : root.LiminalRuns,
  );
  if (node) module.exports = api;
  else root.LiminalAnalytics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Progress, Runs) {
  "use strict";

  const TIERS = ["Easy", "Medium", "Hard"];
  // Fewer counted answers than this and a skill's accuracy says little.
  const MIN_ATTEMPTS = 5;
  // The mastery gate of the SAT Math plan page in Learn
  // (content/learn/sat/general/): at least 24 correct of the skill's last 30
  // Medium answers. Fewer than 30 cannot meet it: the gate is a run of
  // evidence, not a lucky start. A student checks it after every answer, and
  // a window re-checked that often is met by chance far more than once: a
  // student who is right 70% of the time met the earlier 16-of-20 rule
  // within 60 Medium answers 82% of the time, and meets this one 50% of the
  // time; one right 80% of the time meets it 94% of the time.
  const GATE = { tier: "Medium", window: 30, correct: 24, days: 2, templates: 2 };
  // Mastered: the gate, plus at least 10 correct of the skill's last 15 Hard
  // answers. The earlier bar, 60% over 5 or more Hard answers, called a
  // student with a 30% Hard hit rate mastered within 20 Hard answers 70% of
  // the time; this one does so 1% of the time, and a 70% student 87%.
  const HARD_BAR = { tier: "Hard", window: 15, correct: 10, days: 2, templates: 2 };
  // Both windows hold each question's first answer only: answering a
  // question again (Review brings a missed one back as it was) tests
  // memory of it, not the skill. A fresh version of the same template is a
  // new question and counts. Each window must also span at least `days`
  // calendar days and `templates` question designs, so one sitting of
  // massed drill on one design cannot fill it.
  // Practice states, in the order a skill moves through them.
  // "accuracy-only" is the state of every skill with enough answers in a
  // section whose difficulty labels are not verified (the fixed ACT banks,
  // where Hard differs from Easy by label only): no gate, no Mastered.
  const STATES = ["not-started", "not-enough-data", "building", "at-gate", "mastered", "accuracy-only"];
  const STATE_LABELS = {
    "not-started": "Not started",
    "not-enough-data": "Not enough data",
    building: "Building",
    "at-gate": "At the gate",
    mastered: "Mastered",
    "accuracy-only": "Accuracy only",
  };
  // "Routine", the step before the gate in the SAT Math plan's per-skill
  // loop (practise at Easy until the method is routine, then at Medium): at
  // least 8 correct of the skill's last 10 Easy first answers, or of its
  // last 10 Medium first answers, so a student already sure at Medium is not
  // sent back to Easy. No spread over days or designs: the gate that follows
  // asks for that, and a student who is right 60% of the time rarely meets
  // 8 of 10.
  const ROUTINE = { tiers: ["Easy", "Medium"], window: 10, correct: 8, days: 1, templates: 1 };
  // The "Start here" diagnostic: this many questions at these tiers.
  const DIAGNOSTIC = { count: 20, tiers: ["Medium", "Hard"] };
  // Twenty questions over a section's skills is at most two in any skill,
  // too few to judge one, so the diagnostic is read by domain: a domain is
  // shown when at least 80% of at least 3 of its questions were right.
  const PLACEMENT = { minQuestions: 3, accuracy: 0.8 };
  // The sequence of the SAT Math plan in Learn
  // (content/learn/sat/general/math-plan.md, "The sequence"): four stages,
  // each a list of catalog skill names in the page's order. Stage 4's
  // Geometry and Trigonometry skills start, as the page says, with right
  // triangles and circles; the other two follow in catalog order.
  // test/analytics.test.js holds this list to the catalog (every SAT Math
  // skill exactly once) and to the page's links.
  const PLANS = {
    "sat-math": {
      name: "SAT Math plan",
      learnPage: "sat/general/math-plan",
      stages: [
        {
          stage: 1,
          title: "Linear equations and functions, with percents and ratios",
          skills: ["Linear equations in one variable", "Linear functions", "Linear equations in two variables",
            "Percentages", "Ratios, rates, and units"],
        },
        {
          stage: 2,
          title: "Systems, inequalities and models",
          skills: ["Systems of two linear equations", "Linear inequalities", "Two-variable data", "One-variable data"],
        },
        {
          stage: 3,
          title: "Equivalent expressions, quadratics and exponentials",
          skills: ["Equivalent expressions", "Nonlinear equations", "Nonlinear functions", "Systems of equations"],
        },
        {
          stage: 4,
          title: "Probability, statistics, geometry and trigonometry",
          skills: ["Probability", "Statistical inference", "Right triangles and trigonometry", "Circles",
            "Area and volume", "Lines, angles, and triangles"],
        },
      ],
    },
  };
  // A pacing row needs this many timed answers before it is listed.
  const PACE_MIN = 3;
  const DAY_MS = 24 * 60 * 60 * 1000;

  function hash(text) {
    let value = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function sectionOf(attempt) {
    return attempt.sectionKey || Progress.sectionOfId(attempt.questionId);
  }

  function skillKey(sectionKey, skill) {
    return `${sectionKey}|${skill}`;
  }

  // Whether the accuracy model counts this attempt. Asked of stats itself,
  // so what counts is decided in one place.
  function counted(attempt) {
    return Progress.stats([attempt]).attempted === 1;
  }

  function byTime(left, right) {
    return (Number(left.timestamp) || 0) - (Number(right.timestamp) || 0);
  }

  function tally(row) {
    return row
      ? { attempted: row.attempted, correct: row.correct, accuracy: row.accuracy }
      : { attempted: 0, correct: 0, accuracy: null };
  }

  /* -------------------------------------------------------- template info */

  // Each live template's tier, taxonomy, and version from the built
  // registries (window.PRACTICE_TEMPLATES), in the shape
  // LiminalProgress.withCurrentTemplates takes, so old answers are re-tiered
  // without loading a section's template bundle. Entries without a tier
  // (retired, or a registry built without them) are left out, and their
  // answers keep what they stored.
  function registryTemplateInfo(registries) {
    const info = {};
    Object.keys(registries || {}).forEach((sectionKey) => {
      const entries = ((registries[sectionKey] || {}).templates || [])
        .filter((entry) => entry && !entry.retired && entry.difficulty);
      if (!entries.length) return;
      info[sectionKey] = {};
      entries.forEach((entry) => {
        info[sectionKey][entry.id] = {
          difficulty: entry.difficulty,
          domain: entry.domain,
          skill: entry.skill,
          subskill: entry.subskill,
          version: Number(entry.version) || 1,
        };
      });
    });
    return info;
  }

  // Template info from several sources; later ones win per template (the
  // loaded templates over the registry, say).
  function mergeTemplateInfo(...sources) {
    const merged = {};
    sources.forEach((source) => {
      Object.keys(source || {}).forEach((sectionKey) => {
        merged[sectionKey] = Object.assign(merged[sectionKey] || {}, source[sectionKey]);
      });
    });
    return merged;
  }

  /* ------------------------------------------------------------ skill map */

  // A skill's practice state from its counts (see STATES).
  function skillState(row) {
    if (!row.attempted) return "not-started";
    if (row.attempted < MIN_ATTEMPTS) return "not-enough-data";
    if (row.tiered === false) return "accuracy-only";
    if (!row.gate.met) return "building";
    if (row.hardBar.met) return "mastered";
    return "at-gate";
  }

  const dayOf = (timestamp) => {
    const date = new Date(Number(timestamp) || 0);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };
  const designOf = (attempt) => attempt.templateId ||
    (Progress.parseQuestionId(attempt.questionId) || {}).templateId || attempt.questionId;

  // The last `bar.window` first answers at the bar's tier, counted by the
  // accuracy model: { attempted, correct, accuracy, window, needed, days,
  // templates, met }, where days and templates count the local calendar
  // days and question designs the window spans.
  function windowTally(answers, bar) {
    const windowed = answers.slice(-bar.window);
    const row = Object.assign(tally(Progress.stats(windowed)), { window: bar.window, needed: bar.correct });
    row.days = new Set(windowed.map((attempt) => dayOf(attempt.timestamp))).size;
    row.templates = new Set(windowed.map(designOf)).size;
    row.met = row.attempted >= bar.window && row.correct >= bar.correct &&
      row.days >= bar.days && row.templates >= bar.templates;
    return row;
  }

  // One row per skill of `sections` (catalog sections, in order), domain by
  // domain in catalog order, including skills not started. `attempts` should
  // already be re-tiered (LiminalProgress.withCurrentTemplates). A row:
  //   { sectionKey, domain, skill, order, inCatalog, attempted, correct,
  //     hintedCorrect, unanswered, accuracy, easy, medium, hard, gate,
  //     hardBar, routine, state }
  // easy, medium and hard: { attempted, correct, accuracy } over every
  // answer at that tier; gate and hardBar: the same over the last
  // GATE.window Medium and HARD_BAR.window Hard first answers, plus
  // `window`, `needed` (correct answers the bar asks for) and `met`;
  // routine: { easy, medium, met }, the ROUTINE windows over the last Easy
  // and Medium first answers. Skills answered but no longer in the catalog
  // follow their section's catalog skills, with inCatalog false.
  // `options.tiered(sectionKey)` says whether a section's difficulty
  // labels can be trusted (default: all can); rows of other sections carry
  // tiered: false and never reach the gate.
  function skillMap(attempts, sections, options) {
    const tiered = (options && options.tiered) || (() => true);
    const list = (attempts || []).filter((attempt) => attempt && attempt.skill);
    const all = Progress.stats(list).bySkill;
    const atTier = (tier) => Progress.stats(list.filter((attempt) => attempt.difficulty === tier)).bySkill;
    const easy = atTier("Easy");
    const medium = atTier(GATE.tier);
    const hard = atTier(HARD_BAR.tier);
    // Each skill's first answers to each question, oldest first, by tier.
    const firstAnswers = Object.fromEntries(TIERS.map((tier) => [tier, new Map()]));
    const seen = new Set();
    list.filter(counted).sort(byTime).forEach((attempt) => {
      if (seen.has(attempt.questionId)) return;
      seen.add(attempt.questionId);
      const byTier = firstAnswers[attempt.difficulty];
      if (!byTier) return;
      const key = skillKey(sectionOf(attempt), attempt.skill);
      if (!byTier.has(key)) byTier.set(key, []);
      byTier.get(key).push(attempt);
    });

    const rows = [];
    const placed = new Set();
    function addRow(sectionKey, domain, skill, order, inCatalog) {
      const key = skillKey(sectionKey, skill);
      if (placed.has(key)) return;
      placed.add(key);
      const overall = all[key];
      const firsts = (tier) => firstAnswers[tier].get(key) || [];
      const gate = windowTally(firsts(GATE.tier), GATE);
      const hardBar = windowTally(firsts(HARD_BAR.tier), HARD_BAR);
      const routine = Object.fromEntries(ROUTINE.tiers.map((tier) => [tier.toLowerCase(), windowTally(firsts(tier), ROUTINE)]));
      routine.met = ROUTINE.tiers.some((tier) => routine[tier.toLowerCase()].met);
      const row = {
        sectionKey,
        domain,
        skill,
        order,
        inCatalog,
        attempted: overall ? overall.attempted : 0,
        correct: overall ? overall.correct : 0,
        hintedCorrect: overall ? overall.hintedCorrect : 0,
        unanswered: overall ? overall.unanswered : 0,
        accuracy: overall ? overall.accuracy : null,
        easy: tally(easy[key]),
        medium: tally(medium[key]),
        hard: tally(hard[key]),
        gate,
        hardBar,
        routine,
      };
      row.tiered = Boolean(tiered(sectionKey));
      row.state = skillState(row);
      rows.push(row);
    }

    (sections || []).forEach((section, sectionIndex) => {
      const domains = section.domains || [];
      domains.forEach((domain, domainIndex) => {
        Object.keys(domain.skills || {}).forEach((skill, skillIndex) => {
          addRow(section.key, domain.name, skill, [sectionIndex, domainIndex, skillIndex], true);
        });
      });
      Object.values(all)
        .filter((row) => row.sectionKey === section.key)
        .sort((left, right) => left.skill.localeCompare(right.skill))
        .forEach((row) => {
          const domainIndex = domains.findIndex((domain) => domain.name === row.domain);
          addRow(section.key, row.domain, row.skill,
            [sectionIndex, domainIndex < 0 ? domains.length : domainIndex, Number.MAX_SAFE_INTEGER], false);
        });
    });
    return rows;
  }

  function compareOrder(left, right) {
    for (let place = 0; place < left.order.length; place += 1) {
      if (left.order[place] !== right.order[place]) return left.order[place] - right.order[place];
    }
    return left.skill.localeCompare(right.skill);
  }

  // Rows that need work first: skills with enough answers below the gate,
  // lowest accuracy first (the one answered more wins a tie); then skills
  // still short of evidence, least practised first; then skills at the gate,
  // weakest Hard accuracy first; mastered skills last. Catalog order breaks
  // any remaining tie.
  const NEED_GROUP = { building: 0, "accuracy-only": 0, "not-started": 1, "not-enough-data": 1, "at-gate": 2, mastered: 3 };

  function byNeed(left, right) {
    const group = NEED_GROUP[left.state] - NEED_GROUP[right.state];
    if (group) return group;
    let difference = 0;
    if (NEED_GROUP[left.state] === 0) {
      difference = left.accuracy - right.accuracy || right.attempted - left.attempted;
    } else if (NEED_GROUP[left.state] === 1) {
      difference = left.attempted - right.attempted;
    } else if (left.state === "at-gate") {
      difference = (left.hardBar.accuracy === null ? -1 : left.hardBar.accuracy) -
        (right.hardBar.accuracy === null ? -1 : right.hardBar.accuracy);
    }
    return difference || compareOrder(left, right);
  }

  // "need" (see byNeed) or "domain" (catalog order).
  function sortSkills(rows, by) {
    return (rows || []).slice().sort(by === "domain" ? compareOrder : byNeed);
  }

  // Counts of rows per state: { [state]: n }.
  function stateCounts(rows) {
    const counts = Object.fromEntries(STATES.map((state) => [state, 0]));
    (rows || []).forEach((row) => {
      counts[row.state] += 1;
    });
    return counts;
  }

  /* ------------------------------------------------------------ next step */

  // The one next step every page names (Progress, Practice, a set's
  // report, the drill's default level). Practice guidance only: nothing
  // here estimates a score.

  function atOrPastGate(row) {
    return row.state === "at-gate" || row.state === "mastered";
  }

  // The level a skill is practised at next, and why: in a section whose
  // tiers are trusted, Easy until the skill is routine (ROUTINE), then
  // Medium toward the gate, then Hard; no level where tiers are not
  // trusted (the fixed ACT banks). Returns { level, why } with why one of
  // "accuracy-only", "not-routine", "routine", "at-gate", "mastered".
  function skillLevel(row) {
    if (!row || row.tiered === false) return { level: null, why: "accuracy-only" };
    if (row.state === "mastered") return { level: "Hard", why: "mastered" };
    if (row.state === "at-gate") return { level: "Hard", why: "at-gate" };
    if (row.routine && row.routine.met) return { level: "Medium", why: "routine" };
    return { level: "Easy", why: "not-routine" };
  }

  // A section's plan as stages with their catalog domains:
  // [{ stage, title, skills, domains }], or [] without a plan.
  function planStages(section) {
    const plan = section && PLANS[section.key];
    if (!plan) return [];
    const domainOf = new Map();
    (section.domains || []).forEach((domain) => {
      Object.keys(domain.skills || {}).forEach((skill) => domainOf.set(skill, domain.name));
    });
    return plan.stages.map((stage) => Object.assign({}, stage, {
      domains: [...new Set(stage.skills.map((skill) => domainOf.get(skill)).filter(Boolean))],
    }));
  }

  // What a section's latest finished "Start here" diagnostic shows (a
  // discarded one does not count): accuracy by domain through the accuracy
  // model, which domains it showed (PLACEMENT), and, for a section with a
  // plan, the stage the plan starts at: the first stage with a domain it did
  // not show, or stage 1 when it showed them all. `attempts` should carry
  // current tiers and taxonomy. Returns null before any diagnostic:
  //   { sectionKey, sessionId, finishedAt, attempted, correct, accuracy,
  //     domains: [{ domain, attempted, correct, accuracy, shown }],
  //     stage (null without a plan), skipped: [stage numbers], allShown }
  function diagnosticPlacement(attempts, sessions, section) {
    if (!section) return null;
    const diagnostic = (sessions || [])
      .filter((session) => session && session.kind === "diagnostic" && session.sectionKey === section.key)
      .sort((left, right) => (Number(left.finishedAt) || 0) - (Number(right.finishedAt) || 0))
      .pop();
    if (!diagnostic) return null;
    const summary = Progress.stats((attempts || []).filter((attempt) => attempt && attempt.sessionId === diagnostic.id));
    const domains = (section.domains || []).map((domain) => {
      const row = tally(summary.byDomain[skillKey(section.key, domain.name)]);
      row.shown = row.attempted >= PLACEMENT.minQuestions && row.correct >= PLACEMENT.accuracy * row.attempted;
      return Object.assign({ domain: domain.name }, row);
    });
    const shown = new Set(domains.filter((row) => row.shown).map((row) => row.domain));
    const stages = planStages(section);
    const first = stages.find((stage) => stage.domains.some((domain) => !shown.has(domain)));
    return {
      sectionKey: section.key,
      sessionId: diagnostic.id,
      finishedAt: Number(diagnostic.finishedAt) || null,
      attempted: summary.attempted,
      correct: summary.correct,
      accuracy: summary.accuracy,
      domains,
      stage: stages.length ? (first ? first.stage : 1) : null,
      skipped: first ? stages.filter((stage) => stage.stage < first.stage).map((stage) => stage.stage) : [],
      allShown: Boolean(stages.length && !first),
    };
  }

  // { [sectionKey]: diagnosticPlacement } for the catalog `sections`.
  function placements(attempts, sessions, sections) {
    const result = {};
    (sections || []).forEach((section) => {
      const placement = diagnosticPlacement(attempts, sessions, section);
      if (placement) result[section.key] = placement;
    });
    return result;
  }

  // The section of the latest answer among `sectionKeys`, or null: the
  // section a student is working in, which a page showing several names
  // the next step for.
  function recentSection(attempts, sectionKeys) {
    let latest = null;
    (attempts || []).forEach((attempt) => {
      if (!attempt) return;
      const key = sectionOf(attempt);
      if (sectionKeys && !sectionKeys.includes(key)) return;
      if (!latest || (Number(attempt.timestamp) || 0) >= (Number(latest.timestamp) || 0)) latest = attempt;
    });
    return latest ? sectionOf(latest) : null;
  }

  function skillStep(row, reason, extra) {
    const { level, why } = skillLevel(row);
    return Object.assign({
      kind: "skill",
      sectionKey: row.sectionKey,
      domain: row.domain,
      skill: row.skill,
      row,
      reason,
      level,
      levelWhy: why,
    }, extra || {});
  }

  // Accuracy per domain from skill rows, so the least practised skills can
  // be taken from the weakest domain first.
  function domainAccuracy(rows) {
    const totals = new Map();
    rows.forEach((row) => {
      const entry = totals.get(row.domain) || { attempted: 0, correct: 0 };
      entry.attempted += row.attempted;
      entry.correct += row.correct;
      totals.set(row.domain, entry);
    });
    return (domain) => {
      const entry = totals.get(domain);
      return entry && entry.attempted ? entry.correct / entry.attempted : Infinity;
    };
  }

  function leastPractised(rows) {
    const accuracy = domainAccuracy(rows);
    return rows.slice().sort((left, right) => left.attempted - right.attempted ||
      accuracy(left.domain) - accuracy(right.domain) || compareOrder(left, right))[0] || null;
  }

  function weakest(rows) {
    return rows.slice().sort((left, right) => left.accuracy - right.accuracy ||
      right.attempted - left.attempted || compareOrder(left, right))[0] || null;
  }

  // A section with a plan: the first skill in plan order not yet at the
  // gate, at its level. The diagnostic's placement starts the walk at its
  // stage: a skill in an earlier stage is passed over while it has fewer
  // than MIN_ATTEMPTS answers (the diagnostic asks at most two per skill),
  // and comes back once the later stages are at the gate. When every skill
  // is at the gate, Hard in plan order; when every one is mastered, a mix.
  function planStep(rows, plan, placement) {
    const stageOf = new Map();
    const position = new Map();
    plan.stages.forEach((stage) => stage.skills.forEach((skill) => {
      stageOf.set(skill, stage);
      position.set(skill, position.size);
    }));
    const ordered = rows.filter((row) => row.inCatalog !== false && position.has(row.skill))
      .sort((left, right) => position.get(left.skill) - position.get(right.skill));
    const start = placement && placement.stage > 1 ? placement.stage : 1;
    const placedPast = (row) => stageOf.get(row.skill).stage < start && row.attempted < MIN_ATTEMPTS;
    const extra = (row, more) => Object.assign({ stage: stageOf.get(row.skill), startStage: start }, more);
    let row = ordered.find((entry) => !atOrPastGate(entry) && !placedPast(entry));
    if (row) return skillStep(row, "plan", extra(row, { returned: false }));
    row = ordered.find((entry) => !atOrPastGate(entry));
    if (row) return skillStep(row, "plan", extra(row, { returned: true }));
    row = ordered.find((entry) => entry.state === "at-gate");
    if (row) return skillStep(row, "plan-hard", extra(row, { returned: false }));
    return ordered.length ? { kind: "mixed", reason: "all-mastered", sectionKey: ordered[0].sectionKey } : null;
  }

  // A section whose tiers are trusted but that has no plan (SAT Reading and
  // Writing): the weakest skill with enough answers below the gate; else
  // the least practised skill without enough answers; else, every skill at
  // the gate, the one with the weakest Hard answers; else a mix.
  function needStep(rows) {
    const weak = weakest(rows.filter((row) => row.state === "building"));
    if (weak) return skillStep(weak, "weakest");
    const least = leastPractised(rows.filter((row) => row.state === "not-started" || row.state === "not-enough-data"));
    if (least) return skillStep(least, "least-practised");
    const hard = rows.filter((row) => row.state === "at-gate").sort(byNeed)[0];
    if (hard) return skillStep(hard, "hard");
    return rows.length ? { kind: "mixed", reason: "all-mastered", sectionKey: rows[0].sectionKey } : null;
  }

  // A section whose tiers are not trusted (accuracy only, the fixed ACT
  // banks): the lowest-accuracy skill with enough answers, else the least
  // practised, with no level.
  function accuracyStep(rows) {
    const low = weakest(rows.filter((row) => row.attempted >= MIN_ATTEMPTS));
    if (low) return skillStep(low, "lowest-accuracy");
    const least = leastPractised(rows);
    return least ? skillStep(least, "least-practised") : null;
  }

  // The single next step for the skill map `rows` (skillMap). Options:
  //   sectionKeys    the sections in view (default: every row's)
  //   dueCount       Review questions due now; any makes Review the step
  //   placements     { [sectionKey]: diagnosticPlacement }
  //   recentSection  the section to name a step in when several are in view
  //                  (recentSection()); else the first with answers, else
  //                  the first with a plan, else the first
  // Returns null without rows, else one of
  //   { kind: "review", reason: "review-due", dueCount, then: <skill step> }
  //   { kind: "skill", sectionKey, domain, skill, row, reason, level,
  //     levelWhy, stage?, startStage?, returned? }
  //   { kind: "mixed", reason: "all-mastered", sectionKey }
  // where a skill step's reason is "plan", "plan-hard" (sections with a
  // plan), "weakest", "least-practised", "hard" (trusted tiers), or
  // "lowest-accuracy", "least-practised" (accuracy only), and its level
  // comes from skillLevel.
  function nextStep(rows, options) {
    const settings = options || {};
    const keys = settings.sectionKeys;
    const pool = (rows || []).filter((row) => row.inCatalog !== false && (!keys || keys.includes(row.sectionKey)));
    if (!pool.length) return null;
    const inView = [...new Set(pool.map((row) => row.sectionKey))];
    const answered = (key) => pool.some((row) => row.sectionKey === key && row.attempted);
    const sectionKey = inView.includes(settings.recentSection) ? settings.recentSection
      : inView.find(answered) || inView.find((key) => PLANS[key]) || inView[0];
    const own = pool.filter((row) => row.sectionKey === sectionKey);
    let step;
    if (own.some((row) => row.tiered === false)) step = accuracyStep(own);
    else if (PLANS[sectionKey]) step = planStep(own, PLANS[sectionKey], (settings.placements || {})[sectionKey]);
    else step = needStep(own);
    const due = Math.max(0, Math.trunc(Number(settings.dueCount) || 0));
    return due ? { kind: "review", reason: "review-due", dueCount: due, then: step } : step;
  }

  /* ------------------------------------------------------- first sight */

  // Accuracy on the first answer to each question design (template): the
  // first time the student met it, before any practice on it could turn
  // recognition into recall. A heavy user meets every Hard design several
  // times, so Hard accuracy can rise with familiarity whatever the skill;
  // this one cannot. `tier` narrows to one difficulty. Returns { attempted,
  // correct, accuracy }.
  function firstSight(attempts, tier) {
    const seen = new Set();
    const firsts = [];
    (attempts || []).filter((attempt) => attempt && attempt.source === "template" && counted(attempt))
      .slice()
      .sort(byTime)
      .forEach((attempt) => {
        const design = `${sectionOf(attempt)}|${designOf(attempt)}`;
        if (seen.has(design)) return;
        seen.add(design);
        if (!tier || attempt.difficulty === tier) firsts.push(attempt);
      });
    return tally(Progress.stats(firsts));
  }

  /* ----------------------------------------------------------- diagnostic */

  // The templates of the "Start here" diagnostic. Seats go to domains in
  // proportion to `weights` (the catalog's domain targets, as in every run;
  // Runs.apportion), and each domain's seats split evenly across `tiers`; a
  // domain's odd seat goes to the tiers in turn, so the tiers stay even
  // overall. A cell its tier cannot fill borrows from the domain's other
  // tiers. Within a domain the picks favour skills not yet in the
  // diagnostic, so the questions reach as many skills as they can; then
  // templates served least recently (`recency`, as practice.recencyFor
  // builds it); then a seeded order. Options: { weights, count, tiers,
  // recency, seed }. Returns { templates, cells: [{ domain, tier, wanted,
  // filled }], short } where `short` counts seats nothing could fill.
  function chooseDiagnostic(templates, options) {
    const settings = options || {};
    const tiers = settings.tiers || DIAGNOSTIC.tiers;
    const count = settings.count === undefined ? DIAGNOSTIC.count : settings.count;
    const seed = String(settings.seed === undefined ? "" : settings.seed);
    const recency = settings.recency || {};
    const pool = (templates || []).filter((template) => tiers.includes(template.difficulty));
    const domains = [...new Set(Object.keys(settings.weights || {}).concat(pool.map((template) => template.domain)))]
      .filter((domain) => pool.some((template) => template.domain === domain));
    const sizes = Object.fromEntries(domains.map((domain) =>
      [domain, pool.filter((template) => template.domain === domain).length]));
    const weights = settings.weights || Object.fromEntries(domains.map((domain) => [domain, 1]));
    const seats = Runs.apportion(Math.min(count, pool.length), weights, sizes, seed);

    const cells = [];
    let turn = 0;
    domains.forEach((domain) => {
      const total = seats[domain] || 0;
      const inTier = (tier) => pool.filter((template) => template.domain === domain && template.difficulty === tier);
      const wanted = tiers.map(() => Math.floor(total / tiers.length));
      for (let extra = total % tiers.length; extra > 0; extra -= 1) {
        wanted[turn % tiers.length] += 1;
        turn += 1;
      }
      // Borrow a short tier's seats from the domain's other tiers.
      const capacity = tiers.map((tier) => inTier(tier).length);
      tiers.forEach((tier, index) => {
        let short = wanted[index] - capacity[index];
        tiers.forEach((other, otherIndex) => {
          if (short <= 0 || otherIndex === index) return;
          const spare = capacity[otherIndex] - wanted[otherIndex];
          const moved = Math.max(0, Math.min(spare, short));
          wanted[otherIndex] += moved;
          wanted[index] -= moved;
          short -= moved;
        });
      });
      tiers.forEach((tier, index) => {
        if (wanted[index]) cells.push({ domain, tier, wanted: wanted[index], filled: 0 });
      });
    });

    const chosen = [];
    const taken = new Set();
    const skillUses = new Map();
    const freshness = (template) => (Object.prototype.hasOwnProperty.call(recency, template.id)
      ? Number(recency[template.id])
      : -Infinity);
    const rank = (template) => [skillUses.get(template.skill) || 0, freshness(template), hash(`${seed}|${template.id}`)];
    const before = (left, right) => {
      for (let place = 0; place < left.length; place += 1) {
        if (left[place] !== right[place]) return left[place] < right[place];
      }
      return false;
    };
    // One pick per cell per round, so a domain's tiers share its skills.
    domains.forEach((domain) => {
      const domainCells = cells.filter((cell) => cell.domain === domain);
      let picked = true;
      while (picked) {
        picked = false;
        domainCells.forEach((cell) => {
          if (cell.filled >= cell.wanted) return;
          let best = null;
          pool.forEach((template) => {
            if (template.domain !== domain || template.difficulty !== cell.tier || taken.has(template.id)) return;
            if (!best || before(rank(template), rank(best))) best = template;
          });
          if (!best) return;
          taken.add(best.id);
          chosen.push(best);
          skillUses.set(best.skill, (skillUses.get(best.skill) || 0) + 1);
          cell.filled += 1;
          picked = true;
        });
      }
    });
    return { templates: chosen, cells, short: count - chosen.length };
  }

  // Diagnostic questions in tier order (Medium, then Hard), each tier
  // keeping the run's own seeded order.
  function orderByTier(questions) {
    const rank = (question) => {
      const index = TIERS.indexOf(question.difficulty);
      return index < 0 ? TIERS.length : index;
    };
    return (questions || []).map((question, index) => ({ question, index }))
      .sort((left, right) => rank(left.question) - rank(right.question) || left.index - right.index)
      .map((entry) => entry.question);
  }

  /* --------------------------------------------------------------- pacing */

  function median(values) {
    const sorted = (values || []).filter((value) => Number.isFinite(value)).sort((left, right) => left - right);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function paceRow(extra) {
    return Object.assign({ times: [], expected: [], totalSeconds: 0 }, extra);
  }

  function finishPace(row, pace) {
    const result = Object.assign({}, row, {
      count: row.times.length,
      median: median(row.times),
      expectedCount: row.expected.length,
      expectedMedian: median(row.expected),
      pace: pace || null,
    });
    delete result.times;
    delete result.expected;
    result.overPace = result.pace && result.median !== null ? result.median - result.pace : null;
    return result;
  }

  // Time per question from timed answers; attempts without timeMs are
  // skipped, as are answers the accuracy model does not count (essays, the
  // retired banks). Seconds throughout. Options:
  //   paceSeconds      { [sectionKey]: seconds } at real-test pace (module
  //                    time over module length).
  //   expectedSeconds  attempt => seconds the question was written to take
  //                    (its estimatedSeconds), or null when unknown.
  // Returns { timed, untimed, sections, tiers, skills }: sections carry
  // `right` and `wrong` (a blank counts as wrong; a correct answer after a
  // hint is in neither) as { count, median, totalSeconds }; every row has
  // count, median, expectedCount, expectedMedian, pace, and overPace
  // (median minus pace). Skills are listed slowest first once they have
  // PACE_MIN timed answers.
  function pacing(attempts, options) {
    const settings = options || {};
    const pace = settings.paceSeconds || {};
    const expectedOf = typeof settings.expectedSeconds === "function" ? settings.expectedSeconds : () => null;
    const sections = new Map();
    const tiers = new Map();
    const skills = new Map();
    let timed = 0;
    let untimed = 0;
    (attempts || []).forEach((attempt) => {
      if (!attempt || !counted(attempt)) return;
      const ms = attempt.timeMs;
      if (ms === null || ms === undefined || !Number.isFinite(Number(ms)) || Number(ms) <= 0) {
        untimed += 1;
        return;
      }
      timed += 1;
      const seconds = Number(ms) / 1000;
      const expected = Number(expectedOf(attempt));
      const sectionKey = sectionOf(attempt);
      const groups = [];
      if (!sections.has(sectionKey)) {
        sections.set(sectionKey, paceRow({
          sectionKey,
          right: { times: [], totalSeconds: 0 },
          wrong: { times: [], totalSeconds: 0 },
        }));
      }
      const section = sections.get(sectionKey);
      groups.push(section);
      if (TIERS.includes(attempt.difficulty)) {
        const key = `${sectionKey}|${attempt.difficulty}`;
        if (!tiers.has(key)) tiers.set(key, paceRow({ sectionKey, difficulty: attempt.difficulty }));
        groups.push(tiers.get(key));
      }
      if (attempt.skill) {
        const key = skillKey(sectionKey, attempt.skill);
        if (!skills.has(key)) skills.set(key, paceRow({ sectionKey, domain: attempt.domain || null, skill: attempt.skill }));
        groups.push(skills.get(key));
      }
      groups.forEach((group) => {
        group.times.push(seconds);
        group.totalSeconds += seconds;
        if (Number.isFinite(expected) && expected > 0) group.expected.push(expected);
      });
      const outcome = attempt.correct && !attempt.hinted ? section.right : !attempt.correct ? section.wrong : null;
      if (outcome) {
        outcome.times.push(seconds);
        outcome.totalSeconds += seconds;
      }
    });
    const outcome = (entry) => ({ count: entry.times.length, median: median(entry.times), totalSeconds: entry.totalSeconds });
    return {
      timed,
      untimed,
      sections: [...sections.values()].map((row) => Object.assign(finishPace(row, pace[row.sectionKey]), {
        right: outcome(row.right),
        wrong: outcome(row.wrong),
      })),
      tiers: [...tiers.values()]
        .map((row) => finishPace(row, pace[row.sectionKey]))
        .sort((left, right) => left.sectionKey.localeCompare(right.sectionKey) ||
          TIERS.indexOf(left.difficulty) - TIERS.indexOf(right.difficulty)),
      skills: [...skills.values()]
        .map((row) => finishPace(row, pace[row.sectionKey]))
        .filter((row) => row.count >= PACE_MIN)
        .sort((left, right) => right.median - left.median || right.count - left.count ||
          left.skill.localeCompare(right.skill)),
    };
  }

  /* ---------------------------------------------------------------- trend */

  // One point per finished set, oldest first: `sessions` are
  // LiminalProgress sessions, `attempts` the re-tiered attempts. A set's
  // accuracy and Hard accuracy come from its own recorded attempts through
  // the accuracy model, so they agree with every other number on the page;
  // a set whose attempts are gone (trimmed, or kept before v3) falls back to
  // its stored summary, less its hinted answers. `filter` (session => bool)
  // narrows the sets.
  function sessionTrend(sessions, attempts, filter) {
    const bySession = new Map();
    (attempts || []).forEach((attempt) => {
      if (!attempt || !attempt.sessionId) return;
      if (!bySession.has(attempt.sessionId)) bySession.set(attempt.sessionId, []);
      bySession.get(attempt.sessionId).push(attempt);
    });
    // A finished section or full-length test is one point: its modules'
    // own records (which name it as their testId) are folded into it, and
    // it is scored from their answers, re-tiered like every other set. A
    // module whose test was never finished keeps its own point.
    const finishedTests = new Set((sessions || [])
      .filter((session) => session && Array.isArray(session.modules) && session.modules.length)
      .map((session) => session.id));
    const answersOf = (session) => (Array.isArray(session.modules) && session.modules.length
      ? session.modules.flatMap((entry) => bySession.get(entry && entry.sessionId) || [])
        .concat(bySession.get(session.id) || [])
      : bySession.get(session.id) || []);
    return (sessions || [])
      .filter((session) => session && (!filter || filter(session)))
      .filter((session) => !(session.testId && finishedTests.has(session.testId)))
      .slice()
      .sort((left, right) => (Number(left.finishedAt) || 0) - (Number(right.finishedAt) || 0))
      .map((session) => {
        const own = answersOf(session);
        const summary = own.length ? Progress.stats(own) : null;
        const point = {
          id: session.id,
          sectionKey: session.sectionKey || null,
          sections: session.sections || null,
          // A whole-section mix was stored as "full" before it had a kind of
          // its own; a real full-length test lists its modules.
          kind: session.kind === "full" && !(Array.isArray(session.modules) && session.modules.length)
            ? "mix"
            : session.kind || "practice",
          discardedKind: session.discardedKind || null,
          title: session.title || "",
          finishedAt: Number(session.finishedAt) || null,
          timeMs: Number.isFinite(Number(session.timeMs)) && session.timeMs !== null ? Number(session.timeMs) : null,
          total: Number(session.total) || own.length,
        };
        // A set made only of questions answered before (a Review set that
        // brings misses back as they were) has no first answers: its
        // accuracy is recall, which the trend leaves out.
        if (summary && !summary.attempted && summary.repeats) {
          return Object.assign(point, {
            counted: 0, accuracy: null, hard: { attempted: 0, accuracy: null }, repeats: summary.repeats, source: "attempts",
          });
        }
        if (summary && summary.attempted) {
          const hard = summary.byDifficulty.Hard;
          return Object.assign(point, {
            counted: summary.attempted,
            accuracy: summary.accuracy,
            hard: { attempted: hard.attempted, accuracy: hard.accuracy },
            repeats: summary.repeats,
            source: "attempts",
          });
        }
        const total = Number(session.total) || 0;
        const hard = session.hard || {};
        const right = Math.max(0, (Number(session.correct) || 0) - (Number(session.hintedCorrect) || 0));
        return Object.assign(point, {
          counted: total,
          accuracy: total ? right / total : null,
          hard: {
            attempted: Number(hard.total) || 0,
            accuracy: Number(hard.total) ? (Number(hard.correct) || 0) / Number(hard.total) : null,
          },
          source: "summary",
        });
      });
  }

  /* ----------------------------------------------------------------- plan */

  // "YYYY-MM-DD" as a local calendar date, or null when it is not a real
  // date.
  function parseDate(text) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text || ""));
    if (!match) return null;
    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }

  function formatDate(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function startOfDay(now) {
    const date = new Date(now === undefined ? Date.now() : now);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // Whole calendar days from today to the test date (0 on the day, negative
  // after it), or null without a valid date. Rounded, so a daylight-saving
  // change never shifts the count.
  function daysUntil(dateText, now) {
    const date = parseDate(dateText);
    if (!date) return null;
    return Math.round((date - startOfDay(now)) / DAY_MS);
  }

  // Monday 00:00, local time, of the week holding `now`, in ms.
  function weekStart(now) {
    const day = startOfDay(now);
    const sinceMonday = (day.getDay() + 6) % 7;
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() - sinceMonday).getTime();
  }

  // Questions answered (not left blank) since this week's Monday.
  function weekCount(attempts, now) {
    const start = weekStart(now);
    return (attempts || []).filter((attempt) =>
      attempt && attempt.answered === true && (Number(attempt.timestamp) || 0) >= start).length;
  }

  const WEEKLY_MAX = 5000;

  // A plan the student typed or a file carried: { testDate?, weeklyQuestions? }
  // with only valid values kept, and `errors` naming what was not.
  function cleanPlan(input) {
    const raw = input || {};
    const plan = {};
    const errors = [];
    if (raw.testDate !== undefined && raw.testDate !== null && raw.testDate !== "") {
      if (parseDate(raw.testDate)) plan.testDate = String(raw.testDate);
      else errors.push("testDate");
    }
    if (raw.weeklyQuestions !== undefined && raw.weeklyQuestions !== null && raw.weeklyQuestions !== "") {
      const value = Number(raw.weeklyQuestions);
      if (Number.isInteger(value) && value > 0 && value <= WEEKLY_MAX) plan.weeklyQuestions = value;
      else errors.push("weeklyQuestions");
    }
    return { plan, errors };
  }

  /* ------------------------------------------------------ official scores */

  // What a student can report from an official test: a Bluebook practice
  // test or a real SAT, with each section's score on the SAT's scale.
  const OFFICIAL_KINDS = ["practice", "sat"];
  const SECTION_SCORE = { min: 200, max: 800, step: 10 };
  const SCORE_LABEL_MAX = 60;
  // Each official score sits beside Liminal accuracy over the 28 days that
  // end on the test day: recent enough to describe the student who sat it.
  const COMPARISON_DAYS = 28;
  const OFFICIAL_SECTIONS = { readingWriting: "sat-reading-writing", math: "sat-math" };

  function sectionScore(value) {
    if (value === undefined || value === null || value === "") return { value: null, ok: true };
    const number = Number(value);
    const ok = Number.isInteger(number) && number >= SECTION_SCORE.min && number <= SECTION_SCORE.max &&
      number % SECTION_SCORE.step === 0;
    return { value: ok ? number : null, ok };
  }

  // A score the student typed or a file carried, with only valid values
  // kept: { score, errors }. `score` is null when anything required is
  // wrong. Required: a real date (not after `options.now` when given), a
  // kind, and at least one section score, each 200-800 in steps of 10.
  // `id` and `at` pass through when they are sound.
  function cleanOfficialScore(input, options) {
    const raw = input || {};
    const settings = options || {};
    const errors = [];
    const date = parseDate(raw.date);
    if (!date) errors.push("date");
    else if (settings.now !== undefined && date.getTime() > startOfDay(settings.now).getTime()) errors.push("date");
    if (!OFFICIAL_KINDS.includes(raw.kind)) errors.push("kind");
    const readingWriting = sectionScore(raw.readingWriting);
    const math = sectionScore(raw.math);
    if (!readingWriting.ok) errors.push("readingWriting");
    if (!math.ok) errors.push("math");
    if (readingWriting.ok && math.ok && readingWriting.value === null && math.value === null) errors.push("scores");
    if (errors.length) return { score: null, errors };
    const score = { date: String(raw.date), kind: raw.kind };
    const label = typeof raw.label === "string" ? raw.label.trim().replace(/\s+/g, " ").slice(0, SCORE_LABEL_MAX) : "";
    if (label) score.label = label;
    if (readingWriting.value !== null) score.readingWriting = readingWriting.value;
    if (math.value !== null) score.math = math.value;
    if (typeof raw.id === "string" && raw.id) score.id = raw.id;
    if (Number.isFinite(Number(raw.at)) && Number(raw.at) > 0) score.at = Number(raw.at);
    return { score, errors };
  }

  // Each official score beside the student's Liminal accuracy in each SAT
  // section over the COMPARISON_DAYS ending on the test day, oldest first:
  // [{ score, from, to, sections: { readingWriting, math } }], where each
  // section is { attempted, accuracy, hard: { attempted, accuracy } } from
  // LiminalProgress.stats. `attempts` should already carry current tiers
  // (LiminalProgress.withCurrentTemplates). Nothing is predicted: the rows
  // exist so the student, and later a calibration study, can see whether
  // practice accuracy tracks official results.
  function officialComparison(attempts, scores) {
    return (scores || []).filter((score) => score && parseDate(score.date))
      .slice()
      .sort((left, right) => String(left.date).localeCompare(String(right.date)))
      .map((score) => {
        const day = parseDate(score.date);
        const to = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();
        const from = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1 - COMPARISON_DAYS).getTime();
        const inWindow = (attempts || []).filter((attempt) => {
          const at = Number(attempt && attempt.timestamp) || 0;
          return at >= from && at < to;
        });
        const sections = {};
        Object.keys(OFFICIAL_SECTIONS).forEach((field) => {
          const summary = Progress.stats(inWindow.filter((attempt) => sectionOf(attempt) === OFFICIAL_SECTIONS[field]));
          const hard = summary.byDifficulty.Hard;
          sections[field] = {
            attempted: summary.attempted,
            accuracy: summary.accuracy,
            hard: { attempted: hard.attempted, accuracy: hard.accuracy },
          };
        });
        return { score, from, to, sections };
      });
  }

  return {
    TIERS,
    MIN_ATTEMPTS,
    GATE,
    HARD_BAR,
    STATES,
    STATE_LABELS,
    ROUTINE,
    DIAGNOSTIC,
    PLACEMENT,
    PLANS,
    PACE_MIN,
    WEEKLY_MAX,
    // template info
    registryTemplateInfo,
    mergeTemplateInfo,
    // skill map
    skillMap,
    skillState,
    sortSkills,
    stateCounts,
    firstSight,
    // next step
    skillLevel,
    planStages,
    diagnosticPlacement,
    placements,
    recentSection,
    nextStep,
    // diagnostic
    chooseDiagnostic,
    orderByTier,
    // pacing
    median,
    pacing,
    // trend
    sessionTrend,
    // plan
    parseDate,
    formatDate,
    daysUntil,
    weekStart,
    weekCount,
    cleanPlan,
    // official scores
    OFFICIAL_KINDS,
    SECTION_SCORE,
    SCORE_LABEL_MAX,
    COMPARISON_DAYS,
    OFFICIAL_SECTIONS,
    cleanOfficialScore,
    officialComparison,
  };
});
