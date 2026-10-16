"use strict";

// The student-experience review's fixes: budgets spent only by a skill's own
// drills, the lesson offered until a skill's first drill, "stuck at Easy"
// only when drills never left Easy, official checks prompted when a turn
// ends short of the target, Review misses parked until their skill's turn,
// and the weekly report's signs of practising without learning. The
// two-week record (test/fixtures/plan-two-weeks.json) is a real ~530
// student's history from the review, driven through the UI.

const test = require("node:test");
const assert = require("node:assert/strict");
const Analytics = require("../src/lib/analytics");
const Progress = require("../src/lib/progress");
const Queue = require("../src/lib/review-queue");
const catalog = require("../content/catalog.json");
const fixture = require("./fixtures/plan-two-weeks.json");

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const mathSection = catalog.sections.find((section) => section.key === "sat-math");
const PLAN = Analytics.PLANS["sat-math"];
const trackA = PLAN.stages.filter((stage) => stage.stage <= 2).flatMap((stage) => stage.skills);
const trackB = PLAN.stages.filter((stage) => stage.stage >= 3).flatMap((stage) => stage.skills);
const domainOf = (skill) => mathSection.domains.find((domain) => Object.keys(domain.skills).includes(skill)).name;

const record = Progress.normalize(fixture);
const END = Math.max(...record.attempts.map((attempt) => attempt.timestamp)) + HOUR;

function planOf(attempts, sessions, extra) {
  const rows = Analytics.skillMap(attempts, [mathSection]);
  const placement = Analytics.placements(attempts, sessions || [], [mathSection])["sat-math"];
  return { rows, plan: Analytics.planState(rows, Object.assign({ sectionKey: "sat-math", attempts, sessions, placement, now: END }, extra)) };
}

let clock = new Date(2026, 5, 1, 8).getTime();
let counter = 0;
function answer(skill, fields) {
  counter += 1;
  clock += HOUR;
  return Object.assign({ id: `f${counter}`, questionId: `sat-math:k${counter % 4}-${skill.length}:s${counter}`,
    templateId: `k${counter % 4}-${skill.length}`, sectionKey: "sat-math", test: "SAT", domain: domainOf(skill), skill,
    difficulty: "Medium", source: "template", correct: true, answered: true, hinted: false, timestamp: clock }, fields);
}
const answers = (count, skill, fields) => Array.from({ length: count }, () => answer(skill, fields));
const session = (id, kind, extra) => Object.assign({ id, kind, sectionKey: "sat-math", finishedAt: clock }, extra);

