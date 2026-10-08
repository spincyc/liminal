"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Assessment = require("../src/lib/assessment");
const Adapters = require("../src/lib/assessment-adapters");
const Core = require("../src/lib/core");
const Booklet = require("../src/lib/booklet");
const Ap = require("../src/lib/ap-assessment");
const F = require("./fixtures/ap-fixtures");

const question = (id, responseType = "multiple-choice") => ({ id, test: "ACT", sectionKey: "act-reading", section: "Reading",
  responseType, stem: "Which conclusion follows?", choices: ["First", "Second", "Third", "Fourth"], correctAnswer: 1,
  stimulus: { type: "passage", content: "The observed sequence is increasing.", teacherOnly: "PASSAGE SECRET" },
  figure: { svg: "<svg/>", alt: "Given diagram", teacherOnly: "FIGURE SECRET" },
  domain: "Key Ideas", skill: "Inference", explanation: "KEY SECRET", solutionSteps: ["STEP SECRET"],
  teacherOnly: "ITEM SECRET" });

test("one assessment traversal preserves source identity and each program's numbering", () => {
  const first = question("first"), second = question("second"), third = question("third");
  const form = [{ label: "Reading", minutes: 7, questions: [first, second] }, { label: "Math", minutes: 3, questions: [third] }];
  const model = Adapters.practiceForm(form);
  assert.deepEqual(Assessment.entries(model).map(entry => entry.number), [1, 2, 3]);
  assert.strictEqual(Assessment.entries(model)[0].item.source, first);
  const booklet = Booklet.buildModel(form, { id: "act-sample", test: "ACT" }, "fixed-seed");
  assert.deepEqual(booklet.sections.map(s => [s.firstNumber, s.lastNumber, s.minutes]), [[1, 2, 7], [3, 3, 3]]);
  assert.deepEqual(booklet.sections[0].questions[1].letters, ["F", "G", "H", "J"]);
  assert.strictEqual(booklet.sections[0].questions[0].question, first, "public models retain the original question, hence its identity fields");
  assert.equal(booklet.total, 3);
  assert.equal(booklet.minutes, 10);
  const ap = F.unitTest("calculus-bc", 10);
  const numbered = Assessment.entries(Adapters.apDocument(ap));
  assert.deepEqual(numbered.filter(e => e.item.scoring.kind === "binary").map(e => e.number), Array.from({ length: 12 }, (_, i) => i + 1));
  assert.deepEqual(numbered.filter(e => e.item.scoring.kind === "rubric").map(e => e.number), [1, 2]);
  assert.deepEqual(Assessment.totals(Adapters.apDocument(ap)), { items: 14, points: 30, minutes: 56 });
});

test("typed outcomes keep hinted answers, rubric points and unscored drafts distinct", () => {
  const choice = { kind: "binary", key: "B" };
  const rubric = { kind: "rubric", parts: [{ label: "a", points: 3 }, { label: "b", points: 2 }, { label: "c", points: 4 }] };
  const outcomes = [Assessment.outcome(choice, "B"), Assessment.outcome(choice, "B", { hinted: true }),
    Assessment.outcome(choice, null), Assessment.outcome(rubric, { a: 9, b: -2, c: 2.5 }),
    Assessment.outcome({ kind: "unscored" }, "PRIVATE DRAFT")];
  assert.deepEqual(outcomes[3].parts.map(part => part.earned), [3, 0, 0]);
  assert.deepEqual(Assessment.summarize(outcomes), { items: 5, answered: 4, scored: 4, unscored: 1, points: 12, earned: 4,
    binary: { items: 3, correct: 1, hintedCorrect: 1 }, rubric: { items: 1, points: 9, earned: 3 } });
  assert.equal(outcomes[3].correct, null, "manual partial credit is not binary correctness");
  assert.equal(JSON.stringify(outcomes).includes("PRIVATE DRAFT"), false, "an outcome contains completion, not essay text");
  assert.deepEqual(Assessment.outcome(rubric, {}).parts.map(part => part.earned), [0, 0, 0]);
  assert.throws(() => Assessment.outcome({ kind: "invented" }, "B"), /Unknown assessment scoring kind/);
});

