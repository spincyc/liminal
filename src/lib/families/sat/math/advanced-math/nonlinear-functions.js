(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/advanced-math"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Nonlinear functions templates (Advanced Math), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, signed, lin, approx, point, poly, sup } = S;
  const {
    tidy, denominator, ratio, gridable, drawUntilDistinct, bin, rootFactor, lead, denominatorHard,
    ratioHard, drawUntilDistinctHard, term, decimalTextHard, ratioText, labelValue, sampleQuadratic, realRoots,
  } = C;

  // Exact decimal text for n / 10^k: decimalText(106, 2) -> "1.06", (120, 2) -> "1.2".
  function decimalText(n, k) {
    let digits = String(Math.abs(n));
    if (k > 0) {
      digits = digits.padStart(k + 1, "0");
      digits = `${digits.slice(0, -k)}.${digits.slice(-k)}`.replace(/\.?0+$/, "");
    }
    return `${n < 0 ? MINUS : ""}${digits}`;
  }

  const cap = (text) => text[0].toUpperCase() + text.slice(1);

  // "12,500" with a U+2212 minus for negatives.
  const commas = (value) => `${value < 0 ? MINUS : ""}${Math.abs(value).toLocaleString("en-US")}`;

  // A point whose coordinates may be fractions: "(5/2, 0)".
  const pt = (x, y) => `(${ratio(x)}, ${ratio(y)})`;

  /* ========================================= factored-polynomial-intercepts */

  function factoredPolynomial(t, mode) {
    const m = mode === "positive" ? t.pick([1, 2, 2, 4]) : t.pick([1, 2, 2, 3]);
    const n = t.nonzero(-7, 7);
    if (m > 1 && S.gcd(m, n) !== 1) return null;
    const r1 = t.int(-6, 6);
    const r2 = t.int(-6, 6);
    const zeros = [r1, r2, n / m];
    if (new Set(zeros).size < 3) return null;
    const factors = t.shuffle([[1, -r1], [1, -r2], [m, -n]]);
    const factorText = ([mm, k]) => (mm === 1 ? rootFactor(-k) : bin(mm, k));
    const text = factors.map(factorText).join("");
    const factorOf = (w) => factorText(factors.find(([mm, k]) => approx(-k / mm, w)));
    const p = (x) => factors.reduce((acc, [mm, k]) => acc * (mm * x + k), 1);
    const isZero = (x) => zeros.some((z) => approx(z, x));
    const p0 = p(0);
    const stimulus = { type: "equations", content: `p(x) = ${text}` };
    const zeroList = zeros.slice().sort((u, v) => u - v).map(ratio).join(", ");
    const common = {
      stimulus,
      principles: ["A product is 0 exactly when one of its factors is 0, so each factor (mx − n) gives the zero x = n/m."],
      hint: "Which value of x makes one of the factors equal to 0?",
    };
    if (mode === "intercept") {
      const z = t.pick(zeros);
      if (z === 0 || isZero(-z)) return null;
      // A grid of two independent slips on the key: the sign of the zero, and
      // which axis it goes on. Sometimes the undivided factor constant stands in
      // for the doubled slip.
      const grid = [
        [[-z, 0], `Reverses a sign: ${factorOf(z)} is 0 at x = ${ratio(z)}, not x = ${ratio(-z)}.`],
        [[0, z], "Puts the zero on the y-axis; an x-intercept has y-coordinate 0."],
        m > 1 && !isZero(n) && approx(z, n / m) && t.chance(0.5)
          ? [[n, 0], `Reads ${num(n)} from ${bin(m, -n)} without dividing by ${m}.`]
          : [[0, -z], "Reverses the sign of the zero and puts it on the y-axis."],
      ];
      if (t.chance(0.8)) {
        return {
          ...common,
          responseType: "multiple-choice",
          stem: "The function p is defined by the given equation. Which of the following is an x-intercept of the graph of y = p(x) in the xy-plane?",
          correct: pt(z, 0),
          wrong: grid.map(([[x, y], why]) => [pt(x, y), why]),
          explanation:
            `The graph meets the x-axis where p(x) = 0, which happens when one factor is 0. The zeros are ${zeroList}, ` +
            `so the x-intercepts are the points with those x-coordinates and y = 0. Of the choices, only ${pt(z, 0)} is one of them.`,
          steps: [
            "An x-intercept is a point (x, 0) where p(x) = 0.",
            `Set each factor equal to 0: x = ${zeroList}.`,
            `Of the choices, only ${pt(z, 0)} has one of these x-coordinates and y = 0.`,
          ],
          trap: `${factorOf(z)} is 0 at x = ${ratio(z)}; the number printed in a factor has the opposite sign of its zero, and an x-intercept lies on the x-axis.`,
          verify: () => approx(p(z), 0) && grid.every(([[x, y]]) => y !== 0 || !approx(p(x), 0)),
        };
      }
      const offers = [];
      zeros.forEach((w) => {
        if (w !== 0 && !isZero(-w)) {
          offers.push([[-w, 0], `Reverses a sign: ${factorOf(w)} is 0 at x = ${ratio(w)}, not x = ${ratio(-w)}.`]);
        }
      });
      if (m > 1 && !isZero(n)) offers.push([[n, 0], `Reads ${num(n)} from ${bin(m, -n)} without dividing by ${m}.`]);
      if (p0 !== 0) offers.push([[0, p0], "Gives the y-intercept of the graph, where x = 0, instead of an x-intercept."]);
      if (z !== 0) offers.push([[0, z], "Puts the zero on the y-axis; an x-intercept has y-coordinate 0."]);
      const chosen = t.shuffle(offers);
      return {
        ...common,
        responseType: "multiple-choice",
        stem: "The function p is defined by the given equation. Which of the following is an x-intercept of the graph of y = p(x) in the xy-plane?",
        correct: pt(z, 0),
        wrong: chosen.map(([[x, y], why]) => [pt(x, y), why]),
        explanation:
          `The graph meets the x-axis where p(x) = 0, which happens when one factor is 0. The zeros are ${zeroList}, ` +
          `so the x-intercepts are the points with those x-coordinates and y = 0. Of the choices, only ${pt(z, 0)} is one of them.`,
        steps: [
          "An x-intercept is a point (x, 0) where p(x) = 0.",
          `Set each factor equal to 0: x = ${zeroList}.`,
          `Of the choices, only ${pt(z, 0)} has one of these x-coordinates and y = 0.`,
        ],
        trap: `${factorOf(z)} is 0 at x = ${ratio(z)}; the number printed in a factor has the opposite sign of its zero${m > 1 ? `, and ${bin(m, -n)} must also be divided by ${m}` : ""}.`,
        verify: () => approx(p(z), 0) && chosen.every(([[x, y]]) => y !== 0 || !approx(p(x), 0)),
      };
    }
    if (mode === "yint") {
      if (p0 === 0) return null;
      const constants = factors.map(([, k]) => k);
      return {
        ...common,
        responseType: "numeric",
        stem: "The function p is defined by the given equation. In the xy-plane, the graph of y = p(x) intersects the y-axis at the point (0, b). What is the value of b?",
        correct: p0,
        explanation: `The graph meets the y-axis where x = 0, so b = p(0) = ${constants.map((k) => `(${num(k)})`).join("")} = ${num(p0)}.`,
        steps: [
          "The y-intercept is where x = 0.",
          `Substitute x = 0 into each factor: ${constants.map((k) => `(${num(k)})`).join("")}.`,
          `Multiply: b = ${num(p0)}.`,
        ],
        trap: `Multiplying the zeros ${zeroList} gives ${ratio(r1 * r2 * (n / m))}, not p(0); the y-intercept multiplies the constants in the factors.`,
        verify: () => {
          const expanded = factors.reduce((coeffs, [mm, k]) => {
            const next = new Array(coeffs.length + 1).fill(0);
            coeffs.forEach((c, i) => {
              next[i] += c * mm;
              next[i + 1] += c * k;
            });
            return next;
          }, [1]);
          return expanded[expanded.length - 1] === p0;
        },
      };
    }
    // mode === "positive": exactly one positive zero, asked for directly.
    const positives = zeros.filter((z) => z > 0);
    if (positives.length !== 1 || !gridable(positives[0])) return null;
    const z = positives[0];
    const fromFactor = factors.find(([mm, k]) => approx(-k / mm, z));
    return {
      ...common,
      responseType: "numeric",
      stem: "The function p is defined by the given equation. The graph of y = p(x) in the xy-plane crosses the x-axis at exactly one point whose x-coordinate is positive. What is that x-coordinate?",
      correct: z,
      explanation: `p(x) = 0 when a factor is 0, so the zeros are ${zeroList}. The only positive one is ${ratio(z)}${denominator(z) > 1 ? `, or ${num(z)}` : ""}.`,
      steps: [
        "The graph crosses the x-axis where p(x) = 0.",
        `Set each factor equal to 0: x = ${zeroList}.`,
        `The only positive value is ${num(z)}.`,
      ],
      trap: fromFactor[0] > 1
        ? `Reading ${num(-fromFactor[1])} straight from ${bin(fromFactor[0], fromFactor[1])} forgets to divide by ${fromFactor[0]}.`
        : "The printed sign in each factor is the opposite of the zero's sign.",
      verify: () => approx(p(z), 0) && [0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7].every((x) => approx(x, z) || !approx(p(x), 0)),
    };
  }

  /* ============================================= exponential-model-reading */

  const MODELS = [
    { what: "the number of bacteria in a culture", short: "the number of bacteria", unit: "hour", start: "the culture was started", up: true },
    { what: "the population of a town", short: "the population of the town", unit: "year", start: "the town was founded", up: true },
    { what: "the number of members of an online forum", short: "the number of members", unit: "month", start: "the forum opened", up: true },
    { what: "the value, in dollars, of an investment", short: "the value of the investment", unit: "year", start: "the investment was made", up: true },
    { what: "the number of visitors per week to a museum's website", short: "the number of weekly visitors", unit: "week", start: "the website was redesigned", up: true },
    { what: "the value, in dollars, of a used car", short: "the value of the car", unit: "year", start: "the car was purchased", up: false },
    { what: "the mass, in grams, of a radioactive sample", short: "the mass of the sample", unit: "day", start: "the sample was first measured", up: false },
    { what: "the amount, in milligrams, of a medication in a patient's bloodstream", short: "the amount of the medication", unit: "hour", start: "the dose was given", up: false },
    { what: "the number of fish in a pond during a drought", short: "the number of fish", unit: "month", start: "the drought began", up: false },
  ];

  // Three distractors drawn from a pool of modelled slips. Most of the time
  // they all sit on one side of the key (when three do), so the key is the
  // extreme value; otherwise they are any three. Distractors built around the
  // key then do not give it away as the middle value.
  function spreadAround(t, key, pool, oneSide = 0.5) {
    const usable = pool.filter(([value], index) => Number.isFinite(value) && value !== key &&
      pool.findIndex(([other]) => other === value) === index);
    const above = usable.filter(([value]) => value > key);
    const below = usable.filter(([value]) => value < key);
    if (t.chance(oneSide)) {
      const sides = [below, above].filter((side) => side.length >= 3);
      if (sides.length) return t.sample(t.pick(sides), 3);
    }
    return t.sample(usable, Math.min(3, usable.length));
  }

  // Applies spreadAround to a multiple-choice record whose key and modelled
  // mistakes are all numbers; other records pass through unchanged.
  function spreadChoices(t, record) {
    if (!record || record.responseType !== "multiple-choice") return record;
    const keyValue = labelValue(S.label(record.correct));
    const entries = (record.wrong || []).map(([value, why]) => [labelValue(S.label(value)), why, value]);
    if (!Number.isFinite(keyValue) || entries.length < 3 || entries.some(([value]) => !Number.isFinite(value))) return record;
    const picked = spreadAround(t, keyValue, entries);
    return picked.length === 3 ? { ...record, wrong: picked.map(([, why, value]) => [value, why]) } : record;
  }

  function percentRateItem(t) {
    const ctx = t.pick(MODELS);
    const r = t.pick(ctx.up ? [2, 3, 4, 5, 6, 8, 12, 15, 25] : [2, 4, 5, 8, 10, 12, 15, 20, 25]);
    const hundredths = ctx.up ? 100 + r : 100 - r;
    const base = decimalText(hundredths, 2);
    const A = t.int(2, 60) * 50;
    const word = ctx.up ? "increase" : "decrease";
    // Either the percent change, or the new amount as a percent of the old.
    const askFactor = t.chance(0.45);
    const key = askFactor ? hundredths : r;
    const pool = askFactor
      ? [
        [r, `Gives the percent ${word}, not the new amount as a percent of the old one.`],
        [Number(base), `Reads the base ${base} as a percent without converting it to hundredths.`],
        [ctx.up ? 100 - r : 100 + r, ctx.up
          ? `Subtracts the ${r}% from 100%, as if ${ctx.short} decreased.`
          : `Adds the ${r}% to 100%, as if ${ctx.short} increased.`],
        [Number(decimalText(r, 2)), `Writes the decimal ${decimalText(r, 2)} for the change and stops, without converting to a percent or adding 100%.`],
      ]
      : [
        [hundredths, ctx.up
          ? `Writes the factor ${base} as a percent; the factor includes the original 100%.`
          : `Gives the percent of ${ctx.short} that remains each ${ctx.unit}, not the percent decrease.`],
        [Number(base), `Reads the base ${base} itself as a percent.`],
        [Number(decimalText(r, 2)), `Stops at the decimal ${decimalText(r, 2)} without converting it to a percent.`],
        [ctx.up ? r * 10 : Math.min(100 - r, r * 10), ctx.up
          ? `Reads the decimal ${decimalText(r, 2)} as tenths, so ${decimalText(r, 2)} becomes ${r * 10}%.`
          : `Reads the decimal ${decimalText(r, 2)} as tenths, so ${decimalText(r, 2)} becomes ${r * 10}%.`],
      ];
    const wrong = spreadAround(t, key, pool.filter(([value]) => value <= 100 * 3 && value > 0));
    const stem = askFactor
      ? `The function f models ${ctx.what} t ${ctx.unit}s after ${ctx.start}. According to the model, each ${ctx.unit} ${ctx.short} is what percent of ${ctx.short} one ${ctx.unit} earlier?`
      : `The function f models ${ctx.what} t ${ctx.unit}s after ${ctx.start}. According to the model, by what percent does ${ctx.short} ${word} each ${ctx.unit}?`;
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${base})^t` },
      stem,
      correct: `${key}%`,
      wrong: wrong.map(([value, why]) => [`${num(value)}%`, why]),
      explanation:
        `Each ${ctx.unit}, f is multiplied by ${base}, so each value is ${hundredths}% of the one before. ` +
        `${ctx.up ? `${base} = 1 + ${decimalText(r, 2)}` : `${base} = 1 ${MINUS} ${decimalText(r, 2)}`}, ` +
        `so ${ctx.short} ${word}s by ${decimalText(r, 2)}, or ${r}%, each ${ctx.unit}.`,
      steps: [
        `The base ${base} is the factor applied each ${ctx.unit}.`,
        `As a percent, ${base} is ${hundredths}%: each value is ${hundredths}% of the previous one.`,
        askFactor
          ? `So the answer is ${hundredths}%.`
          : `${ctx.up ? `${hundredths}% ${MINUS} 100%` : `100% ${MINUS} ${hundredths}%`} = ${r}%, so the ${word} is ${r}% each ${ctx.unit}.`,
      ],
      principles: ["In A(b)^t, a base b = 1 + r means growth by r per period and b = 1 − r means decay by r per period; b itself, as a percent, compares each value with the one before."],
      trap: askFactor
        ? `${r}% is the change each ${ctx.unit}, not the new amount compared with the old.`
        : ctx.up
          ? `${hundredths}% is the new amount as a percent of the old one, not the increase.`
          : `${hundredths}% is what remains, not what is lost.`,
      hint: `What does multiplying by ${base} do to an amount?`,
      verify: () => {
        const f = (x) => A * (hundredths / 100) ** x;
        const ratio = (f(4) / f(3)) * 100;
        const change = Math.abs(ratio - 100);
        return approx(askFactor ? ratio : change, key, 1e-9) && (ratio > 100) === ctx.up &&
          wrong.every(([value]) => !approx(value, key));
      },
    };
  }

  function coefficientMeaningItem(t) {
    const ctx = t.pick(MODELS);
    const r = t.pick(ctx.up ? [3, 5, 6, 8, 10, 20] : [4, 5, 10, 15, 20]);
    const base = decimalText(ctx.up ? 100 + r : 100 - r, 2);
    const A = t.int(4, 90) * 25;
    const word = ctx.up ? "increase" : "decrease";
    const Short = cap(ctx.short);
    // Phrasings of different lengths, so neither length marks the key.
    const key = t.pick([`${Short} when ${ctx.start}`, `${Short} at the time ${ctx.start}`, `${Short} at t = 0, when ${ctx.start}`]);
    const wrong = t.sample([
      [`${Short} 1 ${ctx.unit} after ${ctx.start}`, `Evaluates the model at t = 1; ${commas(A)} is the value at t = 0.`],
      [t.pick([`The ${word} each ${ctx.unit}`, `The ${word} in ${ctx.short} each ${ctx.unit}`]), "Treats the coefficient as a fixed change per period, as in a linear model."],
      [t.pick([`The percent ${word} each ${ctx.unit}`, `The percent ${word} in ${ctx.short} each ${ctx.unit}`]), `The percent ${word} comes from the base ${base}, not from the coefficient.`],
      [`${Short} after ${ctx.unit === "day" ? "one week" : `${commas(A)} ${ctx.unit}s`}`, `Reads the coefficient as a number of ${ctx.unit}s instead of an amount.`],
    ], 3);
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${base})^t` },
      stem: `The function f models ${ctx.what} t ${ctx.unit}s after ${ctx.start}. Which of the following is the best interpretation of ${commas(A)} in this context?`,
      correct: key,
      wrong,
      explanation:
        `At t = 0, (${base})^0 = 1, so f(0) = ${commas(A)}. The coefficient is ${ctx.short} when ${ctx.start}; ` +
        `the base ${base} describes the ${r}% ${word} each ${ctx.unit}.`,
      steps: [
        `Substitute t = 0: f(0) = ${commas(A)}(${base})^0.`,
        `Any nonzero number to the power 0 is 1, so f(0) = ${commas(A)}.`,
        `t = 0 is the moment ${ctx.start}, so ${commas(A)} is ${ctx.short} at that time.`,
      ],
      principles: ["In f(t) = A(b)^t, A = f(0) is the starting value and b is the factor applied each period."],
      trap: `The coefficient is not the amount of ${word} each ${ctx.unit}; that would describe a linear model.`,
      hint: "What does the model give when t = 0?",
      verify: () => approx(A * Number(base) ** 0, A) && !approx(A * Number(base), A),
    };
  }

  function laterValueItem(t, numeric) {
    const ctx = t.pick(MODELS);
    const tenths = t.pick(ctx.up ? [11, 12, 15, 20, 30] : [9, 8, 5]);
    const n = [20, 30, 5].includes(tenths) ? t.pick([2, 3]) : 2;
    const scale = tenths % 10 === 0 ? 1 : 10 ** (n + 1);
    const A = t.int(2, 40) * Math.max(scale, 10);
    if (A < 100 && scale === 1) return null;
    if (A > 99999) return null;
    const base = decimalText(tenths, 1);
    const power = (k) => (A * tenths ** k) / 10 ** k;
    const value = power(n);
    const one = power(1);
    const times = (A * n * tenths) / 10;
    const linear = A + n * (one - A);
    if (!Number.isInteger(value) || value > 99999) return null;
    // 2 × 2 = 2²: the trap below names this slip, so it must not land on the key.
    if (times === value || one === value) return null;
    const pool = [
      [one, `Applies the factor ${base} only once, giving the value after 1 ${ctx.unit}.`],
      [times, `Uses ${base} × ${n} in place of (${base})${sup(n)}, multiplying instead of raising to a power.`],
      [linear, `Adds the first ${ctx.unit}'s change, ${commas(one - A)}, ${n} times, as if the change were linear.`],
      [power(n + 1), `Applies the factor ${n + 1} times, counting one ${ctx.unit} too many.`],
      [value - A, `Gives the change over ${n} ${ctx.unit}s instead of the value.`],
    ].filter(([v]) => Number.isInteger(v) && v > 0 && v <= 999999);
    const wrong = spreadAround(t, value, pool);
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${base})^t` },
      stem: `The function f models ${ctx.what} t ${ctx.unit}s after ${ctx.start}. According to the model, what is ${ctx.short} ${n} ${ctx.unit}s after ${ctx.start}?`,
      correct: numeric ? value : commas(value),
      wrong: numeric ? pool.map(([v]) => [v, "slip"]) : wrong.map(([v, why]) => [commas(v), why]),
      explanation: `f(${n}) = ${commas(A)}(${base})${sup(n)} = ${commas(A)} × ${decimalText(tenths ** n, n)} = ${commas(value)}.`,
      steps: [
        `Substitute t = ${n}: f(${n}) = ${commas(A)}(${base})${sup(n)}.`,
        `(${base})${sup(n)} = ${decimalText(tenths ** n, n)}.`,
        `${commas(A)} × ${decimalText(tenths ** n, n)} = ${commas(value)}.`,
      ],
      principles: ["Evaluate the power before multiplying by the coefficient."],
      trap: `One application of ${base} gives ${commas(one)}, and using ${base} × ${n} in place of (${base})${sup(n)} gives ${commas(times)}; neither is the value after ${n} ${ctx.unit}s.`,
      hint: `How many times is ${commas(A)} multiplied by ${base}?`,
      verify: () => {
        let amount = A;
        for (let step = 0; step < n; step += 1) amount = (amount * tenths) / 10;
        return approx(amount, value) && (numeric || wrong.every(([v]) => !approx(v, amount)));
      },
    };
  }

  /* =============================================== quadratic-vertex-reading */

  function vertexFormText(a, h, k, name = "f(x)") {
    return `${name} = ${lead(a)}(${lin(1, -h)})² ${signed(k)}`;
  }

  function extremeValueItem(t, numeric) {
    const a = t.pick([1, 2, 3, -1, -2, -3]);
    const h = t.nonzero(-9, 9);
    const k = t.nonzero(-20, 20);
    const word = a > 0 ? "minimum" : "maximum";
    const f0 = a * h * h + k;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: vertexFormText(a, h, k) },
      stem: `The function f is defined by the given equation. What is the ${word} value of f(x)?`,
      correct: k,
      wrong: spreadAround(t, k, [
        [h, `Gives the x-coordinate of the vertex, where the ${word} occurs, not the ${word} value.`],
        [-h, "Gives the x-coordinate of the vertex, with its sign reversed as well."],
        [f0, "Gives f(0), the y-intercept, instead of the value at the vertex."],
        [a * 4 * h * h + k, `Reads the vertex at x = ${num(-h)} from the sign in the parentheses and evaluates f there.`],
        [-k, "Reverses the sign of the constant term."],
      ]),
      explanation:
        `(${lin(1, -h)})² is never negative and is 0 at x = ${num(h)}. ${a > 0 ? "Since the leading coefficient is positive, f(x) is least" : "Since the leading coefficient is negative, f(x) is greatest"} ` +
        `when that square is 0, so the ${word} value is f(${num(h)}) = ${num(k)}.`,
      steps: [
        `The vertex of y = a(x − h)² + k is (h, k); here it is (${num(h)}, ${num(k)}).`,
        `The parabola opens ${a > 0 ? "upward" : "downward"}, so the vertex is a ${word}.`,
        `The ${word} value is the y-coordinate, ${num(k)}.`,
      ],
      principles: ["For f(x) = a(x − h)² + k, the extreme value is k, reached at x = h."],
      trap: numeric
        ? `${num(h)} is where the ${word} occurs, not the ${word} value.`
        : "The x-coordinate of the vertex and the value of f there are different quantities.",
      hint: "For what x is the squared part 0, and what is f then?",
      verify: () => {
        let best = a > 0 ? Infinity : -Infinity;
        for (let x = h - 10; x <= h + 10; x += 0.25) {
          const y = a * (x - h) ** 2 + k;
          best = a > 0 ? Math.min(best, y) : Math.max(best, y);
        }
        return approx(best, k);
      },
    };
  }

  function vertexPointItem(t) {
    const a = t.pick([1, 2, 3, -1, -2, 4]);
    const h = t.nonzero(-8, 8);
    const k = t.nonzero(-12, 12);
    if (Math.abs(h) === Math.abs(k)) return null;
    const f0 = a * h * h + k;
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: vertexFormText(a, h, k, "y") },
      stem: "The graph of the given equation in the xy-plane is a parabola. What are the coordinates of the vertex of the parabola?",
      correct: S.point(h, k),
      wrong: [
        [S.point(-h, k), `Takes the x-coordinate with the sign printed inside the parentheses; (${lin(1, -h)})² is 0 at x = ${num(h)}.`],
        [S.point(k, h), "Swaps the x- and y-coordinates of the vertex."],
        [S.point(0, f0), "Gives the y-intercept of the parabola, where x = 0."],
        [S.point(-h, -k), "Reverses the signs of both coordinates."],
      ],
      explanation: `In y = a(x − h)² + k the vertex is (h, k). Here (${lin(1, -h)})² is 0 at x = ${num(h)}, where y = ${num(k)}, so the vertex is ${S.point(h, k)}.`,
      steps: [
        `Match the equation to y = a(x − h)² + k: h = ${num(h)} and k = ${num(k)}.`,
        `The squared term is 0 at x = ${num(h)}, the vertex's x-coordinate.`,
        `There y = ${num(k)}, so the vertex is ${S.point(h, k)}.`,
      ],
      principles: ["The graph of y = a(x − h)² + k has its vertex at (h, k)."],
      trap: `(${lin(1, -h)}) shows ${signed(-h).replace(" ", "")}, but the vertex is at x = ${num(h)}.`,
      hint: "For what value of x is the squared part 0?",
      verify: () => {
        const y = (x) => a * (x - h) ** 2 + k;
        return approx(y(h), k) && approx(y(h - 1.5), y(h + 1.5)) && !approx(y(-h - 1.5), y(-h + 1.5));
      },
    };
  }

  function factoredVertexItem(t, numeric) {
    const a = t.pick([1, 2, -1, -3, 3]);
    const r = t.int(-8, 8);
    const s = t.int(-8, 8);
    if (r === s || r + s === 0) return null;
    const mid = (r + s) / 2;
    const text = `f(x) = ${lead(a)}${rootFactor(r)}${rootFactor(s)}`;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: text },
      stem: "The function f is defined by the given equation. What is the x-coordinate of the vertex of the graph of y = f(x) in the xy-plane?",
      correct: numeric ? mid : ratio(mid),
      wrong: spreadAround(t, mid, [
        [-mid, "Reads the zeros from the factors with the wrong signs, then takes their midpoint."],
        [r + s, "Adds the zeros but does not divide by 2."],
        [Math.abs(r - s) / 2, "Takes half the distance between the zeros instead of the point halfway between them."],
        [a * (mid - r) * (mid - s), "Gives the y-coordinate of the vertex instead of the x-coordinate."],
        [-(r + s), "Reads the zeros with the wrong signs and adds them without dividing by 2."],
      ]).map(([value, why]) => [ratio(value), why]),
      explanation: `The zeros of f are ${num(r)} and ${num(s)}. A parabola is symmetric about its vertex, so the vertex lies halfway between them: x = (${num(r)} + ${paren(s)})/2 = ${num(mid)}.`,
      steps: [
        `f(x) = 0 at x = ${num(r)} and x = ${num(s)}.`,
        "The vertex lies on the axis of symmetry, halfway between the zeros.",
        `x = (${num(r)} + ${paren(s)})/2 = ${num(mid)}.`,
      ],
      principles: ["The axis of symmetry of a parabola passes through the midpoint of its two x-intercepts."],
      trap: numeric
        ? `Reading the zeros with the wrong signs gives ${num(-mid)}, and forgetting to halve gives ${num(r + s)}.`
        : "The zeros have the opposite signs of the numbers printed in the factors.",
      hint: "Where does the graph cross the x-axis, and what point is exactly between those crossings?",
      verify: () => {
        const f = (x) => a * (x - r) * (x - s);
        const B = -a * (r + s);
        return approx(-B / (2 * a), mid) && approx(f(mid - 2.5), f(mid + 2.5));
      },
    };
  }

  function tableVertexItem(t) {
    const a = t.pick([1, 2, 3, -1, -2]);
    const x0 = t.int(-3, 2);
    const h = x0 + t.int(1, 4);
    const k = t.int(-15, 15);
    if (k === h) return null; // the trap contrasts the two
    const xs = [0, 1, 2, 3, 4, 5].map((i) => x0 + i);
    const f = (x) => a * (x - h) ** 2 + k;
    const askValue = t.chance(0.45);
    const word = a > 0 ? "minimum" : "maximum";
    const content = S.table(["x", "f(x)"], xs.map((x) => [x, f(x)]));
    return {
      responseType: "numeric",
      stimulus: { type: "table", content },
      stem: askValue
        ? `The table shows several values of the quadratic function f. What is the ${word} value of f(x)?`
        : "The table shows several values of the quadratic function f. What is the x-coordinate of the vertex of the graph of y = f(x) in the xy-plane?",
      correct: askValue ? k : h,
      explanation:
        `The values of f are symmetric about x = ${num(h)}: f(${num(h - 1)}) = f(${num(h + 1)}) = ${num(f(h + 1))}. ` +
        `So the axis of symmetry is x = ${num(h)}, and the vertex is (${num(h)}, ${num(k)}).`,
      steps: [
        `Find matching outputs: f(${num(h - 1)}) and f(${num(h + 1)}) are both ${num(f(h + 1))}.`,
        `The vertex lies halfway between them, at x = ${num(h)}.`,
        askValue ? `The ${word} value is f(${num(h)}) = ${num(k)}.` : `The x-coordinate of the vertex is ${num(h)}.`,
      ],
      principles: ["A quadratic takes equal values at inputs the same distance from its vertex."],
      trap: askValue
        ? `${num(h)} is where the ${word} occurs, not the ${word} value.`
        : `${num(k)} is the ${word} value, not the x-coordinate where it occurs.`,
      hint: "Look for two inputs that give the same output.",
      verify: () => {
        const rows = content.split("\n").slice(1).map((line) => line.split(" | ").map((cell) => Number(cell.replace(MINUS, "-"))));
        const at = new Map(rows);
        const mirrored = [1, 2].every((j) => !at.has(h - j) || !at.has(h + j) || at.get(h - j) === at.get(h + j));
        const extreme = a > 0 ? Math.min(...rows.map((row) => row[1])) : Math.max(...rows.map((row) => row[1]));
        return mirrored && extreme === k && at.get(h) === k;
      },
    };
  }

  /* ================================================= projectile-height-model */

  const LAUNCHES = [
    { g: 16, unit: "feet", noun: "ball", verb: "thrown", from: "upward from the roof of a building" },
    { g: 16, unit: "feet", noun: "stone", verb: "launched", from: "upward from the edge of a cliff" },
    { g: 16, unit: "feet", noun: "model rocket", verb: "launched", from: "from a raised platform" },
    { g: 16, unit: "feet", noun: "ball", verb: "hit", from: "upward from a batting tee on a hillside" },
    { g: 5, unit: "meters", noun: "water balloon", verb: "launched", from: "upward from a balcony" },
    { g: 5, unit: "meters", noun: "signal flare", verb: "fired", from: "upward from the top of a tower" },
  ];

  function projectileItem(t, ask, numeric) {
    const ctx = t.pick(LAUNCHES);
    const t2 = t.int(3, 10);
    const u = t.int(1, Math.min(t2 - 2, 6));
    const { g } = ctx;
    if (g === 5 && (t2 + u) % 2 !== 0) return null;
    const v = g * (t2 - u);
    const h0 = g * t2 * u;
    const peakT = (t2 - u) / 2;
    const peak = (g * (t2 + u) ** 2) / 4;
    const h = (time) => -g * time * time + v * time + h0;
    const model = `h(t) = ${poly([-g, v, h0], "t")}`;
    const intro = `The given function h models the height, in ${ctx.unit}, above the ground of a ${ctx.noun} t seconds after it is ${ctx.verb} ${ctx.from}.`;
    const factoredText = `${MINUS}${g}${bin(1, -t2, "t")}${bin(1, u, "t")}`;
    let stem;
    let key;
    let wrong;
    let steps;
    let trap;
    if (ask === "ground") {
      stem = `${intro} How many seconds after it is ${ctx.verb} does the ${ctx.noun} hit the ground?`;
      key = t2;
      wrong = [
        [u, `Takes the negative solution, t = ${MINUS}${u}, and drops its sign; a time before launch is not in the model's domain.`],
        [peakT, "Gives the time of the maximum height, midway between the two zeros, not the landing time."],
        [t2 - u, `Gives the time the ${ctx.noun} returns to its starting height of ${h0} ${ctx.unit}, where h(t) = ${h0}, not 0.`],
        [t2 + u, `Subtracts the negative solution from the positive one, ${t2} ${MINUS} (${MINUS}${u}), as if the flight began at t = ${MINUS}${u}.`],
        [h0, `Gives the starting height, h(0) = ${h0}, instead of a time.`],
      ];
      steps = [
        `The ${ctx.noun} hits the ground when h(t) = 0: ${poly([-g, v, h0], "t")} = 0.`,
        `Factor: ${factoredText} = 0, so t = ${t2} or t = ${MINUS}${u}.`,
        `Time after launch cannot be negative, so t = ${t2}.`,
      ];
      trap = `t = ${MINUS}${u} also solves h(t) = 0, but a negative time is before the ${ctx.noun} was ${ctx.verb}.`;
    } else if (ask === "peak") {
      stem = `${intro} What is the maximum height, in ${ctx.unit}, that the ${ctx.noun} reaches?`;
      key = peak;
      wrong = [
        [peakT, `Gives the time, ${num(peakT)} seconds, at which the maximum occurs, not the height.`],
        [h0, `Gives the starting height h(0) = ${h0}.`],
        [g * peakT * peakT + v * peakT + h0, `Evaluates h(${num(peakT)}) with +${g}t² instead of ${MINUS}${g}t².`],
        [h(t2 / 2), `Takes the maximum at t = ${num(t2 / 2)}, halfway to the landing time, instead of at the vertex.`],
      ];
      steps = [
        `The maximum occurs at the vertex, t = ${v}/(2 · ${g}) = ${num(peakT)}.`,
        `Evaluate h(${num(peakT)}) = ${MINUS}${g}(${num(peakT)})² + ${v}(${num(peakT)}) + ${h0}.`,
        `h(${num(peakT)}) = ${num(peak)}, so the maximum height is ${num(peak)} ${ctx.unit}.`,
      ];
      trap = `${num(peakT)} is the time of the maximum, an intermediate value; the question asks for the height.`;
    } else {
      const tau1 = t.int(0, Math.max(0, Math.ceil(peakT) - 1));
      const tau2 = t2 - u - tau1;
      if (tau1 >= tau2) return null;
      const H = h(tau1);
      stem = `${intro} The ${ctx.noun} is ${H} ${ctx.unit} above the ground at two different times. What is the later of these two times, in seconds?`;
      key = tau2;
      wrong = [
        [tau1, "Gives the earlier of the two times, when the object is still rising."],
        [peakT, "Gives the time of the maximum height."],
        [t2, "Gives the time the object hits the ground."],
        [tau1 + tau2, "Adds the two times, the sum of the solutions, instead of choosing the later one."],
        [H, `Gives the height, ${H} ${ctx.unit}, instead of the time.`],
      ];
      steps = [
        `Set h(t) = ${H}: ${poly([-g, v, h0 - H], "t")} = 0.`,
        `Divide by ${MINUS}${g} and factor: ${tau1 === 0 ? "t" : bin(1, -tau1, "t")}${bin(1, -tau2, "t")} = 0, so t = ${tau1} or t = ${tau2}.`,
        `The later time is ${tau2} seconds.`,
      ];
      trap = `Both t = ${tau1} and t = ${tau2} give a height of ${H}; the question asks for the later one.`;
    }
    const offered = spreadAround(t, key, wrong.filter(([value]) => Number.isFinite(value) && value > 0), 0.8);
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: model },
      stem,
      correct: key,
      wrong: numeric ? wrong : offered,
      explanation: steps.join(" "),
      steps,
      principles: [
        "A downward-opening quadratic model reaches its maximum at t = −b/(2a); its zeros are the times the height is 0.",
        "A solution of the equation is an answer to the question only if it fits the context.",
      ],
      trap,
      hint: ask === "peak" ? "When does the height stop increasing?" : "Which equation in t describes that moment?",
      verify: () => {
        if (ask === "ground") {
          // Scan forward from launch for the first time the height reaches 0.
          let time = 0;
          while (h(time) > 0 && time < 20) time += 0.5;
          return approx(time, key) && h(key) === 0 && h(-u) === 0;
        }
        if (ask === "peak") {
          let best = -Infinity;
          for (let time = 0; time <= t2; time += 0.125) best = Math.max(best, h(time));
          return approx(best, key);
        }
        const target = h(wrong[0][0]);
        const hits = [];
        for (let time = 0; time <= t2; time += 0.5) if (approx(h(time), target)) hits.push(time);
        return hits.length === 2 && approx(hits[1], key);
      },
    };
  }

  /* ================================================= exponential-table-model */

  // Bases as exact fractions top/bottom, with the text a student sees.
  const TABLE_BASES = [
    { text: "2", top: 2, bottom: 1 },
    { text: "3", top: 3, bottom: 1 },
    { text: "4", top: 4, bottom: 1 },
    { text: "5", top: 5, bottom: 1 },
    { text: "1/2", top: 1, bottom: 2 },
    { text: "1/3", top: 1, bottom: 3 },
    { text: "0.5", top: 1, bottom: 2 },
    { text: "1.5", top: 3, bottom: 2 },
    { text: "2.5", top: 5, bottom: 2 },
    { text: "0.8", top: 4, bottom: 5 },
    { text: "1.2", top: 6, bottom: 5 },
  ];

  // top/bottom in the style of the base it came from: a decimal when the base
  // is written as a decimal and the value terminates, otherwise a fraction.
  function fractionText(top, bottom, decimalStyle) {
    const g = S.gcd(top, bottom);
    const [n, d] = [top / g, bottom / g];
    if (d === 1) return String(n);
    const decimal = decimalStyle ? ratioText(n, d, 4) : null;
    return decimal || `${n}/${d}`;
  }

  function exponentialTableItem(t, ask) {
    const base = t.pick(TABLE_BASES);
    // Rows one apart, or two apart (then consecutive rows differ by the base squared).
    const step = ask === "equation" && t.chance(0.3) ? 2 : 1;
    // The table never shows x = 0: it starts after it, or ends just before it.
    const x0 = t.pick(step === 2 ? [1, 2] : [1, 2, 3, -4]);
    const xs = [0, 1, 2, 3].map((i) => x0 + step * i);
    const last = xs[3] + step;
    // The coefficient must make every shown value (and the value asked) whole.
    const lowest = Math.min(0, x0);
    const highest = Math.max(last, 0);
    const unit = base.bottom ** Math.max(0, highest) * base.top ** Math.max(0, -lowest);
    const a = unit * t.int(1, base.bottom === 1 && base.top <= 3 ? 12 : 4);
    const f = (x) => (a * base.top ** Math.max(x, 0) * base.bottom ** Math.max(-x, 0)) / (base.bottom ** Math.max(x, 0) * base.top ** Math.max(-x, 0));
    const values = xs.map(f);
    if (values.concat([f(last), a]).some((value) => !Number.isInteger(value) || value > 99999 || value < 1)) return null;
    if (values[0] === a) return null;
    const content = S.table(["x", "f(x)"], xs.map((x) => [x, f(x)]));
    const ratioValue = base.top / base.bottom;
    const stepTop = base.top ** step;
    const stepBottom = base.bottom ** step;
    const decimalStyle = base.text.includes(".");
    const stepText = step === 1 ? base.text : fractionText(stepTop, stepBottom, decimalStyle);
    const inverse = fractionText(base.bottom, base.top, decimalStyle);
    const form = (coef, baseText) => `f(x) = ${commas(coef)}(${baseText})^x`;
    const intro = "The table shows values of the exponential function f for selected values of x.";
    const backSteps = x0 > 0
      ? `Work back to x = 0: f(0) = ${commas(values[0])} ÷ ${x0 === 1 ? base.text : `(${base.text})${sup(x0)}`} = ${commas(a)}.`
      : `Step forward to x = 0: f(0) = ${commas(values[3])} × ${base.text} = ${commas(a)}.`;
    const steps = [
      step === 1
        ? `Each value is the one before it times ${base.text}: ${commas(values[1])} ÷ ${commas(values[0])} = ${base.text}.`
        : `Consecutive rows are 2 apart in x, and each value is the one before it times ${stepText}, so each increase of 1 in x multiplies f by √(${stepText}) = ${base.text}.`,
      backSteps,
    ];
    if (ask === "equation") {
      // A 2 × 2 grid: coefficient f(0) or the first table value, times the
      // base or the wrong base (its reciprocal, or the two-step ratio).
      const wrongBase = step === 1 ? inverse : stepText;
      const wrongBaseValue = step === 1 ? 1 / ratioValue : ratioValue ** 2;
      const baseWhy = step === 1
        ? "inverts the ratio, dividing each value by the next one instead of the previous one"
        : `uses ${stepText}, the ratio between rows, as the base, but the rows are 2 apart in x`;
      const offers = [
        [form(values[0], base.text), `Uses f(${num(x0)}) = ${commas(values[0])} as the coefficient; the coefficient is f(0), and the table starts at x = ${num(x0)}.`, (x) => values[0] * ratioValue ** x],
        [form(a, wrongBase), `Finds f(0) but ${baseWhy}.`, (x) => a * wrongBaseValue ** x],
        [form(values[0], wrongBase), `Uses the first table value as the coefficient and ${baseWhy}.`, (x) => values[0] * wrongBaseValue ** x],
      ];
      const keyText = form(a, base.text);
      return {
        responseType: "multiple-choice",
        stimulus: { type: "table", content },
        stem: `${intro} Which equation defines f?`,
        correct: keyText,
        wrong: offers.map(([text, why]) => [text, why]),
        explanation: `${steps.join(" ")} So f(x) = ${commas(a)}(${base.text})^x.`,
        steps: [...steps, `So f(x) = ${commas(a)}(${base.text})^x.`],
        principles: ["An exponential function multiplies by the same factor for each increase of 1 in x; its coefficient is f(0), which may lie outside the table."],
        trap: `${commas(values[0])} is f(${num(x0)}), not f(0), and the base is the factor for a change of 1 in x.`,
        hint: "Compare consecutive outputs by dividing. What would f be at x = 0?",
        verify: () => {
          const rows = readTable(content);
          const fits = (fn) => rows.every(([x, y]) => approx(fn(x), y));
          // The key is rebuilt from its displayed coefficient and base.
          const [, coef, baseShown] = keyText.match(/^f\(x\) = ([\d,]+)\(([\d./]+)\)\^x$/);
          const [top, bottom = "1"] = baseShown.split("/");
          const shown = (x) => Number(coef.replace(/,/g, "")) * (Number(top) / Number(bottom)) ** x;
          return fits(shown) && offers.every(([, , fn]) => !fits(fn));
        },
      };
    }
    const rows = () => readTable(content);
    if (ask === "zero") {
      return {
        responseType: "numeric",
        stimulus: { type: "table", content },
        stem: `${intro} What is the value of f(0)?`,
        correct: a,
        wrong: [[values[0], "first row"], [values[0] - (values[1] - values[0]) * x0, "linear"]],
        explanation: steps.join(" "),
        steps: [...steps, `f(0) = ${commas(a)}.`],
        principles: ["Stepping x back by 1 divides an exponential function's value by its factor."],
        trap: `f(${num(x0)}) = ${commas(values[0])} is the first row, not f(0), and stepping by the first difference, as if f were linear, gives ${commas(values[0] - (values[1] - values[0]) * x0)}.`,
        hint: "What happens to f each time x decreases by 1?",
        verify: () => {
          const r = rows();
          const ratio = r[1][1] / r[0][1];
          return approx(r[0][1] / ratio ** r[0][0], a) && approx(r[3][1] / r[2][1], ratio);
        },
      };
    }
    const next = f(last);
    const prev = values[3];
    const linearNext = prev + (prev - values[2]);
    return {
      responseType: "numeric",
      stimulus: { type: "table", content },
      stem: `${intro} What is the value of f(${num(last)})?`,
      correct: next,
      wrong: [[linearNext, "linear"]],
      explanation: `Each increase of 1 in x multiplies f by ${base.text}, so f(${num(last)}) = ${commas(prev)} × ${base.text} = ${commas(next)}.`,
      steps: [
        `Find the factor: ${commas(values[1])} ÷ ${commas(values[0])} = ${base.text}.`,
        `The next value is one more step: f(${num(last)}) = f(${num(last - 1)}) × ${base.text}.`,
        `f(${num(last)}) = ${commas(prev)} × ${base.text} = ${commas(next)}.`,
      ],
      principles: ["Equal steps in x multiply an exponential function by equal factors; they do not add equal amounts."],
      trap: `Continuing the last difference, as if f were linear, gives ${commas(linearNext)}.`,
      hint: "Compare consecutive outputs by dividing, not subtracting.",
      verify: () => {
        const r = rows();
        const ratio = r[1][1] / r[0][1];
        return approx(r[3][1] * ratio, next) && !approx(linearNext, next);
      },
    };
  }

  // "a(x + 3)² − 7" from a coefficient label, h, and k.
  function vertexForm(lead, h, k) {
    return `${lead}(${lin(1, -h)})²${k === 0 ? "" : ` ${signed(k)}`}`;
  }

  function det3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }

  // Cramer's rule for a 3 × 3 linear system.
  function solve3(matrix, rhs) {
    const d = det3(matrix);
    return [0, 1, 2].map((column) =>
      det3(matrix.map((row, i) => row.map((value, j) => (j === column ? rhs[i] : value)))) / d,
    );
  }

  // Extreme value of a quadratic found by scanning it on a fine grid.
  function scanExtreme(fn, center, opensUp) {
    let best = fn(center - 12);
    for (let x = center - 12; x <= center + 12; x += 0.125) {
      const y = fn(x);
      if (opensUp ? y < best : y > best) best = y;
    }
    return best;
  }

  /* ================================================ vertex-from-conditions */

  // A to-scale graph of y = fn(x) through two labelled points at equal height.
  // Returns null when the layout would be hard to read: the points must sit on
  // either side of the y-axis (so their labels point away from it) and clearly
  // off the x-axis (so they cannot be mistaken for x-intercepts).
  function parabolaFigure(fn, a, h, extreme, marked, alt) {
    const W = 360;
    const H = 270;
    const side = 84;
    const top = 20;
    const bottom = 24;
    const level = marked[0][1];
    const reach = Math.abs(level - extreme);
    const beyond = a > 0 ? level + 0.35 * reach : level - 0.35 * reach;
    const half = Math.sqrt(Math.abs((beyond - extreme) / a));
    const curveLo = h - half;
    const curveHi = h + half;
    const xLo = Math.min(curveLo, -0.5) - 0.5;
    const xHi = Math.max(curveHi, 0.5) + 0.5;
    let yLo = Math.min(extreme, beyond, 0);
    let yHi = Math.max(extreme, beyond, 0);
    const span = yHi - yLo;
    if (!(marked[0][0] < 0 && marked[1][0] > 0) || Math.abs(level) < 0.15 * span) return null;
    yLo = Math.min(yLo, -0.12 * span) - 0.08 * span;
    yHi = Math.max(yHi, 0.12 * span) + 0.08 * span;
    const px = (x) => side + ((x - xLo) / (xHi - xLo)) * (W - 2 * side);
    const py = (y) => H - bottom - ((y - yLo) / (yHi - yLo)) * (H - top - bottom);
    const r1 = (value) => Math.round(value * 10) / 10;
    const curve = [];
    for (let i = 0; i <= 72; i += 1) {
      const x = curveLo + ((curveHi - curveLo) * i) / 72;
      curve.push(`${r1(px(x))},${r1(py(fn(x)))}`);
    }
    const thin = (x1, y1, x2, y2) =>
      `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="currentColor" stroke-width="1.25"/>`;
    const { text, dot } = S.svgParts;
    const parts = [
      thin(px(xLo), py(0), px(xHi), py(0)),
      thin(px(0), py(yLo), px(0), py(yHi)),
      text(px(xHi) + 10, py(0) + (level > 0 ? 12 : -12), "x"),
      text(px(0), py(yHi) - 10, "y"),
      text(px(0) - 9, py(0) + 11, "O"),
      `<polyline points="${curve.join(" ")}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    ];
    marked.forEach(([x, y], index) => {
      parts.push(dot(px(x), py(y)));
      parts.push(text(px(x) + (index === 0 ? -9 : 9), py(y), point(x, y), index === 0 ? "end" : "start"));
    });
    return { svg: S.svg(W, H, parts, alt), alt, notToScale: false };
  }

  // Vertex and one more point; ask a + b + c (that is, f(1)) or b.
  function vertexAndPoint(t, numeric) {
    let a;
    let h;
    let dx;
    let v;
    let x1;
    for (;;) {
      a = t.pick([1, 2, 3, -1, -2, 2, -3]);
      h = t.nonzero(-5, 5);
      dx = t.nonzero(-3, 3);
      v = t.nonzero(-9, 9);
      x1 = h + dx;
      if (h === 1 || x1 === 0 || x1 === 1 || x1 === 2 * h - 1) continue;
      break;
    }
    const y1 = v + a * dx * dx;
    const b = -2 * a * h;
    const c = a * h * h + v;
    const f1 = a + b + c;
    const askSum = t.chance(0.6);
    // The same student writing the vertex form as a(x + h)² from the start.
    const flipped = x1 + h === 0 ? null : (y1 - v) / ((x1 + h) * (x1 + h));
    const flippedNice = flipped !== null && denominatorHard(flipped) <= 2 && flipped !== a;
    const wrong = askSum
      ? [
        flippedNice
          ? [ratioHard(tidy(flipped * (1 + h) * (1 + h) + v)), `Writes the vertex form as a(x ${signed(h)})² ${signed(v)}, flipping the sign of the vertex's x-coordinate, and finds a from that.`]
          : [a * (1 + h) * (1 + h) + v, `Expands the vertex form as a(x ${signed(h)})² ${signed(v)}, flipping the sign of the vertex's x-coordinate.`],
        [c, "Gives c, the value of f(0), rather than a + b + c."],
        [a, "Stops after finding a."],
        [a - 2 * h + h * h + v, `Multiplies only the x² term by ${num(a)} when expanding a(${lin(1, -h)})².`],
        [v, "Gives the y-coordinate of the vertex."],
      ]
      : [
        flippedNice
          ? [ratioHard(tidy(2 * flipped * h)), `Writes the vertex form as a(x ${signed(h)})² ${signed(v)}, flipping the sign of the vertex's x-coordinate, and finds a from that.`]
          : [2 * a * h, `Expands the vertex form as a(x ${signed(h)})², which flips the sign of b.`],
        [-a * h, `Uses x = −b/a for the axis of symmetry instead of x = −b/(2a), giving b = ${num(-a * h)}.`],
        [-2 * h, `Multiplies only the x² term by ${num(a)} when expanding, so b = ${num(-2 * h)}.`],
        [a, "Stops after finding a."],
      ];
    const vf = vertexForm("a", h, v);
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: null,
      stem:
        "The function f is defined by f(x) = ax² + bx + c, where a, b, and c are constants. In the xy-plane, the " +
        `graph of y = f(x) has its vertex at ${point(h, v)} and passes through the point ${point(x1, y1)}. ` +
        `What is the value of ${askSum ? "a + b + c" : "b"}?`,
      correct: askSum ? f1 : b,
      wrong,
      explanation:
        `With vertex ${point(h, v)}, f(x) = ${vf}. Substituting ${point(x1, y1)} gives ${num(y1)} = ` +
        `a(${num(x1)} ${signed(-h)})² ${signed(v)} = ${term(dx * dx, "a")} ${signed(v)}, so a = ${num(a)}. ` +
        (askSum
          ? `The sum a + b + c is f(1) = ${num(a)}(1 ${signed(-h)})² ${signed(v)} = ${num(f1)}.`
          : `Expanding, ${vertexForm(num(a) === "1" ? "" : num(a) === "−1" ? MINUS : num(a), h, v)} = ${poly([a, b, c])}, so b = ${num(b)}.`),
      steps: [
        `Write the vertex form: f(x) = ${vf}.`,
        `Substitute ${point(x1, y1)}: ${num(y1)} = ${term(dx * dx, "a")} ${signed(v)}, so a = ${num(a)}.`,
        askSum
          ? "Recognize a + b + c as f(1), the value of ax² + bx + c at x = 1."
          : `Expand ${num(a)}(${lin(1, -h)})² ${signed(v)} = ${poly([a, b, c])}.`,
        askSum ? `f(1) = ${num(a)}(1 ${signed(-h)})² ${signed(v)} = ${num(f1)}.` : `Read the x-coefficient: b = ${num(b)}.`,
      ],
      principles: [
        "A parabola with vertex (h, k) is y = a(x − h)² + k.",
        "For f(x) = ax² + bx + c, the sum a + b + c equals f(1), and the vertex lies on x = −b/(2a).",
      ],
      trap:
        `The vertex form uses x ${MINUS} h: a vertex at x = ${num(h)} gives (${lin(1, -h)})², not (${lin(1, h)})². ` +
        (askSum ? "And a + b + c is f(1), not the y-intercept c." : "And the axis is −b/(2a), not −b/a."),
      hint: "Start from the form that shows the vertex. Is there a value of x that turns the asked quantity into f(x)?",
      verify: () => {
        // Solve f(h) = v, f(x1) = y1, f'(h) = 0 for (a, b, c) by Cramer's rule.
        const [A, B, C] = solve3([[h * h, h, 1], [x1 * x1, x1, 1], [2 * h, 1, 0]], [v, y1, 0]);
        const target = askSum ? A + B + C : B;
        return S.approx(target, askSum ? f1 : b) && S.approx(A, a);
      },
    };
  }

  // Two zeros and one more point; ask the extreme value.
  function zerosAndPoint(t, numeric) {
    let a;
    let r1;
    let r2;
    let x0;
    for (;;) {
      a = t.pick([1, 2, 3, -1, -2, -3]);
      r1 = t.int(-7, 5);
      r2 = r1 + 2 * t.int(1, 5);
      x0 = t.int(-6, 8);
      const hh = (r1 + r2) / 2;
      if (r1 === 0 || r2 === 0 || hh === 0 || hh === 1 || [r1, r2, hh].includes(x0)) continue;
      break;
    }
    const h = (r1 + r2) / 2;
    const half = (r2 - r1) / 2;
    const extreme = -a * half * half;
    const intercept = t.chance(0.5);
    const px = intercept ? 0 : x0;
    const py = a * (px - r1) * (px - r2);
    const word = a > 0 ? "minimum" : "maximum";
    const stem = intercept
      ? `In the xy-plane, the graph of the quadratic function f has x-intercepts at ${point(r1, 0)} and ` +
        `${point(r2, 0)} and a y-intercept at ${point(0, py)}. What is the ${word} value of f(x)?`
      : `For the quadratic function f, f(${num(r1)}) = 0, f(${num(r2)}) = 0, and f(${num(px)}) = ${num(py)}. ` +
        `What is the ${word} value of f(x)?`;
    const flipped = intercept || (px + r1) * (px + r2) === 0 ? null : py / ((px + r1) * (px + r2));
    const wrong = [
      [h, `Gives the x-coordinate of the vertex, ${num(h)}, instead of the ${word} value.`],
      [
        intercept ? py : a * (r1 + r2 - r1) * (r1 + r2 - r2),
        intercept
          ? `Takes the y-intercept as the ${word} value.`
          : `Evaluates f at ${num(r1 + r2)}, the sum of the zeros, instead of at their average.`,
      ],
    ];
    if (flipped !== null && denominatorHard(flipped) <= 2 && flipped !== a) {
      wrong.push([ratioHard(tidy(-flipped * half * half)), `Writes f(x) = a(x ${signed(r1)})(x ${signed(r2)}), flipping the signs of the zeros, and finds a from that.`]);
    }
    if (a !== 1) wrong.push([-half * half, "Assumes the leading coefficient is 1, so f(x) = (x − r)(x − s) with no factor a."]);
    wrong.push([a, "Stops after finding the leading coefficient a."]);
    const factored = `a(${lin(1, -r1)})(${lin(1, -r2)})`;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: null,
      stem,
      correct: extreme,
      wrong,
      explanation:
        `The zeros give f(x) = ${factored}. The point ${point(px, py)} gives ${num(py)} = ` +
        `a(${num(px)} ${signed(-r1)})(${num(px)} ${signed(-r2)}) = ${term((px - r1) * (px - r2), "a")}, so a = ${num(a)}. ` +
        `The vertex is halfway between the zeros, at x = ${num(h)}, so the ${word} value is ` +
        `f(${num(h)}) = ${num(a)}(${num(h - r1)})(${num(h - r2)}) = ${num(extreme)}.`,
      steps: [
        `Write f from its zeros: f(x) = ${factored}.`,
        `Use ${point(px, py)}: ${num(py)} = ${term((px - r1) * (px - r2), "a")}, so a = ${num(a)}.`,
        `The axis of symmetry is halfway between the zeros: x = (${num(r1)} + ${paren(r2)})/2 = ${num(h)}.`,
        `The ${word} value is f(${num(h)}) = ${num(a)}(${num(h - r1)})(${num(h - r2)}) = ${num(extreme)}.`,
      ],
      principles: [
        "A quadratic with zeros r and s is f(x) = a(x − r)(x − s).",
        "Its vertex lies on the vertical line halfway between the zeros, and the extreme value is f there.",
      ],
      trap: `The vertex's x-coordinate, ${num(h)}, is not the ${word} value; the question asks for the output f(${num(h)}).`,
      hint: "Build f from its zeros and pin down the one unknown constant. Where does the extreme value occur?",
      verify: () => {
        const [A, B, C] = solve3([[r1 * r1, r1, 1], [r2 * r2, r2, 1], [px * px, px, 1]], [0, 0, py]);
        const fn = (x) => A * x * x + B * x + C;
        return S.approx(A, a) && S.approx(scanExtreme(fn, h, A > 0), extreme) && S.approx(C - (B * B) / (4 * A), extreme);
      },
    };
  }

  // Two inputs with equal outputs, a known leading coefficient; ask the
  // extreme value or b. Optionally shown as a graph.
  function symmetricInputs(t, numeric, style) {
    let a;
    let h;
    let d;
    let level;
    for (;;) {
      a = t.pick([1, 2, 3, -1, -2]);
      h = t.nonzero(-4, 4);
      d = t.int(1, 5);
      level = t.int(-9, 12);
      if (h - d === 0 || h + d === 0) continue;
      if (style === "graph" && Math.abs(h) >= d) continue; // y-axis between the labelled points
      break;
    }
    const r1 = h - d;
    const r2 = h + d;
    const b = -2 * a * h;
    const c = style === "intercept" ? t.int(-9, 9) : level - a * r1 * r1 - b * r1;
    if (style !== "intercept" && Math.abs(c) > 60) return null;
    const fn = (x) => a * x * x + b * x + c;
    const extreme = c - a * h * h;
    const askB = style === "graph" || t.chance(0.4);
    const word = a > 0 ? "minimum" : "maximum";
    const def = `f(x) = ${term(a, "x²")} + bx + c`;
    let stem;
    let figure = null;
    if (style === "graph") {
      figure = parabolaFigure(fn, a, h, extreme, [[r1, level], [r2, level]],
        `Graph of a parabola in the xy-plane that opens ${a > 0 ? "upward" : "downward"} and passes through the labelled points ${point(r1, level)} and ${point(r2, level)}.`);
      if (!figure) return null;
      stem = `The graph of y = f(x) is shown, where ${def} and b and c are constants. What is the value of b?`;
    } else if (style === "values") {
      stem = `The function f is defined by ${def}, where b and c are constants. If f(${num(r1)}) = f(${num(r2)}) = ${num(level)}, ` +
        `what is ${askB ? "the value of b" : `the ${word} value of f(x)`}?`;
    } else {
      stem = `The function f is defined by ${def}, where b and c are constants. If f(${num(r1)}) = f(${num(r2)}) and ` +
        `f(0) = ${num(c)}, what is ${askB ? "the value of b" : `the ${word} value of f(x)`}?`;
    }
    const wrongB = [
      [2 * a * h, `Places the axis of symmetry at x = ${num(-h)}, flipping the sign of b.`],
      [-a * h, `Uses x = −b/a for the axis of symmetry instead of x = −b/(2a).`],
      [-4 * a * h, `Takes the axis of symmetry as x = ${num(r1 + r2)}, the sum of the two inputs, instead of their average.`],
      [h, "Gives the x-coordinate of the axis of symmetry instead of b."],
    ];
    const wrongExtreme = style === "values"
      ? [
        [h, `Gives the x-coordinate of the vertex, ${num(h)}, instead of the ${word} value.`],
        [level - a * (r1 + h) * (r1 + h), `Places the axis of symmetry at x = ${num(-h)}, flipping the sign of b.`],
        [level - a * r2 * r2, `Takes the axis of symmetry as x = ${num(r1 + r2)}, the sum of the two inputs, instead of their average.`],
        [level, `Takes the shared output ${num(level)} as the ${word} value.`],
        [c, "Gives c, the value of f(0)."],
      ]
      : [
        [h, `Gives the x-coordinate of the vertex, ${num(h)}, instead of the ${word} value.`],
        [c + a * h * h, `Adds ${term(a, "")}·${num(h)}² to c instead of subtracting it, a sign slip in c − b²/(4a).`],
        [c - 4 * a * h * h, `Takes the axis of symmetry as x = ${num(r1 + r2)}, the sum of the two inputs, instead of their average.`],
        [c, `Takes f(0) = ${num(c)} as the ${word} value.`],
      ];
    const given = style === "intercept"
      ? `f(${num(r1)}) = f(${num(r2)})`
      : `f(${num(r1)}) = f(${num(r2)}) = ${num(level)}`;
    const cStep = style === "intercept"
      ? `c = f(0) = ${num(c)}.`
      : `Use f(${num(r1)}) = ${num(level)}: ${num(a * r1 * r1)} ${signed(b * r1)} + c = ${num(level)}, so c = ${num(c)}.`;
    return {
      responseType: numeric && !figure ? "numeric" : "multiple-choice",
      stimulus: null,
      figure,
      stem,
      correct: askB ? b : extreme,
      wrong: askB ? wrongB : wrongExtreme,
      explanation:
        `Because ${given}, the inputs ${num(r1)} and ${num(r2)} are mirror images across the axis of symmetry, which is ` +
        `halfway between them: x = ${num(h)}. The axis is x = −b/(2a), so ${num(h)} = −b/(2 · ${paren(a)}) and b = ${num(b)}.` +
        (askB
          ? ""
          : ` ${cStep} The ${word} value is f(${num(h)}) = ${num(a * h * h)} ${signed(b * h)} ${signed(c)} = ${num(extreme)}.`),
      steps: [
        `Equal outputs at x = ${num(r1)} and x = ${num(r2)} put the axis of symmetry halfway between: x = ${num(h)}.`,
        `The axis is x = −b/(2a): ${num(h)} = −b/(2 · ${paren(a)}), so b = ${num(b)}.`,
        askB ? `Check: f(${num(r1)}) ${MINUS} f(${num(r2)}) = ${num(a)}(${num(r1 * r1 - r2 * r2)}) ${signed(b)}(${num(r1 - r2)}) = 0.` : cStep,
        ...(askB ? [] : [`${word[0].toUpperCase()}${word.slice(1)} value: f(${num(h)}) = ${num(extreme)}.`]),
      ],
      principles: [
        "Two inputs with the same output of a quadratic are symmetric about its axis of symmetry.",
        "The axis of symmetry of y = ax² + bx + c is x = −b/(2a), and the extreme value is f at the axis.",
      ],
      trap: askB
        ? `The axis of symmetry is the average of ${num(r1)} and ${num(r2)}, not their sum, and it equals −b/(2a), not −b/a.`
        : `The axis of symmetry is the average of ${num(r1)} and ${num(r2)}, not their sum, and x = ${num(h)} is where the ` +
          `${word} occurs, not the ${word} value itself.`,
      hint: "What do two inputs with the same output say about where the vertex is?",
      verify: () => {
        // Solve for (a, b, c) from the stated conditions by Cramer's rule, then scan for the extreme.
        const rows = style === "intercept"
          ? [[r1 * r1 - r2 * r2, r1 - r2, 0], [0, 0, 1], [1, 0, 0]]
          : [[r1 * r1, r1, 1], [r2 * r2, r2, 1], [1, 0, 0]];
        const rhs = style === "intercept" ? [0, c, a] : [level, level, a];
        const [A, B, C] = solve3(rows, rhs);
        const scanned = scanExtreme((x) => A * x * x + B * x + C, h, A > 0);
        return S.approx(B, b) && S.approx(scanned, extreme) && S.approx(C, c);
      },
    };
  }

  const places = (text) => (text.includes(".") ? text.split(".")[1].length : 0);

  const pct = (text) => `${text}%`;

  // A factor stored as integer hundredths S (1.2 -> 120), raised to the power j.
  function factorPower(hundredths, j) {
    const top = hundredths ** j;
    const bottom = 100 ** j;
    return {
      value: top / bottom,
      text: decimalTextHard(top, 2 * j),
      up: top > bottom,
      change: decimalTextHard(Math.abs(top - bottom), 2 * j - 2), // percent change
      whole: decimalTextHard(top, 2 * j - 2), // the factor written as a percent
    };
  }

  // "(1.44)^(t/2)", "(1.44)^t", "(0.64)^(−t/3)"
  function expPart(base, n, negative = false, variable = "t") {
    const sign = negative ? MINUS : "";
    if (n === 1) return `(${base})^${negative ? `(${sign}${variable})` : variable}`;
    return `(${base})^(${sign}${variable}/${n})`;
  }

  // Descending-coefficient polynomial evaluated by Horner's rule.
  const horner = (coefficients, x) => coefficients.reduce((sum, c) => sum * x + c, 0);

  /* --------------------------------------------------- exponential rewrite */

  const CONTEXTS = [
    { long: "the population of a town", short: "the population", event: "the start of 2020" },
    { long: "the value of a painting, in dollars,", short: "the value of the painting", event: "it was appraised" },
    { long: "the number of fish in a lake", short: "the number of fish", event: "a survey began" },
    { long: "the number of subscribers to a video channel", short: "the number of subscribers", event: "the channel's first anniversary" },
    { long: "the area, in acres, covered by a wetland", short: "the area of the wetland", event: "a restoration project began" },
    { long: "the number of members of a hiking club", short: "the number of members", event: "the club was founded" },
  ];

  const RATES = [105, 110, 120, 130, 140, 150, 160, 50, 60, 70, 80, 90, 95];

  // The model's exponent is t/n with t in `unit`; the question asks about P units.
  const PERIODS = [
    { unit: "years", n: 2, P: 1, label: "year" },
    { unit: "years", n: 3, P: 1, label: "year" },
    { unit: "years", n: 2, P: 3, label: "3 years" },
    { unit: "years", n: 3, P: 2, label: "2 years" },
    { unit: "years", n: 4, P: 2, label: "2 years" },
    { unit: "years", n: 1, P: 2, label: "2 years" },
    { unit: "years", n: 1, P: 3, label: "3 years" },
    { unit: "months", n: 24, P: 12, label: "year" },
    { unit: "months", n: 36, P: 12, label: "year" },
    { unit: "months", n: 6, P: 12, label: "year" },
    { unit: "months", n: 18, P: 12, label: "year" },
  ];

  function exponentialRate(t, numeric) {
    for (;;) {
      const period = t.pick(PERIODS);
      const { n, P, unit, label } = period;
      const g = S.gcd(n, P);
      const s = t.pick(RATES);
      const b = factorPower(s, n / g);
      const F = factorPower(s, P / g);
      if (places(b.text) > 4 || places(F.text) > 4 || F.change.replace(".", "").length > 5) continue;
      if (Number(b.change) > 100 || Number(F.change) > 100) continue;
      const ctx = t.pick(CONTEXTS);
      const A = t.int(4, 90) * 50;
      const word = F.up ? "increase" : "decrease";
      const words = unit === "years" && n > 1 && t.chance(0.35);
      const nUnits = n === 1 ? unit.replace(/s$/, "") : `${n} ${unit}`;
      const count = (value) => `${value} ${value === 1 ? unit.replace(/s$/, "") : unit}`;
      const linear = ratioText(Number(b.change.replace(".", "")) * P, n * 10 ** places(b.change), 2);
      const wrong = [
        [pct(b.change), words
          ? `Repeats the stated ${word} for every ${nUnits} as if it applied to every ${label}.`
          : `Gives the percent ${word} for every ${nUnits}, the model's own period, not for every ${label}.`],
        [pct(F.whole), F.up
          ? "Writes the growth factor as a percent; the factor includes the original 100%."
          : "Gives the percent of the quantity that remains, not the percent decrease."],
      ];
      if (linear) {
        wrong.splice(1, 0, [pct(linear), `Scales the ${b.change}% ${word} in proportion to time, as if the change were linear rather than compounding.`]);
      }
      if (P > 1 && n === 1) {
        const perUnit = factorPower(s, 1);
        const simple = ratioText(Number(perUnit.change.replace(".", "")) * P, 10 ** places(perUnit.change), 2);
        if (simple) wrong.push([pct(simple), `Multiplies the yearly ${perUnit.change}% by ${P}, adding the percents instead of compounding them.`]);
      }
      wrong.push([pct(F.text), `Writes the factor ${F.text} with a percent sign instead of converting it to a percent change.`]);
      if (new Set(wrong.map(([value]) => value).concat(pct(F.change))).size < 4) continue;
      if (wrong.some(([value]) => value === pct(F.change))) continue;
      // Pick three slips so the key is sometimes the extreme value.
      const asNumber = (text) => Number(text.replace("%", ""));
      const picked = spreadAround(t, Number(F.change), wrong.map(([text, why]) => [asNumber(text), why, text]), 0.6);
      if (picked.length < 3) continue;
      wrong.length = 0;
      picked.forEach(([, why, text]) => wrong.push([text, why]));
      const stimulus = words
        ? null
        : { type: "equations", content: `f(t) = ${commas(A)}${expPart(b.text, n)}` };
      const setup = words
        ? `${ctx.long[0].toUpperCase()}${ctx.long.slice(1)} ${b.up ? "increases" : "decreases"} by ${b.change}% every ${n} years.`
        : `The function f is defined by the given equation, where f(t) is ${ctx.long} t ${unit} after ${ctx.event}.`;
      const stem = numeric
        ? `${setup} ${words ? "Over" : "According to the model, over"} any ${label === "year" ? "1-year" : label.replace(" years", "-year")} period, ${ctx.short} ${word}s by p%. What is the value of p?`
        : `${setup} By what percent does ${ctx.short} ${word} every ${label}${words ? "" : ", according to the model"}?`;
      const model = (time) => A * b.value ** (time / n);
      const exponentNote = `${P}/${n}`;
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus,
        stem,
        correct: numeric ? Number(F.change) : pct(F.change),
        wrong: wrong,
        explanation:
          `A change of ${count(P)} multiplies the quantity by ${b.text}^(${exponentNote}) = ${F.text}` +
          `${n / g === 1 ? "" : `, because ${b.text} = ${factorPower(s, 1).text}^${n / g}`}. ` +
          `A factor of ${F.text} is a ${F.change}% ${word}.`,
        steps: [
          `Over ${nUnits} the quantity is multiplied by ${b.text}.`,
          `Write ${b.text} as a power of the factor for ${count(g)}: ${b.text} = ${factorPower(s, 1).text}^${n / g}.`,
          `${count(P)} ${P === 1 ? "is" : "contain"} ${P / g} such ${P / g === 1 ? "step" : "steps"}, so the factor is ${factorPower(s, 1).text}^${P / g} = ${F.text}.`,
          `Convert the factor to a percent ${word}: ${F.text} ${F.up ? `${MINUS} 1` : `is 1 ${MINUS} ${ratioText(Number(F.change.replace(".", "")), 100 * 10 ** places(F.change))}`} → ${F.change}%.`,
        ],
        principles: [
          "In A(b)^(t/n), the quantity is multiplied by b every n units of t; over k units it is multiplied by b^(k/n).",
          "Compounding percents do not add or scale in proportion: 10% twice is 21%, not 20%.",
        ],
        trap: numeric
          ? `The tempting answers are ${b.change} (the change for every ${nUnits}) and ${linear || F.whole} (${linear ? "proportional scaling" : "the factor itself as a percent"}).`
          : `The ${b.change}% ${word} belongs to every ${nUnits}, not every ${label}; percents compound rather than scale.`,
        hint: `How many times does the base ${b.text} get applied over ${count(P)}?`,
        verify: () => {
          const ratio = model(7 + P) / model(7);
          const change = (F.up ? ratio - 1 : 1 - ratio) * 100;
          return approx(change, Number(F.change), 1e-9) && (F.up ? ratio > 1 : ratio < 1);
        },
      };
    }
  }

  function exponentialEquivalent(t) {
    for (;;) {
      const ctx = t.pick(CONTEXTS);
      const A = t.int(4, 90) * 50;
      if (t.chance(0.5)) {
        // f(t) = A(b)^(t/n): only A(s)^t is equivalent.
        const n = t.pick([2, 2, 3, 4]);
        const s = t.pick(RATES);
        const b = factorPower(s, n);
        const one = factorPower(s, 1);
        if (places(b.text) > 4) continue;
        const bOverN = ratioText(Number(b.text.replace(".", "")), n * 10 ** places(b.text), 4);
        const linear = ratioText(
          Number(b.text.replace(".", "")) - 10 ** places(b.text) + n * 10 ** places(b.text),
          n * 10 ** places(b.text), 4);
        const bn = factorPower(s, n * n);
        const f = (x) => A * b.value ** (x / n);
        const form = (base, exp) => `f(t) = ${commas(A)}(${base})^${exp}`;
        const wrong = [
          [form(one.text, `(t/${n})`), `Takes the ${n === 2 ? "square" : n === 3 ? "cube" : "fourth"} root of the base but still divides t by ${n}, converting twice.`],
        ];
        if (linear) wrong.push([form(linear, "t"), `Divides the ${b.change}% change by ${n}, as if the change per year were a proportional share of the change per ${n} years.`]);
        if (bOverN) wrong.push([form(bOverN, "t"), `Divides the base by ${n} instead of taking its ${n === 2 ? "square" : n === 3 ? "cube" : "fourth"} root.`]);
        if (places(bn.text) <= 4) wrong.push([form(bn.text, "t"), `Reads t/${n} as ${n}t and raises the base to the power ${n}.`]);
        const correct = form(one.text, "t");
        const grid = t.chance(0.5);
        if (grid) {
          // A grid of two slips: keeping the original base, and reading t/n as nt.
          wrong.length = 0;
          wrong.push(
            [form(one.text, `(${n}t)`), `Rewrites the base as ${one.text} and then also reads t/${n} as ${n}t, converting twice.`],
            [form(b.text, "t"), `Drops the /${n} from the exponent but keeps the base ${b.text}, which is the factor for ${n} years, not 1.`],
            [form(b.text, `(${n}t)`), `Reads t/${n} as ${n}t and keeps the base ${b.text}.`],
          );
        }
        if (new Set(wrong.map(([v]) => v).concat(correct)).size < 4) continue;
        return {
          responseType: "multiple-choice",
          stimulus: { type: "equations", content: `f(t) = ${commas(A)}${expPart(b.text, n)}` },
          stem: `The function f is defined by the given equation, where f(t) is ${ctx.long} t years after ${ctx.event}. Which of the following is equivalent to the given equation?`,
          correct,
          wrong,
          explanation:
            `${b.text} = ${one.text}^${n}, so (${b.text})^(t/${n}) = (${one.text}^${n})^(t/${n}) = ${one.text}^t. ` +
            `The equation is f(t) = ${commas(A)}(${one.text})^t, which shows a ${one.change}% ${one.up ? "increase" : "decrease"} each year.`,
          steps: [
            `Recognize ${b.text} as a perfect ${n === 2 ? "square" : n === 3 ? "cube" : "fourth power"}: ${b.text} = ${one.text}^${n}.`,
            `Apply the power of a power: (${one.text}^${n})^(t/${n}) = ${one.text}^(${n} · t/${n}) = ${one.text}^t.`,
            `Keep the coefficient ${commas(A)} unchanged.`,
            `Check at t = ${n}: both forms give ${commas(A)} × ${b.text}.`,
          ],
          principles: ["(b^n)^(t/n) = b^t.", "An equivalent form must agree with the original for every t, not just at t = 0."],
          trap: grid
            ? `${b.text} is the factor for ${n} years. Changing the base to ${one.text} already accounts for the /${n}, so changing the exponent as well converts twice.`
            : "Dividing the base or its percent change by the period treats a compounding change as if it were linear.",
          hint: `What number, multiplied by itself ${n} times, gives ${b.text}?`,
          verify: () => [0.5, 1, 3, 7].every((x) => approx(A * one.value ** x, f(x))) &&
            !approx(A * one.value ** (1 / n), f(1)),
        };
      }
      // f(t) = A(r)^t in years; the same model in months m.
      const rate = t.pick([
        [106, 12], [112, 12], [118, 12], [124, 12], [130, 12], [136, 12], [88, 12], [94, 12], [76, 12],
        [108, 4], [112, 4], [116, 4], [120, 4], [92, 4], [84, 4],
      ]);
      const [r, per] = rate;
      const rText = decimalTextHard(r, 2);
      const monthly = ratioText(r - 100 + 100 * per, 100 * per, 4);
      const noun = per === 12 ? "months" : "quarters (3-month periods)";
      const letter = per === 12 ? "m" : "q";
      const form = (exp, base = rText) => `g(${letter}) = ${commas(A)}(${base})^${exp}`;
      const correct = form(`(${letter}/${per})`);
      const monthlyWhy = `the yearly ${decimalTextHard(Math.abs(r - 100), 0)}% divided by ${per}`;
      const gridWrong = [
        [form(`(${per}${letter})`), `Converts in the wrong direction: ${letter} ${per === 12 ? "months" : "quarters"} are ${letter}/${per} years, not ${per}${letter} years.`],
        [form(`(${letter}/${per})`, monthly), `Uses ${monthlyWhy} as the rate and also divides ${letter} by ${per}, converting twice.`],
        [form(`(${per}${letter})`, monthly), `Uses ${monthlyWhy} as the rate and multiplies ${letter} by ${per}.`],
      ];
      const useGrid = t.chance(0.6);
      return {
        responseType: "multiple-choice",
        stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${rText})^t` },
        stem:
          `The function f is defined by the given equation, where f(t) is ${ctx.long} t years after ${ctx.event}. ` +
          `The function g models the same quantity, where g(${letter}) is ${ctx.short} ${letter} ${noun} after ${ctx.event}. Which of the following defines g?`,
        correct,
        wrong: useGrid ? gridWrong : [
          [form(`(${per}${letter})`), `Converts in the wrong direction: ${letter} ${per === 12 ? "months" : "quarters"} are ${letter}/${per} years, not ${per}${letter} years.`],
          [form(letter, monthly), `Divides the yearly ${decimalTextHard(Math.abs(r - 100), 0)}% by ${per}; that ${per === 12 ? "monthly" : "quarterly"} rate compounded ${per} times is not ${decimalTextHard(Math.abs(r - 100), 0)}%.`],
          [form(letter), `Keeps the yearly factor but counts ${per === 12 ? "months" : "quarters"} as if they were years.`],
        ],
        explanation:
          `${letter} ${per === 12 ? "months" : "quarters"} is ${letter}/${per} years, so g(${letter}) = f(${letter}/${per}) = ${commas(A)}(${rText})^(${letter}/${per}). ` +
          `Compounding the ${per === 12 ? "monthly" : "quarterly"} rate ${monthly} would give ${monthly}^${per}, which is not ${rText}.`,
        steps: [
          `Express the time in years: ${letter} ${per === 12 ? "months" : "quarters"} = ${letter}/${per} years.`,
          `Substitute t = ${letter}/${per} into f.`,
          `g(${letter}) = ${commas(A)}(${rText})^(${letter}/${per}).`,
          `Check: ${letter} = ${per} should give one year of change, ${commas(A)} × ${rText}.`,
        ],
        principles: ["To change the time unit of a model, substitute the old time variable in terms of the new one.", "A yearly rate divided by 12 is not the equivalent monthly compounding rate."],
        trap: `Dividing the yearly rate by ${per} looks like a unit conversion but changes the model.`,
        hint: `After ${per} ${per === 12 ? "months" : "quarters"}, the value should have changed by exactly one year's factor.`,
        verify: () => {
          const g = (x) => A * (r / 100) ** (x / per);
          const f = (x) => A * (r / 100) ** x;
          const wrongMonthly = (x) => A * Number(monthly) ** x;
          const R = r / 100;
          const M = Number(monthly);
          // Each offered model, evaluated one year in, misses the yearly factor.
          const offeredFns = useGrid
            ? [(x) => A * R ** (per * x), (x) => A * M ** (x / per), (x) => A * M ** (per * x)]
            : [(x) => A * R ** (per * x), wrongMonthly, (x) => A * R ** x];
          return approx(g(per), f(1)) && approx(g(per * 2.5), f(2.5)) && !approx(wrongMonthly(per), f(1)) &&
            offeredFns.every((fn) => !approx(fn(per), f(1)));
        },
      };
    }
  }

  function exponentialNegative(t) {
    for (;;) {
      // Per-year factor q; the model is written with base (1/q)^n and exponent −t/n.
      const [q, inverse] = t.pick([[125, 80], [80, 125], [200, 50], [50, 200]]);
      const n = t.pick([2, 3]);
      const b = factorPower(inverse, n);
      if (places(b.text) > 4) continue;
      const ctx = t.pick(CONTEXTS);
      const A = t.int(4, 90) * 50;
      const perYear = factorPower(q, 1);
      const inv = factorPower(inverse, 1);
      const qn = factorPower(q, n);
      const say = (up, amount) => `It ${up ? "increases" : "decreases"} by ${amount}% each year.`;
      const correct = say(perYear.up, perYear.change);
      const wrong = [
        [say(inv.up, inv.change), `Ignores the negative sign in the exponent and reads the yearly factor as ${inv.text}.`],
      ];
      if (perYear.up || Number(inv.change) < 100) {
        wrong.push([say(perYear.up, inv.change), `Sees that the negative exponent reverses the direction but keeps the ${inv.change}% computed from ${inv.text}; a percent change does not reverse to the same percent.`]);
      }
      if (qn.up || Number(qn.change) < 100) {
        wrong.push([say(qn.up, qn.change), `Handles the negative sign but ignores the /${n}, giving the change over ${n} years.`]);
      }
      wrong.push([say(b.up, b.change), `Reads the base ${b.text} as the yearly factor, ignoring both the sign and the /${n}.`]);
      if (new Set(wrong.map(([v]) => v).concat(correct)).size < 4) continue;
      return {
        responseType: "multiple-choice",
        stimulus: { type: "equations", content: `f(t) = ${commas(A)}${expPart(b.text, n, true)}` },
        stem: `The function f is defined by the given equation, where f(t) is ${ctx.long} t years after ${ctx.event}. Which of the following best describes how ${ctx.short} changes according to the model?`,
        correct,
        wrong,
        explanation:
          `(${b.text})^(${MINUS}t/${n}) = [(${b.text})^(${MINUS}1/${n})]^t. Since ${b.text} = ${inv.text}^${n}, ` +
          `(${b.text})^(${MINUS}1/${n}) = 1/${inv.text} = ${perYear.text}. The yearly factor ${perYear.text} is a ${perYear.change}% ${perYear.up ? "increase" : "decrease"}.`,
        steps: [
          `Split the exponent: (${b.text})^(${MINUS}t/${n}) = [(${b.text})^(${MINUS}1/${n})]^t.`,
          `Take the root: (${b.text})^(1/${n}) = ${inv.text}.`,
          `The negative exponent takes the reciprocal: 1/${inv.text} = ${perYear.text}.`,
          `A factor of ${perYear.text} per year is a ${perYear.change}% ${perYear.up ? "increase" : "decrease"} each year.`,
        ],
        principles: ["b^(−t) = (1/b)^t, so a base below 1 with a negative exponent describes growth.", "Percent changes are not symmetric: undoing a 20% decrease takes a 25% increase."],
        trap: `A base ${b.up ? "above" : "below"} 1 suggests ${b.up ? "growth" : "decay"}, but the negative exponent reverses it.`,
        hint: "Rewrite the model so the exponent is a positive multiple of t.",
        verify: () => {
          const f = (x) => A * b.value ** (-x / n);
          const ratio = f(4) / f(3);
          return approx(Math.abs(ratio - 1) * 100, Number(perYear.change)) && (ratio > 1) === perYear.up;
        },
      };
    }
  }

  function exponentialShift(t, numeric) {
    for (;;) {
      const [P, Q] = t.pick([[3, 2], [6, 5], [5, 4], [2, 1], [1, 2], [4, 5], [3, 1]]);
      const c = t.pick([2, 3]);
      const minus = t.chance(0.5);
      const bText = ratioText(P, Q);
      const u = t.int(2, 40);
      // f(t) = A(b)^(t ∓ c) = a(b)^t with a = A·b^(∓c).
      const a = minus ? u * Q ** c : u * P ** c;
      const A = minus ? u * P ** c : u * Q ** c;
      if (A > 20000 || a > 20000 || a === A) continue;
      const swapped = ratioText(minus ? A * P ** c : A * Q ** c, minus ? Q ** c : P ** c, 2);
      // Uses b × c where b^c belongs: A ÷ (b·c) for t − c, A × (b·c) for t + c.
      const scaled = minus ? ratioText(A * Q, P * c, 2) : ratioText(A * P * c, Q, 2);
      const ctx = t.pick(CONTEXTS);
      const wrong = [[A, `Reads the coefficient ${commas(A)} as the value at t = 0, but the exponent is t ${minus ? MINUS : "+"} ${c}, not t.`]];
      if (swapped && Number(swapped) !== a) wrong.push([Number(swapped), `${minus ? "Multiplies" : "Divides"} by ${bText}^${c} instead of ${minus ? "dividing" : "multiplying"}: the sign of the shift was reversed.`]);
      if (scaled && Number(scaled) !== a) wrong.push([Number(scaled), `${minus ? "Divides" : "Multiplies"} by ${bText} × ${c} instead of ${bText}^${c}.`]);
      if (!numeric && new Set(wrong.map(([v]) => v).concat(a)).size < 4) continue;
      const exp = `(t ${minus ? MINUS : "+"} ${c})`;
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${bText})^${exp}` },
        stem:
          `The function f is defined by the given equation, where f(t) is ${ctx.long} t years after ${ctx.event}. ` +
          `The equation can be rewritten in the form f(t) = a(b)^t, where a and b are constants. What is the value of a?`,
        correct: a,
        wrong: wrong,
        explanation:
          `(${bText})^${exp} = (${bText})^t · (${bText})^${minus ? `(${MINUS}${c})` : c}. ` +
          `So a = ${commas(A)} ${minus ? "÷" : "×"} ${bText}^${c} = ${commas(A)} ${minus ? "÷" : "×"} ${ratioText(P ** c, Q ** c)} = ${commas(a)}, which is also f(0).`,
        steps: [
          `Split the exponent: (${bText})^${exp} = (${bText})^t · (${bText})^${minus ? `(${MINUS}${c})` : c}.`,
          `Compute ${bText}^${c} = ${ratioText(P ** c, Q ** c)}.`,
          `${minus ? "Divide" : "Multiply"}: a = ${commas(A)} ${minus ? "÷" : "×"} ${ratioText(P ** c, Q ** c)} = ${commas(a)}.`,
          `Check: f(0) = ${commas(A)}(${bText})^(${minus ? MINUS : ""}${c}) = ${commas(a)}.`,
        ],
        principles: ["b^(t + c) = b^t · b^c.", "In a(b)^t, a is the value at t = 0."],
        trap: numeric
          ? `The coefficient ${commas(A)} is the value at t = ${minus ? c : `${MINUS}${c}`}, not at t = 0.`
          : "The printed coefficient looks like the initial value, but the shifted exponent hides a factor.",
        hint: "What is f(0)?",
        verify: () => approx(A * (P / Q) ** (0 + (minus ? -c : c)), a) &&
          approx(A * (P / Q) ** (5 + (minus ? -c : c)), a * (P / Q) ** 5),
      };
    }
  }

  /* ---------------------------------------- transformations from a table */

  // Reads a pipe table back into rows of numbers (skipping the header), so
  // verify() works from what the student sees rather than from build's arrays.
  function readTable(content) {
    return content.split("\n").slice(1).map((line) => line.split(" | ").map((cell) => Number(cell.replace(MINUS, "-"))));
  }

  // "f(x − 2) + 3", "2f(x + 1) − 4"
  function shifted(name, h, k, scale = 1) {
    return `${scale === 1 ? "" : scale}${name}(x ${signed(h)}) ${signed(k)}`;
  }

  function distinctValues(t, count, low, high) {
    const pool = [];
    for (let v = low; v <= high; v += 1) pool.push(v);
    return t.sample(pool, count);
  }

  function transformLookup(t, numeric) {
    for (;;) {
      const x0 = t.int(-3, 1);
      const xs = [0, 1, 2, 3, 4, 5].map((i) => x0 + i);
      const fs = distinctValues(t, 6, -8, 15);
      const f = (x) => fs[x - x0];
      const h = t.pick([-2, -1, 1, 2]);
      const k = t.nonzero(-7, 7);
      const scale = t.chance(0.3) ? 2 : 1;
      const m = t.pick(xs.filter((x) => xs.includes(x + h) && xs.includes(x - h)));
      const key = scale * f(m + h) + k;
      const wrong = [
        [scale * f(m - h) + k, `Shifts the wrong way: g(${num(m)}) uses f(${num(m)} ${signed(h)}) = f(${num(m + h)}), not f(${num(m - h)}).`],
        [scale === 1 ? f(m + h) : scale * f(m + h), `Stops before ${scale === 1 ? "" : "the outside change is complete: "}${k > 0 ? "adding" : "subtracting"} ${num(Math.abs(k))}${scale === 1 ? "; f(" + num(m + h) + ") is only an intermediate value" : ""}.`],
        [scale * f(m) + k, `Ignores the ${signed(h)} inside the parentheses and evaluates f at ${num(m)}.`],
        [scale * f(m + h) - k, `Reverses the sign of the ${signed(k)} outside the function.`],
      ];
      if (scale === 2) wrong.splice(2, 0, [2 * (f(m + h) + k), `Doubles the ${signed(k)} as well, as if g(x) were 2(f(x ${signed(h)}) ${signed(k)}).`]);
      if (new Set(wrong.map(([v]) => v).concat(key)).size < 4) continue;
      const table = S.table(["x", "f(x)"], xs.map((x) => [x, f(x)]));
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "table", content: table },
        stem: `The table gives selected values of the function f. The function g is defined by g(x) = ${shifted("f", h, k, scale)}. What is the value of g(${num(m)})?`,
        correct: key,
        wrong: wrong,
        explanation:
          `g(${num(m)}) = ${scale === 1 ? "" : "2"}f(${num(m)} ${signed(h)}) ${signed(k)} = ${scale === 1 ? "" : "2"}f(${num(m + h)}) ${signed(k)}. ` +
          `The table gives f(${num(m + h)}) = ${num(f(m + h))}, so g(${num(m)}) = ${scale === 1 ? "" : `2(${num(f(m + h))}) `}${scale === 1 ? num(f(m + h)) + " " : ""}${signed(k)} = ${num(key)}.`,
        steps: [
          `Substitute x = ${num(m)} into the inside of f: ${num(m)} ${signed(h)} = ${num(m + h)}.`,
          `Read f(${num(m + h)}) = ${num(f(m + h))} from the table.`,
          `${scale === 1 ? "" : `Double it: ${num(2 * f(m + h))}. `}${k > 0 ? "Add" : "Subtract"} ${num(Math.abs(k))}: ${num(key)}.`,
        ],
        principles: [
          "To evaluate g(x) = f(x + h) + k at a number, evaluate the inside first, look up f there, then apply the outside operations.",
          "Adding inside the parentheses changes the input; adding outside changes the output.",
        ],
        trap: numeric
          ? `Looking up f(${num(m - h)}) (shifting the wrong way) gives ${num(scale * f(m - h) + k)}, and stopping at ${scale === 1 ? "" : "2"}f(${num(m + h)}) gives ${num(scale * f(m + h))}.`
          : "A shift inside the parentheses moves the graph opposite to its sign, which tempts a lookup in the wrong row.",
        hint: `Which input does f receive when x = ${num(m)}?`,
        verify: () => {
          const rows = new Map(readTable(table).map(([x, y]) => [x, y]));
          return rows.get(m + h) * scale + k === key && rows.size === 6;
        },
      };
    }
  }

  function transformReverse(t, numeric) {
    for (;;) {
      const x0 = t.int(-3, 1);
      const xs = [0, 1, 2, 3, 4, 5].map((i) => x0 + i);
      const gs = distinctValues(t, 6, -8, 15);
      const g = (x) => gs[x - x0];
      const h = t.pick([-2, -1, 1, 2]);
      const k = t.nonzero(-7, 7);
      // g(x) = f(x + h) + k, so f(n) = g(n − h) − k.
      const n = t.pick(xs.filter((x) => xs.includes(x - h) && xs.includes(x + h)));
      const key = g(n - h) - k;
      const wrong = [
        [g(n + h) - k, `Shifts the wrong way: f(${num(n)}) appears in g(x) when x ${signed(h)} = ${num(n)}, that is, x = ${num(n - h)}, not ${num(n + h)}.`],
        [g(n - h) + k, `${k > 0 ? "Adds" : "Subtracts"} ${num(Math.abs(k))} again instead of undoing it.`],
        [g(n) - k, `Ignores the shift inside f and reads g at ${num(n)}.`],
        [g(n - h), `Finds the right row, g(${num(n - h)}), but stops before undoing the ${signed(k)}.`],
      ];
      if (new Set(wrong.map(([v]) => v).concat(key)).size < 4) continue;
      const table = S.table(["x", "g(x)"], xs.map((x) => [x, g(x)]));
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "table", content: table },
        stem: `The function g is defined by g(x) = ${shifted("f", h, k)}, where f is a function. The table gives selected values of g. What is the value of f(${num(n)})?`,
        correct: key,
        wrong: wrong,
        explanation:
          `f(${num(n)}) appears in g(x) when x ${signed(h)} = ${num(n)}, so x = ${num(n - h)}. ` +
          `Then g(${num(n - h)}) = f(${num(n)}) ${signed(k)}, and f(${num(n)}) = ${num(g(n - h))} ${signed(-k)} = ${num(key)}.`,
        steps: [
          `Find the x for which the input of f is ${num(n)}: x ${signed(h)} = ${num(n)} gives x = ${num(n - h)}.`,
          `Read g(${num(n - h)}) = ${num(g(n - h))} from the table.`,
          `g(${num(n - h)}) = f(${num(n)}) ${signed(k)}, so f(${num(n)}) = ${num(g(n - h))} ${signed(-k)} = ${num(key)}.`,
        ],
        principles: ["Undo a transformation in reverse order: find the input that feeds f the value wanted, then undo the outside change."],
        trap: numeric
          ? `Reading g(${num(n + h)}) (shifting the wrong way) or g(${num(n)}) (ignoring the shift) gives ${num(g(n + h) - k)} or ${num(g(n) - k)}.`
          : "The table lists g, not f, so every value must be translated back before it answers the question.",
        hint: `For which x does f receive the input ${num(n)}?`,
        verify: () => {
          // Rebuild f from the table and substitute back into g(x) = f(x + h) + k for every row.
          const rows = readTable(table);
          const fOf = new Map(rows.map(([x, y]) => [x + h, y - k]));
          return rows.every(([x, y]) => fOf.get(x + h) + k === y) && fOf.get(n) === key;
        },
      };
    }
  }

  function transformComposition(t, numeric) {
    for (;;) {
      const x0 = t.int(-2, 1);
      const xs = [0, 1, 2, 3, 4].map((i) => x0 + i);
      const ruleG = t.chance(0.35);
      const m = t.pick(xs);
      const inner = t.pick(xs.filter((x) => x !== m));
      const fs = xs.map(() => t.int(-4, 9));
      const f = (x) => fs[x - x0];
      let g;
      let gText = null;
      if (ruleG) {
        // g(x) = ax + b with g(m) = inner.
        const a = t.pick([2, 3, -1, -2]);
        const b = inner - a * m;
        g = (x) => a * x + b;
        gText = lin(a, b);
        if (b === 0) continue;
      } else {
        const gs = xs.map(() => t.int(-4, 9));
        gs[m - x0] = inner;
        g = (x) => gs[x - x0];
        fs[m - x0] = t.pick(xs.filter((x) => x !== f(inner)));
      }
      const outerF = t.chance(0.6);
      const [outer, innerFn, outerName, innerName] = outerF ? [f, g, "f", "g"] : [g, f, "g", "f"];
      const mid = innerFn(m);
      if (!ruleG && !xs.includes(mid)) continue;
      const key = outer(mid);
      const reverse = xs.includes(outer(m)) || ruleG ? innerFn(outer(m)) : null;
      const wrong = [
        [reverse, `Composes in the wrong order: finds ${innerName}(${outerName}(${num(m)})) instead of ${outerName}(${innerName}(${num(m)})).`],
        [mid, `Stops at ${innerName}(${num(m)}) = ${num(mid)}, which is only the input to ${outerName}.`],
        [f(m) * g(m), `Multiplies f(${num(m)}) by g(${num(m)}); composition feeds one output into the other function.`],
        [outer(m), `Evaluates ${outerName} at ${num(m)} and never uses ${innerName}.`],
      ].filter(([v]) => v !== null && v !== undefined && Number.isFinite(v));
      if (new Set(wrong.map(([v]) => v).concat(key)).size < 4) continue;
      const rows = xs.map((x) => (ruleG ? [x, f(x)] : [x, f(x), g(x)]));
      const table = S.table(ruleG ? ["x", "f(x)"] : ["x", "f(x)", "g(x)"], rows);
      const lead = ruleG
        ? `The table gives selected values of the function f, and the function g is defined by g(x) = ${gText}.`
        : "The table gives selected values of the functions f and g.";
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "table", content: table },
        stem: `${lead} What is the value of ${outerName}(${innerName}(${num(m)}))?`,
        correct: key,
        wrong: wrong,
        explanation:
          `Work from the inside out: ${innerName}(${num(m)}) = ${num(mid)}, and then ${outerName}(${num(mid)}) = ${num(key)}.`,
        steps: [
          `Evaluate the inner function: ${innerName}(${num(m)}) = ${num(mid)}.`,
          `Use that output as the input of ${outerName}: ${outerName}(${num(mid)}).`,
          `${ruleG && outerName === "g" ? `Compute g(${num(mid)}) = ${gText.replace(/x/g, `(${num(mid)})`)}` : `Read ${outerName}(${num(mid)}) from the table`} = ${num(key)}.`,
        ],
        principles: ["In f(g(x)), g acts first and its output becomes the input of f."],
        trap: numeric
          ? `Stopping at ${innerName}(${num(m)}) gives ${num(mid)}${reverse === null ? "" : `, and composing in the wrong order gives ${num(reverse)}`}.`
          : "The function written first is applied last.",
        hint: `What does ${innerName} do to ${num(m)}?`,
        verify: () => {
          const parsed = readTable(table);
          const F = new Map(parsed.map((row) => [row[0], row[1]]));
          const G = ruleG ? g : (x) => new Map(parsed.map((row) => [row[0], row[2]])).get(x);
          const result = outerName === "f" ? F.get(G(m)) : G(F.get(m));
          return result === key;
        },
      };
    }
  }

  function transformQuadratic(t, numeric) {
    for (;;) {
      const a = t.pick([1, 1, 2, 3]);
      const p = t.int(-3, 4);
      const q = t.int(-9, 6);
      const f = (x) => a * (x - p) ** 2 + q;
      const hidden = t.chance(0.5);
      const xs = hidden
        ? t.pick([[-3, -1, 1, 3, 5], [-5, -3, -1, 1, 3], [-3, -1, 1, 3]]).map((d) => p + d)
        : (() => { const start = p - t.int(1, 3); return [0, 1, 2, 3, 4].map((i) => start + i); })();
      const h = t.nonzero(-4, 4);
      const k = t.nonzero(-8, 8);
      const scale = t.chance(0.25) ? 2 : 1;
      // g(x) = scale·f(x − h) + k: minimum scale·q + k at x = p + h.
      const g = (x) => scale * f(x - h) + k;
      const minValue = scale * q + k;
      const minAt = p + h;
      const least = Math.min(...xs.map(f));
      const askValue = t.chance(0.55);
      const key = askValue ? minValue : minAt;
      const wrong = askValue
        ? [
          [q, `Gives the minimum of f, not of g: ${scale === 2 ? `the doubling and the ${signed(k)} still apply` : `the ${signed(k)} outside f still applies`}.`],
          [scale * q - k, `Reverses the sign of the vertical shift ${signed(k)}.`],
          ...(hidden ? [[scale * least + k, `Uses the least value in the table, f(${num(p - 1)}) = ${num(least)}, as the minimum of f; the vertex lies between two listed values.`]] : []),
          ...(scale === 2 ? [[2 * (q + k), `Doubles the ${signed(k)} as well, as if g(x) were 2(f(x ${signed(-h)}) ${signed(k)}).`]] : []),
          [minAt, "Gives the x-coordinate where the minimum occurs, not the minimum value."],
        ]
        : [
          [p, `Gives where f reaches its minimum; the graph of g is shifted ${h > 0 ? "right" : "left"} by ${Math.abs(h)}.`],
          [p - h, `Shifts the vertex the wrong way: in f(x ${signed(-h)}), the graph moves ${h > 0 ? "right" : "left"}.`],
          [minValue, "Gives the minimum value of g, not the x-value where it occurs."],
          [q, "Gives the minimum value of f, not the x-value where g reaches its minimum."],
        ];
      if (!numeric && new Set(wrong.map(([v]) => v).concat(key)).size < 4) continue;
      const table = S.table(["x", "f(x)"], xs.map((x) => [x, f(x)]));
      const findVertex = hidden
        ? `f(${num(p - 1)}) = f(${num(p + 1)}) = ${num(f(p + 1))}, so by symmetry the vertex is at x = ${num(p)}. From f(${num(p + 1)}) = ${num(f(p + 1))} and f(${num(p + 3)}) = ${num(f(p + 3))}: the rise from 1 to 3 units away is 8 times the leading coefficient, so it is ${a}, and f(${num(p)}) = ${num(f(p + 1))} ${MINUS} ${a} = ${num(q)}.`
        : `Equal values at x = ${num(p - 1)} and x = ${num(p + 1)} place the vertex midway, at (${num(p)}, ${num(q)}).`;
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "table", content: table },
        stem:
          `The table gives selected values of the quadratic function f. The function g is defined by g(x) = ${shifted("f", -h, k, scale)}. ` +
          (askValue ? "What is the minimum value of g(x)?" : "For what value of x does g(x) reach its minimum value?"),
        correct: key,
        wrong: wrong,
        explanation:
          `${findVertex} So f has minimum ${num(q)} at x = ${num(p)}. The graph of g is the graph of f shifted ${h > 0 ? "right" : "left"} ${Math.abs(h)}` +
          `${scale === 2 ? ", stretched vertically by 2," : ""} and moved ${k > 0 ? "up" : "down"} ${Math.abs(k)}, so g has minimum ${num(minValue)} at x = ${num(minAt)}.`,
        steps: [
          `Use symmetry in the table to locate the vertex of f: x = ${num(p)}.`,
          `Find the minimum of f: f(${num(p)}) = ${num(q)}.`,
          `g(x) = ${shifted("f", -h, k, scale)} reaches its minimum when x ${signed(-h)} = ${num(p)}, so at x = ${num(minAt)}.`,
          `The minimum value is ${scale === 2 ? `2(${num(q)})` : num(q)} ${signed(k)} = ${num(minValue)}.`,
        ],
        principles: [
          "A quadratic's values are symmetric about its vertex, so equal outputs locate the axis of symmetry.",
          "f(x − h) + k moves the graph right h and up k.",
        ],
        trap: hidden && askValue
          ? "The least value in the table is not the minimum of f: the vertex falls between listed x-values."
          : askValue
            ? "The minimum of f is only an intermediate value; the vertical change outside f still applies."
            : "The sign inside f(x − h) is opposite to the direction of the shift.",
        hint: "Where is the axis of symmetry of f, and what does each part of g do to the graph?",
        verify: () => {
          // Fit a parabola through three table points, then minimize g on a fine grid.
          const pts = readTable(table).slice(0, 3);
          const fit = (x) => pts.reduce((sum, [xi, yi], i) =>
            sum + yi * pts.reduce((prod, [xj], j) => (j === i ? prod : prod * ((x - xj) / (xi - xj))), 1), 0);
          let best = { x: 0, y: Infinity };
          for (let x = -40; x <= 40; x += 0.25) {
            const y = scale * fit(x - h) + k;
            if (y < best.y) best = { x, y };
          }
          return approx(best.y, minValue, 1e-6) && approx(best.x, minAt, 1e-6) && approx(g(minAt), minValue);
        },
      };
    }
  }

  /* --------------------------------------- polynomial factor / remainder */

  // Polynomial with the constant k in place of the coefficient at kIndex:
  // polyK([2, 0, -5, -12], 2) -> "2x³ + kx − 12".
  function polyK(coefficients, kIndex) {
    const degree = coefficients.length - 1;
    const parts = [];
    coefficients.forEach((c, index) => {
      const power = degree - index;
      const tail = power === 0 ? "" : `x${power === 1 ? "" : S.sup(power)}`;
      if (index === kIndex) {
        parts.push(parts.length ? `+ k${tail}` : `k${tail}`);
        return;
      }
      if (c === 0) return;
      const magnitude = Math.abs(c);
      const body = power === 0 ? num(magnitude) : `${magnitude === 1 ? "" : num(magnitude)}${tail}`;
      parts.push(parts.length ? `${c < 0 ? MINUS : "+"} ${body}` : `${c < 0 ? MINUS : ""}${body}`);
    });
    return parts.join(" ");
  }

  const divisor = (r) => `x ${signed(-r)}`;

  // k from p(at) = target, where k multiplies x^power in the cubic `coefficients`.
  function solveK(coefficients, kIndex, at, target) {
    const power = 3 - kIndex;
    const rest = coefficients.reduce((sum, c, index) => (index === kIndex ? sum : sum + c * at ** (3 - index)), 0);
    return (target - rest) / at ** power;
  }

  function polynomialUnknown(t, numeric, remainderForm) {
    for (;;) {
      const r = t.pick([-3, -2, 2, 3]);
      const lead = t.pick([1, 1, 2, 3]);
      const kIndex = remainderForm ? 2 : t.pick([1, 2]);
      const k = t.nonzero(-12, 12);
      const other = t.int(-7, 7);
      const R = remainderForm ? r * t.nonzero(-4, 4) : 0;
      const coefficients = kIndex === 1 ? [lead, k, other, 0] : [lead, other, k, 0];
      coefficients[3] = R - horner(coefficients, r);
      const d = coefficients[3];
      if (d === 0 || Math.abs(d) > 90) continue;
      // Skip p that also has the opposite zero, where the sign slip would land on the key.
      if (horner(coefficients.map((c, index) => (index === kIndex ? k : c)), -r) === R) continue;
      const display = polyK(coefficients, kIndex);
      const power = 3 - kIndex;
      const atMinus = solveK(coefficients, kIndex, -r, R);
      const asFactor = solveK(coefficients, kIndex, r, 0);
      const flippedR = solveK(coefficients, kIndex, r, -R);
      const partial = k * r ** power;
      const wrong = remainderForm
        ? [
          [asFactor, `Sets p(${num(r)}) = 0, treating ${divisor(r)} as a factor; the remainder ${num(R)} means p(${num(r)}) = ${num(R)}.`],
          [atMinus, `Evaluates p at ${num(-r)} instead of ${num(r)}: dividing by ${divisor(r)} gives the remainder p(${num(r)}).`],
          [flippedR, `Sets p(${num(r)}) equal to ${num(-R)}, reversing the sign of the remainder.`],
          [partial, `Stops at ${num(r)}k = ${num(partial)} without dividing by ${num(r)}.`],
          [k + d / r ** power, `Leaves out the constant term ${num(d)} when substituting x = ${num(r)}.`],
        ]
        : [
          [atMinus, `Uses x = ${num(-r)} as the zero of ${divisor(r)}; the zero of ${divisor(r)} is ${num(r)}.`],
          [partial, `Stops at ${num(r ** power)}k = ${num(partial)} without dividing by ${num(r ** power)}.`],
          [k * r, `Divides by ${num(r)} instead of ${num(r ** power)} when solving for k.`],
          [k + d / r ** power, `Leaves out the constant term ${num(d)} when substituting x = ${num(r)}.`],
        ];
      const clean = wrong.filter(([v]) => Number.isInteger(v));
      if (!numeric && new Set(clean.map(([v]) => v).concat(k)).size < 4) continue;
      const presentFraction = remainderForm && t.chance(0.5);
      const stem = remainderForm
        ? presentFraction
          ? `The function p is defined by the given equation, where k is a constant. For x ≠ ${num(r)}, p(x)/(${divisor(r)}) = q(x) ${R < 0 ? MINUS : "+"} ${num(Math.abs(R))}/(${divisor(r)}), where q is a polynomial function. What is the value of k?`
          : `The function p is defined by the given equation, where k is a constant. When p(x) is divided by ${divisor(r)}, the remainder is ${num(R)}. What is the value of k?`
        : `The function p is defined by the given equation, where k is a constant. If ${divisor(r)} is a factor of p(x), what is the value of k?`;
      const target = remainderForm ? R : 0;
      const substituted = coefficients
        .map((c, index) => {
          const power = 3 - index;
          const at = power === 0 ? "" : `(${num(r)})${power === 1 ? "" : S.sup(power)}`;
          if (index === kIndex) return { sign: 1, text: `k${at}` };
          if (c === 0) return null;
          const magnitude = Math.abs(c);
          return { sign: Math.sign(c), text: power === 0 ? num(magnitude) : `${magnitude === 1 ? "" : num(magnitude)}${at}` };
        })
        .filter(Boolean)
        .map((term, index) => (index === 0 ? `${term.sign < 0 ? MINUS : ""}${term.text}` : `${term.sign < 0 ? MINUS : "+"} ${term.text}`))
        .join(" ");
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: `p(x) = ${display}` },
        stem,
        correct: k,
        wrong: clean,
        explanation:
          `${remainderForm ? `The remainder when p(x) is divided by ${divisor(r)} is p(${num(r)})` : `${divisor(r)} is a factor exactly when p(${num(r)}) = 0`}, ` +
          `so p(${num(r)}) = ${num(target)}. Substituting x = ${num(r)}, the terms without k add to ${num(target - partial)}, which leaves ` +
          `${num(r ** power)}k = ${num(partial)}, so k = ${num(k)}.`,
        steps: [
          remainderForm
            ? `The remainder on division by ${divisor(r)} equals p(${num(r)}), so p(${num(r)}) = ${num(R)}.`
            : `${divisor(r)} is a factor, so p(${num(r)}) = 0.`,
          `Substitute x = ${num(r)}: ${substituted} = ${num(target)}.`,
          `The terms without k total ${num(target - partial)}, so ${num(r ** power)}k = ${num(target)} ${MINUS} ${paren(target - partial)} = ${num(partial)}.`,
          `Divide: k = ${num(k)}.`,
        ],
        principles: [
          "Remainder theorem: the remainder when p(x) is divided by x − a is p(a).",
          "x − a is a factor of p(x) exactly when p(a) = 0.",
        ],
        trap: numeric
          ? `The zero of ${divisor(r)} is ${num(r)}, not ${num(-r)}${remainderForm ? `; and p(${num(r)}) is ${num(R)}, not 0` : ""}.`
          : `${divisor(r)} points to x = ${num(r)}; the sign in the divisor is the opposite of the sign of the zero.`,
        hint: `What number makes ${divisor(r)} equal to zero, and what does that say about p there?`,
        verify: () => {
          // Synthetic division by (x − r) with the answer substituted for k.
          const full = coefficients.map((c, index) => (index === kIndex ? k : c));
          let carry = 0;
          const rows = full.map((c) => (carry = carry * r + c));
          return rows[rows.length - 1] === target;
        },
      };
    }
  }

  function polynomialTable(t) {
    for (;;) {
      // |r| ≥ 2: the sign-change midpoint m can never be ±1 (the table always
      // lists x = 0), so a key "x ± 1" would be the only choice with its number.
      const r = t.pick([-4, -3, -2, 2, 3, 4]);
      const m = t.int(-4, 5);
      const xs = [...new Set([r, m - 1, m + 1, 0, t.int(-5, 6)])].sort((x, y) => x - y);
      if (xs.length !== 5 || xs.includes(m) || m === r || m === -r || m === 0) continue;
      const values = new Map(xs.map((x) => [x, t.nonzero(-9, 9)]));
      values.set(r, 0);
      const left = values.get(m - 1);
      if (m - 1 === r || m + 1 === r) continue;
      values.set(m + 1, -Math.sign(left) * t.int(1, 9));
      const v = values.get(0);
      if ([r, -r, m, -m, 0].includes(v)) continue;
      const correct = divisor(r);
      // Sign slips on the key and on the sign-change midpoint, so no choice
      // shares more with the others than the key does.
      const pool = {
        flip: [divisor(-r), `Uses x ${signed(r)}, whose zero is ${num(-r)}; the table shows p(${num(r)}) = 0, which gives the factor ${divisor(r)}.`],
        mid: [divisor(m), `p changes sign between x = ${num(m - 1)} and x = ${num(m + 1)}, so it has a zero there, but not necessarily at ${num(m)}: this could be a factor, but need not be.`],
        midFlip: [divisor(-m), `Takes the sign change between x = ${num(m - 1)} and x = ${num(m + 1)} as a zero at ${num(m)} and then writes the factor with the sign of the zero.`],
        intercept: [divisor(v), `Reads p(0) = ${num(v)} backwards, as if ${num(v)} were a zero of p.`],
      };
      const wrong = t.chance(0.5) ? [pool.flip, pool.mid, pool.midFlip] : [pool.mid, pool.midFlip, pool.intercept];
      const table = S.table(["x", "p(x)"], xs.map((x) => [x, values.get(x)]));
      return {
        responseType: "multiple-choice",
        stimulus: { type: "table", content: table },
        stem: "The table gives selected values of the polynomial function p. Which of the following must be a factor of p(x)?",
        correct,
        wrong,
        explanation:
          `The table shows p(${num(r)}) = 0, so by the factor theorem ${divisor(r)} must be a factor. ` +
          `The sign change between x = ${num(m - 1)} and x = ${num(m + 1)} guarantees a zero somewhere between them, but not at any particular value, so ${divisor(m)} only could be a factor.`,
        steps: [
          "Look for a row where p(x) = 0.",
          `p(${num(r)}) = 0, so ${num(r)} is a zero of p.`,
          `A zero at x = ${num(r)} means ${divisor(r)} is a factor.`,
          `Reject ${divisor(m)}: the table does not give p(${num(m)}), so nothing forces it to be 0.`,
        ],
        principles: [
          "Factor theorem: p(a) = 0 exactly when x − a is a factor of p(x).",
          "A sign change shows that a zero exists in an interval, not where it is.",
        ],
        trap: "A sign change in the table suggests a zero at the midpoint, but only a listed zero forces a factor.",
        hint: "Which input does the table show p sends to 0?",
        estimatedSeconds: 95,
        verify: () => {
          const rows = readTable(table);
          const at = new Map(rows.map(([x, y]) => [x, y]));
          // Interpolating polynomial through the table, plus multiples of the polynomial that vanishes on it:
          // every one fits the table, so a "must" factor has to vanish for all of them.
          const lagrange = (z) => rows.reduce((sum, [xi, yi], i) =>
            sum + yi * rows.reduce((prod, [xj], j) => (j === i ? prod : (prod * (z - xj)) / (xi - xj)), 1), 0);
          const vanish = (z) => rows.reduce((prod, [xj]) => prod * (z - xj), 1);
          const mustVanish = (z) => (at.has(z) ? at.get(z) === 0 : [0, 1, -1].every((c) => approx(lagrange(z) + c * vanish(z), 0)));
          return at.get(r) === 0 && [-r, m, -m, v].every((z) => !mustVanish(z)) && Math.sign(at.get(m - 1)) === -Math.sign(at.get(m + 1));
        },
      };
    }
  }

  function polynomialStatement(t) {
    for (;;) {
      const r = t.nonzero(-6, 6);
      const R = t.nonzero(-9, 9);
      if (Math.abs(R) === Math.abs(r)) continue;
      const fractionForm = t.chance(0.55);
      const lead = fractionForm
        ? `For a polynomial function p and x ≠ ${num(r)}, p(x)/(${divisor(r)}) = q(x) ${R < 0 ? MINUS : "+"} ${num(Math.abs(R))}/(${divisor(r)}), where q is a polynomial function.`
        : `When the polynomial p(x) is divided by ${divisor(r)}, the quotient is q(x) and the remainder is ${num(R)}.`;
      const say = (name, at, value) => `${name}(${num(at)}) = ${num(value)}`;
      const correct = say("p", r, R);
      const pool = {
        minus: [say("p", -r, R), `Takes the zero of ${divisor(r)} to be ${num(-r)}, copying the sign in the divisor.`],
        quotient: [say("q", r, R), "Attaches the remainder to the quotient q instead of to p."],
        both: [say("q", -r, R), `Attaches the remainder to q and takes the zero of ${divisor(r)} to be ${num(-r)}.`],
        factor: [say("p", r, 0), `Treats ${divisor(r)} as a factor; a nonzero remainder means it is not one.`],
        swap: [say("p", R, r), "Swaps the input and the output of p."],
      };
      // Two sets of slips; in each, no choice shares more symbols with the
      // others than the key does.
      const wrong = t.chance(0.5) ? [pool.minus, pool.quotient, pool.both] : [pool.minus, pool.swap, pool.factor];
      return {
        responseType: "multiple-choice",
        stimulus: null,
        stem: `${lead} Which of the following must be true?`,
        correct,
        wrong,
        explanation:
          `Multiplying out gives p(x) = (${divisor(r)})q(x) ${signed(R)}. At x = ${num(r)} the first term is 0 whatever q is, so p(${num(r)}) = ${num(R)}. ` +
          `Nothing fixes q(${num(r)}), and p(${num(-r)}) depends on q.`,
        steps: [
          `Write the division as p(x) = (${divisor(r)})q(x) ${signed(R)}.`,
          `Substitute x = ${num(r)}, the zero of ${divisor(r)}.`,
          `(${num(r)} ${signed(-r)})q(${num(r)}) = 0, so p(${num(r)}) = ${num(R)}.`,
        ],
        principles: ["p(x) = (x − a)q(x) + R implies p(a) = R, the remainder theorem."],
        trap: "The remainder belongs to p evaluated at the zero of the divisor, not to the quotient and not at the opposite number.",
        hint: "Rewrite the division as a product plus a remainder, then choose an x that removes the product.",
        estimatedSeconds: 90,
        verify: () => {
          // Build two concrete polynomials with this quotient-remainder structure; the key holds for both,
          // and each distractor fails for at least one.
          const qs = [[1, 0, 1], [2, -3, 5]];
          const ps = qs.map((q) => {
            const product = [q[0], q[1] - r * q[0], q[2] - r * q[1], -r * q[2]];
            product[3] += R;
            return product;
          });
          const holds = (fn) => ps.every((p, i) => fn(p, qs[i]));
          return holds((p) => horner(p, r) === R) &&
            !holds((p) => horner(p, -r) === R) &&
            !holds((p, q) => horner(q, r) === R) &&
            !holds((p, q) => horner(q, -r) === R) &&
            !holds((p) => horner(p, r) === 0) &&
            !holds((p) => horner(p, R) === r);
        },
      };
    }
  }

  /* ================================================== graph-which-function */

  // A candidate definition of f: its text and its own function, built from
  // its own constants, so the key's match with the drawn graph is checked by
  // evaluating, not assumed.
  const powerFactor = (r, power) => (power === 1 ? rootFactor(r) : r === 0 ? `x${sup(power)}` : `${rootFactor(r)}${sup(power)}`);

  function productCandidate(a, factors) {
    return {
      text: `f(x) = ${lead(a)}${factors.map(([r, power]) => powerFactor(r, power)).join("")}`,
      fn: (x) => factors.reduce((product, [r, power]) => product * (x - r) ** power, a),
    };
  }

  function exponentialCandidate(a, base, c) {
    const [top, bottom] = base;
    const baseText = bottom === 1 ? `${top}` : `${top}/${bottom}`;
    const power = bottom === 1 && Math.abs(a) === 1 ? `${lead(a)}${top}^x` : `${lead(a)}(${baseText})^x`;
    return {
      text: `f(x) = ${power}${c === 0 ? "" : ` ${signed(c)}`}`,
      fn: (x) => a * (top / bottom) ** x + c,
    };
  }

  function whichFunctionShape(t) {
    const kind = t.pick(["quadratic", "quadratic", "repeated", "repeated", "exponential"]);
    if (kind === "quadratic") {
      const a = t.pick([1, -1, 2, -2]);
      const r = t.int(-5, 3);
      const s = r + t.int(2, Math.abs(a) === 2 ? 4 : 6);
      if (s === 0 || r === 0 || -r === s) return null;
      const key = productCandidate(a, [[r, 1], [s, 1]]);
      const yInt = a * r * s;
      if (Math.abs(yInt) > 9) return null;
      const other = t.pick([s + 1, s - 1, r - 1].filter((v) => v !== r && v !== s && v !== 0));
      const decoys = [
        [productCandidate(-a, [[r, 1], [s, 1]]), "Has the right x-intercepts, but its leading coefficient has the wrong sign, so its graph opens the other way."],
        [productCandidate(a, [[-r, 1], [-s, 1]]), `Opens the right way, but its zeros are ${num(-r)} and ${num(-s)}: the numbers in the factors have the signs of the zeros.`],
        [productCandidate(2 * a, [[r, 1], [s, 1]]), `Has the right x-intercepts and opens the right way, but its y-intercept is ${num(2 * yInt)}, not ${num(yInt)}.`],
        [productCandidate(a, [[r, 1], [other, 1]]), `Has an x-intercept at ${num(other)}, where the graph does not cross the x-axis.`],
      ];
      const vertex = (r + s) / 2;
      return {
        key, decoys, window: [Math.min(r, 0) - 2, Math.max(s, 0) + 2], extra: [vertex],
        describe: `a parabola that opens ${a > 0 ? "upward" : "downward"}, crosses the x-axis at (${num(r)}, 0) and (${num(s)}, 0), and crosses the y-axis at (0, ${num(yInt)})`,
        features: `The graph crosses the x-axis at x = ${num(r)} and x = ${num(s)}, opens ${a > 0 ? "upward" : "downward"}, and has y-intercept ${num(yInt)}.`,
      };
    }
    if (kind === "repeated") {
      const a = t.pick([1, -1]);
      const r = t.int(-3, 3);
      const s = r + t.pick([-4, -3, -2, 2, 3, 4]);
      if (Math.abs(s) > 5 || s === r) return null;
      const key = productCandidate(a, [[r, 2], [s, 1]]);
      const yInt = key.fn(0);
      const yIntText = Math.abs(yInt) <= 9 ? `; it crosses the y-axis at (0, ${num(yInt)})` : "";
      const decoys = [
        [productCandidate(a, [[r, 1], [s, 2]]), `Has the right zeros, but the squared factor belongs to x = ${num(r)}, where the graph touches the x-axis; this graph would touch at x = ${num(s)} instead.`],
        [productCandidate(a, [[r, 1], [s, 1]]), `Has the right zeros, but neither is repeated, so its graph would cross the x-axis at x = ${num(r)} instead of touching it.`],
        [productCandidate(-a, [[r, 2], [s, 1]]), "Has the right zeros and the repeated root, but the wrong sign, so its graph would rise and fall on the opposite sides."],
        // Skipped when s = −r: the reflected zeros would repeat another choice.
        ...(s !== -r ? [[productCandidate(a, [[-r, 2], [-s, 1]]), `Has zeros at ${num(-r)} and ${num(-s)}: the numbers in the factors have the signs of the zeros.`]] : []),
      ];
      const turn = (r + 2 * s) / 3;
      return {
        key, decoys, window: [Math.min(r, s, 0) - 2, Math.max(r, s, 0) + 2], extra: [turn],
        describe: `a curve that ${a > 0 ? "rises from the lower left" : "falls from the upper left"}, touches the x-axis at (${num(r)}, 0) without crossing it, crosses the x-axis at (${num(s)}, 0), ` +
          `and ${a > 0 ? "rises to the upper right" : "falls to the lower right"}${yIntText}`,
        features: `The graph touches the x-axis at x = ${num(r)} and crosses it at x = ${num(s)}, and it ${a > 0 ? "rises" : "falls"} to the right.`,
      };
    }
    const a = t.pick([1, 2, 3, -1, -2]);
    const base = t.pick([[2, 1], [3, 1], [1, 2]]);
    const c = t.nonzero(-4, 4);
    const key = exponentialCandidate(a, base, c);
    const inverse = [base[1], base[0]];
    const shiftUp = t.pick([1, -1]);
    const decoys = [
      [exponentialCandidate(a, inverse, c), `Has the right y-intercept and horizontal asymptote, but its base is ${inverse[1] === 1 ? inverse[0] : `${inverse[0]}/${inverse[1]}`}, so it ${(a > 0) === (inverse[0] > inverse[1]) ? "increases" : "decreases"} where the graph ${(a > 0) === (base[0] > base[1]) ? "increases" : "decreases"}.`],
      [exponentialCandidate(a + shiftUp, base, c - shiftUp), `Has the right y-intercept, but its graph levels off toward y = ${num(c - shiftUp)}, not y = ${num(c)}.`],
      [exponentialCandidate(2 * a, base, c), `Levels off toward the right line, but its y-intercept is ${num(2 * a + c)}, not ${num(a + c)}.`],
      [exponentialCandidate(-a, base, c), `Levels off toward the right line, but it is the reflection of the graph: its y-intercept is ${num(-a + c)}.`],
    ].filter(([candidate], index) => candidate.text !== key.text && !(index === 1 && a + shiftUp === 0));
    // A window of at most 12 units, so the grid stays one unit per square,
    // reaching from below the curve's level in the direction it grows.
    const heads = a > 0 ? 1 : -1;
    let yLow = Math.min(0, c, a + c) - 1;
    let yHigh = Math.max(0, c, a + c) + 1;
    if (heads > 0) yHigh = Math.min(10, yLow + 12);
    else yLow = Math.max(-10, yHigh - 12);
    return {
      key, decoys, yRange: [yLow, yHigh],
      window: [-5, 4], extra: [],
      describe: `a curve that ${(a > 0) === (base[0] > base[1]) ? "increases" : "decreases"} from left to right, levels off toward the horizontal line y = ${num(c)} on the ${base[0] > base[1] ? "left" : "right"}, ` +
        `and crosses the y-axis at (0, ${num(a + c)})`,
      features: `The graph levels off toward y = ${num(c)}, crosses the y-axis at ${num(a + c)}, and ${(a > 0) === (base[0] > base[1]) ? "increases" : "decreases"}.`,
    };
  }

  function whichFunctionItem(t) {
    const shape = whichFunctionShape(t);
    if (!shape || shape.decoys.length < 3) return null;
    const [xMin, xMax] = [Math.min(shape.window[0], -1), Math.max(shape.window[1], 1)];
    // The vertical window shows every key feature, clipped to at most ±10.
    const sampleXs = [];
    for (let x = xMin; x <= xMax; x += 0.25) sampleXs.push(x);
    const values = [...sampleXs, ...shape.extra].map(shape.key.fn);
    const yMin = shape.yRange ? shape.yRange[0] : Math.max(-10, Math.floor(Math.min(0, ...values)) - 1);
    const yMax = shape.yRange ? shape.yRange[1] : Math.min(10, Math.ceil(Math.max(0, ...values)) + 1);
    if (yMax - yMin < 4) return null;
    const unit = Math.min(28, 300 / (xMax - xMin));
    const tall = yMax - yMin > 12;
    const P = tall
      ? S.plane({ xMin, xMax, yMin, yMax, unit, yUnit: unit / 2, yStep: 2, yLabelStep: 2 })
      : S.plane({ xMin, xMax, yMin, yMax, unit });
    const gridWords = tall ? "grid lines 1 unit apart horizontally and 2 units apart vertically" : "a grid of unit squares";
    const alt = `The graph of y = f(x) in ${P.describe()}, on ${gridWords}: ${shape.describe}.`;
    const figure = { svg: P.svg([...P.grid(), ...P.axes(), P.curve(shape.key.fn)], alt), alt, notToScale: false };
    const decoys = t.sample(shape.decoys, 3);
    // Visible difference: a decoy must leave the drawn curve by at least half a
    // grid unit somewhere inside the window.
    const visibleGap = (fn) => sampleXs.some((x) => {
      const y = shape.key.fn(x);
      const z = fn(x);
      return (y >= yMin && y <= yMax) || (z >= yMin && z <= yMax) ? Math.abs(y - z) >= 0.5 : false;
    });
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure,
      stem: t.pick([
        "The graph of y = f(x) is shown. Which of the following could define f?",
        "The graph of the function f is shown in the xy-plane. Which of the following equations could define f?",
      ]),
      correct: shape.key.text,
      wrong: decoys.map(([candidate, why]) => [candidate.text, why]),
      explanation: `${shape.features} Only ${shape.key.text.replace("f(x) = ", "")} has every one of these features; each other choice misses at least one.`,
      steps: [
        "List what the graph shows: where it meets the x-axis and how (crossing or touching), its y-intercept, its end behavior, and any level it approaches.",
        shape.features,
        `Check each choice against every feature; only ${shape.key.text} passes all of them.`,
      ],
      principles: [
        "A factor (x − r) gives a zero at x = r; squared, the graph touches the x-axis there instead of crossing.",
        "In a(b)^x + c, the graph levels off toward y = c, crosses the y-axis at a + c, and grows when a > 0 and b > 1.",
      ],
      trap: "A choice can match most of the graph; one feature is enough to rule it out, so check every feature, not just the first.",
      hint: "Read two or three features off the graph, then test each choice against all of them.",
      estimatedSeconds: 110,
      verify: () => sampleXs.every((x) => approx(shape.key.fn(x), values[sampleXs.indexOf(x)], 1e-9)) &&
        decoys.every(([candidate]) => visibleGap(candidate.fn)),
    };
  }

  /* ================================================ graph-transformation */

  // f is drawn as line segments joining lattice points at x = −4, −2, 0, 2, 4.
  function segmentFunction(xs, ys) {
    return (x) => {
      if (x < xs[0] - 1e-9 || x > xs[xs.length - 1] + 1e-9) return NaN;
      for (let i = 0; i < xs.length - 1; i += 1) {
        if (x <= xs[i + 1] + 1e-9) return ys[i] + ((ys[i + 1] - ys[i]) * (x - xs[i])) / (xs[i + 1] - xs[i]);
      }
      return ys[ys.length - 1];
    };
  }

  function graphTransformItem(t, numeric) {
    const xs = [-4, -2, 0, 2, 4];
    const ys = xs.map(() => t.int(-4, 4));
    if (new Set(ys).size < 4) return null;
    const f = segmentFunction(xs, ys);
    const at = (x) => ys[xs.indexOf(x)];
    const h = t.pick([-3, -2, -1, 1, 2, 3]);
    const k = t.nonzero(-3, 3);
    const form = numeric ? "value" : t.pick(["value", "point", "point", "max"]);
    const gText = shifted("f", -h, k);
    const g = (x) => f(x - h) + k;
    let stem;
    let key;
    let wrong;
    let steps;
    let check;
    if (form === "value") {
      const u = t.pick(xs);
      const a = u + h;
      key = at(u) + k;
      const pool = [
        [xs.includes(a + h) ? at(a + h) + k : null, `Shifts the wrong way: uses f(${num(a)} ${signed(h)}) = f(${num(a + h)}) instead of f(${num(a)} ${signed(-h)}) = f(${num(u)}).`],
        [at(u) - k, `Finds f(${num(u)}) = ${num(at(u))} but ${k > 0 ? "subtracts" : "adds"} ${Math.abs(k)} instead of ${k > 0 ? "adding" : "subtracting"} it.`],
        [xs.includes(a) ? at(a) + k : null, `Ignores the shift inside f and reads f(${num(a)}).`],
        [at(u), `Finds f(${num(u)}) = ${num(at(u))} and stops before ${k > 0 ? "adding" : "subtracting"} ${Math.abs(k)}.`],
        [xs.includes(a - k) ? at(a - k) + h : null, "Swaps the two shifts, moving the input by the outside number and the output by the inside number."],
      ].filter(([value]) => value !== null && Number.isFinite(value));
      wrong = spreadAround(t, key, pool);
      stem = `The graph of y = f(x) is shown. The function g is defined by g(x) = ${gText}. What is the value of g(${num(a)})?`;
      steps = [
        `g(${num(a)}) = f(${num(a)} ${signed(-h)}) ${signed(k)} = f(${num(u)}) ${signed(k)}.`,
        `Read the graph: f(${num(u)}) = ${num(at(u))}.`,
        `g(${num(a)}) = ${num(at(u))} ${signed(k)} = ${num(key)}.`,
      ];
      check = () => approx(g(a), key) && (numeric || wrong.every(([value]) => !approx(value, key)));
    } else if (form === "point") {
      const u = t.pick(xs);
      const pt2 = (x, y) => point(x, y);
      key = pt2(u + h, at(u) + k);
      // A grid of the two sign slips: the shift of x and the shift of y.
      wrong = [
        [pt2(u - h, at(u) + k), `Moves the point ${h > 0 ? "left" : "right"} ${Math.abs(h)} instead of ${h > 0 ? "right" : "left"}: f(x ${signed(-h)}) moves the graph the opposite way from the sign inside.`],
        [pt2(u + h, at(u) - k), `Moves the point ${k > 0 ? "down" : "up"} ${Math.abs(k)} instead of ${k > 0 ? "up" : "down"}.`],
        [pt2(u - h, at(u) - k), "Reverses both shifts."],
      ];
      stem = `The graph of y = f(x) is shown. The function g is defined by g(x) = ${gText}. Which of the following points lies on the graph of y = g(x)?`;
      steps = [
        `The graph of g is the graph of f moved ${h > 0 ? "right" : "left"} ${Math.abs(h)} and ${k > 0 ? "up" : "down"} ${Math.abs(k)}.`,
        `The point (${num(u)}, ${num(at(u))}) on the graph of f moves to (${num(u + h)}, ${num(at(u) + k)}).`,
        `Check: g(${num(u + h)}) = f(${num(u)}) ${signed(k)} = ${num(at(u) + k)}.`,
      ];
      const onG = (text) => {
        const [, xs1, ys1] = text.replace(/−/g, "-").match(/^\((-?\d+), (-?\d+)\)$/);
        const x = Number(xs1);
        const y = Number(ys1);
        return Number.isFinite(g(x)) && approx(g(x), y);
      };
      check = () => onG(key) && wrong.every(([text]) => !onG(text));
    } else {
      const top = Math.max(...ys);
      if (ys.filter((y) => y === top).length !== 1) return null;
      const u = xs[ys.indexOf(top)];
      key = u + h;
      wrong = [
        [u - h, `Moves the high point ${h > 0 ? "left" : "right"} instead of ${h > 0 ? "right" : "left"}.`],
        [u, "Gives where f reaches its maximum; the graph of g is shifted."],
        [top + k, "Gives the maximum value of g, not the x-value where it occurs."],
        [u + k, "Shifts the x-coordinate by the outside number instead of the inside one."],
      ].filter(([value]) => value !== key);
      wrong = spreadAround(t, key, wrong);
      stem = `The graph of y = f(x) is shown. The function g is defined by g(x) = ${gText}. For what value of x does g(x) reach its maximum value?`;
      steps = [
        `f reaches its maximum, ${num(top)}, at x = ${num(u)}.`,
        `g(x) = ${gText} takes that value when x ${signed(-h)} = ${num(u)}, so at x = ${num(u + h)}.`,
        `The maximum of g is ${num(top + k)}, at x = ${num(key)}.`,
      ];
      check = () => {
        let best = { x: NaN, y: -Infinity };
        for (let x = -4 + h; x <= 4 + h + 1e-9; x += 0.125) if (g(x) > best.y + 1e-9) best = { x, y: g(x) };
        return approx(best.x, key) && wrong.every(([value]) => !approx(value, key));
      };
    }
    const P = S.plane({ xMin: -6, xMax: 6, yMin: -6, yMax: 6, unit: 25, xLabelStep: 2, yLabelStep: 2 });
    const parts = [...P.grid(), ...P.axes()];
    for (let i = 0; i < xs.length - 1; i += 1) parts.push(P.segment(xs[i], ys[i], xs[i + 1], ys[i + 1]));
    xs.forEach((x, i) => parts.push(P.point(x, ys[i])));
    const alt = `The graph of y = f(x) in ${P.describe()}, on a grid of unit squares: line segments joining the points ` +
      `${xs.slice(0, -1).map((x, i) => point(x, ys[i])).join(", ")}, and ${point(xs[4], ys[4])}, in that order. The graph ends at the first and last points.`;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: null,
      figure: { svg: P.svg(parts, alt), alt, notToScale: false },
      stem,
      correct: key,
      wrong: numeric ? wrong : wrong,
      explanation: steps.join(" "),
      steps,
      principles: [
        "The graph of y = f(x − h) + k is the graph of y = f(x) moved right h and up k.",
        "To evaluate f(x − h) + k at a number, find the input f receives first, read f there, then apply the outside change.",
      ],
      trap: "A shift inside the parentheses moves the graph opposite to its sign; a change outside moves it up or down by the same sign.",
      hint: "Which point of the graph of f does the input you are given send you to?",
      estimatedSeconds: 110,
      verify: check,
    };
  }

  /* ================================================ exponential-from-words */

  const GROWTH_SCENES = [
    { thing: "the number of subscribers to a newsletter", short: "the number of subscribers", start: "when the newsletter launched", unit: "year", up: true },
    { thing: "the population of a colony of birds on an island", short: "the population of the colony", start: "at the start of a study", unit: "year", up: true },
    { thing: "the number of cells in a culture", short: "the number of cells", start: "when the culture was started", unit: "hour", up: true },
    { thing: "the value, in dollars, of a collectible card", short: "the value of the card", start: "when it was bought", unit: "year", up: true },
    { thing: "the mass, in grams, of a decaying sample", short: "the mass of the sample", start: "when it was first weighed", unit: "day", up: false },
    { thing: "the value, in dollars, of a delivery van", short: "the value of the van", start: "when it was purchased", unit: "year", up: false },
    { thing: "the amount of chlorine, in grams, in a pool", short: "the amount of chlorine", start: "when the pool was treated", unit: "hour", up: false },
  ];

  // A percent of hundredths as a base: 6 up -> "1.06"; 8 down -> "0.92"; 2.5 up -> "1.025".
  const baseText = (rate, up) => {
    const thousandths = Math.round((up ? 100 + rate : 100 - rate) * 10);
    return decimalText(thousandths, 3);
  };

  function wordsModelItem(t) {
    const scene = t.pick(GROWTH_SCENES);
    const n = t.pick([2, 3, 4, 5]);
    const rate = t.pick(scene.up ? [4, 5, 6, 8, 10, 12, 15, 20] : [4, 5, 6, 8, 10, 12, 15, 20]);
    if ((rate * 10) % n !== 0) return null;
    const A = t.int(2, 90) * (t.chance(0.5) ? 100 : 50);
    const B = baseText(rate, scene.up);
    const Bsplit = baseText(rate / n, scene.up);
    const change = scene.up ? "increases" : "decreases";
    const form = (base, exponent) => `f(t) = ${commas(A)}(${base})^${exponent}`;
    const units = `${scene.unit}s`;
    const key = form(B, `(t/${n})`);
    // A 2 × 2 grid: the base (the stated rate, or that rate split across the n
    // units) and the exponent (t divided by n, or t multiplied by n).
    const wrong = [
      [form(B, `(${n}t)`), `Multiplies t by ${n}, as if the ${rate}% change happened ${n} times each ${scene.unit} instead of once every ${n} ${units}.`],
      [form(Bsplit, `(t/${n})`), `Splits the ${rate}% into ${num(rate / n)}% per ${scene.unit} and also divides t by ${n}, dividing by ${n} twice.`],
      [form(Bsplit, `(${n}t)`), `Splits the ${rate}% into ${num(rate / n)}% per ${scene.unit} and then applies it ${n} times each ${scene.unit}.`],
    ];
    const value = (text) => {
      const [, coef, base, top, times] = text.match(/^f\(t\) = ([\d,]+)\(([\d.]+)\)\^\((?:t\/(\d+)|(\d+)t)\)$/);
      return (x) => Number(coef.replace(/,/g, "")) * Number(base) ** (top ? x / Number(top) : x * Number(times));
    };
    const truth = (x) => A * (1 + ((scene.up ? 1 : -1) * rate) / 100) ** Math.floor(x / n + 1e-9);
    return {
      responseType: "multiple-choice",
      stimulus: null,
      stem:
        `${cap(scene.thing)} was ${commas(A)} ${scene.start}, and it ${change} by ${rate}% every ${n} ${units}. ` +
        `Which of the following functions f best models ${scene.short} t ${units} after that?`,
      correct: key,
      wrong,
      explanation:
        `Every ${n} ${units} the amount is multiplied by ${B}. After t ${units} there have been t/${n} such periods, so f(t) = ${commas(A)}(${B})^(t/${n}).`,
      steps: [
        `A ${rate}% ${scene.up ? "increase" : "decrease"} multiplies the amount by ${B}.`,
        `The change happens once every ${n} ${units}, so after t ${units} it has happened t/${n} times.`,
        `f(t) = ${commas(A)}(${B})^(t/${n}).`,
      ],
      principles: [
        "A change by a fixed percent per period multiplies by the same factor each period, which makes the model exponential.",
        "When the period is n units of t, the exponent is t/n.",
      ],
      trap: `The ${rate}% belongs to every ${n} ${units}; splitting it into ${num(rate / n)}% per ${scene.unit} treats a compounding change as proportional.`,
      hint: `How many ${n}-${scene.unit} periods fit into t ${units}?`,
      verify: () => {
        const model = value(key);
        // At whole multiples of the period the model and the stated rule agree.
        return [0, n, 2 * n, 3 * n].every((x) => approx(model(x), truth(x), 1e-9)) &&
          wrong.every(([text]) => [n, 2 * n].some((x) => !approx(value(text)(x), truth(x), 1e-6)));
      },
    };
  }

  function wordsValueItem(t, numeric) {
    const scene = t.pick(GROWTH_SCENES);
    const n = t.pick([2, 3, 4, 5]);
    const rate = t.pick(scene.up ? [10, 20, 50] : [10, 20, 50]);
    const k = t.pick([2, 3]);
    const factor = (scene.up ? 100 + rate : 100 - rate) / 100;
    const A = t.int(1, 9) * 1000;
    const value = Math.round(A * factor ** k * 1000) / 1000;
    if (!Number.isInteger(value) || value > 99999) return null;
    const units = `${scene.unit}s`;
    const pool = [
      [Math.round(A * (1 + ((scene.up ? 1 : -1) * rate * k) / 100)), `Adds ${rate}% of the starting amount ${k} times, as if the change were linear.`],
      [Math.round(A * factor), `Applies the ${rate}% change only once.`],
      [Math.round(A * factor ** (k + 1)), `Applies the change ${k + 1} times; ${k * n} ${units} contain ${k} periods of ${n} ${units}.`],
      [Math.round(A * factor ** (k * n)), `Applies the ${rate}% change every ${scene.unit} instead of every ${n} ${units}.`],
      [Math.round(A * ((scene.up ? 100 + rate / n : 100 - rate / n) / 100) ** (k * n)), `Splits the ${rate}% into ${num(rate / n)}% per ${scene.unit} and applies that every ${scene.unit}.`],
    ].filter(([v]) => v > 0 && v <= 999999 && Number.isFinite(v));
    const wrong = spreadAround(t, value, pool);
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: null,
      stem:
        `${cap(scene.thing)} was ${commas(A)} ${scene.start}, and it ${scene.up ? "increases" : "decreases"} by ${rate}% every ${n} ${units}. ` +
        `According to this description, what will ${scene.short} be ${k * n} ${units} after that?`,
      correct: numeric ? value : commas(value),
      wrong: numeric ? pool : wrong.map(([v, why]) => [commas(v), why]),
      explanation:
        `${k * n} ${units} are ${k} periods of ${n} ${units}, and each period multiplies the amount by ${num(factor)}. So the amount is ${commas(A)}(${num(factor)})${sup(k)} = ${commas(value)}.`,
      steps: [
        `Each period of ${n} ${units} multiplies the amount by ${num(factor)}.`,
        `${k * n} ${units} contain ${k * n}/${n} = ${k} periods.`,
        `${commas(A)}(${num(factor)})${sup(k)} = ${commas(value)}.`,
      ],
      principles: ["A percent change repeated each period multiplies the amount by the same factor each period; the changes compound rather than add."],
      trap: `Adding ${rate}% of the starting amount each period treats the change as linear; the percent applies to the current amount.`,
      hint: `How many times does the ${rate}% change happen in ${k * n} ${units}?`,
      verify: () => {
        let amount = A;
        for (let day = 1; day <= k * n; day += 1) if (day % n === 0) amount *= factor;
        return approx(amount, value, 1e-9) && (numeric || wrong.every(([v]) => !approx(v, amount)));
      },
    };
  }

  // "doubles every 5 years": how long until it is 8 times as large?
  function wordsMultipleItem(t, numeric) {
    const scene = t.pick(GROWTH_SCENES.filter((entry) => entry.up));
    const [F, word] = t.pick([[2, "doubles"], [3, "triples"]]);
    const n = t.pick([2, 3, 4, 5, 6, 8]);
    const k = t.pick(F === 2 ? [2, 3, 4, 5] : [2, 3]);
    const multiple = F ** k;
    const key = n * k;
    const units = `${scene.unit}s`;
    const pool = [
      [n * multiple, `Multiplies the ${n} ${units} by ${multiple}, as if the amount grew ${multiple} times in ${multiple} periods.`],
      [(n * (multiple - 1)) / (F - 1), `Assumes the same amount is added every ${n} ${units}, as in a linear model.`],
      [n * (k + 1), "Counts the starting amount as one of the periods."],
      [n * (multiple / F), `Divides the target ${multiple} by ${F} and multiplies by ${n}.`],
      [n + multiple, `Adds ${multiple} to ${n}.`],
    ].filter(([v]) => Number.isInteger(v) && v > 0);
    const wrong = spreadAround(t, key, pool);
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: null,
      stem:
        `${cap(scene.thing)} ${word} every ${n} ${units}. How many ${units} does it take for ${scene.short} to become ${multiple} times what it was at the start?`,
      correct: key,
      wrong: numeric ? pool : wrong,
      explanation: `Each ${n} ${units} multiplies the amount by ${F}. ${multiple} = ${F}${sup(k)}, so it takes ${k} periods, or ${k} × ${n} = ${key} ${units}.`,
      steps: [
        `After p periods of ${n} ${units}, the amount is ${F}^p times the start.`,
        `${F}^p = ${multiple} when p = ${k}.`,
        `${k} periods × ${n} ${units} = ${key} ${units}.`,
      ],
      principles: ["Repeated doubling or tripling multiplies; the number of periods is the exponent that produces the target multiple."],
      trap: `${multiple} times as large is ${k} ${word === "doubles" ? "doublings" : "triplings"}, not ${multiple} of them.`,
      hint: `Write ${multiple} as a power of ${F}.`,
      verify: () => {
        let amount = 1;
        let time = 0;
        while (amount < multiple) {
          time += n;
          amount *= F;
        }
        return time === key && amount === multiple && (numeric || wrong.every(([v]) => v !== key));
      },
    };
  }

  const factoredPolynomialIntercepts = {
    id: "factored-polynomial-intercepts",
    difficulty: "Easy",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "polynomial functions",
    title: "Intercepts of a factored polynomial",
    recognize: "Each factor of a factored polynomial gives one zero, the value that makes that factor 0; the y-intercept is p(0).",
    rubric: { steps: 0, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "wrong-quantity"],
    build(t) {
      const roll = t.random();
      const mode = roll < 0.65 ? "intercept" : roll < 0.83 ? "yint" : "positive";
      return { estimatedSeconds: 55, ...drawUntilDistinct(() => factoredPolynomial(t, mode)) };
    },
  };

  const exponentialModelReading = {
    id: "exponential-model-reading",
    difficulty: "Easy",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "exponential functions",
    title: "Reading an exponential model",
    recognize: "In f(t) = A(b)^t, A is the value at t = 0, b is the factor applied each period, and b − 1 is the percent change as a decimal.",
    rubric: { steps: 0, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["percent-base", "intermediate-value"],
    build(t) {
      const roll = t.random();
      let make;
      if (roll < 0.35) make = () => percentRateItem(t);
      else if (roll < 0.62) make = () => coefficientMeaningItem(t);
      else make = () => laterValueItem(t, t.chance(0.6));
      return { estimatedSeconds: 60, ...drawUntilDistinct(make) };
    },
  };

  const quadraticVertexReading = {
    id: "quadratic-vertex-reading",
    difficulty: "Easy",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "quadratic functions",
    title: "Vertex read from a quadratic's form",
    recognize: "Vertex form shows the vertex (h, k) directly; factored form puts it halfway between the zeros; a table shows it as the centre of symmetry.",
    rubric: { steps: 0, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "wrong-quantity"],
    build(t) {
      const roll = t.random();
      let make;
      if (roll < 0.3) make = () => extremeValueItem(t, t.chance(0.35));
      else if (roll < 0.55) make = () => vertexPointItem(t);
      else if (roll < 0.8) make = () => factoredVertexItem(t, t.chance(0.45));
      else make = () => tableVertexItem(t);
      return { estimatedSeconds: 55, ...drawUntilDistinct(make) };
    },
  };

  const projectileHeightModel = {
    id: "projectile-height-model",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "quadratic functions",
    title: "Projectile height model",
    recognize: "Landing is a zero of h, the peak is the vertex, and a given height is reached twice; decide which time or height the question wants before computing.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["context-constraint", "intermediate-value", "wrong-quantity"],
    build(t) {
      const ask = t.pick(["ground", "peak", "again"]);
      const numeric = t.chance(0.45);
      return { estimatedSeconds: 95, ...drawUntilDistinct(() => projectileItem(t, ask, numeric)) };
    },
  };

  const exponentialTableModel = {
    id: "exponential-table-model",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "exponential functions",
    title: "Exponential function from a table",
    recognize: "Consecutive outputs share a ratio, not a difference; the ratio is the base, and the coefficient is f(0), found by stepping back from the first row.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "intermediate-value", "wrong-quantity"],
    build(t) {
      const roll = t.random();
      const ask = roll < 0.6 ? "equation" : roll < 0.8 ? "zero" : "next";
      return { estimatedSeconds: 90, ...drawUntilDistinct(() => exponentialTableItem(t, ask)) };
    },
  };

  const vertexFromConditions = {
    id: "vertex-from-conditions",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "quadratic functions",
    title: "Quadratic pinned down by indirect conditions",
    recognize:
      "Conditions on a quadratic's graph each translate into a form: a vertex into a(x − h)² + k, zeros into " +
      "a(x − r)(x − s), equal outputs into an axis of symmetry halfway between the inputs; choose the form first.",
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["wrong-quantity", "sign-error", "neighbouring-rule"],
    build(t) {
      const variant = t.int(0, 2);
      const numeric = t.chance(0.35);
      // The presentation is fixed before any redraw, so figures keep their share.
      const style = t.pick(["values", "graph", "intercept"]);
      const make = [vertexAndPoint, zerosAndPoint, symmetricInputs][variant];
      return { estimatedSeconds: 120, ...spreadChoices(t, drawUntilDistinctHard(() => make(t, numeric, style))) };
    },
  };

  const exponentialRewrite = {
    id: "exponential-rewrite",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "exponential functions",
    title: "Exponential model rewritten for a different period",
    recognize:
      "A base applies once per period of the exponent; changing the period means raising the base to a power " +
      "(compounding), never scaling the percent, and a negative or shifted exponent changes what the base and coefficient mean.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["percent-base", "unit-mismatch", "equivalent-form", "neighbouring-rule", "sign-error"],
    build(t) {
      const roll = t.random();
      const common = { estimatedSeconds: 110 };
      if (roll < 0.25) return { ...common, ...exponentialRate(t, false) };
      if (roll < 0.43) return { ...common, ...exponentialRate(t, true) };
      if (roll < 0.66) return { ...common, ...exponentialEquivalent(t) };
      if (roll < 0.84) return { ...common, ...exponentialNegative(t) };
      return { ...common, ...exponentialShift(t, t.chance(0.4)) };
    },
  };

  // Hard: the table gives g, not f, and f must be recovered by undoing the
  // transformation; or the table hides a quadratic's vertex that the
  // transformation then moves.
  const functionTransformationTable = {
    id: "function-transformation-table",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "polynomial functions",
    title: "Transformed function recovered from a table",
    recognize:
      "The table describes one function but the question is about another built from it: find which input the " +
      "inner function actually receives (inside changes act on x, opposite to their sign), and undo or apply the " +
      "outside change last; a quadratic's vertex may lie between the listed rows.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["sign-error", "intermediate-value", "wrong-quantity", "neighbouring-rule"],
    build(t) {
      const reverse = t.chance(0.45);
      const numeric = t.chance(0.35);
      const make = reverse ? () => transformReverse(t, numeric) : () => transformQuadratic(t, numeric);
      return { estimatedSeconds: 110, ...spreadChoices(t, drawUntilDistinctHard(make)) };
    },
  };

  // Medium: evaluate a shifted or composed function from a table, working
  // from the inside out.
  const functionTableEvaluate = {
    id: "function-table-evaluate",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "polynomial functions",
    title: "Shifted or composed function evaluated from a table",
    recognize: "Evaluate the inside first: find the input the table's function receives, read its value, then apply the outside operations.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "intermediate-value", "wrong-quantity"],
    build(t) {
      const lookup = t.chance(0.5);
      const numeric = t.chance(0.35);
      const make = lookup ? () => transformLookup(t, numeric) : () => transformComposition(t, numeric);
      return { estimatedSeconds: 90, ...spreadChoices(t, drawUntilDistinctHard(make)) };
    },
  };

  const polynomialFactorRemainder = {
    id: "polynomial-factor-remainder",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "polynomial functions",
    title: "Polynomial factor and remainder conditions",
    recognize:
      "A factor or a remainder is a statement about one value of p: x − a is a factor exactly when p(a) = 0, and the " +
      "remainder on division by x − a is p(a). Only a listed zero forces a factor.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 2 },
    tricks: ["must-vs-could", "sign-error", "neighbouring-rule"],
    build(t) {
      const make = t.chance(0.5) ? () => polynomialTable(t) : () => polynomialStatement(t);
      return { estimatedSeconds: 100, ...drawUntilDistinctHard(make) };
    },
  };

  // Medium: a factor or a remainder fixes the value of p at one input, which
  // leaves one linear equation for the unknown coefficient.
  const polynomialConstantFromRemainder = {
    id: "polynomial-constant-from-remainder",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "polynomial functions",
    title: "Unknown coefficient from a factor or remainder",
    recognize: "x − a is a factor exactly when p(a) = 0, and the remainder on division by x − a is p(a); substitute a and solve for the constant.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "intermediate-value", "neighbouring-rule"],
    build(t) {
      const remainder = t.chance(0.5);
      const numeric = t.chance(0.45);
      return { estimatedSeconds: 95, ...spreadChoices(t, drawUntilDistinctHard(() => polynomialUnknown(t, numeric, remainder))) };
    },
  };

  const exponentialFromWords = {
    id: "exponential-from-words",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "exponential functions",
    title: "Exponential model built from a verbal description",
    recognize:
      "A fixed percent change (or doubling) per period multiplies by the same factor each period: the factor is the base, " +
      "and the number of periods in t units is the exponent.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["unit-mismatch", "neighbouring-rule", "percent-base"],
    build(t) {
      const roll = t.random();
      const numeric = t.chance(0.45);
      const make = roll < 0.45 ? () => wordsModelItem(t)
        : roll < 0.75 ? () => wordsValueItem(t, numeric) : () => wordsMultipleItem(t, numeric);
      return { estimatedSeconds: 95, ...drawUntilDistinct(make) };
    },
  };

  const graphWhichFunction = {
    id: "graph-which-function",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "polynomial functions",
    title: "Definition of a function matched to its graph",
    recognize:
      "Read every feature the graph shows (zeros and whether the graph crosses or touches there, the y-intercept, " +
      "end behavior, a level it approaches) and test each candidate against all of them.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["sign-error", "equivalent-form", "wrong-quantity"],
    build(t) {
      return drawUntilDistinctHard(() => whichFunctionItem(t));
    },
  };

  const graphTransformation = {
    id: "graph-transformation",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "polynomial functions",
    title: "Transformed function read from a graph",
    recognize:
      "g(x) = f(x − h) + k moves the graph of f right h and up k: find the input f receives, read f from the graph there, " +
      "and apply the outside change last.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["sign-error", "intermediate-value", "wrong-quantity"],
    build(t) {
      const numeric = t.chance(0.25);
      return drawUntilDistinctHard(() => {
        const record = graphTransformItem(t, numeric);
        return record && record.verify() ? record : null;
      });
    },
  };

  return [
    factoredPolynomialIntercepts, exponentialModelReading, quadraticVertexReading,
    projectileHeightModel, exponentialTableModel, vertexFromConditions, exponentialRewrite,
    functionTableEvaluate, polynomialConstantFromRemainder, exponentialFromWords, functionTransformationTable,
    polynomialFactorRemainder, graphWhichFunction, graphTransformation,
  ];
});
