"use strict";

// Due dates are local calendar days, so these tests pin a time zone with
// daylight saving. node --test runs each file in its own process.
process.env.TZ = "America/New_York";

const test = require("node:test");
const assert = require("node:assert/strict");
const Queue = require("../src/lib/review-queue");

// A local wall-clock time in the pinned zone ("2026-03-07T23:30").
const at = (local) => new Date(local).getTime();
const key = (day) => Queue.dayKey(day);

let counter = 0;
function answer(questionId, local, extra) {
  counter += 1;
  return Object.assign({
    id: `a${counter}`,
    questionId,
    sectionKey: "sat-math",
    test: "SAT",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "slope",
    difficulty: "Medium",
    source: "template",
    templateId: questionId.split(":")[1],
    correct: true,
    answered: true,
    hinted: false,
    timestamp: at(local),
  }, extra || {});
}
const miss = (questionId, local, extra) => answer(questionId, local, Object.assign({ correct: false }, extra));

const Q = "sat-math:slope-t:s1.slope-t.0";
const FRESH_1 = "sat-math:slope-t:f1.slope-t.0";
const FRESH_2 = "sat-math:slope-t:f2.slope-t.2";

test("a miss is due the next local day and comes back as the same question", () => {
  const entry = Queue.build([miss(Q, "2026-09-20T21:00")]).get(Q);
  assert.equal(entry.stage, 1);
  assert.equal(key(entry.dueDay), "2026-09-21");
  assert.equal(entry.exactId, Q);
  assert.equal(Queue.modeOf(entry), "exact");
  assert.equal(entry.misses, 1);
  assert.equal(Queue.isDue(entry, Queue.dayOf(at("2026-09-20T23:59"))), false);
  assert.equal(Queue.isDue(entry, Queue.dayOf(at("2026-09-21T00:00"))), true);
});

test("correct answers step through 3, 7 and 21 days, then graduate; later stages draw fresh versions", () => {
  const attempts = [miss(Q, "2026-09-01T10:00")];
  const steps = [];
  const record = () => {
    const entry = Queue.build(attempts).get(Q);
    steps.push([entry.stage, entry.learned ? "learned" : key(entry.dueDay), Queue.modeOf(entry)]);
    return entry;
  };
  record();
  attempts.push(answer(Q, "2026-09-02T08:00", { reviewOf: Q }));
  record();
  attempts.push(answer(FRESH_1, "2026-09-05T19:00", { reviewOf: Q }));
  record();
  attempts.push(answer(FRESH_2, "2026-09-12T19:00", { reviewOf: Q }));
  record();
  attempts.push(answer("sat-math:slope-t:f3.slope-t.0", "2026-10-03T09:00", { reviewOf: Q }));
  const entry = record();
  assert.deepEqual(steps, [
    [1, "2026-09-02", "exact"],
    [2, "2026-09-05", "fresh"],
    [3, "2026-09-12", "fresh"],
    [4, "2026-10-03", "fresh"],
    [4, "learned", "fresh"],
  ]);
  assert.equal(entry.learned, true);
  assert.equal(entry.steps, 4);
  const summary = Queue.summarize(Queue.build(attempts), at("2026-12-01T12:00"));
  assert.equal(summary.learned.length, 1);
  assert.equal(summary.due.length + summary.upcoming.length, 0);
});

test("a wrong answer at any stage resets to one day and re-serves what was missed", () => {
  const attempts = [
    miss(Q, "2026-09-01T10:00"),
    answer(Q, "2026-09-02T10:00", { reviewOf: Q }),
    answer(FRESH_1, "2026-09-05T10:00", { reviewOf: Q }),
    miss(FRESH_2, "2026-09-12T10:00", { reviewOf: Q }),
  ];
  const entries = Queue.build(attempts);
  assert.equal(entries.size, 1, "a fresh version belongs to the original miss");
  const entry = entries.get(Q);
  assert.equal(entry.stage, 1);
  assert.equal(key(entry.dueDay), "2026-09-13");
  assert.equal(entry.exactId, FRESH_2, "stage 1 re-serves the version just missed");
  assert.equal(entry.misses, 2);
  assert.equal(Queue.modeOf(entry), "exact");
});

