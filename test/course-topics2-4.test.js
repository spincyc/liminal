const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const M = require('../src/lib/lesson-modules/math.js');
const groups = [2, 3, 4].map(topic => require(`../src/lib/lesson-modules/common-core-math/8/topic-${topic}.js`));
const templates = groups.flat();
const byId = new Map(templates.map(template => [template.id, template]));
const normal = s => s.replace(/−/g, '-');
const number = s => Number(normal(s));
const fraction = s => normal(s).split('/').map(Number).reduce((a, b) => a / b);
function draw(id, seed) { return byId.get(id).generate(M.random(seed)); }
function exercise(id, inspect, count = 400) {
  for (let seed = 0; seed < count; seed++) inspect(draw(id, `independent-check:${seed}`), seed);
}
// This parser reads only generated arithmetic displayed in these tests. It
// substitutes the published answer back into the original equation instead of
// using a generator's hidden parameters or its solution steps.
function arithmetic(expression, x, k = 0) {
  let source = normal(expression).trim();
  assert.match(source, /^[0-9xk+*/().\s-]+$/);
  source = source.replace(/(\d|\))(?=[xk(])/g, '$1*').replace(/([xk])(?=\()/g, '$1*');
  return Function('x', 'k', `"use strict"; return (${source});`)(x, k);
}
function coordinates(graph) { return graph.points.map(p => [p.x, p.y]); }

test('Topics 2–4 have two original designs for each of their 25 lessons', () => {
  assert.equal(templates.length, 50);
  assert.equal(byId.size, 50);
  const lengths = [11, 7, 7];
  groups.forEach((group, i) => {
    for (let lesson = 1; lesson <= lengths[i]; lesson++) {
      assert.equal(group.filter(t => t.lessonId === `${i + 2}-${lesson}`).length, 2);
    }
  });
  assert.equal(byId.get('g8-t2-fraction-both-sides').lessonId, '2-4');
  assert.equal(byId.get('g8-t2-multistep-subtraction').lessonId, '2-3');
});

test('all designs are deterministic, finite, printable, and keep data points in view over 3000 seeds', () => {
  for (const t of templates) {
    const a = t.generate(M.random('repeatable'));
    assert.deepEqual(a, t.generate(M.random('repeatable')));
    const seen = new Set();
    for (let seed = 0; seed < 3000; seed++) {
      const q = t.generate(M.random(`${t.id}:${seed}`));
      assert.equal(typeof q.prompt, 'string');
      assert.equal(typeof q.answer, 'string');
      assert.equal(typeof q.practiceKey, 'string');
      assert.ok(q.practiceKey.length > 8);
      assert.ok(q.prompt.length > 0 && q.answer.length > 0, t.id);
      assert.ok(q.steps.length >= 2 && q.steps.every(s => typeof s === 'string' && s.length > 5), t.id);
      assert.ok(Number.isInteger(q.workLines) && q.workLines >= 3 && q.workLines <= 7, t.id);
      assert.doesNotMatch(JSON.stringify(q), /NaN|undefined|Infinity|<\/?[a-z]/i);
      assert.doesNotMatch([q.prompt, q.answer, ...q.steps].join(' '), /\b1 (?:more )?(?:liters|minutes|meters|cards|tiles|pages)\b/, t.id);
      if (q.table) {
        assert.ok(q.table.headers.every(h => typeof h === 'string'));
        q.table.rows.forEach(row => {
          assert.equal(row.length, q.table.headers.length, t.id);
          assert.ok(row.every(cell => typeof cell === 'string'), t.id);
        });
      }
      for (const g of [q.graph, q.answerGraph].filter(Boolean)) {
        for (const key of ['xMin', 'xMax', 'yMin', 'yMax', 'xStep', 'yStep']) assert.ok(Number.isFinite(g[key]), `${t.id}: ${key}`);
        assert.ok(g.xMax > g.xMin && g.yMax > g.yMin && g.xStep > 0 && g.yStep > 0, t.id);
        for (const p of g.points) {
          assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), t.id);
          assert.ok(p.x >= g.xMin && p.x <= g.xMax && p.y >= g.yMin && p.y <= g.yMax, `${t.id}: point outside grid`);
        }
        g.lines.flat().forEach(p => assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), t.id));
      }
      seen.add(q.practiceKey);
    }
    assert.ok(seen.size >= 12, `${t.id} has only ${seen.size} visible variants`);
  }
});

