"use strict";

// The SAT Math plan engine (lib/analytics.js planState, nextStep): two
// tracks with a skill in flight each, a budget per skill, the second pass,
// Hard mixed in once routine at Medium, the rotation of timed modules,
// mixed sets and the Desmos drill, the once-a-day Review cap, and official
// question-bank checks.

const test = require("node:test");
const assert = require("node:assert/strict");
const Analytics = require("../src/lib/analytics");
const Practice = require("../src/lib/practice");
const catalog = require("../content/catalog.json");

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const mathSection = catalog.sections.find((section) => section.key === "sat-math");
const rwSection = catalog.sections.find((section) => section.key === "sat-reading-writing");
const PLAN = Analytics.PLANS["sat-math"];
const planSkills = PLAN.stages.flatMap((stage) => stage.skills);
const trackA = PLAN.stages.filter((stage) => stage.stage <= 2).flatMap((stage) => stage.skills);
const trackB = PLAN.stages.filter((stage) => stage.stage >= 3).flatMap((stage) => stage.skills);
const domainOf = (skill) => mathSection.domains.find((domain) => Object.keys(domain.skills).includes(skill)).name;

// A clock that moves an hour per answer, from 1 September 2026.
let clock = new Date(2026, 8, 1, 8).getTime();
let counter = 0;
function answer(skill, fields) {
  counter += 1;
  clock += HOUR;
  return Object.assign({
    id: `a${counter}`,
    questionId: `sat-math:t${counter % 4}-${skill.length}:s${counter}`,
    templateId: `t${counter % 4}-${skill.length}`,
    sectionKey: "sat-math",
    test: "SAT",
    domain: (fields && fields.domain) || domainOf(skill),
    skill,
    difficulty: "Medium",
    source: "template",
    correct: true,
    answered: true,
    hinted: false,
    timeMs: 60000,
    sessionId: "set",
    timestamp: clock,
  }, fields);
}
const answers = (count, skill, fields) => Array.from({ length: count }, () => answer(skill, fields));
// Thirty right Medium answers three hours apart (two days, several
// designs): the gate. The clock moves past them.
function gate(skill) {
  const list = answers(30, skill).map((attempt, index) => Object.assign(attempt, { timestamp: attempt.timestamp + index * 3 * HOUR }));
  clock = list[list.length - 1].timestamp;
  return list;
}

function state(attempts, options) {
  const rows = Analytics.skillMap(attempts, [mathSection]);
  return Analytics.planState(rows, Object.assign({ sectionKey: "sat-math", attempts, now: clock + HOUR }, options));
}

function step(attempts, options) {
  const rows = Analytics.skillMap(attempts, [mathSection]);
  return Analytics.nextStep(rows, Object.assign({ attempts, now: clock + HOUR }, options));
}

test("two tracks fly a skill each: Advanced Math starts on day one beside Algebra", () => {
  assert.deepEqual(Analytics.planTracks(PLAN).map((track) => [track.key, track.stages]), [["A", [1, 2]], ["B", [3, 4]]]);
  assert.deepEqual(Analytics.planTracks(PLAN).flatMap((track) => track.skills), planSkills, "every plan skill, once, in order");
  const fresh = state([]);
  assert.deepEqual(fresh.tracks.map((track) => track.inFlight), [trackA[0], trackB[0]]);
  assert.equal(domainOf(trackB[0]), "Advanced Math");
  assert.deepEqual([fresh.pass, fresh.firstPassLeft, fresh.started], [1, 19, []], "in flight, not yet started");
  // With no history, Track A leads; ReadingWriting and sections without a plan have none.
  assert.deepEqual([step([]).skill, step([]).track, step([]).trackName], [trackA[0], "A", "Track A"]);
  assert.equal(Analytics.planState(Analytics.skillMap([], [rwSection]), { sectionKey: rwSection.key }), null);
});

