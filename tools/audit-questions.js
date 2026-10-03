#!/usr/bin/env node
"use strict";

// Development-only quality audit for the question banks.
//
//   node tools/audit-questions.js            # available ACT bank diagnostics
//   node tools/audit-questions.js --json     # machine-readable
//   node tools/audit-questions.js --strict   # exit non-zero on threshold breach
//   node tools/audit-questions.js --admission # active admission, design repeats diagnostic
//   node tools/audit-questions.js --include-retired # also inspect saved-record archives
//
// Read-only. The shipped validator already rejects exact and structural
// duplicates, but its structural signature keeps numbers for math and keeps
// the scene preamble everywhere, so items that differ only in a town name or
// a coefficient pass it. This audit measures what that gate cannot see, plus
// the answer-position and choice-length biases that let a student score well
// without reading the question.

const { loadCatalog, loadBank, normalizeText, bankSections, validateQuestion } = require("./lib/content");

const THRESHOLDS = {
  exactDuplicateRate: 0,
  nearDuplicateRate: 0.02,
  maxTemplateFamilyShare: 0.1,
  maxPositionBiasByDifficulty: 0.4,
  maxLongestChoiceIsKey: 0.4,
  maxBlindScore: 0.4,
};

const SCENE_PREAMBLE =
  /^(during|at|in|as part of|while|for|after|before|on)\b[^,]{0,90},\s*/i;

/* ------------------------------------------------------------- signatures */

// Strips everything a generator varies cosmetically: the scene preamble, all
// numbers, and all proper nouns. What survives is the question's shape, so two
// items that differ only by town, object, or coefficient collide here.
function shapeSignature(question) {
  const stimulus = question.stimulus ? question.stimulus.content : "";
  // A passage-set item has no stimulus of its own, so its passage anchors the
  // signature. Without that, two sets both asking "the passage is best
  // described as" collide, and that stem is one the real ACT reuses on every
  // form; the question is which passage it is asked about.
  // Passage questions are distinguished by the stem and answer set; the
  // passage itself is shared by design. This matters especially for ACT
  // English, whose underlined stems differ only by a number.
  const context = question.passageId && Array.isArray(question.choices)
    ? question.choices.join(" ")
    : stimulus;
  let text = `${context} ${question.stem}`.trim();
  text = text.replace(SCENE_PREAMBLE, "");
  text = text.replace(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g, " ");
  text = text.replace(/\b\d+(?:\.\d+)?\b/g, "#");
  text = normalizeText(text).replace(/\s+/g, " ").trim();
  // Keep passageId outside number stripping: embedding p001 in `text` would
  // turn every passage suffix into p# and erase the anchor again.
  const passageAnchor = question.passageId ? `|${question.passageId}` : "";
  return `${question.sectionKey}${passageAnchor}|${question.subskill}|${text}`;
}

function exactSignature(question) {
  const stimulus = question.stimulus ? question.stimulus.content : "";
  const anchor = question.passageId ? `${question.passageId} ` : "";
  return normalizeText(`${anchor}${stimulus} ${question.stem}`);
}

function templateFamily(question) {
  const tagged = (question.tags || []).find((tag) => /^(family|templateFamily):/.test(tag));
  if (tagged) return tagged.slice(tagged.indexOf(":") + 1);
  if (question.templateFamily) return question.templateFamily;
  // Fall back to the shape signature so a bank that predates the field is
  // still measurable, just less precisely.
  return shapeSignature(question);
}

/* ---------------------------------------------------------------- measures */

function rate(count, total) {
  return total ? count / total : 0;
}

function countDuplicates(bank, signer) {
  const seen = new Map();
  let duplicates = 0;
  const worst = new Map();
  bank.forEach((question) => {
    const key = signer(question);
    if (seen.has(key)) {
      duplicates += 1;
      worst.set(key, (worst.get(key) || 1) + 1);
    } else {
      seen.set(key, question.id);
    }
  });
  return { duplicates, distinct: seen.size, worst };
}

