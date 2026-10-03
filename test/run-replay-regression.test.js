"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Practice = require("../src/lib/practice");

test("new runs pin all-zero draws when item avoidance differs from legacy scene avoidance", () => {
  const templates = ["first", "second"].map((id, bit) => ({
    id, bit, difficulty: "Hard", domain: "Algebra", skill: "Linear functions", family: { id },
  }));
  const instantiate = (family, seed) => {
    const attempt = Number(seed.split(".").pop());
    return {
      templateId: family.id,
      stem: family.id === "first" || attempt > 0 ? "Visible item A" : "Visible item B",
      scene: family.id === "first" || attempt === 0 ? "shared-topic" : "other-topic",
      responseType: "numeric",
      verified: true,
    };
  };
  const run = Practice.buildTemplateRun({
    sectionKey: "sat-math", templates, count: 2, seed: "s", instantiate,
  });
  assert.deepEqual(new Set(run.questions.map((question) => question.stem)),
    new Set(["Visible item A", "Visible item B"]));
  assert.ok(run.questions.every((question) => question.id.endsWith(".0")));
  assert.match(run.setCode, /-00$/);
  const replay = Practice.rebuildRun({ code: run.setCode, templates, instantiate });
  assert.deepEqual(replay.questions, run.questions);

  // A previously shared code must retain the old scene-first draw.
  const legacy = Practice.rebuildRun({ code: "math-3-s", templates, instantiate });
  assert.ok(legacy.questions.every((question) => question.stem === "Visible item A"));
  assert.equal(legacy.questions.find((question) => question.templateId === "second").scene, "other-topic");
});
