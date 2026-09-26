"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Progress = require("../src/lib/progress");

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
  assert.deepEqual(empty, { serve: 0, lastServed: {}, scenes: {}, mask: "0" });
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
  assert.equal(Progress.weakestSkill(progress, { sectionKey: "sat-math" }, { current }).skill, "Linear functions");
  assert.equal(Progress.latestAttempts(progress, { sectionKey: "sat-math" }).get("b").id, "6");
});

test("missed ids follow each question's latest answer; weakest skill needs evidence", () => {
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
  const weakest = Progress.weakestSkill(progress, { sectionKey: "sat-math" });
  assert.equal(weakest.skill, "Circles");
  assert.equal(Progress.weakestSkill(progress, { sectionKey: "act-english" }), null, "one answer is not enough");
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
  assert.deepEqual(session.hard, { total: 1, correct: 1 });
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
  assert.deepEqual(progress.history["sat-math"], { serve: 3, lastServed: { t1: 3 }, scenes: { t1: ["s"] }, mask: "0" });
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
  // A stored flag is kept as it is.
  const kept = Progress.normalize(Object.assign(Progress.empty({ epoch: "e1" }), {
    attempts: [attempt("x", { questionId: "sat-math:a:1", repeat: false }), attempt("y", { questionId: "sat-math:a:1", repeat: false })],
  }));
  assert.deepEqual(kept.attempts.map((entry) => entry.repeat), [false, false]);
});