test("drill steps alternate tracks, the one drilled least recently first", () => {
  const sessions = [];
  const drill = (skill, id) => {
    sessions.push({ id, kind: "drill", sectionKey: "sat-math", finishedAt: clock + 1 });
    return answers(3, skill, { sessionId: id, difficulty: "Easy" });
  };
  const first = drill(trackA[0], "d1");
  // The last set was a drill, so the rotation would offer a mixed set
  // once two skills are started; take the drill alone here.
  const options = { sessions, plans: undefined };
  let next = step(first, Object.assign({}, options, { sessions: sessions.concat({ id: "m", kind: "mixed", sectionKey: "sat-math", finishedAt: clock + 2 }) }));
  assert.deepEqual([next.kind, next.skill, next.track], ["skill", trackB[0], "B"]);
  const second = first.concat(drill(trackB[0], "d2"));
  sessions.push({ id: "m2", kind: "mixed", sectionKey: "sat-math", finishedAt: clock + 3 });
  next = step(second, { sessions });
  assert.deepEqual([next.skill, next.track], [trackA[0], "A"]);
});

test("a skill leaves flight at the gate or after its budget of first answers at any tier, then moves on", () => {
  assert.deepEqual(Analytics.BUDGET, { answers: 40 });
  // Answers from before it was in flight spend nothing.
  const before = answers(6, trackA[1], { difficulty: "Easy", correct: false });
  let plan = state(before);
  assert.deepEqual([plan.tracks[0].inFlight, plan.skills[trackA[1]].spent], [trackA[0], 0]);
  // Every first answer in flight spends, Easy included: 39 is still in flight.
  const spending = before.concat(answers(20, trackA[0], { difficulty: "Easy", correct: false }),
    answers(10, trackA[0], { correct: false }), answers(9, trackA[0], { correct: false, difficulty: "Hard" }));
  plan = state(spending);
  assert.deepEqual([plan.tracks[0].inFlight, plan.skills[trackA[0]].spent], [trackA[0], 39]);
  // The fortieth moves it on; the next skill in Track A takes flight.
  const spent = spending.concat(answers(1, trackA[0], { correct: false }));
  plan = state(spent);
  const entry = plan.skills[trackA[0]];
  assert.deepEqual([entry.status, entry.leftBy, entry.movedOn, entry.started], ["moved-on", "budget", true, true]);
  assert.equal(plan.tracks[0].inFlight, trackA[1]);
  assert.equal(plan.skills[trackA[1]].spent, 0, "a fresh budget");
  assert.deepEqual(plan.departures.map((item) => [item.skill, item.by, item.pass]), [[trackA[0], "budget", 1]]);
  assert.deepEqual(plan.started, [trackA[0]], "a skill counts as started from its first answer in flight");
  assert.equal(entry.easyStuck, true, "it moved on before Easy was routine: flagged");
  // The gate: 30 Medium first answers, 24 right, over two days and designs.
  const atTarget = gate(trackA[1]);
  plan = state(spent.concat(atTarget));
  assert.deepEqual([plan.skills[trackA[1]].status, plan.skills[trackA[1]].leftBy, plan.tracks[0].inFlight],
    ["at-gate", "gate", trackA[2]]);
  // A skill already at the gate is passed by in the first pass.
  const elsewhere = gate(trackA[3]);
  plan = state(spent.concat(atTarget, elsewhere));
  assert.equal(plan.skills[trackA[3]].flown, false);
  assert.equal(plan.skills[trackA[3]].status, "at-gate");
  assert.equal(plan.skills[trackA[3]].started, true, "at the target counts as started");
});

test("a student stuck at Easy moves on after the budget, flagged, and the skill returns in the next pass", () => {
  // Forty Easy answers, never 8 of 10 right: the skill does not hold Track A.
  const stuck = answers(40, trackA[0], { difficulty: "Easy", correct: false });
  let plan = state(stuck);
  const entry = plan.skills[trackA[0]];
  assert.deepEqual([entry.status, entry.leftBy, entry.easyStuck], ["moved-on", "budget", true]);
  assert.equal(plan.tracks[0].inFlight, trackA[1]);
  // A skill that moved on after Easy became routine is not flagged.
  const routine = answers(10, trackA[0], { difficulty: "Easy" }).concat(answers(30, trackA[0], { correct: false }));
  assert.equal(state(routine).skills[trackA[0]].easyStuck, false);
  // When both tracks are through, it is back in flight in the second pass.
  const rest = trackA.slice(1).concat(trackB).flatMap((skill) => answers(40, skill, { correct: false }));
  plan = state(stuck.concat(rest));
  assert.deepEqual([plan.pass, plan.tracks[0].inFlight, plan.skills[trackA[0]].entry], [2, trackA[0], "moved-on"]);
  const next = step(stuck.concat(rest));
  assert.deepEqual([next.skill, next.level, next.pass], [trackA[0], "Easy", 2]);
});

