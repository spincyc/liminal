(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/geometry-and-trigonometry"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Right triangles and trigonometry templates (Geometry and Trigonometry), ordered Easy, Medium, Hard.

  const { MINUS, num, frac } = S;
  const {
    P, GEO, tidy, isClean, fitsGrid, fmt, shown, retry, fractionValue, radical, surd, surdValue, piFraction,
    add, sub, mul, unit, lerp, mid, dist, toRad, centroid, close, angleAt, shoelace, fitPoints, seg, measure,
    unitText, name, nameAway, anchorFor, normalAway, sideLabel, angleArc, angleLabel, rightMark, DOMAIN,
    packSpread, wrongFor,
  } = C;

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

  /* ===================================== right-triangle-ratio-read (Easy) */

  const RATIO_TRIPLES = [[3, 4, 5, 4], [5, 12, 13, 2], [8, 15, 17, 1], [7, 24, 25, 1], [20, 21, 29, 1]];

  const RATIO_NAMES = [["A", "B", "C"], ["P", "Q", "R"], ["J", "K", "L"], ["X", "Y", "Z"], ["D", "E", "F"], ["R", "S", "T"]];

  const TRIG = {
    sin: (o, a, h) => [o, h],
    cos: (o, a, h) => [a, h],
    tan: (o, a, h) => [o, a],
  };

  /* ====================================== pythagorean-two-step (Medium) */

  const PYTH_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];

  /* ===================================== trig ratios, similarity, cofunction */

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

  const ratioRead = {
    id: "right-triangle-ratio-read",
    domain: GEO,
    skill: "Right triangles and trigonometry",
    subskill: "trigonometric ratios",
    difficulty: "Easy",
    title: "Sine, cosine, or tangent from side lengths",
    recognize:
      "Stand at the named angle: the opposite leg does not touch it, the adjacent leg does, and the hypotenuse is across from " +
      "the right angle; sine = opposite/hypotenuse, cosine = adjacent/hypotenuse, tangent = opposite/adjacent.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "wrong-quantity"],
    build(t) {
      const withFigure = t.chance(0.65);
      const wantNumeric = t.chance(0.3);
      return retry(() => {
        const [x, y, z, maxScale] = t.pick(RATIO_TRIPLES);
        const scale = t.int(1, maxScale);
        const [leg1, leg2] = t.chance(0.5) ? [x * scale, y * scale] : [y * scale, x * scale];
        const hyp = z * scale;
        const names = t.shuffle(t.pick(RATIO_NAMES));
        const [Rn, Un, Vn] = names; // right angle at Rn; leg1 = Rn–Un, leg2 = Rn–Vn
        const fn = t.pick(["sin", "cos", "tan"]);
        const atU = t.chance(0.5);
        const angle = atU ? Un : Vn;
        // At U, the opposite leg is R–V (leg2) and the adjacent leg is R–U (leg1).
        const opp = atU ? leg2 : leg1;
        const adj = atU ? leg1 : leg2;
        const [top, bottom] = TRIG[fn](opp, adj, hyp);
        const keyText = frac(top, bottom);
        const value = top / bottom;
        const numeric = wantNumeric && fitsGrid(value) && isClean(value, 3);
        // Every item offers the same four ratios, opposite or adjacent over
        // hypotenuse or over the other leg (sin, cos, tan, and the tangent of the
        // other angle), so no choice stands out by sharing more sides with the rest.
        const choicesFor = {
          sin: [
            [frac(adj, hyp), `Uses the leg adjacent to angle ${angle}; that ratio is cos ${angle}.`],
            [frac(opp, adj), `Divides by the adjacent leg instead of the hypotenuse; that ratio is tan ${angle}.`],
            [frac(adj, opp), `Divides the adjacent leg by the opposite leg; that ratio is the tangent of the other acute angle.`],
          ],
          cos: [
            [frac(opp, hyp), `Uses the leg opposite angle ${angle}; that ratio is sin ${angle}.`],
            [frac(adj, opp), "Divides the adjacent leg by the opposite leg instead of by the hypotenuse."],
            [frac(opp, adj), `Divides the two legs; that ratio is tan ${angle}, not cos ${angle}.`],
          ],
          tan: [
            [frac(adj, opp), `Inverts the ratio: adjacent over opposite is the tangent of the other acute angle.`],
            [frac(opp, hyp), `Divides by the hypotenuse; that ratio is sin ${angle}.`],
            [frac(adj, hyp), `Uses the adjacent leg over the hypotenuse; that ratio is cos ${angle}.`],
          ],
        }[fn];
        const sidesText = `${Rn}${Un} = ${leg1}, ${Rn}${Vn} = ${leg2}, and ${Un}${Vn} = ${hyp}`;
        let figure = null;
        // Ordinary coordinates: right angle at the origin, legs on the axes.
        const Rm = [0, 0];
        const Um = [leg1, 0];
        const Vm = [0, leg2];
        if (withFigure) {
          const tilt = t.chance(0.35);
          const flip = t.chance(0.5);
          let pts = [Rm, Um, Vm].map(([px, py]) => [flip ? -px : px, py]);
          if (tilt) {
            // Rotate so the hypotenuse is horizontal with the right angle above it.
            const d = sub(pts[2], pts[1]);
            const turn = -Math.atan2(d[1], d[0]);
            pts = pts.map(([px, py]) => [px * Math.cos(turn) - py * Math.sin(turn), px * Math.sin(turn) + py * Math.cos(turn)]);
            if (pts[0][1] < pts[1][1]) pts = pts.map(([px, py]) => [px, -py]);
          }
          const map = fitPoints(pts, 400, 260, 46);
          const [Rs, Us, Vs] = pts.map(map);
          const G = centroid([Rs, Us, Vs]);
          const parts = [
            P.polygon([Rs, Us, Vs]),
            rightMark(Rs, Us, Vs),
            nameAway(Rs, G, Rn), nameAway(Us, G, Un), nameAway(Vs, G, Vn),
            sideLabel(Rs, Us, G, num(leg1)), sideLabel(Rs, Vs, G, num(leg2)), sideLabel(Us, Vs, G, num(hyp)),
          ];
          const alt = `Right triangle ${Rn}${Un}${Vn} with the right angle at ${Rn} marked. Side lengths: ${sidesText}. The figure is drawn to scale.`;
          figure = { svg: S.svg(400, 260, parts, alt), alt, notToScale: false };
        }
        const stem = withFigure
          ? `In right triangle ${Rn}${Un}${Vn} shown, what is the value of ${fn} ${angle}?`
          : `In triangle ${Rn}${Un}${Vn}, angle ${Rn} is a right angle, ${sidesText}. What is the value of ${fn} ${angle}?`;
        const oppName = atU ? `${Rn}${Vn}` : `${Rn}${Un}`;
        const adjName = atU ? `${Rn}${Un}` : `${Rn}${Vn}`;
        const ratioWords = { sin: "opposite/hypotenuse", cos: "adjacent/hypotenuse", tan: "opposite/adjacent" }[fn];
        // "8/17", or "6/10 = 3/5" when the ratio reduces.
        const ratioValue = `${top}/${bottom}` === keyText ? keyText : `${top}/${bottom} = ${keyText}`;
        return packSpread(t, numeric, tidy(value), keyText, choicesFor, {
          stimulus: null,
          figure,
          stem,
          explanation:
            `From angle ${angle}, the opposite leg is ${oppName} = ${opp}, the adjacent leg is ${adjName} = ${adj}, and the hypotenuse is ${Un}${Vn} = ${hyp}. ` +
            `${fn} ${angle} = ${ratioWords} = ${ratioValue}.`,
          steps: [
            `The hypotenuse is across from the right angle: ${Un}${Vn} = ${hyp}.`,
            `From angle ${angle}: opposite ${oppName} = ${opp}, adjacent ${adjName} = ${adj}.`,
            `${fn} ${angle} = ${ratioWords} = ${ratioValue}.`,
          ],
          principles: [
            "In a right triangle, sin = opposite/hypotenuse, cos = adjacent/hypotenuse, and tan = opposite/adjacent, all measured from the named acute angle.",
          ],
          trap: `The legs swap roles at the other acute angle: the leg opposite ${angle} is adjacent to the other one.`,
          hint: `Which leg touches angle ${angle}, and which does not?`,
          estimatedSeconds: 55,
          verify: () => {
            const vertex = atU ? Um : Vm;
            const other = atU ? Vm : Um;
            const theta = toRad(angleAt(vertex, Rm, other));
            return close(Math[fn](theta), fractionValue(keyText)) && close(dist(Um, Vm), hyp);
          },
        });
      });
    },
  };

  const pythagoreanTwoStep = {
    id: "pythagorean-two-step",
    domain: GEO,
    skill: "Right triangles and trigonometry",
    subskill: "Pythagorean theorem",
    difficulty: "Medium",
    title: "A missing side, then a measure",
    recognize:
      "Find the right triangle first (a diagonal splits a rectangle into two; an altitude splits an isosceles triangle into " +
      "two with half the base), use a² + b² = c² for the missing side, then compute what was asked.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["intermediate-value", "neighbouring-rule", "part-vs-whole"],
    build(t) {
      const form = t.pick(["rectangle", "isosceles", "rhombus"]);
      const numeric = t.chance(0.4);
      const principles = [
        "In a right triangle with legs a and b and hypotenuse c, a² + b² = c².",
        "A diagonal of a rectangle is the hypotenuse of a right triangle whose legs are the length and the width.",
      ];
      // Slips that halve or double the key look alike with it. Offering all
      // of them made the key the one choice paired with others, so an item
      // offers at most one (in 60% of items) or none.
      const halving = t.chance(0.6) ? t.int(0, 1) : -1;
      const twin = (index, entry) => (index === halving ? entry : [null, entry[1]]);
      return retry(() => {
        const names = t.pick([["A", "B", "C", "D"], ["P", "Q", "R", "S"], ["J", "K", "L", "M"], ["E", "F", "G", "H"]]);
        const [A, B, C, D] = names;
        if (form === "rectangle") {
          const [x, y, z] = t.pick(PYTH_TRIPLES);
          const k = z <= 13 ? t.int(1, 4) : 1;
          const [L, w] = t.chance(0.5) ? [x * k, y * k] : [y * k, x * k];
          const d = z * k;
          const askArea = t.chance(0.5);
          const key = askArea ? L * w : 2 * (L + w);
          // A at bottom-left, B bottom-right, C top-right, D top-left.
          const Am = [0, 0]; const Bm = [L, 0]; const Cm = [L, w]; const Dm = [0, w];
          const map = fitPoints([Am, Bm, Cm, Dm], 400, 250, 44);
          const [As, Bs, Cs, Ds] = [Am, Bm, Cm, Dm].map(map);
          const G = centroid([As, Bs, Cs, Ds]);
          const n = normalAway(As, Cs, Bs);
          const parts = [
            P.polygon([As, Bs, Cs, Ds]),
            seg(As, Cs, 1.5),
            rightMark(Bs, As, Cs.map((value, index) => (index === 0 ? Bs[0] : value)), 10),
            nameAway(As, G, A), nameAway(Bs, G, B), nameAway(Cs, G, C), nameAway(Ds, G, D),
            measure(add(mid(As, Bs), [0, 17]), num(L)),
            measure(add(mid(As, Cs), mul(n, 11)), num(d), anchorFor(n)),
          ];
          const alt = `Rectangle ${A}${B}${C}${D} with ${A}${B} along the bottom labeled ${L} and diagonal ${A}${C} labeled ${d}. The figure is drawn to scale.`;
          return packSpread(t, numeric, key, fmt(key), askArea
            ? [
              [shown(L * d, 0), `Uses the diagonal, ${d}, as the width.`],
              [shown(w, 0), `Stops at the width, ${w}.`],
              twin(0, [shown((L * w) / 2, 1), "Takes half of length × width, the area of one of the triangles."]),
              [shown(2 * (L + w), 0), "Gives the perimeter instead of the area."],
              [shown(d * w, 0), `Multiplies the diagonal by the width, using ${d} in place of the length ${L}.`],
            ]
            : [
              [shown(2 * (L + d), 0), `Uses the diagonal, ${d}, as the width.`],
              twin(0, [shown(L + w, 0), "Adds one length and one width, which is half the perimeter."]),
              [shown(w, 0), `Stops at the width, ${w}.`],
              [shown(L * w, 0), "Gives the area instead of the perimeter."],
              [shown(L + w + d, 0), `Adds the sides of triangle ${A}${B}${C} instead of the four sides of the rectangle.`],
              [shown(2 * (L + d + w), 0), "Adds the diagonal to the length and width before doubling."],
            ], {
            stimulus: null,
            figure: { svg: S.svg(400, 250, parts, alt), alt, notToScale: false },
            stem: `In rectangle ${A}${B}${C}${D} shown, ${A}${B} = ${L} and diagonal ${A}${C} = ${d}. What is the ${askArea ? "area" : "perimeter"} of the rectangle?`,
            explanation:
              `Triangle ${A}${B}${C} has a right angle at ${B}, so ${B}${C}² = ${d}² ${MINUS} ${L}² = ${fmt(d * d)} ${MINUS} ${fmt(L * L)} = ${fmt(w * w)}, and ${B}${C} = ${w}. ` +
              (askArea ? `The area is ${L} × ${w} = ${key}.` : `The perimeter is 2(${L} + ${w}) = ${key}.`),
            steps: [
              `The diagonal makes right triangle ${A}${B}${C} with legs ${A}${B} and ${B}${C}.`,
              `${B}${C} = √(${d}² ${MINUS} ${L}²) = √${w * w} = ${w}.`,
              askArea ? `Area = ${L} × ${w} = ${key}.` : `Perimeter = 2(${L} + ${w}) = ${key}.`,
            ],
            principles,
            trap: `The width ${w} is a step on the way; the diagonal ${d} is not a side.`,
            hint: "Which right triangle in the rectangle contains the diagonal?",
            estimatedSeconds: 95,
            verify: () => close(dist(Am, Cm), d) &&
              close(askArea ? shoelace([Am, Bm, Cm, Dm]) : dist(Am, Bm) + dist(Bm, Cm) + dist(Cm, Dm) + dist(Dm, Am), key),
          });
        }
        if (form === "isosceles") {
          const [x, y, z] = t.pick(PYTH_TRIPLES);
          const k = z <= 13 ? t.int(1, 4) : 1;
          const [half, h] = t.chance(0.5) ? [x * k, y * k] : [y * k, x * k];
          const s = z * k;
          const base = 2 * half;
          const key = half * h;
          const Bm = [0, 0]; const Cm = [base, 0]; const Am = [half, h];
          const map = fitPoints([Am, Bm, Cm], 400, 250, 44);
          const [As, Bs, Cs] = [Am, Bm, Cm].map(map);
          const G = centroid([As, Bs, Cs]);
          const parts = [
            P.polygon([As, Bs, Cs]),
            ticks(As, Bs), ticks(As, Cs),
            nameAway(As, G, A), nameAway(Bs, G, B), nameAway(Cs, G, C),
            sideLabel(As, Bs, G, num(s)), sideLabel(As, Cs, G, num(s)), sideLabel(Bs, Cs, G, num(base)),
          ];
          const alt = `Triangle ${A}${B}${C} with base ${B}${C} labeled ${base}; sides ${A}${B} and ${A}${C} are each labeled ${s} and marked congruent. The figure is drawn to scale.`;
          const fullBase = s > base && Number.isInteger(Math.sqrt(s * s - base * base)) ? (base * Math.sqrt(s * s - base * base)) / 2 : null;
          return packSpread(t, numeric, key, fmt(key), [
            twin(0, [shown(base * h, 0), "Finds the height correctly but forgets the 1/2 in the area formula."]),
            [shown(half * s, 0), `Uses the side length ${s} as the height.`],
            [shown(h, 0), `Stops at the height, ${h}.`],
            [fullBase === null ? null : shown(fullBase, 1), `Uses the whole base, ${base}, instead of half of it, as a leg of the right triangle.`],
            [shown(2 * s + base, 0), "Gives the perimeter instead of the area."],
            twin(1, [shown((half * h) / 2, 1), "Multiplies half the base by the height and then takes half again."]),
          ], {
            stimulus: null,
            figure: { svg: S.svg(400, 250, parts, alt), alt, notToScale: false },
            stem: `In triangle ${A}${B}${C} shown, ${A}${B} = ${A}${C} = ${s} and ${B}${C} = ${base}. What is the area of triangle ${A}${B}${C}?`,
            explanation:
              `The altitude from ${A} meets ${B}${C} at its midpoint, making a right triangle with hypotenuse ${s} and one leg ${half}. ` +
              `The height is √(${s}² ${MINUS} ${half}²) = √${h * h} = ${h}, so the area is (1/2)(${base})(${h}) = ${key}.`,
            steps: [
              `The altitude from ${A} splits the base in half: ${base} ÷ 2 = ${half}.`,
              `Height = √(${s}² ${MINUS} ${half}²) = √${h * h} = ${h}.`,
              `Area = (1/2) × ${base} × ${h} = ${key}.`,
            ],
            principles: [
              principles[0],
              "In an isosceles triangle, the altitude to the base bisects the base.",
            ],
            trap: `The right triangle uses half the base, ${half}, and the height ${h} is only a step toward the area.`,
            hint: "Where does the height from the top vertex meet the base?",
            estimatedSeconds: 100,
            verify: () => close(dist(Am, Bm), s) && close(dist(Am, Cm), s) && close(shoelace([Am, Bm, Cm]), key),
          });
        }
        // Rhombus: the diagonals bisect each other at right angles, so half of
        // each diagonal and a side make a right triangle.
        const [x, y, z] = t.pick(PYTH_TRIPLES);
        const k = z <= 13 ? t.int(1, 3) : 1;
        const [hx, hy] = t.chance(0.5) ? [x * k, y * k] : [y * k, x * k];
        const side = z * k;
        const d1 = 2 * hx;
        const d2 = 2 * hy;
        const variant = t.pick(["perimeter", "diagonal", "area"]);
        const Am = [-hx, 0]; const Bm = [0, hy]; const Cm = [hx, 0]; const Dm = [0, -hy];
        const map = fitPoints([Am, Bm, Cm, Dm], 400, 250, 40);
        const [As, Bs, Cs, Ds] = [Am, Bm, Cm, Dm].map(map);
        const Os = mid(As, Cs);
        const G = Os;
        const parts = [
          P.polygon([As, Bs, Cs, Ds]),
          seg(As, Cs, 1.5), seg(Bs, Ds, 1.5),
          rightMark(Os, Cs, Bs, 10),
          nameAway(As, G, A), nameAway(Bs, G, B), nameAway(Cs, G, C), nameAway(Ds, G, D),
        ];
        const alt = `Rhombus ${A}${B}${C}${D} with its diagonals ${A}${C} and ${B}${D} drawn, crossing at a right angle. The figure is drawn to scale.`;
        const figure = { svg: S.svg(400, 250, parts, alt), alt, notToScale: false };
        const rhombusSteps = `The diagonals of a rhombus bisect each other at right angles, so half of ${A}${C} (${hx}), half of ${B}${D} (${hy}), and a side form a right triangle`;
        const common = {
          stimulus: null,
          figure,
          principles: [
            principles[0],
            "The diagonals of a rhombus are perpendicular and bisect each other; its area is half the product of the diagonals.",
          ],
          estimatedSeconds: 100,
          hint: "Where do the diagonals of a rhombus meet, and at what angle?",
        };
        if (variant === "perimeter") {
          const key = 4 * side;
          return packSpread(t, numeric, key, fmt(key), [
            twin(0, [shown(8 * side, 0), `Uses the whole diagonals, ${d1} and ${d2}, as the legs of the right triangle instead of half of each.`]),
            [shown(side, 0), `Stops at the length of one side, ${side}.`],
            [shown(2 * (d1 + d2), 0), "Takes each side to be the average of the two diagonals."],
            [shown((d1 * d2) / 2, 0), "Gives the area of the rhombus instead of its perimeter."],
            [shown(2 * (hx + hy), 0), "Adds the four half-diagonals, which run from the center, not around the rhombus."],
            [shown(4 * (hx + hy), 0), "Takes each side to be the sum of the half-diagonals instead of the hypotenuse of the right triangle they form."],
          ], {
            ...common,
            stem: `In rhombus ${A}${B}${C}${D} shown, the diagonals have lengths ${A}${C} = ${d1} and ${B}${D} = ${d2}. What is the perimeter of the rhombus?`,
            explanation: `${rhombusSteps}. Each side is √(${hx}² + ${hy}²) = √${side * side} = ${side}, so the perimeter is 4 × ${side} = ${key}.`,
            steps: [
              `${rhombusSteps}: legs ${hx} and ${hy}.`,
              `Side: √(${hx}² + ${hy}²) = ${side}.`,
              `Perimeter: 4 × ${side} = ${key}.`,
            ],
            trap: `The legs of the right triangle are half-diagonals, ${hx} and ${hy}, not ${d1} and ${d2}; and ${side} is one side, not the perimeter.`,
            verify: () => close(dist(Am, Bm) + dist(Bm, Cm) + dist(Cm, Dm) + dist(Dm, Am), key) && close(dist(Am, Cm), d1),
          });
        }
        if (variant === "diagonal") {
          const key = d2;
          const fullLeg = side * side - d1 * d1 > 0 ? Math.sqrt(side * side - d1 * d1) : null;
          return packSpread(t, numeric, key, fmt(key), [
            twin(0, [shown(hy, 0), `Finds half of ${B}${D}, ${hy}, and stops.`]),
            [fullLeg !== null ? shown(fullLeg, 0) : null, `Uses the whole diagonal ${A}${C} = ${d1}, not half of it, as a leg of the right triangle.`],
            [shown(2 * Math.sqrt(side * side + hx * hx), 0), "Adds the squares instead of subtracting them, as if the side were a leg."],
            [shown(d1, 0), "Assumes the two diagonals are equal, as they are in a square."],
            [shown(side + hx, 0), `Adds the side and half of ${A}${C} instead of using the Pythagorean theorem.`],
            [shown(2 * (side - hx), 0), `Subtracts the lengths, ${side} − ${hx}, instead of their squares, then doubles.`],
          ], {
            ...common,
            stem: `In rhombus ${A}${B}${C}${D} shown, each side has length ${side} and diagonal ${A}${C} has length ${d1}. What is the length of diagonal ${B}${D}?`,
            explanation: `${rhombusSteps}. Half of ${B}${D} is √(${side}² − ${hx}²) = √${hy * hy} = ${hy}, so ${B}${D} = 2 × ${hy} = ${key}.`,
            steps: [
              `${rhombusSteps}: hypotenuse ${side}, one leg ${hx}.`,
              `Other leg: √(${side}² − ${hx}²) = ${hy}.`,
              `${B}${D} = 2 × ${hy} = ${key}.`,
            ],
            trap: `${hy} is only half of ${B}${D}, and the right triangle uses half of ${A}${C}, ${hx}, not all of it.`,
            verify: () => close(dist(Am, Bm), side) && close(dist(Bm, Dm), key),
          });
        }
        const key = (d1 * d2) / 2;
        return packSpread(t, numeric, key, fmt(key), [
          twin(0, [shown(d1 * d2, 0), "Multiplies the diagonals without taking half."]),
          [shown(side * side, 0), "Squares the side, as if the rhombus were a square."],
          [shown((hx * hy) / 2, 1), "Multiplies the half-diagonals and takes half again; that is the area of one of the four right triangles."],
          [shown(side * d1, 0), `Multiplies the side by diagonal ${A}${C}, treating the diagonal as a height.`],
          [shown(side * d1 / 2, 1), `Takes half of the side times diagonal ${A}${C}.`],
        ], {
          ...common,
          stem: `In rhombus ${A}${B}${C}${D} shown, each side has length ${side} and diagonal ${A}${C} has length ${d1}. What is the area of the rhombus?`,
          explanation: `${rhombusSteps}. Half of ${B}${D} is √(${side}² − ${hx}²) = ${hy}, so ${B}${D} = ${d2}. The area is half the product of the diagonals: (1/2)(${d1})(${d2}) = ${fmt(key)}.`,
          steps: [
            `${rhombusSteps}: hypotenuse ${side}, one leg ${hx}; the other leg is ${hy}.`,
            `${B}${D} = 2 × ${hy} = ${d2}.`,
            `Area = (1/2)(${d1})(${d2}) = ${fmt(key)}.`,
          ],
          trap: "A rhombus is not a square: its area is half the product of its diagonals, not the square of its side.",
          verify: () => close(shoelace([Am, Bm, Cm, Dm]), key) && close(dist(Am, Bm), side),
        });
      });
    },
  };

  // Degree form: two angle expressions in x with sin of one equal to cos of
  // the other. Radian form: sin x = cos(mπ/n) with x acute.
  function cofunctionItem(t, form, numeric) {
    if (form === "radians") {
      for (;;) {
        // The given angle is under π/4, so x = π/2 − (given) is not the
        // smallest choice by default.
        const n = t.pick([5, 8, 9, 10, 12, 18]);
        const m = t.int(1, Math.floor((n - 1) / 4) || 1);
        if (4 * m >= n) continue;
        const given = piFraction(m, n);
        const key = piFraction(n - 2 * m, 2 * n);
        const presentation = t.int(0, 2);
        const equation = [`sin x = cos(${given})`, `cos x = sin(${given})`, `sin(${given}) − cos x = 0`][presentation];
        const wrong = wrongFor(t, false, key, [
          [given, "Sets x equal to the given angle, as if sine and cosine of one angle were equal."],
          [piFraction(n - m, n), "Makes the two angles supplementary (sum π) instead of complementary (sum π/2)."],
          [piFraction(n + 2 * m, 2 * n), presentation === 0
            ? `Adds the given angle to π/2; sin(${piFraction(n + 2 * m, 2 * n)}) does equal cos(${given}), but that angle is not between 0 and π/2.`
            : `Adds the given angle to π/2 instead of subtracting it; cos(${piFraction(n + 2 * m, 2 * n)}) is the negative of sin(${given}).`],
          [piFraction(1, 4), "Assumes sine equals cosine only when the angle is π/4."],
          [piFraction(2 * (n - m), n), "Subtracts the given angle from 2π, as if reflecting it across the x-axis."],
        ]);
        if (!wrong) continue;
        return {
          responseType: "multiple-choice",
          estimatedSeconds: 90,
          stimulus: { type: "equations", content: equation },
          figure: null,
          stem: "In the given equation, x is measured in radians and 0 < x < π/2. What is the value of x?",
          correct: key,
          wrong,
          hint: "In a right triangle, the sine of one acute angle is the cosine of which angle?",
          explanation:
            `For acute angles, sin A = cos B exactly when A + B = π/2. So x + ${given} = π/2, and x = π/2 − ${given} = ${key}.`,
          steps: [
            "Sine of an acute angle equals cosine of its complement: sin x = cos(π/2 − x).",
            `x + ${given} = π/2.`,
            `x = π/2 − ${given} = ${key}.`,
          ],
          principles: [
            "sin θ = cos(π/2 − θ) for every angle θ; in degrees, sin θ = cos(90° − θ).",
            "For two acute angles, sin A = cos B exactly when A + B = π/2.",
          ],
          trap: "Setting x equal to the given angle, or making the angles supplementary, uses the wrong relationship.",
          verify: () => {
            const x = ((n - 2 * m) / (2 * n)) * Math.PI;
            return x > 0 && x < Math.PI / 2 && Math.abs(Math.sin(x) - Math.cos((m / n) * Math.PI)) < 1e-12;
          },
        };
      }
    }
    {
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
          const askAngle = t.chance(0.6);
          const correct = askAngle ? theta : x;
          const wrong = wrongFor(
            t,
            numeric,
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
                [Number.isInteger((45 - b1) / a1) ? (45 - b1) / a1 : null, `Sets ${e1} equal to 45, as if sine equaled cosine only at 45°.`],
                [Number.isInteger(90 / (a1 + a2)) ? 90 / (a1 + a2) : null, "Sets the sum of the x-terms equal to 90 and leaves out the constants."],
              ],
            { positive: true, whole: true },
          );
          if (!wrong) continue;
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
  }

  const cofunctionAngles = {
    id: "cofunction-complementary-angles",
    domain: DOMAIN,
    skill: "Right triangles and trigonometry",
    subskill: "trigonometric ratios",
    difficulty: "Medium",
    title: "Sine and cosine of complementary angles",
    recognize:
      "For acute angles, sin A = cos B exactly when A + B = 90° (π/2 radians): set the two angles to add to a right angle, " +
      "never equal to each other and never to 180°.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "wrong-quantity"],
    build(t) {
      const form = t.pick(["degrees", "degrees", "radians"]);
      const numeric = form === "degrees" && t.chance(0.4);
      return cofunctionItem(t, form, numeric);
    },
  };

  const trigCofunction = {
    id: "trig-similar-cofunction",
    difficulty: "Hard",
    domain: DOMAIN,
    skill: "Right triangles and trigonometry",
    subskill: "trigonometric ratios",
    title: "Trig ratios through similar triangles",
    recognize:
      "A trig ratio belongs to an angle, not a triangle: follow the stated correspondence to the matching angle, " +
      "use the fact that similar triangles share ratios, and let one ratio fix the shape (all three sides up to scale).",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "wrong-quantity", "context-constraint", "part-vs-whole"],
    build(t) {
      const form = t.pick(["ratio", "ratio", "ratio", "side", "side"]);
      // Chosen once, outside the retry loop, so a multiple-choice attempt
      // that lacks good distractors does not tilt the mix toward numeric.
      const numeric = form === "side" ? t.chance(0.5) : false;

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
          // The four ratios of the legs and hypotenuse seen from angle
          // `target`: sin, cos, and tan of it, and tan of the other acute
          // angle. The key is one; the other three are the wrong answers, so
          // no choice shares more sides with the rest than the key does.
          const seen = { sin: ratioText(target, "sin"), cos: ratioText(target, "cos"), tan: ratioText(target, "tan"), cot: ratioText(other, "tan") };
          const reasonFor = (name) => {
            const asOther = { sin: "cos", cos: "sin", cot: "tan" }[name];
            if (asOther === fn) {
              return `Matches angle ${asked} with angle ${other}, as alphabetical order suggests (that is ${fn} ${other}); the stated correspondence pairs ${asked} with ${target}.`;
            }
            if (name === "cot") return `Divides the leg next to angle ${target} by the leg across from it, which is tan ${other}, not ${fn} ${target}.`;
            return `Gives ${name} ${target} instead of ${fn} ${target}: ${{ sin: "opposite over hypotenuse", cos: "adjacent over hypotenuse", tan: "opposite over adjacent" }[name]}.`;
          };
          const list = Object.entries(seen).filter(([name]) => name !== fn).map(([name, text]) => [text, reasonFor(name)]);
          const wrong = wrongFor(t, false, correct, list);
          if (!wrong) continue;
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
        const wrong = wrongFor(t, numeric, correct, [
          [scale * side[sideOf(thirdPair)], `Matches ${askedPair} with side ${sideOf(thirdPair)} of triangle ABC; under the stated correspondence it matches ${sideOf(askedPair)}.`],
          [Number.isInteger(naive) ? naive : null, `Pairs the vertices of the two triangles in alphabetical order instead of by the stated correspondence.`],
          [side[sideOf(askedPair)], `Gives the length of the corresponding side of triangle ABC without scaling by ${scale}.`],
          [Number.isInteger(misScaled) ? misScaled : null, `Matches ${givenPair} with side ${sideOf(thirdPair)} of triangle ABC, which gives the wrong scale factor.`],
          [givenLength, `Gives the given length ${givenPair} instead of ${askedPair}.`],
        ], { positive: true, whole: true });
        if (!wrong) continue;
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

  /* ===================================== special-right-triangle (Easy) */

  const R2 = Math.SQRT2;
  const R3 = Math.sqrt(3);

  const SIDE_NAMES = {
    triangle: { short: "shorter leg", long: "longer leg", leg: "leg", hyp: "hypotenuse" },
    equilateral: { short: "shorter leg (half of a side)", long: "height", hyp: "side length" },
    square: { leg: "side length", hyp: "diagonal" },
  };

  // Wrong answers for finding side `asked` from side `given`: the third side,
  // then the given side times each wrong factor a student might reach for
  // (2, √3, √2, and their reciprocals, the other special triangle's ratio).
  // Values are lengths; the caller prints them and spreads them around the key.
  const FACTORS = [
    [2, (side) => `Doubles the ${side}`], [1 / 2, (side) => `Halves the ${side}`],
    [R3, (side) => `Multiplies the ${side} by √3`], [1 / R3, (side) => `Divides the ${side} by √3`],
    [R2, (side) => `Multiplies the ${side} by √2`], [1 / R2, (side) => `Divides the ${side} by √2`],
    [2 / R3, (side) => `Multiplies the ${side} by 2/√3`], [R3 / 2, (side) => `Multiplies the ${side} by √3/2`],
  ];

  function specialWrong(kind, given, asked, sides, names) {
    const g = sides[given];
    const factor = sides[asked] / g;
    const list = [];
    const other = kind === "45" ? (given === "leg" ? "leg" : null) : ["short", "long", "hyp"].find((key) => key !== given && key !== asked);
    if (other && other !== given) list.push([sides[other], `Gives the ${names[other]} instead of the ${names[asked]}.`]);
    if (kind === "45" && given === "leg" && asked === "hyp") list.push([g, "Gives the length of the other leg, which equals the given leg."]);
    const rule = kind === "45" ? "In a 45°-45°-90° triangle the sides are in the ratio 1 : 1 : √2" : "In a 30°-60°-90° triangle the sides are in the ratio 1 : √3 : 2";
    FACTORS.forEach(([f, verb]) => {
      if (Math.abs(f - factor) < 1e-9) return;
      const mix = (kind === "45" && (Math.abs(f - R3) < 1e-9 || Math.abs(f - 1 / R3) < 1e-9 || f === 2 || f === 1 / 2))
        ? "the 30°-60°-90° ratio"
        : (kind === "30" && (Math.abs(f - R2) < 1e-9 || Math.abs(f - 1 / R2) < 1e-9)) ? "the 45°-45°-90° ratio" : null;
      list.push([g * f, `${verb(names[given])}${mix ? `, using ${mix}` : ""}; ${rule.charAt(0).toLowerCase()}${rule.slice(1)}.`]);
    });
    return list;
  }

  const specialRight = {
    id: "special-right-triangle",
    domain: GEO,
    skill: "Right triangles and trigonometry",
    subskill: "Pythagorean theorem",
    difficulty: "Easy",
    title: "Side lengths in 30°-60°-90° and 45°-45°-90° triangles",
    recognize:
      "The angles fix the side ratios: 1 : √3 : 2 for 30°-60°-90° (the shorter leg is across from 30° and is half the " +
      "hypotenuse) and 1 : 1 : √2 for 45°-45°-90°. A square's diagonal and an equilateral triangle's height make the same triangles.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "wrong-quantity"],
    build(t) {
      const kind = t.pick(["30", "30", "30", "45", "45"]);
      const presentation = t.pick(["figure", "figure", "figure", "text", "text", "shape"]);
      const wantNumeric = t.chance(0.4);
      return retry(() => {
        const k = t.int(2, 20);
        const rooted = t.chance(0.35);
        // Base length: the shorter leg (30°-60°-90°) or a leg (45°-45°-90°).
        const base = rooted ? k * (kind === "30" ? R3 : R2) : k;
        const sides = kind === "30" ? { short: base, long: base * R3, hyp: 2 * base } : { leg: base, hyp: base * R2 };
        const keys = Object.keys(sides);
        let given = t.pick(keys);
        let asked = t.pick(keys.filter((key) => key !== given));
        if (presentation === "shape" && kind === "30") {
          // Equilateral triangle: its side is the hypotenuse and its height the longer leg.
          [given, asked] = t.chance(0.6) ? ["hyp", "long"] : ["long", "hyp"];
        }
        const givenText = surd(sides[given]);
        const keyText = surd(sides[asked]);
        if (!givenText || !keyText) return null;
        // A figure-only stem would repeat word for word as a grid-in, so a
        // figure item is multiple choice.
        const numeric = wantNumeric && presentation !== "figure" && typeof radical(Math.round(sides[asked] ** 2)) === "number";
        const namesKind = presentation === "shape" ? (kind === "30" ? "equilateral" : "square") : "triangle";
        const names = SIDE_NAMES[namesKind];
        const wrong = specialWrong(kind, given, asked, sides, names).map(([value, reason]) => [surd(value), reason]);
        let stem;
        let figure = null;
        // The labeled acute angle sits at U; RU is the leg next to it and RV the leg across from it.
        const atU = kind === "45" ? 45 : t.pick([30, 60]);
        const opposite = kind === "45" ? "leg" : atU === 30 ? "short" : "long";
        const adjacent = kind === "45" ? "leg" : atU === 30 ? "long" : "short";
        const legName = (key) => (key === opposite ? "RV" : key === adjacent ? "RU" : "UV");
        if (presentation === "figure") {
          const RU = sides[adjacent];
          const RV = sides[opposite];
          const flip = t.chance(0.5);
          const up = t.chance(0.75);
          const pts = [[0, 0], [RU, 0], [0, RV]].map(([x, y]) => [flip ? -x : x, up ? y : -y]);
          const map = fitPoints(pts, 400, 260, 48);
          const [Rs, Us, Vs] = pts.map(map);
          const G = centroid([Rs, Us, Vs]);
          const at = { RU: [Rs, Us], RV: [Rs, Vs], UV: [Us, Vs] };
          const givenSeg = kind === "45" && given === "leg" ? t.pick(["RU", "RV"]) : legName(given);
          const askedSeg = kind === "45" && asked === "leg" ? (t.chance(0.5) ? "RU" : "RV") : legName(asked);
          const parts = [
            P.polygon([Rs, Us, Vs]),
            rightMark(Rs, Us, Vs),
            angleArc(Us, Rs, Vs, 20),
            angleLabel(Us, Rs, Vs, `${atU}°`, 34, 14),
            sideLabel(...at[givenSeg], G, givenText),
            sideLabel(...at[askedSeg], G, "x"),
          ];
          const words = { RU: "the leg next to that angle", RV: "the leg across from that angle", UV: "the hypotenuse" };
          const alt =
            `A right triangle with the right angle marked and one acute angle labeled ${atU}°. ${words[givenSeg].charAt(0).toUpperCase()}${words[givenSeg].slice(1)} ` +
            `is labeled ${givenText}, and ${words[askedSeg]} is labeled x. The figure is drawn to scale.`;
          figure = { svg: S.svg(400, 260, parts, alt), alt, notToScale: false };
          stem = "In the right triangle shown, what is the value of x?";
        } else if (presentation === "text") {
          // Right angle at C; angle A is the labeled acute angle, so BC is across from A.
          const segName = { RV: "BC", RU: "AC", UV: "AB" };
          const givenSeg = kind === "45" && given === "leg" ? t.pick(["RU", "RV"]) : legName(given);
          const askedSeg = kind === "45" && asked === "leg" ? (givenSeg === "RU" ? "RV" : "RU") : legName(asked);
          stem =
            `In triangle ABC, angle C is a right angle and the measure of angle A is ${atU}°. If ${segName[givenSeg]} = ${givenText}, ` +
            `what is the length of ${segName[askedSeg]}?`;
        } else if (kind === "30") {
          stem = given === "hyp"
            ? `An equilateral triangle has sides of length ${givenText}. What is the height of the triangle?`
            : `The height of an equilateral triangle is ${givenText}. What is the length of each side of the triangle?`;
        } else {
          stem = given === "hyp"
            ? `A square has a diagonal of length ${givenText}. What is the side length of the square?`
            : `A square has sides of length ${givenText}. What is the length of a diagonal of the square?`;
        }
        const ratio = kind === "30" ? "1 : √3 : 2" : "1 : 1 : √2";
        const setup = presentation === "shape"
          ? kind === "30"
            ? "The height of an equilateral triangle cuts it into two 30°-60°-90° triangles, each with the side as its hypotenuse and the height as its longer leg."
            : "A diagonal cuts a square into two 45°-45°-90° triangles, each with two sides of the square as its legs and the diagonal as its hypotenuse."
          : kind === "30"
            ? `The angles are 30°, 60°, and 90°, so the shorter leg (across from 30°), the longer leg, and the hypotenuse are in the ratio ${ratio}.`
            : `The angles are 45°, 45°, and 90°, so the legs and the hypotenuse are in the ratio ${ratio}.`;
        const rule = {
          "short>hyp": `the hypotenuse is twice the shorter leg: 2 × ${givenText} = ${keyText}`,
          "short>long": `the longer leg is √3 times the shorter leg: ${givenText} × √3 = ${keyText}`,
          "long>short": `the shorter leg is the longer leg divided by √3: ${givenText} ÷ √3 = ${keyText}`,
          "long>hyp": `the shorter leg is ${givenText} ÷ √3 = ${surd(sides.short)}, and the hypotenuse is twice that: ${keyText}`,
          "hyp>short": `the shorter leg is half the hypotenuse: ${givenText} ÷ 2 = ${keyText}`,
          "hyp>long": `the shorter leg is ${givenText} ÷ 2 = ${surd(sides.short)}, and the longer leg is √3 times that: ${keyText}`,
          "leg>hyp": `the hypotenuse is √2 times a leg: ${givenText} × √2 = ${keyText}`,
          "hyp>leg": `each leg is the hypotenuse divided by √2: ${givenText} ÷ √2 = ${keyText}`,
        }[`${given}>${asked}`];
        return packSpread(t, numeric, surdValue(keyText), keyText, wrong, {
          stimulus: null,
          figure,
          stem,
          explanation: `${setup} So ${rule}.`,
          steps: [setup, `${rule.charAt(0).toUpperCase()}${rule.slice(1)}.`],
          principles: [
            "In a 30°-60°-90° triangle the sides are in the ratio 1 : √3 : 2, with the shorter leg across from the 30° angle.",
            "In a 45°-45°-90° triangle the sides are in the ratio 1 : 1 : √2.",
          ],
          trap: kind === "30"
            ? "The √3 and the 2 belong to different sides: √3 times the shorter leg is the longer leg, and 2 times it is the hypotenuse."
            : "The hypotenuse is √2 times a leg, not twice it.",
          hint: "Which side is across from the smallest angle?",
          estimatedSeconds: 60,
          verify: () => {
            // Rebuild the triangle from its angle with the tangent, scale it to the given side, and measure.
            const angle = kind === "45" ? 45 : 30;
            const Rm = [0, 0];
            const Um = [1, 0];
            const Vm = [0, Math.tan(toRad(angle))];
            const measured = { short: dist(Rm, Vm), long: dist(Rm, Um), hyp: dist(Um, Vm), leg: dist(Rm, Vm) };
            const scale = sides[given] / measured[given];
            return close(scale * measured[asked], surdValue(keyText)) && close(angleAt(Um, Rm, Vm), angle);
          },
        });
      });
    },
  };

  /* ===================================== trig-context-length (Medium) */

  // Each context names the sides of its right triangle: `opp` is vertical
  // (across from the angle at the ground), `adj` lies along the ground, and
  // `hyp` is the slanted side. `ask` sentences end the stem.
  const TRIG_SCENES = [
    {
      units: "feet", unit: "foot", short: "ft", angles: [50, 80],
      given: {
        hyp: (v, a) => `${S.article(v) === "an" ? "An" : "A"} ${v}-foot ladder leans against a vertical wall and makes an angle of ${a}° with the level ground.`,
        opp: (v, a) => `A ladder leans against a vertical wall. The top of the ladder touches the wall ${v} feet above the level ground, and the ladder makes an angle of ${a}° with the ground.`,
      },
      ask: {
        opp: "how far up the wall does the top of the ladder reach",
        adj: "how far is the bottom of the ladder from the base of the wall",
        hyp: "how long is the ladder",
      },
      pairs: [["hyp", "opp"], ["hyp", "adj"], ["opp", "hyp"], ["opp", "adj"]],
    },
    {
      units: "feet", unit: "foot", short: "ft", angles: [8, 25],
      given: {
        hyp: (v, a) => `A straight ramp that is ${v} feet long rises from the level ground at an angle of ${a}°.`,
        adj: (v, a) => `A straight ramp rises from the level ground at an angle of ${a}° and covers a horizontal distance of ${v} feet.`,
      },
      ask: {
        opp: "how high above the ground is the top of the ramp",
        adj: "what horizontal distance does the ramp cover",
        hyp: "how long is the ramp",
      },
      pairs: [["hyp", "opp"], ["hyp", "adj"], ["adj", "hyp"], ["adj", "opp"]],
    },
    {
      units: "meters", unit: "meter", short: "m", angles: [15, 75],
      given: {
        adj: (v, a) => `When the angle of elevation of the sun is ${a}°, a vertical flagpole on level ground casts a shadow that is ${v} meters long.`,
        opp: (v, a) => `A vertical flagpole that is ${v} meters tall stands on level ground. When the angle of elevation of the sun is ${a}°, the flagpole casts a shadow.`,
      },
      ask: {
        opp: "how tall is the flagpole",
        adj: "how long is the shadow",
      },
      pairs: [["adj", "opp"], ["opp", "adj"]],
    },
    {
      units: "feet", unit: "foot", short: "ft", angles: [20, 70],
      given: {
        hyp: (v, a) => `A kite is tied to a stake in the ground by a straight string that is ${v} feet long. The string makes an angle of ${a}° with the level ground.`,
      },
      ask: {
        opp: "how high above the ground is the kite",
        adj: "what is the horizontal distance from the stake to the point on the ground directly below the kite",
      },
      pairs: [["hyp", "opp"], ["hyp", "adj"]],
    },
  ];

  // Given side -> asked side, as the operation on the given length.
  const TRIG_STEP = {
    "hyp>opp": { fn: "sin", op: "×" }, "hyp>adj": { fn: "cos", op: "×" }, "adj>opp": { fn: "tan", op: "×" },
    "opp>hyp": { fn: "sin", op: "÷" }, "adj>hyp": { fn: "cos", op: "÷" }, "opp>adj": { fn: "tan", op: "÷" },
  };

  const SIDE_WORDS = { opp: "the side across from the angle", adj: "the side along the ground", hyp: "the hypotenuse" };

  const tenth = (value) => Math.round(value * 10) / 10;

  // Angle label on the bisector, deep enough into a narrow angle that the
  // text clears both rays, reading away from the vertex.
  function wedgeLabel(vertex, p, q, text) {
    const b = unit(add(unit(sub(p, vertex)), unit(sub(q, vertex))));
    const half = toRad(angleAt(vertex, p, q) / 2);
    const depth = Math.max(34, 10 / Math.sin(half));
    const anchor = Math.abs(b[0]) > 0.5 ? (b[0] > 0 ? "start" : "end") : "middle";
    return measure(add(vertex, mul(b, depth)), text, anchor, 14);
  }

  const trigContext = {
    id: "trig-context-length",
    domain: GEO,
    skill: "Right triangles and trigonometry",
    subskill: "trigonometric ratios",
    difficulty: "Medium",
    title: "A length from an angle in a real setting",
    recognize:
      "Sketch the right triangle, mark the angle, and name the known and wanted sides relative to it (opposite, adjacent, " +
      "hypotenuse); the ratio that links those two sides decides between sine, cosine, and tangent, and whether to multiply or divide. " +
      "The calculator must be in degree mode.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "unit-mismatch"],
    build(t) {
      const scene = t.pick(TRIG_SCENES);
      const [given, asked] = t.pick(scene.pairs);
      const numeric = t.chance(0.35);
      const withFigure = t.chance(0.45);
      return retry(() => {
        const angle = t.int(...scene.angles);
        if ([30, 45, 60].includes(angle)) return null;
        const length = t.int(6, 60);
        const theta = toRad(angle);
        const f = { sin: Math.sin(theta), cos: Math.cos(theta), tan: Math.tan(theta) };
        const { fn, op } = TRIG_STEP[`${given}>${asked}`];
        const exact = op === "×" ? length * f[fn] : length / f[fn];
        const key = tenth(exact);
        if (key < 1 || !C.fitsGrid(key)) return null;
        const co = { sin: "cos", cos: "sin", tan: null }[fn];
        const inRadians = op === "×" ? length * Math[fn](angle) : length / Math[fn](angle);
        const inverse = op === "×" ? length / f[fn] : length * f[fn];
        const candidates = [
          [co ? (op === "×" ? length * f[co] : length / f[co]) : (op === "×" ? length / f.tan : length * f.tan),
            co
              ? `Uses ${co} ${angle}° instead of ${fn} ${angle}°; ${co === "cos" ? "cosine pairs the side along the ground" : "sine pairs the side across from the angle"} with the hypotenuse.`
              : `Uses the tangent upside down, pairing the two legs the wrong way around.`],
          [inverse, op === "×" ? `Divides by ${fn} ${angle}° instead of multiplying by it.` : `Multiplies by ${fn} ${angle}° instead of dividing by it.`],
          [inRadians, `Evaluates ${fn} ${angle} with the calculator in radian mode; the angle is in degrees.`],
          [fn !== "tan" ? (op === "×" ? length * f.tan : length / f.tan) : (op === "×" ? length * f.sin : length / f.sin),
            fn !== "tan" ? `Uses tan ${angle}°, a ratio of the two legs, where the hypotenuse is involved.` : `Uses sin ${angle}° where the hypotenuse is not involved; the two legs are related by the tangent.`],
        ];
        candidates.push(
          [length, `Gives the known length, ${length}, as if the two sides were equal.`],
          [fn === "tan" ? (op === "×" ? length * f.cos : length / f.cos) : (op === "×" ? length / f[fn === "sin" ? "cos" : "sin"] : length * f[fn === "sin" ? "cos" : "sin"]),
            fn === "tan"
              ? `Uses cos ${angle}°, pairing the side along the ground with the hypotenuse, where the two legs are involved.`
              : `Uses ${fn === "sin" ? "cos" : "sin"} ${angle}° and also ${op === "×" ? "divides by it instead of multiplying" : "multiplies by it instead of dividing"}.`],
        );
        // Choices print to the tenth, as the question asks: 15.0, not 15.
        // The question asks for the nearest tenth, so the key must be the
        // nearest choice to the exact length by a clear margin: a wrong
        // choice closer than twice the key's rounding gap is dropped.
        const gap = Math.abs(key - exact);
        const printed = candidates.map(([value, reason]) => {
          const shownValue = tenth(value);
          const clear = Math.abs(shownValue - exact) >= 2 * gap + 1e-9;
          return [Number.isFinite(value) && shownValue > 0 && shownValue < 20 * length && clear ? shownValue.toFixed(1) : null, reason];
        });
        const wrong = wrongFor(t, numeric, key.toFixed(1), printed);
        if (!wrong) return null;
        let figure = null;
        if (withFigure) {
          const adj = given === "adj" ? length : asked === "adj" ? exact : given === "hyp" ? length * f.cos : length / f.tan;
          const opp = adj * f.tan;
          const flip = t.chance(0.5);
          const pts = [[0, 0], [adj, 0], [adj, opp]].map(([x, y]) => [flip ? -x : x, y]);
          const map = fitPoints(pts, 400, 260, 48);
          const [Gs, Rs, Ts] = pts.map(map);
          const G = centroid([Gs, Rs, Ts]);
          const at = { adj: [Gs, Rs], opp: [Rs, Ts], hyp: [Gs, Ts] };
          const n = normalAway(...at[given], G);
          const parts = [
            P.polygon([Gs, Rs, Ts]),
            rightMark(Rs, Gs, Ts),
            angleArc(Gs, Rs, Ts, 22),
            wedgeLabel(Gs, Rs, Ts, `${angle}°`),
            unitText(add(mid(...at[given]), mul(n, 14)), `${length} ${scene.short}`, anchorFor(n)),
            sideLabel(...at[asked], G, "x"),
          ];
          const alt =
            `A right triangle with a horizontal side along the ground, a vertical side, and the right angle between them. The angle at the ground ` +
            `between the horizontal side and the hypotenuse is labeled ${angle}°. ${SIDE_WORDS[given].charAt(0).toUpperCase()}${SIDE_WORDS[given].slice(1)} is labeled ` +
            `${length} ${scene.short}, and ${SIDE_WORDS[asked]} is labeled x. The figure is drawn to scale.`;
          figure = { svg: S.svg(400, 260, parts, alt), alt, notToScale: false };
        }
        const question = figure
          ? `The figure shows this situation. To the nearest tenth of a ${scene.unit}, what is the value of x?`
          : `To the nearest tenth of a ${scene.unit}, ${scene.ask[asked]}?`;
        const relation = `${fn} ${angle}° = ${{ sin: "opposite/hypotenuse", cos: "adjacent/hypotenuse", tan: "opposite/adjacent" }[fn]}`;
        const unknown = figure ? "x" : "the wanted length";
        const equation = op === "×" ? `${unknown} = ${length} ${fn} ${angle}°` : `${unknown} = ${length} ÷ ${fn} ${angle}°`;
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 100,
          stimulus: null,
          figure,
          stem: `${scene.given[given](length, angle)} ${question}`,
          correct: numeric ? key : key.toFixed(1),
          wrong,
          approximates: exact,
          explanation:
            `Relative to the ${angle}° angle, the known length is ${SIDE_WORDS[given]} and the wanted length is ${SIDE_WORDS[asked]}. ` +
            `Those two sides are linked by ${relation}, so ${equation} ≈ ${num(tidy(Math.round(exact * 1000) / 1000))}, which is ${num(key)} to the nearest tenth.`,
          steps: [
            `Known: ${SIDE_WORDS[given]} = ${length}. Wanted: ${SIDE_WORDS[asked]}.`,
            `The ratio linking them is ${relation}.`,
            `${equation.charAt(0).toUpperCase()}${equation.slice(1)} ≈ ${num(key)} (calculator in degree mode).`,
          ],
          principles: [
            "In a right triangle, sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, and tan θ = opposite/adjacent.",
            "When the unknown is in the denominator of the ratio, divide the known side by the ratio.",
          ],
          trap: `Using the wrong ratio, or multiplying where the unknown sits in the denominator, gives one of the other choices; so does a calculator left in radian mode.`,
          hint: `Relative to the ${angle}° angle, which two sides are involved?`,
          verify: () => {
            // Find the triangle by bisection on the angle measured with angleAt, then measure the asked side.
            const measure3 = (a, h) => ({ adj: a, opp: h, hyp: Math.hypot(a, h) });
            const angleOf = (a, h) => angleAt([0, 0], [a, 0], [a, h]);
            let low;
            let high;
            let sidesOut;
            if (given === "adj") {
              low = 0; high = 1e5;
              for (let i = 0; i < 200; i += 1) { const hMid = (low + high) / 2; if (angleOf(length, hMid) < angle) low = hMid; else high = hMid; }
              sidesOut = measure3(length, low);
            } else if (given === "opp") {
              low = 1e-9; high = 1e5;
              for (let i = 0; i < 200; i += 1) { const aMid = (low + high) / 2; if (angleOf(aMid, length) > angle) low = aMid; else high = aMid; }
              sidesOut = measure3(low, length);
            } else {
              low = 0; high = length;
              for (let i = 0; i < 200; i += 1) { const hMid = (low + high) / 2; if (angleOf(Math.sqrt(length * length - hMid * hMid), hMid) < angle) low = hMid; else high = hMid; }
              sidesOut = measure3(Math.sqrt(length * length - low * low), low);
            }
            return close(sidesOut[given], length, 1e-9) && tenth(sidesOut[asked]) === key;
          },
        };
      });
    },
  };

  /* ====================================== unit-circle-quadrant (Hard) */

  const QUADRANTS = {
    2: { sx: -1, sy: 1, radians: "π/2 < θ < π", degrees: "90° < θ < 180°", words: "Quadrant II" },
    3: { sx: -1, sy: -1, radians: "π < θ < 3π/2", degrees: "180° < θ < 270°", words: "Quadrant III" },
    4: { sx: 1, sy: -1, radians: "3π/2 < θ < 2π", degrees: "270° < θ < 360°", words: "Quadrant IV" },
  };

  const UNIT_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];

  // Angle in standard position with reference angle `ref` (degrees) in quadrant q, as a multiple of π.
  function standardAngle(ref, q) {
    const degrees = q === 2 ? 180 - ref : q === 3 ? 180 + ref : 360 - ref;
    return { degrees, text: piFraction(degrees, 180), value: toRad(degrees) };
  }

  // Coordinate plane with a circle about the origin, point P, ray OP, and an
  // arc sweeping counterclockwise from the positive x-axis to OP.
  function unitCircleFigure(xP, yP, degrees, q, label, alt) {
    const O = [200, 140];
    const R = 96;
    const radius = Math.hypot(xP, yP);
    const Pp = [O[0] + (R * xP) / radius, O[1] - (R * yP) / radius];
    const namePos = add(Pp, mul(unit(sub(Pp, O)), 16));
    const parts = [
      seg([40, O[1]], [360, O[1]], 1.2), seg([O[0], 14], [O[0], 266], 1.2),
      P.text(368, O[1] - 12, "x"), P.text(O[0] + 12, 16, "y"),
      P.circle(O[0], O[1], R),
      seg(O, Pp, 2),
      P.dot(Pp[0], Pp[1]),
      P.dot(O[0], O[1]),
      // The label O goes where neither the ray nor the arc passes.
      name(add(O, q === 3 ? [14, 16] : [-20, 18]), "O"),
      P.arc(O[0], O[1], 18, 0, degrees),
      name(namePos, "P"),
    ];
    if (label) parts.push(unitText(add(namePos, [0, yP > 0 ? -18 : 18]), label, "middle", 14));
    return { svg: S.svg(400, 280, parts, alt), alt, notToScale: false };
  }

  const unitCircle = {
    id: "unit-circle-quadrant",
    difficulty: "Hard",
    domain: DOMAIN,
    skill: "Right triangles and trigonometry",
    subskill: "trigonometric ratios",
    title: "Trigonometry beyond the first quadrant",
    recognize:
      "Reduce to the reference angle, the acute angle the ray makes with the x-axis, and read its right-triangle values; then " +
      "the quadrant decides every sign: x (cosine) is negative in Quadrants II and III, y (sine) is negative in III and IV, and tangent is y/x.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["sign-error", "wrong-quantity", "neighbouring-rule"],
    build(t) {
      const form = t.pick(["ratio", "ratio", "ratio", "coordinate", "coordinate", "coordinate", "angle", "angle"]);
      const q = t.pick([2, 3, 4]);
      const quad = QUADRANTS[q];
      const principles = [
        "A point on a circle of radius r centered at the origin, on a ray at angle θ from the positive x-axis, is (r cos θ, r sin θ).",
        "The reference angle is the acute angle between the ray and the x-axis; the quadrant sets the signs of the coordinates.",
        "sin 30° = cos 60° = 1/2, sin 60° = cos 30° = √3/2, and sin 45° = cos 45° = √2/2.",
      ];
      const common = { stimulus: null, estimatedSeconds: 120, principles };

      if (form === "ratio") {
        for (;;) {
          const [a, b, h] = t.pick(UNIT_TRIPLES);
          const [ax, ay] = t.chance(0.5) ? [a, b] : [b, a];
          const x = quad.sx * ax;
          const y = quad.sy * ay;
          const parts = { sin: [y, h], cos: [x, h], tan: [y, x] };
          const givenFn = t.pick(["sin", "cos", "tan"]);
          const askedFn = t.pick(["sin", "cos", "tan"].filter((fn) => fn !== givenFn));
          const given = S.frac(...parts[givenFn]);
          const [top, bottom] = parts[askedFn];
          const correct = S.frac(top, bottom);
          const sign = Math.sign(top / bottom);
          const swapped = askedFn === "tan" ? S.frac(sign * Math.abs(x), Math.abs(y)) : S.frac(sign * Math.abs(askedFn === "sin" ? x : y), h);
          const thirdFn = ["sin", "cos", "tan"].find((fn) => fn !== givenFn && fn !== askedFn);
          // Two signs times two sizes: the right size and one wrong size, each
          // with both signs, so neither the sign nor the size can be guessed
          // from the other choices.
          const sizes = [
            [swapped, askedFn === "tan"
              ? "Divides the adjacent side by the opposite side, turning the tangent upside down"
              : `Uses the ${askedFn === "sin" ? "adjacent" : "opposite"} side over the hypotenuse, which is the size of ${askedFn === "sin" ? "cos" : "sin"} θ`],
            [S.frac(sign * Math.abs(parts[thirdFn][0]), Math.abs(parts[thirdFn][1])), `Gives the size of ${thirdFn} θ instead of ${askedFn} θ`],
            [S.frac(sign * Math.abs(bottom), Math.abs(top)), `Turns ${askedFn} θ upside down`],
          ].filter(([text]) => text !== correct && text !== S.frac(-top, bottom));
          if (!sizes.length) continue;
          const [otherText, otherReason] = t.pick(sizes);
          const flip = (text) => (text.startsWith(MINUS) ? text.slice(1) : `${MINUS}${text}`);
          const wrong = wrongFor(t, false, correct, [
            [S.frac(-top, bottom), `Has the right size but the wrong sign: in ${quad.words}, ${askedFn} θ is ${sign > 0 ? "positive" : "negative"}.`],
            [otherText, `${otherReason}.`],
            [flip(otherText), `${otherReason}, and gives it the wrong sign for ${quad.words}.`],
          ]);
          if (!wrong) continue;
          const interval = t.chance(0.7) ? quad.radians : quad.degrees;
          const inline = t.chance(0.5);
          return {
            ...common,
            responseType: "multiple-choice",
            figure: null,
            stimulus: inline ? null : { type: "equations", content: `${givenFn} θ = ${given}` },
            stem: inline
              ? `For an angle θ, where ${interval}, ${givenFn} θ = ${given}. What is the value of ${askedFn} θ?`
              : `In the given equation, θ is an angle${interval.includes("°") ? "" : " measured in radians"}, where ${interval}. What is the value of ${askedFn} θ?`,
            correct,
            wrong,
            explanation:
              `A reference triangle with legs ${ax} and ${ay} and hypotenuse ${h} fits ${givenFn} θ = ${given} in size. ` +
              `Because ${interval}, θ is in ${quad.words}, where x is ${quad.sx > 0 ? "positive" : "negative"} and y is ${quad.sy > 0 ? "positive" : "negative"}: ` +
              `the point is (${num(x)}, ${num(y)}) at distance ${h}. So ${askedFn} θ = ${askedFn === "tan" ? "y/x" : askedFn === "sin" ? "y/r" : "x/r"} = ${correct}.`,
            steps: [
              `Sizes: the legs are ${ax} and ${ay}, and the hypotenuse is ${h} (${ax}² + ${ay}² = ${h}²).`,
              `${quad.words}: x ${quad.sx > 0 ? ">" : "<"} 0 and y ${quad.sy > 0 ? ">" : "<"} 0, so the point is (${num(x)}, ${num(y)}).`,
              `${askedFn} θ = ${correct}.`,
            ],
            trap: `The right-triangle ratio gives the size; the quadrant gives the sign. In ${quad.words}, ${askedFn} θ is ${sign > 0 ? "positive" : "negative"}.`,
            hint: "Which of x and y is negative in that interval?",
            verify: () => {
              let theta = Math.atan2(y, x);
              if (theta < 0) theta += 2 * Math.PI;
              const inside = theta > ((q - 1) * Math.PI) / 2 && theta < (q * Math.PI) / 2;
              const value = { sin: Math.sin(theta), cos: Math.cos(theta), tan: Math.tan(theta) };
              return inside && close(value[givenFn], fractionValue(given), 1e-9) && close(value[askedFn], fractionValue(correct), 1e-9);
            },
          };
        }
      }

      // Special angles: reference 30°, 45°, or 60°.
      for (;;) {
        const ref = t.pick([30, 45, 60]);
        const angle = standardAngle(ref, q);
        const k = t.int(2, 9);
        // Radius 2k, or k√2 for 45° so the coordinates are whole numbers.
        const rootTwo = ref === 45 && t.chance(0.5);
        const r = rootTwo ? k * R2 : 2 * k;
        const rText = surd(r);
        const size = { x: r * Math.abs(Math.cos(toRad(ref))), y: r * Math.abs(Math.sin(toRad(ref))) };
        const xP = quad.sx * size.x;
        const yP = quad.sy * size.y;

        if (form === "coordinate") {
          const axis = t.pick(["x", "y"]);
          const sign = axis === "x" ? quad.sx : quad.sy;
          const value = axis === "x" ? xP : yP;
          const keyText = surd(value);
          const numeric = typeof radical(Math.round(value * value)) === "number" && t.chance(0.5);
          const otherSize = axis === "x" ? size.y : size.x;
          // Two signs times two sizes, as in the ratio form.
          const sizes = ref === 45
            ? [
              [r / 2, "Uses 1/2 as the value of cos 45° and sin 45°; they equal √2/2"],
              [(r / 2) * R3, "Uses √3/2, the value for a 30° or 60° angle, instead of √2/2"],
              [r, `Gives the radius instead of the ${axis}-coordinate`],
            ]
            : [
              [otherSize, `Mixes up sine and cosine: that is the size of the ${axis === "x" ? "y" : "x"}-coordinate`],
              [(r / 2) * R2, "Uses √2/2, the value for a 45° angle"],
            ];
          const [otherSizeValue, otherReason] = t.pick(sizes);
          const list = [
            [surd(-value), `Has the right size but the wrong sign: in ${quad.words}, the ${axis}-coordinate is ${sign > 0 ? "positive" : "negative"}.`],
            [surd(sign * otherSizeValue), `${otherReason}.`],
            [surd(-sign * otherSizeValue), `${otherReason}, and gives it the wrong sign for ${quad.words}.`],
          ];
          if (!keyText) continue;
          const wrong = wrongFor(t, numeric, keyText, list);
          if (!wrong) continue;
          const inDegrees = t.chance(0.2);
          const angleText = inDegrees ? `${angle.degrees}°` : `${angle.text} radians`;
          const alt =
            `A coordinate plane with a circle centered at the origin O. Point P lies on the circle in ${quad.words}, and ray OP is drawn with an arc ` +
            "marking the angle from the positive x-axis to OP. The figure is drawn to scale.";
          const figure = t.chance(0.5) ? unitCircleFigure(xP, yP, angle.degrees, q, null, alt) : null;
          const fnWord = axis === "x" ? "cos" : "sin";
          return {
            ...common,
            responseType: numeric ? "numeric" : "multiple-choice",
            figure,
            stem:
              `In the xy-plane${figure ? " shown" : ""}, a circle with center at the origin O has radius ${rText}. Point P lies on the circle, and ray OP makes an angle of ` +
              `${angleText} with the positive x-axis, measured counterclockwise. What is the ${axis}-coordinate of P?`,
            correct: numeric ? surdValue(keyText) : keyText,
            wrong,
            explanation:
              `The ${axis}-coordinate of P is r ${fnWord} θ. The angle ${angleText} is in ${quad.words}, with a reference angle of ${ref}°, so ` +
              `${fnWord} θ = ${sign > 0 ? "" : "−"}${fnWord} ${ref}°. The ${axis}-coordinate is ${rText} × (${sign > 0 ? "" : "−"}${fnWord} ${ref}°) = ${keyText}.`,
            steps: [
              `Reference angle: ${ref}°; ${angleText} is in ${quad.words}.`,
              `Size: ${rText} × ${fnWord} ${ref}° = ${surd(Math.abs(value))}.`,
              `Sign: in ${quad.words} the ${axis}-coordinate is ${sign > 0 ? "positive" : "negative"}, so it is ${keyText}.`,
            ],
            trap:
              `The reference angle gives the size ${surd(Math.abs(value))}; the quadrant decides the sign` +
              (ref === 45 ? ", and cos 45° is √2/2, not 1/2." : ", and the values of sine and cosine at 30° and 60° are easy to swap."),
            hint: "How far is the angle from the nearest part of the x-axis, and which quadrant is the ray in?",
            verify: () => {
              const theta = (angle.degrees * Math.PI) / 180;
              const measured = axis === "x" ? surdValue(rText) * Math.cos(theta) : surdValue(rText) * Math.sin(theta);
              return close(measured, surdValue(keyText), 1e-9) && close(angle.value, theta);
            },
          };
        }

        // angle: the coordinates of P are given; θ is asked in radians.
        const xText = surd(xP);
        const yText = surd(yP);
        const refText = piFraction(ref, 180);
        const swapRef = 90 - ref;
        // Every choice has a plausible reference angle: the right quadrant or
        // a wrong one, with the right reference angle or the swapped one.
        const inQuadrant = (reference, quadrant) =>
          piFraction(quadrant === 1 ? reference : quadrant === 2 ? 180 - reference : quadrant === 3 ? 180 + reference : 360 - reference, 180);
        const quadrantReason = (quadrant) => quadrant === 1
          ? `Gives the reference angle, the acute angle between ray OP and the x-axis, instead of the angle from the positive x-axis.`
          : `Places P in Quadrant ${["I", "II", "III", "IV"][quadrant - 1]}; the signs of its coordinates put it in ${quad.words}.`;
        const otherQuadrant = t.pick([1, 2, 3, 4].filter((value) => value !== q));
        const list = ref === 45
          ? [1, 2, 3, 4].filter((value) => value !== q).map((value) => [inQuadrant(45, value), quadrantReason(value)])
          : [
            [inQuadrant(swapRef, q), "Swaps x and y, finding the angle whose tangent is x/y instead of y/x."],
            [inQuadrant(ref, otherQuadrant), quadrantReason(otherQuadrant)],
            [inQuadrant(swapRef, otherQuadrant), `Swaps x and y and also ${quadrantReason(otherQuadrant).charAt(0).toLowerCase()}${quadrantReason(otherQuadrant).slice(1)}`],
          ];
        const wrong = wrongFor(t, false, angle.text, list);
        if (!wrong) continue;
        const alt =
          `A coordinate plane with a circle centered at the origin O. Point P, labeled (${xText}, ${yText}), lies on the circle in ${quad.words}, ` +
          "and ray OP is drawn with an arc marking the angle from the positive x-axis to OP. The figure is drawn to scale.";
        const figure = t.chance(0.5) ? unitCircleFigure(xP, yP, angle.degrees, q, `(${xText}, ${yText})`, alt) : null;
        return {
          ...common,
          responseType: "multiple-choice",
          figure,
          stem:
            `In the xy-plane${figure ? " shown" : ""}, O is the origin and point P has coordinates (${xText}, ${yText}). Ray OP makes an angle of θ radians with the ` +
            `positive x-axis, measured counterclockwise, where 0 ≤ θ < 2π. What is the value of θ?`,
          correct: angle.text,
          wrong,
          explanation:
            `P is at distance √((${xText})² + (${yText})²) = ${rText} from O. Its coordinates have sizes ${surd(size.x)} and ${surd(size.y)}, so the ray makes a reference angle of ` +
            `${ref}° = ${refText} with the x-axis. P is in ${quad.words}, so θ = ${{ 2: `π − ${refText}`, 3: `π + ${refText}`, 4: `2π − ${refText}` }[q]} = ${angle.text}.`,
          steps: [
            `Reference angle: legs ${surd(size.x)} and ${surd(size.y)} with hypotenuse ${rText} form a ${ref === 45 ? "45°-45°-90°" : "30°-60°-90°"} triangle, so ray OP makes ${ref}° (${refText}) with the x-axis.`,
            `P is in ${quad.words} (x ${quad.sx > 0 ? ">" : "<"} 0, y ${quad.sy > 0 ? ">" : "<"} 0).`,
            `θ = ${{ 2: `π − ${refText}`, 3: `π + ${refText}`, 4: `2π − ${refText}` }[q]} = ${angle.text}.`,
          ],
          trap: `${refText} is only the reference angle; the angle is measured counterclockwise from the positive x-axis all the way to ray OP in ${quad.words}.`,
          hint: "Which quadrant is P in, and how far is ray OP from the x-axis?",
          verify: () => {
            let theta = Math.atan2(surdValue(yText), surdValue(xText));
            if (theta < 0) theta += 2 * Math.PI;
            return close(theta, angle.value, 1e-9) && close(Math.hypot(surdValue(xText), surdValue(yText)), surdValue(rText), 1e-9);
          },
        };
      }
    },
  };

  /* ====================================== two-observer-elevation (Hard) */

  // The exact tangents of the two angles an item uses, in increasing order:
  // "tan 30° = 1/√3 and tan 60° = √3". Only the angles in the item appear.
  const TAN_TEXT = { 30: "tan 30° = 1/√3", 45: "tan 45° = 1", 60: "tan 60° = √3" };
  const tanValues = (pair) => [pair.far, pair.near].sort((a, b) => a - b).map((angle) => TAN_TEXT[angle]).join(" and ");

  // Angle pairs (farther, nearer) with exact tangents: tan 30° = 1/√3,
  // tan 45° = 1, tan 60° = √3. For each, the height h and the nearer
  // distance x per unit of separation d, as "a + b√3" over a denominator.
  const ELEVATION_PAIRS = [
    { far: 30, near: 60, h: [0, 1, 2], x: [1, 0, 2] }, // h = d√3/2, x = d/2
    { far: 30, near: 45, h: [1, 1, 2], x: [1, 1, 2] }, // h = x = d(1 + √3)/2
    { far: 45, near: 60, h: [3, 1, 2], x: [1, 1, 2] }, // h = d(3 + √3)/2, x = d(1 + √3)/2
  ];

  const tanDeg = (degrees) => Math.tan(toRad(degrees));

  // "5√3", "12", "5 + 5√3", or "15 + 5√3" for d·(a + b√3)/c; null unless whole.
  function rootForm(d, [a, b, c]) {
    const whole = (d * a) / c;
    const root = (d * b) / c;
    if (!Number.isInteger(whole) || !Number.isInteger(root)) return null;
    const rootText = root === 0 ? "" : `${root === 1 ? "" : fmt(root)}√3`;
    if (!whole) return rootText || "0";
    return rootText ? `${fmt(whole)} + ${rootText}` : fmt(whole);
  }

  const SIGHT_SCENES = [
    { object: "a vertical tower", top: "the top of the tower", people: "Two surveyors", units: "meters", ask: "the height of the tower" },
    { object: "a vertical flagpole", top: "the top of the flagpole", people: "Two students", units: "feet", ask: "the height of the flagpole" },
    { object: "a vertical lighthouse", top: "the top of the lighthouse", people: "Two observers", units: "meters", ask: "the height of the lighthouse" },
    { object: "a vertical cliff", top: "the top of the cliff", people: "Two hikers", units: "feet", ask: "the height of the cliff" },
    { object: "a vertical radio antenna", top: "the top of the antenna", people: "Two engineers", units: "meters", ask: "the height of the antenna" },
    { object: "a vertical wall of a building", top: "the top of the wall", people: "Two painters", units: "feet", ask: "the height of the wall" },
  ];

  const twoObservers = {
    id: "two-observer-elevation",
    domain: DOMAIN,
    skill: "Right triangles and trigonometry",
    subskill: "trigonometric ratios",
    difficulty: "Hard",
    title: "One height seen from two places",
    recognize:
      "Neither right triangle can be solved alone: the height and the nearer distance are both unknown. Write the height " +
      "twice, once from each angle (h = x tan β and h = (x + d) tan α), and solve the pair; the special angles make the " +
      "tangents exact.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["neighbouring-rule", "intermediate-value", "wrong-quantity"],
    build(t) {
      const askHeight = t.chance(0.65);
      return retry(() => {
        const pair = t.pick(ELEVATION_PAIRS);
        const scene = t.pick(SIGHT_SCENES);
        const d = 2 * t.int(3, 45);
        const tf = tanDeg(pair.far);
        const tn = tanDeg(pair.near);
        const x = (d * tf) / (tn - tf);
        const h = x * tn;
        const keyText = rootForm(d, askHeight ? pair.h : pair.x);
        if (!keyText) return null;
        const keyValue = askHeight ? h : x;
        const numeric = Number.isInteger(Math.round(keyValue * 1e9) / 1e9) && t.chance(0.5);
        // Wrong answers as values, printed in the same a + b√3 form when exact.
        const exact = (value) => {
          for (const c of [1, 2, 3, 4, 6]) {
            for (let b = -60; b <= 60; b += 1) {
              const a = value * c - b * Math.sqrt(3) * 1;
              if (Math.abs(a - Math.round(a)) < 1e-6) {
                const text = rootForm(1, [Math.round(a), b, c]);
                if (text && !text.includes("−") && Math.abs(C.choiceValue(text) - value) < 1e-6) return text;
              }
            }
          }
          return null;
        };
        const list = askHeight
          ? [
            [d * tn, `Uses only the nearer angle, ${pair.near}°, with the distance between the people, ${d}, as if the nearer person stood ${d} ${scene.units} from the base.`],
            [d * tf, `Uses only the farther angle, ${pair.far}°, with ${d} as its whole horizontal distance.`],
            [(d * tf * tn) / (tf + tn), "Places the two people on opposite sides of the base instead of on the same side."],
            [d * (tn - tf), "Subtracts the two tangents and multiplies by the distance between the people."],
            [x, "Finds the nearer person's distance from the base and stops."],
            [h / Math.sin(toRad(pair.near)), "Gives the length of the nearer line of sight, the hypotenuse, instead of the height."],
          ]
          : [
            [d, "Assumes the nearer person is as far from the base as the two people are from each other."],
            [h, `Gives ${scene.ask} instead of the nearer person's distance from the base.`],
            [x + d, "Gives the farther person's distance from the base."],
            [d * tf, `Uses only the farther angle, ${pair.far}°, with ${d} as its horizontal distance.`],
          ];
        const printed = list.map(([value, reason]) => [value > 0 ? (Number.isInteger(Math.round(value * 1e9) / 1e9) ? Math.round(value) : exact(value)) : null, reason]);
        const wrong = wrongFor(t, numeric, numeric ? Math.round(keyValue) : keyText, printed, { positive: true });
        if (!wrong) return null;
        // Figure to scale: ground, the object, both lines of sight.
        const model = { F: [-(x + d), 0], N: [-x, 0], B: [0, 0], T: [0, h] };
        const map = fitPoints(Object.values(model), 400, 250, 40);
        const sc = Object.fromEntries(Object.entries(model).map(([k, p]) => [k, map(p)]));
        const parts = [
          seg([12, sc.B[1]], [388, sc.B[1]], 1.5),
          seg(sc.B, sc.T, 3),
          seg(sc.F, sc.T, 1.5, true),
          seg(sc.N, sc.T, 1.5, true),
          P.dot(sc.F[0], sc.F[1]), P.dot(sc.N[0], sc.N[1]),
          angleArc(sc.F, sc.B, sc.T, 22),
          angleLabel(sc.F, sc.B, sc.T, `${pair.far}°`, 44, 14),
          angleArc(sc.N, sc.B, sc.T, 20),
          angleLabel(sc.N, sc.B, sc.T, `${pair.near}°`, 38, 14),
          unitText(add(mid(sc.F, sc.N), [0, 16]), `${d} ${scene.units === "meters" ? "m" : "ft"}`, "middle", 14),
          C.rightMark(sc.B, sc.T, [sc.B[0] - 10, sc.B[1]], 9),
        ];
        if (C.labelsClash(parts, 400, 250)) return null;
        const alt =
          `Level ground with ${scene.object} at the right. Two points on the ground to the left of it are ${d} ${scene.units} apart; dashed lines of sight run from each point to ${scene.top}. ` +
          `The angle of elevation is marked ${pair.far}° at the farther point and ${pair.near}° at the nearer point. The figure is drawn to scale.`;
        const asked = askHeight ? `${scene.ask}` : `the distance from the nearer person to the base of ${scene.object.replace(/^a vertical /, "the ")}`;
        const stem =
          `${scene.people} stand on level ground in a straight line with the base of ${scene.object}, on the same side of it and ${d} ${scene.units} apart, as shown. ` +
          `From the farther person, the angle of elevation to ${scene.top} is ${pair.far}°; from the nearer person, it is ${pair.near}°. ` +
          (numeric
            ? `What is ${asked}, in ${scene.units}?`
            : `Which of the following is ${asked}, in ${scene.units}?`);
        const hText = rootForm(d, pair.h);
        const xText = rootForm(d, pair.x);
        return {
          responseType: numeric ? "numeric" : "multiple-choice",
          estimatedSeconds: 140,
          stimulus: null,
          figure: { svg: S.svg(400, 250, parts, alt), alt, notToScale: false },
          stem,
          correct: numeric ? Math.round(keyValue) : keyText,
          wrong,
          hint: "Call the nearer distance x. How can the height be written using each angle?",
          explanation:
            `Let x be the nearer person's distance from the base and h the height. From the nearer person, h = x tan ${pair.near}°; from the farther person, ` +
            `h = (x + ${d}) tan ${pair.far}°. With ${tanValues(pair)}, setting the two equal gives x = ${xText} and h = ${hText}.`,
          steps: [
            `Nearer triangle: h = x · tan ${pair.near}°.`,
            `Farther triangle: h = (x + ${d}) · tan ${pair.far}°.`,
            `Solve: x = ${xText}, h = ${hText}.`,
          ],
          principles: [
            `tan θ = opposite/adjacent in a right triangle; here ${tanValues(pair)}.`,
            "Two right triangles that share a side give two equations for the same unknown.",
          ],
          trap: `The ${d} ${scene.units} is the distance between the people, not either person's distance from the base, so neither triangle can be solved by itself.`,
          verify: () => {
            // Measure the constructed angles and lengths.
            const atF = angleAt(model.F, model.B, model.T);
            const atN = angleAt(model.N, model.B, model.T);
            const measured = askHeight ? dist(model.B, model.T) : dist(model.N, model.B);
            return close(atF, pair.far, 1e-9) && close(atN, pair.near, 1e-9) && close(measured, C.choiceValue(keyText), 1e-9);
          },
        };
      });
    },
  };

  return [ratioRead, specialRight, pythagoreanTwoStep, trigContext, cofunctionAngles, trigCofunction, unitCircle, twoObservers];
});
