"use strict";

// Figure kit: deterministic, dependency-free SVG drawing for weekly-course
// figures (tooling only; authors commit the SVG output, never this code's
// results by hand). Every primitive returns SVG element strings that
// render.js's allow-list keeps unchanged: svg, g, line, polyline, polygon,
// circle, rect, path, text and tspan, painted in currentColor, with
// arrowheads drawn as polygons (no markers, defs or clip paths). Coordinates
// are rounded to 0.1 px, so the same call always yields the same bytes.
//
//   const K = require("./tools/lib/figure-kit");
//   const G = K.graph({ xMin: -1, xMax: 4, yMin: -2, yMax: 6, xName: "x", yName: "y" });
//   const svg = K.svg(G.width, G.height, G.grid(), G.axes(), G.curve(x => x * x - 1));
//   K.save("content/weekly/figures/ap/calculus-ab/ab-w05-f1.svg", svg);
//
// Two coordinate systems: pixel primitives (block, spring, arrow, …) take
// SVG pixels with y pointing down; graph(), numberLine(), timeGraph() and
// their methods take data coordinates. Angles are degrees counterclockwise
// from +x as on paper (y up), whatever the coordinate system.

const fs = require("node:fs");
const path = require("node:path");
const { checkFigureSvg, MAX_FIGURE_BYTES } = require("./weekly-figures");

const STYLE = Object.freeze({ stroke: 2, thin: 1.25, hair: 1, font: 14, small: 12, head: 9, family: "sans-serif", tint: 0.16 });
const MINUS = "−";
const MAX_ATTRIBUTE = 4800; // the renderer drops attribute values over 5000 characters

/* ---------------------------------------------------------------- basics */

function num(value) {
  if (!Number.isFinite(value)) throw new Error("figure-kit: non-finite coordinate");
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}
function escapeXml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function rad(degrees) { return (degrees * Math.PI) / 180; }
// Unit vector for a paper angle, in SVG pixels (y down).
function dir(degrees) { return [Math.cos(rad(degrees)), -Math.sin(rad(degrees))]; }
// Numbers with a true minus sign; up to three decimals.
function tickText(value) {
  const rounded = Math.round(value * 1000) / 1000;
  return rounded < 0 ? MINUS + Math.abs(rounded) : String(Object.is(rounded, -0) ? 0 : rounded);
}
// Multiples of π for radian axes: piText(Math.PI / 2) -> "π/2".
function piText(value) {
  const k = Math.round((value / Math.PI) * 12);
  if (Math.abs(k * Math.PI / 12 - value) > 1e-9) return tickText(value);
  if (k === 0) return "0";
  let n = k, d = 12;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const g = gcd(n, d); n /= g; d /= g;
  const sign = n < 0 ? MINUS : "";
  const top = Math.abs(n) === 1 ? "π" : Math.abs(n) + "π";
  return sign + (d === 1 ? top : top + "/" + d);
}

function paint(o, defaults) {
  const settings = { ...defaults, ...o };
  let out = "";
  if (settings.fill !== undefined) out += ` fill="${settings.fill}"`;
  if (settings.fillOpacity !== undefined) out += ` fill-opacity="${settings.fillOpacity}"`;
  if (settings.stroke !== undefined) out += ` stroke="${settings.stroke}"`;
  if (settings.width !== undefined && settings.stroke !== "none") out += ` stroke-width="${settings.width}"`;
  if (settings.opacity !== undefined) out += ` stroke-opacity="${settings.opacity}"`;
  if (settings.dashed) out += ` stroke-dasharray="${settings.dashed === true ? "6 4" : settings.dashed}"`;
  if (settings.cap) out += ` stroke-linecap="${settings.cap}"`;
  if (settings.join) out += ` stroke-linejoin="${settings.join}"`;
  return out;
}
const STROKED = { fill: "none", stroke: "currentColor", width: STYLE.stroke };

function line(x1, y1, x2, y2, o = {}) {
  return `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}"${paint(o, { stroke: "currentColor", width: STYLE.stroke })}/>`;
}
function pointList(points) { return points.map(([x, y]) => num(x) + "," + num(y)).join(" "); }
function polyline(points, o = {}) {
  // Long point lists split into joined chunks that the renderer keeps.
  const chunks = [];
  let current = [];
  for (const point of points) {
    current.push(point);
    if (pointList(current).length > MAX_ATTRIBUTE - 40) { chunks.push(current); current = [point]; }
  }
  if (current.length > 1 || !chunks.length) chunks.push(current);
  return chunks.map(chunk => `<polyline points="${pointList(chunk)}"${paint(o, { ...STROKED, join: "round", cap: "round" })}/>`).join("");
}
function polygon(points, o = {}) {
  return `<polygon points="${pointList(points)}"${paint(o, STROKED)}/>`;
}
function circle(cx, cy, r, o = {}) {
  return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(r)}"${paint(o, STROKED)}/>`;
}
function rect(x, y, w, h, o = {}) {
  return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}"${paint(o, STROKED)}/>`;
}
// Path from commands [["M", x, y], ["L", x, y], ["A", r, r, 0, large, sweep, x, y], ["Z"]];
// long command lists split into several paths.
function path_(commands, o = {}) {
  const chunks = [];
  let d = "";
  for (const [op, ...args] of commands) {
    const piece = op + args.map((a, i) => (op === "A" && i >= 2 && i <= 4 ? String(a) : num(a))).join(" ");
    if (d && op === "M" && d.length + piece.length > MAX_ATTRIBUTE) { chunks.push(d); d = ""; }
    d += piece;
  }
  if (d) chunks.push(d);
  return chunks.map(value => `<path d="${value}"${paint(o, STROKED)}/>`).join("");
}
function dot(cx, cy, r = 3.5) { return circle(cx, cy, r, { fill: "currentColor", stroke: "none" }); }
function openDot(cx, cy, r = 4) { return circle(cx, cy, r, { fill: "none", width: 1.75 }); }