test('browser globals expose the same generated content as Node modules', () => {
  const context = vm.createContext({});
  vm.runInContext('String.prototype.localeCompare = function () { throw new Error("Locale-sensitive practice identity"); };', context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/lib/lesson-modules/math.js'), 'utf8'), context);
  for (let topic = 2; topic <= 4; topic++) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, `../src/lib/lesson-modules/common-core-math/8/topic-${topic}.js`), 'utf8'), context);
    const browser = context[`LiminalGrade8Topic${topic}`];
    assert.equal(browser.length, groups[topic - 2].length);
    browser.forEach((template, i) => {
      assert.equal(JSON.stringify(template.generate(context.LiminalCourseMath.random('browser'))), JSON.stringify(groups[topic - 2][i].generate(M.random('browser'))));
    });
  }
});

test('practice keys ignore row order, point labels, model labels, and cosmetic units', () => {
  function modified(seed, kind) {
    const rng = M.random(seed);
    return { ...rng,
      shuffle(values) { const shuffled = rng.shuffle(values); return kind === 'reverse' ? shuffled.reverse() : shuffled; },
      pick(values) {
        const value = rng.pick(values);
        if (kind === 'flip-labels' && values.every(v => typeof v === 'boolean')) return !value;
        if (kind === 'units' && values.includes('pages')) return values[(values.indexOf(value) + 1) % values.length];
        return value;
      }
    };
  }
  for (const [id, change] of [
    ['g8-t3-relation-table', 'reverse'],
    ['g8-t4-scatter-outlier', 'reverse'],
    ['g8-t4-compare-fit-lines', 'flip-labels'],
    ['g8-t3-rental-comparison-model', 'flip-labels'],
    ['g8-t2-printing-plans', 'flip-labels'],
    ['g8-t3-square-display-model', 'flip-labels'],
    ['g8-t2-compare-table-equation', 'units']
  ]) {
    let changedDisplays = 0;
    for (let seed = 0; seed < 100; seed++) {
      const template = byId.get(id), original = template.generate(M.random(seed)), changed = template.generate(modified(seed, change));
      assert.equal(original.practiceKey, changed.practiceKey, id);
      if (JSON.stringify([original.prompt, original.table, original.graph]) !== JSON.stringify([changed.prompt, changed.table, changed.graph])) changedDisplays++;
    }
    assert.ok(changedDisplays > 80, `${id}: cosmetic mutation was not exercised`);
  }
  const graphTemplate = byId.get('g8-t2-graph-y-mx');
  const first = graphTemplate.generate({ nonzero: () => 2, int: () => 4 });
  const second = graphTemplate.generate({ nonzero: () => 3, int: () => 6 });
  assert.equal(first.practiceKey, second.practiceKey, 'Equivalent slopes must not count twice');
  const sameAnswer = new Map();
  exercise('g8-t2-both-sides', q => {
    if (!sameAnswer.has(q.answer)) sameAnswer.set(q.answer, new Set());
    sameAnswer.get(q.answer).add(q.practiceKey);
  });
  assert.ok([...sameAnswer.values()].some(keys => keys.size > 10), 'Different equations sharing an answer must remain different inputs');
});

test('expanded pools count mathematical keys, while retaining honest finite limits', () => {
  const minimums = {
    'g8-t2-compare-table-equation': 2000,
    'g8-t2-compare-graph-rate': 3000,
    'g8-t2-slope-triangles': 216,
    'g8-t2-graph-y-mx': 182,
    'g8-t2-intercept-graph': 400,
    'g8-t2-graph-slope-intercept': 450,
    'g8-t2-equation-from-graph': 380,
    'g8-t3-rule-table-graph': 240,
    'g8-t3-vertical-line-points': 320,
    'g8-t3-sketch-filling-rates': 288,
    'g8-t3-square-display-model': 6000,
    'g8-t3-rental-comparison-model': 6000,
    'g8-t4-write-fit-line': 7000,
    'g8-t4-correct-scatter-point': 360
  };
  for (const [id, minimum] of Object.entries(minimums)) {
    const keys = new Set();
    for (let seed = 0; seed < 10000; seed++) keys.add(draw(id, `capacity:${seed}`).practiceKey);
    assert.ok(keys.size >= minimum, `${id}: ${keys.size} canonical items, expected at least ${minimum}`);
  }
  // This is an exact small domain: reduced nonzero slopes with numerator and
  // denominator bounded by 12. Grid size or unreduced forms add no new items.
  const slopes = new Set();
  for (let a = -12; a <= 12; a++) if (a !== 0) for (let b = 1; b <= 12; b++) slopes.add(M.fraction(a, b));
  assert.equal(slopes.size, 182);
});

test('equation answers satisfy the displayed equation and are unique', () => {
  for (const suffix of ['combine-terms', 'both-sides', 'distribute-both-sides', 'fraction-both-sides', 'multistep-subtraction', 'decimal-equation']) {
    exercise(`g8-t2-${suffix}`, q => {
      const equation = q.prompt.match(/^Solve (.*?)\.(?: |$)/)[1];
      const [left, right] = equation.split(' = ');
      const x = fraction(q.answer.slice(4));
      assert.ok(Math.abs(arithmetic(left, x) - arithmetic(right, x)) < 1e-9, q.prompt);
      assert.ok(Math.abs(arithmetic(left, x + 1) - arithmetic(right, x + 1)) > 1e-9, q.prompt);
    });
  }
});

