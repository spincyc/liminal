(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/geometry-and-trigonometry"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // A length unit after a number: "1 inch", "1 foot", "3 centimeters".
  const unitAfter = (value, unit) => (value === 1 ? ({ feet: "foot", inches: "inch" }[unit] || unit.replace(/s$/, "")) : unit);

  // Area and volume templates (Geometry and Trigonometry), ordered Easy, Medium, Hard.

  const { num } = S;
  const {
    P, GEO, tidy, isClean, fmt, shown, retry, add, sub, mul, unit, mid, dist, centroid, close, surd, shoelace,
    toRad, piFraction, fitPoints, r1, seg, measure, unitText, name, nameAway, anchorFor, normalAway, rightMark,
    DOMAIN, round4, fitsGridHard, spreadWrong, packSpread, collides, wrongFor,
    balanceTwins,
  } = C;

  /* =============================================== altitude-area (Easy) */

  // [height, offset of the foot, slanted side]
  const ALTITUDE_TRIPLES = [
    [3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [9, 12, 15], [12, 9, 15],
    [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [12, 16, 20], [16, 12, 20],
    [7, 24, 25], [24, 7, 25], [20, 21, 29], [21, 20, 29], [10, 24, 26], [24, 10, 26],
  ];

  const AREA_NAMES = [["A", "B", "C", "D"], ["P", "Q", "R", "S"], ["J", "K", "L", "M"], ["E", "F", "G", "H"]];

  // Builds the shape in ordinary coordinates and draws it to scale. The
  // altitude is dashed with a right-angle mark at its foot.
  function altitudeShape(shape, names, b, off, h, show) {
    const [A, B, C, D] = names;
    let pts;
    let top;
    let foot;
    let baseEnds;
    let slantEnds;
    let slantName;
    let heightName;
    let extension = null;
    if (shape === "acute") {
      pts = { [A]: [0, 0], [B]: [off, h], [C]: [b, 0], [D]: [off, 0] };
      top = pts[B]; foot = pts[D]; baseEnds = [pts[A], pts[C]]; slantEnds = [pts[A], pts[B]];
      slantName = A + B; heightName = B + D;
    } else if (shape === "obtuse") {
      pts = { [A]: [0, 0], [B]: [b + off, h], [C]: [b, 0], [D]: [b + off, 0] };
      top = pts[B]; foot = pts[D]; baseEnds = [pts[A], pts[C]]; slantEnds = [pts[C], pts[B]];
      slantName = C + B; heightName = B + D; extension = [pts[C], pts[D]];
    } else {
      const E = names[3] === "D" ? "E" : names[3] === "S" ? "T" : names[3] === "M" ? "N" : "I";
      pts = { [A]: [0, 0], [B]: [off, h], [C]: [b + off, h], [D]: [b, 0], [E]: [off, 0] };
      top = pts[B]; foot = pts[E]; baseEnds = [pts[A], pts[D]]; slantEnds = [pts[A], pts[B]];
      slantName = A + B; heightName = B + E;
    }
    const map = fitPoints(Object.values(pts), 400, 260, 46);
    const s = Object.fromEntries(Object.entries(pts).map(([key, p]) => [key, map(p)]));
    const G = centroid(shape === "parallelogram" ? [s[A], s[B], s[C], s[D]] : [s[A], s[B], s[C]]);
    const outline = shape === "parallelogram" ? [s[A], s[B], s[C], s[D]] : [s[A], s[B], s[C]];
    const parts = [P.polygon(outline)];
    const sTop = map(top);
    const sFoot = map(foot);
    parts.push(seg(sTop, sFoot, 1.5, true));
    if (extension) parts.push(seg(map(extension[0]), map(extension[1]), 1.5, true));
    const along = shape === "obtuse" ? s[C] : shape === "parallelogram" ? s[D] : s[C];
    parts.push(rightMark(sFoot, sTop, along, 11));
    const footName = shape === "parallelogram" ? heightName[1] : D;
    Object.entries(s).forEach(([letter, p]) => {
      if (letter === footName) parts.push(name(add(p, [0, 17]), letter));
      else parts.push(nameAway(p, G, letter, 16));
    });
    const words = [];
    const baseLabelAt = add(mid(map(baseEnds[0]), map(baseEnds[1])), [0, 18]);
    // The foot's letter sits under the base too; the two must not overprint.
    const crowded = shape !== "obtuse" && Math.abs(baseLabelAt[0] - sFoot[0]) < 30;
    if (show.base) {
      parts.push(measure(baseLabelAt, num(b)));
      words.push(`base ${num(b)}`);
    }
    if (show.height) {
      parts.push(measure(add(mid(sTop, sFoot), [shape === "obtuse" ? 9 : -9, 0]), num(h), shape === "obtuse" ? "start" : "end"));
      words.push(`height ${num(h)}`);
    }
    if (show.slant) {
      const n = normalAway(map(slantEnds[0]), map(slantEnds[1]), G);
      const at = add(mid(map(slantEnds[0]), map(slantEnds[1])), mul(n, 13));
      parts.push(measure(at, num(Math.hypot(off, h)), anchorFor(n)));
      words.push(`slanted side ${num(Math.hypot(off, h))}`);
    }
    return { parts, pts, slantName, heightName, footName, crowded };
  }

  /* ========================================== volume-to-dimension (Medium) */

  // Oblique solids drawn to scale in a 400 × 270 box.
  function cylinderFigure(r, h, heightText, radiusText, alt) {
    const scale = Math.min(150 / (2 * r), 170 / h);
    const rx = r * scale;
    const ry = Math.max(10, rx * 0.28);
    const H = h * scale;
    const cx = 190;
    const topY = (270 - H) / 2;
    const botY = topY + H;
    const parts = [
      `<ellipse cx="${r1(cx)}" cy="${r1(topY)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="none" stroke="currentColor" stroke-width="2"/>`,
      `<path d="M ${r1(cx - rx)} ${r1(botY)} A ${r1(rx)} ${r1(ry)} 0 0 0 ${r1(cx + rx)} ${r1(botY)}" fill="none" stroke="currentColor" stroke-width="2"/>`,
      `<path d="M ${r1(cx - rx)} ${r1(botY)} A ${r1(rx)} ${r1(ry)} 0 0 1 ${r1(cx + rx)} ${r1(botY)}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>`,
      seg([cx - rx, topY], [cx - rx, botY]),
      seg([cx + rx, topY], [cx + rx, botY]),
      P.dot(cx, topY),
      seg([cx, topY], [cx + rx, topY], 1.5),
      measure([cx + rx / 2, topY - 12], radiusText, "middle", 15),
      measure([cx + rx + 10, (topY + botY) / 2], heightText, "start", 15),
    ];
    return { svg: S.svg(400, 270, parts, alt), alt, notToScale: false };
  }

  function coneFigure(r, h, radiusText, useDiameter, alt) {
    const scale = Math.min(160 / (2 * r), 180 / h);
    const rx = r * scale;
    const ry = Math.max(10, rx * 0.28);
    const H = h * scale;
    const cx = 190;
    const apexY = (270 - H) / 2 - 4;
    const baseY = apexY + H;
    const parts = [
      seg([cx, apexY], [cx - rx, baseY]),
      seg([cx, apexY], [cx + rx, baseY]),
      `<path d="M ${r1(cx - rx)} ${r1(baseY)} A ${r1(rx)} ${r1(ry)} 0 0 0 ${r1(cx + rx)} ${r1(baseY)}" fill="none" stroke="currentColor" stroke-width="2"/>`,
      `<path d="M ${r1(cx - rx)} ${r1(baseY)} A ${r1(rx)} ${r1(ry)} 0 0 1 ${r1(cx + rx)} ${r1(baseY)}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>`,
      seg([cx, apexY], [cx, baseY], 1.5, true),
      P.rightAngle(cx, baseY, 0, -1, 1, 0, 10),
      P.dot(cx, baseY),
      useDiameter ? seg([cx - rx, baseY], [cx + rx, baseY], 1.5) : seg([cx, baseY], [cx + rx, baseY], 1.5),
      measure([useDiameter ? cx - rx / 2 : cx + rx / 2, baseY + ry + 14], radiusText, "middle", 15),
      measure([cx - 8, (apexY + baseY) / 2], "h", "end", 15),
    ];
    return { svg: S.svg(400, 270, parts, alt), alt, notToScale: false };
  }

  function boxFigure(e, h, heightText, alt) {
    const scale = Math.min(150 / e, 170 / h);
    const w = e * scale;
    const H = h * scale;
    const depth = [w * 0.42, -w * 0.3];
    const x0 = 200 - (w + depth[0]) / 2;
    const y0 = (270 + H - depth[1]) / 2;
    const f = [[x0, y0], [x0 + w, y0], [x0 + w, y0 - H], [x0, y0 - H]];
    const b = f.map((p) => add(p, depth));
    const parts = [
      P.polygon(f),
      seg(f[1], b[1]), seg(f[2], b[2]), seg(f[3], b[3]),
      seg(b[1], b[2]), seg(b[2], b[3]),
      seg(f[0], b[0], 1.5, true), seg(b[0], b[1], 1.5, true), seg(b[0], b[3], 1.5, true),
      measure([x0 - 8, y0 - H / 2], heightText, "end", 15),
    ];
    return { svg: S.svg(400, 270, parts, alt), alt, notToScale: false };
  }

  /* =================================================== scaling area/volume */

  const cylinderVolume = (r, h) => Math.PI * r * r * h;
  const coneVolume = (r, h) => (Math.PI * r * r * h) / 3;

  const CHANGE_SOLIDS = [
    { name: "right circular cylinder", short: "cylinder", dims: ["radius", "height"], volume: cylinderVolume },
    { name: "cylindrical water tank", short: "tank", dims: ["radius", "height"], volume: cylinderVolume },
    { name: "cylindrical can", short: "can", dims: ["radius", "height"], volume: cylinderVolume },
    { name: "right circular cone", short: "cone", dims: ["radius", "height"], volume: coneVolume },
    { name: "cone-shaped paper cup", short: "cup", dims: ["radius", "height"], volume: coneVolume },
    { name: "pyramid with a square base", short: "pyramid", dims: ["base edge length", "height"], volume: (s, h) => (s * s * h) / 3 },
    { name: "rectangular prism with a square base", short: "prism", dims: ["base edge length", "height"], volume: (s, h) => s * s * h },
    { name: "box with a square base", short: "box", dims: ["base edge length", "height"], volume: (s, h) => s * s * h },
  ];

  const COMPENSATIONS = [
    { r: 1.25, h: 0.64 }, { r: 2, h: 0.25 }, { r: 2.5, h: 0.16 }, { r: 0.8, h: 1.5625 }, { r: 0.5, h: 4 }, { r: 0.4, h: 6.25 },
    { r: 4, h: 0.0625 },
  ];

  const SPHERE_FACTORS = [1.1, 1.2, 1.3, 1.4, 1.5, 2, 0.9, 0.8, 0.7, 0.6, 0.5];

  const CUBE_FACTORS = [1.1, 1.2, 1.3, 1.5, 2, 0.9, 0.8, 0.7, 0.6, 0.5];

  const BOX_PERCENTS = [10, 20, 25, 50, -10, -20, -25, -40, -50];

  const SIMILAR_RATIOS = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [2, 5], [1, 3], [3, 7], [4, 7], [5, 6], [2, 7], [1, 4]];

  const SIMILAR_SOLIDS = ["rectangular prisms", "square pyramids", "right circular cones", "right circular cylinders"];

  const SPHERE_NAMES = ["a sphere", "a spherical balloon", "a spherical tank", "a ball"];

  const pct = (value) => `${fmt(round4(value))}%`;

  const direction = (value) => (value > 0 ? "increase" : "decrease");

  const changeWords = (value) => `${value > 0 ? "increased" : "decreased"} by ${Math.abs(value)}%`;

  // Wrong percent answers for a change in direction `up`, as display
  // strings: only positive magnitudes, and never a decrease of 100% or more.
  // A percent that does not stop within two decimals would print cut off
  // ("158.3333%"), so it drops out too.
  function percentLures(up, list) {
    return list.map(([value, reason]) => {
      if (value === null || !Number.isFinite(value) || value <= 0 || (!up && value >= 100) || !isClean(value, 2)) return [null, reason];
      return [pct(value), reason];
    });
  }

  const altitudeArea = {
    id: "altitude-area",
    domain: GEO,
    skill: "Area and volume",
    subskill: "area",
    difficulty: "Easy",
    title: "Area from a base and its altitude",
    recognize:
      "Area uses the height perpendicular to the base (the dashed altitude), never a slanted side; a triangle takes half of " +
      "base × height and a parallelogram takes all of it.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "neighbouring-rule"],
    build(t) {
      const shape = t.pick(["acute", "acute", "obtuse", "parallelogram", "parallelogram"]);
      const reverse = t.chance(0.3);
      const numeric = t.chance(0.35);
      const triangle = shape !== "parallelogram";
      return retry(() => {
        const [h0, off0, s0] = t.pick(ALTITUDE_TRIPLES);
        const k = s0 <= 10 ? t.int(1, 3) : 1;
        const h = h0 * k;
        const off = off0 * k;
        const s = s0 * k;
        // The foot of the altitude lies strictly inside the base (acute
        // triangle, parallelogram) or on the drawn extension (obtuse).
        const b = shape === "obtuse" ? t.int(Math.max(5, Math.ceil(0.5 * off)), 30) : t.int(off + 3, off + 20);
        if (b === s || b === h || b > 3 * Math.max(h, off)) return null;
        const names = t.pick(AREA_NAMES);
        const figureShape = altitudeShape(shape, names, b, off, h, { base: true, height: !reverse, slant: true });
        const { parts, pts, slantName, heightName, crowded } = figureShape;
        if (crowded) return null;
        const [A, B, C, D] = names;
        const polygonName = triangle ? `triangle ${A}${B}${C}` : `parallelogram ${A}${B}${C}${D}`;
        const baseName = triangle ? `${A}${C}` : `${A}${D}`;
        const area = triangle ? (b * h) / 2 : b * h;
        const alt =
          `${triangle ? "Triangle" : "Parallelogram"} ${triangle ? `${A}${B}${C}` : `${A}${B}${C}${D}`} with base ${baseName} = ${b} along the bottom` +
          `${shape === "obtuse" ? `, extended past ${C} by a dashed segment to ${D}` : ""}. A dashed altitude ${heightName} ${reverse ? "" : `of length ${h} `}` +
          `meets the ${shape === "obtuse" ? "extended base" : "base"} at a right angle. Side ${slantName} is labeled ${s}. The figure is drawn to scale.`;
        const figure = { svg: S.svg(400, 260, parts, alt), alt, notToScale: false };
        const vertexList = triangle ? [pts[A], pts[B], pts[C]] : [pts[A], pts[B], pts[C], pts[D]];
        const principles = [
          "The area of a triangle is (1/2) × base × height; the area of a parallelogram is base × height.",
          "The height is the length of the altitude, the segment perpendicular to the base (or its extension).",
        ];
        const common = { stimulus: null, figure, principles, estimatedSeconds: 60 };
        const footName = figureShape.footName;
        if (!reverse) {
          // The slip that halves or doubles the key appears in about half
          // the items (balanceTwins), so it is not always beside the key.
          return packSpread(t, numeric, area, fmt(area), balanceTwins(t, area, triangle
            ? [
              [shown((b * s) / 2, 1), `Uses the slanted side ${slantName} = ${s} as the height; the height must be perpendicular to the base.`],
              [shown(b * h, 1), "Multiplies base by height without taking half."],
              shape === "acute"
                ? [shown((off * h) / 2, 1), `Finds the area of right triangle ${A}${B}${footName} only, using ${A}${footName} as the base instead of all of ${baseName}.`]
                : [shown(((b + off) * h) / 2, 1), `Uses ${A}${footName}, the base together with its dashed extension, as the base.`],
              [shown(b * s, 1), `Multiplies the base by the slanted side ${slantName} and does not take half.`],
              shape === "acute"
                ? [shown(((b - off) * h) / 2, 1), `Finds the area of right triangle ${B}${footName}${C} only, using ${footName}${C} as the base instead of all of ${baseName}.`]
                : [shown((off * h) / 2, 1), `Uses the dashed extension ${C}${footName} as the base.`],
              [shown(b + h + s, 1), "Adds the labeled lengths instead of finding the area."],
            ]
            : [
              [shown(b * s, 1), `Uses the slanted side ${slantName} = ${s} as the height; the height must be perpendicular to the base.`],
              [shown((b * h) / 2, 1), "Takes half of base × height, as for a triangle."],
              [shown(2 * (b + s), 1), "Gives the perimeter, not the area."],
              [shown((b * s) / 2, 1), `Uses the slanted side as the height and takes half.`],
            ]), {
            ...common,
            // Lengths go in the stem as well as on the figure for a grid-in,
            // and in about a third of multiple-choice items.
            stem: numeric || t.chance(0.35)
              ? `In ${polygonName} shown, ${baseName} = ${b}, ${heightName} = ${h}, and ${slantName} = ${s}. What is the area of ${polygonName}?`
              : `In the figure shown, what is the area of ${polygonName}?`,
            explanation:
              `The base is ${baseName} = ${b} and the height is the altitude ${heightName} = ${h}, which is perpendicular to the base. ` +
              `The area is ${triangle ? `(1/2)(${b})(${h})` : `(${b})(${h})`} = ${num(area)}.`,
            steps: [
              `Base: ${baseName} = ${b}. Height: ${heightName} = ${h}, the dashed segment at a right angle to the base.`,
              `${slantName} = ${s} is a slanted side, not the height.`,
              `Area = ${triangle ? `(1/2) × ${b} × ${h}` : `${b} × ${h}`} = ${num(area)}.`,
            ],
            trap: `${slantName} = ${s} is longer than the height and is not perpendicular to the base; using it gives ${num(triangle ? (b * s) / 2 : b * s)}.`,
            hint: "Which labeled length meets the base at a right angle?",
            verify: () => close(shoelace(vertexList), area),
          });
        }
        const K = area;
        if (!isClean(K, 1)) return null;
        return packSpread(t, numeric, h, fmt(h), balanceTwins(t, h, triangle
          ? [
            [shown(K / b, 2), `Divides the area by the base without doubling; a triangle's area is half of base × height.`],
            [shown(s, 0), `Gives the length of the slanted side ${slantName}, which is not perpendicular to the base.`],
            [shown((2 * K) / s, 2), `Divides twice the area by the slanted side ${slantName} instead of by the base.`],
            [shown((4 * K) / b, 2), "Divides four times the area by the base, doubling once more than the formula needs."],
          ]
          : [
            [shown((2 * K) / b, 2), "Uses the triangle formula, half of base × height, for a parallelogram."],
            [shown(s, 0), `Gives the length of the slanted side ${slantName}, which is not perpendicular to the base.`],
            [shown(K / s, 2), `Divides the area by the slanted side ${slantName} instead of by the base.`],
            [shown(K - b, 2), "Subtracts the base from the area."],
          ]), {
          ...common,
          stem: `In the figure shown, the area of ${polygonName} is ${num(K)}. What is the length of ${heightName}?`,
          explanation:
            `${heightName} is the height to base ${baseName}. ${triangle ? `(1/2)(${b})(${heightName}) = ${num(K)}, so ${heightName} = 2(${num(K)}) ÷ ${b}` : `${b} × ${heightName} = ${num(K)}, so ${heightName} = ${num(K)} ÷ ${b}`} = ${h}.`,
          steps: [
            `${heightName} is perpendicular to the base, so it is the height for base ${baseName} = ${b}.`,
            `${triangle ? `(1/2) × ${b} × ${heightName}` : `${b} × ${heightName}`} = ${num(K)}.`,
            `${heightName} = ${triangle ? `${num(2 * K)} ÷ ${b}` : `${num(K)} ÷ ${b}`} = ${h}.`,
          ],
          trap: triangle ? `Dividing ${num(K)} by ${b} forgets that a triangle's area is only half of base × height.` : `The slanted side ${slantName} is not the height.`,
          hint: "Which formula connects this area to the base and the height?",
          verify: () => {
            const rebuilt = vertexList.map(([x, y]) => [x, y === 0 ? 0 : h]);
            return close(shoelace(rebuilt), K) && close(dist(pts[slantName[0]], pts[slantName[1]]), s);
          },
        });
      });
    },
  };

  const volumeDimension = {
    id: "volume-to-dimension",
    domain: GEO,
    skill: "Area and volume",
    subskill: "volume",
    difficulty: "Medium",
    title: "Working back from a volume",
    recognize:
      "Write the volume formula, substitute what is known, and solve for the unknown length; the value you solve for first " +
      "(r², an edge, a base area) is often not yet the quantity asked for.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity", "neighbouring-rule"],
    build(t) {
      const form = t.pick(["cylinder", "cylinder", "cone", "cube", "prism"]);
      const numeric = t.chance(0.3);
      const units = t.pick(["centimeters", "inches", "feet", "meters"]);
      const cubic = `cubic ${units}`;
      const principles = [
        "Cylinder: V = πr²h. Cone: V = (1/3)πr²h. Rectangular prism: V = length × width × height. Cube: V = s³ and surface area 6s².",
        "To find a length from a volume, substitute the known values and undo each operation in reverse order.",
      ];
      return retry(() => {
        if (form === "cylinder") {
          // Two steps from the volume: r² and then the diameter or the base's
          // circumference; or a height given as a multiple of the radius, which
          // turns the volume into a cube.
          const kind = t.pick(["diameter", "circumference", "ratio"]);
          if (kind === "ratio") {
            const r = t.int(2, 7);
            const m = t.int(2, 5);
            const askHeight = t.chance(0.45);
            const V = m * r ** 3;
            const key = askHeight ? m * r : r;
            const alt = `A right circular cylinder with its height labeled h and a radius r drawn on its top base. The figure is drawn to scale.`;
            const scaleUp = askHeight ? m : 1;
            const rootR3 = Math.sqrt(r ** 3);
            return packSpread(t, numeric, key, fmt(key), [
              [shown(r ** 3, 0), `Stops at r³ = ${fmt(V)} ÷ ${m} = ${r ** 3} without taking the cube root.`],
              [askHeight ? shown(r, 0) : shown(m * r, 0), askHeight ? "Gives the radius; the question asks for the height." : "Gives the height; the question asks for the radius."],
              [Number.isInteger(rootR3) ? shown(rootR3 * scaleUp, 0) : null,
                `Takes the height to be ${m} instead of ${m} times the radius, so it solves ${m}r² = ${fmt(V)}.`],
              [shown((r ** 3 / 3) * scaleUp, 1), "Divides r³ by 3 instead of taking its cube root."],
              [askHeight ? shown(m * r ** 3, 0) : shown(r * r, 0), askHeight ? `Multiplies r³ = ${r ** 3} by ${m} instead of multiplying the radius.` : `Gives r² = ${r * r}, not r.`],
            ], {
              stimulus: null,
              figure: cylinderFigure(r, m * r, "h", "r", alt),
              principles,
              estimatedSeconds: 105,
              stem: `The right circular cylinder shown has a volume of ${fmt(V)}π ${cubic}, and its height h is ${m} times its radius r. What is the ${askHeight ? "height" : "radius"}, in ${units}, of the cylinder?`,
              explanation: `With h = ${m}r, the volume is πr²(${m}r) = ${m}πr³ = ${fmt(V)}π, so r³ = ${r ** 3} and r = ${r}.${askHeight ? ` The height is ${m} × ${r} = ${m * r}.` : ""}`,
              steps: [
                `Substitute h = ${m}r: V = πr²(${m}r) = ${m}πr³.`,
                `${m}πr³ = ${fmt(V)}π, so r³ = ${r ** 3} and r = ${r}.`,
                askHeight ? `h = ${m} × ${r} = ${m * r}.` : `Check: π(${r})²(${m * r}) = ${fmt(V)}π.`,
              ],
              trap: `${r ** 3} is r³, a step on the way; ${askHeight ? "the height is " + m + " times its cube root" : "the radius is its cube root"}.`,
              hint: "Write the height in terms of the radius. What power of r is left in the volume?",
              verify: () => {
                let radius = 1;
                while (Math.PI * radius * radius * (m * radius) < V * Math.PI - 1e-9) radius += 1;
                return close(Math.PI * radius * radius * m * radius, V * Math.PI) && key === (askHeight ? m * radius : radius);
              },
            });
          }
          const r = t.int(2, 12);
          const h = t.int(2, 15);
          if (h === r || h === 2 * r) return null;
          const V = r * r * h;
          const circumference = kind === "circumference";
          const key = 2 * r;
          const keyText = circumference ? `${fmt(2 * r)}π` : fmt(2 * r);
          const piText = (value) => (value === null ? null : `${fmt(value)}π`);
          const show = (value, places) => (circumference ? piText(shown(value, places) === null ? null : value) : shown(value, places));
          const alt = `A right circular cylinder with height labeled ${h} and a radius r drawn on its top base. The figure is drawn to scale.`;
          return packSpread(t, numeric && !circumference, key, keyText, [
            [show(r, 0), circumference ? "Leaves out the 2 in 2πr." : "Gives the radius; the question asks for the diameter."],
            [show(r * r, 0), circumference
              ? `Gives the area of the base, πr² = ${fmt(r * r)}π, instead of its circumference.`
              : `Stops at r² = ${fmt(V)} ÷ ${h} = ${r * r} without taking the square root.`],
            [show(2 * r * r, 0), circumference ? `Uses r² = ${r * r} in place of r in 2πr.` : `Doubles r² = ${r * r} instead of doubling r.`],
            [circumference ? null : shown((r * r) / 2, 1), `Halves r² = ${r * r} instead of taking its square root.`],
            [Number.isInteger(Math.sqrt(V / h / 3)) ? show(2 * Math.sqrt(V / h / 3), 0) : null, "Uses the cone formula, with a factor of 1/3, for a cylinder."],
            [Number.isInteger(Math.sqrt(V)) ? show(2 * Math.sqrt(V), 0) : null, `Takes the square root of ${fmt(V)} without first dividing by the height.`],
          ], {
            stimulus: null,
            figure: cylinderFigure(r, h, num(h), "r", alt),
            principles,
            estimatedSeconds: 95,
            stem: `The right circular cylinder shown has a volume of ${fmt(V)}π ${cubic} and a height of ${h} ${units}. What is the ${circumference ? "circumference" : "diameter"}, in ${units}, of the base of the cylinder?`,
            explanation: `πr²(${h}) = ${fmt(V)}π, so r² = ${fmt(V)} ÷ ${h} = ${r * r} and r = ${r}. ${circumference ? `The circumference of the base is 2π(${r}) = ${keyText}.` : `The diameter is 2r = ${2 * r}.`}`,
            steps: [
              `Set up the volume: πr² × ${h} = ${fmt(V)}π.`,
              `Divide by ${h}π: r² = ${r * r}, so r = ${r}.`,
              circumference ? `Circumference: 2π(${r}) = ${keyText}.` : `Diameter: 2 × ${r} = ${2 * r}.`,
            ],
            trap: `${r * r} is r², a step on the way; the radius is its square root, and the ${circumference ? "circumference is 2π times the radius" : "diameter is twice the radius"}.`,
            hint: "What is left after dividing both sides of the volume formula by πh?",
            verify: () => {
              let radius = 1;
              while (radius * radius * h < V) radius += 1;
              return radius * radius * h === V && key === 2 * radius;
            },
          });
        }
        if (form === "cone") {
          const r = t.int(2, 9);
          const h = t.int(3, 18);
          if ((r * r * h) % 3 || h === r) return null;
          const V = (r * r * h) / 3;
          const useDiameter = t.chance(0.4);
          const given = useDiameter ? 2 * r : r;
          const alt = `A right circular cone with a dashed height h from the vertex to the center of the base, meeting the base at a right angle, and ${useDiameter ? "a diameter" : "a radius"} of the base labeled ${given}. The figure is drawn to scale.`;
          return packSpread(t, numeric, h, fmt(h), [
            [shown(V / (r * r), 2), "Uses the cylinder formula, V = πr²h, leaving out the factor of 1/3."],
            [useDiameter ? shown((3 * V) / (given * given), 2) : null, `Uses the diameter, ${given}, as the radius.`],
            [shown((3 * V) / r, 2), "Divides by r instead of by r²."],
            [shown(3 * V, 0), "Stops at 3V without dividing by r²."],
            [shown((V * 3) / (2 * r), 2), "Divides by 2r instead of by r²."],
          ], {
            stimulus: null,
            figure: coneFigure(r, h, num(given), useDiameter, alt),
            principles,
            estimatedSeconds: 95,
            stem: `The right circular cone shown has a volume of ${fmt(V)}π ${cubic}. The ${useDiameter ? "diameter" : "radius"} of its base is ${given} ${units}. What is the height h, in ${units}, of the cone?`,
            explanation: `${useDiameter ? `The radius is ${given} ÷ 2 = ${r}. ` : ""}(1/3)π(${r})²h = ${fmt(V)}π, so ${r * r}h = ${fmt(3 * V)} and h = ${h}.`,
            steps: [
              useDiameter ? `The radius is half the diameter: r = ${r}.` : `The radius is r = ${r}, so r² = ${r * r}.`,
              `(1/3)π(${r * r})h = ${fmt(V)}π, so ${r * r}h = ${fmt(3 * V)}.`,
              `h = ${fmt(3 * V)} ÷ ${r * r} = ${h}.`,
            ],
            trap: `Dropping the 1/3 treats the cone as a cylinder and gives ${num(tidy(V / (r * r)))}${useDiameter ? `; using the diameter ${given} as the radius is the other common slip` : ""}.`,
            hint: "Which volume formula belongs to a cone, and what is the radius?",
            verify: () => close((Math.PI * r * r * h) / 3, V * Math.PI) && close(given / (useDiameter ? 2 : 1), r),
          });
        }
        if (form === "cube") {
          const e = t.int(2, 9);
          const toSurface = t.chance(0.5);
          const V = e ** 3;
          const SA = 6 * e * e;
          const alt = "A cube drawn in perspective with its hidden edges dashed.";
          const figure = boxFigure(e, e, "", alt);
          if (toSurface) {
            return packSpread(t, numeric, SA, fmt(SA), [
              [shown(e, 0), `Stops at the edge length, ${e}.`],
              [shown(e * e, 0), `Gives the area of one face, ${e * e}, not all six.`],
              [shown(4 * e * e, 0), "Counts only four faces."],
              [shown(6 * e, 0), "Multiplies the edge length by 6 without squaring it."],
            ], {
              stimulus: null,
              figure,
              principles,
              estimatedSeconds: 90,
              stem: `The cube shown has a volume of ${fmt(V)} ${cubic}. What is the total surface area, in square ${units}, of the cube?`,
              explanation: `The edge length is the cube root of ${fmt(V)}, which is ${e}. Each face has area ${e}² = ${e * e}, and the six faces total 6 × ${e * e} = ${SA}.`,
              steps: [
                `Edge length: s³ = ${fmt(V)}, so s = ${e}.`,
                `Area of one face: ${e}² = ${e * e}.`,
                `Six faces: 6 × ${e * e} = ${SA}.`,
              ],
              trap: `The edge ${e} and the face area ${e * e} are steps on the way to the surface area.`,
              hint: "How long is each edge of the cube?",
              verify: () => {
                let edge = 1;
                while (edge ** 3 < V) edge += 1;
                return edge ** 3 === V && close(6 * edge * edge, SA);
              },
            });
          }
          return packSpread(t, numeric, e, fmt(e), [
            [shown(e * e, 0), `Stops at the area of one face, ${SA} ÷ 6 = ${e * e}.`],
            [shown(SA / 4, 1), "Divides the surface area by 4, as if the cube had four faces."],
            [shown((e * e) / 2, 1), `Halves the face area, ${e * e}, instead of taking its square root.`],
            [shown(SA / 6 / 3, 2), "Divides the face area by 3."],
          ], {
            stimulus: null,
            figure,
            principles,
            estimatedSeconds: 90,
            stem: `The cube shown has a total surface area of ${SA} square ${units}. What is the length, in ${units}, of an edge of the cube?`,
            explanation: `The six faces are congruent squares, so each has area ${SA} ÷ 6 = ${e * e}, and the edge length is √${e * e} = ${e}.`,
            steps: [
              `A cube has 6 congruent square faces.`,
              `Area of one face: ${SA} ÷ 6 = ${e * e}.`,
              `Edge: √${e * e} = ${e}.`,
            ],
            trap: `${e * e} is the area of one face, not the length of an edge.`,
            hint: "How many faces does a cube have, and what shape is each?",
            verify: () => {
              let edge = 1;
              while (6 * edge * edge < SA) edge += 1;
              return 6 * edge * edge === SA && edge === e;
            },
          });
        }
        const e = t.int(2, 10);
        const h = t.int(2, 15);
        if (h === e || h === e * e) return null;
        const V = e * e * h;
        const askPerimeter = t.chance(0.4);
        const key = askPerimeter ? 4 * e : e;
        const alt = `A rectangular prism with a square base, drawn in perspective with hidden edges dashed; its height is labeled ${h}. The figure is drawn to scale.`;
        return packSpread(t, numeric, key, fmt(key), [
          [shown(e * e, 0), `Stops at the area of the base, ${fmt(V)} ÷ ${h} = ${e * e}.`],
          [shown(askPerimeter ? e : 4 * e, 0), askPerimeter ? "Gives the length of one side of the base, not the perimeter." : "Gives the perimeter of the base, not the length of one side."],
          [shown(askPerimeter ? 4 * e * e : (e * e) / 2, 1), askPerimeter ? "Multiplies the base area by 4 instead of the side length." : "Halves the base area instead of taking its square root."],
          [shown(V / (4 * h), 2), "Divides the volume by 4 times the height."],
        ], {
          stimulus: null,
          figure: boxFigure(e, h, num(h), alt),
          principles,
          estimatedSeconds: 95,
          stem: `The rectangular prism shown has a square base and a height of ${h} ${units}. The volume of the prism is ${fmt(V)} ${cubic}. What is the ${askPerimeter ? "perimeter" : "length of one side"}, in ${units}, of the base?`,
          explanation: `The base area is ${fmt(V)} ÷ ${h} = ${e * e}, so each side of the square base is √${e * e} = ${e}.${askPerimeter ? ` The perimeter is 4 × ${e} = ${4 * e}.` : ""}`,
          steps: [
            `Base area: ${fmt(V)} ÷ ${h} = ${e * e}.`,
            `Side of the square base: √${e * e} = ${e}.`,
            askPerimeter ? `Perimeter: 4 × ${e} = ${4 * e}.` : `Check: ${e} × ${e} × ${h} = ${fmt(V)}.`,
          ],
          trap: `${e * e} is the area of the base; ${askPerimeter ? "the perimeter uses the side length" : "the side is its square root"}.`,
          hint: "What is the area of the base?",
          verify: () => close(((askPerimeter ? key / 4 : key) ** 2) * h, V),
        });
      });
    },
  };

  const SCALING_PRINCIPLES = [
    "Percent changes combine by multiplying factors: +20% is × 1.2 and −10% is × 0.9.",
    "If every length of a solid is multiplied by k, its surface area is multiplied by k² and its volume by k³.",
  ];

  const RECAST_COUNTS = [[8, 2, "Eight"], [27, 3, "Twenty-seven"], [64, 4, "Sixty-four"], [125, 5, "One hundred twenty-five"]];

  const RECAST_STUFF = [
    { big: "solid metal sphere", small: "solid spheres", melt: "is melted down, and all of the metal is recast as" },
    { big: "ball of modeling clay", small: "balls", melt: "is divided, with none left over, into" },
    { big: "solid ball of wax", small: "solid balls", melt: "is melted, and all of the wax is formed into" },
    { big: "solid lead sphere", small: "solid spheres", melt: "is melted down, and all of the lead is recast as" },
  ];

  // Percent answers print as "44%"; the key text is used to reject a
  // modelled mistake that lands on the key, for grid-ins too.
  const percentItem = (numeric, answer, wrongPercents, fields, t) => {
    const keyText = pct(answer);
    const wrong = spreadWrong(t, keyText, wrongPercents);
    if (!wrong && (!numeric || collides(keyText, wrongPercents))) return null;
    return { responseType: numeric ? "numeric" : "multiple-choice", correct: numeric ? answer : keyText, wrong: wrong || [], ...fields };
  };

  // Whole-number answers print with thousands separators, as the test does.
  const numberItem = (numeric, answer, list, fields, t) => {
    const keyText = fmt(answer);
    const printed = list.map(([value, reason]) => [value === null || value === undefined ? null : fmt(value), reason]);
    const wrong = spreadWrong(t, keyText, printed);
    if (!wrong && (!numeric || collides(keyText, printed))) return null;
    if (numeric && !fitsGridHard(answer)) return null;
    return { responseType: numeric ? "numeric" : "multiple-choice", correct: numeric ? answer : keyText, wrong: wrong || [], ...fields };
  };

  // One scaling item. Medium forms: "change" (two dimensions change by
  // percents), "box" (three), "cube" (an edge changes), "heights" (similar
  // solids compared by height). Hard forms: "compensate" (the volume must not
  // change), "sphere" (surface area and volume through the radius), "similar"
  // (an area ratio gives a volume, or the reverse), "recast" (a sphere melted
  // into smaller ones). Returns null to draw again.
  function scalingItem(t, form, numeric) {
    const principles = SCALING_PRINCIPLES;

    if (form === "change") {
      const solid = t.pick(CHANGE_SOLIDS);
      const dim = solid.dims[0];
      const p = t.pick([10, 20, 30, 40, 50, -10, -20, -30, -40, -50]);
      const q = t.pick([10, 20, 25, 40, 50, -10, -20, -25, -40, -50]);
      const fr = 1 + p / 100;
      const fh = 1 + q / 100;
      const factor = fr * fr * fh;
      const change = round4(100 * (factor - 1));
      if (Math.abs(change) < 2 || !fitsGridHard(change)) return null;
      const up = change > 0;
      const signed = (value) => (Math.sign(value) === Math.sign(change) ? Math.abs(value) : null);
      const opener = `The ${dim} of a ${solid.name} is ${changeWords(p)}, and its height is ${changeWords(q)}.`;
      return percentItem(numeric, Math.abs(change), percentLures(up, [
        [signed(p + q), "Adds the two percent changes, as if the volume changed by their sum."],
        [signed(2 * p + q), `Doubles the percent change in the ${dim} for the square, then adds, instead of multiplying factors.`],
        [signed(round4(100 * (fr * fh - 1))), `Treats the volume as proportional to the ${dim} rather than to its square.`],
        [round4(100 * factor), "Gives the new volume as a percent of the original volume instead of the percent change."],
        [signed(round4(100 * (fr * fr - 1))), `Finds the change in the base area and leaves out the change in height.`],
        [round4(Math.abs(factor - 1)), "Finds the decimal change and writes it as a percent without multiplying by 100."],
      ]), {
        estimatedSeconds: 105,
        stimulus: null,
        figure: null,
        stem: numeric
          ? `${opener} As a result, the volume of the ${solid.short} ${up ? "increases" : "decreases"} by p%. What is the value of p?`
          : `${opener} By what percent does the volume of the ${solid.short} ${direction(change)}?`,
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
      }, t);
    }

    if (form === "box") {
      const [p1, p2, p3] = [t.pick(BOX_PERCENTS), t.pick(BOX_PERCENTS), t.pick(BOX_PERCENTS)];
      const f = [1 + p1 / 100, 1 + p2 / 100, 1 + p3 / 100];
      const factor = f[0] * f[1] * f[2];
      const original = t.pick([120, 160, 200, 240, 300, 320, 360, 400, 480, 600, 640, 800, 900, 1000, 1200]);
      const answer = round4(original * factor);
      if (Math.abs(factor - 1) < 0.02 || !Number.isInteger(answer) || !fitsGridHard(answer)) return null;
      const sum = p1 + p2 + p3;
      const flipped = original * f.map((value) => (value < 1 ? 2 - value : value)).reduce((a, b) => a * b, 1);
      const units = t.pick(["inches", "centimeters"]);
      return numberItem(numeric, answer, [
        [round4(original * (1 + sum / 100)), "Adds the three percent changes and applies the total to the volume."],
        [round4(Math.abs(original * (factor - 1))), "Finds the change in volume instead of the new volume."],
        [f.some((value) => value < 1) ? round4(flipped) : null, "Applies each decrease as an increase of the same percent."],
        [round4(original * f[0] * f[1]), "Applies the changes to the length and width but not the height."],
        [round4(original * f[2]), "Applies only the change to the height."],
      ].map(([value, reason]) => [value !== null && Number.isInteger(value) && value > 0 ? value : null, reason]), {
        estimatedSeconds: 110,
        stimulus: null,
        figure: null,
        stem:
          `A rectangular box has a volume of ${fmt(original)} cubic ${units}. Its length is ${changeWords(p1)}, its width is ` +
          `${changeWords(p2)}, and its height is ${changeWords(p3)}. What is the volume, in cubic ${units}, of the new box?`,
        hint: "Write each change as a multiplier.",
        explanation:
          `The volume is length × width × height, so it is multiplied by ${num(f[0])} × ${num(f[1])} × ${num(f[2])} = ${num(round4(factor))}. ` +
          `The new volume is ${fmt(original)} × ${num(round4(factor))} = ${fmt(answer)} cubic ${units}.`,
        steps: [
          `Factors: ${num(f[0])}, ${num(f[1])}, ${num(f[2])}.`,
          `Volume factor: ${num(round4(factor))}.`,
          `New volume: ${fmt(original)} × ${num(round4(factor))} = ${fmt(answer)}.`,
        ],
        principles,
        trap: `Adding the percents gives ${fmt(round4(original * (1 + sum / 100)))}; percent changes to different dimensions multiply.`,
        verify: () => {
          const [l, w] = [4, 5];
          const h = original / (l * w);
          return close(l * f[0] * (w * f[1]) * (h * f[2]), answer, 1e-9);
        },
      }, t);
    }

    if (form === "cube" || form === "sphere") {
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
      if (!fitsGridHard(answer)) return null;
      const askedWord = kind === "VtoS" || kind === "LtoS" ? "surface area" : "volume";
      const lures = {
        VtoS: [
          [Math.abs(vPct), "Assumes the surface area changes by the same percent as the volume."],
          [Math.abs(lPct), "Stops at the percent change in the radius."],
          [round4(100 * f ** 2), "Gives the new surface area as a percent of the original instead of the percent change."],
          [round4((Math.abs(vPct) * 2) / 3), "Scales the percent by 2/3, treating exponents as multipliers of percent changes."],
          [round4(100 * Math.abs(f ** 6 - 1)), "Squares the volume factor instead of converting it to a radius factor first."],
        ],
        StoV: [
          [Math.abs(sPct), "Assumes the volume changes by the same percent as the surface area."],
          [Math.abs(lPct), "Stops at the percent change in the radius."],
          [round4(100 * f ** 3), "Gives the new volume as a percent of the original instead of the percent change."],
          [round4((Math.abs(sPct) * 3) / 2), "Scales the percent by 3/2, treating exponents as multipliers of percent changes."],
          [round4(100 * Math.abs(Math.sqrt(f) - 1)), "Takes the square root of the surface-area factor twice."],
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
          [Math.abs(lPct), "Assumes the surface area changes by the same percent as each edge."],
        ],
      }[kind];
      const opener = {
        VtoS: `When the radius of ${thing} is changed, its volume ${change} by ${Math.abs(vPct)}%.`,
        StoV: `When the radius of ${thing} is changed, its surface area ${change} by ${Math.abs(sPct)}%.`,
        LtoV: `Each edge of a cube is ${changeWords(lPct)}.`,
        LtoS: `Each edge of a cube is ${changeWords(lPct)}.`,
      }[kind];
      const factorFrom = { VtoS: f ** 3, StoV: f ** 2, LtoV: f, LtoS: f }[kind];
      const power = askedWord === "volume" ? 3 : 2;
      return percentItem(numeric, answer, percentLures(up, lures), {
        estimatedSeconds: 105,
        stimulus: null,
        figure: null,
        stem: numeric
          ? `${opener} As a result, ${short} ${askedWord} ${change} by p%. What is the value of p?`
          : `${opener} By what percent does ${short} ${askedWord} ${direction(f - 1)}?`,
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
          `The ${askedWord} factor is ${num(f)}${power === 3 ? "³" : "²"} = ${num(round4(f ** power))}.`,
          `The ${askedWord} ${change} by ${answer}%.`,
        ],
        principles,
        trap: sphere
          ? "Surface area and volume change by different percents, and exponents do not multiply percent changes; go through the radius factor."
          : "An edge factor is squared for surface area and cubed for volume; multiplying the percent by 2 or 3 is not the same.",
        verify: () => {
          const L = 7;
          const volume = sphere ? (x) => (4 / 3) * Math.PI * x ** 3 : (x) => x ** 3;
          const area = sphere ? (x) => 4 * Math.PI * x ** 2 : (x) => 6 * x ** 2;
          const measured = askedWord === "volume" ? volume(L * f) / volume(L) : area(L * f) / area(L);
          const given = { VtoS: volume(L * f) / volume(L), StoV: area(L * f) / area(L), LtoV: f, LtoS: f }[kind];
          return close(Math.abs(100 * (measured - 1)), answer, 1e-9) && close(given, factorFrom, 1e-12);
        },
      }, t);
    }

    if (form === "compensate") {
      const solid = t.pick(CHANGE_SOLIDS);
      const dim = solid.dims[0];
      const { r: fr, h: fh } = t.pick(COMPENSATIONS);
      const givenRadius = t.chance(0.55);
      const rPct = round4(100 * (fr - 1));
      const hPct = round4(100 * (fh - 1));
      const givenPct = givenRadius ? rPct : hPct;
      const askedPct = givenRadius ? hPct : rPct;
      const answer = Math.abs(askedPct);
      if (!fitsGridHard(answer)) return null;
      const up = askedPct > 0;
      const givenDim = givenRadius ? dim : "height";
      const askedDim = givenRadius ? "height" : dim;
      const askedDirection = up ? "increased" : "decreased";
      const opener = `The ${givenDim} of a ${solid.name} is ${givenPct > 0 ? "increased" : "decreased"} by ${Math.abs(givenPct)}%.`;
      return percentItem(numeric, answer, percentLures(up, givenRadius
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
        ]), {
        estimatedSeconds: 110,
        stimulus: null,
        figure: null,
        stem: numeric
          ? `${opener} Its ${askedDim} is then ${askedDirection} by p% so that the volume of the ${solid.short} is unchanged. What is the value of p?`
          : `${opener} By what percent must its ${askedDim} be ${askedDirection} so that the volume of the ${solid.short} does not change?`,
        hint: "Write each change as a multiplier. What must their combined effect on the volume be?",
        explanation:
          `The volume is proportional to (${dim})² × height, so the factors must satisfy (${dim} factor)² × (height factor) = 1. ` +
          (givenRadius
            ? `The ${dim} factor is ${num(fr)}, so the height factor is 1 ÷ ${num(fr)}² = 1 ÷ ${num(round4(fr * fr))} = ${num(fh)}: the height is ${askedDirection} by ${answer}%.`
            : `The height factor is ${num(fh)}, so the ${dim} factor is √(1 ÷ ${num(fh)}) = ${num(fr)}: the ${dim} is ${askedDirection} by ${answer}%.`),
        steps: [
          `Volume ∝ (${dim})² × height, so the factors must multiply to 1.`,
          givenRadius ? `${dim.charAt(0).toUpperCase()}${dim.slice(1)} factor ${num(fr)}; squared: ${num(round4(fr * fr))}.` : `Height factor ${num(fh)}.`,
          givenRadius ? `Height factor: 1 ÷ ${num(round4(fr * fr))} = ${num(fh)}.` : `${dim.charAt(0).toUpperCase()}${dim.slice(1)} factor: √(1 ÷ ${num(fh)}) = ${num(fr)}.`,
          `The ${askedDim} is ${askedDirection} by ${answer}%.`,
        ],
        principles,
        trap: `Undoing a percent change by the same percent, or ignoring the square on the ${dim}, leaves the volume changed.`,
        verify: () => close(solid.volume(10 * fr, 10 * fh), solid.volume(10, 10), 1e-9),
      }, t);
    }

    if (form === "heights" || form === "similar") {
      const [m, n] = t.pick(SIMILAR_RATIOS);
      const solids = t.pick(SIMILAR_SOLIDS);
      const variant = form === "heights" ? "volume" : t.pick(["ratio", "volume", "volume", "area", "area"]);
      const byHeight = form === "heights";
      const box = (s) => ({ area: 2 * (s * 2 * s + s * 3 * s + 2 * s * 3 * s), volume: s * 2 * s * 3 * s });
      if (variant === "ratio") {
        const ratio = (a, b) => `${fmt(a)} to ${fmt(b)}`;
        const correct = ratio(m ** 3, n ** 3);
        const wrong = spreadWrong(t, correct, [
          [ratio(m * m, n * n), "Uses the ratio of the surface areas as the ratio of the volumes."],
          [ratio(m, n), "Finds the ratio of corresponding lengths and stops."],
          [ratio(m ** 4, n ** 4), "Squares the surface-area ratio instead of converting it to a length ratio first."],
          [ratio(m ** 6, n ** 6), "Cubes the surface-area ratio instead of the length ratio."],
        ]);
        if (!wrong) return null;
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
            const small = box(m);
            const large = box(n);
            return close(small.area / large.area, (m * m) / (n * n), 1e-12) && close(small.volume / large.volume, m ** 3 / n ** 3, 1e-12);
          },
        };
      }
      if (!byHeight && (solids.includes("cones") || solids.includes("cylinders"))) return null;
      const w = t.int(1, 6);
      if (variant === "volume") {
        const smallVolume = m ** 3 * w;
        const answer = n ** 3 * w;
        if (!fitsGridHard(answer)) return null;
        const heightScale = byHeight ? t.pick([2, 3, 4, 5]) : 1;
        const stemGiven = byHeight
          ? `Two similar ${solids} have heights of ${m * heightScale} centimeters and ${n * heightScale} centimeters.`
          : `Two similar ${solids} have total surface areas in the ratio ${m * m} to ${n * n}.`;
        return numberItem(numeric, answer, [
          [byHeight ? n * n * m * w : m * n * n * w, byHeight
            ? "Scales the volume by the square of the height ratio, as for an area."
            : "Scales the volume by the surface-area ratio instead of the cube of the length ratio."],
          [m * m * n * w, byHeight ? "Scales the volume by the height ratio alone." : "Scales the volume by the length ratio alone."],
          [w * m * m * (3 * n - 2 * m), "Triples the percent increase in length instead of cubing the scale factor."],
          [smallVolume + (n - m) * heightScale, "Adds the difference in heights to the volume, as if volumes grew by a fixed amount."],
        ].map(([value, reason]) => [value > 0 ? value : null, reason]), {
          estimatedSeconds: 105,
          stimulus: null,
          figure: null,
          stem: `${stemGiven} The volume of the smaller solid is ${S.plural(smallVolume, "cubic centimeter", "cubic centimeters")}. What is the volume, in cubic centimeters, of the larger solid?`,
          hint: byHeight ? "How does volume respond when every length is scaled?" : "What ratio of lengths produces that ratio of areas?",
          explanation:
            (byHeight
              ? `The heights give the ratio of corresponding lengths, ${m} to ${n}. `
              : `The surface areas are in the ratio ${m * m} to ${n * n}, so corresponding lengths are in the ratio ${m} to ${n}. `) +
            `Volumes are in the ratio ${m ** 3} to ${n ** 3}, so the larger volume is ${fmt(smallVolume)} × ${n ** 3}/${m ** 3} = ${fmt(answer)}.`,
          steps: [
            byHeight ? `Length ratio: ${m * heightScale}/${n * heightScale} = ${m}/${n}.` : `Length ratio: √(${m * m}/${n * n}) = ${m}/${n}.`,
            `Volume ratio: (${m}/${n})³ = ${m ** 3}/${n ** 3}.`,
            `Larger volume: ${fmt(smallVolume)} × ${n ** 3}/${m ** 3} = ${fmt(answer)}.`,
          ],
          principles,
          trap: `Scaling the volume by an area ratio or by the length ratio misses that volume depends on the cube of the length ratio.`,
          verify: () => {
            const edge = Math.cbrt(smallVolume / 6);
            const small = box(edge);
            const large = box((edge * n) / m);
            return close(large.area / small.area, (n * n) / (m * m), 1e-12) && close(large.volume, answer, 1e-9);
          },
        }, t);
      }
      // area from a volume ratio
      const smallArea = m * m * w;
      const answer = n * n * w;
      if (!fitsGridHard(answer)) return null;
      return numberItem(numeric, answer, [
        [round4((smallArea * n ** 3) / m ** 3), "Scales the surface area by the volume ratio."],
        [m * n * w, "Scales the surface area by the length ratio alone."],
        [w * m * (2 * n - m), "Doubles the percent increase in length instead of squaring the scale factor."],
        [round4((smallArea * n ** 1.5) / m ** 1.5), "Takes the square root of the volume ratio instead of the cube root."],
      ].map(([value, reason]) => [Number.isInteger(value) ? value : null, reason]), {
        estimatedSeconds: 105,
        stimulus: null,
        figure: null,
        stem:
          `Two similar ${solids} have volumes in the ratio ${m ** 3} to ${n ** 3}. The total surface area of the smaller solid is ` +
          `${S.plural(smallArea, "square centimeter", "square centimeters")}. What is the total surface area, in square centimeters, of the larger solid?`,
        hint: "What ratio of lengths produces that ratio of volumes?",
        explanation:
          `The volumes are in the ratio ${m ** 3} to ${n ** 3}, so corresponding lengths are in the ratio ${m} to ${n} and surface areas in the ratio ` +
          `${m * m} to ${n * n}. The larger surface area is ${fmt(smallArea)} × ${n * n}/${m * m} = ${fmt(answer)}.`,
        steps: [`Length ratio: cube root of ${m ** 3}/${n ** 3} = ${m}/${n}.`, `Area ratio: (${m}/${n})² = ${m * m}/${n * n}.`, `Larger area: ${fmt(smallArea)} × ${n * n}/${m * m} = ${fmt(answer)}.`],
        principles,
        trap: "The volume ratio is not the area ratio; take its cube root to get the length ratio, then square.",
        verify: () => {
          const edge = Math.sqrt(smallArea / 22);
          const small = box(edge);
          const large = box((edge * n) / m);
          return close(large.volume / small.volume, n ** 3 / m ** 3, 1e-12) && close(large.area, answer, 1e-9);
        },
      }, t);
    }

    // recast: a solid sphere melted down and recast as equal smaller spheres.
    const [count, root, countWord] = t.pick(RECAST_COUNTS);
    const stuff = t.pick(RECAST_STUFF);
    const r = t.int(1, 9);
    const R = root * r;
    const u = t.pick(["centimeters", "inches", "millimeters"]);
    const ask = t.pick(["radius", "radius", "surface"]);
    const lead =
      `A ${stuff.big} with a radius of ${R} ${u} ${stuff.melt} ${countWord.toLowerCase()} identical ${stuff.small}.`;
    const verifyRecast = () => {
      const big = (4 / 3) * Math.PI * R ** 3;
      const each = (4 / 3) * Math.PI * r ** 3;
      return close(count * each, big, 1e-9);
    };
    if (ask === "radius") {
      const sqrtCount = Math.sqrt(count);
      return numberItem(numeric, r, [
        [R / count, `Divides the radius by ${count}, as if each small sphere got an equal share of the radius instead of the volume.`],
        [r ** 3 === r ? null : r ** 3, `Stops at r³ = ${R}³ ÷ ${count} = ${r ** 3} without taking the cube root.`],
        [Number.isInteger(R / sqrtCount) ? R / sqrtCount : null, `Divides the surface area, not the volume, among the ${count} spheres.`],
        [2 * r, "Gives the diameter of each small sphere instead of its radius."],
      ].map(([value, reason]) => [value !== null && value > 0 && isClean(value, 2) ? round4(value) : null, reason]), {
        estimatedSeconds: 110,
        stimulus: null,
        figure: null,
        stem: `${lead} What is the radius, in ${u}, of each of the smaller ${stuff.small.replace("solid ", "")}?`,
        hint: "What stays the same when the metal is recast?",
        explanation:
          `The total volume is unchanged: (4/3)π(${R})³ = ${count} × (4/3)πr³. So r³ = ${R}³ ÷ ${count} = ${fmt(R ** 3)} ÷ ${count} = ${r ** 3}, and r = ${r}.`,
        steps: [
          `Volume is conserved: ${count} × (4/3)πr³ = (4/3)π(${R})³.`,
          `r³ = ${fmt(R ** 3)} ÷ ${count} = ${r ** 3}.`,
          `r = ∛${r ** 3} = ${r}; the radius is divided by ∛${count} = ${root}, not by ${count}.`,
        ],
        principles: principles.concat(["The volume of a sphere is (4/3)πr³."]),
        trap: `Splitting the volume ${count} ways divides the radius by only ∛${count} = ${root}, not by ${count}.`,
        verify: verifyRecast,
      }, t);
    }
    // surface: total surface area of the small spheres compared with the original.
    return numberItem(numeric, root, [
      [1, "Assumes the total surface area is conserved, like the volume."],
      [count, `Multiplies by the number of spheres, ${count}, without accounting for their smaller size.`],
      [root * root, `Uses the square of the radius ratio, ${root}², which compares one small sphere's area with the original's, upside down.`],
      [isClean(1 / root, 2) ? 1 / root : null, "Divides by the radius ratio instead of multiplying."],
    ], {
      estimatedSeconds: 115,
      stimulus: null,
      figure: null,
      stem:
        `${lead} The total surface area of the ${countWord.toLowerCase()} smaller ${stuff.small.replace("solid ", "")} is k times the surface area of the original ${stuff.big.replace(/^solid (metal |lead )?/, "")}. What is the value of k?`,
      hint: "How does each small radius compare with the original radius?",
      explanation:
        `Volume is conserved, so each small radius is ${R} ÷ ∛${count} = ${r}, which is 1/${root} of the original. Each small sphere has 1/${root * root} of the original ` +
        `surface area, and there are ${count} of them: ${count} × 1/${root * root} = ${root}. So k = ${root}.`,
      steps: [
        `Each small radius: r³ = ${fmt(R ** 3)} ÷ ${count} = ${r ** 3}, so r = ${r} = (1/${root}) × ${R}.`,
        `Each small surface area is (1/${root})² = 1/${root * root} of the original.`,
        `Total: ${count} × 1/${root * root} = ${root}.`,
      ],
      principles: principles.concat(["The surface area of a sphere is 4πr², and its volume is (4/3)πr³."]),
      trap: "Recasting keeps the volume, not the surface area: many small spheres have more total surface than one large one.",
      verify: () => verifyRecast() && close((count * 4 * Math.PI * r * r) / (4 * Math.PI * R * R), root, 1e-12),
    }, t);
  }

  const scalingMedium = {
    id: "scaling-dimension-change",
    domain: DOMAIN,
    skill: "Area and volume",
    subskill: "volume",
    difficulty: "Medium",
    title: "Percent changes to the dimensions of a solid",
    recognize:
      "Each percent change is a factor, and the factors multiply: a length that appears twice in the formula (a radius, " +
      "a square base's edge) contributes its factor twice, and every edge of a cube contributes to the volume.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "percent-base", "intermediate-value"],
    build(t) {
      const form = t.pick(["change", "change", "box", "cube", "heights", "similar"]);
      const numeric = t.chance(0.36);
      return retry(() => scalingItem(t, form, numeric));
    },
  };

  const scalingSolids = {
    id: "scaling-area-volume",
    domain: DOMAIN,
    skill: "Area and volume",
    subskill: "volume",
    difficulty: "Hard",
    title: "Surface area and volume under scaling",
    recognize:
      "Decide which quantity is conserved or given before computing: a volume or an area ratio fixes the length factor " +
      "(a cube or square root), and every other measure follows from that length factor, squared for areas and cubed for volumes.",
    // Hard (declared 2026-09-26; it had defaulted to Hard): the volume held
    // fixed while one dimension changes, a sphere's area from its volume
    // change, or a sphere recast as smaller ones; each needs the length
    // factor found by a root first. Similar solids compared by an area or
    // volume ratio are Medium and live in scaling-dimension-change.
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "percent-base", "intermediate-value"],
    build(t) {
      const form = t.pick(["compensate", "compensate", "sphere", "sphere", "recast", "recast"]);
      const numeric = t.chance(0.36);
      return retry(() => scalingItem(t, form, numeric));
    },
  };

  /* ========================================= rectilinear-floor-plan (Easy) */

  const PLAN_CONTEXTS = [
    { lead: "The figure shows the floor plan of a room.", thing: "room", units: "feet" },
    { lead: "The figure shows the shape of a patio.", thing: "patio", units: "feet" },
    { lead: "The figure shows the outline of a garden plot.", thing: "garden plot", units: "meters" },
    { lead: "The figure shows the shape of a wooden deck.", thing: "deck", units: "feet" },
  ];

  const COVERINGS = [
    { outer: "yard", inner: "pool", placed: "is built in the yard", units: "feet" },
    { outer: "floor", inner: "rug", placed: "lies on the floor", units: "feet" },
    { outer: "poster board", inner: "photograph", placed: "is glued to the poster board", units: "inches" },
    { outer: "parking lot", inner: "garden", placed: "is planted in the middle of the parking lot", units: "meters" },
  ];

  // Which labeled sides each layout shows, by edge index of planPolygon:
  // 0 bottom (W), 1 right (H − b), 2 corner floor (a), 3 corner wall (b),
  // 4 top (W − a), 5 left (H). Every layout fixes the whole figure.
  const PLAN_LAYOUTS = { outer: [0, 5, 4, 1], corner: [0, 5, 2, 3], pieces: [0, 1, 3, 4] };

  // A W × H rectangle with an a × b rectangle missing from one corner,
  // reflected so the missing corner can be any of the four.
  function planPolygon(W, H, a, b, flipX, flipY) {
    const base = [[0, 0], [W, 0], [W, H - b], [W - a, H - b], [W - a, H], [0, H]];
    return base.map(([x, y]) => [flipX ? W - x : x, flipY ? H - y : y]);
  }

  // "an 11-by-3 corner", "a 12-by-3 corner".
  const article = (value) => (/^8/.test(String(value)) || value === 11 || value === 18 ? "an" : "a");

  // Ray-casting point-in-polygon test.
  function inside(point, polygon) {
    let hit = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if ((yi > point[1]) !== (yj > point[1]) && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

  // Label for edge pq of a polygon, on the side away from its interior.
  function outsideLabel(polygon, p, q, text, gap = 14) {
    const u = unit(sub(q, p));
    let n = [-u[1], u[0]];
    if (inside(add(mid(p, q), mul(n, 4)), polygon)) n = mul(n, -1);
    return measure(add(mid(p, q), mul(n, gap)), text, anchorFor(n));
  }

  // "bottom side", "left side", or "inner horizontal side" for an edge of the plan.
  function planEdgeWords(p, q, W, H) {
    const m = mid(p, q);
    if (Math.abs(p[1] - q[1]) < 1e-9) return m[1] < 1e-9 ? "bottom side" : Math.abs(m[1] - H) < 1e-9 ? "top side" : "inner horizontal side";
    return m[0] < 1e-9 ? "left side" : Math.abs(m[0] - W) < 1e-9 ? "right side" : "inner vertical side";
  }

  const rectilinearPlan = {
    id: "rectilinear-floor-plan",
    domain: GEO,
    skill: "Area and volume",
    subskill: "area",
    difficulty: "Easy",
    title: "Area of a region made of rectangles",
    recognize:
      "A region with only right angles is a rectangle with a piece missing, or two rectangles side by side: find any side " +
      "that is not labeled from the ones that are, then subtract the missing piece or add the pieces, without counting any part twice.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["intermediate-value", "neighbouring-rule", "part-vs-whole"],
    build(t) {
      const form = t.pick(["plan", "plan", "plan", "covering"]);
      // A figure-only plan is multiple choice: as a grid-in its stem would
      // repeat word for word, with every number on the figure.
      const numeric = form === "covering" && t.chance(0.6);
      const principles = [
        "The area of a rectangle is length × width.",
        "The area of a region made of rectangles is the sum of the pieces, or the whole rectangle minus the missing piece.",
      ];
      return retry(() => {
        if (form === "covering") {
          const ctx = t.pick(COVERINGS);
          const W = t.int(12, 60);
          const H = t.int(8, W - 2);
          const w = t.int(3, W - 4);
          const h = t.int(2, H - 3);
          if (w === h || W === w + h || (W - w) * (H - h) === W * H - w * h) return null;
          const key = W * H - w * h;
          const u = ctx.units;
          return packSpread(t, numeric, key, fmt(key), [
            [shown((W - w) * (H - h), 0), `Subtracts the ${ctx.inner}'s length and width from the ${ctx.outer}'s and multiplies the differences; the region left over is not ${article(W - w)} ${W - w}-by-${H - h} rectangle.`],
            [shown(W * H, 0), `Gives the area of the whole ${ctx.outer}, without removing the ${ctx.inner}.`],
            [shown(w * h, 0), `Gives the area of the ${ctx.inner}, the part that is covered.`],
            [shown(W * H + w * h, 0), `Adds the area of the ${ctx.inner} instead of subtracting it.`],
            [shown(W * H - w - h, 0), `Subtracts the ${ctx.inner}'s length and width, ${w} and ${h}, from the area of the ${ctx.outer} instead of subtracting its area.`],
          ], {
            stimulus: null,
            figure: null,
            principles,
            estimatedSeconds: 60,
            stem:
              `A rectangular ${ctx.outer} is ${W} ${u} long and ${H} ${u} wide. A rectangular ${ctx.inner} that is ${w} ${u} long and ${h} ${u} wide ${ctx.placed}. ` +
              `What is the area, in square ${u}, of the part of the ${ctx.outer} that is not covered by the ${ctx.inner}?`,
            explanation:
              `The ${ctx.outer} has area ${W} × ${H} = ${fmt(W * H)} and the ${ctx.inner} covers ${w} × ${h} = ${fmt(w * h)} of it, ` +
              `so ${fmt(W * H)} − ${fmt(w * h)} = ${fmt(key)} square ${u} are not covered.`,
            steps: [
              `Area of the ${ctx.outer}: ${W} × ${H} = ${fmt(W * H)}.`,
              `Area of the ${ctx.inner}: ${w} × ${h} = ${fmt(w * h)}.`,
              `Uncovered area: ${fmt(W * H)} − ${fmt(w * h)} = ${fmt(key)}.`,
            ],
            trap: `Subtracting the lengths and widths first, (${W} − ${w})(${H} − ${h}) = ${fmt((W - w) * (H - h))}, removes strips that the ${ctx.inner} does not cover.`,
            hint: `What part of the ${ctx.outer} does the ${ctx.inner} take up?`,
            verify: () => {
              // Count unit squares of the outer rectangle outside an inner one placed at (2, 1).
              let count = 0;
              for (let x = 0; x < W; x += 1) {
                for (let y = 0; y < H; y += 1) {
                  const covered = x >= 2 && x < 2 + w && y >= 1 && y < 1 + h;
                  if (!covered) count += 1;
                }
              }
              return count === key && 2 + w <= W && 1 + h <= H;
            },
          });
        }

        const W = t.int(10, 30);
        const H = t.int(8, 24);
        if (W / H < 0.8 || W / H > 2.3) return null;
        const a = t.int(3, Math.round(0.7 * W));
        const b = t.int(2, Math.round(0.7 * H));
        if (a === b || W - a === a || H - b === b || W - a === H - b) return null;
        const layoutName = t.pick(["outer", "outer", "corner", "pieces"]);
        const layout = PLAN_LAYOUTS[layoutName];
        const lengths = [W, H - b, a, b, W - a, H];
        const flipX = t.chance(0.5);
        const flipY = t.chance(0.35);
        const model = planPolygon(W, H, a, b, flipX, flipY);
        const map = fitPoints(model, 400, 260, 48);
        const screen = model.map(map);
        // Every labeled side is long enough on screen that labels on the two
        // sides of the notch cannot overprint at its inner corner.
        if (layout.some((edge) => dist(screen[edge], screen[(edge + 1) % 6]) < 48)) return null;
        const parts = [P.polygon(screen)];
        layout.forEach((edge) => parts.push(outsideLabel(screen, screen[edge], screen[(edge + 1) % 6], num(lengths[edge]))));
        const described = layout.map((edge) => `the ${planEdgeWords(model[edge], model[(edge + 1) % 6], W, H)} is labeled ${lengths[edge]}`);
        const alt =
          `A six-sided figure with all right angles, shaped like a rectangle with one corner cut away. ` +
          `${described.slice(0, -1).join(", ").replace(/^t/, "T")}, and ${described[described.length - 1]}. The figure is drawn to scale.`;
        const ctx = t.chance(0.5) ? t.pick(PLAN_CONTEXTS) : null;
        const stem = ctx
          ? `${ctx.lead} All angles are right angles, and the lengths shown are in ${ctx.units}. What is the area, in square ${ctx.units}, of the ${ctx.thing}?`
          : "In the figure shown, all angles are right angles. What is the area of the figure?";
        const key = W * H - a * b;
        const lower = W * (H - b);
        const upper = (W - a) * b;
        // The third choice is the slip each layout invites: the wrong corner
        // when the outer sides are labeled, a double-counted overlap when the
        // corner is, and a forgotten piece when the two pieces are.
        const wrongCorner = [shown(W * H - (W - a) * (H - b), 0), `Subtracts ${article(W - a)} ${W - a}-by-${H - b} rectangle built from the labeled sides instead of the missing ${a}-by-${b} corner.`];
        const overlap = [shown(W * (H - b) + (W - a) * H, 0), "Splits the figure into two rectangles that overlap and counts the overlapping part twice."];
        const onePiece = [shown(lower, 0), "Finds the area of only one of the two rectangles that make up the figure."];
        const smallPiece = [shown((W - a) * b, 0), `Finds the area of only the ${W - a}-by-${b} part of the figure.`];
        const corner = [shown(a * b, 0), `Gives the area of the missing ${a}-by-${b} corner, which is not part of the figure.`];
        const candidates = [
          [shown(W * H, 0), `Multiplies ${W} by ${H} as if the figure were a complete rectangle; the missing ${a}-by-${b} corner is not part of the figure.`],
          [shown(2 * (W + H), 0), "Adds the lengths of all six sides, which gives the perimeter of the figure, not its area."],
          ...{ outer: [wrongCorner, overlap, onePiece], corner: [overlap, onePiece], pieces: [onePiece, overlap] }[layoutName],
          smallPiece,
          corner,
          [shown(W * H + a * b, 0), `Adds the area of the missing ${a}-by-${b} corner instead of subtracting it.`],
        ];
        const explanation = {
          outer:
            `The missing corner measures ${W} − ${W - a} = ${a} by ${H} − ${H - b} = ${b}. The full rectangle has area ${W} × ${H} = ${fmt(W * H)}, ` +
            `so the figure has area ${fmt(W * H)} − ${a} × ${b} = ${fmt(key)}.`,
          corner: `The figure is ${article(W)} ${W}-by-${H} rectangle with ${article(a)} ${a}-by-${b} corner removed: ${fmt(W * H)} − ${fmt(a * b)} = ${fmt(key)}.`,
          pieces:
            `A cut along the inner horizontal side splits the figure into ${article(W)} ${W}-by-${H - b} rectangle and ${article(W - a)} ${W - a}-by-${b} rectangle: ` +
            `${fmt(lower)} + ${fmt(upper)} = ${fmt(key)}.`,
        }[layoutName];
        const steps = {
          outer: [
            `Missing corner: ${W} − ${W - a} = ${a} and ${H} − ${H - b} = ${b}.`,
            `Full rectangle: ${W} × ${H} = ${fmt(W * H)}; missing corner: ${a} × ${b} = ${fmt(a * b)}.`,
            `Area: ${fmt(W * H)} − ${fmt(a * b)} = ${fmt(key)}.`,
          ],
          corner: [
            `Full rectangle: ${W} × ${H} = ${fmt(W * H)}.`,
            `Missing corner: ${a} × ${b} = ${fmt(a * b)}.`,
            `Area: ${fmt(W * H)} − ${fmt(a * b)} = ${fmt(key)}.`,
          ],
          pieces: [
            `The side opposite the ${W} side is split: its missing part is ${W} − ${W - a} = ${a}.`,
            `Pieces: ${W} × ${H - b} = ${fmt(lower)} and ${W - a} × ${b} = ${fmt(upper)}.`,
            `Area: ${fmt(lower)} + ${fmt(upper)} = ${fmt(key)}.`,
          ],
        }[layoutName];
        return packSpread(t, numeric, key, fmt(key), candidates, {
          stimulus: null,
          figure: { svg: S.svg(400, 260, parts, alt), alt, notToScale: false },
          stem,
          explanation,
          steps,
          principles,
          trap: `${W} × ${H} = ${fmt(W * H)} includes the missing corner; the figure is smaller than the rectangle around it.`,
          hint: "Could the figure be seen as a rectangle with a piece missing?",
          estimatedSeconds: 70,
          verify: () =>
            close(shoelace(model), key) &&
            layout.every((edge) => close(dist(model[edge], model[(edge + 1) % 6]), lengths[edge])),
        });
      });
    },
  };

  /* ======================================= volume-unit-conversion (Medium) */

  const YARD_JOBS = [
    { thing: "sandbox", material: "sand", deep: "deep" },
    { thing: "raised garden bed", material: "soil", deep: "deep" },
    { thing: "pit", material: "gravel", deep: "deep" },
  ];

  const TANKS = [
    { thing: "aquarium", tall: "tall" },
    { thing: "fish tank", tall: "tall" },
    { thing: "storage bin", tall: "tall" },
    { thing: "planter box", tall: "deep" },
  ];

  const INCH_BOXES = [{ thing: "shipping box" }, { thing: "storage chest" }, { thing: "toy box" }];

  // A rectangular prism in oblique view, drawn to scale: length along the
  // front bottom edge, width receding, height up the front; hidden edges dashed.
  function prismFigure(l, w, h, texts, alt) {
    const along = [Math.cos(toRad(32)), -Math.sin(toRad(32))];
    const depth = 0.55;
    const scale = Math.min(240 / (l + depth * w * along[0]), 170 / (h - depth * w * along[1]));
    const L = l * scale;
    const H = h * scale;
    const d = mul(along, depth * w * scale);
    const x0 = (400 - (L + d[0])) / 2 - 6;
    const y0 = 135 + (H - d[1]) / 2;
    const f = [[x0, y0], [x0 + L, y0], [x0 + L, y0 - H], [x0, y0 - H]];
    const b = f.map((p) => add(p, d));
    const parts = [
      P.polygon(f),
      seg(f[1], b[1]), seg(f[2], b[2]), seg(f[3], b[3]),
      seg(b[1], b[2]), seg(b[2], b[3]),
      seg(f[0], b[0], 1.5, true), seg(b[0], b[1], 1.5, true), seg(b[0], b[3], 1.5, true),
      unitText(add(mid(f[0], f[1]), [0, 18]), texts[0], "middle"),
      unitText(add(mid(f[1], b[1]), [10, 10]), texts[1], "start"),
      unitText(add(mid(f[0], f[3]), [-9, 0]), texts[2], "end"),
    ];
    return { svg: S.svg(400, 270, parts, alt), alt, notToScale: false };
  }

  const volumeUnits = {
    id: "volume-unit-conversion",
    domain: GEO,
    skill: "Area and volume",
    subskill: "volume",
    difficulty: "Medium",
    title: "Volume in a different unit",
    recognize:
      "A volume has three dimensions, so a length conversion is used three times: a cubic yard is 3 × 3 × 3 = 27 cubic feet " +
      "and a cubic meter is 100 × 100 × 100 cubic centimeters. Put every dimension in the same unit before multiplying.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["unit-mismatch", "intermediate-value"],
    build(t) {
      const form = t.pick(["yards", "yards", "feet", "meters", "mixed", "mixed", "time"]);
      const numeric = form !== "meters" && t.chance(0.35);
      const withFigure = t.chance(0.5);
      const principles = [
        "The volume of a rectangular prism is length × width × height, with all three lengths in the same unit.",
        "A cubic unit converts by the cube of the length conversion: 1 cubic yard = 3³ = 27 cubic feet, 1 cubic foot = 12³ = 1,728 cubic inches, and 1 cubic meter = 100³ = 1,000,000 cubic centimeters.",
      ];
      return retry(() => {
        let dims;
        let unitWord;
        let short;
        let wrong;
        let key;
        let ask;
        let fact;
        let explanation;
        let steps;
        let trap;
        let check;
        let job;
        let tallWord = "tall";
        if (form === "yards") {
          const l = t.int(6, 24);
          const w = t.int(3, 15);
          const h = t.int(2, 4);
          const V = l * w * h;
          if (V % 27 || l <= w || V / 27 > 80) return null;
          job = t.pick(YARD_JOBS);
          dims = [l, w, h];
          unitWord = "feet";
          short = "ft";
          tallWord = job.deep;
          key = V / 27;
          fact = `${job.material.charAt(0).toUpperCase()}${job.material.slice(1)} is sold by the cubic yard, and there are 3 feet in 1 yard.`;
          ask = `How many cubic yards of ${job.material} are needed to fill the ${job.thing}?`;
          wrong = [
            [V / 3, "Divides the volume in cubic feet by 3, but a cubic yard is 3 × 3 × 3 = 27 cubic feet."],
            [V / 9, "Converts only two of the three dimensions to yards, dividing by 9 instead of 27."],
            [V, "Gives the volume in cubic feet; the question asks for cubic yards."],
            [V / 36, "Divides by 36, the number of inches in a yard, instead of by 27, the number of cubic feet in a cubic yard."],
          ];
          explanation = `The volume is ${l} × ${w} × ${h} = ${fmt(V)} cubic feet. A cubic yard is 3 × 3 × 3 = 27 cubic feet, so the ${job.thing} holds ${fmt(V)} ÷ 27 = ${num(key)} cubic yards.`;
          steps = [`Volume: ${l} × ${w} × ${h} = ${fmt(V)} cubic feet.`, "1 cubic yard = 3 × 3 × 3 = 27 cubic feet.", `${fmt(V)} ÷ 27 = ${num(key)} cubic yards.`];
          trap = `Dividing by 3 converts a length, not a volume: ${fmt(V)} ÷ 3 = ${fmt(V / 3)} is far too many cubic yards.`;
          check = () => close((l / 3) * (w / 3) * (h / 3), key);
        } else if (form === "feet") {
          const l = 6 * t.int(2, 8);
          const w = 6 * t.int(2, 6);
          const h = 6 * t.int(1, 6);
          const V = l * w * h;
          const value = V / 1728;
          if (!isClean(value, 2) || l <= w || value > 60) return null;
          job = t.pick(INCH_BOXES);
          dims = [l, w, h];
          unitWord = "inches";
          short = "in.";
          key = tidy(value);
          fact = "There are 12 inches in 1 foot.";
          ask = `What is the volume of the ${job.thing}, in cubic feet?`;
          wrong = [
            [V / 12, "Divides the volume in cubic inches by 12, but a cubic foot is 12 × 12 × 12 = 1,728 cubic inches."],
            [V / 144, "Converts only two of the three dimensions to feet, dividing by 144 instead of 1,728."],
            [V, "Gives the volume in cubic inches; the question asks for cubic feet."],
          ];
          explanation = `The volume is ${l} × ${w} × ${h} = ${fmt(V)} cubic inches. A cubic foot is 12 × 12 × 12 = 1,728 cubic inches, so the volume is ${fmt(V)} ÷ 1,728 = ${num(key)} cubic feet.`;
          steps = [`Volume: ${l} × ${w} × ${h} = ${fmt(V)} cubic inches.`, "1 cubic foot = 12 × 12 × 12 = 1,728 cubic inches.", `${fmt(V)} ÷ 1,728 = ${num(key)} cubic feet.`];
          trap = `Dividing by 12 converts a length, not a volume: ${fmt(V)} ÷ 12 = ${fmt(V / 12)}.`;
          check = () => close((l / 12) * (w / 12) * (h / 12), key);
        } else if (form === "meters") {
          const l = 10 * t.int(3, 15);
          const w = 10 * t.int(2, 8);
          const h = 5 * t.int(4, 16);
          const V = l * w * h;
          if (V % 1000 || l <= w || l === h) return null;
          job = t.pick(TANKS);
          dims = [l, w, h];
          unitWord = "centimeters";
          short = "cm";
          tallWord = job.tall;
          key = tidy(V / 1e6);
          fact = "There are 100 centimeters in 1 meter.";
          ask = `What is the volume of the ${job.thing}, in cubic meters?`;
          wrong = [
            [V / 100, "Divides the volume in cubic centimeters by 100, but a cubic meter is 100 × 100 × 100 cubic centimeters."],
            [V / 10000, "Converts only two of the three dimensions to meters, dividing by 10,000 instead of 1,000,000."],
            [V, "Gives the volume in cubic centimeters; the question asks for cubic meters."],
          ];
          explanation = `In meters the dimensions are ${num(l / 100)}, ${num(w / 100)}, and ${num(h / 100)}, so the volume is ${num(l / 100)} × ${num(w / 100)} × ${num(h / 100)} = ${num(key)} cubic meters. (Equivalently, ${fmt(V)} cubic centimeters ÷ 1,000,000.)`;
          steps = [
            `Convert each dimension: ${l} cm = ${num(l / 100)} m, ${w} cm = ${num(w / 100)} m, ${h} cm = ${num(h / 100)} m.`,
            `Volume: ${num(l / 100)} × ${num(w / 100)} × ${num(h / 100)} = ${num(key)} cubic meters.`,
          ];
          trap = `A cubic meter is 1,000,000 cubic centimeters, not 100; dividing ${fmt(V)} by 100 gives ${fmt(V / 100)}.`;
          check = () => close((l / 100) * (w / 100) * (h / 100), key);
        } else {
          // mixed (length in meters) or time (all centimeters, then a fill rate)
          const mixed = form === "mixed";
          const lengthM = mixed ? t.pick([1.2, 1.5, 2, 2.5, 3]) : null;
          const l = mixed ? Math.round(lengthM * 100) : 5 * t.int(6, 20);
          const w = 5 * t.int(4, 12);
          const h = 5 * t.int(4, 12);
          const V = l * w * h;
          if (V % 1000 || (!mixed && l <= w) || w === h) return null;
          const liters = V / 1000;
          job = t.pick(TANKS);
          tallWord = job.tall;
          dims = [mixed ? lengthM : l, w, h];
          unitWord = "centimeters";
          short = "cm";
          fact = "There are 1,000 cubic centimeters in 1 liter.";
          if (mixed) {
            key = liters;
            ask = `What is the volume of the ${job.thing}, in liters?`;
            wrong = [
              [(lengthM * w * h) / 1000, `Multiplies the length in meters, ${num(lengthM)}, by the width and height in centimeters without converting it to ${l} centimeters.`],
              [V / 100, "Divides the volume in cubic centimeters by 100 instead of by 1,000."],
              [V, "Gives the volume in cubic centimeters; the question asks for liters."],
              [lengthM * w * h, "Mixes meters with centimeters and never converts to liters."],
            ];
            explanation = `The length is ${num(lengthM)} meters = ${l} centimeters, so the volume is ${l} × ${w} × ${h} = ${fmt(V)} cubic centimeters, which is ${fmt(V)} ÷ 1,000 = ${num(key)} liters.`;
            steps = [`Convert the length: ${num(lengthM)} m = ${l} cm.`, `Volume: ${l} × ${w} × ${h} = ${fmt(V)} cubic centimeters.`, `${fmt(V)} ÷ 1,000 = ${num(key)} liters.`];
            trap = `The length is in meters and the other dimensions are in centimeters; multiplying ${num(lengthM)} × ${w} × ${h} mixes units and gives ${num((lengthM * w * h) / 1000)} liters.`;
            check = () => close(lengthM * 10 * (w / 10) * (h / 10), key);
          } else {
            const rate = t.pick([2, 4, 5, 8, 10, 12, 15, 20, 25]);
            const minutes = liters / rate;
            if (!isClean(minutes, 1) || minutes < 2 || minutes === liters) return null;
            key = tidy(minutes);
            ask = `Water flows into the empty ${job.thing} at a constant rate of ${rate} liters per minute. How many minutes will it take to fill the ${job.thing}?`;
            wrong = [
              [liters, `Finds the volume, ${num(liters)} liters, and stops; the question asks for the time.`],
              [V / 100 / rate, "Divides the volume in cubic centimeters by 100 instead of by 1,000 before using the rate."],
              [liters * rate, "Multiplies the volume by the rate instead of dividing by it."],
              [V / rate, "Divides the volume in cubic centimeters by the rate without converting to liters."],
            ];
            explanation = `The volume is ${l} × ${w} × ${h} = ${fmt(V)} cubic centimeters, or ${fmt(V)} ÷ 1,000 = ${num(liters)} liters. At ${rate} liters per minute, filling it takes ${num(liters)} ÷ ${rate} = ${num(key)} minutes.`;
            steps = [`Volume: ${l} × ${w} × ${h} = ${fmt(V)} cubic centimeters.`, `In liters: ${fmt(V)} ÷ 1,000 = ${num(liters)}.`, `Time: ${num(liters)} ÷ ${rate} = ${num(key)} minutes.`];
            trap = `${num(liters)} liters is the volume, a step on the way; the question asks how long filling takes.`;
            check = () => close(((l / 10) * (w / 10) * (h / 10)) / rate, key);
          }
        }
        if (numeric && !C.fitsGrid(key)) return null;
        const [l, w, h] = dims;
        const lengthUnit = form === "mixed" ? "meters" : unitWord;
        const art = /^[aeiou]/.test(job.thing) ? "An" : "A";
        const described =
          `${l} ${lengthUnit} long, ${w} ${unitWord} wide, and ${h} ${unitWord} ${tallWord}`;
        const lead = withFigure
          ? `The ${job.thing} shown is in the shape of a rectangular prism.`
          : `${art} ${job.thing} in the shape of a rectangular prism is ${described}.`;
        const texts = [`${num(l)} ${form === "mixed" ? "m" : short}`, `${num(w)} ${short}`, `${num(h)} ${short}`];
        const alt =
          `A rectangular prism drawn in perspective with hidden edges dashed, with length ${texts[0]}, width ${texts[1]}, and height ${texts[2]} labeled. The figure is drawn to scale.`;
        const figure = withFigure ? prismFigure(form === "mixed" ? l * 100 : l, w, h, texts, alt) : null;
        const printed = wrong.map(([value, reason]) => [value > 0 && isClean(value, 3) ? fmt(value) : null, reason]);
        if (collides(fmt(key), printed)) return null;
        const list = spreadWrong(t, fmt(key), printed);
        if (!list && !numeric) return null;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 100,
          stimulus: null,
          figure,
          stem: `${lead} ${fact} ${ask}`,
          correct: numeric ? key : fmt(key),
          wrong: list || [],
          explanation,
          steps,
          principles,
          trap,
          hint: "How many of the smaller cubic units fit in one of the larger ones?",
          verify: check,
        };
      });
    },
  };

  /* ==================================== displacement-and-transfer (Medium) */

  const BALL_SETS = [
    [4, 1, 3], [4, 1, 6], [4, 3, 1], [5, 1, 6], [5, 2, 3], [5, 3, 1], [6, 3, 1], [6, 3, 2], [8, 2, 3], [8, 2, 6],
    [8, 3, 4], [8, 6, 1], [10, 2, 3], [10, 2, 6], [10, 3, 1], [10, 3, 2], [10, 3, 3], [10, 3, 4], [10, 3, 6],
    [10, 4, 3], [10, 6, 1], [12, 3, 1], [12, 3, 2], [12, 3, 3], [12, 3, 4], [12, 3, 6], [12, 6, 1], [12, 6, 2], [12, 9, 1],
  ];

  const COUNT_WORDS = { 2: "Two", 3: "Three", 4: "Four", 6: "Six" };

  // Volume of a solid of revolution with cross-section radius rho(z) on
  // [0, height], by summing thin disks: a check that does not use the
  // closed-form volume formulas.
  function slicedVolume(rho, height, slices = 4000) {
    const dz = height / slices;
    let total = 0;
    for (let index = 0; index < slices; index += 1) {
      const radius = rho((index + 0.5) * dz);
      total += Math.PI * radius * radius * dz;
    }
    return total;
  }

  const displacement = {
    id: "displacement-and-transfer",
    domain: GEO,
    skill: "Area and volume",
    subskill: "volume",
    difficulty: "Medium",
    title: "Volume conserved: displacement and pouring",
    recognize:
      "The water's volume does not change when it is poured, and a submerged solid raises the water by its own volume: " +
      "set (base area of the container) × (change in depth) equal to that volume. The depth changes by the ratio of base areas, " +
      "not of radii, and the rise is not the size of the object.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["intermediate-value", "neighbouring-rule", "wrong-quantity"],
    build(t) {
      const form = t.pick(["cube", "cube", "balls", "balls", "pour", "pour", "cone"]);
      const numeric = t.chance(0.35);
      const u = t.pick(["centimeters", "inches"]);
      const principles = [
        "A solid that is completely under water raises the water by its own volume: base area of the container × rise = volume of the solid.",
        "Poured liquid keeps its volume, so its depth in a new container is its volume divided by the new base area.",
        "Cylinder: V = πr²h. Cone: V = (1/3)πr²h. Sphere: V = (4/3)πr³. Rectangular prism: V = lwh.",
      ];
      const finish = (key, list, fields) => {
        if (numeric && !C.fitsGrid(key)) return null;
        const printed = list.map(([value, reason]) => [value !== null && value > 0 ? tidy(value) : null, reason]);
        if (collides(key, printed)) return null;
        const wrong = spreadWrong(t, key, printed, { whole: true });
        if (!numeric && !wrong) return null;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 120,
          stimulus: null,
          figure: null,
          correct: key,
          wrong: wrong || [],
          principles,
          ...fields,
        };
      };
      return retry(() => {
        if (form === "cube") {
          const L = t.int(10, 40);
          const W = t.int(8, L);
          const e = t.int(3, 12);
          if (e > Math.min(L, W) / 2) return null;
          const rise = e ** 3 / (L * W);
          if (!isClean(rise, 2) || rise < 0.2 || rise === e) return null;
          const d0 = t.int(e + 1, e + 12);
          const askDepth = t.chance(0.4);
          const key = tidy(askDepth ? d0 + rise : rise);
          const surfaceRise = (6 * e * e) / (L * W);
          return finish(key, askDepth
            ? [
              [d0 + e, `Adds the cube's edge length, ${e}, to the depth, as if the water rose by the height of the cube.`],
              [rise, `Finds the rise, ${num(tidy(rise))}, and stops; the question asks for the new depth.`],
              [d0 + surfaceRise, "Divides the cube's surface area, not its volume, by the base area of the tank."],
              [d0 + e ** 3 / (L * W * d0), "Divides the cube's volume by the volume of the water instead of by the base area."],
              [d0 + (e * e) / (L * W), "Divides the area of one face of the cube, not its volume, by the base area of the tank."],
            ]
            : [
              [e, `Assumes the water level rises by the cube's edge length, ${e}.`],
              [d0 + rise, "Gives the new depth of the water instead of the change in depth."],
              [surfaceRise, "Divides the cube's surface area, not its volume, by the base area of the tank."],
              [e ** 3 / (L * W * d0), "Divides the cube's volume by the volume of the water instead of by the base area."],
              [(e * e) / (L * W), "Divides the area of one face of the cube, not its volume, by the base area of the tank."],
            ], {
            stem:
              `A tank in the shape of a rectangular prism has a base that is ${L} ${u} long and ${W} ${u} wide, and it contains water to a depth of ${d0} ${u}. ` +
              `A solid cube with edges ${e} ${u} long is placed in the tank and sinks to the bottom, where it is completely covered by the water. ` +
              (askDepth ? `What is the new depth, in ${u}, of the water in the tank?` : `By how many ${u} does the water level in the tank rise?`),
            explanation:
              `The cube pushes aside its own volume of water, ${e}³ = ${fmt(e ** 3)} cubic ${u}. Spread over the base, ${L} × ${W} = ${fmt(L * W)} square ${u}, ` +
              `that raises the water by ${fmt(e ** 3)} ÷ ${fmt(L * W)} = ${num(tidy(rise))} ${unitAfter(tidy(rise), u)}` +
              (askDepth ? `, so the new depth is ${d0} + ${num(tidy(rise))} = ${num(key)} ${u}.` : "."),
            steps: [
              `Volume of the cube: ${e}³ = ${fmt(e ** 3)}.`,
              `Base area of the tank: ${L} × ${W} = ${fmt(L * W)}.`,
              `Rise: ${fmt(e ** 3)} ÷ ${fmt(L * W)} = ${num(tidy(rise))}.`,
              ...(askDepth ? [`New depth: ${d0} + ${num(tidy(rise))} = ${num(key)}.`] : []),
            ],
            trap: `The water spreads over the whole ${L}-by-${W} base, so it rises far less than the ${e}-${u === "inches" ? "inch" : "centimeter"} height of the cube.`,
            hint: "Where does the water that the cube pushes aside go?",
            verify: () => {
              // Final level h solves L·W·h − (submerged part of the cube) = water volume.
              const water = L * W * d0;
              let low = d0;
              let high = d0 + e + 1;
              for (let step = 0; step < 200; step += 1) {
                const level = (low + high) / 2;
                if (L * W * level - Math.min(level, e) * e * e < water) low = level;
                else high = level;
              }
              return low >= e && close(askDepth ? low : low - d0, key, 1e-9);
            },
          });
        }

        if (form === "balls") {
          const [r, R, n] = t.pick(BALL_SETS);
          const rise = (n * 4 * R ** 3) / (3 * r * r);
          const tankDiameter = t.chance(0.4);
          const ballDiameter = !tankDiameter && t.chance(0.35);
          const askDepth = t.chance(0.35);
          const d0 = t.int(2 * R + 1, 2 * R + 10);
          const key = tidy(askDepth ? d0 + rise : rise);
          const base = askDepth ? d0 : 0;
          const tankText = tankDiameter ? `a diameter of ${2 * r} ${u}` : `a radius of ${r} ${u}`;
          const ballSize = ballDiameter ? `a diameter of ${2 * R} ${u}` : `a radius of ${R} ${unitAfter(R, u)}`;
          const balls = n === 1
            ? `A solid ball with ${ballSize} is placed in the tank and is`
            : `${COUNT_WORDS[n]} identical solid balls, each with ${ballSize}, are placed in the tank and are`;
          const list = [
            [n === 1 ? base + 2 * R : null, "Assumes the water rises by the diameter of the ball."],
            [tankDiameter ? base + rise / 4 : null, `Uses the tank's diameter, ${2 * r}, as its radius.`],
            [ballDiameter ? base + 8 * rise : null, `Uses the ball's diameter, ${2 * R}, as its radius.`],
            [n > 1 ? base + rise / n : null, "Accounts for the volume of only one ball."],
            [base + (3 * rise) / 4, "Leaves out the factor 4/3 in the volume of a sphere."],
            [askDepth ? rise : null, "Finds the rise and stops; the question asks for the new depth."],
            [base + (n * 4 * R ** 3) / (3 * r), "Divides the volume of the balls by πr instead of πr², leaving the radius unsquared."],
          ];
          const ballVolume = `(4/3)π(${R})³ = ${piFraction(4 * R ** 3, 3)}`;
          return finish(key, list, {
            stem:
              `A tank in the shape of a right circular cylinder has ${tankText} and contains water${askDepth ? ` to a depth of ${d0} ${u}` : ""}. ` +
              `${balls} completely covered by the water. ` +
              (askDepth ? `What is the new depth, in ${u}, of the water in the tank?` : `By how many ${u} does the water level in the tank rise?`),
            explanation:
              `${n === 1 ? "The ball has" : "Each ball has"} volume ${ballVolume}, so the water rises by the volume of ${n === 1 ? "the ball" : `${n} balls`} divided by the tank's base area, ` +
              `π(${r})² = ${piFraction(r * r, 1)}: ${n === 1 ? "" : `${n} × `}(4/3)(${R})³ ÷ ${r * r} = ${num(tidy(rise))} ${unitAfter(tidy(rise), u)}` +
              (askDepth ? `. The new depth is ${d0} + ${num(tidy(rise))} = ${num(key)} ${u}.` : "."),
            steps: [
              `${tankDiameter ? `Tank radius: ${2 * r} ÷ 2 = ${r}.` : `Tank radius: ${r}.`} ${ballDiameter ? `Ball radius: ${2 * R} ÷ 2 = ${R}.` : ""}`.trim(),
              `Volume of the ${n === 1 ? "ball" : "balls"}: ${n === 1 ? "" : `${n} × `}(4/3)π(${R})³ = ${piFraction(n * 4 * R ** 3, 3)}.`,
              `Rise: ${piFraction(n * 4 * R ** 3, 3)} ÷ ${piFraction(r * r, 1)} = ${num(tidy(rise))}.`,
              ...(askDepth ? [`New depth: ${d0} + ${num(tidy(rise))} = ${num(key)}.`] : []),
            ],
            trap: `The rise is the volume of the ${n === 1 ? "ball" : "balls"} spread over the base of the tank, not the size of a ball; the π in both volumes cancels.`,
            hint: "What volume of water must move up when the tank's contents grow by the volume of the balls?",
            verify: () => {
              const ball = slicedVolume((z) => Math.sqrt(Math.max(0, R * R - (z - R) ** 2)), 2 * R);
              const tankArea = slicedVolume(() => r, 1);
              const measured = (n * ball) / tankArea;
              return close(measured + base, key, 1e-6) && d0 + measured >= 2 * R;
            },
          });
        }

        if (form === "pour") {
          const r1 = t.int(2, 12);
          const r2 = t.int(2, 12);
          const h1 = t.int(3, 20);
          if (r1 === r2) return null;
          const h2 = (h1 * r1 * r1) / (r2 * r2);
          if (!isClean(h2, 2) || h2 < 1 || h2 > 60) return null;
          const givenDiameter = t.chance(0.35);
          const aText = givenDiameter ? `a diameter of ${2 * r1} ${u}` : `a radius of ${r1} ${u}`;
          const key = tidy(h2);
          return finish(key, [
            [(h1 * r1) / r2, "Scales the depth by the ratio of the radii instead of the ratio of their squares."],
            [(h1 * r2 * r2) / (r1 * r1), "Uses the ratio of the base areas upside down."],
            [givenDiameter ? (h1 * 4 * r1 * r1) / (r2 * r2) : null, `Uses the diameter of Cylinder A, ${2 * r1}, as its radius.`],
            [h1, "Assumes the water keeps the same depth in the new container."],
            [(h1 * r1 * r1) / r2, "Divides by r instead of r² for Cylinder B."],
          ], {
            stem:
              `Cylinder A, a right circular cylinder with ${aText}, contains water to a depth of ${h1} ${u}. All of this water is poured into Cylinder B, ` +
              `an empty right circular cylinder with a radius of ${r2} ${u}. What is the depth, in ${u}, of the water in Cylinder B?`,
            explanation:
              `The water's volume is π(${r1})²(${h1}) = ${piFraction(r1 * r1 * h1, 1)} cubic ${u}. In Cylinder B, π(${r2})²h = ${piFraction(r1 * r1 * h1, 1)}, ` +
              `so h = ${fmt(r1 * r1 * h1)} ÷ ${r2 * r2} = ${num(key)} ${unitAfter(key, u)}.`,
            steps: [
              `${givenDiameter ? `Radius of A: ${2 * r1} ÷ 2 = ${r1}. ` : ""}Volume of water: π(${r1})²(${h1}) = ${piFraction(r1 * r1 * h1, 1)}.`,
              `Base area of B: π(${r2})² = ${piFraction(r2 * r2, 1)}.`,
              `Depth in B: ${fmt(r1 * r1 * h1)} ÷ ${r2 * r2} = ${num(key)}.`,
            ],
            trap: `The depth changes by the ratio of the base areas, (${r1}/${r2})², not by the ratio of the radii.`,
            hint: "What stays the same when the water is poured?",
            verify: () => {
              const water = slicedVolume(() => r1, h1);
              return close(water / slicedVolume(() => r2, 1), key, 1e-6);
            },
          });
        }

        // cone emptied into a cylinder
        const rc = t.int(2, 12);
        const hc = t.int(rc, 30);
        const rC = t.int(2, 12);
        const depth = (rc * rc * hc) / (3 * rC * rC);
        if (!isClean(depth, 2) || depth < 1 || depth > 40 || depth === hc / 3) return null;
        const key = tidy(depth);
        return finish(key, [
          [(rc * rc * hc) / (rC * rC), "Uses the cylinder formula for the cone, leaving out the factor 1/3."],
          [(rc * hc) / (3 * rC), "Scales by the ratio of the radii instead of the ratio of their squares."],
          [hc / 3, "Takes one third of the cone's height without accounting for the different radii."],
          [hc, "Assumes the water keeps the cone's height."],
        ], {
          stem:
            `A container in the shape of a right circular cone, with its vertex pointing down, has a base radius of ${rc} ${u} and a height of ${hc} ${u}. ` +
            `The container is filled with water, and all of the water is then poured into an empty right circular cylinder with a radius of ${rC} ${u}. ` +
            `What is the depth, in ${u}, of the water in the cylinder?`,
          explanation:
            `The cone holds (1/3)π(${rc})²(${hc}) = ${piFraction(rc * rc * hc, 3)} cubic ${u}. In the cylinder, π(${rC})²h equals that volume, ` +
            `so h = ${fmt(rc * rc * hc / 3)} ÷ ${rC * rC} = ${num(key)} ${unitAfter(key, u)}.`,
          steps: [
            `Volume of the cone: (1/3)π(${rc})²(${hc}) = ${piFraction(rc * rc * hc, 3)}.`,
            `Base area of the cylinder: π(${rC})² = ${piFraction(rC * rC, 1)}.`,
            `Depth: ${piFraction(rc * rc * hc, 3)} ÷ ${piFraction(rC * rC, 1)} = ${num(key)}.`,
          ],
          trap: "A cone holds one third of the cylinder with the same base and height; leaving out the 1/3 triples the depth.",
          hint: "How much water does the cone hold?",
          verify: () => {
            const cone = slicedVolume((z) => (rc * z) / hc, hc);
            return close(cone / slicedVolume(() => rC, 1), key, 1e-6);
          },
        });
      });
    },
  };

  /* ====================================== inscribed-polygon-circle (Hard) */

  // "36π", "π", or "12.5π" for a multiple of π.
  const piMultiple = (coefficient) => (coefficient === 1 ? "π" : `${fmt(round4(coefficient))}π`);

  // Vertices of a regular n-gon inscribed in a circle of radius r (model units).
  const regularPolygon = (n, r, turn = 90) =>
    Array.from({ length: n }, (_, index) => {
      const angle = toRad(turn + (360 * index) / n);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    });

  const perimeterOf = (points) => points.reduce((total, point, index) => total + dist(point, points[(index + 1) % points.length]), 0);

  // Circle and polygon drawn to scale in a 400 × 280 box; `outside` puts the
  // polygon around the circle instead of inside it.
  function inscribedFigure(n, outside, alt) {
    const R = 110;
    const O = [200, 140];
    const circleR = outside ? R * Math.cos(Math.PI / n) : R;
    const turn = n === 4 ? 45 : n === 3 ? 90 : 0;
    const points = regularPolygon(n, R, turn).map(([x, y]) => [O[0] + x, O[1] - y]);
    const parts = [P.circle(O[0], O[1], circleR), P.polygon(points), P.dot(O[0], O[1]), name(add(O, [0, 14]), "O")];
    return { svg: S.svg(400, 280, parts, alt), alt, notToScale: false };
  }

  const INSCRIBED_UNITS = ["centimeters", "inches", "meters", "feet"];

  const inscribedPolygon = {
    id: "inscribed-polygon-circle",
    domain: GEO,
    skill: "Area and volume",
    subskill: "area",
    difficulty: "Medium",
    title: "A polygon and a circle, one inside the other",
    recognize:
      "Find the one length the two figures share before computing anything: a square inside a circle has the circle's " +
      "diameter as its diagonal, a circle inside a square has the square's side as its diameter, a regular hexagon's side " +
      "equals the radius of the circle around it, and an equilateral triangle's side is √3 times that radius.",
    // Medium (relabelled from Hard, 2026-09-26 review): one shared length
    // (a diagonal, a side, a radius) carries the answer across in two or
    // three steps.
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "wrong-quantity", "intermediate-value"],
    build(t) {
      const form = t.pick(["squareArea", "squareCircle", "squarePerimeter", "circleInSquare", "circlePerimeter", "hexPerimeter", "hexCircle", "triangleCircle"]);
      const wantNumeric = t.chance(0.35);
      const u = t.pick(INSCRIBED_UNITS);
      return retry(() => {
        let n;
        let outside = false;
        let stem;
        let key;
        let keyValue;
        let list;
        let explanation;
        let steps;
        let trap;
        let check;
        let describe;
        if (form === "squareArea") {
          // Circle area r²π given; square inside: area 2r².
          const r2 = t.int(2, 40);
          n = 4;
          key = 2 * r2;
          keyValue = key;
          stem = `A square is inscribed in a circle, as shown. The area of the circle is ${piMultiple(r2)} square ${u}. What is the area, in square ${u}, of the square?`;
          list = [
            [4 * r2, "Takes the side of the square to be a diameter of the circle; that is the square drawn around the circle."],
            [r2, "Takes the side of the square to be a radius of the circle."],
            [r2 / 2, "Takes half of the diagonal of the square as its side."],
            [piMultiple(r2), "Gives the area of the circle instead of the square."],
            [surd(Math.sqrt(2 * r2)), "Gives the side length of the square instead of its area."],
          ];
          explanation =
            `The circle's area is πr² = ${piMultiple(r2)}, so r² = ${r2}. The square's diagonal is a diameter, 2r, so its area is (diagonal)²/2 = (2r)²/2 = 2r² = ${key}.`;
          steps = [`πr² = ${piMultiple(r2)}, so r² = ${r2}.`, "The square's diagonal is a diameter of the circle: 2r.", `Area = (2r)² ÷ 2 = 2r² = ${key}.`];
          trap = "The square's side is not the diameter; its diagonal is.";
          check = () => close(C.shoelace(regularPolygon(4, Math.sqrt(r2))), key);
          describe = "A square with all four vertices on a circle with center O.";
        } else if (form === "squareCircle") {
          // Square side s given; circle around it: area (s²/2)π.
          const s = 2 * t.int(1, 12);
          n = 4;
          keyValue = (s * s) / 2 * Math.PI;
          key = piMultiple((s * s) / 2);
          stem = `A square with side length ${s} ${u} is inscribed in a circle, as shown. What is the area, in square ${u}, of the circle?`;
          list = [
            [piMultiple((s * s) / 4), `Takes the radius to be half the side, ${s / 2}; that circle fits inside the square.`],
            [piMultiple(s * s), `Takes the radius to be the side of the square, ${s}.`],
            [piMultiple(2 * s * s), "Takes the radius to be the whole diagonal of the square instead of half of it."],
            [fmt(s * s), "Gives the area of the square."],
            [fmt((s * s) / 2), "Finds r² but leaves out π."],
          ];
          explanation =
            `The diagonal of the square is a diameter: ${s}√2. So r = ${s / 2}√2, r² = ${(s * s) / 2}, and the area is ${key}.`;
          steps = [`Diagonal = ${s}√2, a diameter of the circle.`, `r = ${s / 2}√2, so r² = ${(s * s) / 2}.`, `Area = πr² = ${key}.`];
          trap = "The circle passes through the square's corners, so its radius is half the diagonal, not half the side.";
          check = () => {
            // Scale a square inscribed in a unit circle until its side is s.
            const unitSquare = regularPolygon(4, 1);
            const radius = s / dist(unitSquare[0], unitSquare[1]);
            return close(Math.PI * radius * radius, keyValue);
          };
          describe = "A square with all four vertices on a circle with center O.";
        } else if (form === "squarePerimeter") {
          // Square area 2r² given; circle around it: circumference 2πr.
          const r = t.int(2, 15);
          n = 4;
          keyValue = 2 * Math.PI * r;
          key = piMultiple(2 * r);
          stem = `A square is inscribed in a circle, as shown. The area of the square is ${2 * r * r} square ${u}. What is the circumference, in ${u}, of the circle?`;
          list = [
            [`${fmt(r)}√2π`, `Takes the side of the square, ${r}√2, to be a diameter of the circle.`],
            [`${fmt(2 * r)}√2π`, `Takes the side of the square, ${r}√2, to be the radius of the circle.`],
            [piMultiple(4 * r), "Takes the diagonal of the square to be the radius instead of the diameter."],
            [piMultiple(r * r), "Gives the area of the circle instead of its circumference."],
            [piMultiple(r), "Uses the radius in place of the diameter in πd."],
          ];
          explanation = `The square's side is √${2 * r * r} = ${r}√2, so its diagonal is ${r}√2 × √2 = ${2 * r}. The diagonal is a diameter, so the circumference is π × ${2 * r} = ${key}.`;
          steps = [`Side of the square: √${2 * r * r} = ${r}√2.`, `Diagonal = side × √2 = ${2 * r}, a diameter of the circle.`, `Circumference = π × ${2 * r} = ${key}.`];
          trap = "The square's diagonal, not its side, is a diameter.";
          check = () => close(C.shoelace(regularPolygon(4, r)), 2 * r * r) && close(2 * Math.PI * r, keyValue);
          describe = "A square with all four vertices on a circle with center O.";
        } else if (form === "circleInSquare") {
          // Square area s² given; circle inside: area (s²/4)π.
          const s = 2 * t.int(1, 12);
          n = 4;
          outside = true;
          keyValue = (s * s) / 4 * Math.PI;
          key = piMultiple((s * s) / 4);
          stem = `A circle is inscribed in a square, as shown. The area of the square is ${s * s} square ${u}. What is the area, in square ${u}, of the circle?`;
          list = [
            [piMultiple(s * s), `Takes the radius to be the side of the square, ${s}.`],
            [piMultiple((s * s) / 2), "Takes the radius to be half the diagonal of the square; that circle passes through the corners."],
            [piMultiple(s / 2), "Multiplies π by the radius without squaring it."],
            [piMultiple(s), "Multiplies π by the side of the square."],
            [fmt((s * s) / 4), "Finds r² but leaves out π."],
          ];
          explanation = `The square's side is √${s * s} = ${s}, and the circle's diameter equals the side, so r = ${s / 2} and the area is π(${s / 2})² = ${key}.`;
          steps = [`Side of the square: √${s * s} = ${s}.`, `The diameter of the circle is the side: r = ${s / 2}.`, `Area = π(${s / 2})² = ${key}.`];
          trap = "The circle touches the sides of the square, so its diameter is the side, not the diagonal.";
          check = () => close(Math.PI * (s / 2) ** 2, keyValue) && close(C.shoelace(regularPolygon(4, s / Math.SQRT2)), s * s);
          describe = "A circle with center O inside a square, touching all four sides.";
        } else if (form === "circlePerimeter") {
          // Circle circumference given; square around it: perimeter 8r.
          const r = t.int(2, 15);
          n = 4;
          outside = true;
          key = 8 * r;
          keyValue = key;
          stem = `A circle is inscribed in a square, as shown. The circumference of the circle is ${piMultiple(2 * r)} ${u}. What is the perimeter, in ${u}, of the square?`;
          list = [
            [4 * r, "Takes the side of the square to be the radius of the circle."],
            [`${fmt(4 * r)}√2`, "Takes the side of the square to be a chord from the center, r√2, as for a square inside the circle."],
            [piMultiple(2 * r), "Assumes the perimeter of the square equals the circumference of the circle."],
            [16 * r, "Takes the side of the square to be twice the diameter."],
            [2 * r, "Gives the side of the square instead of its perimeter."],
          ];
          explanation = `2πr = ${piMultiple(2 * r)}, so r = ${r}. The side of the square equals the diameter, ${2 * r}, so the perimeter is 4 × ${2 * r} = ${key}.`;
          steps = [`r = ${r}.`, `Side of the square = diameter = ${2 * r}.`, `Perimeter = 4 × ${2 * r} = ${key}.`];
          trap = "The circle touches each side at its midpoint, so the side of the square is a diameter.";
          check = () => close(perimeterOf(regularPolygon(4, r * Math.SQRT2)), key);
          describe = "A circle with center O inside a square, touching all four sides.";
        } else if (form === "hexPerimeter") {
          // Circle circumference given; hexagon inside: perimeter 6r.
          const r = t.int(2, 15);
          n = 6;
          key = 6 * r;
          keyValue = key;
          stem = `A regular hexagon is inscribed in a circle, as shown. The circumference of the circle is ${piMultiple(2 * r)} ${u}. What is the perimeter, in ${u}, of the hexagon?`;
          list = [
            [12 * r, "Takes each side of the hexagon to be a diameter of the circle."],
            [piMultiple(2 * r), "Assumes the perimeter of the hexagon equals the circumference of the circle."],
            [`${fmt(3 * r)}√3`, "Uses the distance from the center to a side, (√3/2)r, as the side length."],
            [3 * r, "Counts only three sides of the hexagon."],
            [`${fmt(6 * r)}√3`, "Takes each side to be r√3, the side of an equilateral triangle inscribed in the circle."],
          ];
          explanation = `2πr = ${piMultiple(2 * r)}, so r = ${r}. The radii to the six vertices cut the hexagon into six equilateral triangles, so each side equals r = ${r} and the perimeter is 6 × ${r} = ${key}.`;
          steps = [`r = ${r}.`, "Six radii split the hexagon into six equilateral triangles, so each side is r.", `Perimeter = 6 × ${r} = ${key}.`];
          trap = "Each side of a regular hexagon in a circle equals the radius, not the diameter.";
          check = () => close(perimeterOf(regularPolygon(6, r)), key);
          describe = "A regular hexagon with all six vertices on a circle with center O.";
        } else if (form === "hexCircle") {
          // Hexagon perimeter given; circle around it: area s²π.
          const s = t.int(2, 12);
          n = 6;
          keyValue = s * s * Math.PI;
          key = piMultiple(s * s);
          stem = `A regular hexagon is inscribed in a circle, as shown. The perimeter of the hexagon is ${6 * s} ${u}. What is the area, in square ${u}, of the circle?`;
          list = [
            [(3 * s * s) % 4 === 0 ? piMultiple((3 * s * s) / 4) : null, "Takes the radius to be the distance from the center to a side of the hexagon; that circle fits inside the hexagon."],
            [piMultiple(4 * s * s), `Uses the distance across the hexagon, 2 × ${s}, as the radius instead of the diameter.`],
            [s % 2 === 0 ? piMultiple((s * s) / 4) : null, "Takes the radius to be half of a side."],
            [piMultiple(36 * s * s), "Uses the whole perimeter as the radius."],
            [piMultiple(3 * s * s), "Takes the radius to be the side times √3, as for an equilateral triangle."],
          ];
          explanation = `Each side of the hexagon is ${6 * s} ÷ 6 = ${s}. A regular hexagon's side equals the radius of the circle through its vertices, so r = ${s} and the area is π(${s})² = ${key}.`;
          steps = [`Side = ${6 * s} ÷ 6 = ${s}.`, "The six radii to the vertices make six equilateral triangles, so r = side.", `Area = π(${s})² = ${key}.`];
          trap = "The circle passes through the vertices, so the radius is the side length, not the distance to a side.";
          check = () => close(perimeterOf(regularPolygon(6, s)), 6 * s) && close(Math.PI * s * s, keyValue);
          describe = "A regular hexagon with all six vertices on a circle with center O.";
        } else {
          // Equilateral triangle side s given; circle around it: area (s²/3)π.
          const s = 3 * t.int(1, 8);
          n = 3;
          keyValue = (s * s) / 3 * Math.PI;
          key = piMultiple((s * s) / 3);
          stem = `An equilateral triangle with side length ${s} ${u} is inscribed in a circle, as shown. What is the area, in square ${u}, of the circle?`;
          list = [
            [piMultiple(s * s), `Takes the radius to be the side of the triangle, ${s}.`],
            [(s * s) % 4 === 0 ? piMultiple((s * s) / 4) : piMultiple(round4((s * s) / 4)), "Takes the radius to be half of a side."],
            [(s * s) % 12 === 0 ? piMultiple((s * s) / 12) : null, "Takes the radius to be the distance from the center to a side; that circle fits inside the triangle."],
            [(3 * s * s) % 4 === 0 ? piMultiple((3 * s * s) / 4) : piMultiple(round4((3 * s * s) / 4)), "Takes the radius to be the height of the triangle."],
            [fmt((s * s) / 3), "Finds r² but leaves out π."],
          ];
          explanation =
            `The center of the circle is the center of the triangle, which lies 2/3 of the way down each height. The height is (√3/2)(${s}), so ` +
            `r = (2/3)(√3/2)(${s}) = ${s}/√3, r² = ${(s * s) / 3}, and the area is ${key}.`;
          steps = [`Height of the triangle: (√3/2) × ${s}.`, `r = (2/3) × height = ${s}/√3, so r² = ${(s * s) / 3}.`, `Area = πr² = ${key}.`];
          trap = "The radius is neither the side nor the height of the triangle; it is 2/3 of the height.";
          check = () => close(perimeterOf(regularPolygon(3, s / Math.sqrt(3))), 3 * s) && close(Math.PI * (s * s) / 3, keyValue);
          describe = "An equilateral triangle with all three vertices on a circle with center O.";
        }
        const numeric = wantNumeric && typeof key === "number" && C.fitsGrid(key);
        const wrong = wrongFor(t, numeric, key, list, { whole: true, positive: true });
        if (!wrong) return null;
        const alt = `${describe} The figure is drawn to scale.`;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 110,
          stimulus: null,
          figure: inscribedFigure(n, outside, alt),
          stem,
          correct: key,
          wrong,
          hint: "Which length of the polygon is also a length of the circle?",
          explanation,
          steps,
          principles: [
            "A square inscribed in a circle has a diagonal equal to the circle's diameter; a circle inscribed in a square has a diameter equal to the square's side.",
            "A regular hexagon inscribed in a circle has sides equal to the radius; an equilateral triangle inscribed in a circle has sides equal to √3 times the radius.",
          ],
          trap,
          verify: () => check() && close(C.choiceValue(key), keyValue, 1e-9),
        };
      });
    },
  };

  /* ========================================= shaded-region-area (Hard) */

  // Ring between concentric circles of radii R > r, shaded, by winding the
  // inner circle the other way (nonzero fill leaves it empty).
  function ringPath(O, R, r) {
    const [x, y] = O;
    const f = (value) => r1(value);
    return `<path d="M ${f(x - R)} ${f(y)} A ${f(R)} ${f(R)} 0 1 0 ${f(x + R)} ${f(y)} A ${f(R)} ${f(R)} 0 1 0 ${f(x - R)} ${f(y)} Z ` +
      `M ${f(x - r)} ${f(y)} A ${f(r)} ${f(r)} 0 1 1 ${f(x + r)} ${f(y)} A ${f(r)} ${f(r)} 0 1 1 ${f(x - r)} ${f(y)} Z" fill="currentColor" fill-opacity="0.16" stroke="none"/>`;
  }

  // One item of a region bounded by circles: the ring between concentric
  // circles cut by a tangent chord ("ring", "ringChord"; Hard), or congruent
  // circles packed in a square ("packArea", "packLength"; Medium).
  function circleRegionItem(t, form) {
      const numeric = t.chance(0.3);
      const u = t.pick(INSCRIBED_UNITS);
      return retry(() => {
        if (form === "ring" || form === "ringChord") {
          // Inner radius r, half-chord h, outer radius R with r² + h² = R².
          const [x, y, z] = t.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25],
            [20, 21, 29], [21, 20, 29], [9, 40, 41], [12, 35, 37], [35, 12, 37], [11, 60, 61], [28, 45, 53], [45, 28, 53]]);
          const k = z <= 5 ? t.int(1, 6) : z <= 13 ? t.int(1, 3) : z <= 29 ? t.int(1, 2) : 1;
          const [r, h, R] = [x * k, y * k, z * k];
          const L = 2 * h;
          const chordOnly = form === "ringChord";
          const key = piMultiple(h * h);
          const keyValue = Math.PI * h * h;
          const list = chordOnly
            ? [
              [piMultiple(L * L), `Uses the whole chord, ${L}, where half of it belongs.`],
              [piMultiple(L), "Multiplies π by the length of the chord."],
              [piMultiple(h), "Multiplies π by half the chord without squaring it."],
              [piMultiple(2 * h * h), "Doubles the square of half the chord."],
              [h % 2 === 0 ? piMultiple((h * h) / 4) : null, "Uses half of AT, a quarter of the chord, as the leg."],
            ]
            : [
              [piMultiple((R - r) ** 2), `Squares the difference of the radii, (${R} − ${r})², instead of subtracting their squares.`],
              [piMultiple(R * R), "Gives the area of the larger circle only."],
              [piMultiple(R * R + r * r), "Adds the areas of the two circles instead of subtracting."],
              [piMultiple(r * r), "Gives the area of the smaller circle."],
              [piMultiple(L * L), `Uses the whole chord, ${L}, as a leg of the right triangle.`],
              [piMultiple(h), "Multiplies π by half the chord without squaring it."],
            ];
          const wrong = wrongFor(t, numeric, numeric ? h * h : key, numeric ? [] : list);
          if (!wrong) return null;
          const scale = 110 / R;
          const O = [200, 138];
          const T = [O[0], O[1] - r * scale];
          const Aend = [O[0] - h * scale, T[1]];
          const Bend = [O[0] + h * scale, T[1]];
          const parts = [
            ringPath(O, R * scale, r * scale),
            P.circle(O[0], O[1], R * scale),
            P.circle(O[0], O[1], r * scale),
            C.segHard(Aend, Bend),
            seg(O, T, 1.5, true),
            C.rightMark(T, Bend, O, 9),
            P.dot(O[0], O[1]), P.dot(T[0], T[1]), P.dot(Aend[0], Aend[1]), P.dot(Bend[0], Bend[1]),
            name(add(O, [0, 14]), "O"), name(add(T, [0, -13]), "T"),
            name(add(Aend, [-12, -6]), "A"), name(add(Bend, [12, -6]), "B"),
          ];
          if (C.labelsClash(parts, 400, 280)) return null;
          const alt =
            "Two circles with the same center O. The region between them is shaded. Chord AB of the larger circle touches the smaller circle at T, " +
            "and a dashed radius OT of the smaller circle meets AB at a right angle. The figure is drawn to scale.";
          const walkway = t.chance(0.35);
          if (walkway && !["feet", "meters"].includes(u)) return null;
          const ask = walkway ? `What is the area, in square ${u}, of the walkway?` : `What is the area, in square ${u}, of the shaded region between the two circles?`;
          const stem = walkway
            ? `The figure shows a circular fountain with center O surrounded by a circular walkway, shaded, with the same center. A straight board AB, ${L} ${u} long, ` +
              `lies on the walkway with its ends A and B on the walkway's outer edge, touching the fountain's edge at exactly one point, T.` +
              `${chordOnly ? "" : ` The fountain has a radius of ${r} ${u}.`} ${ask}`
            : chordOnly
              ? `The figure shows two circles with center O. Chord AB of the larger circle is tangent to the smaller circle at point T, and AB = ${L} ${u}. ${ask}`
              : `The figure shows two circles with center O; the smaller circle has a radius of ${r} ${u}. Chord AB of the larger circle is tangent to the smaller circle at point T, and AB = ${L} ${u}. ${ask}`;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 125,
            stimulus: null,
            figure: { svg: S.svg(400, 280, parts, alt), alt, notToScale: false },
            stem: numeric
              ? stem.replace(ask, `The area of the ${walkway ? "walkway" : "shaded region"} is kπ square ${u}. What is the value of k?`)
              : stem,
            correct: numeric ? h * h : key,
            wrong,
            hint: "Draw the radius of the larger circle to A. What kind of triangle do O, T, and A form?",
            explanation:
              `OT is a radius of the smaller circle drawn to the point of tangency, so OT ⊥ AB and T is the midpoint of AB: AT = ${h}. In right triangle OTA, OA² − OT² = AT², ` +
              `that is, R² − r² = ${h}² = ${fmt(h * h)}. The shaded area is πR² − πr² = π(R² − r²) = ${key}` +
              (chordOnly ? "; the radii themselves are never needed." : `. (Here R = √(${r}² + ${h}²) = ${R}.)`),
            steps: [
              "OT ⊥ AB at T, and T is the midpoint of AB.",
              `In right triangle OTA: OA² = OT² + AT², so R² − r² = ${h}² = ${fmt(h * h)}.`,
              `Shaded area = π(R² − r²) = ${key}.`,
            ],
            principles: [
              "A radius drawn to a point of tangency is perpendicular to the tangent line, and the perpendicular from the center bisects a chord.",
              "The area between two concentric circles is π(R² − r²).",
            ],
            trap: chordOnly
              ? "Neither radius can be found, but the area needs only R² − r², which the right triangle gives."
              : `(R − r)² is not R² − r²: subtract the areas, not the radii.`,
            verify: () => {
              // Outer radius measured from the constructed endpoint A; inner from T.
              const Rm = Math.hypot(h, r);
              return close(Math.PI * (Rm * Rm - r * r), keyValue) && close(Rm, R);
            },
          };
        }
        // Congruent circles packed in a square, n to a row.
        const n = t.pick([2, 3, 4, 5]);
        const s = 2 * n * t.int(1, 8);
        const setting = t.pick([
          null,
          { lead: (count) => `A square baking pan holds ${count} round cookies of the same size in ${n} rows of ${n}, as shown from above.`, thing: "cookies" },
          { lead: (count) => `The figure shows the top of a square box packed with ${count} identical cans standing upright in ${n} rows of ${n}.`, thing: "cans" },
        ]);
        if (setting && !["centimeters", "inches"].includes(u)) return null;
        const each = s / (2 * n);
        const areaAsk = form === "packArea";
        const keyCoefficient = areaAsk ? (s * s) / 4 : n * s;
        const key = piMultiple(keyCoefficient);
        const list = areaAsk
          ? [
            [piMultiple((n * n * s * s) / 4), `Uses half the side of the square, ${s / 2}, as the radius of every circle.`],
            [piMultiple(each * each), "Gives the area of only one circle."],
            [piMultiple(s * s), "Uses the side of the square as the radius of a circle."],
            [piMultiple((s * s) / (4 * n)), `Counts only one row of ${n} circles instead of all ${n * n}.`],
            [piMultiple(each), "Multiplies π by the radius of one circle without squaring it."],
          ]
          : [
            [piMultiple(2 * n * s), `Uses ${s / n}, the diameter of each circle, as its radius.`],
            [piMultiple(s), `Counts only one row of ${n} circles.`],
            [piMultiple(s / n), "Gives the circumference of only one circle."],
            [piMultiple(n * n * s), `Uses the side of the square, ${s}, as the diameter of every circle.`],
            [piMultiple((n * s) / 2), "Uses the radius of each circle in place of its diameter in πd."],
            [piMultiple(2 * n * s), "Uses the diameter of each circle in place of its radius in 2πr."],
          ];
        const wrong = wrongFor(t, numeric, numeric ? keyCoefficient : key, numeric ? [] : list);
        if (!wrong) return null;
        const side = 220;
        const x0 = 90;
        const y0 = 30;
        const radius = side / (2 * n);
        const parts = [P.polygon([[x0, y0], [x0 + side, y0], [x0 + side, y0 + side], [x0, y0 + side]])];
        for (let row = 0; row < n; row += 1) {
          for (let col = 0; col < n; col += 1) {
            const cx = x0 + radius * (2 * col + 1);
            const cy = y0 + radius * (2 * row + 1);
            parts.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(radius)}" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2"/>`);
          }
        }
        const count = n * n;
        const alt =
          `A square containing ${count} congruent shaded circles in ${n} rows of ${n}. Each circle touches its neighbors, and the circles along the edges touch the sides of the square. The figure is drawn to scale.`;
        const things = setting ? (setting.thing === "cans" ? "circular tops of the cans" : "cookies") : "circles";
        const question = areaAsk
          ? `What is the total area, in square ${u}, of the ${count} ${things}?`
          : `What is the sum of the circumferences, in ${u}, of the ${count} ${things}?`;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 120,
          stimulus: null,
          figure: { svg: S.svg(400, 280, parts, alt), alt, notToScale: false },
          stem:
            (setting
              ? `${setting.lead(count)} The inside of the square has side length ${s} ${u}, and each ${setting.thing === "cans" ? "can" : "cookie"} touches its neighbors and the sides next to it. `
              : `The figure shows a square with side length ${s} ${u} and ${count} congruent circles arranged in ${n} rows of ${n}. Each circle is tangent to the circles next to it, ` +
                "and the outer circles are tangent to the sides of the square. ") +
            (numeric ? `${question.replace(/\?$/, "").replace(/^What is (the )?/, "The ")} is kπ. What is the value of k?` : question),
          correct: numeric ? keyCoefficient : key,
          wrong,
          hint: "How many diameters fit along one side of the square?",
          explanation:
            `${n} diameters span a side, so each diameter is ${s} ÷ ${n} = ${s / n} and each radius is ${each}. ` +
            (areaAsk
              ? `The ${count} circles have total area ${count} × π(${each})² = ${key}, which is π/4 of the square's area whatever the number of circles.`
              : `Each circumference is π × ${s / n}, so the ${count} circles total ${count} × ${piMultiple(s / n)} = ${key}.`),
          steps: [
            `Each diameter: ${s} ÷ ${n} = ${s / n}; radius ${each}.`,
            areaAsk ? `One circle: π(${each})² = ${piMultiple(each * each)}.` : `One circumference: π(${s / n}) = ${piMultiple(s / n)}.`,
            `${count} circles: ${key}.`,
          ],
          principles: [
            "Circles tangent to each other in a row, and to the sides of a square, have their diameters add up to the side.",
            "A circle's area is πr² and its circumference is 2πr = πd.",
          ],
          trap: areaAsk
            ? "Each circle's radius is the side divided by 2n, not half the side; the total area is the same for any n, but the total circumference is not."
            : "The diameter of each circle is the side divided by the number of circles in a row.",
          verify: () => {
            const d = s / n;
            const total = areaAsk ? count * Math.PI * (d / 2) ** 2 : count * Math.PI * d;
            return close(total, C.choiceValue(key)) && close(n * d, s);
          },
        };
      });
  }

  const shadedRegion = {
    id: "shaded-region-area",
    domain: GEO,
    skill: "Area and volume",
    subskill: "area",
    difficulty: "Hard",
    title: "Areas and lengths of regions bounded by circles",
    recognize:
      "Look for the relationship the figure forces rather than the individual measures: a chord tangent to the inner of two " +
      "concentric circles makes a right triangle whose legs give R² − r² directly, so the area between the circles needs " +
      "neither radius on its own.",
    // Hard: the tangent chord's right triangle gives R² − r² without either
    // radius. Congruent circles packed in a square are Medium and live in
    // circles-packed-in-square.
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "intermediate-value", "part-vs-whole"],
    build(t) {
      return circleRegionItem(t, t.pick(["ring", "ring", "ringChord", "ringChord"]));
    },
  };

  const circlesInSquare = {
    id: "circles-packed-in-square",
    domain: GEO,
    skill: "Area and volume",
    subskill: "area",
    difficulty: "Medium",
    title: "Congruent circles packed in a square",
    recognize:
      "The diameters of the circles in one row add up to the side of the square, so each radius is the side divided by twice " +
      "the number of circles in a row; then total the areas or circumferences of all the circles.",
    // Medium: one relationship (diameters span the side) and one formula,
    // with one circle, one row, or the side as the radius offered.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["part-vs-whole", "neighbouring-rule"],
    build(t) {
      return circleRegionItem(t, t.pick(["packArea", "packLength"]));
    },
  };

  /* ===================================== inscribed-composite-solids (Hard) */

  // Boxes whose edges and space diagonal are all whole numbers:
  // a² + b² + c² = d².
  const DIAGONAL_BOXES = [
    [1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13],
    [2, 5, 14, 15], [2, 10, 11, 15], [8, 9, 12, 17], [1, 12, 12, 17], [6, 10, 15, 19], [4, 8, 19, 21],
  ];

  // Exposed faces of a solid made of unit cubes, counted one face at a time:
  // the verify route for joined and drilled solids made of whole cubes.
  function exposedFaces(cells) {
    const key = (x, y, z) => `${x},${y},${z}`;
    const filled = new Set(cells.map(([x, y, z]) => key(x, y, z)));
    let faces = 0;
    cells.forEach(([x, y, z]) => {
      [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(([dx, dy, dz]) => {
        if (!filled.has(key(x + dx, y + dy, z + dz))) faces += 1;
      });
    });
    return faces;
  }

  const compositeSolids = {
    id: "inscribed-composite-solids",
    domain: GEO,
    skill: "Area and volume",
    subskill: "surface area",
    difficulty: "Hard",
    title: "Solids inside, joined to, or cut from other solids",
    recognize:
      "Find what the two solids share before computing: a box inside a sphere has the sphere's diameter as its space " +
      "diagonal (√(a² + b² + c²)); joined solids hide the faces where they touch; a hole removes two circles of surface " +
      "but adds the inside wall of the hole.",
    // Hard: each form turns on a relationship the stem never states (the
    // space diagonal, the hidden patch where solids touch, the new wall a
    // hole creates), and the intuitive reading (a face diagonal or an edge
    // as the diameter; adding whole surface areas; "drilling removes
    // surface") is offered.
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "intermediate-value", "wrong-quantity"],
    build(t) {
      const form = t.pick(["boxInSphere", "boxInSphere", "drilled", "stacked"]);
      const numeric = t.chance(0.35);
      const u = t.pick(["centimeters", "inches"]);
      const principles = [
        "A box whose eight vertices lie on a sphere has a space diagonal, √(a² + b² + c²), equal to the sphere's diameter.",
        "The surface area of a combined solid counts only the faces that are still exposed; a hole adds its inside wall.",
      ];
      return retry(() => {
        if (form === "boxInSphere") {
          const [a, b, c, d] = t.pick(DIAGONAL_BOXES);
          const k = d <= 9 ? t.pick([1, 2]) : 1;
          const [A, B, Cc, D] = [a * k, b * k, c * k, d * k];
          const ask = t.pick(["area", "radius", "edge"]);
          const lead = `All eight vertices of a rectangular box lie on a sphere.`;
          const check = (radius) => {
            // Circumradius of a box centered at the origin: its farthest vertex.
            const corners = [-1, 1].flatMap((i) => [-1, 1].flatMap((j) => [-1, 1].map((l) => [(i * A) / 2, (j * B) / 2, (l * Cc) / 2])));
            return corners.every((p) => close(Math.hypot(...p), radius));
          };
          if (ask === "area") {
            const key = piMultiple(D * D);
            const faceDiagonal = B * B + Cc * Cc;
            const list = [
              [piMultiple(faceDiagonal), `Uses the diagonal of the ${B}-by-${Cc} face as the diameter; the diameter runs through the inside of the box.`],
              [piMultiple(Cc * Cc), `Uses the longest edge, ${Cc}, as the diameter.`],
              [piMultiple(4 * D * D), `Uses the space diagonal, ${D}, as the radius instead of the diameter.`],
              [piMultiple((A + B + Cc) ** 2), `Adds the three edges, ${A + B + Cc}, to get the diameter.`],
              [piMultiple(A * A + B * B), `Uses the diagonal of the ${A}-by-${B} face as the diameter.`],
            ];
            const wrong = wrongFor(t, numeric, numeric ? D * D : key, numeric ? [] : list, { positive: true });
            if (!wrong) return null;
            return {
              responseType: numeric ? "numeric" : "multiple-choice",
              estimatedSeconds: 120,
              stimulus: null,
              figure: null,
              stem: numeric
                ? `${lead} The box is ${A} ${unitAfter(A, u)} by ${B} ${unitAfter(B, u)} by ${Cc} ${unitAfter(Cc, u)}. The surface area of the sphere is kπ square ${u}. What is the value of k?`
                : `${lead} The box is ${A} ${unitAfter(A, u)} by ${B} ${unitAfter(B, u)} by ${Cc} ${unitAfter(Cc, u)}. What is the surface area, in square ${u}, of the sphere?`,
              correct: numeric ? D * D : key,
              wrong,
              hint: "Which segment inside the box is a diameter of the sphere?",
              explanation:
                `The sphere's diameter is the box's space diagonal: √(${A}² + ${B}² + ${Cc}²) = √${D * D} = ${D}. So r = ${num(D / 2)} and the surface area is 4πr² = π(${D})² = ${key}.`,
              steps: [
                `Space diagonal: √(${A * A} + ${B * B} + ${Cc * Cc}) = ${D}, a diameter of the sphere.`,
                `Radius: ${num(D / 2)}.`,
                `Surface area: 4π(${num(D / 2)})² = ${key}.`,
              ],
              principles,
              trap: "A face diagonal or the longest edge lies on the box's surface; the diameter must join opposite vertices through the inside.",
              verify: () => check(D / 2) && close(C.choiceValue(key), 4 * Math.PI * (D / 2) ** 2),
            };
          }
          if (ask === "radius") {
            const radius = D / 2;
            const bothPairs = t.chance(0.5);
            // The diameter is twice the key; the longest edge and half of it
            // are a second such pair, so a pair never marks the key.
            const list = [
              [D, "Gives the diameter of the sphere instead of its radius."],
              [Cc / 2, `Uses the longest edge, ${Cc}, as the diameter.`],
              [Cc, `Uses the longest edge, ${Cc}, as the radius.`],
              [surd(Math.sqrt(B * B + Cc * Cc)) && Number.isInteger(Math.sqrt(B * B + Cc * Cc)) ? Math.sqrt(B * B + Cc * Cc) / 2 : null, `Uses the diagonal of the ${B}-by-${Cc} face as the diameter.`],
              [(A + B + Cc) / 2, `Adds the three edges to get the diameter.`],
              [(A + B + Cc) / 3, "Averages the three edges."],
            ];
            // Half the items offer both pairs; the rest choose freely.
            const wrong = wrongFor(t, numeric, radius, list, { positive: true, keep: bothPairs ? 3 : 0 });
            if (!wrong) return null;
            return {
              responseType: numeric ? "numeric" : "multiple-choice",
              estimatedSeconds: 110,
              stimulus: null,
              figure: null,
              stem: `${lead} The box is ${A} ${unitAfter(A, u)} by ${B} ${unitAfter(B, u)} by ${Cc} ${unitAfter(Cc, u)}. What is the radius, in ${u}, of the sphere?`,
              correct: radius,
              wrong,
              hint: "Which segment inside the box is a diameter of the sphere?",
              explanation: `The sphere's diameter is the box's space diagonal, √(${A}² + ${B}² + ${Cc}²) = √${D * D} = ${D}, so the radius is ${num(radius)}.`,
              steps: [
                `Space diagonal: √(${A * A} + ${B * B} + ${Cc * Cc}) = √${D * D} = ${D}.`,
                `It is a diameter, so the radius is ${D} ÷ 2 = ${num(radius)}.`,
              ],
              principles,
              trap: "The diameter joins opposite vertices of the box through its inside; an edge or a face diagonal is too short.",
              verify: () => check(radius),
            };
          }
          // The third edge from the sphere and two edges.
          const radius = D / 2;
          const list = [
            [D - A - B, `Subtracts the edges from the diameter, ${D} − ${A} − ${B}, instead of subtracting their squares.`],
            [Number.isInteger(Math.sqrt(D * D - A * A)) ? Math.sqrt(D * D - A * A) : null, `Leaves out the edge of length ${B}.`],
            [radius * radius - A * A - B * B > 0 && Number.isInteger(Math.sqrt(radius * radius - A * A - B * B)) ? Math.sqrt(radius * radius - A * A - B * B) : null, "Uses the radius where the diameter belongs."],
            [Number.isInteger(Math.sqrt(D * D + A * A + B * B)) ? Math.sqrt(D * D + A * A + B * B) : null, "Adds the squares of the edges to the square of the diameter instead of subtracting."],
            [D * D - A * A - B * B, "Stops at the square of the edge."],
          ];
          const wrong = wrongFor(t, numeric, Cc, list, { positive: true });
          if (!wrong) return null;
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 125,
            stimulus: null,
            figure: null,
            stem: `${lead} The sphere has a radius of ${num(radius)} ${unitAfter(radius, u)}, and two of the box's edges are ${A} ${unitAfter(A, u)} and ${B} ${unitAfter(B, u)} long. What is the length, in ${u}, of the box's third edge?`,
            correct: Cc,
            wrong,
            hint: "Which segment inside the box is a diameter of the sphere, and how is its length related to the edges?",
            explanation:
              `The space diagonal is a diameter: ${D}. So ${A}² + ${B}² + c² = ${D}², c² = ${D * D} − ${A * A} − ${B * B} = ${Cc * Cc}, and c = ${Cc}.`,
            steps: [
              `Diameter: 2 × ${num(radius)} = ${D}; it is the box's space diagonal.`,
              `${A}² + ${B}² + c² = ${D}², so c² = ${Cc * Cc}.`,
              `c = ${Cc}.`,
            ],
            principles,
            trap: "The edges and the diagonal are related through their squares, and the diagonal is the diameter, not the radius.",
            verify: () => check(radius),
          };
        }
        if (form === "drilled") {
          const a = t.pick([6, 8, 10, 12, 14]);
          const r = t.int(1, Math.floor((a - 2) / 2));
          const faces = 6 * a * a;
          const piPart = 2 * r * a - 2 * r * r;
          if (piPart <= 0) return null;
          const expr = (whole, coefficient) => (coefficient === 0 ? fmt(whole) : `${fmt(whole)} ${coefficient > 0 ? "+" : "−"} ${piMultiple(Math.abs(coefficient))}`);
          const key = expr(faces, piPart);
          const list = [
            [expr(faces, -2 * r * r), "Removes the two circles cut from the faces but leaves out the inside wall of the hole."],
            [expr(faces, 2 * r * a), "Adds the inside wall of the hole but does not remove the two circles cut from the faces."],
            [fmt(faces), "Assumes drilling a hole does not change the surface area."],
            [expr(faces, 2 * r * a + 2 * r * r), "Adds the two circles instead of removing them."],
            [expr(faces, -r * r * a), "Subtracts the volume of the hole, πr²h, from the surface area."],
          ];
          if (numeric) {
            // The grid-in asks only for the multiple of π.
            if (!C.fitsGrid(piPart)) return null;
          }
          const wrong = numeric ? [] : spreadWrong(t, key, list);
          if (!numeric && !wrong) return null;
          const lead =
            `A cube has edges ${a} ${unitAfter(a, u)} long. A hole with a circular cross section of radius ${r} ${unitAfter(r, u)} is drilled straight through the cube, ` +
            "from the center of one face to the center of the opposite face.";
          return {
            responseType: numeric ? "numeric" : "multiple-choice",
            estimatedSeconds: 120,
            stimulus: null,
            figure: null,
            stem: numeric
              ? `${lead} The total surface area of the solid that remains, including the inside of the hole, is (${fmt(faces)} + kπ) square ${u}. What is the value of k?`
              : `${lead} What is the total surface area, in square ${u}, of the solid that remains, including the inside of the hole?`,
            correct: numeric ? piPart : key,
            wrong,
            hint: "Which surfaces disappear when the hole is drilled, and which new surface appears?",
            explanation:
              `The six faces had ${fmt(faces)} square ${u}. The hole removes a circle of area π(${r})² = ${piMultiple(r * r)} from each of two faces and adds ` +
              `its inside wall, a cylinder side of area 2π(${r})(${a}) = ${piMultiple(2 * r * a)}. Total: ${fmt(faces)} − ${piMultiple(2 * r * r)} + ${piMultiple(2 * r * a)} = ${key}.`,
            steps: [
              `Cube surface: 6 × ${a}² = ${fmt(faces)}.`,
              `Remove two circles: 2π(${r})² = ${piMultiple(2 * r * r)}.`,
              `Add the inside wall: 2π(${r})(${a}) = ${piMultiple(2 * r * a)}.`,
              `Total: ${key}.`,
            ],
            principles,
            trap: "Drilling removes material but adds surface: the inside wall of the hole is new surface, larger here than the two circles removed.",
            verify: () => {
              // Measure the surfaces separately: the faces, the two disks, and
              // the wall as circumference times length.
              const wall = 2 * Math.PI * r * a;
              const disks = 2 * Math.PI * r * r;
              return close(6 * a * a - disks + wall, C.choiceValue(key));
            },
          };
        }
        // Stacked cubes: a smaller cube glued on top of a larger one.
        const b = t.int(4, 12);
        const a = t.int(2, b - 1);
        const key = 6 * b * b + 4 * a * a;
        const list = [
          [6 * a * a + 6 * b * b, "Adds the two cubes' surface areas, counting the faces where they touch."],
          [6 * b * b + 5 * a * a, `Removes the small cube's bottom face but not the ${a}-by-${a} part of the large cube's top that it covers.`],
          [5 * a * a + 5 * b * b, "Removes a whole face from each cube; only an a-by-a patch of the large cube's top is covered."],
          [6 * b * b + 6 * a * a - 4 * a * a, "Removes four faces of the small cube instead of two squares in all."],
          [5 * b * b + 4 * a * a, "Removes the large cube's whole top face instead of the patch the small cube covers."],
        ];
        // Printed with thousands separators, as the test does.
        const wrong = wrongFor(t, numeric, fmt(key), list.map(([value, reason]) => [fmt(value), reason]), { positive: true, whole: true });
        if (!wrong) return null;
        const thing = t.pick([["cube-shaped wooden blocks", "block"], ["cube-shaped boxes", "box"], ["solid cubes", "cube"]]);
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 105,
          stimulus: null,
          figure: null,
          stem:
            `Two ${thing[0]} are glued together: a ${thing[1]} with edges ${a} ${unitAfter(a, u)} long is placed on top of a ${thing[1]} with edges ${b} ${unitAfter(b, u)} long, ` +
            `with its whole bottom face touching the larger ${thing[1]}'s top face. What is the total surface area, in square ${u}, of the combined solid?`,
          correct: numeric ? key : fmt(key),
          wrong,
          hint: "Which faces are hidden where the two blocks touch, and how large is each hidden patch?",
          explanation:
            `Separately the cubes have ${fmt(6 * b * b)} and ${fmt(6 * a * a)} square ${u} of surface. Gluing hides the small cube's bottom (${a * a}) and an equal ` +
            `${a}-by-${a} patch of the large cube's top (${a * a}), so the total is ${fmt(6 * b * b)} + ${fmt(6 * a * a)} − 2(${a * a}) = ${fmt(key)}.`,
          steps: [
            `Separate surface areas: 6(${b})² = ${fmt(6 * b * b)} and 6(${a})² = ${fmt(6 * a * a)}.`,
            `Hidden: the small cube's bottom and the patch under it, 2 × ${a * a} = ${2 * a * a}.`,
            `Total: ${fmt(6 * b * b + 6 * a * a)} − ${2 * a * a} = ${fmt(key)}.`,
          ],
          principles,
          trap: "Where two solids touch, two squares of surface disappear, one from each solid; the rest of the large cube's top stays exposed.",
          verify: () => {
            const cells = [];
            for (let x = 0; x < b; x += 1) for (let y = 0; y < b; y += 1) for (let z = 0; z < b; z += 1) cells.push([x, y, z]);
            for (let x = 0; x < a; x += 1) for (let y = 0; y < a; y += 1) for (let z = b; z < b + a; z += 1) cells.push([x, y, z]);
            return exposedFaces(cells) === key && (numeric || fmt(key) === fmt(C.choiceValue(fmt(key))));
          },
        };
      });
    },
  };

  // Existing templates keep their order (a run code rebuilds its questions
  // in this order); new templates are appended.
  return [
    altitudeArea, rectilinearPlan, volumeDimension, volumeUnits, scalingMedium, displacement, scalingSolids, inscribedPolygon, shadedRegion,
    circlesInSquare, compositeSolids,
  ];
});
