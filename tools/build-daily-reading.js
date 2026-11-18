#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const D = require("../src/lib/daily-reading");
const L = require("../src/lib/reading-library");
const C = require("../src/lib/reading-calendar");
const { loadLibrary, sourceRecord, buildLibrary } = require("./build-reading-library");
const ROOT = path.resolve(__dirname, "..");
// New continuous runs are at most this many nights; the shared calendar
// spans (C.MAX_SPAN) also hold the school year's longer runs.
const MAX_EXTRA_CHAIN = 10;
function assert(value, message) { if (!value) throw new Error("Daily reading: " + message); }
function record(value, where) { assert(value && typeof value === "object" && !Array.isArray(value), "expected object at " + where); }
function text(value, where) { assert(typeof value === "string" && value.trim(), "missing text at " + where); }
function nullableText(value, where) { if (value !== null) text(value, where); }
function id(value, where) { assert(typeof value === "string" && /^[a-z0-9][a-z0-9._:-]*$/.test(value), "invalid ID at " + where); }
function list(value, minimum, where) { assert(Array.isArray(value) && value.length >= minimum, "too few entries at " + where); }
function unique(values, where) { assert(new Set(values).size === values.length, "duplicate ID/reference at " + where); }
function year(value, where) { assert(Number.isInteger(value) && value >= 1 && value <= new Date().getUTCFullYear(), "invalid publication year at " + where); }
function date(value, where) {
  const time = Date.parse(value);
  assert(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value && time <= Date.now(), "invalid verification date at " + where);
}
function plainData(value, where) {
  if (typeof value === "string") assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) && !/<!--|<!doctype\b|<\/?[a-z][a-z0-9:-]*(?:\s[^<>]*)?\s*\/?>/i.test(value), "non-plain text at " + where);
  else if (Array.isArray(value)) value.forEach((item, index) => plainData(item, where + "." + index));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => plainData(item, where + "." + key));
}
function blockText(day) { return day.blocks.map(block => block.text).join("\n\n").normalize("NFC"); }
function textHash(day) { return crypto.createHash("sha256").update(blockText(day), "utf8").digest("hex"); }
function normalizedText(value) { return value.normalize("NFC").replace(/\s+/gu, " ").trim(); }
function sourceIdentity(source) {
  return JSON.stringify([source.author, source.title, source.translator, source.edition, source.publicationYear, source.translationYear]
    .map(value => typeof value === "string" ? normalizedText(value).toLowerCase() : value));
}

// Library citations. A reading whose excerpt names a block range of a
// library work gets its text from that work; a grade's sources are its
// legacy inline records (while any remain) plus the library works its
// nights cite, in order of first use. Consumers see the same shape either way.
function resolveReading(reading, library, where) {
  if (!reading || typeof reading !== "object" || !reading.excerpt || !Array.isArray(reading.excerpt.blocks)) return reading;
  assert(!Object.hasOwn(reading, "blocks"), "a reading cites a range or carries its text, not both, at " + where);
  const entry = library.get(reading.sourceId);
  assert(entry, "range cites a work missing from the library at " + where);
  let blocks;
  try { blocks = L.resolveRange(entry.blocks, reading.excerpt, where); } catch (error) { assert(false, error.message); }
  return { ...reading, blocks };
}
function citedSources(readings, library, initial = []) {
  const sources = initial.slice(), known = new Set(sources.map(source => source && source.id));
  for (const reading of readings) {
    const sourceId = reading && reading.sourceId;
    if (!known.has(sourceId) && library.has(sourceId)) { known.add(sourceId); sources.push(sourceRecord(library.get(sourceId).work)); }
  }
  return sources;
}
function resolveCourse(raw, library = new Map()) {
  record(raw, "grade");
  const days = Array.isArray(raw.days) ? raw.days.map(day => resolveReading(day, library, day && day.id)) : raw.days;
  return { ...raw, sources: citedSources(Array.isArray(days) ? days : [], library, Array.isArray(raw.sources) ? raw.sources : []), days };
}

