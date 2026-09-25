"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/lib/test-engine");

function question(id, overrides) {
  return Object.assign({
    id,
    test: "SAT",
    section: "Math",
    sectionKey: "sat-math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "solve",
    difficulty: "Medium",
    responseType: "multiple-choice",
    stimulus: null,
    stem: `Stem ${id}`,
    choices: ["1", "2", "3", "4"],
    correctAnswer: 2,
    hint: "Think.",
    explanation: "Because.",
    solutionSteps: ["Step."],
    distractorRationales: [
      { index: 0, reason: "a" },
      { index: 1, reason: "b" },
      { index: 3, reason: "d" },
    ],
  }, overrides || {});
}

const QUESTIONS = [
  question("q1", { difficulty: "Easy" }),
  question("q2", {
    responseType: "numeric",
    choices: null,
    correctAnswer: "0.75",
    distractorRationales: null,
    domain: "Advanced Math",
    difficulty: "Hard",
  }),
  question("q3", { correctAnswer: 0, domain: "Geometry and Trigonometry", difficulty: "Hard" }),
];

function clock(start) {
  let time = start === undefined ? 1_000_000 : start;
  const now = () => time;
  now.advance = (ms) => { time += ms; };
  return now;
}

test("navigation stays in range and records visits", () => {
  const session = engine.create({ questions: QUESTIONS, now: clock() });
  assert.equal(session.state.index, 0);
  session.back();
  assert.equal(session.state.index, 0);
  session.next();
  session.next();
  assert.equal(session.state.index, 2);
  assert.equal(session.isLast(), true);
  session.next();
  assert.equal(session.state.index, 2);
  session.goTo(1);
  assert.equal(session.state.index, 1);
  session.goTo(99);
  assert.equal(session.state.index, 2);
  session.goTo(-4);
  assert.equal(session.state.index, 0);
  assert.deepEqual(session.state.visited, [true, true, true]);
});

test("actions never mutate the previous state", () => {
  const start = engine.createState({ questions: QUESTIONS }, 0);
  const selected = engine.select(start, 1);
  assert.equal(start.responses[0], null);
  assert.equal(selected.responses[0], 1);
  const struck = engine.toggleEliminate(selected, 3);
  assert.deepEqual(selected.eliminated[0], []);
  assert.deepEqual(struck.eliminated[0], [3]);
});

test("selecting, clearing, and numeric responses", () => {
  const session = engine.create({ questions: QUESTIONS, now: clock() });
  session.select(3);
  assert.equal(session.state.responses[0], 3);
  session.select(9);
  assert.equal(session.state.responses[0], 3, "an out-of-range choice is ignored");
  session.clearResponse();
  assert.equal(session.state.responses[0], null);
  session.goTo(1);
  session.select("3/4");
  assert.equal(session.state.responses[1], "3/4");
  assert.equal(session.isCorrect(1), true);
  session.select("");
  assert.equal(session.state.responses[1], null);
});

test("eliminations strike, restore, and interact with the selection", () => {
  const session = engine.create({ questions: QUESTIONS, now: clock() });
  session.toggleEliminator();
  assert.equal(session.state.eliminatorOn, true);
  session.toggleEliminate(0);
  session.toggleEliminate(3);
  assert.deepEqual(session.state.eliminated[0], [0, 3]);
  session.toggleEliminate(0);
  assert.deepEqual(session.state.eliminated[0], [3]);

  // Choosing a struck option restores it.
  session.select(3);
  assert.equal(session.state.responses[0], 3);
  assert.deepEqual(session.state.eliminated[0], []);

  // Striking the chosen option clears the choice.
  session.toggleEliminate(3);
  assert.equal(session.state.responses[0], null);
  assert.deepEqual(session.state.eliminated[0], [3]);

  // Numeric questions have nothing to strike.
  session.goTo(1);
  session.toggleEliminate(0);
  assert.deepEqual(session.state.eliminated[1], []);
});

test("marks toggle per question and appear in counts", () => {
  const session = engine.create({ questions: QUESTIONS, now: clock() });
  session.toggleMark();
  session.toggleMark(2);
  assert.deepEqual(session.state.marked, [true, false, true]);
  session.toggleMark(0);
  assert.deepEqual(session.state.marked, [false, false, true]);
  session.select(1);
  assert.deepEqual(session.counts(), { total: 3, answered: 1, unanswered: 2, marked: 1 });
  assert.equal(session.itemStatus(2).marked, true);
  assert.equal(session.itemStatus(0).correct, null, "end mode reveals nothing before finish");
});

