(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/algebra"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Linear equations in one variable templates (Algebra), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, signed, lin, frac, approx } = S;
  const {
    clean, terminates, commas, usd, money, distinctWrong, commaChoices, responseFor, xTerm,
    moveText, compile, holds, sidesOf, fitsGridHard, usdHard, distinctWrongHard, compileHard,
  } = C;

  /* ------------------------------------------------------ linear-equation-solve */

  function solveBothSides(t) {
    const a = t.int(2, 9);
    const c = t.nonzero(-6, 8);
    const k = a - c;
    if (k < 2) return null;
    const x0 = t.nonzero(-9, 12);
    const b = t.nonzero(-15, 15);
    const d = k * x0 + b;
    if (Math.abs(d) > 60) return null;
    const cTerm = lin(c, 0);
    return {
      equation: `${lin(a, b)} = ${lin(c, d)}`,
      key: x0,
      wrong: [
        [(d + b) / k, `Moves ${num(b)} across the equals sign without changing its sign.`],
        [(d - b) / (a + c), `Moves ${cTerm} to the left side without changing its sign, getting ${lin(a + c, 0)}.`],
        [d - b, `Stops at ${lin(k, 0)} = ${num(d - b)}, before dividing by ${k}.`],
        [(b - d) / k, `Computes ${num(b)} ${MINUS} ${paren(d)} instead of ${num(d)} ${MINUS} ${paren(b)}, which flips the sign.`],
      ],
      steps: [
        `${moveText(c, "x")}: ${lin(k, b)} = ${num(d)}.`,
        `${moveText(b)}: ${lin(k, 0)} = ${num(d - b)}.`,
        `Divide both sides by ${k}: x = ${num(x0)}.`,
      ],
      explanation:
        `Collect the x-terms on the left and the constants on the right: ${lin(k, 0)} = ${num(d - b)}. ` +
        `Dividing both sides by ${k} gives x = ${num(x0)}.`,
    };
  }

  function solveGrouped(t) {
    const p = t.int(2, 9);
    const q = t.nonzero(-9, 9);
    const x0 = t.nonzero(-9, 12);
    if (x0 + q === 0) return null;
    const r = p * (x0 + q);
    if (Math.abs(r) > 99) return null;
    const inner = `x ${signed(q)}`;
    return {
      equation: t.chance(0.75) ? `${p}(${inner}) = ${num(r)}` : `${num(r)} = ${p}(${inner})`,
      key: x0,
      wrong: [
        [x0 + q, `Stops at ${inner} = ${num(x0 + q)}, before ${q > 0 ? "subtracting" : "adding"} ${Math.abs(q)}.`],
        [x0 + 2 * q, `Moves ${num(q)} across the equals sign without changing its sign.`],
        [(r - q) / p, `Multiplies only x by ${p}, as if the equation were ${p}x ${signed(q)} = ${num(r)}.`],
        [p * x0, `Distributes and moves ${num(p * q)} correctly, then stops before dividing by ${p}.`],
      ],
      steps: [
        `Divide both sides by ${p}: ${inner} = ${num(x0 + q)}.`,
        `${moveText(q)}.`,
        `x = ${num(x0)}.`,
      ],
      explanation:
        `Dividing both sides by ${p} gives ${inner} = ${num(r)} ÷ ${p} = ${num(x0 + q)}, so x = ${num(x0 + q)} ${signed(-q)} = ${num(x0)}.`,
    };
  }

  function solveFraction(t) {
    const p = t.int(2, 8);
    const m = t.nonzero(-9, 9);
    const q = t.nonzero(-12, 12);
    const x0 = p * m;
    const r = m + q;
    return {
      equation: `x/${p} ${signed(q)} = ${num(r)}`,
      key: x0,
      wrong: [
        [m, `Stops at x/${p} = ${num(m)}, before multiplying by ${p}.`],
        [p * (r + q), `Moves ${num(q)} across the equals sign without changing its sign.`],
        [p * r - q, `Multiplies both sides by ${p} but forgets to multiply ${num(q)}.`],
        [(r - q) / p, `Divides by ${p} instead of multiplying by ${p}.`],
      ],
      steps: [
        `${moveText(q)}: x/${p} = ${num(m)}.`,
        `Multiply both sides by ${p}.`,
        `x = ${p} · ${paren(m)} = ${num(x0)}.`,
      ],
      explanation: `${moveText(q)} to get x/${p} = ${num(m)}; multiplying by ${p} gives x = ${num(x0)}.`,
    };
  }

  /* ----------------------------------------------- linear-equation-context-meaning */

  const meaningScenes = [
    {
      letter: "h", unit: "hour", units: "hours",
      make: (t) => ({ rate: 5 * t.int(12, 25), start: 5 * t.int(6, 24), n: t.int(2, 8), up: true }),
      equation: (v) => `${v.rate}h + ${v.start} = ${money(v.total)}`,
      lead: (eq, v) =>
        `A plumber charges a fee for each repair plus an amount for each hour of work. The equation ${eq} ` +
        `represents a repair for which the plumber charged ${usd(v.total)}, where h is the number of hours the repair took.`,
      roles: {
        start: "The fixed fee, in dollars, for any repair",
        rate: "The charge, in dollars, per hour of work",
        total: "The total charge, in dollars, for this repair",
        count: "The number of hours this repair took",
        part: "The charge, in dollars, for h hours of work",
      },
    },
    {
      letter: "m", unit: "mile", units: "miles",
      make: (t) => ({ rate: t.pick([1.75, 2.25, 2.5, 2.75, 3.25]), start: t.pick([2.25, 2.5, 3, 3.25, 3.75, 4.5]), n: t.int(3, 14), up: true }),
      equation: (v) => `${money(v.rate)}m + ${money(v.start)} = ${money(v.total)}`,
      lead: (eq, v) =>
        `A taxi company charges a base fare plus an amount for each mile driven. The equation ${eq} represents a ` +
        `ride that cost ${usd(v.total)}, where m is the number of miles driven.`,
      roles: {
        start: "The fare, in dollars, before any miles are driven",
        rate: "The fare, in dollars, for each mile driven",
        total: "The total fare, in dollars, for this ride",
        count: "The number of miles driven on this ride",
        part: "The fare, in dollars, for m miles of driving",
      },
    },
    {
      letter: "w", unit: "week", units: "weeks",
      make: (t) => ({ rate: 5 * t.int(5, 30), start: 50 * t.int(16, 60), n: t.int(3, 12), up: false }),
      equation: (v) => `${commas(v.start)} ${MINUS} ${v.rate}w = ${commas(v.total)}`,
      lead: (eq, v) =>
        `Nadia withdrew the same amount from her savings account each week and made no deposits. The equation ${eq} ` +
        `represents the week when her balance reached ${usd(v.total)}, where w is the number of weeks since her first withdrawal.`,
      roles: {
        start: "The balance, in dollars, before any withdrawals",
        rate: "The amount, in dollars, withdrawn each week",
        total: "The balance, in dollars, after w weeks",
        count: "The number of weeks of withdrawals",
        part: "The total amount, in dollars, withdrawn in w weeks",
      },
    },
    {
      letter: "t", unit: "minute", units: "minutes",
      make: (t) => ({ rate: t.int(8, 35), start: 20 * t.int(20, 60), n: t.int(5, 20), up: false }),
      equation: (v) => `${commas(v.start)} ${MINUS} ${v.rate}t = ${commas(v.total)}`,
      lead: (eq, v) =>
        `Water drains from a tank at a constant rate. The equation ${eq} represents the time when ${commas(v.total)} ` +
        "liters of water remain in the tank, where t is the number of minutes since the water began draining.",
      roles: {
        start: "The volume, in liters, in the tank before draining began",
        rate: "The volume, in liters, that drains each minute",
        total: "The volume, in liters, left in the tank after t minutes",
        count: "The number of minutes the tank has drained",
        part: "The volume, in liters, that drains in t minutes",
      },
    },
    {
      letter: "n", unit: "shirt", units: "shirts",
      make: (t) => ({ rate: t.pick([6.5, 7.5, 8.5, 9, 11, 12.5]), start: 5 * t.int(5, 16), n: t.int(12, 60), up: true }),
      equation: (v) => `${money(v.rate)}n + ${v.start} = ${money(v.total)}`,
      lead: (eq, v) =>
        `A print shop charges a setup fee for each order of T-shirts plus an amount for each shirt printed. The ` +
        `equation ${eq} represents an order that cost ${usd(v.total)}, where n is the number of shirts in the order.`,
      roles: {
        start: "The setup fee, in dollars, charged once per order",
        rate: "The cost, in dollars, of printing each shirt",
        total: "The total cost, in dollars, of this order",
        count: "The number of shirts in this order",
        part: "The cost, in dollars, of printing n shirts",
      },
    },
    {
      letter: "h", unit: "hour", units: "hours",
      make: (t) => ({ rate: 25 * t.int(8, 20), start: 50 * t.int(10, 60), n: t.int(2, 6), up: true, startFirst: true }),
      equation: (v) => `${commas(v.start)} + ${v.rate}h = ${commas(v.total)}`,
      lead: (eq, v) =>
        `A hiker climbs from a trailhead at a constant rate. The equation ${eq} represents the time when the hiker ` +
        `reaches an elevation of ${commas(v.total)} feet, where h is the number of hours since the hiker left the trailhead.`,
      roles: {
        start: "The elevation, in feet, of the trailhead",
        rate: "The number of feet the hiker climbs each hour",
        total: "The hiker's elevation, in feet, after h hours",
        count: "The number of hours the hiker has climbed",
        part: "The number of feet the hiker climbs in h hours",
      },
    },
  ];

  /* ------------------------------------------------------ equation-solution-count */

  const COUNT = { one: "Exactly one", two: "Exactly two", many: "Infinitely many", none: "Zero" };

  // Linear coefficient and constant of (left − right), read from the display.
  function linearDifference(equation, extra = {}) {
    const [left, right] = sidesOf(equation);
    const D = (x) => left({ ...extra, x }) - right({ ...extra, x });
    const d0 = D(0);
    return { slope: D(1) - d0, constant: d0, straight: approx(D(2) - d0, 2 * (D(1) - d0)) };
  }

  function countOf(equation, extra) {
    const { slope, constant, straight } = linearDifference(equation, extra);
    if (!straight) return null;
    if (!approx(slope, 0)) return "one";
    return approx(constant, 0) ? "many" : "none";
  }

  /* ------------------------------------------------------ linear-equation-word-model */

  const countScenes = [
    {
      make: (t) => {
        const rate = t.int(18, 45);
        return { fixed: rate * t.int(1, 3), rate, n: t.int(3, 14) };
      },
      total: (v) => v.fixed + v.rate * v.n,
      text: (v, T) =>
        `A gym charges a one-time sign-up fee of ${usd(v.fixed)} plus ${usd(v.rate)} per month. Dana has paid the ` +
        `gym a total of ${usd(T)}, including the sign-up fee. For how many months has Dana been a member?`,
      unit: "months", fixedName: "sign-up fee", model: (v) => `${v.fixed} + ${v.rate}n`,
      extra: [],
    },
    {
      make: (t) => {
        const rate = t.pick([0.2, 0.25, 0.4, 0.5]);
        const fixed = rate === 0.4 ? 2 * t.int(12, 30) : t.int(25, 60);
        return { fixed, rate, n: 5 * t.int(8, 60) };
      },
      total: (v) => clean(v.fixed + v.rate * v.n),
      text: (v, T) =>
        `A car rental company charges ${usd(v.fixed)} per day plus ${usd(v.rate)} for each mile driven. For a one-day ` +
        `rental, Luis paid ${usd(T)}. How many miles did Luis drive?`,
      unit: "miles", fixedName: "daily charge", model: (v) => `${money(v.fixed)} + ${money(v.rate)}n`,
      extra: [],
    },
    {
      make: (t) => {
        const rate = t.int(2, 6);
        return { fixed: rate * t.int(2, 3), rate, n: t.int(3, 10) };
      },
      // n counts all hours; only n − 1 of them are charged at the additional rate.
      total: (v) => v.fixed + v.rate * (v.n - 1),
      text: (v, T) =>
        `A parking garage charges ${usd(v.fixed)} for the first hour of parking and ${usd(v.rate)} for each additional ` +
        `hour. A driver paid ${usd(T)} for parking. For how many hours was the car parked?`,
      unit: "hours", fixedName: "first-hour charge", model: (v) => `${v.fixed} + ${v.rate}(n ${MINUS} 1)`,
      extra: ["additional"],
    },
    {
      make: (t) => {
        const rate = 5 * t.int(3, 12);
        return { fixed: rate * t.int(2, 8), rate, n: t.int(4, 20) };
      },
      total: (v) => v.fixed + v.rate * v.n,
      text: (v, T) =>
        `Mei has ${usd(v.fixed)} in a savings account. She plans to deposit ${usd(v.rate)} into the account at the end ` +
        `of each week and make no withdrawals. After how many weekly deposits will the balance be ${usd(T)}?`,
      unit: "deposits", fixedName: "starting balance", model: (v) => `${v.fixed} + ${v.rate}n`,
      extra: [],
    },
    {
      make: (t) => {
        const rate = t.pick([0.5, 1.5, 2, 2.5]);
        return { fixed: t.int(20, 40), rate, n: t.int(3, 12) };
      },
      total: (v) => clean(v.fixed - v.rate * v.n),
      text: (v, T) =>
        `A candle that is ${v.fixed} centimeters tall burns down at a constant rate of ${num(v.rate)} ` +
        `centimeter${v.rate === 1 ? "" : "s"} per hour. After how many hours of burning will the candle be ` +
        `${num(T)} centimeters tall?`,
      unit: "hours", fixedName: "starting height", model: (v) => `${v.fixed} ${MINUS} ${num(v.rate)}n`,
      extra: ["down"],
    },
  ];

  const rateScenes = [
    {
      make: (t) => {
        const h = t.pick([2, 4, 5]);
        return { h, fixed: 5 * t.int(9, 24), rate: t.int(40, 95) };
      },
      text: (v, T) =>
        `An electrician charges a fixed fee for a house call plus an hourly rate for labor. The fixed fee is ` +
        `${usd(v.fixed)}. A house call that included ${v.h} hours of labor cost ${usd(T)} in total. What is the ` +
        "electrician's hourly rate, in dollars?",
      per: "hour", count: "hours", fixedName: "fixed fee",
    },
    {
      make: (t) => {
        const h = t.pick([4, 5, 10]);
        return { h, fixed: h * t.int(1, 3), rate: t.pick([1.25, 1.5, 1.75, 2.25, 2.5]) };
      },
      text: (v, T) =>
        `A courier charges a base fee of ${usd(v.fixed)} for each delivery plus a charge for each mile. A ` +
        `${v.h}-mile delivery cost ${usd(T)}. What is the courier's charge per mile, in dollars?`,
      per: "mile", count: "miles", fixedName: "base fee",
    },
    {
      make: (t) => {
        const h = t.pick([4, 5, 8, 10]);
        return { h, fixed: 5 * t.int(4, 20), rate: t.int(12, 40) };
      },
      text: (v, T) =>
        `A kayak rental shop charges a ${usd(v.fixed)} deposit plus an hourly fee. Renting a kayak for ${v.h} hours ` +
        `costs ${usd(T)}, including the deposit. What is the hourly fee, in dollars?`,
      per: "hour", count: "hours", fixedName: "deposit",
    },
  ];

  // Keeps a distractor only when it reads like a clean answer (integer, or cents).
  const tidy = (value) => (Number.isFinite(value) && terminates(value) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-6 ? clean(value) : null);

  // Awkward, deterministic probe values, one set per trial.
  function probe(letters, trial) {
    const values = {};
    letters.forEach((letter, index) => {
      values[letter] = 1.3 + ((letter.charCodeAt(0) * 7 + index * 5 + trial * 11) % 19) * 0.41;
    });
    return values;
  }

  // Checks, from the displayed text alone, that `keyText` solves `formula`
  // ("T = (3d + 2h)/(5m)") for `target` and that every wrong text does not.
  function solvesFor(formula, target, keyText, wrongTexts) {
    const [output, right] = formula.split(" = ");
    const model = compileHard(right);
    const letters = [...new Set(right.match(/[A-Za-z]/g))];
    if (keyText.includes(target)) return false;
    const key = compileHard(keyText);
    const wrongs = wrongTexts.map(compileHard);
    const misses = wrongs.map(() => false);
    for (let trial = 0; trial < 4; trial += 1) {
      const values = probe(letters, trial);
      values[output] = model(values);
      const truth = values[target];
      const known = { ...values };
      delete known[target];
      if (!approx(key(known), truth, 1e-7)) return false;
      wrongs.forEach((wrong, index) => {
        if (!approx(wrong(known), truth, 1e-7)) misses[index] = true;
      });
    }
    return misses.every(Boolean);
  }

  // Exact fractions for scale factors: { n, d } in lowest terms, d > 0.
  function ratio(n, d = 1) {
    const divisor = S.gcd(n, d);
    const sign = d < 0 ? -1 : 1;
    return { n: (sign * n) / divisor, d: (sign * d) / divisor };
  }

  const ratioTimes = (x, y) => ratio(x.n * y.n, x.d * y.d);

  const ratioPlus = (x, y) => ratio(x.n * y.d + y.n * x.d, x.d * y.d);

  const ratioPow = (x, e) => (e >= 0 ? ratio(x.n ** e, x.d ** e) : ratio(x.d ** -e, x.n ** -e));

  const ratioValue = (x) => x.n / x.d;

  const ratioText = (x) => frac(x.n, x.d);

  /* -------------------------------------------------- literal-equation-rearrange */

  // y = (pA ± qB)/(rC), invented but plausible weighted-rate formulas.
  const formulaScenes = [
    {
      y: "T", A: "d", B: "h", C: "m", sign: 1,
      text: "A running coach computes a training score T for a run with the given formula, where d is the distance, " +
        "in kilometers, h is the elevation gain, in meters, and m is the running time, in minutes.",
    },
    {
      y: "I", A: "R", B: "S", C: "N", sign: 1,
      text: "A hydrologist estimates the average daily inflow I, in millions of gallons, to a reservoir with the given " +
        "formula, where R is the total rainfall and S is the total snowmelt, both in inches, over a period of N days.",
    },
    {
      y: "G", A: "b", B: "d", C: "t", sign: -1,
      text: "A biologist estimates the net growth rate G of a bacterial culture with the given formula, where b is the " +
        "number of new cells and d is the number of cells that died, both in thousands, over t hours.",
    },
    {
      y: "E", A: "P", B: "M", C: "n", sign: -1,
      text: "A game designer computes a player's efficiency rating E with the given formula, where P is the number of " +
        "points the player scored, M is the number of mistakes, and n is the number of games played.",
    },
  ];

  // c = (a + kx)/(v + x): x appears in the numerator and the denominator.
  const mixtureScenes = [
    {
      out: "c", total: "a", base: "v", ks: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.6, 0.65, 0.7, 0.75, 0.8],
      text: (k) =>
        "A tank holds v liters of a solution that contains a liters of pure acid. After x liters of a solution " +
        `that is ${num(clean(k * 100))}% acid are added, the fraction of the mixture that is acid is c, as given by the equation.`,
    },
    {
      out: "m", total: "s", base: "n", ks: [84, 86, 88, 90, 92, 94, 95, 96, 98],
      text: (k) =>
        `A student has earned a total of s points on n quizzes. If the student earns ${k} points on each of the ` +
        "next x quizzes, the student's mean score on all the quizzes will be m, as given by the equation.",
    },
    {
      out: "p", total: "d", base: "w", ks: [6, 7, 8, 9, 11, 12, 13, 14, 15, 16],
      text: (k) =>
        "A coffee roaster has w pounds of a blend with a total value of d dollars. After x pounds of beans worth " +
        `${usdHard(k)} per pound are mixed in, the value of the blend, in dollars per pound, is p, as given by the equation.`,
    },
  ];

  // Power-law formulas for the "how many times" form. vars: exponent of each input.
  const powerScenes = [
    {
      out: "L", K: [0.6, 0.8, 1.2, 1.5], formula: (K) => `L = ${num(K)}wd²/s`, vars: { w: 1, d: 2, s: -1 },
      names: { w: "width", d: "depth", s: "span" }, outName: "maximum load",
      text: "The given formula models the maximum load L, in kilograms, that a wooden beam can support, where w is " +
        "the beam's width and d is its depth, both in centimeters, and s is the length of its span, in meters.",
    },
    {
      out: "F", K: [0.3, 0.4, 0.6, 0.65], formula: (K) => `F = ${num(K)}Av²`, vars: { A: 1, v: 2 },
      names: { A: "area", v: "speed" }, outName: "drag force",
      text: "The given formula models the drag force F, in newtons, on a flat panel moving through air, where A is " +
        "the panel's area, in square meters, and v is its speed, in meters per second.",
    },
    {
      out: "I", K: [8, 12, 15, 20], formula: (K) => `I = ${num(K)}P/d²`, vars: { P: 1, d: -2 },
      names: { P: "power", d: "distance from the lamp" }, outName: "light intensity",
      text: "The given formula models the light intensity I, in lux, at a point d meters from a lamp whose power is P watts.",
    },
    {
      out: "Q", K: [0.4, 0.8, 2.5], formula: (K) => `Q = ${num(K)}r⁴p/L`, vars: { r: 4, p: 1, L: -1 },
      names: { r: "radius", p: "pressure difference", L: "length" }, outName: "flow rate",
      text: "The given formula models the rate Q at which a liquid flows through a narrow pipe, where r is the " +
        "pipe's radius, p is the pressure difference between its ends, and L is its length.",
    },
  ];

  const CHANGES = [
    { factor: ratio(2), word: "doubled", gerund: "Doubling" },
    { factor: ratio(3), word: "tripled", gerund: "Tripling" },
    { factor: ratio(1, 2), word: "halved", gerund: "Halving" },
  ];

  const listLetters = (letters) =>
    `${letters.slice(0, -1).join(", ")}${letters.length > 2 ? "," : ""} and ${letters[letters.length - 1]}`;

  const equationSolve = {
    id: "linear-equation-solve",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "solve",
    difficulty: "Easy",
    title: "One-variable linear equation solved for x",
    recognize:
      "Only x is unknown: undo what was done to x one operation at a time, changing the sign of every term that " +
      "crosses the equals sign, and finish the last division.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 0, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "intermediate-value"],
    build(t) {
      const variant = t.int(0, 2);
      const numeric = t.chance(0.45);
      const stem = t.pick([
        "What value of x is the solution to the given equation?",
        "What is the solution to the given equation?",
      ]);
      for (;;) {
        const made = [solveBothSides, solveGrouped, solveFraction][variant](t);
        if (!made) continue;
        const { equation, key } = made;
        const wrong = made.wrong.filter(([value]) => Number.isInteger(value) && value !== key);
        if (distinctWrong(key, wrong) < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 55,
          stimulus: { type: "equations", content: equation },
          stem,
          correct: key,
          wrong,
          explanation: made.explanation,
          steps: made.steps,
          principles: ["Doing the same thing to both sides of an equation does not change its solution."],
          trap: "A term that crosses the equals sign changes sign, and the job is not done until x itself is alone.",
          hint: "Undo the operations on x in the reverse order they were applied.",
          verify: () => holds(equation, { x: key }) && wrong.every(([value]) => !holds(equation, { x: value })),
        };
      }
    },
  };

  const contextMeaning = {
    id: "linear-equation-context-meaning",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "interpret constants",
    difficulty: "Easy",
    title: "Meaning of a number in a context equation",
    recognize:
      "In a linear context equation, the number multiplied by the variable is the amount per unit, the number " +
      "standing alone is the amount that does not depend on the variable, and their product term is the amount for all units.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity"],
    build(t) {
      const scene = t.pick(meaningScenes);
      const form = t.pick(["start", "rate", "part"]);
      for (;;) {
        const v = scene.make(t);
        v.total = clean(v.up ? v.start + v.rate * v.n : v.start - v.rate * v.n);
        if (v.total <= 0 || v.start === v.rate || v.total === v.rate) continue;
        const equation = scene.equation(v);
        const L = scene.letter;
        const partText = `${money(v.rate)}${L}`;
        const asked = form === "start" ? commas(v.start) : form === "rate" ? money(v.rate) : partText;
        const roles = scene.roles;
        const reasons = {
          start: `That describes ${commas(v.start)}, the number that does not change with ${L}.`,
          rate: form === "part"
            ? `That describes ${money(v.rate)} alone; ${partText} is ${money(v.rate)} for each of the ${L} ${scene.units}.`
            : `That describes ${money(v.rate)}, the number multiplied by ${L}.`,
          total: `That describes ${commas(v.total)}, the value the whole ${v.up ? "left side" : "expression"} equals.`,
          count: `That describes ${L}, the unknown in the equation.`,
          part: form === "rate"
            ? `That describes ${partText}, the amount for all ${L} ${scene.units}; ${money(v.rate)} is the amount for one ${scene.unit}.`
            : `That describes ${partText}, the term that grows with ${L}.`,
        };
        const order = {
          start: ["rate", "part", t.pick(["total", "count"])],
          rate: ["part", "start", t.pick(["total", "count"])],
          part: ["rate", "total", t.pick(["start", "count"])],
        }[form];
        const wrong = order.map((role) => [roles[role], reasons[role]]);
        const lead = scene.lead(equation, v);
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 50,
          stimulus: null,
          stem: `${lead} What is the best interpretation of ${asked} in this context?`,
          correct: roles[form],
          wrong,
          explanation:
            form === "start"
              ? `${commas(v.start)} is not multiplied by ${L}, so it is the part of the amount that does not depend on ${L}: ${roles.start.charAt(0).toLowerCase()}${roles.start.slice(1)}.`
              : form === "rate"
                ? `${money(v.rate)} is multiplied by ${L}, so the amount changes by ${money(v.rate)} for each 1 added to ${L}: ${roles.rate.charAt(0).toLowerCase()}${roles.rate.slice(1)}.`
                : `${partText} is ${money(v.rate)} for each of the ${L} ${scene.units}, so it is ${roles.part.charAt(0).toLowerCase()}${roles.part.slice(1)}.`,
          steps: [
            `Identify the unknown: ${L}.`,
            `The term with ${L} is ${partText}; the number standing alone is ${commas(v.start)}; the equation sets the ${v.up ? "sum" : "difference"} equal to ${commas(v.total)}.`,
            `So ${asked} is ${roles[form].charAt(0).toLowerCase()}${roles[form].slice(1)}.`,
          ],
          principles: [
            "In a linear model, the coefficient of the variable is the change per unit of the variable, and the constant term is the value when the variable is 0.",
          ],
          trap: "The number multiplied by the variable is an amount per unit; the product term is the amount for all units; they are easy to swap.",
          hint: `Ask what would change if ${L} went up by 1.`,
          verify: () => {
            const [left, right] = sidesOf(equation);
            const at = (x) => left({ [L]: x });
            const startSeen = at(0);
            const rateSeen = Math.abs(at(1) - at(0));
            const totalSeen = right({});
            const solutions = [];
            for (let x = 0; x <= 200; x += 1) if (approx(at(x), totalSeen)) solutions.push(x);
            if (solutions.length !== 1 || solutions[0] !== v.n) return false;
            if (form === "start") return approx(startSeen, v.start) && !approx(startSeen, rateSeen);
            if (form === "rate") return approx(rateSeen, v.rate) && !approx(rateSeen, startSeen);
            return approx(compile(partText)({ [L]: v.n }), Math.abs(at(v.n) - at(0)));
          },
        };
      }
    },
  };

  const solutionCount = {
    id: "equation-solution-count",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "no or infinite solutions",
    difficulty: "Medium",
    title: "Number of solutions of a linear equation",
    recognize:
      "After both sides are simplified, equal x-coefficients mean the x-terms cancel: equal constants then give " +
      "infinitely many solutions and unequal constants give none; different x-coefficients give exactly one.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["reversed-condition", "sign-error"],
    build(t) {
      const form = t.pick(["count", "count", "noSolution", "infinite"]);
      const numeric = t.chance(0.5);
      for (;;) {
        const p = t.int(2, 6);
        const q = t.nonzero(-7, 7);
        const r = t.nonzero(-5, 5);
        const s = p + r;
        if (s === 0) continue;
        const left = `${p}(x ${signed(q)}) ${xTerm(r)}`;
        const expanded = lin(s, p * q);
        if (form === "count") {
          const kind = t.pick(["none", "many", "one"]);
          const u = kind === "none" ? p * q + t.nonzero(-6, 6) : p * q;
          const sRight = kind === "one" ? s + t.pick([-2, -1, 1, 2]) : s;
          if (sRight === 0) continue;
          const equation = `${left} = ${lin(sRight, u)}`;
          const general = "Treats the equation as having a solution for each x-term; a linear equation has zero, one, or infinitely many solutions.";
          const reasons = {
            none: {
              many: `Sees ${lin(s, 0)} on both sides and stops, without checking that the constants ${num(p * q)} and ${num(u)} differ.`,
              one: `Multiplies only ${num(q)} by ${p}, so the x-terms seem not to cancel.`,
              two: general,
            },
            many: {
              none: "Sees the x-terms cancel and concludes there is no solution, without checking that the constants also match.",
              one: `Multiplies only ${num(q)} by ${p}, so the two sides seem to differ.`,
              two: general,
            },
            one: {
              many: `Sees the same constant, ${num(u)}, on both sides and stops, without comparing the x-coefficients ${s} and ${sRight}.`,
              none: `Reaches ${lin(s - sRight, 0)} = 0 and reads it as no solution; x = 0 is a solution.`,
              two: general,
            },
          }[kind];
          const wrong = Object.entries(reasons).map(([other, reason]) => [COUNT[other], reason]);
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 80,
            stimulus: { type: "equations", content: equation },
            stem: "How many solutions does the given equation have?",
            correct: COUNT[kind],
            wrong,
            explanation:
              `The left side simplifies to ${expanded}. ` +
              (kind === "one"
                ? `The x-coefficients ${s} and ${sRight} differ, so exactly one value of x works (x = 0).`
                : kind === "many"
                  ? `That is exactly the right side, so every value of x is a solution.`
                  : `The x-terms match but the constants ${num(p * q)} and ${num(u)} do not, so no value of x works.`),
            steps: [
              `Distribute: ${p}(x ${signed(q)}) = ${lin(p, p * q)}.`,
              `Combine: the left side is ${expanded}; the right side is ${lin(sRight, u)}.`,
              kind === "one"
                ? `Different x-coefficients: exactly one solution.`
                : kind === "many"
                  ? "Identical sides: infinitely many solutions."
                  : "Same x-coefficient, different constants: no solution.",
            ],
            principles: [
              "ax + b = cx + d has exactly one solution when a ≠ c, none when a = c and b ≠ d, and infinitely many when a = c and b = d.",
            ],
            trap: "Matching x-terms is only half the check; the constants decide between no solution and infinitely many.",
            hint: "Simplify each side completely, then compare them piece by piece.",
            verify: () => countOf(equation) === kind,
          };
        }
        if (form === "noSolution") {
          const u = p * q + t.nonzero(-6, 6);
          const equation = `${left} = kx ${signed(u)}`;
          if (u === 0) continue;
          const key = s;
          const wrong = [
            [p, `Leaves out the ${lin(r, 0)} term when combining.`],
            [p - r, `Combines ${p}x and ${lin(r, 0)} with the wrong sign.`],
            [-s, `Moves kx to the left side without changing its sign, so it solves ${s} + k = 0.`],
            [p * q, "Matches the constant terms instead of the x-coefficients."],
          ];
          if (!numeric && distinctWrong(key, wrong) < 3) continue;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 85,
            stimulus: { type: "equations", content: equation },
            stem: "In the given equation, k is a constant. The equation has no solution. What is the value of k?",
            correct: key,
            wrong: numeric ? [] : wrong,
            explanation:
              `The left side simplifies to ${expanded}. With no solution, the x-terms must cancel while the constants ` +
              `(${num(p * q)} and ${num(u)}) differ, so k = ${num(s)}.`,
            steps: [
              `Distribute and combine: the left side is ${expanded}.`,
              `No solution requires equal x-coefficients: k = ${num(s)}.`,
              `The constants ${num(p * q)} and ${num(u)} differ, so the equation reduces to a false statement.`,
            ],
            principles: ["A linear equation has no solution when the x-terms cancel and leave two different constants."],
            trap: "The x-coefficient on the left is only known after the distributed term and the separate x-term are combined.",
            hint: "What must be true of the x-terms for no value of x to work?",
            verify: () => countOf(equation, { k: key }) === "none" && countOf(equation, { k: key + 1 }) === "one",
          };
        }
        const equation = `${left} = ${lin(s, 0)} + k`;
        const key = p * q;
        const wrong = [
          [q, `Multiplies only x by ${p}, leaving the constant as ${num(q)}.`],
          [-key, `Changes the sign of ${num(key)} while matching it.`],
          [p + q, `Adds ${p} and ${num(q)} instead of multiplying them.`],
          [key + r, `Folds the ${lin(r, 0)} term into the constant.`],
        ];
        if (!numeric && distinctWrong(key, wrong) < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 80,
          stimulus: { type: "equations", content: equation },
          stem: "In the given equation, k is a constant. If the equation has infinitely many solutions, what is the value of k?",
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation:
            `The left side simplifies to ${expanded}. Infinitely many solutions means the two sides are identical, so ` +
            `k must equal the constant ${num(key)}.`,
          steps: [
            `Distribute: ${p}(x ${signed(q)}) = ${lin(p, p * q)}.`,
            `Combine: the left side is ${expanded}; the x-terms already match.`,
            `Match the constants: k = ${num(key)}.`,
          ],
          principles: ["A linear equation has infinitely many solutions when both sides simplify to the same expression."],
          trap: "Distributing only to x leaves the constant unscaled.",
          hint: "Simplify the left side fully and compare it with the right.",
          verify: () => countOf(equation, { k: key }) === "many" && countOf(equation, { k: key + 1 }) === "none",
        };
      }
    },
  };

  const wordModel = {
    id: "linear-equation-word-model",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "solve",
    difficulty: "Medium",
    title: "Linear equation written from a pricing or rate story",
    recognize:
      "The total is a fixed part plus a rate times a count; take the fixed part away before dividing by the rate, " +
      "and answer with the quantity the question names, not the dollars on the way.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity"],
    build(t) {
      const askRate = t.chance(0.3);
      const numeric = t.chance(0.45);
      for (;;) {
        if (askRate) {
          const scene = t.pick(rateScenes);
          const v = scene.make(t);
          const T = clean(v.fixed + v.rate * v.h);
          const key = v.rate;
          const candidates = [
            [tidy(T / v.h), `Divides the total by ${v.h} without first removing the ${scene.fixedName}.`],
            [tidy(T - v.fixed), `Gives the charge for all ${v.h} ${scene.count}, not the charge per ${scene.per}.`],
            [tidy((T + v.fixed) / v.h), `Adds the ${scene.fixedName} to the total instead of subtracting it.`],
            [tidy(T / v.h - v.fixed), `Divides first and then subtracts the whole ${scene.fixedName}.`],
          ].filter(([value]) => value !== null && value > 0);
          if (!numeric && distinctWrong(key, candidates) < 3) continue;
          const responseType = responseFor(numeric, key);
          // Dollar choices print with cents ("1.50"), as on the test.
          const shown = (value) => (responseType === "numeric" ? value : money(value));
          return {
            responseType,
            estimatedSeconds: 80,
            stimulus: null,
            stem: scene.text(v, T),
            correct: shown(key),
            wrong: candidates.map(([value, reason]) => [shown(value), reason]),
            explanation:
              `If r is the charge per ${scene.per}, then ${money(v.fixed)} + ${v.h}r = ${money(T)}. Subtracting gives ` +
              `${v.h}r = ${money(clean(T - v.fixed))}, so r = ${money(key)}.`,
            steps: [
              `Write the equation: ${money(v.fixed)} + ${v.h}r = ${money(T)}.`,
              `Remove the ${scene.fixedName}: ${v.h}r = ${money(clean(T - v.fixed))}.`,
              `Divide by ${v.h}: r = ${money(key)}.`,
            ],
            principles: ["A total made of a fixed amount plus a rate times a count is linear in the count."],
            trap: `${usd(clean(T - v.fixed))} is what all ${v.h} ${scene.count} cost together; one more division is needed.`,
            hint: `Separate the part of the total that depends on the number of ${scene.count}.`,
            verify: () => {
              const found = [];
              for (let cents = 1; cents <= 20000; cents += 1) {
                if (Math.round(v.fixed * 100) + v.h * cents === Math.round(T * 100)) found.push(cents / 100);
              }
              return found.length === 1 && approx(found[0], key);
            },
          };
        }
        const scene = t.pick(countScenes);
        const v = scene.make(t);
        const T = scene.total(v);
        if (T <= 0) continue;
        const key = v.n;
        const additional = scene.extra.includes("additional");
        const down = scene.extra.includes("down");
        const change = clean(down ? v.fixed - T : T - v.fixed);
        const wrong = [];
        if (additional) {
          wrong.push([key - 1, "Gives the number of additional hours, leaving out the first hour."]);
          wrong.push([tidy(T / v.rate), `Divides the whole amount by ${usd(v.rate)}, as if every hour cost ${usd(v.rate)}.`]);
          wrong.push([change, "Gives the dollars paid for the additional hours, not a number of hours."]);
        } else if (down) {
          wrong.push([change, "Gives the number of centimeters burned, not the number of hours."]);
          wrong.push([tidy(T / v.rate), "Divides the final height by the rate, which is how much longer the candle could keep burning."]);
          wrong.push([tidy(v.fixed / v.rate), "Gives the time for the whole candle to burn down."]);
        } else {
          wrong.push([change, `Gives the dollars beyond the ${scene.fixedName}, not the number of ${scene.unit}.`]);
          wrong.push([tidy(T / v.rate), `Divides the total by ${usd(v.rate)} without first removing the ${scene.fixedName}.`]);
          wrong.push([tidy((T + v.fixed) / v.rate), `Adds the ${scene.fixedName} to the total instead of subtracting it.`]);
        }
        const kept = wrong.filter(([value]) => value !== null && value > 0);
        if (!numeric && distinctWrong(key, kept) < 3) continue;
        return commaChoices({
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 80,
          stimulus: null,
          stem: scene.text(v, T),
          correct: key,
          wrong: kept,
          explanation:
            `With n ${scene.unit}, the amount is ${scene.model(v)}. Setting this equal to ${money(T)} gives ` +
            `${additional ? `${v.rate}(n ${MINUS} 1) = ${money(change)}, so n ${MINUS} 1 = ${money(change / v.rate)} and` : `${num(v.rate)}n = ${money(change)}, so`} n = ${key}.`,
          steps: [
            `Model the amount: ${scene.model(v)} = ${money(T)}.`,
            `Remove the ${scene.fixedName}: ${additional ? `${v.rate}(n ${MINUS} 1)` : `${num(v.rate)}n`} = ${money(change)}.`,
            additional
              ? `Divide by ${v.rate}: n ${MINUS} 1 = ${money(change / v.rate)}, so n = ${key}.`
              : `Divide by ${num(v.rate)}: n = ${key}.`,
          ],
          principles: ["Undo a linear model in reverse: remove the fixed part, then divide by the rate."],
          trap: additional
            ? "Dividing by the additional-hour rate counts only the additional hours; the first hour must be added back."
            : `${money(change)} is on the way to the answer, but it is ${down ? "centimeters" : "dollars"}, not ${scene.unit}.`,
          hint: "Write the total as a fixed part plus a part that grows with the count.",
          verify: () => {
            const cost = (n) => Math.round(scene.total({ ...v, n }) * 100);
            const target = Math.round(T * 100);
            const found = [];
            for (let n = 0; n <= 2000; n += 1) if (cost(n) === target) found.push(n);
            return found.length === 1 && found[0] === key;
          },
        });
      }
    },
  };

  const literalRearrange = {
    id: "literal-equation-rearrange",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "solve",
    title: "Solving a context formula for one of its variables",
    recognize:
      "The formula is an equation in the target variable with every other letter a constant: clear the fraction, " +
      "collect every term with the target on one side (factoring it out if it appears twice), and only then divide.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 1 },
    tricks: ["equivalent-form", "sign-error"],
    build(t) {
      const variant = t.int(0, 2);

      if (variant === 0) {
        for (;;) {
          const scene = t.pick(formulaScenes);
          const [p, q, r] = [t.pick([2, 3, 4, 5, 7]), t.pick([2, 3, 4, 5, 7, 9]), t.pick([2, 3, 4, 5, 7])];
          if (S.gcd(p, q) !== 1 || S.gcd(p, r) !== 1 || S.gcd(q, r) !== 1) continue;
          const { y, A, B, C, sign } = scene;
          const op = sign > 0 ? "+" : MINUS;
          const anti = sign > 0 ? MINUS : "+";
          const formula = `${y} = (${p}${A} ${op} ${q}${B})/(${r}${C})`;
          const target = t.pick(["A", "B", "C"]);
          const ryC = `${r}${y}${C}`;
          let key;
          let options;
          let letter;
          let work;
          if (target === "A") {
            letter = A;
            key = t.chance(0.5) ? `(${ryC} ${anti} ${q}${B})/${p}` : `${ryC}/${p} ${anti} ${q}${B}/${p}`;
            options = [
              [`(${ryC} ${op} ${q}${B})/${p}`, `Moves ${q}${B} across the equals sign without changing its sign.`],
              [`${ryC}/${p} ${anti} ${q}${B}`, `Divides only the first term by ${p}.`],
              [`${r}${C}(${y} ${anti} ${q}${B})/${p}`, `Moves ${q}${B} before multiplying both sides by ${r}${C}.`],
              [`${p}(${ryC} ${anti} ${q}${B})`, `Multiplies by ${p} instead of dividing by it.`],
            ];
            work = [
              `Multiply both sides by ${r}${C}: ${ryC} = ${p}${A} ${op} ${q}${B}.`,
              `${sign > 0 ? "Subtract" : "Add"} ${q}${B}: ${p}${A} = ${ryC} ${anti} ${q}${B}.`,
              `Divide every term by ${p}: ${A} = ${key}.`,
            ];
          } else if (target === "B") {
            letter = B;
            if (sign > 0) {
              key = `(${ryC} ${MINUS} ${p}${A})/${q}`;
              options = [
                [`(${ryC} + ${p}${A})/${q}`, `Moves ${p}${A} across the equals sign without changing its sign.`],
                [`(${p}${A} ${MINUS} ${ryC})/${q}`, "Subtracts in the wrong order, which reverses the sign of the result."],
                [`${ryC}/${q} ${MINUS} ${p}${A}`, `Divides only the first term by ${q}.`],
                [`${r}${C}(${y} ${MINUS} ${p}${A})/${q}`, `Moves ${p}${A} before multiplying both sides by ${r}${C}.`],
              ];
            } else {
              key = `(${p}${A} ${MINUS} ${ryC})/${q}`;
              options = [
                [`(${ryC} ${MINUS} ${p}${A})/${q}`, `Drops the negative sign on ${q}${B} when isolating it.`],
                [`(${p}${A} + ${ryC})/${q}`, `Moves ${ryC} across the equals sign without changing its sign.`],
                [`${p}${A}/${q} ${MINUS} ${ryC}`, `Divides only the first term by ${q}.`],
                [`${r}${C}(${p}${A} ${MINUS} ${y})/${q}`, `Moves ${p}${A} before multiplying both sides by ${r}${C}.`],
              ];
            }
            work = [
              `Multiply both sides by ${r}${C}: ${ryC} = ${p}${A} ${op} ${q}${B}.`,
              sign > 0
                ? `Subtract ${p}${A}: ${q}${B} = ${ryC} ${MINUS} ${p}${A}.`
                : `Add ${q}${B} and subtract ${ryC}: ${q}${B} = ${p}${A} ${MINUS} ${ryC}.`,
              `Divide by ${q}: ${B} = ${key}.`,
            ];
          } else {
            letter = C;
            const top = `${p}${A} ${op} ${q}${B}`;
            key = `(${top})/(${r}${y})`;
            options = [
              [`${r}${y}/(${top})`, `Inverts the whole fraction, which gives 1/${C} rather than ${C}.`],
              [`${r}(${top})/${y}`, `Moves ${r} to the numerator instead of dividing by it.`],
              [`${y}(${top})/${r}`, `Multiplies by ${y} instead of dividing by it.`],
              [`(${top})/${y} ${MINUS} ${r}`, `Subtracts ${r} instead of dividing by it.`],
            ];
            work = [
              `Multiply both sides by ${r}${C}: ${r}${y}${C} = ${top}.`,
              `The target ${C} is now a factor on one side, multiplied by ${r}${y}.`,
              `Divide both sides by ${r}${y}: ${C} = ${key}.`,
            ];
          }
          const wrong = t.sample(options, 3);
          const others = [y, A, B, C].filter((entry) => entry !== letter).sort((u, v) => u.toLowerCase().localeCompare(v.toLowerCase()));
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 95,
            stimulus: { type: "equations", content: formula },
            stem: `${scene.text} Which of the following correctly expresses ${letter} in terms of ${listLetters(others)}?`,
            correct: key,
            wrong,
            explanation: `${work.join(" ")} Each other choice fails when numbers are substituted back into the formula.`,
            steps: work,
            principles: [
              "Undo operations in the reverse of the order they were applied to the target variable.",
              "Dividing a sum by a number divides every term of the sum.",
            ],
            trap: "Each wrong choice is a rearrangement that looks right term by term but breaks one algebra step.",
            hint: "Clear the fraction before moving anything else.",
            verify: () => solvesFor(formula, letter, key, options.map(([text]) => text)),
          };
        }
      }

      if (variant === 1) {
        const scene = t.pick(mixtureScenes);
        const k = t.pick(scene.ks);
        const K = num(k);
        const { out: o, total: a, base: v } = scene;
        const formula = `${o} = (${a} + ${K}x)/(${v} + x)`;
        const flipped = t.chance(0.5);
        const key = flipped ? `(${o}${v} ${MINUS} ${a})/(${K} ${MINUS} ${o})` : `(${a} ${MINUS} ${o}${v})/(${o} ${MINUS} ${K})`;
        const halfFlip = flipped
          ? `(${a} ${MINUS} ${o}${v})/(${K} ${MINUS} ${o})`
          : `(${o}${v} ${MINUS} ${a})/(${o} ${MINUS} ${K})`;
        const options = flipped
          ? [
            [`(${o}${v} + ${a})/(${K} ${MINUS} ${o})`, `Moves ${a} across the equals sign without changing its sign.`],
            [`(${o}${v} ${MINUS} ${a})/(${K} + ${o})`, "Collects the x-terms with the wrong sign on one of them."],
            [`(${v} ${MINUS} ${a})/(${K} ${MINUS} ${o})`, `Multiplies only x, not ${v}, by ${o} when clearing the fraction.`],
          ]
          : [
            [`(${a} + ${o}${v})/(${o} ${MINUS} ${K})`, `Moves ${o}${v} across the equals sign without changing its sign.`],
            [`(${a} ${MINUS} ${o}${v})/(${o} + ${K})`, "Collects the x-terms with the wrong sign on one of them."],
            [`(${a} ${MINUS} ${v})/(${o} ${MINUS} ${K})`, `Multiplies only x, not ${v}, by ${o} when clearing the fraction.`],
          ];
        const wrong = [
          [halfFlip, "Reverses the subtraction in the numerator only, which gives the negative of the correct expression."],
          ...t.sample(options, 2),
        ];
        const work = [
          `Multiply both sides by (${v} + x): ${o}${v} + ${o}x = ${a} + ${K}x.`,
          `Collect the x-terms on one side: ${o}x ${MINUS} ${K}x = ${a} ${MINUS} ${o}${v}.`,
          `Factor out x: x(${o} ${MINUS} ${K}) = ${a} ${MINUS} ${o}${v}.`,
          `Divide: x = (${a} ${MINUS} ${o}${v})/(${o} ${MINUS} ${K})` +
            (flipped ? `, which equals ${key} after multiplying the numerator and denominator by ${MINUS}1.` : "."),
        ];
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 110,
          stimulus: { type: "equations", content: formula },
          stem: `${scene.text(k)} Which of the following correctly expresses x in terms of ${listLetters([a, o, v].sort())}?`,
          correct: key,
          wrong: wrong.concat(options),
          explanation: work.join(" "),
          steps: work,
          principles: [
            "When the target variable appears in more than one term, collect those terms and factor it out.",
            "Negating both the numerator and the denominator leaves a fraction unchanged; negating only one does not.",
          ],
          trap: "x appears twice, so it cannot be isolated in one move; and a choice that negates only half of the fraction looks equivalent but is not.",
          hint: "Get every term that contains x onto one side first.",
          verify: () => solvesFor(formula, "x", key, [halfFlip, ...options.map(([text]) => text)]),
        };
      }

      // How many times the output changes when two inputs are scaled.
      for (;;) {
        const scene = t.pick(powerScenes);
        const K = t.pick(scene.K);
        const letters = Object.keys(scene.vars);
        const [first, second] = t.sample(letters, 2);
        const [c1, c2] = [t.pick(CHANGES), t.pick(CHANGES)];
        const e1 = scene.vars[first];
        const e2 = scene.vars[second];
        const effect1 = ratioPow(c1.factor, e1);
        const effect2 = ratioPow(c2.factor, e2);
        const key = ratioTimes(effect1, effect2);
        if (key.n === key.d) continue;
        const flat = (e) => Math.sign(e);
        const candidates = [];
        if (Math.abs(e1) > 1 || Math.abs(e2) > 1) {
          candidates.push([
            ratioTimes(ratioPow(c1.factor, flat(e1)), ratioPow(c2.factor, flat(e2))),
            "Ignores the exponent, treating every input as if it appeared to the first power.",
          ]);
        }
        if (e1 < 0 || e2 < 0) {
          const denominator = e1 < 0 ? first : second;
          candidates.push([
            ratioTimes(ratioPow(c1.factor, Math.abs(e1)), ratioPow(c2.factor, Math.abs(e2))),
            `Treats ${denominator}, which is in the denominator, as if it were in the numerator.`,
          ]);
        }
        candidates.push([effect1, `Applies only the change to the ${scene.names[first]}.`]);
        candidates.push([effect2, `Applies only the change to the ${scene.names[second]}.`]);
        candidates.push([ratioPlus(effect1, effect2), "Adds the two effects instead of multiplying them."]);
        const wrong = candidates.map(([value, reason]) => [ratioText(value), reason]);
        const keyText = ratioText(key);
        if (distinctWrongHard(keyText, wrong) < 3) continue;
        const keyValue = ratioValue(key);
        const numeric = fitsGridHard(keyValue) && t.chance(0.5);
        const rest = letters.filter((letter) => letter !== first && letter !== second);
        const formula = scene.formula(K);
        const describe = (letter, change, exponent, effect) => {
          const detail = [];
          if (Math.abs(exponent) === 2) detail.push("squared");
          else if (Math.abs(exponent) > 2) detail.push(`raised to the power ${Math.abs(exponent)}`);
          if (exponent < 0) detail.push("in the denominator");
          return `${change.gerund} ${letter}${detail.length ? `, which is ${detail.join(" and ")},` : ""} ` +
            `multiplies ${scene.out} by ${ratioText(effect)}.`;
        };
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 90,
          stimulus: { type: "equations", content: formula },
          stem:
            `${scene.text} If the ${scene.names[first]} is ${c1.word} and the ${scene.names[second]} is ${c2.word}` +
            `${rest.length ? `, while the ${scene.names[rest[0]]} stays the same` : ""}, the new ${scene.outName} ` +
            `is how many times the original ${scene.outName}?`,
          correct: numeric ? keyValue : keyText,
          wrong,
          explanation:
            `${describe(first, c1, e1, effect1)} ${describe(second, c2, e2, effect2)} The effects multiply: ` +
            `${ratioText(effect1)} × ${ratioText(effect2)} = ${keyText}${numeric && key.d !== 1 ? ` = ${num(keyValue)}` : ""}.`,
          steps: [
            describe(first, c1, e1, effect1),
            describe(second, c2, e2, effect2),
            `Multiply the effects: ${ratioText(effect1)} × ${ratioText(effect2)} = ${keyText}.`,
          ],
          principles: [
            "Scaling an input that appears as xⁿ scales the output by the factor raised to the n.",
            "Scaling an input in the denominator by c scales the output by 1/c (to the matching power).",
          ],
          trap: "Doubling one input and halving another cancel only when they enter the formula the same way; powers and denominators change that.",
          hint: "Follow each change through the formula separately, then combine them.",
          verify: () => {
            const [output, right] = formula.split(" = ");
            const model = compileHard(right);
            const base = probe(letters, 1);
            const changed = { ...base };
            changed[first] *= ratioValue(c1.factor);
            changed[second] *= ratioValue(c2.factor);
            return output === scene.out && approx(model(changed) / model(base), keyValue, 1e-9);
          },
        };
      }
    },
  };

  /* ------------------------------------------------ linear-expression-from-equation */

  // m(px + q) multiplied out: "6x − 9", or "9 − 6x" when only the constant is positive.
  function multipleText(p, q, m) {
    const a = m * p;
    const b = m * q;
    return a < 0 && b > 0 ? `${num(b)} ${MINUS} ${lin(-a, 0)}` : lin(a, b);
  }

  const expressionFromEquation = {
    id: "linear-expression-from-equation",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "solve",
    difficulty: "Hard",
    title: "Value of a linear expression found without solving for x",
    recognize:
      "One expression in x runs through the whole equation, sometimes multiplied out; solve for that expression as a " +
      "single unknown, then scale it to the expression the question names. The value of x is never needed.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["intermediate-value", "wrong-quantity", "sign-error"],
    build(t) {
      const form = t.pick(["repeated", "expanded", "fractions"]);
      const inline = t.chance(0.5);
      const numeric = t.chance(0.4);
      for (;;) {
        const p = t.int(2, 6);
        const q = t.nonzero(-9, 9);
        if (S.gcd(p, q) !== 1) continue;
        const u = form === "fractions" ? t.nonzero(-24, 24) : t.nonzero(-12, 12);
        // x itself is a fraction, so the grouped expression is the efficient unknown.
        if ((u - q) % p === 0) continue;
        const m = t.pick([2, 3, 4, -1, -2, -3]);
        const chunk = lin(p, q);
        const asked = multipleText(p, q, m);
        const key = m * u;
        const xText = frac(u - q, p);
        const times = `${m === -1 ? MINUS : num(m)}(${chunk})`;
        const scaleStep = `${asked} = ${times}, so its value is ${paren(m)} × ${paren(u)} = ${num(key)}.`;
        const wrong = [
          [u, `Gives the value of ${chunk}, not the value of ${asked}.`],
          [xText, `Stops at x = ${xText}, a value on the way, instead of finding ${asked}.`],
        ];
        if (m < 0) wrong.push([-key, `Treats ${asked} as ${multipleText(p, q, -m)}, losing the negative sign.`]);
        else if (form !== "fractions") {
          wrong.push([-key, `Moves the constants across the equals sign without changing their signs, so ${chunk} gets the wrong sign.`]);
        }
        let equation;
        let steps;
        if (form === "fractions") {
          const [d1, d2] = t.pick([[2, 3], [3, 6], [2, 6], [4, 12], [2, 4], [3, 4]]);
          const s = (u * (d1 + d2)) / (d1 * d2);
          if (!Number.isInteger(s) || s === 0) continue;
          const L = (d1 * d2) / S.gcd(d1, d2);
          equation = `(${chunk})/${d1} + (${chunk})/${d2} = ${num(s)}`;
          wrong.push([m * s * (d1 + d2), `Adds the fractions by adding their denominators, as if the left side were (${chunk})/${d1 + d2}.`]);
          steps = [
            `Let u = ${chunk}. The equation says u/${d1} + u/${d2} = ${num(s)}.`,
            `Multiply both sides by ${L}: ${lin(L / d1, 0, "u")} + ${lin(L / d2, 0, "u")} = ${num(s * L)}, so ` +
              `${lin(L / d1 + L / d2, 0, "u")} = ${num(s * L)} and u = ${num(u)}.`,
            scaleStep,
          ];
        } else {
          const a = t.int(2, 9);
          const b = t.int(2, 8);
          if (a === b) continue;
          const r = t.nonzero(-15, 15);
          const s = r + (a - b) * u;
          if (s === 0 || Math.abs(s) > 60) continue;
          const solveStep = `Solve: ${lin(a - b, 0, "u")} = ${num(s - r)}, so u = ${num(u)}.`;
          if (form === "repeated") {
            equation = `${a}(${chunk}) ${signed(r)} = ${b}(${chunk}) ${signed(s)}`;
            if (Math.abs(a - b) !== 1) {
              wrong.push([m * (s - r), `Stops at ${lin(a - b, 0, "u")} = ${num(s - r)}, where u = ${chunk}, and never divides by ${num(a - b)}.`]);
            }
            steps = [`Let u = ${chunk}. The equation becomes ${a}u ${signed(r)} = ${b}u ${signed(s)}.`, solveStep, scaleStep];
          } else {
            const e = b * q + s;
            if (e === 0) continue;
            equation = `${a}(${chunk}) ${signed(r)} = ${lin(b * p, e)}`;
            if ((e - r) % (a - b) === 0) {
              wrong.push([m * ((e - r) / (a - b)), `Rewrites ${lin(b * p, e)} as ${b}(${chunk}) ${signed(e)}, without adjusting the constant.`]);
            }
            steps = [
              `The right side contains ${chunk} too: ${lin(b * p, e)} = ${b}(${chunk}) ${signed(s)}.`,
              `Let u = ${chunk}. The equation becomes ${a}u ${signed(r)} = ${b}u ${signed(s)}.`,
              solveStep,
              scaleStep,
            ];
          }
        }
        if (!numeric && distinctWrongHard(key, wrong) < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 100,
          stimulus: inline ? null : { type: "equations", content: equation },
          stem: inline
            ? `If ${equation}, what is the value of ${asked}?`
            : `Based on the given equation, what is the value of ${asked}?`,
          correct: key,
          wrong: numeric ? [] : [...wrong.slice(0, 2), ...t.shuffle(wrong.slice(2))],
          explanation: `${steps.join(" ")} The value of x is never needed.`,
          steps,
          principles: [
            "An expression that recurs in an equation can be solved for as if it were a single variable.",
            "If an expression equals u, then any constant multiple of that expression equals the same multiple of u.",
          ],
          trap: `Solving for x gives x = ${xText}, which is not what is asked; and ${asked} = ${times}, not ${chunk} itself.`,
          hint: "Compare the expression in the question with the expressions inside the equation.",
          verify: () => {
            // Solve the displayed equation for x outright, then evaluate the displayed expression there.
            const { slope, constant, straight } = linearDifference(equation);
            if (!straight || approx(slope, 0)) return false;
            const x = -constant / slope;
            return approx(compile(asked)({ x }), key) && !approx(x, Math.round(x));
          },
        };
      }
    },
  };

  return [equationSolve, contextMeaning, solutionCount, wordModel, literalRearrange, expressionFromEquation];
});
