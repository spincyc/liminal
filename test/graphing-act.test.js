"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBank } = require("../tools/lib/content");
const { parseXml } = require("../tools/lib/svg-tree");
const { figureProblems } = require("../tools/lib/tells");
const { sanitizeSvgTree } = require("../src/app/render");
const { reviseGraphs } = require("../tools/generators/generate-act-mathematics");
const { REVISIONS } = require("../tools/lib/math-graphs");

const bank = loadBank("act-mathematics");
const graphs = bank.filter((q) => q.figure);
const numeric = (text) => {
  const [n, d = 1] = String(text).replaceAll("−", "-").split("/").map(Number);
  return n / d;
};
const coordinates = (text) => [...text.matchAll(/\(([−\d.]+), ([−\d.]+)\)/g)]
  .map((m) => [numeric(m[1]), numeric(m[2])]);
const close = (actual, expected, message, tolerance = 1e-8) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);

// Recover each answer from the displayed information. These solutions neither
// call the builders nor use their verification records or numerical metadata.
function solve(question) {
  const alt = question.figure.alt;
  const points = coordinates(alt);
  const stem = question.stem;
  const family = question.tags.find((t) => t.startsWith("templateFamily:"));
  const lineThrough = ([x1, y1], [x2, y2]) => {
    const m = (y2 - y1) / (x2 - x1);
    return [m, y1 - m * x1];
  };
  if (family.includes("system-intersection")) {
    const [m, b] = lineThrough(points[0], points[1]);
    const [n, c] = lineThrough(points[2], points[3]);
    const x = (c - b) / (m - n);
    return /x-coordinate/.test(stem) ? x : m * x + b;
  }
  if (family.includes("slope-scaled")) return lineThrough(points[0], points[1])[0];
  if (family.includes("linear-equation")) {
    const matches = question.choices.filter((choice) => {
      const match = choice.match(/^y = ([−\d]*)x ([+−]) (\d+)$/);
      assert.ok(match, choice);
      const slope = match[1] === "" ? 1 : match[1] === "−" ? -1 : numeric(match[1]);
      const intercept = Number(match[3]) * (match[2] === "−" ? -1 : 1);
      return points.every(([x, y]) => slope * x + intercept === y);
    });
    assert.equal(matches.length, 1, question.id);
    return matches[0];
  }
  if (family.includes("quadratic-range")) {
    const sign = alt.includes("opening upward") ? "≥" : "≤";
    return `y ${sign} ${String(points[0][1]).replace("-", "−")}`;
  }
  if (family.includes("quadratic-zeros")) return Math.max(...points.filter(([, y]) => y === 0).map(([x]) => x));
  if (family.includes("combined-transformation")) {
    const match = stem.match(/g\(x\) = ([−\d]+)f\(x ([+−]) (\d+)\) \+ (\d+)/);
    assert.ok(match, stem);
    const [x, y] = points[1];
    const shiftedX = x - Number(match[3]) * (match[2] === "+" ? 1 : -1);
    return `(${shiftedX}, ${numeric(match[1]) * y + Number(match[4])})`.replaceAll("-", "−");
  }
  if (family.includes("x-intercept")) return points.find(([, y]) => y === 0)[0];
  if (family.includes("box-plot")) {
    const summary = alt.match(/from left to right, are ([\d, ]+);/)[1].split(", ").map(Number);
    return summary[3] - summary[1];
  }
  if (family.includes("bar-total")) return [...alt.matchAll(/[ABCD]: (\d+)/g)].reduce((sum, match) => sum + Number(match[1]), 0);
  if (family.includes("histogram")) {
    const classes = [...alt.matchAll(/(\d+)–(\d+): (\d+)/g)].map((match) => match.slice(1).map(Number));
    const ordered = classes.flatMap(([a, b, frequency]) => Array.from({ length: frequency }, () => [a, b]));
    const first = ordered[Math.floor((ordered.length - 1) / 2)];
    const second = ordered[Math.floor(ordered.length / 2)];
    assert.deepEqual(first, second, "both middle observations must share one class");
    return `${first[0]} ≤ t < ${first[1]}`;
  }
  if (family.includes("regression-prediction")) {
    const intercept = Number(alt.match(/crosses the y-axis at (\d+)/)[1]);
    const [x, y] = points.at(-1);
    const target = Number(stem.match(/after (\d+) training sessions/)[1]);
    return intercept + (y - intercept) / x * target;
  }
  if (family.includes("regression-residual")) {
    const [x, observed] = points.at(-3);
    const [m, b] = lineThrough(points.at(-2), points.at(-1));
    return observed - (m * x + b);
  }
  throw new Error(`Unreviewed graph design: ${family}`);
}

test("ACT graph revisions preserve IDs, taxonomy, key positions and all unrelated records", () => {
  assert.equal(graphs.length, 24);
  assert.equal(REVISIONS.length, 12);
  const revised = reviseGraphs(bank);
  assert.deepEqual(revised, bank, "the committed graph batch must be reproducible");
  bank.forEach((q, index) => {
    if (!q.figure) assert.equal(revised[index], q, `${q.id} should remain untouched`);
    for (const key of ["id", "domain", "skill", "subskill", "difficulty", "correctAnswer", "reviewStatus", "provenance"]) {
      assert.deepEqual(revised[index][key], q[key], `${q.id}: ${key}`);
    }
  });
  assert.deepEqual(reviseGraphs(revised), revised, "repeated application is idempotent");
});

