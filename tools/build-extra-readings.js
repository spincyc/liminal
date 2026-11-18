#!/usr/bin/env node
"use strict";
// Writes a level's calendar readings from one library work
// (content/reading-daily/extra/<grade-key>/<work-id>.json, docs/daily-reading.md
// "Date calendar") from a compact authoring spec, computing everything that is
// mechanical: IDs, question IDs, locators, textHash, reciprocal continuations.
// It refuses evidence that is not in the cited text, fewer than three
// questions, overlapping ranges and continued readings that are not contiguous.
// The corpus-wide rules (time budget, overlap with other levels, duplicate
// questions) stay with node tools/check-daily-reading.js.
//
//   node tools/build-extra-readings.js <spec.js|spec.json>           report only
//   node tools/build-extra-readings.js <spec.js|spec.json> --write   write the file
//
// Keep specs outside the repository (a lane's scratch directory); the written
// JSON file is the record. A spec is a CommonJS module or JSON file:
//
//   module.exports = {
//     grade: 5,                     // the file's "grade" (a number, or the level's key)
//     key: "5",                     // optional grade key for IDs and the folder; default String(grade)
//     work: "<library work id>",
//     defaults: { genre: "fiction", readingMode: "shared" },
//     readings: [ {                 // in reading order; IDs are reading-<key>-<work>-01, -02, ...
//       at: [first, last],          // inclusive zero-based block numbers in text.jsonl
//       start: "…", end: "…",       // optional: text the excerpt starts with (unique in block first)
//                                   //   or ends with (unique in block last); sets startChar / endChar
//       cont: true,                 // optional: continues the previous reading (links both ways)
//       title, challenge, focus, context,
//       time: [readingMinutes, discussionMinutes],
//       where: "Chapter I, the whole chapter",   // locator prefix; the tool appends
//                                   //   `; opens “…”; closes “…”.` from the resolved text
//       note: "…",                  // optional contentNote (default null)
//       genre, mode,                // optional overrides of defaults.genre / defaults.readingMode
//       complete: true,             // optional excerpt.isCompleteWork (default false)
//       author, workTitle, months,  // optional, copied as given
//       q: [ [prompt, [facilitator notes], [evidence quotes]], ... ]
//     } ]
//   };
//
// Continued readings must be contiguous: the next reading starts where the
// previous one ends. Either both cut at block boundaries and only heading
// blocks lie between them (a chapter heading stays out of the nights on either
// side of it), or the previous one ends inside a block (`end`) and the next
// starts later in that same block (`start`) with only whitespace between.
const fs = require("node:fs");
const path = require("node:path");
const L = require("../src/lib/reading-library");
const { textHash, normalizedText } = require("./build-daily-reading");

const ROOT = path.resolve(__dirname, "..");

function clip(text, size, fromEnd) {
  text = text.replace(/\s+/g, " ");
  if (text.length <= size) return text;
  return fromEnd ? "…" + text.slice(-size).replace(/^\S*\s/, "") : text.slice(0, size).replace(/\s\S*$/, "") + "…";
}

function anchor(text, needle, id, which) {
  const at = text.indexOf(needle);
  if (at < 0 || text.indexOf(needle, at + 1) >= 0) throw new Error(id + ": " + which + " text is not found exactly once in its block");
  return at;
}

// Contiguity of a continued reading `b` after `a` (both built excerpts).
function contiguous(blocks, a, b) {
  const aLast = a.blocks[1], bFirst = b.blocks[0];
  if (a.endChar === null && b.startChar === null) {
    if (bFirst <= aLast) return false;
    for (let k = aLast + 1; k < bFirst; k++) if (blocks[k].type !== "heading") return false;
    return true;
  }
  if (a.endChar !== null && b.startChar !== null && bFirst === aLast) return !blocks[aLast].text.slice(a.endChar, b.startChar).trim();
  return false;
}

