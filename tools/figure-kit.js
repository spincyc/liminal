#!/usr/bin/env node
"use strict";

// Figure kit command line (tooling only; see tools/lib/figure-kit.js).
//
//   node tools/figure-kit.js build <spec.js> <outDir>
//       spec.js exports { figureId: svgString } or a function (K) returning
//       one; each figure is admitted and written to <outDir>/<figureId>.svg.
//   node tools/figure-kit.js check <file.svg|dir>...
//       admits existing figure files (allow-list round trip, currentColor,
//       viewBox, 12 KB).
//   node tools/figure-kit.js gallery [outDir]
//       writes one sample of every primitive plus index.html for visual
//       checking (default .scratch/figure-gallery).

const fs = require("node:fs");
const path = require("node:path");
const K = require("./lib/figure-kit");
const { FIGURE_ID } = require("./lib/weekly-figures");

function writeAll(figures, outDir) {
  const rows = [];
  for (const [id, svg] of Object.entries(figures)) {
    if (!FIGURE_ID.test(id)) throw new Error("Invalid figure ID " + id + " (use lowercase letters, digits and hyphens)");
    rows.push([id, K.save(path.join(outDir, id + ".svg"), svg)]);
  }
  return rows;
}
function svgFiles(target) {
  const stat = fs.statSync(target);
  if (!stat.isDirectory()) return [target];
  return fs.readdirSync(target).filter(name => name.endsWith(".svg")).sort().map(name => path.join(target, name));
}
function gallery(outDir) {
  const { samples } = require("./lib/figure-gallery");
  const figures = samples();
  const rows = writeAll(figures, outDir);
  const cards = Object.keys(figures).map(id => `<figure><img src="${id}.svg" alt=""><figcaption>${id}</figcaption></figure>`).join("\n");
  const inline = Object.entries(figures).map(([id, svg]) => `<figure>${svg}<figcaption>${id}</figcaption></figure>`).join("\n");
  fs.writeFileSync(path.join(outDir, "index.html"), `<!doctype html><meta charset="utf-8"><title>Figure kit gallery</title>
<style>body{font:14px system-ui;margin:16px}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;padding:16px}
figure{margin:0;border:1px solid #bbb;padding:8px}img,svg{width:100%;height:auto;display:block}.dark{background:#111;color:#eee}.light{color:#000}</style>
<h1>Figure kit gallery</h1><p>Files (black via currentColor fallback), then inline light and dark.</p>
<section>${cards}</section><section class="light">${inline}</section><section class="dark">${inline}</section>\n`);
  return rows;
}

function main(argv) {
  const [command, ...rest] = argv;
  if (command === "build" && rest.length === 2) {
    const spec = require(path.resolve(rest[0]));
    const figures = typeof spec === "function" ? spec(K) : spec;
    for (const [id, bytes] of writeAll(figures, rest[1])) console.log(id + ".svg " + bytes + " bytes");
  } else if (command === "check" && rest.length) {
    let count = 0;
    for (const file of rest.flatMap(svgFiles)) { const { bytes } = K.check(fs.readFileSync(file, "utf8"), file); console.log(file + " " + bytes + " bytes"); count++; }
    console.log(count + " figures admitted.");
  } else if (command === "gallery") {
    const outDir = rest[0] || path.resolve(__dirname, "../.scratch/figure-gallery");
    const rows = gallery(outDir);
    console.log("Wrote " + rows.length + " figures and index.html to " + outDir + " (largest " + Math.max(...rows.map(r => r[1])) + " bytes).");
  } else {
    console.error("Usage: node tools/figure-kit.js build <spec.js> <outDir> | check <file|dir>... | gallery [outDir]");
    process.exitCode = 2;
  }
}

if (require.main === module) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { main, gallery };
