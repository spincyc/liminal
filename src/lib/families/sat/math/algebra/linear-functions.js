(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/algebra"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Linear functions templates (Algebra), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, signed, lin, frac, approx, point } = S;
  const {
    fitsGrid, distinctWrong, standardForm, moveText, compile, holds, distinctWrongHard, lineFrom,
    lineCoefficients, cramer, slopeTerm,
  } = C;

  /* ----------------------------------------------------------- line-intercept-read */

  function interceptLine(t) {
    for (;;) {
      const X = t.sign() * t.int(2, 12);
      const Y = t.sign() * t.int(2, 12);
      if (Math.abs(X) === Math.abs(Y)) continue;
      const L = Math.abs(X * Y) / S.gcd(X, Y);
      if (L > 72) continue;
      const c = t.sign() * L;
      const a = c / X;
      const b = c / Y;
      // Both coefficients negative reads oddly; the test would negate the equation.
      if (Math.abs(a) > 12 || Math.abs(b) > 12 || (a < 0 && b < 0)) continue;
      return { X, Y, a, b, c };
    }
  }

  /* -------------------------------------------- linear-function-transformation */

  // f(x) = mx + b0, shown as two conditions or as a three-row table. Neither
  // shows x = 0, so the y-intercept is never handed over.
  function presentLinear(t, m, b0, asTable) {
    if (asTable) {
      const step = t.pick([2, 3, 4]);
      const x1 = t.int(-7, 3);
      const xs = [x1, x1 + step, x1 + 2 * step];
      if (xs.includes(0)) return null;
      const points = xs.map((x) => [x, m * x + b0]);
      if (points.some(([, y]) => Math.abs(y) > 60)) return null;
      return {
        points,
        stimulus: { type: "table", content: S.table(["x", "f(x)"], points) },
        lead: "The table shows three values of x and their corresponding values of f(x), where f is a linear function.",
      };
    }
    const a = t.nonzero(-6, 6);
    const c = a + t.pick([2, 3, 4, 5, 6]);
    if (c === 0) return null;
    const points = [[a, m * a + b0], [c, m * c + b0]];
    if (points.some(([, y]) => Math.abs(y) > 60)) return null;
    return {
      points,
      stimulus: null,
      lead: `For the linear function f, f(${num(a)}) = ${num(points[0][1])} and f(${num(c)}) = ${num(points[1][1])}.`,
    };
  }

  function slopeWork(points) {
    const [[x1, y1], [x2, y2]] = points;
    return `(${num(y2)} ${MINUS} ${paren(y1)}) ÷ (${num(x2)} ${MINUS} ${paren(x1)})`;
  }

  const rightOrLeft = (h) => (h > 0 ? "right" : "left");

  const upOrDown = (v) => (v > 0 ? "up" : "down");

  const functionValue = {
    id: "function-value-and-input",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "function notation",
    difficulty: "Easy",
    title: "Evaluating or inverting a linear function",
    recognize:
      "f(q) means the output when the input is q; f(x) = V gives an output and asks for the input. Substitute for " +
      "the input, or solve for it, keeping track of which one the question wants.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "wrong-quantity"],
    build(t) {
      const name = t.pick(["f", "g", "h", "p"]);
      const findInput = t.chance(0.45);
      const numeric = t.chance(0.4);
      for (;;) {
        const m = t.sign() * t.int(2, 9);
        const b = t.nonzero(-15, 15);
        const rule = m < 0 && t.chance(0.5) ? `${num(b)} ${MINUS} ${lin(-m, 0)}` : lin(m, b);
        const f = (x) => m * x + b;
        const lead = `The function ${name} is defined by ${name}(x) = ${rule}.`;
        let key;
        let wrong;
        let stem;
        let steps;
        let explanation;
        if (!findInput) {
          const q = t.chance(0.6) ? -t.int(1, 9) : t.int(2, 9);
          key = f(q);
          wrong = [];
          if (q < 0) wrong.push([f(-q), `Substitutes ${-q} for x, dropping the negative sign of the input.`]);
          wrong.push([m * q - b, `Changes the sign of the constant term, using ${num(-b)} instead of ${num(b)}.`]);
          const back = (q - b) / m;
          if (Number.isInteger(back)) wrong.push([back, `Solves ${name}(x) = ${num(q)} instead of finding the output when x = ${num(q)}.`]);
          wrong.push([m * q, `Computes ${num(m)} · ${paren(q)} but leaves out the constant term.`]);
          wrong.push([m + q + b, `Adds ${num(q)} to the coefficient instead of multiplying by it.`]);
          stem = `${lead} What is the value of ${name}(${num(q)})?`;
          steps = [
            `Replace x with ${num(q)}: ${name}(${num(q)}) = ${rule.replace("x", `(${num(q)})`)}.`,
            `Multiply: ${num(m)} · ${paren(q)} = ${num(m * q)}.`,
            `Add the constant: ${num(m * q)} ${signed(b)} = ${num(key)}.`,
          ];
          explanation = `${name}(${num(q)}) is the output when x = ${num(q)}: ${num(m)}(${num(q)}) ${signed(b)} = ${num(key)}.`;
          if (distinctWrong(key, wrong) < 3 || Math.abs(key) > 99) continue;
          const expression = rule;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 45,
            stimulus: null,
            stem,
            correct: key,
            wrong,
            explanation,
            steps,
            principles: ["f(a) is the value of the function's rule when a is substituted for x."],
            trap: "A negative input needs parentheses when substituted, or its sign is lost.",
            hint: "Put the number in place of x everywhere in the rule.",
            verify: () => approx(compile(expression)({ x: q }), key),
          };
        }
        const x0 = t.nonzero(-9, 12);
        const V = f(x0);
        // x0 === V would make f(V) equal the key.
        if (Math.abs(V) > 80 || V === x0) continue;
        key = x0;
        wrong = [[f(V), `Finds ${name}(${num(V)}) instead of the input that gives an output of ${num(V)}.`]];
        const slip = (V + b) / m;
        if (Number.isInteger(slip)) wrong.push([slip, `Adds ${num(b)} to ${num(V)} instead of subtracting it.`]);
        if (Math.abs(m) !== 1) wrong.push([V - b, `Stops at ${lin(m, 0)} = ${num(V - b)}, before dividing by ${num(m)}.`]);
        wrong.push([-x0, `Computes ${num(b)} ${MINUS} ${paren(V)} instead of ${num(V)} ${MINUS} ${paren(b)}, which flips the sign.`]);
        if (distinctWrong(key, wrong) < 3) continue;
        const expression = rule;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 50,
          stimulus: null,
          stem: `${lead} For what value of x is ${name}(x) = ${num(V)}?`,
          correct: key,
          wrong,
          explanation: `Set the rule equal to ${num(V)}: ${rule} = ${num(V)}, so ${lin(m, 0)} = ${num(V - b)} and x = ${num(x0)}.`,
          steps: [
            `Set ${rule} = ${num(V)}.`,
            `${moveText(b)}: ${lin(m, 0)} = ${num(V - b)}.`,
            `Divide by ${num(m)}: x = ${num(x0)}.`,
          ],
          principles: ["f(x) = V gives the output; the question asks for the input that produces it."],
          trap: `Finding ${name}(${num(V)}) answers a different question: ${num(V)} is an output here, not an input.`,
          hint: "Here the output is known and the input is not.",
          verify: () => {
            const fn = compile(expression);
            return approx(fn({ x: key }), V) && wrong.every(([value]) => !approx(fn({ x: value }), V));
          },
        };
      }
    },
  };

  const slopeTwoPoints = {
    id: "slope-from-two-points",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "slope",
    difficulty: "Easy",
    title: "Slope of a line from two of its points",
    recognize: "Slope is the change in y divided by the change in x, with both differences taken in the same order.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "neighbouring-rule"],
    build(t) {
      const variant = t.int(0, 2);
      const numericWanted = t.chance(0.4);
      for (;;) {
        if (variant < 2) {
          const q = t.pick([1, 1, 2, 3, 4]);
          const p = t.nonzero(-6, 6);
          if (S.gcd(p, q) !== 1) continue;
          const s = t.int(1, 3);
          const x1 = t.int(-8, 6);
          const y1 = t.int(-10, 12);
          const rows = [0, 1, 2].map((i) => [x1 + i * q * s, y1 + i * p * s]);
          const shown = variant === 0 ? (t.chance(0.5) ? [rows[0], rows[1]] : [rows[1], rows[0]]) : rows;
          const [[ax, ay], [bx, by]] = shown;
          const rise = by - ay;
          const run = bx - ax;
          const wrong = [
            [frac(q, p), "Divides the change in x by the change in y."],
            [frac(-p, q), "Subtracts the y-values and the x-values in opposite orders, which flips the sign."],
          ];
          if (Math.abs(run) !== 1) wrong.push([frac(rise, 1), `Gives the change in y, ${num(rise)}, without dividing by the change in x.`]);
          if (bx !== 0) wrong.push([frac(by, bx), "Divides the coordinates of a single point instead of the changes between two points."]);
          if (ax + bx !== 0) wrong.push([frac(ay + by, ax + bx), "Adds the coordinates instead of subtracting them."]);
          const keyText = frac(p, q);
          if (distinctWrong(keyText, wrong) < 3) continue;
          const numeric = numericWanted && [1, 2, 4].includes(q);
          const stimulus = variant === 1 ? { type: "table", content: S.table(["x", "y"], rows) } : null;
          const stem = variant === 0
            ? `A line in the xy-plane passes through the points ${point(ax, ay)} and ${point(bx, by)}. What is the slope of the line?`
            : "The table shows three values of x and their corresponding values of y. There is a linear relationship " +
              "between x and y. What is the slope of the line that represents this relationship in the xy-plane?";
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 55,
            stimulus,
            stem,
            correct: numeric ? p / q : keyText,
            wrong: numeric ? [] : wrong,
            explanation:
              `Slope = change in y ÷ change in x = (${num(by)} ${MINUS} ${paren(ay)}) ÷ (${num(bx)} ${MINUS} ${paren(ax)}) = ` +
              `${num(rise)} ÷ ${num(run)} = ${keyText}.`,
            steps: [
              `Change in y: ${num(by)} ${MINUS} ${paren(ay)} = ${num(rise)}.`,
              `Change in x, in the same order: ${num(bx)} ${MINUS} ${paren(ax)} = ${num(run)}.`,
              `Divide: ${num(rise)} ÷ ${paren(run)} = ${keyText}.`,
            ],
            principles: ["The slope through (x₁, y₁) and (x₂, y₂) is (y₂ − y₁)/(x₂ − x₁)."],
            trap: "Taking the differences in opposite orders flips the sign, and dividing the x-change by the y-change inverts the slope.",
            hint: "Compare how much y changes with how much x changes between two points.",
            verify: () => {
              const [first, , last] = variant === 1 ? rows : [shown[0], null, shown[1]];
              const slope = (last[1] - first[1]) / (last[0] - first[0]);
              const collinear = rows.every(([x, y]) => approx((y - rows[0][1]) * q, p * (x - rows[0][0])));
              return collinear && approx(slope, p / q);
            },
          };
        }
        const X = t.sign() * t.int(1, 9);
        const Y = t.sign() * t.int(1, 9);
        if (Math.abs(X) === Math.abs(Y)) continue;
        const keyText = frac(-Y, X);
        const value = -Y / X;
        const wrong = [
          [frac(Y, X), "Drops the negative sign that comes from subtracting the coordinates in the same order."],
          [frac(-X, Y), "Divides the change in x by the change in y."],
          [num(Y), "Gives the y-coordinate of the y-intercept, not the slope."],
          [frac(X, Y), "Inverts the ratio and drops the sign."],
        ];
        if (distinctWrong(keyText, wrong) < 3) continue;
        const numeric = numericWanted && fitsGrid(value);
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 60,
          stimulus: null,
          stem: `In the xy-plane, a line has an x-intercept at ${point(X, 0)} and a y-intercept at ${point(0, Y)}. What is the slope of the line?`,
          correct: numeric ? value : keyText,
          wrong: numeric ? [] : wrong,
          explanation:
            `The intercepts are two points on the line. Slope = (${num(Y)} ${MINUS} 0) ÷ (0 ${MINUS} ${paren(X)}) = ${keyText}.`,
          steps: [
            `The line passes through ${point(X, 0)} and ${point(0, Y)}.`,
            `Change in y: ${num(Y)} ${MINUS} 0 = ${num(Y)}; change in x: 0 ${MINUS} ${paren(X)} = ${num(-X)}.`,
            `Slope = ${num(Y)} ÷ ${paren(-X)} = ${keyText}.`,
          ],
          principles: ["An intercept is a point on the line, so two intercepts give the slope like any two points."],
          trap: "Read as a rise over a run, the two intercepts give the right size of slope but lose its sign; subtracting coordinates in order keeps it.",
          hint: "Write each intercept as a point.",
          verify: () => approx((Y - 0) / (0 - X), value) && approx(value * X + Y, 0),
        };
      }
    },
  };

  const lineIntercepts = {
    id: "line-intercept-read",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "intercepts",
    difficulty: "Easy",
    title: "Reading an intercept from a line's equation",
    recognize: "An x-intercept has y = 0 and a y-intercept has x = 0; substitute the zero and solve for the other coordinate.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "sign-error"],
    build(t) {
      const variant = t.int(0, 2);
      const numericWanted = t.chance(0.35);
      for (;;) {
        if (variant === 1) {
          // y = mx + B; the x-intercept.
          const m = t.sign() * t.int(2, 6);
          const X = t.nonzero(-9, 9);
          const B = -m * X;
          const equation = `y = ${lin(m, B)}`;
          const steps = [
            "At the x-intercept, y = 0.",
            `Solve 0 = ${lin(m, B)}: ${lin(m, 0)} = ${num(-B)}.`,
            `x = ${num(X)}, so the x-intercept is ${point(X, 0)}.`,
          ];
          const common = {
            estimatedSeconds: 50,
            stimulus: null,
            explanation: `The graph crosses the x-axis where y = 0: 0 = ${lin(m, B)} gives x = ${num(X)}.`,
            steps,
            principles: ["The x-intercept of a graph is the point where y = 0."],
            trap: `The constant ${num(B)} is the y-intercept's y-value, and moving it across the equals sign changes its sign.`,
            hint: "What is y at any point on the x-axis?",
          };
          if (numericWanted) {
            return {
              ...common,
              responseType: "numeric",
              stem: `The graph of ${equation} in the xy-plane has an x-intercept at (r, 0). What is the value of r?`,
              correct: X,
              verify: () => holds(equation, { x: X, y: 0 }) && !holds(equation, { x: X + 1, y: 0 }),
            };
          }
          const wrong = [
            [point(-X, 0), `Solves ${lin(m, 0)} = ${num(B)}; moving ${num(B)} across the equals sign changes its sign.`],
            [point(0, B), "Gives the y-intercept, where x = 0."],
            [point(B, 0), "Takes the constant term as the x-intercept."],
            [point(0, X), "Swaps the coordinates of the x-intercept."],
          ];
          if (distinctWrong(point(X, 0), wrong) < 3) continue;
          const pts = wrong.map(([text]) => text);
          return {
            ...common,
            responseType: "multiple-choice",
            stem: `What is the x-intercept of the graph of ${equation} in the xy-plane?`,
            correct: point(X, 0),
            wrong,
            verify: () => {
              const onAxisAndLine = (px, py) => py === 0 && holds(equation, { x: px, y: py });
              const parsed = pts.map((text) => text.replace(/[()]/g, "").split(", ").map((part) => Number(part.replace(MINUS, "-"))));
              return onAxisAndLine(X, 0) && parsed.every(([px, py]) => !onAxisAndLine(px, py));
            },
          };
        }
        const { X, Y, a, b, c } = interceptLine(t);
        const equation = standardForm(a, b, c);
        if (variant === 0) {
          const steps = [
            "At the x-intercept, y = 0.",
            `Substitute: ${lin(a, 0)} = ${num(c)}.`,
            a === 1 ? `So x = ${num(X)}.` : `Divide by ${num(a)}: x = ${num(X)}.`,
          ];
          const common = {
            estimatedSeconds: 50,
            stimulus: { type: "equations", content: equation },
            stem: "The graph of the given equation in the xy-plane has an x-intercept at (r, 0). What is the value of r?",
            explanation: `Setting y = 0 leaves ${lin(a, 0)} = ${num(c)}, so r = ${a === 1 ? num(X) : `${num(c)} ÷ ${paren(a)} = ${num(X)}`}.`,
            steps,
            principles: ["The x-intercept of a graph is the point where y = 0."],
            trap: "Setting x = 0 instead of y = 0 gives the other intercept.",
            hint: "What is y at any point on the x-axis?",
          };
          const wrong = [
            [Y, "Sets x = 0 instead of y = 0, which gives the y-intercept."],
            [-X, `Divides ${num(c)} by ${num(-a)}, losing the sign of the x-coefficient.`],
          ];
          if (Math.abs(a) !== 1) wrong.push([c, `Stops at ${lin(a, 0)} = ${num(c)}, before dividing by ${num(a)}.`]);
          if (a + b !== 0 && Number.isInteger(c / (a + b))) wrong.push([c / (a + b), "Adds the two coefficients and divides the constant by the sum."]);
          if (!numericWanted && distinctWrong(X, wrong) < 3) continue;
          return {
            ...common,
            responseType: numericWanted ? "numeric" : "multiple-choice",
            correct: X,
            wrong: numericWanted ? [] : wrong,
            verify: () =>
              holds(equation, { x: X, y: 0 }) &&
              (numericWanted || wrong.every(([value]) => !holds(equation, { x: value, y: 0 }))),
          };
        }
        // Variant 2: the y-intercept of a standard-form line.
        const steps = [
          "At the y-intercept, x = 0.",
          `Substitute: ${lin(b, 0, "y")} = ${num(c)}.`,
          `${b === 1 ? "So" : `Divide by ${num(b)}:`} y = ${num(Y)}, so the y-intercept is ${point(0, Y)}.`,
        ];
        const common = {
          estimatedSeconds: 50,
          stimulus: { type: "equations", content: equation },
          explanation: `Setting x = 0 leaves ${lin(b, 0, "y")} = ${num(c)}, so y = ${num(Y)}.`,
          steps,
          principles: ["The y-intercept of a graph is the point where x = 0."],
          trap: "Setting y = 0 instead of x = 0 gives the x-intercept.",
          hint: "What is x at any point on the y-axis?",
        };
        if (numericWanted) {
          return {
            ...common,
            responseType: "numeric",
            stem: "The graph of the given equation in the xy-plane has a y-intercept at (0, s). What is the value of s?",
            correct: Y,
            verify: () => holds(equation, { x: 0, y: Y }) && !holds(equation, { x: 0, y: Y + 1 }),
          };
        }
        const wrong = [
          [point(X, 0), "Gives the x-intercept, found by setting y = 0."],
          [point(Y, 0), "Places the y-intercept's value on the x-axis."],
        ];
        if (Math.abs(b) !== 1) wrong.push([point(0, c), `Stops at ${lin(b, 0, "y")} = ${num(c)}, before dividing by ${num(b)}.`]);
        wrong.push([point(0, X), "Sets y = 0 and reports the result as a y-coordinate."]);
        if (distinctWrong(point(0, Y), wrong) < 3) continue;
        const parsed = wrong.map(([text]) => text.replace(/[()]/g, "").split(", ").map((part) => Number(part.replace(MINUS, "-"))));
        return {
          ...common,
          responseType: "multiple-choice",
          stem: "What is the y-intercept of the graph of the given equation in the xy-plane?",
          correct: point(0, Y),
          wrong,
          verify: () => {
            const onAxisAndLine = (px, py) => px === 0 && holds(equation, { x: px, y: py });
            return onAxisAndLine(0, Y) && parsed.every(([px, py]) => !onAxisAndLine(px, py));
          },
        };
      }
    },
  };

  const functionConstant = {
    id: "function-constant-from-value",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "function notation",
    difficulty: "Medium",
    title: "Linear function with one unknown constant",
    recognize:
      "One given input-output pair pins down the unknown constant; find it first, then use the completed rule for " +
      "the value the question actually asks about.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "sign-error"],
    build(t) {
      const form = t.pick(["intercept", "intercept", "slope", "input"]);
      const numeric = t.chance(0.4);
      const asPoint = t.chance(0.35);
      for (;;) {
        const p = t.nonzero(-6, 8);
        const condition = (V) => asPoint
          ? `The graph of y = f(x) in the xy-plane passes through the point ${point(p, V)}.`
          : `If f(${num(p)}) = ${num(V)},`;
        const tail = (question) => (asPoint ? ` ${question.charAt(0).toUpperCase()}${question.slice(1)}` : ` ${question}`);
        if (form === "slope") {
          const k0 = t.sign() * t.int(2, 7);
          const c = t.nonzero(-15, 15);
          const V = k0 * p + c;
          const q = t.nonzero(-6, 9);
          if (q === p || Math.abs(p) === 1) continue;
          const key = k0 * q + c;
          const rule = `kx ${signed(c)}`;
          const wrong = [
            [k0, `Stops at k = ${num(k0)}, before evaluating f(${num(q)}).`],
            [k0 * q, `Finds k but leaves out the ${signed(c)} when evaluating.`],
          ];
          const slip = (V + c) / p;
          if (Number.isInteger(slip)) wrong.push([slip * q + c, `Solves for k with a sign slip, getting k = ${num(slip)}.`]);
          const lazy = V / p;
          if (Number.isInteger(lazy) && lazy !== k0) wrong.push([lazy * q + c, `Divides ${num(V)} by ${num(p)} without first removing the constant, getting k = ${num(lazy)}.`]);
          wrong.push([V + k0 * (q - p) - 2 * c, "Changes the sign of the constant term when evaluating."]);
          if (Math.abs(key) > 99 || (!numeric && distinctWrong(key, wrong) < 3)) continue;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 85,
            stimulus: null,
            stem:
              `The function f is defined by f(x) = ${rule}, where k is a constant. ${condition(V)}` +
              tail(`what is the value of f(${num(q)})?`),
            correct: key,
            wrong: numeric ? [] : wrong,
            explanation:
              `Substituting gives ${num(V)} = k(${num(p)}) ${signed(c)}, so ${lin(p, 0, "k")} = ${num(V - c)} and k = ${num(k0)}. ` +
              `Then f(${num(q)}) = ${num(k0)}(${num(q)}) ${signed(c)} = ${num(key)}.`,
            steps: [
              `Substitute the known pair: ${num(V)} = ${lin(p, 0, "k")} ${signed(c)}.`,
              `Solve: k = ${num(k0)}.`,
              `Evaluate: f(${num(q)}) = ${num(k0)} · ${paren(q)} ${signed(c)} = ${num(key)}.`,
            ],
            principles: ["A single input-output pair determines one unknown constant in a linear rule."],
            trap: `k = ${num(k0)} is only the missing piece of the rule; the question wants f(${num(q)}).`,
            hint: "Fill in the missing constant first.",
            verify: () => {
              const fn = compile(rule);
              const ks = [];
              for (let k = -50; k <= 50; k += 1) if (approx(fn({ k, x: p }), V)) ks.push(k);
              return ks.length === 1 && approx(fn({ k: ks[0], x: q }), key);
            },
          };
        }
        const m = t.sign() * t.int(2, 7);
        const b0 = t.nonzero(-12, 12);
        const V = m * p + b0;
        if (Math.abs(V) > 60) continue;
        const rule = `${lin(m, 0)} + b`;
        const bSlip = V + m * p;
        if (form === "input") {
          const x1 = t.nonzero(-8, 10);
          if (x1 === p) continue;
          const W = m * x1 + b0;
          const key = x1;
          const wrong = [
            [b0, `Stops at b = ${num(b0)}, before solving f(x) = ${num(W)}.`],
            [m * W + b0, `Finds f(${num(W)}) instead of the input that gives ${num(W)}.`],
          ];
          if (Number.isInteger((W + b0) / m)) wrong.push([(W + b0) / m, `Adds ${num(b0)} to ${num(W)} instead of subtracting it.`]);
          if (Number.isInteger((W - bSlip) / m)) wrong.push([(W - bSlip) / m, `Solves for b with a sign slip, getting b = ${num(bSlip)}.`]);
          wrong.push([W - b0, `Stops at ${lin(m, 0)} = ${num(W - b0)}, before dividing by ${num(m)}.`]);
          if (!numeric && distinctWrong(key, wrong) < 3) continue;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 85,
            stimulus: null,
            stem:
              `The function f is defined by f(x) = ${rule}, where b is a constant. ${condition(V)}` +
              tail(`for what value of x is f(x) = ${num(W)}?`),
            correct: key,
            wrong: numeric ? [] : wrong,
            explanation:
              `Substituting gives ${num(V)} = ${num(m)}(${num(p)}) + b, so b = ${num(b0)} and f(x) = ${lin(m, b0)}. ` +
              `Setting ${lin(m, b0)} = ${num(W)} gives x = ${num(x1)}.`,
            steps: [
              `Find b: ${num(V)} = ${num(m * p)} + b, so b = ${num(b0)}.`,
              `Set f(x) = ${num(W)}: ${lin(m, b0)} = ${num(W)}.`,
              `Solve: ${lin(m, 0)} = ${num(W - b0)}, so x = ${num(x1)}.`,
            ],
            principles: ["f(x) = W asks for an input; the completed rule is solved for x."],
            trap: `Finding b is halfway; and f(${num(W)}) treats ${num(W)} as an input when it is an output.`,
            hint: "Complete the rule, then decide whether you know the input or the output.",
            verify: () => {
              const fn = compile(rule);
              const bs = [];
              for (let b = -120; b <= 120; b += 1) if (approx(fn({ b, x: p }), V)) bs.push(b);
              return bs.length === 1 && approx(fn({ b: bs[0], x: key }), W);
            },
          };
        }
        const q = t.nonzero(-6, 9);
        if (q === p) continue;
        const key = m * q + b0;
        const wrong = [
          [b0, `Stops at b = ${num(b0)}, before evaluating f(${num(q)}).`],
          [m * q + V, `Uses ${num(V)}, the output at x = ${num(p)}, as if it were b.`],
          [m * q + bSlip, `Solves ${num(m * p)} + b = ${num(V)} with a sign slip, getting b = ${num(bSlip)}.`],
          [m * q, `Evaluates ${num(m)} · ${paren(q)} but leaves out b.`],
        ];
        if (Math.abs(key) > 99 || (!numeric && distinctWrong(key, wrong) < 3)) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 80,
          stimulus: null,
          stem:
            `The function f is defined by f(x) = ${rule}, where b is a constant. ${condition(V)}` +
            tail(`what is the value of f(${num(q)})?`),
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation:
            `Substituting gives ${num(V)} = ${num(m)}(${num(p)}) + b = ${num(m * p)} + b, so b = ${num(b0)}. ` +
            `Then f(${num(q)}) = ${num(m)}(${num(q)}) ${signed(b0)} = ${num(key)}.`,
          steps: [
            `Substitute the known pair: ${num(V)} = ${num(m * p)} + b.`,
            `Solve: b = ${num(b0)}, so f(x) = ${lin(m, b0)}.`,
            `Evaluate: f(${num(q)}) = ${num(key)}.`,
          ],
          principles: ["A single input-output pair determines one unknown constant in a linear rule."],
          trap: `b = ${num(b0)} is the missing piece of the rule, not the answer.`,
          hint: "Fill in the missing constant first.",
          verify: () => {
            const fn = compile(rule);
            const bs = [];
            for (let b = -120; b <= 120; b += 1) if (approx(fn({ b, x: p }), V)) bs.push(b);
            return bs.length === 1 && approx(fn({ b: bs[0], x: q }), key);
          },
        };
      }
    },
  };

  const linearTransform = {
    id: "linear-function-transformation",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "function notation",
    title: "Transformed linear function defined through another function",
    recognize:
      "g is built from f, so the data about one function must be translated into the other: pin down f's rule, " +
      "then apply the change, keeping inside-f changes (which act on x, in the opposite direction) apart from " +
      "outside-f changes (which act on the output).",
    rubric: { steps: 2, concept: 1, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 2 },
    tricks: ["sign-error", "intermediate-value", "wrong-quantity"],
    build(t) {
      const variant = t.int(0, 3);

      if (variant === 0) {
        // g(x) = f(x − h) + v; the x-intercept of g.
        for (;;) {
          const m = t.pick([-4, -3, -2, 2, 3, 4]);
          const h = t.nonzero(-6, 6);
          const w = t.nonzero(-4, 4);
          const r = t.nonzero(-9, 9);
          const v = m * w;
          const b0 = m * (h - r - w);
          // w === h would make the two shifts cancel (g = f).
          if (Math.abs(h) < 2 || w === h || b0 === 0 || Math.abs(b0) > 36) continue;
          const shown = presentLinear(t, m, b0, t.chance(0.5));
          if (!shown) continue;
          const inside = `x ${signed(-h)}`;
          const wrong = [
            [r - 2 * h, `Moves the graph ${Math.abs(h)} units ${rightOrLeft(-h)}; replacing x with ${inside} moves it ${rightOrLeft(h)}.`],
            [r - h + w, "Gives the x-intercept of the graph of f, not of g."],
            [r + 2 * w, `Moves the graph ${Math.abs(v)} units ${upOrDown(-v)} instead of ${upOrDown(v)}.`],
            [r + w, "Applies the change inside f but leaves out the change outside it."],
            [r - h, "Applies the change outside f but leaves out the change inside it."],
          ];
          if (distinctWrongHard(r, wrong) < 3) continue;
          const gRule = lin(m, -m * r);
          return {
            responseType: t.chance(0.35) ? "numeric" : "multiple-choice",
            estimatedSeconds: 110,
            stimulus: shown.stimulus,
            stem:
              `${shown.lead} The function g is defined by g(x) = f(${inside}) ${signed(v)}. The graph of y = g(x) ` +
              "in the xy-plane has an x-intercept at (r, 0). What is the value of r?",
            correct: r,
            wrong,
            explanation:
              `f has slope ${slopeWork(shown.points)} = ${num(m)}, so f(x) = ${lin(m, b0)}. Then ` +
              `g(x) = ${num(m)}(${inside}) ${signed(b0)} ${signed(v)} = ${gRule}, which is 0 when x = ${num(r)}.`,
            steps: [
              `Slope of f: ${slopeWork(shown.points)} = ${num(m)}.`,
              `Rule for f: f(x) = ${lin(m, b0)}.`,
              `Substitute ${inside} for x and apply ${signed(v)}: g(x) = ${gRule}.`,
              `Solve ${gRule} = 0: x = ${num(r)}.`,
            ],
            principles: [
              "The graph of y = f(x − h) + k is the graph of y = f(x) moved h units right and k units up.",
              "An x-intercept is a point where the output is 0.",
            ],
            trap: `Replacing x with ${inside} moves the graph ${rightOrLeft(h)}, the opposite of what the sign suggests; and f's own x-intercept is not g's.`,
            hint: "Find a rule for f first, then work out what g does to it.",
            verify: () => {
              const line = lineFrom(shown.points);
              const g = (x) => line.f(x - h) + v;
              return line.consistent && approx(g(r), 0) && !approx(g(r + 1), 0);
            },
          };
        }
      }

      if (variant === 1) {
        // f from a table; g(x) = f(kx) + B or A·f(x) + B; a value of g.
        for (;;) {
          const m = t.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
          const b0 = t.nonzero(-12, 12);
          const shown = presentLinear(t, m, b0, true);
          if (!shown) continue;
          const xs = shown.points.map(([x]) => x);
          const step = xs[1] - xs[0];
          const f = (x) => m * x + b0;
          const B = t.nonzero(-9, 9);
          let gText;
          let q;
          let key;
          let wrong;
          let work;
          let check;
          if (t.chance(0.5)) {
            const k = t.pick([2, 3, -2]);
            const choices = xs.filter((x) => !xs.includes(k * x));
            if (!choices.length) continue;
            q = t.pick(choices);
            key = f(k * q) + B;
            gText = `g(x) = f(${num(k)}x) ${signed(B)}`;
            wrong = [
              [f(k * q), `Stops at f(${num(k * q)}) and leaves out the ${signed(B)}.`],
              [k * f(q) + B, `Multiplies the output f(${num(q)}) by ${num(k)} instead of multiplying the input.`],
              [f(q) + B, `Ignores the ${num(k)} inside f and uses f(${num(q)}) from the table.`],
              [f(k * q) - B, `Applies ${signed(-B)} instead of ${signed(B)}.`],
            ];
            work = `g(${num(q)}) = f(${num(k * q)}) ${signed(B)} = ${num(f(k * q))} ${signed(B)} = ${num(key)}`;
            check = (line) => line.f(k * q) + B;
          } else {
            const A = t.pick([2, 3, -2, -3]);
            q = t.nonzero(-6, 12);
            if (xs.includes(q)) continue;
            key = A * f(q) + B;
            gText = `g(x) = ${num(A)}f(x) ${signed(B)}`;
            wrong = [
              [f(q), `Stops at f(${num(q)}), before multiplying by ${num(A)} and applying ${signed(B)}.`],
              [A * f(q), `Multiplies f(${num(q)}) by ${num(A)} but leaves out the ${signed(B)}.`],
              [f(A * q) + B, `Puts the ${num(A)} inside f, computing f(${num(A * q)}) ${signed(B)}.`],
              [A * (f(q) + B), `Applies ${signed(B)} before multiplying by ${num(A)}.`],
            ];
            work = `g(${num(q)}) = ${num(A)} · f(${num(q)}) ${signed(B)} = ${num(A)}(${num(f(q))}) ${signed(B)} = ${num(key)}`;
            check = (line) => A * line.f(q) + B;
          }
          if (Math.abs(key) > 99 || distinctWrongHard(key, wrong) < 3) continue;
          return {
            responseType: t.chance(0.35) ? "numeric" : "multiple-choice",
            estimatedSeconds: 100,
            stimulus: shown.stimulus,
            stem: `${shown.lead} The function g is defined by ${gText}. What is the value of g(${num(q)})?`,
            correct: key,
            wrong,
            explanation:
              `In the table, each increase of ${step} in x changes f(x) by ${num(m * step)}, so f has slope ${num(m)} ` +
              `and f(x) = ${lin(m, b0)}. Then ${work}.`,
            steps: [
              `Slope of f from the table: ${num(m * step)} ÷ ${step} = ${num(m)}.`,
              `Rule for f: f(x) = ${lin(m, b0)}.`,
              `Evaluate g: ${work}.`,
            ],
            principles: [
              "In g(x) = f(kx), the factor k changes the input before f acts; in g(x) = A·f(x), A changes the output.",
              "A linear function changes by the same amount for each equal step in x.",
            ],
            trap: "The needed value of f is not in the table, and a factor inside f acts on x, not on f(x).",
            hint: "The value you need is not in the table, so find a rule for f first.",
            verify: () => {
              const line = lineFrom(shown.points);
              return line.consistent && approx(check(line), key);
            },
          };
        }
      }

      if (variant === 2) {
        // Values of g given; a value of f asked.
        for (;;) {
          const m = t.nonzero(-5, 5);
          const b0 = t.int(-15, 15);
          const h = t.nonzero(-5, 5);
          const v = t.nonzero(-9, 9);
          const g = (x) => m * (x - h) + b0 + v;
          const a = t.int(-4, 6);
          const c = a + t.pick([2, 3, 4, 5]);
          const intercept = t.chance(0.5);
          const q = intercept ? 0 : t.nonzero(-6, 9);
          const key = m * q + b0;
          const [ga, gc] = [g(a), g(c)];
          if ([ga, gc, key].some((value) => Math.abs(value) > 60)) continue;
          // Asking for f at a translated input would skip the slope entirely,
          // and v = mh makes g = f, so misreading g as f would still be right.
          if (q === a - h || q === c - h || v === m * h) continue;
          const inside = `x ${signed(-h)}`;
          const wrong = [
            [g(q), intercept
              ? "Treats the given values as values of f, which gives the y-intercept of the graph of g."
              : `Treats the given values as values of f, which gives g(${num(q)}) instead of f(${num(q)}).`],
            [key - 2 * m * h, `Undoes the change inside f in the wrong direction, matching g(x) with f(x ${signed(h)}).`],
            [key + 2 * v, `Undoes the ${signed(v)} in the wrong direction.`],
            [key + v, `Accounts for the change inside f but not the ${signed(v)}.`],
            [key - m * h, `Accounts for the ${signed(v)} but not the change inside f.`],
          ];
          if (distinctWrongHard(key, wrong) < 3) continue;
          const [p1, p2] = [[a - h, ga - v], [c - h, gc - v]];
          return {
            responseType: t.chance(0.3) ? "numeric" : "multiple-choice",
            estimatedSeconds: 110,
            stimulus: null,
            stem:
              `The function g is defined by g(x) = f(${inside}) ${signed(v)}, where f is a linear function. ` +
              `If g(${num(a)}) = ${num(ga)} and g(${num(c)}) = ${num(gc)}, ` +
              (intercept
                ? "what is the y-coordinate of the y-intercept of the graph of y = f(x) in the xy-plane?"
                : `what is the value of f(${num(q)})?`),
            correct: key,
            wrong,
            explanation:
              `g(${num(a)}) = f(${num(p1[0])}) ${signed(v)}, so f(${num(p1[0])}) = ${num(p1[1])}; likewise ` +
              `f(${num(p2[0])}) = ${num(p2[1])}. The slope of f is ${slopeWork([p1, p2])} = ${num(m)}, so ` +
              `f(x) = ${lin(m, b0)} and f(${num(q)}) = ${num(key)}.`,
            steps: [
              `Translate each value of g into a value of f: f(${num(p1[0])}) = ${num(p1[1])} and f(${num(p2[0])}) = ${num(p2[1])}.`,
              `Slope of f: ${slopeWork([p1, p2])} = ${num(m)}.`,
              `Rule for f: f(x) = ${lin(m, b0)}.`,
              `Evaluate: f(${num(q)}) = ${num(key)}.`,
            ],
            principles: [
              "If g(x) = f(x − h) + k, then g(a) = b means f(a − h) = b − k.",
              "Two points determine a line.",
            ],
            trap: "The given points belong to g, not f; each one has to be moved back before f can be found.",
            hint: "Each given value of g is really a value of f at a different input.",
            verify: () => {
              const line = lineFrom([p1, p2]);
              return approx(line.f(q), key) && approx(line.f(a - h) + v, ga) && approx(line.f(c - h) + v, gc);
            },
          };
        }
      }

      // Slope of g(x) = f(kx) + B for a negative k.
      for (;;) {
        const [kn, kd] = t.pick([[-2, 1], [-3, 1], [-1, 2], [-1, 3]]);
        const m = t.nonzero(-6, 6);
        if (kd === 3 && m % 3 !== 0) continue;
        const b0 = t.int(-12, 12);
        const B = t.int(-9, 9);
        const shown = presentLinear(t, m, b0, t.chance(0.4));
        if (!shown) continue;
        const kText = kd === 1 ? num(kn) : `${MINUS}1/${kd}`;
        const argument = kd === 1 ? `${num(kn)}x` : `${MINUS}x/${kd}`;
        const key = frac(m * kn, kd);
        const wrong = [
          [frac(m, 1), `Gives the slope of f; replacing x with ${argument} changes the slope.`],
          [frac(m * kd, kn), `Divides the slope of f by ${kText} instead of multiplying by it.`],
          [frac(-m * kn, kd), `Drops the negative sign in ${argument}.`],
        ];
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 95,
          stimulus: shown.stimulus,
          stem:
            `${shown.lead} The function g is defined by g(x) = f(${argument})${B ? ` ${signed(B)}` : ""}. ` +
            "What is the slope of the graph of y = g(x) in the xy-plane?",
          correct: key,
          wrong,
          explanation:
            `f has slope ${slopeWork(shown.points)} = ${num(m)}, so f(x) = ${lin(m, b0)}. Then ` +
            `g(x) = ${num(m)}(${argument})${b0 ? ` ${signed(b0)}` : ""}${B ? ` ${signed(B)}` : ""}, ` +
            `whose x-coefficient is ${num(m)} · (${kText}) = ${key}.`,
          steps: [
            `Slope of f: ${slopeWork(shown.points)} = ${num(m)}.`,
            `Rule for f: f(x) = ${lin(m, b0)}.`,
            `Substitute ${argument} for x: the x-term becomes ${num(m)}(${argument}).`,
            `Read the slope: ${num(m)} · (${kText}) = ${key}.`,
          ],
          principles: ["If f(x) = mx + b, then f(kx) = (km)x + b: the slope is multiplied by k, and a constant added outside f does not change it."],
          trap: "Changing the input of f by a factor multiplies the slope by that factor, sign included.",
          hint: "Write g(x) as an expression in x.",
          verify: () => {
            const line = lineFrom(shown.points);
            const g = (x) => line.f((kn / kd) * x) + B;
            return line.consistent && approx(g(1) - g(0), (m * kn) / kd) && approx(g(7) - g(2), (5 * m * kn) / kd);
          },
        };
      }
    },
  };

  /* ------------------------------------------------ perpendicular-line-through-point */

  // " + 15/2", " − 4", or "" as the constant term of a slope-intercept equation.
  function constantTerm(numerator, denominator) {
    const value = numerator / denominator;
    if (value === 0) return "";
    return ` ${value < 0 ? MINUS : "+"} ${frac(Math.abs(numerator), Math.abs(denominator))}`;
  }

  const perpendicularLine = {
    id: "perpendicular-line-through-point",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "slope",
    difficulty: "Medium",
    title: "Line perpendicular to a given line through a given point",
    recognize:
      "Perpendicular lines have slopes whose product is −1, so the new line's slope is the negative reciprocal of the " +
      "given line's slope; that slope and the given point then fix the new line's y-intercept.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "sign-error", "intermediate-value"],
    build(t) {
      const given = t.pick(["slope", "standard", "points"]);
      const askEquation = t.chance(0.4);
      const numeric = !askEquation && t.chance(0.5);
      for (;;) {
        // Line k: y = (n/d)x + c1. Line j: slope −d/n through (x0, y0), with x0 a multiple of n so its intercept is whole.
        const n = t.nonzero(-5, 5);
        const d = t.int(1, 5);
        if (S.gcd(n, d) !== 1 || Math.abs(n) === d) continue;
        const c1 = t.int(-9, 9);
        const x0 = n * t.nonzero(-3, 3);
        const y0 = t.int(-9, 9);
        const b2 = y0 + (d * x0) / n;
        if (b2 === c1 || Math.abs(b2) > 40) continue;
        let kText;
        let kEquation = null;
        let kPoints = null;
        let slopeStep;
        if (given === "slope") {
          kEquation = `y = ${slopeTerm(n, d)}${c1 ? ` ${signed(c1)}` : ""}`;
          kText = `In the xy-plane, line k is defined by ${kEquation}.`;
          slopeStep = `Line k is in slope-intercept form, so its slope is ${frac(n, d)}.`;
        } else if (given === "standard") {
          const sign = n > 0 ? 1 : -1;
          kEquation = standardForm(sign * n, -sign * d, -sign * d * c1);
          kText = `In the xy-plane, line k is defined by ${kEquation}.`;
          slopeStep = `Solve ${kEquation} for y: y = ${slopeTerm(n, d)}${c1 ? ` ${signed(c1)}` : ""}, so line k's slope is ${frac(n, d)}.`;
        } else {
          const x1 = d * t.int(-3, 1);
          const x2 = x1 + d * t.int(1, 3);
          kPoints = [x1, x2].map((x) => [x, (n * x) / d + c1]);
          if (kPoints.some(([, y]) => Math.abs(y) > 40)) continue;
          kText = `In the xy-plane, line k passes through the points ${point(...kPoints[0])} and ${point(...kPoints[1])}.`;
          slopeStep = `Line k's slope is ${slopeWork(kPoints)} = ${frac(n, d)}.`;
        }
        const slopeJ = frac(-d, n);
        const equation = (sn, sd, cn, cd) => `y = ${slopeTerm(sn, sd)}${constantTerm(cn, cd)}`;
        const keyEquation = equation(-d, n, b2, 1);
        let key;
        let wrong;
        if (askEquation) {
          key = keyEquation;
          wrong = [
            [equation(n, d, y0 * d - n * x0, d), "Uses the slope of line k, which makes line j parallel to k, not perpendicular."],
            [equation(d, n, y0 * n - d * x0, n), "Uses the reciprocal of line k's slope without changing its sign."],
            ...t.shuffle([
              [equation(-d, n, c1, 1), `Has the right slope but keeps line k's y-intercept, so it misses ${point(x0, y0)}.`],
              [equation(-n, d, y0 * d + n * x0, d), "Uses the opposite of line k's slope without taking its reciprocal."],
            ]),
          ];
        } else {
          key = b2;
          wrong = [
            [frac(y0 * d - n * x0, d), "Uses the slope of line k itself, which gives a line parallel to k, not perpendicular."],
            [y0 - (d * x0) / n, `Uses ${frac(d, n)}, the reciprocal of line k's slope, without changing its sign.`],
            ...t.shuffle([
              [c1, "Gives the y-intercept of line k, not of line j."],
              [slopeJ, `Gives ${slopeJ}, the slope of line j, instead of its y-intercept.`],
              [frac(y0 * d + n * x0, d), `Uses ${frac(-n, d)}, the opposite of line k's slope, without taking its reciprocal.`],
            ]),
          ];
        }
        if (!numeric && distinctWrongHard(key, wrong) < 3) continue;
        const steps = [
          slopeStep,
          `Line j is perpendicular to line k, so its slope is the negative reciprocal: ${slopeJ}.`,
          `Substitute ${point(x0, y0)} into y = ${slopeTerm(-d, n)} + b: b = ${num(y0)} ${MINUS} (${slopeJ})(${num(x0)}) = ${num(b2)}.`,
        ];
        if (askEquation) steps.push(`So line j is ${keyEquation}.`);
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 90,
          stimulus: null,
          stem:
            `${kText} Line j is perpendicular to line k and passes through the point ${point(x0, y0)}. ` +
            (askEquation ? "Which equation defines line j?" : "What is the y-coordinate of the y-intercept of line j?"),
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation:
            `Line k has slope ${frac(n, d)}, so a line perpendicular to it has slope ${slopeJ}. Line j passes through ` +
            `${point(x0, y0)}, so its y-intercept is ${num(y0)} ${MINUS} (${slopeJ})(${num(x0)}) = ${num(b2)}` +
            (askEquation ? `, and line j is ${keyEquation}.` : "."),
          steps,
          principles: [
            "Two nonvertical lines are perpendicular exactly when the product of their slopes is −1.",
            "The y-intercept of a line with slope m through (x, y) is y − mx.",
          ],
          trap: `Line k's slope, ${frac(n, d)}, is only a step: line j needs its negative reciprocal, and then its own intercept.`,
          hint: "Find the slope of line k first, then decide what slope line j must have.",
          verify: () => {
            // Line k's slope is read back from what the student sees, and line j is checked against the point.
            let slopeK;
            if (kPoints) slopeK = lineFrom(kPoints).slope;
            else {
              const [A, B] = lineCoefficients(kEquation);
              slopeK = -A / B;
            }
            const slopeOfJ = -1 / slopeK;
            if (!askEquation) return approx(y0 - slopeOfJ * x0, b2);
            const fits = (text) => {
              const f = compile(text.replace(/^y = /, ""));
              return approx(f({ x: x0 }), y0) && approx(f({ x: 1 }) - f({ x: 0 }), slopeOfJ);
            };
            return fits(key) && wrong.every(([text]) => !fits(text));
          },
        };
      }
    },
  };

  /* -------------------------------------------------------- linear-function-identity */

  const functionIdentity = {
    id: "linear-function-identity",
    domain: "Algebra",
    skill: "Linear functions",
    subskill: "function notation",
    difficulty: "Hard",
    title: "Linear function pinned down by a relation that holds for every x",
    recognize:
      "A relation that is true for every x fixes one coefficient of f(x) = mx + b: shifting x exposes the slope, while " +
      "scaling or reflecting x exposes the intercept. Match the relation term by term, and let the one given value " +
      "supply the other coefficient.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "intermediate-value", "sign-error"],
    build(t) {
      const form = t.pick(["shift", "scale", "mirror"]);
      const ask = t.pick(form === "shift" ? ["value", "intercept"] : ["value", "slope"]);
      const inline = t.chance(0.5);
      const numeric = t.chance(0.4);
      for (;;) {
        const p = t.nonzero(-6, 6);
        const m = t.nonzero(-6, 6);
        const b = form === "shift" ? t.int(-12, 12) : t.nonzero(-12, 12);
        const q = m * p + b;
        const r = p + t.nonzero(-9, 9);
        if (r === 0 || r === -p || Math.abs(q) > 60) continue;
        const h = t.int(2, 6);
        const k = t.int(2, 5);
        const delta = m * h;
        const c = b * (1 - k);
        const total = 2 * b;
        const valueAt = (x) => m * x + b;
        let relation;
        let key;
        let askText;
        let wrong;
        let steps;
        const finish = ask === "value"
          ? `f(${num(r)}) = ${paren(m)}(${num(r)}) ${signed(b)} = ${num(valueAt(r))}.`
          : null;
        const fromValue = `From f(${num(p)}) = ${num(q)}: `;
        if (form === "shift") {
          if (r === p + h) continue;
          relation = `f(x + ${h}) = f(x) ${signed(delta)}`;
          steps = [
            `Write f(x) = mx + b. Then f(x + ${h}) = mx + ${h}m + b, which equals f(x) ${signed(delta)} for every x only if ${h}m = ${num(delta)}.`,
            `So m = ${num(delta)} ÷ ${h} = ${num(m)}.`,
            `${fromValue}b = ${num(q)} ${MINUS} ${paren(m)}(${num(p)}) = ${num(b)}.`,
          ];
          if (ask === "value") {
            key = valueAt(r);
            wrong = [
              [q + delta * (r - p), `Treats ${num(delta)}, the change over ${h} units of x, as the change for each unit of x.`],
              [q + delta, `Applies the relation once, which gives f(${num(p + h)}), not f(${num(r)}).`],
              [q - m * (r - p), `Moves away from f(${num(p)}) with the slope's sign reversed.`],
            ];
          } else {
            key = b;
            wrong = [
              [q - delta * p, `Treats ${num(delta)}, the change over ${h} units of x, as the slope.`],
              [q + m * p, "Adds the slope times the x-value instead of subtracting it."],
              [m, "Gives the slope of the graph, not its y-intercept."],
              [q, `Gives f(${num(p)}), the value at x = ${num(p)}, not the value at x = 0.`],
            ];
          }
        } else {
          let interceptSteps;
          let wrongIntercept;
          if (form === "scale") {
            relation = `f(${k}x) = ${k}f(x) ${signed(c)}`;
            interceptSteps = [
              `Write f(x) = mx + b. Then f(${k}x) = ${k}mx + b, while ${k}f(x) ${signed(c)} = ${k}mx + ${k}b ${signed(c)}.`,
              `These agree for every x only if b = ${k}b ${signed(c)}, so ${lin(1 - k, 0, "b")} = ${num(c)} and b = ${num(b)}.`,
            ];
            wrongIntercept = [
              [c, `Takes ${num(c)}, the constant in the relation, as the y-intercept of f.`],
              [-b, `Solves b = ${k}b ${signed(c)} with a sign error, getting b = ${num(-b)}.`],
            ];
          } else {
            relation = `f(x) + f(${MINUS}x) = ${num(total)}`;
            interceptSteps = [
              `Write f(x) = mx + b. Then f(x) + f(${MINUS}x) = (mx + b) + (${MINUS}mx + b) = 2b for every x.`,
              `So 2b = ${num(total)} and b = ${num(b)}.`,
            ];
            wrongIntercept = [
              [total, `Takes ${num(total)} as the y-intercept, but the relation says 2b = ${num(total)}.`],
              [-b, `Solves 2b = ${num(total)} with a sign error, getting b = ${num(-b)}.`],
            ];
          }
          steps = [...interceptSteps, `${fromValue}${lin(p, 0, "m")} ${signed(b)} = ${num(q)}, so m = ${num(m)}.`];
          // A wrong intercept B leads to the slope (q − B)/p and the value ((q − B)r + Bp)/p.
          const slopeWith = (B) => frac(q - B, p);
          const valueWith = (B) => frac((q - B) * r + B * p, p);
          if (ask === "value") {
            key = valueAt(r);
            wrong = [
              ...wrongIntercept.map(([B, reason]) => [valueWith(B), reason]),
              [frac(q * r, p), "Treats f as proportional, as if its graph passed through the origin."],
              [b, `Gives f(0) = ${num(b)}, a value on the way, instead of f(${num(r)}).`],
            ];
          } else {
            key = m;
            wrong = [
              ...wrongIntercept.map(([B, reason]) => [slopeWith(B), reason]),
              [frac(q, p), "Divides f(" + num(p) + ") by " + num(p) + ", as if the graph passed through the origin."],
              [b, "Gives the y-intercept of the graph, not its slope."],
            ];
          }
        }
        if (finish) steps.push(finish);
        askText = ask === "value"
          ? `What is the value of f(${num(r)})?`
          : ask === "slope"
            ? "What is the slope of the graph of y = f(x) in the xy-plane?"
            : "What is the y-coordinate of the y-intercept of the graph of y = f(x) in the xy-plane?";
        if (!numeric && distinctWrongHard(key, wrong) < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 115,
          stimulus: inline ? null : { type: "equations", content: `${relation}\nf(${num(p)}) = ${num(q)}` },
          stem: inline
            ? `For the linear function f, ${relation} for all values of x, and f(${num(p)}) = ${num(q)}. ${askText}`
            : `The linear function f satisfies the given equations, and the first equation is true for all values of x. ${askText}`,
          correct: key,
          wrong: numeric ? [] : [wrong[0], ...t.shuffle(wrong.slice(1))],
          explanation: steps.join(" "),
          steps,
          principles: [
            "Two linear expressions are equal for every x only when their x-coefficients match and their constants match.",
            "A linear function has the form f(x) = mx + b, where m is the slope and b is the y-intercept.",
          ],
          trap: form === "shift"
            ? `The relation gives the change over ${h} units of x, not over 1 unit, so the slope is ${num(delta)} ÷ ${h}.`
            : "The relation says nothing about the slope; it pins down the y-intercept, which must not be read straight off its constant.",
          hint: "Write f(x) = mx + b and see what the relation says about m and b.",
          verify: () => {
            // Solve for (m, b) as two unknowns: the relation at one x and the given value, by Cramer's rule.
            const line = (mm, bb) => (x) => mm * x + bb;
            const gap = (f, x) => (form === "shift"
              ? f(x + h) - f(x) - delta
              : form === "scale" ? f(k * x) - k * f(x) - c : f(x) + f(-x) - total);
            const affine = (g) => {
              const g0 = g(0, 0);
              return [g(1, 0) - g0, g(0, 1) - g0, -g0];
            };
            const solved = cramer(
              affine((mm, bb) => gap(line(mm, bb), 1.5)),
              affine((mm, bb) => line(mm, bb)(p) - q),
            );
            if (!solved) return false;
            const f = line(...solved);
            if (![-3, 0.5, 7].every((x) => approx(gap(f, x), 0))) return false;
            const answer = ask === "value" ? f(r) : ask === "slope" ? solved[0] : f(0);
            return approx(answer, key);
          },
        };
      }
    },
  };

  return [functionValue, slopeTwoPoints, lineIntercepts, functionConstant, perpendicularLine, linearTransform, functionIdentity];
});
