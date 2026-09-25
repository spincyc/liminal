(function (root, factory) {
  const shared = typeof module === "object" && module.exports
    ? require("./shared")
    : root.SAT_MATH_HARD_SHARED;
  const families = factory(shared);
  if (typeof module === "object" && module.exports) module.exports = families;
  else root.SAT_MATH_HARD_FAMILIES = (root.SAT_MATH_HARD_FAMILIES || []).concat(families);
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  const { MINUS, num } = S;
  const P = S.svgParts;
  const DOMAIN = "Geometry and Trigonometry";

  /* ------------------------------------------------------------- plane kit */
  //
  // Points are [x, y]. Figures use screen coordinates (y grows downward);
  // verify() routines build their own figures in ordinary coordinates and
  // measure them, so an answer is checked against a construction rather
  // than against the formula that produced it.

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
  // Screen direction `degrees` counterclockwise from east.
  const heading = (degrees) => [Math.cos(toRad(degrees)), -Math.sin(toRad(degrees))];
  const round4 = (value) => Math.round(value * 10000) / 10000;
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

  // Length of a circular arc measured as a fine polyline, and the area of a
  // sector measured as a polygon fan: independent of s = rθ and A = r²θ/2.
  function polylineArc(radius, turn, pieces = 4000) {
    let total = 0;
    let previous = [radius, 0];
    for (let index = 1; index <= pieces; index += 1) {
      const angle = (turn * index) / pieces;
      const next = [radius * Math.cos(angle), radius * Math.sin(angle)];
      total += dist(previous, next);
      previous = next;
    }
    return total;
  }

  function polygonSector(radius, turn, pieces = 4000) {
    const points = [[0, 0]];
    for (let index = 0; index <= pieces; index += 1) {
      const angle = (turn * index) / pieces;
      points.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
    }
    return shoelace(points);
  }

  /* --------------------------------------------------------- figure extras */
  //
  // shared.js draws lines, polygons, circles, dots, italic text, right-angle
  // marks, and thin arcs. These add what test figures also use: upright
  // measures with italic variables, congruence ticks, parallel arrows, angle
  // arcs between two rays, and shaded sectors.

  const r1 = (value) => Math.round(value * 10) / 10;

  function seg(p, q, width = 2) {
    return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round"/>`;
  }

  function polyline(points, width = 1.5) {
    return `<polyline points="${points.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }

  // Upright label for measures; lowercase letters (variables) are italic.
  function measure(p, content, anchor = "middle", size = 15) {
    const body = String(content)
      .split(/([a-z])/)
      .map((part, index) => (index % 2 ? `<tspan font-style="italic">${part}</tspan>` : S.escapeXml(part)))
      .join("");
    return `<text x="${r1(p[0])}" y="${r1(p[1])}" fill="currentColor" font-size="${size}" font-family="serif" text-anchor="${anchor}" dominant-baseline="middle">${body}</text>`;
  }

  const name = (p, letter) => P.text(p[0], p[1], letter);
  const nameAway = (p, from, letter, gap = 15) => name(add(p, mul(unit(sub(p, from)), gap)), letter);
  const dotAt = (p) => P.dot(p[0], p[1]);
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

  // Congruence tick marks across segment pq.
  function ticks(p, q, count = 1, at = 0.5) {
    const u = unit(sub(q, p));
    const n = [-u[1], u[0]];
    const center = lerp(p, q, at);
    const out = [];
    for (let index = 0; index < count; index += 1) {
      const c = add(center, mul(u, (index - (count - 1) / 2) * 5));
      out.push(seg(add(c, mul(n, 6)), add(c, mul(n, -6)), 1.5));
    }
    return out.join("");
  }

  // Parallel-line arrowheads on segment pq, pointing from p toward q.
  function arrows(p, q, count = 1, at = 0.5) {
    const u = unit(sub(q, p));
    const n = [-u[1], u[0]];
    const center = lerp(p, q, at);
    const out = [];
    for (let index = 0; index < count; index += 1) {
      const tip = add(center, mul(u, 4 + index * 7));
      const back = add(tip, mul(u, -7));
      out.push(polyline([add(back, mul(n, 5)), tip, add(back, mul(n, -5))], 1.8));
    }
    return out.join("");
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

  function angleLabel(vertex, p, q, text, gap = 30, size = 15) {
    const b = bisector(vertex, p, q);
    return measure(add(vertex, mul(b, gap)), text, anchorFor(b), size);
  }

  function rightMark(vertex, p, q, size = 12) {
    const u = unit(sub(p, vertex));
    const v = unit(sub(q, vertex));
    return P.rightAngle(vertex[0], vertex[1], u[0], u[1], v[0], v[1], size);
  }

  /* ------------------------------------------------------------- notation */

  // "(3x + 15)°", or "4x°" when there is no constant.
  const degExpr = (a, b) => (b === 0 ? `${S.lin(a, 0)}°` : `(${S.lin(a, b)})°`);

  // Multiple of π: piText(5, 3) -> "5π/3", piText(1, 2) -> "π/2".
  function piText(numerator, denominator = 1) {
    const divisor = S.gcd(numerator, denominator);
    const top = numerator / divisor;
    const bottom = denominator / divisor;
    const head = top === 1 ? "π" : `${num(top)}π`;
    return bottom === 1 ? head : `${head}/${bottom}`;
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

  // Keeps wrong answers that are finite, at most two decimals, and distinct
  // from the key and from each other, in order. When the key is a whole
  // number, decimal wrong answers (easy to eliminate on sight) are dropped
  // if enough whole ones remain; the first entry, the figure-based lure in
  // every list that has one, is always kept.
  function distinctWrong(correct, list) {
    const seen = new Set([S.label(correct)]);
    const out = [];
    list.forEach(([value, reason]) => {
      if (value === null || value === undefined) return;
      if (typeof value === "number" &&
        (!Number.isFinite(value) || Math.abs(value * 100 - Math.round(value * 100)) > 1e-7)) return;
      const text = S.label(value);
      if (seen.has(text) || S.BAD_TEXT.test(text)) return;
      seen.add(text);
      out.push([value, reason]);
    });
    if (typeof correct === "number" && Number.isInteger(correct)) {
      const whole = out.filter(([value], index) =>
        index === 0 || typeof value !== "number" || Number.isInteger(value));
      if (whole.length >= 3) return whole;
    }
    return out;
  }

  const fitsGrid = (value) =>
    Number.isFinite(value) && S.answerKey(round4(value)).replace("-", "").length <= 5;

  /* ================================================ 1. similar triangles */

  const TRIANGLE_NAMES = [
    ["A", "B", "C", "D", "E"],
    ["P", "Q", "R", "S", "T"],
    ["J", "K", "L", "M", "N"],
    ["R", "S", "T", "U", "V"],
  ];
  const PART_RATIOS = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5], [5, 3]];

  // Apex X at the top, base YZ at the bottom, M on XY and N on XZ drawn at
  // the midpoints, so MN reads as a midsegment whatever the true ratio is.
  function cutFigure(t, names, onLeft, shown) {
    const [X, Y, Z, M, N] = names;
    const A = [t.int(150, 250), 40];
    const B = [t.int(34, 70), 244];
    const C = [t.int(330, 366), 244];
    const f = t.pick([0.48, 0.5, 0.52]);
    const D = lerp(A, B, f);
    const E = lerp(A, C, f);
    const G = centroid([A, B, C]);
    const parts = [
      P.polygon([A, B, C]),
      seg(D, E),
      arrows(D, E, 1, 0.72),
      arrows(B, C, 1, 0.72),
      nameAway(A, G, X),
      nameAway(B, G, Y),
      nameAway(C, G, Z),
      name(add(D, mul(normalAway(A, B, G), 15)), M),
      name(add(E, mul(normalAway(A, C, G), 15)), N),
    ];
    const words = [];
    const nearSeg = onLeft ? [A, D, X + M] : [A, E, X + N];
    const farSeg = onLeft ? [D, B, M + Y] : [E, C, N + Z];
    if (shown.near !== undefined) {
      parts.push(sideLabel(nearSeg[0], nearSeg[1], G, num(shown.near)));
      words.push(`${nearSeg[2]} = ${num(shown.near)}`);
    }
    if (shown.far !== undefined) {
      parts.push(sideLabel(farSeg[0], farSeg[1], G, num(shown.far)));
      words.push(`${farSeg[2]} = ${num(shown.far)}`);
    }
    if (shown.cut !== undefined) {
      parts.push(measure(add(mid(D, E), [0, -12]), num(shown.cut)));
      words.push(`${M}${N} = ${num(shown.cut)}`);
    }
    if (shown.base !== undefined) {
      parts.push(measure(add(mid(B, C), [0, 18]), num(shown.base)));
      words.push(`${Y}${Z} = ${num(shown.base)}`);
    }
    const alt =
      `Triangle ${X}${Y}${Z} with ${X} at the top and ${Y}${Z} as the base. ${M} is on side ${X}${Y}, ` +
      `${N} is on side ${X}${Z}, and arrow marks show ${M}${N} parallel to ${Y}${Z}.` +
      `${words.length ? ` Labeled lengths: ${words.join(", ")}.` : ""} ` +
      `${M} and ${N} are drawn at the midpoints of their sides, so ${M}${N} looks like half of ${Y}${Z}.`;
    return { svg: S.svg(400, 280, parts, alt), alt, notToScale: true };
  }

  // Builds a real triangle whose side through the cut has length `side`,
  // base `base`, and a 64° base angle; cuts it parallel to the base at
  // distance `near` from the apex; measures the cut and the areas.
  function parallelCut(side, base, near) {
    const Yp = [0, 0];
    const Zp = [base, 0];
    const Xp = [side * Math.cos(toRad(64)), side * Math.sin(toRad(64))];
    const Mp = add(Xp, mul(unit(sub(Yp, Xp)), near));
    const s = (Xp[1] - Mp[1]) / (Xp[1] - Zp[1]);
    const Np = lerp(Xp, Zp, s);
    return {
      cut: dist(Mp, Np),
      small: shoelace([Xp, Mp, Np]),
      whole: shoelace([Xp, Yp, Zp]),
    };
  }

  const similarTriangles = {
    id: "similar-triangles-parallel",
    domain: DOMAIN,
    skill: "Lines, angles, and triangles",
    subskill: "similarity",
    title: "Parallel cut in a triangle: part versus whole side",
    recognize:
      "A segment parallel to one side cuts off a smaller triangle similar to the whole. The scale factor " +
      "compares a part of a side with the whole side, areas scale by its square, and apparent midpoints in a " +
      "figure not drawn to scale mean nothing.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["not-to-scale-figure", "part-vs-whole", "neighbouring-rule", "intermediate-value"],
    build(t) {
      for (;;) {
        const names = t.pick(TRIANGLE_NAMES);
        const [X, Y, Z, M, N] = names;
        const [p, q] = t.pick(PART_RATIOS);
        const onLeft = t.chance(0.5);
        const u = t.int(1, 4);
        const m = t.int(2, 6);
        const w = p === 1 ? t.int(2, 6) : t.int(1, 5);
        const form = t.pick(["base", "base", "cut", "part", "part", "area", "area", "ratio"]);
        const numeric = form !== "ratio" && t.chance(0.34);
        const inText = (form === "base" || form === "cut" || form === "part") && t.chance(0.3);

        const near = p * u;
        const far = q * u;
        const whole = (p + q) * u;
        const cut = p * m;
        const base = (p + q) * m;
        const nearName = onLeft ? X + M : X + N;
        const farName = onLeft ? M + Y : N + Z;
        const wholeName = onLeft ? X + Y : X + Z;
        const cutName = M + N;
        const baseName = Y + Z;
        const small = `triangle ${X}${M}${N}`;
        const big = `triangle ${X}${Y}${Z}`;
        const quad = `quadrilateral ${M}${Y}${Z}${N}`;
        const k = S.frac(near, whole);

        const intro = t.pick([
          `In triangle ${X}${Y}${Z} shown, points ${M} and ${N} lie on sides ${X}${Y} and ${X}${Z}, respectively, and ${cutName} is parallel to ${baseName}.`,
          `In the figure shown, ${M} lies on ${X}${Y}, ${N} lies on ${X}${Z}, and segment ${cutName} is parallel to segment ${baseName}.`,
          `In the figure shown, segment ${cutName} is parallel to segment ${baseName}.`,
        ]);
        const similarStep =
          `Because ${cutName} ∥ ${baseName}, the triangles share angle ${X} and have equal corresponding angles, ` +
          `so ${small} is similar to ${big}.`;
        const wholeStep =
          `The whole side is ${wholeName} = ${near} + ${far} = ${whole}, so the small-to-large scale factor is ` +
          `${nearName}/${wholeName} = ${k}.`;
        const principles = [
          "A line parallel to one side of a triangle cuts off a triangle similar to the original.",
          "Similar triangles compare a part of a side with the whole side, never with the remaining part.",
        ];
        const common = {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 110,
          hint: `Which two triangles in the figure have the same shape, and how long are their full sides?`,
          stimulus: null,
        };
        // Given lengths go on the figure, or into the stem with a bare figure.
        const ask = (givens, question) => {
          if (!inText) return { shown: Object.fromEntries(givens.map(([key, , value]) => [key, value])), text: `${intro} ${question}` };
          const list = givens.map(([, label, value]) => `${label} = ${value}`);
          const joined = `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
          return { shown: {}, text: `${intro} If ${joined}, ${question.charAt(0).toLowerCase()}${question.slice(1)}` };
        };

        if (form === "base") {
          const { shown, text } = ask(
            [["near", nearName, near], ["far", farName, far], ["cut", cutName, cut]],
            `What is the length of ${baseName}?`,
          );
          const wrong = distinctWrong(base, [
            [2 * cut, `Treats ${cutName} as a midsegment because ${M} and ${N} look like midpoints in the figure; the figure is not drawn to scale.`],
            [(cut * far) / near, `Uses ${nearName}/${farName}, a part-to-part ratio, as the scale factor instead of ${nearName}/${wholeName}.`],
            [cut + far, `Adds ${farName} to ${cutName}, as if the triangle grew by equal amounts instead of in proportion.`],
            [(cut * whole) / far, `Scales ${cutName} by ${wholeName}/${farName}, pairing it with the wrong part of the side.`],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            ...common,
            figure: cutFigure(t, names, onLeft, shown),
            stem: text,
            correct: base,
            wrong,
            explanation:
              `${similarStep} The scale factor compares ${nearName} with the whole side ${wholeName}, not with ${farName}: ` +
              `${nearName}/${wholeName} = ${near}/${whole} = ${k}. So ${baseName} = ${cut} ÷ ${k} = ${base}. The figure makes ` +
              `${cutName} look like a midsegment, but ${nearName} ≠ ${farName}, so ${baseName} is not twice ${cutName}.`,
            steps: [
              similarStep,
              wholeStep,
              `Corresponding sides share that factor: ${cutName}/${baseName} = ${k}.`,
              `So ${baseName} = ${cut} × ${S.frac(whole, near)} = ${base}.`,
            ],
            principles,
            trap:
              `The figure is not drawn to scale: ${M} and ${N} look like midpoints, which suggests ${baseName} = 2 × ${cut} = ${2 * cut}. ` +
              `Using ${nearName}/${farName} instead of ${nearName}/${wholeName} gives ${num((cut * far) / near)}.`,
            verify: () => close(parallelCut(near + far, base, near).cut, cut),
          };
        }

        if (form === "cut") {
          if (base % 2) continue;
          const { shown, text } = ask(
            [["near", nearName, near], ["far", farName, far], ["base", baseName, base]],
            `What is the length of ${cutName}?`,
          );
          const wrong = distinctWrong(cut, [
            [base / 2, `Takes ${cutName} as half of ${baseName} because ${M} and ${N} look like midpoints in the figure; the figure is not drawn to scale.`],
            [(base * near) / far, `Uses ${nearName}/${farName}, a part-to-part ratio, as the scale factor instead of ${nearName}/${wholeName}.`],
            [base - far, `Subtracts ${farName} from ${baseName}, shrinking by a fixed amount instead of by a ratio.`],
            [(base * far) / whole, `Uses ${farName}/${wholeName}, which pairs ${cutName} with the wrong part of side ${wholeName}.`],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            ...common,
            figure: cutFigure(t, names, onLeft, shown),
            stem: text,
            correct: cut,
            wrong,
            explanation:
              `${similarStep} The scale factor is ${nearName}/${wholeName} = ${near}/${whole} = ${k}, so ${cutName} = ${k} × ${base} = ${cut}. ` +
              `The figure is not drawn to scale; ${cutName} only looks like half of ${baseName}.`,
            steps: [similarStep, wholeStep, `Corresponding sides share that factor: ${cutName} = ${k} × ${baseName}.`, `${cutName} = ${k} × ${base} = ${cut}.`],
            principles,
            trap:
              `${cutName} looks like half of ${baseName} in a figure that is not drawn to scale, and ${nearName}/${farName} is not the ` +
              `scale factor because ${farName} is only part of a side.`,
            verify: () => close(parallelCut(near + far, base, near).cut, cut),
          };
        }

        if (form === "part") {
          if (u === m || q * m === p * u || q * m === whole) continue;
          const { shown, text } = ask(
            [["near", nearName, near], ["cut", cutName, cut], ["base", baseName, base]],
            `What is the length of ${farName}?`,
          );
          const factor = S.frac(cut, base);
          const cutPoint = onLeft ? M : N;
          const wrong = distinctWrong(far, [
            [near, `Takes ${cutPoint} as the midpoint of ${wholeName}, as it appears in the figure, so ${farName} = ${nearName}; the figure is not drawn to scale.`],
            [whole, `Finds the whole side ${wholeName} and stops; ${farName} is only the part below ${cutPoint}.`],
            [base - cut, `Takes ${farName} as ${baseName} − ${cutName}, as if the side grew by the same amount as the parallel segments instead of in proportion.`],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            ...common,
            figure: cutFigure(t, names, onLeft, shown),
            stem: text,
            correct: far,
            wrong,
            explanation:
              `${similarStep} The scale factor is ${cutName}/${baseName} = ${cut}/${base} = ${factor}, and it compares ${nearName} ` +
              `with the whole side ${wholeName}: ${wholeName} = ${near} ÷ ${factor} = ${whole}. So ${farName} = ${whole} − ${near} = ${far}.`,
            steps: [
              similarStep,
              `Scale factor from the parallel sides: ${cutName}/${baseName} = ${factor}.`,
              `${nearName} corresponds to the whole side: ${wholeName} = ${near} ÷ ${factor} = ${whole}.`,
              `Subtract the top part: ${farName} = ${whole} − ${near} = ${far}.`,
            ],
            principles,
            trap:
              `${cutPoint} looks like a midpoint in the figure, which is not drawn to scale; and setting ${farName}/${nearName} = ${baseName}/${cutName} ` +
              `gives ${whole}, which is the whole side ${wholeName}.`,
            verify: () => close(parallelCut(near + far, base, near).cut, cut),
          };
        }

        if (form === "area") {
          const smallArea = p * p * w;
          const bigArea = (p + q) * (p + q) * w;
          const quadArea = bigArea - smallArea;
          const askQuad = t.chance(0.6);
          const areaIntro = `${intro} The area of ${small} is ${smallArea}.`;
          const shown = { near, far };
          const figure = cutFigure(t, names, onLeft, shown);
          const kk = S.frac(near * near, whole * whole);
          const steps = [
            similarStep,
            wholeStep,
            `Areas scale by the square of the factor: area(${small})/area(${big}) = ${kk}.`,
            `area(${big}) = ${smallArea} ÷ ${kk} = ${bigArea}.`,
          ];
          if (askQuad) {
            const wrong = distinctWrong(quadArea, [
              [3 * smallArea, `Treats ${cutName} as a midsegment, as the figure suggests, so ${big} looks 4 times as large as ${small}; the figure is not drawn to scale.`],
              [bigArea, `Finds the area of ${big} and stops before subtracting ${small}.`],
              [p * q * w, `Scales the area by the length ratio ${wholeName}/${nearName} instead of its square.`],
              [q * q * w, `Scales by (${farName}/${nearName})², a part-to-part ratio of sides.`],
            ]);
            if (!numeric && wrong.length < 3) continue;
            return {
              ...common,
              figure,
              stem: `${areaIntro} What is the area of ${quad}?`,
              correct: quadArea,
              wrong,
              explanation:
                `${similarStep} The scale factor is ${nearName}/${wholeName} = ${k}, so the areas are in the ratio ${kk}. ` +
                `The area of ${big} is ${smallArea} ÷ ${kk} = ${bigArea}, and the quadrilateral is what remains: ${bigArea} − ${smallArea} = ${quadArea}.`,
              steps: steps.concat([`area(${quad}) = ${bigArea} − ${smallArea} = ${quadArea}.`]),
              principles: principles.concat(["Areas of similar figures are in the ratio of the square of the scale factor."]),
              trap:
                `The figure is not drawn to scale; reading ${cutName} as a midsegment gives ${3 * smallArea}. Scaling area by the length ratio, ` +
                `or stopping at the whole triangle, are the other reflexes.`,
              verify: () => {
                const g = parallelCut(near + far, 10, near);
                return close(((g.whole - g.small) * smallArea) / g.small, quadArea, 1e-9);
              },
            };
          }
          const wrong = distinctWrong(bigArea, [
            [4 * smallArea, `Treats ${cutName} as a midsegment, as the figure suggests, making ${big} 4 times as large; the figure is not drawn to scale.`],
            [p * (p + q) * w, `Scales the area by the length ratio ${wholeName}/${nearName} instead of its square.`],
            [quadArea, `Finds only the area of ${quad}, the part of ${big} below ${cutName}.`],
            [smallArea + q * q * w, `Adds a triangle scaled by (${farName}/${nearName})², treating the lower strip as similar to ${small}.`],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            ...common,
            figure,
            stem: `${areaIntro} What is the area of ${big}?`,
            correct: bigArea,
            wrong,
            explanation:
              `${similarStep} The scale factor is ${nearName}/${wholeName} = ${k}, so the areas are in the ratio ${kk}, and the area of ` +
              `${big} is ${smallArea} ÷ ${kk} = ${bigArea}.`,
            steps,
            principles: principles.concat(["Areas of similar figures are in the ratio of the square of the scale factor."]),
            trap:
              `The figure is not drawn to scale; reading ${cutName} as a midsegment gives ${4 * smallArea}, and scaling area by the length ` +
              `ratio instead of its square gives ${p * (p + q) * w}.`,
            verify: () => {
              const g = parallelCut(near + far, 10, near);
              return close((g.whole * smallArea) / g.small, bigArea, 1e-9);
            },
          };
        }

        // ratio: what fraction of an area the small triangle is.
        const toQuad = t.chance(0.45);
        const pp = p * p;
        const ww = (p + q) * (p + q);
        const correct = toQuad ? S.frac(pp, ww - pp) : S.frac(pp, ww);
        const wrong = distinctWrong(
          correct,
          toQuad
            ? [
              ["1/3", `Treats ${cutName} as a midsegment, as the figure suggests, so the quadrilateral looks 3 times the small triangle; the figure is not drawn to scale.`],
              [S.frac(pp, ww), `Compares ${small} with all of ${big} instead of with the quadrilateral.`],
              [S.frac(p, q), `Uses the part-to-part length ratio ${nearName}/${farName} as if it were an area ratio.`],
              [S.frac(pp, q * q), `Squares ${nearName}/${farName}, a ratio of two parts of a side rather than part to whole.`],
            ]
            : [
              ["1/4", `Treats ${cutName} as a midsegment, as the figure suggests, so the small triangle looks like a quarter of the large one; the figure is not drawn to scale.`],
              [S.frac(p, p + q), `Uses the length ratio ${nearName}/${wholeName} without squaring it for area.`],
              [S.frac(pp, ww - pp), `Compares ${small} with ${quad} instead of with the whole triangle.`],
              [S.frac(pp, q * q), `Squares ${nearName}/${farName}, a ratio of two parts of a side rather than part to whole.`],
            ],
        );
        if (wrong.length < 3) continue;
        const target = toQuad ? quad : big;
        return {
          ...common,
          responseType: "multiple-choice",
          figure: cutFigure(t, names, onLeft, { near, far }),
          stem: `${intro} The area of ${small} is what fraction of the area of ${target}?`,
          correct,
          wrong,
          explanation:
            `${similarStep} The scale factor is ${nearName}/${wholeName} = ${k}, so area(${small})/area(${big}) = (${k})² = ${S.frac(pp, ww)}. ` +
            (toQuad
              ? `Take ${pp} parts for the small triangle and ${ww} for the whole; the quadrilateral holds ${ww} − ${pp} = ${ww - pp} parts, so the fraction is ${correct}.`
              : `That is the requested fraction, ${correct}.`),
          steps: [
            similarStep,
            wholeStep,
            `Square the factor for areas: (${k})² = ${S.frac(pp, ww)}.`,
            toQuad ? `The quadrilateral is the rest: ${ww - pp} parts of ${ww}, so the fraction is ${pp}/${ww - pp} = ${correct}.` : `The fraction is ${correct}.`,
          ],
          principles: principles.concat(["Areas of similar figures are in the ratio of the square of the scale factor."]),
          trap: `The figure is not drawn to scale, so the midsegment reading (${toQuad ? "1/3" : "1/4"}) is wrong, and a length ratio is not an area ratio.`,
          verify: () => {
            const g = parallelCut(near + far, 10, near);
            const value = toQuad ? g.small / (g.whole - g.small) : g.small / g.whole;
            return close(value, toQuad ? pp / (ww - pp) : pp / ww, 1e-9);
          },
        };
      }
    },
  };

  /* ============================================ 2. angle chase, not to scale */

  // At each intersection of line t with a horizontal line, the four angles
  // are named by the rays that bound them.
  const QUAD_RAYS = { UR: ["right", "up"], UL: ["left", "up"], LL: ["left", "down"], LR: ["right", "down"] };
  const QUAD_WORDS = {
    UR: "above the line and to the right of t",
    UL: "above the line and to the left of t",
    LL: "below the line and to the left of t",
    LR: "below the line and to the right of t",
  };
  const OPPOSITE = { UR: "LL", LL: "UR", UL: "LR", LR: "UL" };
  // UR and LL measure φ (t's inclination); UL and LR measure 180 − φ.
  const quadMeasure = (quad, phi) => (quad === "UR" || quad === "LL" ? phi : 180 - phi);
  const PAIRS = [
    { top: "LR", bot: "UR", rel: "supp", kind: "same-side interior" },
    { top: "LL", bot: "UL", rel: "supp", kind: "same-side interior" },
    { top: "UR", bot: "LR", rel: "supp", kind: "same-side exterior" },
    { top: "UL", bot: "LL", rel: "supp", kind: "same-side exterior" },
    { top: "LR", bot: "UL", rel: "equal", kind: "alternate interior" },
    { top: "LL", bot: "UR", rel: "equal", kind: "alternate interior" },
    { top: "UR", bot: "LL", rel: "equal", kind: "alternate exterior" },
    { top: "UL", bot: "LR", rel: "equal", kind: "alternate exterior" },
    { top: "UR", bot: "UR", rel: "equal", kind: "corresponding" },
    { top: "LL", bot: "LL", rel: "equal", kind: "corresponding" },
    { top: "UL", bot: "UL", rel: "equal", kind: "corresponding" },
    { top: "LR", bot: "LR", rel: "equal", kind: "corresponding" },
  ];

  // Parallel lines ℓ (top) and m, with t drawn within a few degrees of
  // perpendicular so every angle looks like a right angle.
  function transversalFigure(t, marks) {
    const yl = 86;
    const ym = 196;
    const phiDrawn = 90 + t.pick([-1, 1]) * t.int(3, 6);
    const up = heading(phiDrawn);
    const T1 = [t.int(180, 220), yl];
    const T2 = add(T1, mul(up, -(ym - yl) / Math.sin(toRad(phiDrawn))));
    const rays = { right: [1, 0], left: [-1, 0], up, down: mul(up, -1) };
    const topEnd = add(T1, mul(up, 62));
    const parts = [
      seg([14, yl], [386, yl]),
      seg([14, ym], [386, ym]),
      seg(topEnd, add(T2, mul(up, -62))),
      arrows([14, yl], [386, yl], 1, 0.12),
      arrows([14, ym], [386, ym], 1, 0.12),
      P.text(376, yl - 14, "ℓ"),
      P.text(376, ym - 14, "m"),
      P.text(topEnd[0] + 13, topEnd[1] + 4, "t"),
    ];
    marks.forEach(({ at, quad, text }) => {
      const vertex = at === "top" ? T1 : T2;
      const [first, second] = QUAD_RAYS[quad];
      const p = add(vertex, rays[first]);
      const q = add(vertex, rays[second]);
      parts.push(angleArc(vertex, p, q, 15));
      parts.push(angleLabel(vertex, p, q, text, 28));
    });
    const described = marks
      .map(({ at, quad, text }) => `at line ${at === "top" ? "ℓ" : "m"}, the angle ${QUAD_WORDS[quad]} is labeled ${text}`)
      .join("; ");
    const alt =
      `Horizontal lines ℓ (top) and m (bottom), marked parallel with arrows, are crossed by line t, which is drawn ` +
      `almost perpendicular to them, so every angle at the two intersections looks like a right angle. ${described.charAt(0).toUpperCase()}${described.slice(1)}.`;
    return { svg: S.svg(400, 270, parts, alt), alt, notToScale: true };
  }

  function transversalItem(t, numeric) {
    for (;;) {
      const phi = t.chance(0.5) ? t.int(38, 76) : t.int(104, 142);
      const pair = t.chance(0.6) ? t.pick(PAIRS.slice(0, 4)) : t.pick(PAIRS.slice(4));
      const th1 = quadMeasure(pair.top, phi);
      const th2 = quadMeasure(pair.bot, phi);
      const x = t.int(6, 24);
      const a1 = t.int(2, 7);
      const a2 = t.int(2, 7);
      if (a1 === a2) continue;
      const b1 = th1 - a1 * x;
      const b2 = th2 - a2 * x;
      if (!b1 || !b2 || Math.abs(b1) > 60 || Math.abs(b2) > 60) continue;
      const supp = pair.rel === "supp";
      const e1 = degExpr(a1, b1);
      const e2 = degExpr(a2, b2);
      const xSwap = supp ? (b2 - b1) / (a1 - a2) : (180 - b1 - b2) / (a1 + a2);
      // The swapped relationship must give a whole x and real angles to be a
      // believable wrong answer.
      const swapOk = Number.isInteger(xSwap) && xSwap >= 2 &&
        [a1 * xSwap + b1, a2 * xSwap + b2].every((value) => value > 5 && value < 175);
      if (!numeric && !swapOk) continue;
      const askY = t.chance(0.45);
      const intro = t.pick([
        "In the figure shown, line ℓ is parallel to line m.",
        "In the figure shown, lines ℓ and m are parallel, and line t intersects both of them.",
      ]);
      const relationText = supp
        ? `The angles labeled ${e1} and ${e2} are ${pair.kind} angles, so they are supplementary, even though the figure makes them look equal.`
        : `The angles labeled ${e1} and ${e2} are ${pair.kind} angles, so they are equal.`;
      const equation = supp ? `${S.lin(a1 + a2, b1 + b2)} = 180` : `${S.lin(a1, b1)} = ${S.lin(a2, b2)}`;
      const solveStep = `${supp ? `${S.lin(a1, b1)} + ${S.lin(a2, b2)} = 180` : equation}, so x = ${x}.`;
      const geometry = (quad) => {
        const upRay = [Math.cos(toRad(phi)), Math.sin(toRad(phi))];
        const rays = { right: [1, 0], left: [-1, 0], up: upRay, down: mul(upRay, -1) };
        return angleAt([0, 0], rays[QUAD_RAYS[quad][0]], rays[QUAD_RAYS[quad][1]]);
      };
      const common = {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 110,
        stimulus: null,
        hint: "Which labeled angles are guaranteed equal by the parallel lines, and which only look equal?",
        principles: [
          "When a line crosses two parallel lines, corresponding, alternate interior, and alternate exterior angles are equal.",
          "Same-side interior angles, and same-side exterior angles, are supplementary.",
          "A figure marked not drawn to scale can make angles look right or equal when they are not.",
        ],
      };

      if (!askY) {
        const xFig = (90 - b1) / a1;
        if (!Number.isInteger(xFig) || xFig <= 0) continue;
        const wrong = distinctWrong(x, [
          [xFig, `Sets ${e1} equal to 90 because line t looks perpendicular to ℓ and m in the figure; the figure is not drawn to scale.`],
          [swapOk ? xSwap : null, supp
            ? `Sets the two labeled angles equal, but ${pair.kind} angles are supplementary.`
            : `Makes the two labeled angles add to 180°, but ${pair.kind} angles are equal.`],
          [th1, `Gives the measure of the angle labeled ${e1}, not the value of x.`],
          [supp && Number.isInteger((90 - b1 - b2) / (a1 + a2)) ? (90 - b1 - b2) / (a1 + a2) : null,
            `Makes the two labeled angles complementary (sum 90°) instead of supplementary.`],
        ]).filter(([value]) => typeof value !== "number" || value > 0);
        if (!numeric && wrong.length < 3) continue;
        return {
          ...common,
          figure: transversalFigure(t, [{ at: "top", quad: pair.top, text: e1 }, { at: "bot", quad: pair.bot, text: e2 }]),
          stem: `${intro} What is the value of x?`,
          correct: x,
          wrong,
          explanation:
            `${relationText} ${solveStep} Each angle then measures ${th1}° and ${th2}°; line t only looks perpendicular because ` +
            `the figure is not drawn to scale.`,
          steps: [
            `Locate the labeled angles: one is ${QUAD_WORDS[pair.top].replace("the line", "ℓ")}, the other ${QUAD_WORDS[pair.bot].replace("the line", "m")}.`,
            `They are ${pair.kind} angles, so they are ${supp ? "supplementary" : "equal"}.`,
            `Write the equation: ${supp ? `(${S.lin(a1, b1)}) + (${S.lin(a2, b2)}) = 180` : equation}.`,
            `Solve: x = ${x}.`,
          ],
          trap:
            `Line t looks perpendicular in the figure, which is not drawn to scale, so both angles look like 90°. ` +
            `${supp ? "Setting them equal" : "Making them add to 180°"} uses the wrong relationship.`,
          verify: () => close(a1 * x + b1, geometry(pair.top)) && close(a2 * x + b2, geometry(pair.bot)),
        };
      }

      // Third angle y at one of the intersections.
      const atTop = t.chance(0.5);
      const own = atTop ? pair.top : pair.bot;
      const q3 = t.pick(["UR", "UL", "LL", "LR"].filter((quad) => quad !== own));
      const y = quadMeasure(q3, phi);
      const vertical = OPPOSITE[own] === q3;
      const ownExpr = atTop ? e1 : e2;
      const ownValue = atTop ? th1 : th2;
      let ySwap = null;
      if (swapOk) {
        const swapped = atTop ? a1 * xSwap + b1 : a2 * xSwap + b2;
        const candidate = vertical ? swapped : 180 - swapped;
        if (swapped > 0 && swapped < 180 && candidate > 0 && candidate < 180) ySwap = candidate;
      }
      const wrong = distinctWrong(y, [
        [90, "Reads the angle marked y° as a right angle because line t looks perpendicular in the figure; the figure is not drawn to scale."],
        [ySwap, supp
          ? `Sets the two labeled angles equal instead of supplementary, then carries the wrong x through to y.`
          : `Makes the two labeled angles add to 180° instead of setting them equal, then carries the wrong x through to y.`],
        [180 - y, `Gives the supplement of y; the angle marked y° and the angle labeled ${ownExpr} ${vertical ? "are vertical angles" : "form a linear pair"}.`],
        [x, "Gives the value of x instead of y."],
      ]);
      if (!numeric && wrong.length < 3) continue;
      const marks = [
        { at: "top", quad: pair.top, text: e1 },
        { at: "bot", quad: pair.bot, text: e2 },
        { at: atTop ? "top" : "bot", quad: q3, text: "y°" },
      ];
      return {
        ...common,
        figure: transversalFigure(t, marks),
        stem: `${intro} What is the value of y?`,
        correct: y,
        wrong,
        explanation:
          `${relationText} ${solveStep} The angle labeled ${ownExpr} measures ${ownValue}°. The angle marked y° ` +
          `${vertical ? `is vertical to it, so y = ${ownValue}` : `forms a linear pair with it, so y = 180 − ${ownValue} = ${y}`}. ` +
          `The figure is not drawn to scale; no angle here is a right angle.`,
        steps: [
          `The labeled angles are ${pair.kind} angles, so they are ${supp ? "supplementary" : "equal"}.`,
          solveStep,
          `The angle labeled ${ownExpr} measures ${ownValue}°.`,
          vertical ? `y° is vertical to it: y = ${ownValue}.` : `y° forms a linear pair with it: y = 180 − ${ownValue} = ${y}.`,
        ],
        trap: "Line t looks perpendicular in the figure, which is not drawn to scale, so y looks like 90.",
        verify: () =>
          close(a1 * x + b1, geometry(pair.top)) && close(a2 * x + b2, geometry(pair.bot)) && close(y, geometry(q3)),
      };
    }
  }

  const ISO_NAMES = [["A", "B", "C", "D"], ["P", "Q", "R", "S"], ["J", "K", "L", "M"]];

  // Isosceles triangle (apex top) with the base extended past the right
  // vertex; drawn so the apex looks right-angled or the triangle equilateral.
  function isoscelesFigure(t, look, names, apexText, extText) {
    const [A, B, C, D] = names;
    const baseY = 214;
    const w = look === "right" ? t.int(92, 100) : t.int(78, 86);
    const height = w * Math.tan(toRad(look === "right" ? 45 + t.pick([-2, -1, 1, 2]) : 60 + t.pick([-1, 0, 1])));
    const Bp = [t.int(44, 66), baseY];
    const Cp = [Bp[0] + 2 * w, baseY];
    const Ap = [Bp[0] + w, baseY - height];
    const Dp = [Cp[0] + 88, baseY];
    const parts = [
      seg(Ap, Bp),
      seg(Ap, Cp),
      seg(Bp, Dp),
      ticks(Ap, Bp),
      ticks(Ap, Cp),
      angleArc(Ap, Bp, Cp, 18),
      measure(add(Ap, [0, look === "right" ? 44 : 60]), apexText, "middle", 14),
      angleArc(Cp, Ap, Dp, 16),
      angleLabel(Cp, Ap, Dp, extText, 30, 14),
      name(add(Ap, [0, -15]), A),
      name(add(Bp, [-10, 14]), B),
      name(add(Cp, [0, 17]), C),
      name(add(Dp, [0, 17]), D),
    ];
    const alt =
      `Triangle ${A}${B}${C} with ${A} at the top; tick marks show ${A}${B} = ${A}${C}. Side ${B}${C} is extended past ${C} to ${D}. ` +
      `Angle ${B}${A}${C} is labeled ${apexText} and exterior angle ${A}${C}${D} is labeled ${extText}. ` +
      (look === "right"
        ? `The triangle is drawn so that angle ${B}${A}${C} looks like a right angle.`
        : "The triangle is drawn so that it looks equilateral.");
    return { svg: S.svg(400, 250, parts, alt), alt, notToScale: true };
  }

  function isoscelesGeometry(apexDegrees) {
    const half = toRad(apexDegrees / 2);
    const A = [0, 10];
    const B = [-10 * Math.tan(half), 0];
    const C = [10 * Math.tan(half), 0];
    const D = [C[0] + 5, 0];
    return { base: angleAt(B, A, C), ext: angleAt(C, A, D), equalSides: close(dist(A, B), dist(A, C)) };
  }

  function isoscelesItem(t, numeric) {
    for (;;) {
      const names = t.pick(ISO_NAMES);
      const [A, B, C, D] = names;
      const look = t.pick(["right", "equilateral"]);
      const apex = t.pick(look === "right"
        ? [36, 40, 44, 48, 52, 56, 64, 68, 112, 116, 120, 124, 128, 132]
        : [28, 32, 36, 40, 44, 84, 88, 92, 96, 100, 104, 108, 112, 116]);
      const baseAngle = 90 - apex / 2;
      const ext = 90 + apex / 2;
      const x = t.int(8, 30);
      const a = t.int(1, 4);
      const c = t.int(2, 6);
      if (2 * c === a) continue;
      const b = apex - a * x;
      const d = ext - c * x;
      if (!b || !d || Math.abs(b) > 70 || Math.abs(d) > 70) continue;
      const askX = t.chance(0.4);
      const apexText = degExpr(a, b);
      const extText = degExpr(c, d);
      const lookAngle = look === "right" ? 90 : 60;
      // Tick marks misread: angles A and B taken as the equal pair, so ACD = 2·A.
      const xMis = (2 * b - d) / (c - 2 * a);
      const baseMis = Number.isInteger(xMis) ? a * xMis + b : null;
      // ACD treated as supplementary to the apex angle.
      const xSup = (180 - b - d) / (a + c);
      const baseSup = Number.isInteger(xSup) ? 180 - (c * xSup + d) : null;
      const xFig = (lookAngle - b) / a;
      const statesEqual = t.chance(0.6);
      const intro = statesEqual
        ? `In the figure shown, ${A}${B} = ${A}${C}, and point ${D} lies on the extension of ${B}${C} beyond ${C}.`
        : `In the figure shown, points ${B}, ${C}, and ${D} lie on a line.`;
      const misReason = `Takes angles ${A} and ${B} as the equal pair; since ${A}${B} = ${A}${C}, the equal angles are at ${B} and ${C}.`;
      const supReason = `Treats angle ${A}${C}${D} as supplementary to angle ${B}${A}${C}; it is supplementary to angle ${A}${C}${B}.`;
      const common = {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 120,
        stimulus: null,
        hint: `Which two angles of the triangle do the tick marks make equal, and how is angle ${A}${C}${D} related to them?`,
        explanation:
          `Because ${A}${B} = ${A}${C}, the base angles at ${B} and ${C} are equal. Angle ${A}${C}${D} is supplementary to angle ${A}${C}${B}, ` +
          `so each base angle is 180 − (${S.lin(c, d)}). The exterior angle also equals the sum of the two remote interior angles: ` +
          `${S.lin(c, d)} = (${S.lin(a, b)}) + 180 − (${S.lin(c, d)}). This simplifies to ${S.lin(2 * c - a, 2 * d - b)} = 180, so x = ${x}. ` +
          `Then angle ${B}${A}${C} = ${apex}°, angle ${A}${C}${D} = ${ext}°, and angle ${A}${B}${C} = ${baseAngle}°. The figure is not drawn to scale: ` +
          (look === "right" ? `angle ${B}${A}${C} only looks like a right angle.` : "the triangle only looks equilateral."),
        steps: [
          `${A}${B} = ${A}${C}, so angle ${A}${B}${C} = angle ${A}${C}${B}; call each b.`,
          `Linear pair at ${C}: b = 180 − (${S.lin(c, d)}).`,
          `Exterior angle: ${S.lin(c, d)} = (${S.lin(a, b)}) + b, which gives ${S.lin(2 * c - a, 2 * d - b)} = 180.`,
          `x = ${x}, so angle ${A}${B}${C} = 180 − ${ext} = ${baseAngle}°.`,
        ],
        principles: [
          "Angles opposite congruent sides of a triangle are congruent.",
          "An exterior angle of a triangle equals the sum of the two remote interior angles and is supplementary to the adjacent interior angle.",
        ],
        trap:
          look === "right"
            ? `Angle ${B}${A}${C} looks like a right angle in the figure, which is not drawn to scale; it measures ${apex}°.`
            : `The triangle looks equilateral in the figure, which is not drawn to scale; its angles are ${apex}°, ${baseAngle}°, and ${baseAngle}°.`,
        figure: isoscelesFigure(t, look, names, apexText, extText),
      };
      const check = () => {
        const g = isoscelesGeometry(a * x + b);
        return g.equalSides && close(g.ext, c * x + d) && close(g.base, baseAngle);
      };
      if (askX) {
        if (!Number.isInteger(xFig) || xFig <= 0) continue;
        const wrong = distinctWrong(x, [
          [xFig, look === "right"
            ? `Sets ${apexText} equal to 90 because angle ${B}${A}${C} looks like a right angle in the figure; the figure is not drawn to scale.`
            : `Sets ${apexText} equal to 60 because the triangle looks equilateral in the figure; the figure is not drawn to scale.`],
          [Number.isInteger(xMis) && xMis > 0 ? xMis : null, misReason],
          [Number.isInteger(xSup) && xSup > 0 ? xSup : null, supReason],
          [baseAngle, `Gives the measure of angle ${A}${B}${C} instead of the value of x.`],
          [apex, `Gives the measure of angle ${B}${A}${C} instead of the value of x.`],
        ]);
        if (!numeric && wrong.length < 3) continue;
        return { ...common, stem: `${intro} What is the value of x?`, correct: x, wrong, verify: check };
      }
      const wrong = distinctWrong(baseAngle, [
        [look === "right" ? 45 : 60, look === "right"
          ? `Reads angle ${B}${A}${C} as a right angle, as the figure suggests, making each base angle 45°; the figure is not drawn to scale.`
          : "Treats the triangle as equilateral because it looks equilateral in the figure; the figure is not drawn to scale."],
        [baseMis !== null && baseMis > 0 && baseMis < 90 ? baseMis : null, misReason],
        [baseSup !== null && baseSup > 0 && baseSup < 90 ? baseSup : null, supReason],
        [apex, `Gives the measure of angle ${B}${A}${C}, the vertex angle, instead of angle ${A}${B}${C}.`],
        [x, "Gives the value of x instead of the angle's measure."],
        [ext, `Gives the measure of exterior angle ${A}${C}${D} instead of angle ${A}${B}${C}.`],
      ]);
      if (!numeric && wrong.length < 3) continue;
      return {
        ...common,
        stem: `${intro} What is the measure, in degrees, of angle ${A}${B}${C}?`,
        correct: baseAngle,
        wrong,
        verify: check,
      };
    }
  }

  const BEND_NAMES = [["Q", "P", "R"], ["A", "B", "C"], ["J", "K", "L"], ["E", "F", "G"]];

  // Parallel lines with a bend point between them, drawn so the angle at the
  // bend looks like a right angle and the two outer angles look equal.
  function bendFigure(t, names, labels) {
    const [Qn, Pn, Rn] = names;
    const yl = 52;
    const ym = 212;
    const alphaDrawn = t.int(42, 48);
    const betaDrawn = 90 - alphaDrawn + t.int(-2, 2);
    const qx = t.int(62, 100);
    const rx = t.int(62, 100);
    const ca = Math.cos(toRad(alphaDrawn));
    const sa = Math.sin(toRad(alphaDrawn));
    const cb = Math.cos(toRad(betaDrawn));
    const sb = Math.sin(toRad(betaDrawn));
    const det = ca * sb + cb * sa;
    const s = ((rx - qx) * sb + (ym - yl) * cb) / det;
    const flip = t.chance(0.5);
    const fx = (point) => (flip ? [400 - point[0], point[1]] : point);
    const Q = fx([qx, yl]);
    const R = fx([rx, ym]);
    const Pt = fx([qx + s * ca, yl + s * sa]);
    const toward = [flip ? -1 : 1, 0];
    const parts = [
      seg([12, yl], [388, yl]),
      seg([12, ym], [388, ym]),
      seg(Q, Pt),
      seg(Pt, R),
      arrows(fx([12, yl]), fx([388, yl]), 1, 0.85),
      arrows(fx([12, ym]), fx([388, ym]), 1, 0.85),
      P.text(flip ? 22 : 378, yl - 14, "ℓ"),
      P.text(flip ? 22 : 378, ym - 14, "m"),
      angleArc(Q, add(Q, toward), Pt, 20),
      angleArc(R, add(R, toward), Pt, 20),
      angleArc(Pt, Q, R, 18),
      angleLabel(Q, add(Q, toward), Pt, labels.Q, 38),
      angleLabel(R, add(R, toward), Pt, labels.R, 38),
      angleLabel(Pt, Q, R, labels.P, 32),
      name(add(Q, [0, -15]), Qn),
      name(add(R, [0, 17]), Rn),
      name(add(Pt, [flip ? -15 : 15, 0]), Pn),
    ];
    const alt =
      `Horizontal parallel lines ℓ (top) and m (bottom), marked with arrows. Point ${Qn} is on ℓ, point ${Rn} is on m, and point ${Pn} ` +
      `lies between the lines; segments ${Qn}${Pn} and ${Pn}${Rn} form a bend. The angle between ℓ and ${Qn}${Pn} is labeled ${labels.Q}, ` +
      `the angle between m and ${Rn}${Pn} is labeled ${labels.R}, and angle ${Qn}${Pn}${Rn} is labeled ${labels.P}. The bend is drawn so ` +
      `that angle ${Qn}${Pn}${Rn} looks like a right angle and the angles at ${Qn} and ${Rn} look equal.`;
    return { svg: S.svg(400, 264, parts, alt), alt, notToScale: true };
  }

  function bendGeometry(alpha, beta) {
    const Q = [0, 0];
    const Pt = [60 / Math.tan(toRad(alpha)), -60];
    const R = [Pt[0] - 40 / Math.tan(toRad(beta)), -100];
    return {
      atQ: angleAt(Q, [1, 0], Pt),
      atR: angleAt(R, add(R, [1, 0]), Pt),
      atP: angleAt(Pt, Q, R),
    };
  }

  function bendItem(t, numeric) {
    for (;;) {
      const names = t.pick(BEND_NAMES);
      const [Qn, Pn, Rn] = names;
      const alpha = t.int(18, 72);
      const beta = t.int(18, 72);
      const sum = alpha + beta;
      if (Math.abs(sum - 90) < 14 || sum > 135 || Math.abs(alpha - beta) < 9) continue;
      const kind = t.pick(["bend", "arm", "expr"]);
      const angleName = `${Qn}${Pn}${Rn}`;
      const intro = "In the figure shown, line ℓ is parallel to line m.";
      const auxiliary =
        `Draw a line through ${Pn} parallel to ℓ and m. It splits angle ${angleName} into two parts: one is an alternate interior ` +
        `angle to the angle at ${Qn}, the other to the angle at ${Rn}. So angle ${angleName} equals the sum of the angles at ${Qn} and ${Rn}.`;
      const triReason = `Treats the angles at ${Qn}, ${Pn}, and ${Rn} as the three angles of a triangle, making them sum to 180°.`;
      const fullReason = `Makes the three angles sum to 360°, which holds only when the angles at ${Qn} and ${Rn} are measured on the other side of the segments.`;
      const common = {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 115,
        stimulus: null,
        hint: `Angle ${angleName} can be split into two pieces. What could each piece be matched with?`,
        principles: [
          "Alternate interior angles formed by a transversal of parallel lines are equal.",
          "A line through the bend parallel to the given lines splits the bend angle into two such angles.",
        ],
      };
      const g = () => bendGeometry(alpha, beta);

      if (kind === "bend") {
        const labels = { Q: `${alpha}°`, R: `${beta}°`, P: "x°" };
        const larger = Math.max(alpha, beta);
        const wrong = distinctWrong(sum, [
          [90, `Reads angle ${angleName} as a right angle, as it looks in the figure; the figure is not drawn to scale.`],
          [180 - sum, triReason],
          [larger, `Matches angle ${angleName} with the ${larger}° angle alone, missing the part of it that matches the other marked angle.`],
        ]);
        if (!numeric && wrong.length < 3) continue;
        return {
          ...common,
          figure: bendFigure(t, names, labels),
          stem: `${intro} What is the value of x?`,
          correct: sum,
          wrong,
          explanation: `${auxiliary} x = ${alpha} + ${beta} = ${sum}. The angle only looks like a right angle because the figure is not drawn to scale.`,
          steps: [
            `Add a line through ${Pn} parallel to ℓ and m.`,
            `The upper part of angle ${angleName} equals the ${alpha}° angle (alternate interior angles).`,
            `The lower part equals the ${beta}° angle (alternate interior angles).`,
            `x = ${alpha} + ${beta} = ${sum}.`,
          ],
          trap: `Angle ${angleName} looks like a right angle in the figure, which is not drawn to scale, and there is no triangle whose angles sum to 180°.`,
          verify: () => close(g().atP, sum) && close(g().atQ, alpha) && close(g().atR, beta),
        };
      }

      if (kind === "arm") {
        const labels = { Q: "x°", R: `${beta}°`, P: `${sum}°` };
        const wrong = distinctWrong(alpha, [
          [beta, `Takes the angles at ${Qn} and ${Rn} as equal because they look equal in the figure; the figure is not drawn to scale.`],
          [180 - sum - beta > 0 ? 180 - sum - beta : null, triReason],
          [360 - sum - beta < 180 ? 360 - sum - beta : null, fullReason],
          [sum, `Gives the measure of angle ${angleName} instead of x.`],
        ]);
        if (!numeric && wrong.length < 3) continue;
        return {
          ...common,
          figure: bendFigure(t, names, labels),
          stem: `${intro} What is the value of x?`,
          correct: alpha,
          wrong,
          explanation: `${auxiliary} So x + ${beta} = ${sum}, and x = ${alpha}. The angles at ${Qn} and ${Rn} only look equal because the figure is not drawn to scale.`,
          steps: [
            `Add a line through ${Pn} parallel to ℓ and m.`,
            `Angle ${angleName} is the sum of the angles at ${Qn} and ${Rn}: ${sum} = x + ${beta}.`,
            `Solve: x = ${sum} − ${beta} = ${alpha}.`,
          ],
          trap: `The angles at ${Qn} and ${Rn} look equal in the figure, which is not drawn to scale; and the three marked angles do not form a triangle.`,
          verify: () => close(g().atQ, alpha) && close(g().atP, sum),
        };
      }

      const x = t.int(5, 22);
      const a1 = t.int(1, 4);
      const a3 = t.int(2, 6);
      if (a1 === a3) continue;
      const b1 = alpha - a1 * x;
      const b3 = sum - a3 * x;
      if (!b1 || !b3 || Math.abs(b1) > 70 || Math.abs(b3) > 70) continue;
      const labels = { Q: degExpr(a1, b1), R: `${beta}°`, P: degExpr(a3, b3) };
      const xFig = (90 - b3) / a3;
      if (!Number.isInteger(xFig) || xFig <= 0) continue;
      const xTri = (180 - b1 - beta - b3) / (a1 + a3);
      const xFull = (360 - b1 - beta - b3) / (a1 + a3);
      // A wrong x is only believable if it leaves every marked angle between 0° and 180°.
      const real = (value) => [a1 * value + b1, a3 * value + b3].every((angle) => angle > 0 && angle < 180);
      const wrong = distinctWrong(x, [
        [xFig, `Sets ${labels.P} equal to 90 because angle ${angleName} looks like a right angle in the figure; the figure is not drawn to scale.`],
        [Number.isInteger(xTri) && xTri > 0 && real(xTri) ? xTri : null, triReason],
        [Number.isInteger(xFull) && real(xFull) ? xFull : null, fullReason],
        [sum, `Gives the measure of angle ${angleName} instead of the value of x.`],
        [alpha, `Gives the measure of the angle at ${Qn} instead of the value of x.`],
      ]);
      if (!numeric && wrong.length < 3) continue;
      return {
        ...common,
        figure: bendFigure(t, names, labels),
        stem: `${intro} What is the value of x?`,
        correct: x,
        wrong,
        explanation:
          `${auxiliary} So (${S.lin(a1, b1)}) + ${beta} = ${S.lin(a3, b3)}, which gives x = ${x}. The angle at ${Pn} measures ${sum}°, ` +
          `not the 90° it appears to be in the figure.`,
        steps: [
          `Add a line through ${Pn} parallel to ℓ and m.`,
          `Angle ${angleName} is the sum of the angles at ${Qn} and ${Rn}.`,
          `Equation: ${S.lin(a1, b1 + beta)} = ${S.lin(a3, b3)}.`,
          `Solve: x = ${x}.`,
        ],
        trap: `Angle ${angleName} looks like a right angle in the figure, which is not drawn to scale; it measures ${sum}°.`,
        verify: () => close(g().atQ, a1 * x + b1) && close(g().atP, a3 * x + b3) && close(g().atR, beta),
      };
    }
  }

  const angleChase = {
    id: "angle-chase-not-to-scale",
    domain: DOMAIN,
    skill: "Lines, angles, and triangles",
    subskill: "angle relationships",
    title: "Angle chase through a misleading figure",
    recognize:
      "Decide which angle relationships the given facts guarantee (parallel lines, congruent sides) before " +
      "computing, and ignore what the drawing suggests: the angle that looks right, or looks equal to another, usually is not.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["not-to-scale-figure", "neighbouring-rule", "wrong-quantity"],
    build(t) {
      const form = t.pick(["transversal", "isosceles", "bend"]);
      const numeric = t.chance(0.3);
      if (form === "transversal") return transversalItem(t, numeric);
      if (form === "isosceles") return isoscelesItem(t, numeric);
      return bendItem(t, numeric);
    },
  };

  /* ========================================== 3. arcs, sectors, inscribed */

  const O = [200, 150];
  const RADIUS = 106;
  const onCircle = (degrees, extra = 0) => [
    O[0] + (RADIUS + extra) * Math.cos(toRad(degrees)),
    O[1] - (RADIUS + extra) * Math.sin(toRad(degrees)),
  ];

  function wedge(from, to) {
    const a = onCircle(from);
    const b = onCircle(to);
    const large = ((to - from + 360) % 360) > 180 ? 1 : 0;
    return `<path d="M ${O[0]} ${O[1]} L ${r1(a[0])} ${r1(a[1])} A ${RADIUS} ${RADIUS} 0 ${large} 0 ${r1(b[0])} ${r1(b[1])} Z" fill="currentColor" fill-opacity="0.16" stroke="none"/>`;
  }

  // Distance from point p to segment ab.
  function segmentDistance(p, a, b) {
    const ab = sub(b, a);
    const s = Math.max(0, Math.min(1, dot(sub(p, a), ab) / dot(ab, ab)));
    return dist(p, add(a, mul(ab, s)));
  }

  // Circle with center O and named points at the given angles (degrees,
  // counterclockwise). The label O goes in whichever of eight directions is
  // farthest from every drawn segment (pairs of angles; "O" for the center).
  function circleBase(points, segments = []) {
    const at = (key) => (key === "O" ? O : onCircle(points[key]));
    const lines = segments.map(([a, b]) => [at(a), at(b)]);
    let labelAt = add(O, [13, 12]);
    let best = -1;
    for (let step = 0; step < 8; step += 1) {
      const spot = add(O, mul(heading(step * 45 + 22.5), 17));
      const clearance = lines.length ? Math.min(...lines.map(([a, b]) => segmentDistance(spot, a, b))) : 99;
      if (clearance > best + 0.5) {
        best = clearance;
        labelAt = spot;
      }
    }
    const parts = [P.circle(O[0], O[1], RADIUS), dotAt(O), name(labelAt, "O")];
    Object.entries(points).forEach(([letter, degrees]) => {
      parts.push(dotAt(onCircle(degrees)));
      parts.push(name(onCircle(degrees, 17), letter));
    });
    return parts;
  }

  const ARC_NAMES = [["A", "B", "C"], ["P", "Q", "R"], ["J", "K", "L"], ["D", "E", "F"], ["M", "N", "P"]];
  const PI_DEGREES = [20, 30, 36, 40, 60, 120, 135, 144, 150, 160];
  const PLAIN_RADIANS = [0.5, 0.6, 0.8, 1.2, 2, 2.4, 2.5];

  const arcSector = {
    id: "arc-sector-inscribed",
    domain: DOMAIN,
    skill: "Circles",
    subskill: "circle measures",
    title: "Arcs, sectors, and inscribed angles in mixed units",
    recognize:
      "Name the angle first: central or inscribed, degrees or radians. An inscribed angle is half the central angle " +
      "on the same arc; arc length and sector area are the same fraction of different wholes; s = rθ and A = r²θ/2 need radians.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["not-to-scale-figure", "neighbouring-rule", "unit-mismatch", "wrong-quantity"],
    build(t) {
      const [nA, nB, nC] = t.pick(ARC_NAMES);
      const form = t.pick(["arcFromAngle", "arcFromAngle", "inscribed", "inscribed", "sector", "sector", "plain"]);
      const principles = [
        "An inscribed angle measures half of the central angle that intercepts the same arc.",
        "Arc length is (central angle ÷ 360°) × 2πr; sector area is (central angle ÷ 360°) × πr².",
        "In radians, arc length is s = rθ and sector area is A = r²θ/2.",
      ];

      if (form === "arcFromAngle") {
        const inscribed = t.chance(0.55);
        if (inscribed) {
          // Inscribed angle ACB given; A and B drawn almost opposite, so the
          // angle at C looks like a right angle and arc AB like a semicircle.
          const theta = t.pick([20, 24, 30, 36, 40, 45, 50, 54, 60]);
          const r = t.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18].filter((value) => (theta * value) % 90 === 0));
          const arc = piText(theta * r, 90);
          const drawnHalf = t.int(83, 87);
          const center = t.int(248, 292);
          const [first, second] = t.shuffle([nA, nB]);
          const Cdeg = center + 180 + t.int(-32, 32);
          const points = { [first]: center - drawnHalf, [second]: center + drawnHalf, [nC]: Cdeg };
          const Ap = onCircle(points[nA]);
          const Bp = onCircle(points[nB]);
          const Cp = onCircle(Cdeg);
          const parts = circleBase(points, [[nC, nA], [nC, nB]]).concat([
            seg(Cp, Ap),
            seg(Cp, Bp),
            angleArc(Cp, Ap, Bp, 18),
            angleLabel(Cp, Ap, Bp, `${theta}°`, 34),
          ]);
          const alt =
            `Circle with center O. Points ${nA}, ${nB}, and ${nC} lie on the circle, with chords ${nC}${nA} and ${nC}${nB}; angle ${nA}${nC}${nB} is labeled ${theta}°. ` +
            `${nA} and ${nB} are drawn almost directly opposite each other, so angle ${nA}${nC}${nB} looks like a right angle and arc ${nA}${nB} looks like a semicircle.`;
          const wrong = distinctWrong(arc, [
            [piText(r), `Takes ${nA}${nB} as a diameter because it looks like one in the figure, making arc ${nA}${nB} a semicircle; the figure is not drawn to scale.`],
            [piText(theta * r, 180), `Uses ${theta}° as the central angle; an inscribed angle is half the central angle, so the arc is twice as long.`],
            [piText(180 * r - theta * r, 90), `Finds the length of the arc that contains ${nC}.`],
            [piText(theta * r * r, 180), `Computes the area of sector ${nA}O${nB} instead of the length of arc ${nA}${nB}.`],
          ]);
          if (wrong.length < 3) return this.build(t);
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 105,
            stimulus: null,
            figure: { svg: S.svg(400, 300, parts, alt), alt, notToScale: true },
            stem: `Points ${nA}, ${nB}, and ${nC} lie on the circle shown, which has center O and radius ${r}. What is the length of the arc ${nA}${nB} that does not contain ${nC}?`,
            correct: arc,
            wrong,
            hint: `Which angle at the center cuts off the same arc as angle ${nA}${nC}${nB}?`,
            explanation:
              `Angle ${nA}${nC}${nB} is inscribed, so the central angle ${nA}O${nB} that intercepts the same arc measures 2 × ${theta}° = ${2 * theta}°. ` +
              `The arc is ${2 * theta}/360 of the circumference 2π(${r}) = ${piText(2 * r)}, which is ${arc}. The figure is not drawn to scale: ` +
              `${nA}${nB} only looks like a diameter.`,
            steps: [
              `Angle ${nA}${nC}${nB} is an inscribed angle of ${theta}°.`,
              `The central angle on the same arc is ${2 * theta}°.`,
              `Circumference: 2π(${r}) = ${piText(2 * r)}.`,
              `Arc ${nA}${nB} = (${2 * theta}/360) × ${piText(2 * r)} = ${arc}.`,
            ],
            principles,
            trap: `${nA}${nB} looks like a diameter in the figure, which is not drawn to scale; and ${theta}° is inscribed, not central.`,
            verify: () => {
              const A = [r * Math.cos(toRad(-theta)), r * Math.sin(toRad(-theta))];
              const B = [r * Math.cos(toRad(theta)), r * Math.sin(toRad(theta))];
              const C = [-r, 0];
              return close(angleAt(C, A, B), theta) && close(polylineArc(r, toRad(2 * theta)), (theta * r * Math.PI) / 90, 1e-5);
            },
          };
        }
        // Central angle given in degrees; drawn as a right angle.
        const c = t.pick([40, 45, 60, 72, 120, 135, 144, 150]);
        const r = t.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18].filter((value) => (c * value) % 180 === 0));
        const arc = piText(c * r, 180);
        const start = t.int(-15, 40);
        const drawn = t.int(87, 93);
        const points = { [nA]: start, [nB]: start + drawn };
        const Ap = onCircle(points[nA]);
        const Bp = onCircle(points[nB]);
        const parts = circleBase(points, [["O", nA], ["O", nB]]).concat([
          seg(O, Ap),
          seg(O, Bp),
          angleArc(O, Ap, Bp, 18),
          angleLabel(O, Ap, Bp, `${c}°`, 32),
          sideLabel(O, Ap, Bp, num(r), 12),
        ]);
        const alt =
          `Circle with center O and radii O${nA} and O${nB}. Radius O${nA} is labeled ${r} and angle ${nA}O${nB} is labeled ${c}°. ` +
          `Angle ${nA}O${nB} is drawn as a right angle, so arc ${nA}${nB} looks like a quarter of the circle.`;
        const wrong = distinctWrong(arc, [
          [piText(r, 2), `Treats angle ${nA}O${nB} as a right angle, as it looks in the figure, making arc ${nA}${nB} a quarter circle; the figure is not drawn to scale.`],
          [piText(2 * c * r, 180), `Treats the ${c}° angle as inscribed and doubles it; angle ${nA}O${nB} is a central angle.`],
          [piText(c * r * r, 360), `Computes the area of sector ${nA}O${nB} instead of the length of arc ${nA}${nB}.`],
          [piText(360 * r - c * r, 180), "Finds the length of the major arc instead of the minor arc."],
        ]);
        if (wrong.length < 3) return this.build(t);
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 95,
          stimulus: null,
          figure: { svg: S.svg(400, 300, parts, alt), alt, notToScale: true },
          stem: `In the circle shown with center O, what is the length of minor arc ${nA}${nB}?`,
          correct: arc,
          wrong,
          hint: "What fraction of the whole circle does the marked angle cut off?",
          explanation:
            `Angle ${nA}O${nB} is a central angle of ${c}°, so minor arc ${nA}${nB} is ${c}/360 of the circumference 2π(${r}) = ${piText(2 * r)}: ` +
            `${arc}. The angle is drawn close to 90°, but the figure is not drawn to scale.`,
          steps: [
            `Angle ${nA}O${nB} is central, so the arc is ${c}/360 of the circle.`,
            `Circumference: 2π(${r}) = ${piText(2 * r)}.`,
            `Arc ${nA}${nB} = (${c}/360) × ${piText(2 * r)} = ${arc}.`,
          ],
          principles,
          trap: `Angle ${nA}O${nB} looks like a right angle in the figure, which is not drawn to scale; it measures ${c}°.`,
          verify: () => close(polylineArc(r, toRad(c)), (c * r * Math.PI) / 180, 1e-5),
        };
      }

      if (form === "inscribed") {
        // Central angle given in radians, or through an arc length; asked
        // for the inscribed angle in degrees. Drawn with AOB a right angle.
        const c = t.pick(PI_DEGREES);
        const viaArc = t.chance(0.45);
        const numeric = t.chance(0.4);
        const r = t.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18].filter((value) => (c * value) % 180 === 0));
        const start = t.int(200, 250);
        const drawn = t.int(87, 93);
        // C on the major arc, with both chords kept well clear of the center
        // so neither reads as a diameter.
        let Cdeg = start + drawn / 2 + 180;
        for (let tries = 0; tries < 20; tries += 1) {
          const candidate = start + drawn / 2 + 180 + t.int(-40, 40);
          const Ct = onCircle(candidate);
          if (Math.min(segmentDistance(O, Ct, onCircle(start)), segmentDistance(O, Ct, onCircle(start + drawn))) > 22) {
            Cdeg = candidate;
            break;
          }
        }
        const points = { [nA]: start, [nB]: start + drawn, [nC]: Cdeg };
        const Ap = onCircle(points[nA]);
        const Bp = onCircle(points[nB]);
        const Cp = onCircle(Cdeg);
        const parts = circleBase(points, [["O", nA], ["O", nB], [nC, nA], [nC, nB]]).concat([
          seg(O, Ap),
          seg(O, Bp),
          seg(Cp, Ap),
          seg(Cp, Bp),
          angleArc(Cp, Ap, Bp, 18),
        ]);
        const alt =
          `Circle with center O. Points ${nA}, ${nB}, and ${nC} lie on the circle, with radii O${nA} and O${nB} and chords ${nC}${nA} and ${nC}${nB}; ${nC} is on the major arc. ` +
          `Angle ${nA}O${nB} is drawn as a right angle, so angle ${nA}${nC}${nB} looks like half of a right angle.`;
        const answer = c / 2;
        const given = viaArc
          ? `The circle shown has center O and radius ${r}, and minor arc ${nA}${nB} has length ${piText(c * r, 180)}.`
          : `Points ${nA}, ${nB}, and ${nC} lie on the circle shown with center O, and angle ${nA}O${nB} measures ${piText(c, 180)} radians.`;
        const wrong = distinctWrong(answer, [
          [45, `Reads angle ${nA}O${nB} as a right angle, as it is drawn, so angle ${nA}${nC}${nB} looks like 45°; the figure is not drawn to scale.`],
          [c, "Gives the central angle in degrees; an inscribed angle is half the central angle on the same arc."],
          [180 - c / 2, `Gives the inscribed angle that intercepts the major arc instead of minor arc ${nA}${nB}.`],
          [2 * c <= 180 ? 2 * c : null, "Doubles the central angle instead of halving it."],
          [(180 - c) / 2, `Gives angle O${nA}${nB}, a base angle of isosceles triangle ${nA}O${nB}, instead of angle ${nA}${nC}${nB}.`],
        ]);
        if (!numeric && wrong.length < 3) return this.build(t);
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 105,
          stimulus: null,
          figure: { svg: S.svg(400, 300, parts, alt), alt, notToScale: true },
          stem: `${given} What is the measure, in degrees, of angle ${nA}${nC}${nB}?`,
          correct: answer,
          wrong,
          hint: `Find angle ${nA}O${nB} in degrees first. How does angle ${nA}${nC}${nB} compare with it?`,
          explanation:
            (viaArc
              ? `Minor arc ${nA}${nB} is ${piText(c * r, 180)} and the radius is ${r}, so angle ${nA}O${nB} = s/r = ${piText(c, 180)} radians. `
              : "") +
            `${piText(c, 180)} radians is ${piText(c, 180)} × 180/π = ${c}°. Angle ${nA}${nC}${nB} is inscribed and intercepts the same arc, so it measures ` +
            `${c}/2 = ${num(answer)}°. The figure is not drawn to scale; angle ${nA}O${nB} only looks like a right angle.`,
          steps: [
            viaArc ? `Central angle in radians: s/r = ${piText(c * r, 180)} ÷ ${r} = ${piText(c, 180)}.` : `Angle ${nA}O${nB} = ${piText(c, 180)} radians.`,
            `Convert: ${piText(c, 180)} × 180/π = ${c}°.`,
            `Angle ${nA}${nC}${nB} is inscribed on the same arc: ${c}° ÷ 2 = ${num(answer)}°.`,
          ],
          principles,
          trap: `Angle ${nA}O${nB} is drawn as a right angle, so angle ${nA}${nC}${nB} looks like 45°, but the figure is not drawn to scale; and the central angle is twice the inscribed angle, not equal to it.`,
          verify: () => {
            const turn = viaArc ? ((c * r) / 180) * Math.PI / r : (c / 180) * Math.PI;
            const A = [Math.cos(turn / 2), Math.sin(turn / 2)];
            const B = [Math.cos(-turn / 2), Math.sin(-turn / 2)];
            const C = [Math.cos(Math.PI + 0.3), Math.sin(Math.PI + 0.3)];
            return close(angleAt(C, A, B), answer) && close(angleAt([0, 0], A, B), c);
          },
        };
      }

      if (form === "sector") {
        // Shaded sector with area given as a multiple of π; drawn as a quarter.
        const c = t.pick([30, 40, 45, 60, 72, 120, 135, 144, 150]);
        const r = t.pick([2, 3, 4, 5, 6, 8, 9, 10, 12].filter((value) => (c * value * value) % 360 === 0));
        const areaText = piText(c * r * r, 360);
        const start = t.int(10, 60);
        const drawn = t.int(87, 93);
        const points = { [nA]: start, [nB]: start + drawn };
        const Ap = onCircle(points[nA]);
        const Bp = onCircle(points[nB]);
        const parts = [wedge(start, start + drawn)].concat(circleBase(points, [["O", nA], ["O", nB]]), [
          seg(O, Ap),
          seg(O, Bp),
          sideLabel(O, Ap, Bp, num(r), 12),
        ]);
        const alt =
          `Circle with center O and radii O${nA} and O${nB}; sector ${nA}O${nB} is shaded and radius O${nA} is labeled ${r}. ` +
          "The shaded sector is drawn as a quarter of the circle.";
        const figure = { svg: S.svg(400, 300, parts, alt), alt, notToScale: true };
        const askAngle = t.chance(0.5);
        const intro = `In the circle shown with center O, the shaded sector has area ${areaText}.`;
        if (askAngle) {
          const answer = piText(c, 180);
          const wrong = distinctWrong(answer, [
            ["π/2", `Reads angle ${nA}O${nB} as a right angle because the shaded sector looks like a quarter circle; the figure is not drawn to scale.`],
            [piText(c, 360), "Uses r²θ for the sector area, dropping the factor 1/2."],
            [c * r <= 720 ? piText(c * r, 360) : null, "Divides the area by r as if the area were an arc length (s = rθ)."],
            [piText(360 - c, 180), "Gives the angle of the unshaded part of the circle."],
          ]);
          if (wrong.length < 3) return this.build(t);
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 105,
            stimulus: null,
            figure,
            stem: `${intro} What is the measure of angle ${nA}O${nB}, in radians?`,
            correct: answer,
            wrong,
            hint: "What fraction of the whole circle's area is shaded?",
            explanation:
              `The whole circle has area π(${r})² = ${piText(r * r)}. The sector is ${areaText} ÷ ${piText(r * r)} = ${S.frac(c, 360)} of it, ` +
              `so angle ${nA}O${nB} is ${S.frac(c, 360)} of 2π, which is ${answer}. (Equivalently, A = r²θ/2 gives θ = 2A/r².) The sector only looks like a quarter circle.`,
            steps: [
              `Circle area: π(${r})² = ${piText(r * r)}.`,
              `Fraction shaded: ${areaText} ÷ ${piText(r * r)} = ${S.frac(c, 360)}.`,
              `Angle ${nA}O${nB} = ${S.frac(c, 360)} × 2π = ${answer}.`,
            ],
            principles,
            trap: "The sector looks like a quarter of the circle in the figure, which is not drawn to scale, suggesting π/2.",
            verify: () => close(polygonSector(r, (c / 180) * Math.PI), (c * r * r * Math.PI) / 360, 1e-5),
          };
        }
        const answer = piText(c * r, 180);
        const wrong = distinctWrong(answer, [
          [piText(r, 2), "Treats the sector as a quarter circle, as it looks in the figure; the figure is not drawn to scale."],
          [piText(c * r, 360), "Divides the area by r without doubling; a sector's area is half of r times its arc length."],
          [piText(c, 180), "Stops at the central angle in radians instead of multiplying by the radius."],
          [piText(360 * r - c * r, 180), "Finds the length of the arc bounding the unshaded region."],
        ]);
        if (wrong.length < 3) return this.build(t);
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 110,
          stimulus: null,
          figure,
          stem: `${intro} What is the length of minor arc ${nA}${nB}?`,
          correct: answer,
          wrong,
          hint: "The arc and the sector are the same fraction of different wholes.",
          explanation:
            `The circle's area is ${piText(r * r)}, so the shaded sector is ${areaText} ÷ ${piText(r * r)} = ${S.frac(c, 360)} of the circle. ` +
            `Arc ${nA}${nB} is the same fraction of the circumference ${piText(2 * r)}: ${answer}. The sector only looks like a quarter circle.`,
          steps: [
            `Fraction shaded: ${areaText} ÷ ${piText(r * r)} = ${S.frac(c, 360)}.`,
            `Circumference: ${piText(2 * r)}.`,
            `Arc ${nA}${nB} = ${S.frac(c, 360)} × ${piText(2 * r)} = ${answer}.`,
          ],
          principles,
          trap: "The sector looks like a quarter circle in the figure, which is not drawn to scale; the fraction comes from the given area.",
          verify: () => {
            const turn = (c / 180) * Math.PI;
            return close(polygonSector(r, turn), (c * r * r * Math.PI) / 360, 1e-5) && close(polylineArc(r, turn), (c * r * Math.PI) / 180, 1e-5);
          },
        };
      }

      // plain: angle given as a radian number with no π.
      const theta = t.pick(PLAIN_RADIANS);
      const r = t.int(2, 12);
      const arcValue = round4(r * theta);
      const areaValue = round4((r * r * theta) / 2);
      const askArea = t.chance(0.55);
      const answer = askArea ? areaValue : arcValue;
      if (!fitsGrid(answer)) return this.build(t);
      const numeric = t.chance(0.6);
      const start = t.int(10, 60);
      const drawn = t.int(87, 93);
      const points = { [nA]: start, [nB]: start + drawn };
      const Ap = onCircle(points[nA]);
      const Bp = onCircle(points[nB]);
      const parts = [wedge(start, start + drawn)].concat(circleBase(points, [["O", nA], ["O", nB]]), [
        seg(O, Ap),
        seg(O, Bp),
        sideLabel(O, Ap, Bp, num(r), 12),
      ]);
      const alt =
        `Circle with center O and radii O${nA} and O${nB}; sector ${nA}O${nB} is shaded and radius O${nA} is labeled ${r}. ` +
        "The shaded sector is drawn as a quarter of the circle.";
      const tenths = Math.round(theta * 10);
      const wrong = distinctWrong(
        answer,
        askArea
          ? [
            [piText(r * r, 4), "Treats the shaded sector as a quarter circle, as it looks in the figure; the figure is not drawn to scale."],
            [arcValue, "Computes the arc length rθ instead of the sector's area."],
            [round4(r * r * theta), "Uses r²θ, dropping the factor 1/2 in the sector-area formula."],
            [piText(tenths * r * r, 3600), `Treats ${num(theta)} as a degree measure and uses (θ/360)πr².`],
          ]
          : [
            [piText(r, 2), "Treats the arc as a quarter of the circle, as it looks in the figure; the figure is not drawn to scale."],
            [areaValue, "Computes the sector's area instead of the arc length."],
            [piText(tenths * 2 * r, 3600), `Treats ${num(theta)} as a degree measure and uses (θ/360)2πr.`],
            [round4(r * r * theta), "Multiplies by r² instead of r."],
          ],
      );
      if (!numeric && wrong.length < 3) return this.build(t);
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 95,
        stimulus: null,
        figure: { svg: S.svg(400, 300, parts, alt), alt, notToScale: true },
        stem: `In the circle shown with center O, angle ${nA}O${nB} measures ${num(theta)} radians. What is the ${askArea ? "area of the shaded sector" : `length of minor arc ${nA}${nB}`}?`,
        correct: answer,
        wrong,
        hint: "Is the given angle in degrees or radians, and which formula expects that unit?",
        explanation: askArea
          ? `With the angle in radians, the sector's area is r²θ/2 = (${r})²(${num(theta)})/2 = ${num(areaValue)}. The angle is about ${Math.round(toDeg(theta))}°, not the 90° it appears to be.`
          : `With the angle in radians, arc length is s = rθ = ${r} × ${num(theta)} = ${num(arcValue)}. The angle is about ${Math.round(toDeg(theta))}°, not the 90° it appears to be.`,
        steps: askArea
          ? [`The angle ${num(theta)} is in radians (no degree sign).`, "Sector area in radians: A = r²θ/2.", `A = ${r * r} × ${num(theta)} ÷ 2 = ${num(areaValue)}.`]
          : [`The angle ${num(theta)} is in radians (no degree sign).`, "Arc length in radians: s = rθ.", `s = ${r} × ${num(theta)} = ${num(arcValue)}.`],
        principles,
        trap: `The sector is drawn as a quarter circle, but the figure is not drawn to scale; ${num(theta)} radians is about ${Math.round(toDeg(theta))}°. Treating ${num(theta)} as degrees gives a tiny multiple of π.`,
        verify: () =>
          askArea ? close(polygonSector(r, theta), areaValue, 1e-5) : close(polylineArc(r, theta), arcValue, 1e-5),
      };
    },
  };

  /* ======================================== 4. circle equation, completing */

  // "2x² + 2y² − 12x + 8y − 6" from [coefficient, symbol] pairs.
  function terms(list) {
    const parts = [];
    list.forEach(([coefficient, symbol]) => {
      if (coefficient === 0) return;
      const magnitude = Math.abs(coefficient);
      const body = symbol && magnitude === 1 ? symbol : `${num(magnitude)}${symbol}`;
      if (!parts.length) parts.push(coefficient < 0 ? `${MINUS}${body}` : body);
      else parts.push(`${coefficient < 0 ? MINUS : "+"} ${body}`);
    });
    return parts.length ? parts.join(" ") : "0";
  }

  // Parses one side of a displayed equation back into coefficients, so that
  // verify() works from the text the student sees.
  function parseSide(text) {
    const out = { x2: 0, y2: 0, x: 0, y: 0, c: 0 };
    const compact = text.split(MINUS).join("-").replace(/\s+/g, "");
    const pattern = /([+-]?)(\d*)(x²|y²|x|y)?/g;
    let match;
    while ((match = pattern.exec(compact)) && match[0]) {
      const [, sign, digits, symbol] = match;
      const magnitude = digits ? Number(digits) : 1;
      const value = sign === "-" ? -magnitude : magnitude;
      const key = { "x²": "x2", "y²": "y2", x: "x", y: "y" }[symbol] || "c";
      if (!symbol && !digits) continue;
      out[key] += value;
    }
    return out;
  }

  function equationValue(equation, x, y) {
    const [left, right] = equation.split(" = ").map(parseSide);
    const f = (side) => side.x2 * x * x + side.y2 * y * y + side.x * x + side.y * y + side.c;
    return f(left) - f(right);
  }

  const NON_SQUARES = [5, 8, 10, 12, 13, 17, 18, 20, 24, 26, 27, 28, 29, 32, 34, 40, 45, 48, 50];

  const circleEquation = {
    id: "circle-equation-complete-square",
    domain: DOMAIN,
    skill: "Circles",
    subskill: "circle equations",
    title: "Circle equation in general form",
    recognize:
      "The equation is a circle in disguise: divide out a common leading coefficient, complete the square in x and in y, " +
      "and move every constant to the right before reading the center (signs flip) and the radius (square root of the right side).",
    rubric: { steps: 2, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["intermediate-value", "sign-error", "wrong-quantity"],
    build(t) {
      for (;;) {
        const scaled = t.chance(0.45);
        const a = scaled ? t.pick([2, 3, 4, 5]) : 1;
        const h = t.nonzero(-8, 8);
        const k = t.nonzero(-8, 8);
        if (Math.abs(h) === Math.abs(k)) continue;
        const ask = t.pick(["radius", "radius", "diameter", "center", "center", "inside", "inside"]);
        const integerRadius = ask === "inside" || t.chance(0.6);
        const r2 = integerRadius ? t.int(2, 9) ** 2 : t.pick(NON_SQUARES);
        const D = -2 * a * h;
        const E = -2 * a * k;
        const F = a * (h * h + k * k - r2);
        const layout = t.int(0, 2);
        const equation =
          layout === 0
            ? `${terms([[a, "x²"], [a, "y²"], [D, "x"], [E, "y"], [F, ""]])} = 0`
            : layout === 1
              ? `${terms([[a, "x²"], [D, "x"], [a, "y²"], [E, "y"]])} = ${num(-F)}`
              : `${terms([[a, "x²"], [a, "y²"]])} = ${terms([[-D, "x"], [-E, "y"], [-F, ""]])}`;
        const r = radical(r2);
        const hk2 = h * h + k * k;
        const divideStep = a === 1 ? null : `Divide every term by ${a}.`;
        const unscaled =
          `${terms([[1, "x²"], [-2 * h, "x"]])} + ${terms([[1, "y²"], [-2 * k, "y"]])} = ${num(r2 - hk2)}`;
        const completed = `(x ${h < 0 ? "+" : MINUS} ${Math.abs(h)})² + (y ${k < 0 ? "+" : MINUS} ${Math.abs(k)})² = ${r2}`;
        const baseSteps = [
          ...(divideStep ? [divideStep] : []),
          `Group and move the constant: ${unscaled}.`,
          `Complete each square by adding ${h * h} and ${k * k} to both sides: ${completed}.`,
          `Center (${num(h)}, ${num(k)}), radius √${r2}${typeof r === "number" ? ` = ${r}` : ` = ${r}`}.`,
        ];
        const principles = [
          "A circle with center (h, k) and radius r has equation (x − h)² + (y − k)² = r².",
          "Completing the square requires the x² and y² coefficients to be 1.",
        ];
        const common = {
          estimatedSeconds: 115,
          stimulus: { type: "equations", content: equation },
          figure: null,
          hint: "Rewrite the equation so it shows the center and radius directly.",
          principles,
        };
        const explanationCore =
          (a === 1 ? "" : `Every term has a factor of ${a}, so divide it out first. `) +
          `Grouping gives ${unscaled}. Completing the squares adds ${h * h} and ${k * k} to both sides: ${completed}. ` +
          `So the center is (${num(h)}, ${num(k)}) and the radius is √${r2}${typeof r === "number" ? ` = ${r}` : ` = ${r}`}.`;
        const wrongRadiusSquares = (() => {
          const list = [];
          const constant = r2 - hk2; // the constant after moving it right (per unit leading coefficient)
          if (constant > 0) {
            list.push([constant, a === 1
              ? "Takes the constant on the right, before completing the squares, as r²; it leaves out the numbers added to complete each square."
              : `Divides by ${a} but takes the constant on the right, before completing the squares, as r².`]);
          }
          if (a > 1) {
            const noDivide = a * a * hk2 - a * (hk2 - r2);
            list.push([noDivide, `Completes the square without first dividing every term by ${a}.`]);
            const partial = hk2 - a * (hk2 - r2);
            if (partial > 0) list.push([partial, `Divides the x- and y-terms by ${a} but not the constant.`]);
          } else {
            list.push([3 * hk2 + r2, "Adds the squares of the whole x- and y-coefficients instead of the squares of half of each."]);
            const signSlip = 2 * hk2 - r2;
            if (signSlip > 0) list.push([signSlip, "Moves the constant to the other side without changing its sign."]);
          }
          return list;
        })();

        if (ask === "radius" || ask === "diameter") {
          const diameter = ask === "diameter";
          const correct = diameter ? radical(4 * r2) : r;
          const numeric = typeof correct === "number" && t.chance(0.45);
          const list = wrongRadiusSquares.map(([square, reason]) => [diameter ? radical(4 * square) : radical(square), reason]);
          list.push(diameter ? [r, "Gives the radius instead of the diameter."] : [radical(4 * r2), "Gives the diameter instead of the radius."]);
          list.push([diameter ? 2 * r2 : r2, "Stops at r², the number on the right after completing the squares, without taking the square root."]);
          const wrong = distinctWrong(correct, list);
          if (!numeric && wrong.length < 3) continue;
          return {
            ...common,
            responseType: numeric ? "numeric" : "multiple-choice",
            stem: t.pick([
              `The equation of a circle in the xy-plane is shown. What is the ${diameter ? "diameter" : "radius"} of the circle?`,
              `In the xy-plane, the graph of the given equation is a circle. What is the length of the circle's ${diameter ? "diameter" : "radius"}?`,
            ]),
            correct,
            wrong,
            explanation: `${explanationCore}${diameter ? ` The diameter is twice the radius: ${S.label(correct)}.` : ""}`,
            steps: diameter ? baseSteps.concat([`Diameter = 2r = ${S.label(correct)}.`]) : baseSteps,
            trap:
              (a === 1 ? "" : `Completing the square before dividing by ${a} inflates the radius. `) +
              "The constant in the equation is not r²; the squares added while completing must be moved over too.",
            verify: () => {
              const rv = Math.sqrt(r2);
              const onCircleOk = [0.3, 1.4, 2.9, 4.4].every((angle) =>
                Math.abs(equationValue(equation, h + rv * Math.cos(angle), k + rv * Math.sin(angle))) < 1e-7);
              const insideOk = equationValue(equation, h, k) * Math.sign(parseSide(equation.split(" = ")[0]).x2 || -1) < 0;
              const size = typeof correct === "number" ? correct : null;
              return onCircleOk && insideOk && (size === null || close(size, diameter ? 2 * rv : rv));
            },
          };
        }

        if (ask === "center") {
          const which = t.pick(["h", "k", "sum"]);
          const numeric = t.chance(0.45);
          const correct = which === "h" ? h : which === "k" ? k : h + k;
          const other = which === "h" ? k : h;
          const coefficient = which === "h" ? "x" : "y";
          const list =
            which === "sum"
              ? [
                [-(h + k), "Reads the center's coordinates with the signs they have in the equation."],
                [2 * a * (h + k) === 2 * (h + k) ? 2 * (h + k) : a * (h + k), a === 1
                  ? "Uses the whole x- and y-coefficients instead of half of each."
                  : `Halves the coefficients but does not first divide by ${a}.`],
                [h - k, "Flips the sign of only one coordinate."],
                [k - h, "Flips the sign of only one coordinate."],
                [2 * (h + k), "Divides the coefficients by the leading coefficient but does not halve them."],
              ]
              : [
                [-correct, `Keeps the sign of the ${coefficient}-coefficient; the center's coordinate has the opposite sign.`],
                [a > 1 ? a * correct : 2 * correct, a > 1
                  ? `Halves the ${coefficient}-coefficient but does not first divide by ${a}.`
                  : `Uses the whole ${coefficient}-coefficient instead of half of it.`],
                [a > 1 ? 2 * correct : -2 * correct, a > 1
                  ? `Divides the ${coefficient}-coefficient by ${a} but does not halve it.`
                  : `Uses the whole ${coefficient}-coefficient with its sign unchanged.`],
                [other, `Gives the ${which === "h" ? "y" : "x"}-coordinate of the center.`],
              ];
          const wrong = distinctWrong(correct, list);
          if (!numeric && wrong.length < 3) continue;
          const question = which === "sum" ? "h + k" : which;
          return {
            ...common,
            responseType: numeric ? "numeric" : "multiple-choice",
            stem: `In the xy-plane, the graph of the given equation is a circle with center (h, k). What is the value of ${question}?`,
            correct,
            wrong,
            explanation: `${explanationCore}${which === "sum" ? ` So h + k = ${num(h)} + ${S.paren(k)} = ${num(h + k)}.` : ""}`,
            steps: which === "sum" ? baseSteps.concat([`h + k = ${num(h + k)}.`]) : baseSteps,
            trap:
              "In (x − h)², the center's coordinate has the opposite sign of the number in the parentheses" +
              (a === 1 ? "." : `, and the coefficients must be divided by ${a} before halving.`),
            verify: () => {
              // The center is the only point where the left side minus the right side is smallest.
              const at = (x, y) => equationValue(equation, x, y);
              const lead = parseSide(equation.split(" = ")[0]).x2 - parseSide(equation.split(" = ")[1]).x2;
              const value = at(h, k);
              const around = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => lead * (at(h + dx * 0.5, k + dy * 0.5) - value) > 0);
              return around && close(correct, which === "h" ? h : which === "k" ? k : h + k);
            },
          };
        }

        // inside: which point lies inside the circle? A slip that changes
        // only the radius keeps the circle concentric, so it can never single
        // out one wrong point. Center slips can: reading the signs from the
        // equation, or flipping just one of them (r is unchanged by either).
        // Each wrong choice lies inside exactly one slipped circle and outside
        // the true one, and the key lies outside every slipped circle, so each
        // slip leads to exactly one choice.
        const rv = Math.sqrt(r2);
        const center = [h, k];
        const d2 = (point, c) => (point[0] - c[0]) ** 2 + (point[1] - c[1]) ** 2;
        const flipOne = t.chance(0.5) ? [-h, k] : [h, -k];
        const slips = [
          { center: [-h, -k], reason: `Lies inside the circle centered at ${S.point(-h, -k)}, the center read with the signs shown in the equation, but outside the actual circle.` },
          { center: flipOne, reason: `Lies inside the circle centered at ${S.point(flipOne[0], flipOne[1])}, which flips the sign of only one coordinate of the center, but outside the actual circle.` },
        ];
        const grid = [];
        const reach = Math.ceil(rv) + 2 * Math.max(Math.abs(h), Math.abs(k));
        for (let x = -reach - 2; x <= reach + 2; x += 1) {
          for (let y = -reach - 2; y <= reach + 2; y += 1) grid.push([x, y]);
        }
        const keys = grid.filter((point) =>
          d2(point, center) >= 2 && d2(point, center) <= 0.8 * r2 && point[0] !== h && point[1] !== k &&
          slips.every((slip) => d2(point, slip.center) > r2));
        const lurePoints = slips.map((slip, index) => grid.filter((point) =>
          d2(point, center) > r2 && d2(point, slip.center) >= 2 && d2(point, slip.center) <= 0.8 * r2 &&
          d2(point, slips[1 - index].center) > r2 && point[0] !== slip.center[0] && point[1] !== slip.center[1]));
        if (!keys.length || lurePoints.some((list) => !list.length)) continue;
        const key = t.pick(keys);
        const lures = lurePoints.map((list) => t.pick(list));
        const edge = t.pick([[h + rv, k], [h - rv, k], [h, k + rv], [h, k - rv]]);
        const correct = S.point(key[0], key[1]);
        const wrong = distinctWrong(correct, [
          [S.point(lures[0][0], lures[0][1]), slips[0].reason],
          [S.point(lures[1][0], lures[1][1]), slips[1].reason],
          [S.point(edge[0], edge[1]), "Lies on the circle, not inside it: its distance from the center equals the radius."],
        ]);
        if (wrong.length < 3) continue;
        return {
          ...common,
          responseType: "multiple-choice",
          stem: "In the xy-plane, the graph of the given equation is a circle. Which of the following points lies inside the circle?",
          correct,
          wrong,
          explanation:
            `${explanationCore} A point is inside when its distance from ${S.point(h, k)} is less than ${r}, that is, when its squared ` +
            `distance is less than ${r2}. For ${correct}, the squared distance is ${d2(key, center)}. The other points are ` +
            `${d2(lures[0], center)}, ${d2(lures[1], center)}, and ${r2} away (squared), so none of them is inside.`,
          steps: baseSteps.concat([
            `Squared distance from ${correct} to ${S.point(h, k)}: ${d2(key, center)} < ${r2}, so it is inside.`,
          ]),
          trap: "A center read with the signs shown in the equation, or with one sign flipped, is a different circle; a point on the circle is not inside it.",
          verify: () => {
            const lead = parseSide(equation.split(" = ")[0]).x2 - parseSide(equation.split(" = ")[1]).x2;
            const sign = (point) => Math.sign(lead * equationValue(equation, point[0], point[1]));
            return sign(key) < 0 && lures.every((point) => sign(point) > 0) &&
              Math.abs(equationValue(equation, edge[0], edge[1])) < 1e-9;
          },
        };
      }
    },
  };

  /* ================================== 5. trig ratios, similarity, cofunction */

  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];
  const SECOND_NAMES = [["D", "E", "F"], ["R", "S", "T"], ["J", "K", "L"], ["X", "Y", "Z"]];
  // Images of A, B, C as indices into the second triangle's letters; the
  // identity (alphabetical) correspondence is left out on purpose.
  const PERMUTATIONS = [[0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const OTHER_FUNCTION = { sin: "cos", cos: "sin", tan: "sin" };

  // Right triangle ABC with the right angle at C, drawn to scale.
  function rightTriangleFigure(t, legs, shown) {
    const { BC, AC } = legs;
    const scale = Math.min(250 / Math.max(BC, AC), 190 / Math.min(BC, AC), 250 / AC, 190 / BC);
    const flip = t.chance(0.5);
    // Right angle at C with AC horizontal and BC vertical, centered in the canvas.
    const width = AC * scale;
    const tall = BC * scale;
    const cx = flip ? 200 + width / 2 : 200 - width / 2;
    const cy = 135 + tall / 2;
    const C = [cx, cy];
    const A = [cx + (flip ? -1 : 1) * width, cy];
    const B = [cx, cy - tall];
    const G = centroid([A, B, C]);
    const parts = [
      P.polygon([A, B, C]),
      rightMark(C, A, B),
      nameAway(A, G, "A"),
      nameAway(B, G, "B"),
      nameAway(C, G, "C"),
    ];
    const words = [];
    if (shown.AC) { parts.push(sideLabel(A, C, G, num(shown.AC))); words.push(`AC = ${shown.AC}`); }
    if (shown.BC) { parts.push(sideLabel(B, C, G, num(shown.BC))); words.push(`BC = ${shown.BC}`); }
    if (shown.AB) { parts.push(sideLabel(A, B, G, num(shown.AB))); words.push(`AB = ${shown.AB}`); }
    const alt =
      `Right triangle ABC with the right angle at C marked; leg AC is horizontal and leg BC is vertical.` +
      (words.length ? ` Labeled lengths: ${words.join(", ")}.` : "");
    return { svg: S.svg(400, 270, parts, alt), alt, notToScale: false };
  }

  const trigCofunction = {
    id: "trig-similar-cofunction",
    domain: DOMAIN,
    skill: "Right triangles and trigonometry",
    subskill: "trigonometric ratios",
    title: "Trig ratios through similarity and cofunctions",
    recognize:
      "A trig ratio belongs to an angle, not a triangle: follow the stated correspondence to the matching angle, " +
      "use the fact that similar triangles share ratios, and remember sin of one acute angle equals cos of the other (they sum to 90°).",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "wrong-quantity", "context-constraint", "part-vs-whole"],
    build(t) {
      const form = t.pick(["ratio", "ratio", "ratio", "side", "side", "cofunction", "cofunction", "cofunction"]);
      // Chosen once, outside the retry loops, so a multiple-choice attempt
      // that lacks good distractors does not tilt the mix toward numeric.
      const numeric = form === "cofunction" ? t.chance(0.4) : form === "side" ? t.chance(0.5) : false;

      if (form === "cofunction") {
        for (;;) {
          const theta = t.int(12, 78);
          if (theta === 45) continue;
          const x = t.int(3, 20);
          const a1 = t.int(1, 6);
          const a2 = t.int(1, 6);
          if (a1 === a2) continue;
          const b1 = theta - a1 * x;
          const b2 = 90 - theta - a2 * x;
          if (!b1 || !b2 || Math.abs(b1) > 60 || Math.abs(b2) > 60) continue;
          const e1 = S.lin(a1, b1);
          const e2 = S.lin(a2, b2);
          const presentation = t.int(0, 2);
          const equation = [
            `sin(${e1})° = cos(${e2})°`,
            `cos(${e2})° = sin(${e1})°`,
            `sin(${e1})° ${MINUS} cos(${e2})° = 0`,
          ][presentation];
          const xEq = (b2 - b1) / (a1 - a2);
          const x180 = (180 - b1 - b2) / (a1 + a2);
          const askAngle = t.chance(0.35);
          const correct = askAngle ? theta : x;
          const wrong = distinctWrong(
            correct,
            askAngle
              ? [
                [90 - theta, `Gives the value of ${e2}, the other angle.`],
                [x, `Gives the value of x instead of ${e1}.`],
                [Number.isInteger(x180) ? a1 * x180 + b1 : null, "Makes the two angles supplementary (sum 180°) instead of complementary."],
                [Number.isInteger(xEq) ? a1 * xEq + b1 : null, "Sets the two angle measures equal, as if sine and cosine of one angle were equal."],
                [45, "Assumes sine equals cosine only at 45°."],
              ]
              : [
                [xEq, `Sets ${e1} equal to ${e2}; sine and cosine of the same angle are not equal in general.`],
                [x180, "Makes the two angles supplementary (sum 180°); sine equals cosine for complementary angles."],
                [theta, `Gives the value of ${e1}, the angle, instead of x.`],
                [90 - theta, `Gives the value of ${e2} instead of x.`],
              ],
          ).filter(([value]) => typeof value !== "number" || value > 0);
          if (!numeric && wrong.length < 3) continue;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 95,
            stimulus: { type: "equations", content: equation },
            figure: null,
            stem: `In the given equation, (${e1})° and (${e2})° are the measures of two acute angles. What is the value of ${askAngle ? e1 : "x"}?`,
            correct,
            wrong,
            hint: "In a right triangle, the sine of one acute angle is the cosine of which angle?",
            explanation:
              `For acute angles, sin A = cos B exactly when A + B = 90°. So (${e1}) + (${e2}) = 90, which gives ${S.lin(a1 + a2, b1 + b2)} = 90 and x = ${x}. ` +
              `Then ${e1} = ${theta} and ${e2} = ${90 - theta}, both acute, and they add to 90.`,
            steps: [
              "Sine of an acute angle equals cosine of its complement.",
              `Set the angles to sum to 90: (${e1}) + (${e2}) = 90.`,
              `Solve: ${S.lin(a1 + a2, 0)} = ${num(90 - b1 - b2)}, so x = ${x}.`,
              askAngle ? `Then ${e1} = ${a1} × ${x} ${S.signed(b1)} = ${theta}.` : `Check: the angles are ${theta}° and ${90 - theta}°, both acute.`,
            ],
            principles: [
              "sin θ = cos(90° − θ) for every angle θ.",
              "For two acute angles, sin A = cos B exactly when A + B = 90°.",
            ],
            trap: "Setting the angles equal, or making them add to 180°, uses the wrong relationship; only complementary acute angles have sin A = cos B.",
            verify: () => {
              const A1 = a1 * x + b1;
              const A2 = a2 * x + b2;
              return A1 > 0 && A1 < 90 && A2 > 0 && A2 < 90 &&
                Math.abs(Math.sin(toRad(A1)) - Math.cos(toRad(A2))) < 1e-12 && close(correct, askAngle ? A1 : x);
            },
          };
        }
      }

      for (;;) {
        const [p0, q0, h0] = t.pick(TRIPLES);
        const swap = t.chance(0.5);
        const side = { BC: swap ? q0 : p0, AC: swap ? p0 : q0, AB: h0 };
        const ratios = {
          A: { sin: [side.BC, side.AB], cos: [side.AC, side.AB], tan: [side.BC, side.AC] },
          B: { sin: [side.AC, side.AB], cos: [side.BC, side.AB], tan: [side.AC, side.BC] },
        };
        const ratioText = (vertex, fn) => S.frac(...ratios[vertex][fn]);
        const letters = t.pick(SECOND_NAMES);
        const perm = t.pick(PERMUTATIONS);
        const image = { A: letters[perm[0]], B: letters[perm[1]], C: letters[perm[2]] };
        const preimage = Object.fromEntries(Object.entries(image).map(([key, value]) => [value, key]));
        const second = letters.join("");
        const correspondence =
          `Triangle ABC is similar to triangle ${second}, where angle A corresponds to angle ${image.A} and angle B corresponds to angle ${image.B}.`;
        const givenVertex = t.pick(["A", "B"]);
        const givenFn = t.pick(["sin", "cos", "tan"]);
        const useFigure = form === "ratio" && t.chance(0.55);
        const figureSides = useFigure ? t.pick([["AC", "BC"], ["AB", "AC"], ["AB", "BC"]]) : null;
        const given = useFigure ? "" : ` ${givenFn} ${givenVertex} = ${ratioText(givenVertex, givenFn)}.`;
        const figure = useFigure
          ? rightTriangleFigure(t, side, Object.fromEntries(figureSides.map((key) => [key, side[key]])))
          : form === "ratio" && t.chance(0.4)
            ? rightTriangleFigure(t, side, {})
            : null;
        const intro = figure
          ? `In the figure shown, triangle ABC has a right angle at C.${given}`
          : `In right triangle ABC, angle C is a right angle.${given}`;
        const hypotenuseStep = useFigure && figureSides.includes("AC") && figureSides.includes("BC")
          ? `Find the hypotenuse: AB = √(${side.AC}² + ${side.BC}²) = ${side.AB}.`
          : useFigure
            ? `Find the missing leg: ${figureSides.includes("AC") ? "BC" : "AC"} = √(${side.AB}² − ${side[figureSides.find((key) => key !== "AB")]}²) = ${side[figureSides.includes("AC") ? "BC" : "AC"]}.`
            : `From ${givenFn} ${givenVertex} = ${ratioText(givenVertex, givenFn)}, the sides are in the ratio BC : AC : AB = ${side.BC} : ${side.AC} : ${side.AB}.`;

        if (form === "ratio") {
          // Ask about an angle whose alphabetical partner is the other acute
          // angle, so reading the correspondence alphabetically really misleads.
          const naiveOf = (vertex) => ["A", "B", "C"][letters.indexOf(image[vertex])];
          const targets = ["A", "B"].filter((vertex) => naiveOf(vertex) === (vertex === "A" ? "B" : "A"));
          if (!targets.length) continue;
          const target = t.pick(targets);
          const other = target === "A" ? "B" : "A";
          const fn = t.pick(["sin", "cos", "tan"]);
          if (!useFigure && target === givenVertex && fn === givenFn) continue;
          const asked = image[target];
          const naive = ["A", "B", "C"][letters.indexOf(asked)];
          const correct = ratioText(target, fn);
          const list = [
            [ratioText(other, fn), `Matches angle ${asked} with angle ${other}, as alphabetical order suggests; the stated correspondence pairs ${asked} with ${target}.`],
            [ratioText(target, OTHER_FUNCTION[fn]), fn === "tan"
              ? `Divides by the hypotenuse instead of the adjacent leg, giving sin ${target}.`
              : `Uses the ${fn === "sin" ? "adjacent" : "opposite"} side, which gives ${OTHER_FUNCTION[fn]} ${target} instead of ${fn} ${target}.`],
            [fn === "tan" ? ratioText(other, "sin") : ratioText(target, "tan"), fn === "tan"
              ? `Matches angle ${asked} with angle ${other}, as alphabetical order suggests, and divides by the hypotenuse (sin ${other}).`
              : `Divides one leg by the other, giving tan ${target}, instead of using the hypotenuse.`],
            [useFigure ? null : ratioText(givenVertex, givenFn), `Repeats the given ratio, which describes angle ${givenVertex}, not the angle matched with ${asked}.`],
          ];
          const wrong = distinctWrong(correct, list);
          if (wrong.length < 3) continue;
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 110,
            stimulus: null,
            figure,
            stem: `${intro} ${correspondence} What is the value of ${fn} ${asked}?`,
            correct,
            wrong,
            hint: `Which angle of triangle ABC has the same measure as angle ${asked}?`,
            explanation:
              `${hypotenuseStep} Angle ${asked} corresponds to angle ${target}, so the two angles are equal and share every trig ratio. ` +
              `${fn} ${target} = ${ratioText(target, fn).replace("/", " / ")}, so ${fn} ${asked} = ${correct}.`,
            steps: [
              hypotenuseStep,
              `By the stated correspondence, angle ${asked} matches angle ${target} (not angle ${naive}, as alphabetical order would suggest).`,
              `Similar triangles have equal corresponding angles, so ${fn} ${asked} = ${fn} ${target}.`,
              `${fn} ${target} = ${correct}.`,
            ],
            principles: [
              "Corresponding angles of similar triangles are equal, so they have equal trigonometric ratios.",
              "In a right triangle, the sine of one acute angle equals the cosine of the other.",
            ],
            trap: `The letters of triangle ${second} are not listed in corresponding order; pairing them alphabetically picks the wrong angle.`,
            verify: () => {
              // Build ABC, map it onto the second triangle by a rotation, reflection, and scaling, and measure the image angle.
              const A = [side.AC, 0];
              const B = [0, side.BC];
              const C = [0, 0];
              const map = ([x, y]) => [3 + 2.5 * (0.6 * x + 0.8 * y), -1 + 2.5 * (0.8 * x - 0.6 * y)];
              const images = { [image.A]: map(A), [image.B]: map(B), [image.C]: map(C) };
              const at = images[asked];
              const others = letters.filter((letter) => letter !== asked).map((letter) => images[letter]);
              const angle = toRad(angleAt(at, others[0], others[1]));
              const value = { sin: Math.sin(angle), cos: Math.cos(angle), tan: Math.tan(angle) }[fn];
              const [top, bottom] = ratios[target][fn];
              return close(value, top / bottom, 1e-9) && close(angleAt(images[image.C], images[image.A], images[image.B]), 90);
            },
          };
        }

        // side: a length in the second triangle from a ratio in the first.
        const sideOf = (pair) => {
          const [first, secondLetter] = pair.split("").map((letter) => preimage[letter]).sort();
          return first + secondLetter;
        };
        const pairs = [letters[0] + letters[1], letters[0] + letters[2], letters[1] + letters[2]];
        const [givenPair, askedPair] = t.sample(pairs, 2);
        const thirdPair = pairs.find((pair) => pair !== givenPair && pair !== askedPair);
        const scale = t.pick([2, 3, 4, 5]);
        const givenLength = scale * side[sideOf(givenPair)];
        const correct = scale * side[sideOf(askedPair)];
        const naiveSide = (pair) => pair.split("").map((letter) => ["A", "B", "C"][letters.indexOf(letter)]).sort().join("");
        const naiveScale = givenLength / side[naiveSide(givenPair)];
        const naive = naiveScale * side[naiveSide(askedPair)];
        if (naive === correct) continue;
        // Given side matched with the wrong side of ABC, asked side matched correctly.
        const misScaled = (givenLength / side[sideOf(thirdPair)]) * side[sideOf(askedPair)];
        const wrong = distinctWrong(correct, [
          [scale * side[sideOf(thirdPair)], `Matches ${askedPair} with side ${sideOf(thirdPair)} of triangle ABC; under the stated correspondence it matches ${sideOf(askedPair)}.`],
          [Number.isInteger(naive) ? naive : null, `Pairs the vertices of the two triangles in alphabetical order instead of by the stated correspondence.`],
          [side[sideOf(askedPair)], `Gives the length of the corresponding side of triangle ABC without scaling by ${scale}.`],
          [Number.isInteger(misScaled) ? misScaled : null, `Matches ${givenPair} with side ${sideOf(thirdPair)} of triangle ABC, which gives the wrong scale factor.`],
        ]);
        if (!numeric && wrong.length < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 120,
          stimulus: null,
          figure: null,
          stem: `${intro} ${correspondence} If ${givenPair} = ${givenLength}, what is the length of ${askedPair}?`,
          correct,
          wrong,
          hint: `Which side of triangle ABC does ${givenPair} correspond to?`,
          explanation:
            `${hypotenuseStep} Under the correspondence A → ${image.A}, B → ${image.B}, C → ${image.C}, side ${givenPair} matches ${sideOf(givenPair)} ` +
            `and side ${askedPair} matches ${sideOf(askedPair)}. The scale factor is ${givenLength} ÷ ${side[sideOf(givenPair)]} = ${scale}, so ` +
            `${askedPair} = ${scale} × ${side[sideOf(askedPair)]} = ${correct}.`,
          steps: [
            hypotenuseStep,
            `Match sides through the correspondence: ${givenPair} ↔ ${sideOf(givenPair)}, ${askedPair} ↔ ${sideOf(askedPair)}.`,
            `Scale factor: ${givenLength} ÷ ${side[sideOf(givenPair)]} = ${scale}.`,
            `${askedPair} = ${scale} × ${side[sideOf(askedPair)]} = ${correct}.`,
          ],
          principles: [
            "A trigonometric ratio fixes the shape of a right triangle, so it gives the ratio of all three sides.",
            "Corresponding sides of similar triangles are proportional; the correspondence decides which sides match.",
          ],
          trap: `The second triangle's letters are not in corresponding order, so matching them alphabetically picks the wrong side.`,
          verify: () => {
            const A = [side.AC, 0];
            const B = [0, side.BC];
            const C = [0, 0];
            const map = ([x, y]) => [7 + scale * (0.28 * x - 0.96 * y), 2 + scale * (0.96 * x + 0.28 * y)];
            const images = { [image.A]: map(A), [image.B]: map(B), [image.C]: map(C) };
            const length = (pair) => dist(images[pair[0]], images[pair[1]]);
            const [top, bottom] = ratios[givenVertex][givenFn];
            const angle = toRad(angleAt(givenVertex === "A" ? A : B, C, givenVertex === "A" ? B : A));
            const fnValue = { sin: Math.sin(angle), cos: Math.cos(angle), tan: Math.tan(angle) }[givenFn];
            return close(length(givenPair), givenLength, 1e-9) && close(length(askedPair), correct, 1e-9) && close(fnValue, top / bottom, 1e-9);
          },
        };
      }
    },
  };

  /* ================================================ 6. scaling area/volume */

  const CHANGE_SOLIDS = [
    { name: "right circular cylinder", short: "cylinder", dims: ["radius", "height"], volume: (r, h) => Math.PI * r * r * h },
    { name: "right circular cone", short: "cone", dims: ["radius", "height"], volume: (r, h) => (Math.PI * r * r * h) / 3 },
    { name: "pyramid with a square base", short: "pyramid", dims: ["base edge length", "height"], volume: (s, h) => (s * s * h) / 3 },
    { name: "rectangular prism with a square base", short: "prism", dims: ["base edge length", "height"], volume: (s, h) => s * s * h },
  ];
  const COMPENSATIONS = [
    { r: 1.25, h: 0.64 }, { r: 2, h: 0.25 }, { r: 2.5, h: 0.16 }, { r: 0.8, h: 1.5625 }, { r: 0.5, h: 4 }, { r: 0.4, h: 6.25 },
  ];
  const SPHERE_FACTORS = [1.1, 1.2, 1.3, 1.4, 1.5, 2, 0.9, 0.8, 0.7, 0.6, 0.5];
  const CUBE_FACTORS = [1.1, 1.2, 1.3, 1.5, 2, 0.9, 0.8, 0.7, 0.6, 0.5];
  const BOX_PERCENTS = [10, 20, 25, 50, -10, -20, -25, -40, -50];
  const SIMILAR_RATIOS = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [2, 5], [1, 3]];
  const SIMILAR_SOLIDS = ["rectangular prisms", "square pyramids", "right circular cones", "right circular cylinders"];
  const SPHERE_NAMES = ["a sphere", "a spherical balloon", "a spherical tank", "a ball"];

  const pct = (value) => `${num(round4(value))}%`;
  const direction = (value) => (value > 0 ? "increase" : "decrease");
  const changeWords = (value) => `${value > 0 ? "increased" : "decreased"} by ${Math.abs(value)}%`;

  // Wrong percent answers for a change in direction `up`, as display
  // strings: only positive magnitudes, and never a decrease of 100% or more.
  function percentLures(up, list) {
    return list.map(([value, reason]) => {
      if (value === null || !Number.isFinite(value) || value <= 0 || (!up && value >= 100)) return [null, reason];
      return [pct(value), reason];
    });
  }

  const scalingSolids = {
    id: "scaling-area-volume",
    domain: DOMAIN,
    skill: "Area and volume",
    subskill: "volume",
    title: "Percent and scale changes in area and volume",
    recognize:
      "Percent changes to dimensions multiply as factors, and volume uses each length factor as often as that length " +
      "appears in the formula (squared for a radius, cubed for a similar solid); areas use the square of the length factor.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "percent-base", "intermediate-value"],
    build(t) {
      const form = t.pick(["change", "change", "compensate", "compensate", "sphere", "cube", "box", "similar", "similar"]);
      const numeric = t.chance(0.36);
      const principles = [
        "Percent changes combine by multiplying factors: +20% is × 1.2 and −10% is × 0.9.",
        "If every length of a solid is multiplied by k, its surface area is multiplied by k² and its volume by k³.",
      ];

      if (form === "change") {
        for (;;) {
          const solid = t.pick(CHANGE_SOLIDS);
          const dim = solid.dims[0];
          const p = t.pick([10, 20, 30, 40, 50, -10, -20, -30, -40, -50]);
          const q = t.pick([10, 20, 25, 40, 50, -10, -20, -25, -40, -50]);
          const fr = 1 + p / 100;
          const fh = 1 + q / 100;
          const factor = fr * fr * fh;
          const change = round4(100 * (factor - 1));
          if (Math.abs(change) < 2 || !fitsGrid(change)) continue;
          const up = change > 0;
          const signed = (value) => (Math.sign(value) === Math.sign(change) ? Math.abs(value) : null);
          const wrong = distinctWrong(numeric ? Math.abs(change) : pct(Math.abs(change)), percentLures(up, [
            [signed(p + q), "Adds the two percent changes, as if the volume changed by their sum."],
            [signed(2 * p + q), `Doubles the percent change in the ${dim} for the square, then adds, instead of multiplying factors.`],
            [signed(round4(100 * (fr * fh - 1))), `Treats the volume as proportional to the ${dim} rather than to its square.`],
            [round4(100 * factor), "Gives the new volume as a percent of the original volume instead of the percent change."],
            [round4(Math.abs(factor - 1)), "Finds the decimal change and writes it as a percent without multiplying by 100."],
          ]));
          if (!numeric && wrong.length < 3) continue;
          const opener = `The ${dim} of a ${solid.name} is ${changeWords(p)}, and its height is ${changeWords(q)}.`;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 105,
            stimulus: null,
            figure: null,
            stem: numeric
              ? `${opener} As a result, the volume of the ${solid.short} ${up ? "increases" : "decreases"} by p%. What is the value of p?`
              : `${opener} By what percent does the volume of the ${solid.short} ${direction(change)}?`,
            correct: numeric ? Math.abs(change) : pct(Math.abs(change)),
            wrong,
            hint: `How many times does the ${dim} appear in the volume formula?`,
            explanation:
              `The volume is proportional to (${dim})² × height. The ${dim} factor is ${num(fr)} and the height factor is ${num(fh)}, ` +
              `so the volume is multiplied by ${num(fr)}² × ${num(fh)} = ${num(round4(factor))} and ${up ? "increases" : "decreases"} by ${num(Math.abs(change))}%.`,
            steps: [
              `Write each change as a factor: ${num(fr)} and ${num(fh)}.`,
              `The ${dim} is squared in the volume formula: ${num(fr)}² = ${num(round4(fr * fr))}.`,
              `Volume factor: ${num(round4(fr * fr))} × ${num(fh)} = ${num(round4(factor))}.`,
              `Percent change: ${num(round4(factor))} − 1 = ${num(round4(factor - 1))}, so the volume ${up ? "increases" : "decreases"} by ${num(Math.abs(change))}%.`,
            ],
            principles,
            trap: "Adding the percents, or doubling one of them for the square, treats multiplication as addition; the factors must be multiplied.",
            verify: () => {
              const before = solid.volume(10, 10);
              const after = solid.volume(10 * fr, 10 * fh);
              return close((100 * (after - before)) / before, change, 1e-9);
            },
          };
        }
      }

      if (form === "compensate") {
        for (;;) {
          const solid = t.pick(CHANGE_SOLIDS);
          const dim = solid.dims[0];
          const { r: fr, h: fh } = t.pick(COMPENSATIONS);
          const givenRadius = t.chance(0.55);
          const rPct = round4(100 * (fr - 1));
          const hPct = round4(100 * (fh - 1));
          const givenPct = givenRadius ? rPct : hPct;
          const askedPct = givenRadius ? hPct : rPct;
          const answer = Math.abs(askedPct);
          if (!fitsGrid(answer)) continue;
          const up = askedPct > 0;
          const givenDim = givenRadius ? dim : "height";
          const askedDim = givenRadius ? "height" : dim;
          const askedDirection = up ? "increased" : "decreased";
          const wrong = distinctWrong(numeric ? answer : pct(answer), percentLures(up, givenRadius
            ? [
              [Math.abs(rPct), `Changes the height by the same percent as the ${dim}, ignoring that the ${dim} is squared.`],
              [round4(Math.abs(100 * (1 / fr - 1))), `Undoes the ${dim} factor once instead of undoing its square.`],
              [round4(Math.abs(100 * (fr * fr - 1))), `Gives the percent change in the base area (the square of the ${dim}), not the needed change in height.`],
              [Math.abs(2 * rPct), "Doubles the percent to account for the square instead of squaring the factor."],
            ]
            : [
              [Math.abs(hPct), `Changes the ${dim} by the same percent as the height, ignoring that the ${dim} is squared.`],
              [round4(Math.abs(hPct) / 2), "Halves the percent to undo the square instead of taking the square root of the factor."],
              [round4(Math.abs(100 * (1 / fh - 1))), `Finds the change needed in the square of the ${dim}, not in the ${dim} itself.`],
              [round4(Math.abs(100 * (1 - Math.sqrt(fh)))), "Takes the square root of the height factor instead of its reciprocal, which reverses the direction of the change."],
            ]));
          if (!numeric && wrong.length < 3) continue;
          const opener = `The ${givenDim} of a ${solid.name} is ${givenPct > 0 ? "increased" : "decreased"} by ${Math.abs(givenPct)}%.`;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 110,
            stimulus: null,
            figure: null,
            stem: numeric
              ? `${opener} Its ${askedDim} is then ${askedDirection} by p% so that the volume of the ${solid.short} is unchanged. What is the value of p?`
              : `${opener} By what percent must its ${askedDim} be ${askedDirection} so that the volume of the ${solid.short} does not change?`,
            correct: numeric ? answer : pct(answer),
            wrong,
            hint: "Write each change as a multiplier. What must their combined effect on the volume be?",
            explanation:
              `The volume is proportional to (${dim})² × height, so the factors must satisfy (${dim} factor)² × (height factor) = 1. ` +
              (givenRadius
                ? `The ${dim} factor is ${num(fr)}, so the height factor is 1 ÷ ${num(fr)}² = 1 ÷ ${num(round4(fr * fr))} = ${num(fh)}: the height is ${askedDirection} by ${answer}%.`
                : `The height factor is ${num(fh)}, so the ${dim} factor is √(1 ÷ ${num(fh)}) = ${num(fr)}: the ${dim} is ${askedDirection} by ${answer}%.`),
            steps: [
              `Volume ∝ (${dim})² × height, so the factors must multiply to 1.`,
              givenRadius ? `${dim} factor ${num(fr)}; squared: ${num(round4(fr * fr))}.` : `Height factor ${num(fh)}.`,
              givenRadius ? `Height factor: 1 ÷ ${num(round4(fr * fr))} = ${num(fh)}.` : `${dim} factor: √(1 ÷ ${num(fh)}) = ${num(fr)}.`,
              `The ${askedDim} is ${askedDirection} by ${answer}%.`,
            ],
            principles,
            trap: `Undoing a percent change by the same percent, or ignoring the square on the ${dim}, leaves the volume changed.`,
            verify: () => close(solid.volume(10 * fr, 10 * fh), solid.volume(10, 10), 1e-9),
          };
        }
      }

      if (form === "sphere" || form === "cube") {
        for (;;) {
          const sphere = form === "sphere";
          const f = t.pick(sphere ? SPHERE_FACTORS : CUBE_FACTORS);
          const vPct = round4(100 * (f ** 3 - 1));
          const sPct = round4(100 * (f ** 2 - 1));
          const lPct = round4(100 * (f - 1));
          const up = f > 1;
          const change = up ? "increases" : "decreases";
          const lengthWord = sphere ? "radius" : "edge length";
          const thing = sphere ? t.pick(SPHERE_NAMES) : "a cube";
          const short = sphere ? "the sphere's" : "the cube's";
          // sphere: volume <-> surface area; cube: edge -> volume or surface area.
          const kind = sphere ? t.pick(["VtoS", "StoV"]) : t.pick(["LtoV", "LtoS"]);
          const answer = Math.abs({ VtoS: sPct, StoV: vPct, LtoV: vPct, LtoS: sPct }[kind]);
          if (!fitsGrid(answer)) continue;
          const askedWord = kind === "VtoS" || kind === "LtoS" ? "surface area" : "volume";
          const lures = {
            VtoS: [
              [Math.abs(vPct), "Assumes the surface area changes by the same percent as the volume."],
              [Math.abs(lPct), "Stops at the percent change in the radius."],
              [round4(100 * f ** 2), "Gives the new surface area as a percent of the original instead of the percent change."],
              [round4((Math.abs(vPct) * 2) / 3), "Scales the percent by 2/3, treating exponents as multipliers of percent changes."],
            ],
            StoV: [
              [Math.abs(sPct), "Assumes the volume changes by the same percent as the surface area."],
              [Math.abs(lPct), "Stops at the percent change in the radius."],
              [round4(100 * f ** 3), "Gives the new volume as a percent of the original instead of the percent change."],
              [round4((Math.abs(sPct) * 3) / 2), "Scales the percent by 3/2, treating exponents as multipliers of percent changes."],
            ],
            LtoV: [
              [Math.abs(3 * lPct), "Triples the percent change in the edge instead of cubing the factor."],
              [Math.abs(sPct), "Squares the edge factor, which gives the change in surface area, not volume."],
              [round4(100 * f ** 3), "Gives the new volume as a percent of the original instead of the percent change."],
              [Math.abs(lPct), "Assumes the volume changes by the same percent as each edge."],
            ],
            LtoS: [
              [Math.abs(2 * lPct), "Doubles the percent change in the edge instead of squaring the factor."],
              [Math.abs(vPct), "Cubes the edge factor, which gives the change in volume, not surface area."],
              [round4(100 * f ** 2), "Gives the new surface area as a percent of the original instead of the percent change."],
              [Math.abs(6 * lPct), "Multiplies the percent change by 6, the number of faces."],
            ],
          }[kind];
          const wrong = distinctWrong(numeric ? answer : pct(answer), percentLures(up, lures));
          if (!numeric && wrong.length < 3) continue;
          const opener = {
            VtoS: `When the radius of ${thing} is changed, its volume ${change} by ${Math.abs(vPct)}%.`,
            StoV: `When the radius of ${thing} is changed, its surface area ${change} by ${Math.abs(sPct)}%.`,
            LtoV: `Each edge of a cube is ${changeWords(lPct)}.`,
            LtoS: `Each edge of a cube is ${changeWords(lPct)}.`,
          }[kind];
          const factorFrom = { VtoS: f ** 3, StoV: f ** 2, LtoV: f, LtoS: f }[kind];
          const power = askedWord === "volume" ? 3 : 2;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 105,
            stimulus: null,
            figure: null,
            stem: numeric
              ? `${opener} As a result, ${short} ${askedWord} ${change} by p%. What is the value of p?`
              : `${opener} By what percent does ${short} ${askedWord} ${direction(f - 1)}?`,
            correct: numeric ? answer : pct(answer),
            wrong,
            hint: `What single change to the ${lengthWord} produces the given change?`,
            explanation:
              (kind === "VtoS" || kind === "StoV"
                ? `The ${kind === "VtoS" ? "volume" : "surface area"} is multiplied by ${num(round4(factorFrom))}, which is ${num(f)}${kind === "VtoS" ? "³" : "²"}, so the radius is multiplied by ${num(f)}. `
                : `Each edge is multiplied by ${num(f)}. `) +
              `The ${askedWord} is multiplied by ${num(f)}${power === 3 ? "³" : "²"} = ${num(round4(f ** power))}, so it ${change} by ${answer}%.`,
            steps: [
              kind === "VtoS" || kind === "StoV" ? `Given factor: ${num(round4(factorFrom))}.` : `Edge factor: ${num(f)}.`,
              kind === "VtoS" || kind === "StoV"
                ? `Radius factor: the ${kind === "VtoS" ? "cube" : "square"} root, ${num(f)}.`
                : `The ${askedWord} depends on the ${power === 3 ? "cube" : "square"} of the edge.`,
              `${askedWord} factor: ${num(f)}${power === 3 ? "³" : "²"} = ${num(round4(f ** power))}.`,
              `The ${askedWord} ${change} by ${answer}%.`,
            ],
            principles,
            trap: "Surface area and volume change by different percents, and exponents do not multiply percent changes; go through the length factor.",
            verify: () => {
              const L = 7;
              const volume = sphere ? (x) => (4 / 3) * Math.PI * x ** 3 : (x) => x ** 3;
              const area = sphere ? (x) => 4 * Math.PI * x ** 2 : (x) => 6 * x ** 2;
              const measured = askedWord === "volume" ? volume(L * f) / volume(L) : area(L * f) / area(L);
              const given = { VtoS: volume(L * f) / volume(L), StoV: area(L * f) / area(L), LtoV: f, LtoS: f }[kind];
              return close(Math.abs(100 * (measured - 1)), answer, 1e-9) && close(given, factorFrom, 1e-12);
            },
          };
        }
      }

      if (form === "box") {
        for (;;) {
          const [p1, p2, p3] = [t.pick(BOX_PERCENTS), t.pick(BOX_PERCENTS), t.pick(BOX_PERCENTS)];
          const f = [1 + p1 / 100, 1 + p2 / 100, 1 + p3 / 100];
          const factor = f[0] * f[1] * f[2];
          const original = t.pick([120, 160, 200, 240, 300, 320, 360, 400, 480, 600, 640, 800]);
          const answer = round4(original * factor);
          if (Math.abs(factor - 1) < 0.02 || !Number.isInteger(answer) || !fitsGrid(answer)) continue;
          const sum = p1 + p2 + p3;
          const flipped = original * f.map((value) => (value < 1 ? 2 - value : value)).reduce((a, b) => a * b, 1);
          const wrong = distinctWrong(answer, [
            [round4(original * (1 + sum / 100)), "Adds the three percent changes and applies the total to the volume."],
            [round4(Math.abs(original * (factor - 1))), "Finds the change in volume instead of the new volume."],
            [factor < 1 || f.some((value) => value < 1) ? round4(flipped) : null, "Applies each decrease as an increase of the same percent."],
            [round4(original * f[0] * f[1]), "Applies the changes to the length and width but not the height."],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 110,
            stimulus: null,
            figure: null,
            stem:
              `A rectangular box has a volume of ${original} cubic inches. Its length is ${changeWords(p1)}, its width is ` +
              `${changeWords(p2)}, and its height is ${changeWords(p3)}. What is the volume, in cubic inches, of the new box?`,
            correct: answer,
            wrong,
            hint: "Write each change as a multiplier.",
            explanation:
              `The volume is length × width × height, so it is multiplied by ${num(f[0])} × ${num(f[1])} × ${num(f[2])} = ${num(round4(factor))}. ` +
              `The new volume is ${original} × ${num(round4(factor))} = ${answer} cubic inches.`,
            steps: [
              `Factors: ${num(f[0])}, ${num(f[1])}, ${num(f[2])}.`,
              `Volume factor: ${num(round4(factor))}.`,
              `New volume: ${original} × ${num(round4(factor))} = ${answer}.`,
            ],
            principles,
            trap: `Adding the percents gives ${num(round4(original * (1 + sum / 100)))}; percent changes to different dimensions multiply.`,
            verify: () => {
              const [l, w] = [4, 5];
              const h = original / (l * w);
              return close(l * f[0] * (w * f[1]) * (h * f[2]), answer, 1e-9);
            },
          };
        }
      }

      // similar solids
      for (;;) {
        const [m, n] = t.pick(SIMILAR_RATIOS);
        const solids = t.pick(SIMILAR_SOLIDS);
        const variant = t.pick(["ratio", "volume", "volume", "area"]);
        if (variant === "ratio") {
          const correct = `${m ** 3} to ${n ** 3}`;
          const wrong = distinctWrong(correct, [
            [`${m * m} to ${n * n}`, "Uses the ratio of the surface areas as the ratio of the volumes."],
            [`${m} to ${n}`, "Finds the ratio of corresponding lengths and stops."],
            [`${m ** 4} to ${n ** 4}`, "Squares the surface-area ratio instead of converting it to a length ratio first."],
            [`${m ** 6} to ${n ** 6}`, "Cubes the surface-area ratio instead of the length ratio."],
          ]);
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 100,
            stimulus: null,
            figure: null,
            stem: `Two similar ${solids} have total surface areas in the ratio ${m * m} to ${n * n}. What is the ratio of the volume of the smaller solid to the volume of the larger solid?`,
            correct,
            wrong,
            hint: "What ratio of lengths produces that ratio of areas?",
            explanation:
              `Areas of similar solids are in the ratio of the squares of corresponding lengths, so the lengths are in the ratio ${m} to ${n}. ` +
              `Volumes are in the ratio of the cubes: ${m ** 3} to ${n ** 3}.`,
            steps: [`Area ratio ${m * m} : ${n * n} = (length ratio)².`, `Length ratio: ${m} : ${n}.`, `Volume ratio = (length ratio)³ = ${m ** 3} : ${n ** 3}.`],
            principles,
            trap: "The area ratio is not the volume ratio; convert it to a length ratio first.",
            verify: () => {
              const box = (s) => ({ area: 2 * (s * 2 * s + s * 3 * s + 2 * s * 3 * s), volume: s * 2 * s * 3 * s });
              const small = box(m);
              const large = box(n);
              return close(small.area / large.area, (m * m) / (n * n), 1e-12) && close(small.volume / large.volume, m ** 3 / n ** 3, 1e-12);
            },
          };
        }
        if (solids.includes("cones") || solids.includes("cylinders")) continue;
        const w = t.int(1, 4);
        const box = (s) => ({ area: 2 * (s * 2 * s + s * 3 * s + 2 * s * 3 * s), volume: s * 2 * s * 3 * s });
        if (variant === "volume") {
          const byHeight = t.chance(0.4);
          const smallVolume = m ** 3 * w;
          const answer = n ** 3 * w;
          if (!fitsGrid(answer)) continue;
          const heightScale = byHeight ? t.pick([2, 3, 4]) : 1;
          const stemGiven = byHeight
            ? `Two similar ${solids} have heights of ${m * heightScale} centimeters and ${n * heightScale} centimeters.`
            : `Two similar ${solids} have total surface areas in the ratio ${m * m} to ${n * n}.`;
          const wrong = distinctWrong(answer, [
            [byHeight ? n * n * m * w : m * n * n * w, byHeight
              ? "Scales the volume by the square of the height ratio, as for an area."
              : "Scales the volume by the surface-area ratio instead of the cube of the length ratio."],
            [m * m * n * w, byHeight ? "Scales the volume by the height ratio alone." : "Scales the volume by the length ratio alone."],
            [w * m * m * (3 * n - 2 * m), "Triples the percent increase in length instead of cubing the scale factor."],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 105,
            stimulus: null,
            figure: null,
            stem: `${stemGiven} The volume of the smaller solid is ${smallVolume} cubic centimeters. What is the volume, in cubic centimeters, of the larger solid?`,
            correct: answer,
            wrong,
            hint: byHeight ? "How does volume respond when every length is scaled?" : "What ratio of lengths produces that ratio of areas?",
            explanation:
              (byHeight
                ? `The heights give the ratio of corresponding lengths, ${m} to ${n}. `
                : `The surface areas are in the ratio ${m * m} to ${n * n}, so corresponding lengths are in the ratio ${m} to ${n}. `) +
              `Volumes are in the ratio ${m ** 3} to ${n ** 3}, so the larger volume is ${smallVolume} × ${n ** 3}/${m ** 3} = ${answer}.`,
            steps: [
              byHeight ? `Length ratio: ${m * heightScale}/${n * heightScale} = ${m}/${n}.` : `Length ratio: √(${m * m}/${n * n}) = ${m}/${n}.`,
              `Volume ratio: (${m}/${n})³ = ${m ** 3}/${n ** 3}.`,
              `Larger volume: ${smallVolume} × ${n ** 3}/${m ** 3} = ${answer}.`,
            ],
            principles,
            trap: `Scaling the volume by an area ratio or by the length ratio misses that volume depends on the cube of the length ratio.`,
            verify: () => {
              const edge = Math.cbrt(smallVolume / 6);
              const small = box(edge);
              const large = box((edge * n) / m);
              return close(large.area / small.area, (n * n) / (m * m), 1e-12) && close(large.volume, answer, 1e-9);
            },
          };
        }
        // area from a volume ratio
        const smallArea = m * m * w;
        const answer = n * n * w;
        if (!fitsGrid(answer)) continue;
        const wrong = distinctWrong(answer, [
          [round4((smallArea * n ** 3) / m ** 3), "Scales the surface area by the volume ratio."],
          [m * n * w, "Scales the surface area by the length ratio alone."],
          [w * m * (2 * n - m), "Doubles the percent increase in length instead of squaring the scale factor."],
          [round4((smallArea * n ** 1.5) / m ** 1.5), "Takes the square root of the volume ratio instead of the cube root."],
        ]);
        if (!numeric && wrong.length < 3) continue;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 105,
          stimulus: null,
          figure: null,
          stem:
            `Two similar ${solids} have volumes in the ratio ${m ** 3} to ${n ** 3}. The total surface area of the smaller solid is ` +
            `${smallArea} square centimeters. What is the total surface area, in square centimeters, of the larger solid?`,
          correct: answer,
          wrong,
          hint: "What ratio of lengths produces that ratio of volumes?",
          explanation:
            `The volumes are in the ratio ${m ** 3} to ${n ** 3}, so corresponding lengths are in the ratio ${m} to ${n} and surface areas in the ratio ` +
            `${m * m} to ${n * n}. The larger surface area is ${smallArea} × ${n * n}/${m * m} = ${answer}.`,
          steps: [`Length ratio: cube root of ${m ** 3}/${n ** 3} = ${m}/${n}.`, `Area ratio: (${m}/${n})² = ${m * m}/${n * n}.`, `Larger area: ${smallArea} × ${n * n}/${m * m} = ${answer}.`],
          principles,
          trap: "The volume ratio is not the area ratio; take its cube root to get the length ratio, then square.",
          verify: () => {
            const edge = Math.sqrt(smallArea / 22);
            const small = box(edge);
            const large = box((edge * n) / m);
            return close(large.volume / small.volume, n ** 3 / m ** 3, 1e-12) && close(large.area, answer, 1e-9);
          },
        };
      }
    },
  };

  return [similarTriangles, angleChase, arcSector, circleEquation, trigCofunction, scalingSolids];
});
