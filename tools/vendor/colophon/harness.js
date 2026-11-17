"use strict";
// Runs the browser runner (src/native-tex.js) unchanged in Node: the same
// verified fetches, worker bridge, pass loop and log checks, with the
// WebAssembly engines in worker_threads and the runtime read from a staged
// site directory instead of the network. Consumers use it in CI gates to
// prove that their documents typeset with exactly the files they publish.
//
//   const harness = require("./harness");
//   const result = await harness.generate({ runner: require("../src/native-tex.js"), site: "dist",
//     runtimePath: "native-tex/<id>/runtime.json", files: [{ path: "main.tex", data: tex }], entrypoint: "main.tex" });
const fs = require("node:fs");
const path = require("node:path");
const { Worker } = require("node:worker_threads");

const BASE = "https://colophon.invalid/";

// The worker environment the engine controllers expect from a browser:
// `self`, importScripts limited to the verified assets, the WebAssembly
// binary supplied in memory, and an XMLHttpRequest that never reaches a network.
const BOOT = String.raw`
const { parentPort, workerData } = require("node:worker_threads");
const vm = require("node:vm");
globalThis.self = globalThis;
globalThis.require = require;
const assets = workerData.assets;
const decoder = new TextDecoder("utf-8", { fatal: true });
self.location = { href: "https://colophon.invalid/worker.js", search: "" };
self.postMessage = (message, transfer) => parentPort.postMessage(message, transfer || []);
self.close = () => process.exit(0);
self.XMLHttpRequest = class { constructor() { this.status = 404; this.response = new ArrayBuffer(0); } open() {} send() {} getResponseHeader() { return null; } };
self.importScripts = (...urls) => {
  for (const url of urls) {
    const name = String(url).split("/").pop();
    if (!Object.hasOwn(assets, name) || name.endsWith(".wasm")) throw Error("Unverified typesetter script: " + name);
    vm.runInThisContext(decoder.decode(assets[name].bytes), { filename: name });
  }
};
const wasm = Object.keys(assets).find(name => name.endsWith(".wasm"));
self.__wasmtexWasmBinary = wasm ? assets[wasm].bytes : undefined;
parentPort.on("message", data => self.onmessage({ data }));
vm.runInThisContext(workerData.controller, { filename: "controller.js" });
`;

function createWorker({ controller, assets }) {
  const worker = new Worker(BOOT, { eval: true, workerData: { controller, assets }, stdout: true, stderr: true });
  // Engine chatter goes to the log the runner returns, not the console.
  worker.stdout.resume(); worker.stderr.resume();
  const handle = { onmessage: null, onerror: null };
  worker.on("message", data => handle.onmessage && handle.onmessage({ data }));
  worker.on("error", error => handle.onerror && handle.onerror({ message: error && error.message }));
  worker.on("exit", code => { if (code !== 0 && handle.onerror) handle.onerror({ message: "worker exited with " + code }); });
  handle.postMessage = (payload, transfer) => worker.postMessage(payload, transfer || []);
  handle.terminate = () => { handle.onmessage = null; handle.onerror = null; worker.terminate(); };
  return handle;
}

// Serves files from a staged site directory at BASE, refusing anything else.
function siteFetch(site) {
  const root = path.resolve(site);
  return async (url) => {
    const target = new URL(url);
    if (target.origin !== new URL(BASE).origin) throw new TypeError("Only the staged site can be fetched: " + url);
    const file = path.resolve(root, "." + decodeURIComponent(target.pathname));
    if (!file.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });
    let bytes;
    try { bytes = fs.readFileSync(file); } catch (_) { return new Response("Not found", { status: 404 }); }
    return new Response(bytes, { status: 200, headers: { "content-length": String(bytes.length) } });
  };
}

function environment(site) {
  return { baseURL: BASE, fetch: siteFetch(site), createWorker, caches: null, crypto: globalThis.crypto };
}

async function generate(options) {
  const { runner, site, runtimePath, ...rest } = options;
  if (!runner || typeof runner.generate !== "function") throw new TypeError("harness.generate needs the runner module");
  if (!site || !runtimePath) throw new TypeError("harness.generate needs site and runtimePath");
  return runner.generate({ ...rest, runtimeURL: new URL(runtimePath, BASE).href, environment: environment(site) });
}

module.exports = { BASE, createWorker, siteFetch, environment, generate };