test('special-case equation classifications and parameter choices hold for multiple x values', () => {
  const seen = new Set();
  exercise('g8-t2-classify-solutions', q => {
    const [left, right] = q.prompt.match(/^Does (.*?) have /)[1].split(' = ');
    const leftSlope = arithmetic(left, 1) - arithmetic(left, 0), rightSlope = arithmetic(right, 1) - arithmetic(right, 0);
    const expected = leftSlope !== rightSlope ? 'one' : arithmetic(left, 0) === arithmetic(right, 0) ? 'infinite' : 'none';
    seen.add(expected);
    if (expected === 'one') {
      assert.ok(q.answer.startsWith('One solution:'));
      const x = fraction(q.answer.match(/x = (.*?)\./)[1]);
      assert.ok(Math.abs(arithmetic(left, x) - arithmetic(right, x)) < 1e-9);
      assert.ok(Math.abs(arithmetic(left, x + 1) - arithmetic(right, x + 1)) > 1e-9);
    } else {
      assert.equal(q.answer.startsWith('Infinitely'), expected === 'infinite');
      for (const x of [-19, 0, 7, 31]) assert.equal(arithmetic(left, x) === arithmetic(right, x), expected === 'infinite');
    }
  });
  assert.equal(seen.size, 3);
  exercise('g8-t2-make-solution-type', q => {
    const [left, right] = q.prompt.match(/so that (.*?) has /)[1].split(' = ');
    const k = number(q.answer.match(/k = ([−\d]+)/)[1]);
    const infinite = q.prompt.includes('infinitely many');
    for (const x of [-9, 0, 12]) assert.equal(arithmetic(left, x, k) === arithmetic(right, x, k), infinite);
    if (!infinite) {
      const excluded = number(q.answer.match(/except ([−\d]+)/)[1]);
      assert.equal(arithmetic(left, 5, excluded), arithmetic(right, 5, excluded));
    }
  });
});

test('perimeter and savings answers reproduce the stated quantities', () => {
  exercise('g8-t2-perimeter-equation', q => {
    const [x, width, length] = Array.from(q.answer.matchAll(/\d+/g), m => +m[0]);
    const perimeter = +q.prompt.match(/perimeter is (\d+)/)[1];
    const expression = q.prompt.match(/length (.*?) cm/)[1];
    assert.equal(x, width);
    assert.equal(arithmetic(expression, x), length);
    assert.equal(2 * width + 2 * length, perimeter);
  });
  exercise('g8-t2-equal-savings', q => {
    const [startA, rateA, startB, rateB] = Array.from(q.prompt.matchAll(/\$(\d+)/g), m => +m[1]);
    const [weeks, total] = Array.from(q.answer.matchAll(/\d+/g), m => +m[0]);
    assert.equal(startA + weeks * rateA, total);
    assert.equal(startB + weeks * rateB, total);
  });
});

test('printing plans vary labels and comparison sides while matching displayed costs', () => {
  const branches = new Set();
  exercise('g8-t2-printing-plans', q => {
    const plans = [...q.prompt.matchAll(/Plan ([AB]) charges (.*?)\./g)].map(match => {
      const dollars = [...match[2].matchAll(/\$(\d+)/g)].map(value => +value[1]);
      return dollars.length === 1 ? { rate: dollars[0], fee: 0 } : { rate: dollars[1], fee: dollars[0] };
    });
    assert.equal(plans.length, 2);
    const [a, b] = plans, equalAt = (b.fee - a.fee) / (a.rate - b.rate);
    const direction = q.prompt.includes('above') ? 1 : -1, compareAt = equalAt + direction;
    const winner = a.rate * compareAt + a.fee < b.rate * compareAt + b.fee ? 'A' : 'B';
    assert.ok(q.answer.includes(`; ${equalAt} packs; Plan ${winner} is cheaper at ${compareAt} packs.`));
    const [left, right] = q.answer.split(';')[0].replace(/p/g, 'x').split(' = ');
    for (const x of [0, equalAt, compareAt]) {
      assert.equal(arithmetic(left, x), a.rate * x + a.fee);
      assert.equal(arithmetic(right, x), b.rate * x + b.fee);
    }
    branches.add(`${direction}:${winner}`);
  });
  assert.equal(branches.size, 4);
  const source = byId.get('g8-t2-printing-plans');
  const a = M.random('comparison-side'), b = M.random('comparison-side'), pick = b.pick;
  b.pick = values => { const value = pick(values); return values.includes(-1) ? -value : value; };
  assert.notEqual(source.generate(a).practiceKey, source.generate(b).practiceKey, 'The requested side of break-even is mathematical work');
});

