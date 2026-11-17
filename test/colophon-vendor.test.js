"use strict";
// The vendored Colophon files are byte-identical to the commit recorded in
// tools/vendor/colophon.json; change them in Colophon and re-sync.
const test = require("node:test");
const assert = require("node:assert/strict");
const sync = require("../tools/sync-colophon");

test("vendored Colophon files match their recorded commit", () => {
  assert.deepEqual(sync.verify(), []);
});
