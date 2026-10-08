"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const weekly = require("../src/lib/weekly");
const builder = require("../tools/build-weekly");
const { loadCurriculum } = require("../tools/build-curriculum");
const apFixture = require("./fixtures/weekly-ap");
const curriculum = loadCurriculum();
const track = curriculum.tracks[0];
function fixture(trackId = track.track.id, grade = 12) {
  const sourceTrack = curriculum.tracks.find(t => t.track.id === trackId);
  const plan = sourceTrack.courses.find(c => c.grade === grade);
  const units = plan.units.flatMap(unit => Array(unit.weeks).fill(unit));
  const task = (week, name) => ({ id: "w" + week + "-" + name,
    prompt: "Explain the reasoning for case " + week + " " + name + ".", answer: "Secret answer " + name,
    steps: ["Identify the given relationship.", "Apply it to the stated case.", "Check the conclusion."],
    passageIds: [], skill: "Justify the conclusion" });
  return { format: "liminal-weekly-course", version: 1, trackId, grade, author: "test-author",
    weeks: units.map((unit, i) => ({ week: i + 1, unitId: unit.id, title: "Week " + (i + 1), objective: "Explain the target relationship.",
      standards: [unit.standards[0]], connection: { before: "Use known relationships.", after: "Build new arguments." },
      days: ["Notice the pattern.", "Model the relationship.", "Explain an example.", "Practice independently.", "Check understanding."],
      explanation: ["Use the given information to find a relationship.", "Represent the relationship and explain its meaning.", "Check each step against the original information."],
      examples: [task(i + 1, "example-one"), task(i + 1, "example-two")], passages: [],
      worksheets: ["a", "b", "c"].map(id => ({ id, title: "Worksheet " + id, directions: "Show your reasoning.",
        items: Array.from({ length: 6 }, (_, n) => task(i + 1, id + "-" + (n + 1))) })) })) };
}
function passage(id, text = "A river bends beside a garden.") { return { id, title: "The garden", text, kind: "original", attribution: "Written for Liminal.", sourceUrl: "", readingMode: "independent" }; }
function reject(change, pattern) { const course = fixture(); change(course); assert.throws(() => builder.validateCourse(course, track), pattern); }
function index(course = fixture()) { return { version: 1, courses: [{ trackId: course.trackId, grade: course.grade, title: "Course", weeks: course.weeks.map(w => ({ week: w.week, unitId: w.unitId, title: w.title })), file: "content/weekly/" + course.trackId + "/12.json" }] }; }

test("complete courses pass and incomplete, reordered, or misaligned teaching content fails", () => {
  assert.equal(builder.validateCourse(fixture(), track).weeks.length, 36);
  reject(c => c.weeks.pop(), /exactly 36/);
  reject(c => c.weeks[0].week = 2, /ordered/);
  reject(c => c.weeks[0].unitId = c.weeks.at(-1).unitId, /pacing/);
  reject(c => c.weeks[0].standards = ["invented-standard"], /outside unit/);
  reject(c => c.weeks[0].standards = [track.standards.find(s => !track.courses.find(p => p.grade === 12).units[0].standards.includes(s.id)).id], /outside unit/);
  reject(c => c.weeks[0].explanation.pop(), /explanation/);
  reject(c => c.weeks[0].connection.after = "", /connection.after/);
  reject(c => c.weeks[0].days.push("Sixth day"), /five days/);
  reject(c => c.weeks[0].examples.pop(), /two examples/);
  reject(c => c.weeks[0].examples[0].steps.pop(), /steps/);
  reject(c => c.weeks[0].worksheets.pop(), /three worksheets/);
  reject(c => c.weeks[0].worksheets[1].id = "a", /duplicate/);
  reject(c => c.weeks[0].worksheets[0].items.pop(), /six worksheet items/);
  reject(c => c.weeks[0].worksheets[0].items[0].steps = ["One"], /steps/);
  reject(c => c.weeks[0].worksheets[0].items[0].answer = "", /answer/);
  reject(c => c.weeks[1].worksheets[0].items[0].id = c.weeks[0].worksheets[0].items[0].id, /duplicate item ID/);
});

