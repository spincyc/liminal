"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const A = require("../src/lib/ap-assessment");
const F = require("./fixtures/ap-fixtures");

const plan = F.plan;
const course = id => plan.courses.find(c => c.id === id);

test("disclaimer matches the owner-approved wording and the weekly constant", () => {
  assert.equal(A.DISCLAIMER, "AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.");
  const W = require("../src/lib/weekly");
  if (W.AP_DISCLAIMER) assert.equal(W.AP_DISCLAIMER, A.DISCLAIMER);
  assert.equal(plan.notice, A.DISCLAIMER);
});

test("numbering, counts and raw-point tallies", () => {
  const doc = F.unitTest("calculus-ab", 1);
  const entries = A.entries(doc);
  assert.deepEqual(entries.filter(e => A.isMc(e.item)).map(e => e.number), Array.from({ length: 12 }, (_, i) => i + 1));
  assert.deepEqual(entries.filter(e => !A.isMc(e.item)).map(e => e.number), [1, 2]);
  assert.deepEqual(A.counts(doc), { mc: 12, fr: 2, minutes: 56, points: 30 });
  const tally = A.tally(doc);
  assert.deepEqual(tally.sections.map(s => [s.id, s.items, s.points]), [["I", 12, 12], ["II", 2, 18]]);
  assert.deepEqual(tally.units, [{ unit: 1, items: 14, points: 30 }]);
  const raw = A.rawPoints(doc, { mc: { 1: "A", 2: "A", 3: "C" }, fr: { "ab-u1-fr1": { a: 3, b: 9, c: "x" } } });
  assert.deepEqual(raw.sections.map(s => s.earned), [2, 6], "MC 1 and 3 right; FR part b capped at its 3 points");
  assert.equal(JSON.stringify(A.tally(doc)).includes("scaled"), false);
});

test("student copies carry no keys, rationales, rubrics, answers, topics or answer-only figures", () => {
  const doc = F.unitTest("physics-1", 1);
  doc.sections[1].parts[0].items[0].answerFigureIds = ["p1-u1-f2"];
  doc.figures.push({ id: "p1-u1-f2", alt: "Answer sketch." , svg: "<svg/>" });
  doc.figures[0].svg = F.FIGURE_SVG;
  const student = A.studentCopy(doc);
  const text = JSON.stringify(student);
  for (const secret of ["Fixture rationale", "Placeholder note", "Fixture criterion", "Fixture answer", "Fixture step", "\"key\"", "\"topics\"", "\"type\"", "p1-u1-f2", "\"rubric\"", "\"units\""]) {
    assert.equal(text.includes(secret), false, "student copy leaks " + secret);
  }
  assert.equal(student.format, "liminal-ap-student-booklet");
  assert.equal(student.sections[0].parts[0].items[1].figureIds[0], "p1-u1-f1");
  assert.deepEqual(student.figures.map(f => f.id), ["p1-u1-f1"]);
  assert.equal(student.sections[1].parts[0].items[0].points, 10);
  assert.equal(student.answerSheet.mc.length, 12);
  assert.deepEqual(student.answerSheet.fr.map(r => r.labels), [["a", "b", "c"], ["a", "b", "c"]]);
  const key = A.keyCopy(doc);
  const keyText = JSON.stringify(key);
  for (const shown of ["Fixture rationale", "Placeholder note", "Fixture criterion", "Fixture answer", "\"key\":\"A\"", "\"type\":\"MR\"", "p1-u1-f2"]) assert.ok(keyText.includes(shown), "key copy lacks " + shown);
  assert.equal(key.format, "liminal-ap-answer-key");
  assert.ok(Array.isArray(key.tally.units));
});

test("key balance: letter shares and the unique longest choice", () => {
  const doc = F.unitTest("calculus-ab", 1);
  assert.deepEqual(A.keyBalance(doc).problems, []);
  const allA = F.unitTest("calculus-ab", 1);
  A.entries(allA).filter(e => A.isMc(e.item)).forEach(e => { e.item.key = "A"; });
  assert.ok(A.keyBalance(allA).problems.some(p => /key A is 12 of 12/.test(p)));
  assert.ok(A.keyBalance(allA).problems.some(p => /key B is 0 of 12/.test(p)));
  const longest = F.unitTest("calculus-ab", 1);
  A.entries(longest).filter(e => A.isMc(e.item)).forEach((e, i) => { if (i < 6) e.item.choices[A.LETTERS.indexOf(e.item.key)] += " (a deliberately long choice)"; });
  assert.equal(A.keyBalance(longest).longest, 6);
  assert.ok(A.keyBalance(longest).problems.some(p => /unique longest choice in 6 of 12/.test(p)));
});

