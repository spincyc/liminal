"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { ROOT, loadCatalog, loadBank, loadArchive, loadRuntimeBank, loadPassages, hydrateBank, coverageReport,
  coverageErrors, validateFigure, validateQuestion, archiveSection } = require("../tools/lib/content");
const { assembleScience, answerPositions, arrangeQuestion, fingerprintQuestion, SOURCE_ALGORITHM,
  ARCHIVE_SHA256, outputProblems } = require("../tools/generators/generate-act-science");
const { scienceProblems, reviewProblems, expectedAuthor } = require("../tools/check-science");
const { bankBundle } = require("../tools/build-content");

const sectionKey = "act-science";
const fixtureFigure = { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><line x1="1" y1="1" x2="18" y2="18" stroke="currentColor"/></svg>', alt: "A line between two labeled measurements.", notToScale: false };

test("Science archive preserves its exact original bytes, IDs and historical taxonomy", () => {
  const bytes = fs.readFileSync(path.join(ROOT, "content/archive/act-science.json"));
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), ARCHIVE_SHA256);
  const archived = loadArchive(sectionKey), active = loadBank(sectionKey);
  assert.equal(archived.length, 575);
  assert.equal(archived[0].id, "act-science-0001");
  assert.equal(archived.at(-1).id, "act-science-0575");
  const activeIds = new Set(active.map((question) => question.id));
  assert.equal(archived.some((question) => activeIds.has(question.id)), false);
  const catalog = loadCatalog(), policy = archiveSection(catalog.sections.find((section) => section.key === sectionKey));
  assert.ok(policy.domains.some((domain) => domain.name === "Evaluation of Models, Inferences, and Experimental Results"));
  assert.deepEqual(archived.flatMap((question) => validateQuestion(question, policy, { ...catalog, contentVersion: policy.contentVersion })), []);
});

test("active Science output reproduces all authored records and passes structural admission", () => {
  const assembled = assembleScience();
  assert.deepEqual(outputProblems(ROOT, assembled), []);
  assert.deepEqual(scienceProblems(assembled, loadCatalog()), []);
  assert.equal(assembled.questions[0].id, "act-science-0576");
  assert.equal(assembled.questions.at(-1).id, "act-science-0655");
});

