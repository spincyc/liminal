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

  // Estimated boxes of a figure's text labels (about 0.56 em per character),
  // for checking that labels neither overprint nor leave the drawing.
  function textBoxes(parts) {
    const out = [];
    const pattern = /<text x="([-\d.]+)" y="([-\d.]+)"([^>]*)>(.*?)<\/text>/g;
    let match;
    const markup = parts.join("");
    while ((match = pattern.exec(markup))) {
      const size = Number((/font-size="([\d.]+)"/.exec(match[3]) || [0, 16])[1]);
      const anchor = (/text-anchor="(\w+)"/.exec(match[3]) || [0, "start"])[1];
      const width = 0.56 * size * [...match[4].replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "x")].length;
      const x = Number(match[1]);
      const x0 = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
      out.push({ x0, x1: x0 + width, y0: Number(match[2]) - 0.36 * size, y1: Number(match[2]) + 0.36 * size });
    }
    return out;
  }

  // True when two labels overlap or a label runs outside a width × height drawing.
  function labelsClash(parts, width, height) {
    const boxes = textBoxes(parts);
    return boxes.some((box, index) =>
      box.x0 < 2 || box.x1 > width - 2 || box.y0 < 2 || box.y1 > height - 2 ||
      boxes.slice(index + 1).some((other) =>
        Math.min(box.x1, other.x1) - Math.max(box.x0, other.x0) > 1 &&
        Math.min(box.y1, other.y1) - Math.max(box.y0, other.y0) > 1));
  }

  const DOMAIN = "Geometry and Trigonometry";

  // Screen direction `degrees` counterclockwise from east.
  const heading = (degrees) => [Math.cos(toRad(degrees)), -Math.sin(toRad(degrees))];

  const round4 = (value) => Math.round(value * 10000) / 10000;

  function segHard(p, q, width = 2) {
    return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round"/>`;
  }

  const fitsGridHard = (value) =>
    Number.isFinite(value) && S.answerKey(round4(value)).replace("-", "").length <= 5;

  /* ------------------------------------------------------------ key rank */

  // Chooses three wrong answers so that the key's rank among four numeric
  // choices is spread over smallest to largest. When every wrong answer is a
  // near miss on one side, the key sits in the middle and a blind "pick an
  // inner value" strategy beats chance. `candidates` are [value, reason]
  // pairs in trap order (strongest first); `show` turns a value into choice
  // text (null drops it); the first `keep` candidates are always offered.
  // Returns [text, reason] pairs, or null (so `retry` draws again) when a
  // modelled mistake lands on the key or no rank can be filled.
  function spreadRank(t, key, candidates, { keep = 0, show = (value) => value } = {}) {
    const keyText = String(show(key));
    const pool = [];
    const seen = new Set();
    for (const [index, [value, reason]] of candidates.entries()) {
      const text = Number.isFinite(value) ? show(value) : null;
      if (text === null || text === undefined) {
        if (index < keep) return null;
        continue;
      }
      if (String(text) === keyText) return null;
      if (seen.has(String(text))) continue;
      seen.add(String(text));
      pool.push({ value, reason, text, kept: index < keep });
    }
    const below = pool.filter((entry) => entry.value < key);
    const above = pool.filter((entry) => entry.value > key);
    const keptBelow = below.filter((entry) => entry.kept).length;
    const keptAbove = above.filter((entry) => entry.kept).length;
    const ranks = [0, 1, 2, 3].filter((rank) =>
      rank >= keptBelow && 3 - rank >= keptAbove && below.length >= rank && above.length >= 3 - rank);
    if (!ranks.length) return null;
    const rank = t.pick(ranks);
    const take = (side, count) => side.filter((entry) => entry.kept)
      .concat(side.filter((entry) => !entry.kept)).slice(0, count);
    const chosen = new Set([...take(below, rank), ...take(above, 3 - rank)]);
    return pool.filter((entry) => chosen.has(entry)).map((entry) => [entry.text, entry.reason]);
  }

  // The number a printed choice stands for: "1,024", "−3.5", "7/3", "4√3",
  // "√5", "−√3/2", "12π", "5π/3", "π/2", "40%". NaN for anything else
  // (equations, points, words), so rank spreading leaves those alone.
  function choiceValue(choice) {
    if (typeof choice === "number") return choice;
    const text = String(choice).replace(/,/g, "").replace(/%$/, "").trim();
    // A sum or difference of terms, such as "18π − 36".
    const terms = text.split(/ (?=[+−] )/);
    if (terms.length > 1) {
      return terms.reduce((total, term) => {
        const signed = term.replace(/^\+ /, "").replace(/^− /, "−");
        return total + choiceValue(signed);
      }, 0);
    }
    const match = /^([−-]?)(\d+(?:\.\d+)?)?(√\d+)?(π)?(?:\/(\d+(?:\.\d+)?))?$/.exec(text);
    if (!match || (!match[2] && !match[3] && !match[4])) return NaN;
    const [, sign, coefficient, root, pi, denominator] = match;
    const base = coefficient === undefined ? 1 : Number(coefficient);
    const extra = (root ? Math.sqrt(Number(root.slice(1))) : 1) * (pi ? Math.PI : 1);
    return (sign ? -1 : 1) * base * extra / (denominator === undefined ? 1 : Number(denominator));
  }

  // Three wrong choices from [choice, reason] candidates (numbers or printed
  // text, strongest trap first), chosen so the key's rank among the four
  // values is spread (see spreadRank). The first `keep` are always offered
  // (a not-to-scale lure). Numbers with more than two decimals are not
  // printed; with `whole`, a whole-number key gets whole-number wrong
  // answers when three remain, so a decimal cannot be eliminated on sight.
  // Returns null, so the caller draws again, when a modelled mistake prints
  // the same as the key or no rank can be filled; choices that are not
  // numbers keep their order.
  function spreadWrong(t, correct, candidates, { keep = 0, whole = false, positive = false } = {}) {
    const keyText = S.label(correct);
    const pool = [];
    const seen = new Set([keyText]);
    for (const [index, [value, reason]] of candidates.entries()) {
      const usable = value !== null && value !== undefined &&
        (typeof value !== "number" || (Number.isFinite(value) && isClean(value, 2) && (!positive || value > 0))) &&
        !S.BAD_TEXT.test(S.label(value));
      if (!usable) {
        if (index < keep) return null;
        continue;
      }
      const text = S.label(value);
      if (text === keyText) return null;
      if (seen.has(text)) continue;
      seen.add(text);
      pool.push({ value, reason, number: choiceValue(value), kept: index < keep });
    }
    const key = choiceValue(correct);
    if (whole && Number.isInteger(key)) {
      // Only plain decimals are dropped; a radical or a multiple of π is a
      // form the test prints, not a giveaway.
      const plainDecimal = (entry) => !/[√π/]/.test(S.label(entry.value)) && !Number.isInteger(entry.number);
      const integral = pool.filter((entry) => entry.kept || !plainDecimal(entry));
      if (integral.length >= 3) pool.splice(0, pool.length, ...integral);
    }
    if (!Number.isFinite(key) || pool.some((entry) => !Number.isFinite(entry.number))) {
      return pool.length >= 3 ? pool.slice(0, 3).map((entry) => [entry.value, entry.reason]) : null;
    }
    const chosen = spreadRank(t, key, pool.map((entry) => [entry.number, entry]), {
      keep,
      show: (number) => {
        const entry = pool.find((item) => item.number === number);
        return entry ? S.label(entry.value) : S.label(number);
      },
    });
    return chosen ? chosen.map(([, entry]) => [entry.value, entry.reason]) : null;
  }

  // The families gate's look-alike test for two numbers (check 13,
  // tools/lib/tells.js): a negation, a reciprocal, a factor of 2, or two
  // positives adding to 90, 100, 180 or 360.
  function lookAlikeNumbers(a, b) {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
    if (a !== 0 && near(a, -b)) return true;
    if (!near(a, b) && near(a * b, 1)) return true;
    if (a !== 0 && b !== 0 && (near(a, 2 * b) || near(b, 2 * a))) return true;
    return a > 0 && b > 0 && [90, 100, 180, 360].some((whole) => near(a + b, whole));
  }

  // Slips that halve, double, negate or complement the key look alike with
  // it. Offering all of them makes the key the choice the look-alike pairs
  // meet at, so a student who guesses within pairs gains; this keeps the
  // first such slip in a `share` of the items and none in the rest. The first
  // `keep` candidates (a not-to-scale lure) always stay. Candidates are
  // [choice, reason], the choice a number or printed text (read with
  // choiceValue); a dropped slip becomes null, which wrongFor skips.
  // In the items without a slip on the key, a look-alike pair among the
  // wrong answers (when the list has one) moves to the front, so pairs sit
  // off the key about as often as on it.
  function balanceTwins(t, key, candidates, keep = 0, share = 0.5) {
    const keyValue = choiceValue(key);
    const allowOne = t.chance(share);
    let used = false;
    const out = candidates.map(([choice, reason], index) => {
      if (index < keep || choice === null || choice === undefined) return [choice, reason];
      if (!lookAlikeNumbers(choiceValue(choice), keyValue)) return [choice, reason];
      if (allowOne && !used) {
        used = true;
        return [choice, reason];
      }
      return [null, reason];
    });
    if (used) return out;
    const value = (entry) => (entry[0] === null || entry[0] === undefined ? NaN : choiceValue(entry[0]));
    for (let i = keep; i < out.length; i += 1) {
      for (let j = i + 1; j < out.length; j += 1) {
        if (lookAlikeNumbers(value(out[i]), value(out[j]))) {
          const pair = [out[i], out[j]];
          const rest = out.filter((entry, index) => index >= keep && index !== i && index !== j);
          return out.slice(0, keep).concat(pair, rest);
        }
      }
    }
    return out;
  }

  // True when a modelled mistake prints the same as the key: the draw must
  // be redone, since dropping it would silently lose a trap (or leave a
  // rationale calling the key wrong).
  const collides = (correct, candidates) => candidates.some(([value]) =>
    value !== null && value !== undefined && S.label(value) === S.label(correct));

  // Wrong answers for an item that is multiple choice or a grid-in: the
  // spread list, [] for a grid-in whose list cannot be spread (it offers no
  // choices), or null when the draw must be redone.
  function wrongFor(t, numeric, correct, candidates, options = {}) {
    if (collides(correct, candidates)) return null;
    const wrong = spreadWrong(t, correct, candidates, options);
    if (wrong) return wrong;
    return numeric ? [] : null;
  }

  // pack() with the wrong answers spread around the key; null when a
  // modelled mistake lands on the key, for numeric items too.
  function packSpread(t, numeric, keyValue, keyText, candidates, fields, options = {}) {
    const wrong = spreadWrong(t, keyText, candidates, options);
    if (!wrong && (!numeric || collides(keyText, candidates))) return null;
    if (numeric && !fitsGrid(keyValue)) return null;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      correct: numeric ? keyValue : keyText,
      wrong: wrong || [],
      ...fields,
    };
  }

  return {
    P, GEO, tidy, isClean, fitsGrid, fmt, shown, range, retry, pack, fractionValue, radical, surd,
    surdValue, piFraction, add,
    sub, mul, unit, lerp, mid, dist, dot, toRad, toDeg, centroid, close, angleAt, shoelace,
    fitPoints, r1, seg, measure, unitText, name, nameAway, anchorFor, normalAway, sideLabel, angleArc,
    angleLabel, rightMark, DOMAIN, heading, round4, segHard, fitsGridHard, spreadRank,
    choiceValue, spreadWrong, packSpread, collides, wrongFor, textBoxes, labelsClash, lookAlikeNumbers, balanceTwins,
  };
});
