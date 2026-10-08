#!/usr/bin/env node
"use strict";
// Validates content/reading-level/probes.json against the daily library and
// writes dist/content/reading-level.js: the probe passages resolved from
// their grade files (so the quiz never downloads a whole grade), the items,
// and a small index of night titles for printable plans.
//
// A probe names one existing night by dayId AND its excerpt.textHash. The
// passage is never copied into the probe file; a hash mismatch means the
// night changed after the items were written, and the build refuses it.
const fs = require("node:fs");
const path = require("node:path");
const D = require("../src/lib/daily-reading");
const L = require("../src/lib/reading-level");
const { loadDailyReading, normalizedText, blockText } = require("./build-daily-reading");

const ROOT = path.resolve(__dirname, "..");
const PROBE_FILE = path.join(ROOT, "content/reading-level/probes.json");
// Quiz-length bounds on a probe night, in words. Short enough to read and
// answer in one sitting at the top levels, long enough to carry four items.
const MIN_WORDS = 80;
const MAX_WORDS = 1200;
// Levels the ladder is expected to cover even before their grade files land.
// Higher levels are expected whenever the daily library supplies them.
const EXPECTED_LEVELS = Array.from({ length: 12 }, (_, index) => index + 1);
// The key may not be visibly longer than every distractor: at least 25%
// longer than all three is a test-wise cue.
const LONGEST_KEY_RATIO = 1.25;
// An item may not share this many consecutive words with the night's
// discussion questions or facilitator notes, except words quoted from the
// passage itself. Items are original, never adapted from the corpus prompts.
const SHARED_WORDS = 6;
const REVIEW_STATUSES = ["unreviewed", "independently-reviewed"];
// The key may not repeat this many consecutive words of the probe's intro or
// the content note shown with it: what the screen states, an item must not ask.
const SCREEN_WORDS = 4;