test("assembler rejects an incomplete authored batch before generating replacement records", () => {
  const scratch = path.join(ROOT, ".scratch/science-tooling");
  fs.mkdirSync(scratch, { recursive: true });
  const root = fs.mkdtempSync(path.join(scratch, "incomplete-"));
  try {
    const sources = path.join(root, "content/sources/act-science");
    fs.mkdirSync(sources, { recursive: true });
    fs.writeFileSync(path.join(root, "content/catalog.json"), JSON.stringify(loadCatalog()));
    for (const file of ["data", "research-a", "research-b", "viewpoints"]) {
      fs.writeFileSync(path.join(sources, `${file}.js`), "module.exports = [{ questions: [] }];\n");
    }
    assert.throws(() => assembleScience(root), /requires 14 complete passage sets and 80 questions/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("section-specific coverage targets leave other sections at the catalog defaults", () => {
  const catalog = loadCatalog(), science = catalog.sections.find((section) => section.key === sectionKey);
  const report = coverageReport(loadBank(sectionKey), catalog);
  assert.equal(report[sectionKey].total, 80);
  assert.equal(report[sectionKey].target, 80);
  assert.equal(report["act-reading"].target, 575);
  assert.deepEqual(report[sectionKey].difficultyTargets, science.difficultyTargets);
  assert.deepEqual(coverageErrors(loadBank(sectionKey), { ...catalog, sections: [science] }, true), []);
  const shortage = loadBank(sectionKey).slice(1);
  assert.ok(coverageErrors(shortage, { ...catalog, sections: [science] }, true).some((error) => /expected 80, found 79/.test(error)));
});

test("answer allocation is balanced globally and per tier without a repeating four-letter cycle", () => {
  const questions = [19, 42, 19].flatMap((count, tier) => Array.from({ length: count }, () => ({ difficulty: ["Easy", "Medium", "Hard"][tier] })));
  const first = answerPositions(questions), second = answerPositions(questions);
  assert.deepEqual(first, second);
  const all = [...first.values()];
  assert.deepEqual([0, 1, 2, 3].map((letter) => all.filter((value) => value === letter).length), [20, 20, 20, 20]);
  for (const tier of ["Easy", "Medium", "Hard"]) {
    const positions = questions.flatMap((question, index) => question.difficulty === tier ? [first.get(index)] : []);
    const counts = [0, 1, 2, 3].map((letter) => positions.filter((value) => value === letter).length);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
    assert.ok(positions.some((value, index) => index >= 4 && value !== positions[index - 4]));
  }
});

test("shuffling choices preserves each authored wrong-answer rationale", () => {
  const source = { choices: ["alpha", "beta", "gamma", "delta"], correctAnswer: 2,
    distractorRationales: [{ index: 0, reason: "alpha error" }, { index: 1, reason: "beta error" }, { index: 3, reason: "delta error" }] };
  const wrongOrders = new Set();
  for (let index = 0; index < 12; index += 1) {
    const arranged = arrangeQuestion(source, index % 4, `sample-${index}`);
    assert.equal(arranged.choices[arranged.correctAnswer], "gamma");
    arranged.distractorRationales.forEach((entry) => assert.equal(entry.reason, `${arranged.choices[entry.index]} error`));
    wrongOrders.add(arranged.choices.filter((choice) => choice !== "gamma").join(","));
  }
  assert.ok(wrongOrders.size > 1);
  assert.deepEqual(source.choices, ["alpha", "beta", "gamma", "delta"]);
});

test("shared passage figures hydrate identically in Node and browser with archived IDs intact", () => {
  const bank = loadRuntimeBank(sectionKey), passages = loadPassages(sectionKey), nodeBank = hydrateBank(sectionKey);
  const sandbox = { window: {} };
  vm.runInNewContext(bankBundle(sectionKey, bank, passages), sandbox);
  const browserBank = sandbox.window.PRACTICE_BANKS[sectionKey];
  assert.equal(browserBank.length, 655);
  assert.deepEqual(JSON.parse(JSON.stringify(browserBank)), nodeBank);
  const passage = passages.find((entry) => entry.figure);
  const set = browserBank.filter((question) => question.passageId === passage.id);
  assert.ok(set.length >= 5);
  assert.equal(set[0].figure, set[1].figure);
  assert.equal(set[0].stimulus, set[1].stimulus);
  assert.equal(browserBank[0].id, "act-science-0001");
  assert.equal(bank.filter((question) => question.passageId).some((question) => Object.hasOwn(question, "figure")), false);
});

test("SVG admission accepts supported geometry and refuses malformed or unsafe source", () => {
  assert.deepEqual(validateFigure(fixtureFigure), []);
  for (const svg of ['<svg><script>alert(1)</script></svg>', '<svg onload="alert(1)"/>', '<svg><image href="https://example.com/image"/></svg>', '<svg><line style="stroke:red"/></svg>', '<svg><line stroke="url(#remote)"/></svg>', '<svg><line></svg>', '<svg xmlns="http://example.com/not-svg"/>']) {
    assert.ok(validateFigure({ ...fixtureFigure, svg }).length, svg);
  }
  assert.ok(validateFigure({ ...fixtureFigure, alt: "" }).length);
});

function reviewedFixture() {
  const question = { id: "act-science-0576", passageId: "act-science-p001", correctAnswer: 2, choices: ["a", "b", "c", "d"], explanation: "A test fixture explanation.", difficulty: "Easy" };
  const passage = { id: "act-science-p001", content: "A test fixture passage.", figure: fixtureFigure };
  return { assembled: { questions: [question], passages: [passage] }, manifest: { format: "liminal-science-reviews", version: 1, reviews: [{
    questionId: question.id, fingerprintAlgorithm: SOURCE_ALGORITHM, fingerprint: fingerprintQuestion(question, passage),
    author: expectedAuthor(passage.id), reviewer: "independent-test-reviewer", reviewedAt: "2026-10-03",
    method: "independent-agent-blind-solve", verdict: "accepted", answer: 2, answerText: "c", evidence: "docs/reviews/science-test-fixture.md",
  }] } };
}

test("review gate refuses missing, duplicate, dependent and incorrect blind answers", () => {
  const fixture = reviewedFixture();
  assert.deepEqual(reviewProblems(fixture.manifest, fixture.assembled, () => true), []);
  for (const edit of [
    (manifest) => { manifest.reviews = []; },
    (manifest) => { manifest.reviews.push({ ...manifest.reviews[0] }); },
    (manifest) => { manifest.reviews[0].reviewer = manifest.reviews[0].author; },
    (manifest) => { manifest.reviews[0].answer = 1; },
    (manifest) => { manifest.reviews[0].answerText = "a"; },
    (manifest) => { manifest.reviews[0].reviewedAt = "2026-02-31"; },
    (manifest) => { manifest.reviews[0].evidence = "../outside.md"; },
  ]) {
    const manifest = structuredClone(fixture.manifest); edit(manifest);
    assert.ok(reviewProblems(manifest, fixture.assembled, () => true).length);
  }
  assert.ok(reviewProblems(fixture.manifest, fixture.assembled, () => false).length);
});

test("passage, figure, difficulty, answer and teaching edits invalidate independent review", () => {
  const fixture = reviewedFixture();
  for (const edit of [
    (assembled) => { assembled.passages[0].content += " Changed context."; },
    (assembled) => { assembled.passages[0].figure.alt += " Changed display."; },
    (assembled) => { assembled.questions[0].difficulty = "Hard"; },
    (assembled) => { assembled.questions[0].correctAnswer = 1; },
    (assembled) => { assembled.questions[0].explanation += " Changed guidance."; },
  ]) {
    const assembled = structuredClone(fixture.assembled); edit(assembled);
    assert.ok(reviewProblems(fixture.manifest, assembled, () => true).some((problem) => /stale/.test(problem)));
  }
});

test("Science structural gate refuses removed passage links, missing subskills and unsafe figures", () => {
  const assembled = assembleScience(), catalog = loadCatalog();
  const broken = structuredClone(assembled);
  broken.questions[0].passageId = null;
  assert.ok(scienceProblems(broken, catalog).some((problem) => /shared passage/.test(problem)));
  broken.questions.filter((question) => question.subskill === "diagrams").forEach((question) => { question.subskill = "tables"; });
  assert.ok(scienceProblems(broken, catalog).some((problem) => /diagrams.*missing|diagrams.*needs/.test(problem)));
  broken.passages.find((passage) => passage.figure).figure.svg = '<svg onload="alert(1)"/>';
  assert.ok(scienceProblems(broken, catalog).some((problem) => /sanitizer drops/.test(problem)));
});
