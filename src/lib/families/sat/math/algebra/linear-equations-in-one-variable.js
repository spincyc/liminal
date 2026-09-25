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
    collides, spreadAround, spreadWithMirror, cramer,
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
        [(d - b) / a, `Divides by ${a}, the x-coefficient on the left, instead of by ${k}, the coefficient after collecting x-terms.`],
        [(d + b) / (a + c), `Moves both ${num(b)} and ${cTerm} across the equals sign without changing their signs.`],
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
        [r - q, `Ignores the factor ${p} and solves x ${signed(q)} = ${num(r)}.`],
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
        [p * (q - r), `Computes ${num(q)} ${MINUS} ${paren(r)} instead of ${num(r)} ${MINUS} ${paren(q)}, which flips the sign.`],
        [p * r, `Ignores the ${signed(q)} and multiplies ${num(r)} by ${p}.`],
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
        part: "The sum of Nadia's withdrawals over w weeks",
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
        part: "The height gained during h hours of climbing",
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

  // o = (a + Kx)/(V + x): x appears in the numerator and the denominator.
  const mixtureScenes = [
    {
      out: "c", total: "a", bases: [20, 25, 30, 40, 50, 60, 80],
      ks: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.6, 0.65, 0.7, 0.75, 0.8],
      text: (k, V) =>
        `A tank holds ${V} liters of a solution that contains a liters of pure acid. After x liters of a solution ` +
        `that is ${num(clean(k * 100))}% acid are added, the fraction of the mixture that is acid is c, as given by the equation.`,
    },
    {
      out: "m", total: "s", bases: [6, 8, 10, 12, 15, 16, 20], ks: [84, 86, 88, 90, 92, 94, 95, 96, 98],
      text: (k, V) =>
        `A student has earned a total of s points on ${V} quizzes. If the student earns ${k} points on each of the ` +
        "next x quizzes, the student's mean score on all the quizzes will be m, as given by the equation.",
    },
    {
      out: "p", total: "d", bases: [20, 30, 40, 50, 60, 75], ks: [6, 7, 8, 9, 11, 12, 13, 14, 15, 16],
      text: (k, V) =>
        `A coffee roaster has ${V} pounds of a blend with a total value of d dollars. After x pounds of beans worth ` +
        `${usdHard(k)} per pound are mixed in, the value of the blend, in dollars per pound, is p, as given by the equation.`,
    },
  ];

  // out = c·ab/(a + b): a combined rate whose target sits in a product and a sum.
  // neighbour(target, other) is the answer the rule next door gives.
  const harmonicScenes = [
    {
      out: "s", c: "2", pair: ["a", "b"],
      text: "A car travels from one town to another at an average speed of a miles per hour and returns along the same " +
        "route at an average speed of b miles per hour. The average speed s, in miles per hour, for the whole trip is " +
        "given by the equation.",
      neighbour: (target, other) => [`2s ${MINUS} ${other}`, "Treats s as the ordinary average of the two speeds, (a + b)/2."],
    },
    {
      out: "R", c: "", pair: ["a", "b"],
      text: "When two resistors with resistances of a ohms and b ohms are connected in parallel, their combined " +
        "resistance R, in ohms, is given by the equation.",
      neighbour: (target, other) => [`R ${MINUS} ${other}`, "Uses the rule for resistors connected in series, R = a + b."],
    },
    {
      out: "T", c: "", pair: ["h", "k"],
      text: "Working alone, one pump can fill a tank in h hours, and a second pump can fill the same tank in k hours. " +
        "Working together, the two pumps fill the tank in T hours, as given by the equation.",
      neighbour: (target, other) => [`T ${MINUS} ${other}`, "Treats the time for both pumps together as the sum of their times alone."],
    },
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
        const modelled = made.wrong.filter(([value]) => Number.isInteger(value));
        if (collides(key, modelled) || distinctWrong(key, modelled) < 3) continue;
        const wrong = spreadWithMirror(t, key, modelled, "ends with the sign of the result reversed");
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
          // For exactly one solution the constants may match (the solution is
          // then x = 0) or differ (any other solution), so "one" is not a
          // pattern of matching constants.
          const sameConstant = kind === "many" || (kind === "one" && t.chance(0.35));
          const u = sameConstant ? p * q : p * q + t.nonzero(-6, 6);
          const sRight = kind === "one" ? s + t.pick([-2, -1, 1, 2]) : s;
          if (sRight === 0 || u === 0) continue;
          const equation = `${left} = ${lin(sRight, u)}`;
          const x1 = frac(u - p * q, s - sRight);
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
            one: sameConstant
              ? {
                many: `Sees the same constant, ${num(u)}, on both sides and stops, without comparing the x-coefficients ${num(s)} and ${num(sRight)}.`,
                none: `Reaches ${lin(s - sRight, 0)} = 0 and reads it as no solution; x = 0 is a solution.`,
                two: general,
              }
              : {
                none: `Sees that the constants ${num(p * q)} and ${num(u)} differ and stops, without checking that the x-coefficients ${num(s)} and ${num(sRight)} differ too.`,
                many: "Treats an equation with x on both sides as true for every x, without simplifying either side.",
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
                ? `The x-coefficients ${num(s)} and ${num(sRight)} differ, so exactly one value of x works (x = ${x1}).`
                : kind === "many"
                  ? `That is exactly the right side, so every value of x is a solution.`
                  : `The x-terms match but the constants ${num(p * q)} and ${num(u)} do not, so no value of x works.`),
            steps: [
              `Distribute: ${p}(x ${signed(q)}) = ${lin(p, p * q)}.`,
              `Combine: the left side is ${expanded}; the right side is ${lin(sRight, u)}.`,
              kind === "one"
                ? `Different x-coefficients: exactly one solution, x = ${x1}.`
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
          const modelled = [
            [p, `Leaves out the ${lin(r, 0)} term when combining.`],
            [p - r, `Combines ${p}x and ${lin(r, 0)} with the wrong sign.`],
            [-s, `Moves kx to the left side without changing its sign, so it solves ${num(s)} + k = 0.`],
            [p * q, "Matches the constant terms instead of the x-coefficients."],
          ];
          if (collides(key, modelled) || distinctWrong(key, modelled) < 3) continue;
          const wrong = spreadWithMirror(t, key, modelled, "ends with the sign of the result reversed");
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
        const modelled = [
          [q, `Multiplies only x by ${p}, leaving the constant as ${num(q)}.`],
          [-key, `Changes the sign of ${num(key)} while matching it.`],
          [p + q, `Adds ${p} and ${num(q)} instead of multiplying them.`],
          [key + r, `Folds the ${lin(r, 0)} term into the constant.`],
        ];
        if (collides(key, modelled) || distinctWrong(key, modelled) < 3) continue;
        const wrong = spreadWithMirror(t, key, modelled, "changes the sign of the constant it matches");
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
    difficulty: "Easy",
    title: "Linear equation written from a pricing or rate story",
    recognize:
      "The total is a fixed part plus a rate times a count; take the fixed part away before dividing by the rate, " +
      "and answer with the quantity the question names, not the dollars on the way.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
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
    difficulty: "Medium",
    title: "Solving a context formula for one of its variables",
    recognize:
      "The formula is an equation in the target variable with every other letter a constant: clear the fraction, " +
      "move the term that does not contain the target, and divide last, dividing every term.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form", "sign-error"],
    build(t) {
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
          key = t.chance(0.5) ? `(${ryC} ${anti} ${q}${B})/${p}` : `(${ryC})/${p} ${anti} (${q}${B})/${p}`;
          options = [
            [`(${ryC} ${op} ${q}${B})/${p}`, `Moves ${q}${B} across the equals sign without changing its sign.`],
            [`(${ryC})/${p} ${anti} ${q}${B}`, `Divides only the first term by ${p}.`],
            [`(${r}${C}(${y} ${anti} ${q}${B}))/${p}`, `Moves ${q}${B} before multiplying both sides by ${r}${C}.`],
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
              [`(${ryC})/${q} ${MINUS} ${p}${A}`, `Divides only the first term by ${q}.`],
              [`(${r}${C}(${y} ${MINUS} ${p}${A}))/${q}`, `Moves ${p}${A} before multiplying both sides by ${r}${C}.`],
            ];
          } else {
            key = `(${p}${A} ${MINUS} ${ryC})/${q}`;
            options = [
              [`(${ryC} ${MINUS} ${p}${A})/${q}`, `Drops the negative sign on ${q}${B} when isolating it.`],
              [`(${p}${A} + ${ryC})/${q}`, `Moves ${ryC} across the equals sign without changing its sign.`],
              [`(${p}${A})/${q} ${MINUS} ${ryC}`, `Divides only the first term by ${q}.`],
              [`(${r}${C}(${p}${A} ${MINUS} ${y}))/${q}`, `Moves ${p}${A} before multiplying both sides by ${r}${C}.`],
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
            [`(${r}${y})/(${top})`, `Inverts the whole fraction, which gives 1/${C} rather than ${C}.`],
            [`(${r}(${top}))/${y}`, `Moves ${r} to the numerator instead of dividing by it.`],
            [`(${y}(${top}))/${r}`, `Multiplies by ${y} instead of dividing by it.`],
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
    },
  };

  // Two mistakes at once, as one reason: "Makes two slips: it …, and it …."
  const twoSlips = (first, second) => `Makes two slips: it ${first}, and it ${second}.`;

  const literalFactor = {
    id: "literal-equation-factor-target",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "solve",
    difficulty: "Hard",
    title: "Solving for a variable that appears in more than one term",
    recognize:
      "The target appears in two places, so no single move isolates it: clear any fraction, gather every term that " +
      "contains the target on one side and everything else on the other, factor the target out, and divide by the " +
      "whole factor.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form", "sign-error", "neighbouring-rule"],
    build(t) {
      const form = t.pick(["mixture", "mixture", "abstract", "abstract", "harmonic"]);

      if (form === "mixture") {
        // o = (a + Kx)/(V + x), solved for x. Each wrong choice is the key with
        // one slip in the numerator, one in the denominator, or both.
        for (;;) {
          const scene = t.pick(mixtureScenes);
          const k = t.pick(scene.ks);
          const V = t.pick(scene.bases);
          const K = num(k);
          const { out: o, total: a } = scene;
          const formula = `${o} = (${a} + ${K}x)/(${V} + x)`;
          const up = t.chance(0.5);
          const top = {
            ok: up ? `${a} ${MINUS} ${V}${o}` : `${V}${o} ${MINUS} ${a}`,
            flip: up ? `${V}${o} ${MINUS} ${a}` : `${a} ${MINUS} ${V}${o}`,
            plus: up ? `${a} + ${V}${o}` : `${V}${o} + ${a}`,
            drop: up ? `${a} ${MINUS} ${V}` : `${V} ${MINUS} ${a}`,
          };
          const bottom = {
            ok: up ? `${o} ${MINUS} ${K}` : `${K} ${MINUS} ${o}`,
            flip: up ? `${K} ${MINUS} ${o}` : `${o} ${MINUS} ${K}`,
            plus: up ? `${o} + ${K}` : `${K} + ${o}`,
          };
          const topSlip = {
            flip: "reverses the subtraction in the numerator only",
            plus: `moves ${up ? `${V}${o}` : a} across the equals sign without changing its sign`,
            drop: `multiplies only x, not ${V}, by ${o} when clearing the fraction`,
          };
          const bottomSlip = {
            flip: "reverses the subtraction in the denominator only",
            plus: "collects the x-terms with the wrong sign on one of them",
          };
          const eTop = t.pick(["flip", "plus", "drop"]);
          const eBottom = eTop === "flip" ? "plus" : t.pick(["flip", "plus"]);
          const cap = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
          const one = (slip) => (slip === "flip" ? " That gives the negative of the correct expression." : "");
          const key = `(${top.ok})/(${bottom.ok})`;
          const wrong = [
            [`(${top[eTop]})/(${bottom.ok})`, `${cap(topSlip[eTop])}${one(eTop)}`],
            [`(${top.ok})/(${bottom[eBottom]})`, `${cap(bottomSlip[eBottom])}${one(eBottom)}`],
            [`(${top[eTop]})/(${bottom[eBottom]})`, twoSlips(topSlip[eTop], bottomSlip[eBottom])],
          ];
          if (collides(key, wrong)) continue;
          const work = [
            `Multiply both sides by (${V} + x): ${V}${o} + ${o}x = ${a} + ${K}x.`,
            `Collect the x-terms on one side: ${o}x ${MINUS} ${K}x = ${a} ${MINUS} ${V}${o}.`,
            `Factor out x: x(${o} ${MINUS} ${K}) = ${a} ${MINUS} ${V}${o}.`,
            `Divide: x = (${a} ${MINUS} ${V}${o})/(${o} ${MINUS} ${K})` +
              (up ? "." : `, which equals ${key} after multiplying the numerator and denominator by ${MINUS}1.`),
          ];
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 115,
            stimulus: { type: "equations", content: formula },
            stem: `${scene.text(k, V)} Which of the following correctly expresses x in terms of ${a} and ${o}?`,
            correct: key,
            wrong,
            explanation: work.join(" "),
            steps: work,
            principles: [
              "When the target variable appears in more than one term, collect those terms and factor it out.",
              "Negating both the numerator and the denominator leaves a fraction unchanged; negating only one does not.",
            ],
            trap: "x appears twice, so it cannot be isolated in one move; and a choice that negates only half of the fraction looks equivalent but is not.",
            hint: "Get every term that contains x onto one side first.",
            verify: () => solvesFor(formula, "x", key, wrong.map(([text]) => text)),
          };
        }
      }

      if (form === "harmonic") {
        // out = c·ab/(a + b), solved for one of a and b.
        const scene = t.pick(harmonicScenes);
        const [target, other] = t.shuffle(scene.pair);
        const { out: o, c } = scene;
        const formula = `${o} = (${c}${scene.pair[0]}${scene.pair[1]})/(${scene.pair[0]} + ${scene.pair[1]})`;
        const key = `(${o}${other})/(${c}${other} ${MINUS} ${o})`;
        const options = [
          [`(${o}${other})/(${o} ${MINUS} ${c}${other})`,
            `Gathers the terms containing ${target} but changes the signs on only one side, which gives the negative of the correct expression.`],
          [`(${o}${other})/(${c}${other} + ${o})`, `Moves ${o}${target} across the equals sign without changing its sign.`],
          [`(${c}${other} ${MINUS} ${o})/(${o}${other})`, `Inverts the fraction in the last step, which gives 1/${target} rather than ${target}.`],
          scene.neighbour(target, other),
        ];
        const wrong = t.sample(options, 3);
        const work = [
          `Multiply both sides by (${scene.pair[0]} + ${scene.pair[1]}): ${o}${target} + ${o}${other} = ${c}${target}${other}.`,
          `Gather the terms containing ${target}: ${o}${other} = ${c}${target}${other} ${MINUS} ${o}${target}.`,
          `Factor out ${target}: ${o}${other} = ${target}(${c}${other} ${MINUS} ${o}).`,
          `Divide: ${target} = ${key}.`,
        ];
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 110,
          stimulus: { type: "equations", content: formula },
          stem: `${scene.text} Which of the following correctly expresses ${target} in terms of ${listLetters([o, other].sort())}?`,
          correct: key,
          wrong,
          explanation: work.join(" "),
          steps: work,
          principles: [
            "When the target variable appears in more than one term, collect those terms and factor it out.",
            "Dividing both sides by a sum divides by the whole sum, not by one of its terms.",
          ],
          trap: `${target} is in the numerator and the denominator, so clearing the fraction leaves it in two terms that must be factored together.`,
          hint: `Clear the fraction, then get every term that contains ${target} on the same side.`,
          verify: () => solvesFor(formula, target, key, options.map(([text]) => text)),
        };
      }

      // m1(Ax + c1) = m2(Bx + c2) with letter constants A and B.
      for (;;) {
        const [A, B] = t.pick([["a", "b"], ["c", "d"], ["k", "n"], ["p", "r"]]);
        const scaleLeft = t.chance(0.5);
        const m1 = scaleLeft ? t.int(2, 6) : 1;
        const m2 = scaleLeft ? 1 : t.int(2, 6);
        const c1 = t.nonzero(-9, 9);
        const c2 = t.nonzero(-12, 12);
        const N = m2 * c2 - m1 * c1;
        const sign = m2 * c2 + m1 * c1;
        const drop = scaleLeft ? m2 * c2 - c1 : c2 - m1 * c1;
        if (N === 0 || [sign, drop].some((value) => value === 0 || Math.abs(value) === Math.abs(N)) || sign === drop) continue;
        const side = (m, letter, constant) => (m === 1
          ? `${letter}x ${signed(constant)}`
          : `${m}(${letter}x ${signed(constant)})`);
        const equation = `${side(m1, A, c1)} = ${side(m2, B, c2)}`;
        const term = (m, letter) => `${m === 1 ? "" : m}${letter}`;
        // Orientation: the key is N/(m1A − m2B) or −N/(m2B − m1A).
        const up = N > 0 ? t.chance(0.75) : t.chance(0.25);
        const s = up ? 1 : -1;
        const minus = (u, v) => `${u} ${MINUS} ${v}`;
        const bottom = {
          ok: up ? minus(term(m1, A), term(m2, B)) : minus(term(m2, B), term(m1, A)),
          flip: up ? minus(term(m2, B), term(m1, A)) : minus(term(m1, A), term(m2, B)),
          plus: `${term(m1, A)} + ${term(m2, B)}`,
          // Not distributing the factor to the x-term leaves A − B.
          drop: up ? minus(A, B) : minus(B, A),
        };
        // A denominator slip of "+" has no orientation, so its numerator is
        // the unoriented one the slip itself produces.
        const raw = { ok: N, sign, drop };
        const topFor = (which, below) => num(below === "plus" ? raw[which] : s * raw[which]);
        const bottomSlip = {
          flip: "reverses the subtraction in the denominator only, which negates the whole expression",
          plus: `moves ${term(m2, B)}x across the equals sign without changing its sign`,
          drop: `multiplies only the constant, not ${scaleLeft ? `${A}x` : `${B}x`}, by ${scaleLeft ? m1 : m2}`,
        };
        const topSlip = {
          sign: "moves a constant across the equals sign without changing its sign",
          drop: `multiplies only ${scaleLeft ? `${A}x` : `${B}x`}, not the constant, by ${scaleLeft ? m1 : m2}`,
        };
        const eTop = t.pick(["sign", "drop"]);
        const eBottom = t.pick(["flip", "plus", "drop"]);
        if (eTop === "drop" && eBottom === "drop") continue;
        const cap = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
        const fracText = (n, d) => `${n}/(${d})`;
        const key = fracText(topFor("ok", "ok"), bottom.ok);
        const wrong = [
          [fracText(topFor(eTop, "ok"), bottom.ok), cap(topSlip[eTop])],
          [fracText(topFor("ok", eBottom), bottom[eBottom]), cap(bottomSlip[eBottom])],
          [fracText(topFor(eTop, eBottom), bottom[eBottom]), twoSlips(topSlip[eTop], bottomSlip[eBottom])],
        ];
        if (collides(key, wrong)) continue;
        const expandedLeft = m1 === 1 ? `${A}x ${signed(c1)}` : `${m1}${A}x ${signed(m1 * c1)}`;
        const expandedRight = m2 === 1 ? `${B}x ${signed(c2)}` : `${m2}${B}x ${signed(m2 * c2)}`;
        const work = [
          `Distribute: ${expandedLeft} = ${expandedRight}.`,
          `Gather the x-terms on the left and the constants on the right: ${term(m1, A)}x ${MINUS} ${term(m2, B)}x = ${num(m2 * c2)} ${MINUS} ${paren(m1 * c1)} = ${num(N)}.`,
          `Factor out x: x(${minus(term(m1, A), term(m2, B))}) = ${num(N)}.`,
          `Divide: x = ${fracText(num(N), minus(term(m1, A), term(m2, B)))}${up ? "" : `, which equals ${key}`}.`,
        ];
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 110,
          stimulus: { type: "equations", content: equation },
          stem:
            `In the given equation, ${A} and ${B} are constants, and the equation has exactly one solution. Which of the ` +
            `following expresses x in terms of ${A} and ${B}?`,
          correct: key,
          wrong,
          explanation: work.join(" "),
          steps: work,
          principles: [
            "When the variable appears on both sides, gather its terms and factor it out; the factor is what you divide by.",
            "Constants that are letters are treated like numbers: they stay attached to x until x is factored out.",
          ],
          trap: "The letters make the x-terms look unlike, but they still have to be gathered and factored before dividing.",
          hint: "Treat the letters as if they were numbers you do not know yet.",
          verify: () => {
            // Solve the displayed equation numerically at sample values of the
            // constants, then compare with each displayed choice.
            const [left, right] = sidesOf(equation);
            const choiceAt = (text, values) => compile(text)(values);
            const same = (value, x) => Number.isFinite(value) && approx(value, x);
            return [[1.37, 0.41], [-2.29, 3.07], [0.83, -1.91]].every(([u, v]) => {
              const values = { [A]: u, [B]: v };
              const gap = (x) => left({ ...values, x }) - right({ ...values, x });
              const slope = gap(1) - gap(0);
              if (approx(slope, 0)) return false;
              const x = -gap(0) / slope;
              return same(choiceAt(key, values), x) && wrong.every(([text]) => !same(choiceAt(text, values), x));
            });
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
    difficulty: "Medium",
    title: "Value of a linear expression found without solving for x",
    recognize:
      "One expression in x runs through the whole equation, sometimes multiplied out; solve for that expression as a " +
      "single unknown, then scale it to the expression the question names. The value of x is never needed.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
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
        if (collides(key, wrong) || (!numeric && distinctWrongHard(key, wrong) < 3)) continue;
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


  /* ------------------------------------------------ linear-equation-unknown-constants */

  // Affine coefficients [A, B, C] of g(u, v) = A·u + B·v − C, read by sampling.
  function affine(g) {
    const g0 = g(0, 0);
    return [g(1, 0) - g0, g(0, 1) - g0, -g0];
  }

  const unknownConstants = {
    id: "linear-equation-unknown-constants",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "no or infinite solutions",
    difficulty: "Hard",
    title: "Unknown constants fixed by how many solutions an equation has",
    recognize:
      "A condition on how many solutions an equation has, or a solution that works for every value of a constant, " +
      "is a condition on the coefficients, not on x: simplify both sides, then match the x-coefficients and the " +
      "constants, or find the x that makes the constant's term vanish.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "sign-error", "intermediate-value"],
    build(t) {
      const form = t.pick(["infinite", "infinite", "none", "every"]);
      const numeric = form !== "none" && t.chance(0.4);
      for (;;) {
        if (form === "infinite") {
          const shape = t.pick(["split", "scaled"]);
          const ask = shape === "split" ? t.pick(["sum", "sum", "product", "b"]) : t.pick(["sum", "product"]);
          let equation;
          let a0;
          let b0;
          let slipA;
          let slipB;
          let both;
          let steps;
          if (shape === "split") {
            // a(x − p) + qx = rx + b: a + q = r and −pa = b.
            const p = t.nonzero(-7, 7);
            const q = t.nonzero(-6, 6);
            const r = t.nonzero(-9, 9);
            a0 = r - q;
            if (Math.abs(a0) < 2 || Math.abs(p) < 2) continue;
            b0 = -a0 * p;
            const aWrong = r + q;
            if (aWrong === 0 || aWrong === a0) continue;
            const left = `a(x ${signed(-p)}) ${xTerm(q)}`;
            const right = `${lin(r, 0)} + b`;
            equation = t.chance(0.7) ? `${left} = ${right}` : `${right} = ${left}`;
            slipA = { a: aWrong, b: -aWrong * p, text: `moves ${lin(q, 0)} across the equals sign without changing its sign, so a = ${num(aWrong)}` };
            slipB = { a: a0, b: a0 * p, text: `multiplies out a(x ${signed(-p)}) as ax ${signed(p)}a, so b = ${num(a0 * p)}` };
            both = { a: aWrong, b: aWrong * p };
            steps = [
              `Multiply out the side with a: a(x ${signed(-p)}) ${xTerm(q)} = (a ${signed(q)})x ${signed(-p)}a.`,
              `Infinitely many solutions means both sides are the same expression: a ${signed(q)} = ${num(r)} and ${num(-p)}a = b.`,
              `So a = ${num(a0)} and b = ${num(-p)}(${num(a0)}) = ${num(b0)}.`,
            ];
          } else {
            // ax + c = m(ux + b): a = mu and c = mb.
            const m = t.int(2, 6);
            const u = t.nonzero(-5, 5);
            b0 = t.nonzero(-9, 9);
            a0 = m * u;
            const c = m * b0;
            if (Math.abs(u) < 2 && t.chance(0.5)) continue;
            if (a0 === u || c === b0) continue;
            const left = `ax ${signed(c)}`;
            const right = `${m}(${lin(u, 0)} + b)`;
            equation = t.chance(0.7) ? `${left} = ${right}` : `${right} = ${left}`;
            slipA = { a: u, b: b0, text: `multiplies only b by ${m}, not ${lin(u, 0)}, so a = ${num(u)}` };
            slipB = { a: a0, b: c, text: `matches b with ${num(c)} directly, without dividing by ${m}` };
            both = { a: u, b: c };
            steps = [
              `Multiply out the right side: ${m}(${lin(u, 0)} + b) = ${lin(m * u, 0)} + ${m}b.`,
              `Infinitely many solutions means both sides are the same expression: a = ${num(m * u)} and ${m}b = ${num(c)}.`,
              `So a = ${num(a0)} and b = ${num(c)} ÷ ${m} = ${num(b0)}.`,
            ];
          }
          const value = ({ a, b }) => (ask === "sum" ? a + b : ask === "product" ? a * b : b);
          const key = value({ a: a0, b: b0 });
          const wrong = [
            [value(slipA), `${slipA.text.charAt(0).toUpperCase()}${slipA.text.slice(1)}.`],
            [value(slipB), `${slipB.text.charAt(0).toUpperCase()}${slipB.text.slice(1)}.`],
            [value(both), `Makes two slips: it ${slipA.text}, and it ${slipB.text.replace(/, so b = .*$/, "")}.`],
          ];
          if (collides(key, wrong) || distinctWrong(key, wrong) < 3 || Math.abs(key) > 999) continue;
          const askText = ask === "sum" ? "a + b" : ask === "product" ? "ab" : "b";
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 105,
            stimulus: { type: "equations", content: equation },
            stem: `In the given equation, a and b are constants. If the equation has infinitely many solutions, what is the value of ${askText}?`,
            correct: key,
            wrong: numeric ? [] : wrong,
            explanation: `${steps.join(" ")}${ask === "b" ? "" : ` Then ${askText} = ${num(key)}.`}`,
            steps: ask === "b" ? steps : [...steps, `${askText} = ${num(key)}.`],
            principles: [
              "ax + b = cx + d has infinitely many solutions exactly when a = c and b = d.",
              "A constant multiplied into parentheses multiplies every term inside.",
            ],
            trap: "Matching the x-terms fixes only one constant; the constant terms must match too, after every product is multiplied out.",
            hint: "What must be true of two expressions that are equal for every value of x?",
            verify: () => {
              // Solve for (a, b) from the displayed text: the x-coefficient and
              // the constant of (left − right) must both vanish.
              const [left, right] = sidesOf(equation);
              const gap = (a, b, x) => left({ a, b, x }) - right({ a, b, x });
              const solved = cramer(
                affine((a, b) => gap(a, b, 1) - gap(a, b, 0)),
                affine((a, b) => gap(a, b, 0)),
              );
              return Boolean(solved) && approx(value({ a: solved[0], b: solved[1] }), key) &&
                wrong.every(([shown]) => !approx(shown, key));
            },
          };
        }

        if (form === "none") {
          // a(x − p) + qx = rx + b with no solution: a = r − q and b ≠ −pa.
          const p = t.nonzero(-7, 7);
          const q = t.nonzero(-6, 6);
          const r = t.nonzero(-9, 9);
          const a0 = r - q;
          const aWrong = r + q;
          if (Math.abs(a0) < 2 || Math.abs(p) < 2 || aWrong === a0 || aWrong === 0) continue;
          const bSame = -a0 * p;
          const bOther = bSame + t.nonzero(-6, 6);
          const equation = `a(x ${signed(-p)}) ${xTerm(q)} = ${lin(r, 0)} + b`;
          const pair = (a, b) => `a = ${num(a)} and b = ${num(b)}`;
          const key = pair(a0, bOther);
          const wrong = [
            [pair(a0, bSame), "With these values the two sides are the same expression, so every value of x is a solution, not none."],
            [pair(aWrong, bOther), `a = ${num(aWrong)} comes from moving ${lin(q, 0)} without changing its sign; then the x-coefficients differ and there is exactly one solution.`],
            [pair(aWrong, bSame), `a = ${num(aWrong)} leaves the x-coefficients different, so the equation has exactly one solution.`],
          ];
          if (collides(key, wrong)) continue;
          const numbers = (text) => text.match(/−?\d+/g).map((part) => Number(part.replace(MINUS, "-")));
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 105,
            stimulus: { type: "equations", content: equation },
            stem: "In the given equation, a and b are constants. If the equation has no solution, which of the following could be the values of a and b?",
            correct: key,
            wrong,
            explanation:
              `Multiplied out, the left side is (a ${signed(q)})x ${signed(-p)}a. No solution means the x-terms cancel but the ` +
              `constants do not: a ${signed(q)} = ${num(r)}, so a = ${num(a0)}, and ${num(-p)}a = ${num(bSame)} must differ from b. ` +
              `Only ${key} does both.`,
            steps: [
              `Multiply out: a(x ${signed(-p)}) ${xTerm(q)} = (a ${signed(q)})x ${signed(-p)}a.`,
              `No solution needs equal x-coefficients: a ${signed(q)} = ${num(r)}, so a = ${num(a0)}.`,
              `It also needs different constants: b ≠ ${num(-p)}(${num(a0)}) = ${num(bSame)}.`,
              `So a = ${num(a0)} with any b other than ${num(bSame)}: ${key}.`,
            ],
            principles: [
              "ax + b = cx + d has no solution exactly when a = c and b ≠ d.",
              "If the x-coefficients differ, the equation has exactly one solution whatever the constants are.",
            ],
            trap: "Values that make the two sides identical give infinitely many solutions, the opposite of no solution.",
            hint: "Compare the x-coefficients first, then the constants.",
            verify: () => {
              const kinds = [key, ...wrong.map(([text]) => text)].map((text) => {
                const [a, b] = numbers(text);
                return countOf(equation, { a, b });
              });
              return kinds[0] === "none" && kinds.slice(1).every((kind) => kind !== "none");
            },
          };
        }

        // k(x − s) + qx = rx + c: x = s is a solution for every k only if c = (q − r)s.
        const s = t.nonzero(-8, 8);
        const q = t.nonzero(-7, 7);
        const r = t.nonzero(-9, 9);
        if (Math.abs(s) < 2 || q === r || Math.abs(q) === Math.abs(r)) continue;
        const key = (q - r) * s;
        const equation = `k(x ${signed(-s)}) ${xTerm(q)} = ${lin(r, 0)} + c`;
        const modelled = [
          [-key, `Uses x = ${num(-s)}; the k-term vanishes only where x ${signed(-s)} = 0, that is, at x = ${num(s)}.`],
          [(q + r) * s, `Moves ${num(r * s)} across the equals sign without changing its sign.`],
          [-r * s, `Leaves out the ${lin(q, 0)} term when substituting x = ${num(s)}.`],
          [q * s, `Leaves out the ${lin(r, 0)} term when substituting x = ${num(s)}.`],
        ];
        if (collides(key, modelled) || distinctWrong(key, modelled) < 3 || key === 0) continue;
        const wrong = spreadWithMirror(t, key, modelled, `uses x = ${num(-s)} instead of x = ${num(s)}`);
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 110,
          stimulus: { type: "equations", content: equation },
          stem:
            "In the given equation, k and c are constants. There is a value of x that is a solution to the equation for " +
            "every value of k. What is the value of c?",
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation:
            `Only the term k(x ${signed(-s)}) depends on k, so a solution that works for every k must make it 0: x = ${num(s)}. ` +
            `Substituting, ${num(q * s)} = ${num(r * s)} + c, so c = ${num(key)}.`,
          steps: [
            `The only part of the equation that changes with k is k(x ${signed(-s)}).`,
            `For one x to work whatever k is, that term must be 0 there: x = ${num(s)}.`,
            `Substitute x = ${num(s)}: ${q === 1 ? "" : q === -1 ? MINUS : num(q)}(${num(s)}) = ${r === 1 ? "" : r === -1 ? MINUS : num(r)}(${num(s)}) + c, so ${num(q * s)} = ${num(r * s)} + c.`,
            `c = ${num(q * s)} ${MINUS} ${paren(r * s)} = ${num(key)}.`,
          ],
          principles: [
            "An expression k·E is 0 for every value of k only when E = 0.",
            "A value that solves an equation for every value of a constant must make that constant's term vanish.",
          ],
          trap: "Trying one convenient value of k gives a solution for that k only; the condition is about every k at once.",
          hint: "Which part of the equation is affected when k changes?",
          verify: () => {
            // Search c directly: solve the displayed equation at two unrelated
            // values of k and keep the c for which both solutions agree.
            const [left, right] = sidesOf(equation);
            const solve = (k, c) => {
              const gap = (x) => left({ k, c, x }) - right({ k, c, x });
              const slope = gap(1) - gap(0);
              return approx(slope, 0) ? NaN : -gap(0) / slope;
            };
            const found = [];
            for (let c = -400; c <= 400; c += 1) {
              if (approx(solve(1.37, c), solve(-2.91, c)) && approx(solve(5.3, c), solve(1.37, c))) found.push(c);
            }
            return found.length === 1 && found[0] === key;
          },
        };
      }
    },
  };

  /* ------------------------------------------------- linear-equation-two-quantities */

  // P starts at P0 and falls by p per unit of time from time 0; Q holds at Q0
  // until time d, then rises by q per unit of time. Time t counts from P's start.
  const pairScenes = [
    {
      unit: "liters", time: "minutes", P: "tank A", Q: "tank B", clock: "noon",
      setup: (v) =>
        `At noon, tank A contains ${commas(v.P0)} liters of water, and water begins draining from it at a constant rate of ` +
        `${v.p} liters per minute. Tank B contains ${commas(v.Q0)} liters of water; beginning ${v.d} minutes after noon, ` +
        `water flows into tank B at a constant rate of ${v.q} liters per minute.`,
      ratio: (X, Y, k) => `${X} contains ${TIMES[k]} as much water as ${Y}`,
      diff: (X, Y, D) => `${X} contains ${commas(D)} more liters of water than ${Y}`,
      amount: (X) => `how many liters of water does ${X} contain`,
      ranges: { p: [6, 20], q: [8, 30], d: [3, 12], t: [8, 40], Q0: [10, 120], step: 5 },
    },
    {
      unit: "gallons", time: "hours", P: "pool A", Q: "pool B", clock: "8:00 a.m.",
      setup: (v) =>
        `At 8:00 a.m., pool A contains ${commas(v.P0)} gallons of water, and a pump begins removing water from it at a ` +
        `constant rate of ${v.p} gallons per hour. Pool B contains ${commas(v.Q0)} gallons of water; beginning ${v.d} ` +
        `hours after 8:00 a.m., a hose adds water to pool B at a constant rate of ${v.q} gallons per hour.`,
      ratio: (X, Y, k) => `${X} contains ${TIMES[k]} as much water as ${Y}`,
      diff: (X, Y, D) => `${X} contains ${commas(D)} more gallons of water than ${Y}`,
      amount: (X) => `how many gallons of water does ${X} contain`,
      ranges: { p: [40, 160], q: [50, 200], d: [2, 5], t: [4, 16], Q0: [200, 1500], step: 10 },
    },
    {
      unit: "feet", time: "minutes", P: "balloon A", Q: "balloon B", clock: "the start",
      setup: (v) =>
        `At the start of an observation, balloon A is ${commas(v.P0)} feet above the ground and begins descending at a ` +
        `constant rate of ${v.p} feet per minute. Balloon B is ${commas(v.Q0)} feet above the ground; beginning ${v.d} ` +
        `minutes after the start, it rises at a constant rate of ${v.q} feet per minute.`,
      ratio: (X, Y, k) => `${X} is ${TIMES[k]} as high above the ground as ${Y}`,
      diff: (X, Y, D) => `${X} is ${commas(D)} feet higher than ${Y}`,
      amount: (X) => `how many feet above the ground is ${X}`,
      ranges: { p: [10, 40], q: [15, 60], d: [2, 10], t: [6, 30], Q0: [50, 600], step: 10 },
    },
  ];

  const TIMES = { 2: "twice", 3: "three times" };

  const twoQuantities = {
    id: "linear-equation-two-quantities",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    subskill: "solve",
    difficulty: "Hard",
    title: "Two changing quantities compared at one moment",
    recognize:
      "Write each quantity as a function of the same time variable, counting the second one's change only from when " +
      "it starts (t minus the delay); then turn the comparison into an equation, keeping straight which quantity is " +
      "the multiple, or which one is larger.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["reversed-condition", "wrong-quantity", "sign-error"],
    build(t) {
      const form = t.pick(["equation", "equation", "time", "amount"]);
      for (;;) {
        const scene = t.pick(pairScenes);
        const R = scene.ranges;
        const step = (low, high) => R.step * t.int(Math.ceil(low / R.step), Math.floor(high / R.step));
        const v = {
          p: t.int(R.p[0], R.p[1]),
          q: t.int(R.q[0], R.q[1]),
          d: t.int(R.d[0], R.d[1]),
          Q0: step(R.Q0[0], R.Q0[1]),
        };
        const t0 = t.int(Math.max(R.t[0], v.d + 2), R.t[1]);
        const relation = t.pick(["ratio", "ratio", "diff"]);
        const aFirst = t.chance(0.5);
        const [X, Y] = aFirst ? ["P", "Q"] : ["Q", "P"];
        const Qat = (time) => v.Q0 + v.q * Math.max(0, time - v.d);
        const k = t.pick([2, 3]);
        const D = relation === "diff" ? R.step * t.int(2, 12) : 0;
        // Choose P0 so the stated comparison holds at t0.
        const Q1 = Qat(t0);
        let P1;
        if (relation === "ratio") P1 = X === "P" ? k * Q1 : Q1 / k;
        else P1 = X === "P" ? Q1 + D : Q1 - D;
        if (!Number.isInteger(P1) || P1 <= 0) continue;
        v.P0 = P1 + v.p * t0;
        if (v.P0 % R.step !== 0 || v.P0 > 9000) continue;
        const Pat = (time) => v.P0 - v.p * time;
        const holds = (time) => {
          const [x, y] = X === "P" ? [Pat(time), Qat(time)] : [Qat(time), Pat(time)];
          return relation === "ratio" ? x - k * y : x - y - D;
        };
        // The comparison must happen once, after Q starts changing, while P is positive.
        let changes = 0;
        for (let time = 0; time < 2 * t0 + 20; time += 0.25) {
          const [h1, h2] = [holds(time), holds(time + 0.25)];
          if (h1 === 0 || h1 * h2 < 0) changes += 1;
        }
        if (changes !== 1 || Pat(t0) <= 0 || Math.abs(holds(t0)) > 1e-9) continue;
        const names = { P: scene.P, Q: scene.Q };
        const relText = relation === "ratio" ? scene.ratio(names[X], names[Y], k) : scene.diff(names[X], names[Y], D);
        const Ptext = `${commas(v.P0)} ${MINUS} ${v.p}t`;
        const Qtext = (shift) => `${commas(v.Q0)} + ${v.q}${shift}`;
        const lag = { ok: `(t ${MINUS} ${v.d})`, none: "t", plus: `(t + ${v.d})` };
        // How each timing slip writes the two quantities.
        const timed = {
          ok: { P: Ptext, Q: Qtext(lag.ok) },
          none: { P: Ptext, Q: Qtext(lag.none) },
          plus: { P: Ptext, Q: Qtext(lag.plus) },
          swap: { P: `${commas(v.P0)} ${MINUS} ${v.p}(t ${MINUS} ${v.d})`, Q: Qtext("t") },
          amount: { P: Ptext, Q: `${commas(v.Q0)} + ${v.q}t ${MINUS} ${v.d}` },
        };
        const lagSlip = t.pick(["none", "plus", "plus", "swap", "swap", "amount", "amount"]);
        const build = (reversed, shift) => {
          const texts = timed[shift];
          const [first, second] = reversed ? [Y, X] : [X, Y];
          return relation === "ratio"
            ? `${texts[first]} = ${k}(${texts[second]})`
            : `(${texts[first]}) ${MINUS} (${texts[second]}) = ${commas(D)}`;
        };
        const lagWhy = {
          none: `measures ${names.Q}'s change from t = 0, though it begins ${v.d} ${scene.time} later`,
          plus: `adds the ${v.d}-${scene.time.replace(/s$/, "")} delay instead of subtracting it`,
          swap: `applies the ${v.d}-${scene.time.replace(/s$/, "")} delay to ${names.P} instead of ${names.Q}`,
          amount: `subtracts the delay from the amount, ${v.q}t ${MINUS} ${v.d}, instead of from the time, ${v.q}(t ${MINUS} ${v.d})`,
        }[lagSlip];
        const relWhy = relation === "ratio"
          ? `reverses the comparison, treating ${names[Y]} as the one that is ${TIMES[k]} as large`
          : `subtracts in the wrong order, which finds when ${names[Y]} is ${commas(D)} ${scene.unit} ahead`;
        const upper = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
        const cap = (text) => `${upper(text)}.`;
        const key = build(false, "ok");
        const wrong = [
          [build(true, "ok"), cap(relWhy)],
          [build(false, lagSlip), cap(lagWhy)],
          [build(true, lagSlip), `Makes two slips: it ${relWhy}, and it ${lagWhy}.`],
        ];
        // A slip whose equation still has the key's solution would be a second key.
        if (collides(key, wrong) || wrong.some(([text]) => holdsText(text, t0))) continue;
        const models = [
          `${upper(names.P)} after t ${scene.time}: ${Ptext}.`,
          `${upper(names.Q)} after t ${scene.time} (t ≥ ${v.d}): ${Qtext(lag.ok)}.`,
          `The comparison: ${key}.`,
        ];
        const solveStep = `Solving gives t = ${t0}.`;
        const common = {
          estimatedSeconds: 125,
          stimulus: null,
          principles: [
            "A quantity that starts changing d time units late has changed for t − d units at time t.",
            "\"X is k times Y\" is X = kY; \"X is D more than Y\" is X − Y = D.",
          ],
          trap: `${upper(names.Q)} starts changing ${v.d} ${scene.time} late, and the comparison has a direction; each slip gives a different, wrong equation.`,
          hint: "Write an expression in t for each quantity, starting from the moment each one begins to change.",
        };
        const lead = scene.setup(v);
        if (form === "equation") {
          return {
            ...common,
            responseType: "multiple-choice",
            stem:
              `${lead} Which equation can be solved for t, the number of ${scene.time} after ${scene.clock}, at which ` +
              `${relText}?`,
            correct: key,
            wrong,
            explanation: models.join(" "),
            steps: models,
            verify: () => {
              // The key must hold at the simulated time and have one solution; no wrong equation holds there.
              const at = (text) => holds(t0) === 0 && holdsText(text, t0);
              const [left, right] = sidesOf(key);
              const slope = (left({ t: 1 }) - right({ t: 1 })) - (left({ t: 0 }) - right({ t: 0 }));
              return at(key) && !approx(slope, 0) && wrong.every(([text]) => !holdsText(text, t0));
            },
          };
        }
        const answer = form === "time" ? t0 : Pat(t0);
        return {
          ...common,
          responseType: "numeric",
          stem: form === "time"
            ? `${lead} What is the number of ${scene.time} after ${scene.clock} at which ${relText}?`
            : `${lead} At the time when ${relText}, ${scene.amount(names.P)}?`,
          correct: answer,
          explanation: `${models.join(" ")} ${solveStep}${form === "time" ? "" : ` Then ${names.P} holds ${commas(v.P0)} ${MINUS} ${v.p}(${t0}) = ${commas(Pat(t0))}.`}`,
          steps: form === "time" ? [...models, solveStep] : [...models, solveStep, `${upper(names.P)}: ${commas(v.P0)} ${MINUS} ${v.p}(${t0}) = ${commas(Pat(t0))}.`],
          verify: () => {
            // Step through time in the story itself and find where the comparison holds.
            const found = [];
            for (let time = 0; time <= 400; time += 1) if (holds(time) === 0) found.push(time);
            return found.length === 1 && found[0] === t0 && (form === "time" || approx(Pat(found[0]), answer));
          },
        };
      }
    },
  };

  // True when the displayed equation in t holds at the given time.
  function holdsText(text, time) {
    const [left, right] = sidesOf(text);
    return approx(left({ t: time }), right({ t: time }));
  }

  return [
    equationSolve, contextMeaning, wordModel, solutionCount, expressionFromEquation, literalRearrange,
    literalFactor, unknownConstants, twoQuantities,
  ];
});
