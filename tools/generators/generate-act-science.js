#!/usr/bin/env node
"use strict";

// Assembly only: every passage, answer and rationale is authored explicitly.
// The archived 0001–0575 records are immutable historical data, never input to
// active generation. Run --check to detect stale output without writing it.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { ROOT, writeJsonAtomic } = require("../lib/content");
const { createRandom } = require("../lib/generation");
const SECTION_KEY = "act-science";
const GENERATOR = "act-science-authored-v1";
const SOURCE_FILES = ["data.js", "research-a.js", "research-b.js", "viewpoints.js"];
const SOURCE_ALGORITHM = "sha256-science-question-v1";
const ARCHIVE_SHA256 = "9943960d30db20b1f87a23fb9899b1307dbbdfa4d64d22bedaa6b4e773a19336";
const CREATED = "2026-10-03";

function shuffle(items, seed) {
  const result = items.slice(), random = createRandom(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

// First allocate a near-equal set of letters within each tier; rotate the
// remainders so all tiers together are balanced too. Then shuffle that full
// target sequence: cycling A/B/C/D would leak the next answer in passage order.
function answerPositions(questions) {
  const targets = new Map();
  let remainder = 0;
  for (const tier of ["Easy", "Medium", "Hard"]) {
    const indices = questions.flatMap((question, index) => question.difficulty === tier ? [index] : []);
    const letters = indices.map((_, index) => (index + remainder) % 4);
    remainder = (remainder + indices.length) % 4;
    shuffle(letters, `${GENERATOR}:${tier}:positions`).forEach((letter, index) => targets.set(indices[index], letter));
  }
  return targets;
}

function arrangeQuestion(question, position, seed) {
  const wrongIndices = shuffle([0, 1, 2, 3].filter((index) => index !== question.correctAnswer), `${seed}:distractors`);
  const order = wrongIndices.slice();
  order.splice(position, 0, question.correctAnswer);
  return {
    ...question,
    choices: order.map((index) => question.choices[index]),
    correctAnswer: position,
    distractorRationales: order.flatMap((oldIndex, index) => index === position ? [] : [{
      index, reason: question.distractorRationales.find((entry) => entry.index === oldIndex).reason,
    }]),
  };
}

function loadSources(root = ROOT) {
  return SOURCE_FILES.flatMap((file) => {
    const location = path.join(root, "content/sources/act-science", file);
    delete require.cache[require.resolve(location)];
    const passages = require(location);
    if (!Array.isArray(passages)) throw new Error(`${file}: must export a passage array`);
    return passages;
  });
}

function assembleScience(root = ROOT) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, "content/catalog.json"), "utf8"));
  const section = catalog.sections.find((entry) => entry.key === SECTION_KEY);
  const sources = loadSources(root);
  const authored = sources.flatMap((passage) => passage.questions);
  if (sources.length !== 14 || authored.length !== 80) {
    throw new Error(`Science assembly requires 14 complete passage sets and 80 questions; found ${sources.length} sets and ${authored.length} questions`);
  }
  const positions = answerPositions(authored);
  const questions = [], passages = [];
  for (const source of sources) {
    const { questions: authoredQuestions, ...passage } = source;
    const provenance = { type: "original", generator: GENERATOR, seed: source.id, created: CREATED };
    passages.push({ ...passage, sectionKey: SECTION_KEY,
      wordCount: source.content.trim().split(/\s+/).filter(Boolean).length, provenance });
    for (const question of authoredQuestions) {
      const sequence = questions.length + 576;
      const id = `${SECTION_KEY}-${String(sequence).padStart(4, "0")}`;
      const position = positions.get(questions.length);
      if (position === undefined) throw new Error(`${id}: invalid authored difficulty`);
      questions.push({
        ...arrangeQuestion(question, position, id),
        id, test: section.test, section: section.section, sectionKey: SECTION_KEY,
        responseType: "multiple-choice", stimulus: null, passageId: source.id,
        format: question.format || source.type,
        calculatorPolicy: section.calculatorPolicy,
        provenance: { ...provenance, seed: id }, contentVersion: catalog.contentVersion,
        reviewStatus: "automated-verified", verification: null,
      });
    }
  }
  return { questions, passages };
}

// This finite bank's entire source output is reproduced by outputProblems.
// Bind review to every final question field and shared passage field; changes
// to a passage invalidate every question using it. Unlike a sampled template,
// no unreviewed seed or branch can supply another active question at runtime.
function fingerprintQuestion(question, passage) {
  return crypto.createHash("sha256").update(JSON.stringify({ question, passage })).digest("hex");
}
function serialized(value) { return `${JSON.stringify(value, null, 2)}\n`; }
function outputProblems(root = ROOT, assembled = assembleScience(root)) {
  return [["content/banks/act-science.json", assembled.questions], ["content/passages/act-science.json", assembled.passages]]
    .filter(([file, value]) => !fs.existsSync(path.join(root, file)) || fs.readFileSync(path.join(root, file), "utf8") !== serialized(value))
    .map(([file]) => `${file}: generated output differs from authored sources; run the Science assembler`);
}
function main() {
  const assembled = assembleScience();
  if (process.argv.includes("--check")) {
    const problems = outputProblems(ROOT, assembled);
    problems.forEach((problem) => console.error(problem));
    if (problems.length) return 1;
  } else {
    writeJsonAtomic(path.join(ROOT, "content/banks/act-science.json"), assembled.questions);
    writeJsonAtomic(path.join(ROOT, "content/passages/act-science.json"), assembled.passages);
  }
  console.log(`ACT Science: ${assembled.questions.length} authored questions in ${assembled.passages.length} shared passages; 575 archived records preserved.`);
  return 0;
}
if (require.main === module) {
  try { process.exitCode = main(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { assembleScience, loadSources, answerPositions, arrangeQuestion, SOURCE_ALGORITHM,
  SOURCE_FILES, ARCHIVE_SHA256, fingerprintQuestion, outputProblems };
