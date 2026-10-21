"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../src/lib/families/shared");
const { lineCoefficients } = require("../src/lib/families/sat/math/algebra/common");
const family = require("../src/lib/families/sat/math/algebra/systems-of-two-linear-equations")
  .find((entry) => entry.id === "system-intersection-region");

const number = (text) => {
  const [top, bottom = "1"] = String(text).replaceAll("−", "-").split("/");
  return Number(top) / Number(bottom);
};
const seeds = [943, ...Array.from({ length: 300 }, (_, i) => i),
  ...Array.from({ length: 300 }, (_, i) => `${i.toString(36)}.${family.id}.${i % 36}`)];

// Read the displayed restrictions and solve the displayed lines directly.
// No access to build's hidden segment endpoints or parameter-range formula.
function read(question) {
  const [fixed, turning] = question.stimulus.content.split("\n");
  const [A, B, C] = lineCoefficients(fixed);
  const q = number(turning.match(/kx ([+−]) (\d+)/).slice(1).join("").replace("+", ""));
  const [, xSign, xText, ySign, yText] = question.stem.match(/If a ([<>]) (−?[\d.]+) and b ([<>]) (−?[\d.]+),/);
  const xBound = number(xText);
  const yBound = number(yText);
  const yAt = (x) => (C - A * x) / B;
  const testX = (x) => xSign === ">" ? x > xBound : x < xBound;
  const testY = (y) => ySign === ">" ? y > yBound : y < yBound;
  const at = (k) => {
    if (A + B * k === 0) return null;
    const x = (C - B * q) / (A + B * k);
    return [testX(x), testY(k * x + q)];
  };
  const otherX = (C - B * yBound) / A;
  return { fixed, at, xBound, otherX, yAt, testX, testY };
}

test("Hard intersection regions require two independent coordinate restrictions", () => {
  const coverage = new Map();
  for (const seed of seeds) {
    const question = S.instantiate(family, seed);
    const r = read(question);
    assert.equal(question.verified, true, `seed ${seed}`);
    const [low, high] = [r.xBound, r.otherX].sort((a, b) => a - b);
    assert.ok(low * high > 0, `segment stays on one side of pivot: ${seed}`);
    const inside = (x) => r.testX(x) && r.testY(r.yAt(x));
    assert.equal(inside((low + high) / 2), true);
    assert.equal(inside(low), false, `strict lower bound: ${seed}`);
    assert.equal(inside(high), false, `strict upper bound: ${seed}`);
    const outside = [low - 1, high + 1].map((x) => [r.testX(x), r.testY(r.yAt(x))]);
    assert.ok(outside.some(([x, y]) => x && !y), `y restriction adds demand: ${seed}`);
    assert.ok(outside.some(([x, y]) => !x && y), `x restriction adds demand: ${seed}`);
    const variant = `${question.responseType}:${r.fixed.startsWith("y =") ? "slope" : "standard"}:${Math.sign(low)}:${r.xBound === low ? "lower" : "upper"}`;
    coverage.set(variant, (coverage.get(variant) || 0) + 1);
  }
  assert.equal(coverage.size, 16);
  assert.ok([...coverage.values()].every((count) => count >= 3));
});

test("choices require both restrictions and numeric counts use both open bounds", () => {
  for (const seed of seeds) {
    const question = S.instantiate(family, seed);
    const { at } = read(question);
    if (question.responseType === "multiple-choice") {
      const conditions = question.choices.map((choice) => at(number(choice)));
      const feasible = conditions.map((pair, index) => pair && pair.every(Boolean) ? index : -1).filter((index) => index >= 0);
      assert.deepEqual(feasible, [question.correctAnswer], `unique key: ${seed}`);
      assert.ok(conditions.some((pair) => pair && pair[0] && !pair[1]), `cannot ignore b: ${seed}`);
      assert.ok(conditions.some((pair) => pair && !pair[0] && pair[1]), `cannot ignore a: ${seed}`);
    } else {
      assert.match(question.stem, /how many integer values of k/);
      const counts = [0, 0, 0];
      for (let k = -100; k <= 100; k += 1) {
        const pair = at(k);
        if (!pair) continue;
        if (pair[0]) counts[0] += 1;
        if (pair[1]) counts[1] += 1;
        if (pair.every(Boolean)) counts[2] += 1;
      }
      assert.equal(number(question.correctAnswer), counts[2], `integer count: ${seed}`);
      assert.ok(counts[2] >= 2, `more than a lone candidate: ${seed}`);
      assert.ok(counts[0] > counts[2] && counts[1] > counts[2], `both bounds change count: ${seed}`);
    }
  }
});
