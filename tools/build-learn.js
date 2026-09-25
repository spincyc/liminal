#!/usr/bin/env node
"use strict";

// Builds the Learn bundle, dist/content/learn-sat.js, from content/learn:
// every page parsed with src/lib/learn-markup.js, {{fact:id}} values filled
// in from content/learn/facts.json, and an index in catalog order. A page
// outside the markup subset, an undefined fact, or a link to a page or
// anchor that does not exist stops the build. Completeness against the
// catalog and the templates is tools/check-learn.js's job.
//
//   node tools/build-learn.js [--root <learn dir>] [--out <file>]
//
// tools/build.js calls build() for the site; --root lets the same build run
// against test fixtures.

const fs = require("node:fs");
const path = require("node:path");

const Learn = require("../src/lib/learn-markup");
const { slug } = require("./lib/families");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_ROOT = path.join(ROOT, "content", "learn");
const DEFAULT_OUT = path.join(ROOT, "dist", "content", "learn-sat.js");
const FACTS_FILE = "facts.json";
const GENERAL_PREFIX = "sat/general/";
const GENERAL_TITLE = "Across the SAT";

// Every file under root, as paths relative to it with "/" separators.
function listFiles(root, relative) {
  const dir = path.join(root, relative || "");
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listFiles(root, rel) : [rel];
  }).sort();
}

// { exists, files: { "<id>.md": text }, others: [paths], factsText }
function readTree(root) {
  if (!fs.existsSync(root)) return { exists: false, files: {}, others: [], factsText: null };
  const files = {};
  const others = [];
  let factsText = null;
  listFiles(root).forEach((rel) => {
    const full = path.join(root, rel);
    if (rel === FACTS_FILE) factsText = fs.readFileSync(full, "utf8");
    else if (rel.endsWith(".md")) files[rel] = fs.readFileSync(full, "utf8");
    else others.push(rel);
  });
  return { exists: true, files, others, factsText };
}

function readCatalog() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "content", "catalog.json"), "utf8"));
}

// Parses facts.json: [{ id, value, verified, source }]. Shape problems are
// errors here; tools/check-learn.js also checks dates and sources.
function parseFacts(factsText) {
  const errors = [];
  const facts = new Map();
  if (factsText === null) return { facts, errors };
  let list;
  try {
    list = JSON.parse(factsText);
  } catch (error) {
    errors.push({ file: FACTS_FILE, line: 1, message: `not valid JSON (${error.message})` });
    return { facts, errors };
  }
  if (!Array.isArray(list)) {
    errors.push({ file: FACTS_FILE, line: 1, message: "must be an array of { id, value, verified, source }" });
    return { facts, errors };
  }
  // The line an entry's id first appears on, so errors point at it.
  const lineOf = (id) => {
    const at = typeof id === "string" ? factsText.indexOf(JSON.stringify(id)) : -1;
    return at < 0 ? 1 : factsText.slice(0, at).split("\n").length;
  };
  list.forEach((fact, index) => {
    const where = { file: FACTS_FILE, line: lineOf(fact && fact.id) };
    if (!fact || typeof fact !== "object" || typeof fact.id !== "string" || !Learn.FACT_ID.test(fact.id)) {
      errors.push(Object.assign({ message: `entry ${index} needs an id of lower-case letters, digits, - and .` }, where));
      return;
    }
    if (facts.has(fact.id)) {
      errors.push(Object.assign({ message: `fact "${fact.id}" is defined twice` }, where));
      return;
    }
    if (typeof fact.value !== "string" || !fact.value.trim()) {
      errors.push(Object.assign({ message: `fact "${fact.id}" needs a non-empty string value` }, where));
    }
    facts.set(fact.id, Object.assign({ line: where.line }, fact));
  });
  return { facts, errors };
}

// Parses every page, fills in facts, and checks links between pages.
// Returns { pages: { id: page }, facts: Map, errors: [{ file, line, message }] }.
// A page is kept even when it has errors, so later checks can say more.
function loadLearn(tree) {
  const { facts, errors } = parseFacts(tree.factsText);
  const parsed = {};
  Object.keys(tree.files).forEach((file) => {
    const id = file.replace(/\.md$/, "");
    const result = Learn.parse(tree.files[file]);
    result.errors.forEach((error) => errors.push(Object.assign({ file }, error)));
    if (!Learn.PAGE_ID.test(id)) {
      errors.push({ file, line: 1, message: "file names are lower-case letters and digits joined by hyphens" });
    }
    if (result.meta.id && result.meta.id !== id) {
      errors.push({ file, line: 1, message: `front matter id "${result.meta.id}" must be the page's path, "${id}"` });
    }
    parsed[id] = Object.assign({ id, file }, result);
  });

  const pages = {};
  Object.values(parsed).forEach((page) => {
    const used = [];
    page.facts.forEach((use) => {
      if (!facts.has(use.id)) {
        errors.push({ file: page.file, line: use.line, message: `{{fact:${use.id}}} is not defined in ${FACTS_FILE}` });
      } else if (!used.includes(use.id)) {
        used.push(use.id);
      }
    });
    Learn.walkInline(page.blocks, (node) => {
      if (node.type === "fact" && facts.has(node.id)) node.text = String(facts.get(node.id).value);
    });
    page.links.forEach((link) => {
      if (link.page === undefined) return;
      const target = parsed[link.page];
      const label = `learn:${link.page}${link.anchor ? `#${link.anchor}` : ""}`;
      if (!target) {
        errors.push({ file: page.file, line: link.line, message: `link ${label}: no such page` });
      } else if (link.anchor && !Learn.anchors(target.blocks).has(link.anchor)) {
        errors.push({ file: page.file, line: link.line, message: `link ${label}: that page has no {#${link.anchor}}` });
      }
    });

    const general = page.id.startsWith(GENERAL_PREFIX);
    const record = {
      id: page.id,
      kind: general ? "general" : "skill",
      title: page.meta.title || page.id,
    };
    if (!general) {
      ["section", "domain", "skill"].forEach((key) => {
        if (page.meta[key]) record[key] = page.meta[key];
      });
      record.skillSlug = page.id.split("/").pop();
    }
    record.blocks = page.blocks;
    record.facts = used.map((id) => {
      const fact = facts.get(id);
      return { id, value: String(fact.value), verified: fact.verified, source: fact.source };
    });
    record.file = page.file;
    record.meta = page.meta;
    pages[page.id] = record;
  });
  return { pages, facts, errors };
}

