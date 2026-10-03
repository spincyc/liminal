"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { shapeSignature } = require("../tools/check-difficulty");

function mathShape(stem) {
  return shapeSignature({ subskill: "inequalities", stem });
}

test("difficulty signatures distinguish compound and absolute-value inequalities", () => {
  // The reported ACT 0076/0136 collision: both previously became
  // 'inequalities|many integers x satisfy 3x'.
  assert.notEqual(
    mathShape("How many integers x satisfy −4 < 3x + 5 ≤ 10?"),
    mathShape("How many integers x satisfy |3x − 6| ≤ 12?"),
  );
  assert.equal(
    mathShape("How many integers x satisfy −4 < 3x + 5 ≤ 10?"),
    mathShape("How many integers x satisfy -8<7x+9<=20?"),
  );
  assert.equal(
    mathShape("How many integers x satisfy |3x − 6| ≤ 12?"),
    mathShape("How many integers x satisfy |7x-8|<=20?"),
  );
});

test("difficulty signatures preserve operators, grouping and number positions", () => {
  for (const [left, right] of [
    ["x + 2 = 3", "x - 2 = 3"],
    ["x * 2 = 3", "x / 2 = 3"],
    ["x < 2", "x > 2"],
    ["x < 2", "x ≤ 2"],
    ["x ≤ 2", "x ≥ 2"],
    ["x = 2", "x ≠ 2"],
    ["|x - 2| ≤ 3", "x - 2 ≤ 3"],
    ["(x + 2) / 3", "x + 2 / 3"],
    ["√(x + 2)", "x + 2"],
    ["x² + 2", "x + 2"],
    ["x₂ + 2", "x + 2"],
    ["20% of x", "20 of x"],
    ["2x + 3", "x + 3"],
    ["x / 2", "2 / x"],
  ]) {
    assert.notEqual(mathShape(left), mathShape(right), `${left} versus ${right}`);
  }
});

test("difficulty signatures ignore numerical variants and equivalent operator spelling", () => {
  for (const [left, right] of [
    ["Solve 3x + 5 = 10.", "Solve 17x + 25 = 100."],
    ["Solve 0.5x + 1,000 = 2,000.", "Solve .75x + 50 = 200."],
    ["Evaluate 3 × (4 − 2).", "Evaluate 7*(8-5)."],
    ["Evaluate 3 · 4 ÷ 2.", "Evaluate 7*8/5."],
    ["Solve x² + 3x ≠ 4.", "Solve x^2 + 7x != 8."],
    ["Find x₃ when x₃ ≥ 10.", "Find x_3 when x_3 >= 20."],
  ]) {
    assert.equal(mathShape(left), mathShape(right), `${left} versus ${right}`);
  }
});

test("difficulty signatures keep otherwise identical passage sets separate", () => {
  const base = {
    subskill: "transitions",
    stimulus: null,
    stem: "Which choice is best for underlined portion 3?",
    choices: ["NO CHANGE", "First", "Still", "Thus"],
  };
  const first = shapeSignature({ ...base, passageId: "act-english-p001" });
  const second = shapeSignature({ ...base, passageId: "act-english-p002" });

  assert.notEqual(first, second);
  assert.match(first, /^act-english-p001\|/);
});