test("instant mode checks, locks, and reveals only checked answers", () => {
  const session = engine.create({ questions: QUESTIONS, feedback: "instant", now: clock() });
  session.check();
  assert.equal(session.state.checked[0], false, "cannot check without an answer");
  session.useHint();
  assert.equal(session.state.hinted[0], true);
  session.select(1);
  session.check();
  assert.equal(session.state.checked[0], true);
  assert.equal(session.isLocked(), true);
  assert.equal(session.itemStatus(0).correct, false);
  session.select(2);
  assert.equal(session.state.responses[0], 1, "a checked answer is locked");
  session.toggleEliminate(0);
  assert.deepEqual(session.state.eliminated[0], []);
  session.useHint(0);
  session.next();
  assert.equal(session.isLocked(), false);
  assert.equal(session.itemStatus(1).correct, null);
});

test("end mode ignores check and hint", () => {
  const session = engine.create({ questions: QUESTIONS, feedback: "end", now: clock() });
  session.select(2);
  session.check();
  session.useHint();
  assert.equal(session.state.checked[0], false);
  assert.equal(session.state.hinted[0], false);
  assert.equal(session.isLocked(), false);
});

test("the countdown alerts once at five minutes and finishes at zero", () => {
  const now = clock();
  const session = engine.create({ questions: QUESTIONS, timeLimitSeconds: 600, now });
  let reading = session.tick();
  assert.equal(reading.timed, true);
  assert.equal(reading.remainingSeconds, 600);
  assert.equal(reading.alertDue, false);

  now.advance(299_000);
  reading = session.tick();
  assert.equal(reading.remainingSeconds, 301);
  assert.equal(reading.alertDue, false);

  now.advance(1_000);
  reading = session.tick();
  assert.equal(reading.alertDue, true);
  assert.equal(session.state.alertShown, true);

  now.advance(1_000);
  reading = session.tick();
  assert.equal(reading.alertDue, false, "the alert fires only once");

  now.advance(298_999);
  reading = session.tick();
  assert.equal(reading.expired, false);
  assert.equal(reading.remainingSeconds, 1);

  now.advance(5_000);
  reading = session.tick();
  assert.equal(reading.expired, true);
  assert.equal(session.state.finished, true);
  assert.equal(session.state.finishReason, "time");
  assert.equal(session.summary().elapsedMs, 600_000, "no overtime is recorded");
  session.select(1);
  assert.equal(session.state.responses[0], null, "a finished session is locked");
});

test("short limits never warn at the start, and untimed sets count up", () => {
  const now = clock();
  const short = engine.create({ questions: QUESTIONS, timeLimitSeconds: 240, now });
  assert.equal(short.tick().alertDue, false);
  now.advance(10_000);
  assert.equal(short.tick().alertDue, false);

  const untimed = engine.create({ questions: QUESTIONS, timeLimitSeconds: null, now });
  now.advance(90_500);
  const reading = untimed.tick();
  assert.equal(reading.timed, false);
  assert.equal(reading.remainingMs, null);
  assert.equal(reading.elapsedSeconds, 90);
  assert.equal(reading.expired, false);
  assert.equal(untimed.state.finished, false);
});

test("finish freezes the clock and the summary scores every item", () => {
  const now = clock();
  const session = engine.create({ questions: QUESTIONS, timeLimitSeconds: 600, now });
  session.select(2);
  session.goTo(1);
  session.select(".75");
  session.toggleMark();
  now.advance(120_000);
  session.finish();
  now.advance(60_000);
  const summary = session.summary();
  assert.equal(summary.elapsedMs, 120_000);
  assert.equal(summary.finishReason, "user");
  assert.equal(summary.correct, 2);
  assert.equal(summary.total, 3);
  assert.equal(summary.unanswered, 1);
  assert.equal(summary.marked, 1);
  assert.equal(summary.paceBudgetSeconds, 286);
  assert.deepEqual(summary.items.map((item) => item.correct), [true, true, false]);
  assert.equal(summary.byDomain[0].domain, "Geometry and Trigonometry", "weakest first");
  assert.deepEqual(summary.byDifficulty.map((row) => row.difficulty), ["Easy", "Hard"]);
  assert.equal(summary.byDifficulty[1].correct, 1);

  const result = session.result();
  assert.deepEqual(Object.keys(result.items[0]).sort(),
    ["answered", "checked", "correct", "hinted", "index", "marked", "question", "response", "timeMs"]);
  assert.equal(result.items[1].marked, true);
  assert.equal(result.feedback, "end");
  assert.equal(result.timeLimitSeconds, 600);
});

test("repeated question ids are scored by position", () => {
  const twin = [question("same", { correctAnswer: 0 }), question("same", { correctAnswer: 1 })];
  const session = engine.create({ questions: twin, now: clock() });
  session.select(0);
  session.next();
  session.select(1);
  session.finish();
  assert.equal(session.summary().correct, 2);
});