test("a correct answer before the due day changes nothing; a hinted one restarts", () => {
  const early = Queue.build([
    miss(Q, "2026-09-01T10:00"),
    answer(Q, "2026-09-01T10:05"),
  ]).get(Q);
  assert.equal(early.stage, 1);
  assert.equal(key(early.dueDay), "2026-09-02");
  const stepped = [miss(Q, "2026-09-01T10:00"), answer(Q, "2026-09-02T10:00")];
  assert.equal(Queue.build(stepped).get(Q).stage, 2);
  const hinted = Queue.build(stepped.concat(answer(FRESH_1, "2026-09-05T10:00", { reviewOf: Q, hinted: true })))
    .get(Q);
  assert.equal(hinted.stage, 1);
  assert.equal(key(hinted.dueDay), "2026-09-06");
  assert.equal(hinted.exactId, FRESH_1);
});

test("answers from any set count, and a learned question re-enters when missed again", () => {
  // The same question answered correctly in an ordinary set (no reviewOf).
  const attempts = [miss(Q, "2026-09-01T10:00"), answer(Q, "2026-09-03T10:00", { sessionId: "practice-set" })];
  assert.equal(Queue.build(attempts).get(Q).stage, 2);
  attempts.push(
    answer(FRESH_1, "2026-09-06T10:00", { reviewOf: Q }),
    answer(FRESH_2, "2026-09-13T10:00", { reviewOf: Q }),
    answer("sat-math:slope-t:f3.slope-t.0", "2026-10-04T10:00", { reviewOf: Q }),
  );
  assert.equal(Queue.build(attempts).get(Q).learned, true);
  attempts.push(miss(Q, "2026-11-20T10:00"));
  const entry = Queue.build(attempts).get(Q);
  assert.equal(entry.learned, false);
  assert.equal(entry.stage, 1);
  assert.equal(key(entry.dueDay), "2026-11-21");
});

test("only misses start a schedule; retired SAT banks and essays are left out", () => {
  const entries = Queue.build([
    answer("sat-math:other:1", "2026-09-01T10:00"),
    answer("sat-math:other:2", "2026-09-01T10:00", { hinted: true }),
    miss("sat-math-0101", "2026-09-01T10:00", { source: "legacy-bank", templateId: undefined }),
    answer("act-writing-0002", "2026-09-01T10:00", { correct: null, source: "bank", sectionKey: "act-writing" }),
    miss("act-english-0007", "2026-09-01T10:00", { source: "bank", sectionKey: "act-english", test: "ACT",
      templateId: undefined }),
    miss("sat-math:blank-t:1", "2026-09-01T10:00", { answered: false, response: null }),
  ]);
  assert.deepEqual([...entries.keys()].sort(), ["act-english-0007", "sat-math:blank-t:1"]);
  const bank = entries.get("act-english-0007");
  bank.stage = 3;
  assert.equal(Queue.modeOf(bank), "exact", "bank questions always come back as they were");
});

test("attempts in any order build the same schedule", () => {
  const attempts = [
    miss(Q, "2026-09-01T10:00"),
    answer(Q, "2026-09-02T10:00"),
    answer(FRESH_1, "2026-09-06T10:00", { reviewOf: Q }),
    miss(FRESH_2, "2026-09-14T10:00", { reviewOf: Q }),
    answer(FRESH_2, "2026-09-15T10:00", { reviewOf: Q }),
  ];
  const forward = Queue.build(attempts).get(Q);
  const shuffled = Queue.build([attempts[3], attempts[0], attempts[4], attempts[2], attempts[1]]).get(Q);
  assert.deepEqual(shuffled, forward);
  assert.deepEqual([forward.stage, key(forward.dueDay), forward.misses, forward.steps], [2, "2026-09-18", 2, 3]);
});

