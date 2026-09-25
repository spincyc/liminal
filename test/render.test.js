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

/* ------------------------------------------------------------ math text */

// A compact sketch of a math tree: ⟨num | den⟩ for a stacked fraction,
// a⁄b for an inline one, ^{…} for an exponent, √[index]{…} for a root,
// and ⦅(…)⦆ for brackets that stretch around a fraction.
function sketch(nodes) {
  return nodes.map((node) => {
    if (node.type === "text") return node.text;
    if (node.type === "sup") return `^{${sketch(node.children)}}`;
    if (node.type === "frac" && node.inline) return `${sketch(node.num)}⁄${sketch(node.den)}`;
    if (node.type === "frac") return `⟨${sketch(node.num)} | ${sketch(node.den)}⟩`;
    if (node.type === "root") return `√${node.index ? `[${node.index}]` : ""}{${sketch(node.children)}}`;
    if (node.type === "fence") return `⦅${node.open}${sketch(node.children)}${node.close}⦆`;
    throw new Error(`unknown node ${node.type}`);
  }).join("");
}

const typeset = (text) => sketch(render.mathTokens(text));

test("math: ^ exponents rise, and Unicode superscripts stay as typed", () => {
  assert.equal(typeset("x^2"), "x^{2}");
  assert.equal(typeset("x^(3/5)"), "x^{3⁄5}");
  assert.equal(typeset("x^(17/4)"), "x^{17⁄4}");
  assert.equal(typeset("(0.95)^t"), "(0.95)^{t}");
  assert.equal(typeset("1,000(0.95)^t"), "1,000(0.95)^{t}");
  assert.equal(typeset("2^(x+1)"), "2^{x+1}");
  assert.equal(typeset("(2/3)^−2"), "⦅(⟨2 | 3⟩)⦆^{−2}");
  assert.equal(typeset("3,800(1.4)^(t/6)"), "3,800(1.4)^{t⁄6}");
  assert.equal(typeset("[(0.512)^(−1/3)]^t"), "[(0.512)^{−1⁄3}]^{t}");
  assert.equal(typeset("x^ab"), "x^{a}b", "the exponent takes one letter, as ^ binds");
  assert.deepEqual(render.mathTokens("x² + 3x³"), [{ type: "text", text: "x² + 3x³" }]);
  for (const stray of ["x^ 2", "^2", "x ^2", "x^"]) assert.equal(typeset(stray), stray);
});

test("math: fractions stack with numeric, single-letter, or bracketed operands", () => {
  assert.equal(typeset("3/5"), "⟨3 | 5⟩");
  assert.equal(typeset("x/4 = 5"), "⟨x | 4⟩ = 5");
  assert.equal(typeset("−B/A"), "−⟨B | A⟩");
  assert.equal(typeset("1,152/3,168"), "⟨1,152 | 3,168⟩");
  assert.equal(typeset("4π/3 and 180/π"), "⟨4π | 3⟩ and ⟨180 | π⟩");
  assert.equal(typeset("(x + 1)/(x − 2)"), "⟨x + 1 | x − 2⟩");
  assert.equal(typeset("(3x + 29)/((x + 5)(x + 7))"), "⟨3x + 29 | (x + 5)(x + 7)⟩");
  assert.equal(typeset("5Tm/4"), "⟨5Tm | 4⟩", "a coefficient makes a letter run a product");
  assert.equal(typeset("x¹² / x²"), "⟨x¹² | x²⟩");
  assert.equal(typeset("64^x/2^y"), "⟨64^{x} | 2^{y}⟩");
  assert.equal(typeset("f(5)/f(3)"), "⟨f(5) | f(3)⟩");
  assert.equal(typeset("p(x)/(x − 3)"), "⟨p(x) | x − 3⟩");
  assert.equal(typeset("10(9)/5"), "⟨10(9) | 5⟩");
  assert.equal(typeset("−k/−12."), "−⟨k | −12⟩.");
  assert.equal(typeset("360°/n"), "⟨360° | n⟩");
  assert.equal(typeset("(7/3)/(−2/3)"), "⟨⟨7 | 3⟩ | −⟨2 | 3⟩⟩");
});

test("math: brackets around a lone fraction drop unless they carry meaning", () => {
  assert.equal(typeset("(1/2)x"), "⟨1 | 2⟩x");
  assert.equal(typeset("−(1/2)x + 3"), "−⟨1 | 2⟩x + 3");
  assert.equal(typeset("(1/2)(22)(15)"), "⟨1 | 2⟩(22)(15)");
  assert.equal(typeset("256(1/2)^x"), "256⦅(⟨1 | 2⟩)⦆^{x}");
  assert.equal(typeset("(5/2)²"), "⦅(⟨5 | 2⟩)⦆²");
  assert.equal(typeset("f(m/12)"), "f⦅(⟨m | 12⟩)⦆");
  assert.equal(typeset("2(−1/2)"), "2⦅(−⟨1 | 2⟩)⦆");
  assert.equal(typeset("(−1/3, 0)"), "⦅(−⟨1 | 3⟩, 0)⦆");
});

