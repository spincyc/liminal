(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./math.js'));
  else root.LiminalGrade8Topic4 = factory(root.LiminalCourseMath);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';

  const n = value => String(value).replace(/-/g, '−');
  const frac = (a, b) => M.fraction(a, b).replace(/-/g, '−');
  const percent = (a, b) => { const value = frac(100 * a, b); return value.includes('/') ? `(${value})%` : `${value}%`; };
  const point = (x, y, label) => ({ x, y, ...(label ? { label } : {}) });
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
    const pattern = r.pick(['positive', 'negative', 'nonlinear', 'none']), slope = r.int(2, 4), base = pattern === 'negative' ? r.int(30, 34) : r.int(3, 8), noise = r.shuffle([-1, 0, 1, -1, 0, 1]);
    const points = pattern === 'none'
      ? [1, 2, 3, 4, 5, 6].flatMap(x => [base + 3, base + 13, base + 23].map(y => point(x, y)))
      : noise.map((e, i) => point(i + 1, pattern === 'nonlinear' ? base + (i + 1) ** 2 : base + (pattern === 'positive' ? slope : -slope) * (i + 1) + e));
    const description = { positive: 'Positive, approximately linear association.', negative: 'Negative, approximately linear association.', nonlinear: 'Positive, nonlinear association; the pattern curves upward.', none: 'No association in this displayed data: the same three y-values occur at every x-value.' }[pattern];
    return {
      prompt: 'Describe the direction and form of the association between x and y in this original data set. Does the pattern alone establish that changing x causes y to change?',
      graph: graph(points, [], { yMax: 50 }),
      answer: `${description} The plot alone does not establish causation.`,
      steps: [pattern === 'none' ? 'Compare the spread of outputs at each x: the distributions are identical.' : `As x increases, y generally ${pattern === 'negative' ? 'decreases' : 'increases'}.`, pattern === 'nonlinear' ? 'The rises grow larger as x increases, so one straight line does not capture the curve.' : pattern === 'none' ? 'Neither a rising nor a falling trend describes the data.' : 'The points cluster around a straight-line pattern, with some variation.', 'Other factors or the way observations were selected could help explain an association; a plot alone cannot prove causation.'],
      workLines: 4
    };
  });

  design('scatter-outlier', '4-1', 'Identify an outlier in a scatter plot', r => {
    const m = r.int(2, 4), b = r.int(3, 7), outX = r.int(2, 5), outY = m * outX + b + r.int(15, 20);
    const points = [1, 2, 3, 4, 5, 6].map(x => point(x, m * x + b + (x % 2 ? -1 : 1)));
    points.push(point(outX, outY, 'P'));
    return {
      prompt: 'Describe the main trend and identify the point that is far from it. Should that point automatically be deleted from the data? Explain.',
      graph: graph(points, [], { yMax: 50 }),
      answer: `The main trend is positive and approximately linear. P(${outX}, ${outY}) is an outlier. Investigate it; do not automatically delete a valid observation.`,
      steps: ['Most points are close to a rising line.', `P has a much greater y-value than other points with similar x-values.`, 'Check for recording or measurement error and consider the context. An unusual value can be real.'],
      workLines: 4
    };
  });

  design('construct-scatter', '4-2', 'Plot paired data', r => {
    const m = r.int(2, 4), b = r.int(4, 8), noise = r.shuffle([-2, -1, 0, 1, 2, 0]), points = noise.map((e, i) => point(i + 1, m * (i + 1) + b + e));
    const settings = { xLabel: 'Daily light (hours)', yLabel: 'Plant height (cm)' };
    return {
      prompt: 'The table gives invented observations from six plants. Plot a scatter plot with daily light on the horizontal axis and height on the vertical axis. Describe the association; do not connect successive observations.',
      table: { headers: ['Daily light (hours)', 'Height (cm)'], rows: points.map(p => [String(p.x), String(p.y)]) },
      graph: graph([], [], settings),
      answerGraph: graph(points, [], settings),
      answer: `Plot ${points.map(p => `(${p.x}, ${p.y})`).join(', ')}. The association is positive and approximately linear.`,
      steps: ['Each row gives one ordered pair: light first, height second.', 'Use the labeled scales and draw six separate points.', 'Taller plants generally have more light in these observations; this alone does not prove that light caused the height differences.'],
      workLines: 3
    };
  });

  design('correct-scatter-point', '4-2', 'Check a scatter plot against paired data', r => {
    const base = r.int(2, 6), scale = r.int(2, 4), wrongIndex = r.int(0, 4), rows = [1, 2, 3, 4, 5].map(x => [x, base + scale * x]);
    const points = rows.map(([x, y], i) => point(x, y + (i === wrongIndex ? 5 : 0), String.fromCharCode(65 + i)));
    return {
      prompt: 'The table is correct, but one labeled point in the scatter plot has the wrong vertical coordinate. Identify the point and state its correct coordinates.',
      table: { headers: ['x', 'y'], rows: rows.map(row => row.map(String)) },
      graph: graph(points),
      answer: `Point ${String.fromCharCode(65 + wrongIndex)} should be (${rows[wrongIndex][0]}, ${rows[wrongIndex][1]}).`,
      steps: ['Match each point’s horizontal coordinate to the first column.', `At x = ${rows[wrongIndex][0]}, the table gives y = ${rows[wrongIndex][1]}, but the graph shows ${points[wrongIndex].y}.`, 'Move only that point to the table’s ordered pair.'],
      workLines: 3
    };
  });

  design('compare-fit-lines', '4-3', 'Compare linear models against data', r => {
    const m = r.int(2, 4), b = r.int(3, 7), gap = r.int(3, 5), high = r.pick([true, false]), bOther = b + gap, noise = r.shuffle([-1, 0, 1, -1, 0, 1]), points = noise.map((e, i) => point(i + 1, m * (i + 1) + b + e));
    const aIntercept = high ? bOther : b, bIntercept = high ? b : bOther;
    return {
      prompt: `Compare model A: y = ${m}x + ${aIntercept} and model B: y = ${m}x + ${bIntercept}. Which better fits the plotted data? Support your choice by comparing the sums of absolute vertical errors at all six points.`,
      table: { headers: ['x', 'y'], rows: points.map(p => [String(p.x), String(p.y)]) },
      graph: graph(points),
      answer: `Model ${high ? 'B' : 'A'} fits better: total absolute error 4, compared with ${6 * gap} for the other model.`,
      steps: [`Subtract each prediction from y = ${m}x + ${b} from its observed y-value: ${noise.map(n).join(', ')}. Their absolute values total 4.`, `The other line is ${gap} units higher at every x-value; its absolute vertical errors total ${6 * gap}.`, 'A smaller total error supports the selected model among these two candidates; it does not establish a perfect prediction rule.'],
      workLines: 5
    };
  });

  design('write-fit-line', '4-3', 'Build a line to model an association', r => {
    const m = r.int(2, 4), b = r.int(4, 8), first = point(1, m + b, 'A'), last = point(6, 6 * m + b, 'B');
    const points = [first, point(2, 2 * m + b + 1), point(3, 3 * m + b - 2), point(4, 4 * m + b + 2), point(5, 5 * m + b - 1), last];
    return {
      prompt: `A student chooses the line through A(1, ${first.y}) and B(6, ${last.y}) as a model for this scatter plot. Write that line’s equation. Explain why some data points may lie off a useful model line.`,
      graph: graph(points),
      answerGraph: graph(points, [[point(0, b), point(7, 7 * m + b)]]),
      answer: `y = ${m}x + ${b}. A model summarizes the trend; it need not pass through every observation.`,
      steps: [`Slope = (${last.y} − ${first.y})/(6 − 1) = ${m}.`, `Use A: ${first.y} = ${m}(1) + b, so b = ${b}.`, 'The other points lie on both sides, close to the chosen line. This is one reasonable model, not a claim of a uniquely best statistical fit.'],
      workLines: 5
    };
  });

  design('model-prediction', '4-4', 'Predict and interpret a linear model', r => {
    const m = r.int(2, 6), b = r.int(10, 25), x = r.int(3, 9);
    return {
      prompt: `For original delivery data with route distances from 2 to 10 km, a model is t = ${m}d + ${b}, where d is route distance in km and t is delivery time in minutes. Predict the time for ${x} km. Interpret the slope and classify this prediction as interpolation or extrapolation.`,
      answer: `About ${m * x + b} minutes; each additional km adds about ${m} minutes to predicted time; interpolation.`,
      steps: [`Substitute d = ${x}: t = ${m}(${x}) + ${b} = ${m * x + b}.`, `The slope’s units are minutes per km. The initial ${b} minutes represent the model’s fixed time component.`, `${x} km is within the observed range of 2–10 km, so this is interpolation. An individual delivery can differ from the prediction.`],
      workLines: 4
    };
  });

  design('inverse-prediction', '4-4', 'Solve a model for an input and assess its limits', r => {
    const m = r.int(2, 6), b = r.int(10, 20), outside = r.pick([true, false]), x = outside ? r.int(15, 22) : r.int(5, 10), y = m * x + b;
    return {
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
      prompt: `A library team models boxes still waiting to be sorted by y = ${initial} − ${rate}x, where x is hours after work starts. The model was based on observations from hours 0 through 8. Predict y at hour ${target} and at hour ${far}. Explain why the later numerical result cannot describe a real box count, and find when the model reaches zero.`,
      answer: `${initial - rate * target} boxes at hour ${target}; the model gives ${n(initial - rate * far)} at hour ${far}, which is impossible as a box count. It reaches zero at hour ${zero}.`,
      steps: [`At x = ${target}, y = ${initial} − ${rate}(${target}) = ${initial - rate * target}.`, `At x = ${far}, y = ${initial} − ${rate}(${far}) = ${n(initial - rate * far)}. Counts cannot be negative.`, `Solve 0 = ${initial} − ${rate}x to get x = ${zero}. Extending the line that far is already extrapolation; the actual rate or supply may change before then.`],
      workLines: 6
    };
  });

  design('two-way-counts', '4-6', 'Read joint and marginal frequencies', r => {
    const a = r.int(8, 30), b = r.int(5, 25), c = r.int(8, 30), d = r.int(5, 25), total = a + b + c + d;
    return {
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
    const morning = r.pick([20, 40, 60]), afternoon = 100 - morning, a = r.int(2, morning / 2 - 1) * 2, c = r.int(2, afternoon / 2 - 1) * 2, b = morning - a, d = afternoon - c;
    return {
      prompt: 'Using the table, find (a) the percentage of all participants who are in the morning group and prefer outdoors and (b) the percentage of the morning group who prefer outdoors. Give exact percentages; a fraction is acceptable.',
      table: frequencyTable(a, b, c, d),
      answer: `(a) ${a}%; (b) ${percent(a, morning)}.`,
      steps: [`For (a), divide the joint count by the grand total: (${a}/100) × 100% = ${a}%.`, `For (b), the condition is Morning group, so the denominator is ${morning}: (${a}/${morning}) × 100% = ${percent(a, morning)}.`, 'The two denominators describe different comparison groups.'],
      workLines: 4
    };
  });

  design('compare-conditional-frequencies', '4-7', 'Compare group percentages for association', r => {
    const nA = r.pick([20, 40, 60]), nB = r.pick([20, 40, 60]), pA = r.int(2, 8) * 10, pB = r.int(2, 8) * 10, a = nA * pA / 100, c = nB * pB / 100;
    return {
      prompt: 'Compare the percentage who prefer outdoors within each session group. Does this sample show an association between session group and activity preference? Explain why raw outdoor counts alone can be misleading.',
      table: frequencyTable(a, nA - a, c, nB - c),
      answer: `Morning: ${pA}%; afternoon: ${pB}%. ${pA === pB ? 'The equal conditional percentages show no association in this table.' : 'The different conditional percentages show an association in this table.'} Compare percentages because group sizes may differ.`,
      steps: [`Morning: (${a}/${nA}) × 100% = ${pA}%.`, `Afternoon: (${c}/${nB}) × 100% = ${pB}%.`, pA === pB ? 'The preference distribution is the same in each group. This descriptive result does not prove what holds in a larger population.' : 'The preference distributions differ. This descriptive sample association does not establish causation or statistical significance in a larger population.'],
      workLines: 4
    };
  });

  return templates;
}));
