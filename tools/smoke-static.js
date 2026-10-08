#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { templateParityProblems } = require("./lib/template-parity");
const siteHeader = require("./lib/site-header");

// Shared header scripts have their own contract below; keep each page's
// content/application order check independent of that enhancement.
function pageScripts(page) {
  return [...page.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1])
    .filter(script => !siteHeader.SCRIPTS.includes(script));
}

// Smoke-tests the built site in dist/, exactly what GitHub Pages serves.
// Run `npm run build` first.
const root = path.resolve(__dirname, "..", "dist");
// Reader/plan templates share the same controls, including their print hiding
// and keyboard treatment. Keep their assets present and loaded before use.
for (const page of ["daily-reading", "weeks", "courses", "curriculum", "high-school", "ap", "reading-level", "learn"]) {
  const template = fs.readFileSync(path.join(root, page + ".html"), "utf8");
  if (!template.includes('href="styles/reader-controls.css"')) throw new Error(page + " must load the shared reader controls");
  if (["daily-reading", "weeks", "courses"].includes(page)) {
    const scripts = pageScripts(template), entry = page === "weeks" ? "weekly" : page;
    const shared = scripts.indexOf("app/reader-controls.js"), app = scripts.indexOf("app/" + entry + ".js");
    if (shared < 0 || app <= shared) throw new Error(page + " must load reader controls before its application");
  }
}
for (const asset of ["styles/reader-controls.css", "app/reader-controls.js"]) {
  if (!fs.existsSync(path.join(root, asset))) throw new Error("Missing shared reader asset: " + asset);
}
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
  "lib/assessment.js",
  "lib/assessment-adapters.js",
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
  "lib/assessment.js",
  "lib/assessment-adapters.js",
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
    "lib/assessment.js", "lib/assessment-adapters.js", "lib/test-engine.js", "lib/session-store.js",
    "lib/annotations.js", "lib/line-reader.js",
    "lib/progress.js", "lib/review-queue.js", "lib/practice.js", "lib/analytics.js", "lib/progress-io.js",
    "app/test-shell.js", "app/site.js", ...VIEW_SCRIPTS, "app/app.js",
  ]],
  ["print.html", printHtml, [
    "styles/tokens.css", "styles/app.css",
    "lib/template-mask.js", "lib/question-identity.js", "lib/runs.js", "lib/modules.js", "lib/assessment.js", "lib/assessment-adapters.js", "lib/booklet.js", "lib/progress.js", "app/site.js", "app/print.js",
  ]],
]) {
  const positions = order.map((asset) => page.indexOf(`"${asset}"`));
  if (positions.some((position, index) => index && position < positions[index - 1])) {
    throw new Error(`${name} must load ${order.join(", then ")}.`);
  }
}

