"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { recordErrors, SECTIONS } = require("../tools/check-families");
const { loadCatalog, loadBank, validateQuestion, bankSections } = require("../tools/lib/content");
const S = require("../src/lib/families/shared");
const catalog = loadCatalog();
const math = catalog.sections.find((section) => section.key === "act-mathematics");
const valid = loadBank(math.key).find((question) => question.responseType === "multiple-choice");
const errors = (overrides) => validateQuestion({ ...valid, ...overrides }, math, catalog).join("\n");

test("bank verification rejects nonfinite recomputation and malformed inputs", () => {
  for (const verification of [
    { kind: "linear-equation", inputs: [], expected: 4 },
    { kind: "linear-equation", inputs: [0, 0, 0], expected: 4 },
    { kind: "mean", inputs: [], expected: 0 },
    { kind: "sum", inputs: [Infinity], expected: Infinity },
    { kind: "sum", inputs: [2, 2], expected: NaN },
  ]) assert.match(errors({ verification }), /verification/);
  assert.equal(errors({ verification: { kind: "linear-equation", inputs: [2, 3, 11], expected: 4 } }), "");
});

test("malformed choice values produce useful validation errors without throwing", () => {
  assert.match(errors({ choices: [null, 4, "x", "y"] }), /nonempty strings/);
});

test("numeric answers must represent a finite number", () => {
  for (const answer of ["anything", "1/0", Infinity, NaN]) {
    assert.match(validateQuestion({ ...valid, responseType: "numeric", choices: null, distractorRationales: null, correctAnswer: answer }, math, catalog).join("\n"), /finite number/);
  }
});

test("template admission requires every teaching field and distractor reason", () => {
  const family = { id: "example", title: "example title", recognize: "Recognize the relationship.", build: () => ({
    responseType: "multiple-choice", correct: 4, wrong: [[1, "a"], [2, "b"], [3, "c"]], stem: "Which value?",
    hint: "Compare values.", explanation: "The value is four.", steps: ["One", "Two"], principles: ["A rule"], trap: "Avoid a slip.", verify: () => true,
  }) };
  const record = S.instantiate(family, 0);
  assert.deepEqual(recordErrors(family, record, SECTIONS["sat-math"]), []);
  for (const field of ["hint", "explanation", "trap", "strategy", "stem"]) {
    const missing = { ...record };
    delete missing[field];
    assert.match(recordErrors(family, missing, SECTIONS["sat-math"]).join("\n"), new RegExp(`${field} is required`));
  }
  assert.match(recordErrors(family, { ...record, distractorRationales: [] }, SECTIONS["sat-math"]).join("\n"), /rationales/);
});

test("active bank audits exclude archived SAT while archives remain available", () => {
  assert.deepEqual(bankSections(catalog).map((section) => section.key), catalog.sections.filter((section) => section.test === "ACT" && section.practiceAvailable !== false).map((section) => section.key));
  assert.equal(bankSections(catalog, { includeRetired: true }).length, catalog.sections.length);
  assert.ok(loadBank("sat-math").length > 0);
});

test("quantitative duplicate tokens retain small signed and decimal parameters", () => {
  const { tokenSet, jaccard, duplicateErrors } = require("../tools/lib/content");
  const question = (stem, id = "a") => ({ id, section: "Mathematics", sectionKey: "act-mathematics", stem, stimulus: null });
  const first = tokenSet(question("Solve 2x + 3 = 11."));
  const second = tokenSet(question("Solve 5x + 7 = 22."));
  assert.ok(first.has("number:2") && first.has("number:3") && first.has("x"));
  assert.ok(jaccard(first, second) < 0.9);
  assert.notDeepEqual(tokenSet(question("Evaluate 2.5x.")), tokenSet(question("Evaluate 5.2x.")));
  assert.notDeepEqual(tokenSet(question("Evaluate −2x.")), tokenSet(question("Evaluate 2x.")));
  assert.deepEqual(tokenSet(question("Evaluate −2x.")), tokenSet(question("Evaluate -2x.")));
  assert.deepEqual(tokenSet(question("Evaluate 1,200x.")), tokenSet(question("Evaluate 1200x.")));
  assert.deepEqual(duplicateErrors([question("Solve 2x + 3 = 11.", "a"), question("Solve 5x + 7 = 22.", "b")]), []);
  assert.match(duplicateErrors([question("Solve 2x + 3 = 11.", "a"), question("Solve 2x + 3 = 11.", "b")]).join("\n"), /Near duplicate/);
});

test("browser parity rejects missing registry members, label drift, and changed seeded output", () => {
  const { templateParityProblems } = require("../tools/lib/template-parity");
  const family = { id: "a", difficulty: "Easy", domain: "d", skill: "s", subskill: "u" };
  const instantiate = () => ({ verified: true, stem: "same" });
  const options = { sectionKey: "s", families: [family], nodeFamilies: [family], registry: { templates: [{ ...family, bit: 0, version: 1 }] }, instantiate, nodeInstantiate: instantiate };
  assert.deepEqual(templateParityProblems(options), []);
  assert.match(templateParityProblems({ ...options, registry: { templates: [...options.registry.templates, { ...family, id: "b" }] } }).join("\n"), /ids differ/);
  assert.match(templateParityProblems({ ...options, families: [{ ...family, difficulty: "Hard" }] }).join("\n"), /difficulty differs/);
  assert.match(templateParityProblems({ ...options, instantiate: () => ({ verified: true, stem: "changed" }) }).join("\n"), /seeded output differs/);
});

test("active admission keeps numerical equivalence and original answer-tell limits", () => {
  const { numericalChoiceDuplicates } = require("../tools/lib/content");
  const { admissionFailures, templateFamily } = require("../tools/audit-questions");
  assert.equal(numericalChoiceDuplicates(["0.5", "1/2", "2", "3"]), true);
  assert.equal(numericalChoiceDuplicates(["−3", "-3", "2", "3"]), true);
  assert.equal(numericalChoiceDuplicates(["0.5", "0.5001", "2", "3"]), false);
  assert.match(errors({ choices: ["0.5", "1/2", "2", "3"] }), /numerically equivalent/);
  assert.deepEqual(admissionFailures({ failures: ["near-duplicate rate", "exact duplicates", "answerable without reading"] }), ["exact duplicates", "answerable without reading"]);
  assert.equal(templateFamily({ tags: ["templateFamily:algebra/design"] }), "algebra/design");
});

test("SAT passage length uses six-character words across the entire pair", () => {
  const { passageCharacterCount } = require("../tools/check-families");
  assert.equal(passageCharacterCount(`Text 1\n${"a".repeat(450)}\n\nText 2\n${"b".repeat(450)}`), 900);
  assert.equal(passageCharacterCount("Text 1\nA  B\n\nText 2\nC\nD"), 6);
  assert.equal(passageCharacterCount("π−“x”"), 5);
  const record = { responseType: "multiple-choice", stem: "Which choice?", choices: ["a", "b", "c", "d"], correctAnswer: 0,
    hint: "h", explanation: "e", strategy: "s", trap: "t", solutionSteps: ["one", "two"], principles: ["p"], scene: "scene",
    distractorRationales: [{ index: 1, reason: "b" }, { index: 2, reason: "c" }, { index: 3, reason: "d" }],
    stimulus: { type: "paired-passages", content: `Text 1\n${"a".repeat(450)}\n\nText 2\n${"b".repeat(451)}` } };
  assert.match(recordErrors({ title: "Different" }, record, SECTIONS["sat-reading-writing"]).join("\n"), /901 characters/);
});