test("due days are calendar days across daylight-saving changes", () => {
  // US clocks spring forward on 2026-03-08 and fall back on 2026-11-01.
  const spring = Queue.build([
    miss(Q, "2026-03-07T23:30"),
    answer(Q, "2026-03-08T00:15"),
  ]).get(Q);
  assert.equal(spring.stage, 2, "a 23-hour day still starts at local midnight");
  assert.equal(key(spring.dueDay), "2026-03-11");
  assert.equal(new Date(Queue.startOfDay(spring.dueDay)).getHours(), 0);

  const fall = [
    miss(Q, "2026-10-01T09:00"),
    answer(Q, "2026-10-02T23:59"),
    answer(FRESH_1, "2026-10-05T00:00", { reviewOf: Q }),
    answer(FRESH_2, "2026-10-12T22:00", { reviewOf: Q }),
  ];
  const entry = Queue.build(fall).get(Q);
  assert.equal(entry.stage, 4);
  assert.equal(key(entry.dueDay), "2026-11-02", "21 days that include a 25-hour day");
  const before = Queue.summarize(Queue.build(fall), at("2026-11-01T23:59"));
  const after = Queue.summarize(Queue.build(fall), at("2026-11-02T00:00"));
  assert.deepEqual([before.due.length, after.due.length], [0, 1]);
  assert.equal(key(before.nextDue.day), "2026-11-02");

  // Local midnight at the start of the 25-hour day is still that day.
  const onFallDay = Queue.build([miss(Q, "2026-10-31T23:59"), answer(Q, "2026-11-01T00:00")]).get(Q);
  assert.equal(key(onFallDay.dueDay), "2026-11-04");
});

test("the southern hemisphere's daylight-saving change keeps calendar days too", () => {
  const saved = process.env.TZ;
  process.env.TZ = "Australia/Sydney";
  try {
    // Sydney springs forward at 02:00 on 2026-10-04.
    const entry = Queue.build([miss(Q, "2026-10-03T22:00"), answer(Q, "2026-10-04T03:30")]).get(Q);
    assert.equal(key(Queue.dayOf(at("2026-10-04T03:30"))), "2026-10-04");
    assert.equal(entry.stage, 2);
    assert.equal(key(entry.dueDay), "2026-10-07");
  } finally {
    process.env.TZ = saved;
  }
});

test("the summary lists what is due, what is next, and what cannot be built", () => {
  const entries = Queue.build([
    miss("sat-math:a:1", "2026-09-10T09:00", { templateId: "a" }),
    miss("sat-math:b:1", "2026-09-12T09:00", { templateId: "b" }),
    miss("sat-math:c:1", "2026-09-20T09:00", { templateId: "c" }),
    miss("sat-math:d:1", "2026-09-20T18:00", { templateId: "d" }),
    miss("sat-math:gone:1", "2026-09-01T09:00", { templateId: "gone" }),
  ]);
  const summary = Queue.summarize(entries, at("2026-09-15T12:00"), {
    skip: (entry) => entry.templateId === "gone",
  });
  assert.deepEqual(summary.due.map((entry) => entry.questionId), ["sat-math:a:1", "sat-math:b:1"],
    "most overdue first");
  assert.deepEqual(summary.upcoming.map((entry) => entry.questionId), ["sat-math:c:1", "sat-math:d:1"]);
  assert.deepEqual(summary.unavailable.map((entry) => entry.questionId), ["sat-math:gone:1"]);
  assert.equal(key(summary.nextDue.day), "2026-09-21");
  assert.equal(summary.nextDue.count, 2);
  assert.equal(key(summary.today), "2026-09-15");
  assert.equal(Queue.summarize(new Map(), at("2026-09-15T12:00")).nextDue, null);
});

test("a review set takes the most overdue items, one per template", () => {
  const due = [
    { questionId: "sat-math:t1:1", sectionKey: "sat-math", templateId: "t1" },
    { questionId: "sat-math:t1:2", sectionKey: "sat-math", templateId: "t1" },
    { questionId: "sat-reading-writing:t1:1", sectionKey: "sat-reading-writing", templateId: "t1" },
    { questionId: "act-english-0001", sectionKey: "act-english", templateId: null },
    { questionId: "act-english-0002", sectionKey: "act-english", templateId: null },
  ];
  const { picked, left } = Queue.pickSet(due, { limit: 3 });
  assert.deepEqual(picked.map((entry) => entry.questionId),
    ["sat-math:t1:1", "sat-reading-writing:t1:1", "act-english-0001"]);
  assert.deepEqual(left.map((entry) => entry.questionId), ["sat-math:t1:2", "act-english-0002"]);
  assert.equal(Queue.pickSet(due).picked.length, 4);
});

