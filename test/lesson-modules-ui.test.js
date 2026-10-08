"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const N = require("../src/lib/navigation");

// Exercise the real asynchronous page controller; layout, native controls and
// generated packet output are checked separately in browser/engine reviews.
function fixture({ hash = "#common-core-math/8/2-1", entries, waitFor, waitForFonts } = {}) {
  class Element {
    constructor(tag = "div") {
      Object.assign(this, { tagName: tag, children: [], dataset: {}, attributes: {}, events: {}, hidden: false, disabled: false, textContent: "", _value: "" });
      const names = new Set();
      this.classList = { add: name => names.add(name), remove: name => names.delete(name), toggle: (name, force) => force ? names.add(name) : names.delete(name), contains: name => names.has(name) };
    }
    appendChild(node) { this.children.push(node); node.parent = this; return node; }
    append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
    replaceChildren(...nodes) { this.children = []; this._value = ""; this.append(...nodes); }
    get value() { return this._value || (this.tagName === "select" && this.children[0] ? this.children[0].value : ""); }
    set value(value) { this._value = String(value); }
    get options() { return this.children; }
    get selectedIndex() { return this.children.findIndex(node => node.value === this.value); }
    set selectedIndex(index) { this.value = this.children[index].value; }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name] || null; }
    removeAttribute(name) { delete this.attributes[name]; }
    addEventListener(name, callback) { this.events[name] = callback; }
    focus() { document.activeElement = this; }
    scrollIntoView() {}
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); }
    querySelectorAll(selector) {
      const descendants = this.children.flatMap(node => [node, ...node.querySelectorAll(selector)]);
      return descendants.filter(node => selector === "[data-lesson-id]" ? node.dataset.lessonId : selector === "[data-unit-id]" ? node.dataset.unitId : selector === "button" ? node.tagName === "button" : false);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    reportValidity() { return true; }
  }
  const nodes = {};
  const html = fs.readFileSync(path.join(__dirname, "../src/lessons.html"), "utf8");
  for (const [, tag, id] of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"/g)) nodes[id] = new Element(tag);
  nodes.courseCount.value = "8"; nodes.courseDays.value = "1"; nodes.coursePracticeMode.value = "rebuild";
  const document = {
    getElementById: id => nodes[id], createElement: tag => new Element(tag),
    querySelectorAll: selector => selector === "[data-course-export]" ? [] : Object.values(nodes).flatMap(node => node.querySelectorAll(selector)),
    scripts: [], body: new Element("body"), head: new Element("head"), baseURI: "https://example.org/liminal/", activeElement: null,
  };
  const modules = entries || [8, 7].map(grade => ({ id: "math-" + grade, trackId: "common-core-math", grade, title: "Grade " + grade, file: "grade-" + grade + ".json", generatorScripts: [], scopeNote: "Two supplemental topics." }));
  const courses = new Map(modules.map(entry => [entry.file, { ...entry, units: [{ id: "topic-a", title: "Topic A", lessons: [{ id: "1-1", title: "First lesson" }, { id: "2-1", title: "Second lesson" }] }] }]));
  const listeners = {}, fetches = [], rendered = [], historyCalls = [], projections = [];
  class Worker {
    postMessage() { queueMicrotask(() => this.onmessage({ data: { nights: [{ worksheets: [] }] } })); }
    terminate() {}
  }
  const location = { hash, search: "" };
  const window = { location, LIMINAL_LESSON_MODULES: { modules }, LiminalNavigation: N, LiminalCourses: { selectPacketWorksheets(nights) { projections.push(nights); return []; } }, LiminalRender: {},
    LiminalReaderControls: { navigation: () => new Element("nav") },
    LiminalCourseRender: { preparePrint: () => waitForFonts ? waitForFonts() : Promise.resolve(), renderText: () => new Element("p"), renderGuide(course, ids) { rendered.push({ id: course.id, ids }); return new Element("article"); } },
    history: { replaceState(_, __, next) { historyCalls.push(["replace", next]); location.hash = next; }, pushState(_, __, next) { historyCalls.push(["push", next]); location.hash = next; } },
    matchMedia: () => ({ matches: true }), addEventListener(name, callback) { listeners[name] = callback; },
  };
  const context = { window, document, URLSearchParams, URL, Blob, Worker, console, setTimeout, clearTimeout, ...window,
    fetch: async file => {
      fetches.push(file);
      if (file.startsWith("styles/")) return { ok: true, text: async () => "" };
      if (waitFor) await waitFor(file);
      return { ok: courses.has(file), json: async () => courses.get(file) };
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/app/lessons.js"), "utf8"), context);
  const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); };
  return { nodes, location, listeners, fetches, rendered, flush, document, window, modules, historyCalls, projections };
}

