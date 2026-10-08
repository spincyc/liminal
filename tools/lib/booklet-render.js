"use strict";

// Node booklets share the browser's SVG allow-list. Parse XML using the same
// tooling parser as figure validation, then serialize only the sanitized tree.
// Content never becomes trusted markup, and malformed SVG retains its alt text.
const { parseXml } = require("./svg-tree.js");
const { sanitizeSvgTree, svgSize, parseUnderlines } = require("../../src/app/render.js");
const { escapeHtml, blocksToHtml } = require("../../src/lib/booklet.js");

function svgHtml(node) {
  if (typeof node.text === "string") return escapeHtml(node.text);
  const attributes = node.attributes.map(({ name, value }) => ` ${name}="${escapeHtml(value)}"`).join("");
  return `<${node.name}${attributes}>${node.children.map(svgHtml).join("")}</${node.name}>`;
}

function figure(figure) {
  if (!figure) return "";
  const alt = String(figure.alt || "Figure").trim() || "Figure";
  let tree = null;
  try {
    if (figure.svg) tree = sanitizeSvgTree(parseXml(figure.svg));
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }
  let drawing;
  if (tree) {
    const size = svgSize(tree);
    tree.attributes = tree.attributes.filter(({ name }) => !["width", "height", "viewBox"].includes(name));
    if (size) tree.attributes.push({ name: "viewBox", value: size.viewBox });
    tree.attributes.push({ name: "role", value: "img" }, { name: "aria-label", value: alt }, { name: "focusable", value: "false" });
    drawing = svgHtml(tree);
  } else {
    drawing = `<p class="lm-figure-fallback">Diagram description (drawing unavailable): ${escapeHtml(alt)}</p>`;
  }
  return `<figure class="lm-figure">${drawing}` +
    (figure.notToScale ? '<figcaption class="lm-figure-note">Note: Figure not drawn to scale.</figcaption>' : "") +
    "</figure>";
}

function stimulus(stimulus, question) {
  const inline = question.sectionKey === "act-english" ? (text) =>
    parseUnderlines(text).map((segment) => {
      if (segment.marker !== undefined) {
        return `<span class="lm-ul-marker" aria-label="Point ${segment.marker}">${segment.marker}</span>`;
      }
      if (segment.underline !== undefined) {
        return `<span class="lm-ul"><u>${escapeHtml(segment.text)}</u>` +
          `<span class="lm-ul-n" aria-label="Underlined portion ${segment.underline}">${segment.underline}</span></span>`;
      }
      return escapeHtml(segment.text);
    }).join("") : escapeHtml;
  return `<div class="lm-stimulus">${blocksToHtml(stimulus.content, { inline })}</div>`;
}

module.exports = { figure, stimulus, parseUnderlines };
