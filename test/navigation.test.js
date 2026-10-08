"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function loadSite(search, storedTest = "ACT") {
  const storage = new Map([["liminal:test:v1", JSON.stringify(storedTest)], ["liminal:progress:v3", "unchanged progress"], ["liminal:session:v1", "unfinished set"]]);
  const document = { documentElement: { dataset: {} }, querySelectorAll: () => [] };
  const window = { location: { search }, addEventListener() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/app/site.js"), "utf8"), {
    document, window, URLSearchParams,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  });
  return { window, storage, document };
}

test("module links choose SAT or ACT without modifying saved work", () => {
  for (const choice of ["SAT", "ACT"]) {
    const { window, storage, document } = loadSite("?test=" + choice);
    assert.equal(window.LiminalSite.getTest(), choice);
    assert.equal(document.documentElement.dataset.test, choice);
    assert.equal(storage.get("liminal:test:v1"), JSON.stringify(choice));
    assert.equal(storage.get("liminal:progress:v3"), "unchanged progress");
    assert.equal(storage.get("liminal:session:v1"), "unfinished set");
  }
  assert.equal(loadSite("").window.LiminalSite.getTest(), "ACT");
  assert.equal(loadSite("?test=unknown").window.LiminalSite.getTest(), "ACT");
});

test("legacy practice bookmarks preserve their route and query while home anchors stay home", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/app/home.js"), "utf8");
  for (const hash of ["#practice", "#practice/sat-math/linear-equations", "#progress", "#review", "#tips"]) {
    let redirected;
    const location = { hash, search: "?test=ACT", pathname: "/liminal/index.html", href: "https://example.org/liminal/index.html?test=ACT" + hash, replace: value => { redirected = value; } };
    vm.runInNewContext(source, { window: { location, addEventListener() {} }, location, URL });
    const url = new URL(redirected, location.href);
    assert.equal(url.pathname, "/liminal/practice.html");
    assert.equal(url.hash, hash);
    assert.equal(url.search, "?test=ACT");
  }
  for (const hash of ["", "#main", "#modules", "#resources"]) {
    const location = { hash, search: "", replace() { assert.fail("Home navigation redirected"); } };
    vm.runInNewContext(source, { window: { location, addEventListener() {} }, location, URL });
  }
  let handler;
  let target;
  const location = { hash: "#modules", search: "", replace(value) { target = value; } };
  vm.runInNewContext(source, { window: { location, addEventListener(type, callback) { if (type === "hashchange") handler = callback; } }, location, URL });
  location.hash = "#review";
  handler();
  assert.equal(target, "practice.html#review");
});

const navigation = require("../src/lib/navigation");
const siteHeader = require("../tools/lib/site-header");
const lessonModules = { version: 1, modules: [{ id: "grade-8-math", trackId: "common-core-math", grade: 8 }] };
const navAt = (page, hash = "", data = {}) => navigation.model({ pathname: "/liminal/" + page, hash }, { lessonModules, ...data });
const href = (model, id, primary = false) => model[primary ? "primary" : "secondary"].find(item => item.id === id).href;

test("four primary areas retain access to the existing course and reading destinations", () => {
  assert.deepEqual(navigation.PRIMARY.map(item => [item.label, item.href]), [
    ["Courses", "curriculum.html"], ["Readings", "daily-reading.html"], ["AP prep", "ap.html"], ["SAT/ACT", "practice.html"],
  ]);
  const destinations = new Set();
  for (const page of ["index.html", "curriculum.html", "daily-reading.html"]) {
    const model = navAt(page, page === "curriculum.html" ? "#common-core-math/8" : "");
    [...model.primary, ...model.secondary].forEach(item => destinations.add(item.href.split("#")[0]));
  }
  for (const page of ["curriculum.html", "weeks.html", "lessons.html", "high-school.html", "daily-reading.html", "reading-level.html", "ap.html", "practice.html"]) {
    assert.ok(destinations.has(page), page + " remains reachable");
  }
  assert.equal(href(navAt("curriculum.html"), "weeks"), "weeks.html#common-core-math/k/1");
});

