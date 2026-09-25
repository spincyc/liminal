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
    ratioHard, drawUntilDistinctHard, term, decimalTextHard, ratioText,
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

  const commas = (value) => value.toLocaleString("en-US");

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

  function percentRateItem(t) {
    const ctx = t.pick(MODELS);
    const r = t.pick(ctx.up ? [2, 3, 4, 5, 6, 8, 12, 15, 25] : [2, 4, 5, 8, 10, 12, 15, 20, 25]);
    const hundredths = ctx.up ? 100 + r : 100 - r;
    const base = decimalText(hundredths, 2);
    const A = t.int(2, 60) * 50;
    const word = ctx.up ? "increase" : "decrease";
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${base})^t` },
      stem: `The function f models ${ctx.what} t ${ctx.unit}s after ${ctx.start}. According to the model, by what percent does ${ctx.short} ${word} each ${ctx.unit}?`,
      correct: `${r}%`,
      wrong: [
        [`${hundredths}%`, ctx.up
          ? `Writes the factor ${base} as a percent; the factor includes the original 100%.`
          : `Gives the percent of ${ctx.short} that remains each ${ctx.unit}, not the percent decrease.`],
        [`${base}%`, `Reads the base ${base} itself as a percent.`],
        [`${decimalText(r, 2)}%`, `Stops at the decimal ${decimalText(r, 2)} without converting it to a percent.`],
      ],
      explanation:
        `Each ${ctx.unit}, f is multiplied by ${base}. ${ctx.up ? `${base} = 1 + ${decimalText(r, 2)}` : `${base} = 1 ${MINUS} ${decimalText(r, 2)}`}, ` +
        `so ${ctx.short} ${word}s by ${decimalText(r, 2)}, or ${r}%, each ${ctx.unit}.`,
      steps: [
        `The base ${base} is the factor applied each ${ctx.unit}.`,
        `${ctx.up ? `${base} ${MINUS} 1` : `1 ${MINUS} ${base}`} = ${decimalText(r, 2)}.`,
        `${decimalText(r, 2)} = ${r}%, so the ${word} is ${r}% each ${ctx.unit}.`,
      ],
      principles: ["In A(b)^t, a base b = 1 + r means growth by r per period and b = 1 − r means decay by r per period."],
      trap: ctx.up
        ? `${hundredths}% is the new amount as a percent of the old one, not the increase.`
        : `${hundredths}% is what remains, not what is lost.`,
      hint: `What fraction of ${ctx.short} is ${ctx.up ? "added" : "lost"} when it is multiplied by ${base}?`,
      verify: () => {
        const f = (x) => A * (hundredths / 100) ** x;
        const change = ((f(4) - f(3)) / f(3)) * 100;
        return approx(Math.abs(change), r, 1e-9) && (change > 0) === ctx.up;
      },
    };
  }

  function coefficientMeaningItem(t) {
    const ctx = t.pick(MODELS);
    const r = t.pick(ctx.up ? [3, 5, 6, 8, 10, 20] : [4, 5, 10, 15, 20]);
    const base = decimalText(ctx.up ? 100 + r : 100 - r, 2);
    const A = t.int(4, 90) * 25;
    const word = ctx.up ? "increase" : "decrease";
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${base})^t` },
      stem: `The function f models ${ctx.what} t ${ctx.unit}s after ${ctx.start}. Which of the following is the best interpretation of ${commas(A)} in this context?`,
      correct: `${cap(ctx.short)} when ${ctx.start}`,
      wrong: [
        [`${cap(ctx.short)} 1 ${ctx.unit} after ${ctx.start}`, `Evaluates the model at t = 1; ${commas(A)} is the value at t = 0.`],
        [`The ${word} in ${ctx.short} each ${ctx.unit}`, "Treats the coefficient as a fixed change per period, as in a linear model."],
        [`The percent ${word} in ${ctx.short} each ${ctx.unit}`, `The percent ${word} comes from the base ${base}, not from the coefficient.`],
      ],
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
    const scale = tenths % 10 === 0 ? 1 : 10 ** n;
    const A = t.int(2, 40) * Math.max(scale, 10);
    if (A < 100 && scale === 1) return null;
    const base = decimalText(tenths, 1);
    const value = (A * tenths ** n) / 10 ** n;
    const one = (A * tenths) / 10;
    const times = (A * n * tenths) / 10;
    const linear = A + n * (one - A);
    if (!Number.isInteger(value) || value > 99999 || !Number.isInteger(one) || !Number.isInteger(times)) return null;
    const wrong = [
      [one, `Applies the factor ${base} only once, giving the value after 1 ${ctx.unit}.`],
      [times, `Uses ${base} × ${n} in place of (${base})${sup(n)}, multiplying instead of raising to a power.`],
    ];
    if (linear > 0 && Number.isInteger(linear)) wrong.push([linear, `Adds the first ${ctx.unit}'s change, ${num(one - A)}, ${n} times, as if the change were linear.`]);
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${base})^t` },
      stem: `The function f models ${ctx.what} t ${ctx.unit}s after ${ctx.start}. According to the model, what is ${ctx.short} ${n} ${ctx.unit}s after ${ctx.start}?`,
      correct: numeric ? value : commas(value),
      wrong: numeric ? undefined : wrong.map(([v, why]) => [commas(v), why]),
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
        return approx(amount, value);
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
      wrong: numeric ? undefined : [
        [h, `Gives the x-coordinate of the vertex, where the ${word} occurs, not the ${word} value.`],
        [-h, "Gives the x-coordinate of the vertex, with its sign reversed as well."],
        [f0, "Gives f(0), the y-intercept, instead of the value at the vertex."],
      ],
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
      wrong: numeric ? undefined : [
        [ratio(-mid), "Reads the zeros from the factors with the wrong signs, then takes their midpoint."],
        [ratio(r + s), "Adds the zeros but does not divide by 2."],
        [ratio(Math.abs(r - s) / 2), "Takes half the distance between the zeros instead of the point halfway between them."],
      ],
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
    const t2 = t.int(3, 8);
    const u = t.int(1, t2 - 2);
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
        [peakT, "Gives the time of the maximum height, halfway to the zeros' midpoint, not the landing time."],
        [t2 - u, `Gives the time the ${ctx.noun} returns to its starting height of ${h0} ${ctx.unit}, where h(t) = ${h0}, not 0.`],
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
      ];
      steps = [
        `Set h(t) = ${H}: ${poly([-g, v, h0 - H], "t")} = 0.`,
        `Divide by ${MINUS}${g} and factor: ${tau1 === 0 ? "t" : bin(1, -tau1, "t")}${bin(1, -tau2, "t")} = 0, so t = ${tau1} or t = ${tau2}.`,
        `The later time is ${tau2} seconds.`,
      ];
      trap = `Both t = ${tau1} and t = ${tau2} give a height of ${H}; the question asks for the later one.`;
    }
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: model },
      stem,
      correct: key,
      wrong: numeric ? undefined : wrong,
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

  const TABLE_BASES = [
    { text: "2", top: 2, bottom: 1 },
    { text: "3", top: 3, bottom: 1 },
    { text: "4", top: 4, bottom: 1 },
    { text: "1/2", top: 1, bottom: 2 },
    { text: "0.5", top: 1, bottom: 2 },
    { text: "1.5", top: 3, bottom: 2 },
  ];

  function exponentialTableItem(t, ask) {
    const base = t.pick(TABLE_BASES);
    const x0 = base.top === 4 ? 1 : t.pick([1, 2]);
    const last = x0 + 4;
    const a = base.bottom === 1 ? t.int(2, base.top === 4 ? 5 : 12) : base.bottom ** last * t.int(1, 4);
    const f = (x) => (a * base.top ** x) / base.bottom ** x;
    const xs = [0, 1, 2, 3].map((i) => x0 + i);
    const values = xs.map(f);
    if (values.concat([f(last), a]).some((value) => !Number.isInteger(value) || value > 99999)) return null;
    const content = S.table(["x", "f(x)"], xs.map((x) => [x, f(x)]));
    const ratioValue = base.top / base.bottom;
    const D = values[1] - values[0];
    const E = values[0] - D * x0;
    const form = (coef, baseText) => `f(x) = ${commas(coef)}(${baseText})^x`;
    const inverse = base.bottom === 1 ? `1/${base.top}` : base.top === 1 ? `${base.bottom}` : `${base.bottom}/${base.top}`;
    const intro = "The table shows values of the exponential function f for selected values of x.";
    const steps = [
      `Each value is ${ratioValue > 1 ? `${base.text} times` : `${base.text} of`} the one before: ${commas(values[1])} ÷ ${commas(values[0])} = ${base.text}.`,
      `Work back ${x0} step${x0 === 1 ? "" : "s"} to x = 0: f(0) = ${commas(values[0])} ÷ (${base.text})${sup(x0)} = ${commas(a)}.`,
    ];
    if (ask === "equation") {
      const offers = [
        [form(values[0], base.text), `Uses f(${x0}) = ${commas(values[0])} as the initial value; the table starts at x = ${x0}, not x = 0.`, (x) => values[0] * ratioValue ** x],
        [`f(x) = ${lin(D, E)}`, "Fits a line through the first two rows; the differences in the table are not constant.", (x) => D * x + E],
        [form(a, inverse), "Inverts the ratio, dividing each value by the next one instead of the previous one.", (x) => a / ratioValue ** x],
      ];
      if (base.bottom === 1 && a !== base.top) offers.push([form(base.top, String(a)), "Swaps the initial value and the base.", (x) => base.top * a ** x]);
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
        trap: `${commas(values[0])} is f(${x0}), not f(0); the coefficient is the value at x = 0.`,
        hint: "Divide consecutive outputs. What would f be one step before the first row?",
        verify: () => {
          const rows = content.split("\n").slice(1).map((line) => line.split(" | ").map((cell) => Number(cell.replace(MINUS, "-").replace(/,/g, ""))));
          const fits = (fn) => rows.every(([x, y]) => approx(fn(x), y));
          // The key is rebuilt from its displayed coefficient and base, not from a and the base object.
          const [, coef, baseShown] = keyText.match(/^f\(x\) = ([\d,]+)\(([\d./]+)\)\^x$/);
          const [top, bottom = "1"] = baseShown.split("/");
          const shown = (x) => Number(coef.replace(/,/g, "")) * (Number(top) / Number(bottom)) ** x;
          return fits(shown) && offers.every(([, , fn]) => !fits(fn));
        },
      };
    }
    if (ask === "zero") {
      return {
        responseType: "numeric",
        stimulus: { type: "table", content },
        stem: `${intro} What is the value of f(0)?`,
        correct: a,
        explanation: steps.join(" "),
        steps: [...steps, `f(0) = ${commas(a)}.`],
        principles: ["Stepping x back by 1 divides an exponential function's value by its factor."],
        trap: `The ratio ${base.text} is found on the way; subtracting the first difference instead of dividing by the ratio gives ${commas(E)}, the linear guess.`,
        hint: "What happens to f each time x decreases by 1?",
        verify: () => {
          const rows = content.split("\n").slice(1).map((line) => line.split(" | ").map((cell) => Number(cell.replace(MINUS, "-").replace(/,/g, ""))));
          const r = rows[1][1] / rows[0][1];
          return approx(rows[0][1] / r ** rows[0][0], a) && approx(rows[3][1] / rows[2][1], r);
        },
      };
    }
    const next = f(last);
    const prev = values[3];
    const linearNext = prev + (prev - values[2]);
    return {
      responseType: "numeric",
      stimulus: { type: "table", content },
      stem: `${intro} What is the value of f(${last})?`,
      correct: next,
      explanation: `Each increase of 1 in x multiplies f by ${base.text}, so f(${last}) = ${commas(prev)} × ${base.text} = ${commas(next)}.`,
      steps: [
        `Find the factor: ${commas(values[1])} ÷ ${commas(values[0])} = ${base.text}.`,
        `The next row is one more step: f(${last}) = f(${last - 1}) × ${base.text}.`,
        `f(${last}) = ${commas(prev)} × ${base.text} = ${commas(next)}.`,
      ],
      principles: ["Equal steps in x multiply an exponential function by equal factors; they do not add equal amounts."],
      trap: `Continuing the last difference, as if f were linear, gives ${commas(linearNext)}.`,
      hint: "Compare consecutive outputs by dividing, not subtracting.",
      verify: () => {
        const rows = content.split("\n").slice(1).map((line) => line.split(" | ").map((cell) => Number(cell.replace(MINUS, "-").replace(/,/g, ""))));
        const r = rows[1][1] / rows[0][1];
        return approx(rows[3][1] * r, next) && !approx(linearNext, next);
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
        `The axis of symmetry is halfway between the zeros: x = (${num(r1)} + ${num(r2)})/2 = ${num(h)}.`,
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
      if (new Set(wrong.map(([value]) => value).concat(pct(F.change))).size < 4) continue;
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
        wrong: numeric ? undefined : wrong,
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
          trap: "Dividing the base or its percent change by the period treats a compounding change as if it were linear.",
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
      return {
        responseType: "multiple-choice",
        stimulus: { type: "equations", content: `f(t) = ${commas(A)}(${rText})^t` },
        stem:
          `The function f is defined by the given equation, where f(t) is ${ctx.long} t years after ${ctx.event}. ` +
          `The function g models the same quantity, where g(${letter}) is ${ctx.short} ${letter} ${noun} after ${ctx.event}. Which of the following defines g?`,
        correct,
        wrong: [
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
          return approx(g(per), f(1)) && approx(g(per * 2.5), f(2.5)) && !approx(wrongMonthly(per), f(1));
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
          `(${b.text})^(${MINUS}t/${n}) = ((${b.text})^(${MINUS}1/${n}))^t. Since ${b.text} = ${inv.text}^${n}, ` +
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
      const scaled = ratioText(minus ? A * Q : A * P, minus ? P * c : Q * c, 2);
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
        wrong: numeric ? undefined : wrong,
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
        wrong: numeric ? undefined : wrong,
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
          ? `Looking up f(${num(m - h)}) (shifting the wrong way) gives ${num(scale * f(m - h) + k)}, and stopping at f(${num(m + h)}) gives ${num(f(m + h))}.`
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
        wrong: numeric ? undefined : wrong,
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
        wrong: numeric ? undefined : wrong,
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
        wrong: numeric ? undefined : wrong,
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
        ]
        : [
          [atMinus, `Uses x = ${num(-r)} as the zero of ${divisor(r)}; the zero of ${divisor(r)} is ${num(r)}.`],
          [-k, `Loses a sign while moving the other terms of p(${num(r)}) = 0 across the equals sign.`],
          [partial, `Stops at ${num(r ** power)}k = ${num(partial)} without dividing by ${num(r ** power)}.`],
          [k * r, `Divides by ${num(r)} instead of ${num(r ** power)} when solving for k.`],
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
        wrong: numeric ? undefined : clean,
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
      const r = t.nonzero(-4, 4);
      const m = t.int(-4, 5);
      const xs = [...new Set([r, m - 1, m + 1, 0, t.int(-5, 6)])].sort((x, y) => x - y);
      if (xs.length !== 5 || xs.includes(m) || m === r || m === -r || m === 0) continue;
      const values = new Map(xs.map((x) => [x, t.nonzero(-9, 9)]));
      values.set(r, 0);
      const left = values.get(m - 1);
      if (m - 1 === r || m + 1 === r) continue;
      values.set(m + 1, -Math.sign(left) * t.int(1, 9));
      const v = values.get(0);
      if ([r, -r, m, 0].includes(v)) continue;
      const correct = divisor(r);
      const wrong = [
        [divisor(-r), `Uses x ${signed(r)}, whose zero is ${num(-r)}; the table shows p(${num(r)}) = 0, which gives the factor ${divisor(r)}.`],
        [divisor(m), `p changes sign between x = ${num(m - 1)} and x = ${num(m + 1)}, so it has a zero there, but not necessarily at ${num(m)}: this could be a factor, but need not be.`],
        [divisor(v), `Reads p(0) = ${num(v)} backwards, as if ${num(v)} were a zero of p.`],
      ];
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
          return at.get(r) === 0 && !mustVanish(-r) && !mustVanish(m) && !mustVanish(v) && Math.sign(at.get(m - 1)) === -Math.sign(at.get(m + 1));
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
      const wrong = [
        [say("p", -r, R), `Takes the zero of ${divisor(r)} to be ${num(-r)}, copying the sign in the divisor.`],
        [say("q", r, R), "Attaches the remainder to the quotient q instead of to p."],
        [say("p", r, 0), `Treats ${divisor(r)} as a factor; a nonzero remainder means it is not one.`],
        [say("p", R, r), "Swaps the input and the output of p."],
      ];
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
            !holds((p) => horner(p, r) === 0) &&
            !holds((p) => horner(p, R) === r);
        },
      };
    }
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
      return { estimatedSeconds: 120, ...drawUntilDistinctHard(() => make(t, numeric, style)) };
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

  const functionTransformationTable = {
    id: "function-transformation-table",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    subskill: "polynomial functions",
    title: "Transformed or composed function read from a table",
    recognize:
      "The table describes f, but the question is about a new function built from it: find which input f actually " +
      "receives (inside changes act on x, opposite to their sign) and apply the outside changes last.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["sign-error", "intermediate-value", "wrong-quantity", "neighbouring-rule"],
    build(t) {
      const roll = t.random();
      const numeric = t.chance(0.35);
      const common = { estimatedSeconds: 105 };
      if (roll < 0.22) return { ...common, ...transformLookup(t, numeric) };
      if (roll < 0.4) return { ...common, ...transformReverse(t, numeric) };
      if (roll < 0.65) return { ...common, ...transformComposition(t, numeric) };
      return { ...common, ...transformQuadratic(t, numeric) };
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
    tricks: ["sign-error", "must-vs-could", "neighbouring-rule", "intermediate-value"],
    build(t) {
      const roll = t.random();
      const common = { estimatedSeconds: 100 };
      if (roll < 0.3) return { ...common, ...polynomialUnknown(t, t.chance(0.45), false) };
      if (roll < 0.58) return { ...common, ...polynomialUnknown(t, t.chance(0.45), true) };
      if (roll < 0.8) return { ...common, ...polynomialTable(t) };
      return { ...common, ...polynomialStatement(t) };
    },
  };

  return [
    factoredPolynomialIntercepts, exponentialModelReading, quadraticVertexReading,
    projectileHeightModel, exponentialTableModel, vertexFromConditions, exponentialRewrite,
    functionTransformationTable, polynomialFactorRemainder,
  ];
});
