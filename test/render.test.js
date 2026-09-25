"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const render = require("../src/app/render");

test("pipe rows become a table with a header row", () => {
  const blocks = render.parseBlocks(
    "A librarian logged books.\n\nweek | books\nWeek 1 | 11\nWeek 2 | 15",
  );
  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks[0], { kind: "paragraph", lines: ["A librarian logged books."] });
  assert.deepEqual(blocks[1], {
    kind: "table",
    header: ["week", "books"],
    rows: [["Week 1", "11"], ["Week 2", "15"]],
    rowHeaders: false,
  });
});

test("an empty first header cell makes the first column row headers", () => {
  const [table] = render.parseBlocks(
    " | own a helmet | no helmet\ncycle | 16 | 7\ndo not cycle | 22 | 32",
  );
  assert.equal(table.kind, "table");
  assert.equal(table.rowHeaders, true);
  assert.deepEqual(table.header, ["", "own a helmet", "no helmet"]);
  assert.deepEqual(table.rows[1], ["do not cycle", "22", "32"]);
});

test("markdown pipes and separator rows are tolerated", () => {
  const [table] = render.parseBlocks("| x | y |\n|---|---|\n| 1 | 2 |\n| 3 |");
  assert.deepEqual(table.header, ["x", "y"]);
  assert.deepEqual(table.rows, [["1", "2"], ["3", ""]]);
});

test("absolute values and a lone pipe row stay prose", () => {
  assert.equal(render.isPipeRow("|x - 3| = 5"), false);
  assert.equal(render.isPipeRow("a | b"), true);
  const blocks = render.parseBlocks("If |x - 3| = 5, what is x?");
  assert.deepEqual(blocks, [{ kind: "paragraph", lines: ["If |x - 3| = 5, what is x?"] }]);
  const single = render.parseBlocks("left | right");
  assert.equal(single[0].kind, "paragraph");
});

test("equations render one per line", () => {
  assert.deepEqual(render.parseBlocks("y = 2x + 3\n\n  y = -x + 9 \n", { type: "equations" }), [
    { kind: "equations", lines: ["y = 2x + 3", "y = -x + 9"] },
  ]);
});

test("paragraphs split on blank lines and keep single line breaks", () => {
  const blocks = render.parseBlocks("First line\nsecond line.\n\n\nNext paragraph.");
  assert.deepEqual(blocks, [
    { kind: "paragraph", lines: ["First line", "second line."] },
    { kind: "paragraph", lines: ["Next paragraph."] },
  ]);
});

test("bullets become lists and passage labels become headings", () => {
  const notes = render.parseBlocks("• One fact.\n• Another fact.");
  assert.deepEqual(notes, [{ kind: "list", items: ["One fact.", "Another fact."] }]);
  const paired = render.parseBlocks("Text 1\nA claim.\n\nText 2\nA reply.");
  assert.deepEqual(paired.map((block) => block.kind), ["heading", "paragraph", "heading", "paragraph"]);
  assert.equal(paired[2].text, "Text 2");
});

test("a short unpunctuated first line becomes a title only when asked", () => {
  const source = "The Key Counter\n\n[1] The store hired me.";
  assert.equal(render.parseBlocks(source)[0].kind, "paragraph");
  const titled = render.parseBlocks(source, { titles: true });
  assert.deepEqual(titled[0], { kind: "heading", text: "The Key Counter", title: true });
  assert.equal(render.parseBlocks("A sentence ends here.\n\nMore.", { titles: true })[0].kind, "paragraph");
});

test("a passage carried in the stem splits from its question", () => {
  assert.deepEqual(render.splitStemPassage("Passage one.\n\nPassage two.\n\nWhich choice?"), {
    passage: "Passage one.\n\nPassage two.",
    question: "Which choice?",
  });
  assert.deepEqual(render.splitStemPassage("Only a question?"), { passage: "", question: "Only a question?" });
});

test("ACT underline markup parses into segments", () => {
  assert.deepEqual(render.parseUnderlines("I turned {1 sixteen, and} left. {3}"), [
    { text: "I turned " },
    { text: "sixteen, and", underline: 1 },
    { text: " left. " },
    { marker: 3 },
  ]);
  assert.deepEqual(render.parseUnderlines("Set {1, 2}"), [{ text: "Set {1, 2}" }]);
});

function el(name, attributes, children) {
  return {
    name,
    attributes: Object.entries(attributes || {}).map(([key, value]) => ({ name: key, value })),
    children: children || [],
  };
}

