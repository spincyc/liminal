(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/advanced-math"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Systems of equations templates (Advanced Math), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, signed, lin, approx, poly } = S;
  const {
    drawUntilDistinct, rootFactor, lead, ratioHard, drawUntilDistinctHard, term, plus, terms,
    sampleQuadratic, realRoots, ratio,
  } = C;

  /* =========================================== parabola-line-solution-check */

  function orderedPairItem(t) {
    const a = t.pick([1, 1, 1, -1, 2]);
    const r1 = t.int(-5, 5);
    const r2 = t.int(-5, 5);
    if (r1 === r2) return null;
    const m = t.nonzero(-4, 4);
    const d = t.int(-8, 8);
    const B = m - a * (r1 + r2);
    const C = d + a * r1 * r2;
    const P = (x) => a * x * x + B * x + C;
    const L = (x) => m * x + d;
    const parabola = `y = ${poly([a, B, C])}`;
    const standard = t.chance(0.45);
    const line = standard ? `y ${m > 0 ? MINUS : "+"} ${Math.abs(m) === 1 ? "" : Math.abs(m)}x = ${num(d)}` : `y = ${lin(m, d)}`;
    const r = t.pick([r1, r2]);
    const pool = [-4, -3, -2, -1, 0, 1, 2, 3, 4].filter((x) => x !== r1 && x !== r2);
    const [x3, x4, x5] = t.sample(pool, 3);
    const isSolution = ([x, y]) => approx(P(x), y) && approx(L(x), y);
    // Points that satisfy only one equation, the mistake this item tests; the
    // swapped solution appears only sometimes, so the key is not usually the
    // choice whose numbers the others repeat.
    const third = t.chance(0.2)
      ? [[L(r), r], `Swaps the coordinates of the solution (${num(r)}, ${num(L(r))}).`]
      : t.chance(0.5)
        ? [[x5, P(x5)], `Satisfies ${parabola} but not ${line}.`]
        : [[x5, L(x5)], `Satisfies ${line} but not ${parabola}.`];
    const offers = [
      [[x3, P(x3)], `Satisfies ${parabola} but not ${line}.`],
      [[x4, L(x4)], `Satisfies ${line} but not ${parabola}.`],
      third,
    ].filter(([pair]) => !isSolution(pair));
    if ([P(x3), L(x4), L(r), P(x5), L(x5)].some((y) => Math.abs(y) > 60)) return null;
    const first = t.chance(0.5);
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: first ? `${parabola}\n${line}` : `${line}\n${parabola}` },
      stem: "Which ordered pair (x, y) is a solution to the given system of equations?",
      correct: S.point(r, L(r)),
      wrong: offers.map(([[x, y], why]) => [S.point(x, y), why]),
      explanation:
        `A solution must satisfy both equations. At x = ${num(r)}, ${standard ? "the line (rewritten as y = " + lin(m, d) + ")" : "the line"} gives ` +
        `y = ${num(L(r))} and the parabola gives y = ${num(P(r))}, so (${num(r)}, ${num(L(r))}) satisfies both. Each other choice fails at least one equation.`,
      steps: [
        "A solution of a system makes every equation true at the same time.",
        `Substitute (${num(r)}, ${num(L(r))}) into each equation: both are true.`,
        "Each other choice makes at least one of the equations false.",
      ],
      principles: ["An ordered pair solves a system only if it satisfies every equation in the system."],
      trap: "A point on only one of the two graphs is not a solution, and swapping x and y changes the point.",
      hint: "Test each choice in both equations, not just one.",
      verify: () => isSolution([r, L(r)]) && offers.every(([pair]) => !isSolution(pair)),
    };
  }

  function horizontalLineItem(t) {
    const a = t.int(1, 4);
    const s = t.int(2, 9);
    const c = t.nonzero(-20, 20);
    const k = a * s * s + c;
    return {
      responseType: "numeric",
      stimulus: { type: "equations", content: `y = ${poly([a, 0, c])}\ny = ${num(k)}` },
      stem: "If (x, y) is a solution to the given system of equations and x > 0, what is the value of x?",
      correct: s,
      explanation:
        `Substituting y = ${num(k)} into the first equation gives ${num(k)} = ${poly([a, 0, c])}, so ` +
        `${a === 1 ? "" : `${a}x² = ${a * s * s} and `}x² = ${s * s}. Then x = ±${s}, and the positive value is ${s}.`,
      steps: [
        `Substitute y = ${num(k)}: ${num(k)} = ${poly([a, 0, c])}.`,
        `Isolate x²: x² = ${s * s}.`,
        `x = ${s} or x = ${MINUS}${s}; with x > 0, x = ${s}.`,
      ],
      principles: ["When one equation gives y directly, substitute it into the other equation."],
      trap: `Stopping at x² = ${s * s} gives ${s * s}, which is x², not x.`,
      hint: "The second equation already tells you y.",
      verify: () => {
        const found = [];
        for (let x = 1; x <= 30; x += 1) if (approx(a * x * x + c, k)) found.push(x);
        return found.length === 1 && found[0] === s;
      },
    };
  }

  /* =================================================== line-parabola-solve */

  function lineParabolaItem(t, ask, numeric) {
    const a = t.pick([1, 1, 1, 2, -1]);
    const r1 = t.int(-6, -1);
    const r2 = t.int(1, 6);
    const m = t.nonzero(-5, 5);
    const d = t.int(-9, 9);
    const B = m - a * (r1 + r2);
    const C = d + a * r1 * r2;
    const L = (x) => m * x + d;
    const P = (x) => a * x * x + B * x + C;
    const [y1, y2] = [L(r1), L(r2)];
    const layout = t.pick(["slope", "slope", "standard", "yfirst"]);
    let line;
    if (layout === "slope") line = `y = ${lin(m, d)}`;
    else if (layout === "standard") line = `${lin(m, 0)} ${MINUS} y = ${num(-d)}`;
    else line = `y ${m > 0 ? MINUS : "+"} ${Math.abs(m) === 1 ? "" : Math.abs(m)}x = ${num(d)}`;
    const combined = poly([a, B - m, C - d]);
    const factored = `${lead(a)}${rootFactor(r1)}${rootFactor(r2)}`;
    const baseSteps = [
      `${layout === "slope" ? "Set" : `Rewrite the line as y = ${lin(m, d)}, then set`} the two expressions for y equal and collect terms: ${combined} = 0.`,
      `Factor: ${factored} = 0, so x = ${num(r1)} or x = ${num(r2)}.`,
    ];
    const principles = ["The solutions of a line-and-parabola system are found by setting the two expressions for y equal; each root gives one intersection point."];
    const hint = "Both equations give y. What equation in x alone do they produce together?";
    let stem;
    let key;
    let wrong;
    let lastStep;
    let trap;
    if (ask === "sum") {
      stem = "The graphs of the given equations in the xy-plane intersect at the points (x₁, y₁) and (x₂, y₂). What is the value of y₁ + y₂?";
      key = y1 + y2;
      wrong = [
        [r1 + r2, "Adds the x-coordinates of the intersection points instead of the y-coordinates."],
        [L(r1 + r2), `Substitutes the sum of the x-coordinates, ${num(r1 + r2)}, into the line once, so the constant ${num(d)} is counted only once.`],
        [y2, "Gives the y-coordinate of only one intersection point."],
        [L(-r1) + L(-r2), "Reads the roots of the combined quadratic with the wrong signs before substituting."],
      ];
      lastStep = `y₁ + y₂ = ${num(y1)} + ${paren(y2)} = ${num(key)}.`;
      trap = `${num(r1 + r2)} is the sum of the x-coordinates, found on the way; the question asks about y.`;
    } else {
      const positive = ask === "positive";
      const x = positive ? r2 : r1;
      const other = positive ? r1 : r2;
      stem = `If (x, y) is a solution to the given system of equations and x ${positive ? ">" : "<"} 0, what is the value of y?`;
      key = L(x);
      wrong = [
        [x, "Gives the x-coordinate of the solution instead of the y-coordinate."],
        [L(other), `Uses the other solution, where x ${positive ? "<" : ">"} 0.`],
        [L(-other), `Reads the roots of the combined quadratic with the wrong signs, taking x = ${num(-other)}.`],
      ];
      lastStep = `With x = ${num(x)}, y = ${num(m)}(${num(x)}) ${signed(d)} = ${num(key)}.`;
      trap = `x = ${num(x)} is the intermediate value; the question asks for y.`;
    }
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: `y = ${poly([a, B, C])}\n${line}` },
      stem,
      correct: key,
      wrong: numeric ? undefined : wrong,
      explanation: `${baseSteps.join(" ")} ${lastStep}`,
      steps: [...baseSteps, lastStep],
      principles,
      trap,
      hint,
      verify: () => {
        const xs = [];
        for (let x = -20; x <= 20; x += 1) if (P(x) === L(x)) xs.push(x);
        if (xs.length !== 2 || xs[0] !== r1 || xs[1] !== r2) return false;
        if (ask === "sum") return P(xs[0]) + P(xs[1]) === key;
        const chosen = xs.find((x) => (ask === "positive" ? x > 0 : x < 0));
        return P(chosen) === key;
      },
    };
  }

  /* ================================================= nonlinear-system-solve */

  function twoParabolasItem(t, numeric) {
    const s = t.int(2, 5);
    const a1 = t.pick([1, 2, 3]);
    const a2 = t.pick([-2, -1, 1]);
    if (a1 === a2) return null;
    const c1 = t.int(-15, 15);
    const y0 = a1 * s * s + c1;
    const c2 = y0 - a2 * s * s;
    if (c1 === c2) return null;
    const moved = t.chance(0.4);
    const second = moved ? `y ${a2 > 0 ? MINUS : "+"} ${Math.abs(a2) === 1 ? "" : Math.abs(a2)}x² = ${num(c2)}` : `y = ${poly([a2, 0, c2])}`;
    const diff = a1 - a2;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: `y = ${poly([a1, 0, c1])}\n${second}` },
      stem: "If (x, y) is a solution to the given system of equations, what is the value of y?",
      correct: y0,
      wrong: numeric ? undefined : [
        [s * s, `Stops at x² = ${s * s}; that is the value of x², not y.`],
        [s, `Gives the positive value of x, ${s}, instead of y.`],
        [a1 * s + c1, `Substitutes x = ${s} but forgets to square it.`],
      ],
      explanation:
        `${moved ? `The second equation is y = ${poly([a2, 0, c2])}. ` : ""}Setting the expressions for y equal: ` +
        `${poly([a1, 0, c1])} = ${poly([a2, 0, c2])}, so ${diff === 1 ? "" : diff}x² = ${diff * s * s} and x² = ${s * s}. ` +
        `Both solutions, x = ±${s}, give y = ${a1}(${s * s}) ${signed(c1)} = ${num(y0)}.`,
      steps: [
        `Set the expressions for y equal: ${poly([a1, 0, c1])} = ${poly([a2, 0, c2])}.`,
        `Collect terms: ${diff === 1 ? "" : diff}x² = ${diff * s * s}, so x² = ${s * s}.`,
        `Substitute x² = ${s * s}: y = ${a1 === 1 ? "" : a1}(${s * s}) ${signed(c1)} = ${num(y0)}.`,
      ],
      principles: ["When both equations give y, setting them equal eliminates y; only x² is needed to find y here."],
      trap: `x² = ${s * s} is found on the way; y requires substituting it back.`,
      hint: "Both equations tell you y. What must be true of the two right-hand sides?",
      verify: () => {
        const xs = [];
        for (let x = -12; x <= 12; x += 1) if (a1 * x * x + c1 === a2 * x * x + c2) xs.push(x);
        return xs.length === 2 && xs.every((x) => a1 * x * x + c1 === y0);
      },
    };
  }

  function sumProductItem(t, askDiff, numeric) {
    const r1 = t.int(-6, 8);
    const r2 = t.int(-6, 9);
    if (r1 === r2 || r1 === 0 || r2 === 0 || r1 + r2 === 0 || r1 === -r2) return null;
    const lo = Math.min(r1, r2);
    const hi = Math.max(r1, r2);
    const Ssum = lo + hi;
    const Pprod = lo * hi;
    const content = t.chance(0.5) ? `x + y = ${num(Ssum)}\nxy = ${num(Pprod)}` : `xy = ${num(Pprod)}\ny = ${lin(-1, Ssum)}`;
    const quadratic = poly([1, -Ssum, Pprod]);
    const steps = [
      `From the linear equation, y = ${lin(-1, Ssum)}. Substitute: x(${lin(-1, Ssum)}) = ${num(Pprod)}.`,
      `Rearrange: ${quadratic} = 0, which factors as ${rootFactor(lo)}${rootFactor(hi)} = 0.`,
      `So (x, y) is (${num(lo)}, ${num(hi)}) or (${num(hi)}, ${num(lo)}); x > y gives x = ${num(hi)} and y = ${num(lo)}.`,
    ];
    const key = askDiff ? hi - lo : hi;
    const wrong = askDiff
      ? [
        [hi, `Stops at x = ${num(hi)} and never subtracts y.`],
        [Ssum, "Gives x + y, which the first equation already states, instead of x − y."],
        [lo - hi, "Subtracts in the wrong order, giving y − x."],
      ]
      : [
        [lo, "Gives y instead of x; the solution with x > y has the larger value as x."],
        [-lo, `Reads the roots of ${quadratic} = 0 with the wrong signs, then takes the larger.`],
        [Ssum, "Gives x + y instead of x."],
      ];
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content },
      stem: `If (x, y) is a solution to the given system of equations and x > y, what is the value of ${askDiff ? "x − y" : "x"}?`,
      correct: key,
      wrong: numeric ? undefined : wrong,
      explanation: `${steps.join(" ")}${askDiff ? ` Then x ${MINUS} y = ${num(hi)} ${MINUS} (${num(lo)}) = ${num(key)}.` : ""}`,
      steps: askDiff ? [...steps, `x ${MINUS} y = ${num(hi)} ${MINUS} (${num(lo)}) = ${num(key)}.`] : steps,
      principles: ["Solve one equation for a variable and substitute it into the other; a product condition then becomes a quadratic."],
      trap: askDiff ? `x = ${num(hi)} is an intermediate value, not x − y.` : "Both orderings satisfy the equations; the condition x > y decides which number is x.",
      hint: "Use the linear equation to write y in terms of x.",
      verify: () => {
        const found = [];
        for (let x = -30; x <= 30; x += 1) {
          const y = Ssum - x;
          if (x * y === Pprod && x > y) found.push([x, y]);
        }
        return found.length === 1 && (askDiff ? found[0][0] - found[0][1] : found[0][0]) === key;
      },
    };
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
      ratioHard(touchX),
      asEquation
        ? "Gives the equation's single solution x instead of the value of k."
        : "Gives the x-coordinate of the single intersection point instead of the value of k.",
    ]);
    wrong.push([2 * m, `Stops at ${num(b)} ${MINUS} k = ±${2 * m} and reports ${2 * m} without solving for k.`]);
    if (b + m > 0 && b - m < 0) {
      wrong.push([b + m, `Drops the 4 from the discriminant, solving (${num(b)} ${MINUS} k)² = ${m * m} instead of ${4 * m * m}.`]);
    }
    if (!asEquation) {
      wrong.push([ratioHard(k * touchX + d), "Gives the y-coordinate of the single intersection point instead of the value of k."]);
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
        `${ratioHard(touchX)}, is a different quantity from k.`,
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
        [ratioHard(p * vertexX + d), `Uses the parabola's own vertex, x = ${ratioHard(vertexX)}, as the point of contact without first subtracting the line.`],
      ]
      : [
        [ratioHard(vertexX), `Takes the x-coordinate of the parabola's own vertex, ${ratioHard(vertexX)}, without first subtracting the line.`],
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
        `The parabola's own vertex (x = ${ratioHard(vertexX)}) is not where the line touches it; only the combined ` +
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

  /* =================================================== line-circle-tangent */

  // Lines ax + by = c with a² + b² a perfect square, so the tangent values of
  // c are integers.
  const NORMALS = [[3, 4, 5], [4, 3, 5], [3, -4, 5], [4, -3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [5, -12, 13]];

  function circleText(h, v, r) {
    const part = (name, center) => (center === 0 ? `${name}²` : `(${name} ${signed(-center)})²`);
    return `${part("x", h)} + ${part("y", v)} = ${r * r}`;
  }

  function lineCircleItem(t, numeric) {
    const [a, b, n] = t.pick(NORMALS);
    const centered = t.chance(0.4);
    const h = centered ? 0 : t.nonzero(-4, 4);
    const v = centered ? 0 : t.nonzero(-4, 4);
    const r = t.int(1, n === 13 ? 2 : 4);
    const base = a * h + b * v;
    const high = base + n * r;
    const low = base - n * r;
    const lineText = `${term(a, "x")} ${plus(b, "y")} = c`;
    const ask = numeric ? "greater" : t.pick(["greater", "possible"]);
    const key = ask === "greater" || t.chance(0.5) ? high : low;
    const other = key === high ? low : high;
    const wrong = [
      [base + (key === high ? r : -r), `Sets the distance from the center to the line equal to ${r} but leaves out the factor √(${a}² + ${Math.abs(b)}²) = ${n}.`],
      [base + (key === high ? n * r * r : -n * r * r), `Uses the radius squared, ${r * r}, where the radius ${r} belongs.`],
      [base, "Makes the line pass through the center of the circle, which gives two intersection points."],
      [base + (key === high ? 2 * n * r : -2 * n * r), `Uses the diameter, ${2 * r}, as the distance from the center to the line.`],
      [base + (key === high ? n * n * r : -n * n * r), `Divides by ${a}² + ${Math.abs(b)}² = ${n * n} instead of its square root, ${n}, in the distance formula.`],
      [-a * h - b * v + (key === high ? n * r : -n * r), "Reverses the signs of the center's coordinates, reading (x − h) as a center at −h."],
    ];
    if (ask === "greater") wrong.push([low, "Gives the smaller of the two values of c that make the line tangent."]);
    // Offer slips from one side of the key, the other, or both, so the key is
    // sometimes the extreme value and sometimes not.
    const usable = wrong.filter(([value], index) => value !== key && (ask === "greater" || value !== other) &&
      wrong.findIndex(([v]) => v === value) === index);
    const above = usable.filter(([value]) => value > key);
    const below = usable.filter(([value]) => value < key);
    const plan = t.pick(["below", "above", "mixed", "mixed"]);
    const offered = plan === "below" && below.length >= 3 ? t.sample(below, 3)
      : plan === "above" && above.length >= 3 ? t.sample(above, 3) : t.sample(usable, 3);
    const stemEnd = ask === "greater"
      ? "the system has exactly one solution for two values of c. What is the greater of these two values?"
      : "for which of the following values of c does the system have exactly one solution?";
    const substituted = `x² + y² = ${r * r}`;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: `${circleText(h, v, r)}\n${lineText}` },
      stem: `In the given system of equations, c is a constant. ${ask === "greater" ? `In the xy-plane, ${stemEnd}` : `In the xy-plane, ${stemEnd}`}`,
      correct: key,
      wrong: numeric ? undefined : offered,
      explanation:
        `The first equation is a circle with center (${num(h)}, ${num(v)}) and radius ${r}; the second is a line. One solution means ` +
        `the line is tangent to the circle, so its distance from the center equals the radius: |${num(a)}(${num(h)}) ${signed(b)}(${num(v)}) ${MINUS} c|/√(${a}² + ${Math.abs(b)}²) = ${r}. ` +
        `So |${num(base)} ${MINUS} c| = ${n * r}, which gives c = ${num(high)} or c = ${num(low)}.`,
      steps: [
        `Read the circle: center (${num(h)}, ${num(v)}), radius √${r * r} = ${r}.`,
        "Exactly one solution means the line touches the circle at one point: the distance from the center to the line equals the radius.",
        `Distance from (${num(h)}, ${num(v)}) to ${lineText}: |${num(base)} ${MINUS} c|/${n} = ${r}, so |${num(base)} ${MINUS} c| = ${n * r}.`,
        `c = ${num(base)} ± ${n * r}: c = ${num(high)} or c = ${num(low)}.`,
      ],
      principles: [
        "A line and a circle meet in two, one, or no points; one point means the line is tangent, at a distance from the center equal to the radius.",
        "Substituting the line into the circle gives a quadratic whose discriminant is 0 exactly when the line is tangent.",
      ],
      trap: `The distance from the center to ${lineText} is |ah + bv − c| divided by √(a² + b²) = ${n}; leaving out the ${n}, or using ${r * r} for the radius, gives a value of c whose line cuts the circle twice.`,
      hint: "What does one solution say about how the line and the circle meet?",
      verify: () => {
        // Substitute the line into the circle and count real roots by the discriminant.
        const roots = (c) => {
          // y = (c − ax)/b; (x − h)² + ((c − ax)/b − v)² = r².
          const A = 1 + (a * a) / (b * b);
          const B = -2 * h - (2 * a * (c / b - v)) / b;
          const C = h * h + (c / b - v) ** 2 - r * r;
          const disc = B * B - 4 * A * C;
          return Math.abs(disc) < 1e-7 * Math.max(1, B * B) ? 1 : disc > 0 ? 2 : 0;
        };
        // Every offered value either misses tangency or, when the greater value
        // is asked for, is the smaller tangent value.
        return roots(high) === 1 && roots(low) === 1 && high > low && roots((high + low) / 2) === 2 &&
          (numeric || offered.every(([value]) => (ask === "greater" && value === low) || roots(value) !== 1));
      },
    };
  }

  /* ============================================= polynomial-level-count */

  // The graph of a polynomial with turning points at lattice points: a cubic
  // (turning points two units apart) or a quartic with two equal minima.
  function levelShape(t) {
    if (t.chance(0.55)) {
      const up = t.chance(0.5);
      const u = t.int(-3, 0);
      const w = u + 2;
      const drop = t.pick([2, 4, 6]);
      const C = t.int(-5, 3);
      const a = (up ? 1 : -1) * (drop / 4);
      // f(x) = a(x − w)²(x − u + 1) + C: turning points at u and w.
      const fn = (x) => a * (x - w) ** 2 * (x - u + 1) + C;
      const top = Math.max(fn(u), fn(w));
      const bottom = Math.min(fn(u), fn(w));
      const count = (k) => (k > top || k < bottom ? 1 : k === top || k === bottom ? 2 : 3);
      const describe = up
        ? `rises from the lower left to a turning point at (${num(u)}, ${num(fn(u))}), falls to a turning point at (${num(w)}, ${num(fn(w))}), and then rises to the upper right`
        : `falls from the upper left to a turning point at (${num(u)}, ${num(fn(u))}), rises to a turning point at (${num(w)}, ${num(fn(w))}), and then falls to the lower right`;
      return { kind: "cubic", fn, top, bottom, count, xs: [u, w], describe, window: [u - 3, w + 3] };
    }
    const p = t.int(-4, 0);
    const q = p + 4;
    const bump = t.pick([2, 4, 6, 8]);
    const a = bump / 16;
    const C = t.int(-6, 1);
    const fn = (x) => a * (x - p) ** 2 * (x - q) ** 2 + C;
    const top = C + bump;
    const bottom = C;
    const count = (k) => (k < bottom ? 0 : k === bottom ? 2 : k < top ? 4 : k === top ? 3 : 2);
    const describe = `falls from the upper left to a low point at (${num(p)}, ${num(C)}), rises to a high point at (${num(p + 2)}, ${num(top)}), ` +
      `falls to a low point at (${num(q)}, ${num(C)}), and then rises to the upper right`;
    return { kind: "quartic", fn, top, bottom, count, xs: [p, p + 2, q], describe, window: [p - 2, q + 2] };
  }

  const COUNT_WORDS = ["no", "exactly one", "exactly two", "exactly three", "exactly four"];

  function levelCountItem(t) {
    const shape = levelShape(t);
    const { top, bottom, count } = shape;
    const [xMin, xMax] = [Math.min(shape.window[0], -1), Math.max(shape.window[1], 1)];
    const yLow = Math.min(bottom - 3, -1);
    const yHigh = Math.max(top + 3, 1);
    // Candidate levels: the two turning values, a level strictly between them,
    // and levels above and below; plus the x-coordinate of a turning point.
    const levels = new Map();
    const add = (k, why) => {
      if (Number.isInteger(k) && !levels.has(k)) levels.set(k, why);
    };
    const between = t.int(bottom + 1, top - 1);
    add(top, "a turning value");
    add(bottom, "a turning value");
    add(between, "between the turning values");
    add(top + t.int(1, 3), "above the higher turning value");
    add(bottom - t.int(1, 3), "below the lower turning value");
    shape.xs.forEach((x) => add(x, "the x-coordinate of a turning point"));
    const byCount = new Map();
    for (const [k] of levels) {
      const c = count(k);
      if (!byCount.has(c)) byCount.set(c, []);
      byCount.get(c).push(k);
    }
    const counts = [...byCount.keys()].filter((c) => byCount.get(c).length >= 1);
    const want = t.pick(counts.filter((c) => c !== 0 || shape.kind === "quartic"));
    const keyK = t.pick(byCount.get(want));
    const others = [...levels.keys()].filter((k) => count(k) !== want);
    if (others.length < 3) return null;
    const chosen = t.sample(others, 3);
    const reason = (k) => {
      const c = count(k);
      const where = shape.xs.includes(k) && k !== top && k !== bottom && k !== between
        ? `Reads ${num(k)}, an x-coordinate of a turning point, as a level; the line y = ${num(k)} meets the graph ${c === 0 ? "nowhere" : `${COUNT_WORDS[c].replace("exactly ", "")} time${c === 1 ? "" : "s"}`}.`
        : `The horizontal line y = ${num(k)} meets the graph ${c === 0 ? "nowhere" : `at ${COUNT_WORDS[c].replace("exactly ", "")} point${c === 1 ? "" : "s"}`}, so that system has ${COUNT_WORDS[c]} solution${c === 1 ? "" : "s"}.`;
      return where;
    };
    const P = S.plane({ xMin, xMax, yMin: yLow, yMax: yHigh, unit: Math.min(30, 300 / (xMax - xMin)) });
    const alt =
      `The graph of y = f(x) in ${P.describe()}, drawn on a grid of unit squares. The curve ${shape.describe}.`;
    const figure = { svg: P.svg([...P.grid(), ...P.axes(), P.curve(shape.fn)], alt), alt, notToScale: false };
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure,
      stem:
        `The graph of y = f(x) is shown, where f is a polynomial function. In the xy-plane, the system consisting of ` +
        `y = f(x) and y = k, where k is a constant, has ${COUNT_WORDS[want]} solution${want === 1 ? "" : "s"}. Which of the following could be the value of k?`,
      correct: keyK,
      wrong: chosen.map((k) => [k, reason(k)]),
      explanation:
        `Each solution of the system is a point where the horizontal line y = k meets the graph. ` +
        `At k = ${num(keyK)} the line meets the graph at ${want === 0 ? "no points" : `${COUNT_WORDS[want].replace("exactly ", "")} point${want === 1 ? "" : "s"}`}. ` +
        `Lines through a turning value touch the graph there, which changes the count.`,
      steps: [
        "A solution of the system is an intersection of the graph with the horizontal line y = k.",
        `Read the turning values from the graph: ${num(bottom)} and ${num(top)}.`,
        `Slide a horizontal line: at y = ${num(keyK)} it meets the graph ${want === 0 ? "nowhere" : `${COUNT_WORDS[want].replace("exactly ", "")} time${want === 1 ? "" : "s"}`}.`,
        "Each other choice gives a different number of intersections.",
      ],
      principles: [
        "The solutions of f(x) = k are the x-coordinates where the line y = k meets the graph of f.",
        "A horizontal line through a turning point touches the graph there instead of crossing it.",
      ],
      trap: "A horizontal line through a turning value touches the graph, so it gives one fewer intersection than lines just past it.",
      hint: "Picture the horizontal line y = k moving up and down the graph.",
      estimatedSeconds: 110,
      verify: () => {
        // Count sign changes and touch points of f − k on a fine grid over a wide interval.
        const intersections = (k) => {
          let n = 0;
          const step = 1 / 64;
          for (let x = shape.window[0] - 20; x < shape.window[1] + 20; x += step) {
            const f0 = shape.fn(x) - k;
            const f1 = shape.fn(x + step) - k;
            if (Math.abs(f0) < 1e-12) n += 1;
            else if (f0 * f1 < 0) n += 1;
          }
          return n;
        };
        return intersections(keyK) === want && chosen.every((k) => intersections(k) !== want);
      },
    };
  }

  const parabolaLineSolutionCheck = {
    id: "parabola-line-solution-check",
    difficulty: "Easy",
    domain: "Advanced Math",
    skill: "Systems of equations",
    subskill: "linear-quadratic systems",
    title: "Solution of a parabola-and-line system",
    recognize: "A solution of a system satisfies every equation at once; check a candidate in both, or substitute one equation into the other.",
    rubric: { steps: 0, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "intermediate-value"],
    build(t) {
      const make = t.chance(0.7) ? () => orderedPairItem(t) : () => horizontalLineItem(t);
      return { estimatedSeconds: 65, ...drawUntilDistinct(make) };
    },
  };

  const lineParabolaSolve = {
    id: "line-parabola-solve",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Systems of equations",
    subskill: "linear-quadratic systems",
    title: "Line and parabola solved together",
    recognize: "Setting the two expressions for y equal gives one quadratic in x; its roots are the x-coordinates, and y comes from substituting back.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity", "sign-error"],
    build(t) {
      const numeric = t.chance(0.5);
      const ask = t.pick(["positive", "positive", "negative", "sum"]);
      return { estimatedSeconds: 95, ...drawUntilDistinct(() => lineParabolaItem(t, ask, numeric)) };
    },
  };

  const nonlinearSystemSolve = {
    id: "nonlinear-system-solve",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Systems of equations",
    subskill: "nonlinear systems",
    title: "Nonlinear system solved by substitution",
    recognize: "Replace one variable using the other equation; the result is a single equation in one variable, and its solution is usually a step before the quantity asked for.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity", "sign-error"],
    build(t) {
      const numeric = t.chance(0.4);
      const make = t.chance(0.5)
        ? () => twoParabolasItem(t, numeric)
        : () => sumProductItem(t, t.chance(0.45), numeric);
      return { estimatedSeconds: 90, ...drawUntilDistinct(make) };
    },
  };

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
      return { estimatedSeconds: 120, ...drawUntilDistinctHard(make) };
    },
  };

  /* ============================================ system-constant-from-solution */

  const constantFromSolution = {
    id: "system-constant-from-solution",
    domain: "Advanced Math",
    skill: "Systems of equations",
    subskill: "linear-quadratic systems",
    difficulty: "Easy",
    title: "Constant in a line-and-parabola system from a known solution",
    recognize:
      "A solution of a system makes every equation true, so substituting the given point into the equation that " +
      "contains the constant leaves one linear equation for that constant.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 0 },
    tricks: ["sign-error", "wrong-quantity"],
    build(t) {
      const unknown = t.pick(["slope", "intercept", "parabola"]);
      const numeric = t.chance(0.35);
      return drawUntilDistinct(() => {
        const p = t.nonzero(-5, 5);
        const A = t.pick([1, 1, 2, -1]);
        const B = t.int(-6, 6);
        const K = t.int(-12, 12);
        const q = A * p * p + B * p + K;
        const m = t.nonzero(-5, 5);
        const d = q - m * p;
        if (Math.abs(q) > 60 || Math.abs(d) > 40 || d === 0) return null;
        const parabola = unknown === "parabola"
          ? `y = ${terms([[A, "x²"], [B, "x"]])} + k`
          : `y = ${terms([[A, "x²"], [B, "x"], [K, ""]])}`;
        const line = unknown === "slope"
          ? `y = kx ${signed(d)}`
          : unknown === "intercept" ? `y = ${term(m, "x")} + k` : `y = ${terms([[m, "x"], [d, ""]])}`;
        const withK = unknown === "parabola" ? parabola : line;
        let key;
        let wrong;
        let work;
        if (unknown === "slope") {
          key = m;
          wrong = [
            [ratio((q + d) / p), `Moves ${num(d)} to the other side without changing its sign.`],
            [ratio(q / p), `Leaves out the constant ${num(d)} in the line's equation.`],
          ];
          if (Math.abs(p) !== 1) wrong.push([q - d, `Stops at ${lin(p, 0, "k")} = ${num(q - d)} without dividing by ${num(p)}.`]);
          if (q !== 0) wrong.push([ratio((p - d) / q), "Substitutes the point with its coordinates switched."]);
          work = [`${num(q)} = k(${num(p)}) ${signed(d)}`, `${lin(p, 0, "k")} = ${num(q - d)}`];
        } else if (unknown === "intercept") {
          key = d;
          wrong = [
            [q + m * p, `Adds ${paren(m)}(${num(p)}) to ${num(q)} instead of subtracting it.`],
            [q, "Gives the y-coordinate of the solution, not the value of k."],
            [m * p - q, "Subtracts in the wrong order, which gives the opposite of k."],
            [p - m * q, "Substitutes the point with its coordinates switched."],
          ];
          work = [`${num(q)} = ${paren(m)}(${num(p)}) + k`, `${num(q)} = ${num(m * p)} + k`];
        } else {
          key = K;
          wrong = [[q, "Gives the y-coordinate of the solution, not the value of k."]];
          if (B * p !== 0) wrong.push([q - A * p * p + B * p, `Loses the sign of ${term(B, "x")} when substituting x = ${num(p)}.`]);
          if (p < 0) wrong.push([q + A * p * p - B * p, `Evaluates (${num(p)})² as ${num(-p * p)}.`]);
          if (A !== 1) wrong.push([q - A * A * p * p - B * p, `Squares ${num(A)}(${num(p)}) instead of squaring only ${num(p)}.`]);
          wrong.push([q - A * p * p, `Leaves out the ${term(B, "x")} term.`]);
          work = [
            `${num(q)} = ${A === 1 ? "" : A === -1 ? MINUS : num(A)}(${num(p)})² ${B ? `${signed(B)}(${num(p)}) ` : ""}+ k`,
            `${num(q)} = ${num(A * p * p + B * p)} + k`,
          ];
        }
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 70,
          stimulus: { type: "equations", content: t.chance(0.5) ? `${parabola}\n${line}` : `${line}\n${parabola}` },
          stem: `In the given system of equations, k is a constant. If ${S.point(p, q)} is a solution to the system, what is the value of k?`,
          correct: key,
          wrong: numeric ? undefined : [wrong[0], ...t.shuffle(wrong.slice(1))],
          explanation:
            `A solution makes both equations true. Substituting x = ${num(p)} and y = ${num(q)} into ${withK} gives ` +
            `${work[0]}, so k = ${num(key)}.`,
          steps: [
            `Substitute x = ${num(p)} and y = ${num(q)} into ${withK}: ${work[0]}.`,
            `Simplify: ${work[1]}.`,
            `Solve: k = ${num(key)}.`,
          ],
          principles: ["A solution (x, y) of a system satisfies every equation in the system."],
          trap: `The point gives x = ${num(p)} and y = ${num(q)}; substitute each into its own place, keeping signs.`,
          hint: "Which equation contains k? Put the point into that one.",
          verify: () => {
            // With k = key, the point must satisfy both displayed equations.
            const k = key;
            const parabolaY = A * p * p + B * p + (unknown === "parabola" ? k : K);
            const lineY = (unknown === "slope" ? k : m) * p + (unknown === "intercept" ? k : d);
            return approx(parabolaY, q) && approx(lineY, q);
          },
        };
      });
    },
  };

  /* =================================================== system-square-identity */

  const squareIdentity = {
    id: "system-square-identity",
    domain: "Advanced Math",
    skill: "Systems of equations",
    subskill: "nonlinear systems",
    difficulty: "Medium",
    title: "Nonlinear system answered through the square of a sum or difference",
    recognize:
      "The system gives x² + y² together with x + y, x − y, or xy. Since (x ± y)² = x² + y² ± 2xy, squaring the " +
      "linear equation or doubling the product connects them, and the asked quantity follows without finding x or y.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["intermediate-value", "sign-error", "neighbouring-rule"],
    build(t) {
      const form = t.pick(["sum", "difference", "product"]);
      const numeric = t.chance(0.45);
      return drawUntilDistinctHard(() => {
        const x0 = t.nonzero(-9, 12);
        const y0 = t.nonzero(-9, 12);
        if (Math.abs(x0) === Math.abs(y0)) return null;
        const A = x0 * x0 + y0 * y0;
        const P = x0 * y0;
        let given;
        let asked;
        let key;
        let wrong;
        let steps;
        if (form === "product") {
          const plusSign = t.chance(0.5);
          const sign = plusSign ? "+" : MINUS;
          given = `xy = ${num(P)}`;
          asked = `(x ${sign} y)²`;
          key = plusSign ? A + 2 * P : A - 2 * P;
          wrong = [
            [A, `Treats (x ${sign} y)² as x² + y², leaving out the ${sign === "+" ? "+" : MINUS}2xy term.`],
            [plusSign ? A + P : A - P, `Uses xy once instead of 2xy in the expansion.`],
            [plusSign ? A - 2 * P : A + 2 * P, `Expands (x ${sign} y)² as x² + y² ${plusSign ? MINUS : "+"} 2xy, the square of a ${plusSign ? "difference" : "sum"}.`],
          ];
          steps = [
            `Expand: (x ${sign} y)² = x² ${sign} 2xy + y² = (x² + y²) ${sign} 2(xy).`,
            `Substitute: ${num(A)} ${sign} 2(${num(P)}) = ${num(key)}.`,
          ];
        } else {
          const plusSign = form === "sum";
          const sign = plusSign ? "+" : MINUS;
          const L = plusSign ? x0 + y0 : x0 - y0;
          const L2 = L * L;
          given = `x ${sign} y = ${num(L)}`;
          asked = "xy";
          key = P;
          // Modelled slips on both sides of the key; three are drawn, so the
          // key is not always the value the others are built around.
          wrong = t.sample([
            [plusSign ? L2 - A : A - L2, `Finds 2xy = ${num(2 * P)} and stops before dividing by 2.`],
            [-P, `Expands (x ${sign} y)² as x² + y² ${plusSign ? MINUS : "+"} 2xy.`],
            [(A + L2) / 2, `Adds ${num(L2)} and ${num(A)} instead of subtracting one from the other, then halves.`],
            [(plusSign ? L2 - A : A - L2) / 4, `Expands (x ${sign} y)² with a cross term of ${sign === "+" ? "" : MINUS}4xy, so it divides by 4.`],
            [A, "Gives x² + y², the value in the first equation, instead of xy."],
            [L2, `Gives (x ${sign} y)², the square of the second equation, instead of xy.`],
          ].filter(([value]) => Number.isInteger(value) && value !== P), 3);
          steps = [
            `Square the linear equation: (x ${sign} y)² = ${num(L2)}, so x² ${sign} 2xy + y² = ${num(L2)}.`,
            `Replace x² + y² with ${num(A)}: ${num(A)} ${sign} 2xy = ${num(L2)}.`,
            `So 2xy = ${num(2 * P)} and xy = ${num(P)}.`,
          ];
        }
        const lines = [`x² + y² = ${num(A)}`, given];
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 110,
          stimulus: { type: "equations", content: (t.chance(0.5) ? lines : [lines[1], lines[0]]).join("\n") },
          stem: `If (x, y) is a solution to the given system of equations, what is the value of ${asked}?`,
          correct: key,
          wrong: numeric ? undefined : wrong,
          explanation: `${steps.join(" ")} Neither x nor y has to be found.`,
          steps,
          principles: [
            "(x + y)² = x² + 2xy + y² and (x − y)² = x² − 2xy + y².",
            "A quantity that is the same for every solution of a system can often be found without solving for each variable.",
          ],
          trap: form === "product"
            ? `${asked} is not x² + y²; the cross term 2xy is where the given product enters.`
            : "Squaring the linear equation gives 2xy, not xy; the last step divides by 2.",
          hint: form === "product" ? `Expand ${asked}.` : "What happens if you square the linear equation?",
          verify: () => {
            // Solve by substitution and evaluate the asked quantity at every real solution.
            const solutions = [];
            if (form === "product") {
              realRoots(1, -A, P * P).filter((z) => z > 0).forEach((z) => {
                [Math.sqrt(z), -Math.sqrt(z)].forEach((x) => solutions.push([x, P / x]));
              });
            } else {
              const L = form === "sum" ? x0 + y0 : x0 - y0;
              const other = (x) => (form === "sum" ? L - x : x - L);
              realRoots(2, -2 * L, L * L - A).forEach((x) => solutions.push([x, other(x)]));
            }
            if (!solutions.length) return false;
            return solutions.every(([x, y]) => {
              if (!approx(x * x + y * y, A)) return false;
              const value = asked === "xy" ? x * y : asked.includes("+") ? (x + y) ** 2 : (x - y) ** 2;
              return approx(value, key);
            });
          },
        };
      });
    },
  };

  const lineCircleTangent = {
    id: "line-circle-tangent",
    domain: "Advanced Math",
    skill: "Systems of equations",
    subskill: "nonlinear systems",
    title: "Line and circle meeting at exactly one point",
    recognize:
      "One solution of a line-and-circle system means the line is tangent: its distance from the center equals the " +
      "radius (equivalently, the quadratic from substituting has discriminant 0), which gives two values of the constant.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 2, trap: 1 },
    tricks: ["neighbouring-rule", "sign-error", "reversed-condition"],
    build(t) {
      const numeric = t.chance(0.4);
      // A draw where a modelled slip happens to give the other tangent value
      // offers two right answers; verify() catches it and the draw is redone.
      return {
        estimatedSeconds: 120,
        ...drawUntilDistinctHard(() => {
          const record = lineCircleItem(t, numeric);
          return record && record.verify() ? record : null;
        }),
      };
    },
  };

  const polynomialLevelCount = {
    id: "polynomial-level-count",
    domain: "Advanced Math",
    skill: "Systems of equations",
    subskill: "nonlinear systems",
    title: "Number of solutions of y = f(x) and y = k read from a graph",
    recognize:
      "The solutions are the intersections of the graph with a horizontal line; the count changes only at the turning " +
      "values, where the line touches the graph instead of crossing it.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "wrong-quantity"],
    build(t) {
      return drawUntilDistinctHard(() => levelCountItem(t));
    },
  };

  return [
    constantFromSolution, parabolaLineSolutionCheck, lineParabolaSolve, nonlinearSystemSolve, squareIdentity,
    discriminantParameter, lineCircleTangent, polynomialLevelCount,
  ];
});
