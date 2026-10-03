"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const Progress = require("../src/lib/progress");

// Exercise the release policy independently of the catalog's admission flag:
// authoring can keep the section paused until content acceptance is complete.
const catalog = structuredClone(require("../content/catalog.json"));
Object.assign(catalog.sections.find((section) => section.key === "act-science"), {
  practiceAvailable: true, activeQuestionIdMin: 576,
});
const context = vm.createContext({ PRACTICE_CATALOG: catalog, LiminalProgress: Progress });
for (const file of ["core", "review-queue"]) {
  vm.runInContext(fs.readFileSync(require.resolve(`../src/lib/${file}`), "utf8"), context);
}
const core = context.PracticeCore;
const Queue = context.LiminalReviewQueue;

function inventory() {
  let number = 576;
  let passage = 1;
  return [["data-representation", 4, 5], ["research-summaries", 8, 6], ["conflicting-viewpoints", 2, 6]]
    .flatMap(([type, sets, size]) => Array.from({ length: sets }, () => {
      const passageId = `act-science-p${String(passage++).padStart(3, "0")}`;
      return Array.from({ length: size }, (_, index) => ({
        id: `act-science-${String(number++).padStart(4, "0")}`, sectionKey: "act-science", test: "ACT", section: "Science",
        passageId, stimulus: { type, content: `${passageId}: original data and context.` },
        responseType: "multiple-choice", stem: `Question ${index + 1}`, choices: ["A", "B", "C", "D"],
        correctAnswer: index % 4, difficulty: "Medium", domain: `Domain ${index % 3}`, skill: `Skill ${index % 2}`,
      }));
    })).flat();
}
const active = inventory();
const archived = { ...active[0], id: "act-science-0001", passageId: null, stimulus: { type: "table", content: "Archived data." } };
const ids = (items) => Array.from(items, (question) => question.id);
const groups = (items) => {
  const result = new Map();
  items.forEach((question) => result.set(question.passageId, [...(result.get(question.passageId) || []), question]));
  return result;
};
function assertContiguous(items) {
  const seen = new Set();
  let previous = null;
  items.forEach((question) => {
    if (question.passageId !== previous) {
      assert.equal(seen.has(question.passageId), false, `${question.passageId} was split`);
      seen.add(question.passageId);
      previous = question.passageId;
    }
  });
}

test("reopened Science excludes archive IDs and malformed snapshots without changing historical identity", () => {
  const attempt = Progress.buildAttempt(archived, { response: 0, correct: true }, { id: "archive", now: 1 });
  const before = JSON.stringify(attempt);
  assert.equal(core.questionAvailable(active[0]), true);
  assert.equal(core.questionAvailable(active[0].id), true);
  assert.equal(core.questionAvailable(archived), false);
  assert.equal(core.questionAvailable(archived.id), false);
  assert.equal(core.questionAvailable({ ...archived, passageId: active[0].passageId }), false);
  assert.equal(core.questionAvailable({ ...archived, sectionKey: "act-reading" }), false);
  assert.equal(core.questionAvailable({ sectionKey: "act-science" }), false);
  assert.equal(core.questionAvailable({ id: "act-science-0576-extra", sectionKey: "act-science" }), false);
  const mixed = [archived, ...active, { sectionKey: "act-science" }];
  for (const picked of [core.filterQuestions(mixed, {}), core.buildSession(mixed, "all", "archive"),
    core.drawSectionItems(mixed, 40, "archive"), core.drawPassageSets(mixed, 10, "archive")]) {
    assert.ok(picked.length > 0);
    assert.ok(picked.every((question) => core.questionAvailable(question)));
  }
  assert.equal(core.scoreResponse(archived, 0), true);
  assert.equal(Progress.questionMatchesAttempt(archived, attempt), true);
  assert.equal(JSON.stringify(attempt), before);
  const changedPassage = { ...archived, stimulus: { ...archived.stimulus, content: "Revised data." } };
  assert.equal(Progress.questionMatchesAttempt(changedPassage, attempt), false);
  const changedFigure = { ...archived, figure: { svg: "<svg viewBox=\"0 0 10 10\"></svg>", alt: "Revised figure." } };
  assert.equal(Progress.questionMatchesAttempt(changedFigure, attempt), false);
});

