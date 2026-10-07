#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { TRACKS, GRADE_TRACKS, NAMED_COURSES, courseKey } = require("../src/lib/weekly");
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
  const named = data.trackId === "high-school-math";
  if (named) assert(["trigonometry", "calculus"].includes(data.courseId) && data.grade === undefined, "invalid named course identity");
  else assert(Number.isInteger(data.grade) && data.grade >= 0 && data.grade <= 12 && data.courseId === undefined, "invalid grade");
  text(data.author, "author");
  plainData(data, data.trackId + "/" + courseKey(data));
  const plan = track.courses.find(c => named ? c.id === data.courseId : c.grade === data.grade);
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
    const where = data.trackId + "/" + courseKey(data) + "/week-" + (index + 1);
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
// Named plans hydrate source aliases without copying canonical curriculum content.
function normalizeHighSchool(data, curriculum) {
  assert(data && data.version === 1 && data.track && data.track.id === "high-school-math", "invalid high-school plan");
  plainData(data, "high-school plan");
  for (const key of ["title", "description", "scopeNote"]) text(data.track[key], "high-school track." + key);
  assert(Array.isArray(data.courses) && data.courses.length === NAMED_COURSES.length, "high-school plan needs five courses");
  unique(data.courses.map(c => c.id), "high-school course IDs");
  assert(data.courses.every(c => NAMED_COURSES.includes(c.id)), "invalid high-school course ID");
  assert(Array.isArray(data.sources) && Array.isArray(data.standards), "missing high-school reference arrays");
  unique(data.sources.map(s => s.id), "high-school sources");
  unique(data.standards.map(s => s.id), "high-school standards");
  const sources = data.sources.slice(), standards = data.standards.slice();
  function merge(records, additional, label) {
    for (const record of additional) {
      const previous = records.find(r => r.id === record.id);
      assert(!previous || JSON.stringify(previous) === JSON.stringify(record), "conflicting " + label + " " + record.id);
      if (!previous) records.push(record);
    }
  }
  const courses = NAMED_COURSES.map((courseId, index) => {
    const course = data.courses.find(c => c.id === courseId);
    for (const key of ["title", "scopeNote", "nextStep"]) text(course[key], courseId + "." + key);
    list(course.prerequisites, 1, courseId + ".prerequisites");
    list(course.outcomes, 1, courseId + ".outcomes");
    assert(course.grade === undefined, "named plan must not assign a grade " + courseId);
    let units = course.units;
    if (index < 3) {
      assert(course.source && course.source.trackId === "common-core-math" && course.source.grade === index + 9 && course.units === undefined, "invalid source alias " + courseId);
      const sourceTrack = curriculum.tracks.find(t => t.track.id === course.source.trackId);
      const sourceCourse = sourceTrack && sourceTrack.courses.find(c => c.grade === course.source.grade);
      assert(sourceCourse, "missing source plan " + courseId);
      units = sourceCourse.units;
      const refs = new Set(units.flatMap(u => u.standards));
      const sourceStandards = sourceTrack.standards.filter(r => refs.has(r.id));
      merge(standards, sourceStandards, "standard");
      merge(sources, sourceTrack.sources.filter(s => sourceStandards.some(r => r.sourceId === s.id)), "source");
    } else assert(course.source === undefined, "authored named course cannot alias a source " + courseId);
    assert(Array.isArray(units) && units.length > 0 && units.every(u => Number.isInteger(u.weeks) && u.weeks > 0) && units.reduce((sum, u) => sum + u.weeks, 0) === 36, "invalid named plan pacing " + courseId);
    unique(units.map(u => u.id), courseId + " units");
    for (const unit of units) {
      assert(typeof unit.id === "string" && /^u[1-9][0-9]*$/.test(unit.id), "invalid named unit ID " + courseId);
      for (const key of ["title", "focus", "bridge"]) text(unit[key], courseId + "." + unit.id + "." + key);
      for (const key of ["learning", "standards", "activities", "evidence"]) list(unit[key], 1, courseId + "." + unit.id + "." + key);
      unique(unit.standards, courseId + "." + unit.id + " references");
    }
    return { ...course, goals: course.outcomes.slice(), units };
  });
  for (const source of sources) {
    id(source.id, "high-school source");
    for (const key of ["title", "publisher", "edition", "note"]) text(source[key], source.id + "." + key);
    assert(safeHttps(source.url), "invalid high-school source URL " + source.id);
    const timestamp = Date.parse(source.accessed);
    assert(typeof source.accessed === "string" && /^\d{4}-\d{2}-\d{2}$/.test(source.accessed) && Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === source.accessed, "invalid high-school source date " + source.id);
  }
  for (const standard of standards) {
    for (const key of ["id", "label", "locator", "gradeBand"]) text(standard[key], standard.id + "." + key);
    assert(sources.some(s => s.id === standard.sourceId), "unresolved high-school source " + standard.id);
    assert(["editorial-objective", "content", "practice", "extension"].includes(standard.kind), "invalid high-school reference kind " + standard.id);
  }
  const covered = new Set();
  for (const course of courses) for (const unit of course.units) for (const ref of unit.standards) {
    assert(standards.some(s => s.id === ref), "unresolved high-school standard " + ref);
    covered.add(ref);
  }
  assert(standards.every(s => covered.has(s.id)), "unmapped high-school reference");
  return { ...data, sources, standards, courses };
}
function loadHighSchool(curriculum = loadCurriculum(), file = path.join(ROOT, "content/high-school-math.json")) {
  return fs.existsSync(file) ? normalizeHighSchool(JSON.parse(fs.readFileSync(file, "utf8")), curriculum) : null;
}
function loadWeekly({ directory = path.join(ROOT, "content/weekly"), curriculum = loadCurriculum(), highSchool = loadHighSchool(curriculum) } = {}) {
  const physicalCourses = [];
  if (fs.existsSync(directory)) for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(entry.isDirectory() && TRACKS.includes(entry.name), "unexpected weekly entry " + entry.name);
    const named = entry.name === "high-school-math";
    for (const file of fs.readdirSync(path.join(directory, entry.name), { withFileTypes: true })) {
      assert(file.isFile() && (named ? /^(?:trigonometry|calculus)\.json$/ : /^(?:k|[1-9]|1[0-2])\.json$/).test(file.name), "unexpected course file " + file.name);
      const course = JSON.parse(fs.readFileSync(path.join(directory, entry.name, file.name), "utf8"));
      const key = file.name.slice(0, -5);
      assert(course.trackId === entry.name && (named ? course.courseId === key && course.grade === undefined : course.grade === (key === "k" ? 0 : Number(key))), "course path mismatch " + entry.name + "/" + file.name);
      validateCourse(course, named ? highSchool : curriculum.tracks.find(t => t.track.id === entry.name));
      physicalCourses.push(course);
    }
  }
  function planFor(course) { return course.courseId ? highSchool.courses.find(p => p.id === course.courseId) : curriculum.tracks.find(t => t.track.id === course.trackId).courses.find(p => p.grade === course.grade); }
  const courses = physicalCourses.map(course => course.courseId ? { ...course, courseTitle: planFor(course).title, scopeNote: planFor(course).scopeNote } : course);
  if (highSchool) for (const plan of highSchool.courses.filter(c => c.source)) {
    const source = physicalCourses.find(c => c.trackId === plan.source.trackId && c.grade === plan.source.grade);
    if (source) {
      const { grade, ...data } = source;
      // Only the final bridge changes for the named sequence. Problems,
      // examples, keys and every other teaching field retain their source data.
      const weeks = source.weeks.map(week => week.week === 36 ? { ...week, connection: { ...week.connection, after: plan.nextStep } } : week);
      courses.push({ ...data, trackId: "high-school-math", courseId: plan.id, courseTitle: plan.title, scopeNote: plan.scopeNote, source: { ...plan.source }, weeks });
    }
  }
  courses.sort((a, b) => {
    if (a.courseId && b.courseId) return NAMED_COURSES.indexOf(a.courseId) - NAMED_COURSES.indexOf(b.courseId);
    if (a.courseId || b.courseId) return a.courseId ? 1 : -1;
    return b.grade - a.grade || GRADE_TRACKS.indexOf(a.trackId) - GRADE_TRACKS.indexOf(b.trackId);
  });
  const index = { version: 1, courses: courses.map(c => ({ trackId: c.trackId,
    ...(c.courseId ? { courseId: c.courseId, scopeNote: c.scopeNote, ...(c.source ? { source: c.source } : {}) } : { grade: c.grade }),
    title: planFor(c).title,
    weeks: c.weeks.map(w => ({ week: w.week, unitId: w.unitId, title: w.title })),
    file: "content/weekly/" + c.trackId + "/" + courseKey(c) + ".json" })) };
  return { index, courses, physicalCourses, highSchool };
}
function build(options = {}) {
  const { index, courses, physicalCourses, highSchool } = loadWeekly(options);
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
  const plans = highSchool || { version: 1, track: { id: "high-school-math", title: "High-school mathematics", description: "Conventional sequence with flexible placement.", scopeNote: "Editorial course sequence." }, sources: [], standards: [], courses: [] };
  const planJson = JSON.stringify(plans);
  fs.writeFileSync(path.join(directory, "high-school.js"), "/* Generated named high-school plans. */\nwindow.LIMINAL_HIGH_SCHOOL = " + planJson.replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + ";\n");
  fs.writeFileSync(path.join(directory, "high-school.json"), JSON.stringify(plans, null, 2) + "\n");
  console.log("Built " + physicalCourses.length + " complete weekly courses (" + courses.length + " course views).");
  return index;
}
module.exports = { validateCourse, normalizeHighSchool, loadHighSchool, loadWeekly, build, safeHttps, taskIdentity };
if (require.main === module) build();
