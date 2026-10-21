"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Analytics = require("../src/lib/analytics");
const Progress = require("../src/lib/progress");
const IO = require("../src/lib/progress-io");
const catalog = require("../content/catalog.json");
const section = catalog.sections.find((entry) => entry.key === "sat-math");
const GEOMETRY = "Lines, angles, and triangles";
const ADVANCED = "Equivalent expressions";
const ALGEBRA = "Linear equations in one variable";
const MINUTE = 60000;
const DAY = 24 * 60 * MINUTE;
const START = new Date(2026, 0, 5, 8).getTime();
const domainOf = (skill) => section.domains.find((domain) => Object.hasOwn(domain.skills, skill)).name;
let serial = 0;

function answers(skill, count, at, fields) {
  return Array.from({ length: count }, (_, index) => {
    const id = serial += 1;
    return Object.assign({
      id: `geometry-plan-${id}`, questionId: `sat-math:geometry-plan-${id % 3}:${id}`,
      templateId: `geometry-plan-${id % 3}`, sectionKey: "sat-math", test: "SAT", source: "template",
      domain: domainOf(skill), skill, difficulty: "Medium", correct: false, hinted: false,
      answered: true, timestamp: at + index * 1000, setKind: "drill", setSkill: skill,
    }, fields);
  });
}
function state(list, ledger, extra) {
  return Analytics.planState(Analytics.skillMap(list, [section]), Object.assign({
    sectionKey: section.key, attempts: list, ledger, sessions: [], now: START,
  }, extra));
}
function shape(plan) {
  return {
    pass: plan.pass, started: plan.started, departures: plan.departures,
    tracks: plan.tracks.map((track) => [track.key, track.inFlight]),
    skills: Object.fromEntries(Object.values(plan.skills).map((entry) => [entry.skill,
      [entry.status, entry.spent, entry.budget, entry.extraGiven, entry.pass, entry.entry, entry.firstEnteredAt]])),
  };
}
function saved(ledger) {
  return Progress.normalize(Progress.setPlanLedger(Progress.empty({ epoch: "geometry-plan" }), section.key, ledger))
    .planLedger[section.key];
}

test("fresh practice starts Algebra and Geometry, then interleaves all Geometry and Advanced skills", () => {
  const plan = state([]);
  assert.deepEqual(plan.tracks.map((track) => track.inFlight), [ALGEBRA, GEOMETRY]);
  assert.deepEqual(plan.tracks[1].skills.slice(0, 4), [GEOMETRY, ADVANCED, "Right triangles and trigonometry", "Nonlinear equations"]);
  const listed = plan.tracks.flatMap((track) => track.skills);
  assert.equal(new Set(listed).size, listed.length);
  assert.deepEqual(listed.slice().sort(), Analytics.PLANS[section.key].stages.flatMap((stage) => stage.skills).sort());
  assert.equal(plan.firstAnswerAt, null, "opening the plan is not an answer");
});

test("schedule saved before serving survives reload, then the first Geometry answers spend its budget", () => {
  const initial = saved(state([]).checkpoint);
  const reloaded = state([], initial, { now: START + MINUTE });
  assert.equal(reloaded.tracks[1].inFlight, GEOMETRY);
  const list = answers(GEOMETRY, 10, START + 2 * MINUTE);
  const first = state(list.slice(0, 1), initial);
  assert.equal(first.skills[GEOMETRY].spent, 1);
  const after = state(list, saved(first.checkpoint));
  assert.equal(after.firstAnswerAt, list[0].timestamp, "schedule metadata is not practice history");
  assert.equal(after.skills[GEOMETRY].spent, 10);
  assert.equal(after.skills[ADVANCED].spent, 0);
  const restored = IO.parseImport(IO.exportFile(Progress.setPlanLedger(Progress.empty(), section.key, after.checkpoint), START).text);
  assert.equal(restored.ok, true);
  const roundTrip = state(list, restored.progress.planLedger[section.key]);
  assert.deepEqual(shape(roundTrip), shape(after));
  assert.equal(roundTrip.orderFrom, initial.orderFrom);
  const finished = list.concat(answers(GEOMETRY, 10, START + 3 * MINUTE));
  const next = state(finished, saved(after.checkpoint));
  assert.equal(next.tracks[1].inFlight, ADVANCED);
  assert.equal(next.skills[GEOMETRY].leftBy, "budget");
});

