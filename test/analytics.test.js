"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const Analytics = require("../src/lib/analytics");
const Runs = require("../src/lib/runs");
const Practice = require("../src/lib/practice");
const catalog = require("../content/catalog.json");
const mathFamilies = require("../src/lib/families/sat/math");
const mathRegistry = require("../content/templates/sat-math.json");
const rwFamilies = require("../src/lib/families/sat/reading-writing");
const rwRegistry = require("../content/templates/sat-reading-writing.json");

const section = (key) => catalog.sections.find((entry) => entry.key === key);

// A small catalog: two Algebra skills and one Geometry skill.
const SECTIONS = [{
  key: "sat-math",
  domains: [
    { name: "Algebra", target: 35, skills: { "Linear functions": ["a"], "Linear inequalities": ["b"] } },
    { name: "Geometry and Trigonometry", target: 15, skills: { Circles: ["c"] } },
  ],
}];

let counter = 0;
function attempt(fields) {
  counter += 1;
  return Object.assign({
    id: `a${counter}`,
    questionId: `sat-math:t${counter}:s${counter}`,
    sectionKey: "sat-math",
    test: "SAT",
    domain: "Algebra",
    skill: "Linear functions",
    difficulty: "Medium",
    source: "template",
    correct: true,
    answered: true,
    hinted: false,
    timeMs: 60000,
    sessionId: "s1",
    // Three hours apart, so any 15 answers span at least two calendar days
    // in every time zone (the gate and Mastered windows need two).
    timestamp: counter * 3 * 3600 * 1000,
  }, fields);
}

function many(count, fields) {
  return Array.from({ length: count }, () => attempt(fields));
}

function rowFor(rows, skill) {
  return rows.find((row) => row.skill === skill);
}

test("registry entries re-tier answers without the template bundles", () => {
  const info = Analytics.registryTemplateInfo({
    "sat-math": {
      templates: [
        { id: "live", bit: 0, version: 2, difficulty: "Hard", domain: "Algebra", skill: "Linear functions", subskill: "slope" },
        { id: "retired", bit: 1, retired: true, difficulty: "Easy" },
        { id: "no-tier", bit: 2 },
      ],
    },
    "act-english": { templates: [] },
  });
  assert.deepEqual(info, {
    "sat-math": {
      live: { difficulty: "Hard", domain: "Algebra", skill: "Linear functions", subskill: "slope", version: 2 },
    },
  });
  const merged = Analytics.mergeTemplateInfo(info, { "sat-math": { live: { difficulty: "Medium", version: 3 } } });
  assert.equal(merged["sat-math"].live.difficulty, "Medium");
});

test("the skill map lists every catalog skill with its practice state", () => {
  const attempts = [
    // Linear functions: 24 of 30 Medium but no Hard yet -> at the gate.
    ...many(24, { skill: "Linear functions" }),
    ...many(6, { skill: "Linear functions", correct: false }),
    // Linear inequalities: 4 answers -> not enough data.
    ...many(4, { skill: "Linear inequalities" }),
  ];
  const rows = Analytics.skillMap(attempts, SECTIONS);
  assert.deepEqual(rows.map((row) => row.skill), ["Linear functions", "Linear inequalities", "Circles"]);
  const functions = rowFor(rows, "Linear functions");
  assert.equal(functions.state, "at-gate");
  const { days, ...gate } = functions.gate;
  assert.deepEqual(gate, { attempted: 30, correct: 24, accuracy: 0.8, window: 30, needed: 24, templates: 30, met: true });
  assert.ok(days >= 2);
  assert.deepEqual(functions.medium, { attempted: 30, correct: 24, accuracy: 0.8 });
  assert.deepEqual(functions.hard, { attempted: 0, correct: 0, accuracy: null });
  assert.equal(rowFor(rows, "Linear inequalities").state, "not-enough-data");
  const circles = rowFor(rows, "Circles");
  assert.equal(circles.state, "not-started");
  assert.equal(circles.domain, "Geometry and Trigonometry");
  assert.equal(circles.accuracy, null);
});

test("the gate needs 24 of the last 30 Medium answers", () => {
  // Twenty-nine perfect Medium answers are not yet the gate.
  let rows = Analytics.skillMap(many(29, {}), SECTIONS);
  assert.equal(rowFor(rows, "Linear functions").state, "building");
  assert.equal(rowFor(rows, "Linear functions").gate.met, false);

  // Old misses age out of the window: ten wrong, then thirty right.
  rows = Analytics.skillMap([...many(10, { correct: false }), ...many(30, {})], SECTIONS);
  const row = rowFor(rows, "Linear functions");
  assert.deepEqual([row.gate.attempted, row.gate.correct, row.gate.met], [30, 30, true]);
  assert.equal(row.medium.attempted, 40);

  // 23 of 30 is below the gate; Hard and Easy answers never fill the window.
  rows = Analytics.skillMap([
    ...many(23, {}), ...many(7, { correct: false }),
    ...many(10, { difficulty: "Hard" }), ...many(10, { difficulty: "Easy" }),
  ], SECTIONS);
  assert.deepEqual([rowFor(rows, "Linear functions").gate.correct, rowFor(rows, "Linear functions").gate.attempted], [23, 30]);
  assert.equal(rowFor(rows, "Linear functions").state, "building");
});

