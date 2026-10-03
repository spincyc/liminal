"use strict";

// Behavioral DOM checks for the app adapters. This deliberately does not claim
// browser layout, native keyboard navigation, or accessibility-tree coverage.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

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
      if (name === "disabled") this.disabled = true;
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
    focus() { if (!this.disabled && !this.closest("[inert]")) document.activeElement = this; }
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
    showModal() { this.open = true; this.setAttribute("open", ""); }
    close(value) { this.open = false; this.removeAttribute("open"); this.returnValue = value || ""; if (this.onclose) this.onclose(); }
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
    cancelAnimationFrame() {},
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

function appFixture(blockStorage = false, practiceCore) {
  const env = environment();
  const { window, document } = env;
  env.sessionProblems = [];
  if (practiceCore) window.PracticeCore = practiceCore;
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
      return { name, hash, element, open: (options) => ctx.showView(name, options),
        onSessionChange: (problem) => { if (problem) env.sessionProblems.push(problem); },
      };
    };
  }
  window.PRACTICE_CATALOG.sections = require('../content/catalog.json').sections;
  for (const [name,file] of Object.entries({LiminalRuns:'runs',LiminalModules:'modules',LiminalSimulation:'simulation',LiminalAnalytics:'analytics',LiminalReviewQueue:'review-queue'})) window[name] = require('../src/lib/'+file);
  env.load('render.js'); env.load('test-shell.js');
  env.load("app.js");
  return env;
}

const mc = { id: "sat-math-0001", sectionKey: "sat-math", test: "SAT", section: "Math", responseType: "multiple-choice", stem: "Choose two.", choices: ["2", "3", "4", "5"], correctAnswer: 0, hint: "Use the first option.", domain: "Algebra", skill: "Equations", difficulty: "Medium" };

function finishWrong(screen) {
  screen.element.querySelectorAll(".lm-choice")[1].click();
  screen.element.querySelector(".lm-next").click();
  screen.element.querySelector(".lm-next").click();
  assert.equal(screen.element.dataset.view, "report");
}

function actionButton(screen, prefix) {
  return screen.element.querySelectorAll(".lm-next-actions button")
    .find((button) => button.textContent.startsWith(prefix));
}

const settled = () => new Promise(setImmediate);

function saveSet(window, owner, questions = [mc]) {
  const saved = JSON.stringify({
    config: { sessionId: owner, title: `Saved ${owner}`, sectionKey: questions[0].sectionKey, feedback: "end" },
    savedAt: Date.now(), state: window.LiminalTestEngine.create({ questions }).serialize({ paused: true }),
  });
  window.localStorage.setItem("liminal:session:v1", saved);
  return saved;
}

test("a first-render failure releases the shell, page locks, observers and listeners before retry", () => {
  const env = shellFixture();
  const { document, window } = env;
  const page = document.createElement("button");
  const alreadyInert = document.createElement("aside");
  alreadyInert.setAttribute("inert", "");
  document.body.append(page, alreadyInert);
  document.documentElement.style.overflow = "scroll";
  page.focus();
  const observers = [];
  window.ResizeObserver = class {
    constructor() { this.nodes = new Set(); observers.push(this); }
    observe(node) { this.nodes.add(node); }
    disconnect() { this.nodes.clear(); }
  };
  const renderText = window.LiminalRender.renderText;
  window.LiminalRender.renderText = () => { throw Error("Injected first-render failure"); };
  assert.throws(() => window.LiminalShell.start({ questions: [mc] }), /Injected first-render failure/);
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
  assert.equal(document.documentElement.style.overflow, "scroll");
  assert.equal(page.hasAttribute("inert"), false);
  assert.equal(alreadyInert.hasAttribute("inert"), true);
  assert.equal(document.activeElement, page);
  for (const type of ["keydown", "pointerdown", "visibilitychange"]) assert.equal(document.listeners.get(type).length, 0, type);
  assert.equal(window.listeners.get("pagehide").length, 0);
  assert.ok(observers.every((observer) => observer.nodes.size === 0));
  assert.equal(env.intervals.size, 0);
  assert.equal(env.timeouts.size, 0);
  window.LiminalRender.renderText = renderText;
  const retry = window.LiminalShell.start({ questions: [mc] });
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  retry.close();
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
  assert.equal(document.documentElement.style.overflow, "scroll");
  assert.equal(document.listeners.get("keydown").length, 0);
  assert.equal(env.intervals.size, 0);
});

