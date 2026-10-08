"use strict";

// The one Liminal header. Every page in src/ carries the placeholder
// <!-- liminal:site-header --> where its header belongs; tools/build.js
// replaces it with render(page) in dist/, and tools/smoke-static.js fails if
// any built page's header differs from this rendering. The header is static
// HTML, so destinations remain reachable without JavaScript. The shared
// enhancer follows route changes. Styles live in styles/brand.css.

const PLACEHOLDER = "<!-- liminal:site-header -->";
const navigation = require("../../src/lib/navigation");
const NAV = navigation.PRIMARY;
const SCRIPTS = ["lib/navigation.js", "app/navigation.js"];

const SYMBOL =
  '<svg class="brand-symbol" viewBox="0 0 28 34" fill="none" aria-hidden="true" focusable="false">' +
  '<path d="M3 32V15a11 11 0 0 1 22 0v17M10 32V15a4 4 0 0 1 8 0v17" stroke="currentColor" stroke-width="2.5" />' +
  '<path d="M0 32h28" stroke="currentColor" stroke-width="2.5" /></svg>';

function escape(value) { return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function link(item, primary) {
  return `<a${primary ? ` data-lm-primary="${item.id}"` : ""} href="${escape(item.href)}"${item.current ? ` aria-current="${item.current}"` : ""}>${escape(item.label)}</a>`;
}

// One visible set of primary links at every width, followed by links within
// the current section. AP and test prep retain their own existing view bars.
function render(page) {
  const model = navigation.model({ pathname: page });
  const home = model.homeCurrent ? ' aria-current="page"' : "";
  return (
    '<header class="lm-header"><div class="lm-header-inner">' +
    `<a class="lm-brand" href="index.html" aria-label="Liminal home"${home}>${SYMBOL}` +
    '<span class="lm-brand-name">Liminal<span class="wordmark-dot">.</span></span></a>' +
    `<nav class="lm-nav" aria-label="Primary">${model.primary.map(item => link(item, true)).join("")}</nav>` +
    "</div>" +
    `<nav class="lm-subnav" aria-label="${model.secondaryLabel}"${model.secondary.length ? "" : " hidden"}>${model.secondary.map(item => link(item)).join("")}</nav>` +
    "</header>"
  );
}

// Replaces the placeholder; a page without exactly one placeholder is an error.
function apply(html, page) {
  const count = html.split(PLACEHOLDER).length - 1;
  if (count !== 1) throw new Error(`${page} must contain exactly one ${PLACEHOLDER} (found ${count})`);
  return html.replace(PLACEHOLDER, render(page) + SCRIPTS.map(src => `<script defer src="${src}"></script>`).join(""));
}

// Problems with a built page's header, for the static smoke test.
function problems(html, page) {
  const found = [];
  if (html.includes(PLACEHOLDER)) found.push("the header placeholder was not replaced");
  const headers = html.match(/<header class="lm-header">[\s\S]*?<\/header>/g) || [];
  if (headers.length !== 1) found.push(`${headers.length} Liminal headers instead of 1`);
  else if (headers[0] !== render(page)) found.push("its header differs from the canonical header");
  // One primary navigation, at all widths; no page-specific duplicate.
  const primary = (html.match(/aria-label="Primary"/g) || []).length;
  if (primary !== 1) found.push(`${primary} primary navigation labels instead of 1`);
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)];
  SCRIPTS.forEach(src => {
    const matches = scripts.filter(match => match[1] === src);
    if (matches.length !== 1 || !/\bdefer\b/.test(matches[0][0])) found.push(`${src} must load once with defer`);
  });
  const shared = scripts.filter(match => SCRIPTS.includes(match[1])).map(match => match[1]);
  if (shared.join(",") !== SCRIPTS.join(",")) found.push("shared navigation scripts are missing or out of order");
  if (/<header class="(?:site-header|home-header)/.test(html)) found.push("it still has a page-specific header");
  return found;
}

module.exports = { PLACEHOLDER, NAV, SCRIPTS, render, apply, problems };
