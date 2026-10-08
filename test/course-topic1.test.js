'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const M = require('../src/lib/lesson-modules/math.js');
const templates = require('../src/lib/lesson-modules/common-core-math/8/topic-1.js');
const minus = text => text.replace(/−/g, '-');

// Independent exact arithmetic for checking displayed decimals and scientific notation.
function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}
function rat(n, d = 1n) {
  n = BigInt(n); d = BigInt(d);
  const factor = gcd(n, d), sign = d < 0n ? -1n : 1n;
  return [sign * n / factor, sign * d / factor];
}
function combine(a, b, op) {
  if (op === '+') return rat(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  if (op === '-') return rat(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  if (op === '*') return rat(a[0] * b[0], a[1] * b[1]);
  return rat(a[0] * b[1], a[1] * b[0]);
}
function tenPower(n) {
  return n >= 0 ? [10n ** BigInt(n), 1n] : [1n, 10n ** BigInt(-n)];
}
function parseDecimal(text) {
  text = minus(text);
  const sign = text.startsWith('-') ? -1n : 1n;
  const parts = text.replace(/^-/, '').split('.');
  const whole = parts[0], fractional = parts[1] || '';
  const repeat = fractional.match(/^(\d*)\[(\d+)\]$/);
  if (!repeat) return rat(sign * BigInt(whole + fractional), 10n ** BigInt(fractional.length));
  const fixed = repeat[1], block = repeat[2];
  const denominator = (10n ** BigInt(block.length) - 1n) * 10n ** BigInt(fixed.length);
  const numerator = BigInt(whole) * denominator + BigInt(fixed || '0') * (10n ** BigInt(block.length) - 1n) + BigInt(block);
  return rat(sign * numerator, denominator);
}
function parseFraction(text) {
  const parts = minus(text).split('/');
  return rat(parts[0], parts[1] || 1);
}
function parseScientific(text) {
  const match = minus(text).match(/^([0-9]+(?:\.[0-9]+)?) × 10\^(-?\d+)$/);
  assert.ok(match, `Scientific notation: ${text}`);
  const coefficient = parseDecimal(match[1]);
  assert.ok(coefficient[0] >= coefficient[1] && coefficient[0] < 10n * coefficient[1], text);
  return combine(coefficient, tenPower(Number(match[2])), '*');
}
function assertFraction(text, expected) {
  assert.deepEqual(parseFraction(text), expected);
  const raw = minus(text).split('/').map(BigInt);
  if (raw.length === 2) {
    assert.ok(raw[1] > 1n, 'Do not retain a denominator of 1');
    assert.equal(gcd(raw[0], raw[1]), 1n, 'Fraction must be reduced');
  }
}
function displayedScientificOperands(prompt) {
  return [...minus(prompt).matchAll(/([0-9]+(?:\.[0-9]+)?) × 10\^(-?\d+)/g)]
    .map(match => combine(parseDecimal(match[1]), tenPower(Number(match[2])), '*'));
}
function integerRoot(n, power) {
  for (let i = 0; i ** power <= n; i++) if (i ** power === n) return i;
  return null;
}
function powerAnswer(text, base) {
  const match = minus(text).match(new RegExp(`^${base}\\^(-?\\d+)$`));
  assert.ok(match, text);
  return Number(match[1]);
}

function verify(q) {
  const c = q.check;
  switch (c.kind) {
    case 'fraction':
      assert.deepEqual(parseDecimal(c.text), rat(c.n, c.d));
      assertFraction(q.answer, parseDecimal(c.text));
      assert.ok(q.prompt.includes(c.text));
      break;
    case 'decimal-fraction': {
      const displayed = q.prompt.match(/^Write ([^ ]+) as a decimal/)[1];
      assert.deepEqual(parseDecimal(q.answer), parseFraction(displayed));
      break;
    }
    case 'classify-roots': {
      const displayed = q.prompt.split('classification: ')[1].slice(0, -1).split('; ');
      const actual = displayed.filter(text => {
        const root = text.match(/√(\d+)/);
        return root && integerRoot(Number(root[1]), 2) === null;
      });
      assert.equal(q.answer, actual.join(', '));
      assert.ok(actual.length === 1 || actual.length === 2);
      assert.ok(c.candidates.every(v => q.prompt.includes(v.text)));
      break;
    }
    case 'number-sets': {
      let expected;
      if (c.text.includes('√')) expected = 'real';
      else {
        const value = parseFraction(c.text);
        expected = value[1] > 1n ? 'rational, real'
          : value[0] < 0n ? 'integer, rational, real'
            : value[0] === 0n ? 'whole, integer, rational, real'
              : 'natural, whole, integer, rational, real';
      }
      assert.equal(q.answer, expected);
      break;
    }
    case 'infinite-pattern': {
      assert.match(q.prompt, /continues forever with one more zero/);
      assert.match(q.steps.join(' '), /zero gaps grow without bound/);
      const rationalLabel = q.prompt.match(/Decimal ([AB]) repeats the block/)[1];
      assert.equal(q.answer, rationalLabel === 'A' ? 'A is rational; B is irrational.' : 'A is irrational; B is rational.');
      assert.ok(q.steps[0].startsWith(rationalLabel));
      break;
    }
    case 'bounds': {
      const match = q.answer.match(/^(\d+) < √(\d+) < (\d+)$/);
      const [, lower, n, upper] = match.map(Number);
      assert.equal(upper, lower + 1);
      assert.ok(lower ** 2 < n && n < upper ** 2);
      assert.equal(n, Number(q.prompt.match(/√(\d+)/)[1]));
      break;
    }
    case 'order': {
      function value(text) {
        if (text.startsWith('√')) return Math.sqrt(Number(text.slice(1)));
        const mixed = text.match(/^(\d+) (\d+)\/(\d+)$/);
        if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
        const rational = parseDecimal(text);
        return Number(rational[0]) / Number(rational[1]);
      }
      const order = q.answer.split(' < ');
      assert.deepEqual(new Set(order), new Set(c.values.map(v => v.text)));
      for (let i = 1; i < order.length; i++) assert.ok(value(order[i - 1]) < value(order[i]), q.answer);
      assert.deepEqual(q.graph.points, []);
      assert.equal(q.answerGraph.points.length, 4);
      q.answerGraph.points.forEach(p => assert.equal(p.x, value(p.label)));
      for (let i = 1; i < q.answerGraph.points.length; i++) {
        assert.ok(q.answerGraph.points[i].x - q.answerGraph.points[i - 1].x >= 0.12,
          'Number-line marks must remain distinguishable at worksheet print size');
      }
      break;
    }
    case 'negative-comparison': {
      const [, radicand, sign, rhs] = q.answer.match(/^−√(\d+) ([<>]) (.+)$/);
      const rational = parseDecimal(rhs);
      const greaterMagnitude = BigInt(radicand) * rational[1] ** 2n > rational[0] ** 2n;
      assert.equal(sign, greaterMagnitude ? '<' : '>');
      break;
    }
    case 'roots': {
      const answers = minus(q.answer).split('; ').map(Number);
      const [, square, cube] = minus(q.prompt).match(/Evaluate √(\d+) and ³√\((-?\d+)\)/).map(Number);
      assert.equal(answers[0] ** 2, square);
      assert.ok(answers[0] >= 0);
      assert.equal(answers[1] ** 3, cube);
      assert.ok(Math.abs(answers[1]) <= 12, 'Integer cube roots stay in the familiar 1–12 range');
      break;
    }
    case 'square-cube-categories':
      q.answer.split('; ').forEach(entry => {
        const [number, category] = entry.split(': '), n = Number(number);
        const square = integerRoot(n, 2) !== null, cube = integerRoot(n, 3) !== null;
        assert.equal(category, square && cube ? 'both' : square ? 'perfect square only' : cube ? 'perfect cube only' : 'neither');
        if (cube) assert.ok(integerRoot(n, 3) <= 12);
      });
      assert.equal(new Set(c.values.map(v => v.n)).size, 4);
      break;
    case 'cube-row':
      assert.equal((Number(q.answer.split(' ')[0]) / c.count) ** 3, c.volume);
      assert.ok(c.volume <= 12 ** 3);
      break;
    case 'square-equation': {
      const equation = minus(q.prompt).match(/^Find all real solutions of (\d*)x\^2(?: ([+-]) (\d+))? = (-?\d+)\./);
      assert.ok(equation, q.prompt);
      const coefficient = Number(equation[1] || 1), offset = Number(equation[3] || 0) * (equation[2] === '-' ? -1 : 1), right = Number(equation[4]);
      const squared = (right - offset) / coefficient;
      assert.equal(squared, c.n);
      if (squared < 0) {
        assert.equal(q.answer, 'No real solutions.');
        assert.match(q.steps.join(' '), /nonnegative/);
        break;
      }
      if (squared === 0) {
        assert.equal(q.answer, 'x = 0');
        assert.equal(coefficient * 0 ** 2 + offset, right);
        assert.match(q.steps.join(' '), /one real solution/);
        break;
      }
      const values = minus(q.answer).split(' or ').map(text => text.replace(/^x = /, ''));
      assert.equal(values.length, 2);
      const magnitude = text => text.includes('√') ? Math.sqrt(Number(text.split('√')[1])) : Math.abs(Number(text));
      assert.ok(values[0].startsWith('-'));
      assert.ok(!values[1].startsWith('-'));
      for (const value of values) assert.ok(Math.abs(coefficient * magnitude(value) ** 2 + offset - right) < 1e-9);
      assert.equal(magnitude(values[0]), magnitude(values[1]));
      assert.match(q.steps.join(' '), /\|x\|/);
      break;
    }
    case 'cube-equation': {
      const value = minus(q.answer).replace(/^y = /, '');
      if (value.includes('³√')) {
        const [, sign, radicand] = value.match(/^(-?)³√(\d+)$/);
        assert.equal(Number(radicand) * (sign ? -1 : 1), c.n);
        assert.equal(integerRoot(Math.abs(c.n), 3), null);
      } else assert.equal(Number(value) ** 3, c.n);
      break;
    }
    case 'cube-face': {
      const dimensions = q.answer.split(' by ');
      assert.equal(dimensions[0], dimensions[1]);
      const length = dimensions[0].replace(' cm', '');
      if (length.startsWith('³√')) assert.equal(Number(length.slice(2)), c.volume);
      else {
        assert.equal(Number(length) ** 3, c.volume);
        assert.ok(Number(length) <= 12);
      }
      break;
    }
    case 'exponent': {
      const match = minus(q.prompt).match(/Assume (\w) ≠ 0/);
      const base = match[1];
      const exponents = [...minus(q.prompt).split('. Assume')[0].matchAll(/\^(-?\d+)/g)].map(m => Number(m[1]));
      const expected = c.operation === 'product' ? exponents.reduce((a, b) => a + b, 0)
        : c.operation === 'power' ? exponents[0] * exponents[1] : exponents[0] - exponents[1];
      assert.equal(powerAnswer(q.answer, base), expected);
      break;
    }
    case 'power-product':
      assert.equal(powerAnswer(q.answer, c.a * c.b), c.exponent);
      break;
    case 'reciprocal':
      assert.equal(q.answer, `${String(c.coefficient).replace('-', '−')}/(${c.base}^${c.exponent})`);
      assert.match(q.prompt, /≠ 0/);
      break;
    case 'reciprocal-product': {
      const [onePower, positive] = q.answer.split('; ');
      assert.equal(powerAnswer(onePower, c.base), c.a - c.b);
      assert.ok(!positive.includes('−'));
      const expected = c.a === c.b ? '1' : c.a > c.b ? `${c.base}^${c.a - c.b}` : `1/(${c.base}^${c.b - c.a})`;
      assert.equal(positive, expected);
      break;
    }
    case 'evaluate-powers': {
      const [, coefficient, constant, x, y] = minus(q.prompt).match(/Evaluate \((-?\d+)\)x\^-2 \+ (\d+)y\^0 for x = (-?\d+) and y = (-?\d+)/).map(Number);
      assert.notEqual(x, 0);
      assert.notEqual(y, 0);
      assertFraction(q.answer, combine(rat(coefficient, x * x), rat(constant), '+'));
      break;
    }
    case 'estimate': {
      const match = q.answer.match(/^(\d) × 10\^([−\d]+)(?: m)?$/);
      assert.ok(match, q.answer);
      const expected = Math.round(c.n / 100) * 10 ** (c.exponent + 2);
      const actual = Number(match[1]) * 10 ** Number(minus(match[2]));
      assert.ok(Math.abs(actual / expected - 1) < 1e-12);
      break;
    }
    case 'estimated-ratio': {
      const [, a, b] = q.prompt.match(/tracks (\d+) red signals and (\d+) blue signals/);
      const roundOneDigit = text => Math.round(Number(text) / 10 ** (text.length - 1)) * 10 ** (text.length - 1);
      assert.equal(q.answer, `About ${roundOneDigit(a) / roundOneDigit(b)} times as large.`);
      break;
    }
    case 'scientific': {
      const shown = q.prompt.match(/(?:Write |width of )([0-9.]+)/)[1];
      assert.deepEqual(parseScientific(q.answer.replace(/ mm$/, '')), parseDecimal(shown));
      break;
    }
    case 'ordinary':
      assert.deepEqual(parseDecimal(q.answer), displayedScientificOperands(q.prompt)[0]);
      break;
    case 'scientific-operation': {
      const operands = displayedScientificOperands(q.prompt);
      assert.equal(operands.length, 2);
      assert.deepEqual(parseScientific(q.answer), combine(operands[0], operands[1], c.operation));
      break;
    }
    case 'storage-model': {
      const count = Number(q.prompt.match(/stores (\d+) files/)[1]);
      const operands = displayedScientificOperands(q.prompt);
      const total = combine(operands[0], rat(count), '*');
      const [first, second] = q.answer.split('; ');
      assert.deepEqual(parseScientific(first.replace(' bytes', '')), total);
      assertFraction(second.replace(' times as large.', ''), combine(total, operands[1], '/'));
      break;
    }
    case 'panel-model': {
      const [perimeter, area] = q.answer.split('; ');
      const side = Number(perimeter.split(' ')[0]) / (4 * c.count);
      assert.equal(side ** 2, c.area);
      assert.deepEqual(parseScientific(area.replace(` ${c.unit}^2`, '')), rat(c.area * c.count));
      break;
    }
    default: assert.fail(`Unchecked kind: ${c.kind}`);
  }
}

test('Topic 1 exports original templates for every lesson in Node and the browser', () => {
  assert.ok(templates.length >= 30);
  assert.equal(new Set(templates.map(t => t.id)).size, templates.length);
  for (let lesson = 1; lesson <= 11; lesson++) {
    assert.ok(templates.filter(t => t.lessonId === `1-${lesson}`).length >= 2);
  }
  const context = { LiminalCourseMath: M };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/lib/lesson-modules/common-core-math/8/topic-1.js'), 'utf8'), context);
  assert.equal(context.LiminalGrade8Topic1.length, templates.length);
  assert.equal(context.LiminalGrade8Topic1[0].generate(M.random('browser')).answer,
    templates[0].generate(M.random('browser')).answer);
});

for (const template of templates) {
  test(`${template.id}: exact answers and valid content over 3,000 seeds`, () => {
    for (let seed = 0; seed < 3000; seed++) {
      const q = template.generate(M.random(`topic1.${template.id}.${seed}`));
      assert.ok(q.prompt && q.answer && q.steps.length >= 2);
      assert.ok(typeof q.practiceKey === 'string' && q.practiceKey.length > 0);
      assert.ok(q.steps.every(step => typeof step === 'string' && step.length > 0));
      assert.ok(Number.isInteger(q.workLines) && q.workLines >= 3 && q.workLines <= 7);
      assert.doesNotMatch(JSON.stringify(q), /NaN|Infinity|undefined|<\/?[a-z][^>]*>/i);
      for (const g of [q.graph, q.answerGraph].filter(Boolean)) {
        assert.ok(g.xMin < g.xMax && g.yMin < g.yMax && g.xStep > 0 && g.yStep > 0);
        for (const p of g.points) assert.ok(Number.isFinite(p.x) && p.x >= g.xMin && p.x <= g.xMax && p.y === 0);
      }
      try { verify(q); } catch (error) { error.message = `${template.id} seed ${seed}: ${q.prompt}\n${q.answer}\n${error.message}`; throw error; }
    }
  });
}

test('Each lesson can supply hundreds of distinct mathematical input sets', () => {
  for (let lesson = 1; lesson <= 11; lesson++) {
    const pool = templates.filter(t => t.lessonId === `1-${lesson}`), visible = new Set();
    for (let seed = 0; seed < 1200; seed++) {
      for (const template of pool) visible.add(template.generate(M.random(`variety.${seed}`)).practiceKey);
    }
    assert.ok(visible.size >= 300, `Lesson 1-${lesson}: ${visible.size} distinct mathematical inputs`);
  }
});

test('Deterministic seeds reproduce full question objects', () => {
  for (const template of templates) {
    assert.deepEqual(template.generate(M.random('repeatable')), template.generate(M.random('repeatable')));
  }
});

test('Classification samples counter both sign shortcuts and fixed A/B answers', () => {
  const roots = templates.find(t => t.id === 'g8-t1-root-classification');
  const patterns = templates.find(t => t.id === 'g8-t1-infinite-decimal-classification');
  const signClasses = new Map(), irrationalCounts = new Map(), rationalLabels = new Map();
  for (let seed = 0; seed < 3000; seed++) {
    const q = roots.generate(M.random(`countercue.${seed}`));
    const displayed = q.prompt.split('classification: ')[1].slice(0, -1).split('; ');
    let irrationalCount = 0;
    for (const expression of displayed) {
      const radical = expression.match(/^(−?)√(\d+)$/);
      if (!radical) continue;
      const irrational = integerRoot(Number(radical[2]), 2) === null;
      if (irrational) irrationalCount++;
      const branch = `${radical[1] ? 'negative' : 'positive'} ${irrational ? 'irrational' : 'rational'}`;
      signClasses.set(branch, (signClasses.get(branch) || 0) + 1);
    }
    irrationalCounts.set(irrationalCount, (irrationalCounts.get(irrationalCount) || 0) + 1);
    const pattern = patterns.generate(M.random(`countercue.${seed}`));
    const rationalLabel = pattern.prompt.match(/Decimal ([AB]) repeats/)[1];
    rationalLabels.set(rationalLabel, (rationalLabels.get(rationalLabel) || 0) + 1);
  }
  for (const branch of ['negative irrational', 'positive irrational', 'negative rational', 'positive rational']) {
    assert.ok(signClasses.get(branch) >= 1000, `Missing counterexample coverage: ${branch}`);
  }
  for (const count of [1, 2]) assert.ok(irrationalCounts.get(count) >= 1000);
  for (const label of ['A', 'B']) assert.ok(rationalLabels.get(label) >= 1000);
});

test('Reordering classification and plotting lists does not create a new exercise', () => {
  for (const id of ['root-classification', 'square-cube-categories', 'order-and-plot']) {
    const template = templates.find(t => t.id === `g8-t1-${id}`);
    for (let seed = 0; seed < 100; seed++) {
      const normal = template.generate(M.random(`shuffle.${seed}`));
      const rng = M.random(`shuffle.${seed}`), originalShuffle = rng.shuffle;
      rng.shuffle = values => {
        const shuffled = originalShuffle(values);
        return typeof values[0] === 'object' ? shuffled.reverse() : shuffled;
      };
      const reordered = template.generate(rng);
      assert.notEqual(normal.prompt, reordered.prompt);
      assert.equal(normal.practiceKey, reordered.practiceKey);
    }
  }
});

test('square and cube categories have no fixed multiplicities or required category', () => {
  const template = templates.find(t => t.id === 'g8-t1-square-cube-categories');
  const counts = new Map(['perfect square only', 'perfect cube only', 'both', 'neither'].map(category => [category, new Set()]));
  for (let seed = 0; seed < 3000; seed++) {
    const q = template.generate(M.random(`category-counts.${seed}`));
    for (const [category, seen] of counts) seen.add(q.answer.split('; ').filter(entry => entry.endsWith(`: ${category}`)).length);
  }
  for (const [category, seen] of counts) assert.deepEqual([...seen].sort(), [0, 1, 2, 3, 4], category);
});

test('square equations cover positive, zero, and negative squares with and without isolation', () => {
  const template = templates.find(t => t.id === 'g8-t1-square-equation'), branches = new Set();
  for (let seed = 0; seed < 1000; seed++) {
    const q = template.generate(M.random(`square-branches.${seed}`));
    const kind = q.answer === 'x = 0' ? 'zero' : q.answer === 'No real solutions.' ? 'none' : q.answer.includes('√') ? 'irrational' : 'integer';
    branches.add(`${q.prompt.includes('of x^2') ? 'direct' : 'isolate'}:${kind}`);
    verify(q);
  }
  assert.equal(branches.size, 8);
  const seed = 'square-identity', rng = () => {
    const random = M.random(seed), originalPick = random.pick;
    random.pick = values => {
      originalPick(values);
      return values.includes('zero') ? 'zero' : true;
    };
    return random;
  };
  const first = rng(), second = rng();
  second.nonzero = () => 19;
  const a = template.generate(first), b = template.generate(second);
  assert.equal(a.answer, b.answer);
  assert.notEqual(a.practiceKey, b.practiceKey, 'Different isolation work is not collapsed to its zero answer');
});

test('Changing variable names, decimal labels, or units leaves mathematical identities unchanged', () => {
  for (const id of ['product-of-powers', 'power-of-power', 'quotient-of-powers', 'negative-power-reciprocal', 'negative-power-denominator']) {
    const template = templates.find(t => t.id === `g8-t1-${id}`);
    for (let seed = 0; seed < 100; seed++) {
      function draw(variable) {
        const rng = M.random(`rename.${seed}`), originalPick = rng.pick;
        rng.pick = values => {
          const chosen = originalPick(values);
          return values.includes('a') && values.includes('t') ? variable : chosen;
        };
        return template.generate(rng);
      }
      const a = draw('a'), t = draw('t');
      assert.notEqual(a.prompt, t.prompt);
      assert.equal(a.practiceKey, t.practiceKey);
    }
  }
  for (const [id, choices] of [['infinite-decimal-classification', ['A', 'B']], ['model-square-covering', ['cm', 'mm']]]) {
    const template = templates.find(t => t.id === `g8-t1-${id}`);
    function draw(label) {
      const rng = M.random('labels'), originalPick = rng.pick;
      rng.pick = values => {
        const chosen = originalPick(values);
        return values.includes(choices[0]) && values.includes(choices[1]) ? label : chosen;
      };
      return template.generate(rng);
    }
    const a = draw(choices[0]), b = draw(choices[1]);
    assert.notEqual(a.prompt, b.prompt);
    assert.equal(a.practiceKey, b.practiceKey);
  }
});

function scripted(id, inputs) {
  const remaining = Object.fromEntries(Object.entries(inputs).map(([name, values]) => [name, values.slice()]));
  function take(name, min, max) {
    assert.ok(remaining[name] && remaining[name].length, `Missing scripted ${name}`);
    const value = remaining[name].shift();
    if (min !== undefined) assert.ok(value >= min && value <= max, `Scripted ${value} outside ${min}…${max}`);
    return value;
  }
  return templates.find(t => t.id === `g8-t1-${id}`).generate({
    int: (min, max) => take('int', min, max),
    nonzero: (min, max) => { const n = take('nonzero', min, max); assert.notEqual(n, 0); return n; },
    pick: values => { const v = take('pick'); assert.ok(values.includes(v)); return v; },
    sign: () => take('sign', -1, 1),
    shuffle: values => values.slice()
  });
}

test('Practice keys normalize equivalent inputs without collapsing different work with the same answer', () => {
  const product = inputs => scripted('product-of-powers', { pick: ['a'], nonzero: inputs.slice(0, 2), int: inputs.slice(2) });
  assert.equal(product([2, 3, 4]).practiceKey, product([4, 2, 3]).practiceKey);
  assert.equal(product([2, 3, 4]).answer, product([1, 3, 5]).answer);
  assert.notEqual(product([2, 3, 4]).practiceKey, product([1, 3, 5]).practiceKey);
  const power = values => scripted('power-of-power', { pick: ['a'], nonzero: values });
  assert.equal(power([2, 3]).answer, power([3, 2]).answer);
  assert.notEqual(power([2, 3]).practiceKey, power([3, 2]).practiceKey);
  const numericProduct = values => scripted('power-of-product', { int: values, nonzero: [4] });
  assert.equal(numericProduct([2, 3]).practiceKey, numericProduct([3, 2]).practiceKey);
  const scientificProduct = values => scripted('scientific-product', { int: values });
  assert.equal(scientificProduct([23, 41, 2, 5]).practiceKey, scientificProduct([41, 23, 5, 2]).practiceKey);
  assert.equal(scientificProduct([30, 40, 1, 2]).answer, scientificProduct([24, 50, 1, 2]).answer);
  assert.notEqual(scientificProduct([30, 40, 1, 2]).practiceKey, scientificProduct([24, 50, 1, 2]).practiceKey);
  const repeat = scripted('repeat-block-fraction', { int: [0, 33], sign: [1] });
  const prefix = scripted('repeat-after-prefix', { int: [0, 3, 3] });
  assert.equal(repeat.practiceKey, prefix.practiceKey, '0.[33] and 0.3[3] name the same input');
  const fractionA = scripted('fraction-decimal', { pick: [6], nonzero: [2] });
  const fractionB = scripted('fraction-decimal', { pick: [9], nonzero: [3] });
  assert.equal(fractionA.practiceKey, fractionB.practiceKey, 'Fractions are keyed after reduction');
  assert.notEqual(repeat.practiceKey, fractionA.practiceKey, 'Opposite conversion directions are different tasks');
  const zeroA = scripted('evaluate-zero-negative-powers', { nonzero: [3, 2, 4], int: [8] });
  const zeroB = scripted('evaluate-zero-negative-powers', { nonzero: [3, 9, 4], int: [8] });
  assert.equal(zeroA.practiceKey, zeroB.practiceKey, 'Changing only a nonzero base raised to zero is not fresh arithmetic');
});

test('Every design retains enough mathematical inputs for balanced multi-night practice', () => {
  for (const template of templates) {
    const keys = new Set();
    for (let seed = 0; seed < 3000; seed++) keys.add(template.generate(M.random(`capacity.${seed}`)).practiceKey);
    assert.ok(keys.size >= 100, `${template.id}: only ${keys.size} distinct input sets`);
  }
});
