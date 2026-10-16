#!/usr/bin/env node
"use strict";

// Checks content/desmos-routes.json, the Desmos solution routes the test
// screen shows after a SAT Math question is answered:
//
//   { "format": "liminal-desmos-routes", "version": 1,
//     "sections": { "sat-math": { "<templateId>": { "enter", "read", "fails" } } } }
//
// Every key must be an active template of its section, listed in the
// templates' own order, and every field a short line of plain text: the
// shell renders it as text, so HTML or Markdown would show literally.
// "fails" is required because every heuristic states when it fails.
// Whether a route is right is not checked here; routes are verified
// numerically against generated questions when they are written.
//
//   node tools/check-desmos.js

const fs = require("node:fs");
const path = require("node:path");
const { sectionDirectory } = require("./lib/families");

const FILE = path.join(__dirname, "..", "content", "desmos-routes.json");
const FORMAT = "liminal-desmos-routes";
const VERSION = 1;
const FIELDS = ["enter", "read", "fails"];
const MAX_FIELD = 300;
// Sections whose questions allow the graphing calculator.
const SECTIONS = ["sat-math"];

// Active template ids of a section, in the templates' order: those its
// family files define that its registry has not retired.
function activeTemplateIds(sectionKey) {
  const registry = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "content", "templates", `${sectionKey}.json`), "utf8"));
  const retired = new Set(registry.templates.filter((entry) => entry.retired).map((entry) => entry.id));
  return require(sectionDirectory(sectionKey)).map((family) => family.id).filter((id) => !retired.has(id));
}

function textProblems(text) {
  const problems = [];
  if (typeof text !== "string" || !text.trim()) return ["must be a non-empty string"];
  if (text.length > MAX_FIELD) problems.push(`is ${text.length} characters (at most ${MAX_FIELD})`);
  if (text !== text.trim()) problems.push("has leading or trailing space");
  if (/[\n\r\t]/.test(text)) problems.push("must be one line");
  // A tag starts "<" then a letter, "/" or "!"; inequalities keep a space
  // after "<" ("y < 2x"), so they never look like one.
  if (/<[a-z/!]/i.test(text) || /&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i.test(text)) {
    problems.push("contains HTML (or a \"<\" without a space after it)");
  }
  if (/`|\*\*|\]\(/.test(text)) problems.push("contains Markdown");
  return problems;
}

// Problems with a routes document, given { sectionKey: [active ids in order] }.
function routeProblems(data, activeIds) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return ["the routes file must hold an object"];
  const problems = [];
  if (data.format !== FORMAT) problems.push(`format must be "${FORMAT}"`);
  if (data.version !== VERSION) problems.push(`version must be ${VERSION}`);
  const extra = Object.keys(data).filter((key) => !["format", "version", "sections"].includes(key));
  if (extra.length) problems.push(`unexpected top-level keys: ${extra.join(", ")}`);
  const sections = data.sections;
  if (!sections || typeof sections !== "object" || Array.isArray(sections)) {
    problems.push("sections must be an object");
    return problems;
  }
  Object.keys(sections).forEach((sectionKey) => {
    const ids = activeIds[sectionKey];
    if (!ids) {
      problems.push(`${sectionKey}: not a section with Desmos routes (${Object.keys(activeIds).join(", ")})`);
      return;
    }
    const routes = sections[sectionKey];
    if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
      problems.push(`${sectionKey}: must map template ids to routes`);
      return;
    }
    let lastPosition = -1;
    Object.keys(routes).forEach((templateId) => {
      const where = `${sectionKey}/${templateId}`;
      const position = ids.indexOf(templateId);
      if (position < 0) problems.push(`${where}: not an active template`);
      else if (position < lastPosition) problems.push(`${where}: out of the templates' order`);
      else lastPosition = position;
      const route = routes[templateId];
      if (!route || typeof route !== "object" || Array.isArray(route)) {
        problems.push(`${where}: must be an object with ${FIELDS.join(", ")}`);
        return;
      }
      const unknown = Object.keys(route).filter((key) => !FIELDS.includes(key));
      if (unknown.length) problems.push(`${where}: unexpected fields ${unknown.join(", ")}`);
      FIELDS.forEach((field) => {
        textProblems(route[field]).forEach((problem) => problems.push(`${where}.${field} ${problem}`));
      });
    });
  });
  return problems;
}

function main() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (error) {
    console.error(`content/desmos-routes.json: ${error.message}`);
    return 1;
  }
  const activeIds = Object.fromEntries(SECTIONS.map((sectionKey) => [sectionKey, activeTemplateIds(sectionKey)]));
  const problems = routeProblems(data, activeIds);
  if (problems.length) {
    console.error(`Desmos routes: ${problems.length} problem${problems.length === 1 ? "" : "s"}`);
    problems.slice(0, 20).forEach((problem) => console.error(`  ${problem}`));
    return 1;
  }
  const counts = SECTIONS.map((sectionKey) => {
    const routed = Object.keys((data.sections || {})[sectionKey] || {}).length;
    return `${sectionKey} ${routed} of ${activeIds[sectionKey].length} templates`;
  });
  console.log(`Desmos routes passed: ${counts.join(", ")}.`);
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { FORMAT, VERSION, FIELDS, MAX_FIELD, SECTIONS, activeTemplateIds, textProblems, routeProblems, main };
