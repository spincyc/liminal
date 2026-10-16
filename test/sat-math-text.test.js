"use strict";

// Text slips in every field a student can see, before or after answering
// (stem, stimulus, choices, figure alt text, explanation, steps, principles,
// trap, hint and wrong-answer rationales), over SAT Math draws. The gate's
// check 15 covers only the question and its choices; these classes reached
// students through teaching text and rationales (2026-10-16 review).

const test = require("node:test");
const assert = require("node:assert/strict");
const families = require("../src/lib/families/sat/math");
const { instantiate } = require("../src/lib/families/shared");

const PLURALS = [
  "seconds", "minutes", "hours", "days", "weeks", "months", "years", "millimeters", "centimeters", "meters", "kilometers",
  "inches", "feet", "yards", "miles", "acres", "gallons", "liters", "milliliters", "ounces", "pounds", "grams", "kilograms",
  "tons", "dollars", "cents", "points", "students", "people", "members", "items", "boxes", "tickets", "questions", "seniors",
  "workers", "painters", "machines", "pumps", "volunteers", "units", "pages", "books", "games", "cups", "baskets", "values",
  "employees", "customers", "players", "trees", "bags", "cars", "copies", "plants", "seedlings", "runners", "visitors",
  "residents", "deer",
].join("|");

const CLASSES = [
  // A count of one with a plural noun ("1 hours", "1 square kilometers"); a list such as "1, 2, 1 months" is fine.
  ["a count of one with a plural noun", new RegExp(`(?<![\\d.,/−-])(?<!, )\\b1 (?:square |cubic )?(?:${PLURALS})\\b`)],
  ["one of whom are", /\b1 of (?:whom|which|them) (?:are|were)\b/],
  ["a before a vowel-sound number", /\ba (?:8|11|18|8\d|8\d\d|8\d\d\d)(?![\d,])|\ba 8,/],
  ["an before a consonant-sound number", /\ban (?!8|11|18)\d/],
  ["a coefficient of one written out", /(?<![\d.,/])(?:^|(?<=[\s(+−-]))1[a-z](?![a-z])/],
];

// Known slips in templates whose files this change did not edit; fixing them
// would put every template in those files up for renewed review. Remove an
// entry when its file is next edited.
const KNOWN = {
  "frequency-distribution-probability": ["a count of one with a plural noun"],
  "inscribed-composite-solids": ["a before a vowel-sound number"],
  "volume-unit-conversion": ["a count of one with a plural noun"],
  "regular-polygon-angle-ratio": ["a coefficient of one written out"],
  "system-word-totals": ["a coefficient of one written out"],
};

function texts(q) {
  return [
    q.stem, q.stimulus && q.stimulus.content, q.figure && q.figure.alt, q.explanation, q.trap, q.hint,
    ...(q.choices || []), ...(q.solutionSteps || []), ...(q.principles || []),
    ...(q.distractorRationales || []).map((entry) => entry.reason),
  ].filter((text) => typeof text === "string");
}

const seeds = Array.from({ length: 400 }, (_, index) => (index < 200 ? String(index) : `text.${index}.check`));

test("SAT Math text has no plural, article or coefficient-of-one slips", () => {
  const found = [];
  for (const family of families) {
    const allowed = new Set(KNOWN[family.id] || []);
    const seen = new Set();
    for (const seed of seeds) {
      const q = instantiate(family, seed);
      for (const text of texts(q)) {
        for (const [name, pattern] of CLASSES) {
          if (allowed.has(name) || seen.has(name) || !pattern.test(text)) continue;
          seen.add(name);
          found.push(`${family.id} seed ${seed}: ${name}: "${text.slice(0, 120)}"`);
        }
      }
    }
  }
  assert.deepEqual(found, []);
});

test("the slip patterns catch the forms they name", () => {
  const caught = (text) => CLASSES.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  assert.deepEqual(caught("To finish 1 hours early"), ["a count of one with a plural noun"]);
  assert.deepEqual(caught("an area of 1 square kilometers"), ["a count of one with a plural noun"]);
  assert.deepEqual(caught("A club has 55 members, 1 of whom are seniors."), ["one of whom are"]);
  assert.deepEqual(caught("Applies a 8% change"), ["a before a vowel-sound number"]);
  assert.deepEqual(caught("an 5% increase"), ["an before a consonant-sound number"]);
  assert.deepEqual(caught("Match the constant terms: −1k = −6"), ["a coefficient of one written out"]);
  assert.deepEqual(caught("x² + 1x − 12"), ["a coefficient of one written out"]);
  // Correct forms pass.
  for (const fine of ["1 hour", "1 square kilometer", "gaps of 1, 2, 1 months", "an 8% change", "a 1,800-meter run",
    "an 11-sided polygon", "1/x + 1/(2x)", "1.5 hours", "x² + x − 12", "11 hours"]) {
    assert.deepEqual(caught(fine), [], fine);
  }
});
