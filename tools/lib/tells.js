"use strict";

// Answer-tell and construct-validity measurements for the families gate
// (tools/check-families.js). Pure functions over instantiated question
// records, so each measure is unit-tested on hand-made items
// (test/tells.test.js). A "tell" is anything that finds the key without
// solving the problem: its position, its length, its opening words, a phrase
// that is always the key, the one grammatical form the other choices do not
// share, a pair of look-alike choices the key belongs to, the two most alike
// choices, or the choice every distractor is built around.
//
// measureTemplate(records) summarizes one template's repetitions;
// templateFailures(measure, limits) applies the numbered checks of
// docs/question-templates.md; the section-level helpers cover difficulty
// tiers, the Transitions skill, and figures.

const { numericValue } = require("./expr");
const { parseXml } = require("./svg-tree");

const LETTERS = "ABCD";

/* ----------------------------------------------------------- choice forms */

const words = (text) => String(text).trim().split(/\s+/).filter(Boolean);

// First two words, lower-cased, without punctuation: "By suggesting that…"
// and "by suggesting, …" share the opener "by suggesting".
function opener(choice) {
  const tokens = (String(choice).toLowerCase().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []);
  return tokens.slice(0, 2).join(" ");
}

// A choice as a student would recognize it again: case, spacing, curly quotes
// and trailing punctuation ignored, so "However," and "however" are one string.
function normalizeChoice(choice) {
  return String(choice)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,;:!?]+$/, "")
    .trim();
}

// One item as a student meets it, ignoring the order of its choices.
function itemIdentity(record) {
  return JSON.stringify([
    record.stimulus ? record.stimulus.content : "",
    record.stem,
    (record.choices || []).slice().sort(),
  ]);
}

/* ------------------------------------------------ blind "hub" strategy */

// The cold review's blind Math strategy (lane-math/meta.js), which never reads
// the stem: distractors are usually built by varying the key, so the key tends
// to share the most numbers and symbols with the other choices. Score each
// choice by the tokens (numbers, letters, √ π ² ³) it shares with the others.
// When all four choices are numbers, keep the two middle values and, of those,
// the higher score; otherwise keep the highest score. Returns the kept
// choices; a student guessing among them earns 1/kept.length when the key is
// kept.
function hubCandidates(choices) {
  const tokens = choices.map((choice) =>
    new Set(String(choice).replace(/−/g, "-").match(/\d+(\.\d+)?|[a-zA-Z]+|[√π²³]/g) || []));
  const score = tokens.map((mine, index) => tokens.reduce((sum, theirs, other) =>
    sum + (index === other ? 0 : [...mine].filter((token) => theirs.has(token)).length), 0));
  const values = choices.map(numericValue);
  if (values.every((value) => value !== null)) {
    const order = [0, 1, 2, 3].sort((left, right) => values[left] - values[right]);
    const middle = [order[1], order[2]];
    const best = Math.max(...middle.map((index) => score[index]));
    return middle.filter((index) => score[index] === best);
  }
  const best = Math.max(...score);
  return choices.map((unused, index) => index).filter((index) => score[index] === best);
}

function hubCredit(choices, key) {
  const kept = hubCandidates(choices);
  return kept.includes(key) ? 1 / kept.length : 0;
}

/* --------------------------------------------- blind look-alike pairs */

const tokensOf = (text) => String(text).toLowerCase().replace(/−/g, "-")
  .match(/[\p{L}\p{N}.]+|[^\s\p{L}\p{N}]/gu) || [];

// Why two choices look alike, or null. A distractor built by one change to
// the key (a sign, a reciprocal, a factor of 2, the complement to 90, 100,
// 180 or 360, one word or symbol swapped, added or dropped) looks like it;
// a student who guesses within such pairs gains when the key is in them
// more often than chance. Relations between numbers: "negation",
// "reciprocal", "double", "complement"; between texts or expressions:
// "sign" (equal once + and − are ignored), "one-token" (same length, one
// token differs), "insertion" (one token added, at least three kept).
function lookAlike(left, right) {
  const a = numericValue(left);
  const b = numericValue(right);
  if (a !== null && b !== null && Number.isFinite(a) && Number.isFinite(b)) {
    if (a !== 0 && close(a, -b)) return "negation";
    if (!close(a, b) && close(a * b, 1)) return "reciprocal";
    if (a !== 0 && b !== 0 && (close(a, 2 * b) || close(b, 2 * a))) return "double";
    if (a > 0 && b > 0 && [90, 100, 180, 360].some((whole) => close(a + b, whole))) return "complement";
    return null;
  }
  const unsigned = (text) => String(text).replace(/[+−-]/g, "±");
  if (String(left) !== String(right) && unsigned(left) === unsigned(right)) return "sign";
  const p = tokensOf(left);
  const q = tokensOf(right);
  if (p.length && p.length === q.length && p.filter((token, index) => token !== q[index]).length === 1) return "one-token";
  if (Math.abs(p.length - q.length) === 1 && Math.min(p.length, q.length) >= 3) {
    const [shorter, longer] = p.length < q.length ? [p, q] : [q, p];
    const target = shorter.join(" ");
    if (longer.some((unused, index) => longer.filter((token, other) => other !== index).join(" ") === target)) return "insertion";
  }
  return null;
}

