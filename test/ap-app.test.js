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
function page(hash, data) {
  const elements = Object.fromEntries(["apStatus", "apContent", "apCourses", "apBrowser", "main"].map(id => [id, new Element("div")]));
  const listeners = {}, requests = [], guides = [];
  const el = (tag, text, className) => new Element(tag, text, className);
  const document = { body: new Element("body"), getElementById: id => elements[id] || null, createTextNode: text => el("text", text), querySelector: () => el("a") };
  const window = {
    LIMINAL_AP_PLAN: F.plan,
    LIMINAL_AP: data || { assessments: [1, 2].map(n => ({ courseId: "calculus-ab", id: "unit-" + n, file: "unit-" + n })), references: [] },
    LiminalAp: A, LiminalRender: {}, LiminalHighSchool: {},
    LiminalApRender: { el, link: (text, href) => Object.assign(el("a", text), { href }),
      key: packet => el("article", "KEY SECRET " + packet.id), booklet: packet => el("article", "STUDENT " + packet.id),
      guide: (doc, options) => { guides.push(options); return el("article", "GUIDE " + doc.id); } },
    location: { hash }, addEventListener: (event, fn) => { listeners[event] = fn; },
  };
  const fetch = file => new Promise((resolve, reject) => requests.push({ file, resolve: doc => resolve({ ok: true, json: async () => doc }), reject }));
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/app/ap.js"), "utf8"), { window, document, fetch });
  return { elements, requests, guides, document, window, go(next) { window.location.hash = next; return listeners.hashchange(); } };
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

// The BC exam-prep routes, with an index naming only some guides and sets.
function prepPage(hash) {
  return page(hash, {
    assessments: [{ courseId: "calculus-bc", id: "practice-exam-b", kind: "practice-exam", title: "Form B", mc: 42, fr: 6, minutes: 190, file: "peb" },
      { courseId: "calculus-bc", id: "fr-polar", kind: "fr-set", title: "Polar set", mc: 0, fr: 3, minutes: 45, file: "frp" }],
    guides: ["review-u1", "fr-polar"].map(id => ({ courseId: "calculus-bc", id, kind: A.guideKind(F.plan.courses.find(c => c.id === "calculus-bc"), id), title: "Guide " + id, summary: "S", minutes: 30, checks: 4, file: "g-" + id })),
    references: [],
  });
}
const find = (node, test) => test(node) ? node : node.children.map(child => find(child, test)).find(Boolean);

test("a guide loaded late cannot replace the current guide, and its links resolve only to built pages", async () => {
  const p = prepPage("#calculus-bc/guide/review-u1");
  p.go("#calculus-bc/guide/fr-polar");
  assert.deepEqual(p.requests.map(r => r.file), ["g-review-u1", "g-fr-polar"]);
  p.requests[1].resolve(F.guide("fr-polar"));
  await flush();
  assert.match(p.elements.apContent.textContent, /GUIDE fr-polar/);
  p.requests[0].resolve(F.guide("review-u1"));
  await flush();
  assert.match(p.elements.apContent.textContent, /GUIDE fr-polar/);
  assert.doesNotMatch(p.elements.apContent.textContent, /GUIDE review-u1/);
  assert.match(p.document.title, /Course for AP® Calculus BC · Guide fr-polar — Liminal/);
  const { href } = p.guides.at(-1);
  assert.equal(href("test:fr-polar"), "#calculus-bc/test/fr-polar");
  assert.equal(href("key:practice-exam-b"), "#calculus-bc/test/practice-exam-b/key");
  assert.equal(href("test:unit-1"), "", "an assessment missing from the build is not linked");
  assert.equal(href("guide:memory-sheet"), "", "a guide missing from the build is not linked");
  assert.equal(href("guide:review-u1"), "#calculus-bc/guide/review-u1");
  assert.equal(href("unit:u2"), "#calculus-bc/u2");
  assert.equal(href("week:3"), "", "weekly links need the weekly index");
});

test("prep and prep assessments are titled by the plan and link back to exam preparation", async () => {
  const p = prepPage("#calculus-bc/prep");
  await flush();
  assert.equal(p.document.title, "Course for AP® Calculus BC · Exam preparation — Liminal");
  assert.match(p.elements.apContent.textContent, /Practice exam B/);
  assert.match(p.elements.apContent.textContent, /takes 3 hours 10 minutes/, "timing comes from the exam block");
  assert.match(p.elements.apContent.textContent, /15 questions from across the course/, "mixed-set text comes from the blueprint");
  p.go("#calculus-bc/test/practice-exam-b/key");
  p.requests[0].resolve(F.practiceExam("calculus-ab"));
  await flush();
  assert.equal(p.document.title, "Course for AP® Calculus BC · Practice exam B · Answer key — Liminal");
  assert.ok(find(p.elements.apContent, node => node.value === "← Exam preparation" && node.href === "#calculus-bc/prep"));
  p.go("#calculus-bc/test/mixed-4");
  await flush();
  assert.match(p.elements.apContent.textContent, /Mixed set 4/);
  assert.match(p.elements.apContent.textContent, /being prepared/);
});

test("a physics prep page takes its calculator and pacing words from the physics blueprints", async () => {
  const p = page("#physics-1/prep", { assessments: [], guides: [], references: [] });
  await flush();
  const text = p.elements.apContent.textContent;
  assert.equal(p.document.title, "Course for AP® Physics 1 · Exam preparation — Liminal");
  assert.match(text, /takes 3 hours\. Take it in one sitting, or Section I and Section II on separate days, with a calculator throughout/);
  assert.match(text, /15 questions from across the course at the exam's pace: 15 with a calculator in 30 minutes/);
  assert.match(text, /28 minutes a Translation Between Representations question/);
  assert.doesNotMatch(text, /with a graphing calculator|calculator only in the parts/);
  assert.match(text, /Experimental Design and Analysis set, questions 1 and 2/);
});