test("a real shell resume failure keeps the saved answers and restores the page for retry", async () => {
  const env = appFixture();
  const { document, window, ctx } = env;
  const session = window.LiminalTestEngine.create({ questions: [mc] });
  session.select(1);
  const saved = JSON.stringify({
    config: { sessionId: "saved-set", title: "Saved set", sectionKey: "sat-math", feedback: "end" },
    savedAt: Date.now(), state: session.serialize({ paused: true }),
  });
  window.localStorage.setItem("liminal:session:v1", saved);
  const renderText = window.LiminalRender.renderText;
  window.LiminalRender.renderText = () => { throw Error("Injected resume render failure"); };
  assert.match(await ctx.resume("set"), /still saved/);
  assert.equal(window.localStorage.getItem("liminal:session:v1"), saved);
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
  assert.equal(document.querySelector(".site-header").hasAttribute("inert"), false);
  window.LiminalRender.renderText = renderText;
  assert.equal(await ctx.resume("set"), null);
  const selected = document.querySelectorAll(".lm-choice")[1];
  assert.equal(selected.getAttribute("aria-pressed"), "true");
  document.querySelector(".lm-tool-close").click();
  document.querySelector(".lm-dialog .lm-btn-primary").click();
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
});

test("a report action waits, rejects visibly, avoids duplicate requests and can retry", async () => {
  const env = shellFixture();
  let reject;
  let resolve;
  let requests = 0;
  let exits = 0;
  const screen = env.window.LiminalShell.start({ questions: [mc], feedback: "end",
    onExit: () => { exits += 1; },
    reportActions: () => [{ label: "Try next", run: () => {
      requests += 1;
      return new Promise((yes, no) => { resolve = yes; reject = no; });
    } }],
  });
  finishWrong(screen);
  actionButton(screen, "Try next").click();
  assert.equal(screen.element.isConnected, true);
  assert.equal(exits, 0);
  assert.match(screen.element.textContent, /Opening your next practice/);
  assert.equal(actionButton(screen, "Try next").disabled, true);
  actionButton(screen, "Try next").click();
  assert.equal(requests, 1);
  reject(Error("Network unavailable"));
  await settled();
  assert.match(screen.element.querySelector(".lm-next-steps [role=\"alert\"]").textContent, /Network unavailable.*Try again/);
  assert.equal(actionButton(screen, "Try next").disabled, false);
  assert.equal(exits, 0);
  actionButton(screen, "Try next").click();
  assert.equal(requests, 2);
  resolve(true);
  await settled();
  assert.equal(screen.element.isConnected, false);
  assert.equal(exits, 1);
});

test("canceling a report action preserves the report without an error", async () => {
  const env = shellFixture();
  const screen = env.window.LiminalShell.start({ questions: [mc], feedback: "end",
    reportActions: () => [{ label: "Keep saved set", run: async () => false }],
  });
  finishWrong(screen);
  actionButton(screen, "Keep saved").click();
  await settled();
  assert.equal(screen.element.isConnected, true);
  assert.equal(screen.element.querySelector(".lm-next-steps [role=\"alert\"]").hidden, true);
  assert.equal(actionButton(screen, "Keep saved").disabled, false);
  screen.close();
});