function validateSources(sources, prefix) {
  unique(sources.map(source => source && source.id), prefix + ".sources");
  sources.forEach(source => {
    const where = prefix + ".source." + (source && source.id); record(source, where); id(source.id, where);
    for (const field of ["author", "title", "edition"]) text(source[field], where + "." + field);
    year(source.publicationYear, where); nullableText(source.translator, where + ".translator");
    if (source.translator === null) assert(source.translationYear === null, "unpaired translator/year at " + where);
    else year(source.translationYear, where + ".translationYear");
    for (const field of ["url", "textUrl"]) assert(D.safeHttps(source[field]), "unsafe source URL at " + where + "." + field);
    record(source.rights, where + ".rights");
    assert(source.rights.jurisdiction === "US" && source.rights.status === "public-domain", "invalid rights declaration at " + where);
    text(source.rights.basis, where + ".rights.basis"); date(source.rights.verifiedDate, where + ".rights.verifiedDate");
    assert(D.safeHttps(source.rights.evidenceUrl), "unsafe rights evidence URL at " + where);
  });
  unique(sources.map(sourceIdentity), prefix + ".bibliographic sources");
}
// One reading: a school night or a calendar reading. `neighbors` are the
// records before and after it in its own sequence (continuations must be
// reciprocal neighbours from the same source).
function validateReading(day, { grade, sources, ids, hashes, selections, previous, next }) {
  const source = sources.find(item => item.id === day.sourceId);
  assert(source, "unresolved source at " + day.id);
  for (const field of ["title", "genre", "challenge", "focus", "context"]) text(day[field], day.id + "." + field);
  for (const field of ["author", "workTitle"]) if (Object.hasOwn(day, field)) text(day[field], day.id + "." + field);
  nullableText(day.contentNote, day.id + ".contentNote");
  assert(D.MODES.includes(day.readingMode), "invalid reading mode at " + day.id);
  record(day.time, day.id + ".time");
  for (const field of ["readingMinutes", "discussionMinutes", "totalMinutes"]) assert(Number.isInteger(day.time[field]) && day.time[field] > 0, "invalid minutes at " + day.id);
  const [minimum, maximum] = D.minuteRange(grade);
  assert(day.time.readingMinutes + day.time.discussionMinutes === day.time.totalMinutes && day.time.totalMinutes >= minimum && day.time.totalMinutes <= maximum, "time budget/sum outside grade range at " + day.id);
  record(day.excerpt, day.id + ".excerpt"); text(day.excerpt.locator, day.id + ".locator");
  assert(typeof day.excerpt.isCompleteWork === "boolean", "missing complete-work declaration at " + day.id);
  if (Object.hasOwn(day.excerpt, "inlineReason")) {
    text(day.excerpt.inlineReason, day.id + ".excerpt.inlineReason");
    assert(!Array.isArray(day.excerpt.blocks), "a range citation has no inline reason at " + day.id);
  }
  list(day.blocks, 1, day.id + ".blocks");
  day.blocks.forEach((block, i) => { record(block, day.id + ".blocks." + i); assert(["paragraph", "stanza", "heading"].includes(block.type), "invalid block type at " + day.id); text(block.text, day.id + ".blocks." + i); });
  assert(day.blocks.some(block => block.type !== "heading"), "selection contains only headings at " + day.id);
  assert(typeof day.excerpt.textHash === "string" && /^[0-9a-f]{64}$/.test(day.excerpt.textHash) && day.excerpt.textHash === textHash(day), "text hash mismatch at " + day.id);
  const normalized = normalizedText(blockText(day));
  assert(!hashes.has(day.excerpt.textHash) && !selections.has(normalized), "duplicate reading at " + day.id + " (first at " + (hashes.get(day.excerpt.textHash) || selections.get(normalized)) + ")");
  hashes.set(day.excerpt.textHash, day.id); selections.set(normalized, day.id);
  for (const [field, neighbor, inverse] of [["continuesFrom", previous, "continuesTo"], ["continuesTo", next, "continuesFrom"]]) {
    const ref = day.excerpt[field];
    if (ref === null) continue;
    assert(typeof ref === "string" && neighbor && ref === neighbor.id && neighbor.excerpt && neighbor.excerpt[inverse] === day.id && neighbor.sourceId === day.sourceId && !day.excerpt.isCompleteWork, "invalid continuation at " + day.id + "." + field);
  }
  list(day.questions, 3, day.id + ".questions");
  unique(day.questions.map(question => question && question.id), day.id + ".questions");
  unique(day.questions.map(question => question && normalizedText(String(question.prompt || ""))), day.id + ".question prompts");
  day.questions.forEach(question => {
    record(question, day.id + ".question"); id(question.id, day.id + ".question");
    assert(!ids.has(question.id), "duplicate ID " + question.id); ids.add(question.id);
    text(question.prompt, question.id + ".prompt");
    for (const field of ["facilitatorNotes", "evidence"]) { list(question[field], 1, question.id + "." + field); question[field].forEach(value => text(value, question.id + "." + field)); }
    question.evidence.forEach(value => assert(normalized.includes(normalizedText(value)), "quoted evidence missing from selection at " + question.id));
  });
  return source;
}
function validateGrade(course) {
  record(course, "grade");
  assert(course.schemaVersion === 1 && D.validGrade(course.grade), "invalid schema version or grade");
  const key = D.gradeKey(course.grade), prefix = "grade " + key;
  plainData(course, prefix);
  for (const field of ["title", "overview"]) text(course[field], prefix + "." + field);
  list(course.progression, 1, prefix + ".progression");
  let nextWeek = 1;
  course.progression.forEach((item, index) => {
    const where = prefix + ".progression." + index; record(item, where);
    assert(Array.isArray(item.weeks) && item.weeks.length === 2 && item.weeks[0] === nextWeek && Number.isInteger(item.weeks[1]) && item.weeks[1] >= nextWeek && item.weeks[1] <= 36, "progression must cover weeks 1–36 in order at " + where);
    for (const field of ["focus", "rationale"]) text(item[field], where + "." + field);
    nextWeek = item.weeks[1] + 1;
  });
  assert(nextWeek === 37, "progression must cover all 36 weeks at " + prefix);
  list(course.sources, 10, prefix + ".sources");
  validateSources(course.sources, prefix);
  assert(Array.isArray(course.days) && course.days.length === 180, prefix + " must contain exactly 180 nights");
  const ids = new Set(), hashes = new Map(), selections = new Map(), usedSources = new Set();
  course.days.forEach((day, index) => {
    const week = Math.floor(index / 5) + 1, number = index % 5 + 1;
    const expected = "reading-" + key + "-w" + String(week).padStart(2, "0") + "-d" + number;
    record(day, expected);
    assert(day.id === expected && day.week === week && day.day === number, "unordered or invalid day identity at " + expected);
    assert(!ids.has(day.id), "duplicate ID " + day.id); ids.add(day.id);
    usedSources.add(validateReading(day, { grade: course.grade, sources: course.sources, ids, hashes, selections,
      previous: course.days[index - 1], next: course.days[index + 1] }).id);
  });
  assert(course.sources.every(source => usedSources.has(source.id)), "unused source at " + prefix);
  return course;
}

