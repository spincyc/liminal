// Building practice sets, and the small naming rules around them: set codes,
// Learn links, and the practice deep link. Pure logic with no DOM access;
// loads in Node and as a plain browser script (window.LiminalPractice, after
// PracticeCore, LiminalTemplateMask, LiminalRuns, LiminalModules, and
// LiminalProgress).
//
// SAT sections are built from templates (docs/question-templates.md): a run
// takes at most one question per template, chosen by lib/runs.js from the
// student's history, and is described by its template mask and seed.
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const deps = node
    ? {
      Core: require("./core"),
      Mask: require("./template-mask"),
      Runs: require("./runs"),
      Modules: require("./modules"),
      Progress: require("./progress"),
    }
    : {
      Core: root.PracticeCore,
      Mask: root.LiminalTemplateMask,
      Runs: root.LiminalRuns,
      Modules: root.LiminalModules,
      Progress: root.LiminalProgress,
    };
  const api = factory(deps);
  if (node) module.exports = api;
  else root.LiminalPractice = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (deps) {
  "use strict";

  const { Core, Mask, Runs, Modules, Progress } = deps;

  const TEMPLATE_SECTIONS = Progress.TEMPLATE_SECTIONS;
  // Sections with Learn pages (content/learn/<section>/...).
  const LEARN_SECTIONS = ["sat-math", "sat-reading-writing"];
  // A set code names its section, so a code typed into the wrong section
  // cannot silently build a different set: "math-<run code>", where the run
  // code is lib/runs.js's "<mask>-<seed>" or "<mask>-<seed>-<attempts>".
  const SET_CODE_PREFIXES = { "sat-math": "math", "sat-reading-writing": "rw" };

  function usesTemplates(sectionKey) {
    return TEMPLATE_SECTIONS.includes(sectionKey);
  }

  /* --------------------------------------------------------------- names */

  // The same rule as tools/lib/families.js, so a skill's Learn page and its
  // template files share one name.
  function slug(text) {
    return String(text || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // "sat-math/algebra/linear-inequalities", or null outside the Learn
  // sections.
  function learnPageId(sectionKey, domain, skill) {
    if (!LEARN_SECTIONS.includes(sectionKey) || !domain || !skill) return null;
    return `${sectionKey}/${slug(domain)}/${slug(skill)}`;
  }

  // learn.html#<page>/<subskill anchor> for a question, or its skill's page
  // alone when it names no subskill; null when there is no page.
  function learnHref(question) {
    if (!question) return null;
    const page = learnPageId(question.sectionKey, question.domain, question.skill);
    if (!page) return null;
    const anchor = slug(question.subskill);
    return `learn.html#${page}${anchor ? `/${anchor}` : ""}`;
  }

  // The practice form pre-filled for one skill: index.html#practice/<section>/<skill>.
  function practiceHash(sectionKey, skill) {
    return `#practice/${sectionKey}/${slug(skill)}`;
  }

  // "#practice/sat-math/linear-inequalities" -> { view: "practice",
  // params: ["sat-math", "linear-inequalities"] }.
  function parseRoute(hash) {
    const parts = String(hash || "").replace(/^#/, "").split("/")
      .map((part) => {
        try {
          return decodeURIComponent(part);
        } catch (error) {
          return part;
        }
      })
      .filter(Boolean);
    return { view: parts[0] || null, params: parts.slice(1) };
  }

  // The catalog domain and skill whose slug is `skillSlug`, or null.
  function findSkill(section, skillSlug) {
    for (const domain of (section && section.domains) || []) {
      for (const skill of Object.keys(domain.skills || {})) {
        if (slug(skill) === skillSlug) return { domain: domain.name, skill };
      }
    }
    return null;
  }

  // The catalog's domain targets as run weights, so a run's domain mix
  // follows the real test's rather than the template count's.
  function domainWeights(section) {
    const weights = {};
    ((section && section.domains) || []).forEach((domain) => {
      if (Number(domain.target) > 0) weights[domain.name] = Number(domain.target);
    });
    return Object.keys(weights).length ? weights : null;
  }

  // { [templateId]: version } from a registry (content/templates/<section>.json);
  // a missing version is 1.
  function templateVersions(registry) {
    const versions = {};
    ((registry && registry.templates) || []).forEach((entry) => {
      versions[entry.id] = Number(entry.version) > 0 ? Number(entry.version) : 1;
    });
    return versions;
  }

  // Live (not retired) templates in a registry.
  function templateCount(registry) {
    return ((registry && registry.templates) || []).filter((entry) => !entry.retired).length;
  }

  /* ----------------------------------------------------------- set codes */

  function formatSetCode(sectionKey, code) {
    const prefix = SET_CODE_PREFIXES[sectionKey];
    return prefix ? `${prefix}-${code}` : code;
  }

  // { sectionKey, code, mask, seed } from typed text. A code without its
  // section prefix (a bare run code) takes `fallbackSectionKey`. Throws a
  // SyntaxError with a readable message when the text is not a set code.
  function parseSetCode(text, fallbackSectionKey) {
    const clean = String(text || "").trim().toLowerCase().replace(/\s+/g, "");
    const parts = clean.split("-");
    const prefixed = Object.keys(SET_CODE_PREFIXES).find((key) => SET_CODE_PREFIXES[key] === parts[0]);
    let sectionKey = fallbackSectionKey || null;
    let code = clean;
    if (prefixed && parts.length >= 3) {
      sectionKey = prefixed;
      code = parts.slice(1).join("-");
    } else if (parts.length === 4) {
      throw new SyntaxError(`"${parts[0]}" does not name a section; set codes start with math- or rw-.`);
    }
    if (!sectionKey) throw new SyntaxError("Set codes start with math- or rw-, which names their section.");
    if (!usesTemplates(sectionKey)) throw new SyntaxError("Choose SAT Math or SAT Reading and Writing for this code.");
    let parsed;
    try {
      parsed = Runs.parseRunCode(code);
    } catch (error) {
      throw new SyntaxError("A set code looks like math-3f9k2-a8x1q.");
    }
    return { sectionKey, code, mask: parsed.mask, seed: parsed.seed };
  }

  /* ---------------------------------------------------------------- runs */

  function newRunSeed(random) {
    const draw = typeof random === "function" ? random : Math.random;
    return Math.floor(draw() * 36 ** 6).toString(36).padStart(2, "0");
  }

  function readMask(code) {
    try {
      return Mask.fromCode(code || "0");
    } catch (error) {
      return Mask.EMPTY;
    }
  }

  // runs.chooseTemplates's `recency`: each template's last serve number.
  // Templates only in the lifetime mask (history kept before serve numbers)
  // count as served longest ago.
  function recencyFor(history, templates) {
    const recency = {};
    const lastServed = (history && history.lastServed) || {};
    const seen = readMask(history && history.mask);
    (templates || []).forEach((template) => {
      if (Object.prototype.hasOwnProperty.call(lastServed, template.id)) {
        recency[template.id] = lastServed[template.id];
      } else if (Mask.has(seen, template.bit)) {
        recency[template.id] = 0;
      }
    });
    return recency;
  }

  // `drawn` is drawQuestions's array: its non-enumerable `skipped` and
  // `attempts` are read here, before anything copies the array. The code
  // keeps the chosen mask (skipped templates included, so it rebuilds the
  // same way); the served mask leaves skipped templates out of history.
  function describeRun(sectionKey, runMask, seed, drawn, templates) {
    const skipped = drawn && Array.isArray(drawn.skipped) ? drawn.skipped.slice() : [];
    const attempts = drawn && drawn.attempts ? Object.assign({}, drawn.attempts) : null;
    const questions = Array.from(drawn || []);
    const code = Runs.runCode(runMask, seed, attempts || undefined, attempts ? templates : undefined);
    const byId = new Map((templates || []).map((template) => [template.id, template]));
    const scenes = {};
    const servedBits = [];
    questions.forEach((question) => {
      if (question.scene) scenes[question.templateId] = question.scene;
      const template = byId.get(question.templateId);
      if (template) servedBits.push(template.bit);
    });
    return {
      sectionKey,
      seed,
      mask: runMask,
      code,
      setCode: formatSetCode(sectionKey, code),
      questions,
      templateIds: questions.map((question) => question.templateId),
      scenes,
      servedMaskCode: Mask.toCode(Mask.fromBits(servedBits)),
      // Templates lib/runs.js could not draw a good question from:
      // [{ templateId, reason }].
      skipped,
    };
  }

  // One fresh run. `options`: { sectionKey, templates (runs.catalogTemplates),
  // count, filters, seed?, history (Progress.historyFor), domainWeights?,
  // instantiate }. The caller records the run with Progress.serveTemplates.
  function buildTemplateRun(options) {
    const settings = options || {};
    const history = settings.history || { serve: 0, lastServed: {}, scenes: {}, mask: "0" };
    const seed = settings.seed || newRunSeed();
    const choice = {
      count: settings.count,
      seed,
      filters: settings.filters || {},
      // `seen` serves runs.js versions without `recency`.
      seen: readMask(history.mask),
      recency: recencyFor(history, settings.templates),
    };
    if (settings.domainWeights) choice.domainWeights = settings.domainWeights;
    const run = Runs.chooseTemplates(settings.templates || [], choice);
    const drawn = Runs.drawQuestions(run.templates, seed, settings.instantiate,
      `${settings.sectionKey}:`, { seenScenes: history.scenes || {} });
    return describeRun(settings.sectionKey, run.mask, seed, drawn, settings.templates);
  }

  // A run code's attempts keyed by template id. Normally lib/runs.js maps
  // them onto the live templates; when a template in the code has retired,
  // its digits are placed with the registry, which keeps every bit.
  function codeAttempts(code, templates, registry) {
    try {
      return Runs.parseRunCode(code, templates).attempts;
    } catch (error) {
      const digits = Runs.parseRunCode(code).attempts;
      if (!digits) return undefined;
      const mask = Runs.parseRunCode(code).mask;
      const entries = ((registry && registry.templates) || [])
        .filter((entry) => Mask.has(mask, entry.bit))
        .sort((left, right) => left.bit - right.bit);
      if (entries.length !== digits.length) return undefined;
      return Object.fromEntries(entries.map((entry, index) => [entry.id, digits[index]]));
    }
  }

  // The run a set code names, drawn again with its seed and each template's
  // recorded attempt. `options`: { code, sectionKey? (for a bare code) or
  // parsed (from parseSetCode), templates, registry?, instantiate }.
  // `missing` counts templates in the code that are no longer live.
  function rebuildRun(options) {
    const settings = options || {};
    const parsed = settings.parsed || parseSetCode(settings.code, settings.sectionKey);
    const live = settings.templates || [];
    const templates = Runs.templatesForMask(live, parsed.mask);
    const attempts = codeAttempts(parsed.code, live, settings.registry);
    const drawn = Runs.drawQuestions(templates, parsed.seed, settings.instantiate, `${parsed.sectionKey}:`,
      attempts ? { attempts } : undefined);
    const run = describeRun(parsed.sectionKey, parsed.mask, parsed.seed, drawn, live);
    run.code = parsed.code;
    run.setCode = formatSetCode(parsed.sectionKey, parsed.code);
    run.missing = Math.max(0, Mask.size(parsed.mask) - templates.length);
    return run;
  }

  // A template mini test: each section's share split across difficulty like
  // the bank mini tests, one question per template, shuffled within its
  // section so the tiers are not in order. `sections`: { [sectionKey]:
  // { templates, history, domainWeights } }. Returns the questions in
  // section order and the runs to record.
  function templateMiniTest(options) {
    const settings = options || {};
    const seed = settings.seed || newRunSeed();
    const questions = [];
    const runs = [];
    settings.blueprint.sections.forEach((entry, sectionIndex) => {
      const info = settings.sections[entry.sectionKey] || {};
      const counts = Core.allocateByWeight(entry.count, Core.MINI_TEST_DIFFICULTY_MIX.map((tier) => tier.weight));
      const sectionQuestions = [];
      Core.MINI_TEST_DIFFICULTY_MIX.forEach((tier, tierIndex) => {
        if (!counts[tierIndex]) return;
        const run = buildTemplateRun({
          sectionKey: entry.sectionKey,
          templates: info.templates,
          count: counts[tierIndex],
          filters: { difficulties: [tier.difficulty] },
          seed: `${seed}${sectionIndex}${tierIndex}`,
          history: info.history,
          domainWeights: info.domainWeights,
          instantiate: settings.instantiate,
        });
        sectionQuestions.push(...run.questions);
        runs.push(run);
      });
      questions.push(...Core.deterministicShuffle(sectionQuestions, `${seed}-${entry.sectionKey}`));
    });
    return { questions, runs };
  }

  // One module of an on-screen SAT test (lib/simulation.js): the module
  // blueprint's templates (lib/modules.js), templates served least recently
  // first, never one in `exclude` (the test's earlier modules). Scenes the
  // student has seen, and `avoidScenes` (the earlier modules' scenes), are
  // drawn around when a template has others. `options`: { sectionKey,
  // module ("1", "h", or "e"), templates, seed?, history, exclude?,
  // avoidScenes?, instantiate }. Returns a run like buildTemplateRun's, with
  // the questions in module order, plus `spec`, `chosenIds` (every template
  // chosen, drawn or not), and `shortfalls` (lib/modules.js chooseModule).
  function buildModuleRun(options) {
    const settings = options || {};
    const templates = settings.templates || [];
    const history = settings.history || { serve: 0, lastServed: {}, scenes: {}, mask: "0" };
    const seed = settings.seed || newRunSeed();
    const spec = Modules.moduleSpec(settings.sectionKey, settings.module || "1");
    const chosen = Modules.chooseModule(templates, spec, {
      seed,
      exclude: settings.exclude || [],
      recency: recencyFor(history, templates),
    });
    // runs.drawQuestions ranks a template's seen scenes oldest first, so the
    // other modules' scenes go last: avoided before anything else it has seen.
    const avoid = (settings.avoidScenes || []).filter(Boolean).map(String);
    const seenScenes = {};
    chosen.templates.forEach((template) => {
      const past = ((history.scenes || {})[template.id] || []).filter((scene) => !avoid.includes(scene));
      seenScenes[template.id] = past.concat(avoid);
    });
    const drawn = Runs.drawQuestions(chosen.templates, seed, settings.instantiate,
      `${settings.sectionKey}:`, { seenScenes });
    const run = describeRun(settings.sectionKey, chosen.mask, seed, drawn, templates);
    const byTemplate = new Map(run.questions.map((question) => [question.templateId, question]));
    run.questions = chosen.templates.map((template) => byTemplate.get(template.id)).filter(Boolean);
    run.templateIds = run.questions.map((question) => question.templateId);
    run.spec = spec;
    run.chosenIds = chosen.templates.map((template) => template.id);
    run.shortfalls = chosen.shortfalls;
    return run;
  }

  // What makes two drawn questions the same item for a student: stimulus,
  // stem, and the set of choices, whatever their order.
  function itemKey(question) {
    const stimulus = question && question.stimulus ? question.stimulus.content : null;
    const choices = Array.isArray(question && question.choices) ? question.choices.map(String).sort() : [];
    return JSON.stringify([stimulus || null, (question && question.stem) || "", choices]);
  }

  // Rounds a drill may run past its count before it stops, when later
  // rounds only repeat items it already holds.
  const DRILL_SPARE_ROUNDS = 3;

  // A drill: `count` questions on one skill, at one tier or every tier
  // (`difficulty` null). A skill may have only two or three templates at a
  // tier, so a drill takes rounds: each round draws one question from every
  // template with a fresh seed ("<seed>" plus the round in base 36), scenes
  // the student or this drill has shown going last, and keeps the questions
  // that are not an item already in the drill. Templates served least
  // recently lead each round. `options`: { sectionKey, templates, skill,
  // difficulty?, count, seed?, history, instantiate }. Returns { questions,
  // templates (how many templates match), served: one { templateIds, scenes,
  // mask } per round for Progress.serveTemplates }.
  function buildDrill(options) {
    const settings = options || {};
    const history = settings.history || { serve: 0, lastServed: {}, scenes: {}, mask: "0" };
    const pool = (settings.templates || []).filter((template) =>
      template.skill === settings.skill &&
      (!settings.difficulty || template.difficulty === settings.difficulty));
    const count = Math.max(0, Math.trunc(Number(settings.count) || 0));
    const result = { questions: [], templates: pool.length, served: [] };
    if (!pool.length || !count) return result;
    const seed = settings.seed || newRunSeed();
    const recency = recencyFor(history, pool);
    const freshness = (templateId) => (Object.prototype.hasOwnProperty.call(recency, templateId)
      ? recency[templateId]
      : -1);
    const seenScenes = {};
    Object.keys(history.scenes || {}).forEach((id) => {
      seenScenes[id] = history.scenes[id].slice();
    });
    const byId = new Map(pool.map((template) => [template.id, template]));
    const keys = new Set();
    let idle = 0;
    for (let round = 0; result.questions.length < count && idle < DRILL_SPARE_ROUNDS; round += 1) {
      const drawn = Runs.drawQuestions(pool, `${seed}${round.toString(36)}`, settings.instantiate,
        `${settings.sectionKey}:`, { seenScenes });
      const ordered = Array.from(drawn)
        .map((question, place) => ({ question, place }))
        .sort((left, right) => freshness(left.question.templateId) - freshness(right.question.templateId) ||
          left.place - right.place)
        .map((entry) => entry.question);
      const served = { templateIds: [], scenes: {} };
      ordered.forEach((question) => {
        if (result.questions.length >= count) return;
        const key = itemKey(question);
        if (keys.has(key)) return;
        keys.add(key);
        result.questions.push(question);
        served.templateIds.push(question.templateId);
        if (question.scene) {
          served.scenes[question.templateId] = question.scene;
          seenScenes[question.templateId] = (seenScenes[question.templateId] || [])
            .filter((scene) => scene !== question.scene)
            .concat(question.scene);
        }
      });
      if (served.templateIds.length) {
        served.mask = Mask.toCode(Mask.fromBits(served.templateIds.map((id) => byId.get(id).bit)));
        result.served.push(served);
        idle = 0;
      } else {
        idle += 1;
      }
    }
    return result;
  }

  // Keeps the first question of each template, so a review set too takes at
  // most one question per template.
  function onePerTemplate(questions) {
    const seen = new Set();
    return (questions || []).filter((question) => {
      const key = question.templateId || question.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // The template filters a mode builds with: the form's topic filters for
  // targeted practice, the weakest skill for Recommended next, none for a
  // full section mix.
  function runFilters(mode, formFilters, weakest) {
    if (mode === "targeted") return formFilters || {};
    if (mode === "adaptive") return weakest ? { skills: [weakest.skill] } : {};
    return {};
  }

  // Template ids of the items a finished set got wrong or left blank, in set
  // order, once each.
  function missedTemplateIds(items) {
    const ids = [];
    (items || []).forEach((item) => {
      const templateId = item.question && item.question.templateId;
      if (!templateId || (item.answered && item.correct)) return;
      if (!ids.includes(templateId)) ids.push(templateId);
    });
    return ids;
  }

  return {
    TEMPLATE_SECTIONS,
    LEARN_SECTIONS,
    SET_CODE_PREFIXES,
    usesTemplates,
    slug,
    learnPageId,
    learnHref,
    practiceHash,
    parseRoute,
    findSkill,
    domainWeights,
    templateVersions,
    templateCount,
    formatSetCode,
    parseSetCode,
    newRunSeed,
    recencyFor,
    buildTemplateRun,
    rebuildRun,
    templateMiniTest,
    buildModuleRun,
    buildDrill,
    itemKey,
    onePerTemplate,
    runFilters,
    missedTemplateIds,
  };
});
