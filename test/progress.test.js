"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Progress = require("../src/lib/progress");
const Identity = require("../src/lib/question-identity");

// localStorage as a Map; `full` makes every write throw like a full quota.
function memoryStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    map,
    full: false,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem(key, value) {
      if (this.full) throw new Error("QuotaExceededError");
      map.set(key, String(value));
    },
    removeItem: (key) => map.delete(key),
  };
}

const V2 = {
  version: 2,
  attempts: [
    // A fixed-bank SAT answer: its Hard label is not trusted.
    { questionId: "sat-math-0101", sectionKey: "sat-math", difficulty: "Hard", domain: "Algebra",
      skill: "Linear functions", correct: true, response: 2, timestamp: 100 },
    // Generated before templates had registry bits.
    { questionId: "sat-math-hard:quad-vertex:17", sectionKey: "sat-math", difficulty: "Hard",
      domain: "Advanced Math", skill: "Nonlinear functions", familyId: "quad-vertex", seed: "17",
      correct: false, response: null, timestamp: 200 },
    // A template question with the current id shape.
    { questionId: "sat-reading-writing:wic-precise:ab.wic-precise.0", sectionKey: "sat-reading-writing",
      difficulty: "Medium", domain: "Craft and Structure", skill: "Words in Context",
      correct: true, response: 1, timestamp: 300 },
    { questionId: "act-english-0007", sectionKey: "act-english", difficulty: "Easy",
      domain: "Knowledge of Language", skill: "Style", correct: false, response: 3,
      timestamp: 400, reviewAt: 999 },
    { questionId: "act-writing-0002", sectionKey: "act-writing", correct: null,
      response: "[local essay draft]", timestamp: 500 },
  ],
  flagged: ["sat-math-0101", "act-english-0007", "act-english-0007"],
  recentIds: ["act-english-0007"],
  servedIds: ["act-english-0001", "act-english-0007", "sat-math-hard:quad-vertex:17"],
  templatesSeen: { "sat-math": "5", "sat-reading-writing": "not a code!" },
};

test("v2 migrates to v3 and tags each attempt's source", () => {
  const storage = memoryStorage({ [Progress.LEGACY_KEY]: JSON.stringify(V2) });
  const loaded = Progress.load(storage);
  assert.equal(loaded.migrated, true);
  const progress = loaded.progress;
  assert.equal(progress.version, 3);
  assert.deepEqual(progress.attempts.map((attempt) => attempt.source),
    ["legacy-bank", "template", "template", "bank", "bank"]);
  assert.deepEqual(progress.attempts.map((attempt) => attempt.id), ["v2:0", "v2:1", "v2:2", "v2:3", "v2:4"]);
  const legacyHard = progress.attempts[1];
  assert.equal(legacyHard.templateId, "quad-vertex");
  assert.equal(legacyHard.seed, "17");
  assert.equal(legacyHard.templateVersion, 1);
  assert.equal(legacyHard.answered, false, "a null response was left blank");
  assert.equal(legacyHard.correct, false);
  assert.equal(progress.attempts[2].templateId, "wic-precise");
  assert.equal(progress.attempts[3].reviewAt, 999);
  assert.equal(progress.attempts[3].test, "ACT");
  assert.equal(progress.attempts[4].correct, null, "essays stay unscored");
  assert.deepEqual(progress.marked, ["sat-math-0101", "act-english-0007"]);
  assert.equal(progress.history["sat-math"].mask, "5");
  assert.equal(progress.history["sat-reading-writing"].mask, "0", "an unreadable mask is dropped");
  assert.deepEqual(Progress.recentlyServedIds(progress, "act-english"), ["act-english-0007", "act-english-0001"]);
  assert.equal(storage.getItem(Progress.STORAGE_KEY), null, "load alone never writes");
});

test("a store writes the migration once and keeps v2 as a backup", () => {
  const storage = memoryStorage({ [Progress.LEGACY_KEY]: JSON.stringify(V2) });
  const store = Progress.createStore(storage);
  assert.equal(store.get().attempts.length, 5);
  assert.ok(storage.getItem(Progress.STORAGE_KEY));
  assert.equal(storage.getItem(Progress.LEGACY_KEY), JSON.stringify(V2));
  const again = Progress.createStore(storage);
  assert.equal(again.get().epoch, store.get().epoch, "the second load reads v3");
});

function attempt(id, extra) {
  return Object.assign({
    id,
    questionId: `q-${id}`,
    sectionKey: "sat-math",
    test: "SAT",
    domain: "Algebra",
    skill: "Linear functions",
    difficulty: "Medium",
    source: "template",
    correct: true,
    answered: true,
    hinted: false,
    timestamp: Number(String(id).replace(/\D/g, "")) || 1,
  }, extra || {});
}

test("recordAttempts appends new ids only", () => {
  let progress = Progress.empty({ epoch: "e1" });
  progress = Progress.recordAttempts(progress, [attempt("a1"), attempt("a2")]);
  progress = Progress.recordAttempts(progress, [attempt("a2", { correct: false }), attempt("a3")]);
  assert.deepEqual(progress.attempts.map((item) => item.id), ["a1", "a2", "a3"]);
  assert.equal(progress.attempts[1].correct, true, "the first record of an id wins");
});

test("different generated seeds with the same displayed item count once and keep both outcomes", () => {
  const { instantiate } = require("../src/lib/families/shared/instantiate");
  const template = require("../src/lib/families/sat/reading-writing")
    .find((entry) => entry.id === "central-idea-academic-argument");
  const answers = ["2", "17"].map((seed, index) => {
    const question = instantiate(template, seed);
    question.id = `${question.sectionKey}:${question.templateId}:${seed}`;
    return Progress.buildAttempt(question, { response: index, correct: index === 1 },
      { id: `duplicate-${index}`, now: index + 1, templateVersion: 7 });
  });
  assert.notEqual(answers[0].questionId, answers[1].questionId);
  assert.equal(answers[0].visibleIdentity, answers[1].visibleIdentity);
  assert.equal(answers[0].contentIdentity, undefined);
  const progress = Progress.recordAttempts(Progress.empty(), answers.map((entry) => ({ ...entry, repeat: false })));
  assert.deepEqual(progress.attempts.map((entry) => entry.repeat), [false, true]);
  assert.deepEqual(progress.attempts.map((entry) => [entry.correct, entry.response, entry.templateVersion]),
    [[false, 0, 7], [true, 1, 7]]);
  assert.deepEqual([Progress.stats(answers).attempted, Progress.stats(answers).accuracy], [1, 0],
    "the accuracy API reconciles raw answers as well as saved records");
  assert.equal(Progress.stats(progress.attempts, { includeRepeats: true }).attempted, 2,
    "the completed set's own report may still show both answers");
});

