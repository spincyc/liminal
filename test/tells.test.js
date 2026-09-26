"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { numericValue, parse } = require("../tools/lib/expr");
const { parseXml } = require("../tools/lib/svg-tree");
const T = require("../tools/lib/tells");
const { sanitizeSvgTree } = require("../src/app/render");

// The documented limits (tools/check-families.js), repeated so each check's
// boundary is pinned here.
const LIMITS = {
  minSample: 100,
  position: [0.15, 0.35],
  textWords: 3,
  longestKey: 0.4,
  shortestKey: 0.4,
  extremeKey: [0.15, 0.85],
  openerFrequency: 0.25,
  openerKeyShare: 0.6,
  recurringFrequency: 0.2,
  recurringKeyShare: 0.75,
  featureAlone: 0.4,
  hubTemplate: 0.5,
  hubTier: 0.32,
  pairTemplate: 0.5,
  pairTier: 0.32,
  similarTemplate: 0.4,
  similarTier: 0.3,
};

let counter = 0;
function mc(choices, key, extra) {
  counter += 1;
  return {
    seed: counter,
    record: {
      templateId: "demo",
      responseType: "multiple-choice",
      stem: `Question ${counter}`,
      choices,
      correctAnswer: key,
      verified: true,
      keyEqualDistractors: 0,
      choiceFeatures: null,
      ...extra,
    },
  };
}

// `count` items built by `make(index)`.
const many = (count, make) => Array.from({ length: count }, (unused, index) => make(index));
const checks = (failures) => failures.map((failure) => failure.check);

test("choice strings parse to numbers the way a student reads them", () => {
  assert.equal(numericValue("−3/4"), -0.75);
  assert.equal(numericValue("$1,200"), 1200);
  assert.equal(numericValue("12%"), 0.12);
  assert.ok(Math.abs(numericValue("2√3") - 2 * Math.sqrt(3)) < 1e-12);
  assert.ok(Math.abs(numericValue("5π") - 5 * Math.PI) < 1e-12);
  assert.equal(numericValue("2³"), 8);
  assert.equal(numericValue("x + 3"), null);
  assert.equal(numericValue("12 hours"), null);
  assert.equal(numericValue("3 or 4"), null);
  assert.deepEqual(parse("2x − y").vars, ["x", "y"]);
});

test("the hub strategy keeps the middle values that share the most with the others", () => {
  // Numeric: the middle values are 3/5 and 3/4; 3/4 shares a 3 or a 4 with
  // every other choice, so it is kept.
  assert.deepEqual(T.hubCandidates(["3/4", "4/3", "3/5", "1/4"]), [0]);
  assert.equal(T.hubCredit(["3/4", "4/3", "3/5", "1/4"], 0), 1);
  assert.equal(T.hubCredit(["3/4", "4/3", "3/5", "1/4"], 1), 0);
  // Symbolic: the choice sharing the most tokens with the rest.
  assert.deepEqual(T.hubCandidates(["2x + 3", "2x − 3", "5x + 1", "x + 5"]), [0, 1]);
  assert.equal(T.hubCredit(["2x + 3", "2x − 3", "5x + 1", "x + 5"], 1), 0.5);
  assert.equal(T.hubCredit(["2x + 3", "2x − 3", "5x + 1", "x + 5"], 3), 0);
});

test("openers and recurring choices are normalized", () => {
  assert.equal(T.opener("By suggesting that the data…"), "by suggesting");
  assert.equal(T.opener("“It’s   true,” she said."), "it’s true");
  assert.equal(T.normalizeChoice("  However, "), "however");
  assert.equal(T.normalizeChoice("However;"), T.normalizeChoice("however"));
  assert.equal(T.keyIsExtreme([1, 2, 3, 4], 0), true);
  assert.equal(T.keyIsExtreme([1, 2, 3, 4], 3), true);
  assert.equal(T.keyIsExtreme([1, 2, 3, 4], 2), false);
});

