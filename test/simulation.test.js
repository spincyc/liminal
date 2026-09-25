"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Runs = require("../src/lib/runs");
const Modules = require("../src/lib/modules");
const Practice = require("../src/lib/practice");
const Progress = require("../src/lib/progress");
const Engine = require("../src/lib/test-engine");
const Simulation = require("../src/lib/simulation");
const S = require("../src/lib/families/shared");

const RW = "sat-reading-writing";
const MATH = "sat-math";

const TEMPLATES = {
  [MATH]: Runs.catalogTemplates(require("../src/lib/families/sat/math"), require("../content/templates/sat-math.json")),
  [RW]: Runs.catalogTemplates(
    require("../src/lib/families/sat/reading-writing"),
    require("../content/templates/sat-reading-writing.json"),
  ),
};

// Module items as the shell reports them, `correct` of them right, the
// rest wrong or (every third) left blank.
function fakeItems(sectionKey, size, correct) {
  const domains = Modules.SECTIONS[sectionKey].domains;
  return Array.from({ length: size }, (_, index) => {
    const right = index < correct;
    const blank = !right && index % 3 === 0;
    return {
      question: {
        id: `${sectionKey}:t${index}:s.t${index}.0`,
        sectionKey,
        domain: domains[index % domains.length].name,
        skill: `skill ${index % 5}`,
        difficulty: Modules.TIERS[index % 3],
      },
      response: blank ? null : right ? 1 : 0,
      answered: !blank,
      correct: right,
      marked: index === 2,
      hinted: false,
      timeMs: 1000 + index,
    };
  });
}

// Plays the step on screen: a module with `correct` right answers (a share
// of its size when below 1), or the break, skipped at once.
function play(state, correct, now) {
  const step = Simulation.currentStep(state);
  if (step.type === "break") return Simulation.endBreak(Simulation.startBreak(state, now), now + 1000);
  const started = Simulation.beginModule(state, {
    sessionId: `s${step.index}`,
    templateIds: [`${step.sectionKey}-${step.index}`],
    questionIds: [],
    now,
  });
  const right = correct < 1 ? Math.round(step.size * correct) : correct;
  return Simulation.finishModule(started, {
    sessionId: `s${step.index}`,
    items: Simulation.compactItems(fakeItems(step.sectionKey, step.size, right)),
    elapsedMs: 600_000,
    finishReason: "user",
    now: now + 600_000,
  });
}

/* -------------------------------------------------------------- routing */

test("Module 2 routes harder at 60% of Module 1 and easier just below it", () => {
  assert.equal(Modules.ROUTING_THRESHOLD, 0.6);
  assert.equal(Modules.routeCutoff(27), 17);
  assert.equal(Modules.routeCutoff(22), 14);
  assert.equal(Modules.routeCutoff(20), 12, "an exact 60% is at the threshold");
  assert.equal(Modules.routeFor(12, 20), "h");
  assert.equal(Modules.routeFor(11, 20), "e");
  assert.equal(Modules.routeFor(0, 0), "e");

  for (const [sectionKey, cutoff] of [[RW, 17], [MATH, 14]]) {
    const start = Simulation.create({ kind: "section", sectionKey, seed: "r1", now: 1 });
    const at = play(start, cutoff, 10);
    const below = play(start, cutoff - 1, 10);
    assert.equal(at.routes[sectionKey].route, "h", `${sectionKey} at the cutoff`);
    assert.equal(below.routes[sectionKey].route, "e", `${sectionKey} one below`);
    assert.equal(at.routes[sectionKey].cutoff, cutoff);
    const harder = Simulation.currentStep(at);
    assert.equal(harder.module, "h");
    assert.equal(harder.title.endsWith("Module 2"), true, "the route is not shown during the test");
    assert.equal(Simulation.currentStep(below).module, "e");
  }
});