test("numeric answer comparison stays with SAT and never falls back to generic equality", () => {
  const q = { ...question("numeric", "numeric"), test: "SAT", sectionKey: "sat-math", correctAnswer: "1/3" };
  const scoring = Adapters.practiceScoring(q);
  assert.throws(() => Assessment.outcome(scoring, ".3333"), /program's answer comparison/);
  assert.equal(Assessment.outcome(scoring, ".3333", { correct: Core.scoreResponse(q, ".3333") }).earned, 1);
  assert.equal(Assessment.outcome(scoring, ".33", { correct: Core.scoreResponse(q, ".33") }).earned, 0);
});

test("student projections discard future solution fields at every authored nesting level", () => {
  const doc = F.unitTest("physics-1", 1);
  doc.teacherOnly = "DOC SECRET";
  doc.sections[0].teacherOnly = "SECTION SECRET";
  doc.sections[0].parts[0].teacherOnly = "PART SECRET";
  const fr = doc.sections[1].parts[0].items[0];
  fr.teacherOnly = "ITEM SECRET";
  fr.parts[0].teacherOnly = "SUBPART SECRET";
  fr.parts[0].answerFigureIds = ["p1-u1-f2"];
  doc.figures.push({ id: "p1-u1-f2", alt: "ANSWER FIGURE SECRET", svg: "<svg/>" });
  const before = JSON.stringify(doc);
  const student = Ap.studentCopy(doc), key = Ap.keyCopy(doc);
  const text = JSON.stringify(student);
  for (const hidden of ["SECRET", "rubric", "topics", "answerFigureIds", "Fixture answer", "Fixture criterion", "Fixture step"]) assert.equal(text.includes(hidden), false, hidden);
  assert.ok(JSON.stringify(key).includes("ANSWER FIGURE SECRET"));
  student.sections[0].parts[0].items[0].choices[0] = "Changed projection";
  key.sections[1].parts[0].items[0].parts[0].rubric[0].criterion = "Changed key";
  assert.equal(JSON.stringify(doc), before, "projections cannot mutate authored data");
});

test("malformed solution collections remain validator diagnostics during shared traversal", t => {
  const scratch = path.join(__dirname, "../.scratch/assessment-platform");
  fs.mkdirSync(scratch, { recursive: true });
  const directory = fs.mkdtempSync(path.join(scratch, "invalid-solutions-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const pagesDir = path.join(directory, "pages");
  fs.mkdirSync(pagesDir);
  for (const [index, invalid] of [7, { unexpected: true }, null].entries()) {
    const doc = F.unitTest("calculus-ab", 1);
    doc.sections[1].parts[0].items[0].parts[0].steps = invalid;
    assert.equal(Ap.entries(doc).length, 14, "numbering does not require valid answer steps");
    const contentDir = F.writeContent(path.join(directory, "content-" + index), [doc]);
    const result = require("../tools/check-ap").loadAp({ contentDir, pagesDir });
    assert.ok(result.problems.some(problem => /\.steps/.test(problem)), JSON.stringify(result.problems));
  }
});

test("SAT and ACT student render callbacks receive only projected data; keys keep explanations", () => {
  for (const program of ["SAT", "ACT"]) {
    const q = { ...question("projection"), test: program, sectionKey: program === "SAT" ? "sat-reading-writing" : "act-reading" };
    const model = Booklet.buildModel([{ label: "Reading", minutes: 2, directions: "Choose.", questions: [q] }],
      { id: "sample", label: "Sample", test: program }, "same");
    const received = [];
    const render = { rich: (text, item) => { received.push(item); return text; },
      stimulus: (stimulus, item) => { received.push(item); return stimulus.content; },
      figure: (figure, item) => { received.push(item); return figure.alt; } };
    const html = Booklet.renderBookletHtml(model, { render });
    assert.ok(received.length > 0);
    assert.doesNotMatch(JSON.stringify(received), /SECRET|correctAnswer|domain|skill|explanation/);
    assert.doesNotMatch(html, /SECRET/);
    assert.match(Booklet.renderKeyHtml(model), /KEY SECRET/);
    assert.equal(model.sections[0].questions[0].question.correctAnswer, 1);
  }
});

test("the shared model and its real consumers load as ordered browser scripts", () => {
  const context = vm.createContext({});
  context.window = context;
  context.PRACTICE_CATALOG = require("../content/catalog.json");
  for (const name of ["core", "assessment", "assessment-adapters", "booklet", "ap-assessment", "test-engine"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/lib", name + ".js"), "utf8"), context, { filename: name + ".js" });
  }
  const q = question("browser");
  const booklet = context.PracticeBooklet.buildModel([{ label: "Reading", minutes: 2, questions: [q] }], { id: "act", test: "ACT" }, "browser");
  assert.equal(booklet.total, 1);
  const session = context.LiminalTestEngine.create({ questions: [q], now: () => 0 });
  session.select(1);
  assert.equal(session.summary().correct, 1);
  const ap = F.unitTest("calculus-bc", 10);
  assert.equal(context.LiminalAp.studentCopy(ap).tally.total.points, 30);
  assert.equal(context.LiminalAp.rawPoints(ap, { mc: { 1: "A" } }).sections[0].earned, 1);
});