test("math: radicals take a number, a letter, or a bracket group, and an index", () => {
  assert.equal(typeset("√7 and 2√7"), "√{7} and 2√{7}");
  assert.equal(typeset("√(x + 4) = 2"), "√{x + 4} = 2");
  assert.equal(typeset("⁵√(x⁶)"), "√[5]{x⁶}");
  assert.equal(typeset("∛8 + ∜x"), "√[3]{8} + √[4]{x}");
  assert.equal(typeset("x³/⁵√(x⁶)"), "⟨x³ | √[5]{x⁶}⟩", "the review's misreadable stem");
  assert.equal(typeset("(12²√3)/4"), "⟨12²√{3} | 4⟩", "a superscript after a number is its exponent");
  assert.equal(typeset("(−3 ± √165)/6"), "⟨−3 ± √{165} | 6⟩");
  assert.equal(typeset("√(4/9)"), "√{⟨4 | 9⟩}");
  assert.equal(typeset("√area"), "√area");
});

test("math: units, words, dates, money, ratios, and ambiguous slashes stay text", () => {
  for (const text of [
    "60 km/h", "30 miles/hour", "and/or", "20 m/s", "3,600 s/h", "5km/h", "9/25/2026",
    "$3/4", "a 3:4 ratio", "input/output", "http://example.org/a", "1/2x", "1/2(3)", "3rd/4th",
    "w/o", "2024/2025", "rs/2", "PT/PR", "adjacent/hypotenuse", "sin θ/cos θ",
    "area(triangle JMN)/area(triangle JLK)", "(percent/100)", "a / b/c", "x /4",
  ]) {
    assert.equal(typeset(text), text, text);
  }
  assert.equal(typeset("(1/3, 0"), "(⟨1 | 3⟩, 0", "an unclosed bracket prints as typed");
  assert.equal(typeset("a)b]"), "a)b]");
});

test("math: speech reads fractions, powers, and roots in words", () => {
  const say = (text) => render.mathSpeech(render.mathTokens(text));
  assert.equal(say("3/5"), "3 over 5");
  assert.equal(say("x^2 + y^3 − z^5"), "x squared + y cubed − z to the power 5");
  assert.equal(say("x^(3/5)"), "x raised to the exponent, 3 over 5, end exponent");
  assert.equal(say("(x + 1)/(x − 2)"), "the fraction, x + 1, over x − 2, end fraction");
  assert.equal(say("2√7"), "2 the square root of 7");
  assert.equal(say("√(x + 4)"), "the square root of, x + 4, end root");
  assert.equal(say("x³/⁵√(x⁶)"), "the fraction, x³, over the fifth root of x⁶, end fraction");
  assert.equal(say("∛8"), "the cube root of 8");
  assert.equal(say("2^((x+1)/(x-1))"), "2 raised to the exponent, the fraction, x+1, over x-1, end fraction, end exponent");
  assert.equal(say("−k/−12"), "− k over −12", "the sign stands before the fraction");
});

// Writes a tree back as plain notation, so a test can check that the
// parser neither drops nor invents a character.
function linear(nodes) {
  return nodes.map((node) => {
    if (node.type === "text") return node.text;
    if (node.type === "sup") return `^${linear(node.children)}`;
    if (node.type === "frac") return `${linear(node.num)}/${linear(node.den)}`;
    if (node.type === "root") return `${node.index || ""}√${linear(node.children)}`;
    return node.open + linear(node.children) + node.close;
  }).join("");
}

function comparable(text) {
  const digits = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6",
    "⁷": "7", "⁸": "8", "⁹": "9", "ⁿ": "n" };
  return text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ](?=√)/g, (ch) => digits[ch])
    .replace(/∛/g, "3√").replace(/∜/g, "4√").replace(/[\s()[\]]/g, "");
}

test("math: every generated Math string keeps its characters and leaves no stray ^", () => {
  const shared = require("../src/lib/families/shared");
  const families = require("../src/lib/families/sat/math");
  let strings = 0;
  let typesetCount = 0;
  for (const family of families) {
    for (const seed of ["0", "1", "2"]) {
      const question = shared.instantiate(family, seed);
      const texts = [question.stem, question.explanation, question.hint, question.trap,
        question.strategy, ...(question.choices || []), ...(question.solutionSteps || []),
        question.stimulus && question.stimulus.content];
      for (const text of texts.filter((value) => typeof value === "string")) {
        for (const line of text.split("\n")) {
          const nodes = render.mathTokens(line);
          strings += 1;
          if (nodes.some((node) => node.type !== "text")) typesetCount += 1;
          assert.equal(comparable(linear(nodes)), comparable(line), `${family.id}: ${line}`);
          const stray = JSON.stringify(nodes).match(/"text":"[^"]*\^[^"]*"/);
          assert.equal(stray, null, `${family.id}: untypeset ^ in ${line}`);
        }
      }
    }
  }
  assert.ok(strings > 1000 && typesetCount > 100, `${typesetCount} of ${strings} lines typeset`);
});

