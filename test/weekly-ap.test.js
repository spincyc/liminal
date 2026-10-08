"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const W = require("../src/lib/weekly");
const builder = require("../tools/build-weekly");
const { inspect } = require("../tools/check-weekly");
const { checkFigureSvg, loadFigureDirectory, MAX_FIGURE_BYTES } = require("../tools/lib/weekly-figures");
const { loadCurriculum } = require("../tools/build-curriculum");
const F = require("./fixtures/weekly-ap");
const curriculum = loadCurriculum();
const plan = builder.normalizeNamedPlan("ap", F.plan(), curriculum);
const scratch = path.resolve(__dirname, "../.scratch/weekly-engine");

function validate(course, figures = F.figures()) { return builder.validateCourse(course, plan, { figures }); }
function reject(change, pattern, figures) {
  const course = F.course(); const files = figures || F.figures();
  change(course, files);
  assert.throws(() => validate(course, files), pattern);
}
function withTemp(callback) {
  fs.mkdirSync(scratch, { recursive: true });
  const directory = fs.mkdtempSync(path.join(scratch, "ap-fixture-"));
  const output = fs.mkdtempSync(path.join(scratch, "ap-dist-"));
  try { return callback(directory, output); } finally {
    fs.rmSync(directory, { recursive: true, force: true }); fs.rmSync(output, { recursive: true, force: true });
  }
}

test("the AP track is registry-driven: routes, labels, context, plan links and notice", () => {
  assert.deepEqual(W.namedCourses("ap"), ["calculus-ab", "physics-1", "physics-c-mechanics"]);
  assert.ok(W.TRACKS.includes("ap"));
  assert.deepEqual(W.NAMED_COURSES, ["algebra", "geometry", "algebra-2", "trigonometry", "calculus"]);
  assert.equal(W.route("ap", "physics-c-mechanics", 36), "#ap/physics-c-mechanics/36");
  assert.equal(W.route("ap", "calculus", 1), "");
  assert.equal(W.route("high-school-math", "calculus-ab", 1), "");
  assert.equal(W.route("ap", 12, 1), "");
  assert.equal(W.planRoute("ap", "physics-1"), "ap.html#physics-1");
  assert.equal(W.planRoute("high-school-math", "calculus"), "high-school.html#calculus");
  assert.equal(W.planRoute("common-core-math", 0), "curriculum.html#common-core-math/k");
  assert.equal(W.planRoute("ap", "../x"), "");
  assert.equal(W.trackLabel("ap"), "Courses for AP® exams");
  assert.equal(W.courseContext("ap"), "Prepares for the AP® exam · flexible placement");
  assert.equal(W.trackNotice("ap"), "AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.");
  assert.equal(W.trackNotice("high-school-math"), "");
  assert.equal(W.trackNotice("constructor"), ""); assert.equal(W.trackLabel("toString"), "");
  assert.equal(W.courseLabel({ trackId: "ap", courseId: "physics-1" }), "Physics 1");
  assert.equal(W.courseShortLabel({ trackId: "ap", courseId: "physics-1", title: "Course for AP® Physics 1" }), "Physics 1");
  assert.equal(W.courseShortLabel({ trackId: "common-core-math", grade: 0 }), "Kindergarten");
  const data = { courses: [{ trackId: "ap", courseId: "calculus-ab", weeks: [] }] };
  const selected = W.resolve(data, "#ap/calculus-ab/7");
  assert.equal(selected.courseId, "calculus-ab"); assert.equal(selected.week, 7); assert.equal(selected.invalid, false);
  for (const hash of ["#ap/Calculus-AB/1", "#ap/calculus-ab/0", "#ap/calculus/1", "#ap/calculus-ab/1/x"]) assert.equal(W.resolve(data, hash).invalid, true, hash);
  assert.equal(W.calculatorLabel("graphing"), "Graphing calculator"); assert.equal(W.calculatorLabel("abacus"), ""); assert.equal(W.calculatorLabel("__proto__"), "");
});

