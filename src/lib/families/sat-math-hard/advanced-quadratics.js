(function (root, factory) {
  const shared = typeof module === "object" && module.exports
    ? require("./shared")
    : root.SAT_MATH_HARD_SHARED;
  const families = factory(shared);
  if (typeof module === "object" && module.exports) module.exports = families;
  else root.SAT_MATH_HARD_FAMILIES = (root.SAT_MATH_HARD_FAMILIES || []).concat(families);
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  const { MINUS, num, paren, frac, poly, lin, signed, point } = S;

  /* ---------------------------------------------------------- local helpers */

  // Removes floating-point noise from a value known to be a short rational.
  const tidy = (value) => Math.round(value * 1e6) / 1e6;

  // Smallest denominator that writes `value` exactly (Infinity if none <= 500).
  function denominator(value) {
    for (let den = 1; den <= 500; den += 1) {
      if (Math.abs(Math.round(value * den) - value * den) < 1e-6) return den;
    }
    return Infinity;
  }

  // A rational value as a choice label: ratio(8.5) -> "17/2", ratio(-3) -> "−3".
  function ratio(value) {
    const den = denominator(value);
    return den === Infinity ? num(value) : frac(Math.round(value * den), den);
  }

  // A numeric key must be a terminating decimal that fits the 5-character grid.
  function gridable(value) {
    if (!Number.isFinite(value) || denominator(value * 1000) !== 1) return false;
    return S.formatNumber(tidy(value)).replace("-", "").length <= 5;
  }

  const isSquare = (value) => value >= 0 && Number.isInteger(Math.sqrt(value));

  // True when a multiple-choice record has at least three distractors whose
  // labels differ from the key and from each other (what instantiate needs).
  function enoughChoices(record) {
    if (record.responseType === "numeric") return true;
    const seen = new Set([S.label(record.correct)]);
    for (const [value] of record.wrong || []) seen.add(S.label(value));
    return seen.size >= 4;
  }

  // Redraws until the record can be shown as four distinct choices. Every draw
  // uses fresh random parameters, so a rare collision never reaches a student.
  function drawUntilDistinct(make) {
    for (;;) {
      const record = make();
      if (record && enoughChoices(record)) return record;
    }
  }

  // Leading term: term(-1, "x²") -> "−x²", term(3, "a") -> "3a", term(-4, "") -> "−4".
  function term(coefficient, variable) {
    const magnitude = Math.abs(coefficient);
    const body = variable ? `${magnitude === 1 ? "" : num(magnitude)}${variable}` : num(magnitude);
    return `${coefficient < 0 ? MINUS : ""}${body}`;
  }

  // Following term: plus(-1, "x") -> "− x", plus(5, "b") -> "+ 5b".
  function plus(coefficient, variable) {
    const magnitude = Math.abs(coefficient);
    const body = variable ? `${magnitude === 1 ? "" : num(magnitude)}${variable}` : num(magnitude);
    return `${coefficient < 0 ? MINUS : "+"} ${body}`;
  }

  // terms([[2, "x²"], [-5, "x"], [3, ""]]) -> "2x² − 5x + 3"; zero terms dropped.
  function terms(list) {
    const kept = list.filter(([coefficient]) => coefficient !== 0);
    if (!kept.length) return "0";
    return kept.map(([c, v], index) => (index ? plus(c, v) : term(c, v))).join(" ");
  }

  // "a(x + 3)² − 7" from a coefficient label, h, and k.
  function vertexForm(lead, h, k) {
    return `${lead}(${lin(1, -h)})²${k === 0 ? "" : ` ${signed(k)}`}`;
  }

  // Coefficients [A, B, C] of a quadratic function found by sampling it at
  // x = −1, 0, 1, so they owe nothing to the algebra that built the question.
  function sampleQuadratic(fn) {
    const c = fn(0);
    const right = fn(1);
    const left = fn(-1);
    return [(right + left) / 2 - c, (right - left) / 2, c];
  }

  // Real roots of Ax² + Bx + C = 0 by the quadratic formula.
  function realRoots(A, B, C) {
    const disc = B * B - 4 * A * C;
    const scale = Math.max(1, B * B, Math.abs(4 * A * C));
    if (disc < -1e-9 * scale) return [];
    if (Math.abs(disc) <= 1e-9 * scale) return [-B / (2 * A)];
    const root = Math.sqrt(disc);
    return [(-B - root) / (2 * A), (-B + root) / (2 * A)];
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

  /* ================================================ discriminant-parameter */

  // A line written as "y = 3x − 4" or "y − 3x = −4".
  function lineText(p, d, moved) {
    return moved ? `y ${plus(-p, "x")} = ${num(d)}` : `y = ${lin(p, d)}`;
  }

  // Exactly one solution, parameter in the slope: ask for the positive k.
  function tangentSlope(t, numeric) {
    let a;
    let m;
    let b;
    let d;
    for (;;) {
      a = t.pick([1, 1, 2, 2, 3, 4]);
      m = t.int(2, 6);
      if ((m * m) % a) continue;
      b = t.nonzero(1 - 2 * m, 2 * m - 1);
      d = t.nonzero(-9, 9);
      if (Math.abs(b) === m || d + (m * m) / a === 0) continue;
      break;
    }
    const gap = (m * m) / a; // c − d, so 4a(c − d) = (2m)²
    const c = d + gap;
    const k = b + 2 * m;
    const other = b - 2 * m;
    const touchX = m / a;
    const asEquation = t.chance(0.35);
    const moved = !asEquation && t.chance(0.4);
    const quad = poly([a, b, c]);
    const stimulus = asEquation
      ? `${quad} = kx ${signed(d)}`
      : `y = ${quad}\n${moved ? `y ${MINUS} kx = ${num(d)}` : `y = kx ${signed(d)}`}`;
    const combined = `${term(a, "x²")} + (${num(b)} ${MINUS} k)x ${signed(gap)} = 0`;

    const wrong = [
      [2 * m - b, `Moves kx to the left without changing its sign, so the x-coefficient becomes ${num(b)} + k and the positive root is ${num(2 * m - b)}.`],
    ];
    const skipped = Math.sqrt(a * c);
    if (c > 0 && Number.isInteger(skipped) && b + 2 * skipped > 0 && b - 2 * skipped < 0) {
      wrong.push([b + 2 * skipped, `Takes the discriminant with ${num(c)} as the constant term, never subtracting the line's ${num(d)}.`]);
    }
    wrong.push([
      ratio(touchX),
      asEquation
        ? "Gives the equation's single solution x instead of the value of k."
        : "Gives the x-coordinate of the single intersection point instead of the value of k.",
    ]);
    wrong.push([2 * m, `Stops at ${num(b)} ${MINUS} k = ±${2 * m} and reports ${2 * m} without solving for k.`]);
    if (b + m > 0 && b - m < 0) {
      wrong.push([b + m, `Drops the 4 from the discriminant, solving (${num(b)} ${MINUS} k)² = ${m * m} instead of ${4 * m * m}.`]);
    }
    if (!asEquation) {
      wrong.push([ratio(k * touchX + d), "Gives the y-coordinate of the single intersection point instead of the value of k."]);
    }

    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: stimulus },
      stem: asEquation
        ? "In the given equation, k is a constant. If the equation has exactly one real solution, what is the positive value of k?"
        : "In the given system of equations, k is a constant. If the system has exactly one real solution, what is the positive value of k?",
      correct: k,
      wrong,
      explanation:
        `${asEquation ? "Moving" : "Setting the two expressions for y equal and moving"} every term to the left gives ${combined}. ` +
        `There is exactly one real solution when this quadratic has a repeated root, that is, when its discriminant is 0: ` +
        `(${num(b)} ${MINUS} k)² ${MINUS} 4(${num(a)})(${num(gap)}) = 0. So (${num(b)} ${MINUS} k)² = ${4 * m * m}, ` +
        `${num(b)} ${MINUS} k = ±${2 * m}, and k = ${num(k)} or k = ${num(other)}. The positive value is ${num(k)}.`,
      steps: [
        asEquation
          ? `Move kx ${signed(d)} to the left: ${combined}.`
          : `${moved ? `Rewrite the line as y = kx ${signed(d)}, then set` : "Set"} the expressions equal and collect terms: ${combined}.`,
        `One real solution means a zero discriminant: (${num(b)} ${MINUS} k)² ${MINUS} 4(${num(a)})(${num(gap)}) = 0.`,
        `So (${num(b)} ${MINUS} k)² = ${4 * m * m} and ${num(b)} ${MINUS} k = ${2 * m} or ${MINUS}${2 * m}.`,
        `k = ${num(other)} or k = ${num(k)}; the positive value is ${num(k)}.`,
      ],
      principles: [
        "The solutions of a line-and-parabola system are the roots of the single quadratic made by setting the two expressions equal.",
        "Ax² + Bx + C = 0 has exactly one real solution when B² − 4AC = 0, two when it is positive, and none when it is negative.",
      ],
      trap:
        `Moving kx across without changing its sign gives ${num(2 * m - b)}, and the x-coordinate of the touching point, ` +
        `${ratio(touchX)}, is a different quantity from k.`,
      hint: "Write the problem as one equation with 0 on one side. How many roots must that equation have?",
      verify: () => {
        // Solve (b − k)² − 4a(c − d) = 0 for k by the quadratic formula.
        const ks = realRoots(1, -2 * b, b * b - 4 * a * (c - d)).filter((value) => value > 0);
        if (ks.length !== 1 || !S.approx(ks[0], k)) return false;
        // With that k the combined equation has one repeated root on both graphs.
        const roots = realRoots(...sampleQuadratic((x) => a * x * x + b * x + c - (k * x + d)));
        return roots.length === 1 && S.approx(a * roots[0] ** 2 + b * roots[0] + c, k * roots[0] + d);
      },
    };
  }

  // Exactly one solution, parameter in the parabola: ask for the point.
  function tangentPoint(t, numeric) {
    let a;
    let u;
    let p;
    let b;
    let d;
    let k;
    for (;;) {
      a = t.pick([1, 1, 2, 3, -1, -2]);
      u = t.nonzero(-4, 4);
      p = t.nonzero(-6, 6);
      b = p + 2 * a * u;
      d = t.nonzero(-9, 9);
      k = d + a * u * u;
      if (b === 0 || Math.abs(b) > 18 || k === 0 || -p * u + d === 0) continue;
      break;
    }
    const x0 = -u;
    const y0 = p * x0 + d;
    const askY = t.chance(0.5);
    const moved = t.chance(0.4);
    const vertexX = -b / (2 * a);
    const combined = `${terms([[a, "x²"], [b - p, "x"]])} + (k ${signed(-d)}) = 0`;
    const stem = t.chance(0.5)
      ? `In the given system of equations, k is a constant. If the system has exactly one real solution (x, y), what is the value of ${askY ? "y" : "x"}?`
      : `In the given system of equations, k is a constant. The graphs of the equations in the xy-plane intersect at exactly one point. What is the ${askY ? "y" : "x"}-coordinate of that point?`;

    const wrong = askY
      ? [
        [x0, "Stops at the x-coordinate of the point and never finds y."],
        [k, "Reports k, the constant that makes the graphs touch, instead of a coordinate of the point."],
        [p * u + d, `Drops the minus sign in x = −B/(2A), using x = ${num(u)}, then substitutes into the line.`],
        [ratio(p * vertexX + d), `Uses the parabola's own vertex, x = ${ratio(vertexX)}, as the point of contact without first subtracting the line.`],
      ]
      : [
        [ratio(vertexX), `Takes the x-coordinate of the parabola's own vertex, ${ratio(vertexX)}, without first subtracting the line.`],
        [u, "Drops the minus sign in x = −B/(2A) for the combined quadratic."],
        [k, "Reports k, the constant that makes the graphs touch, instead of the x-coordinate."],
        [y0, "Gives the y-coordinate of the point instead of the x-coordinate."],
      ];

    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: `y = ${terms([[a, "x²"], [b, "x"]])} + k\n${lineText(p, d, moved)}` },
      stem,
      correct: askY ? y0 : x0,
      wrong,
      explanation:
        `Setting the expressions for y equal and collecting terms gives ${combined}. The graphs meet at exactly one ` +
        `point when this quadratic has a repeated root, and a repeated root of Ax² + Bx + C = 0 is x = −B/(2A) = ` +
        `${MINUS}(${num(b - p)})/(2 · ${paren(a)}) = ${num(x0)}. ` +
        (askY
          ? `Then y = ${num(p)}(${num(x0)}) ${signed(d)} = ${num(y0)}.`
          : `(The value of k is ${num(k)}, but the question asks for x.)`),
      steps: [
        `${moved ? `Rewrite the line as y = ${lin(p, d)}, then set` : "Set"} the expressions equal: ${combined}.`,
        "Exactly one intersection point means the combined quadratic has one repeated root.",
        `That root is x = −B/(2A) = ${MINUS}(${num(b - p)})/(2 · ${paren(a)}) = ${num(x0)}.`,
        askY
          ? `Substitute into the line: y = ${num(p)}(${num(x0)}) ${signed(d)} = ${num(y0)}.`
          : `Check: k = ${num(k)} makes the discriminant (${num(b - p)})² ${MINUS} 4(${num(a)})(${num(k - d)}) equal 0.`,
      ],
      principles: [
        "A line meets a parabola exactly once when the combined quadratic has a repeated root.",
        "The repeated root of Ax² + Bx + C = 0 is x = −B/(2A), and it can be found without knowing C.",
      ],
      trap:
        `The parabola's own vertex (x = ${ratio(vertexX)}) is not where the line touches it; only the combined ` +
        `quadratic locates the point. Reporting k = ${num(k)} answers a different question.`,
      hint: "Combine the equations into one quadratic. What must be true of its roots if the graphs meet only once?",
      verify: () => {
        const roots = realRoots(...sampleQuadratic((x) => a * x * x + b * x + k - (p * x + d)));
        if (roots.length !== 1) return false;
        const [x] = roots;
        const y = a * x * x + b * x + k;
        return S.approx(x, x0) && S.approx(y, y0) && S.approx(y, p * x + d);
      },
    };
  }

  // No / two real solutions: which inequality describes every k?
  function solutionRange(t) {
    let a;
    let u;
    let p;
    let b;
    let q;
    let T;
    let T1;
    let T2;
    let T3;
    for (;;) {
      a = t.pick([1, 1, 2, -1, -2]);
      u = t.nonzero(-3, 3);
      // p a multiple of 2|a| keeps every threshold below an integer.
      p = 2 * Math.abs(a) * t.nonzero(Math.abs(a) === 1 ? -3 : -2, Math.abs(a) === 1 ? 3 : 2);
      b = p + 2 * a * u;
      q = t.nonzero(-9, 9);
      T = q + a * u * u; // true threshold
      T1 = (b * b) / (4 * a); // discriminant of the parabola alone
      T2 = q + ((b + p) * (b + p)) / (4 * a); // px moved with the wrong sign
      T3 = a * u * u - q; // q moved with the wrong sign
      if (b === 0 || Math.abs(b) > 16 || new Set([T, T1, T2, T3]).size < 4) continue;
      if ([T, T1, T2, T3].some((value) => Math.abs(value) > 40 || !Number.isInteger(value))) continue;
      break;
    }
    const none = t.chance(0.6);
    const asEquation = t.chance(0.4);
    // Discriminant (b − p)² − 4a(k − q) = E − 4ak.
    const E = (b - p) * (b - p) + 4 * a * q;
    const noneDir = a > 0 ? ">" : "<";
    const flip = (dir) => (dir === ">" ? "<" : ">");
    const dir = none ? noneDir : flip(noneDir);
    const show = (d, value) => `k ${d} ${num(value)}`;
    const want = none ? "no real solutions" : "exactly two real solutions";
    const noun = asEquation ? "equation" : "system";
    const discText = poly([-4 * a, E], "k");

    // A 2 × 2 design: the true threshold and one slip's threshold, each in both
    // directions, so no pair of choices singles out the key.
    const slips = [
      [T1, `uses the discriminant of ${terms([[a, "x²"], [b, "x"]])} + k alone, without first moving ${lin(p, q)} to the left side`],
      [T1, `uses the discriminant of ${terms([[a, "x²"], [b, "x"]])} + k alone, without first moving ${lin(p, q)} to the left side`],
      [T2, `moves ${term(p, "x")} to the left without changing its sign, so the x-coefficient is ${num(b + p)} rather than ${num(b - p)}`],
      [T3, `moves ${num(q)} to the left without changing its sign, so the constant term is k ${signed(q)}`],
    ];
    const [Tx, slip] = t.pick(slips);
    const slipText = `${slip[0].toUpperCase()}${slip.slice(1)}`;
    const wrongSets = [
      [flip(dir), T, none
        ? "Reverses the inequality; these values of k make the discriminant positive and give two real solutions."
        : "Reverses the inequality; these values of k make the discriminant negative and give no real solutions."],
      [dir, Tx, `${slipText}.`],
      [flip(dir), Tx, `${slipText}, and also reverses the inequality.`],
    ];

    return {
      responseType: "multiple-choice",
      stimulus: {
        type: "equations",
        content: asEquation
          ? `${terms([[a, "x²"], [b, "x"]])} + k = ${lin(p, q)}`
          : `y = ${terms([[a, "x²"], [b, "x"]])} + k\ny = ${lin(p, q)}`,
      },
      stem:
        `In the given ${asEquation ? "equation" : "system of equations"}, k is a constant. Which of the following ` +
        `describes all values of k for which the ${noun} has ${want}?`,
      correct: show(dir, T),
      wrong: wrongSets.map(([d, value, reason]) => [show(d, value), reason]),
      explanation:
        `Collecting every term on one side gives ${terms([[a, "x²"], [b - p, "x"]])} + (k ${signed(-q)}) = 0. ` +
        `Its discriminant is (${num(b - p)})² ${MINUS} 4(${num(a)})(k ${signed(-q)}) = ${discText}. ` +
        `${none ? "No real solutions requires this to be negative" : "Two real solutions requires this to be positive"}: ` +
        `${discText} ${none ? "<" : ">"} 0. Solving${-4 * a < 0 ? " (dividing by a negative number reverses the inequality)" : ""} gives k ${dir} ${num(T)}.`,
      steps: [
        `Set the expressions equal and move every term to the left: ${terms([[a, "x²"], [b - p, "x"]])} + (k ${signed(-q)}) = 0.`,
        `Discriminant: (${num(b - p)})² ${MINUS} 4(${num(a)})(k ${signed(-q)}) = ${discText}.`,
        `${none ? "No real solutions" : "Two real solutions"}: ${discText} ${none ? "<" : ">"} 0.`,
        `Divide by ${num(-4 * a)}${-4 * a < 0 ? " and reverse the inequality" : ""}: k ${dir} ${num(T)}.`,
      ],
      principles: [
        "The number of real solutions of a line-and-parabola system equals the number of real roots of the combined quadratic.",
        "Dividing both sides of an inequality by a negative number reverses it.",
      ],
      trap:
        "The discriminant belongs to the combined equation, not to the parabola alone, and its sign must match the " +
        "condition asked: negative for none, positive for two.",
      hint: "Put everything on one side first. For which values of k does that quadratic have the required number of roots?",
      verify: () => {
        const count = (kv) => realRoots(...sampleQuadratic((x) => a * x * x + b * x + kv - (p * x + q))).length;
        const target = none ? 0 : 2;
        const member = (d, value, kv) => (d === ">" ? kv > value : d === "<" ? kv < value : kv === value);
        const grid = [];
        for (let kv = T - 30; kv <= T + 30; kv += 0.5) grid.push(kv);
        // The key describes exactly the values with the required count.
        if (!grid.every((kv) => (count(kv) === target) === member(dir, T, kv))) return false;
        // Every offered alternative disagrees with the truth somewhere.
        return wrongSets.every(([d, value]) =>
          grid.some((kv) => (count(kv) === target) !== member(d, value, kv)));
      },
    };
  }

  const discriminantParameter = {
    id: "discriminant-parameter",
    domain: "Advanced Math",
    skill: "Systems of equations",
    subskill: "linear-quadratic systems",
    title: "Line and parabola with a parameter",
    recognize:
      "The intersections of a line and a parabola are the roots of the one quadratic formed by setting them equal; " +
      "collect every term on one side, then read the number of solutions from that quadratic's discriminant.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 2 },
    tricks: ["reversed-condition", "sign-error", "intermediate-value", "wrong-quantity"],
    build(t) {
      const variant = t.int(0, 2);
      const numeric = t.chance(0.45);
      const make = [() => tangentSlope(t, numeric), () => tangentPoint(t, numeric), () => solutionRange(t)][variant];
      return { estimatedSeconds: 120, ...drawUntilDistinct(make) };
    },
  };

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
      naiveWhy: `reading the solutions ${num(-p)} and ${ratio(-r / q1)} off the factors on the left, as if the right side were 0`,
      productSign: (p * r + w) / q1,
      productSignWhy: `Moves ${num(w)} to the left without changing its sign.`,
      extraSum: null,
      expand: `Expand the left side: (${lin(1, p)})(${lin(q1, r)}) = ${poly([q1, q1 * p + r, p * r])}.`,
    };
  }

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
        const naive = `Takes r + s = ${ratio(Sn)} and rs = ${ratio(Pn)} by ${eq.naiveWhy}.`;
        const table = {
          sum: {
            stem: "What is the sum of the solutions to the given equation?",
            value: sum,
            fromRoots: (r, s) => r + s,
            finish: `Sum of the solutions: −B/A = ${MINUS}(${num(B)})/${paren(A)} = ${ratio(sum)}.`,
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
            finish: `Product of the solutions: C/A = ${num(C)}/${paren(A)}${`${num(C)}/${paren(A)}` === ratio(product) ? "" : ` = ${ratio(product)}`}.`,
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
            finish: `r² + s² = (r + s)² − 2rs = (${ratio(sum)})² − 2(${ratio(product)}) = ${ratio(sum * sum - 2 * product)}.`,
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
            finish: `(r − s)² = (r + s)² − 4rs = (${ratio(sum)})² − 4(${ratio(product)}) = ${ratio(sum * sum - 4 * product)}.`,
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
            finish: `1/r + 1/s = (r + s)/(rs) = (${ratio(sum)})/(${ratio(product)}) = ${ratio(sum / product)}.`,
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
        if (Math.abs(value) > (derived ? 60 : 30) || denominator(value) > (derived ? 4 : 6)) continue;
        if (chosen.wrong.some(([wrongValue]) =>
          !Number.isFinite(wrongValue) || Math.abs(wrongValue) > 120 || denominator(wrongValue) > 16)) continue;
        const asNumeric = numeric && gridable(value);
        if (numeric && !asNumeric && attempt < 80) continue;
        const rearranged = `${poly([A, B, C])} = 0`;
        const record = {
          responseType: asNumeric ? "numeric" : "multiple-choice",
          stimulus: { type: "equations", content: eq.text },
          stem: chosen.stem,
          correct: asNumeric ? tidy(value) : ratio(value),
          wrong: chosen.wrong.map(([wrongValue, reason]) => [ratio(wrongValue), reason]),
          explanation:
            `Moving every term to the left gives ${rearranged}, which has two real solutions because ` +
            `its discriminant, ${disc}, is positive. For Ax² + Bx + C = 0 the solutions have sum −B/A = ` +
            `${ratio(sum)} and product C/A = ${ratio(product)}. ${chosen.finish}`,
          steps: [
            eq.expand,
            `Move every term to the left: ${rearranged}.`,
            `Read the coefficients: sum of the solutions ${ratio(sum)}, product ${ratio(product)}.`,
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
        if (enoughChoices(record)) return record;
      }
    },
  };

  /* ========================================== unknown-coefficient-product */

  // "(ax + 3)(bx − 5) = 12x² + kx − 15"
  function productIdentity(P, m, n) {
    return `(ax ${signed(m)})(bx ${signed(n)}) = ${terms([[P, "x²"], [1, "kx"], [m * n, ""]])}`;
  }

  // "3(−2)", or "(−2)" when the coefficient is 1.
  const times = (coefficient, value) => (coefficient === 1 ? `(${num(value)})` : `${coefficient}(${num(value)})`);

  const pairText = (x, y) => `${num(Math.min(x, y))} and ${num(Math.max(x, y))}`;

  // Pairs (a, b) with a·b = P that also meet `condition`, via the quadratic formula.
  function kValues(P, m, n, candidates) {
    const found = new Set();
    for (const [a, b] of candidates) {
      if (!S.approx(a * b, P)) return null;
      // Expand at x = 1 and x = 2 and read k from Px² + kx + Q.
      const k = (a + m) * (b + n) - P - m * n;
      if (!S.approx((2 * a + m) * (2 * b + n), 4 * P + 2 * k + m * n)) return null;
      found.add(tidy(k));
    }
    return found;
  }

  // Unknown leading coefficients a, b with a + b fixed: two assignments, two
  // values of k. In some repetitions a > b is also given, which leaves one
  // value, so the union of the two singletons is not always the key.
  function allPossible(t) {
    let a;
    let b;
    let m;
    let n;
    for (;;) {
      a = t.chance(0.7) ? t.int(1, 7) : t.nonzero(-6, 6);
      b = t.chance(0.7) ? t.int(1, 7) : t.nonzero(-6, 6);
      m = t.nonzero(-9, 9);
      n = t.nonzero(-9, 9);
      if (Math.abs(a) === Math.abs(b) || a + b === 0 || m === n || Math.abs(m) === Math.abs(n)) continue;
      if (m > 0 && n > 0) continue;
      if (a * n + b * m === 0 || b * n + a * m === 0) continue;
      break;
    }
    const ordered = t.chance(0.4);
    if (ordered && a < b) [a, b] = [b, a];
    const P = a * b;
    const s = a + b;
    const k1 = a * n + b * m;
    const k2 = b * n + a * m;
    // Sign slip: the negative constant treated as positive.
    const [m2, n2] = n < 0 ? [m, -n] : [-m, n];
    const slip1 = a * n2 + b * m2;
    const slip2 = b * n2 + a * m2;
    const slipReason = `Treats ${num(n < 0 ? n : m)} as ${num(n < 0 ? -n : -m)} when forming the x-term, which flips one cross product.`;
    const kExpr = terms([[n, "a"], [m, "b"]]);
    const expanded = `abx² + (${kExpr})x ${signed(m * n)}`;
    const cases =
      `(a, b) = (${num(a)}, ${num(b)}) gives k = ${num(k1)}, and (a, b) = (${num(b)}, ${num(a)}) gives k = ${num(k2)}.`;
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: productIdentity(P, m, n) },
      stem:
        `The given equation is true for all values of x, where a, b, and k are constants${ordered ? " and a > b" : ""}. ` +
        `If a + b = ${num(s)}, which of the following gives all possible values of k?`,
      correct: ordered ? `${num(k1)} only` : pairText(k1, k2),
      wrong: ordered
        ? [
          [pairText(k1, k2), `Lists both assignments of a and b, but a > b rules out a = ${num(b)}, b = ${num(a)}.`],
          [`${num(k2)} only`, `Takes a = ${num(b)} and b = ${num(a)}, the assignment that a > b rules out.`],
          [`${num(slip1)} only`, slipReason],
          [`${num(m + n)} only`, "Adds the constants as if both leading coefficients were 1."],
        ]
        : [
          [`${num(k1)} only`, `Takes a = ${num(a)} and b = ${num(b)} and never tries the swapped assignment a = ${num(b)}, b = ${num(a)}.`],
          [`${num(k2)} only`, `Takes a = ${num(b)} and b = ${num(a)} and never tries the swapped assignment a = ${num(a)}, b = ${num(b)}.`],
          [pairText(slip1, slip2), slipReason],
          [`${num(m + n)} only`, "Adds the constants as if both leading coefficients were 1."],
        ],
      explanation:
        `Expanding gives ${expanded}. Matching coefficients: ab = ${num(P)} and k = ${kExpr}. ` +
        `With a + b = ${num(s)}, a and b are the two solutions of ${poly([1, -s, P], "t")} = 0, namely ${num(a)} and ` +
        `${num(b)}. ${cases} ` +
        (ordered
          ? `Only the first assignment has a > b, so k = ${num(k1)} is the only possible value.`
          : "Nothing in the conditions says which unknown is which, so both values are possible."),
      steps: [
        `Expand: ${productIdentity(P, m, n).split(" = ")[0]} = ${expanded}.`,
        `Match coefficients: ab = ${num(P)} and k = ${kExpr}.`,
        `a and b solve ${poly([1, -s, P], "t")} = 0, so {a, b} = {${num(a)}, ${num(b)}}.`,
        ordered
          ? `a > b forces a = ${num(a)} and b = ${num(b)}, so k = ${num(k1)} only.`
          : `Either order is allowed: (${num(a)}, ${num(b)}) gives k = ${num(k1)} and (${num(b)}, ${num(a)}) gives k = ${num(k2)}.`,
      ],
      principles: [
        "Two polynomials are equal for all x only when their corresponding coefficients are equal.",
        "A sum and a product determine two numbers only as an unordered pair; a further condition is needed to tell them apart.",
      ],
      trap: ordered
        ? "Swapping a and b gives a second value of k, but the condition a > b allows only one of the two assignments."
        : "Finding one assignment of a and b feels like the answer, but the conditions are symmetric, so the swapped assignment is just as valid.",
      hint: "Match coefficients, then ask whether the conditions decide which unknown is which.",
      verify: () => {
        const roots = realRoots(1, -s, P);
        if (roots.length !== 2) return false;
        const assignments = [[roots[0], roots[1]], [roots[1], roots[0]]]
          .filter(([aa, bb]) => !ordered || aa > bb);
        const ks = kValues(P, m, n, assignments);
        return Boolean(ks) && (ordered
          ? ks.size === 1 && ks.has(k1)
          : ks.size === 2 && ks.has(k1) && ks.has(k2));
      },
    };
  }

  // Unknown leading coefficients with one extra condition that fixes the order.
  function orderedCoefficients(t) {
    let a;
    let b;
    let m;
    let n;
    const byDifference = t.chance(0.5);
    for (;;) {
      if (byDifference) {
        a = t.int(1, 8);
        b = t.int(1, 8);
      } else {
        a = t.nonzero(-5, 8);
        b = t.nonzero(-5, 8);
        if (a < b) [a, b] = [b, a];
      }
      m = t.nonzero(-9, 9);
      n = t.nonzero(-9, 9);
      if (a === b || a + b === 0 || m === n || Math.abs(m) === Math.abs(n) || (m > 0 && n > 0)) continue;
      if (Math.abs(a * n + b * m) > 99 || a * n + b * m === 0) continue;
      break;
    }
    const P = a * b;
    const k = a * n + b * m;
    const swapped = b * n + a * m;
    const s = a + b;
    const d = a - b;
    const condition = byDifference
      ? `where a, b, and k are constants and a and b are positive. If a ${MINUS} b = ${num(d)}`
      : `where a, b, and k are constants and a > b. If a + b = ${num(s)}`;
    const solving = byDifference
      ? `Substituting a = b ${signed(d)} into ab = ${num(P)} gives ${poly([1, d, -P], "b")} = 0, whose positive solution is b = ${num(b)}; then a = ${num(a)}.`
      : `a and b are the solutions of ${poly([1, -s, P], "t")} = 0, namely ${num(a)} and ${num(b)}; since a > b, a = ${num(a)} and b = ${num(b)}.`;
    return {
      responseType: "numeric",
      stimulus: { type: "equations", content: productIdentity(P, m, n) },
      stem: `The given equation is true for all values of x, ${condition}, what is the value of k?`,
      correct: k,
      explanation:
        `Expanding gives abx² + (${terms([[n, "a"], [m, "b"]])})x ${signed(m * n)}, so ab = ${num(P)} and ` +
        `k = ${terms([[n, "a"], [m, "b"]])}. ${solving} So k = ${num(n)}(${num(a)}) ${signed(m)}(${num(b)}) = ${num(k)}.`,
      steps: [
        `Expand: (ax ${signed(m)})(bx ${signed(n)}) = abx² + (${terms([[n, "a"], [m, "b"]])})x ${signed(m * n)}.`,
        `Match coefficients: ab = ${num(P)} and k = ${terms([[n, "a"], [m, "b"]])}.`,
        solving,
        `k = ${num(n)}(${num(a)}) ${signed(m)}(${num(b)}) = ${num(k)}.`,
      ],
      principles: [
        "Two polynomials are equal for all x only when their corresponding coefficients are equal.",
        "In (ax + m)(bx + n), the x-coefficient pairs each leading coefficient with the other factor's constant: an + bm.",
      ],
      trap:
        `Pairing each leading coefficient with the wrong constant, or ignoring the condition that fixes the order, ` +
        `gives ${num(swapped)}${swapped === P ? "" : `; stopping at ab gives ${num(P)}`}.`,
      hint: "Match the coefficients of the two sides. Which condition tells a and b apart?",
      estimatedSeconds: 115,
      verify: () => {
        const candidates = byDifference
          ? realRoots(1, d, -P).filter((value) => value > 0).map((bb) => [bb + d, bb])
          : (() => {
            const roots = realRoots(1, -s, P);
            return roots.length === 2 ? [[Math.max(...roots), Math.min(...roots)]] : [];
          })();
        if (candidates.length !== 1 || candidates[0].some((value) => value <= 0 && byDifference)) return false;
        const ks = kValues(P, m, n, candidates);
        return Boolean(ks) && ks.size === 1 && ks.has(k);
      },
    };
  }

  // Known leading coefficients, integer constants: which k is achievable?
  function achievableK(t) {
    const [alpha, beta] = t.shuffle(t.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5]]));
    const Q = t.sign() * t.pick([6, 8, 10, 12, 14, 15, 18, 20]);
    const pairs = [];
    for (let p = -Math.abs(Q); p <= Math.abs(Q); p += 1) {
      if (p !== 0 && Q % p === 0) pairs.push([p, Q / p]);
    }
    const kOf = ([p, q]) => alpha * q + beta * p;
    const achievable = new Set(pairs.map(kOf));
    const [p0, q0] = t.pick(pairs);
    const key = kOf([p0, q0]);
    const lead = (c) => term(c, "x");
    const candidates = [];
    const add = (value, reason) => {
      if (!achievable.has(value) && value !== key && !candidates.some(([v]) => v === value)) candidates.push([value, reason]);
    };
    const order = t.shuffle(pairs);
    const leads = [alpha, beta].filter((value) => value !== 1);
    const monicWhy = leads.length === 2
      ? `Adds p and q, as if the leading coefficients ${alpha} and ${beta} were both 1.`
      : `Adds p and q, as if the leading coefficient ${leads[0]} were 1.`;
    const monic = order.find(([p, q]) => !achievable.has(p + q));
    if (monic) add(monic[0] + monic[1], monicWhy);
    const slip = order.find(([p, q]) => !achievable.has(alpha * q - beta * p));
    if (slip) add(alpha * slip[1] - beta * slip[0], `Subtracts the cross product ${term(beta, "p")} instead of adding it, a sign lost while expanding.`);
    const single = order.find(([p]) => !achievable.has(beta * p));
    if (single) add(beta * single[0], `Keeps only the cross product ${term(beta, "p")} and drops ${term(alpha, "q")}.`);
    for (const [p, q] of order) add(p + q, monicWhy);
    const identity = `(${lead(alpha)} + p)(${lead(beta)} + q) = ${terms([[alpha * beta, "x²"], [1, "kx"], [Q, ""]])}`;
    const kExpr = terms([[alpha, "q"], [beta, "p"]]);
    const allK = [...achievable].sort((x, y) => x - y).map(num).join(", ");
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: identity },
      stem:
        "In the given equation, p, q, and k are constants, and p and q are integers. If the equation is true for " +
        "all values of x, which of the following could be the value of k?",
      correct: key,
      wrong: candidates,
      explanation:
        `Expanding the left side gives ${alpha * beta}x² + (${kExpr})x + pq, so pq = ${num(Q)} and k = ${kExpr}. ` +
        `k is not fixed: each integer pair (p, q) with pq = ${num(Q)} gives its own value, and the possible values ` +
        `are ${allK}. For (p, q) = (${num(p0)}, ${num(q0)}), k = ${times(alpha, q0)} + ${times(beta, p0)} = ${num(key)}. ` +
        "None of the other choices is produced by any pair.",
      steps: [
        `Expand: (${lead(alpha)} + p)(${lead(beta)} + q) = ${alpha * beta}x² + (${kExpr})x + pq.`,
        `Match coefficients: pq = ${num(Q)} and k = ${kExpr}.`,
        `List the integer pairs with pq = ${num(Q)}; they give k = ${allK}.`,
        `Only ${num(key)} is among the choices, from (p, q) = (${num(p0)}, ${num(q0)}).`,
      ],
      principles: [
        "Two polynomials are equal for all x only when their corresponding coefficients are equal.",
        "When a condition allows several cases, a value that could occur needs only one case to produce it.",
      ],
      trap:
        "Adding p and q treats both factors as starting with x; the leading coefficients weight each constant in the " +
        "x-term, and each one multiplies the other factor's constant.",
      hint: "Match the coefficients. How many integer pairs could p and q be?",
      verify: () => {
        const found = new Set();
        for (let p = -Math.abs(Q); p <= Math.abs(Q); p += 1) {
          if (p === 0 || Q % p) continue;
          const q = Q / p;
          // Evaluate both sides at x = 1: (α + p)(β + q) = αβ + k + Q.
          found.add((alpha + p) * (beta + q) - alpha * beta - Q);
        }
        return found.has(key) && candidates.slice(0, 3).length === 3 &&
          candidates.every(([value]) => !found.has(value));
      },
    };
  }

  const unknownCoefficientProduct = {
    id: "unknown-coefficient-product",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "factoring",
    title: "Binomial product with unknown coefficients",
    recognize:
      "An identity in x fixes every coefficient; the x-coefficient pairs each leading coefficient with the other " +
      "factor's constant, and the conditions may allow more than one assignment of the unknowns.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 2 },
    tricks: ["must-vs-could", "sign-error", "intermediate-value"],
    build(t) {
      const roll = t.random();
      const make = roll < 0.35 ? allPossible : roll < 0.65 ? orderedCoefficients : achievableK;
      return { estimatedSeconds: 120, ...drawUntilDistinct(() => make(t)) };
    },
  };

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
    const flippedNice = flipped !== null && denominator(flipped) <= 2 && flipped !== a;
    const wrong = askSum
      ? [
        flippedNice
          ? [ratio(tidy(flipped * (1 + h) * (1 + h) + v)), `Writes the vertex form as a(x ${signed(h)})² ${signed(v)}, flipping the sign of the vertex's x-coordinate, and finds a from that.`]
          : [a * (1 + h) * (1 + h) + v, `Expands the vertex form as a(x ${signed(h)})² ${signed(v)}, flipping the sign of the vertex's x-coordinate.`],
        [c, "Gives c, the value of f(0), rather than a + b + c."],
        [a, "Stops after finding a."],
        [a - 2 * h + h * h + v, `Multiplies only the x² term by ${num(a)} when expanding a(${lin(1, -h)})².`],
        [v, "Gives the y-coordinate of the vertex."],
      ]
      : [
        flippedNice
          ? [ratio(tidy(2 * flipped * h)), `Writes the vertex form as a(x ${signed(h)})² ${signed(v)}, flipping the sign of the vertex's x-coordinate, and finds a from that.`]
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
    if (flipped !== null && denominator(flipped) <= 2 && flipped !== a) {
      wrong.push([ratio(tidy(-flipped * half * half)), `Writes f(x) = a(x ${signed(r1)})(x ${signed(r2)}), flipping the signs of the zeros, and finds a from that.`]);
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
      return { estimatedSeconds: 120, ...drawUntilDistinct(() => make(t, numeric, style)) };
    },
  };

  return [discriminantParameter, rootSumProduct, unknownCoefficientProduct, vertexFromConditions];
});
