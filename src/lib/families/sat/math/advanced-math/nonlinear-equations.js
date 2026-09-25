(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/advanced-math"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Nonlinear equations templates (Advanced Math), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, signed, lin, approx, poly } = S;
  const {
    tidy, ratio, drawUntilDistinct, denominatorHard, ratioHard, enoughChoicesHard, plus, terms,
    sampleQuadratic, realRoots, quadraticRoots,
  } = C;

  // "a and b" for a pair of solutions, smaller first.
  const bothText = (u, v) => `x = ${ratio(Math.min(u, v))} and x = ${ratio(Math.max(u, v))}`;

  /* ============================================= quadratic-square-root-solve */

  function shiftedSquareItem(t, ask, numeric) {
    const h = t.nonzero(-8, 8);
    const c = t.int(Math.abs(h) + 1, Math.abs(h) + 7);
    const a = t.pick([1, 1, 1, 1, 4, 9]);
    const rhs = a * c * c;
    const inner = lin(1, -h);
    const equation = `${a === 1 ? "" : a}(${inner})² = ${rhs}`;
    const hi = h + c;
    const lo = h - c;
    const carried = `Carries the ${signed(-h).replace(" ", "")} to the other side unchanged`;
    const skipRoot = a === 1
      ? "Never takes the square root"
      : `Divides by ${a} but never takes the square root`;
    const steps = [];
    if (a > 1) steps.push(`Divide both sides by ${a}: (${inner})² = ${c * c}.`);
    steps.push(`Take the square root of both sides, keeping both signs: ${inner} = ${c} or ${inner} = ${MINUS}${c}.`);
    steps.push(`Solve each: x = ${num(hi)} or x = ${num(lo)}.`);
    let correct;
    let wrong;
    let stem;
    if (ask === "positive") {
      stem = "What is the positive solution to the given equation?";
      correct = hi;
      wrong = [
        [c, `Stops at ${inner} = ${c}; ${c} is the value of ${inner}, not of x.`],
        [c - h, `${carried}, giving x = ${c} ${signed(-h)} = ${num(c - h)}.`],
        [c * c + h, `${skipRoot}: x = ${c * c} ${signed(h)} = ${num(c * c + h)}.`],
      ];
      if (a > 1) wrong.push([Math.sqrt(a) * c + h, `Takes the square root of ${rhs} before dividing by ${a}.`]);
      steps.push(`The positive solution is ${num(hi)}.`);
    } else if (ask === "negative") {
      stem = "What is the negative solution to the given equation?";
      correct = lo;
      wrong = [
        [-c, `Stops at ${inner} = ${MINUS}${c}; ${MINUS}${c} is the value of ${inner}, not of x.`],
        [-c - h, `${carried}, giving x = ${MINUS}${c} ${signed(-h)} = ${num(-c - h)}.`],
        [h - c * c, `${skipRoot}: x = ${MINUS}${c * c} ${signed(h)} = ${num(h - c * c)}.`],
        [hi, "Gives the positive solution instead of the negative one."],
      ];
      steps.push(`The negative solution is ${num(lo)}.`);
    } else {
      stem = "What are all solutions to the given equation?";
      correct = bothText(lo, hi);
      wrong = [
        [`x = ${num(hi)} only`, `Takes only the positive square root, losing ${inner} = ${MINUS}${c}.`],
        [bothText(-h - c, -h + c), `Reads the shift with the wrong sign, solving (${lin(1, h)})² = ${c * c} instead.`],
        [bothText(-c, c), `Stops at ${inner} = ±${c} and never ${h > 0 ? "adds" : "subtracts"} ${Math.abs(h)}.`],
        [bothText(h - c * c, h + c * c), `${skipRoot}, using ±${c * c}.`],
      ];
      steps.push(`Both values are solutions: x = ${num(lo)} and x = ${num(hi)}.`);
    }
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: equation },
      stem,
      correct,
      wrong: numeric ? undefined : wrong,
      explanation:
        `${a > 1 ? `Dividing by ${a} gives (${inner})² = ${c * c}. ` : ""}A square equals ${c * c} when the quantity squared is ` +
        `${c} or ${MINUS}${c}, so ${inner} = ±${c} and x = ${num(h)} ± ${c}: x = ${num(hi)} or x = ${num(lo)}.`,
      steps,
      principles: [
        "If u² = k with k > 0, then u = √k or u = −√k; both give solutions.",
      ],
      trap: numeric
        ? `Stopping at ${inner} = ${ask === "negative" ? MINUS : ""}${c} gives ${ask === "negative" ? MINUS : ""}${c}, and moving ${num(Math.abs(h))} the wrong way gives ${num(ask === "negative" ? -c - h : c - h)}.`
        : `The square root has two signs, and the ${signed(-h).replace(" ", "")} inside the parentheses must be undone after taking it.`,
      hint: `What numbers, squared, give ${c * c}?`,
      verify: () => {
        const holds = (x) => approx(a * (x - h) ** 2, rhs);
        const values = [lo, hi];
        return values.every(holds) && [-9, -5, 0, 3, 11].every((x) => values.includes(x) || !holds(x)) &&
          (ask === "positive" ? correct > 0 : ask === "negative" ? correct < 0 : true);
      },
    };
  }

  function isolatedSquareItem(t, numeric) {
    const a = t.int(1, 5);
    const s = t.int(2, 9);
    const d = t.nonzero(-30, 30);
    const e = a * s * s + d;
    if (e <= 0) return null;
    const equation = `${poly([a, 0, d])} = ${e}`;
    const isolate = a === 1
      ? `x² = ${e} ${signed(-d)} = ${s * s}`
      : `${a}x² = ${e} ${signed(-d)} = ${a * s * s}, so x² = ${s * s}`;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: equation },
      stem: numeric ? "What is the positive solution to the given equation?" : "What are all solutions to the given equation?",
      correct: numeric ? s : bothText(-s, s),
      wrong: numeric ? undefined : [
        [`x = ${s} only`, `Takes only the positive square root of ${s * s}.`],
        [bothText(-s * s, s * s), `Stops at x² = ${s * s} and never takes the square root.`],
        [`x = ${s * s} only`, "Never takes the square root and keeps only one sign."],
      ],
      explanation: `Isolating x² gives ${isolate}. Then x = ${s} or x = ${MINUS}${s}.`,
      steps: [
        `Move the constant: ${a === 1 ? `x² = ${e} ${signed(-d)}` : `${a}x² = ${e} ${signed(-d)} = ${a * s * s}`}.`,
        `${a === 1 ? "So" : `Divide by ${a}:`} x² = ${s * s}.`,
        numeric ? `The positive solution is ${s}.` : `Take both square roots: x = ${MINUS}${s} and x = ${s}.`,
      ],
      principles: ["If x² = k with k > 0, then x = √k or x = −√k."],
      trap: numeric
        ? `Stopping at x² = ${s * s} gives ${s * s}, which is x², not x.`
        : "A positive number has two square roots; keeping only one loses a solution.",
      hint: "Get x² by itself first.",
      verify: () => {
        const holds = (x) => approx(a * x * x + d, e);
        return holds(s) && holds(-s) && !holds(s * s) && s > 0;
      },
    };
  }

  /* ================================================== radical-equation-solve */

  function radicalItem(t, numeric) {
    const kind = t.pick(["shift", "shift", "scale", "cube"]);
    let equation;
    let x;
    let wrong;
    let steps;
    let holds;
    let explanation;
    let slip;
    if (kind === "shift") {
      const a = t.nonzero(-20, 20);
      const b = t.int(2, 12);
      x = b * b - a;
      const inner = lin(1, a);
      const layout = t.pick(["left", "right", "zero"]);
      equation = layout === "left" ? `√(${inner}) = ${b}` : layout === "right" ? `${b} = √(${inner})` : `√(${inner}) ${MINUS} ${b} = 0`;
      wrong = [
        [b - a, `Never squares: solves ${inner} = ${b}.`],
        [b * b + a, `Squares correctly but carries the ${signed(a).replace(" ", "")} across without changing its sign.`],
        [2 * b - a, `Doubles ${b} instead of squaring it.`],
        [b * b, `Squares ${b} but never ${a > 0 ? "subtracts" : "adds"} ${Math.abs(a)}.`],
      ];
      steps = [
        `${layout === "zero" ? `Add ${b} to both sides, then square` : "Square both sides"}: ${inner} = ${b * b}.`,
        `Solve: x = ${b * b} ${signed(-a)} = ${num(x)}.`,
        `Check: √(${num(x)} ${signed(a)}) = √${b * b} = ${b}.`,
      ];
      explanation = `Squaring both sides gives ${inner} = ${b * b}, so x = ${num(x)}. Check: √${b * b} = ${b}.`;
      holds = (value) => value + a >= 0 && approx(Math.sqrt(value + a), b);
      slip = `Doubling ${b} instead of squaring it gives ${num(2 * b - a)}, and moving the ${signed(a).replace(" ", "")} the wrong way gives ${num(b * b + a)}.`;
    } else if (kind === "scale") {
      const k = t.int(2, 6);
      const m = t.int(2, 6);
      const b = k * m;
      x = k * m * m;
      equation = t.chance(0.5) ? `√(${k}x) = ${b}` : `${b} = √(${k}x)`;
      wrong = [
        [m, `Divides ${b} by ${k} without squaring.`],
        [b * b, `Squares ${b} but never divides by ${k}.`],
        [k * b * b, `Multiplies ${b * b} by ${k} instead of dividing.`],
        [m * m, `Treats √(${k}x) as ${k}√x, dividing ${b} by ${k} before squaring.`],
      ];
      steps = [
        `Square both sides: ${k}x = ${b * b}.`,
        `Divide by ${k}: x = ${x}.`,
        `Check: √(${k} · ${x}) = √${b * b} = ${b}.`,
      ];
      explanation = `Squaring both sides gives ${k}x = ${b * b}, so x = ${b * b}/${k} = ${x}.`;
      holds = (value) => value >= 0 && approx(Math.sqrt(k * value), b);
      slip = `Dividing ${b} by ${k} without squaring gives ${m}, and squaring without dividing gives ${b * b}.`;
    } else {
      const a = t.nonzero(-12, 12);
      const b = t.int(2, 5);
      x = b ** 3 - a;
      const inner = lin(1, a);
      equation = `∛(${inner}) = ${b}`;
      wrong = [
        [b * b - a, `Squares ${b} instead of cubing it.`],
        [3 * b - a, `Multiplies ${b} by 3 instead of cubing it.`],
        [b ** 3 + a, `Cubes correctly but carries the ${signed(a).replace(" ", "")} across without changing its sign.`],
      ];
      steps = [
        `Cube both sides: ${inner} = ${b ** 3}.`,
        `Solve: x = ${b ** 3} ${signed(-a)} = ${num(x)}.`,
        `Check: ∛(${num(x)} ${signed(a)}) = ∛${b ** 3} = ${b}.`,
      ];
      explanation = `Cubing both sides gives ${inner} = ${b ** 3}, so x = ${num(x)}.`;
      holds = (value) => approx(Math.cbrt(value + a), b);
      slip = `Squaring ${b} instead of cubing it gives ${num(b * b - a)}, and multiplying by 3 gives ${num(3 * b - a)}.`;
    }
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: equation },
      stem: numeric ? "What value of x satisfies the given equation?" : "What is the solution to the given equation?",
      correct: x,
      wrong: numeric ? undefined : wrong,
      explanation,
      steps,
      principles: [
        kind === "cube" ? "Cubing undoes a cube root: if ∛u = b, then u = b³." : "Squaring undoes a square root: if √u = b with b ≥ 0, then u = b².",
      ],
      trap: numeric
        ? slip
        : "The root is undone by a power, not by the neighbouring operation, and the constant moves with a changed sign.",
      hint: "What operation undoes the root?",
      // Substitute the key and every distractor back into the original equation.
      verify: () => holds(x) && wrong.every(([value]) => value === x || !holds(value)),
    };
  }

  /* ================================================= absolute-value-equation */

  function absoluteValueItem(t, ask, numeric) {
    const a = t.pick([1, 1, 2, 3]);
    const s1 = t.int(-9, -1);
    const s2 = t.int(1, 12);
    if ((a * (s1 + s2)) % 2 !== 0 || s1 + s2 === 0) return null;
    const b = (a * (s1 + s2)) / 2;
    const R = (a * (s2 - s1)) / 2;
    const inside = lin(a, -b);
    const layout = t.pick(["plus", "plus", "times", "minus"]);
    let equation;
    let isolate;
    let slipR;
    let slipWhy;
    if (layout === "plus") {
      const d = t.nonzero(-9, 9);
      const e = R + d;
      if (e <= 0) return null;
      equation = `|${inside}| ${signed(d)} = ${e}`;
      isolate = `${d > 0 ? "Subtract" : "Add"} ${Math.abs(d)}: |${inside}| = ${R}.`;
      slipR = e + d;
      slipWhy = `Moves the ${signed(d).replace(" ", "")} across without changing its sign, so |${inside}| = ${slipR}.`;
    } else if (layout === "times") {
      const c = t.int(2, 5);
      equation = `${c}|${inside}| = ${c * R}`;
      isolate = `Divide by ${c}: |${inside}| = ${R}.`;
      slipR = c * R;
      slipWhy = `Never divides by ${c}, so |${inside}| = ${c * R}.`;
    } else {
      const e = t.int(1, 9);
      const d = e + R;
      equation = `${d} ${MINUS} |${inside}| = ${e}`;
      isolate = `Subtract ${d} from both sides and multiply by ${MINUS}1: |${inside}| = ${R}.`;
      slipR = d + e;
      slipWhy = `Adds ${e} to ${d} instead of subtracting, so |${inside}| = ${slipR}.`;
    }
    const solve = (value) => [(b - value) / a, (b + value) / a];
    const [slipLo, slipHi] = solve(slipR);
    const holds = (x) => approx(Math.abs(a * x - b), R);
    const baseSteps = [
      `Isolate the absolute value. ${isolate}`,
      `Split into two cases: ${inside} = ${R} or ${inside} = ${MINUS}${R}.`,
      `Solve each: x = ${ratio(s2)} or x = ${ratio(s1)}.`,
    ];
    const principles = ["|u| = k with k > 0 means u = k or u = −k; isolate the absolute value before splitting."];
    const hint = "Get the absolute value by itself first. What two values can the expression inside it take?";
    const explanation =
      `${isolate} Then ${inside} = ${R} gives x = ${ratio(s2)}, and ${inside} = ${MINUS}${R} gives x = ${ratio(s1)}.`;
    if (ask === "all") {
      return {
        responseType: "multiple-choice",
        stimulus: { type: "equations", content: equation },
        stem: "What are all solutions to the given equation?",
        correct: bothText(s1, s2),
        wrong: [
          [`x = ${ratio(s2)} only`, `Solves only ${inside} = ${R} and drops the case ${inside} = ${MINUS}${R}.`],
          [bothText(slipLo, slipHi), slipWhy],
          [bothText(-s2, -s1), `Solves |${lin(a, b)}| = ${R}, changing the sign of the constant inside the bars.`],
        ],
        explanation,
        steps: [...baseSteps, `Both values check in the original equation.`],
        principles,
        trap: "Splitting before the absolute value is alone, or keeping only the positive case, gives a wrong pair.",
        hint,
        verify: () => holds(s1) && holds(s2) && !holds(slipHi) && !holds(-s2) &&
          [-20, -3.5, 0, 0.5, 7.25, 30].every((x) => !holds(x) || approx(x, s1) || approx(x, s2)),
      };
    }
    if (ask === "gap") {
      const gap = s2 - s1;
      return {
        responseType: "numeric",
        stimulus: { type: "equations", content: equation },
        stem: "The solutions to the given equation are p and q, where p < q. What is the value of q − p?",
        correct: gap,
        explanation: `${explanation} So q ${MINUS} p = ${ratio(s2)} ${MINUS} (${ratio(s1)}) = ${num(gap)}.`,
        steps: [...baseSteps, `q ${MINUS} p = ${ratio(s2)} ${MINUS} (${ratio(s1)}) = ${num(gap)}.`],
        principles,
        trap: `|${inside}| = ${R} is found on the way, but ${R} is neither solution nor their difference; skipping the isolation step gives ${num(tidy(slipHi - slipLo))}.`,
        hint,
        verify: () => holds(s1) && holds(s2) && approx((2 * R) / a, gap),
      };
    }
    const positive = ask === "positive";
    const key = positive ? s2 : s1;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: equation },
      stem: `What is the ${positive ? "positive" : "negative"} solution to the given equation?`,
      correct: numeric ? key : ratio(key),
      wrong: numeric ? undefined : [
        [ratio(positive ? R : -R), `Gives the value of ${inside} in that case, not the value of x.`],
        [ratio(positive ? slipHi : slipLo), slipWhy],
        [ratio(positive ? -s1 : -s2), `Solves |${lin(a, b)}| = ${R}, changing the sign of the constant inside the bars.`],
      ],
      explanation,
      steps: [...baseSteps, `The ${positive ? "positive" : "negative"} solution is ${ratio(key)}.`],
      principles,
      trap: numeric
        ? `Stopping at ${inside} = ${positive ? "" : MINUS}${R} gives ${positive ? "" : MINUS}${R}; skipping the isolation step gives ${ratio(positive ? slipHi : slipLo)}.`
        : "The value of the expression inside the bars is not the value of x.",
      hint,
      verify: () => holds(key) && (positive ? key > 0 : key < 0) && holds(positive ? s1 : s2),
    };
  }

  /* ========================================== quadratic-irrational-solutions */

  // (P ± s√r)/Q reduced so that gcd(P, s, Q) = 1 and Q > 0.
  function surd(P, s, r, Q) {
    let top = P;
    let coef = s;
    let bottom = Q;
    const g = S.gcd(S.gcd(top, coef), bottom);
    top /= g;
    coef /= g;
    bottom /= g;
    if (bottom < 0) {
      top = -top;
      bottom = -bottom;
    }
    return { P: top, s: Math.abs(coef), r, Q: bottom };
  }

  // Square factors pulled out of D: D = s²r with r square-free.
  function extract(D) {
    let s = 1;
    let r = D;
    for (let f = 2; f * f <= r; f += 1) {
      while (r % (f * f) === 0) {
        r /= f * f;
        s *= f;
      }
    }
    return { s, r };
  }

  function surdText({ P, s, r, Q }, sign) {
    const rad = r === 1 ? `${s}` : `${s === 1 ? "" : s}√${r}`;
    const head = P === 0 ? `${sign === "±" ? "±" : sign === "−" ? MINUS : ""}${rad}` : `${num(P)} ${sign === "−" ? MINUS : sign} ${rad}`;
    return Q === 1 ? head : `(${head})/${Q}`;
  }

  const surdValues = ({ P, s, r, Q }) => [(P - s * Math.sqrt(r)) / Q, (P + s * Math.sqrt(r)) / Q];

  function irrationalRootsItem(t) {
    const A = t.pick([1, 1, 1, 2, 3]);
    const B = t.nonzero(-10, 10);
    const C = t.nonzero(-12, 12);
    const D = B * B - 4 * A * C;
    if (D <= 0 || Number.isInteger(Math.sqrt(D)) || D > 200) return null;
    const { s, r } = extract(D);
    const key = surd(-B, s, r, 2 * A);
    if (key.Q > 6 || key.P === 0) return null;
    const plusD = B * B + 4 * A * C;
    const offers = [
      [surd(B, s, r, 2 * A), "Uses b instead of −b in the numerator, reversing the sign of the first term."],
      [surd(-B, s, r, A), `Divides by a = ${A} instead of 2a = ${2 * A}.`],
      [surd(-B, 2 * A * s, r, 2 * A), `Divides only ${num(-B)} by ${2 * A}, leaving the square root undivided.`],
    ];
    if (plusD > 0) {
      const e = extract(plusD);
      offers.push([surd(-B, e.s, e.r, 2 * A), `Computes the discriminant as b² + 4ac = ${plusD} instead of b² − 4ac = ${D}.`]);
    }
    const one = t.chance(0.45);
    const sign = one ? t.pick(["+", "−"]) : "±";
    const layout = t.pick(["standard", "standard", "moved", "split"]);
    let equation;
    if (layout === "standard") equation = `${poly([A, B, C])} = 0`;
    else if (layout === "moved") equation = `${poly([A, 0, C])} = ${poly([-B, 0])}`;
    else equation = `${poly([A, B, 0])} = ${num(-C)}`;
    const f = (x) => A * x * x + B * x + C;
    // The single value a one-root choice shows: (P + s√r)/Q or (P − s√r)/Q.
    const pickValue = (form) => (form.P + (sign === "+" ? 1 : -1) * form.s * Math.sqrt(form.r)) / form.Q;
    const keyText = surdText(key, sign);
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: equation },
      stem: one ? "Which of the following is a solution to the given equation?" : "What are the solutions to the given equation?",
      correct: keyText,
      wrong: offers.map(([form, why]) => [surdText(form, sign), why]),
      explanation:
        `${layout === "standard" ? "" : `Written with 0 on one side, the equation is ${poly([A, B, C])} = 0. `}` +
        `The solutions are x = (${num(-B)} ± √(${paren(B)}² ${MINUS} 4(${A})(${paren(C)})))/(2 · ${A}) = (${num(-B)} ± √${D})/${2 * A}` +
        `${s > 1 ? ` = (${num(-B)} ± ${s}√${r})/${2 * A}` : ""}, which simplifies to ${surdText(key, "±")}.`,
      steps: [
        `${layout === "standard" ? "The equation already has 0 on one side" : "Move every term to one side"}: ${poly([A, B, C])} = 0, so a = ${A}, b = ${num(B)}, c = ${num(C)}.`,
        `b² ${MINUS} 4ac = ${B * B} ${MINUS} (${4 * A * C}) = ${D}${s > 1 ? `, and √${D} = ${s}√${r}` : ""}.`,
        `x = (${num(-B)} ± ${s > 1 ? `${s}√${r}` : `√${D}`})/${2 * A} = ${surdText(key, "±")}.`,
      ],
      principles: ["The solutions of ax² + bx + c = 0 are x = (−b ± √(b² − 4ac))/(2a); every term of the numerator is divided by 2a."],
      trap: "Dropping the sign of b, dividing by a instead of 2a, or dividing only part of the numerator each produces one of the other choices.",
      hint: "Put the equation in the form ax² + bx + c = 0 and read off a, b, and c.",
      verify: () => {
        const values = surdValues(key);
        const zero = (x) => Math.abs(f(x)) < 1e-7;
        if (!values.every(zero)) return false;
        if (one && !zero(pickValue(key))) return false;
        return offers.every(([form]) => one ? !zero(pickValue(form)) : !surdValues(form).every(zero));
      },
    };
  }

  // A numeric key must be a terminating decimal that fits the 5-character grid.
  function gridable(value) {
    if (!Number.isFinite(value) || denominatorHard(value * 1000) !== 1) return false;
    return S.formatNumber(tidy(value)).replace("-", "").length <= 5;
  }

  const isSquare = (value) => value >= 0 && Number.isInteger(Math.sqrt(value));

  /* ====================================================== root-sum-product */

  // An equation whose terms straddle the equals sign. Returns the rearranged
  // coefficients A, B, C (Ax² + Bx + C = 0), the equation as displayed, and
  // what a student who reads coefficients before rearranging would get.
  function straddledEquation(t) {
    const form = t.int(0, 2);
    if (form === 0) {
      // a1x² + c1 = a2x(x + e) + fx
      const a2 = t.int(2, 5);
      const A = t.pick([1, 2, 4, -1, -2, 3]);
      const a1 = a2 + A;
      if (a1 < 1) return null;
      const e = t.nonzero(-6, 6);
      const f = t.nonzero(-9, 9);
      const c1 = t.nonzero(-12, 12);
      const B = -(a2 * e + f);
      return {
        text: `${terms([[a1, "x²"], [c1, ""]])} = ${a2}x(${lin(1, e)}) ${plus(f, "x")}`,
        A, B, C: c1,
        fn: (x) => a1 * x * x + c1 - (a2 * x * (x + e) + f * x),
        naiveSum: -B / a1,
        naiveProduct: c1 / a1,
        naiveWhy: `dividing by ${a1}, the x² coefficient on the left, without combining it with the ${a2}x² on the right`,
        productSign: -c1 / A,
        productSignWhy: "Writes the product as −c/a, carrying the sign from the sum rule into the product.",
        extraSum: [(e + f) / A, `Expands ${a2}x(${lin(1, e)}) as ${terms([[a2, "x²"], [e, "x"]])}, multiplying ${num(e)} by x but not by ${a2}.`],
        expand: `Expand the right side: ${a2}x(${lin(1, e)}) ${plus(f, "x")} = ${terms([[a2, "x²"], [a2 * e + f, "x"]])}.`,
      };
    }
    if (form === 1) {
      // m(x − h)² = kx + n
      const m = t.pick([1, 2, 2, 3, 4, 5]);
      const h = t.nonzero(-5, 5);
      const k = t.nonzero(-9, 9);
      const n = t.nonzero(-12, 12);
      return {
        text: `${m === 1 ? "" : m}(${lin(1, -h)})² = ${lin(k, n)}`,
        A: m,
        B: -(2 * m * h + k),
        C: m * h * h - n,
        fn: (x) => m * (x - h) * (x - h) - (k * x + n),
        naiveSum: 2 * h,
        naiveProduct: h * h,
        naiveWhy: `reading x = ${num(h)} twice from (${lin(1, -h)})², as if the right side were 0`,
        productSign: (m * h * h + n) / m,
        productSignWhy: `Moves ${num(n)} to the left without changing its sign.`,
        extraSum: [k / m, `Squares ${lin(1, -h)} as x² + ${h * h}, dropping the middle term.`],
        expand: `Expand the left side: ${m === 1 ? "" : m}(${lin(1, -h)})² = ${poly([m, -2 * m * h, m * h * h])}.`,
      };
    }
    // (x + p)(q1x + r) = sx + w
    const p = t.nonzero(-6, 6);
    const q1 = t.pick([1, 2, 2, 3, 4, 5]);
    const r = t.nonzero(-7, 7);
    const s = t.nonzero(-9, 9);
    const w = t.nonzero(-12, 12);
    if (q1 === 1 && r === p) return null; // would read as a square
    return {
      text: `(${lin(1, p)})(${lin(q1, r)}) = ${lin(s, w)}`,
      A: q1,
      B: q1 * p + r - s,
      C: p * r - w,
      fn: (x) => (x + p) * (q1 * x + r) - (s * x + w),
      naiveSum: -p - r / q1,
      naiveProduct: (p * r) / q1,
      naiveWhy: `reading the solutions ${num(-p)} and ${ratioHard(-r / q1)} off the factors on the left, as if the right side were 0`,
      productSign: (p * r + w) / q1,
      productSignWhy: `Moves ${num(w)} to the left without changing its sign.`,
      extraSum: null,
      expand: `Expand the left side: (${lin(1, p)})(${lin(q1, r)}) = ${poly([q1, q1 * p + r, p * r])}.`,
    };
  }

  // "3x + 10", or "13 − 5x" when only the x-coefficient is negative.
  function linText(a, b, variable = "x") {
    if (a < 0 && b > 0) return `${num(b)} ${MINUS} ${Math.abs(a) === 1 ? "" : num(Math.abs(a))}${variable}`;
    return lin(a, b, variable);
  }

  /* ---------------------------------------------------- extraneous roots */

  const rootFactor = (r) => (r === 0 ? "x" : `(x ${signed(-r)})`);

  const pair = (x, y) => `${num(Math.min(x, y))} and ${num(Math.max(x, y))}`;

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

  const quadraticSquareRootSolve = {
    id: "quadratic-square-root-solve",
    difficulty: "Easy",
    domain: "Advanced Math",
    skill: "Nonlinear equations",
    subskill: "quadratic equations",
    title: "Quadratic solved by square roots",
    recognize: "With the squared quantity alone on one side, take the square root with both signs, then undo the shift.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "wrong-quantity", "intermediate-value"],
    build(t) {
      const roll = t.random();
      let make;
      if (roll < 0.2) make = () => shiftedSquareItem(t, "all", false);
      else if (roll < 0.34) make = () => shiftedSquareItem(t, "positive", false);
      else if (roll < 0.44) make = () => shiftedSquareItem(t, "negative", false);
      else if (roll < 0.62) make = () => shiftedSquareItem(t, t.pick(["positive", "negative"]), true);
      else if (roll < 0.8) make = () => isolatedSquareItem(t, false);
      else make = () => isolatedSquareItem(t, true);
      return { estimatedSeconds: 55, ...drawUntilDistinct(make) };
    },
  };

  const radicalEquationSolve = {
    id: "radical-equation-solve",
    difficulty: "Easy",
    domain: "Advanced Math",
    skill: "Nonlinear equations",
    subskill: "radical equations",
    title: "Radical equation undone in one step",
    recognize: "A square root is undone by squaring both sides and a cube root by cubing; then solve the linear equation left.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "sign-error"],
    build(t) {
      const numeric = t.chance(0.45);
      return { estimatedSeconds: 50, ...drawUntilDistinct(() => radicalItem(t, numeric)) };
    },
  };

  const absoluteValueEquation = {
    id: "absolute-value-equation",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Nonlinear equations",
    subskill: "absolute value",
    title: "Absolute value equation with two cases",
    recognize: "Isolate the absolute value first; then the expression inside equals the positive number or its opposite, giving two linear equations.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity", "sign-error"],
    build(t) {
      const roll = t.random();
      let make;
      if (roll < 0.35) make = () => absoluteValueItem(t, "all", false);
      else if (roll < 0.55) make = () => absoluteValueItem(t, t.pick(["positive", "negative"]), false);
      else if (roll < 0.8) make = () => absoluteValueItem(t, t.pick(["positive", "negative"]), true);
      else make = () => absoluteValueItem(t, "gap", true);
      return { estimatedSeconds: 85, ...drawUntilDistinct(make) };
    },
  };

  const quadraticIrrationalSolutions = {
    id: "quadratic-irrational-solutions",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Nonlinear equations",
    subskill: "quadratic equations",
    title: "Quadratic with irrational solutions",
    recognize: "A quadratic that does not factor over the integers is solved from its coefficients once it is set equal to 0; the radical is then simplified and every term divided by 2a.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["sign-error", "neighbouring-rule"],
    build(t) {
      return { estimatedSeconds: 95, ...drawUntilDistinct(() => irrationalRootsItem(t)) };
    },
  };

  const rootSumProduct = {
    id: "root-sum-product",
    domain: "Advanced Math",
    skill: "Nonlinear equations",
    subskill: "quadratic equations",
    title: "Sum and product of roots after rearranging",
    recognize:
      "Symmetric quantities of the solutions (their sum, product, sum of squares, or reciprocal sum) come from the " +
      "coefficients once every term sits on one side; the roots themselves are never needed.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "sign-error", "intermediate-value"],
    build(t) {
      const numeric = t.chance(0.3);
      const ask = t.pick(["sum", "sum", "sum", "sum", "sum", "product", "product", "product",
        "squares", "squares", "squares", "squares", "squares", "gap", "gap", "gap",
        "reciprocal", "reciprocal", "reciprocal", "reciprocal"]);
      for (let attempt = 0; ; attempt += 1) {
        const eq = straddledEquation(t);
        if (!eq) continue;
        const { A, B, C } = eq;
        const disc = B * B - 4 * A * C;
        if (B === 0 || C === 0 || disc <= 0 || isSquare(disc)) continue;
        const sum = -B / A;
        const product = C / A;
        const Sn = eq.naiveSum;
        const Pn = eq.naiveProduct;
        const naive = `Takes r + s = ${ratioHard(Sn)} and rs = ${ratioHard(Pn)} by ${eq.naiveWhy}.`;
        const table = {
          sum: {
            stem: "What is the sum of the solutions to the given equation?",
            value: sum,
            fromRoots: (r, s) => r + s,
            finish: `Sum of the solutions: −B/A = ${MINUS}(${num(B)})/${paren(A)} = ${ratioHard(sum)}.`,
            wrong: [
              [-sum, "Uses b/a for the sum, losing the negative sign in −b/a."],
              [Sn, `Gets the sum by ${eq.naiveWhy}.`],
              [product, "Gives the product of the solutions, c/a, instead of the sum."],
              ...(eq.extraSum ? [eq.extraSum] : []),
            ],
          },
          product: {
            stem: "What is the product of the solutions to the given equation?",
            value: product,
            fromRoots: (r, s) => r * s,
            finish: `Product of the solutions: C/A = ${num(C)}/${paren(A)}${`${num(C)}/${paren(A)}` === ratioHard(product) ? "" : ` = ${ratioHard(product)}`}.`,
            wrong: [
              [Pn, `Gets the product by ${eq.naiveWhy}.`],
              [eq.productSign, eq.productSignWhy],
              [sum, "Gives the sum of the solutions, −b/a, instead of the product."],
              [-product, "Writes the product as −c/a, carrying the sign from the sum rule into the product."],
            ],
          },
          squares: {
            stem: "The solutions to the given equation are r and s. What is the value of r² + s²?",
            value: sum * sum - 2 * product,
            fromRoots: (r, s) => r * r + s * s,
            finish: `r² + s² = (r + s)² − 2rs = (${ratioHard(sum)})² − 2(${ratioHard(product)}) = ${ratioHard(sum * sum - 2 * product)}.`,
            wrong: [
              [sum * sum, "Squares r + s and stops; (r + s)² still contains the cross term 2rs."],
              [sum * sum + 2 * product, "Adds 2rs to (r + s)² instead of subtracting it."],
              [sum * sum - 4 * product, "Subtracts 4rs, which gives (r − s)², not r² + s²."],
              [Sn * Sn - 2 * Pn, naive],
            ],
          },
          gap: {
            stem: "The solutions to the given equation are r and s. What is the value of (r − s)²?",
            value: sum * sum - 4 * product,
            fromRoots: (r, s) => (r - s) * (r - s),
            finish: `(r − s)² = (r + s)² − 4rs = (${ratioHard(sum)})² − 4(${ratioHard(product)}) = ${ratioHard(sum * sum - 4 * product)}.`,
            wrong: [
              [sum * sum - 2 * product, "Subtracts 2rs, which gives r² + s², not (r − s)²."],
              [sum * sum + 4 * product, "Adds 4rs to (r + s)² instead of subtracting it."],
              [Sn * Sn - 4 * Pn, naive],
              [sum * sum, "Treats (r − s)² as if it equaled (r + s)²."],
            ],
          },
          reciprocal: {
            stem: "The solutions to the given equation are r and s. What is the value of 1/r + 1/s?",
            value: sum / product,
            fromRoots: (r, s) => 1 / r + 1 / s,
            finish: `1/r + 1/s = (r + s)/(rs) = (${ratioHard(sum)})/(${ratioHard(product)}) = ${ratioHard(sum / product)}.`,
            wrong: [
              [product / sum, "Inverts the combined fraction, computing rs/(r + s)."],
              [-sum / product, "Uses b/a for r + s, losing the negative sign in −b/a."],
              [1 / sum, "Adds the reciprocals as 1/(r + s), adding denominators instead of using a common one."],
              [Sn / Pn, naive],
            ],
          },
        };
        const chosen = table[ask];
        const value = chosen.value;
        // Hand-friendly numbers: small keys with small denominators, and no
        // distractor so large or ragged that it rules itself out.
        const derived = ask !== "sum" && ask !== "product";
        if (Math.abs(value) > (derived ? 60 : 30) || denominatorHard(value) > (derived ? 4 : 6)) continue;
        if (chosen.wrong.some(([wrongValue]) =>
          !Number.isFinite(wrongValue) || Math.abs(wrongValue) > 120 || denominatorHard(wrongValue) > 16)) continue;
        const asNumeric = numeric && gridable(value);
        if (numeric && !asNumeric && attempt < 80) continue;
        const rearranged = `${poly([A, B, C])} = 0`;
        const record = {
          responseType: asNumeric ? "numeric" : "multiple-choice",
          stimulus: { type: "equations", content: eq.text },
          stem: chosen.stem,
          correct: asNumeric ? tidy(value) : ratioHard(value),
          wrong: chosen.wrong.map(([wrongValue, reason]) => [ratioHard(wrongValue), reason]),
          explanation:
            `Moving every term to the left gives ${rearranged}, which has two real solutions because ` +
            `its discriminant, ${disc}, is positive. For Ax² + Bx + C = 0 the solutions have sum −B/A = ` +
            `${ratioHard(sum)} and product C/A = ${ratioHard(product)}. ${chosen.finish}`,
          steps: [
            eq.expand,
            `Move every term to the left: ${rearranged}.`,
            `Read the coefficients: sum of the solutions ${ratioHard(sum)}, product ${ratioHard(product)}.`,
            chosen.finish,
          ],
          principles: [
            "If Ax² + Bx + C = 0 has solutions r and s, then r + s = −B/A and rs = C/A.",
            "The coefficients can be read only after every term is on one side of the equation.",
          ],
          trap:
            `Reading coefficients before rearranging means ${eq.naiveWhy}. After rearranging, the sum is −B/A, ` +
            "with a minus sign, and the product is C/A, without one.",
          hint: "Get every term on one side first. Which quantities of the solutions can you read without finding them?",
          estimatedSeconds: 110,
          verify: () => {
            const roots = realRoots(...sampleQuadratic(eq.fn));
            return roots.length === 2 && S.approx(chosen.fromRoots(roots[0], roots[1]), value, 1e-7);
          },
        };
        if (enoughChoicesHard(record)) return record;
      }
    },
  };

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

  return [
    quadraticSquareRootSolve, radicalEquationSolve, absoluteValueEquation,
    quadraticIrrationalSolutions, rootSumProduct, extraneousRoots,
  ];
});