test("serialize and restore round-trip; a paused timed set skips closed time", () => {
  const now = clock();
  const session = engine.create({ questions: QUESTIONS, feedback: "instant", timeLimitSeconds: 600, now });
  session.select(2);
  session.check();
  session.toggleEliminator();
  session.goTo(2);
  session.toggleEliminate(1);
  session.toggleMark();
  now.advance(250_000);
  const snapshot = session.serialize({ paused: true }); // Save and exit
  const json = JSON.parse(JSON.stringify(snapshot));
  assert.deepEqual(json, snapshot, "the snapshot is JSON-safe");
  assert.equal(snapshot.elapsedMs, 250_000);
  assert.equal(snapshot.segmentStart, null);
  assert.equal(snapshot.paused, true);

  now.advance(3_600_000); // the set was put away for an hour
  const restored = engine.restore(json, { now });
  assert.equal(restored.state.index, 2);
  assert.deepEqual(restored.state.responses, [2, null, null]);
  assert.deepEqual(restored.state.checked, [true, false, false]);
  assert.deepEqual(restored.state.eliminated, [[], [], [1]]);
  assert.deepEqual(restored.state.marked, [false, false, true]);
  assert.equal(restored.state.eliminatorOn, true);
  assert.equal(restored.state.feedback, "instant");
  assert.equal(restored.timer().remainingSeconds, 350);
  now.advance(10_000);
  assert.equal(restored.timer().remainingSeconds, 340);
  assert.deepEqual(restored.state.questions, QUESTIONS);
});

test("a timed set keeps wall time across a reload; an untimed set does not", () => {
  const now = clock();
  const timed = engine.create({ questions: QUESTIONS, timeLimitSeconds: 600, now });
  now.advance(100_000);
  const snapshot = timed.serialize(); // saved as the page unloads
  now.advance(30_000); // reloading
  const restored = engine.restore(snapshot, { now });
  assert.equal(restored.timer().remainingSeconds, 470);
  now.advance(1_000);
  assert.equal(restored.timer().remainingSeconds, 469);

  now.advance(3_600_000); // closed for an hour: the section has ended
  const late = engine.restore(restored.serialize(), { now: () => now() + 60_000 });
  const reading = late.tick();
  assert.equal(reading.expired, true);
  assert.equal(late.state.finished, true);
  assert.equal(late.state.finishReason, "time");

  const untimed = engine.create({ questions: QUESTIONS, now });
  now.advance(20_000);
  const saved = untimed.serialize();
  now.advance(600_000);
  assert.equal(engine.restore(saved, { now }).timer().elapsedMs, 20_000);
});

test("each question gathers time only while it is on screen", () => {
  const now = clock();
  const session = engine.create({ questions: QUESTIONS, feedback: "instant", now });
  now.advance(5_000);
  session.select(2);
  now.advance(1_000);
  session.check(); // six seconds to answer
  now.advance(30_000); // reading the explanation does not count
  session.next();
  now.advance(7_000);
  session.leaveQuestion(); // the review page
  now.advance(50_000);
  session.enterQuestion();
  now.advance(3_000);
  assert.deepEqual(session.questionTimes(), [6_000, 10_000, 0]);

  const snapshot = session.serialize();
  now.advance(100_000); // closed time never counts toward a question
  const restored = engine.restore(snapshot, { now });
  now.advance(2_000);
  restored.goTo(2);
  now.advance(4_000);
  restored.finish();
  now.advance(9_000);
  const items = restored.result().items;
  assert.deepEqual(items.map((item) => item.timeMs), [6_000, 12_000, 4_000]);
  assert.deepEqual(items.map((item) => item.index), [0, 1, 2]);
  assert.equal(items[0].checked, true);
});

test("questions already marked start marked", () => {
  const session = engine.create({ questions: QUESTIONS, marked: [false, true, false], now: clock() });
  assert.deepEqual(session.state.marked, [false, true, false]);
  assert.equal(session.counts().marked, 1);
  const ignored = engine.create({ questions: QUESTIONS, marked: [true], now: clock() });
  assert.deepEqual(ignored.state.marked, [false, false, false]);
});

test("a set that mixes sections is paced question by question", () => {
  const mixed = [
    question("rw", { sectionKey: "sat-reading-writing" }),
    question("m1"),
    question("m2"),
  ];
  const summary = engine.create({ questions: mixed, now: clock() }).summary();
  assert.equal(summary.paceBudgetSeconds, Math.round((32 * 60) / 27 + 2 * (35 * 60) / 22));
});

