"use strict";

// One sample of every figure-kit primitive. `node tools/figure-kit.js
// gallery <dir>` writes them for visual checking, and the tests admit each
// one, so a kit change that breaks the renderer's allow-list fails there.
// The samples are kit demonstrations, not course content.

const K = require("./figure-kit");

function samples() {
  const out = {};

  // Calculus: function graph with a tangent, labels and a point.
  {
    const G = K.graph({ xMin: -2, xMax: 4, yMin: -3, yMax: 5, xName: "x", yName: "y" });
    const f = x => 0.5 * x * x - x - 1;
    out["graph-tangent"] = K.svg(G.width, G.height, G.grid(), G.axes(), G.curve(f), G.tangent(f, 2.5, { dashed: true }), G.point(2.5, f(2.5)), G.label(2.5, f(2.5), "P", { italic: true }), G.label(3.4, f(3.4), "y = f(x)", { dx: -70, dy: -6 }));
  }
  // Radian axis with π ticks.
  {
    const G = K.graph({ xMin: 0, xMax: 2 * Math.PI, yMin: -1.5, yMax: 1.5, xStep: Math.PI / 2, yStep: 0.5, yLabelStep: 1, xFormat: K.piText, xName: "x", yName: "y", width: 340, height: 160 });
    out["graph-radians"] = K.svg(G.width, G.height, G.grid(), G.axes(), G.curve(Math.sin), G.curve(Math.cos, { dashed: true }));
  }
  // Window without the origin: axes sit at the low edges.
  {
    const G = K.graph({ xMin: 1, xMax: 6, yMin: 2, yMax: 10, yStep: 2, xName: "x", yName: "y", width: 260, height: 180 });
    out["graph-offset-window"] = K.svg(G.width, G.height, G.grid(), G.axes(), G.curve(x => 2 + 8 / x), G.vline(4));
  }
  // Asymptote handling: 1/(x − 1) breaks at x = 1.
  {
    const G = K.graph({ xMin: -3, xMax: 4, yMin: -5, yMax: 5, xName: "x", yName: "y", width: 280, height: 200 });
    out["graph-asymptote"] = K.svg(G.width, G.height, G.grid(), G.axes(), G.curve(x => 1 / (x - 1)), G.vline(1));
  }
  // Riemann sums: left rectangles, midpoint, trapezoids.
  for (const method of ["left", "mid", "trap"]) {
    const G = K.graph({ xMin: 0, xMax: 5, yMin: 0, yMax: 6, xName: "x", yName: "y", width: 260, height: 170 });
    const f = x => 1 + 0.2 * x * x;
    out["riemann-" + method] = K.svg(G.width, G.height, G.grid(), G.axes(), G.riemann(f, 0, 4, 4, method), G.curve(f));
  }
  // Shaded area between two curves.
  {
    const G = K.graph({ xMin: -1, xMax: 3, yMin: -1, yMax: 5, xName: "x", yName: "y", width: 240, height: 220 });
    const f = x => 2 * x, g = x => x * x;
    out["area-between"] = K.svg(G.width, G.height, G.grid(), G.axes(), G.area(f, g, 0, 2), G.curve(f), G.curve(g), G.label(1.2, 2.4, "R", { italic: true, dx: -26, dy: -2 }));
  }
  // Slope field with one solution curve.
  {
    const G = K.graph({ xMin: -3, xMax: 3, yMin: -3, yMax: 3, xName: "x", yName: "y", equal: true, width: 240, grid: false });
    out["slope-field"] = K.svg(G.width, G.height, G.axes(), G.slopeField((x, y) => x - y), G.curve(x => x - 1 + 2 * Math.exp(-x), { width: 2 }));
  }
  // Number line with an interval and a ray.
  out["number-line"] = K.numberLine({ min: -4, max: 6, intervals: [{ from: -2, to: 1, openFrom: true }, { from: 4, to: Infinity }], points: [{ x: 3, open: true, label: "a", italic: true }] });
  // Blank student grid.
  out["blank-grid"] = K.blankGrid({ cols: 10, rows: 6, xName: "t (s)", yName: "x (m)" });
  // Velocity–time graph from straight pieces.
  out["velocity-time"] = K.timeGraph({ quantity: "v", unit: "m/s", tMax: 8, yMin: -4, yMax: 6, yStep: 2, points: [[0, 0], [2, 4], [5, 4], [8, -2]] }).svg;
  // Acceleration–time graph.
  out["acceleration-time"] = K.timeGraph({ quantity: "a", unit: "m/s^2", tMax: 6, yMin: -3, yMax: 3, points: [[0, 2], [2, 2], [2, 0], [4, 0], [4, -2], [6, -2]] }).svg;

  // Physics: block on an incline with forces drawn from its geometry.
  {
    const I = K.incline({ x: 30, y: 200, base: 260, angle: 30, block: { w: 46, h: 30, at: 0.55, label: "m" } });
    const { cx, cy } = I.block;
    out["incline-forces"] = K.svg(330, 230, I, K.vector(cx, cy, -90, 70, { label: "F_g" }), K.vector(cx, cy, 120, 60, { label: "F_N" }), K.vector(cx, cy, 210, 44, { label: "f" }));
  }
  // Free-body diagrams: dot and box.
  out["fbd-dot"] = K.svg(220, 220, K.fbd({ cx: 110, cy: 110, forces: [{ angle: 90, length: 70, label: "F_N" }, { angle: -90, length: 70, label: "F_g" }, { angle: 0, length: 55, label: "F_{app}" }, { angle: 180, length: 35, label: "f_k" }] }));
  out["fbd-tilted-axes"] = K.svg(240, 220, K.fbd({ cx: 120, cy: 110, axes: true, axesAngle: 25, forces: [{ angle: 115, length: 62, label: "F_N" }, { angle: -90, length: 72, label: "mg" }, { angle: 25, length: 40, label: "f_s" }] }));
  out["fbd-box"] = K.svg(220, 200, K.fbd({ cx: 110, cy: 100, body: "box", label: "M", forces: [{ angle: 0, length: 70, label: "T" }, { angle: -90, length: 60, label: "Mg" }] }));
  // Vector with components.
  out["vector-components"] = K.svg(220, 170, K.components(40, 140, 35, 150, { labels: { vector: "v", x: "v_x", y: "v_y", angle: "θ" } }));
  // Springs, walls and blocks: horizontal and vertical oscillators.
  out["spring-block"] = K.svg(320, 120, K.wall(30, 30, 100, "left"), K.ground(30, 300, 100), K.spring(30, 78, 170, 78, { label: "k" }), K.block(195, 78, 50, 44, { label: "m" }), K.dimension(195, 30, 255, 30, "x", { offset: 0 }));
  out["spring-vertical"] = K.svg(160, 230, K.ceiling(40, 120, 20), K.spring(80, 20, 80, 150, { coils: 9 }), K.block(80, 172, 46, 44, { label: "m" }));
  // Atwood machine with a pulley and ropes.
  out["pulley-atwood"] = K.svg(200, 250, K.pulley(100, 60, 20), K.rope([[80, 60], [80, 170]]), K.rope([[120, 60], [120, 130]]), K.block(80, 190, 36, 40, { label: "m_1" }), K.block(120, 150, 36, 40, { label: "m_2" }));
  // Block on a table connected over a pulley to a hanging mass.
  out["pulley-table"] = K.svg(320, 230, K.ground(20, 230, 100), K.wall(230, 100, 200, "right"), K.block(110, 80, 56, 40, { label: "M" }), K.rope([[138, 80], [232, 80]]), K.pulley(250, 98, 18, { mount: "none" }), K.line(230, 100, 250, 98, { width: 2 }), K.rope([[268, 98], [268, 170]]), K.block(268, 190, 34, 40, { label: "m" }));
  // Pendulum.
  out["pendulum"] = K.svg(220, 210, K.pendulum({ x: 110, y: 24, length: 150, angle: 28, lengthLabel: "L", label: "m" }));
  // Uniform circular motion.
  out["circular-motion"] = K.svg(260, 240, K.circularMotion({ cx: 120, cy: 120, r: 80, angle: 40, labels: { r: "r" } }));
  // Rotating disk and rod with pivot.
  out["disk-rotation"] = K.svg(220, 220, K.disk({ cx: 110, cy: 105, r: 62, rotation: "ccw", rotationLabel: "ω", radius: "R" }));
  out["rod-pivot"] = K.svg(300, 140, K.rod({ x1: 30, y1: 80, x2: 270, y2: 80, pivot: 0.25, label: "L" }), K.curvedArrow(90, 80, 30, 200, 330, { label: "τ" }), K.vector(240, 80, -90, 50, { label: "F" }));
  // Fluids: floating object in a container, and a narrowing pipe.
  out["fluid-container"] = K.svg(240, 220, K.container({ x: 40, y: 30, width: 160, height: 160, level: 0.7, object: { w: 50, h: 40, depth: -12, label: "B" } }));
  out["fluid-pipe"] = K.svg(360, 140, K.pipe({ x: 20, y: 70, length: 320, d1: 70, d2: 32, labels: ["A_1", "A_2"], flowLabel: "v_1" }));
  // Energy bar chart with a blank final column for students.
  out["energy-bars"] = K.barChart({ bars: [{ label: "K", value: 0 }, { label: "U_g", value: 3 }, { label: "U_s", value: 1 }, { label: "K", value: null }, { label: "U_g", value: null }, { label: "U_s", value: null }], max: 4, groups: [{ title: "Initial", from: 0, to: 2 }, { title: "Final", from: 3, to: 5 }] });
  return out;
}

module.exports = { samples };