test("Science minis use one complete data set and full forms use the seven-set mix", () => {
  for (let seed = 0; seed < 24; seed += 1) {
    const mini = core.drawSectionItems([archived, ...active], 5, `form-${seed}`);
    assert.equal(mini.length, 5);
    assert.equal(groups(mini).size, 1);
    assert.ok(mini.every((question) => question.stimulus.type === "data-representation"));
    const full = core.drawSectionItems([archived, ...active], 40, `form-${seed}`);
    assert.equal(full.length, 40);
    assert.equal(new Set(ids(full)).size, 40);
    assertContiguous(full);
    const sets = groups(full);
    assert.equal(sets.size, 7);
    const counts = {};
    for (const items of sets.values()) {
      const type = items[0].stimulus.type;
      counts[type] = (counts[type] || 0) + 1;
      assert.equal(items.length, type === "data-representation" ? 5 : 6);
      assert.deepEqual(ids(items), ids(items).sort());
    }
    assert.deepEqual(counts, { "data-representation": 2, "research-summaries": 4, "conflicting-viewpoints": 1 });
    assert.deepEqual(ids(full), ids(core.drawSectionItems(active, 40, `form-${seed}`)));
  }
  assert.notDeepEqual(ids(core.drawSectionItems(active, 40, "one")), ids(core.drawSectionItems(active, 40, "two")));
});

test("Science form exclusions remove whole sets and never backfill malformed or incomplete sets", () => {
  const blocked = new Set([active[0].id]);
  const full = core.drawSectionItems(active, 40, "excluded", blocked);
  assert.equal(full.length, 40);
  assert.ok(full.every((question) => question.passageId !== active[0].passageId));
  const withoutData = active.filter((question) => question.stimulus.type !== "data-representation");
  assert.equal(core.drawSectionItems(withoutData, 5, "short").length, 0);
  assert.equal(core.drawSectionItems(withoutData, 40, "short").length, 30);
  const partial = active.filter((question) => question.passageId !== active[0].passageId || question.id !== active[0].id);
  const picked = core.drawSectionItems(partial, 40, "partial");
  assert.ok(picked.every((question) => question.passageId !== active[0].passageId));
});

test("Science practice prefers whole sets and moves an entire used passage behind fresh ones", () => {
  for (const count of [10, 11, 12, 40, 80]) {
    const picked = core.buildSession(active, count, `practice-${count}`);
    assert.equal(picked.length, count);
    assertContiguous(picked);
    for (const [passageId, items] of groups(picked)) {
      assert.equal(items.length, active.filter((question) => question.passageId === passageId).length);
    }
  }
  const usedPassage = active[0].passageId;
  const picked = core.buildSession(active, 10, "recency", { avoidIds: [active[0].id] });
  assert.equal(picked.length, 10);
  assert.ok(picked.every((question) => question.passageId !== usedPassage));
  const all = core.buildSession(active, "all", "recency", { avoidIds: [active[0].id] });
  assert.equal(all.length, 80);
  assertContiguous(all);
  assert.ok(all.slice(-5).every((question) => question.passageId === usedPassage));
});

test("targeted Science practice fills arbitrary counts while retaining full context and passage grouping", () => {
  const filtered = core.filterQuestions(active, { skills: ["Skill 1"] });
  const picked = core.buildSession(filtered, 7, "targeted");
  assert.equal(picked.length, 7);
  assertContiguous(picked);
  assert.ok(picked.every((question) => question.skill === "Skill 1" && question.stimulus.content));
  const regrouped = core.groupScienceQuestions([active[2], active[7], active[0], active[5]]);
  assert.deepEqual(ids(regrouped), [active[0].id, active[2].id, active[5].id, active[7].id]);
});

test("only active Science misses re-enter the due queue after the section reopens", () => {
  const attempts = [archived, active[0]].map((question, index) =>
    Progress.buildAttempt(question, { response: 1, correct: false }, { id: `miss-${index}`, now: 1 }));
  const entries = Queue.build(attempts);
  const summary = Queue.summarize(entries, Date.now());
  assert.equal(summary.unavailable.length, 1);
  assert.equal(summary.unavailable[0].questionId, archived.id);
  assert.equal(summary.due.length, 1);
  assert.equal(summary.due[0].questionId, active[0].id);
  assert.equal(Queue.pickSet([...entries.values()]).picked.length, 1);
  assert.equal(Queue.missedAttempts(attempts).length, 2);
});
