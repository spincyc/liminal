#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const D = require("../src/lib/daily-reading");
const ROOT = path.resolve(__dirname, "..");
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
  unique(course.sources.map(source => source && source.id), prefix + ".sources");
  course.sources.forEach(source => {
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
  unique(course.sources.map(sourceIdentity), prefix + ".bibliographic sources");
  assert(Array.isArray(course.days) && course.days.length === 180, prefix + " must contain exactly 180 nights");
  const ids = new Set(), hashes = new Map(), selections = new Map(), usedSources = new Set();
  course.days.forEach((day, index) => {
    const week = Math.floor(index / 5) + 1, number = index % 5 + 1;
    const expected = "reading-" + key + "-w" + String(week).padStart(2, "0") + "-d" + number;
    record(day, expected);
    assert(day.id === expected && day.week === week && day.day === number, "unordered or invalid day identity at " + expected);
    assert(!ids.has(day.id), "duplicate ID " + day.id); ids.add(day.id);
    const source = course.sources.find(item => item.id === day.sourceId);
    assert(source, "unresolved source at " + day.id); usedSources.add(day.sourceId);
    for (const field of ["title", "genre", "challenge", "focus", "context"]) text(day[field], day.id + "." + field);
    for (const field of ["author", "workTitle"]) if (Object.hasOwn(day, field)) text(day[field], day.id + "." + field);
    nullableText(day.contentNote, day.id + ".contentNote");
    assert(["adult-read-aloud", "shared", "independent"].includes(day.readingMode), "invalid reading mode at " + day.id);
    record(day.time, day.id + ".time");
    for (const field of ["readingMinutes", "discussionMinutes", "totalMinutes"]) assert(Number.isInteger(day.time[field]) && day.time[field] > 0, "invalid minutes at " + day.id);
    const [minimum, maximum] = D.minuteRange(course.grade);
    assert(day.time.readingMinutes + day.time.discussionMinutes === day.time.totalMinutes && day.time.totalMinutes >= minimum && day.time.totalMinutes <= maximum, "time budget/sum outside grade range at " + day.id);
    record(day.excerpt, day.id + ".excerpt"); text(day.excerpt.locator, day.id + ".locator");
    assert(typeof day.excerpt.isCompleteWork === "boolean", "missing complete-work declaration at " + day.id);
    list(day.blocks, 1, day.id + ".blocks");
    day.blocks.forEach((block, i) => { record(block, day.id + ".blocks." + i); assert(["paragraph", "stanza", "heading"].includes(block.type), "invalid block type at " + day.id); text(block.text, day.id + ".blocks." + i); });
    assert(day.blocks.some(block => block.type !== "heading"), "selection contains only headings at " + day.id);
    assert(typeof day.excerpt.textHash === "string" && /^[0-9a-f]{64}$/.test(day.excerpt.textHash) && day.excerpt.textHash === textHash(day), "text hash mismatch at " + day.id);
    const normalized = normalizedText(blockText(day));
    assert(!hashes.has(day.excerpt.textHash) && !selections.has(normalized), "duplicate reading at " + day.id + " (first at " + (hashes.get(day.excerpt.textHash) || selections.get(normalized)) + ")");
    hashes.set(day.excerpt.textHash, day.id); selections.set(normalized, day.id);
    for (const [field, offset, inverse] of [["continuesFrom", -1, "continuesTo"], ["continuesTo", 1, "continuesFrom"]]) {
      const ref = day.excerpt[field];
      if (ref === null) continue;
      const neighbor = course.days[index + offset];
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
  });
  assert(course.sources.every(source => usedSources.has(source.id)), "unused source at " + prefix);
  return course;
}
function validateCorpus(courses, { complete = false, completeAdvanced = false } = {}) {
  assert(Array.isArray(courses), "corpus must be an array"); courses.forEach(validateGrade);
  unique(courses.map(course => course.grade), "corpus grades");
  const has = grade => courses.some(course => course.grade === grade);
  // K–12 and Advanced 1–4 complete separately, so authoring advanced levels
  // never blocks the K–12 gate.
  if (complete) assert(D.GRADES.filter(grade => !D.isAdvanced(grade)).every(has), "complete corpus requires 13 grades and 2340 nights");
  if (completeAdvanced) assert(D.GRADES.filter(D.isAdvanced).every(has), "complete advanced corpus requires Advanced 1–4 and 720 nights");
  const selections = new Map(), ids = new Set();
  for (const course of courses) for (const day of course.days) {
    const normalized = normalizedText(blockText(day));
    assert(!selections.has(normalized), "duplicate reading across corpus at " + day.id + " (first at " + selections.get(normalized) + ")");
    selections.set(normalized, day.id);
    for (const item of [day, ...day.questions]) { assert(!ids.has(item.id), "duplicate corpus ID " + item.id); ids.add(item.id); }
  }
  return courses;
}
function loadDailyReading({ directory = path.join(ROOT, "content/reading-daily"), complete = false, completeAdvanced = false } = {}) {
  const courses = [];
  if (fs.existsSync(directory)) for (const file of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(file.isFile() && /^(?:k|[1-9]|1[0-2]|a[1-4])\.json$/.test(file.name), "unexpected grade file " + file.name);
    const course = JSON.parse(fs.readFileSync(path.join(directory, file.name), "utf8"));
    assert(D.gradeKey(course.grade) + ".json" === file.name, "grade path mismatch " + file.name); courses.push(course);
  }
  courses.sort((a, b) => a.grade - b.grade); validateCorpus(courses, { complete, completeAdvanced });
  const index = { schemaVersion: 1, grades: courses.map(course => ({ grade: course.grade, title: course.title, nights: course.days.length,
    file: "content/reading-daily/" + D.gradeKey(course.grade) + ".json" })) };
  return { index, courses };
}
function build(options = {}) {
  // Admission finishes before writing, so malformed content cannot replace a
  // previously valid library. Rights declarations are checked, not proved.
  const { index, courses } = loadDailyReading(options);
  const output = options.output || path.join(ROOT, "dist"), directory = path.join(output, "content/reading-daily");
  fs.rmSync(directory, { recursive: true, force: true }); fs.mkdirSync(directory, { recursive: true });
  for (const course of courses) fs.writeFileSync(path.join(directory, D.gradeKey(course.grade) + ".json"), JSON.stringify(course) + "\n");
  fs.writeFileSync(path.join(directory, "index.json"), JSON.stringify(index) + "\n");
  console.log("Built daily reading: " + courses.length + " complete grades, " + courses.length * 180 + " nights.");
  return index;
}
module.exports = { validateGrade, validateCorpus, loadDailyReading, build, textHash, blockText, normalizedText };
if (require.main === module) { try { build({ complete: process.argv.includes("--complete"), completeAdvanced: process.argv.includes("--complete-advanced") }); } catch (error) { console.error(error.message); process.exitCode = 1; } }