test("returning full histories and legacy ledgers preserve active skills and only change future openings", () => {
  const old = answers(ADVANCED, 20, START).concat(answers("Nonlinear equations", 7, START + MINUTE));
  const before = state(old);
  assert.equal(before.tracks[1].inFlight, "Nonlinear equations");
  assert.equal(before.skills["Nonlinear equations"].spent, 7);
  const legacy = Object.assign({}, before.checkpoint);
  delete legacy.orderFrom;
  const upgraded = state(old, legacy);
  assert.deepEqual(shape(upgraded), shape(before));
  assert.equal(upgraded.orderFrom, legacy.at);
  assert.deepEqual(shape(state(old.slice(-5), legacy)), shape(before), "legacy trimmed checkpoint keeps its current turn");
  const checkpoint = saved(upgraded.checkpoint);
  assert.deepEqual(shape(state(old, checkpoint)), shape(before), "full replay retains historical openings");
  const later = old.concat(answers("Nonlinear equations", 13, START + 2 * MINUTE));
  const full = state(later, checkpoint);
  const trimmed = state(old.slice(-8).concat(later.slice(old.length)), checkpoint);
  assert.equal(full.tracks[1].inFlight, GEOMETRY, "Geometry opens when the preserved turn ends");
  assert.equal(full.skills["Nonlinear equations"].spent, 20);
  assert.deepEqual(shape(trimmed), shape(full), "trimmed replay has the same budgets, passes and eligibility");
  assert.equal(trimmed.fromLedger, true);
  const fullFlight = Analytics.reviewFlightAt({ [section.key]: full });
  const trimmedFlight = Analytics.reviewFlightAt({ [section.key]: trimmed });
  Object.keys(full.skills).forEach((skill) => assert.equal(fullFlight({ sectionKey: section.key, skill }),
    trimmedFlight({ sectionKey: section.key, skill })));
});

test("new interleaving preserves fresh budgets and subsequent passes through capped checkpoints", () => {
  let ledger = saved(state([]).checkpoint);
  let list = [];
  let plan = state(list, ledger);
  for (let turn = 0; turn < 30 && plan.pass === 1; turn += 1) {
    const track = plan.tracks[turn % 2].inFlight ? plan.tracks[turn % 2] : plan.tracks.find((entry) => entry.inFlight);
    list.push(...answers(track.inFlight, 20, START + (turn + 1) * MINUTE));
    plan = state(list, ledger);
    ledger = saved(plan.checkpoint);
  }
  assert.equal(plan.pass, 2);
  assert.deepEqual(plan.tracks.map((track) => track.inFlight), [ALGEBRA, GEOMETRY]);
  assert.equal(plan.skills[GEOMETRY].spent, 0);
  assert.equal(plan.skills[GEOMETRY].entry, "moved-on");
  assert.deepEqual(shape(state(list.slice(-20), ledger)), shape(state(list, ledger)));
});

test("real next-step rotation starts Algebra, Geometry and Advanced in five sessions with Review and transfer retained", () => {
  let now = START;
  let list = [];
  let sessions = [];
  let ledger = saved(state([]).checkpoint);
  const offered = [];
  const kinds = [];
  for (let day = 0; day < 5; day += 1) {
    now = START + day * DAY;
    let used = 0;
    while (used < 60) {
      const rows = Analytics.skillMap(list, [section]);
      const plan = state(list, ledger, { now, sessions });
      const step = Analytics.nextStep(rows, { attempts: list, sessions, now,
        plans: { [section.key]: plan }, dueCount: day ? 6 : 0,
        reviewedToday: Analytics.reviewDoneToday(sessions, "SAT", now), desmos: true });
      const minutes = step.kind === "review" ? 8 : step.kind === "mixed" ? 20 : step.kind === "module" ? 35 : 13;
      if (used + minutes > 60) break;
      const sessionId = `week-${day}-${used}`;
      kinds.push(step.kind);
      if (step.kind === "skill") {
        offered.push({ skill: step.skill, day });
        list.push(...answers(step.skill, 10, now + 1, { sessionId, difficulty: step.level, correct: step.level === "Easy" }));
      }
      used += minutes;
      now += minutes * MINUTE;
      sessions.push({ id: sessionId, kind: step.kind === "skill" ? "drill" : step.kind,
        test: "SAT", sectionKey: section.key, skill: step.skill, step: step.kind === "skill" ? "drill" : step.kind,
        finishedAt: now });
      ledger = saved(state(list, ledger, { now, sessions }).checkpoint);
    }
  }
  assert.ok(offered.some((entry) => entry.skill === ALGEBRA));
  assert.ok(offered.some((entry) => entry.skill === GEOMETRY && entry.day === 0));
  assert.ok(offered.some((entry) => entry.skill === ADVANCED && entry.day < 5), JSON.stringify({ offered, kinds }));
  assert.ok(kinds.includes("review") && kinds.includes("mixed") && kinds.includes("module") && kinds.includes("desmos"));
  assert.equal(state(list, ledger, { now, sessions }).skills[GEOMETRY].budget, 20);
});

test("the broad SAT focus can prioritize rebuilding Math after RW, while explicit RW and Review still work", () => {
  const rw = catalog.sections.find((entry) => entry.key === "sat-reading-writing");
  const rwAnswers = answers(ALGEBRA, 3, START, { sectionKey: rw.key, skill: "Inferences", domain: "Information and Ideas" });
  const rows = Analytics.skillMap(rwAnswers, [section, rw]);
  const options = { attempts: rwAnswers, sessions: [], now: START + MINUTE,
    recentSection: rw.key, preferredSection: section.key };
  const broad = Analytics.nextStep(rows, options);
  assert.equal(broad.sectionKey, section.key);
  assert.equal(broad.skill, ALGEBRA);
  const explicit = Analytics.nextStep(rows, Object.assign({}, options, { sectionKeys: [rw.key] }));
  assert.equal(explicit.sectionKey, rw.key);
  const review = Analytics.nextStep(rows, Object.assign({}, options, { dueCount: 3 }));
  assert.equal(review.kind, "review");
  assert.equal(review.then.sectionKey, section.key);
});
