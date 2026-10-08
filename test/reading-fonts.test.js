"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const { embed } = require("../tools/lib/reading-fonts");

test("reading print styles embed all four original font faces for offline exports", () => {
  const fonts = path.join(__dirname, "../src/fonts/computer-modern");
  const source = fs.readFileSync(path.join(__dirname, "../src/styles/reading-print.css"), "utf8");
  const files = [...source.matchAll(/computer-modern\/(cmun\w+\.woff2)/g)].map(match => match[1]);
  const output = embed(source, fonts);
  const encoded = [...output.matchAll(/data:font\/woff2;base64,([A-Za-z0-9+/=]+)/g)].map(match => Buffer.from(match[1], "base64"));
  assert.equal(encoded.length, 4);
  assert.doesNotMatch(output, /url\("\.\.\/fonts\//);
  for (let i = 0; i < files.length; i++) {
    assert.equal(encoded[i].subarray(0, 4).toString(), "wOF2");
    assert.deepEqual(encoded[i], fs.readFileSync(path.join(fonts, files[i])));
  }
  assert.match(fs.readFileSync(path.join(fonts, "OFL.txt"), "utf8"), /SIL OPEN FONT LICENSE Version 1\.1/);
});
