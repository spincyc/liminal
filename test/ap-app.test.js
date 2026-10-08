"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const A = require("../src/lib/ap-assessment");
const F = require("./fixtures/ap-fixtures");

// Exercise the actual async page controller with controllable network replies.
class Element {
  constructor(tag, text = "", className = "") {
    this.tagName = tag; this.value = text; this.className = className;
    this.children = []; this.events = {}; this.dataset = {}; this.attributes = {};
    this.classList = { toggle() {} };
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; this.value = ""; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.events[name] = callback; }
  focus() {}
  scrollIntoView() {}
  querySelectorAll() { return []; }
  get textContent() { return [this.value, ...this.children.map(n => n.textContent)].join(" "); }
  set textContent(value) { this.value = value; this.children = []; }
}
function page(hash) {
  const elements = Object.fromEntries(["apStatus", "apContent", "apCourses", "apBrowser", "main"].map(id => [id, new Element("div")]));
  const listeners = {}, requests = [];
  const el = (tag, text, className) => new Element(tag, text, className);
  const document = { body: new Element("body"), getElementById: id => elements[id] || null, createTextNode: text => el("text", text), querySelector: () => el("a") };
  const window = {
    LIMINAL_AP_PLAN: F.plan,
    LIMINAL_AP: { assessments: [1, 2].map(n => ({ courseId: "calculus-ab", id: "unit-" + n, file: "unit-" + n })), references: [] },
    LiminalAp: A, LiminalRender: {}, LiminalHighSchool: {},
    LiminalApRender: { el, link: (text, href) => Object.assign(el("a", text), { href }),
      key: packet => el("article", "KEY SECRET " + packet.id), booklet: packet => el("article", "STUDENT " + packet.id) },
    location: { hash }, addEventListener: (event, fn) => { listeners[event] = fn; },
  };
  const fetch = file => new Promise((resolve, reject) => requests.push({ file, resolve: doc => resolve({ ok: true, json: async () => doc }), reject }));
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/app/ap.js"), "utf8"), { window, document, fetch });
  return { elements, requests, document, window, go(next) { window.location.hash = next; return listeners.hashchange(); } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test("a student route removes the previous key before loading and ignores stale requests", async () => {
  const p = page("#calculus-ab/test/unit-1/key");
  p.requests[0].resolve(F.unitTest("calculus-ab", 1));
  await flush();
  assert.match(p.elements.apContent.textContent, /KEY SECRET unit-1/);
  p.go("#calculus-ab/test/unit-2");
  assert.doesNotMatch(p.elements.apContent.textContent, /KEY SECRET/);
  assert.equal(p.elements.apContent.attributes["aria-busy"], "true");
  p.go("#calculus-ab/test/unit-1");
  await flush();
  assert.match(p.elements.apContent.textContent, /STUDENT unit-1/);
  p.requests[1].resolve(F.unitTest("calculus-ab", 2));
  await flush();
  assert.match(p.elements.apContent.textContent, /STUDENT unit-1/);
  assert.doesNotMatch(p.elements.apContent.textContent, /unit-2|KEY SECRET/);
  assert.equal(p.elements.apContent.attributes["aria-busy"], "false");
});

test("copy switches share an in-flight load and only render the current copy", async () => {
  const p = page("#calculus-ab/test/unit-1/key");
  p.go("#calculus-ab/test/unit-1");
  assert.equal(p.requests.length, 1);
  p.requests[0].resolve(F.unitTest("calculus-ab", 1));
  await flush();
  assert.match(p.elements.apContent.textContent, /STUDENT unit-1/);
  assert.doesNotMatch(p.elements.apContent.textContent, /KEY SECRET/);
});

test("failed document requests can be retried and stale failures cannot replace the current copy", async () => {
  const p = page("#calculus-ab/test/unit-1");
  p.requests[0].reject(new Error("offline"));
  await flush();
  assert.match(p.elements.apContent.textContent, /could not be loaded/);
  p.go("#calculus-ab/test/unit-1/key");
  assert.equal(p.requests.length, 2);
  p.requests[1].resolve(F.unitTest("calculus-ab", 1));
  await flush();
  p.go("#calculus-ab/test/unit-2/key");
  p.go("#calculus-ab/test/unit-1");
  await flush();
  p.requests[2].reject(new Error("offline"));
  await flush();
  assert.match(p.elements.apContent.textContent, /STUDENT unit-1/);
  assert.doesNotMatch(p.elements.apContent.textContent, /could not be loaded|KEY SECRET/);
});


test("printing waits for embedded fonts and a failed font load leaves the print action available for retry", async () => {
  const p = page("#calculus-ab/test/unit-1");
  p.requests[0].resolve(F.unitTest("calculus-ab", 1));
  await flush();
  const find = node => node.value === "Print student copy" ? node : node.children.map(find).find(Boolean);
  const button = find(p.elements.apContent);
  let ready;
  const requests = [];
  let printed = 0;
  p.window.print = () => { printed++; };
  p.document.fonts = { load: face => { requests.push(face); return Promise.resolve([{}]); }, ready: new Promise(resolve => { ready = resolve; }) };
  const pending = button.events.click();
  await flush();
  assert.equal(requests.length, 4);
  assert.equal(printed, 0);
  ready(); await pending;
  assert.equal(printed, 1);
  p.document.fonts.load = async () => [];
  await button.events.click();
  assert.equal(printed, 1);
  assert.match(p.elements.apStatus.textContent, /typeface could not load/);
  p.document.fonts.load = async () => [{}];
  await button.events.click();
  assert.equal(printed, 2);
});