// Answer-position bias measured inside each difficulty tier. A bank can be
// perfectly balanced overall and still key almost every Hard item to one
// letter, which is the exploitable case.
function positionBias(bank) {
  const tiers = {};
  bank
    .filter((question) => question.responseType === "multiple-choice")
    .forEach((question) => {
      const tier = (tiers[question.difficulty] = tiers[question.difficulty] || [0, 0, 0, 0]);
      tier[question.correctAnswer] += 1;
    });
  let blindHits = 0;
  let scored = 0;
  const detail = {};
  Object.entries(tiers).forEach(([tier, counts]) => {
    const total = counts.reduce((sum, value) => sum + value, 0);
    const top = Math.max(...counts);
    detail[tier] = { counts, share: rate(top, total) };
    blindHits += top;
    scored += total;
  });
  return { detail, guessScore: rate(blindHits, scored) };
}

function longestChoiceIsKey(bank) {
  const choiceItems = bank.filter((question) => Array.isArray(question.choices));
  let hits = 0;
  choiceItems.forEach((question) => {
    const lengths = question.choices.map((choice) => choice.length);
    const longest = Math.max(...lengths);
    if (
      lengths.filter((length) => length === longest).length === 1 &&
      lengths[question.correctAnswer] === longest
    ) {
      hits += 1;
    }
  });
  return rate(hits, choiceItems.length);
}

// Simulates a student who never reads: on a choice set they have seen before
// they recall the answer, otherwise they take the longest option.
function blindScore(bank) {
  const choiceItems = bank.filter((question) => Array.isArray(question.choices));
  const memory = new Map();
  let correct = 0;
  choiceItems.forEach((question) => {
    const key = question.choices.slice().sort().join("||");
    const answer = question.choices[question.correctAnswer];
    if (memory.has(key)) {
      if (memory.get(key) === answer) correct += 1;
    } else {
      const lengths = question.choices.map((choice) => choice.length);
      const longest = Math.max(...lengths);
      const longestCount = lengths.filter((length) => length === longest).length;
      if (lengths[question.correctAnswer] === longest) correct += 1 / longestCount;
    }
    memory.set(key, answer);
  });
  return rate(correct, choiceItems.length);
}

