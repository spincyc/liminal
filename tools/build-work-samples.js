#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { parseXml } = require("./lib/svg-tree.js");
const { sanitizeSvgTree } = require("../src/app/render.js");
const ROOT = path.resolve(__dirname, "..");
const DIRECTORY = path.join(ROOT, "content/work-samples");
const ROOT_METADATA = new Set(["xmlns", "role", "aria-label"]);

// The renderer supplies its own accessible name. Original standalone SVGs
// retain title/desc; every visible element and attribute must survive intact.
function visibleTree(node, root = true) {
  if (typeof node.text === "string") return node.text.trim() ? { text: node.text } : null;
  const attributes = node.attributes
    .filter(attribute => !(root && ROOT_METADATA.has(attribute.name)))
    .map(({ name, value }) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const children = node.children
    .filter(child => !(root && ["title", "desc"].includes(child.name)))
    .map(child => visibleTree(child, false)).filter(Boolean);
  return { name: node.name, attributes, children };
}

function loadSamples() {
  const entries = JSON.parse(fs.readFileSync(path.join(DIRECTORY, "manifest.json"), "utf8"));
  if (!Array.isArray(entries) || !entries.length) throw new Error("Work samples require a nonempty manifest array");
  const seen = new Set();
  return entries.map(entry => {
    if (!entry || !/^[a-z0-9-]+$/.test(entry.id) || seen.has(entry.id) ||
        !/^[a-z0-9-]+\.svg$/.test(entry.file)) throw new Error("Invalid work sample identity or filename");
    seen.add(entry.id);
    for (const field of ["title", "description", "courseId", "lessonId"]) {
      if (typeof entry[field] !== "string" || !entry[field].trim()) throw new Error(`Missing ${field} in ${entry.id}`);
    }
    if (!/^[a-z0-9-]+$/.test(entry.courseId) || !/^[a-z0-9-]+$/.test(entry.lessonId)) {
      throw new Error("Invalid work sample course/lesson reference: " + entry.id);
    }
    if (!Array.isArray(entry.transcript) || !entry.transcript.length ||
        entry.transcript.some(line => typeof line !== "string" || !line.trim())) {
      throw new Error("Missing work sample transcript: " + entry.id);
    }
    const svg = fs.readFileSync(path.join(DIRECTORY, entry.file), "utf8");
    const original = parseXml(svg);
    const clean = sanitizeSvgTree(original);
    if (!clean || JSON.stringify(visibleTree(original)) !== JSON.stringify(visibleTree(clean))) {
      throw new Error("Work sample contains unsupported SVG: " + entry.id);
    }
    for (const tag of ["title", "desc"]) {
      const metadata = original.children.filter(child => child.name === tag);
      if (metadata.length !== 1 || metadata[0].attributes.length ||
          !metadata[0].children.length || metadata[0].children.some(child => typeof child.text !== "string") ||
          !metadata[0].children.some(child => child.text.trim())) {
        throw new Error(`Work sample ${entry.id} requires one plain-text standalone ${tag}`);
      }
    }
    return { ...entry, svg };
  });
}

function build() {
  const samples = loadSamples();
  const output = path.join(ROOT, "dist/content");
  const images = path.join(output, "work-samples");
  fs.mkdirSync(images, { recursive: true });
  for (const sample of samples) fs.writeFileSync(path.join(images, sample.file), sample.svg);
  console.log(`Built ${samples.length} original work samples.`);
  return samples;
}

module.exports = { loadSamples, build };
if (require.main === module) build();
