"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Mask = require("../src/lib/template-mask");
const Runs = require("../src/lib/runs");
const S = require("../src/lib/families/shared");
const mathFamilies = require("../src/lib/families/sat/math");
const mathRegistry = require("../content/templates/sat-math.json");

function fakeTemplates() {
  const skills = ["a", "b", "c"];
  return Array.from({ length: 9 }, (unused, index) => ({
    id: `t${index}`,
    bit: index,
    difficulty: "Hard",
    domain: "d",
    skill: skills[index % 3],
    family: { id: `t${index}` },
  }));
}

test("a run never takes a template twice and never exceeds what matches", () => {
  const templates = fakeTemplates();
  const run = Runs.chooseTemplates(templates, { count: 50, seed: "s" });
  assert.equal(run.templates.length, 9);
  assert.equal(new Set(run.templates.map((template) => template.id)).size, 9);
  assert.equal(Mask.size(run.mask), 9);
  assert.equal(Runs.available(templates, { skills: ["a"] }), 3);
});

test("a run spreads across skills and prefers unseen templates", () => {
  const templates = fakeTemplates();
  const spread = Runs.chooseTemplates(templates, { count: 3, seed: "s" });
  assert.deepEqual(new Set(spread.templates.map((template) => template.skill)), new Set(["a", "b", "c"]));
  const seen = Mask.fromBits([0, 1, 2, 3, 4, 5]);
  const fresh = Runs.chooseTemplates(templates, { count: 3, seed: "s", seen });
  assert.deepEqual(fresh.templates.map((template) => template.bit).sort(), [6, 7, 8]);
});

test("a run is reproducible from its code", () => {
  const templates = Runs.catalogTemplates(mathFamilies, mathRegistry);
  const run = Runs.chooseTemplates(templates, { count: 12, seed: "k3f9", filters: { difficulties: ["Hard"] } });
  const questions = Runs.drawQuestions(run.templates, "k3f9", S.instantiate, "sat-math:");
  const code = Runs.runCode(run.mask, "k3f9");
  const parsed = Runs.parseRunCode(code);
  const again = Runs.drawQuestions(Runs.templatesForMask(templates, parsed.mask), parsed.seed, S.instantiate, "sat-math:");
  assert.deepEqual(again.map((question) => question.id), questions.map((question) => question.id));
  assert.equal(new Set(questions.map((question) => question.templateId)).size, 12);
  assert.ok(questions.every((question) => question.verified));
});

test("questions in a run never share a scene", () => {
  const scenes = ["x", "y", "z", "w"];
  const templates = fakeTemplates().slice(0, 4);
  // Each seed lands on one of four scenes, so collisions are likely unless
  // drawQuestions retries.
  const questions = Runs.drawQuestions(templates, "q", (family, seed) => {
    const index = [...seed].reduce((sum, character) => sum + character.charCodeAt(0), 0) % scenes.length;
    return { templateId: family.id, scene: scenes[index] };
  }, "");
  assert.equal(new Set(questions.map((question) => question.scene)).size, questions.length);
});
