"use strict";

// The weekly report (lib/analytics.js weeklyReport, weeklyReportText) and
// its On track / Needs attention signal, for SAT and for ACT, plus the ACT
// side of the Review cap: ACT keeps its accuracy-only step and gets the same
// once-a-day Review and ten-question sets as SAT.

const test = require("node:test");
const assert = require("node:assert/strict");
const Analytics = require("../src/lib/analytics");
const Queue = require("../src/lib/review-queue");
const catalog = require("../content/catalog.json");

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const NOW = new Date(2026, 9, 16, 18).getTime();
const mathSection = catalog.sections.find((section) => section.key === "sat-math");
const actSections = catalog.sections.filter((section) => section.test === "ACT" &&
  (section.responseTypes || []).some((type) => type !== "essay"));
const PLAN = Analytics.PLANS["sat-math"];
const trackA = PLAN.stages.filter((stage) => stage.stage <= 2).flatMap((stage) => stage.skills);
const domainOf = (skill) => mathSection.domains.find((domain) => Object.keys(domain.skills).includes(skill)).name;

let counter = 0;
function answer(skill, daysAgo, fields) {
  counter += 1;
  return Object.assign({
    id: `w${counter}`,
    questionId: `sat-math:t${counter % 5}:s${counter}`,
    templateId: `t${counter % 5}`,
    sectionKey: "sat-math",
    test: "SAT",
    domain: domainOf(skill),
    skill,
    difficulty: "Medium",
    source: "template",
    correct: true,
    answered: true,
    hinted: false,
    timeMs: 60000,
    sessionId: "set",
    timestamp: NOW - daysAgo * DAY - (counter % 50) * 60000,
  }, fields);
}
const many = (count, skill, daysAgo, fields) => Array.from({ length: count }, () => answer(skill, daysAgo, fields));

function report(input) {
  const attempts = input.attempts || [];
  const rows = Analytics.skillMap(attempts, [mathSection]);
  const plan = Analytics.planState(rows, { sectionKey: "sat-math", attempts, sessions: input.sessions || [],
    officialChecks: input.officialChecks || [], now: NOW });
  return Analytics.weeklyReport(Object.assign({ test: "SAT", rows, plan, sessions: [], now: NOW }, input));
}

test("the weekly report counts the last seven days of one test's practice", () => {
  const attempts = [
    ...many(6, trackA[0], 0, { difficulty: "Easy" }),
    ...many(4, trackA[0], 2),
    ...many(3, trackA[0], 4, { reviewOf: "sat-math:t1", sessionId: "rev" }),
    answer(trackA[0], 4, { answered: false, correct: false }),
    ...many(5, trackA[0], 9),
    answer(trackA[0], 1, { sectionKey: "act-english", test: "ACT", source: "bank", questionId: "act-english-0001" }),
  ];
  const sessions = [
    { id: "m1", kind: "module", sectionKey: "sat-math", finishedAt: NOW - 3 * DAY, total: 22, correct: 13, hintedCorrect: 0,
      hard: { total: 7, correct: 2, hintedCorrect: 0 }, timeMs: 30 * 60000 },
    { id: "full", kind: "full", sectionKey: "sat-reading-writing", sections: ["sat-reading-writing", "sat-math"],
      finishedAt: NOW - 3 * DAY, total: 98, correct: 60, timeMs: 134 * 60000 },
    { id: "d1", kind: "drill", sectionKey: "sat-math", finishedAt: NOW - DAY, total: 10, correct: 7, timeMs: 20 * 60000 },
    { id: "old", kind: "drill", sectionKey: "sat-math", finishedAt: NOW - 10 * DAY, total: 10, correct: 7, timeMs: 20 * 60000 },
    { id: "act", kind: "practice", sectionKey: "act-english", finishedAt: NOW - DAY, total: 10, correct: 7, timeMs: 15 * 60000 },
  ];
  const result = report({ attempts, sessions, testDate: "2026-11-07" });
  assert.equal(result.test, "SAT");
  assert.equal(result.days, 7);
  assert.equal(result.practiceDays, 3, "today, two days ago and four days ago");
  assert.equal(result.minutes, 50, "sets in the window, not the full test's repeat of its modules");
  assert.deepEqual([result.newQuestions, result.reviewQuestions], [11, 3]);
  assert.deepEqual(result.modules.map((entry) => [entry.correct, entry.total, entry.hardCorrect, entry.hardTotal]), [[13, 22, 2, 7]]);
  assert.deepEqual([result.testDate, result.daysLeft], ["2026-11-07", 22]);
  assert.deepEqual(result.skills.inFlight.map((entry) => [entry.skill, entry.track, entry.state]),
    [[trackA[0], "A", "building"], ["Equivalent expressions", "B", "not-started"]]);
  assert.deepEqual(result.skills.movedOn, []);
  assert.deepEqual(result.unavailable, []);
});

