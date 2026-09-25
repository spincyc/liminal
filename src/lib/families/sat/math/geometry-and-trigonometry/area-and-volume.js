(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/geometry-and-trigonometry"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Area and volume templates (Geometry and Trigonometry), ordered Easy, Medium, Hard.

  const { num } = S;
  const {
    P, GEO, tidy, isClean, fmt, shown, retry, pack, add, sub, mul, unit, mid, dist, centroid, close,
    shoelace, toRad, piFraction, fitPoints, r1, seg, measure, unitText, name, nameAway, anchorFor, normalAway, rightMark,
    DOMAIN, round4, distinctWrong, fitsGridHard,
  } = C;

  /* =============================================== altitude-area (Easy) */

  // [height, offset of the foot, slanted side]
  const ALTITUDE_TRIPLES = [
    [3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [9, 12, 15], [12, 9, 15],
    [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [12, 16, 20], [16, 12, 20],
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
    if (show.base) {
      parts.push(measure(add(mid(map(baseEnds[0]), map(baseEnds[1])), [0, 18]), num(b)));
      words.push(`base ${baseEnds === null ? "" : ""}${num(b)}`);
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
    return { parts, pts, slantName, heightName, footName };
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
        const b = shape === "acute" ? t.int(off + 3, off + 16) : t.int(Math.max(5, Math.ceil(0.5 * off)), 24);
        if (b === s || b === h) return null;
        const names = t.pick(AREA_NAMES);
        const figureShape = altitudeShape(shape, names, b, off, h, { base: true, height: !reverse, slant: true });
        const { parts, pts, slantName, heightName } = figureShape;
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
        if (!reverse) {
          return pack(numeric, area, fmt(area), triangle
            ? [
              [shown((b * s) / 2, 1), `Uses the slanted side ${slantName} = ${s} as the height; the height must be perpendicular to the base.`],
              [shown(b * h, 1), "Multiplies base by height without taking half."],
              [shown(b * s, 1), `Multiplies the base by the slanted side ${slantName} and does not take half.`],
              [shown(b + h + s, 1), "Adds the labeled lengths instead of finding the area."],
            ]
            : [
              [shown(b * s, 1), `Uses the slanted side ${slantName} = ${s} as the height; the height must be perpendicular to the base.`],
              [shown((b * h) / 2, 1), "Takes half of base × height, as for a triangle."],
              [shown(2 * (b + s), 1), "Gives the perimeter, not the area."],
              [shown((b * s) / 2, 1), `Uses the slanted side as the height and takes half.`],
            ], {
            ...common,
            stem: `In the figure shown, what is the area of ${polygonName}?`,
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
        return pack(numeric, h, fmt(h), triangle
          ? [
            [shown(K / b, 2), `Divides the area by the base without doubling; a triangle's area is half of base × height.`],
            [shown(s, 0), `Gives the length of the slanted side ${slantName}, which is not perpendicular to the base.`],
            [shown((2 * K) / s, 2), `Divides twice the area by the slanted side ${slantName} instead of by the base.`],
            [shown((4 * K) / b, 2), "Doubles twice."],
          ]
          : [
            [shown((2 * K) / b, 2), "Uses the triangle formula, half of base × height, for a parallelogram."],
            [shown(s, 0), `Gives the length of the slanted side ${slantName}, which is not perpendicular to the base.`],
            [shown(K / s, 2), `Divides the area by the slanted side ${slantName} instead of by the base.`],
            [shown(K - b, 2), "Subtracts the base from the area."],
          ], {
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
          const r = t.int(2, 9);
          const h = t.int(2, 15);
          if (h === r || h === 2 * r) return null;
          const V = r * r * h;
          const askDiameter = t.chance(0.4);
          const key = askDiameter ? 2 * r : r;
          const alt = `A right circular cylinder with height labeled ${h} and a radius r drawn on its top base. The figure is drawn to scale.`;
          return pack(numeric, key, fmt(key), [
            [shown(r * r, 0), `Stops at r² = ${fmt(V)} ÷ ${h} = ${r * r} without taking the square root.`],
            [shown(askDiameter ? r : 2 * r, 0), askDiameter ? "Gives the radius; the question asks for the diameter." : "Gives the diameter; the question asks for the radius."],
            [shown((r * r) / 2, 1), `Halves r² = ${r * r} instead of taking its square root.`],
            [shown(Math.sqrt(V / h / 3) * (askDiameter ? 2 : 1), 0), "Uses the cone formula, with a factor of 1/3, for a cylinder."],
            [shown(V / h, 0), `Gives ${fmt(V)} ÷ ${h} = ${r * r}, which is r², not r.`],
          ], {
            stimulus: null,
            figure: cylinderFigure(r, h, num(h), "r", alt),
            principles,
            estimatedSeconds: 95,
            stem: `The right circular cylinder shown has a volume of ${fmt(V)}π ${cubic} and a height of ${h} ${units}. What is the ${askDiameter ? "diameter" : "radius"}, in ${units}, of the base of the cylinder?`,
            explanation: `πr²(${h}) = ${fmt(V)}π, so r² = ${fmt(V)} ÷ ${h} = ${r * r} and r = ${r}.${askDiameter ? ` The diameter is 2r = ${2 * r}.` : ""}`,
            steps: [
              `Set up the volume: πr² × ${h} = ${fmt(V)}π.`,
              `Divide by ${h}π: r² = ${r * r}.`,
              askDiameter ? `r = ${r}, so the diameter is 2 × ${r} = ${2 * r}.` : `Take the square root: r = ${r}.`,
            ],
            trap: `${r * r} is r², a step on the way; ${askDiameter ? "the diameter is twice the square root of it" : "the radius is its square root"}.`,
            hint: "What is left after dividing both sides of the volume formula by πh?",
            verify: () => close(Math.PI * (key / (askDiameter ? 2 : 1)) ** 2 * h, V * Math.PI),
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
          return pack(numeric, h, fmt(h), [
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
            return pack(numeric, SA, fmt(SA), [
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
          return pack(numeric, e, fmt(e), [
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
        return pack(numeric, key, fmt(key), [
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
          if (Math.abs(change) < 2 || !fitsGridHard(change)) continue;
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
          if (!fitsGridHard(answer)) continue;
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
          if (!fitsGridHard(answer)) continue;
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
          if (Math.abs(factor - 1) < 0.02 || !Number.isInteger(answer) || !fitsGridHard(answer)) continue;
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
          if (!fitsGridHard(answer)) continue;
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
        if (!fitsGridHard(answer)) continue;
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
      const numeric = t.chance(0.35);
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
          return pack(numeric, key, fmt(key), [
            [shown((W - w) * (H - h), 0), `Subtracts the ${ctx.inner}'s length and width from the ${ctx.outer}'s and multiplies the differences; the region left over is not ${article(W - w)} ${W - w}-by-${H - h} rectangle.`],
            [shown(W * H, 0), `Gives the area of the whole ${ctx.outer}, without removing the ${ctx.inner}.`],
            [shown(w * h, 0), `Gives the area of the ${ctx.inner}, the part that is covered.`],
            [shown(W * H + w * h, 0), `Adds the area of the ${ctx.inner} instead of subtracting it.`],
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
        const candidates = [
          [shown(W * H, 0), `Multiplies ${W} by ${H} as if the figure were a complete rectangle; the missing ${a}-by-${b} corner is not part of the figure.`],
          [shown(2 * (W + H), 0), "Adds the lengths of all six sides, which gives the perimeter of the figure, not its area."],
          ...{ outer: [wrongCorner, overlap, onePiece], corner: [overlap, onePiece], pieces: [onePiece, overlap] }[layoutName],
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
        return pack(numeric, key, fmt(key), candidates, {
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
        const list = distinctWrong(fmt(key), wrong.map(([value, reason]) => [value > 0 && isClean(value, 3) ? fmt(value) : null, reason]));
        if (!numeric && list.length < 3) return null;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 100,
          stimulus: null,
          figure,
          stem: `${lead} ${fact} ${ask}`,
          correct: numeric ? key : fmt(key),
          wrong: list,
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

  /* ====================================== displacement-and-transfer (Hard) */

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
    title: "Volume conserved: displacement and pouring",
    recognize:
      "The water's volume does not change when it is poured, and a submerged solid raises the water by its own volume: " +
      "set (base area of the container) × (change in depth) equal to that volume. The depth changes by the ratio of base areas, " +
      "not of radii, and the rise is not the size of the object.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
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
        const wrong = distinctWrong(key, list.map(([value, reason]) => [value !== null && value > 0 ? tidy(value) : null, reason]));
        if (!numeric && wrong.length < 3) return null;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 120,
          stimulus: null,
          figure: null,
          correct: key,
          wrong,
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
            ]
            : [
              [e, `Assumes the water level rises by the cube's edge length, ${e}.`],
              [d0 + rise, "Gives the new depth of the water instead of the change in depth."],
              [surfaceRise, "Divides the cube's surface area, not its volume, by the base area of the tank."],
              [e ** 3 / (L * W * d0), "Divides the cube's volume by the volume of the water instead of by the base area."],
            ], {
            stem:
              `A tank in the shape of a rectangular prism has a base that is ${L} ${u} long and ${W} ${u} wide, and it contains water to a depth of ${d0} ${u}. ` +
              `A solid cube with edges ${e} ${u} long is placed in the tank and sinks to the bottom, where it is completely covered by the water. ` +
              (askDepth ? `What is the new depth, in ${u}, of the water in the tank?` : `By how many ${u} does the water level in the tank rise?`),
            explanation:
              `The cube pushes aside its own volume of water, ${e}³ = ${fmt(e ** 3)} cubic ${u}. Spread over the base, ${L} × ${W} = ${fmt(L * W)} square ${u}, ` +
              `that raises the water by ${fmt(e ** 3)} ÷ ${fmt(L * W)} = ${num(tidy(rise))} ${u}` +
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
          const ballSize = ballDiameter ? `a diameter of ${2 * R} ${u}` : `a radius of ${R} ${u}`;
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
              `π(${r})² = ${piFraction(r * r, 1)}: ${n === 1 ? "" : `${n} × `}(4/3)(${R})³ ÷ ${r * r} = ${num(tidy(rise))} ${u}` +
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
              `so h = ${fmt(r1 * r1 * h1)} ÷ ${r2 * r2} = ${num(key)} ${u}.`,
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
            `so h = ${S.frac(rc * rc * hc, 3)} ÷ ${rC * rC} = ${num(key)} ${u}.`,
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

  return [altitudeArea, rectilinearPlan, volumeDimension, volumeUnits, scalingSolids, displacement];
});
