(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/problem-solving-and-data-analysis"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Two-variable data templates (Problem-Solving and Data Analysis), ordered Easy, Medium, Hard.

  const { MINUS, num } = S;
  const {
    DATA, tidy, isClean, fmt, shown, range, retry, pack, close, r1, seg, chartText, dataDot, parseTable, parseNumber, offerHard,
    packRanked, statementGrid, fitsGrid,
  } = C;

  // "+ 1,250" or "− 1,250": a signed term with thousands separators.
  const signedGrouped = (value) => `${value < 0 ? MINUS : "+"} ${fmt(Math.abs(value))}`;

  // Puts a unit after exactly 1 in the singular: "1 inches" -> "1 inch".
  const SINGULAR = { inches: "inch", centimeters: "centimeter", points: "point", years: "year", weeks: "week", days: "day",
    hours: "hour", degrees: "degree", feet: "foot", miles: "mile", employees: "employee", grams: "gram" };
  const agree = (text) => text.replace(/(^|[^\d.,])1 (inches|centimeters|points|years|weeks|days|hours|degrees|feet|miles|employees|grams)\b/g,
    (match, before, unit) => `${before}1 ${SINGULAR[unit]}`);

  // An axis title inside a sentence: "Temperature (°F)" -> "temperature (°F)".
  const inSentence = (title) => title.charAt(0).toLowerCase() + title.slice(1);

  const gridLine = (p, q) =>
    `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="currentColor" stroke-width="1" stroke-opacity="0.25"/>`;

  const SCATTER_RADIUS = 4;

  // Scatterplot on a grid from (0, 0) to (xMax, yMax), in data units, with an
  // optional line of best fit y = m·x + b clipped to the grid.
  const PLOT = { left: 66, right: 382, top: 16, bottom: 232 };

  function scatterPlot({ xMax, xStep, yMax, yStep, points, fit, curve, xTitle, yTitle, alt }) {
    const { left, right, top, bottom } = PLOT;
    const px = (x) => left + (x / xMax) * (right - left);
    const py = (y) => bottom - (y / yMax) * (bottom - top);
    const parts = [];
    const nx = Math.round(xMax / xStep);
    const ny = Math.round(yMax / yStep);
    for (let i = 0; i <= nx; i += 1) {
      const x = px(i * xStep);
      if (i > 0) parts.push(gridLine([x, top], [x, bottom]));
      parts.push(chartText(x, bottom + 14, num(tidy(i * xStep)), "middle", 12));
    }
    for (let j = 0; j <= ny; j += 1) {
      const y = py(j * yStep);
      if (j > 0) parts.push(gridLine([left, y], [right, y]));
      parts.push(chartText(left - 7, y, fmt(tidy(j * yStep)), "end", 12));
    }
    parts.push(seg([left, bottom], [right, bottom], 1.5), seg([left, bottom], [left, top], 1.5));
    points.forEach(([x, y]) => parts.push(dataDot(px(x), py(y), SCATTER_RADIUS)));
    if (fit) {
      const [m, b] = fit;
      let x0 = 0;
      let x1 = xMax;
      if (m !== 0) {
        const edges = [(0 - b) / m, (yMax - b) / m];
        x0 = Math.max(0, Math.min(...edges));
        x1 = Math.min(xMax, Math.max(...edges));
      }
      parts.push(seg([px(x0), py(m * x0 + b)], [px(x1), py(m * x1 + b)], 2));
    }
    if (curve) {
      // A fitted curve y = curve(x), sampled finely and kept inside the grid.
      const samples = range(0, 80).map((k) => (k / 80) * xMax).filter((x) => curve(x) >= 0 && curve(x) <= yMax);
      parts.push(`<polyline points="${samples.map((x) => `${r1(px(x))},${r1(py(curve(x)))}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="2"/>`);
    }
    parts.push(chartText((left + right) / 2, 270, xTitle, "middle", 13));
    parts.push(chartText(17, (top + bottom) / 2, yTitle, "middle", 13, -90));
    return { svg: S.svg(400, 286, parts, alt), alt, notToScale: false };
  }

  // Reads a scatterplot back: the data points and the drawn fitted line, in
  // data units, from the SVG itself.
  function readScatter(svg, xMax, yMax) {
    const { left, right, top, bottom } = PLOT;
    const dx = (cx) => ((cx - left) / (right - left)) * xMax;
    const dy = (cy) => ((bottom - cy) / (bottom - top)) * yMax;
    const points = [];
    const pointPattern = new RegExp(`<circle cx="([\\d.]+)" cy="([\\d.]+)" r="${SCATTER_RADIUS}"`, "g");
    let match;
    while ((match = pointPattern.exec(svg))) points.push([dx(Number(match[1])), dy(Number(match[2]))]);
    const fitMatch = /<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke="currentColor" stroke-width="2"/.exec(svg);
    if (!fitMatch) return { points, line: null };
    const [x1, y1, x2, y2] = fitMatch.slice(1).map(Number);
    const slope = (dy(y2) - dy(y1)) / (dx(x2) - dx(x1));
    const intercept = dy(y1) - slope * dx(x1);
    return { points, line: (x) => slope * x + intercept, slope, intercept };
  }

  /* ======================================== best-fit-line-equation (Easy) */

  const FIT_SCENES = [
    {
      slopes: [1.2, 1.5, 1.8, 2, 2.5, 3, 3.5], intercepts: [4, 15], xMax: 10, xStep: 1, count: 12,
      xTitle: "Weeks since planting", yTitle: "Height (centimeters)",
      about: (n) => `the heights of ${n} bean plants and the number of weeks since each was planted`,
      define: "where y is the predicted height, in centimeters, of a plant x weeks after it was planted",
      predict: (v) => `Based on the line of best fit, what is the predicted height, in centimeters, of a plant ${v} weeks after it was planted?`,
      rate: (m) => `The predicted height of a plant ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} centimeters for each additional week after planting.`,
      zero: (b) => `The predicted height of a plant is ${num(b)} centimeters at the time it is planted.`,
      rateBack: (m) => `The predicted number of weeks after planting ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} for each additional centimeter of height.`,
      zeroBack: (b) => `The predicted number of weeks after planting is ${num(b)} for a plant with a height of 0 centimeters.`,
    },
    {
      slopes: [-1.2, -1.5, -1.8, -2, -2.4], intercepts: [24, 34], xMax: 10, xStep: 1, count: 14,
      xTitle: "Age (years)", yTitle: "Value (thousands of dollars)",
      about: (n) => `the ages and values of ${n} used cars of the same model`,
      define: "where y is the predicted value, in thousands of dollars, of a car that is x years old",
      predict: (v) => `Based on the line of best fit, what is the predicted value, in thousands of dollars, of a car that is ${v} years old?`,
      rate: (m) => `The predicted value of a car ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} thousand dollars for each additional year of age.`,
      zero: (b) => `The predicted value of a car is ${num(b)} thousand dollars when the car is new (0 years old).`,
      rateBack: (m) => `The predicted age of a car ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} years for each additional thousand dollars of value.`,
      zeroBack: (b) => `The predicted age of a car is ${num(b)} years when its value is 0 thousand dollars.`,
    },
    {
      slopes: [-3, -3.5, -4, -4.5, -5.5], intercepts: [58, 76], xMax: 8, xStep: 1, count: 11,
      xTitle: "Elevation (thousands of feet)", yTitle: "Temperature (°F)",
      about: (n) => `the elevation and the temperature at noon at ${n} weather stations on the same day`,
      define: "where y is the predicted temperature, in degrees Fahrenheit, at an elevation of x thousand feet",
      predict: (v) => `Based on the line of best fit, what is the predicted temperature, in degrees Fahrenheit, at an elevation of ${v} thousand feet?`,
      rate: (m) => `The predicted temperature ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} degrees Fahrenheit for each additional thousand feet of elevation.`,
      zero: (b) => `The predicted temperature is ${num(b)} degrees Fahrenheit at an elevation of 0 feet.`,
      rateBack: (m) => `The predicted elevation ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} thousand feet for each additional degree Fahrenheit.`,
      zeroBack: (b) => `The predicted elevation is ${num(b)} thousand feet where the temperature is 0 degrees Fahrenheit.`,
    },
    {
      slopes: [2.5, 3, 3.5, 4, 4.5, 5], intercepts: [40, 55], xMax: 10, xStep: 1, count: 13,
      xTitle: "Hours studied", yTitle: "Test score (points)",
      about: (n) => `the numbers of hours ${n} students studied for a test and their scores on the test`,
      define: "where y is the predicted test score, in points, for a student who studied for x hours",
      predict: (v) => `Based on the line of best fit, what is the predicted test score, in points, for a student who studied for ${v} hours?`,
      rate: (m) => `The predicted test score ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} points for each additional hour of studying.`,
      zero: (b) => `The predicted test score is ${num(b)} points for a student who did not study.`,
      rateBack: (m) => `The predicted number of hours studied ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} for each additional point on the test.`,
      zeroBack: (b) => `The predicted number of hours studied is ${num(b)} for a student who scored 0 points.`,
    },
    {
      slopes: [-7, -8, -9, -10, -11, -12], intercepts: [92, 100], xMax: 8, xStep: 1, count: 12,
      xTitle: "Hours of use", yTitle: "Battery charge (percent)",
      about: (n) => `the numbers of hours ${n} phones had been in use since a full charge and the percent of battery charge each had left`,
      define: "where y is the predicted percent of battery charge left after x hours of use",
      predict: (v) => `Based on the line of best fit, what is the predicted percent of battery charge left after ${v} hours of use?`,
      rate: (m) => `The predicted battery charge ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} percentage points for each additional hour of use.`,
      zero: (b) => `The predicted battery charge is ${num(b)} percent at the start of use (0 hours).`,
      rateBack: (m) => `The predicted number of hours of use ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} for each additional percentage point of charge.`,
      zeroBack: (b) => `The predicted number of hours of use is ${num(b)} when the battery charge is 0 percent.`,
    },
    {
      slopes: [0.4, 0.5, 0.6, 0.8, 1.2], intercepts: [1, 6], xMax: 20, xStep: 2, count: 12,
      xTitle: "Age of tree (years)", yTitle: "Trunk diameter (inches)",
      about: (n) => `the ages and trunk diameters of ${n} oak trees in a park`,
      define: "where y is the predicted trunk diameter, in inches, of a tree that is x years old",
      predict: (v) => `Based on the line of best fit, what is the predicted trunk diameter, in inches, of a tree that is ${v} years old?`,
      rate: (m) => `The predicted trunk diameter ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} inches for each additional year of age.`,
      zero: (b) => `The predicted trunk diameter is ${num(b)} inches for a tree that is 0 years old.`,
      rateBack: (m) => `The predicted age ${m > 0 ? "increases" : "decreases"} by ${num(Math.abs(m))} years for each additional inch of trunk diameter.`,
      zeroBack: (b) => `The predicted age is ${num(b)} years for a tree with a trunk diameter of 0 inches.`,
    },
  ];

  // A nice gridline spacing giving at most about 10 intervals up to `top`.
  function niceStep(top) {
    const candidates = [1, 2, 5, 10, 20, 25, 50];
    return candidates.find((step) => top / step <= 10) || 100;
  }

  /* ====================================== scatterplot-fit-reading (Medium) */

  const SCATTER_SCENES = [
    {
      sign: 1, xSteps: [1, 2], ySteps: [2, 5, 10],
      xTitle: "Number of employees", yTitle: "Sales (thousands of dollars)",
      about: "the numbers of employees and the monthly sales, in thousands of dollars, of 12 stores",
      residual: (x, more) => `For the store with ${x} employees, the actual monthly sales were how many thousands of dollars ${more ? "greater" : "less"} than the monthly sales predicted by the line of best fit?`,
      predict: (x) => `Based on the line of best fit, what are the predicted monthly sales, in thousands of dollars, for a store with ${x} employees?`,
    },
    {
      sign: -1, xSteps: [1], ySteps: [1, 2, 5],
      xTitle: "Age of car (years)", yTitle: "Price (thousands of dollars)",
      about: "the ages and prices, in thousands of dollars, of 12 used cars",
      residual: (x, more) => `For the car that is ${x} years old, the actual price was how many thousands of dollars ${more ? "greater" : "less"} than the price predicted by the line of best fit?`,
      predict: (x) => `Based on the line of best fit, what is the predicted price, in thousands of dollars, of a car that is ${x} years old?`,
    },
    {
      sign: 1, xSteps: [1, 2, 5], ySteps: [1, 2, 5],
      xTitle: "Fertilizer (grams)", yTitle: "Plant height (centimeters)",
      about: "the amounts of fertilizer, in grams, given to 12 plants and the heights of the plants, in centimeters, after one month",
      residual: (x, more) => `For the plant given ${x} grams of fertilizer, the actual height was how many centimeters ${more ? "greater" : "less"} than the height predicted by the line of best fit?`,
      predict: (x) => `Based on the line of best fit, what is the predicted height, in centimeters, of a plant given ${x} grams of fertilizer?`,
    },
    {
      sign: -1, xSteps: [1, 2], ySteps: [1, 2],
      xTitle: "Distance from center (miles)", yTitle: "Rent (hundreds of dollars)",
      about: "the distance, in miles, from the city center and the monthly rent, in hundreds of dollars, of 12 apartments",
      residual: (x, more) => `For the apartment ${x} miles from the city center, the actual monthly rent was how many hundreds of dollars ${more ? "greater" : "less"} than the rent predicted by the line of best fit?`,
      predict: (x) => `Based on the line of best fit, what is the predicted monthly rent, in hundreds of dollars, of an apartment ${x} miles from the city center?`,
    },
    {
      sign: 1, xSteps: [1], ySteps: [10],
      xTitle: "Hours of practice per week", yTitle: "Score (points)",
      about: "the numbers of hours 12 players practiced per week and their scores, in points, in a tournament",
      residual: (x, more) => `For the player who practiced ${x} hours per week, the actual score was how many points ${more ? "greater" : "less"} than the score predicted by the line of best fit?`,
      predict: (x) => `Based on the line of best fit, what is the predicted score, in points, of a player who practices ${x} hours per week?`,
    },
    {
      sign: -1, xSteps: [1, 2], ySteps: [2, 5],
      xTitle: "Elevation (hundreds of meters)", yTitle: "Temperature (°C)",
      about: "the elevation, in hundreds of meters, and the temperature, in degrees Celsius, at 12 locations on a mountain at the same time",
      residual: (x, more) => `For the location at an elevation of ${x} hundred meters, the actual temperature was how many degrees Celsius ${more ? "greater" : "less"} than the temperature predicted by the line of best fit?`,
      predict: (x) => `Based on the line of best fit, what is the predicted temperature, in degrees Celsius, at an elevation of ${x} hundred meters?`,
    },
  ];

  const X_CELLS = 8;

  const Y_CELLS = 12;

  const bestFitEquation = {
    id: "best-fit-line-equation",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "linear models",
    difficulty: "Easy",
    title: "Reading a line of best fit's equation",
    recognize:
      "In y = mx + b, m is the predicted change in y for each increase of 1 in x, b is the predicted y when x is 0, and a " +
      "prediction substitutes the given x for x.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "reversed-condition"],
    build(t) {
      const scene = t.pick(FIT_SCENES);
      const form = t.pick(["predict", "predict", "slope", "intercept"]);
      const withPlot = t.chance(0.6);
      const numeric = form === "predict" && t.chance(0.5);
      return retry(() => {
        const m = t.pick(scene.slopes);
        const b = t.int(scene.intercepts[0], scene.intercepts[1]);
        const equation = `y = ${S.lin(m, b)}`;
        const intro = withPlot
          ? `The scatterplot shows ${scene.about(scene.count)}. A line of best fit is shown, and its equation is ${equation}, ${scene.define}.`
          : `A researcher recorded ${scene.about(scene.count)}. A line of best fit for the data is ${equation}, ${scene.define}.`;
        const yEnd = Math.max(b, m * scene.xMax + b);
        const yStep = niceStep(yEnd * 1.15);
        const yMax = Math.ceil((yEnd * 1.15) / yStep) * yStep;
        // Points scattered about the line, at distinct x values.
        const slots = range(1, (2 * scene.xMax) / scene.xStep - 1).map((index) => (index * scene.xStep) / 2);
        const xs = t.sample(slots, scene.count);
        const noise = yMax * 0.07;
        const points = xs.map((x, index) => {
          const offset = (index % 2 ? 1 : -1) * (0.2 + t.random() * 0.8) * noise;
          return [x, Math.max(yStep * 0.2, Math.min(yMax - yStep * 0.2, m * x + b + offset))];
        });
        const alt =
          `Scatterplot of ${scene.count} points with ${inSentence(scene.xTitle)} on the horizontal axis (0 to ${scene.xMax}) ` +
          `and ${inSentence(scene.yTitle)} on the vertical axis (0 to ${yMax}). The points ${m > 0 ? "rise" : "fall"} from left to right, ` +
          `and a line of best fit passes through them from about (0, ${num(b)}) to (${scene.xMax}, ${num(tidy(m * scene.xMax + b))}).`;
        const figure = withPlot
          ? scatterPlot({ xMax: scene.xMax, xStep: scene.xStep, yMax, yStep, points, fit: [m, b], xTitle: scene.xTitle, yTitle: scene.yTitle, alt })
          : null;
        const principles = [
          "In a line of best fit y = mx + b, the slope m is the predicted change in y for each increase of 1 in x.",
          "The y-intercept b is the predicted value of y when x = 0.",
        ];
        const common = { stimulus: null, figure, principles, estimatedSeconds: 65 };
        // Two points on the line, read back from the drawing when there is one.
        const lineAt = (x) => {
          if (figure) {
            const read = readScatter(figure.svg, scene.xMax, yMax);
            return read.line ? read.line(x) : NaN;
          }
          return b + ((m * 10 + b - b) / 10) * x;
        };
        if (form === "predict") {
          const v = t.int(2, scene.xMax + 2);
          const key = tidy(m * v + b);
          if (key <= 0) return null;
          return packRanked(t, numeric, key, [
            [m * v, `Multiplies ${v} by the slope but leaves out the ${num(b)} from the intercept.`],
            [b * v + m, "Swaps the slope and the intercept."],
            [b + v, `Adds ${v} to the intercept instead of multiplying ${v} by the slope.`],
            [(v - b) / m, `Solves ${num(v)} = ${S.lin(m, b)} for x, treating ${v} as the value of y.`],
            [m * (v + 1) + b, `Substitutes ${v + 1} for x, one more than the value given.`],
            [m * (v - 1) + b, `Substitutes ${v - 1} for x, one less than the value given.`],
            [m * v - b, `Subtracts the intercept, ${num(b)}, instead of adding it.`],
          ], {
            ...common,
            stem: `${intro} ${scene.predict(v)}`,
            explanation: `Substitute x = ${v}: y = ${num(m)}(${v}) ${S.signed(b)} = ${num(tidy(m * v))} ${S.signed(b)} = ${num(key)}.`,
            steps: [
              `x is ${v}, so substitute it for x in ${equation}.`,
              `${num(m)} × ${v} = ${num(tidy(m * v))}.`,
              `${num(tidy(m * v))} ${S.signed(b)} = ${num(key)}.`,
            ],
            trap: `Leaving out the intercept gives ${num(tidy(m * v))}; the prediction is the whole expression ${S.lin(m, b)}.`,
            hint: "Which variable stands for the given quantity?",
            verify: () => close(lineAt(v), key, 0.01),
          }, { places: 1 });
        }
        // Every choice pairs one of the two numbers with one reading, the full
        // 2 × 2 grid, so no choice is the one the others vary around. The
        // readings: a rate and a starting value, or a reading and its reverse.
        const reverse = t.chance(0.5);
        const readings = form === "slope"
          ? (reverse ? [scene.rate, scene.rateBack] : [scene.rate, scene.zero])
          : (reverse ? [scene.zero, scene.zeroBack] : [scene.zero, scene.rate]);
        const target = form === "slope" ? "m" : "b";
        const numbers = { m: num(m), b: num(b) };
        // Reasons by cell: [reading index][number].
        const why = form === "slope"
          ? {
            0: { b: `Uses the intercept, ${numbers.b}, as the rate of change.` },
            1: {
              m: reverse ? "Reverses the roles of x and y: the slope is the change in y for each unit of x." : `Reads the slope, ${numbers.m}, as a starting value; the slope is a rate of change.`,
              b: reverse ? `Uses the intercept, ${numbers.b}, and reverses the roles of x and y.` : `Describes the intercept, ${numbers.b}, the starting value; the question asks about ${numbers.m}.`,
            },
          }
          : {
            0: { m: `Uses the slope, ${numbers.m}, as the starting value.` },
            1: {
              b: reverse ? "Reverses the roles of x and y: the intercept is the value of y when x = 0." : `Reads the y-intercept, ${numbers.b}, as a rate of change.`,
              m: reverse ? `Uses the slope, ${numbers.m}, and reverses the roles of x and y.` : `Describes the slope, ${numbers.m}, the rate of change; the question asks about ${numbers.b}.`,
            },
          };
        const grid = statementGrid((i, j) => {
          const which = j === 0 ? "m" : "b";
          const text = readings[i](which === "m" ? m : b);
          const truth = i === 0 && which === target;
          return [text, truth ? "" : why[i][which], truth];
        });
        if (!grid || new Set([grid.correct, ...grid.wrong.map(([text]) => text)]).size < 4) return null;
        const keyText = grid.correct;
        const candidates = grid.wrong;
        return pack(false, null, keyText, candidates, {
          ...common,
          stem: `${intro} Which of the following is the best interpretation of ${form === "slope" ? num(m) : num(b)} in this context?`,
          explanation: form === "slope"
            ? `${num(m)} is the slope, the predicted change in y for each increase of 1 in x. ${keyText}`
            : `${num(b)} is the y-intercept, the predicted value of y when x = 0. ${keyText}`,
          steps: [
            `${form === "slope" ? num(m) : num(b)} is the ${form === "slope" ? "coefficient of x, the slope" : "constant term, the y-intercept"}.`,
            form === "slope"
              ? `The slope is the change in y (${inSentence(scene.yTitle)}) for each increase of 1 in x.`
              : "The y-intercept is the value of y when x = 0.",
            `In context: ${keyText}`,
          ],
          trap: form === "slope"
            ? "A slope describes change per unit of x, not a starting amount, and it is change in y per x, not the reverse."
            : "An intercept is a starting value at x = 0, not an amount of change.",
          hint: `What happens to the predicted value of y when x increases by 1${form === "slope" ? "" : ", and what is y when x is 0"}?`,
          verify: () => {
            const slope = lineAt(10) - lineAt(9);
            const start = lineAt(0);
            return form === "slope"
              ? close(slope, m, 0.02) && keyText === scene.rate(m)
              : close(start, b, 0.02) && keyText === scene.zero(b);
          },
        }, true);
      });
    },
  };

  const scatterReading = {
    id: "scatterplot-fit-reading",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "scatterplots",
    difficulty: "Medium",
    title: "Reading a fitted line off a scatterplot",
    recognize:
      "Read values through the axis scales, not grid squares. The line gives predicted values; a point gives an actual value; " +
      "a slope needs two points on the line, and a prediction off the graph needs the slope and the intercept.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity", "sign-error"],
    build(t) {
      const scene = t.pick(SCATTER_SCENES);
      const form = t.pick(["residual", "residual", "equation", "predict"]);
      const numeric = form !== "equation" && t.chance(0.45);
      return retry(() => {
        const xStep = t.pick(scene.xSteps);
        const yStep = t.pick(scene.ySteps);
        const q = scene.sign * t.pick([0.5, 0.75, 1]);
        // Intercept in grid cells, keeping the whole line inside the grid.
        const bCells = t.int(1, 11);
        const endCells = bCells + q * X_CELLS;
        if (endCells < 1 || endCells > 11) return null;
        const m = tidy((q * yStep) / xStep);
        const B = bCells * yStep;
        if (!isClean(m, 2)) return null;
        const xMax = X_CELLS * xStep;
        const yMax = Y_CELLS * yStep;
        const lattice = range(1, X_CELLS - 1).filter((x) => Number.isInteger(q * x));
        const xa = t.pick(lattice);
        const ypCells = bCells + q * xa;
        const d = t.int(2, 4);
        const more = t.chance(0.5);
        const yaCells = ypCells + (more ? d : -d);
        if (form === "residual" && (yaCells < 1 || yaCells > Y_CELLS - 0.5)) return null;
        // Other points: distinct x values away from xa, scattered about the line.
        const slots = range(1, 2 * X_CELLS - 1).map((index) => index / 2).filter((x) => Math.abs(x - xa) >= 0.5);
        const xs = t.sample(slots, form === "residual" ? 11 : 12);
        const cells = xs.map((x, index) => {
          const offset = (index % 2 ? 1 : -1) * (0.3 + t.random() * 1.2);
          return [x, Math.max(0.3, Math.min(Y_CELLS - 0.3, bCells + q * x + offset))];
        });
        if (form === "residual") cells.push([xa, yaCells]);
        const points = cells.map(([x, y]) => [x * xStep, y * yStep]);
        const alt =
          `Scatterplot of ${points.length} points with ${inSentence(scene.xTitle)} on the horizontal axis, 0 to ${xMax} with gridlines every ${xStep}, ` +
          `and ${inSentence(scene.yTitle)} on the vertical axis, 0 to ${yMax} with gridlines every ${yStep}. A line of best fit passes through ` +
          `(0, ${B}) and (${xMax}, ${num(tidy(endCells * yStep))})` +
          (form === "residual" ? `; the data point at x = ${xa * xStep} is at y = ${num(tidy(yaCells * yStep))}.` : ".");
        const figure = scatterPlot({ xMax, xStep, yMax, yStep, points, fit: [m, B], xTitle: scene.xTitle, yTitle: scene.yTitle, alt });
        const read = () => readScatter(figure.svg, xMax, yMax);
        const intro = `The scatterplot shows ${scene.about}, and a line of best fit for the data.`;
        const principles = [
          "A point on a scatterplot shows an actual value; the line of best fit shows the predicted value for each x.",
          "The slope of a line is the change in y divided by the change in x between two points on it, read with the axis scales.",
        ];
        const slopeStep = `The line passes through (0, ${B}) and (${4 * xStep}, ${num(tidy((bCells + 4 * q) * yStep))}), so its slope is ${num(tidy(4 * q * yStep))} ÷ ${4 * xStep} = ${num(m)}.`;
        const common = { stimulus: null, figure, principles, estimatedSeconds: 95 };

        if (form === "residual") {
          const actual = tidy(yaCells * yStep);
          const predicted = tidy(ypCells * yStep);
          const key = tidy(d * yStep);
          const x = xa * xStep;
          return packRanked(t, numeric, key, [
            [yStep !== 1 ? d : NaN, `Counts ${d} grid squares between the point and the line without using the vertical scale, ${yStep} per square.`],
            [predicted, `Gives the predicted value, ${num(predicted)}, instead of the difference.`],
            [actual, `Gives the actual value, ${num(actual)}, instead of the difference.`],
            [key + yStep, "Reads the point or the line one gridline off."],
            [key - yStep, "Reads the point or the line one gridline off."],
            [key + 2 * yStep, "Reads the point and the line each one gridline off."],
          ], {
            ...common,
            stem: `${intro} ${scene.residual(x, more)}`,
            explanation:
              `The data point at x = ${x} is at ${num(actual)}. The line of best fit at x = ${x} is at ${num(predicted)}. ` +
              `The difference is ${num(Math.max(actual, predicted))} ${MINUS} ${num(Math.min(actual, predicted))} = ${num(key)}.`,
            steps: [
              `Actual value: the data point above x = ${x} is at y = ${num(actual)}.`,
              `Predicted value: the line of best fit crosses x = ${x} at y = ${num(predicted)}.`,
              `Difference: ${num(Math.max(actual, predicted))} ${MINUS} ${num(Math.min(actual, predicted))} = ${num(key)}.`,
            ],
            trap: `The point is ${d} grid squares from the line, but each square is ${yStep} ${yStep === 1 ? "unit" : "units"}; the predicted value ${num(predicted)} is only a step on the way.`,
            hint: "Where is the data point, and where is the line, at that value of x?",
            verify: () => {
              const { points: seen, line } = read();
              const target = seen.find(([px]) => Math.abs(px - x) < 0.02 * xStep);
              return Boolean(target && line) && close(Math.abs(target[1] - line(x)), key, 0.01);
            },
          });
        }

        if (form === "equation") {
          const eq = (slope, intercept) => `y = ${S.lin(slope, intercept)}`;
          const keyText = eq(m, B);
          const inverse = tidy(1 / m);
          // One wrong slope and one wrong intercept, crossed: the full 2 × 2
          // grid, so no choice is the one the others vary around.
          const slopes = [
            [q !== m ? q : null, "counts grid squares for the slope without using the scales on the axes"],
            [isClean(inverse, 2) && inverse !== m ? inverse : null, "uses the change in x divided by the change in y, the reciprocal of the slope"],
            [-m, `gives the slope the wrong sign, though the line ${m > 0 ? "rises" : "falls"} from left to right`],
          ].filter(([value]) => value !== null);
          const intercepts = [
            [tidy(B + m * xStep), `uses the line's value at x = ${xStep} as the y-intercept`],
            [yStep !== 1 ? bCells : null, "reads the y-intercept in grid squares instead of with the vertical scale"],
          ].filter(([value]) => value !== null && value !== B);
          const [badSlope, slopeWhy] = t.pick(slopes);
          const [badStart, startWhy] = t.pick(intercepts);
          const cap = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
          const grid = statementGrid((i, j) => [
            eq(i ? badSlope : m, j ? badStart : B),
            i && j ? cap(`${slopeWhy}, and ${startWhy}`) : i ? cap(slopeWhy) : cap(startWhy),
            !i && !j,
          ]);
          if (!grid) return null;
          return pack(false, null, keyText, grid.wrong, {
            ...common,
            stem: `${intro} Which of the following is an equation of the line of best fit shown?`,
            explanation: `${slopeStep} The line crosses the y-axis at ${B}, so its equation is ${keyText}.`,
            steps: [
              `Read two points on the line, using the axis scales: (0, ${B}) and (${4 * xStep}, ${num(tidy((bCells + 4 * q) * yStep))}).`,
              `Slope: ${num(tidy(4 * q * yStep))} ÷ ${4 * xStep} = ${num(m)}.`,
              `The y-intercept is ${B}, so the equation is ${keyText}.`,
            ],
            trap: `Counting squares gives a slope of ${num(q)}; the axes use different scales, ${xStep} per square across and ${yStep} per square up.`,
            hint: "Where does the line cross the y-axis, and how much does y change when x increases by one gridline?",
            verify: () => {
              const { slope, intercept } = read();
              const match = /^y = (.+)$/.exec(keyText);
              const expression = match[1].replace(/ /g, "").replace(MINUS, "-").replace(/−/g, "-");
              const [coefficient, constant] = expression.split("x");
              const parsedSlope = coefficient === "" ? 1 : coefficient === "-" ? -1 : Number(coefficient);
              const parsedIntercept = constant ? Number(constant) : 0;
              return close(slope, parsedSlope, 0.01) && close(intercept, parsedIntercept, 0.01);
            },
          }, true);
        }

        const j = t.pick([2, 4, 6, 8, 12]);
        const xb = (X_CELLS + j) * xStep;
        const key = tidy(m * xb + B);
        if (key <= 0) return null;
        const edge = tidy(endCells * yStep);
        return packRanked(t, numeric, key, [
          [m * xb, `Multiplies ${xb} by the slope but leaves out the intercept, ${B}.`],
          [q * xb + B, "Counts grid squares for the slope without using the scales on the axes."],
          [edge, `Gives the predicted value at x = ${xMax}, the right edge of the graph, instead of at x = ${xb}.`],
          [xb / m + B, "Uses the change in x divided by the change in y as the slope."],
          [m * xb - B, `Subtracts the intercept, ${B}, instead of adding it.`],
          [m * (xb + xStep) + B, `Substitutes ${xb + xStep}, one gridline past x = ${xb}.`],
        ], {
          ...common,
          stem: `${intro} ${scene.predict(xb)}`,
          explanation: `${slopeStep} The y-intercept is ${B}, so the line is y = ${S.lin(m, B)}, and at x = ${xb}, y = ${num(m)}(${xb}) ${S.signed(B)} = ${num(key)}.`,
          steps: [
            slopeStep,
            `The y-intercept is ${B}, so the line is y = ${S.lin(m, B)}.`,
            `Substitute x = ${xb}: ${num(m)}(${xb}) ${S.signed(B)} = ${num(key)}.`,
          ],
          trap: `x = ${xb} is off the graph, so the value cannot be read; stopping at the right edge gives ${num(edge)}.`,
          hint: "How much does y change for each gridline across, and where does the line start?",
          verify: () => {
            const { line } = read();
            return Boolean(line) && close(line(xb), key, 0.01);
          },
        });
      });
    },
  };

  /* ================================= scatterplot-shape-and-count (Easy) */

  // Approximate coordinates, for alt text: whole numbers on large scales.
  const altValue = (value, top) => num(top >= 50 ? Math.round(value) : Math.round(value * 10) / 10);
  const altPoints = (points, yTop) => points
    .slice()
    .sort((p, q) => p[0] - q[0])
    .map(([x, y]) => `(${num(tidy(x))}, ${altValue(y, yTop)})`)
    .join(", ");

  const PATTERNS = {
    upLinear: "Increasing linear",
    downLinear: "Decreasing linear",
    upExp: "Increasing exponential",
    downExp: "Decreasing exponential",
  };

  const PATTERN_CHANGES = {
    upLinear: "y increases by about the same amount each time",
    downLinear: "y decreases by about the same amount each time",
    upExp: "y increases by larger and larger amounts",
    downExp: "y decreases by smaller and smaller amounts",
  };

  // Each pattern's distractors, strongest first.
  const PATTERN_WRONG = {
    upLinear: [
      ["downLinear", "Reverses the direction: the points rise from left to right, so y increases as x increases."],
      ["upExp", "Sees a curve that is not there: the points rise by about the same amount for each increase in x, as points near a line do."],
      ["downExp", "Reverses the direction and reads the straight pattern as a curve."],
    ],
    downLinear: [
      ["upLinear", "Reverses the direction: the points fall from left to right, so y decreases as x increases."],
      ["downExp", "Sees a curve that is not there: the points fall by about the same amount for each increase in x, as points near a line do."],
      ["upExp", "Reverses the direction and reads the straight pattern as a curve."],
    ],
    upExp: [
      ["upLinear", "Misses the curve: the points rise more and more steeply from left to right, which points near a line do not do."],
      ["downExp", "Reverses the direction: the points rise from left to right."],
      ["downLinear", "Reverses the direction and misses the curve."],
    ],
    downExp: [
      ["downLinear", "Misses the curve: the points fall steeply at first and then level off, which points near a line do not do."],
      ["upExp", "Reverses the direction: the points fall from left to right."],
      ["upLinear", "Reverses the direction and misses the curve."],
    ],
  };

  // y values in tenths of the vertical axis (0 to 10) for x values from 0 to 10.
  function patternTenths(t, pattern, xs) {
    const jitter = () => t.random() * 2 - 1;
    let values;
    if (pattern === "upLinear" || pattern === "downLinear") {
      // Starting near 0 keeps a line from being mistaken for gentle growth.
      const low = 0.5 + t.random() * 0.6;
      const high = 8 + t.random() * 1.2;
      const [start, end] = pattern === "upLinear" ? [low, high] : [high, low];
      values = xs.map((x) => start + ((end - start) * x) / 10 + jitter() * 0.35);
    } else if (pattern === "upExp") {
      const g = t.pick([1.3, 1.35, 1.4, 1.45, 1.5]);
      values = xs.map((x) => 9 * g ** (x - 9.5) * (1 + jitter() * 0.07));
    } else {
      const d = t.pick([0.65, 0.7, 0.75]);
      values = xs.map((x) => 9 * d ** (x - 0.5) * (1 + jitter() * 0.07));
    }
    return values.map((value) => Math.max(0.12, Math.min(9.8, value)));
  }

  // Least-squares line of y on x.
  function leastSquares(points) {
    const n = points.length;
    const mx = points.reduce((total, [x]) => total + x, 0) / n;
    const my = points.reduce((total, [, y]) => total + y, 0) / n;
    let sxy = 0;
    let sxx = 0;
    points.forEach(([x, y]) => {
      sxy += (x - mx) * (y - my);
      sxx += (x - mx) ** 2;
    });
    const slope = sxy / sxx;
    return { slope, at: (x) => my + slope * (x - mx) };
  }

  // Squared error, in y itself, of the best line and of the best exponential
  // (fitted to ln y), so the two models are judged on the same scale.
  function modelErrors(points) {
    const line = leastSquares(points);
    const logLine = leastSquares(points.map(([x, y]) => [x, Math.log(y)]));
    const error = (predict) => points.reduce((total, [x, y]) => total + (y - predict(x)) ** 2, 0);
    return { slope: line.slope, linear: error(line.at), exponential: error((x) => Math.exp(logLine.at(x))) };
  }

  const COUNT_SCENES = [
    {
      sign: 1, xSteps: [1, 2], ySteps: [5, 10], xTitle: "Number of employees", yTitle: "Sales (thousands of dollars)",
      about: (n) => `the numbers of employees and the monthly sales, in thousands of dollars, of ${n} stores`,
      ask: (more) => `For how many of the stores were the actual monthly sales ${more ? "greater" : "less"} than the sales predicted by the line of best fit?`,
      things: "stores",
    },
    {
      sign: -1, xSteps: [1], ySteps: [1, 2], xTitle: "Age of car (years)", yTitle: "Price (thousands of dollars)",
      about: (n) => `the ages and prices, in thousands of dollars, of ${n} used cars`,
      ask: (more) => `For how many of the cars was the actual price ${more ? "greater" : "less"} than the price predicted by the line of best fit?`,
      things: "cars",
    },
    {
      sign: 1, xSteps: [1, 2], ySteps: [5, 10], xTitle: "Hours studied", yTitle: "Test score (points)",
      about: (n) => `the numbers of hours ${n} students studied for a test and their scores on the test`,
      ask: (more) => `For how many of the students was the actual score ${more ? "greater" : "less"} than the score predicted by the line of best fit?`,
      things: "students",
    },
    {
      sign: -1, xSteps: [1, 2], ySteps: [1, 2], xTitle: "Elevation (hundreds of meters)", yTitle: "Temperature (°C)",
      about: (n) => `the elevations, in hundreds of meters, and the noon temperatures, in degrees Celsius, at ${n} weather stations on a mountain`,
      ask: (more) => `For how many of the weather stations was the actual temperature ${more ? "greater" : "less"} than the temperature predicted by the line of best fit?`,
      things: "weather stations",
    },
    {
      sign: 1, xSteps: [2, 5], ySteps: [2, 5], xTitle: "Age of tree (years)", yTitle: "Height (feet)",
      about: (n) => `the ages, in years, and the heights, in feet, of ${n} maple trees in a park`,
      ask: (more) => `For how many of the trees was the actual height ${more ? "greater" : "less"} than the height predicted by the line of best fit?`,
      things: "trees",
    },
    {
      sign: -1, xSteps: [1], ySteps: [1, 2], xTitle: "Distance from city center (miles)", yTitle: "Rent (hundreds of dollars)",
      about: (n) => `the distances from the city center, in miles, and the monthly rents, in hundreds of dollars, of ${n} apartments`,
      ask: (more) => `For how many of the apartments was the actual monthly rent ${more ? "greater" : "less"} than the rent predicted by the line of best fit?`,
      things: "apartments",
    },
  ];

  const PATTERN_LEADS = [
    (n) => `The scatterplot shows the relationship between two variables, x and y, for ${n} data points.`,
    (n) => `A researcher plotted ${n} data points to show how the variable y is related to the variable x.`,
    (n) => `The scatterplot shows ${n} data points for the variables x and y.`,
    (n) => `The scatterplot shows the values of two variables, x and y, recorded for each of ${n} objects.`,
  ];

  function patternItem(t) {
    return retry(() => {
      const item = patternDraw(t);
      return item.verify() ? item : null;
    });
  }

  function patternDraw(t) {
    const pattern = t.pick(Object.keys(PATTERNS));
    const count = t.int(10, 16);
    // Points across the whole range, so the shape (straight or bending) shows.
    const xs = t.sample(range(1, 19).map((index) => index / 2), count);
    if (Math.min(...xs) > 1.5 || Math.max(...xs) < 8.5) return { verify: () => false };
    const tenths = patternTenths(t, pattern, xs);
    const yTop = t.pick([10, 20, 50, 100, 200, 500, 1000]);
    const points = xs.map((x, index) => [x, (tenths[index] * yTop) / 10]);
    const alt =
      `Scatterplot of ${count} points with x from 0 to 10 on the horizontal axis and y from 0 to ${fmt(yTop)} on the vertical axis. ` +
      `The points are at approximately ${altPoints(points, yTop)}.`;
    const figure = scatterPlot({ xMax: 10, xStep: 1, yMax: yTop, yStep: yTop / 10, points, fit: null, xTitle: "x", yTitle: "y", alt });
    const lead = t.pick(PATTERN_LEADS)(count);
    const keyText = PATTERNS[pattern];
    const rising = pattern.startsWith("up");
    const curved = pattern.endsWith("Exp");
    // Two wordings: named patterns, or how y changes as x increases.
    const described = t.chance(0.5);
    const ask = described
      ? "Which of the following best describes how y changes as x increases?"
      : "Which of the following best describes the relationship between x and y?";
    const say = (name) => (described ? PATTERN_CHANGES[name] : PATTERNS[name]);
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure,
      stem: `${lead} ${ask}`,
      correct: say(pattern),
      wrong: PATTERN_WRONG[pattern].map(([name, reason]) => [say(name), reason]),
      explanation:
        `The points ${rising ? "rise" : "fall"} from left to right, so y ${rising ? "increases" : "decreases"} as x increases. ` +
        (curved
          ? `They do not lie near a line: they ${rising ? "rise slowly at first and then more and more steeply" : "fall steeply at first and then level off"}, the shape of exponential ${rising ? "growth" : "decay"}.`
          : "They lie close to a straight line, changing by about the same amount for each increase in x.") +
        ` The relationship is ${keyText.toLowerCase()}.`,
      steps: [
        `Direction: the points ${rising ? "rise" : "fall"} from left to right, so the relationship is ${rising ? "increasing" : "decreasing"}.`,
        curved
          ? `Shape: the change in y ${rising ? "grows larger" : "shrinks"} as x increases, so the points follow a curve, not a line.`
          : "Shape: y changes by about the same amount for each increase in x, so the points follow a line.",
        `So the relationship is ${keyText.toLowerCase()}.`,
      ],
      principles: [
        "Points that rise from left to right show an increasing relationship; points that fall show a decreasing one.",
        "A linear pattern changes by about the same amount for each increase in x; an exponential pattern changes by more and more (growth) or less and less (decay).",
      ],
      trap: curved
        ? "Seeing only the direction and calling the pattern linear misses the bend."
        : "A few points off the line do not make the pattern curved; look at the overall trend.",
      hint: "As x increases, does y go up or down, and by about the same amount each time?",
      estimatedSeconds: 50,
      verify: () => {
        const read = readScatter(figure.svg, 10, yTop).points;
        if (read.length !== count || read.some(([, y]) => y <= 0)) return false;
        const fit = modelErrors(read);
        return (fit.slope > 0) === rising && (fit.exponential < fit.linear) === curved;
      },
    };
  }

  function countItem(t, numeric) {
    const scene = t.pick(COUNT_SCENES);
    return retry(() => {
      const xStep = t.pick(scene.xSteps);
      const yStep = t.pick(scene.ySteps);
      const q = scene.sign * t.pick([0.5, 0.75, 1]);
      const bCells = t.int(2, 10);
      const endCells = bCells + q * X_CELLS;
      if (endCells < 2 || endCells > 10) return null;
      const m = tidy((q * yStep) / xStep);
      const B = bCells * yStep;
      if (!isClean(m, 2)) return null;
      const n = t.int(10, 14);
      // Roughly balanced, as about a real line of best fit, but never an even split.
      const above = t.int(Math.ceil(0.35 * n), Math.floor(0.65 * n));
      if (2 * above === n) return null;
      const xs = t.sample(range(1, 2 * X_CELLS - 1).map((index) => index / 2), n);
      const sides = t.shuffle([...Array(above).fill(1), ...Array(n - above).fill(-1)]);
      // Scattered about the line, not in long runs on one side, read left to right.
      const order = xs.map((x, index) => [x, sides[index]]).sort((p, q) => p[0] - q[0]).map(([, side]) => side);
      if (order.some((side, index) => index >= 3 && order.slice(index - 3, index + 1).every((other) => other === side))) return null;
      const near = t.int(0, n - 1);
      const cells = [];
      for (let index = 0; index < n; index += 1) {
        const line = bCells + q * xs[index];
        const room = sides[index] > 0 ? Y_CELLS - 0.3 - line : line - 0.3;
        const want = index === near ? 0.55 + t.random() * 0.15 : 0.95 + t.random() * 1.1;
        const offset = Math.min(want, room);
        if (offset < (index === near ? 0.55 : 0.95)) return null;
        cells.push([xs[index], line + sides[index] * offset]);
      }
      const xMax = X_CELLS * xStep;
      const yMax = Y_CELLS * yStep;
      const points = cells.map(([x, y]) => [x * xStep, y * yStep]);
      const more = t.chance(0.5);
      const key = more ? above : n - above;
      const closeOnAsked = (sides[near] > 0) === more;
      const closeX = num(tidy(xs[near] * xStep));
      const alt =
        `Scatterplot of ${n} points with ${inSentence(scene.xTitle)} on the horizontal axis, 0 to ${xMax}, and ` +
        `${inSentence(scene.yTitle)} on the vertical axis, 0 to ${yMax}. A line of best fit passes through (0, ${B}) and ` +
        `(${xMax}, ${num(tidy(endCells * yStep))}). The points are at approximately ${altPoints(points, yMax)}.`;
      const figure = scatterPlot({ xMax, xStep, yMax, yStep, points, fit: [m, B], xTitle: scene.xTitle, yTitle: scene.yTitle, alt });
      const side = more ? "above" : "below";
      return packRanked(t, numeric, key, [
        [n - key, `Counts the points ${more ? "below" : "above"} the line, where the actual value is ${more ? "less" : "greater"} than the predicted value.`],
        [n, "Counts every data point instead of only those on one side of the line."],
        [closeOnAsked ? key - 1 : key + 1, closeOnAsked
          ? `Leaves out the point just ${side} the line at x = ${closeX}.`
          : `Counts the point just ${more ? "below" : "above"} the line at x = ${closeX} as if it were ${side} the line.`],
        [n - key + (closeOnAsked ? 1 : -1), `Counts the points ${more ? "below" : "above"} the line and misplaces the point closest to it.`],
      ], {
        stimulus: null,
        figure,
        stem: `The scatterplot shows ${scene.about(n)}. A line of best fit for the data, y = ${S.lin(m, B)}, is also shown. ${scene.ask(more)}`,
        explanation:
          `The line of best fit gives the predicted value at each x, and each point gives an actual value. An actual value is ` +
          `${more ? "greater" : "less"} than predicted when its point lies ${side} the line; ${key} of the ${n} points do.`,
        steps: [
          `An actual value ${more ? "greater" : "less"} than predicted is a point ${side} the line of best fit.`,
          `Count the points ${side} the line, including the one close to it at x = ${closeX}: ${key}.`,
        ],
        principles: [
          "A point on a scatterplot shows an actual value; the line of best fit shows the predicted value for each x.",
          "A point above the line has an actual value greater than predicted; a point below it, less than predicted.",
        ],
        trap: `Counting the points ${more ? "below" : "above"} the line answers the opposite question, ${n - key}.`,
        hint: "Where is a point whose actual value is greater than predicted, compared with the line?",
        estimatedSeconds: 60,
        verify: () => {
          const { points: seen, line } = readScatter(figure.svg, xMax, yMax);
          if (!line || seen.length !== n) return false;
          return seen.filter(([x, y]) => (more ? y > line(x) : y < line(x))).length === key;
        },
      }, { show: num, places: 0 });
    });
  }

  const shapeAndCount = {
    id: "scatterplot-shape-and-count",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "scatterplots",
    difficulty: "Easy",
    title: "Describing a scatterplot's pattern and its points about a fitted line",
    recognize:
      "Direction is whether the points rise or fall from left to right; a linear pattern changes by about the same amount " +
      "per step and an exponential one bends. A point above the line of best fit is greater than predicted.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "wrong-quantity"],
    build(t) {
      if (t.chance(0.35)) return patternItem(t);
      return countItem(t, t.chance(0.5));
    },
  };

  /* ================================== two-group-fit-lines (Medium) */

  const GROUP_SCENES = [
    {
      sign: 1, xSteps: [1], ySteps: [5, 10], startCells: [1, 5], names: ["Variety A", "Variety B"], lower: ["variety A", "variety B"],
      xTitle: "Weeks after planting", yTitle: "Height (centimeters)",
      about: "the heights, in centimeters, of plants of two tomato varieties, A and B, at different numbers of weeks after planting",
      define: "where y is the predicted height, in centimeters, of a plant x weeks after planting",
      diff: (x, hi, lo) => `Based on the lines of best fit, how much greater, in centimeters, is the predicted height of a ${hi} plant than that of a ${lo} plant ${x} weeks after planting?`,
      start: (g) => `${g} has the greater predicted height at planting`,
      rate: (g) => `${g} has the greater predicted growth per week`,
      cross: "Based on the lines of best fit, how many weeks after planting would plants of the two varieties have the same predicted height?",
    },
    {
      sign: -1, xSteps: [1, 2], ySteps: [2, 3], startCells: [6, 11], names: ["Model P", "Model Q"], lower: ["model P", "model Q"],
      xTitle: "Age (years)", yTitle: "Value (thousands of dollars)",
      about: "the ages, in years, and the values, in thousands of dollars, of used cars of two models, P and Q",
      define: "where y is the predicted value, in thousands of dollars, of a car that is x years old",
      diff: (x, hi, lo) => `Based on the lines of best fit, how much greater, in thousands of dollars, is the predicted value of a ${hi} car than that of a ${lo} car when both are ${x} years old?`,
      start: (g) => `${g} has the greater predicted value when new`,
      rate: (g) => `${g} has the greater predicted loss in value per year`,
      cross: "Based on the lines of best fit, at what age, in years, would cars of the two models have the same predicted value?",
    },
    {
      sign: 1, xSteps: [1, 2], ySteps: [10, 20], startCells: [1, 6], names: ["Store J", "Store K"], lower: ["store J", "store K"],
      xTitle: "Weeks since opening", yTitle: "Weekly orders",
      about: "the numbers of online orders two new stores, J and K, received each week, by the number of weeks since each store opened",
      define: "where y is the predicted number of orders in the week that is x weeks after the store opened",
      diff: (x, hi, lo) => `Based on the lines of best fit, how many more orders are predicted for ${hi} than for ${lo} ${x} weeks after opening?`,
      start: (g) => `${g} has the greater predicted number of orders at opening`,
      rate: (g) => `${g} has the greater predicted increase in orders per week`,
      cross: "Based on the lines of best fit, how many weeks after opening would the two stores have the same predicted number of orders?",
    },
    {
      sign: -1, xSteps: [2, 5], ySteps: [1, 2], startCells: [5, 11], names: ["Lake R", "Lake S"], lower: ["lake R", "lake S"],
      xTitle: "Days since the dry spell began", yTitle: "Water depth (feet)",
      about: "the water depths, in feet, of two lakes, R and S, on different days during a dry spell",
      define: "where y is the predicted water depth, in feet, x days after the dry spell began",
      diff: (x, hi, lo) => `Based on the lines of best fit, how much greater, in feet, is the predicted water depth of ${hi} than that of ${lo} ${x} days after the dry spell began?`,
      start: (g) => `${g} has the greater predicted depth when the dry spell began`,
      rate: (g) => `${g} has the greater predicted drop in depth per day`,
      cross: "Based on the lines of best fit, how many days after the dry spell began would the two lakes have the same predicted depth?",
    },
  ];

  const HOLLOW_RADIUS = 4.5;

  // Scatterplot of two groups: filled points with a solid line of best fit,
  // hollow points with a dashed one, and a legend above the grid.
  function twoGroupPlot({ xMax, xStep, yMax, yStep, groups, xTitle, yTitle, alt }) {
    const box = { left: 66, right: 382, top: 44, bottom: 260 };
    const px = (x) => box.left + (x / xMax) * (box.right - box.left);
    const py = (y) => box.bottom - (y / yMax) * (box.bottom - box.top);
    const parts = [];
    for (let i = 0; i <= Math.round(xMax / xStep); i += 1) {
      const x = px(i * xStep);
      if (i > 0) parts.push(gridLine([x, box.top], [x, box.bottom]));
      parts.push(chartText(x, box.bottom + 14, num(tidy(i * xStep)), "middle", 12));
    }
    for (let j = 0; j <= Math.round(yMax / yStep); j += 1) {
      const y = py(j * yStep);
      if (j > 0) parts.push(gridLine([box.left, y], [box.right, y]));
      parts.push(chartText(box.left - 7, y, num(tidy(j * yStep)), "end", 12));
    }
    parts.push(seg([box.left, box.bottom], [box.right, box.bottom], 1.5), seg([box.left, box.bottom], [box.left, box.top], 1.5));
    groups.forEach(({ points, fit, name }, index) => {
      const hollow = index === 1;
      points.forEach(([x, y]) => parts.push(hollow
        ? `<circle cx="${r1(px(x))}" cy="${r1(py(y))}" r="${HOLLOW_RADIUS}" fill="none" stroke="currentColor" stroke-width="1.5"/>`
        : dataDot(px(x), py(y), SCATTER_RADIUS)));
      const [m, b] = fit;
      const edges = m === 0 ? [0, xMax] : [(0 - b) / m, (yMax - b) / m];
      const x0 = Math.max(0, Math.min(...edges));
      const x1 = Math.min(xMax, Math.max(...edges));
      parts.push(seg([px(x0), py(m * x0 + b)], [px(x1), py(m * x1 + b)], 2, hollow));
      const lx = 96 + index * 150;
      parts.push(hollow
        ? `<circle cx="${lx}" cy="18" r="${HOLLOW_RADIUS}" fill="none" stroke="currentColor" stroke-width="1.5"/>`
        : dataDot(lx, 18, SCATTER_RADIUS));
      parts.push(seg([lx + 10, 18], [lx + 36, 18], 2, hollow));
      parts.push(chartText(lx + 44, 18, name, "start", 13));
    });
    parts.push(chartText((box.left + box.right) / 2, 298, xTitle, "middle", 13));
    parts.push(chartText(17, (box.top + box.bottom) / 2, yTitle, "middle", 13, -90));
    return { svg: S.svg(400, 314, parts, alt), alt, notToScale: false, box };
  }

  // Reads the two lines of best fit back from a two-group plot: the long
  // solid line and the long dashed line, in data units.
  function readTwoLines(figure, xMax, yMax) {
    const { left, right, top, bottom } = figure.box;
    const dx = (cx) => ((cx - left) / (right - left)) * xMax;
    const dy = (cy) => ((bottom - cy) / (bottom - top)) * yMax;
    const lines = {};
    (figure.svg.match(/<line [^>]*\/>/g) || []).forEach((tag) => {
      const match = /x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke="currentColor" stroke-width="2"/.exec(tag);
      if (!match) return;
      const [x1, y1, x2, y2] = match.slice(1, 5).map(Number);
      if (Math.abs(x2 - x1) < 60) return;
      const slope = (dy(y2) - dy(y1)) / (dx(x2) - dx(x1));
      lines[tag.includes("stroke-dasharray") ? "dashed" : "solid"] = { slope, intercept: dy(y1) - slope * dx(x1) };
    });
    return [lines.solid, lines.dashed];
  }

  // "y = 2.5x + 10" back to [slope, intercept].
  function parseLine(text) {
    const match = /y = (−?[\d.]*)x(?: ([+−]) ([\d.]+))?/.exec(text);
    if (!match) return null;
    const slope = match[1] === "" ? 1 : match[1] === MINUS ? -1 : Number(match[1].replace(MINUS, "-"));
    const intercept = match[2] ? (match[2] === "+" ? 1 : -1) * Number(match[3]) : 0;
    return [slope, intercept];
  }

  function groupLinesItem(t, form, numeric) {
    const scene = t.pick(GROUP_SCENES);
    return retry(() => {
      const xStep = t.pick(scene.xSteps);
      const yStep = t.pick(scene.ySteps);
      const slopesCells = t.sample([0.25, 0.5, 0.75, 1, 1.25], 2).map((q) => scene.sign * q);
      // The "cross" form builds the lines through a shared gridline point.
      const crossCells = t.int(2, 6);
      const crossLevel = t.int(2, 10);
      const starts = form === "cross"
        ? slopesCells.map((q) => crossLevel - q * crossCells)
        : t.sample(range(scene.startCells[0], scene.startCells[1]), 2);
      if (starts.some((b) => !Number.isInteger(b) || b < 1 || b > Y_CELLS - 1)) return null;
      if (Math.abs(starts[0] - starts[1]) < 2) return null;
      const ends = starts.map((b, index) => b + slopesCells[index] * X_CELLS);
      if (ends.some((end) => end < 0.5 || end > Y_CELLS - 0.5)) return null;
      const fits = slopesCells.map((q, index) => [tidy((q * yStep) / xStep), starts[index] * yStep]);
      if (fits.some(([m]) => !isClean(m, 2))) return null;
      const xMax = X_CELLS * xStep;
      const yMax = Y_CELLS * yStep;
      const predict = (g, x) => tidy(fits[g][0] * x + fits[g][1]);
      const equations = fits.map(([m, b]) => `y = ${S.lin(m, b)}`);
      const lineSentence =
        `The line of best fit for ${scene.lower[0]} is ${equations[0]}, and the line of best fit for ${scene.lower[1]} is ` +
        `${equations[1]}, ${scene.define}.`;
      const withFigure = form === "compare" ? t.chance(0.7) : t.chance(0.5);
      let figure = null;
      if (withFigure) {
        const groups = [0, 1].map((g) => {
          const slots = t.sample(range(1, 2 * X_CELLS - 1).map((index) => index / 2), 7);
          const points = slots.map((x, index) => {
            const offset = (index % 2 ? 1 : -1) * (0.25 + t.random() * 0.9);
            const y = Math.max(0.3, Math.min(Y_CELLS - 0.3, starts[g] + slopesCells[g] * x + offset));
            return [x * xStep, y * yStep];
          });
          return { points, fit: fits[g], name: scene.names[g] };
        });
        const alt =
          `Scatterplot with ${inSentence(scene.xTitle)} on the horizontal axis, 0 to ${xMax}, and ${inSentence(scene.yTitle)} ` +
          `on the vertical axis, 0 to ${yMax}. ${scene.names[0]} points are filled, with a solid line of best fit from ` +
          `(0, ${fits[0][1]}) to (${xMax}, ${num(predict(0, xMax))}). ${scene.names[1]} points are hollow, with a dashed line ` +
          `of best fit from (0, ${fits[1][1]}) to (${xMax}, ${num(predict(1, xMax))}).`;
        figure = twoGroupPlot({ xMax, xStep, yMax, yStep, groups, xTitle: scene.xTitle, yTitle: scene.yTitle, alt });
      }
      // The two lines, as the student can recover them: from the drawing, or
      // from the equations in the stem.
      const recovered = (stem) => {
        if (figure) {
          const [solid, dashed] = readTwoLines(figure, xMax, yMax);
          return solid && dashed ? [[solid.slope, solid.intercept], [dashed.slope, dashed.intercept]] : null;
        }
        const found = stem.match(/y = [^,]+/g);
        return found && found.length === 2 ? found.map(parseLine) : null;
      };
      const intro = figure
        ? `The scatterplot shows ${scene.about}, and a line of best fit for each group.`
        : `A researcher recorded ${scene.about}.`;
      const principles = [
        "The y-intercept of a line of best fit is the predicted value at x = 0; its slope is the predicted change for each increase of 1 in x.",
        "To compare two predictions at the same x, evaluate each line there and subtract.",
      ];
      const common = { stimulus: null, figure, principles, estimatedSeconds: 90 };

      if (form === "compare") {
        const startHi = fits[0][1] > fits[1][1] ? 0 : 1;
        const rateHi = Math.abs(fits[0][0]) > Math.abs(fits[1][0]) ? 0 : 1;
        const say = (s, r) => `${scene.start(scene.names[s])}, and ${scene.rate(scene.lower[r])}.`;
        const keyText = say(startHi, rateHi);
        const stem = `${intro}${figure ? "" : ` ${lineSentence}`} Which of the following statements is true?`;
        return {
          ...common,
          responseType: "multiple-choice",
          stem,
          correct: keyText,
          wrong: [
            [say(1 - startHi, rateHi), `Reverses the comparison at x = 0: the line for ${scene.lower[startHi]} starts higher.`],
            [say(startHi, 1 - rateHi), `Reverses the comparison of the rates: the line for ${scene.lower[rateHi]} is steeper${scene.sign < 0 ? ", so it falls faster" : ""}.`],
            [say(1 - startHi, 1 - rateHi), "Reverses both comparisons, reading each line as the other."],
          ],
          explanation:
            `At x = 0 the predicted values are ${fits[0][1]} for ${scene.lower[0]} and ${fits[1][1]} for ${scene.lower[1]}; the slopes are ` +
            `${num(fits[0][0])} and ${num(fits[1][0])}. So ${keyText.charAt(0).toLowerCase()}${keyText.slice(1)}`,
          steps: [
            `Starting values (y-intercepts): ${scene.lower[0]}, ${fits[0][1]}; ${scene.lower[1]}, ${fits[1][1]}.`,
            `Rates (slopes): ${scene.lower[0]}, ${num(fits[0][0])} per unit of x; ${scene.lower[1]}, ${num(fits[1][0])}.`,
            `The greater start belongs to ${scene.lower[startHi]} and the ${scene.sign < 0 ? "steeper fall" : "greater rate"} to ${scene.lower[rateHi]}.`,
          ],
          trap: "The line that starts higher is not necessarily the one that changes faster; compare the intercepts and the slopes separately.",
          hint: "Where does each line cross the y-axis, and which line is steeper?",
          verify: () => {
            const lines = recovered(stem);
            if (!lines || lines.some((line) => !line)) return false;
            const s = lines[0][1] > lines[1][1] ? 0 : 1;
            const r = Math.abs(lines[0][0]) > Math.abs(lines[1][0]) ? 0 : 1;
            return keyText === say(s, r);
          },
        };
      }

      if (form === "cross") {
        const X = crossCells * xStep;
        const level = tidy(crossLevel * yStep);
        const gapStart = Math.abs(fits[0][1] - fits[1][1]);
        const slopeGap = Math.abs(fits[0][0] - fits[1][0]);
        const stem = `${intro}${figure ? "" : ` ${lineSentence}`} ${scene.cross}`;
        return packRanked(t, numeric, X, [
          [gapStart, "Gives the difference between the starting values instead of where the lines meet."],
          [xStep !== 1 ? crossCells : NaN, `Counts ${crossCells} gridlines across without using the horizontal scale, ${xStep} per gridline.`],
          [level, `Gives the shared predicted value, ${num(level)}, instead of the value of x where it occurs.`],
          [gapStart / (Math.abs(fits[0][0]) + Math.abs(fits[1][0])), "Adds the two slopes instead of subtracting them when solving for the crossing."],
          [X + xStep, "Reads the crossing one gridline too far to the right."],
          [X - xStep, "Reads the crossing one gridline too far to the left."],
        ], {
          ...common,
          stem,
          explanation:
            `The predictions are equal where ${S.lin(fits[0][0], fits[0][1])} = ${S.lin(fits[1][0], fits[1][1])}. The starting values differ by ` +
            `${num(gapStart)} and the slopes by ${num(slopeGap)}, so the lines meet at x = ${num(gapStart)} ÷ ${num(slopeGap)} = ${num(X)}, where both predict ${num(level)}.`,
          steps: [
            `Set the two predictions equal: ${S.lin(fits[0][0], fits[0][1])} = ${S.lin(fits[1][0], fits[1][1])}.`,
            `Collect terms: ${num(slopeGap)}x = ${num(gapStart)}.`,
            `x = ${num(X)}; both lines predict ${num(level)} there.`,
          ],
          trap: `The shared value, ${num(level)}, is a step on the way; the question asks when it happens.`,
          hint: "Where do the two lines meet?",
          verify: () => {
            const lines = recovered(stem);
            if (!lines || lines.some((line) => !line)) return false;
            const x = (lines[1][1] - lines[0][1]) / (lines[0][0] - lines[1][0]);
            return close(x, X, 0.01);
          },
        }, { places: 2 });
      }

      const cells = range(1, X_CELLS - 1).filter((c) => Math.abs(predict(0, c * xStep) - predict(1, c * xStep)) >= yStep);
      if (!cells.length) return null;
      const X = t.pick(cells) * xStep;
      const hi = predict(0, X) > predict(1, X) ? 0 : 1;
      const lo = 1 - hi;
      const key = tidy(predict(hi, X) - predict(lo, X));
      const stem = `${intro} ${lineSentence} ${scene.diff(X, scene.lower[hi], scene.lower[lo])}`;
      return packRanked(t, numeric, key, [
        [predict(hi, X), `Gives the predicted value for ${scene.lower[hi]} alone, ${num(predict(hi, X))}, which is a step on the way.`],
        [Math.abs(fits[0][0] - fits[1][0]) * X, "Multiplies the difference in slopes by x but leaves out the difference in the starting values."],
        [Math.abs(fits[0][1] - fits[1][1]), "Gives the difference between the predictions at x = 0 instead of at the given x."],
        [predict(lo, X), `Gives the predicted value for ${scene.lower[lo]} alone.`],
        [tidy(predict(hi, X + xStep) - predict(lo, X + xStep)), `Compares the predictions one gridline past x = ${X}.`],
        [tidy(predict(hi, X - xStep) - predict(lo, X - xStep)), `Compares the predictions one gridline before x = ${X}.`],
      ], {
        ...common,
        stem,
        explanation:
          `At x = ${X}: ${scene.lower[hi]} is predicted at ${num(fits[hi][0])}(${X}) ${S.signed(fits[hi][1])} = ${num(predict(hi, X))} and ` +
          `${scene.lower[lo]} at ${num(fits[lo][0])}(${X}) ${S.signed(fits[lo][1])} = ${num(predict(lo, X))}. The difference is ${fmt(key)}.`,
        steps: [
          `${scene.names[hi]}: ${num(fits[hi][0])}(${X}) ${S.signed(fits[hi][1])} = ${num(predict(hi, X))}.`,
          `${scene.names[lo]}: ${num(fits[lo][0])}(${X}) ${S.signed(fits[lo][1])} = ${num(predict(lo, X))}.`,
          `Difference: ${num(predict(hi, X))} ${MINUS} ${num(predict(lo, X))} = ${fmt(key)}.`,
        ],
        trap: `Each prediction, ${num(predict(hi, X))} or ${num(predict(lo, X))}, is only a step; the question asks for their difference.`,
        hint: "What does each line predict at that value of x?",
        verify: () => {
          const lines = recovered(stem);
          if (!lines || lines.some((line) => !line)) return false;
          const at = (line) => line[0] * X + line[1];
          return close(at(lines[hi]) - at(lines[lo]), key, 0.01);
        },
      });
    });
  }

  const twoGroupLines = {
    id: "two-group-fit-lines",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "linear models",
    difficulty: "Medium",
    title: "Comparing the lines of best fit of two groups",
    recognize:
      "Each group has its own line: its y-intercept is the predicted value at x = 0 and its slope the predicted change per unit. " +
      "Compare intercepts and slopes separately; to compare predictions, evaluate both lines at the same x and subtract.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity", "reversed-condition"],
    build(t) {
      const form = t.pick(["compare", "difference", "difference", "cross", "cross"]);
      return groupLinesItem(t, form, form !== "compare" && t.chance(0.45));
    },
  };

  /* ================================ uneven-table-growth (Medium) */

  const GROWTH_SCENES = [
    {
      xHead: "Month", yHead: "Subscribers", up: true, unit: "month", amount: "subscribers", whole: true,
      about: "the number of subscribers to an online newsletter at the end of selected months after it was launched",
      noun: "number of subscribers", at: (x) => `at the end of month ${x}`,
    },
    {
      xHead: "Week", yHead: "Infected trees", up: true, unit: "week", amount: "trees", whole: true,
      about: "the number of trees in a forest infected by a beetle at the end of selected weeks after the beetle was first found",
      noun: "number of infected trees", at: (x) => `at the end of week ${x}`,
    },
    {
      xHead: "Year", yHead: "Value (dollars)", up: false, unit: "year", amount: "dollars", scale: 100,
      about: "the value, in dollars, of a machine at the end of selected years after it was purchased",
      noun: "value of the machine", at: (x) => `at the end of year ${x}`,
    },
    {
      xHead: "Month", yHead: "Active users", up: null, unit: "month", amount: "users", whole: true,
      about: "the number of active users of a mobile game at the end of selected months after its release",
      noun: "number of active users", at: (x) => `at the end of month ${x}`,
    },
    {
      xHead: "Hour", yHead: "Water (gallons)", up: false, unit: "hour", amount: "gallons",
      about: "the amount of water, in gallons, in a tank at the end of selected hours after it began to drain",
      noun: "amount of water in the tank", at: (x) => `at the end of hour ${x}`,
    },
  ];

  // Uneven steps: every set has a gap of 1 and a gap of at least 2.
  const X_SETS = [[0, 1, 3, 4, 6], [1, 2, 4, 5], [0, 2, 3, 5, 6], [1, 3, 4, 6], [0, 1, 2, 4, 6], [2, 3, 5, 6], [0, 3, 4, 6]];

  // Per-unit factors whose powers up to 6 stay whole for the listed starts.
  const FACTORS = [
    { b: 1.5, starts: [64, 128] }, { b: 2, starts: [3, 5, 6, 7] }, { b: 1.25, starts: [4096] }, { b: 1.2, starts: [15625] },
    { b: 0.5, starts: [64, 128, 192] }, { b: 0.75, starts: [4096] }, { b: 0.8, starts: [15625] }, { b: 0.6, starts: [15625] },
  ];

  const percentText = (value) => `${num(tidy(value))}%`;

  function unevenTableItem(t, form, numeric) {
    const scene = t.pick(GROWTH_SCENES);
    return retry(() => {
      const xs = t.pick(X_SETS);
      const exponential = t.chance(0.5);
      const up = scene.up === null ? t.chance(0.5) : scene.up;
      let f;
      let rate;
      if (exponential) {
        const choice = t.pick(FACTORS.filter((entry) => (entry.b > 1) === up));
        const a = t.pick(choice.starts) * (scene.scale || 1);
        rate = choice.b;
        f = (x) => tidy(a * choice.b ** x);
      } else {
        const oneGap = xs.findIndex((x, index) => xs[index + 1] === x + 1);
        const anchor = t.pick([20, 25, 40, 50, 80, 100, 125, 160, 200, 250, 400, 500]) * (scene.scale || 1);
        // A change of 5% to 25% of the value at the one-unit step, so the table visibly moves.
        const m = (up ? 1 : -1) * anchor * t.pick([0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25]);
        if (!Number.isInteger(m)) return null;
        const c = anchor - m * xs[oneGap];
        rate = m;
        f = (x) => c + m * x;
      }
      const ys = xs.map(f);
      if (ys.some((y) => y <= 0 || !Number.isInteger(y))) return null;
      const content = S.table([scene.xHead, scene.yHead], xs.map((x, index) => [x, fmt(ys[index])]));
      const verb = up ? "increased" : "decreased";
      const gapIndex = xs.findIndex((x, index) => index < xs.length - 1 && xs[index + 1] - x >= 2);
      const g = xs[gapIndex + 1] - xs[gapIndex];
      const oneIndex = xs.findIndex((x, index) => xs[index + 1] === x + 1);
      const firstStep = ys[oneIndex + 1] - ys[oneIndex];
      const gapChange = ys[gapIndex + 1] - ys[gapIndex];
      const gapRatio = ys[gapIndex + 1] / ys[gapIndex];
      const intro = `The table shows ${scene.about}.`;
      const principles = [
        "A linear pattern changes by the same amount for each increase of 1 in x; an exponential pattern changes by the same percent.",
        "When the x-values in a table are unevenly spaced, compare changes per unit of x, not changes from row to row.",
      ];
      const common = { stimulus: { type: "table", content }, figure: null, principles, estimatedSeconds: 120 };
      const recoverModel = () => {
        const rows = parseTable(content).slice(1).map((row) => row.map(parseNumber));
        const slopes = rows.slice(1).map(([x, y], index) => (y - rows[index][1]) / (x - rows[index][0]));
        if (slopes.every((s) => close(s, slopes[0]))) return { linear: true, per: slopes[0], at: (x) => rows[0][1] + slopes[0] * (x - rows[0][0]) };
        const factors = rows.slice(1).map(([x, y], index) => (y / rows[index][1]) ** (1 / (x - rows[index][0])));
        if (factors.every((r) => close(r, factors[0]))) return { linear: false, per: factors[0], at: (x) => rows[0][1] * factors[0] ** (x - rows[0][0]) };
        return null;
      };
      const pctOf = (factor) => Math.abs(factor - 1) * 100;

      if (form === "describe") {
        const say = (amount) => `It ${verb} by ${amount} each ${scene.unit}.`;
        const amountText = (value) => (isClean(Math.abs(value), scene.whole ? 0 : 2) ? say(`${fmt(Math.abs(value))} ${scene.amount}`) : null);
        const pctTextOf = (value) => (isClean(value, 2) ? say(percentText(value)) : null);
        const keyText = exponential ? say(percentText(pctOf(rate))) : amountText(rate);
        const candidates = exponential
          ? [
            [pctTextOf(pctOf(gapRatio)), `Treats the change from ${scene.unit} ${xs[gapIndex]} to ${scene.unit} ${xs[gapIndex + 1]}, ${g} ${scene.unit}s apart, as the change for one ${scene.unit}.`],
            [amountText(firstStep), `Gives the change from ${scene.unit} ${xs[oneIndex]} to ${scene.unit} ${xs[oneIndex + 1]} as a constant amount; the amounts change from row to row, but the percent does not.`],
            [pctTextOf(pctOf(gapRatio) / g), `Divides the percent change over ${g} ${scene.unit}s by ${g}; percent changes compound, so they cannot be split evenly.`],
            [amountText(gapChange / g), "Treats the pattern as linear, using the change per unit across one gap."],
          ]
          : [
            [amountText(gapChange), `Treats the change from ${scene.unit} ${xs[gapIndex]} to ${scene.unit} ${xs[gapIndex + 1]}, ${g} ${scene.unit}s apart, as the change for one ${scene.unit}.`],
            [pctTextOf(Math.abs(firstStep / ys[oneIndex]) * 100), `Turns the change from ${scene.unit} ${xs[oneIndex]} to ${scene.unit} ${xs[oneIndex + 1]} into a percent; the amounts grow with the gaps between rows, but the change per ${scene.unit} is constant.`],
            [amountText((ys[ys.length - 1] - ys[0]) / (ys.length - 1)), "Averages the changes from row to row without dividing by the number of units between rows."],
            [amountText(2 * rate), `Doubles the change per ${scene.unit}.`],
          ];
        if (!keyText) return null;
        const wrong = offerHard(keyText, candidates);
        if (wrong.length < 3) return null;
        const perText = exponential ? `multiplies by ${fmt(rate)}` : `changes by ${fmt(rate)}`;
        return {
          ...common,
          responseType: "multiple-choice",
          stem: `${intro} Which of the following best describes how the ${scene.noun} changed from ${scene.unit} ${xs[0]} to ${scene.unit} ${xs[xs.length - 1]}?`,
          correct: keyText,
          wrong,
          explanation:
            `The rows are not evenly spaced, so compare changes per ${scene.unit}. ` +
            (exponential
              ? `From ${scene.unit} ${xs[oneIndex]} to ${xs[oneIndex + 1]} the value is multiplied by ${fmt(rate)}, and across the ${g}-${scene.unit} gap by ${num(tidy(gapRatio))} = ${fmt(rate)}${S.sup(g)}. The value ${perText} each ${scene.unit}: ${keyText.charAt(0).toLowerCase()}${keyText.slice(1)}`
              : `From ${scene.unit} ${xs[oneIndex]} to ${xs[oneIndex + 1]} the value changes by ${fmt(firstStep)}, and across the ${g}-${scene.unit} gap by ${fmt(gapChange)} = ${g} × ${fmt(rate)}. The change per ${scene.unit} is the same, so ${keyText.charAt(0).toLowerCase()}${keyText.slice(1)}`),
          steps: [
            `Note the gaps between rows: ${xs.slice(1).map((x, index) => x - xs[index]).join(", ")} ${scene.unit}s.`,
            exponential
              ? `Change per ${scene.unit} as a factor: ${fmt(ys[oneIndex + 1])} ÷ ${fmt(ys[oneIndex])} = ${fmt(rate)}, and ${fmt(ys[gapIndex + 1])} ÷ ${fmt(ys[gapIndex])} = ${num(tidy(gapRatio))} = ${fmt(rate)}${S.sup(g)}.`
              : `Change per ${scene.unit} as an amount: ${fmt(firstStep)} ÷ 1 = ${fmt(rate)}, and ${fmt(gapChange)} ÷ ${g} = ${fmt(rate)}.`,
            exponential
              ? `A constant factor of ${fmt(rate)} is a ${percentText(pctOf(rate))} ${up ? "increase" : "decrease"} each ${scene.unit}.`
              : `A constant amount each ${scene.unit} is linear change of ${fmt(Math.abs(rate))} ${scene.amount} each ${scene.unit}.`,
          ],
          trap: exponential
            ? `The ratio across a ${g}-${scene.unit} gap is ${num(tidy(gapRatio))}, which covers ${g} ${scene.unit}s of compounding, not one.`
            : "The row-to-row differences are unequal only because the rows are unevenly spaced; per unit, they are equal.",
          hint: `How many ${scene.unit}s apart are the rows, and what happens in each single ${scene.unit}?`,
          verify: () => {
            const model = recoverModel();
            if (!model || model.linear === exponential) return false;
            const expected = model.linear
              ? say(`${fmt(Math.abs(model.per))} ${scene.amount}`)
              : say(percentText(Math.round(pctOf(model.per) * 1e6) / 1e6));
            return expected === keyText && (model.per > (model.linear ? 0 : 1)) === up && wrong.every(([text]) => text !== expected);
          },
        };
      }

      // Counts of people or things are whole; money and volume may not be.
      const shown = (value) => C.shown(value, scene.whole ? 0 : 2);
      // A mistake's result as a student would write it: rounded to a whole
      // count, or to hundredths for money and volume.
      const roundedShow = (value) => fmt(Math.round(value * (scene.whole ? 1 : 100)) / (scene.whole ? 1 : 100));
      const either = `The ${scene.noun} changed either by the same amount each ${scene.unit} or by the same percent each ${scene.unit}.`;
      const verify = (X, key) => () => {
        const model = recoverModel();
        return Boolean(model) && model.linear !== exponential && close(model.at(X), key, 1e-6);
      };

      if (exponential) {
        // A value inside a gap, where filling the gap evenly is the reflex.
        const gaps = xs.slice(0, -1).map((x, index) => [x, xs[index + 1], index]).filter(([x0, x1]) => x1 - x0 >= 2);
        const [xl, xr, li] = t.pick(gaps);
        const X = t.int(xl + 1, xr - 1);
        const d = X - xl;
        const gap = xr - xl;
        const key = f(X);
        const yl = ys[li];
        const yr = ys[li + 1];
        const even = tidy(yl + ((yr - yl) * d) / gap);
        return packRanked(t, numeric, key, [
          [even, `Assumes the ${scene.noun} changed by the same amount each ${scene.unit} between ${scene.unit}s ${xl} and ${xr}.`],
          [yl * (1 + (yr / yl - 1) / gap) ** d, `Splits the percent change from ${scene.unit} ${xl} to ${scene.unit} ${xr} evenly over the ${gap} ${scene.unit}s; percent changes compound.`],
          [yl * (yr / yl) ** d, `Applies the whole change from ${scene.unit} ${xl} to ${scene.unit} ${xr} to each ${scene.unit}.`],
          [yl + firstStep * d, `Adds the change from ${scene.unit} ${xs[oneIndex]} to ${scene.unit} ${xs[oneIndex + 1]} each ${scene.unit}, as if the change were a constant amount.`],
          [f(X + 1), `Counts one ${scene.unit} too many past ${scene.unit} ${xl}.`],
          [f(X - 1), `Counts one ${scene.unit} too few past ${scene.unit} ${xl}.`],
          [yr * rate ** d, `Starts from ${scene.unit} ${xr} instead of ${scene.unit} ${xl}, applying the factor forward.`],
          [yl / rate ** d, `Divides by the factor for each ${scene.unit} instead of multiplying.`],
        ], {
          ...common,
          stem: `${intro} ${either} What was the ${scene.noun} ${scene.at(X)}?`,
          explanation:
            `A one-${scene.unit} step multiplies the value by ${fmt(rate)} (${fmt(ys[oneIndex + 1])} ÷ ${fmt(ys[oneIndex])}), and the ` +
            `${gap}-${scene.unit} gap multiplies it by ${num(tidy(yr / yl))} = ${fmt(rate)}${S.sup(gap)}, so the change is by the same percent each ` +
            `${scene.unit}. ${scene.at(X).charAt(0).toUpperCase()}${scene.at(X).slice(1)}, the value is ${fmt(yl)} × ${fmt(rate)}${d > 1 ? S.sup(d) : ""} = ${fmt(key)}.`,
          steps: [
            `Compare a one-${scene.unit} step with the ${gap}-${scene.unit} gap: factors ${fmt(rate)} and ${num(tidy(yr / yl))} = ${fmt(rate)}${S.sup(gap)}.`,
            `So the ${scene.noun} is multiplied by ${fmt(rate)} each ${scene.unit}.`,
            `${scene.at(X).charAt(0).toUpperCase()}${scene.at(X).slice(1)}: ${fmt(yl)} × ${fmt(rate)}${d > 1 ? S.sup(d) : ""} = ${fmt(key)}.`,
          ],
          trap: `Filling the gap by equal amounts gives ${fmt(even)}; the change is by equal factors.`,
          hint: `How many ${scene.unit}s apart are the rows, and what happens in one ${scene.unit}?`,
          verify: verify(X, key),
        }, { places: 9, show: roundedShow });
      }

      // Linear: a value past the table, where the last row-to-row change misleads.
      const last = xs[xs.length - 1];
      const ahead = t.int(1, 2);
      const X = last + ahead;
      const key = f(X);
      // A quantity that cannot go below zero (a count, a value, a volume)
      // must still be positive where the question asks about it.
      if (!(key > 0) || key < 0.2 * ys[0]) return null;
      const yLast = ys[ys.length - 1];
      const lastGap = last - xs[xs.length - 2];
      const lastChange = yLast - ys[ys.length - 2];
      const rowAverage = (yLast - ys[0]) / (ys.length - 1);
      return packRanked(t, numeric, key, [
        [yLast + (lastGap > 1 ? lastChange : gapChange) * ahead, `Treats a change between rows ${lastGap > 1 ? lastGap : g} ${scene.unit}s apart as the change for one ${scene.unit}.`],
        [yLast * (ys[oneIndex + 1] / ys[oneIndex]) ** ahead, `Assumes the ${scene.noun} changed by the same percent each ${scene.unit}, using the change from ${scene.unit} ${xs[oneIndex]} to ${scene.unit} ${xs[oneIndex + 1]}.`],
        [yLast + rowAverage * ahead, "Averages the changes from row to row without dividing by the number of units between rows."],
        [yLast + rate * (ahead + 1), `Counts one ${scene.unit} too many past ${scene.unit} ${last}.`],
        [yLast + rate * (ahead - 1), `Counts one ${scene.unit} too few past ${scene.unit} ${last}.`],
        [yLast - rate * ahead, "Changes the value in the wrong direction."],
        [yLast + 2 * rate * ahead, `Doubles the change per ${scene.unit}.`],
        [yLast + (rate * ahead) / g, `Divides the change per ${scene.unit} by ${g}, the width of the widest gap.`],
      ], {
        ...common,
        stem: `${intro} ${either} If the ${scene.noun} continues to change in the same way, what will it be ${scene.at(X)}?`,
        explanation:
          `A one-${scene.unit} step changes the value by ${fmt(firstStep)}, and the ${g}-${scene.unit} gap changes it by ${fmt(gapChange)} = ` +
          `${g} × ${fmt(rate)}, so the change is the same amount, ${fmt(rate)}, each ${scene.unit}. ${scene.at(X).charAt(0).toUpperCase()}${scene.at(X).slice(1)}, ` +
          `the value is ${fmt(yLast)} ${signedGrouped(rate * ahead)} = ${fmt(key)}.`,
        steps: [
          `Compare a one-${scene.unit} step with the ${g}-${scene.unit} gap: changes ${fmt(firstStep)} and ${fmt(gapChange)} = ${g} × ${fmt(rate)}.`,
          `So the ${scene.noun} changes by ${fmt(rate)} each ${scene.unit}.`,
          `${scene.at(X).charAt(0).toUpperCase()}${scene.at(X).slice(1)}: ${fmt(yLast)} ${signedGrouped(rate * ahead)} = ${fmt(key)}.`,
        ],
        trap: `The row-to-row changes differ only because the rows are unevenly spaced; per ${scene.unit}, the change is always ${fmt(rate)}.`,
        hint: `How many ${scene.unit}s apart are the rows, and what happens in one ${scene.unit}?`,
        verify: verify(X, key),
      }, { places: 9, show: roundedShow });
    });
  }

  const unevenTable = {
    id: "uneven-table-growth",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "linear models",
    difficulty: "Medium",
    title: "Linear or exponential change from unevenly spaced data",
    recognize:
      "The rows are unevenly spaced, so row-to-row changes mislead: divide each change by its gap (linear) or take the gap-th root " +
      "of each ratio (exponential), and whichever is constant per unit identifies the model.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "wrong-quantity"],
    build(t) {
      const form = t.chance(0.5) ? "describe" : "predict";
      return unevenTableItem(t, form, form === "predict" && t.chance(0.5));
    },
  };

  /* ================================= fit-slope-rescaled-units (Hard) */

  // Each scene's model uses scaled units; the question asks in plain ones.
  // perX: one asked unit of x in model units; perY and pairY: one model unit
  // of y in the asked units; toModel: one asked unit of a difference in x, in
  // model units.
  const RESCALE_SCENES = [
    {
      slopes: [8, 9.5, 10.5, 12, 12.5, 14, 15.5], intercepts: [20, 90], xMax: 40, xStep: 5, count: 16,
      xTitle: "Floor area (hundreds of square feet)", yTitle: "Price (thousands of dollars)",
      about: "the floor areas and sale prices of houses sold in a town last year",
      define: "where y is the predicted sale price, in thousands of dollars, of a house with a floor area of x hundred square feet",
      slopeUnits: "thousands of dollars per hundred square feet", perWords: "dollars per square foot", pairWords: "dollars",
      perX: 0.01, perY: 1000, pairY: 1000, toModel: 0.01, diffs: [150, 200, 250, 300, 350, 400, 450, 600],
      perUnit: "According to the line of best fit, what is the predicted increase in sale price, in dollars, for each additional square foot of floor area?",
      pair: (D) => `Two houses differ in floor area by ${fmt(D)} square feet. According to the line of best fit, how much greater, in dollars, is the predicted sale price of the larger house?`,
      xConv: (D) => `${fmt(D)} square ${D === 1 ? "foot" : "feet"} is ${fmt(D)} ÷ 100 = ${num(tidy(D / 100))} hundred square feet`,
      yConv: (v) => `${num(tidy(v))} thousand dollars is ${num(tidy(v))} × 1,000 = ${fmt(v * 1000)} dollars`,
    },
    {
      slopes: [-0.9, -1.2, -1.5, -1.8, -2.4], intercepts: [240, 320], xMax: 100, xStep: 10, count: 15,
      xTitle: "Distance driven (thousands of miles)", yTitle: "Value (hundreds of dollars)",
      about: "the distances driven and the values of used cars of one model",
      define: "where y is the predicted value, in hundreds of dollars, of a car that has been driven x thousand miles",
      slopeUnits: "hundreds of dollars per thousand miles", perWords: "cents per mile", pairWords: "dollars",
      perX: 0.001, perY: 10000, pairY: 100, toModel: 0.001, diffs: [2500, 4000, 5000, 7500, 12000],
      perUnit: "According to the line of best fit, by how many cents does the predicted value of a car decrease for each additional mile driven?",
      pair: (D) => `Two cars of this model have been driven distances that differ by ${fmt(D)} miles. According to the line of best fit, how much less, in dollars, is the predicted value of the car that has been driven farther?`,
      xConv: (D) => `${fmt(D)} ${D === 1 ? "mile" : "miles"} is ${fmt(D)} ÷ 1,000 = ${num(tidy(D / 1000))} thousand miles`,
      yConv: (v, per) => `${num(tidy(v))} hundred dollars is ${num(tidy(v))} × 100 = ${per ? `${num(tidy(v * 100))} dollars, or ${fmt(v * 10000)} cents` : `${fmt(v * 100)} dollars`}`,
    },
    {
      slopes: [1.2, 1.8, 2.4, 3, 3.6], intercepts: [36, 55], xMax: 20, xStep: 2, count: 15,
      xTitle: "Years of experience", yTitle: "Annual salary (thousands of dollars)",
      about: "the years of experience and the annual salaries of the nurses at a hospital",
      define: "where y is the predicted annual salary, in thousands of dollars, of a nurse with x years of experience",
      slopeUnits: "thousands of dollars of annual salary per year of experience", perWords: "dollars of monthly salary per year", pairWords: "dollars per month",
      perX: 1, perY: 1000 / 12, pairY: 1000 / 12, toModel: 1, diffs: [2, 3, 4, 5, 6],
      perUnit: "According to the line of best fit, by how many dollars does the predicted monthly salary increase for each additional year of experience? (Each annual salary is paid in 12 equal monthly amounts.)",
      pair: (D) => `Two nurses at the hospital differ in experience by ${D} years. According to the line of best fit, how much greater, in dollars, is the predicted monthly salary of the more experienced nurse? (Each annual salary is paid in 12 equal monthly amounts.)`,
      xConv: null,
      yConv: (v) => `${num(tidy(v))} thousand dollars a year is ${fmt(v * 1000)} dollars a year, or ${fmt(v * 1000)} ÷ 12 = ${fmt(v * 1000 / 12)} dollars a month`,
      extraPer: (M) => [
        [M * 1000, "Gives the increase in annual salary, in dollars, instead of monthly salary."],
        [M / 12, "Divides by 12 for the months but leaves the salary in thousands of dollars."],
      ],
      extraPair: (M, D) => [
        [M * D * 1000, "Gives the difference in annual salary, in dollars, instead of monthly salary."],
        [(M * D) / 12, "Divides by 12 for the months but leaves the salary in thousands of dollars."],
      ],
    },
    {
      slopes: [1.5, 2, 2.5, 3, 4, 5], intercepts: [4, 20], xMax: 40, xStep: 5, count: 14,
      xTitle: "Days since sprouting", yTitle: "Height (millimeters)",
      about: "the ages, in days since sprouting, and the heights of sunflower seedlings",
      define: "where y is the predicted height, in millimeters, of a seedling x days after it sprouted",
      slopeUnits: "millimeters per day", perWords: "centimeters per week", pairWords: "centimeters",
      perX: 7, perY: 0.1, pairY: 0.1, toModel: 7, diffs: [2, 3, 4, 5],
      perUnit: "According to the line of best fit, by how many centimeters does the predicted height of a seedling increase each week?",
      pair: (D) => `Two seedlings sprouted ${D} weeks apart. According to the line of best fit, how much taller, in centimeters, is the predicted height of the older seedling?`,
      xConv: (D) => `${D} ${D === 1 ? "week is" : "weeks are"} ${D} × 7 = ${7 * D} days`,
      yConv: (v) => `${num(tidy(v))} millimeters is ${num(tidy(v))} ÷ 10 = ${num(tidy(v / 10))} centimeters`,
    },
  ];

  const clean3 = (value) => (Number.isFinite(value) && value > 0 && isClean(value, 3) ? fmt(value) : null);

  function rescaleItem(t, form, numeric) {
    const scene = t.pick(RESCALE_SCENES);
    return retry(() => {
      const m = t.pick(scene.slopes);
      const b = t.int(scene.intercepts[0], scene.intercepts[1]);
      const M = Math.abs(m);
      const equation = `y = ${S.lin(m, b)}`;
      let figure = null;
      let yMax = 0;
      if (t.chance(0.5)) {
        const top = Math.max(b, m * scene.xMax + b) * 1.12;
        const yStep = niceStep(top);
        yMax = Math.ceil(top / yStep) * yStep;
        const slots = range(1, 2 * (scene.xMax / scene.xStep) - 1).map((index) => (index * scene.xStep) / 2);
        const points = t.sample(slots, scene.count).map((x, index) => {
          const offset = (index % 2 ? 1 : -1) * (0.2 + t.random() * 0.8) * yMax * 0.06;
          return [x, Math.max(yStep * 0.2, Math.min(yMax - yStep * 0.2, m * x + b + offset))];
        });
        const alt =
          `Scatterplot of ${scene.count} points with ${inSentence(scene.xTitle)} on the horizontal axis (0 to ${scene.xMax}) and ` +
          `${inSentence(scene.yTitle)} on the vertical axis (0 to ${yMax}). A line of best fit passes from about (0, ${b}) to ` +
          `(${scene.xMax}, ${num(tidy(m * scene.xMax + b))}).`;
        figure = scatterPlot({ xMax: scene.xMax, xStep: scene.xStep, yMax, yStep, points, fit: [m, b], xTitle: scene.xTitle, yTitle: scene.yTitle, alt });
      }
      const intro = figure
        ? `The scatterplot shows ${scene.about}. A line of best fit is shown, and its equation is ${equation}, ${scene.define}.`
        : `A researcher recorded ${scene.about}. A line of best fit for the data is ${equation}, ${scene.define}.`;
      // The line as the student can recover it: from the drawing or the stem.
      const lineOf = () => {
        if (figure) return readScatter(figure.svg, scene.xMax, yMax).line;
        const parsed = parseLine(intro);
        return parsed ? (x) => parsed[0] * x + parsed[1] : null;
      };
      const principles = [
        "A slope carries units: the units of y per unit of x. Rescaling either variable rescales the slope.",
        "Convert the change in x to the model's units before multiplying by the slope, then convert the change in y to the units asked for.",
      ];
      const common = { stimulus: null, figure, principles, estimatedSeconds: 120 };
      const cap = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

      if (form === "perUnit") {
        const key = tidy(M * scene.perX * scene.perY);
        const keyText = clean3(key);
        if (!keyText) return null;
        const change = tidy(M * scene.perX);
        const steps = [
          `The slope, ${num(M)}, is in ${scene.slopeUnits}.`,
          scene.xConv
            ? `${cap(scene.xConv(1))}, so the predicted change in y is ${num(M)} × ${num(scene.perX)} = ${num(change)}.`
            : `One year of experience is one unit of x, so the predicted change in y is ${num(M)}.`,
          `${cap(scene.yConv(change, true))}.`,
        ];
        return packRanked(t, numeric, key, [
          [M, `Reads the slope, ${num(M)}, without converting either variable's units.`],
          // Mistakes about x exist only where x needs converting.
          [scene.perX !== 1 ? M * scene.perY : NaN, "Converts the units of y but not the units of x."],
          [M * scene.perX, "Converts the units of x but not the units of y."],
          [M / (scene.perX * scene.perY), "Applies both conversions upside down, dividing where it should multiply."],
          ...(scene.extraPer ? scene.extraPer(M) : []),
          [scene.perX !== 1 ? (M * scene.perY) / scene.perX : NaN, "Converts the units of y correctly but the units of x upside down."],
          [(M * scene.perX) / scene.perY, "Converts the units of x correctly but the units of y upside down."],
        ], {
          ...common,
          stem: `${intro} ${scene.perUnit}`,
          explanation: `${steps.join(" ")} The answer is ${keyText}.`,
          steps,
          trap: `The slope, ${num(M)}, is in ${scene.slopeUnits}, not in ${scene.perWords}.`,
          hint: "What units are x and y measured in, and what units does the question use?",
          verify: () => {
            const line = lineOf();
            if (!line) return false;
            return close(Math.abs(line(5 + scene.perX) - line(5)) * scene.perY, key, 0.01);
          },
        }, { places: 3, show: clean3 });
      }

      const D = t.pick(scene.diffs);
      const dx = tidy(D * scene.toModel);
      const change = tidy(M * dx);
      const key = tidy(change * scene.pairY);
      const keyText = clean3(key);
      if (!keyText) return null;
      const valueAt = tidy((m * dx + b) * scene.pairY);
      const steps = [
        scene.xConv ? `${cap(scene.xConv(D))}.` : `The difference, ${D} years, is already in the model's units for x.`,
        `Predicted difference in y: ${num(M)} × ${num(dx)} = ${num(change)}.`,
        `${cap(scene.yConv(change, false))}.`,
      ];
      return packRanked(t, numeric, key, [
        // Mistakes about x exist only where x needs converting.
        [scene.toModel !== 1 ? M * D * scene.pairY : NaN, `Multiplies the slope by ${fmt(D)} without converting it to the model's units for x.`],
        [change, "Leaves the difference in the model's units for y."],
        [valueAt, `Gives the predicted value itself at x = ${num(dx)}, not the difference between two predictions.`],
        [M * D, "Multiplies the slope by the difference without converting either unit."],
        ...(scene.extraPair ? scene.extraPair(M, D) : []),
        [scene.toModel !== 1 ? (M * D * scene.pairY) / scene.toModel : NaN, `Converts the difference of ${fmt(D)} to the model's units the wrong way.`],
        [change / scene.pairY, "Converts the difference in y the wrong way."],
      ], {
        ...common,
        stem: `${intro} ${scene.pair(D)}`,
        explanation: `${steps.join(" ")} The intercept cancels, because both predictions include it.`,
        steps,
        trap: scene.xConv
          ? `${fmt(D)} is not in the model's units for x, and the slope's answer is not in ${scene.pairWords}; both need converting.`
          : `The slope gives the change in annual salary in thousands of dollars; the question asks for monthly salary in dollars.`,
        hint: "In the model's units, how far apart are the two x-values, and what unit does the question want?",
        verify: () => {
          const line = lineOf();
          if (!line) return false;
          return close(Math.abs(line(3 + dx) - line(3)) * scene.pairY, key, 0.01);
        },
      }, { places: 3, show: clean3 });
    });
  }

  const rescaledSlope = {
    id: "fit-slope-rescaled-units",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "linear models",
    difficulty: "Hard",
    title: "Converting a fitted slope to other units",
    recognize:
      "The slope is in the model's units (thousands of dollars per hundred square feet, say); the question asks in other units, " +
      "so convert the change in x into model units, multiply by the slope, and convert the change in y back.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["unit-mismatch", "wrong-quantity", "intermediate-value"],
    build(t) {
      const form = t.chance(0.5) ? "perUnit" : "pair";
      return rescaleItem(t, form, t.chance(0.5));
    },
  };

  /* ================================= outlier-removal-fit (Hard) */

  // A point far from the trend near one end pulls that end of the line of
  // best fit toward itself; removing it lets the line swing back. The student
  // must reason about where the point sits, not compute.
  const OUTLIER_SCENES = [
    {
      sign: 1, xSteps: [1, 2], ySteps: [5, 10], xTitle: "Number of employees", yTitle: "Sales (thousands of dollars)",
      about: (n) => `the numbers of employees and the monthly sales, in thousands of dollars, of ${n} stores`, far: "employees",
    },
    {
      sign: -1, xSteps: [1], ySteps: [1, 2], xTitle: "Age of car (years)", yTitle: "Price (thousands of dollars)",
      about: (n) => `the ages and prices, in thousands of dollars, of ${n} used cars`, far: "years",
    },
    {
      sign: 1, xSteps: [1, 2], ySteps: [5, 10], xTitle: "Hours studied", yTitle: "Test score (points)",
      about: (n) => `the numbers of hours ${n} students studied for a test and their scores on the test`, far: "hours",
    },
    {
      sign: -1, xSteps: [1, 2], ySteps: [1, 2], xTitle: "Elevation (hundreds of meters)", yTitle: "Temperature (°C)",
      about: (n) => `the elevations, in hundreds of meters, and the noon temperatures, in degrees Celsius, at ${n} weather stations`, far: "hundred meters",
    },
    {
      sign: 1, xSteps: [2, 5], ySteps: [2, 5], xTitle: "Age of tree (years)", yTitle: "Height (feet)",
      about: (n) => `the ages, in years, and the heights, in feet, of ${n} maple trees in a park`, far: "years",
    },
    {
      sign: -1, xSteps: [1], ySteps: [1, 2], xTitle: "Distance from city center (miles)", yTitle: "Rent (hundreds of dollars)",
      about: (n) => `the distances from the city center, in miles, and the monthly rents, in hundreds of dollars, of ${n} apartments`, far: "miles",
    },
  ];

  // Least-squares slope and intercept of y on x.
  function fitLine(points) {
    const { slope, at } = leastSquares(points);
    return { slope, intercept: at(0), at };
  }

  const outlierRemoval = {
    id: "outlier-removal-fit",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "scatterplots",
    difficulty: "Hard",
    title: "How removing a data point moves the line of best fit",
    recognize:
      "A point far from the trend near one end of the data pulls that end of the line toward it. Removing it lets that end " +
      "swing back: decide which way the slope turns, then how the line's value moves at the far end or at x = 0.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 2, synthesis: 0, trap: 2 },
    tricks: ["reversed-condition", "wrong-quantity"],
    build(t) {
      const askIntercept = t.chance(0.5);
      // Drawn once, outside the retry loop, so the answer's direction stays
      // even: removing a high point at the right end, or a low one at the
      // left, lowers the slope; the other two raise it.
      const right = t.chance(0.5);
      const wantUp = t.chance(0.5);
      const above = right ? !wantUp : wantUp;
      return retry(() => {
        // The scene may change between tries; the answer's direction may not.
        const scene = t.pick(OUTLIER_SCENES);
        const xStep = t.pick(scene.xSteps);
        const yStep = t.pick(scene.ySteps);
        const q = scene.sign * t.pick([0.5, 0.75, 1]);
        const bCells = scene.sign > 0 ? t.int(1, 5) : t.int(7, 11);
        const endCells = bCells + q * X_CELLS;
        if (endCells < 1.5 || endCells > Y_CELLS - 1.5) return null;
        const n = t.int(9, 12);
        // Trend points at distinct half-cell x values, away from the outlier's column.
        const ox = right ? t.int(6, 7) : t.int(1, 2);
        const trendAt = (x) => bCells + q * x;
        const oy = trendAt(ox) + (above ? 1 : -1) * t.int(3, 5);
        if (!Number.isInteger(oy) || oy < 0.5 || oy > Y_CELLS - 0.5) return null;
        const slots = range(1, 2 * X_CELLS - 1).map((index) => index / 2).filter((x) => Math.abs(x - ox) >= 1);
        const xs = t.sample(slots, n).sort((a, b) => a - b);
        // Spread across the whole range, so the trend is plain and one point stands out.
        const gaps = xs.slice(1).map((x, index) => x - xs[index]);
        if (xs[0] > 1 || xs[n - 1] < 7 || gaps.some((gap) => gap > 1.5 && !(xs[gaps.indexOf(gap)] < ox && ox < xs[gaps.indexOf(gap) + 1]))) return null;
        const cells = xs.map((x, index) => [x, trendAt(x) + (index % 2 ? 1 : -1) * (0.2 + t.random() * 0.6)]);
        if (cells.some(([, y]) => y < 0.3 || y > Y_CELLS - 0.3)) return null;
        const points = cells.map(([x, y]) => [x * xStep, y * yStep]).concat([[ox * xStep, oy * yStep]]);
        const all = fitLine(points);
        const rest = fitLine(points.slice(0, -1));
        // Only the chosen point is far from the line drawn through all of them.
        const off = (x, y) => Math.abs(y - all.at(x)) / yStep;
        if (points.slice(0, -1).some(([x, y]) => off(x, y) > 1.3) || off(ox * xStep, oy * yStep) < 2.4) return null;
        const X0 = ox * xStep;
        const Y0 = oy * yStep;
        // The far end: the other side of the data from the outlier.
        const farX = (right ? 0 : X_CELLS) * xStep;
        const slopeUp = rest.slope > all.slope;
        if (slopeUp !== wantUp) return null;
        const otherUp = askIntercept ? rest.intercept > all.intercept : rest.at(farX) > all.at(farX);
        // Only clear cases, so reading the drawing cannot flip the answer.
        const clear = Math.abs(rest.slope - all.slope) >= 0.12 * Math.abs(all.slope) &&
          Math.abs((askIntercept ? rest.intercept - all.intercept : rest.at(farX) - all.at(farX))) >= 0.4 * yStep;
        if (!clear) return null;
        const xMax = X_CELLS * xStep;
        const yMax = Y_CELLS * yStep;
        const alt =
          `Scatterplot of ${n + 1} points with ${inSentence(scene.xTitle)} on the horizontal axis, 0 to ${xMax}, and ` +
          `${inSentence(scene.yTitle)} on the vertical axis, 0 to ${yMax}. A line of best fit for all the points is drawn. Most points lie close to ` +
          `the line; the point at (${num(X0)}, ${num(Y0)}) lies far ${above ? "above" : "below"} it.`;
        const figure = scatterPlot({ xMax, xStep, yMax, yStep, points, fit: [tidy(all.slope), tidy(all.intercept)], xTitle: scene.xTitle, yTitle: scene.yTitle, alt });
        const otherWords = askIntercept ? "the y-intercept" : `the predicted value at x = ${num(farX)}`;
        // Different words for the two effects, so no choice shares more words
        // with the others than the rest do.
        const say = (up1, up2) =>
          `The slope would ${up1 ? "increase" : "decrease"}, and ${otherWords} would be ${up2 ? "greater" : "less"}.`;
        const pull = right ? "right" : "left";
        const grid = statementGrid((i, j) => {
          const up1 = i === 0 ? slopeUp : !slopeUp;
          const up2 = j === 0 ? otherUp : !otherUp;
          const reason = i && j
            ? "Reverses both effects: removing the point lets the line swing away from where the point was pulling it."
            : i
              ? `Turns the line the wrong way: the point at the ${pull} end pulls that end ${above ? "up" : "down"}, so removing it moves that end ${above ? "down" : "up"}.`
              : `Gets the slope right but not the other end: the line pivots near the middle of the data, so ${otherWords} moves the opposite way to the ${pull} end.`;
          return [say(up1, up2), reason, i === 0 && j === 0];
        });
        const stem =
          `The scatterplot shows ${scene.about(n + 1)}, and a line of best fit for all ${n + 1} points. If the data point at ` +
          `(${num(X0)}, ${num(Y0)}) is removed and a new line of best fit is found for the other ${n} points, which of the following ` +
          `best describes how the new line compares with the one shown?`;
        return {
          responseType: "multiple-choice",
          stimulus: null,
          figure,
          stem,
          correct: grid.correct,
          wrong: grid.wrong,
          explanation:
            `The point at (${num(X0)}, ${num(Y0)}) is far ${above ? "above" : "below"} the trend near the ${pull} end of the data, so it ` +
            `pulls that end of the line ${above ? "up" : "down"}. Without it, the ${pull} end moves ${above ? "down" : "up"}: the line turns so its ` +
            `slope ${slopeUp ? "increases" : "decreases"}, and the other end, including ${otherWords}, moves ${otherUp ? "up" : "down"}.`,
          steps: [
            `Locate the point: near the ${pull} end, far ${above ? "above" : "below"} the other points.`,
            `Removing it lets the ${pull} end of the line move ${above ? "down" : "up"}, so the slope ${slopeUp ? "increases" : "decreases"}.`,
            `The line pivots near the middle of the data, so the opposite end moves ${otherUp ? "up" : "down"}: ${otherWords} would be ${otherUp ? "greater" : "less"}.`,
          ],
          principles: [
            "A point far from the trend near one end of the data has a strong pull on the slope of the line of best fit.",
            "A line of best fit passes through the mean of the data, so when one end moves one way, the other end moves the other way.",
          ],
          trap: `The ${above ? "high" : "low"} point makes its end of the line ${above ? "higher" : "lower"}; removing it moves that end the other way, and the far end moves opposite to it.`,
          hint: "Which end of the line is the point pulling, and which way?",
          estimatedSeconds: 110,
          verify: () => {
            // Refit both lines from the points in the drawing itself.
            const seen = readScatter(figure.svg, xMax, yMax).points;
            if (seen.length !== n + 1) return false;
            const target = seen.findIndex(([x, y]) => Math.abs(x - X0) < 0.05 * xStep && Math.abs(y - Y0) < 0.05 * yStep);
            if (target < 0) return false;
            const before = fitLine(seen);
            const after = fitLine(seen.filter((unused, index) => index !== target));
            const first = after.slope > before.slope;
            const second = askIntercept ? after.intercept > before.intercept : after.at(farX) > before.at(farX);
            return grid.correct === say(first, second);
          },
        };
      });
    },
  };

  /* ============================ exponential-fit-interpretation (Hard) */

  // An exponential model fitted to data: a percent change per unit compounds,
  // so over k units it is not k times the one-unit change.
  const GROWTH_FITS = [
    {
      growth: true, a: [200, 600], step: 50, unit: "hour", xMax: 8, xTitle: "Time (hours)", yTitle: "Number of bacteria",
      about: "the number of bacteria in a culture at different times after it was started", noun: "number of bacteria", things: "bacteria",
      xIs: "the number of hours after the culture was started",
    },
    {
      growth: true, a: [1000, 3000], step: 500, unit: "month", xMax: 8, xTitle: "Time (months)", yTitle: "Active users",
      about: "the number of active users of a new app at the end of different months after its launch", noun: "number of active users", things: "users",
      xIs: "the number of months after the launch",
    },
    {
      growth: false, a: [20, 40], step: 1, unit: "year", xMax: 8, xTitle: "Age (years)", yTitle: "Value (thousands of dollars)",
      about: "the ages and values, in thousands of dollars, of used cars of one model", noun: "value of a car", things: "thousand dollars",
      xIs: "the age of the car, in years",
    },
    {
      growth: false, a: [300, 600], step: 50, unit: "hour", xMax: 8, xTitle: "Time (hours)", yTitle: "Medication (milligrams)",
      about: "the amount of a medication, in milligrams, in patients' bloodstreams at different times after a dose", noun: "amount of medication", things: "milligrams",
      xIs: "the number of hours after the dose",
    },
    {
      growth: false, a: [80, 160], step: 10, unit: "day", xMax: 8, xTitle: "Time (days)", yTitle: "Mass (grams)",
      about: "the mass, in grams, of a radioactive sample measured on different days", noun: "mass of the sample", things: "grams",
      xIs: "the number of days after the first measurement",
    },
  ];

  const expFitInterpretation = {
    id: "exponential-fit-interpretation",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "scatterplots",
    difficulty: "Hard",
    title: "Compounding in an exponential model fitted to data",
    recognize:
      "In y = a·b^x the predicted value is multiplied by b for each unit of x, so over k units it is multiplied by b^k; the " +
      "percent change over k units is b^k − 1, not k times the one-unit percent.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "wrong-quantity", "percent-base"],
    build(t) {
      const scene = t.pick(GROWTH_FITS);
      const form = t.pick(["change", "change", "ratio"]);
      const numeric = form === "change" && t.chance(0.35);
      return retry(() => {
        const b = t.pick(scene.growth ? [1.1, 1.2, 1.25, 1.3, 1.5] : [0.9, 0.8, 0.75, 0.7, 0.6]);
        const k = t.pick([2, 3]);
        const a = t.int(scene.a[0] / scene.step, scene.a[1] / scene.step) * scene.step;
        const factor = tidy(b ** k);
        const pct = tidy(Math.abs(factor - 1) * 100);
        if (!isClean(pct, 1)) return null;
        const per = tidy(Math.abs(b - 1) * 100);
        const model = (x) => a * b ** x;
        // Keep the vertical scale under 10,000 so its labels stay short.
        const xMax = range(5, scene.xMax).filter((x) => model(x) * 1.15 < 10000).pop();
        if (!xMax) return null;
        // The data: the model plus a little scatter, at whole units.
        const xs = range(0, xMax);
        const ys = xs.map((x) => model(x) * (1 + (t.random() * 2 - 1) * 0.06));
        const top = Math.max(...ys) * 1.1;
        // A 1, 2, or 5 times a power of ten, giving at most 10 gridlines.
        const power = 10 ** Math.floor(Math.log10(top / 10));
        const yStep = [1, 2, 5, 10].map((m) => m * power).find((step) => top / step <= 10);
        const yMax = Math.ceil(top / yStep) * yStep;
        const equation = `y = ${fmt(a)}(${num(b)})^x`;
        const alt =
          `Scatterplot of ${xs.length} points with ${inSentence(scene.xTitle)} on the horizontal axis, 0 to ${xMax}, and ` +
          `${inSentence(scene.yTitle)} on the vertical axis, 0 to ${fmt(yMax)}. The points ${scene.growth ? "rise more and more steeply" : "fall steeply at first and then level off"}, ` +
          "and a curve of best fit passes close to them.";
        const figure = scatterPlot({
          xMax, xStep: 1, yMax, yStep, points: xs.map((x, index) => [x, ys[index]]), fit: null, curve: model,
          xTitle: scene.xTitle, yTitle: scene.yTitle, alt,
        });
        const intro =
          `The scatterplot shows ${scene.about}. An exponential model for the data is ${equation}, where y is the predicted ` +
          `${scene.noun} and x is ${scene.xIs}.`;
        const word = scene.growth ? "increase" : "decrease";
        const units = `${k} ${scene.unit}s`;
        const common = {
          stimulus: null,
          figure,
          principles: [
            "In an exponential model y = a·b^x, each increase of 1 in x multiplies the predicted value by b.",
            "Over k units the predicted value is multiplied by b^k, so percent changes compound rather than add.",
          ],
          estimatedSeconds: 110,
        };
        const steps = [
          `Each ${scene.unit} multiplies the predicted value by ${num(b)}.`,
          `Over ${units}: ${num(b)}${S.sup(k)} = ${num(factor)}.`,
        ];
        const check = (stem) => () => {
          // Re-read the model from the stem and compare two predictions k apart.
          const found = /y = ([\d,]+)\(([\d.]+)\)\^x/.exec(stem);
          if (!found) return false;
          const [start, base] = [Number(found[1].replace(/,/g, "")), Number(found[2])];
          const ratio = (start * base ** (5 + k)) / (start * base ** 5);
          return form === "ratio" ? close(ratio * 100, factor * 100, 1e-9) : close(Math.abs(ratio - 1) * 100, pct, 1e-9);
        };
        const percent = (value) => `${num(tidy(value))}%`;
        if (form === "change") {
          const stem = `${intro} According to the model, by what percent does the predicted ${scene.noun} ${word} every ${units}?`;
          const item = packRanked(t, numeric, pct, [
            // A decrease of more than 100% is impossible, so it is not offered.
            [scene.growth || k * per < 100 ? k * per : NaN, `Adds the ${per}% ${word} once for each of the ${units}; percent changes compound, so they do not add.`],
            [per, `Gives the ${word} for one ${scene.unit}, not for ${units}.`],
            [factor * 100, `Gives the predicted value after ${units} as a percent of the starting value, not the percent ${word}.`],
            [per ** k / 100 ** (k - 1), `Raises the percent ${word}, ${per}%, to the power ${k} instead of the factor ${num(b)}.`],
          ], {
            ...common,
            stem,
            explanation: `${steps.join(" ")} A factor of ${num(factor)} is ${S.article(pct)} ${percent(pct)} ${word}.`,
            steps: [...steps, `A factor of ${num(factor)} means ${S.article(pct)} ${percent(pct)} ${word}.`],
            trap: `${k} × ${per}% = ${k * per}% adds percents that compound; the ${word} over ${units} is ${percent(pct)}.`,
            hint: `What does the model multiply the predicted value by over ${units}?`,
            verify: check(stem),
          }, { places: 2, show: numeric ? fmt : percent });
          return item;
        }
        const x1 = t.int(1, 4);
        const stem =
          `${intro} According to the model, the predicted ${scene.noun} at x = ${x1 + k} is what percent of the predicted ${scene.noun} at x = ${x1}?`;
        return packRanked(t, false, factor * 100, [
          [(1 + k * (b - 1)) * 100, `Adds the one-${scene.unit} percent change ${k} times instead of compounding it.`],
          [b * 100, `Uses the change for one ${scene.unit}, though the values are ${units} apart.`],
          [pct, `Gives the percent ${word}, not the later value as a percent of the earlier one.`],
          [(b ** (x1 + k)) * 100, `Applies the factor ${x1 + k} times, from x = 0, instead of ${k} times.`],
          [(1 / factor) * 100, `Compares the values the other way around, the earlier one as a percent of the later one.`],
        ], {
          ...common,
          stem,
          explanation: `${steps.join(" ")} The predicted value at x = ${x1 + k} is ${num(factor)} times the value at x = ${x1}, which is ${percent(factor * 100)} of it.`,
          steps: [...steps, `${num(factor)} = ${percent(factor * 100)}.`],
          trap: `The ${word} is ${per}% each ${scene.unit}, but over ${units} the factors multiply: ${num(b)}${S.sup(k)}, not 1 ${scene.growth ? "+" : MINUS} ${k} × ${num(tidy(Math.abs(b - 1)))}.`,
          hint: `How many times is the factor ${num(b)} applied between x = ${x1} and x = ${x1 + k}?`,
          verify: check(stem),
        }, { places: 2, show: percent });
      });
    },
  };

  /* ===================================== fit-model-choice (Medium) */

  // Linear or exponential, and the value at x = 0, which the table (starting
  // at x = 1) does not show.
  const MODEL_SCENES = [
    { xHead: "Day", yHead: "Plants", about: "the number of plants in a garden bed on selected days after planting" },
    { xHead: "Week", yHead: "Members", about: "the number of members of a new online club at the end of each of its first five weeks" },
    { xHead: "Hour", yHead: "Cells", about: "the number of cells in a sample at the end of each of the first five hours of an experiment" },
    { xHead: "Year", yHead: "Value (dollars)", about: "the value, in dollars, of a piece of equipment at the end of each of the first five years after it was bought" },
    { xHead: "Month", yHead: "Visitors", about: "the number of visitors to a park in each of the first five months after it opened" },
  ];

  const fitModelChoice = {
    id: "fit-model-choice",
    domain: DATA,
    skill: "Two-variable data",
    subskill: "linear models",
    difficulty: "Medium",
    title: "Choosing a linear or exponential model for a table",
    recognize:
      "Equal differences for equal steps in x mean a linear model; equal ratios mean an exponential one. The equation's " +
      "constant is the value at x = 0, one step before the table starts.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "intermediate-value"],
    build(t) {
      const scene = t.pick(MODEL_SCENES);
      const exponential = t.chance(0.5);
      return retry(() => {
        let y0;
        let rate;
        if (exponential) {
          const option = t.pick([{ b: 2, starts: range(3, 12) }, { b: 3, starts: range(2, 6) }, { b: 1.5, starts: [32, 64, 96] },
            { b: 0.5, starts: [64, 128, 192, 256, 320] }, { b: 0.75, starts: [1024, 2048] }]);
          y0 = t.pick(option.starts);
          rate = option.b;
        } else {
          y0 = t.int(10, 90);
          rate = t.nonzero(-12, 15);
        }
        const f = (x) => (exponential ? y0 * rate ** x : y0 + rate * x);
        const xs = [1, 2, 3, 4, 5];
        const ys = xs.map(f);
        if (ys.some((y) => y <= 0 || !Number.isInteger(tidy(y)))) return null;
        // The other family, with its rate from the first two rows; both
        // families appear with the right start and with the x = 1 value, the
        // full 2 × 2 grid, so no choice is the one the others vary around.
        const firstDiff = ys[1] - ys[0];
        const firstRatio = tidy(ys[1] / ys[0]);
        if (!exponential && !isClean(firstRatio, 2)) return null;
        const lin = (m, c) => `y = ${S.lin(m, c).replace(/\d{4,}/g, (digits) => fmt(Number(digits)))}`;
        const expo = (c, b) => `y = ${fmt(c)}(${num(b)})^x`;
        const right = exponential
          ? { key: expo(y0, rate), keyShift: expo(ys[0], rate), other: lin(firstDiff, y0), otherShift: lin(firstDiff, ys[0]) }
          : { key: lin(rate, y0), keyShift: lin(rate, ys[0]), other: expo(y0, firstRatio), otherShift: expo(ys[0], firstRatio) };
        const family = exponential ? "exponential" : "linear";
        const otherFamily = exponential ? "linear" : "exponential";
        const changes = exponential
          ? `the differences change (${num(firstDiff)}, ${num(ys[2] - ys[1])}, …), so the change is not a constant amount`
          : `the ratios change (${num(firstRatio)}, ${num(tidy(ys[2] / ys[1]))}, …), so the change is not a constant percent`;
        const reasons = {
          keyShift: `Uses ${fmt(ys[0])}, the value at x = 1, as the value at x = 0.`,
          other: `Chooses the ${otherFamily} form, using the first two rows; ${changes}.`,
          otherShift: `Chooses the ${otherFamily} form and also uses the value at x = 1 as the value at x = 0.`,
        };
        const grid = statementGrid((i, j) => {
          const text = i === 0 ? (j === 0 ? right.key : right.keyShift) : (j === 0 ? right.other : right.otherShift);
          const reason = i === 0 ? reasons.keyShift : j === 0 ? reasons.other : reasons.otherShift;
          return [text, i === 0 && j === 0 ? "" : reason, i === 0 && j === 0];
        });
        if (!grid || new Set([grid.correct, ...grid.wrong.map(([text]) => text)]).size < 4) return null;
        const content = S.table([scene.xHead, scene.yHead], xs.map((x, index) => [x, fmt(ys[index])]));
        const diffs = ys.slice(1).map((y, index) => tidy(y - ys[index]));
        const ratios = ys.slice(1).map((y, index) => tidy(y / ys[index]));
        return pack(false, null, grid.correct, grid.wrong, {
          stimulus: { type: "table", content },
          figure: null,
          stem: `The table shows ${scene.about}. Which of the following equations models the relationship between x, the ${scene.xHead.toLowerCase()}, and y, the ${inSentence(scene.yHead).replace(/ \(.*\)$/, "")}?`,
          explanation: exponential
            ? `Each row is ${num(rate)} times the one before (${ratios.map(num).join(", ")}), so the model is exponential with factor ${num(rate)}. ` +
              `One step before x = 1, the value is ${fmt(ys[0])} ÷ ${num(rate)} = ${fmt(y0)}, so y = ${fmt(y0)}(${num(rate)})^x.`
            : `Each row changes by ${num(rate)} (${diffs.map(num).join(", ")}), so the model is linear with slope ${num(rate)}. ` +
              `One step before x = 1, the value is ${fmt(ys[0])} ${S.signed(-rate)} = ${fmt(y0)}, so ${lin(rate, y0)}.`,
          steps: [
            `Differences between rows: ${diffs.map(num).join(", ")}; ratios: ${ratios.map((r) => num(r)).join(", ")}.`,
            exponential ? `The ratios are constant, so the model is ${family}.` : `The differences are constant, so the model is ${family}.`,
            `The value at x = 0 is one step back from x = 1: ${fmt(y0)}.`,
          ],
          principles: [
            "Constant differences over equal steps in x mean a linear model; constant ratios mean an exponential model.",
            "In y = mx + b or y = a(b)^x, the constant b or a is the value of y when x = 0.",
          ],
          trap: `The table starts at x = 1, so ${fmt(ys[0])} is not the value at x = 0.`,
          hint: "Compare the changes from row to row, as amounts and as ratios.",
          estimatedSeconds: 90,
          verify: () => {
            // Evaluate each choice at the table's x-values; exactly the key fits every row.
            const rows = parseTable(content).slice(1).map((row) => row.map(parseNumber));
            const value = (text, x) => {
              const e = /^y = ([\d,.]+)\(([\d.]+)\)\^x$/.exec(text);
              if (e) return Number(e[1].replace(/,/g, "")) * Number(e[2]) ** x;
              const l = /^y = (−?[\d.,]*)x(?: ([+−]) ([\d.,]+))?$/.exec(text);
              if (!l) return NaN;
              const m = l[1] === "" ? 1 : l[1] === MINUS ? -1 : Number(l[1].replace(MINUS, "-").replace(/,/g, ""));
              return m * x + (l[2] ? (l[2] === "+" ? 1 : -1) * Number(l[3].replace(/,/g, "")) : 0);
            };
            const fits = (text) => rows.every(([x, y]) => close(value(text, x), y, 1e-9));
            return fits(grid.correct) && grid.wrong.every(([text]) => !fits(text));
          },
        }, true);
      });
    },
  };

  // Every item's text passes through agree(), so a quantity of exactly 1
  // takes a singular unit wherever a template's numbers happen to land on it.
  function withAgreement(family) {
    const fix = (value) => (typeof value === "string" ? agree(value) : value);
    return {
      ...family,
      build(t) {
        const item = family.build(t);
        return {
          ...item,
          stem: fix(item.stem),
          correct: fix(item.correct),
          wrong: (item.wrong || []).map(([text, reason]) => [fix(text), fix(reason)]),
          explanation: fix(item.explanation),
          steps: (item.steps || []).map(fix),
          trap: fix(item.trap),
          hint: fix(item.hint),
        };
      },
    };
  }

  return [
    bestFitEquation, shapeAndCount, scatterReading, twoGroupLines, fitModelChoice, unevenTable, rescaledSlope, outlierRemoval,
    expFitInterpretation,
  ].map(withAgreement);
});