test("only a skill's own drills spend its budget: the diagnostic, mixed sets and modules do not", () => {
  const { plan } = planOf(record.attempts, record.sessions);
  // Without sessions or set kinds every answer counts (the record's answers
  // take their set kinds from their sessions when it loads).
  const bare = record.attempts.map(({ setKind, setSkill, ...rest }) => rest);
  assert.ok(record.attempts.some((attempt) => attempt.setKind === "drill"));
  const { plan: legacy } = planOf(bare, undefined);
  const skill = "Equivalent expressions";
  const drillIds = new Set(record.sessions.filter((entry) => entry.kind === "drill" && entry.skill === skill).map((entry) => entry.id));
  const own = Progress.markRepeats(record.attempts).filter((attempt) => attempt.skill === skill && drillIds.has(attempt.sessionId) &&
    attempt.repeat !== true);
  // Its 20 drill answers, nothing from other sets: exactly its budget,
  // with a Medium drill in the turn, so no extra drill.
  assert.equal(own.length, Analytics.BUDGET.answers);
  assert.deepEqual([plan.skills[skill].status, plan.skills[skill].leftBy, plan.skills[skill].spent, plan.skills[skill].extraGiven],
    ["moved-on", "budget", own.length, false]);
  assert.equal(plan.skills[skill].drillAnswers, own.length);
  const leftAt = (state) => state.departures.find((entry) => entry.skill === skill).at;
  assert.ok(leftAt(legacy) < leftAt(plan), "counting every set spent it sooner");
  // Before its first drill nothing is spent, whatever other sets asked.
  const firstDrill = Math.min(...own.map((attempt) => attempt.timestamp));
  const before = record.attempts.filter((attempt) => attempt.timestamp < firstDrill);
  assert.ok(before.filter((attempt) => attempt.skill === skill).length > 0, "it had answers from other sets");
  const early = planOf(before, record.sessions).plan.skills[skill];
  assert.deepEqual([early.spent, early.practised], [0, false]);
  // A skill stuck at Easy still moves on: Easy drill answers spend it too.
  const stuck = answers(Analytics.BUDGET.answers + Analytics.BUDGET.extra, trackA[0], { difficulty: "Easy", correct: false, sessionId: "d1" });
  const stuckPlan = planOf(stuck, [session("d1", "drill", { skill: trackA[0] })]).plan;
  assert.deepEqual([stuckPlan.skills[trackA[0]].status, stuckPlan.skills[trackA[0]].easyStuck], ["moved-on", true]);
  // "Practice what I missed" is not a drill.
  const missed = answers(40, trackA[0], { difficulty: "Easy", correct: false, sessionId: "m1" });
  assert.equal(planOf(missed, [session("m1", "missed-drill")]).plan.skills[trackA[0]].spent, 0);
});

test("stuck at Easy only when the skill's drills never left Easy", () => {
  const drills = [session("d1", "drill", { skill: trackA[0] }), session("d2", "drill", { skill: trackA[0] })];
  // Drills that reached Medium (with Hard mixed in), short of the target: not stuck at Easy.
  const list = answers(10, trackA[0], { difficulty: "Easy", sessionId: "d1" })
    .concat(answers(30, trackA[0], { correct: false, sessionId: "d2" }));
  const { plan } = planOf(list, drills);
  assert.deepEqual([plan.skills[trackA[0]].status, plan.skills[trackA[0]].aboveEasy, plan.skills[trackA[0]].easyStuck],
    ["moved-on", true, false]);
});

test("the lesson is offered until a skill's first drill, whatever other sets asked of it", () => {
  // Six diagnostic and module answers, no drill: the lesson is still offered.
  const others = answers(3, trackA[0], { sessionId: "diag" }).concat(answers(3, trackA[0], { sessionId: "mod" }));
  const sessions = [session("diag", "diagnostic"), session("mod", "module")];
  const rows = Analytics.skillMap(others, [mathSection]);
  let step = Analytics.nextStep(rows, { attempts: others, sessions, now: clock + HOUR });
  assert.equal(step.skill, trackA[0]);
  assert.equal(step.learnPage, "sat-math/algebra/linear-equations-in-one-variable");
  // After its first drill, no: once Track B has had its first drill (with
  // its lesson offered), the step comes back to Track A without it.
  const drilled = others.concat(answers(2, trackA[0], { difficulty: "Easy", sessionId: "d" }));
  const withDrill = sessions.concat(session("d", "drill", { skill: trackA[0] }));
  step = Analytics.nextStep(Analytics.skillMap(drilled, [mathSection]), { attempts: drilled, sessions: withDrill, now: clock + HOUR });
  assert.deepEqual([step.skill, step.learnPage], [trackB[0], "sat-math/advanced-math/equivalent-expressions"]);
  const both = drilled.concat(answers(2, trackB[0], { difficulty: "Easy", sessionId: "e" }));
  const after = withDrill.concat(session("e", "drill", { skill: trackB[0] }), session("mx", "mixed"));
  step = Analytics.nextStep(Analytics.skillMap(both, [mathSection]), { attempts: both, sessions: after, now: clock + HOUR });
  assert.equal(step.skill, trackA[0]);
  assert.equal(step.learnPage, undefined);
});