test("a module test runs the module chosen, with no routing", () => {
  const state = Simulation.create({ kind: "module", sectionKey: MATH, module: "h", seed: "m", now: 1 });
  const step = Simulation.currentStep(state);
  assert.equal(step.module, "h");
  assert.equal(step.title, "Math: Module 2, harder");
  assert.equal(step.next, "your results");
  assert.equal(Simulation.runTitle(state), "SAT Math: Module 2, harder");
  const done = play(state, 10, 5);
  assert.deepEqual(done.routes, {});
  assert.equal(Simulation.report(done).modules[0].label, "Math: Module 2, harder", "the title already names it");
  assert.equal(Simulation.currentStep(done).type, "done");
  assert.equal(done.finishedAt, 600_005);
  assert.throws(() => Simulation.create({ kind: "module", sectionKey: MATH, module: "x" }), RangeError);
  assert.throws(() => Simulation.create({ kind: "section", sectionKey: "act-english" }), RangeError);
});

test("the full-length plan: two Reading and Writing modules, the break, two Math modules", () => {
  const state = Simulation.create({ kind: "full", seed: "f", now: 1 });
  assert.deepEqual(state.steps.map((step) => step.type === "break" ? "break" : `${step.sectionKey}/${step.module}`), [
    `${RW}/1`, `${RW}/routed`, "break", `${MATH}/1`, `${MATH}/routed`,
  ]);
  const first = Simulation.currentStep(state);
  assert.equal(first.title, "Section 1, Module 1: Reading and Writing");
  assert.equal(first.next, "Section 1, Module 2: Reading and Writing");
  assert.equal(first.number, 1);
  assert.equal(first.count, 4);
  assert.equal(first.minutes, 32);
  assert.equal(first.size, 27);
  const second = play(state, 20, 10);
  assert.equal(Simulation.currentStep(second).next, "the break");
  const rest = play(second, 5, 20);
  assert.equal(rest.routes[RW].route, "h");
  const onBreak = Simulation.currentStep(rest);
  assert.equal(onBreak.type, "break");
  assert.equal(onBreak.next, "Section 2, Module 1: Math");
});

/* ------------------------------------------------------------- no repeats */

test("a full-length test never repeats a template or a question, and each module keeps the blueprint", () => {
  let state = Simulation.create({ kind: "full", seed: "k3x9", now: 1 });
  const history = {};
  const built = [];
  let now = 1000;
  // Module 1s answered well enough for the harder route in Reading and
  // Writing, not in Math, so both routes are built.
  const shares = { [RW]: 0.8, [MATH]: 0.3 };
  for (let guard = 0; guard < 10; guard += 1) {
    const step = Simulation.currentStep(state);
    if (step.type === "done") break;
    if (step.type === "break") {
      state = Simulation.endBreak(Simulation.startBreak(state, now), now + 5000);
      continue;
    }
    const run = Practice.buildModuleRun({
      sectionKey: step.sectionKey,
      module: step.module,
      templates: TEMPLATES[step.sectionKey],
      seed: Simulation.moduleSeed(state),
      history: history[step.sectionKey],
      exclude: Simulation.usedTemplateIds(state, step.sectionKey),
      avoidScenes: Simulation.usedScenes(state, step.sectionKey),
      instantiate: S.instantiate,
    });
    built.push({ step, run });
    state = Simulation.beginModule(state, {
      sessionId: `s${step.index}`,
      templateIds: run.chosenIds,
      questionIds: run.questions.map((question) => question.id),
      scenes: Object.values(run.scenes),
      timeLimitSeconds: step.minutes * 60,
      now,
    });
    const right = Math.round(run.questions.length * shares[step.sectionKey]);
    const items = run.questions.map((question, index) => ({
      question, response: 0, answered: true, correct: index < right, marked: false, hinted: false, timeMs: 1,
    }));
    now += 1000;
    state = Simulation.finishModule(state, {
      sessionId: `s${step.index}`, items: Simulation.compactItems(items), elapsedMs: 1000, now,
    });
  }
  assert.equal(Simulation.currentStep(state).type, "done");
  assert.deepEqual(built.map((entry) => `${entry.step.sectionKey}/${entry.step.module}`),
    [`${RW}/1`, `${RW}/h`, `${MATH}/1`, `${MATH}/e`]);

  const templateIds = built.flatMap((entry) => entry.run.chosenIds.map((id) => `${entry.step.sectionKey}:${id}`));
  assert.equal(new Set(templateIds).size, templateIds.length, "no template twice in the form");
  const questionIds = built.flatMap((entry) => entry.run.questions.map((question) => question.id));
  assert.equal(new Set(questionIds).size, questionIds.length);
  assert.deepEqual(Simulation.questionIds(state), questionIds);

  built.forEach(({ step, run }) => {
    const spec = Modules.moduleSpec(step.sectionKey, step.module);
    assert.equal(run.questions.length, spec.size, `${step.title} is full length`);
    assert.deepEqual(run.shortfalls, [], `${step.title} filled every cell from its own tier`);
    const tiers = { Easy: 0, Medium: 0, Hard: 0 };
    run.questions.forEach((question) => { tiers[question.difficulty] += 1; });
    assert.deepEqual(tiers, spec.mix, `${step.title} tier mix`);
    spec.domains.forEach((domain) => {
      assert.equal(run.questions.filter((question) => question.domain === domain.name).length, domain.count,
        `${step.title} ${domain.name}`);
    });
    // Reading and Writing is grouped by domain in the official order.
    if (step.sectionKey === RW) {
      const order = spec.domains.map((domain) => domain.name);
      const ranks = run.questions.map((question) => order.indexOf(question.domain));
      assert.deepEqual(ranks, ranks.slice().sort((a, b) => a - b), `${step.title} domain order`);
    }
  });

  // Within a section, the second module draws around the first one's scenes.
  [RW, MATH].forEach((sectionKey) => {
    const scenes = built.filter((entry) => entry.step.sectionKey === sectionKey)
      .flatMap((entry) => entry.run.questions.map((question) => question.scene).filter(Boolean));
    assert.equal(new Set(scenes).size, scenes.length, `${sectionKey} repeats no scene`);
  });
});