test("content-repeat reconciliation survives merges, ties, and pruned predecessors without guessing old content", () => {
  const visibleIdentity = Identity.visibleIdentity({ stem: "What is 2 + 3?", responseType: "numeric" });
  const first = attempt("a", { timestamp: 10, visibleIdentity, correct: false });
  const later = attempt("z", { timestamp: 20, visibleIdentity });
  const record = (answers) => Progress.recordAttempts(Progress.empty({ epoch: "same" }), answers);
  const merged = Progress.merge(record([later]), record([first]));
  assert.deepEqual(merged.attempts.map((entry) => [entry.id, entry.repeat]), [["a", false], ["z", true]]);
  const pruned = Progress.normalize({ ...merged, attempts: merged.attempts.slice(1) });
  assert.equal(pruned.attempts[0].repeat, true);
  assert.equal(Progress.stats(pruned.attempts).attempted, 0);
  const tied = [first, { ...later, timestamp: 10 }];
  assert.deepEqual(Progress.markRepeats(tied).map((entry) => [entry.id, entry.repeat]),
    Progress.markRepeats(tied.slice().reverse()).reverse().map((entry) => [entry.id, entry.repeat]));
  const old = Progress.normalize({ ...merged, attempts: [
    attempt("old-a", { templateId: "same-template", seed: "2", templateVersion: 1, correct: false }),
    attempt("old-b", { templateId: "same-template", seed: "17", templateVersion: 1 }),
    { ...later, templateId: "same-template", templateVersion: 2 },
  ] });
  assert.deepEqual(old.attempts.map((entry) => entry.repeat), [false, false, false]);
  assert.equal(old.attempts[0].visibleIdentity, undefined, "no present-day rebuilding guesses an old item's content");
  assert.deepEqual(old.attempts.map((entry) => entry.correct), [false, true, true]);
});

test("equal-time reconciliation retains an already counted answer ahead of a known repeat", () => {
  const visibleIdentity = Identity.visibleIdentity({ stem: "What is 2 + 3?", responseType: "numeric" });
  for (const sameQuestionId of [true, false]) {
    const first = attempt("z", { timestamp: 10, repeat: false, correct: false, visibleIdentity });
    const repeated = attempt("a", {
      questionId: sameQuestionId ? first.questionId : "sat-math:another:seed",
      timestamp: 10, repeat: true, correct: true, visibleIdentity,
    });
    for (const answers of [[first, repeated], [repeated, first]]) {
      const normalized = Progress.normalize({ ...Progress.empty(), attempts: answers });
      assert.equal(normalized.attempts.find((entry) => entry.id === "z").repeat, false);
      assert.equal(normalized.attempts.find((entry) => entry.id === "a").repeat, true);
      const summary = Progress.stats(normalized.attempts);
      assert.deepEqual([summary.attempted, summary.correct, summary.repeats], [1, 0, 1]);
    }
    const earlierRepeat = Progress.markRepeats([{ ...repeated, timestamp: 9 }, first]);
    assert.ok(earlierRepeat.every((entry) => entry.repeat),
      "an earlier known repeat still proves that a predecessor was trimmed");
  }
});

test("section-wide served items and scenes retain recency across stale merges and stay bounded", () => {
  const identity = (value) => Identity.visibleIdentity({ stem: `What is ${value} + 1?`, responseType: "numeric" });
  const served = (progress, id, scene, value) => Progress.serveTemplates(progress, "sat-math", {
    templateIds: [id], scenes: { [id]: scene }, itemIdentities: [identity(value)], mask: "1",
  });
  const old = served(Progress.empty({ epoch: "same" }), "first", "orchard", 1);
  let current = served(old, "second", "harbor", 2);
  current = served(current, "third", "orchard", 3);
  const history = Progress.historyFor(Progress.merge(current, old), "sat-math");
  assert.deepEqual(history.recentScenes, ["harbor", "orchard"]);
  assert.deepEqual(history.recentItems, [1, 2, 3].map(identity));
  assert.deepEqual(history.scenes, { first: ["orchard"], second: ["harbor"], third: ["orchard"] });
  assert.deepEqual(Progress.historyFor(Progress.merge(old, current), "sat-math"), history,
    "the newer ordering wins regardless of which side held it");
  const branch = served(old, "fourth", "library", 4);
  const combined = Progress.merge(current, branch);
  assert.ok(Progress.historyFor(combined, "sat-math").recentItems.includes(identity(4)));
  assert.deepEqual(Progress.historyFor(Progress.merge(combined, branch), "sat-math"),
    Progress.historyFor(combined, "sat-math"), "merging an old branch again is idempotent");
  const size = Math.max(Progress.LIMITS.recentItems, Progress.LIMITS.recentScenes) + 4;
  let full = Progress.empty();
  for (let index = 0; index < size; index += 1) full = served(full, "one-template", `scene-${index}`, index);
  const bounded = Progress.historyFor(full, "sat-math");
  assert.equal(bounded.recentItems.length, Progress.LIMITS.recentItems);
  assert.equal(bounded.recentScenes.length, Progress.LIMITS.recentScenes);
  assert.equal(bounded.scenes["one-template"].length, Progress.LIMITS.scenesPerTemplate);
  assert.equal(bounded.recentItems.at(-1), identity(size - 1));
  assert.equal(bounded.recentScenes.at(-1), `scene-${size - 1}`);
  const saved = Progress.normalize(JSON.parse(JSON.stringify(full)));
  assert.deepEqual(Progress.historyFor(saved, "sat-math"), bounded);
});

test("old per-template scene history becomes section-wide without inventing visible-item identities", () => {
  const old = { ...Progress.empty(), history: { "sat-reading-writing": {
    serve: 8, lastServed: { late: 8, early: 2 }, scenes: { late: ["shared", "latest"], early: ["earliest", "shared"] }, mask: "5",
  } } };
  const history = Progress.historyFor(old, "sat-reading-writing");
  assert.deepEqual(history.recentScenes, ["earliest", "shared", "latest"]);
  assert.deepEqual(history.recentItems, []);
  assert.equal(history.serve, 8);
  assert.equal(history.mask, "5");
  assert.deepEqual(history.scenes, old.history["sat-reading-writing"].scenes);
  const noted = Progress.noteScenes(Progress.normalize(old), "sat-reading-writing", { another: ["forgotten"] });
  assert.deepEqual(Progress.historyFor(noted, "sat-reading-writing").recentScenes,
    ["forgotten", "earliest", "shared", "latest"]);
  assert.equal(old.history["sat-reading-writing"].recentScenes, undefined, "reads do not mutate old records");
});

test("two tabs writing in turn keep each other's attempts", () => {
  const storage = memoryStorage();
  const tabA = Progress.createStore(storage);
  const tabB = Progress.createStore(storage);
  tabA.update((progress) => Progress.recordAttempts(progress, [attempt("a1")]));
  tabB.update((progress) => Progress.recordAttempts(progress, [attempt("b2")]));
  tabA.update((progress) => Progress.recordAttempts(progress, [attempt("a3")]));
  const stored = JSON.parse(storage.getItem(Progress.STORAGE_KEY));
  assert.deepEqual(stored.attempts.map((item) => item.id), ["a1", "b2", "a3"]);
  assert.deepEqual(tabB.refresh().attempts.map((item) => item.id), ["a1", "b2", "a3"]);
});

