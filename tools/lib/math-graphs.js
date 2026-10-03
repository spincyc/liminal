"use strict";

// Original fixed-bank graph revisions. The explicit IDs preserve the accepted
// bank's taxonomy, answer positions, and unrelated questions on regeneration.
const { plane, svg, svgParts: P } = require("../../src/lib/families/shared/figures");

const number = (value) => String(value).replaceAll("-", "−");
const point = (x, y) => `(${number(x)}, ${number(y)})`;
const sumCheck = (inputs, expected) => ({ kind: "sum", inputs, expected });
const ratioCheck = (a, b, expected) => ({ kind: "linear-equation", inputs: [b, 0, a], expected });
const signTerm = (value) => value < 0 ? `− ${Math.abs(value)}` : `+ ${value}`;
const equation = (m, b) => `y = ${m === 1 ? "" : m === -1 ? "−" : number(m)}x ${signTerm(b)}`;
const fraction = (a, b) => {
  if (b < 0) { a = -a; b = -b; }
  let x = Math.abs(a), y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  const n = a / x, d = b / x;
  return { text: d === 1 ? number(n) : `${number(n)}/${d}`, value: a / b };
};

function graph(options, draw, description) {
  const grid = plane(options);
  const alt = `${grid.describe()}. ${description}`;
  return { svg: grid.svg([...grid.grid(), ...grid.axes(), ...draw(grid)], alt), alt, notToScale: false };
}

function referencePoint(grid, x, y) {
  return `<rect x="${grid.px(x) - 3}" y="${grid.py(y) - 3}" width="6" height="6" fill="currentColor"/>`;
}

// Data displays reserve space for full axis titles outside the plotting area.
// Bar and histogram heights are frequencies, with a labeled zero baseline.
function bars(labels, values, { xTitle, yTitle, title, histogram = false }) {
  const left = 58, right = 350, top = 34, bottom = 242;
  const step = Math.max(1, Math.ceil(Math.max(...values) / 6));
  const ceiling = Math.ceil(Math.max(...values) / step) * step;
  const slot = (right - left) / values.length;
  const parts = [P.text(204, 14, title), P.line(left, top, left, bottom), P.line(left, bottom, right, bottom)];
  for (let y = 0; y <= ceiling; y += step) {
    const pixel = bottom - y / ceiling * (bottom - top);
    parts.push(P.line(left - 4, pixel, left, pixel), P.text(left - 9, pixel, y, "end"));
  }
  values.forEach((value, index) => {
    const gap = histogram ? 0 : 12;
    const x = left + index * slot + gap / 2;
    const y = bottom - value / ceiling * (bottom - top);
    parts.push(`<rect x="${x}" y="${y}" width="${slot - gap}" height="${bottom - y}" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2"/>`);
    parts.push(P.text(x + (slot - gap) / 2, bottom + 18, labels[index]));
  });
  parts.push(P.text(204, 288, xTitle));
  parts.push(`<text x="16" y="138" transform="rotate(-90 16 138)" fill="currentColor" font-size="16" text-anchor="middle">${yTitle}</text>`);
  const alt = `${histogram ? "Histogram" : "Bar graph"}: ${title}. Horizontal axis: ${xTitle}. Vertical axis: ${yTitle}, from 0 to ${ceiling} in steps of ${step}. ${labels.map((label, i) => `${label}: ${values[i]}`).join("; ")}.`;
  return { svg: svg(385, 307, parts, alt), alt, notToScale: false };
}

