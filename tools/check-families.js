#!/usr/bin/env node
"use strict";

// Gate for question families (templates). Generates many repetitions of every
// family and fails on anything a student would notice: a wrong key, a broken
// choice, a method named in the stem, an answer tell, too few distinct items,
// a "not drawn to scale" figure with no answer the drawing lures toward, a
// figure the renderer would damage, a passage outside the real test's length,
// or too few templates for a run to take at most one of each. The numbered
// checks are documented in docs/question-templates.md; their measurements live
// in tools/lib/tells.js.
//
// Every family is instantiated on integer seeds 0..reps-1 and on as many
// runtime-shaped seeds "<run>.<template>.<attempt>" (the shape runs.js uses),
// so a defect that only runtime seeds reach is caught before students see it.
//
//   node tools/check-families.js                          # every section
//   node tools/check-families.js --section sat-reading-writing
//   node tools/check-families.js --section sat-math --file geometry
//   node tools/check-families.js --family <id>
//   node tools/check-families.js --sample [<id>] [--seed <s>] [--svg-dir <dir>]
//   node tools/check-families.js --reps 500               # per seed shape (default 300)
//   node tools/check-families.js --tells                  # print every measurement
//   node tools/check-families.js --json <file>            # write them as JSON
//   node tools/check-families.js --matrix                 # skill x difficulty coverage

const fs = require("fs");
const path = require("path");
const S = require("../src/lib/families/shared");
const T = require("./lib/tells");
const { sanitizeSvgTree } = require("../src/app/render");
const FAMILIES_ROOT = path.join(__dirname, "..", "src", "lib", "families");

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const flag = (name) => args.includes(name);

const REPS = Number(option("--reps", 300));
if (!Number.isInteger(REPS) || REPS < 1) {
  console.error("--reps needs a positive whole number");
  process.exit(1);
}
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
    // Check 9: distinct items (stimulus, stem and the set of choices) as a
    // share of the first LIMITS.varietyWindow draws.
    minDistinctShare: 0.75,
    // Check 8: the blind hub strategy.
    hub: true,
    // A Math module is 22 questions and a section 44, so each tier must fill a
    // module and the section must fill itself without repeating a template.
    templateTargets: { total: 66, perDifficulty: { Easy: 22, Medium: 22, Hard: 22 }, perCell: 2 },
  },
  "sat-reading-writing": {
    responseTypes: ["multiple-choice"],
    passageWords: [25, 150],
    pairedWords: [25, 150],
    minScenes: 8,
    // Check 9: a template must hold at least this many distinct items.
    minDistinct: 10,
    // Check 7: these domains must declare the grammatical features their
    // choices vary on.
    featureDomains: ["Standard English Conventions"],
    // Check 10: the skill whose choices are transition words.
    transitionsSkill: "Transitions",
    // Check 8 reads text choices by the words they share; check 14 is the
    // most-similar pair; check 3 also judges short choices by characters.
    hub: true,
    similar: true,
    shortText: true,
    templateTargets: { total: 81, perDifficulty: { Easy: 27, Medium: 27, Hard: 27 }, perSkill: 6, perCell: 2 },
  },
};

// Thresholds of the numbered checks (docs/question-templates.md). Never
// loosen one to make content pass. Shares of a template's repetitions are
// judged only once at least `minSample` repetitions qualify, so a template
// that is mostly numeric-response is not failed on a handful of choices.
const LIMITS = {
  minSample: 100,
  position: [0.15, 0.35], // 2
  textWords: 3, // 3, 5: choices averaging at least this many words are text
  longestKey: 0.4, // 3
  shortestKey: 0.4, // 3
  extremeKey: [0.15, 0.85], // 4
  openerFrequency: 0.25, // 5
  openerKeyShare: 0.6, // 5
  recurringFrequency: 0.2, // 6
  recurringKeyShare: 0.75, // 6
  featureAlone: 0.4, // 7
  varietyWindow: 200, // 9: Math's distinct share is over the first 200 draws (100 of each seed shape)
  hubTemplate: 0.5, // 8
  hubTier: 0.32, // 8
  pairTemplate: 0.5, // 13
  pairTier: 0.32, // 13
  similarTemplate: 0.4, // 14
  similarTier: 0.3, // 14
  transitionAppearances: 20, // 10
  transitionKeyShare: [0.1, 0.6], // 10
};

