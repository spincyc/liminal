#!/usr/bin/env node
"use strict";

// Mechanical admission supports, but cannot replace, the independent blind
// solutions in science-reviews.json. This tool never writes approval records.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { ROOT, validateQuestion, validateFigure, coverageErrors, duplicateErrors } = require("./lib/content");
const { assembleScience, fingerprintQuestion, SOURCE_ALGORITHM, ARCHIVE_SHA256, outputProblems } = require("./generators/generate-act-science");
const SECTION = "act-science";
const TYPE_COUNTS = { "data-representation": 4, "research-summaries": 8, "conflicting-viewpoints": 2 };
const DOMAIN_COUNTS = { "Interpretation of Data": 34, "Scientific Investigation": 22,
  "Evaluating Scientific Arguments and Models with Evidence": 24 };
const AUTHORS = ["science_data", "science_research_a", "science_research_b", "science_viewpoints"];
function expectedAuthor(passageId) {
  const number = Number(String(passageId).slice(-3));
  return AUTHORS[number <= 4 ? 0 : number <= 8 ? 1 : number <= 12 ? 2 : 3];
}
function text(value) { return typeof value === "string" && Boolean(value.trim()); }
function scienceProblems({ questions, passages }, catalog) {
  const problems = [], section = catalog.sections.find((entry) => entry.key === SECTION);
  if (!section) return ["ACT Science section is missing"];
  if (section.targetQuestions !== 80 || section.activeQuestionIdMin !== 576) problems.push("Science must declare targetQuestions 80 and activeQuestionIdMin 576");
  if (questions.length !== 80) problems.push(`Science needs 80 authored questions, found ${questions.length}`);
  if (passages.length !== 14) problems.push(`Science needs 14 shared passages, found ${passages.length}`);
  for (const [domain, count] of Object.entries(DOMAIN_COUNTS)) {
    if (section.domains.find((entry) => entry.name === domain)?.target !== count) problems.push(`${domain}: catalog target must be ${count}`);
    const actual = questions.filter((question) => question.domain === domain).length;
    if (actual !== count) problems.push(`${domain}: expected ${count}, found ${actual}`);
  }
  const byId = new Map(passages.map((passage) => [passage.id, passage]));
  for (const [type, count] of Object.entries(TYPE_COUNTS)) {
    const actual = passages.filter((passage) => passage.type === type).length;
    if (actual !== count) problems.push(`${type}: expected ${count} passage sets, found ${actual}`);
  }
  passages.forEach((passage, index) => {
    const expectedId = `${SECTION}-p${String(index + 1).padStart(3, "0")}`;
    if (passage.id !== expectedId) problems.push(`${passage.id}: expected passage ID ${expectedId}`);
    if (!Object.hasOwn(TYPE_COUNTS, passage.type)) problems.push(`${passage.id}: invalid passage type`);
    const size = questions.filter((question) => question.passageId === passage.id).length;
    const expected = passage.type === "data-representation" ? 5 : 6;
    if (size !== expected) problems.push(`${passage.id}: expected ${expected} questions, found ${size}`);
    const words = String(passage.content || "").trim().split(/\s+/).filter(Boolean).length;
    if (words < 80 || words > 600 || passage.wordCount !== words) problems.push(`${passage.id}: requires 80–600 words and matching wordCount`);
    if (passage.figure !== undefined) validateFigure(passage.figure).forEach((problem) => problems.push(`${passage.id}: ${problem}`));
  });
  questions.forEach((question, index) => {
    if (question.id !== `${SECTION}-${String(576 + index).padStart(4, "0")}`) problems.push(`${question.id}: active IDs must be ordered 0576–0655`);
    if (!question.passageId || !byId.has(question.passageId) || question.stimulus !== null) problems.push(`${question.id}: every active item needs one shared passage and null stimulus`);
    if (question.reviewStatus !== "automated-verified") problems.push(`${question.id}: Science admission does not establish human editorial review`);
    problems.push(...validateQuestion(question, { ...section, practiceAvailable: true }, catalog));
  });
  for (const domain of section.domains) for (const [skill, subskills] of Object.entries(domain.skills)) for (const subskill of subskills) {
    if (!questions.some((question) => question.domain === domain.name && question.skill === skill && question.subskill === subskill)) problems.push(`${skill}/${subskill}: active Science coverage missing`);
  }
  for (const subskill of ["graphs", "diagrams"]) {
    if (!questions.some((question) => question.subskill === subskill && byId.get(question.passageId)?.figure)) problems.push(`${subskill}: needs a question using a rendered passage figure`);
  }
  const contexts = ["biology", "chemistry", "physics", "earth-space-science"];
  contexts.forEach((context) => {
    if (!questions.some((question) => question.tags?.includes(context))) problems.push(`${context}: scientific context coverage missing`);
  });
  for (const tier of ["Easy", "Medium", "Hard"]) {
    const items = questions.filter((question) => question.difficulty === tier);
    if (!items.length) { problems.push(`${tier}: no authored questions`); continue; }
    const counts = [0, 1, 2, 3].map((answer) => items.filter((question) => question.correctAnswer === answer).length);
    if (Math.max(...counts) - Math.min(...counts) > 1) problems.push(`${tier}: answer positions must differ by at most one`);
  }
  problems.push(...coverageErrors(questions, { ...catalog, sections: [section] }, true));
  problems.push(...duplicateErrors(questions));
  return problems;
}
function reviewProblems(manifest, assembled, evidenceExists) {
  if (!manifest || manifest.format !== "liminal-science-reviews" || manifest.version !== 1 || !Array.isArray(manifest.reviews)) return ["expected liminal-science-reviews version 1 with reviews array"];
  const problems = [], records = new Map();
  for (const review of manifest.reviews) {
    if (!review || typeof review !== "object" || !text(review.questionId)) { problems.push("invalid Science review record"); continue; }
    if (records.has(review.questionId)) problems.push(`${review.questionId}: duplicate review`);
    records.set(review.questionId, review);
  }
  const passages = new Map(assembled.passages.map((passage) => [passage.id, passage]));
  for (const question of assembled.questions) {
    const review = records.get(question.id);
    if (!review) { problems.push(`${question.id}: independent review missing`); continue; }
    if (review.fingerprintAlgorithm !== SOURCE_ALGORITHM || review.fingerprint !== fingerprintQuestion(question, passages.get(question.passageId))) problems.push(`${question.id}: source-bound independent review is stale`);
    if (review.method !== "independent-agent-blind-solve" || review.verdict !== "accepted" ||
        review.author !== expectedAuthor(question.passageId) || !text(review.reviewer) ||
        review.reviewer.trim().toLowerCase() === review.author.toLowerCase()) problems.push(`${question.id}: independent author, reviewer, method and accepted verdict required`);
    const date = Date.parse(`${review.reviewedAt}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt || "") || !Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== review.reviewedAt) problems.push(`${question.id}: invalid review date`);
    if (!text(review.evidence) || !/^docs\/reviews\/[a-zA-Z0-9_-]+\.md$/.test(review.evidence) || !evidenceExists(review.evidence)) problems.push(`${question.id}: repository review evidence is missing`);
    if (!Number.isInteger(review.answer) || review.answer !== question.correctAnswer) problems.push(`${question.id}: independent answer disagrees with final key`);
    if (Object.hasOwn(review, "answerText") && review.answerText !== question.choices?.[review.answer]) problems.push(`${question.id}: independent answer text disagrees with its final choice index`);
  }
  const active = new Set(assembled.questions.map((question) => question.id));
  for (const id of records.keys()) if (!active.has(id)) problems.push(`${id}: review has no active Science question`);
  return problems;
}
function main(root = ROOT, { fingerprints = false } = {}) {
  const assembled = assembleScience(root);
  const catalog = JSON.parse(fs.readFileSync(path.join(root, "content/catalog.json"), "utf8"));
  if (fingerprints) {
    const byId = new Map(assembled.passages.map((passage) => [passage.id, passage]));
    console.log(JSON.stringify(assembled.questions.map((question) => ({ questionId: question.id,
      fingerprintAlgorithm: SOURCE_ALGORITHM, fingerprint: fingerprintQuestion(question, byId.get(question.passageId)) })), null, 2));
    return 0;
  }
  const problems = [...scienceProblems(assembled, catalog), ...outputProblems(root, assembled)];
  const archivePath = path.join(root, "content/archive/act-science.json");
  if (!fs.existsSync(archivePath) || crypto.createHash("sha256").update(fs.readFileSync(archivePath)).digest("hex") !== ARCHIVE_SHA256) problems.push("Original Science archive differs from its immutable 575-record baseline");
  const manifestPath = path.join(root, "content/science-reviews.json");
  if (!fs.existsSync(manifestPath)) problems.push("content/science-reviews.json is missing; independent blind review is required");
  else problems.push(...reviewProblems(JSON.parse(fs.readFileSync(manifestPath, "utf8")), assembled, (file) => fs.existsSync(path.join(root, file))));
  if (problems.length) {
    console.error(`Science admission failed: ${problems.length} problems`);
    problems.slice(0, 20).forEach((problem) => console.error(`- ${problem}`));
    return 1;
  }
  console.log("Science admission passed: 80 authored questions, 14 passage sets, immutable archive and 80 source-bound independent agent reviews. Difficulty remains uncalibrated; human editorial review is outstanding.");
  return 0;
}
if (require.main === module) {
  try { process.exitCode = main(ROOT, { fingerprints: process.argv.includes("--fingerprints") }); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { scienceProblems, reviewProblems, expectedAuthor, main };
