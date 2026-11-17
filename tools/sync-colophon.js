#!/usr/bin/env node
"use strict";
// Copies the pinned Colophon files (the browser TeX runner, its Node harness
// and the runtime tools) from a Colophon checkout into Liminal and records
// the commit and each file's SHA-256 in tools/vendor/colophon.json.
// test/colophon-vendor.test.js holds the vendored bytes to that record.
//
//   node tools/sync-colophon.js ../colophon
//
// The checkout must be clean at a commit, so the record names exactly what was copied.
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const RECORD = path.join(ROOT, "tools/vendor/colophon.json");
// Liminal path -> path in Colophon.
const FILES = {
  "src/vendor/colophon/native-tex.js": "src/native-tex.js",
  "tools/vendor/colophon/harness.js": "node/harness.js",
  "tools/vendor/colophon/runtime.js": "tools/runtime.js",
  "tools/vendor/colophon/tar.js": "tools/tar.js",
  "tools/vendor/colophon/LICENSE": "LICENSE",
  "tools/vendor/colophon/THIRD-PARTY-NOTICES.md": "THIRD-PARTY-NOTICES.md",
};

const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
function git(checkout, args) {
  const result = spawnSync("git", ["-C", checkout, ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error("git " + args.join(" ") + " failed: " + result.stderr.trim());
  return result.stdout.trim();
}

function sync(checkout) {
  const commit = git(checkout, ["rev-parse", "HEAD"]);
  const dirty = git(checkout, ["status", "--porcelain", "--", ...Object.values(FILES)]);
  if (dirty) throw new Error("the Colophon checkout has uncommitted changes to vendored files:\n" + dirty);
  const files = {};
  for (const [target, source] of Object.entries(FILES)) {
    const bytes = fs.readFileSync(path.join(checkout, source));
    fs.mkdirSync(path.dirname(path.join(ROOT, target)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, target), bytes);
    files[target] = { from: source, sha256: sha256(bytes) };
  }
  const record = { repository: "https://github.com/spincyc/colophon", commit, files };
  fs.writeFileSync(RECORD, JSON.stringify(record, null, 2) + "\n");
  return record;
}

// The vendored files that differ from the record (empty when they match).
function verify() {
  const record = JSON.parse(fs.readFileSync(RECORD, "utf8"));
  const problems = [];
  if (!/^[0-9a-f]{40}$/.test(record.commit || "")) problems.push("the record names no commit");
  for (const target of Object.keys(FILES)) if (!record.files[target]) problems.push(target + " is not recorded");
  for (const [target, row] of Object.entries(record.files)) {
    if (!FILES[target]) { problems.push(target + " is recorded but not vendored"); continue; }
    let bytes;
    try { bytes = fs.readFileSync(path.join(ROOT, target)); } catch (_) { problems.push(target + " is missing"); continue; }
    if (sha256(bytes) !== row.sha256) problems.push(target + " differs from Colophon " + record.commit.slice(0, 12) + "; re-run tools/sync-colophon.js instead of editing it");
  }
  return problems;
}

module.exports = { FILES, RECORD, sync, verify };

if (require.main === module) {
  const checkout = process.argv[2];
  if (!checkout) { console.error("usage: sync-colophon.js COLOPHON_CHECKOUT"); process.exit(1); }
  try {
    const record = sync(path.resolve(checkout));
    console.log("Vendored Colophon " + record.commit + " (" + Object.keys(record.files).length + " files)");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