test("modules prefer templates the student has not been served", () => {
  const templates = TEMPLATES[MATH];
  const first = Practice.buildModuleRun({ sectionKey: MATH, module: "1", templates, seed: "a", instantiate: S.instantiate });
  let progress = Progress.empty();
  progress = Progress.serveTemplates(progress, MATH, {
    templateIds: first.templateIds, scenes: first.scenes, mask: first.servedMaskCode,
  });
  const second = Practice.buildModuleRun({
    sectionKey: MATH, module: "1", templates, seed: "a", history: Progress.historyFor(progress, MATH),
    instantiate: S.instantiate,
  });
  const repeated = second.chosenIds.filter((id) => first.chosenIds.includes(id));
  // Every cell has more templates than it needs, so nothing repeats.
  assert.deepEqual(repeated, []);
  // Without history the same seed chooses the same module again.
  const again = Practice.buildModuleRun({ sectionKey: MATH, module: "1", templates, seed: "a", instantiate: S.instantiate });
  assert.deepEqual(again.chosenIds, first.chosenIds);
});

/* --------------------------------------------------------------- resume */

test("a test saved mid-module resumes at that module with its questions and exclusions", () => {
  let state = Simulation.create({ kind: "full", seed: "z", now: 1 });
  state = play(state, 20, 10);
  const step = Simulation.currentStep(state);
  state = Simulation.beginModule(state, {
    sessionId: "live", templateIds: ["rw-a", "rw-b"], questionIds: ["q1", "q2"], scenes: ["harbor"], now: 50,
  });
  const saved = JSON.parse(JSON.stringify(state));
  const restored = Simulation.restore(saved);
  assert.ok(restored);
  const again = Simulation.currentStep(restored);
  assert.equal(again.index, step.index);
  assert.equal(again.started, true);
  assert.equal(again.sessionId, "live");
  assert.equal(again.module, "h");
  assert.ok(Simulation.usedTemplateIds(restored, RW).includes("rw-a"));
  assert.ok(Simulation.usedTemplateIds(restored, RW).includes(`${RW}-0`), "Module 1's templates stay excluded");
  assert.deepEqual(Simulation.usedScenes(restored, RW), ["harbor"]);
  assert.deepEqual(Simulation.usedTemplateIds(restored, MATH), []);
  assert.match(Simulation.describe(restored), /^Full-length SAT, module 2 of 4: Section 1, Module 2/);

  // A result for another module changes nothing; the live one advances.
  const stray = Simulation.finishModule(restored, { sessionId: "other", items: [] });
  assert.equal(stray, restored);
  const done = Simulation.finishModule(restored, {
    sessionId: "live", items: Simulation.compactItems(fakeItems(RW, 27, 10)), elapsedMs: 5, now: 60,
  });
  assert.equal(Simulation.currentStep(done).type, "break");
  assert.equal(Simulation.finishModule(done, { sessionId: "live", items: [] }), done, "delivered twice counts once");

  // The module's clock resumes from the engine snapshot the shell saved.
  let time = 1_000_000;
  const session = Engine.create({ questions: [{ id: "a", responseType: "multiple-choice", choices: ["1", "2"], correctAnswer: 0 }], timeLimitSeconds: 32 * 60, now: () => time });
  time += 60_000;
  const snapshot = session.serialize();
  time += 30_000;
  const resumed = Engine.restore(snapshot, { now: () => time });
  assert.equal(resumed.timer().remainingSeconds, 32 * 60 - 90, "a timed module keeps wall time across a reload");
});