test("duplicates compare visible prompts and resolved passage text across all weeks and examples", () => {
  reject(c => c.weeks[2].worksheets[2].items[4].prompt = "  " + c.weeks[0].worksheets[0].items[0].prompt.toUpperCase() + "  ", /duplicate displayed task/);
  reject(c => c.weeks[0].worksheets[0].items[0].prompt = c.weeks[0].examples[0].prompt, /duplicate displayed task/);
  const c = fixture();
  c.weeks[0].passages.push(passage("p1"), passage("p2", "The road rises over the hill."));
  const [first, second] = c.weeks[0].worksheets[0].items;
  first.passageIds = ["p1"]; second.passageIds = ["p2"]; second.prompt = first.prompt;
  assert.doesNotThrow(() => builder.validateCourse(c, track));
  c.weeks[0].passages[1].text = c.weeks[0].passages[0].text;
  assert.throws(() => builder.validateCourse(c, track), /duplicate displayed task/);
  reject(c => c.weeks[0].worksheets[0].items[0].passageIds = ["missing"], /unresolved passage/);
  const reversed = fixture();
  reversed.weeks[0].passages = [passage("left"), passage("right", "A bridge crosses a stream.")];
  const [a, b] = reversed.weeks[0].worksheets[0].items;
  a.passageIds = ["left", "right"]; b.passageIds = ["right", "left"]; b.prompt = a.prompt;
  assert.throws(() => builder.validateCourse(reversed, track), /duplicate displayed task/);
});

test("plain text and source provenance reject executable markup and unsafe URLs", () => {
  const math = fixture();
  for (const notation of [
    "For 0<x<1, x^2<x; for x>1, x^2>x.",
    "Use x<y and y>0 to compare the quantities.",
    "If a<b and c>d, compare a+c with b+d.",
    "Use f(x)<g(x), then explain why g(x)>0.",
  ]) {
    math.weeks[0].explanation[0] = notation;
    assert.doesNotThrow(() => builder.validateCourse(math, track), notation);
  }
  for (const html of ["<script>alert(1)</script>", '<img src="x" onerror="alert(1)">',
    "<IMG SRC=x onerror=alert(1)>", "<input disabled>", "<p>Formatting</p>", "<!-- hidden -->"]) {
    reject(c => c.weeks[0].title = html, /non-plain text/);
  }
  reject(c => c.weeks[0].examples[0].answer = "bad\u0000text", /non-plain text/);
  reject(c => c.weeks[0].explanation[0] = "Use \\(x\\) now.", /LaTeX/);
  reject(c => c.weeks[0].passages = [{ ...passage("p"), attribution: "Anonymous" }], /provenance/);
  reject(c => c.weeks[0].passages = [{ ...passage("p"), sourceUrl: "https://example.org" }], /provenance/);
  const valid = { ...passage("p"), kind: "public-domain", attribution: "Author, Work, 1900. Public domain.", sourceUrl: "https://example.org/work" };
  const c = fixture(); c.weeks[0].passages = [valid];
  assert.doesNotThrow(() => builder.validateCourse(c, track));
  for (const sourceUrl of ["javascript:alert(1)", "http://example.org", "https://user:pass@example.org", "https://example.org/\nscript", "https://example.org\\evil", "https://example.org/%0aevil", "https:///example.org"]) {
    c.weeks[0].passages[0].sourceUrl = sourceUrl;
    assert.throws(() => builder.validateCourse(c, track), /provenance\/source/, sourceUrl);
  }
});