test("current markers distinguish AP, readings, courses and test preparation", () => {
  for (const [page, hash, area, local] of [
    ["index.html", "", null, null], ["curriculum.html", "", "courses", "plans"],
    ["courses.html", "", "courses", "lessons"], ["lessons.html", "#common-core-math/8/2-1", "courses", "lessons"], ["high-school.html", "#geometry", "courses", "high-school"],
    ["curriculum.html", "#common-core-reading/8/u1", "readings", "plans"],
    ["weeks.html", "#common-core-reading/8/7", "readings", "weeks"],
    ["daily-reading.html", "#browse/8", "readings", "daily"], ["reading-level.html", "#plan", "readings", "level"],
    ["weeks.html", "#ap/physics-1/7", "ap", null], ["ap.html", "#physics-1/student/unit-1", "ap", null],
    ...["practice.html", "learn.html", "print.html"].map(page => [page, "", "prep", null]),
  ]) {
    const model = navAt(page, hash);
    assert.deepEqual(model.primary.filter(item => item.current).map(item => [item.id, item.current]), area ? [[area, "true"]] : [], page + hash);
    assert.deepEqual(model.secondary.filter(item => item.current).map(item => [item.id, item.current]), local ? [[local, "page"]] : [], page + hash);
    if (area === "ap" || area === "prep") assert.equal(model.secondary.length, 0, "existing section bars are not duplicated");
  }
});

test("course plans and weekly work preserve the chosen pathway, grade and named course", () => {
  for (const track of ["common-core-math", "singapore-math", "common-core-reading"]) {
    for (const grade of ["k", "8", "12"]) {
      assert.equal(href(navAt("curriculum.html", "#" + track + "/" + grade + "/u2"), "weeks"), "weeks.html#" + track + "/" + grade + "/1");
      assert.equal(href(navAt("weeks.html", "#" + track + "/" + grade + "/9"), "plans"), "curriculum.html#" + track + "/" + grade);
    }
  }
  assert.equal(href(navAt("high-school.html", "#geometry/u2"), "weeks"), "weeks.html#high-school-math/geometry/1");
  assert.equal(href(navAt("weeks.html", "#high-school-math/calculus/12"), "plans"), "curriculum.html");
  assert.equal(href(navAt("weeks.html", "#high-school-math/calculus/12"), "high-school"), "high-school.html#calculus");
  assert.equal(href(navAt("weeks.html", "#ap/calculus-ab/12"), "ap", true), "ap.html#calculus-ab");
  const lessons = navAt("courses.html");
  assert.equal(href(lessons, "plans"), "curriculum.html#common-core-math/8");
  assert.equal(href(lessons, "weeks"), "weeks.html#common-core-math/8/1");
});

test("moving between courses and readings carries a real grade without assigning grades to named courses", () => {
  assert.equal(href(navAt("weeks.html", "#singapore-math/7/4"), "courses", true), "curriculum.html#singapore-math/7");
  assert.equal(href(navAt("weeks.html", "#singapore-math/7/4"), "readings", true), "daily-reading.html#browse/7");
  assert.equal(href(navAt("daily-reading.html", "#browse/8"), "courses", true), "curriculum.html#common-core-math/8");
  const reading = navAt("weeks.html", "#common-core-reading/6/11");
  assert.equal(href(reading, "readings", true), "daily-reading.html#6/11/1");
  assert.equal(href(reading, "daily"), "daily-reading.html#6/11/1");
  for (const [page, hash] of [["high-school.html", "#calculus"], ["ap.html", "#physics-1"], ["weeks.html", "#ap/physics-1/4"], ["practice.html", "#practice"]]) {
    assert.equal(href(navAt(page, hash), "readings", true), "daily-reading.html");
    assert.equal(href(navAt(page, hash), "courses", true), "curriculum.html");
  }
});

test("reading links follow browse and nightly selections without inventing advanced courses", () => {
  const browse = navAt("daily-reading.html", "#browse/9");
  assert.equal(href(browse, "plans"), "curriculum.html#common-core-reading/9");
  assert.equal(href(browse, "weeks"), "weeks.html#common-core-reading/9/1");
  const night = navAt("daily-reading.html", "#9/17/4");
  assert.equal(href(night, "daily"), "daily-reading.html#9/17/4");
  assert.equal(href(night, "weeks"), "weeks.html#common-core-reading/9/17");
  for (const key of ["a1", "a4"]) {
    const advanced = navAt("daily-reading.html", "#browse/" + key);
    assert.equal(href(advanced, "daily"), "daily-reading.html#browse/" + key);
    assert.equal(href(advanced, "courses", true), "curriculum.html");
    assert.equal(href(advanced, "plans"), "curriculum.html#common-core-reading/k");
    assert.match(advanced.secondary.find(item => item.id === "plans").label, /K–12/);
  }
});

