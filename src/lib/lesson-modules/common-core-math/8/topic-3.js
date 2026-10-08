(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../../math.js'));
  else root.LiminalGrade8Topic3 = factory(root.LiminalCourseMath);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';

  const n = value => String(value).replace(/-/g, '−');
  const add = b => b < 0 ? ` − ${n(-b)}` : ` + ${n(b)}`;
  const term = a => a === 1 ? 'x' : a === -1 ? '−x' : `${n(a)}x`;
  const linear = (a, b) => `${term(a)}${b === 0 ? '' : add(b)}`;
  const counted = (count, plural) => `${count} ${count === 1 ? plural.slice(0, -1) : plural}`;
  const key = (task, ...givens) => JSON.stringify([task, ...givens]);
  // Canonical givens use code-unit ordering, independent of the viewer's locale.
  const ordered = values => values.slice().sort((a, b) => { const x = JSON.stringify(a), y = JSON.stringify(b); return x < y ? -1 : x > y ? 1 : 0; });
  const point = (x, y, label) => ({ x, y, ...(label ? { label } : {}) });
  function graph(points, lines = [], settings = {}) {
    return { xMin: -6, xMax: 6, yMin: -10, yMax: 10, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y', points, lines, ...settings };
  }
  const templates = [];
  function design(id, lessonId, skill, generate) { templates.push({ id: `g8-t3-${id}`, lessonId, skill, generate }); }

  design('relation-table', '3-1', 'Identify functions from input-output pairs', r => {
    const base = r.int(-6, 2), y = r.int(-5, 4), isFunction = r.pick([true, false]);
    const rows = [[base, y], [base + 1, y + 2], [base + 2, y], [isFunction ? base + 3 : base, y + 4]];
    return {
      practiceKey: key('g8-t3-relation-table', ordered(rows)),
      prompt: 'Does the relation in the table define y as a function of x? Explain using the input-output rule.',
      table: { headers: ['x (input)', 'y (output)'], rows: r.shuffle(rows).map(row => row.map(n)) },
      answer: isFunction ? 'Yes. Each input has exactly one output; repeated output values are allowed.' : `No. Input ${n(base)} has two outputs, ${n(y)} and ${n(y + 4)}.`,
      steps: ['Check each input, not each output.', isFunction ? 'All four inputs are different, so each has only one assigned output.' : `The two rows with x = ${n(base)} disagree about y.`, 'A function may send several different inputs to the same output.'],
      workLines: 3
    };
  });

  design('vertical-line-points', '3-1', 'Test a plotted relation for a function', r => {
    const x = r.int(-4, 0), y = r.int(-5, 2), isFunction = r.pick([true, false]), rise = r.int(2, 5);
    const points = [point(x, y), point(x + 1, y + rise), point(x + 3, y - 2), point(isFunction ? x + 4 : x + 1, y + rise + 3)];
    return {
      practiceKey: key('g8-t3-vertical-line-points', ordered(points.map(p => [p.x, p.y]))),
      prompt: 'The relation consists only of the four plotted points. Does it define y as a function of x? Explain how a vertical line can test your conclusion.',
      graph: graph(points),
      answer: isFunction ? 'Yes. No vertical line passes through more than one plotted point.' : `No. The vertical line x = ${n(x + 1)} passes through two plotted points.`,
      steps: ['A vertical line represents one fixed input x.', isFunction ? 'Each plotted point has a different x-coordinate.' : `Input ${n(x + 1)} is paired with ${n(y + rise)} and ${n(y + rise + 3)}.`, 'Exactly one output for each input is required. Do not connect these discrete points.'],
      workLines: 3
    };
  });

  design('rule-table-graph', '3-2', 'Connect an equation, table, and graph', r => {
    const numerator = r.nonzero(-4, 4), denominator = r.int(1, 4), divisor = M.gcd(numerator, denominator), p = numerator / divisor, q = denominator / divisor, b = r.int(-5, 5), xs = [-2, -1, 0, 1, 2].map(k => k * q), points = xs.map(x => point(x, p * x / q + b));
    const equation = `${q === 1 ? term(p) : `(${M.fraction(p, q)})x`}${b === 0 ? '' : add(b)}`, settings = { xMin: -9, xMax: 9, yMin: -14, yMax: 14 };
    return {
      practiceKey: key('g8-t3-rule-table-graph', M.fraction(p, q), b, ordered(xs)),
      prompt: `For the function y = ${equation}, complete the table and graph the function. Explain how one table row becomes a point.`,
      table: { headers: ['x', 'y'], rows: xs.map(x => [n(x), '____']) },
      graph: graph([], [], settings),
      answerGraph: graph(points, [[point(-9, -9 * p / q + b), point(9, 9 * p / q + b)]], settings),
      answer: `In row order, y = ${points.map(p => n(p.y)).join(', ')}. Plot each (x, y) pair and draw the straight line through them.`,
      steps: [`Substitute each x-value into ${equation}.`, `For example, x = ${2 * q} gives y = (${M.fraction(p, q)})(${2 * q})${b === 0 ? '' : add(b)} = ${n(2 * p + b)}.`, `The row (${2 * q}, ${n(2 * p + b)}) becomes the point with horizontal coordinate ${2 * q} and vertical coordinate ${n(2 * p + b)}.`],
      workLines: 4
    };
  });

  design('graph-function-rule', '3-2', 'Connect a linear graph to its equation', r => {
    const a = r.nonzero(-3, 3), b = r.int(-3, 3), target = r.int(3, 6), points = [point(0, b, 'A'), point(2, 2 * a + b, 'B')];
    return {
      practiceKey: key('g8-t3-graph-function-rule', ordered(points.map(p => [p.x, p.y])), target),
      prompt: `The graphed line represents a function. Write its equation and find the output when the input is ${target}.`,
      graph: graph(points, [[point(-2, b - 2 * a), points[1]]]),
      answer: `y = ${linear(a, b)}; at x = ${target}, y = ${n(a * target + b)}.`,
      steps: [`The initial output is ${n(b)} because the graph contains (0, ${n(b)}).`, `The rate is (${n(2 * a + b)} − (${n(b)}))/2 = ${n(a)}.`, `Substitute ${target} into y = ${linear(a, b)} to get ${n(a * target + b)}.`],
      workLines: 4
    };
  });

  design('linear-or-nonlinear-table', '3-3', 'Distinguish linear and nonlinear functions', r => {
    const a = r.int(1, 4), b = r.int(-6, 6), isLinear = r.pick([true, false]), xs = [0, 1, 2, 3, 4], ys = xs.map(x => a * (isLinear ? x : x * x) + b), changes = ys.slice(1).map((v, i) => v - ys[i]);
    return {
      practiceKey: key('g8-t3-linear-or-nonlinear-table', xs.map((x, i) => [x, ys[i]])),
      prompt: 'Is the function represented by the table linear or nonlinear over the shown inputs? Use rates of change to support your answer.',
      table: { headers: ['x', 'y'], rows: xs.map((x, i) => [String(x), n(ys[i])]) },
      answer: `${isLinear ? 'Linear' : 'Nonlinear'}; consecutive output changes are ${changes.join(', ')} for input changes of 1.`,
      steps: ['The x-values are equally spaced, one unit apart.', `Subtract consecutive y-values: ${changes.join(', ')}.`, isLinear ? `The constant rate of change is ${a}. These points lie on y = ${linear(a, b)}.` : 'The unequal rates mean these points cannot all lie on a straight line.'],
      workLines: 4
    };
  });

  design('compare-function-rates', '3-3', 'Compare functions in two representations', r => {
    const a = r.int(2, 7), b = r.int(1, 9), c = a + r.nonzero(-1, 3), d = r.int(-4, 8), xs = [0, 2, 4];
    return {
      practiceKey: key('g8-t3-compare-function-rates', a, b, c, d, xs),
      prompt: `Function A is y = ${linear(a, b)}. Function B is linear and is shown in the table. Which has the greater rate of change? Which has the greater output at x = 0? Explain both comparisons.`,
      table: { headers: ['x', 'Function B: y'], rows: xs.map(x => [String(x), n(c * x + d)]) },
      answer: `Greater rate: Function ${a > c ? 'A' : 'B'}. At x = 0: ${b === d ? 'equal outputs' : `Function ${b > d ? 'A' : 'B'} has the greater output`}.`,
      steps: [`Function A has rate ${a} and initial output ${b}.`, `Function B has rate (${n(2 * c + d)} − (${n(d)}))/2 = ${c} and initial output ${n(d)}.`, 'Compare the rates separately from the initial outputs; they answer different questions.'],
      workLines: 4
    };
  });

  design('context-linear-model', '3-4', 'Build and interpret a linear function', r => {
    const start = r.int(6, 20), rate = r.int(2, 7), hours = r.int(3, 8);
    return {
      practiceKey: key('g8-t3-context-linear-model', start, rate, hours),
      prompt: `A community garden already has ${start} square meters mulched. A crew adds ${rate} square meters each hour at a constant rate. Write a function for total mulched area y after x hours. State the meanings of the rate and initial value, then predict the area after ${hours} hours.`,
      answer: `y = ${rate}x + ${start}; rate ${rate} square meters/hour; initial area ${start} square meters; after ${hours} hours: ${start + rate * hours} square meters.`,
      steps: [`Additional area after x hours is ${rate}x square meters.`, `Add the already-mulched area: y = ${rate}x + ${start}.`, `At x = ${hours}, y = ${rate}(${hours}) + ${start} = ${start + rate * hours}. The model applies while space and this work rate are available.`],
      workLines: 5
    };
  });

  design('two-values-linear-model', '3-4', 'Determine a function from two values', r => {
    const rate = r.int(2, 7), fee = r.int(5, 25), x1 = r.int(2, 5), x2 = x1 + r.int(2, 5);
    return {
      practiceKey: key('g8-t3-two-values-linear-model', ordered([[x1, fee + rate * x1], [x2, fee + rate * x2]])),
      prompt: `A craft studio charges a fixed setup fee plus a constant amount per clay piece. The total for ${x1} pieces is $${fee + rate * x1}; for ${x2} pieces it is $${fee + rate * x2}. Write the cost function C(x), and identify the setup fee and per-piece charge.`,
      answer: `C(x) = ${rate}x + ${fee}; setup fee $${fee}; $${rate} per piece.`,
      steps: [`The cost increases by $${rate * (x2 - x1)} for ${x2 - x1} more pieces, so the rate is $${rate} per piece.`, `Use the first total: ${fee + rate * x1} = ${rate}(${x1}) + b, so b = ${fee}.`, `C(x) = ${rate}x + ${fee} for nonnegative whole-number x under this pricing rule.`],
      workLines: 5
    };
  });

  design('square-display-model', '3-5', 'Compare original linear and nonlinear models', r => {
    const width = r.int(2, 9), target = r.int(1, 12), linearExtra = r.int(0, 12), squareExtra = r.int(0, 12);
    const swap = r.pick([true, false]), task = r.pick(['total', 'growth']);
    const linearLabel = swap ? 'B' : 'A', squareLabel = swap ? 'A' : 'B';
    const models = {
      [linearLabel]: { description: `n rows with ${width} tiles in each row plus ${counted(linearExtra, 'tiles')} for a fixed decoration`, rule: `${width}n + ${linearExtra}`, value: x => width * x + linearExtra, classification: 'linear' },
      [squareLabel]: { description: `an n-by-n square plus ${counted(squareExtra, 'tiles')} for its fixed decoration`, rule: `n^2 + ${squareExtra}`, value: x => x * x + squareExtra, classification: 'nonlinear' }
    };
    const xs = [...new Set([1, 2, 3, target, ...(task === 'growth' ? [target + 1] : [])])].sort((a, b) => a - b);
    const a = models.A.value(target), b = models.B.value(target), growthA = models.A.value(target + 1) - a, growthB = models.B.value(target + 1) - b;
    const comparison = task === 'total'
      ? `At n = ${target}, A uses ${a} and B uses ${b}; ${a === b ? 'the counts are equal' : `${a > b ? 'A' : 'B'} uses more`}.`
      : `From n = ${target} to n = ${target + 1}, A needs ${counted(growthA, 'extra tiles')} and B needs ${counted(growthB, 'extra tiles')}; ${growthA === growthB ? 'the increases are equal' : `${growthA > growthB ? 'A' : 'B'} needs more extra tiles`}.`;
    return {
      practiceKey: key('g8-t3-square-display-model', width, linearExtra, squareExtra, target, task, xs),
      prompt: `Design A uses ${models.A.description}. Design B uses ${models.B.description}. Complete the table for tile counts, classify each rule as linear or nonlinear, and ${task === 'total' ? `decide which uses more tiles when n = ${target}` : `decide which needs more extra tiles to increase n from ${target} to ${target + 1}`}.`,
      table: { headers: ['n', 'Design A tiles', 'Design B tiles'], rows: xs.map(x => [String(x), '____', '____']) },
      answer: `A(n) = ${models.A.rule} is ${models.A.classification}; B(n) = ${models.B.rule} is ${models.B.classification}. ${comparison} Table pairs (A, B): ${xs.map(x => `(${models.A.value(x)}, ${models.B.value(x)})`).join(', ')}.`,
      steps: [`For ${linearLabel}, multiply n by ${width} and add ${linearExtra}; equal increases of 1 in n add ${width} tiles.`, `For ${squareLabel}, multiply n by itself and add ${squareExtra}; its successive differences for unit increases in n grow rather than stay constant.`, task === 'total' ? `Substitute ${target} into both rules. ${comparison}` : `Subtract the old total from the new total: A changes by ${models.A.value(target + 1)} − ${a} = ${growthA}, and B by ${models.B.value(target + 1)} − ${b} = ${growthB}. ${comparison}`],
      workLines: 6
    };
  });

  design('rental-comparison-model', '3-5', 'Compare original linear models and limits', r => {
    const hours = r.int(3, 12), low = r.int(2, 10), high = low + r.int(1, 7), initial = r.int(0, 20), fee = initial + (high - low) * hours, swap = r.pick([true, false]);
    const rateA = swap ? low : high, feeA = swap ? fee : initial, rateB = swap ? high : low, feeB = swap ? initial : fee, cheaperBefore = swap ? 'B' : 'A', cheaperAfter = swap ? 'A' : 'B';
    return {
      practiceKey: key('g8-t3-rental-comparison-model', ordered([[rateA, feeA], [rateB, feeB]]), [hours - 1, hours, hours + 1]),
      prompt: `Two equipment rentals allow whole-hour bookings. Option A costs $${feeA} plus $${rateA} per hour. Option B costs $${feeB} plus $${rateB} per hour. Compare costs at ${hours - 1}, ${hours}, and ${hours + 1} hours. Explain how the better choice changes and one assumption your comparison needs.`,
      table: { headers: ['Hours', 'A cost ($)', 'B cost ($)'], rows: [hours - 1, hours, hours + 1].map(x => [String(x), '____', '____']) },
      answer: `Rows (A, B): ${[hours - 1, hours, hours + 1].map(x => `(${feeA + rateA * x}, ${feeB + rateB * x})`).join(', ')}. ${cheaperBefore} is cheaper before ${hours} hours; equal at ${hours}; ${cheaperAfter} is cheaper after ${hours}. Assume the same equipment/service and no other fees or discounts.`,
      steps: [`Use A(x) = ${rateA}x + ${feeA} and B(x) = ${rateB}x + ${feeB}.`, `The equality ${rateA}x + ${feeA} = ${rateB}x + ${feeB} gives x = ${hours}.`, `${cheaperBefore} has the lower initial charge, but ${cheaperAfter} increases by $${high - low} less per hour. Other valid assumptions include availability and unchanged rates.`],
      workLines: 6
    };
  });

  design('increasing-decreasing-graph', '3-6', 'Identify intervals of change', r => {
    const order = r.shuffle([1, 0, -1]), points = [point(0, r.int(-8, 8))];
    order.forEach(direction => { const previous = points[points.length - 1]; points.push(point(previous.x + r.int(2, 4), previous.y + direction * r.int(2, 5))); });
    const intervals = Object.fromEntries(order.map((direction, i) => [direction, `${points[i].x} to ${points[i + 1].x}`]));
    return {
      practiceKey: key('g8-t3-increasing-decreasing-graph', points.map(p => [p.x, p.y])),
      prompt: 'The graph shows a function over time. State the time intervals on which it increases, stays constant, and decreases. Describe change in y as time moves left to right.',
      graph: graph(points, [[points[0], points[1]], [points[1], points[2]], [points[2], points[3]]], { xMin: 0, xMax: points[3].x + 1, yMin: Math.min(...points.map(p => p.y)) - 2, yMax: Math.max(...points.map(p => p.y)) + 2, xLabel: 'Time (minutes)', yLabel: 'Output y' }),
      answer: `Increasing from ${intervals[1]} minutes; constant from ${intervals[0]}; decreasing from ${intervals[-1]}.`,
      steps: order.map((direction, i) => `From ${points[i].x} to ${points[i + 1].x} minutes, y ${direction === 0 ? 'stays constant' : direction > 0 ? 'increases' : 'decreases'} from ${n(points[i].y)} to ${n(points[i + 1].y)}.`).concat('Increasing means that outputs get larger, even below zero. Endpoints mark transitions; open-interval notation for the interiors is also acceptable.'),
      workLines: 4
    };
  });

  design('compare-increasing-intervals', '3-6', 'Compare rates on a piecewise graph', r => {
    const duration = r.int(2, 4), firstRate = r.int(1, 4), secondRate = r.pick([1, 2, 3, 4].filter(rate => rate !== firstRate)), start = r.int(0, 3), mid = start + duration * firstRate, end = mid + duration * secondRate;
    const points = [point(0, start, `(0, ${start})`), point(duration, mid, `(${duration}, ${mid})`), point(duration * 2, end, `(${duration * 2}, ${end})`)];
    return {
      practiceKey: key('g8-t3-compare-increasing-intervals', points.map(p => [p.x, p.y])),
      prompt: `The graph shows distance from a starting marker. Compare the intervals 0 to ${duration} seconds and ${duration} to ${duration * 2} seconds. On which interval is the distance increasing faster? Explain with rates, not just ending heights.`,
      graph: graph(points, [[points[0], points[1]], [points[1], points[2]]], { xMin: 0, xMax: duration * 2 + 1, yMin: 0, yMax: Math.ceil((end + 2) / 5) * 5, yStep: 5, xLabel: 'Time (seconds)', yLabel: 'Distance (meters)' }),
      answer: `Faster from ${firstRate > secondRate ? `0 to ${duration}` : `${duration} to ${duration * 2}`} seconds. First interval: ${firstRate} m/s; second interval: ${secondRate} m/s.`,
      steps: [`First rate: (${mid} − ${start})/${duration} = ${firstRate} m/s.`, `Second rate: (${end} − ${mid})/${duration} = ${secondRate} m/s.`, 'Both intervals increase; the larger positive slope represents the faster increase.'],
      workLines: 4
    };
  });

  design('sketch-walk-rest-return', '3-7', 'Sketch a function from a motion story', r => {
    const t1 = r.int(2, 4), rest = r.int(1, 3), back = r.int(2, 4), distance = r.int(3, 8) * 20, t2 = t1 + rest, end = t2 + back;
    const points = [point(0, 0), point(t1, distance), point(t2, distance), point(end, 0)];
    const settings = { xMin: 0, xMax: end + 1, yMin: 0, yMax: 200, yStep: 20, xLabel: 'Time (minutes)', yLabel: 'Distance from home (meters)' };
    return {
      practiceKey: key('g8-t3-sketch-walk-rest-return', t1, rest, back, distance),
      prompt: `A walker starts at home, walks steadily to a spot ${distance} meters away in ${t1} minutes, rests there for ${counted(rest, 'minutes')}, then walks steadily home in ${back} minutes. Sketch distance from home against time. Label each transition point.`,
      graph: graph([], [], settings),
      answerGraph: graph(points, points.slice(1).map((p, i) => [points[i], p]), settings),
      answer: `Connect (0, 0), (${t1}, ${distance}), (${t2}, ${distance}), and (${end}, 0) with straight segments.`,
      steps: [`Start at the origin and rise to (${t1}, ${distance}).`, `During the rest, keep distance constant through time ${t2}.`, `Return to distance 0 at time ${end}. The graph shows distance from home, not total distance walked.`],
      workLines: 3
    };
  });

  design('sketch-filling-rates', '3-7', 'Sketch a changing-rate function', r => {
    const initial = r.int(2, 9), minutes = r.int(2, 5), slow = r.int(1, 3), fast = slow + r.int(1, 3), afterSlow = initial + slow * minutes, afterFast = afterSlow + fast * minutes;
    const points = [point(0, initial), point(minutes, afterSlow), point(minutes * 2, afterFast), point(minutes * 2 + 2, afterFast)];
    const settings = { xMin: 0, xMax: minutes * 2 + 3, yMin: 0, yMax: Math.ceil((afterFast + 2) / 5) * 5, yStep: 5, xLabel: 'Time (minutes)', yLabel: 'Water (liters)' };
    return {
      practiceKey: key('g8-t3-sketch-filling-rates', initial, minutes, slow, fast),
      prompt: `A tank begins with ${initial} liters. Water enters at ${counted(slow, 'liters')} per minute for ${minutes} minutes, then at ${fast} liters per minute for another ${minutes} minutes. The tap is shut for the next 2 minutes; no water leaves. Sketch water volume against time, with labeled transition points.`,
      graph: graph([], [], settings),
      answerGraph: graph(points, points.slice(1).map((p, i) => [points[i], p]), settings),
      answer: `Connect (0, ${initial}), (${minutes}, ${afterSlow}), (${minutes * 2}, ${afterFast}), and (${minutes * 2 + 2}, ${afterFast}) with straight segments. The second segment is steeper; the last is horizontal.`,
      steps: [`First interval adds ${slow} × ${minutes} = ${slow * minutes} liters.`, `Second interval adds ${fast} × ${minutes} = ${fast * minutes} liters.`, 'Shutting the tap keeps the final volume constant; it does not return the volume to zero.'],
      workLines: 3
    };
  });

  return templates;
}));
