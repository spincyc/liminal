(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./math.js'));
  else root.LiminalGrade8Topic3 = factory(root.LiminalCourseMath);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';

  const n = value => String(value).replace(/-/g, '−');
  const add = b => b < 0 ? ` − ${n(-b)}` : ` + ${n(b)}`;
  const term = a => a === 1 ? 'x' : a === -1 ? '−x' : `${n(a)}x`;
  const linear = (a, b) => `${term(a)}${b === 0 ? '' : add(b)}`;
  const counted = (count, plural) => `${count} ${count === 1 ? plural.slice(0, -1) : plural}`;
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
      prompt: 'Does the relation in the table define y as a function of x? Explain using the input-output rule.',
      table: { headers: ['x (input)', 'y (output)'], rows: r.shuffle(rows).map(row => row.map(n)) },
      answer: isFunction ? 'Yes. Each input has exactly one output; repeated output values are allowed.' : `No. Input ${n(base)} has two outputs, ${n(y)} and ${n(y + 4)}.`,
      steps: ['Check each input, not each output.', isFunction ? 'All four inputs are different, so each has only one assigned output.' : `The two rows with x = ${n(base)} disagree about y.`, 'A function may send several different inputs to the same output.'],
      workLines: 3
    };
  });

  design('vertical-line-points', '3-1', 'Test a plotted relation for a function', r => {
    const x = r.int(-4, 0), y = r.int(-5, 2), isFunction = r.pick([true, false]);
    const points = [point(x, y), point(x + 1, y + 3), point(x + 3, y - 2), point(isFunction ? x + 4 : x + 1, y + 6)];
    return {
      prompt: 'The relation consists only of the four plotted points. Does it define y as a function of x? Explain how a vertical line can test your conclusion.',
      graph: graph(points),
      answer: isFunction ? 'Yes. No vertical line passes through more than one plotted point.' : `No. The vertical line x = ${n(x + 1)} passes through two plotted points.`,
      steps: ['A vertical line represents one fixed input x.', isFunction ? 'Each plotted point has a different x-coordinate.' : `Input ${n(x + 1)} is paired with ${n(y + 3)} and ${n(y + 6)}.`, 'Exactly one output for each input is required. Do not connect these discrete points.'],
      workLines: 3
    };
  });

  design('rule-table-graph', '3-2', 'Connect an equation, table, and graph', r => {
    const a = r.nonzero(-2, 2), b = r.int(-3, 3), xs = [-2, -1, 0, 1, 2], points = xs.map(x => point(x, a * x + b));
    return {
      prompt: `For the function y = ${linear(a, b)}, complete the table and graph the function. Explain how one table row becomes a point.`,
      table: { headers: ['x', 'y'], rows: xs.map(x => [n(x), '____']) },
      graph: graph([]),
      answerGraph: graph(points, [[point(-6, -6 * a + b), point(6, 6 * a + b)]]),
      answer: `In row order, y = ${points.map(p => n(p.y)).join(', ')}. Plot each (x, y) pair and draw the straight line through them.`,
      steps: [`Substitute each x-value into ${linear(a, b)}.`, `For example, x = 2 gives y = (${n(a)})(2)${b === 0 ? '' : add(b)} = ${n(2 * a + b)}.`, `The row (2, ${n(2 * a + b)}) becomes the point with horizontal coordinate 2 and vertical coordinate ${n(2 * a + b)}.`],
      workLines: 4
    };
  });

  design('graph-function-rule', '3-2', 'Connect a linear graph to its equation', r => {
    const a = r.nonzero(-3, 3), b = r.int(-3, 3), target = r.int(3, 6), points = [point(0, b, 'A'), point(2, 2 * a + b, 'B')];
    return {
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
      prompt: `A community garden already has ${start} square meters mulched. A crew adds ${rate} square meters each hour at a constant rate. Write a function for total mulched area y after x hours. State the meanings of the rate and initial value, then predict the area after ${hours} hours.`,
      answer: `y = ${rate}x + ${start}; rate ${rate} square meters/hour; initial area ${start} square meters; after ${hours} hours: ${start + rate * hours} square meters.`,
      steps: [`Additional area after x hours is ${rate}x square meters.`, `Add the already-mulched area: y = ${rate}x + ${start}.`, `At x = ${hours}, y = ${rate}(${hours}) + ${start} = ${start + rate * hours}. The model applies while space and this work rate are available.`],
      workLines: 5
    };
  });

  design('two-values-linear-model', '3-4', 'Determine a function from two values', r => {
    const rate = r.int(2, 7), fee = r.int(5, 25), x1 = r.int(2, 5), x2 = x1 + r.int(2, 5);
    return {
      prompt: `A craft studio charges a fixed setup fee plus a constant amount per clay piece. The total for ${x1} pieces is $${fee + rate * x1}; for ${x2} pieces it is $${fee + rate * x2}. Write the cost function C(x), and identify the setup fee and per-piece charge.`,
      answer: `C(x) = ${rate}x + ${fee}; setup fee $${fee}; $${rate} per piece.`,
      steps: [`The cost increases by $${rate * (x2 - x1)} for ${x2 - x1} more pieces, so the rate is $${rate} per piece.`, `Use the first total: ${fee + rate * x1} = ${rate}(${x1}) + b, so b = ${fee}.`, `C(x) = ${rate}x + ${fee} for nonnegative whole-number x under this pricing rule.`],
      workLines: 5
    };
  });

  design('square-display-model', '3-5', 'Compare original linear and nonlinear models', r => {
    const width = r.int(2, 6), target = r.int(1, 9), max = Math.max(width, target) + 1;
    return {
      prompt: `Design A uses n rows with ${width} tiles in each row. Design B is an n-by-n square. Complete the table for tile counts, classify each rule as linear or nonlinear, and decide which uses more tiles when n = ${target}. This is an original design comparison.`,
      table: { headers: ['n', 'Design A tiles', 'Design B tiles'], rows: Array.from({ length: max }, (_, i) => [String(i + 1), '____', '____']) },
      answer: `A(n) = ${width}n is linear; B(n) = n^2 is nonlinear. At n = ${target}, A uses ${width * target} and B uses ${target * target}; ${width === target ? 'the counts are equal' : `${width > target ? 'A' : 'B'} uses more`}. Table pairs (A, B): ${Array.from({ length: max }, (_, i) => `(${width * (i + 1)}, ${(i + 1) ** 2})`).join(', ')}.`,
      steps: [`For A, multiply the number of rows by ${width}; equal increases in n add ${width} tiles.`, 'For B, multiply n by itself; the successive differences grow rather than stay constant.', `At n = ${target}, compare ${width * target} with ${target * target}. For positive n, both designs use the same number only at n = ${width}.`],
      workLines: 6
    };
  });

  design('rental-comparison-model', '3-5', 'Compare original linear models and limits', r => {
    const hours = r.int(3, 8), low = r.int(2, 5), high = low + r.int(2, 4), fee = (high - low) * hours;
    return {
      prompt: `Two equipment rentals allow whole-hour bookings. Option A costs $${high} per hour. Option B costs $${fee} plus $${low} per hour. Compare costs at ${hours - 1}, ${hours}, and ${hours + 1} hours. Explain how the better choice changes and one assumption your comparison needs.`,
      table: { headers: ['Hours', 'A cost ($)', 'B cost ($)'], rows: [hours - 1, hours, hours + 1].map(x => [String(x), '____', '____']) },
      answer: `Rows (A, B): ${[hours - 1, hours, hours + 1].map(x => `(${high * x}, ${fee + low * x})`).join(', ')}. A is cheaper before ${hours} hours; equal at ${hours}; B is cheaper after ${hours}. Assume the same equipment/service and no other fees or discounts.`,
      steps: [`Use A(x) = ${high}x and B(x) = ${low}x + ${fee}.`, `The equality ${high}x = ${low}x + ${fee} gives x = ${hours}.`, `A has the lower initial charge, but B increases by $${high - low} less per hour. Other valid assumptions include availability and unchanged rates.`],
      workLines: 6
    };
  });

  design('increasing-decreasing-graph', '3-6', 'Identify intervals of change', r => {
    const t1 = r.int(2, 3), t2 = t1 + r.int(2, 3), t3 = t2 + r.int(2, 3), low = r.int(1, 3), high = low + r.int(3, 5), end = r.int(0, low);
    const points = [point(0, low), point(t1, high), point(t2, high), point(t3, end)];
    return {
      prompt: 'The graph shows a function over time. State the time intervals on which it increases, stays constant, and decreases. Describe change in y as time moves left to right.',
      graph: graph(points, [[points[0], points[1]], [points[1], points[2]], [points[2], points[3]]], { xMin: 0, xMax: t3 + 1, yMin: 0, yMax: 10, xLabel: 'Time (minutes)', yLabel: 'Height (meters)' }),
      answer: `Increasing from 0 to ${t1} minutes; constant from ${t1} to ${t2}; decreasing from ${t2} to ${t3}.`,
      steps: [`The first segment rises from ${low} to ${high} meters.`, `The middle segment is horizontal at ${high} meters.`, `The last segment falls from ${high} meters to ${counted(end, 'meters')}. Endpoints mark transitions; open-interval notation for these interiors is also acceptable.`],
      workLines: 4
    };
  });

  design('compare-increasing-intervals', '3-6', 'Compare rates on a piecewise graph', r => {
    const duration = r.int(2, 4), firstRate = r.int(1, 4), secondRate = r.pick([1, 2, 3, 4].filter(rate => rate !== firstRate)), start = r.int(0, 3), mid = start + duration * firstRate, end = mid + duration * secondRate;
    const points = [point(0, start, `(0, ${start})`), point(duration, mid, `(${duration}, ${mid})`), point(duration * 2, end, `(${duration * 2}, ${end})`)];
    return {
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
      prompt: `A walker starts at home, walks steadily to a spot ${distance} meters away in ${t1} minutes, rests there for ${counted(rest, 'minutes')}, then walks steadily home in ${back} minutes. Sketch distance from home against time. Label each transition point.`,
      graph: graph([], [], settings),
      answerGraph: graph(points, points.slice(1).map((p, i) => [points[i], p]), settings),
      answer: `Connect (0, 0), (${t1}, ${distance}), (${t2}, ${distance}), and (${end}, 0) with straight segments.`,
      steps: [`Start at the origin and rise to (${t1}, ${distance}).`, `During the rest, keep distance constant through time ${t2}.`, `Return to distance 0 at time ${end}. The graph shows distance from home, not total distance walked.`],
      workLines: 3
    };
  });

  design('sketch-filling-rates', '3-7', 'Sketch a changing-rate function', r => {
    const initial = r.int(2, 6), minutes = r.int(2, 4), slow = r.int(1, 2), fast = slow + r.int(1, 3), afterSlow = initial + slow * minutes, afterFast = afterSlow + fast * minutes;
    const points = [point(0, initial), point(minutes, afterSlow), point(minutes * 2, afterFast), point(minutes * 2 + 2, afterFast)];
    const settings = { xMin: 0, xMax: minutes * 2 + 3, yMin: 0, yMax: Math.ceil((afterFast + 2) / 5) * 5, yStep: 5, xLabel: 'Time (minutes)', yLabel: 'Water (liters)' };
    return {
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