// Text with simple sub/superscripts: "F_N", "v_{0x}", "x^2", "m_1g".
// o: size, anchor (start|middle|end), italic, bold, baseline (default central).
function text(x, y, content, o = {}) {
  const size = o.size || STYLE.font;
  const runs = [];
  const source = String(content);
  for (let i = 0; i < source.length;) {
    const mark = source[i];
    if ((mark === "_" || mark === "^") && i + 1 < source.length) {
      let body;
      if (source[i + 1] === "{") {
        const end = source.indexOf("}", i + 2);
        body = source.slice(i + 2, end < 0 ? source.length : end);
        i = end < 0 ? source.length : end + 1;
      } else { body = source[i + 1]; i += 2; }
      runs.push({ shift: mark === "_" ? 1 : -1, text: body });
    } else {
      const last = runs[runs.length - 1];
      if (last && last.shift === 0) last.text += mark; else runs.push({ shift: 0, text: mark });
      i += 1;
    }
  }
  const small = Math.max(STYLE.small - 1, Math.round(size * 0.72));
  const offset = { 0: 0, 1: Math.round(size * 0.3), "-1": -Math.round(size * 0.4) };
  let current = 0;
  const body = runs.length === 1 && runs[0].shift === 0 ? escapeXml(runs[0].text) : runs.map(run => {
    const target = offset[run.shift];
    const dy = target - current; current = target;
    return `<tspan${dy ? ` dy="${dy}"` : ""}${run.shift ? ` font-size="${small}"` : ""}>${escapeXml(run.text)}</tspan>`;
  }).join("");
  const style = (o.italic ? ' font-style="italic"' : "") + (o.bold ? ' font-weight="bold"' : "");
  return `<text x="${num(x)}" y="${num(y)}" fill="currentColor" font-size="${size}" font-family="${o.family || STYLE.family}"${style} text-anchor="${o.anchor || "middle"}" dominant-baseline="${o.baseline || "central"}">${body}</text>`;
}
function group(parts, transform) {
  return `<g${transform ? ` transform="${transform}"` : ""}>${flatten(parts).join("")}</g>`;
}

function flatten(parts) {
  const out = [];
  (function walk(value) {
    if (value === null || value === undefined || value === false || value === "") return;
    if (Array.isArray(value)) value.forEach(walk);
    else if (typeof value === "object" && value.parts) walk(value.parts);
    else out.push(String(value));
  })(parts);
  return out;
}
// The figure document: an <svg> with only xmlns and viewBox. Width and
// height come from the viewBox; the renderer scales it to the column.
function svg(width, height, ...parts) {
  if (!(width > 0 && height > 0)) throw new Error("figure-kit: svg needs a positive size");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(width)} ${num(height)}">${flatten(parts).join("")}</svg>\n`;
}

/* ---------------------------------------------------------------- arrows */

function head(x, y, ux, uy, size = STYLE.head) {
  const back = [x - ux * size, y - uy * size];
  const half = size * 0.45;
  return polygon([[x, y], [back[0] - uy * half, back[1] + ux * half], [back[0] + uy * half, back[1] - ux * half]], { fill: "currentColor", stroke: "none" });
}
// Straight arrow in pixels. o: width, dashed, both (two heads), head (size),
// label, labelSide (+1 left of travel, −1 right), labelOffset.
function arrow(x1, y1, x2, y2, o = {}) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length < 1e-6) return "";
  const ux = (x2 - x1) / length, uy = (y2 - y1) / length;
  const size = o.head || Math.max(STYLE.head, (o.width || STYLE.stroke) * 3.5);
  const inset = Math.min(size * 0.8, length / 2);
  const parts = [line(o.both ? x1 + ux * inset : x1, o.both ? y1 + uy * inset : y1, x2 - ux * inset, y2 - uy * inset, { width: o.width || STYLE.stroke, dashed: o.dashed })];
  parts.push(head(x2, y2, ux, uy, size));
  if (o.both) parts.push(head(x1, y1, -ux, -uy, size));
  if (o.label) {
    const side = o.labelSide || 1, gap = o.labelOffset || 12;
    parts.push(text((x1 + x2) / 2 + uy * gap * side, (y1 + y2) / 2 - ux * gap * side, o.label, { italic: o.italic !== false }));
  }
  return parts.join("");
}
// Arrow from (x, y) with a paper angle and length; label beyond the tip.
function vector(x, y, angle, length, o = {}) {
  const [ux, uy] = dir(angle);
  const parts = [arrow(x, y, x + ux * length, y + uy * length, { ...o, label: undefined })];
  if (o.label) parts.push(text(x + ux * (length + (o.labelGap || 14)), y + uy * (length + (o.labelGap || 14)), o.label, { italic: o.italic !== false }));
  return parts.join("");
}
// Circular arc (paper angles, counterclockwise from `from` to `to`).
function arcPath(cx, cy, r, from, to, o = {}) {
  const [x1, y1] = [cx + r * Math.cos(rad(from)), cy - r * Math.sin(rad(from))];
  const [x2, y2] = [cx + r * Math.cos(rad(to)), cy - r * Math.sin(rad(to))];
  const sweepAngle = to - from;
  const large = Math.abs(sweepAngle) % 360 > 180 ? 1 : 0;
  return path_([["M", x1, y1], ["A", r, r, 0, large, sweepAngle > 0 ? 0 : 1, x2, y2]], { width: o.width || STYLE.thin, dashed: o.dashed });
}
// Angle mark with an optional label at the bisector.
function angleArc(cx, cy, r, from, to, o = {}) {
  const parts = [arcPath(cx, cy, r, from, to, o)];
  if (o.label) {
    const mid = (from + to) / 2, gap = o.labelGap || 12;
    parts.push(text(cx + (r + gap) * Math.cos(rad(mid)), cy - (r + gap) * Math.sin(rad(mid)), o.label, { italic: o.italic !== false, size: o.size }));
  }
  return parts.join("");
}
// Curved arrow along a circle, head at `to` (rotation, torque, angular velocity).
function curvedArrow(cx, cy, r, from, to, o = {}) {
  const sign = to > from ? 1 : -1;
  const headDeg = (STYLE.head * 0.8 / r) * (180 / Math.PI) * sign;
  const parts = [arcPath(cx, cy, r, from, to - headDeg, { width: o.width || 1.75 })];
  const [ex, ey] = [cx + r * Math.cos(rad(to)), cy - r * Math.sin(rad(to))];
  const tangent = dir(to + 90 * sign);
  parts.push(head(ex, ey, tangent[0], tangent[1]));
  if (o.label) {
    const mid = (from + to) / 2, gap = o.labelGap || 14;
    parts.push(text(cx + (r + gap) * Math.cos(rad(mid)), cy - (r + gap) * Math.sin(rad(mid)), o.label, { italic: o.italic !== false }));
  }
  return parts.join("");
}
// Dimension line with extension ticks and a centered label, offset to the
// left of travel by o.offset pixels.
function dimension(x1, y1, x2, y2, label, o = {}) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const nx = (y2 - y1) / length, ny = -(x2 - x1) / length;
  const off = o.offset === undefined ? 14 : o.offset;
  const [a, b] = [[x1 + nx * off, y1 + ny * off], [x2 + nx * off, y2 + ny * off]];
  const parts = [line(x1 + nx * 3, y1 + ny * 3, a[0] + nx * 5, a[1] + ny * 5, { width: STYLE.hair }), line(x2 + nx * 3, y2 + ny * 3, b[0] + nx * 5, b[1] + ny * 5, { width: STYLE.hair }),
    arrow(a[0], a[1], b[0], b[1], { both: true, width: STYLE.hair, head: 7 })];
  if (label) parts.push(text((a[0] + b[0]) / 2 + nx * 12, (a[1] + b[1]) / 2 + ny * 12, label, { italic: o.italic !== false }));
  return parts.join("");
}

