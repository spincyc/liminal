"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../src/lib/families/shared");
const families = require("../src/lib/families/sat/math")
  .filter((family) => family.domain === "Problem-Solving and Data Analysis");
const seeds = Array.from({ length: 200 }, (_, i) => i < 100 ? i : `data-review.${i}.alternate`);
const draw = (id, seed) => S.instantiate(families.find((family) => family.id === id), seed);
const clean = (value) => String(value).replaceAll(",", "").replaceAll("−", "-");
const answer = (q) => q.choices ? q.choices[q.correctAnswer] : q.correctAnswer;
const number = (value) => {
  const [n, d = 1] = clean(value).replace(/[$%\s]/g, "").split("/").map(Number);
  return n / d;
};
const close = (a, b) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
const table = (q) => q.stimulus.content.split("\n").map((row) => row.split(" | "));
function checkNumber(q, expected) {
  assert.ok(close(number(answer(q)), expected), `${q.familyId}/${q.seed}: ${answer(q)} != ${expected}`);
  if (q.choices) assert.equal(q.choices.filter((choice) => close(number(choice), expected)).length, 1);
}
function line(q) {
  const [, m, sign, b] = clean(q.stem).match(/y = (-?[\d.]+)x ([+-]) ([\d.]+)/);
  return (x) => +m * x + (sign === "-" ? -b : +b);
}
// Recover observations from the rendered plot, independently of generator parameters.
function points(q) {
  const alt = clean(q.figure.alt);
  const xMax = +(alt.match(/x from 0 to (\d+) on the horizontal axis/) || alt.match(/horizontal axis[^\d]*0 to (\d+)/))[1];
  const yMax = +(alt.match(/y from 0 to (\d+) on the vertical axis/) || alt.match(/vertical axis[^\d]*0 to (\d+)/))[1];
  const grouped = q.familyId === "two-group-fit-lines";
  const bottom = grouped ? 260 : 232;
  const values = [...q.figure.svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"/g)]
    .filter((match) => +match[2] >= (grouped ? 44 : 16))
    .map((match) => [(+match[1] - 66) * xMax / 316, (bottom - +match[2]) * yMax / 216]);
  return { values, xTolerance: xMax / 316 * 0.051, yTolerance: yMax / 216 * 0.051 };
}

test("residual questions use the displayed model and have points on both sides", () => {
  for (const seed of [...seeds, 101]) {
    const q = draw("residual-actual-predicted", seed);
    const rows = table(q);
    const predict = line(q);
    let expected;
    if (rows[0].length === 2) {
      const actual = rows.slice(1).map(([x, residual]) => predict(number(x)) + number(residual));
      const extreme = q.stem.includes("greatest") ? Math.max(...actual) : Math.min(...actual);
      expected = `x = ${rows[actual.indexOf(extreme) + 1][0]}`;
    } else {
      const residuals = rows.slice(1).map(([, x, y]) => number(y) - predict(number(x)));
      assert.ok(residuals.some((r) => r < 0) && residuals.some((r) => r > 0), `${seed}: missing requested side`);
      const extreme = q.stem.includes("farthest below") ? Math.min(...residuals) : Math.max(...residuals);
      const name = rows[residuals.indexOf(extreme) + 1][0];
      expected = rows[0][0] === "Student" ? name : `${rows[0][0]} ${name}`;
    }
    assert.equal(answer(q), expected, String(seed));
    assert.equal(q.choices.filter((choice) => choice === expected).length, 1);
  }
});

test("rendered count observations are whole and battery percentages are bounded", () => {
  let employees = 0;
  let batteries = 0;
  for (const id of ["best-fit-line-equation", "scatterplot-shape-and-count", "scatterplot-fit-reading",
    "outlier-removal-fit", "two-group-fit-lines", "exponential-fit-interpretation"]) {
    for (const seed of [...seeds, 153]) {
      const q = draw(id, seed);
      if (!q.figure) continue;
      const { values, xTolerance, yTolerance } = points(q);
      assert.ok(values.length);
      if (q.figure.alt.includes("number of employees")) {
        employees++;
        for (const [x] of values) assert.ok(Math.abs(x - Math.round(x)) <= xTolerance + 1e-8, `${id}/${seed}: fractional employee`);
      }
      if (q.figure.alt.includes("battery charge")) {
        batteries++;
        for (const [, y] of values) assert.ok(y >= -yTolerance && y <= 100 + yTolerance, `${id}/${seed}: battery charge ${y}`);
      }
    }
  }
  assert.ok(employees > 30 && batteries > 5);
});

test("hollow cube dimensions follow displayed density, mass and cavity ratio", () => {
  for (const seed of seeds) {
    const q = draw("density-cube-edge", seed);
    const stem = clean(q.stem);
    const density = +stem.match(/density ([\d.]+)/)[1];
    const mass = +stem.match(/mass of ([\d.]+)/)[1];
    const ratio = number(stem.match(/length is ([\d/]+)/)[1]);
    const materialVolume = mass / density * (stem.includes("grams per cubic centimeter") ? 1000 : 1e6);
    const outerEdge = Math.cbrt(materialVolume / (1 - ratio ** 3));
    checkNumber(q, stem.includes("six exterior faces") ? 6 * outerEdge ** 2 : outerEdge);
  }
});

test("affine model percentage changes determine a unique actual area", () => {
  for (const seed of seeds) {
    const q = draw("fit-slope-rescaled-units", seed);
    const predict = line(q);
    const [inputChange, outputChange] = [...q.stem.matchAll(/(\d+)%/g)].map((match) => +match[1] / 100);
    const candidates = [];
    for (let area = 1; area <= 10000; area++) {
      if (close(predict(area / 100 * (1 + inputChange)) / predict(area / 100), 1 + outputChange)) candidates.push(area);
    }
    assert.equal(candidates.length, 1, String(seed));
    checkNumber(q, q.stem.includes("How many more") ? candidates[0] * inputChange : candidates[0]);
  }
});

test("survey planning chooses the minimum invitations meeting the stated interval width", () => {
  for (const seed of seeds) {
    const q = draw("margin-sample-size-scaling", seed);
    const stem = clean(q.stem);
    const n = +stem.match(/with (\d+) completed/)[1];
    const margin = +stem.match(/margin of error of ([\d.]+)/)[1];
    const width = +stem.match(/width of at most ([\d.]+)/)[1];
    const rate = +stem.match(/modeled as (\d+)%/)[1] / 100;
    // Search the actual constraint, rather than reproducing the generator's inversion.
    let low = 1;
    let high = 100000;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (2 * margin * Math.sqrt(n / (mid * rate)) <= width + 1e-10) high = mid;
      else low = mid + 1;
    }
    const cost = stem.match(/fixed cost of \$(\d+) plus \$(\d+)/);
    checkNumber(q, cost ? +cost[1] + +cost[2] * low : low);
  }
});

