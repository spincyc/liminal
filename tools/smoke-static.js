#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { templateParityProblems } = require("./lib/template-parity");

// Smoke-tests the built site in dist/, exactly what GitHub Pages serves.
// Run `npm run build` first.
const root = path.resolve(__dirname, "..", "dist");
const html = fs.readFileSync(path.join(root, "practice.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles", "app.css"), "utf8");

// Every script practice.html loads, in order. Each must at least compile.
const practiceScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);
for (const script of practiceScripts) {
  const file = path.join(root, script);
  if (!fs.existsSync(file)) throw new Error(`practice.html loads a missing script: ${script}`);
  new vm.Script(fs.readFileSync(file, "utf8"), { filename: script });
}
// The page's own scripts (app.js and the views) are where DOM ids are used.
const appScripts = practiceScripts.filter((script) => script.startsWith("app/"));
const appSources = appScripts.map((script) => fs.readFileSync(path.join(root, script), "utf8"));

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index);
if (duplicateIds.length) {
  throw new Error(`Duplicate HTML IDs: ${[...new Set(duplicateIds)].join(", ")}`);
}

// Direct lookups and the views' byId("...") helper.
const requiredIds = appSources.flatMap((source) => [
  ...source.matchAll(/(?:document\.getElementById|\bbyId)\("([^"]+)"\)/g),
].map((match) => match[1]));
const missingIds = [...new Set(requiredIds)].filter((id) => !htmlIds.includes(id));
if (missingIds.length) {
  throw new Error(`practice.html's app scripts reference missing HTML IDs: ${missingIds.join(", ")}`);
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

const VIEW_SCRIPTS = ["app/views/practice.js", "app/views/progress.js", "app/views/review.js", "app/views/tips.js"];
for (const asset of [
  "styles/tokens.css",
  "styles/app.css",
  "styles/test-shell.css",
  "styles/math.css",
  "lib/core.js",
  "lib/template-mask.js",
  "lib/question-identity.js",
  "lib/runs.js",
  "lib/modules.js",
  "lib/simulation.js",
  "content/templates.js",
  "lib/test-engine.js",
  "lib/session-store.js",
  "lib/annotations.js",
  "lib/line-reader.js",
  "lib/progress.js",
  "lib/review-queue.js",
  "lib/practice.js",
  "lib/analytics.js",
  "lib/progress-io.js",
  "app/render.js",
  "app/test-shell.js",
  "app/site.js",
  ...VIEW_SCRIPTS,
  "app/app.js",
  "content/catalog.js",
]) {
  if (!html.includes(`"${asset}"`)) {
    throw new Error(`practice.html does not load ${asset}`);
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
  const activeTarget = section.targetQuestions ?? catalog.targetPerSection;
  const archiveTarget = section.archive?.targetQuestions || 0;
  if (!Array.isArray(bank) || bank.length !== activeTarget + archiveTarget) {
    throw new Error(
      `${section.key} registered ${bank && bank.length} items; expected ${activeTarget + archiveTarget}.`,
    );
  }
  if (section.archive) {
    const minimum = section.activeQuestionIdMin;
    if (!Number.isInteger(minimum)) throw new Error(`${section.key}: archive needs an active ID boundary.`);
    const validIds = bank.every((question) => new RegExp(`^${section.key}-\\d{4}$`).test(question.id));
    const active = bank.filter((question) => Number(question.id.slice(-4)) >= minimum);
    const archived = bank.filter((question) => Number(question.id.slice(-4)) < minimum);
    if (!validIds || new Set(bank.map((question) => question.id)).size !== bank.length ||
        active.length !== activeTarget || archived.length !== archiveTarget) {
      throw new Error(`${section.key}: expected ${activeTarget} active and ${archiveTarget} archived unique records.`);
    }
    if (active.some((question) => !question.passageId || !question.stimulus)) {
      throw new Error(`${section.key}: active shared passages were not hydrated.`);
    }
    const figures = new Map((context.window.PRACTICE_PASSAGES[section.key] || [])
      .filter((passage) => passage.figure).map((passage) => [passage.id, passage.figure]));
    if (active.some((question) => figures.has(question.passageId) &&
        JSON.stringify(question.figure) !== JSON.stringify(figures.get(question.passageId)))) {
      throw new Error(`${section.key}: shared passage figures were not hydrated.`);
    }
  }
}

// Mini tests draw straight from the generated banks, so every blueprint must
// name a real section and that section must hold enough scoreable items.
const corePath = path.join(root, "lib", "core.js");
const coreModule = { exports: {} };
vm.runInContext(
  `(function (module, exports, require) {\n${fs.readFileSync(corePath, "utf8")}\n})`,
  context,
  { filename: corePath },
)(coreModule, coreModule.exports, (name) => {
  if (name !== "../../content/catalog.json") throw new Error(`Unexpected core dependency ${name}`);
  return catalog;
});
const practiceCore = coreModule.exports;

if (!Array.isArray(practiceCore.MINI_TEST_BLUEPRINTS) ||
  practiceCore.MINI_TEST_BLUEPRINTS.length === 0) {
  throw new Error("core.js did not export any mini test blueprints.");
}
for (const blueprint of practiceCore.MINI_TEST_BLUEPRINTS) {
  if (!practiceCore.blueprintAvailable(blueprint)) continue;
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
// SAT booklets are built from templates, so the booklet page loads the
// registries, the run and module logic, and the renderer.
for (const asset of [
  "styles/tokens.css",
  "styles/app.css",
  "content/templates.js",
  "lib/core.js",
  "lib/template-mask.js",
  "lib/question-identity.js",
  "lib/runs.js",
  "lib/modules.js",
  "lib/booklet.js",
  "lib/progress.js",
  "app/render.js",
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
  throw new Error("practice.html does not link to the booklet page.");
}

// The booklet renderer belongs to the booklet page; the practice page never
// needs it.
if (html.includes('"lib/booklet.js"')) throw new Error("practice.html loads lib/booklet.js, which it does not use.");

// One design system: the shared tokens load before any stylesheet that reads
// them, and the shared header script before the page script that listens to
// it. The practice page's logic loads before its views, and its views before
// app.js, which builds them; the module blueprint loads before the test state
// machine and the run builder that read it; the test engine before the
// session store that reads saved sets with it; the passage tools load before
// the test screen that uses them.
for (const [name, page, order] of [
  ["practice.html", html, [
    "styles/tokens.css", "styles/app.css", "styles/test-shell.css", "styles/math.css",
    "lib/core.js", "lib/template-mask.js", "lib/question-identity.js", "lib/runs.js", "lib/modules.js", "lib/simulation.js",
    "lib/test-engine.js", "lib/session-store.js",
    "lib/annotations.js", "lib/line-reader.js",
    "lib/progress.js", "lib/review-queue.js", "lib/practice.js", "lib/analytics.js", "lib/progress-io.js",
    "app/test-shell.js", "app/site.js", ...VIEW_SCRIPTS, "app/app.js",
  ]],
  ["print.html", printHtml, [
    "styles/tokens.css", "styles/app.css",
    "lib/template-mask.js", "lib/question-identity.js", "lib/runs.js", "lib/modules.js", "lib/progress.js", "app/site.js", "app/print.js",
  ]],
]) {
  const positions = order.map((asset) => page.indexOf(`"${asset}"`));
  if (positions.some((position, index) => index && position < positions[index - 1])) {
    throw new Error(`${name} must load ${order.join(", then ")}.`);
  }
}

// The test-prep pages share the test switch and module navigation.
function headerContract(page) {
  const header = (page.match(/<header class="site-header">[\s\S]*?<\/header>/) || [""])[0];
  return {
    tests: [...header.matchAll(/data-test-option="([^"]+)"/g)].map((match) => match[1]).join(","),
    nav: [...header.matchAll(/class="nav-link" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
      .map((match) => `${match[1]} ${match[2].trim()}`)
      .join(" | "),
  };
}
// The Learn page is a third entry point with its own DOM contract.
const learnFile = path.join(root, "learn.html");
if (fs.existsSync(learnFile)) {
  const learnHtml = fs.readFileSync(learnFile, "utf8");
  const learnIds = [...learnHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const learnDuplicates = learnIds.filter((id, index) => learnIds.indexOf(id) !== index);
  if (learnDuplicates.length) {
    throw new Error(`Duplicate learn.html IDs: ${[...new Set(learnDuplicates)].join(", ")}`);
  }
  const learnOrder = [
    "styles/tokens.css", "styles/app.css", "styles/learn.css",
    "content/learn-sat.js", "lib/learn-markup.js", "app/site.js", "app/learn.js",
  ];
  for (const asset of learnOrder) {
    if (!learnHtml.includes(`"${asset}"`)) throw new Error(`learn.html does not load ${asset}`);
    if (!fs.existsSync(path.join(root, asset))) throw new Error(`Referenced asset is missing: ${asset}`);
  }
  const learnPositions = learnOrder.map((asset) => learnHtml.indexOf(`"${asset}"`));
  if (learnPositions.some((position, index) => index && position < learnPositions[index - 1])) {
    throw new Error(`learn.html must load ${learnOrder.join(", then ")}.`);
  }
}
if (!html.includes('href="learn.html"')) throw new Error("practice.html does not link to the Learn page.");

const practiceHeader = headerContract(html);
if (!practiceHeader.nav.includes("courses.html Courses")) throw new Error("The course library is not reachable from navigation.");
if (practiceHeader.tests !== "SAT,ACT" || !practiceHeader.nav.includes("print.html") ||
  !practiceHeader.nav.includes("learn.html Learn")) {
  throw new Error("practice.html is missing the SAT | ACT switch, the Learn link, or the Booklets link.");
}
for (const page of ["print.html", "learn.html"]) {
  const file = path.join(root, page);
  if (page !== "print.html" && !fs.existsSync(file)) continue;
  const other = headerContract(fs.readFileSync(file, "utf8"));
  if (JSON.stringify(practiceHeader) !== JSON.stringify(other)) {
    throw new Error(`${page}'s header differs from practice.html's: ${other.nav} vs ${practiceHeader.nav}`);
  }
}

// Classroom courses are a separate entry point; all their local assets must
// survive the static build without loading a test-prep session or remote library.
const courseHtml = fs.readFileSync(path.join(root, "courses.html"), "utf8");
for (const match of courseHtml.matchAll(/(?:src|href)="([^"#]+\.(?:js|css|svg))"/g)) {
  if (!fs.existsSync(path.join(root, match[1]))) throw new Error("Missing course asset: " + match[1]);
}
if (!courseHtml.includes('src="content/courses.js"') || !courseHtml.includes('src="app/courses.js"')) {
  throw new Error("Courses is missing its content or application entry point.");
}

// The library entrance is usable without the test-prep application or its
// storage. Check its links/assets separately from the practice DOM contract.
const homeHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const target of ["courses.html", "curriculum.html#common-core-math/k", "curriculum.html#common-core-reading/k", "curriculum.html#singapore-math/k", "practice.html?test=SAT#practice", "practice.html?test=ACT#practice", "learn.html", "print.html"]) {
  if (!homeHtml.includes(`href="${target}"`)) throw new Error("Home is missing a module link: " + target);
}
const homeIds = [...homeHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(homeIds).size !== homeIds.length) throw new Error("Home has duplicate element IDs");
for (const match of homeHtml.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1];
  if (/^(https?:|mailto:|data:)/.test(target)) continue;
  if (!fs.existsSync(path.join(root, target.split(/[?#]/)[0]))) throw new Error("Missing home link/asset: " + target);
}
const homeScripts = [...homeHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
if (!homeScripts.includes("app/home.js") || homeScripts.some(script => script !== "app/home.js")) throw new Error("Home must load only its bookmark compatibility script");
new vm.Script(fs.readFileSync(path.join(root, "app/home.js"), "utf8"), { filename: "app/home.js" });

// Planning data remains separate from ready-to-study courses and saved work.
const planHtml = fs.readFileSync(path.join(root, "curriculum.html"), "utf8");
const planScripts = [...planHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
if (JSON.stringify(planScripts) !== JSON.stringify(["content/curriculum.js", "content/weekly-index.js", "lib/curriculum.js", "lib/weekly.js", "app/curriculum.js"])) {
  throw new Error("Curriculum scripts are missing or out of order");
}
for (const match of planHtml.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1].split(/[?#]/)[0];
  if (!/^https?:/.test(target) && !fs.existsSync(path.join(root, target))) throw new Error("Missing curriculum asset: " + target);
}
const planIds = [...planHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(planIds).size !== planIds.length) throw new Error("Duplicate curriculum element IDs");
const planSource = fs.readFileSync(path.join(root, "app/curriculum.js"), "utf8");
for (const match of planSource.matchAll(/document\.getElementById\("([^"]+)"\)/g)) {
  if (match[1] !== "planHeading" && !planIds.includes(match[1])) throw new Error("Missing curriculum element " + match[1]);
}
planScripts.forEach(script => new vm.Script(fs.readFileSync(path.join(root, script), "utf8")));
const planContext = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, "content/curriculum.js"), "utf8"), planContext);
const planData = planContext.window.LIMINAL_CURRICULUM;
if (!planData || planData.tracks.length !== 3 || planData.tracks.some(t => t.courses.length !== 13)) throw new Error("Incomplete curriculum bundle");
if (JSON.stringify(planData) !== JSON.stringify(JSON.parse(fs.readFileSync(path.join(root, "content/curriculum.json"), "utf8")))) {
  throw new Error("Downloadable curriculum differs from the browser plans");
}

// Weekly course bodies load on demand; the index never embeds answer keys.
const weeklyHtml = fs.readFileSync(path.join(root, "weeks.html"), "utf8");
const weeklyScripts = [...weeklyHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
if (JSON.stringify(weeklyScripts) !== JSON.stringify(["content/weekly-index.js", "lib/weekly.js", "app/render.js", "app/weekly-render.js", "app/weekly.js"])) {
  throw new Error("Weekly scripts are missing or out of order");
}
for (const match of weeklyHtml.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1].split(/[?#]/)[0];
  if (!/^https?:/.test(target) && !fs.existsSync(path.join(root, target))) throw new Error("Missing weekly asset: " + target);
}
const weeklyIds = [...weeklyHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(weeklyIds).size !== weeklyIds.length) throw new Error("Duplicate weekly element IDs");
weeklyScripts.forEach(script => new vm.Script(fs.readFileSync(path.join(root, script), "utf8")));
const weeklyContext = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, "content/weekly-index.js"), "utf8"), weeklyContext);
const weeklyIndex = weeklyContext.window.LIMINAL_WEEKLY_INDEX;
const weeklyJson = JSON.parse(fs.readFileSync(path.join(root, "content/weekly-index.json"), "utf8"));
if (!weeklyIndex || weeklyIndex.version !== 1 || JSON.stringify(weeklyIndex) !== JSON.stringify(weeklyJson)) {
  throw new Error("Weekly index differs from downloadable index");
}
const weeklyBuild = require("./build-weekly");
const weeklySource = weeklyBuild.loadWeekly();
if (JSON.stringify(weeklyJson) !== JSON.stringify(weeklySource.index)) throw new Error("Weekly index differs from source courses");
for (let i = 0; i < weeklyJson.courses.length; i++) {
  const entry = weeklyJson.courses[i];
  if (!/^content\/weekly\/(?:(?:common-core-math|common-core-reading|singapore-math)\/(?:k|[1-9]|1[0-2])|high-school-math\/(?:algebra|geometry|algebra-2|trigonometry|calculus))\.json$/.test(entry.file)) throw new Error("Unsafe weekly course path");
  const built = JSON.parse(fs.readFileSync(path.join(root, entry.file), "utf8"));
  if (JSON.stringify(built) !== JSON.stringify(weeklySource.courses[i])) throw new Error("Weekly course differs from source: " + entry.file);
}

// The named sequence shares validated plans but never assigns a fixed grade.
const highSchoolHtml = fs.readFileSync(path.join(root, "high-school.html"), "utf8");
const highSchoolScripts = [...highSchoolHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
if (JSON.stringify(highSchoolScripts) !== JSON.stringify(["content/high-school.js", "content/weekly-index.js", "lib/high-school.js", "lib/weekly.js", "app/high-school.js"])) throw new Error("High-school scripts are missing or out of order");
for (const match of highSchoolHtml.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1].split(/[?#]/)[0];
  if (!/^https?:/.test(target) && !fs.existsSync(path.join(root, target))) throw new Error("Missing high-school asset: " + target);
}
const highSchoolIds = [...highSchoolHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(highSchoolIds).size !== highSchoolIds.length) throw new Error("Duplicate high-school element IDs");
highSchoolScripts.forEach(script => new vm.Script(fs.readFileSync(path.join(root, script), "utf8")));
const highSchoolContext = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, "content/high-school.js"), "utf8"), highSchoolContext);
const highSchoolData = highSchoolContext.window.LIMINAL_HIGH_SCHOOL;
const highSchoolJson = JSON.parse(fs.readFileSync(path.join(root, "content/high-school.json"), "utf8"));
if (!highSchoolData || JSON.stringify(highSchoolData) !== JSON.stringify(highSchoolJson) || JSON.stringify(highSchoolJson) !== JSON.stringify(weeklySource.highSchool)) throw new Error("High-school plan bundle differs from source or download");

// Every page names its icon, which is built with it, so no page asks the
// server for a favicon.ico that is not there.
for (const page of ["index.html", "practice.html", "learn.html", "print.html", "courses.html", "curriculum.html", "weeks.html", "high-school.html"]) {
  const file = path.join(root, page);
  if (!fs.existsSync(file)) continue;
  const icon = (fs.readFileSync(file, "utf8").match(/<link rel="icon" href="([^"]+)"/) || [])[1];
  if (!icon) throw new Error(`${page} does not link a favicon.`);
  if (!icon.startsWith("data:") && !fs.existsSync(path.join(root, icon))) {
    throw new Error(`${page}'s favicon is missing: ${icon}`);
  }
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
  if (!practiceCore.blueprintAvailable(blueprint)) continue;
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
  throw new Error("practice.html does not load the answer-signs guide.");
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
  `Static smoke passed: ${practiceScripts.length} scripts compile, ` +
  `${new Set(requiredIds).size} DOM ids in ${appScripts.length} app scripts, ` +
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
const progressSource = fs.readFileSync(path.join(root, "lib", "progress.js"), "utf8");
for (const sectionKey of ["sat-math", "sat-reading-writing"]) {
  if (!progressSource.includes(`"${sectionKey}"`)) {
    throw new Error(`lib/progress.js does not list the ${sectionKey} template section.`);
  }
  const bundlePath = path.join(root, "lib", "families", `${sectionKey}.js`);
  if (!fs.existsSync(bundlePath)) throw new Error(`Template bundle is missing: lib/families/${sectionKey}.js`);
  const context = vm.createContext({});
  context.self = context;
  vm.runInContext(fs.readFileSync(bundlePath, "utf8"), context, { filename: bundlePath });
  const families = (context.LiminalFamilies || {})[sectionKey] || [];
  if (families.length === 0) throw new Error(`No ${sectionKey} templates registered.`);
  const [test, ...section] = sectionKey.split("-");
  const problems = templateParityProblems({ sectionKey, families, registry: registries[sectionKey] || {},
    nodeFamilies: require(path.join(__dirname, "../src/lib/families", test, section.join("-"))),
    instantiate: context.LiminalFamilyShared.instantiate,
    nodeInstantiate: require("../src/lib/families/shared").instantiate,
  });
  if (problems.length) throw new Error(problems.slice(0, 10).join("\n"));
  familyCounts.push(`${families.length} ${sectionKey}`);
}
console.log(`Static smoke: template bundles load as browser scripts (${familyCounts.join(", ")}).`);
