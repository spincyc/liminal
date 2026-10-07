#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { TRACKS } = require("../src/lib/weekly");
const { loadCurriculum } = require("./build-curriculum");
const ROOT = path.resolve(__dirname, "..");
function assert(condition, message) { if (!condition) throw new Error("Weekly: " + message); }
function text(value, where) { assert(typeof value === "string" && value.trim(), "missing text at " + where); }
function list(value, minimum, where) {
  assert(Array.isArray(value) && value.length >= minimum, "too few entries at " + where);
  value.forEach(v => text(v, where));
}
function unique(values, where) { assert(new Set(values).size === values.length, "duplicate IDs/references at " + where); }
function id(value, where) { assert(typeof value === "string" && /^[a-z0-9][a-z0-9._:-]*$/.test(value), "invalid ID at " + where); }
// This is an authoring check, not the rendering security boundary: the UI
// inserts text nodes and escapes exports. Do not mistake spans across several
// comparison signs for tags; attribute-shaped text must have an assignment or
// a recognized HTML boolean attribute.
const assignedAttribute = String.raw`[a-z_:][a-z0-9_.:-]*\s*=\s*(?:"[^"<>]*"|'[^'<>]*'|[^\s"'=<>\x60]+)`;
const booleanAttribute = "(?:allowfullscreen|async|autofocus|autoplay|checked|controls|default|defer|disabled|formnovalidate|hidden|inert|ismap|itemscope|loop|multiple|muted|nomodule|novalidate|open|playsinline|readonly|required|reversed|selected)";
const markup = new RegExp(String.raw`<!--|<!doctype\b|<\/?[a-z][a-z0-9:-]*(?:\s+(?:${assignedAttribute}|${booleanAttribute}))*\s*\/?>`, "i");
function plainData(value, where) {
  if (typeof value === "string") {
    assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) && !markup.test(value), "non-plain text at " + where);
    assert(!/\\[()[\]]|\$\$/.test(value), "LaTeX delimiters at " + where);
  } else if (Array.isArray(value)) value.forEach((v, i) => plainData(v, where + "." + i));
  else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => plainData(v, where + "." + k));
}
function safeHttps(value) {
  if (typeof value !== "string" || !/^https:\/\/[^/?#]/.test(value) || /[\s\\<>"'\u0000-\u001f\u007f]/.test(value) || /%(?:0[0-9a-f]|1[0-9a-f]|20|7f)/i.test(value)) return false;
  try { const url = new URL(value); return url.protocol === "https:" && !!url.hostname && !url.username && !url.password; } catch { return false; }
}
function normalized(value) { return value.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim(); }
function taskIdentity(task, passages) {
  return JSON.stringify([normalized(task.prompt), (task.passageIds || []).map(pid => normalized(passages.find(p => p.id === pid).text)).sort()]);
}
function validateCourse(data, track) {
  assert(data && data.format === "liminal-weekly-course" && data.version === 1, "invalid course format/version");
  assert(TRACKS.includes(data.trackId) && track && track.track.id === data.trackId, "invalid track " + data.trackId);
  assert(Number.isInteger(data.grade) && data.grade >= 0 && data.grade <= 12, "invalid grade");
  text(data.author, "author");
  plainData(data, data.trackId + "/" + data.grade);
  const plan = track.courses.find(c => c.grade === data.grade);
  assert(plan, "missing year plan");
  const pacing = plan.units.flatMap(u => Array(u.weeks).fill(u));
  assert(pacing.length === 36, "invalid year-plan pacing");
  assert(Array.isArray(data.weeks) && data.weeks.length === 36, "course must contain exactly 36 weeks");
  const itemIds = new Set();
  const tasks = new Map();
  function task(value, where, passages, example) {
    assert(value && typeof value === "object", "invalid task at " + where);
    for (const field of ["prompt", "answer"]) text(value[field], where + "." + field);
    list(value.steps, example ? 3 : 2, where + ".steps");
    assert(Array.isArray(value.passageIds) || (example && value.passageIds === undefined), "missing passageIds at " + where);
    const refs = value.passageIds || [];
    unique(refs, where + ".passageIds");
    refs.forEach(ref => assert(passages.some(p => p.id === ref), "unresolved passage " + ref + " at " + where));
    const identity = taskIdentity(value, passages);
    assert(!tasks.has(identity), "duplicate displayed task at " + where + " (first at " + tasks.get(identity) + ")");
    tasks.set(identity, where);
    if (!example) {
      id(value.id, where);
      assert(!itemIds.has(value.id), "duplicate item ID " + value.id);
      itemIds.add(value.id);
      text(value.skill, where + ".skill");
    }
  }
  data.weeks.forEach((week, index) => {
    const where = data.trackId + "/" + data.grade + "/week-" + (index + 1);
    assert(week && week.week === index + 1, "weeks must be ordered 1–36 at " + where);
    const unit = pacing[index];
    assert(week.unitId === unit.id, "wrong unit pacing at " + where + ": expected " + unit.id);
    for (const field of ["title", "objective"]) text(week[field], where + "." + field);
    list(week.standards, 1, where + ".standards");
    unique(week.standards, where + ".standards");
    week.standards.forEach(ref => assert(unit.standards.includes(ref), "standard outside unit at " + where + ": " + ref));
    assert(week.connection && typeof week.connection === "object", "missing connection at " + where);
    for (const field of ["before", "after"]) text(week.connection[field], where + ".connection." + field);
    list(week.days, 5, where + ".days");
    assert(week.days.length === 5, "need exactly five days at " + where);
    list(week.explanation, 3, where + ".explanation");
    assert(Array.isArray(week.passages), "missing passages at " + where);
    unique(week.passages.map(p => p.id), where + ".passages");
    week.passages.forEach(p => {
      id(p.id, where + ".passages");
      for (const field of ["title", "text", "attribution"]) text(p[field], where + ".passage." + field);
      assert(["original", "public-domain"].includes(p.kind), "invalid passage kind at " + where);
      assert(["independent", "shared", "read-aloud"].includes(p.readingMode), "invalid reading mode at " + where);
      if (p.kind === "original") assert(p.sourceUrl === "" && /written for Liminal/i.test(p.attribution), "original passage provenance at " + where);
      else assert(safeHttps(p.sourceUrl) && /public[ -]domain/i.test(p.attribution) && /\b\d{4}\b/.test(p.attribution), "public-domain passage provenance/source at " + where);
    });
    assert(Array.isArray(week.examples) && week.examples.length >= 2, "need two examples at " + where);
    week.examples.forEach((e, i) => task(e, where + "/example-" + (i + 1), week.passages, true));
    assert(Array.isArray(week.worksheets) && week.worksheets.length === 3, "need three worksheets at " + where);
    unique(week.worksheets.map(s => s.id), where + ".worksheets");
    week.worksheets.forEach(sheet => {
      assert(["a", "b", "c"].includes(sheet.id), "invalid worksheet ID at " + where);
      for (const field of ["title", "directions"]) text(sheet[field], where + ".worksheet." + field);
      assert(Array.isArray(sheet.items) && sheet.items.length >= 6, "need six worksheet items at " + where + "/" + sheet.id);
      sheet.items.forEach((item, i) => task(item, where + "/" + sheet.id + "/" + (i + 1), week.passages, false));
    });
  });
  return data;
}
function loadWeekly({ directory = path.join(ROOT, "content/weekly"), curriculum = loadCurriculum() } = {}) {
  const courses = [];
  if (!fs.existsSync(directory)) return { index: { version: 1, courses: [] }, courses };
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(entry.isDirectory() && TRACKS.includes(entry.name), "unexpected weekly entry " + entry.name);
    for (const file of fs.readdirSync(path.join(directory, entry.name), { withFileTypes: true })) {
      assert(file.isFile() && /^(?:k|[1-9]|1[0-2])\.json$/.test(file.name), "unexpected course file " + file.name);
      const course = JSON.parse(fs.readFileSync(path.join(directory, entry.name, file.name), "utf8"));
      const key = file.name.slice(0, -5);
      assert(course.trackId === entry.name && course.grade === (key === "k" ? 0 : Number(key)), "course path mismatch " + entry.name + "/" + file.name);
      validateCourse(course, curriculum.tracks.find(t => t.track.id === entry.name));
      courses.push(course);
    }
  }
  courses.sort((a, b) => b.grade - a.grade || TRACKS.indexOf(a.trackId) - TRACKS.indexOf(b.trackId));
  const index = { version: 1, courses: courses.map(c => ({ trackId: c.trackId, grade: c.grade,
    title: curriculum.tracks.find(t => t.track.id === c.trackId).courses.find(p => p.grade === c.grade).title,
    weeks: c.weeks.map(w => ({ week: w.week, unitId: w.unitId, title: w.title })),
    file: "content/weekly/" + c.trackId + "/" + (c.grade === 0 ? "k" : c.grade) + ".json" })) };
  return { index, courses };
}
function build(options = {}) {
  const { index, courses } = loadWeekly(options);
  const output = options.output || path.join(ROOT, "dist");
  const directory = path.join(output, "content");
  fs.mkdirSync(directory, { recursive: true });
  fs.rmSync(path.join(directory, "weekly"), { recursive: true, force: true });
  for (let i = 0; i < courses.length; i++) {
    const target = path.join(output, index.courses[i].file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(courses[i], null, 2) + "\n");
  }
  const json = JSON.stringify(index);
  fs.writeFileSync(path.join(directory, "weekly-index.js"), "/* Generated weekly course index; courses load on demand. */\nwindow.LIMINAL_WEEKLY_INDEX = " + json.replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + ";\n");
  fs.writeFileSync(path.join(directory, "weekly-index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log("Built " + courses.length + " complete weekly courses.");
  return index;
}
module.exports = { validateCourse, loadWeekly, build, safeHttps, taskIdentity };
if (require.main === module) build();