function boxPlot(summary) {
  const [min, q1, median, q3, max] = summary;
  const ceiling = Math.ceil((max + 2) / 5) * 5;
  const x = (value) => 45 + 300 * value / ceiling;
  const parts = [P.text(196, 18, "Minutes spent waiting"), P.line(x(0), 128, x(ceiling), 128)];
  for (let tick = 0; tick <= ceiling; tick += 5) {
    parts.push(P.line(x(tick), 124, x(tick), 132), P.text(x(tick), 150, tick));
  }
  parts.push(P.line(x(min), 75, x(q1), 75), P.line(x(q3), 75, x(max), 75));
  [min, max].forEach((value) => parts.push(P.line(x(value), 61, x(value), 89)));
  parts.push(`<rect x="${x(q1)}" y="51" width="${x(q3) - x(q1)}" height="48" fill="none" stroke="currentColor" stroke-width="2"/>`);
  parts.push(P.line(x(median), 51, x(median), 99));
  summary.forEach((value) => parts.push(P.text(x(value), 37, value)));
  parts.push(P.text(196, 179, "Waiting time (minutes)"));
  const alt = `Box plot of waiting times in minutes, on a horizontal axis from 0 to ${ceiling} in steps of 5. The five marked positions, from left to right, are ${summary.join(", ")}; the box runs from ${q1} to ${q3}, with a vertical line at ${median}, and whiskers end at ${min} and ${max}.`;
  return { svg: svg(390, 197, parts, alt), alt, notToScale: false };
}

