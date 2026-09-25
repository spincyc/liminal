(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/algebra"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Systems of two linear equations templates (Algebra), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, signed, lin, approx, point, frac } = S;
  const {
    clean, fitsGrid, usd, distinctWrong, commaChoices, standardForm, sidesOf, round2, commasHard,
    usdHard, commaChoicesHard, distinctWrongHard, lineFrom, commas, money, holds, lineCoefficients, cramer,
  } = C;

  /* ------------------------------------------------------------- system-word-totals */

  const totalScenes = [
    {
      make: (t) => { const a = t.int(6, 12); const N = 10 * t.int(12, 40); return { a, b: a + t.int(3, 10), N, scale: 1 }; },
      text: (v) =>
        `A theater sold ${v.N} tickets for a play. Student tickets cost ${usd(v.a)} each, and adult tickets cost ` +
        `${usd(v.b)} each. The theater collected ${usd(v.T)} from ticket sales.`,
      askA: () => "How many student tickets were sold?",
      askB: () => "How many adult tickets were sold?",
      askValue: () => "How many dollars were collected from the sale of adult tickets?",
      A: () => "student tickets", B: () => "adult tickets", value: "dollars",
    },
    {
      make: (t) => ({ a: 10, b: 25, N: t.int(18, 60), scale: 100 }),
      text: (v) => `A jar contains only dimes and quarters. There are ${v.N} coins in the jar, with a total value of ${usd(v.T / 100)}.`,
      askA: () => "How many dimes are in the jar?",
      askB: () => "How many quarters are in the jar?",
      askValue: () => "What is the total value, in dollars, of the quarters in the jar?",
      A: () => "dimes", B: () => "quarters", value: "cents",
    },
    {
      make: (t) => ({ a: 2, b: t.pick([3, 4, 5]), N: t.int(20, 45), scale: 1 }),
      text: (v) =>
        `A test has ${v.N} questions. Each question is worth either ${v.a} points or ${v.b} points, and the ` +
        `questions are worth ${v.T} points in all.`,
      askA: () => "How many 2-point questions are on the test?",
      askB: (v) => `How many ${v.b}-point questions are on the test?`,
      askValue: (v) => `What is the total number of points that the ${v.b}-point questions are worth?`,
      A: () => "2-point questions", B: (v) => `${v.b}-point questions`, value: "points",
    },
    {
      make: (t) => { const a = t.int(3, 6); return { a, b: a + t.int(2, 6), N: t.int(15, 50), scale: 1 }; },
      text: (v) =>
        `A delivery van is carrying ${v.N} boxes. Each small box weighs ${v.a} kilograms, and each large box weighs ` +
        `${v.b} kilograms. The boxes weigh ${v.T} kilograms in all.`,
      askA: () => "How many small boxes is the van carrying?",
      askB: () => "How many large boxes is the van carrying?",
      askValue: () => "What is the total weight, in kilograms, of the large boxes?",
      A: () => "small boxes", B: () => "large boxes", value: "kilograms",
    },
  ];

  // "3x − 4y = 7"
  function standardFormHard(a, b, c) {
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

  /* --------------------------------------------------------- two-plan-crossover */

  const planScenes = [
    {
      unit: ["class", "classes"], A: "Gym A", B: "Gym B", Bs: "Gym B's", fee: [[60, 150], [0, 40]], rate: [[400, 900], [800, 1500]], feeStep: 5,
      text: (FA, a, FB, b) =>
        `Gym A charges a one-time membership fee of ${usdHard(FA)} plus ${usdHard(a)} per class. Gym B charges a one-time ` +
        `membership fee of ${usdHard(FB)} plus ${usdHard(b)} per class.`,
      least: "What is the least number of classes for which the total cost at Gym A is less than the total cost at Gym B?",
      greatest: "What is the greatest number of classes for which the total cost at Gym B is less than the total cost at Gym A?",
    },
    {
      unit: ["mile", "miles"], A: "Company A", B: "Company B", Bs: "Company B's", fee: [[55, 95], [20, 45]], rate: [[10, 30], [35, 75]], feeStep: 1,
      text: (FA, a, FB, b) =>
        `Company A rents a van for ${usdHard(FA)} per day plus ${usdHard(a)} per mile driven. Company B rents a van for ` +
        `${usdHard(FB)} per day plus ${usdHard(b)} per mile driven.`,
      least: "For a one-day rental, what is the least whole number of miles for which renting from Company A costs less than renting from Company B?",
      greatest: "For a one-day rental, what is the greatest whole number of miles for which renting from Company B costs less than renting from Company A?",
    },
    {
      unit: ["poster", "posters"], A: "print shop A", B: "print shop B", Bs: "print shop B's", fee: [[40, 90], [5, 30]], rate: [[150, 400], [300, 700]], feeStep: 5,
      text: (FA, a, FB, b) =>
        `Print shop A charges a setup fee of ${usdHard(FA)} plus ${usdHard(a)} per poster. Print shop B charges a setup fee ` +
        `of ${usdHard(FB)} plus ${usdHard(b)} per poster.`,
      least: "What is the least number of posters for which an order from print shop A costs less than the same order from print shop B?",
      greatest: "What is the greatest number of posters for which an order from print shop B costs less than the same order from print shop A?",
    },
    {
      unit: ["week", "weeks"], A: "buying", B: "renting", Bs: "the rental's", fee: [[240, 600], [20, 60]], rate: [[300, 900], [1500, 3500]], feeStep: 10,
      text: (FA, a, FB, b) =>
        `A contractor can buy a tile saw for ${usdHard(FA)} and then spend ${usdHard(a)} per week on blades and upkeep, or ` +
        `rent the same saw for a ${usdHard(FB)} delivery fee plus ${usdHard(b)} per week.`,
      least: "What is the least number of weeks of use for which buying the saw costs less than renting it?",
      greatest: "What is the greatest number of weeks of use for which renting the saw costs less than buying it?",
    },
  ];

  const tableScenes = [
    {
      unit: ["hour", "hours"], A: "Mover A", B: "Mover B",
      text: (FA, a) => `Mover A charges a flat fee of ${usdHard(FA)} plus ${usdHard(a)} per hour of work.`,
      table: "The table shows the total cost, in dollars, of hiring Mover B for several numbers of hours. The total cost for Mover B is a linear function of the number of hours.",
      least: "What is the least whole number of hours for which hiring Mover A costs less than hiring Mover B?",
    },
    {
      unit: ["session", "sessions"], A: "Tutor A", B: "Tutor B",
      text: (FA, a) => `Tutor A charges a one-time assessment fee of ${usdHard(FA)} plus ${usdHard(a)} per session.`,
      table: "The table shows the total cost, in dollars, of several numbers of sessions with Tutor B. The total cost for Tutor B is a linear function of the number of sessions.",
      least: "What is the least number of sessions for which Tutor A costs less than Tutor B?",
    },
    {
      unit: ["day", "days"], A: "Rental A", B: "Rental B",
      text: (FA, a) => `Rental A charges a delivery fee of ${usdHard(FA)} plus ${usdHard(a)} per day for a generator.`,
      table: "The table shows the total cost, in dollars, of renting a generator from Rental B for several numbers of days. The total cost for Rental B is a linear function of the number of days.",
      least: "What is the least number of days for which Rental A costs less than Rental B?",
    },
  ];

  const meetScenes = [
    {
      unit: "minutes", amount: "liters",
      text: (SA, gA, SB, gB) =>
        `Tank A contains ${commasHard(SA)} liters of water and is being drained at a constant rate of ${gA} liters per ` +
        `minute. At the same time, tank B, which contains ${commasHard(SB)} liters of water, is being filled at a constant ` +
        `rate of ${gB} liters per minute.`,
      ask: "When the two tanks contain the same amount of water, how many liters of water are in each tank?",
      moveA: "drained from tank A", moveB: "added to tank B", signs: [-1, 1],
      inA: "the amount left in tank A", inB: "the amount in tank B",
    },
    {
      unit: "weeks", amount: "dollars",
      text: (SA, gA, SB, gB) =>
        `Account A has a balance of ${usdHard(SA)}, and ${usdHard(gA)} is added to it each week. Account B has a balance ` +
        `of ${usdHard(SB)}, and ${usdHard(gB)} is added to it each week. No other money is added or withdrawn.`,
      ask: "When the two accounts have the same balance, what is that balance, in dollars?",
      moveA: "added to account A", moveB: "added to account B", signs: [1, 1],
      inA: "account A's balance", inB: "account B's balance",
    },
    {
      unit: "years", amount: "residents",
      text: (SA, gA, SB, gB) =>
        `Town A has a population of ${commasHard(SA)} and is losing ${gA} residents per year. Town B has a population ` +
        `of ${commasHard(SB)} and is gaining ${gB} residents per year.`,
      ask: "If these trends continue, what will each town's population be when the two populations are equal?",
      moveA: "lost by town A", moveB: "gained by town B", signs: [-1, 1],
      inA: "town A's population", inB: "town B's population",
    },
  ];

  const systemIntersection = {
    id: "system-intersection-point",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "interpret intersection",
    difficulty: "Easy",
    title: "Coordinates of the intersection of two lines",
    recognize:
      "The intersection point satisfies both equations at once, so set the two expressions for y equal, or add " +
      "the equations to remove y; then give the coordinate the question names.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 0, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "sign-error"],
    build(t) {
      const variant = t.int(0, 1);
      const askX = t.chance(0.5);
      const numeric = t.chance(0.4);
      for (;;) {
        let lines;
        let key;
        let wrong;
        let steps;
        let explanation;
        const a0 = t.nonzero(-8, 8);
        const b0 = t.int(-12, 12);
        if (variant === 0) {
          const m1 = t.sign() * t.int(1, 5);
          const m2 = t.sign() * t.int(1, 5);
          if (m1 === m2) continue;
          const b1 = b0 - m1 * a0;
          const b2 = b0 - m2 * a0;
          if (Math.abs(b1) > 30 || Math.abs(b2) > 30 || b1 === b2) continue;
          lines = [`y = ${lin(m1, b1)}`, `y = ${lin(m2, b2)}`];
          const dm = m1 - m2;
          const db = b2 - b1;
          if (askX) {
            key = a0;
            wrong = [[b0, "Gives the y-coordinate of the intersection point."]];
            if (m1 + m2 !== 0 && Number.isInteger(db / (m1 + m2))) wrong.push([db / (m1 + m2), "Adds the x-terms instead of subtracting one from the other."]);
            if (Math.abs(dm) !== 1) wrong.push([db, `Stops at ${lin(dm, 0)} = ${num(db)}, before dividing by ${num(dm)}.`]);
            wrong.push([-a0, "Subtracts the constants in the wrong order, which flips the sign."]);
          } else {
            key = b0;
            wrong = [
              [a0, "Gives the x-coordinate of the intersection point."],
              [b1, "Gives the y-intercept of the first line, not the point where the lines meet."],
              [b2, "Gives the y-intercept of the second line, not the point where the lines meet."],
              [m1 * a0 - b1, `Substitutes x = ${num(a0)} but changes the sign of the constant term.`],
            ];
          }
          steps = [
            `Set the expressions for y equal: ${lin(m1, b1)} = ${lin(m2, b2)}.`,
            `Solve: ${lin(dm, 0)} = ${num(db)}, so x = ${num(a0)}.`,
            `Substitute: y = ${num(m1)}(${num(a0)}) ${signed(b1)} = ${num(b0)}. The lines meet at ${point(a0, b0)}.`,
          ];
          explanation = `At the intersection both equations give the same y, so ${lin(m1, b1)} = ${lin(m2, b2)}, which gives x = ${num(a0)} and y = ${num(b0)}.`;
        } else {
          const p = t.pick([1, 1, 2, 3]);
          const q = t.pick([1, 2, 3]);
          const Sum = p * a0 + b0;
          const D = q * a0 - b0;
          if (Sum === 0 || D === 0) continue;
          lines = [standardForm(p, 1, Sum), standardForm(q, -1, D)];
          if (askX) {
            key = a0;
            wrong = [[b0, "Gives the y-coordinate of the intersection point."]];
            if (p + q !== 1) wrong.push([Sum + D, `Stops at ${lin(p + q, 0)} = ${num(Sum + D)}, before dividing by ${p + q}.`]);
            if (Number.isInteger((Sum - D) / (p + q))) wrong.push([(Sum - D) / (p + q), "Subtracts the constants while adding the x-terms."]);
            wrong.push([-a0, "Loses the sign while solving for x."]);
          } else {
            key = b0;
            wrong = [[a0, "Gives the x-coordinate of the intersection point."]];
            wrong.push([-b0, `Loses the sign of y when substituting into ${lines[1]}.`]);
            if (p !== 1) wrong.push([Sum - a0, `Substitutes into ${lines[0]} but uses x in place of ${lin(p, 0)}.`]);
            wrong.push([Sum + D, "Adds the equations and stops, without dividing or substituting."]);
          }
          steps = [
            `Add the equations to remove y: ${lin(p + q, 0)} = ${num(Sum + D)}.`,
            `Solve: x = ${num(a0)}.`,
            `Substitute into ${lines[0]}: y = ${num(Sum)} ${MINUS} ${paren(p * a0)} = ${num(b0)}. The lines meet at ${point(a0, b0)}.`,
          ];
          explanation = `Adding the equations removes y: ${lin(p + q, 0)} = ${num(Sum + D)}, so x = ${num(a0)}; then y = ${num(b0)}.`;
        }
        if (!numeric && distinctWrong(key, wrong) < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 65,
          stimulus: { type: "equations", content: lines.join("\n") },
          stem: `The graphs of the given equations in the xy-plane intersect at the point (a, b). What is the value of ${askX ? "a" : "b"}?`,
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation,
          steps,
          principles: ["The intersection point of two lines is the solution (x, y) of the system formed by their equations."],
          trap: `The question asks for ${askX ? "a, the x-coordinate" : "b, the y-coordinate"}; the other coordinate is on the way.`,
          hint: "At the intersection, the same x and y satisfy both equations.",
          verify: () => {
            // Cramer's rule on the displayed equations, read back through compile.
            const coefficients = lines.map((line) => {
              const [left, right] = sidesOf(line);
              const f = (x, y) => left({ x, y }) - right({ x, y });
              return [f(1, 0) - f(0, 0), f(0, 1) - f(0, 0), -f(0, 0)];
            });
            const [[A1, B1, C1], [A2, B2, C2]] = coefficients;
            const det = A1 * B2 - A2 * B1;
            if (approx(det, 0)) return false;
            const x = (C1 * B2 - C2 * B1) / det;
            const y = (A1 * C2 - A2 * C1) / det;
            return approx(askX ? x : y, key);
          },
        };
      }
    },
  };

  const systemTotals = {
    id: "system-word-totals",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "solve systems",
    difficulty: "Medium",
    title: "Two-type count and total system",
    recognize:
      "Two unknown counts need two equations: one for how many items there are and one for what they add up to; " +
      "solve the pair, then report the quantity the question asks for.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "intermediate-value"],
    build(t) {
      const scene = t.pick(totalScenes);
      const ask = t.pick(["A", "B", "value"]);
      const numeric = t.chance(0.4);
      for (;;) {
        const v = scene.make(t);
        const xA = t.int(3, v.N - 3);
        const xB = v.N - xA;
        if (xA === xB) continue;
        v.T = v.a * xA + v.b * xB;
        const diff = v.b - v.a;
        const A = scene.A(v);
        const B = scene.B(v);
        const toValue = (units) => clean(units / v.scale);
        let key;
        let wrong;
        let stem;
        if (ask === "A") {
          key = xA;
          stem = scene.askA(v);
          wrong = [
            [xB, `Gives the number of ${B}, not ${A}.`],
            [v.b * v.N - v.T, `Stops at ${v.b} × ${v.N} ${MINUS} ${v.T} = ${v.b * v.N - v.T}, before dividing by ${diff}.`],
            [v.a * xA, `Gives the total ${scene.value === "cents" ? "value, in cents," : scene.value} of the ${A}, not how many there are.`],
          ];
        } else if (ask === "B") {
          key = xB;
          stem = scene.askB(v);
          wrong = [
            [xA, `Gives the number of ${A}, not ${B}.`],
            [v.T - v.a * v.N, `Stops at ${v.T} ${MINUS} ${v.a} × ${v.N} = ${v.T - v.a * v.N}, before dividing by ${diff}.`],
            [v.b * xB, `Gives the total ${scene.value === "cents" ? "value, in cents," : scene.value} of the ${B}, not how many there are.`],
          ];
        } else {
          key = toValue(v.b * xB);
          stem = scene.askValue(v);
          wrong = [
            [xB, `Stops at the number of ${B}, before finding their total.`],
            [toValue(v.a * xA), `Gives the total for the ${A} instead.`],
            [toValue(v.b * xA), `Multiplies the number of ${A} by the ${B} rate.`],
            [toValue(v.a * xB), `Multiplies the number of ${B} by the ${A} rate.`],
          ];
        }
        if (!numeric && distinctWrong(key, wrong) < 3) continue;
        if (!fitsGrid(key)) continue;
        return commaChoices({
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 95,
          stimulus: null,
          stem: `${scene.text(v)} ${stem}`,
          correct: key,
          wrong,
          explanation:
            `Let a be the number of ${A} and b the number of ${B}. Then a + b = ${v.N} and ` +
            `${v.a}a + ${v.b}b = ${v.T}. Substituting a = ${v.N} ${MINUS} b gives ${v.a * v.N} + ${diff}b = ${v.T}, so ` +
            `b = ${xB} and a = ${xA}.` +
            (ask === "value" ? ` The ${B} total ${v.b} × ${xB} = ${v.b * xB}${v.scale === 100 ? " cents, or $" + num(key) : ""}.` : ""),
          steps: [
            `Write the system: a + b = ${v.N} and ${v.a}a + ${v.b}b = ${v.T}${v.scale === 100 ? " (in cents)" : ""}.`,
            `Substitute a = ${v.N} ${MINUS} b: ${diff}b = ${v.T - v.a * v.N}, so b = ${xB}.`,
            ask === "A" ? `a = ${v.N} ${MINUS} ${xB} = ${xA}.` : ask === "B" ? `The answer is b = ${xB}.` : `Total for the ${B}: ${v.b} × ${xB} = ${v.b * xB}${v.scale === 100 ? ` cents = $${num(key)}` : ""}.`,
          ],
          principles: ["A count equation and a total equation together determine two unknown counts."],
          trap: "Solving the system produces both counts; only one of them, or a total built from it, is what the question asks for.",
          hint: "Write one equation for the number of items and one for their total.",
          verify: () => {
            const found = [];
            for (let a = 0; a <= v.N; a += 1) if (v.a * a + v.b * (v.N - a) === v.T) found.push(a);
            if (found.length !== 1) return false;
            const [a] = found;
            const answer = ask === "A" ? a : ask === "B" ? v.N - a : (v.b * (v.N - a)) / v.scale;
            return approx(answer, key);
          },
        });
      }
    },
  };

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
          stimulus: { type: "equations", content: `${standardFormHard(p, q, r)}\n${num(B)}y = ${num(d)} ${MINUS} kx` },
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
        stimulus: { type: "equations", content: `${standardFormHard(p, q, r)}\nax + by = ${num(D)}` },
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
          const cross = onInteger ? num(xs) : `${commasHard(D)} ÷ ${num(delta / 100)} ≈ ${num(round2(xs))}`;
          const noFee = (100 * FA) / delta;
          const sumFee = (100 * (FA + FB)) / delta;
          const units = scene.unit[1];
          const wrong = askLeast
            ? [
              [Math.floor(xs), onInteger
                ? `At ${num(xs)} ${units} the two costs are equal, so ${scene.A} is not yet cheaper.`
                : `Rounds ${num(round2(xs))} down; at ${Math.floor(xs)} ${units}, ${scene.B} still costs less.`],
              [greatest, `Gives the greatest number for which ${scene.B} costs less, the opposite condition.`],
              [Math.floor(noFee) + 1, `Leaves out ${scene.Bs} ${usdHard(FB)} fee.`],
              [Math.floor(sumFee) + 1, "Adds the two fees instead of subtracting them."],
            ]
            : [
              [greatest + 1, onInteger
                ? `At ${num(xs)} ${units} the two costs are equal, so ${scene.B} is not cheaper there.`
                : `Gives the least number for which ${scene.A} costs less, the opposite condition.`],
              [Math.ceil(noFee) - 1, `Leaves out ${scene.Bs} ${usdHard(FB)} fee.`],
              [Math.ceil(sumFee) - 1, "Adds the two fees instead of subtracting them."],
              [least + 1, `Rounds ${num(round2(xs))} up and then counts one more.`],
            ];
          if (distinctWrongHard(key, wrong) < 3) continue;
          const [a, b] = [ac / 100, bc / 100];
          const costA = `${num(FA)} + ${num(a)}x`;
          const costB = `${num(FB)} + ${num(b)}x`;
          return commaChoicesHard({
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
            [Math.floor(FA / delta) + 1, `Leaves out ${scene.B}'s fixed fee of ${usdHard(FB)}, which the table does not show directly.`],
          ];
          if (average > a) {
            const read = rows[0][0] === 1
              ? `the ${usdHard(rows[0][1])} cost for 1 ${scene.unit[0]}`
              : `${usdHard(rows[0][1])} ÷ ${rows[0][0]}`;
            wrong.push([Math.floor(FA / (average - a)) + 1, `Takes ${read} as ${scene.B}'s cost per ${scene.unit[0]}, with no fixed fee.`]);
          }
          wrong.push([Math.ceil(xs) + 1, `Rounds ${num(round2(xs))} up and then counts one more.`]);
          if (distinctWrongHard(key, wrong) < 3) continue;
          const [r0, r1] = rows;
          return commaChoicesHard({
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
        if (distinctWrongHard(M, wrong) < 3 || M > 99999) continue;
        const rateA = `${sA < 0 ? MINUS : "+"} ${gA}t`;
        const rateB = `${sB < 0 ? MINUS : "+"} ${gB}t`;
        return commaChoicesHard({
          responseType: t.chance(0.4) ? "numeric" : "multiple-choice",
          estimatedSeconds: 100,
          stimulus: null,
          stem: `${scene.text(SA, gA, SB, gB)} ${scene.ask}`,
          correct: M,
          wrong: [wrong[0], ...t.shuffle(wrong.slice(1))],
          explanation:
            `After t ${scene.unit}, A has ${commasHard(SA)} ${rateA} and B has ${commasHard(SB)} ${rateB}. Setting these equal ` +
            `gives ${commasHard(gap)} = ${sB * gB - sA * gA}t, so t = ${time}. Then A has ${commasHard(SA)} ${sA < 0 ? MINUS : "+"} ` +
            `${gA}(${time}) = ${commasHard(M)}, and so does B.`,
          steps: [
            `Write both amounts after t ${scene.unit}: ${commasHard(SA)} ${rateA} and ${commasHard(SB)} ${rateB}.`,
            `Set them equal and solve: t = ${time}.`,
            `Substitute t = ${time} into either expression: ${commasHard(M)}.`,
            `Check with the other: ${commasHard(SB)} ${sB < 0 ? MINUS : "+"} ${gB}(${time}) = ${commasHard(M)}.`,
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

  /* ---------------------------------------------------------- system-from-context */

  // Each scene knows the true counts (x, y), so verification can test every
  // offered system against them.
  const setupScenes = [
    {
      make: (t) => {
        const a = t.int(9, 16);
        const b = a - t.int(2, 6);
        const x = t.int(12, 60);
        // Unequal counts, or the system with the prices swapped would also be true.
        const y = x + t.sign() * t.int(1, 20);
        return { a, b, x, y, N: x + y, R: a * x + b * y };
      },
      text: (v) =>
        `A community theater sold ${v.N} tickets to a play and collected ${usd(v.R)} in ticket sales. Adult tickets ` +
        `cost ${usd(v.a)} each, and student tickets cost ${usd(v.b)} each.`,
      tableText: (v) =>
        `The table shows the price of each type of ticket to a play at a community theater. The theater sold ${v.N} ` +
        `tickets and collected ${usd(v.R)} in ticket sales.`,
      table: (v) => S.table(["Ticket type", "Price"], [["Adult", usd(v.a)], ["Student", usd(v.b)]]),
      names: ["the number of adult tickets sold", "the number of student tickets sold"],
      key: (v) => [`x + y = ${v.N}`, `${v.a}x + ${v.b}y = ${commas(v.R)}`],
      wrong: (v) => [
        [[`x + y = ${commas(v.R)}`, `${v.a}x + ${v.b}y = ${v.N}`], "Matches the number of tickets with the dollars collected, and the dollars with the number of tickets."],
        [[`x + y = ${v.N}`, `${v.b}x + ${v.a}y = ${commas(v.R)}`], "Pairs each price with the other type of ticket."],
        [[`x + y = ${v.N}`, `x/${v.a} + y/${v.b} = ${commas(v.R)}`], "Divides each count by its price instead of multiplying, which does not give dollars."],
      ],
    },
    {
      make: (t) => {
        const a = t.int(5, 10) / 2;
        const b = a - t.int(1, 3) / 2;
        const x = t.int(10, 40);
        const d = t.int(5, 25);
        return { a, b, x, d, y: x + d, R: a * x + b * (x + d) };
      },
      text: (v) =>
        `At a bake sale, muffins cost ${usd(v.a)} each and cookies cost ${usd(v.b)} each. The sale took in ` +
        `${usd(v.R)} from muffins and cookies, and ${v.d} more cookies than muffins were sold.`,
      tableText: (v) =>
        `The table shows the price of each item at a bake sale. The sale took in ${usd(v.R)} from muffins and ` +
        `cookies, and ${v.d} more cookies than muffins were sold.`,
      table: (v) => S.table(["Item", "Price"], [["Muffin", usd(v.a)], ["Cookie", usd(v.b)]]),
      names: ["the number of muffins sold", "the number of cookies sold"],
      key: (v) => [`${money(v.a)}x + ${money(v.b)}y = ${money(v.R)}`, `y = x + ${v.d}`],
      wrong: (v) => [
        [[`${money(v.a)}x + ${money(v.b)}y = ${money(v.R)}`, `x = y + ${v.d}`], `Reverses the comparison: it says ${v.d} more muffins than cookies were sold.`],
        [[`${money(v.a)}x + ${money(v.b)}y = ${money(v.R)}`, `y = ${v.d}x`], `Treats "${v.d} more cookies than muffins" as "${v.d} times as many cookies as muffins."`],
        [[`${money(v.b)}x + ${money(v.a)}y = ${money(v.R)}`, `y = x + ${v.d}`], "Pairs each price with the other item."],
      ],
    },
    {
      make: (t) => {
        const k = t.int(2, 5);
        const x = t.int(4, 24);
        return { k, x, y: k * x, N: (k + 1) * x };
      },
      text: (v) =>
        `A florist made an arrangement of ${v.N} flowers using only roses and tulips. The arrangement has ${v.k} ` +
        "times as many tulips as roses.",
      names: ["the number of roses", "the number of tulips"],
      key: (v) => [`x + y = ${v.N}`, `y = ${v.k}x`],
      wrong: (v) => [
        [[`x + y = ${v.N}`, `x = ${v.k}y`], `Reverses the comparison: it says there are ${v.k} times as many roses as tulips.`],
        [[`x + y = ${v.N}`, `y = x + ${v.k}`], `Treats "${v.k} times as many" as "${v.k} more".`],
        [[`x + ${v.k}y = ${v.N}`, `y = ${v.k}x`], `Multiplies the tulips by ${v.k} again in the total, as if each tulip counted ${v.k} times.`],
      ],
    },
    {
      make: (t) => {
        const k = t.int(2, 3);
        const e = t.int(2, 12);
        const y = t.int(5, 30);
        const x = k * y + e;
        return { k, e, x, y, P: 2 * (x + y) };
      },
      text: (v) =>
        `The length of a rectangular garden is ${v.e} feet more than ${v.k} times its width, and the perimeter of ` +
        `the garden is ${v.P} feet.`,
      names: ["the length, in feet, of the garden", "the width, in feet, of the garden"],
      key: (v) => [`x = ${v.k}y + ${v.e}`, `2x + 2y = ${v.P}`],
      wrong: (v) => [
        [[`y = ${v.k}x + ${v.e}`, `2x + 2y = ${v.P}`], "Reverses the comparison: it makes the width the longer side."],
        [[`x = ${v.k}y + ${v.e}`, `x + y = ${v.P}`], "Adds one length and one width, which is only half the perimeter."],
        [[`x = ${v.k}(y + ${v.e})`, `2x + 2y = ${v.P}`], `Adds ${v.e} to the width before multiplying by ${v.k}.`],
      ],
    },
  ];

  const systemText = ([first, second]) => `${first} and ${second}`;

  const systemSetup = {
    id: "system-from-context",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "solve systems",
    difficulty: "Easy",
    title: "Writing a system of two linear equations from a description",
    recognize:
      "Each sentence that relates the two unknowns becomes one equation: a count gives x + y, a total pairs each rate " +
      "with its own count, and a comparison such as \"3 times as many\" or \"5 more than\" is built on the smaller quantity.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 0 },
    tricks: ["reversed-condition", "wrong-quantity"],
    build(t) {
      const scene = t.pick(setupScenes);
      const asTable = Boolean(scene.table) && t.chance(0.5);
      const v = scene.make(t);
      const key = scene.key(v);
      const offered = scene.wrong(v);
      const [xName, yName] = scene.names;
      return {
        responseType: "multiple-choice",
        estimatedSeconds: 70,
        stimulus: asTable ? { type: "table", content: scene.table(v) } : null,
        stem:
          `${asTable ? scene.tableText(v) : scene.text(v)} Which system of equations represents this situation, where ` +
          `x is ${xName} and y is ${yName}?`,
        correct: systemText(key),
        wrong: t.shuffle(offered).map(([pair, reason]) => [systemText(pair), reason]),
        explanation:
          `Each condition in the description gives one equation: ${key[0]} and ${key[1]}. With x = ${num(v.x)} and ` +
          `y = ${num(v.y)}, both are true.`,
        steps: [
          `Translate the first relationship: ${key[0]}.`,
          `Translate the second relationship: ${key[1]}.`,
        ],
        principles: [
          "Two unknowns need two equations, one for each stated relationship between them.",
          "\"k times as many A as B\" means A = kB, and \"d more A than B\" means A = B + d.",
        ],
        trap: "A comparison is easy to write backward; check it with small numbers before choosing.",
        hint: "Write one equation for each sentence that connects the two quantities.",
        verify: () => {
          // The true counts satisfy the key and break every other offered system.
          const truth = { x: v.x, y: v.y };
          const fits = (pair) => pair.every((equation) => holds(equation, truth));
          return fits(key) && offered.every(([pair]) => !fits(pair));
        },
      };
    },
  };

  /* -------------------------------------------------------- system-combination-value */

  const systemCombination = {
    id: "system-combination-value",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "solve systems",
    difficulty: "Medium",
    title: "Value of a combination of x and y from a system",
    recognize:
      "The question asks for a combination of x and y, not for x and y themselves: adding or subtracting the equations " +
      "produces a multiple of that combination directly, and dividing by the common coefficient finishes it.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity"],
    build(t) {
      const ask = t.pick(["sum", "difference"]);
      const scale = t.pick([1, 1, 2, 3]);
      const numeric = t.chance(0.45);
      for (;;) {
        const k = t.int(3, 12);
        let a1;
        let b1;
        let a2;
        let b2;
        if (ask === "sum") {
          a1 = t.int(1, k - 1);
          a2 = k - a1;
          b1 = t.int(1, k - 1);
          b2 = k - b1;
        } else {
          a2 = t.int(1, 9);
          b1 = t.int(1, 9);
          a1 = a2 + k;
          b2 = b1 + k;
        }
        const det = a1 * b2 - a2 * b1;
        if (det === 0 || Math.abs(det) > 60) continue;
        const T = t.nonzero(-12, 12);
        const c1 = t.int(-40, 60);
        const c2 = ask === "sum" ? k * T - c1 : c1 - k * T;
        const xN = c1 * b2 - c2 * b1;
        const yN = a1 * c2 - a2 * c1;
        // Mostly fractional solutions, so combining the equations is the efficient route.
        if (xN % det === 0 && yN % det === 0 && t.chance(0.75)) continue;
        const lines = [standardForm(a1, b1, c1), standardForm(a2, b2, c2)];
        const sign = ask === "sum" ? "+" : MINUS;
        const base = `x ${sign} y`;
        const asked = scale === 1 ? base : `${scale}x ${sign} ${scale}y`;
        const key = scale * T;
        const other = ask === "sum" ? frac(xN - yN, det) : frac(xN + yN, det);
        const combined = ask === "sum" ? c1 + c2 : c1 - c2;
        const wrong = [
          [frac(xN, det), "Solves for x and stops there."],
          [other, `Finds x ${ask === "sum" ? MINUS : "+"} y instead of ${base}.`],
        ];
        if (k !== scale) wrong.push([combined, `Stops at ${k}x ${sign} ${k}y = ${num(combined)}, before dividing by ${k}.`]);
        if (scale !== 1) wrong.push([T, `Gives the value of ${base}, not ${asked}.`]);
        if (ask === "difference") wrong.push([-key, "Subtracts the equations in the wrong order, which gives y − x."]);
        if (!numeric && distinctWrongHard(key, wrong) < 3) continue;
        const operation = ask === "sum" ? "Add" : "Subtract the second equation from the first";
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 85,
          stimulus: { type: "equations", content: lines.join("\n") },
          stem: `If (x, y) is the solution to the given system of equations, what is the value of ${asked}?`,
          correct: key,
          wrong: numeric ? [] : [wrong[0], ...t.shuffle(wrong.slice(1))],
          explanation:
            `${operation === "Add" ? "Adding the equations" : "Subtracting the second equation from the first"} gives ` +
            `${k}x ${sign} ${k}y = ${num(combined)}, so ${base} = ${num(T)}` +
            (scale === 1 ? "." : ` and ${asked} = ${scale}(${num(T)}) = ${num(key)}.`),
          steps: [
            `${operation}: ${k}x ${sign} ${k}y = ${num(combined)}.`,
            `Divide by ${k}: ${base} = ${num(T)}.`,
            ...(scale === 1 ? [] : [`${asked} = ${scale}(${base}) = ${num(key)}.`]),
          ],
          principles: [
            "Adding or subtracting two equations gives another equation that the same solution satisfies.",
          ],
          trap: `Solving for x and y separately works but invites stopping early; ${k}x ${sign} ${k}y = ${num(combined)} is ${k} times what is asked${scale === 1 ? "" : ` before scaling by ${scale}`}.`,
          hint: "Compare the coefficients of x and y across the two equations.",
          verify: () => {
            const solution = cramer(lineCoefficients(lines[0]), lineCoefficients(lines[1]));
            if (!solution) return false;
            const [x, y] = solution;
            return approx(scale * (ask === "sum" ? x + y : x - y), key);
          },
        };
      }
    },
  };

  return [systemSetup, systemIntersection, systemCombination, systemTotals, systemParameter, twoPlanCrossover];
});