test("AP plans use the named-plan contract with three authored courses and no aliases", () => {
  assert.deepEqual(plan.courses.map(c => c.id), W.namedCourses("ap"));
  function rejectPlan(change, pattern) { const data = F.plan(); change(data); assert.throws(() => builder.normalizeNamedPlan("ap", data, curriculum), pattern); }
  rejectPlan(p => p.courses.pop(), /three courses/);
  rejectPlan(p => p.courses[0].id = "calculus", /invalid AP course ID|duplicate/);
  rejectPlan(p => { p.courses[0].source = { trackId: "common-core-math", grade: 12 }; }, /cannot alias/);
  rejectPlan(p => p.courses[1].units[1].weeks = 32, /pacing/);
  rejectPlan(p => p.track.id = "high-school-math", /invalid AP plan/);
  rejectPlan(p => p.sources[0].url = "http://example.org", /source URL/);
});

test("the fixture course with every optional field is admitted; identities include figures and choices", () => {
  assert.equal(validate(F.course()).weeks.length, 36);
  const files = F.figures();
  const passages = [];
  const svg = id => files.get(id);
  const a = { prompt: "Find the slope.", passageIds: [], figureIds: ["fx-w01-f1"] };
  const b = { ...a, figureIds: ["fx-w01-f2"] };
  assert.notEqual(builder.taskIdentity(a, passages, svg), builder.taskIdentity(b, passages, svg));
  assert.equal(builder.taskIdentity({ prompt: "P", passageIds: [] }, passages), JSON.stringify(["p", []]));
  assert.notEqual(builder.taskIdentity({ prompt: "P", passageIds: [], choices: ["1", "2", "3", "4"] }, passages), builder.taskIdentity({ prompt: "P", passageIds: [], choices: ["1", "2", "3", "5"] }, passages));
  // The same prompt and drawing is still a duplicate.
  reject(c => { c.weeks[1].worksheets[1].items[0] = { ...c.weeks[1].worksheets[1].items[0], prompt: c.weeks[0].worksheets[1].items[0].prompt }; c.weeks[1].figures.push({ id: "fx-copy", alt: "Copy" }); c.weeks[1].worksheets[1].items[0].figureIds = ["fx-copy"]; },
    /duplicate displayed task/, new Map([...F.figures(), ["fx-copy", F.figures().get("fx-w01-f2")]]));
});

test("figure references resolve, every figure and file is used, and key-only figures stay key-only", () => {
  reject(c => c.weeks[0].worksheets[0].items[0].figureIds = ["fx-missing"], /unresolved figure/);
  reject(c => c.weeks[1].worksheets[0].items[0].figureIds = ["fx-w01-f1"], /unresolved figure/); // declared in another week
  reject(c => c.weeks[0].worksheets[0].items[0].figureIds = [], /empty or invalid figureIds/);
  reject(c => c.weeks[0].explanationFigureIds = ["fx-w01-f2", "fx-w01-f2"], /duplicate/);
  reject((c, files) => files.delete("fx-w03-f3"), /missing figure file fx-w03-f3/);
  reject((c, files) => files.set("fx-orphan", files.get("fx-w03-f3")), /unreferenced figure file fx-orphan/);
  reject(c => c.weeks[2].figures.push({ id: "fx-w03-f3", alt: "Again" }), /duplicate figure ID/);
  reject(c => { c.weeks[0].worksheets[0].items[0].figureIds = ["fx-w01-f2"]; delete c.weeks[0].explanationFigureIds; delete c.weeks[0].examples[0].figureIds; c.weeks[0].worksheets[1].items[0].figureIds = ["fx-w01-f2"]; }, /unreferenced figure fx-w01-f1/);
  reject(c => c.weeks[1].worksheets[1].items[0].figureIds = ["fx-w02-f2"], /both a given and answer-only/);
  reject(c => c.weeks[0].figures[0].svg = "inline drawing", /invalid figure fields/);
  reject(c => c.weeks[0].figures[0].alt = "", /alt/);
  reject(c => c.weeks[0].figures[0].id = "Fx_Bad", /invalid figure ID/);
  reject(c => c.weeks[0].figures[0].notToScale = "yes", /notToScale/);
  reject(c => c.weeks[0].figures = {}, /invalid figures/);
});