test("check 1 fails a throw, a false verify, or a mistake on the key", () => {
  const entries = many(120, (index) => mc(["1", "2", "3", "4"], index % 4));
  assert.deepEqual(checks(T.templateFailures(T.measureTemplate(entries), LIMITS, {})), []);
  entries.push({ seed: "x.demo.0", error: new Error("only 2 distinct distractors") });
  entries.push(mc(["1", "2", "3", "4"], 0, { verified: false }));
  entries.push(mc(["1", "2", "3", "4"], 0, { keyEqualDistractors: 1 }));
  const failures = T.templateFailures(T.measureTemplate(entries), LIMITS, {});
  assert.deepEqual(checks(failures), [1, 1, 1]);
  assert.match(failures[0].message, /throws in 1\/123 reps: only 2 distinct distractors \(e\.g\. seed "x\.demo\.0"\)/);
});

test("check 2 bounds each key position between 15% and 35%", () => {
  const skewed = many(200, (index) => mc(["1", "2", "3", "4"], index % 5 === 0 ? 1 : index % 2 ? 0 : 2));
  const failures = T.templateFailures(T.measureTemplate(skewed), LIMITS, {});
  assert.ok(failures.some((failure) => failure.check === 2 && /key is A/.test(failure.message)));
  // Too few multiple-choice reps to judge: no verdict.
  const few = many(40, () => mc(["1", "2", "3", "4"], 0));
  assert.deepEqual(checks(T.templateFailures(T.measureTemplate(few), LIMITS, {})), []);
});

test("check 3 fails text choices whose key is usually the shortest", () => {
  const shortest = many(200, (index) => {
    const key = index % 4;
    const choices = [0, 1, 2, 3].map((place) =>
      (place === key ? `k${index} brief answer` : `w${index}-${place} a much longer answer choice`));
    return mc(choices, key);
  });
  const failures = T.templateFailures(T.measureTemplate(shortest), LIMITS, {});
  assert.deepEqual(checks(failures), [3]);
  assert.match(failures[0].message, /unique shortest choice in 100%/);
  // Short choices (under three words on average) are not text choices.
  const terse = many(200, (index) => mc(["is", "are", "was", "were"].map((word) => `${word}${index}`), index % 4));
  assert.deepEqual(checks(T.templateFailures(T.measureTemplate(terse), LIMITS, {})), []);
});

test("check 4 fails numeric keys that are never, or always, an extreme value", () => {
  const rotate = (list, turn) => list.map((unused, index) => list[(index + turn) % 4]);
  // The key (20 or 30) takes every position but is always a middle value.
  const middle = many(200, (index) => {
    const values = rotate(["20", "10", "30", "40"], index % 4);
    return mc(values, values.indexOf(index % 2 ? "20" : "30"));
  });
  const measure = T.measureTemplate(middle);
  assert.equal(measure.numericChoiceReps, 200);
  const failures = T.templateFailures(measure, LIMITS, {});
  assert.deepEqual(checks(failures), [4]);
  assert.match(failures[0].message, /0% of 200 numeric-choice reps/);
  const mixed = many(200, (index) => {
    const values = rotate(["20", "10", "30", "40"], index % 4);
    return mc(values, values.indexOf(["10", "20", "30", "40"][Math.floor(index / 4) % 4]));
  });
  assert.deepEqual(checks(T.templateFailures(T.measureTemplate(mixed), LIMITS, {})), []);
});

test("check 5 fails an opener that marks the key", () => {
  const entries = many(200, (index) => {
    const key = index % 4;
    const others = ["To assess", "It claims", "We object"];
    const choices = [0, 1, 2, 3].map((place) =>
      `${place === key ? "By noting" : others[(place + (place > key ? -1 : 0)) % 3]} the ${index} data`);
    return mc(choices, key);
  });
  const failures = T.templateFailures(T.measureTemplate(entries), LIMITS, {});
  assert.deepEqual(checks(failures), [5]);
  assert.match(failures[0].message, /"by noting" is the key in 100% of its 200 uses/);
});

