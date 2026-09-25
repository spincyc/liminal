(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/advanced-math"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Equivalent expressions templates (Advanced Math), ordered Easy, Medium, Hard.

  const { MINUS, num, paren, signed, lin, approx, poly, sup } = S;
  const {
    tidy, ratio, gridable, drawUntilDistinct, bin, drawUntilDistinctHard, term, terms, realRoots,
    ratioText, quadraticRoots,
  } = C;

  // pw("x", 3) -> "x³", pw("x", 1) -> "x"
  const pw = (name, exponent) => `${name}${exponent === 1 ? "" : sup(exponent)}`;

  // Non-integer sample inputs, so no sample lands on a pole or a root.
  const SAMPLES = [-4.3, -1.7, 0.35, 1.9, 3.6, 7.1];

  const agrees = (f, g, xs = SAMPLES) => xs.every((x) => approx(f(x), g(x), 1e-7));

  /* =============================================== monomial-exponent-rules */

  // "4x³y²": coefficient, then each variable whose exponent is not 0.
  function mono(coefficient, powers) {
    const body = powers
      .filter(([, exponent]) => exponent !== 0)
      .map(([name, exponent]) => pw(name, exponent))
      .join("");
    const magnitude = Math.abs(coefficient);
    const front = magnitude === 1 && body ? "" : num(magnitude);
    return `${coefficient < 0 ? MINUS : ""}${front}${body}`;
  }

  const XY_POINTS = [[1.3, 0.7], [0.6, 1.4], [1.9, 1.15]];

  // Shared shell for the multiple-choice monomial items. `key` and each offer
  // are [coefficient, x exponent, y exponent]; `at` evaluates the original.
  function monomialChoice({ expr, key, offers: all, at, explanation, steps, principles, trap, hint }) {
    const show = ([co, ex, ey]) => mono(co, [["x", ex], ["y", ey]]);
    const value = ([co, ex, ey], x, y) => co * x ** ex * y ** ey;
    // A slip can land on the key (2 + 2 = 2 · 2); such an offer is no distractor.
    const offers = all.filter(([form]) => show(form) !== show(key));
    return {
      responseType: "multiple-choice",
      stimulus: null,
      stem: `Which expression is equivalent to ${expr}?`,
      correct: show(key),
      wrong: offers.map(([form, why]) => [show(form), why]),
      explanation,
      steps,
      principles,
      trap,
      hint,
      verify: () =>
        XY_POINTS.every(([x, y]) => approx(value(key, x, y), at(x, y), 1e-9)) &&
        offers.every(([form]) => XY_POINTS.some(([x, y]) => !approx(value(form, x, y), at(x, y), 1e-6))),
    };
  }

  function exponentProduct(t) {
    const two = t.chance(0.4);
    const p = t.int(2, 9);
    const q = t.int(2, 9);
    const a = t.int(2, 8);
    const b = t.int(1, 6);
    const c = two ? t.int(1, 4) : 0;
    const d = two ? t.int(2, 5) : 0;
    const m = (co, ex, ey) => mono(co, [["x", ex], ["y", ey]]);
    const key = [p * q, a + b, c + d];
    return monomialChoice({
      expr: `(${m(p, a, c)})(${m(q, b, d)})`,
      key,
      offers: [
        [[p * q, a * b, c * d], "Multiplies the exponents of each variable instead of adding them."],
        [[p + q, a + b, c + d], `Adds the coefficients ${p} and ${q} instead of multiplying them.`],
        [[p + q, a * b, c * d], "Adds the coefficients and multiplies the exponents, reversing both operations."],
      ],
      at: (x, y) => p * x ** a * y ** c * (q * x ** b * y ** d),
      explanation:
        `Multiply the coefficients, ${p} · ${q} = ${p * q}, and add the exponents of each variable: ` +
        `${pw("x", a)} · ${pw("x", b)} = ${pw("x", a + b)}` +
        `${two ? ` and ${pw("y", c)} · ${pw("y", d)} = ${pw("y", c + d)}` : ""}. The product is ${m(...key)}.`,
      steps: [
        `Multiply the coefficients: ${p} · ${q} = ${p * q}.`,
        `Add the exponents of x: ${a} + ${b} = ${a + b}${two ? `; add the exponents of y: ${c} + ${d} = ${c + d}` : ""}.`,
        `The product is ${m(...key)}.`,
      ],
      principles: [
        "Multiplying powers of the same base adds the exponents: x^a · x^b = x^(a + b).",
        "The coefficients of a product of monomials multiply as ordinary numbers.",
      ],
      trap: `Multiplying the exponents gives ${pw("x", a * b)}; that rule is for a power raised to a power, not a product.`,
      hint: `Write ${pw("x", a)} · ${pw("x", b)} as a string of x's multiplied together. How many are there?`,
    });
  }

  function exponentPower(t) {
    const n = t.pick([2, 2, 3]);
    const p = n === 2 ? t.pick([2, 3, 4, 5, 6, -2, -3, -5]) : t.pick([2, 3, 4, -2, -3]);
    const a = t.int(2, 6);
    const key = [p ** n, a * n, 0];
    const offers = [];
    if (p < 0 && n % 2 === 0) {
      offers.push([[-(p ** n), a * n, 0], `Keeps the negative sign; (${num(p)})${sup(n)} is positive because the power is even.`]);
    }
    offers.push(
      [[p, a * n, 0], `Raises only ${pw("x", a)} to the power ${n}; the coefficient ${num(p)} must be raised to it as well.`],
      [[p ** n, a + n, 0], `Adds the exponents ${a} and ${n} instead of multiplying them.`],
      [[p * n, a * n, 0], `Multiplies the coefficient ${num(p)} by ${n} instead of raising it to the power ${n}.`],
    );
    const inside = mono(p, [["x", a]]);
    return monomialChoice({
      expr: `(${inside})${sup(n)}`,
      key,
      offers,
      at: (x) => (p * x ** a) ** n,
      explanation:
        `Every factor inside the parentheses is raised to the power ${n}: (${num(p)})${sup(n)} = ${num(p ** n)} and ` +
        `(${pw("x", a)})${sup(n)} = ${pw("x", a * n)}, because a power of a power multiplies the exponents. The result is ${mono(p ** n, [["x", a * n]])}.`,
      steps: [
        `Raise the coefficient to the power ${n}: (${num(p)})${sup(n)} = ${num(p ** n)}.`,
        `Multiply the exponents: (${pw("x", a)})${sup(n)} = ${pw("x", a * n)}.`,
        `The result is ${mono(p ** n, [["x", a * n]])}.`,
      ],
      principles: [
        "A power of a power multiplies the exponents: (x^a)^n = x^(an).",
        "A power of a product raises every factor: (cx^a)^n = c^n · x^(an).",
      ],
      trap: `Adding ${a} and ${n} gives ${pw("x", a + n)}, and forgetting the coefficient leaves ${num(p)} in front; both are offered.`,
      hint: `Write (${inside})${sup(n)} as ${n} copies of ${inside} multiplied together.`,
    });
  }

  function exponentQuotient(t) {
    const p = t.int(2, 9);
    const q = t.int(2, 8);
    const P = p * q;
    const b = t.int(2, 5);
    const a = t.chance(0.5) ? b * t.int(2, 4) : b + t.int(1, 6);
    const offers = [];
    if (a % b === 0 && a / b !== a - b) {
      offers.push([[p, a / b, 0], `Divides the exponents, ${a} ÷ ${b}, instead of subtracting them.`]);
    }
    offers.push(
      [[P - q, a - b, 0], `Subtracts the coefficients, ${P} ${MINUS} ${q}, instead of dividing them.`],
      [[p, a + b, 0], "Adds the exponents instead of subtracting them."],
      [[P, a - b, 0], `Simplifies the powers of x but leaves the coefficient ${P} undivided.`],
    );
    return monomialChoice({
      expr: `(${mono(P, [["x", a]])})/(${mono(q, [["x", b]])})`,
      key: [p, a - b, 0],
      offers,
      at: (x) => (P * x ** a) / (q * x ** b),
      explanation:
        `Divide the coefficients, ${P} ÷ ${q} = ${p}, and subtract the exponents, ${a} ${MINUS} ${b} = ${a - b}. ` +
        `The quotient is ${mono(p, [["x", a - b]])}.`,
      steps: [
        `Divide the coefficients: ${P} ÷ ${q} = ${p}.`,
        `Subtract the exponent of the denominator from that of the numerator: ${a} ${MINUS} ${b} = ${a - b}.`,
        `The quotient is ${mono(p, [["x", a - b]])}.`,
      ],
      principles: [
        "Dividing powers of the same base subtracts the exponents: x^a / x^b = x^(a − b).",
        "The coefficients divide as ordinary numbers.",
      ],
      trap: `Subtracting ${q} from ${P}, or adding the exponents, applies the wrong operation to one part of the quotient.`,
      hint: `Cancel the ${b} factors of x that the numerator and denominator share.`,
    });
  }

  function exponentNumeric(t) {
    const a = t.int(2, 6);
    const n = t.int(2, 4);
    const div = t.chance(0.4);
    const b = div ? t.int(1, a * n - 1) : t.int(1, 9);
    const k = div ? a * n - b : a * n + b;
    const added = div ? a + n - b : a + n + b;
    return {
      responseType: "numeric",
      stimulus: { type: "equations", content: `(${pw("x", a)})${sup(n)} ${div ? "/" : "·"} ${pw("x", b)} = x^k` },
      stem: "The given equation is true for all positive values of x, where k is a constant. What is the value of k?",
      correct: k,
      explanation:
        `(${pw("x", a)})${sup(n)} = ${pw("x", a * n)}, because a power of a power multiplies the exponents. ` +
        `${div ? `Dividing by ${pw("x", b)} subtracts ${b}` : `Multiplying by ${pw("x", b)} adds ${b}`}: ` +
        `${a * n} ${div ? MINUS : "+"} ${b} = ${k}. So k = ${k}.`,
      steps: [
        `Power of a power: (${pw("x", a)})${sup(n)} = x^(${a} · ${n}) = ${pw("x", a * n)}.`,
        `${div ? "Quotient" : "Product"} of powers: ${pw("x", a * n)} ${div ? "/" : "·"} ${pw("x", b)} = x^(${a * n} ${div ? MINUS : "+"} ${b}) = ${pw("x", k)}.`,
        `Match exponents: k = ${k}.`,
      ],
      principles: [
        "(x^a)^n = x^(an), while x^a · x^b = x^(a + b) and x^a / x^b = x^(a − b).",
      ],
      trap: `Adding the ${a} and the ${n} in (${pw("x", a)})${sup(n)} instead of multiplying gives ${added}.`,
      hint: `How many factors of x are in (${pw("x", a)})${sup(n)}?`,
      verify: () => approx(Math.log2((2 ** a) ** n * 2 ** (div ? -b : b)), k, 1e-9),
    };
  }

  /* ================================================== quadratic-factor-match */

  // Other factor pairs of C whose sum is neither B nor −B.
  function otherPairs(B, C) {
    const pairs = [];
    for (let r = -Math.abs(C); r <= Math.abs(C); r += 1) {
      if (r === 0 || C % r !== 0) continue;
      const s = C / r;
      if (r > s || r + s === B || r + s === -B) continue;
      pairs.push([r, s]);
    }
    return pairs;
  }

  function trinomialItem(t, askFactor) {
    const p = t.nonzero(-9, 9);
    const q = t.nonzero(-9, 9);
    if (p === q || p + q === 0 || Math.abs(p * q) > 60) return null;
    const B = p + q;
    const C = p * q;
    const expr = poly([1, B, C]);
    const original = (x) => x * x + B * x + C;
    const keyPair = t.chance(0.5) ? [p, q] : [q, p];
    const common = {
      responseType: "multiple-choice",
      stimulus: null,
      explanation:
        `The numbers ${num(p)} and ${num(q)} multiply to ${num(C)} and add to ${num(B)}, so ` +
        `${expr} = ${bin(1, keyPair[0])}${bin(1, keyPair[1])}.`,
      principles: ["(x + p)(x + q) = x² + (p + q)x + pq: the constant is the product and the x-coefficient is the sum."],
      hint: "Expand a choice in your head: does it give both the x-term and the constant term?",
    };
    if (askFactor) {
      const offers = [
        [-p, `Reverses the sign: x ${signed(-p)} is 0 at x = ${num(p)}, but the expression is 0 at x = ${num(-p)} and x = ${num(-q)}.`],
        [-q, `Reverses the sign: x ${signed(-q)} is 0 at x = ${num(q)}, which does not make the expression 0.`],
        [C, `Uses the constant term, ${num(C)}, as the constant of a factor.`],
        [B, `Uses the coefficient of x, ${num(B)}, as the constant of a factor.`],
      ].filter(([c]) => c !== p && c !== q);
      return {
        ...common,
        stem: `Which of the following is a factor of ${expr}?`,
        correct: lin(1, p),
        wrong: offers.map(([c, why]) => [lin(1, c), why]),
        steps: [
          `Find two numbers with product ${num(C)} and sum ${num(B)}: ${num(p)} and ${num(q)}.`,
          `So ${expr} = ${bin(1, p)}${bin(1, q)}.`,
          `Of the choices, only ${lin(1, p)} is one of these factors.`,
        ],
        trap: `The signs in the factors are the signs of ${num(p)} and ${num(q)}, the opposites of the zeros ${num(-p)} and ${num(-q)}.`,
        verify: () => approx(original(-p), 0) && offers.every(([c]) => !approx(original(-c), 0)),
      };
    }
    const offers = [
      [[[1, -p], [1, -q]], `Reverses both signs; this product is ${poly([1, -B, C])}.`],
    ];
    const pairs = otherPairs(B, C);
    if (pairs.length) {
      const [r, s] = t.pick(pairs);
      offers.push([[[1, r], [1, s]], `${num(r)} and ${num(s)} multiply to ${num(C)} but add to ${num(r + s)}, not ${num(B)}.`]);
    }
    offers.push(
      [[[1, p], [1, -q]], `Gives ${num(q)} the wrong sign; this product is ${poly([1, p - q, -C])}.`],
      [[[1, -p], [1, q]], `Gives ${num(p)} the wrong sign; this product is ${poly([1, q - p, -C])}.`],
    );
    const show = (pair) => pair.map(([m, k]) => bin(m, k)).join("");
    const value = (pair) => (x) => pair.reduce((acc, [m, k]) => acc * (m * x + k), 1);
    const key = [[1, keyPair[0]], [1, keyPair[1]]];
    return {
      ...common,
      stem: `Which expression is equivalent to ${expr}?`,
      correct: show(key),
      wrong: offers.map(([pair, why]) => [show(pair), why]),
      steps: [
        `The constant term ${num(C)} is the product of the two constants in the factors.`,
        `The x-coefficient ${num(B)} is their sum: ${num(p)} + ${paren(q)} = ${num(B)}.`,
        `So ${expr} = ${show(key)}.`,
      ],
      trap: "A pair with the right product is not enough; the signs must also give the right sum.",
      verify: () => agrees(value(key), original) && offers.every(([pair]) => !agrees(value(pair), original)),
    };
  }

  function squaresItem(t) {
    const a = t.int(2, 6);
    const b = t.int(1, 9);
    if (S.gcd(a, b) !== 1) return null;
    const expr = poly([a * a, 0, -b * b]);
    const original = (x) => a * a * x * x - b * b;
    const offers = [
      { text: `${bin(a, -b)}²`, fn: (x) => (a * x - b) ** 2, why: `Writes a perfect square; (${lin(a, -b)})² = ${poly([a * a, -2 * a * b, b * b])} has an x-term.` },
      { text: `${bin(a * a, -b)}${bin(a * a, b)}`, fn: (x) => (a * a * x - b) * (a * a * x + b), why: `Uses ${a * a} as the coefficient of x in each factor instead of its square root, ${a}.` },
      b > 1 && { text: `${bin(a, -b * b)}${bin(a, b * b)}`, fn: (x) => (a * x - b * b) * (a * x + b * b), why: `Uses ${b * b} in each factor instead of its square root, ${b}.` },
      { text: `${bin(a, b)}²`, fn: (x) => (a * x + b) ** 2, why: `Writes a perfect square; (${lin(a, b)})² = ${poly([a * a, 2 * a * b, b * b])} has an x-term.` },
    ].filter(Boolean);
    const key = t.chance(0.5) ? `${bin(a, -b)}${bin(a, b)}` : `${bin(a, b)}${bin(a, -b)}`;
    return {
      responseType: "multiple-choice",
      stimulus: null,
      stem: `Which expression is equivalent to ${expr}?`,
      correct: key,
      wrong: offers.map((offer) => [offer.text, offer.why]),
      explanation:
        `${a * a}x² = (${a}x)² and ${b * b} = ${b}², so the expression is a difference of two squares: ` +
        `${expr} = (${a}x)² ${MINUS} ${b}² = ${bin(a, -b)}${bin(a, b)}.`,
      steps: [
        `Write each term as a square: ${a * a}x² = (${a}x)² and ${b * b} = ${b}².`,
        `A difference of squares factors as A² ${MINUS} B² = (A ${MINUS} B)(A + B).`,
        `So ${expr} = ${bin(a, -b)}${bin(a, b)}.`,
      ],
      principles: ["A² − B² = (A − B)(A + B); the middle terms cancel, which is why the expression has no x-term."],
      trap: `(${lin(a, -b)})² looks similar but expands to a trinomial with an x-term.`,
      hint: "Which choice, when expanded, has no x-term?",
      verify: () =>
        agrees((x) => (a * x - b) * (a * x + b), original) && offers.every((offer) => !agrees(offer.fn, original)),
    };
  }

  /* ============================================ rational-expression-combine */

  // "(8x + 1)/((x + 2)(x − 1))"; a numerator with no space drops its parentheses.
  const over = (top, bottom) => `${/\s/.test(top) ? `(${top})` : top}/${bottom}`;

  function rationalSumItem(t, form) {
    const a = t.int(1, 9);
    const b = t.int(1, 9);
    const p = t.nonzero(-7, 7);
    const q = t.nonzero(-7, 7);
    if (p === q || a === b) return null;
    const den = `(${bin(1, p)}${bin(1, q)})`;
    const denProduct = (x) => (x + p) * (x + q);
    if (form === "constant") {
      // a/(x + p) + b = (bx + (a + bp))/(x + p)
      const K = a + b * p;
      if (K === 0 || p + 1 === 0) return null;
      const single = bin(1, p);
      const expr = t.chance(0.5) ? `${a}/${single} + ${b}` : `${b} + ${a}/${single}`;
      const original = (x) => a / (x + p) + b;
      const offers = [
        { text: over(`${a + b}`, single), fn: (x) => (a + b) / (x + p), why: `Adds ${b} to the numerator only, leaving the denominator as it is.` },
        { text: over(lin(b, a), single), fn: (x) => (b * x + a) / (x + p), why: `Rewrites ${b} as ${b}x/${single}, multiplying ${b} by x but not by the whole denominator.` },
        { text: over(`${a + b}`, bin(1, p + 1)), fn: (x) => (a + b) / (x + p + 1), why: `Treats ${b} as ${b}/1 and adds numerators and denominators separately.` },
      ];
      return {
        responseType: "multiple-choice",
        stimulus: null,
        stem: `Which expression is equivalent to ${expr}?`,
        correct: over(lin(b, K), single),
        wrong: offers.map((offer) => [offer.text, offer.why]),
        explanation:
          `Write ${b} with the denominator ${single}: ${b} = ${b}${single}/${single} = (${lin(b, b * p)})/${single}. ` +
          `Adding the numerators gives (${lin(b, b * p)} + ${a})/${single} = ${over(lin(b, K), single)}.`,
        steps: [
          `Rewrite ${b} over the common denominator: ${b}${single}/${single}.`,
          `Expand the numerator: ${b}${single} = ${lin(b, b * p)}.`,
          `Add ${a}: ${lin(b, b * p)} + ${a} = ${lin(b, K)}, so the sum is ${over(lin(b, K), single)}.`,
        ],
        principles: ["Fractions add only over a common denominator, and a whole number is itself a fraction over 1."],
        trap: `Adding ${b} to the numerator alone changes the value; ${b} must first be written as ${b}${single}/${single}.`,
        hint: `What must ${b} look like to share the denominator ${single}?`,
        verify: () => agrees(original, (x) => (b * x + K) / (x + p)) && offers.every((offer) => !agrees(offer.fn, original)),
      };
    }
    const minus = form === "difference" || (form === "numeric" && t.chance(0.4));
    const sgn = minus ? -1 : 1;
    const A = a + sgn * b;
    const Bk = a * q + sgn * b * p;
    const own = a * p + sgn * b * q;
    if (A === 0 || Bk === 0 || own === 0) return null;
    const expr = `${a}/${bin(1, p)} ${minus ? MINUS : "+"} ${b}/${bin(1, q)}`;
    const original = (x) => a / (x + p) + (sgn * b) / (x + q);
    const offers = [];
    if (minus) {
      offers.push({
        text: over(lin(A, a * q + b * p), den),
        fn: (x) => (A * x + a * q + b * p) / denProduct(x),
        why: `Distributes the minus sign to ${b}x but not to the constant ${num(b * p)} in ${b}${bin(1, p)} = ${lin(b, b * p)}.`,
      });
    }
    offers.push(
      { text: over(lin(A, own), den), fn: (x) => (A * x + own) / denProduct(x), why: "Multiplies each numerator by its own denominator's constant instead of the other denominator's." },
      { text: over(`${num(A)}`, den), fn: (x) => A / denProduct(x), why: `${minus ? "Subtracts" : "Adds"} the numerators over the common denominator without first rescaling them.` },
      minus
        ? { text: ratio(A / (p - q)), fn: () => A / (p - q), why: "Subtracts the numerators and subtracts the denominators separately." }
        : { text: over(`${num(A)}`, bin(2, p + q)), fn: (x) => A / (2 * x + p + q), why: "Adds the numerators and adds the denominators separately." },
    );
    const keyText = over(lin(A, Bk), den);
    const keyFn = (x) => (A * x + Bk) / denProduct(x);
    const expandSteps = [
      `Use the common denominator ${den.slice(1, -1)}: ${a}${bin(1, q)} ${minus ? MINUS : "+"} ${b}${bin(1, p)} over it.`,
      `Expand: ${lin(a, a * q)} ${minus ? MINUS : "+"} (${lin(b, b * p)}) = ${lin(A, Bk)}.`,
    ];
    if (form === "numeric") {
      return {
        responseType: "numeric",
        stimulus: { type: "equations", content: `${expr} = (Ax + B)/${den}` },
        stem: "The given equation is true for all x > 10, where A and B are constants. What is the value of B?",
        correct: Bk,
        explanation:
          `Over the common denominator, the numerator is ${a}${bin(1, q)} ${minus ? MINUS : "+"} ${b}${bin(1, p)} = ${lin(A, Bk)}. ` +
          `So A = ${num(A)} and B = ${num(Bk)}.`,
        steps: [...expandSteps, `Match the constant terms: B = ${num(Bk)}.`],
        principles: ["a/(x + p) + b/(x + q) = (a(x + q) + b(x + p))/((x + p)(x + q))."],
        trap: `A = ${num(A)} is found on the way but is not B, and pairing each numerator with its own constant gives ${num(own)}.`,
        hint: "Rewrite both fractions over the product of the denominators, then compare numerators.",
        verify: () => {
          // Clearing denominators at two inputs gives A·x + B there; solve for B.
          const N = (x) => original(x) * denProduct(x);
          const slope = N(12) - N(11);
          return approx(N(11) - slope * 11, Bk) && approx(slope, A);
        },
      };
    }
    return {
      responseType: "multiple-choice",
      stimulus: null,
      stem: `Which expression is equivalent to ${expr}?`,
      correct: keyText,
      wrong: offers.map((offer) => [offer.text, offer.why]),
      explanation:
        `Rewrite each fraction over ${den.slice(1, -1)}. The numerator becomes ${a}${bin(1, q)} ${minus ? MINUS : "+"} ` +
        `${b}${bin(1, p)} = ${lin(A, Bk)}, so the ${minus ? "difference" : "sum"} is ${keyText}.`,
      steps: [...expandSteps, `The ${minus ? "difference" : "sum"} is ${keyText}.`],
      principles: ["Fractions combine only over a common denominator; each numerator is multiplied by the factor its denominator was missing."],
      trap: minus
        ? `The minus sign applies to all of ${b}${bin(1, p)}, including its constant term.`
        : "Adding numerators and denominators separately is not how fractions add.",
      hint: "What must each fraction be multiplied by to share a denominator?",
      verify: () => agrees(original, keyFn) && offers.every((offer) => !agrees(offer.fn, original)),
    };
  }

  /* =============================================== rational-exponent-rewrite */

  const ROOTS = { 2: "√", 3: "∛", 4: "∜", 5: "⁵√" };

  const radical = (n, m) => (m === 1 ? `${ROOTS[n]}x` : `${ROOTS[n]}(${pw("x", m)})`);

  // x^(7/4); every choice is kept to a non-integer exponent so the forms match.
  const xPow = (value) => `x^(${ratio(value)})`;

  const isWhole = (value) => Math.abs(value - Math.round(value)) < 1e-9;

  function coprimePower(t, n, low = 1, high = 2 * n - 1) {
    for (;;) {
      const m = t.int(low, high);
      if (S.gcd(m, n) === 1) return m;
    }
  }

  function rationalExponentItem(t, kind, numeric) {
    const n = numeric ? t.pick([2, 4, 5]) : t.pick([2, 3, 4, 5]);
    const m = coprimePower(t, n);
    let expr;
    let key;
    let offers;
    let explanation;
    let steps;
    let evaluate;
    let trap;
    if (kind === "product") {
      const k = t.int(1, 3);
      expr = `${radical(n, m)} · ${pw("x", k)}`;
      key = m / n + k;
      offers = [
        [(m * k) / n, `Multiplies the exponents ${ratio(m / n)} and ${k} instead of adding them.`],
        [n / m + k, `Writes ${radical(n, m)} as x^(${n}/${m}), with the root index and the power swapped.`],
        [(m + k) / n, `Adds ${k} to the numerator ${m} without writing ${k} as ${k * n}/${n}.`],
      ];
      explanation = `${radical(n, m)} = x^(${m}/${n}). Multiplying powers of x adds the exponents: ${m}/${n} + ${k} = ${ratio(key)}.`;
      steps = [
        `Rewrite the root: ${radical(n, m)} = x^(${m}/${n}).`,
        `Multiply by ${pw("x", k)} by adding exponents: ${m}/${n} + ${k} = ${m}/${n} + ${k * n}/${n}.`,
        `The exponent is ${ratio(key)}, so the expression is ${xPow(key)}.`,
      ];
      evaluate = (x) => (x ** m) ** (1 / n) * x ** k;
      trap = `Multiplying ${ratio(m / n)} by ${k} where the exponents should be added, or writing the root with its index and power swapped, gives another choice.`;
    } else if (kind === "two-roots") {
      const j = numeric ? t.pick([2, 4, 5].filter((v) => v !== n)) : t.pick([2, 3, 4].filter((v) => v !== n));
      const i = coprimePower(t, j, 1, j + 1);
      expr = `${radical(n, m)} · ${radical(j, i)}`;
      key = m / n + i / j;
      offers = [
        [(m + i) / (n + j), "Adds the numerators and adds the denominators of the two fractional exponents."],
        [(m * i) / (n * j), "Multiplies the two fractional exponents instead of adding them."],
        [n / m + j / i, "Swaps each root's index and power before adding."],
      ];
      explanation = `${radical(n, m)} = x^(${m}/${n}) and ${radical(j, i)} = x^(${i}/${j}). Their product adds the exponents: ${m}/${n} + ${i}/${j} = ${ratio(key)}.`;
      steps = [
        `Rewrite each root: x^(${m}/${n}) and x^(${i}/${j}).`,
        `Add the exponents over a common denominator: ${m}/${n} + ${i}/${j} = ${ratio(key)}.`,
        `The product is ${xPow(key)}.`,
      ];
      evaluate = (x) => (x ** m) ** (1 / n) * (x ** i) ** (1 / j);
      trap = "Fractional exponents add like fractions, over a common denominator; adding tops and bottoms separately, or multiplying, gives another choice.";
    } else if (kind === "power") {
      const k = t.int(2, 3);
      if ((m * k) % n === 0) return null;
      expr = `(${radical(n, m)})${sup(k)}`;
      key = (m * k) / n;
      offers = [
        [m / n + k, `Adds the power ${k} to the exponent ${m}/${n} instead of multiplying.`],
        [m / (n * k), `Divides the exponent ${m}/${n} by ${k} instead of multiplying.`],
        [(n * k) / m, `Writes ${radical(n, m)} as x^(${n}/${m}), with the root index and the power swapped.`],
      ];
      explanation = `${radical(n, m)} = x^(${m}/${n}). A power of a power multiplies the exponents: (${m}/${n}) · ${k} = ${ratio(key)}.`;
      steps = [
        `Rewrite the root: ${radical(n, m)} = x^(${m}/${n}).`,
        `Raise it to the power ${k} by multiplying exponents: (${m}/${n}) · ${k} = ${ratio(key)}.`,
        `The expression is ${xPow(key)}.`,
      ];
      evaluate = (x) => ((x ** m) ** (1 / n)) ** k;
      trap = `A power of a power multiplies the exponents; adding ${k} or dividing by ${k} gives another choice.`;
    } else {
      const k = t.int(Math.floor(m / n) + 1, Math.floor(m / n) + 3);
      expr = `${pw("x", k)}/${radical(n, m)}`;
      key = k - m / n;
      offers = [
        [k + m / n, "Adds the exponents instead of subtracting the denominator's exponent."],
        [(k - m) / n, `Subtracts ${m} from ${k} before dividing by ${n}, instead of writing ${k} as ${k * n}/${n}.`],
        [(k * n) / m, `Divides the exponent ${k} by ${m}/${n} instead of subtracting.`],
      ];
      explanation = `${radical(n, m)} = x^(${m}/${n}). Dividing powers of x subtracts the exponents: ${k} ${MINUS} ${m}/${n} = ${ratio(key)}.`;
      steps = [
        `Rewrite the root: ${radical(n, m)} = x^(${m}/${n}).`,
        `Divide by subtracting exponents: ${k} ${MINUS} ${m}/${n} = ${k * n}/${n} ${MINUS} ${m}/${n}.`,
        `The exponent is ${ratio(key)}, so the expression is ${xPow(key)}.`,
      ];
      evaluate = (x) => x ** k / (x ** m) ** (1 / n);
      trap = `${k} must be written as ${k * n}/${n} before ${m}/${n} is subtracted; subtracting ${m} from ${k} first, or adding, gives another choice.`;
    }
    if (isWhole(key) || offers.some(([value]) => isWhole(value))) return null;
    const check = () => [1.37, 2.9, 0.41].every((x) => approx(evaluate(x), x ** key, 1e-9)) &&
      offers.every(([value]) => [1.37, 2.9].some((x) => !approx(evaluate(x), x ** value, 1e-6)));
    if (numeric) {
      if (!gridable(key)) return null;
      return {
        responseType: "numeric",
        stimulus: { type: "equations", content: `${expr} = x^c` },
        stem: "The given equation is true for all x > 0, where c is a constant. What is the value of c?",
        correct: tidy(key),
        explanation,
        steps,
        principles: ["The nth root of x^m is x^(m/n); after that, the usual exponent rules apply to fractional exponents."],
        trap: `The tempting slips give ${ratio(offers[0][0])} (${offers[0][1].charAt(0).toLowerCase()}${offers[0][1].slice(1, -1)}) and ${ratio(offers[1][0])} (${offers[1][1].charAt(0).toLowerCase()}${offers[1][1].slice(1, -1)}).`,
        hint: "Write every root as a power of x first.",
        verify: check,
      };
    }
    return {
      responseType: "multiple-choice",
      stimulus: null,
      stem: `Which expression is equivalent to ${expr}, where x > 0?`,
      correct: xPow(key),
      wrong: offers.map(([value, why]) => [xPow(value), why]),
      explanation,
      steps,
      principles: ["The nth root of x^m is x^(m/n): the power is the numerator and the root index is the denominator."],
      trap,
      hint: "Write every root as a power of x first.",
      verify: check,
    };
  }

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

  /* --------------------------------------------- expression substitution */

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

  const monomialExponentRules = {
    id: "monomial-exponent-rules",
    difficulty: "Easy",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "exponent rules",
    title: "Monomial products, powers, and quotients",
    recognize:
      "Multiplying powers of one base adds the exponents, raising a power to a power multiplies them, and dividing " +
      "subtracts them; the coefficients follow ordinary arithmetic.",
    rubric: { steps: 0, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const roll = t.random();
      const make = roll < 0.24 ? exponentProduct : roll < 0.46 ? exponentPower : roll < 0.67 ? exponentQuotient : exponentNumeric;
      return { estimatedSeconds: 55, ...drawUntilDistinct(() => make(t)) };
    },
  };

  const quadraticFactorMatch = {
    id: "quadratic-factor-match",
    difficulty: "Easy",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "factoring",
    title: "Factoring a quadratic by matching",
    recognize:
      "In (x + p)(x + q) the constant is pq and the x-coefficient is p + q; a difference of two squares has no x-term.",
    rubric: { steps: 0, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "equivalent-form"],
    build(t) {
      const roll = t.random();
      const make = roll < 0.4 ? () => trinomialItem(t, false) : roll < 0.7 ? () => trinomialItem(t, true) : () => squaresItem(t);
      return { estimatedSeconds: 60, ...drawUntilDistinct(make) };
    },
  };

  const rationalExpressionCombine = {
    id: "rational-expression-combine",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "rational expressions",
    title: "Sum or difference of rational expressions",
    recognize: "Fractions with different denominators combine only after each is rewritten over the product of the denominators.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form", "neighbouring-rule", "sign-error", "intermediate-value"],
    build(t) {
      const roll = t.random();
      const form = roll < 0.3 ? "sum" : roll < 0.55 ? "difference" : roll < 0.7 ? "constant" : "numeric";
      return { estimatedSeconds: 90, ...drawUntilDistinct(() => rationalSumItem(t, form)) };
    },
  };

  const rationalExponentRewrite = {
    id: "rational-exponent-rewrite",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "exponent rules",
    title: "Radicals rewritten as rational exponents",
    recognize: "An nth root of x^m is x^(m/n); once every root is a fractional exponent, products add exponents, powers multiply them, and quotients subtract them.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const numeric = t.chance(0.3);
      const kind = numeric
        ? t.pick(["product", "two-roots", "quotient"])
        : t.pick(["product", "product", "two-roots", "power", "quotient"]);
      return { estimatedSeconds: 85, ...drawUntilDistinct(() => rationalExponentItem(t, kind, numeric)) };
    },
  };

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
      return { estimatedSeconds: 120, ...drawUntilDistinctHard(() => make(t)) };
    },
  };

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

  return [
    monomialExponentRules, quadraticFactorMatch, rationalExpressionCombine, rationalExponentRewrite,
    unknownCoefficientProduct, expressionSubstitution,
  ];
});