test("the signal names each reason that fires, and is On track when none does", () => {
  // Five practice days, a recent module, nothing else: on track.
  const steady = [0, 1, 2, 3, 4].flatMap((day) => many(4, trackA[0], day));
  const module = { id: "m", kind: "module", sectionKey: "sat-math", finishedAt: NOW - 5 * DAY, total: 22, correct: 12,
    hard: { total: 7, correct: 2 } };
  let result = report({ attempts: steady, sessions: [module] });
  assert.deepEqual([result.signal.status, result.signal.reasons], ["on-track", []]);
  // Three practice days.
  result = report({ attempts: [0, 1, 2].flatMap((day) => many(4, trackA[0], day)), sessions: [module] });
  assert.deepEqual(result.signal.reasons.map((reason) => reason.key), ["practice-days"]);
  assert.equal(result.signal.status, "needs-attention");
  assert.match(result.signal.reasons[0].text, /3 of the last 7 days/);
  // No timed module in 14 days once three skills are started.
  const three = [...steady, ...many(40, trackA[0], 6, { correct: false }), ...many(3, trackA[1], 0), ...many(3, "Equivalent expressions", 0,
    { domain: "Advanced Math" })];
  result = report({ attempts: three, sessions: [Object.assign({}, module, { finishedAt: NOW - 15 * DAY })] });
  assert.ok(result.signal.reasons.some((reason) => reason.key === "no-module"));
  assert.ok(!report({ attempts: three, sessions: [module] }).signal.reasons.some((reason) => reason.key === "no-module"));
  assert.ok(!report({ attempts: steady, sessions: [] }).signal.reasons.some((reason) => reason.key === "no-module"),
    "not before three skills are started");
  // The last two official Math scores within ten points.
  const scores = [{ id: "a", date: "2026-08-23", kind: "practice", math: 520 }, { id: "b", date: "2026-10-03", kind: "sat", math: 530 },
    { id: "rw", date: "2026-10-04", kind: "practice", readingWriting: 700 }];
  result = report({ attempts: steady, sessions: [module], officialScores: scores });
  const flat = result.signal.reasons.find((reason) => reason.key === "flat-scores");
  assert.equal(flat.href, "learn.html#sat/general/math-plan/adjust");
  assert.deepEqual(result.scores.map((score) => score.math), [520, 530]);
  assert.ok(!report({ attempts: steady, sessions: [module], officialScores: [scores[0], Object.assign({}, scores[1], { math: 560 })] })
    .signal.reasons.some((reason) => reason.key === "flat-scores"));
  // An official Medium check 20 points or more below Liminal Medium accuracy.
  const check = { id: "c", sectionKey: "sat-math", skill: trackA[0], difficulty: "Medium", attempted: 10, correct: 7, date: "2026-10-15" };
  result = report({ attempts: steady, sessions: [module], officialChecks: [check] });
  assert.ok(result.signal.reasons.some((reason) => reason.key === "transfer"), "70% official against 100% here");
});

test("the transfer reason compares the latest Medium check with Liminal Medium accuracy in the skill", () => {
  const attempts = [0, 1, 2, 3, 4].flatMap((day) => [...many(3, trackA[0], day), answer(trackA[0], day, { correct: false })]);
  const module = { id: "m", kind: "module", sectionKey: "sat-math", finishedAt: NOW - DAY, total: 22, correct: 12 };
  const check = (correct, fields) => Object.assign({ id: `c${correct}`, sectionKey: "sat-math", skill: trackA[0], difficulty: "Medium",
    attempted: 10, correct, date: "2026-10-15" }, fields);
  // Liminal Medium 75%: an official 50% is 25 points below; 60% is 15.
  let result = report({ attempts, sessions: [module], officialChecks: [check(5)] });
  const reason = result.signal.reasons.find((entry) => entry.key === "transfer");
  assert.match(reason.text, /isn.t transferring in Linear equations in one variable: 50% .* 75%/);
  result = report({ attempts, sessions: [module], officialChecks: [check(6)] });
  assert.ok(!result.signal.reasons.some((entry) => entry.key === "transfer"));
  result = report({ attempts, sessions: [module], officialChecks: [check(5, { difficulty: "Hard" })] });
  assert.ok(!result.signal.reasons.some((entry) => entry.key === "transfer"), "a Hard check is not compared with Medium");
  assert.deepEqual(result.checks.map((entry) => [entry.skill, entry.accuracy]), [[trackA[0], 0.5]]);
});

