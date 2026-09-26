"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Progress = require("../src/lib/progress");
const IO = require("../src/lib/progress-io");

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

function attempt(id, fields) {
  return Object.assign({
    id,
    questionId: `sat-math:linear-equation-solve:${id}`,
    sectionKey: "sat-math",
    test: "SAT",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "solve",
    difficulty: "Medium",
    templateId: "linear-equation-solve",
    templateVersion: 1,
    seed: id,
    source: "template",
    correct: true,
    answered: true,
    response: "2",
    hinted: false,
    timeMs: 61000,
    feedback: "end",
    sessionId: "s1",
    timestamp: 1000,
  }, fields);
}

function record(fields) {
  return Object.assign(Progress.empty({ epoch: "e-file" }), {
    attempts: [attempt("a1"), attempt("a2", { correct: false, timestamp: 2000 })],
    marked: ["sat-math:linear-equation-solve:a2"],
    errorLog: { a2: { reason: "careless", at: 2500 } },
    history: { "sat-math": { serve: 3, lastServed: { "linear-equation-solve": 3 }, scenes: {}, mask: "1" } },
    sessions: [{ id: "s1", sectionKey: "sat-math", kind: "practice", title: "SAT Math", startedAt: 500,
      finishedAt: 2600, total: 2, correct: 1, hard: { total: 0, correct: 0 }, timeMs: 120000, byDomain: {} }],
    plan: { testDate: "2026-11-07", weeklyQuestions: 120 },
    officialScores: [{ id: "o1", date: "2026-09-12", kind: "practice", label: "Practice Test 4",
      readingWriting: 560, math: 510, at: 3000 }],
  }, fields);
}

test("an export round-trips through the file", () => {
  const original = record();
  const file = IO.exportFile(original, new Date(2026, 8, 25, 12));
  assert.equal(file.name, "liminal-progress-2026-09-25.json");
  const payload = JSON.parse(file.text);
  assert.equal(payload.format, "liminal-progress");
  assert.equal(payload.version, 3);
  const parsed = IO.parseImport(file.text);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.progress, Progress.normalize(original));
  assert.deepEqual(parsed.info.dropped, { attempts: 0, sessions: 0, errorLog: 0, plan: 0, officialScores: 0 });
  assert.equal(parsed.info.officialScores, 1);
  assert.equal(parsed.info.source, "export");
  assert.equal(parsed.info.attempts, 2);
  assert.deepEqual(parsed.info.tests, { SAT: 2, ACT: 0 });
  assert.deepEqual([parsed.info.firstAt, parsed.info.lastAt], [1000, 2000]);
  assert.equal(parsed.info.exportedAt, payload.exportedAt);
});

test("foreign, empty, and newer files are refused with a reason", () => {
  const refused = (text) => {
    const result = IO.parseImport(text);
    assert.equal(result.ok, false, text);
    return result.error;
  };
  assert.match(refused(""), /empty/);
  assert.match(refused("not json"), /not a Liminal progress file/);
  assert.match(refused("[1, 2]"), /not a Liminal progress file/);
  assert.match(refused(JSON.stringify({ name: "package", version: "1.0.0" })), /not a Liminal progress file/);
  assert.match(refused(JSON.stringify({ format: "other-app", version: 3, progress: record() })), /not a Liminal/);
  assert.match(refused(JSON.stringify({ format: "liminal-progress", version: 3 })), /holds no progress record/);
  // A stray object with a version and attempts is not a whole record.
  assert.match(refused(JSON.stringify({ version: 3, attempts: [] })), /not a Liminal/);
  assert.match(refused(JSON.stringify({ format: "liminal-progress", version: 4, progress: record({ version: 4 }) })),
    /newer version of Liminal \(record version 4\)/);
  assert.match(refused(JSON.stringify({ format: "liminal-progress", version: 2, progress: record() })), /not a Liminal/);
  assert.match(refused(JSON.stringify(record({ attempts: [{ id: 1 }, { questionId: "x" }] }))), /None of the answers/);
});

