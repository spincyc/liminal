(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/geometry-and-trigonometry"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Circles templates (Geometry and Trigonometry), ordered Easy, Medium, Hard.

  const { MINUS, num } = S;
  const {
    P, GEO, fmt, shown, range, retry, pack, radical, surd, surdValue, piFraction, add, sub, mul, unit, mid, dist,
    dot, toRad, toDeg, fitPoints,
    close, angleAt, shoelace, r1, seg, measure, name, anchorFor, normalAway, sideLabel, angleArc,
    angleLabel, DOMAIN, heading, round4, segHard, distinctWrong, fitsGridHard,
  } = C;

  // Multiple of π: piText(12) -> "12π", piText(1) -> "π".
  const piText = (coefficient) => (coefficient === 1 ? "π" : `${fmt(coefficient)}π`);

  /* =========================================== circle-measure-basic (Easy) */

  const CIRCLE_CONTEXTS = [
    { thing: "circular garden", units: "feet" },
    { thing: "circular rug", units: "feet" },
    { thing: "circular pond", units: "meters" },
    { thing: "circular tabletop", units: "inches" },
    { thing: "circular track", units: "meters" },
  ];

  // Area and perimeter of a regular polygon with many sides, as a check on
  // πr² and 2πr that does not use either formula.
  function polygonCircle(radius, sides = 3600) {
    const points = range(0, sides - 1).map((index) => {
      const angle = (2 * Math.PI * index) / sides;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    });
    let perimeter = 0;
    points.forEach((p, index) => { perimeter += dist(p, points[(index + 1) % sides]); });
    return { area: shoelace(points), perimeter };
  }

  /* ==================================== circle-equation-features (Medium) */

  // "(x − 3)² + (y + 2)² = 49"; a zero coordinate prints as x² or y².
  function circleEq(h, k, rhs) {
    const part = (v, c) => (c === 0 ? `${v}²` : `(${v} ${c > 0 ? MINUS : "+"} ${fmt(Math.abs(c))})²`);
    return `${part("x", h)} + ${part("y", k)} = ${fmt(rhs)}`;
  }

  // Reads an equation printed by circleEq back into h, k, and the right side.
  function readCircleEq(text) {
    const clean = text.replace(/−/g, "-");
    const coordinate = (v) => {
      const match = new RegExp(`\\(${v} ([+-]) ([\\d.]+)\\)²`).exec(clean);
      if (match) return (match[1] === "-" ? 1 : -1) * Number(match[2]);
      return clean.includes(`${v}²`) ? 0 : NaN;
    };
    return { h: coordinate("x"), k: coordinate("y"), rhs: Number(clean.split("=")[1].replace(/,/g, "")) };
  }

  const onCircle = (eq, x, y) => close((x - eq.h) ** 2 + (y - eq.k) ** 2, eq.rhs);

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

  const dotAt = (p) => P.dot(p[0], p[1]);

  /* ============================================= arcs, sectors, inscribed */

  const O = [200, 150];

  const RADIUS = 106;

  const circlePoint = (degrees, extra = 0) => [
    O[0] + (RADIUS + extra) * Math.cos(toRad(degrees)),
    O[1] - (RADIUS + extra) * Math.sin(toRad(degrees)),
  ];

  function wedge(from, to) {
    const a = circlePoint(from);
    const b = circlePoint(to);
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
    const at = (key) => (key === "O" ? O : circlePoint(points[key]));
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
      parts.push(dotAt(circlePoint(degrees)));
      parts.push(name(circlePoint(degrees, 17), letter));
    });
    return parts;
  }

  const ARC_NAMES = [["A", "B", "C"], ["P", "Q", "R"], ["J", "K", "L"], ["D", "E", "F"], ["M", "N", "P"]];

  const PLAIN_RADIANS = [0.5, 0.6, 0.8, 1.2, 2, 2.4, 2.5];

  /* =========================================== circle equation, completing */

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

  const circleMeasure = {
    id: "circle-measure-basic",
    domain: GEO,
    skill: "Circles",
    subskill: "circle measures",
    difficulty: "Easy",
    title: "Circle area and circumference",
    recognize:
      "Check whether the given length is a radius or a diameter, then apply one formula: area = πr², circumference = 2πr = πd.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "neighbouring-rule"],
    build(t) {
      const askArea = t.chance(0.55);
      const givenDiameter = t.chance(0.5);
      const withFigure = t.chance(0.6);
      const numeric = t.chance(0.3);
      return retry(() => {
        const r = t.int(2, 15);
        const d = 2 * r;
        const given = givenDiameter ? d : r;
        const coefficient = askArea ? r * r : d;
        const ctx = t.pick(CIRCLE_CONTEXTS);
        let figure = null;
        let lead;
        if (withFigure) {
          const O = [200, 135];
          const R = 100;
          const theta = toRad(t.int(15, 60) * (t.chance(0.5) ? 1 : -1) + (t.chance(0.5) ? 0 : 180));
          const Pp = [O[0] + R * Math.cos(theta), O[1] - R * Math.sin(theta)];
          const Qp = [O[0] - R * Math.cos(theta), O[1] + R * Math.sin(theta)];
          const from = givenDiameter ? Qp : O;
          const n = normalAway(from, Pp, [O[0], O[1] - 200 * (Math.sin(theta) >= 0 ? -1 : 1)]);
          const labelAt = add(mid(givenDiameter ? O : from, Pp), mul(n, 13));
          const parts = [
            P.circle(O[0], O[1], R), P.dot(O[0], O[1]), name(add(O, mul(n, -15)), "O"),
            seg(from, Pp, 1.8), P.dot(Pp[0], Pp[1]),
            measure(labelAt, num(given), anchorFor(n)),
          ];
          if (givenDiameter) parts.push(P.dot(Qp[0], Qp[1]));
          const alt = `A circle with center O. A ${givenDiameter ? "diameter through O" : "radius from O to the circle"} is drawn and labeled ${given}.`;
          figure = { svg: S.svg(400, 270, parts, alt), alt, notToScale: false };
          lead = `The circle shown has center O${givenDiameter ? ", and the segment through O is a diameter" : ""}.`;
        } else {
          lead = `A ${ctx.thing} has a ${givenDiameter ? "diameter" : "radius"} of ${given} ${ctx.units}.`;
        }
        const what = askArea ? "area" : "circumference";
        const unitWords = withFigure ? "" : askArea ? `, in square ${ctx.units},` : `, in ${ctx.units},`;
        const stem = numeric
          ? `${lead} The ${what} of the ${withFigure ? "circle" : ctx.thing.replace("circular ", "")} is kπ${withFigure ? "" : askArea ? ` square ${ctx.units}` : ` ${ctx.units}`}. What is the value of k?`
          : `${lead} What is the ${what}${unitWords} of the ${withFigure ? "circle" : ctx.thing.replace("circular ", "")}?`;
        const keyText = piText(coefficient);
        const candidates = askArea
          ? givenDiameter
            ? [
              [piText(d * d), `Uses the diameter, ${d}, as the radius.`],
              [piText(d), "Gives the circumference, πd, instead of the area."],
              [piText(2 * d), "Uses the diameter as the radius in 2πr."],
            ]
            : [
              [piText(d), "Gives the circumference, 2πr, instead of the area."],
              [piText(4 * r * r), "Doubles the radius before squaring, as if the formula used the diameter."],
              [piText(r), "Multiplies π by the radius without squaring it."],
            ]
          : givenDiameter
            ? [
              [piText(2 * d), `Uses the diameter, ${d}, as the radius in 2πr.`],
              [piText(r * r), "Gives the area, πr², instead of the circumference."],
              [piText(d * d), "Squares the diameter."],
            ]
            : [
              [piText(r * r), "Gives the area, πr², instead of the circumference."],
              [piText(r), "Leaves out the 2 in 2πr."],
              [piText(4 * r), "Doubles the radius and then uses 2πr, doubling twice."],
            ];
        return pack(numeric, coefficient, keyText, candidates, {
          stimulus: null,
          figure,
          stem,
          explanation: askArea
            ? `${givenDiameter ? `The radius is half the diameter: ${d} ÷ 2 = ${r}. ` : ""}The area is πr² = π(${r})² = ${keyText}.`
            : `The circumference is ${givenDiameter ? `πd = π(${d})` : `2πr = 2π(${r})`} = ${keyText}.`,
          steps: [
            givenDiameter ? `The labeled length is a diameter, ${d}, so the radius is ${r}.` : `The labeled length is a radius, ${r}.`,
            askArea ? "Area = πr²." : "Circumference = 2πr, which is also πd.",
            askArea ? `π × ${r}² = ${keyText}.` : `${givenDiameter ? `π × ${d}` : `2 × π × ${r}`} = ${keyText}.`,
          ],
          principles: [
            "A circle's area is πr² and its circumference is 2πr, where r is the radius; the diameter is 2r.",
          ],
          trap: givenDiameter ? `${d} is the diameter; the formulas use the radius, ${r}.` : `Area squares the radius; circumference doubles it.`,
          hint: givenDiameter ? "Is the given length a radius?" : `Which formula gives the ${what}?`,
          estimatedSeconds: 50,
          verify: () => {
            const polygon = polygonCircle(given / (givenDiameter ? 2 : 1));
            return close((askArea ? polygon.area : polygon.perimeter) / Math.PI, coefficient, 1e-5);
          },
        });
      });
    },
  };

  const circleEquation = {
    id: "circle-equation-features",
    domain: GEO,
    skill: "Circles",
    subskill: "circle equations",
    difficulty: "Medium",
    title: "Circle equation from center and radius",
    recognize:
      "(x − h)² + (y − k)² = r² needs the center (h, k) and the square of the radius: find the radius first (a distance to a " +
      "point, half a diameter, the distance to a tangent axis), then square it; the signs inside the parentheses are opposite " +
      "to the center's coordinates.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["sign-error", "intermediate-value", "wrong-quantity"],
    build(t) {
      const form = t.pick(["point", "point", "diameter", "tangent", "read"]);
      const principles = [
        "A circle with center (h, k) and radius r has equation (x − h)² + (y − k)² = r².",
        "The radius is the distance from the center to any point on the circle.",
      ];
      return retry(() => {
        const h = t.nonzero(-9, 9);
        const k = t.nonzero(-9, 9);
        if (Math.abs(h) === Math.abs(k)) return null;
        if (form === "point") {
          const dx = t.nonzero(-6, 6);
          const dy = t.nonzero(-6, 6);
          const px = h + dx;
          const py = k + dy;
          const r2 = dx * dx + dy * dy;
          const root = Math.sqrt(r2);
          const keyText = circleEq(h, k, r2);
          return pack(false, null, keyText, [
            [circleEq(-h, -k, r2), "Uses the center's coordinates with the signs in the equation unchanged; (x − h) has the opposite sign to h."],
            [circleEq(px, py, r2), `Uses the point (${num(px)}, ${num(py)}) as the center.`],
            [circleEq(h, k, (Math.abs(dx) + Math.abs(dy)) ** 2), "Adds the horizontal and vertical distances before squaring instead of squaring each."],
            [Number.isInteger(root) ? circleEq(h, k, root) : circleEq(h, k, Math.abs(dx) + Math.abs(dy)), Number.isInteger(root) ? "Puts the radius on the right side instead of its square." : "Adds the horizontal and vertical distances to get the radius."],
          ], {
            stimulus: null,
            figure: null,
            stem: `In the xy-plane, a circle has center ${S.point(h, k)} and passes through the point ${S.point(px, py)}. Which of the following is an equation of the circle?`,
            explanation:
              `The radius is the distance from ${S.point(h, k)} to ${S.point(px, py)}: r² = (${num(dx)})² + (${num(dy)})² = ${r2}. ` +
              `So the equation is ${keyText}.`,
            steps: [
              `Horizontal and vertical distances: ${num(px)} ${MINUS} ${S.paren(h)} = ${num(dx)} and ${num(py)} ${MINUS} ${S.paren(k)} = ${num(dy)}.`,
              `r² = ${dx * dx} + ${dy * dy} = ${r2}.`,
              `Equation: ${keyText}.`,
            ],
            principles,
            trap: `The right side is r², found from the point; the signs inside the parentheses are opposite to ${num(h)} and ${num(k)}.`,
            hint: "How far is the given point from the center?",
            estimatedSeconds: 95,
            verify: () => {
              const eq = readCircleEq(keyText);
              return eq.h === h && eq.k === k && close(Math.hypot(px - eq.h, py - eq.k) ** 2, eq.rhs) && onCircle(eq, px, py);
            },
          });
        }
        if (form === "diameter") {
          const dx = 2 * t.nonzero(-4, 4);
          const dy = 2 * t.nonzero(-4, 4);
          const x1 = h - dx / 2;
          const y1 = k - dy / 2;
          const x2 = h + dx / 2;
          const y2 = k + dy / 2;
          const d2 = dx * dx + dy * dy;
          const r2 = d2 / 4;
          const keyText = circleEq(h, k, r2);
          return pack(false, null, keyText, [
            [circleEq(h, k, d2), "Uses the length of the diameter as the radius."],
            [circleEq(-h, -k, r2), "Keeps the center's signs inside the parentheses; (x − h) has the opposite sign to h."],
            [circleEq(x1, y1, d2), `Uses the endpoint ${S.point(x1, y1)} as the center and the diameter as the radius.`],
            [circleEq(h, k, r2 / 2), "Halves r² instead of halving the diameter before squaring."],
          ], {
            stimulus: null,
            figure: null,
            stem: `In the xy-plane, the points ${S.point(x1, y1)} and ${S.point(x2, y2)} are the endpoints of a diameter of a circle. Which of the following is an equation of the circle?`,
            explanation:
              `The center is the midpoint, ${S.point(h, k)}. The diameter has length √(${dx * dx} + ${dy * dy}) = √${d2}, so r² = (√${d2} ÷ 2)² = ${d2} ÷ 4 = ${r2}. ` +
              `The equation is ${keyText}.`,
            steps: [
              `Center (midpoint): ((${num(x1)} + ${num(x2)})/2, (${num(y1)} + ${num(y2)})/2) = ${S.point(h, k)}.`,
              `r² is the squared distance from the center to an endpoint: (${num(dx / 2)})² + (${num(dy / 2)})² = ${r2}.`,
              `Equation: ${keyText}.`,
            ],
            principles: [principles[0], "The center of a circle is the midpoint of any diameter, and the radius is half the diameter."],
            trap: `The distance between the endpoints is the diameter; using it as the radius makes the right side ${d2} instead of ${r2}.`,
            hint: "Where is the center, relative to the two endpoints?",
            estimatedSeconds: 100,
            verify: () => {
              const eq = readCircleEq(keyText);
              return onCircle(eq, x1, y1) && onCircle(eq, x2, y2) && close(eq.h, (x1 + x2) / 2) && close(eq.k, (y1 + y2) / 2);
            },
          });
        }
        if (form === "tangent") {
          const axis = t.pick(["x", "y"]);
          const r = axis === "x" ? Math.abs(k) : Math.abs(h);
          const other = axis === "x" ? Math.abs(h) : Math.abs(k);
          if (r < 2) return null;
          const keyText = circleEq(h, k, r * r);
          return pack(false, null, keyText, [
            [circleEq(h, k, other * other), `Uses the distance from the center to the ${axis === "x" ? "y" : "x"}-axis instead of to the ${axis}-axis.`],
            [circleEq(-h, -k, r * r), "Keeps the center's signs inside the parentheses; (x − h) has the opposite sign to h."],
            [circleEq(h, k, r), "Puts the radius on the right side instead of its square."],
            [circleEq(h, k, (h * h + k * k)), "Uses the distance from the center to the origin as the radius."],
          ], {
            stimulus: null,
            figure: null,
            stem: `In the xy-plane, a circle has center ${S.point(h, k)} and is tangent to the ${axis}-axis. Which of the following is an equation of the circle?`,
            explanation:
              `A circle tangent to the ${axis}-axis touches it at one point, directly ${axis === "x" ? (k > 0 ? "below" : "above") : h > 0 ? "to the left of" : "to the right of"} the center, so the radius is the center's distance to that axis, |${num(axis === "x" ? k : h)}| = ${r}. ` +
              `The equation is ${keyText}.`,
            steps: [
              `The radius to the point of tangency is perpendicular to the ${axis}-axis.`,
              `So r = |${axis === "x" ? "y" : "x"}-coordinate of the center| = ${r}, and r² = ${r * r}.`,
              `Equation: ${keyText}.`,
            ],
            principles: [principles[0], "A radius drawn to a point of tangency is perpendicular to the tangent line."],
            trap: `The distance to the ${axis}-axis is set by the ${axis === "x" ? "y" : "x"}-coordinate, ${num(axis === "x" ? k : h)}, not by the ${axis}-coordinate.`,
            hint: `How far is the center from the ${axis}-axis?`,
            estimatedSeconds: 95,
            verify: () => {
              const eq = readCircleEq(keyText);
              // Meeting the axis leaves (other coordinate − center)² = rhs − (distance to axis)², which must be 0 for one point.
              const gap = eq.rhs - (axis === "x" ? eq.k : eq.h) ** 2;
              return close(gap, 0) && eq.h === h && eq.k === k;
            },
          });
        }
        const r = t.int(2, 12);
        const askPoint = t.chance(0.5);
        const numeric = t.chance(0.6);
        const equation = circleEq(h, k, r * r);
        const key = askPoint ? k + r : 2 * r;
        const candidates = askPoint
          ? [
            [shown(k - r + 100, 0) && null, ""],
            [fmt(k - r), `Gives the other point on the circle with x = ${num(h)}, below the center.`],
            [fmt(-k + r), "Flips the sign of the center's y-coordinate."],
            [fmt(k + r * r), `Adds r² = ${r * r} instead of r = ${r}.`],
            [fmt(r), "Gives the radius, not the y-coordinate."],
          ]
          : [
            [fmt(r), `Gives the radius, ${r}, not the diameter.`],
            [fmt(r * r), `Takes ${r * r}, the right side, as the radius.`],
            [fmt(2 * r * r), `Doubles the right side, ${r * r}, instead of doubling its square root.`],
            [fmt((r * r) / 2), `Halves the right side, ${r * r}.`],
          ];
        return pack(numeric, key, fmt(key), candidates, {
          stimulus: { type: "equations", content: equation },
          figure: null,
          stem: askPoint
            ? `In the xy-plane, the graph of the given equation is a circle. The point (${num(h)}, t) lies on the circle, and t > ${num(k)}. What is the value of t?`
            : "In the xy-plane, the graph of the given equation is a circle. What is the length of a diameter of the circle?",
          explanation: askPoint
            ? `The center is ${S.point(h, k)} and r² = ${r * r}, so r = ${r}. The points on the circle with x = ${num(h)} are directly above and below the center, at y = ${num(k)} ± ${r}; the one with t > ${num(k)} is t = ${num(key)}.`
            : `The right side is r² = ${r * r}, so the radius is ${r} and a diameter is 2 × ${r} = ${key}.`,
          steps: askPoint
            ? [
              `Center ${S.point(h, k)}; r² = ${r * r}, so r = ${r}.`,
              `Substitute x = ${num(h)}: (t ${k > 0 ? MINUS : "+"} ${Math.abs(k)})² = ${r * r}, so t ${k > 0 ? MINUS : "+"} ${Math.abs(k)} = ±${r}.`,
              `t > ${num(k)}, so t = ${num(k)} + ${r} = ${num(key)}.`,
            ]
            : [
              `The right side of the equation is r² = ${r * r}.`,
              `r = √${r * r} = ${r}.`,
              `Diameter = 2r = ${key}.`,
            ],
          principles,
          trap: askPoint ? `The right side is r², so the point is ${r} (not ${r * r}) above the center.` : `${r * r} is r²; the radius is ${r}, and a diameter is twice that.`,
          hint: "What does the number on the right side of the equation tell you?",
          estimatedSeconds: 85,
          verify: () => {
            const eq = readCircleEq(equation);
            return askPoint ? onCircle(eq, h, key) && key > k : close(2 * Math.sqrt(eq.rhs), key);
          },
        });
      });
    },
  };

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
      // About 4/7 of items can be drawn to scale without the drawing settling
      // the answer (arc lengths and areas, not a drawn angle); 61% of those are.
      const toScale = t.chance(0.61);
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
          // Not to scale, A and B are drawn nearly opposite (angle ACB near
          // 85°), so the true angle stays within about 30° of that.
          const accurate = toScale;
          // Drawn to scale, angles under 30° put the chords (and the label)
          // on top of the center, so the list starts at 30°.
          const theta = t.pick(accurate ? [30, 36, 40, 45, 50, 54, 60] : [54, 60, 70, 72]);
          const r = t.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18].filter((value) => (theta * value) % 90 === 0));
          const arc = piFraction(theta * r, 90);
          const drawnHalf = accurate ? theta : t.int(83, 87);
          const center = t.int(248, 292);
          const [first, second] = t.shuffle([nA, nB]);
          const Cdeg = center + 180 + t.int(-32, 32);
          const points = { [first]: center - drawnHalf, [second]: center + drawnHalf, [nC]: Cdeg };
          const Ap = circlePoint(points[nA]);
          const Bp = circlePoint(points[nB]);
          const Cp = circlePoint(Cdeg);
          const parts = circleBase(points, [[nC, nA], [nC, nB]]).concat([
            segHard(Cp, Ap),
            segHard(Cp, Bp),
            angleArc(Cp, Ap, Bp, 18),
            angleLabel(Cp, Ap, Bp, `${theta}°`, Math.max(34, 15 / Math.sin(toRad(theta / 2)))),
          ]);
          const alt =
            `Circle with center O. Points ${nA}, ${nB}, and ${nC} lie on the circle, with chords ${nC}${nA} and ${nC}${nB}; angle ${nA}${nC}${nB} is labeled ${theta}°. ` +
            (accurate
              ? "The figure is drawn to scale."
              : `${nA} and ${nB} are drawn almost directly opposite each other, so angle ${nA}${nC}${nB} looks like a right angle and arc ${nA}${nB} looks like a semicircle.`);
          const wrong = distinctWrong(arc, [
            [accurate ? null : piFraction(r), `Takes ${nA}${nB} as a diameter because it looks like one in the figure, making arc ${nA}${nB} a semicircle; the figure is not drawn to scale.`],
            [piFraction(theta * r, 180), `Uses ${theta}° as the central angle; an inscribed angle is half the central angle, so the arc is twice as long.`],
            [piFraction(180 * r - theta * r, 90), `Finds the length of the arc that contains ${nC}.`],
            [piFraction(theta * r * r, 180), `Computes the area of sector ${nA}O${nB} instead of the length of arc ${nA}${nB}.`],
          ]);
          if (wrong.length < 3) return this.build(t);
          return {
            responseType: "multiple-choice",
            estimatedSeconds: 105,
            stimulus: null,
            figure: { svg: S.svg(400, 300, parts, alt), alt, notToScale: !accurate },
            stem: `Points ${nA}, ${nB}, and ${nC} lie on the circle shown, which has center O and radius ${r}. What is the length of the arc ${nA}${nB} that does not contain ${nC}?`,
            correct: arc,
            wrong,
            hint: `Which angle at the center cuts off the same arc as angle ${nA}${nC}${nB}?`,
            explanation:
              `Angle ${nA}${nC}${nB} is inscribed, so the central angle ${nA}O${nB} that intercepts the same arc measures 2 × ${theta}° = ${2 * theta}°. ` +
              `The arc is ${2 * theta}/360 of the circumference 2π(${r}) = ${piFraction(2 * r)}, which is ${arc}.` +
              (accurate ? "" : ` The figure is not drawn to scale: ${nA}${nB} only looks like a diameter.`),
            steps: [
              `Angle ${nA}${nC}${nB} is an inscribed angle of ${theta}°.`,
              `The central angle on the same arc is ${2 * theta}°.`,
              `Circumference: 2π(${r}) = ${piFraction(2 * r)}.`,
              `Arc ${nA}${nB} = (${2 * theta}/360) × ${piFraction(2 * r)} = ${arc}.`,
            ],
            principles,
            trap: accurate
              ? `${theta}° is an inscribed angle, not a central one, so the arc it cuts off is twice as large a fraction of the circle as ${theta}/360.`
              : `${nA}${nB} looks like a diameter in the figure, which is not drawn to scale; and ${theta}° is inscribed, not central.`,
            verify: () => {
              const A = [r * Math.cos(toRad(-theta)), r * Math.sin(toRad(-theta))];
              const B = [r * Math.cos(toRad(theta)), r * Math.sin(toRad(theta))];
              const C = [-r, 0];
              return close(angleAt(C, A, B), theta) && close(polylineArc(r, toRad(2 * theta)), (theta * r * Math.PI) / 90, 1e-5);
            },
          };
        }
        // Central angle given in degrees; drawn as a right angle.
        // Not to scale, angle AOB is drawn near 90°, so the true angle stays
        // within 30° of that.
        const accurate = toScale;
        const c = t.pick(accurate ? [40, 45, 60, 72, 120, 135, 144, 150] : [60, 72, 108, 120]);
        const r = t.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18].filter((value) => (c * value) % 180 === 0));
        const arc = piFraction(c * r, 180);
        const start = t.int(-15, 40);
        const drawn = accurate ? c : t.int(87, 93);
        const points = { [nA]: start, [nB]: start + drawn };
        const Ap = circlePoint(points[nA]);
        const Bp = circlePoint(points[nB]);
        const parts = circleBase(points, [["O", nA], ["O", nB]]).concat([
          segHard(O, Ap),
          segHard(O, Bp),
          angleArc(O, Ap, Bp, 18),
          angleLabel(O, Ap, Bp, `${c}°`, Math.max(32, 15 / Math.sin(toRad(drawn / 2)))),
          sideLabel(O, Ap, Bp, num(r), 12),
        ]);
        const alt =
          `Circle with center O and radii O${nA} and O${nB}. Radius O${nA} is labeled ${r} and angle ${nA}O${nB} is labeled ${c}°. ` +
          (accurate ? "The figure is drawn to scale." : `Angle ${nA}O${nB} is drawn as a right angle, so arc ${nA}${nB} looks like a quarter of the circle.`);
        const wrong = distinctWrong(arc, [
          [accurate ? null : piFraction(r, 2), `Treats angle ${nA}O${nB} as a right angle, as it looks in the figure, making arc ${nA}${nB} a quarter circle; the figure is not drawn to scale.`],
          [piFraction(2 * c * r, 180), `Treats the ${c}° angle as inscribed and doubles it; angle ${nA}O${nB} is a central angle.`],
          [piFraction(c * r * r, 360), `Computes the area of sector ${nA}O${nB} instead of the length of arc ${nA}${nB}.`],
          [piFraction(360 * r - c * r, 180), "Finds the length of the major arc instead of the minor arc."],
        ]);
        if (wrong.length < 3) return this.build(t);
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 95,
          stimulus: null,
          figure: { svg: S.svg(400, 300, parts, alt), alt, notToScale: !accurate },
          stem: `In the circle shown with center O, what is the length of minor arc ${nA}${nB}?`,
          correct: arc,
          wrong,
          hint: "What fraction of the whole circle does the marked angle cut off?",
          explanation:
            `Angle ${nA}O${nB} is a central angle of ${c}°, so minor arc ${nA}${nB} is ${c}/360 of the circumference 2π(${r}) = ${piFraction(2 * r)}: ` +
            `${arc}.${accurate ? "" : " The angle is drawn close to 90°, but the figure is not drawn to scale."}`,
          steps: [
            `Angle ${nA}O${nB} is central, so the arc is ${c}/360 of the circle.`,
            `Circumference: 2π(${r}) = ${piFraction(2 * r)}.`,
            `Arc ${nA}${nB} = (${c}/360) × ${piFraction(2 * r)} = ${arc}.`,
          ],
          principles,
          trap: accurate
            ? `Angle ${nA}O${nB} is a central angle, so the arc is ${c}/360 of the circumference; doubling it, or using the area formula, answers a different question.`
            : `Angle ${nA}O${nB} looks like a right angle in the figure, which is not drawn to scale; it measures ${c}°.`,
          verify: () => close(polylineArc(r, toRad(c)), (c * r * Math.PI) / 180, 1e-5),
        };
      }

      if (form === "inscribed") {
        // Central angle given in radians, or through an arc length; asked
        // for the inscribed angle in degrees. Drawn with AOB a right angle.
        // Always not to scale (a drawn angle would give the answer away), with
        // the true central angle within 30° of the right angle it is drawn as.
        const c = t.pick([60, 72, 108, 120]);
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
          const Ct = circlePoint(candidate);
          if (Math.min(segmentDistance(O, Ct, circlePoint(start)), segmentDistance(O, Ct, circlePoint(start + drawn))) > 22) {
            Cdeg = candidate;
            break;
          }
        }
        const points = { [nA]: start, [nB]: start + drawn, [nC]: Cdeg };
        const Ap = circlePoint(points[nA]);
        const Bp = circlePoint(points[nB]);
        const Cp = circlePoint(Cdeg);
        const parts = circleBase(points, [["O", nA], ["O", nB], [nC, nA], [nC, nB]]).concat([
          segHard(O, Ap),
          segHard(O, Bp),
          segHard(Cp, Ap),
          segHard(Cp, Bp),
          angleArc(Cp, Ap, Bp, 18),
        ]);
        const alt =
          `Circle with center O. Points ${nA}, ${nB}, and ${nC} lie on the circle, with radii O${nA} and O${nB} and chords ${nC}${nA} and ${nC}${nB}; ${nC} is on the major arc. ` +
          `Angle ${nA}O${nB} is drawn as a right angle, so angle ${nA}${nC}${nB} looks like half of a right angle.`;
        const answer = c / 2;
        const given = viaArc
          ? `The circle shown has center O and radius ${r}, and minor arc ${nA}${nB} has length ${piFraction(c * r, 180)}.`
          : `Points ${nA}, ${nB}, and ${nC} lie on the circle shown with center O, and angle ${nA}O${nB} measures ${piFraction(c, 180)} radians.`;
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
              ? `Minor arc ${nA}${nB} is ${piFraction(c * r, 180)} and the radius is ${r}, so angle ${nA}O${nB} = s/r = ${piFraction(c, 180)} radians. `
              : "") +
            `${piFraction(c, 180)} radians is ${piFraction(c, 180)} × 180/π = ${c}°. Angle ${nA}${nC}${nB} is inscribed and intercepts the same arc, so it measures ` +
            `${c}/2 = ${num(answer)}°. The figure is not drawn to scale; angle ${nA}O${nB} only looks like a right angle.`,
          steps: [
            viaArc ? `Central angle in radians: s/r = ${piFraction(c * r, 180)} ÷ ${r} = ${piFraction(c, 180)}.` : `Angle ${nA}O${nB} = ${piFraction(c, 180)} radians.`,
            `Convert: ${piFraction(c, 180)} × 180/π = ${c}°.`,
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
        // Asking for the angle keeps the figure not to scale (a drawn angle would
        // give it away); asking for the arc may be drawn to scale.
        const askAngle = t.chance(0.5);
        const accurate = toScale && !askAngle;
        const c = t.pick(accurate ? [30, 40, 45, 60, 72, 120, 135, 144, 150] : [60, 72, 108, 120]);
        const r = t.pick([2, 3, 4, 5, 6, 8, 9, 10, 12].filter((value) => (c * value * value) % 360 === 0));
        const areaText = piFraction(c * r * r, 360);
        const start = t.int(10, 60);
        const drawn = accurate ? c : t.int(87, 93);
        const points = { [nA]: start, [nB]: start + drawn };
        const Ap = circlePoint(points[nA]);
        const Bp = circlePoint(points[nB]);
        const parts = [wedge(start, start + drawn)].concat(circleBase(points, [["O", nA], ["O", nB]]), [
          segHard(O, Ap),
          segHard(O, Bp),
          sideLabel(O, Ap, Bp, num(r), 12),
        ]);
        const alt =
          `Circle with center O and radii O${nA} and O${nB}; sector ${nA}O${nB} is shaded and radius O${nA} is labeled ${r}. ` +
          (accurate ? "The figure is drawn to scale." : "The shaded sector is drawn as a quarter of the circle.");
        const figure = { svg: S.svg(400, 300, parts, alt), alt, notToScale: !accurate };
        const intro = `In the circle shown with center O, the shaded sector has area ${areaText}.`;
        if (askAngle) {
          const answer = piFraction(c, 180);
          const wrong = distinctWrong(answer, [
            ["π/2", `Reads angle ${nA}O${nB} as a right angle because the shaded sector looks like a quarter circle; the figure is not drawn to scale.`],
            [piFraction(c, 360), "Uses r²θ for the sector area, dropping the factor 1/2."],
            [c * r <= 720 ? piFraction(c * r, 360) : null, "Divides the area by r as if the area were an arc length (s = rθ)."],
            [piFraction(360 - c, 180), "Gives the angle of the unshaded part of the circle."],
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
              `The whole circle has area π(${r})² = ${piFraction(r * r)}. The sector is ${areaText} ÷ ${piFraction(r * r)} = ${S.frac(c, 360)} of it, ` +
              `so angle ${nA}O${nB} is ${S.frac(c, 360)} of 2π, which is ${answer}. (Equivalently, A = r²θ/2 gives θ = 2A/r².) The sector only looks like a quarter circle.`,
            steps: [
              `Circle area: π(${r})² = ${piFraction(r * r)}.`,
              `Fraction shaded: ${areaText} ÷ ${piFraction(r * r)} = ${S.frac(c, 360)}.`,
              `Angle ${nA}O${nB} = ${S.frac(c, 360)} × 2π = ${answer}.`,
            ],
            principles,
            trap: "The sector looks like a quarter of the circle in the figure, which is not drawn to scale, suggesting π/2.",
            verify: () => close(polygonSector(r, (c / 180) * Math.PI), (c * r * r * Math.PI) / 360, 1e-5),
          };
        }
        const answer = piFraction(c * r, 180);
        const wrong = distinctWrong(answer, [
          [accurate ? null : piFraction(r, 2), "Treats the sector as a quarter circle, as it looks in the figure; the figure is not drawn to scale."],
          [piFraction(c * r, 360), "Divides the area by r without doubling; a sector's area is half of r times its arc length."],
          [piFraction(c, 180), "Stops at the central angle in radians instead of multiplying by the radius."],
          [piFraction(360 * r - c * r, 180), "Finds the length of the arc bounding the unshaded region."],
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
            `The circle's area is ${piFraction(r * r)}, so the shaded sector is ${areaText} ÷ ${piFraction(r * r)} = ${S.frac(c, 360)} of the circle. ` +
            `Arc ${nA}${nB} is the same fraction of the circumference ${piFraction(2 * r)}: ${answer}.${accurate ? "" : " The sector only looks like a quarter circle."}`,
          steps: [
            `Fraction shaded: ${areaText} ÷ ${piFraction(r * r)} = ${S.frac(c, 360)}.`,
            `Circumference: ${piFraction(2 * r)}.`,
            `Arc ${nA}${nB} = ${S.frac(c, 360)} × ${piFraction(2 * r)} = ${answer}.`,
          ],
          principles,
          trap: accurate
            ? "The area and the arc are the same fraction of different wholes; dividing the area by r skips the factor of 2 in A = rs/2."
            : "The sector looks like a quarter circle in the figure, which is not drawn to scale; the fraction comes from the given area.",
          verify: () => {
            const turn = (c / 180) * Math.PI;
            return close(polygonSector(r, turn), (c * r * r * Math.PI) / 360, 1e-5) && close(polylineArc(r, turn), (c * r * Math.PI) / 180, 1e-5);
          },
        };
      }

      // plain: angle given as a radian number with no π.
      // Not to scale, the sector is drawn as a quarter circle, so the true angle
      // stays within about 35° of 90° (1 to 2 radians).
      const accurate = toScale;
      const theta = t.pick(accurate ? PLAIN_RADIANS : [1, 1.1, 1.2, 1.9, 2]);
      const r = t.int(2, 12);
      const arcValue = round4(r * theta);
      const areaValue = round4((r * r * theta) / 2);
      const askArea = t.chance(0.55);
      const answer = askArea ? areaValue : arcValue;
      if (!fitsGridHard(answer)) return this.build(t);
      const numeric = t.chance(0.6);
      const start = t.int(10, 60);
      const drawn = accurate ? toDeg(theta) : t.int(87, 93);
      const points = { [nA]: start, [nB]: start + drawn };
      const Ap = circlePoint(points[nA]);
      const Bp = circlePoint(points[nB]);
      const parts = [wedge(start, start + drawn)].concat(circleBase(points, [["O", nA], ["O", nB]]), [
        segHard(O, Ap),
        segHard(O, Bp),
        sideLabel(O, Ap, Bp, num(r), 12),
      ]);
      const alt =
        `Circle with center O and radii O${nA} and O${nB}; sector ${nA}O${nB} is shaded and radius O${nA} is labeled ${r}. ` +
        (accurate ? "The figure is drawn to scale." : "The shaded sector is drawn as a quarter of the circle.");
      const tenths = Math.round(theta * 10);
      const wrong = distinctWrong(
        answer,
        askArea
          ? [
            [accurate ? null : piFraction(r * r, 4), "Treats the shaded sector as a quarter circle, as it looks in the figure; the figure is not drawn to scale."],
            [arcValue, "Computes the arc length rθ instead of the sector's area."],
            [round4(r * r * theta), "Uses r²θ, dropping the factor 1/2 in the sector-area formula."],
            [piFraction(tenths * r * r, 3600), `Treats ${num(theta)} as a degree measure and uses (θ/360)πr².`],
          ]
          : [
            [accurate ? null : piFraction(r, 2), "Treats the arc as a quarter of the circle, as it looks in the figure; the figure is not drawn to scale."],
            [areaValue, "Computes the sector's area instead of the arc length."],
            [piFraction(tenths * 2 * r, 3600), `Treats ${num(theta)} as a degree measure and uses (θ/360)2πr.`],
            [round4(r * r * theta), "Multiplies by r² instead of r."],
          ],
      );
      if (!numeric && wrong.length < 3) return this.build(t);
      return {
        responseType: numeric ? "numeric" : "multiple-choice",
        estimatedSeconds: 95,
        stimulus: null,
        figure: { svg: S.svg(400, 300, parts, alt), alt, notToScale: !accurate },
        stem: `In the circle shown with center O, angle ${nA}O${nB} measures ${num(theta)} radians. What is the ${askArea ? "area of the shaded sector" : `length of minor arc ${nA}${nB}`}?`,
        correct: answer,
        wrong,
        hint: "Is the given angle in degrees or radians, and which formula expects that unit?",
        explanation: askArea
          ? `With the angle in radians, the sector's area is r²θ/2 = (${r})²(${num(theta)})/2 = ${num(areaValue)}. The angle is about ${Math.round(toDeg(theta))}°${accurate ? "." : ", not the 90° it appears to be."}`
          : `With the angle in radians, arc length is s = rθ = ${r} × ${num(theta)} = ${num(arcValue)}. The angle is about ${Math.round(toDeg(theta))}°${accurate ? "." : ", not the 90° it appears to be."}`,
        steps: askArea
          ? [`The angle ${num(theta)} is in radians (no degree sign).`, "Sector area in radians: A = r²θ/2.", `A = ${r * r} × ${num(theta)} ÷ 2 = ${num(areaValue)}.`]
          : [`The angle ${num(theta)} is in radians (no degree sign).`, "Arc length in radians: s = rθ.", `s = ${r} × ${num(theta)} = ${num(arcValue)}.`],
        principles,
        trap: accurate
          ? `${num(theta)} radians is about ${Math.round(toDeg(theta))}°; treating ${num(theta)} as degrees gives a tiny multiple of π, and mixing up arc length and sector area answers the other question.`
          : `The sector is drawn as a quarter circle, but the figure is not drawn to scale; ${num(theta)} radians is about ${Math.round(toDeg(theta))}°. Treating ${num(theta)} as degrees gives a tiny multiple of π.`,
        verify: () =>
          askArea ? close(polygonSector(r, theta), areaValue, 1e-5) : close(polylineArc(r, theta), arcValue, 1e-5),
      };
    },
  };

  const circleCompleteSquare = {
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

  /* ========================================= circle-measure-convert (Easy) */

  const CONVERT_SCENES = [
    { thing: "circle", units: null },
    { thing: "circle", units: "centimeters" },
    { thing: "circular fountain", units: "feet" },
    { thing: "circular tabletop", units: "inches" },
    { thing: "circular flower bed", units: "meters" },
  ];

  const measureConvert = {
    id: "circle-measure-convert",
    domain: GEO,
    skill: "Circles",
    subskill: "circle measures",
    difficulty: "Easy",
    title: "From one circle measure to another",
    recognize:
      "Every circle measure comes from the radius: undo the given formula to find r (circumference 2πr, area πr²), then " +
      "apply the formula for the measure asked.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "intermediate-value", "neighbouring-rule"],
    build(t) {
      const [givenKind, asked] = t.pick([["C", "A"], ["C", "A"], ["A", "C"], ["A", "C"], ["C", "r"], ["A", "r"], ["A", "d"]]);
      const scene = t.pick(CONVERT_SCENES);
      const wantNumeric = t.chance(asked === "A" || asked === "C" ? 0.2 : 0.5);
      return retry(() => {
        const r = t.int(2, 15);
        const u = scene.units;
        const linear = u ? ` ${u}` : "";
        const square = u ? ` square ${u}` : "";
        const given = givenKind === "C"
          ? `${scene.thing === "circle" ? "A circle has" : `A ${scene.thing} has`} a circumference of ${piText(2 * r)}${linear}.`
          : `${scene.thing === "circle" ? "A circle has" : `A ${scene.thing} has`} an area of ${piText(r * r)}${square}.`;
        const what = { A: "area", C: "circumference", r: "radius", d: "diameter" }[asked];
        const of = scene.thing === "circle" ? "circle" : scene.thing.replace("circular ", "");
        const unitNote = u ? `, in ${asked === "A" ? `square ${u}` : u},` : "";
        const coefficient = { A: r * r, C: 2 * r, r, d: 2 * r }[asked];
        const piAnswer = asked === "A" || asked === "C";
        const numeric = wantNumeric;
        const stem = piAnswer && numeric
          ? `${given} The ${what} of the ${of} is kπ${asked === "A" ? square : linear}. What is the value of k?`
          : `${given} What is the ${what}${unitNote} of the ${of}?`;
        const show = (value) => (piAnswer ? (Number.isInteger(value) && value > 0 ? piText(value) : null) : shown(value, 1));
        const candidates = {
          "C>A": [
            [show(4 * r * r), `Takes ${2 * r}, the diameter, as the radius; the circumference is 2πr, so the radius is ${r}.`],
            [show(r), `Finds the radius, ${r}, but multiplies it by π without squaring it.`],
            [show(2 * r * r), "Multiplies r² by 2, mixing the circumference formula into the area formula."],
          ],
          "A>C": [
            [show(2 * r * r), `Doubles ${r * r} instead of doubling the radius; ${r * r} is r², not r.`],
            [show(r), "Finds the radius but leaves out the 2 in 2πr."],
            [show(4 * r), "Doubles the radius and then uses 2πr, doubling twice."],
          ],
          "C>r": [
            [show(2 * r), `Gives ${2 * r}, the diameter; the circumference is 2πr, so the radius is half of ${2 * r}.`],
            [show(4 * r), "Multiplies by 2 instead of dividing by 2."],
            [Number.isInteger(Math.sqrt(2 * r)) ? show(Math.sqrt(2 * r)) : show(r * r), Number.isInteger(Math.sqrt(2 * r))
              ? `Takes the square root of ${2 * r}, as if the circumference were an area.`
              : "Squares the radius, which gives the coefficient of π in the area."],
          ],
          "A>r": [
            [show((r * r) / 2), `Halves ${r * r} instead of taking its square root.`],
            [show(2 * r), "Gives the diameter instead of the radius."],
            [show(r * r), `Gives ${r * r}, which is r², not r.`],
          ],
          "A>d": [
            [show(r), "Gives the radius instead of the diameter."],
            [show(2 * r * r), `Doubles ${r * r}, which is r², instead of doubling the radius.`],
            [show(r * r), `Gives ${r * r}, which is r², not the diameter.`],
            [show((r * r) / 2), `Halves ${r * r} instead of taking its square root.`],
          ],
        }[`${givenKind}>${asked}`];
        const keyText = piAnswer ? piText(coefficient) : fmt(coefficient);
        const findR = givenKind === "C" ? `2πr = ${piText(2 * r)}, so r = ${r}` : `πr² = ${piText(r * r)}, so r² = ${r * r} and r = ${r}`;
        const finish = {
          A: `The area is π(${r})² = ${piText(r * r)}`,
          C: `The circumference is 2π(${r}) = ${piText(2 * r)}`,
          r: `The radius is ${r}`,
          d: `The diameter is 2(${r}) = ${2 * r}`,
        }[asked];
        return pack(numeric, coefficient, keyText, candidates, {
          stimulus: null,
          figure: null,
          stem,
          explanation: `${findR}. ${finish}${piAnswer && numeric ? `, so k = ${coefficient}` : ""}.`,
          steps: [
            `Find the radius: ${findR}.`,
            `${finish}${piAnswer && numeric ? `, so k = ${coefficient}` : ""}.`,
          ],
          principles: ["A circle's circumference is 2πr and its area is πr², where r is the radius; the diameter is 2r."],
          trap: givenKind === "C"
            ? `${2 * r} is the diameter, not the radius: the circumference is 2πr.`
            : `${r * r} is r², not r: take its square root to get the radius.`,
          hint: "What is the radius of the circle?",
          estimatedSeconds: 60,
          verify: () => {
            // Invert the measure of a many-sided regular polygon instead of the formulas.
            const unitPolygon = polygonCircle(1);
            const rho = givenKind === "C"
              ? (2 * r * Math.PI) / unitPolygon.perimeter
              : Math.sqrt((r * r * Math.PI) / unitPolygon.area);
            const measured = {
              A: (rho * rho * unitPolygon.area) / Math.PI,
              C: (rho * unitPolygon.perimeter) / Math.PI,
              r: rho,
              d: 2 * rho,
            }[asked];
            return close(measured, coefficient, 1e-6);
          },
        });
      });
    },
  };

  /* ================================== tangent-radius-right-angle (Medium) */

  const TANGENT_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 12, 15], [6, 8, 10]];

  const tangentRadius = {
    id: "tangent-radius-right-angle",
    domain: GEO,
    skill: "Circles",
    subskill: "circle measures",
    difficulty: "Medium",
    title: "Tangent line and radius",
    recognize:
      "A radius drawn to the point of tangency is perpendicular to the tangent line, so the center, the point of tangency, " +
      "and a point on the tangent line form a right triangle whose hypotenuse runs from the center to the outside point.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["intermediate-value", "neighbouring-rule", "wrong-quantity"],
    build(t) {
      const form = t.pick(["hyp", "hyp", "leg", "leg", "radius", "outside", "outside"]);
      const numericWanted = t.chance(0.35);
      const inStem = t.chance(0.4);
      return retry(() => {
        let r;
        let tan;
        let oq;
        if ((form === "hyp" || form === "leg") && t.chance(0.3)) {
          // Not a Pythagorean triple: the answer is a radical.
          if (form === "hyp") {
            r = t.int(2, 12);
            tan = t.int(2, 15);
            oq = Math.hypot(r, tan);
          } else {
            oq = t.int(5, 20);
            r = t.int(2, oq - 2);
            tan = Math.sqrt(oq * oq - r * r);
          }
        } else {
          const [a, b, c] = t.pick(TANGENT_TRIPLES);
          const k = c <= 10 ? t.int(1, 3) : 1;
          [r, tan] = t.chance(0.5) ? [a * k, b * k] : [b * k, a * k];
          oq = c * k;
        }
        const oqText = surd(oq);
        const tanText = surd(tan);
        if (!oqText || !tanText || r === tan) return null;
        // Model: O at the origin, P on the circle, Q along the tangent at P.
        const phi = toRad(t.int(0, 359));
        const dir = t.chance(0.5) ? 1 : -1;
        const O2 = [0, 0];
        const Pm = [r * Math.cos(phi), r * Math.sin(phi)];
        const along = [-Math.sin(phi) * dir, Math.cos(phi) * dir];
        const Qm = add(Pm, mul(along, tan));
        const Rm = mul(Qm, r / dist(O2, Qm));
        const reach = Math.max(tan, 0.8 * r);
        const startM = add(Pm, mul(along, -0.45 * reach));
        const endM = add(Qm, mul(along, 0.3 * reach));
        const map = fitPoints([[-r, -r], [r, r], startM, endM], 400, 270, 36);
        const [Os, Ps, Qs, Rs] = [O2, Pm, Qm, Rm].map(map);
        const radius = dist(map([0, 0]), map([r, 0]));
        const lineStart = map(startM);
        const lineEnd = map(endM);
        const parts = [
          P.circle(Os[0], Os[1], radius),
          seg(lineStart, lineEnd, 1.8),
          seg(Os, Ps, 1.8),
          seg(Os, Qs, 1.8),
          dotAt(Os), dotAt(Ps), dotAt(Qs),
          name(add(Os, mul(unit(sub(Os, mid(Ps, Qs))), 16)), "O"),
          name(add(Ps, mul(unit(sub(Ps, Os)), 16)), "P"),
          name(add(Qs, mul(normalAway(Ps, Qs, Os), 15)), "Q"),
          name(add(lineEnd, add(mul(unit(sub(lineEnd, lineStart)), 10), mul(normalAway(Ps, Qs, Os), 10))), "ℓ"),
        ];
        if (form === "outside") parts.push(dotAt(Rs), name(add(Rs, mul(normalAway(Os, Qs, Ps), 14)), "R"));
        const labels = { OP: [Os, Ps, Qs], PQ: [Ps, Qs, Os], OQ: [Os, Qs, Ps] };
        const givenPairs = { hyp: ["OP", "PQ"], leg: ["OP", "OQ"], radius: ["PQ", "OQ"], outside: ["OP", "PQ"] }[form];
        const lengthOf = { OP: fmt(r), PQ: tanText, OQ: oqText };
        if (!inStem) givenPairs.forEach((segment) => parts.push(sideLabel(...labels[segment], lengthOf[segment])));
        const alt =
          `A circle with center O. Line ℓ touches the circle at point P, and point Q lies on ℓ. Segments OP and OQ are drawn` +
          (form === "outside" ? `, and OQ crosses the circle at point R` : "") + "." +
          (inStem ? "" : ` ${givenPairs.map((segment) => `${segment} is labeled ${lengthOf[segment]}`).join(" and ")}.`) +
          " The figure is drawn to scale.";
        const figure = { svg: S.svg(400, 270, parts, alt), alt, notToScale: false };
        const lead = "In the figure shown, line ℓ is tangent to the circle with center O at point P, and point Q lies on ℓ.";
        const facts = {
          hyp: `The radius of the circle is ${r}, and PQ = ${tanText}.`,
          leg: `The radius of the circle is ${r}, and OQ = ${oqText}.`,
          radius: `PQ = ${tanText} and OQ = ${oqText}.`,
          outside: `The radius of the circle is ${r}, and PQ = ${tanText}.`,
        }[form];
        const diameterAsk = form === "radius" && t.chance(0.4);
        const question = {
          hyp: "What is the length of OQ?",
          leg: "What is the length of PQ?",
          radius: `What is the ${diameterAsk ? "diameter" : "radius"} of the circle?`,
          outside: "Segment OQ intersects the circle at point R. What is the length of QR?",
        }[form];
        const key = { hyp: oq, leg: tan, radius: diameterAsk ? 2 * r : r, outside: oq - r }[form];
        const keyText = surd(key);
        const numeric = numericWanted && Number.isInteger(key);
        const sq = (value) => surd(Math.sqrt(value));
        const candidates = {
          hyp: [
            [surd(r + tan), `Adds the radius and PQ; OQ is the hypotenuse of right triangle OPQ, so the squares add, not the lengths.`],
            [sq(Math.abs(tan * tan - r * r)), "Subtracts the squares, as if OQ were a leg; OQ is across from the right angle at P."],
            [sq(tan * tan + 4 * r * r), "Uses the diameter instead of the radius as a leg."],
            [surd(tan), "Gives PQ, which is only one leg of the right triangle."],
          ],
          leg: [
            [surd(oq - r), "Subtracts the lengths instead of their squares."],
            [sq(oq * oq + r * r), "Adds the squares, as if PQ were the hypotenuse; OQ is across from the right angle at P."],
            [oq * oq > 4 * r * r ? sq(oq * oq - 4 * r * r) : null, "Uses the diameter instead of the radius as a leg."],
            [surd(oq + r), "Adds the radius to OQ."],
          ],
          radius: diameterAsk
            ? [
              [surd(r), "Gives the radius instead of the diameter."],
              [surd(2 * (oq - tan)), "Subtracts the lengths instead of their squares, then doubles."],
              [sq(4 * (oq * oq + tan * tan)), "Adds the squares, as if OQ were a leg, then doubles."],
            ]
            : [
              [surd(oq - tan), "Subtracts the lengths instead of their squares."],
              [sq(oq * oq + tan * tan), "Adds the squares, as if OQ were a leg; OQ is across from the right angle at P."],
              [surd(2 * r), "Gives the diameter instead of the radius."],
            ],
          outside: [
            [surd(oq), `Finds OQ = ${oqText} and stops; R is on the circle, so QR is OQ minus a radius.`],
            [tan > r ? surd(tan - r) : null, "Subtracts the radius from PQ instead of from OQ."],
            [oq > 2 * r ? surd(oq - 2 * r) : null, "Subtracts the diameter instead of the radius."],
            [surd(tan), "Gives PQ, the distance along the tangent line, instead of QR."],
          ],
        }[form];
        const squared = (text) => (text.includes("√") ? `(${text})²` : `${text}²`);
        const pyth = {
          hyp: `OQ² = ${r}² + ${squared(tanText)} = ${r * r + Math.round(tan * tan)}, so OQ = ${oqText}`,
          leg: `PQ² = ${squared(oqText)} − ${r}² = ${Math.round(tan * tan)}, so PQ = ${tanText}`,
          radius: `r² = ${squared(oqText)} − ${squared(tanText)} = ${r * r}, so r = ${r}`,
          outside: `OQ² = ${r}² + ${squared(tanText)} = ${Math.round(oq * oq)}, so OQ = ${oqText}`,
        }[form];
        const last = {
          hyp: null,
          leg: null,
          radius: diameterAsk ? `The diameter is 2 × ${r} = ${2 * r}.` : null,
          outside: `R is on the circle, so OR = ${r} and QR = ${oqText} − ${r} = ${keyText}.`,
        }[form];
        return pack(numeric, key, keyText, candidates, {
          stimulus: null,
          figure,
          stem: `${lead} ${inStem ? `${facts} ` : ""}${question}`,
          explanation:
            `A radius drawn to a point of tangency is perpendicular to the tangent line, so angle OPQ is a right angle and OQ is the hypotenuse of right triangle OPQ. ` +
            `${pyth}.${last ? ` ${last}` : ""}`,
          steps: [
            "OP is a radius to the point of tangency, so OP ⊥ ℓ and triangle OPQ has its right angle at P.",
            `${pyth}.`,
            ...(last ? [last] : []),
          ],
          principles: [
            "A radius drawn to the point of tangency is perpendicular to the tangent line.",
            "In a right triangle with legs a and b and hypotenuse c, a² + b² = c².",
          ],
          trap: form === "outside"
            ? `OQ = ${oqText} runs to the center; the part outside the circle is OQ minus the radius.`
            : "The right angle is at P, where the radius meets the tangent line, so OQ is the hypotenuse.",
          hint: "What angle does the radius OP make with line ℓ?",
          estimatedSeconds: 95,
          verify: () => {
            const perpendicular = Math.abs(dot(sub(Pm, O2), sub(Qm, Pm))) < 1e-9;
            const measured = { hyp: dist(O2, Qm), leg: dist(Pm, Qm), radius: (diameterAsk ? 2 : 1) * dist(O2, Pm), outside: dist(Qm, Rm) }[form];
            return perpendicular && close(dist(O2, Rm), r) && close(measured, surdValue(keyText), 1e-9);
          },
        });
      });
    },
  };

  return [circleMeasure, measureConvert, circleEquation, tangentRadius, arcSector, circleCompleteSquare];
});
