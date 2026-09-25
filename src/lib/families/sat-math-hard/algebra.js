(function (root, factory) {
  const shared = typeof module === "object" && module.exports
    ? require("./shared")
    : root.SAT_MATH_HARD_SHARED;
  const families = factory(shared);
  if (typeof module === "object" && module.exports) module.exports = families;
  else root.SAT_MATH_HARD_FAMILIES = (root.SAT_MATH_HARD_FAMILIES || []).concat(families);
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  const { MINUS, num, paren } = S;

  // "3x − 4y = 7"
  function standardForm(a, b, c) {
    const head = a === 1 ? "x" : a === -1 ? `${MINUS}x` : `${num(a)}x`;
    const yTerm = Math.abs(b) === 1 ? "y" : `${num(Math.abs(b))}y`;
    return `${head} ${b < 0 ? MINUS : "+"} ${yTerm} = ${num(c)}`;
  }

  // Coefficients p, q with gcd 1, |q| >= 2 and |q| != p, so the scaled
  // coefficients used as distractors can never collide with the key.
  function baseLine(t) {
    for (;;) {
      const p = t.int(2, 9);
      const q = t.nonzero(-9, 9);
      if (Math.abs(q) >= 2 && Math.abs(q) !== p && S.gcd(p, q) === 1) return { p, q };
    }
  }

  const systemParameter = {
    id: "system-parameter-solution-count",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "solve systems",
    title: "Linear system with a parameter: no solution or infinitely many",
    recognize:
      "Parallel distinct lines give no solution and proportional equations give infinitely many; " +
      "compare coefficients after putting both equations in the same form instead of solving.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 2 },
    tricks: ["sign-error", "reversed-condition", "equivalent-form"],
    build(t) {
      const { p, q } = baseLine(t);
      const s = t.pick([2, 3, 4, 5, -2, -3, -4]);
      const variant = t.int(0, 2);
      const numeric = t.chance(0.4);
      const common = {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 95,
        hint: "Put both equations in the same form, then compare them term by term.",
      };

      if (variant === 0) {
        // px + qy = r and (sq)y = d − kx: no solution when k = sp and d ≠ sr.
        const r = t.nonzero(-12, 12);
        const B = s * q;
        const d = s * r + t.nonzero(-6, 6);
        const k = s * p;
        return {
          ...common,
          stimulus: { type: "equations", content: `${standardForm(p, q, r)}\n${num(B)}y = ${num(d)} ${MINUS} kx` },
          stem: "In the given system of equations, k is a constant. If the system has no solution, what is the value of k?",
          correct: k,
          wrong: [
            [-k, "Keeps kx on the right side, so the coefficient being matched has the wrong sign."],
            [p, "Copies the first equation's x-coefficient without scaling it by the factor that relates the y-coefficients."],
            [B, "Uses the second equation's y-coefficient in place of its x-coefficient."],
          ],
          explanation:
            `Rewrite the second equation as kx + ${num(B)}y = ${num(d)}. Its y-coefficient is ${num(s)} times the first ` +
            `equation's, so the lines are parallel exactly when k = ${paren(s)}(${p}) = ${num(k)}. The constant ${num(d)} is not ` +
            `${paren(s)}(${num(r)}) = ${num(s * r)}, so the lines are distinct and the system has no solution.`,
          steps: [
            `Move kx to the left: kx + ${num(B)}y = ${num(d)}.`,
            `Compare y-coefficients: ${num(B)} ÷ ${paren(q)} = ${num(s)}.`,
            `No solution needs the same ratio for x: k = ${paren(s)} · ${p} = ${num(k)}.`,
            `Check the constants do not share that ratio: ${paren(s)} · ${paren(r)} = ${num(s * r)} ≠ ${num(d)}.`,
          ],
          principles: [
            "ax + by = c and dx + ey = f have no solution when a/d = b/e ≠ c/f.",
            "Rearranging an equation changes the signs of the terms that cross the equals sign.",
          ],
          trap: "Reading k straight off the rearranged equation keeps the sign it had on the right side.",
          verify: () => p * B - q * k === 0 && p * d !== r * k,
        };
      }

      if (variant === 1) {
        // y = (−p/q)x + c and kx + By = D: no solution when −k/B = −p/q and D ≠ Bc.
        const c = t.nonzero(-9, 9);
        const B = s * q;
        const D = B * c + t.nonzero(-6, 6);
        const k = s * p;
        const slope = `${q > 0 ? MINUS : ""}(${p}/${Math.abs(q)})`;
        return {
          ...common,
          stimulus: {
            type: "equations",
            content: `y = ${slope}x ${c < 0 ? MINUS : "+"} ${Math.abs(c)}\nkx ${B < 0 ? MINUS : "+"} ${Math.abs(B)}y = ${num(D)}`,
          },
          stem: "In the given system of equations, k is a constant. If the system has no solution, what is the value of k?",
          correct: k,
          wrong: [
            [-k, "Treats the slope of kx + By = D as k/B instead of −k/B."],
            [p, "Matches the numerator of the slope without scaling to the second equation's y-coefficient."],
            [B, "Uses the y-coefficient of the second equation as if it were k."],
          ],
          explanation:
            `The first line has slope ${S.frac(-p, q)}. The line kx + ${num(B)}y = ${num(D)} has slope −k/${num(B)}. ` +
            `Parallel lines need −k/${num(B)} = ${S.frac(-p, q)}, so k = ${num(k)}. Their y-intercepts ` +
            `(${num(c)} and ${S.frac(D, B)}) differ, so the lines never meet.`,
          steps: [
            `Read the slope of the first line: ${S.frac(-p, q)}.`,
            `Write the slope of the second line: −k/${num(B)}.`,
            `Set the slopes equal and solve: k = ${num(k)}.`,
            `Confirm the y-intercepts differ: ${num(c)} versus ${S.frac(D, B)}.`,
          ],
          principles: [
            "The line ax + by = c has slope −a/b.",
            "Two lines with equal slopes and different intercepts never intersect.",
          ],
          trap: "Dropping the negative sign in −a/b gives the opposite value of k.",
          verify: () => p * B - q * k === 0 && p * D !== q * c * k,
        };
      }

      // px + qy = r and ax + by = sr: infinitely many when a = sp and b = sq.
      const r = t.nonzero(-9, 9);
      const D = s * r;
      const a = s * p;
      const b = s * q;
      return {
        ...common,
        stimulus: { type: "equations", content: `${standardForm(p, q, r)}\nax + by = ${num(D)}` },
        stem: "In the given system of equations, a and b are constants. If the system has infinitely many solutions, what is the value of a + b?",
        correct: a + b,
        wrong: [
          [p + q, "Adds the first equation's coefficients without scaling them to match the constant."],
          [s * (p - q), "Loses the sign of the y-coefficient while scaling."],
          [a, "Finds a but stops before adding b."],
          [-(a + b), "Scales by the opposite factor."],
        ],
        explanation:
          `Infinitely many solutions means the second equation is a multiple of the first. The constants give the ` +
          `factor: ${num(D)} ÷ ${paren(r)} = ${num(s)}. So a = ${num(a)}, b = ${num(b)}, and a + b = ${num(a + b)}.`,
        steps: [
          "Recognize that the equations must describe the same line.",
          `Find the factor from the constants: ${num(D)} ÷ ${paren(r)} = ${num(s)}.`,
          `Scale each coefficient: a = ${paren(s)} · ${p} = ${num(a)}, b = ${paren(s)} · ${paren(q)} = ${num(b)}.`,
          `Add: a + b = ${num(a + b)}.`,
        ],
        principles: ["A system has infinitely many solutions when one equation is a constant multiple of the other."],
        trap: "Matching only the coefficients, and not the constant, leaves the scale factor unknown.",
        verify: () => p * b - q * a === 0 && p * D === r * a && q * D === r * b,
      };
    },
  };

  /* =======================================================================
   * Local helpers for the families below. shared.js has no equivalents;
   * they live here so this file stays self-contained.
   * ===================================================================== */

  const { signed, lin, frac, approx } = S;

  // Removes floating-point dust from converted values: 0.6 * 3 -> 1.8.
  const clean = (value) => Math.round(value * 1e6) / 1e6;

  // True when the value prints exactly with at most four decimal places.
  const exact = (value) => Math.abs(value * 1e4 - Math.round(value * 1e4)) < 1e-6;

  // True when a numeric key fits the five-character answer grid.
  const fitsGrid = (value) => exact(value) && S.formatNumber(Math.abs(value)).length <= 5;

  const round2 = (value) => Math.round(value * 100) / 100;

  // "12,500" for amounts in running text; answer keys stay plain.
  function commas(value) {
    const [whole, part] = S.formatNumber(Math.abs(value)).split(".");
    const grouped = whole.length > 3 ? whole.replace(/\B(?=(\d{3})+$)/g, ",") : whole;
    return `${value < 0 ? MINUS : ""}${grouped}${part ? `.${part}` : ""}`;
  }

  // "$1,250", "$3.20", "$0.012".
  function usd(value) {
    if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) return `$${commas(value)}`;
    const cents = Math.round(value * 100);
    const rest = cents % 100;
    return `$${commas(Math.floor(cents / 100))}${rest ? `.${String(rest).padStart(2, "0")}` : ""}`;
  }

  // Multiple-choice numbers print as "2,460", as on the test; numeric keys stay plain.
  function commaChoices(instance) {
    if (instance.responseType !== "multiple-choice") return instance;
    const show = (value) => (typeof value === "number" ? commas(value) : value);
    return { ...instance, correct: show(instance.correct), wrong: instance.wrong.map(([value, reason]) => [show(value), reason]) };
  }

  // Wrong answers that survive instantiate's de-duplication against the key.
  function distinctWrong(correct, wrong) {
    const seen = new Set([S.label(correct)]);
    let count = 0;
    wrong.forEach(([value]) => {
      const text = S.label(value);
      if (!seen.has(text)) {
        seen.add(text);
        count += 1;
      }
    });
    return count;
  }

  // Compiles a displayed expression ("(5Tm − 2h)/3", "0.8wd²/s") into a
  // function of its single-letter variables. Juxtaposition binds tighter than
  // "/", as in "5Tm/3" = (5Tm)/3. Verification evaluates the exact text a
  // student reads, so a typo in a choice cannot hide behind correct code.
  function compile(text) {
    const source = text.replace(/\s+/g, "").replace(/(\d),(?=\d{3}(?!\d))/g, "$1");
    const tokens = source.match(/\d+(?:\.\d+)?|\.\d+|[A-Za-z]|[()+\-−/·×²³⁴]/g) || [];
    if (tokens.join("") !== source) throw new Error(`cannot read "${text}"`);
    const exponents = { "²": 2, "³": 3, "⁴": 4 };
    const isMinus = (token) => token === "-" || token === MINUS;
    let position = 0;
    const peek = () => tokens[position];

    function primary() {
      const token = tokens[position++];
      if (token === "(") {
        const inner = sum();
        if (tokens[position++] !== ")") throw new Error(`unbalanced "${text}"`);
        return inner;
      }
      if (/^[\d.]/.test(token || "")) {
        const value = Number(token);
        return () => value;
      }
      if (/^[A-Za-z]$/.test(token || "")) {
        return (values) => {
          if (!(token in values)) throw new Error(`unbound ${token} in "${text}"`);
          return values[token];
        };
      }
      throw new Error(`unexpected "${token}" in "${text}"`);
    }
    function power() {
      let node = primary();
      while (exponents[peek()]) {
        const exponent = exponents[tokens[position++]];
        const base = node;
        node = (values) => base(values) ** exponent;
      }
      return node;
    }
    function product() {
      let node;
      if (isMinus(peek())) {
        position += 1;
        const inner = power();
        node = (values) => -inner(values);
      } else node = power();
      while (peek() !== undefined && (/^[\d.A-Za-z(]/.test(peek()) || peek() === "·" || peek() === "×")) {
        if (peek() === "·" || peek() === "×") position += 1;
        const left = node;
        const right = power();
        node = (values) => left(values) * right(values);
      }
      return node;
    }
    function quotient() {
      let node = product();
      while (peek() === "/") {
        position += 1;
        const left = node;
        const right = product();
        node = (values) => left(values) / right(values);
      }
      return node;
    }
    function sum() {
      let node = quotient();
      while (peek() === "+" || isMinus(peek())) {
        const add = tokens[position++] === "+";
        const left = node;
        const right = quotient();
        node = add ? (values) => left(values) + right(values) : (values) => left(values) - right(values);
      }
      return node;
    }
    const fn = sum();
    if (position !== tokens.length) throw new Error(`trailing text in "${text}"`);
    return fn;
  }

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
    const model = compile(right);
    const letters = [...new Set(right.match(/[A-Za-z]/g))];
    if (keyText.includes(target)) return false;
    const key = compile(keyText);
    const wrongs = wrongTexts.map(compile);
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

  // The line through the first two shown points, checked against the rest.
  // Verification rebuilds f from what the student sees, not from m and b0.
  function lineFrom(points) {
    const [[x1, y1], [x2, y2]] = points;
    const slope = (y2 - y1) / (x2 - x1);
    const f = (x) => y1 + slope * (x - x1);
    return { f, slope, consistent: points.every(([x, y]) => approx(f(x), y)) };
  }

  function slopeWork(points) {
    const [[x1, y1], [x2, y2]] = points;
    return `(${num(y2)} ${MINUS} ${paren(y1)}) ÷ (${num(x2)} ${MINUS} ${paren(x1)})`;
  }

  const rightOrLeft = (h) => (h > 0 ? "right" : "left");
  const upOrDown = (v) => (v > 0 ? "up" : "down");

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
          if (distinctWrong(r, wrong) < 3) continue;
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
          if (Math.abs(key) > 99 || distinctWrong(key, wrong) < 3) continue;
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
          if (distinctWrong(key, wrong) < 3) continue;
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

  /* -------------------------------------------- inequality-integer-optimization */

  const budgetScenes = [
    {
      xs: "small trays", ys: "large trays", items: "trays", a: [8, 18], b: [22, 45], scale: 10,
      setup: (a, b) =>
        `A caterer is preparing small trays and large trays for an event. Each small tray costs ${usd(a)} to ` +
        `prepare, and each large tray costs ${usd(b)} to prepare.`,
      limits: (C, L, N) =>
        `The caterer can spend at most ${usd(C)}, must prepare at least ${L} large trays, and can deliver at most ${N} trays in total.`,
      ask: "What is the maximum number of small trays the caterer can prepare?",
    },
    {
      xs: "tablets", ys: "laptops", items: "devices", a: [150, 320], b: [420, 900], scale: 100,
      setup: (a, b) => `A school is buying tablets and laptops. Each tablet costs ${usd(a)}, and each laptop costs ${usd(b)}.`,
      limits: (C, L, N) =>
        `The school can spend at most ${usd(C)}, must buy at least ${L} laptops, and has charging carts with ` +
        `room for at most ${N} devices in total.`,
      ask: "What is the maximum number of tablets the school can buy?",
    },
    {
      xs: "shrubs", ys: "trees", items: "plants", a: [12, 30], b: [55, 120], scale: 50,
      setup: (a, b) => `A park crew is buying shrubs and trees for a new garden. Each shrub costs ${usd(a)}, and each tree costs ${usd(b)}.`,
      limits: (C, L, N) =>
        `The crew can spend at most ${usd(C)}, must plant at least ${L} trees, and has space for at most ${N} plants in total.`,
      ask: "What is the maximum number of shrubs the crew can buy?",
    },
  ];

  const revenueScenes = [
    {
      xs: "mugs", ys: "tote bags", a: [6, 15], b: [16, 28], scale: 50,
      setup: (a, b, P, R) =>
        `A club is selling mugs for ${usd(a)} each and tote bags for ${usd(b)} each to raise at least ${usd(R)}. ` +
        `The club has only ${P} mugs to sell.`,
      ask: "What is the minimum number of tote bags the club must sell to reach its goal?",
    },
    {
      xs: "baskets of peaches", ys: "baskets of plums", a: [9, 16], b: [11, 22], scale: 25,
      setup: (a, b, P, R) =>
        `A farm stand sells baskets of peaches for ${usd(a)} each and baskets of plums for ${usd(b)} each. ` +
        `Only ${P} baskets of peaches are available this week, and the stand's goal is at least ${usd(R)} in sales.`,
      ask: "What is the minimum number of baskets of plums the stand must sell this week to meet its goal?",
    },
    {
      xs: "balcony tickets", ys: "floor tickets", a: [18, 32], b: [36, 65], scale: 100,
      setup: (a, b, P, R) =>
        `A theater sells balcony tickets for ${usd(a)} each and floor tickets for ${usd(b)} each. The balcony ` +
        `has ${P} seats, and the theater needs ticket sales of at least ${usd(R)} for a performance.`,
      ask: "What is the minimum number of floor tickets the theater must sell for that performance?",
    },
  ];

  const ratioScenes = [
    {
      xs: "trees", ys: "shrubs", xOne: "tree", a: [30, 75], b: [6, 18], scale: 50,
      setup: (a, b, k, C) =>
        `A landscaper is buying trees for ${usd(a)} each and shrubs for ${usd(b)} each. The landscaper must buy ` +
        `at least ${k} times as many shrubs as trees and can spend at most ${usd(C)}.`,
      ask: "What is the maximum number of trees the landscaper can buy?",
    },
    {
      xs: "desks", ys: "chairs", xOne: "desk", a: [120, 260], b: [35, 90], scale: 100,
      setup: (a, b, k, C) =>
        `An office manager is ordering desks for ${usd(a)} each and chairs for ${usd(b)} each. The order must ` +
        `include at least ${k} times as many chairs as desks and can cost at most ${usd(C)}.`,
      ask: "What is the maximum number of desks the manager can order?",
    },
    {
      xs: "basketballs", ys: "cones", xOne: "basketball", a: [18, 35], b: [2, 6], scale: 25,
      setup: (a, b, k, C) =>
        `A coach is buying basketballs for ${usd(a)} each and practice cones for ${usd(b)} each. The coach needs ` +
        `at least ${k} times as many cones as basketballs and can spend at most ${usd(C)}.`,
      ask: "What is the maximum number of basketballs the coach can buy?",
    },
  ];

  const resourceScenes = [
    {
      the: "the workshop", intro: "A workshop makes chairs and tables.", xs: "chairs", ys: "tables",
      xOne: "chair", yOne: "table", r1: "Labor (hours)", r2: "Lumber (board feet)", n1: "labor", n2: "lumber",
    },
    {
      the: "the bakery", intro: "A bakery makes loaves of bread and cakes.", xs: "loaves", ys: "cakes",
      xOne: "loaf", yOne: "cake", r1: "Prep time (minutes)", r2: "Flour (cups)", n1: "prep time", n2: "flour",
    },
    {
      the: "the print shop", intro: "A print shop makes posters and banners.", xs: "posters", ys: "banners",
      xOne: "poster", yOne: "banner", r1: "Ink (milliliters)", r2: "Paper (square feet)", n1: "ink", n2: "paper",
    },
  ];

  const inequalityOptimization = {
    id: "inequality-integer-optimization",
    domain: "Algebra",
    skill: "Linear inequalities",
    subskill: "systems of inequalities",
    title: "Whole-number optimum under several linear constraints",
    recognize:
      "Every stated limit is an inequality; the answer is set by whichever one binds first, and a count must be " +
      "rounded in the direction that keeps every inequality true, not to the nearest whole number.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["rounding-direction", "wrong-quantity", "intermediate-value", "reversed-condition"],
    build(t) {
      const variant = t.int(0, 3);
      const numeric = t.chance(0.45);
      const common = {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 115,
        stimulus: null,
      };

      if (variant === 0) {
        // Budget, a minimum of the other item, and a total-count limit.
        for (;;) {
          const scene = t.pick(budgetScenes);
          const a = t.int(...scene.a);
          const b = t.int(...scene.b);
          const L = t.int(4, 15);
          const target = t.int(14, 60);
          const C = Math.ceil((a * target + b * L + 1) / scene.scale) * scene.scale;
          if (C > a * (target + 1) + b * L - 1) continue;
          const quotient = (C - b * L) / a;
          const key = Math.floor(quotient);
          const N = key + L + t.int(2, 5);
          const wrong = [
            [key + 1, `Rounds ${num(round2(quotient))} up; ${key + 1} ${scene.xs} plus ${L} ${scene.ys} cost more than ${usd(C)}.`],
            [N - L, `Uses only the ${N}-${scene.items.replace(/s$/, "")} limit and never checks the budget.`],
            [key + L, `Gives the total number of ${scene.xs} and ${scene.ys}, not the number of ${scene.xs}.`],
            [Math.floor(C / a), `Leaves the required ${scene.ys} out of the budget.`],
          ];
          if (distinctWrong(key, wrong) < 3) continue;
          return commaChoices({
            ...common,
            stem: `${scene.setup(a, b)} ${scene.limits(C, L, N)} ${scene.ask}`,
            correct: key,
            wrong,
            explanation:
              `To leave the most money for ${scene.xs}, buy only the required ${L} ${scene.ys}, which cost ${usd(b * L)}. ` +
              `That leaves ${usd(C - b * L)}, so ${a}x ≤ ${commas(C - b * L)} and x ≤ ${num(round2(quotient))}. ` +
              `A whole number of ${scene.xs} cannot exceed that, so x ≤ ${key}. Then ${key} + ${L} = ${key + L} ≤ ${N}, ` +
              `so the ${N}-${scene.items.replace(/s$/, "")} limit is also met.`,
            steps: [
              `Write the limits: ${a}x + ${b}y ≤ ${commas(C)}, y ≥ ${L}, and x + y ≤ ${N}.`,
              `Use the smallest allowed y, ${L}: ${a}x ≤ ${commas(C - b * L)}.`,
              `x ≤ ${num(round2(quotient))}, so the greatest whole number is ${key}, rounding down.`,
              `Check the count limit: ${key} + ${L} = ${key + L} ≤ ${N}.`,
            ],
            principles: [
              "A maximum under several limits is set by the limit that binds first.",
              "A whole-number count that must stay under a limit is rounded down, whatever the decimal.",
            ],
            trap: `Rounding ${num(round2(quotient))} to the nearest whole number breaks the budget, and the count limit looks binding but is not.`,
            hint: "Check every stated limit, and ask which way a count may be rounded without breaking one.",
            verify: () => {
              let best = -1;
              for (let x = 0; x <= N; x += 1) {
                for (let y = L; x + y <= N; y += 1) {
                  if (a * x + b * y <= C) {
                    best = x;
                    break;
                  }
                }
              }
              return best === key;
            },
          });
        }
      }

      if (variant === 1) {
        // A revenue floor with a cap on the other item: the minimum count.
        for (;;) {
          const scene = t.pick(revenueScenes);
          const a = t.int(...scene.a);
          const b = t.int(...scene.b);
          const P = t.int(20, 80);
          const target = t.int(12, 70);
          const low = a * P + b * (target - 1) + 1;
          const R = Math.ceil(low / scene.scale) * scene.scale;
          if (R > a * P + b * target - 1) continue;
          const need = R - a * P;
          const quotient = need / b;
          const key = Math.ceil(quotient);
          const wrong = [
            [key - 1, `Rounds ${num(round2(quotient))} down; ${key - 1} ${scene.ys} leave the total short of ${usd(R)}.`],
            [Math.ceil(R / b), `Ignores the money from the ${scene.xs}.`],
            [P + key, `Gives the total number of ${scene.xs} and ${scene.ys}, not the number of ${scene.ys}.`],
            [need, `Stops at the amount, in dollars, still needed after the ${scene.xs}.`],
          ];
          if (distinctWrong(key, wrong) < 3) continue;
          return commaChoices({
            ...common,
            stem: `${scene.setup(a, b, P, R)} ${scene.ask}`,
            correct: key,
            wrong,
            explanation:
              `The fewest ${scene.ys} are needed when all ${P} ${scene.xs} are sold, bringing in ${usd(a * P)}. The rest, ` +
              `${usd(need)}, must come from ${scene.ys}: ${b}y ≥ ${commas(need)}, so y ≥ ${num(round2(quotient))}. ` +
              `The smallest whole number that reaches the goal is ${key}, rounding up.`,
            steps: [
              `Write the conditions: ${a}x + ${b}y ≥ ${commas(R)} with x ≤ ${P}.`,
              `y is smallest when x is as large as possible, x = ${P}: ${b}y ≥ ${commas(need)}.`,
              `y ≥ ${num(round2(quotient))}, so the least whole number is ${key}, rounding up.`,
            ],
            principles: [
              "To minimize one quantity, push the other as far as its own limit allows.",
              "A whole-number count that must reach a goal is rounded up, whatever the decimal.",
            ],
            trap: `Rounding ${num(round2(quotient))} down, or to the nearest whole number, leaves the goal unmet.`,
            hint: "Ask how many of the other item can help, and which way a count must be rounded to reach the goal.",
            verify: () => {
              for (let y = 0; y <= 5000; y += 1) {
                for (let x = 0; x <= P; x += 1) if (a * x + b * y >= R) return y === key;
              }
              return false;
            },
          });
        }
      }

      if (variant === 2) {
        // "At least k times as many": the ratio ties the second item to the first.
        for (;;) {
          const scene = t.pick(ratioScenes);
          const a = t.int(...scene.a);
          const b = t.int(...scene.b);
          const k = t.int(2, 4);
          const unit = a + k * b;
          const target = t.int(6, 40);
          const C = Math.ceil((unit * target + 1) / scene.scale) * scene.scale;
          if (C > unit * (target + 1) - 1) continue;
          const quotient = C / unit;
          const key = Math.floor(quotient);
          const reversed = Math.floor((C * k) / (a * k + b));
          const wrong = [
            [key + 1, `Rounds ${num(round2(quotient))} up; ${key + 1} ${scene.xs} with the ${scene.ys} they require cost more than ${usd(C)}.`],
            [reversed, `Reverses the ratio, requiring ${k} times as many ${scene.xs} as ${scene.ys}.`],
            [k * key, `Gives the number of ${scene.ys}, not ${scene.xs}.`],
            [Math.floor(C / a), `Leaves the ${scene.ys} out of the budget.`],
          ];
          if (distinctWrong(key, wrong) < 3) continue;
          return commaChoices({
            ...common,
            stem: `${scene.setup(a, b, k, C)} ${scene.ask}`,
            correct: key,
            wrong,
            explanation:
              `With x ${scene.xs} and y ${scene.ys}, the conditions are y ≥ ${k}x and ${a}x + ${b}y ≤ ${commas(C)}. The budget ` +
              `goes furthest with the fewest ${scene.ys}, y = ${k}x, so ${a}x + ${b}(${k}x) = ${unit}x ≤ ${commas(C)} and ` +
              `x ≤ ${num(round2(quotient))}. The greatest whole number is ${key}.`,
            steps: [
              `Translate the ratio: y ≥ ${k}x (not x ≥ ${k}y).`,
              `Use the fewest ${scene.ys} allowed, y = ${k}x: ${a}x + ${b * k}x = ${unit}x ≤ ${commas(C)}.`,
              `x ≤ ${num(round2(quotient))}, so the greatest whole number is ${key}, rounding down.`,
            ],
            principles: [
              `"At least k times as many B as A" means B ≥ kA.`,
              "A whole-number count that must stay under a limit is rounded down.",
            ],
            trap: `"At least ${k} times as many ${scene.ys} as ${scene.xs}" is y ≥ ${k}x; writing it the other way round lets the budget stretch too far.`,
            hint: "Write the comparison between the two items as an inequality before touching the budget.",
            verify: () => {
              let best = -1;
              for (let x = 0; a * x <= C; x += 1) {
                for (let y = 0; a * x + b * y <= C; y += 1) {
                  if (y >= k * x) {
                    best = x;
                    break;
                  }
                }
              }
              return best === key;
            },
          });
        }
      }

      // Two resources and a fixed count of the other product.
      for (;;) {
        const scene = t.pick(resourceScenes);
        const use1 = [t.int(2, 6), t.int(2, 8)];
        const use2 = [use1[0] + t.int(2, 7), use1[1] + t.int(2, 9)];
        const T = t.int(4, 15);
        const target = t.int(15, 50);
        const bind = t.int(0, 1);
        const other = 1 - bind;
        const gap = t.int(2, 6);
        const avail = [0, 0];
        avail[bind] = use2[bind] * T + use1[bind] * target + t.int(1, use1[bind] - 1);
        avail[other] = use2[other] * T + use1[other] * (target + gap) + t.int(0, use1[other] - 1);
        const bounds = [0, 1].map((index) => (avail[index] - use2[index] * T) / use1[index]);
        const key = Math.floor(bounds[bind]);
        if (key !== target || Math.floor(bounds[other]) !== target + gap) continue;
        const names = [scene.n1, scene.n2];
        const wrong = [
          [Math.floor(bounds[other]), `Checks only the ${names[other]} limit.`],
          [key + 1, `Rounds the ${names[bind]} limit, ${num(round2(bounds[bind]))}, up.`],
          [key + T, `Gives the total number of ${scene.xs} and ${scene.ys}.`],
          [Math.min(Math.floor(avail[0] / use1[0]), Math.floor(avail[1] / use1[1])), `Leaves the ${T} ${scene.ys} out of the ${names[0]} and ${names[1]} totals.`],
        ];
        if (distinctWrong(key, wrong) < 3) continue;
        const rows = [
          [`Each ${scene.xOne}`, use1[0], use1[1]],
          [`Each ${scene.yOne}`, use2[0], use2[1]],
          ["Available", avail[0], avail[1]],
        ];
        const limitLine = (index) =>
          `${names[index]}: ${use1[index]}x + ${use2[index]}(${T}) ≤ ${avail[index]}, so x ≤ ${num(round2(bounds[index]))}`;
        return commaChoices({
          ...common,
          stimulus: { type: "table", content: S.table(["Item", scene.r1, scene.r2], rows) },
          stem:
            `${scene.intro} The table shows the ${scene.n1} and ${scene.n2} needed for each item and the amounts ` +
            `available this week. If ${scene.the} makes exactly ${T} ${scene.ys} this week, what is the maximum ` +
            `number of ${scene.xs} it can make?`,
          correct: key,
          wrong,
          explanation:
            `With x ${scene.xs} and ${T} ${scene.ys}: ${limitLine(0)}; ${limitLine(1)}. Both must hold, so x can be no ` +
            `more than ${num(round2(bounds[bind]))}, and the greatest whole number is ${key}.`,
          steps: [
            `Subtract what the ${T} ${scene.ys} use from each available amount.`,
            `${limitLine(0)}.`,
            `${limitLine(1)}.`,
            `The smaller bound, from ${names[bind]}, governs; round down to ${key}.`,
          ],
          principles: [
            "When several resources limit production, the scarcest one sets the maximum.",
            "A whole-number count that must stay under a limit is rounded down.",
          ],
          trap: `The ${names[other]} limit allows more ${scene.xs} than the ${names[bind]} limit does, and rounding up breaks the ${names[bind]} limit.`,
          hint: "Every resource in the table is a separate limit; see which runs out first.",
          verify: () => {
            let best = -1;
            for (let x = 0; x < 1000; x += 1) {
              if (use1[0] * x + use2[0] * T <= avail[0] && use1[1] * x + use2[1] * T <= avail[1]) best = x;
            }
            return best === key;
          },
        });
      }
    },
  };

  /* -------------------------------------------------- literal-equation-rearrange */

  // y = (pA ± qB)/(rC), invented but plausible weighted-rate formulas.
  const rateScenes = [
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
        `${usd(k)} per pound are mixed in, the value of the blend, in dollars per pound, is p, as given by the equation.`,
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
          const scene = t.pick(rateScenes);
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
        if (distinctWrong(keyText, wrong) < 3) continue;
        const keyValue = ratioValue(key);
        const numeric = fitsGrid(keyValue) && t.chance(0.5);
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
            const model = compile(right);
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
      when: (u, X) => `how many ${u[2]} after the tank begins to drain will it contain ${commas(X)} liters of water`,
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
      when: (u, X) => `how many ${u[2]} after the download resumes will ${commas(X)} megabytes have been downloaded`,
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
      when: (u, X) => `what is the weight, in ${u[2]}, of a package that costs ${usd(X)} to ship`,
    },
    {
      out: "C", F: 3, dir: 1, small: ["f", "foot", "feet"], big: ["y", "yard", "yards"],
      rates: [0.6, 0.8, 1.2, 1.5, 2.4, 2.5], start: () => [2, 9, 1],
      model: (u) => `gives the cost C, in dollars, of ${u[0]} ${u[2]} of rope, including a fixed cutting fee`,
      change: (u) => `by how many dollars does the cost increase for each additional ${u[1]} of rope`,
      after: (u) => `Gives the cost of 1 ${u[1]} of rope, not the change for each ${u[1]}.`,
      input: (u) => `${u[0]}, the length of rope in ${u[2]}`,
      spans: { big: [4, 5, 8, 10, 12], small: [6, 9, 12, 15, 24] },
      when: (u, X) => `how many ${u[2]} of rope cost ${usd(X)}`,
    },
    {
      out: "E", F: 60, dir: 1, small: ["m", "minute", "minutes"], big: ["h", "hour", "hours"],
      rates: [4, 4.5, 5, 6, 7.5, 8, 9], start: () => [1200, 5400, 50],
      model: (u) => `gives a hiker's elevation E, in feet, ${u[0]} ${u[2]} after the hiker starts a climb`,
      change: (u) => `by how many feet does the hiker's elevation increase each ${u[1]}`,
      after: (u) => `Gives the hiker's elevation after 1 ${u[1]}, not the change in each ${u[1]}.`,
      input: (u) => `${u[0]}, the number of ${u[2]} after the hiker starts the climb`,
      spans: { big: [1.5, 2, 2.5, 3, 4], small: [15, 20, 30, 45, 90] },
      when: (u, X) => `how many ${u[2]} after starting the climb will the hiker reach an elevation of ${commas(X)} feet`,
    },
  ];

  // Scaled-count inputs for the interpretation form: n counts groups of `size`.
  const groupScenes = [
    {
      out: "C", size: 100, group: "100 gallons", one: "gallon", counts: "hundreds of gallons", a: [1.8, 2.4, 2.6, 3.2, 3.5, 4.1], b: [18, 25, 32, 40, 45],
      desc: "the monthly cost C, in dollars, of water for a household that uses n hundred gallons of water",
      rate: (x, per) => `The monthly cost increases by ${usd(x)} for each additional ${per} used.`,
      total: (x, per) => `The monthly cost for ${per} of water is ${usd(x)}.`,
      base: (x) => `The monthly cost is ${usd(x)} when no water is used.`,
    },
    {
      out: "C", size: 100, group: "100 flyers", one: "flyer", counts: "hundreds of flyers", a: [3.5, 4.5, 5.2, 6.4, 7.5], b: [12, 15, 18, 24, 30],
      desc: "the cost C, in dollars, to print n hundred flyers",
      rate: (x, per) => `The cost increases by ${usd(x)} for each additional ${per} printed.`,
      total: (x, per) => `The cost to print ${per} is ${usd(x)}.`,
      base: (x) => `The cost includes a fee of ${usd(x)} that does not depend on the number of flyers.`,
    },
    {
      out: "C", size: 12, group: "dozen cookies", one: "cookie", counts: "dozens of cookies", a: [9, 10.5, 13.5, 15, 16.5], b: [8, 10, 14, 15, 20],
      desc: "the cost C, in dollars, of a catering order of n dozen cookies",
      rate: (x, per) => `The cost increases by ${usd(x)} for each additional ${per} ordered.`,
      total: (x, per) => `An order of 1 ${per} costs ${usd(x)}.`,
      base: (x) => `The order includes a fee of ${usd(x)} that does not depend on the number of cookies.`,
    },
  ];

  // "V = 900 − 0.4t" or "V = −0.4t + 900", in the scene's variable.
  function modelText(scene, rate, start, letter, rateFirst) {
    const term = `${commas(rate)}${letter}`;
    if (rateFirst) return `${scene.out} = ${scene.dir < 0 ? MINUS : ""}${term} + ${commas(start)}`;
    return `${scene.out} = ${commas(start)} ${scene.dir < 0 ? MINUS : "+"} ${term}`;
  }

  const linearModelUnits = {
    id: "linear-model-interpretation",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    subskill: "equation modeling",
    title: "Linear model read in a different unit",
    recognize:
      "The coefficient is a rate in the model's own input unit; before interpreting or rewriting it, convert that " +
      "rate to the unit the question uses, and leave the starting value alone.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
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
        if (aboutRate) {
          key = scene.rate(a, scene.group);
          wrong = [
            [scene.rate(clean(a + b), scene.group), `Treats the cost for the first ${scene.group}, which includes the fixed ${usd(b)}, as the rate.`],
            [scene.rate(a, perOne), `Reads ${num(a)} per ${scene.one}, but n counts groups of ${scene.size}.`],
            [scene.total(a, scene.group), `Confuses the rate with a total: C is ${usd(clean(a + b))}, not ${usd(a)}, when n = 1.`],
            [scene.rate(clean(a * scene.size), perOne), `Converts in the wrong direction, multiplying by ${scene.size} instead of dividing.`],
          ];
          claims = { key: ["rate", 1, a], wrong: [["rate", 1, clean(a + b)], ["rate", 1 / scene.size, a], ["total", 1, a], ["rate", 1 / scene.size, clean(a * scene.size)]] };
        } else {
          key = scene.base(b);
          wrong = [
            [scene.rate(b, scene.group), `Treats the fixed amount ${usd(b)} as the rate for each ${scene.group}.`],
            [scene.total(b, scene.group), `Takes ${usd(b)} as the cost when n = 1; it is the cost when n = 0.`],
            [scene.rate(b, perOne), `Treats ${usd(b)} as a rate, and per ${scene.one} rather than per ${scene.group}.`],
          ];
          claims = { key: ["base", 0, b], wrong: [["rate", 1, b], ["total", 1, b], ["rate", 1 / scene.size, b]] };
        }
        const model = compile(equation.split(" = ")[1]);
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
              `groups of ${scene.size}, that is a change of ${usd(a)} for each additional ${scene.group}.`
            : `${num(b)} is the value of C when n = 0, the part of the cost that does not depend on how much is bought or used.`,
          steps: aboutRate
            ? [
              `In C = ${num(a)}n + ${num(b)}, the coefficient of n is the change in C per unit of n.`,
              `n counts ${scene.counts}, so an increase of 1 in n means ${scene.size} more ${scene.one}s, not 1 more ${scene.one}.`,
              `So C increases by ${usd(a)} for each additional ${scene.group}.`,
            ]
            : [
              `Set n = 0: C = ${num(b)}.`,
              `n = 0 means nothing is bought or used, so ${usd(b)} does not depend on n.`,
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
            [convert(level / coefficient), `Divides ${commas(level)} by the rate, ignoring the starting value ${commas(start)}.`],
            [clean(up ? modelSpan * scene.F : modelSpan / scene.F), `Converts ${modelUnit[2]} to ${askUnit[2]} by ${verb} by ${commas(scene.F)} instead of ${inverse}.`],
            [convert((start + level) / coefficient), `Adds ${commas(start)} and ${commas(level)} instead of finding the change between them.`],
          ].filter(([value]) => value > 0 && exact(value));
          if (distinctWrong(span, wrong) < 3) continue;
          const numeric = fitsGrid(span) && t.chance(0.6);
          const changeAmount = clean(Math.abs(level - start));
          const unitLine = up
            ? `${commas(modelSpan)} ${modelUnit[2]} ÷ ${scene.F} = ${num(span)} ${askUnit[2]}`
            : `${num(modelSpan)} ${modelUnit[2]} × ${commas(scene.F)} = ${commas(span)} ${askUnit[2]}`;
          return commaChoices({
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 105,
            stimulus: null,
            stem: `${intro} According to the equation, ${scene.when(askUnit, level)}?`,
            correct: span,
            wrong,
            explanation:
              `Set the expression equal to ${commas(level)}: the change from ${commas(start)} is ${commas(changeAmount)}, and at ` +
              `${num(coefficient)} per ${modelUnit[1]} that takes ${commas(changeAmount)} ÷ ${num(coefficient)} = ` +
              `${commas(modelSpan)} ${modelUnit[2]}. In ${askUnit[2]}, that is ${unitLine}.`,
            steps: [
              `Set ${model.split(" = ")[1]} equal to ${commas(level)}.`,
              `Solve: ${modelUnit[0]} = ${commas(changeAmount)} ÷ ${num(coefficient)} = ${commas(modelSpan)} ${modelUnit[2]}.`,
              `Convert to the unit asked for: ${unitLine}.`,
            ],
            principles: [
              "Solving a linear model for its input gives the input in the model's own unit.",
              "Convert a quantity only after it is found, and check the direction: more small units, fewer large ones.",
            ],
            trap: `Solving the equation gives ${num(modelSpan)} ${modelUnit[2]}; the question asks in ${askUnit[2]}.`,
            hint: "Check which unit the model's input uses before you answer.",
            verify: () => {
              const f = compile(model.split(" = ")[1]);
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
            [wrongWay, `Converts by ${inverse} by ${commas(scene.F)} instead of ${verb}.`],
            [after, scene.after(askUnit)],
          ].filter(([value]) => exact(value));
          if (distinctWrong(key, wrong) < 3) continue;
          const numeric = fitsGrid(key) && t.chance(0.6);
          const factorWord = `${commas(scene.F)} ${scene.small[2]} in 1 ${scene.big[1]}`;
          return commaChoices({
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 80,
            stimulus: null,
            stem: `${intro} According to the equation, ${scene.change(askUnit)}?`,
            correct: key,
            wrong,
            explanation:
              `The coefficient ${num(coefficient)} is the change per ${modelUnit[1]}. There are ${factorWord}, so the ` +
              `change per ${askUnit[1]} is ${num(coefficient)} ${up ? "×" : "÷"} ${commas(scene.F)} = ${num(key)}.`,
            steps: [
              `Read the rate in the model's unit: ${num(coefficient)} per ${modelUnit[1]}.`,
              `Relate the units: ${factorWord}.`,
              `Convert: ${num(coefficient)} ${up ? "×" : "÷"} ${commas(scene.F)} = ${num(key)} per ${askUnit[1]}.`,
            ],
            principles: [
              "The coefficient of a linear model is the change in output per 1 unit of the input, in the input's own unit.",
              "A rate per small unit becomes a rate per large unit by multiplying by the number of small units in the large one.",
            ],
            trap: `The equation's ${num(coefficient)} is per ${modelUnit[1]}; the question asks per ${askUnit[1]}.`,
            hint: "Check which unit the model's input uses.",
            verify: () => {
              const f = compile(model.split(" = ")[1]);
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
        const candidates = [
          [eq(coefficient, start), `Keeps the per-${modelUnit[1]} rate while switching the variable to ${askUnit[2]}.`],
          [eq(wrongWay, start), `Converts the rate by ${inverse} by ${commas(scene.F)} instead of ${verb}.`],
          [eq(key, scaledStart), `Converts the starting value as well as the rate; ${commas(start)} stays the same when the input's unit changes.`],
        ];
        const exactValues = [coefficient, wrongWay, key];
        const wrong = candidates.filter((entry, index) => exact(index === 2 ? scaledStart : exactValues[index]));
        if (distinctWrong(keyEq, wrong) < 3) continue;
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 85,
          stimulus: null,
          stem: `${intro} Which equation gives ${scene.out} in terms of ${scene.input(askUnit)}?`,
          correct: keyEq,
          wrong,
          explanation:
            `${num(coefficient)} per ${modelUnit[1]} is ${num(key)} per ${askUnit[1]}, because ` +
            `${up ? `1 ${askUnit[1]} = ${commas(scene.F)} ${modelUnit[2]}` : `1 ${askUnit[1]} = 1/${commas(scene.F)} ${modelUnit[1]}`}. ` +
            `The starting value ${commas(start)} is the same in any unit, so ${keyEq}.`,
          steps: [
            `Express the old input in the new unit: ${modelUnit[0]} = ${up ? `${commas(scene.F)}${newLetter}` : `${newLetter}/${commas(scene.F)}`}.`,
            `Substitute: the rate term becomes ${num(coefficient)} · ${up ? `${commas(scene.F)}${newLetter}` : `${newLetter}/${commas(scene.F)}`} = ${num(key)}${newLetter}.`,
            `Keep the constant: ${keyEq}.`,
          ],
          principles: [
            "Changing the unit of the input rescales the coefficient, not the constant term.",
            "Substituting the unit relationship into the model is safer than guessing which way to convert.",
          ],
          trap: "Scaling every term of the equation, or converting in the wrong direction, gives an equation that looks right but is not equivalent.",
          hint: `Write the old variable, ${modelUnit[0]}, in terms of the new one, ${newLetter}.`,
          verify: () => {
            const oldModel = compile(model.split(" = ")[1]);
            const newModel = compile(keyEq.split(" = ")[1]);
            const others = candidates.map(([text]) => compile(text.split(" = ")[1]));
            const toOld = (value) => (up ? value * scene.F : value / scene.F);
            const values = [1.5, 2, 4.25];
            const agrees = (fn) => values.every((value) => approx(fn({ [newLetter]: value }), oldModel({ [modelUnit[0]]: toOld(value) })));
            return agrees(newModel) && others.every((fn) => !agrees(fn));
          },
        };
      }
    },
  };

  /* --------------------------------------------------------- two-plan-crossover */

  const planScenes = [
    {
      unit: ["class", "classes"], A: "Gym A", B: "Gym B", Bs: "Gym B's", fee: [[60, 150], [0, 40]], rate: [[400, 900], [800, 1500]], feeStep: 5,
      text: (FA, a, FB, b) =>
        `Gym A charges a one-time membership fee of ${usd(FA)} plus ${usd(a)} per class. Gym B charges a one-time ` +
        `membership fee of ${usd(FB)} plus ${usd(b)} per class.`,
      least: "What is the least number of classes for which the total cost at Gym A is less than the total cost at Gym B?",
      greatest: "What is the greatest number of classes for which the total cost at Gym B is less than the total cost at Gym A?",
    },
    {
      unit: ["mile", "miles"], A: "Company A", B: "Company B", Bs: "Company B's", fee: [[55, 95], [20, 45]], rate: [[10, 30], [35, 75]], feeStep: 1,
      text: (FA, a, FB, b) =>
        `Company A rents a van for ${usd(FA)} per day plus ${usd(a)} per mile driven. Company B rents a van for ` +
        `${usd(FB)} per day plus ${usd(b)} per mile driven.`,
      least: "For a one-day rental, what is the least whole number of miles for which renting from Company A costs less than renting from Company B?",
      greatest: "For a one-day rental, what is the greatest whole number of miles for which renting from Company B costs less than renting from Company A?",
    },
    {
      unit: ["poster", "posters"], A: "print shop A", B: "print shop B", Bs: "print shop B's", fee: [[40, 90], [5, 30]], rate: [[150, 400], [300, 700]], feeStep: 5,
      text: (FA, a, FB, b) =>
        `Print shop A charges a setup fee of ${usd(FA)} plus ${usd(a)} per poster. Print shop B charges a setup fee ` +
        `of ${usd(FB)} plus ${usd(b)} per poster.`,
      least: "What is the least number of posters for which an order from print shop A costs less than the same order from print shop B?",
      greatest: "What is the greatest number of posters for which an order from print shop B costs less than the same order from print shop A?",
    },
    {
      unit: ["week", "weeks"], A: "buying", B: "renting", Bs: "the rental's", fee: [[240, 600], [20, 60]], rate: [[300, 900], [1500, 3500]], feeStep: 10,
      text: (FA, a, FB, b) =>
        `A contractor can buy a tile saw for ${usd(FA)} and then spend ${usd(a)} per week on blades and upkeep, or ` +
        `rent the same saw for a ${usd(FB)} delivery fee plus ${usd(b)} per week.`,
      least: "What is the least number of weeks of use for which buying the saw costs less than renting it?",
      greatest: "What is the greatest number of weeks of use for which renting the saw costs less than buying it?",
    },
  ];

  const tableScenes = [
    {
      unit: ["hour", "hours"], A: "Mover A", B: "Mover B",
      text: (FA, a) => `Mover A charges a flat fee of ${usd(FA)} plus ${usd(a)} per hour of work.`,
      table: "The table shows the total cost, in dollars, of hiring Mover B for several numbers of hours. The total cost for Mover B is a linear function of the number of hours.",
      least: "What is the least whole number of hours for which hiring Mover A costs less than hiring Mover B?",
    },
    {
      unit: ["session", "sessions"], A: "Tutor A", B: "Tutor B",
      text: (FA, a) => `Tutor A charges a one-time assessment fee of ${usd(FA)} plus ${usd(a)} per session.`,
      table: "The table shows the total cost, in dollars, of several numbers of sessions with Tutor B. The total cost for Tutor B is a linear function of the number of sessions.",
      least: "What is the least number of sessions for which Tutor A costs less than Tutor B?",
    },
    {
      unit: ["day", "days"], A: "Rental A", B: "Rental B",
      text: (FA, a) => `Rental A charges a delivery fee of ${usd(FA)} plus ${usd(a)} per day for a generator.`,
      table: "The table shows the total cost, in dollars, of renting a generator from Rental B for several numbers of days. The total cost for Rental B is a linear function of the number of days.",
      least: "What is the least number of days for which Rental A costs less than Rental B?",
    },
  ];

  const meetScenes = [
    {
      unit: "minutes", amount: "liters",
      text: (SA, gA, SB, gB) =>
        `Tank A contains ${commas(SA)} liters of water and is being drained at a constant rate of ${gA} liters per ` +
        `minute. At the same time, tank B, which contains ${commas(SB)} liters of water, is being filled at a constant ` +
        `rate of ${gB} liters per minute.`,
      ask: "When the two tanks contain the same amount of water, how many liters of water are in each tank?",
      moveA: "drained from tank A", moveB: "added to tank B", signs: [-1, 1],
      inA: "the amount left in tank A", inB: "the amount in tank B",
    },
    {
      unit: "weeks", amount: "dollars",
      text: (SA, gA, SB, gB) =>
        `Account A has a balance of ${usd(SA)}, and ${usd(gA)} is added to it each week. Account B has a balance ` +
        `of ${usd(SB)}, and ${usd(gB)} is added to it each week. No other money is added or withdrawn.`,
      ask: "When the two accounts have the same balance, what is that balance, in dollars?",
      moveA: "added to account A", moveB: "added to account B", signs: [1, 1],
      inA: "account A's balance", inB: "account B's balance",
    },
    {
      unit: "years", amount: "residents",
      text: (SA, gA, SB, gB) =>
        `Town A has a population of ${commas(SA)} and is losing ${gA} residents per year. Town B has a population ` +
        `of ${commas(SB)} and is gaining ${gB} residents per year.`,
      ask: "If these trends continue, what will each town's population be when the two populations are equal?",
      moveA: "lost by town A", moveB: "gained by town B", signs: [-1, 1],
      inA: "town A's population", inB: "town B's population",
    },
  ];

  const twoPlanCrossover = {
    id: "two-plan-crossover",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "interpret intersection",
    title: "Comparing two linear plans around their crossover",
    recognize:
      "The two options are two lines; the intersection is where neither is cheaper, and the question asks about one " +
      "side of it, so decide which side, then which whole number first lands there.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["rounding-direction", "reversed-condition", "intermediate-value"],
    build(t) {
      const variant = t.int(0, 2);

      if (variant === 0) {
        for (;;) {
          const scene = t.pick(planScenes);
          const aC = t.int(...scene.rate[0]);
          const bC = t.int(...scene.rate[1]);
          const cents = [aC, bC].map((value) => Math.round(value / 5) * 5);
          const [ac, bc] = cents;
          if (bc - ac < 5) continue;
          const FA = scene.feeStep * Math.round(t.int(...scene.fee[0]) / scene.feeStep);
          const FB = scene.feeStep * Math.round(t.int(...scene.fee[1]) / scene.feeStep);
          if (FA <= FB || FB === 0) continue;
          const delta = bc - ac;
          const D = FA - FB;
          const onInteger = (100 * D) % delta === 0;
          if (onInteger !== t.chance(0.25)) continue;
          const xs = (100 * D) / delta;
          if (xs < 6 || xs > 400) continue;
          const least = Math.floor(xs) + 1;
          const greatest = Math.ceil(xs) - 1;
          const askLeast = t.chance(0.6);
          const key = askLeast ? least : greatest;
          const cross = onInteger ? num(xs) : `${commas(D)} ÷ ${num(delta / 100)} ≈ ${num(round2(xs))}`;
          const noFee = (100 * FA) / delta;
          const sumFee = (100 * (FA + FB)) / delta;
          const units = scene.unit[1];
          const wrong = askLeast
            ? [
              [Math.floor(xs), onInteger
                ? `At ${num(xs)} ${units} the two costs are equal, so ${scene.A} is not yet cheaper.`
                : `Rounds ${num(round2(xs))} down; at ${Math.floor(xs)} ${units}, ${scene.B} still costs less.`],
              [greatest, `Gives the greatest number for which ${scene.B} costs less, the opposite condition.`],
              [Math.floor(noFee) + 1, `Leaves out ${scene.Bs} ${usd(FB)} fee.`],
              [Math.floor(sumFee) + 1, "Adds the two fees instead of subtracting them."],
            ]
            : [
              [greatest + 1, onInteger
                ? `At ${num(xs)} ${units} the two costs are equal, so ${scene.B} is not cheaper there.`
                : `Gives the least number for which ${scene.A} costs less, the opposite condition.`],
              [Math.ceil(noFee) - 1, `Leaves out ${scene.Bs} ${usd(FB)} fee.`],
              [Math.ceil(sumFee) - 1, "Adds the two fees instead of subtracting them."],
              [least + 1, `Rounds ${num(round2(xs))} up and then counts one more.`],
            ];
          if (distinctWrong(key, wrong) < 3) continue;
          const [a, b] = [ac / 100, bc / 100];
          const costA = `${num(FA)} + ${num(a)}x`;
          const costB = `${num(FB)} + ${num(b)}x`;
          return commaChoices({
            responseType: t.chance(0.5) ? "numeric" : "multiple-choice",
            estimatedSeconds: 110,
            stimulus: null,
            stem: `${scene.text(FA, a, FB, b)} ${askLeast ? scene.least : scene.greatest}`,
            correct: key,
            wrong,
            explanation:
              `For x ${units}, the costs are ${costA} and ${costB} dollars. They are equal when ${num(D)} = ` +
              `${num(delta / 100)}x, at x = ${cross}. For more ${units} than that, ${scene.A} is cheaper; for fewer, ` +
              `${scene.B} is. ${askLeast
                ? `The least whole number greater than ${num(round2(xs))} is ${key}.`
                : `The greatest whole number less than ${num(round2(xs))} is ${key}.`}`,
            steps: [
              `Write both costs: ${costA} and ${costB}.`,
              `Set them equal: ${num(FA)} ${MINUS} ${num(FB)} = (${num(b)} ${MINUS} ${num(a)})x, so x = ${cross}.`,
              `The option with the smaller per-${scene.unit[0]} rate is cheaper above the crossover.`,
              askLeast
                ? `${onInteger ? `At ${num(xs)} the costs tie, so the answer is` : "Round up:"} ${key}.`
                : `${onInteger ? `At ${num(xs)} the costs tie, so the answer is` : "Round down:"} ${key}.`,
            ],
            principles: [
              "Two linear costs cross once; on each side of the crossover one option is cheaper.",
              "A strict inequality excludes the crossover itself.",
            ],
            trap: `The crossover, ${num(round2(xs))}, is not itself the answer; which whole number counts depends on which side of it the question is about.`,
            hint: "Write both totals for the same number of units and compare them.",
            verify: () => {
              const aCost = (x) => 100 * FA + ac * x;
              const bCost = (x) => 100 * FB + bc * x;
              if (askLeast) {
                for (let x = 0; x < 5000; x += 1) if (aCost(x) < bCost(x)) return x === key && aCost(x + 50) < bCost(x + 50);
                return false;
              }
              let last = -1;
              for (let x = 0; x < 5000; x += 1) if (bCost(x) < aCost(x)) last = x;
              return last === key;
            },
          });
        }
      }

      if (variant === 1) {
        // Plan B given only as a table, so its fixed fee is hidden.
        for (;;) {
          const scene = t.pick(tableScenes);
          const b = t.int(12, 60);
          const a = b - t.int(3, 18);
          if (a < 5) continue;
          const FB = 5 * t.int(2, 16);
          const FA = FB + 5 * t.int(6, 40);
          const delta = b - a;
          const D = FA - FB;
          if (D % delta === 0) continue;
          const xs = D / delta;
          if (xs < 4 || xs > 60) continue;
          const key = Math.floor(xs) + 1;
          const step = t.pick([2, 3, 4, 5]);
          const x1 = t.int(1, 4);
          const rows = [x1, x1 + step, x1 + 2 * step].map((x) => [x, FB + b * x]);
          const average = rows[0][1] / rows[0][0];
          const wrong = [
            [Math.floor(xs), `Rounds ${num(round2(xs))} down; at ${Math.floor(xs)} ${scene.unit[1]}, ${scene.B} still costs less.`],
            [Math.floor(FA / delta) + 1, `Leaves out ${scene.B}'s fixed fee of ${usd(FB)}, which the table does not show directly.`],
          ];
          if (average > a) {
            const read = rows[0][0] === 1
              ? `the ${usd(rows[0][1])} cost for 1 ${scene.unit[0]}`
              : `${usd(rows[0][1])} ÷ ${rows[0][0]}`;
            wrong.push([Math.floor(FA / (average - a)) + 1, `Takes ${read} as ${scene.B}'s cost per ${scene.unit[0]}, with no fixed fee.`]);
          }
          wrong.push([Math.ceil(xs) + 1, `Rounds ${num(round2(xs))} up and then counts one more.`]);
          if (distinctWrong(key, wrong) < 3) continue;
          const [r0, r1] = rows;
          return commaChoices({
            responseType: t.chance(0.4) ? "numeric" : "multiple-choice",
            estimatedSeconds: 120,
            stimulus: { type: "table", content: S.table([`Number of ${scene.unit[1]}`, "Total cost (dollars)"], rows) },
            stem: `${scene.text(FA, a)} ${scene.table} ${scene.least}`,
            correct: key,
            wrong,
            explanation:
              `From the table, ${scene.B}'s cost rises by ${num(r1[1] - r0[1])} every ${step} ${scene.unit[1]}, so its rate ` +
              `is ${num(b)} per ${scene.unit[0]} and its fixed fee is ${num(r0[1])} ${MINUS} ${b}(${r0[0]}) = ${num(FB)}. ` +
              `${scene.A} is cheaper when ${num(FA)} + ${a}x < ${num(FB)} + ${b}x, that is, x > ${num(D)}/${delta} ≈ ` +
              `${num(round2(xs))}. The least whole number is ${key}.`,
            steps: [
              `Rate for ${scene.B}: (${num(r1[1])} ${MINUS} ${num(r0[1])}) ÷ ${step} = ${b}.`,
              `Fixed fee for ${scene.B}: ${num(r0[1])} ${MINUS} ${b}(${r0[0]}) = ${num(FB)}.`,
              `Solve ${num(FA)} + ${a}x < ${num(FB)} + ${b}x: x > ${num(round2(xs))}.`,
              `Round up to the next whole number: ${key}.`,
            ],
            principles: [
              "A linear table's rate is the change in output divided by the change in input.",
              "The fixed part of a linear cost is its value at 0, found by working back from any row.",
            ],
            trap: `${scene.B}'s fixed fee is hidden in the table; and x > ${num(round2(xs))} needs the next whole number up.`,
            hint: `Find both parts of ${scene.B}'s cost from the table before comparing.`,
            verify: () => {
              const line = lineFrom(rows);
              if (!line.consistent) return false;
              for (let x = 0; x < 2000; x += 1) if (FA + a * x < line.f(x) - 1e-9) return x === key;
              return false;
            },
          });
        }
      }

      // Amount at the crossover of two changing quantities.
      for (;;) {
        const scene = t.pick(meetScenes);
        const [sA, sB] = scene.signs;
        const time = t.int(6, 40);
        const gA = t.int(4, 40) * (scene.amount === "dollars" ? 5 : 1);
        const gB = sA === sB ? gA + t.int(2, 12) * (scene.amount === "dollars" ? 5 : 1) : t.int(4, 40);
        // A starts higher; they meet when SA + sA·gA·t = SB + sB·gB·t.
        const gap = (sB * gB - sA * gA) * time;
        const SB = scene.amount === "dollars" ? 50 * t.int(4, 40) : 10 * t.int(10, 200);
        const SA = SB + gap;
        const M = SA + sA * gA * time;
        if (gap <= 0 || M <= 0 || SA > 99999) continue;
        const moved = [gA * time, gB * time];
        const wrong = [
          [time, `Stops at the time, ${time} ${scene.unit}, instead of the amount at that time.`],
          [moved[0], `Gives the amount ${scene.moveA} by then, not ${scene.inA}.`],
          [moved[1], `Gives the amount ${scene.moveB} by then, not ${scene.inB}.`],
          [gap, "Gives the difference between the starting amounts."],
        ];
        if (distinctWrong(M, wrong) < 3 || M > 99999) continue;
        const rateA = `${sA < 0 ? MINUS : "+"} ${gA}t`;
        const rateB = `${sB < 0 ? MINUS : "+"} ${gB}t`;
        return commaChoices({
          responseType: t.chance(0.4) ? "numeric" : "multiple-choice",
          estimatedSeconds: 100,
          stimulus: null,
          stem: `${scene.text(SA, gA, SB, gB)} ${scene.ask}`,
          correct: M,
          wrong: [wrong[0], ...t.shuffle(wrong.slice(1))],
          explanation:
            `After t ${scene.unit}, A has ${commas(SA)} ${rateA} and B has ${commas(SB)} ${rateB}. Setting these equal ` +
            `gives ${commas(gap)} = ${sB * gB - sA * gA}t, so t = ${time}. Then A has ${commas(SA)} ${sA < 0 ? MINUS : "+"} ` +
            `${gA}(${time}) = ${commas(M)}, and so does B.`,
          steps: [
            `Write both amounts after t ${scene.unit}: ${commas(SA)} ${rateA} and ${commas(SB)} ${rateB}.`,
            `Set them equal and solve: t = ${time}.`,
            `Substitute t = ${time} into either expression: ${commas(M)}.`,
            `Check with the other: ${commas(SB)} ${sB < 0 ? MINUS : "+"} ${gB}(${time}) = ${commas(M)}.`,
          ],
          principles: [
            "The solution of a system of two linear equations gives both coordinates of the intersection; the question may want either one.",
          ],
          trap: `Solving for t = ${time} is only halfway; the question asks for the amount, not the time.`,
          hint: "Decide which coordinate of the meeting point the question wants.",
          verify: () => {
            for (let x = 0; x <= 1000; x += 1) {
              const [left, right] = [SA + sA * gA * x, SB + sB * gB * x];
              if (left === right) return left === M;
            }
            return false;
          },
        });
      }
    },
  };

  return [systemParameter, linearTransform, inequalityOptimization, literalRearrange, linearModelUnits, twoPlanCrossover];
});