test("a failed write keeps the record in memory and merges it into the next save", () => {
  const storage = memoryStorage();
  const store = Progress.createStore(storage);
  store.update((progress) => Progress.recordAttempts(progress, [attempt("a1")]));
  storage.full = true;
  const failed = store.update((progress) => Progress.recordAttempts(progress, [attempt("a2")]));
  assert.equal(failed.ok, false);
  assert.equal(store.saved(), false);
  assert.deepEqual(store.get().attempts.map((item) => item.id), ["a1", "a2"]);
  storage.full = false;
  store.update((progress) => Progress.recordAttempts(progress, [attempt("a3")]));
  const stored = JSON.parse(storage.getItem(Progress.STORAGE_KEY));
  assert.deepEqual(stored.attempts.map((item) => item.id), ["a1", "a2", "a3"]);
});

test("failed mutable edits survive refresh and retry without repeating the change callback", () => {
  const storage = memoryStorage();
  const store = Progress.createStore(storage, { epoch: "saved" });
  store.update((progress) => Progress.recordAttempts(progress, [attempt("a1")]));
  storage.full = true;
  let calls = 0;
  const result = store.update((progress) => {
    calls += 1;
    progress = Progress.setMarked(progress, "q1", true);
    progress = Progress.setPlan(progress, { weeklyQuestions: 100, testDate: "2026-12-12" }, "ACT");
    progress = Progress.addOfficialScore(progress, { id: "o1", date: "2026-10-03", kind: "practice", math: 600 });
    progress = Progress.serveQuestions(progress, "act-english", ["act-english-0001"]);
    return Progress.tagError(progress, "a1", { reason: "time" }, 1);
  });
  assert.equal(result.ok, false);
  for (let index = 0; index < 3; index += 1) {
    const fresh = store.refresh();
    assert.deepEqual(fresh.marked, ["q1"]);
    assert.deepEqual(fresh.plan, { ACT: { weeklyQuestions: 100, testDate: "2026-12-12" } });
    assert.equal(fresh.officialScores[0].math, 600);
    assert.equal(fresh.errorLog.a1.reason, "time");
    assert.equal(fresh.history["act-english"].serve, 1);
    assert.equal(store.saved(), false, "refresh does not claim unsaved edits are durable");
  }
  // Further failed changes keep the latest value of each edited key.
  store.update((progress) => Progress.setPlan(progress, { weeklyQuestions: 120 }, "ACT"));
  storage.full = false;
  assert.equal(store.update().ok, true);
  assert.equal(calls, 1, "retry saves values instead of rerunning a side-effectful callback");
  const saved = Progress.load(storage).progress;
  assert.deepEqual(saved.marked, ["q1"]);
  assert.deepEqual(saved.plan.ACT, { weeklyQuestions: 120, testDate: "2026-12-12" });
  assert.equal(saved.officialScores[0].math, 600);
  assert.equal(saved.errorLog.a1.reason, "time");
  assert.equal(saved.history["act-english"].serve, 1);
});

test("failed removals survive refresh, unreadable storage, and recovery", () => {
  const storage = memoryStorage();
  const store = Progress.createStore(storage);
  store.update((progress) => {
    progress = Progress.setMarks(progress, { q1: true, q2: true });
    progress = Progress.setPlan(progress, { weeklyQuestions: 100, testDate: "2026-12-12" }, "ACT");
    progress = Progress.addOfficialScore(progress, { id: "o1", date: "2026-10-03", math: 600 });
    return Progress.tagError(progress, "a1", { reason: "time" }, 1);
  });
  storage.full = true;
  store.update((progress) => {
    progress = Progress.setMarked(progress, "q1", false);
    progress = Progress.setPlan(progress, { testDate: undefined }, "ACT");
    progress = Progress.removeOfficialScore(progress, "o1");
    return Progress.tagError(progress, "a1", null);
  });
  const reads = storage.getItem;
  storage.getItem = () => { throw new Error("blocked"); };
  assert.deepEqual(store.refresh().marked, ["q2"]);
  storage.getItem = reads;
  const fresh = store.refresh();
  assert.deepEqual(fresh.marked, ["q2"]);
  assert.deepEqual(fresh.plan, { ACT: { weeklyQuestions: 100 } });
  assert.deepEqual(fresh.officialScores, []);
  assert.deepEqual(fresh.errorLog, {});
  storage.full = false;
  assert.equal(store.update().ok, true);
  const saved = Progress.load(storage).progress;
  assert.deepEqual(saved.marked, ["q2"]);
  assert.deepEqual(saved.plan, { ACT: { weeklyQuestions: 100 } });
  assert.deepEqual(saved.officialScores, []);
  assert.deepEqual(saved.errorLog, {});
});

test("pending keys merge with another tab's additions and deletions, then release after saving", () => {
  const storage = memoryStorage();
  const localStorage = Object.assign({}, storage);
  const local = Progress.createStore(localStorage);
  local.update((progress) => Object.assign({}, progress, {
    marked: ["remove-remote", "remove-local"],
    plan: { SAT: { testDate: "2026-11-07", weeklyQuestions: 50 }, ACT: { testDate: "2026-12-12" } },
    officialScores: [{ id: "remove-remote", date: "2026-09-01", math: 500 },
      { id: "remove-local", date: "2026-09-02", math: 510 }, { id: "edit-local", date: "2026-09-03", math: 520 }],
    errorLog: { "remove-remote": { reason: "time" }, "remove-local": { reason: "time" } },
  }));
  const remote = Progress.createStore(storage);
  localStorage.full = true;
  local.update((progress) => {
    progress = Progress.setMarks(progress, { "add-local": true, "remove-local": false });
    progress = Progress.setPlan(progress, { testDate: "2027-03-06" }, "SAT");
    progress = Progress.addOfficialScore(progress, { id: "edit-local", date: "2026-09-03", math: 620 });
    progress = Progress.removeOfficialScore(progress, "remove-local");
    progress = Progress.tagError(progress, "remove-local", null);
    return Progress.tagError(progress, "add-local", { reason: "content" }, 2);
  });
  remote.update((progress) => {
    progress = Progress.setMarks(progress, { "remove-remote": false, "add-remote": true });
    progress = Progress.setPlan(progress, { weeklyQuestions: 90 }, "SAT");
    progress = Progress.setPlan(progress, { testDate: undefined }, "ACT");
    progress = Progress.removeOfficialScore(progress, "remove-remote");
    progress = Progress.addOfficialScore(progress, { id: "add-remote", date: "2026-10-03", math: 630 });
    progress = Progress.tagError(progress, "remove-remote", null);
    return Progress.tagError(progress, "add-remote", { reason: "careless" }, 3);
  });
  const fresh = local.refresh();
  assert.deepEqual(fresh.marked.sort(), ["add-local", "add-remote"]);
  assert.deepEqual(fresh.plan.SAT, { testDate: "2027-03-06", weeklyQuestions: 90 });
  assert.equal(fresh.plan.ACT.testDate, undefined);
  assert.deepEqual(fresh.officialScores.map((score) => [score.id, score.math]), [["edit-local", 620], ["add-remote", 630]]);
  assert.deepEqual(Object.keys(fresh.errorLog).sort(), ["add-local", "add-remote"]);
  localStorage.full = false;
  assert.equal(local.update().ok, true);
  remote.update((progress) => {
    progress = Progress.setMarked(progress, "add-local", false);
    progress = Progress.setPlan(progress, { testDate: undefined }, "SAT");
    progress = Progress.removeOfficialScore(progress, "edit-local");
    return Progress.tagError(progress, "add-local", null);
  });
  const released = local.refresh();
  assert.deepEqual(released.marked, ["add-remote"]);
  assert.deepEqual(released.plan.SAT, { weeklyQuestions: 90 });
  assert.deepEqual(released.officialScores.map((score) => score.id), ["add-remote"]);
  assert.deepEqual(Object.keys(released.errorLog), ["add-remote"]);
  local.update();
  assert.deepEqual(Progress.load(storage).progress.marked, ["add-remote"]);
});

