#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { TRACKS, GRADE_TRACKS, NAMED_TRACK_IDS, CALCULATOR, namedTrack, courseKey } = require("../src/lib/weekly");
const { loadCurriculum } = require("./build-curriculum");
const { FIGURE_ID, loadFigureDirectory } = require("./lib/weekly-figures");
const ROOT = path.resolve(__dirname, "..");
// Raw budget for one course file, checked on the source file and again on
// the built file with its figures inlined.
const MAX_COURSE_BYTES = 2.5 * 1024 * 1024;
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
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
// What a student sees: the prompt, resolved passage texts and, when present,
// the given figures' drawings and the choices. Reference order is ignored.
function taskIdentity(task, passages, figureSvg = () => "") {
  const identity = [normalized(task.prompt), (task.passageIds || []).map(pid => normalized(passages.find(p => p.id === pid).text)).sort()];
  if (Array.isArray(task.figureIds) && task.figureIds.length) identity.push(task.figureIds.map(id => String(figureSvg(id)).replace(/\s+/g, " ").trim()).sort());
  if (Array.isArray(task.choices)) identity.push(task.choices.map(normalized));
  return JSON.stringify(identity);
}
const FIGURE_FIELDS = new Set(["id", "alt", "caption", "notToScale"]);
// options.figures: Map figureId -> SVG text for this course's figure files
// (already admitted by tools/lib/weekly-figures.js). Every declared figure
// needs a file and every file a declaration.
function validateCourse(data, track, options = {}) {
  assert(data && data.format === "liminal-weekly-course" && data.version === 1, "invalid course format/version");
  assert(TRACKS.includes(data.trackId) && track && track.track.id === data.trackId, "invalid track " + data.trackId);
  const named = namedTrack(data.trackId);
  if (named) assert(named.courses.includes(data.courseId) && !named.aliases[data.courseId] && data.grade === undefined, "invalid named course identity");
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
  const files = options.figures instanceof Map ? options.figures : new Map();
  const declaredFigures = new Set();
  function figureRefs(value, field, where, week) {
    if (value[field] === undefined) return [];
    assert(Array.isArray(value[field]) && value[field].length > 0, "empty or invalid " + field + " at " + where);
    unique(value[field], where + "." + field);
    value[field].forEach(ref => assert(typeof ref === "string" && week.figureIds.has(ref), "unresolved figure " + ref + " at " + where));
    return value[field];
  }
  function task(value, where, passages, example, week) {
    assert(value && typeof value === "object", "invalid task at " + where);
    for (const field of ["prompt", "answer"]) text(value[field], where + "." + field);
    list(value.steps, example ? 3 : 2, where + ".steps");
    assert(Array.isArray(value.passageIds) || (example && value.passageIds === undefined), "missing passageIds at " + where);
    const refs = value.passageIds || [];
    unique(refs, where + ".passageIds");
    refs.forEach(ref => assert(passages.some(p => p.id === ref), "unresolved passage " + ref + " at " + where));
    figureRefs(value, "figureIds", where, week).forEach(ref => week.given.add(ref));
    figureRefs(value, "answerFigureIds", where, week).forEach(ref => week.answers.add(ref));
    if (value.choices !== undefined || value.key !== undefined) {
      assert(Array.isArray(value.choices) && value.choices.length === 4, "multiple choice needs exactly four choices at " + where);
      value.choices.forEach((choice, i) => text(choice, where + ".choices." + i));
      assert(new Set(value.choices.map(normalized)).size === 4, "duplicate choices at " + where);
      assert(typeof value.key === "string" && /^[A-D]$/.test(value.key), "multiple choice needs a key letter A–D at " + where);
    }
    if (value.points !== undefined || value.rubric !== undefined) {
      assert(value.choices === undefined, "multiple choice cannot carry points or a rubric at " + where);
      assert(Number.isInteger(value.points) && value.points >= 1 && value.points <= 20, "free-response points must be an integer 1–20 at " + where);
      assert(Array.isArray(value.rubric) && value.rubric.length > 0, "free response needs a rubric at " + where);
      value.rubric.forEach((row, i) => {
        assert(row && typeof row === "object" && Object.keys(row).every(k => k === "points" || k === "criterion") && Number.isInteger(row.points) && row.points >= 1, "invalid rubric row at " + where + ".rubric." + i);
        text(row.criterion, where + ".rubric." + i + ".criterion");
      });
      assert(value.rubric.reduce((sum, row) => sum + row.points, 0) === value.points, "rubric points must sum to the item's points at " + where);
    }
    const identity = taskIdentity(value, passages, id => files.get(id));
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
    // Figures: declared per week, drawn from the course's figure files, and
    // either given (prompts, explanation) or answer-only (keys, solutions).
    assert(week.figures === undefined || Array.isArray(week.figures), "invalid figures at " + where);
    const figureState = { figureIds: new Set(), given: new Set(), answers: new Set() };
    (week.figures || []).forEach((figure, i) => {
      const at = where + ".figures." + i;
      assert(figure && typeof figure === "object" && Object.keys(figure).every(k => FIGURE_FIELDS.has(k)), "invalid figure fields at " + at);
      assert(typeof figure.id === "string" && FIGURE_ID.test(figure.id), "invalid figure ID at " + at);
      assert(!declaredFigures.has(figure.id), "duplicate figure ID " + figure.id);
      declaredFigures.add(figure.id); figureState.figureIds.add(figure.id);
      text(figure.alt, at + ".alt");
      if (figure.caption !== undefined) text(figure.caption, at + ".caption");
      assert(figure.notToScale === undefined || typeof figure.notToScale === "boolean", "invalid notToScale at " + at);
      assert(files.has(figure.id), "missing figure file " + figure.id + ".svg at " + at);
    });
    figureRefs(week, "explanationFigureIds", where, figureState).forEach(ref => figureState.given.add(ref));
    week.examples.forEach((e, i) => task(e, where + "/example-" + (i + 1), week.passages, true, figureState));
    assert(Array.isArray(week.worksheets) && week.worksheets.length === 3, "need three worksheets at " + where);
    unique(week.worksheets.map(s => s.id), where + ".worksheets");
    week.worksheets.forEach(sheet => {
      assert(["a", "b", "c"].includes(sheet.id), "invalid worksheet ID at " + where);
      for (const field of ["title", "directions"]) text(sheet[field], where + ".worksheet." + field);
      assert(sheet.calculator === undefined || Object.prototype.hasOwnProperty.call(CALCULATOR, sheet.calculator), "invalid calculator policy at " + where + "/" + sheet.id);
      if (data.trackId === "ap" && data.courseId === "calculus-bc") assert(["none", "graphing"].includes(sheet.calculator), "BC worksheet calculator policy must be none or graphing at " + where + "/" + sheet.id);
      assert(sheet.minutes === undefined || Number.isInteger(sheet.minutes) && sheet.minutes >= 1 && sheet.minutes <= 240, "invalid suggested minutes at " + where + "/" + sheet.id);
      assert(Array.isArray(sheet.items) && sheet.items.length >= 6, "need six worksheet items at " + where + "/" + sheet.id);
      sheet.items.forEach((item, i) => task(item, where + "/" + sheet.id + "/" + (i + 1), week.passages, false, figureState));
    });
    for (const id of figureState.figureIds) {
      assert(figureState.given.has(id) || figureState.answers.has(id), "unreferenced figure " + id + " at " + where);
      assert(!(figureState.given.has(id) && figureState.answers.has(id)), "figure " + id + " is both a given and answer-only at " + where);
    }
  });
  for (const id of files.keys()) assert(declaredFigures.has(id), "unreferenced figure file " + id + ".svg in " + data.trackId + "/" + courseKey(data));
  return data;
}
// The built course: each declared figure carries its SVG text.
function withFigures(data, figures) {
  if (!data.weeks.some(week => week.figures && week.figures.length)) return data;
  return { ...data, weeks: data.weeks.map(week => week.figures ? { ...week, figures: week.figures.map(f => ({ ...f, svg: figures.get(f.id) })) } : week) };
}
// Named plans hydrate source aliases without copying canonical curriculum
// content. The registry in src/lib/weekly.js lists each track's courses and
// aliases; an authored course carries its own units.
function normalizeNamedPlan(trackId, data, curriculum) {
  const named = namedTrack(trackId);
  assert(named, "unknown named track " + trackId);
  const label = named.planLabel;
  assert(data && data.version === 1 && data.track && data.track.id === trackId, "invalid " + label + " plan");
  plainData(data, label + " plan");
  for (const key of ["title", "description", "scopeNote"]) text(data.track[key], label + " track." + key);
  assert(Array.isArray(data.courses) && data.courses.length === named.courses.length, label + " plan needs " + (NUMBER_WORDS[named.courses.length] || named.courses.length) + " courses");
  unique(data.courses.map(c => c.id), label + " course IDs");
  assert(data.courses.every(c => named.courses.includes(c.id)), "invalid " + label + " course ID");
  assert(Array.isArray(data.sources) && Array.isArray(data.standards), "missing " + label + " reference arrays");
  unique(data.sources.map(s => s.id), label + " sources");
  unique(data.standards.map(s => s.id), label + " standards");
  const sources = data.sources.slice(), standards = data.standards.slice();
  function merge(records, additional, kind) {
    for (const record of additional) {
      const previous = records.find(r => r.id === record.id);
      assert(!previous || JSON.stringify(previous) === JSON.stringify(record), "conflicting " + kind + " " + record.id);
      if (!previous) records.push(record);
    }
  }
  const courses = named.courses.map(courseId => {
    const course = data.courses.find(c => c.id === courseId);
    for (const key of ["title", "scopeNote", "nextStep"]) text(course[key], courseId + "." + key);
    list(course.prerequisites, 1, courseId + ".prerequisites");
    list(course.outcomes, 1, courseId + ".outcomes");
    assert(course.grade === undefined, "named plan must not assign a grade " + courseId);
    let units = course.units;
    const alias = named.aliases[courseId];
    if (alias) {
      assert(course.source && course.source.trackId === alias.trackId && course.source.grade === alias.grade && course.units === undefined, "invalid source alias " + courseId);
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
    id(source.id, label + " source");
    for (const key of ["title", "publisher", "edition", "note"]) text(source[key], source.id + "." + key);
    assert(safeHttps(source.url), "invalid " + label + " source URL " + source.id);
    const timestamp = Date.parse(source.accessed);
    assert(typeof source.accessed === "string" && /^\d{4}-\d{2}-\d{2}$/.test(source.accessed) && Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === source.accessed, "invalid " + label + " source date " + source.id);
  }
  for (const standard of standards) {
    for (const key of ["id", "label", "locator", "gradeBand"]) text(standard[key], standard.id + "." + key);
    assert(sources.some(s => s.id === standard.sourceId), "unresolved " + label + " source " + standard.id);
    assert(["editorial-objective", "content", "practice", "extension"].includes(standard.kind), "invalid " + label + " reference kind " + standard.id);
  }
  const covered = new Set();
  for (const course of courses) for (const unit of course.units) for (const ref of unit.standards) {
    assert(standards.some(s => s.id === ref), "unresolved " + label + " standard " + ref);
    covered.add(ref);
  }
  assert(standards.every(s => covered.has(s.id)), "unmapped " + label + " reference");
  return { ...data, sources, standards, courses };
}
function normalizeHighSchool(data, curriculum) { return normalizeNamedPlan("high-school-math", data, curriculum); }
function loadNamedPlan(trackId, curriculum = loadCurriculum(), file = path.join(ROOT, namedTrack(trackId).planFile)) {
  return fs.existsSync(file) ? normalizeNamedPlan(trackId, JSON.parse(fs.readFileSync(file, "utf8")), curriculum) : null;
}
function loadHighSchool(curriculum = loadCurriculum(), file = path.join(ROOT, namedTrack("high-school-math").planFile)) {
  return loadNamedPlan("high-school-math", curriculum, file);
}
function courseBytes(course) { return Buffer.byteLength(JSON.stringify(course, null, 2) + "\n", "utf8"); }
// options.plans: { [namedTrackId]: normalized plan or null } overrides the
// plan files; options.highSchool remains the high-school override.
function loadWeekly({ directory = path.join(ROOT, "content/weekly"), curriculum = loadCurriculum(), highSchool, plans: given = {} } = {}) {
  const plans = {};
  for (const trackId of NAMED_TRACK_IDS) {
    plans[trackId] = Object.prototype.hasOwnProperty.call(given, trackId) ? given[trackId]
      : trackId === "high-school-math" && highSchool !== undefined ? highSchool : loadNamedPlan(trackId, curriculum);
  }
  const physicalCourses = [];
  const figureRoot = path.join(directory, "figures");
  if (fs.existsSync(directory)) for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "figures" && entry.isDirectory()) continue;
    assert(entry.isDirectory() && TRACKS.includes(entry.name), "unexpected weekly entry " + entry.name);
    const named = namedTrack(entry.name);
    for (const file of fs.readdirSync(path.join(directory, entry.name), { withFileTypes: true })) {
      const key = file.name.slice(0, -5);
      const allowed = named ? file.name.endsWith(".json") && named.courses.includes(key) && !named.aliases[key] : /^(?:k|[1-9]|1[0-2])\.json$/.test(file.name);
      assert(file.isFile() && allowed, "unexpected course file " + file.name);
      const raw = fs.readFileSync(path.join(directory, entry.name, file.name), "utf8");
      assert(Buffer.byteLength(raw, "utf8") <= MAX_COURSE_BYTES, "course file exceeds 2.5 MB: " + entry.name + "/" + file.name);
      const course = JSON.parse(raw);
      assert(course.trackId === entry.name && (named ? course.courseId === key && course.grade === undefined : course.grade === (key === "k" ? 0 : Number(key))), "course path mismatch " + entry.name + "/" + file.name);
      assert(!named || plans[entry.name], "missing year plan for " + entry.name + "/" + file.name);
      const figures = loadFigureDirectory(path.join(figureRoot, entry.name, key), entry.name + "/" + key);
      validateCourse(course, named ? plans[entry.name] : curriculum.tracks.find(t => t.track.id === entry.name), { figures });
      const built = withFigures(course, figures);
      assert(courseBytes(built) <= MAX_COURSE_BYTES, "built course with figures exceeds 2.5 MB: " + entry.name + "/" + file.name);
      physicalCourses.push(built);
    }
  }
  // Figure directories belong to existing course files.
  if (fs.existsSync(figureRoot)) for (const trackEntry of fs.readdirSync(figureRoot, { withFileTypes: true })) {
    assert(trackEntry.isDirectory() && TRACKS.includes(trackEntry.name), "unexpected figure entry " + trackEntry.name);
    for (const courseEntry of fs.readdirSync(path.join(figureRoot, trackEntry.name), { withFileTypes: true })) {
      assert(courseEntry.isDirectory() && physicalCourses.some(c => c.trackId === trackEntry.name && courseKey(c) === courseEntry.name),
        "figure directory without a course: " + trackEntry.name + "/" + courseEntry.name);
    }
  }
  function planFor(course) { return course.courseId ? plans[course.trackId].courses.find(p => p.id === course.courseId) : curriculum.tracks.find(t => t.track.id === course.trackId).courses.find(p => p.grade === course.grade); }
  const courses = physicalCourses.map(course => course.courseId ? { ...course, courseTitle: planFor(course).title, scopeNote: planFor(course).scopeNote } : course);
  for (const trackId of NAMED_TRACK_IDS) if (plans[trackId]) for (const plan of plans[trackId].courses.filter(c => c.source)) {
    const source = physicalCourses.find(c => c.trackId === plan.source.trackId && c.grade === plan.source.grade);
    if (source) {
      const { grade, ...data } = source;
      // Only the final bridge changes for the named sequence. Problems,
      // examples, keys and every other teaching field retain their source data.
      const weeks = source.weeks.map(week => week.week === 36 ? { ...week, connection: { ...week.connection, after: plan.nextStep } } : week);
      courses.push({ ...data, trackId, courseId: plan.id, courseTitle: plan.title, scopeNote: plan.scopeNote, source: { ...plan.source }, weeks });
    }
  }
  const namedOrder = course => NAMED_TRACK_IDS.indexOf(course.trackId) * 1000 + namedTrack(course.trackId).courses.indexOf(course.courseId);
  courses.sort((a, b) => {
    if (a.courseId && b.courseId) return namedOrder(a) - namedOrder(b);
    if (a.courseId || b.courseId) return a.courseId ? 1 : -1;
    return b.grade - a.grade || GRADE_TRACKS.indexOf(a.trackId) - GRADE_TRACKS.indexOf(b.trackId);
  });
  const index = { version: 1, courses: courses.map(c => ({ trackId: c.trackId,
    ...(c.courseId ? { courseId: c.courseId, scopeNote: c.scopeNote, ...(c.source ? { source: c.source } : {}) } : { grade: c.grade }),
    title: planFor(c).title,
    weeks: c.weeks.map(w => ({ week: w.week, unitId: w.unitId, title: w.title })),
    file: "content/weekly/" + c.trackId + "/" + courseKey(c) + ".json" })) };
  return { index, courses, physicalCourses, highSchool: plans["high-school-math"], plans };
}
function script(comment, global, data) {
  return "/* " + comment + " */\nwindow." + global + " = " + JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + ";\n";
}
function build(options = {}) {
  const { index, courses, physicalCourses, plans } = loadWeekly(options);
  const output = options.output || path.join(ROOT, "dist");
  const directory = path.join(output, "content");
  fs.mkdirSync(directory, { recursive: true });
  fs.rmSync(path.join(directory, "weekly"), { recursive: true, force: true });
  for (let i = 0; i < courses.length; i++) {
    const target = path.join(output, index.courses[i].file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(courses[i], null, 2) + "\n");
  }
  // Standalone copies of the figure files, beside the inlined course data.
  let figureCount = 0;
  for (const course of physicalCourses) for (const week of course.weeks) for (const figure of week.figures || []) {
    const target = path.join(directory, "weekly/figures", course.trackId, courseKey(course), figure.id + ".svg");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, figure.svg); figureCount++;
  }
  fs.writeFileSync(path.join(directory, "weekly-index.js"), script("Generated weekly course index; courses load on demand.", "LIMINAL_WEEKLY_INDEX", index));
  fs.writeFileSync(path.join(directory, "weekly-index.json"), JSON.stringify(index, null, 2) + "\n");
  for (const trackId of NAMED_TRACK_IDS) {
    const named = namedTrack(trackId);
    let data = plans[trackId];
    // The high-school page always loads its bundle; other plans ship when present.
    if (!data && trackId === "high-school-math") data = { version: 1, track: { id: "high-school-math", title: "High-school mathematics", description: "Conventional sequence with flexible placement.", scopeNote: "Editorial course sequence." }, sources: [], standards: [], courses: [] };
    const base = path.join(directory, named.planOutput);
    if (!data) { fs.rmSync(base + ".js", { force: true }); fs.rmSync(base + ".json", { force: true }); continue; }
    fs.writeFileSync(base + ".js", script("Generated named " + named.planLabel + " plans.", named.planGlobal, data));
    fs.writeFileSync(base + ".json", JSON.stringify(data, null, 2) + "\n");
  }
  console.log("Built " + physicalCourses.length + " complete weekly courses (" + courses.length + " course views" + (figureCount ? ", " + figureCount + " figures" : "") + ").");
  return index;
}
module.exports = { MAX_COURSE_BYTES, validateCourse, withFigures, normalizeNamedPlan, normalizeHighSchool, loadNamedPlan, loadHighSchool, loadWeekly, build, safeHttps, taskIdentity };
if (require.main === module) build();