// The blind pair strategy: guess among the choices that look like another
// choice. When none do, or all do, the pairs say nothing and the guess is
// among all four. Returns the choices guessed among.
function pairCandidates(choices) {
  const paired = new Set();
  choices.forEach((left, i) => choices.forEach((right, j) => {
    if (j > i && lookAlike(left, right)) {
      paired.add(i);
      paired.add(j);
    }
  }));
  return paired.size && paired.size < choices.length ? [...paired] : choices.map((unused, index) => index);
}

function pairCredit(choices, key) {
  const kept = pairCandidates(choices);
  return kept.includes(key) ? 1 / kept.length : 0;
}

/* ------------------------------------------- blind most-similar pair */

// Words of a text choice, lower-cased, as a set.
const wordSet = (text) => new Set(String(text).toLowerCase().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []);

// Shared words over all words (Jaccard), 1 for two empty choices.
function wordOverlap(left, right) {
  const a = wordSet(left);
  const b = wordSet(right);
  let shared = 0;
  a.forEach((word) => {
    if (b.has(word)) shared += 1;
  });
  const union = a.size + b.size - shared;
  return union ? shared / union : 1;
}

// The blind most-similar strategy for text choices: find the two choices
// that share the most words and guess between them. A distractor written
// by editing the key shares most of its words, so the key tends to sit in
// that pair. Tied pairs pool their choices; a tie across all four says
// nothing. Returns the choices guessed among.
function similarCandidates(choices) {
  let best = -1;
  let members = new Set();
  choices.forEach((left, i) => choices.forEach((right, j) => {
    if (j <= i) return;
    const overlap = wordOverlap(left, right);
    if (overlap > best + 1e-12) {
      best = overlap;
      members = new Set([i, j]);
    } else if (Math.abs(overlap - best) <= 1e-12) {
      members.add(i);
      members.add(j);
    }
  }));
  return members.size && members.size < choices.length ? [...members] : choices.map((unused, index) => index);
}

function similarCredit(choices, key) {
  const kept = similarCandidates(choices);
  return kept.includes(key) ? 1 / kept.length : 0;
}

/* ------------------------------------------------------- visible text */

