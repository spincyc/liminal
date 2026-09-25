"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Learn = require("../src/lib/learn-markup");
const Render = require("../src/app/render");

const FIXTURES = path.join(__dirname, "fixtures", "learn");
const FRONT = "---\nid: sat/general/sample\ntitle: Sample\n---\n# Sample\n\n";
// Body lines start at line 7 of a page built with FRONT.
const page = (body) => Learn.parse(FRONT + body);
const messages = (result) => result.errors.map((error) => `${error.line}: ${error.message}`);
const strip = (value) => JSON.parse(JSON.stringify(value, (key, inner) => (key === "line" ? undefined : inner)));

function assertError(result, line, pattern) {
  const hit = result.errors.find((error) => error.line === line && pattern.test(error.message));
  assert.ok(hit, `expected an error at line ${line} matching ${pattern}; got ${JSON.stringify(messages(result))}`);
}

test("a fixture page using every construct parses cleanly into a block tree", () => {
  const source = fs.readFileSync(path.join(FIXTURES, "sat-math", "algebra", "linear-inequalities.md"), "utf8");
  const result = Learn.parse(source);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.meta, {
    id: "sat-math/algebra/linear-inequalities",
    title: "Linear inequalities",
    section: "sat-math",
    domain: "Algebra",
    skill: "Linear inequalities",
  });
  const types = result.blocks.map((block) => block.type);
  assert.deepEqual(new Set(types), new Set(["heading", "paragraph", "list", "callout", "table", "pre"]));
  const kinds = result.blocks.filter((block) => block.type === "callout").map((block) => block.kind);
  assert.deepEqual(new Set(kinds), new Set(["rule", "example", "trap", "fails-when", "desmos", "check", "note"]));
  const example = result.blocks.find((block) => block.type === "callout" && block.kind === "example");
  assert.deepEqual(strip(example.blocks[1]), { type: "pre", text: "3x − 5 ≤ 7\n    3x ≤ 12\n     x ≤ 4" });
  assert.deepEqual(Learn.outline(result.blocks).map((entry) => entry.id), [
    "solve-inequalities",
    "systems-of-inequalities",
    "where-these-show-up",
  ]);
  assert.deepEqual(result.facts.map((use) => use.id), ["sat-math-minutes"]);
  assert.equal(result.links.length, 3);
});