test("a replacement render failure keeps the report alive and its next retry replaces it cleanly", async () => {
  const env = shellFixture();
  const { document, window } = env;
  document.documentElement.style.overflow = "auto";
  const page = document.createElement("main");
  document.body.append(page);
  let next;
  const screen = window.LiminalShell.start({ questions: [mc], feedback: "end",
    reportActions: () => [{ label: "Start replacement", run: () => {
      next = window.LiminalShell.start({ questions: [mc] });
    } }],
  });
  finishWrong(screen);
  const renderText = window.LiminalRender.renderText;
  window.LiminalRender.renderText = () => { throw Error("Replacement failed"); };
  actionButton(screen, "Start replacement").click();
  await settled();
  assert.equal(screen.element.isConnected, true);
  assert.equal(screen.element.hasAttribute("inert"), false);
  assert.match(screen.element.textContent, /Replacement failed/);
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  assert.equal(document.listeners.get("keydown").length, 1);
  assert.equal(document.documentElement.style.overflow, "hidden");
  assert.equal(page.hasAttribute("inert"), true);
  window.LiminalRender.renderText = renderText;
  actionButton(screen, "Start replacement").click();
  await settled();
  assert.equal(screen.element.isConnected, false);
  assert.equal(next.element.isConnected, true);
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  assert.equal(page.hasAttribute("inert"), true);
  assert.equal(document.documentElement.style.overflow, "hidden");
  next.close();
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
  assert.equal(page.hasAttribute("inert"), false);
  assert.equal(document.documentElement.style.overflow, "auto");
  assert.equal(document.listeners.get("keydown").length, 0);
});

test("a reused page dialog permits cancel and confirm while the report and background locks survive", async () => {
  const { document, window, ctx } = appFixture();
  const alreadyInert = document.createElement("aside");
  alreadyInert.setAttribute("inert", "");
  document.body.append(alreadyInert);
  document.documentElement.style.overflow = "scroll";
  saveSet(window, "first");
  const initial = ctx.confirmReplace("set");
  const dialog = document.querySelector(".page-dialog");
  dialog.querySelector("button").click();
  assert.equal(await initial, false);
  let screen;
  const start = window.LiminalShell.start;
  window.LiminalShell.start = (options) => (screen = start(options));
  await ctx.resume("set");
  finishWrong(screen);
  const report = screen;
  const saved = saveSet(window, "second");
  const action = actionButton(report, "Practice what I missed");
  action.focus();
  action.click();
  await settled();
  assert.equal(document.querySelector(".page-dialog"), dialog, "the previously closed dialog is reused");
  assert.equal(dialog.open, true);
  assert.equal(dialog.hasAttribute("inert"), false);
  const cancel = dialog.querySelector("button");
  assert.equal(document.activeElement, cancel);
  const confirm = dialog.querySelector(".danger");
  confirm.focus();
  assert.equal(document.activeElement, confirm);
  for (const key of ["Tab", "Escape"]) {
    assert.ok(!document.dispatch("keydown", { key, target: confirm }).defaultPrevented);
  }
  assert.equal(report.element.isConnected, true);
  assert.equal(action.disabled, true);
  assert.equal(document.querySelector(".site-header").hasAttribute("inert"), true);
  cancel.click();
  await settled();
  assert.equal(report.element.isConnected, true);
  assert.equal(action.disabled, false);
  assert.equal(document.activeElement, action, "focus returns after the action is enabled");
  assert.equal(window.localStorage.getItem("liminal:session:v1"), saved);
  assert.equal(report.element.querySelector(".lm-next-steps [role=\"alert\"]").hidden, true);
  action.click();
  await settled();
  dialog.querySelector(".danger").click();
  await settled();
  assert.equal(report.element.isConnected, false);
  assert.equal(screen.element.dataset.view, "question");
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  assert.equal(document.querySelector(".site-header").hasAttribute("inert"), true);
  screen.close();
  assert.equal(dialog.hasAttribute("inert"), false);
  assert.equal(alreadyInert.hasAttribute("inert"), true);
  assert.equal(document.querySelector(".site-header").hasAttribute("inert"), false);
  assert.equal(document.documentElement.style.overflow, "scroll");
  assert.equal(document.listeners.get("keydown").length, 0);
});