test('proportional table and graph comparisons use common rates and units', () => {
  exercise('g8-t2-compare-table-equation', q => {
    const row = q.table.rows[0].map(Number), a = row[1] / row[0], b = arithmetic(q.prompt.match(/y = (.*?), where/)[1], 1);
    assert.ok(q.answer.startsWith(`Machine ${a > b ? 'A' : 'B'}`));
    assert.ok(Math.abs(fraction(q.answer.match(/; ([\d/]+)/)[1]) - Math.abs(a - b)) < 1e-10);
  });
  exercise('g8-t2-compare-graph-rate', q => {
    const p = q.graph.points[0], a = p.y / p.x, b = +q.prompt.match(/B adds (\d+)/)[1];
    const duration = +q.prompt.match(/in (\d+) minutes/)[1];
    assert.ok(q.answer.startsWith(`Hose ${a > b ? 'A' : 'B'}`));
    assert.ok(Math.abs(fraction(q.answer.match(/; ([\d/]+)/)[1]) - Math.abs(a - b) * duration) < 1e-10);
  });
});

test('slopes and graphed linear answers agree with coordinates', () => {
  exercise('g8-t2-slope-points', q => {
    const [a, b] = q.graph.points;
    const m = fraction(q.answer.match(/m = (.*?);/)[1]);
    assert.equal(m, (b.y - a.y) / (b.x - a.x));
  });
  for (const id of ['g8-t2-equation-from-graph', 'g8-t3-graph-function-rule']) {
    exercise(id, q => {
      const expression = q.answer.replace(/^y = /, '').split(';')[0];
      q.graph.points.forEach(p => assert.ok(arithmetic(expression, p.x) === p.y));
    });
  }
  for (const id of ['g8-t2-graph-y-mx', 'g8-t2-graph-slope-intercept', 'g8-t3-rule-table-graph']) {
    exercise(id, q => {
      const expression = q.prompt.match(/y = (.*?)(?: on |\. |, complete)/)[1];
      q.answerGraph.points.forEach(p => assert.ok(Math.abs(arithmetic(expression, p.x) - p.y) < 1e-9));
      q.answerGraph.lines.flat().forEach(p => assert.ok(Math.abs(arithmetic(expression, p.x) - p.y) < 1e-9));
    });
  }
});

test('table y-intercepts are recovered by independently extending the rate to zero', () => {
  exercise('g8-t2-intercept-table', q => {
    const [[x1, y1], [x2, y2]] = q.table.rows.map(row => row.map(number));
    const m = (y2 - y1) / (x2 - x1), intercept = y1 - m * x1;
    assert.equal(number(q.answer.match(/^\(0, (.*?)\)/)[1]), intercept);
    assert.equal(q.answer.includes('not proportional'), intercept !== 0);
  });
});

test('intercept graphs use neutral labels and readable coordinates without labeling the answer', () => {
  const directions = new Set();
  exercise('g8-t2-intercept-graph', q => {
    assert.ok(q.graph.points.every(p => /^[A-Z]$/.test(p.label)));
    assert.equal(q.graph.yStep, 1);
    const initial = q.graph.points.find(p => p.x === 0);
    assert.equal(+q.answer.match(/^\(0, (\d+)\)/)[1], initial.y);
    assert.ok(q.graph.points.every(p => Number.isInteger(p.y)));
    directions.add(q.graph.points[1].y > initial.y);
  });
  assert.equal(directions.size, 2);
});

test('function decisions reject only an input with conflicting outputs', () => {
  for (const id of ['g8-t3-relation-table', 'g8-t3-vertical-line-points']) {
    const branches = new Set();
    exercise(id, q => {
      const pairs = q.table ? q.table.rows.map(row => row.map(number)) : coordinates(q.graph);
      const mapping = new Map();
      let isFunction = true;
      pairs.forEach(([x, y]) => {
        if (mapping.has(x) && mapping.get(x) !== y) isFunction = false;
        mapping.set(x, y);
      });
      assert.equal(q.answer.startsWith('Yes.'), isFunction);
      branches.add(isFunction);
    });
    assert.equal(branches.size, 2);
  }
});

