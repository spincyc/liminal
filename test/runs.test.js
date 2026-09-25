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

function domainTemplates(counts) {
  const templates = [];
  Object.entries(counts).forEach(([domain, count]) => {
    for (let index = 0; index < count; index += 1) {
      const id = `${domain}${index}`;
      templates.push({ id, bit: templates.length, difficulty: "Hard", domain, skill: `${domain}-${index % 2}`, family: { id } });
    }
  });
  return templates;
}

const tally = (list, key) => list.reduce((counts, item) => ({ ...counts, [item[key]]: (counts[item[key]] || 0) + 1 }), {});

test("recency prefers never-served templates, then the least recently served", () => {
  const templates = fakeTemplates();
  // t0-t5 served; t6-t8 never. Then t4 and t5 (serve 1) before t0-t3 (serve 2-3).
  const recency = { t0: 3, t1: 3, t2: 2, t3: 2, t4: 1, t5: 1 };
  const run = Runs.chooseTemplates(templates, { count: 5, seed: "s", recency });
  assert.deepEqual(run.templates.map((template) => template.id).sort(), ["t4", "t5", "t6", "t7", "t8"]);
  // Recency replaces the lifetime mask: templates in `seen` still rotate back in.
  const seen = Mask.fromBits([0, 1, 2, 3, 4, 5, 6, 7]);
  const rotated = Runs.chooseTemplates(templates, { count: 2, seed: "s", seen, recency: { t8: 5, t7: 4, t6: 3, t5: 3, t4: 2, t3: 2, t2: 2, t1: 1, t0: 0 } });
  assert.deepEqual(rotated.templates.map((template) => template.id).sort(), ["t0", "t1"]);
});

test("within a recency tie, a run spreads across skills", () => {
  const templates = fakeTemplates();
  const recency = Object.fromEntries(templates.map((template) => [template.id, 7]));
  const run = Runs.chooseTemplates(templates, { count: 3, seed: "x", recency });
  assert.deepEqual(new Set(run.templates.map((template) => template.skill)), new Set(["a", "b", "c"]));
});

test("domain weights fill domains in proportion by largest remainder", () => {
  const templates = domainTemplates({ alg: 10, adv: 10, psda: 10, geo: 10 });
  const weights = { alg: 35, adv: 35, psda: 15, geo: 15 };
  const run = Runs.chooseTemplates(templates, { count: 20, seed: "w", domainWeights: weights });
  assert.deepEqual(tally(run.templates, "domain"), { alg: 7, adv: 7, psda: 3, geo: 3 });
  assert.equal(Mask.size(run.mask), 20);
  // 3.5 / 3.5 / 1.5 / 1.5 seats for 10: the two spare seats go by a seeded
  // order, so over many seeds each domain gets its share.
  const totals = { alg: 0, adv: 0, psda: 0, geo: 0 };
  for (let seed = 0; seed < 400; seed += 1) {
    const counts = tally(Runs.chooseTemplates(templates, { count: 10, seed: String(seed), domainWeights: weights }).templates, "domain");
    Object.keys(totals).forEach((domain) => (totals[domain] += counts[domain] || 0));
  }
  assert.ok(Math.abs(totals.alg / 4000 - 0.35) < 0.03, JSON.stringify(totals));
  assert.ok(Math.abs(totals.geo / 4000 - 0.15) < 0.03, JSON.stringify(totals));
});

test("a domain short of its share passes the surplus on, and runs still reach their count", () => {
  const templates = domainTemplates({ alg: 10, adv: 10, psda: 1, geo: 10 });
  const weights = { alg: 35, adv: 35, psda: 15, geo: 15 };
  const run = Runs.chooseTemplates(templates, { count: 20, seed: "w", domainWeights: weights });
  const counts = tally(run.templates, "domain");
  assert.equal(counts.psda, 1);
  assert.equal(run.templates.length, 20);
  assert.ok(counts.alg >= 7 && counts.adv >= 7 && counts.geo >= 3, JSON.stringify(counts));
  // A domain with no weight only fills seats nothing else can take.
  const unweighted = Runs.chooseTemplates(domainTemplates({ alg: 3, geo: 10 }), { count: 5, seed: "w", domainWeights: { alg: 1 } });
  assert.deepEqual(tally(unweighted.templates, "domain"), { alg: 3, geo: 2 });
  // Filters apply before weighting.
  const filtered = Runs.chooseTemplates(templates, { count: 20, seed: "w", domainWeights: weights, filters: { domains: ["geo"] } });
  assert.deepEqual(tally(filtered.templates, "domain"), { geo: 10 });
});

test("apportion caps a domain at its size and hands the rest out by weight", () => {
  assert.deepEqual(Runs.apportion(22, { a: 35, b: 35, c: 15, d: 15 }, { a: 20, b: 20, c: 20, d: 20 }, "s"),
    { a: 8, b: 8, c: 3, d: 3 });
  assert.deepEqual(Runs.apportion(10, { a: 1, b: 1 }, { a: 2, b: 20 }, "s"), { a: 2, b: 8 });
  assert.deepEqual(Runs.apportion(10, { a: 1, b: 1 }, { a: 2, b: 3 }, "s"), { a: 2, b: 3 });
  assert.deepEqual(Runs.apportion(4, { a: 0, b: 1 }, { a: 5, b: 5 }, "s"), { b: 4 });
});