test("check 6 fails a recurring choice that is nearly always the key", () => {
  const entries = many(200, (index) => {
    const key = index % 4;
    const offered = index % 3 === 0;
    const choices = ["Therefore,", "Instead,", "Likewise,", "Meanwhile,"];
    if (offered) choices[key] = "For instance,";
    return mc(choices, key);
  });
  const failures = T.templateFailures(T.measureTemplate(entries), LIMITS, {});
  assert.ok(failures.some((failure) => failure.check === 6 && /"for instance" recurs in 34% of reps and is the key in 100%/.test(failure.message)));
});

test("check 7 fails a key that alone holds a declared feature value, and requires features where asked", () => {
  const odd = many(200, (index) => {
    const key = index % 4;
    const choiceFeatures = [0, 1, 2, 3].map((place) => ({ number: place === key ? "plural" : "singular" }));
    return mc(["is", "are", "was", "has"], key, { choiceFeatures });
  });
  const failures = T.templateFailures(T.measureTemplate(odd), LIMITS, {});
  assert.deepEqual(checks(failures), [7]);
  assert.match(failures[0].message, /"number" value in 100% of reps/);
  const split = many(200, (index) => {
    const key = index % 4;
    const choiceFeatures = [0, 1, 2, 3].map((place) => ({ number: (place + key) % 2 ? "plural" : "singular" }));
    return mc(["is", "are", "was", "has"], key, { choiceFeatures });
  });
  assert.deepEqual(checks(T.templateFailures(T.measureTemplate(split), LIMITS, {})), []);
  const undeclared = many(200, (index) => mc(["is", "are", "was", "has"], index % 4));
  assert.deepEqual(checks(T.templateFailures(T.measureTemplate(undeclared), LIMITS, { requireFeatures: true })), [7]);
  const ragged = [mc(["is", "are", "was", "has"], 0, { choiceFeatures: [{ n: "a" }, { n: "b" }, { t: "c" }, { n: "d" }] })];
  assert.match(T.templateFailures(T.measureTemplate(ragged), LIMITS, {})[0].message, /names differ/);
});

test("check 8 fails a Math template the blind hub strategy beats", () => {
  // Each distractor changes one part of the key, so the key shares the most.
  const entries = many(200, (index) => {
    const [a, b] = [2 + (index % 5), 10 + index];
    const key = index % 4;
    const wrong = [`${a + 1}x + ${b}`, `${a}x + ${b + 2}`, `${a}x² + ${b + 1}`];
    const choices = wrong.slice();
    choices.splice(key, 0, `${a}x + ${b}`);
    return mc(choices, key);
  });
  const measure = T.measureTemplate(entries);
  assert.equal(T.shares(measure).hub, 1);
  assert.deepEqual(checks(T.templateFailures(measure, LIMITS, { hub: true })), [8]);
  assert.deepEqual(checks(T.templateFailures(measure, LIMITS, {})), []);
  const tiers = T.hubByTier([{ difficulty: "Hard", measure }, { difficulty: "Hard", measure: T.measureTemplate(many(200, (index) => mc(["1", "2", "3", "4"], index % 4))) }]);
  assert.equal(tiers.Hard.mc, 400);
  assert.ok(tiers.Hard.share > 0.5);
});

test("look-alike choices are paired by one change", () => {
  assert.equal(T.lookAlike("−12", "12"), "negation");
  assert.equal(T.lookAlike("3/4", "4/3"), "reciprocal");
  assert.equal(T.lookAlike("18", "9"), "double");
  assert.equal(T.lookAlike("35%", "65%"), null, "percent choices read as fractions, not complements");
  assert.equal(T.lookAlike("35", "145"), "complement");
  assert.equal(T.lookAlike("x − 3", "x + 3"), "sign");
  assert.equal(T.lookAlike("The data show a decline", "The data show a rise"), "one-token");
  assert.equal(T.lookAlike("The data show a decline", "The data clearly show a decline"), "insertion");
  assert.equal(T.lookAlike("12", "13"), null);
  assert.equal(T.lookAlike("its", "it's"), null, "an apostrophe splits a token, so these differ in more than one");
  assert.deepEqual(T.pairCandidates(["5", "−5", "7", "11"]).sort(), [0, 1]);
  assert.deepEqual(T.pairCandidates(["5", "6", "7", "11"]), [0, 1, 2, 3], "no pairs: guess among all four");
  assert.equal(T.pairCredit(["5", "−5", "7", "11"], 0), 0.5);
  assert.equal(T.pairCredit(["5", "−5", "7", "11"], 2), 0);
});

