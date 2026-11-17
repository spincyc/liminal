#!/usr/bin/env node
"use strict";
// The reading library: every complete public-domain work that nightly
// readings cite, under content/reading-library/<work-id>/ (work.json and
// text.jsonl). Validates the works and builds the browser's library data:
// an index of works, and per work its record, contents, the readings drawn
// from it, and its text in chunks. docs/reading-library.md is the contract.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const L = require("../src/lib/reading-library");
const D = require("../src/lib/daily-reading");
const ROOT = path.resolve(__dirname, "..");
const DIRECTORY = path.join(ROOT, "content/reading-library");
function assert(value, message) { if (!value) throw new Error("Reading library: " + message); }
const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
function text(value, where) { assert(typeof value === "string" && value.trim(), "missing text at " + where); }
function year(value, where) { assert(Number.isInteger(value) && value >= 1 && value <= new Date().getUTCFullYear(), "invalid year at " + where); }
function date(value, where) {
  const time = Date.parse(value);
  assert(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value && time <= Date.now(), "invalid date at " + where);
}
const MARKUP = /<!--|<!doctype\b|<\/?[a-z][a-z0-9:-]*(?:\s[^<>]*)?\s*\/?>/i;
function plain(value, where) {
  if (typeof value === "string") assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) && !MARKUP.test(value), "non-plain text at " + where);
  else if (Array.isArray(value)) value.forEach((item, i) => plain(item, where + "." + i));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => plain(item, where + "." + key));
}
const WORK_KEYS = ["schemaVersion", "id", "author", "title", "translator", "edition", "publicationYear", "translationYear", "url", "textUrl", "rights", "acquisition", "scope", "text"];
function validateWork(work, blocks, bytes, where) {
  assert(work && typeof work === "object" && !Array.isArray(work), "expected a work record at " + where);
  assert(Object.keys(work).sort().join() === [...WORK_KEYS].sort().join(), "work fields must be exactly " + WORK_KEYS.join(", ") + " at " + where);
  assert(work.schemaVersion === 1 && L.validWorkId(work.id), "invalid schema version or work id at " + where);
  plain(work, where);
  for (const field of ["author", "title", "edition"]) text(work[field], where + "." + field);
  year(work.publicationYear, where + ".publicationYear");
  if (work.translator === null) assert(work.translationYear === null, "unpaired translator/year at " + where);
  else { text(work.translator, where + ".translator"); year(work.translationYear, where + ".translationYear"); }
  for (const field of ["url", "textUrl"]) assert(D.safeHttps(work[field]), "unsafe URL at " + where + "." + field);
  const rights = work.rights;
  assert(rights && rights.jurisdiction === "US" && rights.status === "public-domain", "invalid rights declaration at " + where);
  text(rights.basis, where + ".rights.basis"); date(rights.verifiedDate, where + ".rights.verifiedDate");
  assert(D.safeHttps(rights.evidenceUrl), "unsafe rights evidence URL at " + where);
  const acquisition = work.acquisition;
  assert(acquisition && typeof acquisition === "object", "missing acquisition at " + where);
  date(acquisition.retrieved, where + ".acquisition.retrieved");
  assert(D.safeHttps(acquisition.downloadUrl), "unsafe download URL at " + where);
  assert(/^[0-9a-f]{64}$/.test(acquisition.downloadSha256 || ""), "invalid download hash at " + where);
  text(acquisition.method, where + ".acquisition.method");
  assert(work.scope && typeof work.scope.complete === "boolean", "missing scope at " + where);
  if (work.scope.complete) assert(work.scope.note === null, "a complete work has no scope note at " + where);
  else text(work.scope.note, where + ".scope.note");
  assert(work.text && work.text.blocks === blocks.length && work.text.sha256 === sha256(bytes), "text.jsonl does not match work.text (blocks/sha256) at " + where + "; run node tools/reading-library.js seal " + work.id);
  assert(blocks.some(block => block.type !== "heading"), "text holds only headings at " + where);
  blocks.forEach((block, i) => plain(block.text, where + ".text." + i));
  return work;
}
// Map of work id to { work, blocks }. A missing directory is an empty library.
function loadLibrary({ directory = DIRECTORY } = {}) {
  const library = new Map();
  if (!fs.existsSync(directory)) return library;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === "README.md") continue;
    assert(entry.isDirectory() && L.validWorkId(entry.name), "unexpected entry " + entry.name);
    const folder = path.join(directory, entry.name), files = fs.readdirSync(folder).sort().join();
    assert(files === "text.jsonl,work.json", "a work folder holds exactly work.json and text.jsonl: " + entry.name);
    const work = JSON.parse(fs.readFileSync(path.join(folder, "work.json"), "utf8"));
    assert(work.id === entry.name, "work id must match its folder: " + entry.name);
    const bytes = fs.readFileSync(path.join(folder, "text.jsonl"));
    const blocks = L.parseText(bytes.toString("utf8"), entry.name + "/text.jsonl");
    validateWork(work, blocks, bytes, entry.name);
    library.set(work.id, { work, blocks });
  }
  return library;
}
// The record a reading's source note and disclosure use (the shape grade
// files carried before the library existed), plus the library id.
function sourceRecord(work) {
  return { id: work.id, author: work.author, title: work.title, translator: work.translator, edition: work.edition,
    publicationYear: work.publicationYear, translationYear: work.translationYear, url: work.url, textUrl: work.textUrl,
    rights: { ...work.rights }, library: work.id };
}