test("the SVG sanitizer keeps allow-listed geometry and drops everything else", () => {
  const dirty = el("svg", { viewBox: "0 0 100 80", onload: "alert(1)", style: "fill:red", width: "100" }, [
    el("script", {}, [{ text: "alert(1)" }]),
    el("g", { transform: "translate(10, 5) rotate(30)", class: "x" }, [
      el("line", { x1: "0", y1: "0", x2: "50", y2: "40", stroke: "currentColor", "stroke-width": "2", onclick: "x()" }),
      el("polygon", { points: "0,0 10,0 5,8", fill: "none" }),
      el("path", { d: "M0 0 L10 10 Z", fill: "url(#evil)", stroke: "javascript:alert(1)" }),
      el("text", { x: "5", y: "10", "font-size": "12", "text-anchor": "middle", href: "http://x" }, [
        { text: "A" },
        el("tspan", { dy: "4", "font-style": "italic" }, [{ text: "2" }]),
      ]),
      el("foreignObject", {}, [el("div", {}, [{ text: "html" }])]),
      el("a", { href: "https://example.com" }, [el("circle", { cx: "1", cy: "1", r: "1" })]),
      el("image", { href: "data:image/png;base64,AAAA" }),
      el("rect", { x: "1", y: "1", width: "10", height: "5", fill: "#fff", "stroke-dasharray": "4 2" }),
      el("circle", { cx: "calc(1)", cy: "2", r: "3" }),
    ]),
    { text: "stray text" },
  ]);
  const clean = render.sanitizeSvgTree(dirty);
  assert.deepEqual(clean.attributes, [
    { name: "viewBox", value: "0 0 100 80" },
    { name: "width", value: "100" },
  ]);
  assert.equal(clean.children.length, 1, "script and stray text are dropped");
  const group = clean.children[0];
  assert.deepEqual(group.attributes, [{ name: "transform", value: "translate(10, 5) rotate(30)" }]);
  assert.deepEqual(group.children.map((child) => child.name), ["line", "polygon", "path", "text", "rect", "circle"]);
  const [line, , path, text, rect, circle] = group.children;
  assert.equal(line.attributes.some((attribute) => attribute.name === "onclick"), false);
  assert.deepEqual(path.attributes, [{ name: "d", value: "M0 0 L10 10 Z" }]);
  assert.equal(text.attributes.some((attribute) => attribute.name === "href"), false);
  assert.deepEqual(text.children[0], { text: "A" });
  assert.equal(text.children[1].name, "tspan");
  assert.equal(rect.attributes.length, 6);
  assert.deepEqual(circle.attributes.map((attribute) => attribute.name), ["cy", "r"]);
  assert.equal(JSON.stringify(clean).includes("alert"), false);
  assert.equal(JSON.stringify(clean).includes("example.com"), false);
});

test("the SVG sanitizer rejects a non-SVG root and foreign namespaces", () => {
  assert.equal(render.sanitizeSvgTree(el("html", {}, [])), null);
  assert.equal(render.sanitizeSvgTree(null), null);
  const namespaced = {
    name: "svg",
    attributes: [{ name: "href", namespace: "http://www.w3.org/1999/xlink", value: "#x" }],
    children: [{ name: "line", namespace: "http://www.w3.org/1999/xhtml", attributes: [], children: [] }],
  };
  assert.deepEqual(render.sanitizeSvgTree(namespaced), { name: "svg", attributes: [], children: [] });
});

test("figure size comes from the viewBox, else width and height", () => {
  assert.deepEqual(render.svgSize(el("svg", { viewBox: "0 0 200 100" })), {
    width: 200, height: 100, viewBox: "0 0 200 100",
  });
  assert.deepEqual(render.svgSize(el("svg", { width: "300", height: "150" })), {
    width: 300, height: 150, viewBox: "0 0 300 150",
  });
  assert.equal(render.svgSize(el("svg", { width: "100%" })), null);
});

test("the shell module loads in Node and carries directions for every section", () => {
  const shell = require("../src/app/test-shell");
  assert.equal(typeof shell.start, "function");
  for (const key of ["sat-reading-writing", "sat-math", "act-english", "act-mathematics", "act-reading", "act-science"]) {
    assert.ok(shell.DIRECTIONS[key].length > 0, key);
  }
  assert.equal(shell.formatClock(2100 * 1000), "35:00");
  assert.equal(shell.formatClock(299_001, true), "5:00");
  assert.equal(shell.formatClock(3_725_000), "1:02:05");
  const text = JSON.stringify(shell.DIRECTIONS) + JSON.stringify(shell.SPR_RULES);
  assert.equal(/College Board|Bluebook/i.test(text), false);
});
