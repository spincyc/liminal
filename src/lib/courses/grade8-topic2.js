(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./math.js'));
  else root.LiminalGrade8Topic2 = factory(root.LiminalCourseMath);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';

  const n = value => String(value).replace(/-/g, '−');
  const term = (a, variable = 'x') => a === 1 ? variable : a === -1 ? `−${variable}` : `${n(a)}${variable}`;
  const add = b => b < 0 ? ` − ${n(-b)}` : ` + ${n(b)}`;
  const linear = (a, b, variable = 'x') => `${term(a, variable)}${b === 0 ? '' : add(b)}`;
  const frac = (a, b) => M.fraction(a, b).replace(/-/g, '−');
  const rationalTerm = (a, b) => b === 1 ? term(a) : `(${frac(a, b)})x`;
  const counted = (count, plural) => `${count} ${count === 1 ? plural.slice(0, -1) : plural}`;
  const key = (task, ...givens) => JSON.stringify([task, ...givens]);
  // Canonical givens use code-unit ordering, independent of the viewer's locale.
  const ordered = values => values.slice().sort((a, b) => { const x = JSON.stringify(a), y = JSON.stringify(b); return x < y ? -1 : x > y ? 1 : 0; });
  function slope(r, maxNumerator, maxDenominator) {
    const a = r.nonzero(-maxNumerator, maxNumerator), b = r.int(1, maxDenominator), factor = M.gcd(a, b);
    return [a / factor, b / factor];
  }
  const point = (x, y, label) => ({ x, y, ...(label ? { label } : {}) });
  function graph(points, lines = [], settings = {}) {
    return { xMin: -8, xMax: 8, yMin: -10, yMax: 10, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y', points, lines, ...settings };
  }
  const templates = [];
  function design(id, lessonId, skill, generate) { templates.push({ id: `g8-t2-${id}`, lessonId, skill, generate }); }

  design('combine-terms', '2-1', 'Combine like terms', r => {
    const a = r.int(2, 9), b = r.int(2, 8), c = r.int(-15, 15), x = r.int(-12, 12), right = (a + b) * x + c;
    return {
      practiceKey: key('g8-t2-combine-terms', ordered([a, b]), c, right),
      prompt: `Solve ${term(a)}${add(c)} + ${term(b)} = ${n(right)}. Show how you combine like terms.`,
      answer: `x = ${n(x)}`,
      steps: [`Combine the x terms: ${term(a + b)}${add(c)} = ${n(right)}.`, `Subtract ${n(c)} from both sides: ${term(a + b)} = ${n(right - c)}.`, `Divide both sides by ${a + b}: x = ${n(x)}.`],
      workLines: 4
    };
  });

  design('perimeter-equation', '2-1', 'Model and combine like terms', r => {
    const a = r.int(2, 5), b = r.int(2, 8), x = r.int(2, 12), perimeter = 2 * ((a + 1) * x + b);
    return {
      practiceKey: key('g8-t2-perimeter-equation', a, b, perimeter),
      prompt: `A rectangle has width x cm and length ${linear(a, b)} cm. Its perimeter is ${perimeter} cm. Write and solve an equation for x, then give the length and width.`,
      answer: `x = ${x}; width ${x} cm; length ${a * x + b} cm`,
      steps: [`The four sides total x + x + (${linear(a, b)}) + (${linear(a, b)}) = ${perimeter}.`, `Combine like terms: ${term(2 * (a + 1))} + ${2 * b} = ${perimeter}.`, `${term(2 * (a + 1))} = ${perimeter - 2 * b}, so x = ${x}.`, `The length is ${a}(${x}) + ${b} = ${a * x + b} cm.`],
      workLines: 5
    };
  });

  design('both-sides', '2-2', 'Solve with variables on both sides', r => {
    const a = r.nonzero(-8, 8), shift = r.nonzero(-6, 6), c = a + shift === 0 ? a - shift : a + shift, x = r.int(-12, 12), b = r.int(-18, 18), d = (a - c) * x + b;
    return {
      practiceKey: key('g8-t2-both-sides', ordered([[a, b], [c, d]])),
      prompt: `Solve ${linear(a, b)} = ${linear(c, d)}.`,
      answer: `x = ${n(x)}`,
      steps: [`Subtract ${term(c)} from both sides: ${linear(a - c, b)} = ${n(d)}.`, `Subtract ${n(b)} from both sides: ${term(a - c)} = ${n(d - b)}.`, `Divide by ${n(a - c)}: x = ${n(x)}.`],
      workLines: 4
    };
  });

  design('equal-savings', '2-2', 'Model equal amounts', r => {
    const weeks = r.int(3, 12), slow = r.int(3, 8), fast = slow + r.int(2, 6), start = r.int(5, 30), headStart = (fast - slow) * weeks;
    return {
      practiceKey: key('g8-t2-equal-savings', ordered([[fast, start], [slow, start + headStart]])),
      prompt: `Ari has $${start} and saves $${fast} each week. Bea has $${start + headStart} and saves $${slow} each week. After how many weeks will they have the same amount, and what is that amount? Assume both keep these rates.`,
      answer: `${weeks} weeks; $${start + fast * weeks} each`,
      steps: [`Let w be weeks. Set the amounts equal: ${start} + ${fast}w = ${start + headStart} + ${slow}w.`, `${fast - slow}w = ${headStart}, so w = ${weeks}.`, `Substitute into either savings expression: ${start} + ${fast}(${weeks}) = ${start + fast * weeks}.`],
      workLines: 5
    };
  });

  design('distribute-both-sides', '2-3', 'Distribute on both sides', r => {
    const a = r.int(2, 7), c = a + r.int(1, 5), b = r.int(-8, 8), d = r.int(-8, 8), x = r.int(-10, 10), extra = a * (x + b) - c * (x + d);
    return {
      practiceKey: key('g8-t2-distribute-both-sides', a, b, c, d, extra),
      prompt: `Solve ${a}(x${add(b)}) = ${c}(x${add(d)})${add(extra)}.`,
      answer: `x = ${n(x)}`,
      steps: [`Distribute: ${linear(a, a * b)} = ${linear(c, c * d + extra)}.`, `Collect variable terms and constants: ${term(a - c)} = ${n(c * d + extra - a * b)}.`, `Divide by ${n(a - c)}: x = ${n(x)}.`],
      workLines: 5
    };
  });

  design('fraction-both-sides', '2-4', 'Clear denominators', r => {
    const p = r.int(2, 6), q = p + r.int(1, 4), b = r.int(-8, 8), d = r.int(-8, 8), numerator = p * d - q * b, denominator = q - p;
    return {
      practiceKey: key('g8-t2-fraction-both-sides', ordered([[p, b], [q, d]])),
      prompt: `Solve (x${add(b)})/${p} = (x${add(d)})/${q}.`,
      answer: `x = ${frac(numerator, denominator)}`,
      steps: [`Multiply both sides by ${p * q}: ${q}(x${add(b)}) = ${p}(x${add(d)}).`, `Distribute and collect: ${term(q - p)} = ${n(numerator)}.`, `Divide by ${denominator}: x = ${frac(numerator, denominator)}.`],
      workLines: 5
    };
  });

  design('multistep-subtraction', '2-3', 'Solve with subtraction and distribution', r => {
    const a = r.int(4, 9), b = r.int(2, a - 1), c = r.int(-9, 9), d = r.int(-12, 12), x = r.int(-10, 10), right = a * x - b * (x + c) + d;
    return {
      practiceKey: key('g8-t2-multistep-subtraction', a, b, c, d, right),
      prompt: `Solve ${term(a)} − ${b}(x${add(c)})${add(d)} = ${n(right)}.`,
      answer: `x = ${n(x)}`,
      steps: [`Distribute the negative factor: ${term(a)} − ${term(b)}${add(-b * c)}${add(d)} = ${n(right)}.`, `Combine like terms: ${linear(a - b, d - b * c)} = ${n(right)}.`, `${term(a - b)} = ${n(right - d + b * c)}, so x = ${n(x)}.`],
      workLines: 5
    };
  });

  design('decimal-equation', '2-4', 'Solve equations with decimal coefficients', r => {
    const a = r.int(2, 9), c = r.int(1, a - 1), b = r.int(-15, 15), x = r.int(-10, 10), d = (a - c) * x + b;
    return {
      practiceKey: key('g8-t2-decimal-equation', ordered([[a, b], [c, d]])),
      prompt: `Solve ${linear(a / 10, b / 10)} = ${linear(c / 10, d / 10)}.`,
      answer: `x = ${n(x)}`,
      steps: [`Multiply every term by 10: ${linear(a, b)} = ${linear(c, d)}.`, `Collect terms: ${term(a - c)} = ${n(d - b)}.`, `Divide by ${a - c}: x = ${n(x)}.`],
      workLines: 5
    };
  });

  design('classify-solutions', '2-5', 'Classify an equation’s solutions', r => {
    const a = r.int(2, 8), b = r.int(-9, 9), kind = r.pick(['one', 'none', 'infinite']), coefficient = kind === 'one' ? a + r.int(1, 5) : a, offset = kind === 'infinite' ? 0 : r.nonzero(-12, 12), c = a * b + offset;
    return {
      practiceKey: key('g8-t2-classify-solutions', a, b, coefficient, c),
      prompt: `Does ${a}(x${add(b)}) = ${linear(coefficient, c)} have one solution, no solution, or infinitely many solutions? Explain.`,
      answer: kind === 'infinite' ? 'Infinitely many solutions; every real number works.' : kind === 'none' ? 'No solution.' : `One solution: x = ${frac(offset, a - coefficient)}.`,
      steps: [`Distribute: ${linear(a, a * b)} = ${linear(coefficient, c)}.`, kind === 'one' ? `Collect terms: ${term(a - coefficient)} = ${n(offset)}.` : `Subtract ${term(a)} from both sides to get ${n(a * b)} = ${n(c)}.`, kind === 'infinite' ? 'This statement is always true, independent of x.' : kind === 'none' ? 'This statement is false, regardless of x.' : `The remaining coefficient is nonzero, so division gives exactly one value: x = ${frac(offset, a - coefficient)}.`],
      workLines: 4
    };
  });

  design('make-solution-type', '2-5', 'Create an equation with a specified solution set', r => {
    const a = r.int(2, 8), b = r.int(-8, 8), wanted = r.pick(['infinitely many solutions', 'no solution']), example = a * b + r.nonzero(-8, 8);
    return {
      practiceKey: key('g8-t2-make-solution-type', a, b, wanted),
      prompt: `Choose a value of k so that ${a}(x${add(b)}) = ${term(a)} + k has ${wanted}. Explain which k values work.`,
      answer: wanted === 'infinitely many solutions' ? `k = ${n(a * b)}` : `Any k except ${n(a * b)}; for example, k = ${n(example)}.`,
      steps: [`The left side becomes ${linear(a, a * b)}.`, `Subtracting ${term(a)} leaves ${n(a * b)} = k.`, wanted === 'infinitely many solutions' ? `Choose k = ${n(a * b)} so the equality is true for every x.` : `Choose any k other than ${n(a * b)} so the equality is false for every x.`],
      workLines: 4
    };
  });

  design('printing-plans', '2-6', 'Compare two original linear cost models', r => {
    const packs = r.int(4, 16), low = r.int(2, 6), high = low + r.int(1, 4), fee = (high - low) * packs;
    const swap = r.pick([true, false]), direction = r.pick([-1, 1]), compareAt = packs + direction;
    const rateA = swap ? low : high, feeA = swap ? fee : 0, rateB = swap ? high : low, feeB = swap ? 0 : fee;
    const describe = (rate, setup) => setup ? `a $${setup} setup fee plus $${rate} per pack` : `$${rate} per pack`;
    const costA = feeA + rateA * compareAt, costB = feeB + rateB * compareAt;
    const equation = `${linear(rateA, feeA, 'p')} = ${linear(rateB, feeB, 'p')}`;
    return {
      practiceKey: key('g8-t2-printing-plans', ordered([[rateA, feeA], [rateB, feeB]]), compareAt),
      prompt: `A school print club compares two plans for identical poster packs. Plan A charges ${describe(rateA, feeA)}. Plan B charges ${describe(rateB, feeB)}. Write an equation to find when the costs match, solve it, and identify the cheaper plan one pack ${direction > 0 ? 'above' : 'below'} that amount.`,
      answer: `${equation}; ${packs} packs; Plan ${costA < costB ? 'A' : 'B'} is cheaper at ${compareAt} packs.`,
      steps: [`Let p be the number of packs: ${equation}.`, `Collect terms: ${term(rateA - rateB, 'p')} = ${n(feeB - feeA)}, so p = ${packs}. Both plans cost $${high * packs}.`, `At ${compareAt} packs, Plan A costs $${costA} and Plan B costs $${costB}.`],
      workLines: 6
    };
  });

  design('container-capacity', '2-6', 'Interpret an original equation model', r => {
    const per = r.int(3, 9), boxes = r.int(3, 9), extra = r.int(1, 8), identical = r.pick([true, false]), right = per * boxes + (identical ? 0 : extra);
    return {
      practiceKey: key('g8-t2-container-capacity', per, boxes, right),
      prompt: `One organizer describes a display as ${per} shelves, each holding x items plus ${boxes} labels. Another describes it as ${per}x items plus ${right} labels. They count items and labels together as pieces. Can their total-piece expressions be equal for one x value, every x value, or no x value? Model and explain.`,
      answer: identical ? 'Every allowed x value (nonnegative whole numbers).' : 'No x value.',
      steps: [`Set the totals equal: ${per}(x + ${boxes}) = ${per}x + ${right}.`, `Distribute and subtract ${per}x: ${per * boxes} = ${right}.`, identical ? 'The totals are identical. The setting permits nonnegative whole-number item counts.' : 'The fixed label counts differ, so changing x cannot make the totals equal.'],
      workLines: 5
    };
  });

  design('compare-table-equation', '2-7', 'Compare proportional rates', r => {
    const numerator = r.int(4, 30), denominator = r.int(2, 8), rateB = r.pick(Array.from({ length: 15 }, (_, i) => i + 1).filter(value => value * denominator !== numerator)), unit = r.pick(['pages', 'tiles', 'cards']);
    const rateA = numerator / denominator, difference = frac(Math.abs(numerator - rateB * denominator), denominator);
    return {
      practiceKey: key('g8-t2-compare-table-equation', numerator, denominator, rateB),
      prompt: `Machine A’s constant production appears in the table. Machine B produces y = ${term(rateB)}, where x is minutes and y is ${unit}. Which machine produces more per minute, and by how much?`,
      table: { headers: ['Minutes', `Machine A (${unit})`], rows: [1, 2, 3].map(k => [String(k * denominator), String(k * numerator)]) },
      answer: `Machine ${numerator > rateB * denominator ? 'A' : 'B'}; ${difference} more ${difference === '1' ? unit.slice(0, -1) : unit} per minute.`,
      steps: [`Machine A’s unit rate is ${numerator}/${denominator} = ${frac(numerator, denominator)} ${rateA === 1 ? unit.slice(0, -1) : unit} per minute.`, `The coefficient in Machine B’s equation is ${counted(rateB, unit)} per minute.`, `Use a common denominator to subtract the rates; their positive difference is ${difference}.`],
      workLines: 4
    };
  });

  design('compare-graph-rate', '2-7', 'Compare a graph with a proportional rate', r => {
    const rawNumerator = r.int(1, 12), rawDenominator = r.int(1, 6), factor = M.gcd(rawNumerator, rawDenominator), numerator = rawNumerator / factor, denominator = rawDenominator / factor;
    const b = r.pick(Array.from({ length: 12 }, (_, i) => i + 1).filter(value => value * denominator !== numerator)), run = r.int(2, 12), difference = Math.abs(numerator - b * denominator);
    return {
      practiceKey: key('g8-t2-compare-graph-rate', frac(numerator, denominator), b, run),
      prompt: `The graph shows water added by hose A at a constant rate. Hose B adds ${counted(b, 'liters')} each minute. Which hose is faster, and how many more liters will it add in ${run} minutes?`,
      graph: graph([point(denominator, numerator, 'A')], [[point(0, 0), point(denominator, numerator)]], { xMin: 0, xMax: denominator + 1, yMin: 0, yMax: numerator + 2, xLabel: 'Minutes', yLabel: 'Liters' }),
      answer: `Hose ${numerator > b * denominator ? 'A' : 'B'}; ${frac(difference * run, denominator)} more ${difference * run === denominator ? 'liter' : 'liters'}.`,
      steps: [`Hose A’s rate is ${numerator}/${denominator} = ${frac(numerator, denominator)} ${numerator === denominator ? 'liter' : 'liters'} per minute.`, `Compare ${frac(numerator, denominator)} with ${b}. The faster hose adds ${frac(difference, denominator)} more ${difference === denominator ? 'liter' : 'liters'} each minute.`, `Over ${run} minutes, the difference is (${frac(difference, denominator)}) × ${run} = ${frac(difference * run, denominator)} ${difference * run === denominator ? 'liter' : 'liters'}.`],
      workLines: 4
    };
  });

  design('slope-points', '2-8', 'Read rise and run from a graph', r => {
    const dx = r.int(2, 6), dy = r.nonzero(-7, 7), x = r.int(-6, 0), y = r.int(-2, 2);
    return {
      practiceKey: key('g8-t2-slope-points', ordered([[x, y], [x + dx, y + dy]])),
      prompt: 'Find the slope of the line through the two plotted points. Give an exact fraction or integer and explain the sign.',
      graph: graph([point(x, y, 'A'), point(x + dx, y + dy, 'B')], [[point(x, y), point(x + dx, y + dy)]]),
      answer: `m = ${frac(dy, dx)}; the line ${dy > 0 ? 'rises' : 'falls'} from left to right.`,
      steps: [`From A to B, the vertical change is ${n(y + dy)} − (${n(y)}) = ${n(dy)}.`, `The horizontal change is ${n(x + dx)} − (${n(x)}) = ${dx}.`, `Slope = vertical change / horizontal change = ${frac(dy, dx)}.`],
      workLines: 4
    };
  });

  design('slope-triangles', '2-8', 'Explain equal slopes using scaled triangles', r => {
    const rise = r.nonzero(-6, 6), run = r.int(1, 6), factor = r.int(2, 4);
    return {
      practiceKey: key('g8-t2-slope-triangles', ordered([[0, 0], [run, rise], [factor * run, factor * rise]])),
      prompt: `A line through the origin also passes through A(${run}, ${n(rise)}) and B(${factor * run}, ${n(factor * rise)}). Find its slope using each point and the origin. Explain why the two ratios agree.`,
      graph: graph([point(0, 0, 'O'), point(run, rise, 'A'), point(factor * run, factor * rise, 'B')], [[point(0, 0), point(factor * run, factor * rise)]], { xMin: 0, xMax: factor * run + 2, yMin: Math.min(0, factor * rise) - 2, yMax: Math.max(0, factor * rise) + 2, xStep: 2, yStep: 2 }),
      answer: `${n(rise)}/${run} = ${n(factor * rise)}/${factor * run} = ${frac(rise, run)}; both directed changes scale by ${factor}.`,
      steps: [`Using A gives vertical change / horizontal change = ${n(rise)}/${run}.`, `Using B gives ${n(factor * rise)}/${factor * run}.`, `The larger right triangle scales both leg lengths by ${factor}; the vertical changes have the same sign, and the common factor cancels.`],
      workLines: 4
    };
  });

  design('graph-y-mx', '2-9', 'Graph a proportional equation', r => {
    const [a, b] = slope(r, 12, 12), points = [-1, 0, 1].map(k => point(k * b, k * a)), settings = { xMin: -13, xMax: 13, yMin: -13, yMax: 13 };
    return {
      practiceKey: key('g8-t2-graph-y-mx', frac(a, b)),
      prompt: `Graph y = ${rationalTerm(a, b)} on the coordinate grid. Plot at least three points, including the origin, and state the slope.`,
      graph: graph([], [], settings),
      answerGraph: graph(points, [[point(-13, -13 * a / b), point(13, 13 * a / b)]], settings),
      answer: `Slope ${frac(a, b)}; a straight line through (0, 0), (${b}, ${n(a)}), and (${n(-b)}, ${n(-a)}).`,
      steps: [`At x = 0, y = 0.`, `Increasing x by ${b} changes y by ${n(a)}.`, 'Plot the points and draw the straight line through them, extending it across the grid.'],
      workLines: 3
    };
  });

  design('proportional-missing-value', '2-9', 'Find an equation of a proportional relationship', r => {
    const a = r.int(2, 9), b = r.int(2, 8), multiple = r.int(2, 6), target = b * multiple;
    return {
      practiceKey: key('g8-t2-proportional-missing-value', b, a, target),
      prompt: `A proportional relationship contains the point (${b}, ${a}). Write an equation relating y and x. Then find y when x = ${target}.`,
      answer: `y = (${frac(a, b)})x; y = ${a * multiple} when x = ${target}.`,
      steps: [`A proportional relationship has the form y = mx.`, `m = y/x = ${a}/${b} = ${frac(a, b)}.`, `At x = ${target}, y = (${frac(a, b)})(${target}) = ${a * multiple}.`],
      workLines: 4
    };
  });

  design('intercept-graph', '2-10', 'Interpret a y-intercept', r => {
    const [rise, run] = slope(r, 6, 4), b = r.int(Math.max(2, 1 - rise), 15), filling = rise > 0;
    const settings = { xMin: 0, xMax: run + 1, yMin: 0, yMax: Math.max(b, b + rise) + 2, xLabel: `Minutes after ${filling ? 'filling' : 'draining'} starts`, yLabel: 'Liters in tank' };
    return {
      practiceKey: key('g8-t2-intercept-graph', frac(rise, run), b),
      prompt: `The graph models the water in a tank as it ${filling ? 'fills' : 'drains'}. State the y-intercept as an ordered pair and explain what it means in this setting.`,
      graph: graph([point(0, b, 'A'), point(run, b + rise, 'B')], [[point(0, b), point(run, b + rise)]], settings),
      answer: `(0, ${b}); the tank contains ${b} liters when ${filling ? 'filling' : 'draining'} starts.`,
      steps: ['The y-intercept is where x = 0.', `The graph meets the vertical axis at y = ${b}.`, `Here x = 0 means the moment ${filling ? 'filling' : 'draining'} starts, not an empty tank.`],
      workLines: 3
    };
  });

  design('intercept-table', '2-10', 'Find an initial value from a linear table', r => {
    const m = r.nonzero(-4, 5), b = r.int(-8, 10), start = r.int(2, 5);
    return {
      practiceKey: key('g8-t2-intercept-table', m, b, start),
      prompt: 'The table follows one linear relationship. Find its y-intercept even though x = 0 is not shown. Is this relationship proportional? Explain.',
      table: { headers: ['x', 'y'], rows: [start, start + 1, start + 2].map(x => [String(x), n(m * x + b)]) },
      answer: `(0, ${n(b)}); ${b === 0 ? 'proportional' : 'not proportional'}.`,
      steps: [`For each increase of 1 in x, y changes by ${n(m)}, so m = ${n(m)}.`, `Use y = mx + b: ${n(m * start + b)} = (${n(m)})(${start}) + b, giving b = ${n(m * start + b)} − (${n(m * start)}) = ${n(b)}.`, b === 0 ? 'The linear graph passes through the origin, so y = mx is proportional.' : 'The nonzero y-intercept means the linear graph does not pass through the origin.'],
      workLines: 4
    };
  });

  design('graph-slope-intercept', '2-11', 'Graph slope-intercept form', r => {
    const [p, q] = slope(r, 5, 5), b = r.nonzero(-6, 6), points = [-1, 0, 1].map(k => point(k * q, k * p + b)), equation = `${rationalTerm(p, q)}${add(b)}`, settings = { yMin: -12, yMax: 12 };
    return {
      practiceKey: key('g8-t2-graph-slope-intercept', frac(p, q), b),
      prompt: `Graph y = ${equation}. State the slope and y-intercept and mark at least three points.`,
      graph: graph([], [], settings),
      answerGraph: graph(points, [[point(-8, b - 8 * p / q), point(8, b + 8 * p / q)]], settings),
      answer: `Slope ${frac(p, q)}; y-intercept (0, ${n(b)}). Points include (${n(-q)}, ${n(b - p)}), (0, ${n(b)}), and (${q}, ${n(b + p)}).`,
      steps: [`Start at (0, ${n(b)}).`, `For a horizontal change of +${q}, change y by ${n(p)}.`, 'Draw the straight line through the points and extend it across the grid.'],
      workLines: 3
    };
  });

  design('equation-from-graph', '2-11', 'Write slope-intercept form from a graph', r => {
    const [p, q] = slope(r, 5, 4), b = r.int(-6, 6), first = point(-q, b - p, 'A'), last = point(q, b + p, 'B'), equation = `${rationalTerm(p, q)}${b === 0 ? '' : add(b)}`;
    return {
      practiceKey: key('g8-t2-equation-from-graph', ordered([[first.x, first.y], [last.x, last.y]])),
      prompt: 'Write the equation of the graphed line in the form y = mx + b. Show how the two labeled points determine the slope.',
      graph: graph([first, last], [[first, last]], { yMin: -12, yMax: 12 }),
      answer: `y = ${equation}`,
      steps: [`m = (${n(last.y)} − (${n(first.y)}))/(${q} − (${n(-q)})) = ${frac(p, q)}.`, `Substitute A into y = mx + b: ${n(first.y)} = (${frac(p, q)})(${n(-q)}) + b, so b = ${n(b)}.`, `The equation is y = ${equation}.`],
      workLines: 4
    };
  });

  return templates;
}));
