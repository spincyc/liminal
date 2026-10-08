"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const K = require("../tools/lib/figure-kit");
const { samples } = require("../tools/lib/figure-gallery");
const { checkFigureSvg, MAX_FIGURE_BYTES } = require("../tools/lib/weekly-figures");
const cli = require("../tools/figure-kit");

test("every gallery figure is deterministic, admitted by the renderer allow-list and within budget", () => {
  const first = samples(), second = samples();
  assert.deepEqual(first, second);
  assert.ok(Object.keys(first).length >= 25);
  for (const [id, svg] of Object.entries(first)) {
    assert.doesNotThrow(() => checkFigureSvg(svg, id), id);
    assert.ok(Buffer.byteLength(svg) <= MAX_FIGURE_BYTES, id);
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 [\d.]+ [\d.]+">/, id);
    assert.doesNotMatch(svg, /NaN|Infinity|undefined|<marker|<defs|clipPath|url\(|#[0-9a-fA-F]{3}/, id);
  }
});

test("the gallery exercises every drawing primitive", () => {
  const source = fs.readFileSync(path.join(__dirname, "../tools/lib/figure-gallery.js"), "utf8");
  const primitives = ["graph", "timeGraph", "numberLine", "blankGrid", "ground", "ceiling", "wall", "block", "incline", "spring", "pulley", "rope", "pendulum", "fbd", "components", "circularMotion", "disk", "rod", "container", "pipe", "barChart", "vector", "curvedArrow", "dimension", "line"];
  for (const name of primitives) assert.match(source, new RegExp("K\\." + name + "\\("), name);
  for (const method of ["grid", "axes", "curve", "tangent", "point", "label", "vline", "area", "riemann", "slopeField"]) assert.match(source, new RegExp("G\\." + method + "\\("), method);
});

test("numbers, ticks, text and long geometry stay within the renderer's limits", () => {
  assert.equal(K.num(1.25), "1.3"); assert.equal(K.num(-0.04), "0"); assert.equal(K.num(3), "3");
  assert.throws(() => K.num(NaN), /non-finite/);
  assert.equal(K.tickText(-2), "−2"); assert.equal(K.piText(Math.PI / 2), "π/2"); assert.equal(K.piText(-Math.PI), "−π"); assert.equal(K.piText(3 * Math.PI / 2), "3π/2"); assert.equal(K.piText(0), "0");
  assert.match(K.text(0, 0, "F_N"), /<tspan>F<\/tspan><tspan dy="4" font-size="11">N<\/tspan>/);
  assert.match(K.text(0, 0, "F_{app}"), />app</);
  assert.match(K.text(0, 0, "x^2 + 1"), /<tspan dy="-6" font-size="11">2<\/tspan><tspan dy="6"> \+ 1<\/tspan>/);
  assert.equal(K.text(0, 0, "a < b & c"), '<text x="0" y="0" fill="currentColor" font-size="14" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">a &lt; b &amp; c</text>');
  const points = Array.from({ length: 2000 }, (_, i) => [i / 7, (i * i) % 97]);
  const long = K.polyline(points);
  for (const [, value] of long.matchAll(/points="([^"]*)"/g)) assert.ok(value.length < 5000);
  assert.ok((long.match(/<polyline/g) || []).length > 1);
  const G = K.graph({ xMin: -10, xMax: 10, yMin: -10, yMax: 10, xStep: 0.5, yStep: 0.5, equal: true, width: 400 });
  const field = G.slopeField((x, y) => x * y);
  for (const [, value] of field.matchAll(/d="([^"]*)"/g)) assert.ok(value.length < 5000);
  assert.ok((field.match(/<path/g) || []).length > 1);
  assert.throws(() => checkFigureSvg(K.svg(G.width, G.height, field)), /the limit is 12288/); // too dense a field fails the budget
  assert.throws(() => K.graph({ xMin: 1, xMax: 1, yMin: 0, yMax: 1 }), /empty graph window/);
  assert.throws(() => K.svg(0, 10), /positive size/);
  // Curves break at non-finite values instead of drawing through them.
  const H = K.graph({ xMin: -2, xMax: 2, yMin: -5, yMax: 5 });
  assert.equal((H.curve(x => 1 / x).match(/<polyline/g) || []).length, 2);
  assert.equal(H.curve(() => NaN), "");
});

test("the command line builds, checks and renders the gallery", () => {
  const scratch = path.resolve(__dirname, "../.scratch/weekly-engine");
  fs.mkdirSync(scratch, { recursive: true });
  const directory = fs.mkdtempSync(path.join(scratch, "figure-kit-"));
  const log = console.log; const lines = []; console.log = line => lines.push(line);
  try {
    const spec = path.join(directory, "spec.js");
    fs.writeFileSync(spec, `module.exports = K => ({ "demo-f1": K.numberLine({ min: 0, max: 5 }) });`);
    cli.main(["build", spec, path.join(directory, "out")]);
    assert.ok(fs.existsSync(path.join(directory, "out/demo-f1.svg")));
    cli.main(["check", path.join(directory, "out")]);
    assert.match(lines.at(-1), /1 figures admitted/);
    fs.writeFileSync(spec, `module.exports = { "Bad_ID": "<svg/>" };`);
    delete require.cache[spec];
    assert.throws(() => cli.main(["build", spec, path.join(directory, "out")]), /Invalid figure ID/);
    cli.main(["gallery", path.join(directory, "gallery")]);
    assert.ok(fs.existsSync(path.join(directory, "gallery/index.html")));
    assert.equal(fs.readdirSync(path.join(directory, "gallery")).filter(f => f.endsWith(".svg")).length, Object.keys(samples()).length);
    assert.throws(() => K.save(path.join(directory, "bad.svg"), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><marker/></svg>'), /renderer drops/);
  } finally {
    console.log = log;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
