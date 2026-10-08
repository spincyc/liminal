"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const W = require("../src/lib/weekly");
const R = require("../src/app/weekly-render");
const render = require("../src/app/render");
const H = require("../src/lib/high-school");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

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
      this.classList = {
        add: name => { this.className += " " + name; },
        toggle: (name, force) => {
          const names = new Set(this.className.split(/\s+/).filter(Boolean));
          const enabled = force === undefined ? !names.has(name) : force;
          if (enabled) names.add(name); else names.delete(name);
          this.className = [...names].join(" "); return enabled;
        },
      };
    }
    appendChild(node) { this.childNodes.push(node); return node; }
    append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
    replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
    set textContent(value) { this.childNodes = [new Text(value)]; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    addEventListener(name, callback) { this.events[name] = callback; }
    focus() { this.focused = true; }
    scrollIntoView() { this.scrolled = true; }
    querySelectorAll(selector) {
      const result = [];
      const matches = node => selector === "details:not([open])" ? node.tagName === "details" && !node.open : selector.startsWith(".") ? (node.className || "").split(/\s+/).includes(selector.slice(1)) : node.tagName === selector;
      function visit(node) { (node.childNodes || []).forEach(child => { if (matches(child)) result.push(child); visit(child); }); }
      visit(this); return result;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
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
  doc.querySelector = selector => doc.documentElement.querySelector(selector);
  doc.getElementById = id => {
    function find(node) { if (node.id === id) return node; return (node.childNodes || []).map(find).find(Boolean); }
    return find(doc.documentElement) || null;
  };
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

test("named-course exports retain the course identity and flexible scope without inventing a grade", () => withDOM(() => {
  const course = courseFixture("high-school-math");
  delete course.grade; course.courseId = "calculus"; course.title = "Calculus";
  const student = W.studentWorksheet(course, 1, "a");
  assert.equal(student.courseId, "calculus"); assert.equal(student.courseTitle, "Calculus"); assert.equal("grade" in student, false);
  for (const answers of [false, true]) {
    const packet = answers ? W.answerWorksheet(course, 1, "a") : student;
    const html = R.exportDocument(packet, answers).documentElement.outerHTML;
    assert.match(html, /High-school math · Calculus ·/);
    assert.match(html, /Conventional sequence · flexible placement/);
    assert.doesNotMatch(html, /Grade undefined|Grade null|Grade 12/);
    assert.equal(html.includes("ANSWER_SECRET_a"), answers);
  }
}));

test("export preserves every numbered response space and places attribution after the final response inside the column flow", () => withDOM(() => {
  for (const answers of [false, true]) {
    const course = courseFixture();
    const sheet = course.weeks[0].worksheets[0];
    sheet.items.push({ ...sheet.items[0], id: "last-item", prompt: "A final question." });
    const packet = answers ? W.answerWorksheet(course, 1, "a") : W.studentWorksheet(course, 1, "a");
    const doc = R.exportDocument(packet, answers, "", "https://example.org/weeks.html#common-core-reading/12/1");
    const worksheet = doc.querySelector(".weekly-worksheet");
    const flow = worksheet.querySelector(".worksheet-columns");
    const items = flow.querySelector(".weekly-items");
    assert.equal(items.children.length, 2);
    assert.deepEqual(items.querySelectorAll(".worksheet-number").map(node => node.outerHTML), [1, 2].map(n => `<h5 class="worksheet-number">${n}</h5>`));
    assert.equal(items.querySelectorAll("footer").length, 0);
    assert.equal(items.children[1].children.at(-1).className, answers ? "weekly-answer" : "weekly-workspace");
    assert.match(flow.children.at(-1).outerHTML, /Coursework source/);
    assert.match(flow.outerHTML, /Questions 1–2/);
  }
}));

test("shared passages identify exact question ranges, including gaps, without duplicating their text", () => withDOM(() => {
  const course = courseFixture();
  const sheet = course.weeks[0].worksheets[0];
  sheet.items = Array.from({ length: 5 }, (_, index) => ({ ...sheet.items[0], id: "item-" + index, passageIds: index === 2 ? [] : ["text"] }));
  const html = R.exportDocument(W.studentWorksheet(course, 1, "a"), false).documentElement.outerHTML;
  assert.match(html, /Questions 1–2, 4–5/);
  assert.equal(html.match(/A learner opened a book/g).length, 1);
  assert.equal((html.match(/<h5 class="worksheet-number">/g) || []).length, 5);
}));

test("offline assets carry all four embedded faces and the complete license; missing assets can be retried", () => withDOM(() => {
  const license = fs.readFileSync(path.join(__dirname, "../src/fonts/computer-modern/OFL.txt"), "utf8");
  const embedded = require("../tools/lib/reading-fonts").embed(fs.readFileSync(path.join(__dirname, "../src/styles/print.css"), "utf8"), path.join(__dirname, "../src/fonts/computer-modern"));
  const sheets = ["tokens", "math", "weekly", "brand", "print", "worksheet-print"].map(name => ({ href: "https://example.org/styles/" + name + ".css", cssRules: [{ cssText: name === "print" ? embedded : "." + name + "{}" }] }));
  const doc = { styleSheets: sheets, querySelector: () => ({ content: license }) };
  const face = sheets.splice(4, 1)[0];
  assert.throws(() => R.exportAssets(doc), /styles are still loading/);
  sheets.splice(4, 0, face);
  doc.querySelector = () => null;
  assert.throws(() => R.exportAssets(doc), /typeface could not load/);
  doc.querySelector = () => ({ content: license });
  const assets = R.exportAssets(doc);
  assert.equal(assets.fontLicense, license);
  assert.equal((assets.styles.match(/data:font\/woff2;base64,/g) || []).length, 4);
  const html = R.exportDocument(W.studentWorksheet(courseFixture(), 1, "a"), false, assets.styles, "", assets.fontLicense).documentElement.outerHTML;
  assert.match(html, /SIL OPEN FONT LICENSE Version 1.1/);
  assert.match(html, /THE FONT SOFTWARE IS PROVIDED/);
  assert.doesNotMatch(html, /url\(&quot;\.\.\/fonts/);
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

test("lesson printing includes unopened worked examples and restores disclosure state without leaking worksheet keys", () => withDOM(() => {
  const course = courseFixture("common-core-math"), week = course.weeks[0];
  week.examples.push({ ...week.examples[0], prompt: "Another model", answer: "SECOND_EXAMPLE" });
  const guide = R.guide(week, true);
  const disclosures = guide.querySelectorAll(".weekly-example-answer");
  disclosures[1].open = true;
  // No toggle event has fired: print preparation must still fill both answers.
  const restore = R.prepareGuidePrint(guide, week, true);
  assert.ok(disclosures.every(node => node.open));
  assert.match(guide.outerHTML, /EXAMPLE_SECRET/);
  assert.match(guide.outerHTML, /EXAMPLE_STEP_SECRET/);
  assert.match(guide.outerHTML, /SECOND_EXAMPLE/);
  restore();
  assert.equal(disclosures[0].open, false);
  assert.equal(disclosures[1].open, true);
  R.prepareGuidePrint(guide, week, true)();
  assert.equal(guide.outerHTML.match(/EXAMPLE_SECRET/g).length, 1);
  const student = R.exportDocument(W.studentWorksheet(course, 1, "a"), false).documentElement.outerHTML;
  assert.doesNotMatch(student, /EXAMPLE_SECRET|SECOND_EXAMPLE|ANSWER_SECRET|KEY_STEP_SECRET/);
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
  const items = sheet.querySelector(".weekly-items");
  const links = items.children[0].children.find(node => node.className === "weekly-passage-links");
  links.events.click({ target: { closest: () => ({ getAttribute: () => "#week-passage-text" }) }, preventDefault() { prevented = true; } });
  assert.equal(ready, true); assert.equal(focused, true); assert.equal(scrolled, true); assert.equal(prevented, true);
}));

test("named course plans preserve deep links, truthful availability, safe text and print disclosure state", () => withDOM(() => {
  for (const id of ["highSchoolStatus", "highSchoolContent", "highSchoolCourses", "highSchoolBrowser", "main"]) {
    const node = document.createElement("div"); node.id = id; document.body.append(node);
  }
  const skip = document.createElement("a"); skip.className = "skip-link"; document.body.append(skip);
  const data = { sources: [], standards: [{ id: "CALC.1", label: "An editorial objective", kind: "editorial-objective", locator: "Chapter 1" }], courses: H.ORDER.map(id => ({
    id, title: id, summary: "Learn <script>untrusted()</script> safely.", scopeNote: "A deliberately detailed scope note.", prerequisites: ["Prior ideas"], goals: ["Use the ideas"],
    units: [{ id: "u1", title: "A unit", weeks: 36, focus: "The focus", learning: ["A goal"], activities: ["A task"], evidence: ["A check"], bridge: "Next ideas", standards: ["CALC.1"] }],
  })) };
  const events = {};
  Object.assign(window, { LIMINAL_HIGH_SCHOOL: data, LiminalHighSchool: H, LIMINAL_WEEKLY_INDEX: { courses: [{ trackId: "high-school-math", courseId: "algebra", title: "Algebra" }] }, location: { hash: "#algebra/u1" }, addEventListener(name, callback) { events[name] = callback; } });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/app/high-school.js"), "utf8"), { window, document });
  const content = document.getElementById("highSchoolContent");
  assert.match(content.outerHTML, /weeks.html#high-school-math\/algebra\/1/);
  assert.match(content.outerHTML, /Editorial objective/); assert.match(content.outerHTML, /&lt;script&gt;/);
  assert.doesNotMatch(content.outerHTML, /<script>/);
  const unit = document.getElementById("high-school-unit-u1"); assert.equal(unit.open, true); assert.equal(unit.querySelector("summary").focused, true);
  const notes = content.querySelector(".high-school-notes"); assert.equal(notes.open, undefined);
  events.beforeprint(); assert.equal(notes.open, true); events.afterprint(); assert.equal(notes.open, false); assert.equal(unit.open, true);
  window.location.hash = "#calculus"; events.hashchange();
  assert.match(content.outerHTML, /Weekly work is being prepared/); assert.doesNotMatch(content.outerHTML, /weeks.html#high-school-math\/calculus/);
  assert.equal(document.getElementById("highSchoolHeading").focused, true);
  assert.deepEqual(document.getElementById("highSchoolCourses").children.map(node => node.href), H.ORDER.map(id => "#" + id));
}));

// AP fields: figures go through the real allow-list renderer, with a
// DOMParser built on the tooling XML parser.
const { parseXml } = require("../tools/lib/svg-tree");
const apFixture = require("./fixtures/weekly-ap");
const { withFigures } = require("../tools/build-weekly");
function withSvgDOM(callback) {
  const old = global.DOMParser;
  function toDom(node) {
    if (typeof node.text === "string") return { nodeType: 3, nodeValue: node.text };
    return { nodeType: 1, localName: node.name, namespaceURI: node.namespace, getElementsByTagName: () => [],
      attributes: node.attributes.map(a => ({ name: a.name, namespaceURI: a.namespace, value: a.value })), childNodes: node.children.map(toDom) };
  }
  global.DOMParser = class { parseFromString(markup) { return { documentElement: toDom(parseXml(markup)) }; } };
  try { return withDOM(callback); } finally { global.DOMParser = old; }
}
const apCourse = () => withFigures(apFixture.course(), apFixture.figures());

test("AP student exports show choices, points, policy badges, given figures and the AP notice, never keys or rubrics", () => withSvgDOM(() => {
  const course = apCourse();
  const mcHtml = R.exportDocument(W.studentWorksheet(course, 1, "a"), false).documentElement.outerHTML;
  assert.match(mcHtml, /No calculator/); assert.match(mcHtml, /Suggested time: 15 min/);
  assert.match(mcHtml, /weekly-choices/); assert.match(mcHtml, /\(A\)/); assert.match(mcHtml, /\(D\)/);
  assert.match(mcHtml, /<svg[^>]*aria-label="Parabola on an xy-plane/); assert.match(mcHtml, /<polyline/); assert.match(mcHtml, /Graph of f/);
  assert.match(mcHtml, /<table class="lm-table">/); assert.match(mcHtml, /<th[^>]*>g\(x\)<\/th>|g\(x\)/);
  assert.match(mcHtml, /trademarks registered by the College Board/);
  assert.doesNotMatch(mcHtml, /Correct choice|weekly-choice-key|class="weekly-answer"/);
  const frHtml = R.exportDocument(W.studentWorksheet(course, 2, "a"), false).documentElement.outerHTML;
  assert.match(frHtml, /\(3 points\)/); assert.match(frHtml, /Slope field for dy\/dx/);
  for (const secret of ["Key sketch", "same slope field with the solution curve", "Curve passes through", "Scoring", "Fixture model response"]) assert.ok(!frHtml.includes(secret), secret);
  const physics = R.exportDocument(W.studentWorksheet(course, 3, "a"), false).documentElement.outerHTML;
  assert.match(physics, /Any calculator/);
  assert.match(physics, /Note: Figure not drawn to scale\./);
}));

test("AP answer keys add the key letter, rubric rows and answer-only figures", () => withSvgDOM(() => {
  const course = apCourse();
  const mcKey = R.exportDocument(W.answerWorksheet(course, 1, "a"), true).documentElement.outerHTML;
  assert.match(mcKey, /Correct choice: \(C\)/); assert.match(mcKey, /weekly-choice weekly-choice-key/);
  const frKey = R.exportDocument(W.answerWorksheet(course, 2, "a"), true).documentElement.outerHTML;
  assert.match(frKey, /Scoring \(3 points\)/); assert.match(frKey, /1 point: /); assert.match(frKey, /Curve passes through/);
  assert.match(frKey, /Key sketch/); assert.match(frKey, /aria-label="The same slope field/);
  // Grade-track exports gain no AP notice.
  const plain = R.exportDocument(W.studentWorksheet(courseFixture(), 1, "a"), false).documentElement.outerHTML;
  assert.doesNotMatch(plain, /Advanced Placement/);
}));

test("the AP guide places explanation and example figures and reveals answer figures only on request", () => withSvgDOM(() => {
  const course = apCourse();
  const week1 = R.guide(course.weeks[0], true).outerHTML;
  assert.match(week1, /Four left rectangles/); assert.match(week1, /Parabola on an xy-plane/); assert.match(week1, /weekly-choices/);
  const guide = R.guide(course.weeks[2], true);
  assert.doesNotMatch(guide.outerHTML, /Free-body diagram: normal force/);
  function find(node, className, found = []) { if (node.className === className) found.push(node); (node.childNodes || []).forEach(child => find(child, className, found)); return found; }
  const reveal = find(guide, "weekly-example-answer")[1]; reveal.open = true; reveal.events.toggle();
  assert.match(guide.outerHTML, /Free-body diagram: normal force/);
}));
