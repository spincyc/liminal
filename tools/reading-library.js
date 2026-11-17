#!/usr/bin/env node
"use strict";
// Maintains the reading library (content/reading-library/, docs/reading-library.md).
//
//   node tools/reading-library.js check
//   node tools/reading-library.js seal <work-id>...          recompute work.text from text.jsonl
//   node tools/reading-library.js align <grade-key> [--write] [--source <old-source-id>]
//   node tools/reading-library.js gutenberg <file.txt> <out.jsonl>   rough prose conversion to refine by hand
//
// align converts a grade's nights from inline text to ranges in library
// works. A legacy grade source names its work with "library": "<work-id>";
// every night of that source is located in the work's text block by block
// (the first block may start, and the last end, inside a work block; every
// block type must agree). Nights that cannot be located are reported and
// left inline; with --write the grade file is rewritten, and a legacy source
// whose nights all resolved is removed (its record now lives in the library).
const fs = require("node:fs");
const path = require("node:path");
const L = require("../src/lib/reading-library");
const { loadLibrary, DIRECTORY, sha256 } = require("./build-reading-library");
const { textHash } = require("./build-daily-reading");
const ROOT = path.resolve(__dirname, "..");

function seal(ids) {
  for (const id of ids) {
    const folder = path.join(DIRECTORY, id), bytes = fs.readFileSync(path.join(folder, "text.jsonl"));
    const blocks = L.parseText(bytes.toString("utf8"), id + "/text.jsonl");
    const file = path.join(folder, "work.json"), work = JSON.parse(fs.readFileSync(file, "utf8"));
    work.text = { blocks: blocks.length, sha256: sha256(bytes) };
    fs.writeFileSync(file, JSON.stringify(work, null, 2) + "\n");
    console.log("Sealed " + id + ": " + blocks.length + " blocks.");
  }
}

// Locate a night's blocks in a work. Returns { first, last, startChar, endChar }
// or a reason it cannot.
function locate(dayBlocks, blocks) {
  const n = dayBlocks.length, found = [];
  const fits = (i, block, j) => blocks[i].type === block.type;
  if (n === 1) {
    const target = dayBlocks[0].text;
    blocks.forEach((block, i) => {
      if (!fits(i, dayBlocks[0])) return;
      let at = block.text.indexOf(target);
      while (at !== -1) { found.push({ first: i, last: i, startChar: at || null, endChar: at + target.length === block.text.length ? null : at + target.length }); at = block.text.indexOf(target, at + 1); }
    });
  } else {
    const head = dayBlocks[0].text, tail = dayBlocks[n - 1].text;
    for (let i = 0; i + n - 1 < blocks.length; i++) {
      if (!fits(i, dayBlocks[0]) || !blocks[i].text.endsWith(head)) continue;
      let ok = true;
      for (let k = 1; k < n - 1 && ok; k++) ok = blocks[i + k].type === dayBlocks[k].type && blocks[i + k].text === dayBlocks[k].text;
      const last = i + n - 1;
      if (!ok || !fits(last, dayBlocks[n - 1]) || !blocks[last].text.startsWith(tail)) continue;
      const startChar = blocks[i].text.length - head.length, endChar = tail.length === blocks[last].text.length ? null : tail.length;
      found.push({ first: i, last, startChar: startChar || null, endChar });
    }
  }
  if (found.length === 1) return { range: found[0] };
  return { reason: found.length ? "ambiguous: " + found.length + " places in the work" : "not found block for block in the work" };
}