test("routes are exact, bounded, canonical and recover safely", () => {
  const data = index();
  assert.equal(weekly.resolve(data, "#common-core-math/12/36").week, 36);
  assert.equal(weekly.resolve(data, "").invalid, false);
  for (const hash of ["#common-core-math/12/0", "#common-core-math/12/37", "#common-core-math/12/01", "#common-core-math/012/1", "#common-core-math/12/1/extra", "#common-core-math/12/1/", "#common-core-math/12", "#common-core-math/0/1", "#common-core-math/%31%32/1", "#../../outside", "#unknown/12/1"]) {
    const result = weekly.resolve(data, hash);
    assert.equal(result.invalid, true, hash);
    assert.equal(result.week, 1);
    assert.equal(result.course, data.courses[0]);
  }
  assert.equal(weekly.resolve({ courses: [] }, "").course, null);
  assert.equal(weekly.resolve({ courses: [] }, "#common-core-math/12/1").invalid, true);
  assert.equal(weekly.route("common-core-reading", 0, 2), "#common-core-reading/k/2");
  assert.equal(weekly.route("../outside", 12, 1), "");
  assert.equal(weekly.route("common-core-math", 12, 37), "");
  assert.deepEqual(weekly.navigation(data, weekly.resolve(data, "")), { first: null, previous: null, next: "#common-core-math/12/2", last: "#common-core-math/12/36" });
  assert.deepEqual(weekly.navigation(data, weekly.resolve(data, "#common-core-math/12/36")), { first: "#common-core-math/12/1", previous: "#common-core-math/12/35", next: null, last: null });
});

test("reader navigation stays in each graded or named course and disables unavailable edges", () => {
  const courses = [
    ...weekly.GRADE_TRACKS.flatMap(trackId => [0, 8, 12].map(grade => ({ trackId, grade }))),
    ...weekly.NAMED_TRACK_IDS.flatMap(trackId => weekly.namedCourses(trackId).map(courseId => ({ trackId, courseId }))),
  ].map(course => ({ ...course, weeks: Array.from({ length: 36 }, (_, i) => ({ week: i + 1 })) }));
  const data = { courses };
  for (const course of courses) {
    const route = week => weekly.route(course.trackId, weekly.courseKey(course), week);
    for (const week of [1, 18, 36]) {
      const selected = weekly.resolve(data, route(week));
      assert.deepEqual(weekly.navigation(data, selected), {
        first: week > 1 ? route(1) : null,
        previous: week > 1 ? route(week - 1) : null,
        next: week < 36 ? route(week + 1) : null,
        last: week < 36 ? route(36) : null,
      });
    }
  }
  const unavailable = { first: null, previous: null, next: null, last: null };
  assert.deepEqual(weekly.navigation(data, null), unavailable);
  assert.deepEqual(weekly.navigation(data, { trackId: "common-core-math", grade: 8, week: 37 }), unavailable);
  assert.deepEqual(weekly.navigation({ courses: [] }, weekly.resolve(data, "#ap/calculus-ab/18")), unavailable);
});

test("student projection includes only assigned passages and cannot leak new teacher fields", () => {
  const c = fixture(), w = c.weeks[0];
  w.passages = [passage("assigned"), passage("example-only"), passage("unused")];
  w.examples[0].passageIds = ["example-only"];
  w.worksheets[0].items[0].passageIds = ["assigned"];
  const secret = "SECRET_TEACHER_MATERIAL";
  c.teacherNote = secret; w.explanation = [secret]; w.examples[0].answer = secret;
  w.passages[0].answer = secret; w.worksheets[0].answer = secret;
  w.worksheets[0].items[0].answer = secret; w.worksheets[0].items[0].steps = [secret];
  w.worksheets[0].items[0].futureTeacherHints = [secret];
  const student = weekly.studentWorksheet(c, 1, "a");
  assert.deepEqual(student.passages.map(p => p.id), ["assigned"]);
  assert.ok(!JSON.stringify(student).includes(secret));
  assert.ok(!JSON.stringify(student).includes('"answer"'));
  assert.ok(!JSON.stringify(student).includes('"steps"'));
  const key = weekly.answerWorksheet(c, 1, "a");
  assert.equal(key.worksheet.items[0].answer, secret);
  assert.deepEqual(key.worksheet.items[0].steps, [secret]);
  assert.equal(weekly.studentWorksheet(c, 37, "a"), null);
  student.worksheet.items[0].passageIds.push("changed");
  assert.deepEqual(w.worksheets[0].items[0].passageIds, ["assigned"]);
});