test("a question answered again counts once, at its first answer", () => {
  const firsts = [...many(8, { correct: false }), ...many(22, {})];
  // The eight misses come back as they were and are answered right: that
  // is memory of the question, not the skill, so the gate is not met.
  const again = firsts.slice(0, 8).map((miss) => attempt({ questionId: miss.questionId, reviewOf: miss.questionId }));
  let row = rowFor(Analytics.skillMap([...firsts, ...again], SECTIONS), "Linear functions");
  assert.deepEqual([row.gate.attempted, row.gate.correct, row.gate.met], [30, 22, false]);
  assert.equal(row.medium.attempted, 38, "every answer still counts toward accuracy");
  // Fresh versions of the same templates are new questions and count.
  const fresh = many(8, { reviewOf: "sat-math:t1:s1" });
  row = rowFor(Analytics.skillMap([...firsts, ...fresh], SECTIONS), "Linear functions");
  assert.deepEqual([row.gate.attempted, row.gate.correct, row.gate.met], [30, 30, true]);
});

test("the accuracy model decides what fills the gate", () => {
  const rows = Analytics.skillMap([
    // A correct answer after a hint is not counted as correct.
    ...many(4, { hinted: true }),
    // A blank counts as wrong.
    ...many(1, { correct: false, answered: false, response: null }),
    ...many(15, {}),
    // Retired fixed banks are left out entirely.
    ...many(10, { source: "legacy-bank", correct: false }),
  ], SECTIONS);
  const row = rowFor(rows, "Linear functions");
  assert.equal(row.attempted, 20);
  assert.deepEqual([row.gate.attempted, row.gate.correct], [20, 15]);
  assert.equal(row.hintedCorrect, 4);
  assert.equal(row.state, "building");
});

test("mastered takes the gate and 10 of the last 15 Hard answers", () => {
  const gate = [...many(26, {}), ...many(4, { correct: false })];
  const hard = (right, wrong) => [...many(right, { difficulty: "Hard" }), ...many(wrong, { difficulty: "Hard", correct: false })];
  const state = (list) => rowFor(Analytics.skillMap(list, SECTIONS), "Linear functions").state;
  assert.equal(state([...gate, ...hard(10, 5)]), "mastered");
  assert.equal(state([...gate, ...hard(3, 2)]), "at-gate", "three of five was the old bar");
  assert.equal(state([...gate, ...hard(14, 0)]), "at-gate", "fewer than 15 Hard answers");
  assert.equal(state([...gate, ...hard(9, 6)]), "at-gate");
  assert.equal(state([...many(10, {}), ...hard(15, 0)]), "building");
  const row = rowFor(Analytics.skillMap([...gate, ...hard(0, 5), ...hard(12, 3)], SECTIONS), "Linear functions");
  assert.deepEqual([row.hardBar.correct, row.hardBar.attempted, row.hardBar.met], [12, 15, true], "old misses age out");
});

test("answers to skills no longer in the catalog still show", () => {
  const rows = Analytics.skillMap([attempt({ skill: "Retired skill", domain: "Algebra" })], SECTIONS);
  assert.deepEqual(rows.map((row) => row.skill), ["Linear functions", "Linear inequalities", "Circles", "Retired skill"]);
  assert.deepEqual(Analytics.sortSkills(rows, "domain").map((row) => row.skill),
    ["Linear functions", "Linear inequalities", "Retired skill", "Circles"]);
  assert.equal(rowFor(rows, "Retired skill").state, "not-enough-data");
  assert.equal(rowFor(rows, "Retired skill").inCatalog, false);
  assert.equal(rowFor(rows, "Linear functions").inCatalog, true);
  assert.notEqual(Analytics.nextStep(rows).skill, "Retired skill", "a skill no longer in the catalog is never the next step");
});

test("sorting by need puts weak skills with evidence first", () => {
  const attempts = [
    ...many(6, { skill: "Linear functions" }),
    ...many(4, { skill: "Linear functions", correct: false }), // 60%, building
    ...many(3, { skill: "Linear inequalities" }), ...many(3, { skill: "Linear inequalities", correct: false }), // 50%, building
    ...many(2, { skill: "Circles", domain: "Geometry and Trigonometry" }), // not enough data
  ];
  const rows = Analytics.skillMap(attempts, SECTIONS);
  assert.deepEqual(Analytics.sortSkills(rows, "need").map((row) => row.skill),
    ["Linear inequalities", "Linear functions", "Circles"]);
  assert.deepEqual(Analytics.sortSkills(rows, "domain").map((row) => row.skill),
    ["Linear functions", "Linear inequalities", "Circles"]);
  assert.deepEqual(Analytics.stateCounts(rows),
    { "not-started": 0, "not-enough-data": 1, building: 2, "at-gate": 0, mastered: 0, "accuracy-only": 0 });
});

test("the diagnostic takes twenty Medium and Hard templates in the real test's domain mix", () => {
  const templates = Runs.catalogTemplates(mathFamilies, mathRegistry);
  const math = section("sat-math");
  const chosen = Analytics.chooseDiagnostic(templates, { weights: Practice.domainWeights(math), seed: "d1" });
  assert.equal(chosen.templates.length, 20);
  assert.equal(chosen.short, 0);
  assert.equal(new Set(chosen.templates.map((template) => template.id)).size, 20);
  const count = (key, value) => chosen.templates.filter((template) => template[key] === value).length;
  assert.equal(count("difficulty", "Medium"), 10);
  assert.equal(count("difficulty", "Hard"), 10);
  // 195 / 195 / 93 / 92 of 20 seats.
  assert.deepEqual(
    ["Algebra", "Advanced Math", "Problem-Solving and Data Analysis", "Geometry and Trigonometry"].map((domain) => count("domain", domain)),
    [7, 7, 3, 3],
  );
  // Twenty questions reach at least one skill per seat until a domain's
  // skills run out.
  const skills = new Set(chosen.templates.map((template) => template.skill));
  assert.ok(skills.size >= 15, `only ${skills.size} skills`);
  // Deterministic for a seed.
  assert.deepEqual(
    Analytics.chooseDiagnostic(templates, { weights: Practice.domainWeights(math), seed: "d1" }).templates.map((t) => t.id),
    chosen.templates.map((template) => template.id),
  );

  const rw = Analytics.chooseDiagnostic(Runs.catalogTemplates(rwFamilies, rwRegistry),
    { weights: Practice.domainWeights(section("sat-reading-writing")), seed: "d2" });
  assert.equal(rw.templates.length, 20);
  assert.ok(rw.templates.every((template) => ["Medium", "Hard"].includes(template.difficulty)));
  assert.equal(new Set(rw.templates.map((template) => template.domain)).size, 4);
});