test("the second pass brings moved-on skills back with a fresh budget once both tracks are through", () => {
  const moveOn = (skill) => answers(40, skill, { correct: false });
  // Every Track A skill moved on; Track B still flies: no second pass yet.
  const trackADone = trackA.flatMap(moveOn);
  let plan = state(trackADone);
  assert.deepEqual([plan.pass, plan.tracks[0].inFlight, plan.tracks[1].inFlight], [1, null, trackB[0]]);
  assert.equal(plan.firstPassLeft, trackB.length);
  const stepNow = step(trackADone);
  assert.deepEqual([stepNow.skill, stepNow.track], [trackB[0], "B"], "an empty track's turn goes to the other");
  // Both tracks through: pass 2, plan order, entry "moved-on", nothing spent.
  plan = state(trackADone.concat(trackB.flatMap(moveOn)));
  assert.equal(plan.pass, 2);
  assert.deepEqual(plan.tracks.map((track) => track.inFlight), [trackA[0], trackB[0]]);
  assert.deepEqual([plan.skills[trackA[0]].entry, plan.skills[trackA[0]].spent, plan.skills[trackA[0]].pass], ["moved-on", 0, 2]);
  assert.equal(plan.firstPassLeft, 0);
  const second = step(trackADone.concat(trackB.flatMap(moveOn)));
  assert.deepEqual([second.pass, second.returned, second.entry, second.budget], [2, true, "moved-on", { used: 0, size: 40 }]);
});

test("the diagnostic's placement passes over earlier stages in the first pass", () => {
  const placement = { stage: 3 };
  let plan = state([], { placement });
  assert.deepEqual(plan.tracks.map((track) => track.inFlight), [null, trackB[0]], "stages 1 and 2 are passed over");
  assert.equal(plan.skills[trackA[0]].status, "passed-over");
  assert.equal(plan.firstPassLeft, trackB.length);
  // A passed-over skill with MIN_ATTEMPTS answers comes back into flight.
  plan = state(answers(Analytics.MIN_ATTEMPTS, trackA[1], { difficulty: "Easy", correct: false }), { placement });
  assert.equal(plan.tracks[0].inFlight, trackA[1]);
});

test("Hard joins a drill once a skill is routine at Medium; drills stay Easy until routine at Easy", () => {
  assert.deepEqual(Analytics.MEDIUM_ROUTINE, { tier: "Medium", window: 10, correct: 6, days: 1, templates: 1 });
  assert.deepEqual(Analytics.drillMix("medium-routine", 10), { Medium: 7, Hard: 3 });
  assert.deepEqual(Analytics.drillMix("medium-routine", 20), { Medium: 14, Hard: 6 });
  assert.equal(Analytics.drillMix("routine", 10), null);
  const skill = trackA[0];
  let next = step(answers(5, skill, { difficulty: "Easy" }));
  assert.deepEqual([next.level, next.levelWhy, next.mix], ["Easy", "not-routine", undefined]);
  const routine = answers(10, skill, { difficulty: "Easy" });
  next = step(routine.concat(answers(5, skill, { correct: false }), answers(5, skill)));
  assert.deepEqual([next.level, next.levelWhy, next.mix], ["Medium", "routine", undefined], "5 of 10 at Medium");
  next = step(routine.concat(answers(4, skill, { correct: false }), answers(6, skill)));
  assert.deepEqual([next.level, next.levelWhy, next.mix], ["Medium", "medium-routine", { Medium: 7, Hard: 3 }]);
  // Reading and Writing keeps its levels: no Hard mixed in.
  const rw = Analytics.skillMap([...Array.from({ length: 10 }, () => answer("Inferences", { sectionKey: "sat-reading-writing",
    domain: "Information and Ideas", difficulty: "Easy" })), ...Array.from({ length: 10 }, () => answer("Inferences", {
    sectionKey: "sat-reading-writing", domain: "Information and Ideas" }))], [rwSection]);
  assert.equal(Analytics.skillLevel(rw.find((row) => row.skill === "Inferences")).why, "routine");
});