test("an official check is prompted when a skill's turn ends short of its target, until one is recorded", () => {
  const list = answers(40, trackA[0], { correct: false, sessionId: "d1" });
  const { rows, plan } = planOf(list, [session("d1", "drill", { skill: trackA[0] })]);
  const prompts = Analytics.checkPromptList(rows, [], { "sat-math": plan });
  assert.deepEqual(prompts.map((item) => [item.row.skill, item.reason]), [[trackA[0], "moved-on"]]);
  const leftOn = Analytics.formatDate(new Date(plan.skills[trackA[0]].leftAt));
  const check = (date) => ({ id: "c", sectionKey: "sat-math", skill: trackA[0], difficulty: "Medium", attempted: 10, correct: 5, date });
  assert.deepEqual(Analytics.checkPromptList(rows, [check(leftOn)], { "sat-math": plan }), []);
  assert.equal(Analytics.checkPromptList(rows, [check("2026-01-01")], { "sat-math": plan }).length, 1, "an older check does not count");
  assert.deepEqual(Analytics.checkPrompts(rows, []), [], "without the plan, only skills at their target");
});

test("Review parks misses on skills never in flight, schedules them from the skill's first turn, and takes drilled skills first", () => {
  const miss = (skill, at, extra) => Object.assign(answer(skill, { correct: false, timestamp: at }), extra);
  const day = (offset) => new Date(2026, 6, 1 + offset, 10).getTime();
  // A Hard miss in a module on a skill not yet taught, a miss in a drilled skill.
  const untaught = miss(trackB[3], day(0), { difficulty: "Hard", sessionId: "mod" });
  const taught = miss(trackA[0], day(0), { sessionId: "d1", templateId: "other", questionId: "sat-math:other:1" });
  const entries = Queue.build([untaught, taught]);
  const plans = { "sat-math": planOf([taught], [session("d1", "drill", { skill: trackA[0] }), session("mod", "module")]).plan };
  const flightAt = Analytics.reviewFlightAt(plans);
  let summary = Queue.summarize(entries, day(5), { flightAt, prefer: Analytics.reviewPrefer(plans) });
  assert.deepEqual(summary.parked.map((entry) => entry.skill), [trackB[3]]);
  assert.deepEqual(summary.due.map((entry) => entry.skill), [trackA[0]]);
  // Once the skill first flies (July 11), the miss is due a day later.
  summary = Queue.summarize(entries, day(10), { flightAt: () => day(10) });
  assert.equal(summary.due.length, 0);
  assert.equal(Queue.dayKey(summary.upcoming.find((entry) => entry.skill === trackB[3]).dueDay), "2026-07-12");
  // Drilled skills first among those due, each group most overdue first.
  const older = miss(trackB[3], day(-3), { templateId: "older", questionId: "sat-math:older:1" });
  const order = Queue.summarize(Queue.build([untaught, taught, older]), day(5), { prefer: (entry) => entry.skill === trackA[0] }).due;
  assert.deepEqual(order.map((entry) => entry.templateId), ["other", "older", untaught.templateId]);
  // The two-week record: misses on skills never in flight are parked.
  const { plan } = planOf(record.attempts, record.sessions);
  const all = Queue.summarize(Queue.build(record.attempts), END);
  const parked = Queue.summarize(Queue.build(record.attempts), END, { flightAt: Analytics.reviewFlightAt({ "sat-math": plan }) });
  assert.ok(parked.parked.length > 0);
  assert.ok(parked.parked.every((entry) => plan.skills[entry.skill].firstEnteredAt === null));
  assert.equal(parked.due.length + parked.upcoming.length + parked.parked.length, all.due.length + all.upcoming.length);
  assert.ok(parked.due.length < all.due.length);
});