test("an external page modal owns Escape, Tab and answer keys without releasing existing inert state", () => {
  const { document, window } = shellFixture();
  const dialog = document.createElement("dialog");
  const button = document.createElement("button");
  dialog.append(button);
  const alreadyInert = document.createElement("dialog");
  alreadyInert.setAttribute("inert", "");
  document.body.append(dialog, alreadyInert);
  const screen = window.LiminalShell.start({ questions: [mc], openDirections: true });
  const directions = screen.element.querySelector(".lm-directions");
  const answer = screen.element.querySelectorAll(".lm-choice")[1];
  dialog.showModal();
  button.focus();
  for (const key of ["Escape", "Tab", "2"]) {
    assert.ok(!document.dispatch("keydown", { key, target: button }).defaultPrevented, key);
  }
  assert.equal(directions.hidden, false);
  assert.equal(answer.getAttribute("aria-pressed"), "false");
  dialog.close();
  assert.equal(document.dispatch("keydown", { key: "Escape", target: screen.element }).defaultPrevented, true);
  assert.equal(directions.hidden, true);
  assert.equal(document.dispatch("keydown", { key: "2", target: screen.element }).defaultPrevented, true);
  assert.equal(answer.getAttribute("aria-pressed"), "true");
  screen.close();
  assert.equal(dialog.hasAttribute("inert"), false);
  assert.equal(alreadyInert.hasAttribute("inert"), true);
});

test("module submission, break continuation and the next module release each previous shell", () => {
  const env = shellFixture();
  const { document, window } = env;
  const runHandoff = () => {
    const pending = [...env.timeouts.entries()];
    env.timeouts.clear();
    pending.forEach(([, fn]) => fn());
  };
  const first = window.LiminalShell.start({ questions: [mc], feedback: "end" });
  finishWrong(first);
  let breakScreen;
  let next;
  const module = window.LiminalShell.start({ questions: [mc], feedback: "end", module: { next: "the break" },
    onContinue: () => {
      breakScreen = window.LiminalShell.startBreak({ endsAt: Date.now() + 60000,
        onContinue: () => { next = window.LiminalShell.start({ questions: [mc], module: { next: "results" } }); },
      });
    },
  });
  assert.equal(first.element.isConnected, false);
  module.element.querySelector(".lm-choice").click();
  module.element.querySelector(".lm-next").click();
  module.element.querySelector(".lm-next").click();
  module.element.querySelector(".lm-dialog .lm-btn-primary").click();
  assert.equal(module.element.isConnected, false);
  runHandoff();
  assert.equal(breakScreen.element.isConnected, true);
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  breakScreen.element.querySelector(".lm-break-resume").click();
  runHandoff();
  assert.equal(breakScreen.element.isConnected, false);
  assert.equal(next.element.isConnected, true);
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  next.close();
  assert.equal(env.intervals.size, 0);
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
  assert.equal(document.documentElement.style.overflow, undefined);
});

test("an expired resumed module hands off once and leaves no shell or page locks", () => {
  const env = shellFixture();
  const { document, window } = env;
  const session = window.LiminalTestEngine.create({ questions: [mc], timeLimitSeconds: 1, now: () => 0 });
  session.useWallClock();
  const saved = session.serialize();
  let delivered = 0;
  let continued = 0;
  window.LiminalShell.start({ resume: saved, now: () => 2000, module: { next: "results" },
    onFinish: () => { delivered += 1; }, onContinue: () => { continued += 1; },
  });
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
  assert.equal(document.documentElement.style.overflow, undefined);
  assert.equal(document.listeners.get("keydown").length, 0);
  assert.equal(env.intervals.size, 0);
  assert.equal(delivered, 1);
  assert.equal(continued, 0);
  const pending = [...env.timeouts.values()];
  env.timeouts.clear();
  pending.forEach((fn) => fn());
  assert.equal(continued, 1);
  const next = window.LiminalShell.start({ questions: [mc] });
  next.close();
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
});

