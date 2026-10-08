"use strict";
// Pages must load on Safari before 16.4, which cannot parse regular-expression
// lookbehind: one lookbehind literal stops a whole script.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SRC = path.resolve(__dirname, "../src");

test("scripts the pages load contain no regular-expression lookbehind", () => {
  const scripts = new Set();
  for (const page of fs.readdirSync(SRC).filter(name => name.endsWith(".html"))) {
    for (const [, src] of fs.readFileSync(path.join(SRC, page), "utf8").matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) {
      const file = path.join(SRC, src.split("?")[0]);
      if (fs.existsSync(file)) scripts.add(file); // generated content/*.js is data
    }
  }
  assert.ok(scripts.size > 10, "found the page scripts");
  const offenders = [...scripts].filter(file => /\(\?<[=!]/.test(fs.readFileSync(file, "utf8")));
  assert.deepEqual(offenders.map(file => path.relative(SRC, file)), []);
});