// Calendar readings beyond the 180 school nights:
// content/reading-daily/extra/<grade-key>/<work-id>.json, one work per file,
// readings in reading order. Continuous runs are chains of neighbours.
function chainLengths(readings) {
  const lengths = [];
  readings.forEach((reading, i) => { if (i > 0 && reading.excerpt && reading.excerpt.continuesFrom) lengths[lengths.length - 1]++; else lengths.push(1); });
  return lengths;
}
function validateExtra(file, library = new Map()) {
  const key = file.grade, where = "extra " + key + "/" + file.work, raw = file.data, grade = D.gradeFromKey(key);
  record(raw, where);
  assert(raw.schemaVersion === 1 && raw.grade === grade && raw.work === file.work, "schema version, grade or work does not match its path at " + where);
  plainData(raw, where);
  list(raw.readings, 1, where + ".readings");
  assert(library.has(raw.work), "cites a work missing from the library at " + where);
  const readings = raw.readings.map((reading, i) => resolveReading(reading, library, where + "." + i));
  const sources = citedSources(readings, library);
  const ids = new Set(), hashes = new Map(), selections = new Map();
  readings.forEach((reading, index) => {
    const expected = "reading-" + key + "-" + raw.work + "-" + String(index + 1).padStart(2, "0");
    record(reading, expected);
    assert(reading.id === expected && reading.sourceId === raw.work, "reading id or source does not follow its file at " + expected);
    assert(!Object.hasOwn(reading, "week") && !Object.hasOwn(reading, "day"), "calendar readings have no school week/day at " + expected);
    assert(Array.isArray(reading.excerpt && reading.excerpt.blocks) || (reading.excerpt && reading.excerpt.inlineReason), "a calendar reading cites a library range at " + expected);
    if (Object.hasOwn(reading, "months")) assert(Array.isArray(reading.months) && reading.months.length >= 1 && reading.months.every(m => Number.isInteger(m) && m >= 1 && m <= 12) && new Set(reading.months).size === reading.months.length, "months must list distinct months 1-12 at " + expected);
    assert(!ids.has(reading.id), "duplicate ID " + reading.id); ids.add(reading.id);
    validateReading(reading, { grade, sources, ids, hashes, selections, previous: readings[index - 1], next: readings[index + 1] });
  });
  assert(Math.max(...chainLengths(readings)) <= MAX_EXTRA_CHAIN, "a continuous run longer than " + MAX_EXTRA_CHAIN + " nights at " + where);
  return { grade, key, work: raw.work, sources, readings };
}

