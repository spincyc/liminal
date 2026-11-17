#!/usr/bin/env node
"use strict";
// Colophon runtime delivery: verify a runtime manifest, hydrate its exact
// files from the published release archive into a local cache, derive a
// consumer subset from what the engines actually opened, and stage a
// manifest's files into a static site directory for src/native-tex.js.
//
//   node tools/runtime.js check   --manifest runtime/<id>.json [--cache DIR]
//   node tools/runtime.js hydrate --manifest M [--cache DIR] [--fetch] [--archive FILE] [--keep-archive]
//   node tools/runtime.js stage   --manifest M --site DIR [--cache DIR]
//
// A manifest pins every file by size and SHA-256. The cache and the archive
// are delivery only: nothing is accepted that does not match its pin, and no
// command fetches anything unless --fetch is given.
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");
const tar = require("./tar");

const SCHEMA = "colophon-native-tex-runtime/v1";
const HASH = /^[0-9a-f]{64}$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class RuntimeUnavailable extends Error {
  constructor(message) { super(message); this.name = "RuntimeUnavailable"; this.code = "ENORUNTIME"; }
}

const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
function canonical(value) {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + canonical(value[key])).join(",") + "}";
  return JSON.stringify(value);
}
function registryDigest(manifest) {
  const { registry_sha256: _, ...rest } = manifest;
  return sha256(Buffer.from(canonical(rest), "utf8"));
}
function seal(manifest) { const { registry_sha256: _, ...rest } = manifest; return { ...rest, registry_sha256: registryDigest(rest) }; }

function need(condition, message) { if (!condition) throw new Error("runtime manifest: " + message); }
function pinned(row, label) {
  need(row && HASH.test(row.sha256) && Number.isSafeInteger(row.bytes) && row.bytes > 0, label + " needs sha256 and bytes");
}
function relative(url, label) {
  need(typeof url === "string" && url && !url.startsWith("/") && !/[\\?#%\x00-\x1f]/.test(url) &&
    url.split("/").every(part => part && part !== "." && part !== ".."), label + " has an unsafe url");
}
function httpsURL(value, label) {
  let url;
  try { url = new URL(value); } catch (_) { url = null; }
  need(url && url.protocol === "https:" && !url.username && !url.password && !url.hash, label + " needs a public https URL");
}

function validate(manifest) {
  need(manifest && manifest.schema === SCHEMA, "schema must be " + SCHEMA);
  need(ID.test(manifest.id || ""), "invalid id");
  need(manifest.registry_sha256 === registryDigest(manifest), "registry_sha256 does not match the manifest");
  need(manifest.engines && typeof manifest.engines === "object", "missing engines");
  for (const [name, engine] of Object.entries(manifest.engines)) {
    need(["pdflatex", "xelatex", "dvipdfmx"].includes(name), "unknown engine " + name);
    for (const role of ["worker", "core", "wasm"]) need(engine[role], name + " lacks " + role);
    need(name === "dvipdfmx" || engine.format, name + " lacks its format");
    need(name !== "xelatex" || engine.icu, "xelatex lacks ICU data");
    if (manifest.engines.xelatex) need(manifest.engines.dvipdfmx, "xelatex needs dvipdfmx");
    for (const [role, value] of Object.entries(engine)) {
      for (const row of role === "support" ? value : [value]) {
        need(["worker", "core", "wasm", "format", "icu", "support"].includes(role), name + " has unknown role " + role);
        pinned(row, name + " " + role); relative(row.url, name + " " + role);
      }
    }
  }
  need(Array.isArray(manifest.texFiles), "missing texFiles");
  const keys = new Set();
  for (const row of manifest.texFiles) {
    need(Number.isSafeInteger(row.format) && row.format >= 0 && row.format <= 100 && typeof row.name === "string" && row.name &&
      !/[/\\\x00-\x1f]/.test(row.name), "invalid texFiles entry");
    const key = row.format + "/" + row.name;
    need(!keys.has(key), "duplicate texFiles entry " + key);
    keys.add(key);
    pinned(row, key); relative(row.url, key);
    if (row.engines !== undefined) need(Array.isArray(row.engines) && row.engines.length && row.engines.every(item => manifest.engines[item]), key + " names an unknown engine");
  }
  need(Array.isArray(manifest.notices) && manifest.notices.length, "missing licence notices");
  for (const row of manifest.notices) { pinned(row, "notice"); relative(row.url, "notice"); }
  const source = manifest.correspondingSource;
  need(source && HASH.test(source.sha256) && Number.isSafeInteger(source.bytes), "missing corresponding-source offer");
  httpsURL(source.url, "corresponding source");
  const delivery = manifest.delivery;
  need(delivery && typeof delivery.memberPrefix === "string" && delivery.memberPrefix.endsWith("/") &&
    Array.isArray(delivery.archives) && delivery.archives.length === 1, "delivery needs one archive and a member prefix");
  for (const archive of delivery.archives) {
    need(typeof archive.name === "string" && HASH.test(archive.sha256) && Number.isSafeInteger(archive.bytes) &&
      Array.isArray(archive.urls) && archive.urls.length, "invalid delivery archive");
    archive.urls.forEach(url => httpsURL(url, "archive"));
  }
  return manifest;
}

function load(file) { return validate(JSON.parse(fs.readFileSync(file, "utf8"))); }

// Every file a manifest names, once each: url -> { sha256, bytes }.
function files(manifest) {
  const result = new Map();
  const add = row => {
    const known = result.get(row.url);
    need(!known || known.sha256 === row.sha256 && known.bytes === row.bytes, row.url + " has two different pins");
    result.set(row.url, { sha256: row.sha256, bytes: row.bytes });
  };
  for (const engine of Object.values(manifest.engines)) {
    for (const [role, value] of Object.entries(engine)) (role === "support" ? value : [value]).forEach(add);
  }
  manifest.texFiles.forEach(add);
  manifest.notices.forEach(add);
  return result;
}

function defaultCache(name = "colophon") {
  return path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache"), name, "native-tex");
}
const objectPath = (cache, row) => path.join(cache, "objects", row.sha256);

function verifiedFile(file, row) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size !== row.bytes) return false;
    return sha256(fs.readFileSync(file)) === row.sha256;
  } catch (_) { return false; }
}