// Slips a student sees in the question or its choices, each a [name,
// pattern] pair: "a" before a number read with a vowel sound ("a 80%",
// "a 11"), a count of one with a plural unit ("1 boxes", "1 radians"), a
// coefficient of one written out ("1y"), an ASCII hyphen as a minus before a
// superscript ("x-²"), and a repeating decimal cut off at the screen ("0.3333",
// "1,666.6667"), which a real test would print as a fraction or round.
const TEXT_SLIPS = [
  ["a before a vowel-sound number", /\ba (?:8[\d.]*%?|11|18)(?![\d,])/],
  ["1 with a plural unit", /(?:^|[^\d.,−-])1 (?:boxes|radians|kilograms|grams|centimeters|meters|kilometers|hours|minutes|seconds|days|weeks|years|pounds|dollars|liters|milliliters|miles|feet|inches|units|people|students|points|degrees|cups|gallons)\b/],
  ["coefficient 1 written out", /(?:^|[\s(=+−-])1[a-z](?![a-z\d])/],
  ["hyphen as minus before a superscript", /-[⁰¹²³⁴⁵⁶⁷⁸⁹]/],
  ["repeating decimal cut off", /\d\.\d*([1-9])\1{2,}\d?(?!\d)/],
];

// The slips in what a student reads before answering: the stimulus, the
// stem and the choices. Returns the names found.
function textSlips(record) {
  const visible = [record.stimulus && record.stimulus.content, record.stem, ...(record.choices || [])]
    .filter((text) => typeof text === "string");
  return TEXT_SLIPS.filter(([, pattern]) => visible.some((text) => pattern.test(text))).map(([name]) => name);
}

/* ------------------------------------------------------------ measuring */

const close = (left, right) => Math.abs(left - right) <= 1e-9 * Math.max(1, Math.abs(left), Math.abs(right));

// True when the key is the smallest or largest of four numeric values.
function keyIsExtreme(values, key) {
  const others = values.filter((unused, index) => index !== key);
  const value = values[key];
  return others.every((other) => value < other || close(value, other)) ||
    others.every((other) => value > other || close(value, other));
}

// Problems with a record's declared choice features: every choice needs an
// object, all with the same feature names.
function featureShapeError(record) {
  const features = record.choiceFeatures;
  if (!Array.isArray(features) || features.length !== record.choices.length) return "choiceFeatures must list one entry per choice";
  if (features.some((entry) => !entry || typeof entry !== "object")) return "choiceFeatures has a choice with no features";
  const names = Object.keys(features[0]).sort().join("|");
  if (!names) return "choiceFeatures declares no features";
  if (features.some((entry) => Object.keys(entry).sort().join("|") !== names)) {
    return "choiceFeatures names differ between choices";
  }
  return null;
}

// A dictionary safe for any key, even "constructor" or "__proto__".
const dictionary = () => Object.create(null);

// Summarizes a template's repetitions. `entries` are { seed, record } or
// { seed, error }. Counts, not verdicts: templateFailures applies the limits.
// A share of distinct items falls as draws grow (a template has finitely many
// items), so the variety share is taken over the first `options.window`
// records, keeping it independent of how many repetitions a run makes.
function measureTemplate(entries, options) {
  const window = (options && options.window) || Infinity;
  const m = {
    reps: entries.length,
    throws: 0,
    throwSeeds: [],
    throwMessages: dictionary(),
    unverified: 0,
    unverifiedSeeds: [],
    keyEqual: 0,
    keyEqualSeeds: [],
    records: 0,
    windowRecords: 0,
    windowDistinct: 0,
    mc: 0,
    numeric: 0,
    distinct: 0,
    positions: [0, 0, 0, 0],
    choiceWords: 0,
    longestKey: 0,
    shortestKey: 0,
    textChoiceReps: 0,
    shortTextReps: 0,
    longestKeyChars: 0,
    shortestKeyChars: 0,
    similar: 0,
    numericChoiceReps: 0,
    extremeKey: 0,
    hub: 0,
    pair: 0,
    openers: dictionary(),
    recurring: dictionary(),
    features: dictionary(),
    featureReps: 0,
    featureErrors: dictionary(),
  };
  const identities = new Set();
  entries.forEach(({ seed, record, error }) => {
    if (error) {
      m.throws += 1;
      if (m.throwSeeds.length < 3) m.throwSeeds.push(String(seed));
      const message = String(error.message || error).split("\n")[0];
      m.throwMessages[message] = (m.throwMessages[message] || 0) + 1;
      return;
    }
    m.records += 1;
    identities.add(itemIdentity(record));
    if (m.records <= window) {
      m.windowRecords = m.records;
      m.windowDistinct = identities.size;
    }
    if (record.verified === false) {
      m.unverified += 1;
      if (m.unverifiedSeeds.length < 3) m.unverifiedSeeds.push(String(seed));
    }
    if (record.keyEqualDistractors) {
      m.keyEqual += 1;
      if (m.keyEqualSeeds.length < 3) m.keyEqualSeeds.push(String(seed));
    }
    if (record.responseType !== "multiple-choice" || !Array.isArray(record.choices)) {
      m.numeric += 1;
      return;
    }
    const { choices } = record;
    const key = record.correctAnswer;
    m.mc += 1;
    if (key >= 0 && key < 4) m.positions[key] += 1;
    m.choiceWords += choices.reduce((sum, choice) => sum + words(choice).length, 0);
    const lengths = choices.map((choice) => choice.length);
    const longest = Math.max(...lengths);
    const shortest = Math.min(...lengths);
    if (lengths[key] === longest && lengths.filter((length) => length === longest).length === 1) m.longestKey += 1;
    if (lengths[key] === shortest && lengths.filter((length) => length === shortest).length === 1) m.shortestKey += 1;
    const values = choices.map(numericValue);
    if (values.every((value) => value !== null)) {
      m.numericChoiceReps += 1;
      if (keyIsExtreme(values, key)) m.extremeKey += 1;
    }
    m.hub += hubCredit(choices, key);
    m.pair += pairCredit(choices, key);
    if (!values.every((value) => value !== null)) {
      m.textChoiceReps += 1;
      m.similar += similarCredit(choices, key);
      // Short text choices (a mark, a verb form, a transition) are judged by
      // their characters, since a word count cannot tell them apart.
      if (choices.reduce((sum, choice) => sum + words(choice).length, 0) < 3 * choices.length) {
        m.shortTextReps += 1;
        if (lengths[key] === longest && lengths.filter((length) => length === longest).length === 1) m.longestKeyChars += 1;
        if (lengths[key] === shortest && lengths.filter((length) => length === shortest).length === 1) m.shortestKeyChars += 1;
      }
    }
    choices.forEach((choice, index) => {
      const start = opener(choice);
      if (!start) return;
      const tally = (m.openers[start] = m.openers[start] || { occurrences: 0, key: 0 });
      tally.occurrences += 1;
      if (index === key) tally.key += 1;
    });
    new Set(choices.map(normalizeChoice)).forEach((text) => {
      const tally = (m.recurring[text] = m.recurring[text] || { reps: 0, key: 0 });
      tally.reps += 1;
      if (normalizeChoice(choices[key]) === text) tally.key += 1;
    });
    if (record.choiceFeatures) {
      const problem = featureShapeError(record);
      if (problem) {
        m.featureErrors[problem] = (m.featureErrors[problem] || 0) + 1;
        return;
      }
      m.featureReps += 1;
      Object.keys(record.choiceFeatures[key]).forEach((name) => {
        const value = record.choiceFeatures[key][name];
        const tally = (m.features[name] = m.features[name] || { reps: 0, keyAlone: 0 });
        tally.reps += 1;
        const shared = record.choiceFeatures.some((entry, index) => index !== key && entry[name] === value);
        if (!shared) tally.keyAlone += 1;
      });
    }
  });
  m.distinct = identities.size;
  return m;
}

/* ------------------------------------------------------------- verdicts */

const percent = (share) => `${Math.round(share * 100)}%`;
const seedList = (seeds) => (seeds.length ? ` (e.g. seed ${seeds.map((seed) => JSON.stringify(seed)).join(", ")})` : "");

// Derived shares, rounded for reports and JSON.
function shares(m) {
  const round = (value) => Math.round(value * 1000) / 1000;
  const of = (count, total) => (total ? round(count / total) : null);
  return {
    positions: m.positions.map((count) => of(count, m.mc)),
    averageChoiceWords: m.mc ? round(m.choiceWords / (4 * m.mc)) : null,
    longestKey: of(m.longestKey, m.mc),
    shortestKey: of(m.shortestKey, m.mc),
    numericChoiceShare: of(m.numericChoiceReps, m.mc),
    extremeKey: of(m.extremeKey, m.numericChoiceReps),
    hub: of(m.hub, m.mc),
    pair: of(m.pair, m.mc),
    similar: of(m.similar, m.textChoiceReps),
    longestKeyChars: of(m.longestKeyChars, m.shortTextReps),
    shortestKeyChars: of(m.shortestKeyChars, m.shortTextReps),
    distinctShare: of(m.windowDistinct, m.windowRecords),
  };
}

// The numbered per-template checks. `limits` holds the thresholds (the gate
// passes the documented ones); `context` says which section-specific checks
// apply: { math, requireFeatures, minDistinct, minDistinctShare }.
// Returns [{ check, message, value }].
function templateFailures(m, limits, context) {
  const settings = context || {};
  const failures = [];
  const fail = (check, message, value) => failures.push({ check, message, value });
  const s = shares(m);

  // 1. Every repetition builds, verifies, and keeps every modelled mistake off the key.
  if (m.throws) {
    const [message] = Object.keys(m.throwMessages);
    fail(1, `throws in ${m.throws}/${m.reps} reps: ${message}${seedList(m.throwSeeds)}`, m.throws / m.reps);
  }
  if (m.unverified) fail(1, `verify() false in ${m.unverified}/${m.records} reps${seedList(m.unverifiedSeeds)}`, m.unverified / m.records);
  if (m.keyEqual) {
    fail(1, `a modelled mistake equals the key in ${m.keyEqual}/${m.records} reps${seedList(m.keyEqualSeeds)}`, m.keyEqual / m.records);
  }

  const sampled = m.mc >= limits.minSample;
  // 2. Key position.
  if (sampled) {
    s.positions.forEach((share, index) => {
      if (share < limits.position[0] || share > limits.position[1]) {
        fail(2, `key is ${LETTERS[index]} in ${percent(share)} of reps (want ${percent(limits.position[0])}-${percent(limits.position[1])})`, share);
      }
    });
  }

  // 3. Text choices: the key is not reliably the longest or the shortest.
  const text = sampled && s.averageChoiceWords >= limits.textWords;
  if (text) {
    if (s.longestKey > limits.longestKey) fail(3, `key is the unique longest choice in ${percent(s.longestKey)} of reps`, s.longestKey);
    if (s.shortestKey > limits.shortestKey) fail(3, `key is the unique shortest choice in ${percent(s.shortestKey)} of reps`, s.shortestKey);
  }

  // 3, short text choices: the same, by characters.
  if (settings.shortText && m.shortTextReps >= limits.minSample) {
    if (s.longestKeyChars > limits.longestKey) {
      fail(3, `key is the unique longest short choice (by characters) in ${percent(s.longestKeyChars)} of reps`, s.longestKeyChars);
    }
    if (s.shortestKeyChars > limits.shortestKey) {
      fail(3, `key is the unique shortest short choice (by characters) in ${percent(s.shortestKeyChars)} of reps`, s.shortestKeyChars);
    }
  }

  // 4. Numeric choices: the key is an extreme value neither always nor never.
  if (m.numericChoiceReps >= limits.minSample) {
    const [low, high] = limits.extremeKey;
    if (s.extremeKey < low || s.extremeKey > high) {
      fail(4, `key is the smallest or largest value in ${percent(s.extremeKey)} of ${m.numericChoiceReps} numeric-choice reps (want ${percent(low)}-${percent(high)})`, s.extremeKey);
    }
  }

  // 5. Openers: a frequent opening is not a key marker.
  if (text) {
    Object.entries(m.openers)
      .filter(([, tally]) => tally.occurrences >= limits.openerFrequency * m.mc)
      .forEach(([start, tally]) => {
        const share = tally.key / tally.occurrences;
        if (share > limits.openerKeyShare) {
          fail(5, `opener "${start}" is the key in ${percent(share)} of its ${tally.occurrences} uses`, share);
        }
      });
  }

  // 6. A recurring choice is not a key marker.
  if (sampled) {
    Object.entries(m.recurring)
      .filter(([, tally]) => tally.reps >= limits.recurringFrequency * m.mc)
      .forEach(([choice, tally]) => {
        const share = tally.key / tally.reps;
        if (share > limits.recurringKeyShare) {
          fail(6, `choice "${choice.slice(0, 60)}" recurs in ${percent(tally.reps / m.mc)} of reps and is the key in ${percent(share)} of them`, share);
        }
      });
  }

  // 7. Declared features: the key is not the odd one out.
  Object.entries(m.featureErrors).forEach(([problem, count]) => fail(7, `${problem} (${count} reps)`, count));
  if (settings.requireFeatures && m.mc && m.featureReps < m.mc) {
    fail(7, `declares choice features in ${m.featureReps}/${m.mc} reps; templates in this domain must declare the features their choices vary on`, m.featureReps / m.mc);
  }
  Object.entries(m.features).forEach(([name, tally]) => {
    const share = tally.keyAlone / tally.reps;
    if (tally.reps >= limits.minSample && share > limits.featureAlone) {
      fail(7, `the key alone has its "${name}" value in ${percent(share)} of reps`, share);
    }
  });

  // 8. Blind hub strategy.
  if (settings.hub && sampled && s.hub > limits.hubTemplate) {
    fail(8, `blind hub strategy scores ${percent(s.hub)} (want at most ${percent(limits.hubTemplate)})`, s.hub);
  }

  // 14. Blind most-similar pair strategy (text choices).
  if (settings.similar && m.textChoiceReps >= limits.minSample && s.similar > limits.similarTemplate) {
    fail(14, `blind most-similar pair strategy scores ${percent(s.similar)} (want at most ${percent(limits.similarTemplate)})`, s.similar);
  }

  // 13. Blind look-alike pair strategy (every section).
  if (sampled && s.pair > limits.pairTemplate) {
    fail(13, `blind look-alike pair strategy scores ${percent(s.pair)} (want at most ${percent(limits.pairTemplate)})`, s.pair);
  }

  // 9. Variety: distinct items, not reorderings.
  if (settings.minDistinctShare && m.windowRecords && s.distinctShare < settings.minDistinctShare) {
    fail(9, `only ${m.windowDistinct} distinct items in ${m.windowRecords} draws (want ${percent(settings.minDistinctShare)})`, s.distinctShare);
  }
  if (settings.minDistinct && m.distinct < settings.minDistinct) {
    fail(9, `only ${m.distinct} distinct items (want at least ${settings.minDistinct})`, m.distinct);
  }
  return failures;
}

/* --------------------------------------------------------- section level */

// A blind strategy's accuracy per difficulty tier: rows of { difficulty,
// measure }; `field` is the measure's credit total ("hub" by default,
// "pair", or "similar", which is judged over text-choice repetitions).
function hubByTier(rows, field) {
  const credit = field || "hub";
  const base = credit === "similar" ? "textChoiceReps" : "mc";
  const tiers = {};
  rows.forEach(({ difficulty, measure }) => {
    const tier = (tiers[difficulty] = tiers[difficulty] || { mc: 0, credit: 0 });
    tier.mc += measure[base];
    tier.credit += measure[credit];
  });
  return Object.fromEntries(Object.entries(tiers).map(([difficulty, tier]) =>
    [difficulty, { mc: tier.mc, share: tier.mc ? Math.round((tier.credit / tier.mc) * 1000) / 1000 : null }]));
}

// Transition words and phrases across a skill's records: how often each is
// offered and how often it is the key. `records` are MC records.
function choiceKeyShares(records) {
  const tallies = dictionary();
  records.forEach((record) => {
    record.choices.forEach((choice, index) => {
      const text = normalizeChoice(choice);
      const tally = (tallies[text] = tallies[text] || { appearances: 0, key: 0, templates: new Set() });
      tally.appearances += 1;
      if (index === record.correctAnswer) tally.key += 1;
      tally.templates.add(record.templateId);
    });
  });
  return tallies;
}

// Figure problems a student would see: NaN or undefined drawn into the SVG,
// markup the browser cannot parse (the app then shows only the alt text), or
// anything render.js's sanitizer would strip. `sanitize` is render.js's
// sanitizeSvgTree. The root's xmlns, role and aria-label are dropped by
// design (the renderer sets them itself), so they are not losses.
const RENDERER_OWNED = new Set(["xmlns", "role", "aria-label"]);

function figureProblems(svg, sanitize) {
  const problems = [];
  const bad = /NaN|Infinity|undefined/.exec(String(svg));
  if (bad) problems.push(`"${bad[0]}" in the SVG`);
  let tree;
  try {
    tree = parseXml(svg);
  } catch (error) {
    problems.push(`SVG does not parse as XML: ${error.message}`);
    return problems;
  }
  const clean = sanitize(tree);
  if (!clean) {
    problems.push("sanitizer rejects the SVG root");
    return problems;
  }
  const lost = [];
  (function compare(before, after, isRoot) {
    const kept = new Set((after ? after.attributes : []).map((attribute) => attribute.name));
    before.attributes.forEach((attribute) => {
      if (isRoot && (RENDERER_OWNED.has(attribute.name) || attribute.name.startsWith("xmlns:"))) return;
      if (!kept.has(attribute.name)) lost.push(`${before.name}@${attribute.name}`);
    });
    // The sanitizer keeps surviving children in order, so walk both lists.
    const survivors = after ? after.children.slice() : [];
    before.children.forEach((child) => {
      if (typeof child.text === "string") {
        if (survivors[0] && typeof survivors[0].text === "string") survivors.shift();
        else if (child.text.trim()) lost.push(`text inside <${before.name}>`);
        return;
      }
      if (survivors[0] && survivors[0].name === child.name && typeof survivors[0].text !== "string") {
        compare(child, survivors.shift(), false);
      } else lost.push(`<${child.name}>`);
    });
  })(tree, clean, true);
  // Values stay out of the message so the gate can count figures per problem.
  const kinds = [...new Set(lost)];
  if (kinds.length) problems.push(`sanitizer drops ${kinds.slice(0, 3).join(", ")}${kinds.length > 3 ? ` and ${kinds.length - 3} more` : ""}`);
  return problems;
}

module.exports = {
  choiceKeyShares,
  figureProblems,
  hubByTier,
  hubCandidates,
  hubCredit,
  itemIdentity,
  keyIsExtreme,
  lookAlike,
  measureTemplate,
  textSlips,
  normalizeChoice,
  opener,
  pairCandidates,
  pairCredit,
  shares,
  similarCandidates,
  similarCredit,
  wordOverlap,
  templateFailures,
};
