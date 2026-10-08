"use strict";

// The one Liminal header. Every page in src/ carries the placeholder
// <!-- liminal:site-header --> where its header belongs; tools/build.js
// replaces it with render(page) in dist/, and tools/smoke-static.js fails if
// any built page's header differs from this rendering. The header is static
// HTML, so it works without JavaScript. Styles live in styles/brand.css.

const PLACEHOLDER = "<!-- liminal:site-header -->";

// The primary destinations, in order. `pages` lists other pages that belong
// to the destination: there the link is marked aria-current="true" (the
// current section) rather than "page".
const NAV = [
  { href: "curriculum.html", label: "Year plans", pages: ["high-school.html"] },
  { href: "weeks.html", label: "Weekly work" },
  { href: "courses.html", label: "Courses" },
  { href: "daily-reading.html", label: "Daily reading" },
  { href: "reading-level.html", label: "Reading level" },
  { href: "practice.html", label: "Test prep", pages: ["learn.html", "print.html"], section: true },
];

// Test prep has its own views (Practice, Progress, Review…) with their own
// page marker in the test-prep bar, so its primary link always marks the
// section.
function currentFor(item, page) {
  if (page === item.href) return item.section ? "true" : "page";
  return (item.pages || []).includes(page) ? "true" : null;
}

const SYMBOL =
  '<svg class="brand-symbol" viewBox="0 0 28 34" fill="none" aria-hidden="true" focusable="false">' +
  '<path d="M3 32V15a11 11 0 0 1 22 0v17M10 32V15a4 4 0 0 1 8 0v17" stroke="currentColor" stroke-width="2.5" />' +
  '<path d="M0 32h28" stroke="currentColor" stroke-width="2.5" /></svg>';

const MENU_ICON =
  '<svg class="lm-menu-icon" viewBox="0 0 20 14" aria-hidden="true" focusable="false">' +
  '<path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" stroke-width="2" /></svg>';

// The same links appear twice: inline at desktop widths, and inside a
// native <details> "Menu" on narrower screens, which needs no JavaScript and
// reports its expanded state itself. CSS shows exactly one of the two, so
// assistive technology meets one primary navigation.
function render(page) {
  const home = page === "index.html" ? ' aria-current="page"' : "";
  const links = NAV.map((item) => {
    const current = currentFor(item, page);
    return `<a href="${item.href}"${current ? ` aria-current="${current}"` : ""}>${item.label}</a>`;
  }).join("");
  return (
    '<header class="lm-header"><div class="lm-header-inner">' +
    `<a class="lm-brand" href="index.html" aria-label="Liminal home"${home}>${SYMBOL}` +
    '<span class="lm-brand-name">Liminal<span class="wordmark-dot">.</span></span></a>' +
    `<nav class="lm-nav" aria-label="Primary">${links}</nav>` +
    `<details class="lm-menu"><summary>${MENU_ICON}<span class="lm-menu-label">Menu</span></summary>` +
    `<nav class="lm-menu-nav" aria-label="Primary">${links}</nav></details>` +
    "</div></header>"
  );
}

// Replaces the placeholder; a page without exactly one placeholder is an error.
function apply(html, page) {
  const count = html.split(PLACEHOLDER).length - 1;
  if (count !== 1) throw new Error(`${page} must contain exactly one ${PLACEHOLDER} (found ${count})`);
  return html.replace(PLACEHOLDER, render(page));
}

// Problems with a built page's header, for the static smoke test.
function problems(html, page) {
  const found = [];
  if (html.includes(PLACEHOLDER)) found.push("the header placeholder was not replaced");
  const headers = html.match(/<header class="lm-header">[\s\S]*?<\/header>/g) || [];
  if (headers.length !== 1) found.push(`${headers.length} Liminal headers instead of 1`);
  else if (headers[0] !== render(page)) found.push("its header differs from the canonical header");
  // The inline nav and the Menu's copy, both from render(); none elsewhere.
  const primary = (html.match(/aria-label="Primary"/g) || []).length;
  if (primary !== 2) found.push(`${primary} primary navigation labels instead of the header's 2`);
  if (/<header class="(?:site-header|home-header)/.test(html)) found.push("it still has a page-specific header");
  return found;
}

module.exports = { PLACEHOLDER, NAV, render, apply, problems };