test("the diagnostic prefers templates never served, and a short tier borrows within its domain", () => {
  const make = (id, domain, difficulty, skill) => ({ id, bit: Number(id.slice(1)), domain, difficulty, skill });
  const templates = [
    make("t0", "A", "Medium", "a1"), make("t1", "A", "Medium", "a1"), make("t2", "A", "Hard", "a2"),
    make("t3", "B", "Hard", "b1"), make("t4", "B", "Hard", "b2"), make("t5", "B", "Easy", "b3"),
  ];
  const chosen = Analytics.chooseDiagnostic(templates, {
    weights: { A: 1, B: 1 },
    count: 4,
    recency: { t0: 5 },
    seed: "x",
  });
  const ids = chosen.templates.map((template) => template.id).sort();
  // A: one Medium (t1, never served, over t0) and one Hard; B has no Medium,
  // so its Medium seat borrows a Hard. Easy is never used.
  assert.deepEqual(ids, ["t1", "t2", "t3", "t4"]);
  assert.deepEqual(chosen.cells.map((cell) => `${cell.domain}:${cell.tier}:${cell.wanted}`), ["A:Medium:1", "A:Hard:1", "B:Hard:2"]);
  assert.equal(chosen.short, 0);
  assert.equal(Analytics.chooseDiagnostic(templates, { weights: { A: 1, B: 1 }, count: 9 }).short, 4);

  const ordered = Analytics.orderByTier([
    { id: 1, difficulty: "Hard" }, { id: 2, difficulty: "Medium" }, { id: 3, difficulty: "Hard" }, { id: 4, difficulty: "Medium" },
  ]);
  assert.deepEqual(ordered.map((question) => question.id), [2, 4, 1, 3]);
});

test("pacing reports medians against module pace and each question's estimate", () => {
  const attempts = [
    attempt({ timeMs: 60000, difficulty: "Medium" }),
    attempt({ timeMs: 90000, difficulty: "Medium", correct: false }),
    attempt({ timeMs: 120000, difficulty: "Hard", correct: false, answered: false }),
    attempt({ timeMs: 30000, difficulty: "Hard", hinted: true }),
    attempt({ timeMs: null }),
    attempt({ timeMs: undefined }),
    attempt({ timeMs: 50000, source: "legacy-bank" }),
    attempt({ timeMs: 40000, skill: "Circles", domain: "Geometry and Trigonometry", difficulty: "Easy" }),
  ];
  const result = Analytics.pacing(attempts, {
    paceSeconds: { "sat-math": 95 },
    expectedSeconds: (entry) => (entry.difficulty === "Hard" ? 115 : entry.difficulty === "Medium" ? 90 : null),
  });
  assert.equal(result.timed, 5);
  assert.equal(result.untimed, 2);
  const [math] = result.sections;
  assert.equal(math.count, 5);
  assert.equal(math.median, 60);
  assert.equal(math.pace, 95);
  assert.equal(math.overPace, -35);
  assert.equal(math.expectedCount, 4);
  assert.equal(math.expectedMedian, 102.5);
  // Right excludes the hinted answer; the blank counts as wrong.
  assert.deepEqual(math.right, { count: 2, median: 50, totalSeconds: 100 });
  assert.deepEqual(math.wrong, { count: 2, median: 105, totalSeconds: 210 });
  assert.deepEqual(result.tiers.map((row) => [row.difficulty, row.count, row.median]),
    [["Easy", 1, 40], ["Medium", 2, 75], ["Hard", 2, 75]]);
  // Only skills with enough timed answers are listed.
  assert.deepEqual(result.skills.map((row) => [row.skill, row.count, row.median]), [["Linear functions", 4, 75]]);
  assert.equal(Analytics.median([3, 1, 2]), 2);
  assert.equal(Analytics.median([]), null);
});

test("the trend reads each set's own answers, falling back to its summary", () => {
  const sessions = [
    { id: "s2", finishedAt: 2000, sectionKey: "sat-math", kind: "diagnostic", title: "B", total: 3, correct: 3,
      hard: { total: 1, correct: 1 } },
    { id: "s1", finishedAt: 1000, sectionKey: "sat-math", kind: "practice", title: "A", total: 4, correct: 3,
      hintedCorrect: 1, hard: { total: 2, correct: 1 }, timeMs: 5000 },
  ];
  const attempts = [
    attempt({ sessionId: "s2", difficulty: "Hard" }),
    attempt({ sessionId: "s2", difficulty: "Hard", correct: false }),
    attempt({ sessionId: "s2", difficulty: "Medium", hinted: true }),
  ];
  const trend = Analytics.sessionTrend(sessions, attempts);
  assert.deepEqual(trend.map((point) => point.id), ["s1", "s2"]);
  // s1 has no attempts left: its summary, less the hinted answer.
  assert.equal(trend[0].source, "summary");
  assert.equal(trend[0].accuracy, 0.5);
  assert.deepEqual(trend[0].hard, { attempted: 2, accuracy: 0.5 });
  assert.equal(trend[0].timeMs, 5000);
  // s2 is re-read from its attempts at their current tiers.
  assert.equal(trend[1].source, "attempts");
  assert.equal(trend[1].accuracy, 1 / 3);
  assert.deepEqual(trend[1].hard, { attempted: 2, accuracy: 0.5 });
  assert.deepEqual(Analytics.sessionTrend(sessions, attempts, (session) => session.kind === "diagnostic").map((p) => p.id), ["s2"]);
});