const BUILDERS = {
  intersection(s) {
    const x = 1 + s % 4, y = 2 + s % 3;
    const b = y - x, c = y + 2 * x;
    const horizontal = s % 2 === 1, answer = horizontal ? x : y;
    return {
      family: "graph-system-intersection",
      figure: graph({ xMin: -2, xMax: 8, yMin: -6, yMax: 14, yStep: 2, yUnit: 15 },
        (g) => [g.line(-1, 1, b), g.line(2, 1, c, { dashed: true })],
        `A solid line passes through ${point(0, b)} and ${point(2, b + 2)}. A dashed line passes through ${point(0, c)} and ${point(2, c - 4)}. Both lines continue beyond the displayed window.`),
      stem: horizontal ? "The solid and dashed lines show the two equations in a system. What is the x-coordinate of the solution?" : "A system has the two graphed lines as its equations. At the point satisfying both equations, what is the vertical coordinate?",
      answer,
      wrong: [[horizontal ? y : x, `This is the intersection's ${horizontal ? "y" : "x"}-coordinate.`], [b, "This is the solid line's y-intercept."], [c, "This is the dashed line's y-intercept."], [x + y, "This adds the intersection's two coordinates."], [-answer, "This changes the sign of the requested coordinate."]],
      why: `The two lines intersect at ${point(x, y)}. The solution's ${horizontal ? "x" : "y"}-coordinate is ${answer}.`,
      steps: ["Locate the point lying on both lines.", `Read its ${horizontal ? "horizontal" : "vertical"} coordinate: ${answer}.`, `The other coordinate, ${horizontal ? y : x}, is not the requested value.`],
      principles: ["A system's solution lies on both graphs."], hint: "Find where the lines meet, then identify which coordinate is requested.",
      trap: "Reporting the other coordinate or one line's intercept.", verification: horizontal ? ratioCheck(c - b, 3, x) : sumCheck([x, b], y),
    };
  },
  slope(s) {
    const rise = (s % 2 ? -1 : 1) * (3 + 3 * (s % 3)), y = -3 + s % 4;
    return {
      family: "graph-slope-scaled-axes",
      figure: graph({ xMin: -6, xMax: 6, yMin: -14, yMax: 12, xStep: 2, yStep: 2, yUnit: 12 },
        (g) => [g.line(-rise / 6, 1, y + rise * 4 / 6), g.point(-4, y), g.point(2, y + rise), g.label(-4, y, `A ${point(-4, y)}`, { dx: 0, dy: -42, anchor: "middle" }), g.label(2, y + rise, `B ${point(2, y + rise)}`, { dx: 10, dy: rise > 0 ? 18 : -18 })],
        `A line passes through the marked points A ${point(-4, y)} and B ${point(2, y + rise)}. Grid spacing is 2 units. Numbered x ticks are 2 units apart; numbered y ticks are 4 units apart.`),
      stem: "What is the slope of the line through points A and B?",
      answer: fraction(rise, 6),
      wrong: [[fraction(6, rise), "This divides the horizontal change by the vertical change."], [-rise / 6, "This reverses one subtraction but not the other."], [rise, "This uses the vertical change without dividing by the horizontal change."], [rise / 2, "This divides by B's x-coordinate instead of the change in x."], [6, "This reports the horizontal change alone."]],
      why: `From A to B, x increases by 6 and y changes by ${number(rise)}. The slope is ${number(rise)}/6 = ${fraction(rise, 6).text}.`,
      steps: ["Read coordinates using the axis numbers, rather than counting pixels.", `Subtract in the same order: Δy = ${number(rise)} and Δx = 6.`, "Divide the vertical change by the horizontal change."],
      principles: ["Slope is change in y divided by change in x."], hint: "Check the numbered tick marks before finding rise and run.",
      trap: "Reversing rise and run or treating a tick interval as one unit.", verification: ratioCheck(rise, 6, rise / 6),
    };
  },
  line(s) {
    const m = s % 2 ? -2 : 2, b = 2 + s % 5;
    return {
      family: "graph-linear-equation",
      figure: graph({ xMin: -4, xMax: 6, yMin: -8, yMax: 12, yStep: 2, yUnit: 15 },
        (g) => [g.line(-m, 1, b), g.point(0, b), g.point(2, 2 * m + b)],
        `A line passes through two marked grid points, ${point(0, b)} and ${point(2, 2 * m + b)}, and continues in both directions.`),
      stem: "Which equation represents the graphed line?",
      answer: equation(m, b),
      wrong: [[equation(-m, b), "This reverses the slope while keeping the intercept."], [equation(m, -b), "This reflects the y-intercept across the x-axis."], [equation(-m, -b), "This changes the signs of both the slope and intercept."]],
      why: `The y-intercept is ${b}. Moving 2 units to the right changes y by ${number(2 * m)}, so the slope is ${number(m)}. Thus ${equation(m, b)}.`,
      steps: [`Read the crossing of the y-axis: ${b}.`, `Use the marked points to find the slope: ${number(2 * m)}/2 = ${number(m)}.`, "Match both the slope and intercept to one equation."],
      principles: ["In y = mx + b, m is the slope and b is the y-intercept."], hint: "An equation must match both where the line crosses the vertical axis and its direction.",
      trap: "Choosing an equation that matches only one feature of the graph.",
    };
  },
  range(s) {
    const h = s % 5 - 2, direction = s % 2 ? 1 : -1, k = direction * (-2 - s % 6);
    const bound = direction > 0 ? "minimum" : "maximum", relation = direction > 0 ? "≥" : "≤";
    return {
      family: "graph-quadratic-range",
      figure: graph({ xMin: -6, xMax: 6, yMin: -8, yMax: 8, yStep: 2, yUnit: 19 },
        (g) => [g.curve((x) => direction * (x - h) ** 2 + k), g.point(h, k)],
        `A parabola opening ${direction > 0 ? "upward" : "downward"} has its ${direction > 0 ? "lowest" : "highest"} point at ${point(h, k)}, marked by a dot. It passes through ${point(h - 1, k + direction)} and ${point(h + 1, k + direction)} and continues ${direction > 0 ? "upward" : "downward"} beyond the window.`),
      stem: "The graph shows a quadratic function defined for every real x. Which inequality describes its range?",
      answer: `y ${relation} ${number(k)}`,
      wrong: [[`y ${direction > 0 ? "≤" : "≥"} ${number(k)}`, "This selects the side of the vertex opposite the curve."], [`y ${relation} ${number(-k)}`, `This changes the sign of the ${bound} output.`], [`y ${direction > 0 ? "≤" : "≥"} ${number(-k)}`, "This both changes the boundary and selects the wrong direction."]],
      why: `The ${bound} output is ${number(k)} and is attained. The parabola continues ${direction > 0 ? "upward" : "downward"} without bound, so its range is y ${relation} ${number(k)}.`,
      steps: [`Read the ${direction > 0 ? "lowest" : "highest"} vertical coordinate of the curve.`, "Include that output because the vertex belongs to the graph.", `Include every ${direction > 0 ? "larger" : "smaller"} output as the arms continue.`],
      principles: ["A function's range consists of its outputs, or y-values."], hint: "Sweep horizontally across the graph and consider which vertical levels it reaches.",
      trap: "Confusing the range with the domain or reversing the inequality.",
    };
  },
  roots(s) {
    const a = -1 - s % 3, b = 2 + s % 3;
    return {
      family: "graph-quadratic-zeros",
      figure: graph({ xMin: -6, xMax: 6, yMin: -14, yMax: 8, yStep: 2, yUnit: 14 },
        (g) => [g.curve((x) => (x - a) * (x - b)), g.point(a, 0), g.point(b, 0)],
        `An upward-opening parabola crosses the horizontal axis at ${point(a, 0)} and ${point(b, 0)}, both marked. Its vertical intercept is ${point(0, a * b)}.`),
      stem: "The graph represents y = f(x). What is the greater solution of f(x) = 0?",
      answer: b,
      wrong: [[a, "This is the smaller root."], [a * b, "This is the vertical intercept, not a zero's x-coordinate."], [0, "The output is zero at a root; the question asks for the input."], [-b, "This changes the sign of the positive root."]],
      why: `The zeros occur where the graph crosses y = 0, at x = ${number(a)} and x = ${b}. The greater solution is ${b}.`,
      steps: ["Locate the crossings of the horizontal axis.", "Read their x-coordinates.", "Choose the greater coordinate."],
      principles: ["A function's zeros are the x-coordinates where its graph meets the x-axis."], hint: "At a zero of the function, the graph has height zero.",
      trap: "Using the y-intercept or reporting the smaller root.", verification: sumCheck([a + b, -a], b),
    };
  },
  transform(s) {
    const x = -2 - s % 3, y = 2 + s % 4, h = (s % 2 ? 1 : -1) * (1 + s % 3), v = 1 + s % 2;
    const a = s % 2 ? -2 : 3, transformed = point(x + h, v + a * y);
    return {
      family: "graph-combined-transformation",
      figure: graph({ xMin: -6, xMax: 6, yMin: -4, yMax: 8 },
        (g) => [g.segment(-5, 1, x, y), g.segment(x, y, 1, -1), g.segment(1, -1, 4, 2), g.point(x, y), g.label(x, y, "P")],
        `The graph of f consists of straight segments joining ${point(-5, 1)}, P ${point(x, y)}, ${point(1, -1)}, and ${point(4, 2)} in order. All endpoints are included.`),
      stem: s % 2 ? `The point P is on the graph of f. Under the transformation g(x) = ${number(a)}f(x ${signTerm(-h)}) + ${v}, to which point does P move?` : `For the graphed function f, define g(x) = ${number(a)}f(x ${signTerm(-h)}) + ${v}. Which ordered pair on g corresponds to the marked point P?`,
      answer: transformed,
      wrong: [[point(x - h, v + a * y), "This shifts horizontally in the opposite direction."], [point(x + h, a * (y + v)), "This adds the vertical shift before applying the vertical scale factor."], [point(x - h, a * (y + v)), "This both reverses the horizontal shift and applies the vertical shift in the wrong order."]],
      why: `P is ${point(x, y)}. The new input is ${number(x + h)}, since ${h > 0 ? "subtracting" : "adding"} ${Math.abs(h)} then gives the old input ${number(x)}. The new output is ${number(a)}(${y}) + ${v} = ${number(v + a * y)}, so P moves to ${transformed}.`,
      steps: ["Read the coordinates of P from the graph.", `${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)} ${h > 0 ? "to" : "from"} the old x-coordinate.`, `Multiply the old y-coordinate by ${number(a)}, then add ${v}.`],
      principles: ["For g(x) = af(x − h) + k, (u, v) on f corresponds to (u + h, av + k) on g."], hint: "Find the new input that makes the expression inside f equal P's old input.",
      trap: "Reversing the horizontal shift or applying the vertical shift before the scale factor.",
    };
  },
  intercept(s) {
    const x = 1 + s % 7, b = 2 * x;
    return {
      family: "graph-x-intercept",
      figure: graph({ xMin: -2, xMax: 10, yMin: -6, yMax: 16, yStep: 2, yUnit: 14 },
        (g) => [g.line(2, 1, b), g.point(0, b), g.point(x, 0)],
        `A descending line crosses the vertical axis at ${point(0, b)} and the horizontal axis at ${point(x, 0)}. Both crossings are marked.`),
      stem: "What is the x-coordinate of the line's x-intercept?",
      answer: x,
      wrong: [[b, "This is the y-intercept's vertical coordinate."], [-x, "This changes the sign of the horizontal crossing."], [0, "This is the y-coordinate at the x-intercept."], [-2, "This is the line's slope."]],
      why: `The line crosses the horizontal axis at ${point(x, 0)}, so the requested coordinate is ${x}.`,
      steps: ["Find the crossing of the horizontal axis.", "Read its horizontal coordinate."],
      principles: ["At an x-intercept, y = 0."], hint: "The names of the axes tell you which crossing to use.",
      trap: "Reporting the vertical crossing or the zero coordinate.", verification: ratioCheck(b, 2, x),
    };
  },
  boxes(s) {
    const q1 = 10 + 5 * (s % 3), median = q1 + 5, q3 = median + 5 + 5 * (s % 2);
    const min = q1 - 5, max = q3 + 10;
    return {
      family: "graph-box-plot-iqr", figure: boxPlot([min, q1, median, q3, max]),
      stem: s % 2 ? "A box plot summarizes visitors' waiting times. What is the interquartile range, in minutes?" : "Using the waiting-time box plot, how many minutes separate the first quartile from the third quartile?",
      answer: q3 - q1,
      wrong: [[max - min, "This is the full range, including the whiskers."], [median, "This is the median waiting time, not a spread."], [q3 - median, "This is only the upper part of the box."], [q3, "This is the third quartile alone."], [max, "This is the greatest waiting time."]],
      why: `The box extends from ${q1} to ${q3} minutes. The interquartile range is ${q3} − ${q1} = ${q3 - q1} minutes.`,
      steps: ["Read the two edges of the box, not the ends of the whiskers.", "Subtract the left edge's value from the right edge's value."],
      principles: ["The interquartile range is Q₃ − Q₁ and covers the middle 50% of observations."], hint: "The box itself spans the middle half of the observations.",
      trap: "Using the whisker endpoints and computing the full range.", verification: sumCheck([q3, -q1], q3 - q1),
    };
  },
  bars(s) {
    const counts = [4 + s % 5, 7 + s % 4, 5 + s % 3, 3 + s % 4];
    const total = counts.reduce((a, b) => a + b, 0);
    return {
      family: "graph-bar-total", figure: bars(["A", "B", "C", "D"], counts, { title: "Library workshop attendance", xTitle: "Workshop", yTitle: "Participants" }),
      stem: "Each participant attended exactly one of the four workshops shown. How many participants attended in all?",
      answer: total,
      wrong: [[Math.max(...counts), "This counts only the most attended workshop."], [counts[0] + counts[1], "This adds only workshops A and B."], [total - counts[3], "This omits workshop D."], [counts.length, "This counts workshops, not participants."]],
      why: `The four bar heights are ${counts.join(", ")}. Their sum is ${total}, and no participant is counted twice.`,
      steps: ["Read each bar height using the participants scale.", "Add all four frequencies."],
      principles: ["The total frequency of disjoint categories is the sum of their frequencies."], hint: "Read all four bar heights before adding.",
      trap: "Counting the bars or reading only the tallest bar.", verification: sumCheck(counts, total),
    };
  },
  histogram(s) {
    const lower = 5 + 5 * (s % 3);
    // Both central observations land strictly inside the third class; the
    // second class is taller, so mode and median class genuinely differ.
    const counts = [2 + s % 2, 7 + s % 3, 6 + s % 2, 5 + s % 3];
    const edges = Array.from({ length: 5 }, (_, i) => lower + i * 5);
    const labels = edges.slice(0, 4).map((edge, i) => `${edge}–${edges[i + 1]}`);
    const total = counts.reduce((a, b) => a + b, 0);
    const intervals = edges.slice(0, 4).map((edge, i) => `${edge} ≤ t < ${edges[i + 1]}`);
    return {
      family: "graph-histogram-median-class",
      figure: bars(labels, counts, { title: "Bus journey durations", xTitle: "Journey time (minutes)", yTitle: "Journeys", histogram: true }),
      stem: s % 2 ? "The histogram groups journey times t, in minutes. Each interval includes its lower endpoint and excludes its upper endpoint. Which interval contains the median journey time?" : "Travel times t were grouped as shown, with each lower interval boundary included and each upper boundary excluded. When the journeys are ordered by duration, in which time interval do the two middle journeys fall?",
      answer: intervals[2],
      wrong: [[intervals[0], "The first class contains too few observations to reach the middle."], [intervals[1], "This is the tallest class, but cumulative frequency has not yet reached the middle."], [intervals[3], "The middle observations occur before the last class."]],
      why: `There are ${total} journeys. The first two classes contain ${counts[0] + counts[1]} journeys, and the first three contain ${counts[0] + counts[1] + counts[2]}. Both middle observations therefore lie in ${intervals[2]}. The exact median cannot be recovered from grouped data.`,
      steps: ["Add the class frequencies to find the total.", "Locate the central observation positions in the ordered data.", "Add frequencies from left to right until reaching both central positions."],
      principles: ["Cumulative frequency identifies a median's class; grouped counts do not determine its exact value."], hint: "The tallest bar identifies the modal class. Locate the middle of all journeys instead.",
      trap: "Choosing the tallest bar or assuming the class midpoint is the exact median.",
    };
  },
  prediction(s) {
    const m = 2 + s % 3, b = 5 + s % 5, input = 3 + s % 3;
    const dots = [[1, m + b + 2], [2, 2 * m + b - 1], [4, 4 * m + b + 1], [6, 6 * m + b - 2]];
    const answer = m * input + b;
    return {
      family: "graph-regression-prediction",
      figure: graph({ xMin: 0, xMax: 8, yMin: 0, yMax: 40, yStep: 5, yUnit: 8 },
        (g) => [g.line(-m, 1, b), ...dots.map(([x, y]) => g.point(x, y)), referencePoint(g, 0, b), referencePoint(g, 5, 5 * m + b), g.label(0, b, point(0, b), { dx: 10, dy: 18 }), g.label(5, 5 * m + b, point(5, 5 * m + b), { dx: -10, dy: -14, anchor: "end" })],
        `A scatterplot shows circular observations ${dots.map(([x, y]) => point(x, y)).join(", ")}. The fitted line crosses the y-axis at ${b} and passes through ${point(5, 5 * m + b)}. Small squares mark these two reference points on the line, with coordinate labels. The x-axis measures training sessions; the y-axis measures completed tasks.`),
      stimulus: { type: "text", content: "In this original study, x is the number of training sessions and y is the number of completed tasks. The solid line is a fitted linear model. Small squares mark two reference points on the line; circles show observations." },
      stem: `According to the fitted line, how many completed tasks are predicted after ${input} training sessions?`,
      answer,
      wrong: [[m * input, "This ignores the line's nonzero intercept."], [b, "This predicts for zero training sessions."], [answer + m, "This reads the line one session too far to the right."], [answer - m, "This reads the line one session too far to the left."]],
      why: `The line rises ${m} tasks per session from an intercept of ${b}. At x = ${input}, it predicts ${m}(${input}) + ${b} = ${answer} tasks.`,
      steps: [`Locate ${input} on the horizontal scale.`, "Move vertically to the fitted line, rather than to a data point.", "Read the predicted number of tasks on the vertical scale."],
      principles: ["The line's y-value is the prediction; individual observations can differ."], hint: "Use the solid line at the requested x-value.",
      trap: "Using a nearby observation instead of the fitted line.", verification: sumCheck([m * input, b], answer),
    };
  },
  residual(s) {
    const m = 2 + s % 2, b = 5 + s % 4, x = 3 + s % 3, gap = (s % 2 ? -1 : 1) * (3 + s % 3);
    const predicted = m * x + b, observed = predicted + gap;
    const dots = [[1, m + b + 1], [2, 2 * m + b - 1], [6, 6 * m + b + 2], [x, observed]];
    return {
      family: "graph-regression-residual",
      figure: graph({ xMin: 0, xMax: 8, yMin: 0, yMax: 32, yStep: 4, yUnit: 10 },
        (g) => [g.line(-m, 1, b), ...dots.map(([a, c]) => g.point(a, c)), referencePoint(g, 0, b), referencePoint(g, 4, 4 * m + b), g.label(0, b, point(0, b), { dx: 10, dy: 18 }), g.label(4, 4 * m + b, point(4, 4 * m + b), { dx: -10, dy: -14, anchor: "end" }), g.label(x, observed, `P ${point(x, observed)}`, gap < 0 ? { dx: 10, dy: 18 } : { dx: -10, dy: -16, anchor: "end" })],
        `The scatterplot shows circular observations ${dots.map(([a, c]) => point(a, c)).join(", ")}; P is ${point(x, observed)}. The fitted line passes through ${point(0, b)} and ${point(4, 4 * m + b)}. Small squares mark these two reference points on the line, with coordinate labels. The x-axis measures practice sessions and the y-axis measures successful trials.`),
      stimulus: { type: "text", content: "For an original practice study, x is the number of practice sessions and y is the number of successful trials. The solid line is a fitted linear model. Small squares mark two reference points on the line; circles show observations. Residual means observed value minus predicted value." },
      stem: "What is the residual, in successful trials, for the labeled observation P?",
      answer: gap,
      wrong: [[-gap, "This subtracts observed from predicted, reversing the required order."], [predicted, "This is the line's predicted value, not the residual."], [observed, "This is P's observed value, without subtracting the prediction."], [x, "This is the input, not a vertical difference."]],
      why: `At x = ${x}, the fitted line predicts ${predicted} successful trials and P records ${observed}. The residual is ${observed} − ${predicted} = ${number(gap)}.`,
      steps: ["Read P's coordinates.", "Read the line's height at P's same x-coordinate.", "Subtract predicted from observed, retaining the sign."],
      principles: ["A residual is a vertical difference at the same x-value; points below the line have negative residuals."], hint: "Compare P with the line directly above or below it.",
      trap: "Reversing the subtraction or measuring a horizontal gap.", verification: sumCheck([observed, -predicted], gap),
    };
  },
};

