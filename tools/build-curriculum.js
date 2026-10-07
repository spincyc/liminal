#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const TRACKS = ["common-core-math", "common-core-reading", "singapore-math"];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function assert(condition, message) { if (!condition) throw new Error("Curriculum: " + message); }
function text(value, location) { assert(typeof value === "string" && value.trim(), "missing text at " + location); }
function strings(value, location) {
  assert(Array.isArray(value) && value.length, "missing list at " + location);
  value.forEach(v => text(v, location));
}
function unique(items, location) {
  assert(new Set(items).size === items.length, "duplicates in " + location);
}
function validateTrack(data, expectedId) {
  assert(data.version === 1 && data.track && data.track.id === expectedId, "invalid track " + expectedId);
  for (const key of ["title", "subject", "description", "scopeNote"]) text(data.track[key], expectedId + "." + key);
  assert(Array.isArray(data.sources) && data.sources.length, "missing sources in " + expectedId);
  unique(data.sources.map(s => s.id), expectedId + " sources");
  for (const source of data.sources) {
    for (const key of ["id", "title", "publisher", "edition", "accessed", "note"]) text(source[key], source.id + "." + key);
    let url;
    try { url = new URL(source.url); } catch { /* Report with the source ID below. */ }
    assert(typeof source.url === "string" && url && url.protocol === "https:" && !url.username && !url.password && !/\s/.test(source.url), "invalid source URL " + source.id);
    const timestamp = Date.parse(source.accessed);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(source.accessed) && Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === source.accessed, "invalid source date " + source.id);
  }
  assert(Array.isArray(data.standards) && data.standards.length, "missing references in " + expectedId);
  unique(data.standards.map(s => s.id), expectedId + " standards");
  const standards = new Set(data.standards.map(s => s.id));
  for (const standard of data.standards) {
    for (const key of ["id", "label", "locator", "gradeBand"]) text(standard[key], standard.id + "." + key);
    assert(data.sources.some(s => s.id === standard.sourceId), "unknown source in " + standard.id);
    assert(["content", "practice", "extension"].includes(standard.kind), "invalid reference kind " + standard.id);
  }
  assert(Array.isArray(data.courses) && data.courses.length === 13, expectedId + " must have 13 year plans");
  unique(data.courses.map(c => c.id), expectedId + " courses");
  unique(data.courses.map(c => c.grade), expectedId + " grades");
  const covered = new Set();
  for (const course of data.courses) {
    assert(typeof course.id === "string" && slug.test(course.id) && Number.isInteger(course.grade) && course.grade >= 0 && course.grade <= 12, "invalid course " + course.id);
    for (const key of ["title", "levelLabel", "scopeNote", "nextStep", "yearBridge", "crossSubject"]) text(course[key], course.id + "." + key);
    for (const key of ["prerequisites", "outcomes", "routines"]) strings(course[key], course.id + "." + key);
    assert(Array.isArray(course.units) && course.units.length >= 4, "too few units in " + course.id);
    unique(course.units.map(u => u.id), course.id + " units");
    assert(course.units.every(u => Number.isInteger(u.weeks) && u.weeks > 0), "invalid pacing in " + course.id);
    assert(course.units.reduce((n, u) => n + u.weeks, 0) === 36, course.id + " must span 36 weeks");
    for (const unit of course.units) {
      assert(typeof unit.id === "string" && slug.test(unit.id), "invalid unit ID " + course.id);
      const location = course.id + "/" + unit.id;
      for (const key of ["title", "focus", "bridge"]) text(unit[key], location + "." + key);
      for (const key of ["learning", "standards", "activities", "evidence"]) strings(unit[key], location + "." + key);
      unique(unit.standards, location + " references");
      for (const id of unit.standards) {
        assert(standards.has(id), "unknown reference " + id + " in " + location);
        covered.add(id);
      }
    }
  }
  const missing = [...standards].filter(id => !covered.has(id));
  assert(!missing.length, "unmapped references in " + expectedId + ": " + missing.slice(0, 12).join(", "));
  return data;
}
function loadCurriculum(directory = path.join(ROOT, "content/curriculum")) {
  const tracks = TRACKS.map(id => validateTrack(JSON.parse(fs.readFileSync(path.join(directory, id + ".json"), "utf8")), id));
  unique(tracks.flatMap(t => t.courses.map(c => c.id)), "all course IDs");
  return { version: 1, weeks: 36, tracks };
}
function build() {
  const data = loadCurriculum();
  const output = path.join(ROOT, "dist/content");
  fs.mkdirSync(output, { recursive: true });
  const json = JSON.stringify(data);
  fs.writeFileSync(path.join(output, "curriculum.js"), "/* Generated full-year outlines. */\nwindow.LIMINAL_CURRICULUM = " +
    json.replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + ";\n");
  fs.writeFileSync(path.join(output, "curriculum.json"), JSON.stringify(data, null, 2) + "\n");
  console.log("Built " + data.tracks.reduce((n, t) => n + t.courses.length, 0) + " full-year curriculum outlines.");
  return data;
}
module.exports = { TRACKS, validateTrack, loadCurriculum, build };
if (require.main === module) build();
