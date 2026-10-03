"use strict";

// Behavioral DOM checks for the app adapters. This deliberately does not claim
// browser layout, native keyboard navigation, or accessibility-tree coverage.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("parenthetical prose with fractions can wrap while mathematical fences stay grouped", () => {
  const render = require("../src/app/render");
  const prose = render.mathTokens("(4, 8, 1/2 are powers of 2; 9, 27, 81 are powers of 3)");
  assert.ok(prose.some((node) => node.type === "frac"));
  assert.equal(prose.some((node) => node.type === "fence"), false);
  assert.ok(render.mathTokens("(2/3)^2").some((node) => node.type === "fence"));
});

function dom() {
  const document = { listeners: new Map() };
  class Text {
    constructor(text) { this.nodeType = 3; this.textContent = String(text); this.parentNode = null; }
    remove() { if (this.parentNode) this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1); this.parentNode = null; }
  }
  class Element extends Text {
    constructor(tag) {
      super("");
      this.nodeType = 1;
      this.tagName = tag.toUpperCase();
      this.childNodes = [];
      this.attributes = {};
      this.dataset = {};
      this.style = {};
      this.className = "";
      this.listeners = new Map();
      this.value = "";
      this.hidden = false;
      this.disabled = false;
      this.scrollTop = 0;
      this.classList = {
        contains: (name) => this.className.split(/\s+/).includes(name),
        add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(" "); },
        remove: (...names) => { this.className = this.className.split(/\s+/).filter((name) => !names.includes(name)).join(" "); },
        toggle: (name, force) => {
          const add = force === undefined ? !this.classList.contains(name) : force;
          this.classList[add ? "add" : "remove"](name);
          return add;
        },
      };
    }
    set textContent(value) { this.childNodes = [new Text(value)]; }
    get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
    get children() { return this.childNodes.filter((child) => child.nodeType === 1); }
    get isConnected() { return this === document.documentElement || Boolean(this.parentNode && this.parentNode.isConnected); }
    appendChild(node) { node.remove(); this.childNodes.push(node); node.parentNode = this; return node; }
    before(...nodes) {
      const parent = this.parentNode;
      if (!parent) return;
      nodes.forEach((node) => { node.remove(); parent.childNodes.splice(parent.childNodes.indexOf(this), 0, node); node.parentNode = parent; });
    }
    append(...nodes) { nodes.forEach((node) => this.appendChild(typeof node === "string" ? new Text(node) : node)); }
    replaceChildren(...nodes) { this.childNodes.forEach((node) => { node.parentNode = null; }); this.childNodes = []; this.append(...nodes); }
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      if (name === "class") this.className = String(value);
      if (name === "id") this.id = String(value);
      if (name === "hidden") this.hidden = true;
      if (name.startsWith("data-")) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = String(value);
    }
    getAttribute(name) { return this.attributes[name] ?? null; }
    hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
    removeAttribute(name) { delete this.attributes[name]; if (name === "hidden") this.hidden = false; }
    addEventListener(type, callback) { this.listeners.set(type, [...(this.listeners.get(type) || []), callback]); }
    removeEventListener(type, callback) { this.listeners.set(type, (this.listeners.get(type) || []).filter((entry) => entry !== callback)); }
    dispatch(type, details = {}) {
      const event = { target: this, currentTarget: this, button: 0, preventDefault() { this.defaultPrevented = true; }, ...details };
      (this.listeners.get(type) || []).forEach((callback) => callback(event));
      return event;
    }
    click() { if (!this.disabled) this.dispatch("click"); }
    focus() { document.activeElement = this; }
    scrollIntoView() {}
    contains(node) { return node === this || this.children.some((child) => child.contains(node)); }
    matches(selector) {
      const tag = selector.match(/^[a-z]+/i);
      if (tag && this.tagName !== tag[0].toUpperCase()) return false;
      const id = selector.match(/#([\w-]+)/);
      if (id && this.id !== id[1]) return false;
      for (const [, name] of selector.matchAll(/\.([\w-]+)/g)) if (!this.classList.contains(name)) return false;
      for (const [, name, value] of selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
        const actual = name.startsWith("data-") ? this.dataset[name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] : this.getAttribute(name);
        if (value === undefined ? actual === null || actual === undefined : actual !== value) return false;
      }
      return true;
    }
    querySelectorAll(selector) {
      const all = this.children.flatMap((child) => [child, ...child.querySelectorAll("*")]);
      return all.filter((node) => selector.split(",").some((part) => {
        const selectors = part.trim().split(/\s+/);
        if (!node.matches(selectors.pop())) return false;
        let parent = node.parentNode;
        while (selectors.length) {
          const wanted = selectors.pop();
          while (parent && (!parent.matches || !parent.matches(wanted))) parent = parent.parentNode;
          if (!parent) return false;
          parent = parent.parentNode;
        }
        return true;
      }));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    closest(selector) { return this.matches(selector) ? this : this.parentNode && this.parentNode.closest(selector); }
    showModal() { this.open = true; }
    close(value) { this.open = false; this.returnValue = value || ""; if (this.onclose) this.onclose(); }
  }
  document.createElement = (tag) => new Element(tag);
  document.createElementNS = (_, tag) => new Element(tag);
  document.createTextNode = (text) => new Text(text);
  document.documentElement = new Element("html");
  document.body = new Element("body");
  document.head = new Element("head");
  document.documentElement.append(document.head, document.body);
  document.activeElement = document.body;
  document.querySelectorAll = (selector) => document.documentElement.querySelectorAll(selector);
  document.querySelector = (selector) => document.documentElement.querySelector(selector);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  document.addEventListener = Element.prototype.addEventListener;
  document.removeEventListener = Element.prototype.removeEventListener;
  document.dispatch = Element.prototype.dispatch;
  return document;
}

