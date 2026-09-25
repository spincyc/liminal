// A set of question templates as one number.
//
// Every template in a section's registry (content/templates/<section>.json)
// owns a permanent bit. A practice run is the set of its templates' bits, so
// "at most one question per template" holds by construction, a run reduces to
// a single number, and history is the union of runs. Masks are BigInts, since
// a section has more templates than a 53-bit number holds; their text form is
// base 36. Loads in Node and as a plain browser script
// (window.LiminalTemplateMask).
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalTemplateMask = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const EMPTY = BigInt(0);
  const ONE = BigInt(1);
  const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

  function bit(index) {
    if (!Number.isInteger(index) || index < 0) throw new RangeError(`Invalid template bit ${index}`);
    return ONE << BigInt(index);
  }

  function has(mask, index) {
    return (mask & bit(index)) !== EMPTY;
  }

  function add(mask, index) {
    return mask | bit(index);
  }

  function union(left, right) {
    return left | right;
  }

  function fromBits(indexes) {
    return indexes.reduce((mask, index) => add(mask, index), EMPTY);
  }

  // Set bit positions, lowest first.
  function bits(mask) {
    const result = [];
    let rest = mask;
    let index = 0;
    while (rest > EMPTY) {
      if ((rest & ONE) === ONE) result.push(index);
      rest >>= ONE;
      index += 1;
    }
    return result;
  }

  function size(mask) {
    let count = 0;
    let rest = mask;
    while (rest > EMPTY) {
      rest &= rest - ONE;
      count += 1;
    }
    return count;
  }

  function toCode(mask) {
    return mask.toString(36);
  }

  function fromCode(code) {
    const text = String(code || "0").trim().toLowerCase();
    if (!/^[0-9a-z]+$/.test(text)) throw new SyntaxError(`Invalid template code "${code}"`);
    let mask = EMPTY;
    const base = BigInt(36);
    for (const character of text) mask = mask * base + BigInt(DIGITS.indexOf(character));
    return mask;
  }

  return { EMPTY, add, bits, fromBits, fromCode, has, size, toCode, union };
});