test("blueprints: unit tests and practice exams match content/ap.json", () => {
  for (const id of A.COURSES) {
    assert.deepEqual(A.blueprintProblems(F.unitTest(id, 1), course(id)), [], id + " unit test");
    assert.deepEqual(A.blueprintProblems(F.practiceExam(id), course(id)), [], id + " practice exam");
  }
  const wrong = F.unitTest("calculus-ab", 2);
  wrong.sections[0].parts[1].calculator = "none";
  wrong.sections[0].parts[0].items.pop();
  wrong.sections[1].parts[0].items[0].parts[0].points = 4;
  wrong.sections[1].parts[0].items[0].topics = ["AB.3.1"];
  const problems = A.blueprintProblems(wrong, course("calculus-ab")).join("\n");
  assert.match(problems, /part A has 7 questions; the blueprint has 8/);
  assert.match(problems, /part B calculator is none; the blueprint has graphing/);
  assert.match(problems, /worth 10 points; free response is worth 9/);
  assert.match(problems, /first topic must be in unit 2/);
  assert.match(problems, /uses later topic AB\.3\.1/);
  const exam = F.practiceExam("physics-1");
  exam.sections[0].parts[0].minutes = 90;
  exam.sections[0].parts[0].items[0].topics = ["P1.2.1"];
  exam.sections[1].parts[0].items[1].type = "MR";
  const examProblems = A.blueprintProblems(exam, course("physics-1")).join("\n");
  assert.match(examProblems, /is 90 minutes; the exam allows 85/);
  assert.match(examProblems, /unit 1 has 4 multiple-choice questions; the blueprint has 5/);
  assert.match(examProblems, /exactly one free-response question of each type/);
  const ab = F.practiceExam("calculus-ab");
  ab.sections[1].parts[0].items.forEach(item => { delete item.context; });
  assert.match(A.blueprintProblems(ab, course("calculus-ab")).join("\n"), /at least 2 free-response questions in real-world contexts/);
  const twin = F.unitTest("physics-c-mechanics", 1, { types: ["EDA", "EDA"] });
  assert.match(A.blueprintProblems(twin, course("physics-c-mechanics")).join("\n"), /free-response types must differ/);
});

test("claims lint flags promises and predictions, not negations or the disclaimer", () => {
  const flagged = text => A.claimProblems(text).map(c => c.claim);
  assert.deepEqual(flagged("Finish the course and you will score a 5 on the exam."), ["score-of-5"]);
  assert.deepEqual(flagged("Results guaranteed."), ["guarantee"]);
  assert.deepEqual(flagged("This course guarantees a 5."), ["guarantee"]);
  assert.deepEqual(flagged("Students are guaranteed to pass."), ["guarantee"]);
  assert.deepEqual(flagged("Guaranteed success on the AP® exam."), ["guarantee"]);
  assert.deepEqual(flagged("Our method guarantees higher scores."), ["guarantee"]);
  assert.deepEqual(flagged("This tool can predict your AP score."), ["predict-score"]);
  assert.deepEqual(flagged("An official practice exam."), ["official"]);
  assert.deepEqual(flagged("Convert raw points to the 1–5 scale."), ["score-scale"]);
  assert.deepEqual(flagged("A College Board-approved course."), ["endorsement"]);
  assert.deepEqual(flagged("Earn college credit with this course."), ["pass-or-credit"]);
  assert.deepEqual(flagged("Our AP's best course."), ["mark-as-noun"]);
  for (const fine of [A.DISCLAIMER, "These are practice, not AP scores, and give no score conversion.", "Earn 3 points for a correct setup.",
    "Predict how the period changes when the mass doubles.",
    "Because f is continuous on [1, 5], the Intermediate Value Theorem guarantees a c in (1, 5) with f(c) = 0.",
    "The Mean Value Theorem guarantees a point where the instantaneous rate equals the average rate.",
    "The Extreme Value Theorem guarantees that f attains a maximum on a closed interval.",
    "With no external impulse, conservation of momentum guarantees that the total momentum stays 4.2 kg·m/s.", "Practice with College Board's official equation sheet.", "It is not an authorized AP course.", "Review units 1–5 before the test."]) {
    assert.deepEqual(A.claimProblems(fine), [], fine);
  }
});

