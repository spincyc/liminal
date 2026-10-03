#!/usr/bin/env node
"use strict";

// An admission record establishes what was reviewed, not that a computer can
// judge prose or measure SAT difficulty. There is deliberately no auto-accept
// writer: a reviewer must solve the displayed samples and record the outcome.
const fs = require("node:fs");
const path = require("node:path");
const { TEMPLATE_SECTIONS } = require("./lib/families");
const { SOURCE_ALGORITHM, sectionFingerprints } = require("./lib/fingerprint");
const { numericEqual } = require("../src/lib/core");

function reviewProblems(manifest, sections, evidenceExists) {
  const problems = [];
  if (!manifest || manifest.format !== "liminal-template-reviews" || manifest.version !== 1 ||
      !Array.isArray(manifest.reviews)) return ["expected liminal-template-reviews version 1 with reviews array"];
  const records = new Map();
  for (const review of manifest.reviews) {
    if (!review || typeof review !== "object") { problems.push("invalid review record"); continue; }
    const key = `${review.sectionKey}/${review.templateId}`;
    if (records.has(key)) problems.push(`${key}: duplicate review`);
    records.set(key, review);
  }
  const active = new Set();
  for (const section of sections) {
    for (const family of section.families) {
      const key = `${section.sectionKey}/${family.id}`;
      active.add(key);
      const review = records.get(key);
      const entry = section.registry.templates.find((item) => item.id === family.id && !item.retired);
      if (!review) { problems.push(`${key}: independent review missing`); continue; }
      if (!entry || review.templateVersion !== entry.version ||
          review.fingerprintAlgorithm !== SOURCE_ALGORITHM ||
          review.fingerprint !== section.fingerprints.get(family.id) ||
          review.fingerprint !== entry.fingerprint || review.difficulty !== family.difficulty) {
        problems.push(`${key}: review is stale; review current source, version and difficulty`);
      }
      if (review.verdict !== "accepted" || review.method !== "independent-agent-blind-solve" ||
          typeof review.reviewer !== "string" || !review.reviewer.trim() ||
          typeof review.author !== "string" || !review.author.trim() ||
          review.reviewer.trim().toLowerCase() === review.author.trim().toLowerCase()) {
        problems.push(`${key}: record an independent reviewer, author, method and accepted verdict`);
      }
      const reviewedAt = Date.parse(`${review.reviewedAt}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt || "") ||
          !Number.isFinite(reviewedAt) || new Date(reviewedAt).toISOString().slice(0, 10) !== review.reviewedAt) {
        problems.push(`${key}: invalid review date`);
      }
      if (typeof review.evidence !== "string" || !/^docs\/reviews\/[a-zA-Z0-9_-]+\.md$/.test(review.evidence) ||
          !evidenceExists(review.evidence)) problems.push(`${key}: missing repository review evidence`);
      const samples = Array.isArray(review.samples) ? review.samples : [];
      if (samples.length < 3 || new Set(samples.map((sample) => sample && sample.seed)).size < 3) {
        problems.push(`${key}: at least three distinct independently solved seeds required`);
      }
      const variants = new Set();
      const scenes = new Set();
      for (const sample of samples) {
        if (!sample || typeof sample.seed !== "string" || !sample.seed ||
            !Object.hasOwn(sample, "answer")) { problems.push(`${key}: invalid solved sample`); continue; }
        try {
          const question = section.instantiate(family, sample.seed);
          variants.add(JSON.stringify([question.stimulus || null, question.stem, question.figure || null,
            Array.isArray(question.choices) ? question.choices.slice().sort() : null]));
          if (question.scene) scenes.add(question.scene);
          const agrees = question.responseType === "numeric"
            ? numericEqual(sample.answer, question.correctAnswer)
            : Number.isInteger(sample.answer) && sample.answer === question.correctAnswer;
          if (!agrees) problems.push(`${key} seed ${sample.seed}: recorded independent answer disagrees with key`);
          if (sample.scene !== (question.scene || null)) problems.push(`${key} seed ${sample.seed}: scene mismatch`);
        } catch (error) { problems.push(`${key} seed ${sample.seed}: ${error.message}`); }
      }
      if (variants.size < 3) problems.push(`${key}: review three different displayed questions, not reshuffled choices`);
      if (section.sectionKey === "sat-reading-writing" && scenes.size < 3) {
        problems.push(`${key}: review at least three distinct reading scenes`);
      }
    }
  }
  for (const key of records.keys()) if (!active.has(key)) problems.push(`${key}: review has no active template`);
  return problems;
}

function main(root = path.resolve(__dirname, "..")) {
  const file = path.join(root, "content/template-reviews.json");
  if (!fs.existsSync(file)) throw new Error("content/template-reviews.json is missing; independent review is required");
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  const sections = TEMPLATE_SECTIONS.map((sectionKey) => ({
    sectionKey,
    ...sectionFingerprints(root, sectionKey),
    registry: JSON.parse(fs.readFileSync(path.join(root, "content/templates", `${sectionKey}.json`), "utf8")),
  }));
  const problems = reviewProblems(manifest, sections, (relative) => fs.existsSync(path.join(root, relative)));
  if (problems.length) {
    console.error(`Template review admission failed: ${problems.length} problems`);
    problems.slice(0, 20).forEach((problem) => console.error(`- ${problem}`));
    return 1;
  }
  console.log(`Template review admission passed: ${manifest.reviews.length} source-bound independent agent reviews. ` +
    "This is sampled editorial evidence, not human approval or measured test difficulty.");
  return 0;
}

if (require.main === module) {
  try { process.exitCode = main(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { reviewProblems, main };
