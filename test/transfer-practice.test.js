"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Practice = require("../src/lib/practice");
const Progress = require("../src/lib/progress");
const Runs = require("../src/lib/runs");
const Mask = require("../src/lib/template-mask");
const S = require("../src/lib/families/shared");
const registry = require("../content/templates/sat-math.json");
const families = require("../src/lib/families/sat/math");
const templates = Runs.catalogTemplates(families, registry);
const options = { sectionKey: "sat-math", templates, seed: "transfer1", instantiate: S.instantiate };
const served = (run) => ({ ...run, mask: run.servedMaskCode });

test("the transfer check covers four domains with accessible tiers and distinct designs", () => {
  for (const seed of ["transfer1", "transfer2", "transfer3"]) {
    const run = Practice.buildTransferRun({ ...options, seed });
    assert.equal(run.questions.length, 12);
    assert.equal(run.shortfall, 0);
    assert.deepEqual(run.domainShortfalls, []);
    assert.equal(new Set(run.templateIds).size, 12);
    assert.equal(new Set(run.itemIdentities).size, 12);
    assert.deepEqual(Object.fromEntries(Object.keys(Practice.TRANSFER_TARGETS).map((domain) => [domain,
      run.questions.filter((question) => question.domain === domain).length])), Practice.TRANSFER_TARGETS);
    assert.deepEqual(run.questions.reduce((counts, question) => {
      counts[question.difficulty] = (counts[question.difficulty] || 0) + 1;
      return counts;
    }, {}), { Easy: 6, Medium: 6 });
    assert.ok(new Set(run.questions.filter((question) => question.domain === "Geometry and Trigonometry")
      .map((question) => question.skill)).size >= 3, "Geometry varies the required method");
    assert.ok(run.questions.some((question, index, list) => index && question.domain !== list[index - 1].domain),
      "the check does not group all questions under visible domain labels");
  }
});

test("a transfer run rotates least served designs and replays its steered question order", () => {
  const first = Practice.buildTransferRun(options);
  const progress = Progress.serveTemplates(Progress.empty(), "sat-math", served(first));
  const next = Practice.buildTransferRun({ ...options, history: Progress.historyFor(progress, "sat-math") });
  assert.equal(next.templateIds.filter((id) => first.templateIds.includes(id)).length, 0,
    "unseen designs take the next check when every quota has enough");
  assert.equal(next.itemIdentities.filter((identity) => first.itemIdentities.includes(identity)).length, 0);
  const replay = Practice.rebuildRun({ code: next.setCode, templates, registry, instantiate: S.instantiate });
  assert.deepEqual(replay.questions.map((question) => question.id), next.questions.map((question) => question.id));
  assert.deepEqual(replay.questions.map(Practice.itemKey), next.itemIdentities);
  assert.equal(Mask.size(Mask.fromCode(next.servedMaskCode)), 12);
});

test("a partial transfer pool reports missing domain quotas without Hard or duplicate fill", () => {
  const one = templates.find((template) => template.domain === "Geometry and Trigonometry" && template.difficulty === "Easy");
  const run = Practice.buildTransferRun({ ...options,
    templates: [one, ...templates.filter((template) => template.difficulty === "Hard")],
  });
  assert.equal(run.questions.length, 1);
  assert.equal(run.shortfall, 11);
  assert.equal(run.domainShortfalls.length, 4);
  assert.deepEqual(run.domainShortfalls[0], { domain: "Geometry and Trigonometry", requested: 6, actual: 1 });
  assert.equal(Practice.runWarnings(run).missingQuestions, 11);
  assert.throws(() => Practice.buildTransferRun({ ...options, sectionKey: "act-mathematics" }), /SAT Math/);
});

