// Seeded randomness for question templates: one stream per template and seed,
// so a (template, seed) pair always builds the same question.
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

  /* ------------------------------------------------------------ randomness */

  function hashString(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function rng(seed) {
    let state = hashString(String(seed)) || 1;
    return function random() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  function tools(random) {
    const int = (low, high) => low + Math.floor(random() * (high - low + 1));
    const pick = (list) => list[Math.floor(random() * list.length)];
    const shuffle = (list) => {
      const copy = list.slice();
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const other = Math.floor(random() * (index + 1));
        [copy[index], copy[other]] = [copy[other], copy[index]];
      }
      return copy;
    };
    return {
      random,
      int,
      pick,
      shuffle,
      sign: () => (random() < 0.5 ? -1 : 1),
      chance: (probability) => random() < probability,
      nonzero: (low, high) => {
        let value = 0;
        while (value === 0) value = int(low, high);
        return value;
      },
      // n distinct entries of `list`, in random order.
      sample: (list, count) => shuffle(list).slice(0, count),
    };
  }

  return { hashString, rng, tools };
});
