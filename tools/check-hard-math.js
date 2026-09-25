#!/usr/bin/env node
"use strict";

// Gate for the SAT Math Hard families. Generates many repetitions of every
// family and fails on anything a student would notice: a wrong key, a broken
// choice, a method named in the stem, too few distinct repetitions, or a
// "not drawn to scale" figure with no answer that the drawing lures toward.
//
//   node tools/check-hard-math.js                 # all families
//   node tools/check-hard-math.js --file geometry # one file
//   node tools/check-hard-math.js --family <id>   # one family
//   node tools/check-hard-math.js --sample [<id>] [--seed <s>] [--svg-dir <dir>]
//   node tools/check-hard-math.js --reps 500

const fs = require("fs");
const path = require("path");
const FAMILY_DIR = "../src/lib/families/sat-math-hard";
const S = require(`${FAMILY_DIR}/shared`);

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const flag = (name) => args.includes(name);

const REPS = Number(option("--reps", 200));
const FILES = ["algebra", "advanced-quadratics", "advanced-functions", "data-analysis", "geometry"];
const RUBRIC_FACTORS = ["steps", "concept", "interpretation", "distractors", "abstraction", "synthesis", "trap"];
const TRICKS = new Set([
  "not-to-scale-figure", // the drawing suggests a wrong measure that is offered
  "intermediate-value", // a value computed on the way is offered
  "wrong-quantity", // the answer to a neighbouring question (x instead of 2x)
  "unit-mismatch", // given in one unit, asked in another
  "sign-error", // a sign lost while rearranging is offered
  "extraneous-solution", // an algebraic root that fails the original equation
  "must-vs-could", // "must be true" versus "could be true"
  "rounding-direction", // whole-number context rounds the other way
  "percent-base", // percent of the wrong base
  "part-vs-whole", // ratio of a part used where the whole is needed
  "equivalent-form", // choices are rearrangements; only one is equivalent
  "context-constraint", // a solution the context forbids (negative length, etc.)
  "unweighted-average", // averaging averages
  "reversed-condition", // the condition for the opposite case
  "neighbouring-rule", // the rule next door (area vs perimeter, sum vs product)
]);
const GIVEAWAYS = [
  /structure for this case/i,
  /\buse the\b[^.?]*\b(rule|theorem|formula|method|property|identity|structure|relationship|model)\b/i,
  /verify the result in the original conditions/i,
  /track each quantity/i,
  /\bremember (that|to)\b/i,
  /\bhint\b/i,
];
const SCALE_WORDS = /figure|drawn|drawing|appears|looks|scale|eye/i;
const catalog = require("../content/catalog.json");
const satMath = catalog.sections.find((section) => section.key === "sat-math");

function loadFamilies() {
  const only = option("--file", null);
  const files = only ? [only] : FILES;
  return files.flatMap((file) =>
    require(`${FAMILY_DIR}/${file}`).map((family) => ({ ...family, file })),
  );
}

function catalogError(family) {
  const domain = satMath.domains.find((entry) => entry.name === family.domain);
  if (!domain) return `unknown domain "${family.domain}"`;
  const subskills = domain.skills[family.skill];
  if (!subskills) return `unknown skill "${family.skill}" in ${family.domain}`;
  if (!subskills.includes(family.subskill)) return `unknown subskill "${family.subskill}"`;
  return null;
}

function metaErrors(family, ids) {
  const errors = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(family.id || "")) errors.push("id must be kebab-case");
  if (ids.has(family.id)) errors.push("duplicate id");
  ids.add(family.id);
  const bad = catalogError(family);
  if (bad) errors.push(bad);
  if (!family.title) errors.push("missing title");
  if (!family.recognize) errors.push("missing recognize");
  const rubric = family.rubric || {};
  const scores = RUBRIC_FACTORS.map((factor) => rubric[factor]);
  if (scores.some((score) => ![0, 1, 2].includes(score))) {
    errors.push(`rubric needs ${RUBRIC_FACTORS.join("/")} each 0-2`);
  } else {
    const total = scores.reduce((sum, score) => sum + score, 0);
    const twos = scores.filter((score) => score === 2).length;
    if (total < 9) errors.push(`rubric total ${total} < 9 (not Hard)`);
    if (twos < 2) errors.push(`rubric has ${twos} factors at 2; Hard needs 2`);
  }
  const tricks = family.tricks || [];
  if (tricks.length < 2) errors.push("declare at least 2 tricks");
  tricks.filter((trick) => !TRICKS.has(trick)).forEach((trick) => errors.push(`unknown trick "${trick}"`));
  if (typeof family.build !== "function") errors.push("missing build");
  return errors;
}

function strings(record) {
  return [
    record.stem,
    record.hint,
    record.explanation,
    record.trap,
    record.strategy,
    ...(record.solutionSteps || []),
    ...(record.principles || []),
    ...(record.choices || []),
    ...((record.distractorRationales || []).map((entry) => entry.reason)),
    record.stimulus && record.stimulus.content,
    record.figure && record.figure.alt,
  ].filter((value) => value !== undefined && value !== null);
}