test("transfer draws avoid shared scenes across domain groups", () => {
  const selected = ["Geometry and Trigonometry", "Algebra"].map((domain) => templates.find((template) =>
    template.domain === domain && template.difficulty === "Easy"));
  const run = Practice.buildTransferRun({ ...options, templates: selected,
    instantiate: (family, seed) => ({ ...S.instantiate(family, seed),
      scene: seed.endsWith(".0") ? "shared-across-domains" : `fresh-${family.id}`,
    }),
  });
  assert.equal(run.questions.length, 2);
  assert.equal(new Set(run.questions.map((question) => question.scene)).size, 2);
  assert.equal(new Set(run.itemIdentities).size, 2);
  assert.equal(Practice.runWarnings(run).repeatedScenes, 0);
});

test("exhausted transfer variations keep the reuse warning and reproducible content", () => {
  const template = templates.find((entry) => entry.domain === "Algebra" && entry.difficulty === "Easy");
  const fixed = S.instantiate(template.family, "fixed");
  const instantiate = () => ({ ...fixed, scene: "transfer-fixed-scene" });
  const first = Practice.buildTransferRun({ ...options, templates: [template], instantiate });
  const progress = Progress.serveTemplates(Progress.empty(), "sat-math", served(first));
  const next = Practice.buildTransferRun({ ...options, templates: [template], instantiate,
    history: Progress.historyFor(progress, "sat-math"),
  });
  assert.equal(next.questions.length, 1);
  assert.equal(Practice.runWarnings(next).repeatedItems, 1);
  assert.equal(Practice.runWarnings(next).repeatedScenes, 1);
  assert.equal(next.repeats[0].reason, "candidate-pool-exhausted");
  const replay = Practice.rebuildRun({ code: next.setCode, templates: [template], instantiate });
  assert.deepEqual(replay.itemIdentities, next.itemIdentities);
});

test("unavoidable cross-template visible collisions make an honest, exactly replayable partial check", () => {
  const selected = templates.filter((entry) => entry.domain === "Algebra" && entry.difficulty === "Easy").slice(0, 2);
  const fixed = S.instantiate(selected[0].family, "collision");
  // No scene metadata: visible identity alone must catch the collision.
  const instantiate = (family) => ({ ...fixed, templateId: family.id, scene: "" });
  const run = Practice.buildTransferRun({ ...options, templates: selected, instantiate });
  assert.equal(run.questions.length, 1);
  assert.equal(new Set(run.itemIdentities).size, run.questions.length);
  assert.equal(run.shortfall, 11);
  assert.deepEqual(run.domainShortfalls.find((entry) => entry.domain === "Algebra"),
    { domain: "Algebra", requested: 2, actual: 1 });
  assert.equal(run.skipped.length, 1);
  assert.equal(run.skipped[0].reason, "duplicate-visible-item");
  assert.equal(Mask.size(run.mask), 1, "the code contains only the retained design");
  assert.equal(Mask.toCode(run.mask), run.servedMaskCode);
  assert.equal(Practice.runWarnings(run).repeatedItems, 0);
  const replay = Practice.rebuildRun({ code: run.setCode, templates: selected, instantiate });
  assert.deepEqual(replay.questions.map((question) => question.id), run.questions.map((question) => question.id));
  assert.deepEqual(replay.itemIdentities, run.itemIdentities);
});

test("a cross-template visible collision uses a distinct candidate when available", () => {
  const selected = templates.filter((entry) => entry.domain === "Algebra" && entry.difficulty === "Easy").slice(0, 2);
  const fixed = S.instantiate(selected[0].family, "collision");
  const instantiate = (family, seed) => ({ ...fixed, templateId: family.id, scene: "",
    stem: seed.endsWith(".0") ? fixed.stem : `${fixed.stem} Use the equation for ${family.id}.`,
  });
  const run = Practice.buildTransferRun({ ...options, templates: selected, instantiate });
  assert.equal(run.questions.length, 2);
  assert.equal(new Set(run.itemIdentities).size, 2);
  assert.deepEqual(run.skipped, []);
  assert.equal(run.domainShortfalls.some((entry) => entry.domain === "Algebra"), false);
  const replay = Practice.rebuildRun({ code: run.setCode, templates: selected, instantiate });
  assert.deepEqual(replay.questions.map((question) => question.id), run.questions.map((question) => question.id));
});