const CHECK_NAMES = {
  1: "builds, verifies, no modelled mistake on the key",
  2: "key position",
  3: "longest or shortest choice is the key",
  4: "key is an extreme value",
  5: "opener marks the key",
  6: "recurring choice marks the key",
  7: "declared features: key is the odd one out",
  8: "blind hub strategy",
  9: "variety",
  10: "transition words",
  11: "figures",
  12: "template counts",
  13: "blind look-alike pair strategy",
  14: "blind most-similar pair strategy",
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

// A numeric key is what a student could enter in the answer grid: a plain
// decimal, or an exact fraction in lowest terms where the decimal would
// repeat, in at most 5 characters (6 with a minus sign).
function numericKeyError(key) {
  const text = String(key);
  const fraction = /^-?(\d+)\/(\d+)$/.exec(text);
  if (fraction) {
    const [top, bottom] = [Number(fraction[1]), Number(fraction[2])];
    if (bottom < 2) return `numeric key "${text}" has a denominator below 2`;
    if (S.gcd(top, bottom) !== 1) return `numeric key "${text}" is not in lowest terms`;
  } else if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(text)) {
    return `numeric key "${text}" is neither a plain decimal nor a fraction`;
  }
  if (text.replace("-", "").length > 5) return `numeric key "${text}" does not fit the 5-character grid`;
  return null;
}

