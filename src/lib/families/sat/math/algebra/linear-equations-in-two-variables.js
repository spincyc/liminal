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

  /* ---------------------------------------------------------------- helpers */

  // True when a modelled mistake prints the same as the key. Such a draw is
  // redrawn rather than silently losing the distractor: a wrong method must
  // never land on the credited answer.
  const collides = (key, wrong) => wrong.some(([value]) => S.label(value) === S.label(key));

  // Three wrong answers from a pool of modelled mistakes with numeric values,
  // chosen so the key is the smallest or largest choice about half the time
  // and sits between distractors otherwise. A test-wise student who always
  // eliminates the extremes, or always picks them, gains nothing.
  function spreadAround(t, key, pool) {
    const seen = new Set([S.label(key)]);
    const unique = pool.filter(([value]) => {
      const text = S.label(value);
      if (seen.has(text) || !Number.isFinite(value)) return false;
      seen.add(text);
      return true;
    });
    const below = t.shuffle(unique.filter(([value]) => value < key));
    const above = t.shuffle(unique.filter(([value]) => value > key));
    const full = [below, above].filter((side) => side.length >= 3);
    if (full.length && (t.chance(0.5) || !below.length || !above.length)) return t.pick(full).slice(0, 3);
    if (below.length && above.length && below.length + above.length >= 3) {
      const low = below.length >= 2 && (above.length < 2 || t.chance(0.5)) ? 2 : 1;
      return t.shuffle([...below.slice(0, low), ...above.slice(0, 3 - low)]);
    }
    return t.shuffle(unique).slice(0, 3);
  }

  // "the value in parentheses" of a product: 4(3), 4(−7); never "((−7))".
  const times = (a, b) => `${num(a)}(${num(b)})`;

  /* --------------------------------------------------- two-variable-equation-model */

  const modelScenes = [
    {
      make: (t) => ({ a: t.pick([2, 2.5, 3, 3.5, 4]), b: t.pick([1.5, 2, 2.5, 3, 4.5]), x0: t.int(8, 40), y0: t.int(8, 40) }),
      text: (v, T) =>
        `A snack stand sells pretzels for ${usd(v.a)} each and drinks for ${usd(v.b)} each. One day, the stand's ` +
        `sales from pretzels and drinks totaled ${usd(T)}.`,
      defs: "x is the number of pretzels sold and y is the number of drinks sold",
      defsFlip: "x is the number of drinks sold and y is the number of pretzels sold",
      given: (x) => `If the stand sold ${x} pretzels that day, how many drinks did it sell?`,
      leftover: "dollars of drink sales", xs: "pretzels", ys: "drinks", totalNoun: "dollars", dollars: true,
    },
    {
      make: (t) => ({ a: 2, b: 3, x0: t.int(6, 20), y0: t.int(3, 14) }),
      text: (v, T) =>
        `In a basketball game, a team scored ${T} points, all from 2-point baskets and 3-point baskets.`,
      defs: "x is the number of 2-point baskets and y is the number of 3-point baskets",
      defsFlip: "x is the number of 3-point baskets and y is the number of 2-point baskets",
      given: (x) => `If ${x} of the team's baskets were 2-point baskets, how many 3-point baskets did the team make?`,
      leftover: "points from 3-point baskets", xs: "2-point baskets", ys: "3-point baskets", totalNoun: "points",
    },
    {
      make: (t) => ({ a: 3, b: 2, x0: t.int(3, 14), y0: t.int(6, 20) }),
      text: (v, T) =>
        `In a basketball game, a team scored ${T} points, all from 3-point baskets and 2-point baskets.`,
      defs: "x is the number of 3-point baskets and y is the number of 2-point baskets",
      defsFlip: "x is the number of 2-point baskets and y is the number of 3-point baskets",
      given: (x) => `If ${x} of the team's baskets were 3-point baskets, how many 2-point baskets did the team make?`,
      leftover: "points from 2-point baskets", xs: "3-point baskets", ys: "2-point baskets", totalNoun: "points",
    },
    {
      make: (t) => ({ a: t.pick([2, 3, 4]), b: t.pick([5, 6, 7]), x0: t.int(1, 6), y0: t.int(1, 4) }),
      text: (v, T) =>
        `On a training day, Rosa walked at an average speed of ${v.a} miles per hour and jogged at an average speed ` +
        `of ${v.b} miles per hour, covering ${T} miles in all.`,
      defs: "x is the number of hours Rosa walked and y is the number of hours she jogged",
      defsFlip: "x is the number of hours Rosa jogged and y is the number of hours she walked",
      given: (x) => `If Rosa walked for ${x} hour${x === 1 ? "" : "s"}, for how many hours did she jog?`,
      leftover: "miles jogged", xs: "hours walking", ys: "hours jogging", totalNoun: "miles",
    },
    {
      make: (t) => ({ a: t.pick([2.5, 3, 3.5]), b: t.pick([1.5, 2, 4.5]), x0: t.int(2, 10), y0: t.int(2, 10) }),
      text: (v, T) =>
        `A baker uses ${num(v.a)} cups of flour for each loaf of bread and ${num(v.b)} cups of flour for each batch of ` +
        `muffins. On Monday, the baker used ${num(T)} cups of flour for bread and muffins.`,
      defs: "x is the number of loaves and y is the number of batches of muffins",
      defsFlip: "x is the number of batches of muffins and y is the number of loaves",
      given: (x) => `If the baker made ${x} loaves on Monday, how many batches of muffins did the baker make?`,
      leftover: "cups of flour for muffins", xs: "loaves", ys: "batches", totalNoun: "cups of flour",
    },
    {
      make: (t) => ({ a: t.pick([4, 5, 6]), b: t.pick([9, 10, 12, 14]), x0: t.int(3, 15), y0: t.int(2, 10) }),
      text: (v, T) =>
        `A carpenter uses ${v.a} feet of lumber for each shelf and ${v.b} feet of lumber for each bench. The ` +
        `carpenter used ${T} feet of lumber for shelves and benches last week.`,
      defs: "x is the number of shelves and y is the number of benches",
      defsFlip: "x is the number of benches and y is the number of shelves",
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
          // Which point lies on ax + by = c (or y = mx + k)? The choices are the
          // key with its signs changed, so every choice uses the same numbers.
          const slopeForm = t.chance(0.35);
          const x0 = t.nonzero(-6, 8);
          const y0 = t.nonzero(-8, 10);
          if (Math.abs(x0) === Math.abs(y0)) continue;
          let equation;
          let reasons;
          if (slopeForm) {
            const m = t.sign() * t.int(2, 5);
            const k = y0 - m * x0;
            if (k === 0 || Math.abs(k) > 30) continue;
            equation = `y = ${lin(m, k)}`;
            reasons = {
              flipX: `Satisfies y = ${lin(-m, k)}: the sign of the slope is lost.`,
              flipY: `Satisfies y = ${lin(-m, -k)}: the sign of y is lost, which changes the sign of every term on the right.`,
              flipBoth: `Satisfies y = ${lin(m, -k)}: the sign of the constant term is lost.`,
            };
          } else {
            const a = t.sign() * t.int(1, 6);
            const b = t.sign() * t.int(2, 6);
            const c = a * x0 + b * y0;
            if (c === 0 || (a < 0 && b < 0) || S.gcd(S.gcd(a, b), c) !== 1) continue;
            equation = standardForm(a, b, c);
            reasons = {
              flipX: `Satisfies ${standardForm(-a, b, c)}: the sign of the x-term is flipped.`,
              flipY: `Satisfies ${standardForm(a, -b, c)}: the sign of the y-term is flipped.`,
              flipBoth: `Satisfies ${standardForm(a, b, -c)}: the sign of the constant is flipped.`,
            };
          }
          const key = point(x0, y0);
          const pool = [
            [point(-x0, y0), reasons.flipX],
            [point(x0, -y0), reasons.flipY],
            [point(-x0, -y0), reasons.flipBoth],
            [point(y0, x0), "Swaps the coordinates of a point on the line."],
          ];
          const kept = t.sample(pool.filter(([text]) => {
            const [px, py] = readPoint(text);
            return !holds(equation, { x: px, y: py });
          }), 3);
          if (kept.length < 3 || collides(key, kept) || distinctWrong(key, kept) < 3) continue;
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
          const pool = [
            [(c + a * p) / b, `Moves ${num(a * p)} across the equals sign without changing its sign.`],
            [c - a * p, `Stops at ${lin(b, 0, "k")} = ${num(c - a * p)}, before dividing by ${num(b)}.`],
            [(c - b * p) / a, `Substitutes ${num(p)} for y instead of x.`],
            [c / b - a * p, `Divides only the constant ${num(c)} by ${num(b)}, not the term ${num(a * p)}.`],
            [(c - a * p) / a, `Divides ${num(c - a * p)} by ${num(a)}, the coefficient of x, instead of by ${num(b)}.`],
          ].filter(([value]) => Number.isInteger(value));
          const numeric = t.chance(0.6);
          const wrong = numeric ? [] : spreadAround(t, k, pool);
          if (!numeric && (collides(k, wrong) || distinctWrong(k, wrong) < 3)) continue;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 55,
            stimulus: { type: "equations", content: equation },
            stem: `The point (${num(p)}, k) lies on the graph of the given equation in the xy-plane. What is the value of k?`,
            correct: k,
            wrong,
            explanation: `Substitute x = ${num(p)}: ${num(a * p)} ${xTerm(b, "k")} = ${num(c)}, so ${lin(b, 0, "k")} = ${num(c - a * p)} and k = ${num(k)}.`,
            steps: [
              `Substitute x = ${num(p)} and y = k: ${times(a, p)} ${xTerm(b, "k")} = ${num(c)}.`,
              `${moveText(a * p)}: ${lin(b, 0, "k")} = ${num(c - a * p)}.`,
              `Divide by ${num(b)}: k = ${num(k)}.`,
            ],
            principles: ["A point on the graph satisfies the equation, so a known coordinate can be substituted to find the other."],
            trap: "The first coordinate is x; substituting it for y answers a different question.",
            hint: "Which variable does the first coordinate replace?",
            verify: () => holds(equation, { x: p, y: k }) && !holds(equation, { x: p, y: k + 1 }),
          };
        }
        // A line described by its slope and one point; which other point is on
        // it? The choices step by (run, rise), (run, −rise), (rise, run), and
        // (−rise, run): every choice reuses the same two steps.
        const m = t.sign() * t.int(2, 5);
        const x0 = t.int(-5, 6);
        const y0 = t.int(-6, 8);
        const s = t.pick([2, 3, -2, 4]);
        const key = point(x0 + s, y0 + m * s);
        const wrong = t.sample([
          [point(x0 + m * s, y0 + s), "Swaps the run and the rise, moving horizontally by the change in y."],
          [point(x0 + s, y0 - m * s), `Moves in the direction of a line with slope ${num(-m)}.`],
          [point(x0 - m * s, y0 + s), `Moves along a line with slope ${frac(-1, m)}, the negative reciprocal of ${num(m)}.`],
          [point(x0 + s, y0 + m), `Adds the slope to y once, although x changes by ${num(s)}.`],
        ], 3);
        if (collides(key, wrong) || distinctWrong(key, wrong) < 3) continue;
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 65,
          stimulus: null,
          stem: `In the xy-plane, a line with slope ${num(m)} passes through the point ${point(x0, y0)}. Which of the following points also lies on the line?`,
          correct: key,
          wrong,
          explanation:
            `A slope of ${num(m)} means y changes by ${num(m)} for each increase of 1 in x. Moving ${num(s)} in x from ` +
            `${point(x0, y0)} changes y by ${num(m)} · ${paren(s)} = ${num(m * s)}, reaching ${key}.`,
          steps: [
            `Slope ${num(m)}: each change of 1 in x changes y by ${num(m)}.`,
            `A change of ${num(s)} in x changes y by ${num(m * s)}.`,
            `From ${point(x0, y0)}: ${key}.`,
          ],
          principles: ["Any two points on a line give the same slope: change in y ÷ change in x."],
          trap: "Moving across by the change in y and up by the change in x swaps the rise and the run.",
          hint: "Check the change in y against the change in x from the given point.",
          verify: () => {
            const [kx, ky] = readPoint(key);
            const slopeTo = ([px, py]) => (px === x0 ? NaN : (py - y0) / (px - x0));
            return approx(slopeTo([kx, ky]), m) && wrong.every(([text]) => !approx(slopeTo(readPoint(text)), m));
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
    difficulty: "Easy",
    title: "Two-variable linear equation from a total",
    recognize:
      "Each quantity contributes its rate times its count, and the contributions add to the total; keep each rate " +
      "with its own variable.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
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
        const per = (a, b) => `x/${show(a)} + y/${show(b)} = ${Tt}`;
        if (!askCount) {
          // Two independent slips: rates swapped between the variables, and
          // counts divided by their rates instead of multiplied. The four
          // choices are the four combinations. Which item x counts is drawn,
          // so no coefficient habitually opens the key.
          const flip = t.chance(0.5);
          const [A, B, X, Y, x0, y0] = flip
            ? [v.b, v.a, scene.ys, scene.xs, v.y0, v.x0]
            : [v.a, v.b, scene.xs, scene.ys, v.x0, v.y0];
          const key = eq(A, B);
          const wrong = [
            [eq(B, A), "Attaches each rate to the other quantity."],
            [per(A, B), "Divides each count by its rate instead of multiplying."],
            [per(B, A), "Divides each count by a rate instead of multiplying, and attaches each rate to the other quantity."],
          ];
          const pairs = [[x0, y0], [0, T / B], [T / A, 0]];
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 75,
            stimulus: null,
            stem: `${scene.text(v, T)} Which equation represents this situation, where ${flip ? scene.defsFlip : scene.defs}?`,
            correct: key,
            wrong,
            explanation:
              `The ${X} contribute ${show(A)}x ${scene.totalNoun} and the ${Y} contribute ${show(B)}y; ` +
              `together they make ${Tt}, so ${key}.`,
            steps: [
              `${X.charAt(0).toUpperCase()}${X.slice(1)}: ${show(A)} for each, so ${show(A)}x.`,
              `${Y.charAt(0).toUpperCase()}${Y.slice(1)}: ${show(B)} for each, so ${show(B)}y.`,
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
        const pool = [
          [left, `Gives the ${scene.leftover}, not the number of ${scene.ys}.`],
          [clean((T - v.b * v.x0) / v.a), "Uses each rate for the other quantity."],
          [clean(T / v.b - v.x0), `Divides the total by ${num(v.b)} and then subtracts the ${v.x0} ${scene.xs}.`],
          [clean((T + v.a * v.x0) / v.b), `Adds the ${scene.xs}' share to the total instead of subtracting it.`],
          [clean(T / v.b), `Divides the whole total by ${num(v.b)} without first removing the ${scene.xs}' share.`],
          [clean(left / v.a), `Divides the ${scene.leftover} by ${num(v.a)}, the rate for ${scene.xs}, instead of by ${num(v.b)}.`],
        ].filter(([value]) => value > 0 && whole(value));
        const wrong = numeric ? [] : spreadAround(t, key, pool);
        if (!numeric && (collides(key, wrong) || distinctWrong(key, wrong) < 3)) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 80,
          stimulus: null,
          stem: `${scene.text(v, T)} ${scene.given(v.x0)}`,
          correct: key,
          wrong,
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
    difficulty: "Easy",
    title: "Reading a context line through two labeled points",
    recognize:
      "The point at x = 0 is the starting amount and the change between the two points, divided by the change in x, " +
      "is the rate; the question then needs one more step from the start, not from the second point.",
    // Easy: the start and the rate are read off the labeled points and used
    // once (the 2026-09-26 review found it plays at Easy level).
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
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
          // Two independent slips, amount and direction, crossed: the change
          // over the whole labelled interval (or the starting amount) read as
          // the change per unit, and the direction reversed.
          const amount = (value) => (scene.money ? usd(value) : `${num(value)} ${value === 1 ? scene.unitOne : scene.units}`);
          const word = scene.up ? "increases" : "decreases";
          const other = scene.up ? "decreases" : "increases";
          const change = clean(r * x1);
          if (change === r || x1 === 1 || y0 === r) continue;
          const [wrongAmount, amountReason] = t.pick([
            [change, `Uses the change from x = 0 to x = ${x1}, ${num(change)}, as the change for a single ${scene.xOne}`],
            [y0, `Uses the starting amount, ${num(y0)}, the y-intercept, as the change for each ${scene.xOne}`],
          ]);
          const key = scene.slope(amount(r), word);
          const wrong = [
            [scene.slope(amount(wrongAmount), word), `${amountReason}.`],
            [scene.slope(amount(r), other), "Gets the size of the slope right but its direction wrong."],
            [scene.slope(amount(wrongAmount), other), `${amountReason}, and reverses the direction of the change.`],
          ];
          if (!Number.isInteger(r) && scene.money) continue;
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 85,
            stimulus: null,
            figure,
            stem: `${lead} Which of the following is the best interpretation of the slope of the line in this context?`,
            correct: key,
            wrong,
            explanation:
              `The slope is ${rateWork}. It is the change in y for each increase of 1 in x, so ${key.charAt(0).toLowerCase()}${key.slice(1)}`,
            steps: [
              `Slope: ${rateWork}.`,
              `y is measured in ${scene.units} and x in ${scene.xs}, so the slope is in ${scene.units} per ${scene.xOne}.`,
              `A ${scene.up ? "positive" : "negative"} slope means the amount ${word}.`,
            ],
            principles: ["The slope of a linear model is the change in the output for each increase of 1 in the input."],
            trap: `${num(change)} is the change over ${x1} ${scene.xs}, and ${num(y0)} is the starting amount; the slope is the change over one ${scene.xOne}.`,
            hint: `How much does y change when x goes up by 1?`,
            verify: () => {
              const { m } = verifyLine();
              // Each choice claims a size and a direction; only the key's match the line.
              const claim = (text) => [text.includes(`by ${amount(r)} `), text.includes(scene.up ? "increases" : "decreases")];
              return approx(Math.abs(m), r) && Math.sign(m) === dir && claim(key).every(Boolean) &&
                wrong.every(([text]) => !claim(text).every(Boolean));
            },
          };
        }
        if (form === "value") {
          const x2 = scene.up ? x1 + t.int(2, 8) : t.int(2, n - 1);
          if (x2 === x1) continue;
          const key = clean(y0 + slope * x2);
          const pool = [
            [r, `Gives the rate of change per ${scene.xOne}, not the amount after ${x2} ${scene.xs}.`],
            [clean(y0 - slope * x2), `${scene.up ? "Subtracts" : "Adds"} the change instead of ${scene.up ? "adding" : "subtracting"} it.`],
            [clean(y1 + slope * x2), `Starts from the point at x = ${x1} instead of from x = 0.`],
            [clean(r * x2), `Gives the change after ${x2} ${scene.xs}, not the amount then.`],
            [clean(y1 - slope * x2), `Starts from the point at x = ${x1} and ${scene.up ? "subtracts" : "adds"} the change.`],
            ...(scene.up ? [[clean(y0 + (y1 / x1) * x2), `Divides ${num(y1)} by ${x1} for the rate, ignoring the starting amount ${num(y0)}.`]] : []),
          ].filter(([value]) => value >= 0 && terminates(value));
          const response = responseFor(numeric, key);
          const wrong = response === "numeric" ? [] : spreadAround(t, key, pool);
          if (response !== "numeric" && (collides(key, wrong) || distinctWrong(key, wrong) < 3)) continue;
          return commaChoices({
            responseType: response,
            estimatedSeconds: 85,
            stimulus: null,
            figure,
            stem: `${lead} ${scene.value(x2)}`,
            correct: key,
            wrong,
            explanation: `The slope is ${rateWork}, so the model is y = ${lin(slope, y0)}. At x = ${x2}, y = ${num(y0)} ${signed(clean(slope * x2))} = ${num(key)}.`,
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
        const pool = [
          [r, `Gives the rate of change per ${scene.xOne}, not a number of ${scene.xs}.`],
          [clean(Math.abs(G - y0)), `Gives the change in ${scene.units}, not the time it takes.`],
          [clean((G - y1) / slope), `Counts the time from x = ${x1} instead of from x = 0.`],
          [clean(key + x1), `Adds the ${x1} ${scene.xs} at the labelled point to the time needed from x = 0.`],
          [clean(G / r), "Divides the target amount by the rate, ignoring the starting amount."],
          [clean((G + y0) / r), "Adds the starting amount to the target instead of finding the change between them."],
          [clean(Math.abs(G - y0) / (y1 / x1)), `Divides the change by ${num(y1)} ÷ ${x1}, which ignores the starting amount in the rate.`],
        ].filter(([value]) => value > 0 && terminates(value) && S.formatNumber(value).length <= 7);
        const wrong = numeric ? [] : spreadAround(t, key, pool);
        if (!numeric && (collides(key, wrong) || distinctWrong(key, wrong) < 3)) continue;
        return commaChoices({
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 90,
          stimulus: null,
          figure,
          stem: `${lead} ${scene.time(G)}`,
          correct: key,
          wrong,
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
    difficulty: "Medium",
    title: "Linear model read in a different unit",
    recognize:
      "The coefficient is a rate in the model's own input unit; before interpreting or rewriting it, convert that " +
      "rate to the unit the question uses, and leave the starting value alone.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
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
        // Two independent slips, crossed into the four choices: for the rate,
        // the amount (the cost of the first group, fee included) and the unit
        // (per item instead of per group); for the fee, the kind of statement
        // (the cost of one group instead of no use) and the number read.
        if (aboutRate) {
          key = scene.rate(a, scene.group);
          wrong = [
            [scene.rate(clean(a + b), scene.group), `Treats the cost for the first ${scene.group}, which includes the fixed ${usdHard(b)}, as the rate.`],
            [scene.rate(a, perOne), `Reads ${num(a)} per ${scene.one}, but n counts groups of ${scene.size}.`],
            [scene.rate(clean(a + b), perOne), `Adds the fixed ${usdHard(b)} into the rate and reads it per ${scene.one} instead of per ${scene.group}.`],
          ];
          claims = { key: ["rate", 1, a], wrong: [["rate", 1, clean(a + b)], ["rate", 1 / scene.size, a], ["rate", 1 / scene.size, clean(a + b)]] };
        } else {
          key = scene.base(b);
          wrong = [
            [scene.base(a), `Reads the coefficient ${num(a)} as the cost when n = 0; ${num(a)} multiplies n.`],
            [scene.total(b, scene.group), `Takes ${usdHard(b)} as the cost when n = 1; it is the cost when n = 0.`],
            [scene.total(a, scene.group), `Takes the rate ${usdHard(a)} as the cost when n = 1, leaving out the fixed ${usdHard(b)}.`],
          ];
          claims = { key: ["base", 0, b], wrong: [["base", 0, a], ["total", 1, b], ["total", 1, a]] };
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
          if (collides(span, wrong) || distinctWrongHard(span, wrong) < 3) continue;
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
          if (collides(key, wrong) || distinctWrongHard(key, wrong) < 3) continue;
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
        // Rate slip (unconverted, or converted the wrong way) crossed with the
        // constant slip (rescaled with the rate).
        const [rateSlip, rateReason] = t.pick([
          [coefficient, `Keeps the per-${modelUnit[1]} rate while switching the variable to ${askUnit[2]}`],
          [wrongWay, `Converts the rate by ${inverse} by ${commasHard(scene.F)} instead of ${verb}`],
        ]);
        const candidates = [
          [eq(rateSlip, start), `${rateReason}.`],
          [eq(key, scaledStart), `Converts the starting value as well as the rate; ${commasHard(start)} stays the same when the input's unit changes.`],
          [eq(rateSlip, scaledStart), `${rateReason}, and also rescales the starting value ${commasHard(start)}.`],
        ];
        if (![rateSlip, scaledStart].every(exact)) continue;
        const wrong = candidates;
        if (collides(keyEq, wrong) || distinctWrongHard(keyEq, wrong) < 3) continue;
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
      // The slope choices are ±(a/b) and ±(b/a); the pair nearer 0 sits in the
      // middle. Drawing |slope| > 1 a little over half the time keeps the key
      // off the middle pair about as often as on it.
      const steep = t.chance(0.55);
      for (;;) {
        const a = t.int(1, 9);
        const b = t.nonzero(-9, 9);
        if (Math.abs(b) < 2 || a === Math.abs(b)) continue;
        if (!askForm && steep !== a > Math.abs(b)) continue;
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
          // Two independent slips: one in the x-term (a sign or an inversion,
          // both of which keep its numbers) and one in the constant (not
          // divided by b). The choices are the four combinations, so no choice
          // is the "average" of the others.
          key = solved;
          const slips = [
            [slopeTerm(a, b), `moves ${lin(a, 0)} to the right side without changing its sign`],
            [slopeTerm(-b, a), "inverts the coefficient of x when dividing"],
          ];
          const [xTermWrong, xReason] = t.pick(slips);
          wrong = [
            [`y = ${xTermWrong} ${signed(k)}`, `${xReason.charAt(0).toUpperCase()}${xReason.slice(1)}.`],
            [`y = ${slopeTerm(-a, b)} ${signed(c)}`, `Divides the x-term by ${num(b)} but not the constant.`],
            [`y = ${xTermWrong} ${signed(c)}`, `${xReason.charAt(0).toUpperCase()}${xReason.slice(1)}, and does not divide the constant by ${num(b)}.`],
          ];
        } else {
          key = numeric ? slopeValue : slope;
          steps.push(`The slope is the coefficient of x: ${slope}.`);
          // Sign slip, inversion, and both: a two-by-two grid of the same two
          // numbers, so no choice is built around the key.
          wrong = [
            [frac(a, b), "Divides the x-coefficient by the y-coefficient without changing the sign."],
            [frac(-b, a), "Divides the y-coefficient by the x-coefficient, which inverts the slope."],
            [frac(b, a), "Inverts the slope and also loses its sign."],
          ];
        }
        if (!numeric && (collides(key, wrong) || distinctWrong(key, wrong) < 3)) continue;
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

  /* ---------------------------------------------------- linear-intercept-meaning */

  // Decreasing amounts: y = y0 − r·x reaches 0 at x = y0 / r. Each scene
  // phrases five claims a choice can make: when the amount runs out, what it
  // started at, how fast it falls, what remains at a time, and how much is
  // used by then. Choices cross a claim with a number, so every choice is a
  // true-sounding sentence about the same situation.
  const drainScenes = [
    {
      x: "t", y: "F", xs: "hours", ys: "gallons",
      starts: [12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35, 36, 40], rates: [1.5, 2, 2.5, 3, 3.5, 4, 5, 6],
      what: "the amount of fuel F, in gallons, in a generator's tank t hours after the generator is started",
      empty: (N) => `The generator runs out of fuel ${num(N)} hours after it is started.`,
      start: (N) => `The tank held ${num(N)} gallons of fuel when the generator was started.`,
      rate: (N) => `The generator uses ${num(N)} gallons of fuel for each hour it runs.`,
      remain: (x, y) => `The tank holds ${num(y)} gallons of fuel ${num(x)} hours after the generator is started.`,
      used: (x, y) => `The generator uses ${num(y)} gallons of fuel in the first ${num(x)} hours after it is started.`,
      askEmpty: "According to the model, how many hours after it is started will the generator run out of fuel?",
      askUsed: (x) => `According to the graph, how many gallons of fuel does the generator use in the first ${x} hours after it is started?`,
    },
    {
      x: "w", y: "B", xs: "weeks", ys: "dollars", money: true,
      starts: [40, 50, 60, 75, 80, 90, 100, 120, 125, 150, 160, 180, 200], rates: [2.5, 5, 7.5, 10, 12.5, 15, 20, 25],
      what: "the balance B, in dollars, on a gift card w weeks after it was bought, if the same amount is spent each week",
      empty: (N) => `The card's balance reaches $0 after ${num(N)} weeks.`,
      start: (N) => `The card's balance was ${usd(N)} when it was bought.`,
      rate: (N) => `The card's balance goes down by ${usd(N)} each week.`,
      remain: (x, y) => `The card's balance is ${usd(y)} after ${num(x)} weeks.`,
      used: (x, y) => `The card's owner spends ${usd(y)} in the first ${num(x)} weeks.`,
      askEmpty: "According to the model, after how many weeks will the card's balance reach $0?",
      askUsed: (x) => `According to the graph, how many dollars are spent from the card in the first ${x} weeks?`,
    },
    {
      x: "h", y: "D", xs: "hours", ys: "miles",
      starts: [90, 120, 135, 150, 165, 180, 200, 210, 225, 240, 270, 300, 330, 360, 400, 420, 450], rates: [30, 40, 45, 50, 55, 60, 65, 70, 75],
      what: "the distance D, in miles, between a driver and her destination h hours after she leaves home",
      empty: (N) => `The driver reaches her destination ${num(N)} hours after she leaves home.`,
      start: (N) => `The driver's home is ${num(N)} miles from her destination.`,
      rate: (N) => `The driver travels ${num(N)} miles closer to her destination each hour.`,
      remain: (x, y) => `The driver is ${num(y)} miles from her destination ${num(x)} hours after she leaves home.`,
      used: (x, y) => `The driver travels ${num(y)} miles in the first ${num(x)} hours after she leaves home.`,
      askEmpty: "According to the model, how many hours after she leaves home will the driver reach her destination?",
      askUsed: (x) => `According to the graph, how many miles does the driver travel in the first ${x} hours after she leaves home?`,
    },
    {
      x: "m", y: "V", xs: "minutes", ys: "gallons",
      starts: [800, 900, 1000, 1200, 1500, 1600, 1800, 2000, 2400, 2500, 3000, 3200, 3600, 4000, 4500], rates: [25, 40, 50, 60, 75, 80, 100, 120, 125, 150, 200, 250],
      what: "the volume V, in gallons, of water in a pool m minutes after the pool begins to drain",
      empty: (N) => `The pool is empty ${commas(N)} minutes after it begins to drain.`,
      start: (N) => `The pool held ${commas(N)} gallons of water when it began to drain.`,
      rate: (N) => `The pool loses ${commas(N)} gallons of water each minute while it drains.`,
      remain: (x, y) => `The pool holds ${commas(y)} gallons of water ${commas(x)} minutes after it begins to drain.`,
      used: (x, y) => `The pool loses ${commas(y)} gallons of water in the first ${commas(x)} minutes of draining.`,
      askEmpty: "According to the model, how many minutes after it begins to drain will the pool be empty?",
      askUsed: (x) => `According to the graph, how many gallons of water does the pool lose in the first ${x} minutes of draining?`,
    },
    {
      x: "t", y: "H", xs: "hours", ys: "centimeters",
      starts: [10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 36], rates: [0.5, 1.5, 2, 2.5, 3, 3.5, 4],
      what: "the height H, in centimeters, of a candle t hours after it is lit",
      empty: (N) => `The candle burns down completely ${num(N)} hours after it is lit.`,
      start: (N) => `The candle was ${num(N)} centimeters tall when it was lit.`,
      rate: (N) => `The candle gets ${num(N)} centimeters shorter for each hour it burns.`,
      remain: (x, y) => `The candle is ${num(y)} centimeters tall ${num(x)} hours after it is lit.`,
      used: (x, y) => `The candle gets ${num(y)} centimeters shorter in the first ${num(x)} hours after it is lit.`,
      askEmpty: "According to the model, how many hours after it is lit will the candle burn down completely?",
      askUsed: (x) => `According to the graph, by how many centimeters does the candle get shorter in the first ${x} hours after it is lit?`,
    },
  ];

  // Budgets: a·x + b·y = T. The x-intercept is how many of the first item the
  // total buys alone; the coefficient is a price.
  const budgetScenes = [
    {
      intro: (eq, T) => `The equation ${eq} represents the number of shirts, x, and the number of hats, y, that a club can buy for ${usd(T)}.`,
      max: [(N) => `The club can buy ${num(N)} shirts if it buys no hats.`, (N) => `The club can buy ${num(N)} hats if it buys no shirts.`],
      price: [(N) => `The club pays ${usd(N)} for each shirt that it buys.`, (N) => `The club pays ${usd(N)} for each hat that it buys.`],
      prices: [[6, 30], [4, 20]], totals: [120, 1500],
    },
    {
      intro: (eq, T) => `The equation ${eq} represents the number of hours, x, that a student tutors and the number of hours, y, that she works at a bookstore to earn ${usd(T)} in one month.`,
      max: [
        (N) => `The student must tutor for ${num(N)} hours if she does not work at the bookstore.`,
        (N) => `The student must work ${num(N)} hours at the bookstore if she does not tutor.`,
      ],
      price: [
        (N) => `The student earns ${usd(N)} for each hour that she tutors.`,
        (N) => `The student earns ${usd(N)} for each hour that she works at the bookstore.`,
      ],
      prices: [[15, 40], [10, 25]], totals: [300, 2000],
    },
  ];

  // A nice grid step: at most 10 lines up to `top`, dividing every value given.
  function niceStep(top, values) {
    return [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((step) =>
      top / step <= 10 && values.every((value) => Math.abs(value / step - Math.round(value / step)) < 1e-9)) || null;
  }

  // The line from (0, y0) to (n, 0) on a first-quadrant grid.
  function drainFigure(scene, y0, n, alt, marks = []) {
    const xStep = niceStep(n, [n, ...marks]);
    const yStep = niceStep(y0, [y0]);
    if (!xStep || !yStep) return null;
    const xMax = n + xStep;
    const yMax = y0 + yStep;
    const P = S.plane({
      xMin: 0, xMax, yMin: 0, yMax, xStep, yStep,
      unit: 300 / xMax, yUnit: 220 / yMax, names: [scene.x, scene.y],
    });
    const parts = [...P.grid(), ...P.axes(), P.segment(0, y0, n, 0)];
    return { svg: P.svg(parts, alt), alt, notToScale: false };
  }

  const interceptMeaning = {
    id: "linear-intercept-meaning",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "equation modeling",
    difficulty: "Medium",
    title: "Meaning of an intercept or a point of a linear model",
    recognize:
      "An intercept is a point where one variable is 0: on the vertical axis the input is 0 (the starting amount), on " +
      "the horizontal axis the output is 0 (the amount has run out, or nothing of the other item is bought). A point " +
      "(a, b) says the output is b when the input is a.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "neighbouring-rule"],
    build(t) {
      const budget = t.chance(0.3);
      if (budget) {
        for (;;) {
          const scene = t.pick(budgetScenes);
          const a = t.int(...scene.prices[0]);
          const b = t.int(...scene.prices[1]);
          const lcm = (a * b) / S.gcd(a, b);
          const [low, high] = scene.totals;
          if (a === b || lcm > high) continue;
          const T = lcm * t.int(Math.ceil(low / lcm), Math.floor(high / lcm));
          if (T < low) continue;
          const [nx, ny] = [T / a, T / b];
          if ([nx, ny].some((value) => value === a || value === b) || nx === ny) continue;
          const onX = t.chance(0.5);
          const side = onX ? 0 : 1;
          const [own, other] = onX ? [nx, ny] : [ny, nx];
          const price = onX ? a : b;
          const equation = `${a}x + ${b}y = ${commas(T)}`;
          const claims = [
            { text: scene.max[side](own), check: (f) => approx(onX ? f(own, 0) : f(0, own), T) },
            { text: scene.max[side](other), check: (f) => approx(onX ? f(other, 0) : f(0, other), T) },
            { text: scene.price[side](own), check: (f) => approx(onX ? f(1, 0) - f(0, 0) : f(0, 1) - f(0, 0), own) },
            { text: scene.price[side](other), check: (f) => approx(onX ? f(1, 0) - f(0, 0) : f(0, 1) - f(0, 0), other) },
          ];
          const key = claims[0].text;
          const wrong = [
            [claims[1].text, `Divides ${commas(T)} by ${onX ? b : a}, the other coefficient; the ${onX ? "x" : "y"}-intercept comes from dividing by ${price}.`],
            [claims[2].text, `Reads the intercept value ${own} as a price; the price is the coefficient ${price}.`],
            [claims[3].text, `Takes the other intercept value, ${other}, as a price; the price is the coefficient ${price}.`],
          ];
          if (collides(key, wrong)) continue;
          const intercept = onX ? `(${own}, 0)` : `(0, ${own})`;
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 80,
            stimulus: null,
            stem:
              `${scene.intro(equation, T)} What is the best interpretation of the ${onX ? "x" : "y"}-intercept of the graph ` +
              "of this equation in the xy-plane?",
            correct: key,
            wrong,
            explanation:
              `At the ${onX ? "x" : "y"}-intercept, ${onX ? "y" : "x"} = 0, so ${onX ? `${a}x` : `${b}y`} = ${commas(T)} and ` +
              `${onX ? "x" : "y"} = ${own}: the whole ${usd(T)} goes to one kind, and none to the other. The intercept is ${intercept}.`,
            steps: [
              `On the ${onX ? "x" : "y"}-axis, ${onX ? "y" : "x"} = 0.`,
              `Solve ${onX ? `${a}x` : `${b}y`} = ${commas(T)}: ${onX ? "x" : "y"} = ${own}.`,
              `So ${key.charAt(0).toLowerCase()}${key.slice(1)}`,
            ],
            principles: [
              "At an x-intercept y = 0, and at a y-intercept x = 0.",
              "In a total such as ax + by = T, each coefficient is the amount one item contributes.",
            ],
            trap: `The coefficient ${price} is a price; the intercept value ${own} is a count.`,
            hint: "Which variable is 0 at that intercept?",
            verify: () => {
              const f = (x, y) => compileHard(equation.split(" = ")[0])({ x, y });
              return claims[0].check(f) && claims.slice(1).every((claim) => !claim.check(f));
            },
          };
        }
      }
      const form = t.pick(["x-intercept", "y-intercept", "point", "point", "number"]);
      const graph = t.chance(0.5);
      for (;;) {
        const scene = t.pick(drainScenes);
        const y0 = t.pick(scene.starts);
        const r = t.pick(scene.rates);
        const n = y0 / r;
        if (!Number.isInteger(n) || n < 4 || n > 30 || n === y0 || n === r) continue;
        const x1 = t.int(2, n - 2);
        const y1 = clean(y0 - r * x1);
        const used = clean(r * x1);
        if ([y1, used].some((value) => !whole(value) || value < 2) || y1 === x1 || used === y1) continue;
        const shown = `${scene.y} = ${commas(y0)} ${MINUS} ${num(r)}${scene.x}`;
        const eqAlt = `A line in the first quadrant with ${scene.x} on the horizontal axis and ${scene.y} on the vertical axis. ` +
          `It starts on the vertical axis at ${commas(y0)} and meets the horizontal axis at ${commas(n)}.`;
        const figure = graph ? drainFigure(scene, y0, n, eqAlt, form === "number" ? [x1] : []) : null;
        if (graph && !figure) continue;
        if (graph && form === "number" && used % niceStep(y0, [y0])) continue;
        const lead = graph
          ? `The graph shows ${scene.what}.`
          : `The equation ${shown} gives ${scene.what}.`;
        // Claims are checked against the displayed model, not the numbers drawn.
        const model = compileHard(shown.split(" = ")[1]);
        const f = (x) => model({ [scene.x]: x });
        const truth = {
          empty: (N) => approx(f(N), 0),
          start: (N) => approx(f(0), N),
          rate: (N) => approx(f(0) - f(1), N),
          remain: (x, y) => approx(f(x), y),
          used: (x, y) => approx(f(0) - f(x), y),
        };
        const workSlope = `${commas(y0)} ${MINUS} ${num(r)}${scene.x}`;
        if (form === "number") {
          const key = graph ? used : n;
          return {
            responseType: "numeric",
            estimatedSeconds: 75,
            stimulus: null,
            figure,
            stem: `${lead} ${graph ? scene.askUsed(x1) : scene.askEmpty}`,
            correct: key,
            wrong: [],
            explanation: graph
              ? `The graph starts at ${commas(y0)} and passes through (${x1}, ${commas(y1)}), so ${commas(y0)} ${MINUS} ${commas(y1)} = ${commas(used)} ${scene.ys} are used up in the first ${x1} ${scene.xs}.`
              : `The amount is used up when ${scene.y} = 0: ${workSlope} = 0 gives ${scene.x} = ${commas(y0)} ÷ ${num(r)} = ${commas(n)}.`,
            steps: graph
              ? [
                `At ${scene.x} = 0 the graph is at ${commas(y0)}; at ${scene.x} = ${x1} it is at ${commas(y1)}.`,
                `The amount used is the drop between them: ${commas(y0)} ${MINUS} ${commas(y1)} = ${commas(used)}.`,
              ]
              : [
                `Running out means ${scene.y} = 0: ${workSlope} = 0.`,
                `${num(r)}${scene.x} = ${commas(y0)}, so ${scene.x} = ${commas(n)}.`,
              ],
            principles: ["The horizontal intercept of a decreasing amount is when it runs out; the vertical intercept is where it starts."],
            trap: graph
              ? `${commas(y1)} is what remains after ${x1} ${scene.xs}; the question asks how much is used.`
              : `${commas(y0)} is the starting amount and ${num(r)} the rate; the question asks for the time when nothing remains.`,
            hint: graph ? "Compare the graph's height at the start with its height at that time." : "What is the value of the amount when it has run out?",
            verify: () => (graph ? truth.used(x1, key) : truth.empty(key) && !truth.empty(key + 1)),
          };
        }
        let claims;
        let reasons;
        let question;
        if (form === "x-intercept") {
          question = `the ${scene.x}-intercept of the graph`;
          claims = [["empty", n], ["empty", y0], ["rate", n], ["rate", y0]];
          reasons = [
            `Uses ${commas(y0)}, the starting amount, as the time when the amount runs out.`,
            `Reads the ${scene.x}-intercept value ${commas(n)} as a rate; the rate is ${num(r)} ${scene.ys} per ${scene.xs.replace(/s$/, "")}.`,
            `Reads the starting amount ${commas(y0)} as a rate; the ${scene.x}-intercept is where the amount is 0.`,
          ];
        } else if (form === "y-intercept") {
          question = `the ${scene.y}-intercept of the graph`;
          claims = [["start", y0], ["start", n], ["rate", y0], ["rate", n]];
          reasons = [
            `Uses ${commas(n)}, the ${scene.x}-intercept value, as the starting amount.`,
            `Reads the starting amount ${commas(y0)} as the amount used each ${scene.xs.replace(/s$/, "")}.`,
            `Reads the ${scene.x}-intercept value ${commas(n)} as a rate; the ${scene.y}-intercept is the amount when ${scene.x} = 0.`,
          ];
        } else {
          question = `the point ${point(x1, y1)} on the graph`;
          claims = [["remain", x1, y1], ["remain", y1, x1], ["used", x1, y1], ["used", y1, x1]];
          reasons = [
            "Swaps the coordinates: the first coordinate is the time and the second is the amount.",
            `Reads ${commas(y1)}, the amount that remains, as the amount used; ${commas(used)} is used by then.`,
            "Swaps the coordinates and reads the remaining amount as the amount used.",
          ];
        }
        const holdsClaim = ([kind, ...args]) => truth[kind](...args);
        if (!holdsClaim(claims[0]) || claims.slice(1).some(holdsClaim)) continue;
        const say = ([kind, ...args]) => scene[kind](...args);
        const key = say(claims[0]);
        const wrong = claims.slice(1).map((claim, index) => [say(claim), reasons[index]]);
        if (collides(key, wrong) || new Set([key, ...wrong.map(([text]) => text)]).size < 4) continue;
        const pointNote = form === "point" ? ` The point ${point(x1, y1)} says ${scene.y} = ${commas(y1)} when ${scene.x} = ${commas(x1)}.` : "";
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 85,
          stimulus: null,
          figure,
          stem: `${lead} Which of the following is the best interpretation of ${question} in this context?`,
          correct: key,
          wrong,
          explanation:
            (form === "x-intercept"
              ? `At the ${scene.x}-intercept, ${scene.y} = 0: nothing is left. ${workSlope} = 0 when ${scene.x} = ${commas(n)}.`
              : form === "y-intercept"
                ? `At the ${scene.y}-intercept, ${scene.x} = 0: the moment it starts, when the amount is ${commas(y0)}.`
                : `The first coordinate is ${scene.x}, in ${scene.xs}, and the second is ${scene.y}, in ${scene.ys}.${pointNote}`) +
            ` So ${key.charAt(0).toLowerCase()}${key.slice(1)}`,
          steps: [
            form === "point"
              ? `The point gives ${scene.x} = ${commas(x1)} and ${scene.y} = ${commas(y1)}.`
              : `At this intercept, ${form === "x-intercept" ? `${scene.y} = 0` : `${scene.x} = 0`}.`,
            form === "point"
              ? `${scene.y} is the amount remaining, so ${commas(y1)} ${scene.ys} remain after ${commas(x1)} ${scene.xs}; ${commas(used)} have been used.`
              : form === "x-intercept"
                ? `${scene.y} = 0 when ${scene.x} = ${commas(n)}: the amount has run out.`
                : `${scene.y} = ${commas(y0)} when ${scene.x} = 0: the starting amount.`,
          ],
          principles: [
            "A point (a, b) on the graph of a model says the output is b when the input is a.",
            "The vertical intercept is the value at the start; the horizontal intercept is when the value reaches 0.",
          ],
          trap: form === "point"
            ? "The second coordinate is what remains, not what has been used, and the coordinates cannot be swapped."
            : `The rate, ${num(r)} per ${scene.xs.replace(/s$/, "")}, is the slope; the intercepts are where one of the two variables is 0.`,
          hint: form === "point" ? "Which variable does each coordinate give?" : "Which variable is 0 at that intercept?",
          verify: () => holdsClaim(claims[0]) && claims.slice(1).every((claim) => !holdsClaim(claim)),
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
    difficulty: "Medium",
    title: "Change in one coordinate forced by a change in the other along a line",
    recognize:
      "Two points on ax + by = c satisfy it with the same c, so subtracting the two statements leaves " +
      "a(change in x) + b(change in y) = 0: the unknown starting point and the constant drop out, and only the ratio " +
      "of the coefficients matters.",
    // Medium: one rate (the slope) applied to one change.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "neighbouring-rule", "intermediate-value"],
    build(t) {
      const form = t.pick(["rise", "run", "choice"]);
      const numeric = form !== "choice" && t.chance(0.45);
      // The key is the outer ± pair when the change asked for is the larger
      // one; draw that a little over half the time.
      const outer = t.chance(0.55);
      for (;;) {
        const a = t.int(2, 9);
        const b = t.nonzero(-9, 9);
        if (Math.abs(b) < 2 || a === Math.abs(b) || S.gcd(a, b) !== 1) continue;
        if (form === "rise" && outer !== a > Math.abs(b)) continue;
        if (form === "run" && outer !== Math.abs(b) > a) continue;
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
          // Sign slip crossed with inversion: ±r and ±(inverted r), so the
          // key is one of two ± pairs rather than the value the others vary.
          wrong = [
            [(a * dx) / b, `Uses a slope of ${frac(a, b)}; solving the equation for y shows the slope is ${slope}.`],
            [frac(-b * dx, a), `Uses ${frac(-b, a)}, the change in x for each unit of y, as the slope.`],
            [frac(b * dx, a), `Uses ${frac(b, a)}: inverts the slope and also loses its sign.`],
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
            [frac(-a * dy, b), `Multiplies the change in y by the slope, ${slope}, instead of dividing by it.`],
            [frac(a * dy, b), `Multiplies the change in y by ${frac(a, b)}: inverts the division and loses the sign of the slope.`],
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
        if (!numeric && (collides(key, wrong) || distinctWrongHard(key, wrong) < 3)) continue;
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

  /* ------------------------------------------------------ translated-line-intercept */

  // "7/2" or "−3" back to a number; choices may be fractions or decimals.
  const valueOf = (text) => {
    const [top, bottom = "1"] = String(text).replace(MINUS, "-").split("/");
    return Number(top) / Number(bottom);
  };

  const translatedLine = {
    id: "translated-line-intercept",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "graph interpretation",
    difficulty: "Medium",
    title: "Intercept or equation of a translated line read from its graph",
    recognize:
      "A vertical shift changes the y-intercept by the shift but moves the x-intercept by the shift divided by the " +
      "slope; a horizontal shift does the reverse. Read the slope and intercept from the graph, move the line, and " +
      "only then set the other variable to 0.",
    // Medium: read a slope and an intercept, move the line, set a variable
    // to 0; the work is planned, not a structure to find.
    rubric: { steps: 2, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["wrong-quantity", "sign-error", "neighbouring-rule"],
    build(t) {
      const form = t.pick(["vertical", "horizontal", "equation"]);
      // Numeric items differ only in the graph, which the variety count does not
      // see, so most items are multiple choice.
      const numericWanted = form !== "equation" && t.chance(0.2);
      for (;;) {
        const q = t.int(1, 5);
        const p = t.nonzero(-5, 5);
        if (S.gcd(p, q) !== 1 || Math.abs(p) === q) continue;
        const m = p / q;
        const b = t.int(-6, 6);
        // Lattice points on the line inside the window, to mark on the graph.
        const lattice = [];
        for (let step = -6; step <= 6; step += 1) {
          const [x, y] = [step * q, b + step * p];
          if (Math.abs(x) <= 6 && Math.abs(y) <= 6) lattice.push([x, y]);
        }
        if (lattice.length < 2) continue;
        const marked = t.sample(lattice, 2).sort((u, v) => u[0] - v[0]);
        if (marked[1][0] - marked[0][0] < 2) continue;
        const vertical = form !== "horizontal" && (form === "vertical" || t.chance(0.6));
        const s = t.sign();
        const k = t.int(2, 7);
        const moveText = vertical ? `${k} units ${s > 0 ? "up" : "down"}` : `${k} units to the ${s > 0 ? "right" : "left"}`;
        // Standard form of the line shown: p·x − q·y = −q·b, leading coefficient positive.
        const flip = p < 0 ? -1 : 1;
        const [A, B, Cst] = [flip * p, flip * -q, flip * -q * b];
        let key;
        let wrong;
        let stem;
        let steps;
        let explanation;
        let trap;
        let hint;
        let check;
        const slopeText = frac(p, q);
        const original = `y = ${slopeTerm(p, q)}${b ? ` ${signed(b)}` : ""}`;
        if (form === "equation") {
          if (vertical ? Math.abs(B) === 1 : A === 1) continue;
          const coefficient = vertical ? B : A;
          const shift = s * k;
          const constant = (value) => standardForm(A, B, value);
          key = constant(Cst + coefficient * shift);
          const slipName = vertical ? "y" : "x";
          wrong = [
            [constant(Cst - coefficient * shift), `Replaces ${slipName} with ${slipName} ${s > 0 ? "+" : MINUS} ${k}, which moves the line the other way.`],
            [constant(Cst + shift), `Adds the shift to the constant without multiplying it by the coefficient of ${slipName}, ${num(coefficient)}.`],
            [constant(Cst - shift), `Adds the shift to the constant with the wrong sign and without multiplying it by ${num(coefficient)}.`],
          ];
          stem = `The graph of a line in the xy-plane is shown. The line is translated ${moveText}. Which equation represents the translated line?`;
          steps = [
            `From the marked points, the slope is ${slopeText} and the y-intercept is ${num(b)}, so the line is ${original}, or ${constant(Cst)}.`,
            `Translating ${moveText} replaces ${slipName} with (${slipName} ${s > 0 ? MINUS : "+"} ${k}): ${vertical ? `${lin(A, 0)} ${B < 0 ? MINUS : "+"} ${num(Math.abs(B))}(y ${s > 0 ? MINUS : "+"} ${k})` : `${num(A)}(x ${s > 0 ? MINUS : "+"} ${k}) ${B < 0 ? MINUS : "+"} ${lin(Math.abs(B), 0, "y")}`} = ${num(Cst)}.`,
            `Expand and collect the constants: ${key}.`,
          ];
          explanation = `The line shown is ${constant(Cst)}. Moving it ${moveText} replaces ${slipName} with ${slipName} ${s > 0 ? MINUS : "+"} ${k}, which changes the constant by ${num(coefficient)} × ${paren(shift)} = ${num(coefficient * shift)}: ${key}.`;
          trap = `The shift is multiplied by the coefficient of ${slipName} before it reaches the constant, and moving ${s > 0 ? (vertical ? "up" : "right") : (vertical ? "down" : "left")} ${s > 0 ? "subtracts" : "adds"} ${k} ${s > 0 ? "from" : "to"} ${slipName} inside the equation.`;
          hint = "Write an equation for the line shown before moving it.";
          check = () => {
            const moved = marked.map(([x, y]) => (vertical ? [x, y + s * k] : [x + s * k, y]));
            const fits = (text) => moved.every(([x, y]) => holds(text, { x, y }));
            return fits(key) && wrong.every(([text]) => !fits(text));
          };
        } else {
          // Intercept asked: the x-intercept after a vertical shift, the
          // y-intercept after a horizontal one.
          const before = vertical ? -b / m : b;
          const delta = vertical ? (-s * k) / m : -m * s * k;
          const value = before + delta;
          const show = (x) => frac(Math.round(x * q * Math.abs(p)), q * Math.abs(p));
          if (!exact(value * q * Math.abs(p))) continue;
          const dirSign = Math.sign(delta);
          const moved = `${show(Math.abs(delta))} unit${Math.abs(delta) === 1 ? "" : "s"}`;
          const pool = [
            [show(before - delta), `Moves the line ${vertical ? (s > 0 ? "down" : "up") : (s > 0 ? "left" : "right")} instead of ${vertical ? (s > 0 ? "up" : "down") : (s > 0 ? "right" : "left")}.`],
            [show(before + dirSign * k), `Moves the ${vertical ? "x" : "y"}-intercept ${k} units, the size of the shift; with a slope of ${slopeText} it moves ${moved}.`],
            t.chance(0.7)
              ? [show(before - dirSign * k), `Moves the ${vertical ? "x" : "y"}-intercept ${k} units, the size of the shift, and in the wrong direction.`]
              : t.pick([
                [show(before), `Gives the ${vertical ? "x" : "y"}-intercept of the line before it is translated.`],
                [show(vertical ? b + s * k : (-(b - m * s * k)) / m), `Gives the ${vertical ? "y" : "x"}-intercept of the translated line instead.`],
              ]),
          ];
          key = show(value);
          const response = numericWanted && fitsGridHard(value) ? "numeric" : "multiple-choice";
          if (response === "numeric") key = value;
          wrong = response === "numeric" ? [] : pool;
          if (vertical && Math.abs(value) > 40) continue;
          const asked = vertical ? "x-coordinate of the x-intercept" : "y-coordinate of the y-intercept";
          stem = `The graph of a line in the xy-plane is shown. The line is translated ${moveText}. What is the ${asked} of the translated line?`;
          // "(3/2)(x − 4)" or "3(x − 4)": a fraction slope is parenthesized.
          const factor = q === 1 ? slopeText : `(${slopeText})`;
          const movedEquation = vertical
            ? `y = ${slopeTerm(p, q)} ${signed(b + s * k)}`
            : `y = ${factor}(x ${s > 0 ? MINUS : "+"} ${k}) ${signed(b)}`;
          steps = [
            `From the marked points, the slope is ${slopeText} and the y-intercept is ${num(b)}: ${original}.`,
            `Translated ${moveText}: ${movedEquation}.`,
            vertical
              ? `Set y = 0: ${slopeTerm(p, q)} = ${num(-(b + s * k))}, so x = ${show(value)}.`
              : `Set x = 0: y = ${factor}(${num(-s * k)}) ${signed(b)} = ${show(value)}.`,
          ];
          explanation =
            `The line shown is ${original}. After the translation it is ${movedEquation}, whose ${vertical ? "x" : "y"}-intercept ` +
            `is at ${vertical ? "x" : "y"} = ${show(value)}. A ${k}-unit ${vertical ? "vertical" : "horizontal"} shift moves the ` +
            `${vertical ? "x" : "y"}-intercept ${moved}, not ${k}.`;
          trap = `The ${vertical ? "x" : "y"}-intercept does not move ${k} units: on a line with slope ${slopeText}, a ${k}-unit ${vertical ? "vertical" : "horizontal"} shift moves it ${moved}.`;
          hint = "Write an equation for the line shown, then move it.";
          check = () => {
            // Two-point form through the translated marked points.
            const moved = marked.map(([x, y]) => (vertical ? [x, y + s * k] : [x + s * k, y]));
            const [[x1, y1], [x2, y2]] = moved;
            const slope = (y2 - y1) / (x2 - x1);
            const answer = vertical ? x1 - y1 / slope : y1 - slope * x1;
            const keyValue = typeof key === "number" ? key : valueOf(key);
            return approx(answer, keyValue) && wrong.every(([text]) => !approx(valueOf(text), answer));
          };
        }
        if (typeof key === "string" && (collides(key, wrong) || distinctWrongHard(key, wrong) < 3)) continue;
        const P = S.plane({ xMin: -7, xMax: 7, yMin: -7, yMax: 7 });
        const alt =
          `A line in the xy-plane, drawn on a grid from −7 to 7 on both axes. The line passes through the marked points ` +
          `${point(...marked[0])} and ${point(...marked[1])}.`;
        const figure = {
          svg: P.svg([...P.grid(), ...P.axes(), P.line(p, -q, -q * b), P.point(...marked[0]), P.point(...marked[1])], alt),
          alt,
          notToScale: false,
        };
        return {
          responseType: typeof key === "number" ? "numeric" : "multiple-choice",
          estimatedSeconds: 120,
          stimulus: null,
          figure,
          stem,
          correct: key,
          wrong,
          explanation,
          steps,
          principles: [
            "Translating a graph k units up replaces y with y − k; translating it k units right replaces x with x − k.",
            "An x-intercept is where y = 0 and a y-intercept is where x = 0.",
          ],
          trap,
          hint,
          verify: check,
        };
      }
    },
  };

  /* ------------------------------------------------------- line-intercept-conditions */

  const interceptConditions = {
    id: "line-intercept-conditions",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "equation modeling",
    difficulty: "Hard",
    title: "A line pinned down by conditions on its intercepts",
    recognize:
      "Name the intercepts (a, 0) and (0, b). The slope between them is −b/a, and the line is x/a + y/b = 1; a " +
      "condition on the intercepts then becomes an equation in a or b alone.",
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "wrong-quantity", "neighbouring-rule"],
    build(t) {
      const form = t.pick(["slope-sum", "slope-sum", "ratio-point", "ratio-point", "letters"]);
      for (;;) {
        if (form === "letters") {
          // Intercepts (c1·k, 0) and (0, c2·k): the equation or the slope.
          const c1 = t.nonzero(-6, 6);
          const c2 = t.nonzero(-6, 6);
          if (Math.abs(c1) === Math.abs(c2)) continue;
          const askSlope = t.chance(0.4);
          const g = S.gcd(c1, c2);
          // x/(c1 k) + y/(c2 k) = 1  ->  (c2/g)x + (c1/g)y = (c1 c2 / g)k.
          const rc = (c1 * c2) / g;
          const eqText = (xc, yc) => {
            const sign = xc < 0 ? -1 : 1;
            const [X, Y, R] = [sign * xc, sign * yc, sign * rc];
            const rhs = `${R === 1 ? "" : R === -1 ? MINUS : num(R)}k`;
            return `${lin(X, 0)} ${Y < 0 ? MINUS : "+"} ${Math.abs(Y) === 1 ? "" : num(Math.abs(Y))}y = ${rhs}`;
          };
          const [u, v] = [c2 / g, c1 / g];
          const kText = (c) => `${c === 1 ? "" : c === -1 ? MINUS : num(c)}k`;
          const intercepts = `(${kText(c1)}, 0) and y-intercept (0, ${kText(c2)})`;
          const stem =
            `In the xy-plane, a line has x-intercept ${intercepts}, where k is a positive constant. ` +
            (askSlope ? "What is the slope of the line?" : "Which equation represents the line?");
          let key;
          let wrong;
          if (askSlope) {
            key = frac(-c2, c1);
            wrong = [
              [frac(c2, c1), "Divides the y-intercept by the x-intercept without the minus sign: from (a, 0) to (0, b) the run is −a."],
              [frac(-c1, c2), "Divides the x-intercept by the y-intercept, which inverts the slope."],
              [frac(c1, c2), "Inverts the slope and loses its sign."],
            ];
          } else {
            key = eqText(u, v);
            wrong = [
              [eqText(v, u), "Pairs each intercept's number with its own variable; x/a + y/b = 1 puts b with x after clearing fractions."],
              [eqText(u, -v), "Loses the sign of one intercept, which changes the direction of the line."],
              [eqText(v, -u), "Pairs each intercept's number with its own variable and loses a sign."],
            ];
          }
          if (collides(key, wrong) || distinctWrongHard(key, wrong) < 3) continue;
          const kValue = 1.7;
          const [ax, by] = [c1 * kValue, c2 * kValue];
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 100,
            stimulus: null,
            stem,
            correct: key,
            wrong,
            explanation: askSlope
              ? `The line goes from (${kText(c1)}, 0) to (0, ${kText(c2)}): a rise of ${kText(c2)} over a run of ${kText(-c1)}, so the slope is ${key}; k cancels.`
              : `A line with intercepts (a, 0) and (0, b) is x/a + y/b = 1. Here x/(${kText(c1)}) + y/(${kText(c2)}) = 1; clearing the fractions gives ${key}.`,
            steps: askSlope
              ? [
                `Change in y from (${kText(c1)}, 0) to (0, ${kText(c2)}): ${kText(c2)}.`,
                `Change in x: 0 ${MINUS} ${c1 < 0 ? `(${kText(c1)})` : kText(c1)} = ${kText(-c1)}.`,
                `Slope: (${kText(c2)}) ÷ (${kText(-c1)}) = ${key}.`,
              ]
              : [
                `Intercept form: x/(${kText(c1)}) + y/(${kText(c2)}) = 1.`,
                `Multiply every term by ${kText(Math.abs(rc))} to clear the fractions${c1 < 0 ? ", then multiply by −1 so the x-term is positive" : ""}.`,
                `So ${key}. Check: x = ${kText(c1)}, y = 0 and x = 0, y = ${kText(c2)} both satisfy it.`,
              ],
            principles: [
              "The line through (a, 0) and (0, b) has slope −b/a and equation x/a + y/b = 1.",
              "Checking a choice at both intercepts confirms it.",
            ],
            trap: askSlope
              ? "The slope is rise over run, and the run from (a, 0) to (0, b) is −a, not a."
              : "Clearing the fractions puts the y-intercept's number with x and the x-intercept's number with y.",
            hint: "Where does each intercept put the line?",
            verify: () => {
              if (askSlope) return approx(valueOf(key), (by - 0) / (0 - ax)) && wrong.every(([text]) => !approx(valueOf(text), -by / ax));
              const on = (text) => [[ax, 0], [0, by]].every(([x, y]) => holds(text, { x, y, k: kValue }));
              return on(key) && wrong.every(([text]) => !on(text));
            },
          };
        }
        if (form === "slope-sum") {
          // Slope and a sum (or difference) of the intercepts.
          const a = t.nonzero(-12, 12);
          const b = t.nonzero(-12, 12);
          if (Math.abs(a) < 2 || Math.abs(b) < 2 || Math.abs(a) === Math.abs(b)) continue;
          const slope = frac(-b, a);
          // Slopes a student would meet: small numerators and denominators.
          if (Math.abs(a / S.gcd(a, b)) > 6 || Math.abs(b / S.gcd(a, b)) > 6) continue;
          const m = -b / a;
          const useSum = t.chance(0.6);
          const total = useSum ? a + b : b - a;
          const askB = t.chance(0.6);
          const key = askB ? b : a;
          // A slope read as +b/a gives b = m·a instead of b = −m·a.
          const aSlip = useSum ? total / (1 + m) : total / (m - 1);
          const bSlip = m * aSlip;
          const pool = [
            [askB ? a : b, `Gives the value of ${askB ? "a" : "b"}, the other intercept.`],
            [askB ? bSlip : aSlip, "Takes the slope to be b/a, the rise over the run with the sign of the run lost."],
            [askB ? aSlip : bSlip, `Takes the slope to be b/a and then reports ${askB ? "a" : "b"}.`],
            [total / 2, "Assumes the two intercepts are equal."],
          ].filter(([value]) => Number.isFinite(value) && exact(value) && Math.abs(value) < 1000);
          const numeric = t.chance(0.4);
          // The sign slip is the key's negation, so it is offered only with
          // the other intercept and that intercept's own sign slip.
          const other = askB ? a : b;
          const mirrored = [
            [-key, "Loses a sign in the last step."],
            [other, `Gives the value of ${askB ? "a" : "b"}, the other intercept.`],
            [-other, `Gives the value of ${askB ? "a" : "b"}, the other intercept, and loses its sign.`],
          ];
          const wrong = numeric ? [] : t.chance(0.3) ? t.shuffle(mirrored) : spreadAround(t, key, pool);
          if (!numeric && (collides(key, wrong) || distinctWrongHard(key, wrong) < 3)) continue;
          const condition = useSum ? `a + b = ${num(total)}` : `b ${MINUS} a = ${num(total)}`;
          const bInA = slopeTerm(b, a, "a");
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 115,
            stimulus: null,
            stem:
              `A line in the xy-plane has a slope of ${slope}. Its x-intercept is (a, 0) and its y-intercept is (0, b), where ` +
              `a and b are constants. If ${condition}, what is the value of ${askB ? "b" : "a"}?`,
            correct: key,
            wrong,
            explanation:
              `The slope from (a, 0) to (0, b) is (b ${MINUS} 0) ÷ (0 ${MINUS} a) = ${MINUS}b/a, so ${MINUS}b/a = ${slope} and ` +
              `b = ${bInA}. Substituting into ${condition} gives a = ${num(a)} and b = ${num(b)}.`,
            steps: [
              `Slope between the intercepts: ${MINUS}b/a = ${slope}, so b = ${bInA}.`,
              `Substitute into ${condition}: ${slopeTerm(useSum ? a + b : b - a, a, "a")} = ${num(total)}, so a = ${num(a)}.`,
              `Then b = ${num(b)}.`,
            ],
            principles: [
              "The slope between (a, 0) and (0, b) is −b/a.",
              "A second condition on a and b then gives one equation in one unknown.",
            ],
            trap: `The run from (a, 0) to (0, b) is −a, so the slope is −b/a; reading it as b/a gives a line with the same steepness tilted the other way.`,
            hint: "Write the slope using the two intercept points.",
            verify: () => {
              // Search every intercept pair on a grid of halves for the one that fits both conditions.
              const found = [];
              for (let i = -60; i <= 60; i += 1) {
                const A = i / 2;
                if (A === 0) continue;
                const Bv = useSum ? total - A : total + A;
                if (Bv !== 0 && approx(-Bv / A, valueOf(slope))) found.push([A, Bv]);
              }
              return found.length === 1 && approx(askB ? found[0][1] : found[0][0], key);
            },
          };
        }
        // ratio-point: a = r·b, and the line passes through (x1, y1).
        // Not 2: a = 2b would make a the key's double, a look-alike of it.
        const r = t.pick([3, 4, -2, -3, -4]);
        const b = t.nonzero(-9, 9);
        const x1 = r * t.nonzero(-3, 3);
        const y1 = b - x1 / r;
        if (Math.abs(y1) > 15 || x1 === 0 || y1 === 0 || Math.abs(b) < 2) continue;
        const key = b;
        const pool = [
          [r * b, "Gives a, the x-coordinate of the x-intercept."],
          [y1 + r * x1, `Uses a slope of ${num(-r)}: divides a by b instead of b by a.`],
          [y1 - x1 / r, `Uses a slope of ${frac(1, r)}, which loses the minus sign in −b/a.`],
          [y1 - r * x1, `Uses a slope of ${num(r)}: inverts the slope and loses its sign.`],
          [y1, "Gives the y-coordinate of the given point."],
        ].filter(([value]) => exact(value));
        const numeric = t.chance(0.4);
        const wrong = numeric ? [] : spreadAround(t, key, pool);
        if (!numeric && (collides(key, wrong) || distinctWrongHard(key, wrong) < 3)) continue;
        const rText = r < 0 ? `${MINUS}${Math.abs(r)}b` : `${r}b`;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 115,
          stimulus: null,
          stem:
            `In the xy-plane, a line has x-intercept (a, 0) and y-intercept (0, b), where a and b are nonzero constants ` +
            `and a = ${rText}. The line passes through the point ${point(x1, y1)}. What is the value of b?`,
          correct: key,
          wrong,
          explanation:
            `The slope is ${MINUS}b/a = ${MINUS}b/(${rText}) = ${frac(-1, r)} whatever b is, so the line is y = ${slopeTerm(-1, r)} + b. ` +
            `Through ${point(x1, y1)}: ${num(y1)} = (${frac(-1, r)})(${num(x1)}) + b, so b = ${num(b)}.`,
          steps: [
            `Slope between the intercepts: ${MINUS}b/a = ${MINUS}b/(${rText}) = ${frac(-1, r)}.`,
            `The line is y = ${slopeTerm(-1, r)} + b.`,
            `Substitute ${point(x1, y1)}: ${num(y1)} = ${num(-x1 / r)} + b, so b = ${num(b)}.`,
          ],
          principles: [
            "The slope between (a, 0) and (0, b) is −b/a, so a fixed ratio of the intercepts fixes the slope.",
            "A slope and one point determine a line.",
          ],
          trap: `The condition a = ${rText} fixes the slope at ${frac(-1, r)}; using ${num(-r)} divides the intercepts the wrong way round.`,
          hint: "What does the relation between a and b say about the slope?",
          verify: () => {
            // (r·b, 0), (0, b), and (x1, y1) are collinear for exactly one nonzero b on a grid of halves.
            const collinear = (bb) => approx((0 - r * bb) * (y1 - 0) - (bb - 0) * (x1 - r * bb), 0);
            const found = [];
            for (let i = -80; i <= 80; i += 1) if (i !== 0 && collinear(i / 2)) found.push(i / 2);
            return found.length === 1 && found[0] === key;
          },
        };
      }
    },
  };

  /* --------------------------------------------------- integer-combination-count */

  // Two kinds of item whose sizes a and b share a common factor g half the
  // time. x and y name the cheaper and the dearer kind. Every scene reads a
  // count of one with the singular noun.
  const comboScenes = [
    {
      kinds: ["bracelet", "bracelets", "necklace", "necklaces"], maxB: 30, verb: "sold",
      text: (v, both) =>
        `At a craft fair, a vendor sells bracelets for ${usd(v.a)} each and necklaces for ${usd(v.b)} each. On ` +
        `Saturday, the vendor's sales of bracelets and necklaces totaled ${usd(v.C)}, and the vendor ${both
          ? "sold at least one bracelet and at least one necklace"
          : "may have sold no bracelets or no necklaces"}.`,
      total: (v) => `${usd(v.C)} in sales`,
    },
    {
      kinds: ["easy question", "easy questions", "hard question", "hard questions"], maxB: 18, verb: "answered correctly",
      text: (v, both) =>
        `In a trivia game, a team earns ${v.a} points for each easy question and ${v.b} points for each hard question ` +
        `it answers correctly, and no points otherwise. A team finished the game with exactly ${v.C} points${both
          ? " and answered at least one easy question and at least one hard question correctly"
          : "; it may have answered no easy questions or no hard questions correctly"}.`,
      total: (v) => `${v.C} points`,
    },
    {
      kinds: ["small box", "small boxes", "large box", "large boxes"], maxB: 30, verb: "in the crate",
      text: (v, both) =>
        `A shipping crate is packed with small boxes that weigh ${v.a} pounds each and large boxes that weigh ${v.b} ` +
        `pounds each. The boxes in the crate weigh exactly ${S.grouped(v.C)} pounds in all, and the crate ${both
          ? "holds at least one box of each size"
          : "may hold boxes of only one size"}.`,
      total: (v) => `${S.grouped(v.C)} pounds`,
    },
    {
      kinds: ["binder", "binders", "storage box", "storage boxes"], maxB: 15, verb: "on the shelf",
      text: (v, both) =>
        `A shelf is exactly ${v.C} inches long. It is filled end to end, with no gaps, by binders that are ${v.a} inches ` +
        `wide and storage boxes that are ${v.b} inches wide${both
          ? ", and at least one of each is on the shelf"
          : "; the shelf may hold only binders or only storage boxes"}.`,
      total: (v) => `${v.C} inches`,
    },
  ];

  const comboCount = {
    id: "integer-combination-count",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "equation modeling",
    difficulty: "Hard",
    title: "Whole-number solutions of a two-variable linear equation in context",
    recognize:
      "The story is ax + by = c with x and y whole numbers. Find one solution, then trade one kind for the other " +
      "without changing the total: after dividing out any common factor of a and b, x moves in steps of b and y in " +
      "steps of a. Count or bound the solutions only after deciding whether 0 of a kind is allowed.",
    // Hard: the structure of whole-number solutions must be seen before any
    // counting, and both the step size and the zero case are traps.
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["context-constraint", "neighbouring-rule", "wrong-quantity", "reversed-condition"],
    build(t) {
      const scene = t.pick(comboScenes);
      const form = t.pick(["count", "count", "greatest", "least"]);
      const both = t.chance(0.5);
      // A combination with none of one kind is possible most of the time, so
      // the "at least one of each" condition decides the answer.
      const wantZero = t.chance(0.7);
      const numeric = t.chance(0.45);
      const [xOne, xMany, yOne, yMany] = scene.kinds;
      for (;;) {
        const g = t.pick([1, 1, 2, 3]);
        const ap = t.int(2, 6);
        const bp = t.int(ap + 1, 9);
        if (S.gcd(ap, bp) !== 1) continue;
        const a = g * ap;
        const b = g * bp;
        if (b > scene.maxB) continue;
        const C = g * t.int(2 * ap * bp, 5 * ap * bp);
        const v = { a, b, C };
        // Every whole-number solution, x ascending.
        const all = [];
        for (let x = 0; a * x <= C; x += 1) if ((C - a * x) % b === 0) all.push([x, (C - a * x) / b]);
        const hasZero = all.some(([x, y]) => x === 0 || y === 0);
        if (hasZero !== wantZero) continue;
        const solutions = both ? all.filter(([x, y]) => x > 0 && y > 0) : all;
        if (solutions.length < 3 || solutions.length > 9) continue;
        const askX = t.chance(0.5);
        const [one, many] = askX ? [xOne, xMany] : [yOne, yMany];
        const [otherMany] = askX ? [yMany] : [xMany];
        const pick = ([x, y]) => (askX ? x : y);
        const values = solutions.map(pick);
        const lowest = Math.min(...values);
        const highest = Math.max(...values);
        const capital = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
        const zeroRule = both
          ? `counts a combination with none of one kind, though at least one of each is required`
          : `leaves out the combination with none of one kind, which is allowed`;
        const first = solutions[0];
        const reduced = g === 1 ? "" : ` Dividing by ${g} gives ${lin(ap, 0)} + ${lin(bp, 0, "y")} = ${num(C / g)}.`;
        let key;
        const wrong = [];
        let stem;
        let answerStep;
        if (form === "count") {
          key = solutions.length;
          const positive = all.filter(([x, y]) => x > 0 && y > 0).length;
          const edges = all.length - positive;
          if (hasZero) {
            wrong.push([both ? all.length : positive, both
              ? `Counts ${edges === 1 ? "a combination" : "the combinations"} with none of one kind, though at least one of each is required.`
              : `Leaves out ${edges === 1 ? "the combination" : "the combinations"} with none of one kind, which ${edges === 1 ? "is" : "are"} allowed.`]);
          }
          if (g > 1) {
            const coarse = solutions.filter(([x]) => (x - first[0]) % b === 0).length;
            wrong.push([coarse, `Steps the number of ${xMany} by ${b} instead of ${bp}; after dividing out the common factor ${g}, ${bp} more ${xMany} and ${ap} fewer ${yMany} keep the total the same.`]);
          }
          const span = solutions[solutions.length - 1][0] - first[0];
          wrong.push([key - 1, `Divides the range of the number of ${xMany}, ${num(span)}, by the step ${bp} without counting both ends.`]);
          wrong.push([key + 1, `Divides the range of the number of ${xMany}, ${num(span)}, by the step ${bp} and then adds 1 for each end, counting one combination twice.`]);
          const start = both ? 1 : 0;
          const yRange = Math.floor((C - (both ? a : 0)) / b) - start + 1;
          wrong.push([yRange, `Counts every possible number of ${yMany} from ${start} up, without checking that the rest of the total is a whole number of ${xMany}.`]);
          const xRange = Math.floor((C - (both ? b : 0)) / a) - start + 1;
          wrong.push([xRange, `Counts every possible number of ${xMany} from ${start} up, without checking that the rest of the total is a whole number of ${yMany}.`]);
          stem = `${scene.text(v, both)} How many different combinations of numbers of ${xMany} and ${yMany} are possible?`;
          answerStep = `There are ${key} combinations.`;
        } else {
          const greatest = form === "greatest";
          key = greatest ? highest : lowest;
          const size = askX ? a : b;
          const otherSize = askX ? b : a;
          const naive = greatest
            ? Math.floor((C - (both ? otherSize : 0)) / size)
            : both ? 1 : 0;
          wrong.push([naive, greatest
            ? `Divides ${both ? `what is left after one of the other kind` : "the whole total"} by ${size} and rounds down, without checking that the rest is a whole number of ${otherMany}.`
            : `Takes the smallest number the condition allows, without checking that the rest is a whole number of ${otherMany}.`]);
          const at = solutions[values.indexOf(key)];
          wrong.push([askX ? at[1] : at[0], `Gives the number of ${otherMany} in that combination, not the number of ${many}.`]);
          wrong.push([greatest ? lowest : highest, `Gives the ${greatest ? "least" : "greatest"} possible number of ${many}, not the ${greatest ? "greatest" : "least"}.`]);
          // The answer under the other reading of "none of one kind", when it differs.
          const otherReading = (both ? all : all.filter(([x, y]) => x > 0 && y > 0)).map(pick);
          const edge = otherReading.length ? (greatest ? Math.max(...otherReading) : Math.min(...otherReading)) : key;
          if (edge !== key) wrong.push([edge, `${capital(zeroRule)}.`]);
          // The quick answer must be wrong, or the item does not test the trap.
          if (naive === key) continue;
          stem = `${scene.text(v, both)} What is the ${greatest ? "greatest" : "least"} possible number of ${many} ${scene.verb}?`;
          answerStep = `The ${greatest ? "greatest" : "least"} number of ${many} is ${key}.`;
        }
        if (key <= 0 && form === "count") continue;
        if (collides(key, wrong) || distinctWrong(key, wrong.filter(([value]) => value >= 0)) < 3) continue;
        const offered = spreadAround(t, key, wrong.filter(([value]) => value >= 0));
        const list = solutions.map(([x, y]) => `(${x}, ${y})`).join(", ");
        const steps = [
          `Let x be the number of ${xMany} and y the number of ${yMany}: ${lin(a, 0)} + ${lin(b, 0, "y")} = ${num(C)}.${reduced}`,
          `One solution is x = ${first[0]}, y = ${first[1]}. Adding ${bp} to x and taking ${ap} from y keeps the total the same, and no smaller trade does.`,
          `${both ? "With at least one of each" : "Allowing none of one kind"}, the combinations (x, y) are ${list}.`,
          answerStep,
        ];
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 130,
          stimulus: null,
          stem,
          correct: key,
          wrong: numeric ? [] : offered,
          explanation: steps.join(" "),
          steps,
          principles: [
            "If (x, y) solves ax + by = c, so does (x + b/g, y − a/g), where g is the greatest common factor of a and b; these trades give every whole-number solution.",
            "A count of items can be 0 only when the situation allows none of that kind.",
          ],
          trap: both
            ? `A combination with none of one kind fits the total but not the condition "at least one of each".`
            : form === "count"
              ? `A combination with none of one kind fits the total and is allowed here; dividing a range by the step also drops one end.`
              : `A combination with none of one kind fits the total and is allowed here, so it can be the ${form === "greatest" ? "greatest" : "least"} value.`,
          hint: "Find one combination that works, then ask how to trade one kind for the other without changing the total.",
          verify: () => {
            // Recount from the stated numbers, looping over y this time.
            const found = [];
            for (let y = both ? 1 : 0; b * y <= C; y += 1) {
              const rest = C - b * y;
              if (rest % a === 0 && (!both || rest / a >= 1)) found.push([rest / a, y]);
            }
            const shown = found.map(pick);
            const answer = form === "count" ? found.length : form === "greatest" ? Math.max(...shown) : Math.min(...shown);
            return answer === key && found.every(([x, y]) => a * x + b * y === C);
          },
        };
      }
    },
  };

  return [
    pointOnLine, standardFormSlope, equationModel, graphContext, linearModelUnits, interceptMeaning, pointShift,
    translatedLine, interceptConditions, comboCount,
  ];
});