// Every reading of every level, school and calendar, as one list.
function allReadings(courses, extras) {
  return [...courses.flatMap(course => course.days.map(day => ({ grade: course.grade, reading: day, sources: course.sources }))),
    ...extras.flatMap(extra => extra.readings.map(reading => ({ grade: extra.grade, reading, sources: extra.sources })))];
}
function validateCorpus(courses, { complete = false, completeAdvanced = false, extras = [], library = new Map() } = {}) {
  assert(Array.isArray(courses), "corpus must be an array"); courses.forEach(validateGrade);
  unique(courses.map(course => course.grade), "corpus grades");
  const has = grade => courses.some(course => course.grade === grade);
  // K–12 and Advanced 1–4 complete separately, so authoring advanced levels
  // never blocks the K–12 gate.
  if (complete) assert(D.GRADES.filter(grade => !D.isAdvanced(grade)).every(has), "complete corpus requires 13 grades and 2340 nights");
  if (completeAdvanced) assert(D.GRADES.filter(D.isAdvanced).every(has), "complete advanced corpus requires Advanced 1–4 and 720 nights");
  const selections = new Map(), ids = new Set(), ranges = new Map(), uniqueBlocks = new Map();
  for (const { reading } of allReadings(courses, extras)) {
    const normalized = normalizedText(blockText(reading));
    assert(!selections.has(normalized), "duplicate reading across corpus at " + reading.id + " (first at " + selections.get(normalized) + ")");
    selections.set(normalized, reading.id);
    for (const item of [reading, ...reading.questions]) { assert(!ids.has(item.id), "duplicate corpus ID " + item.id); ids.add(item.id); }
    const range = L.rangeOf(reading.excerpt);
    if (library.has(reading.sourceId)) {
      if (!ranges.has(reading.sourceId)) ranges.set(reading.sourceId, []);
      const spans = ranges.get(reading.sourceId), work = library.get(reading.sourceId).blocks;
      if (range) spans.push({ id: reading.id, ...L.span(range, work) });
      else for (const block of coveredBlocks(reading, reading.sourceId, work, uniqueBlocks)) spans.push({ id: reading.id, start: [block, 0], end: [block, work[block].text.length] });
    }
  }
  // No passage of a work is read twice anywhere in the corpus.
  const before = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  for (const [work, spans] of ranges) {
    spans.sort((a, b) => before(a.start, b.start) ? -1 : before(b.start, a.start) ? 1 : 0);
    let furthest = null;
    for (const item of spans) {
      assert(!furthest || !before(item.start, furthest.end), "overlapping excerpts of " + work + ": " + furthest?.id + " and " + item.id);
      if (!furthest || before(furthest.end, item.end)) furthest = item;
    }
    // A work checked against its printed witness only in places lends
    // readings only from those places (scope.collated, docs/reading-library.md).
    const collated = library.get(work).work && library.get(work).work.scope.collated;
    if (collated) for (const item of spans) {
      assert(collated.some(([first, last]) => first <= item.start[0] && item.end[0] <= last),
        item.id + " reads blocks " + item.start[0] + "–" + item.end[0] + " of " + work + ", outside the text collated with its witness (scope.collated); collate them first and record it, or choose another passage");
    }
  }
  return courses;
}