function environment() {
  const document = dom();
  const intervals = new Map();
  const timeouts = new Map();
  let nextTimer = 1;
  const window = {
    document, console, status: "", Blob, URL,
    listeners: new Map(),
    setTimeout: (fn) => { const id = nextTimer++; timeouts.set(id, fn); return id; },
    clearTimeout: (id) => timeouts.delete(id),
    setInterval: (fn) => { const id = nextTimer++; intervals.set(id, fn); return id; },
    clearInterval: (id) => intervals.delete(id),
    requestAnimationFrame: (fn) => { fn(); return 1; },
    matchMedia: () => ({ matches: false }),
    scrollTo() {}, scrollY: 0, location: { hash: "#practice" },
    addEventListener: document.addEventListener,
    removeEventListener: document.removeEventListener,
    PracticeCore: require("../src/lib/core"),
    LiminalTestEngine: require("../src/lib/test-engine"),
  };
  window.window = window;
  const context = vm.createContext(window);
  const load = (file) => vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/app", file), "utf8"), context);
  return { window, document, load, intervals, timeouts };
}

function shellFixture() {
  const env = environment();
  env.load("render.js");
  env.load("test-shell.js");
  return env;
}

function appFixture(blockStorage = false) {
  const env = environment();
  const { window, document } = env;
  for (const id of ["storageWarning", "storageWarningText", "storageDownloadBtn"]) {
    const node = document.createElement(id.endsWith("Btn") ? "button" : "div");
    node.id = id;
    node.className = "hidden";
    document.body.append(node);
  }
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  Object.defineProperty(window, "localStorage", { get() { if (blockStorage) throw Error("Storage blocked"); return storage; } });
  window.PRACTICE_CATALOG = { sections: [] };
  window.LiminalProgress = require("../src/lib/progress");
  window.LiminalSessionStore = require("../src/lib/session-store");
  window.LiminalPractice = require("../src/lib/practice");
  window.LiminalSite = { getTest: () => "SAT", onTestChange() {} };
  window.LiminalViews = {};
  const header = document.createElement("header");
  header.className = "site-header";
  document.body.append(header);
  for (const [factory, name, hash] of [["practice", "setup", "practice"], ["progress", "dashboard", "progress"], ["review", "review", "review"], ["tips", "signs", "tips"]]) {
    const element = document.createElement("section");
    document.body.append(element);
    const anchor = document.createElement("a");
    anchor.dataset.view = name;
    header.append(anchor);
    window.LiminalViews[factory] = (ctx) => {
      env.ctx = ctx;
      return { name, hash, element, open: (options) => ctx.showView(name, options) };
    };
  }
  env.load("app.js");
  return env;
}

