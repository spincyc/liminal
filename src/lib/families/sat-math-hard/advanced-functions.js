(function (root, factory) {
  const shared = typeof module === "object" && module.exports
    ? require("./shared")
    : root.SAT_MATH_HARD_SHARED;
  const families = factory(shared);
  if (typeof module === "object" && module.exports) module.exports = families;
  else root.SAT_MATH_HARD_FAMILIES = (root.SAT_MATH_HARD_FAMILIES || []).concat(families);
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  const { MINUS, num, paren, poly, lin, signed, approx } = S;

  /* --------------------------------------------------------- local helpers */

  // Exact decimal text for n / 10^k (integer n), trailing zeros trimmed, ASCII minus.
  function decimalText(n, k) {
    let digits = String(Math.abs(n));
    if (k > 0) {
      digits = digits.padStart(k + 1, "0");
      digits = `${digits.slice(0, -k)}.${digits.slice(-k)}`.replace(/\.?0+$/, "");
    }
    return n < 0 && digits !== "0" ? `-${digits}` : digits;
  }

  // n / d as a terminating decimal with at most maxDp places, or null.
  function ratioText(n, d, maxDp = 4) {
    const sign = d < 0 ? -1 : 1;
    for (let k = 0, scale = 1; k <= maxDp; k += 1, scale *= 10) {
      if ((n * sign * scale) % (d * sign) === 0) return decimalText((n * sign * scale) / (d * sign), k);
    }
    return null;
  }

  const places = (text) => (text.includes(".") ? text.split(".")[1].length : 0);
  const show = (text) => String(text).replace("-", MINUS);
  const commas = (value) => value.toLocaleString("en-US");
  const pct = (text) => `${text}%`;

  // A factor stored as integer hundredths S (1.2 -> 120), raised to the power j.
  function factorPower(hundredths, j) {
    const top = hundredths ** j;
    const bottom = 100 ** j;
    return {
      value: top / bottom,
      text: decimalText(top, 2 * j),
      up: top > bottom,
      change: decimalText(Math.abs(top - bottom), 2 * j - 2), // percent change
      whole: decimalText(top, 2 * j - 2), // the factor written as a percent
    };
  }

  // "(1.44)^(t/2)", "(1.44)^t", "(0.64)^(−t/3)"
  function expPart(base, n, negative = false, variable = "t") {
    const sign = negative ? MINUS : "";
    if (n === 1) return `(${base})^${negative ? `(${sign}${variable})` : variable}`;
    return `(${base})^(${sign}${variable}/${n})`;
  }

  // "3x + 10", or "13 − 5x" when only the x-coefficient is negative.
  function linText(a, b, variable = "x") {
    if (a < 0 && b > 0) return `${num(b)} ${MINUS} ${Math.abs(a) === 1 ? "" : num(Math.abs(a))}${variable}`;
    return lin(a, b, variable);
  }

  // Descending-coefficient polynomial evaluated by Horner's rule.
  const horner = (coefficients, x) => coefficients.reduce((sum, c) => sum * x + c, 0);

  /* ------------------------------------------------ 1. exponential rewrite */

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
      const rText = decimalText(r, 2);
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
          [form(letter, monthly), `Divides the yearly ${decimalText(Math.abs(r - 100), 0)}% by ${per}; that ${per === 12 ? "monthly" : "quarterly"} rate compounded ${per} times is not ${decimalText(Math.abs(r - 100), 0)}%.`],
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

  /* ------------------------------------------------- 2. extraneous roots */

  const rootFactor = (r) => (r === 0 ? "x" : `(x ${signed(-r)})`);
  const pair = (x, y) => `${num(Math.min(x, y))} and ${num(Math.max(x, y))}`;

  // Real roots of x² + Bx + C = 0 by the quadratic formula.
  function quadraticRoots(B, C) {
    const disc = B * B - 4 * C;
    if (disc < 0) return [];
    const root = Math.sqrt(disc);
    return disc === 0 ? [-B / 2] : [(-B - root) / 2, (-B + root) / 2];
  }

  // √(ax + b) = x − c, or = c − x when flip. `mode` "one": one root extraneous; "both": both valid.
  function radicalSetup(t, mode) {
    for (;;) {
      const c = t.nonzero(-3, 6);
      const flip = mode === "one" && t.chance(0.45);
      const dir = flip ? -1 : 1;
      const u = t.int(1, 7);
      const v = t.int(1, 7);
      if (u === v) continue;
      const p = c + dir * u;
      const q = mode === "both" ? c + v : c - dir * v;
      const a = p + q - 2 * c;
      const b = c * c - p * q;
      if (a === 0 || Math.abs(b) > 60) continue;
      const radicand = linText(a, b);
      const right = flip ? (c === 0 ? `${MINUS}x` : `${num(c)} ${MINUS} x`) : lin(1, -c);
      const content = t.chance(0.4)
        ? (flip ? `√(${radicand}) + x = ${num(c)}` : `x ${MINUS} √(${radicand}) = ${num(c)}`)
        : `√(${radicand}) = ${right}`;
      const rhs = (x) => (flip ? c - x : x - c);
      // Every real solution solves the squared equation; keep the roots that satisfy the original.
      const solve = () => quadraticRoots(-(2 * c + a), c * c - b)
        .filter((x) => a * x + b >= 0 && rhs(x) >= 0 && approx(Math.sqrt(a * x + b), rhs(x)));
      return { c, flip, p, q, a, b, radicand, right, content, rhs, solve, squared: poly([1, -(2 * c + a), c * c - b]) };
    }
  }

  function radicalExplain(R, valid) {
    const check = (x) => {
      const side = R.rhs(x);
      return `x = ${num(x)}: √(${num(R.a * x + R.b)}) = ${num(Math.abs(side))}, and ${R.right} = ${num(side)}` +
        (side >= 0 ? "; it checks." : "; a square root is never negative, so it fails.");
    };
    return {
      explanation:
        `Squaring gives ${R.radicand} = (${R.right})², so ${R.squared} = 0, which factors as ${rootFactor(R.p)}${rootFactor(R.q)} = 0. ` +
        "Squaring can create roots that fail the original equation, so each root must be checked there. " +
        `${valid.length === 2 ? "Both roots check." : `Only x = ${num(valid[0])} checks.`}`,
      steps: [
        `Isolate the square root: √(${R.radicand}) = ${R.right}.`,
        `Square both sides and collect terms: ${R.squared} = 0.`,
        `Factor: ${rootFactor(R.p)}${rootFactor(R.q)} = 0, so x = ${num(R.p)} or x = ${num(R.q)}.`,
        `Check ${check(R.p)}`,
        `Check ${check(R.q)}`,
      ],
    };
  }

  function rationalSetup(t) {
    for (;;) {
      const kind = t.int(0, 2);
      const r = t.int(2, 7) * (kind === 0 ? t.sign() : 1);
      const s = t.nonzero(-9, 9);
      if (Math.abs(s) === Math.abs(r) || Math.abs(s) === 1) continue;
      if (kind === 0) {
        // x²/(x − r) = (Px + Q)/(x − r) clears to (x − r)(x − s) = 0.
        const P = r + s;
        const Q = -r * s;
        if (P === 0) continue;
        return {
          excluded: r,
          s,
          content: `x²/${rootFactor(r)} = (${linText(P, Q)})/${rootFactor(r)}`,
          cleared: `x² = ${linText(P, Q)}`,
          quadratic: [1, -P, -Q],
          lcd: rootFactor(r),
          original: (x) => (x * x) / (x - r) - (P * x + Q) / (x - r),
          undefinedAt: [r],
        };
      }
      // kind 1: x/(x − r) − (2r + s)/(x + r) = 2r²/(x² − r²), excluded r.
      // kind 2: x/(x − r) − s/(x + r) = 2rs/(x² − r²), excluded −r.
      const excluded = kind === 1 ? r : -r;
      const A = kind === 1 ? 2 * r + s : s;
      const B = kind === 1 ? 2 * r * r : 2 * r * s;
      if (A === 0) continue;
      return {
        excluded,
        s,
        content: `x/(x ${MINUS} ${r}) ${A < 0 ? "+" : MINUS} ${Math.abs(A)}/(x + ${r}) = ${num(B)}/(x² ${MINUS} ${r * r})`,
        cleared: `x(x + ${r}) ${A < 0 ? "+" : MINUS} ${Math.abs(A)}(x ${MINUS} ${r}) = ${num(B)}`,
        quadratic: [1, -(excluded + s), excluded * s],
        lcd: `(x ${MINUS} ${r})(x + ${r})`,
        original: (x) => x / (x - r) - A / (x + r) - B / (x * x - r * r),
        undefinedAt: [r, -r],
      };
    }
  }

  const extraneousRoots = {
    id: "extraneous-roots",
    domain: "Advanced Math",
    skill: "Nonlinear equations",
    subskill: "radical equations",
    title: "Radical or rational equation with an extraneous root",
    recognize:
      "Squaring both sides or multiplying by a variable denominator is not reversible: every root of the resulting " +
      "quadratic must be checked in the original equation, where a square root cannot equal a negative number and a denominator cannot be zero.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["extraneous-solution", "sign-error", "wrong-quantity", "neighbouring-rule"],
    build(t) {
      const roll = t.random();
      const common = { estimatedSeconds: 110, hint: "Solve, then put each value back into the equation exactly as it was given." };
      const sumStem = "What is the sum of all solutions to the given equation?";

      if (roll < 0.62) {
        const mode = roll < 0.08 ? "both" : "one";
        const R = radicalSetup(t, mode);
        const valid = mode === "both" ? [R.p, R.q] : [R.p];
        const numeric = mode === "one" && roll >= 0.4;
        const askSum = numeric ? t.chance(0.5) : roll >= 0.28;
        const key = valid.reduce((sum, x) => sum + x, 0);
        const base = {
          ...common,
          ...radicalExplain(R, valid),
          stimulus: { type: "equations", content: R.content },
          principles: [
            "Squaring both sides can introduce solutions that do not satisfy the original equation.",
            "A square root is never negative, so the side it equals must be nonnegative at a solution.",
          ],
          verify: () => {
            const found = R.solve();
            return found.length === valid.length && approx(found.reduce((sum, x) => sum + x, 0), key);
          },
        };
        if (numeric) {
          return {
            ...base,
            responseType: "numeric",
            stem: askSum ? sumStem : "What is the solution to the given equation?",
            correct: key,
            trap: `x = ${num(R.q)} solves the squared equation but makes ${R.right} negative` +
              `${askSum ? `; including it gives ${num(R.p + R.q)}.` : ", so it is not a solution."}`,
          };
        }
        const reversed = R.flip ? lin(1, -R.c) : `${num(R.c)} ${MINUS} x`;
        if (askSum) {
          return {
            ...base,
            responseType: "multiple-choice",
            stem: sumStem,
            correct: key,
            wrong: mode === "both"
              ? [
                [Math.max(R.p, R.q), "Assumes squaring must have produced an extraneous root and discards the smaller root without checking it."],
                [-(R.p + R.q), "Reads the sum of the roots off the squared equation's x-coefficient without changing its sign."],
                [R.p * R.q, "Gives the product of the roots instead of their sum."],
                [R.p + R.q - 2 * R.c, `Adds the values of ${R.right} at the solutions instead of the values of x.`],
              ]
              : [
                [R.p + R.q, `Adds both roots of the squared equation; x = ${num(R.q)} fails the original equation.`],
                [R.q, `Checks the roots against ${reversed}, reversing the sign of the right side, which keeps the wrong root.`],
                [-(R.p + R.q), "Reads the sum of the roots off the squared equation's x-coefficient without changing its sign, and does not check them."],
                [R.p * R.q, "Gives the product of the squared equation's roots instead of the sum of the solutions."],
                [R.rhs(R.p), `Gives the value of ${R.right}, which equals the square root, at the solution rather than x.`],
              ],
            trap: mode === "both"
              ? "Expecting an extraneous root makes it tempting to discard one, but here both roots check."
              : "The sum of the roots of the squared equation includes a root that fails the original equation.",
          };
        }
        const wrong = [];
        if (mode === "both") {
          wrong.push([num(Math.max(R.p, R.q)), "Assumes squaring must have produced an extraneous root and discards the smaller root without checking it."]);
          wrong.push([pair(-R.p, -R.q), "Reverses the signs of both roots when factoring the squared equation."]);
          if (R.c !== 0) wrong.push([pair(R.p - R.c, R.q - R.c), `Gives the values of ${R.right} at the two solutions rather than the values of x.`]);
          if (R.p !== R.c && R.q !== R.c) wrong.push(["There is no solution.", `Checks the roots against ${num(R.c)} ${MINUS} x, reversing the sign of the right side, which rejects both.`]);
        } else {
          wrong.push([pair(R.p, R.q), `Keeps both roots of the squared equation; at x = ${num(R.q)}, ${R.right} is negative.`]);
          if (R.flip && R.p < 0 && R.q > 0) {
            wrong.push([num(R.q), `Discards the negative root on the belief that x cannot be negative; the requirement is that ${R.right} is nonnegative.`]);
          } else {
            wrong.push([num(R.q), `Checks the roots against ${reversed}, reversing the sign of the right side, which keeps the wrong root.`]);
          }
          wrong.push([num(R.rhs(R.p)), `Gives the value of ${R.right}, which equals the square root, at the solution rather than the value of x.`]);
          wrong.push([num(-R.p), "Reverses the signs of the roots when factoring the squared equation."]);
        }
        return {
          ...base,
          responseType: "multiple-choice",
          stem: "What are all solutions to the given equation?",
          correct: mode === "both" ? pair(R.p, R.q) : num(R.p),
          wrong,
          trap: mode === "both"
            ? "Both roots satisfy the original equation; discarding one out of habit loses a solution."
            : `x = ${num(R.q)} satisfies the squared equation but not the original one.`,
        };
      }

      const F = rationalSetup(t);
      const numeric = roll >= 0.84;
      const askSum = numeric ? t.chance(0.5) : roll >= 0.75;
      const e = F.excluded;
      const base = {
        ...common,
        stimulus: { type: "equations", content: F.content },
        explanation:
          `Multiplying both sides by ${F.lcd} gives ${F.cleared}, which simplifies to ${poly(F.quadratic)} = 0, or ${rootFactor(e)}${rootFactor(F.s)} = 0. ` +
          `x = ${num(e)} makes a denominator in the original equation zero, so it is excluded. The only solution is x = ${num(F.s)}.`,
        steps: [
          `Multiply both sides by ${F.lcd}: ${F.cleared}.`,
          `Collect terms: ${poly(F.quadratic)} = 0.`,
          `Factor: ${rootFactor(e)}${rootFactor(F.s)} = 0, so x = ${num(e)} or x = ${num(F.s)}.`,
          `Reject x = ${num(e)}: it makes a denominator 0 in the original equation.`,
        ],
        principles: [
          "Multiplying by an expression that can be zero can introduce a root outside the domain of the original equation.",
          "A solution to a rational equation must keep every denominator nonzero.",
        ],
        verify: () => {
          const roots = quadraticRoots(F.quadratic[1], F.quadratic[2]);
          const kept = roots.filter((x) => F.undefinedAt.every((bad) => !approx(x, bad)) && Math.abs(F.original(x)) < 1e-9);
          return kept.length === 1 && approx(kept[0], F.s) && roots.some((x) => approx(x, e));
        },
      };
      if (numeric) {
        return {
          ...base,
          responseType: "numeric",
          stem: askSum ? sumStem : "What is the solution to the given equation?",
          correct: F.s,
          trap: `x = ${num(e)} solves the cleared equation but makes a denominator zero${askSum ? `; including it gives ${num(e + F.s)}` : ""}.`,
        };
      }
      if (askSum) {
        return {
          ...base,
          responseType: "multiple-choice",
          stem: sumStem,
          correct: F.s,
          wrong: [
            [e + F.s, `Adds both roots of the cleared equation; x = ${num(e)} makes a denominator zero.`],
            [-(e + F.s), "Reads the sum of the roots off the x-coefficient without changing its sign, and does not check them."],
            [e * F.s, "Gives the product of the cleared equation's roots instead of the sum of the solutions."],
            [e, "Keeps the root that makes a denominator zero and discards the valid one."],
            [-F.s, "Reverses the signs of the roots when factoring the cleared equation."],
          ],
          trap: "The sum of the roots of the cleared quadratic counts a value the original equation excludes.",
        };
      }
      return {
        ...base,
        responseType: "multiple-choice",
        stem: "What are all solutions to the given equation?",
        correct: num(F.s),
        wrong: [
          [pair(e, F.s), `Keeps both roots of the cleared equation; x = ${num(e)} makes a denominator zero.`],
          [num(e), "Sets a denominator equal to zero, which finds the value x cannot take rather than a solution."],
          [num(-F.s), "Reverses the signs of the roots when factoring the cleared equation."],
          [pair(-e, -F.s), "Reverses the signs of both roots when factoring and does not check them."],
        ],
        trap: `x = ${num(e)} is a root of the cleared quadratic but not of the original equation.`,
      };
    },
  };

  /* ------------------------------------- 3. transformations from a table */

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

  /* ------------------------------------ 4. polynomial factor / remainder */

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

  /* ------------------------------------------ 5. expression substitution */

  const power = (base, exponent) => (exponent < 0 ? `1/${base}${S.sup(-exponent)}` : `${base}${S.sup(exponent)}`);

  function substitutionPowers(t, numeric) {
    for (;;) {
      const q = t.pick([2, 2, 3]);
      const maxExp = q === 2 ? 6 : 4;
      const lambda = t.pick([2, 3, 0.5]);
      const a1 = t.int(1, maxExp);
      const a2 = t.int(1, maxExp);
      if (a1 === a2) continue;
      const m = a1 / lambda;
      const n = a2 / lambda;
      if (!Number.isInteger(m) || !Number.isInteger(n) || S.gcd(m, n) !== 1 && lambda !== 0.5) continue;
      const c = t.int(2, 12) * (lambda === 0.5 ? 2 : 1);
      const E = lambda * c;
      if (E < 2 || q ** E > 99999) continue;
      const plus = t.chance(0.4);
      const rearranged = !plus && t.chance(0.4);
      const B1 = q ** a1;
      const B2 = q ** a2;
      const target = plus ? `${B1}^x · ${B2}^y` : `${B1}^x/${B2}^y`;
      const given = plus
        ? `${lin(m, 0)} + ${n === 1 ? "" : n}y = ${c}`
        : rearranged
          ? `${lin(m, 0)} = ${n === 1 ? "" : n}y + ${c}`
          : `${lin(m, 0)} ${MINUS} ${n === 1 ? "" : n}y = ${c}`;
      const expression = `${lin(m, 0)} ${plus ? "+" : MINUS} ${n === 1 ? "" : n}y`;
      const exponentText = `${lin(a1, 0)} ${plus ? "+" : MINUS} ${a2 === 1 ? "" : a2}y`;
      const wrongExps = [
        [power(q, c), `Uses ${c} as the exponent directly; the exponent is ${exponentText}, which is ${lambda === 0.5 ? "half" : lambda === 2 ? "twice" : "three times"} ${expression}.`],
        [power(B1, E), `Finds the exponent ${E} but keeps ${B1} as the base; the exponent ${E} belongs to base ${q}.`],
        [power(B2, E), `Finds the exponent ${E} but uses ${B2} as the base; the exponent ${E} belongs to base ${q}.`],
      ];
      if (rearranged) wrongExps.splice(1, 0, [power(q, -E), `Rearranges the given equation with a sign slip, getting ${expression} = ${MINUS}${c}.`]);
      if (Number.isInteger(c / lambda) && c / lambda !== E && c / lambda !== c) {
        wrongExps.splice(1, 0, [power(q, c / lambda), `Scales ${c} the wrong way, ${lambda === 0.5 ? "doubling it instead of halving it" : "dividing instead of multiplying"}.`]);
      }
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: given },
        stem: numeric
          ? `If x and y satisfy the given equation, what is the value of ${target}?`
          : `If x and y satisfy the given equation, which of the following is equal to ${target}?`,
        correct: numeric ? q ** E : power(q, E),
        wrong: numeric ? undefined : wrongExps,
        explanation:
          `Write ${a2 === 1 ? `${B1} as a power of ${q}: ${B1} = ${q}${S.sup(a1)}` : `both bases as powers of ${q}: ${B1} = ${q}${S.sup(a1)} and ${B2} = ${q}${S.sup(a2)}`}, so ${target} = ${q}^(${exponentText}). ` +
          `${exponentText} = ${lambda === 0.5 ? "(1/2)" : lambda}(${expression}) = ${lambda === 0.5 ? "(1/2)" : lambda}(${c}) = ${E}, so the value is ${power(q, E)}${numeric ? ` = ${q ** E}` : ""}.`,
        steps: [
          `Rewrite ${a2 === 1 ? "the first base" : "each base"} as a power of ${q}: ${B1} = ${q}${S.sup(a1)}${a2 === 1 ? "" : `, ${B2} = ${q}${S.sup(a2)}`}.`,
          `${plus ? "Multiplying adds" : "Dividing subtracts"} exponents: ${target} = ${q}^(${exponentText}).`,
          `Compare with the given equation: ${exponentText} = ${lambda === 0.5 ? "(1/2)" : lambda}(${expression}) = ${E}.`,
          `So the value is ${power(q, E)}${numeric ? ` = ${q ** E}` : ""}.`,
        ],
        principles: ["(b^m)^x = b^(mx), and b^u/b^v = b^(u − v).", "When x and y cannot be found separately, look for the given combination inside the target."],
        trap: numeric
          ? `Using the given ${c} as the exponent gives ${q ** c}; the exponent is ${lambda === 0.5 ? "half" : lambda === 2 ? "twice" : "three times"} the given combination.`
          : `The exponent is a multiple of the given combination, not the combination itself.`,
        hint: `Can ${B1} and ${B2} be written with the same base?`,
        verify: () => {
          // Choose any x, solve the given equation for y, and evaluate the target numerically.
          return [0.3, 1.7, -2.4].every((x) => {
            const y = plus ? (c - m * x) / n : (m * x - c) / n;
            const value = plus ? B1 ** x * B2 ** y : B1 ** x / B2 ** y;
            return approx(value, q ** E, 1e-9);
          });
        },
      };
    }
  }

  function substitutionSymmetric(t, numeric) {
    for (;;) {
      const kind = t.int(0, 2);
      if (kind === 2) {
        // x + 1/x = k (or x − 1/x = k): x² + 1/x² = k² ∓ 2.
        const minus = t.chance(0.4);
        const k = t.int(minus ? 2 : 3, 9);
        const key = minus ? k * k + 2 : k * k - 2;
        const given = `x ${minus ? MINUS : "+"} 1/x = ${k}`;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          stimulus: { type: "equations", content: given },
          stem: "If x satisfies the given equation, what is the value of x² + 1/x²?",
          correct: key,
          wrong: [
            [k * k, `Squares each term of x ${minus ? MINUS : "+"} 1/x separately and forgets the cross term 2 · x · (1/x) = 2.`],
            [minus ? k * k - 2 : k * k + 2, `Uses the cross term with the wrong sign: (x ${minus ? MINUS : "+"} 1/x)² = x² ${minus ? MINUS : "+"} 2 + 1/x².`],
            [minus ? k * k + 1 : k * k - 1, "Uses x · (1/x) = 1 as the cross term, forgetting the factor of 2 in 2ab."],
          ],
          explanation:
            `Square the given equation: (x ${minus ? MINUS : "+"} 1/x)² = x² ${minus ? MINUS : "+"} 2 + 1/x² = ${k * k}. ` +
            `So x² + 1/x² = ${k * k} ${minus ? "+" : MINUS} 2 = ${key}.`,
          steps: [
            "Recognize x² + 1/x² inside the square of the given expression.",
            `Square both sides: x² ${minus ? MINUS : "+"} 2(x)(1/x) + 1/x² = ${k * k}.`,
            `The cross term is ${minus ? MINUS : ""}2 because x · (1/x) = 1.`,
            `x² + 1/x² = ${key}.`,
          ],
          principles: ["(a ± b)² = a² ± 2ab + b², and here ab = x · (1/x) = 1."],
          trap: `Squaring term by term drops the cross term and gives ${k * k}.`,
          hint: "What happens when both sides are squared?",
          verify: () => {
            // Solve for x numerically and evaluate the target.
            const roots = minus ? quadraticRoots(-k, -1) : quadraticRoots(-k, 1);
            return roots.length > 0 && roots.every((x) => approx(x * x + 1 / (x * x), key, 1e-9));
          },
        };
      }
      const sum = kind === 0;
      const s = t.int(3, 12);
      const p = t.nonzero(-12, 20);
      const disc = sum ? s * s - 4 * p : s * s + 4 * p;
      if (disc <= 0 || Number.isInteger(Math.sqrt(disc))) continue;
      const askSquares = t.chance(0.55);
      const given = sum ? `x + y = ${s}\nxy = ${num(p)}` : `x ${MINUS} y = ${s}\nxy = ${num(p)}`;
      const other = sum ? "(x − y)²" : "(x + y)²";
      const targetText = askSquares ? "x² + y²" : other.replace("−", MINUS);
      const key = askSquares ? (sum ? s * s - 2 * p : s * s + 2 * p) : (sum ? s * s - 4 * p : s * s + 4 * p);
      const wrong = askSquares
        ? [
          [s * s, `Treats (x ${sum ? "+" : MINUS} y)² as x² + y², dropping the ${sum ? "" : MINUS}2xy term.`],
          [sum ? s * s + 2 * p : s * s - 2 * p, "Gets the sign of the 2xy term wrong when solving for x² + y²."],
          [sum ? s * s - 4 * p : s * s + 4 * p, `Finds ${other.replace("−", MINUS)} instead of x² + y².`],
          [sum ? s * s - p : s * s + p, "Uses xy instead of 2xy."],
        ]
        : [
          [sum ? s * s - 2 * p : s * s + 2 * p, "Finds x² + y², a step on the way, and stops."],
          [s * s, `Treats ${other.replace("−", MINUS)} as equal to (x ${sum ? "+" : MINUS} y)².`],
          [sum ? s * s + 4 * p : s * s - 4 * p, "Gets the sign of the 4xy term wrong."],
          [sum ? 4 * p - s * s : -s * s - 4 * p, "Subtracts in the wrong order, reversing the sign of the result."],
        ];
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: given },
        stem: `In the given system of equations, what is the value of ${targetText}?`,
        correct: key,
        wrong,
        explanation: askSquares
          ? `(x ${sum ? "+" : MINUS} y)² = x² + y² ${sum ? "+" : MINUS} 2xy, so x² + y² = ${s}² ${sum ? MINUS : "+"} 2(${num(p)}) = ${num(key)}.`
          : `(x ${sum ? MINUS : "+"} y)² = x² + y² ${sum ? MINUS : "+"} 2xy = (x ${sum ? "+" : MINUS} y)² ${sum ? MINUS : "+"} 4xy = ${s}² ${sum ? MINUS : "+"} 4(${num(p)}) = ${num(key)}.`,
        steps: [
          `Expand the square you know: (x ${sum ? "+" : MINUS} y)² = x² + y² ${sum ? "+" : MINUS} 2xy = ${s * s}.`,
          `Substitute xy = ${num(p)}: x² + y² = ${s * s} ${sum ? MINUS : "+"} ${paren(2 * p)} = ${num(sum ? s * s - 2 * p : s * s + 2 * p)}.`,
          askSquares
            ? `So x² + y² = ${num(key)}; x and y themselves are not needed.`
            : `Then ${targetText} = x² + y² ${sum ? MINUS : "+"} 2xy = ${num(sum ? s * s - 2 * p : s * s + 2 * p)} ${sum ? MINUS : "+"} ${paren(2 * p)} = ${num(key)}.`,
        ],
        principles: ["(x + y)² = x² + 2xy + y² and (x − y)² = x² − 2xy + y².", "(x − y)² = (x + y)² − 4xy."],
        trap: askSquares
          ? `Squaring x ${sum ? "+" : MINUS} y term by term loses the 2xy term.`
          : "x² + y² is only an intermediate value on the way to the square asked for.",
        hint: "Which square contains the quantity you are asked for?",
        verify: () => {
          // Solve the system for x and y, then evaluate the target directly.
          const ys = sum ? quadraticRoots(-s, p) : quadraticRoots(s, -p); // y for x + y = s, or y(y + s) = p
          return ys.length === 2 && ys.every((y) => {
            const x = sum ? s - y : y + s;
            const value = askSquares ? x * x + y * y : sum ? (x - y) ** 2 : (x + y) ** 2;
            return approx(x * y, p, 1e-9) && approx(value, key, 1e-9);
          });
        },
      };
    }
  }

  function substitutionLinear(t, numeric) {
    for (;;) {
      const m = t.int(2, 7);
      const n = t.int(1, 7);
      if (m === n) continue;
      const c = t.nonzero(-12, 15);
      const lambda = t.pick([-4, -3, -2, 2, 3, 4]);
      const d = t.nonzero(-9, 9);
      const key = lambda * c + d;
      const show = t.int(0, 2);
      const yTerm = (coefficient) => `${coefficient === 1 ? "" : coefficient}y`;
      const given = show === 0
        ? `${m}x = ${yTerm(n)} ${signed(c)}`
        : show === 1
          ? `${yTerm(n)} = ${m}x ${signed(-c)}`
          : `${m}x ${MINUS} ${yTerm(n)} ${signed(-c)} = 0`;
      const target = lambda > 0
        ? `${lambda * m}x ${MINUS} ${lambda * n}y ${signed(d)}`
        : `${Math.abs(lambda) * n}y ${MINUS} ${Math.abs(lambda) * m}x ${signed(d)}`;
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: given },
        stem: `If x and y satisfy the given equation, what is the value of ${target}?`,
        correct: key,
        wrong: [
          [-lambda * c + d, lambda > 0
            ? `Takes ${m}x ${MINUS} ${yTerm(n)} to be ${num(-c)}, moving the constant across the equals sign without changing its sign.`
            : `Treats the target as ${-lambda}(${m}x ${MINUS} ${yTerm(n)}) ${signed(d)}; with the y-term first, the multiple is ${num(lambda)}.`],
          [c + d, `Uses the value of ${m}x ${MINUS} ${yTerm(n)} without scaling it by ${num(lambda)}.`],
          [lambda * (c + d), `Multiplies the constant ${num(d)} by ${num(lambda)} as well.`],
          [lambda * c, `Finds ${num(lambda)}(${m}x ${MINUS} ${yTerm(n)}) = ${num(lambda * c)} but leaves off the ${signed(d)}.`],
        ],
        explanation:
          `The given equation says ${m}x ${MINUS} ${yTerm(n)} = ${num(c)}. The target is ${num(lambda)}(${m}x ${MINUS} ${yTerm(n)}) ${signed(d)}, ` +
          `so its value is ${num(lambda)}(${num(c)}) ${signed(d)} = ${num(key)}.`,
        steps: [
          `Rearrange the given equation: ${m}x ${MINUS} ${yTerm(n)} = ${num(c)}.`,
          `Factor the target: ${target} = ${paren(lambda)}(${m}x ${MINUS} ${yTerm(n)}) ${signed(d)}.`,
          `Substitute: ${paren(lambda)}(${num(c)}) ${signed(d)} = ${num(key)}.`,
        ],
        principles: ["An expression can be evaluated without solving for each variable when it is a multiple of a known combination."],
        trap: lambda < 0
          ? `The y-term comes first in the target, so the multiple is negative: ${num(lambda)}, not ${Math.abs(lambda)}.`
          : "The constant must be moved across the equals sign before the combination's value can be read.",
        hint: `How is ${target.replace(/ [+−] \d+$/, "")} related to the equation you were given?`,
        verify: () => [1.5, -4, 7.25].every((x) => {
          // Solve the given equation for y at several x, then evaluate the target.
          const y = (m * x - c) / n;
          return approx(lambda * m * x - lambda * n * y + d, key, 1e-9);
        }),
      };
    }
  }

  function substitutionExponent(t, numeric) {
    for (;;) {
      const q = t.pick([2, 3, 5]);
      const v = t.pick([3, 5, 6, 7, 10, 11].filter((value) => value !== q && Math.log(value) / Math.log(q) % 1 !== 0));
      const m = t.pick([2, 3]);
      const product = t.chance(0.4);
      const j = t.pick([1, 1, 2]);
      const n = product ? m * j : t.pick(q === 3 ? [1, 2] : [1, 2, -1]);
      const key = v ** m * q ** n;
      const keyText = ratioText(v ** m * (n < 0 ? 1 : q ** n), n < 0 ? q ** -n : 1, 2);
      if (!keyText || keyText.replace(".", "").length > 5) continue;
      const target = product ? `${q ** m}^(x + ${j})` : `${q}^(${m}x ${signed(n)})`;
      const qn = n < 0 ? ratioText(1, q ** -n, 2) : String(q ** n);
      const qPow = n > 0 ? `${q}${S.sup(n)}` : `${q}^(${num(n)})`;
      const wrong = [
        [Number(ratioText(Math.round((v ** m + q ** n) * 100), 100, 2)), `Splits the exponent into a sum of values: ${v}${S.sup(m)} + ${qn} instead of ${v}${S.sup(m)} · ${qn}.`],
        [Number(ratioText(Math.round(m * v * q ** n * 100), 100, 2)), `Treats ${q}^(${m}x) as ${m} · ${q}^x = ${m * v}, multiplying by the exponent instead of raising to it.`],
        [v ** m, `Finds ${q}^(${m}x) = ${v ** m} but drops the factor ${qn}.`],
        [v ** (m + Math.abs(n)), `Adds the exponents ${m} and ${Math.abs(n)} and raises ${v} to the total.`],
      ];
      if (new Set(wrong.map(([value]) => value).concat(Number(keyText))).size < 4) continue;
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: `${q}^x = ${v}` },
        stem: `If x satisfies the given equation, what is the value of ${target}?`,
        correct: Number(keyText),
        wrong,
        explanation:
          `${target} = ${product ? `${q}^(${m}x + ${m * j}) = ` : ""}(${q}^x)${S.sup(m)} · ${qPow} = ${v}${S.sup(m)} · ${qn} = ${keyText}.`,
        steps: [
          product ? `Write ${q ** m} as ${q}${S.sup(m)}: ${target} = ${q}^(${m}x + ${m * j}) = ${q}^(${m}x) · ${qPow}.` : `Split the exponent: ${target} = ${q}^(${m}x) · ${qPow}.`,
          `${q}^(${m}x) = (${q}^x)${S.sup(m)} = ${v}${S.sup(m)} = ${v ** m}.`,
          `${qPow} = ${qn}, so the value is ${v ** m} · ${qn} = ${keyText}.`,
        ],
        principles: ["b^(u + v) = b^u · b^v and b^(mx) = (b^x)^m."],
        trap: "An exponent that is a sum splits into a product of powers, not a sum of values.",
        hint: `Write ${target} using ${q}^x.`,
        verify: () => {
          const x = Math.log(v) / Math.log(q);
          const value = product ? (q ** m) ** (x + j) : q ** (m * x + n);
          return approx(q ** x, v) && approx(value, key, 1e-9);
        },
      };
    }
  }

  const expressionSubstitution = {
    id: "expression-substitution",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "exponent rules",
    title: "Evaluate an expression through a known combination",
    recognize:
      "The variables cannot (or need not) be found one at a time; the target is a multiple, square, or power of the " +
      "given combination, and rewriting it in those terms is the whole problem.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 2 },
    tricks: ["wrong-quantity", "equivalent-form", "neighbouring-rule", "sign-error", "intermediate-value"],
    build(t) {
      const roll = t.random();
      const numeric = t.chance(0.36);
      const common = { estimatedSeconds: 95 };
      if (roll < 0.3) return { ...common, ...substitutionPowers(t, numeric) };
      if (roll < 0.55) return { ...common, ...substitutionSymmetric(t, numeric) };
      if (roll < 0.77) return { ...common, ...substitutionLinear(t, numeric) };
      return { ...common, ...substitutionExponent(t, numeric) };
    },
  };

  return [exponentialRewrite, extraneousRoots, functionTransformationTable, polynomialFactorRemainder, expressionSubstitution];
});
