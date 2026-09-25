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

  /* ------------------------------------------------------------ word forms */

  // Thousands separators, as the test prints them: grouped(12500) -> "12,500",
  // grouped(-6400) -> "−6,400", grouped(1234.5) -> "1,234.5". Four-digit
  // numbers are grouped too ("1,120 milliliters"), except that callers print
  // years with num().
  function grouped(value) {
    const [whole, part] = formatNumber(Math.abs(value)).split(".");
    const body = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${value < 0 ? MINUS : ""}${body}${part ? `.${part}` : ""}`;
  }

  // A count and its noun in agreement: plural(1, "hour") -> "1 hour",
  // plural(3, "hour") -> "3 hours", plural(1200, "person", "people") ->
  // "1,200 people". Only exactly 1 takes the singular ("1.5 hours").
  function plural(count, one, many = `${one}s`) {
    return `${grouped(count)} ${count === 1 ? one : many}`;
  }

  // Dollars as the test prints them: money(96) -> "$96", money(0.8) ->
  // "$0.80", money(1250.5) -> "$1,250.50". Cents always show two digits;
  // whole-dollar amounts show none. Amounts round to the cent.
  function money(value) {
    const cents = Math.round(Math.abs(value) * 100);
    const dollars = Math.floor(cents / 100);
    const rest = cents % 100;
    const sign = value < 0 && cents ? MINUS : "";
    return `${sign}$${grouped(dollars)}${rest ? `.${String(rest).padStart(2, "0")}` : ""}`;
  }

  // "a" or "an" for the word or number that follows, by how it is read
  // aloud: article(80) -> "an" ("an 80% increase"), article(18) -> "an",
  // article(1.8) -> "a", article("hour") -> "an", article("unit") -> "a".
  function article(next) {
    const text = String(next).replace(MINUS, "-").trim();
    if (/^\d/.test(text)) {
      // The leading group of the whole part is what is said first:
      // 8, 11, 18, 80-89 and 800-899 start with a vowel sound.
      const whole = text.split(".")[0].replace(/\D/g, "");
      const lead = Number(whole.slice(0, ((whole.length - 1) % 3) + 1));
      return lead === 8 || lead === 11 || lead === 18 || (lead >= 80 && lead <= 89) ||
        (lead >= 800 && lead <= 899) ? "an" : "a";
    }
    const word = text.toLowerCase();
    if (/^(hour|honest|honor|heir)/.test(word)) return "an";
    if (/^(uni|use|usu|uti|one|once|eu|ewe)/.test(word)) return "a";
    return /^[aeiou]/.test(word) ? "an" : "a";
  }

  return {
    MINUS, gcd, approx, formatNumber, num, paren, label, answerKey, frac, sup, poly, lin, signed, point, table,
    grouped, plural, money, article,
  };
});
