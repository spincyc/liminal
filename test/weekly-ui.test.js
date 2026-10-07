"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const W = require("../src/lib/weekly");
const R = require("../src/app/weekly-render");
const render = require("../src/app/render");

// Minimal DOM adapter: exercise actual rendering and serialization without a
// browser dependency. Browser layout and interaction remain separate checks.
function documentFixture() {
  function escape(value) { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  class Text {
    constructor(value) { this.nodeType = 3; this.nodeValue = String(value); }
    get outerHTML() { return escape(this.nodeValue); }
  }
  class Element {
    constructor(tag) {
      Object.assign(this, { tagName: tag, childNodes: [], attributes: {}, dataset: {}, style: {}, className: "", events: {} });
      this.classList = { add: name => { this.className += " " + name; } };
    }
    appendChild(node) { this.childNodes.push(node); return node; }
    append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
    set textContent(value) { this.childNodes = [new Text(value)]; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    addEventListener(name, callback) { this.events[name] = callback; }
    get children() { return this.childNodes.filter(node => node.nodeType !== 3); }
    get outerHTML() {
      const attrs = { ...this.attributes };
      for (const key of ["className", "id", "href", "lang"]) if (this[key]) attrs[key === "className" ? "class" : key] = this[key];
      return "<" + this.tagName + Object.entries(attrs).map(([key, value]) => " " + key + '="' + escape(value) + '"').join("") + ">" + this.childNodes.map(node => node.outerHTML).join("") + "</" + this.tagName + ">";
    }
  }
  const doc = {
    createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag), createTextNode: value => new Text(value),
    createDocumentFragment: () => new Element("fragment"), implementation: { createHTMLDocument: () => documentFixture() },
  };
  doc.documentElement = doc.createElement("html"); doc.head = doc.createElement("head"); doc.body = doc.createElement("body"); doc.documentElement.append(doc.head, doc.body);
  return doc;
}
function withDOM(callback) {
  const oldDocument = global.document; const oldWindow = global.window;
  global.document = documentFixture(); global.window = { LiminalWeekly: W, LiminalRender: render };
  try { return callback(); } finally { global.document = oldDocument; global.window = oldWindow; }
}
function courseFixture(trackId = "common-core-reading") {
  const passage = { id: "text", title: "The library", text: "A learner opened a book.\n\nA second paragraph.", kind: "original", attribution: "Written for Liminal.", sourceUrl: "", readingMode: "independent", secret: "PASSAGE_PRIVATE" };
  const example = { prompt: "An example prompt", answer: "EXAMPLE_SECRET", steps: ["EXAMPLE_STEP_SECRET"], passageIds: ["text"] };
  return { trackId, grade: 12, private: "COURSE_PRIVATE", weeks: [{ week: 1, title: "Read closely", objective: "Notice the details.", connection: { before: "Sentences", after: "Inferences" }, days: ["Read", "Discuss"], explanation: ["An explanation."], examples: [example], passages: [passage, { ...passage, id: "unused", text: "UNUSED_PASSAGE" }], worksheets: ["a", "b", "c"].map(id => ({ id, title: "Practice " + id, directions: "Use the passage.", hidden: "SHEET_PRIVATE", items: [{ id: "item-" + id, prompt: "What did the learner open? <img src=x onerror=alert(1)>", answer: "ANSWER_SECRET_" + id, steps: ["KEY_STEP_SECRET"], passageIds: ["text"], skill: "Recall", teacher: "ITEM_PRIVATE" }] })) }] };
}

test("student export serializes only selected questions, referenced passages and blank workspace", () => withDOM(() => {
  const course = courseFixture();
  const packet = W.studentWorksheet(course, 1, "b");
  const html = R.exportDocument(packet, false, ".offline-math-style{display:block}").documentElement.outerHTML;
  for (const forbidden of ["ANSWER_SECRET", "EXAMPLE_SECRET", "KEY_STEP_SECRET", "EXAMPLE_STEP_SECRET", "COURSE_PRIVATE", "SHEET_PRIVATE", "ITEM_PRIVATE", "PASSAGE_PRIVATE", "UNUSED_PASSAGE"]) assert.ok(!html.includes(forbidden), forbidden);
  assert.match(html, /Worksheet B/); assert.match(html, /weekly-workspace/); assert.match(html, /sheet-passage-text/);
  assert.match(html, /Written for Liminal/); assert.match(html, /brand-symbol/); assert.match(html, /no affiliation/);
  assert.match(html, /offline-math-style/); assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<img|<script|<details|application\/json/);
}));