/* ------------------------------------------------------- clipping (data) */

function clipSegment(x1, y1, x2, y2, box) {
  let t0 = 0, t1 = 1;
  const dx = x2 - x1, dy = y2 - y1;
  for (const [p, q] of [[-dx, x1 - box.xMin], [dx, box.xMax - x1], [-dy, y1 - box.yMin], [dy, box.yMax - y1]]) {
    if (p === 0) { if (q < 0) return null; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
}
function clipHalf(points, inside, cross) {
  const out = [];
  points.forEach((current, i) => {
    const previous = points[(i + points.length - 1) % points.length];
    if (inside(current) !== inside(previous)) out.push(cross(previous, current));
    if (inside(current)) out.push(current);
  });
  return out;
}
function clipPolygonToBox(points, box) {
  const lerpX = (a, b, x) => [x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])];
  const lerpY = (a, b, y) => [a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y];
  let out = points;
  out = clipHalf(out, p => p[0] >= box.xMin, (a, b) => lerpX(a, b, box.xMin));
  out = clipHalf(out, p => p[0] <= box.xMax, (a, b) => lerpX(a, b, box.xMax));
  out = clipHalf(out, p => p[1] >= box.yMin, (a, b) => lerpY(a, b, box.yMin));
  out = clipHalf(out, p => p[1] <= box.yMax, (a, b) => lerpY(a, b, box.yMax));
  return out;
}
// Drops points within 0.25 px of the chord through their neighbours.
function thin(pixels) {
  if (pixels.length < 3) return pixels;
  const kept = [pixels[0]];
  let anchor = 0;
  const straight = (from, to) => {
    const [ax, ay] = pixels[from], [bx, by] = pixels[to];
    const chord = Math.hypot(bx - ax, by - ay) || 1;
    for (let k = from + 1; k < to; k++) {
      const [cx, cy] = pixels[k];
      if (Math.abs((bx - ax) * (ay - cy) - (ax - cx) * (by - ay)) / chord > 0.25) return false;
    }
    return true;
  };
  for (let i = 2; i < pixels.length; i++) if (!straight(anchor, i)) { anchor = i - 1; kept.push(pixels[anchor]); }
  kept.push(pixels[pixels.length - 1]);
  return kept;
}
function steps(low, high, step) {
  const values = [];
  for (let k = Math.ceil(low / step - 1e-9); k * step <= high + 1e-9; k++) values.push(Math.round(k * step * 1e9) / 1e9);
  return values;
}

/* ------------------------------------------------------------------ graph */

