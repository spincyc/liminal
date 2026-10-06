(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./math.js'));
  else root.LiminalGrade8Topic4 = factory(root.LiminalCourseMath);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';

  const n = value => String(value).replace(/-/g, '−');
  const frac = (a, b) => M.fraction(a, b).replace(/-/g, '−');
  const percent = (a, b) => { const value = frac(100 * a, b); return value.includes('/') ? `(${value})%` : `${value}%`; };
  const point = (x, y, label) => ({ x, y, ...(label ? { label } : {}) });
  const key = (task, ...givens) => JSON.stringify([task, ...givens]);
  // Canonical givens use code-unit ordering, independent of the viewer's locale.
  const ordered = values => values.slice().sort((a, b) => { const x = JSON.stringify(a), y = JSON.stringify(b); return x < y ? -1 : x > y ? 1 : 0; });
  const coords = points => ordered(points.map(p => [p.x, p.y]));
  const linear = (m, b) => `${m === 1 ? 'x' : m === -1 ? '−x' : `${n(m)}x`}${b < 0 ? ` − ${n(-b)}` : ` + ${b}`}`;
  function graph(points, lines = [], settings = {}) {
    return { xMin: 0, xMax: 8, yMin: 0, yMax: 40, xStep: 1, yStep: 5, xLabel: 'x', yLabel: 'y', points, lines, ...settings };
  }
  const templates = [];
  function design(id, lessonId, skill, generate) { templates.push({ id: `g8-t4-${id}`, lessonId, skill, generate }); }
  function frequencyTable(a, b, c, d) {
    return { headers: ['Group', 'Prefers outdoors', 'Prefers indoors', 'Total'], rows: [
      ['Morning group', String(a), String(b), String(a + b)],
      ['Afternoon group', String(c), String(d), String(c + d)],
      ['Total', String(a + c), String(b + d), String(a + b + c + d)]
    ] };
  }

  design('scatter-association', '4-1', 'Describe direction and form in a scatter plot', r => {
    const pattern = r.pick(['positive', 'negative', 'nonlinear', 'none', 'clusters']), slope = r.int(2, 4), base = pattern === 'negative' ? r.int(30, 34) : r.int(3, 8), noise = r.shuffle([-1, 0, 1, -1, 0, 1]);
    const points = pattern === 'none'
      ? [1, 2, 3, 4, 5, 6].flatMap(x => [base + 3, base + 13, base + 23].map(y => point(x, y)))
      : pattern === 'clusters' ? [0, 1, 2].flatMap(i => [point(1 + i / 2, base + i), point(6 + i / 2, base + 15 + slope + i)])
      : noise.map((e, i) => point(i + 1, pattern === 'nonlinear' ? base + (i + 1) ** 2 : base + (pattern === 'positive' ? slope : -slope) * (i + 1) + e));
    const description = { positive: 'Positive, approximately linear association.', negative: 'Negative, approximately linear association.', nonlinear: 'Positive, nonlinear association; the pattern curves upward.', none: 'No association in this displayed data: the same three y-values occur at every x-value.', clusters: 'Two separated clusters, with a positive overall association: the cluster at larger x-values also has larger y-values.' }[pattern];
    return {
      practiceKey: key('g8-t4-scatter-association', coords(points)),
      prompt: 'Describe the direction and form of the association between x and y in this original data set. Does the pattern alone establish that changing x causes y to change?',
      graph: graph(points, [], { yMax: 50 }),
      answer: `${description} The plot alone does not establish causation.`,
      steps: [pattern === 'none' ? 'Compare the spread of outputs at each x: the distributions are identical.' : pattern === 'clusters' ? 'Three points are grouped at small x-values and three at large x-values, with a gap between the groups.' : `As x increases, y generally ${pattern === 'negative' ? 'decreases' : 'increases'}.`, pattern === 'nonlinear' ? 'The rises grow larger as x increases, so one straight line does not capture the curve.' : pattern === 'none' ? 'Neither a rising nor a falling trend describes the data.' : pattern === 'clusters' ? 'Describe the grouping separately from direction: the two groups are distinct, while their overall direction is positive.' : 'The points cluster around a straight-line pattern, with some variation.', 'Other factors or the way observations were selected could help explain an association; a plot alone cannot prove causation.'],
      workLines: 4
    };
  });

  design('scatter-outlier', '4-1', 'Identify an outlier in a scatter plot', r => {
    const m = r.pick([-4, -3, -2, 2, 3, 4]), b = r.int(30, 45), outX = r.int(2, 5), offset = r.sign() * r.int(15, 22), outY = m * outX + b + offset;
    const unlabeled = [1, 2, 3, 4, 5, 6].map(x => point(x, m * x + b + (x % 2 ? -1 : 1)));
    unlabeled.push(point(outX, outY));
    const points = r.shuffle(unlabeled).map((p, i) => point(p.x, p.y, String.fromCharCode(65 + i))), outlier = points.find(p => p.x === outX && p.y === outY);
    const settings = { yMin: Math.floor(Math.min(...points.map(p => p.y)) / 5) * 5 - 5, yMax: Math.ceil(Math.max(...points.map(p => p.y)) / 5) * 5 + 5 };
    return {
      practiceKey: key('g8-t4-scatter-outlier', coords(points)),
      prompt: 'Describe the main trend and identify the point that is far from it. Should that point automatically be deleted from the data? Explain.',
      graph: graph(points, [], settings),
      answer: `The main trend is ${m > 0 ? 'positive' : 'negative'} and approximately linear. ${outlier.label}(${outX}, ${n(outY)}) is an outlier. Investigate it; do not automatically delete a valid observation.`,
      steps: [`Most points are close to a ${m > 0 ? 'rising' : 'falling'} line.`, `${outlier.label} has a much ${offset > 0 ? 'greater' : 'smaller'} y-value than the main trend at similar x-values.`, 'Check for recording or measurement error and consider the context. An unusual value can be real.'],
      workLines: 4
    };
  });

  design('construct-scatter', '4-2', 'Plot paired data', r => {
    const pattern = r.pick(['positive', 'negative', 'nonlinear', 'none']), m = r.int(2, 5), b = pattern === 'negative' ? r.int(40, 50) : r.int(5, 12), noise = r.shuffle([-2, -1, 0, 1, 2, 0]);
    const points = pattern === 'none' ? [1, 3, 5].flatMap(x => [point(x, b), point(x, b + 15)]) : noise.map((e, i) => point(i + 1, pattern === 'nonlinear' ? b + (i + 1) ** 2 : b + (pattern === 'negative' ? -m : m) * (i + 1) + e));
    const settings = { yMax: Math.ceil((Math.max(...points.map(p => p.y)) + 2) / 5) * 5 };
    const description = pattern === 'none' ? 'There is no association in these data: the same two y-values occur at each x.' : pattern === 'nonlinear' ? 'The association is positive and nonlinear, with an upward curve.' : `The association is ${pattern} and approximately linear.`;
    return {
      practiceKey: key('g8-t4-construct-scatter', coords(points)),
      prompt: 'The table gives six invented paired measurements. Plot a scatter plot with x on the horizontal axis and y on the vertical axis. Describe the direction and form of any association; do not connect successive observations.',
      table: { headers: ['x', 'y'], rows: points.map(p => [String(p.x), String(p.y)]) },
      graph: graph([], [], settings),
      answerGraph: graph(points, [], settings),
      answer: `Plot ${points.map(p => `(${p.x}, ${p.y})`).join(', ')}. ${description}`,
      steps: ['Each row gives one ordered pair: x first, y second.', 'Use the labeled scales and draw six separate points.', `${description} A pattern alone does not prove causation.`],
      workLines: 3
    };
  });

  design('correct-scatter-point', '4-2', 'Check a scatter plot against paired data', r => {
    const base = r.int(6, 14), scale = r.int(2, 5), wrongIndex = r.int(0, 4), error = r.pick([-5, 5]), rows = [1, 2, 3, 4, 5].map(x => [x, base + scale * x]);
    const points = rows.map(([x, y], i) => point(x, y + (i === wrongIndex ? error : 0), String.fromCharCode(65 + i)));
    return {
      practiceKey: key('g8-t4-correct-scatter-point', ordered(rows.map((row, i) => [row, [points[i].x, points[i].y]]))),
      prompt: 'The table is correct, but one labeled point in the scatter plot has the wrong vertical coordinate. Identify the point and state its correct coordinates.',
      table: { headers: ['x', 'y'], rows: rows.map(row => row.map(String)) },
      graph: graph(points, [], { yMax: Math.ceil((Math.max(...points.map(p => p.y), ...rows.map(row => row[1])) + 2) / 5) * 5 }),
      answer: `Point ${String.fromCharCode(65 + wrongIndex)} should be (${rows[wrongIndex][0]}, ${rows[wrongIndex][1]}).`,
      steps: ['Match each point’s horizontal coordinate to the first column.', `At x = ${rows[wrongIndex][0]}, the table gives y = ${rows[wrongIndex][1]}, but the graph shows ${points[wrongIndex].y}.`, 'Move only that point to the table’s ordered pair.'],
      workLines: 3
    };
  });

  design('compare-fit-lines', '4-3', 'Compare linear models against data', r => {
    const m = r.nonzero(-5, 5), b = r.int(12, 25), amplitude = r.int(1, 4), gap = r.sign() * r.int(2 * amplitude + 1, 2 * amplitude + 5), high = r.pick([true, false]), bOther = b + gap, noise = r.shuffle([-amplitude, 0, amplitude, r.int(-amplitude, amplitude), r.int(-amplitude, amplitude), r.int(-amplitude, amplitude)]), points = noise.map((e, i) => point(i + 1, m * (i + 1) + b + e));
    const aIntercept = high ? bOther : b, bIntercept = high ? b : bOther;
    const bestError = noise.reduce((sum, error) => sum + Math.abs(error), 0), otherError = noise.reduce((sum, error) => sum + Math.abs(error - gap), 0), settings = { yMin: Math.floor(Math.min(0, ...points.map(p => p.y)) / 5) * 5 - 5, yMax: Math.ceil(Math.max(0, ...points.map(p => p.y)) / 5) * 5 + 5 };
    return {
      practiceKey: key('g8-t4-compare-fit-lines', ordered([[m, aIntercept], [m, bIntercept]]), coords(points)),
      prompt: `Compare model A: y = ${linear(m, aIntercept)} and model B: y = ${linear(m, bIntercept)}. Which better fits the plotted data? Support your choice by comparing the sums of absolute vertical errors at all six points.`,
      table: { headers: ['x', 'Observed y', 'A prediction', 'A absolute error', 'B prediction', 'B absolute error'], rows: [
        ...points.map(p => [String(p.x), String(p.y), '____', '____', '____', '____']),
        ['Total', '—', '—', '____', '—', '____']
      ] },
      graph: graph(points, [], settings),
      answer: `Model ${high ? 'B' : 'A'} fits better: total absolute error ${bestError}, compared with ${otherError} for the other model.`,
      steps: [`For each observation, subtract the model prediction (using y = ${linear(m, b)}) from the observed y-value: ${noise.map(n).join(', ')}. Their absolute values total ${bestError}.`, `The other line is ${Math.abs(gap)} units ${gap > 0 ? 'higher' : 'lower'} at every x-value; its absolute vertical errors total ${otherError}.`, 'A smaller total error supports the selected model among these two candidates; it does not establish a perfect prediction rule.'],
      workLines: 5
    };
  });

  design('write-fit-line', '4-3', 'Build a line to model an association', r => {
    const numerator = r.nonzero(-5, 5), denominator = r.int(1, 4), divisor = M.gcd(numerator, denominator), p = numerator / divisor, q = denominator / divisor, b = r.int(20, 40), start = r.int(1, 3), errors = r.shuffle([-3, -1, 1, 3]);
    const first = point(start * q, start * p + b, 'A'), last = point((start + 5) * q, (start + 5) * p + b, 'B');
    const points = [first, ...errors.map((error, i) => point((start + i + 1) * q, (start + i + 1) * p + b + error)), last];
    const equation = q === 1 ? linear(p, b) : `(${frac(p, q)})x + ${b}`, settings = { xMax: last.x + q, xStep: q, yMin: Math.floor(Math.min(0, ...points.map(p => p.y)) / 5) * 5 - 5, yMax: Math.ceil(Math.max(...points.map(p => p.y)) / 5) * 5 + 5 };
    return {
      practiceKey: key('g8-t4-write-fit-line', ordered([[first.x, first.y], [last.x, last.y]]), coords(points)),
      prompt: `A student chooses the line through A(${first.x}, ${n(first.y)}) and B(${last.x}, ${n(last.y)}) as a model for this scatter plot. Write that line’s equation. Explain why some data points may lie off a useful model line.`,
      graph: graph(points, [], settings),
      answerGraph: graph(points, [[point(0, b), point(settings.xMax, settings.xMax * p / q + b)]], settings),
      answer: `y = ${equation}. A model summarizes the trend; it need not pass through every observation.`,
      steps: [`Slope = (${n(last.y)} − (${n(first.y)}))/(${last.x} − ${first.x}) = ${frac(p, q)}.`, `Use A: ${n(first.y)} = (${frac(p, q)})(${first.x}) + b, so b = ${b}.`, 'The other points lie on both sides, close to the chosen line. This is one reasonable model, not a claim of a uniquely best statistical fit.'],
      workLines: 5
    };
  });

  design('model-prediction', '4-4', 'Predict and interpret a linear model', r => {
    const m = r.int(2, 6), b = r.int(10, 25), outside = r.pick([true, false]), x = outside ? r.pick([1, 11, 12, 13, 14, 15, 16, 17, 18]) : r.int(3, 9);
    return {
      practiceKey: key('g8-t4-model-prediction', m, b, x, [2, 10]),
      prompt: `For original delivery data with route distances from 2 to 10 km, a model is t = ${m}d + ${b}, where d is route distance in km and t is delivery time in minutes. Predict the time for ${x} km. Interpret the slope and classify this prediction as interpolation or extrapolation.`,
      answer: `About ${m * x + b} minutes; each additional km adds about ${m} minutes to predicted time; ${outside ? 'extrapolation' : 'interpolation'}.`,
      steps: [`Substitute d = ${x}: t = ${m}(${x}) + ${b} = ${m * x + b}.`, `The slope’s units are minutes per km. The initial ${b} minutes represent the model’s fixed time component.`, outside ? `${x} km is outside the observed range of 2–10 km, so this is extrapolation. The relationship may change beyond that range.` : `${x} km is within the observed range of 2–10 km, so this is interpolation. An individual delivery can differ from the prediction.`],
      workLines: 4
    };
  });

  design('inverse-prediction', '4-4', 'Solve a model for an input and assess its limits', r => {
    const m = r.int(2, 6), b = r.int(10, 20), outside = r.pick([true, false]), x = outside ? r.int(15, 22) : r.int(5, 10), y = m * x + b;
    return {
      practiceKey: key('g8-t4-inverse-prediction', m, b, y, [4, 12]),
      prompt: `A model for original observations is y = ${m}x + ${b}; the observed x-values range from 4 to 12. What x-value gives a predicted y of ${y}? State whether using the model there is interpolation or extrapolation and give a limitation.`,
      answer: `x = ${x}; ${outside ? 'extrapolation' : 'interpolation'}. ${outside ? 'The relationship may change beyond the observed x-range.' : 'The model gives an estimate, so an actual observation may differ.'}`,
      steps: [`Set ${y} = ${m}x + ${b}.`, `${m}x = ${y - b}, so x = ${x}.`, outside ? `${x} lies outside 4–12. Check new data before relying on this extension.` : `${x} lies within 4–12. The model still does not guarantee an exact observed value.`],
      workLines: 4
    };
  });

  design('volunteer-data-model', '4-5', 'Use an original data model with appropriate caution', r => {
    const m = r.int(3, 7), b = r.int(6, 12), xs = [2, 4, 6, 8], noise = [-1, 2, -2, 1], points = xs.map((x, i) => point(x, m * x + b + noise[i])), target = r.pick([3, 5, 7]);
    const settings = { xMax: 10, yMax: 80, yStep: 10, xLabel: 'Volunteers', yLabel: 'Kits packed in one hour' };
    return {
      practiceKey: key('g8-t4-volunteer-data-model', m, b, target, coords(points), 30),
      prompt: `These invented observations compare volunteers with kits packed in one hour. A model is y = ${m}x + ${b}. Predict the number of kits for ${target} volunteers. Would the data alone prove that adding one volunteer causes exactly ${m} extra kits? Explain, and state why a prediction for 30 volunteers needs caution.`,
      graph: graph(points, [], settings),
      answer: `About ${m * target + b} kits. No: association alone does not prove an exact causal effect. A 30-volunteer prediction is extrapolation far beyond the observed 2–8 range.`,
      steps: [`Substitute x = ${target}: y = ${m}(${target}) + ${b} = ${m * target + b}.`, 'Packing experience, available supplies, and work space may affect output along with the volunteer count.', 'A crowded work space or limited supplies could change the trend for a much larger group. Other relevant limitations are acceptable.'],
      workLines: 5
    };
  });

  design('model-realistic-range', '4-5', 'Evaluate an original model outside its data range', r => {
    const rate = r.int(3, 8), zero = r.int(12, 18), initial = rate * zero, target = r.int(3, 7), far = zero + r.int(2, 6);
    return {
      practiceKey: key('g8-t4-model-realistic-range', initial, rate, target, far, [0, 8]),
      prompt: `A library team models boxes still waiting to be sorted by y = ${initial} − ${rate}x, where x is hours after work starts. The model was based on observations from hours 0 through 8. Predict y at hour ${target} and at hour ${far}. Explain why the later numerical result cannot describe a real box count, and find when the model reaches zero.`,
      answer: `${initial - rate * target} boxes at hour ${target}; the model gives ${n(initial - rate * far)} at hour ${far}, which is impossible as a box count. It reaches zero at hour ${zero}.`,
      steps: [`At x = ${target}, y = ${initial} − ${rate}(${target}) = ${initial - rate * target}.`, `At x = ${far}, y = ${initial} − ${rate}(${far}) = ${n(initial - rate * far)}. Counts cannot be negative.`, `Solve 0 = ${initial} − ${rate}x to get x = ${zero}. Extending the line that far is already extrapolation; the actual rate or supply may change before then.`],
      workLines: 6
    };
  });

  design('two-way-counts', '4-6', 'Read joint and marginal frequencies', r => {
    const a = r.int(8, 30), b = r.int(5, 25), c = r.int(8, 30), d = r.int(5, 25), total = a + b + c + d;
    return {
      practiceKey: key('g8-t4-two-way-counts', a, b, c, d),
      prompt: 'Each participant belongs to exactly one session group and chooses one activity preference. How many are in the morning group and prefer outdoors? How many prefer outdoors in all? How many participants are there in all?',
      table: frequencyTable(a, b, c, d),
      answer: `${a}; ${a + c}; ${total}, respectively.`,
      steps: [`The intersection of Morning group and Prefers outdoors is ${a}.`, `The outdoor column total is ${a} + ${c} = ${a + c}.`, `The grand total is ${a + b} + ${c + d} = ${total}. Each participant is counted once.`],
      workLines: 3
    };
  });

  design('complete-two-way-table', '4-6', 'Complete a two-way frequency table', r => {
    const a = r.int(10, 30), b = r.int(5, 20), c = r.int(8, 25), d = r.int(6, 20);
    return {
      practiceKey: key('g8-t4-complete-two-way-table', a, b, c, d),
      prompt: 'A survey records each student’s usual way of getting to school and whether they bring lunch. Fill in every blank in the two-way frequency table. Explain how you find the number who do not walk to school and do bring lunch.',
      table: { headers: ['Group', 'Brings lunch', 'Does not bring lunch', 'Total'], rows: [
        ['Walks to school', String(a), '____', String(a + b)],
        ['Does not walk to school', '____', String(d), String(c + d)],
        ['Total', String(a + c), '____', '____']
      ] },
      answer: `Missing cells, reading by rows: ${b}, ${c}, ${b + d}, ${a + b + c + d}.`,
      steps: [`Walkers who do not bring lunch: ${a + b} − ${a} = ${b}.`, `Nonwalkers who bring lunch: ${c + d} − ${d} = ${c}.`, `Does-not-bring-lunch total: ${b} + ${d} = ${b + d}. Grand total: ${a + b} + ${c + d} = ${a + b + c + d}.`],
      workLines: 4
    };
  });

  design('relative-frequency-denominators', '4-7', 'Distinguish joint and conditional percentages', r => {
    const morning = r.pick([20, 30, 40, 50, 60, 80]), afternoon = r.pick([20, 30, 40, 50, 60, 80]);
    const a = r.int(2, morning - 2), c = r.int(2, afternoon - 2), b = morning - a, d = afternoon - c;
    const row = r.int(0, 1), column = r.int(0, 1), condition = r.pick(['row', 'column']);
    const group = row === 0 ? 'morning' : 'afternoon', preference = column === 0 ? 'outdoors' : 'indoors';
    const joint = [[a, b], [c, d]][row][column], total = morning + afternoon;
    const denominator = condition === 'row' ? [morning, afternoon][row] : [a + c, b + d][column];
    const conditionedGroup = condition === 'row' ? `the ${group} group` : `participants who prefer ${preference}`;
    const conditionalTask = condition === 'row' ? `the percentage of the ${group} group who prefer ${preference}` : `among participants who prefer ${preference}, the percentage who are in the ${group} group`;
    return {
      practiceKey: key('g8-t4-relative-frequency-denominators', a, b, c, d, row, column, condition),
      prompt: `Using the table, find (a) the percentage of all participants who are in the ${group} group and prefer ${preference} and (b) ${conditionalTask}. Give exact percentages; a fraction is acceptable.`,
      table: frequencyTable(a, b, c, d),
      answer: `(a) ${percent(joint, total)}; (b) ${percent(joint, denominator)}.`,
      steps: [`For (a), divide the joint count by the grand total: (${joint}/${total}) × 100% = ${percent(joint, total)}.`, `For (b), restrict the comparison to ${conditionedGroup}, so the denominator is ${denominator}: (${joint}/${denominator}) × 100% = ${percent(joint, denominator)}.`, 'The two denominators describe different comparison groups.'],
      workLines: 4
    };
  });

  design('compare-conditional-frequencies', '4-7', 'Compare group percentages for association', r => {
    const nA = r.pick([20, 40, 60]), nB = r.pick([20, 40, 60]), pA = r.int(2, 8) * 10, pB = r.int(2, 8) * 10, a = nA * pA / 100, c = nB * pB / 100;
    return {
      practiceKey: key('g8-t4-compare-conditional-frequencies', a, nA - a, c, nB - c),
      prompt: 'Compare the percentage who prefer outdoors within each session group. Does this sample show an association between session group and activity preference? Explain why raw outdoor counts alone can be misleading.',
      table: frequencyTable(a, nA - a, c, nB - c),
      answer: `Morning: ${pA}%; afternoon: ${pB}%. ${pA === pB ? 'The equal conditional percentages show no association in this table.' : 'The different conditional percentages show an association in this table.'} Compare percentages because group sizes may differ.`,
      steps: [`Morning: (${a}/${nA}) × 100% = ${pA}%.`, `Afternoon: (${c}/${nB}) × 100% = ${pB}%.`, pA === pB ? 'The preference distribution is the same in each group. This descriptive result does not prove what holds in a larger population.' : 'The preference distributions differ. This descriptive sample association does not establish causation or statistical significance in a larger population.'],
      workLines: 4
    };
  });

  return templates;
}));