test("build omits absent courses, sorts complete courses and emits matching lazy assets", () => {
  const scratch = path.resolve(__dirname, "../.scratch/weekly-engine");
  fs.mkdirSync(scratch, { recursive: true });
  const directory = fs.mkdtempSync(path.join(scratch, "fixture-"));
  const output = fs.mkdtempSync(path.join(scratch, "dist-"));
  try {
    assert.deepEqual(builder.build({ directory, output, curriculum }), { version: 1, courses: [] });
    const entries = [["singapore-math", 12], ["common-core-math", 0], ["common-core-math", 12], ["common-core-reading", 12]];
    for (const [trackId, grade] of entries) {
      fs.mkdirSync(path.join(directory, trackId), { recursive: true });
      fs.writeFileSync(path.join(directory, trackId, weekly.gradeKey(grade) + ".json"), JSON.stringify(fixture(trackId, grade)));
    }
    const built = builder.build({ directory, output, curriculum });
    assert.deepEqual(built.courses.map(c => [c.trackId, c.grade]), [entries[2], entries[3], entries[0], entries[1]]);
    const context = vm.createContext({ window: {} });
    vm.runInContext(fs.readFileSync(path.join(output, "content/weekly-index.js"), "utf8"), context);
    assert.equal(JSON.stringify(context.window.LIMINAL_WEEKLY_INDEX), JSON.stringify(built));
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(output, "content/weekly-index.json"))), built);
    for (const entry of built.courses) {
      assert.equal(JSON.parse(fs.readFileSync(path.join(output, entry.file))).weeks.length, 36);
      assert.deepEqual(Object.keys(entry.weeks[0]), ["week", "unitId", "title"]);
    }
    fs.writeFileSync(path.join(directory, "common-core-math/1.json"), JSON.stringify(fixture("common-core-math", 12)));
    assert.throws(() => builder.loadWeekly({ directory, curriculum }), /path mismatch/);
    fs.rmSync(path.join(directory, "common-core-math/1.json"));
    fs.writeFileSync(path.join(directory, "common-core-math/0.json"), "{}");
    assert.throws(() => builder.loadWeekly({ directory, curriculum }), /unexpected course file/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.rmSync(output, { recursive: true, force: true });
  }
});


test("course context keeps scope qualifications visible for mapped and suggested pathways", () => {
  for (let grade = 0; grade <= 12; grade++) {
    assert.equal(weekly.courseContext("singapore-math", grade), "Editorial grade mapping");
    assert.equal(weekly.courseContext("common-core-reading", grade), grade >= 9 ? "Suggested sequence" : "");
    assert.equal(weekly.courseContext("common-core-math", grade), grade === 12 ? "Optional advanced pathway" : grade >= 9 ? "Suggested sequence" : "");
  }
  assert.equal(weekly.courseContext("unknown", 12), "");
});

const highSchool = require("../src/lib/high-school");
const { inspect } = require("../tools/check-weekly");
function namedFixture(courseId, plans) {
  const course = fixture();
  delete course.grade;
  course.trackId = "high-school-math";
  course.courseId = courseId;
  const pacing = plans.courses.find(c => c.id === courseId).units.flatMap(u => Array(u.weeks).fill(u));
  course.weeks.forEach((week, i) => { week.unitId = pacing[i].id; week.standards = [pacing[i].standards[0]]; });
  return course;
}

test("named plans hydrate source aliases and validate editorial pacing, references and source safety", () => {
  const raw = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../content/high-school-math.json"), "utf8"));
  const plans = builder.normalizeHighSchool(raw, curriculum);
  assert.deepEqual(plans.courses.map(c => c.id), weekly.NAMED_COURSES);
  for (const [index, course] of plans.courses.entries()) {
    assert.equal(course.grade, undefined);
    assert.equal(highSchool.pacedUnits(course).at(-1).endWeek, 36);
    assert.deepEqual(course.goals, course.outcomes);
    if (index < 3) assert.deepEqual(course.units, track.courses.find(c => c.grade === index + 9).units);
    assert.ok(course.units.every(u => u.standards.every(id => plans.standards.some(s => s.id === id))));
  }
  function rejectPlan(change, pattern) { const data = structuredClone(raw); change(data); assert.throws(() => builder.normalizeHighSchool(data, curriculum), pattern); }
  rejectPlan(p => p.courses[0].source.grade = 10, /source alias/);
  rejectPlan(p => p.courses[0].units = [], /source alias/);
  rejectPlan(p => p.courses[3].grade = 11, /must not assign a grade/);
  rejectPlan(p => p.courses[3].units[0].weeks++, /pacing/);
  rejectPlan(p => p.courses[3].units[0].id = ["u1"], /invalid named unit ID/);
  rejectPlan(p => p.courses[3].units[0].standards = ["unresolved"], /unresolved/);
  rejectPlan(p => p.sources[0].url = "javascript:alert(1)", /source URL/);
  rejectPlan(p => p.sources[0].accessed = "2026-02-30", /source date/);
  rejectPlan(p => p.courses.pop(), /five courses/);
  const reversed = { ...plans, courses: plans.courses.slice().reverse() };
  assert.equal(highSchool.resolve(reversed, "").course.id, "algebra");
  assert.equal(highSchool.resolve(plans, "#calculus/u1").unitId, "u1");
  for (const hash of ["#calculus/u999", "#calculus/u1/extra", "#unknown", "#../calculus", "#calculus/"]) assert.equal(highSchool.resolve(plans, hash).invalid, true, hash);
  assert.equal(highSchool.route("calculus", "u1"), "#calculus/u1");
  assert.equal(highSchool.route("../outside", "u1"), "");
  assert.equal(highSchool.route("calculus", "../outside"), "");
  assert.equal(highSchool.route("calculus", ["u1"]), "");
});