test("missing frequencies and reordered corrections determine the median", () => {
  for (const seed of seeds) {
    const q = draw("extreme-value-correction", seed);
    const rows = table(q).slice(1);
    const mean = +q.stem.match(/original data is ([\d.]+)\./)[1];
    const [, old, replacement] = q.stem.match(/recorded as (\d+) was incorrect and is replaced by ([\d.]+)/);
    const possibilities = [];
    for (let count = 1; count <= 100; count++) {
      const data = rows.flatMap(([value, frequency]) => Array(frequency === "x" ? count : +frequency).fill(+value));
      if (!close(data.reduce((a, b) => a + b, 0) / data.length, mean)) continue;
      const index = data.indexOf(+old);
      assert.notEqual(index, -1);
      data[index] = +replacement;
      data.sort((a, b) => a - b);
      const n = data.length;
      possibilities.push(n % 2 ? data[(n - 1) / 2] : (data[n / 2 - 1] + data[n / 2]) / 2);
    }
    assert.equal(possibilities.length, 1, String(seed));
    checkNumber(q, possibilities[0]);
  }
});

test("reverse conditional probabilities weight the two displayed source populations", () => {
  for (const seed of seeds) {
    const q = draw("conditional-two-way", seed);
    const [share, firstRate, secondRate] = [...q.stem.matchAll(/(\d+)%/g)].map((match) => +match[1] / 100);
    const condition = q.stem.split(" If ")[1].split(" is selected")[0];
    const complement = /not defective|on time|not commute|did not sprout/.test(condition);
    const first = /machine P|by ground|in the city|supplier A/.test(q.stem.split("probability that ")[1]);
    const a = share * (complement ? 1 - firstRate : firstRate);
    const b = (1 - share) * (complement ? 1 - secondRate : secondRate);
    checkNumber(q, (first ? a : b) / (a + b));
  }
});

test("causal conclusions and population scope match the actual study design and evidence", () => {
  const cases = new Set();
  for (const seed of seeds) {
    const q = draw("experiment-scope-grid", seed);
    const assigned = /Half of (them|the volunteers), chosen at random/.test(q.stem);
    const sampled = /selected \d+.*? at random/.test(q.stem.split(".")[0]);
    cases.add(`${sampled}/${assigned}`);
    // A randomized design alone cannot establish that the observed effect is nonzero.
    assert.match(q.stem, /observed difference is unlikely to be due to chance alone/);
    assert.equal(String(answer(q)).startsWith("Evidence suggests that"), assigned);
    assert.equal(String(answer(q)).includes("it generalizes to"), sampled);
    const supported = q.choices.filter((choice) => choice.startsWith("Evidence suggests that") === assigned &&
      choice.includes("it generalizes to") === sampled);
    assert.equal(supported.length, 1);
  }
  assert.equal(cases.size, 4);
});
