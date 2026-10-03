// Identity of the item a student sees, independent of its seed, template,
// answer key, explanation, and choice order. Keep this separate from the
// fixed-bank contentIdentity: that identity protects historical grading and
// must notice changes to the key, feedback, and ordered choices too.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalQuestionIdentity = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().filter((key) => value[key] !== undefined)
        .map((key) => [key, canonical(value[key])]));
    }
    return value === undefined ? null : value;
  }

  function visibleIdentity(question) {
    // Missing snapshots cannot establish equivalence. In particular, do not
    // give every historical record lacking its displayed stem one identity.
    if (!question || typeof question.stem !== "string" || !question.stem.trim()) return null;
    const stimulus = question.stimulus;
    const figure = question.figure;
    const value = {
      responseType: question.responseType,
      stem: question.stem,
      choices: Array.isArray(question.choices)
        ? question.choices.map((choice) => JSON.stringify(canonical(choice))).sort() : null,
      stimulus: stimulus ? { type: stimulus.type, content: stimulus.content } : null,
      figure: figure ? { svg: figure.svg, alt: figure.alt, notToScale: Boolean(figure.notToScale) } : null,
      calculatorPolicy: question.calculatorPolicy,
    };
    // Exact text preserves signs, exponents, table rows, and SVG coordinates;
    // no prose tokenization or numeric stripping may merge different items.
    const text = JSON.stringify(canonical(value));
    let hash = 0xcbf29ce484222325n;
    for (let index = 0; index < text.length; index += 1) {
      hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 0x100000001b3n);
    }
    return `vi1-${hash.toString(16).padStart(16, "0")}`;
  }

  function isVisibleIdentity(value) {
    return typeof value === "string" && /^vi1-[0-9a-f]{16}$/.test(value);
  }

  return { visibleIdentity, isVisibleIdentity };
});