const REVISIONS = [
  ["intersection", "systems", [72, 122]],
  ["slope", "linear", [191, 203]],
  ["line", "linear", [173, 179]],
  ["range", "domain and range", [177, 195]],
  ["roots", "quadratic", [192, 198]],
  ["transform", "transformations", [184, 208]],
  ["intercept", "coordinate geometry", [275, 293]],
  ["boxes", "data displays", [379, 384]],
  ["bars", "data displays", [389, 404]],
  ["histogram", "data displays", [394, 454]],
  ["prediction", "regression", [380, 450]],
  ["residual", "regression", [405, 410]],
];

const byId = new Map(REVISIONS.flatMap(([kind, subskill, ids]) => ids.map((id, index) => [
  `act-mathematics-${String(id).padStart(4, "0")}`, { kind, subskill, seed: index + 1 },
])));

function graphSpecFor(question) {
  const revision = byId.get(question.id);
  if (!revision) return null;
  if (question.subskill !== revision.subskill) throw new Error(`${question.id}: graph revision taxonomy changed`);
  const spec = BUILDERS[revision.kind](revision.seed);
  return { ...spec, strategy: "Read the axes, labels, and scale before using the relevant graph features. Check that the answer has the requested meaning and units." };
}

module.exports = { graphSpecFor, REVISIONS, BUILDERS };