test("malformed weekly bookmarks follow the weekly engine's actual default course", () => {
  const weeklyIndex = { courses: [
    { trackId: "common-core-math", grade: 12 }, { trackId: "common-core-math", grade: 0 },
    { trackId: "common-core-reading", grade: 4 }, { trackId: "ap", courseId: "physics-1" },
  ] };
  const W = require("../src/lib/weekly");
  for (const hash of ["", "#not/a/course", "#ap/unknown/2", "#common-core-reading/4/no-week", "#ap/physics-1/3"]) {
    const selected = W.resolve(weeklyIndex, hash), model = navAt("weeks.html", hash, { weeklyIndex });
    const target = W.planRoute(selected.trackId, selected.courseId || selected.grade);
    assert.equal(href(model, selected.trackId === "ap" ? "ap" : "plans", selected.trackId === "ap"), target, hash);
  }
});

test("malformed reading bookmarks match the reader's grade and week fallback", () => {
  const D = require("../src/lib/daily-reading"), index = { grades: D.GRADES.map(grade => ({ grade })) };
  for (const hash of ["#browse/8/extra", "#unknown/11/1", "#9/no-week/4", "#8", "#9/17/4"]) {
    const selected = D.view(index, hash), model = navAt("daily-reading.html", hash);
    assert.equal(href(model, "plans"), "curriculum.html#common-core-reading/" + D.gradeKey(selected.grade), hash);
    assert.equal(href(model, "weeks"), "weeks.html#common-core-reading/" + D.gradeKey(selected.grade) + "/" + (selected.week || 1), hash);
  }
});

test("shared headers remain usable without scripts and canonical in every source page", () => {
  const pages = fs.readdirSync(path.join(__dirname, "../src")).filter(file => file.endsWith(".html"));
  for (const page of pages) {
    const source = fs.readFileSync(path.join(__dirname, "../src", page), "utf8");
    assert.equal(source.split(siteHeader.PLACEHOLDER).length, 2, page + " has one header placeholder");
    const built = siteHeader.apply(source, page);
    assert.deepEqual(siteHeader.problems(built, page), []);
    const header = siteHeader.render(page);
    assert.equal((header.match(/aria-label="Primary"/g) || []).length, 1);
    assert.equal((header.match(/data-lm-primary=/g) || []).length, 4);
    assert.doesNotMatch(header, /<details|<button/);
    assert.ok(header.includes('aria-label="Liminal home"'));
    assert.ok(siteHeader.problems(built.replace('src="lib/navigation.js"', 'src="missing.js"'), page).length);
    assert.ok(siteHeader.problems(built.replace("Courses</a>", "Wrong label</a>"), page).length);
  }
  assert.throws(() => siteHeader.apply("<body></body>", "broken.html"), /exactly one/);
});

function loadNavigation(page, hash) {
  class Element {
    constructor() { this.attributes = {}; this.textContent = ""; this.children = []; this.hidden = false; }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    querySelectorAll() { return this.children; }
    append(child) { this.children.push(child); child.parent = this; }
    remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); }
  }
  const primary = Object.fromEntries(navigation.PRIMARY.map(item => [item.id, new Element()]));
  const secondary = new Element(), listeners = {};
  const header = { querySelector(selector) {
    return selector === ".lm-subnav" ? secondary : primary[selector.match(/="([^"]+)"/)[1]];
  } };
  const document = { querySelector: () => header, createElement: () => new Element() };
  const window = { LIMINAL_LESSON_MODULES: lessonModules, location: { pathname: "/liminal/" + page, hash }, addEventListener(type, handler) { listeners[type] = handler; } };
  const context = vm.createContext({ window, document, URLSearchParams });
  for (const script of siteHeader.SCRIPTS.filter(script => !script.startsWith("content/"))) vm.runInContext(fs.readFileSync(path.join(__dirname, "../src", script), "utf8"), context);
  return { window, primary, secondary, listeners };
}

