"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../src/lib/families/shared");
const { pairCredit } = require("../tools/lib/tells");
const families = [
  ...require("../src/lib/families/sat/math/algebra/linear-equations-in-one-variable"),
  ...require("../src/lib/families/sat/math/algebra/systems-of-two-linear-equations"),
  ...require("../src/lib/families/sat/math/algebra/linear-inequalities"),
  ...require("../src/lib/families/sat/math/algebra/linear-functions"),
];

function draw(id, seed) {
  return S.instantiate(families.find((family) => family.id === id), seed);
}

// A separate display evaluator, not the family compiler or its verify().
// Only arithmetic, parentheses, and the supplied single-letter variables
// are accepted. Juxtaposition denotes multiplication in these templates.
function evaluate(text, values = {}) {
  let source = String(text).replaceAll("−", "-").replace(/(?<=\d),(?=\d{3}(?:\D|$))/g, "");
  const tokens = source.match(/\d+(?:\.\d+)?|[A-Za-z]|[()+*/.\-]/g) || [];
  assert.equal(tokens.join(""), source.replace(/\s/g, ""));
  for (const token of tokens) {
    if (/^[A-Za-z]$/.test(token)) assert.ok(Object.hasOwn(values, token), `unknown variable ${token}`);
  }
  source = source.replace(/([\d.)])(?=[A-Za-z(])/g, "$1*")
    .replace(/([A-Za-z)])(?=[A-Za-z(\d])/g, "$1*");
  return Function(...Object.keys(values), `return (${source})`)(...Object.values(values));
}

function difference(equation, values) {
  const [left, right] = equation.split(" = ");
  return evaluate(left, values) - evaluate(right, values);
}

function coefficients(equation, constants = {}) {
  const at = (x, y) => difference(equation, { ...constants, x, y });
  const offset = at(0, 0);
  return [at(1, 0) - offset, at(0, 1) - offset, -offset];
}

function answer(question) {
  return evaluate(question.choices ? question.choices[question.correctAnswer] : question.correctAnswer);
}

function near(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 1e-7, `${label}: ${actual} != ${expected}`);
}

function checkChoices(question, expected) {
  near(answer(question), expected, `${question.templateId}/${question.seed}`);
  if (!question.choices) return;
  assert.equal(question.choices.filter((choice) => Math.abs(evaluate(choice) - expected) < 1e-7).length, 1);
  // These repaired templates must not let a look-alike pair narrow the key.
  assert.equal(pairCredit(question.choices, question.correctAnswer), 0.25);
}

const seeds = Array.from({ length: 200 }, (_, index) => index < 100
  ? String(index) : `${index.toString(36)}.algebra-review.${index % 36}`);

test("expression answers and neutral sign pairs follow the displayed equation", () => {
  for (const seed of seeds) {
    const question = draw("linear-expression-from-equation", seed);
    const equation = question.stimulus?.content || question.stem.match(/^If (.*), what/)[1];
    const offset = difference(equation, { x: 0 });
    const slope = difference(equation, { x: 1 }) - offset;
    assert.notEqual(slope, 0);
    const expression = question.stem.match(/value of (.*)\?$/)[1];
    checkChoices(question, evaluate(expression, { x: -offset / slope }));
  }
});

test("parameter systems have exactly the stated solution count", () => {
  for (const seed of seeds) {
    const question = draw("system-parameter-solution-count", seed);
    const [first, second] = question.stimulus.content.split("\n");
    const [A, B, C] = coefficients(first);
    if (question.stem.includes("a + b")) {
      const D = evaluate(second.split(" = ")[1]);
      checkChoices(question, D * (A + B) / C);
    } else {
      const k = answer(question);
      const [D, E, F] = coefficients(second, { k });
      near(A * E - B * D, 0, seed);
      assert.ok(Math.abs(A * F - C * D) > 1e-7 || Math.abs(B * F - C * E) > 1e-7);
      const [D2, E2] = coefficients(second, { k: k + 1 });
      assert.ok(Math.abs(A * E2 - B * D2) > 1e-7);
      checkChoices(question, k);
    }
  }
});

