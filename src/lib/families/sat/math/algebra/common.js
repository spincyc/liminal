(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/math/algebra"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers used by two or more Algebra skill files.

  const { MINUS, num, lin, approx } = S;

  // Removes floating-point dust: 0.1 * 3 -> 0.3.
  const clean = (value) => Math.round(value * 1e6) / 1e6;

  const terminates = (value) => Math.abs(value * 1e4 - Math.round(value * 1e4)) < 1e-6;

  // True when a numeric key fits the five-character answer grid.
  const fitsGrid = (value) =>
    typeof value === "number" && Number.isFinite(value) && terminates(value) &&
    S.formatNumber(Math.abs(clean(value))).length <= 5;

  const whole = (value) => Number.isFinite(value) && Math.abs(value - Math.round(value)) < 1e-9;

  // "12,500" for amounts in running text; answer keys stay plain.
  function commas(value) {
    const [intPart, part] = S.formatNumber(Math.abs(clean(value))).split(".");
    const grouped = intPart.length > 3 ? intPart.replace(/\B(?=(\d{3})+$)/g, ",") : intPart;
    return `${value < 0 ? MINUS : ""}${grouped}${part ? `.${part}` : ""}`;
  }

  // "$1,250", "$3.20".
  function usd(value) {
    const cents = Math.round(value * 100);
    const rest = Math.abs(cents) % 100;
    return `$${commas(Math.trunc(cents / 100))}${rest ? `.${String(rest).padStart(2, "0")}` : ""}`;
  }

  // Money inside an equation: "3.25", "19.5" -> "19.50", "1,200".
  function money(value) {
    return whole(value) ? commas(Math.round(value)) : commas(Math.round(value * 100) / 100).replace(/\.(\d)$/, ".$10");
  }

  // Wrong answers that survive instantiate's de-duplication against the key.
  function distinctWrong(correct, wrong) {
    const seen = new Set([S.label(correct)]);
    let count = 0;
    wrong.forEach(([value]) => {
      const text = S.label(value);
      if (!seen.has(text) && !S.BAD_TEXT.test(text)) {
        seen.add(text);
        count += 1;
      }
    });
    return count;
  }

  // Multiple-choice numbers print as "2,460", as on the test; numeric keys stay plain.
  function commaChoices(instance) {
    if (instance.responseType !== "multiple-choice") return instance;
    const show = (value) => (typeof value === "number" ? commas(value) : value);
    return { ...instance, correct: show(instance.correct), wrong: instance.wrong.map(([value, reason]) => [show(value), reason]) };
  }

  // Numeric only when asked for and the key fits the grid.
  function responseFor(wanted, key) {
    return wanted && fitsGrid(key) ? "numeric" : "multiple-choice";
  }

  // " + 3x" or " − 2x" as a trailing term.
  function xTerm(coefficient, variable = "x") {
    return `${coefficient < 0 ? MINUS : "+"} ${lin(Math.abs(coefficient), 0, variable)}`;
  }

  // "3x − 4y = 7"
  function standardForm(a, b, c, relation = "=") {
    const head = lin(a, 0, "x");
    const yTerm = Math.abs(b) === 1 ? "y" : `${num(Math.abs(b))}y`;
    return `${head} ${b < 0 ? MINUS : "+"} ${yTerm} ${relation} ${num(c)}`;
  }

  // "Subtract 3x from both sides" / "Add 4 to both sides".
  function moveText(coefficient, variable = "") {
    const term = variable ? lin(Math.abs(coefficient), 0, variable) : num(Math.abs(coefficient));
    return coefficient > 0 ? `Subtract ${term} from both sides` : `Add ${term} to both sides`;
  }

  // Compiles a displayed expression ("3(x − 4)", "x/5 + 2", "2.5b + 1.5m")
  // into a function of its single-letter variables. Juxtaposition binds
  // tighter than "/", as in "5x/3" = (5x)/3. Verification evaluates the exact
  // text a student reads, so a typo in the display cannot hide behind code.
  function compile(text) {
    const source = text.replace(/\s+/g, "").replace(/(\d),(?=\d{3}(?!\d))/g, "$1");
    const tokens = source.match(/\d+(?:\.\d+)?|\.\d+|[A-Za-z]|[()+\-−/·×]/g) || [];
    if (tokens.join("") !== source) throw new Error(`cannot read "${text}"`);
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
    function product() {
      let node;
      if (isMinus(peek())) {
        position += 1;
        const inner = primary();
        node = (values) => -inner(values);
      } else node = primary();
      while (peek() !== undefined && (/^[\d.A-Za-z(]/.test(peek()) || peek() === "·" || peek() === "×")) {
        if (peek() === "·" || peek() === "×") position += 1;
        const left = node;
        const right = primary();
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

  // Evaluates a displayed equation or inequality ("2x + 3 ≤ 11") at values.
  function holds(text, values) {
    const parts = text.split(/ (≤|≥|<|>|=) /);
    if (parts.length !== 3) throw new Error(`cannot read relation in "${text}"`);
    const [leftText, relation, rightText] = parts;
    const left = compile(leftText)(values);
    const right = compile(rightText)(values);
    const tolerance = 1e-9 * Math.max(1, Math.abs(left), Math.abs(right));
    if (relation === "=") return Math.abs(left - right) <= tolerance;
    if (relation === "<") return left < right - tolerance;
    if (relation === "≤") return left <= right + tolerance;
    if (relation === ">") return left > right + tolerance;
    return left >= right - tolerance;
  }

  // The two sides of a displayed equation, compiled.
  function sidesOf(text) {
    const [leftText, rightText] = text.split(" = ");
    return [compile(leftText), compile(rightText)];
  }

  // [A, B, C] with Ax + By = C for a displayed linear equation in x and y,
  // read back through compile rather than taken from the code that built it.
  function lineCoefficients(text) {
    const [left, right] = sidesOf(text);
    const f = (x, y) => left({ x, y }) - right({ x, y });
    const f0 = f(0, 0);
    return [f(1, 0) - f0, f(0, 1) - f0, -f0];
  }

  // The solution [x, y] of A1x + B1y = C1 and A2x + B2y = C2 by Cramer's rule,
  // or null when the lines are parallel or the same.
  function cramer([A1, B1, C1], [A2, B2, C2]) {
    const det = A1 * B2 - A2 * B1;
    if (approx(det, 0)) return null;
    return [(C1 * B2 - C2 * B1) / det, (A1 * C2 - A2 * C1) / det];
  }

  // A slope times a variable, as the test prints it: "3x", "−x", "(3/4)x", "−(3/4)x".
  function slopeTerm(numerator, denominator, variable = "x") {
    const divisor = S.gcd(numerator, denominator);
    let top = numerator / divisor;
    let bottom = denominator / divisor;
    if (bottom < 0) {
      top = -top;
      bottom = -bottom;
    }
    if (bottom === 1) return lin(top, 0, variable);
    return `${top < 0 ? MINUS : ""}(${Math.abs(top)}/${bottom})${variable}`;
  }

  const readPoint = (text) => text.replace(/[()]/g, "").split(", ").map((part) => Number(part.replace(MINUS, "-")));

  // True when the value prints exactly with at most four decimal places.
  const exact = (value) => Math.abs(value * 1e4 - Math.round(value * 1e4)) < 1e-6;

  // True when a numeric key fits the five-character answer grid.
  const fitsGridHard = (value) => exact(value) && S.formatNumber(Math.abs(value)).length <= 5;

  const round2 = (value) => Math.round(value * 100) / 100;

  // "12,500" for amounts in running text; answer keys stay plain.
  function commasHard(value) {
    const [whole, part] = S.formatNumber(Math.abs(value)).split(".");
    const grouped = whole.length > 3 ? whole.replace(/\B(?=(\d{3})+$)/g, ",") : whole;
    return `${value < 0 ? MINUS : ""}${grouped}${part ? `.${part}` : ""}`;
  }

  // "$1,250", "$3.20", "$0.012".
  function usdHard(value) {
    if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) return `$${commasHard(value)}`;
    const cents = Math.round(value * 100);
    const rest = cents % 100;
    return `$${commasHard(Math.floor(cents / 100))}${rest ? `.${String(rest).padStart(2, "0")}` : ""}`;
  }

  // Multiple-choice numbers print as "2,460", as on the test; numeric keys stay plain.
  function commaChoicesHard(instance) {
    if (instance.responseType !== "multiple-choice") return instance;
    const show = (value) => (typeof value === "number" ? commasHard(value) : value);
    return { ...instance, correct: show(instance.correct), wrong: instance.wrong.map(([value, reason]) => [show(value), reason]) };
  }

  // Wrong answers that survive instantiate's de-duplication against the key.
  function distinctWrongHard(correct, wrong) {
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
  function compileHard(text) {
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

  // The value a choice shows: numbers, and strings such as "−3/4" or "2.5";
  // NaN for anything else (points, expressions, words).
  function choiceValue(value) {
    if (typeof value === "number") return value;
    const text = String(value).replace(/−/g, "-").replace(/(\d),(?=\d{3})/g, "$1");
    const match = text.match(/^(-?\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/);
    return match ? Number(match[1]) / (match[2] ? Number(match[2]) : 1) : NaN;
  }

  // True when a modelled mistake prints exactly as the key does. Such a draw
  // is rejected and redrawn: a mistake that lands on the key is not a
  // distractor, and dropping it silently would leave a weaker set.
  const collides = (key, wrong) => wrong.some(([value]) => S.label(value) === S.label(key));

  // Chooses `count` of the modelled mistakes so that the key's rank among the
  // four shown values is spread evenly: smallest, largest, or in between about
  // as often as chance makes it, so neither the extremes nor the middle give
  // the key away. Non-numeric choices are sampled at random instead.
  function spreadAround(t, key, wrong, count = 3) {
    const seen = new Set([S.label(key)]);
    const pool = wrong.filter(([value]) => {
      const text = S.label(value);
      if (seen.has(text) || S.BAD_TEXT.test(text)) return false;
      seen.add(text);
      return true;
    });
    if (pool.length <= count) return pool;
    const keyValue = choiceValue(key);
    const values = pool.map(([value]) => choiceValue(value));
    if (!Number.isFinite(keyValue) || values.some((value) => !Number.isFinite(value))) return t.sample(pool, count);
    const byRank = new Map();
    const walk = (start, chosen) => {
      if (chosen.length === count) {
        const rank = chosen.filter((index) => values[index] < keyValue).length;
        if (!byRank.has(rank)) byRank.set(rank, []);
        byRank.get(rank).push(chosen.slice());
        return;
      }
      for (let index = start; index < pool.length; index += 1) {
        chosen.push(index);
        walk(index + 1, chosen);
        chosen.pop();
      }
    };
    walk(0, []);
    const ranks = [...byRank.keys()].sort((a, b) => a - b);
    return t.pick(byRank.get(t.pick(ranks))).map((index) => pool[index]);
  }

  // "−3/4" for "3/4", −5 for 5.
  const negateChoice = (value) => (typeof value === "number"
    ? -value
    : String(value).startsWith(MINUS) ? String(value).slice(1) : `${MINUS}${value}`);

  // Like spreadAround, but the key never sits in the only ± pair. When the
  // modelled mistakes include the key's negation (a sign slip), half the time
  // it is shown with another mistake and that mistake's negation (the same
  // mistake plus the sign slip, `signSlip` completing "it also …"); otherwise
  // the negation is left out and the rest are spread around the key.
  function spreadWithMirror(t, key, wrong, signSlip) {
    const keyValue = choiceValue(key);
    const isMirror = ([value]) => Number.isFinite(keyValue) && keyValue !== 0 &&
      Math.abs(choiceValue(value) + keyValue) < 1e-9;
    const mirror = wrong.find(isMirror);
    const rest = wrong.filter((entry) => !isMirror(entry));
    if (mirror && t.chance(0.5)) {
      const partners = rest.filter(([value]) => {
        const shown = choiceValue(value);
        return Number.isFinite(shown) && shown !== 0 && Math.abs(Math.abs(shown) - Math.abs(keyValue)) > 1e-9 &&
          S.label(value) !== S.label(key);
      });
      // The partner pair lies inside the key's pair or outside it about
      // equally often, so the key is an extreme value half the time.
      const inner = partners.filter(([value]) => Math.abs(choiceValue(value)) < Math.abs(keyValue));
      const outer = partners.filter(([value]) => Math.abs(choiceValue(value)) > Math.abs(keyValue));
      if (inner.length && outer.length) {
        const [value, reason] = t.pick(t.pick([inner, outer]));
        return [mirror, [value, reason], [negateChoice(value), `${reason.replace(/\.$/, "")}; it also ${signSlip}.`]];
      }
    }
    return spreadAround(t, key, distinctWrong(key, rest) >= 3 ? rest : wrong);
  }

  // The line through the first two shown points, checked against the rest.
  // Verification rebuilds f from what the student sees, not from m and b0.
  function lineFrom(points) {
    const [[x1, y1], [x2, y2]] = points;
    const slope = (y2 - y1) / (x2 - x1);
    const f = (x) => y1 + slope * (x - x1);
    return { f, slope, consistent: points.every(([x, y]) => approx(f(x), y)) };
  }

  return {
    clean, terminates, fitsGrid, whole, commas, usd, money, distinctWrong, commaChoices,
    responseFor, xTerm, standardForm, moveText, compile, holds, sidesOf, readPoint, exact,
    fitsGridHard, round2, commasHard, usdHard, commaChoicesHard, distinctWrongHard, compileHard,
    lineFrom, lineCoefficients, cramer, slopeTerm, choiceValue, collides, spreadAround, negateChoice, spreadWithMirror,
  };
});
