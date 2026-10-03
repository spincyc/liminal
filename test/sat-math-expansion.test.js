"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const families = require("../src/lib/families/sat/math");
const { instantiate } = require("../src/lib/families/shared");

function question(id, seed) {
  const family = families.find((entry) => entry.id === id);
  assert.ok(family, `missing template ${id}`);
  const result = instantiate(family, seed);
  assert.equal(result.verified, true);
  return result;
}

function answer(q) {
  return q.choices ? q.choices[q.correctAnswer] : q.correctAnswer;
}

test("an odd root and negative divisor preserve an exact repeating grid-in", () => {
  const q = question("signed-cube-root-value", 46);
  assert.equal(q.stimulus.content, "(³√(−8))/(−11)");
  assert.equal(q.responseType, "numeric");
  assert.equal(answer(q), "2/11");
});

test("a squared polynomial's root condition selects the signed cross contribution", () => {
  const q = question("quadratic-square-coefficient", 12);
  assert.equal(q.stimulus.content, "p(x) = 4x⁴ − 28x³ + kx² + mx + 49");
  assert.match(q.stem, /exactly two distinct real solutions/);
  // The square can use c = ±7. Only 2x² − 7x − 7 has real zeros:
  // its discriminant is 105; the positive-constant alternative has -7.
  assert.equal((-7) ** 2 - 4 * 2 * -7, 105);
  assert.equal((-7) ** 2 - 4 * 2 * 7, -7);
  // Two real zeros do not force a negative middle quartic coefficient.
  assert.equal(answer(q), "21");
});

test("containment excludes a parameter whose closed endpoint violates a strict bound", () => {
  const q = question("inequality-solution-containment", 47);
  assert.equal(q.stimulus.content, "(3 − k)x ≤ −6k + 10");
  // At k = 7, x = 8 solves the original inequality but fails x > 8.
  assert.equal((3 - 7) * 8, -6 * 7 + 10);
  // At k = 3 the inequality is 0 ≤ -8, so its solution set is empty.
  assert.ok(-6 * 3 + 10 < 0);
  // Only k = 4, 5, 6 give a lower endpoint strictly greater than 8.
  assert.deepEqual([4, 5, 6].map((k) => (-6 * k + 10) / (3 - k)), [14, 10, 26 / 3]);
  assert.equal(answer(q), "3");
});

test("a two-branch system counts a shared ordered pair only once", () => {
  const q = question("system-branch-overlap-parameter", 13);
  assert.equal(q.stimulus.content, "y = −x² − 6x + k\nxy = −6y − 11x − 66");
  // The second equation is (x + 6)(y + 11) = 0. The parabola
  // always meets x = -6; solve its intersections with y = -11.
  const count = (k) => {
    const d = 36 + 4 * (k + 11);
    const xs = [-6];
    if (d >= 0) xs.push((-6 + Math.sqrt(d)) / 2, (-6 - Math.sqrt(d)) / 2);
    return new Set(xs).size;
  };
  assert.equal(count(-20), 2); // tangent to the horizontal branch
  assert.equal(count(-11), 2); // secant, with one point shared by both branches
  assert.equal(count(-21), 1);
  assert.equal(count(-19), 3);
  assert.equal(answer(q), "−31");
});

test("a conditional upper bound gives an attainable lower bound for the complementary outcome", () => {
  const q = question("probability-mixture-bound", 28);
  assert.match(q.stimulus.content, /7\/8/);
  assert.match(q.stem, /is at most 35\/47/);
  let equalityWitness = false;
  for (let i = 1; i <= 14; i += 1) for (let j = 1; j <= 14; j += 1) {
    const completedA = 7 * i;
    const completedB = 3 * j;
    if (47 * completedA > 35 * (completedA + completedB)) continue;
    const failed = i + 5 * j;
    const total = 8 * (i + j);
    assert.ok(72 * failed >= 25 * total);
    if (72 * failed === 25 * total) equalityWitness = true;
  }
  assert.ok(equalityWitness);
  assert.equal(answer(q), "25/72");
});

test("equal box volumes reject a positive sheet size that leaves a negative base", () => {
  const q = question("equal-volume-folded-boxes", 91);
  assert.match(q.stem, /side length 1\.5 millimeters/);
  assert.match(q.stem, /side length 13\.5 millimeters/);
  // Both sheet sizes solve the volume equation after squaring the bases.
  for (const side of [21, 39]) assert.equal(1.5 * (side - 3) ** 2, 13.5 * (side - 27) ** 2);
  assert.ok(21 - 27 < 0);
  assert.ok(39 - 27 > 0);
  assert.equal(answer(q), "1,944");
});

test("a shifted decreasing exponential uses output differences and input spacing", () => {
  const q = question("shifted-exponential-recovery", 4);
  assert.equal(q.stimulus.content, "x | f(x)\n−1 | −6\n1 | −102\n3 | −966");
  const ratioOfDifferences = (-966 + 102) / (-102 + 6);
  assert.equal(ratioOfDifferences, 9); // b² for the two-unit spacing
  const base = Math.sqrt(ratioOfDifferences);
  const coefficient = (-102 + 6) / ((base ** -1) * (base ** 2 - 1));
  assert.equal(coefficient, -36);
  assert.equal(answer(q), "−36");
});

test("every transformed-quadratic draw requires a vertex value omitted from its table", () => {
  const forms = new Set();
  for (let seed = 0; seed < 100; seed += 1) {
    const q = question("function-transformation-table", seed);
    const rows = q.stimulus.content.split("\n").slice(1).map((row) => row.split(" | ").map((n) => Number(n.replace(/−/g, "-"))));
    const equalPair = rows.flatMap((row, i) => rows.slice(i + 1).filter((next) => next[1] === row[1]).map((next) => [row, next]))[0];
    assert.ok(equalPair, "table must supply symmetry evidence");
    const axis = (equalPair[0][0] + equalPair[1][0]) / 2;
    assert.ok(rows.every(([x]) => x !== axis), "a listed vertex would make the value a lookup");
    if (q.stem.includes("r + s")) forms.add("coordinate sum");
    else {
      assert.match(q.stem, /minimum value of g\(x\)/);
      forms.add("minimum value");
    }
  }
  assert.deepEqual([...forms].sort(), ["coordinate sum", "minimum value"]);
});

test("confined quadratic zeros exclude repeated roots, endpoint equality, and exterior roots", () => {
  const q = question("quadratic-zeros-in-interval", 72);
  assert.equal(q.stimulus.content, "f(x) = x^2 − 2kx − 33k − 162");
  assert.match(q.stem, /greater than −18 and less than 8/);
  const roots = (k) => {
    const radicand = k * k + 33 * k + 162;
    return radicand < 0 ? null : [k - Math.sqrt(radicand), k + Math.sqrt(radicand)];
  };
  assert.deepEqual(roots(-6), [-6, -6]); // One repeated root is insufficient.
  assert.deepEqual(roots(-2), [-12, 8]); // Equality with the upper endpoint is excluded.
  assert.ok(roots(-28)[1] < -18); // Real roots and positive endpoint values alone are insufficient.
  const allowed = [];
  // The average of two roots inside this interval must itself lie inside.
  for (let k = -17; k < 8; k += 1) {
    const pair = roots(k);
    if (pair && pair[0] !== pair[1] && pair[0] > -18 && pair[1] < 8) allowed.push(k);
  }
  assert.deepEqual(allowed, [-5, -4, -3]);
  assert.equal(answer(q), "3");
});
