"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../src/lib/families/shared");
const { FINGERPRINT_SEEDS, canonicalJson, templateFingerprint } = require("../tools/lib/fingerprint");
const { registryProblems, updateRegistry } = require("../tools/lib/registry");

function family(id, text) {
  return {
    id,
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "x",
    build(t) {
      const value = t.int(1, 9);
      return {
        responseType: "numeric",
        stem: `${text} ${value}?`,
        hint: "h",
        explanation: "e",
        steps: ["a", "b"],
        principles: ["p"],
        trap: "t",
        correct: value,
        verify: () => value > 4,
      };
    },
  };
}

test("a fingerprint hashes what the student sees for the fixed seeds", () => {
  assert.deepEqual(FINGERPRINT_SEEDS, ["fp-0", "fp-1", "fp-2", "fp-3", "fp-4", "fp-5", "fp-6", "fp-7"]);
  const base = templateFingerprint(family("a", "What is"), S.instantiate);
  assert.match(base, /^[0-9a-f]{16}$/);
  assert.equal(templateFingerprint(family("a", "What is"), S.instantiate), base);
  assert.notEqual(templateFingerprint(family("a", "What was"), S.instantiate), base);
  // `verified` is a check's outcome, not the question.
  const flipped = family("a", "What is");
  const build = flipped.build;
  flipped.build = (t) => ({ ...build(t), verify: () => false });
  assert.equal(templateFingerprint(flipped, S.instantiate), base);
  // Relabeling a template's tier is metadata, not a new question.
  assert.equal(templateFingerprint({ ...family("a", "What is"), difficulty: "Easy" }, S.instantiate), base);
  // A seed that throws still fingerprints, by its message.
  const broken = { ...family("a", "x"), build: () => { throw new Error("boom"); } };
  assert.match(templateFingerprint(broken, S.instantiate), /^[0-9a-f]{16}$/);
  assert.equal(canonicalJson({ b: 1, a: [undefined, { d: 2, c: 3 }] }), '{"a":[null,{"c":3,"d":2}],"b":1}');
});

test("the registry appends, fingerprints, re-versions, retires and restores", () => {
  const prints = { a: "aaaa", b: "bbbb", c: "cccc" };
  const fingerprintOf = (entry) => prints[entry.id];
  const start = { sectionKey: "s", templates: [{ id: "a", bit: 0 }, { id: "b", bit: 1, version: 2 }] };
  const first = updateRegistry(start, [{ id: "a" }, { id: "b" }, { id: "c" }], fingerprintOf);
  assert.deepEqual(first.registry.templates, [
    { id: "a", bit: 0, version: 1, fingerprint: "aaaa" },
    { id: "b", bit: 1, version: 2, fingerprint: "bbbb" },
    { id: "c", bit: 2, version: 1, fingerprint: "cccc" },
  ]);
  assert.equal(first.changes.length, 3);
  assert.deepEqual(start.templates[0], { id: "a", bit: 0 }, "the input is not modified");
  assert.deepEqual(updateRegistry(first.registry, [{ id: "a" }, { id: "b" }, { id: "c" }], fingerprintOf).changes, []);

  prints.b = "b2b2";
  const second = updateRegistry(first.registry, [{ id: "a" }, { id: "b" }], fingerprintOf);
  assert.deepEqual(second.registry.templates.slice(1), [
    { id: "b", bit: 1, version: 3, fingerprint: "b2b2" },
    { id: "c", bit: 2, version: 1, fingerprint: "cccc", retired: true },
  ]);
  const third = updateRegistry(second.registry, [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }], fingerprintOf);
  assert.deepEqual(third.registry.templates.slice(2).map((entry) => [entry.id, entry.bit, entry.retired || false]),
    [["c", 2, false], ["d", 3, false]]);
  assert.deepEqual(registryProblems(third.registry), []);
  assert.deepEqual(registryProblems({ templates: [{ id: "a", bit: 0 }, { id: "b", bit: 0, version: 0 }] }),
    ["bit 0 is used twice", "b has an invalid version"]);
});