// The index in catalog order: each SAT section's domains and skills, then
// the general pages by id. Only pages that exist are listed.
function buildIndex(pages, catalog) {
  const index = [];
  catalog.sections.filter((section) => section.test === "SAT").forEach((section) => {
    const domains = section.domains.map((domain) => ({
      name: domain.name,
      pages: Object.keys(domain.skills).map((skill) => {
        const id = `${section.key}/${slug(domain.name)}/${slug(skill)}`;
        const page = pages[id];
        if (!page || page.kind !== "skill") return null;
        const headings = new Map(Learn.outline(page.blocks).map((entry) => [entry.id, entry.text]));
        return {
          id,
          title: page.title,
          subskills: domain.skills[skill]
            .map((subskill) => slug(subskill))
            .filter((anchor) => headings.has(anchor))
            .map((anchor) => ({ anchor, title: headings.get(anchor) })),
        };
      }).filter(Boolean),
    })).filter((domain) => domain.pages.length);
    if (domains.length) index.push({ kind: "section", sectionKey: section.key, title: section.section, domains });
  });
  const general = Object.values(pages)
    .filter((page) => page.kind === "general")
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .map((page) => ({ id: page.id, title: page.title }));
  if (general.length) index.push({ kind: "general", title: GENERAL_TITLE, pages: general });
  return index;
}

// The browser bundle: source lines and build-only fields are dropped.
function bundleSource(pages, index) {
  const shipped = {};
  Object.keys(pages).sort().forEach((id) => {
    const page = Object.assign({}, pages[id]);
    delete page.file;
    delete page.meta;
    shipped[id] = page;
  });
  const json = JSON.stringify({ pages: shipped, index }, (key, value) => (key === "line" ? undefined : value));
  return `/* Generated by tools/build-learn.js from content/learn. */\nwindow.LIMINAL_LEARN = ${json};\n`;
}

// "path:line: message", or "path: message" when no line applies.
function formatError(root, error) {
  const file = path.relative(process.cwd(), path.join(root, error.file)) || ".";
  return `${file}${error.line ? `:${error.line}` : ""}: ${error.message}`;
}

// Writes the bundle. With allowMissing, an absent root writes an empty
// bundle (tools/check-learn.js still fails on it) so the rest of the site
// builds; otherwise it is an error. Returns the number of pages written.
function build(options) {
  const settings = options || {};
  const root = settings.root || DEFAULT_ROOT;
  const out = settings.out || DEFAULT_OUT;
  const tree = readTree(root);
  if (!tree.exists && !settings.allowMissing) {
    console.error(`Learn build stopped: ${path.relative(process.cwd(), root) || root} does not exist.`);
    process.exit(1);
  }
  const loaded = loadLearn(tree);
  if (loaded.errors.length) {
    console.error(`Learn build stopped: ${loaded.errors.length} problem(s) in the Learn pages.`);
    loaded.errors.slice(0, 50).forEach((error) => console.error(`  ${formatError(root, error)}`));
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, bundleSource(loaded.pages, buildIndex(loaded.pages, readCatalog())));
  const count = Object.keys(loaded.pages).length;
  if (!tree.exists) {
    console.warn(`Learn: ${path.relative(ROOT, root)} is missing; wrote an empty Learn bundle.`);
  }
  return count;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--root" || arg === "--out") {
      if (!argv[index + 1]) throw new Error(`${arg} needs a path`);
      options[arg.slice(2)] = path.resolve(argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`unknown argument ${arg} (use --root <dir> and --out <file>)`);
    }
  }
  return options;
}

if (require.main === module) {
  const options = parseArgs(process.argv.slice(2));
  const count = build(options);
  console.log(`Built ${path.relative(process.cwd(), options.out || DEFAULT_OUT)} with ${count} Learn pages.`);
}

module.exports = {
  DEFAULT_ROOT,
  FACTS_FILE,
  GENERAL_PREFIX,
  readTree,
  readCatalog,
  parseFacts,
  loadLearn,
  buildIndex,
  bundleSource,
  formatError,
  build,
  parseArgs,
};