test("named coursework preserves named identity through routing, navigation, projection and admission", () => {
  const plans = builder.loadHighSchool(curriculum);
  const course = namedFixture("calculus", plans);
  assert.doesNotThrow(() => builder.validateCourse(course, plans));
  const invalid = structuredClone(course); invalid.grade = 12;
  assert.throws(() => builder.validateCourse(invalid, plans), /named course identity/);
  const wrongPace = structuredClone(course); wrongPace.weeks[0].unitId = "u2";
  assert.throws(() => builder.validateCourse(wrongPace, plans), /pacing/);
  const entry = { trackId: course.trackId, courseId: course.courseId, title: "Calculus", weeks: course.weeks };
  const data = { version: 1, courses: [entry] };
  assert.equal(weekly.courseKey(entry), "calculus");
  assert.equal(weekly.courseLabel(entry), "Calculus");
  assert.equal(weekly.courseKey({ grade: 0 }), "k");
  assert.equal(weekly.courseKey({ grade: 12 }), "12");
  assert.equal(weekly.courseAt(data, "high-school-math", "calculus"), entry);
  const selected = weekly.resolve(data, "#high-school-math/calculus/3");
  assert.equal(selected.courseId, "calculus"); assert.equal(selected.grade, null); assert.equal(selected.invalid, false);
  assert.deepEqual(weekly.navigation(data, selected), { first: "#high-school-math/calculus/1", previous: "#high-school-math/calculus/2", next: "#high-school-math/calculus/4", last: "#high-school-math/calculus/36" });
  for (const hash of ["#high-school-math/12/1", "#high-school-math/Calculus/1", "#high-school-math/calculus/03", "#high-school-math/%63alculus/1", "#high-school-math/calculus/1/extra"]) assert.equal(weekly.resolve(data, hash).invalid, true, hash);
  assert.equal(weekly.route("high-school-math", "calculus", 1), "#high-school-math/calculus/1");
  assert.equal(weekly.route("high-school-math", 12, 1), "");
  assert.equal(weekly.route("common-core-math", "12", 1), "#common-core-math/12/1");
  const packet = weekly.studentWorksheet(course, 1, "a");
  assert.equal(packet.courseId, "calculus"); assert.equal(packet.courseTitle, "Calculus"); assert.equal(packet.grade, undefined);
  assert.equal(weekly.courseLabel(packet), "Calculus");
  assert.ok(!JSON.stringify(packet).includes('"answer"'));
  assert.equal(weekly.answerWorksheet(course, 1, "a").courseId, "calculus");
});