test("a skill that enters flight with few answers names its Learn page, by Practice's rule", () => {
  planSkills.forEach((skill) => {
    const row = { sectionKey: "sat-math", domain: domainOf(skill), skill };
    assert.equal(Analytics.learnPageOf(row), Practice.learnPageId("sat-math", row.domain, skill));
  });
  assert.equal(step([]).learnPage, Practice.learnPageId("sat-math", domainOf(trackA[0]), trackA[0]));
  // Entered with MIN_ATTEMPTS answers already (from a diagnostic or a mixed set): no lesson first.
  const before = answers(Analytics.MIN_ATTEMPTS, trackA[1], { difficulty: "Easy" });
  const moved = answers(40, trackA[0], { correct: false });
  const next = step(before.concat(moved));
  assert.deepEqual([next.skill, next.learnPage], [trackA[1], undefined]);
});

test("the rotation: a timed module, a mixed set after a drill, and one early Desmos drill", () => {
  const now = new Date(2026, 9, 1, 18).getTime();
  const set = (kind, daysAgo, extra) => Object.assign({ id: `${kind}${Math.random()}`, kind, sectionKey: "sat-math",
    finishedAt: now - daysAgo * DAY }, extra);
  const rows = (attempts) => Analytics.skillMap(attempts, [mathSection]);
  const run = (attempts, sessions, extra) => Analytics.nextStep(rows(attempts), Object.assign({ attempts, sessions, now }, extra));
  // One skill started, one drill done: not yet a mixed set (two started), but
  // early on, the Desmos drill when routes are loaded.
  const one = answers(5, trackA[0], { difficulty: "Easy" });
  assert.equal(run(one, [set("drill", 1)]).kind, "skill");
  assert.deepEqual([run(one, [set("drill", 1)], { desmos: true }).kind, run(one, [set("drill", 1)], { desmos: true }).count], ["desmos", 10]);
  assert.equal(run(one, [set("drill", 1), set("desmos", 0.5)], { desmos: true }).kind, "skill", "once only");
  assert.equal(run(one, [], { desmos: true }).kind, "skill", "never the first set");
  const fiveSets = ["drill", "mixed", "drill", "mixed", "drill"].map((kind, index) => set(kind, 5 - index));
  assert.notEqual(run(one, fiveSets, { desmos: true }).kind, "desmos", "not after the first five sets");
  // One started skill is not enough for a mixed set; two are.
  assert.equal(run(one, [set("drill", 1)]).kind, "skill");
  const two = one.concat(answers(3, trackB[0], { difficulty: "Easy" }));
  assert.deepEqual(state(two).started, [trackA[0], trackB[0]]);
  assert.deepEqual([run(two, [set("drill", 1)]).kind, run(two, [set("drill", 1)]).count], ["mixed", 12]);
  // Three started, or the diagnostic done: a timed module when none was taken.
  const three = two.concat(answers(40, trackA[0], { correct: false }), answers(2, trackA[1], { difficulty: "Easy" }));
  const module = run(three, [set("drill", 1)]);
  assert.deepEqual([module.kind, module.module, module.why], ["module", "1", "first"]);
  // A finished diagnostic alone does not open modules: it places the
  // student, and the first module waits for three started skills.
  assert.equal(run(two, [set("diagnostic", 2), set("drill", 1)], { placements: { "sat-math": { stage: 1 } } }).kind, "mixed");
  assert.equal(run(one, [set("diagnostic", 1)], { placements: { "sat-math": { stage: 1 } } }).kind, "skill",
    "right after the diagnostic: a drill, not a module");
  // Within a week of a module and fewer than four sets since: no module.
  assert.equal(run(three, [set("module", 2), set("drill", 1.5), set("mixed", 1), set("drill", 0.5)]).kind, "mixed");
  // Four sets since (Review and discarded sets do not count): a module.
  const four = [set("module", 2), set("drill", 1.9), set("mixed", 1.5), set("review", 1.4), set("discarded", 1.3),
    set("drill", 1), set("mixed", 0.5)];
  assert.deepEqual([run(three, four).kind, run(three, four).why, run(three, four).sinceModule], ["module", "sessions", 4]);
  // A week since the last module: a module.
  assert.deepEqual([run(three, [set("module", 8), set("drill", 1)]).kind, run(three, [set("module", 8), set("drill", 1)]).why],
    ["module", "days"]);
  // After anything but a drill, and no module due: the drill.
  assert.equal(run(three, [set("module", 2), set("mixed", 1)]).kind, "skill");
  // The mixed set: 12 questions over every started skill, weighted toward
  // skills in flight or moved on, at each skill's level.
  const spec = run(three, [set("module", 2), set("drill", 1)]).spec;
  assert.equal(spec.reduce((sum, entry) => sum + entry.Medium + entry.Hard, 0), 12);
  assert.deepEqual(spec.map((entry) => entry.skill).sort(), [trackA[0], trackA[1], trackB[0]].sort());
  assert.ok(spec.every((entry) => entry.Hard === 0), "no skill is routine at Medium or past its target yet");
});