test("multiple choice, free response, calculator and minutes fields are checked", () => {
  const item = c => c.weeks[0].worksheets[0].items[0];
  reject(c => item(c).choices.pop(), /exactly four choices/);
  reject(c => item(c).choices[3] = " 3 ", /duplicate choices/);
  reject(c => item(c).choices[1] = "", /choices/);
  reject(c => item(c).key = "E", /key letter/);
  reject(c => delete item(c).key, /key letter/);
  reject(c => { delete item(c).choices; }, /exactly four choices/);
  reject(c => item(c).points = 1, /multiple choice cannot carry points/);
  const free = c => c.weeks[1].worksheets[0].items[0];
  reject(c => free(c).points = 4, /sum/);
  reject(c => delete free(c).rubric, /rubric/);
  reject(c => free(c).rubric = [], /rubric/);
  reject(c => free(c).rubric[0].points = 0, /invalid rubric row/);
  reject(c => free(c).rubric[0].note = "extra", /invalid rubric row/);
  reject(c => free(c).rubric[0].criterion = "", /criterion/);
  reject(c => free(c).points = 2.5, /integer/);
  reject(c => delete free(c).points, /points/);
  reject(c => c.weeks[0].worksheets[0].calculator = "four-function", /calculator policy/);
  reject(c => c.weeks[0].worksheets[0].minutes = 0, /minutes/);
  reject(c => c.weeks[0].worksheets[0].minutes = "15", /minutes/);
  reject(c => item(c).choices[0] = "<b>bold</b>", /non-plain text/);
  for (const policy of Object.keys(W.CALCULATOR)) { const c = F.course(); c.weeks[0].worksheets[2].calculator = policy; assert.doesNotThrow(() => validate(c)); }
});

test("AP identity is exact: named courses only, no grade, no alias files", () => {
  reject(c => c.courseId = "calculus", /named course identity/);
  reject(c => c.grade = 12, /named course identity/);
  const hs = builder.loadHighSchool(curriculum);
  const algebra = F.course(); algebra.trackId = "high-school-math"; algebra.courseId = "algebra";
  assert.throws(() => builder.validateCourse(algebra, hs, { figures: F.figures() }), /named course identity/);
});

test("figure files are admitted only when the renderer keeps them intact", () => {
  for (const svg of F.figures().values()) assert.doesNotThrow(() => checkFigureSvg(svg));
  const ok = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10" stroke="currentColor"/></svg>';
  assert.doesNotThrow(() => checkFigureSvg(ok));
  const body = '<line x1="0" y1="0" x2="10" y2="10" stroke="currentColor"/>';
  const wrap = (inner, root = 'viewBox="0 0 10 10"') => `<svg xmlns="http://www.w3.org/2000/svg" ${root}>${inner}</svg>`;
  const bad = {
    marker: wrap('<defs><marker id="m"><path d="M0 0L5 5"/></marker></defs>' + body),
    clip: wrap('<clipPath id="c"><rect width="5" height="5"/></clipPath>' + body),
    script: wrap('<script>alert(1)</script>' + body),
    style: wrap('<style>line{stroke:red}</style>' + body),
    handler: wrap('<line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" onclick="alert(1)"/>'),
    link: wrap('<a href="https://example.org">' + body + "</a>"),
    image: wrap('<image href="https://example.org/x.png" width="5" height="5"/>'),
    use: wrap('<use href="#x"/>' + body),
    externalPaint: wrap('<rect width="5" height="5" fill="url(https://example.org/p)"/>'),
    color: wrap('<line x1="0" y1="0" x2="10" y2="10" stroke="red"/>'),
    title: wrap("<title>Hidden</title>" + body),
    textOutside: wrap("stray words" + body),
    noViewBox: wrap(body, 'width="10" height="10"'),
    zeroViewBox: wrap(body, 'viewBox="0 0 0 10"'),
    notSvg: "<html><body/></html>",
    malformed: wrap("<line>"),
    doctype: '<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">' + body + "</svg>",
    noNamespace: '<svg viewBox="0 0 10 10">' + body + "</svg>",
    empty: wrap(""),
    huge: wrap(body.repeat(Math.ceil(MAX_FIGURE_BYTES / body.length) + 1)),
  };
  for (const [name, svg] of Object.entries(bad)) assert.throws(() => checkFigureSvg(svg, name), /Weekly figure/, name);
});

