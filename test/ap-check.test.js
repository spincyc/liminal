"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const A = require("../src/lib/ap-assessment");
const F = require("./fixtures/ap-fixtures");
const { loadAp, disclaimerProblems } = require("../tools/check-ap");
const { build, bundle } = require("../tools/build-ap");

const ROOT = path.resolve(__dirname, "..");
const scratch = path.join(ROOT, ".scratch/bc-validation");
function tempDir(t) { fs.mkdirSync(scratch, { recursive: true }); const dir = fs.mkdtempSync(path.join(scratch, "liminal-ap-")); t.after(() => fs.rmSync(dir, { recursive: true, force: true })); return dir; }
function emptyPages(t) { return tempDir(t); }
function standardDocs() {
  return [F.unitTest("calculus-ab", 1), F.practiceExam("calculus-ab"), F.unitTest("physics-1", 1), F.unitTest("physics-c-mechanics", 2, { types: ["TBR", "EDA"] })];
}
function check(t, docs, { references = [], mutate, complete = false } = {}) {
  const dir = F.writeContent(path.join(tempDir(t), "content"), docs, references);
  if (mutate) mutate(dir);
  return loadAp({ contentDir: dir, pagesDir: emptyPages(t), complete });
}

test("the committed plan preserves all course units and legacy framework topics", () => {
  const result = loadAp();
  assert.deepEqual(result.problems, []);
  for (const [prefix, count] of [["AB", 81], ["P1", 43], ["CM", 41]]) {
    assert.equal(result.plan.standards.filter(s => s.kind === "content" && s.id.startsWith(prefix + ".")).length, count, prefix + " topic count");
  }
  const units = result.plan.courses.map(c => c.units.filter(u => u.unit !== null).length);
  assert.deepEqual(units, [8, 10, 8, 7]);
  const complete = loadAp({ complete: true });
  if (complete.assessments.length < 37) assert.ok(complete.problems.some(p => /missing \(required by --complete\)/.test(p)));
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
    [doc => { doc.sections[1].parts[0].items[0].type = "MR"; }, /Calculus free response has no type/],
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

test("answer-only figures cannot be given by another question", t => {
  const doc = F.unitTest("calculus-ab", 1);
  doc.sections[1].parts[0].items[0].parts[0].answerFigureIds = [doc.figures[0].id];
  const result = check(t, [doc]);
  assert.match(result.problems.join("\n"), /both given and answer-only anywhere in the assessment/);
});

test("malformed nested assessment and reference collections report errors without throwing", t => {
  const mutations = [
    doc => { doc.figures = [null]; },
    doc => { doc.courseId = "unknown"; },
    doc => { doc.sections = [null]; },
    doc => { doc.sections[0].parts = {}; },
    doc => { doc.sections[0].parts[0].items = [null]; },
    doc => { doc.sections[0].parts[0].items[0].figureIds = "ab-u1-f1"; },
    doc => { doc.sections[0].parts[0].items[0].parts = {}; },
    doc => { doc.sections[1].parts[0].items[0].parts = [null]; },
    doc => { doc.sections[1].parts[0].items[0].parts[0].rubric = [null]; },
  ];
  for (const mutate of mutations) {
    const result = check(t, [F.unitTest("calculus-ab", 1)], { mutate: dir => {
      const file = path.join(dir, "ap/assessments/calculus-ab/unit-1.json");
      const doc = JSON.parse(fs.readFileSync(file, "utf8")); mutate(doc); fs.writeFileSync(file, JSON.stringify(doc));
    } });
    assert.ok(result.problems.length, String(mutate));
  }
  for (const groups of [[null], [{ id: "motion", title: "Motion", rows: [null] }]]) {
    const ref = F.reference("physics-1"); ref.groups = groups;
    assert.ok(check(t, [], { references: [ref] }).problems.length);
  }
});

test("plan validation preserves required blueprint and schedule constraints", t => {
  const cases = [
    [plan => { delete plan.courses[0].blueprints.unitTest.frPoints; }, /needs whole free-response points/],
    [plan => { delete plan.courses[0].blueprints.practiceExam.minContextFr; }, /at least two free-response questions in context/],
    [plan => { delete plan.courses.find(c => c.id === "physics-1").blueprints.practiceExam.frTypes; }, /point values for every physics free-response type/],
    [plan => { delete plan.courses.find(c => c.id === "physics-1").blueprints.unitTest.distinctFrTypes; }, /must require distinct free-response types/],
    [plan => { delete plan.courses.find(c => c.id === "physics-1").blueprints.unitTest.minTypeUsesAcrossUnitTests; }, /at least three unit tests/],
    [plan => { const counts = plan.courses[0].blueprints.practiceExam.mcByUnit; counts[1] += 0.25; counts[2] -= 0.25; }, /positive whole question counts/],
    [plan => { plan.courses[0].blueprints.unitTest.minutes = [70, 50]; }, /valid minutes range/],
    [plan => { plan.courses[0].exam.sections[0].id = "II"; }, /sections are I and II/],
    [plan => { const schedule = plan.courses[0].schedule; delete schedule[32].assessment; schedule[33].assessment = "practice-exam"; }, /practice exam is placed in week 33/],
    [plan => { const units = plan.courses.find(c => c.id === "physics-c-mechanics").units; units[0].standards = units[0].standards.filter(s => s !== "CM.TOOLKIT"); units.at(-1).standards.push("CM.TOOLKIT"); }, /exactly the unit's framework topics and CM.TOOLKIT/],
  ];
  for (const [mutate, pattern] of cases) {
    const result = check(t, [], { mutate: dir => {
      const file = path.join(dir, "ap.json"), plan = JSON.parse(fs.readFileSync(file, "utf8"));
      mutate(plan); fs.writeFileSync(file, JSON.stringify(plan));
    } });
    assert.match(result.problems.join("\n"), pattern);
  }
});

test("malformed plan collections and pacing produce diagnostics", t => {
  for (const mutate of [
    plan => { plan.sources = [null]; },
    plan => { plan.standards[0].id = null; },
    plan => { plan.courses[0].units[0].weeks = -1; },
    plan => { plan.courses[0].units[0].standards = "AB.1.1"; },
    plan => { plan.courses[0].schedule = [null]; },
    plan => { plan.courses[0].exam.sections[0].parts = [null]; },
    plan => { plan.courses[0].blueprints = null; },
    plan => { plan.courses[0].blueprints.unitTest.sections = [null]; },
  ]) {
    const result = check(t, [], { mutate: dir => {
      const file = path.join(dir, "ap.json"), plan = JSON.parse(fs.readFileSync(file, "utf8"));
      mutate(plan); fs.writeFileSync(file, JSON.stringify(plan));
    } });
    assert.ok(result.problems.length, String(mutate));
  }
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

test("BC unit 10 and full exams build from editorial objectives with the calculus blueprint", t => {
  const docs = [F.unitTest("calculus-bc", 10), F.practiceExam("calculus-bc")];
  const result = check(t, docs);
  assert.deepEqual(result.problems, []);
  assert.equal(result.assessments[0].courseId, "calculus-bc");
  const unit = result.assessments.find(d => d.id === "unit-10");
  assert.equal(unit.unitId, "u10");
  assert.ok(A.entries(unit).every(e => e.item.topics.every(ref => ref.startsWith("BC.10."))));
  assert.ok(A.entries(unit).filter(e => !A.isMc(e.item)).every(e => A.itemPoints(e.item) === 9));
  const exam = result.assessments.find(d => d.kind === "practice-exam");
  assert.deepEqual(A.counts(exam), A.counts(F.practiceExam("calculus-ab")));
  assert.equal(A.entries(exam).filter(e => !A.isMc(e.item) && e.item.context).length, 2);
  const data = build({ output: tempDir(t), contentDir: F.writeContent(path.join(tempDir(t), "content"), docs), pagesDir: emptyPages(t) });
  assert.ok(data.assessments.some(d => d.file === "content/ap/assessments/calculus-bc/unit-10.json"));
  assert.deepEqual(data.references, []);
});

test("BC assessment guards reject review objectives, later units, wrong calculators and physics FR types", t => {
  const cases = [
    [doc => { doc.sections[0].parts[0].items[0].topics = ["BC.REVIEW"]; }, /not a course objective/],
    [doc => { doc.sections[0].parts[0].items[0].topics = ["BC.BEYOND"]; }, /not a course objective/],
    [doc => { doc.sections[0].parts[0].items[0].topics = [F.topicsOf("calculus-ab", 1)[0]]; }, /not a course objective/],
    [doc => { doc.sections[0].parts[0].items[0].topics.push(F.topicsOf("calculus-bc", 10)[0]); }, /later topic/],
    [doc => { doc.sections[0].parts[0].calculator = "any"; }, /must be one of none, graphing/],
    [doc => { doc.sections[0].parts[1].calculator = "none"; }, /calculator/],
    [doc => { doc.sections[1].parts[0].items[0].type = "MR"; }, /Calculus free response has no type/],
    [doc => { doc.sections[1].parts[0].items[0].parts[0].points = 2; doc.sections[1].parts[0].items[0].parts[0].rubric.pop(); }, /free response is worth 9/],
  ];
  for (const [mutate, pattern] of cases) {
    const doc = F.unitTest("calculus-bc", 1); mutate(doc);
    assert.match(check(t, [doc]).problems.join("\n"), pattern);
  }
});

test("BC plan guards require editorial IDs, HTML sources, sourced weights, instructional units and exam rules", t => {
  const bc = plan => plan.courses.find(c => c.id === "calculus-bc");
  const objective = plan => plan.standards.find(s => s.id.startsWith("BC.10."));
  const cases = [
    [plan => { objective(plan).kind = "content"; }, /BC references are editorial objectives/],
    [plan => { objective(plan).id = "BC.10.1"; }, /BC objectives use/],
    [plan => { objective(plan).sourceId = plan.standards.find(s => s.id === "AB.1.1").sourceId; }, /official HTML course unit overview/],
    [plan => { bc(plan).units[9].mcWeight = "10–15%"; }, /BC weights must match/],
    [plan => { bc(plan).units[9].unit = null; }, /ten instructional units/],
    [plan => { bc(plan).exam.sections[0].parts[0].minutes++; }, /May 2027/],
    [plan => { bc(plan).blueprints.unitTest.sections[0].parts[0].questions--; }, /calculus four-part blueprint/],
    [plan => { bc(plan).blueprints.practiceExam.frPoints = 8; }, /worth nine points/],
    [plan => { bc(plan).blueprints.practiceExam.minContextFr = 1; }, /at least two/],
    [plan => { bc(plan).reference = "calculus-bc"; }, /Calculus has no formula reference/],
  ];
  for (const [mutate, pattern] of cases) {
    const result = check(t, [], { mutate: dir => {
      const file = path.join(dir, "ap.json"), plan = JSON.parse(fs.readFileSync(file, "utf8"));
      mutate(plan); fs.writeFileSync(file, JSON.stringify(plan));
    } });
    assert.match(result.problems.join("\n"), pattern);
  }
});

test("BC editorial objectives require schedule, weekly and assessment coverage", t => {
  const omitted = F.topicsOf("calculus-bc", 10)[0];
  const all = F.plan.standards.filter(s => A.isAssessmentTopic(s, "calculus-bc")).map(s => s.id);
  const docs = Array.from({ length: 10 }, (_, i) => F.unitTest("calculus-bc", i + 1));
  docs.forEach((doc, i) => { A.entries(doc)[0].item.topics = F.topicsOf("calculus-bc", i + 1); });
  const unit10 = docs[9];
  A.entries(unit10).forEach(({ item }) => { item.topics = item.topics.filter(ref => ref !== omitted); if (!item.topics.length) item.topics = [all.find(ref => ref.startsWith("BC.10.") && ref !== omitted)]; });
  const result = check(t, docs, { complete: true, mutate: dir => {
    fs.mkdirSync(path.join(dir, "weekly/ap"), { recursive: true });
    fs.writeFileSync(path.join(dir, "weekly/ap/calculus-bc.json"), JSON.stringify({ weeks: [{ week: 1, standards: all.filter(ref => ref !== omitted) }] }));
  } });
  assert.ok(result.problems.some(p => p.startsWith("calculus-bc: topics without a test item:") && p.includes(omitted)), result.problems.join("\n"));
  assert.ok(result.problems.some(p => p.startsWith("calculus-bc: topics without a week:") && p.includes(omitted)), result.problems.join("\n"));
  assert.ok(!result.problems.some(p => /topics without/.test(p) && /BC\.(?:REVIEW|BEYOND)/.test(p)));
  const scheduled = check(t, [], { mutate: dir => {
    const file = path.join(dir, "ap.json"), plan = JSON.parse(fs.readFileSync(file, "utf8"));
    plan.courses.find(c => c.id === "calculus-bc").schedule.forEach(week => { week.standards = week.standards.filter(ref => ref !== omitted); if (!week.standards.length) week.standards = [all.find(ref => ref.startsWith("BC.10.") && ref !== omitted)]; });
    fs.writeFileSync(file, JSON.stringify(plan));
  } });
  assert.ok(scheduled.problems.some(p => p.includes("no week covers " + omitted)), scheduled.problems.join("\n"));
});