test("a mixed set's seats follow the weights, and Hard joins skills routine at Medium or past the target", () => {
  const spec = Analytics.mixedSpec([
    { skill: "a", domain: "A", weight: 2, hardShare: 0 },
    { skill: "b", domain: "B", weight: 2, hardShare: 0.3 },
    { skill: "c", domain: "C", weight: 1, hardShare: 0.5 },
    { skill: "d", domain: "D", weight: 1, hardShare: 0.5 },
  ], 12, "seed");
  assert.deepEqual(spec, [
    { skill: "a", domain: "A", Medium: 4, Hard: 0 },
    { skill: "b", domain: "B", Medium: 3, Hard: 1 },
    { skill: "c", domain: "C", Medium: 1, Hard: 1 },
    { skill: "d", domain: "D", Medium: 1, Hard: 1 },
  ]);
  const many = Analytics.mixedSpec(Array.from({ length: 15 }, (_, index) => ({ skill: `s${index}`, weight: 1, hardShare: 0 })), 12, "x");
  assert.equal(many.length, 12, "more skills than seats: one each for twelve");
  assert.notDeepEqual(many.map((entry) => entry.skill),
    Analytics.mixedSpec(Array.from({ length: 15 }, (_, index) => ({ skill: `s${index}`, weight: 1, hardShare: 0 })), 12, "y")
      .map((entry) => entry.skill), "the odd seats move between sets");
  assert.deepEqual(Analytics.mixedSpec([], 12, "x"), []);
});

test("Review is the step at most once a calendar day; after that the plan moves on and names what is still due", () => {
  const now = new Date(2026, 9, 1, 18).getTime();
  const rows = Analytics.skillMap([], [mathSection]);
  const due = Analytics.nextStep(rows, { dueCount: 23, sessions: [], now, reviewedToday: false });
  assert.deepEqual([due.kind, due.dueCount, due.then.kind], ["review", 23, "skill"]);
  const review = (at, extra) => Object.assign({ id: `r${at}`, kind: "review", sectionKey: "sat-math", finishedAt: at }, extra);
  assert.equal(Analytics.reviewDoneToday([review(now - HOUR)], "SAT", now), true);
  assert.equal(Analytics.reviewDoneToday([review(now - DAY)], "SAT", now), false, "yesterday's does not count");
  assert.equal(Analytics.reviewDoneToday([{ id: "d", kind: "discarded", discardedKind: "review", sectionKey: "sat-math",
    finishedAt: now - HOUR }], "SAT", now), true, "a discarded Review set counts");
  assert.equal(Analytics.reviewDoneToday([{ id: "x", kind: "drill", sectionKey: "sat-math", finishedAt: now }], "SAT", now), false);
  assert.equal(Analytics.reviewDoneToday([review(now - HOUR)], "ACT", now), false, "each test has its own Review");
  assert.equal(Analytics.reviewDoneToday([review(now - HOUR, { sectionKey: "sat-reading-writing", sections: ["sat-reading-writing", "sat-math"] })],
    ["sat-math"], now), true);
  const after = Analytics.nextStep(rows, { dueCount: 23, sessions: [review(now - HOUR)], now,
    reviewedToday: Analytics.reviewDoneToday([review(now - HOUR)], "SAT", now) });
  assert.deepEqual([after.kind, after.reviewDue], ["skill", 23]);
  // Without the option, Review still comes first, as before.
  assert.equal(Analytics.nextStep(rows, { dueCount: 2 }).kind, "review");
});

