#!/usr/bin/env node
"use strict";

// Keeps each section's template registry (content/templates/<section>.json)
// in step with its families. Every template owns a permanent bit: new
// templates are appended with the next bit, a template that disappears is
// marked retired and keeps its bit, and nothing is ever renumbered, so a
// stored run or history mask always means the same templates.
//
//   node tools/update-templates.js           # append new templates
//   node tools/update-templates.js --check   # fail if a registry is stale

const fs = require("node:fs");
const path = require("node:path");

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

function problems(registry) {
  const errors = [];
  const ids = new Set();
  const bits = new Set();
  registry.templates.forEach((entry) => {
    if (ids.has(entry.id)) errors.push(`duplicate template id ${entry.id}`);
    if (bits.has(entry.bit)) errors.push(`bit ${entry.bit} is used twice`);
    if (!Number.isInteger(entry.bit) || entry.bit < 0) errors.push(`${entry.id} has an invalid bit`);
    ids.add(entry.id);
    bits.add(entry.bit);
  });
  return errors;
}

let failed = false;
for (const [sectionKey, indexFile] of Object.entries(SECTIONS)) {
  const families = require(path.join(ROOT, indexFile));
  const live = new Set(families.map((family) => family.id));
  const registry = loadRegistry(sectionKey);
  const known = new Map(registry.templates.map((entry) => [entry.id, entry]));
  let nextBit = registry.templates.reduce((max, entry) => Math.max(max, entry.bit + 1), 0);
  const changes = [];
  families.forEach((family) => {
    const entry = known.get(family.id);
    if (!entry) {
      registry.templates.push({ id: family.id, bit: nextBit });
      changes.push(`+ ${family.id} (bit ${nextBit})`);
      nextBit += 1;
    } else if (entry.retired) {
      delete entry.retired;
      changes.push(`restored ${family.id}`);
    }
  });
  registry.templates.forEach((entry) => {
    if (!live.has(entry.id) && !entry.retired) {
      entry.retired = true;
      changes.push(`retired ${entry.id} (bit ${entry.bit} stays reserved)`);
    }
  });
  const errors = problems(registry);
  errors.forEach((error) => console.error(`${sectionKey}: ${error}`));
  if (errors.length) failed = true;
  const active = registry.templates.filter((entry) => !entry.retired).length;
  if (CHECK) {
    if (changes.length) {
      console.error(`${sectionKey}: registry is stale (${changes.length} changes); run node tools/update-templates.js`);
      failed = true;
    } else console.log(`${sectionKey}: ${active} templates registered.`);
    continue;
  }
  const output = {
    sectionKey,
    note: "Bit positions are permanent: append new templates, retire removed ones, never renumber.",
    templates: registry.templates,
  };
  fs.writeFileSync(registryPath(sectionKey), `${JSON.stringify(output, null, 2)}\n`);
  console.log(`${sectionKey}: ${active} templates${changes.length ? `; ${changes.length} changes` : ""}.`);
  changes.slice(0, 5).forEach((change) => console.log(`  ${change}`));
}
process.exit(failed ? 1 : 0);
