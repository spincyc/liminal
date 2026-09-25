(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/algebra"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Linear inequalities templates (Algebra), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, lin, point, frac } = S;
  const {
    clean, whole, commas, usd, money, distinctWrong, commaChoices, moveText, holds, readPoint,
    round2, commasHard, usdHard, commaChoicesHard, distinctWrongHard, compile,
  } = C;

  const FLIP = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };

  const STRICT = { "<": true, ">": true, "≤": false, "≥": false };

  /* ---------------------------------------------------------- inequality-word-limit */

  const limitScenes = [
    {
      kind: "max", units: "boxes", unit: "box", fixedWords: "the worker's own weight", amount: "pounds",
      make: (t) => ({ B: 50 * t.int(20, 50), F: t.int(150, 240), r: t.int(25, 70) }),
      text: (v) =>
        `An elevator can safely carry at most ${commas(v.B)} pounds. A worker who weighs ${v.F} pounds will ride ` +
        `the elevator with boxes that weigh ${v.r} pounds each.`,
      ask: "What is the greatest number of boxes the worker can take on one trip?",
      define: "n is the number of boxes the worker takes on one trip",
    },
    {
      kind: "max", units: "notebooks", unit: "notebook", fixedWords: "the shipping charge", amount: "dollars",
      make: (t) => ({ B: 5 * t.int(12, 40), F: t.int(6, 15), r: t.pick([3, 4, 4.5, 5, 6, 7.5, 8]) }),
      text: (v) =>
        `Jordan has ${usd(v.B)} to spend on an online order of notebooks. Each notebook costs ${usd(v.r)}, and the ` +
        `order has a shipping charge of ${usd(v.F)}.`,
      ask: "What is the greatest number of notebooks Jordan can order?",
      define: "n is the number of notebooks in the order",
    },
    {
      kind: "min", units: "cars", unit: "car", fixedWords: "the amount already raised", amount: "dollars",
      make: (t) => ({ F: 5 * t.int(10, 60), B: 50 * t.int(10, 30), r: t.int(5, 12) }),
      text: (v) =>
        `A club has already raised ${usd(v.F)} for a trip and earns ${usd(v.r)} for each car it washes. The club ` +
        `needs to raise at least ${usd(v.B)} in total.`,
      ask: "What is the least number of cars the club must wash to reach its goal?",
      define: "n is the number of cars the club washes",
    },
    {
      kind: "min", units: "days", unit: "day", fixedWords: "the pages already read", amount: "pages",
      make: (t) => ({ F: t.int(40, 150), B: 10 * t.int(30, 60), r: t.int(18, 45) }),
      text: (v) =>
        `Sam has read ${v.F} pages of a ${v.B}-page book and plans to read ${v.r} pages each day from now on.`,
      ask: "What is the least number of days Sam needs to finish the book?",
      define: "n is the number of days Sam reads from now on",
    },
    {
      kind: "max", units: "hours", unit: "hour", fixedWords: "the data already used", amount: "gigabytes",
      make: (t) => ({ B: t.int(10, 40), F: t.pick([2.5, 3, 4.5, 5, 6.5, 8]), r: t.pick([0.75, 1.5, 2, 2.5, 3]) }),
      text: (v) =>
        `Kai's phone plan allows at most ${v.B} gigabytes of data per month. Kai has used ${num(v.F)} gigabytes so far ` +
        `this month, and streaming video uses ${num(v.r)} gigabytes per hour.`,
      ask: "What is the greatest whole number of hours of video Kai can stream for the rest of the month without going over the limit?",
      define: "n is the number of hours of video Kai streams for the rest of the month",
    },
  ];

  /* -------------------------------------------- inequality-integer-optimization */

  const budgetScenes = [
    {
      xs: "small trays", ys: "large trays", items: "trays", a: [8, 18], b: [22, 45], scale: 10,
      setup: (a, b) =>
        `A caterer is preparing small trays and large trays for an event. Each small tray costs ${usdHard(a)} to ` +
        `prepare, and each large tray costs ${usdHard(b)} to prepare.`,
      limits: (C, L, N) =>
        `The caterer can spend at most ${usdHard(C)}, must prepare at least ${L} large trays, and can deliver at most ${N} trays in total.`,
      ask: "What is the maximum number of small trays the caterer can prepare?",
    },
    {
      xs: "tablets", ys: "laptops", items: "devices", a: [150, 320], b: [420, 900], scale: 100,
      setup: (a, b) => `A school is buying tablets and laptops. Each tablet costs ${usdHard(a)}, and each laptop costs ${usdHard(b)}.`,
      limits: (C, L, N) =>
        `The school can spend at most ${usdHard(C)}, must buy at least ${L} laptops, and has charging carts with ` +
        `room for at most ${N} devices in total.`,
      ask: "What is the maximum number of tablets the school can buy?",
    },
    {
      xs: "shrubs", ys: "trees", items: "plants", a: [12, 30], b: [55, 120], scale: 50,
      setup: (a, b) => `A park crew is buying shrubs and trees for a new garden. Each shrub costs ${usdHard(a)}, and each tree costs ${usdHard(b)}.`,
      limits: (C, L, N) =>
        `The crew can spend at most ${usdHard(C)}, must plant at least ${L} trees, and has space for at most ${N} plants in total.`,
      ask: "What is the maximum number of shrubs the crew can buy?",
    },
  ];

  const revenueScenes = [
    {
      xs: "mugs", ys: "tote bags", a: [6, 15], b: [16, 28], scale: 50,
      setup: (a, b, P, R) =>
        `A club is selling mugs for ${usdHard(a)} each and tote bags for ${usdHard(b)} each to raise at least ${usdHard(R)}. ` +
        `The club has only ${P} mugs to sell.`,
      ask: "What is the minimum number of tote bags the club must sell to reach its goal?",
    },
    {
      xs: "baskets of peaches", ys: "baskets of plums", a: [9, 16], b: [11, 22], scale: 25,
      setup: (a, b, P, R) =>
        `A farm stand sells baskets of peaches for ${usdHard(a)} each and baskets of plums for ${usdHard(b)} each. ` +
        `Only ${P} baskets of peaches are available this week, and the stand's goal is at least ${usdHard(R)} in sales.`,
      ask: "What is the minimum number of baskets of plums the stand must sell this week to meet its goal?",
    },
    {
      xs: "balcony tickets", ys: "floor tickets", a: [18, 32], b: [36, 65], scale: 100,
      setup: (a, b, P, R) =>
        `A theater sells balcony tickets for ${usdHard(a)} each and floor tickets for ${usdHard(b)} each. The balcony ` +
        `has ${P} seats, and the theater needs ticket sales of at least ${usdHard(R)} for a performance.`,
      ask: "What is the minimum number of floor tickets the theater must sell for that performance?",
    },
  ];

  const ratioScenes = [
    {
      xs: "trees", ys: "shrubs", xOne: "tree", a: [30, 75], b: [6, 18], scale: 50,
      setup: (a, b, k, C) =>
        `A landscaper is buying trees for ${usdHard(a)} each and shrubs for ${usdHard(b)} each. The landscaper must buy ` +
        `at least ${k} times as many shrubs as trees and can spend at most ${usdHard(C)}.`,
      ask: "What is the maximum number of trees the landscaper can buy?",
    },
    {
      xs: "desks", ys: "chairs", xOne: "desk", a: [120, 260], b: [35, 90], scale: 100,
      setup: (a, b, k, C) =>
        `An office manager is ordering desks for ${usdHard(a)} each and chairs for ${usdHard(b)} each. The order must ` +
        `include at least ${k} times as many chairs as desks and can cost at most ${usdHard(C)}.`,
      ask: "What is the maximum number of desks the manager can order?",
    },
    {
      xs: "basketballs", ys: "cones", xOne: "basketball", a: [18, 35], b: [2, 6], scale: 25,
      setup: (a, b, k, C) =>
        `A coach is buying basketballs for ${usdHard(a)} each and practice cones for ${usdHard(b)} each. The coach needs ` +
        `at least ${k} times as many cones as basketballs and can spend at most ${usdHard(C)}.`,
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

  const inequalitySolve = {
    id: "linear-inequality-solve",
    domain: "Algebra",
    skill: "Linear inequalities",
    subskill: "solve inequalities",
    difficulty: "Easy",
    title: "Solving a one-variable linear inequality",
    recognize:
      "Solve as for an equation, but dividing or multiplying both sides by a negative number reverses the inequality, " +
      "and a strict inequality excludes its boundary.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 0, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "reversed-condition"],
    build(t) {
      const form = t.pick(["set", "set", "member", "extreme"]);
      for (;;) {
        const a = (t.chance(0.6) ? -1 : 1) * t.int(2, 9);
        const k = t.nonzero(-9, 9);
        const b = t.nonzero(-15, 15);
        const c = a * k + b;
        const rel = form === "member" ? t.pick(["<", ">"]) : t.pick(["<", "≤", ">", "≥"]);
        const solRel = a > 0 ? rel : FLIP[rel];
        const expression = a < 0 && t.chance(0.5) ? `${num(b)} ${MINUS} ${lin(-a, 0)}` : lin(a, b);
        const inequality = `${expression} ${rel} ${num(c)}`;
        const flipReason = a < 0
          ? `Divides both sides by ${num(a)} without reversing the inequality.`
          : `Reverses the inequality although ${num(a)} is positive.`;
        const shifted = (c + b) / a;
        const k2 = Number.isInteger(shifted) && shifted !== k ? shifted : -k;
        const k2Reason = k2 === shifted
          ? `Moves ${num(b)} across the inequality without changing its sign.`
          : `Computes ${num(c - b)} ÷ ${paren(a)} as ${num(-k)}, a sign slip in the division.`;
        const steps = [
          `${moveText(b)}: ${lin(a, 0)} ${rel} ${num(c - b)}.`,
          `Divide both sides by ${num(a)}${a < 0 ? ", reversing the inequality because the divisor is negative" : ""}.`,
          `x ${solRel} ${num(k)}.`,
        ];
        const common = {
          stimulus: { type: "equations", content: inequality },
          explanation:
            `${moveText(b)} to get ${lin(a, 0)} ${rel} ${num(c - b)}. Dividing by ${num(a)}` +
            `${a < 0 ? " reverses the inequality" : " keeps its direction"}, so x ${solRel} ${num(k)}.`,
          steps,
          principles: ["Multiplying or dividing both sides of an inequality by a negative number reverses its direction."],
          trap: a < 0
            ? `Dividing by ${num(a)} reverses the inequality; keeping ${rel} gives the opposite set of solutions.`
            : `${num(a)} is positive, so the inequality keeps its direction.`,
          hint: "Watch the sign of the number you divide by.",
        };
        const inSet = (x) => holds(inequality, { x });
        if (form === "set") {
          const key = `x ${solRel} ${num(k)}`;
          const wrong = [
            [`x ${FLIP[solRel]} ${num(k)}`, flipReason],
            [`x ${solRel} ${num(k2)}`, k2Reason],
            [`x ${FLIP[solRel]} ${num(k2)}`, "Makes both mistakes: the boundary's sign and the inequality's direction."],
          ];
          return {
            ...common,
            responseType: "multiple-choice",
            estimatedSeconds: 55,
            stem: "Which of the following describes all solutions to the given inequality?",
            correct: key,
            wrong,
            verify: () => {
              const agree = (text) => {
                for (let x = -40; x <= 40; x += 0.5) if (inSet(x) !== holds(text, { x })) return false;
                return true;
              };
              return agree(key) && wrong.every(([text]) => !agree(text));
            },
          };
        }
        if (form === "member") {
          const toward = solRel === "<" ? -1 : 1;
          const key = k + toward * t.int(1, 4);
          const nearWrong = k - toward * t.int(1, 3);
          const farWrong = k - toward * t.int(4, 7);
          const wrong = [
            [k, `Makes the two sides equal, but the inequality is strict, so x = ${num(k)} is excluded.`],
            [nearWrong, a < 0 ? flipReason : `Satisfies x ${FLIP[solRel]} ${num(k)}, the solution with the inequality reversed.`],
            [farWrong, a < 0 ? flipReason : `Satisfies x ${FLIP[solRel]} ${num(k)}, the solution with the inequality reversed.`],
          ];
          return {
            ...common,
            responseType: "multiple-choice",
            estimatedSeconds: 60,
            stem: "Which of the following values of x is a solution to the given inequality?",
            correct: key,
            wrong,
            verify: () => inSet(key) && wrong.every(([value]) => !inSet(value)),
          };
        }
        const greatest = solRel === "<" || solRel === "≤";
        const key = STRICT[solRel] ? k + (greatest ? -1 : 1) : k;
        return {
          ...common,
          responseType: "numeric",
          estimatedSeconds: 65,
          stem: `What is the ${greatest ? "greatest" : "least"} integer value of x that satisfies the given inequality?`,
          correct: key,
          trap: `${common.trap} ${STRICT[solRel] ? `And x ${solRel} ${num(k)} excludes ${num(k)} itself.` : `And x ${solRel} ${num(k)} includes ${num(k)}.`}`,
          verify: () => {
            let found = null;
            for (let x = -100; x <= 100; x += 1) {
              if (inSet(x)) {
                if (!greatest) {
                  found = x;
                  break;
                }
                found = x;
              }
            }
            return found === key && (greatest ? !inSet(key + 1) : !inSet(key - 1));
          },
        };
      }
    },
  };

  const inequalityWord = {
    id: "inequality-word-limit",
    domain: "Algebra",
    skill: "Linear inequalities",
    subskill: "solve inequalities",
    difficulty: "Medium",
    title: "One-constraint inequality from a story",
    recognize:
      "A limit (at most, at least) makes an inequality, not an equation: a fixed part plus a rate times the count, " +
      "compared with the limit; a count must then be rounded in the direction that keeps the inequality true.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["rounding-direction", "reversed-condition", "intermediate-value"],
    build(t) {
      const scene = t.pick(limitScenes);
      const askModel = t.chance(0.3);
      const numeric = t.chance(0.55);
      const max = scene.kind === "max";
      for (;;) {
        const v = scene.make(t);
        const room = clean(v.B - v.F);
        // Equal fixed and per-item amounts would make the swapped model identical.
        if (room <= v.r * 3 || v.F === v.r) continue;
        const q = room / v.r;
        const exactBoundary = whole(q);
        if (exactBoundary && !t.chance(0.2)) continue;
        const key = max ? Math.floor(q + 1e-9) : Math.ceil(q - 1e-9);
        const rel = max ? "≤" : "≥";
        const show = scene.amount === "dollars" ? money : (value) => commas(value);
        const F = show(v.F);
        const r = show(v.r);
        const B = show(v.B);
        const truth = (n) => {
          const total = Math.round(v.F * 100) + Math.round(v.r * 100) * n;
          return max ? total <= Math.round(v.B * 100) : total >= Math.round(v.B * 100);
        };
        if (askModel) {
          const keyText = `${F} + ${r}n ${rel} ${B}`;
          const wrong = [
            [`${F} + ${r}n ${FLIP[rel]} ${B}`, `Reverses the inequality: the total must be ${max ? "at most" : "at least"} ${B}.`],
            [`${F}n + ${r} ${rel} ${B}`, `Multiplies n by the fixed ${F} instead of by the ${r} per ${scene.unit}.`],
            [`${r}n ${rel} ${B} + ${F}`, `Adds ${F} to the ${max ? "limit" : "goal"} instead of subtracting it.`],
            [`${F} + ${r}n ${max ? "<" : ">"} ${B}`, `Excludes a total of exactly ${B}, which "${max ? "at most" : "at least"}" allows.`],
          ];
          // Over whole numbers, the strict version differs from the key only
          // when the boundary itself is a whole number.
          const chosen = exactBoundary ? [wrong[0], ...t.sample(wrong.slice(1), 2)] : wrong.slice(0, 3);
          const setOf = (text) => {
            const out = [];
            for (let n = 0; n <= 3000; n += 1) if (holds(text, { n })) out.push(n);
            return out.join(",");
          };
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 75,
            stimulus: null,
            stem: `${scene.text(v)} Which inequality represents this situation, where ${scene.define}?`,
            correct: keyText,
            wrong: chosen,
            explanation:
              `The ${scene.amount} involved are the fixed ${F} plus ${r} for each of the n ${scene.units}, and that total must be ` +
              `${max ? "at most" : "at least"} ${B}: ${keyText}.`,
            steps: [
              `Fixed part: ${F}.`,
              `Part that grows with n: ${r}n.`,
              `"${max ? "At most" : "At least"}" means ${rel}: ${keyText}.`,
            ],
            principles: ["\"At most\" translates to ≤ and \"at least\" to ≥."],
            trap: "Reversing the inequality, or attaching the variable to the wrong number, gives a statement that reads just as naturally.",
            hint: "Write the total first, then compare it with the limit.",
            verify: () => {
              let expected = "";
              const out = [];
              for (let n = 0; n <= 3000; n += 1) if (truth(n)) out.push(n);
              expected = out.join(",");
              return setOf(keyText) === expected && chosen.every(([text]) => setOf(text) !== expected);
            },
          };
        }
        const wrong = [];
        if (exactBoundary) {
          wrong.push(max
            ? [key - 1, `Treats "at most" as "fewer than," leaving out ${key}, which meets the limit exactly.`]
            : [key + 1, `Treats "at least" as "more than"; ${key} ${scene.units} already reach the goal exactly.`]);
        } else {
          wrong.push(max
            ? [key + 1, `Rounds ${num(Math.round(q * 100) / 100)} up; ${key + 1} ${scene.units} would go over the limit.`]
            : [key - 1, `Rounds ${num(Math.round(q * 100) / 100)} down; ${key - 1} ${scene.units} would fall short of the goal.`]);
        }
        const ignore = max ? Math.floor(v.B / v.r + 1e-9) : Math.ceil(v.B / v.r - 1e-9);
        wrong.push([ignore, `Leaves out ${scene.fixedWords}.`]);
        wrong.push([room, `Gives the ${scene.amount} ${max ? "left" : "still needed"}, not the number of ${scene.units}.`]);
        const plus = max ? Math.floor((v.B + v.F) / v.r + 1e-9) : Math.ceil((v.B + v.F) / v.r - 1e-9);
        wrong.push([plus, `Adds ${scene.fixedWords} to the ${max ? "limit" : "goal"} instead of subtracting it.`]);
        if (!numeric && distinctWrong(key, wrong) < 3) continue;
        return commaChoices({
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 90,
          stimulus: null,
          stem: `${scene.text(v)} ${scene.ask}`,
          correct: key,
          wrong,
          explanation:
            `The condition is ${F} + ${r}n ${rel} ${B}, so ${r}n ${rel} ${show(room)} and n ${rel} ` +
            `${exactBoundary ? num(q) : `${num(Math.round(q * 100) / 100)}…`}. ` +
            (exactBoundary
              ? `n = ${key} meets the ${max ? "limit" : "goal"} exactly, which is allowed.`
              : `The ${max ? "greatest" : "least"} whole number that satisfies this is ${key}.`),
          steps: [
            `Write the inequality: ${F} + ${r}n ${rel} ${B}.`,
            `${moveText(v.F)}: ${r}n ${rel} ${show(room)}; divide: n ${rel} ${exactBoundary ? num(q) : `about ${num(Math.round(q * 100) / 100)}`}.`,
            `Round ${max ? "down" : "up"} to a whole number: ${key}.`,
          ],
          principles: ["A count limited by \"at most\" rounds down; one required by \"at least\" rounds up."],
          trap: max
            ? "Rounding to the nearest whole number can break the limit; only rounding down is safe."
            : "Rounding to the nearest whole number can leave the goal unmet; only rounding up is safe.",
          hint: "Write the total as an inequality before solving.",
          verify: () => {
            if (max) {
              let best = -1;
              for (let n = 0; n <= 5000; n += 1) if (truth(n)) best = n;
              return best === key;
            }
            for (let n = 0; n <= 5000; n += 1) if (truth(n)) return n === key;
            return false;
          },
        });
      }
    },
  };

  const inequalitySystem = {
    id: "inequality-system-check",
    domain: "Algebra",
    skill: "Linear inequalities",
    subskill: "systems of inequalities",
    difficulty: "Medium",
    title: "Points and bounds for a system of two linear inequalities",
    recognize:
      "A solution of a system satisfies every inequality at once, a strict inequality excludes its boundary line, " +
      "and for a fixed x each inequality bounds y from one side.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "sign-error"],
    build(t) {
      const form = t.chance(0.4) ? "bound" : "point";
      for (;;) {
        const m1 = t.nonzero(-3, 3);
        const b1 = t.int(-6, 6);
        const m2 = t.int(-3, 3);
        const b2 = t.int(-6, 6);
        if (m1 === m2) continue;
        if (form === "point") {
          const rel1 = t.pick([">", "<"]);
          const rel2 = t.pick(["≥", "≤"]);
          const ineq1 = `y ${rel1} ${lin(m1, b1)}`;
          const ineq2 = `y ${rel2} ${lin(m2, b2)}`;
          const cmp = (rel, y, v) => (rel === ">" ? y > v : rel === "<" ? y < v : rel === "≥" ? y >= v : y <= v);
          const f1 = (x, y) => cmp(rel1, y, m1 * x + b1);
          const f2 = (x, y) => cmp(rel2, y, m2 * x + b2);
          const pool = { key: [], reversed: [], boundary: [], signSlip: [], second: [] };
          for (let x = -5; x <= 5; x += 1) {
            for (let y = -10; y <= 10; y += 1) {
              const on1 = y === m1 * x + b1;
              const on2 = y === m2 * x + b2;
              if (f1(x, y) && f2(x, y) && !on2) pool.key.push([x, y]);
              if (!f1(x, y) && !on1 && f2(x, y) && !on2) {
                pool.reversed.push([x, y]);
                if (x !== 0 && cmp(rel1, y, -m1 * x + b1)) pool.signSlip.push([x, y]);
              }
              if (on1 && f2(x, y) && !on2) pool.boundary.push([x, y]);
              if (f1(x, y) && !f2(x, y)) pool.second.push([x, y]);
            }
          }
          if (!pool.key.length || !pool.reversed.length || !pool.boundary.length || !pool.second.length) continue;
          const [kx, ky] = t.pick(pool.key);
          const nearby = (list) => {
            const close = list.filter(([x, y]) => Math.abs(x) <= 4 && Math.abs(y) <= 8);
            return t.pick(close.length ? close : list);
          };
          const side = rel1 === ">" ? "below" : "above";
          const wrong = [
            [point(...nearby(pool.boundary)), `Lies on the line y = ${lin(m1, b1)}, which the strict inequality ${ineq1} excludes.`],
            [point(...nearby(pool.reversed)), `Lies ${side} the line y = ${lin(m1, b1)}, so it satisfies y ${FLIP[rel1]} ${lin(m1, b1)}, the reverse of ${ineq1}.`],
          ];
          if (pool.signSlip.length) {
            wrong.push([point(...nearby(pool.signSlip)), `Satisfies ${ineq1} only if the sign of ${lin(m1, 0)} is lost when substituting.`]);
          }
          wrong.push([point(...nearby(pool.second)), `Satisfies ${ineq1} but not ${ineq2}.`]);
          const key = point(kx, ky);
          const seen = new Set([key]);
          const kept = wrong.filter(([text]) => !seen.has(text) && seen.add(text)).slice(0, 3);
          if (kept.length < 3) continue;
          // Choices are points; the key must not be the only one with a different first coordinate.
          const openings = kept.map(([text]) => text.split(" ")[0]);
          if (new Set(openings).size === 1 && openings[0] !== key.split(" ")[0]) continue;
          const lines = t.chance(0.5) ? [ineq1, ineq2] : [ineq2, ineq1];
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 90,
            stimulus: { type: "equations", content: lines.join("\n") },
            stem: "Which point (x, y) is a solution to the given system of inequalities?",
            correct: key,
            wrong: kept,
            explanation:
              `At ${key}: ${lin(m1, b1)} = ${num(m1 * kx + b1)} and ${lin(m2, b2)} = ${num(m2 * kx + b2)}, so ` +
              `${num(ky)} ${rel1} ${num(m1 * kx + b1)} and ${num(ky)} ${rel2} ${num(m2 * kx + b2)} are both true.`,
            steps: [
              "Substitute each point's x into both right sides.",
              "Compare the point's y with each result, using each inequality's own symbol.",
              `Only ${key} satisfies both.`,
            ],
            principles: [
              "A solution of a system of inequalities satisfies every inequality in the system.",
              "A strict inequality (< or >) does not include points on its boundary line.",
            ],
            trap: "A point on the boundary of a strict inequality, or one on the wrong side of it, can still satisfy the other inequality.",
            hint: "Test each point in both inequalities.",
            verify: () => {
              const both = (text) => {
                const [x, y] = readPoint(text);
                return lines.every((line) => holds(line, { x, y }));
              };
              return both(key) && kept.every(([text]) => !both(text));
            },
          };
        }
        // Bound on k when (p, k) is a solution.
        const p = t.nonzero(-4, 5);
        const lowerStrict = t.chance(0.5);
        const upperStrict = !lowerStrict || t.chance(0.3);
        const L = m1 * p + b1;
        const U = m2 * p + b2;
        if (U - L < 3) continue;
        const lowerLine = `y ${lowerStrict ? ">" : "≥"} ${lin(m1, b1)}`;
        const upperLine = `y ${upperStrict ? "<" : "≤"} ${lin(m2, b2)}`;
        const askGreatest = t.chance(0.6);
        const strict = askGreatest ? upperStrict : lowerStrict;
        const key = askGreatest ? (upperStrict ? U - 1 : U) : (lowerStrict ? L + 1 : L);
        const boundary = askGreatest ? U : L;
        const otherEnd = askGreatest ? (lowerStrict ? L + 1 : L) : (upperStrict ? U - 1 : U);
        const [mUsed, bUsed] = askGreatest ? [m2, b2] : [m1, b1];
        const slip = -mUsed * p + bUsed + (strict ? (askGreatest ? -1 : 1) : 0);
        const lines = t.chance(0.5) ? [lowerLine, upperLine] : [upperLine, lowerLine];
        const numeric = t.chance(0.6);
        const wrong = [
          strict
            ? [boundary, `Is on the line y = ${lin(mUsed, bUsed)}, which the strict inequality excludes.`]
            : [boundary + (askGreatest ? -1 : 1), `Excludes ${num(boundary)}, but the inequality includes its boundary.`],
          [otherEnd, `Gives the ${askGreatest ? "least" : "greatest"} possible value instead.`],
          [slip, `Loses the sign of ${lin(mUsed, 0)} when substituting x = ${num(p)}.`],
        ];
        if (!numeric && distinctWrong(key, wrong) < 3) continue;
        const word = askGreatest ? "greatest" : "least";
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 90,
          stimulus: { type: "equations", content: lines.join("\n") },
          stem:
            `In the xy-plane, the point (${num(p)}, k) is a solution to the given system of inequalities. What is the ` +
            `${word} possible ${strict ? "integer " : ""}value of k?`,
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation:
            `At x = ${num(p)}: ${lin(m1, b1)} = ${num(L)} and ${lin(m2, b2)} = ${num(U)}, so k ${lowerStrict ? ">" : "≥"} ${num(L)} ` +
            `and k ${upperStrict ? "<" : "≤"} ${num(U)}. The ${word} ${strict ? "integer " : ""}value is ${num(key)}.`,
          steps: [
            `Substitute x = ${num(p)} into both inequalities.`,
            `${num(L)} ${lowerStrict ? "<" : "≤"} k ${upperStrict ? "<" : "≤"} ${num(U)}.`,
            `The ${word} ${strict ? "integer " : ""}value in that range is ${num(key)}.`,
          ],
          principles: ["For a fixed x, each inequality in the system bounds y from above or below."],
          trap: strict
            ? `The boundary ${num(boundary)} makes the strict inequality false, so it is not allowed.`
            : `The inequality includes its boundary, so ${num(boundary)} itself is allowed.`,
          hint: "Put the known x-value into each inequality.",
          verify: () => {
            const ok = (k) => lines.every((line) => holds(line, { x: p, y: k }));
            const valid = [];
            for (let k = -200; k <= 200; k += 1) if (ok(k)) valid.push(k);
            if (!valid.length) return false;
            return (askGreatest ? Math.max(...valid) : Math.min(...valid)) === key;
          },
        };
      }
    },
  };

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
            [key + 1, `Rounds ${num(round2(quotient))} up; ${key + 1} ${scene.xs} plus ${L} ${scene.ys} cost more than ${usdHard(C)}.`],
            [N - L, `Uses only the ${N}-${scene.items.replace(/s$/, "")} limit and never checks the budget.`],
            [key + L, `Gives the total number of ${scene.xs} and ${scene.ys}, not the number of ${scene.xs}.`],
            [Math.floor(C / a), `Leaves the required ${scene.ys} out of the budget.`],
          ];
          if (distinctWrongHard(key, wrong) < 3) continue;
          return commaChoicesHard({
            ...common,
            stem: `${scene.setup(a, b)} ${scene.limits(C, L, N)} ${scene.ask}`,
            correct: key,
            wrong,
            explanation:
              `To leave the most money for ${scene.xs}, buy only the required ${L} ${scene.ys}, which cost ${usdHard(b * L)}. ` +
              `That leaves ${usdHard(C - b * L)}, so ${a}x ≤ ${commasHard(C - b * L)} and x ≤ ${num(round2(quotient))}. ` +
              `A whole number of ${scene.xs} cannot exceed that, so x ≤ ${key}. Then ${key} + ${L} = ${key + L} ≤ ${N}, ` +
              `so the ${N}-${scene.items.replace(/s$/, "")} limit is also met.`,
            steps: [
              `Write the limits: ${a}x + ${b}y ≤ ${commasHard(C)}, y ≥ ${L}, and x + y ≤ ${N}.`,
              `Use the smallest allowed y, ${L}: ${a}x ≤ ${commasHard(C - b * L)}.`,
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
            [key - 1, `Rounds ${num(round2(quotient))} down; ${key - 1} ${scene.ys} leave the total short of ${usdHard(R)}.`],
            [Math.ceil(R / b), `Ignores the money from the ${scene.xs}.`],
            [P + key, `Gives the total number of ${scene.xs} and ${scene.ys}, not the number of ${scene.ys}.`],
            [need, `Stops at the amount, in dollars, still needed after the ${scene.xs}.`],
          ];
          if (distinctWrongHard(key, wrong) < 3) continue;
          return commaChoicesHard({
            ...common,
            stem: `${scene.setup(a, b, P, R)} ${scene.ask}`,
            correct: key,
            wrong,
            explanation:
              `The fewest ${scene.ys} are needed when all ${P} ${scene.xs} are sold, bringing in ${usdHard(a * P)}. The rest, ` +
              `${usdHard(need)}, must come from ${scene.ys}: ${b}y ≥ ${commasHard(need)}, so y ≥ ${num(round2(quotient))}. ` +
              `The smallest whole number that reaches the goal is ${key}, rounding up.`,
            steps: [
              `Write the conditions: ${a}x + ${b}y ≥ ${commasHard(R)} with x ≤ ${P}.`,
              `y is smallest when x is as large as possible, x = ${P}: ${b}y ≥ ${commasHard(need)}.`,
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
            [key + 1, `Rounds ${num(round2(quotient))} up; ${key + 1} ${scene.xs} with the ${scene.ys} they require cost more than ${usdHard(C)}.`],
            [reversed, `Reverses the ratio, requiring ${k} times as many ${scene.xs} as ${scene.ys}.`],
            [k * key, `Gives the number of ${scene.ys}, not ${scene.xs}.`],
            [Math.floor(C / a), `Leaves the ${scene.ys} out of the budget.`],
          ];
          if (distinctWrongHard(key, wrong) < 3) continue;
          return commaChoicesHard({
            ...common,
            stem: `${scene.setup(a, b, k, C)} ${scene.ask}`,
            correct: key,
            wrong,
            explanation:
              `With x ${scene.xs} and y ${scene.ys}, the conditions are y ≥ ${k}x and ${a}x + ${b}y ≤ ${commasHard(C)}. The budget ` +
              `goes furthest with the fewest ${scene.ys}, y = ${k}x, so ${a}x + ${b}(${k}x) = ${unit}x ≤ ${commasHard(C)} and ` +
              `x ≤ ${num(round2(quotient))}. The greatest whole number is ${key}.`,
            steps: [
              `Translate the ratio: y ≥ ${k}x (not x ≥ ${k}y).`,
              `Use the fewest ${scene.ys} allowed, y = ${k}x: ${a}x + ${b * k}x = ${unit}x ≤ ${commasHard(C)}.`,
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
        if (distinctWrongHard(key, wrong) < 3) continue;
        const rows = [
          [`Each ${scene.xOne}`, use1[0], use1[1]],
          [`Each ${scene.yOne}`, use2[0], use2[1]],
          ["Available", avail[0], avail[1]],
        ];
        const limitLine = (index) =>
          `${names[index]}: ${use1[index]}x + ${use2[index]}(${T}) ≤ ${avail[index]}, so x ≤ ${num(round2(bounds[index]))}`;
        return commaChoicesHard({
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

  /* ---------------------------------------------------- inequality-allowed-range */

  // "within" scenes allow c − d through c + d; "between" scenes give the two
  // limits directly, possibly with one of them excluded.
  const rangeScenes = [
    {
      letter: "w",
      kind: "within",
      make: (t) => ({ c: t.pick([5, 10, 20, 25, 50]), d: t.pick([0.1, 0.2, 0.25, 0.4, 0.5]) }),
      text: (v) => `A machine fills bags of rice. A filled bag passes inspection if its weight is within ${num(v.d)} pound of ${v.c} pounds.`,
      what: "the weight, in pounds, of a bag that passes inspection",
      greatest: "What is the greatest weight, in pounds, that a bag can have and still pass inspection?",
      least: "What is the least weight, in pounds, that a bag can have and still pass inspection?",
      fails: "values that fail inspection",
    },
    {
      letter: "t",
      kind: "within",
      make: (t) => ({ c: t.int(62, 76), d: t.int(2, 6) }),
      text: (v) => `A greenhouse's heating system keeps the air temperature within ${v.d} degrees Fahrenheit of ${v.c}°F.`,
      what: "a possible air temperature, in degrees Fahrenheit, in the greenhouse",
      greatest: "What is the highest air temperature, in degrees Fahrenheit, that the heating system allows?",
      least: "What is the lowest air temperature, in degrees Fahrenheit, that the heating system allows?",
      fails: "temperatures the system does not allow",
    },
    {
      letter: "m",
      kind: "within",
      make: (t) => ({ c: 5 * t.int(6, 14), d: t.int(3, 8) }),
      text: (v) =>
        `A bus is scheduled to arrive ${v.c} minutes after it leaves the station. It is on time if it arrives no more ` +
        `than ${v.d} minutes earlier or later than scheduled.`,
      what: "the number of minutes after leaving the station at which the bus arrives, if it is on time",
      greatest: "What is the greatest number of minutes after leaving the station at which the bus can arrive and still be on time?",
      least: "What is the least number of minutes after leaving the station at which the bus can arrive and still be on time?",
      fails: "arrival times that are not on time",
    },
    {
      letter: "h",
      kind: "between",
      make: (t) => {
        const L = t.int(40, 54);
        return { L, U: L + t.int(18, 32), lowStrict: false, highStrict: false };
      },
      text: (v) => `To ride a roller coaster, a rider's height must be at least ${v.L} inches and at most ${v.U} inches.`,
      what: "the height, in inches, of a rider who may ride the roller coaster",
      fails: "heights of riders who may not ride",
    },
    {
      letter: "n",
      kind: "between",
      make: (t) => {
        const L = t.int(8, 20);
        return { L, U: L + t.int(10, 30), lowStrict: false, highStrict: true };
      },
      text: (v) => `A museum offers a group rate to groups of at least ${v.L} people but fewer than ${v.U} people.`,
      what: "the number of people in a group that gets the group rate",
      greatest: "What is the greatest number of people a group can have and still get the group rate?",
      fails: "group sizes that do not get the group rate",
    },
  ];

  const relation = (strict) => (strict ? "<" : "≤");

  const inequalityRange = {
    id: "inequality-allowed-range",
    domain: "Algebra",
    skill: "Linear inequalities",
    subskill: "solve inequalities",
    difficulty: "Easy",
    title: "Two-sided inequality from an allowed range",
    recognize:
      "\"Within d of c\" and \"at least L and at most U\" each trap the quantity between two limits at once, so the " +
      "answer is a compound inequality; a limit that is allowed gets ≤, and one that is excluded gets <.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "wrong-quantity"],
    build(t) {
      const scene = t.pick(rangeScenes);
      const v = scene.make(t);
      const x = scene.letter;
      const within = scene.kind === "within";
      const lo = within ? clean(v.c - v.d) : v.L;
      const hi = within ? clean(v.c + v.d) : v.U;
      const lowStrict = !within && v.lowStrict;
      const highStrict = !within && v.highStrict;
      const range = (a, b, sa, sb) => `${num(a)} ${relation(sa)} ${x} ${relation(sb)} ${num(b)}`;
      const asks = ["choice", "choice"].concat(scene.greatest ? ["greatest"] : [], scene.least ? ["least"] : []);
      const ask = t.pick(asks);
      const complement = `${x} ${lowStrict ? "≤" : "<"} ${num(lo)} or ${x} ${highStrict ? "≥" : ">"} ${num(hi)}`;
      let key;
      let wrong;
      let steps;
      if (ask === "choice") {
        key = range(lo, hi, lowStrict, highStrict);
        wrong = [[complement, `Describes the ${scene.fails}, the reverse of the condition.`]];
        if (within) {
          wrong.push(
            ...t.shuffle([
              [range(v.c, hi, false, false), `Allows only values above ${num(v.c)}; "within" also allows values below it.`],
              [range(lo, hi, true, true), `Leaves out ${num(lo)} and ${num(hi)}, which are exactly ${num(v.d)} from ${num(v.c)} and still allowed.`],
              [`${x} ≤ ${num(hi)}`, `Uses only the upper limit, so it also allows every value below ${num(lo)}.`],
            ]),
          );
        } else {
          wrong.push(
            ...t.shuffle([
              lowStrict || highStrict
                ? [range(lo, hi, false, false), `Includes ${num(v.highStrict ? hi : lo)}, which the description excludes.`]
                : [range(lo, hi, true, true), `Leaves out ${num(lo)} and ${num(hi)}, which "at least" and "at most" include.`],
              [range(lo, hi, true, highStrict), `Leaves out ${num(lo)}, which "at least" includes.`],
              [`${x} ${lowStrict ? ">" : "≥"} ${num(lo)}`, `Uses only the lower limit, so it also allows values of ${num(hi)} or more.`],
            ]),
          );
        }
        steps = within
          ? [
            `Within ${num(v.d)} of ${num(v.c)} means from ${num(v.c)} ${MINUS} ${num(v.d)} = ${num(lo)} up to ${num(v.c)} + ${num(v.d)} = ${num(hi)}.`,
            `Both limits are allowed, so ${key}.`,
          ]
          : [
            `The lower limit is ${num(lo)}, which is ${lowStrict ? "excluded" : "included"}; the upper limit is ${num(hi)}, which is ${highStrict ? "excluded" : "included"}.`,
            `So ${key}.`,
          ];
      } else {
        key = ask === "greatest" ? (highStrict ? hi - 1 : hi) : lo;
        wrong = [];
        steps = within
          ? [
            `Within ${num(v.d)} of ${num(v.c)} means ${num(lo)} ≤ ${x} ≤ ${num(hi)}.`,
            `The ${ask} allowed value is ${num(key)}.`,
          ]
          : [
            `The group size n must satisfy ${num(lo)} ≤ n < ${num(hi)}, and n is a whole number.`,
            `The greatest whole number less than ${num(hi)} is ${num(key)}.`,
          ];
      }
      const numeric = ask !== "choice";
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 55,
        stimulus: null,
        stem: numeric
          ? `${scene.text(v)} ${scene[ask]}`
          : `${scene.text(v)} Which inequality represents all possible values of ${x}, ${scene.what}?`,
        correct: key,
        wrong,
        explanation: steps.join(" "),
        steps,
        principles: [
          "A quantity that must stay between two limits satisfies a compound inequality, lower limit < or ≤ quantity < or ≤ upper limit.",
          "\"At least\" and \"at most\" include the limit; \"more than\" and \"fewer than\" exclude it.",
        ],
        trap: within
          ? `"Within ${num(v.d)}" reaches ${num(v.d)} both below and above ${num(v.c)}, and the limits themselves are allowed.`
          : `Only the limit described by "fewer than" or "more than" is excluded; "at least" and "at most" include theirs.`,
        hint: "Find the smallest and the largest allowed values first.",
        verify: () => {
          // Work in hundredths so decimal limits compare exactly.
          const H = (value) => Math.round(value * 100);
          const allowed = within
            ? (z) => Math.abs(z - H(v.c)) <= H(v.d)
            : (z) => (lowStrict ? z > H(lo) : z >= H(lo)) && (highStrict ? z < H(hi) : z <= H(hi));
          const tests = [];
          for (let z = H(lo) - 300; z <= H(hi) + 300; z += 5) tests.push(z);
          tests.push(H(lo), H(hi), H(lo) - 1, H(hi) + 1, H(lo) + 1, H(hi) - 1);
          if (numeric) {
            const ok = tests.filter((z) => allowed(z) && (within || z % 100 === 0));
            const extreme = ask === "greatest" ? Math.max(...ok) : Math.min(...ok);
            return extreme === H(key);
          }
          // Read each offered inequality back from its text.
          const reads = (text) => {
            const parts = text.split(" or ").map((part) => {
              const tokens = part.split(" ");
              const cmp = (a, rel, b) => (rel === "<" ? a < b : rel === "≤" ? a <= b : rel === ">" ? a > b : a >= b);
              if (tokens.length === 5) {
                const [a, r1, , r2, b] = tokens;
                return (z) => cmp(H(Number(a)), r1, z) && cmp(z, r2, H(Number(b)));
              }
              const [, rel, b] = tokens;
              return (z) => cmp(z, rel, H(Number(b)));
            });
            return (z) => parts.some((part) => part(z));
          };
          const agrees = (text) => tests.every((z) => reads(text)(z) === allowed(z));
          return agrees(key) && wrong.every(([text]) => !agrees(text));
        },
      };
    },
  };

  /* -------------------------------------------------------- inequality-region-corner */

  const regionCorner = {
    id: "inequality-region-corner",
    domain: "Algebra",
    skill: "Linear inequalities",
    subskill: "systems of inequalities",
    difficulty: "Hard",
    title: "Greatest or least coordinate over the solution region of two inequalities",
    recognize:
      "No x-value is given, so neither boundary alone limits the coordinate; the extreme occurs where the two boundary " +
      "lines cross, because on either side of that corner one of the inequalities is the one that binds.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["wrong-quantity", "intermediate-value", "sign-error"],
    build(t) {
      const ask = t.pick(["maxY", "minY", "maxX", "minX"]);
      const numeric = t.chance(0.45);
      for (;;) {
        const X = t.nonzero(-8, 10);
        const Y = t.int(-10, 20);
        const up = t.int(1, 6);
        const down = -t.int(1, 6);
        const cUp = Y - up * X;
        const cDown = Y - down * X;
        if (Math.abs(cUp) > 60 || Math.abs(cDown) > 60 || X === Y) continue;
        const rising = lin(up, cUp);
        const falling = lin(down, cDown);
        const relations = {
          maxY: ["≤", "≤"],
          minY: ["≥", "≥"],
          maxX: ["≥", "≤"],
          minX: ["≤", "≥"],
        }[ask];
        const lines = [`y ${relations[0]} ${rising}`, `y ${relations[1]} ${falling}`];
        const askY = ask === "maxY" || ask === "minY";
        const most = ask.startsWith("max");
        const key = askY ? Y : X;
        const slipX = -X;
        const slipY = up * slipX + cUp;
        let wrong;
        if (askY) {
          const atZero = most ? Math.min(cUp, cDown) : Math.max(cUp, cDown);
          const otherIntercept = most ? Math.max(cUp, cDown) : Math.min(cUp, cDown);
          wrong = [
            [X, "Gives the x-coordinate of the corner, not the y-coordinate."],
            ...t.shuffle([
              [atZero, `Finds the ${most ? "greatest" : "least"} value of b only for a = 0, where the boundary lines cross the y-axis.`],
              [otherIntercept, `Takes the y-intercept ${num(otherIntercept)} of one boundary, a point that breaks the other inequality.`],
              [slipY, `Solves for the corner with a sign error, getting a = ${num(slipX)}.`],
            ]),
          ];
        } else {
          wrong = [
            [Y, "Gives the y-coordinate of the corner, not the x-coordinate."],
            ...t.shuffle([
              [slipX, "Solves for the corner with a sign error."],
              [frac(-cUp, up), `Uses the x-intercept of y = ${rising}, where one boundary meets the x-axis, not where the boundaries meet.`],
              [frac(-cDown, down), `Uses the x-intercept of y = ${falling}, where one boundary meets the x-axis, not where the boundaries meet.`],
            ]),
          ];
        }
        if (!numeric && distinctWrongHard(key, wrong) < 3) continue;
        const extreme = most ? "maximum" : "minimum";
        const why = {
          maxY: `For a < ${num(X)} the rising boundary y = ${rising} is the lower ceiling, and for a > ${num(X)} the falling boundary y = ${falling} is; either way b stays below ${num(Y)}.`,
          minY: `For a < ${num(X)} the falling boundary y = ${falling} is the higher floor, and for a > ${num(X)} the rising boundary y = ${rising} is; either way b stays above ${num(Y)}.`,
          maxX: `For a > ${num(X)} the floor y = ${rising} lies above the ceiling y = ${falling}, so no point there satisfies both inequalities.`,
          minX: `For a < ${num(X)} the floor y = ${falling} lies above the ceiling y = ${rising}, so no point there satisfies both inequalities.`,
        }[ask];
        const steps = [
          `The boundary lines meet where ${rising} = ${falling}: ${lin(up - down, 0)} = ${num(cDown - cUp)}, so x = ${num(X)} and y = ${num(Y)}.`,
          why,
          `So the ${extreme} possible value of ${askY ? "b" : "a"} is ${num(key)}, at the corner ${point(X, Y)}.`,
        ];
        const order = t.chance(0.5) ? lines : [lines[1], lines[0]];
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 115,
          stimulus: { type: "equations", content: order.join("\n") },
          stem:
            "In the xy-plane, the point (a, b) lies in the solution region of the given system of inequalities. " +
            `What is the ${extreme} possible value of ${askY ? "b" : "a"}?`,
          correct: key,
          wrong: numeric ? [] : wrong,
          explanation: steps.join(" "),
          steps,
          principles: [
            "The solution region of a system of linear inequalities is bounded by its boundary lines, and an extreme coordinate occurs at a corner where two boundaries meet.",
            "A solution of the system satisfies both inequalities at once.",
          ],
          trap: "Reading a value off one boundary, such as its intercept, ignores the other inequality; only the corner satisfies both at the extreme.",
          hint: "Sketch the two boundary lines and shade the region that satisfies both inequalities.",
          verify: () => {
            // Scan the displayed inequalities for the feasible range of y at each x.
            const bounds = order.map((line) => {
              const [, rel, rhs] = line.match(/^y (≤|≥) (.+)$/);
              return { rel, f: compile(rhs) };
            });
            let best = null;
            for (let x = X - 40; x <= X + 40; x += 0.5) {
              let lower = -Infinity;
              let upper = Infinity;
              bounds.forEach(({ rel, f }) => {
                const value = f({ x });
                if (rel === "≥") lower = Math.max(lower, value);
                else upper = Math.min(upper, value);
              });
              if (lower > upper + 1e-9) continue;
              const candidate = { maxY: upper, minY: lower, maxX: x, minX: x }[ask];
              if (best === null || (most ? candidate > best : candidate < best)) best = candidate;
            }
            return best !== null && Number.isFinite(best) && Math.abs(best - key) < 1e-9;
          },
        };
      }
    },
  };

  return [inequalityRange, inequalitySolve, inequalityWord, inequalitySystem, inequalityOptimization, regionCorner];
});