test("plan dates are local calendar days and weeks start on Monday", () => {
  const now = new Date(2026, 8, 25, 15, 30); // Friday 25 September 2026
  assert.equal(Analytics.daysUntil("2026-09-25", now), 0);
  assert.equal(Analytics.daysUntil("2026-10-03", now), 8);
  assert.equal(Analytics.daysUntil("2026-09-20", now), -5);
  assert.equal(Analytics.daysUntil("2026-02-30", now), null);
  assert.equal(Analytics.daysUntil("", now), null);
  assert.equal(Analytics.formatDate(Analytics.parseDate("2026-11-07")), "2026-11-07");
  assert.equal(Analytics.weekStart(now), new Date(2026, 8, 21).getTime());
  assert.equal(Analytics.weekStart(new Date(2026, 8, 21, 0, 0)), new Date(2026, 8, 21).getTime());
  assert.equal(Analytics.weekStart(new Date(2026, 8, 27, 23, 59)), new Date(2026, 8, 21).getTime());

  const week = [
    attempt({ timestamp: new Date(2026, 8, 21, 8).getTime() }),
    attempt({ timestamp: new Date(2026, 8, 24, 20).getTime() }),
    attempt({ timestamp: new Date(2026, 8, 24, 20).getTime(), answered: false, correct: false }),
    attempt({ timestamp: new Date(2026, 8, 20, 23).getTime() }),
  ];
  assert.equal(Analytics.weekCount(week, now), 2);

  assert.deepEqual(Analytics.cleanPlan({ testDate: "2026-11-07", weeklyQuestions: "150" }),
    { plan: { testDate: "2026-11-07", weeklyQuestions: 150 }, errors: [] });
  assert.deepEqual(Analytics.cleanPlan({ testDate: "11/07/2026", weeklyQuestions: 0 }),
    { plan: {}, errors: ["testDate", "weeklyQuestions"] });
  assert.deepEqual(Analytics.cleanPlan({ testDate: "", weeklyQuestions: "" }), { plan: {}, errors: [] });
});

test("an official score keeps only valid values, on the SAT's section scale", () => {
  const now = new Date(2026, 8, 26, 9).getTime();
  const clean = Analytics.cleanOfficialScore({
    date: "2026-09-20", kind: "practice", label: "  Practice   Test 4 ", readingWriting: "", math: "520", id: "x", at: 5,
  }, { now });
  assert.deepEqual(clean, {
    score: { date: "2026-09-20", kind: "practice", label: "Practice Test 4", math: 520, id: "x", at: 5 },
    errors: [],
  });
  assert.deepEqual(Analytics.cleanOfficialScore({ date: "2026-09-27", kind: "sat", math: 500 }, { now }).errors, ["date"],
    "a test day after today");
  assert.deepEqual(Analytics.cleanOfficialScore({ date: "2026-09-27", kind: "sat", math: 500 }).errors, [],
    "without now, any real date");
  assert.deepEqual(Analytics.cleanOfficialScore({ date: "2026-09-20", kind: "psat", math: 505, readingWriting: 900 }).errors,
    ["kind", "readingWriting", "math"]);
  assert.deepEqual(Analytics.cleanOfficialScore({ date: "2026-09-20", kind: "sat" }).errors, ["scores"]);
  assert.equal(Analytics.cleanOfficialScore({ date: "2026-09-20", kind: "sat", math: 200, label: "x".repeat(99) })
    .score.label.length, Analytics.SCORE_LABEL_MAX);
});

test("each official score sits beside accuracy over the 28 days ending on its test day", () => {
  const day = (month, date, hour) => new Date(2026, month - 1, date, hour).getTime();
  const math = (fields) => attempt(Object.assign({ sectionKey: "sat-math" }, fields));
  const rw = (fields) => attempt(Object.assign({ sectionKey: "sat-reading-writing", questionId: "sat-reading-writing:x:1",
    domain: "Craft and Structure", skill: "Words in Context" }, fields));
  const attempts = [
    math({ timestamp: day(8, 23, 20), correct: false }), // 29 days before: outside
    math({ timestamp: day(8, 24, 8), difficulty: "Hard" }), // first day of the window
    math({ timestamp: day(9, 20, 23), difficulty: "Hard", correct: false, answered: false }),
    math({ timestamp: day(9, 20, 10), hinted: true }), // a hinted correct answer is not counted as correct
    math({ timestamp: day(9, 21, 0), correct: false }), // the day after: outside
    rw({ timestamp: day(9, 1, 12) }),
    math({ timestamp: day(9, 2, 12), source: "legacy-bank" }), // the retired banks are left out
  ];
  const rows = Analytics.officialComparison(attempts, [
    { id: "late", date: "2026-10-01", kind: "sat", math: 510 },
    { id: "early", date: "2026-09-20", kind: "practice", math: 480, readingWriting: 530 },
    { id: "bad", date: "not a date", kind: "sat", math: 500 },
  ]);
  assert.deepEqual(rows.map((row) => row.score.id), ["early", "late"]);
  const early = rows[0];
  assert.equal(early.from, day(8, 24, 0));
  assert.equal(early.to, day(9, 21, 0));
  assert.deepEqual(early.sections.math, { attempted: 3, accuracy: 1 / 3, hard: { attempted: 2, accuracy: 0.5 } });
  assert.deepEqual(early.sections.readingWriting, { attempted: 1, accuracy: 1, hard: { attempted: 0, accuracy: null } });
  assert.equal(rows[1].sections.math.attempted, 3, "the later window starts Sep 4 and reaches Oct 1");
});