// A to-scale coordinate graph. Options: xMin, xMax, yMin, yMax (any window;
// an axis sits at 0 when 0 is inside the window, otherwise at the low edge),
// width/height (plot area in px; default 320 × 220), equal (same px per unit
// on both axes, from width), xStep/yStep (grid spacing), xLabelStep/
// yLabelStep (numbered ticks), xTicks/yTicks (explicit values),
// xFormat/yFormat (tick text, e.g. K.piText), xName/yName (axis names, e.g.
// "t (s)"), grid (false hides it), origin (false hides the 0 label).
function graph(o) {
  const box = { xMin: o.xMin, xMax: o.xMax, yMin: o.yMin, yMax: o.yMax };
  [box.xMin, box.xMax, box.yMin, box.yMax].forEach(v => { if (!Number.isFinite(v)) throw new Error("figure-kit: graph window must be finite"); });
  if (!(box.xMax > box.xMin && box.yMax > box.yMin)) throw new Error("figure-kit: empty graph window");
  const xStep = o.xStep || 1, yStep = o.yStep || 1;
  const plotW = o.width || 320;
  const unitX = plotW / (box.xMax - box.xMin);
  const unitY = o.equal ? unitX : (o.height || 220) / (box.yMax - box.yMin);
  const plotH = unitY * (box.yMax - box.yMin);
  const xFormat = o.xFormat || tickText, yFormat = o.yFormat || tickText;
  const labelEvery = (min, max, step, given) => given || step * (Math.round((max - min) / step) > 12 ? 2 : 1);
  const xTicks = o.xTicks || steps(box.xMin, box.xMax, labelEvery(box.xMin, box.xMax, xStep, o.xLabelStep));
  const yTicks = o.yTicks || steps(box.yMin, box.yMax, labelEvery(box.yMin, box.yMax, yStep, o.yLabelStep));
  const xAxisAt = box.yMin <= 0 && box.yMax >= 0 ? 0 : box.yMin;
  const yAxisAt = box.xMin <= 0 && box.xMax >= 0 ? 0 : box.xMin;
  const yDigits = Math.max(1, ...yTicks.map(v => yFormat(v).length));
  const yNameRoom = o.yName ? 18 : 0;
  const margin = { left: Math.max(30, 14 + 7.2 * yDigits), right: o.xName ? Math.max(24, 8 + 7.2 * String(o.xName).length) : 18, top: 14 + yNameRoom, bottom: 30 };
  const width = Math.ceil(margin.left + plotW + margin.right);
  const height = Math.ceil(margin.top + plotH + margin.bottom);
  const px = x => margin.left + (x - box.xMin) * unitX;
  const py = y => margin.top + (box.yMax - y) * unitY;

  function grid() {
    if (o.grid === false) return [];
    const style = { width: STYLE.hair, opacity: 0.2 };
    const d = [
      ...steps(box.xMin, box.xMax, xStep).filter(x => x !== yAxisAt).map(x => [["M", px(x), py(box.yMin)], ["V", py(box.yMax)]]),
      ...steps(box.yMin, box.yMax, yStep).filter(y => y !== xAxisAt).map(y => [["M", px(box.xMin), py(y)], ["H", px(box.xMax)]]),
    ].flat();
    return d.length ? [path_(d, style)] : [];
  }
  function axes() {
    const parts = [
      arrow(px(box.xMin), py(xAxisAt), px(box.xMax) + 10, py(xAxisAt), { width: 1.5, head: 8 }),
      arrow(px(yAxisAt), py(box.yMin), px(yAxisAt), py(box.yMax) - 10, { width: 1.5, head: 8 }),
    ];
    const tickPath = [];
    const atOrigin = xAxisAt === 0 && yAxisAt === 0;
    xTicks.forEach(x => {
      if (atOrigin && Math.abs(x) < 1e-9) return;
      tickPath.push(["M", px(x), py(xAxisAt) - 4], ["V", py(xAxisAt) + 4]);
      parts.push(text(px(x), py(xAxisAt) + 15, xFormat(x), { size: STYLE.small }));
    });
    yTicks.forEach(y => {
      if (atOrigin && Math.abs(y) < 1e-9) return;
      tickPath.push(["M", px(yAxisAt) - 4, py(y)], ["H", px(yAxisAt) + 4]);
      parts.push(text(px(yAxisAt) - 8, py(y), yFormat(y), { size: STYLE.small, anchor: "end" }));
    });
    if (tickPath.length) parts.push(path_(tickPath, { width: 1.5 }));
    if (o.origin !== false && atOrigin) parts.push(text(px(0) - 7, py(0) + 13, "0", { size: STYLE.small, anchor: "end" }));
    if (o.xName) parts.push(text(px(box.xMax) + 14, py(xAxisAt), o.xName, { anchor: "start", italic: o.italicNames !== false && String(o.xName).length === 1 }));
    if (o.yName) parts.push(text(px(yAxisAt), py(box.yMax) - 22, o.yName, { italic: o.italicNames !== false && String(o.yName).length === 1 }));
    return parts;
  }
  function segment(x1, y1, x2, y2, s = {}) {
    const c = clipSegment(x1, y1, x2, y2, box);
    return c ? line(px(c[0]), py(c[1]), px(c[2]), py(c[3]), { width: s.width || 2.25, dashed: s.dashed, cap: "round" }) : "";
  }
  // y = f(x) sampled and clipped; breaks at non-finite values and jumps
  // larger than the window height (asymptotes). s: from, to, samples, dashed, width.
  function curve(fn, s = {}) {
    const from = Math.max(box.xMin, s.from === undefined ? box.xMin : s.from);
    const to = Math.min(box.xMax, s.to === undefined ? box.xMax : s.to);
    const n = s.samples || 360;
    const runs = [];
    let run = null, previous = null;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      const y = fn(x);
      if (!Number.isFinite(y)) { previous = null; run = null; continue; }
      if (previous && Math.abs(y - previous[1]) <= (box.yMax - box.yMin)) {
        const c = clipSegment(previous[0], previous[1], x, y, box);
        if (c) {
          if (!run) { run = [[c[0], c[1]]]; runs.push(run); }
          run.push([c[2], c[3]]);
          if (c[2] !== x || c[3] !== y) run = null;
        } else run = null;
      } else run = null;
      previous = [x, y];
    }
    return runs.filter(r => r.length > 1).map(r => polyline(thin(r.map(([x, y]) => [Math.round(px(x) * 10) / 10, Math.round(py(y) * 10) / 10])), { width: s.width || 2.25, dashed: s.dashed })).join("");
  }
  // Straight pieces through data points, e.g. a velocity–time graph.
  function piecewise(points, s = {}) {
    const parts = [];
    for (let i = 1; i < points.length; i++) parts.push(segment(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], s));
    return parts.join("");
  }
  function point(x, y, s = {}) { return s.open ? openDot(px(x), py(y), s.r || 4) : dot(px(x), py(y), s.r || 4); }
  function label(x, y, content, s = {}) {
    return text(px(x) + (s.dx === undefined ? 8 : s.dx), py(y) + (s.dy === undefined ? -10 : s.dy), content, { anchor: s.anchor || "start", italic: s.italic, size: s.size });
  }
  // Dashed guide lines at x = value or y = value across the window.
  function vline(x, s = {}) { return segment(x, box.yMin, x, box.yMax, { dashed: true, width: STYLE.thin, ...s }); }
  function hline(y, s = {}) { return segment(box.xMin, y, box.xMax, y, { dashed: true, width: STYLE.thin, ...s }); }
  function arrowData(x1, y1, x2, y2, s = {}) { return arrow(px(x1), py(y1), px(x2), py(y2), s); }
  // Tangent to f at x0 across the window (or ±s.span in x).
  function tangent(fn, x0, s = {}) {
    const h = 1e-5 * Math.max(1, Math.abs(x0));
    const m = (fn(x0 + h) - fn(x0 - h)) / (2 * h), y0 = fn(x0);
    const a = s.span ? x0 - s.span : box.xMin, b = s.span ? x0 + s.span : box.xMax;
    return segment(a, y0 + m * (a - x0), b, y0 + m * (b - x0), { width: s.width || 1.5, dashed: s.dashed });
  }
  // Shaded region between f and g (a function or a constant; default 0) on [a, b].
  function area(f, g = 0, a = box.xMin, b = box.xMax, s = {}) {
    const lower = typeof g === "function" ? g : () => g;
    const n = s.samples || 160;
    const top = [], bottom = [];
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      top.push([x, f(x)]); bottom.push([x, lower(x)]);
    }
    const shape = clipPolygonToBox([...top, ...bottom.reverse()], box);
    if (shape.length < 3) return "";
    return polygon(thin(shape.map(([x, y]) => [px(x), py(y)])), { fill: "currentColor", fillOpacity: s.opacity || STYLE.tint, stroke: "none" });
  }
  // Riemann rectangles (left, right, mid) or trapezoids (trap) for f on [a, b].
  function riemann(fn, a, b, n, method = "left", s = {}) {
    const w = (b - a) / n;
    const d = [];
    const clampY = y => Math.max(box.yMin, Math.min(box.yMax, y));
    for (let i = 0; i < n; i++) {
      const x0 = a + i * w, x1 = x0 + w;
      if (method === "trap") {
        d.push(["M", px(x0), py(clampY(0))], ["L", px(x0), py(clampY(fn(x0)))], ["L", px(x1), py(clampY(fn(x1)))], ["L", px(x1), py(clampY(0))], ["Z"]);
      } else {
        const sample = method === "right" ? x1 : method === "mid" ? (x0 + x1) / 2 : x0;
        const h = clampY(fn(sample));
        d.push(["M", px(x0), py(clampY(0))], ["V", py(h)], ["H", px(x1)], ["V", py(clampY(0))], ["Z"]);
      }
    }
    return path_(d, { fill: "currentColor", fillOpacity: s.opacity || 0.14, stroke: "currentColor", width: STYLE.thin });
  }
  // Slope field for dy/dx = slope(x, y): short segments at every grid point.
  function slopeField(slope, s = {}) {
    const sx = s.xStep || xStep, sy = s.yStep || yStep;
    const length = s.length || Math.min(sx * unitX, sy * unitY) * 0.6;
    const d = [];
    for (const x of steps(box.xMin, box.xMax, sx)) for (const y of steps(box.yMin, box.yMax, sy)) {
      const m = slope(x, y);
      let ux, uy;
      if (Number.isFinite(m)) { const vx = unitX, vy = -m * unitY, l = Math.hypot(vx, vy); ux = vx / l; uy = vy / l; } else if (s.vertical !== false) { ux = 0; uy = 1; } else continue;
      d.push(["M", px(x) - ux * length / 2, py(y) - uy * length / 2], ["l", ux * length, uy * length]);
    }
    return path_(d, { width: s.width || 1.5, cap: "round" });
  }
  return { box, width, height, px, py, unitX, unitY, grid, axes, segment, curve, piecewise, point, label, vline, hline, arrow: arrowData, tangent, area, riemann, slopeField,
    describe: () => `axes with ${o.xName || "x"} from ${xFormat(box.xMin)} to ${xFormat(box.xMax)} and ${o.yName || "y"} from ${yFormat(box.yMin)} to ${yFormat(box.yMax)}` };
}

