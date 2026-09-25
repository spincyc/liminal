// Number and math notation for question text. Every rendered minus sign is
// U+2212; numeric answer keys stay ASCII because core.js compares typed
// responses.
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const deps = node
    ? {

    }
    : root.LiminalFamilyShared || {};
  const api = factory(deps);
  if (node) module.exports = api;
  else root.LiminalFamilyShared = Object.assign(root.LiminalFamilyShared || {}, api);
})(typeof self !== "undefined" ? self : this, function (deps) {
  "use strict";

  const MINUS = "−";

  /* ------------------------------------------------------------ arithmetic */

  function gcd(a, b) {
    let left = Math.abs(a);
    let right = Math.abs(b);
    while (right) [left, right] = [right, left % right];
    return left || 1;
  }

  function approx(a, b, epsilon = 1e-9) {
    return Math.abs(a - b) <= epsilon * Math.max(1, Math.abs(a), Math.abs(b));
  }

  /* ------------------------------------------------------------- notation */

  function formatNumber(value) {
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 10000) / 10000);
  }

  function num(value) {
    return formatNumber(value).replace("-", MINUS);
  }

  // Wraps a negative number in parentheses for use inside a product:
  // paren(-4) -> "(−4)", paren(4) -> "4".
  function paren(value) {
    return value < 0 ? `(${num(value)})` : num(value);
  }

  function label(value) {
    return typeof value === "string" ? value : num(value);
  }

  // ASCII key for a numeric (student-produced) response.
  function answerKey(value) {
    return typeof value === "string" ? value.replace(MINUS, "-") : formatNumber(value);
  }

  // "3/4", "−5/2", or "7" when the fraction reduces to an integer.
  function frac(numerator, denominator) {
    const divisor = gcd(numerator, denominator);
    let top = numerator / divisor;
    let bottom = denominator / divisor;
    if (bottom < 0) {
      top = -top;
      bottom = -bottom;
    }
    return bottom === 1 ? num(top) : `${num(top)}/${bottom}`;
  }

  const SUPERSCRIPTS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

  function sup(power) {
    return String(power).split("").map((digit) => SUPERSCRIPTS[digit] || digit).join("");
  }

  // Polynomial from descending coefficients: poly([2, -3, 5]) -> "2x² − 3x + 5".
  function poly(coefficients, variable = "x") {
    const degree = coefficients.length - 1;
    const parts = [];
    coefficients.forEach((coefficient, index) => {
      if (coefficient === 0) return;
      const power = degree - index;
      const magnitude = Math.abs(coefficient);
      const body = power === 0
        ? num(magnitude)
        : `${magnitude === 1 ? "" : num(magnitude)}${variable}${power === 1 ? "" : sup(power)}`;
      if (!parts.length) parts.push(coefficient < 0 ? `${MINUS}${body}` : body);
      else parts.push(`${coefficient < 0 ? MINUS : "+"} ${body}`);
    });
    return parts.length ? parts.join(" ") : "0";
  }

  // lin(3, -5) -> "3x − 5"
  function lin(a, b, variable = "x") {
    return poly([a, b], variable);
  }

  // signed(-4) -> "− 4", signed(4) -> "+ 4"
  function signed(value) {
    return value < 0 ? `${MINUS} ${num(Math.abs(value))}` : `+ ${num(value)}`;
  }

  function point(x, y) {
    return `(${num(x)}, ${num(y)})`;
  }

  // Pipe table content for a `table` stimulus.
  function table(headers, rows) {
    return [headers, ...rows].map((row) => row.map(label).join(" | ")).join("\n");
  }

  return { MINUS, gcd, approx, formatNumber, num, paren, label, answerKey, frac, sup, poly, lin, signed, point, table };
});