test("the trend leaves answers to questions seen before out of a set's accuracy", () => {
  const first = attempt({ sessionId: "s1", questionId: "sat-math:x:1", correct: false, repeat: false });
  const again = attempt({ sessionId: "s2", questionId: "sat-math:x:1", correct: true, repeat: true });
  const points = Analytics.sessionTrend([
    { id: "s1", sectionKey: "sat-math", kind: "practice", finishedAt: 1, total: 1, correct: 0 },
    { id: "s2", sectionKey: "sat-math", kind: "review", finishedAt: 2, total: 1, correct: 1 },
  ], [first, again]);
  assert.deepEqual(points.map((point) => [point.id, point.counted, point.accuracy, point.repeats]),
    [["s1", 1, 0, 0], ["s2", 0, null, 1]]);
});

test("a gate window must span two days and two question designs", () => {
  const day = 24 * 3600 * 1000;
  const oneSitting = Array.from({ length: 30 }, (unused, index) =>
    attempt({ questionId: `sat-math:t-drill:${index}`, templateId: "t-drill", timestamp: 100 * day + index * 60000 }));
  let row = rowFor(Analytics.skillMap(oneSitting, SECTIONS), "Linear functions");
  assert.deepEqual([row.gate.correct, row.gate.days, row.gate.templates, row.gate.met], [30, 1, 1, false]);
  // Two designs, still one sitting.
  const twoDesigns = oneSitting.map((entry, index) => Object.assign({}, entry, index % 2 ? { templateId: "t-other" } : {}));
  row = rowFor(Analytics.skillMap(twoDesigns, SECTIONS), "Linear functions");
  assert.deepEqual([row.gate.templates, row.gate.met], [2, false]);
  // Two designs over two days.
  const twoDays = twoDesigns.map((entry, index) => Object.assign({}, entry, index >= 15 ? { timestamp: entry.timestamp + day } : {}));
  row = rowFor(Analytics.skillMap(twoDays, SECTIONS), "Linear functions");
  assert.deepEqual([row.gate.days, row.gate.templates, row.gate.met], [2, 2, true]);
});

test("a finished test is one point, scored from its modules' answers at their current tier", () => {
  const moduleAnswers = (sessionId, right, wrong, difficulty) => [
    ...many(right, { sessionId, difficulty }), ...many(wrong, { sessionId, difficulty, correct: false }),
  ];
  const attempts = [
    ...moduleAnswers("m1", 3, 1, "Medium"),
    ...moduleAnswers("m2", 1, 3, "Hard"),
    ...moduleAnswers("m9", 2, 0, "Medium"),
  ];
  const sessions = [
    { id: "m1", kind: "module", testId: "t1", finishedAt: 1, total: 4, correct: 3 },
    { id: "m2", kind: "module", testId: "t1", finishedAt: 2, total: 4, correct: 1 },
    // The stored summary still has the tiers from when it was taken.
    { id: "t1", kind: "section", finishedAt: 3, total: 8, correct: 4, hard: { total: 0, correct: 0 },
      modules: [{ sessionId: "m1" }, { sessionId: "m2" }] },
    // A module of a test never finished keeps its own point.
    { id: "m9", kind: "module", testId: "t9", finishedAt: 4, total: 2, correct: 2 },
  ];
  const points = Analytics.sessionTrend(sessions, attempts);
  assert.deepEqual(points.map((point) => point.id), ["t1", "m9"]);
  assert.deepEqual([points[0].counted, points[0].accuracy, points[0].hard.attempted, points[0].source], [8, 0.5, 4, "attempts"]);
});

test("skills in sections with unverified difficulty labels show accuracy only", () => {
  const act = [{ key: "act-english", domains: [{ name: "Conventions", target: 50, skills: { Punctuation: ["commas"] } }] }];
  const answers = many(40, { sectionKey: "act-english", questionId: "act-english-0001", domain: "Conventions", skill: "Punctuation", source: "bank" })
    .map((entry, index) => Object.assign(entry, { questionId: `act-english-${String(index).padStart(4, "0")}` }));
  const rows = Analytics.skillMap(answers, act, { tiered: (key) => key.startsWith("sat-") });
  assert.deepEqual([rows[0].tiered, rows[0].state], [false, "accuracy-only"]);
  assert.equal(Analytics.STATE_LABELS["accuracy-only"], "Accuracy only");
  const step = Analytics.nextStep(rows);
  assert.deepEqual([step.skill, step.reason, step.level, step.levelWhy], ["Punctuation", "lowest-accuracy", null, "accuracy-only"]);
  assert.deepEqual([Analytics.skillMap(answers.slice(0, 3), act, { tiered: () => false })[0].state], ["not-enough-data"]);
});

test("first-sight accuracy takes each design's first answer only", () => {
  const hard = (templateId, correct) => attempt({ templateId, questionId: `sat-math:${templateId}:${counter}`, difficulty: "Hard", correct });
  const attempts = [
    hard("a", false), hard("a", true), hard("a", true), // met, missed, then learned
    hard("b", true),
    attempt({ templateId: "c", questionId: "sat-math:c:1", difficulty: "Medium", correct: false }),
    attempt({ templateId: "d", questionId: "act-english-0001", source: "bank", difficulty: "Hard" }),
  ];
  assert.deepEqual(Analytics.firstSight(attempts, "Hard"), { attempted: 2, correct: 1, accuracy: 0.5 });
  assert.deepEqual(Analytics.firstSight(attempts), { attempted: 3, correct: 1, accuracy: 1 / 3 });
});

/* -------------------------------------------------------------- next step */

