"use strict";

// The plan ledger (Progress planLedger, Analytics.planState's checkpoint):
// the plan survives the record's cap on attempts, the ledger normalises,
// merges across tabs and round-trips through export, import and restore;
// with the review fixes for check order, a skill that slipped outside the
// plan, and fields from a newer build.

const test = require("node:test");
const assert = require("node:assert/strict");
const Analytics = require("../src/lib/analytics");
const Progress = require("../src/lib/progress");
const IO = require("../src/lib/progress-io");
const catalog = require("../content/catalog.json");

const HOUR = 60 * 60 * 1000;
const mathSection = catalog.sections.find((section) => section.key === "sat-math");
const PLAN = Analytics.PLANS["sat-math"];
const planSkills = PLAN.stages.flatMap((stage) => stage.skills);
const trackA = PLAN.stages.filter((stage) => stage.stage <= 2).flatMap((stage) => stage.skills);
const trackB = PLAN.stages.filter((stage) => stage.stage >= 3).flatMap((stage) => stage.skills);
const domainOf = (skill) => mathSection.domains.find((domain) => Object.keys(domain.skills).includes(skill)).name;

let clock = new Date(2026, 0, 5, 8).getTime();
let counter = 0;
function answer(skill, fields) {
  counter += 1;
  clock += 3 * HOUR;
  return Object.assign({
    id: `l${counter}`, questionId: `sat-math:d${counter % 3}-${skill.length}:s${counter}`, templateId: `d${counter % 3}-${skill.length}`,
    sectionKey: "sat-math", test: "SAT", domain: domainOf(skill), skill, difficulty: "Medium", source: "template",
    correct: true, answered: true, hinted: false, timestamp: clock,
  }, fields);
}
const answers = (count, skill, fields) => Array.from({ length: count }, () => answer(skill, fields));

function planOf(list, ledger, extra) {
  const rows = Analytics.skillMap(list, [mathSection]);
  return Analytics.planState(rows, Object.assign({ sectionKey: "sat-math", attempts: list, ledger, now: clock + HOUR }, extra));
}
const shape = (plan) => ({
  pass: plan.pass, inFlight: plan.tracks.map((track) => track.inFlight), departures: plan.departures,
  firstAnswerAt: plan.firstAnswerAt, firstPassLeft: plan.firstPassLeft, started: plan.started,
  skills: Object.values(plan.skills).map((entry) => [entry.skill, entry.status, entry.spent, entry.pass, entry.entry, entry.movedOn,
    entry.leftBy, entry.started, entry.reachedTarget]),
});

// A long history: every other skill reaches its target, the rest move on
// by budget, then the second pass practises the moved-on ones to target.
function longHistory() {
  const list = [];
  const order = [];
  for (let index = 0; index < Math.max(trackA.length, trackB.length); index += 1) {
    if (trackA[index]) order.push(trackA[index]);
    if (trackB[index]) order.push(trackB[index]);
  }
  order.forEach((skill, index) => list.push(...answers(index % 2 ? 40 : 30, skill, { correct: !(index % 2) })));
  order.filter((_, index) => index % 2).forEach((skill) => list.push(...answers(30, skill)));
  return Progress.markRepeats(list);
}

test("the plan survives the cap on attempts: the ledger carries passes, budgets and departures", () => {
  const all = longHistory();
  const cap = 150;
  let record = Progress.empty({ epoch: "e" });
  let retained = [];
  let lastDepartures = 0;
  let lastPass = 1;
  let fromLedger = 0;
  for (let start = 0; start < all.length; start += 10) {
    // A set of ten answers saved: the ledger refreshed, then the record capped.
    const inMemory = retained.concat(all.slice(start, start + 10));
    const plan = planOf(inMemory, record.planLedger["sat-math"]);
    if (plan.fromLedger) fromLedger += 1;
    assert.ok(plan.departures.length >= lastDepartures && plan.pass >= lastPass, `nothing goes backward at answer ${start}`);
    lastDepartures = plan.departures.length;
    lastPass = plan.pass;
    record = Progress.normalize(Progress.setPlanLedger(record, "sat-math", plan.checkpoint));
    retained = inMemory.slice(-cap);
  }
  assert.ok(fromLedger > 50, "most saves came after the cap");
  const full = shape(planOf(all));
  assert.ok(full.pass >= 2);
  assert.ok(full.departures.length >= 19);
  assert.deepEqual(shape(planOf(retained, record.planLedger["sat-math"])), full, "the capped record plus its ledger is the full plan");
  const without = shape(planOf(retained));
  assert.notDeepEqual(without, full, "without the ledger, trimming rewrites the plan");
  // The ledger stays small: bounded departures and 30-answer windows.
  assert.ok(JSON.stringify(record.planLedger).length < 40000);
  assert.equal(Progress.LIMITS.planWindow, Analytics.GATE.window);
  assert.equal(Progress.LIMITS.planDepartures, Analytics.LEDGER_DEPARTURES);
});

