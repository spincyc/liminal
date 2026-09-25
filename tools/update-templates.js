#!/usr/bin/env node
"use strict";

// Keeps each section's template registry (content/templates/<section>.json)
// in step with its families. Every template owns a permanent bit: new
// templates are appended with the next bit, a template that disappears is
// marked retired and keeps its bit, and nothing is ever renumbered, so a
// stored run or history mask always means the same templates.
//
// Each entry also carries the template's `version` and `fingerprint` (a hash
// of what it builds for fixed seeds; tools/lib/fingerprint.js). When a live
// template's fingerprint changes, its version goes up by one: an old question
// id or run code then rebuilds a different question, and the version tells
// which one a stored attempt saw. A missing version means 1. The rules live
// in tools/lib/registry.js.
//
//   node tools/update-templates.js           # append, retire, re-version
//   node tools/update-templates.js --check   # fail if a registry is stale

const fs = require("node:fs");
const path = require("node:path");
const { instantiate } = require("../src/lib/families/shared");
const { templateFingerprint } = require("./lib/fingerprint");
const { registryProblems, updateRegistry } = require("./lib/registry");

const ROOT = path.resolve(__dirname, "..");
const CHECK = process.argv.includes("--check");
const SECTIONS = {
  "sat-math": "src/lib/families/sat/math/index.js",
  "sat-reading-writing": "src/lib/families/sat/reading-writing/index.js",
};

function registryPath(sectionKey) {
  return path.join(ROOT, "content", "templates", `${sectionKey}.json`);
}

function loadRegistry(sectionKey) {
  const file = registryPath(sectionKey);
  if (!fs.existsSync(file)) return { sectionKey, templates: [] };
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

let failed = false;
for (const [sectionKey, indexFile] of Object.entries(SECTIONS)) {
  const families = require(path.join(ROOT, indexFile));
  const { registry, changes } = updateRegistry(
    { sectionKey, ...loadRegistry(sectionKey) },
    families,
    (family) => templateFingerprint(family, instantiate),
  );
  const errors = registryProblems(registry);
  errors.forEach((error) => console.error(`${sectionKey}: ${error}`));
  if (errors.length) failed = true;
  const active = registry.templates.filter((entry) => !entry.retired).length;
  if (CHECK) {
    if (changes.length) {
      console.error(`${sectionKey}: registry is stale (${changes.length} changes); run node tools/update-templates.js`);
      changes.slice(0, 5).forEach((change) => console.error(`  ${change}`));
      failed = true;
    } else console.log(`${sectionKey}: ${active} templates registered.`);
    continue;
  }
  fs.writeFileSync(registryPath(sectionKey), `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`${sectionKey}: ${active} templates${changes.length ? `; ${changes.length} changes` : ""}.`);
  changes.slice(0, 5).forEach((change) => console.log(`  ${change}`));
}
process.exit(failed ? 1 : 0);
