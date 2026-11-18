#!/usr/bin/env node
"use strict";
// Maintains the reading library (content/reading-library/, docs/reading-library.md).
//
//   node tools/reading-library.js check
//   node tools/reading-library.js seal <work-id>...          recompute work.text from text.jsonl
//   node tools/reading-library.js align <grade-key> [--write] [--source <old-source-id>]
//   node tools/reading-library.js gutenberg <file.txt> <out.jsonl>   rough prose conversion to refine by hand
//   node tools/reading-library.js remap <work-id> <map> [--old <text.jsonl>] [--grow] [--write]
//
// remap re-cites a work after blocks were removed or split in its text (a
// collation restores a paragraph break; later apparatus is taken out). <map>
// says, in order, what became of every old block, as comma-separated parts:
// "a-b=n" old a..b are now n.. (unchanged text), "a-b=-" removed, "k=n..m"
// old block k was split into new n..m, "+k" k new blocks inserted here (a
// restored passage), and "a-=n" for the rest. The old text
// is the committed one (git HEAD) unless --old names a file. Every school
// night and calendar reading citing the work, and its scope.collated, are
// shifted and their text hashes recomputed; a citation that touches a removed
// block, or starts or ends inside a split block at a character offset, is
// refused for a hand fix, and so is one that would now take in inserted
// blocks, unless --grow says it should. Old blocks must keep their text (up to spacing):
// make wording corrections separately. With --write the files are rewritten;
// then seal the work and run the checks. Locators are not touched: their
// block numbers, where they have any, refer to the original extraction.
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