// A graph of a quantity against time, axes at the left and bottom when the
// window does not contain the origin. o: quantity ("v"), unit ("m/s"),
// tMax, yMin, yMax, tStep, yStep, points ([[t, y], …], straight pieces) or
// fn (a curve), plus any graph() option. Returns { svg, graph }.
function timeGraph(o) {
  const G = graph({ xMin: o.tMin || 0, xMax: o.tMax, yMin: o.yMin, yMax: o.yMax, xStep: o.tStep || 1, yStep: o.yStep || 1,
    xName: o.tName || "t (s)", yName: o.yName || `${o.quantity || "v"} (${o.unit || "m/s"})`, width: o.width || 300, height: o.height || 200, ...o.graph });
  const parts = [G.grid(), G.axes()];
  if (o.points) parts.push(G.piecewise(o.points));
  if (o.fn) parts.push(G.curve(o.fn));
  return { graph: G, svg: svg(G.width, G.height, parts, o.extra ? o.extra(G) : []) };
}

/* ------------------------------------------------------------ number line */

// o: min, max, step (1), labelStep, width (px, 380), format, points
// [{ x, open, label }], intervals [{ from, to, openFrom, openTo }] where
// from/to may be ±Infinity for rays. Returns an svg string.
function numberLine(o) {
  const width = o.width || 380, height = o.height || 74, pad = 26;
  const x = v => pad + ((v - o.min) / (o.max - o.min)) * (width - 2 * pad);
  const y = 34;
  const format = o.format || tickText;
  const parts = [arrow(pad - 14, y, width - 6, y, { both: true, width: 1.5, head: 8 })];
  const ticks = [];
  for (const v of steps(o.min, o.max, o.step || 1)) ticks.push(["M", x(v), y - 6], ["V", y + 6]);
  parts.push(path_(ticks, { width: 1.5 }));
  for (const v of steps(o.min, o.max, o.labelStep || o.step || 1)) parts.push(text(x(v), y + 20, format(v), { size: STYLE.small }));
  for (const span of o.intervals || []) {
    const a = span.from === -Infinity ? pad - 12 : x(span.from), b = span.to === Infinity ? width - 8 : x(span.to);
    if (span.to === Infinity) parts.push(arrow(a, y, b, y, { width: 4, head: 11 }));
    else if (span.from === -Infinity) parts.push(arrow(b, y, a, y, { width: 4, head: 11 }));
    else parts.push(line(a, y, b, y, { width: 4 }));
    if (span.from !== -Infinity) parts.push(span.openFrom ? circle(a, y, 5, { fill: "none", width: 2 }) : dot(a, y, 5));
    if (span.to !== Infinity) parts.push(span.openTo ? circle(b, y, 5, { fill: "none", width: 2 }) : dot(b, y, 5));
  }
  for (const p of o.points || []) {
    parts.push(p.open ? circle(x(p.x), y, 5, { fill: "none", width: 2 }) : dot(x(p.x), y, 5));
    if (p.label) parts.push(text(x(p.x), y - 17, p.label, { italic: p.italic }));
  }
  return svg(width, height, parts);
}

/* ---------------------------------------------------- physics primitives */

// Hatched surface from (x1, y1) to (x2, y2); hatching on the right of travel
// (for ground drawn left to right, below it).
function hatch(x1, y1, x2, y2, o = {}) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / length, uy = (y2 - y1) / length;
  const nx = uy, ny = ux; // right of travel in pixels (y down)
  const gap = o.spacing || 9, size = o.size || 7;
  const d = [];
  for (let s = gap / 2; s < length; s += gap) {
    const bx = x1 + ux * s, by = y1 + uy * s;
    d.push(["M", bx, by], ["l", nx * size - ux * size * 0.7, ny * size - uy * size * 0.7]);
  }
  return [line(x1, y1, x2, y2, { width: STYLE.stroke }), path_(d, { width: STYLE.hair })].join("");
}
function ground(x1, x2, y, o) { return hatch(x1, y, x2, y, o); }
function ceiling(x1, x2, y, o) { return hatch(x2, y, x1, y, o); }
// A wall at x from y1 to y2; side "left" hatches to the left of the line.
function wall(x, y1, y2, side = "left", o) { return side === "left" ? hatch(x, Math.max(y1, y2), x, Math.min(y1, y2), o) : hatch(x, Math.min(y1, y2), x, Math.max(y1, y2), o); }