for (const prefix of ["Practice what I missed", "Next step:"]) test(`${prefix} keeps a cold SAT report through a bundle load failure and retry`, async () => {
  const env = appFixture();
  const { document, window, ctx } = env;
  const question = { ...mc, id: "sat-math:linear-equations:seed", templateId: "linear-equations", templateVersion: 1,
    skill: "Linear equations in one variable", difficulty: "Easy" };
  window.PRACTICE_TEMPLATES = { "sat-math": { templates: [{ id: question.templateId, bit: 0, version: 1,
    domain: question.domain, skill: question.skill, difficulty: question.difficulty }] } };
  let screen;
  const start = window.LiminalShell.start;
  window.LiminalShell.start = (options) => (screen = start(options));
  ctx.launch({ title: "Cold SAT snapshot", sectionKey: "sat-math", kind: "practice", questions: [question], feedback: "end" });
  finishWrong(screen);
  const report = screen;
  actionButton(report, prefix).click();
  await settled();
  const failed = document.head.querySelector("script");
  assert.equal(failed.src, "lib/families/sat-math.js");
  assert.equal(report.element.isConnected, true);
  failed.onerror();
  await settled();
  assert.equal(report.element.isConnected, true);
  assert.match(report.element.textContent, /Could not load sat-math.js.*Try again/);
  actionButton(report, prefix).click();
  await settled();
  const scripts = document.head.querySelectorAll("script");
  assert.equal(scripts.length, 2, "the failed request is retried");
  window.LiminalFamilies = { "sat-math": [{ id: question.templateId, domain: question.domain,
    skill: question.skill, difficulty: question.difficulty }] };
  window.LiminalFamilyShared = { instantiate: (_, seed) => ({ ...question, id: `sat-math:linear-equations:${seed}` }) };
  scripts[1].onload();
  await settled();
  assert.equal(report.element.isConnected, false);
  assert.equal(screen.element.isConnected, true);
  assert.equal(screen.element.dataset.view, "question");
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  assert.ok(window.localStorage.getItem("liminal:session:v1"));
  screen.close();
});

for (const prefix of ["Practice what I missed", "Next step:"]) for (const outcome of ["cancel", "confirm", "render failure"])
test(`${prefix} awaits a late saved-set conflict through ${outcome}`, async () => {
  const { document, window, ctx } = appFixture();
  const question = { ...mc, id: "sat-math:linear-equations:seed", templateId: "linear-equations", templateVersion: 1,
    skill: "Linear equations in one variable", difficulty: "Easy" };
  window.PRACTICE_TEMPLATES = { "sat-math": { templates: [{ id: question.templateId, bit: 0, version: 1,
    domain: question.domain, skill: question.skill, difficulty: question.difficulty }] } };
  let screen;
  const start = window.LiminalShell.start;
  window.LiminalShell.start = (options) => (screen = start(options));
  ctx.launch({ title: "Cold report", sectionKey: "sat-math", kind: "practice", questions: [question], feedback: "end" });
  finishWrong(screen);
  const report = screen;
  const action = actionButton(report, prefix);
  action.focus();
  action.click();
  await settled();
  const script = document.head.querySelector("script");
  const saved = saveSet(window, "other-tab");
  window.LiminalFamilies = { "sat-math": [{ id: question.templateId, domain: question.domain,
    skill: question.skill, difficulty: question.difficulty }] };
  window.LiminalFamilyShared = { instantiate: (_, seed) => ({ ...question, id: `sat-math:linear-equations:${seed}` }) };
  script.onload();
  await settled();
  const dialog = document.querySelector(".page-dialog");
  assert.equal(dialog.open, true);
  assert.equal(report.element.isConnected, true, "the launch has not succeeded while confirmation is pending");
  assert.equal(action.disabled, true);
  const renderText = window.LiminalRender.renderText;
  if (outcome === "cancel") {
    dialog.querySelector("button").click();
    await settled();
    assert.equal(report.element.isConnected, true);
    assert.equal(action.disabled, false);
    assert.equal(document.activeElement, action);
    assert.equal(window.localStorage.getItem("liminal:session:v1"), saved);
    action.click();
    await settled();
  }
  if (outcome !== "confirm") window.LiminalRender.renderText = () => { throw Error("Late replacement render failed"); };
  dialog.querySelector(".danger").click();
  await settled();
  if (outcome !== "confirm") {
    assert.equal(report.element.isConnected, true);
    assert.equal(action.disabled, false);
    assert.match(report.element.querySelector(".lm-next-steps [role=\"alert\"]").textContent, /Late replacement render failed.*Try again/);
    assert.equal(document.querySelectorAll(".lm-shell").length, 1);
    assert.equal(document.querySelector(".site-header").hasAttribute("inert"), true);
    window.LiminalRender.renderText = renderText;
    action.click();
    await settled();
  }
  assert.equal(report.element.isConnected, false);
  assert.equal(screen.element.dataset.view, "question");
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  assert.equal(screen.element.hasAttribute("inert"), false);
  screen.close();
  assert.equal(document.querySelector(".site-header").hasAttribute("inert"), false);
  assert.equal(document.listeners.get("keydown").length, 0);
});

