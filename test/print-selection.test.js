"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const Core = require("../src/lib/core");
const Runs = require("../src/lib/runs");
const Modules = require("../src/lib/modules");
const Progress = require("../src/lib/progress");
const S = require("../src/lib/families/shared");
const families = require("../src/lib/families/sat/reading-writing");
const registry = require("../content/templates/sat-reading-writing.json");

// Exercise the actual browser controller with a small DOM/storage adapter.
// Opening a key or copying a link must not add another history serve.
function browser(saved) {
  const elements = new Map();
  function element(tag) {
    return {
      tag, children: [], listeners: {}, value: "", hidden: false, checked: false,
      classList: { toggle() {} },
      append(...nodes) { this.children.push(...nodes); },
      appendChild(node) { this.children.push(node); },
      querySelector(name) { return this.children.find((node) => node.tag === name); },
      querySelectorAll() { return this.children; },
      addEventListener(name, action) { this.listeners[name] = action; },
      remove() {}, select() {}, focus() {}, click() {},
      set innerHTML(value) { this.children = []; },
    };
  }
  const storage = {
    getItem: (key) => saved.get(key) || null,
    setItem: (key, value) => saved.set(key, value), removeItem: (key) => saved.delete(key),
  };
  let seed = 0;
  const opened = [];
  const document = {
    getElementById(id) {
      if (!elements.has(id)) {
        const node = element(id);
        if (id === "moduleSection") node.value = "sat-reading-writing";
        if (id === "moduleKind") node.value = "1";
        elements.set(id, node);
      }
      return elements.get(id);
    },
    createElement: element,
    body: element("body"),
    head: { appendChild(script) { script.onload(); } },
  };
  const render = { splitStemPassage: (stem) => ({ question: stem }),
    renderText: (text) => ({ outerHTML: String(text) }),
    renderStimulus: (stimulus) => ({ outerHTML: stimulus.content }),
    renderFigure: () => ({ outerHTML: "<svg></svg>" }),
  };
  const window = {
    PracticeCore: Core, LiminalRuns: Runs, LiminalModules: Modules, LiminalProgress: Progress,
    PracticeBooklet: {
      buildModel: (groups, blueprint, seedValue, options) => ({ groups, blueprint, formCode: options.code, code: options.code }),
      renderKeyHtml: (model) => JSON.stringify(model), renderBookletHtml: (model) => JSON.stringify(model),
    },
    LiminalRender: render,
    LiminalSite: { getTest: () => "SAT", setTest() {}, onTestChange() {} },
    PRACTICE_CATALOG: { sections: [] },
    PRACTICE_TEMPLATES: { "sat-reading-writing": registry },
    LiminalFamilies: { "sat-reading-writing": families }, LiminalFamilyShared: S,
    localStorage: storage,
    location: { href: "https://example.test/print.html?form=sat-reading-writing&seed=first", search: "?form=sat-reading-writing&seed=first" },
    history: { replaceState() {} },
    crypto: { getRandomValues(values) { values.fill(++seed); } },
    open() {
      const page = { document: { open() {}, close() {}, write(text) { this.html = text; } }, close() {} };
      opened.push(page);
      return page;
    },
    setTimeout() {},
  };
  const context = vm.createContext({ window, document, URL, URLSearchParams, Uint32Array, Blob,
    navigator: { clipboard: { async writeText() {} } }, console });
  vm.runInContext(fs.readFileSync(require.resolve("../src/app/print.js"), "utf8"), context);
  return {
    elements, opened, storage,
    click: (id) => elements.get(id).listeners.click(),
    progress: () => Progress.load(storage).progress,
  };
}

test("opening a key first records its exposed material once, including a later booklet open", async () => {
  const key = "sat-reading-writing";
  const app = browser(new Map());
  await app.click("openKeyBtn");
  const answerKey = JSON.parse(app.opened.at(-1).document.html);
  const identities = answerKey.groups.flatMap((group) => group.questions.map(Runs.visibleIdentity));
  assert.equal(identities.length, 54);
  const history = Progress.historyFor(app.progress(), key);
  assert.equal(history.serve, 2, "the key exposes explanations for both modules");
  assert.ok(identities.every((identity) => history.recentItems.includes(identity)));
  await app.click("openTestBtn");
  const booklet = JSON.parse(app.opened.at(-1).document.html);
  assert.equal(booklet.code, answerKey.code);
  assert.equal(Progress.historyFor(app.progress(), key).serve, 2,
    "opening the same pinned form does not serve its templates again");
});

test("print shares practice exposure, pins exact forms, and records each opened booklet once", async () => {
  const key = "sat-reading-writing";
  const saved = new Map();
  const app = browser(saved);
  assert.equal(Progress.historyFor(app.progress(), key).serve, 0, "loading the page is not exposure");
  await app.click("openTestBtn");
  const first = JSON.parse(app.opened.at(-1).document.html);
  const firstCode = first.code;
  const firstIds = first.groups.flatMap((group) => group.questions.map(Runs.visibleIdentity));
  assert.equal(firstIds.length, 54);
  let history = Progress.historyFor(app.progress(), key);
  assert.equal(history.serve, 2);
  assert.ok(firstIds.every((identity) => history.recentItems.includes(identity)));
  await app.click("openKeyBtn");
  await app.click("copyLinkBtn");
  assert.equal(Progress.historyFor(app.progress(), key).serve, 2);
  assert.equal(JSON.parse(app.opened.at(-1).document.html).code, firstCode);
  app.click("rerollBtn");
  assert.equal(Progress.historyFor(app.progress(), key).serve, 2, "preparing a new seed is not exposure");
  await app.click("openTestBtn");
  const second = JSON.parse(app.opened.at(-1).document.html);
  assert.notEqual(second.code, firstCode);
  assert.ok(second.groups.flatMap((group) => group.questions.map(Runs.visibleIdentity))
    .every((identity) => !firstIds.includes(identity)));
  assert.equal(Progress.historyFor(app.progress(), key).serve, 4);
  app.elements.get("codeInput").value = firstCode;
  app.elements.get("rebuildBtn").listeners.click();
  // Rebuild's event handler launches the asynchronous open without returning it.
  await new Promise((resolve) => setImmediate(resolve));
  const rebuilt = JSON.parse(app.opened.at(-1).document.html);
  assert.deepEqual(rebuilt.groups, first.groups);
  assert.equal(Progress.historyFor(app.progress(), key).serve, 4);

  // A different page reads the same store, so on-screen practice exposures
  // influence printing after navigation or a second tab.
  const external = Progress.createStore(app.storage);
  external.update((progress) => Progress.serveTemplates(progress, key, {
    templateIds: ["external"], scenes: { external: "outside-topic" }, itemIdentities: firstIds,
  }));
  const other = browser(saved);
  await other.click("openTestBtn");
  const fresh = JSON.parse(other.opened.at(-1).document.html);
  assert.ok(fresh.groups.flatMap((group) => group.questions.map(Runs.visibleIdentity))
    .every((identity) => !firstIds.includes(identity)));
});
