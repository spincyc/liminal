(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/geometry-and-trigonometry"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Lines, angles, and triangles templates (Geometry and Trigonometry), ordered Easy, Medium, Hard.

  const { MINUS, num } = S;
  const {
    P, GEO, isClean, fmt, shown, retry, pack, add, sub, mul, unit, lerp, mid, dist, toRad, centroid,
    close, angleAt, shoelace, fitPoints, r1, seg, measure, name, nameAway, normalAway, sideLabel,
    angleArc, angleLabel, DOMAIN, heading, segHard, distinctWrong,
  } = C;

  function polyline(points, width = 1.5) {
    return `<polyline points="${points.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }

  // Parallel-line arrowhead on segment pq, pointing from p toward q.
  function arrow(p, q, at = 0.5) {
    const u = unit(sub(q, p));
    const n = [-u[1], u[0]];
    const tip = add(lerp(p, q, at), mul(u, 4));
    const back = add(tip, mul(u, -7));
    return polyline([add(back, mul(n, 5)), tip, add(back, mul(n, -5))], 1.8);
  }

  /* ====================================== angle-pair-single-step (Easy) */

  // At each crossing of line t with a horizontal line, the four angles are
  // named by the rays that bound them. UR and LL measure φ (t's inclination).
  const QUAD_RAYS = { UR: ["right", "up"], UL: ["left", "up"], LL: ["left", "down"], LR: ["right", "down"] };

  const quadMeasure = (quad, phi) => (quad === "UR" || quad === "LL" ? phi : 180 - phi);

  const NAMED_PAIRS = [
    { a: ["top", "LR"], b: ["bot", "UR"], kind: "same-side interior angles" },
    { a: ["top", "LL"], b: ["bot", "UL"], kind: "same-side interior angles" },
    { a: ["top", "LR"], b: ["bot", "UL"], kind: "alternate interior angles" },
    { a: ["top", "LL"], b: ["bot", "UR"], kind: "alternate interior angles" },
    { a: ["top", "UR"], b: ["bot", "LL"], kind: "alternate exterior angles" },
    { a: ["top", "UL"], b: ["bot", "LR"], kind: "alternate exterior angles" },
    { a: ["top", "UR"], b: ["bot", "UR"], kind: "corresponding angles" },
    { a: ["top", "LL"], b: ["bot", "LL"], kind: "corresponding angles" },
    { a: ["top", "UL"], b: ["bot", "UL"], kind: "corresponding angles" },
    { a: ["top", "LR"], b: ["bot", "LR"], kind: "corresponding angles" },
    { a: ["top", "UR"], b: ["top", "LL"], kind: "vertical angles" },
    { a: ["bot", "UL"], b: ["bot", "LR"], kind: "vertical angles" },
    { a: ["top", "UR"], b: ["top", "UL"], kind: "a linear pair" },
    { a: ["bot", "LL"], b: ["bot", "LR"], kind: "a linear pair" },
  ];

  function transversalFigure(phi, marks) {
    const yl = 86;
    const ym = 196;
    const up = [Math.cos(toRad(phi)), -Math.sin(toRad(phi))];
    const run = (ym - yl) / Math.tan(toRad(phi));
    const T1 = [200 + run / 2, yl];
    const T2 = add(T1, mul(up, -(ym - yl) / Math.sin(toRad(phi))));
    const rays = { right: [1, 0], left: [-1, 0], up, down: mul(up, -1) };
    const topEnd = add(T1, mul(up, 56));
    const parts = [
      seg([14, yl], [386, yl]),
      seg([14, ym], [386, ym]),
      seg(topEnd, add(T2, mul(up, -56))),
      arrow([14, yl], [386, yl], 0.08),
      arrow([14, ym], [386, ym], 0.08),
      P.text(376, yl - 14, "ℓ"),
      P.text(376, ym - 14, "m"),
      P.text(topEnd[0] + (up[0] >= 0 ? 12 : -12), topEnd[1] + 2, "t"),
    ];
    const at = { top: T1, bot: T2 };
    marks.forEach(({ where, quad, text }) => {
      const vertex = at[where];
      const [first, second] = QUAD_RAYS[quad];
      const p = add(vertex, rays[first]);
      const q = add(vertex, rays[second]);
      const gap = Math.max(28, 15 / Math.sin(toRad(angleAt(vertex, p, q) / 2)));
      parts.push(angleArc(vertex, p, q, 15));
      parts.push(angleLabel(vertex, p, q, text, gap));
    });
    return { parts, T1, T2, rays };
  }

  const QUAD_WORDS = {
    UR: "above the line and to the right of t",
    UL: "above the line and to the left of t",
    LL: "below the line and to the left of t",
    LR: "below the line and to the right of t",
  };

  /* ==================================== crossing-similar-triangles (Medium) */

  const BOWTIE_NAMES = [["A", "B", "C", "D", "E"], ["P", "Q", "R", "S", "T"], ["J", "K", "L", "M", "N"], ["F", "G", "H", "J", "K"]];

  const SCALE_PAIRS = [[1, 2], [2, 1], [2, 3], [3, 2], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5], [5, 3], [4, 5], [5, 4]];

  // Top triangle ABC (AB horizontal, C below it) and bottom triangle EDC,
  // with E = C + k(C − A) and D = C + k(C − B), so DE ∥ AB, D below-left of C
  // and E below-right. Coordinates are ordinary (y up).
  function bowtie(c, fx, depth, k) {
    const A = [0, 0];
    const B = [c, 0];
    const C = [fx * c, -depth];
    const E = add(C, mul(sub(C, A), k));
    const D = add(C, mul(sub(C, B), k));
    return { A, B, C, D, E };
  }

  // Congruence tick marks across segment pq.
  function ticks(p, q, count = 1, at = 0.5) {
    const u = unit(sub(q, p));
    const n = [-u[1], u[0]];
    const center = lerp(p, q, at);
    const out = [];
    for (let index = 0; index < count; index += 1) {
      const c = add(center, mul(u, (index - (count - 1) / 2) * 5));
      out.push(segHard(add(c, mul(n, 6)), add(c, mul(n, -6)), 1.5));
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

  /* ------------------------------------------------------------- notation */

  // "(3x + 15)°", or "4x°" when there is no constant.
  const degExpr = (a, b) => (b === 0 ? `${S.lin(a, 0)}°` : `(${S.lin(a, b)})°`);

  /* =================================================== similar triangles */

  const TRIANGLE_NAMES = [
    ["A", "B", "C", "D", "E"],
    ["P", "Q", "R", "S", "T"],
    ["J", "K", "L", "M", "N"],
    ["R", "S", "T", "U", "V"],
  ];

  // All part ratios (XM : MY) for figures drawn to scale; for figures drawn
  // with M at the midpoint, only ratios whose true fraction XM/XY lies
  // between 1/3 and 2/3, so the drawing is noticeably but not absurdly off.
  const PART_RATIOS = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5], [5, 3]];

  const MIDPOINT_RATIOS = [[1, 2], [2, 1], [2, 3], [3, 2], [3, 4], [4, 3], [3, 5], [5, 3]];

  // Apex X at the top, base YZ at the bottom, M on XY and N on XZ. With
  // `fraction` (XM/XY) the cut is drawn where it really is; without it, M and
  // N are drawn at the midpoints so MN reads as a midsegment.
  function cutFigure(t, names, onLeft, shown, fraction = null) {
    const [X, Y, Z, M, N] = names;
    const A = [t.int(150, 250), 40];
    const B = [t.int(34, 70), 244];
    const C = [t.int(330, 366), 244];
    const f = fraction === null ? t.pick([0.48, 0.5, 0.52]) : fraction;
    const D = lerp(A, B, f);
    const E = lerp(A, C, f);
    const G = centroid([A, B, C]);
    const parts = [
      P.polygon([A, B, C]),
      segHard(D, E),
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
      (fraction === null
        ? `${M} and ${N} are drawn at the midpoints of their sides, so ${M}${N} looks like half of ${Y}${Z}.`
        : `The figure is drawn to scale.`);
    return { svg: S.svg(400, 280, parts, alt), alt, notToScale: fraction === null };
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

  /* =============================================== angle chase, not to scale */

  const OPPOSITE = { UR: "LL", LL: "UR", UL: "LR", LR: "UL" };

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

  // Parallel lines ℓ (top) and m, crossed by t. With `phiTrue` (t's true
  // inclination) the figure is drawn to scale; without it, t is drawn within
  // a few degrees of perpendicular so every angle looks like a right angle.
  function transversalFigureHard(t, marks, phiTrue = null) {
    const yl = 86;
    const ym = 196;
    const phiDrawn = phiTrue === null ? 90 + t.pick([-1, 1]) * t.int(3, 6) : phiTrue;
    const up = heading(phiDrawn);
    // Center the crossing segment horizontally so steep and shallow t both fit.
    const run = (ym - yl) / Math.tan(toRad(phiDrawn));
    const T1 = [200 + run / 2 + t.int(-12, 12), yl];
    const T2 = add(T1, mul(up, -(ym - yl) / Math.sin(toRad(phiDrawn))));
    const rays = { right: [1, 0], left: [-1, 0], up, down: mul(up, -1) };
    const reach = phiTrue === null ? 62 : 50;
    const topEnd = add(T1, mul(up, reach));
    const parts = [
      segHard([14, yl], [386, yl]),
      segHard([14, ym], [386, ym]),
      segHard(topEnd, add(T2, mul(up, -reach))),
      arrows([14, yl], [386, yl], 1, 0.08),
      arrows([14, ym], [386, ym], 1, 0.08),
      P.text(376, yl - 14, "ℓ"),
      P.text(376, ym - 14, "m"),
      P.text(topEnd[0] + (up[0] >= 0 ? 12 : -12), topEnd[1] + 2, "t"),
    ];
    marks.forEach(({ at, quad, text }) => {
      const vertex = at === "top" ? T1 : T2;
      const [first, second] = QUAD_RAYS[quad];
      const p = add(vertex, rays[first]);
      const q = add(vertex, rays[second]);
      // Keep the label clear of both rays, however narrow the angle.
      const gap = Math.max(28, 15 / Math.sin(toRad(angleAt(vertex, p, q) / 2)));
      parts.push(angleArc(vertex, p, q, 15));
      parts.push(angleLabel(vertex, p, q, text, gap));
    });
    const described = marks
      .map(({ at, quad, text }) => `at line ${at === "top" ? "ℓ" : "m"}, the angle ${QUAD_WORDS[quad]} is labeled ${text}`)
      .join("; ");
    const alt =
      `Horizontal lines ℓ (top) and m (bottom), marked parallel with arrows, are crossed by line t` +
      (phiTrue === null
        ? `, which is drawn almost perpendicular to them, so every angle at the two intersections looks like a right angle. `
        : `, which is drawn to scale, slanting ${phiTrue < 90 ? "up to the right" : "up to the left"}. `) +
      `${described.charAt(0).toUpperCase()}${described.slice(1)}.`;
    return { svg: S.svg(400, 270, parts, alt), alt, notToScale: phiTrue === null };
  }

  function transversalItem(t, numeric, accurate) {
    for (;;) {
      // Not to scale: t is drawn near 90°, so keep its true inclination 12°–28°
      // away from that; to scale: any clearly slanted inclination.
      const phi = accurate
        ? (t.chance(0.5) ? t.int(38, 76) : t.int(104, 142))
        : (t.chance(0.5) ? t.int(62, 78) : t.int(102, 118));
      const pair = t.chance(accurate ? 0.7 : 0.6) ? t.pick(PAIRS.slice(0, 4)) : t.pick(PAIRS.slice(4));
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
      // A drawing to scale shows every angle's size, so it asks only for x.
      const askY = !accurate && t.chance(0.45);
      const intro = t.pick([
        "In the figure shown, line ℓ is parallel to line m.",
        "In the figure shown, lines ℓ and m are parallel, and line t intersects both of them.",
      ]);
      const relationText = supp
        ? `The angles labeled ${e1} and ${e2} are ${pair.kind} angles, so they are supplementary${accurate ? "" : ", even though the figure makes them look equal"}.`
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
        hint: "Which labeled angles are guaranteed equal by the parallel lines, and which are not?",
        principles: [
          "When a line crosses two parallel lines, corresponding, alternate interior, and alternate exterior angles are equal.",
          "Same-side interior angles, and same-side exterior angles, are supplementary.",
          "A figure marked not drawn to scale can make angles look right or equal when they are not; a figure without that note can be trusted.",
        ],
      };

      if (!askY) {
        const xFig = (90 - b1) / a1;
        if (!accurate && (!Number.isInteger(xFig) || xFig <= 0)) continue;
        // Sign slip while solving a1x + b1 = a2x + b2.
        const xSlip = supp ? null : (b1 + b2) / (a1 - a2);
        const wrong = distinctWrong(x, [
          [accurate ? null : xFig, `Sets ${e1} equal to 90 because line t looks perpendicular to ℓ and m in the figure; the figure is not drawn to scale.`],
          [swapOk ? xSwap : null, supp
            ? `Sets the two labeled angles equal, but ${pair.kind} angles are supplementary.`
            : `Makes the two labeled angles add to 180°, but ${pair.kind} angles are equal.`],
          [th1, `Gives the measure of the angle labeled ${e1}, not the value of x.`],
          [th2, `Gives the measure of the angle labeled ${e2}, not the value of x.`],
          [supp && Number.isInteger((90 - b1 - b2) / (a1 + a2)) ? (90 - b1 - b2) / (a1 + a2) : null,
            `Makes the two labeled angles complementary (sum 90°) instead of supplementary.`],
          [xSlip !== null && Number.isInteger(xSlip) ? xSlip : null, "Moves a constant to the other side without changing its sign while solving."],
        ]).filter(([value]) => typeof value !== "number" || value > 0);
        if (!numeric && wrong.length < 3) continue;
        return {
          ...common,
          figure: transversalFigureHard(t, [{ at: "top", quad: pair.top, text: e1 }, { at: "bot", quad: pair.bot, text: e2 }], accurate ? phi : null),
          stem: `${intro} What is the value of x?`,
          correct: x,
          wrong,
          explanation:
            `${relationText} ${solveStep} Each angle then measures ${th1}° and ${th2}°` +
            (accurate ? ", as the figure shows." : "; line t only looks perpendicular because the figure is not drawn to scale."),
          steps: [
            `Locate the labeled angles: one is ${QUAD_WORDS[pair.top].replace("the line", "ℓ")}, the other ${QUAD_WORDS[pair.bot].replace("the line", "m")}.`,
            `They are ${pair.kind} angles, so they are ${supp ? "supplementary" : "equal"}.`,
            `Write the equation: ${supp ? `(${S.lin(a1, b1)}) + (${S.lin(a2, b2)}) = 180` : equation}.`,
            `Solve: x = ${x}.`,
          ],
          trap: accurate
            ? `${supp ? "Setting the angles equal" : "Making the angles add to 180°"} uses the wrong relationship; ${pair.kind} angles are ${supp ? "supplementary" : "equal"}.`
            : `Line t looks perpendicular in the figure, which is not drawn to scale, so both angles look like 90°. ` +
              `${supp ? "Setting them equal" : "Making them add to 180°"} uses the wrong relationship.`,
          verify: () => close(a1 * x + b1, geometry(pair.top)) && close(a2 * x + b2, geometry(pair.bot)),
        };
      }

      // Third angle y at one of the intersections (not-to-scale figures only).
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
        figure: transversalFigureHard(t, marks),
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
  // vertex. With `apexTrue` it is drawn to scale; otherwise it is drawn so the
  // apex looks right-angled or the triangle looks equilateral.
  function isoscelesFigure(t, look, names, apexText, extText, apexTrue = null) {
    const [A, B, C, D] = names;
    const baseY = 214;
    let w;
    let height;
    if (apexTrue === null) {
      w = look === "right" ? t.int(92, 100) : t.int(78, 86);
      height = w * Math.tan(toRad(look === "right" ? 45 + t.pick([-2, -1, 1, 2]) : 60 + t.pick([-1, 0, 1])));
    } else {
      const slope = Math.tan(toRad(apexTrue / 2));
      w = Math.min(100, 165 * slope);
      height = w / slope;
    }
    const Bp = [t.int(44, 66), baseY];
    const Cp = [Bp[0] + 2 * w, baseY];
    const Ap = [Bp[0] + w, baseY - height];
    const Dp = [Cp[0] + 88, baseY];
    // Apex label deep enough that the triangle is wide enough to hold it.
    const depth = apexTrue === null
      ? (look === "right" ? 44 : 60)
      : Math.min(0.72 * height, Math.max(44, 42 / Math.tan(toRad(apexTrue / 2))));
    const parts = [
      segHard(Ap, Bp),
      segHard(Ap, Cp),
      segHard(Bp, Dp),
      ticks(Ap, Bp),
      ticks(Ap, Cp),
      angleArc(Ap, Bp, Cp, 18),
      measure(add(Ap, [0, depth]), apexText, "middle", 14),
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
      (apexTrue !== null
        ? "The figure is drawn to scale."
        : look === "right"
          ? `The triangle is drawn so that angle ${B}${A}${C} looks like a right angle.`
          : "The triangle is drawn so that it looks equilateral.");
    return { svg: S.svg(400, 250, parts, alt), alt, notToScale: apexTrue === null };
  }

  function isoscelesGeometry(apexDegrees) {
    const half = toRad(apexDegrees / 2);
    const A = [0, 10];
    const B = [-10 * Math.tan(half), 0];
    const C = [10 * Math.tan(half), 0];
    const D = [C[0] + 5, 0];
    return { base: angleAt(B, A, C), ext: angleAt(C, A, D), equalSides: close(dist(A, B), dist(A, C)) };
  }

  function isoscelesItem(t, numeric, accurate) {
    for (;;) {
      const names = t.pick(ISO_NAMES);
      const [A, B, C, D] = names;
      const look = t.pick(["right", "equilateral"]);
      // Not to scale: the true vertex angle stays 16°–26° from the look it
      // imitates. To scale: any vertex angle the drawing can hold.
      const apex = t.pick(accurate
        ? [44, 48, 52, 56, 64, 68, 72, 76, 80, 84, 96, 100, 104, 108, 112, 116, 120, 124, 128]
        : look === "right"
          ? [64, 68, 72, 76, 104, 108, 112, 116]
          : [36, 40, 44, 76, 80, 84]);
      const baseAngle = 90 - apex / 2;
      const ext = 90 + apex / 2;
      const x = t.int(8, 30);
      const a = t.int(1, 4);
      const c = t.int(2, 6);
      if (2 * c === a) continue;
      const b = apex - a * x;
      const d = ext - c * x;
      if (!b || !d || Math.abs(b) > 70 || Math.abs(d) > 70) continue;
      // A drawing to scale shows the angles' sizes, so it asks only for x.
      const askX = accurate || t.chance(0.4);
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
          `Then angle ${B}${A}${C} = ${apex}°, angle ${A}${C}${D} = ${ext}°, and angle ${A}${B}${C} = ${baseAngle}°.` +
          (accurate
            ? ""
            : ` The figure is not drawn to scale: ${look === "right" ? `angle ${B}${A}${C} only looks like a right angle.` : "the triangle only looks equilateral."}`),
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
        trap: accurate
          ? `Taking angles ${A} and ${B} as the equal pair, or treating angle ${A}${C}${D} as supplementary to the vertex angle, sets up the wrong equation.`
          : look === "right"
            ? `Angle ${B}${A}${C} looks like a right angle in the figure, which is not drawn to scale; it measures ${apex}°.`
            : `The triangle looks equilateral in the figure, which is not drawn to scale; its angles are ${apex}°, ${baseAngle}°, and ${baseAngle}°.`,
        figure: isoscelesFigure(t, look, names, apexText, extText, accurate ? apex : null),
      };
      const check = () => {
        const g = isoscelesGeometry(a * x + b);
        return g.equalSides && close(g.ext, c * x + d) && close(g.base, baseAngle);
      };
      if (askX) {
        if (!accurate && (!Number.isInteger(xFig) || xFig <= 0)) continue;
        const wrong = distinctWrong(x, [
          [accurate ? null : xFig, look === "right"
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

  // Parallel lines with a bend point between them. With `truth` ({ alpha,
  // beta }) the bend is drawn to scale; otherwise it is drawn so the angle at
  // the bend looks like a right angle and the two outer angles look equal.
  function bendFigure(t, names, labels, truth = null) {
    const [Qn, Pn, Rn] = names;
    const yl = 52;
    const ym = 212;
    const alphaDrawn = truth ? truth.alpha : t.int(42, 48);
    const betaDrawn = truth ? truth.beta : 90 - alphaDrawn + t.int(-2, 2);
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
    // Labels sit far enough along each bisector to clear both rays.
    const gap = (vertex, p, q, least) => Math.max(least, 15 / Math.sin(toRad(angleAt(vertex, p, q) / 2)));
    const parts = [
      segHard([12, yl], [388, yl]),
      segHard([12, ym], [388, ym]),
      segHard(Q, Pt),
      segHard(Pt, R),
      arrows(fx([12, yl]), fx([388, yl]), 1, 0.85),
      arrows(fx([12, ym]), fx([388, ym]), 1, 0.85),
      P.text(flip ? 22 : 378, yl - 14, "ℓ"),
      P.text(flip ? 22 : 378, ym - 14, "m"),
      angleArc(Q, add(Q, toward), Pt, 20),
      angleArc(R, add(R, toward), Pt, 20),
      angleArc(Pt, Q, R, 18),
      angleLabel(Q, add(Q, toward), Pt, labels.Q, gap(Q, add(Q, toward), Pt, 38)),
      angleLabel(R, add(R, toward), Pt, labels.R, gap(R, add(R, toward), Pt, 38)),
      angleLabel(Pt, Q, R, labels.P, gap(Pt, Q, R, 32)),
      name(add(Q, [0, -15]), Qn),
      name(add(R, [0, 17]), Rn),
      name(add(Pt, [flip ? -15 : 15, 0]), Pn),
    ];
    const alt =
      `Horizontal parallel lines ℓ (top) and m (bottom), marked with arrows. Point ${Qn} is on ℓ, point ${Rn} is on m, and point ${Pn} ` +
      `lies between the lines; segments ${Qn}${Pn} and ${Pn}${Rn} form a bend. The angle between ℓ and ${Qn}${Pn} is labeled ${labels.Q}, ` +
      `the angle between m and ${Rn}${Pn} is labeled ${labels.R}, and angle ${Qn}${Pn}${Rn} is labeled ${labels.P}. ` +
      (truth
        ? "The figure is drawn to scale."
        : `The bend is drawn so that angle ${Qn}${Pn}${Rn} looks like a right angle and the angles at ${Qn} and ${Rn} look equal.`);
    return { svg: S.svg(400, 264, parts, alt), alt, notToScale: !truth };
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

  function bendItem(t, numeric, accurate) {
    for (;;) {
      const names = t.pick(BEND_NAMES);
      const [Qn, Pn, Rn] = names;
      // Not to scale: both outer angles are drawn near 45° and the bend near
      // 90°, so keep each outer angle within 15° of 45° and the bend 12°–28°
      // from 90°. To scale: a wider range, drawn as it is.
      const alpha = accurate ? t.int(24, 70) : t.int(30, 60);
      const beta = accurate ? t.int(24, 70) : t.int(30, 60);
      const sum = alpha + beta;
      if (accurate ? Math.abs(sum - 90) < 8 || sum > 135 : Math.abs(sum - 90) < 12 || Math.abs(sum - 90) > 28 || Math.abs(alpha - beta) < 9) continue;
      // A drawing to scale shows every angle's size, so it asks only for x in an expression.
      const kind = accurate ? "expr" : t.pick(["bend", "arm", "expr"]);
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
      if (!accurate && (!Number.isInteger(xFig) || xFig <= 0)) continue;
      const xTri = (180 - b1 - beta - b3) / (a1 + a3);
      const xFull = (360 - b1 - beta - b3) / (a1 + a3);
      // Bend angle matched with the angle at Q alone.
      const xOne = (b1 - b3) / (a3 - a1);
      // A wrong x is only believable if it leaves every marked angle between 0° and 180°.
      const real = (value) => [a1 * value + b1, a3 * value + b3].every((angle) => angle > 0 && angle < 180);
      const wrong = distinctWrong(x, [
        [accurate ? null : xFig, `Sets ${labels.P} equal to 90 because angle ${angleName} looks like a right angle in the figure; the figure is not drawn to scale.`],
        [Number.isInteger(xTri) && xTri > 0 && real(xTri) ? xTri : null, triReason],
        [Number.isInteger(xFull) && real(xFull) ? xFull : null, fullReason],
        [Number.isInteger(xOne) && xOne > 0 && real(xOne) ? xOne : null,
          `Sets angle ${angleName} equal to the angle at ${Qn} alone, missing the part that matches the ${beta}° angle.`],
        [sum, `Gives the measure of angle ${angleName} instead of the value of x.`],
        [alpha, `Gives the measure of the angle at ${Qn} instead of the value of x.`],
      ]);
      if (!numeric && wrong.length < 3) continue;
      return {
        ...common,
        figure: bendFigure(t, names, labels, accurate ? { alpha, beta } : null),
        stem: `${intro} What is the value of x?`,
        correct: x,
        wrong,
        explanation:
          `${auxiliary} So (${S.lin(a1, b1)}) + ${beta} = ${S.lin(a3, b3)}, which gives x = ${x}. The angle at ${Pn} measures ${sum}°` +
          (accurate ? "." : `, not the 90° it appears to be in the figure.`),
        steps: [
          `Add a line through ${Pn} parallel to ℓ and m.`,
          `Angle ${angleName} is the sum of the angles at ${Qn} and ${Rn}.`,
          `Equation: ${S.lin(a1, b1 + beta)} = ${S.lin(a3, b3)}.`,
          `Solve: x = ${x}.`,
        ],
        trap: accurate
          ? `The three marked angles do not form a triangle, and angle ${angleName} matches both outer angles, not just one.`
          : `Angle ${angleName} looks like a right angle in the figure, which is not drawn to scale; it measures ${sum}°.`,
        verify: () => close(g().atQ, a1 * x + b1) && close(g().atP, a3 * x + b3) && close(g().atR, beta),
      };
    }
  }

  const anglePair = {
    id: "angle-pair-single-step",
    domain: GEO,
    skill: "Lines, angles, and triangles",
    subskill: "angle relationships",
    difficulty: "Easy",
    title: "One angle relationship",
    recognize:
      "Name how the two angles are related before computing: equal (vertical, corresponding, alternate) or supplementary " +
      "(a linear pair, same-side interior); an exterior angle of a triangle equals the sum of the two remote interior angles.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "intermediate-value"],
    build(t) {
      const form = t.pick(["parallel", "parallel", "exterior", "remote"]);
      const numeric = t.chance(0.4);
      return retry(() => {
        if (form === "parallel") {
          const phi = t.chance(0.5) ? t.int(35, 80) : t.int(100, 145);
          if (phi === 45 || phi === 135) return null;
          const pair = t.pick(NAMED_PAIRS);
          const [given, asked] = t.chance(0.5) ? [pair.a, pair.b] : [pair.b, pair.a];
          const a = quadMeasure(given[1], phi);
          const key = quadMeasure(asked[1], phi);
          const equal = key === a;
          const marks = [
            { where: given[0], quad: given[1], text: `${a}°` },
            { where: asked[0], quad: asked[1], text: "x°" },
          ];
          const drawn = transversalFigure(phi, marks);
          const describe = ({ where, quad }) => `at line ${where === "top" ? "ℓ" : "m"}, the angle ${QUAD_WORDS[quad]}`;
          const alt =
            `Horizontal lines ℓ (top) and m (bottom), marked parallel with arrows, crossed by line t, which slants ${phi < 90 ? "up to the right" : "up to the left"}. ` +
            `${describe(marks[0]).charAt(0).toUpperCase()}${describe(marks[0]).slice(1)} is labeled ${a}°; ${describe(marks[1])} is labeled x°. The figure is drawn to scale.`;
          const figure = { svg: S.svg(400, 270, drawn.parts, alt), alt, notToScale: false };
          return pack(numeric, key, fmt(key), [
            [shown(equal ? 180 - a : a, 0), equal ? `Treats the angles as supplementary; ${pair.kind} are equal.` : `Treats the angles as equal; ${pair.kind} are supplementary.`],
            [shown(Math.abs(90 - a), 0), "Treats the angles as complementary; no right angle is involved."],
            [shown(360 - a, 0), "Subtracts from 360°, as if the two angles made a full turn."],
            [shown(180 - key / 2, 0), "Halves an angle for no reason."],
          ], {
            stimulus: null,
            figure,
            stem: `In the figure shown, line ℓ is parallel to line m${pair.kind === "vertical angles" || pair.kind === "a linear pair" ? "" : ", and line t intersects both lines"}. What is the value of x?`,
            explanation: `The angle labeled x° and the ${a}° angle are ${pair.kind}, so ${equal ? `they are equal: x = ${a}` : `they are supplementary: x = 180 ${MINUS} ${a} = ${key}`}.`,
            steps: [
              `Locate both angles: ${describe(marks[0])}, and ${describe(marks[1])}.`,
              `They are ${pair.kind}, which are ${equal ? "equal" : "supplementary"}.`,
              equal ? `x = ${a}.` : `x = 180 ${MINUS} ${a} = ${key}.`,
            ],
            principles: [
              "When parallel lines are cut by a transversal, corresponding, alternate interior, and alternate exterior angles are equal, and same-side interior angles are supplementary.",
              "Vertical angles are equal; angles that form a linear pair are supplementary.",
            ],
            trap: equal ? `The two angles are ${pair.kind}, so they are equal; 180 ${MINUS} ${a} = ${180 - a} is the neighbouring angle.` : `The angles are ${pair.kind}, so they add to 180°; one is acute and the other obtuse, so they cannot be equal.`,
            hint: "Is one of the two angles acute and the other obtuse, or are they the same kind?",
            estimatedSeconds: 55,
            verify: () => {
              const vertex = given[0] === asked[0] ? null : 1;
              const measureAt = ([where, quad]) => {
                const v = where === "top" ? drawn.T1 : drawn.T2;
                const [first, second] = QUAD_RAYS[quad];
                return angleAt(v, add(v, drawn.rays[first]), add(v, drawn.rays[second]));
              };
              return vertex !== undefined && close(measureAt(given), a, 1e-3) && close(measureAt(asked), key, 1e-3);
            },
          });
        }
        // Triangle ABC with BC extended past C to D.
        const beta = t.int(35, 80);
        const gamma = t.int(35, 85);
        const alpha = 180 - beta - gamma;
        if (alpha < 30 || alpha > 105 || alpha === beta) return null;
        const ext = alpha + beta;
        const names = t.pick([["A", "B", "C", "D"], ["P", "Q", "R", "S"], ["J", "K", "L", "M"]]);
        const [A, B, C, D] = names;
        const Bm = [0, 0];
        const Cm = [10, 0];
        const side = (10 * Math.sin(toRad(gamma))) / Math.sin(toRad(alpha));
        const Am = [side * Math.cos(toRad(beta)), side * Math.sin(toRad(beta))];
        const Dm = [15.5, 0];
        const map = fitPoints([Am, Bm, Cm, Dm], 400, 250, 42);
        const [As, Bs, Cs, Ds] = [Am, Bm, Cm, Dm].map(map);
        const G = centroid([As, Bs, Cs]);
        const askExterior = form === "exterior";
        const labelA = `${alpha}°`;
        const labelB = askExterior ? `${beta}°` : "x°";
        const labelExt = askExterior ? "x°" : `${ext}°`;
        const parts = [
          P.polygon([As, Bs, Cs]),
          seg(Cs, Ds),
          angleArc(As, Bs, Cs, 16), angleLabel(As, Bs, Cs, labelA, 30, 14),
          angleArc(Bs, As, Cs, 16), angleLabel(Bs, As, Cs, labelB, 30, 14),
          angleArc(Cs, As, Ds, 16), angleLabel(Cs, As, Ds, labelExt, 30, 14),
          nameAway(As, G, A, 16), name(add(Bs, [-12, 12]), B), name(add(Cs, [0, 18]), C), name(add(Ds, [0, 18]), D),
        ];
        const alt =
          `Triangle ${A}${B}${C} with side ${B}${C} extended past ${C} to point ${D}. Angle ${A} is labeled ${labelA}, angle ${B} is labeled ${labelB}, ` +
          `and exterior angle ${A}${C}${D} is labeled ${labelExt}. The figure is drawn to scale.`;
        const figure = { svg: S.svg(400, 250, parts, alt), alt, notToScale: false };
        const key = askExterior ? ext : beta;
        const candidates = askExterior
          ? [
            [shown(gamma, 0), `Gives angle ${A}${C}${B}, the interior angle at ${C}, instead of the exterior angle.`],
            [shown(180 - alpha, 0), `Subtracts only angle ${A} from 180°.`],
            [shown(180 - beta, 0), `Subtracts only angle ${B} from 180°.`],
            [shown(360 - ext, 0), "Subtracts the sum of the two angles from 360°."],
          ]
          : [
            [shown(gamma, 0), `Gives angle ${A}${C}${B}, the interior angle next to the exterior angle.`],
            [ext + alpha < 180 ? shown(ext + alpha, 0) : null, `Adds angle ${A} to the exterior angle instead of subtracting it.`],
            [shown(180 - alpha, 0), `Subtracts angle ${A} from 180° instead of from the exterior angle.`],
            [shown(180 - ext, 0) === shown(gamma, 0) ? null : shown(180 - ext, 0), "Subtracts the exterior angle from 180°."],
            [shown(ext / 2, 1), "Halves the exterior angle."],
          ];
        return pack(numeric, key, fmt(key), candidates, {
          stimulus: null,
          figure,
          stem: `In the figure shown, points ${B}, ${C}, and ${D} lie on a line. What is the value of x?`,
          explanation: askExterior
            ? `The exterior angle ${A}${C}${D} equals the sum of the two remote interior angles: x = ${alpha} + ${beta} = ${ext}.`
            : `The exterior angle ${A}${C}${D} equals the sum of the two remote interior angles: ${ext} = ${alpha} + x, so x = ${ext} ${MINUS} ${alpha} = ${beta}.`,
          steps: askExterior
            ? [
              `Angle ${A}${C}${D} is an exterior angle of triangle ${A}${B}${C}.`,
              `Its remote interior angles are at ${A} (${alpha}°) and ${B} (${beta}°).`,
              `x = ${alpha} + ${beta} = ${ext}.`,
            ]
            : [
              `Angle ${A}${C}${D} (${ext}°) is an exterior angle of triangle ${A}${B}${C}.`,
              `It equals angle ${A} plus angle ${B}: ${ext} = ${alpha} + x.`,
              `x = ${ext} ${MINUS} ${alpha} = ${beta}.`,
            ],
          principles: [
            "An exterior angle of a triangle equals the sum of the two interior angles that are not next to it.",
            "The three interior angles of a triangle add to 180°, and angles on a line add to 180°.",
          ],
          trap: askExterior
            ? `180 ${MINUS} ${alpha} ${MINUS} ${beta} = ${gamma} is the interior angle at ${C}; the exterior angle is its supplement.`
            : `The interior angle at ${C} (${gamma}°) is a step on the way, not angle ${B}.`,
          hint: `How is angle ${A}${C}${D} related to the angles of the triangle?`,
          estimatedSeconds: 60,
          verify: () => {
            const measured = { A: angleAt(Am, Bm, Cm), B: angleAt(Bm, Am, Cm), ext: angleAt(Cm, Am, Dm) };
            return close(measured.A, alpha, 1e-6) && close(measured.B, beta, 1e-6) && close(measured.ext, ext, 1e-6) &&
              close(askExterior ? measured.ext : measured.B, key, 1e-6);
          },
        });
      });
    },
  };

  const crossingSimilar = {
    id: "crossing-similar-triangles",
    domain: GEO,
    skill: "Lines, angles, and triangles",
    subskill: "similarity",
    difficulty: "Medium",
    title: "Similar triangles at a crossing",
    recognize:
      "Two segments crossing between parallel segments make two similar triangles, matched by their equal angles (vertical " +
      "angles at the crossing, alternate interior angles at the ends), not by their positions on the page; find the scale " +
      "factor from one pair of corresponding sides.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["part-vs-whole", "wrong-quantity", "neighbouring-rule"],
    build(t) {
      const form = t.pick(["side", "side", "part", "perimeter"]);
      const numeric = t.chance(0.3);
      return retry(() => {
        const [p, q] = t.pick(SCALE_PAIRS);
        const k = q / p;
        const names = t.pick(BOWTIE_NAMES);
        const [A, B, C, D, E] = names;
        let c;
        let b;
        let a;
        let fx;
        let depth;
        if (form === "perimeter") {
          const u = t.int(2, 6);
          const v = t.int(2, 6);
          const w = t.int(2, 7);
          c = p * w;
          b = p * u;
          a = p * v;
          if (b + a <= c || b + c <= a || a + c <= b) return null;
          const x = (b * b + c * c - a * a) / (2 * c);
          fx = x / c;
          depth = Math.sqrt(Math.max(0, b * b - x * x));
        } else {
          c = p * t.int(2, 7);
          b = p * t.int(2, 6);
          fx = t.int(30, 70) / 100;
          depth = Math.sqrt(Math.max(0, b * b - (fx * c) ** 2));
        }
        if (fx < 0.22 || fx > 0.78 || depth < 0.45 * c || depth > 1.5 * c) return null;
        const pts = bowtie(c, fx, depth, k);
        const AC = dist(pts.A, pts.C);
        const CE = dist(pts.C, pts.E);
        const AB = dist(pts.A, pts.B);
        const DE = dist(pts.D, pts.E);
        const BC = dist(pts.B, pts.C);
        const CD = dist(pts.C, pts.D);
        const map = fitPoints(Object.values(pts), 400, 280, 40);
        const s = Object.fromEntries(Object.entries(pts).map(([key, point]) => [key, map(point)]));
        const labels = {};
        const intro = `In the figure shown, segments ${A}${E} and ${B}${D} intersect at point ${C}, and ${A}${B} is parallel to ${D}${E}.`;
        let stem;
        let key;
        let candidates;
        let explanation;
        let steps;
        let trap;
        let check;
        const factor = S.frac(q, p);
        const round = (value) => Math.round(value * 1e6) / 1e6;
        if (form === "side") {
          const bottomFirst = t.chance(0.5);
          if (!bottomFirst) {
            labels.AC = round(AC); labels.CE = round(CE); labels.AB = round(AB);
            key = round(DE);
            stem = `${intro} What is the length of ${D}${E}?`;
            candidates = [
              [shown((AB * AC) / CE, 2), `Uses ${C}${E}/${A}${C}, the scale factor upside down.`],
              [shown(AB + CE - AC, 2), `Adds the difference ${C}${E} ${MINUS} ${A}${C} to ${A}${B}, as if the triangles differed by a fixed amount instead of by a ratio.`],
              [shown((AB * (AC + CE)) / AC, 2), `Uses the whole segment ${A}${E} in place of ${C}${E}.`],
              [shown((AB * CE) / (AC + CE), 2), `Compares ${C}${E} with the whole segment ${A}${E} instead of with ${A}${C}.`],
            ];
            explanation = `Triangles ${A}${B}${C} and ${E}${D}${C} are similar, with ${A} matching ${E} and ${B} matching ${D}. The scale factor from the top triangle to the bottom one is ${C}${E}/${A}${C} = ${num(labels.CE)}/${num(labels.AC)} = ${factor}, so ${D}${E} = ${factor} × ${num(labels.AB)} = ${num(key)}.`;
            steps = [
              `Angles ${A}${C}${B} and ${E}${C}${D} are vertical angles, and angles ${A} and ${E} are alternate interior angles, so the triangles are similar with ${A} ↔ ${E}, ${B} ↔ ${D}.`,
              `${A}${C} corresponds to ${E}${C}, so the scale factor is ${num(labels.CE)}/${num(labels.AC)} = ${factor}.`,
              `${D}${E} corresponds to ${A}${B}: ${D}${E} = ${factor} × ${num(labels.AB)} = ${num(key)}.`,
            ];
            trap = `The factor is ${C}${E}/${A}${C}, bottom over top; inverting it gives ${num(round((AB * AC) / CE))}.`;
            check = () => close(DE, key);
          } else {
            labels.CD = round(CD); labels.BC = round(BC); labels.DE = round(DE);
            key = round(AB);
            stem = `${intro} What is the length of ${A}${B}?`;
            candidates = [
              [shown((DE * CD) / BC, 2), `Uses ${C}${D}/${B}${C}, the scale factor upside down.`],
              [shown(DE + BC - CD, 2), `Adds the difference ${B}${C} ${MINUS} ${C}${D} to ${D}${E}, as if the triangles differed by a fixed amount instead of by a ratio.`],
              [shown((DE * (BC + CD)) / CD, 2), `Uses the whole segment ${B}${D} in place of ${B}${C}.`],
              [shown((DE * BC) / (BC + CD), 2), `Compares ${B}${C} with the whole segment ${B}${D} instead of with ${C}${D}.`],
            ];
            explanation = `Triangles ${A}${B}${C} and ${E}${D}${C} are similar, with ${B} matching ${D}. The scale factor from the bottom triangle to the top one is ${B}${C}/${C}${D} = ${num(labels.BC)}/${num(labels.CD)} = ${S.frac(p, q)}, so ${A}${B} = ${S.frac(p, q)} × ${num(labels.DE)} = ${num(key)}.`;
            steps = [
              `Angles ${A}${C}${B} and ${E}${C}${D} are vertical angles, and angles ${B} and ${D} are alternate interior angles, so the triangles are similar with ${B} ↔ ${D}, ${A} ↔ ${E}.`,
              `${B}${C} corresponds to ${D}${C}, so the scale factor is ${num(labels.BC)}/${num(labels.CD)} = ${S.frac(p, q)}.`,
              `${A}${B} corresponds to ${D}${E}: ${A}${B} = ${S.frac(p, q)} × ${num(labels.DE)} = ${num(key)}.`,
            ];
            trap = `The factor is ${B}${C}/${C}${D}, top over bottom; inverting it gives ${num(round((DE * CD) / BC))}.`;
            check = () => close(AB, key);
          }
        } else if (form === "part") {
          labels.AB = round(AB); labels.DE = round(DE);
          const AE = round(AC + CE);
          key = round(AC);
          stem = `${intro} If ${A}${E} = ${num(AE)}, what is the length of ${A}${C}?`;
          candidates = [
            [shown(CE, 2), `Gives ${C}${E}, the other part of ${A}${E}.`],
            [shown((AE * AB) / DE, 2), `Treats ${A}${B}/${D}${E} as ${A}${C}/${A}${E}, comparing a part of ${A}${E} with the whole segment.`],
            [shown(AE / 2, 2), `Assumes ${C} is the midpoint of ${A}${E}.`],
            [shown((AE * DE) / AB, 2), `Scales the whole segment ${A}${E} by ${D}${E}/${A}${B}.`],
          ];
          explanation = `Triangles ${A}${B}${C} and ${E}${D}${C} are similar, so ${A}${C}/${C}${E} = ${A}${B}/${E}${D} = ${num(labels.AB)}/${num(labels.DE)} = ${S.frac(p, q)}. So ${A}${E} splits into ${p} + ${q} = ${p + q} equal parts, ${p} of them in ${A}${C}: ${A}${C} = ${num(AE)} × ${p}/${p + q} = ${num(key)}.`;
          steps = [
            `The triangles are similar with ${A} ↔ ${E}, so ${A}${C} : ${C}${E} = ${A}${B} : ${E}${D} = ${p} : ${q}.`,
            `${A}${E} = ${A}${C} + ${C}${E} is ${p} + ${q} = ${p + q} parts, each ${num(AE)} ÷ ${p + q} = ${num(round(AE / (p + q)))}.`,
            `${A}${C} is ${p} parts: ${p} × ${num(round(AE / (p + q)))} = ${num(key)}.`,
          ];
          trap = `${A}${B}/${D}${E} compares ${A}${C} with ${C}${E}, a part with a part; ${A}${E} is the whole.`;
          check = () => close(AC, key) && close(AC + CE, AE);
        } else {
          labels.AB = round(AB); labels.DE = round(DE);
          const P1 = round(AB + BC + AC);
          key = round(DE + CD + CE);
          stem = `${intro} The perimeter of triangle ${A}${B}${C} is ${num(P1)}. What is the perimeter of triangle ${C}${D}${E}?`;
          candidates = [
            [shown(P1 + DE - AB, 2), `Adds the difference ${D}${E} ${MINUS} ${A}${B} once, as if only one side changed.`],
            [shown(P1 * k * k, 2), "Squares the scale factor, as for areas; perimeters scale by the factor itself."],
            [shown(P1 / k, 2), "Uses the scale factor upside down."],
            [shown(P1 + 3 * (DE - AB), 2), "Adds the same difference to each side instead of scaling each side."],
          ];
          explanation = `The triangles are similar with scale factor ${D}${E}/${A}${B} = ${num(labels.DE)}/${num(labels.AB)} = ${factor}, and every length, including the perimeter, scales by it: ${factor} × ${num(P1)} = ${num(key)}.`;
          steps = [
            `The triangles are similar: vertical angles at ${C}, alternate interior angles at the parallel segments.`,
            `Scale factor: ${D}${E}/${A}${B} = ${factor}.`,
            `Perimeter: ${factor} × ${num(P1)} = ${num(key)}.`,
          ];
          trap = `Perimeter is a length, so it scales by ${factor}, not by its square.`;
          check = () => close(DE + CD + CE, key) && close((DE + CD + CE) / (AB + BC + AC), k);
        }
        if (!isClean(key, 2) || Object.values(labels).some((value) => !isClean(value, 2))) return null;
        const G1 = centroid([s.A, s.B, s.C]);
        const G2 = centroid([s.C, s.D, s.E]);
        const parts = [
          seg(s.A, s.B), seg(s.D, s.E), seg(s.A, s.E), seg(s.B, s.D),
          arrow(s.A, s.B, 0.5), arrow(s.D, s.E, 0.5),
          name(add(s.A, [-12, -8]), A), name(add(s.B, [12, -8]), B),
          name(add(s.D, [-12, 10]), D), name(add(s.E, [12, 10]), E),
          nameAway(s.C, mid(s.A, s.D), C, 16),
        ];
        const words = [];
        const place = (from, to, away, text, wordName) => {
          parts.push(sideLabel(from, to, away, text));
          words.push(`${wordName} = ${text}`);
        };
        if (labels.AB !== undefined) place(s.A, s.B, G1, num(labels.AB), A + B);
        if (labels.DE !== undefined) place(s.D, s.E, G2, num(labels.DE), D + E);
        if (labels.AC !== undefined) place(s.A, s.C, s.B, num(labels.AC), A + C);
        if (labels.CE !== undefined) place(s.C, s.E, s.D, num(labels.CE), C + E);
        if (labels.BC !== undefined) place(s.B, s.C, s.A, num(labels.BC), B + C);
        if (labels.CD !== undefined) place(s.C, s.D, s.E, num(labels.CD), C + D);
        const alt =
          `Segment ${A}${B} at the top and segment ${D}${E} at the bottom, marked parallel with arrows. Segments ${A}${E} and ${B}${D} cross at ${C}, ` +
          `forming triangle ${A}${B}${C} above ${C} and triangle ${C}${D}${E} below it; ${D} is below ${A}'s side and ${E} below ${B}'s side. ` +
          `Labeled lengths: ${words.join(", ")}. The figure is drawn to scale.`;
        return pack(numeric, key, fmt(key), candidates, {
          stimulus: null,
          figure: { svg: S.svg(400, 280, parts, alt), alt, notToScale: false },
          stem,
          explanation,
          steps,
          principles: [
            "Two triangles with two pairs of equal angles are similar; corresponding sides are opposite equal angles.",
            "In similar triangles, every length (sides, perimeters) scales by the same factor; areas scale by its square.",
          ],
          trap,
          hint: "Which angle in the bottom triangle equals angle " + A + "?",
          estimatedSeconds: 100,
          verify: check,
        });
      });
    },
  };

  const similarTriangles = {
    id: "similar-triangles-parallel",
    domain: DOMAIN,
    skill: "Lines, angles, and triangles",
    subskill: "similarity",
    title: "Parallel cut in a triangle: part versus whole side",
    recognize:
      "A segment parallel to one side cuts off a smaller triangle similar to the whole. The scale factor " +
      "compares a part of a side with the whole side, and areas scale by its square. Trust a figure drawn to scale; " +
      "when it is marked not drawn to scale, apparent midpoints mean nothing.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["not-to-scale-figure", "part-vs-whole", "neighbouring-rule", "intermediate-value"],
    build(t) {
      // Chosen once, outside the retry loop, so retries do not tilt the mix.
      const form = t.pick(["base", "base", "cut", "part", "part", "area", "area", "ratio"]);
      const numeric = form !== "ratio" && t.chance(0.34);
      const accurate = t.chance(0.35);
      for (;;) {
        const names = t.pick(TRIANGLE_NAMES);
        const [X, Y, Z, M, N] = names;
        const [p, q] = t.pick(accurate ? PART_RATIOS : MIDPOINT_RATIOS);
        const onLeft = t.chance(0.5);
        const u = t.int(1, 4);
        const m = t.int(2, 6);
        const w = p === 1 ? t.int(2, 6) : t.int(1, 5);
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
        const cutPoint = onLeft ? M : N;
        const small = `triangle ${X}${M}${N}`;
        const big = `triangle ${X}${Y}${Z}`;
        const quad = `quadrilateral ${M}${Y}${Z}${N}`;
        const k = S.frac(near, whole);
        // The drawing lure exists only when the figure is not drawn to scale.
        const lure = (value, reason) => (accurate ? [null, reason] : [value, reason]);
        const figureFor = (shown) => cutFigure(t, names, onLeft, shown, accurate ? p / (p + q) : null);
        const figureNote = (text) => (accurate ? "" : ` ${text}`);

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
            lure(2 * cut, `Treats ${cutName} as a midsegment because ${M} and ${N} look like midpoints in the figure; the figure is not drawn to scale.`),
            [(cut * far) / near, `Uses ${nearName}/${farName}, a part-to-part ratio, as the scale factor instead of ${nearName}/${wholeName}.`],
            [cut + far, `Adds ${farName} to ${cutName}, as if the triangle grew by equal amounts instead of in proportion.`],
            [(cut * whole) / far, `Scales ${cutName} by ${wholeName}/${farName}, pairing it with the wrong part of the side.`],
            [whole, `Finds the whole side ${wholeName} = ${whole} on the way and stops there instead of scaling ${cutName}.`],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            ...common,
            figure: figureFor(shown),
            stem: text,
            correct: base,
            wrong,
            explanation:
              `${similarStep} The scale factor compares ${nearName} with the whole side ${wholeName}, not with ${farName}: ` +
              `${nearName}/${wholeName} = ${near}/${whole} = ${k}. So ${baseName} = ${cut} ÷ ${k} = ${base}.` +
              figureNote(`The figure makes ${cutName} look like a midsegment, but ${nearName} ≠ ${farName}, so ${baseName} is not twice ${cutName}.`),
            steps: [
              similarStep,
              wholeStep,
              `Corresponding sides share that factor: ${cutName}/${baseName} = ${k}.`,
              `So ${baseName} = ${cut} × ${S.frac(whole, near)} = ${base}.`,
            ],
            principles,
            trap:
              (accurate ? "" : `The figure is not drawn to scale: ${M} and ${N} look like midpoints, which suggests ${baseName} = 2 × ${cut} = ${2 * cut}. `) +
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
            lure(base / 2, `Takes ${cutName} as half of ${baseName} because ${M} and ${N} look like midpoints in the figure; the figure is not drawn to scale.`),
            [(base * near) / far, `Uses ${nearName}/${farName}, a part-to-part ratio, as the scale factor instead of ${nearName}/${wholeName}.`],
            [base - far, `Subtracts ${farName} from ${baseName}, shrinking by a fixed amount instead of by a ratio.`],
            [(base * far) / whole, `Uses ${farName}/${wholeName}, which pairs ${cutName} with the wrong part of side ${wholeName}.`],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            ...common,
            figure: figureFor(shown),
            stem: text,
            correct: cut,
            wrong,
            explanation:
              `${similarStep} The scale factor is ${nearName}/${wholeName} = ${near}/${whole} = ${k}, so ${cutName} = ${k} × ${base} = ${cut}.` +
              figureNote(`The figure is not drawn to scale; ${cutName} only looks like half of ${baseName}.`),
            steps: [similarStep, wholeStep, `Corresponding sides share that factor: ${cutName} = ${k} × ${baseName}.`, `${cutName} = ${k} × ${base} = ${cut}.`],
            principles,
            trap:
              (accurate ? "" : `${cutName} looks like half of ${baseName} in a figure that is not drawn to scale, and `) +
              `${accurate ? "T" : "t"}he ratio ${nearName}/${farName} is not the scale factor because ${farName} is only part of a side.`,
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
          const wrong = distinctWrong(far, [
            [near, accurate
              ? `Finds ${wholeName} = ${whole}, then takes ${farName} as ${wholeName} × ${cutName}/${baseName}; that product is ${nearName}, not ${farName}.`
              : `Takes ${cutPoint} as the midpoint of ${wholeName}, as it appears in the figure, so ${farName} = ${nearName}; the figure is not drawn to scale.`],
            [whole, `Finds the whole side ${wholeName} and stops; ${farName} is only the part below ${cutPoint}.`],
            [base - cut, `Takes ${farName} as ${baseName} − ${cutName}, as if the side grew by the same amount as the parallel segments instead of in proportion.`],
          ]);
          if (!numeric && wrong.length < 3) continue;
          return {
            ...common,
            figure: figureFor(shown),
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
              (accurate ? "Setting" : `${cutPoint} looks like a midpoint in the figure, which is not drawn to scale; and setting`) +
              ` ${farName}/${nearName} = ${baseName}/${cutName} gives ${whole}, which is the whole side ${wholeName}.`,
            verify: () => close(parallelCut(near + far, base, near).cut, cut),
          };
        }

        if (form === "area") {
          const smallArea = p * p * w;
          const bigArea = (p + q) * (p + q) * w;
          const quadArea = bigArea - smallArea;
          const askQuad = t.chance(0.6);
          const areaIntro = `${intro} The area of ${small} is ${smallArea}.`;
          const figure = figureFor({ near, far });
          const kk = S.frac(near * near, whole * whole);
          const steps = [
            similarStep,
            wholeStep,
            `Areas scale by the square of the factor: area(${small})/area(${big}) = ${kk}.`,
            `area(${big}) = ${smallArea} ÷ ${kk} = ${bigArea}.`,
          ];
          if (askQuad) {
            const wrong = distinctWrong(quadArea, [
              lure(3 * smallArea, `Treats ${cutName} as a midsegment, as the figure suggests, so ${big} looks 4 times as large as ${small}; the figure is not drawn to scale.`),
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
                (accurate ? "" : `The figure is not drawn to scale; reading ${cutName} as a midsegment gives ${3 * smallArea}. `) +
                "Scaling area by the length ratio, or stopping at the whole triangle, are the common reflexes.",
              verify: () => {
                const g = parallelCut(near + far, 10, near);
                return close(((g.whole - g.small) * smallArea) / g.small, quadArea, 1e-9);
              },
            };
          }
          const wrong = distinctWrong(bigArea, [
            lure(4 * smallArea, `Treats ${cutName} as a midsegment, as the figure suggests, making ${big} 4 times as large; the figure is not drawn to scale.`),
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
              (accurate ? "" : `The figure is not drawn to scale; reading ${cutName} as a midsegment gives ${4 * smallArea}. `) +
              `Scaling area by the length ratio instead of its square gives ${p * (p + q) * w}.`,
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
              lure("1/3", `Treats ${cutName} as a midsegment, as the figure suggests, so the quadrilateral looks 3 times the small triangle; the figure is not drawn to scale.`),
              [S.frac(pp, ww), `Compares ${small} with all of ${big} instead of with the quadrilateral.`],
              [S.frac(p, q), `Uses the part-to-part length ratio ${nearName}/${farName} as if it were an area ratio.`],
              [S.frac(pp, q * q), `Squares ${nearName}/${farName}, a ratio of two parts of a side rather than part to whole.`],
            ]
            : [
              lure("1/4", `Treats ${cutName} as a midsegment, as the figure suggests, so the small triangle looks like a quarter of the large one; the figure is not drawn to scale.`),
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
          figure: figureFor({ near, far }),
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
          trap:
            (accurate ? "" : `The figure is not drawn to scale, so the midsegment reading (${toQuad ? "1/3" : "1/4"}) is wrong. `) +
            "A length ratio is not an area ratio.",
          verify: () => {
            const g = parallelCut(near + far, 10, near);
            const value = toQuad ? g.small / (g.whole - g.small) : g.small / g.whole;
            return close(value, toQuad ? pp / (ww - pp) : pp / ww, 1e-9);
          },
        };
      }
    },
  };

  const angleChase = {
    id: "angle-chase-not-to-scale",
    domain: DOMAIN,
    skill: "Lines, angles, and triangles",
    subskill: "angle relationships",
    title: "Angle chase through a misleading figure",
    recognize:
      "Decide which angle relationships the given facts guarantee (parallel lines, congruent sides) before computing. " +
      "A figure without the not-to-scale note can be trusted; with it, the angle that looks right, or looks equal to another, usually is not.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["not-to-scale-figure", "neighbouring-rule", "wrong-quantity"],
    build(t) {
      const form = t.pick(["transversal", "isosceles", "bend"]);
      const numeric = t.chance(0.3);
      const accurate = t.chance(0.35);
      if (form === "transversal") return transversalItem(t, numeric, accurate);
      if (form === "isosceles") return isoscelesItem(t, numeric, accurate);
      return bendItem(t, numeric, accurate);
    },
  };

  /* ========================================== triangle-side-bounds (Easy) */

  const SIDE_CONTEXTS = [
    { lead: (p, q) => `Three straight fences form a triangular pen. Two of the fences are ${p} meters and ${q} meters long.`, unit: "meters", what: "the third fence" },
    { lead: (p, q) => `A garden in the shape of a triangle has two sides that are ${p} feet and ${q} feet long.`, unit: "feet", what: "the third side of the garden" },
    { lead: (p, q) => `Three sticks are placed end to end to form a triangle. Two of the sticks are ${p} inches and ${q} inches long.`, unit: "inches", what: "the third stick" },
  ];

  // Whether sides p, q, r close up into a triangle: put p on the x-axis, find
  // the third vertex from its distances q and r, and require it off the axis.
  function closes(p, q, r) {
    const x = (p * p + q * q - r * r) / (2 * p);
    return q * q - x * x > 1e-9;
  }

  const sideBounds = {
    id: "triangle-side-bounds",
    domain: GEO,
    skill: "Lines, angles, and triangles",
    subskill: "triangle geometry",
    difficulty: "Easy",
    title: "Possible lengths for a third side",
    recognize:
      "Any side of a triangle is shorter than the other two combined and longer than their difference, with neither bound " +
      "allowed: at either bound the three sides lie flat along one segment.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["context-constraint", "wrong-quantity"],
    build(t) {
      const form = t.pick(["could", "could", "greatest", "least"]);
      const numeric = form !== "could" && t.chance(0.55);
      const withContext = t.chance(0.4);
      return retry(() => {
        const a = t.int(3, 14);
        const b = t.int(a + 2, a + 16);
        const [p, q] = t.chance(0.5) ? [a, b] : [b, a];
        const ctx = withContext ? t.pick(SIDE_CONTEXTS) : null;
        const low = b - a;
        const high = a + b;
        const principles = [
          "Each side of a triangle is shorter than the sum of the other two sides and longer than their difference.",
        ];
        const common = {
          stimulus: null,
          figure: null,
          principles,
          hint: "If the third side were very short or very long, could the two given sides still meet?",
          estimatedSeconds: 55,
        };
        const range = `${low} < ${ctx ? "length" : "x"} < ${high}`;
        if (form === "could") {
          const key = t.int(low + 1, high - 1);
          if (key === a || key === b) return null;
          const outside = t.chance(0.5)
            ? [high + t.int(1, 6), `Is longer than the other two sides combined (${high}), so the sides cannot meet.`]
            : [low > 2 ? t.int(1, low - 1) : null, `Is shorter than the difference of the other two sides (${low}), so the sides cannot meet.`];
          return pack(false, key, fmt(key), [
            [fmt(low), `Equals the difference ${b} − ${a}; a third side that short makes the triangle collapse into a segment.`],
            [fmt(high), `Equals the sum ${a} + ${b}; the three sides would lie flat along one segment.`],
            [outside[0] === null ? null : fmt(outside[0]), outside[1]],
            [fmt(high + 1), `Is longer than the other two sides combined (${high}), so the sides cannot meet.`],
          ], {
            ...common,
            stem: ctx
              ? `${ctx.lead(p, q)} Which of the following could be the length, in ${ctx.unit}, of ${ctx.what}?`
              : `A triangle has two sides of lengths ${p} and ${q}. Which of the following could be the length of the third side?`,
            explanation:
              `The third side must be longer than ${b} − ${a} = ${low} and shorter than ${a} + ${b} = ${high}. Of the choices, only ${key} is strictly between them.`,
            steps: [`Longer than the difference: more than ${b} − ${a} = ${low}.`, `Shorter than the sum: less than ${a} + ${b} = ${high}.`, `Only ${key} satisfies ${range}.`],
            trap: `A third side of exactly ${low} or ${high} does not make a triangle: the sides would lie flat.`,
            verify: () => closes(a, b, key) &&
              [low, high, high + 1, outside[0]].every((value) => value === null || !closes(a, b, value)),
          });
        }
        const greatest = form === "greatest";
        const key = greatest ? high - 1 : low + 1;
        const ask = greatest ? "greatest" : "least";
        const stem = ctx
          ? `${ctx.lead(p, q)} The length of ${ctx.what} is a whole number of ${ctx.unit}. What is the ${ask} possible length, in ${ctx.unit}, of ${ctx.what}?`
          : `The lengths of the sides of a triangle are ${p}, ${q}, and x, where x is an integer. What is the ${ask} possible value of x?`;
        return pack(numeric, key, fmt(key), greatest
          ? [
            [fmt(high), `Equals the sum ${a} + ${b}; a side that long makes the triangle flatten into a segment.`],
            [fmt(b), `Assumes the third side can be no longer than the longest given side, ${b}.`],
            [fmt(low + 1), "Gives the least possible length instead of the greatest."],
          ]
          : [
            [fmt(low), `Equals the difference ${b} − ${a}; a side that short makes the triangle collapse into a segment.`],
            [fmt(1), "Assumes any positive length works for the third side."],
            [fmt(high - 1), "Gives the greatest possible length instead of the least."],
          ], {
          ...common,
          stem,
          explanation:
            `The third side must satisfy ${b} − ${a} < ${ctx ? "length" : "x"} < ${a} + ${b}, that is, ${range}. ` +
            `The ${ask} whole number in that range is ${key}; ${greatest ? high : low} itself is not allowed.`,
          steps: [
            `Bounds: more than ${b} − ${a} = ${low} and less than ${a} + ${b} = ${high}.`,
            `Neither bound is allowed, so the ${ask} whole number is ${key}.`,
          ],
          trap: `${greatest ? high : low} is the bound itself; a side of that length makes the three sides lie along one segment, so it is not a triangle.`,
          verify: () => closes(a, b, key) && !closes(a, b, greatest ? key + 1 : key - 1),
        });
      });
    },
  };

  /* ===================================== shared-height-area-ratio (Medium) */

  const CEVIAN_NAMES = [["A", "B", "C", "D"], ["P", "Q", "R", "S"], ["J", "K", "L", "M"], ["E", "F", "G", "H"]];

  const sharedHeight = {
    id: "shared-height-area-ratio",
    domain: GEO,
    skill: "Lines, angles, and triangles",
    subskill: "triangle geometry",
    difficulty: "Medium",
    title: "Triangles that share a height",
    recognize:
      "Triangles with a common vertex and bases along one line have the same height, so their areas are in the ratio of " +
      "their bases. Compare a part of the base with the whole base when the whole triangle is involved, and do not square: " +
      "these triangles are not similar.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["part-vs-whole", "neighbouring-rule", "intermediate-value"],
    build(t) {
      const form = t.pick(["whole", "whole", "part", "part", "length"]);
      const numeric = t.chance(0.35);
      const inText = form === "length" || t.chance(0.35);
      return retry(() => {
        const [A, B, Cn, D] = t.pick(CEVIAN_NAMES);
        const m = t.int(2, 12);
        const n = t.int(2, 12);
        if (m === n || m + n < 7) return null;
        const u = t.int(2, 15);
        const aspect = (2 * u) / (m + n);
        if (aspect < 0.35 || aspect > 1) return null;
        const xA = (m + n) * t.int(20, 80) / 100;
        if (Math.abs(xA - m) < 0.12 * (m + n)) return null;
        const model = { A: [xA, 2 * u], B: [0, 0], C: [m + n, 0], D: [m, 0] };
        const map = fitPoints(Object.values(model), 400, 250, 44);
        const s = Object.fromEntries(Object.entries(model).map(([key, point]) => [key, map(point)]));
        const G = centroid([s.A, s.B, s.C]);
        const parts = [
          P.polygon([s.A, s.B, s.C]),
          seg(s.A, s.D, 1.8),
          nameAway(s.A, G, A), name(add(s.B, [-12, 12]), B), name(add(s.C, [12, 12]), Cn), name(add(s.D, [0, 18]), D),
        ];
        if (!inText) {
          parts.push(measure(add(mid(s.B, s.D), [0, 18]), num(m)));
          parts.push(measure(add(mid(s.D, s.C), [0, 18]), num(n)));
        }
        const alt =
          `Triangle ${A}${B}${Cn} with base ${B}${Cn} along the bottom and ${A} above it. Point ${D} lies on ${B}${Cn}, and segment ${A}${D} is drawn, ` +
          `forming triangles ${A}${B}${D} and ${A}${D}${Cn}.` +
          (inText ? "" : ` ${B}${D} is labeled ${m} and ${D}${Cn} is labeled ${n}.`) + " The figure is drawn to scale.";
        const figure = { svg: S.svg(400, 250, parts, alt), alt, notToScale: false };
        const tri = { left: `${A}${B}${D}`, right: `${A}${D}${Cn}`, whole: `${A}${B}${Cn}` };
        const seg1 = { left: `${B}${D}`, right: `${D}${Cn}` };
        const base = { left: m, right: n };
        const area = { left: m * u, right: n * u };
        // The length form asks for a part of the base, so it never states the parts.
        const lengths = inText && form !== "length" ? `, ${B}${D} = ${m}, and ${D}${Cn} = ${n}` : "";
        const intro = inText
          ? `In triangle ${A}${B}${Cn} shown, point ${D} lies on ${B}${Cn}${lengths}.`
          : `In the figure shown, point ${D} lies on side ${B}${Cn} of triangle ${A}${B}${Cn}.`;
        const sameHeight =
          `Triangles ${tri.left}, ${tri.right}, and ${tri.whole} all have the same height, the distance from ${A} to line ${B}${Cn}, ` +
          "so their areas are in the same ratio as their bases.";
        const principles = [
          "The area of a triangle is (1/2) × base × height.",
          "Triangles with the same height have areas in the same ratio as their bases.",
        ];
        const common = { stimulus: null, figure, principles, estimatedSeconds: 95, hint: `What do triangles ${tri.left} and ${tri.whole} have in common?` };
        const check = (value) => () => {
          const left = shoelace([model.A, model.B, model.D]);
          const right = shoelace([model.A, model.D, model.C]);
          return close(left, area.left) && close(right, area.right) && close(left + right, shoelace([model.A, model.B, model.C])) && value();
        };
        const side = t.pick(["left", "right"]);
        const other = side === "left" ? "right" : "left";
        const g = base[side];
        const o = base[other];
        if (form === "whole") {
          const Ag = area[side];
          const key = (m + n) * u;
          return pack(numeric, key, fmt(key), [
            [shown(area[other], 2), `Gives the area of triangle ${tri[other]}, only part of triangle ${tri.whole}.`],
            [shown((Ag * (g + o) ** 2) / (g * g), 2), `Squares the ratio of the bases, as for similar triangles; triangles ${tri[side]} and ${tri.whole} share a height but are not similar.`],
            [shown((Ag * (g + o)) / o, 2), `Scales by ${B}${Cn}/${seg1[other]}, matching triangle ${tri[side]} with the wrong part of the base.`],
            [shown(Ag + o, 2), `Adds the length ${seg1[other]} to the area.`],
          ], {
            ...common,
            stem: `${intro} The area of triangle ${tri[side]} is ${fmt(Ag)}. What is the area of triangle ${tri.whole}?`,
            explanation:
              `${sameHeight} Base ${seg1[side]} = ${g} is ${g} out of ${B}${Cn} = ${g + o}, so area(${tri.whole}) = ${fmt(Ag)} × ${g + o}/${g} = ${fmt(key)}.`,
            steps: [
              `The triangles share the height from ${A}, so area is proportional to base.`,
              `${B}${Cn} = ${m} + ${n} = ${m + n}, and area(${tri[side]}) : area(${tri.whole}) = ${g} : ${g + o}.`,
              `area(${tri.whole}) = ${fmt(Ag)} × ${g + o}/${g} = ${fmt(key)}.`,
            ],
            trap: `Triangle ${tri[other]} (area ${fmt(area[other])}) is only part of triangle ${tri.whole}; and the bases are not squared, since the triangles are not similar.`,
            verify: check(() => close((shoelace([model.A, model.B, model.C]) / shoelace(side === "left" ? [model.A, model.B, model.D] : [model.A, model.D, model.C])) * Ag, key)),
          });
        }
        if (form === "part") {
          const K = (m + n) * u;
          const key = area[side];
          return pack(numeric, key, fmt(key), [
            [shown(area[other], 2), `Gives the area of triangle ${tri[other]} instead of triangle ${tri[side]}.`],
            [shown((K * g) / o, 2), `Uses ${seg1[side]}/${seg1[other]}, a ratio of the two parts of the base, instead of ${seg1[side]}/${B}${Cn}.`],
            [shown((K * g * g) / (g + o) ** 2, 2), `Squares the ratio of the bases, as for similar triangles; these triangles share a height but are not similar.`],
            [shown(K / 2, 2), `Splits the area of triangle ${tri.whole} evenly, as if ${D} were the midpoint of ${B}${Cn}.`],
          ], {
            ...common,
            stem: `${intro} The area of triangle ${tri.whole} is ${fmt(K)}. What is the area of triangle ${tri[side]}?`,
            explanation: `${sameHeight} Base ${seg1[side]} = ${g} is ${g}/${g + o} of ${B}${Cn}, so area(${tri[side]}) = ${fmt(K)} × ${g}/${g + o} = ${fmt(key)}.`,
            steps: [
              `The triangles share the height from ${A}, so area is proportional to base.`,
              `${seg1[side]} is ${g} of the ${g + o} units of ${B}${Cn}.`,
              `area(${tri[side]}) = ${fmt(K)} × ${g}/${g + o} = ${fmt(key)}.`,
            ],
            trap: `The fraction is ${seg1[side]}/${B}${Cn}, part over whole; ${seg1[side]}/${seg1[other]} compares two parts and gives ${S.frac(K * g, o)}.`,
            verify: check(() => close(shoelace(side === "left" ? [model.A, model.B, model.D] : [model.A, model.D, model.C]), key)),
          });
        }
        // length: the areas of both parts and BC given; one part of the base asked.
        const key = g;
        const h = 2 * u;
        return pack(numeric, key, fmt(key), [
          [shown(o, 2), `Gives the length of ${seg1[other]} instead of ${seg1[side]}.`],
          [shown(((m + n) * area[side]) / area[other], 2), `Takes ${fmt(area[side])}/${fmt(area[other])}, the ratio of the two areas, as the fraction of ${B}${Cn} instead of ${fmt(area[side])}/${fmt(area[side] + area[other])}.`],
          [h === m + n ? null : shown(h, 2), `Finds the height of the triangles, ${h}, and stops.`],
          [shown((m + n) / 2, 2), `Assumes ${D} is the midpoint of ${B}${Cn}.`],
        ], {
          ...common,
          stem:
            `${intro} The length of ${B}${Cn} is ${m + n}, and the areas of triangles ${tri.left} and ${tri.right} are ${fmt(area.left)} and ${fmt(area.right)}, respectively. ` +
            `What is the length of ${seg1[side]}?`,
          explanation:
            `${sameHeight} Triangle ${tri[side]} has ${fmt(area[side])} of the total area ${fmt(area.left + area.right)}, so ${seg1[side]} is that same fraction of ${B}${Cn}: ` +
            `${m + n} × ${fmt(area[side])}/${fmt(area.left + area.right)} = ${key}.`,
          steps: [
            `Total area: ${fmt(area.left)} + ${fmt(area.right)} = ${fmt(area.left + area.right)}.`,
            `The triangles share a height, so ${seg1[side]}/${B}${Cn} = ${fmt(area[side])}/${fmt(area.left + area.right)}.`,
            `${seg1[side]} = ${m + n} × ${fmt(area[side])}/${fmt(area.left + area.right)} = ${key}.`,
          ],
          trap: `The fraction of ${B}${Cn} is area(${tri[side]}) over the whole area, not over the other part.`,
          verify: check(() => close(dist(model.B, model.D), m) && close(side === "left" ? dist(model.B, model.D) : dist(model.D, model.C), key)),
        });
      });
    },
  };

  return [anglePair, sideBounds, crossingSimilar, sharedHeight, similarTriangles, angleChase];
});