test("the selected module loads alone, then another grade follows the index without UI code changes", async () => {
  const page = fixture(); await page.flush();
  assert.equal(page.nodes.courseApp.hidden, false);
  assert.equal(page.nodes.coursePageTitle.textContent, "Grade 8");
  assert.equal(page.nodes.courseReadLesson.value, "2-1");
  assert.deepEqual(page.fetches.filter(file => file.endsWith(".json")), ["grade-8.json"]);
  page.nodes.courseGrade.focus();
  page.nodes.courseGrade.value = "7"; page.nodes.courseGrade.events.change();
  page.listeners.hashchange(); await page.flush();
  assert.equal(page.location.hash, "#common-core-math/7");
  assert.equal(page.nodes.coursePageTitle.textContent, "Grade 7");
  assert.equal(page.document.activeElement, page.nodes.courseGrade);
  assert.equal(page.rendered.at(-1).id, "math-7");
  assert.deepEqual(page.nodes.courseContextLinks.children.map(node => node.href), ["curriculum.html#common-core-math/7", "weeks.html#common-core-math/7/1", "curriculum.html#grade/7"]);
  page.location.hash = "#common-core-math/8/2-1"; page.listeners.popstate(); await page.flush();
  assert.equal(page.nodes.courseReadLesson.value, "2-1");
  assert.equal(page.fetches.filter(file => file === "grade-8.json").length, 1, "Back uses the loaded module");
});

test("an explicit unauthored grade explains the absence and retains its parent destinations", async () => {
  const page = fixture({ hash: "#common-core-math/6" }); await page.flush();
  assert.equal(page.nodes.courseApp.hidden, true);
  assert.match(page.nodes.courseLoadStatus.textContent, /have not been published/);
  assert.deepEqual(page.fetches.filter(file => file.endsWith(".json")), []);
  assert.equal(page.nodes.coursePageTitle.textContent, "Grade 6");
  assert.deepEqual(page.nodes.courseContextLinks.children.slice(0, 2).map(node => node.href), ["curriculum.html#common-core-math/6", "weeks.html#common-core-math/6/1"]);
});

test("a slower previous module request cannot replace the newly selected grade", async () => {
  let release;
  const delay = new Promise(resolve => { release = resolve; });
  const page = fixture({ waitFor: file => file === "grade-8.json" ? delay : Promise.resolve() });
  page.location.hash = "#common-core-math/7/2-1"; page.listeners.hashchange(); await page.flush();
  assert.equal(page.rendered.at(-1).id, "math-7");
  release(); await page.flush();
  assert.equal(page.rendered.at(-1).id, "math-7");
  assert.equal(page.nodes.coursePageTitle.textContent, "Grade 7");
  assert.equal(page.nodes.courseApp.inert, false);
});

test("an unknown lesson is announced without switching pathway or grade", async () => {
  const page = fixture({ hash: "#common-core-math/7/unknown" }); await page.flush();
  assert.match(page.nodes.courseLoadStatus.textContent, /lesson was not found/);
  assert.equal(page.nodes.coursePageTitle.textContent, "Grade 7");
  assert.equal(page.nodes.courseReadLesson.value, "1-1");
  assert.equal(page.nodes.courseLoadStatus.classList.contains("sr-only"), false);
});


test("Back to a grade’s base route returns to the first lesson after reading another selection", async () => {
  const page = fixture({ hash: "#common-core-math/8" }); await page.flush();
  assert.equal(page.nodes.courseReadLesson.value, "1-1");
  page.nodes.courseSelectAll.events.click();
  page.nodes.courseReadLesson.value = "2-1"; page.nodes.courseReadLesson.events.change();
  assert.equal(page.location.hash, "#common-core-math/8/2-1");
  const priorWrites = page.historyCalls.length;
  page.location.hash = "#common-core-math/8"; page.listeners.popstate(); await page.flush();
  assert.equal(page.nodes.courseReadLesson.value, "1-1");
  assert.equal(page.historyCalls.length, priorWrites, "Back must preserve the browser's Forward entry");
  page.location.hash = "#common-core-math/8/2-1"; page.listeners.popstate(); await page.flush();
  assert.equal(page.nodes.courseReadLesson.value, "2-1");
  assert.equal(page.historyCalls.length, priorWrites, "Forward must not add another entry");
  assert.equal(page.nodes.courseReadLesson.options.length, 2, "the explicit multi-lesson selection remains intact");
});


test("cancelling or changing grades while fonts load cannot install a completed worker's stale packet", async () => {
  for (const action of ["cancel", "route", "settings"]) {
    let release;
    const fonts = new Promise(resolve => { release = resolve; });
    const page = fixture({ waitForFonts: () => fonts });
    await page.flush();
    page.nodes.courseForm.events.submit({ preventDefault() {} });
    await page.flush(); // The worker completes while font measurement is still pending.
    assert.equal(page.projections.length, 0);
    if (action === "cancel") page.nodes.courseCancel.events.click();
    else if (action === "settings") page.nodes.courseCount.events.input();
    else { page.location.hash = "#common-core-math/7"; page.listeners.hashchange(); await page.flush(); }
    release(); await page.flush();
    assert.equal(page.projections.length, 0, action + " invalidates the entire build, including its font wait");
    assert.equal(page.nodes.coursePacketSection.hidden, true);
    assert.equal(page.nodes.courseBuild.disabled, false);
    assert.equal(page.nodes.courseCancel.hidden, true);
  }
});

test("a font load failure cancels pending practice and leaves the builder ready to retry", async () => {
  const page = fixture({ waitForFonts: () => Promise.reject(new Error("Print fonts did not load.")) });
  await page.flush();
  page.nodes.courseForm.events.submit({ preventDefault() {} });
  await page.flush();
  assert.equal(page.projections.length, 0);
  assert.match(page.nodes.courseError.textContent, /Print fonts did not load/);
  assert.equal(page.nodes.courseBuild.disabled, false);
  assert.equal(page.nodes.courseCancel.hidden, true);
  assert.equal(page.nodes.coursePacketSection.hidden, true);
});