function svgErrors(svgText) {
  const errors = [];
  if (!/^<svg\b[^>]*\bviewBox="/.test(svgText)) errors.push("svg must start with <svg ... viewBox>");
  if (/<script|\son[a-z]+=|javascript:/i.test(svgText)) errors.push("svg contains script or handlers");
  const stack = [];
  const tagPattern = /<(\/?)([a-zA-Z]+)\b[^>]*?(\/?)>/g;
  let match;
  while ((match = tagPattern.exec(svgText))) {
    const [, closing, name, selfClosing] = match;
    if (selfClosing) continue;
    if (!closing) stack.push(name);
    else if (stack.pop() !== name) {
      errors.push(`unbalanced </${name}>`);
      break;
    }
  }
  if (stack.length) errors.push(`unclosed <${stack[stack.length - 1]}>`);
  return errors;
}

function recordErrors(family, record) {
  const errors = [];
  if (!record.verified) errors.push("verify() returned false");
  if (!["multiple-choice", "numeric"].includes(record.responseType)) errors.push("bad responseType");
  const text = strings(record);
  if (text.some((value) => typeof value !== "string" || !value.trim())) errors.push("empty text field");
  if (text.some((value) => S.BAD_TEXT.test(value))) errors.push("undefined/NaN/Infinity in text");
  if (!record.stem || record.stem.length > 700) errors.push("stem missing or over 700 chars");
  GIVEAWAYS.forEach((pattern) => {
    if (pattern.test(record.stem)) errors.push(`stem names the method (${pattern})`);
  });
  if (record.stem.toLowerCase().includes(family.title.toLowerCase())) errors.push("stem contains the family title");
  if (!Array.isArray(record.solutionSteps) || record.solutionSteps.length < 3) errors.push("fewer than 3 solution steps");
  if (!Array.isArray(record.principles) || !record.principles.length) errors.push("no principles");
  if (record.responseType === "multiple-choice") {
    if (!Array.isArray(record.choices) || record.choices.length !== 4) errors.push("needs 4 choices");
    else if (new Set(record.choices).size !== 4) errors.push("duplicate choices");
    if ((record.choices || []).some((choice) => choice.length > 90)) errors.push("choice over 90 chars");
  } else {
    const key = record.correctAnswer;
    if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(key)) errors.push(`numeric key "${key}" is not a plain decimal`);
    else if (key.replace("-", "").length > 5) errors.push(`numeric key "${key}" does not fit the 5-character grid`);
  }
  if (record.stimulus) {
    if (!record.stimulus.type || !record.stimulus.content) errors.push("stimulus needs type and content");
  }
  if (record.figure) {
    const figure = record.figure;
    if (!figure.svg || !figure.alt) errors.push("figure needs svg and alt");
    else errors.push(...svgErrors(figure.svg));
    if (figure.notToScale) {
      const lure = record.responseType === "multiple-choice"
        ? (record.distractorRationales || []).some((entry) => SCALE_WORDS.test(entry.reason))
        : SCALE_WORDS.test(record.trap);
      if (!lure) errors.push("not-to-scale figure without a distractor (or numeric trap) that reads the drawing");
    }
  }
  return errors;
}

function shapeOf(record) {
  const base = `${record.stimulus ? record.stimulus.content : ""} ${record.stem}`;
  return base.replace(/[−-]?\d+(\.\d+)?/g, "#").replace(/\s+/g, " ").trim();
}

function checkFamily(family, ids) {
  const failures = metaErrors(family, ids);
  const tally = { mc: 0, numeric: 0, figures: 0, notToScale: 0 };
  const exact = new Set();
  const shapes = new Set();
  const positions = [0, 0, 0, 0];
  let longestIsKey = 0;
  const instanceErrors = new Map();
  if (typeof family.build === "function") {
    for (let rep = 0; rep < REPS; rep += 1) {
      let record;
      try {
        record = S.instantiate(family, rep);
      } catch (error) {
        const message = `throws: ${error.message.split("\n")[0]}`;
        instanceErrors.set(message, (instanceErrors.get(message) || 0) + 1);
        continue;
      }
      recordErrors(family, record).forEach((message) =>
        instanceErrors.set(message, (instanceErrors.get(message) || 0) + 1),
      );
      exact.add(`${shapeOf(record)}|${record.stem}|${(record.choices || []).join("|")}|${record.figure ? record.figure.svg : ""}|${record.stimulus ? record.stimulus.content : ""}`);
      shapes.add(shapeOf(record));
      if (record.responseType === "numeric") tally.numeric += 1;
      else {
        tally.mc += 1;
        if (record.correctAnswer >= 0) positions[record.correctAnswer] += 1;
        const lengths = record.choices.map((choice) => choice.length);
        const longest = Math.max(...lengths);
        if (lengths.filter((length) => length === longest).length === 1 &&
          lengths[record.correctAnswer] === longest) longestIsKey += 1;
      }
      if (record.figure) {
        tally.figures += 1;
        if (record.figure.notToScale) tally.notToScale += 1;
      }
    }
  }
  instanceErrors.forEach((count, message) => failures.push(`${message} (${count}/${REPS})`));
  const distinct = exact.size;
  if (distinct < REPS * 0.75) failures.push(`only ${distinct}/${REPS} distinct repetitions`);
  if (shapes.size < 2) failures.push("only 1 surface form; vary the question asked or its presentation");
  if ((family.tricks || []).includes("not-to-scale-figure") && tally.notToScale < REPS * 0.5) {
    failures.push("declares not-to-scale-figure but under half its items carry one");
  }
  return { family, failures, tally, distinct, forms: shapes.size, positions, longestIsKey };
}

