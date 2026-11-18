#!/usr/bin/env node
"use strict";
// Typesets the PDF corpus (tools/lib/pdf-corpus.js) with the real WebAssembly
// TeX engines against the runtime staged in dist/ by tools/build.js, exactly
// as the browser would, and checks every result: a complete PDF, no missing
// character or substituted font (the runner refuses those), and every level
// starting on an odd page.
//
//   node tools/check-pdf.js [--out DIR]   # --out keeps the PDFs for inspection
//
// Without a staged runtime it skips with a message, unless
// LIMINAL_REQUIRE_NATIVE_TEX=1 (set in CI), which makes that a failure.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

// The staged runtime from dist/native-tex/config.js, or null.
function stagedRuntime(dist = DIST) {
  const file = path.join(dist, "native-tex", "config.js");
  if (!fs.existsSync(file)) return null;
  const match = /window\.LiminalNativeTeXRuntime = (.*);\n?$/.exec(fs.readFileSync(file, "utf8").trim());
  return match ? JSON.parse(match[1]) : null;
}

// What a finished document must satisfy, from its bytes and log: every level
// starts on an odd page, every night on a page of its own, and in a document
// made with odd starts (the print view's) every night on an odd page too.
function inspect(bytes, log, levels, { nights = null, oddStarts = false } = {}) {
  const problems = [];
  const head = Buffer.from(bytes.subarray(0, 5)).toString("latin1"), tail = Buffer.from(bytes.subarray(-1024)).toString("latin1");
  if (head !== "%PDF-" || !tail.includes("%%EOF")) problems.push("not a complete PDF");
  const pages = Number((/Output written on .*?\((\d+) pages?/s.exec(log) || [])[1]);
  if (!pages) problems.push("no page count in the log");
  const starts = [...log.matchAll(/LIMINAL-LEVEL-START (\d+)/g)].map(match => Number(match[1]));
  if (starts.length !== levels) problems.push(levels + " levels but " + starts.length + " level starts");
  const even = starts.filter(page => page % 2 === 0);
  if (even.length) problems.push("levels start on even pages " + even.join(", "));
  const readings = [...log.matchAll(/LIMINAL-READING-START (\d+)/g)].map(match => Number(match[1]));
  if (nights !== null && readings.length !== nights) problems.push(nights + " nights but " + readings.length + " reading starts");
  if (new Set(readings).size !== readings.length) problems.push("two nights start on one page");
  const evenReadings = readings.filter(page => page % 2 === 0);
  if (oddStarts && evenReadings.length) problems.push("nights start on even pages " + evenReadings.join(", "));
  return { pages, starts, readings, problems };
}

async function main(argv) {
  const out = argv.includes("--out") ? path.resolve(argv[argv.indexOf("--out") + 1]) : null;
  const required = process.env.LIMINAL_REQUIRE_NATIVE_TEX === "1";
  const runtime = stagedRuntime();
  if (!runtime) {
    const message = "No PDF runtime is staged in dist/ (node tools/native-tex.js fetch, then node tools/build.js).";
    if (required) { console.error("check-pdf: " + message + " LIMINAL_REQUIRE_NATIVE_TEX=1 requires it."); return 1; }
    console.log("check-pdf: skipped. " + message);
    return 0;
  }
  const harness = require("./vendor/colophon/harness");
  const runner = require("../src/vendor/colophon/native-tex.js");
  const { documents } = require("./lib/pdf-corpus");
  if (out) fs.mkdirSync(out, { recursive: true });
  let failed = 0;
  for (const item of documents()) {
    const started = Date.now();
    try {
      const result = await harness.generate({ runner, site: DIST, runtimePath: runtime.url, runtimeSHA256: runtime.sha256, runtimeBytes: runtime.bytes,
        engine: item.document.engine, files: [{ path: "main.tex", data: item.document.tex }], entrypoint: "main.tex", cache: false });
      const report = inspect(result.bytes, result.log, item.levels, item.document);
      if (out) fs.writeFileSync(path.join(out, item.name + ".pdf"), result.bytes);
      const line = item.name + ": " + item.document.engine + ", " + item.document.nights + " nights, " + report.pages + " pages, "
        + result.byteLength + " bytes, " + ((Date.now() - started) / 1000).toFixed(1) + " s";
      if (report.problems.length) { failed++; console.error("FAIL " + line + "\n  " + report.problems.join("\n  ")); }
      else console.log("ok " + line);
    } catch (error) {
      failed++;
      console.error("FAIL " + item.name + ": " + require("./native-tex").explain(error, item.document.engine).message);
    }
  }
  if (failed) { console.error("check-pdf: " + failed + " document(s) failed"); return 1; }
  console.log("check-pdf: every document typeset with " + runtime.id);
  return 0;
}

module.exports = { stagedRuntime, inspect };

if (require.main === module) {
  main(process.argv.slice(2)).then(code => { process.exitCode = code; }, error => { console.error(error.stack || error.message); process.exitCode = 1; });
}
