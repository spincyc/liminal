"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Progress = require("../src/lib/progress");
const IO = require("../src/lib/progress-io");

const checkpoint = (extra) => Object.assign({
  version: 1, from: 1000, at: 2000, pass: 1,
  flownThisPass: [], inFlight: {}, skills: {}, departures: [],
}, extra);

test("a plan's ordering cutover survives save, export, restore and merge", () => {
  const entry = checkpoint({ orderFrom: 1500 });
  const current = Progress.setPlanLedger(Progress.empty({ epoch: "order-cutover" }), "sat-math", entry);
  const normalized = Progress.normalize(JSON.parse(JSON.stringify(current)));
  assert.equal(normalized.planLedger["sat-math"].orderFrom, 1500);
  const exported = IO.exportFile(normalized, 3000);
  const restored = IO.parseImport(exported.text);
  assert.equal(restored.ok, true);
  assert.equal(restored.progress.planLedger["sat-math"].orderFrom, 1500);
  const later = Progress.setPlanLedger(current, "sat-math", checkpoint({ at: 2500, orderFrom: 1500 }));
  assert.equal(Progress.mergePlanLedger(current.planLedger, later.planLedger)["sat-math"].orderFrom, 1500);
  assert.equal(Progress.mergePlanLedger(later.planLedger, current.planLedger)["sat-math"].at, 2500);
});

test("legacy checkpoints need no cutover and malformed markers cannot select an order", () => {
  const legacy = Progress.cleanPlanLedger({ "sat-math": checkpoint() })["sat-math"];
  assert.equal(Object.hasOwn(legacy, "orderFrom"), false);
  for (const value of ["1500", NaN, Infinity, null, {}, []]) {
    const cleaned = Progress.cleanPlanLedger({ "sat-math": checkpoint({ orderFrom: value }) })["sat-math"];
    assert.equal(Object.hasOwn(cleaned, "orderFrom"), false);
  }
});