// A reading that keeps its own text (excerpt.inlineReason) but cites a
// library work still reads a passage of it. The work's substantial blocks that
// occur once in the work and appear, spacing aside, inside the reading's text
// mark the blocks it covers, so no other reading can repeat that passage
// unnoticed. Note anchors such as [1] and spacing are set aside, so a night
// that leaves out an anchor or divides lines differently still covers it.
const spaced = text => text.replace(/\[(?:\d+|[*†‡§A-Za-z])\]/g, "").replace(/\s+/g, " ").trim();
function coveredBlocks(reading, id, work, cache) {
  if (!cache.has(id)) {
    const count = new Map();
    for (const block of work) { const text = spaced(block.text); count.set(text, (count.get(text) || 0) + 1); }
    cache.set(id, work.map((block, index) => ({ index, text: spaced(block.text) })).filter(item => item.text.length >= 30 && count.get(item.text) === 1));
  }
  const whole = spaced((reading.blocks || []).map(block => block.text).join(" "));
  return cache.get(id).filter(item => whole.includes(item.text)).map(item => item.index);
}

// The date calendar (docs/daily-reading.md): calendar/spans.json, shared by
// every level, and calendar/<grade-key>.json with a level's three cycle
// years of 366 reading ids. A level may be absent until it is complete.
// The calendar is written a cycle year at a time (owner direction,
// 2026-11-17): a year not yet written is null in the spans and in every
// level's calendar. Written years never repeat a reading, and once all three
// are written every reading of the level is placed exactly once.
function validateCalendar(spans, calendars, readingsByGrade) {
  if (!calendars.length) return;
  C.checkSpans(spans);
  const written = spans.years.map(lengths => lengths !== null);
  for (const calendar of calendars) {
    const where = "calendar " + calendar.key;
    record(calendar.data, where);
    const grade = D.gradeFromKey(calendar.key), data = calendar.data, readings = readingsByGrade.get(grade);
    assert(data.schemaVersion === 1 && data.grade === grade, "schema version or grade does not match its path at " + where);
    assert(readings, "no readings for " + where);
    assert(Array.isArray(data.years) && data.years.length === C.CYCLE && data.years.every((year, y) => written[y] ? Array.isArray(year) && year.length === C.SLOTS : year === null),
      "each cycle year is 366 slots when the spans write it and null when they do not, at " + where);
    const placed = data.years.filter(Boolean).flat();
    unique(placed, where + " (a reading placed twice)");
    assert(placed.every(id => readings.has(id)), "a slot names a reading this level does not have at " + where);
    if (written.every(Boolean)) assert(placed.length === readings.size, where + " places " + placed.length + " of the level's " + readings.size + " readings; every reading must be placed exactly once");
    data.years.forEach((ids, y) => {
      if (!ids) return;
      const spanOf = new Map();
      C.spanRanges(spans.years[y]).forEach(([first, last], n) => { for (let slot = first; slot <= last; slot++) spanOf.set(slot, n); });
      ids.forEach((id, i) => {
        const reading = readings.get(id), slot = i + 1;
        if (reading.excerpt.continuesTo) assert(ids[i + 1] === reading.excerpt.continuesTo && spanOf.get(slot + 1) === spanOf.get(slot),
          "a continuous run must stay on consecutive days inside one shared span at " + where + " year " + (y + 1) + " slot " + slot + " (" + id + ")");
        if (reading.excerpt.continuesFrom) assert(ids[i - 1] === reading.excerpt.continuesFrom && spanOf.get(slot - 1) === spanOf.get(slot),
          "a continuous run must start inside its span at " + where + " year " + (y + 1) + " slot " + slot + " (" + id + ")");
      });
    });
  }
}

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function loadDailyReading({ directory = path.join(ROOT, "content/reading-daily"), libraryDirectory, library: given, complete = false, completeAdvanced = false, completeCalendar = false } = {}) {
  const library = given || loadLibrary(libraryDirectory ? { directory: libraryDirectory } : {});
  const courses = [], extraFiles = [], calendarFiles = [];
  let spans = null;
  if (fs.existsSync(directory)) for (const file of fs.readdirSync(directory, { withFileTypes: true })) {
    if (file.isDirectory() && file.name === "extra") {
      for (const level of fs.readdirSync(path.join(directory, "extra"), { withFileTypes: true })) {
        assert(level.isDirectory() && D.gradeFromKey(level.name) !== null, "unexpected extra entry " + level.name);
        for (const item of fs.readdirSync(path.join(directory, "extra", level.name), { withFileTypes: true })) {
          assert(item.isFile() && /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(item.name), "unexpected extra file " + level.name + "/" + item.name);
          extraFiles.push({ grade: level.name, work: item.name.slice(0, -5), data: readJson(path.join(directory, "extra", level.name, item.name)) });
        }
      }
      continue;
    }
    if (file.isDirectory() && file.name === "calendar") {
      for (const item of fs.readdirSync(path.join(directory, "calendar"), { withFileTypes: true })) {
        if (item.name === "spans.json") { spans = readJson(path.join(directory, "calendar", item.name)); continue; }
        assert(item.isFile() && /^(?:k|[1-9]|1[0-2]|a[1-4])\.json$/.test(item.name), "unexpected calendar file " + item.name);
        calendarFiles.push({ key: item.name.slice(0, -5), data: readJson(path.join(directory, "calendar", item.name)) });
      }
      continue;
    }
    assert(file.isFile() && /^(?:k|[1-9]|1[0-2]|a[1-4])\.json$/.test(file.name), "unexpected grade file " + file.name);
    const course = resolveCourse(readJson(path.join(directory, file.name)), library);
    assert(D.gradeKey(course.grade) + ".json" === file.name, "grade path mismatch " + file.name); courses.push(course);
  }
  courses.sort((a, b) => a.grade - b.grade);
  extraFiles.sort((a, b) => D.gradeFromKey(a.grade) - D.gradeFromKey(b.grade) || a.work.localeCompare(b.work));
  const extras = extraFiles.map(file => validateExtra(file, library));
  for (const extra of extras) assert(courses.some(course => course.grade === extra.grade), "calendar readings for a level without a school year: " + extra.key);
  validateCorpus(courses, { complete, completeAdvanced, extras, library });
  const readingsByGrade = new Map(courses.map(course => [course.grade, new Map(course.days.map(day => [day.id, day]))]));
  for (const extra of extras) for (const reading of extra.readings) readingsByGrade.get(extra.grade).set(reading.id, reading);
  if (calendarFiles.length) assert(spans, "calendar files need calendar/spans.json");
  validateCalendar(spans, calendarFiles, readingsByGrade);
  const calendars = new Map(calendarFiles.map(file => [D.gradeFromKey(file.key), file.data]));
  // The spans are shared, so a written year is written for every K–12 level.
  const schoolLevels = courses.filter(course => !D.isAdvanced(course.grade));
  if (calendars.size) assert(schoolLevels.every(course => calendars.has(course.grade)), "the shared calendar needs a calendar file for every grade K–12");
  if (completeCalendar) assert(schoolLevels.every(course => calendars.has(course.grade) && C.writtenYears(calendars.get(course.grade)).every(Boolean)), "complete calendar requires all three cycle years for every grade K–12");
  const index = { schemaVersion: 1, grades: courses.map(course => ({ grade: course.grade, title: course.title, nights: course.days.length,
    readings: readingsByGrade.get(course.grade).size, calendar: calendars.has(course.grade),
    calendarYears: C.writtenYears(calendars.get(course.grade)),
    file: "content/reading-daily/" + D.gradeKey(course.grade) + ".json" })) };
  return { index, courses, extras, calendars, spans, library, readingsByGrade };
}