test("a saved clear in another tab drops every pending edit from the old epoch", () => {
  const storage = memoryStorage();
  const localStorage = Object.assign({}, storage);
  const local = Progress.createStore(localStorage, { epoch: "old" });
  local.update((progress) => Progress.recordAttempts(progress, [attempt("old")]));
  const remote = Progress.createStore(storage);
  localStorage.full = true;
  local.update((progress) => Object.assign({}, progress, {
    marked: ["q1"], plan: { ACT: { weeklyQuestions: 100 } },
    officialScores: [{ id: "o1", date: "2026-10-03", math: 600 }], errorLog: { a1: { reason: "time" } },
  }));
  assert.equal(remote.clear().ok, true);
  assert.deepEqual(local.refresh(), remote.get());
  localStorage.full = false;
  local.update((progress) => Progress.recordAttempts(progress, [attempt("new")]));
  const saved = Progress.load(storage).progress;
  assert.deepEqual(saved.attempts.map((entry) => entry.id), ["new"]);
  assert.deepEqual(saved.marked, []);
  assert.deepEqual(saved.plan, {});
  assert.deepEqual(saved.officialScores, []);
  assert.deepEqual(saved.errorLog, {});
});

test("failed clear keeps the current record, pending edits, and migration backup for recovery", () => {
  const storage = memoryStorage({ [Progress.LEGACY_KEY]: JSON.stringify(V2) });
  const store = Progress.createStore(storage);
  const epoch = store.get().epoch;
  storage.full = true;
  store.update((progress) => Progress.setPlan(progress, { weeklyQuestions: 100 }, "ACT"));
  const failed = store.clear();
  assert.equal(failed.ok, false);
  assert.equal(store.saved(), false);
  assert.equal(failed.progress.epoch, epoch);
  assert.equal(failed.progress.attempts.length, 5);
  assert.equal(store.refresh().plan.ACT.weeklyQuestions, 100);
  assert.equal(storage.getItem(Progress.LEGACY_KEY), JSON.stringify(V2));
  storage.full = false;
  assert.equal(store.update().ok, true);
  assert.equal(Progress.load(storage).progress.plan.ACT.weeklyQuestions, 100);
  assert.equal(store.clear().ok, true);
  assert.equal(storage.getItem(Progress.LEGACY_KEY), null);
  assert.notEqual(store.get().epoch, epoch);
  assert.deepEqual(store.refresh().plan, {});
  assert.deepEqual(store.get().attempts, []);
});

test("clear reports a failed legacy-backup removal and retries it", () => {
  const storage = memoryStorage({ [Progress.LEGACY_KEY]: JSON.stringify(V2) });
  const store = Progress.createStore(storage);
  const remove = storage.removeItem;
  storage.removeItem = () => { throw new Error("blocked"); };
  assert.equal(store.clear().ok, false);
  assert.equal(store.saved(), false);
  assert.deepEqual(Progress.load(storage).progress.attempts, [], "the v3 clear already succeeded");
  assert.ok(storage.getItem(Progress.LEGACY_KEY), "the backup still needs removing");
  storage.removeItem = remove;
  assert.equal(store.clear().ok, true);
  assert.equal(store.saved(), true);
  assert.equal(storage.getItem(Progress.LEGACY_KEY), null);
});

test("failed migration writes do not manufacture a new epoch at every refresh", () => {
  const storage = memoryStorage({ [Progress.LEGACY_KEY]: JSON.stringify(V2) });
  storage.full = true;
  const store = Progress.createStore(storage);
  const epoch = store.get().epoch;
  store.update((progress) => Progress.setPlan(progress, { weeklyQuestions: 100 }, "ACT"));
  assert.equal(store.refresh().epoch, epoch);
  assert.equal(store.refresh().plan.ACT.weeklyQuestions, 100);
  storage.full = false;
  assert.equal(store.update().ok, true);
  assert.equal(Progress.load(storage).progress.plan.ACT.weeklyQuestions, 100);
  assert.equal(Progress.load(storage).progress.attempts.length, 5);
});

test("a first readable epoch keeps edits made while storage was absent or unreadable", () => {
  for (const unreadable of [false, true]) {
    const storage = memoryStorage();
    const localStorage = Object.assign({}, storage, { full: true });
    if (unreadable) localStorage.getItem = () => { throw new Error("blocked"); };
    const local = Progress.createStore(localStorage, { epoch: "provisional" });
    local.update((progress) => Progress.setMarked(progress, "local", true));
    const remote = Progress.createStore(storage, { epoch: "persisted" });
    remote.update((progress) => Progress.setMarked(progress, "remote", true));
    localStorage.getItem = storage.getItem;
    assert.equal(local.refresh().epoch, "persisted");
    assert.deepEqual(local.get().marked.sort(), ["local", "remote"]);
    localStorage.full = false;
    assert.equal(local.update().ok, true);
    assert.deepEqual(Progress.load(storage).progress.marked.sort(), ["local", "remote"]);
  }
});

test("clearing in one tab is not undone by another tab's older copy", () => {
  const storage = memoryStorage({ [Progress.LEGACY_KEY]: JSON.stringify(V2) });
  const tabA = Progress.createStore(storage);
  const tabB = Progress.createStore(storage);
  tabA.clear();
  assert.equal(storage.getItem(Progress.LEGACY_KEY), null, "clearing removes the v2 backup too");
  tabB.update((progress) => Progress.recordAttempts(progress, [attempt("b1")]));
  const stored = JSON.parse(storage.getItem(Progress.STORAGE_KEY));
  assert.deepEqual(stored.attempts.map((item) => item.id), ["b1"]);
});