test("check 13 fails a template whose key sits in its look-alike pair", () => {
  const paired = many(200, (index) => {
    const key = index % 4;
    const value = 101 + (index % 40);
    const choices = [String(value + 3), String(value + 7), String(value + 11)];
    choices.splice(key, 0, String(value));
    // The negated key sits next to it, so a student guessing within the pair wins half the time.
    choices[(key + 1) % 4] = `−${value}`;
    return mc(choices, key);
  });
  const measure = T.measureTemplate(paired);
  assert.equal(T.shares(measure).pair, 0.5);
  // (Check 4 fails too: the key is never the smallest or largest value.)
  assert.ok(checks(T.templateFailures(measure, { ...LIMITS, pairTemplate: 0.45 }, {})).includes(13));
  assert.ok(!checks(T.templateFailures(measure, LIMITS, {})).includes(13), "50% is the template limit");
  const tiers = T.hubByTier([{ difficulty: "Medium", measure }], "pair");
  assert.equal(tiers.Medium.share, 0.5);
});

test("the most-similar pair is the two choices sharing the most words", () => {
  assert.equal(T.wordOverlap("The bird sings at dawn", "the bird sings at dusk"), 4 / 6);
  assert.equal(T.wordOverlap("", ""), 1);
  const choices = ["The finding supports the claim", "The finding weakens the claim", "It is unrelated to rainfall", "Nobody measured anything"];
  assert.deepEqual(T.similarCandidates(choices).sort(), [0, 1]);
  assert.equal(T.similarCredit(choices, 1), 0.5);
  assert.equal(T.similarCredit(choices, 2), 0);
  assert.deepEqual(T.similarCandidates(["a b", "a b", "a b", "a b"]), [0, 1, 2, 3], "a tie across all four says nothing");
});

test("check 14 fails a template whose key sits in its most-similar pair", () => {
  const edited = many(200, (index) => {
    const key = index % 4;
    const choices = ["Rainfall rose sharply in spring", "Farmers planted early that year", "Prices fell across the region"];
    // The key is the first choice with one word changed.
    choices.splice(key, 0, key === 0 ? "Rainfall rose slowly in spring" : choices[0].replace("sharply", "slowly"));
    return mc(choices, key);
  });
  const measure = T.measureTemplate(edited);
  assert.equal(T.shares(measure).similar, 0.5);
  assert.ok(checks(T.templateFailures(measure, LIMITS, { similar: true })).includes(14));
  assert.ok(!checks(T.templateFailures(measure, LIMITS, {})).includes(14), "only where the section asks for it");
  assert.equal(T.hubByTier([{ difficulty: "Easy", measure }], "similar").Easy.share, 0.5);
});

test("check 3 judges short text choices by characters", () => {
  const marks = many(200, (index) => {
    const key = index % 4;
    const choices = ["cut, so", "cut so", "cut; so"];
    choices.splice(key, 0, "cut, and so");
    return mc(choices, key);
  });
  const measure = T.measureTemplate(marks);
  assert.equal(T.shares(measure).longestKeyChars, 1);
  assert.ok(checks(T.templateFailures(measure, LIMITS, { shortText: true })).includes(3));
  assert.ok(!checks(T.templateFailures(measure, LIMITS, {})).includes(3), "word-count check 3 skips choices this short");
});

