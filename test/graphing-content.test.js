"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { loadCatalog, loadBank, validateQuestion, duplicateErrors } = require("../tools/lib/content");
const { baseRecord } = require("../tools/lib/generation");
const { bankBundle } = require("../tools/build-content");
const catalog = loadCatalog();
const section = catalog.sections.find((s) => s.key === "act-mathematics");
const original = loadBank(section.key)[0];
const figure = {
  svg: '<svg viewBox="0 0 100 100"><line x1="10" y1="80" x2="90" y2="20" stroke="currentColor"/></svg>',
  alt: "A line through (1, 2) and (5, 8).",
  notToScale: false,
};

test("standalone figures pass strict validation and survive assembly and browser bundling", () => {
  const generated = { ...original, correct: original.choices[original.correctAnswer], figure,
    distractors: original.distractorRationales.map(({ index, reason }) => ({ text: original.choices[index], reason })) };
  const record = baseRecord({ section, task: original, sequence: 1, responseType: "multiple-choice",
    generated, answerPosition: original.correctAnswer, generator: "graphing-test" });
  assert.deepEqual(record.figure, figure);
  assert.deepEqual(validateQuestion(record, section, catalog), []);
  const context = { window: {} };
  vm.runInNewContext(bankBundle(section.key, [record], []), context);
  assert.equal(context.window.PRACTICE_BANKS[section.key][0].figure.svg, figure.svg);
});

test("standalone figures reject unsafe or incomplete SVG and conflicting passage ownership", () => {
  for (const bad of [null, { ...figure, alt: "" }, { ...figure, notToScale: undefined },
    { ...figure, svg: '<svg><script>alert(1)</script></svg>' },
    { ...figure, svg: '<svg><path onclick="x()" d="M0 0 L1 1"/></svg>' },
    { ...figure, svg: '<svg><image href="https://example.com/x.png"/></svg>' }]) {
    assert.ok(validateQuestion({ ...original, figure: bad }, section, catalog).length > 0);
  }
  assert.match(validateQuestion({ ...original, stimulus: null, passageId: "p1", figure }, section, catalog).join("\n"), /shared passage/);
});

test("duplicate checks include the plotted data without admitting identical plots twice", () => {
  const first = { ...original, id: "a", stimulus: null, stem: "What is the slope of the line shown?", figure };
  const second = { ...first, id: "b", figure: { ...figure,
    svg: '<svg viewBox="0 0 100 100"><line x1="10" y1="20" x2="90" y2="80" stroke="currentColor"/></svg>',
    alt: "A line through (−3, 7) and (0, −9)." } };
  assert.deepEqual(duplicateErrors([first, second]), []);
  assert.match(duplicateErrors([first, { ...first, id: "b" }]).join("\n"), /Exact duplicate/);
});

test("ACT graph data survives HTML, LaTeX, and shared-passage booklet export", () => {
  const booklet = require("../src/lib/booklet");
  const adapter = require("../tools/lib/booklet-render");
  const { hydrateBank } = require("../tools/lib/content");
  const reading = hydrateBank("act-reading").filter((q) => q.passageId === "act-reading-p018").slice(0, 2);
  const model = booklet.buildModel([{ label: "Graphs", minutes: 5, directions: "Answer every question.",
    questions: [{ ...original, figure }, ...reading] }], { id: "graph-export", test: "ACT", label: "Graph practice" }, "graphs");
  const html = booklet.renderBookletHtml(model);
  const tex = booklet.renderTex(model);
  assert.equal((html.match(/Diagram description \(drawing unavailable\):/g) || []).length, 2);
  assert.equal((tex.match(/Diagram description \(drawing unavailable\):/g) || []).length, 2);
  assert.ok(html.includes(figure.alt));
  assert.ok(tex.includes(booklet.tex(figure.alt)));
  const rendered = booklet.renderBookletHtml(model, { render: adapter });
  assert.equal((rendered.match(/role="img"/g) || []).length, 2);
});
