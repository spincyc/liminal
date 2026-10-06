const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const M = require('../src/lib/courses/math.js');
const groups = [2, 3, 4].map(topic => require(`../src/lib/courses/grade8-topic${topic}.js`));
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
      seen.add(JSON.stringify([q.prompt, q.table, q.graph]));
    }
    assert.ok(seen.size >= 12, `${t.id} has only ${seen.size} visible variants`);
  }
});

test('browser globals expose the same generated content as Node modules', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/lib/courses/math.js'), 'utf8'), context);
  for (let topic = 2; topic <= 4; topic++) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, `../src/lib/courses/grade8-topic${topic}.js`), 'utf8'), context);
    const browser = context[`LiminalGrade8Topic${topic}`];
    assert.equal(browser.length, groups[topic - 2].length);
    browser.forEach((template, i) => {
      assert.equal(JSON.stringify(template.generate(context.LiminalCourseMath.random('browser'))), JSON.stringify(groups[topic - 2][i].generate(M.random('browser'))));
    });
  }
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
    const infinite = q.answer.startsWith('Infinitely');
    seen.add(infinite);
    for (const x of [-19, 0, 7, 31]) assert.equal(arithmetic(left, x) === arithmetic(right, x), infinite);
  });
  assert.equal(seen.size, 2);
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

test('proportional table and graph comparisons use common rates and units', () => {
  exercise('g8-t2-compare-table-equation', q => {
    const row = q.table.rows[0].map(Number), a = row[1] / row[0], b = +q.prompt.match(/y = (\d+)x/)[1];
    assert.ok(q.answer.startsWith(`Machine ${a > b ? 'A' : 'B'}`));
    assert.equal(+q.answer.match(/; (\d+)/)[1], Math.abs(a - b));
  });
  exercise('g8-t2-compare-graph-rate', q => {
    const p = q.graph.points[0], a = p.y / p.x, b = +q.prompt.match(/B adds (\d+)/)[1];
    const duration = +q.prompt.match(/in (\d+) minutes/)[1];
    assert.ok(q.answer.startsWith(`Hose ${a > b ? 'A' : 'B'}`));
    assert.equal(+q.answer.match(/; (\d+)/)[1], Math.abs(a - b) * duration);
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
  exercise('g8-t3-increasing-decreasing-graph', q => {
    const points = q.graph.points;
    assert.ok(points[1].y > points[0].y);
    assert.equal(points[2].y, points[1].y);
    assert.ok(points[3].y < points[2].y);
    assert.equal(q.answer, `Increasing from 0 to ${points[1].x} minutes; constant from ${points[1].x} to ${points[2].x}; decreasing from ${points[2].x} to ${points[3].x}.`);
  });
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
  const countComparisons = new Set(), fasterIntervals = new Set();
  exercise('g8-t3-square-display-model', q => {
    const width = +q.prompt.match(/with (\d+) tiles/)[1], x = +q.prompt.match(/when n = (\d+)/)[1];
    const winner = width === x ? 'equal' : width > x ? 'A' : 'B';
    assert.ok(q.answer.includes(winner === 'equal' ? 'the counts are equal' : `${winner} uses more`));
    countComparisons.add(winner);
  });
  exercise('g8-t3-compare-increasing-intervals', q => {
    const [a, b, c] = q.graph.points;
    const first = (b.y - a.y) / (b.x - a.x), second = (c.y - b.y) / (c.x - b.x);
    const interval = first > second ? `0 to ${b.x}` : `${b.x} to ${c.x}`;
    assert.ok(q.answer.startsWith(`Faster from ${interval} seconds.`));
    fasterIntervals.add(first > second);
  });
  assert.equal(countComparisons.size, 3);
  assert.equal(fasterIntervals.size, 2);
});

test('scatter association designs show positive, negative, nonlinear, and no-association patterns', () => {
  const patterns = new Set();
  exercise('g8-t4-scatter-association', q => {
    const points = q.graph.points;
    const outputs = new Map();
    points.forEach(p => outputs.set(p.x, [...(outputs.get(p.x) || []), p.y]));
    const distributions = Array.from(outputs.values(), values => JSON.stringify(values));
    if (new Set(distributions).size === 1) {
      assert.ok(q.answer.startsWith('No association'));
      patterns.add('none');
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
  assert.equal(patterns.size, 4);
});

test('scatter plot construction and point corrections preserve table pairings', () => {
  exercise('g8-t4-construct-scatter', q => {
    assert.deepEqual(coordinates(q.answerGraph), q.table.rows.map(row => row.map(Number)));
    assert.equal(q.graph.points.length, 0);
    assert.equal(q.answerGraph.lines.length, 0);
  });
  exercise('g8-t4-correct-scatter-point', q => {
    const mismatch = q.graph.points.filter((p, i) => p.x !== +q.table.rows[i][0] || p.y !== +q.table.rows[i][1]);
    assert.equal(mismatch.length, 1);
    const expected = q.table.rows.find(row => +row[0] === mismatch[0].x);
    assert.equal(q.answer, `Point ${mismatch[0].label} should be (${expected[0]}, ${expected[1]}).`);
  });
});

test('fitted-line comparisons recompute all observed absolute errors', () => {
  exercise('g8-t4-compare-fit-lines', q => {
    const a = q.prompt.match(/A: y = (.*?) and model/)[1];
    const b = q.prompt.match(/B: y = (.*?)\./)[1];
    const errorA = q.graph.points.reduce((sum, p) => sum + Math.abs(p.y - arithmetic(a, p.x)), 0);
    const errorB = q.graph.points.reduce((sum, p) => sum + Math.abs(p.y - arithmetic(b, p.x)), 0);
    assert.ok(q.answer.startsWith(`Model ${errorA < errorB ? 'A' : 'B'} fits better:`));
    const [best, other] = Array.from(q.answer.matchAll(/\d+/g), m => +m[0]);
    assert.equal(best, Math.min(errorA, errorB));
    assert.equal(other, Math.max(errorA, errorB));
  });
  exercise('g8-t4-write-fit-line', q => {
    const expression = q.answer.match(/^y = (.*?)\./)[1];
    q.graph.points.filter(p => p.label).forEach(p => assert.equal(arithmetic(expression, p.x), p.y));
  });
});

test('model prediction answers and interpolation decisions use the given model and range', () => {
  exercise('g8-t4-model-prediction', q => {
    const [m, b] = q.prompt.match(/t = (\d+)d \+ (\d+)/).slice(1).map(Number);
    const x = +q.prompt.match(/time for (\d+) km/)[1];
    assert.equal(+q.answer.match(/About (\d+)/)[1], m * x + b);
    assert.ok(x >= 2 && x <= 10);
  });
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
  exercise('g8-t4-relative-frequency-denominators', q => {
    const [morning, afternoon, total] = q.table.rows;
    const values = Array.from(q.answer.matchAll(/([\d/]+)\)?%/g), m => fraction(m[1]));
    assert.equal(values.length, 2);
    assert.ok(Math.abs(values[0] - +morning[1] / +total[3] * 100) < 1e-10);
    assert.ok(Math.abs(values[1] - +morning[1] / +morning[3] * 100) < 1e-10);
    assert.equal(+morning[3] + +afternoon[3], +total[3]);
  });
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