test('linear versus nonlinear table decisions use equal-step rates', () => {
  const branches = new Set();
  exercise('g8-t3-linear-or-nonlinear-table', q => {
    const rows = q.table.rows.map(row => row.map(number));
    const slopes = rows.slice(1).map(([x, y], i) => (y - rows[i][1]) / (x - rows[i][0]));
    const linear = new Set(slopes).size === 1;
    assert.equal(q.answer.startsWith('Linear;'), linear);
    branches.add(linear);
  });
  assert.equal(branches.size, 2);
  exercise('g8-t3-compare-function-rates', q => {
    const expression = q.prompt.match(/Function A is y = (.*?)\./)[1];
    const [[x1, y1], [x2, y2]] = q.table.rows.map(row => row.map(number));
    const slopeA = arithmetic(expression, 1) - arithmetic(expression, 0), slopeB = (y2 - y1) / (x2 - x1);
    assert.ok(q.answer.startsWith(`Greater rate: Function ${slopeA > slopeB ? 'A' : 'B'}.`));
  });
});

test('two-observation cost models reproduce both displayed totals', () => {
  exercise('g8-t3-two-values-linear-model', q => {
    const inputs = Array.from(q.prompt.matchAll(/(?:for|; for) (\d+) pieces.*?\$(\d+)/g), m => [+m[1], +m[2]]);
    assert.equal(inputs.length, 2);
    const expression = q.answer.match(/^C\(x\) = (.*?);/)[1];
    inputs.forEach(([x, total]) => assert.equal(arithmetic(expression, x), total));
  });
});

test('piecewise graphs and sketch keys follow the stated intervals and rates', () => {
  const orders = new Set();
  let increasingBelowZero = false, decreasingAboveZero = false;
  exercise('g8-t3-increasing-decreasing-graph', q => {
    const points = q.graph.points;
    const directions = points.slice(1).map((p, i) => Math.sign(p.y - points[i].y));
    assert.deepEqual(directions.slice().sort(), [-1, 0, 1]);
    orders.add(directions.join(','));
    const intervals = Object.fromEntries(directions.map((direction, i) => [direction, `${points[i].x} to ${points[i + 1].x}`]));
    assert.equal(q.answer, `Increasing from ${intervals[1]} minutes; constant from ${intervals[0]}; decreasing from ${intervals[-1]}.`);
    points.slice(1).forEach((p, i) => {
      if (directions[i] > 0 && p.y < 0) increasingBelowZero = true;
      if (directions[i] < 0 && p.y > 0) decreasingAboveZero = true;
    });
  });
  assert.equal(orders.size, 6);
  assert.ok(increasingBelowZero && decreasingAboveZero);
  exercise('g8-t3-sketch-walk-rest-return', q => {
    const [distance, outward, rest, inward] = Array.from(q.prompt.matchAll(/\d+/g), m => +m[0]);
    assert.deepEqual(coordinates(q.answerGraph), [[0, 0], [outward, distance], [outward + rest, distance], [outward + rest + inward, 0]]);
    assert.equal(q.graph.points.length, 0);
  });
  exercise('g8-t3-sketch-filling-rates', q => {
    const [initial, slow, firstDuration, fast, secondDuration, stopped] = Array.from(q.prompt.matchAll(/\d+/g), m => +m[0]);
    const volume1 = initial + slow * firstDuration, volume2 = volume1 + fast * secondDuration;
    assert.deepEqual(coordinates(q.answerGraph), [[0, initial], [firstDuration, volume1], [firstDuration + secondDuration, volume2], [firstDuration + secondDuration + stopped, volume2]]);
    assert.equal(q.graph.lines.length, 0);
  });
});

