#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Smoke-tests the built site in dist/, exactly what GitHub Pages serves.
// Run `npm run build` first.
const root = path.resolve(__dirname, "..", "dist");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app", "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles", "app.css"), "utf8");

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index);
if (duplicateIds.length) {
  throw new Error(`Duplicate HTML IDs: ${[...new Set(duplicateIds)].join(", ")}`);
}

const requiredIds = [
  ...app.matchAll(/document\.getElementById\("([^"]+)"\)/g),
].map((match) => match[1]);
const missingIds = [...new Set(requiredIds)].filter((id) => !htmlIds.includes(id));
if (missingIds.length) {
  throw new Error(`app.js references missing HTML IDs: ${missingIds.join(", ")}`);
}

const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const braceBalance = [...cssWithoutComments].reduce(
  (balance, character) =>
    character === "{" ? balance + 1 : character === "}" ? balance - 1 : balance,
  0,
);
if (braceBalance !== 0) throw new Error("styles.css has unbalanced braces.");
for (const selector of [".skip-link", ":focus-visible", "@media", ".hidden"]) {
  if (!css.includes(selector)) throw new Error(`styles.css is missing ${selector}.`);
}

for (const asset of [
  "styles/tokens.css",
  "styles/app.css",
  "styles/test-shell.css",
  "lib/core.js",
  "lib/template-mask.js",
  "lib/runs.js",
  "content/templates.js",
  "lib/test-engine.js",
  "app/render.js",
  "app/test-shell.js",
  "app/site.js",
  "app/app.js",
  "content/catalog.js",
]) {
  if (!html.includes(`"${asset}"`)) {
    throw new Error(`index.html does not load ${asset}`);
  }
  if (!fs.existsSync(path.join(root, asset))) {
    throw new Error(`Referenced asset is missing: ${asset}`);
  }
}

const context = vm.createContext({ window: {} });
const catalogPath = path.join(root, "content/catalog.js");
vm.runInContext(fs.readFileSync(catalogPath, "utf8"), context, {
  filename: catalogPath,
});
const catalog = context.window.PRACTICE_CATALOG;
if (!catalog || !Array.isArray(catalog.sections) || catalog.sections.length !== 7) {
  throw new Error("Generated catalog did not register seven supported sections.");
}

for (const section of catalog.sections) {
  const bankPath = path.join(root, "content", `${section.key}.js`);
  if (!fs.existsSync(bankPath)) {
    throw new Error(`Generated bank is missing: ${section.key}.js`);
  }
  vm.runInContext(fs.readFileSync(bankPath, "utf8"), context, { filename: bankPath });
  const bank = context.window.PRACTICE_BANKS[section.key];
  if (!Array.isArray(bank) || bank.length !== catalog.targetPerSection) {
    throw new Error(
      `${section.key} registered ${bank && bank.length} items; expected ${catalog.targetPerSection}.`,
    );
  }
}

// Mini tests draw straight from the generated banks, so every blueprint must
// name a real section and that section must hold enough scoreable items.
const corePath = path.join(root, "lib", "core.js");
const coreModule = { exports: {} };
vm.runInContext(
  `(function (module, exports) {\n${fs.readFileSync(corePath, "utf8")}\n})`,
  context,
  { filename: corePath },
)(coreModule, coreModule.exports);
const practiceCore = coreModule.exports;

if (!Array.isArray(practiceCore.MINI_TEST_BLUEPRINTS) ||
  practiceCore.MINI_TEST_BLUEPRINTS.length === 0) {
  throw new Error("core.js did not export any mini test blueprints.");
}
for (const blueprint of practiceCore.MINI_TEST_BLUEPRINTS) {
  const bankBySection = {};
  for (const entry of blueprint.sections) {
    const bank = context.window.PRACTICE_BANKS[entry.sectionKey];
    if (!Array.isArray(bank)) {
      throw new Error(
        `Mini test "${blueprint.id}" references unknown section ${entry.sectionKey}.`,
      );
    }
    const scoreable = bank.filter((item) => item.responseType !== "essay");
    if (scoreable.length < entry.count) {
      throw new Error(
        `Mini test "${blueprint.id}" needs ${entry.count} scoreable ` +
        `${entry.sectionKey} items but only ${scoreable.length} exist.`,
      );
    }
    bankBySection[entry.sectionKey] = bank;
  }
  const built = practiceCore.buildMiniTest(bankBySection, blueprint, "smoke");
  const expected = practiceCore.blueprintTotal(blueprint);
  if (built.length !== expected) {
    throw new Error(
      `Mini test "${blueprint.id}" built ${built.length} items; expected ${expected}.`,
    );
  }
  if (new Set(built.map((item) => item.id)).size !== built.length) {
    throw new Error(`Mini test "${blueprint.id}" repeated a question.`);
  }
}

