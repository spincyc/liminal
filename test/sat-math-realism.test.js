"use strict";

// Question types added in the 2026-10-16 realism change, rechecked from the
// displayed text alone (stem, stimulus, alt text and choices), independently
// of each template's own verify().

const test = require("node:test");
const assert = require("node:assert/strict");
const families = require("../src/lib/families/sat/math");
const { instantiate } = require("../src/lib/families/shared");
const { compileHard } = require("../src/lib/families/sat/math/algebra/common");

const seeds = Array.from({ length: 160 }, (_, index) => (index < 80 ? index : `realism.${index}.check`));

function draw(id, seed) {
  const family = families.find((entry) => entry.id === id);
  assert.ok(family, `missing template ${id}`);
  const question = instantiate(family, seed);
  assert.equal(question.verified, true, `${id} ${seed}`);
  return question;
}

const keyText = (q) => (q.choices ? q.choices[q.correctAnswer] : q.correctAnswer);
const number = (text) => Number(String(text).replace(/,/g, "").replace(/−/g, "-"));

// Real solutions of a displayed equation in x: "Zero", "Exactly one",
// "Exactly two" or "Infinitely many", from values of left − right.
function solutionCount(equation) {
  const [left, right] = equation.split(" = ").map(compileHard);
  const f = (x) => left({ x }) - right({ x });
  const c = f(0);
  const a = (f(1) + f(-1)) / 2 - c;
  const b = (f(1) - f(-1)) / 2;
  assert.ok(Math.abs(f(2) - (4 * a + 2 * b + c)) < 1e-9, `not quadratic: ${equation}`);
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) return "Exactly one";
    return Math.abs(c) < 1e-12 ? "Infinitely many" : "Zero";
  }
  const disc = b * b - 4 * a * c;
  return Math.abs(disc) < 1e-9 ? "Exactly one" : disc > 0 ? "Exactly two" : "Zero";
}

test("quadratic-solution-count keys match the discriminant of the displayed equation", () => {
  const wanted = { "no real solutions": "Zero", "exactly one real solution": "Exactly one", "two distinct real solutions": "Exactly two" };
  for (const seed of seeds) {
    const q = draw("quadratic-solution-count", seed);
    if (q.stimulus) {
      assert.equal(keyText(q), solutionCount(q.stimulus.content), `${seed}`);
      continue;
    }
    const asked = Object.keys(wanted).find((phrase) => q.stem.includes(phrase));
    assert.ok(asked, `${seed}: ${q.stem}`);
    const matching = q.choices.filter((choice) => solutionCount(choice) === wanted[asked]);
    assert.deepEqual(matching, [keyText(q)], `${seed}`);
  }
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"];

// The times on a line graph, rebuilt from the alt text's first and last labels.
function timesFrom(alt, count) {
  const [, first] = /axis, from (.+?) to /.exec(alt);
  if (/^\d{4}$/.test(first)) return Array.from({ length: count }, (_, i) => String(Number(first) + i));
  if (first.startsWith("week ")) return Array.from({ length: count }, (_, i) => `week ${Number(first.slice(5)) + i}`);
  return MONTHS.slice(MONTHS.indexOf(first), MONTHS.indexOf(first) + count);
}

test("line-graph-reading keys follow from the values the alt text lists", () => {
  for (const seed of seeds) {
    const q = draw("line-graph-reading", seed);
    const alt = q.figure.alt;
    const values = /The plotted values, in order, are ([^.]+)\./.exec(alt)[1].split(", ").map(number);
    const times = timesFrom(alt, values.length);
    const key = keyText(q);
    if (/consecutive/.test(q.stem)) {
      const rise = q.stem.includes("increase the most");
      const changes = values.slice(1).map((v, i) => (rise ? v - values[i] : values[i] - v));
      const best = Math.max(...changes);
      assert.equal(changes.filter((c) => c === best).length, 1, `${seed}: tie`);
      const i = changes.indexOf(best);
      assert.equal(key, `${times[i]} and ${times[i + 1]}`, `${seed}`);
    } else if (/For how many/.test(q.stem)) {
      const [, relation, level] = /(more|fewer|less) than ([\d,]+)/.exec(q.stem);
      const bar = number(level) / (/,000 visitors/.test(q.stem) ? 1000 : 1);
      const count = values.filter((v) => (relation === "more" ? v > bar : v < bar)).length;
      assert.equal(number(key), count, `${seed}`);
    } else {
      // The question is the last sentence; the first names the whole period.
      const question = q.stem.slice(q.stem.lastIndexOf(". ") + 2);
      const named = times.filter((time) => question.includes(` ${time} `) || question.includes(` ${time}?`));
      assert.equal(named.length, 2, `${seed}: ${question}`);
      const [a, b] = named.map((time) => times.indexOf(time)).sort((p, r) => p - r);
      assert.equal(number(key), Math.abs(values[b] - values[a]), `${seed}`);
    }
  }
});

test("population-density keys are the count over the area in the unit asked", () => {
  for (const seed of seeds) {
    const q = draw("population-density", seed);
    const key = number(keyText(q));
    const rectangle = /measures ([\d,]+) meters by ([\d,]+) meters/.exec(q.stem);
    const count = Number(/(?:has|are) ([\d,]+) (?:residents|deer|nesting)/.exec(q.stem)?.[1]?.replace(/,/g, ""));
    if (rectangle) {
      const km2 = (number(rectangle[1]) / 1000) * (number(rectangle[2]) / 1000);
      assert.ok(Math.abs(count / km2 - key) < 1e-6, `${seed}`);
      continue;
    }
    const [, given, unit] = /area of ([\d,.]+) square (miles|kilometers)/.exec(q.stem);
    const perMile = /per square mile/.test(q.stem);
    const area = number(given) * (unit === "miles" ? (perMile ? 1 : 2.56) : (perMile ? 1 / 2.56 : 1));
    if (Number.isFinite(count)) {
      assert.ok(Math.abs(count / area - key) < 1e-6, `${seed}`);
    } else {
      const density = number(/is ([\d,]+) [a-z ]+ per square/.exec(q.stem)[1]);
      assert.ok(Math.abs(density * area - key) < 1e-6, `${seed}`);
    }
  }
});
