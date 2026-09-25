#!/usr/bin/env node
"use strict";

// Gate for question families (templates). Generates many repetitions of every
// family and fails on anything a student would notice: a wrong key, a broken
// choice, a method named in the stem, too few distinct repetitions, a
// "not drawn to scale" figure with no answer the drawing lures toward, a
// passage outside the real test's length, or too few templates for a run to
// take at most one of each.
//
//   node tools/check-families.js                          # every section
//   node tools/check-families.js --section sat-reading-writing
//   node tools/check-families.js --section sat-math --file geometry
//   node tools/check-families.js --family <id>
//   node tools/check-families.js --sample [<id>] [--seed <s>] [--svg-dir <dir>]
//   node tools/check-families.js --reps 500
//   node tools/check-families.js --matrix                 # skill x difficulty coverage

const fs = require("fs");
const path = require("path");
const S = require("../src/lib/families/shared");
const FAMILIES_ROOT = path.join(__dirname, "..", "src", "lib", "families");

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const flag = (name) => args.includes(name);

const REPS = Number(option("--reps", 200));
const catalog = require("../content/catalog.json");

// Each section's families, and what it takes for a run to draw at most one
// question per template: a full-length section, and a module of one
// difficulty, must both fit without repeating a template.
const SECTIONS = {
  "sat-math": {
    responseTypes: ["multiple-choice", "numeric"],
    numericShare: [0.2, 0.4],
    minNotToScaleFamilies: 3,
    minSurfaceForms: 2,
    minDistinctShare: 0.75,
    // A Math module is 22 questions and a section 44, so each tier must fill a
    // module and the section must fill itself without repeating a template.
    templateTargets: { total: 66, perDifficulty: { Easy: 22, Medium: 22, Hard: 22 }, perCell: 2 },
  },
  "sat-reading-writing": {
    responseTypes: ["multiple-choice"],
    passageWords: [25, 150],
    pairedWords: [25, 150],
    minScenes: 8,
    maxLongestIsKey: 0.4,
    templateTargets: { total: 81, perDifficulty: { Easy: 27, Medium: 27, Hard: 27 }, perSkill: 6, perCell: 2 },
  },
};