test("browser enhancement updates hash context and retains link nodes without storage access", () => {
  const { window, primary, secondary, listeners } = loadNavigation("weeks.html", "#common-core-math/5/7");
  const first = secondary.children[0];
  assert.equal(primary.courses.attributes["aria-current"], "true");
  window.location.hash = "#common-core-reading/8/9";
  listeners.hashchange();
  assert.equal(primary.courses.attributes["aria-current"], undefined);
  assert.equal(primary.readings.attributes["aria-current"], "true");
  assert.equal(secondary.children[0], first, "the focused anchor is reused");
  assert.equal(secondary.children[0].attributes.href, "daily-reading.html#8/9/1");
  window.location.hash = "#ap/physics-1/5";
  listeners.hashchange();
  assert.equal(primary.ap.attributes.href, "ap.html#physics-1");
  assert.equal(primary.ap.attributes["aria-current"], "true");
  assert.equal(secondary.hidden, true);
  assert.equal(secondary.children.length, 0);
  window.location.hash = "#singapore-math/3/1";
  listeners.popstate();
  assert.equal(secondary.hidden, false);
  assert.equal(secondary.children.length, 3);
  assert.equal(primary.courses.attributes["aria-current"], "true");
});


test("expanded lessons belong only to their declared pathway and grade", () => {
  for (const page of ["curriculum.html", "weeks.html", "lessons.html"]) {
    for (const [track, grade] of [["common-core-math", "7"], ["common-core-math", "9"], ["singapore-math", "8"], ["common-core-reading", "8"]]) {
      const model = navAt(page, "#" + track + "/" + grade);
      assert.equal(model.secondary.some(item => item.id === "lessons"), false, page + " " + track + "/" + grade);
      assert.equal(href(model, "plans"), "curriculum.html#" + track + "/" + grade);
    }
    assert.equal(href(navAt(page, "#common-core-math/8"), "lessons"), "lessons.html#common-core-math/8");
  }
  for (const page of ["high-school.html", "ap.html"]) assert.equal(navAt(page).secondary.some(item => item.id === "lessons"), false);
});

test("adding a future grade module changes routing and navigation through metadata alone", () => {
  const future = { id: "math-grade-7", trackId: "common-core-math", grade: 7 };
  const index = { modules: [...lessonModules.modules, future] };
  const route = navigation.lessonContext(index, { hash: "#common-core-math/7/1-2" });
  assert.equal(route.entry, future);
  assert.equal(route.lessonId, "1-2");
  const model = navAt("lessons.html", "#common-core-math/7/1-2", { lessonModules: index });
  assert.equal(href(model, "plans"), "curriculum.html#common-core-math/7");
  assert.equal(href(model, "weeks"), "weeks.html#common-core-math/7/1");
  assert.equal(href(model, "lessons"), "lessons.html#common-core-math/7");
});

test("explicit unauthored grades never resolve to a different expansion", () => {
  for (const hash of ["#common-core-math/k", "#common-core-math/7/1-2", "#singapore-math/8", "#common-core-reading/8"]) {
    const selected = navigation.lessonContext(lessonModules, { hash });
    assert.equal(selected.entry, null);
    assert.equal(selected.unavailable, true);
    assert.equal(selected.trackId, hash.slice(1).split("/")[0]);
  }
  for (const hash of ["#common-core-math/99", "#bad/8", "#common-core-math/%broken", "#grade-8-math/2-1/extra"]) {
    const selected = navigation.lessonContext(lessonModules, { hash });
    assert.equal(selected.entry, null);
    assert.equal(selected.invalid, true);
  }
});

test("legacy course and lesson bookmarks retain the requested lesson during replacement", () => {
  for (const location of [
    { search: "?lesson=2-1" }, { hash: "#grade-8-math/2-1" },
    { search: "?course=grade-8-math&lesson=2-1" }, { search: "?courseId=grade-8-math&lesson=2-1" },
    { hash: "#common-core-math/8/2-1" },
  ]) assert.equal(navigation.legacyLessonHref(lessonModules, location), "lessons.html#common-core-math/8/2-1");
  assert.equal(navigation.legacyLessonHref(lessonModules, { hash: "#common-core-math/7/1-2" }), "lessons.html#common-core-math/7/1-2");
  assert.equal(navigation.legacyLessonHref(lessonModules, { search: "?course=unknown&lesson=2-1" }), "lessons.html?course=unknown&lesson=2-1");
  let replaced;
  const anchor = {};
  const location = { search: "?lesson=2-1", replace(href) { replaced = href; } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/app/courses.js"), "utf8"), {
    window: { LiminalNavigation: navigation, LIMINAL_LESSON_MODULES: lessonModules, location },
    document: { getElementById: () => anchor },
  });
  assert.equal(replaced, "lessons.html#common-core-math/8/2-1");
  assert.equal(anchor.href, replaced);
});