test("restore refuses what it cannot continue", () => {
  const state = Simulation.create({ kind: "section", sectionKey: MATH, seed: "y", now: 1 });
  assert.equal(Simulation.restore(null), null);
  assert.equal(Simulation.restore({ ...state, schema: "other" }), null);
  assert.equal(Simulation.restore({ ...state, version: 2 }), null);
  assert.equal(Simulation.restore({ ...state, kind: "diagnostic" }), null);
  assert.equal(Simulation.restore({ ...state, index: 7 }), null);
  assert.equal(Simulation.restore({ ...state, steps: [{ type: "module", sectionKey: "act-english", module: "1" }] }), null);
  // Module 2 with no route recorded cannot be shown.
  assert.equal(Simulation.restore({ ...state, index: 1 }), null);
  assert.equal(Simulation.canResume(state), true);
  // A current module from another step is dropped, not trusted.
  const stale = Simulation.restore({ ...state, current: { step: 3, sessionId: "x" } });
  assert.equal(stale.current, null);
});

/* ---------------------------------------------------------------- break */

test("the break counts down on the wall clock, can be skipped, and keeps its clock across a reload", () => {
  let state = Simulation.create({ kind: "full", seed: "b", now: 1 });
  state = play(play(state, 20, 10), 20, 20);
  const minute = 60_000;
  const onBreak = Simulation.startBreak(state, 100 * minute);
  assert.equal(Simulation.currentStep(onBreak).endsAt, 110 * minute);
  assert.equal(Simulation.startBreak(onBreak, 104 * minute), onBreak, "showing it again keeps the clock");
  assert.deepEqual(Simulation.breakStatus(onBreak, 103 * minute), { remainingMs: 7 * minute, over: false });
  assert.deepEqual(Simulation.breakStatus(onBreak, 111 * minute), { remainingMs: 0, over: true });

  const skipped = Simulation.endBreak(Simulation.restore(JSON.parse(JSON.stringify(onBreak))), 102 * minute);
  assert.equal(skipped.rest.skipped, true);
  const next = Simulation.currentStep(skipped);
  assert.equal(next.type, "module");
  assert.equal(next.sectionKey, MATH);
  assert.equal(next.module, "1");

  const waited = Simulation.endBreak(onBreak, 110 * minute);
  assert.equal(waited.rest.skipped, false);
  // Ending a break that was never shown starts and ends it at once.
  assert.equal(Simulation.endBreak(state, 5).rest.skipped, true);
  // Nothing happens outside a break.
  const fresh = Simulation.create({ kind: "full", seed: "b", now: 1 });
  assert.equal(Simulation.startBreak(fresh, 5), fresh);
  assert.equal(Simulation.endBreak(fresh, 5), fresh);
});

/* --------------------------------------------------------------- report */

