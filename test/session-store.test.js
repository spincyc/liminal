"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Store = require("../src/lib/session-store");
const Engine = require("../src/lib/test-engine");
const Progress = require("../src/lib/progress");

function memory() {
  const data = new Map();
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

// A generated SAT question, so the accuracy model counts it (retired SAT
// bank ids are left out).
function question(id, overrides) {
  return Object.assign({
    id: `sat-math:t-${id}:1`,
    templateId: `t-${id}`,
    test: "SAT",
    section: "Math",
    sectionKey: "sat-math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Medium",
    responseType: "multiple-choice",
    stem: `Stem ${id}`,
    choices: ["1", "2", "3", "4"],
    correctAnswer: 2,
  }, overrides || {});
}

// A saved set as app.js writes it: the launch config and the test
// screen's snapshot around the engine's.
function savedSet(session, sessionId, savedAt, paused) {
  return {
    config: { title: "SAT Math: drill", kind: "drill", sessionId, feedback: session.state.feedback, sectionKey: "sat-math" },
    savedAt,
    state: { schema: "liminal-test-shell", version: 1, session: session.serialize({ paused: Boolean(paused) }) },
  };
}

function savedTest(id, moduleState) {
  return {
    config: { title: "Full-length SAT", kind: "module", sessionId: "s-module", simulation: { id, kind: "full" } },
    savedAt: 5,
    state: moduleState || null,
  };
}

test("a set and a test keep their own slots, so neither replaces the other", () => {
  const storage = memory();
  const slots = Store.create(storage);
  const set = { config: { sessionId: "s1", title: "Drill" }, savedAt: 1, state: { any: true } };
  const full = savedTest("t1");
  assert.equal(slots.store("test", full, "t1"), "saved");
  assert.equal(slots.store("set", set, "s1"), "saved");
  assert.deepEqual(slots.all(), { set, test: full });
  assert.equal(storage.getItem(Store.KEYS.set), JSON.stringify(set));
  assert.equal(storage.getItem(Store.KEYS.test), JSON.stringify(full));
  assert.equal(Store.slotOf(full), "test");
  assert.equal(Store.slotOf(set), "set");
  slots.clear("set");
  assert.deepEqual(slots.all(), { set: null, test: full }, "finishing the set leaves the test");
  assert.throws(() => slots.store("other", set, "s1"), RangeError);
});

test("a slot is written only by its owner, so another tab's newer set is not overwritten", () => {
  const slots = Store.create(memory());
  const mine = { config: { sessionId: "a", title: "A" }, state: { n: 1 } };
  const theirs = { config: { sessionId: "b", title: "B" }, state: { n: 2 } };
  assert.equal(slots.store("set", mine, "a"), "saved");
  assert.equal(slots.store("set", { ...mine, savedAt: 2 }, "a"), "saved", "the owner saves again");
  assert.equal(slots.store("set", theirs, "b"), "taken");
  assert.equal(slots.load("set").config.sessionId, "a");
  assert.equal(slots.clear("set", "b"), false, "another owner cannot clear it");
  assert.equal(slots.clear("set", "a"), true);
  assert.equal(slots.store("set", theirs, "b"), "saved", "an empty slot takes any owner");
  // A test's owner is its id, the same for every module.
  assert.equal(Store.ownerOf(savedTest("t9")), "t9");
  assert.equal(Store.ownerOf(mine), "a");
});

test("a failed write is reported, not thrown", () => {
  const storage = memory();
  storage.setItem = () => { throw new Error("QuotaExceededError"); };
  const heard = [];
  const slots = Store.create(storage, { onError: (error, slot) => heard.push([slot, error.message]) });
  assert.equal(slots.store("set", { config: { sessionId: "x" }, state: {} }, "x"), "failed");
  assert.deepEqual(heard, [["set", "QuotaExceededError"]]);
});

test("a test saved in the old shared slot moves to its own", () => {
  const storage = memory();
  const old = savedTest("t-old");
  storage.setItem(Store.KEYS.set, JSON.stringify(old));
  const slots = Store.create(storage);
  assert.equal(slots.migrate(), true);
  assert.deepEqual(slots.all(), { set: null, test: old });
  assert.equal(slots.migrate(), false, "nothing more to move");
  // A set in the old slot stays where it is.
  const set = { config: { sessionId: "s" }, state: { n: 1 } };
  storage.setItem(Store.KEYS.set, JSON.stringify(set));
  assert.equal(slots.migrate(), false);
  assert.deepEqual(slots.load("set"), set);
});

test("unreadable values are treated as empty", () => {
  const storage = memory();
  storage.setItem(Store.KEYS.set, "{not json");
  storage.setItem(Store.KEYS.test, JSON.stringify({ config: { title: "no state" } }));
  const slots = Store.create(storage);
  assert.deepEqual(slots.all(), { set: null, test: null });
  assert.equal(Store.parse(JSON.stringify([1, 2])), null);
});

test("a saved set's summary and discard follow the engine's discard rule", () => {
  let time = 1_000;
  const now = () => time;
  const session = Engine.create({
    questions: ["a", "b", "c", "d"].map((id) => question(id)),
    feedback: "end",
    timeLimitSeconds: 600,
    now,
  });
  session.select(2); // a: right
  session.next(); // b: seen, blank
  session.next();
  session.select(0); // c: wrong
  time += 60_000;
  const saved = savedSet(session, "s-1", time, true); // Save and exit
  time += 3_600_000;
  const info = Store.summary(saved, time);
  assert.deepEqual(
    [info.slot, info.title, info.total, info.seen, info.answered, info.blank, info.unseen, info.timed, info.remainingMs, info.expired],
    ["set", "SAT Math: drill", 4, 3, 2, 1, 1, true, 540_000, false],
    "a paused practice set's timer waited",
  );
  const discarded = Store.discardResult(saved, time);
  assert.deepEqual(discarded.items.map((item) => [item.index, item.answered, item.correct]),
    [[0, true, true], [1, false, false], [2, true, false]]);

  // Recorded as the app records a discard, the answers count as evidence:
  // the blank and the wrong answer are misses, the right one is right.
  const attempts = discarded.items.map((item) => Object.assign(Progress.buildAttempt(item.question, item, {
    id: `s-1:${item.index}`, sessionId: "s-1", feedback: "end", now: time,
  }), { discarded: true }));
  const progress = Progress.recordAttempts(Progress.empty(), attempts);
  const stats = Progress.stats(progress.attempts);
  assert.equal(stats.attempted, 3);
  assert.equal(stats.correct, 1);
  assert.equal(progress.attempts.filter(Progress.isMiss).length, 2);
});

test("a saved test module's clock keeps running while it is away, and a test on its break has nothing on screen", () => {
  let time = 0;
  const module = Engine.create({
    questions: ["a", "b"].map((id) => question(id)),
    timeLimitSeconds: 35 * 60,
    wallClock: true,
    now: () => time,
  });
  module.select(2);
  time = 5 * 60_000;
  const saved = savedTest("t2", { schema: "liminal-test-shell", version: 1, session: module.serialize({ paused: true }) });
  time = 20 * 60_000;
  let info = Store.summary(saved, time);
  assert.equal(info.slot, "test");
  assert.equal(info.wallClock, true);
  assert.equal(info.remainingMs, 15 * 60_000, "35 minutes less 20 on the wall clock");
  assert.equal(info.answered, 1);
  time = 40 * 60_000;
  info = Store.summary(saved, time);
  assert.equal(info.expired, true);
  assert.equal(info.remainingMs, 0);

  const onBreak = savedTest("t3");
  assert.equal(Store.discardResult(onBreak, time), null);
  assert.deepEqual([Store.summary(onBreak, time).total, Store.summary(onBreak, time).timed], [0, false]);
});