for (const prefix of ["Practice what I missed", "Next step:"])
for (const timing of ["initial", "late"])
for (const failure of ["archived Science", "render failure"])
test(`${prefix} reports ${timing} saved-set Resume failure for ${failure} and permits retry`, async () => {
  const { document, window, ctx, sessionProblems } = appFixture();
  const question = { ...mc, id: "sat-math:linear-equations:seed", templateId: "linear-equations", templateVersion: 1,
    skill: "Linear equations in one variable", difficulty: "Easy" };
  const template = { id: question.templateId, bit: 0, version: 1,
    domain: question.domain, skill: question.skill, difficulty: question.difficulty };
  window.PRACTICE_TEMPLATES = { "sat-math": { templates: [template] } };
  const loadTemplates = () => {
    window.LiminalFamilies = { "sat-math": [template] };
    window.LiminalFamilyShared = { instantiate: (_, seed) => ({ ...question, id: `sat-math:linear-equations:${seed}` }) };
  };
  if (timing === "initial") {
    const loading = ctx.sectionTemplates("sat-math");
    loadTemplates();
    document.head.querySelector("script").onload();
    await loading;
  }
  let screen;
  const start = window.LiminalShell.start;
  window.LiminalShell.start = (options) => (screen = start(options));
  ctx.launch({ title: "Retained report", sectionKey: "sat-math", kind: "practice", questions: [question], feedback: "end" });
  finishWrong(screen);
  const report = screen;
  const action = actionButton(report, prefix);
  action.focus();
  if (timing === "late") {
    action.click();
    await settled();
  }
  const archived = { ...mc, id: "act-science-0001", sectionKey: "act-science", test: "ACT", section: "Science" };
  const saved = saveSet(window, "other-tab", [failure === "archived Science" ? archived : mc]);
  if (timing === "initial") action.click();
  else {
    loadTemplates();
    document.head.querySelector("script").onload();
  }
  await settled();
  const dialog = document.querySelector(".page-dialog");
  assert.equal(dialog.open, true);
  const renderText = window.LiminalRender.renderText;
  if (failure === "render failure") window.LiminalRender.renderText = () => { throw Error("Saved set rendering failed"); };
  dialog.querySelectorAll("button").find((button) => button.textContent === "Resume it").click();
  await settled();
  const error = report.element.querySelector(".lm-next-steps [role=\"alert\"]");
  assert.equal(report.element.isConnected, true);
  assert.equal(error.hidden, false);
  assert.match(error.textContent, failure === "archived Science" ? /archived bank.*saved set is still kept/ : /Saved set rendering failed.*set is still saved/);
  assert.match(error.textContent, /Try again from this report/);
  assert.equal(window.localStorage.getItem("liminal:session:v1"), saved);
  assert.equal(action.disabled, false);
  assert.equal(document.activeElement, action);
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  assert.equal(document.querySelector(".site-header").hasAttribute("inert"), true);
  assert.deepEqual(sessionProblems, [], "the retained report owns the error feedback");
  window.LiminalRender.renderText = renderText;
  action.click();
  await settled();
  assert.equal(error.hidden, true, "retry clears the previous error");
  dialog.querySelector("button").click();
  await settled();
  assert.equal(report.element.isConnected, true, "Keep it still cancels without an error");
  assert.equal(error.hidden, true);
  assert.equal(window.localStorage.getItem("liminal:session:v1"), saved);
  action.click();
  await settled();
  const retryChoice = failure === "archived Science" ? "End it and start" : "Resume it";
  dialog.querySelectorAll("button").find((button) => button.textContent === retryChoice).click();
  await settled();
  assert.equal(report.element.isConnected, false);
  assert.equal(screen.element.dataset.view, "question");
  assert.equal(document.querySelectorAll(".lm-shell").length, 1);
  const resumed = JSON.parse(window.localStorage.getItem("liminal:session:v1"));
  assert.equal(resumed.config.sessionId === "other-tab", failure === "render failure");
  screen.close();
  assert.equal(document.querySelector(".site-header").hasAttribute("inert"), false);
  assert.equal(document.listeners.get("keydown").length, 0);
});