test("the report adds up modules, domains, tiers, and routes, with no score", () => {
  let state = Simulation.create({ kind: "full", seed: "r", now: 1 });
  state = play(state, 18, 10); // RW Module 1: 18 of 27, harder
  state = play(state, 9, 20); // RW Module 2
  state = play(state, 0, 30); // break
  state = play(state, 10, 40); // Math Module 1: 10 of 22, easier
  state = play(state, 11, 50); // Math Module 2
  const report = Simulation.report(state);
  assert.equal(report.total, 98);
  assert.equal(report.correct, 48);
  assert.equal(report.accuracy, 48 / 98);
  assert.equal(report.title, "Full-length SAT");
  assert.equal(report.elapsedMs, 4 * 600_000);
  assert.equal(report.timeLimitSeconds, (32 * 2 + 35 * 2) * 60, "each module's official time");
  assert.deepEqual(report.modules.map((row) => [row.first, row.last, row.correct, row.route]), [
    [1, 27, 18, null], [28, 54, 9, "harder"], [55, 76, 10, null], [77, 98, 11, "easier"],
  ]);
  assert.equal(report.modules[0].title, "Section 1, Module 1: Reading and Writing");
  assert.equal(report.modules[1].label, "Section 1, Module 2: Reading and Writing (harder)");
  assert.equal(report.modules[0].label, report.modules[0].title);
  assert.deepEqual(report.sections.map((row) => [row.sectionKey, row.total, row.correct]), [[RW, 54, 27], [MATH, 44, 21]]);
  // Domains in the official order, section by section.
  assert.deepEqual(report.byDomain.slice(0, 4).map((row) => row.domain),
    Modules.SECTIONS[RW].domains.map((domain) => domain.name));
  assert.equal(report.byDomain.reduce((sum, row) => sum + row.total, 0), 98);
  assert.deepEqual(report.byTier.map((row) => row.tier), ["Easy", "Medium", "Hard"]);
  assert.equal(report.byTier.reduce((sum, row) => sum + row.correct, 0), 48);
  assert.deepEqual(report.routes.map((row) => [row.sectionKey, row.route]), [[RW, "h"], [MATH, "e"]]);
  assert.equal(report.routes[0].text,
    "Reading and Writing: 18 of 27 (67%) correct on Module 1, at or above 17 (60%), so Module 2 was the harder one.");
  assert.equal(report.routes[1].text,
    "Math: 10 of 22 (45%) correct on Module 1, below 14 (60%), so Module 2 was the easier one.");
  assert.equal(report.rest.skipped, true);
  assert.ok(!JSON.stringify(report).match(/scaled|score/i), "accuracy only");

  // The whole test's session record, through the Progress API.
  const session = Object.assign(Progress.summarizeSession(
    { id: state.id, kind: "full", title: report.title, startedAt: 1, finishedAt: 2 },
    Simulation.runItems(state), report.elapsedMs,
  ), Simulation.sessionFields(state));
  assert.equal(session.total, 98);
  assert.equal(session.correct, 48);
  assert.deepEqual(session.sections, [RW, MATH]);
  assert.equal(session.hard.total, report.byTier[2].total);
  assert.deepEqual(session.modules.map((row) => row.module), ["1", "h", "1", "e"]);
  assert.equal(session.routes[MATH].route, "e");
  assert.equal(session.byTier.Easy.total, report.byTier[0].total);

  // The parts one answer review combines.
  const parts = Simulation.reviewParts(state);
  assert.equal(parts.length, 4);
  assert.equal(parts[0].questionIds.length, 27);
  assert.equal(parts[0].responses[18], null, "a blank stays blank");
  assert.equal(parts[0].responses[19], 0);
  assert.equal(parts[0].marked[2], true);
});

test("compact items keep what routing and review need, and never trust a stray correct", () => {
  const [item] = Simulation.compactItems([{
    question: { id: "sat-math:x:1", sectionKey: MATH, domain: "Algebra", skill: "s", difficulty: "Hard", stem: "long" },
    response: null, answered: false, correct: true, marked: true, hinted: false, timeMs: 12.6,
  }]);
  assert.deepEqual(item, {
    questionId: "sat-math:x:1", sectionKey: MATH, domain: "Algebra", skill: "s", difficulty: "Hard",
    response: null, answered: false, correct: false, marked: true, hinted: false, timeMs: 13,
  });
});
