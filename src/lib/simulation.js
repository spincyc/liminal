// On-screen SAT tests: one module, one section (Module 1, then a Module 2
// routed by Module 1), or the full-length test (Reading and Writing, a
// 10-minute break, then Math). This file is the test's state machine only:
// which step comes next, how Module 2 is routed, the break clock, what a
// saved test needs to resume at the right module, and the combined report.
// Building a module's questions is lib/practice.js buildModuleRun (from the
// blueprint in lib/modules.js); the screens are app/test-shell.js.
//
// The state is plain JSON, never mutated (every change returns a new copy),
// and time is always passed in, so a test can be saved after any step and
// restored after a reload. Module routing and the module mixes are practice
// approximations; the report shows accuracy only, never a scaled score.
// Pure logic with no DOM access; loads in Node and as a plain browser script
// (window.LiminalSimulation, after window.LiminalModules).
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(node ? require("./modules") : root.LiminalModules);
  if (node) module.exports = api;
  else root.LiminalSimulation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Modules) {
  "use strict";

  const SCHEMA = "liminal-simulation";
  const VERSION = 1;
  // Session kinds (Progress sessions[].kind) of the three tests.
  const KINDS = ["module", "section", "full"];
  const MODULE_KEYS = ["1", "h", "e"];
  // A Module 2 whose route is decided when Module 1 ends.
  const ROUTED = "routed";
  const ROUTE_NAMES = { h: "harder", e: "easier" };

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function sectionLabel(sectionKey) {
    return Modules.SECTIONS[sectionKey].label;
  }

  function percent(correct, total) {
    return total ? Math.round((correct / total) * 100) : 0;
  }

  /* ---------------------------------------------------------------- plan */

  // The steps of a test, in order: { type: "module", sectionKey, module }
  // (module "1", "h", "e", or "routed") and { type: "break", minutes }.
  function planSteps(kind, sectionKey, moduleKey) {
    const moduleStep = (key, module) => ({ type: "module", sectionKey: key, module });
    if (kind === "module") return [moduleStep(sectionKey, moduleKey || "1")];
    if (kind === "section") return [moduleStep(sectionKey, "1"), moduleStep(sectionKey, ROUTED)];
    const steps = [];
    Modules.SECTION_ORDER.forEach((key, index) => {
      if (index) steps.push({ type: "break", minutes: Modules.BREAK_MINUTES });
      steps.push(moduleStep(key, "1"), moduleStep(key, ROUTED));
    });
    return steps;
  }

  // `options`: { kind, sectionKey (module and section tests), module (a
  // module test's "1", "h", or "e"; default "1"), id, seed, now }.
  function create(options) {
    const settings = options || {};
    const kind = settings.kind;
    if (!KINDS.includes(kind)) throw new RangeError(`Unknown test kind "${kind}" (use module, section, or full)`);
    const sectionKey = kind === "full" ? null : settings.sectionKey;
    if (kind !== "full" && !Modules.SECTIONS[sectionKey]) {
      throw new RangeError(`No SAT modules for section "${sectionKey}"`);
    }
    const moduleKey = kind === "module" ? String(settings.module || "1") : null;
    if (moduleKey && !MODULE_KEYS.includes(moduleKey)) {
      throw new RangeError(`Unknown module "${moduleKey}" (use 1, h, or e)`);
    }
    return {
      schema: SCHEMA,
      version: VERSION,
      id: String(settings.id || `t${Number(settings.now) || 0}`),
      kind,
      sectionKey,
      seed: Modules.normalizeSeed(settings.seed || "0"),
      startedAt: Number(settings.now) || 0,
      steps: planSteps(kind, sectionKey, moduleKey),
      index: 0,
      // Finished modules, in order (see finishModule).
      modules: [],
      // The module on screen, once its questions are built (see beginModule).
      current: null,
      // { [sectionKey]: { route, correct, total, cutoff } }, set as each
      // section's Module 1 ends.
      routes: {},
      // The break, once it starts: { step, startedAt, endsAt, endedAt?, skipped? }.
      rest: null,
      finishedAt: null,
    };
  }

  /* ---------------------------------------------------------------- reads */

  function moduleSteps(state) {
    return state.steps
      .map((step, index) => Object.assign({ index }, step))
      .filter((step) => step.type === "module");
  }

  function resolvedModule(state, step) {
    if (step.module !== ROUTED) return step.module;
    const route = state.routes[step.sectionKey];
    return route ? route.route : null;
  }

  // What the screen calls a module. The full-length test numbers sections
  // the way the real one does ("Section 2, Module 1: Math"); Module 2's route
  // is not shown until the report, as on the real test, except in a module
  // test, where the student chose it.
  function titleFor(state, index) {
    const step = state.steps[index];
    const label = sectionLabel(step.sectionKey);
    const inSection = moduleSteps(state).filter((entry) => entry.sectionKey === step.sectionKey);
    const number = inSection.findIndex((entry) => entry.index === index) + 1;
    if (state.kind === "full") {
      const section = Modules.SECTION_ORDER.indexOf(step.sectionKey) + 1;
      return `Section ${section}, Module ${number}: ${label}`;
    }
    if (state.kind === "module" && step.module !== "1") {
      return `${label}: Module 2, ${ROUTE_NAMES[step.module]}`;
    }
    return `${label}: Module ${step.module === "1" ? 1 : 2}`;
  }

  // The whole test's name.
  function runTitle(state) {
    if (state.kind === "full") return "Full-length SAT";
    const label = sectionLabel(state.sectionKey);
    if (state.kind === "section") return `SAT ${label} section`;
    return `SAT ${titleFor(state, 0)}`;
  }

  // Where the student goes after the step at `index`.
  function nextTitle(state, index) {
    const next = state.steps[index + 1];
    if (!next) return "your results";
    if (next.type === "break") return "the break";
    return titleFor(state, index + 1);
  }

  // The step to show now:
  //   { type: "module", index, sectionKey, module, title, next, number,
  //     count, minutes, size, started, sessionId }
  //   { type: "break", index, minutes, startedAt, endsAt, next }
  //   { type: "done" }
  // `module` is "1", "h", or "e"; `started` is true once beginModule has
  // recorded the module's questions.
  function currentStep(state) {
    if (state.index >= state.steps.length) return { type: "done" };
    const index = state.index;
    const step = state.steps[index];
    if (step.type === "break") {
      return {
        type: "break",
        index,
        minutes: step.minutes,
        startedAt: state.rest && state.rest.step === index ? state.rest.startedAt : null,
        endsAt: state.rest && state.rest.step === index ? state.rest.endsAt : null,
        next: nextTitle(state, index),
      };
    }
    const module = resolvedModule(state, step);
    if (!module) throw new Error(`Module 2 of ${step.sectionKey} has no route yet`);
    const spec = Modules.moduleSpec(step.sectionKey, module);
    const all = moduleSteps(state);
    const started = Boolean(state.current && state.current.step === index);
    return {
      type: "module",
      index,
      sectionKey: step.sectionKey,
      module,
      title: titleFor(state, index),
      next: nextTitle(state, index),
      number: all.findIndex((entry) => entry.index === index) + 1,
      count: all.length,
      minutes: spec.minutes,
      size: spec.size,
      started,
      sessionId: started ? state.current.sessionId : null,
    };
  }

  function sectionModules(state, sectionKey) {
    const list = state.modules.filter((entry) => entry.sectionKey === sectionKey);
    if (state.current && state.current.sectionKey === sectionKey) list.push(state.current);
    return list;
  }

  // Templates already in this test's modules of a section, which the next
  // module of that section must not repeat.
  function usedTemplateIds(state, sectionKey) {
    return [...new Set(sectionModules(state, sectionKey).flatMap((entry) => entry.templateIds || []))];
  }

  // Scenes already shown in a section, which the next module draws around.
  function usedScenes(state, sectionKey) {
    return [...new Set(sectionModules(state, sectionKey).flatMap((entry) => entry.scenes || []))];
  }

  // Each module's own seed, so its draw is independent of the others'.
  function moduleSeed(state, index) {
    return `${state.seed}${Number(index === undefined ? state.index : index).toString(36)}`;
  }

  /* -------------------------------------------------------------- changes */

  // The current module's questions are built and on screen. `info`:
  // { sessionId, templateIds (every template chosen), questionIds, scenes,
  // runCode?, timeLimitSeconds, now }.
  function beginModule(state, info) {
    const step = currentStep(state);
    if (step.type !== "module") throw new Error("The test is not at a module.");
    const settings = info || {};
    const next = copy(state);
    next.current = {
      step: step.index,
      sectionKey: step.sectionKey,
      module: step.module,
      title: step.title,
      sessionId: String(settings.sessionId || `${state.id}-${step.index}`),
      templateIds: (settings.templateIds || []).map(String),
      questionIds: (settings.questionIds || []).map(String),
      scenes: (settings.scenes || []).filter(Boolean).map(String),
      runCode: settings.runCode || null,
      timeLimitSeconds: Number(settings.timeLimitSeconds) || step.minutes * 60,
      startedAt: Number(settings.now) || 0,
    };
    return next;
  }

  // One finished question as the test keeps it: enough to route, report,
  // and rebuild the question from its id (the question itself is not kept).
  function compactItems(items) {
    return (items || []).map((item) => {
      const question = item.question || {};
      return {
        questionId: String(question.id || ""),
        sectionKey: question.sectionKey || null,
        domain: question.domain || null,
        skill: question.skill || null,
        difficulty: question.difficulty || null,
        response: item.response === undefined ? null : item.response,
        answered: Boolean(item.answered),
        correct: Boolean(item.answered && item.correct === true),
        marked: Boolean(item.marked),
        hinted: Boolean(item.hinted),
        timeMs: Math.max(0, Math.round(Number(item.timeMs) || 0)),
      };
    });
  }

  // The module on screen ended. `outcome`: { sessionId, items
  // (compactItems), elapsedMs, finishReason ("user" or "time"), now }.
  // Module 1 of a routed section decides its Module 2 here. A sessionId that
  // is not the current module's changes nothing, so a result delivered twice
  // counts once.
  function finishModule(state, outcome) {
    const settings = outcome || {};
    if (!state.current || state.current.sessionId !== settings.sessionId) return state;
    const next = copy(state);
    const items = copy(settings.items || []);
    const correct = items.filter((item) => item.correct).length;
    const record = Object.assign({}, next.current, {
      finishedAt: Number(settings.now) || 0,
      elapsedMs: Math.max(0, Math.round(Number(settings.elapsedMs) || 0)),
      finishReason: settings.finishReason === "time" ? "time" : "user",
      items,
      total: items.length,
      correct,
      answered: items.filter((item) => item.answered).length,
    });
    next.modules.push(record);
    next.current = null;
    const routedLater = next.steps.some((step, index) => index > next.index &&
      step.type === "module" && step.module === ROUTED && step.sectionKey === record.sectionKey);
    if (record.module === "1" && routedLater && !next.routes[record.sectionKey]) {
      next.routes[record.sectionKey] = {
        route: Modules.routeFor(correct, items.length),
        correct,
        total: items.length,
        cutoff: Modules.routeCutoff(items.length),
      };
    }
    next.index += 1;
    if (next.index >= next.steps.length) next.finishedAt = record.finishedAt;
    return next;
  }

  // Starts the break clock the first time the break is shown; showing it
  // again (after a reload) keeps the clock it has.
  function startBreak(state, now) {
    const step = currentStep(state);
    if (step.type !== "break" || (state.rest && state.rest.step === step.index)) return state;
    const next = copy(state);
    const start = Number(now) || 0;
    next.rest = { step: step.index, startedAt: start, endsAt: start + step.minutes * 60 * 1000 };
    return next;
  }

  // { remainingMs, over } for the break on screen. The break clock runs on
  // the wall clock, so it keeps going while the page is closed.
  function breakStatus(state, now) {
    const step = currentStep(state);
    if (step.type !== "break" || step.endsAt === null) return { remainingMs: null, over: false };
    const remainingMs = Math.max(0, step.endsAt - (Number(now) || 0));
    return { remainingMs, over: remainingMs === 0 };
  }

  // Ends the break: the student chose to go on (`skipped` while time was
  // left) or its time ran out.
  function endBreak(state, now) {
    const step = currentStep(state);
    if (step.type !== "break") return state;
    const started = startBreak(state, now);
    const next = copy(started);
    const at = Number(now) || 0;
    next.rest.endedAt = at;
    next.rest.skipped = at < next.rest.endsAt;
    next.index += 1;
    return next;
  }

  /* ------------------------------------------------------------ resuming */

  const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

  // A saved test made safe to continue, or null when it cannot be: the
  // wrong schema, a plan this version does not know, or a step it cannot
  // show.
  function restore(saved) {
    if (!isObject(saved) || saved.schema !== SCHEMA || saved.version !== VERSION) return null;
    if (!KINDS.includes(saved.kind) || !Array.isArray(saved.steps) || !saved.steps.length) return null;
    const stepsOk = saved.steps.every((step) => isObject(step) && (
      (step.type === "break" && Number(step.minutes) > 0) ||
      (step.type === "module" && Modules.SECTIONS[step.sectionKey] &&
        (MODULE_KEYS.includes(step.module) || step.module === ROUTED))));
    if (!stepsOk) return null;
    const index = Number(saved.index);
    if (!Number.isInteger(index) || index < 0 || index > saved.steps.length) return null;
    if (!Array.isArray(saved.modules) || !isObject(saved.routes)) return null;
    const state = copy(saved);
    state.current = isObject(state.current) && state.current.step === index ? state.current : null;
    try {
      currentStep(state);
    } catch (error) {
      return null;
    }
    return state;
  }

  function canResume(saved) {
    return restore(saved) !== null;
  }

  // One line for the Practice page's resume banner.
  function describe(state) {
    const step = currentStep(state);
    const title = runTitle(state);
    if (step.type === "done") return `${title}: finished.`;
    if (step.type === "break") return `${title}: on the break before ${step.next}.`;
    const where = state.kind === "module" ? "" : `, module ${step.number} of ${step.count}`;
    return `${title}${where}: ${step.title}, ${step.size} questions in ${step.minutes} minutes.`;
  }

  /* -------------------------------------------------------------- report */

  function tally(list) {
    const total = list.length;
    const correct = list.filter((item) => item.correct).length;
    return { total, correct, accuracy: total ? correct / total : null };
  }

  // Why Module 2 went the way it did, in plain words.
  function routeText(sectionKey, route) {
    const label = sectionLabel(sectionKey);
    const share = Math.round(Modules.ROUTING_THRESHOLD * 100);
    const score = `${route.correct} of ${route.total} (${percent(route.correct, route.total)}%)`;
    return route.route === "h"
      ? `${label}: ${score} correct on Module 1, at or above ${route.cutoff} (${share}%), so Module 2 was the harder one.`
      : `${label}: ${score} correct on Module 1, below ${route.cutoff} (${share}%), so Module 2 was the easier one.`;
  }

  function allItems(state) {
    return state.modules.flatMap((entry) => entry.items.map((item) =>
      Object.assign({ sectionKey: entry.sectionKey }, item)));
  }

  // The finished test, module by module and overall: totals, each module's
  // question numbers and time, domains in the official order, tiers, and
  // the route each section took with its reason. Accuracy only.
  function report(state) {
    const items = allItems(state);
    let first = 1;
    const modules = state.modules.map((entry) => {
      const title = entry.title || titleFor(state, entry.step);
      const route = ROUTE_NAMES[entry.module] || null;
      const row = Object.assign(tally(entry.items), {
        title,
        // The route, hidden during the test, is named in the report; a
        // module test's title already names the module chosen.
        label: route && state.kind !== "module" ? `${title} (${route})` : title,
        sectionKey: entry.sectionKey,
        module: entry.module,
        route,
        first,
        last: first + entry.items.length - 1,
        answered: entry.items.filter((item) => item.answered).length,
        elapsedMs: entry.elapsedMs,
        timeLimitSeconds: entry.timeLimitSeconds,
        finishReason: entry.finishReason,
      });
      first += entry.items.length;
      return row;
    });
    const sectionKeys = [...new Set(state.modules.map((entry) => entry.sectionKey))];
    const byDomain = [];
    sectionKeys.forEach((sectionKey) => {
      Modules.SECTIONS[sectionKey].domains.forEach((domain) => {
        const list = items.filter((item) => item.sectionKey === sectionKey && item.domain === domain.name);
        if (list.length) byDomain.push(Object.assign({ sectionKey, domain: domain.name }, tally(list)));
      });
    });
    const byTier = Modules.TIERS
      .map((tier) => Object.assign({ tier }, tally(items.filter((item) => item.difficulty === tier))))
      .filter((row) => row.total);
    const routes = sectionKeys
      .filter((sectionKey) => state.routes[sectionKey])
      .map((sectionKey) => Object.assign({ sectionKey, text: routeText(sectionKey, state.routes[sectionKey]) },
        state.routes[sectionKey]));
    const totals = tally(items);
    return Object.assign(totals, {
      kind: state.kind,
      title: runTitle(state),
      answered: items.filter((item) => item.answered).length,
      elapsedMs: state.modules.reduce((sum, entry) => sum + entry.elapsedMs, 0),
      timeLimitSeconds: state.modules.reduce((sum, entry) => sum + (entry.timeLimitSeconds || 0), 0),
      modules,
      sections: sectionKeys.map((sectionKey) => Object.assign({ sectionKey, label: sectionLabel(sectionKey) },
        tally(items.filter((item) => item.sectionKey === sectionKey)))),
      byDomain,
      byTier,
      routes,
      rest: state.rest && state.rest.endedAt !== undefined
        ? { skipped: Boolean(state.rest.skipped), usedMs: Math.max(0, state.rest.endedAt - state.rest.startedAt) }
        : null,
    });
  }

  // Every finished question id, in test order.
  function questionIds(state) {
    return allItems(state).map((item) => item.questionId);
  }

  // Each finished module as the test engine combines it for one report and
  // one answer review (test-engine.js combineFinished), with question ids
  // in place of questions.
  function reviewParts(state) {
    return state.modules.map((entry) => ({
      questionIds: entry.items.map((item) => item.questionId),
      responses: entry.items.map((item) => item.response),
      marked: entry.items.map((item) => item.marked),
      hinted: entry.items.map((item) => item.hinted),
      timeMs: entry.items.map((item) => item.timeMs),
      elapsedMs: entry.elapsedMs,
      timeLimitSeconds: entry.timeLimitSeconds,
    }));
  }

  // The whole test as a finished set's items, for Progress.summarizeSession.
  function runItems(state) {
    return allItems(state).map((item) => ({
      question: {
        id: item.questionId,
        sectionKey: item.sectionKey,
        domain: item.domain,
        skill: item.skill,
        difficulty: item.difficulty,
      },
      answered: item.answered,
      correct: item.correct,
      hinted: item.hinted,
    }));
  }

  // What the whole test's session record adds to Progress.summarizeSession:
  // its modules, the routes, and accuracy by tier.
  function sessionFields(state) {
    const summary = report(state);
    const byTier = {};
    summary.byTier.forEach((row) => {
      byTier[row.tier] = { total: row.total, correct: row.correct };
    });
    return {
      modules: state.modules.map((entry) => ({
        sessionId: entry.sessionId,
        sectionKey: entry.sectionKey,
        module: entry.module,
        total: entry.total,
        correct: entry.correct,
        finishReason: entry.finishReason,
      })),
      routes: copy(state.routes),
      byTier,
      breakSkipped: summary.rest ? summary.rest.skipped : undefined,
    };
  }

  return {
    SCHEMA,
    VERSION,
    KINDS,
    ROUTED,
    ROUTE_NAMES,
    planSteps,
    create,
    currentStep,
    runTitle,
    usedTemplateIds,
    usedScenes,
    moduleSeed,
    beginModule,
    compactItems,
    finishModule,
    startBreak,
    breakStatus,
    endBreak,
    restore,
    canResume,
    describe,
    routeText,
    report,
    questionIds,
    reviewParts,
    runItems,
    sessionFields,
  };
});