test("while the attempts still reach back to the ledger's start, the plan is replayed in full", () => {
  const list = Progress.markRepeats(answers(40, trackA[0], { correct: false }));
  const plan = planOf(list);
  assert.equal(plan.fromLedger, false);
  assert.deepEqual([plan.checkpoint.version, plan.checkpoint.from, plan.checkpoint.at, plan.checkpoint.pass],
    [1, list[0].timestamp, list[list.length - 1].timestamp, 1]);
  // A stale or foreign ledger does not override a full history.
  const stale = Object.assign({}, plan.checkpoint, { from: list[0].timestamp, pass: 9 });
  assert.equal(planOf(list, stale).pass, 1);
  assert.equal(planOf(list, stale).fromLedger, false);
  // Without attempts there is no checkpoint.
  assert.equal(Analytics.planState(Analytics.skillMap([], [mathSection]), { sectionKey: "sat-math" }).checkpoint, null);
});

test("the ledger normalises, keeps the later checkpoint across tabs, and round-trips through files", () => {
  const plan = planOf(Progress.markRepeats(answers(40, trackA[0], { correct: false })));
  const entry = plan.checkpoint;
  // Normalising keeps a readable checkpoint and drops what is not.
  const cleaned = Progress.cleanPlanLedger({ "sat-math": entry, "act-english": entry, "sat-reading-writing": { version: 2 } });
  assert.deepEqual(Object.keys(cleaned), ["sat-math"]);
  assert.deepEqual(cleaned["sat-math"], JSON.parse(JSON.stringify(entry)));
  const broken = JSON.parse(JSON.stringify(entry));
  broken.skills[trackA[0]].medium.push([2, "x", "y"], "junk");
  broken.departures.push({ skill: 3 });
  const fixed = Progress.cleanPlanLedger({ "sat-math": broken })["sat-math"];
  assert.equal(fixed.skills[trackA[0]].medium.length, entry.skills[trackA[0]].medium.length);
  assert.equal(fixed.departures.length, entry.departures.length);
  assert.deepEqual(Progress.cleanPlanLedger({ "sat-math": Object.assign({}, entry, { at: entry.from - 1 }) }), {});
  assert.deepEqual(Progress.normalize({ version: 3 }).planLedger, {}, "an older record has none");
  // setPlanLedger: an older checkpoint changes nothing.
  let record = Progress.setPlanLedger(Progress.empty({ epoch: "e" }), "sat-math", entry);
  assert.equal(Progress.setPlanLedger(record, "sat-math", Object.assign({}, entry, { at: entry.at - 1 })), record);
  assert.equal(Progress.setPlanLedger(record, "sat-math", entry), record, "the same checkpoint changes nothing");
  // Two tabs: the later checkpoint wins.
  const memory = new Map();
  const storage = { getItem: (key) => (memory.has(key) ? memory.get(key) : null), setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key) };
  const first = Progress.createStore(storage);
  const second = Progress.createStore(storage);
  first.update((progress) => Progress.setPlanLedger(progress, "sat-math", entry));
  const later = Object.assign({}, entry, { at: entry.at + HOUR, pass: 2 });
  second.update((progress) => Progress.setPlanLedger(progress, "sat-math", later));
  // The first tab still holds the older checkpoint in memory; its next save merges, and the later one stays.
  assert.equal(first.get().planLedger["sat-math"].pass, 1);
  first.update((progress) => Progress.setMarked(progress, "sat-math:a:1", true));
  assert.equal(Progress.load(storage).progress.planLedger["sat-math"].pass, 2, "a stale tab cannot put an older checkpoint back");
  assert.equal(Progress.mergePlanLedger({ "sat-math": later }, { "sat-math": entry })["sat-math"].pass, 2);
  assert.equal(Progress.mergePlanLedger({ "sat-math": entry }, { "sat-math": later })["sat-math"].pass, 2);
  // Export, import (merge: the later wins; replace: the file's).
  record = Progress.setPlanLedger(Progress.empty({ epoch: "e1" }), "sat-math", later);
  const parsed = IO.parseImport(IO.exportFile(record, 1).text);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.progress.planLedger, record.planLedger);
  const here = Progress.setPlanLedger(Progress.empty({ epoch: "e2" }), "sat-math", entry);
  assert.equal(IO.mergeImport(here, parsed.progress).progress.planLedger["sat-math"].at, later.at);
  assert.equal(IO.mergeImport(parsed.progress, here).progress.planLedger["sat-math"].at, later.at);
  assert.deepEqual(IO.replaceWith(parsed.progress, "e3").planLedger, record.planLedger);
});