/* ----------------------------------------------------- math in the DOM */

// Just enough DOM for render.js, with a serializer to compare output.
function fakeDocument() {
  class Text {
    constructor(value) { this.nodeType = 3; this.nodeValue = String(value); }
  }
  class Element {
    constructor(tag) {
      Object.assign(this, { nodeType: 1, tagName: tag, childNodes: [], attributes: {}, dataset: {}, style: {}, className: "" });
    }
    appendChild(child) { this.childNodes.push(child); return child; }
    append(...children) { children.forEach((child) => this.appendChild(child)); }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    set textContent(value) { this.childNodes = [new Text(value)]; }
  }
  return {
    createElement: (tag) => new Element(tag),
    createElementNS: (namespace, tag) => new Element(tag),
    createTextNode: (value) => new Text(value),
  };
}

function serialize(node) {
  if (node.nodeType === 3) return node.nodeValue;
  const attributes = [
    node.className && `class="${node.className}"`,
    node.scope && `scope="${node.scope}"`,
    ...Object.entries(node.attributes).map(([name, value]) => `${name}="${value}"`),
  ].filter(Boolean);
  return `<${node.tagName}${attributes.map((attribute) => ` ${attribute}`).join("")}>` +
    `${node.childNodes.map(serialize).join("")}</${node.tagName}>`;
}

function withDocument(callback) {
  const previous = global.document;
  global.document = fakeDocument();
  try {
    return callback();
  } finally {
    if (previous === undefined) delete global.document;
    else global.document = previous;
  }
}

test("math DOM: without the flag, math text renders as one text node, as before", () => {
  withDocument(() => {
    const html = serialize(render.renderText("If x^2 = 3/5, what is √(x + 4)?"));
    assert.equal(html, '<div class="lm-rich"><p>If x^2 = 3/5, what is √(x + 4)?</p></div>');
    const equations = serialize(render.renderStimulus({ type: "equations", content: "y = x/4" }));
    assert.equal(equations, '<div class="lm-stimulus lm-stimulus-equations"><div class="lm-equations">' +
      '<p class="lm-equation">y = x/4</p></div></div>');
  });
});

test("math DOM: typeset pieces carry spoken text and hide their drawing", () => {
  withDocument(() => {
    const html = serialize(render.renderText("Solve x/4 = 5.", { math: true }));
    assert.equal(html, '<div class="lm-rich"><p>Solve <span class="lm-math lm-math-frac">' +
      '<span class="lm-math-sr"> x over 4 </span><span class="lm-math-stack" aria-hidden="true">' +
      '<span class="lm-math-num">x</span><span class="lm-math-den">4</span></span></span> = 5.</p></div>');
    const nested = serialize(render.renderText("(−3 ± √165)/6", { math: true }));
    assert.equal((nested.match(/lm-math-sr/g) || []).length, 1, "one spoken form for the whole fraction");
    assert.match(nested, /<span class="lm-math-radical"><svg class="lm-math-sign"[^>]*><path d="[^"]+"><\/path><\/svg>/);
    const power = serialize(render.renderText("x^(3/5)", { math: true }));
    assert.match(power, /<sup class="lm-math-power" aria-hidden="true">3\/5<\/sup>/);
  });
});

test("math DOM: tables, equations, lists, and stimuli typeset when asked", () => {
  withDocument(() => {
    const table = serialize(render.renderText("x | y\n1/2 | 2^3", { math: true }));
    assert.match(table, /<td><span class="lm-math lm-math-frac">/);
    assert.match(table, /<td>2<span class="lm-math lm-math-sup">/);
    const stimulus = serialize(render.renderStimulus({ type: "equations", content: "y = x^2" }, { math: true }));
    assert.match(stimulus, /<p class="lm-equation">y = x<span class="lm-math lm-math-sup">/);
    const list = serialize(render.renderText("• a/b\n• c", { math: true }));
    assert.match(list, /<li><span class="lm-math lm-math-frac">/);
  });
});

test("render.js builds the DOM from elements and text nodes only", () => {
  const source = require("node:fs").readFileSync(require.resolve("../src/app/render"), "utf8");
  assert.equal(/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(source), false);
});