// Where each library work is read: every reading that cites it.
function libraryUses(courses, extras) {
  const uses = new Map();
  for (const { grade, reading } of allReadings(courses, extras)) {
    const range = L.rangeOf(reading.excerpt);
    if (!uses.has(reading.sourceId)) uses.set(reading.sourceId, []);
    uses.get(reading.sourceId).push({ id: reading.id, grade, title: reading.title, genre: reading.genre,
      ...(reading.week ? { week: reading.week, day: reading.day } : {}), blocks: range ? [range.first, range.last] : null,
      startChar: range ? range.startChar : null, endChar: range ? range.endChar : null });
  }
  return uses;
}
function build(options = {}) {
  // Admission finishes before writing, so malformed content cannot replace a
  // previously valid library. Rights declarations are checked, not proved.
  const loaded = loadDailyReading(options), { index, courses, extras, calendars, spans, library, readingsByGrade } = loaded;
  const output = options.output || path.join(ROOT, "dist"), directory = path.join(output, "content/reading-daily");
  fs.rmSync(directory, { recursive: true, force: true }); fs.mkdirSync(directory, { recursive: true });
  fs.mkdirSync(path.join(directory, "browse"));
  for (const course of courses) {
    fs.writeFileSync(path.join(directory, D.gradeKey(course.grade) + ".json"), JSON.stringify(course) + "\n");
    // The browse view loads only this year-at-a-glance file, not the texts;
    // the reader loads only the week of the night it opens.
    fs.writeFileSync(path.join(output, D.browseFile(course.grade)), JSON.stringify(D.browseIndex(course)) + "\n");
    fs.mkdirSync(path.join(directory, "weeks", D.gradeKey(course.grade)), { recursive: true });
    for (let week = 1; week <= 36; week++) fs.writeFileSync(path.join(output, D.weekFile(course.grade, week)), JSON.stringify(D.weekSlice(course, week)) + "\n");
  }
  // One file per reading (school night or calendar reading), for the date
  // view and links from the library; and each level's calendar.
  const sourcesOf = new Map([...courses.map(course => [course.grade, course.sources])]);
  for (const extra of extras) sourcesOf.set(extra.grade, [...sourcesOf.get(extra.grade), ...extra.sources.filter(source => !sourcesOf.get(extra.grade).some(item => item.id === source.id))]);
  for (const [grade, readings] of readingsByGrade) {
    const folder = path.join(directory, "readings", D.gradeKey(grade)); fs.mkdirSync(folder, { recursive: true });
    const course = courses.find(item => item.grade === grade);
    for (const reading of readings.values()) {
      const source = sourcesOf.get(grade).find(item => item.id === reading.sourceId);
      fs.writeFileSync(path.join(folder, reading.id + ".json"), JSON.stringify({ schemaVersion: 1, grade, title: course.title, reading, source }) + "\n");
    }
  }
  if (calendars.size) {
    fs.mkdirSync(path.join(directory, "calendar"), { recursive: true });
    fs.writeFileSync(path.join(directory, "calendar", "spans.json"), JSON.stringify(spans) + "\n");
    for (const [grade, calendar] of calendars) {
      const readings = readingsByGrade.get(grade), sources = sourcesOf.get(grade);
      const entry = id => { const reading = readings.get(id), source = sources.find(item => item.id === reading.sourceId), credit = D.selectionCredit(reading, source);
        return { id, title: reading.title, author: credit.author, work: credit.workTitle || source.title, minutes: reading.time.totalMinutes,
          mode: reading.readingMode, genre: reading.genre, continuesFrom: !!reading.excerpt.continuesFrom, continuesTo: !!reading.excerpt.continuesTo,
          ...(reading.week ? { week: reading.week, day: reading.day } : {}) }; };
      fs.writeFileSync(path.join(directory, "calendar", D.gradeKey(grade) + ".json"),
        JSON.stringify({ schemaVersion: 1, grade, years: calendar.years.map(ids => ids && ids.map(entry)) }) + "\n");
    }
  }
  fs.writeFileSync(path.join(directory, "index.json"), JSON.stringify(index) + "\n");
  if (options.buildLibrary !== false) buildLibrary({ library, uses: libraryUses(courses, extras), output });
  const extraCount = extras.reduce((sum, extra) => sum + extra.readings.length, 0);
  console.log("Built daily reading: " + courses.length + " complete grades, " + courses.length * 180 + " nights in " + courses.length * 36 + " week files, "
    + extraCount + " calendar readings, " + calendars.size + " date calendars, " + library.size + " library works.");
  return index;
}
module.exports = { coveredBlocks, validateGrade, validateReading, validateExtra, validateCorpus, validateCalendar, resolveCourse, resolveReading, chainLengths, loadDailyReading, libraryUses, build, textHash, blockText, normalizedText, MAX_EXTRA_CHAIN };
if (require.main === module) { try { build({ complete: process.argv.includes("--complete"), completeAdvanced: process.argv.includes("--complete-advanced"), completeCalendar: process.argv.includes("--complete-calendar") }); } catch (error) { console.error(error.message); process.exitCode = 1; } }
