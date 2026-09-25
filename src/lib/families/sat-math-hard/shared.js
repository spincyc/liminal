// Shared helpers for the SAT Math Hard families.
//
// Dependency-free and loadable two ways: `require("./shared")` in Node, or a
// plain <script> tag in the browser, where it becomes
// `window.SAT_MATH_HARD_SHARED`. Keeping it browser-loadable is what lets the
// app draw fresh repetitions on demand instead of exhausting a fixed bank.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SAT_MATH_HARD_SHARED = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Every rendered minus sign is U+2212, matching the existing SAT Math bank.
  // Numeric answer keys stay ASCII because core.js compares typed responses.
  const MINUS = "−";

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

  /* --------------------------------------------------------------- figures */
  //
  // Figures are inline SVG strings drawn in `currentColor`, so they follow the
  // app's light and dark themes. A figure is { svg, alt, notToScale }. When
  // notToScale is true the app prints "Note: Figure not drawn to scale." under
  // it, as the real test does, and the drawing deliberately suggests a wrong
  // answer that appears among the choices.

  function escapeXml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const round1 = (value) => Math.round(value * 10) / 10;

  const svgParts = {
    line: (x1, y1, x2, y2, extra = "") =>
      `<line x1="${round1(x1)}" y1="${round1(y1)}" x2="${round1(x2)}" y2="${round1(y2)}" stroke="currentColor" stroke-width="2"${extra}/>`,
    dashed: (x1, y1, x2, y2) =>
      svgParts.line(x1, y1, x2, y2, ' stroke-dasharray="6 5"'),
    polygon: (points) =>
      `<polygon points="${points.map(([x, y]) => `${round1(x)},${round1(y)}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    circle: (cx, cy, r) =>
      `<circle cx="${round1(cx)}" cy="${round1(cy)}" r="${round1(r)}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    dot: (cx, cy) =>
      `<circle cx="${round1(cx)}" cy="${round1(cy)}" r="3.5" fill="currentColor"/>`,
    text: (x, y, content, anchor = "middle") =>
      `<text x="${round1(x)}" y="${round1(y)}" fill="currentColor" font-size="16" font-family="serif" font-style="italic" text-anchor="${anchor}" dominant-baseline="middle">${escapeXml(content)}</text>`,
    // Small square marking a right angle at vertex (x, y), with arms along
    // unit vectors (ux, uy) and (vx, vy).
    rightAngle: (x, y, ux, uy, vx, vy, size = 12) => {
      const a = [x + ux * size, y + uy * size];
      const b = [x + (ux + vx) * size, y + (uy + vy) * size];
      const c = [x + vx * size, y + vy * size];
      return `<polyline points="${round1(a[0])},${round1(a[1])} ${round1(b[0])},${round1(b[1])} ${round1(c[0])},${round1(c[1])}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },
    // Arc of radius r centred at (cx, cy) from angle a1 to a2 (degrees,
    // counterclockwise, measured with y pointing up).
    arc: (cx, cy, r, a1, a2) => {
      const toPoint = (angle) => [
        cx + r * Math.cos((angle * Math.PI) / 180),
        cy - r * Math.sin((angle * Math.PI) / 180),
      ];
      const [x1, y1] = toPoint(a1);
      const [x2, y2] = toPoint(a2);
      const large = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
      return `<path d="M ${round1(x1)} ${round1(y1)} A ${round1(r)} ${round1(r)} 0 ${large} 0 ${round1(x2)} ${round1(y2)}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },
  };

  function svg(width, height, parts, alt) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(alt)}">${parts.join("")}</svg>`;
  }

  /* ----------------------------------------------------------- instantiate */

  const BAD_TEXT = /undefined|NaN|Infinity|\[object /;

  // Turns one family plus a seed into a question record shaped like the
  // canonical bank schema (content/schema.md), minus the bank-level fields
  // (id, provenance, contentVersion, reviewStatus) that the bank generator owns.
  function instantiate(family, seed) {
    const random = rng(`${family.id}|${seed}`);
    const t = tools(random);
    const raw = family.build(t);
    const record = {
      familyId: family.id,
      seed: String(seed),
      test: "SAT",
      section: "Math",
      sectionKey: "sat-math",
      domain: family.domain,
      skill: family.skill,
      subskill: family.subskill,
      difficulty: "Hard",
      responseType: raw.responseType,
      stimulus: raw.stimulus || null,
      figure: raw.figure || null,
      stem: raw.stem,
      hint: raw.hint,
      explanation: raw.explanation,
      solutionSteps: raw.steps,
      principles: raw.principles,
      strategy: raw.strategy || family.recognize,
      trap: raw.trap,
      estimatedSeconds: raw.estimatedSeconds || 105,
      calculatorPolicy: "allowed",
      format: raw.figure ? "figure" : raw.stimulus ? raw.stimulus.type : "standard",
      tags: ["hard-family", `family:${family.id}`].concat(raw.tags || []),
      verified: Boolean(raw.verify()),
    };
    if (raw.responseType === "numeric") {
      return { ...record, choices: null, correctAnswer: answerKey(raw.correct), distractorRationales: null };
    }
    const correctText = label(raw.correct);
    const seen = new Set([correctText]);
    const wrong = [];
    for (const [value, reason] of raw.wrong || []) {
      const text = label(value);
      if (seen.has(text) || BAD_TEXT.test(text)) continue;
      seen.add(text);
      wrong.push({ text, reason });
      if (wrong.length === 3) break;
    }
    if (wrong.length < 3) {
      throw new Error(`${family.id} seed ${seed}: only ${wrong.length} distinct distractors`);
    }
    const options = t.shuffle([{ text: correctText, correct: true }, ...wrong]);
    return {
      ...record,
      choices: options.map((option) => option.text),
      correctAnswer: options.findIndex((option) => option.correct),
      distractorRationales: options
        .map((option, index) => (option.correct ? null : { index, reason: option.reason }))
        .filter(Boolean),
    };
  }

  return {
    MINUS,
    hashString,
    rng,
    tools,
    gcd,
    approx,
    formatNumber,
    num,
    paren,
    label,
    answerKey,
    frac,
    sup,
    poly,
    lin,
    signed,
    point,
    table,
    escapeXml,
    svg,
    svgParts,
    instantiate,
    BAD_TEXT,
  };
});
