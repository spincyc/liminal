"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../src/lib/courses/math.js");
const E = require("../src/lib/courses/engine.js");

const course = { id: "test-course", title: "Test course", version: 1, units: [
  { id: "one", lessons: [{ id: "a" }, { id: "b" }] },
] };
const template = (id, lessonId, size = 100000) => ({ id, lessonId, skill: "Addition", generate(rng) {
  const a = rng.int(1, size);
  return { prompt: `${id}: Add ${a} and 1.`, answer: String(a + 1), steps: ["Add one."], workLines: 3 };
} });
const templates = [template("aa", "a"), template("ab", "a"), template("bb", "b")];

test("nightly guides follow actual questions in course order, not every selected lesson", () => {
  const sheet = { lessonIds: ["a", "b"], questions: [{ lessonId: "b" }, { lessonId: "b" }] };
  assert.deepEqual(E.nightlyLessons(course, sheet), ["b"]);
  sheet.questions.push({ lessonId: "a" });
  assert.deepEqual(E.nightlyLessons(course, sheet), ["a", "b"]);
  assert.throws(() => E.nightlyLessons(course, { questions: [] }), /needs questions/);
  assert.throws(() => E.nightlyLessons(course, { questions: [{ lessonId: "missing" }] }), /unknown lesson/);
});

test("duplex packets never share a physical sheet between sections or nights", () => {
  const rng = M.random("duplex-parity");
  for (let draw = 0; draw < 300; draw += 1) {
    const components = Array.from({ length: 6 }, (_, index) => ({ night: 1 + Math.floor(index / 3), kind: ["guide", "student", "answers"][index % 3], pageCount: rng.int(1, 20) }));
    const original = JSON.stringify(components);
    const plan = E.packetPagePlan(components);
    const sheetOwners = new Map();
    for (const [index, part] of plan.entries()) {
      assert.equal(part.startPage % 2, 1);
      for (let page = part.startPage; page < part.startPage + part.pageCount; page += 1) {
        const physicalSheet = Math.floor((page - 1) / 2);
        if (sheetOwners.has(physicalSheet)) assert.equal(sheetOwners.get(physicalSheet), index);
        sheetOwners.set(physicalSheet, index);
      }
      assert.equal(part.blankAfter, part.pageCount % 2 === 1 && index < plan.length - 1);
    }
    assert.equal(JSON.stringify(components), original);
    const single = E.packetPagePlan(components, { duplex: false });
    assert.ok(single.every(part => !part.blankAfter));
    assert.equal(single.at(-1).startPage + single.at(-1).pageCount - 1, components.reduce((sum, part) => sum + part.pageCount, 0));
  }
});

test("packet page planning handles odd and even parts without trailing separator pages", () => {
  const parts = [1, 2, 3, 2, 1, 1].map((pageCount, index) => ({ night: 1 + Math.floor(index / 3), kind: ["guide", "student", "answers"][index % 3], pageCount }));
  assert.deepEqual(E.packetPagePlan(parts).map(part => [part.startPage, part.blankAfter]), [[1, true], [3, false], [5, true], [9, false], [11, true], [13, false]]);
  assert.deepEqual(E.packetPagePlan([]), []);
  for (const pageCount of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => E.packetPagePlan([{ night: 1, kind: "guide", pageCount }]));
  }
  assert.throws(() => E.packetPagePlan([{ night: 0, kind: "student", pageCount: 2 }]));
  assert.throws(() => E.packetPagePlan([{ night: 1, kind: "unknown", pageCount: 2 }]));
});

test("course random helpers are reproducible and fractions exact", () => {
  const a = M.random("nights"); const b = M.random("nights");
  assert.deepEqual(Array.from({ length: 100 }, () => a.int(-4, 7)), Array.from({ length: 100 }, () => b.int(-4, 7)));
  for (let i = 0; i < 100; i++) assert.notEqual(a.nonzero(-3, 3), 0);
  assert.equal(M.fraction(6, -8), "−3/4");
  assert.equal(M.fraction(0, 7), "0");
  assert.throws(() => M.fraction(3, 0));
});

test("packet replay, balanced coverage, and no repeated visible exercises", () => {
  const options = { seed: "first-week", count: 20, days: 10, lessonIds: ["a", "b"] };
  const packet = E.generatePacket(course, templates, options);
  assert.deepEqual(packet, E.generatePacket(course, templates, options));
  const signatures = packet.flatMap(s => s.identities);
  assert.equal(new Set(signatures).size, 200);
  packet.forEach((sheet, index) => {
    assert.equal(sheet.day, index + 1);
    assert.equal(sheet.packetSeed, options.seed);
    assert.equal(sheet.questions.filter(q => q.lessonId === "a").length, 10);
    assert.deepEqual(sheet.questions.map(q => q.number), Array.from({ length: 20 }, (_, i) => i + 1));
    assert.ok(sheet.questions.filter(q => q.lessonId === "a").some(q => q.templateId === "ab"));
    assert.deepEqual(sheet.warnings, []);
  });
  assert.notDeepEqual(packet, E.generatePacket(course, templates, { ...options, seed: "second-week" }));
});