test('model comparisons include either winner and the equal-count case', () => {
  const countComparisons = new Set(), fasterIntervals = new Set(), modelBranches = new Set();
  exercise('g8-t3-square-display-model', q => {
    const models = [...q.prompt.matchAll(/Design ([AB]) uses (.*?)\./g)].map(match => {
      const extra = +match[2].match(/plus (\d+) tiles?/)[1], width = match[2].match(/with (\d+) tiles/);
      const linear = Boolean(width);
      assert.ok(q.answer.includes(`is ${linear ? 'linear' : 'nonlinear'}${match[1] === 'A' ? ';' : '.'}`));
      return { value: x => (linear ? +width[1] * x : x ** 2) + extra, linear };
    });
    const growth = q.prompt.includes('extra tiles to increase'), x = +q.prompt.match(/(?:when n = |increase n from )(\d+)/)[1];
    const values = models.map(model => growth ? model.value(x + 1) - model.value(x) : model.value(x));
    const winner = values[0] === values[1] ? 'equal' : values[0] > values[1] ? 'A' : 'B';
    assert.ok(q.answer.includes(winner === 'equal' ? `the ${growth ? 'increases' : 'counts'} are equal` : `${winner} ${growth ? 'needs more extra tiles' : 'uses more'}`));
    const pairs = Array.from(q.answer.split('Table pairs (A, B): ')[1].matchAll(/\((\d+), (\d+)\)/g), m => [+m[1], +m[2]]);
    assert.deepEqual(pairs, q.table.rows.map(row => models.map(model => model.value(+row[0]))));
    countComparisons.add(`${growth}:${winner}`);
    modelBranches.add(`${growth}:${models[0].linear}`);
  }, 1000);
  exercise('g8-t3-compare-increasing-intervals', q => {
    const [a, b, c] = q.graph.points;
    const first = (b.y - a.y) / (b.x - a.x), second = (c.y - b.y) / (c.x - b.x);
    const interval = first > second ? `0 to ${b.x}` : `${b.x} to ${c.x}`;
    assert.ok(q.answer.startsWith(`Faster from ${interval} seconds.`));
    fasterIntervals.add(first > second);
  });
  assert.equal(countComparisons.size, 6);
  assert.equal(modelBranches.size, 4);
  assert.equal(fasterIntervals.size, 2);
  exercise('g8-t3-rental-comparison-model', q => {
    const [feeA, rateA, feeB, rateB] = Array.from(q.prompt.matchAll(/\$(\d+)/g), m => +m[1]);
    const expected = q.table.rows.map(row => [feeA + rateA * +row[0], feeB + rateB * +row[0]]);
    const actual = Array.from(q.answer.matchAll(/\((\d+), (\d+)\)/g), m => [+m[1], +m[2]]);
    assert.deepEqual(actual, expected);
    assert.equal(actual[1][0], actual[1][1]);
    assert.ok(q.answer.includes(`${actual[0][0] < actual[0][1] ? 'A' : 'B'} is cheaper before`));
    assert.ok(q.answer.includes(`${actual[2][0] < actual[2][1] ? 'A' : 'B'} is cheaper after`));
  });
});

test('scatter association designs include five patterns, with clusters separate from direction', () => {
  const patterns = new Set();
  exercise('g8-t4-scatter-association', q => {
    const points = q.graph.points;
    const outputs = new Map();
    points.forEach(p => outputs.set(p.x, [...(outputs.get(p.x) || []), p.y]));
    const distributions = Array.from(outputs.values(), values => JSON.stringify(values));
    if (new Set(distributions).size === 1) {
      assert.ok(q.answer.startsWith('No association'));
      patterns.add('none');
    } else if (points.some(p => !Number.isInteger(p.x))) {
      const sorted = points.slice().sort((a, b) => a.x - b.x);
      assert.ok(sorted[3].x - sorted[2].x > 3);
      assert.ok(Math.min(...sorted.slice(3).map(p => p.y)) > Math.max(...sorted.slice(0, 3).map(p => p.y)));
      assert.ok(q.answer.startsWith('Two separated clusters, with a positive overall association'));
      patterns.add('clusters');
    } else {
      const differences = points.slice(1).map((p, i) => p.y - points[i].y);
      const secondDifferences = differences.slice(1).map((d, i) => d - differences[i]);
      if (secondDifferences.every(d => d === 2)) {
        assert.ok(q.answer.startsWith('Positive, nonlinear'));
        patterns.add('nonlinear');
      } else {
        const averageX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const covariance = points.reduce((sum, p) => sum + (p.x - averageX) * p.y, 0);
        assert.ok(q.answer.startsWith(covariance > 0 ? 'Positive, approximately linear' : 'Negative, approximately linear'));
        patterns.add(covariance > 0 ? 'positive' : 'negative');
      }
    }
    assert.match(q.answer, /does not establish causation/);
  });
  assert.equal(patterns.size, 5);
});

test('scatter plot construction and point corrections preserve table pairings', () => {
  const patterns = new Set();
  exercise('g8-t4-construct-scatter', q => {
    assert.deepEqual(coordinates(q.answerGraph), q.table.rows.map(row => row.map(Number)));
    assert.equal(q.graph.points.length, 0);
    assert.equal(q.answerGraph.lines.length, 0);
    const points = q.answerGraph.points;
    if (new Set(points.map(p => p.x)).size < points.length) {
      const distributions = [1, 3, 5].map(x => points.filter(p => p.x === x).map(p => p.y).join(','));
      assert.equal(new Set(distributions).size, 1);
      assert.match(q.answer, /no association/);
      patterns.add('none');
    } else {
      const differences = points.slice(1).map((p, i) => p.y - points[i].y);
      if (differences.slice(1).every((d, i) => d - differences[i] === 2)) {
        assert.match(q.answer, /positive and nonlinear/);
        patterns.add('nonlinear');
      } else {
        const covariance = points.reduce((sum, p) => sum + (p.x - 3.5) * p.y, 0);
        assert.ok(q.answer.includes(covariance > 0 ? 'positive and approximately linear' : 'negative and approximately linear'));
        patterns.add(covariance > 0 ? 'positive' : 'negative');
      }
    }
  });
  assert.equal(patterns.size, 4);
  exercise('g8-t4-correct-scatter-point', q => {
    const mismatch = q.graph.points.filter((p, i) => p.x !== +q.table.rows[i][0] || p.y !== +q.table.rows[i][1]);
    assert.equal(mismatch.length, 1);
    const expected = q.table.rows.find(row => +row[0] === mismatch[0].x);
    assert.equal(q.answer, `Point ${mismatch[0].label} should be (${expected[0]}, ${expected[1]}).`);
    assert.ok(q.table.rows.every(([, y]) => +y >= q.graph.yMin && +y <= q.graph.yMax), 'Corrected table values must fit on the same graph');
  });
});