// Parse a remap description into a function old index -> {new: [first, last]} or null (removed).
function parseMap(text, oldCount, newCount) {
  const parts = text.split(",").map(part => part.trim()).filter(Boolean), table = new Map(), inserted = new Set();
  let expect = 0, lastNew = -1;
  for (const part of parts) {
    const add = part.match(/^\+(\d+)$/);
    if (add) {
      if (!Number(add[1])) throw new Error("remap: an insertion adds at least one block: " + part);
      for (let k = 0; k < Number(add[1]); k++) inserted.add(++lastNew);
      continue;
    }
    const m = part.match(/^(\d+)(?:-(\d*))?=(?:(-)|(\d+)(?:\.\.(\d+))?)$/);
    if (!m) throw new Error("remap: cannot read part " + JSON.stringify(part));
    const a = Number(m[1]), b = m[2] === undefined ? a : m[2] === "" ? oldCount - 1 : Number(m[2]);
    if (a !== expect || b < a || b >= oldCount) throw new Error("remap: part " + part + " must continue at old block " + expect + " and stay inside the old text");
    if (m[3]) { for (let i = a; i <= b; i++) table.set(i, null); }
    else if (m[5] !== undefined) {
      const n = Number(m[4]), last = Number(m[5]);
      if (a !== b || last <= n) throw new Error("remap: a split names one old block and two or more new ones: " + part);
      if (n !== lastNew + 1) throw new Error("remap: new blocks must follow on at " + (lastNew + 1) + " in " + part);
      table.set(a, { first: n, last, split: true }); lastNew = last;
    } else {
      const n = Number(m[4]);
      if (n !== lastNew + 1) throw new Error("remap: new blocks must follow on at " + (lastNew + 1) + " in " + part);
      for (let i = a; i <= b; i++) table.set(i, { first: n + i - a, last: n + i - a, split: false });
      lastNew = n + b - a;
    }
    expect = b + 1;
  }
  if (expect !== oldCount) throw new Error("remap: the map stops at old block " + expect + " of " + oldCount);
  if (newCount !== undefined && lastNew !== newCount - 1) throw new Error("remap: the map ends at new block " + lastNew + " but the new text has " + newCount);
  table.inserted = inserted;
  return table;
}
// Shift one excerpt; returns a reason string when it needs a hand fix.
function remapExcerpt(excerpt, table, { grow = false } = {}) {
  const [first, last] = excerpt.blocks, a = table.get(first), b = table.get(last);
  for (let i = first; i <= last; i++) if (table.get(i) === null) return "cites removed block " + i;
  if (a.split && excerpt.startChar != null) return "starts inside split block " + first;
  if (b.split && excerpt.endChar != null) return "ends inside split block " + last;
  const taken = [...(table.inserted || [])].filter(n => a.first < n && n < b.last);
  if (taken.length && !grow) return "would take in inserted blocks " + taken[0] + (taken.length > 1 ? "–" + taken[taken.length - 1] : "") + " (pass --grow if it should)";
  excerpt.blocks = [a.first, b.last];
  return null;
}
function remap(id, mapText, { write = false, old = null, grow = false } = {}) {
  const folder = path.join(DIRECTORY, id), spaced = text => text.replace(/\s+/g, " ").trim();
  const before = L.parseText(old ? fs.readFileSync(old, "utf8") : require("node:child_process").execFileSync("git", ["show", "HEAD:./" + path.relative(ROOT, path.join(folder, "text.jsonl"))], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }), id);
  const after = L.parseText(fs.readFileSync(path.join(folder, "text.jsonl"), "utf8"), id);
  const table = parseMap(mapText, before.length, after.length);
  for (const [i, to] of table) {
    if (!to) continue;
    const joined = spaced(after.slice(to.first, to.last + 1).map(block => block.text).join(" "));
    if (joined !== spaced(before[i].text)) throw new Error("remap: old block " + i + " does not match new " + to.first + (to.last > to.first ? ".." + to.last : "") + "; make text changes separately");
  }
  const problems = [], files = [], grown = [];
  const visit = (file, list) => {
    let touched = false;
    for (const reading of list) {
      if (reading.sourceId !== id || !reading.excerpt || !Array.isArray(reading.excerpt.blocks)) continue;
      const reason = remapExcerpt(reading.excerpt, table, { grow });
      if (reason) { problems.push(reading.id + " " + reason); continue; }
      // A split block now joins as separate paragraphs, so the hash moves with it.
      reading.excerpt.textHash = textHash({ blocks: L.resolveRange(after, reading.excerpt, reading.id) });
      const [a, b] = reading.excerpt.blocks;
      if ([...table.inserted].some(n => a < n && n < b)) grown.push(reading.id);
      touched = true;
    }
    if (touched) files.push(file);
  };
  const daily = path.join(ROOT, "content/reading-daily"), data = new Map();
  for (const name of fs.readdirSync(daily)) if (/^(k|\d+|a\d)\.json$/.test(name)) { const file = path.join(daily, name), raw = JSON.parse(fs.readFileSync(file, "utf8")); data.set(file, raw); visit(file, raw.days || []); }
  const extra = path.join(daily, "extra");
  if (fs.existsSync(extra)) for (const key of fs.readdirSync(extra)) { const file = path.join(extra, key, id + ".json"); if (fs.existsSync(file)) { const raw = JSON.parse(fs.readFileSync(file, "utf8")); data.set(file, raw); visit(file, raw.readings); } }
  const workFile = path.join(folder, "work.json"), work = JSON.parse(fs.readFileSync(workFile, "utf8"));
  if (work.scope.collated) {
    const ranges = [];
    for (const [a, b] of work.scope.collated) {
      const kept = []; for (let i = a; i <= b; i++) { const to = table.get(i); if (to) kept.push(to.first, to.last); }
      if (kept.length) ranges.push([Math.min(...kept), Math.max(...kept)]);
    }
    const merged = []; for (const [a, b] of ranges.sort((x, y) => x[0] - y[0])) { const top = merged[merged.length - 1]; if (top && a <= top[1] + 1) top[1] = Math.max(top[1], b); else merged.push([a, b]); }
    work.scope.collated = merged;
  }
  for (const problem of problems) console.log("PROBLEM " + problem);
  if (grown.length) console.log("GREW " + grown.join(" ") + ": review their time, context and questions for the restored text");
  console.log(files.length + " files cite " + id + (work.scope.collated ? "; scope.collated becomes " + JSON.stringify(work.scope.collated) : ""));
  if (write && !problems.length) {
    for (const file of files) fs.writeFileSync(file, JSON.stringify(data.get(file), null, 2) + "\n");
    fs.writeFileSync(workFile, JSON.stringify(work, null, 2) + "\n");
    console.log("Rewritten. Now: node tools/reading-library.js seal " + id + " and the checks.");
  }
  return { problems, files, grown };
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
    } else if (command === "remap") {
      const at = args.indexOf("--old");
      if (args.length < 2) throw new Error("remap needs <work-id> <map>");
      const { problems } = remap(args[0], args[1], { write: args.includes("--write"), grow: args.includes("--grow"), old: at === -1 ? null : args[at + 1] });
      if (problems.length) process.exitCode = 2;
    } else if (command === "gutenberg") { if (args.length !== 2) throw new Error("gutenberg needs <file.txt> <out.jsonl>"); gutenberg(args[0], args[1]); }
    else throw new Error("usage: reading-library.js check | seal <id>... | align <grade-key> [--write] [--source <id>] | remap <work-id> <map> [--old <file>] [--grow] [--write] | gutenberg <in> <out>");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { seal, locate, align, gutenberg, parseMap, remapExcerpt, remap };
