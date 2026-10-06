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
