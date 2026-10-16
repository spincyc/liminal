"use strict";

// The Desmos routes (content/desmos-routes.json): the data contract that
// tools/check-desmos.js enforces, that every route's template draws
// questions the test screen can match, and how the screen shows a route
// (only after an answer, never naming the template). The screen carries no
// calculator of its own (the owner's decision, 2026-10-16); math sections
// tell students to open their own.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const check = require("../tools/check-desmos");
const shell = require("../src/app/test-shell");
const { instantiate } = require("../src/lib/families/shared");
const satMath = require("../src/lib/families/sat/math");

const ROUTES = JSON.parse(fs.readFileSync(path.join(__dirname, "../content/desmos-routes.json"), "utf8"));

// A small DOM for the test screen, as in test/browser-review.test.js.
function dom() {
  const document = { listeners: new Map() };
  class Text {
    constructor(text) { this.nodeType = 3; this.textContent = String(text); this.parentNode = null; }
    remove() { if (this.parentNode) this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1); this.parentNode = null; }
    replaceWith(...nodes) {
      const parent = this.parentNode;
      if (!parent) return;
      const replacements = nodes.map((node) => typeof node === "string" ? new Text(node) : node);
      const next = parent.childNodes.slice(parent.childNodes.indexOf(this) + 1)
        .find((node) => !replacements.includes(node));
      replacements.forEach((node) => node.remove());
      this.remove();
      replacements.forEach((node) => {
        node.remove();
        parent.childNodes.splice(next ? parent.childNodes.indexOf(next) : parent.childNodes.length, 0, node);
        node.parentNode = parent;
      });
    }
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
    get firstElementChild() { return this.children[0] || null; }
    get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
    get isConnected() { return this === document.documentElement || Boolean(this.parentNode && this.parentNode.isConnected); }
    appendChild(node) { node.remove(); this.childNodes.push(node); node.parentNode = this; return node; }
    before(...nodes) {
      const parent = this.parentNode;
      if (!parent) return;
      nodes.forEach((node) => { node.remove(); parent.childNodes.splice(parent.childNodes.indexOf(this), 0, node); node.parentNode = parent; });
    }
    after(...nodes) {
      const parent = this.parentNode;
      if (!parent) return;
      let previous = this;
      nodes.forEach((node) => {
        node.remove();
        parent.childNodes.splice(parent.childNodes.indexOf(previous) + 1, 0, node);
        node.parentNode = parent;
        previous = node;
      });
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
    focus(options) { document.activeElement = this; this.focusOptions = options; }
    scrollIntoView() {}
    contains(node) { return node === this || this.children.some((child) => child.contains(node)); }
    matches(selector) {
      const tag = selector.match(/^[a-z][a-z0-9-]*/i);
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

const ACTIVE = { "sat-math": check.activeTemplateIds("sat-math") };
const ROUTE = { enter: "y = (left side) and y = (right side).", read: "The x-coordinate of the crossing.", fails: "When the answer is a fraction." };

test("the routes file passes its check and keys only active SAT Math templates", () => {
  assert.deepEqual(check.routeProblems(ROUTES, ACTIVE), []);
  assert.equal(ROUTES.format, "liminal-desmos-routes");
  assert.equal(ROUTES.version, 1);
  assert.deepEqual(Object.keys(ROUTES.sections), ["sat-math"]);
  assert.ok(Object.keys(ROUTES.sections["sat-math"]).length > 0);
});

test("every routed template draws questions the screen matches to its route", () => {
  const byId = new Map(satMath.map((family) => [family.id, family]));
  for (const templateId of Object.keys(ROUTES.sections["sat-math"])) {
    for (const seed of [1, 2]) {
      const question = instantiate(byId.get(templateId), seed);
      const route = shell.desmosRoute({ ...question, id: `sat-math:${templateId}:${seed}` }, ROUTES);
      assert.equal(route, ROUTES.sections["sat-math"][templateId], templateId);
      // A route is generic: it never names its template.
      for (const field of check.FIELDS) assert.ok(!route[field].includes(templateId), `${templateId}.${field}`);
    }
  }
});

test("the check rejects a wrong format, unknown or misordered ids and unsafe text", () => {
  const ids = ACTIVE["sat-math"];
  const doc = (routes, extra = {}) => ({ format: "liminal-desmos-routes", version: 1, sections: { "sat-math": routes }, ...extra });
  const problems = (data) => check.routeProblems(data, ACTIVE).join("\n");
  assert.deepEqual(check.routeProblems(doc({ [ids[0]]: ROUTE, [ids[1]]: ROUTE }), ACTIVE), []);
  assert.match(problems({ ...doc({}), format: "routes" }), /format must be/);
  assert.match(problems({ ...doc({}), version: 2 }), /version must be 1/);
  assert.match(problems({ format: "liminal-desmos-routes", version: 1, sections: { "act-mathematics": {} } }), /not a section with Desmos routes/);
  assert.match(problems(doc({ "no-such-template": ROUTE })), /not an active template/);
  assert.match(problems(doc({ [ids[1]]: ROUTE, [ids[0]]: ROUTE })), /out of the templates' order/);
  assert.match(problems(doc({ [ids[0]]: { enter: "a.", read: "b." } })), /fails must be a non-empty string/);
  assert.match(problems(doc({ [ids[0]]: { ...ROUTE, note: "x" } })), /unexpected fields note/);
  assert.match(problems(doc({ [ids[0]]: { ...ROUTE, read: "x".repeat(check.MAX_FIELD + 1) } })), /characters/);
  assert.match(problems(doc({ [ids[0]]: { ...ROUTE, enter: "<b>y = x</b>" } })), /contains HTML/);
  assert.match(problems(doc({ [ids[0]]: { ...ROUTE, enter: "y<x" } })), /contains HTML/);
  assert.match(problems(doc({ [ids[0]]: { ...ROUTE, enter: "Type `y = x`." } })), /contains Markdown/);
  assert.match(problems(doc({ [ids[0]]: { ...ROUTE, enter: "One.\nTwo." } })), /one line/);
  assert.match(problems(doc({ [ids[0]]: { ...ROUTE, enter: "A table, then y_1 ~ mx_1 + b." } })), /subscript with _/);
  assert.match(problems(doc({ [ids[0]]: { ...ROUTE, fails: "Use zoom to fit." } })), /zoom to fit/);
  assert.deepEqual(check.textProblems("y < 2x and y >= −3, then mean(L)."), []);
  assert.deepEqual(check.textProblems("A table, then y1 ~ mx1 + b; x/4 → − 2."), []);
});

test("the screen finds a route by template id or question id, and tolerates no routes", () => {
  const routes = { format: "liminal-desmos-routes", version: 1, sections: { "sat-math": { "tmpl-a": ROUTE, "tmpl-b": { enter: "x" } } } };
  assert.equal(shell.desmosRoute({ sectionKey: "sat-math", templateId: "tmpl-a" }, routes), ROUTE);
  assert.equal(shell.desmosRoute({ id: "sat-math:tmpl-a:12" }, routes), ROUTE);
  assert.equal(shell.desmosRoute({ sectionKey: "sat-math", templateId: "tmpl-b" }, routes), null, "incomplete route");
  assert.equal(shell.desmosRoute({ sectionKey: "sat-reading-writing", templateId: "tmpl-a" }, routes), null);
  assert.equal(shell.desmosRoute({ id: "sat-math-0001", sectionKey: "sat-math" }, routes), null, "fixed-bank id");
  assert.equal(shell.desmosRoute({ sectionKey: "sat-math", templateId: "toString" }, routes), null);
  assert.equal(shell.desmosRoute({ sectionKey: "sat-math", templateId: "tmpl-a" }, null), null);
  assert.equal(shell.desmosRoute({ sectionKey: "sat-math", templateId: "tmpl-a" }), null, "no global bundle");
});

const routed = {
  id: "sat-math:tmpl-a:7", templateId: "tmpl-a", sectionKey: "sat-math", test: "SAT", section: "Math",
  responseType: "multiple-choice", stem: "Choose two.", choices: ["2", "3", "4", "5"], correctAnswer: 0,
  explanation: "Two is the first choice.", hint: "Look first.", domain: "Algebra", skill: "Equations", difficulty: "Medium",
};
const plain = { ...routed, id: "sat-math:tmpl-z:3", templateId: "tmpl-z", stem: "Choose three." };

// A test screen over [routed, plain]; `bundle: false` leaves the routes
// global undefined, as when content/desmos-routes.js is missing.
function routedShell(feedback, { bundle = true } = {}) {
  const env = environment();
  if (bundle) env.window.LiminalDesmosRoutes = { format: "liminal-desmos-routes", version: 1, sections: { "sat-math": { "tmpl-a": ROUTE } } };
  env.load("render.js");
  env.load("test-shell.js");
  return { env, screen: env.window.LiminalShell.start({ questions: [routed, plain], feedback }) };
}

const routeBlock = (screen) => screen.element.querySelector(".lm-desmos");

test("instant feedback shows the route only after Check, and never names the template", () => {
  const { screen } = routedShell("instant");
  assert.equal(routeBlock(screen), null, "hidden before answering");
  screen.element.querySelector(".lm-choice").click();
  assert.equal(routeBlock(screen), null, "hidden after choosing, before Check");
  screen.element.querySelector(".lm-check-btn").click();
  const block = routeBlock(screen);
  assert.ok(block, "shown after Check");
  assert.deepEqual(block.querySelectorAll("dt").map((node) => node.textContent), ["Type", "Read", "When it fails"]);
  assert.deepEqual(block.querySelectorAll("dd").map((node) => node.textContent), [ROUTE.enter, ROUTE.read, ROUTE.fails]);
  // The standing typing rule: → leaves a fraction's bottom, exponent or root.
  assert.equal(block.querySelector(".lm-desmos-tip").textContent, shell.DESMOS_TYPING_TIP);
  assert.match(shell.DESMOS_TYPING_TIP, /press → .*fraction.*exponent.*root.*without commas/);
  assert.doesNotMatch(screen.element.textContent, /tmpl-a/);
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-choice").click();
  screen.element.querySelector(".lm-check-btn").click();
  assert.equal(routeBlock(screen), null, "a template without a route shows none");
  screen.close();
});

test("feedback at the end shows routes only in the answer review, and the report counts them", () => {
  const { screen } = routedShell("end");
  screen.element.querySelector(".lm-choice").click();
  assert.equal(routeBlock(screen), null);
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-next").click();
  assert.equal(routeBlock(screen), null, "the review page before finishing shows none");
  screen.element.querySelector(".lm-next").click();
  if (screen.element.querySelector("dialog") && screen.element.querySelector("dialog").open) {
    screen.element.querySelectorAll("dialog button").find((button) => button.textContent === "Finish").click();
  }
  assert.equal(screen.element.dataset.view, "report");
  assert.match(screen.element.querySelector(".lm-desmos-note").textContent, /^1 of these questions has a Desmos route\./);
  const desmosCells = screen.element.querySelectorAll(".lm-items-table td").filter((cell) => cell.getAttribute("data-label") === "Desmos");
  assert.deepEqual(desmosCells.map((cell) => cell.textContent), ["Route", "—"]);
  screen.element.querySelector(".lm-back").click();
  assert.ok(routeBlock(screen), "the answer review shows the route");
  screen.close();
});

test("without the routes bundle the screen shows no route and no report note", () => {
  const { screen } = routedShell("instant", { bundle: false });
  screen.element.querySelector(".lm-choice").click();
  screen.element.querySelector(".lm-check-btn").click();
  assert.equal(routeBlock(screen), null);
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-next").click();
  const dialog = screen.element.querySelector("dialog");
  if (dialog && dialog.open) dialog.querySelectorAll("button").find((button) => button.textContent === "Finish").click();
  assert.equal(screen.element.dataset.view, "report");
  assert.equal(screen.element.querySelector(".lm-desmos-note"), null);
  assert.ok(!screen.element.querySelectorAll(".lm-items-table th").some((cell) => cell.textContent === "Desmos"));
  screen.close();
});

test("the screen has no calculator button; math directions say to open one's own, other sections don't", () => {
  const { screen } = routedShell("instant");
  assert.equal(screen.element.querySelector(".lm-tool-calculator"), null);
  assert.ok(!screen.element.querySelectorAll(".lm-tool").some((tool) => /calculator/i.test(tool.textContent)));
  screen.element.querySelector(".lm-directions-toggle").click();
  const directions = screen.element.querySelector(".lm-directions-body").textContent;
  assert.match(directions, /A calculator is allowed on every question/);
  assert.ok(directions.includes(shell.calculatorNote("sat-math")));
  assert.match(shell.calculatorNote("sat-math"), /your own graphing calculator, for example desmos\.com\/calculator in another window beside this one/);
  assert.match(shell.calculatorNote("act-mathematics"), /your own calculator, for example desmos\.com\/calculator/);
  assert.doesNotMatch(shell.calculatorNote("act-mathematics"), /SAT/);
  screen.close();

  const env = environment();
  env.load("render.js");
  env.load("test-shell.js");
  const reading = { ...routed, id: "sat-reading-writing:tmpl-r:1", templateId: "tmpl-r", sectionKey: "sat-reading-writing", section: "Reading and Writing" };
  const rw = env.window.LiminalShell.start({ questions: [reading], feedback: "instant" });
  rw.element.querySelector(".lm-directions-toggle").click();
  assert.doesNotMatch(rw.element.querySelector(".lm-directions-body").textContent, /desmos|calculator/i);
  rw.close();
});
