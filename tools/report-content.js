#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { validateAll, bankSections } = require("./lib/content");
const { TEMPLATE_SECTIONS } = require("./lib/families");

const result = validateAll();
const active = bankSections(result.catalog);
const activeKeys = new Set(active.map((section) => section.key));
const archived = result.catalog.sections.filter((section) => !activeKeys.has(section.key));
const lines = [
  "# Content Coverage Report", "", `Content version: ${result.catalog.contentVersion}`, "",
  "SAT practice uses parameterized templates. ACT uses the available fixed banks below.",
  "Counts describe practice inventory, not independent question designs or empirical difficulty calibration.", "",
  "## Active SAT templates", "",
  "| Section | Templates | Easy | Medium | Hard |", "| --- | ---: | ---: | ---: | ---: |",
];
for (const key of TEMPLATE_SECTIONS) {
  const [test, ...section] = key.split("-");
  const families = require(path.join(__dirname, "../src/lib/families", test, section.join("-")));
  const tiers = ["Easy", "Medium", "Hard"].map((tier) => families.filter((family) => family.difficulty === tier).length);
  lines.push(`| ${key} | ${families.length} | ${tiers.join(" | ")} |`);
}
lines.push("", "Source-version and review evidence are checked separately from schema and answer-tell measurements.", "",
  "## Available ACT fixed banks", "",
  "| Section | Records | Target | Easy label | Medium label | Hard label | Awaiting human review |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
active.forEach((section) => {
  const report = result.report[section.key];
  const awaiting = report.total - (report.reviewStatuses["editorial-reviewed"] || 0);
  lines.push(`| ${section.test} ${section.shortLabel} | ${report.total} | ${report.target} | ${report.difficulties.Easy || 0} | ${report.difficulties.Medium || 0} | ${report.difficulties.Hard || 0} | ${awaiting} |`);
});
if (activeKeys.has("act-science")) {
  const sets = result.passages.filter((passage) => passage.sectionKey === "act-science").length;
  lines.push("", `Science has ${result.report["act-science"].total} authored questions in ${sets} shared passage sets. Its explicit target describes that inventory; the former ${result.archiveReport["act-science"]?.total || 0} records are archived separately, not used to fill the active target.`);
}
lines.push("", "Fixed-bank difficulty labels remain uncalibrated; repeated numerical variants are not new question designs.", "",
  "## Retained banks", "", "These records remain for compatibility, outside new practice inventory. Historical outcomes are preserved; original question details require a matching identity or saved snapshot.", "",
  "| Section | Retained records | Status |", "| --- | ---: | --- |");
archived.forEach((section) => lines.push(`| ${section.test} ${section.shortLabel} | ${result.report[section.key].total} | ${TEMPLATE_SECTIONS.includes(section.key) ? "Retired; replaced by templates" : "Unavailable for new practice"} |`));
Object.entries(result.archiveReport).forEach(([key, report]) => {
  const section = result.catalog.sections.find((entry) => entry.key === key);
  lines.push(`| ${section.test} ${section.shortLabel} | ${report.total} | Archived original records; excluded from active coverage and admission |`);
});
lines.push("", "## Available fixed-bank domain coverage", "");
active.forEach((section) => {
  lines.push(`### ${section.test} ${section.shortLabel}`, "", "| Domain | Records | Target |", "| --- | ---: | ---: |");
  section.domains.forEach((domain) => lines.push(`| ${domain.name} | ${result.report[section.key].domains[domain.name] || 0} | ${domain.target} |`));
  lines.push("");
});
lines.push("## Available fixed-bank response and answer distribution", "",
  "| Section | Multiple choice | Numeric | Essay | A | B | C | D |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
active.forEach((section) => {
  const report = result.report[section.key];
  lines.push(`| ${section.test} ${section.shortLabel} | ${report.responseTypes["multiple-choice"] || 0} | ${report.responseTypes.numeric || 0} | ${report.responseTypes.essay || 0} | ${[0, 1, 2, 3].map((position) => report.answerPositions[position] || 0).join(" | ")} |`);
});
lines.push("", "## Validation status", "",
  result.errors.length === 0
    ? "Available and retained bank records pass schema, taxonomy, duplicate, key-format, instructional-metadata, and coverage checks."
    : `Bank validation reports ${result.errors.length} error(s).`, "",
  "Verification blocks recompute their declared inputs and expected value; they do not prove that the prose, displayed key, or distractors are correct.",
  "Automated checks and agent editorial reviews do not establish independent human approval or empirical exam calibration.", "");
const output = `${lines.join("\n")}\n`;
if (process.argv.includes("--write")) {
  const target = path.join(__dirname, "..", "docs/content-report.md");
  fs.writeFileSync(target, output);
  console.log(`Wrote ${path.relative(process.cwd(), target)}.`);
} else process.stdout.write(output);
if (result.errors.length) process.exitCode = 1;
