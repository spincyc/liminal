"use strict";

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
    timestamp: counter * 1000,
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
    // Linear functions: 20 Medium at 80% but no Hard yet -> at the gate.
    ...many(16, { skill: "Linear functions" }),
    ...many(4, { skill: "Linear functions", correct: false }),
    // Linear inequalities: 4 answers -> not enough data.
    ...many(4, { skill: "Linear inequalities" }),
  ];
  const rows = Analytics.skillMap(attempts, SECTIONS);
  assert.deepEqual(rows.map((row) => row.skill), ["Linear functions", "Linear inequalities", "Circles"]);
  const functions = rowFor(rows, "Linear functions");
  assert.equal(functions.state, "at-gate");
  assert.deepEqual(functions.gate, { attempted: 20, correct: 16, accuracy: 0.8, window: 20, met: true });
  assert.deepEqual(functions.medium, { attempted: 20, correct: 16, accuracy: 0.8 });
  assert.deepEqual(functions.hard, { attempted: 0, correct: 0, accuracy: null });
  assert.equal(rowFor(rows, "Linear inequalities").state, "not-enough-data");
  const circles = rowFor(rows, "Circles");
  assert.equal(circles.state, "not-started");
  assert.equal(circles.domain, "Geometry and Trigonometry");
  assert.equal(circles.accuracy, null);
});

test("the gate needs a full window of recent Medium answers at 80%", () => {
  // Nineteen perfect Medium answers are not yet the gate.
  let rows = Analytics.skillMap(many(19, {}), SECTIONS);
  assert.equal(rowFor(rows, "Linear functions").state, "building");
  assert.equal(rowFor(rows, "Linear functions").gate.met, false);

  // Old misses age out of the window: ten wrong, then twenty right.
  rows = Analytics.skillMap([...many(10, { correct: false }), ...many(20, {})], SECTIONS);
  const row = rowFor(rows, "Linear functions");
  assert.deepEqual([row.gate.attempted, row.gate.correct, row.gate.met], [20, 20, true]);
  assert.equal(row.medium.attempted, 30);

  // 15 of 20 is below the gate; Hard and Easy answers never fill the window.
  rows = Analytics.skillMap([
    ...many(15, {}), ...many(5, { correct: false }),
    ...many(10, { difficulty: "Hard" }), ...many(10, { difficulty: "Easy" }),
  ], SECTIONS);
  assert.equal(rowFor(rows, "Linear functions").gate.accuracy, 0.75);
  assert.equal(rowFor(rows, "Linear functions").state, "building");
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

test("mastered takes the gate and 60% on at least five Hard answers", () => {
  const gate = [...many(18, {}), ...many(2, { correct: false })];
  const hard = (right, wrong) => [...many(right, { difficulty: "Hard" }), ...many(wrong, { difficulty: "Hard", correct: false })];
  const state = (list) => rowFor(Analytics.skillMap(list, SECTIONS), "Linear functions").state;
  assert.equal(state([...gate, ...hard(3, 2)]), "mastered");
  assert.equal(state([...gate, ...hard(4, 0)]), "at-gate");
  assert.equal(state([...gate, ...hard(2, 3)]), "at-gate");
  assert.equal(state([...many(10, {}), ...hard(10, 0)]), "building");
});

test("answers to skills no longer in the catalog still show", () => {
  const rows = Analytics.skillMap([attempt({ skill: "Retired skill", domain: "Algebra" })], SECTIONS);
  assert.deepEqual(rows.map((row) => row.skill), ["Linear functions", "Linear inequalities", "Circles", "Retired skill"]);
  assert.deepEqual(Analytics.sortSkills(rows, "domain").map((row) => row.skill),
    ["Linear functions", "Linear inequalities", "Retired skill", "Circles"]);
  assert.equal(rowFor(rows, "Retired skill").state, "not-enough-data");
});

test("sorting by need puts weak skills with evidence first; the next focus follows", () => {
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
  const focus = Analytics.nextFocus(rows);
  assert.equal(focus.reason, "weakest");
  assert.equal(focus.row.skill, "Linear inequalities");

  // Without a building skill, the least practised skill is next.
  const fresh = Analytics.skillMap(many(3, { skill: "Linear functions" }), SECTIONS);
  const least = Analytics.nextFocus(fresh);
  assert.equal(least.reason, "least-practised");
  assert.equal(least.row.skill, "Linear inequalities");
  assert.equal(Analytics.nextFocus(fresh, { sectionKeys: ["sat-reading-writing"] }), null);
  assert.deepEqual(Analytics.stateCounts(rows),
    { "not-started": 0, "not-enough-data": 1, building: 2, "at-gate": 0, mastered: 0 });
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