const mc = { id: "sat-math-0001", sectionKey: "sat-math", test: "SAT", section: "Math", responseType: "multiple-choice", stem: "Choose two.", choices: ["2", "3", "4", "5"], correctAnswer: 0, hint: "Use the first option.", domain: "Algebra", skill: "Equations", difficulty: "Medium" };
const essay = { id: "act-writing-0001", sectionKey: "act-writing", test: "ACT", section: "Writing", responseType: "essay", stem: "Develop a position on shared gardens.", stimulus: { type: "writing-prompt", content: "Consider shared gardens and their costs." }, domain: "Ideas and Analysis", skill: "Engage perspectives", difficulty: "Medium", hint: "Compare values.", correctAnswer: { sampleThesis: "A trial can test the idea.", outline: ["State a position.", "Address a limitation."], reviewCriteria: ["Develop your reasons."] } };
const draft = "A shared garden can help neighbors.\n\nA trial would measure both benefits and costs.";

for (const feedback of ["instant", "end"]) test(`essay drafts survive resume and offer unscored self-review (${feedback})`, () => {
  const env = shellFixture();
  let screen = env.window.LiminalShell.start({ questions: [essay], feedback });
  const input = screen.element.querySelector("textarea");
  assert.ok(input, "essay uses a text area");
  assert.equal(screen.element.querySelector(".lm-spr-input"), null);
  assert.equal(screen.element.querySelector(".lm-check-btn"), null);
  input.value = draft;
  input.dispatch("input");
  assert.equal(screen.snapshot().session.responses[0], draft);
  const saved = screen.snapshot({ paused: true });
  screen.close();
  screen = env.window.LiminalShell.start({ resume: saved });
  assert.equal(screen.element.querySelector("textarea").value, draft);
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-next").click();
  assert.equal(screen.element.dataset.view, "report");
  assert.match(screen.element.textContent, /Ready for self-review/);
  assert.doesNotMatch(screen.element.querySelector(".lm-main").textContent, /0%|Incorrect|\[object Object\]/);
  screen.element.querySelector(".lm-back").click();
  assert.equal(screen.element.querySelector(".lm-essay-response").textContent, draft);
  assert.match(screen.element.textContent, /Self-review criteria/);
  assert.match(screen.element.textContent, /A trial can test the idea/);
  assert.ok(screen.element.querySelectorAll("button").some((button) => button.textContent === "Download essay"));
  screen.close();
  assert.equal(env.intervals.size, 0);
});

test("answer review retains the question's marked state", () => {
  const env = shellFixture();
  const screen = env.window.LiminalShell.start({ questions: [mc], feedback: "instant" });
  screen.element.querySelector(".lm-mark").click();
  screen.element.querySelector(".lm-choice").click();
  screen.element.querySelector(".lm-check-btn").click();
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-back").click();
  assert.match(screen.element.querySelector(".lm-marked-tag").textContent, /Marked/);
  screen.close();
});

test("a response arriving after the deadline opens the report without recording a late answer", () => {
  const env = shellFixture();
  let now = 0;
  let result;
  const screen = env.window.LiminalShell.start({ questions: [mc], timeLimitSeconds: 1, now: () => now, onFinish: (value) => { result = value; } });
  now = 2000;
  screen.element.querySelector(".lm-choice").click();
  assert.equal(screen.element.dataset.view, "report");
  assert.equal(result.items[0].response, null);
  screen.close();
});