const RUBRIC_FACTORS = ["steps", "concept", "interpretation", "distractors", "abstraction", "synthesis", "trap"];
const DIFFICULTY_BANDS = { Easy: [0, 3], Medium: [4, 8], Hard: [9, 14] };
const TRICKS = new Set([
  // Math
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
  // Reading and Writing
  "too-broad", // claims more than the text supports
  "too-narrow", // a true detail offered as the main point
  "true-but-irrelevant", // accurate, but does not answer the question asked
  "opposite-stance", // reverses the author's position
  "one-text-only", // supported by only one of two texts
  "misattributed-view", // the view of someone the author cites, not the author's
  "extreme-language", // always, never, proves, completely
  "word-association", // reuses the passage's words in a different sense
  "common-meaning", // the everyday sense of a word that the context rules out
  "grammatical-but-illogical", // correct grammar, wrong logical relation
  "comma-splice", // two independent clauses joined by a comma alone
  "agreement-attractor", // a verb agreeing with the nearest noun, not its subject
  "dangling-modifier", // the modifier attaches to the wrong noun
  "off-goal", // accurate notes that do not accomplish the stated goal
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

const slug = (text) => text.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Template files follow the catalog: families/<test>/<section>/<domain>/<skill>.js,
// e.g. families/sat/math/algebra/linear-functions.js. Every template in a
// file must belong to that file's skill.
function sectionDirectory(sectionKey) {
  const [test, ...rest] = sectionKey.split("-");
  return path.join(FAMILIES_ROOT, test, rest.join("-"));
}

function loadCatalogLayout(sectionKey) {
  const section = catalog.sections.find((entry) => entry.key === sectionKey);
  const only = option("--file", null);
  const families = [];
  section.domains.forEach((domain) => {
    Object.keys(domain.skills).forEach((skill) => {
      const file = `${slug(domain.name)}/${slug(skill)}`;
      if (only && only !== file && only !== slug(skill) && only !== slug(domain.name)) return;
      const modulePath = path.join(sectionDirectory(sectionKey), `${file}.js`);
      if (!fs.existsSync(modulePath)) return;
      require(modulePath).forEach((family) => {
        families.push({ ...family, file, sectionKey: family.sectionKey || sectionKey, expectedSkill: skill });
      });
    });
  });
  return families;
}

function loadFamilies(sectionKey) {
  return loadCatalogLayout(sectionKey);
}

function catalogError(family) {
  const section = catalog.sections.find((entry) => entry.key === family.sectionKey);
  if (!section) return `unknown section "${family.sectionKey}"`;
  const domain = section.domains.find((entry) => entry.name === family.domain);
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
  const difficulty = family.difficulty || "Hard";
  if (!DIFFICULTY_BANDS[difficulty]) errors.push(`unknown difficulty "${difficulty}"`);
  const rubric = family.rubric || {};
  const scores = RUBRIC_FACTORS.map((factor) => rubric[factor]);
  if (scores.some((score) => ![0, 1, 2].includes(score))) {
    errors.push(`rubric needs ${RUBRIC_FACTORS.join("/")} each 0-2`);
  } else if (DIFFICULTY_BANDS[difficulty]) {
    const total = scores.reduce((sum, score) => sum + score, 0);
    const [low, high] = DIFFICULTY_BANDS[difficulty];
    if (total < low || total > high) errors.push(`rubric total ${total} is outside ${difficulty} (${low}-${high})`);
    if (difficulty === "Hard" && scores.filter((score) => score === 2).length < 2) {
      errors.push("Hard needs at least two rubric factors at 2");
    }
  }
  const tricks = family.tricks || [];
  if (tricks.length < (difficulty === "Easy" ? 1 : 2)) errors.push(`declare at least ${difficulty === "Easy" ? 1 : 2} tricks`);
  tricks.filter((trick) => !TRICKS.has(trick)).forEach((trick) => errors.push(`unknown trick "${trick}"`));
  if (typeof family.build !== "function") errors.push("missing build");
  if (family.expectedSkill && family.skill !== family.expectedSkill) {
    errors.push(`is in the ${family.expectedSkill} file but declares skill "${family.skill}"`);
  }
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

const wordCount = (text) => (String(text).match(/[A-Za-z0-9][A-Za-z0-9'’.-]*/g) || []).length;

// "Text 1\n...\n\nText 2\n..." splits into its texts; anything else is one text.
function passageTexts(content) {
  const parts = String(content).split(/^Text \d+\s*$/m).map((part) => part.trim()).filter(Boolean);
  return /^Text 1\s*$/m.test(content) ? parts : [String(content)];
}

function recordErrors(family, record, config) {
  const errors = [];
  if (!record.verified) errors.push("verify() returned false");
  if (!config.responseTypes.includes(record.responseType)) errors.push(`responseType ${record.responseType} not allowed`);
  const text = strings(record);
  if (text.some((value) => typeof value !== "string" || !value.trim())) errors.push("empty text field");
  if (text.some((value) => S.BAD_TEXT.test(value))) errors.push("undefined/NaN/Infinity in text");
  if (!record.stem || record.stem.length > 700) errors.push("stem missing or over 700 chars");
  GIVEAWAYS.forEach((pattern) => {
    if (pattern.test(record.stem)) errors.push(`stem names the method (${pattern})`);
  });
  if (record.stem.toLowerCase().includes(family.title.toLowerCase())) errors.push("stem contains the family title");
  if (!Array.isArray(record.solutionSteps) || record.solutionSteps.length < 2) errors.push("fewer than 2 solution steps");
  if (!Array.isArray(record.principles) || !record.principles.length) errors.push("no principles");
  if (record.responseType === "multiple-choice") {
    if (!Array.isArray(record.choices) || record.choices.length !== 4) errors.push("needs 4 choices");
    else if (new Set(record.choices).size !== 4) errors.push("duplicate choices");
    if ((record.choices || []).some((choice) => choice.length > 160)) errors.push("choice over 160 chars");
    // The key must not be the odd one out in form: if the other three choices
    // share an opening word, the key shares it too.
    const openings = (record.choices || []).map((choice) => (choice.match(/^\S+/) || [""])[0].toLowerCase());
    const others = openings.filter((unused, index) => index !== record.correctAnswer);
    if (others.length === 3 && new Set(others).size === 1 && openings[record.correctAnswer] !== others[0]) {
      errors.push("the key is the only choice that does not share the others' opening word");
    }
  } else {
    const key = record.correctAnswer;
    if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(key)) errors.push(`numeric key "${key}" is not a plain decimal`);
    else if (key.replace("-", "").length > 5) errors.push(`numeric key "${key}" does not fit the 5-character grid`);
  }
  if (record.stimulus) {
    if (!record.stimulus.type || !record.stimulus.content) errors.push("stimulus needs type and content");
  }
  if (config.passageWords) {
    if (!record.stimulus) errors.push("Reading and Writing items need a stimulus");
    else {
      const texts = passageTexts(record.stimulus.content);
      const [low, high] = texts.length > 1 ? config.pairedWords : config.passageWords;
      texts.forEach((passage, index) => {
        const words = wordCount(passage);
        if (words < low || words > high) errors.push(`text ${index + 1} has ${words} words (want ${low}-${high})`);
      });
    }
  }
  if (config.minScenes && !record.scene) errors.push("no scene named");
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

function checkFamily(family, ids, config) {
  const failures = metaErrors(family, ids);
  const tally = { mc: 0, numeric: 0, figures: 0, notToScale: 0 };
  const exact = new Set();
  const shapes = new Set();
  const scenes = new Set();
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
      recordErrors(family, record, config).forEach((message) =>
        instanceErrors.set(message, (instanceErrors.get(message) || 0) + 1),
      );
      exact.add(`${record.stem}|${(record.choices || []).join("|")}|${record.figure ? record.figure.svg : ""}|${record.stimulus ? record.stimulus.content : ""}`);
      shapes.add(shapeOf(record));
      if (record.scene) scenes.add(record.scene);
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
  if (config.minDistinctShare && exact.size < REPS * config.minDistinctShare) {
    failures.push(`only ${exact.size}/${REPS} distinct repetitions`);
  }
  if (config.minSurfaceForms && shapes.size < config.minSurfaceForms) {
    failures.push("only 1 surface form; vary the question asked or its presentation");
  }
  if (config.minScenes && scenes.size < config.minScenes) {
    failures.push(`only ${scenes.size} scenes; a template needs at least ${config.minScenes}`);
  }
  if (config.maxLongestIsKey && tally.mc && longestIsKey / tally.mc > config.maxLongestIsKey) {
    failures.push(`longest choice is the key ${Math.round((longestIsKey / tally.mc) * 100)}% of the time`);
  }
  if ((family.tricks || []).includes("not-to-scale-figure") && tally.notToScale < REPS * 0.5) {
    failures.push("declares not-to-scale-figure but under half its items carry one");
  }
  return { family, failures, tally, distinct: exact.size, forms: shapes.size, scenes: scenes.size, positions, longestIsKey };
}

function templateTargetFailures(families, targets) {
  const failures = [];
  if (!targets) return failures;
  if (targets.total && families.length < targets.total) {
    failures.push(`${families.length} templates; a full section needs ${targets.total}`);
  }
  Object.entries(targets.perDifficulty || {}).forEach(([difficulty, minimum]) => {
    const count = families.filter((family) => (family.difficulty || "Hard") === difficulty).length;
    if (count < minimum) failures.push(`${count} ${difficulty} templates; a ${difficulty} module needs ${minimum}`);
  });
  // Every skill at every difficulty, so a drill on one skill at one tier
  // never runs dry: the skill x difficulty coverage table.
  if (targets.perCell) {
    const section = catalog.sections.find((entry) => entry.key === (families[0] || {}).sectionKey);
    const skills = section ? section.domains.flatMap((domain) => Object.keys(domain.skills)) : [];
    skills.forEach((skill) => {
      Object.keys(DIFFICULTY_BANDS).forEach((difficulty) => {
        const count = families.filter((family) =>
          family.skill === skill && (family.difficulty || "Hard") === difficulty).length;
        if (count < targets.perCell) {
          failures.push(`${skill} / ${difficulty}: ${count} templates; each skill and tier needs ${targets.perCell}`);
        }
      });
    });
  }
  if (targets.perSkill) {
    const bySkill = {};
    families.forEach((family) => {
      bySkill[family.skill] = (bySkill[family.skill] || 0) + 1;
    });
    Object.entries(bySkill)
      .filter(([, count]) => count < targets.perSkill)
      .forEach(([skill, count]) => failures.push(`${skill}: ${count} templates; a skill drill needs ${targets.perSkill}`));
  }
  return failures;
}

function report(sectionKey, config, results) {
  let failed = 0;
  const totals = { mc: 0, numeric: 0, positions: [0, 0, 0, 0], longestIsKey: 0, notToScaleFamilies: 0 };
  console.log(`\n# ${sectionKey}`);
  results.forEach((result) => {
    const { family, failures, tally, distinct, forms, scenes } = result;
    const rubricTotal = RUBRIC_FACTORS.reduce((sum, factor) => sum + ((family.rubric || {})[factor] || 0), 0);
    const status = failures.length ? "FAIL" : "PASS";
    if (failures.length) failed += 1;
    console.log(
      `${status}  ${family.id.padEnd(40)} ${family.file.padEnd(20)} ${(family.difficulty || "Hard").padEnd(6)} rubric ${String(rubricTotal).padStart(2)}` +
        `  reps ${distinct}/${REPS}  forms ${String(forms).padStart(3)}  scenes ${String(scenes).padStart(3)}  mc/num ${tally.mc}/${tally.numeric}` +
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
  const complete = !option("--file", null) && !option("--family", null);
  if (all && results.length >= 10) {
    if (config.numericShare) {
      const [low, high] = config.numericShare;
      const share = totals.numeric / all;
      if (share < low || share > high) aggregate.push(`numeric share ${(share * 100).toFixed(1)}% outside ${low * 100}-${high * 100}%`);
    }
    totals.positions.forEach((count, index) => {
      const share = totals.mc ? count / totals.mc : 0;
      if (share < 0.18 || share > 0.32) aggregate.push(`answer position ${"ABCD"[index]} at ${(share * 100).toFixed(1)}%`);
    });
    if (totals.mc && totals.longestIsKey / totals.mc > 0.4) aggregate.push("longest choice is the key over 40% of the time");
    if (config.minNotToScaleFamilies && totals.notToScaleFamilies < config.minNotToScaleFamilies) {
      aggregate.push(`only ${totals.notToScaleFamilies} families use not-to-scale figures; need ${config.minNotToScaleFamilies}`);
    }
  }
  if (complete) aggregate.push(...templateTargetFailures(results.map((result) => result.family), config.templateTargets));
  console.log(
    `${results.length - failed}/${results.length} families pass; numeric ${all ? ((totals.numeric / all) * 100).toFixed(1) : 0}%` +
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
    console.log(`\n=== ${family.id}  [${family.domain} / ${family.skill} / ${family.subskill}, ${record.difficulty}]  seed ${seed}  scene ${record.scene || "-"}`);
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

function printMatrix(sectionKey, families) {
  const section = catalog.sections.find((entry) => entry.key === sectionKey);
  console.log(`\n# ${sectionKey}: ${families.length} templates\n${"skill".padEnd(42)}Easy  Med Hard`);
  section.domains.forEach((domain) => Object.keys(domain.skills).forEach((skill) => {
    const row = Object.keys(DIFFICULTY_BANDS).map((difficulty) => families.filter((family) =>
      family.skill === skill && (family.difficulty || "Hard") === difficulty).length);
    console.log(`${skill.slice(0, 40).padEnd(42)}${row.map((count) => String(count).padStart(4)).join(" ")}`);
  }));
}

const onlySection = option("--section", null);
const onlyFamily = option("--family", null);
const sections = Object.entries(SECTIONS).filter(([key]) => !onlySection || key === onlySection);
let ok = true;
for (const [sectionKey, config] of sections) {
  const families = loadFamilies(sectionKey).filter((family) => !onlyFamily || family.id === onlyFamily);
  if (flag("--matrix")) {
    printMatrix(sectionKey, families);
    continue;
  }
  if (flag("--sample")) {
    const sampleId = option("--sample", null);
    const chosen = families.filter((family) => !sampleId || family.id === sampleId);
    if (chosen.length) printSample(chosen);
    continue;
  }
  if (!families.length && onlyFamily) continue;
  const ids = new Set();
  if (!report(sectionKey, config, families.map((family) => checkFamily(family, ids, config)))) ok = false;
}
if (!flag("--sample") && !flag("--matrix")) process.exit(ok ? 0 : 1);