test("all ACT graph keys are solved independently from their accessible displays", () => {
  graphs.forEach((question) => {
    const expected = solve(question);
    const correct = question.choices[question.correctAnswer];
    if (typeof expected === "number") {
      close(numeric(correct), expected, question.id);
      assert.equal(question.choices.filter((choice) => Math.abs(numeric(choice) - expected) < 1e-8).length, 1, question.id);
    } else assert.equal(correct, expected, question.id);
  });
});

const elements = (node) => [node, ...(node.children || []).flatMap(elements)].filter((n) => n.name);
const attributes = (node) => Object.fromEntries(node.attributes.map(({ name, value }) => [name, value]));
const contents = (node) => (node.children || []).map((n) => n.text || "").join("");

// Read the coordinate mapping from the rendered tick labels and axes. This
// catches wrong units, a flipped vertical transform, and a plotted dot that
// disagrees with the equivalent alternative text.
function readPlane(nodes) {
  const axes = nodes.filter((n) => n.name === "line" && attributes(n)["stroke-width"] === "1.5");
  const [xAxis, yAxis] = axes.slice(0, 2).map(attributes);
  const origin = [Number(yAxis.x1), Number(xAxis.y1)];
  const labels = nodes.filter((n) => n.name === "text" && attributes(n)["font-size"] === "12" && /^−?\d/.test(contents(n)));
  const xTick = labels.find((n) => attributes(n)["text-anchor"] === "middle");
  const yTick = labels.find((n) => attributes(n)["text-anchor"] === "end");
  const xUnit = (Number(attributes(xTick).x) - origin[0]) / numeric(contents(xTick));
  const yUnit = (origin[1] - Number(attributes(yTick).y)) / numeric(contents(yTick));
  return (x, y) => [(Number(x) - origin[0]) / xUnit, (origin[1] - Number(y)) / yUnit];
}

test("ACT plot geometry agrees with its complete alternative text and survives sanitizing", () => {
  graphs.forEach((question) => {
    assert.deepEqual(figureProblems(question.figure.svg, sanitizeSvgTree), [], question.id);
    assert.equal(question.figure.notToScale, false);
    const nodes = elements(parseXml(question.figure.svg));
    if (!question.figure.alt.startsWith("an xy-plane")) return;
    const fromPixels = readPlane(nodes);
    const described = coordinates(question.figure.alt);
    const dots = nodes.filter((n) => n.name === "circle").map(attributes);
    dots.forEach((dot) => {
      const [x, y] = fromPixels(dot.cx, dot.cy);
      assert.ok(described.some(([a, b]) => Math.abs(x - a) < 0.012 && Math.abs(y - b) < 0.012), `${question.id}: dot ${x},${y} absent from alt`);
    });
    const references = nodes.filter((n) => n.name === "rect" && attributes(n).width === "6").map(attributes);
    references.forEach((rect) => {
      const [x, y] = fromPixels(Number(rect.x) + 3, Number(rect.y) + 3);
      const labels = nodes.filter((n) => n.name === "text").flatMap((n) => coordinates(contents(n)));
      assert.ok(labels.some(([a, b]) => Math.abs(x - a) < 0.012 && Math.abs(y - b) < 0.012), `${question.id}: reference square needs its exact coordinate label`);
      const line = attributes(nodes.find((n) => n.name === "line" && attributes(n)["stroke-width"] === "2.25"));
      const [a, b] = fromPixels(line.x1, line.y1), [c, d] = fromPixels(line.x2, line.y2);
      close((x - a) * (d - b), (y - b) * (c - a), `${question.id}: reference square must lie on fitted line`, 0.12);
    });
    if (question.tags.some((tag) => /system-intersection|slope-scaled|linear-equation|x-intercept/.test(tag))) {
      const lines = nodes.filter((n) => n.name === "line" && attributes(n)["stroke-width"] === "2.25").map(attributes);
      lines.forEach((line, index) => {
        const [first, second] = described.slice(2 * index, 2 * index + 2);
        const [a, b] = fromPixels(line.x1, line.y1);
        const [c, d] = fromPixels(line.x2, line.y2);
        for (const [x, y] of [first, second]) close((x - a) * (d - b), (y - b) * (c - a), `${question.id}: line misses described point`, 0.12);
      });
    }
  });
});

test("ACT bar and histogram heights follow their stated numerical frequency scale", () => {
  graphs.filter((q) => /^(Bar graph|Histogram)/.test(q.figure.alt)).forEach((question) => {
    const nodes = elements(parseXml(question.figure.svg));
    const values = [...question.figure.alt.matchAll(/(?:[A-D]|\d+–\d+): (\d+)/g)].map((m) => Number(m[1]));
    const ticks = nodes.filter((n) => n.name === "text" && attributes(n)["text-anchor"] === "end");
    const zero = ticks.find((n) => contents(n) === "0");
    const top = ticks.at(-1);
    const bottomY = Number(attributes(zero).y);
    const unit = (bottomY - Number(attributes(top).y)) / Number(contents(top));
    const rects = nodes.filter((n) => n.name === "rect").map(attributes);
    assert.equal(rects.length, values.length);
    rects.forEach((rect, index) => {
      close(Number(rect.height) / unit, values[index], question.id);
      close(Number(rect.y) + Number(rect.height), bottomY, question.id);
      if (question.figure.alt.startsWith("Histogram") && index > 0) close(Number(rects[index - 1].x) + Number(rects[index - 1].width), Number(rect.x), "histogram classes must touch");
    });
  });
});