test("worksheet code binds version and lesson selection canonicalizes order", () => {
  const first = E.generateWorksheet(course, templates, { seed: "x", count: 8, lessonIds: ["a", "b"] });
  const reordered = E.generateWorksheet(course, templates, { seed: "x", count: 8, lessonIds: ["b", "a"] });
  assert.deepEqual(first, reordered);
  const revised = E.generateWorksheet({ ...course, revision: "new-version" }, templates, { seed: "x", count: 8 });
  assert.notEqual(first.code, revised.code);
});

test("finite pools refuse repetitions both across nights and within a sheet", () => {
  const fixed = [template("one", "a", 1)];
  assert.throws(() => E.generatePacket(course, fixed, { seed: "limited", count: 1, days: 2, lessonIds: ["a"] }), /enough distinct.*fewer questions or nights/);
  assert.throws(() => E.generateWorksheet(course, fixed, { count: 2, lessonIds: ["a"] }), /enough distinct/);
});

test("cosmetic variants cannot disguise repeated mathematical practice", () => {
  const renamed = [{ id: "rename", lessonId: "a", skill: "Powers", generate(r) {
    return { prompt: `Simplify ${r.pick(["m", "p", "x"])}^2 times itself.`, practiceKey: "square-times-square", answer: "fourth power", steps: ["Add the exponents."], workLines: 3 };
  } }];
  assert.throws(() => E.generatePacket(course, renamed, { lessonIds: ["a"], count: 1, days: 2 }), /enough distinct/);
  const mislabeled = [{ ...renamed[0], generate(r) {
    return { ...renamed[0].generate(r), prompt: "Simplify x^2 times itself.", practiceKey: String(r.int(1, 10000)) };
  } }];
  assert.throws(() => E.generateWorksheet(course, mislabeled, { lessonIds: ["a"], count: 2 }), /enough distinct/);
});

test("packets balance all selected lessons and their designs across night boundaries", () => {
  const many = { ...course, units: [{ id: "many", lessons: Array.from({ length: 36 }, (_, i) => ({ id: String(i) })) }] };
  const designs = E.lessons(many).flatMap(l => [template(l.id + "a", l.id), template(l.id + "b", l.id)]);
  const packet = E.generatePacket(many, designs, { seed: "cold-coverage-27", count: 20, days: 10 });
  const questions = packet.flatMap(s => s.questions);
  for (const lesson of E.lessons(many)) {
    const matching = questions.filter(q => q.lessonId === lesson.id);
    assert.ok(matching.length === 5 || matching.length === 6);
    assert.ok(Math.abs(matching.filter(q => q.templateId.endsWith("a")).length - matching.filter(q => q.templateId.endsWith("b")).length) <= 1);
  }
  assert.equal(new Set(questions.map(E.identity)).size, 200);
});

test("exhausted designs cannot be silently replaced with a different practice mode", () => {
  const scarce = [template("graph", "a", 1), template("table", "a")];
  assert.throws(() => E.generatePacket(course, scarce, { lessonIds: ["a"], count: 2, days: 2 }), /enough distinct/);
  const small = E.generatePacket(course, templates, { count: 1, days: 1 });
  assert.match(small[0].warnings[0], /fewer questions than selected lessons/);
});

test("invalid configuration and malformed generated items fail visibly", () => {
  for (const count of [0, -1, 101, 1.5, "no"]) assert.throws(() => E.generateWorksheet(course, templates, { count }));
  for (const days of [0, 31, 1.2]) assert.throws(() => E.generatePacket(course, templates, { days }));
  assert.throws(() => E.generateWorksheet(course, templates, { lessonIds: [] }));
  assert.throws(() => E.generateWorksheet(course, templates, { lessonIds: ["missing"] }));
  assert.throws(() => E.generateWorksheet(course, [], { lessonIds: ["a"] }));
  assert.throws(() => E.validateQuestion({ prompt: "P", answer: "A", steps: [], workLines: 3 }));
  assert.throws(() => E.validateGraph({ xMin: 0, xMax: 1, yMin: 0, yMax: 1, xStep: 0, yStep: 1 }));
});