test("inline markup becomes typed nodes and everything else stays text", () => {
  const { content, errors } = Learn.parseInline(
    "A **bold *mixed* run**, `x < 3`, {{fact:sat-rw-questions}}, [a page](learn:sat-math/algebra/linear-functions), " +
    "a < b > c, 5 \\* 3, and |x − 3|.",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(content, [
    "A ",
    { type: "strong", content: ["bold ", { type: "em", content: ["mixed"] }, " run"] },
    ", ",
    { type: "code", text: "x < 3" },
    ", ",
    { type: "fact", id: "sat-rw-questions" },
    ", ",
    { type: "link", page: "sat-math/algebra/linear-functions", content: ["a page"] },
    ", a < b > c, 5 * 3, and |x − 3|.",
  ]);
});

test("same-page anchors resolve to the page's own id", () => {
  const result = page("## One {#one}\n\nSee [two](#two).\n\n## Two {#two}\n\nText.\n");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(strip(result.links), [{ page: "sat/general/sample", anchor: "two" }]);
});

test("front matter problems are reported on their lines", () => {
  const missing = Learn.parse("# Title\n");
  assertError(missing, 1, /front matter/);
  const bad = Learn.parse("---\nid: a/b\ntitle: T\ncolor: blue\ntitle: Again\nnot a pair\nsection:\n---\n# T\n");
  assertError(bad, 4, /unknown front matter key "color"/);
  assertError(bad, 5, /"title" appears twice/);
  assertError(bad, 6, /key: value/);
  assertError(bad, 7, /"section" is empty/);
  const open = Learn.parse("---\nid: a/b\ntitle: T\n# T\n");
  assertError(open, 1, /never closed/);
  const noId = Learn.parse("---\ntitle: T\n---\n# T\n");
  assertError(noId, 1, /needs "id"/);
  const quoted = Learn.parse("---\nid: a/b # the path\ntitle: \"Rates # and ratios\"\n---\n# T\n");
  assert.deepEqual(quoted.errors, []);
  assert.deepEqual(quoted.meta, { id: "a/b", title: "Rates # and ratios" });
});

test("headings need anchors, valid levels, one title and unique ids", () => {
  const result = Learn.parse(
    "---\nid: a/b\ntitle: T\n---\nIntro first.\n\n# T {#t}\n\n## No anchor\n\n## Bad {#Bad_Id}\n\n" +
    "#### Too deep\n\n## One {#dup}\n\n### Two {#dup}\n\n# Second title\n",
  );
  assertError(result, 5, /starts with one "# Title"/);
  assertError(result, 7, /takes no \{#anchor\}/);
  assertError(result, 9, /needs an \{#anchor\}/);
  assertError(result, 11, /lower-case letters and digits/);
  assertError(result, 13, /only #, ## and ###/);
  assertError(result, 17, /used twice/);
  assertError(result, 19, /one "#" heading/);
});

test("raw HTML and entities fail anywhere, even inside code", () => {
  const result = page(
    "A <b>bold</b> word.\n\n<!-- hidden -->\n\nSee <https://satsuite.collegeboard.org>.\n\n" +
    "Fish &amp; chips.\n\nCode `<br>` too.\n\n```\n<div>\n```\n",
  );
  assertError(result, 7, /raw HTML/);
  assertError(result, 9, /raw HTML/);
  assertError(result, 11, /raw HTML/);
  assertError(result, 13, /entities/);
  assertError(result, 15, /raw HTML/);
  assertError(result, 18, /raw HTML/);
  assert.deepEqual(page("If 2 < x and x > 1, and 3 <= 4.\n").errors, []);
});

test("inline constructs outside the subset are errors on the right line", () => {
  const result = page(
    "First line of a paragraph,\nsecond line with 5 * 3 = 15,\nthird with **open bold.\n\n" +
    "Code `never closed.\n\n\\frac{1}{2} is LaTeX.\n\n![a figure](figure.png)\n\n" +
    "[College Board](http://collegeboard.org) and [evil](https://example.com) and " +
    "[js](javascript:alert(1)).\n\n{{fact:Bad Id}} and {{other}}.\n\nText {#anchor} here.\n",
  );
  assertError(result, 8, /unmatched \*/);
  assertError(result, 9, /unmatched \*\*/);
  assertError(result, 11, /unmatched `/);
  assertError(result, 13, /LaTeX/);
  assertError(result, 15, /images/);
  assertError(result, 17, /not an https link to an allowed host/);
  assertError(result, 17, /must be learn:/);
  assertError(result, 19, /double braces/);
  assertError(result, 21, /belongs at the end of a ## or ### heading/);
  const links = result.links.map((link) => link.url || link.page);
  assert.ok(!links.includes("http://collegeboard.org"));
  assert.ok(!links.some((link) => /example\.com|javascript/.test(link)));
});

test("block constructs outside the subset are errors", () => {
  const result = page(
    "- one\n  - nested\n- two\n\n* star item\n\n1) paren item\n\n---\n\nPara\n===\n\n" +
    "    indented code\n\n~~~\ntilde\n~~~\n\n```js\nx = 1\n```\n\n" +
    "> Just a quote.\n\n> **Example.** A callout\nlazy line.\n\n> **Note.** Inside.\n> ## Heading\n",
  );
  assertError(result, 8, /one level deep/);
  assertError(result, 11, /"- " or "1. "/);
  assertError(result, 13, /"- " or "1. "/);
  assertError(result, 15, /horizontal rules/);
  assertError(result, 18, /underlined headings/);
  assertError(result, 20, /cannot start indented/);
  assertError(result, 22, /not ~~~/);
  assertError(result, 26, /takes no language/);
  assertError(result, 30, /starts with a label/);
  assertError(result, 33, /every line of a callout starts with >/);
  assertError(result, 36, /heading cannot go inside a callout/);
  assertError(page("```\nnever closed\n"), 7, /never closed/);
});

test("tables split on spaced pipes, keep |x| in a cell, and check their shape", () => {
  const result = page("| a | b |\n| --- | ---: |\n| |x − 3| | 5 \\| 6 |\n| one |\n\n| head | only |\n| --- | --- |\n");
  assertError(result, 10, /this row has 1 cells; the header has 2/);
  assertError(result, 12, /at least one row/);
  const table = result.blocks.find((block) => block.type === "table");
  assert.deepEqual(table.rows[0], [["|x − 3|"], ["5 | 6"]]);
  assert.deepEqual(table.align, [null, "right"]);
  assertError(page("| a | b |\n| c | d |\n"), 7, /delimiter row/);
  assert.deepEqual(page("|x − 3| = 5 has two solutions.\n").errors, []);
});

test("callouts take each label, keep a suffix, and hold nested blocks", () => {
  Learn.CALLOUT_LABELS.forEach((label) => {
    const result = page(`> **${label}.** Body text.\n`);
    assert.deepEqual(result.errors, [], label);
    assert.equal(result.blocks[1].kind, label.toLowerCase().replace(/ /g, "-"));
  });
  const suffixed = page("> **Example 2:** Body.\n\n> **Fails when**: never.\n");
  assert.deepEqual(suffixed.errors, []);
  assert.equal(suffixed.blocks[1].label, "Example 2");
  assert.equal(suffixed.blocks[2].kind, "fails-when");
  assertError(page("> **Examples.** Body.\n"), 7, /starts with a label/);
  assertError(page("> **Example.**\n"), 7, /needs text after its label/);
  assertError(page("> **Example.** Body.\n>\n> **Fails when:** never.\n"), 9, /a new callout starts after a blank line/);
  const lists = page("> **Example.** Steps:\n>\n> 1. first\n> 2. second\n");
  assert.deepEqual(strip(lists.blocks[1].blocks[1]), { type: "list", ordered: true, items: [["first"], ["second"]] });
});

test("lists join continuation lines, keep their start number, and allow blank lines between items", () => {
  const result = page("3. three\n   continued\n\n4. four\n\n- bullet\n");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(strip(result.blocks.slice(1)), [
    { type: "list", ordered: true, start: 3, items: [["three continued"], ["four"]] },
    { type: "list", ordered: false, items: [["bullet"]] },
  ]);
});

test("sections gather each ## section's blocks for the gate", () => {
  const result = page("Intro.\n\n## A {#a}\n\n> **Example.** One.\n\n### Sub\n\nText.\n\n## B {#b}\n\nMore.\n");
  const sections = Learn.sections(result.blocks);
  assert.deepEqual(sections.map((section) => section.heading.id), ["a", "b"]);
  assert.deepEqual(sections[0].blocks.map((block) => block.type), ["callout", "heading", "paragraph"]);
  assert.deepEqual([...Learn.anchors(result.blocks)], [["a", 2], ["b", 2]]);
});

test("routes read a page, a page and anchor, the index, or nothing", () => {
  const pages = { "sat-math/algebra/linear-inequalities": {}, "sat/general/test-format": {} };
  assert.deepEqual(Learn.route("", pages), { view: "index" });
  assert.deepEqual(Learn.route("#", pages), { view: "index" });
  assert.deepEqual(Learn.route("#sat/general/test-format", pages), {
    view: "page", id: "sat/general/test-format", anchor: null,
  });
  assert.deepEqual(Learn.route("#sat-math/algebra/linear-inequalities/solve-inequalities", pages), {
    view: "page", id: "sat-math/algebra/linear-inequalities", anchor: "solve-inequalities",
  });
  assert.deepEqual(Learn.route("#no/such/page", pages), { view: "missing", path: "no/such/page" });
  assert.equal(Learn.route("#constructor", pages).view, "missing");
  assert.equal(Learn.route("#__proto__/x", pages).view, "missing");
  assert.equal(Learn.route("#%E0%A4%A", pages).view, "missing");
});

test("link and practice addresses follow the Learn contract", () => {
  assert.equal(Learn.learnHref("sat-math/algebra/linear-inequalities", "solve-inequalities"),
    "learn.html#sat-math/algebra/linear-inequalities/solve-inequalities");
  assert.equal(Learn.practiceHref("sat-math", "linear-inequalities"), "index.html#practice/sat-math/linear-inequalities");
  assert.equal(Learn.linkHref({ page: "a/b", anchor: "c" }), "#a/b/c");
  assert.equal(Learn.linkHref({ url: "https://www.desmos.com/calculator" }), "https://www.desmos.com/calculator");
  // The renderer re-checks every URL, so a tampered bundle cannot add one.
  assert.equal(Learn.linkHref({ url: "javascript:alert(1)" }), null);
  assert.equal(Learn.linkHref({ url: "https://evil.example/" }), null);
  assert.equal(Learn.linkHref({ url: "https://collegeboard.org.evil.example/" }), null);
  assert.equal(Learn.linkHref({ page: "a/b\"><x" }), null);
});

test("Math pages typeset prose runs only: never code, facts, headings, labels or ``` blocks", () => {
  assert.equal(Learn.typesetsMath({ kind: "skill", section: "sat-math" }), true);
  assert.equal(Learn.typesetsMath({ kind: "skill", section: "sat-reading-writing" }), false);
  assert.equal(Learn.typesetsMath({ kind: "general" }), false);
  assert.equal(Learn.typesetsMath(null), false);

  const source = fs.readFileSync(path.join(FIXTURES, "sat-math", "algebra", "linear-inequalities.md"), "utf8");
  const { blocks } = Learn.parse(source);
  const runs = [];
  Learn.proseRuns(blocks, (text) => runs.push(text));
  const has = (pattern) => runs.some((text) => pattern.test(text));
  // Prose in a paragraph, a table cell, and callout text is typeset.
  assert.ok(has(/When x\^2 ≤ 9/));
  assert.ok(runs.includes("x^(3/2) · x^(1/2)"));
  assert.ok(has(/Check x = 9: \(9 − 1\)\/2 = 4/));
  // Inline code, facts, headings, callout labels and ``` blocks are not.
  assert.ok(!has(/x\^2 <= 9/));
  assert.ok(!has(/tools\/check-learn/));
  assert.ok(!has(/70 minutes|sat-math-minutes/));
  assert.ok(!runs.includes("Powers and fractions"));
  assert.ok(!runs.includes("Example"));
  assert.ok(!has(/^\s*x − 1 > 6/m));

  // What the renderer then draws from those runs.
  const types = new Set();
  const collect = (nodes) => nodes.forEach((node) => {
    types.add(node.type);
    ["children", "num", "den"].forEach((key) => node[key] && collect(node[key]));
  });
  runs.forEach((text) => collect(Render.mathTokens(text)));
  assert.deepEqual(["sup", "frac", "root"].filter((type) => types.has(type)), ["sup", "frac", "root"]);
});
