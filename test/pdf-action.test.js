"use strict";
// The Generate PDF helper (src/app/pdf-action.js) hands the pinned runtime and
// the TeX to the vendored Colophon runner, and says plainly when a build has
// no runtime. The runner itself is tested in Colophon with a fake worker.
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");

const SOURCE = fs.readFileSync(path.join(__dirname, "../src/app/pdf-action.js"), "utf8");
function page({ runtime, colophon }) {
  const clicks = [], made = [];
  const element = tag => {
    const node = { tagName: tag, attributes: {}, listeners: {}, hidden: false, disabled: false, textContent: "",
      setAttribute(name, value) { this.attributes[name] = value; }, addEventListener(type, run) { this.listeners[type] = run; },
      click() { clicks.push(this); }, remove() {} };
    made.push(node); return node;
  };
  const window = { LiminalNativeTeXRuntime: runtime, Colophon: colophon, setTimeout: () => 0, console };
  const context = vm.createContext({ window, document: { baseURI: "https://liminal.example/site/daily-reading.html#5/1/1", createElement: element, body: { append() {} } },
    URL: Object.assign(function (value, base) { return new URL(value, base); }, { createObjectURL: () => "blob:x", revokeObjectURL() {} }), Blob, AbortController });
  vm.runInContext(SOURCE, context);
  return { api: window.LiminalPdfAction, clicks, made };
}
const RUNTIME = { id: "r", url: "native-tex/r/runtime.json", sha256: "a".repeat(64), bytes: 10, notices: "native-tex/r/" };

test("run typesets with the pinned runtime and saves the named PDF", async () => {
  let seen;
  const colophon = { generate: async options => { seen = options; return { bytes: new Uint8Array([37, 80, 68, 70]), cached: false }; } };
  const { api, clicks } = page({ runtime: RUNTIME, colophon });
  assert.equal(api.available(), true);
  const result = await api.run({ tex: "\\documentclass{article}", engine: "pdflatex", filename: "reading-5-w01-d1.pdf" });
  assert.equal(result.bytes.length, 4);
  assert.deepEqual(JSON.parse(JSON.stringify({ ...seen, signal: undefined, onProgress: undefined })), {
    files: [{ path: "main.tex", data: "\\documentclass{article}" }], entrypoint: "main.tex", engine: "pdflatex",
    runtimeURL: "https://liminal.example/site/native-tex/r/runtime.json", runtimeSHA256: RUNTIME.sha256, runtimeBytes: 10 });
  assert.equal(clicks.length, 1);
  assert.equal(clicks[0].download, "reading-5-w01-d1.pdf");
});

test("the control reports progress, cancels, and says when PDFs are unavailable", async () => {
  let release;
  const colophon = { generate: options => new Promise((resolve, reject) => {
    options.onProgress({ message: "Typesetting (pass 1)…" });
    options.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
    release = () => resolve({ bytes: new Uint8Array(1), cached: false });
  }) };
  const { api } = page({ runtime: RUNTIME, colophon });
  const control = api.control({ prepare: () => ({ tex: "x", engine: "pdflatex", filename: "n.pdf" }) });
  assert.equal(control.button.textContent, "Generate PDF");
  const first = control.button.listeners.click();
  assert.equal(control.button.textContent, "Cancel PDF");
  assert.equal(control.status.textContent, "Typesetting (pass 1)…");
  control.button.listeners.click(); await first;
  assert.equal(control.status.textContent, "PDF cancelled.");
  assert.equal(control.button.textContent, "Generate PDF");
  const second = control.button.listeners.click(); release(); await second;
  assert.match(control.status.textContent, /^Saved n\.pdf/);

  const offline = page({ runtime: null, colophon }).api.control({ prepare: () => null });
  assert.equal(offline.available, false);
  assert.equal(offline.button.disabled, true);
  assert.equal(offline.status.textContent, "PDF generation is unavailable in this copy of the site.");
  await assert.rejects(page({ runtime: null, colophon }).api.run({ tex: "x", engine: "pdflatex" }), /unavailable/);
});