for (const caller of ["confirmReplace", "launch"])
for (const failure of ["archived Science", "render failure"])
test(`page ${caller} keeps its notification contract for saved-set Resume ${failure}`, async () => {
  const { document, window, ctx, sessionProblems } = appFixture();
  const archived = { ...mc, id: "act-science-0001", sectionKey: "act-science", test: "ACT", section: "Science" };
  const saved = saveSet(window, "saved-on-page", [failure === "archived Science" ? archived : mc]);
  const pending = caller === "confirmReplace" ? ctx.confirmReplace("set")
    : ctx.launch({ title: "New set", sectionKey: "sat-math", questions: [mc] });
  if (failure === "render failure") window.LiminalRender.renderText = () => { throw Error("Page resume rendering failed"); };
  document.querySelectorAll(".page-dialog button").find((button) => button.textContent === "Resume it").click();
  assert.equal(await pending, false, "page callers resolve instead of rejecting outside their launch error handlers");
  assert.ok(sessionProblems.length);
  sessionProblems.forEach((problem) => assert.match(problem,
    failure === "archived Science" ? /archived bank.*saved set is still kept/ : /Page resume rendering failed.*set is still saved/));
  assert.equal(window.localStorage.getItem("liminal:session:v1"), saved);
  assert.equal(document.querySelectorAll(".lm-shell").length, 0);
  assert.equal(document.querySelector(".site-header").hasAttribute("inert"), false);
});

// Exercise the existing view adapters with their real functions and a
// controlled launcher; the shell/app integration tests above own launch().
function viewLaunchFunctions(file, names, ctx) {
  const source = fs.readFileSync(path.join(__dirname, "../src/app/views", file), "utf8");
  const functions = names.map((name) => {
    const match = source.match(new RegExp(`    (?:async )?function ${name}\\([\\s\\S]*?\\n    }`));
    assert.ok(match, `${name} exists in ${file}`);
    return match[0];
  });
  return vm.runInNewContext(`${functions.join("\n")}\n({${names.join(",")}})`, {
    ctx, core: require("../src/lib/core"),
  });
}

test("Practice reports both synchronous and deferred launch failures and returns late cancellation", async () => {
  const status = { textContent: "" };
  let reject;
  const ctx = {
    launch: () => new Promise((_, no) => { reject = no; }),
    setStatus: (node, message) => { node.textContent = message; },
  };
  const { tryLaunch } = viewLaunchFunctions("practice.js", ["tryLaunch"], ctx);
  const pending = tryLaunch({ questions: [mc] }, status);
  reject(Error("Deferred opening failed"));
  assert.equal(await pending, false);
  assert.equal(status.textContent, "Deferred opening failed");
  ctx.launch = () => { throw Error("Immediate opening failed"); };
  assert.equal(await tryLaunch({ questions: [mc] }, status), false);
  assert.equal(status.textContent, "Immediate opening failed");
  ctx.launch = async () => false;
  status.textContent = "";
  assert.equal(await tryLaunch({ questions: [mc] }, status), false);
  assert.equal(status.textContent, "");
});

test("Review keeps its start control busy until deferred launch settles and reports its failure", async () => {
  const status = { textContent: "" };
  const button = { disabled: false };
  let reject;
  const ctx = {
    confirmReplace: async () => true,
    launch: () => new Promise((_, no) => { reject = no; }),
    setStatus: (node, message) => { node.textContent = message; },
  };
  const { startSet } = viewLaunchFunctions("review.js", ["launchSet", "startSet"], ctx);
  const build = async () => ({ title: "Review set", questions: [mc] });
  const pending = startSet(button, status, build);
  await settled();
  assert.equal(button.disabled, true);
  reject(Error("Deferred review opening failed"));
  await pending;
  assert.equal(button.disabled, false);
  assert.equal(status.textContent, "The test screen could not open: Deferred review opening failed");
  ctx.launch = () => { throw Error("Immediate review opening failed"); };
  await startSet(button, status, build);
  assert.equal(button.disabled, false);
  assert.equal(status.textContent, "The test screen could not open: Immediate review opening failed");
  ctx.launch = async () => false;
  await startSet(button, status, build);
  assert.equal(button.disabled, false);
  assert.equal(status.textContent, "");
});
