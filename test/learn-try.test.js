"use strict";

// Renders Learn pages with Try it problems through src/app/learn.js on a
// minimal DOM: the problem shows, the hint and answer open in place from
// buttons that report their state, and the printed answers are built from
// the page data. Layout, keyboard and print preview are checked in a
// browser separately.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Learn = require("../src/lib/learn-markup");
const Render = require("../src/app/render");

const LEARN_APP = fs.readFileSync(path.join(__dirname, "..", "src", "app", "learn.js"), "utf8");

class Text {
  constructor(value) {
    this.nodeType = 3;
    this.nodeValue = String(value);
  }

  get textContent() {
    return this.nodeValue;
  }
}

class Element {
  constructor(tag) {
    this.tagName = String(tag).toLowerCase();
    this.nodeType = 1;
    this.childNodes = [];
    this.attributes = {};
    this.dataset = {};
    this.style = {};
    this.className = "";
    this.listeners = {};
    this.hidden = false;
    this.id = "";
    const self = this;
    this.classList = {
      add: (...names) => names.forEach((name) => {
        if (!self.classList.contains(name)) self.className = `${self.className} ${name}`.trim();
      }),
      remove: (...names) => {
        self.className = self.className.split(/\s+/).filter((name) => name && !names.includes(name)).join(" ");
      },
      contains: (name) => self.className.split(/\s+/).includes(name),
    };
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(typeof node === "string" ? new Text(node) : node));
  }

  appendChild(node) {
    this.childNodes.push(node);
    node.parentNode = this;
    return node;
  }

  replaceChildren(...nodes) {
    this.childNodes = [];
    this.append(...nodes);
  }

  set textContent(value) {
    this.childNodes = [new Text(value)];
  }

  get textContent() {
    return this.childNodes.map((node) => node.textContent).join("");
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  addEventListener(type, listener) {
    (this.listeners[type] = this.listeners[type] || []).push(listener);
  }

  click() {
    (this.listeners.click || []).forEach((listener) => listener({ target: this, preventDefault() {} }));
  }

  focus() {
    this.focused = true;
  }

  scrollIntoView() {}

  getClientRects() {
    return [];
  }

  // ".a", "tag", "tag.a": enough for learn.js.
  matches(selector) {
    const [tag, ...classes] = selector.split(".");
    return (!tag || this.tagName === tag) && classes.every((name) => this.classList.contains(name));
  }

  querySelectorAll(selector) {
    const found = [];
    const visit = (node) => (node.childNodes || []).forEach((child) => {
      if (child.nodeType === 1) {
        if (child.matches(selector)) found.push(child);
        visit(child);
      }
    });
    visit(this);
    return found;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  get clientWidth() {
    return 0;
  }

  get scrollWidth() {
    return 0;
  }
}

function makeDocument() {
  const nodes = {};
  const document = {
    title: "",
    createElement: (tag) => new Element(tag),
    createElementNS: (namespace, tag) => new Element(tag),
    createTextNode: (value) => new Text(value),
    getElementById: (id) => nodes[id] || null,
  };
  nodes.learnView = new Element("div");
  nodes.learnStatus = new Element("p");
  return document;
}

const FRONT = "---\nid: sat-math/algebra/linear-functions\ntitle: Linear functions\nsection: sat-math\n" +
  "domain: Algebra\nskill: Linear functions\n---\n# Linear functions\n\n";

const SOURCE = FRONT + [
  "## Slope {#slope}",
  "",
  "> **Example.** A worked example.",
  "",
  "> **Try it.** A line passes through (0, 3) and (2, 11). What is its slope?",
  ">",
  "> **First step.** The rise is 11 − 3 = 8.",
  ">",
  "> **Hint.** Divide the rise by the run.",
  ">",
  "> **Answer.** 4",
  ">",
  "> The run is 2 − 0 = 2, so the slope is 8/2 = 4.",
  "",
  "> **Try it.** What is the slope of y = 5x − 1?",
  ">",
  "> **Answer.** 5",
  ">",
  "> | Form | Slope |",
  "> | --- | --- |",
  "> | y = mx + b | m |",
  "",
].join("\n");

// Loads learn.js against a one-page bundle at `hash`; returns the view.
function load(page, hash) {
  const document = makeDocument();
  const window = {
    LiminalLearn: Learn,
    LiminalRender: Render,
    LIMINAL_LEARN: { pages: { [page.id]: page }, index: [] },
    location: { hash },
    addEventListener() {},
    scrollTo() {},
    setTimeout,
    clearTimeout,
  };
  const saved = { window: global.window, document: global.document };
  global.window = window;
  global.document = document;
  try {
    vm.runInThisContext(LEARN_APP, { filename: "learn.js" });
  } finally {
    global.window = saved.window;
    global.document = saved.document;
  }
  return { view: document.getElementById("learnView"), document };
}

function renderPage(hash) {
  const parsed = Learn.parse(SOURCE);
  assert.deepEqual(parsed.errors, []);
  return load({
    id: parsed.meta.id, kind: "skill", title: parsed.meta.title, section: "sat-math", domain: "Algebra",
    skill: "Linear functions", skillSlug: "linear-functions", blocks: parsed.blocks, facts: [],
  }, hash);
}

// Clicks with the same globals the page was built with (the math renderer
// reads the global document).
function within(document, run) {
  const saved = global.document;
  global.document = document;
  try {
    return run();
  } finally {
    global.document = saved;
  }
}

test("each Try it shows its problem and given step and numbers itself", () => {
  const { view } = renderPage("#sat-math/algebra/linear-functions");
  const boxes = view.querySelectorAll(".learn-try");
  assert.equal(boxes.length, 2);
  boxes.forEach((box, index) => {
    const label = box.querySelector(".learn-try-label");
    assert.equal(label.textContent, `Try it ${index + 1}`);
    assert.equal(box.getAttribute("role"), "group");
    assert.equal(box.getAttribute("aria-labelledby"), label.id);
  });
  const first = boxes[0].querySelector(".learn-try-first");
  assert.equal(first.hidden, false);
  assert.match(first.textContent, /First step, done for you/);
  assert.match(first.textContent, /The rise is 11 − 3 = 8\./);
  assert.match(boxes[0].textContent, /A line passes through \(0, 3\) and \(2, 11\)/);
  assert.equal(boxes[1].querySelector(".learn-try-first"), null);
});

test("the hint and the answer stay closed until their buttons open them", () => {
  const { view, document } = renderPage("#sat-math/algebra/linear-functions");
  const [box, second] = view.querySelectorAll(".learn-try");
  const buttons = box.querySelectorAll("button");
  assert.deepEqual(buttons.map((button) => button.textContent), ["Show a hint", "Show answer"]);
  assert.deepEqual(second.querySelectorAll("button").map((button) => button.textContent), ["Show answer"]);
  buttons.forEach((button) => {
    assert.equal(button.type, "button");
    assert.equal(button.getAttribute("aria-expanded"), "false");
  });
  const panelOf = (button) => box.childNodes.find((node) => node.id === button.getAttribute("aria-controls"));
  const [hintButton, answerButton] = buttons;
  const hint = panelOf(hintButton);
  const answer = panelOf(answerButton);
  assert.ok(hint.classList.contains("learn-try-hint"));
  assert.ok(answer.classList.contains("learn-try-answer"));
  assert.equal(hint.hidden, true);
  assert.equal(answer.hidden, true);
  // The answer and its worked solution are in the panel, after the buttons.
  assert.match(answer.textContent, /^Answer4The run is 2 − 0 = 2/);
  assert.ok(box.childNodes.indexOf(answer) > box.childNodes.indexOf(answerButton.parentNode));

  within(document, () => answerButton.click());
  assert.equal(answerButton.getAttribute("aria-expanded"), "true");
  assert.equal(answerButton.textContent, "Hide answer");
  assert.equal(answer.hidden, false);
  assert.equal(hint.hidden, true, "opening the answer leaves the hint as it was");

  within(document, () => hintButton.click());
  assert.equal(hint.hidden, false);
  assert.equal(hintButton.textContent, "Hide the hint");

  within(document, () => answerButton.click());
  assert.equal(answerButton.getAttribute("aria-expanded"), "false");
  assert.equal(answerButton.textContent, "Show answer");
  assert.equal(answer.hidden, true);
});

test("printed answers follow the lesson, numbered to match, whatever was opened", () => {
  const { view, document } = renderPage("#sat-math/algebra/linear-functions/slope");
  const article = view.querySelector(".learn-article");
  const key = article.querySelector(".learn-try-key");
  assert.ok(key, "the page has an answer key");
  assert.equal(key.getAttribute("aria-label"), "Answers to the Try it problems");
  const before = key.textContent;
  within(document, () => view.querySelectorAll(".learn-try")[0].querySelectorAll("button")[1].click());
  assert.equal(key.textContent, before);
  const items = key.querySelector("ol").childNodes;
  assert.equal(items.length, 2);
  assert.match(items[0].textContent, /^HintDivide the rise by the run\.4The run is 2 − 0 = 2/);
  assert.match(items[1].textContent, /^5/);
  assert.ok(items[1].querySelector("table"), "a worked table stays a table in the key");
  // The key comes after the lesson and before the practice link.
  const order = article.childNodes.map((node) => node.className);
  assert.ok(order.indexOf("learn-try-key") > order.lastIndexOf("learn-try"));
  assert.equal(order[order.length - 1], "learn-actions learn-end");
});

test("pages without Try it problems print no answer key", () => {
  const parsed = Learn.parse("---\nid: sat/general/sample\ntitle: Sample\n---\n# Sample\n\nJust text.\n");
  const { view } = load({ id: "sat/general/sample", kind: "general", title: "Sample", blocks: parsed.blocks, facts: [] },
    "#sat/general/sample");
  assert.ok(view.querySelector(".learn-article"));
  assert.equal(view.querySelector(".learn-try-key"), null);
});

test("learn.js builds every node through DOM APIs, never HTML strings", () => {
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(LEARN_APP));
});