test("check 9 counts items, not choice orders", () => {
  const reordered = many(200, (index) => ({
    seed: index,
    record: { ...mc(index % 2 ? ["1", "2", "3", "4"] : ["4", "3", "2", "1"], index % 4).record, stem: "Same" },
  }));
  const measure = T.measureTemplate(reordered);
  assert.equal(measure.distinct, 1);
  assert.deepEqual(checks(T.templateFailures(measure, LIMITS, { minDistinct: 10 })), [9]);
  assert.deepEqual(checks(T.templateFailures(measure, LIMITS, { minDistinctShare: 0.75 })), [9]);
  // The share is taken over a fixed window of draws: 150 distinct items then
  // repeats pass in a 200-draw window however long the run.
  const varied = many(600, (index) => ({ seed: index, record: { ...mc(["1", "2", "3", "4"], index % 4).record, stem: `Q${index % 150}` } }));
  const windowed = T.measureTemplate(varied, { window: 200 });
  assert.equal(windowed.windowRecords, 200);
  assert.equal(windowed.windowDistinct, 150);
  assert.equal(windowed.distinct, 150);
  assert.deepEqual(checks(T.templateFailures(windowed, LIMITS, { minDistinctShare: 0.75 })), []);
  assert.deepEqual(checks(T.templateFailures(T.measureTemplate(varied), LIMITS, { minDistinctShare: 0.75 })), [9]);
});

test("transition key shares count every appearance across templates", () => {
  const records = [
    { templateId: "a", choices: ["However,", "Afterward,", "Indeed,", "Thus,"], correctAnswer: 1 },
    { templateId: "b", choices: ["Afterward,", "Indeed,", "Still,", "So,"], correctAnswer: 0 },
  ];
  const shares = T.choiceKeyShares(records);
  assert.deepEqual({ appearances: shares.afterward.appearances, key: shares.afterward.key }, { appearances: 2, key: 2 });
  assert.equal(shares.indeed.key, 0);
  assert.deepEqual([...shares.afterward.templates].sort(), ["a", "b"]);
});

test("figure SVG parses like the browser and survives the sanitizer", () => {
  const good = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" role="img" aria-label="A &amp; B"><line x1="0" y1="0" x2="5" y2="5" stroke="currentColor"/><text x="1" y="2">A &lt; B</text></svg>';
  const tree = parseXml(good);
  assert.equal(tree.name, "svg");
  assert.equal(tree.namespace, "http://www.w3.org/2000/svg");
  assert.equal(tree.children[1].children[0].text, "A < B");
  assert.equal(tree.attributes.find((attribute) => attribute.name === "aria-label").value, "A & B");
  assert.deepEqual(T.figureProblems(good, sanitizeSvgTree), []);
  assert.deepEqual(T.figureProblems(good.replace('x2="5"', 'x2="NaN"'), sanitizeSvgTree), [
    '"NaN" in the SVG',
    "sanitizer drops line@x2",
  ]);
  assert.match(T.figureProblems(good.replace("&amp;", "&"), sanitizeSvgTree)[0], /does not parse as XML: bare &/);
  assert.match(T.figureProblems(good.replace("</text>", ""), sanitizeSvgTree)[0], /does not parse/);
  assert.deepEqual(T.figureProblems(good.replace("<line", '<image href="x.png"/><line'), sanitizeSvgTree), ["sanitizer drops <image>"]);
  assert.deepEqual(T.figureProblems(good.replace("<line", '<line style="fill:red"'), sanitizeSvgTree), ["sanitizer drops line@style"]);
  assert.throws(() => parseXml('<svg a="1" a="2"/>'), SyntaxError);
  assert.throws(() => parseXml('<svg><g></svg>'), SyntaxError);
  assert.throws(() => parseXml('<svg/><svg/>'), SyntaxError);
  assert.throws(() => parseXml('<x:svg/>'), SyntaxError);
  assert.equal(parseXml('<?xml version="1.0"?><!-- c --><svg><![CDATA[a<b]]></svg>').children[0].text, "a<b");
});
