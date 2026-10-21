// What to study next, told the same way on every page: the skill map and
// its practice states, the one next step (nextStep, which follows the SAT
// Math plan in Learn: two tracks of skills in flight, a budget per skill,
// and a rotation of drills, mixed sets, timed modules and a Desmos drill),
// the "Start here" diagnostic and where it places a student in the plan,
// pacing, the trend across finished sets, the weekly plan's counts,
// official question-bank checks, and the weekly report with its off-track
// signal. Pure logic with no DOM access; loads in Node and as a plain
// browser script (window.LiminalAnalytics, after window.LiminalRuns and
// window.LiminalProgress).
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
    node ? require("./core") : root.PracticeCore,
  );
  if (node) module.exports = api;
  else root.LiminalAnalytics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Progress, Runs, Core) {
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
  // section whose difficulty labels are not verified (the fixed ACT banks):
  // no gate, no Mastered.
  const STATES = ["not-started", "not-enough-data", "building", "at-gate", "mastered", "accuracy-only"];
  const STATE_LABELS = {
    "not-started": "Not started",
    "not-enough-data": "Not enough data",
    building: "Building",
    "at-gate": "Practice target met",
    mastered: "Advanced practice target met",
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
  // "Routine at Medium", in a section with a plan: at least 6 correct of the
  // skill's last 10 Medium first answers. From then on its drills mix in
  // Hard (HARD_MIX), so the official-Medium question types that Liminal
  // tiers Hard arrive before the practice target, not after it. A student
  // right 60% of the time at Medium meets 6 of 10 about half the time.
  const MEDIUM_ROUTINE = { tier: "Medium", window: 10, correct: 6, days: 1, templates: 1 };
  // Hard questions in each HARD_MIX.size of a drill once a skill is routine
  // at Medium and short of the target; at the target drills are Hard.
  const HARD_MIX = { size: 10, hard: 3 };
  // The "Start here" diagnostic: this many questions at these tiers.
  const DIAGNOSTIC = { count: 20, tiers: ["Medium", "Hard"] };
  // Twenty questions over a section's skills is at most two in any skill,
  // too few to judge one, so the diagnostic is read by domain: a domain is
  // shown when at least 80% of at least 3 of its questions were right.
  const PLACEMENT = { minQuestions: 3, accuracy: 0.8 };
  // The sequence of the SAT Math plan in Learn
  // (content/learn/sat/general/math-plan.md, "The sequence"): four stages,
  // each a list of catalog skill names in the page's order. Stage 4's
  // Stage 4 keeps its original topical grouping for placement and legacy
  // replay; the explicit Track B list below gives the new practice order.
  // test/analytics.test.js holds this list to the catalog (every SAT Math
  // skill exactly once) and to the page's links.
  // Each plan runs as two tracks, each with one skill in flight at a time
  // (planState): Track A is stages 1 and 2, Track B stages 3 and 4.
  // Algebra and Geometry start together; Track B interleaves geometry
  // with Advanced Math instead of postponing every geometry skill. Stages
  // remain topical groups for diagnostic placement, not calendar blocks.
  const PLANS = {
    "sat-math": {
      name: "SAT Math plan",
      learnPage: "sat/general/math-plan",
      tracks: [
        { key: "A", name: "Track A", stages: [1, 2] },
        { key: "B", name: "Track B", stages: [3, 4], skills: [
          "Lines, angles, and triangles", "Equivalent expressions", "Right triangles and trigonometry",
          "Nonlinear equations", "Circles", "Nonlinear functions", "Area and volume",
          "Systems of equations", "Probability", "Statistical inference",
        ] },
      ],
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
  // A skill's budget in flight: it leaves flight at the practice target, or
  // once it has had this many first answers in its own drills, at any
  // tier, since it entered flight, whichever comes first. Only its drills
  // spend it: the diagnostic, mixed sets, modules and the Desmos drill
  // teach nothing new about one skill, so they leave its budget alone.
  // Easy answers count, so a skill that never becomes routine at Easy
  // cannot hold its track for ever. A skill that spends its budget short of
  // the target has "moved on": it stays in mixed sets and Review, and comes
  // back with a fresh budget in the next pass. The gate (GATE) and HARD_BAR
  // stay as practice targets; they no longer hold a student on one skill.
  // Twenty answers is two drills. Simulated (2026-10-16, 45 minutes a day,
  // only drills spending): forty left the first pass unfinished after 12
  // weeks for moderate and slow learners (13 and 12 of 19 skills drilled),
  // and thirty or twenty-five, three drills, likewise (16); twenty ends it
  // in week 10 (moderate) or 11 (slow) with every skill drilled, the most
  // skills at the target (9 against 7), at the cost of a larger Review
  // backlog once every skill has flown and nothing stays parked. A turn
  // whose drills never left Easy gets `extra` more (one drill, at Medium
  // once Easy is routine) before it moves on: simulated, about one first
  // turn in eight ended at Easy without it; with it, none (moderate) or
  // 4 of 190 (slow), and the first pass ends in week 11 (10 to 11 without).
  const BUDGET = { answers: 20, extra: 10 };
  // The rotation after Review in a section with a plan (rotationStep):
  //   module  an on-screen Module 1 (lib/modules.js) once `started` skills
  //           have been started (a diagnostic alone is not enough: it places
  //           the student, and the first module waits for practice), when
  //           none was taken in the last `days` days, or after at least
  //           `sessions` other practice sets and `minDays` days since the
  //           last one;
  //   mixed   after a drill, once `started` skills have been started:
  //           `count` questions over every started skill, `weights` toward
  //           skills in flight or moved on, timed at real pace, answers at
  //           the end;
  //   desmos  when Desmos routes are loaded and no Desmos drill was taken
  //           in the last `days` days (`laterDays` once `first` have been
  //           finished), never as the very first set: `count` questions,
  //           `preferred` of them from the skills where a graph genuinely
  //           solves (lib/practice.js DESMOS_SKILLS).
  const ROTATION = {
    module: { started: 3, days: 7, sessions: 10, minDays: 3, module: "1" },
    mixed: { started: 2, count: 12, weights: { flight: 2, other: 1 } },
    desmos: { days: 7, first: 4, laterDays: 14, count: 10, preferred: 7 },
  };
  // Session kinds that are drills on one skill: they spend its budget, mark
  // it practised, decide the track drilled last, and are followed by a
  // mixed set. "Practice what I missed" (missed-drill) is Review-like and
  // counts as neither a drill nor a practice set in the rotation.
  const DRILL_KINDS = ["drill", "skill-drill"];
  const REVIEW_LIKE = ["review", "missed-drill"];
  // Official question-bank checks (Progress.officialChecks): the latest
  // check of a skill counts. At least `confirm` right after the practice
  // target is met confirms the skill on official questions; below `low`
  // returns it to flight in the next pass; in between changes nothing.
  // `gap`: an official check this far below the student's Liminal Medium
  // accuracy in the skill means practice here is not transferring.
  const OFFICIAL_CHECK = { confirm: 0.7, low: 0.6, gap: 0.2, suggested: 10 };
  // The weekly report's off-track signal (weeklyReport): fewer than
  // `practiceDays` practice days in the last `days`; no timed module in
  // `moduleDays` once `moduleStarted` skills are started; first-pass skills
  // left exceeding what the pace of skills leaving flight over the last
  // `paceDays` (or the history, if shorter) covers before the test (only
  // with `paceMinDays` of history); the last two official Math scores
  // within `flatScore` points, at least `scoreGapDays` apart with
  // `scorePracticeDays` practice days between them; and three signs of
  // practising without learning: a skill that used its budget below
  // routine at Medium; no skill reaching its target in `targetDays` despite
  // `targetPracticeDays` practice days, while some skill is still short of
  // it; Medium first-answer accuracy over the last `trendDays` not above the
  // `trendDays` before and under `trendCeiling`, with at least `trendMin`
  // answers in each.
  const SIGNALS = {
    days: 7, practiceDays: 4, moduleDays: 14, moduleStarted: 3, paceDays: 21, paceMinDays: 14,
    flatScore: 10, scoreGapDays: 14, scorePracticeDays: 4,
    targetDays: 21, targetPracticeDays: 8, trendDays: 14, trendMin: 30, trendCeiling: 0.8,
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
  //     hardBar, routine, mediumRoutine, state }
  // easy, medium and hard: { attempted, correct, accuracy } over every
  // answer at that tier; gate and hardBar: the same over the last
  // GATE.window Medium and HARD_BAR.window Hard first answers, plus
  // `window`, `needed` (correct answers the bar asks for) and `met`;
  // routine: { easy, medium, met }, the ROUTINE windows over the last Easy
  // and Medium first answers. Skills answered but no longer in the catalog
  // follow their section's catalog skills, with inCatalog false.
  // mediumRoutine: the MEDIUM_ROUTINE window over the last Medium first
  // answers. `options.tiered(sectionKey)` says whether a section's difficulty
  // labels can be trusted (default: all can); rows of other sections carry
  // tiered: false and never reach the gate.
  function skillMap(attempts, sections, options) {
    const tiered = (options && options.tiered) || (() => true);
    const list = Progress.markRepeats((attempts || []).filter(Boolean)).filter((attempt) => attempt.skill);
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
      const mediumRoutine = windowTally(firsts(MEDIUM_ROUTINE.tier), MEDIUM_ROUTINE);
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
        mediumRoutine,
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
  // trusted (the fixed ACT banks). In a section with a plan, a skill
  // routine at Medium too (MEDIUM_ROUTINE) stays at Medium with Hard mixed
  // in (drillMix). Returns { level, why } with why one of "accuracy-only",
  // "not-routine", "routine", "medium-routine", "at-gate", "mastered".
  function skillLevel(row) {
    if (!row || row.tiered === false) return { level: null, why: "accuracy-only" };
    if (row.state === "mastered") return { level: "Hard", why: "mastered" };
    if (row.state === "at-gate") return { level: "Hard", why: "at-gate" };
    if (!(row.routine && row.routine.met)) return { level: "Easy", why: "not-routine" };
    if (PLANS[row.sectionKey] && row.mediumRoutine && row.mediumRoutine.met) return { level: "Medium", why: "medium-routine" };
    return { level: "Medium", why: "routine" };
  }

  // Questions per tier in a drill of `count` at a level whose reason is
  // `why` (skillLevel): HARD_MIX's share of Hard once routine at Medium,
  // else null (the drill is all at its level).
  function drillMix(why, count) {
    if (why !== "medium-routine") return null;
    const size = Math.max(1, Math.trunc(Number(count) || HARD_MIX.size));
    const hard = Math.round((size * HARD_MIX.hard) / HARD_MIX.size);
    return { Medium: size - hard, Hard: hard };
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
    const summary = Progress.stats(Progress.markRepeats((attempts || []).filter(Boolean))
      .filter((attempt) => attempt.sessionId === diagnostic.id));
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

  /* ---------------------------------------------------------- plan engine */

  // A plan's tracks in practice order: [{ key, name, stages, skills }].
  // Explicit skills interleave topical stages; the old stage order is kept
  // only for replay before a saved orderFrom cutover. A plan without tracks
  // is one track.
  function planTracks(plan) {
    const tracks = plan.tracks || [{ key: "A", name: plan.name, stages: plan.stages.map((stage) => stage.stage) }];
    return tracks.map((track) => ({
      key: track.key,
      name: track.name,
      stages: track.stages.slice(),
      skills: track.skills ? track.skills.slice() : plan.stages.filter((stage) => track.stages.includes(stage.stage)).flatMap((stage) => stage.skills),
    }));
  }

  // The same rule as lib/practice.js slug and tools/lib/families.js, so a
  // step can name its skill's Learn page (test/plan-engine.test.js holds
  // the two together).
  function slug(text) {
    return String(text || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // "sat-math/algebra/linear-functions": a skill row's Learn page id.
  function learnPageOf(row) {
    return `${row.sectionKey}/${slug(row.domain)}/${slug(row.skill)}`;
  }

  function sessionInSection(session, sectionKey) {
    return session.sectionKey === sectionKey ||
      (Array.isArray(session.sections) && session.sections.includes(sectionKey));
  }

  const finishedAt = (session) => Number(session && session.finishedAt) || 0;

  function byCheck(left, right) {
    return String(left.date).localeCompare(String(right.date)) || (Number(left.at) || 0) - (Number(right.at) || 0);
  }

  // Right answers over questions of an official check, or null.
  function checkAccuracy(check) {
    return check && check.attempted ? check.correct / check.attempted : null;
  }

  // What a skill's latest official check says (OFFICIAL_CHECK):
  // "confirmed" when at least `confirm` of it was right and the skill is at
  // or past its practice target, "low" when below `low`, else null.
  function officialStatus(check, row) {
    const accuracy = checkAccuracy(check);
    if (accuracy === null) return null;
    if (accuracy < OFFICIAL_CHECK.low) return "low";
    if (accuracy >= OFFICIAL_CHECK.confirm && row && atOrPastGate(row)) return "confirmed";
    return null;
  }

  // Each skill's official checks, oldest first, and the latest:
  // Map "<sectionKey>|<skill>" -> { checks, latest }.
  function checksBySkill(checks) {
    const result = new Map();
    (checks || []).filter((check) => check && check.skill && check.sectionKey).slice().sort(byCheck).forEach((check) => {
      const key = skillKey(check.sectionKey, check.skill);
      if (!result.has(key)) result.set(key, { checks: [], latest: null });
      const entry = result.get(key);
      entry.checks.push(check);
      entry.latest = check;
    });
    return result;
  }

  // Where a check sits in the replay: the start of the day the student
  // took it. Checks of one day keep the order they were recorded in (`at`),
  // so the replay's latest check is checksBySkill's and Progress's: by
  // date, then `at`.
  function checkTime(check) {
    const date = parseDate(check.date);
    return date ? date.getTime() : 0;
  }

  // Whether a window of Medium first answers ({ right, day, design }) meets
  // the gate, as windowTally does for GATE.
  function gateMet(list) {
    const windowed = list.slice(-GATE.window);
    if (windowed.length < GATE.window) return false;
    const right = windowed.filter((entry) => entry.right).length;
    return right >= GATE.correct && new Set(windowed.map((entry) => entry.day)).size >= GATE.days &&
      new Set(windowed.map((entry) => entry.design)).size >= GATE.templates;
  }

  // The plan ledger (Progress planLedger): a checkpoint of planState's
  // replay, so the plan survives the record's cap on attempts (the newest
  // 5,000 kept, 2,000 when storage is full). The app writes it with every
  // save (planState's `checkpoint`); while the attempts still reach back to
  // the ledger's first answer (`from`) the plan is replayed in full and the
  // ledger is only refreshed, and once older answers have been trimmed the
  // replay resumes from the ledger and replays only answers after its
  // `at`. LEDGER_DEPARTURES bounds its list of departures.
  const LEDGER_VERSION = 1;
  const LEDGER_DEPARTURES = 200;
  const LEDGER_ENTRIES = ["plan", "moved-on", "passed-over", "slipped", "official-low"];
  const LEDGER_EXITS = ["gate", "budget", "check"];

  // A section's plan state, replayed from its answers in time order (each
  // question's first answer, as the accuracy model counts it).
  //
  // - Each track keeps one skill in flight: its first skill in plan order
  //   that is not at the gate, has not flown in this pass, and, in the
  //   first pass, is not passed over by the diagnostic (a skill in a stage
  //   before the placement's with fewer than MIN_ATTEMPTS answers).
  // - A skill in flight leaves at the gate, or once BUDGET.answers of its
  //   first answers, at any tier, have come from its own drills since it
  //   entered: then it has moved on. A skill back in flight for a low official
  //   check leaves by its budget or a newer check that is not low.
  // - When neither track has a skill to fly, the next pass starts: every
  //   skill not at the gate (moved on, passed over, or slipped below it)
  //   and every skill whose latest official check is low flies again, in
  //   plan order, each with a fresh budget.
  //
  // `rows`: the section's skillMap rows (current states). `options`:
  //   sectionKey      the section (default: the rows')
  //   attempts        the attempts, re-tiered like the rows; without them
  //                   the state is a snapshot of the rows, with nothing
  //                   spent and nothing moved on
  //   ledger          the section's plan ledger (Progress planLedger), used
  //                   once the attempts no longer reach back to its start
  //   sessions        Progress sessions, for the track drilled last
  //   placement       the section's diagnosticPlacement
  //   officialChecks  Progress officialChecks
  //   now             ms (default Date.now())
  // Returns null for a section without a plan, else
  //   { sectionKey, pass, startStage, firstAnswerAt, firstPassLeft,
  //     started: [skill], departures: [{ skill, track, pass, at, by }],
  //     tracks: [{ key, name, stages, skills, inFlight, lastDrilledAt }],
  //     skills: { [skill]: { skill, domain, stage, track, row, status,
  //       started, flown, practised, pass, entry, enteredAt, enteredWith,
  //       spent, budget, extraGiven, leftAt, leftBy, movedOn, reachedTarget,
  //       easyStuck, firstEnteredAt, firstDrillAt, firstReachedAt, check,
  //       official } },
  //     fromLedger, orderFrom, checkpoint }
  // with status "in-flight", "at-gate" (at or past the target now),
  // "moved-on", "passed-over" or "waiting"; entry, why a skill last
  // entered flight: "plan", "moved-on", "passed-over" (by the
  // diagnostic), "slipped" (back below a target it had met, in the plan or
  // on its own) or "official-low"; leftBy "gate", "budget" or "check".
  // `checkpoint` is the ledger entry to store (null without a history
  // array). Before the first answer it keeps only initial scheduling state;
  // that empty checkpoint never becomes practice evidence on replay.
  function planState(rows, options) {
    const settings = options || {};
    const sectionKey = settings.sectionKey || ((rows || [])[0] || {}).sectionKey;
    const plan = PLANS[sectionKey];
    if (!plan) return null;
    const rowOf = new Map((rows || []).filter((row) => row && row.sectionKey === sectionKey && row.inCatalog !== false)
      .map((row) => [row.skill, row]));
    const tracks = planTracks(plan).map((track) => Object.assign(track, {
      skills: track.skills.filter((skill) => rowOf.has(skill)),
    }));
    const stageOf = new Map();
    plan.stages.forEach((stage) => stage.skills.forEach((skill) => stageOf.set(skill, stage)));
    const ordered = plan.stages.flatMap((stage) => stage.skills).filter((skill) => rowOf.has(skill));
    const info = {};
    tracks.forEach((track) => track.skills.forEach((skill) => {
      info[skill] = {
        skill,
        domain: rowOf.get(skill).domain,
        stage: stageOf.get(skill).stage,
        track: track.key,
        row: rowOf.get(skill),
        status: "waiting",
        started: false,
        flown: false,
        pass: 0,
        entry: null,
        enteredAt: null,
        enteredWith: 0,
        spent: 0,
        budget: BUDGET.answers,
        leftAt: null,
        leftBy: null,
        movedOn: false,
        practised: false,
        reachedTarget: false,
        reachedAt: null,
        firstReachedAt: null,
        firstEnteredAt: null,
        firstDrillAt: null,
        drillAnswers: 0,
        aboveEasy: false,
        lowAtTarget: false,
        extraGiven: false,
        turnAboveEasy: false,
        check: null,
        official: null,
      };
    }));
    // Which answers came from a skill's own drills: only those spend its
    // budget and mark it practised. Without sessions every answer counts.
    const drillsKnown = Array.isArray(settings.sessions);
    const sessionById = new Map((settings.sessions || []).filter(Boolean).map((session) => [session.id, session]));
    // An answer names the set it was given in (setKind, setSkill), as the
    // app records it, so it is classed the moment it is saved, before the
    // set's session exists. Older answers are classed by their session.
    const ownDrill = (attempt) => {
      if (typeof attempt.setKind === "string" && attempt.setKind) {
        return DRILL_KINDS.includes(attempt.setKind) && (!attempt.setSkill || attempt.setSkill === attempt.skill);
      }
      if (!drillsKnown) return true;
      const session = sessionById.get(attempt.sessionId);
      if (!session) return false;
      const kind = session.kind === "discarded" ? session.discardedKind : session.kind;
      return DRILL_KINDS.includes(kind) && (!session.skill || session.skill === attempt.skill);
    };
    // An older answer whose set has no session yet cannot be classed: the
    // checkpoint stops before it, so it is replayed once its session exists.
    // Its session can only still arrive when the answer is not older than
    // the oldest kept session (sessions are kept newest first): an older
    // one lost its session to the cap, before Progress classed older
    // answers from their sessions (classAttempts), and one with no set at
    // all (migrated from v2) never had one. Those count as no drill's, as
    // the full replay counts them, and hold nothing back.
    // With no session kept, nothing is older than one.
    const keptFrom = (settings.sessions || []).reduce((oldest, session) => {
      const at = session ? Number(session.finishedAt) : NaN;
      return Number.isFinite(at) && (oldest === null || at < oldest) ? at : oldest;
    }, null);
    const unclassed = (attempt) => drillsKnown && !(typeof attempt.setKind === "string" && attempt.setKind) &&
      typeof attempt.sessionId === "string" && attempt.sessionId !== "" && !sessionById.has(attempt.sessionId) &&
      !(keptFrom !== null && Number(attempt.timestamp) < keptFrom);
    const startStage = settings.placement && settings.placement.stage > 1 ? settings.placement.stage : 1;
    const history = Array.isArray(settings.attempts);
    const now = settings.now === undefined ? Date.now() : Number(settings.now);

    const attempted = new Map();
    const medium = new Map();
    const checkNow = new Map();
    const checkAt = new Map();
    const inFlight = new Map(tracks.map((track) => [track.key, null]));
    let departures = [];
    let pass = 1;
    let flownThisPass = new Set();

    const answers = (skill) => (history ? attempted.get(skill) || 0 : info[skill].row.attempted);
    // The replay's state as a ledger checkpoint at `at` (planLedger).
    function snapshot(at) {
      return {
        version: LEDGER_VERSION,
        from: firstAnswerAt,
        at,
        orderFrom,
        pass,
        flownThisPass: [...flownThisPass],
        inFlight: Object.fromEntries(tracks.map((track) => [track.key, inFlight.get(track.key)])),
        skills: Object.fromEntries(Object.values(info).map((entry) => [entry.skill, Object.assign({
          attempted: attempted.get(entry.skill) || 0,
          medium: (medium.get(entry.skill) || []).slice(-GATE.window).map((item) => [item.right ? 1 : 0, item.day, item.design]),
        }, Object.fromEntries(LEDGER_SKILL_FIELDS.map((field) => [field, entry[field]])))])),
        departures: departures.slice(-LEDGER_DEPARTURES).map((item) => Object.assign({}, item)),
      };
    }
    const gateNow = (skill) => (history ? gateMet(medium.get(skill) || []) : atOrPastGate(info[skill].row));
    const lowNow = (skill) => {
      const accuracy = checkAccuracy(checkNow.get(skill));
      return accuracy !== null && accuracy < OFFICIAL_CHECK.low;
    };
    const passedOver = (skill) => info[skill].stage < startStage && answers(skill) < MIN_ATTEMPTS;
    const canFly = (skill) => !gateNow(skill) || lowNow(skill);
    // A low official check brings its skill back at the next opening in its
    // track, ahead of skills not yet started, once: unless it has flown since.
    const lowReturnDue = (skill) => lowNow(skill) && inFlight.get(info[skill].track) !== skill &&
      !(info[skill].enteredAt !== null && info[skill].enteredAt >= checkAt.get(skill));
    // Existing answers retain their original sequence. An old checkpoint
    // acquires a cutover once; keeping that marker even during a full replay
    // prevents a later save, trim or import from rewriting earlier flights.
    // Only future openings use the interleaving; a current turn keeps its
    // skill, spent budget, pass and review eligibility.
    let replayAt = now;
    const legacySkills = new Map(tracks.map((track) => [track.key,
      plan.stages.filter((stage) => track.stages.includes(stage.stage)).flatMap((stage) => stage.skills)
        .filter((skill) => rowOf.has(skill))]));
    const pick = (track) => {
      const skills = orderFrom !== null && replayAt <= orderFrom ? legacySkills.get(track.key) : track.skills;
      return skills.find(lowReturnDue) || skills.find(eligible);
    };

    function eligible(skill) {
      if (flownThisPass.has(skill)) return false;
      if (pass === 1) return !gateNow(skill) && !passedOver(skill);
      return canFly(skill);
    }

    function enter(track, skill, at) {
      const entry = info[skill];
      const low = lowNow(skill) && (lowReturnDue(skill) || gateNow(skill));
      entry.entry = low ? "official-low"
        : pass === 1 ? "plan"
          : entry.movedOn ? "moved-on"
            : entry.flown || entry.reachedTarget ? "slipped"
              : entry.stage < startStage ? "passed-over" : "plan";
      Object.assign(entry, { flown: true, pass, enteredAt: at, enteredWith: answers(skill), spent: 0, leftAt: null, leftBy: null,
        lowAtTarget: low && gateNow(skill), budget: BUDGET.answers, extraGiven: false, turnAboveEasy: false });
      if (entry.firstEnteredAt === null) entry.firstEnteredAt = at;
      flownThisPass.add(skill);
      inFlight.set(track.key, skill);
    }

    function depart(skill, at, by) {
      const entry = info[skill];
      entry.leftAt = at;
      entry.leftBy = by;
      if (by === "budget") entry.movedOn = true;
      if (by === "gate") entry.movedOn = false;
      departures.push({ skill, track: entry.track, pass: entry.pass, at, by });
      inFlight.set(entry.track, null);
    }

    // Fills every empty track; with both empty, starts the next pass when
    // any skill can fly again.
    function settle(at) {
      replayAt = at;
      tracks.forEach((track) => {
        if (inFlight.get(track.key)) return;
        const skill = pick(track);
        if (skill) enter(track, skill, at);
      });
      if (tracks.some((track) => inFlight.get(track.key)) || !ordered.some(canFly)) return;
      pass += 1;
      flownThisPass = new Set();
      tracks.forEach((track) => {
        const skill = pick(track);
        if (skill) enter(track, skill, at);
      });
    }

    const answerEvents = [];
    if (history) {
      const seen = new Set();
      Progress.markRepeats(settings.attempts.filter(Boolean))
        .filter((attempt) => attempt.skill && info[attempt.skill] && sectionOf(attempt) === sectionKey && counted(attempt))
        .sort(byTime)
        .forEach((attempt) => {
          if (seen.has(attempt.questionId)) return;
          seen.add(attempt.questionId);
          answerEvents.push({ at: Number(attempt.timestamp) || 0, attempt });
        });
    }
    const checkEvents = (settings.officialChecks || [])
      .filter((check) => check && check.sectionKey === sectionKey && info[check.skill])
      .slice().sort(byCheck)
      .map((check) => ({ at: checkTime(check), check }));
    const firstHeld = answerEvents.length ? answerEvents[0].at : null;
    // The ledger takes over once older answers are gone: the attempts no
    // longer reach back to the ledger's first answer.
    const ledger = history && settings.ledger && settings.ledger.version === LEDGER_VERSION &&
      Number.isFinite(settings.ledger.from) && Number.isFinite(settings.ledger.at) &&
      firstHeld !== null && firstHeld > settings.ledger.from &&
      Object.values(settings.ledger.skills || {}).some((entry) => entry.attempted > 0) ? settings.ledger : null;
    // The saved cutover is scheduling metadata, so it also governs a full
    // replay when all old answers are still held. With no marker, replay
    // everything already recorded in the old order before changing future
    // openings. An initial empty checkpoint fixes the new order before any
    // first answer is saved; it supplies metadata, never replayed evidence.
    const savedOrder = settings.ledger && settings.ledger.version === LEDGER_VERSION &&
      Number.isFinite(settings.ledger.orderFrom) ? settings.ledger.orderFrom : null;
    const orderFrom = savedOrder !== null ? savedOrder
      : settings.ledger && settings.ledger.version === LEDGER_VERSION && Number.isFinite(settings.ledger.at)
        ? settings.ledger.at
        : history && (answerEvents.length || checkEvents.length)
          ? answerEvents.concat(checkEvents).reduce((at, event) => Math.max(at, event.at), -Infinity) : now - 1;
    let firstAnswerAt = firstHeld;
    let lastAt = null;
    let events = answerEvents.concat(checkEvents);
    if (ledger) {
      firstAnswerAt = ledger.from;
      lastAt = ledger.at;
      pass = Math.max(1, Math.trunc(Number(ledger.pass)) || 1);
      flownThisPass = new Set((ledger.flownThisPass || []).filter((skill) => info[skill]));
      tracks.forEach((track) => {
        const skill = (ledger.inFlight || {})[track.key];
        inFlight.set(track.key, info[skill] && info[skill].track === track.key ? skill : null);
      });
      Object.keys(ledger.skills || {}).forEach((skill) => {
        const saved = ledger.skills[skill];
        if (!info[skill] || !saved) return;
        attempted.set(skill, Number(saved.attempted) || 0);
        medium.set(skill, (saved.medium || []).map(([right, day, design]) => ({ right: right === 1, day, design })));
        LEDGER_SKILL_FIELDS.forEach((field) => {
          if (saved[field] !== undefined) info[skill][field] = saved[field];
        });
      });
      departures = (ledger.departures || []).filter((entry) => info[entry.skill]).map((entry) => Object.assign({}, entry));
      // What the ledger had seen; checks known by its time set the latest.
      checkEvents.filter((event) => event.at <= ledger.at).forEach((event) => {
        checkNow.set(event.check.skill, event.check);
        checkAt.set(event.check.skill, event.at);
      });
      events = events.filter((event) => event.at > ledger.at);
    } else if (!history) {
      events = checkEvents;
    }
    events.sort((left, right) => left.at - right.at);

    settle(ledger ? ledger.at : events.length ? events[0].at : now);
    let pending = null;
    events.forEach((event) => {
      if (!pending && event.attempt && unclassed(event.attempt) && lastAt !== null) pending = snapshot(lastAt);
      lastAt = event.at;
      if (event.check) {
        const skill = event.check.skill;
        checkNow.set(skill, event.check);
        checkAt.set(skill, event.at);
        const entry = info[skill];
        if (inFlight.get(entry.track) === skill && entry.entry === "official-low" && !lowNow(skill)) {
          depart(skill, event.at, "check");
        }
        settle(event.at);
        return;
      }
      const { attempt } = event;
      const skill = attempt.skill;
      const entry = info[skill];
      attempted.set(skill, (attempted.get(skill) || 0) + 1);
      if (attempt.difficulty === GATE.tier) {
        if (!medium.has(skill)) medium.set(skill, []);
        const list = medium.get(skill);
        const before = gateMet(list);
        list.push({ right: attempt.correct === true && !attempt.hinted, day: dayOf(attempt.timestamp), design: designOf(attempt) });
        if (list.length > GATE.window) list.splice(0, list.length - GATE.window);
        if (gateMet(list)) {
          entry.reachedTarget = true;
          if (!before) entry.reachedAt = event.at;
          if (entry.firstReachedAt === null) entry.firstReachedAt = event.at;
        }
      }
      const drilled = ownDrill(attempt);
      if (drilled) {
        entry.drillAnswers += 1;
        if (entry.firstDrillAt === null) entry.firstDrillAt = event.at;
        if (attempt.difficulty === "Medium" || attempt.difficulty === "Hard") entry.aboveEasy = true;
      }
      if (inFlight.get(entry.track) === skill) {
        if (drilled) {
          entry.practised = true;
          entry.spent += 1;
          if (attempt.difficulty === "Medium" || attempt.difficulty === "Hard") entry.turnAboveEasy = true;
        }
        if (!entry.lowAtTarget && gateNow(skill)) depart(skill, event.at, "gate");
        else if (entry.spent >= entry.budget) {
          // A turn whose drills never left Easy gets one more drill
          // (BUDGET.extra), at Medium once Easy is routine; then it moves on.
          if (!entry.turnAboveEasy && !entry.extraGiven) {
            entry.extraGiven = true;
            entry.budget += BUDGET.extra;
          } else depart(skill, event.at, "budget");
        }
      }
      settle(event.at);
    });

    // The track drilled last: the newest answer in a drill set.
    const drills = new Set((settings.sessions || []).filter((session) => session &&
      (DRILL_KINDS.includes(session.kind) || (session.kind === "discarded" && DRILL_KINDS.includes(session.discardedKind))))
      .map((session) => session.id));
    const lastDrilled = new Map();
    if (history && drills.size) {
      settings.attempts.forEach((attempt) => {
        if (!attempt || !drills.has(attempt.sessionId) || !info[attempt.skill] || sectionOf(attempt) !== sectionKey) return;
        const key = info[attempt.skill].track;
        const at = Number(attempt.timestamp) || 0;
        if (!lastDrilled.has(key) || at > lastDrilled.get(key)) lastDrilled.set(key, at);
      });
    }

    Object.values(info).forEach((entry) => {
      const { row } = entry;
      // At the target now: from the replay's own windows, which the ledger
      // keeps when older answers are trimmed; without history, the row's.
      const atTarget = gateNow(entry.skill);
      if (!history && atTarget) entry.reachedTarget = true;
      entry.check = checkNow.get(entry.skill) || null;
      entry.official = officialStatus(entry.check, atTarget && !atOrPastGate(row) ? Object.assign({}, row, { state: "at-gate" }) : row);
      if (inFlight.get(entry.track) === entry.skill) entry.status = "in-flight";
      else if (atTarget) entry.status = "at-gate";
      else if (entry.movedOn) entry.status = "moved-on";
      else if (!entry.flown && pass === 1 && passedOver(entry.skill)) entry.status = "passed-over";
      else entry.status = "waiting";
      // Started: answered while in flight (or, without history, in flight
      // with answers), or at the target. A skill just taken into flight
      // is not started until its first answer.
      entry.started = atTarget || entry.practised || (!history && entry.flown && row.attempted > 0);
      // Moved on while Easy was still not routine: flagged, so the student
      // goes back to its lesson before its next pass.
      // Only when its drills never left Easy: a skill whose drills reached
      // Medium was past Easy, whatever its windows say now.
      entry.easyStuck = entry.status === "moved-on" && (drillsKnown ? !entry.aboveEasy : !(row.routine && row.routine.met));
      entry.drillsKnown = drillsKnown;
    });
    // No checkpoint while the very first answers cannot be classed yet.
    const blocked = !ledger && answerEvents.length && unclassed(answerEvents[0].attempt);
    const checkpoint = history && !blocked
      ? firstAnswerAt !== null ? pending || snapshot(lastAt === null ? firstAnswerAt : lastAt)
        : Object.assign(snapshot(now), { from: now }) : null;
    return {
      sectionKey,
      pass,
      startStage,
      firstAnswerAt,
      firstPassLeft: pass === 1
        ? Object.values(info).filter((entry) => entry.status === "in-flight" || entry.status === "waiting").length
        : 0,
      started: ordered.filter((skill) => info[skill].started),
      departures,
      tracks: tracks.map((track) => Object.assign(track, {
        inFlight: inFlight.get(track.key),
        lastDrilledAt: lastDrilled.has(track.key) ? lastDrilled.get(track.key) : null,
      })),
      skills: info,
      fromLedger: Boolean(ledger),
      orderFrom,
      checkpoint,
    };
  }

  // The per-skill replay fields a ledger keeps besides answers and window.
  const LEDGER_SKILL_FIELDS = ["flown", "practised", "pass", "entry", "enteredAt", "enteredWith", "spent", "leftAt", "leftBy",
    "movedOn", "reachedTarget", "reachedAt", "firstEnteredAt", "drillAnswers", "aboveEasy", "lowAtTarget",
    "firstReachedAt", "firstDrillAt", "budget", "extraGiven", "turnAboveEasy"];

  // Finished sets in a section that the rotation counts, oldest first:
  // everything but Review, discarded sets, and the extra record a section
  // or full-length test keeps beside its modules.
  function practiceHistory(sessions, sectionKey) {
    return (sessions || []).filter((session) => session && sessionInSection(session, sectionKey) &&
      !REVIEW_LIKE.includes(session.kind) && !["discarded", "section", "full"].includes(session.kind))
      .slice()
      .sort((left, right) => finishedAt(left) - finishedAt(right));
  }

  // Seats of a mixed set of `count` over `entries` ([{ skill, domain,
  // weight, hardShare }]) in proportion to weight, largest remainder first,
  // ties in a seeded order so the odd seats move between skills from one
  // set to the next. Returns [{ skill, domain, Medium, Hard }] for skills
  // with a seat, in entry order.
  function mixedSpec(entries, count, seed) {
    const list = (entries || []).filter((entry) => entry.weight > 0);
    const total = list.reduce((sum, entry) => sum + entry.weight, 0);
    if (!total || !(count > 0)) return [];
    const quotas = list.map((entry) => {
      const quota = (count * entry.weight) / total;
      return { entry, quota, seats: Math.floor(quota) };
    });
    const handed = quotas.reduce((sum, item) => sum + item.seats, 0);
    quotas.slice()
      .sort((left, right) => (right.quota - right.seats) - (left.quota - left.seats) ||
        hash(`${seed}|${left.entry.skill}`) - hash(`${seed}|${right.entry.skill}`))
      .slice(0, count - handed)
      .forEach((item) => { item.seats += 1; });
    return quotas.filter((item) => item.seats).map(({ entry, seats }) => {
      const hard = Math.round(seats * (entry.hardShare || 0));
      return { skill: entry.skill, domain: entry.domain, Medium: seats - hard, Hard: hard };
    });
  }

  // The share of Hard in a mixed set for a skill at this level: none before
  // it is routine at Medium, HARD_MIX's share from then, half at or past
  // the target.
  function mixedHardShare(row) {
    const { why } = skillLevel(row);
    if (why === "medium-routine") return HARD_MIX.hard / HARD_MIX.size;
    return why === "at-gate" || why === "mastered" ? 0.5 : 0;
  }

  // The mixed set of a plan's started skills, weighted toward skills in
  // flight or moved on (ROTATION.mixed.weights).
  function planMixedSpec(state, count, seed) {
    const { flight, other } = ROTATION.mixed.weights;
    return mixedSpec(state.started.map((skill) => {
      const entry = state.skills[skill];
      return {
        skill,
        domain: entry.domain,
        weight: entry.status === "in-flight" || entry.status === "moved-on" ? flight : other,
        hardShare: mixedHardShare(entry.row),
      };
    }), count, seed);
  }

  // The rotation step due after Review in a section with a plan, or null
  // (ROTATION): a timed module, else a mixed set after a drill, else, early
  // on, the Desmos drill.
  function rotationStep(state, settings) {
    const now = settings.now === undefined ? Date.now() : Number(settings.now);
    const history = practiceHistory(settings.sessions, state.sectionKey);
    const started = state.started.length;
    const base = { sectionKey: state.sectionKey, reason: "rotation" };
    const modules = history.filter((session) => session.kind === "module");
    const lastModule = modules[modules.length - 1] || null;
    const since = lastModule
      ? history.filter((session) => session.kind !== "module" && finishedAt(session) > finishedAt(lastModule)).length
      : 0;
    const { module, desmos } = ROTATION;
    const daysSinceModule = lastModule ? (now - finishedAt(lastModule)) / DAY_MS : Infinity;
    if (started >= module.started &&
        (daysSinceModule >= module.days || (since >= module.sessions && daysSinceModule >= module.minDays))) {
      return Object.assign(base, {
        kind: "module",
        module: module.module,
        why: !lastModule ? "first" : daysSinceModule >= module.days ? "days" : "sessions",
        lastModuleAt: lastModule ? finishedAt(lastModule) : null,
        sinceModule: since,
      });
    }
    const last = history[history.length - 1];
    if (last && DRILL_KINDS.includes(last.kind) && started >= ROTATION.mixed.started) {
      const { count } = ROTATION.mixed;
      return Object.assign(base, { kind: "mixed", count, spec: planMixedSpec(state, count, String(history.length)) });
    }
    if (settings.desmos && desmosDue(settings.sessions, state.sectionKey, now) && history.length >= 1) {
      return Object.assign(base, { kind: "desmos", count: desmos.count });
    }
    return null;
  }

  // Whether the Desmos drill is due (ROTATION.desmos): none taken, finished
  // or left, in the last `days` days, or `laterDays` once `first` have been
  // finished. A returning student with a long history gets it too.
  function desmosDue(sessions, sectionKey, now) {
    const { days, first, laterDays } = ROTATION.desmos;
    const all = (sessions || []).filter((session) => session && sessionInSection(session, sectionKey) &&
      (session.kind === "desmos" || (session.kind === "discarded" && session.discardedKind === "desmos")));
    const finished = all.filter((session) => session.kind === "desmos").length;
    const latest = all.reduce((at, session) => Math.max(at, finishedAt(session)), -Infinity);
    const gap = finished >= first ? laterDays : days;
    return now - latest >= gap * DAY_MS;
  }

  // A section with a plan (planState): the rotation's module, mixed set or
  // Desmos drill when one is due (rotationStep, only when `sessions` are
  // given), else a drill on a skill in flight, from the track drilled least
  // recently (Track A on a tie), at its level (skillLevel) with Hard mixed
  // in once routine at Medium (`mix`, drillMix), and its Learn page when it
  // entered flight with fewer than MIN_ATTEMPTS answers (`learnPage`).
  // With nothing in flight, every skill is at its target: Hard in plan
  // order on the first short of HARD_BAR, then a mixed set over them all.
  function planStep(rows, sectionKey, settings) {
    const state = (settings.plans && settings.plans[sectionKey]) || planState(rows, {
      sectionKey,
      attempts: settings.attempts,
      sessions: settings.sessions,
      placement: (settings.placements || {})[sectionKey],
      officialChecks: settings.officialChecks,
      now: settings.now,
    });
    const entries = Object.values(state.skills);
    if (!entries.length) return null;
    const rotated = Array.isArray(settings.sessions) ? rotationStep(state, settings) : null;
    if (rotated) return rotated;
    const order = (track) => state.tracks.indexOf(track);
    const flying = state.tracks.filter((track) => track.inFlight).sort((left, right) =>
      (left.lastDrilledAt === null ? -Infinity : left.lastDrilledAt) -
      (right.lastDrilledAt === null ? -Infinity : right.lastDrilledAt) || order(left) - order(right));
    const stageOf = (skill) => PLANS[sectionKey].stages.find((stage) => stage.skills.includes(skill));
    if (flying.length) {
      const track = flying[0];
      const entry = state.skills[track.inFlight];
      const step = skillStep(entry.row, "plan", {
        stage: stageOf(entry.skill),
        startStage: state.startStage,
        returned: entry.pass > 1,
        track: track.key,
        trackName: track.name,
        pass: entry.pass,
        entry: entry.entry,
        budget: { used: entry.spent, size: entry.budget },
        official: entry.official,
      });
      const mix = drillMix(step.levelWhy, HARD_MIX.size);
      if (mix) step.mix = mix;
      // Keep the lesson within reach on every turn, including returns. The
      // first-drill flag lets the UI distinguish first learning from a reread;
      // diagnostic and module answers do not count as a skill's own drill.
      step.lessonFirst = entry.drillsKnown ? entry.drillAnswers === 0 : entry.enteredWith < MIN_ATTEMPTS;
      step.learnPage = learnPageOf(entry.row);
      return step;
    }
    const ordered = state.started.concat(entries.map((entry) => entry.skill).filter((skill) => !state.started.includes(skill)))
      .map((skill) => state.skills[skill].row);
    const planOrder = PLANS[sectionKey].stages.flatMap((stage) => stage.skills);
    ordered.sort((left, right) => planOrder.indexOf(left.skill) - planOrder.indexOf(right.skill));
    const hard = ordered.find((row) => row.state === "at-gate");
    if (hard) return skillStep(hard, "plan-hard", { stage: stageOf(hard.skill), startStage: state.startStage, returned: false });
    const below = ordered.find((row) => !atOrPastGate(row));
    if (below) return skillStep(below, "plan", { stage: stageOf(below.skill), startStage: state.startStage, returned: false });
    const { count } = ROTATION.mixed;
    return {
      kind: "mixed",
      reason: "all-mastered",
      sectionKey,
      count,
      spec: mixedSpec(ordered.map((row) => ({ skill: row.skill, domain: row.domain, weight: 1, hardShare: 0.5 })), count,
        String(practiceHistory(settings.sessions, sectionKey).length)),
    };
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
    if (!rows.length) return null;
    const { count } = ROTATION.mixed;
    return {
      kind: "mixed",
      reason: "all-mastered",
      sectionKey: rows[0].sectionKey,
      count,
      spec: mixedSpec(rows.map((row) => ({ skill: row.skill, domain: row.domain, weight: 1, hardShare: 0.5 })), count, "all"),
    };
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

  // Whether today's Review step is done: a due set (the Review page's
  // "Start review", recorded with `step: "review"`) ended today, local
  // time, finished or discarded, in `scope`: a test ("SAT" or "ACT", whose
  // Review queue it is), a list of section keys, or every section when
  // omitted. Other Review-page sets (Missed, Marked, one question again)
  // are kind "review" too but are practice by choice and do not count.
  // Review is the next step at most once a calendar day.
  const REVIEW_STEP = "review";

  // How Review's load reads, calmly: a day takes up to `setLimit`; the rest
  // waits and the plan keeps moving. `due`: questions due now; `doneToday`:
  // today's Review step is done. { heading, line }.
  function reviewLoadText(due, setLimit, doneToday) {
    const count = Math.max(0, Math.trunc(Number(due) || 0));
    const limit = Math.max(1, Math.trunc(Number(setLimit) || 1));
    if (doneToday) {
      return {
        heading: "Today's Review is done",
        line: `Today's Review is done${count ? `; ${count} more waiting` : ""}. Your plan keeps moving; do more by choice, ` +
          `up to ${limit} at a time.`,
      };
    }
    if (!count) return { heading: "Nothing is due today", line: "" };
    const today = Math.min(count, limit);
    const waiting = count - today;
    return {
      heading: `Up to ${today} today`,
      line: `Up to ${today} today${waiting ? `; ${waiting} more waiting` : ""}. Your plan keeps moving.`,
    };
  }

  function reviewDoneToday(sessions, scope, now) {
    const inScope = (session) => (!scope ? true
      : typeof scope === "string" ? sessionTest(session) === scope
        : scope.some((key) => sessionInSection(session, key)));
    const day = startOfDay(now);
    const from = day.getTime();
    const to = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();
    return (sessions || []).some((session) => {
      if (!session) return false;
      const review = session.step === REVIEW_STEP &&
        (session.kind === "review" || (session.kind === "discarded" && session.discardedKind === "review"));
      const at = finishedAt(session);
      return review && at >= from && at < to && inScope(session);
    });
  }

  // The single next step for the skill map `rows` (skillMap). Options:
  //   sectionKeys    the sections in view (default: every row's)
  //   dueCount       Review questions due now
  //   reviewedToday  a Review set already ended today (reviewDoneToday):
  //                  Review is the step at most once a calendar day, so
  //                  with it true the step moves on and carries `reviewDue`
  //   placements     { [sectionKey]: diagnosticPlacement }
  //   preferredSection an explicit focus when that section is in view
  //   recentSection  the section to name a step in when several are in view
  //                  (recentSection()); else the first with answers, else
  //                  the first with a plan, else the first
  //   attempts       the attempts behind `rows`, for the plan's replay
  //                  (planState); without them the plan is a snapshot
  //   sessions       Progress sessions; given, a section with a plan also
  //                  rotates in timed modules, mixed sets and the Desmos
  //                  drill (rotationStep)
  //   officialChecks Progress officialChecks
  //   plans          { [sectionKey]: planState } already built (optional)
  //   desmos         Desmos routes are loaded (the Desmos drill can run)
  //   now            ms (default Date.now())
  // Returns null without rows, else one of
  //   { kind: "review", reason: "review-due", dueCount, then: <step> }
  //   { kind: "skill", sectionKey, domain, skill, row, reason, level,
  //     levelWhy, stage?, startStage?, returned?, track?, trackName?, pass?,
  //     entry?, budget?, official?, mix?, learnPage?, lessonFirst?, reviewDue? }
  //   { kind: "module", reason: "rotation", sectionKey, module, why, ... }
  //   { kind: "mixed", reason: "rotation" | "all-mastered", sectionKey,
  //     count, spec: [{ skill, domain, Medium, Hard }], reviewDue? }
  //   { kind: "desmos", reason: "rotation", sectionKey, count, reviewDue? }
  // where a skill step's reason is "plan", "plan-hard" (sections with a
  // plan), "weakest", "least-practised", "hard" (trusted tiers), or
  // "lowest-accuracy", "least-practised" (accuracy only), and its level
  // comes from skillLevel.
  function nextStep(rows, options) {
    const settings = options || {};
    const keys = settings.sectionKeys;
    const pool = (rows || []).filter((row) => row.inCatalog !== false && Core.sectionAvailable(row.sectionKey) &&
      (!keys || keys.includes(row.sectionKey)));
    if (!pool.length) return null;
    const inView = [...new Set(pool.map((row) => row.sectionKey))];
    const answered = (key) => pool.some((row) => row.sectionKey === key && row.attempted);
    const sectionKey = inView.includes(settings.preferredSection) ? settings.preferredSection
      : inView.includes(settings.recentSection) ? settings.recentSection
        : inView.find(answered) || inView.find((key) => PLANS[key]) || inView[0];
    const own = pool.filter((row) => row.sectionKey === sectionKey);
    let step;
    if (own.some((row) => row.tiered === false)) step = accuracyStep(own);
    else if (PLANS[sectionKey]) step = planStep(own, sectionKey, settings);
    else step = needStep(own);
    const due = Math.max(0, Math.trunc(Number(settings.dueCount) || 0));
    if (due && !settings.reviewedToday) return { kind: "review", reason: "review-due", dueCount: due, then: step };
    return due && step ? Object.assign({}, step, { reviewDue: due }) : step;
  }

  /* ------------------------------------------------------- first sight */

  // Accuracy on the first answer to each question design (template): the
  // earliest encounter present in the answer record. Earlier offline or
  // unrecorded practice cannot be inferred. Later recorded attempts at a
  // design do not enter this measure. `tier` narrows to one difficulty. Returns { attempted,
  // correct, accuracy }.
  function firstSight(attempts, tier) {
    const seen = new Set();
    const firsts = [];
    Progress.markRepeats((attempts || []).filter(Boolean))
      .filter((attempt) => attempt.source === "template" && counted(attempt))
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
    Progress.markRepeats((attempts || []).filter(Boolean)).forEach((attempt) => {
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
      if (Core.supportsDifficulty(sectionKey) && TIERS.includes(attempt.difficulty)) {
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
    Progress.markRepeats((attempts || []).filter(Boolean)).forEach((attempt) => {
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
        const total = session.scored === undefined ? Number(session.total) || 0 : Number(session.scored) || 0;
        const hard = session.hard || {};
        const right = Math.max(0, (Number(session.correct) || 0) - (Number(session.hintedCorrect) || 0));
        // Older summaries kept only the overall hint count. Once their
        // attempts are trimmed, the Hard share cannot be recovered safely.
        const hardKnown = !session.hintedCorrect || Number.isFinite(hard.hintedCorrect);
        const hardRight = Math.max(0, (Number(hard.correct) || 0) - (Number(hard.hintedCorrect) || 0));
        return Object.assign(point, {
          counted: total,
          accuracy: total ? right / total : null,
          hard: {
            attempted: hardKnown ? Number(hard.total) || 0 : 0,
            accuracy: hardKnown && Number(hard.total) ? hardRight / Number(hard.total) : null,
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

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // "Oct 23" for a moment or a "YYYY-MM-DD" date, in local time, for the
  // weekly report's plain text; `withYear` adds ", 2026".
  function monthDay(value, withYear) {
    const date = typeof value === "string" ? parseDate(value) : new Date(Number(value));
    if (!date || Number.isNaN(date.getTime())) return String(value);
    return `${MONTHS[date.getMonth()]} ${date.getDate()}${withYear ? `, ${date.getFullYear()}` : ""}`;
  }

  // "A", "A and B", "A, B and C".
  function listText(items) {
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
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

  // Questions answered (not left blank) since this week's Monday, each
  // once: an answer to a question answered before (a Review repeat, say:
  // `repeat`) is not a new question. A fresh version of a missed question
  // is new and counts.
  function weekCount(attempts, now) {
    const start = weekStart(now);
    return Progress.markRepeats((attempts || []).filter(Boolean)).filter((attempt) =>
      attempt.answered === true && attempt.repeat !== true && (Number(attempt.timestamp) || 0) >= start).length;
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
    const reconciled = Progress.markRepeats((attempts || []).filter(Boolean));
    return (scores || []).filter((score) => score && parseDate(score.date))
      .slice()
      .sort((left, right) => String(left.date).localeCompare(String(right.date)))
      .map((score) => {
        const day = parseDate(score.date);
        const to = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();
        const from = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1 - COMPARISON_DAYS).getTime();
        const inWindow = reconciled.filter((attempt) => {
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

  /* ----------------------------------------------------- official checks */

  // An official check the student typed: { check, errors }. `check` is null
  // when anything is wrong, and otherwise passes
  // LiminalProgress.cleanOfficialCheck once it has an id. Required: a SAT
  // template section and skill, Medium or Hard, the questions done (1 to
  // Progress.CHECK_MAX_QUESTIONS) and those right (0 to that), and a real
  // date not after `options.now` when given. `id` and `at` pass through.
  function cleanCheckInput(input, options) {
    const raw = input || {};
    const settings = options || {};
    const errors = [];
    const whole = (value) => (value === undefined || value === null || String(value).trim() === "" ? NaN : Number(value));
    const attempted = whole(raw.attempted);
    const correct = whole(raw.correct);
    const skill = typeof raw.skill === "string" ? raw.skill.trim() : "";
    if (!Progress.TEMPLATE_SECTIONS.includes(raw.sectionKey) || !skill) errors.push("skill");
    if (!Progress.CHECK_DIFFICULTIES.includes(raw.difficulty)) errors.push("difficulty");
    if (!Number.isInteger(attempted) || attempted < 1 || attempted > Progress.CHECK_MAX_QUESTIONS) errors.push("attempted");
    else if (!Number.isInteger(correct) || correct < 0 || correct > attempted) errors.push("correct");
    const date = parseDate(raw.date);
    if (!date || (settings.now !== undefined && date.getTime() > startOfDay(settings.now).getTime())) errors.push("date");
    if (errors.length) return { check: null, errors };
    const check = { sectionKey: raw.sectionKey, skill, difficulty: raw.difficulty, attempted, correct, date: String(raw.date) };
    if (typeof raw.id === "string" && raw.id) check.id = raw.id;
    if (Number(raw.at) > 0) check.at = Number(raw.at);
    return { check, errors };
  }

  // Skills to check on official questions, for Progress's prompts:
  // [{ row, reason }] with reason "target" (at or past the practice target
  // and never checked) or "moved-on" (left flight on its budget short of the
  // target, with no check since: "see where you stand"). `plans`:
  // { [sectionKey]: planState }. Only sections whose tiers are trusted
  // (SAT) have targets.
  function checkPromptList(rows, checks, plans) {
    const checked = checksBySkill(checks);
    const result = [];
    (rows || []).forEach((row) => {
      if (row.tiered === false || row.inCatalog === false || !Progress.TEMPLATE_SECTIONS.includes(row.sectionKey)) return;
      const own = checked.get(skillKey(row.sectionKey, row.skill));
      if (atOrPastGate(row)) {
        if (!own) result.push({ row, reason: "target" });
        return;
      }
      const entry = plans && plans[row.sectionKey] && plans[row.sectionKey].skills[row.skill];
      if (!entry || entry.status !== "moved-on" || entry.leftAt === null) return;
      if (!own || own.latest.date < formatDate(new Date(entry.leftAt))) result.push({ row, reason: "moved-on" });
    });
    return result;
  }

  // The rows of checkPromptList.
  function checkPrompts(rows, checks, plans) {
    return checkPromptList(rows, checks, plans).map((item) => item.row);
  }

  /* --------------------------------------------------- Review and the plan */

  // For LiminalReviewQueue.summarize's `flightAt`: when the student first
  // reached a miss's skill in its section's plan (the earliest of its first
  // turn in flight, its first drill, or its first time at the target), null
  // while none has happened (the miss is parked), undefined outside a plan.
  // `plans`: { [sectionKey]: planState }.
  function reviewFlightAt(plans) {
    return (entry) => {
      const plan = plans && plans[entry.sectionKey];
      const skill = plan && entry.skill ? plan.skills[entry.skill] : null;
      if (!skill) return undefined;
      const times = [skill.firstEnteredAt, skill.firstDrillAt, skill.firstReachedAt].filter((at) => at !== null && at !== undefined);
      return times.length ? Math.min(...times) : null;
    };
  }

  // For summarize's `prefer`: misses on skills the student has drilled come
  // first among those due; outside a plan every miss is preferred alike.
  function reviewPrefer(plans) {
    return (entry) => {
      const plan = plans && plans[entry.sectionKey];
      const skill = plan && entry.skill ? plan.skills[entry.skill] : null;
      return skill ? skill.drillAnswers > 0 : true;
    };
  }

  /* -------------------------------------------------------- weekly report */

  const MATH = "sat-math";

  function sessionTest(session) {
    return Progress.testOf(session.sectionKey || (Array.isArray(session.sections) ? session.sections[0] : null));
  }

  // The weekly report (Progress: printed, or copied as text for a parent):
  // the last SIGNALS.days days of one test's practice, and an On track /
  // Needs attention signal with every reason that fires. Nothing here
  // estimates or predicts a score. `input`:
  //   test            "SAT" or "ACT"
  //   attempts        the test's attempts, re-tiered
  //   sessions        Progress sessions (other tests' are left out)
  //   rows            the test's skillMap rows
  //   plan            SAT Math's planState (SAT only)
  //   officialChecks, officialScores
  //   testDate        the test's plan date, "YYYY-MM-DD"
  //   now             ms
  // Returns { test, from, to, days, practiceDays, minutes, newQuestions,
  //   reviewQuestions, testDate, daysLeft, modules, skills, checks, scores,
  //   pace, signal: { status, reasons: [{ key, text, href? }] },
  //   unavailable: [part] }. modules, skills, checks, scores and pace are
  // SAT-only (SAT Math's plan, College Board checks and scores): for ACT
  // they are null and named in `unavailable`, and their reasons never fire.
  //   modules  [{ at, sectionKey, correct, total, hardCorrect, hardTotal }]
  //   skills   { inFlight, movedOn: [{ skill, track, state, status,
  //            spent, budget, official }] }
  //   checks   the window's official checks, with accuracy
  //   scores   the last two official scores with a Math score
  //   pace     { departures, windowDays, historyDays, enough, remaining,
  //            covered, perWeek }
  function weeklyReport(input) {
    const settings = input || {};
    const test = settings.test === "ACT" ? "ACT" : "SAT";
    const sat = test === "SAT";
    const now = settings.now === undefined ? Date.now() : Number(settings.now);
    const today = startOfDay(now);
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (SIGNALS.days - 1)).getTime();
    const inWindow = (at) => at >= from && at <= now;
    const attempts = Progress.markRepeats((settings.attempts || []).filter((attempt) => attempt &&
      Progress.attemptTest(attempt) === test));
    const recent = attempts.filter((attempt) => inWindow(Number(attempt.timestamp) || 0));
    const sessions = (settings.sessions || []).filter((session) => session && sessionTest(session) === test);
    const recentSessions = sessions.filter((session) => inWindow(finishedAt(session)));
    const practiceDays = new Set(recent.filter((attempt) => attempt.answered === true)
      .map((attempt) => dayOf(attempt.timestamp))).size;
    const minutes = Math.round(recentSessions.filter((session) => session.kind !== "section" && session.kind !== "full")
      .reduce((sum, session) => sum + (Number(session.timeMs) > 0 ? Number(session.timeMs) : 0), 0) / 60000);
    const reviewQuestions = recent.filter((attempt) => attempt.reviewOf &&
      (attempt.correct === true || attempt.correct === false)).length;
    const newQuestions = Progress.stats(recent.filter((attempt) => !attempt.reviewOf)).attempted;
    const daysLeft = daysUntil(settings.testDate, now);
    const reasons = [];
    const unavailable = [];
    if (practiceDays < SIGNALS.practiceDays) {
      reasons.push({ key: "practice-days", text: `Practised on ${practiceDays} of the last ${SIGNALS.days} days; ` +
        `the plan asks for at least ${SIGNALS.practiceDays}.` });
    }
    const report = {
      test, from, to: now, days: SIGNALS.days, practiceDays, minutes, newQuestions, reviewQuestions,
      testDate: parseDate(settings.testDate) ? String(settings.testDate) : null,
      daysLeft, modules: null, skills: null, checks: null, scores: null, pace: null,
      signal: null, unavailable,
    };
    if (!sat) {
      unavailable.push("modules", "skills", "checks", "scores", "pace");
    } else {
      const mathModules = sessions.filter((session) => session.kind === "module" && sessionInSection(session, MATH));
      report.modules = recentSessions.filter((session) => session.kind === "module").map((session) => ({
        at: finishedAt(session),
        sectionKey: session.sectionKey || null,
        correct: Math.max(0, (Number(session.correct) || 0) - (Number(session.hintedCorrect) || 0)),
        total: Number(session.total) || 0,
        hardCorrect: Math.max(0, (Number((session.hard || {}).correct) || 0) - (Number((session.hard || {}).hintedCorrect) || 0)),
        hardTotal: Number((session.hard || {}).total) || 0,
      }));
      const plan = settings.plan || null;
      const describe = (entry) => ({
        skill: entry.skill, track: entry.track, state: entry.row.state, status: entry.status,
        spent: entry.spent, budget: entry.budget, official: entry.official, easyStuck: Boolean(entry.easyStuck),
      });
      const planned = plan ? Object.values(plan.skills) : [];
      report.skills = {
        inFlight: planned.filter((entry) => entry.status === "in-flight").map(describe),
        movedOn: planned.filter((entry) => entry.status === "moved-on").map(describe),
      };
      const fromDate = formatDate(new Date(from));
      report.checks = (settings.officialChecks || []).filter((check) => check && check.date >= fromDate &&
        check.date <= formatDate(today)).slice().sort(byCheck)
        .map((check) => Object.assign({}, check, { accuracy: checkAccuracy(check) }));
      report.scores = (settings.officialScores || []).filter((score) => score && parseDate(score.date) &&
        Number.isFinite(Number(score.math)))
        .slice().sort((left, right) => String(left.date).localeCompare(String(right.date)) || (Number(left.at) || 0) - (Number(right.at) || 0))
        .slice(-2);

      const started = plan ? plan.started.length : 0;
      const lastModule = mathModules.reduce((latest, session) => Math.max(latest, finishedAt(session)), 0);
      if (started >= SIGNALS.moduleStarted && now - lastModule > SIGNALS.moduleDays * DAY_MS) {
        reasons.push({ key: "no-module", text: `No timed Math module in the last ${SIGNALS.moduleDays} days. ` +
          "Take one from Practice: 22 questions in 35 minutes." });
      }

      const practiceDaysBetween = (fromMs, toMs) => new Set(attempts.filter((attempt) => attempt.answered === true &&
        Number(attempt.timestamp) >= fromMs && Number(attempt.timestamp) < toMs).map((attempt) => dayOf(attempt.timestamp))).size;
      const rows = (settings.rows || []).filter((row) => row.sectionKey === MATH && row.inCatalog !== false);
      report.mathTargets = { met: rows.filter(atOrPastGate).length, total: rows.length };

      if (plan) {
        // The pace: skills leaving flight over the last paceDays, or over the
        // whole history when that is shorter, said with the span it uses.
        const historyDays = plan.firstAnswerAt === null ? 0 : Math.max(0, Math.floor((now - plan.firstAnswerAt) / DAY_MS));
        const spanDays = Math.min(SIGNALS.paceDays, historyDays);
        // The window starts paceDays ago, or with the first answer when the
        // history is shorter (all of it then counts).
        const windowStart = historyDays < SIGNALS.paceDays ? plan.firstAnswerAt : now - SIGNALS.paceDays * DAY_MS;
        const departures = plan.departures.filter((entry) => entry.at >= windowStart && entry.at <= now).length;
        const perDay = spanDays > 0 ? departures / spanDays : 0;
        const enough = historyDays >= SIGNALS.paceMinDays;
        report.pace = {
          departures,
          windowDays: spanDays,
          historyDays,
          enough,
          remaining: plan.firstPassLeft,
          perWeek: Math.round(perDay * 7 * 10) / 10,
          covered: daysLeft !== null && daysLeft > 0 ? Math.floor(perDay * daysLeft) : null,
        };
        if (enough && daysLeft !== null && daysLeft > 0 && plan.firstPassLeft > report.pace.covered) {
          reasons.push({ key: "pace", text: `At the recent pace (${departures} skill${departures === 1 ? "" : "s"} finished ` +
            `${departures === 1 ? "its" : "their"} turn in the last ${spanDays} days), about ${report.pace.covered} of the ` +
            `${plan.firstPassLeft} skills still waiting for a first turn would get one in the ${daysLeft} days before the test.` });
        }

        // Practising without learning, from Liminal's own answers.
        const stalled = planned.filter((entry) => entry.status === "moved-on" && !atOrPastGate(entry.row) &&
          !(entry.row.mediumRoutine && entry.row.mediumRoutine.met)).map((entry) => entry.skill);
        if (stalled.length) {
          reasons.push({ key: "stalled-skills", skills: stalled, text: `${listText(stalled)} used ${stalled.length === 1 ? "its" : "their"} ` +
            "practice turn without becoming reliable at Medium. Reread the lesson and its prerequisite checks, then try about " +
            `${OFFICIAL_CHECK.suggested} official Medium questions to see where you stand.` });
        }
        const targetFrom = now - SIGNALS.targetDays * DAY_MS;
        const daysPractised = practiceDaysBetween(targetFrom, now + 1);
        const reached = planned.some((entry) => entry.reachedAt !== null && entry.reachedAt > targetFrom);
        const shortOfTarget = planned.some((entry) => !atOrPastGate(entry.row));
        if (!reached && shortOfTarget && daysPractised >= SIGNALS.targetPracticeDays) {
          reasons.push({ key: "no-target", text: `No skill reached its practice target in the last ${SIGNALS.targetDays} days, ` +
            `across ${daysPractised} practice days.` });
        }
      }
      // Medium first answers in Math: the last trendDays against the trendDays before.
      const mediumIn = (fromMs, toMs) => Progress.stats(attempts.filter((attempt) => sectionOf(attempt) === MATH &&
        attempt.difficulty === "Medium" && Number(attempt.timestamp) >= fromMs && Number(attempt.timestamp) < toMs));
      const recentMedium = mediumIn(now - SIGNALS.trendDays * DAY_MS, now + 1);
      const priorMedium = mediumIn(now - 2 * SIGNALS.trendDays * DAY_MS, now - SIGNALS.trendDays * DAY_MS);
      report.mediumTrend = { recent: tally(recentMedium), prior: tally(priorMedium) };
      if (recentMedium.attempted >= SIGNALS.trendMin && priorMedium.attempted >= SIGNALS.trendMin &&
          recentMedium.accuracy <= priorMedium.accuracy && recentMedium.accuracy < SIGNALS.trendCeiling) {
        reasons.push({ key: "medium-flat", text: `Medium accuracy is not rising: ${Math.round(recentMedium.accuracy * 100)}% in ` +
          `the last ${SIGNALS.trendDays} days against ${Math.round(priorMedium.accuracy * 100)}% in the ${SIGNALS.trendDays} before.` });
      }

      // Two official Math scores close together only mean something when
      // they are at least scoreGapDays apart with practice between them.
      const [earlier, later] = report.scores.length === 2 ? report.scores : [];
      if (later) {
        const earlierDay = parseDate(earlier.date);
        const laterDay = parseDate(later.date);
        const apart = Math.round((laterDay - earlierDay) / DAY_MS);
        const between = practiceDaysBetween(new Date(earlierDay.getFullYear(), earlierDay.getMonth(), earlierDay.getDate() + 1).getTime(),
          laterDay.getTime());
        if (Math.abs(Number(later.math) - Number(earlier.math)) <= SIGNALS.flatScore && apart >= SIGNALS.scoreGapDays &&
            between >= SIGNALS.scorePracticeDays) {
          reasons.push({
            key: "flat-scores",
            text: `Your last two official Math scores (${earlier.math}, then ${later.math}) differ by ${SIGNALS.flatScore} ` +
              "points or less. See “If your score isn’t moving” in the SAT Math plan.",
            href: "learn.html#sat/general/math-plan/adjust",
          });
        }
      }

      checksBySkill(settings.officialChecks).forEach(({ checks }) => {
        const latest = checks.filter((check) => check.difficulty === "Medium").pop();
        if (!latest) return;
        const row = (settings.rows || []).find((entry) => entry.sectionKey === latest.sectionKey && entry.skill === latest.skill);
        if (!row || row.medium.attempted < MIN_ATTEMPTS || row.medium.accuracy === null) return;
        const official = checkAccuracy(latest);
        if (row.medium.accuracy - official >= OFFICIAL_CHECK.gap - 1e-9) {
          reasons.push({
            key: "transfer",
            skill: latest.skill,
            text: `Practice here isn’t transferring in ${latest.skill}: ${Math.round(official * 100)}% on official Medium ` +
              `questions against ${Math.round(row.medium.accuracy * 100)}% on Liminal Medium.`,
          });
        }
      });
    }
    report.signal = { status: reasons.length ? "needs-attention" : "on-track", reasons };
    return report;
  }

  const SIGNAL_LABELS = { "on-track": "On track", "needs-attention": "Needs attention" };
  // A skill's state in words a parent can read, for the copied summary.
  const PLAIN_STATES = {
    "not-started": "not started yet",
    "not-enough-data": "just started",
    building: "working toward its target",
    "at-gate": "target met",
    mastered: "advanced target met",
    "accuracy-only": "practising",
  };

  // The weekly report as plain text for a parent ("Copy summary"), in plain
  // English: no plan jargon, real dates. `options`: { sectionName(sectionKey) }
  // for module lines (default: the key).
  function weeklyReportText(report, options) {
    const settings = options || {};
    const name = settings.sectionName || ((key) => key);
    const pct = (value) => `${Math.round(value * 100)}%`;
    const lines = [
      `Liminal weekly report: ${report.test}, ${monthDay(report.from)} to ${monthDay(report.to, true)}`,
      `Status: ${SIGNAL_LABELS[report.signal.status]}`,
      ...report.signal.reasons.map((reason) => `- ${reason.text}`),
      "",
      `Practice days: ${report.practiceDays} of the last ${report.days}`,
      `Time in practice sets: ${report.minutes} minutes`,
      `Questions: ${report.newQuestions} new, ${report.reviewQuestions} going over earlier mistakes`,
    ];
    if (report.mathTargets) lines.push(`Math skills at their practice target: ${report.mathTargets.met} of ${report.mathTargets.total}`);
    if (report.modules) {
      lines.push(report.modules.length
        ? `Timed test sections: ${report.modules.map((entry) => `${name(entry.sectionKey)} ${entry.correct} of ${entry.total} right` +
          ` (hardest questions ${entry.hardCorrect} of ${entry.hardTotal}), ${monthDay(entry.at)}`).join("; ")}`
        : "Timed test sections: none this week");
    }
    if (report.skills) {
      const skill = (entry) => `${entry.skill} (${PLAIN_STATES[entry.state] || "practising"}` +
        `${entry.status === "in-flight" ? `, ${entry.spent} of ${entry.budget} practice questions used` : ""}` +
        `${entry.easyStuck ? ", was still practising at the easier level when its turn ended" : ""}` +
        `${entry.official === "low" ? ", official practice questions went poorly" : entry.official === "confirmed" ? ", confirmed on official practice questions" : ""})`;
      lines.push(`Math skills practising now: ${report.skills.inFlight.map(skill).join("; ") || "none"}`);
      lines.push(`Paused until the next round: ${report.skills.movedOn.map(skill).join("; ") || "none"}`);
    }
    if (report.checks) {
      lines.push(`Official practice questions: ${report.checks.map((check) => `${check.skill} ${check.correct} of ${check.attempted} ` +
        `${check.difficulty} right (${pct(check.accuracy)}), ${monthDay(check.date)}`).join("; ") || "none this week"}`);
    }
    if (report.scores) {
      lines.push(`Official Math scores: ${report.scores.slice().reverse().map((score) => `${score.math} on ${monthDay(score.date)}` +
        `${score.kind === "sat" ? " (real SAT)" : score.kind === "practice" ? " (practice test)" : ""}`).join("; ") || "none recorded"}`);
    }
    if (report.pace && !report.pace.enough) lines.push("Pace: not enough history yet");
    else if (report.pace) {
      lines.push(`Pace: ${report.pace.departures} skill${report.pace.departures === 1 ? "" : "s"} finished ` +
        `${report.pace.departures === 1 ? "its" : "their"} turn in the last ${report.pace.windowDays} days`);
    }
    lines.push(report.testDate
      ? `Test date: ${monthDay(report.testDate, true)}${report.daysLeft !== null && report.daysLeft >= 0 ? ` (${report.daysLeft} days left)` : " (passed)"}`
      : "Test date: not set");
    if (report.unavailable.length) lines.push(`Not available for ${report.test}: timed test sections, the Math plan, official checks and scores.`);
    lines.push("Liminal reports practice accuracy only. It does not estimate or predict a score.");
    return lines.join("\n");
  }

  return {
    TIERS,
    MIN_ATTEMPTS,
    GATE,
    HARD_BAR,
    STATES,
    STATE_LABELS,
    ROUTINE,
    MEDIUM_ROUTINE,
    HARD_MIX,
    DIAGNOSTIC,
    PLACEMENT,
    PLANS,
    BUDGET,
    ROTATION,
    LEDGER_VERSION,
    LEDGER_DEPARTURES,
    LEDGER_ENTRIES,
    LEDGER_EXITS,
    DRILL_KINDS,
    OFFICIAL_CHECK,
    SIGNALS,
    SIGNAL_LABELS,
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
    drillMix,
    planStages,
    planTracks,
    planState,
    learnPageOf,
    practiceHistory,
    mixedSpec,
    reviewDoneToday,
    REVIEW_STEP,
    reviewLoadText,
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
    // official checks
    cleanCheckInput,
    checkAccuracy,
    checksBySkill,
    officialStatus,
    checkPrompts,
    checkPromptList,
    reviewFlightAt,
    reviewPrefer,
    // weekly report
    weeklyReport,
    weeklyReportText,
    monthDay,
    PLAIN_STATES,
  };
});