test('outliers have no fixed label, position, trend sign, or side of the trend', () => {
  const labels = new Set(), cases = new Set();
  exercise('g8-t4-scatter-outlier', q => {
    const points = q.graph.points;
    assert.equal(new Set(points.map(p => p.label)).size, 7);
    assert.ok(points.every(p => /^[A-G]$/.test(p.label)));
    // Fit every two-point candidate and find the line with the most nearby
    // observations. This uses only displayed coordinates, not generator data.
    const candidates = [];
    points.forEach((a, i) => points.slice(i + 1).forEach(b => {
      if (a.x === b.x) return;
      const slope = (b.y - a.y) / (b.x - a.x), intercept = a.y - slope * a.x;
      const errors = points.map(p => p.y - (slope * p.x + intercept));
      candidates.push({ slope, errors, near: errors.filter(e => Math.abs(e) <= 2.000001).length, total: errors.reduce((sum, e) => sum + Math.abs(e), 0) });
    }));
    candidates.sort((a, b) => b.near - a.near || a.total - b.total);
    const best = candidates[0];
    assert.equal(best.near, 6);
    const outIndex = best.errors.reduce((largest, error, i) => Math.abs(error) > Math.abs(best.errors[largest]) ? i : largest, 0);
    const outlier = points[outIndex];
    assert.ok(Math.abs(best.errors[outIndex]) > 10);
    assert.ok(q.answer.includes(`${outlier.label}(${outlier.x}, ${String(outlier.y).replace(/-/g, '−')}) is an outlier`));
    assert.ok(q.answer.includes(best.slope > 0 ? 'trend is positive' : 'trend is negative'));
    labels.add(outlier.label);
    cases.add(`${Math.sign(best.slope)},${Math.sign(best.errors[outIndex])}`);
  });
  assert.equal(labels.size, 7);
  assert.equal(cases.size, 4);
});

test('fitted-line comparisons recompute all observed absolute errors', () => {
  const countercues = new Set(), errors = new Set();
  exercise('g8-t4-compare-fit-lines', q => {
    const a = q.prompt.match(/A: y = (.*?) and model/)[1];
    const b = q.prompt.match(/B: y = (.*?)\./)[1];
    assert.deepEqual(q.table.headers, ['x', 'Observed y', 'A prediction', 'A absolute error', 'B prediction', 'B absolute error']);
    const dataRows = q.table.rows.filter(row => row[0] !== 'Total');
    assert.deepEqual(dataRows.map(row => row.slice(0, 2).map(Number)), coordinates(q.graph));
    assert.ok(dataRows.every(row => row.slice(2).every(cell => cell === '____')));
    assert.deepEqual(q.table.rows.at(-1), ['Total', '—', '—', '____', '—', '____']);
    const errorA = dataRows.reduce((sum, row) => sum + Math.abs(+row[1] - arithmetic(a, +row[0])), 0);
    const errorB = dataRows.reduce((sum, row) => sum + Math.abs(+row[1] - arithmetic(b, +row[0])), 0);
    assert.ok(q.answer.startsWith(`Model ${errorA < errorB ? 'A' : 'B'} fits better:`));
    const [best, other] = Array.from(q.answer.matchAll(/\d+/g), m => +m[0]);
    assert.equal(best, Math.min(errorA, errorB));
    assert.equal(other, Math.max(errorA, errorB));
    const winner = errorA < errorB ? 'A' : 'B', bestIntercept = arithmetic(errorA < errorB ? a : b, 0), otherIntercept = arithmetic(errorA < errorB ? b : a, 0);
    countercues.add(`${winner},${bestIntercept < otherIntercept ? 'lower' : 'higher'}`);
    errors.add(best);
  });
  assert.equal(countercues.size, 4);
  assert.ok(errors.size > 10);
  exercise('g8-t4-write-fit-line', q => {
    const expression = q.answer.match(/^y = (.*?)\./)[1];
    q.graph.points.filter(p => p.label).forEach(p => assert.equal(arithmetic(expression, p.x), p.y));
  });
});

