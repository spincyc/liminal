"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../src/lib/curriculum");
const { loadCurriculum, validateTrack } = require("../tools/build-curriculum");

test("every year has continuous pacing, resolvable sources, and navigable adjacent years", () => {
  const data = loadCurriculum();
  for (const track of data.tracks) {
    for (let grade = 0; grade <= 12; grade++) {
      const pair = C.courseAt(data, track.track.id, grade);
      const units = C.pacedUnits(pair.course);
      assert.equal(units[0].startWeek, 1);
      assert.equal(units.at(-1).endWeek, 36);
      for (let i = 1; i < units.length; i++) assert.equal(units[i].startWeek, units[i - 1].endWeek + 1);
      const state = C.resolve(data, C.route(track.track.id, grade));
      assert.equal(state.trackId, track.track.id); assert.equal(state.grade, grade); assert.equal(state.invalid, false);
      for (const unit of units) assert.equal(C.resolve(data, C.route(track.track.id, grade, unit.id)).unitId, unit.id);
      const connections = C.connections(data, track.track.id, grade);
      assert.equal(!!connections.previous, grade > 0); assert.equal(!!connections.next, grade < 12);
      assert.equal(connections.peers.length, 2);
      assert.ok(connections.peers.every(p => p.course.grade === grade));
      assert.ok(C.coverage(track, pair.course).every(s => s.source && s.units.length));
    }
  }
});

test("unknown plan and unit links recover without losing a valid grade or executing input", () => {
  const data = loadCurriculum();
  for (const hash of ["#unknown/3", "#common-core-math/13", "#common-core-reading/-1", "#grade/NaN", "#%3Cscript%3E/k", "#singapore-math/8/not-a-unit", "#common-core-math/3/u1/extra"]) {
    const state = C.resolve(data, hash);
    assert.equal(state.invalid, true, hash);
    assert.ok(state.grade >= 0 && state.grade <= 12);
  }
  assert.equal(C.resolve(data, "#unknown/3").grade, 3);
  assert.equal(C.resolve(data, "#grade/12").trackId, "grade");
  assert.equal(C.resolve(data, "#common-core-reading").grade, 0);
});

test("admission rejects missing years, broken source links, false pacing and orphan standards", () => {
  const original = loadCurriculum().tracks[0];
  const mutations = [
    data => data.courses.pop(),
    data => { delete data.courses[0].id; },
    data => { delete data.courses[0].units[0].id; },
    data => { data.courses[0].units[0].id = 12; },
    data => { data.courses[0].grade = 13; },
    data => { data.courses[1].grade = 0; },
    data => { data.courses[0].units[0].weeks++; },
    data => { data.courses[0].units[0].standards.push("made-up-standard"); },
    data => { data.standards[0].sourceId = "no-source"; },
    data => { data.sources[0].url = "javascript:alert(1)"; },
    data => { data.sources[0].url = "https://["; },
    data => { data.sources[0].accessed = "2026-02-31"; },
    data => { data.standards.push({ ...data.standards[0], id: "orphan" }); },
  ];
  for (const mutate of mutations) {
    const data = structuredClone(original); mutate(data);
    assert.throws(() => validateTrack(data, original.track.id), /Curriculum:/);
  }
});