test("blocked storage gives a persistent warning even after successful in-memory updates", () => {
  const { document, ctx } = appFixture(true);
  const warning = document.getElementById("storageWarning");
  assert.equal(warning.classList.contains("hidden"), false);
  assert.match(document.getElementById("storageWarningText").textContent, /only until this page closes/);
  assert.equal(ctx.update((progress) => progress).ok, true);
  assert.equal(warning.classList.contains("hidden"), false);
});

test("available storage does not show the temporary-memory warning", () => {
  const { document } = appFixture();
  assert.equal(document.getElementById("storageWarning").classList.contains("hidden"), true);
});

test("modified navigation clicks retain native new-tab/window behavior", () => {
  const { document, window } = appFixture();
  const link = document.querySelector('[data-view="dashboard"]');
  for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
    const event = link.dispatch("click", modifiers);
    assert.equal(Boolean(event.defaultPrevented), false);
    assert.equal(window.location.hash, "#practice");
  }
  assert.equal(link.dispatch("click").defaultPrevented, true);
  assert.equal(window.location.hash, "#progress");
});

test("active drills hide skill and difficulty until the report", () => {
  const env = shellFixture();
  const screen = env.window.LiminalShell.start({ questions: [mc], title: "Equations: Medium", feedback: "instant" });
  assert.equal(screen.element.querySelector(".lm-title").textContent, "SAT Math");
  assert.doesNotMatch(screen.element.getAttribute("aria-label"), /Equations|Medium/);
  screen.element.querySelector(".lm-choice").click();
  screen.element.querySelector(".lm-check-btn").click();
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-next").click();
  assert.equal(screen.element.querySelector(".lm-title").textContent, "Equations: Medium");
  screen.close();
});

test("a complete test retains its original totals when only part of the answer review is available", () => {
  const env = shellFixture();
  const engine = env.window.LiminalTestEngine;
  const finished = engine.combineFinished([{ questions: [mc], responses: [0], elapsedMs: 1000 }], 2000);
  const screen = env.window.LiminalShell.start({
    resume: engine.serialize(finished, 2000),
    reportSummary: { total: 3, scored: 3, correct: 2, accuracy: 2 / 3, answered: 3, unanswered: 0 },
    reportNotes: ["Two older questions are unavailable for review; totals still show the complete test."],
  });
  assert.match(screen.element.querySelector(".lm-score-main").textContent, /2 of 3/);
  assert.match(screen.element.querySelector(".lm-report-note").textContent, /complete test/);
  assert.equal(screen.element.querySelectorAll(".lm-items-table tbody tr").length, 1);
  screen.close();
});

test("a paused unavailable section remains saved when resume is refused", async () => {
  const { ctx, window } = appFixture();
  window.LiminalShell = { canResume: () => true };
  const saved = {
    config: { sessionId: "science-draft", sectionKey: "act-science" },
    state: { questions: [{ ...mc, sectionKey: "act-science" }], finished: false },
  };
  window.localStorage.setItem("liminal:session:v1", JSON.stringify(saved));
  const message = await ctx.resume("set");
  assert.match(message, /temporarily unavailable/);
  assert.match(message, /saved set is still kept/);
  assert.equal(window.localStorage.getItem("liminal:session:v1"), JSON.stringify(saved));
});