test("coupled coefficients determine both constants across all four presentations", () => {
  const forms = new Set();
  for (const seed of seeds) {
    const question = draw("system-two-constants", seed);
    const equations = question.stimulus.content.split("\n");
    const sum = question.stem.includes("a + b");
    forms.add(`${equations[1].startsWith("ay =")}/${sum}`);
    const rows = (a) => equations.map((equation) => coefficients(equation, { a, b: 0 }));
    const determinant = (a) => {
      const [[A, B], [C, D]] = rows(a);
      return A * D - B * C;
    };
    const offset = determinant(0);
    const slope = determinant(1) - offset;
    assert.notEqual(slope, 0);
    near(determinant(10), offset + 10 * slope, seed);
    const a = -offset / slope;
    const [[A, B, C], [D, E]] = rows(a);
    assert.notEqual(A, 0);
    const b = C * D / A;
    near(A * E, B * D, seed);
    near(C * E, b * B, seed);
    checkChoices(question, sum ? a + b : a - b);
  }
  assert.equal(forms.size, 4, "both equation presentations and both requested combinations exercised");
});

test("parameter inequality extremes satisfy the original inequality and exclude the next bound", () => {
  for (const seed of seeds) {
    const question = draw("inequality-parameter-range", seed);
    const [left, relation, right] = question.stimulus.content.split(/ (≤|≥|<|>) /);
    const truth = (c, x) => {
      const gap = evaluate(left, { c, x }) - evaluate(right, { c, x });
      return relation === "≤" ? gap <= 1e-8 : relation === "≥" ? gap >= -1e-8
        : relation === "<" ? gap < -1e-8 : gap > 1e-8;
    };
    const wanted = question.stem.includes("all values");
    const works = (c) => [-1000, -13.25, 0, 38.8, 1000].every((x) => truth(c, x) === wanted);
    const value = answer(question);
    const direction = question.stem.includes("least") ? 1 : -1;
    assert.ok(works(value), seed);
    assert.ok(works(value + 3 * direction), seed);
    assert.ok(!works(value - (question.stem.includes("integer") ? 1 : 0.001) * direction), seed);
  }
});

test("literal rearrangements state the restrictions needed to divide by variable expressions", () => {
  let denominatorTargets = 0;
  let mixtures = 0;
  let harmonic = 0;
  for (const seed of seeds) {
    const question = draw("literal-equation-rearrange", seed);
    const [output, formula] = question.stimulus.content.split(" = ");
    const target = question.stem.match(/expresses (\w) in terms/)[1];
    const denominator = formula.match(/\/\(\d+([A-Za-z])\)$/)[1];
    if (target === denominator) {
      assert.ok(question.stem.includes(`If ${output} ≠ 0`), seed);
      denominatorTargets += 1;
    }
    const factor = draw("literal-equation-factor-target", seed);
    if (factor.stem.includes("expresses x in terms")) {
      const [symbol, right] = factor.stimulus.content.split(" = ");
      const added = right.match(/\+ ([\d.]+)x/)[1];
      assert.ok(factor.stem.includes(`If ${symbol} ≠ ${added}`), seed);
      mixtures += 1;
    } else {
      assert.ok(factor.stem.includes("All quantities in the formula are positive."), seed);
      harmonic += 1;
    }
  }
  assert.ok(denominatorTargets && mixtures && harmonic);
});

test("function graph labels stay on the canvas even when the old fallback lay off the graph", () => {
  for (const seed of ["m6z.linear-graph-transform-parameter.4", ...seeds]) {
    const question = draw("linear-graph-transform-parameter", seed);
    const svg = question.figure.svg;
    const label = svg.match(/<text([^>]*)>y = f\(x\)<\/text>/);
    assert.ok(label, seed);
    const x = Number(label[1].match(/ x="([^"]+)"/)[1]);
    const y = Number(label[1].match(/ y="([^"]+)"/)[1]);
    const width = Number(svg.match(/width="([^"]+)"/)[1]);
    const height = Number(svg.match(/height="([^"]+)"/)[1]);
    assert.ok(x > 60 && x < width - 60 && y > 20 && y < height - 20, seed);
  }
});