test("pace: first-pass skills left against skills leaving flight, or not enough history yet", () => {
  // Two weeks of practice where one skill left flight.
  const early = many(40, trackA[0], 20, { correct: false });
  const later = [0, 1, 2, 3, 4].flatMap((day) => many(4, trackA[1], day, { difficulty: "Easy" }));
  const module = { id: "m", kind: "module", sectionKey: "sat-math", finishedAt: NOW - DAY };
  let result = report({ attempts: early.concat(later), sessions: [module], testDate: "2026-11-07" });
  assert.deepEqual([result.pace.enough, result.pace.departures, result.pace.remaining], [true, 1, 18]);
  assert.equal(result.pace.covered, 1, "one skill in 21 days covers about one more in 22 days");
  const pace = result.signal.reasons.find((reason) => reason.key === "pace");
  assert.match(pace.text, /about 1 of the 18 skills still in the first pass/);
  // Without a test date there is nothing to compare.
  result = report({ attempts: early.concat(later), sessions: [module] });
  assert.ok(!result.signal.reasons.some((reason) => reason.key === "pace"));
  // Under two weeks of history: not enough to judge a pace.
  result = report({ attempts: later, sessions: [module], testDate: "2026-11-07" });
  assert.equal(result.pace.enough, false);
  assert.ok(!result.signal.reasons.some((reason) => reason.key === "pace"));
  assert.match(Analytics.weeklyReportText(result), /Pace: not enough history yet/);
});

test("the copied summary is plain text that reports practice and never a score estimate", () => {
  const attempts = [0, 2, 4].flatMap((day) => many(4, trackA[0], day));
  const result = report({ attempts, sessions: [{ id: "m", kind: "module", sectionKey: "sat-math", finishedAt: NOW - DAY, total: 22,
    correct: 14, hard: { total: 7, correct: 3 } }], testDate: "2026-11-07",
    officialScores: [{ id: "b", date: "2026-10-03", kind: "sat", math: 530 }] });
  const text = Analytics.weeklyReportText(result, { sectionName: () => "Math" });
  assert.match(text, /^Liminal weekly report: SAT, 2026-10-10 to 2026-10-16/);
  assert.match(text, /Status: Needs attention\n- Practised on 3 of the last 7 days/);
  assert.match(text, /Timed modules: Math 14 of 22 \(Hard 3 of 7\)/);
  assert.match(text, /Math skills in flight: Linear equations in one variable \(Track A, Building, 12 of 40 used\); Equivalent expressions \(Track B, Not started, 0 of 40 used\)/);
  assert.match(text, /Official Math scores: 530 on 2026-10-03 \(real SAT\)/);
  assert.match(text, /Test date: 2026-11-07 \(22 days left\)/);
  assert.match(text, /It does not estimate or predict a score\.$/);
  assert.doesNotMatch(text, /<|predicted score|estimated score|projected/i);
});

/* --------------------------------------------------------------- ACT */

let actCounter = 0;
function actAnswer(sectionKey, daysAgo, fields) {
  actCounter += 1;
  const section = actSections.find((entry) => entry.key === sectionKey);
  const domain = section.domains[0];
  return Object.assign({
    id: `act${actCounter}`,
    questionId: `${sectionKey}-${String(actCounter).padStart(4, "0")}`,
    sectionKey,
    test: "ACT",
    domain: domain.name,
    skill: Object.keys(domain.skills)[0],
    difficulty: "Medium",
    source: "bank",
    correct: true,
    answered: true,
    hinted: false,
    timeMs: 50000,
    sessionId: "act-set",
    contentIdentity: "q1-0000000000000001",
    timestamp: NOW - daysAgo * DAY - (actCounter % 50) * 60000,
  }, fields);
}

