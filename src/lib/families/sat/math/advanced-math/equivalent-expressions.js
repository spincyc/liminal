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
    ratioText, quadraticRoots, lead, rootFactor, sampleQuadratic, denominatorHard,
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
    // A slip can land on the key (2 + 2 = 2 · 2); such a draw is redrawn, so
    // every modelled mistake stays a distractor and no trap names the key.
    if (all.some(([form]) => show(form) === show(key))) return null;
    const offers = all;
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
    // A 2 × 2 grid of independent slips: the coefficient right or wrong, the
    // exponent multiplied or added. Each choice shares one part with two others.
    const coefficientSlips = [
      [p, `Raises only ${pw("x", a)} to the power ${n}; the coefficient ${num(p)} must be raised to it as well.`],
      [p * n, `Multiplies the coefficient ${num(p)} by ${n} instead of raising it to the power ${n}.`],
    ];
    if (p < 0 && n % 2 === 0) {
      coefficientSlips.push([-(p ** n), `Keeps the negative sign; (${num(p)})${sup(n)} is positive because the power is even.`]);
    }
    const [badCo, coWhy] = t.pick(coefficientSlips);
    const offers = [
      [[badCo, a * n, 0], coWhy],
      [[p ** n, a + n, 0], `Adds the exponents ${a} and ${n} instead of multiplying them.`],
      [[badCo, a + n, 0], `${coWhy.replace(/\.$/, "")}, and adds the exponents ${a} and ${n} instead of multiplying them.`],
    ];
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
      trap: `Adding ${a} and ${n} gives ${pw("x", a + n)}, and the coefficient must be raised to the power ${n} as well.`,
      hint: `Write (${inside})${sup(n)} as ${n} copies of ${inside} multiplied together.`,
    });
  }

  function exponentQuotient(t) {
    const p = t.int(2, 9);
    const q = t.int(2, 8);
    const P = p * q;
    const b = t.int(2, 5);
    const a = t.chance(0.5) ? b * t.int(2, 4) : b + t.int(1, 6);
    // A 2 × 2 grid: the coefficient divided or not, the exponents subtracted or not.
    const exponentSlips = [[a + b, "adds the exponents instead of subtracting them"]];
    if (a % b === 0 && a / b !== a - b) exponentSlips.push([a / b, `divides the exponents, ${a} ÷ ${b}, instead of subtracting them`]);
    const coefficientSlips = [
      [P - q, `subtracts the coefficients, ${P} ${MINUS} ${q}, instead of dividing them`],
      [P, `leaves the coefficient ${P} undivided`],
    ];
    const [badEx, exWhy] = t.pick(exponentSlips);
    const [badCo, coWhy] = t.pick(coefficientSlips);
    const cap = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
    const offers = [
      [[p, badEx, 0], cap(exWhy)],
      [[badCo, a - b, 0], cap(coWhy)],
      [[badCo, badEx, 0], cap(`${coWhy}, and ${exWhy}`)],
    ];
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
    if (added === k) return null; // (x²)²: adding and multiplying agree, so the trap would name the key
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
      trap: `Adding the ${a} and the ${n} in (${pw("x", a)})${sup(n)} instead of multiplying gives ${num(added)}.`,
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

  // (mx + p)(x + q) with m > 1: which product, or which factor, matches.
  function nonMonicItem(t, askFactor) {
    const m = t.pick([2, 3, 5]);
    const p = t.nonzero(-9, 9);
    const q = t.nonzero(-7, 7);
    if (S.gcd(m, p) !== 1 || p === q || p === m * q) return null;
    const coefficients = [m, m * q + p, p * q];
    if (coefficients[1] === 0) return null;
    const expr = poly(coefficients);
    const original = (x) => m * x * x + coefficients[1] * x + p * q;
    const value = (pair) => (x) => pair.reduce((acc, [mm, k]) => acc * (mm * x + k), 1);
    const common = {
      responseType: "multiple-choice",
      stimulus: null,
      explanation:
        `${expr} = ${bin(m, p)}${bin(1, q)}: the product of the first terms is ${m}x², the product of the constants is ` +
        `${num(p)} · ${paren(q)} = ${num(p * q)}, and the outer and inner products add to ${num(m * q)}x ${signed(p)}x = ${lin(coefficients[1], 0)}.`,
      principles: ["(mx + p)(x + q) = mx² + (mq + p)x + pq: the x-term comes from the outer and inner products."],
      hint: "Expand a choice in your head: does it give the x-term as well as the first and last terms?",
    };
    if (askFactor) {
      const offers = [
        [[m, q], `Pairs ${num(q)} with ${m}x; (${lin(m, q)})(${lin(1, p)}) has x-term ${lin(m * p + q, 0)}.`],
        [[1, -q], `Reverses the sign in ${lin(1, q)}: x = ${num(q)} does not make the expression 0.`],
        [[m, -p], `Reverses the sign in ${lin(m, p)}: x = ${ratio(p / m)} does not make the expression 0.`],
        [[1, p], `Drops the leading coefficient ${m} from ${lin(m, p)}.`],
      ].filter(([[mm, k]]) => !approx(original(-k / mm), 0));
      const key = t.chance(0.5) ? [m, p] : [1, q];
      return {
        ...common,
        stem: `Which of the following is a factor of ${expr}?`,
        correct: lin(key[0], key[1]),
        wrong: t.shuffle(offers).map(([[mm, k], why]) => [lin(mm, k), why]),
        steps: [
          `Look for (mx + p)(x + q) with m · 1 = ${m} and pq = ${num(p * q)} whose outer and inner products add to ${lin(coefficients[1], 0)}.`,
          `${bin(m, p)}${bin(1, q)} works: ${num(m * q)}x ${signed(p)}x = ${lin(coefficients[1], 0)}.`,
          `So ${lin(key[0], key[1])} is a factor.`,
        ],
        trap: `The constants must sit in the right factors: swapping ${num(p)} and ${num(q)} keeps the constant term but changes the x-term.`,
        verify: () => approx(original(-key[1] / key[0]), 0) && offers.every(([[mm, k]]) => !approx(original(-k / mm), 0)),
      };
    }
    const show = (pair) => pair.map(([mm, k]) => bin(mm, k)).join("");
    const key = [[m, p], [1, q]];
    const offers = [
      [[[m, q], [1, p]], `Pairs each constant with the other factor; this product has x-term ${lin(m * p + q, 0)}.`],
      [[[m, -p], [1, -q]], `Reverses both signs; this product is ${poly([m, -coefficients[1], p * q])}.`],
      [[[m, p], [1, -q]], `Gives ${num(q)} the wrong sign; this product is ${poly([m, p - m * q, -p * q])}.`],
      [[[m, -p], [1, q]], `Gives ${num(p)} the wrong sign; this product is ${poly([m, m * q - p, -p * q])}.`],
    ].filter(([pair]) => !agrees(value(pair), original));
    return {
      ...common,
      stem: `Which expression is equivalent to ${expr}?`,
      correct: show(key),
      wrong: t.shuffle(offers).map(([pair, why]) => [show(pair), why]),
      steps: [
        `The first terms multiply to ${m}x² and the constants to ${num(p * q)}.`,
        `The x-term is the sum of the outer and inner products: ${num(m)}(${num(q)})x + ${paren(p)}x = ${lin(coefficients[1], 0)}.`,
        `So ${expr} = ${show(key)}.`,
      ],
      trap: "Several products give the right first and last terms; only one gives the right x-term.",
      verify: () => agrees(value(key), original) && offers.every(([pair]) => !agrees(value(pair), original)),
    };
  }

  function squaresItem(t) {
    const a = t.int(2, 8);
    const b = t.int(1, 11);
    if (S.gcd(a, b) !== 1) return null;
    const expr = poly([a * a, 0, -b * b]);
    const original = (x) => a * a * x * x - b * b;
    const offers = [
      { text: `${bin(a, -b)}²`, fn: (x) => (a * x - b) ** 2, why: `Writes a perfect square; (${lin(a, -b)})² = ${poly([a * a, -2 * a * b, b * b])} has an x-term.` },
      { text: `${bin(a * a, -b)}${bin(a * a, b)}`, fn: (x) => (a * a * x - b) * (a * a * x + b), why: `Uses ${a * a} as the coefficient of x in each factor instead of its square root, ${a}.` },
      b > 1 && { text: `${bin(a, -b * b)}${bin(a, b * b)}`, fn: (x) => (a * x - b * b) * (a * x + b * b), why: `Uses ${b * b} in each factor instead of its square root, ${b}.` },
      { text: `${bin(a, b)}²`, fn: (x) => (a * x + b) ** 2, why: `Writes a perfect square; (${lin(a, b)})² = ${poly([a * a, 2 * a * b, b * b])} has an x-term.` },
    ].filter(Boolean);
    if (b > 1 && t.chance(0.6)) {
      // A 2 × 2 grid: the square root taken of the x² coefficient or not, and
      // of the constant or not; each choice shares one factor shape with two others.
      offers.splice(0, offers.length,
        offers[1], offers[2],
        { text: `${bin(a * a, -b * b)}${bin(a * a, b * b)}`, fn: (x) => (a * a * x - b * b) * (a * a * x + b * b), why: `Uses ${a * a} and ${b * b} in the factors instead of their square roots, ${a} and ${b}.` });
    }
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

  const ROOTS = { 2: "√", 3: "∛", 4: "∜", 5: "⁵√", 6: "⁶√" };

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
    const n = numeric ? t.pick([2, 4, 5]) : t.pick([2, 3, 4, 5, 6]);
    const m = coprimePower(t, n, 1, 3 * n - 1);
    let expr;
    let key;
    let offers;
    let explanation;
    let steps;
    let evaluate;
    let trap;
    if (kind === "product") {
      const k = t.int(1, 4);
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
      const j = numeric ? t.pick([2, 4, 5].filter((v) => v !== n)) : t.pick([2, 3, 4, 5].filter((v) => v !== n));
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
    } else if (kind === "nested") {
      // The root of a root: the indices multiply.
      const j = t.pick([2, 3].filter((v) => v !== n || v === 2));
      if (S.gcd(m, n * j) !== 1) return null;
      expr = `${ROOTS[j]}(${radical(n, m)})`;
      key = m / (n * j);
      offers = [
        [m / (n + j), `Adds the root indices ${n} and ${j} instead of multiplying them.`],
        [(m * j) / n, `Multiplies the exponent by ${j} instead of dividing by it.`],
        [(n * j) / m, `Writes the result with the root index and the power swapped, x^(${n * j}/${m}).`],
      ];
      explanation = `${radical(n, m)} = x^(${m}/${n}), and taking the ${j === 2 ? "square" : "cube"} root of that multiplies the exponent by 1/${j}: (${m}/${n}) · (1/${j}) = ${ratio(key)}.`;
      steps = [
        `Rewrite the inner root: ${radical(n, m)} = x^(${m}/${n}).`,
        `A ${j === 2 ? "square" : "cube"} root is the power 1/${j}: (x^(${m}/${n}))^(1/${j}).`,
        `Multiply the exponents: ${m}/${n} · 1/${j} = ${ratio(key)}, so the expression is ${xPow(key)}.`,
      ];
      evaluate = (x) => ((x ** m) ** (1 / n)) ** (1 / j);
      trap = "A root of a root multiplies the indices; adding them, or multiplying the exponent by the outer index, gives another choice.";
    } else if (kind === "reciprocal") {
      // 1 over a root: the exponent is negative.
      const k = t.int(1, 2);
      expr = k === 1 ? `1/(${radical(n, m)})` : `${pw("x", k)}/(${radical(n, m)})${sup(2)}`;
      key = k === 1 ? -m / n : k - (2 * m) / n;
      offers = k === 1
        ? [
          [m / n, "Drops the negative sign: dividing by a power of x makes the exponent negative."],
          [-n / m, `Writes the root with the index and the power swapped, x^(${MINUS}${n}/${m}).`],
          [1 - m / n, "Treats the 1 in the numerator as x¹ and subtracts the exponents."],
        ]
        : [
          [k - m / n, `Forgets to square the root in the denominator, subtracting ${ratio(m / n)} instead of ${ratio((2 * m) / n)}.`],
          [k + (2 * m) / n, "Adds the exponents instead of subtracting the denominator's exponent."],
          [(2 * m) / n - k, "Subtracts in the wrong order, the numerator's exponent from the denominator's."],
        ];
      explanation = k === 1
        ? `${radical(n, m)} = x^(${m}/${n}), and dividing by a power of x gives a negative exponent: 1/x^(${m}/${n}) = x^(${MINUS}${m}/${n}).`
        : `(${radical(n, m)})² = x^(${2 * m}/${n}), and dividing ${pw("x", k)} by it subtracts the exponents: ${k} ${MINUS} ${2 * m}/${n} = ${ratio(key)}.`;
      steps = k === 1
        ? [`Rewrite the root: ${radical(n, m)} = x^(${m}/${n}).`, `1/x^a = x^(${MINUS}a).`, `So the expression is ${xPow(key)}.`]
        : [
          `Rewrite the denominator: (${radical(n, m)})² = (x^(${m}/${n}))² = x^(${2 * m}/${n}).`,
          `Subtract exponents: ${k} ${MINUS} ${2 * m}/${n} = ${ratio(key)}.`,
          `So the expression is ${xPow(key)}.`,
        ];
      evaluate = k === 1 ? (x) => 1 / (x ** m) ** (1 / n) : (x) => x ** k / ((x ** m) ** (1 / n)) ** 2;
      trap = "Division by a root subtracts its exponent, which can leave a negative exponent.";
    } else {
      const k = t.int(Math.floor(m / n) + 1, Math.floor(m / n) + 3);
      expr = `${pw("x", k)}/(${radical(n, m)})`;
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
    // Half the multiple-choice items ask for the exponent itself, so the same
    // expression can appear with either kind of choice.
    const askExponent = t.chance(0.4);
    return {
      responseType: "multiple-choice",
      stimulus: askExponent ? { type: "equations", content: `${expr} = x^c` } : null,
      stem: askExponent
        ? "The given equation is true for all x > 0, where c is a constant. What is the value of c?"
        : `Which expression is equivalent to ${expr}, where x > 0?`,
      correct: askExponent ? ratio(key) : xPow(key),
      wrong: offers.map(([value, why]) => [askExponent ? ratio(value) : xPow(value), why]),
      explanation,
      steps,
      principles: ["The nth root of x^m is x^(m/n): the power is the numerator and the root index is the denominator."],
      trap,
      hint: "Write every root as a power of x first.",
      verify: check,
    };
  }

  // ⁿ√(x^a y^b): each exponent is divided by the index.
  function twoVariableRootItem(t) {
    const n = t.pick([2, 3, 4, 5]);
    const a = t.int(1, 3 * n - 1);
    const b = t.int(1, 3 * n - 1);
    if (a === b || (a % n === 0 && b % n === 0) || S.gcd(S.gcd(a, b), n) !== 1) return null;
    // A negative whole exponent is written x^(−3), never with a hyphen.
    const part = (name, value) => (isWhole(value) && value > 0 ? pw(name, value) : `${name}^(${ratio(value)})`);
    const show = ([u, v]) => `${part("x", u)}${part("y", v)}`;
    const key = [a / n, b / n];
    const offers = [
      [[a / n, b], `Takes the ${n === 2 ? "square" : n === 3 ? "cube" : `${n}th`} root of the x-factor only and leaves ${pw("y", b)} unchanged.`],
      [[n / a, n / b], "Writes each exponent with the root index and the power swapped."],
      [[a * n, b * n], `Multiplies each exponent by ${n} instead of dividing by ${n}.`],
      [[a - n, b - n], `Subtracts the index ${n} from each exponent instead of dividing.`],
    ].filter(([pair]) => !(approx(pair[0], key[0]) && approx(pair[1], key[1])) && pair.every((value) => value !== 0));
    const expr = `${ROOTS[n]}(${pw("x", a)}${pw("y", b)})`;
    const value = ([u, v], x, y) => x ** u * y ** v;
    const at = (x, y) => (x ** a * y ** b) ** (1 / n);
    const points = [[1.37, 0.62], [2.9, 1.8], [0.41, 2.2]];
    return {
      responseType: "multiple-choice",
      stimulus: null,
      stem: `Which expression is equivalent to ${expr}, where x > 0 and y > 0?`,
      correct: show(key),
      wrong: t.shuffle(offers).map(([pair, why]) => [show(pair), why]),
      explanation: `The ${n === 2 ? "square" : n === 3 ? "cube" : `${n}th`} root is the power 1/${n}, and it applies to every factor: (${pw("x", a)})^(1/${n}) = ${part("x", a / n)} and (${pw("y", b)})^(1/${n}) = ${part("y", b / n)}.`,
      steps: [
        `Write the root as a power: ${expr} = (${pw("x", a)}${pw("y", b)})^(1/${n}).`,
        `Raise each factor to the power 1/${n}: ${part("x", a / n)} and ${part("y", b / n)}.`,
        `So the expression is ${show(key)}.`,
      ],
      principles: ["(xy)^r = x^r y^r, and the nth root of x^m is x^(m/n)."],
      trap: "The root applies to every factor under it, and it divides each exponent by the index.",
      hint: "Write the root as a fractional power of the whole product.",
      verify: () => points.every(([x, y]) => approx(value(key, x, y), at(x, y), 1e-9)) &&
        offers.every(([pair]) => points.some(([x, y]) => !approx(value(pair, x, y), at(x, y), 1e-6))),
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
      // Never both one-value choices when both values are right, so the key is
      // not the union of two other choices; with a > b the union is offered
      // and is wrong.
      wrong: ordered
        ? [
          [pairText(k1, k2), `Lists both assignments of a and b, but a > b rules out a = ${num(b)}, b = ${num(a)}.`],
          [`${num(k2)} only`, `Takes a = ${num(b)} and b = ${num(a)}, the assignment that a > b rules out.`],
          ...t.shuffle([
            [`${num(slip1)} only`, slipReason],
            [`${num(m + n)} only`, "Adds the constants as if both leading coefficients were 1."],
          ]),
        ]
        : [
          ...t.shuffle([
            [`${num(k1)} only`, `Takes a = ${num(a)} and b = ${num(b)} and never tries the swapped assignment a = ${num(b)}, b = ${num(a)}.`],
            [`${num(k2)} only`, `Takes a = ${num(b)} and b = ${num(a)} and never tries the swapped assignment a = ${num(a)}, b = ${num(b)}.`],
          ]).slice(0, 1),
          [pairText(slip1, slip2), slipReason],
          ...t.shuffle([
            [pairText(k1, slip2), `Gets (a, b) = (${num(a)}, ${num(b)}) right but ${slipReason.charAt(0).toLowerCase()}${slipReason.slice(1, -1)} for the swapped assignment.`],
            [`${num(m + n)} only`, "Adds the constants as if both leading coefficients were 1."],
          ]),
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

  const power = (base, exponent) => {
    const shown = Math.abs(exponent) === 1 ? `${base}` : `${base}${S.sup(Math.abs(exponent))}`;
    return exponent < 0 ? `1/${shown}` : shown;
  };

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
      // A negative combination about a third of the time: the value is then a
      // reciprocal, which a student must write as a fraction.
      const c = t.int(2, 12) * (lambda === 0.5 ? 2 : 1) * (t.chance(0.35) ? -1 : 1);
      const E = lambda * c;
      if (Math.abs(E) < 2 || q ** Math.abs(E) > (E < 0 ? 999 : 99999)) continue;
      const plus = t.chance(0.4);
      const rearranged = !plus && t.chance(0.4);
      const B1 = q ** a1;
      const B2 = q ** a2;
      const target = plus ? `${B1}^x · ${B2}^y` : `${B1}^x/${B2}^y`;
      const given = plus
        ? `${lin(m, 0)} + ${n === 1 ? "" : n}y = ${num(c)}`
        : rearranged
          ? `${lin(m, 0)} = ${n === 1 ? "" : n}y ${signed(c)}`
          : `${lin(m, 0)} ${MINUS} ${n === 1 ? "" : n}y = ${num(c)}`;
      const expression = `${lin(m, 0)} ${plus ? "+" : MINUS} ${n === 1 ? "" : n}y`;
      const exponentText = `${lin(a1, 0)} ${plus ? "+" : MINUS} ${a2 === 1 ? "" : a2}y`;
      const wrongExps = [
        [power(q, c), `Uses ${num(c)} as the exponent directly; the exponent is ${exponentText}, which is ${lambda === 0.5 ? "half" : lambda === 2 ? "twice" : "three times"} ${expression}.`],
        [power(B1, E), `Finds the exponent ${num(E)} but keeps ${B1} as the base; the exponent ${num(E)} belongs to base ${q}.`],
        [power(B2, E), `Finds the exponent ${num(E)} but uses ${B2} as the base; the exponent ${num(E)} belongs to base ${q}.`],
      ];
      if (rearranged) wrongExps.splice(1, 0, [power(q, -E), `Rearranges the given equation with a sign slip, getting ${expression} = ${num(-c)}.`]);
      if (Number.isInteger(c / lambda) && c / lambda !== E && c / lambda !== c) {
        wrongExps.splice(1, 0, [power(q, c / lambda), `Scales ${num(c)} the wrong way, ${lambda === 0.5 ? "doubling it instead of halving it" : "dividing instead of multiplying"}.`]);
      }
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: given },
        stem: numeric
          ? `If x and y satisfy the given equation, what is the value of ${target}?`
          : `If x and y satisfy the given equation, which of the following is equal to ${target}?`,
        correct: numeric ? (E < 0 ? S.frac(1, q ** -E) : q ** E) : power(q, E),
        wrong: numeric ? undefined : wrongExps,
        explanation:
          `Write ${a2 === 1 ? `${B1} as a power of ${q}: ${B1} = ${q}${S.sup(a1)}` : `both bases as powers of ${q}: ${B1} = ${q}${S.sup(a1)} and ${B2} = ${q}${S.sup(a2)}`}, so ${target} = ${q}^(${exponentText}). ` +
          `${exponentText} = ${lambda === 0.5 ? "(1/2)" : lambda}(${expression}) = ${lambda === 0.5 ? "(1/2)" : lambda}(${num(c)}) = ${num(E)}, so the value is ${q}^(${num(E)}) = ${power(q, E)}${numeric ? ` = ${E < 0 ? S.frac(1, q ** -E) : q ** E}` : ""}.`,
        steps: [
          `Rewrite ${a2 === 1 ? "the first base" : "each base"} as a power of ${q}: ${B1} = ${q}${S.sup(a1)}${a2 === 1 ? "" : `, ${B2} = ${q}${S.sup(a2)}`}.`,
          `${plus ? "Multiplying adds" : "Dividing subtracts"} exponents: ${target} = ${q}^(${exponentText}).`,
          `Compare with the given equation: ${exponentText} = ${lambda === 0.5 ? "(1/2)" : lambda}(${expression}) = ${num(E)}.`,
          `So the value is ${q}^(${num(E)}) = ${power(q, E)}${numeric ? ` = ${E < 0 ? S.frac(1, q ** -E) : q ** E}` : ""}.`,
        ],
        principles: ["(b^m)^x = b^(mx), and b^u/b^v = b^(u − v).", "When x and y cannot be found separately, look for the given combination inside the target."],
        trap: numeric
          ? `Using the given ${num(c)} as the exponent gives ${power(q, c)}; the exponent is ${lambda === 0.5 ? "half" : lambda === 2 ? "twice" : "three times"} the given combination.`
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

  // x ± 1/x = k: the target is a power sum that the square or the cube of the
  // given expression contains. (Finding x² + y² or (x − y)² from a given sum
  // and product was Medium work and was dropped.)
  function substitutionReciprocal(t, numeric) {
    const kind = t.pick(["square", "square", "cube"]);
    // The given equation is x ± 1/x = k itself, or a quadratic that is that
    // equation multiplied by x, which hides the structure one step deeper.
    const shape = t.pick(["reciprocal", "product", "quadratic"]);
    const givenFor = (minus, k) => ({
      reciprocal: `x ${minus ? MINUS : "+"} 1/x = ${k}`,
      product: `x² ${minus ? MINUS : "+"} 1 = ${lin(k, 0)}`,
      quadratic: `x² ${MINUS} ${lin(k, 0)} ${minus ? MINUS : "+"} 1 = 0`,
    }[shape]);
    const unhide = (minus, k) => (shape === "reciprocal"
      ? []
      : [`x = 0 does not satisfy the equation, so divide ${shape === "product" ? "both sides" : "every term"} by x: x ${minus ? MINUS : "+"} 1/x = ${k}.`]);
    if (kind === "square") {
      // x + 1/x = k (or x − 1/x = k): x² + 1/x² = k² ∓ 2.
      const minus = t.chance(0.4);
      const k = t.int(minus ? 1 : 3, 12);
      const key = minus ? k * k + 2 : k * k - 2;
      const given = givenFor(minus, k);
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: given },
        stem: "If x satisfies the given equation, what is the value of x² + 1/x²?",
        correct: key,
        wrong: [
          [k * k, `Squares each term of x ${minus ? MINUS : "+"} 1/x separately and forgets the cross term 2 · x · (1/x) = 2.`],
          [minus ? k * k - 2 : k * k + 2, `Expands (x ${minus ? MINUS : "+"} 1/x)² correctly but then ${minus ? "subtracts" : "adds"} the 2 instead of ${minus ? "adding" : "subtracting"} it when isolating x² + 1/x².`],
          [minus ? k * k + 1 : k * k - 1, "Uses x · (1/x) = 1 as the cross term, forgetting the factor of 2 in 2ab."],
        ],
        explanation:
          `${unhide(minus, k).join(" ")}${shape === "reciprocal" ? "" : " "}Square x ${minus ? MINUS : "+"} 1/x = ${k}: (x ${minus ? MINUS : "+"} 1/x)² = x² ${minus ? MINUS : "+"} 2 + 1/x² = ${k * k}. ` +
          `So x² + 1/x² = ${k * k} ${minus ? "+" : MINUS} 2 = ${key}.`,
        steps: [
          ...unhide(minus, k),
          `Recognize x² + 1/x² inside the square of x ${minus ? MINUS : "+"} 1/x.`,
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
    // x + 1/x = k: (x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x), so x³ + 1/x³ = k³ − 3k.
    const k = t.int(3, 9);
    const key = k ** 3 - 3 * k;
    const given = givenFor(false, k);
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: given },
      stem: "If x satisfies the given equation, what is the value of x³ + 1/x³?",
      correct: key,
      wrong: t.shuffle([
        [k ** 3, "Cubes each term of x + 1/x separately and drops the middle terms 3x + 3/x."],
        [k ** 3 - 3, "Treats the middle terms of the cube, 3x + 3/x, as the number 3 instead of 3(x + 1/x)."],
        [k ** 3 - 2 * k, `Multiplies x² + 1/x² = ${k * k - 2} by x + 1/x = ${k} but forgets that the product also contains x + 1/x.`],
        [k ** 3 + 3 * k, "Adds 3(x + 1/x) instead of subtracting it when isolating x³ + 1/x³."],
      ]),
      explanation:
        `${unhide(false, k).join(" ")}${shape === "reciprocal" ? "" : " "}Cube x + 1/x = ${k}: (x + 1/x)³ = x³ + 3x + 3/x + 1/x³ = x³ + 1/x³ + 3(x + 1/x). ` +
        `So ${k ** 3} = x³ + 1/x³ + 3(${k}), and x³ + 1/x³ = ${k ** 3} ${MINUS} ${3 * k} = ${key}.`,
      steps: [
        ...unhide(false, k),
        "Recognize x³ + 1/x³ inside the cube of x + 1/x.",
        "Expand: (x + 1/x)³ = x³ + 3x²(1/x) + 3x(1/x²) + 1/x³ = x³ + 1/x³ + 3(x + 1/x).",
        `Substitute x + 1/x = ${k}: ${k ** 3} = x³ + 1/x³ + ${3 * k}.`,
        `x³ + 1/x³ = ${key}.`,
      ],
      principles: ["(a + b)³ = a³ + b³ + 3ab(a + b), and here ab = x · (1/x) = 1."],
      trap: `Cubing term by term drops the middle terms and gives ${k ** 3}; those terms are 3 times the given sum.`,
      hint: "What happens when both sides are cubed?",
      verify: () => {
        const roots = quadraticRoots(-k, 1);
        return roots.length === 2 && roots.every((x) => approx(x ** 3 + 1 / x ** 3, key, 1e-9));
      },
    };
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

  /* ================================================= quadratic-structure-form */

  // Equivalent forms of f(x) = a(x − r)(x − s). Each form carries its own
  // function, built from its own constants, so equivalence is checked by
  // evaluating, not assumed.
  function quadraticForms(a, r, s) {
    const h = (r + s) / 2;
    const k = -a * ((s - r) / 2) ** 2;
    const B = -a * (r + s);
    const c = a * r * s;
    const vertexText = (hh, kk, aa = a) => `${lead(aa)}(${lin(1, -hh)})² ${signed(kk)}`;
    return {
      h, k, B, c,
      standard: { type: "standard", text: poly([a, B, c]), fn: (x) => a * x * x + B * x + c },
      factored: { type: "factored", text: `${lead(a)}${rootFactor(r)}${rootFactor(s)}`, fn: (x) => a * (x - r) * (x - s) },
      vertex: { type: "vertex", text: vertexText(h, k), fn: (x) => a * (x - h) ** 2 + k },
      partialX: { type: "partial", text: `x(${lin(a, B)}) ${signed(c)}`, fn: (x) => x * (a * x + B) + c },
      partialA: { type: "partial", text: `${lead(a)}(${poly([1, -(r + s), 0])}) ${signed(c)}`, fn: (x) => a * (x * x - (r + s) * x) + c },
      vertexText,
    };
  }

  function quadraticStructure(t) {
    const a = t.pick([1, 1, 2, 3, -1, -2]);
    const r = t.nonzero(-7, 6);
    const s = r + 2 * t.int(1, 5);
    if (s === 0 || r + s === 0) return null;
    const F = quadraticForms(a, r, s);
    if (Math.abs(F.c) > 90 || Math.abs(F.k) > 90) return null;
    const ask = t.pick(["zeros", "extreme"]);
    const word = a > 0 ? "minimum" : "maximum";
    const feature = ask === "zeros"
      ? "the x-intercepts of the graph of y = f(x) in the xy-plane"
      : `the ${word} value of f`;
    const wantType = ask === "zeros" ? "factored" : "vertex";
    const given = ask === "zeros" ? t.pick([F.standard, F.standard, F.vertex]) : t.pick([F.standard, F.standard, F.factored]);
    const key = ask === "zeros" ? F.factored : F.vertex;
    const allEquivalent = t.chance(0.4);
    const shows = {
      standard: `shows the y-intercept, ${num(F.c)}, not ${feature}`,
      factored: `shows the zeros ${num(r)} and ${num(s)}, not the ${word} value`,
      vertex: `shows the vertex (${num(F.h)}, ${num(F.k)}), not the x-intercepts`,
      partial: `shows only the constant term ${num(F.c)}, which is the y-intercept, not ${feature}`,
    };
    let offers;
    if (allEquivalent) {
      offers = [F.standard, F.factored, F.vertex, F.partialX, ...(a === 1 ? [] : [F.partialA])]
        .filter((form) => form !== key && form.text !== given.text)
        .map((form) => [form, `Is equivalent to f(x), but it ${shows[form.type]}.`]);
      offers = t.shuffle(offers).slice(0, 3);
    } else {
      // Every sign slip on the key is one change from it, so the key's
      // look-alikes come with twins of their own: a draw shows the key's
      // twins with a twin pair of distractors (all paired), the key's twin
      // with two unpaired forms, or a distractor pair and no key twin.
      const flipped = (form, why) => [{ type: form.type, text: form.flip, fn: (x) => form.fn(-x) }, why];
      const other = [F.standard, F.factored, F.vertex].find((form) => form !== key && form.text !== given.text);
      const flips = {
        standard: poly([a, -F.B, F.c]),
        factored: `${lead(a)}${rootFactor(-r)}${rootFactor(-s)}`,
        vertex: F.vertexText(-F.h, F.k),
      };
      const equivalent = [other, `Is equivalent to f(x), but it ${shows[other.type]}.`];
      const otherFlip = flipped({ ...other, flip: flips[other.type] },
        `Reverses the sign of every x, so it describes f(${MINUS}x) and is not equivalent to f(x).`);
      const partial = [F.partialX, `Is equivalent to f(x), but it ${shows.partial}.`];
      let keyTwins;
      let pairSlips;
      if (ask === "zeros") {
        keyTwins = [[{ type: "factored", text: flips.factored, fn: (x) => a * (x + r) * (x + s) },
          `Writes the factors with the signs of the zeros; ${flips.factored} is zero at x = ${num(-r)} and x = ${num(-s)}, so it is not equivalent to f(x).`]];
        // Two numbers with the right sum and the wrong product, and their sign slip.
        const q = t.pick([r - 1, r + 1].filter((v) => v !== 0 && v !== s && r + s - v !== 0 && v !== r + s - v));
        if (q === undefined) return null;
        const q2 = r + s - q;
        pairSlips = [
          [{ type: "factored", text: `${lead(a)}${rootFactor(q)}${rootFactor(q2)}`, fn: (x) => a * (x - q) * (x - q2) },
            `Uses two numbers that add to ${num(r + s)} but multiply to ${num(q * q2)}, not ${num(r * s)}; it is not equivalent to f(x).`],
          [{ type: "factored", text: `${lead(a)}${rootFactor(-q)}${rootFactor(-q2)}`, fn: (x) => a * (x + q) * (x + q2) },
            `Uses two numbers that multiply to ${num(q * q2)} instead of ${num(r * s)}, and writes the factors with their signs; it is not equivalent to f(x).`],
        ];
      } else {
        keyTwins = [
          [{ type: "vertex", text: flips.vertex, fn: (x) => a * (x + F.h) ** 2 + F.k },
            `Shows ${num(F.k)} as the ${word} but puts the vertex at x = ${num(-F.h)}; it is not equivalent to f(x).`],
          [{ type: "vertex", text: F.vertexText(F.h, -F.k), fn: (x) => a * (x - F.h) ** 2 - F.k },
            `Adds ${num(Math.abs(a * F.h * F.h))} where completing the square subtracts it, so the constant has the wrong sign; it is not equivalent to f(x).`],
        ];
        pairSlips = [
          [{ type: "vertex", text: F.vertexText(-F.h, -F.k), fn: (x) => a * (x + F.h) ** 2 - F.k },
            "Makes two slips: it puts the vertex on the wrong side of the y-axis and gives the constant the wrong sign; it is not equivalent to f(x)."],
        ];
      }
      const sets = ask === "zeros"
        ? [[keyTwins[0], ...pairSlips], [equivalent, ...pairSlips], [keyTwins[0], equivalent, partial], [equivalent, otherFlip, partial]]
        : [[...keyTwins, ...pairSlips], [keyTwins[0], equivalent, partial], [keyTwins[1], equivalent, partial], [equivalent, otherFlip, partial], [equivalent, otherFlip, partial]];
      offers = t.shuffle(t.pick(sets));
    }
    const samples = [-3.7, -1.2, 0.6, 2.3, 5.9];
    const same = (f, g) => samples.every((x) => approx(f(x), g(x), 1e-9));
    const zerosText = `x = ${num(r)} and x = ${num(s)}`;
    const route = ask === "zeros"
      ? `f(x) = 0 at ${zerosText}, so f(x) = ${F.factored.text}; each zero appears in a factor.`
      : `The zeros are ${num(r)} and ${num(s)}, so the vertex is at x = ${num(F.h)} and the ${word} value is f(${num(F.h)}) = ${num(F.k)}: f(x) = ${F.vertex.text}.`;
    return {
      responseType: "multiple-choice",
      stimulus: null,
      stem:
        `The function f is defined by f(x) = ${given.text}. Which of the following is equivalent to f(x) and displays ` +
        `${feature} as ${ask === "zeros" ? "constants or coefficients" : "a constant or coefficient"}?`,
      correct: key.text,
      wrong: offers.map(([form, why]) => [form.text, why]),
      explanation:
        `${ask === "zeros" ? "A factored form a(x − r)(x − s) shows the zeros r and s" : `A vertex form a(x − h)² + k shows the ${word} value k`}. ${route}`,
      steps: [
        ask === "zeros" ? "The form that shows x-intercepts is the factored form a(x − r)(x − s)." : `The form that shows the ${word} value is the vertex form a(x − h)² + k.`,
        `From f(x) = ${given.text}: the zeros are ${num(r)} and ${num(s)}${ask === "zeros" ? "" : `, halfway between them is x = ${num(F.h)}`}.`,
        ask === "zeros" ? `So f(x) = ${F.factored.text}.` : `f(${num(F.h)}) = ${num(F.k)}, so f(x) = ${F.vertex.text}.`,
        "Check that the chosen form matches f(x) at any input; a form can show the right kind of number and still not be equivalent.",
      ],
      principles: [
        "Factored form shows the zeros, vertex form shows the vertex and the extreme value, and standard form shows the y-intercept.",
        "An equivalent form must agree with f(x) for every x.",
      ],
      trap: allEquivalent
        ? "Every choice is equivalent; the question is which one displays the asked feature as a number in the expression."
        : "A form of the right shape can still be wrong: check that it is equivalent to f(x).",
      hint: `Which kind of form puts ${ask === "zeros" ? "the x-intercepts" : `the ${word} value`} in plain sight? Then check it against f(x).`,
      verify: () => {
        const [A, Bq, Cq] = sampleQuadratic(given.fn);
        const zeros = realRoots(A, Bq, Cq);
        const vx = -Bq / (2 * A);
        const extreme = A * vx * vx + Bq * vx + Cq;
        const keyOk = same(key.fn, given.fn) && (ask === "zeros"
          ? zeros.length === 2 && approx(Math.min(...zeros), r) && approx(Math.max(...zeros), s)
          : approx(vx, F.h) && approx(extreme, F.k));
        return keyOk && offers.every(([form]) => !same(form.fn, given.fn) || form.type !== wantType);
      },
    };
  }

  /* ============================================ nonlinear-formula-rearrange */

  // Formula shapes solved for one letter. Each shape draws a numeric constant
  // k and a scene (letters and context), and returns the display text, the
  // formula as a function, the key, and modelled wrong rearrangements, each
  // with a function of the other letters so verify() can test it against the
  // formula itself. Scenes are invented, not quoted.
  const FORMULA_SHAPES = [
    // out = k·A·B², solved for B (B > 0).
    (t) => {
      const scene = t.pick([
        { out: "d", A: "a", B: "t", text: "In a model of a cart rolling down a ramp, the distance d, in centimeters, traveled in t seconds depends on a constant a set by the ramp's angle." },
        { out: "E", A: "m", B: "v", text: "An engineer estimates the energy E stored in a spinning wheel of mass m turning at speed v." },
        { out: "L", A: "w", B: "s", text: "A designer estimates the load L a shelf of width w can hold when its supports are s centimeters thick." },
      ]);
      const k = t.pick([2, 3, 4, 5, 6, 8, 10]);
      const halves = t.chance(0.4);
      const { out, A, B } = scene;
      const c = halves ? 1 / k : k;
      return {
        scene, target: B, others: [out, A],
        formula: halves ? `${out} = (${A}${B}²)/${k}` : `${out} = ${k}${A}${B}²`,
        forward: (v) => c * v[A] * v[B] ** 2,
        key: [halves ? `√(${k}${out}/${A})` : `√(${out}/(${k}${A}))`, (v) => Math.sqrt(v[out] / (c * v[A]))],
        offers: [
          [halves ? `${k}${out}/${A}` : `${out}/(${k}${A})`, (v) => v[out] / (c * v[A]), `Solves for ${B}² and stops before taking the square root.`],
          [halves ? `√(${out}/(${k}${A}))` : `√(${k}${out}/${A})`, (v) => Math.sqrt(v[out] / (v[A] / c)),
            halves ? `Divides by ${k} instead of multiplying by ${k} to clear the fraction.` : `Multiplies by ${k} instead of dividing by ${k}.`],
          [halves ? `√(${k}${out})/${A}` : `√(${out}/${k})/${A}`, (v) => Math.sqrt(v[out] / c) / v[A], `Takes the square root before dividing by ${A}, so ${A} is left outside the root.`],
          [halves ? `${k}${out}/(2${A})` : `${out}/(${2 * k}${A})`, (v) => v[out] / (2 * c * v[A]), `Undoes the square by dividing by 2 instead of taking a square root.`],
        ],
        undo: `Divide by the constant factors first, then take the square root, since ${B} > 0.`,
      };
    },
    // out = k√(A·B), solved for A.
    (t) => {
      const scene = t.pick([
        { out: "v", A: "h", B: "g", text: "The speed v of water leaving a tank through a small hole at depth h is modeled by the formula below, where g is a constant." },
        { out: "r", A: "A", B: "n", text: "A botanist models the radius r of a flower bed that holds n plants, each needing area A, with the formula below." },
        { out: "T", A: "L", B: "c", text: "A lab models the time T for a signal to cross a cable of length L with the formula below, where c is a constant for the cable." },
      ]);
      const k = t.pick([2, 3, 4, 5, 6]);
      const swap = t.chance(0.5);
      const { out } = scene;
      // Solve for either letter under the root; the other stays a constant.
      const [A, B] = swap ? [scene.B, scene.A] : [scene.A, scene.B];
      return {
        scene, target: A, others: [out, B],
        formula: `${out} = ${k}√(${scene.A}${scene.B})`,
        forward: (v) => k * Math.sqrt(v[A] * v[B]),
        key: [`${out}²/(${k * k}${B})`, (v) => v[out] ** 2 / (k * k * v[B])],
        offers: [
          [`${out}²/(${k}${B})`, (v) => v[out] ** 2 / (k * v[B]), `Squares ${out} but not the ${k} in front of the root.`],
          [`${out}/(${k}${B})`, (v) => v[out] / (k * v[B]), "Divides but never squares to remove the square root."],
          [`${B}(${out}/${k})²`, (v) => v[B] * (v[out] / k) ** 2, `Multiplies by ${B} instead of dividing by it after squaring.`],
          [`√(${out}/(${k}${B}))`, (v) => Math.sqrt(v[out] / (k * v[B])), "Takes another square root instead of squaring to undo the root."],
        ],
        undo: "Divide by the constant, then square both sides to remove the root.",
      };
    },
    // out = kP/d², solved for d (d > 0).
    (t) => {
      const scene = t.pick([
        { out: "I", A: "P", B: "d", text: "The brightness I of light from a lamp of power P, measured d meters away, is modeled by the formula below." },
        { out: "F", A: "q", B: "r", text: "A physics class models the force F between two charged spheres a distance r apart, where q depends on the charges." },
        { out: "S", A: "W", B: "x", text: "A sound engineer models the loudness S at a distance x from a speaker of power W with the formula below." },
      ]);
      const k = t.pick([2, 3, 4, 5, 6, 8, 10]);
      const { out, A, B } = scene;
      return {
        scene, target: B, others: [out, A],
        formula: `${out} = (${k}${A})/${B}²`,
        forward: (v) => (k * v[A]) / v[B] ** 2,
        key: [`√((${k}${A})/${out})`, (v) => Math.sqrt((k * v[A]) / v[out])],
        offers: [
          [`(${k}${A})/${out}`, (v) => (k * v[A]) / v[out], `Solves for ${B}² and stops before taking the square root.`],
          [`√(${out}/(${k}${A}))`, (v) => Math.sqrt(v[out] / (k * v[A])), `Inverts the fraction under the root, which gives 1/${B}.`],
          [`√(${k}${A}${out})`, (v) => Math.sqrt(k * v[A] * v[out]), `Multiplies by ${out} instead of dividing by it.`],
          [`√(${A}/(${k}${out}))`, (v) => Math.sqrt(v[A] / (k * v[out])), `Divides by ${k} instead of multiplying by it.`],
        ],
        undo: `Multiply both sides by ${B}², divide by ${out}, then take the square root, since ${B} > 0.`,
      };
    },
    // 1/out = k/A + 1/B, solved for B.
    (t) => {
      const scene = t.pick([
        { out: "R", A: "a", B: "b", text: "Two resistors are connected side by side. Their combined resistance R, in ohms, satisfies the equation below, where a and b are the two resistances in ohms." },
        { out: "f", A: "p", B: "q", text: "For a lens, the focal length f, the object distance p, and the image distance q satisfy the equation below." },
        { out: "T", A: "m", B: "n", text: "Two pumps working together fill a tank in T hours. Their separate filling times m and n, in hours, satisfy the equation below." },
      ]);
      const k = t.pick([1, 1, 2, 3, 4]);
      const { out, A, B } = scene;
      const kA = `${k === 1 ? "" : k}${out}`;
      const scaledA = k === 1 ? A : `(${A}/${k})`;
      return {
        scene, target: B, others: [out, A],
        formula: `1/${out} = ${k}/${A} + 1/${B}`,
        forward: (v) => 1 / (k / v[A] + 1 / v[B]),
        key: [`(${A}${out})/(${A} − ${kA})`, (v) => (v[A] * v[out]) / (v[A] - k * v[out])],
        offers: [
          [`(${A}${out})/(${kA} − ${A})`, (v) => (v[A] * v[out]) / (k * v[out] - v[A]), `Subtracts in the wrong order when combining 1/${out} ${MINUS} ${k}/${A} over a common denominator.`],
          [`(${A} − ${kA})/(${A}${out})`, (v) => (v[A] - k * v[out]) / (v[A] * v[out]), `Finds 1/${B} and stops before taking the reciprocal.`],
          [`${out} − ${scaledA}`, (v) => v[out] - v[A] / k, `Takes reciprocals term by term, as if 1/${B} = 1/${out} ${MINUS} ${k}/${A} meant ${B} = ${out} ${MINUS} ${scaledA}.`],
          [`(${A}${out})/(${A} + ${kA})`, (v) => (v[A] * v[out]) / (v[A] + k * v[out]), `Adds ${k}/${A} instead of subtracting it when isolating 1/${B}.`],
        ],
        undo: `Isolate 1/${B}, combine the fractions over one denominator, then take the reciprocal of both sides.`,
      };
    },
    // out = k√(A/B), solved for A.
    (t) => {
      const scene = t.pick([
        { out: "T", A: "L", B: "g", text: "The time T, in seconds, for one swing of a pendulum of length L is modeled by the formula below, where g is a constant." },
        { out: "v", A: "F", B: "m", text: "The speed v of a wave along a rope under tension F is modeled by the formula below, where m depends on the rope." },
        { out: "t", A: "h", B: "a", text: "The time t for a ball to roll down a ramp of height h is modeled by the formula below, where a depends on the ramp." },
      ]);
      const k = t.pick([2, 3, 4, 5, 6]);
      const { out, A, B } = scene;
      if (t.chance(0.4)) {
        // Solve for the letter in the denominator under the root.
        return {
          scene, target: B, others: [out, A],
          formula: `${out} = ${k}√(${A}/${B})`,
          forward: (v) => k * Math.sqrt(v[A] / v[B]),
          key: [`(${k * k}${A})/${out}²`, (v) => (k * k * v[A]) / v[out] ** 2],
          offers: [
            [`${out}²/(${k * k}${A})`, (v) => v[out] ** 2 / (k * k * v[A]), `Solves for 1/${B} and stops before taking the reciprocal.`],
            [`(${k}${A})/${out}²`, (v) => (k * v[A]) / v[out] ** 2, `Squares ${out} but not the ${k}.`],
            [`(${k * k}${A})/${out}`, (v) => (k * k * v[A]) / v[out], "Squares the constant but not the other side, so the root is not fully removed."],
            [`√((${k}${A})/${out})`, (v) => Math.sqrt((k * v[A]) / v[out]), "Takes a square root instead of squaring to undo the root."],
          ],
          undo: `Divide by ${k}, square both sides, then solve for ${B} by taking reciprocals.`,
        };
      }
      return {
        scene, target: A, others: [out, B],
        formula: `${out} = ${k}√(${A}/${B})`,
        forward: (v) => k * Math.sqrt(v[A] / v[B]),
        key: [`(${B}${out}²)/${k * k}`, (v) => (v[B] * v[out] ** 2) / (k * k)],
        offers: [
          [`(${B}${out}²)/${k}`, (v) => (v[B] * v[out] ** 2) / k, `Squares ${out} but not the ${k}.`],
          [`(${B}${out})/${k}`, (v) => (v[B] * v[out]) / k, "Never squares to remove the square root."],
          [`${out}²/(${k * k}${B})`, (v) => v[out] ** 2 / (k * k * v[B]), `Divides by ${B} instead of multiplying by it.`],
          [`((${B}${out})/${k})²`, (v) => ((v[B] * v[out]) / k) ** 2, `Multiplies by ${B} before squaring, so ${B} ends up squared.`],
        ],
        undo: `Divide by ${k}, square both sides, then multiply by ${B}.`,
      };
    },
  ];

  const listLetters = (letters) => letters.length === 2
    ? `${letters[0]} and ${letters[1]}`
    : `${letters.slice(0, -1).join(", ")}, and ${letters[letters.length - 1]}`;

  function formulaItem(t) {
    const F = t.pick(FORMULA_SHAPES)(t);
    const offers = t.sample(F.offers, 3);
    const letters = [F.target, ...F.others];
    // Two sets of positive inputs, chosen so every denominator stays away from 0.
    const trials = [[1.7, 3.2, 0.55, 2.4], [4.3, 0.9, 2.6, 1.15]].map((values) => {
      const assignment = {};
      letters.forEach((letter, index) => (assignment[letter] = values[index]));
      return assignment;
    });
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: F.formula },
      stem: `${F.scene.text} Which of the following correctly expresses ${F.target} in terms of ${listLetters(F.others)}?`,
      correct: F.key[0],
      wrong: offers.map(([text, , why]) => [text, why]),
      explanation: `${F.undo} This gives ${F.target} = ${F.key[0]}.`,
      steps: [
        "Treat every letter except the one wanted as a constant.",
        F.undo,
        `${F.target} = ${F.key[0]}.`,
      ],
      principles: [
        "Solving a formula for a letter undoes its operations in reverse order, applying each step to the whole of both sides.",
        "A square root is undone by squaring, and a square by taking the square root; a sum of reciprocals is not the reciprocal of a sum.",
      ],
      trap: "Each wrong choice undoes one operation incorrectly, or stops one step early.",
      hint: `What was done to ${F.target} last? Undo that first.`,
      verify: () => trials.every((values) => {
        const known = { ...values };
        known[F.scene.out] = F.forward(values);
        const truth = values[F.target];
        if (!Number.isFinite(known[F.scene.out])) return false;
        return approx(F.key[1](known), truth, 1e-9) && offers.every(([, fn]) => !approx(fn(known), truth, 1e-6));
      }),
    };
  }

  // Power-law formulas for the "how many times" form, moved here from the
  // Algebra rearranging template: vars gives each input's exponent.
  const POWER_SCENES = [
    {
      out: "L", K: [0.6, 0.8, 1.2, 1.5], formula: (K) => `L = (${num(K)}wd²)/s`, vars: { w: 1, d: 2, s: -1 },
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
      out: "I", K: [8, 12, 15, 20], formula: (K) => `I = (${num(K)}P)/d²`, vars: { P: 1, d: -2 },
      names: { P: "power", d: "distance from the lamp" }, outName: "light intensity",
      text: "The given formula models the light intensity I, in lux, at a point d meters from a lamp whose power is P watts.",
    },
    {
      out: "Q", K: [0.4, 0.8, 2.5], formula: (K) => `Q = (${num(K)}r⁴p)/L`, vars: { r: 4, p: 1, L: -1 },
      names: { r: "radius", p: "pressure difference", L: "length" }, outName: "flow rate",
      text: "The given formula models the rate Q at which a liquid flows through a narrow pipe, where r is the " +
        "pipe's radius, p is the pressure difference between its ends, and L is its length.",
    },
    {
      out: "V", K: [2, 3, 4], formula: (K) => `V = ${num(K)}r²h`, vars: { r: 2, h: 1 },
      names: { r: "radius", h: "height" }, outName: "volume",
      text: "The given formula gives the volume V of a storage tank with radius r and height h, both in meters.",
    },
  ];

  const CHANGES = [
    { factor: 2, word: "doubled", gerund: "Doubling" },
    { factor: 3, word: "tripled", gerund: "Tripling" },
    { factor: 0.5, word: "halved", gerund: "Halving" },
  ];

  // How many times the output changes when two inputs of a power law are scaled.
  function formulaScalingItem(t, numericWanted) {
    const scene = t.pick(POWER_SCENES);
    const K = t.pick(scene.K);
    const letters = Object.keys(scene.vars);
    const [first, second] = t.sample(letters, 2);
    const [c1, c2] = [t.pick(CHANGES), t.pick(CHANGES)];
    const e1 = scene.vars[first];
    const e2 = scene.vars[second];
    const effect1 = c1.factor ** e1;
    const effect2 = c2.factor ** e2;
    const key = effect1 * effect2;
    if (approx(key, 1)) return null;
    const flat = (e) => Math.sign(e);
    const candidates = [];
    if (Math.abs(e1) > 1 || Math.abs(e2) > 1) {
      candidates.push([c1.factor ** flat(e1) * c2.factor ** flat(e2), "Ignores the exponent, treating every input as if it appeared to the first power."]);
    }
    if (e1 < 0 || e2 < 0) {
      candidates.push([c1.factor ** Math.abs(e1) * c2.factor ** Math.abs(e2),
        `Treats ${e1 < 0 ? first : second}, which is in the denominator, as if it were in the numerator.`]);
    }
    candidates.push([effect1, `Applies only the change to the ${scene.names[first]}.`]);
    candidates.push([effect2, `Applies only the change to the ${scene.names[second]}.`]);
    candidates.push([effect1 + effect2, "Adds the two effects instead of multiplying them."]);
    const numeric = numericWanted && gridable(key);
    const rest = letters.filter((letter) => letter !== first && letter !== second);
    const formula = scene.formula(K);
    const describe = (letter, change, exponent, effect) => {
      const detail = [];
      if (Math.abs(exponent) === 2) detail.push("squared");
      else if (Math.abs(exponent) > 2) detail.push(`raised to the power ${Math.abs(exponent)}`);
      if (exponent < 0) detail.push("in the denominator");
      return `${change.gerund} ${letter}${detail.length ? `, which is ${detail.join(" and ")},` : ""} multiplies ${scene.out} by ${ratio(effect)}.`;
    };
    const forward = (values) => letters.reduce((product, letter) => product * values[letter] ** scene.vars[letter], K);
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content: formula },
      stem:
        `${scene.text} If the ${scene.names[first]} is ${c1.word} and the ${scene.names[second]} is ${c2.word}` +
        `${rest.length ? `, while the ${scene.names[rest[0]]} stays the same` : ""}, the new ${scene.outName} ` +
        `is how many times the original ${scene.outName}?`,
      correct: numeric ? key : ratio(key),
      wrong: t.shuffle(candidates).map(([value, reason]) => [ratio(value), reason]),
      explanation:
        `${describe(first, c1, e1, effect1)} ${describe(second, c2, e2, effect2)} The effects multiply: ` +
        `${ratio(effect1)} × ${ratio(effect2)} = ${ratio(key)}.`,
      steps: [
        describe(first, c1, e1, effect1),
        describe(second, c2, e2, effect2),
        `Multiply the effects: ${ratio(effect1)} × ${ratio(effect2)} = ${ratio(key)}.`,
      ],
      principles: [
        "Scaling an input that appears as xⁿ scales the output by the factor raised to the n.",
        "Scaling an input in the denominator by c scales the output by 1/c (to the matching power).",
      ],
      trap: "Doubling one input and halving another cancel only when they enter the formula the same way; powers and denominators change that.",
      hint: "Follow each change through the formula separately, then combine them.",
      verify: () => {
        // Evaluate the formula before and after the change at arbitrary inputs.
        const base = {};
        letters.forEach((letter, index) => (base[letter] = 1.3 + 0.7 * index));
        const changed = { ...base, [first]: base[first] * c1.factor };
        changed[second] *= c2.factor;
        return approx(forward(changed) / forward(base), key, 1e-9) &&
          candidates.every(([value]) => !approx(value, key, 1e-9));
      },
    };
  }

  /* ================================================ common-base-exponent */

  // Bases written as powers of 2, 3, or 5 (a negative power is a reciprocal).
  const BASES = [
    { b: 2, u: 2, text: "4" }, { b: 2, u: 3, text: "8" }, { b: 2, u: 4, text: "16" }, { b: 2, u: 5, text: "32" },
    { b: 2, u: -1, text: "(1/2)" }, { b: 2, u: -2, text: "(1/4)" }, { b: 2, u: -3, text: "(1/8)" }, { b: 2, u: 1, text: "2" },
    { b: 3, u: 2, text: "9" }, { b: 3, u: 3, text: "27" }, { b: 3, u: -1, text: "(1/3)" }, { b: 3, u: -2, text: "(1/9)" }, { b: 3, u: 1, text: "3" },
    { b: 5, u: 2, text: "25" }, { b: 5, u: 3, text: "125" }, { b: 5, u: -1, text: "(1/5)" }, { b: 5, u: 1, text: "5" },
  ];

  // "(3x − 2)" as an exponent; a bare "x" stays as it is.
  const exponentText = (p, q) => (q === 0 && p === 1 ? "x" : `(${lin(p, q)})`);

  function commonBaseItem(t, numeric) {
    const b = t.pick([2, 3, 5]);
    const pool = BASES.filter((entry) => entry.b === b);
    const [L, Rb] = t.sample(pool, 2);
    if (L.u === 1 && Rb.u === 1) return null;
    const p = t.nonzero(-3, 4);
    const r = t.nonzero(-3, 4);
    const x = t.pick([-4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 0.5, 1.5, 2.5]);
    const q = t.int(-6, 6);
    const lhs = L.u * (p * x + q);
    // s from u(px + q) = v(rx + s).
    const s = lhs / Rb.u - r * x;
    if (!Number.isInteger(s) || Math.abs(s) > 12) return null;
    const den = L.u * p - Rb.u * r;
    if (den === 0) return null;
    const content = `${L.text}^${exponentText(p, q)} = ${Rb.text}^${exponentText(r, s)}`;
    const nice = (value) => Number.isFinite(value) && Math.abs(value) <= 40 && denominatorHard(value) <= 8;
    const wrong = [];
    if (p !== r) wrong.push([(s - q) / (p - r), "Sets the exponents equal as written, before writing both sides as powers of the same base."]);
    if (L.u * p !== r) wrong.push([(s - L.u * q) / (L.u * p - r), `Rewrites only the left base as a power of ${b}.`]);
    wrong.push([(s - q) / den, `Multiplies only the x-terms of the exponents by the powers ${num(L.u)} and ${num(Rb.u)}, not the constants.`]);
    if ((L.u < 0 || Rb.u < 0) && Math.abs(L.u) * p !== Math.abs(Rb.u) * r) {
      wrong.push([(Math.abs(Rb.u) * s - Math.abs(L.u) * q) / (Math.abs(L.u) * p - Math.abs(Rb.u) * r),
        `Writes ${L.u < 0 ? L.text : Rb.text} as ${b}^${Math.abs(L.u < 0 ? L.u : Rb.u)}, losing the negative exponent of a reciprocal.`]);
    }
    const offers = wrong.filter(([value]) => nice(value) && !approx(value, x));
    if (!numeric && offers.length < 3) return null;
    const powerText = (entry) => (entry.u === 1 ? `${b}` : entry.u > 0 ? `${b}${sup(entry.u)}` : `${b}^(${num(entry.u)})`);
    const times = (u, p0, q0) => `${u === 1 ? "" : u === -1 ? MINUS : num(u)}${exponentText(p0, q0)}`;
    // Compare the two sides as numbers, relative to their size (they can be tiny).
    const holds = (value) => {
      const left = (b ** L.u) ** (p * value + q);
      const right = (b ** Rb.u) ** (r * value + s);
      return Math.abs(left / right - 1) < 1e-9;
    };
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      stimulus: { type: "equations", content },
      stem: "What value of x satisfies the given equation?",
      correct: numeric ? x : ratio(x),
      wrong: numeric ? undefined : t.shuffle(offers).slice(0, 3).map(([value, why]) => [ratio(value), why]),
      explanation:
        `Write both sides as powers of ${b}: ${L.text} = ${powerText(L)} and ${Rb.text} = ${powerText(Rb)}. ` +
        `Then ${times(L.u, p, q)} = ${times(Rb.u, r, s)}, ` +
        `so ${lin(L.u * p, L.u * q)} = ${lin(Rb.u * r, Rb.u * s)} and x = ${ratio(x)}.`,
      steps: [
        `Rewrite the bases: ${L.text} = ${powerText(L)}, ${Rb.text} = ${powerText(Rb)}.`,
        `A power of a power multiplies exponents: ${b}^(${lin(L.u * p, L.u * q)}) = ${b}^(${lin(Rb.u * r, Rb.u * s)}).`,
        `Equal powers of the same base have equal exponents: ${lin(L.u * p, L.u * q)} = ${lin(Rb.u * r, Rb.u * s)}.`,
        `Solve: x = ${ratio(x)}.`,
      ],
      principles: ["Rewrite both sides with one base; then b^m = b^n (b > 0, b ≠ 1) means m = n.", "(b^u)^m = b^(um), and 1/b^u = b^(−u)."],
      trap: numeric
        ? `Setting the exponents equal before rewriting the bases gives ${offers.length ? ratio(offers[0][0]) : "a different value"}; the exponents can be compared only once the bases match.`
        : "Exponents can be compared only after both sides have the same base, and every term of each exponent is multiplied by the power.",
      hint: `Can ${L.text} and ${Rb.text} be written as powers of the same number?`,
      verify: () => holds(x) && offers.every(([value]) => !holds(value)),
    };
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
      "In (x + p)(x + q) the constant is pq and the x-coefficient is p + q; with a leading coefficient the x-term is the sum of the outer and inner products; a difference of two squares has no x-term.",
    rubric: { steps: 0, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["sign-error", "equivalent-form"],
    build(t) {
      const roll = t.random();
      const make = roll < 0.25 ? () => trinomialItem(t, false) : roll < 0.45 ? () => trinomialItem(t, true)
        : roll < 0.62 ? () => nonMonicItem(t, false) : roll < 0.78 ? () => nonMonicItem(t, true) : () => squaresItem(t);
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
        ? t.pick(["product", "two-roots", "quotient", "nested", "power", "reciprocal"])
        : t.pick(["product", "two-roots", "power", "quotient", "nested", "reciprocal"]);
      const make = !numeric && t.chance(0.25) ? () => twoVariableRootItem(t) : () => rationalExponentItem(t, kind, numeric);
      return { estimatedSeconds: 85, ...drawUntilDistinct(make) };
    },
  };

  const unknownCoefficientProduct = {
    id: "unknown-coefficient-product",
    difficulty: "Hard",
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
      // The key must not be the one choice whose opening number differs from
      // the other three's (the gate's form check).
      const opening = (value) => (S.label(value).match(/^\S+/) || [""])[0];
      const oddOneOut = (record) => {
        if (record.responseType !== "multiple-choice") return false;
        const shown = [];
        record.wrong.forEach(([value]) => {
          if (shown.length < 3 && !shown.includes(S.label(value))) shown.push(S.label(value));
        });
        const heads = shown.map(opening);
        return new Set(heads).size === 1 && heads[0] !== opening(record.correct);
      };
      return {
        estimatedSeconds: 120,
        ...drawUntilDistinctHard(() => {
          const record = make(t);
          return record && !oddOneOut(record) ? record : null;
        }),
      };
    },
  };

  // Hard: the target is a power of a different base, or a power sum hidden in
  // the square or cube of x + 1/x; the structure has to be seen before
  // anything can be computed.
  const expressionSubstitution = {
    id: "expression-substitution",
    difficulty: "Hard",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "exponent rules",
    title: "Evaluate an expression through a known combination",
    recognize:
      "The variables cannot be found one at a time; the target is a power of a common base whose exponent is a " +
      "multiple of the given combination, or a power sum inside the square or cube of the given expression.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 2 },
    tricks: ["wrong-quantity", "equivalent-form", "neighbouring-rule", "sign-error", "intermediate-value"],
    build(t) {
      const powers = t.chance(0.55);
      const numeric = t.chance(0.36);
      const make = powers ? () => substitutionPowers(t, numeric) : () => substitutionReciprocal(t, numeric);
      return { estimatedSeconds: 110, ...drawUntilDistinctHard(make) };
    },
  };

  // Medium: the target is a visible multiple of the given linear combination,
  // or a power of the same base as the given equation.
  const expressionFromCombination = {
    id: "expression-from-combination",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "exponent rules",
    title: "Value of an expression from a given equation without solving it",
    recognize:
      "The target is a multiple of the given combination plus a constant, or a power of the same base split into a " +
      "product of powers; rewrite the target in terms of what is given.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "sign-error", "intermediate-value", "neighbouring-rule"],
    build(t) {
      const linear = t.chance(0.55);
      const numeric = t.chance(0.4);
      const make = linear ? () => substitutionLinear(t, numeric) : () => substitutionExponent(t, numeric);
      return { estimatedSeconds: 85, ...drawUntilDistinctHard(make) };
    },
  };

  const nonlinearFormulaRearrange = {
    id: "nonlinear-formula-rearrange",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "rational expressions",
    title: "Solving or scaling a nonlinear formula",
    recognize:
      "Every other letter is a constant: clear fractions, collect the terms with the target letter (factoring it out " +
      "if it appears twice), and undo squares, roots, and reciprocals last, on whole sides. When inputs are scaled, " +
      "each input's factor is raised to its exponent, and the effects multiply.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form", "intermediate-value", "neighbouring-rule"],
    build(t) {
      const scaling = t.chance(0.3);
      const numeric = t.chance(0.5);
      const make = scaling ? () => formulaScalingItem(t, numeric) : () => formulaItem(t);
      return { estimatedSeconds: 95, ...drawUntilDistinct(make) };
    },
  };

  const commonBaseExponent = {
    id: "common-base-exponent",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "exponent rules",
    title: "Exponential equation solved by rewriting with a common base",
    recognize: "Write both sides as powers of one base, multiply out each exponent, and set the exponents equal.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "sign-error", "equivalent-form"],
    build(t) {
      const numeric = t.chance(0.45);
      return { estimatedSeconds: 90, ...drawUntilDistinct(() => commonBaseItem(t, numeric)) };
    },
  };

  const quadraticStructureForm = {
    id: "quadratic-structure-form",
    difficulty: "Medium",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "factoring",
    title: "Equivalent quadratic form that displays a feature",
    recognize:
      "Each form of a quadratic displays one feature: factored form the zeros, vertex form the vertex and extreme " +
      "value, standard form the y-intercept. Decide which form is wanted, then check the candidate is truly equivalent.",
    // Medium: name the form, then check one candidate (the 2026-09-26 review).
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form", "sign-error", "wrong-quantity"],
    build(t) {
      return { estimatedSeconds: 110, ...drawUntilDistinctHard(() => quadraticStructure(t)) };
    },
  };

  /* ============================================ complex-fraction-equivalence */

  // A sum of two linear terms as the test prints it: sumText(2, 7) -> "2x + 7".
  const sumText = (m, c, variable = "x") => lin(m, c, variable);

  // 1/(1/(x + a) + 1/(x + b)) = (x + a)(x + b)/(2x + a + b).
  function reciprocalSumItem(t) {
    const [a, b] = t.sample([1, 2, 3, 4, 5, 6, 7, 8], 2).sort((m, n) => m - n);
    const A = `(x + ${a})`;
    const B = `(x + ${b})`;
    const given = `1/(1/${A} + 1/${B})`;
    const sum = sumText(2, a + b);
    const product = `${A}${B}`;
    const f = (x) => 1 / (1 / (x + a) + 1 / (x + b));
    const key = [`(${product})/(${sum})`, (x) => ((x + a) * (x + b)) / (2 * x + a + b)];
    const offers = [
      [[sum, (x) => 2 * x + a + b], "Takes the reciprocal of each fraction separately, as if 1/(1/A + 1/B) were A + B."],
      [[`(${sum})/(${product})`, (x) => (2 * x + a + b) / ((x + a) * (x + b))], "Adds the two fractions correctly but forgets the outer reciprocal."],
      [[`(${sum})/2`, (x) => (2 * x + a + b) / 2], `Adds the fractions by adding numerators and denominators, 1/${A} + 1/${B} = 2/(${sum}), then inverts.`],
      [[`(${product})/${a + b}`, (x) => ((x + a) * (x + b)) / (a + b)], `Adds the fractions over the common denominator ${product} but writes the numerator as ${a + b} instead of ${sum}.`],
    ];
    // The forgotten reciprocal holds every number the key does, so it is
    // always offered: sharing numbers with the other choices does not single
    // out the key.
    const chosen = t.shuffle([offers[1], ...t.sample([offers[0], offers[2], offers[3]], 2)]);
    const steps = [
      `Add the inner fractions over the common denominator ${product}: 1/${A} + 1/${B} = (${sum})/(${product}).`,
      `The given expression is 1 divided by that sum, so it is the reciprocal: (${product})/(${sum}).`,
    ];
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: given },
      stem: "Which of the following is equivalent to the given expression for x > 0?",
      correct: key[0],
      wrong: chosen.map(([[text], why]) => [text, why]),
      explanation: steps.join(" "),
      steps,
      principles: [
        "To add fractions, rewrite them over a common denominator; the reciprocal of a sum is not the sum of the reciprocals.",
        "Dividing 1 by a fraction gives its reciprocal.",
      ],
      trap: "The reciprocal of a sum is not the sum of the reciprocals: 1/(1/A + 1/B) is not A + B.",
      hint: "Combine the two fractions in the denominator into one fraction first.",
      verify: () => SAMPLES.filter((x) => x > 0).every((x) => approx(key[1](x), f(x), 1e-9)) &&
        chosen.every(([[, g]]) => SAMPLES.filter((x) => x > 0).some((x) => !approx(g(x), f(x), 1e-7))),
    };
  }

  // (k/x − k/y)/(1/x² − 1/y²) = kxy/(x + y).
  function differenceSquaresItem(t) {
    const k = t.pick([1, 2, 3, 4, 5, 6]);
    const kk = k === 1 ? "" : `${k}`;
    const [x, y] = t.pick([["x", "y"], ["a", "b"], ["m", "n"], ["s", "t"]]);
    const top = `${k}/${x} ${MINUS} ${k}/${y}`;
    const given = `(${top})/(1/${x}² ${MINUS} 1/${y}²)`;
    const f = (u, v) => (k / u - k / v) / (1 / (u * u) - 1 / (v * v));
    const key = [`(${kk}${x}${y})/(${x} + ${y})`, (u, v) => (k * u * v) / (u + v)];
    const offers = [
      [[`(${k}(${x} + ${y}))/(${x}${y})`, (u, v) => (k * (u + v)) / (u * v)], "Inverts the result: divides the denominator by the numerator."],
      [[`(${kk}${x}${y})/(${y} ${MINUS} ${x})`, (u, v) => (k * u * v) / (v - u)], `Factors ${y}² ${MINUS} ${x}² as (${y} ${MINUS} ${x})², so the wrong factor is left after canceling.`],
      [[`${k}/(${x} + ${y})`, (u, v) => k / (u + v)], `Clears the fractions in the numerator and denominator with different multipliers, which loses the factor ${x}${y}.`],
      [[`(${MINUS}${kk}${x}${y})/(${x} + ${y})`, (u, v) => (-k * u * v) / (u + v)], `Writes ${k}/${x} ${MINUS} ${k}/${y} as ${k}(${x} ${MINUS} ${y})/(${x}${y}), which reverses the sign.`],
      [[`(${MINUS}${k}(${x} + ${y}))/(${x}${y})`, (u, v) => (-k * (u + v)) / (u * v)], "Makes two slips: it reverses the sign of the numerator and inverts the result."],
    ];
    // The sign slip (4) is one change from the key; the inverted result (0)
    // and its sign slip (4) are a pair of their own.
    const chosen = t.shuffle(t.pick([[3, 0, 4], [0, 4, 2], [3, 0, 2], [0, 1, 2], [1, 0, 4]]).map((index) => offers[index]));
    const steps = [
      `Multiply the numerator and the denominator by ${x}²${y}²: (${kk}${x}${y}² ${MINUS} ${kk}${x}²${y})/(${y}² ${MINUS} ${x}²).`,
      `Factor: ${kk}${x}${y}(${y} ${MINUS} ${x}) over (${y} ${MINUS} ${x})(${y} + ${x}).`,
      `Cancel ${y} ${MINUS} ${x} (${x} ≠ ${y}): the expression is (${kk}${x}${y})/(${x} + ${y}).`,
    ];
    const points = [[1.3, 2.9], [0.7, 4.1], [3.3, 1.6]];
    return {
      responseType: "multiple-choice",
      stimulus: { type: "equations", content: given },
      stem: `Which of the following is equivalent to the given expression for ${x} > 0 and ${y} > 0, where ${x} ≠ ${y}?`,
      correct: key[0],
      wrong: chosen.map(([[text], why]) => [text, why]),
      explanation: steps.join(" "),
      steps,
      principles: [
        "Multiplying the numerator and the denominator of a fraction by the same nonzero expression leaves its value unchanged.",
        `${y}² ${MINUS} ${x}² = (${y} ${MINUS} ${x})(${y} + ${x}).`,
      ],
      trap: `The denominator hides a difference of squares; only after factoring does the common factor ${y} ${MINUS} ${x} cancel.`,
      hint: "What single expression clears every small fraction at once?",
      verify: () => points.every(([u, v]) => approx(key[1](u, v), f(u, v), 1e-9)) &&
        chosen.every(([[, g]]) => points.some(([u, v]) => !approx(g(u, v), f(u, v), 1e-7))),
    };
  }

  // (p/x + q/y)/(p/x − q/y) = K: clearing fractions gives (py + qx)/(py − qx) = K,
  // so x/y = p(K − 1)/(q(K + 1)).
  function fractionRatioItem(t, numeric) {
    for (;;) {
      const [p, q] = t.pick([[1, 1], [1, 1], [2, 1], [1, 2], [3, 1], [1, 3], [3, 2], [2, 3]]);
      const K = t.pick([2, 3, 4, 5, 6, 7, -2, -3, -4]);
      const askXY = t.chance(0.6);
      // x/y as [numerator, denominator]; the ask may be its reciprocal.
      const ratioXY = [p * (K - 1), q * (K + 1)];
      const [n, d] = askXY ? ratioXY : [ratioXY[1], ratioXY[0]];
      if (d === 0 || n === 0) continue;
      const key = S.frac(n, d);
      if (key.replace(MINUS, "").length > 5 || !key.includes("/")) continue;
      const pText = (c, v) => `${c}/${v}`;
      const given = `(${pText(p, "x")} + ${pText(q, "y")})/(${pText(p, "x")} ${MINUS} ${pText(q, "y")}) = ${num(K)}`;
      const asked = askXY ? "x/y" : "y/x";
      const flip = (text) => {
        const [top, bottom] = text.replace(MINUS, "-").split("/").map(Number);
        return S.frac(bottom || 1, top);
      };
      // Distributing K to only the first term of py − qx gives
      // py + qx = Kpy − qx, so x/y = p(K − 1)/(2q).
      const partial = askXY ? S.frac(p * (K - 1), 2 * q) : S.frac(2 * q, p * (K - 1));
      const otherRatio = askXY ? "y/x" : "x/y";
      const flipKey = [flip(key), `Finds ${otherRatio}, the reciprocal of the ratio asked for.`];
      const slip = [partial, `Multiplies only the first term of the denominator by ${num(K)} when clearing the fraction.`];
      const slipFlip = [flip(partial), `Multiplies only the first term of the denominator by ${num(K)}, and then finds ${otherRatio} instead of ${asked}.`];
      const stop = [num(K), `Gives the value of the given expression, ${num(K)}, not the ratio.`];
      // The reciprocal slip pairs with the key, so the partial slip comes with
      // its own reciprocal: all paired, a distractor pair, or the key's pair.
      const slips = t.pick([[flipKey, slip, slipFlip], [slip, slipFlip, stop], [slip, slipFlip, stop], [flipKey, slip, stop]]);
      if (slips.some(([text]) => text === key) || new Set(slips.map(([text]) => text)).size < 3) continue;
      const steps = [
        `Multiply the numerator and the denominator by xy: (${p === 1 ? "" : p}y + ${q === 1 ? "" : q}x)/(${p === 1 ? "" : p}y ${MINUS} ${q === 1 ? "" : q}x) = ${num(K)}.`,
        `Cross-multiply: ${p === 1 ? "" : p}y + ${q === 1 ? "" : q}x = ${num(K)}(${p === 1 ? "" : p}y ${MINUS} ${q === 1 ? "" : q}x), so ${lin(q * (K + 1), 0)} = ${lin(p * (K - 1), 0, "y")}.`,
        `So x/y = ${S.frac(ratioXY[0], ratioXY[1])}${askXY ? "" : `, and y/x = ${key}`}.`,
      ];
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        stimulus: { type: "equations", content: given },
        stem: `In the given equation, x and y are nonzero. What is the value of ${asked}?`,
        correct: key,
        wrong: numeric ? [] : t.shuffle(slips),
        explanation: steps.join(" "),
        steps,
        principles: [
          "Multiplying the numerator and the denominator of a complex fraction by the product of the small denominators clears it.",
          "An equation in x and y with no constant term fixes only the ratio of x to y.",
        ],
        trap: `The equation cannot be solved for x or y alone; it fixes the ratio, and ${asked} and its reciprocal are easy to confuse.`,
        hint: "Clear the small fractions, then gather the x-terms and the y-terms on opposite sides.",
        verify: () => {
          // Choose y, solve the displayed equation for x by bisection on the ratio, compare.
          const y = 1.7;
          const g = (x) => (p / x + q / y) / (p / x - q / y) - K;
          const x = (ratioXY[0] / ratioXY[1]) * y;
          const shown = (n / d);
          const ratio = askXY ? x / y : y / x;
          return approx(g(x), 0, 1e-9) && approx(ratio, shown, 1e-9) && !approx(g(x * 1.01), 0, 1e-9);
        },
      };
    }
  }

  const complexFractionEquivalence = {
    id: "complex-fraction-equivalence",
    difficulty: "Hard",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    subskill: "rational expressions",
    title: "Complex fraction simplified or solved for a ratio",
    recognize:
      "A fraction whose numerator or denominator holds fractions is cleared by multiplying both by the product of the " +
      "small denominators. The reciprocal of a sum is not the sum of the reciprocals, a difference of squares may be " +
      "waiting to cancel, and an equation with no constant term fixes only a ratio.",
    // Hard: the structure (a reciprocal of a sum, a hidden difference of
    // squares, a homogeneous equation) must be seen before the algebra.
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form", "neighbouring-rule", "wrong-quantity", "sign-error"],
    build(t) {
      const form = t.pick(["reciprocal", "squares", "ratio", "ratio"]);
      const numeric = form === "ratio" && t.chance(0.55);
      const make = form === "reciprocal"
        ? () => reciprocalSumItem(t)
        : form === "squares" ? () => differenceSquaresItem(t) : () => fractionRatioItem(t, numeric);
      return { estimatedSeconds: 120, ...drawUntilDistinctHard(make) };
    },
  };

  return [
    monomialExponentRules, quadraticFactorMatch, rationalExpressionCombine, rationalExponentRewrite,
    expressionFromCombination, nonlinearFormulaRearrange, commonBaseExponent, quadraticStructureForm,
    unknownCoefficientProduct, expressionSubstitution, complexFractionEquivalence,
  ];
});
