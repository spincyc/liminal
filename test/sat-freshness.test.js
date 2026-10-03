"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Runs = require("../src/lib/runs");
const Modules = require("../src/lib/modules");
const Practice = require("../src/lib/practice");
const Progress = require("../src/lib/progress");
const Simulation = require("../src/lib/simulation");
const Identity = require("../src/lib/question-identity");
const Shared = require("../src/lib/families/shared");

const families = {
  "sat-math": require("../src/lib/families/sat/math"),
  "sat-reading-writing": require("../src/lib/families/sat/reading-writing"),
};
const templates = Object.fromEntries(Object.entries(families).map(([sectionKey, entries]) =>
  [sectionKey, Runs.catalogTemplates(entries, require(`../content/templates/${sectionKey}.json`))]));

test("the SAT corpus can fill two consecutive sections on either route without borrowing tiers", () => {
  for (const [sectionKey, entries] of Object.entries(families)) {
    const first = Modules.moduleSpec(sectionKey, "1");
    for (const route of ["h", "e"]) {
      const second = Modules.moduleSpec(sectionKey, route);
      for (const domain of first.domains) {
        for (const tier of Modules.TIERS) {
          const needed = 2 * (first.cells[domain.name][tier] + second.cells[domain.name][tier]);
          const available = entries.filter((family) => family.domain === domain.name && family.difficulty === tier).length;
          assert.ok(available >= needed,
            `${sectionKey} ${route}: ${domain.name} ${tier} needs ${needed} designs, has ${available}`);
        }
      }
    }
  }
});

function fullTest(seed, route, progress) {
  let state = Simulation.create({ id: `fresh-${seed}`, kind: "full", seed, now: 1 });
  const questions = [];
  let now = 1;
  while (Simulation.currentStep(state).type !== "done") {
    const step = Simulation.currentStep(state);
    if (step.type === "break") {
      state = Simulation.endBreak(Simulation.startBreak(state, now), now + 600_000);
      now += 600_000;
      continue;
    }
    const run = Practice.buildModuleRun({
      sectionKey: step.sectionKey,
      module: step.module,
      templates: templates[step.sectionKey],
      seed: Simulation.moduleSeed(state),
      history: Progress.historyFor(progress, step.sectionKey),
      exclude: Simulation.usedTemplateIds(state, step.sectionKey),
      avoidScenes: Simulation.usedScenes(state, step.sectionKey),
      avoidItems: Simulation.usedItems(state, step.sectionKey),
      instantiate: Shared.instantiate,
    });
    assert.equal(run.questions.length, step.size);
    assert.deepEqual(run.shortfalls, [], `${step.sectionKey} ${step.module} borrowed a tier`);
    const counts = Object.fromEntries(Modules.TIERS.map((tier) =>
      [tier, run.questions.filter((question) => question.difficulty === tier).length]));
    assert.deepEqual(counts, run.spec.mix);
    progress = Progress.serveTemplates(progress, step.sectionKey, {
      templateIds: run.templateIds, mask: run.servedMaskCode,
      scenes: run.scenes, itemIdentities: run.itemIdentities,
    });
    const sessionId = `${state.id}-${step.index}`;
    state = Simulation.beginModule(state, {
      sessionId, templateIds: run.chosenIds, questionIds: run.questions.map((question) => question.id),
      scenes: Object.values(run.scenes), itemIdentities: run.itemIdentities, runCode: run.code, now,
    });
    const items = run.questions.map((question) => ({
      question, answered: true, correct: route === "h", hinted: false,
      response: question.correctAnswer, timeMs: 30_000,
    }));
    now += 900_000;
    state = Simulation.finishModule(state, {
      sessionId, items: Simulation.compactItems(items), elapsedMs: 900_000, now,
    });
    questions.push(...run.questions);
  }
  assert.equal(questions.length, 98);
  assert.equal(new Set(questions.map((question) => `${question.sectionKey}|${question.templateId}`)).size, 98);
  return { progress, questions };
}

for (const routes of [["h", "h"], ["e", "e"], ["h", "e"], ["e", "h"]]) {
  test(`two full SATs preserve their blueprints and avoid repeated designs: ${routes.join(" then ")}`, () => {
    const first = fullTest("fresh1", routes[0], Progress.empty());
    const second = fullTest("fresh2", routes[1], first.progress);
    const designs = new Set(first.questions.map((question) => `${question.sectionKey}|${question.templateId}`));
    const items = new Set(first.questions.map(Identity.visibleIdentity));
    const scenes = new Set(first.questions.map((question) => question.scene).filter(Boolean));
    for (const question of second.questions) {
      assert.equal(designs.has(`${question.sectionKey}|${question.templateId}`), false, question.templateId);
      assert.equal(items.has(Identity.visibleIdentity(question)), false, question.id);
      if (question.scene) assert.equal(scenes.has(question.scene), false, question.scene);
    }
  });
}