function align(key, { write = false, only = null } = {}) {
  const file = path.join(ROOT, "content/reading-daily", key + ".json"), course = JSON.parse(fs.readFileSync(file, "utf8"));
  const library = loadLibrary(), report = [];
  const legacy = new Map((course.sources || []).map(source => [source.id, source]));
  // A legacy source retires only when every one of its nights either
  // resolves to a range or declares why it stays inline
  // (excerpt.inlineReason); otherwise nothing of it changes.
  const ranges = new Map(), ready = new Map();
  for (const day of course.days) {
    const source = legacy.get(day.sourceId);
    if (!source || !source.library || (only && source.id !== only)) continue;
    if (!ready.has(source.id)) ready.set(source.id, true);
    const entry = library.get(source.library);
    if (!entry) { report.push(day.id + ": library work " + source.library + " is missing"); ready.set(source.id, false); continue; }
    if (day.excerpt.inlineReason) continue;
    const result = locate(day.blocks, entry.blocks);
    if (!result.range) { report.push(day.id + ": " + result.reason); ready.set(source.id, false); continue; }
    const resolved = L.resolveRange(entry.blocks, { blocks: [result.range.first, result.range.last], startChar: result.range.startChar, endChar: result.range.endChar }, day.id);
    if (textHash({ blocks: resolved }) !== day.excerpt.textHash) { report.push(day.id + ": located text differs from its hash"); ready.set(source.id, false); continue; }
    ranges.set(day.id, result.range);
  }
  const retired = [...ready].filter(([, ok]) => ok).map(([id]) => id);
  if (write && retired.length) {
    for (const day of course.days) {
      const source = legacy.get(day.sourceId);
      if (!source || !retired.includes(source.id)) continue;
      const range = ranges.get(day.id);
      if (range) {
        const { textHash: hash, ...rest } = day.excerpt;
        day.excerpt = { ...rest, blocks: [range.first, range.last], startChar: range.startChar, endChar: range.endChar, textHash: hash };
        delete day.blocks;
      }
      day.sourceId = source.library;
    }
    course.sources = (course.sources || []).filter(source => !retired.includes(source.id));
    if (!course.sources.length) delete course.sources;
    fs.writeFileSync(file, JSON.stringify(course, null, 2) + "\n");
  }
  const located = course.days.filter(day => day.excerpt && Array.isArray(day.excerpt.blocks)).length;
  console.log("Grade " + key + ": " + located + " of " + course.days.length + " nights cite library ranges; " + report.length + " problem(s)" + (write ? "; written." : "; dry run."));
  report.slice(0, 40).forEach(line => console.log("  " + line));
  return { report, located };
}

// A starting point for Project Gutenberg plain text: strips the PG header
// and footer, joins wrapped prose lines, and marks short capitalised lines
// as headings. Verse, tables, notes and front matter need per-work care.
function gutenberg(input, output) {
  let raw = fs.readFileSync(input, "utf8").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const start = raw.search(/^\*\*\* ?START OF (?:THE|THIS) PROJECT GUTENBERG[^\n]*$/m), end = raw.search(/^\*\*\* ?END OF (?:THE|THIS) PROJECT GUTENBERG[^\n]*$/m);
  if (start !== -1) raw = raw.slice(raw.indexOf("\n", start) + 1);
  if (end !== -1) raw = raw.slice(0, raw.search(/^\*\*\* ?END OF (?:THE|THIS) PROJECT GUTENBERG[^\n]*$/m));
  const blocks = raw.split(/\n\s*\n/).map(part => part.replace(/^\n+|\s+$/g, "")).filter(part => part.trim()).map(part => {
    const lines = part.split("\n");
    if (lines.length === 1 && lines[0].length < 70 && /^(?:CHAPTER|BOOK|PART|STAVE|ACT|SCENE)\b|^[A-Z0-9 .,'’:;!?-]+$/.test(lines[0].trim()) && /[A-Z]/.test(lines[0])) return { type: "heading", level: 2, text: lines[0].trim() };
    return { type: "paragraph", text: lines.map(line => line.trim()).join(" ").replace(/ {2,}/g, " ") };
  });
  fs.writeFileSync(output, L.serializeText(blocks));
  console.log("Wrote " + blocks.length + " blocks to " + output + " (review headings, verse and notes by hand).");
}

if (require.main === module) {
  try {
    const [command, ...args] = process.argv.slice(2);
    if (command === "check") { const library = loadLibrary(); console.log("Reading library: " + library.size + " works."); }
    else if (command === "seal") { if (!args.length) throw new Error("seal needs work ids"); seal(args); }
    else if (command === "align") {
      const key = args[0], at = args.indexOf("--source");
      if (!key) throw new Error("align needs a grade key");
      const { report } = align(key, { write: args.includes("--write"), only: at === -1 ? null : args[at + 1] });
      if (report.length) process.exitCode = 2;
    } else if (command === "gutenberg") { if (args.length !== 2) throw new Error("gutenberg needs <file.txt> <out.jsonl>"); gutenberg(args[0], args[1]); }
    else throw new Error("usage: reading-library.js check | seal <id>... | align <grade-key> [--write] [--source <id>] | gutenberg <in> <out>");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { seal, locate, align, gutenberg };