// Block centered at (cx, cy), rotated by a paper angle; label at center.
function block(cx, cy, w, h, o = {}) {
  const [ux, uy] = dir(o.angle || 0);
  const [nx, ny] = [uy, -ux];
  const corner = (a, b) => [cx + ux * a + nx * b, cy + uy * a + ny * b];
  const parts = [polygon([corner(-w / 2, -h / 2), corner(w / 2, -h / 2), corner(w / 2, h / 2), corner(-w / 2, h / 2)], { fill: o.fill ? "currentColor" : "none", fillOpacity: o.fill ? 0.12 : undefined })];
  if (o.label) parts.push(text(cx, cy, o.label, { italic: o.italic !== false }));
  return parts.join("");
}
// Incline: right triangle with its rise on the right. o: x, y (bottom-left
// corner), base, angle (degrees), angleLabel ("θ"), block ({ w, h, at
// (fraction along the slope), label }), ground (true). Returns
// { parts, top, bottom, along: [ux, uy], normal: [nx, ny], block: { cx, cy } }.
function incline(o) {
  const angle = o.angle, base = o.base || 240;
  const rise = base * Math.tan(rad(angle));
  const A = [o.x, o.y], B = [o.x + base, o.y], C = [o.x + base, o.y - rise];
  const along = dir(angle), normal = dir(angle + 90);
  const parts = [polygon([A, B, C], { fill: "currentColor", fillOpacity: 0.06 })];
  if (o.ground !== false) parts.push(ground(o.x - 20, o.x + base + 20, o.y));
  parts.push(angleArc(A[0], A[1], o.arc || 34, 0, angle, { label: o.angleLabel === undefined ? "θ" : o.angleLabel }));
  const result = { parts, top: C, bottom: A, along, normal };
  if (o.block) {
    const w = o.block.w || 44, h = o.block.h || 30, at = o.block.at === undefined ? 0.55 : o.block.at;
    const length = base / Math.cos(rad(angle));
    const bx = A[0] + along[0] * length * at + normal[0] * h / 2, by = A[1] + along[1] * length * at + normal[1] * h / 2;
    parts.push(block(bx, by, w, h, { angle, label: o.block.label }));
    result.block = { cx: bx, cy: by, w, h };
  }
  return result;
}
// Zigzag spring between two points with straight leads.
function spring(x1, y1, x2, y2, o = {}) {
  const coils = o.coils || 8, amplitude = o.amplitude || 7, lead = o.lead === undefined ? 10 : o.lead;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / length, uy = (y2 - y1) / length, nx = -uy, ny = ux;
  const body = length - 2 * lead;
  const points = [[x1, y1], [x1 + ux * lead, y1 + uy * lead]];
  for (let i = 0; i < coils * 2; i++) {
    const s = lead + body * (i + 0.5) / (coils * 2), side = i % 2 ? -1 : 1;
    points.push([x1 + ux * s + nx * amplitude * side, y1 + uy * s + ny * amplitude * side]);
  }
  points.push([x2 - ux * lead, y2 - uy * lead], [x2, y2]);
  const parts = [polyline(points, { width: 1.75 })];
  if (o.label) parts.push(text((x1 + x2) / 2 - nx * (amplitude + 13), (y1 + y2) / 2 - ny * (amplitude + 13), o.label, { italic: o.italic !== false }));
  return parts.join("");
}
// Pulley wheel with axle; mount "ceiling" hangs it from a hatched support
// mountLength px above, "none" draws only the wheel.
function pulley(cx, cy, r = 18, o = {}) {
  const parts = [circle(cx, cy, r, { width: 2 }), dot(cx, cy, 3)];
  if ((o.mount || "ceiling") === "ceiling") {
    const top = cy - r - (o.mountLength || 24);
    parts.push(line(cx, cy, cx, top, { width: 2 }), ceiling(cx - 30, cx + 30, top));
  }
  return parts.join("");
}
function rope(points, o = {}) { return polyline(points, { width: o.width || 1.5 }); }
// Pendulum from a pivot: o.angle in degrees from the downward vertical
// (positive swings right). Returns { parts, bob: [x, y] }.
function pendulum(o) {
  const x = o.x, y = o.y, L = o.length || 140, a = o.angle || 0, r = o.bob || 11;
  const bx = x + L * Math.sin(rad(a)), by = y + L * Math.cos(rad(a));
  const parts = [];
  if (o.ceiling !== false) parts.push(ceiling(x - 40, x + 40, y));
  if (o.vertical !== false && a !== 0) parts.push(line(x, y, x, y + L * 0.95, { width: STYLE.hair, dashed: true }));
  parts.push(line(x, y, bx, by, { width: 1.5 }), circle(bx, by, r, { fill: "currentColor", fillOpacity: 0.15 }), dot(x, y, 2.5));
  if (a && o.angleLabel !== null) parts.push(angleArc(x, y, o.arc || 36, -90, -90 + a, { label: o.angleLabel === undefined ? "θ" : o.angleLabel }));
  if (o.lengthLabel) parts.push(text((x + bx) / 2 + (a >= 0 ? 12 : -12) * Math.cos(rad(a)), (y + by) / 2 - 12 * Math.sin(rad(a)) * (a >= 0 ? 1 : -1), o.lengthLabel, { italic: true, anchor: a >= 0 ? "start" : "end" }));
  if (o.label) parts.push(text(bx + r + 6, by, o.label, { anchor: "start", italic: true }));
  return { parts, bob: [bx, by] };
}
// Free-body diagram: a dot (or box) with labeled force arrows from its
// center. forces: [{ angle, length, label, dashed }]. o.axes draws dashed
// reference axes (o.axesAngle tilts them, e.g. along an incline).
function fbd(o) {
  const cx = o.cx, cy = o.cy;
  const parts = [];
  if (o.axes) {
    const t = o.axesAngle || 0, reach = o.axesLength || 70;
    for (const a of [t, t + 90]) { const [ux, uy] = dir(a); parts.push(line(cx - ux * reach, cy - uy * reach, cx + ux * reach, cy + uy * reach, { width: STYLE.hair, dashed: true })); }
  }
  if (o.body === "box") parts.push(block(cx, cy, o.size || 34, o.size || 34, { angle: o.bodyAngle || 0, label: o.label }));
  for (const force of o.forces || []) {
    const [ux, uy] = dir(force.angle);
    parts.push(arrow(cx, cy, cx + ux * force.length, cy + uy * force.length, { width: 2, dashed: force.dashed }));
    if (force.label) parts.push(text(cx + ux * (force.length + 15), cy + uy * (force.length + 15), force.label, { italic: true }));
  }
  if (o.body !== "box") parts.push(dot(cx, cy, 5));
  return parts.join("");
}
// A vector of magnitude `length` px at a paper angle with dashed x and y
// components and an angle mark. o.labels: { vector, x, y, angle }.
function components(x, y, angle, length, o = {}) {
  const [ux, uy] = dir(angle);
  const ex = x + ux * length, ey = y + uy * length;
  const labels = o.labels || {};
  return [
    arrow(x, y, ex, ey, { width: 2.25 }),
    Math.abs(ex - x) > 2 ? arrow(x, y, ex, y, { width: 1.5, dashed: true }) : "",
    Math.abs(ey - y) > 2 ? arrow(ex, y, ex, ey, { width: 1.5, dashed: true }) : "",
    labels.vector ? text(x + ux * length / 2 + uy * 14, y + uy * length / 2 - ux * 14, labels.vector, { italic: true }) : "",
    labels.x ? text((x + ex) / 2, y + (ey < y ? 14 : -14), labels.x, { italic: true }) : "",
    labels.y ? text(ex + (ex >= x ? 16 : -16), (y + ey) / 2, labels.y, { italic: true, anchor: ex >= x ? "start" : "end" }) : "",
    labels.angle ? angleArc(x, y, 28, ux >= 0 ? 0 : 180, angle, { label: labels.angle }) : "",
  ].join("");
}
// Object in uniform circular motion. o: cx, cy, r, angle (object position),
// direction ("ccw"), velocity / acceleration (arrow lengths, 0 to omit),
// labels ({ v, a, r }), center (true).
function circularMotion(o) {
  const { cx, cy, r } = o, a = o.angle === undefined ? 30 : o.angle;
  const [ux, uy] = dir(a);
  const x = cx + ux * r, y = cy + uy * r;
  const labels = { v: "v", a: "a_c", ...o.labels };
  const sign = o.direction === "cw" ? -1 : 1;
  const parts = [circle(cx, cy, r, { width: STYLE.thin, dashed: o.dashedPath ? true : undefined }), dot(cx, cy, 2.5)];
  if (o.radius !== false) parts.push(line(cx, cy, x, y, { width: STYLE.hair, dashed: true }));
  if (labels.r && o.radius !== false) parts.push(text(cx + ux * r * 0.3 - uy * 11, cy + uy * r * 0.3 + ux * 11, labels.r, { italic: true }));
  if (o.velocity !== 0) parts.push(vector(x, y, a + 90 * sign, o.velocity || 60, { label: labels.v }));
  if (o.acceleration !== 0) parts.push(arrow(x, y, x - ux * (o.acceleration || 45), y - uy * (o.acceleration || 45), { width: 2 }),
    text(x - ux * ((o.acceleration || 45) + 4) + uy * 12, y - uy * ((o.acceleration || 45) + 4) - ux * 12, labels.a, { italic: true }));
  parts.push(circle(x, y, 7, { fill: "currentColor", fillOpacity: 0.25 }));
  return parts.join("");
}
// Rotating disk with axle and optional rotation arrow ("ccw" or "cw").
function disk(o) {
  const { cx, cy, r } = o;
  const parts = [circle(cx, cy, r, { fill: "currentColor", fillOpacity: 0.08 }), dot(cx, cy, 3)];
  if (o.radius) parts.push(line(cx, cy, cx + r, cy, { width: STYLE.thin }), text(cx + r / 2, cy - 10, o.radius === true ? "R" : o.radius, { italic: true }));
  if (o.rotation) parts.push(o.rotation === "cw" ? curvedArrow(cx, cy, r + 12, 140, 40, { label: o.rotationLabel }) : curvedArrow(cx, cy, r + 12, 40, 140, { label: o.rotationLabel }));
  if (o.label) parts.push(text(cx, cy + r + (o.rotation ? 32 : 18), o.label, { italic: o.italic !== false }));
  return parts.join("");
}
// Rod as a thin rectangle from (x1, y1) to (x2, y2), with an optional pivot
// at fraction `pivot` along it and a mark at the center of mass.
function rod(o) {
  const length = Math.hypot(o.x2 - o.x1, o.y2 - o.y1);
  const angle = Math.atan2(-(o.y2 - o.y1), o.x2 - o.x1) * 180 / Math.PI;
  const parts = [block((o.x1 + o.x2) / 2, (o.y1 + o.y2) / 2, length, o.thickness || 8, { angle, fill: true })];
  if (o.pivot !== undefined && o.pivot !== null) {
    const px = o.x1 + (o.x2 - o.x1) * o.pivot, py = o.y1 + (o.y2 - o.y1) * o.pivot;
    parts.push(circle(px, py, 5, { fill: "none", width: 2 }), dot(px, py, 1.75));
  }
  if (o.label) parts.push(text((o.x1 + o.x2) / 2, (o.y1 + o.y2) / 2 - 16, o.label, { italic: true }));
  return parts.join("");
}
// Open container of liquid. o: x, y (top-left), width, height, level
// (fraction filled), object ({ w, h, depth: top below the surface in px,
// negative when floating above it, label }), label, surfaceMark (true).
// Returns { parts, surfaceY }.
function container(o) {
  const { x, y, width, height } = o;
  const surfaceY = y + height * (1 - (o.level === undefined ? 0.8 : o.level));
  const parts = [rect(x, surfaceY, width, y + height - surfaceY, { fill: "currentColor", fillOpacity: 0.12, stroke: "none" }),
    line(x, surfaceY, x + width, surfaceY, { width: STYLE.thin }),
    polyline([[x, y], [x, y + height], [x + width, y + height], [x + width, y]], { width: 2.5, join: "miter", cap: "butt" })];
  if (o.surfaceMark !== false) parts.push(polygon([[x + width - 22, surfaceY - 8], [x + width - 12, surfaceY - 8], [x + width - 17, surfaceY - 1]], { width: 1.25 }));
  if (o.object) {
    const w = o.object.w || 40, h = o.object.h || 30;
    const top = surfaceY + (o.object.depth || 0);
    parts.push(block(x + width / 2, top + h / 2, w, h, { label: o.object.label, fill: true }));
  }
  if (o.label) parts.push(text(x + width / 2, y + height + 16, o.label, { italic: o.italic }));
  return { parts, surfaceY };
}
// Horizontal pipe that narrows from diameter d1 to d2 (pixels). o: x, y
// (centerline), length, d1, d2, taper ([start, end] fractions), flow
// (arrow length, 0 to omit), labels ([wide, narrow]). Returns { parts, wide, narrow }.
function pipe(o) {
  const { x, y, length } = o, d1 = o.d1 || 60, d2 = o.d2 === undefined ? 30 : o.d2;
  const [t0, t1] = o.taper || [0.4, 0.6];
  const xs = [x, x + length * t0, x + length * t1, x + length];
  const top = [[xs[0], y - d1 / 2], [xs[1], y - d1 / 2], [xs[2], y - d2 / 2], [xs[3], y - d2 / 2]];
  const bottom = top.map(([px, py]) => [px, 2 * y - py]);
  const parts = [polyline(top, { width: 2.25 }), polyline(bottom, { width: 2.25 })];
  if (o.flow !== 0) parts.push(arrow(x + 12, y, x + 12 + (o.flow || 46), y, { width: 1.75, label: o.flowLabel, labelOffset: 10 }));
  const labels = o.labels || [];
  if (labels[0]) parts.push(text((xs[0] + xs[1]) / 2, y - d1 / 2 - 12, labels[0], { italic: true }));
  if (labels[1]) parts.push(text((xs[2] + xs[3]) / 2, y - d2 / 2 - 12, labels[1], { italic: true }));
  return { parts, wide: [(xs[0] + xs[1]) / 2, y], narrow: [(xs[2] + xs[3]) / 2, y] };
}
// Energy or momentum bar chart. o: bars ([{ label, value }], value null for a
// blank column), min, max (values), unit (px per value unit, default fits
// 140 px), groups ([{ title, from, to }] bar index ranges), barWidth, gap.
function barChart(o) {
  const bars = o.bars, bw = o.barWidth || 30, gap = o.gap || 16;
  const min = o.min === undefined ? Math.min(0, ...bars.map(b => b.value || 0)) : o.min;
  const max = o.max === undefined ? Math.max(1, ...bars.map(b => b.value || 0)) : o.max;
  const unit = o.unit || 140 / (max - min);
  const top = 26, left = 18;
  const zeroY = top + max * unit;
  const width = left * 2 + bars.length * (bw + gap) + gap;
  const height = top + (max - min) * unit + 34;
  const parts = [line(left, zeroY, width - left, zeroY, { width: 1.5 }), line(left, top - 8, left, top + (max - min) * unit, { width: 1.5 })];
  bars.forEach((bar, i) => {
    const bx = left + gap + i * (bw + gap);
    if (bar.value !== null && bar.value !== undefined && bar.value !== 0) {
      const h = bar.value * unit;
      parts.push(rect(bx, h > 0 ? zeroY - h : zeroY, bw, Math.abs(h), { fill: "currentColor", fillOpacity: 0.22, width: 1.5 }));
    }
    parts.push(text(bx + bw / 2, top + (max - min) * unit + 16, bar.label, { italic: true, size: 13 }));
  });
  for (const g of o.groups || []) {
    const a = left + gap + g.from * (bw + gap) - gap / 2, b = left + gap + (g.to + 1) * (bw + gap) - gap / 2;
    parts.push(text((a + b) / 2, 12, g.title, { size: 13 }));
    if (g.to + 1 < bars.length) parts.push(line(b, top - 10, b, top + (max - min) * unit + 4, { width: STYLE.hair, dashed: true }));
  }
  return svg(width, height, parts);
}
// Blank grid for student plotting: cols × rows cells of `cell` px with
// heavier axes at the left and bottom and optional axis names.
function blankGrid(o) {
  const cols = o.cols || 10, rows = o.rows || 8, cell = o.cell || 24;
  const left = o.yName ? 34 : 14, top = 24, w = cols * cell, h = rows * cell;
  const d = [];
  for (let i = 1; i <= cols; i++) d.push(["M", left + i * cell, top], ["V", top + h]);
  for (let j = 0; j < rows; j++) d.push(["M", left, top + j * cell], ["H", left + w]);
  const parts = [path_(d, { width: STYLE.hair, opacity: 0.35 }), line(left, top + h, left + w + 10, top + h, { width: 1.75 }), line(left, top + h, left, top - 10, { width: 1.75 })];
  if (o.xName) parts.push(text(left + w / 2, top + h + 18, o.xName, {}));
  if (o.yName) parts.push(text(12, top + h / 2, o.yName, {}).replace("<text ", `<text transform="rotate(-90 12 ${num(top + h / 2)})" `));
  return svg(left + w + 18, top + h + (o.xName ? 30 : 12), parts);
}

/* ---------------------------------------------------------------- output */

// Admission check (render.js allow-list round trip, currentColor, viewBox,
// size). Returns { bytes }; throws with the reason otherwise.
function check(svgText, where = "figure") {
  checkFigureSvg(svgText, where);
  return { bytes: Buffer.byteLength(svgText, "utf8") };
}
// Checks and writes a figure, creating directories; returns its byte size.
function save(file, svgText) {
  const { bytes } = check(svgText, path.basename(file));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== svgText) fs.writeFileSync(file, svgText);
  return bytes;
}

module.exports = {
  STYLE, MAX_FIGURE_BYTES, num, escapeXml, tickText, piText, dir,
  // low level
  svg, line, polyline, polygon, circle, rect, path: path_, dot, openDot, text, group, flatten,
  head, arrow, vector, arcPath, angleArc, curvedArrow, dimension,
  // math
  graph, timeGraph, numberLine, blankGrid,
  // physics
  hatch, ground, ceiling, wall, block, incline, spring, pulley, rope, pendulum, fbd, components, circularMotion, disk, rod, container, pipe, barChart,
  // output
  check, save,
};