test("the weekly report names practising without learning", () => {
  const now = clock + 40 * DAY;
  const at = (daysAgo, hour) => now - daysAgo * DAY + (hour || 0) * 60000;
  const report = (list, sessions) => {
    const rows = Analytics.skillMap(list, [mathSection]);
    const plan = Analytics.planState(rows, { sectionKey: "sat-math", attempts: list, sessions, now });
    return Analytics.weeklyReport({ test: "SAT", attempts: list, sessions, rows, plan, now });
  };
  const keys = (result) => result.signal.reasons.map((reason) => reason.key);
  // (a) A skill used its budget below routine at Medium: named, with advice.
  const turn = Array.from({ length: 40 }, (_, index) => answer(trackA[0], { correct: index % 3 === 0, sessionId: "d1",
    timestamp: at(10, index) }));
  let result = report(turn, [session("d1", "drill", { skill: trackA[0] })]);
  const stalled = result.signal.reasons.find((reason) => reason.key === "stalled-skills");
  assert.deepEqual(stalled.skills, [trackA[0]]);
  assert.match(stalled.text, /^Linear equations in one variable used its practice turn without becoming reliable at Medium\. Reread the lesson and its prerequisite checks, then try about 10 official Medium questions/);
  // (b) No target reached in 21 days across 8 or more practice days.
  const days = (count, skill, fields) => Array.from({ length: count }, (_, index) => answer(skill, Object.assign({
    sessionId: "d2", difficulty: "Easy", timestamp: at(index + 1, 5) }, fields)));
  result = report(days(9, trackB[0]), [session("d2", "drill", { skill: trackB[0] })]);
  assert.ok(keys(result).includes("no-target"));
  assert.match(result.signal.reasons.find((reason) => reason.key === "no-target").text,
    /^No skill reached its practice target in the last 21 days, across 9 practice days\.$/);
  assert.ok(!keys(report(days(7, trackB[0]), [session("d2", "drill", { skill: trackB[0] })])).includes("no-target"), "7 days");
  // (c) Medium first answers: the last 14 days not above the 14 before (30 or more in each).
  const medium = (count, daysAgo, rightEvery) => Array.from({ length: count }, (_, index) => answer(trackB[1], {
    correct: index % rightEvery !== 0, sessionId: "d3", timestamp: at(daysAgo, index) }));
  const flat = medium(30, 20, 3).concat(medium(30, 3, 3));
  result = report(flat, [session("d3", "drill", { skill: trackB[1] })]);
  assert.ok(keys(result).includes("medium-flat"));
  assert.match(result.signal.reasons.find((reason) => reason.key === "medium-flat").text,
    /^Medium accuracy is not rising: 67% in the last 14 days against 67% in the 14 before\.$/);
  const rising = medium(30, 20, 2).concat(medium(30, 3, 4));
  assert.ok(!keys(report(rising, [session("d3", "drill", { skill: trackB[1] })])).includes("medium-flat"));
  const few = medium(29, 20, 3).concat(medium(30, 3, 3));
  assert.ok(!keys(report(few, [session("d3", "drill", { skill: trackB[1] })])).includes("medium-flat"), "29 before");
});

test("the two-week record: the report no longer says On track while nothing is being learned", () => {
  const { rows, plan } = planOf(record.attempts, record.sessions, { officialChecks: record.officialChecks });
  const result = Analytics.weeklyReport({ test: "SAT", attempts: record.attempts, sessions: record.sessions, rows, plan,
    officialChecks: record.officialChecks, officialScores: record.officialScores, testDate: "2026-12-05", now: END });
  assert.equal(result.signal.status, "needs-attention");
  const keys = result.signal.reasons.map((reason) => reason.key);
  assert.ok(keys.includes("no-target"));
  assert.ok(!keys.includes("flat-scores"), "SAT on Oct 3, Bluebook on Oct 17, practice from Oct 16: not a stall");
  assert.deepEqual(result.mathTargets, { met: 0, total: 19 });
  const text = Analytics.weeklyReportText(result, { sectionName: () => "Math" });
  assert.match(text, /^Liminal weekly report: SAT, Oct 24 to Oct 30, 2026/);
  assert.doesNotMatch(text, /in flight|Track [AB]|Building|moved on|first pass|left flight/i);
});

