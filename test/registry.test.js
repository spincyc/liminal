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

test("source fingerprints catch rare branches and transitive, dormant dependencies", (t) => {
  const fs = require("node:fs");
  const path = require("node:path");
  const { sourceFingerprint, sourceFiles } = require("../tools/lib/fingerprint");
  const scratch = path.join(__dirname, "..", ".scratch");
  fs.mkdirSync(scratch, { recursive: true });
  const root = fs.mkdtempSync(path.join(scratch, "fingerprint-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const entry = path.join(root, "family.js");
  const helper = path.join(root, "helper.js");
  const data = path.join(root, "data.json");
  fs.writeFileSync(entry, 'if (false) require("./helper"); module.exports = { rare: "old" };\n');
  fs.writeFileSync(helper, 'module.exports = require("./data.json");\n');
  fs.writeFileSync(data, '{"offset":1}\n');
  const old = sourceFingerprint(root, [entry], "demo");
  assert.deepEqual(sourceFiles(root, [entry]).map(([file]) => file), ["data.json", "family.js", "helper.js"]);
  const instantiate = (f, seed) => ({ stem: seed === "rare" ? f.rare : "same" });
  assert.equal(templateFingerprint({ rare: "old" }, instantiate), templateFingerprint({ rare: "new" }, instantiate), "eight observations miss this edit");
  fs.writeFileSync(entry, 'if (false) require("./helper"); module.exports = { rare: "new" };\n');
  assert.notEqual(sourceFingerprint(root, [entry], "demo"), old);
  const second = sourceFingerprint(root, [entry], "demo");
  fs.writeFileSync(data, '{"offset":2}\n');
  assert.notEqual(sourceFingerprint(root, [entry], "demo"), second, "even an unexecuted transitive data dependency matters");
  assert.equal(sourceFingerprint(root, [entry], "demo"), sourceFingerprint(root, [entry], "demo"));
  fs.writeFileSync(entry, 'module.exports = require(variable);\n');
  assert.throws(() => sourceFingerprint(root, [entry], "demo"), /static local/);
  for (const source of [
    'module.exports = require.call(null, "./helper");',
    'const load = require; module.exports = load("./helper");',
    'module.exports = module["require"]("./helper");',
    'module.exports = `text ${require.call(null, "./helper")}`;',
  ]) {
    fs.writeFileSync(entry, source);
    assert.throws(() => sourceFingerprint(root, [entry], "demo"), /static local/);
  }
  fs.writeFileSync(entry, '// Stories require reading.\nmodule.exports = `The passages require evidence. ${require("./helper").offset}`;\n');
  assert.deepEqual(sourceFiles(root, [entry]).map(([file]) => file), ["data.json", "family.js", "helper.js"]);
});

test("migration uses baseline source evidence and cannot hide subsequent changes", () => {
  const { SOURCE_ALGORITHM } = require("../tools/lib/fingerprint");
  const oldSource = "a".repeat(64);
  const newSource = "b".repeat(64);
  const start = { sectionKey: "s", templates: [{ id: "a", bit: 7, version: 4, fingerprint: "legacy" }] };
  const options = { algorithm: SOURCE_ALGORITHM, rehash: true, baselineOf: () => ({ legacy: "legacy", source: oldSource }) };
  assert.throws(() => updateRegistry(start, [{ id: "a" }], () => oldSource, { algorithm: SOURCE_ALGORITHM }), /--rehash/);
  assert.throws(() => updateRegistry(start, [{ id: "a" }], () => oldSource, { ...options, baselineOf: () => ({ legacy: "wrong" }) }), /baseline does not match/);
  const migrated = updateRegistry(start, [{ id: "a" }], () => oldSource, options).registry;
  assert.equal(migrated.templates[0].version, 4, "changing hash algorithms alone does not bump");
  assert.equal(migrated.templates[0].bit, 7);
  assert.equal(migrated.templates[0].fingerprintAlgorithm, SOURCE_ALGORITHM);
  assert.deepEqual(updateRegistry(migrated, [{ id: "a" }], () => oldSource, options).changes, []);
  assert.equal(updateRegistry(start, [{ id: "a" }], () => newSource, options).registry.templates[0].version, 5, "an unsampled edit since baseline still bumps");
  assert.equal(updateRegistry(migrated, [{ id: "a" }], () => newSource, options).registry.templates[0].version, 5, "rehash cannot hide source-v1 changes");
});

test("registry rejects corrupt inputs before repairing or writing them", () => {
  assert.throws(() => updateRegistry({ templates: [{ id: "a", bit: 0, version: 0 }] }, [{ id: "a" }], () => "x"), /invalid version/);
  assert.throws(() => updateRegistry({ templates: [] }, [{ id: "a" }, { id: "a" }], () => "x"), /duplicate live/);
  assert.deepEqual(registryProblems({}), ["registry needs a templates array"]);
  assert.match(registryProblems({ templates: [{ id: "a", bit: 0, fingerprintAlgorithm: "source-v1", fingerprint: "short" }] }).join("\n"), /invalid source fingerprint/);
});