test("fields from a newer build survive this build's normalise, saves and merges", () => {
  const future = { kept: [1, 2], note: "added later" };
  assert.deepEqual(Progress.normalize({ version: 3, futureField: future }).futureField, future);
  assert.equal(Progress.normalize({ version: 3, ["__proto__"]: { polluted: true } }).polluted, undefined);
  const memory = new Map([[Progress.STORAGE_KEY, JSON.stringify(Object.assign(Progress.empty({ epoch: "e" }), { futureField: future }))]]);
  const storage = { getItem: (key) => (memory.has(key) ? memory.get(key) : null), setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key) };
  const store = Progress.createStore(storage);
  store.update((progress) => Progress.setMarked(progress, "sat-math:a:1", true));
  assert.deepEqual(JSON.parse(memory.get(Progress.STORAGE_KEY)).futureField, future, "a save from this build keeps it");
  const parsed = IO.parseImport(IO.exportFile(store.get(), 1).text);
  assert.deepEqual(parsed.progress.futureField, future, "and an export carries it");
});

test("official checks are replayed by the date the student took them, then when recorded", () => {
  const skill = trackA[0];
  const target = Progress.markRepeats(answers(30, skill));
  const day = (offset) => Analytics.formatDate(new Date(clock + offset * 24 * HOUR));
  const recorded = clock + 30 * 24 * HOUR;
  // Today, a recent good check, then a back-filled older low one.
  const fresh = { id: "c-new", sectionKey: "sat-math", skill, difficulty: "Medium", attempted: 10, correct: 9, date: day(2), at: recorded };
  const old = { id: "c-old", sectionKey: "sat-math", skill, difficulty: "Medium", attempted: 10, correct: 3, date: day(1), at: recorded + 60000 };
  [[fresh, old], [old, fresh]].forEach((checks) => {
    const plan = planOf(target, null, { officialChecks: checks, now: recorded + HOUR });
    assert.equal(plan.skills[skill].check.id, "c-new", "the plan's latest is Progress's latest");
    assert.equal(Analytics.checksBySkill(checks).get(`sat-math|${skill}`).latest.id, "c-new");
    assert.equal(plan.skills[skill].official, "confirmed");
  });
  // Every skill at its target with the same two checks: no pass sends it back as "official-low".
  const allAtTarget = Progress.markRepeats(planSkills.flatMap((name) => answers(30, name)));
  const later = [Object.assign({}, fresh, { date: day(2) }), Object.assign({}, old, { date: day(1) })];
  const plan = planOf(allAtTarget, null, { officialChecks: later, now: clock + 3 * 24 * HOUR });
  assert.deepEqual(plan.tracks.map((track) => track.inFlight), [null, null]);
  assert.equal(plan.skills[skill].official, "confirmed");
  // Of two checks on one day, the one recorded later counts.
  const sameDay = [Object.assign({}, fresh, { date: day(1) }), Object.assign({}, old, { date: day(1) })];
  assert.equal(planOf(target, null, { officialChecks: sameDay, now: recorded + HOUR }).skills[skill].check.id, "c-old");
});