function recordErrors(family, record, config) {
  const errors = [];
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
    const problem = numericKeyError(record.correctAnswer);
    if (problem) errors.push(problem);
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

// Runtime-shaped seed number `rep` for a template: "<run>.<template>.<attempt>",
// with a base-36 run seed like app.js draws and attempts 0-2 like runs.js tries.
function runtimeSeed(templateId, rep) {
  const run = (S.hashString(`gate-run|${rep}`) % 36 ** 6).toString(36);
  return `${run}.${templateId}.${rep % 3}`;
}

function seedsFor(family) {
  const seeds = [];
  for (let rep = 0; rep < REPS; rep += 1) seeds.push(rep, runtimeSeed(family.id, rep));
  return seeds;
}

// What check 10 needs from a Transitions record, kept after the family is done.
const slim = (record) => ({ templateId: record.templateId, choices: record.choices, correctAnswer: record.correctAnswer });

function checkFamily(family, ids, config) {
  const failures = metaErrors(family, ids).map((message) => ({ check: null, message }));
  const tally = { mc: 0, numeric: 0, figures: 0, notToScale: 0 };
  const shapes = new Set();
  const scenes = new Set();
  const entries = [];
  const transitions = [];
  const instanceErrors = new Map();
  const figureErrors = new Map();
  const count = (map, message) => map.set(message, (map.get(message) || 0) + 1);
  if (typeof family.build === "function") {
    seedsFor(family).forEach((seed) => {
      let record;
      try {
        record = S.instantiate(family, seed);
      } catch (error) {
        entries.push({ seed, error });
        return;
      }
      entries.push({ seed, record });
      recordErrors(family, record, config).forEach((message) => count(instanceErrors, message));
      shapes.add(shapeOf(record));
      if (record.scene) scenes.add(record.scene);
      if (record.responseType === "numeric") tally.numeric += 1;
      else {
        tally.mc += 1;
        if (config.transitionsSkill === family.skill && Array.isArray(record.choices)) transitions.push(slim(record));
      }
      if (record.figure) {
        tally.figures += 1;
        if (record.figure.notToScale) tally.notToScale += 1;
        if (record.figure.svg) T.figureProblems(record.figure.svg, sanitizeSvgTree).forEach((message) => count(figureErrors, message));
      }
    });
  }
  const measure = T.measureTemplate(entries, { window: LIMITS.varietyWindow });
  const records = measure.records;
  instanceErrors.forEach((times, message) => failures.push({ check: null, message: `${message} (${times}/${records})` }));
  failures.push(...T.templateFailures(measure, LIMITS, {
    hub: Boolean(config.hub),
    similar: Boolean(config.similar),
    shortText: Boolean(config.shortText),
    requireFeatures: (config.featureDomains || []).includes(family.domain),
    minDistinct: config.minDistinct,
    minDistinctShare: config.minDistinctShare,
  }));
  figureErrors.forEach((times, message) =>
    failures.push({ check: 11, message: `${message} (${times}/${tally.figures} figures)`, value: times / tally.figures }));
  if (config.minSurfaceForms && shapes.size < config.minSurfaceForms) {
    failures.push({ check: null, message: "only 1 surface form; vary the question asked or its presentation" });
  }
  if (config.minScenes && scenes.size < config.minScenes) {
    failures.push({ check: null, message: `only ${scenes.size} scenes; a template needs at least ${config.minScenes}` });
  }
  if ((family.tricks || []).includes("not-to-scale-figure") && tally.notToScale < records * 0.5) {
    failures.push({ check: null, message: "declares not-to-scale-figure but under half its items carry one" });
  }
  failures.sort((left, right) => (left.check || 0) - (right.check || 0));
  return { family, failures, tally, measure, forms: shapes.size, scenes: scenes.size, transitions };
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

const pct = (share) => (share === null || share === undefined ? "  -" : `${Math.round(share * 100)}`.padStart(3));
const formatFailure = (failure) => `${failure.check ? `[${failure.check}] ` : ""}${failure.message}`;

// Check 10: every transition offered often enough is the key sometimes, but
// not most of the time, across the skill's templates.
function transitionFailures(records) {
  const [low, high] = LIMITS.transitionKeyShare;
  return Object.entries(T.choiceKeyShares(records))
    .filter(([, tally]) => tally.appearances >= LIMITS.transitionAppearances)
    .map(([text, tally]) => ({ text, ...tally, share: tally.key / tally.appearances }))
    .filter((entry) => entry.share < low || entry.share > high)
    .sort((left, right) => left.share - right.share)
    .map((entry) => ({
      check: 10,
      message: `"${entry.text}" is the key in ${Math.round(entry.share * 100)}% of its ${entry.appearances} appearances (want ${low * 100}-${high * 100}%)`,
      value: entry.share,
      templates: [...entry.templates].sort(),
    }));
}

function report(sectionKey, config, results) {
  let failed = 0;
  const totals = { mc: 0, numeric: 0, positions: [0, 0, 0, 0], longestIsKey: 0, notToScaleFamilies: 0 };
  console.log(`\n# ${sectionKey}`);
  results.forEach((result) => {
    const { family, failures, tally, measure, forms, scenes } = result;
    const rubricTotal = RUBRIC_FACTORS.reduce((sum, factor) => sum + ((family.rubric || {})[factor] || 0), 0);
    const status = failures.length ? "FAIL" : "PASS";
    if (failures.length) failed += 1;
    console.log(
      `${status}  ${family.id.padEnd(40)} ${family.file.padEnd(20)} ${(family.difficulty || "Hard").padEnd(6)} rubric ${String(rubricTotal).padStart(2)}` +
        `  items ${measure.distinct}/${measure.reps}  forms ${String(forms).padStart(3)}  scenes ${String(scenes).padStart(3)}  mc/num ${tally.mc}/${tally.numeric}` +
        `  fig ${tally.figures} (nts ${tally.notToScale})`,
    );
    failures.slice(0, 8).forEach((failure) => console.log(`        - ${formatFailure(failure)}`));
    if (failures.length > 8) console.log(`        - and ${failures.length - 8} more`);
    totals.mc += tally.mc;
    totals.numeric += tally.numeric;
    measure.positions.forEach((count, index) => (totals.positions[index] += count));
    totals.longestIsKey += measure.longestKey;
    if ((family.tricks || []).includes("not-to-scale-figure")) totals.notToScaleFamilies += 1;
  });
  const all = totals.mc + totals.numeric;
  const aggregate = [];
  const complete = !option("--file", null) && !option("--family", null);
  if (all && results.length >= 10) {
    if (config.numericShare) {
      const [low, high] = config.numericShare;
      const share = totals.numeric / all;
      if (share < low || share > high) aggregate.push({ check: null, message: `numeric share ${(share * 100).toFixed(1)}% outside ${low * 100}-${high * 100}%` });
    }
    totals.positions.forEach((count, index) => {
      const share = totals.mc ? count / totals.mc : 0;
      if (share < 0.18 || share > 0.32) aggregate.push({ check: 2, message: `answer position ${"ABCD"[index]} at ${(share * 100).toFixed(1)}% across the section` });
    });
    if (totals.mc && totals.longestIsKey / totals.mc > 0.4) aggregate.push({ check: 3, message: "longest choice is the key over 40% of the time across the section" });
    if (config.minNotToScaleFamilies && totals.notToScaleFamilies < config.minNotToScaleFamilies) {
      aggregate.push({ check: null, message: `only ${totals.notToScaleFamilies} families use not-to-scale figures; need ${config.minNotToScaleFamilies}` });
    }
  }
  // Check 8, per tier: a whole module of one tier must not yield to the blind strategy.
  const tiers = config.hub && complete
    ? T.hubByTier(results.map((result) => ({ difficulty: result.family.difficulty || "Hard", measure: result.measure })))
    : {};
  Object.entries(tiers).forEach(([difficulty, tier]) => {
    if (tier.share > LIMITS.hubTier) {
      aggregate.push({ check: 8, message: `blind hub strategy scores ${Math.round(tier.share * 100)}% on ${difficulty} multiple choice (want at most ${LIMITS.hubTier * 100}%)`, value: tier.share, tier: difficulty });
    }
  });
  // Check 13, per tier: the same for the look-alike pair strategy, in every section.
  const pairTiers = complete
    ? T.hubByTier(results.map((result) => ({ difficulty: result.family.difficulty || "Hard", measure: result.measure })), "pair")
    : {};
  Object.entries(pairTiers).forEach(([difficulty, tier]) => {
    if (tier.share > LIMITS.pairTier) {
      aggregate.push({ check: 13, message: `blind look-alike pair strategy scores ${Math.round(tier.share * 100)}% on ${difficulty} multiple choice (want at most ${LIMITS.pairTier * 100}%)`, value: tier.share, tier: difficulty });
    }
  });
  // Check 14, per tier: the most-similar pair over text choices.
  const similarTiers = config.similar && complete
    ? T.hubByTier(results.map((result) => ({ difficulty: result.family.difficulty || "Hard", measure: result.measure })), "similar")
    : {};
  Object.entries(similarTiers).forEach(([difficulty, tier]) => {
    if (tier.share > LIMITS.similarTier) {
      aggregate.push({ check: 14, message: `blind most-similar pair strategy scores ${Math.round(tier.share * 100)}% on ${difficulty} text choices (want at most ${LIMITS.similarTier * 100}%)`, value: tier.share, tier: difficulty });
    }
  });
  const transitions = config.transitionsSkill && !option("--family", null)
    ? transitionFailures(results.flatMap((result) => result.transitions))
    : [];
  aggregate.push(...transitions);
  if (complete) {
    aggregate.push(...templateTargetFailures(results.map((result) => result.family), config.templateTargets)
      .map((message) => ({ check: 12, message })));
  }
  console.log(
    `${results.length - failed}/${results.length} families pass; numeric ${all ? ((totals.numeric / all) * 100).toFixed(1) : 0}%` +
      `; key positions ${totals.positions.join("/")}` +
      (Object.keys(tiers).length ? `; hub by tier ${Object.entries(tiers).map(([tier, value]) => `${tier} ${Math.round(value.share * 100)}%`).join(", ")}` : "") +
      (Object.keys(pairTiers).length ? `; pairs by tier ${Object.entries(pairTiers).map(([tier, value]) => `${tier} ${Math.round(value.share * 100)}%`).join(", ")}` : "") +
      (Object.keys(similarTiers).length ? `; most-similar by tier ${Object.entries(similarTiers).map(([tier, value]) => `${tier} ${Math.round(value.share * 100)}%`).join(", ")}` : ""),
  );
  aggregate.forEach((failure) => console.log(`AGGREGATE FAIL: ${formatFailure(failure)}${failure.templates ? ` [${failure.templates.join(", ")}]` : ""}`));
  return { ok: failed === 0 && aggregate.length === 0, aggregate, tiers, pairTiers, similarTiers };
}

// One row per template of every measurement, for --tells.
function printTells(sectionKey, config, results) {
  console.log(`\n# ${sectionKey} measurements (% of multiple-choice reps unless noted)`);
  console.log(
    `${"template".padEnd(40)} tier   mc/num    A   B   C   D  wrds long shrt  ext  hub pair  sim item  opener(key%)            recurring(key%)          feature(alone%)`,
  );
  results.forEach(({ family, measure }) => {
    const s = T.shares(measure);
    const top = (entries, share) => {
      const [name, tally] = entries.sort((left, right) => share(right[1]) - share(left[1]))[0] || [];
      return name ? `${name.slice(0, 16)}(${Math.round(share(tally) * 100)})` : "-";
    };
    const openers = Object.entries(measure.openers).filter(([, tally]) => tally.occurrences >= LIMITS.openerFrequency * measure.mc);
    const recurring = Object.entries(measure.recurring).filter(([, tally]) => tally.reps >= LIMITS.recurringFrequency * measure.mc);
    console.log(
      `${family.id.padEnd(40)} ${(family.difficulty || "Hard").padEnd(6)} ${`${measure.mc}/${measure.numeric}`.padStart(7)}  ` +
        `${s.positions.map(pct).join(" ")}  ${s.averageChoiceWords === null ? "   -" : s.averageChoiceWords.toFixed(1).padStart(4)} ` +
        `${pct(s.longestKey)}  ${pct(s.shortestKey)}  ${pct(s.extremeKey)}  ${pct(config.hub ? s.hub : null)}  ${pct(s.pair)}  ${pct(config.similar ? s.similar : null)} ${String(measure.distinct).padStart(4)}  ` +
        `${top(openers, (tally) => tally.key / tally.occurrences).padEnd(22)}  ${top(recurring, (tally) => tally.key / tally.reps).padEnd(22)}  ` +
        `${top(Object.entries(measure.features), (tally) => tally.keyAlone / tally.reps)}`,
    );
  });
}

// Everything measured, for --json: one entry per template plus the section's
// aggregate results.
function jsonSection(sectionKey, results, outcome) {
  const round = (value) => Math.round(value * 1000) / 1000;
  // Only the openers and choices frequent enough for checks 5 and 6.
  const frequent = (tallies, count, minimum) => Object.fromEntries(Object.entries(tallies)
    .filter(([, tally]) => count(tally) >= minimum)
    .map(([name, tally]) => [name, { ...tally, keyShare: round(tally.key / count(tally)) }]));
  return {
    sectionKey,
    tiers: outcome.tiers,
    pairTiers: outcome.pairTiers,
    similarTiers: outcome.similarTiers,
    aggregate: outcome.aggregate,
    templates: results.map(({ family, measure, failures, tally, forms, scenes }) => ({
      id: family.id,
      domain: family.domain,
      skill: family.skill,
      difficulty: family.difficulty || "Hard",
      file: family.file,
      reps: measure.reps,
      records: measure.records,
      throws: measure.throws,
      unverified: measure.unverified,
      keyEqualDistractors: measure.keyEqual,
      mc: measure.mc,
      numeric: measure.numeric,
      distinct: measure.distinct,
      windowDistinct: measure.windowDistinct,
      windowRecords: measure.windowRecords,
      forms,
      scenes,
      figures: tally.figures,
      notToScale: tally.notToScale,
      numericChoiceReps: measure.numericChoiceReps,
      ...T.shares(measure),
      openers: frequent(measure.openers, (tally) => tally.occurrences, LIMITS.openerFrequency * measure.mc),
      recurring: frequent(measure.recurring, (tally) => tally.reps, LIMITS.recurringFrequency * measure.mc),
      features: Object.fromEntries(Object.entries(measure.features).map(([name, tally]) =>
        [name, { ...tally, aloneShare: round(tally.keyAlone / tally.reps) }])),
      failures,
    })),
  };
}

// The failing templates of each numbered check, for follow-up work.
function printSummary(sectionsOut) {
  const byCheck = new Map();
  sectionsOut.forEach(({ sectionKey, results, outcome }) => {
    results.forEach(({ family, failures }) => failures.forEach((failure) => {
      const key = failure.check || "other";
      if (!byCheck.has(key)) byCheck.set(key, new Map());
      const ids = byCheck.get(key);
      const line = ids.get(family.id);
      ids.set(family.id, line ? `${line}; ${failure.message}` : `${sectionKey}/${family.id}: ${failure.message}`);
    }));
    outcome.aggregate.forEach((failure) => {
      const key = failure.check || "other";
      if (!byCheck.has(key)) byCheck.set(key, new Map());
      byCheck.get(key).set(`${sectionKey}|${failure.message}`, `${sectionKey} (section): ${failure.message}`);
    });
  });
  if (!byCheck.size) return;
  console.log("\n# Failures by check");
  [...byCheck.keys()].sort((left, right) => (left === "other") - (right === "other") || left - right).forEach((check) => {
    const lines = [...byCheck.get(check).values()];
    console.log(`${check === "other" ? "other checks" : `check ${check} (${CHECK_NAMES[check]})`}: ${lines.length}`);
    lines.forEach((line) => console.log(`  ${line}`));
  });
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
    if (record.choiceFeatures) {
      record.choiceFeatures.forEach((features, index) => console.log(`  features ${"ABCD"[index]}: ${JSON.stringify(features)}`));
    }
    if (record.keyEqualDistractors) console.log(`key-equal distractors dropped: ${record.keyEqualDistractors}`);
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
const jsonFile = option("--json", null);
const sections = Object.entries(SECTIONS).filter(([key]) => !onlySection || key === onlySection);
const checked = [];
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
  const results = families.map((family) => checkFamily(family, ids, config));
  const outcome = report(sectionKey, config, results);
  if (!outcome.ok) ok = false;
  checked.push({ sectionKey, results, outcome });
}
if (!flag("--sample") && !flag("--matrix")) {
  if (onlyFamily && !checked.some((section) => section.results.length)) {
    console.error(`no family "${onlyFamily}"`);
    process.exit(1);
  }
  if (flag("--tells")) checked.forEach(({ sectionKey, results }) => printTells(sectionKey, SECTIONS[sectionKey], results));
  printSummary(checked);
  if (jsonFile) {
    const output = {
      reps: REPS,
      seeds: "integers 0..reps-1 and as many runtime-shaped seeds <run>.<template>.<attempt>",
      limits: LIMITS,
      sections: checked.map(({ sectionKey, results, outcome }) => jsonSection(sectionKey, results, outcome)),
    };
    fs.writeFileSync(jsonFile, `${JSON.stringify(output, null, 2)}\n`);
    console.log(`\nWrote ${jsonFile}`);
  }
  console.log(`\nreps per template: ${REPS} integer + ${REPS} runtime-shaped seeds`);
  process.exit(ok ? 0 : 1);
}
