"use strict";

// Admission for weekly-course figure files. Figures are standalone SVG files
// under content/weekly/figures/<track>/<course>/<figureId>.svg. The browser
// rebuilds every figure through render.js's allow-list, so a file is admitted
// only when that sanitizer keeps every element, attribute and text node
// (a loss-free round trip). That excludes markers, defs, clip paths, styles,
// scripts, links, images and external references; arrowheads are polygons.
// Paint is currentColor only, so figures follow dark mode and print black.

const fs = require("node:fs");
const path = require("node:path");
const { parseXml } = require("./svg-tree.js");
const { SVG_NS, sanitizeSvgTree } = require("../../src/app/render.js");

const MAX_FIGURE_BYTES = 12 * 1024;
const FIGURE_ID = /^[a-z0-9][a-z0-9-]*$/;
const PAINT = new Set(["none", "currentColor", "transparent"]);
// Root attributes that standalone viewers need and the renderer replaces.
const ROOT_ONLY = new Set(["xmlns"]);

function fail(message, where) { throw new Error("Weekly figure " + where + ": " + message); }

function visible(node, root) {
  if (typeof node.text === "string") return node.text.trim() ? { text: node.text } : null;
  return {
    name: node.name,
    attributes: node.attributes.filter(a => !(root && ROOT_ONLY.has(a.name))).map(({ name, value }) => ({ name, value: String(value).trim() }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    children: node.children.map(child => visible(child, false)).filter(Boolean),
  };
}

// Throws unless `svg` is an admissible figure; returns its parsed tree.
function checkFigureSvg(svg, where = "figure") {
  if (typeof svg !== "string" || !svg.trim()) fail("is empty", where);
  const bytes = Buffer.byteLength(svg, "utf8");
  if (bytes > MAX_FIGURE_BYTES) fail(`is ${bytes} bytes; the limit is ${MAX_FIGURE_BYTES}`, where);
  if (/<!DOCTYPE|<!ENTITY/i.test(svg)) fail("declares a doctype or entity", where);
  let tree;
  try { tree = parseXml(svg); } catch (error) { fail("is not well-formed XML (" + error.message + ")", where); }
  if (tree.name !== "svg" || tree.namespace !== SVG_NS) fail("root must be <svg> in the SVG namespace", where);
  const viewBox = tree.attributes.find(a => a.name === "viewBox");
  const parts = viewBox ? viewBox.value.trim().split(/[\s,]+/).map(Number) : [];
  if (parts.length !== 4 || !parts.every(Number.isFinite) || parts[2] <= 0 || parts[3] <= 0) fail("needs a positive viewBox", where);
  const clean = sanitizeSvgTree(tree);
  if (!clean || JSON.stringify(visible(tree, true)) !== JSON.stringify(visible(clean, true))) {
    fail("uses SVG the renderer drops (allowed elements: svg, g, line, polyline, polygon, circle, ellipse, rect, path, text, tspan; no markers, defs, clip paths, styles, scripts, links or external references)", where);
  }
  (function paint(node) {
    if (typeof node.text === "string") return;
    for (const attribute of node.attributes) {
      if ((attribute.name === "fill" || attribute.name === "stroke") && !PAINT.has(attribute.value.trim())) {
        fail(`uses ${attribute.name}="${attribute.value}"; use currentColor, none or transparent (with opacity for tints)`, where);
      }
    }
    node.children.forEach(paint);
  })(tree);
  if (!clean.children.length) fail("draws nothing", where);
  return tree;
}

// Every figure file in one course's directory, as a Map id -> svg text.
function loadFigureDirectory(directory, where) {
  const figures = new Map();
  if (!fs.existsSync(directory)) return figures;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const name = entry.name;
    if (!entry.isFile() || !name.endsWith(".svg") || !FIGURE_ID.test(name.slice(0, -4))) fail("unexpected entry " + name, where);
    const svg = fs.readFileSync(path.join(directory, name), "utf8");
    checkFigureSvg(svg, where + "/" + name);
    figures.set(name.slice(0, -4), svg);
  }
  return figures;
}

module.exports = { MAX_FIGURE_BYTES, FIGURE_ID, checkFigureSvg, loadFigureDirectory };