test("ACT: the weekly report counts per test and leaves SAT-only parts out, never computed", () => {
  const attempts = [
    ...[0, 1, 2, 3].flatMap((day) => [actAnswer("act-english", day), actAnswer("act-mathematics", day, { correct: false })]),
    actAnswer("act-english", 3, { reviewOf: "act-english-0001" }),
    actAnswer("act-english", 12),
  ];
  const sessions = [
    { id: "e", kind: "practice", sectionKey: "act-english", finishedAt: NOW - DAY, total: 10, correct: 6, timeMs: 12 * 60000 },
    { id: "s", kind: "module", sectionKey: "sat-math", finishedAt: NOW - DAY, total: 22, correct: 12, timeMs: 35 * 60000 },
  ];
  const rows = Analytics.skillMap(attempts, actSections, { tiered: () => false });
  const result = Analytics.weeklyReport({
    test: "ACT", attempts, sessions, rows, plan: null, testDate: "2026-12-12", now: NOW,
    officialScores: [{ id: "a", date: "2026-08-23", kind: "practice", math: 520 }, { id: "b", date: "2026-10-03", kind: "sat", math: 530 }],
    officialChecks: [{ id: "c", sectionKey: "sat-math", skill: "Circles", difficulty: "Medium", attempted: 10, correct: 2, date: "2026-10-15" }],
  });
  assert.equal(result.test, "ACT");
  assert.deepEqual([result.practiceDays, result.minutes, result.newQuestions, result.reviewQuestions], [4, 12, 8, 1]);
  assert.deepEqual([result.modules, result.skills, result.checks, result.scores, result.pace], [null, null, null, null, null]);
  assert.deepEqual(result.unavailable, ["modules", "skills", "checks", "scores", "pace"]);
  assert.deepEqual(result.signal, { status: "on-track", reasons: [] }, "SAT scores, checks and modules never fire for ACT");
  assert.equal(result.daysLeft, 57);
  const text = Analytics.weeklyReportText(result);
  assert.match(text, /^Liminal weekly report: ACT/);
  assert.match(text, /Not available for ACT: timed modules, plan tracks, official checks and scores\./);
  assert.doesNotMatch(text, /Official Math scores|Skills in flight|Timed modules:/);
  // Too few ACT practice days still fires, as for SAT.
  const sparse = Analytics.weeklyReport({ test: "ACT", attempts: attempts.slice(0, 2), sessions, rows, now: NOW });
  assert.deepEqual(sparse.signal.reasons.map((reason) => reason.key), ["practice-days"]);
  // An empty record does not crash.
  assert.equal(Analytics.weeklyReport({ test: "ACT", now: NOW }).practiceDays, 0);
});

test("ACT: Review is the step once a day and a set takes ten, as for SAT", () => {
  const misses = Array.from({ length: 14 }, (_, index) => actAnswer("act-english", 20 - index, { correct: false }));
  const summary = Queue.summarize(Queue.build(misses), NOW);
  assert.equal(summary.due.length, 14);
  const { picked } = Queue.pickSet(summary.due);
  assert.equal(picked.length, 10);
  assert.deepEqual(picked.map((entry) => entry.questionId), misses.slice(0, 10).map((attempt) => attempt.questionId),
    "most overdue first");
  const rows = Analytics.skillMap(misses, actSections, { tiered: () => false });
  const first = Analytics.nextStep(rows, { dueCount: 14, reviewedToday: false, sessions: [], now: NOW });
  assert.deepEqual([first.kind, first.dueCount], ["review", 14]);
  const review = { id: "r", kind: "review", sectionKey: "act-english", finishedAt: NOW - HOUR };
  assert.equal(Analytics.reviewDoneToday([review], "ACT", NOW), true);
  assert.equal(Analytics.reviewDoneToday([review], "SAT", NOW), false, "ACT Review does not close SAT's");
  const after = Analytics.nextStep(rows, { dueCount: 14, reviewedToday: Analytics.reviewDoneToday([review], "ACT", NOW),
    sessions: [review], now: NOW });
  assert.deepEqual([after.kind, after.reviewDue], ["skill", 14]);
});

test("ACT: the accuracy-only step is unchanged, with no tracks, budget, Hard mixing or gate", () => {
  const attempts = [
    ...Array.from({ length: 6 }, () => actAnswer("act-english", 1, { correct: false })),
    ...Array.from({ length: 30 }, () => actAnswer("act-english", 2, { skill: Object.keys(actSections[0].domains[0].skills)[1] })),
  ];
  const rows = Analytics.skillMap(attempts, actSections, { tiered: () => false });
  const step = Analytics.nextStep(rows, { attempts, sessions: [{ id: "d", kind: "drill", sectionKey: "act-english", finishedAt: NOW }],
    now: NOW, desmos: true, recentSection: "act-english" });
  assert.deepEqual([step.kind, step.reason, step.level, step.levelWhy], ["skill", "lowest-accuracy", null, "accuracy-only"]);
  ["track", "budget", "mix", "learnPage", "pass", "entry"].forEach((field) => assert.equal(step[field], undefined, field));
  assert.ok(rows.every((row) => row.state !== "at-gate" && row.state !== "mastered"));
  assert.equal(Analytics.planState(rows.filter((row) => row.sectionKey === "act-english"), { sectionKey: "act-english", attempts }), null);
  assert.deepEqual(Analytics.checkPrompts(rows, []), []);
});
