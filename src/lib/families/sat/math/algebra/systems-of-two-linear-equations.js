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
    usdHard, commaChoicesHard, distinctWrongHard, lineFrom, commas, money, holds, lineCoefficients, cramer, fitsGridHard,
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

  // A modelled mistake that prints the same as the key would be dropped by
  // instantiate, silently leaving the item with fewer traps; such draws are
  // redrawn instead.
  const hitsKey = (key, wrong) => wrong.some(([value]) => S.label(value) === S.label(key));

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
          // A grid of two independent slips: the other coordinate, and a sign
          // lost on the way; the third choice is usually both slips at once
          // (a decoy pair, so the key is not the one value the others echo).
          const extra = [];
          let decoy;
          if (askX) {
            key = a0;
            wrong = [
              [b0, "Gives the y-coordinate of the intersection point."],
              [-a0, "Subtracts the constants in the wrong order, which flips the sign of x."],
            ];
            decoy = [-b0, `Gives the y-coordinate with its sign changed, as if the lines met at ${point(-a0, -b0)}.`];
            if (m1 + m2 !== 0 && Number.isInteger(db / (m1 + m2))) extra.push([db / (m1 + m2), "Adds the x-terms instead of subtracting one from the other."]);
            if (Math.abs(dm) !== 1) extra.push([db, `Stops at ${lin(dm, 0)} = ${num(db)}, before dividing by ${num(dm)}.`]);
          } else {
            key = b0;
            wrong = [
              [a0, "Gives the x-coordinate of the intersection point."],
              [m1 * a0 - b1, `Substitutes x = ${num(a0)} but changes the sign of the constant term.`],
            ];
            extra.push(
              [b1, "Gives the y-intercept of the first line, not the point where the lines meet."],
              [b2, "Gives the y-intercept of the second line, not the point where the lines meet."],
            );
            decoy = [-a0, "Gives the x-coordinate, with its sign flipped by subtracting the constants in the wrong order."];
          }
          wrong.push(...(t.chance(0.65) ? [decoy, ...t.shuffle(extra)] : t.shuffle([decoy, ...extra])));
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
          const extra = [];
          let decoy;
          if (askX) {
            key = a0;
            wrong = [
              [b0, "Gives the y-coordinate of the intersection point."],
              [-a0, "Loses the sign while solving for x."],
            ];
            if (p + q !== 1) extra.push([Sum + D, `Stops at ${lin(p + q, 0)} = ${num(Sum + D)}, before dividing by ${p + q}.`]);
            if (Number.isInteger((Sum - D) / (p + q))) extra.push([(Sum - D) / (p + q), "Subtracts the constants while adding the x-terms."]);
            decoy = [-b0, `Gives the y-coordinate with its sign lost when substituting into ${lines[1]}.`];
          } else {
            key = b0;
            wrong = [
              [a0, "Gives the x-coordinate of the intersection point."],
              [-b0, `Loses the sign of y when substituting into ${lines[1]}.`],
            ];
            if (p !== 1) extra.push([Sum - a0, `Substitutes into ${lines[0]} but uses x in place of ${lin(p, 0)}.`]);
            extra.push([Sum + D, "Adds the equations and stops, without dividing or substituting."]);
            decoy = [-a0, "Gives the x-coordinate, with its sign lost while solving."];
          }
          wrong.push(...(t.chance(0.65) ? [decoy, ...t.shuffle(extra)] : t.shuffle([decoy, ...extra])));
          steps = [
            `Add the equations to remove y: ${lin(p + q, 0)} = ${num(Sum + D)}.`,
            `Solve: x = ${num(a0)}.`,
            `Substitute into ${lines[0]}: y = ${num(Sum)} ${MINUS} ${paren(p * a0)} = ${num(b0)}. The lines meet at ${point(a0, b0)}.`,
          ];
          explanation = `Adding the equations removes y: ${lin(p + q, 0)} = ${num(Sum + D)}, so x = ${num(a0)}; then y = ${num(b0)}.`;
        }
        if (!numeric && (distinctWrong(key, wrong) < 3 || hitsKey(key, wrong))) continue;
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
        if (!fitsGrid(key) || hitsKey(key, wrong)) continue;
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
            (ask === "value" ? ` The ${B} total ${v.b} × ${xB} = ${v.b * xB}${v.scale === 100 ? ` cents, or ${usd(key)}` : ""}.` : ""),
          steps: [
            `Write the system: a + b = ${v.N} and ${v.a}a + ${v.b}b = ${v.T}${v.scale === 100 ? " (in cents)" : ""}.`,
            `Substitute a = ${v.N} ${MINUS} b: ${diff}b = ${v.T - v.a * v.N}, so b = ${xB}.`,
            ask === "A" ? `a = ${v.N} ${MINUS} ${xB} = ${xA}.` : ask === "B" ? `The answer is b = ${xB}.` : `Total for the ${B}: ${v.b} × ${xB} = ${v.b * xB}${v.scale === 100 ? ` cents = ${usd(key)}` : ""}.`,
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
    difficulty: "Medium",
    title: "Linear system with a parameter: no solution or infinitely many",
    recognize:
      "Parallel distinct lines give no solution and proportional equations give infinitely many; " +
      "compare coefficients after putting both equations in the same form instead of solving.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
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
            `Rewrite the second equation as kx ${B < 0 ? MINUS : "+"} ${num(Math.abs(B))}y = ${num(d)}. Its y-coefficient is ${num(s)} times the first ` +
            `equation's, so the lines are parallel exactly when k = ${paren(s)}(${p}) = ${num(k)}. The constant ${num(d)} is not ` +
            `${paren(s)}(${num(r)}) = ${num(s * r)}, so the lines are distinct and the system has no solution.`,
          steps: [
            `Move kx to the left: kx ${B < 0 ? MINUS : "+"} ${num(Math.abs(B))}y = ${num(d)}.`,
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
            `The first line has slope ${S.frac(-p, q)}. The line kx ${B < 0 ? MINUS : "+"} ${num(Math.abs(B))}y = ${num(D)} has slope ${MINUS}k/${paren(B)}. ` +
            `Parallel lines need ${MINUS}k/${paren(B)} = ${S.frac(-p, q)}, so k = ${num(k)}. Their y-intercepts ` +
            `(${num(c)} and ${S.frac(D, B)}) differ, so the lines never meet.`,
          steps: [
            `Read the slope of the first line: ${S.frac(-p, q)}.`,
            `Write the slope of the second line: ${MINUS}k/${paren(B)}.`,
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
    difficulty: "Medium",
    title: "Comparing two linear plans around their crossover",
    recognize:
      "The two options are two lines; the intersection is where neither is cheaper, and the question asks about one " +
      "side of it, so decide which side, then which whole number first lands there.",
    rubric: { steps: 2, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 2 },
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
          if (distinctWrongHard(key, wrong) < 3 || hitsKey(key, wrong)) continue;
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
          if (distinctWrongHard(key, wrong) < 3 || hitsKey(key, wrong)) continue;
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
        if (distinctWrongHard(M, wrong) < 3 || hitsKey(M, wrong) || M > 99999) continue;
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
        if (!numeric && (distinctWrongHard(key, wrong) < 3 || hitsKey(key, wrong))) continue;
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

  /* ------------------------------------------------------- system-two-constants */

  // Replaces the constant letters in a displayed equation with numbers, so
  // verification reads the same text the student reads: "ax + 6y = c" with
  // { a: 4, c: −2 } -> "(4)x + 6y = (−2)".
  function substitute(text, values) {
    return Object.entries(values).reduce(
      (out, [letter, value]) => out.replace(new RegExp(`(^|[^A-Za-z])${letter}(?=[xy]|\\s|\\)|$)`, "g"), `$1(${num(value)})`),
      text,
    );
  }

  // "one", "none", or "infinite" for the system of two displayed equations.
  function solutionCount(first, second) {
    const [A1, B1, C1] = lineCoefficients(first);
    const [A2, B2, C2] = lineCoefficients(second);
    if (!approx(A1 * B2 - A2 * B1, 0)) return "one";
    return approx(A1 * C2 - A2 * C1, 0) && approx(B1 * C2 - B2 * C1, 0) ? "infinite" : "none";
  }

  // Infinitely many solutions with one unknown coefficient in each equation:
  // the known constants fix the scale factor, which multiplies one unknown
  // and divides the other.
  function scaleConstants(t) {
    const numeric = t.chance(0.4);
    const ask = t.pick(["a + b", "a − b"]);
    for (;;) {
      const [m, n] = t.pick([[2, 3], [3, 2], [1, 2], [2, 1], [1, 3], [3, 1], [3, 4], [4, 3], [2, 5], [5, 2]]);
      const P = t.nonzero(-3, 3);
      const Q = t.nonzero(-3, 3);
      const R = t.nonzero(-4, 4);
      // First equation = (m/n) × second equation.
      const p = n * P;
      const a = m * P;
      const q = m * Q;
      const b = n * Q;
      const r1 = m * R;
      const r2 = n * R;
      if (Math.abs(p) > 12 || Math.abs(q) > 12 || Math.abs(p) === Math.abs(q)) continue;
      const combine = (x, y) => (ask === "a + b" ? x + y : x - y);
      // Rational values as [numerator, denominator] over m·n.
      const over = (x, y) => frac(combine(x, y), m * n);
      const key = combine(a, b);
      const aBack = (p * n * n) / 1; // p ÷ (m/n) = pn/m, written over mn: pn·n
      const bBack = q * m * m; // q × (m/n) = qm/n, written over mn: qm·m
      const wrong = [
        [over(aBack, bBack), `Uses ${frac(n, m)}, the second constant over the first, as the multiple, which gives a = ${frac(p * n, m)} and b = ${frac(q * m, n)}.`],
        ...t.shuffle([
          [over(aBack, b * m * n), `Finds b, but divides ${num(p)} by the factor ${frac(m, n)} instead of multiplying to get a.`],
          [over(a * m * n, bBack), `Finds a, but multiplies ${num(q)} by the factor ${frac(m, n)} instead of dividing to get b.`],
        ]),
        [combine(p, q), "Matches the coefficients without scaling them, as if the two equations were identical."],
      ];
      if (distinctWrongHard(key, wrong) < 3 || hitsKey(key, wrong) || !fitsGridHard(key)) continue;
      const first = `ax ${q < 0 ? MINUS : "+"} ${num(Math.abs(q))}y = ${num(r1)}`;
      const second = `${lin(p, 0)} + by = ${num(r2)}`;
      const factor = frac(m, n);
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 120,
        stimulus: { type: "equations", content: `${first}\n${second}` },
        stem: `In the given system of equations, a and b are constants. If the system has infinitely many solutions, what is the value of ${ask}?`,
        correct: key,
        wrong: numeric ? [] : wrong,
        explanation:
          `Infinitely many solutions means the first equation is a constant multiple of the second. The constants fix ` +
          `that multiple: ${num(r1)} ÷ ${paren(r2)} = ${factor}. So a = ${factor} × ${paren(p)} = ${num(a)}, and ` +
          `${num(q)} = ${factor} × b gives b = ${num(b)}. Then ${ask} = ${num(key)}.`,
        steps: [
          "The two equations must describe the same line, so each term of the first is the same multiple of the matching term of the second.",
          `The constants give the multiple: ${num(r1)} ÷ ${paren(r2)} = ${factor}.`,
          `x-terms: a = ${factor} × ${paren(p)} = ${num(a)}. y-terms: ${num(q)} = ${/\//.test(factor) ? `(${factor})` : factor}b, so b = ${num(b)}.`,
          `${ask} = ${num(key)}.`,
        ],
        principles: [
          "Two linear equations have infinitely many common solutions exactly when one is a constant multiple of the other.",
        ],
        trap: `The multiple ${factor} goes from the second equation to the first: it multiplies ${num(p)} to give a, but b must be multiplied by it to give ${num(q)}.`,
        hint: "Compare the two equations term by term, starting where both numbers are known.",
        verify: () => {
          // Scan whole-number pairs for the one that makes the displayed system dependent.
          const found = [];
          for (let A = -40; A <= 40; A += 1) {
            for (let B = -40; B <= 40; B += 1) {
              if (solutionCount(substitute(first, { a: A }), substitute(second, { b: B })) === "infinite") found.push([A, B]);
            }
          }
          return found.length === 1 && combine(found[0][0], found[0][1]) === key;
        },
      };
    }
  }

  // No solution: which pair of constants could work. The choices are a grid:
  // right or wrong x-coefficient, crossed with a constant that does or does
  // not keep the equations proportional.
  function noneConstants(t) {
    for (;;) {
      const { p, q } = baseLine(t);
      const s = t.pick([2, 3, 4, -2, -3]);
      const r = t.nonzero(-9, 9);
      const B = s * q;
      const aKey = s * p;
      const cSame = s * r;
      const cKey = cSame + t.nonzero(-6, 6);
      const rearranged = t.chance(0.5);
      const second = rearranged
        ? `${num(B)}y = c ${MINUS} ax`
        : `ax ${B < 0 ? MINUS : "+"} ${num(Math.abs(B))}y = c`;
      const [aWrong, slip] = rearranged
        ? [-aKey, `moves ax to the left side without changing its sign, so a has the wrong sign`]
        : t.pick([
          [-aKey, `scales ${p}x by ${num(-s)} instead of ${num(s)}, so a has the wrong sign`],
          [p, `copies the x-coefficient ${p} without scaling it by ${num(s)}`],
        ]);
      if (aWrong === aKey || p * B - q * aWrong === 0) continue;
      const pair = (a, c) => `a = ${num(a)} and c = ${num(c)}`;
      const key = pair(aKey, cKey);
      const wrong = t.shuffle([
        [pair(aKey, cSame), `Makes the second equation exactly ${num(s)} times the first, so the equations describe the same line and the system has infinitely many solutions.`],
        [pair(aWrong, cKey), `Keeps a constant that breaks the proportion but ${slip}; the lines then have different slopes and intersect once.`],
        [pair(aWrong, cSame), `Makes the constants proportional but ${slip}; the lines then have different slopes and intersect once.`],
      ]);
      if (hitsKey(key, wrong)) continue;
      const first = standardFormHard(p, q, r);
      const rewritten = `ax ${B < 0 ? MINUS : "+"} ${num(Math.abs(B))}y = c`;
      return {
        responseType: "multiple-choice",
        estimatedSeconds: 115,
        stimulus: { type: "equations", content: `${first}\n${second}` },
        stem: "In the given system of equations, a and c are constants. If the system has no solution, which of the following could be the values of a and c?",
        correct: key,
        wrong,
        explanation:
          `${rearranged ? `Rewrite the second equation as ${rewritten}. ` : ""}Its y-coefficient is ${num(s)} times the first ` +
          `equation's, so the lines are parallel exactly when a = ${num(s)} × ${p} = ${num(aKey)}. If c were ${num(s)} × ` +
          `${paren(r)} = ${num(cSame)} too, the lines would be the same; any other c gives parallel, distinct lines and no ` +
          `solution. Only ${key} does that.`,
        steps: [
          ...(rearranged ? [`Put the second equation in the form of the first: ${rewritten}.`] : []),
          `Compare y-coefficients: ${num(B)} ÷ ${paren(q)} = ${num(s)}.`,
          `No solution needs the same multiple for x: a = ${num(s)} × ${p} = ${num(aKey)}.`,
          `It also needs c ≠ ${num(s)} × ${paren(r)} = ${num(cSame)}, or the lines coincide.`,
        ],
        principles: [
          "ax + by = c and dx + ey = f have no solution when a/d = b/e ≠ c/f.",
          "When the constants are in the same ratio as well, the equations describe one line and there are infinitely many solutions.",
        ],
        trap: `a = ${num(aKey)} makes the lines parallel, but with c = ${num(cSame)} they are the same line, which has infinitely many solutions, not none.`,
        hint: "Decide what the two lines must look like for there to be no solution, then test each pair.",
        verify: () => {
          const counts = (text) => {
            const [, a, c] = text.match(/^a = (\S+) and c = (\S+)$/);
            const values = { a: Number(a.replace(MINUS, "-")), c: Number(c.replace(MINUS, "-")) };
            return solutionCount(first, substitute(second, values));
          };
          return counts(key) === "none" && wrong.every(([text]) => counts(text) !== "none");
        },
      };
    }
  }

  // A given solution turns the system into two equations in the constants.
  function givenConstants(t) {
    const ask = t.pick(["a + b", "a − b", "a", "b"]);
    const numeric = t.chance(0.4);
    for (;;) {
      const a = t.nonzero(-9, 9);
      const b = t.nonzero(-9, 9);
      const x0 = t.nonzero(-6, 6);
      const y0 = t.nonzero(-6, 6);
      if (Math.abs(a) === Math.abs(b) || Math.abs(x0) === Math.abs(y0)) continue;
      // Constants that equal a coordinate of the solution would reward mixing them up.
      if ([a, b].some((constant) => constant === x0 || constant === y0)) continue;
      const P = a * x0 + b * y0;
      const Q = b * x0 + a * y0;
      const value = { "a + b": a + b, "a − b": a - b, a, b }[ask];
      const wrong = {
        "a + b": [
          [x0 + y0, `Adds the coordinates of the solution instead of the constants.`],
          [P + Q, `Adds the two equations, (a + b)(${num(x0 + y0)}) = ${num(P + Q)}, and stops before dividing by ${num(x0 + y0)}.`],
          [a, "Finds a and stops before adding b."],
          [b, "Finds b and stops before adding a."],
        ],
        "a − b": [
          [b - a, "Swaps a and b, which reverses the sign of the difference."],
          [P - Q, `Subtracts the equations, (a ${MINUS} b)(${num(x0 - y0)}) = ${num(P - Q)}, and stops before dividing by ${num(x0 - y0)}.`],
          [x0 - y0, "Subtracts the coordinates of the solution instead of the constants."],
          [a, "Finds a and stops before subtracting b."],
        ],
        a: [
          [b, "Swaps the roles of a and b."],
          [x0, "Gives the x-coordinate of the solution, not the constant a."],
          [a + b, "Finds a + b and stops."],
          [-a, "Loses a sign while eliminating b."],
        ],
        b: [
          [a, "Swaps the roles of a and b."],
          [y0, "Gives the y-coordinate of the solution, not the constant b."],
          [a + b, "Finds a + b and stops."],
          [-b, "Loses a sign while eliminating a."],
        ],
      }[ask];
      const offered = [wrong[0], ...t.shuffle(wrong.slice(1))];
      if (!numeric && (distinctWrongHard(value, offered) < 3 || hitsKey(value, offered))) continue;
      const first = `ax + by = ${num(P)}`;
      const second = `bx + ay = ${num(Q)}`;
      const twoTerms = (c1, v1, c2, v2) => `${lin(c1, 0, v1)} ${c2 < 0 ? MINUS : "+"} ${lin(Math.abs(c2), 0, v2)}`;
      const plugged = [`${twoTerms(x0, "a", y0, "b")} = ${num(P)}`, `${twoTerms(y0, "a", x0, "b")} = ${num(Q)}`];
      const shortcut = ask === "a + b"
        ? `Adding them gives (a + b)(${num(x0 + y0)}) = ${num(P + Q)}, so a + b = ${num(a + b)}.`
        : ask === "a − b"
          ? `Subtracting the second from the first gives (a ${MINUS} b)(${num(x0 - y0)}) = ${num(P - Q)}, so a ${MINUS} b = ${num(a - b)}.`
          : `Solving these two equations gives a = ${num(a)} and b = ${num(b)}.`;
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 110,
        stimulus: { type: "equations", content: `${first}\n${second}` },
        stem: `In the given system of equations, a and b are constants. If the solution to the system is ${point(x0, y0)}, what is the value of ${ask}?`,
        correct: value,
        wrong: numeric ? [] : offered,
        explanation:
          `Substituting x = ${num(x0)} and y = ${num(y0)} turns the system into two equations in a and b: ` +
          `${plugged[0]} and ${plugged[1]}. ${shortcut}`,
        steps: [
          `Substitute the solution into each equation: ${plugged[0]}; ${plugged[1]}.`,
          "Now a and b are the unknowns and the numbers come from the solution.",
          shortcut,
        ],
        principles: [
          "A solution of a system makes every equation in it true, which gives equations in any unknown constants.",
        ],
        trap: "Once the solution is substituted, a and b are the unknowns; the coordinates of the solution are only coefficients.",
        hint: "Use the given solution to write equations whose unknowns are the constants.",
        verify: () => {
          // Search whole-number constants that make the displayed system true at the solution.
          const found = [];
          for (let A = -20; A <= 20; A += 1) {
            for (let B = -20; B <= 20; B += 1) {
              if (holds(substitute(first, { a: A, b: B }), { x: x0, y: y0 }) &&
                holds(substitute(second, { a: A, b: B }), { x: x0, y: y0 })) found.push([A, B]);
            }
          }
          if (found.length !== 1) return false;
          const [A, B] = found[0];
          return { "a + b": A + B, "a − b": A - B, a: A, b: B }[ask] === value;
        },
      };
    }
  }

  const twoConstants = {
    id: "system-two-constants",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "solve systems",
    difficulty: "Hard",
    title: "Two unknown constants in a system of linear equations",
    recognize:
      "The constants, not x and y, are the unknowns: infinitely many solutions means one equation is a multiple of " +
      "the other, with the multiple fixed by a pair of known matching numbers; no solution keeps the multiple on x " +
      "and y but breaks it on the constant; a known solution turns the system into equations in the constants.",
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "sign-error", "wrong-quantity", "intermediate-value"],
    build(t) {
      const form = t.pick(["scale", "none", "given"]);
      if (form === "scale") return scaleConstants(t);
      if (form === "none") return noneConstants(t);
      return givenConstants(t);
    },
  };

  /* ---------------------------------------------------- system-graph-two-lines */

  const WINDOW = 6;

  // y = (rise/run)x + b0 through at least three lattice points of the window.
  function latticeLine(t) {
    for (;;) {
      const run = t.pick([1, 1, 2, 2, 3]);
      const rise = t.nonzero(-4, 4);
      if (S.gcd(rise, run) !== 1 || Math.abs(rise / run) > 3) continue;
      const b0 = t.int(-4, 4);
      const points = [];
      for (let x = -WINDOW; x <= WINDOW; x += run) {
        const y = b0 + (rise * x) / run;
        if (Math.abs(y) <= WINDOW - 1) points.push([x, y]);
      }
      if (points.length >= 3) return { rise, run, b0, points };
    }
  }

  // Intersection of y = m1·x + b1 and y = m2·x + b2 as reduced fractions
  // [[xNum, xDen], [yNum, yDen]], or null for parallel lines.
  function crossing(l1, l2) {
    const D = l1.rise * l2.run - l2.rise * l1.run;
    if (D === 0) return null;
    const xN = (l2.b0 - l1.b0) * l1.run * l2.run;
    const yN = l1.b0 * l1.run * D + l1.rise * xN;
    return [[xN, D], [yN, l1.run * D]];
  }

  const value = ([top, bottom]) => top / bottom;
  const isWhole = (fraction) => Number.isInteger(value(fraction));
  // Terminating decimals that fit the answer grid can be typed; others are choices.
  const gridValue = (fraction) => {
    const v = value(fraction);
    return fitsGridHard(v) ? v : null;
  };

  const graphTwoLines = {
    id: "system-graph-two-lines",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "interpret intersection",
    difficulty: "Hard",
    title: "Solution of a system read from graphed lines",
    recognize:
      "The lines cross between grid points, so the graph gives only an estimate; the exact solution needs each line's " +
      "equation, read from two lattice points it passes through, and then the system solved algebraically.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["wrong-quantity", "sign-error", "rounding-direction"],
    build(t) {
      const form = t.pick(["both", "one"]);
      const askX = t.chance(0.5);
      const wantNumeric = t.chance(0.4);
      for (;;) {
        const l1 = latticeLine(t);
        const l2 = latticeLine(t);
        if (Math.abs(l1.rise / l1.run - l2.rise / l2.run) < 0.6) continue;
        const cross = crossing(l1, l2);
        if (!cross) continue;
        const [X, Y] = cross.map(value);
        if (Math.abs(X) > 4.5 || Math.abs(Y) > 4.5) continue;
        const asked = askX ? cross[0] : cross[1];
        const other = askX ? cross[1] : cross[0];
        // The graph cannot give the asked coordinate exactly.
        if (form === "both" && isWhole(asked)) continue;
        // A crossing halfway between grid lines can be read off the drawing.
        if (form === "both" && Number.isInteger(2 * value(asked))) continue;
        // With one line given as an equation, the crossing is not a grid
        // point of ℓ (testing ℓ's lattice points would find it) nor on the y-axis.
        if (form === "one" && ((isWhole(asked) && isWhole(other)) || X === 0)) continue;
        const show = (fraction) => frac(fraction[0], fraction[1]);
        const key = show(asked);
        const numericKey = gridValue(asked);
        const numeric = wantNumeric && numericKey !== null;
        const coordinate = askX ? "x-coordinate" : "y-coordinate";
        const otherCoordinate = askX ? "y-coordinate" : "x-coordinate";
        // The line through lattice points whose slope a student misreads.
        // Two lattice points a student would read: the y-intercept when it is
        // on the grid, and the point farthest from it along the line.
        const pointsText = (line) => {
          const first = line.points.find(([x]) => x === 0) || line.points[0];
          const second = line.points.reduce((best, candidate) =>
            (Math.abs(candidate[0] - first[0]) > Math.abs(best[0] - first[0]) ? candidate : best));
          return [first, second];
        };
        // The distractors are a grid of two independent misreadings of the
        // drawn line(s): a slope slip (its sign, or run over rise) and a
        // y-intercept read with the wrong sign, alone and together. Each
        // choice then shares its denominator or its numerator's origin with
        // two others, so the key is not the one value the others orbit.
        // Line k in the one-line form is given by its equation and is not misread.
        const drawnLines = form === "one" ? [l1] : [l1, l2];
        const slopeLine = t.pick(drawnLines);
        const interceptLine = t.pick(drawnLines.filter((line) => line.b0 !== 0));
        if (!interceptLine) continue;
        const slopeSlips = Math.abs(slopeLine.rise) === slopeLine.run ? ["sign"] : ["sign", "inverse"];
        // Applies the chosen slips to one of the original lines.
        const misread = (line, slip, flipIntercept) => {
          let out = line;
          if (flipIntercept && line === interceptLine) out = { ...out, b0: -out.b0 };
          if (slip && line === slopeLine) {
            out = slip === "sign"
              ? { ...out, rise: -out.rise }
              : { ...out, rise: out.run * Math.sign(out.rise), run: Math.abs(out.rise) };
          }
          return out;
        };
        const coordinateOf = (first, second) => {
          const c = crossing(first, second);
          return c ? show(askX ? c[0] : c[1]) : null;
        };
        const describe = (line) => `the line through ${point(...pointsText(line)[0])} and ${point(...pointsText(line)[1])}`;
        const slopeWords = (slip) => `reads the slope of ${describe(slopeLine)} ${slip === "sign" ? "with the wrong sign" : "as run over rise"}`;
        const interceptWords = `reads the y-intercept of ${describe(interceptLine)} as ${num(-interceptLine.b0)} instead of ${num(interceptLine.b0)}`;
        const capital = (text) => `${text[0].toUpperCase()}${text.slice(1)}.`;
        const slipped = (slip, flipIntercept) => coordinateOf(misread(l1, slip, flipIntercept), misread(l2, slip, flipIntercept));
        const grid = [[slipped(null, true), capital(interceptWords)]];
        slopeSlips.forEach((slip) => {
          grid.push([slipped(slip, false), capital(slopeWords(slip))]);
          grid.push([slipped(slip, true), `Makes two slips: ${slopeWords(slip)}, and ${interceptWords}.`]);
        });
        if (grid.some(([text]) => text === null)) continue;
        const estimate = Math.round(value(asked));
        const fallback = [
          [show(other), `Gives the ${otherCoordinate} of the intersection point.`],
          ...(form === "both" ? [[estimate, `Reads the ${coordinate} off the graph as ${num(estimate)}, the nearest grid line; the lines cross between grid points.`]] : []),
        ];
        // Single slips on the other line too, so the pool offers real choices.
        drawnLines.filter((line) => line !== slopeLine).forEach((line) => {
          const flipped = coordinateOf(...[l1, l2].map((each) => (each === line ? { ...each, rise: -each.rise } : each)));
          if (flipped) fallback.push([flipped, `Reads the slope of ${describe(line)} with the wrong sign.`]);
        });
        // A slip that only flips the key's sign would pair with it and point to it.
        const pool = [...grid, ...fallback].filter(([text]) => !approx(valueOfLabel(text), -valueOfLabel(key)));
        const wrong = neutralTriple(t, key, pool);
        if (!wrong) continue;
        if (!numeric && (distinctWrongHard(key, wrong) < 3 || hitsKey(key, wrong))) continue;
        const P = S.plane({ xMin: -WINDOW, xMax: WINDOW, yMin: -WINDOW, yMax: WINDOW });
        const [p1, q1] = pointsText(l1);
        const [p2, q2] = pointsText(l2);
        const drawn = form === "both" ? [l1, l2] : [l1];
        const parts = [...P.grid(), ...P.axes(), ...drawn.map((line) => P.line(line.rise, -line.run, -line.run * line.b0))];
        if (form === "one") {
          // Name the line near the edge of the window where it is drawn.
          const edgeX = [WINDOW - 0.6, -WINDOW + 0.6].find((x) => Math.abs(l1.b0 + (l1.rise * x) / l1.run) <= WINDOW - 0.8);
          if (edgeX === undefined) continue;
          parts.push(P.label(edgeX, l1.b0 + (l1.rise * edgeX) / l1.run, "ℓ", { italic: true, dx: edgeX > 0 ? -12 : 12, dy: -12 }));
        }
        const through = (a, b) => `${point(...a)} and ${point(...b)}`;
        const alt = form === "both"
          ? `Two lines graphed in ${P.describe()}, with grid lines 1 unit apart. One line passes through ${through(p1, q1)}; ` +
            `the other passes through ${through(p2, q2)}. The lines cross at a point that is not on a grid intersection.`
          : `Line ℓ graphed in ${P.describe()}, with grid lines 1 unit apart. Line ℓ passes through ${through(p1, q1)}.`;
        // Line k, shown only as an equation: A x + B y = C with whole numbers.
        const kA = l2.rise;
        const kB = -l2.run;
        const kC = -l2.run * l2.b0;
        const sign = kA < 0 ? -1 : 1;
        const kText = standardFormHard(sign * kA, sign * kB, sign * kC);
        if (form === "one" && (kA === 0 || kC === 0)) continue;
        const slope = (line) => frac(line.rise, line.run);
        const eq = (line) => `y = ${slopeText(line)}${line.b0 === 0 ? "" : ` ${line.b0 < 0 ? MINUS : "+"} ${Math.abs(line.b0)}`}`;
        const steps = form === "both"
          ? [
            `The line through ${through(p1, q1)} has slope ${slope(l1)} and y-intercept ${num(l1.b0)}: ${eq(l1)}.`,
            `The line through ${through(p2, q2)} has slope ${slope(l2)} and y-intercept ${num(l2.b0)}: ${eq(l2)}.`,
            `Set the right sides equal and solve: x = ${show(cross[0])}, and then y = ${show(cross[1])}.`,
            `The ${coordinate} is ${key}; the graph alone shows only that it lies between ${num(Math.floor(value(asked)))} and ${num(Math.floor(value(asked)) + 1)}.`,
          ]
          : [
            `Line ℓ passes through ${through(p1, q1)}, so its slope is ${slope(l1)} and its equation is ${eq(l1)}.`,
            `Substitute that expression for y into ${kText} and solve: x = ${show(cross[0])}.`,
            `Then y = ${show(cross[1])}, so the ${coordinate} is ${key}.`,
          ];
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 125,
          stimulus: form === "one" ? { type: "equations", content: kText } : null,
          figure: { svg: P.svg(parts, alt), alt, notToScale: false },
          stem: form === "both"
            ? `The graphs of the two equations in a system of linear equations are shown. If the solution to the system is (a, b), what is the value of ${askX ? "a" : "b"}?`
            : `Line ℓ is shown in the xy-plane. Line k, which is not shown, is the graph of the given equation. If lines ℓ and k intersect at the point (a, b), what is the value of ${askX ? "a" : "b"}?`,
          correct: numeric ? numericKey : key,
          wrong: numeric ? [] : wrong,
          explanation: steps.join(" "),
          steps,
          principles: [
            "A line's equation can be read from any two points on it: the slope is the change in y over the change in x.",
            "The solution of a system of two linear equations is the point where their graphs intersect.",
          ],
          trap: form === "both"
            ? `The drawing shows the lines crossing near a grid point, but the exact ${coordinate} is ${key}, which only the equations give.`
            : `Each slope must be read with its sign and as rise over run; a slip in either moves the intersection.`,
          hint: form === "both"
            ? "The graph can only give an estimate here; what would give the exact values?"
            : "What does line ℓ's graph tell you about its equation?",
          verify: () => {
            // Rebuild each line from two of its listed points and solve by Cramer's rule.
            const fromPoints = ([x1, y1], [x2, y2]) => [y2 - y1, x1 - x2, (y2 - y1) * x1 + (x1 - x2) * y1];
            const first = fromPoints(p1, q1);
            const second = form === "both" ? fromPoints(p2, q2) : lineCoefficients(kText);
            const onDrawn = [[p1, l1], [q1, l1], [p2, l2], [q2, l2]].every(([[x, y], line]) =>
              Math.abs(x) <= WINDOW && Math.abs(y) <= WINDOW && approx(y, line.b0 + (line.rise * x) / line.run));
            const solution = cramer(first, second);
            if (!solution || !onDrawn) return false;
            const answer = askX ? solution[0] : solution[1];
            const shown = numeric ? numericKey : Number(key.replace(MINUS, "-").split("/")[0]) / Number(key.split("/")[1] || 1);
            return approx(answer, shown);
          },
        };
      }
    },
  };

  // The number a choice label stands for: "−7/3" -> −2.333….
  const valueOfLabel = (label) => {
    const [top, bottom] = S.label(label).replace(MINUS, "-").split("/");
    return Number(top) / Number(bottom || 1);
  };

  // How many of the offered wrong choices share a number with the key's label.
  function echoes(key, wrong) {
    const digits = (text) => new Set(S.label(text).match(/\d+/g) || []);
    const own = digits(key);
    return wrong.filter(([text]) => [...digits(text)].some((token) => own.has(token))).length;
  }

  // Picks three distractors from a pool of modelled mistakes so the key is
  // the least or the greatest choice about half the time, rather than
  // wherever the mistakes' sizes happen to put it.
  function pickBalanced(t, key, pool) {
    const seen = new Set([S.label(key)]);
    const unique = pool.filter(([text]) => !seen.has(S.label(text)) && seen.add(S.label(text)));
    const k = valueOfLabel(key);
    const below = unique.filter(([text]) => valueOfLabel(text) < k);
    const above = unique.filter(([text]) => valueOfLabel(text) > k);
    if (t.chance(0.5)) {
      const side = t.shuffle([below, above]).find((list) => list.length >= 3);
      if (side) return t.shuffle(side).slice(0, 3);
    } else if (below.length && above.length) {
      const first = [t.pick(below), t.pick(above)];
      return [...first, ...t.shuffle(unique.filter((entry) => !first.includes(entry)))].slice(0, 3);
    }
    return t.shuffle(unique).slice(0, 3);
  }

  // Credit the cold review's blind strategy earns on one set of choices (the
  // key first): of the two middle values, the choice sharing the most numbers
  // with the others is picked, and ties split the credit.
  function blindCredit(labels) {
    const tokens = labels.map((text) => new Set(text.replace(/−/g, "-").match(/\d+(\.\d+)?|[a-zA-Z]+/g) || []));
    const score = tokens.map((mine, index) => tokens.reduce((sum, theirs, other) =>
      sum + (index === other ? 0 : [...mine].filter((token) => theirs.has(token)).length), 0));
    const order = [0, 1, 2, 3].sort((left, right) => valueOfLabel(labels[left]) - valueOfLabel(labels[right]));
    const middle = [order[1], order[2]];
    const best = Math.max(...middle.map((index) => score[index]));
    const kept = middle.filter((index) => score[index] === best);
    return kept.includes(0) ? 1 / kept.length : 0;
  }

  // Chooses three distractors from a pool of modelled mistakes so that
  // neither the key's rank among the values nor the digits it shares with
  // the others singles it out: over many items a student who never reads
  // the question does no better than chance. Returns null when the pool is
  // too small.
  function neutralTriple(t, key, pool) {
    const seen = new Set([S.label(key)]);
    const unique = pool.filter(([text]) => !seen.has(S.label(text)) && seen.add(S.label(text))).slice(0, 8);
    if (unique.length < 3) return null;
    const scored = [];
    for (let i = 0; i < unique.length; i += 1) {
      for (let j = i + 1; j < unique.length; j += 1) {
        for (let k = j + 1; k < unique.length; k += 1) {
          const triple = [unique[i], unique[j], unique[k]];
          scored.push({ triple, credit: blindCredit([key, ...triple.map(([text]) => text)].map(S.label)) });
        }
      }
    }
    const credited = scored.filter((entry) => entry.credit > 0);
    const clear = scored.filter((entry) => entry.credit === 0);
    if (!credited.length || !clear.length) return t.shuffle(t.pick(scored).triple);
    const mean = credited.reduce((sum, entry) => sum + entry.credit, 0) / credited.length;
    const chosen = t.chance(Math.min(1, 0.22 / mean)) ? t.pick(credited) : t.pick(clear);
    return t.shuffle(chosen.triple);
  }

  // "(2/3)x", "−3x", "x" for a slope rise/run.
  function slopeText(line) {
    const divisor = S.gcd(line.rise, line.run);
    const top = line.rise / divisor;
    const bottom = line.run / divisor;
    if (bottom === 1) return lin(top, 0);
    return `${top < 0 ? MINUS : ""}(${Math.abs(top)}/${bottom})x`;
  }

  /* ------------------------------------------------------ system-mixture-blend */

  // Blends: amounts x of the weaker ingredient and y of the stronger, whose
  // weighted average is the target. Scenes know their words and units.
  const blendScenes = [
    {
      kind: "percent", substance: "acid", unit: "liter", units: "liters",
      make: (t) => ({ low: 5 * t.int(1, 6), high: 5 * t.int(8, 18) }),
      text: (v) =>
        `A chemist combines a ${v.low}% acid solution with a ${v.high}% acid solution to make ${v.total} liters of a ` +
        `${v.target}% acid solution.`,
      askLow: (v) => `How many liters of the ${v.low}% solution does the chemist use?`,
      askHigh: (v) => `How many liters of the ${v.high}% solution does the chemist use?`,
      lowName: (v) => `the ${v.low}% solution`, highName: (v) => `the ${v.high}% solution`,
      pure: "liters of acid in the final solution",
    },
    {
      kind: "percent", substance: "copper", unit: "kilogram", units: "kilograms",
      make: (t) => ({ low: 5 * t.int(2, 8), high: 5 * t.int(10, 18) }),
      text: (v) =>
        `A foundry melts together an alloy that is ${v.low}% copper and an alloy that is ${v.high}% copper to make ` +
        `${v.total} kilograms of an alloy that is ${v.target}% copper.`,
      askLow: (v) => `How many kilograms of the ${v.low}% copper alloy does the foundry use?`,
      askHigh: (v) => `How many kilograms of the ${v.high}% copper alloy does the foundry use?`,
      lowName: (v) => `the ${v.low}% alloy`, highName: (v) => `the ${v.high}% alloy`,
      pure: "kilograms of copper in the final alloy",
    },
    {
      kind: "price", substance: "coffee", unit: "pound", units: "pounds",
      make: (t) => ({ low: t.int(6, 10), high: t.int(12, 18) }),
      text: (v) =>
        `A roaster mixes coffee beans that cost ${usdHard(v.low)} per pound with beans that cost ${usdHard(v.high)} per ` +
        `pound to make ${v.total} pounds of a blend that costs ${usdHard(v.target)} per pound.`,
      askLow: (v) => `How many pounds of the ${usdHard(v.low)}-per-pound beans are in the blend?`,
      askHigh: (v) => `How many pounds of the ${usdHard(v.high)}-per-pound beans are in the blend?`,
      lowName: (v) => `the ${usdHard(v.low)} beans`, highName: (v) => `the ${usdHard(v.high)} beans`,
      pure: "dollars the whole blend is worth",
    },
    {
      kind: "interest", substance: "interest", unit: "dollar", units: "dollars",
      make: (t) => ({ low: t.int(2, 4), high: t.int(5, 8) }),
      text: (v) =>
        `Rosa invested a total of ${usdHard(v.total)} in two accounts. One account earns ${v.low}% simple annual ` +
        `interest, and the other earns ${v.high}%. After one year, the two accounts had earned ${usdHard(v.interest)} in interest in all.`,
      askLow: (v) => `How many dollars did Rosa invest in the account that earns ${v.low}%?`,
      askHigh: (v) => `How many dollars did Rosa invest in the account that earns ${v.high}%?`,
      lowName: (v) => `the ${v.low}% account`, highName: (v) => `the ${v.high}% account`,
      pure: "dollars of interest earned",
    },
  ];

  // Adding a pure ingredient (or water) until the mixture reaches a target.
  const adjustScenes = [
    {
      substance: "acid", unit: "liters", solution: (p) => `a ${p}% acid solution`, pureName: "pure acid", liquid: "liters",
      text: (v) => `A chemist has ${v.V} liters of a ${v.p0}% acid solution.`,
    },
    {
      substance: "salt", unit: "liters", solution: (p) => `a ${p}% salt solution`, pureName: "pure salt", liquid: "liters",
      text: (v) => `A lab technician has ${v.V} liters of a ${v.p0}% salt solution, by volume.`,
      waterOnly: true,
    },
    {
      substance: "juice", unit: "cups", solution: (p) => `a drink that is ${p}% juice`, pureName: "pure juice", liquid: "cups",
      text: (v) => `A pitcher holds ${v.V} cups of a fruit drink that is ${v.p0}% juice.`,
    },
  ];

  const tidy = (x) => Math.round(x * 1e6) / 1e6;
  const hundredths = (x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

  function blendItem(t, numeric) {
    const scene = t.pick(blendScenes);
    const askHigh = t.chance(0.5);
    for (;;) {
      const v = scene.make(t);
      const interest = scene.kind === "interest";
      const step = interest ? 500 : 1;
      const x = step * t.int(interest ? 2 : 2, interest ? 30 : 40);
      const y = step * t.int(interest ? 2 : 2, interest ? 30 : 40);
      if (x === y) continue;
      v.total = x + y;
      const weighted = v.low * x + v.high * y;
      v.target = weighted / v.total;
      if (interest) {
        v.interest = weighted / 100;
        if (!hundredths(v.interest)) continue;
      } else if (scene.kind === "price") {
        if (!hundredths(v.target) || Math.abs(v.target * 4 - Math.round(v.target * 4)) > 1e-9) continue;
      } else if (!Number.isInteger(v.target)) continue;
      const key = askHigh ? y : x;
      const other = askHigh ? x : y;
      const name = askHigh ? scene.highName(v) : scene.lowName(v);
      const otherName = askHigh ? scene.lowName(v) : scene.highName(v);
      const half = v.total / 2;
      const average = (v.low + v.high) / 2;
      const wrong = [[other, `Gives the amount of ${otherName}, not ${name}.`]];
      const extra = [];
      if (interest) {
        extra.push([half, `Splits the ${usdHard(v.total)} equally between the accounts, which would earn ${usdHard((half * (v.low + v.high)) / 100)}, not ${usdHard(v.interest)}.`]);
        extra.push([tidy((v.interest * 100) / v.high), `Treats all ${usdHard(v.interest)} of interest as coming from the ${v.high}% account.`]);
        extra.push([v.interest, `Gives the total interest, not an amount invested.`]);
      } else {
        const averageText = scene.kind === "price" ? usdHard(average) : `${num(average)}%`;
        extra.push([half, `Uses equal amounts of each, which would make the mixture ${averageText}, the simple average, not the target.`]);
        extra.push([tidy((v.target * v.total) / v.high), `Treats ${scene.lowName(v)} as if it contributed no ${scene.kind === "price" ? "value" : scene.substance}.`]);
        extra.push([tidy(scene.kind === "price" ? v.target * v.total : (v.target * v.total) / 100), `Gives the ${scene.pure}, a value found on the way.`]);
      }
      wrong.push(...t.shuffle(extra));
      if (!numeric && (distinctWrongHard(key, wrong) < 3 || hitsKey(key, wrong))) continue;
      if (wrong.slice(0, 3).some(([w]) => w <= 0 || !hundredths(w)) || !fitsGridHard(key)) continue;
      const lowRate = interest || scene.kind === "percent" ? `0.${String(v.low).padStart(2, "0")}`.replace(/0+$/, "") : num(v.low);
      const highRate = interest || scene.kind === "percent" ? `0.${String(v.high).padStart(2, "0")}`.replace(/0+$/, "") : num(v.high);
      const totalRight = interest ? commasHard(v.interest) : scene.kind === "price" ? commasHard(v.target * v.total) : num((v.target * v.total) / 100);
      const system = [`x + y = ${commasHard(v.total)}`, `${lowRate}x + ${highRate}y = ${totalRight}`];
      const contents = interest
        ? "the interest from the two accounts adds up to the total interest"
        : scene.kind === "price"
          ? "the values of the two kinds of beans add up to the value of the blend"
          : `the ${scene.substance} in the two parts adds up to the ${scene.substance} in the mixture`;
      return commaChoicesHard({
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 130,
        stimulus: null,
        stem: `${scene.text(v)} ${askHigh ? scene.askHigh(v) : scene.askLow(v)}`,
        correct: key,
        wrong: numeric ? [] : wrong,
        explanation:
          `Let x be the amount of ${scene.lowName(v)} and y the amount of ${scene.highName(v)}. The amounts add up to ` +
          `${commasHard(v.total)}, and ${contents}: ${system[0]} and ${system[1]}. Solving gives x = ${commasHard(x)} and y = ${commasHard(y)}.`,
        steps: [
          `Amounts: ${system[0]}.`,
          `${interest ? "Interest" : scene.kind === "price" ? "Value" : `Amount of ${scene.substance}`}: ${system[1]}.`,
          `Substitute x = ${commasHard(v.total)} ${MINUS} y and solve: y = ${commasHard(y)}, so x = ${commasHard(x)}.`,
          `The question asks for ${name}: ${commasHard(key)}.`,
        ],
        principles: [
          "A mixture's overall rate is the weighted average of its parts' rates, weighted by how much of each part there is.",
          "One equation counts the amounts; the other counts what those amounts contain.",
        ],
        trap: `The target is not halfway between ${interest ? `${v.low}% and ${v.high}%` : scene.kind === "price" ? `${usdHard(v.low)} and ${usdHard(v.high)}` : `${v.low}% and ${v.high}%`}, so the amounts are not equal; and the system gives both amounts, only one of which is asked for.`,
        hint: "Write one equation about the amounts and one about what they contain.",
        verify: () => {
          // Brute force over whole amounts on the scene's step.
          const found = [];
          for (let a = step; a < v.total; a += step) {
            const b = v.total - a;
            const total = v.low * a + v.high * b;
            if (Math.abs(total - weighted) < 1e-6) found.push([a, b]);
          }
          return found.length === 1 && (askHigh ? found[0][1] : found[0][0]) === key;
        },
      });
    }
  }

  function adjustItem(t, numeric) {
    const scene = t.pick(adjustScenes);
    const addWater = scene.waterOnly || t.chance(0.5);
    for (;;) {
      const V = 10 * t.int(2, 12);
      const p0 = 5 * t.int(1, 12);
      const pt = addWater ? p0 - 5 * t.int(1, 6) : p0 + 5 * t.int(1, 6);
      if (pt <= 0 || pt >= 95) continue;
      const key = addWater ? (V * (p0 - pt)) / pt : (V * (pt - p0)) / (100 - pt);
      if (!hundredths(key) || Math.abs(key * 2 - Math.round(key * 2)) > 1e-9 || key <= 0) continue;
      const added = addWater ? "water" : scene.pureName;
      const v = { V, p0 };
      const base = tidy((V * Math.abs(pt - p0)) / 100);
      const wrong = [
        [base, `Takes ${Math.abs(pt - p0)}% of the original ${V} ${scene.liquid}, as if adding ${added} did not change the total amount.`],
        ...t.shuffle([
          [tidy(V + key), `Gives the total amount of the new mixture, not the amount of ${added} added.`],
          addWater
            ? [tidy((V * p0) / 100), `Gives the amount of ${scene.substance} in the mixture, which adding water does not change.`]
            : [tidy((pt * (V + key)) / 100), `Gives the amount of ${scene.substance} in the new mixture, not the amount added.`],
          addWater
            ? [tidy((V * (p0 - pt)) / p0), `Divides by ${p0}, the starting percent, instead of by ${pt}, the percent after the water is added.`]
            : [tidy((V * (pt - p0)) / (100 - p0)), `Divides by 100 ${MINUS} ${p0} instead of 100 ${MINUS} ${pt}.`],
        ]),
      ];
      if (!numeric && (distinctWrongHard(key, wrong) < 3 || hitsKey(key, wrong))) continue;
      if (wrong.slice(0, 3).some(([w]) => !hundredths(w)) || !fitsGridHard(key)) continue;
      const equation = addWater
        ? `${num(p0 / 100)}(${V}) = ${num(pt / 100)}(${V} + w)`
        : `${num(p0 / 100)}(${V}) + w = ${num(pt / 100)}(${V} + w)`;
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 125,
        stimulus: null,
        stem: `${scene.text(v)} How many ${scene.liquid} of ${added} must be added to make ${scene.solution(pt)}?`,
        correct: key,
        wrong: numeric ? [] : wrong,
        explanation:
          `Let w be the ${scene.liquid} of ${added} added. The ${scene.substance} ${addWater ? "stays the same" : `grows by w`}, and ` +
          `the total grows to ${V} + w, so ${equation}. Solving gives w = ${num(key)}.`,
        steps: [
          `${scene.substance[0].toUpperCase()}${scene.substance.slice(1)} at the start: ${num(p0 / 100)}(${V}) = ${num((p0 * V) / 100)}.`,
          `After adding w ${scene.liquid} of ${added}, the total is ${V} + w and the ${scene.substance} is ${addWater ? num((p0 * V) / 100) : `${num((p0 * V) / 100)} + w`}.`,
          `Set the ${scene.substance} equal to ${pt}% of the new total: ${equation}.`,
          `Solve: w = ${num(key)}.`,
        ],
        principles: [
          "Adding one ingredient changes both the amount of that ingredient and the total, so the percent is a ratio with both parts moving.",
        ],
        trap: `The ${pt}% is a percent of the new total, ${V} + w, not of the original ${V} ${scene.liquid}.`,
        hint: `Track two amounts: the ${scene.substance}, and the whole mixture.`,
        verify: () => {
          // Scan halves for the amount that gives exactly the target percent.
          for (let half = 1; half <= 4000; half += 1) {
            const w = half / 2;
            const part = (p0 * V) / 100 + (addWater ? 0 : w);
            if (Math.abs((100 * part) / (V + w) - pt) < 1e-9) return w === key;
          }
          return false;
        },
      };
    }
  }

  const mixtureBlend = {
    id: "system-mixture-blend",
    domain: "Algebra",
    skill: "Systems of two linear equations",
    subskill: "solve systems",
    difficulty: "Hard",
    title: "Mixtures and blends as a weighted system",
    recognize:
      "A mixture's rate is a weighted average, not a simple one: one equation counts the amounts and a second counts " +
      "what they contain (acid, copper, value, interest); when an ingredient is added, the total changes too.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["unweighted-average", "wrong-quantity", "intermediate-value", "percent-base"],
    build(t) {
      const numeric = t.chance(0.4);
      return t.chance(0.6) ? blendItem(t, numeric) : adjustItem(t, numeric);
    },
  };

  return [
    systemSetup, systemIntersection, systemCombination, systemTotals, systemParameter, twoPlanCrossover,
    twoConstants, graphTwoLines, mixtureBlend,
  ];
});