test("loading admits figure directories, inlines figures and enforces the course budget", () => withTemp((directory, output) => {
  F.writeContent(directory);
  const options = { directory, curriculum, plans: { ap: plan }, output };
  const loaded = builder.loadWeekly(options);
  const course = loaded.courses.find(c => c.trackId === "ap");
  assert.equal(course.courseTitle, "Course for AP® Calculus AB");
  assert.equal(course.weeks[0].figures[0].svg, F.figures().get("fx-w01-f1"));
  assert.equal(inspect(options).figures, 7);
  // The release inventory requires every AP course.
  assert.deepEqual(inspect(options).missing.filter(c => c.trackId === "ap").map(c => c.courseId), ["physics-1", "physics-c-mechanics"]);
  const built = builder.build(options);
  assert.deepEqual(built.courses.map(c => c.file), ["content/weekly/ap/calculus-ab.json"]);
  const json = JSON.parse(fs.readFileSync(path.join(output, built.courses[0].file), "utf8"));
  assert.deepEqual(json, course);
  for (const [id, svg] of F.figures()) assert.equal(fs.readFileSync(path.join(output, "content/weekly/figures/ap/calculus-ab", id + ".svg"), "utf8"), svg);
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(output, "content/ap-plan.js"), "utf8"), context);
  assert.equal(JSON.stringify(context.window.LIMINAL_AP_PLAN), JSON.stringify(plan));
  assert.ok(fs.existsSync(path.join(output, "content/high-school.js")));
  // A build without an AP plan removes the stale bundle.
  fs.rmSync(path.join(directory, "ap"), { recursive: true }); fs.rmSync(path.join(directory, "figures"), { recursive: true });
  builder.build({ ...options, plans: { ap: null } });
  assert.equal(fs.existsSync(path.join(output, "content/ap-plan.js")), false);
  F.writeContent(directory);
  // Unexpected entries and orphan directories fail.
  fs.writeFileSync(path.join(directory, "figures/ap/calculus-ab/notes.txt"), "x");
  assert.throws(() => builder.loadWeekly(options), /unexpected entry notes.txt/);
  fs.rmSync(path.join(directory, "figures/ap/calculus-ab/notes.txt"));
  fs.mkdirSync(path.join(directory, "figures/ap/physics-1"));
  assert.throws(() => builder.loadWeekly(options), /figure directory without a course: ap\/physics-1/);
  fs.rmSync(path.join(directory, "figures/ap/physics-1"), { recursive: true });
  fs.writeFileSync(path.join(directory, "figures/ap/calculus-ab/fx-orphan.svg"), F.figures().get("fx-w01-f1"));
  assert.throws(() => builder.loadWeekly(options), /unreferenced figure file fx-orphan/);
  fs.rmSync(path.join(directory, "figures/ap/calculus-ab/fx-orphan.svg"));
  fs.writeFileSync(path.join(directory, "figures/ap/calculus-ab/fx-w01-f1.svg"), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><line x1="0" y1="0" x2="1" y2="1" stroke="red"/></svg>');
  assert.throws(() => builder.loadWeekly(options), /fx-w01-f1.svg: uses stroke="red"/);
  F.writeContent(directory);
  assert.throws(() => builder.loadWeekly({ ...options, plans: { ap: null } }), /missing year plan/);
  fs.writeFileSync(path.join(directory, "ap/calculus.json"), "{}");
  assert.throws(() => builder.loadWeekly(options), /unexpected course file calculus.json/);
  fs.rmSync(path.join(directory, "ap/calculus.json"));
  // Budget: the source file, then the built file with figures inlined.
  const big = F.course();
  big.weeks[3].explanation[0] = "x ".repeat(1.3 * 1024 * 1024);
  fs.writeFileSync(path.join(directory, "ap/calculus-ab.json"), JSON.stringify(big));
  assert.throws(() => builder.loadWeekly(options), /course file exceeds 2.5 MB/);
  big.weeks[3].explanation[0] = "x ".repeat(1.15 * 1024 * 1024);
  const filler = '<circle cx="5" cy="5" r="4" fill="none" stroke="currentColor"/>';
  const heavy = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">' + filler.repeat(170) + "</svg>";
  big.weeks[3].figures = [];
  big.weeks[3].worksheets.forEach(sheet => sheet.items.forEach((item, i) => {
    const id = "fx-heavy-" + sheet.id + i; big.weeks[3].figures.push({ id, alt: "Heavy" }); item.figureIds = [id];
    fs.writeFileSync(path.join(directory, "figures/ap/calculus-ab", id + ".svg"), heavy.replace("r=\"4\"", "r=\"" + (i + 1) / 10 + "\"").replace("cx=\"5\"", "cx=\"" + sheet.id.charCodeAt(0) + "\""));
  }));
  fs.writeFileSync(path.join(directory, "ap/calculus-ab.json"), JSON.stringify(big));
  assert.ok(fs.statSync(path.join(directory, "ap/calculus-ab.json")).size < builder.MAX_COURSE_BYTES);
  assert.throws(() => builder.loadWeekly(options), /built course with figures exceeds 2.5 MB/);
}));