test("no false Needs attention: every skill at its target, or a high Medium plateau", () => {
  const now = clock + 60 * DAY;
  const at = (daysAgo, minute) => now - daysAgo * DAY + (minute || 0) * 60000;
  const report = (list, sessions) => {
    const rows = Analytics.skillMap(list, [mathSection]);
    const plan = Analytics.planState(rows, { sectionKey: "sat-math", attempts: list, sessions, now });
    return Analytics.weeklyReport({ test: "SAT", attempts: list, sessions, rows, plan, now });
  };
  const keys = (result) => result.signal.reasons.map((reason) => reason.key);
  // Every plan skill at its target long ago (over two days), steady practice since: nothing left to reach.
  const skills = PLAN.stages.flatMap((stage) => stage.skills);
  const old = skills.flatMap((skill, index) => Array.from({ length: 30 }, (_, k) => answer(skill, { sessionId: "old",
    timestamp: at(40 - (k % 2), index * 30 + k) })));
  const steady = Array.from({ length: 12 }, (_, day) => answer(skills[day], { sessionId: "now", timestamp: at(day + 1, 5) }));
  const all = report(old.concat(steady), [session("old", "mixed"), session("now", "mixed")]);
  assert.equal(all.mathTargets.met, 19);
  assert.ok(!keys(all).includes("no-target"), "nothing is left to reach");
  // A flat Medium plateau at 92%: not flagged; the same tie at 67% is.
  const medium = (count, daysAgo, right) => Array.from({ length: count }, (_, index) => answer(trackB[1], {
    correct: index < right, sessionId: "d", timestamp: at(daysAgo, index) }));
  const sessions = [session("d", "drill", { skill: trackB[1] })];
  assert.ok(!keys(report(medium(50, 20, 46).concat(medium(50, 3, 46)), sessions)).includes("medium-flat"), "92% and 92%");
  assert.ok(keys(report(medium(30, 20, 20).concat(medium(30, 3, 20)), sessions)).includes("medium-flat"), "67% and 67%");
  assert.ok(!keys(report(medium(30, 20, 20).concat(medium(30, 3, 22)), sessions)).includes("medium-flat"), "rising");
});

test("a parked miss comes back at the skill's first turn, first drill or target, whichever is first", () => {
  const miss = (skill, at, extra) => Object.assign(answer(skill, { correct: false, timestamp: at, difficulty: "Hard", sessionId: "mod",
    templateId: `p-${skill.length}`, questionId: `sat-math:p-${skill.length}:${at}` }), extra);
  const day = (offset) => new Date(2026, 7, 1 + offset, 10).getTime();
  const X = trackB[3];
  const parkedMiss = miss(X, day(0));
  // At its target without a turn in flight (drilled from the form and in mixed sets).
  const target = Array.from({ length: 30 }, (_, index) => answer(X, { sessionId: "mx", timestamp: day(1) + index * 3 * HOUR }));
  const list = [parkedMiss].concat(target);
  const plan = Analytics.planState(Analytics.skillMap(list, [mathSection]), { sectionKey: "sat-math", attempts: list,
    sessions: [session("mod", "module"), session("mx", "mixed")], now: day(10) });
  assert.equal(plan.skills[X].firstEnteredAt, null);
  assert.ok(plan.skills[X].firstReachedAt !== null);
  const summary = Queue.summarize(Queue.build(list), day(10), { flightAt: Analytics.reviewFlightAt({ "sat-math": plan }) });
  assert.deepEqual(summary.parked, [], "reaching the target unparks it");
  // A first drill of its own unparks it too.
  const drilled = [parkedMiss, answer(X, { sessionId: "own", timestamp: day(2), setKind: "drill", setSkill: X })];
  const drillPlan = Analytics.planState(Analytics.skillMap(drilled, [mathSection]), { sectionKey: "sat-math", attempts: drilled,
    sessions: [session("mod", "module")], now: day(3) });
  assert.equal(Analytics.reviewFlightAt({ "sat-math": drillPlan })({ sectionKey: "sat-math", skill: X }), day(2));
  // Never reached: parked.
  const never = Analytics.planState(Analytics.skillMap([parkedMiss], [mathSection]), { sectionKey: "sat-math", attempts: [parkedMiss],
    sessions: [session("mod", "module")], now: day(3) });
  assert.equal(Analytics.reviewFlightAt({ "sat-math": never })({ sectionKey: "sat-math", skill: X }), null);
});