// The booklet page is a second entry point with its own DOM contract, and it
// builds full-length forms rather than mini tests.
const printHtml = fs.readFileSync(path.join(root, "print.html"), "utf8");
const printJs = fs.readFileSync(path.join(root, "app", "print.js"), "utf8");
const printIds = [...printHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const printDuplicates = printIds.filter((id, index) => printIds.indexOf(id) !== index);
if (printDuplicates.length) {
  throw new Error(`Duplicate print.html IDs: ${[...new Set(printDuplicates)].join(", ")}`);
}
const printRequired = [
  ...printJs.matchAll(/document\.getElementById\("([^"]+)"\)/g),
].map((match) => match[1]);
const printMissing = [...new Set(printRequired)].filter((id) => !printIds.includes(id));
if (printMissing.length) {
  throw new Error(`print.js references missing print.html IDs: ${printMissing.join(", ")}`);
}
for (const asset of [
  "styles/tokens.css",
  "styles/app.css",
  "lib/core.js",
  "lib/booklet.js",
  "app/site.js",
  "app/print.js",
]) {
  if (!printHtml.includes(`"${asset}"`)) {
    throw new Error(`print.html does not load ${asset}`);
  }
  if (!fs.existsSync(path.join(root, asset))) {
    throw new Error(`Referenced asset is missing: ${asset}`);
  }
}
if (!html.includes('href="print.html"')) {
  throw new Error("index.html does not link to the booklet page.");
}

// One design system: the shared tokens load before any stylesheet that reads
// them, and the shared header script before the page script that listens to
// it.
for (const [name, page, order] of [
  ["index.html", html, ["styles/tokens.css", "styles/app.css", "styles/test-shell.css", "app/site.js", "app/app.js"]],
  ["print.html", printHtml, ["styles/tokens.css", "styles/app.css", "app/site.js", "app/print.js"]],
]) {
  const positions = order.map((asset) => page.indexOf(`"${asset}"`));
  if (positions.some((position, index) => index && position < positions[index - 1])) {
    throw new Error(`${name} must load ${order.join(", then ")}.`);
  }
}

// One header on every page: the same test switch and the same nav links, in
// the same order.
function headerContract(page) {
  const header = (page.match(/<header class="site-header">[\s\S]*?<\/header>/) || [""])[0];
  return {
    tests: [...header.matchAll(/data-test-option="([^"]+)"/g)].map((match) => match[1]).join(","),
    nav: [...header.matchAll(/class="nav-link" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
      .map((match) => `${match[1]} ${match[2].trim()}`)
      .join(" | "),
  };
}
const indexHeader = headerContract(html);
const printHeader = headerContract(printHtml);
if (indexHeader.tests !== "SAT,ACT" || !indexHeader.nav.includes("print.html")) {
  throw new Error("index.html is missing the SAT | ACT switch or the Booklets link.");
}
if (JSON.stringify(indexHeader) !== JSON.stringify(printHeader)) {
  throw new Error(
    `print.html's header differs from index.html's: ${printHeader.nav} vs ${indexHeader.nav}`,
  );
}

const bookletPath = path.join(root, "lib", "booklet.js");
const bookletModule = { exports: {} };
vm.runInContext(
  `(function (module, exports, require) {\n${fs.readFileSync(bookletPath, "utf8")}\n})`,
  context,
  { filename: bookletPath },
)(bookletModule, bookletModule.exports, () => practiceCore);
const practiceBooklet = bookletModule.exports;

for (const blueprint of practiceCore.FULL_TEST_BLUEPRINTS) {
  const bankBySection = {};
  for (const entry of blueprint.sections) {
    bankBySection[entry.sectionKey] = context.window.PRACTICE_BANKS[entry.sectionKey];
  }
  const form = practiceCore.buildTestForm(bankBySection, blueprint, "smoke");
  const drawn = form.flatMap((group) => group.questions);
  const expected = practiceCore.blueprintTotal(blueprint);
  if (drawn.length !== expected) {
    throw new Error(
      `Form "${blueprint.id}" built ${drawn.length} items; expected ${expected}.`,
    );
  }
  if (new Set(drawn.map((item) => item.id)).size !== drawn.length) {
    throw new Error(`Form "${blueprint.id}" repeated a question across sections.`);
  }
  const model = practiceBooklet.buildModel(form, blueprint, "smoke");
  const rendered = practiceBooklet.renderBookletHtml(model);
  if ((rendered.match(/class="q"/g) || []).length !== expected) {
    throw new Error(`Form "${blueprint.id}" did not render every question.`);
  }
  practiceBooklet.renderKeyHtml(model);
  const texSource = practiceBooklet.renderTex(model);
  if (/[^\x00-\x7F]/.test(texSource)) {
    throw new Error(`Form "${blueprint.id}" emitted non-ASCII LaTeX source.`);
  }
}

const guidePath = path.join(root, "content/answer-signs.js");
if (!fs.existsSync(guidePath)) {
  throw new Error("Answer-signs guide is missing: content/answer-signs.js");
}
if (!html.includes('"content/answer-signs.js"')) {
  throw new Error("index.html does not load the answer-signs guide.");
}
vm.runInContext(fs.readFileSync(guidePath, "utf8"), context, { filename: guidePath });
const signs = context.window.PRACTICE_ANSWER_SIGNS;
if (!signs || !Array.isArray(signs.groups) || signs.groups.length === 0) {
  throw new Error("Answer-signs guide did not register any groups.");
}
for (const group of signs.groups) {
  if (!group.id || !group.test || !group.category || !Array.isArray(group.tells) || !group.tells.length) {
    throw new Error(`Answer-signs group is malformed: ${group.id || "(missing id)"}`);
  }
}

console.log(
  `Static smoke passed: ${requiredIds.length} DOM references, ` +
  `${catalog.sections.length} generated banks, ` +
  `${practiceCore.MINI_TEST_BLUEPRINTS.length} mini test blueprints, ` +
  `${practiceCore.FULL_TEST_BLUEPRINTS.length} printable full-length forms, and ` +
  `${signs.groups.length} answer-sign groups are present.`,
);

// SAT sections are built from templates, one bundle per section that loads
// lazily in the browser. Each built bundle must register its templates as a
// plain script, every template must be in the section's registry, and each
// must produce a verified question.
const templateContext = vm.createContext({ window: {} });
const templatesPath = path.join(root, "content", "templates.js");
vm.runInContext(fs.readFileSync(templatesPath, "utf8"), templateContext, { filename: templatesPath });
const registries = templateContext.window.PRACTICE_TEMPLATES || {};
const familyCounts = [];
for (const sectionKey of ["sat-math", "sat-reading-writing"]) {
  if (!app.includes(`"${sectionKey}"`)) throw new Error(`app.js does not list the ${sectionKey} template bundle.`);
  const bundlePath = path.join(root, "lib", "families", `${sectionKey}.js`);
  if (!fs.existsSync(bundlePath)) throw new Error(`Template bundle is missing: lib/families/${sectionKey}.js`);
  const context = vm.createContext({});
  context.self = context;
  vm.runInContext(fs.readFileSync(bundlePath, "utf8"), context, { filename: bundlePath });
  const families = (context.LiminalFamilies || {})[sectionKey] || [];
  if (families.length === 0) throw new Error(`No ${sectionKey} templates registered.`);
  const registered = new Set(((registries[sectionKey] || {}).templates || [])
    .filter((entry) => !entry.retired)
    .map((entry) => entry.id));
  for (const family of families) {
    if (!registered.has(family.id)) throw new Error(`${sectionKey} template ${family.id} is not in the registry.`);
    const record = context.LiminalFamilyShared.instantiate(family, "smoke");
    if (!record.verified) throw new Error(`${sectionKey} template ${family.id} produced an unverified question.`);
  }
  familyCounts.push(`${families.length} ${sectionKey}`);
}
console.log(`Static smoke: template bundles load as browser scripts (${familyCounts.join(", ")}).`);