test("complete inventory counts 44 original courses and 47 views without duplicating authored aliases", () => {
  const plans = builder.loadHighSchool(curriculum);
  const scratch = path.resolve(__dirname, "../.scratch/weekly-engine");
  fs.mkdirSync(scratch, { recursive: true });
  const directory = fs.mkdtempSync(path.join(scratch, "named-fixture-"));
  const output = fs.mkdtempSync(path.join(scratch, "named-dist-"));
  function write(course) {
    const dir = path.join(directory, course.trackId); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, weekly.courseKey(course) + ".json"), JSON.stringify(course));
  }
  try {
    for (const trackId of weekly.GRADE_TRACKS) for (let grade = 0; grade <= 12; grade++) write(fixture(trackId, grade));
    for (const id of ["trigonometry", "calculus"]) write(namedFixture(id, plans));
    for (const id of weekly.namedCourses("ap")) write(apFixture.fillerCourse(id));
    const options = { directory, curriculum, highSchool: plans, plans: { ap: builder.normalizeNamedPlan("ap", apFixture.plan(), curriculum) }, output };
    const report = inspect({ ...options, complete: true });
    assert.equal(report.courses, 44); assert.equal(report.courseViews, 47); assert.equal(report.aliasViews, 3);
    assert.equal(report.weeks, 44 * 36); assert.equal(report.worksheets, 44 * 36 * 3); assert.deepEqual(report.missing, []);
    const loaded = builder.loadWeekly(options);
    const source = loaded.physicalCourses.find(c => c.trackId === "common-core-math" && c.grade === 11);
    const alias = loaded.courses.find(c => c.courseId === "algebra-2");
    assert.deepEqual(alias.weeks.slice(0, 35), source.weeks.slice(0, 35));
    assert.equal(alias.weeks[35].connection.after, plans.courses.find(c => c.id === "algebra-2").nextStep);
    assert.equal(source.weeks[35].connection.after, "Build new arguments.");
    assert.deepEqual({ ...alias.weeks[35], connection: { ...alias.weeks[35].connection, after: source.weeks[35].connection.after } }, source.weeks[35]);
    assert.equal(alias.grade, undefined);
    assert.deepEqual(alias.source, { trackId: "common-core-math", grade: 11 });
    const built = builder.build(options);
    const namedEntries = built.courses.filter(c => c.courseId && c.trackId === "high-school-math");
    assert.deepEqual(namedEntries.map(c => c.courseId), weekly.NAMED_COURSES);
    const aliasBuilt = JSON.parse(fs.readFileSync(path.join(output, "content/weekly/high-school-math/algebra-2.json"), "utf8"));
    assert.equal(aliasBuilt.courseTitle, "Algebra 2"); assert.equal(aliasBuilt.grade, undefined);
    const context = vm.createContext({ window: {} });
    vm.runInContext(fs.readFileSync(path.join(output, "content/high-school.js"), "utf8"), context);
    assert.equal(JSON.stringify(context.window.LIMINAL_HIGH_SCHOOL), JSON.stringify(plans));
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(output, "content/high-school.json"), "utf8")), plans);
    fs.rmSync(path.join(directory, "high-school-math/calculus.json"));
    assert.throws(() => inspect({ ...options, complete: true }), /high-school-math\/calculus/);
    fs.rmSync(path.join(directory, "common-core-math/9.json"));
    const partial = inspect(options);
    assert.ok(partial.missing.some(c => c.grade === 9 && c.trackId === "common-core-math"));
    assert.ok(partial.missing.some(c => c.courseId === "algebra"));
    assert.equal(builder.loadWeekly(options).courses.some(c => c.courseId === "algebra"), false);
    fs.writeFileSync(path.join(directory, "high-school-math/algebra.json"), JSON.stringify(alias));
    assert.throws(() => builder.loadWeekly(options), /unexpected course file/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.rmSync(output, { recursive: true, force: true });
  }
});

// A direct visit must not inherit the build index's descending grade order.
test("weekly entry starts at kindergarten while explicit course links retain their week", () => {
  const courses = [
    { trackId: "common-core-math", grade: 12 },
    { trackId: "common-core-reading", grade: 0 },
    { trackId: "common-core-math", grade: 0 },
  ];
  for (const order of [courses, courses.slice().reverse()]) {
    const selected = weekly.resolve({ courses: order }, "");
    assert.equal(selected.trackId, "common-core-math");
    assert.equal(selected.grade, 0);
    assert.equal(selected.week, 1);
    assert.equal(selected.invalid, false);
    const direct = weekly.resolve({ courses: order }, "#common-core-math/12/18");
    assert.equal(direct.grade, 12);
    assert.equal(direct.week, 18);
  }
});