test("a bare stored record and a v2 record are accepted", () => {
  const bare = IO.parseImport(JSON.stringify(record()));
  assert.equal(bare.ok, true);
  assert.equal(bare.info.source, "record");
  assert.equal(bare.info.migrated, false);

  const v2 = IO.parseImport(JSON.stringify({
    version: 2,
    attempts: [{ questionId: "act-english-0007", sectionKey: "act-english", difficulty: "Easy",
      domain: "Knowledge of Language", skill: "Style", correct: false, response: 3, timestamp: 400 }],
    flagged: ["act-english-0007"],
  }), { epoch: "e-v2" });
  assert.equal(v2.ok, true);
  assert.equal(v2.info.migrated, true);
  assert.equal(v2.info.version, 2);
  assert.equal(v2.progress.version, 3);
  assert.equal(v2.progress.epoch, "e-v2");
  assert.deepEqual(v2.progress.attempts.map((entry) => [entry.id, entry.source, entry.test]), [["v2:0", "bank", "ACT"]]);
  assert.deepEqual(v2.progress.marked, ["act-english-0007"]);
});

test("entries that do not match the v3 shape are dropped and counted", () => {
  const text = JSON.stringify(record({
    attempts: [
      attempt("good"),
      attempt("bad-correct", { correct: "yes" }),
      attempt("bad-tier", { difficulty: "Impossible" }),
      attempt("bad-source", { source: "somewhere" }),
      attempt("bad-time", { timeMs: -5 }),
      attempt("bad-skill", { skill: 42 }),
      { id: "no-question" },
    ],
    sessions: [{ id: "ok", total: 1, correct: 1 }, { total: 2, correct: 1 }, { id: "bad", total: "2", correct: 1 }],
    errorLog: { good: { reason: "time", at: 1 }, other: { reason: "bored", at: 1 } },
    plan: { testDate: "2026-02-30", weeklyQuestions: 100 },
    officialScores: [
      { id: "good", date: "2026-09-01", kind: "sat", math: 500 },
      { id: "no-date", date: "2026-02-30", kind: "practice", math: 500 },
      { date: "2026-09-01", kind: "sat", math: 500 },
      { id: "off-scale", date: "2026-09-01", kind: "sat", math: 505 },
    ],
  }));
  const result = IO.parseImport(text);
  assert.equal(result.ok, true);
  assert.deepEqual(result.progress.attempts.map((entry) => entry.id), ["good"]);
  assert.deepEqual(result.progress.sessions.map((entry) => entry.id), ["ok"]);
  assert.deepEqual(Object.keys(result.progress.errorLog), ["good"]);
  assert.deepEqual(result.progress.plan, { weeklyQuestions: 100 });
  assert.deepEqual(result.progress.officialScores.map((entry) => entry.id), ["good"]);
  assert.deepEqual(result.info.dropped, { attempts: 6, sessions: 2, errorLog: 1, plan: 1, officialScores: 3 });
  // Fields added later pass through untouched.
  const extra = IO.parseImport(JSON.stringify(record({ attempts: [attempt("r", { reviewOf: "sat-math:x:1" })] })));
  assert.equal(extra.progress.attempts[0].reviewOf, "sat-math:x:1");
});

test("a __proto__ key in a file never reaches an object's prototype", () => {
  const text = JSON.stringify(record()).replace('"errorLog":{', '"errorLog":{"__proto__":{"polluted":true},');
  assert.ok(text.includes("__proto__"));
  const result = IO.parseImport(text);
  assert.equal(result.ok, true);
  assert.equal(Object.getPrototypeOf(result.progress.errorLog), Object.prototype);
  assert.equal(result.progress.errorLog.polluted, undefined);
  assert.equal({}.polluted, undefined);
});

