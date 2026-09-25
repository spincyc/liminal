"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../src/lib/families/shared");

// A minimal multiple-choice family; `options` shapes what build returns.
function family(options) {
  return {
    id: "demo",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "x",
    build() {
      return {
        responseType: options.numeric ? "numeric" : "multiple-choice",
        stem: "Which?",
        hint: "h",
        explanation: "e",
        steps: ["a", "b"],
        principles: ["p"],
        trap: "t",
        correct: options.correct,
        wrong: options.wrong || [],
        features: options.features,
        verify: () => true,
      };
    },
  };
}

test("declared features follow their choices through the shuffle", () => {
  const demo = family({
    correct: "are",
    wrong: [["is", "singular"], ["was", "singular past"], ["were", "plural past"]],
    features: {
      correct: { number: "plural", tense: "present" },
      wrong: [
        { number: "singular", tense: "present" },
        { number: "singular", tense: "past" },
        { number: "plural", tense: "past" },
      ],
    },
  });
  const expected = { are: "plural|present", is: "singular|present", was: "singular|past", were: "plural|past" };
  for (let seed = 0; seed < 20; seed += 1) {
    const record = S.instantiate(demo, seed);
    assert.equal(record.choiceFeatures.length, 4);
    record.choices.forEach((choice, index) => {
      const features = record.choiceFeatures[index];
      assert.equal(`${features.number}|${features.tense}`, expected[choice]);
    });
    assert.equal(record.choices[record.correctAnswer], "are");
    assert.equal(record.keyEqualDistractors, 0);
  }
});

test("features of a dropped distractor are dropped with it", () => {
  const record = S.instantiate(family({
    correct: 5,
    wrong: [[6, "a"], [6, "duplicate"], [7, "b"], [8, "c"], [9, "spare"]],
    features: { correct: { f: "k" }, wrong: [{ f: "6" }, { f: "dup" }, { f: "7" }, { f: "8" }, { f: "9" }] },
  }), 1);
  const byChoice = Object.fromEntries(record.choices.map((choice, index) => [choice, record.choiceFeatures[index].f]));
  assert.deepEqual(byChoice, { 5: "k", 6: "6", 7: "7", 8: "8" });
});

test("templates without features get null choice features", () => {
  const record = S.instantiate(family({ correct: 1, wrong: [[2, "a"], [3, "b"], [4, "c"]] }), 0);
  assert.equal(record.choiceFeatures, null);
});

test("a modelled mistake that equals the key is counted", () => {
  const record = S.instantiate(family({ correct: 4, wrong: [[4, "same as key"], [2, "a"], [4, "again"], [3, "b"], [5, "c"], [4, "spare, never read"]] }), 0);
  assert.equal(record.keyEqualDistractors, 2);
  assert.deepEqual(record.choices.slice().sort(), ["2", "3", "4", "5"]);
  assert.equal(record.distractorRationales.every((entry) => entry.reason !== "same as key"), true);
});

test("an exact fraction key passes through as the numeric answer", () => {
  const record = S.instantiate(family({ numeric: true, correct: S.frac(-14, 6) }), 0);
  assert.equal(record.correctAnswer, "-7/3");
  assert.equal(record.choices, null);
  assert.equal(record.choiceFeatures, null);
  assert.equal(record.keyEqualDistractors, 0);
  assert.equal(S.instantiate(family({ numeric: true, correct: "7/3" }), 0).correctAnswer, "7/3");
});