const mathSection = section("sat-math");
const MATH_PLAN = Analytics.PLANS["sat-math"];
const planSkills = MATH_PLAN.stages.flatMap((stage) => stage.skills);
const domainOfSkill = (skill) => mathSection.domains.find((domain) => Object.keys(domain.skills).includes(skill)).name;

// Answers in one SAT Math skill, in its catalog domain.
function mathAnswers(count, skill, fields) {
  return many(count, Object.assign({ skill, domain: domainOfSkill(skill) }, fields));
}

// Thirty right Medium answers an hour apart, each its own design: the gate.
const atGate = (skill) => mathAnswers(30, skill, {});
// Then 15 right Hard answers over two days: Mastered.
function mastered(skill) {
  const gate = atGate(skill);
  const firstDay = mathAnswers(8, skill, { difficulty: "Hard" });
  counter += 24;
  return [...gate, ...firstDay, ...mathAnswers(7, skill, { difficulty: "Hard" })];
}
const mathStep = (attempts, options) => Analytics.nextStep(Analytics.skillMap(attempts, [mathSection]), options);

test("the SAT Math plan lists every catalog skill exactly once, in four stages", () => {
  const catalogSkills = mathSection.domains.flatMap((domain) => Object.keys(domain.skills));
  assert.deepEqual(planSkills.slice().sort(), catalogSkills.slice().sort());
  assert.equal(new Set(planSkills).size, planSkills.length, "no skill twice");
  assert.deepEqual(MATH_PLAN.stages.map((stage) => stage.stage), [1, 2, 3, 4]);
  assert.deepEqual(Analytics.planStages(mathSection).map((stage) => stage.domains), [
    ["Algebra", "Problem-Solving and Data Analysis"],
    ["Algebra", "Problem-Solving and Data Analysis"],
    ["Advanced Math"],
    ["Problem-Solving and Data Analysis", "Geometry and Trigonometry"],
  ]);
  assert.deepEqual(Analytics.planStages(section("sat-reading-writing")), [], "no plan for Reading and Writing");
});

test("the plan's stages follow the sequence on the Learn page", () => {
  const page = fs.readFileSync(path.join(__dirname, "..", "content", "learn", "sat", "general", "math-plan.md"), "utf8");
  const start = page.indexOf("## The sequence");
  const sequence = page.slice(start, page.indexOf("For each skill", start));
  const stageLines = sequence.split("\n").filter((line) => /^\d+\. /.test(line));
  assert.equal(stageLines.length, MATH_PLAN.stages.length, "one numbered line per stage");
  const bySlug = new Map(planSkills.map((skill) => [Practice.slug(skill), skill]));
  stageLines.forEach((line, index) => {
    const linked = [...line.matchAll(/learn:sat-math\/[a-z0-9-]+\/([a-z0-9-]+)/g)].map((match) => bySlug.get(match[1]));
    assert.ok(linked.length && linked.every(Boolean), `stage ${index + 1} links catalog skills`);
    assert.deepEqual(MATH_PLAN.stages[index].skills.slice(0, linked.length), linked,
      `stage ${index + 1} starts with the skills the page links, in its order`);
  });
});

test("a skill is practised at Easy until routine, then Medium to the gate, then Hard", () => {
  const skill = "Linear equations in one variable";
  const level = (attempts) => Analytics.skillLevel(rowFor(Analytics.skillMap(attempts, [mathSection]), skill));
  assert.deepEqual(level([]), { level: "Easy", why: "not-routine" });
  // Routine: 8 of the last 10 Easy first answers.
  assert.deepEqual(level([...mathAnswers(3, skill, { difficulty: "Easy", correct: false }), ...mathAnswers(7, skill, { difficulty: "Easy" })]),
    { level: "Easy", why: "not-routine" }, "7 of 10 is not routine");
  assert.deepEqual(level([...mathAnswers(2, skill, { difficulty: "Easy", correct: false }), ...mathAnswers(8, skill, { difficulty: "Easy" })]),
    { level: "Medium", why: "routine" });
  assert.deepEqual(level(mathAnswers(9, skill, { difficulty: "Easy" })), { level: "Easy", why: "not-routine" }, "needs ten");
  // Or 8 of the last 10 Medium: a student sure at Medium is not sent back.
  assert.deepEqual(level([...mathAnswers(2, skill, { correct: false }), ...mathAnswers(8, skill, {})]),
    { level: "Medium", why: "routine" });
  // Hints do not count as right.
  assert.deepEqual(level(mathAnswers(10, skill, { difficulty: "Easy", hinted: true })), { level: "Easy", why: "not-routine" });
  assert.deepEqual(level(atGate(skill)), { level: "Hard", why: "at-gate" });
  assert.deepEqual(level(mastered(skill)), { level: "Hard", why: "mastered" });
  assert.deepEqual(Analytics.skillLevel({ tiered: false, state: "accuracy-only" }), { level: null, why: "accuracy-only" });
});

