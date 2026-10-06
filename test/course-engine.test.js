"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../src/lib/courses/math.js");
const E = require("../src/lib/courses/engine.js");

const course = { id: "test-course", title: "Test course", version: 1, units: [
  { id: "one", lessons: [{ id: "a" }, { id: "b" }] },
] };
const template = (id, lessonId, size = 100000) => ({ id, lessonId, skill: "Addition", generate(rng) {
  const a = rng.int(1, size);
  return { prompt: `${id}: Add ${a} and 1.`, answer: String(a + 1), steps: ["Add one."], workLines: 3 };
} });
const templates = [template("aa", "a"), template("ab", "a"), template("bb", "b")];

test("course random helpers are reproducible and fractions exact", () => {
  const a = M.random("nights"); const b = M.random("nights");
  assert.deepEqual(Array.from({ length: 100 }, () => a.int(-4, 7)), Array.from({ length: 100 }, () => b.int(-4, 7)));
  for (let i = 0; i < 100; i++) assert.notEqual(a.nonzero(-3, 3), 0);
  assert.equal(M.fraction(6, -8), "−3/4");
  assert.equal(M.fraction(0, 7), "0");
  assert.throws(() => M.fraction(3, 0));
});

test("packet replay, balanced coverage, and no repeated visible exercises", () => {
  const options = { seed: "first-week", count: 20, days: 10, lessonIds: ["a", "b"] };
  const packet = E.generatePacket(course, templates, options);
  assert.deepEqual(packet, E.generatePacket(course, templates, options));
  const signatures = packet.flatMap(s => s.identities);
  assert.equal(new Set(signatures).size, 200);
  packet.forEach((sheet, index) => {
    assert.equal(sheet.day, index + 1);
    assert.equal(sheet.packetSeed, options.seed);
    assert.equal(sheet.questions.filter(q => q.lessonId === "a").length, 10);
    assert.deepEqual(sheet.questions.map(q => q.number), Array.from({ length: 20 }, (_, i) => i + 1));
    assert.ok(sheet.questions.filter(q => q.lessonId === "a").some(q => q.templateId === "ab"));
    assert.deepEqual(sheet.warnings, []);
  });
  assert.notDeepEqual(packet, E.generatePacket(course, templates, { ...options, seed: "second-week" }));
});

test("worksheet code binds version and lesson selection canonicalizes order", () => {
  const first = E.generateWorksheet(course, templates, { seed: "x", count: 8, lessonIds: ["a", "b"] });
  const reordered = E.generateWorksheet(course, templates, { seed: "x", count: 8, lessonIds: ["b", "a"] });
  assert.deepEqual(first, reordered);
  const revised = E.generateWorksheet({ ...course, revision: "new-version" }, templates, { seed: "x", count: 8 });
  assert.notEqual(first.code, revised.code);
});

test("finite pools disclose cross-night repetition and refuse within-sheet duplicates", () => {
  const fixed = [template("one", "a", 1)];
  const packet = E.generatePacket(course, fixed, { seed: "limited", count: 1, days: 2, lessonIds: ["a"] });
  assert.deepEqual(packet[0].warnings, []);
  assert.match(packet[1].warnings[0], /repeat/);
  assert.throws(() => E.generateWorksheet(course, fixed, { count: 2, lessonIds: ["a"] }), /too few distinct/);
});

test("invalid configuration and malformed generated items fail visibly", () => {
  for (const count of [0, -1, 101, 1.5, "no"]) assert.throws(() => E.generateWorksheet(course, templates, { count }));
  for (const days of [0, 31, 1.2]) assert.throws(() => E.generatePacket(course, templates, { days }));
  assert.throws(() => E.generateWorksheet(course, templates, { lessonIds: [] }));
  assert.throws(() => E.generateWorksheet(course, templates, { lessonIds: ["missing"] }));
  assert.throws(() => E.generateWorksheet(course, [], { lessonIds: ["a"] }));
  assert.throws(() => E.validateQuestion({ prompt: "P", answer: "A", steps: [], workLines: 3 }));
  assert.throws(() => E.validateGraph({ xMin: 0, xMax: 1, yMin: 0, yMax: 1, xStep: 0, yStep: 1 }));
});