test("marks mirror the latest state, whichever tab set it", () => {
  const storage = memoryStorage();
  const tabA = Progress.createStore(storage);
  const tabB = Progress.createStore(storage);
  tabA.update((progress) => Progress.setMarks(progress, { q1: true, q2: true }));
  tabB.update((progress) => Progress.setMarked(progress, "q1", false));
  tabA.update((progress) => Progress.recordAttempts(progress, [attempt("a1")]));
  assert.deepEqual(tabA.get().marked, ["q2"]);
  assert.equal(Progress.isMarked(tabA.get(), "q1"), false);
  assert.deepEqual(Progress.markedIds(tabA.get(), { test: "SAT" }), []);
});

test("serving a run updates recency, scenes, and the lifetime mask", () => {
  let progress = Progress.empty({ epoch: "e1" });
  progress = Progress.serveTemplates(progress, "sat-math", {
    templateIds: ["t1", "t2"],
    scenes: { t1: "bakery" },
    mask: "3",
  });
  progress = Progress.serveTemplates(progress, "sat-math", {
    templateIds: ["t2", "t3"],
    scenes: { t2: "garden", t3: null },
    mask: "c",
  });
  const history = Progress.historyFor(progress, "sat-math");
  assert.equal(history.serve, 2);
  assert.deepEqual(history.lastServed, { t1: 1, t2: 2, t3: 2 });
  assert.deepEqual(history.scenes, { t1: ["bakery"], t2: ["garden"] });
  assert.equal(history.mask, "f");
  assert.equal(Progress.serveTemplates(progress, "sat-math", { templateIds: [] }), progress);
  const empty = Progress.historyFor(progress, "sat-reading-writing");
  assert.deepEqual(empty, { serve: 0, lastServed: {}, scenes: {}, mask: "0", recentItems: [], recentScenes: [] });
});

test("bank serving remembers only the most recent questions", () => {
  let progress = Progress.empty({ epoch: "e1" });
  const ids = Array.from({ length: Progress.LIMITS.servedPerSection + 50 }, (_, index) => `act-reading-${index}`);
  progress = Progress.serveQuestions(progress, "act-reading", ids.slice(0, 100));
  progress = Progress.serveQuestions(progress, "act-reading", ids.slice(100));
  const recent = Progress.recentlyServedIds(progress, "act-reading");
  assert.equal(recent.length, Progress.LIMITS.servedPerSection);
  assert.ok(recent.includes(ids.at(-1)));
});

test("buildAttempt records every field of an answer, blank or not", () => {
  const question = {
    id: "sat-math:linear-slope:k2.linear-slope.0",
    templateId: "linear-slope",
    seed: "k2.linear-slope.0",
    sectionKey: "sat-math",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "slope",
    difficulty: "Hard",
    responseType: "numeric",
  };
  const blank = Progress.buildAttempt(question, { response: null, correct: false, hinted: true, timeMs: 1234.4 },
    { id: "s1:0", sessionId: "s1", feedback: "instant", runCode: "3-ab", templateVersion: 2, now: 50 });
  assert.equal(blank.answered, false);
  assert.equal(blank.correct, false);
  assert.equal(blank.hinted, true);
  assert.equal(blank.timeMs, 1234);
  assert.equal(blank.source, "template");
  assert.equal(blank.templateVersion, 2);
  assert.equal(blank.seed, "k2.linear-slope.0");
  assert.equal(blank.runCode, "3-ab");
  assert.equal(blank.feedback, "instant");
  assert.equal(blank.test, "SAT");
  const legacy = Progress.buildAttempt({ id: "sat-math-0003", sectionKey: "sat-math", responseType: "multiple-choice" },
    { response: 0, correct: true }, { id: "s1:1", now: 1 });
  assert.equal(legacy.source, "legacy-bank");
  assert.equal(legacy.answered, true, "choice 0 is an answer");
  assert.equal(legacy.feedback, "end");
  assert.equal(legacy.templateId, undefined);
  const act = Progress.buildAttempt({ id: "act-reading-0001", sectionKey: "act-reading" },
    { response: 1, correct: false }, { id: "s1:2" });
  assert.equal(act.source, "bank");
});

test("stats leave out the retired banks, count blanks wrong, and keep hinted-correct apart", () => {
  const attempts = [
    attempt("1", { difficulty: "Hard", correct: true }),
    attempt("2", { difficulty: "Hard", correct: true, hinted: true }),
    attempt("3", { difficulty: "Hard", correct: false, answered: false }),
    attempt("4", { difficulty: "Hard", correct: true, source: "legacy-bank" }),
    attempt("5", { difficulty: "Easy", correct: true, skill: "Circles", domain: "Geometry and Trigonometry" }),
    attempt("6", { correct: null }),
  ];
  const summary = Progress.stats(attempts);
  assert.equal(summary.attempted, 4);
  assert.equal(summary.correct, 2);
  assert.equal(summary.hintedCorrect, 1);
  assert.equal(summary.unanswered, 1);
  assert.equal(summary.legacy, 1);
  assert.equal(summary.accuracy, 0.5);
  assert.deepEqual(
    [summary.byDifficulty.Hard.attempted, summary.byDifficulty.Hard.correct, summary.byDifficulty.Hard.accuracy],
    [3, 1, 1 / 3],
  );
  assert.equal(summary.byDifficulty.Medium.accuracy, null);
  assert.equal(summary.bySkill["sat-math|Linear functions"].attempted, 3);
  assert.equal(summary.bySkill["sat-math|Circles"].accuracy, 1);
  assert.equal(Progress.stats(attempts, { includeLegacy: true }).byDifficulty.Hard.attempted, 4);
});