test("SAT Math's next step is the first skill in plan order not yet at the gate", () => {
  let step = mathStep([]);
  assert.deepEqual([step.kind, step.skill, step.level, step.reason, step.stage.stage, step.startStage],
    ["skill", "Linear equations in one variable", "Easy", "plan", 1, 1]);
  // A weak skill elsewhere does not pull the step off the plan.
  step = mathStep(mathAnswers(10, "Circles", { correct: false }));
  assert.equal(step.skill, "Linear equations in one variable");
  // Routine: the same skill, at Medium.
  step = mathStep(mathAnswers(10, "Linear equations in one variable", { difficulty: "Easy" }));
  assert.deepEqual([step.skill, step.level, step.levelWhy], ["Linear equations in one variable", "Medium", "routine"]);
  // At the gate: the next skill in the page's order, at Easy.
  step = mathStep(atGate("Linear equations in one variable"));
  assert.deepEqual([step.skill, step.level], ["Linear functions", "Easy"]);
  step = mathStep([...atGate("Linear equations in one variable"), ...atGate("Linear functions"),
    ...atGate("Linear equations in two variables")]);
  assert.equal(step.skill, "Percentages", "the page's order, not the catalog's");
  // Every skill at the gate: Hard, in plan order.
  const allAtGate = planSkills.flatMap(atGate);
  step = mathStep(allAtGate);
  assert.deepEqual([step.skill, step.level, step.reason, step.levelWhy], ["Linear equations in one variable", "Hard", "plan-hard", "at-gate"]);
  step = mathStep([...mastered("Linear equations in one variable"), ...planSkills.slice(1).flatMap(atGate)]);
  assert.equal(step.skill, "Linear functions");
  // Every skill mastered: a mix.
  assert.deepEqual(mathStep(planSkills.flatMap(mastered)), { kind: "mixed", reason: "all-mastered", sectionKey: "sat-math" });
});

test("Review comes first whenever questions are due", () => {
  const step = mathStep([], { dueCount: 3 });
  assert.deepEqual([step.kind, step.dueCount, step.then.skill, step.then.level], ["review", 3, "Linear equations in one variable", "Easy"]);
  assert.equal(mathStep([], { dueCount: 0 }).kind, "skill");
  assert.equal(Analytics.nextStep([], { dueCount: 3 }), null, "no rows, no step");
});

// A Math diagnostic's answers: `right` of `count` in each domain, at most
// two per skill, taken from the domain's catalog skills in order.
function diagnostic(id, results, finishedAt) {
  const answers = [];
  Object.entries(results).forEach(([domain, [right, count]]) => {
    const skills = Object.keys(mathSection.domains.find((entry) => entry.name === domain).skills);
    for (let index = 0; index < count; index += 1) {
      answers.push(attempt({
        sessionId: id, domain, skill: skills[index % skills.length], correct: index < right,
        difficulty: index % 2 ? "Hard" : "Medium",
      }));
    }
  });
  return { answers, session: { id, kind: "diagnostic", sectionKey: "sat-math", finishedAt: finishedAt || counter } };
}

test("the diagnostic places a student in the plan by domain, not by skill", () => {
  const strong = diagnostic("d1", {
    Algebra: [6, 7], "Advanced Math": [2, 7], "Problem-Solving and Data Analysis": [3, 3], "Geometry and Trigonometry": [1, 3],
  });
  const placement = Analytics.diagnosticPlacement(strong.answers, [strong.session], mathSection);
  assert.deepEqual(placement.domains.map((row) => [row.domain, row.correct, row.attempted, row.shown]), [
    ["Algebra", 6, 7, true],
    ["Advanced Math", 2, 7, false],
    ["Problem-Solving and Data Analysis", 3, 3, true],
    ["Geometry and Trigonometry", 1, 3, false],
  ]);
  assert.deepEqual([placement.stage, placement.skipped, placement.allShown, placement.attempted], [3, [1, 2], false, 20]);
  assert.ok(Analytics.skillMap(strong.answers, [mathSection]).every((row) => row.attempted <= 2), "at most two per skill");

  // With no other evidence, the plan starts at stage 3.
  const placements = { "sat-math": placement };
  let step = mathStep(strong.answers, { placements });
  assert.deepEqual([step.skill, step.level, step.stage.stage, step.startStage, step.returned],
    ["Equivalent expressions", "Easy", 3, 3, false]);
  // A skill from a stage passed over comes back once it is practised and short of the gate.
  step = mathStep([...strong.answers, ...mathAnswers(5, "Linear functions", { difficulty: "Easy", correct: false })], { placements });
  assert.deepEqual([step.skill, step.stage.stage, step.returned], ["Linear functions", 1, false]);
  // Once stages 3 and 4 are at the gate, the plan comes back to stage 1.
  const later = MATH_PLAN.stages.filter((stage) => stage.stage >= 3).flatMap((stage) => stage.skills).flatMap(atGate);
  step = mathStep([...strong.answers, ...later], { placements });
  assert.deepEqual([step.skill, step.stage.stage, step.returned], ["Linear equations in one variable", 1, true]);

  // A weak domain in stage 1 starts the plan there; 2 of 2 is too few to show a domain.
  const weak = diagnostic("d2", {
    Algebra: [2, 7], "Advanced Math": [7, 7], "Problem-Solving and Data Analysis": [2, 2], "Geometry and Trigonometry": [2, 2],
  });
  const low = Analytics.diagnosticPlacement(weak.answers, [weak.session], mathSection);
  assert.deepEqual([low.stage, low.skipped, low.domains.find((row) => row.domain === "Problem-Solving and Data Analysis").shown],
    [1, [], false]);
  // Every domain shown passes over nothing.
  const all = diagnostic("d3", {
    Algebra: [7, 7], "Advanced Math": [6, 7], "Problem-Solving and Data Analysis": [3, 3], "Geometry and Trigonometry": [3, 3],
  });
  assert.deepEqual(Object.values(Analytics.placements(all.answers, [all.session], [mathSection]))
    .map((entry) => [entry.stage, entry.allShown]), [[1, true]]);

  // The latest finished diagnostic counts; a discarded one never does.
  const both = [strong.session, Object.assign({}, weak.session, { finishedAt: strong.session.finishedAt + 1 })];
  assert.equal(Analytics.diagnosticPlacement([...strong.answers, ...weak.answers], both, mathSection).sessionId, "d2");
  const discarded = Object.assign({}, weak.session, { kind: "discarded", discardedKind: "diagnostic", finishedAt: 1e12 });
  assert.equal(Analytics.diagnosticPlacement(weak.answers, [strong.session, discarded], mathSection).sessionId, "d1");
  assert.equal(Analytics.diagnosticPlacement(strong.answers, [], mathSection), null, "no diagnostic, no placement");
  // Reading and Writing is read by domain, with no stage.
  const rwSection = section("sat-reading-writing");
  const rw = { id: "r1", kind: "diagnostic", sectionKey: rwSection.key, finishedAt: 5 };
  const rwAnswers = [attempt({ sectionKey: rwSection.key, sessionId: "r1", domain: rwSection.domains[0].name, skill: "Inferences" })];
  assert.deepEqual([Analytics.diagnosticPlacement(rwAnswers, [rw], rwSection).stage,
    Analytics.diagnosticPlacement(rwAnswers, [rw], rwSection).domains[0].attempted], [null, 1]);
});