// Browser data. `uses` lists every reading drawn from each work, with its
// level, title, range and where it can be opened.
function libraryFile(id) { return "content/reading-library/" + id + "/meta.json"; }
function chunkFile(id, n) { return "content/reading-library/" + id + "/" + n + ".json"; }
function buildLibrary({ library, uses = new Map(), output = path.join(ROOT, "dist") }) {
  const directory = path.join(output, "content/reading-library");
  fs.rmSync(directory, { recursive: true, force: true }); fs.mkdirSync(directory, { recursive: true });
  const works = [];
  for (const [id, { work, blocks }] of library) {
    const chunks = L.chunks(blocks), used = (uses.get(id) || []).slice().sort((a, b) => a.blocks[0] - b.blocks[0] || a.grade - b.grade);
    const words = blocks.reduce((sum, block) => sum + block.text.split(/\s+/).filter(Boolean).length, 0);
    const record = { schemaVersion: 1, work: sourceRecord(work), scope: work.scope, words, blocks: blocks.length,
      contents: L.contents(blocks), chunks: chunks.map(([first, last], n) => ({ file: chunkFile(id, n), first, last })), uses: used };
    fs.mkdirSync(path.join(directory, id), { recursive: true });
    fs.writeFileSync(path.join(output, libraryFile(id)), JSON.stringify(record) + "\n");
    chunks.forEach(([first, last], n) => fs.writeFileSync(path.join(output, chunkFile(id, n)),
      JSON.stringify({ schemaVersion: 1, work: id, first, blocks: blocks.slice(first, last + 1) }) + "\n"));
    const levels = [...new Set(used.map(use => use.grade))].sort((a, b) => a - b);
    const genres = [...new Set(used.map(use => use.genre))].sort();
    works.push({ id, author: work.author, title: work.title, translator: work.translator, year: work.publicationYear,
      words, levels, genres, readings: used.length, complete: work.scope.complete, file: libraryFile(id) });
  }
  works.sort((a, b) => a.author.localeCompare(b.author) || a.title.localeCompare(b.title));
  fs.writeFileSync(path.join(directory, "index.json"), JSON.stringify({ schemaVersion: 1, works }) + "\n");
  return { works: works.length };
}
module.exports = { DIRECTORY, validateWork, loadLibrary, sourceRecord, buildLibrary, libraryFile, chunkFile, sha256 };
if (require.main === module) {
  try { const library = loadLibrary(); console.log("Reading library: " + library.size + " works, " + [...library.values()].reduce((sum, item) => sum + item.blocks.length, 0) + " blocks."); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