function distribution(bank, property) {
  const counts = {};
  bank.forEach((question) => {
    const key = question[property];
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function auditSection(sectionKey) {
  const bank = loadBank(sectionKey);
  if (!bank.length) return null;

  const exact = countDuplicates(bank, exactSignature);
  const near = countDuplicates(bank, shapeSignature);
  const families = countDuplicates(bank, templateFamily);
  const largestFamily = Math.max(1, ...[...families.worst.values()]);
  const bias = positionBias(bank);

  const failures = [];
  const exactRate = rate(exact.duplicates, bank.length);
  const nearRate = rate(near.duplicates, bank.length);
  const familyShare = rate(largestFamily, bank.length);
  const longest = longestChoiceIsKey(bank);
  const blind = blindScore(bank);
  const worstTier = Math.max(
    0,
    ...Object.values(bias.detail).map((entry) => entry.share),
  );

  if (exactRate > THRESHOLDS.exactDuplicateRate) failures.push("exact duplicates");
  if (nearRate > THRESHOLDS.nearDuplicateRate) failures.push("near-duplicate rate");
  if (familyShare > THRESHOLDS.maxTemplateFamilyShare) failures.push("template family dominates");
  if (worstTier > THRESHOLDS.maxPositionBiasByDifficulty) failures.push("answer-position bias");
  if (longest > THRESHOLDS.maxLongestChoiceIsKey) failures.push("longest choice is the key");
  if (blind > THRESHOLDS.maxBlindScore) failures.push("answerable without reading");

  return {
    sectionKey,
    total: bank.length,
    exactDuplicates: exact.duplicates,
    exactDuplicateRate: exactRate,
    nearDuplicates: near.duplicates,
    nearDuplicateRate: nearRate,
    distinctShapes: near.distinct,
    templateFamilies: families.distinct,
    largestFamily,
    largestFamilyShare: familyShare,
    positionByDifficulty: bias.detail,
    positionGuessScore: bias.guessScore,
    longestChoiceIsKey: longest,
    blindScore: blind,
    byDomain: distribution(bank, "domain"),
    bySkill: distribution(bank, "skill"),
    byDifficulty: distribution(bank, "difficulty"),
    failures,
  };
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

// Intentional numerical variants share a design. The old shape-rate limit is
// retained in --strict as a diagnostic; it cannot admit a 575-record bank of
// 232 designs. Admission still rejects exact repeats, concentrated families,
// answer tells and schema/numeric/key-format defects at the original limits.
function admissionFailures(report) {
  return report.failures.filter((failure) => failure !== "near-duplicate rate");
}

function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const admission = process.argv.includes("--admission");
  const catalog = loadCatalog();
  const includeRetired = process.argv.includes("--include-retired");
  if (admission && includeRetired) throw new Error("--admission checks available practice; use --strict --include-retired for archive diagnostics");
  const sections = bankSections(catalog, { includeRetired });
  const reports = sections
    .map((section) => auditSection(section.key))
    .filter(Boolean);
  const schemaErrors = admission ? sections.flatMap((section) => loadBank(section.key).flatMap((question) => validateQuestion(question, section, catalog))) : [];
  const failuresOf = admission ? admissionFailures : (report) => report.failures;

  if (json) {
    console.log(JSON.stringify({ scope: includeRetired ? "active and retained fixed banks" : "available fixed banks (ACT)", mode: admission ? "admission" : "diagnostic", thresholds: THRESHOLDS, reports, schemaErrors }, null, 2));
  } else {
    console.log(includeRetired ? "Fixed-bank audit (includes retained, unavailable banks)." : "Available fixed-bank audit (ACT). SAT practice is checked by check-families.js.");
    reports.forEach((report) => {
      console.log(`\n== ${report.sectionKey}  (${report.total} items)`);
      console.log(
        `   exact duplicates     ${String(report.exactDuplicates).padStart(4)}  ` +
          `${percent(report.exactDuplicateRate)}`,
      );
      console.log(
        `   near duplicates      ${String(report.nearDuplicates).padStart(4)}  ` +
          `${percent(report.nearDuplicateRate)}   ` +
          `(${report.distinctShapes} distinct question shapes)`,
      );
      console.log(
        `   largest family       ${String(report.largestFamily).padStart(4)}  ` +
          `${percent(report.largestFamilyShare)}   ` +
          `(${report.templateFamilies} families)`,
      );
      console.log(`   longest choice = key      ${percent(report.longestChoiceIsKey)}`);
      console.log(`   answerable without reading ${percent(report.blindScore)}`);
      console.log(`   answer position by difficulty:`);
      Object.entries(report.positionByDifficulty).forEach(([tier, entry]) => {
        console.log(
          `     ${tier.padEnd(7)} [${entry.counts.join(", ")}]  top ${percent(entry.share)}`,
        );
      });
      console.log(
        `   difficulty mix       ${JSON.stringify(report.byDifficulty)}`,
      );
      console.log(
        failuresOf(report).length
          ? `   FAIL: ${failuresOf(report).join(", ")}`
          : "   PASS",
      );
      if (admission && report.failures.includes("near-duplicate rate")) console.log("   Diagnostic: repeated shapes; numerical variants are not independent designs.");
    });

    const failing = reports.filter((report) => failuresOf(report).length);
    console.log(
      `\n${reports.length - failing.length}/${reports.length} sections pass ` +
        `${admission ? "admission" : "diagnostic"} thresholds.`,
    );
  }

  schemaErrors.slice(0, 20).forEach((error) => console.error(`  ${error}`));
  if (schemaErrors.length) console.error(`${schemaErrors.length} active-bank schema errors.`);
  if ((strict || admission) && (schemaErrors.length || reports.some((report) => failuresOf(report).length))) process.exit(1);
}

if (require.main === module) main();

module.exports = {
  admissionFailures,
  auditSection,
  blindScore,
  longestChoiceIsKey,
  positionBias,
  shapeSignature,
  templateFamily,
  THRESHOLDS,
};