test("template attempts count under the current template's tier and flag revisions", () => {
  const attempts = [
    attempt("1", { templateId: "t1", templateVersion: 1, difficulty: "Hard", correct: true }),
    attempt("2", { templateId: "t2", difficulty: "Hard", correct: true }),
    attempt("3", { templateId: "gone", difficulty: "Hard", correct: false }),
    attempt("4", { source: "bank", sectionKey: "act-math", difficulty: "Hard", correct: true }),
  ];
  const current = { "sat-math": {
    t1: { difficulty: "Medium", domain: "Algebra", skill: "Linear functions", subskill: "slope", version: 1 },
    t2: { difficulty: "Hard", domain: "Advanced Math", skill: "Nonlinear functions", version: 3 },
  } };
  const retiered = Progress.withCurrentTemplates(attempts, current);
  assert.equal(retiered[0].difficulty, "Medium");
  assert.equal(retiered[0].updated, undefined);
  assert.equal(retiered[1].skill, "Nonlinear functions");
  assert.equal(retiered[1].updated, true, "a missing version is 1");
  assert.equal(retiered[2], attempts[2], "an unknown template keeps what it stored");
  assert.equal(retiered[3], attempts[3]);
  assert.equal(attempts[0].difficulty, "Hard", "the stored record is untouched");
  const summary = Progress.stats(retiered);
  assert.equal(summary.byDifficulty.Hard.attempted, 3);
  assert.equal(summary.byDifficulty.Medium.attempted, 1);
  assert.equal(summary.updated, 1);
  let progress = Progress.recordAttempts(Progress.empty({ epoch: "e1" }), [
    attempt("5", { questionId: "a", templateId: "t1", skill: "Old", correct: false }),
    attempt("6", { questionId: "b", templateId: "t1", skill: "Old", correct: false }),
  ]);
  const relabelled = Progress.stats(Progress.withCurrentTemplates(Progress.attemptsFor(progress, { sectionKey: "sat-math" }), current));
  assert.deepEqual(Object.keys(relabelled.bySkill), ["sat-math|Linear functions"], "answers count under the template's skill now");
  assert.equal(Progress.latestAttempts(progress, { sectionKey: "sat-math" }).get("b").id, "6");
});

test("missed ids follow each question's latest answer", () => {
  let progress = Progress.empty({ epoch: "e1" });
  progress = Progress.recordAttempts(progress, [
    attempt("1", { questionId: "sat-math:a:1", correct: false }),
    attempt("2", { questionId: "sat-math:a:1", correct: true }),
    attempt("3", { questionId: "sat-math:b:1", correct: false, answered: false }),
    attempt("4", { questionId: "act-english-0001", sectionKey: "act-english", test: "ACT", correct: false,
      source: "bank", skill: "Style" }),
    attempt("5", { questionId: "sat-math:c:1", skill: "Circles", correct: false }),
    attempt("6", { questionId: "sat-math:d:1", skill: "Circles", correct: false }),
    attempt("7", { questionId: "sat-math:e:1", correct: true }),
    attempt("8", { questionId: "sat-math:f:1", correct: true, hinted: true }),
  ]);
  assert.deepEqual(progress.attempts.map((entry) => entry.repeat), [false, true, false, false, false, false, false, false],
    "the second answer to a question is a repeat");
  assert.deepEqual(Progress.missedIds(progress, { test: "SAT" }), ["sat-math:b:1", "sat-math:c:1", "sat-math:d:1", "sat-math:f:1"],
    "a correct answer after a hint is a miss");
  assert.deepEqual(Progress.missedIds(progress, { sectionKey: "act-english" }), ["act-english-0001"]);
});

test("errors can be tagged and sessions recorded once", () => {
  let progress = Progress.empty({ epoch: "e1" });
  progress = Progress.tagError(progress, "a1", { reason: "careless", rule: "sign" }, 7);
  assert.deepEqual(progress.errorLog.a1, { reason: "careless", at: 7, rule: "sign" });
  assert.throws(() => Progress.tagError(progress, "a1", { reason: "bad luck" }));
  progress = Progress.tagError(progress, "a1", null);
  assert.deepEqual(progress.errorLog, {});
  const session = Progress.summarizeSession(
    { id: "s1", sectionKey: "sat-math", kind: "targeted", title: "SAT Math", runCode: "3-ab", startedAt: 1, finishedAt: 2 },
    [
      { question: { domain: "Algebra", difficulty: "Hard", sectionKey: "sat-math" }, answered: true, correct: true, hinted: true },
      { question: { domain: "Algebra", difficulty: "Easy", sectionKey: "sat-math" }, answered: false, correct: false },
    ],
    61_000,
  );
  assert.deepEqual(session.hard, { total: 1, correct: 1, hintedCorrect: 1 });
  assert.equal(session.hintedCorrect, 1);
  assert.deepEqual(session.byDomain, { Algebra: { total: 2, correct: 1 } });
  progress = Progress.recordSession(progress, session);
  progress = Progress.recordSession(progress, session);
  assert.equal(progress.sessions.length, 1);
});

test("normalize drops what it cannot read", () => {
  assert.equal(Progress.normalize({ version: 2 }), null);
  const progress = Progress.normalize({
    version: 3,
    epoch: "e9",
    attempts: [attempt("a1"), { id: 4 }, attempt("a1"), null],
    marked: ["q1", 5, "q1"],
    history: { "sat-math": { serve: "x", lastServed: { t1: 3, t2: -1 }, scenes: { t1: ["s", 2] }, mask: 7 } },
    sessions: [{ id: "s1" }, {}],
  });
  assert.deepEqual(progress.attempts.map((item) => item.id), ["a1"]);
  assert.deepEqual(progress.marked, ["q1"]);
  assert.deepEqual(progress.history["sat-math"], {
    serve: 3, lastServed: { t1: 3 }, scenes: { t1: ["s"] }, mask: "0", recentItems: [], recentScenes: ["s"],
  });
  assert.equal(progress.sessions.length, 1);
});

test("ids parse into section, template, and seed", () => {
  assert.deepEqual(Progress.parseQuestionId("sat-math:t1:ab.t1.0"),
    { sectionKey: "sat-math", templateId: "t1", seed: "ab.t1.0", legacy: false });
  assert.equal(Progress.parseQuestionId("sat-math-hard:fam:3").templateId, "fam");
  assert.equal(Progress.parseQuestionId("act-english-0001"), null);
  assert.equal(Progress.sectionOfId("act-english-0001"), "act-english");
  assert.equal(Progress.sectionOfId("sat-reading-writing-0575"), "sat-reading-writing");
  assert.equal(Progress.sourceOf({ id: "sat-math-0001", sectionKey: "sat-math" }), "legacy-bank");
});

test("a re-practice records the miss it re-practises, through saving and merging", () => {
  const fresh = {
    id: "sat-math:linear-slope:r9.linear-slope.1",
    templateId: "linear-slope",
    sectionKey: "sat-math",
    responseType: "multiple-choice",
    reviewOf: "sat-math:linear-slope:k2.linear-slope.0",
  };
  const attemptA = Progress.buildAttempt(fresh, { response: 2, correct: true }, { id: "s2:0", now: 10 });
  assert.equal(attemptA.reviewOf, "sat-math:linear-slope:k2.linear-slope.0");
  const plain = Progress.buildAttempt({ ...fresh, reviewOf: undefined }, { response: 2, correct: true },
    { id: "s2:1", now: 11 });
  assert.equal("reviewOf" in plain, false, "an ordinary answer carries no reviewOf");
  const storage = memoryStorage();
  const tabA = Progress.createStore(storage);
  const tabB = Progress.createStore(storage);
  tabA.update((progress) => Progress.recordAttempts(progress, [attemptA]));
  tabB.update((progress) => Progress.recordAttempts(progress, [plain]));
  const stored = Progress.normalize(JSON.parse(storage.getItem(Progress.STORAGE_KEY)));
  assert.deepEqual(stored.attempts.map((item) => [item.id, item.reviewOf]),
    [["s2:0", "sat-math:linear-slope:k2.linear-slope.0"], ["s2:1", undefined]]);
});