test('model prediction answers and interpolation decisions use the given model and range', () => {
  const locations = new Set();
  exercise('g8-t4-model-prediction', q => {
    const [m, b] = q.prompt.match(/t = (\d+)d \+ (\d+)/).slice(1).map(Number);
    const x = +q.prompt.match(/time for (\d+) km/)[1];
    assert.equal(+q.answer.match(/About (\d+)/)[1], m * x + b);
    const outside = x < 2 || x > 10;
    assert.equal(q.answer.includes('extrapolation'), outside);
    locations.add(x < 2 ? 'below' : x > 10 ? 'above' : 'inside');
  });
  assert.equal(locations.size, 3);
  exercise('g8-t4-inverse-prediction', q => {
    const expression = q.prompt.match(/y = (.*?);/)[1];
    const y = +q.prompt.match(/y of (\d+)/)[1], x = +q.answer.match(/x = (\d+)/)[1];
    assert.equal(arithmetic(expression, x), y);
    assert.equal(q.answer.includes('extrapolation'), x < 4 || x > 12);
  });
});

test('frequency counts, missing cells, and conditional denominators agree with displayed tables', () => {
  exercise('g8-t4-two-way-counts', q => {
    const rows = q.table.rows.map(row => row.slice(1).map(Number));
    const [joint, marginal, total] = Array.from(q.answer.matchAll(/\d+/g), m => +m[0]);
    assert.equal(joint, rows[0][0]);
    assert.equal(marginal, rows[0][0] + rows[1][0]);
    assert.equal(total, rows[0][0] + rows[0][1] + rows[1][0] + rows[1][1]);
  });
  exercise('g8-t4-complete-two-way-table', q => {
    const [first, second, total] = q.table.rows;
    const [b, c, dTotal, grand] = Array.from(q.answer.matchAll(/\d+/g), m => +m[0]);
    assert.equal(+first[1] + b, +first[3]);
    assert.equal(c + +second[2], +second[3]);
    assert.equal(+first[1] + c, +total[1]);
    assert.equal(dTotal, b + +second[2]);
    assert.equal(grand, +total[1] + dTotal);
  });
  const conditionBranches = new Set(), totals = new Set();
  let nonCopyingJoint = 0, fractionalAnswers = 0;
  exercise('g8-t4-relative-frequency-denominators', q => {
    const [morning, afternoon, total] = q.table.rows;
    const [, group, preference] = q.prompt.match(/in the (morning|afternoon) group and prefer (outdoors|indoors)/);
    const row = group === 'morning' ? morning : afternoon, column = preference === 'outdoors' ? 1 : 2;
    const rowCondition = q.prompt.includes(`(b) the percentage of the ${group} group`);
    const joint = +row[column], denominator = +(rowCondition ? row[3] : total[column]);
    const values = Array.from(q.answer.matchAll(/([\d/]+)\)?%/g), m => fraction(m[1]));
    assert.equal(values.length, 2);
    assert.ok(Math.abs(values[0] - joint / +total[3] * 100) < 1e-10);
    assert.ok(Math.abs(values[1] - joint / denominator * 100) < 1e-10);
    assert.equal(+morning[3] + +afternoon[3], +total[3]);
    conditionBranches.add(`${group}:${preference}:${rowCondition}`);
    totals.add(+total[3]);
    if (values[0] !== joint) nonCopyingJoint++;
    if (q.answer.includes('/')) fractionalAnswers++;
  });
  assert.equal(conditionBranches.size, 8);
  assert.ok(totals.size >= 8);
  assert.ok(nonCopyingJoint >= 300);
  assert.ok(fractionalAnswers >= 100);
  const conditional = byId.get('g8-t4-relative-frequency-denominators');
  const first = M.random('condition-identity'), second = M.random('condition-identity'), pick = second.pick;
  second.pick = values => {
    const chosen = pick(values);
    return values.includes('row') ? chosen === 'row' ? 'column' : 'row' : chosen;
  };
  const a = conditional.generate(first), b = conditional.generate(second);
  assert.deepEqual(a.table, b.table);
  assert.notEqual(a.practiceKey, b.practiceKey, 'Reversing the condition changes the mathematical task');
  const branches = new Set();
  exercise('g8-t4-compare-conditional-frequencies', q => {
    const [morning, afternoon] = q.table.rows;
    const values = Array.from(q.answer.matchAll(/(\d+)%/g), m => +m[1]);
    assert.ok(Math.abs(values[0] - +morning[1] / +morning[3] * 100) < 1e-10);
    assert.ok(Math.abs(values[1] - +afternoon[1] / +afternoon[3] * 100) < 1e-10);
    const different = values[0] !== values[1];
    assert.equal(q.answer.includes('no association'), !different);
    branches.add(different);
  });
  assert.equal(branches.size, 2);
});