const RW_SECTIONS = [{
  key: "sat-reading-writing",
  domains: [
    { name: "Information and Ideas", target: 26, skills: { "Central Ideas and Details": ["a"], Inferences: ["b"] } },
    { name: "Craft and Structure", target: 28, skills: { "Words in Context": ["c"] } },
  ],
}];
const rw = (count, skill, fields) => many(count, Object.assign({
  sectionKey: "sat-reading-writing",
  skill,
  domain: skill === "Words in Context" ? "Craft and Structure" : "Information and Ideas",
}, fields));
const rwStep = (attempts, options) => Analytics.nextStep(Analytics.skillMap(attempts, RW_SECTIONS), options);

test("Reading and Writing's next step is the weakest skill with evidence, else the least practised", () => {
  let step = rwStep([]);
  assert.deepEqual([step.skill, step.reason, step.level], ["Central Ideas and Details", "least-practised", "Easy"]);
  // The least practised, from the weakest domain first.
  step = rwStep([...rw(1, "Inferences"), ...rw(1, "Inferences", { correct: false }), ...rw(1, "Central Ideas and Details", { correct: false })]);
  assert.deepEqual([step.skill, step.reason], ["Words in Context", "least-practised"]);
  step = rwStep([...rw(1, "Inferences", { correct: false }), ...rw(1, "Words in Context")]);
  assert.deepEqual([step.skill, step.reason], ["Central Ideas and Details", "least-practised"], "Information and Ideas is weaker");
  // With enough answers, the weakest below the gate.
  step = rwStep([...rw(3, "Inferences"), ...rw(3, "Inferences", { correct: false }), ...rw(5, "Words in Context"), ...rw(1, "Words in Context", { correct: false })]);
  assert.deepEqual([step.skill, step.reason], ["Inferences", "weakest"]);
  // Every skill at the gate: the weakest Hard.
  const gate = (skill) => rw(30, skill);
  step = rwStep([...gate("Central Ideas and Details"), ...gate("Inferences"), ...gate("Words in Context"),
    ...rw(2, "Inferences", { difficulty: "Hard", correct: false })]);
  assert.deepEqual([step.reason, step.level], ["hard", "Hard"]);
  assert.equal(step.skill, "Central Ideas and Details", "no Hard answers yet is the weakest");
});

test("ACT's next step is the lowest accuracy with enough answers, with no level", () => {
  const act = [{ key: "act-english", domains: [{ name: "Conventions", target: 50, skills: { Punctuation: ["a"], Usage: ["b"], Sentences: ["c"] } }] }];
  const answers = (count, skill, fields) => many(count, Object.assign({ sectionKey: "act-english", domain: "Conventions", skill, source: "bank" }, fields));
  const step = (attempts) => Analytics.nextStep(Analytics.skillMap(attempts, act, { tiered: () => false }));
  assert.deepEqual([step([]).skill, step([]).reason, step([]).level], ["Punctuation", "least-practised", null]);
  assert.deepEqual([step([...answers(4, "Punctuation", { correct: false }), ...answers(2, "Usage")]).skill], ["Sentences"],
    "under five answers is least practised");
  const both = [...answers(5, "Punctuation", { correct: false }), ...answers(4, "Usage"), ...answers(2, "Usage", { correct: false }),
    ...answers(1, "Sentences")];
  assert.deepEqual([step(both).skill, step(both).reason, step(both).levelWhy], ["Punctuation", "lowest-accuracy", "accuracy-only"]);
});

test("with several sections in view, the step is in the section last answered", () => {
  const sections = [...RW_SECTIONS, mathSection];
  const attempts = [...rw(3, "Inferences"), ...mathAnswers(2, "Circles")];
  const rows = Analytics.skillMap(attempts, sections);
  assert.equal(Analytics.recentSection(attempts, ["sat-reading-writing", "sat-math"]), "sat-math");
  assert.equal(Analytics.recentSection(attempts, ["sat-reading-writing"]), "sat-reading-writing");
  assert.equal(Analytics.recentSection([], ["sat-math"]), null);
  assert.equal(Analytics.nextStep(rows, { recentSection: "sat-math" }).sectionKey, "sat-math");
  assert.equal(Analytics.nextStep(rows, { recentSection: "sat-reading-writing" }).sectionKey, "sat-reading-writing");
  assert.equal(Analytics.nextStep(rows, { sectionKeys: ["sat-reading-writing"], recentSection: "sat-math" }).sectionKey,
    "sat-reading-writing", "a section out of view is never chosen");
  // Without a recent section: the first with answers, else the one with a plan.
  assert.equal(Analytics.nextStep(Analytics.skillMap(mathAnswers(1, "Circles"), sections)).sectionKey, "sat-math");
  assert.equal(Analytics.nextStep(Analytics.skillMap([], sections)).sectionKey, "sat-math");
});