// Every page carries the one Liminal header, exactly as tools/lib/site-header.js
// renders it for that page: the wordmark, the same primary navigation, and
// aria-current on the page or section shown.
const builtPages = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();
for (const page of builtPages) {
  const found = siteHeader.problems(fs.readFileSync(path.join(root, page), "utf8"), page);
  if (found.length) throw new Error(`${page}: ${found.join("; ")}`);
}
for (const item of siteHeader.NAV) {
  if (!builtPages.includes(item.href)) throw new Error(`The primary navigation links to a missing page: ${item.href}`);
}
for (const script of siteHeader.SCRIPTS) {
  if (!fs.existsSync(path.join(root, script))) throw new Error("Missing shared navigation script: " + script);
  new vm.Script(fs.readFileSync(path.join(root, script), "utf8"), { filename: script });
}
// Grouping the primary destinations must not strand a former destination.
const linkedPages = new Set(builtPages.flatMap(page => [...siteHeader.render(page).matchAll(/href="([^"]+)"/g)]
  .map(match => match[1].split(/[?#]/)[0])));
for (const page of ["curriculum.html", "weeks.html", "courses.html", "high-school.html", "daily-reading.html", "reading-level.html", "ap.html", "practice.html"]) {
  if (!linkedPages.has(page)) throw new Error(`Shared navigation does not reach ${page}`);
}

// The test-prep pages share a bar beneath it: the test switch and their views.
function headerContract(page) {
  const header = (page.match(/<div class="site-header prep-bar">[\s\S]*?<\/nav>/) || [""])[0];
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
for (const target of ["curriculum.html", "courses.html", "high-school.html", "daily-reading.html", "ap.html", "practice.html?test=SAT#practice", "practice.html?test=ACT#practice", "learn.html", "print.html"]) {
  if (!homeHtml.includes(`href="${target}"`)) throw new Error("Home is missing a module link: " + target);
}
const homeIds = [...homeHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(homeIds).size !== homeIds.length) throw new Error("Home has duplicate element IDs");
for (const match of homeHtml.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1];
  if (/^(https?:|mailto:|data:)/.test(target)) continue;
  if (!fs.existsSync(path.join(root, target.split(/[?#]/)[0]))) throw new Error("Missing home link/asset: " + target);
}
const homeScripts = pageScripts(homeHtml);
if (!homeScripts.includes("app/home.js") || homeScripts.some(script => script !== "app/home.js")) throw new Error("Home must load only its bookmark compatibility script");
new vm.Script(fs.readFileSync(path.join(root, "app/home.js"), "utf8"), { filename: "app/home.js" });

// Planning data remains separate from ready-to-study courses and saved work.
const planHtml = fs.readFileSync(path.join(root, "curriculum.html"), "utf8");
const planScripts = pageScripts(planHtml);
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
const weeklyScripts = pageScripts(weeklyHtml);
if (JSON.stringify(weeklyScripts) !== JSON.stringify(["content/weekly-index.js", "lib/weekly.js", "app/render.js", "app/weekly-render.js", "app/reader-controls.js", "app/weekly.js"])) {
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
const weeklyLib = require("../src/lib/weekly");
const namedPaths = weeklyLib.NAMED_TRACK_IDS.map(id => id + "\\/(?:" + weeklyLib.namedCourses(id).join("|") + ")");
const weeklyCoursePath = new RegExp("^content\\/weekly\\/(?:(?:" + weeklyLib.GRADE_TRACKS.join("|") + ")\\/(?:k|[1-9]|1[0-2])|" + namedPaths.join("|") + ")\\.json$");
for (let i = 0; i < weeklyJson.courses.length; i++) {
  const entry = weeklyJson.courses[i];
  if (!weeklyCoursePath.test(entry.file)) throw new Error("Unsafe weekly course path");
  const built = JSON.parse(fs.readFileSync(path.join(root, entry.file), "utf8"));
  if (JSON.stringify(built) !== JSON.stringify(weeklySource.courses[i])) throw new Error("Weekly course differs from source: " + entry.file);
  if (fs.statSync(path.join(root, entry.file)).size > weeklyBuild.MAX_COURSE_BYTES) throw new Error("Weekly course exceeds its size budget: " + entry.file);
  // Figures travel inline in the course and as standalone copies.
  for (const week of built.weeks) for (const figure of week.figures || []) {
    const copy = path.join(root, "content/weekly/figures", entry.trackId, entry.courseId || weeklyLib.gradeKey(entry.grade), figure.id + ".svg");
    if (!entry.source && (!fs.existsSync(copy) || fs.readFileSync(copy, "utf8") !== figure.svg)) throw new Error("Weekly figure copy is missing or stale: " + figure.id);
  }
}

// The named sequence shares validated plans but never assigns a fixed grade.
const highSchoolHtml = fs.readFileSync(path.join(root, "high-school.html"), "utf8");
const highSchoolScripts = pageScripts(highSchoolHtml);
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

// AP® course pages: the plan comes from the weekly build (content/ap-plan.js),
// assessments and references from tools/build-ap.js (content/ap.js).
const apHtml = fs.readFileSync(path.join(root, "ap.html"), "utf8");
const apScripts = pageScripts(apHtml);
if (JSON.stringify(apScripts) !== JSON.stringify(["content/ap-plan.js", "content/ap.js", "content/weekly-index.js", "lib/high-school.js", "lib/weekly.js", "lib/assessment.js", "lib/assessment-adapters.js", "lib/ap-assessment.js", "app/render.js", "app/ap-render.js", "app/ap.js"])) throw new Error("AP scripts are missing or out of order");
for (const match of apHtml.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1].split(/[?#]/)[0];
  if (!/^https?:/.test(target) && !fs.existsSync(path.join(root, target))) throw new Error("Missing AP asset: " + target);
}
const apIds = [...apHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(apIds).size !== apIds.length) throw new Error("Duplicate AP element IDs");
const apApp = fs.readFileSync(path.join(root, "app/ap.js"), "utf8");
for (const [, id] of apApp.matchAll(/document\.getElementById\("([^"]+)"\)/g)) if (!apIds.includes(id) && !apApp.includes('.id = "' + id + '"')) throw new Error("ap.js references a missing element: " + id);
apScripts.forEach(script => new vm.Script(fs.readFileSync(path.join(root, script), "utf8"), { filename: script }));
const apContext = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, "content/ap-plan.js"), "utf8"), apContext);
vm.runInContext(fs.readFileSync(path.join(root, "content/ap.js"), "utf8"), apContext);
if (!apContext.window.LIMINAL_AP_PLAN || JSON.stringify(apContext.window.LIMINAL_AP_PLAN) !== JSON.stringify(weeklySource.plans.ap)) throw new Error("AP plan bundle differs from source");
const apCheck = require("./check-ap");
const apSource = apCheck.loadAp();
if (apSource.problems.length || JSON.stringify(apContext.window.LIMINAL_AP) !== JSON.stringify(require("./build-ap").bundle(apSource))) throw new Error("AP bundle differs from source");
for (const entry of [...apContext.window.LIMINAL_AP.assessments, ...apContext.window.LIMINAL_AP.references]) {
  if (!/^content\/ap\/(?:assessments\/(?:calculus-ab|calculus-bc|physics-1|physics-c-mechanics)\/(?:unit-(?:[1-9]|10)|practice-exam)|references\/(?:physics-1|physics-c-mechanics))\.json$/.test(entry.file) || !fs.existsSync(path.join(root, entry.file))) throw new Error("Unsafe or missing AP file: " + entry.file);
}
// Every built page that shows the AP® marks carries the exact disclaimer.
const apDisclaimer = apCheck.disclaimerProblems(root);
if (apDisclaimer.length) throw new Error(apDisclaimer.join("; "));

// Nightly texts remain in separately loaded grade files, with a small index.
const dailyHtml = fs.readFileSync(path.join(root, "daily-reading.html"), "utf8");
const dailyScripts = pageScripts(dailyHtml);
if (JSON.stringify(dailyScripts) !== JSON.stringify(["lib/daily-reading.js", "app/daily-reading-render.js", "app/daily-reading-browse.js", "app/reader-controls.js", "app/daily-reading.js"])) throw new Error("Daily-reading scripts are missing or out of order");
for (const match of dailyHtml.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1].split(/[?#]/)[0];
  if (!/^https?:/.test(target) && !fs.existsSync(path.join(root, target))) throw new Error("Missing daily-reading asset: " + target);
}
const dailyIds = [...dailyHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(dailyIds).size !== dailyIds.length) throw new Error("Duplicate daily-reading element IDs");
for (const script of ["app/daily-reading-browse.js", "app/daily-reading.js"]) {
  const source = fs.readFileSync(path.join(root, script), "utf8");
  for (const [, id] of source.matchAll(/(?:getElementById|\$)\("([^"]+)"\)/g)) if (!dailyIds.includes(id) && id !== "dailyHeading") throw new Error(script + " references a missing element: " + id);
}
dailyScripts.forEach(script => new vm.Script(fs.readFileSync(path.join(root, script), "utf8")));
const dailySource = require("./build-daily-reading").loadDailyReading();
const dailyIndex = JSON.parse(fs.readFileSync(path.join(root, "content/reading-daily/index.json"), "utf8"));
if (JSON.stringify(dailyIndex) !== JSON.stringify(dailySource.index)) throw new Error("Daily-reading index differs from source");
for (let i = 0; i < dailyIndex.grades.length; i++) {
  const entry = dailyIndex.grades[i];
  if (!/^content\/reading-daily\/(?:k|[1-9]|1[0-2]|a[1-4])\.json$/.test(entry.file)) throw new Error("Unsafe daily-reading path");
  const built = JSON.parse(fs.readFileSync(path.join(root, entry.file), "utf8"));
  if (JSON.stringify(built) !== JSON.stringify(dailySource.courses[i])) throw new Error("Daily-reading text differs from source: " + entry.file);
  // Browse loads only this year-at-a-glance file, which carries no text,
  // questions, facilitator notes or evidence.
  const DR = require("../src/lib/daily-reading"), browseFile = path.join(root, DR.browseFile(entry.grade));
  if (!fs.existsSync(browseFile)) throw new Error("Missing daily-reading browse file for " + entry.file);
  const browseText = fs.readFileSync(browseFile, "utf8");
  if (JSON.stringify(JSON.parse(browseText)) !== JSON.stringify(DR.browseIndex(dailySource.courses[i]))) throw new Error("Daily-reading browse file differs from source: " + entry.file);
  if (/facilitatorNotes|"evidence"|"questions"|"blocks"|"textHash"/.test(browseText) || browseText.length > 80000) throw new Error("Daily-reading browse file carries reading material: " + entry.file);
  // The reader loads one week at a time; each week file is that week of the source.
  for (let week = 1; week <= 36; week++) {
    const weekFile = path.join(root, DR.weekFile(entry.grade, week));
    if (!fs.existsSync(weekFile)) throw new Error("Missing daily-reading week file: " + DR.weekFile(entry.grade, week));
    if (JSON.stringify(JSON.parse(fs.readFileSync(weekFile, "utf8"))) !== JSON.stringify(DR.weekSlice(dailySource.courses[i], week))) throw new Error("Daily-reading week file differs from source: " + DR.weekFile(entry.grade, week));
  }
}

// Reading level: its bundle, logic and page script load in order; the
// bundle matches a fresh build from source and carries no facilitator notes.
const levelHtml = fs.readFileSync(path.join(root, "reading-level.html"), "utf8");
const levelScripts = pageScripts(levelHtml);
if (JSON.stringify(levelScripts) !== JSON.stringify(["content/reading-level.js", "lib/daily-reading.js", "lib/reading-level.js", "app/reading-level.js"])) throw new Error("Reading-level scripts are missing or out of order");
for (const match of levelHtml.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1].split(/[?#]/)[0];
  if (!/^https?:/.test(target) && !fs.existsSync(path.join(root, target))) throw new Error("Missing reading-level asset: " + target);
}
const levelIds = [...levelHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(levelIds).size !== levelIds.length) throw new Error("Duplicate reading-level element IDs");
const levelApp = fs.readFileSync(path.join(root, "app/reading-level.js"), "utf8");
// Each looked-up ID is in the page or assigned by the script itself.
for (const [, id] of levelApp.matchAll(/document\.getElementById\("([^"]+)"\)/g)) if (!levelIds.includes(id) && !levelApp.includes('.id = "' + id + '"')) throw new Error("reading-level.js references a missing element: " + id);
if (!/<link rel="icon" href="favicon.svg"/.test(levelHtml)) throw new Error("reading-level.html does not link its favicon.");
levelScripts.forEach(script => new vm.Script(fs.readFileSync(path.join(root, script), "utf8"), { filename: script }));
const levelContext = vm.createContext({ window: {} });
levelScripts.slice(0, 3).forEach(script => vm.runInContext(fs.readFileSync(path.join(root, script), "utf8"), levelContext));
const levelBuild = require("./build-reading-level"), levelBundle = levelContext.window.LIMINAL_READING_LEVEL;
if (JSON.stringify(levelBundle) !== JSON.stringify(levelBuild.bundle(levelBuild.loadProbes()))) throw new Error("Reading-level bundle differs from source");
if (/facilitatorNotes|"evidence"|"questions"/.test(JSON.stringify(levelBundle))) throw new Error("Reading-level bundle carries discussion material");
if (!levelContext.window.LiminalReadingLevel || levelContext.window.LiminalReadingLevel.ladderLevels(levelBundle.probes).length !== levelBundle.levels.length) throw new Error("Reading-level logic does not load as a browser script");

// Every page names its icon, which is built with it, so no page asks the
// server for a favicon.ico that is not there.
for (const page of ["index.html", "practice.html", "learn.html", "print.html", "courses.html", "curriculum.html", "weeks.html", "high-school.html", "ap.html", "daily-reading.html"]) {
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
)(bookletModule, bookletModule.exports, name => {
  if (name === "./core.js") return practiceCore;
  if (name === "./assessment") return require(path.join(root, "lib/assessment.js"));
  if (name === "./assessment-adapters") return require(path.join(root, "lib/assessment-adapters.js"));
  throw new Error("Unexpected booklet dependency: " + name);
});
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