test("restore rejects foreign or empty snapshots", () => {
  assert.equal(engine.restore(null), null);
  assert.equal(engine.restore({ schema: "other" }), null);
  assert.equal(engine.restore({ schema: engine.SCHEMA, version: engine.VERSION, questions: [] }), null);
  const partial = engine.restore({
    schema: engine.SCHEMA,
    version: engine.VERSION,
    questions: QUESTIONS,
    index: 7,
    responses: [1],
  }, { now: clock() });
  assert.equal(partial.state.index, 2);
  assert.deepEqual(partial.state.responses, [null, null, null]);
});

test("a finished snapshot restores finished with its frozen time", () => {
  const now = clock();
  const session = engine.create({ questions: QUESTIONS, timeLimitSeconds: 600, now });
  now.advance(42_000);
  session.finish();
  session.markReported();
  const restored = engine.restore(session.serialize(), { now });
  now.advance(100_000);
  assert.equal(restored.state.finished, true);
  assert.equal(restored.state.reported, true);
  assert.equal(restored.summary().elapsedMs, 42_000);
});

test("numeric entry keeps five characters, six with a negative sign", () => {
  assert.deepEqual(engine.sanitizeNumericEntry("123456").value, "12345");
  assert.deepEqual(engine.sanitizeNumericEntry("-123456").value, "-12345");
  assert.equal(engine.sanitizeNumericEntry("−3/4").value, "-3/4");
  assert.equal(engine.sanitizeNumericEntry("$1,200").value, "1200");
  assert.equal(engine.sanitizeNumericEntry("45%").value, "45");
  assert.equal(engine.sanitizeNumericEntry("1.2.3").value, "1.23");
  assert.equal(engine.sanitizeNumericEntry("1/2/3").value, "1/23");
  assert.equal(engine.sanitizeNumericEntry("4-5").value, "45");
  assert.equal(engine.sanitizeNumericEntry("/5").value, "5");
  assert.equal(engine.sanitizeNumericEntry("3.5").changed, false);
  assert.equal(engine.sanitizeNumericEntry("3 1/2").changed, true);
});

test("numeric entry description drives the answer preview", () => {
  assert.equal(engine.describeNumericEntry("").kind, "empty");
  assert.equal(engine.describeNumericEntry("-").kind, "incomplete");
  assert.equal(engine.describeNumericEntry("3/").kind, "incomplete");
  const fraction = engine.describeNumericEntry("-7/2");
  assert.equal(fraction.kind, "fraction");
  assert.equal(fraction.value, -3.5);
  assert.equal(fraction.numerator, "7");
  assert.equal(fraction.denominator, "2");
  assert.equal(engine.describeNumericEntry("1/0").kind, "invalid");
  assert.equal(engine.describeNumericEntry(".5").value, 0.5);
  assert.equal(engine.describeNumericEntry("12.").kind, "number");
});

test("create refuses an empty question list", () => {
  assert.throws(() => engine.create({ questions: [] }), /at least one question/);
});

test("finished parts combine into one reported session for one report and one review", () => {
  const rw = question("r1", { sectionKey: "sat-reading-writing", domain: "Craft and Structure", correctAnswer: 1 });
  const state = engine.combineFinished([
    { questions: [rw], responses: [1], marked: [true], hinted: [false], timeMs: [5000], elapsedMs: 60_000, timeLimitSeconds: 1920 },
    { questions: [], responses: [] },
    { questions: QUESTIONS, responses: [2, "3/4", null], timeMs: [1, 2, 3], elapsedMs: 90_000, timeLimitSeconds: 2100 },
  ], 5_000);
  assert.equal(state.finished, true);
  assert.equal(state.reported, true, "each part was recorded when it ended");
  assert.equal(state.timeLimitSeconds, 1920 + 2100);
  const summary = engine.summary(state, 99_999_999);
  assert.equal(summary.total, 4);
  assert.equal(summary.correct, 3);
  assert.equal(summary.unanswered, 1);
  assert.equal(summary.marked, 1);
  assert.equal(summary.elapsedMs, 150_000, "the parts' time, not the wall clock");
  assert.deepEqual(summary.items.map((item) => item.timeMs), [5000, 1, 2, 3]);
  // It survives the shell's snapshot round trip as a finished report.
  const restored = engine.restoreState(engine.serialize(state, 5_000), 10_000_000);
  assert.equal(restored.finished, true);
  assert.equal(restored.reported, true);
  assert.equal(engine.summary(restored, 10_000_000).elapsedMs, 150_000);
  // An untimed part leaves the whole untimed.
  assert.equal(engine.combineFinished([{ questions: [rw], responses: [0] }], 1).timeLimitSeconds, null);
  assert.throws(() => engine.combineFinished([], 1), /at least one question/);
});