test("official checks: a low one brings a skill back in the next pass; a high one confirms it", () => {
  const check = (skill, correct, fields) => Object.assign({ id: `c${skill}${correct}${counter}`, sectionKey: "sat-math", skill,
    difficulty: "Medium", attempted: 10, correct, date: "2026-09-02", at: clock + 1 }, fields);
  const target = gate(trackA[0]);
  let plan = state(target, { officialChecks: [check(trackA[0], 8)] });
  assert.deepEqual([plan.skills[trackA[0]].official, plan.skills[trackA[0]].status], ["confirmed", "at-gate"]);
  plan = state(target, { officialChecks: [check(trackA[0], 6)] });
  assert.equal(plan.skills[trackA[0]].official, null, "60-69% changes nothing");
  assert.equal(Analytics.officialStatus(check(trackA[0], 8), { state: "building" }), null, "confirmation needs the target met");
  const low = check(trackA[0], 4);
  plan = state(target, { officialChecks: [low] });
  assert.equal(plan.skills[trackA[0]].official, "low");
  assert.equal(plan.tracks[0].inFlight, trackA[1], "not back until the next pass");
  // Next pass: every other skill moved on; the low skill flies again, Hard-led, until its budget is spent.
  const rest = trackA.slice(1).concat(trackB).flatMap((skill) => answers(40, skill, { correct: false }));
  plan = state(target.concat(rest), { officialChecks: [low] });
  assert.equal(plan.pass, 2);
  assert.deepEqual([plan.tracks[0].inFlight, plan.skills[trackA[0]].entry], [trackA[0], "official-low"]);
  const next = step(target.concat(rest), { officialChecks: [low] });
  assert.deepEqual([next.skill, next.entry, next.official, next.level], [trackA[0], "official-low", "low", "Hard"]);
  // A newer check that is not low releases it.
  const better = check(trackA[0], 7, { date: "2026-12-01", at: clock + 2 * DAY });
  clock += 3 * DAY;
  plan = state(target.concat(rest), { officialChecks: [low, better] });
  assert.equal(plan.skills[trackA[0]].leftBy, "check");
  assert.notEqual(plan.tracks[0].inFlight, trackA[0]);
});

test("official check input is validated, and prompts list skills at target with no check", () => {
  const now = new Date(2026, 9, 16, 12).getTime();
  const ok = Analytics.cleanCheckInput({ sectionKey: "sat-math", skill: "Circles", difficulty: "Medium", correct: "7",
    attempted: "10", date: "2026-10-16" }, { now });
  assert.deepEqual(ok, { check: { sectionKey: "sat-math", skill: "Circles", difficulty: "Medium", attempted: 10, correct: 7,
    date: "2026-10-16" }, errors: [] });
  const errors = (fields) => Analytics.cleanCheckInput(Object.assign({ sectionKey: "sat-math", skill: "Circles", difficulty: "Medium",
    correct: 7, attempted: 10, date: "2026-10-16" }, fields), { now }).errors;
  assert.deepEqual(errors({ skill: "" }), ["skill"]);
  assert.deepEqual(errors({ sectionKey: "act-english" }), ["skill"]);
  assert.deepEqual(errors({ difficulty: "Easy" }), ["difficulty"]);
  assert.deepEqual(errors({ attempted: 0 }), ["attempted"]);
  assert.deepEqual(errors({ attempted: 51 }), ["attempted"]);
  assert.deepEqual(errors({ correct: 11 }), ["correct"]);
  assert.deepEqual(errors({ correct: "" }), ["correct"]);
  assert.deepEqual(errors({ correct: 2.5 }), ["correct"]);
  assert.deepEqual(errors({ date: "2026-10-17" }), ["date"], "not after today");
  assert.deepEqual(errors({ date: "2026-02-30" }), ["date"]);
  const rows = Analytics.skillMap(gate(trackA[2]), [mathSection]);
  assert.deepEqual(Analytics.checkPrompts(rows, []).map((row) => row.skill), [trackA[2]]);
  assert.deepEqual(Analytics.checkPrompts(rows, [{ id: "x", sectionKey: "sat-math", skill: trackA[2], difficulty: "Medium",
    attempted: 10, correct: 9, date: "2026-10-01" }]), []);
  assert.deepEqual(Analytics.checkPrompts(rows.map((row) => Object.assign({}, row, { tiered: false })), []), [],
    "no target where tiers are not verified");
});