function assert(value, message) { if (!value) throw new Error("Reading level: " + message); }
function text(value, where, max = 400) { assert(typeof value === "string" && value.trim() && value.length <= max && value === value.trim(), "missing or overlong text at " + where); }
function plain(value, where) {
  assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) && !/<!--|<\/?[a-z][a-z0-9:-]*(?:\s[^<>]*)?\s*\/?>/i.test(value), "non-plain text at " + where);
}
function words(value) { return normalizedText(value).toLowerCase().replace(/[^\p{L}\p{N}'’\s]/gu, " ").split(/\s+/).filter(Boolean); }
function shingles(value, size = SHARED_WORDS) {
  const list = words(value), set = new Set();
  for (let i = 0; i + size <= list.length; i++) set.add(list.slice(i, i + size).join(" "));
  return set;
}
// Quoted phrases, without the closing punctuation a sentence adds.
function quotes(value) { return [...value.matchAll(/[“"]([^”"]+)[”"]/g)].map(match => match[1].replace(/[.,;:!?]+$/u, "")); }

function validateItem(item, probe, index, passage, borrowed, screen) {
  const where = probe.id + ".items." + index;
  assert(item && typeof item === "object" && !Array.isArray(item), "expected item at " + where);
  assert(item.id === probe.id + "-" + (index + 1), "item ID must be " + probe.id + "-" + (index + 1) + " at " + where);
  assert(L.SKILLS.includes(item.skill), "unknown skill at " + item.id);
  text(item.stem, item.id + ".stem", 300); plain(item.stem, item.id + ".stem");
  assert(Array.isArray(item.options) && item.options.length === 4, "exactly four options required at " + item.id);
  item.options.forEach((option, i) => { text(option, item.id + ".options." + i, 160); plain(option, item.id + ".options." + i); });
  assert(new Set(item.options.map(option => normalizedText(option).toLowerCase())).size === 4, "options must be distinct at " + item.id);
  assert(Number.isInteger(item.key) && item.key >= 0 && item.key <= 3, "key must be one option index 0–3 at " + item.id);
  const keyLength = item.options[item.key].length;
  assert(!item.options.every((option, i) => i === item.key || keyLength >= LONGEST_KEY_RATIO * option.length), "key is visibly the longest option at " + item.id);
  text(item.rationale, item.id + ".rationale", 400); plain(item.rationale, item.id + ".rationale");
  const normalizedPassage = normalizedText(passage).toLowerCase();
  assert(quotes(item.rationale).some(quote => words(quote).length >= 2 && normalizedPassage.includes(normalizedText(quote).toLowerCase())), "rationale must quote the passage at " + item.id);
  const passageShingles = shingles(passage);
  for (const field of ["stem", "rationale", ...item.options.map((_, i) => i)]) {
    const value = typeof field === "number" ? item.options[field] : item[field];
    for (const shingle of shingles(value)) assert(passageShingles.has(shingle) || !borrowed.has(shingle), "wording copied from the night's discussion material at " + item.id + "." + field);
  }
  const keyRuns = shingles(item.options[item.key], SCREEN_WORDS);
  assert(![...shingles(screen, SCREEN_WORDS)].some(run => keyRuns.has(run)), "key repeats the intro or content note shown with the passage at " + item.id);
  const extra = Object.keys(item).filter(key => !["id", "skill", "stem", "options", "key", "rationale"].includes(key));
  assert(!extra.length, "unknown item field " + extra.join(", ") + " at " + item.id);
}

// data: parsed probes.json; courses: the validated daily library.
function validateProbes(data, courses, { complete = false } = {}) {
  assert(data && typeof data === "object" && data.schemaVersion === 1, "schemaVersion must be 1");
  text(data.title, "title");
  assert(data.review && REVIEW_STATUSES.includes(data.review.status), "review.status must be one of " + REVIEW_STATUSES.join(", "));
  text(data.review.note, "review.note", 600);
  const labels = data.levelLabels === undefined ? {} : data.levelLabels;
  assert(labels && typeof labels === "object" && !Array.isArray(labels), "levelLabels must be an object");
  for (const [key, value] of Object.entries(labels)) { assert(/^[1-9][0-9]?$/.test(key), "invalid levelLabels key " + key); text(value, "levelLabels." + key, 40); plain(value, "levelLabels." + key); }
  assert(Array.isArray(data.probes), "probes must be an array");
  const byGrade = new Map(courses.map(course => [course.grade, course]));
  const ids = new Set(), days = new Set(), forms = new Map();
  const resolved = data.probes.map((probe, index) => {
    assert(probe && typeof probe === "object" && !Array.isArray(probe), "expected probe at probes." + index);
    assert(Number.isInteger(probe.level) && probe.level >= 1 && L.validLevel(probe.level), "invalid level at probes." + index);
    assert(L.FORMS.includes(probe.form), "form must be one of " + L.FORMS.join(", ") + " at probes." + index);
    const id = "rl-" + probe.level + "-" + probe.form;
    assert(probe.id === id, "probe ID must be " + id + " at probes." + index);
    assert(!ids.has(id), "duplicate probe " + id); ids.add(id);
    const course = byGrade.get(probe.level);
    assert(course, "grade file for level " + probe.level + " is not in the daily library (" + id + ")");
    const day = course.days.find(item => item.id === probe.dayId);
    assert(typeof probe.dayId === "string" && day, "dayId does not resolve at " + id);
    assert(!days.has(probe.dayId), "night used by two probes: " + probe.dayId); days.add(probe.dayId);
    assert(probe.textHash === day.excerpt.textHash, "textHash mismatch at " + id + ": " + probe.dayId + " changed after its items were written; reread the night and review every item before updating the hash");
    assert(day.excerpt.continuesFrom === null, "probe night continues an earlier night at " + id);
    const passage = blockText(day), count = L.wordCount(passage);
    assert(count >= MIN_WORDS && count <= MAX_WORDS, "probe night has " + count + " words, outside " + MIN_WORDS + "–" + MAX_WORDS + " at " + id);
    text(probe.intro, id + ".intro", 300); plain(probe.intro, id + ".intro");
    // An optional student-facing content note replaces the night's own, which
    // is often written for an adult reader (null: show none).
    if (Object.hasOwn(probe, "contentNote") && probe.contentNote !== null) { text(probe.contentNote, id + ".contentNote", 400); plain(probe.contentNote, id + ".contentNote"); }
    const note = Object.hasOwn(probe, "contentNote") ? probe.contentNote : day.contentNote;
    assert(Array.isArray(probe.items) && probe.items.length === L.itemCount(probe.level), id + " needs " + L.itemCount(probe.level) + " items");
    const borrowed = new Set(day.questions.flatMap(question => [question.prompt, ...question.facilitatorNotes]).flatMap(value => [...shingles(value)]));
    probe.items.forEach((item, i) => validateItem(item, probe, i, passage, borrowed, probe.intro + " " + (note || "")));
    const extra = Object.keys(probe).filter(key => !["id", "level", "form", "dayId", "textHash", "intro", "contentNote", "items"].includes(key));
    assert(!extra.length, "unknown probe field " + extra.join(", ") + " at " + id);
    const levelForms = forms.get(probe.level) || []; levelForms.push(probe.form); forms.set(probe.level, levelForms);
    return { probe, day, course, words: count, note };
  });
  for (const [level, list] of forms) assert(L.FORMS.every(form => list.includes(form)), "level " + level + " needs both forms (" + L.FORMS.join(", ") + ")");
  const levels = [...forms.keys()].sort((a, b) => a - b);
  const libraryLevels = courses.map(course => course.grade).filter(grade => grade >= 1);
  const expected = [...new Set([...EXPECTED_LEVELS, ...libraryLevels])].sort((a, b) => a - b);
  const missing = expected.filter(level => !forms.has(level));
  if (complete) assert(!missing.length, "complete probe set requires every level; missing " + missing.join(", "));
  return { resolved, levels, missing, pendingGrades: missing.filter(level => !byGrade.has(level)), labels };
}

function loadProbes({ file = PROBE_FILE, directory, complete = false } = {}) {
  const { courses } = loadDailyReading(directory ? { directory } : {});
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return { data, courses, ...validateProbes(data, courses, { complete }) };
}

function bundle({ data, courses, resolved, levels, labels }) {
  const probes = resolved.map(({ probe, day, course, words, note }) => {
    const source = D.sourceAt(course, day), credit = D.selectionCredit(day, source);
    return { id: probe.id, level: probe.level, form: probe.form, dayId: day.id, week: day.week, day: day.day, title: day.title,
      workTitle: credit.workTitle, author: credit.author, translator: source.translator, source: D.sourceLabel(source),
      locator: day.excerpt.locator, rights: source.rights.basis, contentNote: note, intro: probe.intro, words,
      blocks: day.blocks.map(block => ({ type: block.type, text: block.text })),
      items: probe.items.map(item => ({ id: item.id, skill: item.skill, stem: item.stem, options: item.options.slice(), key: item.key, rationale: item.rationale })) };
  });
  const library = courses.map(course => ({ level: course.grade, label: L.levelLabel(course.grade, labels),
    nights: course.days.map(day => [day.title, day.time.totalMinutes]) }));
  return { schemaVersion: 1, review: data.review.status, labels, levels: levels.map(level => ({ level, label: L.levelLabel(level, labels) })), library, probes };
}

function build(options = {}) {
  const loaded = loadProbes(options);
  const output = options.output || path.join(ROOT, "dist");
  fs.mkdirSync(path.join(output, "content"), { recursive: true });
  fs.writeFileSync(path.join(output, "content", "reading-level.js"),
    "/* Generated by tools/build-reading-level.js from content/reading-level/probes.json and content/reading-daily/. */\nwindow.LIMINAL_READING_LEVEL = " + JSON.stringify(bundle(loaded)) + ";\n");
  console.log("Built reading level: " + loaded.levels.length + " levels, " + loaded.resolved.length + " probes" + (loaded.missing.length ? "; levels without probes: " + loaded.missing.join(", ") : "") + ".");
  return loaded;
}

// Heuristic cues an author should look at during the passage-hidden pass
// (docs/reading-level.md). Reported, never failed: each needs judgment.
const ABSOLUTE = /\b(?:always|never|only|all|every|none|no one|nothing|everyone|everything|completely|entirely)\b/i;
// Case-sensitive so names are not hedges ("May fly"); a hedge may open a
// sentence, so the other words allow a capital.
const HEDGE = /\b(?:[Ss]ome|[Oo]ften|[Uu]sually|may|might|[Pp]erhaps|[Ss]eems?|[Mm]ore|[Mm]ostly|[Pp]artly|[Ll]ikely)\b/;
const STOP = new Set("a an the and or but of to in on at by for with from as is are was were be been it its this that these those he she they his her their them him you your i we our not no so than then there what why how who which when where does do did has have had can could would will".split(" "));
function contentWords(value) { return new Set(words(value).filter(word => word.length > 3 && !STOP.has(word))); }
function cueReport(resolved) {
  const notes = [];
  for (const { probe, note } of resolved) {
    const screen = contentWords(probe.intro + " " + (note || ""));
    probe.items.forEach((item, index) => {
      const key = item.options[item.key], distractors = item.options.filter((_, i) => i !== item.key);
      if (!ABSOLUTE.test(key) && distractors.some(option => ABSOLUTE.test(option))) notes.push(item.id + ": absolute word only in a distractor");
      if (HEDGE.test(key) && !distractors.some(option => HEDGE.test(option))) notes.push(item.id + ": hedge only in the key");
      const shared = [...contentWords(key)].filter(word => screen.has(word));
      if (shared.length >= 2) notes.push(item.id + ": key shares " + shared.join(", ") + " with the intro or note");
      probe.items.forEach((other, j) => {
        if (j === index) return;
        const overlap = [...contentWords(key)].filter(word => contentWords(other.stem).has(word) && !contentWords(item.stem).has(word));
        if (overlap.length >= 2) notes.push(item.id + ": key words " + overlap.join(", ") + " appear in the stem of " + other.id);
      });
    });
  }
  return notes;
}

module.exports = { validateProbes, loadProbes, bundle, build, cueReport, MIN_WORDS, MAX_WORDS, EXPECTED_LEVELS, LONGEST_KEY_RATIO, SHARED_WORDS, SCREEN_WORDS };
if (require.main === module) { try { build({ complete: process.argv.includes("--complete") }); } catch (error) { console.error(error.message); process.exitCode = 1; } }