test("answer export contains worked reasoning for the selected worksheet only", () => withDOM(() => {
  const html = R.exportDocument(W.answerWorksheet(courseFixture(), 1, "c"), true).documentElement.outerHTML;
  assert.match(html, /ANSWER_SECRET_c/); assert.match(html, /KEY_STEP_SECRET/); assert.match(html, /Answer key/);
  assert.doesNotMatch(html, /ANSWER_SECRET_a|ANSWER_SECRET_b|EXAMPLE_SECRET|COURSE_PRIVATE|class="weekly-workspace"/);
}));

test("export keeps the full final workspace or solution with attribution in one print unit", () => withDOM(() => {
  for (const answers of [false, true]) {
    const course = courseFixture();
    const sheet = course.weeks[0].worksheets[0];
    sheet.items.push({ ...sheet.items[0], id: "last-item", prompt: "A final question." });
    const packet = answers ? W.answerWorksheet(course, 1, "a") : W.studentWorksheet(course, 1, "a");
    const doc = R.exportDocument(packet, answers, "", "https://example.org/weeks.html#common-core-reading/12/1");
    const main = doc.body.children[0];
    const worksheet = main.children.find(node => node.className === "weekly-worksheet");
    const items = worksheet.children.find(node => node.className === "weekly-items");
    assert.equal(items.children.length, 2);
    assert.equal(items.children[0].children.some(node => node.tagName === "footer"), false);
    const last = items.children[1];
    const footer = last.children.at(-1);
    assert.equal(footer.tagName, "footer"); assert.match(footer.outerHTML, /Coursework source/);
    assert.equal(last.children.at(-2).className, answers ? "weekly-answer" : "weekly-workspace");
    assert.match(doc.documentElement.outerHTML, /min-height:38mm/);
    assert.match(doc.documentElement.outerHTML, /\.weekly-items&gt;li\{break-inside:avoid\}/);
  }
}));

test("worked examples reveal solutions on request and use the existing accessible math renderer", () => withDOM(() => {
  const course = courseFixture("common-core-math"); const week = course.weeks[0];
  week.examples[0].prompt = "Evaluate 3/5 + x^2.";
  const guide = R.guide(week, true);
  assert.match(guide.outerHTML, /lm-math-sr/); assert.match(guide.outerHTML, /lm-math-stack/);
  assert.doesNotMatch(guide.outerHTML, /EXAMPLE_SECRET/);
  function find(node, className) { if (node.className === className) return node; return (node.childNodes || []).map(child => find(child, className)).find(Boolean); }
  const reveal = find(guide, "weekly-example-answer"); reveal.open = true; reveal.events.toggle();
  assert.match(guide.outerHTML, /EXAMPLE_SECRET/); assert.match(guide.outerHTML, /EXAMPLE_STEP_SECRET/);
  reveal.events.toggle(); assert.equal(guide.outerHTML.match(/EXAMPLE_SECRET/g).length, 1);
}));

test("unsafe passage source schemes never become export links", () => withDOM(() => {
  const course = courseFixture(); course.weeks[0].passages[0].sourceUrl = "javascript:alert(1)";
  const html = R.exportDocument(W.studentWorksheet(course, 1, "a"), false).documentElement.outerHTML;
  assert.doesNotMatch(html, /javascript:/);
}));

test("reading text stays in its own view instead of preceding the guide", () => withDOM(() => {
  const week = courseFixture().weeks[0];
  const guide = R.guide(week, false).outerHTML;
  assert.match(guide, /Understand the idea/);
  assert.doesNotMatch(guide, /A learner opened a book|A second paragraph/);
  const reading = R.reading(week, false).outerHTML;
  assert.match(reading, /A learner opened a book/); assert.match(reading, /A second paragraph/);
  assert.match(reading, /week-passage-text/); assert.match(reading, /Written for Liminal/);
}));

test("passage navigation opens a lazy reading view before finding and focusing its text", () => withDOM(() => {
  let ready = false; let focused = false; let scrolled = false; let prevented = false;
  document.getElementById = id => ready && id === "week-passage-text" ? { focus() { focused = true; }, scrollIntoView() { scrolled = true; } } : null;
  const packet = W.studentWorksheet(courseFixture(), 1, "a");
  const sheet = R.worksheet(packet, false, { onRead: () => { ready = true; } });
  const items = sheet.children.find(node => node.tagName === "ol");
  const links = items.children[0].children.find(node => node.className === "weekly-passage-links");
  links.events.click({ target: { closest: () => ({ getAttribute: () => "#week-passage-text" }) }, preventDefault() { prevented = true; } });
  assert.equal(ready, true); assert.equal(focused, true); assert.equal(scrolled, true); assert.equal(prevented, true);
}));
