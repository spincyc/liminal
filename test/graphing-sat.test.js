"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const families = require("../src/lib/families/sat/math");
const { instantiate } = require("../src/lib/families/shared");

const number = (text) => Number(text.replace(/−/g, "-"));
const template = (id) => families.find((family) => family.id === id);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.04, `${actual} differs from ${expected}`);

// Read rendered geometry using its displayed coordinate bounds and axes,
// independent of the template's hidden numerical parameters.
function graphData(q) {
  const bounds = q.figure.alt.match(/x from ([−\d]+) to ([−\d]+) and [yr] from ([−\d]+) to ([−\d]+)/).slice(1).map(number);
  const axes = [...q.figure.svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke="currentColor" stroke-width="1.5"/g)].slice(0, 2).map((m) => m.slice(1).map(Number));
  const [xMin, xMax, yMin, yMax] = bounds;
  const [horizontal, vertical] = axes;
  const pxMin = horizontal[0];
  const pxMax = horizontal[2] - 8;
  const pyMin = vertical[1];
  const pyMax = vertical[3] + 8;
  const fromPixels = (x, y) => [xMin + (x - pxMin) * (xMax - xMin) / (pxMax - pxMin), yMin + (pyMin - y) * (yMax - yMin) / (pyMin - pyMax)];
  const dots = [...q.figure.svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="4"/g)].map((m) => fromPixels(Number(m[1]), Number(m[2])));
  const curves = [...q.figure.svg.matchAll(/<polyline points="([^"]+)"/g)].flatMap((m) => m[1].split(" ").map((pair) => fromPixels(...pair.split(",").map(Number))));
  return { bounds, dots, curves };
}

test("quadratic graph questions require reconstruction beyond the plotted height", () => {
  const branches = new Set();
  for (let seed = 0; seed < 120; seed += 1) {
    const q = instantiate(template("graph-quadratic-level"), seed);
    assert.equal(q.verified, true);
    assert.equal(q.stimulus, null);
    const points = [...q.figure.alt.matchAll(/\(([−\d]+), ([−\d]+)\)/g)].map((m) => m.slice(1).map(number));
    const [[h, k], [x, y]] = points;
    const graph = graphData(q);
    graph.dots.forEach((dot, i) => dot.forEach((value, axis) => near(value, points[i][axis])));
    const a = (y - k) / (x - h) ** 2;
    const level = number(q.stem.match(/f\(x\) = ([−\d]+)/)[1]);
    assert.ok(level < graph.bounds[2] || level > graph.bounds[3]);
    const displacement = Math.sqrt((level - k) / a);
    const larger = q.stem.includes("larger");
    assert.equal(number(q.correctAnswer), h + (larger ? displacement : -displacement));
    branches.add(`${a > 0 ? "up" : "down"}/${larger ? "larger" : "smaller"}`);
  }
  assert.equal(branches.size, 4);
});

test("polynomial graph sign regions distinguish touching zeros and strict endpoints", () => {
  const branches = new Set();
  let sawTouchInside = false;
  for (let seed = 0; seed < 120; seed += 1) {
    const q = instantiate(template("graph-polynomial-sign-integers"), seed);
    assert.equal(q.verified, true);
    const touch = number(q.figure.alt.match(/touches the x-axis at \(([−\d]+), 0\)/)[1]);
    const cross = number(q.figure.alt.match(/crosses the x-axis at \(([−\d]+), 0\)/)[1]);
    const rightSign = q.figure.alt.includes("rises to the right") ? 1 : -1;
    const [, lowText, highText, relation] = q.stem.match(/([−\d]+) ≤ x ≤ ([−\d]+) and f\(x\) ([<>≤≥]) 0/);
    const lower = number(lowText);
    const upper = number(highText);
    const includeZero = ["≤", "≥"].includes(relation);
    const positive = [">", "≥"].includes(relation);
    const values = [];
    for (let x = lower; x <= upper; x += 1) {
      const sign = x === touch || x === cross ? 0 : rightSign * Math.sign(x - cross);
      if (sign === 0 ? includeZero : (sign > 0) === positive) values.push(x);
    }
    const sum = q.stem.includes("sum");
    assert.equal(number(q.correctAnswer), sum ? values.reduce((a, b) => a + b, 0) : values.length);
    // Rendered samples must be on the same side of the axis as the alt text.
    for (const [x, y] of graphData(q).curves) {
      if (Math.abs(y) > 0.05 && Math.abs(x - cross) > 0.05) assert.equal(Math.sign(y), rightSign * Math.sign(x - cross));
    }
    if (touch >= lower && touch <= upper) sawTouchInside = true;
    branches.add(`${relation}/${sum}`);
  }
  assert.equal(branches.size, 8);
  assert.ok(sawTouchInside);
});

test("residual plot answers reconstruct observed values from rendered dots", () => {
  const branches = new Set();
  for (let seed = 0; seed < 120; seed += 1) {
    const q = instantiate(template("residual-plot-reconstruction"), seed);
    assert.equal(q.verified, true);
    assert.equal(q.stimulus, null);
    const [, sign, coefficient, operator, intercept] = q.stem.match(/y = (−?)(\d*)x ([+−]) (\d+)\./);
    const m = (sign ? -1 : 1) * Number(coefficient || 1);
    const b = (operator === "−" ? -1 : 1) * Number(intercept);
    const dots = graphData(q).dots;
    const inputs = [...q.stem.matchAll(/observed value of y at x = (\d+)/g)].map((match) => Number(match[1]));
    const actual = (x) => {
      const point = dots.find(([input]) => Math.abs(input - x) < 0.01);
      assert.ok(point, `missing plotted input ${x}`);
      branches.add(point[1] > 0 ? "positive residual" : "negative residual");
      return m * x + b + point[1];
    };
    assert.ok(inputs.length === 1 || inputs.length === 2);
    near(number(q.correctAnswer), inputs.length === 1 ? actual(inputs[0]) : actual(inputs[0]) - actual(inputs[1]));
    branches.add(inputs.length === 1 ? "single" : "difference");
  }
  assert.equal(branches.size, 4);
});

test("quadratic coordinates occupy a separate legend below the graph", () => {
  for (const seed of ["graph-review-0", "graph-review-1", "graph-review-2", 0]) {
    const q = instantiate(template("graph-quadratic-level"), seed);
    const labels = [...q.figure.svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]+)<\/text>/g)];
    const coordinates = labels.filter((match) => /^[AB] \(/.test(match[3]));
    assert.equal(coordinates.length, 2);
    const graphBottom = Math.max(...labels.filter((match) => !/^[AB] \(/.test(match[3])).map((match) => Number(match[2])));
    assert.ok(coordinates.every((match) => Number(match[2]) > graphBottom + 15));
    assert.equal(labels.filter((match) => /^[AB]$/.test(match[3])).length, 2);
  }
});

test("single-count teaching text uses singular units", () => {
  const count = instantiate(template("graph-polynomial-sign-integers"), "graph-review-4");
  assert.equal(count.correctAnswer, "1");
  assert.match(count.solutionSteps.join(" "), /the qualifying integer is/);
  assert.match(count.solutionSteps.at(-1), /There is 1 qualifying integer\./);
  const growth = instantiate(template("exponential-rewrite"), "graph-review-1");
  assert.ok(growth.solutionSteps.some((step) => step.startsWith("Over 1 year ")));
});
