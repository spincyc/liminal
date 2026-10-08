/* Small deterministic helpers shared only by classroom courses. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LiminalCourseMath = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function hash(text) {
    let value = 2166136261;
    for (const char of String(text)) {
      value ^= char.codePointAt(0);
      value = Math.imul(value, 16777619);
    }
    return (value >>> 0).toString(36);
  }
  function random(seed) {
    let state = parseInt(hash(seed), 36) >>> 0;
    function next() {
      state = (state + 0x6D2B79F5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    }
    function int(min, max) {
      if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min || max - min > 4294967294) {
        throw new Error("Invalid random integer range");
      }
      return min + Math.floor(next() * (max - min + 1));
    }
    function pick(values) {
      if (!Array.isArray(values) || !values.length) throw new Error("Cannot select from an empty list");
      return values[int(0, values.length - 1)];
    }
    function shuffle(values) {
      const result = values.slice();
      for (let i = result.length - 1; i > 0; i -= 1) {
        const j = int(0, i);
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    }
    function nonzero(min, max) {
      if (min === 0 && max === 0) throw new Error("Range has no nonzero integer");
      if (min > 0 || max < 0) return int(min, max);
      const n = int(min, max - 1);
      return n >= 0 ? n + 1 : n;
    }
    return { int, pick, shuffle, nonzero, sign: () => pick([-1, 1]), next };
  }
  function gcd(a, b) {
    if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) throw new Error("Expected safe integers");
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const rest = a % b; a = b; b = rest; }
    return a;
  }
  function fraction(numerator, denominator) {
    if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator === 0) {
      throw new Error("Invalid fraction");
    }
    const factor = gcd(numerator, denominator);
    let n = numerator / factor;
    let d = denominator / factor;
    if (d < 0) { n = -n; d = -d; }
    const sign = n < 0 ? "−" : "";
    return sign + Math.abs(n) + (d === 1 ? "" : "/" + d);
  }
  return { hash, random, gcd, fraction };
});
