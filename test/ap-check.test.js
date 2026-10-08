"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const A = require("../src/lib/ap-assessment");
const F = require("./fixtures/ap-fixtures");
const { loadAp, disclaimerProblems } = require("../tools/check-ap");
const { build, bundle } = require("../tools/build-ap");

const ROOT = path.resolve(__dirname, "..");
function tempDir(t) { const dir = fs.mkdtempSync(path.join(os.tmpdir(), "liminal-ap-")); t.after(() => fs.rmSync(dir, { recursive: true, force: true })); return dir; }
function emptyPages(t) { return tempDir(t); }
function standardDocs() {
  return [F.unitTest("calculus-ab", 1), F.practiceExam("calculus-ab"), F.unitTest("physics-1", 1), F.unitTest("physics-c-mechanics", 2, { types: ["TBR", "EDA"] })];
}
function check(t, docs, { references = [], mutate, complete = false } = {}) {
  const dir = F.writeContent(path.join(tempDir(t), "content"), docs, references);
  if (mutate) mutate(dir);
  return loadAp({ contentDir: dir, pagesDir: emptyPages(t), complete });
}

test("the committed plan and pages pass; --complete reports the missing content", () => {
  const result = loadAp();
  assert.deepEqual(result.problems, []);
  for (const [prefix, count] of [["AB", 81], ["P1", 43], ["CM", 41]]) {
    assert.equal(result.plan.standards.filter(s => s.kind === "content" && s.id.startsWith(prefix + ".")).length, count, prefix + " topic count");
  }
  const units = result.plan.courses.map(c => c.units.filter(u => u.unit !== null).length);
  assert.deepEqual(units, [8, 8, 7]);
  const complete = loadAp({ complete: true });
  if (complete.assessments.length < 26) assert.ok(complete.problems.some(p => /missing \(required by --complete\)/.test(p)));
});

test("synthetic fixtures pass validation and build", t => {
  const docs = standardDocs();
  const dir = F.writeContent(path.join(tempDir(t), "content"), docs, [F.reference("physics-1")]);
  const result = loadAp({ contentDir: dir, pagesDir: emptyPages(t) });
  assert.deepEqual(result.problems, []);
  assert.equal(result.assessments.length, 4);
  assert.equal(result.assessments.find(d => d.id === "unit-1" && d.courseId === "calculus-ab").figures[0].svg, F.FIGURE_SVG, "figure SVG is attached for the build");
  const output = tempDir(t);
  const data = build({ output, contentDir: dir, pagesDir: emptyPages(t) });
  assert.deepEqual(data, bundle(result));
  assert.equal(data.plan, undefined, "the plan bundle is content/ap-plan.js from the weekly build");
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(output, "content/ap.js"), "utf8"), context);
  assert.equal(JSON.stringify(context.window.LIMINAL_AP), JSON.stringify(data));
  for (const entry of data.assessments) assert.ok(fs.existsSync(path.join(output, entry.file)), entry.file);
  assert.deepEqual(data.assessments.find(a => a.id === "practice-exam"), { courseId: "calculus-ab", id: "practice-exam", kind: "practice-exam",
    title: "Practice exam (fixture)", mc: 42, fr: 6, minutes: 190, points: 96, file: "content/ap/assessments/calculus-ab/practice-exam.json" });
  assert.ok(fs.existsSync(path.join(output, "content/ap/references/physics-1.json")));
});

test("the validator rejects malformed assessments", t => {
  const cases = [
    [doc => { doc.sections[1].parts[0].items[0].parts[0].rubric[0].points = 2; }, /rubric totals 4 points; the part is worth 3/],
    [doc => { doc.sections[0].parts[0].items[2].id = "ab-u1-mc09"; }, /ID must be ab-u1-mc03/],
    [doc => { doc.sections[0].parts[0].items[0].choices[1] = "1.0"; }, /choices must be distinct/],
    [doc => { doc.sections[0].parts[0].items[0].topics = ["AB.REVIEW"]; }, /not a framework topic of this course: AB.REVIEW/],
    [doc => { doc.sections[0].parts[0].items[0].topics = ["P1.1.1"]; }, /not a framework topic of this course: P1.1.1/],
    [doc => { doc.sections[0].parts[0].items[0].prompt = "Use <b>bold</b> text."; }, /non-plain text/],
    [doc => { doc.sections[0].parts[0].items[0].prompt = "Solve \\(x^2\\) now."; }, /LaTeX delimiters/],
    [doc => { doc.directions = "This official practice test predicts your score."; }, /banned claim \(predict-score\)/],
    [doc => { doc.figures[0].alt = "A graph that rises to 12.1 units."; doc.sections[0].parts[0].items[1].choices[1] = "12.1 units"; }, /alt text states the answer/],
    [doc => { doc.sections[0].parts[0].items[0].figureIds = ["ab-u1-f7"]; }, /undeclared figure ab-u1-f7/],
    [doc => { doc.sections[0].parts[0].calculator = "any"; }, /must be one of none, graphing/],
    [doc => { doc.sections[0].parts[0].items[0].distractorNotes = { B: "x" }; }, /needs a note for each wrong choice/],
    [doc => { doc.sections[1].parts[0].items[0].type = "MR"; }, /Calculus AB free response has no type/],
    [doc => { doc.unitId = "u2"; }, /must be u1/],
    [doc => { doc.sections[0].parts[0].items.forEach(i => { i.key = "A"; }); }, /key balance: key A is/],
  ];
  for (const [mutate, pattern] of cases) {
    const doc = F.unitTest("calculus-ab", 1);
    mutate(doc);
    const result = check(t, [doc]);
    assert.ok(result.problems.some(p => pattern.test(p)), pattern + " not reported in:\n" + result.problems.join("\n"));
  }
});

