"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { SHAPES } = require("../tools/generators/generate-act-mathematics");

// Read the displayed answer, independently of its internal numeric metadata.
function numberFromAnswer(raw) {
  // Numeric answer primitives are displayed to three decimal places by toChoice.
  const text = (typeof raw === "object" ? raw.text : String(typeof raw === "number" ? Math.round(raw * 1000) / 1000 : raw))
    .replaceAll("−", "-").replace("°", "").replace("$", "");
  const match = text.match(/^(-?\d+(?:\.\d+)?)(π)?(?:\/(\d+))?$/);
  assert.ok(match, `Expected a number or exact fraction: ${text}`);
  return Number(match[1]) * (match[2] ? Math.PI : 1) / Number(match[3] || 1);
}

function numbers(stem, pattern) {
  const match = stem.match(pattern);
  assert.ok(match, `Cannot read givens: ${stem}`);
  return match.slice(1).map(Number);
}

function close(actual, expected, context) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${context}: ${actual} !== ${expected}`);
}

function shape(skill, tier, index, seed, variant = 0) {
  return SHAPES[skill][tier][index](seed, variant);
}

const hundredths = (value) => Math.round(value * 100) / 100;

test("ACT reciprocal equations have a finite exact solution satisfying the printed equation", () => {
  for (let seed = 0; seed < 1200; seed += 1) {
    const question = shape("rational expressions", "Medium", 0, seed);
    const [other, combined] = numbers(question.stem, /1\/x \+ 1\/(\d+) = 1\/(\d+)/);
    const answer = numberFromAnswer(question.answer);
    assert.ok(Number.isFinite(answer) && answer !== 0, question.stem);
    close(1 / answer + 1 / other, 1 / combined, question.stem);
  }
});

test("ACT sine and cosine givens describe an angle, and tangent matches their ratio", () => {
  for (let seed = 0; seed < 1200; seed += 1) {
    const question = shape("identities", "Easy", 1, seed);
    const [a, b, c, d] = numbers(question.stem, /sin θ = (\d+)\/(\d+) and cos θ = (\d+)\/(\d+)/);
    const sine = a / b;
    const cosine = c / d;
    close(sine * sine + cosine * cosine, 1, question.stem);
    close(numberFromAnswer(question.answer), sine / cosine, question.stem);
  }
});

test("ACT composed radicals state the real domain before asking for its excluded point", () => {
  for (let seed = 0; seed < 1200; seed += 1) {
    const question = shape("domain and range", "Hard", 1, seed);
    const [boundary, inner, outer] = numbers(question.stem, /x ≥ (\d+).*1\/\(√\(x − (\d+)\) − (\d+)\)/);
    assert.equal(boundary, inner, question.stem);
    const answer = numberFromAnswer(question.answer);
    assert.ok(answer >= boundary, question.stem);
    close(Math.sqrt(answer - inner) - outer, 0, question.stem);
  }
});

test("ACT decreasing-radicand boundaries retain exact fractions", () => {
  for (let seed = 0; seed < 1200; seed += 1) {
    const question = shape("domain and range", "Medium", 1, seed);
    const [constant, coefficient] = numbers(question.stem, /√\((\d+) − (\d+)x\)/);
    close(coefficient * numberFromAnswer(question.answer), constant, question.stem);
  }
});

test("ACT horizontal-shift questions supply the injectivity needed for a unique input", () => {
  for (let seed = 0; seed < 1200; seed += 1) {
    const question = shape("transformations", "Medium", 0, seed, seed % 12);
    assert.match(question.stem, /one-to-one/);
    const [shift, y, x, knownY] = numbers(question.stem, /f\(k − (\d+)\) = (\d+).*f\((\d+)\) = (\d+)/);
    assert.equal(y, knownY, question.stem);
    assert.equal(numberFromAnswer(question.answer) - shift, x, question.stem);
  }
});

test("ACT arc and sector answers preserve exact multiples of pi", () => {
  for (let seed = 0; seed < 1200; seed += 1) {
    const arc = shape("circles", "Medium", 0, seed);
    const [angle, radius] = numbers(arc.stem, /a (\d+)° central angle in a circle of radius (\d+)/);
    close(numberFromAnswer(arc.answer), 2 * Math.PI * radius * angle / 360, arc.stem);
    const sector = shape("circles", "Medium", 1, seed);
    const [sectorAngle, sectorRadius] = numbers(sector.stem, /a (\d+)° sector in a circle of radius (\d+)/);
    close(numberFromAnswer(sector.answer), Math.PI * sectorRadius ** 2 * sectorAngle / 360, sector.stem);
  }
});

test("ACT rounds geometric and statistical results only at the requested precision", () => {
  // Each is a counterexample where rounding to three decimals first changes the key.
  assert.equal(numberFromAnswer(shape("area", "Medium", 0, 0).answer), 13.73);
  assert.equal(numberFromAnswer(shape("right-triangle trigonometry", "Hard", 1, 4).answer), 8.5);
  assert.equal(numberFromAnswer(shape("center and spread", "Medium", 1, 23).answer), 82.45);
  assert.equal(numberFromAnswer(shape("data displays", "Medium", 1, 10).answer), 2.45);
  for (let seed = 0; seed < 1200; seed += 1) {
    const area = shape("area", "Medium", 0, seed);
    const [side] = numbers(area.stem, /square of side (\d+)/);
    assert.equal(numberFromAnswer(area.answer), hundredths(side * side - Math.PI * (side / 2) ** 2), area.stem);
    const triangle = shape("right-triangle trigonometry", "Hard", 1, seed);
    const [a, b, angle] = numbers(triangle.stem, /sides (\d+) and (\d+) enclosing a (\d+)° angle/);
    const radians = angle * Math.PI / 180;
    const distance = Math.hypot(a - b * Math.cos(radians), b * Math.sin(radians));
    assert.equal(numberFromAnswer(triangle.answer), hundredths(distance), triangle.stem);
    const mean = shape("center and spread", "Medium", 1, seed);
    const [n, x, m, y] = numbers(mean.stem, /(\d+) scores averaging (\d+) and (\d+) scores averaging (\d+)/);
    assert.equal(numberFromAnswer(mean.answer), hundredths((n * x + m * y) / (n + m)), mean.stem);
    const frequency = shape("data displays", "Medium", 1, seed);
    const rows = [...frequency.stimulus.content.matchAll(/^(\d+) \| (\d+)$/gm)].map((match) => [Number(match[1]), Number(match[2])]);
    assert.equal(rows.length, 4);
    const data = rows.flatMap(([value, count]) => Array(count).fill(value));
    assert.equal(numberFromAnswer(frequency.answer), hundredths(data.reduce((total, value) => total + value, 0) / data.length), frequency.stem);
  }
});

test("ACT exact rates, score targets, and mixtures satisfy their stated relationships", () => {
  for (let seed = 0; seed < 1200; seed += 1) {
    const speed = shape("rates", "Medium", 0, seed);
    const [hours, rate, moreHours, moreRate] = numbers(speed.stem, /for (\d+) hours at (\d+) miles per hour and then (\d+) hours at (\d+) miles per hour/);
    close(numberFromAnswer(speed.answer) * (hours + moreHours), hours * rate + moreHours * moreRate, speed.stem);
    const work = shape("rates", "Medium", 1, seed);
    const [first, second] = numbers(work.stem, /need (\d+) and (\d+) hours alone/);
    close(numberFromAnswer(work.answer) / first + numberFromAnswer(work.answer) / second, 1, work.stem);
    const score = shape("averages", "Hard", 1, seed);
    const [remaining, taken, current, target] = numbers(score.stem, /on (\d+) remaining .* (\d+)-.* average from (\d+) to (\d+)/);
    close((numberFromAnswer(score.answer) * remaining + current * taken) / (remaining + taken), target, score.stem);
    const pure = shape("percentages", "Hard", 0, seed);
    const [volume, strength, goal] = numbers(pure.stem, /add to (\d+) liters of (\d+)% .* to make it (\d+)%/);
    const addition = numberFromAnswer(pure.answer);
    close((volume * strength + addition * 100) / (volume + addition), goal, pure.stem);
    const mix = shape("combined concepts", "Hard", 1, seed);
    const [newStrength, oldVolume, oldStrength, finalStrength] = numbers(mix.stem, /liters of (\d+)% .*mix with (\d+) liters at (\d+)% to obtain (\d+)%/);
    const newVolume = numberFromAnswer(mix.answer);
    close((newVolume * newStrength + oldVolume * oldStrength) / (newVolume + oldVolume), finalStrength, mix.stem);
  }
});

test("ACT no-solution parameter questions leave inconsistent constant equations", () => {
  for (let seed = 0; seed < 1200; seed += 1) {
    const equation = shape("linear equations", "Hard", 1, seed);
    const [shift, subtracted, rightCoefficient, constant] = numbers(equation.stem, /k\(x \+ (\d+)\) − (\d+)x = (\d+)x \+ (\d+)/);
    const k = numberFromAnswer(equation.answer);
    assert.equal(k - subtracted, rightCoefficient, equation.stem);
    assert.notEqual(k * shift, constant, equation.stem);
  }
});

test("ACT explanations retain the exact intermediate arithmetic", () => {
  const interval = shape("inequalities", "Medium", 0, 11);
  assert.match(interval.why, /Subtract 6 throughout: −10 < 4x ≤ 2/);
  const projectile = shape("quadratic", "Medium", 0, 11);
  assert.match(projectile.why, /−16\(0\.75\)²/);
  assert.doesNotMatch(projectile.why, /0\.563/);
  const rate = shape("rates", "Hard", 1, 11);
  assert.match(rate.why, /\(4\/3 \+ 7\/5\) · 240 = 656/);
});

test("ACT exercise stems leave solution coaching in the hint", () => {
  const coaching = /Use the (?:integer structure|root encoded|reciprocal rule)|Combine real and imaginary parts|Combine the cross terms|Apply binomial multiplication|Scale into the smaller measurement unit|Convert the radicand to a perfect power/;
  for (const tiers of Object.values(SHAPES)) {
    for (const shapes of Object.values(tiers)) {
      for (const build of shapes) {
        for (let variant = 0; variant < 12; variant += 1) {
          assert.doesNotMatch(build(11, variant).stem, coaching);
        }
      }
    }
  }
});

test("every ACT Math shape retains enough distinct choices across its parameter branches", () => {
  for (const tiers of Object.values(SHAPES)) {
    for (const shapes of Object.values(tiers)) {
      for (const build of shapes) {
        for (let seed = 0; seed < 1200; seed += 1) {
          const question = build(seed, seed % 12);
          assert.ok(question.wrong.length >= 3, `${question.family}, seed ${seed}: fewer than three distractors`);
          const rendered = [question.answer, ...question.wrong.map(([raw]) => raw)]
            .map((raw) => typeof raw === "object" ? raw.text : String(raw));
          assert.equal(new Set(rendered).size, rendered.length, `${question.family}, seed ${seed}: repeated choice`);
          const numeric = [question.answer, ...question.wrong.map(([raw]) => raw)]
            .map((raw) => typeof raw === "number" ? raw : raw && raw.value).filter(Number.isFinite);
          for (let index = 0; index < numeric.length; index += 1) {
            for (let other = index + 1; other < numeric.length; other += 1) {
              assert.ok(Math.abs(numeric[index] - numeric[other]) > 1e-9, `${question.family}, seed ${seed}: equivalent numeric choices`);
            }
          }
        }
      }
    }
  }
});
