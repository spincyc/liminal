"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const A = require("../src/lib/ap-assessment");
const F = require("./fixtures/ap-fixtures");

// Minimal DOM: enough for ap-render.js to build and serialize its text.
class Text { constructor(value) { this.nodeValue = String(value); } get textContent() { return this.nodeValue; } }
class Element {
  constructor(tag) { this.tagName = tag; this.childNodes = []; this.attributes = {}; this.dataset = {}; this.className = "";
    this.classList = { add: name => { this.className = (this.className + " " + name).trim(); } }; }
  append(...nodes) { nodes.forEach(n => this.childNodes.push(typeof n === "string" ? new Text(n) : n)); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  set textContent(value) { this.childNodes = [new Text(value)]; }
  get textContent() { return this.childNodes.map(n => n.textContent).join(" "); }
  find(className) { const out = []; (function walk(n) { if (n instanceof Element) { if (n.className.split(" ").includes(className)) out.push(n); n.childNodes.forEach(walk); } })(this); return out; }
}
globalThis.document = { createElement: tag => new Element(tag), createTextNode: text => new Text(text) };
globalThis.LiminalAp = A;
globalThis.LiminalRender = {
  renderText(text) { const node = new Element("div"); const p = new Element("p"); p.textContent = text; node.append(p); return node; },
  renderFigure(figure) { const node = new Element("figure"); node.className = "lm-figure"; node.setAttribute("aria-label", figure.alt); return node; },
};
const R = require("../src/app/ap-render");

test("the student booklet shows questions, workspace and answer sheet without key material", () => {
  const doc = F.unitTest("physics-1", 1);
  doc.figures[0].svg = F.FIGURE_SVG;
  const node = R.booklet(A.studentCopy(doc), { context: "Course for AP® Physics 1", reference: F.reference("physics-1") });
  const text = node.textContent;
  assert.equal(node.dataset.copy, "student");
  for (const secret of ["Fixture rationale", "Placeholder note", "Fixture criterion", "Fixture answer", "Answer key", "P1.1.1"]) assert.equal(text.includes(secret), false, secret);
  assert.match(text, /Fixture question p1-u1-1/);
  assert.equal(node.find("ap-item").length, 14);
  assert.equal(node.find("ap-workspace").length, 6);
  assert.equal(node.find("ap-bubble").length, 48);
  assert.equal(node.find("lm-figure").length, 1);
  assert.equal(node.find("ap-reference-appended").length, 1);
  assert.match(text, /Calculator allowed/);
});

test("the answer key shows keys, rationales, rubrics and a raw-point tally", () => {
  const doc = F.unitTest("calculus-ab", 1);
  doc.figures[0].svg = F.FIGURE_SVG;
  const node = R.key(A.keyCopy(doc), { topicLabel: id => id === "AB.1.1" ? "Topic one" : "", unitTitle: () => "Limits" });
  const text = node.textContent;
  assert.equal(node.dataset.copy, "key");
  for (const shown of ["Fixture rationale 1", "Placeholder note for choice B", "Fixture criterion 1", "Fixture answer a1", "AB.1.1 Topic one", "Raw-point tally", "Unit 1: Limits"]) assert.ok(text.includes(shown), shown);
  assert.equal(node.find("ap-key-letter").map(n => n.textContent).join(""), "ABCDABCDABCD");
  assert.ok(text.includes("not AP scores"));
  assert.equal(A.claimProblems(text).length, 0);
});

test("paired key figures retain the given drawing and completed answer with their captions", () => {
  const doc = F.unitTest("calculus-ab", 1);
  doc.figures = [
    { id: "ab-u1-f1", alt: "Given axes", caption: "Blank graph", svg: F.FIGURE_SVG },
    { id: "ab-u1-f2", alt: "Completed curve", caption: "Answer graph", svg: F.FIGURE_SVG },
  ];
  const part = doc.sections.find(section => section.kind === "fr").parts[0].items[0].parts[0];
  part.figureIds = ["ab-u1-f1"]; part.answerFigureIds = ["ab-u1-f2"];
  const node = R.key(A.keyCopy(doc));
  const group = node.find("ap-key-figures")[0];
  assert.deepEqual(group.find("lm-figure").map(figure => figure.attributes["aria-label"]), ["Given axes", "Completed curve"]);
  assert.match(group.textContent, /Blank graph/);
  assert.match(group.textContent, /Answer graph/);
  const student = R.booklet(A.studentCopy(doc));
  assert.equal(student.find("lm-figure").some(figure => figure.attributes["aria-label"] === "Completed curve"), false);
  assert.equal(student.textContent.includes("Answer graph"), false);
});

test("ap.html loads its scripts in order and names every element its scripts use", () => {
  const html = fs.readFileSync(path.join(__dirname, "../src/ap.html"), "utf8");
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(scripts, ["content/ap-plan.js", "content/ap.js", "content/weekly-index.js", "lib/high-school.js", "lib/weekly.js", "lib/ap-assessment.js", "app/render.js", "app/ap-render.js", "app/ap.js"]);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  const app = fs.readFileSync(path.join(__dirname, "../src/app/ap.js"), "utf8");
  for (const [, id] of app.matchAll(/document\.getElementById\("([^"]+)"\)/g)) assert.ok(ids.includes(id) || /\.id = "/.test(app) && ["apHeading"].includes(id), id);
  assert.ok(html.includes(A.DISCLAIMER));
  assert.ok(html.includes('href="styles/math.css"'));
});