test("student projections carry choices, points, policies and given figures but never keys, rubrics or key-only figures", () => {
  const course = builder.withFigures(F.course(), F.figures());
  const student = W.studentWorksheet(course, 2, "a");
  const key = W.answerWorksheet(course, 2, "a");
  const text = JSON.stringify(student);
  assert.equal(student.worksheet.calculator, "none");
  assert.equal(student.worksheet.items[0].points, 3);
  assert.deepEqual(student.figures.map(f => f.id), ["fx-w02-f1"]);
  assert.equal(student.figures[0].svg, F.figures().get("fx-w02-f1"));
  for (const forbidden of ['"rubric"', '"answerFigureIds"', '"key"', '"answer"', '"steps"', "fx-w02-f2", "Key sketch", "Curve passes through"]) assert.ok(!text.includes(forbidden), forbidden);
  assert.deepEqual(key.figures.map(f => f.id), ["fx-w02-f1", "fx-w02-f2"]);
  assert.equal(key.worksheet.items[0].rubric.length, 3);
  assert.deepEqual(key.worksheet.items[0].answerFigureIds, ["fx-w02-f2"]);
  const mc = W.studentWorksheet(course, 1, "a");
  assert.deepEqual(mc.worksheet.items[0].choices, ["0", "1", "3", "9"]);
  assert.equal(mc.worksheet.minutes, 15);
  assert.ok(!JSON.stringify(mc).includes('"key"'));
  assert.equal(W.answerWorksheet(course, 1, "a").worksheet.items[0].key, "C");
  // Unknown future fields and figure metadata never pass through.
  course.weeks[1].worksheets[0].items[0].teacherNote = "SECRET";
  course.weeks[1].figures[0].privateNote = "SECRET";
  assert.ok(!JSON.stringify(W.studentWorksheet(course, 2, "a")).includes("SECRET"));
  assert.ok(!JSON.stringify(W.answerWorksheet(course, 2, "a")).includes("SECRET"));
  // Projections copy arrays rather than sharing them.
  W.answerWorksheet(course, 1, "a").worksheet.items[0].choices.push("changed");
  assert.equal(course.weeks[0].worksheets[0].items[0].choices.length, 4);
  // Sheets without the new fields project exactly as before.
  assert.deepEqual(Object.keys(W.studentWorksheet(course, 4, "a")), ["format", "version", "trackId", "courseId", "courseTitle", "week", "title", "worksheet", "passages"]);
  assert.deepEqual(Object.keys(W.studentWorksheet(course, 4, "a").worksheet.items[0]), ["id", "prompt", "passageIds", "skill"]);
});
