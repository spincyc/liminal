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

  return { escapeXml, svg, svgParts };
});