test("identities ignore choice order and see figure drawings", () => {
  const a = { prompt: "Find  the value.", choices: ["1", "2", "3", "4"], figureIds: ["x-f1"] };
  const b = { prompt: "find the value.", choices: ["4", "3", "2", "1"], figureIds: ["y-f9"] };
  assert.equal(A.identity(a, [{ id: "x-f1", svg: "<svg>a</svg>" }]), A.identity(b, [{ id: "y-f9", svg: "<svg>a</svg>" }]));
  assert.notEqual(A.identity(a, [{ id: "x-f1", svg: "<svg>a</svg>" }]), A.identity(b, [{ id: "y-f9", svg: "<svg>b</svg>" }]));
});

test("ap.html routes resolve and round-trip", () => {
  assert.equal(A.route(), "#");
  assert.equal(A.route("calculus-ab"), "#calculus-ab");
  assert.equal(A.route("calculus-ab", "unit", "u3"), "#calculus-ab/u3");
  assert.equal(A.route("physics-1", "student", "unit-2"), "#physics-1/test/unit-2");
  assert.equal(A.route("physics-1", "key", "practice-exam"), "#physics-1/test/practice-exam/key");
  assert.equal(A.route("physics-1", "reference"), "#physics-1/reference");
  assert.equal(A.route("calculus", "student", "unit-1"), "");
  assert.equal(A.route("physics-1", "student", "unit-1/../x"), "");
  const at = hash => { const r = A.resolve(plan, hash); return [r.view, r.course && r.course.id, r.unitId, r.assessmentId, r.copy, r.invalid]; };
  assert.deepEqual(at(""), ["hub", null, null, null, null, false]);
  assert.deepEqual(at("#calculus-ab"), ["plan", "calculus-ab", null, null, null, false]);
  assert.deepEqual(at("#calculus-ab/u9"), ["plan", "calculus-ab", "u9", null, null, false]);
  assert.deepEqual(at("#calculus-ab/test/unit-8/key"), ["assessment", "calculus-ab", null, "unit-8", "key", false]);
  assert.deepEqual(at("#physics-c-mechanics/test/unit-8"), ["plan", "physics-c-mechanics", null, null, null, true], "C:M has seven unit tests");
  assert.deepEqual(at("#calculus-ab/reference"), ["plan", "calculus-ab", null, null, null, true], "AB has no reference");
  assert.deepEqual(at("#physics-1/reference"), ["reference", "physics-1", null, null, null, false]);
  assert.deepEqual(at("#nope"), ["hub", null, null, null, null, true]);
  assert.deepEqual(A.planCourses(plan).map(c => c.id), A.COURSES);
});

test("BC uses editorial unit objectives without inventing official granular topic numbers", () => {
  assert.equal(A.isCalculus("calculus-ab"), true);
  assert.equal(A.isCalculus("calculus-bc"), true);
  assert.equal(A.isCalculus("physics-c-mechanics"), false);
  assert.equal(A.topicUnit("BC.10.POWER_SERIES"), 10);
  assert.equal(A.topicUnit("BC.1.LIMITS"), 1);
  assert.equal(A.topicUnit("AB.5.3"), 5);
  for (const invalid of ["BC.1.1", "BC.0.LIMITS", "BC.11.SERIES", "BC.01.LIMITS", "BC.1.lowercase", "BC.1._LIMITS", "BC.1.LIMITS_", "BC.REVIEW", "BC.BEYOND"]) {
    assert.equal(A.topicUnit(invalid), null, invalid);
  }
  assert.equal(A.isAssessmentTopic({ id: "BC.10.POWER_SERIES", kind: "editorial-objective" }, "calculus-bc"), true);
  assert.equal(A.isAssessmentTopic({ id: "BC.10.POWER_SERIES", kind: "content" }, "calculus-bc"), false);
  assert.equal(A.isAssessmentTopic({ id: "AB.1.2", kind: "content" }, "calculus-bc"), false);
  assert.equal(A.isAssessmentTopic({ id: "AB.1.2", kind: "editorial-objective" }, "calculus-ab"), false);
  const topics = A.topicsForUnit(plan, "calculus-bc", 10);
  assert.ok(topics.length > 0);
  assert.ok(topics.every(topic => topic.id.startsWith("BC.10.") && topic.kind === "editorial-objective"));
  assert.equal(A.route("calculus-bc", "key", "unit-10"), "#calculus-bc/test/unit-10/key");
  assert.equal(A.resolve(plan, "#calculus-bc/test/unit-10/key").copy, "key");
  assert.equal(A.resolve(plan, "#calculus-bc/reference").invalid, true, "BC has no physics formula reference");
});