test("the error log filters misses and counts their reasons", () => {
  const attempts = [
    miss("sat-math:a:1", "2026-09-01T09:00", { id: "m1" }),
    answer("sat-math:a:1", "2026-09-02T09:00", { id: "r1" }),
    miss("sat-math:b:1", "2026-09-03T09:00", { id: "m2", skill: "Circles", domain: "Geometry and Trigonometry" }),
    miss("sat-reading-writing:c:1", "2026-09-04T09:00", { id: "m3", sectionKey: "sat-reading-writing",
      skill: "Transitions", answered: false }),
    miss("sat-math:d:1", "2026-09-05T09:00", { id: "m4" }),
    answer("act-writing-0002", "2026-09-01T10:00", { id: "e1", correct: null }),
  ];
  const errorLog = {
    m1: { reason: "content", at: 1 },
    m2: { reason: "careless", rule: "Reread the stem", at: 2 },
    m4: { reason: "misread", at: 3 },
  };
  const missed = Queue.missedAttempts(attempts);
  assert.deepEqual(missed.map((attempt) => attempt.id), ["m4", "m3", "m2", "m1"], "newest first");
  assert.deepEqual(Queue.reasonCounts(missed, errorLog),
    { total: 4, untagged: 2, content: 1, process: 0, careless: 1, time: 0 });
  const ids = (filter) => Queue.filterMissed(missed, errorLog, filter).map((attempt) => attempt.id);
  assert.deepEqual(ids({ reason: "untagged" }), ["m4", "m3"], "an unknown reason counts as untagged");
  assert.deepEqual(ids({ reason: "careless" }), ["m2"]);
  assert.deepEqual(ids({ sectionKey: "sat-math" }), ["m4", "m2", "m1"]);
  assert.deepEqual(ids({ skill: "Linear functions", reason: "all" }), ["m4", "m1"]);
  assert.equal(Queue.reasonOf(errorLog, missed[0]), null);
});

test("a skill's Learn page is suggested when content errors dominate its tagged misses", () => {
  const attempts = [
    miss("sat-math:a:1", "2026-09-01T09:00", { id: "x1" }),
    miss("sat-math:a:2", "2026-09-01T09:00", { id: "x2" }),
    miss("sat-math:a:3", "2026-09-01T09:00", { id: "x3" }),
    miss("sat-math:a:4", "2026-09-01T09:00", { id: "x4" }),
    miss("sat-math:b:1", "2026-09-01T09:00", { id: "y1", skill: "Circles" }),
    miss("sat-math:b:2", "2026-09-01T09:00", { id: "y2", skill: "Circles" }),
    miss("sat-math:b:3", "2026-09-01T09:00", { id: "y3", skill: "Circles" }),
    miss("sat-math:b:4", "2026-09-01T09:00", { id: "y4", skill: "Circles" }),
    miss("sat-math:c:1", "2026-09-01T09:00", { id: "z1", skill: "Percentages" }),
  ];
  const errorLog = {
    // Linear functions: 2 content of 3 tagged (one untagged) -> suggested.
    x1: { reason: "content" }, x2: { reason: "content" }, x3: { reason: "careless" },
    // Circles: 2 content of 4 tagged is not more than half.
    y1: { reason: "content" }, y2: { reason: "content" }, y3: { reason: "process" }, y4: { reason: "time" },
    // Percentages: one content error is not a pattern.
    z1: { reason: "content" },
  };
  const gaps = Queue.contentGaps(Queue.missedAttempts(attempts), errorLog);
  assert.deepEqual(gaps.map((row) => [row.skill, row.content, row.tagged, row.total]),
    [["Linear functions", 2, 3, 4]]);
  assert.equal(gaps[0].sectionKey, "sat-math");
  assert.equal(gaps[0].domain, "Algebra");
});