test("a merged file keeps the fields this version does not know, and the copied summary words Easy turns plainly", () => {
  const IO = require("../src/lib/progress-io");
  const here = Progress.empty({ epoch: "e-here" });
  const file = Object.assign(Progress.empty({ epoch: "e-file" }), { futureField: { kept: true } });
  const merged = IO.mergeImport(here, IO.parseImport(JSON.stringify(file)).progress).progress;
  assert.deepEqual(merged.futureField, { kept: true });
  const mine = IO.mergeImport(Object.assign({}, here, { futureField: "mine" }), IO.parseImport(JSON.stringify(file)).progress).progress;
  assert.equal(mine.futureField, "mine", "this browser's copy wins");
  // "Stuck at Easy" in the parent's summary: what happened, not a judgement.
  const stuck = answers(30, trackA[0], { difficulty: "Easy", correct: true, sessionId: "d1", setKind: "drill", setSkill: trackA[0] });
  const rows = Analytics.skillMap(stuck, [mathSection]);
  const plan = Analytics.planState(rows, { sectionKey: "sat-math", attempts: stuck, sessions: [], now: clock + HOUR });
  assert.deepEqual([plan.skills[trackA[0]].status, plan.skills[trackA[0]].easyStuck, plan.skills[trackA[0]].spent], ["moved-on", true, 30]);
  const text = Analytics.weeklyReportText(Analytics.weeklyReport({ test: "SAT", attempts: stuck, sessions: [], rows, plan, now: clock + HOUR }));
  assert.match(text, /Linear equations in one variable \(working toward its target, was still practising at the easier level when its turn ended\)/);
  assert.doesNotMatch(text, /not yet reliable/);
});

test("a turn whose drills never left Easy gets one extra drill; a Medium drill in the turn means none", () => {
  const drill = [session("d1", "drill", { skill: trackA[0] })];
  const easy = (count, fields) => answers(count, trackA[0], Object.assign({ difficulty: "Easy", correct: false, sessionId: "d1" }, fields));
  // 20 Easy drill answers: the budget grows to 30 and the turn stays in flight.
  const twenty = planOf(easy(Analytics.BUDGET.answers), drill).plan.skills[trackA[0]];
  assert.deepEqual([twenty.status, twenty.budget, twenty.extraGiven, twenty.spent], ["in-flight", 30, true, 20]);
  // 29: still in flight; 30: moves on, once, with no second extra.
  assert.equal(planOf(easy(29), drill).plan.skills[trackA[0]].status, "in-flight");
  const thirty = planOf(easy(30), drill).plan.skills[trackA[0]];
  assert.deepEqual([thirty.status, thirty.leftBy, thirty.spent], ["moved-on", "budget", 30]);
  // One Medium drill answer in the turn: it moves on at 20.
  const mixed = easy(19).concat(answers(1, trackA[0], { correct: false, sessionId: "d1" }));
  const medium = planOf(mixed, drill).plan.skills[trackA[0]];
  assert.deepEqual([medium.status, medium.spent, medium.extraGiven], ["moved-on", 20, false]);
});