function report(results) {
  let failed = 0;
  const totals = { mc: 0, numeric: 0, positions: [0, 0, 0, 0], longestIsKey: 0, notToScaleFamilies: 0 };
  results.forEach((result) => {
    const { family, failures, tally, distinct, forms } = result;
    const rubricTotal = RUBRIC_FACTORS.reduce((sum, factor) => sum + ((family.rubric || {})[factor] || 0), 0);
    const status = failures.length ? "FAIL" : "PASS";
    if (failures.length) failed += 1;
    console.log(
      `${status}  ${family.id.padEnd(40)} ${family.file.padEnd(20)} rubric ${String(rubricTotal).padStart(2)}` +
        `  reps ${distinct}/${REPS}  forms ${String(forms).padStart(3)}  mc/num ${tally.mc}/${tally.numeric}` +
        `  fig ${tally.figures} (nts ${tally.notToScale})`,
    );
    failures.slice(0, 6).forEach((failure) => console.log(`        - ${failure}`));
    totals.mc += tally.mc;
    totals.numeric += tally.numeric;
    result.positions.forEach((count, index) => (totals.positions[index] += count));
    totals.longestIsKey += result.longestIsKey;
    if ((family.tricks || []).includes("not-to-scale-figure")) totals.notToScaleFamilies += 1;
  });
  const all = totals.mc + totals.numeric;
  const aggregate = [];
  if (all && results.length >= 10) {
    const numericShare = totals.numeric / all;
    if (numericShare < 0.2 || numericShare > 0.4) aggregate.push(`numeric share ${(numericShare * 100).toFixed(1)}% outside 20-40%`);
    totals.positions.forEach((count, index) => {
      const share = totals.mc ? count / totals.mc : 0;
      if (share < 0.18 || share > 0.32) aggregate.push(`answer position ${"ABCD"[index]} at ${(share * 100).toFixed(1)}%`);
    });
    if (totals.mc && totals.longestIsKey / totals.mc > 0.4) aggregate.push("longest choice is the key over 40% of the time");
    if (totals.notToScaleFamilies < 3) aggregate.push(`only ${totals.notToScaleFamilies} families use not-to-scale figures; need 3`);
  }
  console.log(
    `\n${results.length - failed}/${results.length} families pass; numeric ${all ? ((totals.numeric / all) * 100).toFixed(1) : 0}%` +
      `; key positions ${totals.positions.join("/")}`,
  );
  aggregate.forEach((message) => console.log(`AGGREGATE FAIL: ${message}`));
  return failed === 0 && aggregate.length === 0;
}

function printSample(families) {
  const id = option("--sample", null);
  const seed = option("--seed", "0");
  const svgDir = option("--svg-dir", null);
  const chosen = id ? families.filter((family) => family.id === id) : families;
  if (!chosen.length) {
    console.error(`no family "${id}"`);
    process.exit(1);
  }
  chosen.forEach((family) => {
    const record = S.instantiate(family, seed);
    console.log(`\n=== ${family.id}  [${family.domain} / ${family.skill} / ${family.subskill}]  seed ${seed}`);
    if (record.stimulus) console.log(`[${record.stimulus.type}]\n${record.stimulus.content}`);
    if (record.figure) {
      console.log(`[figure${record.figure.notToScale ? ", not drawn to scale" : ""}] ${record.figure.alt}`);
      if (svgDir) {
        fs.mkdirSync(svgDir, { recursive: true });
        const file = path.join(svgDir, `${family.id}-${seed}.svg`);
        fs.writeFileSync(file, record.figure.svg);
        console.log(`  svg -> ${file}`);
      }
    }
    console.log(record.stem);
    if (record.choices) {
      record.choices.forEach((choice, index) => {
        const rationale = (record.distractorRationales || []).find((entry) => entry.index === index);
        console.log(`  ${"ABCD"[index]}) ${choice}${index === record.correctAnswer ? "   <== key" : `   [${rationale.reason}]`}`);
      });
    } else console.log(`  (numeric) key: ${record.correctAnswer}`);
    console.log(`explanation: ${record.explanation}`);
    record.solutionSteps.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));
    console.log(`trap: ${record.trap}`);
    console.log(`verified: ${record.verified}`);
  });
}

const families = loadFamilies().filter((family) => {
  const only = option("--family", null);
  return !only || family.id === only;
});

if (flag("--sample")) {
  printSample(families);
} else {
  const ids = new Set();
  const ok = report(families.map((family) => checkFamily(family, ids)));
  process.exit(ok ? 0 : 1);
}
