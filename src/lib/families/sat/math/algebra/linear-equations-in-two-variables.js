(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/algebra"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Linear equations in two variables templates (Algebra), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, signed, lin, frac, approx, point } = S;
  const {
    clean, terminates, whole, commas, usd, money, distinctWrong, commaChoices, responseFor, xTerm,
    standardForm, moveText, holds, readPoint, exact, fitsGridHard, commasHard, usdHard,
    commaChoicesHard, distinctWrongHard, compileHard, compile, fitsGrid, lineCoefficients, slopeTerm,
  } = C;

  /* --------------------------------------------------- two-variable-equation-model */

  const modelScenes = [
    {
      make: (t) => ({ a: t.pick([2, 2.5, 3, 3.5, 4]), b: t.pick([1.5, 2, 2.5, 3, 4.5]), x0: t.int(8, 40), y0: t.int(8, 40) }),
      text: (v, T) =>
        `A snack stand sells pretzels for ${usd(v.a)} each and drinks for ${usd(v.b)} each. One day, the stand's ` +
        `sales from pretzels and drinks totaled ${usd(T)}.`,
      defs: "x is the number of pretzels sold and y is the number of drinks sold",
      given: (x) => `If the stand sold ${x} pretzels that day, how many drinks did it sell?`,
      leftover: "dollars of drink sales", xs: "pretzels", ys: "drinks", totalNoun: "dollars", dollars: true,
    },
    {
      make: (t) => ({ a: 2, b: 3, x0: t.int(6, 20), y0: t.int(3, 14) }),
      text: (v, T) =>
        `In a basketball game, a team scored ${T} points, all from 2-point baskets and 3-point baskets.`,
      defs: "x is the number of 2-point baskets and y is the number of 3-point baskets",
      given: (x) => `If ${x} of the team's baskets were 2-point baskets, how many 3-point baskets did the team make?`,
      leftover: "points from 3-point baskets", xs: "2-point baskets", ys: "3-point baskets", totalNoun: "points",
    },
    {
      make: (t) => ({ a: t.pick([2, 3, 4]), b: t.pick([5, 6, 7]), x0: t.int(1, 6), y0: t.int(1, 4) }),
      text: (v, T) =>
        `On a training day, Rosa walked at an average speed of ${v.a} miles per hour and jogged at an average speed ` +
        `of ${v.b} miles per hour, covering ${T} miles in all.`,
      defs: "x is the number of hours Rosa walked and y is the number of hours she jogged",
      given: (x) => `If Rosa walked for ${x} hour${x === 1 ? "" : "s"}, for how many hours did she jog?`,
      leftover: "miles jogged", xs: "hours walking", ys: "hours jogging", totalNoun: "miles",
    },
    {
      make: (t) => ({ a: t.pick([2.5, 3, 3.5]), b: t.pick([1.5, 2, 4.5]), x0: t.int(2, 10), y0: t.int(2, 10) }),
      text: (v, T) =>
        `A baker uses ${num(v.a)} cups of flour for each loaf of bread and ${num(v.b)} cups of flour for each batch of ` +
        `muffins. On Monday, the baker used ${num(T)} cups of flour for bread and muffins.`,
      defs: "x is the number of loaves and y is the number of batches of muffins",
      given: (x) => `If the baker made ${x} loaves on Monday, how many batches of muffins did the baker make?`,
      leftover: "cups of flour for muffins", xs: "loaves", ys: "batches", totalNoun: "cups of flour",
    },
    {
      make: (t) => ({ a: t.pick([4, 5, 6]), b: t.pick([9, 10, 12, 14]), x0: t.int(3, 15), y0: t.int(2, 10) }),
      text: (v, T) =>
        `A carpenter uses ${v.a} feet of lumber for each shelf and ${v.b} feet of lumber for each bench. The ` +
        `carpenter used ${T} feet of lumber for shelves and benches last week.`,
      defs: "x is the number of shelves and y is the number of benches",
      given: (x) => `If the carpenter built ${x} shelves last week, how many benches did the carpenter build?`,
      leftover: "feet of lumber for benches", xs: "shelves", ys: "benches", totalNoun: "feet of lumber",
    },
  ];

  /* --------------------------------------------------------- linear-graph-context */

  const graphScenes = [
    {
      up: false, xLabel: "Time (minutes)", yLabel: "Water (gallons)",
      make: (t) => { const r = t.int(10, 40); return { r, y0: r * t.int(8, 24) }; },
      model: "the amount of water y, in gallons, in a tank x minutes after the tank began draining",
      value: (x) => `According to the model, how many gallons of water will be in the tank ${x} minutes after it began draining?`,
      time: (G) => (G === 0
        ? "According to the model, how many minutes after it began draining will the tank be empty?"
        : `According to the model, how many minutes after it began draining will the tank contain ${commas(G)} gallons of water?`),
      slope: (amount, word) => `The amount of water in the tank ${word} by ${amount} each minute.`,
      unitOne: "gallon", units: "gallons", xOne: "minute", xs: "minutes",
      start: (y0) => `The tank held ${commas(y0)} gallons when it began draining.`,
    },
    {
      up: false, xLabel: "Time (hours)", yLabel: "Battery charge (percent)",
      make: (t) => { const n = t.pick([5, 6, 8, 10, 12, 16, 20]); const y0 = t.pick([80, 90, 100, 96, 60]); return y0 % n === 0 ? { r: y0 / n, y0 } : null; },
      model: "the charge y, as a percent of full charge, of a phone's battery x hours after a video began streaming",
      value: (x) => `According to the model, what percent of full charge will the battery have ${x} hours after the video began?`,
      time: (G) => (G === 0
        ? "According to the model, how many hours after the video began will the battery charge reach 0 percent?"
        : `According to the model, how many hours after the video began will the battery charge be ${G} percent?`),
      slope: (amount, word) => `The battery charge ${word} by ${amount} of full charge each hour.`,
      unitOne: "percent", units: "percent", xOne: "hour", xs: "hours",
      start: (y0) => `The battery was at ${y0} percent of full charge when the video began.`,
    },
    {
      up: false, xLabel: "Time (weeks)", yLabel: "Balance (dollars)",
      make: (t) => { const r = 5 * t.int(1, 6); return { r, y0: r * t.int(5, 15) }; },
      model: "the balance y, in dollars, on a transit card x weeks after it was purchased, if the same amount is spent each week",
      value: (x) => `According to the model, what will the balance on the card be, in dollars, ${x} weeks after it was purchased?`,
      time: (G) => (G === 0
        ? "According to the model, how many weeks after it was purchased will the card's balance reach $0?"
        : `According to the model, how many weeks after it was purchased will the card's balance be ${usd(G)}?`),
      slope: (amount, word) => `The card's balance ${word} by ${amount} each week.`,
      unitOne: "dollar", units: "dollars", xOne: "week", xs: "weeks", money: true,
      start: (y0) => `The card's balance was ${usd(y0)} when it was purchased.`,
    },
    {
      up: true, xLabel: "Time (weeks)", yLabel: "Height (centimeters)",
      make: (t) => ({ r: t.pick([1.5, 2, 2.5, 3, 4]), y0: t.int(3, 15) }),
      model: "the height y, in centimeters, of a plant x weeks after it was planted",
      value: (x) => `According to the model, what will the plant's height be, in centimeters, ${x} weeks after it was planted?`,
      time: (G) => `According to the model, how many weeks after it was planted will the plant be ${num(G)} centimeters tall?`,
      slope: (amount, word) => `The plant's height ${word} by ${amount} each week.`,
      unitOne: "centimeter", units: "centimeters", xOne: "week", xs: "weeks",
      start: (y0) => `The plant was ${y0} centimeters tall when it was planted.`,
    },
    {
      up: true, xLabel: "Time (months)", yLabel: "Savings (dollars)",
      make: (t) => ({ r: 5 * t.int(5, 16), y0: 10 * t.int(5, 40) }),
      model: "the amount y, in dollars, in a savings account x months after the account was opened, if the same amount is deposited each month",
      value: (x) => `According to the model, how many dollars will be in the account ${x} months after it was opened?`,
      time: (G) => `According to the model, how many months after it was opened will the account contain ${usd(G)}?`,
      slope: (amount, word) => `The amount in the account ${word} by ${amount} each month.`,
      unitOne: "dollar", units: "dollars", xOne: "month", xs: "months", money: true,
      start: (y0) => `The account held ${usd(y0)} when it was opened.`,
    },
  ];

  // The two given points of a line, with axes and labels. Drawn to scale, but
  // without tick marks, so values come from the labelled points only.
  function graphFigure(scene, y0, slope, x1, xEnd) {
    const [left, right, top, bottom] = [70, 370, 30, 250];
    const yAt = (x) => y0 + slope * x;
    const yMax = Math.max(y0, yAt(xEnd)) * 1.15;
    const sx = (x) => left + (x / (xEnd * 1.08)) * (right - left);
    const sy = (y) => bottom - (y / yMax) * (bottom - top);
    const label = (x, y, text, anchor = "start") =>
      `<text x="${Math.round(x)}" y="${Math.round(y)}" fill="currentColor" font-size="14" font-family="sans-serif" text-anchor="${anchor}">${S.escapeXml(text)}</text>`;
    const parts = [
      S.svgParts.line(left, bottom, right + 10, bottom),
      S.svgParts.line(left, bottom, left, top - 10),
      S.svgParts.line(sx(0), sy(y0), sx(xEnd), sy(yAt(xEnd))),
      S.svgParts.dot(sx(0), sy(y0)),
      S.svgParts.dot(sx(x1), sy(yAt(x1))),
      label(sx(0) + 10, sy(y0) - 8, `(0, ${num(y0)})`),
      label(sx(x1) + 10, sy(yAt(x1)) - 10, `(${x1}, ${num(yAt(x1))})`),
      label(left - 8, bottom + 16, "O", "end"),
      label((left + right) / 2, 285, scene.xLabel, "middle"),
      `<text x="22" y="${(top + bottom) / 2}" fill="currentColor" font-size="14" font-family="sans-serif" text-anchor="middle" transform="rotate(-90 22 ${(top + bottom) / 2})">${S.escapeXml(scene.yLabel)}</text>`,
    ];
    const alt =
      `A line graphed in the first quadrant, with ${scene.xLabel.toLowerCase()} on the horizontal axis and ` +
      `${scene.yLabel.toLowerCase()} on the vertical axis. The line passes through the labeled points (0, ${num(y0)}) ` +
      `and (${x1}, ${num(yAt(x1))}).`;
    return { svg: S.svg(400, 300, parts, alt), alt, notToScale: false };
  }

  /* ----------------------------------------------- linear-model-interpretation */

  // Each scene: output letter, small and big input units (big = F small),
  // start value, direction, and small-unit rates chosen so every converted
  // value prints exactly.
  const unitScenes = [
    {
      out: "V", F: 60, dir: -1, small: ["t", "minute", "minutes"], big: ["h", "hour", "hours"],
      rates: [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.75, 0.8, 0.9], start: () => [600, 1500, 10],
      model: (u) => `gives the volume V, in liters, of water in a tank ${u[0]} ${u[2]} after the tank begins to drain`,
      change: (u) => `by how many liters does the volume of water in the tank decrease each ${u[1]}`,
      after: (u) => `Gives the volume of water in the tank after 1 ${u[1]}, not the change in each ${u[1]}.`,
      input: (u) => `${u[0]}, the number of ${u[2]} after the tank begins to drain`,
      spans: { big: [1.5, 2, 2.5, 3, 4, 5], small: [15, 20, 30, 45, 50, 75, 90] },
      when: (u, X) => `how many ${u[2]} after the tank begins to drain will it contain ${commasHard(X)} liters of water`,
    },
    {
      out: "B", F: 60, dir: -1, small: ["t", "minute", "minutes"], big: ["h", "hour", "hours"],
      rates: [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4], start: () => [92, 100, 1],
      model: (u) => `gives the charge B, as a percent of full charge, of a laptop battery ${u[0]} ${u[2]} after the laptop is unplugged`,
      change: (u) => `by how many percentage points does the battery's charge decrease each ${u[1]}`,
      after: (u) => `Gives the battery's charge after 1 ${u[1]}, not the change in each ${u[1]}.`,
      input: (u) => `${u[0]}, the number of ${u[2]} after the laptop is unplugged`,
      spans: { big: [1.5, 2, 2.5, 3, 4], small: [15, 20, 30, 45, 50, 75] },
      when: (u, X) => `how many ${u[2]} after the laptop is unplugged will the battery's charge be ${num(X)} percent`,
    },
    {
      out: "D", F: 60, dir: 1, small: ["s", "second", "seconds"], big: ["m", "minute", "minutes"],
      rates: [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5], start: () => [20, 240, 5],
      model: (u) => `gives the amount D, in megabytes, of a file that has been downloaded ${u[0]} ${u[2]} after a download resumes`,
      change: (u) => `by how many megabytes does the amount downloaded increase each ${u[1]}`,
      after: (u) => `Gives the amount downloaded after 1 ${u[1]}, not the change in each ${u[1]}.`,
      input: (u) => `${u[0]}, the number of ${u[2]} after the download resumes`,
      spans: { big: [2, 3, 4, 5, 8, 10], small: [30, 45, 90, 120, 150] },
      when: (u, X) => `how many ${u[2]} after the download resumes will ${commasHard(X)} megabytes have been downloaded`,
    },
    {
      out: "H", F: 7, dir: 1, small: ["d", "day", "days"], big: ["w", "week", "weeks"],
      rates: [0.3, 0.4, 0.5, 0.6, 0.8, 1.2, 1.5], start: () => [8, 40, 1],
      model: (u) => `gives the height H, in centimeters, of a plant ${u[0]} ${u[2]} after it was first measured`,
      change: (u) => `by how many centimeters does the plant's height increase each ${u[1]}`,
      after: (u) => `Gives the plant's height after 1 ${u[1]}, not the change in each ${u[1]}.`,
      input: (u) => `${u[0]}, the number of ${u[2]} after the plant was first measured`,
      spans: { big: [2, 3, 4, 5, 6, 8], small: [5, 10, 12, 15, 20] },
      when: (u, X) => `how many ${u[2]} after it was first measured will the plant be ${num(X)} centimeters tall`,
    },
    {
      out: "C", F: 1000, dir: 1, small: ["g", "gram", "grams"], big: ["k", "kilogram", "kilograms"],
      rates: [0.004, 0.005, 0.006, 0.008, 0.012, 0.015], start: () => [3, 9, 1],
      model: (u) => `gives the cost C, in dollars, to ship a package that weighs ${u[0]} ${u[2]}`,
      change: (u) => `by how many dollars does the shipping cost increase for each additional ${u[1]} of weight`,
      after: (u) => `Gives the cost to ship a package weighing 1 ${u[1]}, not the change for each ${u[1]}.`,
      input: (u) => `${u[0]}, the weight of the package in ${u[2]}`,
      spans: { big: [1.5, 2, 2.5, 3, 4], small: [250, 500, 750, 1500] },
      when: (u, X) => `what is the weight, in ${u[2]}, of a package that costs ${usdHard(X)} to ship`,
    },
    {
      out: "C", F: 3, dir: 1, small: ["f", "foot", "feet"], big: ["y", "yard", "yards"],
      rates: [0.6, 0.8, 1.2, 1.5, 2.4, 2.5], start: () => [2, 9, 1],
      model: (u) => `gives the cost C, in dollars, of ${u[0]} ${u[2]} of rope, including a fixed cutting fee`,
      change: (u) => `by how many dollars does the cost increase for each additional ${u[1]} of rope`,
      after: (u) => `Gives the cost of 1 ${u[1]} of rope, not the change for each ${u[1]}.`,
      input: (u) => `${u[0]}, the length of rope in ${u[2]}`,
      spans: { big: [4, 5, 8, 10, 12], small: [6, 9, 12, 15, 24] },
      when: (u, X) => `how many ${u[2]} of rope cost ${usdHard(X)}`,
    },
    {
      out: "E", F: 60, dir: 1, small: ["m", "minute", "minutes"], big: ["h", "hour", "hours"],
      rates: [4, 4.5, 5, 6, 7.5, 8, 9], start: () => [1200, 5400, 50],
      model: (u) => `gives a hiker's elevation E, in feet, ${u[0]} ${u[2]} after the hiker starts a climb`,
      change: (u) => `by how many feet does the hiker's elevation increase each ${u[1]}`,
      after: (u) => `Gives the hiker's elevation after 1 ${u[1]}, not the change in each ${u[1]}.`,
      input: (u) => `${u[0]}, the number of ${u[2]} after the hiker starts the climb`,
      spans: { big: [1.5, 2, 2.5, 3, 4], small: [15, 20, 30, 45, 90] },
      when: (u, X) => `how many ${u[2]} after starting the climb will the hiker reach an elevation of ${commasHard(X)} feet`,
    },
  ];

  // Scaled-count inputs for the interpretation form: n counts groups of `size`.
  const groupScenes = [
    {
      out: "C", size: 100, group: "100 gallons", one: "gallon", counts: "hundreds of gallons", a: [1.8, 2.4, 2.6, 3.2, 3.5, 4.1], b: [18, 25, 32, 40, 45],
      desc: "the monthly cost C, in dollars, of water for a household that uses n hundred gallons of water",
      rate: (x, per) => `The monthly cost increases by ${usdHard(x)} for each additional ${per} used.`,
      total: (x, per) => `The monthly cost for ${per} of water is ${usdHard(x)}.`,
      base: (x) => `The monthly cost is ${usdHard(x)} when no water is used.`,
    },
    {
      out: "C", size: 100, group: "100 flyers", one: "flyer", counts: "hundreds of flyers", a: [3.5, 4.5, 5.2, 6.4, 7.5], b: [12, 15, 18, 24, 30],
      desc: "the cost C, in dollars, to print n hundred flyers",
      rate: (x, per) => `The cost increases by ${usdHard(x)} for each additional ${per} printed.`,
      total: (x, per) => `The cost to print ${per} is ${usdHard(x)}.`,
      base: (x) => `The cost includes a fee of ${usdHard(x)} that does not depend on the number of flyers.`,
    },
    {
      out: "C", size: 12, group: "dozen cookies", one: "cookie", counts: "dozens of cookies", a: [9, 10.5, 13.5, 15, 16.5], b: [8, 10, 14, 15, 20],
      desc: "the cost C, in dollars, of a catering order of n dozen cookies",
      rate: (x, per) => `The cost increases by ${usdHard(x)} for each additional ${per} ordered.`,
      total: (x, per) => `An order of 1 ${per} costs ${usdHard(x)}.`,
      base: (x) => `The order includes a fee of ${usdHard(x)} that does not depend on the number of cookies.`,
    },
  ];

  // "V = 900 − 0.4t" or "V = −0.4t + 900", in the scene's variable.
  function modelText(scene, rate, start, letter, rateFirst) {
    const term = `${commasHard(rate)}${letter}`;
    if (rateFirst) return `${scene.out} = ${scene.dir < 0 ? MINUS : ""}${term} + ${commasHard(start)}`;
    return `${scene.out} = ${commasHard(start)} ${scene.dir < 0 ? MINUS : "+"} ${term}`;
  }

  const pointOnLine = {
    id: "point-on-line",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "graph interpretation",
    difficulty: "Easy",
    title: "Points on the graph of a two-variable linear equation",
    recognize:
      "A point is on the graph exactly when its coordinates, x first and y second, make the equation true; a slope " +
      "says how far y moves for each step in x.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "wrong-quantity"],
    build(t) {
      const variant = t.int(0, 2);
      for (;;) {
        if (variant === 0) {
          // Which point lies on ax + by = c (or y = mx + k)?
          const slopeForm = t.chance(0.35);
          const x0 = t.nonzero(-6, 8);
          const y0 = t.nonzero(-8, 10);
          let equation;
          let wrong;
          if (slopeForm) {
            const m = t.sign() * t.int(2, 5);
            const k = y0 - m * x0;
            if (k === 0 || Math.abs(k) > 30) continue;
            equation = `y = ${lin(m, k)}`;
            wrong = [
              [point(y0, x0), "Swaps the coordinates of a point on the line."],
              [point(x0, m * x0 - k), `Uses ${num(-k)} for the constant term instead of ${num(k)}.`],
              [point(-x0, y0), `Satisfies y = ${lin(-m, k)}: the sign of the slope is lost.`],
              [point(x0 + 1, y0 + 1), "Moves one unit in each direction, which follows a slope of 1."],
            ];
          } else {
            const a = t.sign() * t.int(1, 6);
            const b = t.sign() * t.int(2, 6);
            const c = a * x0 + b * y0;
            if (c === 0 || (a < 0 && b < 0) || S.gcd(S.gcd(a, b), c) !== 1) continue;
            equation = standardForm(a, b, c);
            wrong = [
              [point(y0, x0), "Swaps the coordinates of a point on the line."],
              [point(x0, -y0), `Satisfies ${standardForm(a, -b, c)}: the sign of the y-term is flipped.`],
            ];
            if (Number.isInteger(c / a) && Number.isInteger(c / b)) {
              wrong.push([point(c / a, c / b), "Combines the x-intercept value and the y-intercept value into a single point."]);
            }
            wrong.push([point(-x0, y0), `Satisfies ${standardForm(-a, b, c)}: the sign of the x-term is flipped.`]);
            wrong.push([point(x0 + b, y0 + a), "Moves from a point on the line in a direction that leaves the line."]);
          }
          const key = point(x0, y0);
          const kept = wrong.filter(([text]) => {
            const [px, py] = readPoint(text);
            return !holds(equation, { x: px, y: py });
          });
          if (distinctWrong(key, kept) < 3) continue;
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 60,
            stimulus: { type: "equations", content: equation },
            stem: "Which of the following points lies on the graph of the given equation in the xy-plane?",
            correct: key,
            wrong: kept,
            explanation: `Substituting x = ${num(x0)} and y = ${num(y0)} makes both sides of ${equation} equal; none of the other points does.`,
            steps: [
              "Substitute each point's first coordinate for x and second coordinate for y.",
              `For ${key}: the equation holds.`,
              "Each other point makes the two sides unequal.",
            ],
            principles: ["A point lies on the graph of an equation exactly when its coordinates satisfy the equation."],
            trap: "A point with the coordinates swapped, or one that fits the equation only with a sign changed, looks right at a glance.",
            hint: "Test each point in the equation, x first.",
            verify: () => {
              const [px, py] = readPoint(key);
              return holds(equation, { x: px, y: py }) && kept.every(([text]) => {
                const [wx, wy] = readPoint(text);
                return !holds(equation, { x: wx, y: wy });
              });
            },
          };
        }
        if (variant === 1) {
          // (p, k) lies on ax + by = c; find k.
          const a = t.sign() * t.int(1, 7);
          const b = t.sign() * t.int(2, 6);
          const p = t.nonzero(-6, 8);
          const k = t.nonzero(-9, 10);
          const c = a * p + b * k;
          if (c === 0 || Math.abs(c) > 80 || (a < 0 && b < 0) || S.gcd(S.gcd(a, b), c) !== 1) continue;
          const equation = standardForm(a, b, c);
          const wrong = [];
          if (Number.isInteger((c + a * p) / b)) wrong.push([(c + a * p) / b, `Moves ${num(a * p)} across the equals sign without changing its sign.`]);
          wrong.push([c - a * p, `Stops at ${lin(b, 0, "k")} = ${num(c - a * p)}, before dividing by ${num(b)}.`]);
          if (Number.isInteger((c - b * p) / a)) wrong.push([(c - b * p) / a, `Substitutes ${num(p)} for y instead of x.`]);
          wrong.push([-k, "Loses the sign while dividing."]);
          const numeric = t.chance(0.6);
          if (!numeric && distinctWrong(k, wrong) < 3) continue;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 55,
            stimulus: { type: "equations", content: equation },
            stem: `The point ${point(p, 0).replace(/0\)$/, "k)")} lies on the graph of the given equation in the xy-plane. What is the value of k?`,
            correct: k,
            wrong: numeric ? [] : wrong,
            explanation: `Substitute x = ${num(p)}: ${num(a * p)} ${xTerm(b, "k")} = ${num(c)}, so ${lin(b, 0, "k")} = ${num(c - a * p)} and k = ${num(k)}.`,
            steps: [
              `Substitute x = ${num(p)} and y = k: ${lin(a, 0).replace("x", "")}(${num(p)}) ${xTerm(b, "k")} = ${num(c)}.`,
              `${moveText(a * p)}: ${lin(b, 0, "k")} = ${num(c - a * p)}.`,
              `Divide by ${num(b)}: k = ${num(k)}.`,
            ],
            principles: ["A point on the graph satisfies the equation, so a known coordinate can be substituted to find the other."],
            trap: "The first coordinate is x; substituting it for y answers a different question.",
            hint: "Which variable does the first coordinate replace?",
            verify: () => holds(equation, { x: p, y: k }) && !holds(equation, { x: p, y: k + 1 }),
          };
        }
        // A line described by its slope and one point; which other point is on it?
        const m = t.sign() * t.int(2, 5);
        const x0 = t.int(-5, 6);
        const y0 = t.int(-6, 8);
        const s = t.pick([2, 3, -2, 4]);
        const key = point(x0 + s, y0 + m * s);
        const wrong = [
          [point(x0 + m * s, y0 + s), "Swaps the run and the rise, moving horizontally by the slope."],
          [point(x0 + s, y0 - m * s), `Moves in the direction of a line with slope ${num(-m)}.`],
          [point(x0 + s, y0 + m), `Adds the slope to y once, although x changes by ${num(s)}.`],
          [point(s, m * s), "Starts from the origin instead of from the given point."],
        ];
        const kept = wrong.filter(([text]) => {
          const [px, py] = readPoint(text);
          return px === x0 || (py - y0) !== m * (px - x0);
        });
        if (distinctWrong(key, kept) < 3) continue;
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 65,
          stimulus: null,
          stem: `In the xy-plane, a line with slope ${num(m)} passes through the point ${point(x0, y0)}. Which of the following points also lies on the line?`,
          correct: key,
          wrong: kept,
          explanation:
            `A slope of ${num(m)} means y changes by ${num(m)} for each increase of 1 in x. Moving ${num(s)} in x from ` +
            `${point(x0, y0)} changes y by ${num(m)} · ${paren(s)} = ${num(m * s)}, reaching ${key}.`,
          steps: [
            `Slope ${num(m)}: each change of 1 in x changes y by ${num(m)}.`,
            `A change of ${num(s)} in x changes y by ${num(m * s)}.`,
            `From ${point(x0, y0)}: ${key}.`,
          ],
          principles: ["Any two points on a line give the same slope: change in y ÷ change in x."],
          trap: "Moving across by the slope and up by 1 swaps the rise and the run.",
          hint: "Check the change in y against the change in x from the given point.",
          verify: () => {
            const [kx, ky] = readPoint(key);
            const slopeTo = ([px, py]) => (px === x0 ? NaN : (py - y0) / (px - x0));
            return approx(slopeTo([kx, ky]), m) && kept.every(([text]) => !approx(slopeTo(readPoint(text)), m));
          },
        };
      }
    },
  };

  const equationModel = {
    id: "two-variable-equation-model",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "equation modeling",
    difficulty: "Medium",
    title: "Two-variable linear equation from a total",
    recognize:
      "Each quantity contributes its rate times its count, and the contributions add to the total; keep each rate " +
      "with its own variable.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "intermediate-value"],
    build(t) {
      const scene = t.pick(modelScenes);
      const askCount = t.chance(0.45);
      const numeric = t.chance(0.55);
      for (;;) {
        const v = scene.make(t);
        if (v.a === v.b) continue;
        const T = clean(v.a * v.x0 + v.b * v.y0);
        // Dollar amounts print with cents inside equations ("2.50x"), as on the test.
        const show = scene.dollars ? money : (value) => commas(value);
        const Tt = show(T);
        const eq = (a, b) => `${show(a)}x + ${show(b)}y = ${Tt}`;
        if (!askCount) {
          const key = eq(v.a, v.b);
          const pool = [
            [eq(v.b, v.a), "Attaches each rate to the other quantity."],
            [`x + y = ${Tt}`, `Adds the counts, but ${Tt} is a total of ${scene.totalNoun}, not a number of ${scene.xs} and ${scene.ys}.`],
            [`${show(clean(v.a + v.b))}(x + y) = ${Tt}`, "Applies both rates to every item."],
            [`x/${show(v.a)} + y/${show(v.b)} = ${Tt}`, "Divides each count by its rate instead of multiplying."],
          ];
          const wrong = [pool[0], ...t.sample(pool.slice(1), 3)];
          const pairs = [[v.x0, v.y0], [0, T / v.b], [T / v.a, 0]];
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 75,
            stimulus: null,
            stem: `${scene.text(v, T)} Which equation represents this situation, where ${scene.defs}?`,
            correct: key,
            wrong,
            explanation:
              `The ${scene.xs} contribute ${show(v.a)}x ${scene.totalNoun} and the ${scene.ys} contribute ${show(v.b)}y; ` +
              `together they make ${Tt}, so ${key}.`,
            steps: [
              `${scene.xs.charAt(0).toUpperCase()}${scene.xs.slice(1)}: ${show(v.a)} for each, so ${show(v.a)}x.`,
              `${scene.ys.charAt(0).toUpperCase()}${scene.ys.slice(1)}: ${show(v.b)} for each, so ${show(v.b)}y.`,
              `The two parts add to the total: ${key}.`,
            ],
            principles: ["When each item contributes a fixed amount, a total is the sum of rate × count over the item types."],
            trap: "The rates must stay with the variables they describe; swapping them gives an equation that looks just as reasonable.",
            hint: "Write the contribution of one kind of item first.",
            verify: () =>
              pairs.every(([x, y]) => holds(key, { x, y })) &&
              wrong.every(([text]) => !pairs.every(([x, y]) => holds(text, { x, y }))),
          };
        }
        const key = v.y0;
        const left = clean(T - v.a * v.x0);
        const wrong = [[left, `Gives the ${scene.leftover}, not the number of ${scene.ys}.`]];
        const swapped = (T - v.b * v.x0) / v.a;
        if (whole(swapped) && swapped > 0) wrong.push([clean(swapped), "Uses each rate for the other quantity."]);
        const lazy = T / v.b - v.x0;
        if (whole(lazy) && lazy > 0) wrong.push([clean(lazy), `Divides the total by ${num(v.b)} and then subtracts the ${v.x0} ${scene.xs}.`]);
        const plus = (T + v.a * v.x0) / v.b;
        if (whole(plus)) wrong.push([clean(plus), `Adds the ${scene.xs}' share to the total instead of subtracting it.`]);
        if (!numeric && distinctWrong(key, wrong) < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 80,
          stimulus: null,
          stem: `${scene.text(v, T)} ${scene.given(v.x0)}`,
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation:
            `The situation is ${eq(v.a, v.b)}. With x = ${v.x0}: ${show(v.a)}(${v.x0}) + ${show(v.b)}y = ${Tt}, so ` +
            `${show(v.b)}y = ${show(left)} and y = ${key}.`,
          steps: [
            `Model: ${eq(v.a, v.b)}.`,
            `Substitute x = ${v.x0}: ${show(v.b)}y = ${Tt} ${MINUS} ${show(clean(v.a * v.x0))} = ${show(left)}.`,
            `Divide by ${show(v.b)}: y = ${key}.`,
          ],
          principles: ["Substituting a known count into a two-variable model leaves a one-variable equation."],
          trap: `${num(left)} is the ${scene.leftover}; dividing by ${num(v.b)} turns it into a count.`,
          hint: `How much of the total is left for the ${scene.ys}?`,
          verify: () => {
            const scale = 100;
            const found = [];
            for (let y = 0; y <= 1000; y += 1) {
              if (Math.round(v.a * scale) * v.x0 + Math.round(v.b * scale) * y === Math.round(T * scale)) found.push(y);
            }
            return found.length === 1 && found[0] === key;
          },
        };
      }
    },
  };

  const graphContext = {
    id: "linear-graph-context",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "graph interpretation",
    difficulty: "Medium",
    title: "Reading a context line through two labeled points",
    recognize:
      "The point at x = 0 is the starting amount and the change between the two points, divided by the change in x, " +
      "is the rate; the question then needs one more step from the start, not from the second point.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity", "sign-error"],
    build(t) {
      const form = t.pick(["value", "time", "slope"]);
      const showFigure = t.chance(0.5);
      const numeric = t.chance(0.45);
      for (;;) {
        const scene = t.pick(graphScenes);
        const made = scene.make(t);
        if (!made) continue;
        const { r, y0 } = made;
        const dir = scene.up ? 1 : -1;
        const slope = dir * r;
        const n = scene.up ? null : y0 / r;
        if (!scene.up && (!Number.isInteger(n) || n < 5)) continue;
        const x1 = scene.up ? t.int(2, 6) : t.int(2, n - 2);
        const y1 = clean(y0 + slope * x1);
        const pts = `(0, ${num(y0)}) and (${x1}, ${num(y1)})`;
        const xEnd = scene.up ? Math.max(x1 * 2, 8) : n;
        const figure = showFigure ? graphFigure(scene, y0, slope, x1, xEnd) : null;
        const lead = showFigure
          ? `The graph shows a linear model of ${scene.model}.`
          : `The graph of a line in the xy-plane models ${scene.model}. The line passes through the points ${pts}.`;
        const rateWork = `(${num(y1)} ${MINUS} ${num(y0)}) ÷ (${x1} ${MINUS} 0) = ${num(slope)}`;
        const verifyLine = () => {
          const m = (y1 - y0) / x1;
          return { m, f: (x) => y0 + m * x };
        };
        if (form === "slope") {
          const amount = (value) => (scene.money ? usd(value) : `${num(value)} ${value === 1 ? scene.unitOne : scene.units}`);
          const word = scene.up ? "increases" : "decreases";
          const key = scene.slope(amount(r), word);
          const change = clean(r * x1);
          const invText = scene.money ? `$${frac(1, 1)}/${num(r)}` : `${frac(1, 1)}/${num(r)} ${scene.unitOne}`;
          const wrong = [
            [scene.slope(amount(change), word), `Uses the change from x = 0 to x = ${x1}, ${num(change)}, as the change for a single ${scene.xOne}.`],
            [scene.slope(amount(r), scene.up ? "decreases" : "increases"), "Gets the size of the slope right but its direction wrong."],
            [scene.slope(invText, word), "Divides the change in x by the change in y."],
            [scene.start(y0), "Describes the y-intercept, not the slope."],
          ];
          if (!Number.isInteger(r) && scene.money) continue;
          if (change === r || x1 === 1) continue;
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 85,
            stimulus: null,
            figure,
            stem: `${lead} Which of the following is the best interpretation of the slope of the line in this context?`,
            correct: key,
            // "$1/75 each month" is not a plausible choice; money scenes use the intercept instead.
            wrong: !scene.money && t.chance(0.5) ? wrong.slice(0, 3) : [wrong[0], wrong[1], wrong[3]],
            explanation:
              `The slope is ${rateWork}. It is the change in y for each increase of 1 in x, so ${key.charAt(0).toLowerCase()}${key.slice(1)}`,
            steps: [
              `Slope: ${rateWork}.`,
              `y is measured in ${scene.units} and x in ${scene.xs}, so the slope is in ${scene.units} per ${scene.xOne}.`,
              `A ${scene.up ? "positive" : "negative"} slope means the amount ${word}.`,
            ],
            principles: ["The slope of a linear model is the change in the output for each increase of 1 in the input."],
            trap: `${num(change)} is the change over ${x1} ${scene.xs}; the slope is the change over one.`,
            hint: `How much does y change when x goes up by 1?`,
            verify: () => {
              const { m } = verifyLine();
              return approx(Math.abs(m), r) && Math.sign(m) === dir && key.includes(scene.up ? "increases" : "decreases");
            },
          };
        }
        if (form === "value") {
          const x2 = scene.up ? x1 + t.int(2, 8) : t.int(2, n - 1);
          if (x2 === x1) continue;
          const key = clean(y0 + slope * x2);
          const wrong = [
            [r, `Gives the rate of change per ${scene.xOne}, not the amount after ${x2} ${scene.xs}.`],
            [clean(y0 - slope * x2), `${scene.up ? "Subtracts" : "Adds"} the change instead of ${scene.up ? "adding" : "subtracting"} it.`],
            [clean(y1 + slope * x2), `Starts from the point at x = ${x1} instead of from x = 0.`],
            [clean(r * x2), `Gives the change after ${x2} ${scene.xs}, not the amount then.`],
          ].filter(([value]) => value >= 0);
          if (!numeric && distinctWrong(key, wrong) < 3) continue;
          return commaChoices({
            responseType: responseFor(numeric, key),
            estimatedSeconds: 85,
            stimulus: null,
            figure,
            stem: `${lead} ${scene.value(x2)}`,
            correct: key,
            wrong,
            explanation: `The slope is ${rateWork}, so the model is y = ${num(y0)} ${signed(slope).replace(/ (\S+)$/, " $1")}x. At x = ${x2}, y = ${num(y0)} ${signed(clean(slope * x2))} = ${num(key)}.`,
            steps: [
              `Rate: ${rateWork} per ${scene.xOne}.`,
              `Model: y = ${lin(slope, y0)}.`,
              `At x = ${x2}: y = ${num(y0)} ${signed(clean(slope * x2))} = ${num(key)}.`,
            ],
            principles: ["A linear model is its starting value plus its rate times the input."],
            trap: `The rate ${num(r)} is on the way, and the change must be counted from x = 0, not from x = ${x1}.`,
            hint: "Find how much y changes per unit of x first.",
            verify: () => approx(verifyLine().f(x2), key),
          });
        }
        let G;
        let key;
        if (scene.up) {
          key = x1 + t.int(3, 10);
          G = clean(y0 + slope * key);
        } else if (t.chance(0.5)) {
          key = n;
          G = 0;
        } else {
          key = t.int(x1 + 1, n - 1);
          G = clean(y0 + slope * key);
        }
        if (key === x1) continue;
        const wrong = [
          [r, `Gives the rate of change per ${scene.xOne}, not a number of ${scene.xs}.`],
          [clean(Math.abs(G - y0)), `Gives the change in ${scene.units}, not the time it takes.`],
          [clean((G - y1) / slope), `Counts the time from x = ${x1} instead of from x = 0.`],
        ];
        if (scene.up) wrong.push([clean(G / r), "Divides the target by the rate, ignoring the starting amount."]);
        else wrong.push([clean(y1 / r), `Gives the time from x = ${x1} until the amount reaches 0.`]);
        const kept = wrong.filter(([value]) => value > 0 && terminates(value));
        if (!numeric && distinctWrong(key, kept) < 3) continue;
        return commaChoices({
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 90,
          stimulus: null,
          figure,
          stem: `${lead} ${scene.time(G)}`,
          correct: key,
          wrong: kept,
          explanation:
            `The slope is ${rateWork}, so y = ${lin(slope, y0)}. Setting y = ${commas(G)} gives ${lin(slope, 0)} = ` +
            `${commas(clean(G - y0))}, so x = ${key}.`,
          steps: [
            `Rate: ${rateWork}.`,
            `Model: y = ${lin(slope, y0)}.`,
            `Solve ${lin(slope, y0)} = ${commas(G)}: x = ${key}.`,
          ],
          principles: ["Solving a linear model for its input answers a when question."],
          trap: `The change in ${scene.units} and the rate are both on the way; the answer is a number of ${scene.xs}, counted from x = 0.`,
          hint: "Write the model, then set it equal to the target amount.",
          verify: () => {
            const { f } = verifyLine();
            for (let x = 0; x <= 500; x += 1) if (approx(f(x), G)) return x === key;
            return false;
          },
        });
      }
    },
  };

  const linearModelUnits = {
    id: "linear-model-interpretation",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "equation modeling",
    title: "Linear model read in a different unit",
    recognize:
      "The coefficient is a rate in the model's own input unit; before interpreting or rewriting it, convert that " +
      "rate to the unit the question uses, and leave the starting value alone.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["unit-mismatch", "wrong-quantity", "equivalent-form"],
    build(t) {
      const variant = t.int(0, 2);

      if (variant === 1) {
        // Interpretation of a number in a model whose input counts groups.
        const scene = t.pick(groupScenes);
        const a = t.pick(scene.a);
        // Distinct values, so "the interpretation of 12" can only mean one number.
        const b = t.pick(scene.b.filter((value) => value !== a));
        const equation = t.chance(0.5) ? `C = ${num(a)}n + ${num(b)}` : `C = ${num(b)} + ${num(a)}n`;
        const aboutRate = t.chance(0.7);
        const perOne = `${scene.one}`;
        let key;
        let wrong;
        let claims;
        if (aboutRate) {
          key = scene.rate(a, scene.group);
          wrong = [
            [scene.rate(clean(a + b), scene.group), `Treats the cost for the first ${scene.group}, which includes the fixed ${usdHard(b)}, as the rate.`],
            [scene.rate(a, perOne), `Reads ${num(a)} per ${scene.one}, but n counts groups of ${scene.size}.`],
            [scene.total(a, scene.group), `Confuses the rate with a total: C is ${usdHard(clean(a + b))}, not ${usdHard(a)}, when n = 1.`],
            [scene.rate(clean(a * scene.size), perOne), `Converts in the wrong direction, multiplying by ${scene.size} instead of dividing.`],
          ];
          claims = { key: ["rate", 1, a], wrong: [["rate", 1, clean(a + b)], ["rate", 1 / scene.size, a], ["total", 1, a], ["rate", 1 / scene.size, clean(a * scene.size)]] };
        } else {
          key = scene.base(b);
          wrong = [
            [scene.rate(b, scene.group), `Treats the fixed amount ${usdHard(b)} as the rate for each ${scene.group}.`],
            [scene.total(b, scene.group), `Takes ${usdHard(b)} as the cost when n = 1; it is the cost when n = 0.`],
            [scene.rate(b, perOne), `Treats ${usdHard(b)} as a rate, and per ${scene.one} rather than per ${scene.group}.`],
          ];
          claims = { key: ["base", 0, b], wrong: [["rate", 1, b], ["total", 1, b], ["rate", 1 / scene.size, b]] };
        }
        const model = compileHard(equation.split(" = ")[1]);
        const holds = ([kind, step, amount]) => {
          if (kind === "base") return approx(model({ n: 0 }), amount);
          if (kind === "total") return approx(model({ n: step }), amount);
          return approx(model({ n: 2.5 + step }) - model({ n: 2.5 }), amount);
        };
        const number = aboutRate ? a : b;
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 80,
          stimulus: null,
          stem: `The equation ${equation} gives ${scene.desc}. Which of the following is the best interpretation of ${num(number)} in this context?`,
          correct: key,
          wrong,
          explanation: aboutRate
            ? `${num(a)} is the coefficient of n, so it is the change in C when n increases by 1. Because n counts ` +
              `groups of ${scene.size}, that is a change of ${usdHard(a)} for each additional ${scene.group}.`
            : `${num(b)} is the value of C when n = 0, the part of the cost that does not depend on how much is bought or used.`,
          steps: aboutRate
            ? [
              `In C = ${num(a)}n + ${num(b)}, the coefficient of n is the change in C per unit of n.`,
              `n counts ${scene.counts}, so an increase of 1 in n means ${scene.size} more ${scene.one}s, not 1 more ${scene.one}.`,
              `So C increases by ${usdHard(a)} for each additional ${scene.group}.`,
            ]
            : [
              `Set n = 0: C = ${num(b)}.`,
              `n = 0 means nothing is bought or used, so ${usdHard(b)} does not depend on n.`,
              `The coefficient ${num(a)}, not ${num(b)}, is the rate for each ${scene.group}.`,
            ],
          principles: [
            "In y = mx + b, m is the change in y per 1 unit of x, in whatever unit x is measured.",
            "b is the value of y when x = 0.",
          ],
          trap: `n counts ${scene.counts}, so the rate is per ${scene.group}, not per ${scene.one}; and a rate is not a total.`,
          hint: "Ask what one unit of n is.",
          verify: () => holds(claims.key) && claims.wrong.every((claim) => !holds(claim)),
        };
      }

      for (;;) {
        const scene = t.pick(unitScenes);
        const rate = t.pick(scene.rates);
        const big = clean(rate * scene.F);
        const [low, high, step] = scene.start();
        const start = low + step * t.int(0, Math.floor((high - low) / step));
        // up: model in the small unit, question in the big one (multiply).
        const up = t.chance(0.6);
        const [modelUnit, askUnit] = up ? [scene.small, scene.big] : [scene.big, scene.small];
        const coefficient = up ? rate : big;
        const key = up ? big : rate;
        const wrongWay = up ? clean(rate / scene.F) : clean(big * scene.F);
        const rateFirst = t.chance(0.4);
        const model = modelText(scene, coefficient, start, modelUnit[0], rateFirst);
        const intro = `The equation ${model} ${scene.model(modelUnit)}.`;
        const verb = up ? "multiplying" : "dividing";
        const inverse = up ? "dividing" : "multiplying";

        if (variant === 0 && t.chance(0.5)) {
          // When is a level reached? Solve in the model's unit, answer in the other.
          const span = t.pick(up ? scene.spans.big : scene.spans.small);
          const modelSpan = clean(up ? span * scene.F : span / scene.F);
          const level = clean(start + scene.dir * coefficient * modelSpan);
          if (level <= 0 || !exact(level) || !exact(modelSpan)) continue;
          const convert = (value) => clean(up ? value / scene.F : value * scene.F);
          const wrong = [
            [modelSpan, `Solves correctly but stops in ${modelUnit[2]}, the unit in the model.`],
            [convert(level / coefficient), `Divides ${commasHard(level)} by the rate, ignoring the starting value ${commasHard(start)}.`],
            [clean(up ? modelSpan * scene.F : modelSpan / scene.F), `Converts ${modelUnit[2]} to ${askUnit[2]} by ${verb} by ${commasHard(scene.F)} instead of ${inverse}.`],
            [convert((start + level) / coefficient), `Adds ${commasHard(start)} and ${commasHard(level)} instead of finding the change between them.`],
          ].filter(([value]) => value > 0 && exact(value));
          if (distinctWrongHard(span, wrong) < 3) continue;
          const numeric = fitsGridHard(span) && t.chance(0.6);
          const changeAmount = clean(Math.abs(level - start));
          const unitLine = up
            ? `${commasHard(modelSpan)} ${modelUnit[2]} ÷ ${scene.F} = ${num(span)} ${askUnit[2]}`
            : `${num(modelSpan)} ${modelUnit[2]} × ${commasHard(scene.F)} = ${commasHard(span)} ${askUnit[2]}`;
          return commaChoicesHard({
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 105,
            stimulus: null,
            stem: `${intro} According to the equation, ${scene.when(askUnit, level)}?`,
            correct: span,
            wrong,
            explanation:
              `Set the expression equal to ${commasHard(level)}: the change from ${commasHard(start)} is ${commasHard(changeAmount)}, and at ` +
              `${num(coefficient)} per ${modelUnit[1]} that takes ${commasHard(changeAmount)} ÷ ${num(coefficient)} = ` +
              `${commasHard(modelSpan)} ${modelUnit[2]}. In ${askUnit[2]}, that is ${unitLine}.`,
            steps: [
              `Set ${model.split(" = ")[1]} equal to ${commasHard(level)}.`,
              `Solve: ${modelUnit[0]} = ${commasHard(changeAmount)} ÷ ${num(coefficient)} = ${commasHard(modelSpan)} ${modelUnit[2]}.`,
              `Convert to the unit asked for: ${unitLine}.`,
            ],
            principles: [
              "Solving a linear model for its input gives the input in the model's own unit.",
              "Convert a quantity only after it is found, and check the direction: more small units, fewer large ones.",
            ],
            trap: `Solving the equation gives ${num(modelSpan)} ${modelUnit[2]}; the question asks in ${askUnit[2]}.`,
            hint: "Check which unit the model's input uses before you answer.",
            verify: () => {
              const f = compileHard(model.split(" = ")[1]);
              const back = up ? span * scene.F : span / scene.F;
              return approx(f({ [modelUnit[0]]: back }), level, 1e-9) &&
                !approx(f({ [modelUnit[0]]: back + 1 }), level, 1e-9);
            },
          });
        }

        if (variant === 0) {
          const after = clean(start + scene.dir * key);
          const wrong = [
            [coefficient, `Gives the change per ${modelUnit[1]}, the unit in the model, not per ${askUnit[1]}.`],
            [wrongWay, `Converts by ${inverse} by ${commasHard(scene.F)} instead of ${verb}.`],
            [after, scene.after(askUnit)],
          ].filter(([value]) => exact(value));
          if (distinctWrongHard(key, wrong) < 3) continue;
          const numeric = fitsGridHard(key) && t.chance(0.6);
          const factorWord = `${commasHard(scene.F)} ${scene.small[2]} in 1 ${scene.big[1]}`;
          return commaChoicesHard({
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 80,
            stimulus: null,
            stem: `${intro} According to the equation, ${scene.change(askUnit)}?`,
            correct: key,
            wrong,
            explanation:
              `The coefficient ${num(coefficient)} is the change per ${modelUnit[1]}. There are ${factorWord}, so the ` +
              `change per ${askUnit[1]} is ${num(coefficient)} ${up ? "×" : "÷"} ${commasHard(scene.F)} = ${num(key)}.`,
            steps: [
              `Read the rate in the model's unit: ${num(coefficient)} per ${modelUnit[1]}.`,
              `Relate the units: ${factorWord}.`,
              `Convert: ${num(coefficient)} ${up ? "×" : "÷"} ${commasHard(scene.F)} = ${num(key)} per ${askUnit[1]}.`,
            ],
            principles: [
              "The coefficient of a linear model is the change in output per 1 unit of the input, in the input's own unit.",
              "A rate per small unit becomes a rate per large unit by multiplying by the number of small units in the large one.",
            ],
            trap: `The equation's ${num(coefficient)} is per ${modelUnit[1]}; the question asks per ${askUnit[1]}.`,
            hint: "Check which unit the model's input uses.",
            verify: () => {
              const f = compileHard(model.split(" = ")[1]);
              const per = up ? scene.F : 1 / scene.F;
              const at = (value) => f({ [modelUnit[0]]: value });
              return approx(Math.abs(at(3 + per) - at(3)), key, 1e-9) && approx(at(0), start);
            },
          });
        }

        // Which equation expresses the model in the other unit.
        const newLetter = askUnit[0];
        const eq = (value, first) => modelText(scene, value, first, newLetter, rateFirst);
        const keyEq = eq(key, start);
        const scaledStart = up ? start * scene.F : clean(start / scene.F);
        const candidates = [
          [eq(coefficient, start), `Keeps the per-${modelUnit[1]} rate while switching the variable to ${askUnit[2]}.`],
          [eq(wrongWay, start), `Converts the rate by ${inverse} by ${commasHard(scene.F)} instead of ${verb}.`],
          [eq(key, scaledStart), `Converts the starting value as well as the rate; ${commasHard(start)} stays the same when the input's unit changes.`],
        ];
        const exactValues = [coefficient, wrongWay, key];
        const wrong = candidates.filter((entry, index) => exact(index === 2 ? scaledStart : exactValues[index]));
        if (distinctWrongHard(keyEq, wrong) < 3) continue;
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 85,
          stimulus: null,
          stem: `${intro} Which equation gives ${scene.out} in terms of ${scene.input(askUnit)}?`,
          correct: keyEq,
          wrong,
          explanation:
            `${num(coefficient)} per ${modelUnit[1]} is ${num(key)} per ${askUnit[1]}, because ` +
            `${up ? `1 ${askUnit[1]} = ${commasHard(scene.F)} ${modelUnit[2]}` : `1 ${askUnit[1]} = 1/${commasHard(scene.F)} ${modelUnit[1]}`}. ` +
            `The starting value ${commasHard(start)} is the same in any unit, so ${keyEq}.`,
          steps: [
            `Express the old input in the new unit: ${modelUnit[0]} = ${up ? `${commasHard(scene.F)}${newLetter}` : `${newLetter}/${commasHard(scene.F)}`}.`,
            `Substitute: the rate term becomes ${num(coefficient)} · ${up ? `${commasHard(scene.F)}${newLetter}` : `${newLetter}/${commasHard(scene.F)}`} = ${num(key)}${newLetter}.`,
            `Keep the constant: ${keyEq}.`,
          ],
          principles: [
            "Changing the unit of the input rescales the coefficient, not the constant term.",
            "Substituting the unit relationship into the model is safer than guessing which way to convert.",
          ],
          trap: "Scaling every term of the equation, or converting in the wrong direction, gives an equation that looks right but is not equivalent.",
          hint: `Write the old variable, ${modelUnit[0]}, in terms of the new one, ${newLetter}.`,
          verify: () => {
            const oldModel = compileHard(model.split(" = ")[1]);
            const newModel = compileHard(keyEq.split(" = ")[1]);
            const others = candidates.map(([text]) => compileHard(text.split(" = ")[1]));
            const toOld = (value) => (up ? value * scene.F : value / scene.F);
            const values = [1.5, 2, 4.25];
            const agrees = (fn) => values.every((value) => approx(fn({ [newLetter]: value }), oldModel({ [modelUnit[0]]: toOld(value) })));
            return agrees(newModel) && others.every((fn) => !agrees(fn));
          },
        };
      }
    },
  };

  /* ------------------------------------------------------------ standard-form-slope */

  const standardFormSlope = {
    id: "standard-form-slope",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "graph interpretation",
    difficulty: "Easy",
    title: "Slope and slope-intercept form of a standard-form equation",
    recognize:
      "Solving ax + by = c for y gives y = (−a/b)x + c/b: the slope is the x-coefficient over the y-coefficient with " +
      "the sign changed, and every term, the constant included, is divided by b.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "equivalent-form"],
    build(t) {
      const askForm = t.chance(0.45);
      for (;;) {
        const a = t.int(1, 9);
        const b = t.nonzero(-9, 9);
        if (Math.abs(b) < 2 || a === Math.abs(b)) continue;
        const k = t.nonzero(-9, 9);
        const c = b * k;
        const equation = standardForm(a, b, c);
        const slope = frac(-a, b);
        const slopeValue = -a / b;
        const numeric = !askForm && fitsGrid(slopeValue) && t.chance(0.6);
        const solved = `y = ${slopeTerm(-a, b)} ${signed(k)}`;
        const steps = [
          `${moveText(a, "x")}: ${lin(b, 0, "y")} = ${lin(-a, c)}.`,
          `Divide every term by ${num(b)}: ${solved}.`,
        ];
        let key;
        let wrong;
        if (askForm) {
          key = solved;
          wrong = t.shuffle([
            [`y = ${slopeTerm(a, b)} ${signed(k)}`, `Moves ${lin(a, 0)} to the right side without changing its sign.`],
            [`y = ${slopeTerm(-a, b)} ${signed(c)}`, `Divides the x-term by ${num(b)} but not the constant.`],
            [`y = ${lin(-a, k)}`, `Divides the constant by ${num(b)} but not the x-term.`],
            [`y = ${slopeTerm(-b, a)} ${signed(k)}`, "Inverts the coefficient of x when dividing."],
          ]);
        } else {
          key = numeric ? slopeValue : slope;
          steps.push(`The slope is the coefficient of x: ${slope}.`);
          wrong = [
            [frac(a, b), "Divides the x-coefficient by the y-coefficient without changing the sign."],
            ...t.shuffle([
              [frac(-b, a), "Divides the y-coefficient by the x-coefficient, which inverts the slope."],
              [num(k), `Gives ${num(k)}, the y-intercept, instead of the slope.`],
              [num(-a), `Takes the opposite of the x-coefficient as the slope without dividing by ${num(b)}.`],
            ]),
          ];
        }
        if (!numeric && distinctWrong(key, wrong) < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 60,
          stimulus: { type: "equations", content: equation },
          stem: askForm
            ? "Which equation is equivalent to the given equation?"
            : "What is the slope of the graph of the given equation in the xy-plane?",
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation: `Solving for y gives ${solved}.${askForm ? "" : ` The slope is the coefficient of x, ${slope}.`}`,
          steps,
          principles: [
            "Solving ax + by = c for y gives y = (−a/b)x + c/b, whose slope is −a/b.",
            "Dividing an equation by a number divides every term on both sides.",
          ],
          trap: askForm
            ? `Every term, including the constant ${num(c)}, must be divided by ${num(b)}, and ${lin(a, 0)} changes sign when it moves.`
            : `The slope is ${slope}, not ${frac(a, b)}: moving ${lin(a, 0)} across the equals sign changes its sign.`,
          hint: "Get y by itself on one side.",
          verify: () => {
            if (!askForm) {
              const [A, B] = lineCoefficients(equation);
              return approx(-A / B, slopeValue);
            }
            // A choice is equivalent when every point it produces satisfies the given equation.
            const same = (text) => {
              const f = compile(text.replace(/^y = /, ""));
              return [-3, 0, 2, 5].every((x) => holds(equation, { x, y: f({ x }) }));
            };
            return same(key) && wrong.every(([text]) => !same(text));
          },
        };
      }
    },
  };

  /* --------------------------------------------------------------- line-point-shift */

  // "4p − 5q = 17": the given equation written for a point named with other letters.
  const inLetters = (a, b, c, u, v) => `${lin(a, 0, u)} ${b < 0 ? MINUS : "+"} ${lin(Math.abs(b), 0, v)} = ${num(c)}`;

  const pointShift = {
    id: "line-point-shift",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "graph interpretation",
    difficulty: "Hard",
    title: "Change in one coordinate forced by a change in the other along a line",
    recognize:
      "Two points on ax + by = c satisfy it with the same c, so subtracting the two statements leaves " +
      "a(change in x) + b(change in y) = 0: the unknown starting point and the constant drop out, and only the ratio " +
      "of the coefficients matters.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "neighbouring-rule", "intermediate-value"],
    build(t) {
      const form = t.pick(["rise", "run", "choice"]);
      const numeric = form !== "choice" && t.chance(0.45);
      for (;;) {
        const a = t.int(2, 9);
        const b = t.nonzero(-9, 9);
        if (Math.abs(b) < 2 || a === Math.abs(b) || S.gcd(a, b) !== 1) continue;
        const c = t.nonzero(-40, 40);
        const equation = standardForm(a, b, c);
        const slope = frac(-a, b);
        const bSign = b < 0 ? MINUS : "+";
        let key;
        let wrong;
        let stem;
        let steps;
        let shift;
        if (form === "rise") {
          const dx = Math.abs(b) * t.int(1, 3);
          const dy = (-a * dx) / b;
          shift = [dx, null];
          key = dy;
          stem =
            `In the xy-plane, the points (p, q) and (p + ${dx}, q + r) lie on the graph of the given equation, where p, q, ` +
            "and r are constants. What is the value of r?";
          wrong = [
            [(a * dx) / b, `Uses a slope of ${frac(a, b)}; solving the equation for y shows the slope is ${slope}.`],
            ...t.shuffle([
              [frac(-b * dx, a), `Uses ${frac(-b, a)}, the change in x for each unit of y, as the slope.`],
              [-a * dx, `Stops at ${lin(b, 0, "r")} = ${num(-a * dx)} without dividing by ${num(b)}.`],
              [frac(c - a * dx, b), `Substitutes (${dx}, r) into the equation, as if the shift were itself a point on the line.`],
            ]),
          ];
          steps = [
            `Both points satisfy the equation: ${inLetters(a, b, c, "p", "q")} and ${a}(p + ${dx}) ${bSign} ${Math.abs(b)}(q + r) = ${num(c)}.`,
            `Subtract the first from the second; p, q, and ${num(c)} drop out: ${a}(${dx}) ${bSign} ${Math.abs(b)}r = 0.`,
            `So ${lin(b, 0, "r")} = ${num(-a * dx)} and r = ${num(dy)}.`,
          ];
        } else if (form === "run") {
          const dy = a * t.nonzero(-3, 3);
          const dx = (-b * dy) / a;
          shift = [null, dy];
          key = dx;
          stem =
            `In the xy-plane, the points (p, q) and (p + r, q ${signed(dy)}) lie on the graph of the given equation, where p, ` +
            "q, and r are constants. What is the value of r?";
          wrong = [
            [(b * dy) / a, `Uses a slope of ${frac(a, b)}; solving the equation for y shows the slope is ${slope}.`],
            ...t.shuffle([
              [frac(-a * dy, b), `Multiplies the change in y by the slope, ${slope}, instead of dividing by it.`],
              [-b * dy, `Stops at ${lin(a, 0, "r")} = ${num(-b * dy)} without dividing by ${a}.`],
              [frac(c - b * dy, a), `Substitutes (r, ${num(dy)}) into the equation, as if the shift were itself a point on the line.`],
            ]),
          ];
          steps = [
            `Both points satisfy the equation: ${inLetters(a, b, c, "p", "q")} and ${a}(p + r) ${bSign} ${Math.abs(b)}(q ${signed(dy)}) = ${num(c)}.`,
            `Subtract the first from the second; p, q, and ${num(c)} drop out: ${a}r ${signed(b * dy)} = 0.`,
            `So ${a}r = ${num(-b * dy)} and r = ${num(dx)}.`,
          ];
        } else {
          const dx = Math.abs(b);
          const dy = (-a * dx) / b;
          const shiftText = (h, v) => `(s ${signed(h)}, t ${signed(v)})`;
          key = shiftText(dx, dy);
          wrong = t.shuffle([
            [shiftText(dx, -dy), `Moves along a slope of ${frac(a, b)}; the slope of the line is ${slope}.`],
            [shiftText(a, -b), `Moves along a slope of ${frac(-b, a)}, which inverts the slope ${slope}.`],
            [shiftText(a, b), `Moves ${a} units in x and ${num(b)} in y, using the coefficients as the step.`],
          ]);
          stem =
            "If the point (s, t) lies on the graph of the given equation in the xy-plane, which of the following points " +
            "must also lie on the graph?";
          steps = [
            `Solve for y: the slope of the line is ${slope}.`,
            `Moving ${dx} units in x along the line changes y by (${slope})(${dx}) = ${num(dy)}.`,
            `So ${key} is on the graph whenever (s, t) is.`,
          ];
        }
        if (!numeric && distinctWrongHard(key, wrong) < 3) continue;
        if (typeof key === "number" && !fitsGridHard(key)) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 110,
          stimulus: { type: "equations", content: equation },
          stem,
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation:
            `Any two points on the line differ by a step whose rise over run is the slope, ${slope}. ${steps.slice(-2).join(" ")}`,
          steps,
          principles: [
            "Points on the line ax + by = c differ by steps whose change in y divided by change in x is −a/b.",
            "Subtracting two true equations with the same constant removes the constant.",
          ],
          trap: `Neither the starting point nor the constant ${num(c)} matters, and the slope is ${slope}, not ${frac(a, b)}.`,
          hint: "Write what it means for each point to lie on the graph, then compare the two statements.",
          verify: () => {
            // Put a concrete point on the displayed line and test the shifted point in the displayed equation.
            const [A, B, Cc] = lineCoefficients(equation);
            const on = (x, y) => holds(equation, { x, y });
            return [1.25, -3.5].every((x0) => {
              const y0 = (Cc - A * x0) / B;
              if (form === "rise") return on(x0 + shift[0], y0 + key);
              if (form === "run") return on(x0 + key, y0 + shift[1]);
              const step = (text) => {
                const [, hs, h, vs, v] = text.match(/^\(s ([+−]) (\d+), t ([+−]) (\d+)\)$/);
                return [(hs === "+" ? 1 : -1) * Number(h), (vs === "+" ? 1 : -1) * Number(v)];
              };
              const moved = (text) => on(x0 + step(text)[0], y0 + step(text)[1]);
              return moved(key) && wrong.every(([text]) => !moved(text));
            });
          },
        };
      }
    },
  };

  return [pointOnLine, standardFormSlope, equationModel, graphContext, linearModelUnits, pointShift];
});