test("the built registries label answers without loading a template bundle", () => {
  const registries = {
    "sat-math": { sectionKey: "sat-math", templates: [
      { id: "t1", bit: 0, version: 2, difficulty: "Hard", domain: "Algebra", skill: "Linear functions", subskill: "slope" },
      { id: "t2", bit: 1, difficulty: "Easy", domain: "Algebra", skill: "Linear equations in one variable" },
      { id: "old", bit: 2, retired: true },
    ] },
    "sat-reading-writing": { sectionKey: "sat-reading-writing", templates: [] },
  };
  const info = Progress.registryTemplateInfo(registries);
  assert.deepEqual(info["sat-math"].t1,
    { difficulty: "Hard", domain: "Algebra", skill: "Linear functions", subskill: "slope", version: 2 });
  assert.equal(info["sat-math"].t2.version, 1, "a missing version is 1");
  assert.equal(info["sat-math"].old, undefined, "retired templates are left out");
  assert.deepEqual(info["sat-reading-writing"], {});
  assert.deepEqual(Progress.registryTemplateInfo(undefined), {});
  const [labelled] = Progress.withCurrentTemplates(
    [attempt("1", { templateId: "t1", templateVersion: 1, difficulty: "Medium", skill: "Old name" })], info);
  assert.equal(labelled.difficulty, "Hard");
  assert.equal(labelled.skill, "Linear functions");
  assert.equal(labelled.updated, true);
});

test("scenes seen outside a recorded run are noted without serving anything", () => {
  let progress = Progress.serveTemplates(Progress.empty({ epoch: "e1" }), "sat-reading-writing", {
    templateIds: ["t1"],
    scenes: { t1: "harbor" },
  });
  const noted = Progress.noteScenes(progress, "sat-reading-writing", { t1: ["orchard", "harbor", "orchard"], t2: ["mill"] });
  const history = Progress.historyFor(noted, "sat-reading-writing");
  assert.deepEqual(history.scenes, { t1: ["orchard", "harbor"], t2: ["mill"] }, "noted scenes count as the oldest");
  assert.equal(history.serve, 1);
  assert.deepEqual(history.lastServed, { t1: 1 });
  assert.equal(Progress.noteScenes(noted, "sat-reading-writing", { t1: ["harbor"], t3: [] }), noted,
    "nothing new returns the same record");
  assert.equal(Progress.noteScenes(progress, "sat-math", {}), progress);
  assert.deepEqual(Progress.historyFor(progress, "sat-reading-writing").scenes, { t1: ["harbor"] }, "the input is untouched");
});

test("official scores stay in date order, replace by id, and follow storage across tabs", () => {
  const storage = memoryStorage();
  const first = Progress.createStore(storage);
  const second = Progress.createStore(storage);
  first.update((progress) => Progress.addOfficialScore(progress, { id: "b", date: "2026-10-03", kind: "practice", math: 540 }));
  second.update((progress) => Progress.addOfficialScore(progress, { id: "a", date: "2026-09-12", kind: "sat", math: 500 }));
  assert.deepEqual(first.refresh().officialScores.map((score) => score.id), ["a", "b"]);
  first.update((progress) => Progress.addOfficialScore(progress, { id: "b", date: "2026-10-03", kind: "practice", math: 560 }));
  assert.deepEqual(second.refresh().officialScores.map((score) => [score.id, score.math]), [["a", 500], ["b", 560]]);
  // A removal in one tab is not brought back by the other's older copy.
  second.update((progress) => Progress.removeOfficialScore(progress, "a"));
  first.update((progress) => progress);
  assert.deepEqual(first.get().officialScores.map((score) => score.id), ["b"]);
  assert.equal(Progress.addOfficialScore(first.get(), { date: "2026-10-04" }), first.get(), "a score needs an id");
  assert.deepEqual(Progress.normalize({ version: 3, officialScores: [{ id: "x" }, "junk", { date: "2026-01-01" }] })
    .officialScores, [{ id: "x" }]);
});

test("repeat answers are flagged once and left out of accuracy", () => {
  // Older records get the flag from their order in time.
  const normalized = Progress.normalize(Object.assign(Progress.empty({ epoch: "e1" }), {
    attempts: [
      attempt("late", { questionId: "sat-math:a:1", timestamp: 3000, correct: true }),
      attempt("early", { questionId: "sat-math:a:1", timestamp: 1000, correct: false }),
      attempt("other", { questionId: "sat-math:b:1", timestamp: 2000 }),
    ],
  }));
  assert.deepEqual(normalized.attempts.map((entry) => [entry.id, entry.repeat]),
    [["late", true], ["early", false], ["other", false]]);
  const summary = Progress.stats(normalized.attempts);
  assert.deepEqual([summary.attempted, summary.correct, summary.repeats], [2, 1, 1]);
  assert.equal(Progress.stats(normalized.attempts, { includeRepeats: true }).attempted, 3);
  // A merge can bring together two first-answer claims; only one survives.
  const kept = Progress.normalize(Object.assign(Progress.empty({ epoch: "e1" }), {
    attempts: [attempt("x", { questionId: "sat-math:a:1", repeat: false }), attempt("y", { questionId: "sat-math:a:1", repeat: false })],
  }));
  assert.deepEqual(kept.attempts.map((entry) => entry.repeat), [false, true]);
});

test("deleting an error tag survives a stale tab's refresh and next save", () => {
  const storage = memoryStorage();
  const first = Progress.createStore(storage);
  first.update((progress) => Progress.tagError(progress, "a1", { reason: "time" }, 1));
  const stale = Progress.createStore(storage);
  first.update((progress) => Progress.tagError(progress, "a1", null));
  assert.deepEqual(stale.refresh().errorLog, {});
  stale.update((progress) => Progress.setMarked(progress, "q1", true));
  assert.deepEqual(Progress.load(storage).progress.errorLog, {});
});

test("failed tag additions and removals are retried without losing the local edit", () => {
  const storage = memoryStorage();
  const store = Progress.createStore(storage);
  store.update((progress) => Progress.recordAttempts(progress, [attempt("a1")]));
  storage.full = true;
  store.update((progress) => Progress.tagError(progress, "a1", { reason: "time" }, 1));
  assert.equal(store.refresh().errorLog.a1.reason, "time");
  storage.full = false;
  store.update((progress) => progress);
  assert.equal(Progress.load(storage).progress.errorLog.a1.reason, "time");
  storage.full = true;
  store.update((progress) => Progress.tagError(progress, "a1", null));
  assert.deepEqual(store.refresh().errorLog, {});
  storage.full = false;
  store.update((progress) => progress);
  assert.deepEqual(Progress.load(storage).progress.errorLog, {});
});