test("duplicates, figure files and unexpected files are caught", t => {
  const copy = F.unitTest("calculus-ab", 2);
  copy.sections[0].parts[0].items[0].prompt = F.unitTest("calculus-ab", 1).sections[0].parts[0].items[0].prompt;
  let result = check(t, [F.unitTest("calculus-ab", 1), copy]);
  assert.ok(result.problems.some(p => /ab-u2-mc01: duplicates calculus-ab\/unit-1\/ab-u1-mc01/.test(p)), result.problems.join("\n"));
  result = check(t, [F.unitTest("calculus-ab", 1)], { mutate: dir => fs.rmSync(path.join(dir, "ap/figures/calculus-ab/ab-u1-f1.svg")) });
  assert.ok(result.problems.some(p => /missing file content\/ap\/figures\/calculus-ab\/ab-u1-f1.svg/.test(p)));
  result = check(t, [F.unitTest("calculus-ab", 1)], { mutate: dir => fs.writeFileSync(path.join(dir, "ap/figures/calculus-ab/ab-u1-f9.svg"), F.FIGURE_SVG) });
  assert.ok(result.problems.some(p => /ab-u1-f9.svg: orphan figure/.test(p)));
  result = check(t, [F.unitTest("calculus-ab", 1)], { mutate: dir => fs.writeFileSync(path.join(dir, "ap/figures/calculus-ab/ab-u1-f1.svg"), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><line x1="0" y1="0" x2="9" y2="9" stroke="red"/></svg>') });
  assert.ok(result.problems.some(p => /use currentColor/.test(p)), result.problems.join("\n"));
  result = check(t, [F.unitTest("calculus-ab", 1)], { mutate: dir => fs.writeFileSync(path.join(dir, "ap/assessments/calculus-ab/unit-9.json"), "{}") });
  assert.ok(result.problems.some(p => /unexpected file unit-9.json/.test(p)));
  // A weekly worksheet item repeated in a test.
  const weekly = { weeks: [{ week: 1, standards: ["AB.1.1"], examples: [], worksheets: [{ id: "a", items: [{ id: "ab-w01-a1", prompt: F.unitTest("calculus-ab", 1).sections[0].parts[0].items[3].prompt, choices: ["4.0", "14.1", "24.2", "34.3"] }] }] }] };
  result = check(t, [F.unitTest("calculus-ab", 1)], { mutate: dir => { fs.mkdirSync(path.join(dir, "weekly/ap"), { recursive: true }); fs.writeFileSync(path.join(dir, "weekly/ap/calculus-ab.json"), JSON.stringify(weekly)); } });
  assert.ok(result.problems.some(p => /ab-u1-mc04: duplicates calculus-ab weekly week 1 sheet a ab-w01-a1/.test(p)), result.problems.join("\n"));
});

test("--complete requires every assessment, reference, topic and free-response rotation", t => {
  const result = check(t, standardDocs(), { complete: true });
  const text = result.problems.join("\n");
  assert.match(text, /calculus-ab\/unit-2: missing/);
  assert.match(text, /physics-1\/reference: missing/);
  assert.match(text, /calculus-ab: topics without a test item/);
  assert.match(text, /calculus-ab: topics without a week/);
  assert.match(text, /physics-1: unit tests need each free-response type at least 3 times/);
});

test("formula references are validated", t => {
  const bad = F.reference("physics-1");
  bad.groups[0].rows[0].units = "";
  bad.intro = "Guaranteed to cover the exam.";
  const result = check(t, [], { references: [bad] });
  assert.ok(result.problems.some(p => /0\.units: missing text/.test(p)));
  assert.ok(result.problems.some(p => /banned claim \(guarantee\)/.test(p)));
});

test("pages that use the AP® marks carry the exact disclaimer", t => {
  const dir = tempDir(t);
  fs.writeFileSync(path.join(dir, "a.html"), "<p>Courses for AP&reg; exams</p>");
  fs.writeFileSync(path.join(dir, "b.html"), "<p>Courses for AP® exams</p><footer>" + A.DISCLAIMER.replace("&", "&amp;") + "</footer>");
  fs.writeFileSync(path.join(dir, "c.html"), "<p>No marks here.</p>");
  fs.writeFileSync(path.join(dir, "d.html"), '<h3>Courses for AP<span class="registered">®</span> exams</h3>');
  assert.deepEqual(disclaimerProblems(dir), ["a.html: uses the AP® marks without the exact disclaimer", "d.html: uses the AP® marks without the exact disclaimer"]);
  assert.deepEqual(disclaimerProblems(path.join(ROOT, "src")).filter(p => p.startsWith("ap.html")), []);
});