function reviewFixture(question, attempt) {
  const env = environment();
  const { document, window } = env;
  const Progress = require("../src/lib/progress");
  const progress = { ...Progress.empty(), attempts: [attempt], marked: [question.id] };
  const launched = [];
  for (const id of ["reviewView", "missedTab", "flaggedTab", "reviewList"]) {
    const node = document.createElement(id.endsWith("Tab") ? "button" : "div");
    node.id = id;
    if (id.endsWith("Tab")) node.dataset.list = id === "missedTab" ? "missed" : "flagged";
    document.body.append(node);
  }
  env.load("render.js");
  window.LiminalReviewQueue = require("../src/lib/review-queue");
  env.load("views/review.js");
  const view = window.LiminalViews.review({
    Progress, core: window.PracticeCore, render: window.LiminalRender,
    practice: require("../src/lib/practice"),
    currentTest: () => "ACT", registry: () => [], store: { get: () => progress },
    questionsForIds: async () => [question], formatNumber: String,
    sectionLabel: () => "Mathematics", testSections: () => [{ key: "act-mathematics" }],
    showView() {}, setStatus: (node, message) => { node.textContent = message; },
    launch: (config) => launched.push(config),
  });
  return { ...env, progress, view, launched };
}

test("Review withholds mismatched or unknown bank details and keeps current-version practice available", async () => {
  const Progress = require("../src/lib/progress");
  const original = { ...mc, id: "act-mathematics-0007", sectionKey: "act-mathematics", test: "ACT", choices: ["Old choice", "3", "4", "5"] };
  const current = { ...original, choices: ["Revised choice", "3", "4", "5"], correctAnswer: 2 };
  const oldAttempt = Progress.buildAttempt(original, { response: 0, correct: false }, { id: "old:0", sessionId: "old", now: 0 });
  const unknownAttempt = { ...oldAttempt };
  delete unknownAttempt.contentIdentity;
  const matchingAttempt = Progress.buildAttempt(current, { response: 0, correct: false }, { id: "new:0", sessionId: "new", now: 0 });
  for (const [attempt, matches] of [[oldAttempt, false], [unknownAttempt, false], [matchingAttempt, true]]) {
    const { document, view, progress, launched } = reviewFixture(current, attempt);
    const unchanged = JSON.stringify(progress);
    view.open({}, ["marked"]);
    document.querySelectorAll("button").find((button) => button.textContent === "Show question").click();
    await new Promise(setImmediate);
    const detail = document.querySelector(".review-question-host");
    if (matches) {
      assert.match(detail.textContent, /Revised choice/);
      assert.doesNotMatch(detail.textContent, /original version.*unavailable/);
    } else {
      assert.match(detail.textContent, /original version.*unavailable/);
      assert.doesNotMatch(detail.textContent, /Revised choice|Why A is wrong/);
    }
    assert.equal(JSON.stringify(progress), unchanged, "display preserves historical outcomes and marks");
    document.querySelectorAll("button").find((button) => button.textContent.startsWith("Practise all")).click();
    await new Promise(setImmediate);
    assert.equal(launched.length, 1);
    assert.equal(launched[0].questions[0].choices[0], "Revised choice");
    assert.equal(launched[0].questions[0].correctAnswer, 2);
  }
});

test("scheduled bank review cannot serve changed content as the original question", async () => {
  const Progress = require("../src/lib/progress");
  const original = { ...mc, id: "act-mathematics-0007", sectionKey: "act-mathematics", test: "ACT" };
  const current = { ...original, correctAnswer: 2 };
  const attempt = Progress.buildAttempt(original, { response: 0, correct: false }, { id: "old:0", sessionId: "old", now: 0 });
  const { document, view, launched } = reviewFixture(current, attempt);
  view.open({}, ["due"]);
  document.querySelectorAll("button").find((button) => button.textContent.startsWith("Start review")).click();
  await new Promise(setImmediate);
  assert.equal(launched.length, 0);
  assert.match(document.getElementById("reviewList").textContent, /original versions.*no longer available/);
  assert.match(document.getElementById("reviewList").textContent, /Use Missed or Marked/);
  const legacy = { ...attempt };
  delete legacy.contentIdentity;
  const unknown = reviewFixture(current, legacy);
  unknown.view.open({}, ["due"]);
  assert.equal(unknown.document.querySelectorAll("button").some((button) => button.textContent.startsWith("Start review")), false);
  assert.match(unknown.document.getElementById("reviewList").textContent, /Try current version/);
});