test("a draw that throws or fails verification is retried, and a hopeless template is skipped", () => {
  const templates = fakeTemplates().slice(0, 3);
  const instantiate = (family, seed) => {
    const attempt = Number(seed.split(".").pop());
    if (family.id === "t0" && attempt < 2) return { templateId: family.id, verified: false };
    if (family.id === "t1" && attempt === 0) throw new Error("only 2 distinct distractors");
    if (family.id === "t2") return { templateId: family.id, verified: false };
    return { templateId: family.id, verified: true, attempt };
  };
  const questions = Runs.drawQuestions(templates, "r", instantiate, "p:");
  assert.deepEqual(questions.map((question) => question.templateId).sort(), ["t0", "t1"]);
  assert.equal(questions.find((question) => question.templateId === "t0").id, "p:t0:r.t0.2");
  assert.equal(questions.find((question) => question.templateId === "t1").attempt, 1);
  assert.deepEqual(questions.skipped, [{ templateId: "t2", reason: "unverified" }]);
  assert.deepEqual(questions.attempts, { t0: 2, t1: 1 });
  // The extra properties stay out of iteration and JSON.
  assert.deepEqual(Object.keys(questions), ["0", "1"]);
  assert.equal(JSON.parse(JSON.stringify(questions)).length, 2);
});

// A template whose scene is a function of its seed's attempt, over 14 scenes.
function sceneTemplate(id, bit) {
  return { id, bit, difficulty: "Hard", domain: "d", skill: "s", family: { id } };
}
const sceneOf = (seed) => `scene-${S.hashString(seed) % 14}`;
const sceneInstantiate = (family, seed) => ({ templateId: family.id, scene: sceneOf(seed), verified: true });

test("seen scenes are avoided when possible, else the one seen longest ago returns", () => {
  const template = sceneTemplate("w", 0);
  const first = Runs.drawQuestions([template], "k", sceneInstantiate, "");
  const shown = first[0].scene;
  const again = Runs.drawQuestions([template], "k", sceneInstantiate, "", { seenScenes: { w: [shown] } });
  assert.notEqual(again[0].scene, shown);
  const all = Array.from({ length: 14 }, (unused, index) => `scene-${index}`);
  const oldestFirst = all.filter((scene) => scene !== "scene-5").concat(["scene-5"]);
  const cycled = Runs.drawQuestions([template], "k", sceneInstantiate, "", { seenScenes: { w: oldestFirst } });
  // Every scene has been seen; within the attempts tried, the pick is the
  // oldest one reached.
  const reached = Array.from({ length: Runs.MAX_ATTEMPTS }, (unused, attempt) => sceneOf(`k.w.${attempt}`));
  const oldestReached = oldestFirst.find((scene) => reached.includes(scene));
  assert.equal(cycled[0].scene, oldestReached);
});

test("a run code carries the attempts a scene-steered draw used, and rebuilds it exactly", () => {
  const templates = [sceneTemplate("p", 0), sceneTemplate("q", 1), sceneTemplate("r", 2)];
  const mask = Mask.fromBits([0, 1, 2]);
  const plain = Runs.drawQuestions(templates, "z", sceneInstantiate, "x:");
  const seenScenes = Object.fromEntries(plain.map((question) => [question.templateId, [question.scene]]));
  const steered = Runs.drawQuestions(templates, "z", sceneInstantiate, "x:", { seenScenes });
  const code = Runs.runCode(mask, "z", steered.attempts, templates);
  assert.match(code, /^[0-9a-z]+-z-[0-9a-z]{3}$/);
  const parsed = Runs.parseRunCode(code, templates);
  const rebuilt = Runs.drawQuestions(Runs.templatesForMask(templates, parsed.mask), parsed.seed, sceneInstantiate, "x:", {
    attempts: parsed.attempts,
  });
  assert.deepEqual(rebuilt.map((question) => question.id), steered.map((question) => question.id));
  // Plain draws keep the two-part code, and old codes still parse.
  assert.equal(Runs.runCode(mask, "z", plain.attempts, templates), Runs.runCode(mask, "z"));
  assert.deepEqual(Runs.parseRunCode("7-z"), { mask, seed: "z" });
  assert.deepEqual(Runs.parseRunCode("7-z-012").attempts, [0, 1, 2]);
  assert.throws(() => Runs.parseRunCode("7-z-01", templates), SyntaxError);
});

test("catalog templates carry their registry version", () => {
  const templates = Runs.catalogTemplates(
    [{ id: "a", domain: "d", skill: "s" }, { id: "b", domain: "d", skill: "s" }, { id: "c", domain: "d", skill: "s" }],
    { templates: [{ id: "a", bit: 0, version: 3 }, { id: "b", bit: 1 }, { id: "c", bit: 2, retired: true }] },
  );
  assert.deepEqual(templates.map((template) => [template.id, template.bit, template.version]), [["a", 0, 3], ["b", 1, 1]]);
});
