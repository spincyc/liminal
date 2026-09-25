(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/math/advanced-math"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers used by two or more Advanced Math skill files.

  const { MINUS, num, lin, frac } = S;

  const tidy = (value) => Math.round(value * 1e6) / 1e6;

  // Smallest denominator that writes `value` exactly (Infinity if none <= 1000).
  function denominator(value) {
    for (let den = 1; den <= 1000; den += 1) {
      if (Math.abs(Math.round(value * den) - value * den) < 1e-6) return den;
    }
    return Infinity;
  }

  // A rational value as a label: ratio(2.5) -> "5/2", ratio(-3) -> "−3".
  function ratio(value) {
    const den = denominator(value);
    return den === Infinity ? num(value) : frac(Math.round(value * den), den);
  }

  // A numeric key must be an integer or a short terminating decimal.
  function gridable(value) {
    if (!Number.isFinite(value)) return false;
    if (Math.abs(Math.round(value * 1e4) - value * 1e4) > 1e-6) return false;
    return S.formatNumber(tidy(value)).replace("-", "").length <= 5;
  }

  // The value of a numeric choice label such as "−7", "5/2", "2²⁰", "1/3⁴", or
  // "4^10"; NaN for anything else (expressions with letters, words).
  function labelValue(text) {
    const source = String(text).replace(/\s+/g, "").replace(/−/g, "-");
    const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
    let position = 0;
    const peek = () => source[position];
    function atom() {
      if (peek() === "(") {
        position += 1;
        const inner = quotient();
        if (peek() !== ")") return NaN;
        position += 1;
        return inner;
      }
      const match = /^\d+(\.\d+)?/.exec(source.slice(position));
      if (!match) return NaN;
      position += match[0].length;
      return Number(match[0]);
    }
    function power() {
      const base = atom();
      let digits = "";
      while (position < source.length && SUP.includes(peek())) digits += SUP.indexOf(source[position++]);
      if (digits) return base ** Number(digits);
      if (peek() === "^") {
        position += 1;
        return base ** signedPower();
      }
      return base;
    }
    function signedPower() {
      if (peek() === "-") {
        position += 1;
        return -power();
      }
      return power();
    }
    function quotient() {
      let value = signedPower();
      while (peek() === "/") {
        position += 1;
        value /= signedPower();
      }
      return value;
    }
    const value = quotient();
    return position === source.length ? value : NaN;
  }

  // True when a multiple-choice record can show four distinct choices: at
  // least three distractors that differ from each other and from the key,
  // none of them a modelled mistake that lands on the key (a draw like that
  // is redrawn rather than silently losing the distractor), and no two
  // numeric choices with the same value written differently (2²⁰ and 4¹⁰).
  function enoughChoices(record) {
    if (!record) return false;
    const key = S.label(record.correct);
    // A numeric item's modelled mistakes still feed its trap text, so one
    // that lands on the key is redrawn there too.
    if (record.responseType === "numeric") {
      return gridable(record.correct) && !(record.wrong || []).some(([value]) => S.label(value) === key);
    }
    const labels = [key];
    for (const [value] of record.wrong || []) {
      const text = S.label(value);
      if (text === key) return false;
      if (!labels.includes(text) && !S.BAD_TEXT.test(text)) labels.push(text);
    }
    if (labels.length < 4) return false;
    const shown = labels.slice(0, 4).map(labelValue);
    if (shown.every(Number.isFinite)) {
      for (let i = 0; i < 4; i += 1) {
        for (let j = i + 1; j < 4; j += 1) if (Math.abs(shown[i] - shown[j]) < 1e-9 * Math.max(1, Math.abs(shown[i]))) return false;
      }
    }
    return true;
  }

  // Redraws with fresh parameters until the record is usable, so a rare
  // collision between a key and a distractor never reaches a student.
  function drawUntilDistinct(make) {
    for (let attempt = 0; attempt < 500; attempt += 1) {
      const record = make();
      if (enoughChoices(record)) return record;
    }
    throw new Error("no draw produced a usable record");
  }

  // bin(2, -3) -> "(2x − 3)"
  const bin = (m, k, variable = "x") => `(${lin(m, k, variable)})`;

  // A factor with root r: "x" when r is 0, otherwise "(x − r)".
  const rootFactor = (r) => (r === 0 ? "x" : bin(1, -r));

  // Leading coefficient in front of parentheses: 1 -> "", -1 -> "−", 3 -> "3".
  const lead = (a) => (a === 1 ? "" : a === -1 ? MINUS : num(a));

  // Smallest denominator that writes `value` exactly (Infinity if none <= 500).
  function denominatorHard(value) {
    for (let den = 1; den <= 500; den += 1) {
      if (Math.abs(Math.round(value * den) - value * den) < 1e-6) return den;
    }
    return Infinity;
  }

  // A rational value as a choice label: ratioHard(8.5) -> "17/2", ratioHard(-3) -> "−3".
  function ratioHard(value) {
    const den = denominatorHard(value);
    return den === Infinity ? num(value) : frac(Math.round(value * den), den);
  }

  // The same test for templates whose numeric keys are checked elsewhere.
  function enoughChoicesHard(record) {
    if (!record) return false;
    if (record.responseType === "numeric") {
      const key = S.label(record.correct);
      return !(record.wrong || []).some(([value]) => S.label(value) === key);
    }
    return enoughChoices(record);
  }

  // Redraws until the record can be shown as four distinct choices. Every draw
  // uses fresh random parameters, so a rare collision never reaches a student.
  function drawUntilDistinctHard(make) {
    for (let attempt = 0; attempt < 2000; attempt += 1) {
      const record = make();
      if (record && enoughChoicesHard(record)) return record;
    }
    throw new Error("no draw produced a usable record");
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

  // Exact decimal text for n / 10^k (integer n), trailing zeros trimmed, ASCII minus.
  function decimalTextHard(n, k) {
    let digits = String(Math.abs(n));
    if (k > 0) {
      digits = digits.padStart(k + 1, "0");
      digits = `${digits.slice(0, -k)}.${digits.slice(-k)}`.replace(/\.?0+$/, "");
    }
    return n < 0 && digits !== "0" ? `-${digits}` : digits;
  }

  // n / d as a terminating decimal with at most maxDp places, or null.
  function ratioText(n, d, maxDp = 4) {
    const sign = d < 0 ? -1 : 1;
    for (let k = 0, scale = 1; k <= maxDp; k += 1, scale *= 10) {
      if ((n * sign * scale) % (d * sign) === 0) return decimalTextHard((n * sign * scale) / (d * sign), k);
    }
    return null;
  }

  // Real roots of x² + Bx + C = 0 by the quadratic formula.
  function quadraticRoots(B, C) {
    const disc = B * B - 4 * C;
    if (disc < 0) return [];
    const root = Math.sqrt(disc);
    return disc === 0 ? [-B / 2] : [(-B - root) / 2, (-B + root) / 2];
  }

  return {
    tidy, denominator, ratio, gridable, labelValue, enoughChoices, drawUntilDistinct, bin, rootFactor, lead, denominatorHard,
    ratioHard, enoughChoicesHard, drawUntilDistinctHard, term, plus, terms, sampleQuadratic,
    realRoots, decimalTextHard, ratioText, quadraticRoots,
  };
});