test("merging a file unions answers and sets, and merging it again changes nothing", () => {
  const current = Object.assign(Progress.empty({ epoch: "e-here" }), {
    attempts: [attempt("a1"), attempt("h1", { timestamp: 1500 })],
    marked: ["sat-math:linear-equation-solve:h1"],
    errorLog: { a2: { reason: "content", at: 9 } },
    plan: { weeklyQuestions: 200 },
    officialScores: [{ id: "here", date: "2026-09-19", kind: "practice", math: 540 }],
  });
  const imported = IO.parseImport(JSON.stringify(record())).progress;
  const first = IO.mergeImport(current, imported);
  const merged = first.progress;
  assert.equal(merged.epoch, "e-here");
  assert.deepEqual(merged.attempts.map((entry) => entry.id), ["a1", "h1", "a2"]);
  assert.deepEqual(merged.sessions.map((entry) => entry.id), ["s1"]);
  assert.deepEqual(merged.marked.sort(), ["sat-math:linear-equation-solve:a2", "sat-math:linear-equation-solve:h1"]);
  // This browser's tag and plan values win; the file fills the gaps.
  assert.equal(merged.errorLog.a2.reason, "content");
  assert.deepEqual(merged.plan, { testDate: "2026-11-07", weeklyQuestions: 200 });
  assert.equal(merged.history["sat-math"].serve, 3);
  // Official scores join by id, in date order.
  assert.deepEqual(merged.officialScores.map((entry) => entry.id), ["o1", "here"]);
  assert.deepEqual(first.added, { attempts: 1, sessions: 1, marked: 1, officialScores: 1 });
  assert.equal(first.over, 0);

  const again = IO.mergeImport(merged, imported);
  assert.deepEqual(again.added, { attempts: 0, sessions: 0, marked: 0, officialScores: 0 });
  assert.deepEqual(again.progress.attempts, merged.attempts);
});

test("two browsers' migrated ids that name different answers are both kept", () => {
  const current = Object.assign(Progress.empty({ epoch: "e-here" }), {
    attempts: [attempt("v2:0", { questionId: "act-english-0001", timestamp: 10 })],
  });
  const imported = Object.assign(Progress.empty({ epoch: "e-there" }), {
    attempts: [attempt("v2:0", { questionId: "act-reading-0009", timestamp: 20 })],
    errorLog: { "v2:0": { reason: "time", at: 30 } },
  });
  const merged = IO.mergeImport(current, imported).progress;
  assert.deepEqual(merged.attempts.map((entry) => entry.id), ["v2:0", "v2:0~e-there"]);
  assert.deepEqual(Object.keys(merged.errorLog), ["v2:0~e-there"]);
  assert.deepEqual(IO.mergeImport(merged, imported).added, { attempts: 0, sessions: 0, marked: 0, officialScores: 0 });
});

test("a merge beyond what the browser keeps reports how many answers are over", () => {
  const many = (prefix, count) => Array.from({ length: count }, (_, index) => attempt(`${prefix}${index}`, { timestamp: index }));
  const current = Object.assign(Progress.empty({ epoch: "e" }), { attempts: many("h", 3000) });
  const imported = Object.assign(Progress.empty({ epoch: "f" }), { attempts: many("f", 2500) });
  assert.equal(IO.mergeImport(current, imported).over, 500);
});

test("replacing takes a new epoch, so another tab's older copy does not come back", () => {
  const storage = memoryStorage();
  const tabA = Progress.createStore(storage, { epoch: "e-a" });
  tabA.update((progress) => Progress.recordAttempts(progress, [attempt("old")]));
  const tabB = Progress.createStore(storage);
  assert.deepEqual(tabB.get().attempts.map((entry) => entry.id), ["old"]);

  const imported = IO.parseImport(JSON.stringify(record())).progress;
  tabA.update(() => IO.replaceWith(imported, "e-new"));
  assert.equal(tabA.get().epoch, "e-new");
  assert.deepEqual(tabA.get().attempts.map((entry) => entry.id), ["a1", "a2"]);

  // Tab B still holds "old" in memory; its next write keeps the replacement.
  tabB.update((progress) => Progress.setMarked(progress, "x", true));
  assert.deepEqual(Progress.load(storage).progress.attempts.map((entry) => entry.id), ["a1", "a2"]);
  assert.notEqual(IO.replaceWith(imported).epoch, imported.epoch);
});