test("a skill that met its target on its own and slipped comes back as slipped, not passed over", () => {
  const X = "Linear inequalities";
  const Y = "Probability";
  const list = answers(30, X);
  planSkills.filter((skill) => skill !== X).forEach((skill) => list.push(...answers(skill === Y ? 40 : 30, skill, { correct: skill !== Y })));
  list.push(...answers(10, X, { correct: false }));
  const plan = planOf(Progress.markRepeats(list));
  assert.equal(plan.pass, 2);
  assert.deepEqual([plan.skills[X].status, plan.skills[X].entry, plan.skills[X].reachedTarget], ["in-flight", "slipped", true]);
  assert.equal(plan.departures.some((entry) => entry.skill === X && entry.pass === 1), false, "it never flew in the first pass");
  // A skill the diagnostic passed over is still "passed-over".
  const placed = [...answers(30, "Equivalent expressions")];
  planSkills.filter((skill) => !trackA.includes(skill) && skill !== "Equivalent expressions")
    .forEach((skill) => placed.push(...answers(30, skill)));
  const second = planOf(Progress.markRepeats(placed), null, { placement: { stage: 3 } });
  assert.deepEqual([second.pass, second.tracks[0].inFlight, second.skills[trackA[0]].entry], [2, trackA[0], "passed-over"]);
});

// The app's own save pattern (app.js update): a drill saves each answer as
// it is checked, before its session exists, and the session at the end;
// every save refreshes the ledger, then the record keeps only the newest
// `cap` answers. The plan must match the full replay, and budgets must keep
// being spent after the record trims.
function appPattern(withSetKind) {
  const cap = 40;
  const memory = new Map();
  const storage = { getItem: (key) => (memory.has(key) ? memory.get(key) : null), setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key) };
  const limits = Object.assign({}, Progress.LIMITS);
  Progress.LIMITS.attempts = cap;
  Progress.LIMITS.attemptsWhenFull = cap;
  try {
    const store = Progress.createStore(storage);
    const all = { attempts: [], sessions: [] };
    const withLedger = (progress) => {
      const plan = planOf(progress.attempts, progress.planLedger["sat-math"], { sessions: progress.sessions });
      return Progress.setPlanLedger(progress, "sat-math", plan.checkpoint);
    };
    let serial = 0;
    const departures = [];
    for (let set = 0; set < 16; set += 1) {
      const progress = store.get();
      const plan = planOf(progress.attempts, progress.planLedger["sat-math"], { sessions: progress.sessions });
      departures.push(plan.departures.length);
      const track = plan.tracks[set % 2];
      const skill = track.inFlight;
      const id = `set${serial += 1}`;
      for (let index = 0; index < 10; index += 1) {
        const item = answer(skill, Object.assign({ correct: index % 4 === 0, difficulty: "Easy", sessionId: id },
          withSetKind ? { setKind: "drill", setSkill: skill } : {}));
        all.attempts.push(item);
        store.update((current) => withLedger(Progress.recordAttempts(current, [item])));
      }
      const session = { id, kind: "drill", skill, step: "drill", sectionKey: "sat-math", finishedAt: clock + 1 };
      all.sessions.push(session);
      store.update((current) => withLedger(Progress.recordSession(current, session)));
    }
    const kept = store.get();
    return {
      kept,
      departures,
      capped: shape(planOf(kept.attempts, kept.planLedger["sat-math"], { sessions: kept.sessions })),
      full: shape(planOf(Progress.markRepeats(all.attempts), undefined, { sessions: all.sessions })),
    };
  } finally {
    Object.assign(Progress.LIMITS, limits);
  }
}

test("answers saved one by one before their drill's session still spend budgets after the record trims", () => {
  [true, false].forEach((withSetKind) => {
    const run = appPattern(withSetKind);
    assert.equal(run.kept.attempts.length, 40, "the record is capped");
    assert.deepEqual(run.capped, run.full, withSetKind ? "answers naming their set" : "older answers without it");
    assert.ok(run.full.departures.length >= 4, "skills keep leaving flight on their budgets");
    run.departures.forEach((count, index) => assert.ok(index === 0 || count >= run.departures[index - 1], "never backward"));
    assert.ok(run.departures[run.departures.length - 1] > run.departures[6], "departures continue after the trim");
  });
  // An answer names its set when the app records it.
  const record = Progress.buildAttempt({ id: "sat-math:t:1", sectionKey: "sat-math", templateId: "t", skill: "Circles",
    responseType: "numeric" }, { response: "1", correct: true }, { id: "a", setKind: "drill", setSkill: "Circles", now: 1 });
  assert.deepEqual([record.setKind, record.setSkill], ["drill", "Circles"]);
});