function missing(manifest, cache) {
  const absent = new Map();
  const seen = new Set();
  for (const [url, row] of files(manifest)) {
    if (seen.has(row.sha256)) continue;
    seen.add(row.sha256);
    if (!verifiedFile(objectPath(cache, row), row)) absent.set(row.sha256, { ...row, url });
  }
  return absent;
}

function hashFile(file) {
  const hash = crypto.createHash("sha256");
  const fd = fs.openSync(file, "r");
  try {
    const buffer = Buffer.alloc(4 * 1024 * 1024);
    let read;
    while ((read = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) hash.update(buffer.subarray(0, read));
  } finally { fs.closeSync(fd); }
  return hash.digest("hex");
}

async function download(archive, target, log) {
  const failures = [];
  for (const url of archive.urls) {
    const partial = target + ".part-" + process.pid;
    try {
      log("Fetching " + url);
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const hash = crypto.createHash("sha256");
      const fd = fs.openSync(partial, "w");
      let size = 0;
      try {
        for await (const chunk of response.body) {
          size += chunk.byteLength;
          if (size > archive.bytes) throw new Error("archive is larger than its pin");
          hash.update(chunk);
          fs.writeSync(fd, chunk);
        }
      } finally { fs.closeSync(fd); }
      if (size !== archive.bytes || hash.digest("hex") !== archive.sha256) throw new Error("archive does not match its pin");
      fs.renameSync(partial, target);
      return;
    } catch (error) {
      fs.rmSync(partial, { force: true });
      failures.push(url + ": " + error.message);
    }
  }
  throw new RuntimeUnavailable("could not fetch the runtime archive:\n  " + failures.join("\n  "));
}

// Ensures every file of the manifest is in the cache, verified. Takes members
// from a local archive (given, or cached), fetching it only with fetch: true.
async function hydrate(manifest, options = {}) {
  validate(manifest);
  const cache = path.resolve(options.cache || defaultCache());
  const log = options.log || (() => {});
  const absent = missing(manifest, cache);
  if (!absent.size) return { runtime: manifest.id, hydrated: 0, files: files(manifest).size };
  const archive = manifest.delivery.archives[0];
  const archives = path.join(cache, "archives");
  let local = options.archive ? path.resolve(options.archive) : path.join(archives, archive.sha256 + ".tar");
  let fetched = false;
  if (!fs.existsSync(local)) {
    if (options.archive || !options.fetch) throw new RuntimeUnavailable("the runtime " + manifest.id + " is not in " + cache + " (" + absent.size + " files missing); fetch it with --fetch");
    fs.mkdirSync(archives, { recursive: true });
    await download(archive, local, log);
    fetched = true;
  }
  const stat = fs.statSync(local);
  if (stat.size !== archive.bytes || hashFile(local) !== archive.sha256) {
    throw new RuntimeUnavailable("the runtime archive " + local + " does not match its pin");
  }
  const wanted = new Map();
  for (const row of absent.values()) wanted.set(manifest.delivery.memberPrefix + row.url, row);
  fs.mkdirSync(path.join(cache, "objects"), { recursive: true });
  let hydrated = 0;
  tar.each(local, member => {
    const row = wanted.get(member.name);
    if (!row) return;
    if (member.type !== "file" || member.size !== row.bytes) throw new Error("archive member " + member.name + " is not the pinned file");
    const bytes = member.read();
    if (sha256(bytes) !== row.sha256) throw new Error("archive member " + member.name + " does not match its pin");
    const target = objectPath(cache, row), partial = target + ".part-" + process.pid;
    fs.writeFileSync(partial, bytes);
    fs.renameSync(partial, target);
    wanted.delete(member.name);
    hydrated++;
  });
  if (wanted.size) throw new Error("the runtime archive lacks " + wanted.size + " pinned files, e.g. " + [...wanted.keys()][0]);
  if (fetched && !options.keepArchive) fs.rmSync(local, { force: true });
  return { runtime: manifest.id, hydrated, files: files(manifest).size };
}

function available(manifest, cache = defaultCache()) {
  return missing(manifest, path.resolve(cache)).size === 0;
}

// Engine and TeX files a static host may not compress travel as gzip when that
// saves at least a tenth; the runner verifies both the compressed and original pins.
function transport(bytes, url) {
  if (url.endsWith(".gz") || bytes.length < 16 * 1024) return null;
  const packed = zlib.gzipSync(bytes, { level: 9 });
  return packed.length <= bytes.length * 0.9 ? packed : null;
}

const escapeHTML = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function noticeTitle(bytes, url = "") {
  const line = bytes.toString("utf8").split(/\r?\n/).map(item => item.replace(/^[\s#%*/=-]+|[\s#%*/=-]+$/g, "")).find(Boolean) || "";
  // A file whose first line is not prose (JSON, for instance) is named by its file name.
  if (!/[A-Za-z]{2}/.test(line)) return url.split("/").pop() || "Notice";
  return line.length > 100 ? line.slice(0, 97) + "…" : line;
}
function noticesPage(manifest, titles) {
  const engines = Object.keys(manifest.engines).join(", ");
  const source = manifest.correspondingSource;
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Typesetter licences</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem}code{font-size:.9em}li{margin:.2rem 0}</style></head>
<body>
<h1>Typesetter licences and source</h1>
<p>PDFs on this site are typeset in your browser by WebAssembly builds of TeX Live engines (${escapeHTML(engines)}) from
<a href="https://github.com/corca-ai/wasmtex">WasmTex</a>, delivered by <a href="https://github.com/spincyc/colophon">Colophon</a>
as runtime <code>${escapeHTML(manifest.id)}</code>. The engines are free software under the GNU GPL and LGPL and other licences below;
the fonts and TeX packages keep their own licences (GUST Font License, SIL Open Font License, GPL with font exception, LPPL).</p>
<p><strong>Corresponding source.</strong> The complete corresponding source for these engine builds is available at
<a href="${escapeHTML(source.url)}">${escapeHTML(source.url)}</a> (${source.bytes} bytes, SHA-256 <code>${source.sha256}</code>).
Matching font and package sources are listed in the offers below.</p>
<h2>Notices</h2>
<ul>
${manifest.notices.map(row => `<li><a href="${escapeHTML(row.url)}">${escapeHTML(titles.get(row.url) || row.url)}</a></li>`).join("\n")}
</ul>
</body>
</html>
`;
}

// Copies the manifest's verified files into <site>/native-tex/<id>/ with the
// served runtime.json and a licence page. Returns where the manifest is.
function stage(manifest, options) {
  validate(manifest);
  const cache = path.resolve(options.cache || defaultCache());
  const absent = missing(manifest, cache);
  if (absent.size) throw new RuntimeUnavailable("the runtime " + manifest.id + " is not hydrated in " + cache + " (" + absent.size + " files missing)");
  const root = path.join(path.resolve(options.site), "native-tex", manifest.id);
  fs.rmSync(root, { recursive: true, force: true });
  const served = JSON.parse(JSON.stringify(manifest));
  const titles = new Map();
  let total = 0;
  for (const [url, row] of files(manifest)) {
    const bytes = fs.readFileSync(objectPath(cache, row));
    if (bytes.length !== row.bytes || sha256(bytes) !== row.sha256) throw new Error("cached " + url + " changed");
    const target = path.join(root, url);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
    total += bytes.length;
    if (url.startsWith("notices/")) titles.set(url, noticeTitle(bytes, url));
  }
  const packedRows = new Map();
  const pack = row => {
    if (!packedRows.has(row.url)) {
      const packed = transport(fs.readFileSync(path.join(root, row.url)), row.url);
      if (packed) fs.writeFileSync(path.join(root, row.url + ".gz"), packed);
      packedRows.set(row.url, packed && { url: row.url + ".gz", sha256: sha256(packed), bytes: packed.length, compression: "gzip" });
    }
    if (packedRows.get(row.url)) row.transport = { ...packedRows.get(row.url) };
  };
  for (const engine of Object.values(served.engines)) {
    for (const [role, value] of Object.entries(engine)) for (const row of role === "support" ? value : [value]) pack(row);
  }
  for (const row of served.texFiles) pack(row);
  const body = Buffer.from(JSON.stringify(served) + "\n", "utf8");
  fs.writeFileSync(path.join(root, "runtime.json"), body);
  fs.writeFileSync(path.join(root, "index.html"), noticesPage(manifest, titles));
  return { id: manifest.id, runtimePath: "native-tex/" + manifest.id + "/runtime.json", sha256: sha256(body), bytes: body.length,
    files: files(manifest).size, fileBytes: total };
}

// A consumer subset: only the engines traced and the TeX files they opened,
// each tagged with the engines that need it, plus every notice.
function subset(full, traces, note) {
  validate(full);
  const names = Object.keys(traces);
  need(names.length && names.every(name => ["pdflatex", "xelatex"].includes(name) && full.engines[name]), "traces must name pdflatex or xelatex");
  const engines = {};
  for (const name of names) engines[name] = full.engines[name];
  if (engines.xelatex) engines.dvipdfmx = full.engines.dvipdfmx;
  const byKey = new Map(full.texFiles.map(row => [row.format + "/" + row.name, row]));
  const tagged = new Map();
  for (const name of names) {
    for (const key of traces[name]) {
      need(byKey.has(key), "trace names " + key + ", which is not in " + full.id);
      if (!tagged.has(key)) tagged.set(key, new Set());
      tagged.get(key).add(name);
    }
  }
  const texFiles = full.texFiles.filter(row => tagged.has(row.format + "/" + row.name))
    .map(row => ({ ...row, engines: names.filter(name => tagged.get(row.format + "/" + row.name).has(name)) }));
  const { texMissing: _, registry_sha256: __, subset: ___, ...rest } = full;
  return seal({ ...rest, engines, texFiles, subset: { of: full.registry_sha256, note: note || null } });
}

function summary(manifest) {
  const byEngine = {};
  for (const [name, engine] of Object.entries(manifest.engines)) {
    const rows = Object.entries(engine).flatMap(([role, value]) => role === "support" ? value : [value]);
    byEngine[name] = { files: rows.length, bytes: rows.reduce((sum, row) => sum + row.bytes, 0) };
  }
  const tex = {};
  for (const name of Object.keys(manifest.engines)) {
    const unique = new Map();
    for (const row of manifest.texFiles) if (!row.engines || row.engines.includes(name)) unique.set(row.sha256, row.bytes);
    tex[name] = { files: unique.size, bytes: [...unique.values()].reduce((a, b) => a + b, 0) };
  }
  const all = files(manifest);
  return { id: manifest.id, engines: byEngine, texFiles: tex, distinctFiles: all.size,
    bytes: [...new Map([...all.values()].map(row => [row.sha256, row.bytes])).values()].reduce((a, b) => a + b, 0) };
}

function parse(argv) {
  const options = { command: argv[0] };
  for (let i = 1; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => { if (i + 1 >= argv.length) throw new Error(flag + " needs a value"); return argv[++i]; };
    if (flag === "--manifest") options.manifest = value();
    else if (flag === "--cache") options.cache = value();
    else if (flag === "--site") options.site = value();
    else if (flag === "--archive") options.archive = value();
    else if (flag === "--fetch") options.fetch = true;
    else if (flag === "--keep-archive") options.keepArchive = true;
    else throw new Error("unknown option " + flag);
  }
  if (!["check", "hydrate", "stage", "summary"].includes(options.command) || !options.manifest) {
    throw new Error("usage: runtime.js (check|hydrate|stage|summary) --manifest FILE [--cache DIR] [--fetch] [--archive FILE] [--keep-archive] [--site DIR]");
  }
  return options;
}

async function main(argv) {
  const options = parse(argv);
  const manifest = load(options.manifest);
  const log = message => console.error(message);
  if (options.command === "check") {
    const cache = path.resolve(options.cache || defaultCache());
    const absent = missing(manifest, cache);
    console.log(JSON.stringify({ runtime: manifest.id, files: files(manifest).size, missing: absent.size, cache }));
    return absent.size ? 1 : 0;
  }
  if (options.command === "summary") { console.log(JSON.stringify(summary(manifest), null, 2)); return 0; }
  if (options.command === "hydrate") { console.log(JSON.stringify(await hydrate(manifest, { ...options, log }))); return 0; }
  if (!options.site) throw new Error("stage needs --site");
  console.log(JSON.stringify(stage(manifest, options)));
  return 0;
}

module.exports = { SCHEMA, RuntimeUnavailable, sha256, canonical, registryDigest, seal, validate, load, files, defaultCache,
  missing, available, hydrate, stage, subset, summary, transport };

if (require.main === module) {
  main(process.argv.slice(2)).then(code => { process.exitCode = code; }, error => { console.error(error.message); process.exitCode = 1; });
}
