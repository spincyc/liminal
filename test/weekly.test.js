"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const weekly = require("../src/lib/weekly");
const builder = require("../tools/build-weekly");
const { loadCurriculum } = require("../tools/build-curriculum");
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
  assert.deepEqual(weekly.navigation(data, weekly.resolve(data, "")), { previous: null, next: "#common-core-math/12/2" });
  assert.deepEqual(weekly.navigation(data, weekly.resolve(data, "#common-core-math/12/36")), { previous: "#common-core-math/12/35", next: null });
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