test("migration and merging keep one first answer, including after older attempts were trimmed", () => {
  const migrated = Progress.migrate({ version: 2, attempts: [
    { questionId: "act-reading-0001", timestamp: 1, correct: false },
    { questionId: "act-reading-0001", timestamp: 2, correct: true },
  ] });
  assert.deepEqual(migrated.attempts.map((entry) => entry.repeat), [false, true]);
  assert.equal(Progress.stats(migrated.attempts).accuracy, 0);
  const record = (entry) => Progress.recordAttempts(Progress.empty({ epoch: "same" }), [entry]);
  const first = record(attempt("first", { questionId: "q", timestamp: 1, correct: false }));
  const late = record(attempt("late", { questionId: "q", timestamp: 2, correct: true }));
  const merged = Progress.merge(late, first);
  assert.deepEqual(merged.attempts.map((entry) => [entry.id, entry.repeat]), [["first", false], ["late", true]]);
  assert.equal(Progress.stats(merged.attempts).accuracy, 0);
  const retained = [attempt("repeat", { repeat: true })];
  assert.equal(Progress.markRepeats(retained), retained, "a pruned predecessor does not turn a repeat into a first answer");
});

test("old Writing records keep completion without draft text or scored outcomes", () => {
  const writing = { id: "essay", questionId: "act-writing-0001", response: "Private essay", correct: false, timestamp: 1 };
  const normalized = Progress.normalize(Object.assign(Progress.empty(), { attempts: [writing,
    { ...writing, id: "blank", questionId: "act-writing-0002", response: "", answered: false },
    { ...writing, id: "math", questionId: "act-mathematics-0001", response: 2, answered: true },
  ] }));
  assert.deepEqual(normalized.attempts.map((entry) => [entry.answered, entry.correct, entry.response]),
    [[true, null, "[local essay draft]"], [false, null, null], [true, false, 2]]);
  assert.equal(writing.response, "Private essay");
  const migrated = Progress.migrate({ version: 2, attempts: [writing] });
  assert.equal(migrated.attempts[0].response, "[local essay draft]");
  assert.equal(Progress.stats(migrated.attempts).attempted, 0);
});

test("essay summaries keep question counts without adding a scored answer", () => {
  const session = Progress.summarizeSession({ id: "essay" }, [{
    question: { id: "act-writing-0001", sectionKey: "act-writing", responseType: "essay", difficulty: "Hard" },
    correct: null, answered: true,
  }], 2000);
  assert.deepEqual([session.total, session.scored, session.unscored, session.correct], [1, 0, 1, 0]);
  assert.equal(session.hard.total, 0);
});

test("fixed-bank answers keep the content identity of the question actually shown", () => {
  const question = { id: "act-mathematics-0007", sectionKey: "act-mathematics", responseType: "multiple-choice",
    stem: "Choose two.", choices: ["2", "3", "4", "5"], correctAnswer: 0,
    stimulus: { type: "passage", content: "Original passage." }, difficulty: "Hard" };
  const record = Progress.buildAttempt(question, { response: 0, correct: true }, { id: "old", now: 1 });
  assert.match(record.contentIdentity, /^q1-[0-9a-f]{16}$/);
  assert.equal(Progress.questionMatchesAttempt(JSON.parse(JSON.stringify(question)), record), true);
  assert.equal(Progress.questionMatchesAttempt({ ...question, difficulty: "Medium", contentVersion: "next" }, record), true);
  assert.equal(Progress.questionMatchesAttempt({ ...question, choices: ["4", "3", "2", "5"], correctAnswer: 2 }, record), false);
  assert.equal(Progress.questionMatchesAttempt({ ...question, stimulus: { content: "Revised passage.", type: "passage" } }, record), false);
  assert.equal(Progress.questionMatchesAttempt(question, { ...record, contentIdentity: undefined }), false);
  assert.equal(Progress.questionMatchesAttempt({ ...question, id: "another" }, record), false);
  assert.equal(Progress.stats([record]).accuracy, 1, "content updates never regrade the recorded outcome");
});

test("resumed bank snapshots retain the original key and essay draft across content changes", () => {
  const Engine = require("../src/lib/test-engine");
  const old = { id: "act-mathematics-0007", sectionKey: "act-mathematics", responseType: "multiple-choice",
    stem: "Old question", choices: ["right", "wrong"], correctAnswer: 0 };
  const essay = { id: "act-writing-0001", sectionKey: "act-writing", responseType: "essay", stem: "Old prompt" };
  let state = Engine.createState({ questions: [old, essay] }, 0);
  state = Engine.select(state, 0, 0);
  state = Engine.select(state, "My saved draft", 1);
  const saved = JSON.parse(JSON.stringify(Engine.serialize(state, 5)));
  old.correctAnswer = 1;
  old.choices.reverse();
  essay.stem = "Revised prompt";
  const restored = Engine.restoreState(saved, 10);
  const result = Engine.result(Engine.finish(restored, 20), 20);
  const records = result.items.map((item, index) => Progress.buildAttempt(item.question, item, { id: String(index), now: 20 }));
  assert.equal(result.items[0].correct, true);
  assert.equal(Progress.questionMatchesAttempt(old, records[0]), false);
  assert.equal(restored.responses[1], "My saved draft");
  assert.equal(restored.questions[1].stem, "Old prompt");
  assert.equal(records[1].response, "[local essay draft]", "durable progress still redacts draft text");
});

test("historical template choices require the matching stored version", () => {
  const question = { id: "sat-math:linear:seed", templateId: "linear", templateVersion: 2 };
  const attempt = { questionId: question.id, templateVersion: 2 };
  assert.equal(Progress.questionMatchesAttempt(question, attempt), true);
  assert.equal(Progress.questionMatchesAttempt(question, { ...attempt, templateVersion: 1 }), false);
  assert.equal(Progress.questionMatchesAttempt(question, { ...attempt, templateVersion: undefined }), false);
});

test("each test keeps its own plan; an older shared plan becomes both", () => {
  const legacy = Progress.normalize(Object.assign(Progress.empty({ epoch: "e1" }), { plan: { testDate: "2026-11-07", weeklyQuestions: 150 } }));
  assert.deepEqual(legacy.plan, { SAT: { testDate: "2026-11-07", weeklyQuestions: 150 }, ACT: { testDate: "2026-11-07", weeklyQuestions: 150 } });
  const act = Progress.setPlan(legacy, { weeklyQuestions: 60, testDate: undefined }, "ACT");
  assert.deepEqual(Progress.planFor(act, "SAT"), { testDate: "2026-11-07", weeklyQuestions: 150 });
  assert.deepEqual(JSON.parse(JSON.stringify(Progress.planFor(act, "ACT"))), { weeklyQuestions: 60 });
  assert.deepEqual(Progress.planFor(Progress.empty(), "SAT"), {});
});
