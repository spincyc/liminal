(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/math/geometry-and-trigonometry"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers used by two or more Geometry and Trigonometry skill files.

  const { MINUS } = S;

  const P = S.svgParts;

  const GEO = "Geometry and Trigonometry";

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

  // "3/8" or "−5/2" or "4" back to a number.
  function fractionValue(text) {
    const [top, bottom] = String(text).replace(MINUS, "-").split("/");
    return Number(top) / (bottom === undefined ? 1 : Number(bottom));
  }

  // Simplified square root of a positive integer: a number when it is a
  // perfect square, otherwise a display string such as "2√5".
  function radical(value) {
    let outside = 1;
    let inside = value;
    for (let factor = 2; factor * factor <= inside; factor += 1) {
      while (inside % (factor * factor) === 0) {
        inside /= factor * factor;
        outside *= factor;
      }
    }
    if (inside === 1) return outside;
    return `${outside === 1 ? "" : outside}√${inside}`;
  }

  // A length whose square is a whole number as the test prints it: 14,
  // 7√3, √5, or −4√3 for a signed coordinate. Null otherwise, so a wrong
  // answer a test would not print drops out of the choices.
  function surd(value) {
    if (!Number.isFinite(value) || Math.abs(value) < 1e-9) return null;
    const square = value * value;
    if (Math.abs(square - Math.round(square)) > 1e-6) return null;
    const text = radical(Math.round(square));
    const body = typeof text === "number" ? fmt(text) : text;
    return value < 0 ? `${MINUS}${body}` : body;
  }

  // "−4√3", "√5", "12", or "1,024" back to a number.
  function surdValue(text) {
    const clean = String(text).replace(MINUS, "-").replace(/,/g, "");
    const match = /^(-?)(\d*)√(\d+)$/.exec(clean);
    if (!match) return Number(clean);
    return (match[1] ? -1 : 1) * (match[2] ? Number(match[2]) : 1) * Math.sqrt(Number(match[3]));
  }

  // Multiple of π: piFraction(5, 3) -> "5π/3", piFraction(1, 2) -> "π/2",
  // piFraction(-2, 3) -> "−2π/3".
  function piFraction(numerator, denominator = 1) {
    const divisor = S.gcd(numerator, denominator);
    const top = numerator / divisor;
    const bottom = denominator / divisor;
    const head = top === 1 ? "π" : top === -1 ? `${MINUS}π` : `${fmt(top)}π`;
    return bottom === 1 ? head : `${head}/${bottom}`;
  }

  /* ------------------------------------------------------------- plane kit */

  //
  // Points are [x, y]. Constructions use ordinary coordinates (y up) and are
  // mapped into the figure by `fitPoints`; verify() routines measure those
  // constructions rather than re-running the formula that built the item.

  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];

  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];

  const mul = (p, s) => [p[0] * s, p[1] * s];

  const len = (p) => Math.hypot(p[0], p[1]);

  const unit = (p) => mul(p, 1 / len(p));

  const lerp = (p, q, s) => add(p, mul(sub(q, p), s));

  const mid = (p, q) => lerp(p, q, 0.5);

  const dist = (p, q) => len(sub(p, q));

  const dot = (p, q) => p[0] * q[0] + p[1] * q[1];

  const cross = (p, q) => p[0] * q[1] - p[1] * q[0];

  const toRad = (degrees) => (degrees * Math.PI) / 180;

  const toDeg = (radians) => (radians * 180) / Math.PI;

  const centroid = (points) => mul(points.reduce(add, [0, 0]), 1 / points.length);

  const close = (a, b, tolerance = 1e-6) =>
    Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));

  // Angle at `vertex` between the rays toward p and q, in degrees.
  function angleAt(vertex, p, q) {
    const a = sub(p, vertex);
    const b = sub(q, vertex);
    const cosine = dot(a, b) / (len(a) * len(b));
    return toDeg(Math.acos(Math.max(-1, Math.min(1, cosine))));
  }

  function shoelace(points) {
    let twice = 0;
    points.forEach((point, index) => {
      twice += cross(point, points[(index + 1) % points.length]);
    });
    return Math.abs(twice) / 2;
  }

  // Maps ordinary coordinates (y up) into a width × height box, keeping
  // proportions and centering the drawing.
  function fitPoints(points, width = 400, height = 270, margin = 44) {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const spanX = Math.max(...xs) - minX || 1;
    const spanY = Math.max(...ys) - minY || 1;
    const scale = Math.min((width - 2 * margin) / spanX, (height - 2 * margin) / spanY);
    const offX = (width - spanX * scale) / 2;
    const offY = (height - spanY * scale) / 2;
    return (p) => [offX + (p[0] - minX) * scale, height - offY - (p[1] - minY) * scale];
  }

  /* --------------------------------------------------------- figure extras */

  const r1 = (value) => Math.round(value * 10) / 10;

  function seg(p, q, width = 2, dashed = false) {
    return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round"${dashed ? ' stroke-dasharray="6 5"' : ""}/>`;
  }

  // Upright label for measures; lowercase letters (variables) are italic.
  function measure(p, content, anchor = "middle", size = 15) {
    const body = String(content)
      .split(/([a-z])/)
      .map((part, index) => (index % 2 ? `<tspan font-style="italic">${part}</tspan>` : S.escapeXml(part)))
      .join("");
    return `<text x="${r1(p[0])}" y="${r1(p[1])}" fill="currentColor" font-size="${size}" font-family="serif" text-anchor="${anchor}" dominant-baseline="middle">${body}</text>`;
  }

  // Upright label with nothing italicized, for a length with units ("40 cm").
  function unitText(p, content, anchor = "middle", size = 15) {
    return `<text x="${r1(p[0])}" y="${r1(p[1])}" fill="currentColor" font-size="${size}" font-family="serif" text-anchor="${anchor}" dominant-baseline="middle">${S.escapeXml(content)}</text>`;
  }

  const name = (p, letter) => P.text(p[0], p[1], letter);

  const nameAway = (p, from, letter, gap = 15) => name(add(p, mul(unit(sub(p, from)), gap)), letter);

  const anchorFor = (u) => (u[0] > 0.35 ? "start" : u[0] < -0.35 ? "end" : "middle");

  // Unit normal to segment pq on the side away from `away`.
  function normalAway(p, q, away) {
    const u = unit(sub(q, p));
    const n = [-u[1], u[0]];
    return dot(n, sub(away, mid(p, q))) > 0 ? mul(n, -1) : n;
  }

  function sideLabel(p, q, away, text, gap = 13) {
    const n = normalAway(p, q, away);
    return measure(add(mid(p, q), mul(n, gap)), text, anchorFor(n));
  }

  // Arc marking the angle at `vertex` between the rays toward p and q.
  function angleArc(vertex, p, q, radius = 16) {
    const u = unit(sub(p, vertex));
    const v = unit(sub(q, vertex));
    const a = add(vertex, mul(u, radius));
    const b = add(vertex, mul(v, radius));
    const sweep = cross(u, v) > 0 ? 1 : 0;
    return `<path d="M ${r1(a[0])} ${r1(a[1])} A ${radius} ${radius} 0 0 ${sweep} ${r1(b[0])} ${r1(b[1])}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
  }

  const bisector = (vertex, p, q) => unit(add(unit(sub(p, vertex)), unit(sub(q, vertex))));

  // Label on the bisector of the angle at `vertex`, deep enough that a
  // narrow angle still holds it.
  function angleLabel(vertex, p, q, text, gap = 30, size = 15) {
    const b = bisector(vertex, p, q);
    const angle = angleAt(vertex, p, q);
    if (angle < 75 && Math.abs(b[0]) < 0.8) {
      const halfWidth = 0.3 * size * String(text).length;
      const depth = Math.max(gap, (halfWidth + 4) / Math.tan(toRad(angle / 2)));
      return measure(add(vertex, mul(b, depth)), text, "middle", size);
    }
    return measure(add(vertex, mul(b, gap)), text, anchorFor(b), size);
  }

  function rightMark(vertex, p, q, size = 12) {
    const u = unit(sub(p, vertex));
    const v = unit(sub(q, vertex));
    return P.rightAngle(vertex[0], vertex[1], u[0], u[1], v[0], v[1], size);
  }

  const DOMAIN = "Geometry and Trigonometry";

  // Screen direction `degrees` counterclockwise from east.
  const heading = (degrees) => [Math.cos(toRad(degrees)), -Math.sin(toRad(degrees))];

  const round4 = (value) => Math.round(value * 10000) / 10000;

  function segHard(p, q, width = 2) {
    return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round"/>`;
  }

  // Keeps wrong answers that are finite, at most two decimals, and distinct
  // from the key and from each other, in order. When the key is a whole
  // number, decimal wrong answers (easy to eliminate on sight) are dropped
  // if enough whole ones remain; the list's first entry, the figure-based
  // lure in every list that has one, is always kept when it is present.
  function distinctWrong(correct, list) {
    const seen = new Set([S.label(correct)]);
    const out = [];
    list.forEach(([value, reason], position) => {
      if (value === null || value === undefined) return;
      if (typeof value === "number" &&
        (!Number.isFinite(value) || Math.abs(value * 100 - Math.round(value * 100)) > 1e-7)) return;
      const text = S.label(value);
      if (seen.has(text) || S.BAD_TEXT.test(text)) return;
      seen.add(text);
      out.push([value, reason, position]);
    });
    if (typeof correct === "number" && Number.isInteger(correct)) {
      const whole = out.filter(([value, , position]) =>
        position === 0 || typeof value !== "number" || Number.isInteger(value));
      if (whole.length >= 3) return whole;
    }
    return out;
  }

  const fitsGridHard = (value) =>
    Number.isFinite(value) && S.answerKey(round4(value)).replace("-", "").length <= 5;

  return {
    P, GEO, tidy, isClean, fitsGrid, fmt, shown, range, retry, pack, fractionValue, radical, surd,
    surdValue, piFraction, add,
    sub, mul, unit, lerp, mid, dist, dot, toRad, toDeg, centroid, close, angleAt, shoelace,
    fitPoints, r1, seg, measure, unitText, name, nameAway, anchorFor, normalAway, sideLabel, angleArc,
    angleLabel, rightMark, DOMAIN, heading, round4, segHard, distinctWrong, fitsGridHard,
  };
});
