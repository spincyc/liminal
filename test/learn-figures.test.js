"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const vm = require("node:vm");
const Learn = require("../src/lib/learn-markup");
const { parseFigures, loadLearn, readTree, bundleSource } = require("../tools/build-learn");
const FRONT = "---\nid: sat/general/sample\ntitle: Sample\n---\n# Sample\n\n";
const node = (name, attributes = [], children = []) => ({ name, attributes, children });
const safe = () => ({ id: "sample-graph", alt: "Graph with x and y axes and a point at (2, 3).", caption: "Read the plotted point.", svg: node("svg", [{ name: "viewBox", value: "0 0 320 240" }], [node("text", [], [{ text: "x" }])]) });
const tree = (source, figures) => ({ exists: true, files: { "sat/general/sample.md": FRONT + source }, factsText: null, figuresText: JSON.stringify(figures), others: [] });

test("figures are distinct blocks on general and skill pages, including every Try it part", () => {
  const body = "{{figure:sample-graph}}\n\n> **Example.** Read the graph.\n> {{figure:sample-graph}}\n\n> **Try it.** Read x.\n> {{figure:sample-graph}}\n> **First step.** Locate the point.\n> {{figure:sample-graph}}\n> **Hint.** Read down.\n> {{figure:sample-graph}}\n> **Answer.** 2\n>\n> {{figure:sample-graph}}\n";
  for (const front of [FRONT, FRONT.replace("sat/general/sample", "sat-math/algebra/sample")]) {
    const parsed = Learn.parse(front + body);
    assert.deepEqual(parsed.errors, []);
    assert.equal(parsed.figures.length, 6);
    assert.equal(parsed.blocks[1].type, "figure");
    const exercise = parsed.blocks.at(-1);
    assert.equal(exercise.problem[1].type, "figure");
    assert.equal(exercise.hint[1].type, "figure");
    assert.equal(exercise.solution[0].type, "figure");
    assert.deepEqual(exercise.answer, ["2"]);
  }
});

test("inline, malformed and URL figure references fail explicitly", () => {
  for (const source of ["Text {{figure:sample-graph}}", "{{figure:sample-graph}} extra", "{{figure:../image}}", "{{figure:https://example.org/a.svg}}", "{{figure:Sample}}"] ) {
    assert.ok(Learn.parse(FRONT + source).errors.length, source);
  }
});

test("the build resolves figures in hidden hints and answers and rejects undefined references", () => {
  const source = "> **Try it.** Read x.\n> **Hint.** A graph.\n> {{figure:missing}}\n> **Answer.** 2\n>\n> {{figure:sample-graph}}\n";
  const result = loadLearn(tree(source, [safe()]));
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0].message, /figure:missing.*not defined/);
  assert.equal(result.errors[0].line, 9);
});

test("SVG validation rejects executable content, unsafe attributes and unsupported tree fields", () => {
  const attacks = [
    (figure) => figure.svg.children.push(node("script", [], [{ text: "alert(1)" }])),
    (figure) => figure.svg.attributes.push({ name: "onload", value: "alert(1)" }),
    (figure) => figure.svg.attributes.push({ name: "style", value: "background:url(https://example.org)" }),
    (figure) => figure.svg.children.push(node("image", [{ name: "href", value: "https://example.org" }])),
    (figure) => figure.svg.children.push(node("path", [{ name: "fill", value: "url(#hidden)" }])),
    (figure) => { figure.svg.children[0].hiddenAnswer = "2"; },
    (figure) => { figure.svg.children = "not an array"; },
    (figure) => { figure.externalUrl = "https://example.org"; },
  ];
  for (const attack of attacks) {
    const figure = safe();
    attack(figure);
    assert.ok(parseFigures(JSON.stringify([figure])).errors.length);
  }
  assert.deepEqual(parseFigures(JSON.stringify([safe()])).errors, []);
});

test("figures require bounded finite viewports, captions and solving descriptions", () => {
  for (const value of ["0 0 1e999 240", "0 0 0 240", "0 0 641 240", "0 0 320 481", "0 0 320 100"]) {
    const figure = safe();
    figure.svg.attributes[0].value = value;
    assert.match(parseFigures(JSON.stringify([figure])).errors.map((error) => error.message).join(" "), /finite viewBox/);
  }
  const overflow = safe();
  overflow.svg.children.push(node("line", [{ name: "x1", value: "1e999" }]));
  assert.ok(parseFigures(JSON.stringify([overflow])).errors.some((error) => /finite/.test(error.message)));
  for (const field of ["alt", "caption"]) {
    const figure = safe();
    delete figure[field];
    assert.ok(parseFigures(JSON.stringify([figure])).errors.length);
  }
  assert.ok(parseFigures(JSON.stringify([safe(), safe()])).errors.some((error) => /duplicate/.test(error.message)));
});

test("explicit viewBox validation cannot fall back to positive width and height", () => {
  for (const viewport of ["0 0 -320 240", "0 0 320 -240", "0 0 0 240", "0 0 320 0", "0 0 1000000 1000000"]) {
    const figure = safe();
    figure.svg.attributes = [
      { name: "viewBox", value: viewport },
      { name: "width", value: "320" },
      { name: "height", value: "240" },
    ];
    assert.ok(parseFigures(JSON.stringify([figure])).errors.some((error) => /finite viewBox/.test(error.message)), viewport);
  }
  const figure = safe();
  figure.svg.attributes.push({ name: "width", value: "320" }, { name: "height", value: "240" });
  assert.deepEqual(parseFigures(JSON.stringify([figure])).errors, []);
});

test("duplicate SVG attributes fail at the root and in nested elements", () => {
  const duplicateViewport = safe();
  duplicateViewport.svg.attributes.push({ name: "viewBox", value: "0 0 1000000 1000000" });
  assert.ok(parseFigures(JSON.stringify([duplicateViewport])).errors.some((error) => /attribute names must be unique/.test(error.message)));
  const duplicatePosition = safe();
  duplicatePosition.svg.children.push(node("g", [], [node("circle", [
    { name: "cx", value: "20" }, { name: "cx", value: "200" }, { name: "r", value: "5" },
  ])]));
  assert.ok(parseFigures(JSON.stringify([duplicatePosition])).errors.some((error) => /attribute names must be unique/.test(error.message)));
});

test("authored figures resolve and ship as data with no answer metadata", () => {
  const root = path.join(__dirname, "..", "content", "learn");
  const loaded = loadLearn(readTree(root));
  assert.deepEqual(loaded.errors, []);
  assert.ok(Object.keys(loaded.figures).length >= 9);
  const context = { window: {} };
  vm.runInNewContext(bundleSource(loaded.pages, [], loaded.figures), context);
  const shipped = context.window.LIMINAL_LEARN;
  assert.ok(shipped.figures["triangle-height"].notToScale);
  for (const id of ["scale-rate-try", "endpoint-try", "model-read-try", "members-line"]) {
    const figure = shipped.figures[id];
    assert.ok(figure.alt && figure.caption);
    assert.doesNotMatch(figure.alt + figure.caption, /answer|residual\s*[=−-]|12 meters per minute|domain −1|range −2/i);
  }
});
