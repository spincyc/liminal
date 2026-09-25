// Inline SVG figures for question templates, drawn in currentColor.
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const deps = node
    ? {

    }
    : root.LiminalFamilyShared || {};
  const api = factory(deps);
  if (node) module.exports = api;
  else root.LiminalFamilyShared = Object.assign(root.LiminalFamilyShared || {}, api);
})(typeof self !== "undefined" ? self : this, function (deps) {
  "use strict";

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

  /* ------------------------------------------------------ coordinate plane */
  //
  // A to-scale xy-plane for graph questions: a light grid, axes with tick
  // marks and numbered labels, and drawing helpers that take data
  // coordinates. Only elements and attributes that render.js's SVG
  // allow-list keeps are used (line, polyline, polygon, circle, text; no
  // clip paths or markers), so lines, curves and shaded regions are clipped
  // to the window here, in arithmetic.
  //
  //   const P = S.plane({ xMin: -6, xMax: 6, yMin: -4, yMax: 8 });
  //   const parts = [...P.grid(), ...P.axes(), P.curve((x) => x * x - 3), P.point(2, 1)];
  //   const figure = { svg: P.svg(parts, alt), alt, notToScale: false };
  //
  // Options: xMin, xMax, yMin, yMax (the window, which must contain 0 on both
  // axes); xStep, yStep (grid spacing, default 1); xLabelStep, yLabelStep
  // (numbered ticks, default every grid line when there are at most 12,
  // otherwise every other); xTicks, yTicks (explicit numbered values);
  // unit (pixels per x unit, default fits 300 px); yUnit (pixels per y unit,
  // default equal to unit, so slopes look true); names ([x, y] axis names).
  // Coordinates that are not finite throw, so a broken draw fails loudly
  // instead of shipping "NaN" in an SVG.

  const MINUS_SIGN = "−";
  const tickText = (value) => {
    const rounded = Math.round(value * 1000) / 1000;
    return rounded < 0 ? `${MINUS_SIGN}${Math.abs(rounded)}` : String(rounded);
  };

  function finite(...values) {
    values.forEach((value) => {
      if (!Number.isFinite(value)) throw new Error("figure: non-finite coordinate");
    });
  }

  // Clips the segment (x1, y1)-(x2, y2) to the box (Liang-Barsky); returns
  // the visible part or null.
  function clipSegment(x1, y1, x2, y2, box) {
    let t0 = 0;
    let t1 = 1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const checks = [
      [-dx, x1 - box.xMin],
      [dx, box.xMax - x1],
      [-dy, y1 - box.yMin],
      [dy, box.yMax - y1],
    ];
    for (const [p, q] of checks) {
      if (p === 0) {
        if (q < 0) return null;
      } else {
        const r = q / p;
        if (p < 0) {
          if (r > t1) return null;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return null;
          if (r < t1) t1 = r;
        }
      }
    }
    return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
  }

  // Keeps the part of a polygon where a·x + b·y ≤ c (Sutherland-Hodgman).
  function clipPolygon(points, a, b, c) {
    const inside = ([x, y]) => a * x + b * y <= c + 1e-9;
    const out = [];
    points.forEach((current, index) => {
      const previous = points[(index + points.length - 1) % points.length];
      const currentIn = inside(current);
      const previousIn = inside(previous);
      if (currentIn !== previousIn) {
        const [x1, y1] = previous;
        const [x2, y2] = current;
        const denominator = a * (x2 - x1) + b * (y2 - y1);
        const t = denominator === 0 ? 0 : (c - a * x1 - b * y1) / denominator;
        out.push([x1 + t * (x2 - x1), y1 + t * (y2 - y1)]);
      }
      if (currentIn) out.push(current);
    });
    return out;
  }

  function plane(options) {
    const box = {
      xMin: options.xMin,
      xMax: options.xMax,
      yMin: options.yMin,
      yMax: options.yMax,
    };
    finite(box.xMin, box.xMax, box.yMin, box.yMax);
    if (!(box.xMin <= 0 && box.xMax >= 0 && box.yMin <= 0 && box.yMax >= 0 &&
      box.xMax > box.xMin && box.yMax > box.yMin)) {
      throw new Error("figure: the window must contain the origin");
    }
    const xStep = options.xStep || 1;
    const yStep = options.yStep || 1;
    const unit = options.unit || 300 / (box.xMax - box.xMin);
    const yUnit = options.yUnit || unit;
    const names = options.names || ["x", "y"];

    const steps = (low, high, step) => {
      const values = [];
      for (let k = Math.ceil(low / step - 1e-9); k * step <= high + 1e-9; k += 1) values.push(k * step);
      return values;
    };
    const xGrid = steps(box.xMin, box.xMax, xStep);
    const yGrid = steps(box.yMin, box.yMax, yStep);
    const every = (grid, step, explicit) => explicit || step * (grid.length > 13 ? 2 : 1);
    const xTicks = options.xTicks ||
      steps(box.xMin, box.xMax, every(xGrid, xStep, options.xLabelStep));
    const yTicks = options.yTicks ||
      steps(box.yMin, box.yMax, every(yGrid, yStep, options.yLabelStep));

    // Room on the left for the y-axis numbers when the axis sits at the edge.
    const yDigits = Math.max(1, ...yTicks.map((y) => tickText(y).length));
    const margin = { left: Math.max(34, 16 + 7 * yDigits), right: 22, top: 22, bottom: 30 };
    const width = Math.round(margin.left + (box.xMax - box.xMin) * unit + margin.right);
    const height = Math.round(margin.top + (box.yMax - box.yMin) * yUnit + margin.bottom);
    const px = (x) => margin.left + (x - box.xMin) * unit;
    const py = (y) => margin.top + (box.yMax - y) * yUnit;

    const thin = (x1, y1, x2, y2, extra) =>
      `<line x1="${round1(x1)}" y1="${round1(y1)}" x2="${round1(x2)}" y2="${round1(y2)}" stroke="currentColor"${extra}/>`;
    const small = (x, y, content, anchor) =>
      `<text x="${round1(x)}" y="${round1(y)}" fill="currentColor" font-size="12" font-family="sans-serif" text-anchor="${anchor}" dominant-baseline="middle">${escapeXml(content)}</text>`;

    // Light unit grid across the window.
    function grid() {
      if (options.grid === false) return [];
      return [
        ...xGrid.filter((x) => x !== 0).map((x) =>
          thin(px(x), py(box.yMin), px(x), py(box.yMax), ' stroke-width="1" stroke-opacity="0.18"')),
        ...yGrid.filter((y) => y !== 0).map((y) =>
          thin(px(box.xMin), py(y), px(box.xMax), py(y), ' stroke-width="1" stroke-opacity="0.18"')),
      ];
    }

    // Both axes, ticks with numbers (0 is shown as the origin O), and the
    // axis names at the positive ends.
    function axes() {
      const parts = [
        thin(px(box.xMin), py(0), px(box.xMax) + 8, py(0), ' stroke-width="1.5"'),
        thin(px(0), py(box.yMin), px(0), py(box.yMax) - 8, ' stroke-width="1.5"'),
      ];
      xTicks.filter((x) => Math.abs(x) > 1e-9).forEach((x) => {
        parts.push(thin(px(x), py(0) - 4, px(x), py(0) + 4, ' stroke-width="1.5"'));
        parts.push(small(px(x), py(0) + 14, tickText(x), "middle"));
      });
      yTicks.filter((y) => Math.abs(y) > 1e-9).forEach((y) => {
        parts.push(thin(px(0) - 4, py(y), px(0) + 4, py(y), ' stroke-width="1.5"'));
        parts.push(small(px(0) - 7, py(y), tickText(y), "end"));
      });
      // The origin's "O" only when no negative x number crowds it.
      if (!xTicks.some((x) => x < 0 && -x * unit < 34)) parts.push(small(px(0) - 7, py(0) + 12, "O", "end"));
      parts.push(svgParts.text(px(box.xMax) + 16, py(0), names[0]));
      parts.push(svgParts.text(px(0), py(box.yMax) - 14, names[1]));
      return parts;
    }

    // Segment in data coordinates, clipped to the window.
    function segment(x1, y1, x2, y2, style = {}) {
      finite(x1, y1, x2, y2);
      const clipped = clipSegment(x1, y1, x2, y2, box);
      if (!clipped) return "";
      const [a, b, c, d] = clipped;
      const dash = style.dashed ? ' stroke-dasharray="6 5"' : "";
      return thin(px(a), py(b), px(c), py(d), ` stroke-width="${style.width || 2.25}"${dash}`);
    }

    // The whole line a·x + b·y = c across the window.
    function line(a, b, c, style = {}) {
      finite(a, b, c);
      if (a === 0 && b === 0) throw new Error("figure: degenerate line");
      const span = 4 * (box.xMax - box.xMin + box.yMax - box.yMin);
      const [x0, y0] = b !== 0 ? [0, c / b] : [c / a, 0];
      const length = Math.hypot(a, b);
      const [dx, dy] = [-b / length, a / length];
      return segment(x0 - span * dx, y0 - span * dy, x0 + span * dx, y0 + span * dy, style);
    }

    // y = f(x) sampled as polylines, broken wherever it leaves the window.
    // style.from / style.to restrict the domain.
    function curve(fn, style = {}) {
      const from = Math.max(box.xMin, style.from === undefined ? box.xMin : style.from);
      const to = Math.min(box.xMax, style.to === undefined ? box.xMax : style.to);
      const samples = style.samples || 480;
      const runs = [];
      let run = null;
      let previous = null;
      for (let i = 0; i <= samples; i += 1) {
        const x = from + ((to - from) * i) / samples;
        const y = fn(x);
        finite(x, y);
        if (previous) {
          const clipped = clipSegment(previous[0], previous[1], x, y, box);
          if (clipped) {
            const [a, b, c, d] = clipped;
            if (!run) {
              run = [[a, b]];
              runs.push(run);
            }
            run.push([c, d]);
            if (c !== x || d !== y) run = null;
          } else run = null;
        }
        previous = [x, y];
      }
      const dash = style.dashed ? ' stroke-dasharray="6 5"' : "";
      // The sanitizer drops attribute values over 5000 characters, so each
      // run is thinned (points within 0.2 px of the chord are dropped) and
      // then written as polylines of at most 300 points that share ends.
      const chunks = [];
      runs.filter((points) => points.length > 1).forEach((points) => {
        const pixels = points.map(([x, y]) => [round1(px(x)), round1(py(y))]);
        const kept = [pixels[0]];
        let anchor = 0;
        // Extends each chord while every skipped point stays within 0.2 px.
        const straight = (from, to) => {
          const [ax, ay] = pixels[from];
          const [bx, by] = pixels[to];
          const chord = Math.hypot(bx - ax, by - ay) || 1;
          for (let k = from + 1; k < to; k += 1) {
            const [cx, cy] = pixels[k];
            if (Math.abs((bx - ax) * (ay - cy) - (ax - cx) * (by - ay)) / chord > 0.2) return false;
          }
          return true;
        };
        for (let i = 2; i < pixels.length; i += 1) {
          if (!straight(anchor, i)) {
            anchor = i - 1;
            kept.push(pixels[anchor]);
          }
        }
        kept.push(pixels[pixels.length - 1]);
        for (let start = 0; start < kept.length - 1; start += 299) chunks.push(kept.slice(start, start + 300));
      });
      return chunks.map((points) =>
        `<polyline points="${points.map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="${style.width || 2.25}" stroke-linejoin="round" stroke-linecap="round"${dash}/>`,
      ).join("");
    }

    // A dot; style.open draws a hollow circle.
    function point(x, y, style = {}) {
      finite(x, y);
      return style.open
        ? `<circle cx="${round1(px(x))}" cy="${round1(py(y))}" r="4" fill="none" stroke="currentColor" stroke-width="1.75"/>`
        : `<circle cx="${round1(px(x))}" cy="${round1(py(y))}" r="4" fill="currentColor"/>`;
    }

    // Shades the part of the window satisfying every constraint
    // [a, b, c, relation] meaning a·x + b·y (relation) c, with relation one of
    // "<", "<=", ">", ">=". Boundary lines are drawn separately with line().
    function region(constraints, style = {}) {
      let polygon = [[box.xMin, box.yMin], [box.xMax, box.yMin], [box.xMax, box.yMax], [box.xMin, box.yMax]];
      constraints.forEach(([a, b, c, relation]) => {
        finite(a, b, c);
        polygon = /</.test(relation) ? clipPolygon(polygon, a, b, c) : clipPolygon(polygon, -a, -b, -c);
      });
      if (polygon.length < 3) return "";
      return `<polygon points="${polygon.map(([x, y]) => `${round1(px(x))},${round1(py(y))}`).join(" ")}" fill="currentColor" fill-opacity="${style.opacity || 0.16}" stroke="none"/>`;
    }

    // Text at a data point, offset in pixels; style.italic for names.
    function label(x, y, content, style = {}) {
      finite(x, y);
      const anchor = style.anchor || "start";
      const dx = style.dx === undefined ? 8 : style.dx;
      const dy = style.dy === undefined ? -10 : style.dy;
      return style.italic
        ? svgParts.text(px(x) + dx, py(y) + dy, content, anchor)
        : `<text x="${round1(px(x) + dx)}" y="${round1(py(y) + dy)}" fill="currentColor" font-size="14" font-family="sans-serif" text-anchor="${anchor}" dominant-baseline="middle">${escapeXml(content)}</text>`;
    }

    return {
      box,
      width,
      height,
      px,
      py,
      grid,
      axes,
      segment,
      line,
      curve,
      point,
      region,
      label,
      svg: (parts, alt) => svg(width, height, parts, alt),
      // "an xy-plane with x from −6 to 6 and y from −4 to 8" for alt text.
      describe: () =>
        `an xy-plane with ${names[0]} from ${tickText(box.xMin)} to ${tickText(box.xMax)} and ` +
        `${names[1]} from ${tickText(box.yMin)} to ${tickText(box.yMax)}`,
    };
  }

  return { escapeXml, svg, svgParts, plane };
});
