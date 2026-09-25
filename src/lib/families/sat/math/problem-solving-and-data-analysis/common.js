(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/math/problem-solving-and-data-analysis"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers used by two or more Problem-Solving and Data Analysis skill files.

  const { MINUS, num } = S;

  const DATA = "Problem-Solving and Data Analysis";

  /* ------------------------------------------------------------ arithmetic */

  // Removes binary noise so exact decimal results compare equal.
  const tidy = (value) => Math.round(value * 1e9) / 1e9;

  // Finite, with at most `places` decimal places.
  function isClean(value, places) {
    if (!Number.isFinite(value)) return false;
    const scaled = value * 10 ** places;
    return Math.abs(scaled - Math.round(scaled)) < 1e-6;
  }

  // A student-produced key: terminating, at most five characters.
  const fitsGrid = (value) => isClean(value, 3) && S.formatNumber(tidy(Math.abs(value))).length <= 5;

  // Thousands separators, as the test prints them: 12500 -> "12,500".
  function fmt(value) {
    const v = tidy(value);
    const [whole, part] = S.formatNumber(Math.abs(v)).split(".");
    const grouped = whole.length > 3 ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : whole;
    return `${v < 0 ? MINUS : ""}${grouped}${part ? `.${part}` : ""}`;
  }

  // A positive wrong value as choice text, or null when a test would not
  // print it (not positive, or more than `places` decimals).
  const shown = (value, places = 2) =>
    (Number.isFinite(value) && value > 0 && isClean(value, places) ? fmt(value) : null);

  const sum = (list) => list.reduce((total, value) => total + value, 0);

  const range = (low, high) => Array.from({ length: high - low + 1 }, (_, index) => low + index);

  // Draws parameters until every constraint holds. Deterministic, because
  // the tools are seeded.
  function retry(attempt) {
    for (let tries = 0; tries < 20000; tries += 1) {
      const result = attempt();
      if (result) return result;
    }
    throw new Error("no parameters met the constraints");
  }

  // Wrong answers whose text differs from the key and from each other, in
  // the order given (strongest trap first); null texts are skipped.
  function offer(keyText, candidates) {
    const seen = new Set([keyText]);
    return candidates.filter(([text]) => {
      if (typeof text !== "string" || !text || S.BAD_TEXT.test(text) || seen.has(text)) return false;
      seen.add(text);
      return true;
    });
  }

  // Finishes an item, or returns null (so `retry` draws again) when multiple
  // choice has fewer than three distinct wrong answers or a numeric key does
  // not fit the answer grid.
  function pack(numeric, keyValue, keyText, candidates, fields) {
    const wrong = offer(keyText, candidates);
    if (!numeric && wrong.length < 3) return null;
    if (numeric && !fitsGrid(keyValue)) return null;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      correct: numeric ? keyValue : keyText,
      wrong,
      ...fields,
    };
  }

  // Parses a pipe table back into cells, so verify() reads what the student reads.
  const parseTable = (content) => content.split("\n").map((row) => row.split(" | ").map((cell) => cell.trim()));

  const parseNumber = (text) => Number(String(text).replace(/,/g, "").replace(MINUS, "-"));

  // "3/8" or "−5/2" or "4" back to a number.
  function fractionValue(text) {
    const [top, bottom] = String(text).replace(MINUS, "-").split("/");
    return Number(top) / (bottom === undefined ? 1 : Number(bottom));
  }

  const close = (a, b, tolerance = 1e-6) =>
    Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));

  /* --------------------------------------------------------- figure extras */

  const r1 = (value) => Math.round(value * 10) / 10;

  function seg(p, q, width = 2, dashed = false) {
    return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round"${dashed ? ' stroke-dasharray="6 5"' : ""}/>`;
  }

  /* ------------------------------------------------------------ chart kit */

  function chartText(x, y, content, anchor = "middle", size = 13, rotate = 0) {
    const turn = rotate ? ` transform="rotate(${rotate} ${r1(x)} ${r1(y)})"` : "";
    return `<text x="${r1(x)}" y="${r1(y)}" fill="currentColor" font-size="${size}" font-family="sans-serif" text-anchor="${anchor}" dominant-baseline="middle"${turn}>${S.escapeXml(content)}</text>`;
  }

  const dataDot = (x, y, radius) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${radius}" fill="currentColor"/>`;

  const DOMAIN = "Problem-Solving and Data Analysis";

  // "14.5", or "about 14.33" when the decimal does not terminate early.
  const about = (value) => (isClean(value, 2) ? num(tidy(value)) : `about ${num(Math.round(value * 100) / 100)}`);

  // Distractors whose displayed text differs from the key and from each
  // other, in the order given (strongest trap first).
  function offerHard(keyText, candidates) {
    const seen = new Set([keyText]);
    return candidates.filter(([text]) => {
      if (typeof text !== "string" || seen.has(text)) return false;
      seen.add(text);
      return true;
    });
  }

  const finish = (numeric, fields) => ({ responseType: numeric ? "numeric" : "multiple-choice", ...fields });

  return {
    DATA, tidy, isClean, fitsGrid, fmt, shown, sum, range, retry, pack, parseTable, parseNumber,
    fractionValue, close, r1, seg, chartText, dataDot, DOMAIN, about, offerHard, finish,
  };
});