function buildReadings(spec, blocks) {
  const key = spec.key === undefined ? String(spec.grade) : String(spec.key);
  const defaults = spec.defaults || {};
  const problems = [], readings = [], words = [];
  spec.readings.forEach((r, index) => {
    const id = "reading-" + key + "-" + spec.work + "-" + String(index + 1).padStart(2, "0");
    try {
      const [first, last] = r.at;
      let startChar = null, endChar = null;
      if (r.start !== undefined) startChar = anchor(blocks[first].text, r.start, id, "start") || null;
      if (r.end !== undefined) {
        const text = blocks[last].text;
        endChar = anchor(text, r.end, id, "end") + r.end.length;
        if (endChar === text.length) endChar = null;
      }
      const resolved = L.resolveRange(blocks, { blocks: [first, last], startChar, endChar }, id);
      const body = resolved.filter(block => block.type !== "heading").map(block => block.text);
      if (!body.length) throw new Error(id + ": the range holds only headings");
      const reading = { id, title: r.title, sourceId: spec.work };
      if (r.author !== undefined) reading.author = r.author;
      if (r.workTitle !== undefined) reading.workTitle = r.workTitle;
      Object.assign(reading, {
        genre: r.genre || defaults.genre, readingMode: r.mode || defaults.readingMode,
        time: { readingMinutes: r.time[0], discussionMinutes: r.time[1], totalMinutes: r.time[0] + r.time[1] },
        challenge: r.challenge, focus: r.focus, context: r.context, contentNote: r.note === undefined ? null : r.note,
        excerpt: {
          locator: r.where + "; opens “" + clip(body[0], 90) + "”; closes “" + clip(body[body.length - 1], 90, true) + "”.",
          isCompleteWork: !!r.complete, continuesFrom: null, continuesTo: null,
          blocks: [first, last], startChar, endChar, textHash: textHash({ blocks: resolved }),
        },
        questions: (r.q || []).map(([prompt, facilitatorNotes, evidence], k) => ({ id: id + "-q" + (k + 1), prompt, facilitatorNotes, evidence })),
      });
      if (r.months !== undefined) reading.months = r.months;
      if (reading.questions.length < 3) problems.push(id + ": fewer than three questions");
      const text = normalizedText(resolved.map(block => block.text).join("\n\n"));
      for (const question of reading.questions) for (const quote of question.evidence) {
        if (!text.includes(normalizedText(quote))) problems.push(question.id + ": evidence not in the cited text: " + quote);
      }
      if (r.cont) {
        const previous = readings[readings.length - 1];
        if (!previous || previous.id !== "reading-" + key + "-" + spec.work + "-" + String(index).padStart(2, "0")) problems.push(id + ": continues a reading that was not built");
        else {
          reading.excerpt.continuesFrom = previous.id; previous.excerpt.continuesTo = id;
          if (!contiguous(blocks, previous.excerpt, reading.excerpt)) problems.push(id + ": continues " + previous.id + " but does not start where it ends");
        }
      }
      readings.push(reading);
      words.push(body.join(" ").split(/\s+/).length);
    } catch (error) { problems.push(error.message); }
  });
  const spans = readings.map(reading => L.span(L.rangeOf(reading.excerpt), blocks));
  for (let i = 0; i < spans.length; i++) for (let j = i + 1; j < spans.length; j++) {
    if (L.overlaps(spans[i], spans[j])) problems.push(readings[j].id + ": overlaps " + readings[i].id);
  }
  return { file: { schemaVersion: 1, grade: spec.grade, work: spec.work, readings }, problems, words, key };
}

function main(argv) {
  const specPath = argv.find(arg => !arg.startsWith("--"));
  if (!specPath) throw new Error("usage: node tools/build-extra-readings.js <spec.js|spec.json> [--write]");
  const spec = require(path.resolve(specPath));
  if (!L.validWorkId(spec.work)) throw new Error("spec: invalid work id " + spec.work);
  const blocks = L.parseText(fs.readFileSync(path.join(ROOT, "content/reading-library", spec.work, "text.jsonl"), "utf8"), spec.work);
  const { file, problems, words, key } = buildReadings(spec, blocks);
  file.readings.forEach((reading, i) => {
    console.log(reading.id.slice(-2), words[i] + "w", reading.time.readingMinutes + "+" + reading.time.discussionMinutes,
      (reading.excerpt.continuesFrom ? "↳ " : "  ") + reading.title);
  });
  if (!problems.length) {
    // The same admission the corpus check applies, so a file the check would
    // refuse is never written.
    const record = JSON.parse(fs.readFileSync(path.join(ROOT, "content/reading-library", spec.work, "work.json"), "utf8"));
    try { require("./build-daily-reading").validateExtra({ grade: key, work: spec.work, data: JSON.parse(JSON.stringify(file)) }, new Map([[spec.work, { work: record, blocks }]])); }
    catch (error) { problems.push(error.message); }
  }
  for (const problem of problems) console.log("PROBLEM " + problem);
  if (problems.length) { process.exitCode = 1; if (argv.includes("--write")) console.log("Not written."); return; }
  if (argv.includes("--write")) {
    const out = path.join(ROOT, "content/reading-daily/extra", key, spec.work + ".json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(file, null, 2) + "\n");
    console.log("Wrote " + path.relative(ROOT, out) + ": " + file.readings.length + " readings. Now run node tools/check-daily-reading.js --complete.");
  }
}

module.exports = { buildReadings, contiguous };
if (require.main === module) { try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; } }