test("every night has three full, replayable alternatives with matching scope and unique exercises", () => {
  const settings = { seed: "three-full-worksheets", days: 3, count: 12, lessonIds: ["a", "b"] };
  const nights = E.generatePacketChoices(course, templates, settings);
  assert.deepEqual(nights, E.generatePacketChoices(course, templates, settings));
  assert.equal(nights.length, 3);
  const all = nights.flatMap(night => night.worksheets);
  assert.equal(new Set(all.map(sheet => sheet.code)).size, 9);
  assert.equal(new Set(all.flatMap(sheet => sheet.identities)).size, 108);
  assert.equal(new Set(all.flatMap(sheet => sheet.visibleIdentities)).size, 108);
  for (const night of nights) {
    assert.deepEqual(night.worksheets.map(sheet => sheet.worksheetVariant), ["A", "B", "C"]);
    for (const sheet of night.worksheets) {
      assert.equal(sheet.day, night.day);
      assert.equal(sheet.days, 3);
      assert.equal(sheet.packetSeed, settings.seed);
      assert.equal(sheet.questions.length, settings.count);
      assert.deepEqual(sheet.questions.map(q => q.number), Array.from({ length: 12 }, (_, i) => i + 1));
      assert.deepEqual(sheet.questions.map(q => q.templateId), night.worksheets[0].questions.map(q => q.templateId));
      assert.ok(sheet.questions.every(q => q.answer && q.steps.length));
    }
  }
  assert.ok(nights.every(night => night.worksheets.every(sheet => sheet.questions.filter(q => q.lessonId === "a").length === 6)));
  assert.equal(E.generatePacketChoices(course, templates, { seed: "s".repeat(140), days: 30, count: 1 })[29].worksheets.length, 3);
});

test("packet printing selects each night's worksheet and its original key without regeneration", () => {
  const nights = E.generatePacketChoices(course, templates, { seed: "select-worksheets", days: 3, count: 8 });
  const before = JSON.stringify(nights);
  const choices = { 1: "B", 2: "C", 3: "A" };
  const selected = E.selectPacketWorksheets(nights, choices);
  assert.deepEqual(selected.map(sheet => sheet.worksheetVariant), ["B", "C", "A"]);
  assert.equal(selected[0], nights[0].worksheets[1]);
  assert.equal(selected[1], nights[1].worksheets[2]);
  assert.deepEqual(E.selectPacketWorksheets(nights).map(sheet => sheet.worksheetVariant), ["A", "A", "A"]);
  assert.equal(JSON.stringify(nights), before);
  assert.throws(() => E.selectPacketWorksheets(nights, { 1: "D" }), /available worksheet/);
  assert.throws(() => E.selectPacketWorksheets(nights, { 4: "A" }), /available night/);
  assert.throws(() => E.selectPacketWorksheets([nights[0], nights[0]]), /Invalid worksheet night/);
});

test("three-worksheet requests refuse undersized pools and count coverage per printed choice", () => {
  const twoItems = [template("tiny", "a", 2)];
  assert.throws(() => E.generatePacketChoices(course, twoItems, { days: 1, count: 1, lessonIds: ["a"] }), /Three full worksheets.*distinct/);
  const nights = E.generatePacketChoices(course, templates, { days: 1, count: 1 });
  assert.ok(nights[0].worksheets.every(sheet => sheet.warnings.some(warning => warning.includes("fewer questions than selected lessons"))));
  for (const settings of [{ days: 0 }, { days: 31 }, { count: 0 }, { count: 101 }, { seed: "" }, { seed: "x".repeat(141) }]) {
    assert.throws(() => E.generatePacketChoices(course, templates, settings));
  }
});

test("real Topic 1 provides three complete ten-night practice choices without repetitions", () => {
  const actual = require("../content/courses/grade-8-math.json");
  const nights = E.generatePacketChoices(actual, E.templatesForCourse(actual.id), { lessonIds: actual.units[0].lessons.map(lesson => lesson.id), days: 10, count: 20, seed: "three-topic-1" });
  const sheets = nights.flatMap(night => night.worksheets);
  assert.equal(sheets.length, 30);
  assert.equal(new Set(sheets.flatMap(sheet => sheet.identities)).size, 600);
  assert.equal(new Set(sheets.flatMap(sheet => sheet.visibleIdentities)).size, 600);
  const selected = E.selectPacketWorksheets(nights, Object.fromEntries(nights.map((night, i) => [night.day, E.WORKSHEET_VARIANTS[i % 3]])));
  assert.equal(selected.flatMap(sheet => sheet.questions).length, 200);
  assert.equal(new Set(selected.flatMap(sheet => sheet.questions.map(q => q.lessonId))).size, 11);
});
