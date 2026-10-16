#!/usr/bin/env node
"use strict";

// The Learn gate, over content/learn (or --root <dir>):
//   - every page is inside the markup subset (src/lib/learn-markup.js), its
//     front matter id is its path, and every link and fact resolves
//     (tools/build-learn.js loads and checks these)
//   - every SAT catalog skill has exactly one page, at
//     <sectionKey>/<slug(domain)>/<slug(skill)>.md, whose front matter
//     section, domain and skill match the catalog; any other page is a
//     general page at sat/general/<slug>.md without those keys
//   - each catalog subskill has one ## section anchored {#<slug(subskill)>}
//     holding at least one Example callout
//   - on SAT Math pages, every subskill section holds at least one Try it,
//     every Example is followed by a Try it before the next Example or the
//     end of its ## section, and every Try it has a worked solution after
//     its answer; under Harder versions ({#hard}) a Try it gives no visible
//     First step, only a hidden Hint, because there it would do the hard
//     part
//   - a "Before you start" section {#before-you-start} holds 2–5 Try it
//     checks and links to the lessons or coursework that teach them
//   - every lessons.html#… link names a published expanded lesson, every
//     weeks.html#… link a week of published coursework, and every
//     practice.html#… link a catalog skill's practice or a section with
//     Desmos routes
//   - every SAT template's (skill, subskill) resolves to such a section
//   - every fact has a real YYYY-MM-DD "verified" date and an https source
//   - the SAT Math plan page states the next step's routine bar and the
//     Progress page's gate and mastered bars as src/lib/analytics.js
//     defines them
//
//   node tools/check-learn.js [--root <learn dir>]

const fs = require("node:fs");
const path = require("node:path");

const Learn = require("../src/lib/learn-markup");
const Analytics = require("../src/lib/analytics");
const Weekly = require("../src/lib/weekly");
const { slug } = require("./lib/families");
const {
  DEFAULT_ROOT,
  FACTS_FILE,
  GENERAL_PREFIX,
  readTree,
  readCatalog,
  loadLearn,
  formatError,
} = require("./build-learn");

const SKILL_KEYS = ["section", "domain", "skill"];
const PLAN_FILE = "sat/general/math-plan.md";
const MATH_SECTION = "sat-math";
const PREREQUISITES = "before-you-start";
const HARDER = "hard";
const PREREQUISITE_CHECKS = { min: 2, max: 5 };
const ROOT = path.resolve(__dirname, "..");
const GRADE_KEYS = ["k", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

// Every route a Learn page may link to on the rest of the site:
// { lessons: Set("common-core-math/8/2-3"), weeks: Set("common-core-math/8/31"),
//   practice: Set("practice/sat-math/linear-functions", "desmos/sat-math") }.
// Expanded lessons come from the lesson-module catalog and its modules;
// weeks from the course files under content/weekly, with the named
// high-school courses resolved through src/lib/weekly.js; practice from
// the section catalog (practice.html#practice/<section>/<slug(skill)>)
// and content/desmos-routes.json (practice.html#desmos/<section>, the
// drill src/app/app.js opens). Only content that exists is listed, so a
// link to an unpublished grade, an unknown skill or a section without
// Desmos routes fails.
function siteRoutes(root) {
  const base = root || ROOT;
  const lessonsRoot = path.join(base, "content", "lesson-modules");
  const weeklyRoot = path.join(base, "content", "weekly");
  const lessons = new Set();
  readJson(path.join(lessonsRoot, "catalog.json")).modules.forEach((entry) => {
    const module = readJson(path.join(lessonsRoot, entry.file));
    const prefix = `${entry.trackId}/${Weekly.gradeKey(entry.grade)}`;
    module.units.forEach((unit) => unit.lessons.forEach((lesson) => lessons.add(`${prefix}/${lesson.id}`)));
  });
  const weeks = new Set();
  const addCourse = (prefix, file) => {
    if (!fs.existsSync(file)) return;
    readJson(file).weeks.forEach((week) => weeks.add(`${prefix}/${week.week}`));
  };
  Weekly.GRADE_TRACKS.forEach((track) => GRADE_KEYS.forEach((key) => {
    addCourse(`${track}/${key}`, path.join(weeklyRoot, track, `${key}.json`));
  }));
  Weekly.NAMED_TRACK_IDS.forEach((track) => {
    const named = Weekly.NAMED_TRACKS[track];
    named.courses.forEach((course) => {
      const alias = named.aliases[course];
      addCourse(`${track}/${course}`, alias
        ? path.join(weeklyRoot, alias.trackId, `${Weekly.gradeKey(alias.grade)}.json`)
        : path.join(weeklyRoot, track, `${course}.json`));
    });
  });
  const practice = new Set();
  readJson(path.join(base, "content", "catalog.json")).sections.forEach((section) => {
    section.domains.forEach((domain) => Object.keys(domain.skills).forEach((skill) => {
      practice.add(`practice/${section.key}/${slug(skill)}`);
    }));
  });
  const desmos = path.join(base, "content", "desmos-routes.json");
  if (fs.existsSync(desmos)) {
    Object.keys(readJson(desmos).sections || {}).forEach((key) => practice.add(`desmos/${key}`));
  }
  return { lessons, weeks, practice };
}

// The phrases the plan must contain, built from the live constants, so a
// change to either the page or the code that leaves them apart fails here.
function planPhrases() {
  const { GATE, HARD_BAR, ROUTINE } = Analytics;
  return [
    `${ROUTINE.correct} of your last ${ROUTINE.window} ${ROUTINE.tiers.join(" or ")} questions`,
    `${GATE.correct} of your last ${GATE.window} ${GATE.tier} questions`,
    `${HARD_BAR.correct} of your last ${HARD_BAR.window} ${HARD_BAR.tier} questions`,
  ];
}

function satTemplates() {
  return [
    ["sat-math", require("../src/lib/families/sat/math")],
    ["sat-reading-writing", require("../src/lib/families/sat/reading-writing")],
  ].flatMap(([sectionKey, families]) => families.map((family) => ({
    sectionKey,
    id: family.id,
    domain: family.domain,
    skill: family.skill,
    subskill: family.subskill,
  })));
}

// Catalog skill pages by id: { section, domain, skill, subskills }.
function expectedPages(catalog) {
  const expected = new Map();
  catalog.sections.filter((section) => section.test === "SAT").forEach((section) => {
    section.domains.forEach((domain) => {
      Object.entries(domain.skills).forEach(([skill, subskills]) => {
        expected.set(`${section.key}/${slug(domain.name)}/${slug(skill)}`, {
          section: section.key,
          domain: domain.name,
          skill,
          subskills,
        });
      });
    });
  });
  return expected;
}

function isCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof value === "string" ? value : "");
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toISOString().slice(0, 10) === value;
}

function isHttpsUrl(value) {
  try {
    return typeof value === "string" && !/\s/.test(value) && new URL(value).protocol === "https:";
  } catch (error) {
    return false;
  }
}

const isExample = (block) => block.type === "callout" && block.kind === "example";
const hasExample = (blocks) => blocks.some(isExample);

// The site links (lessons.html, weeks.html) inside a list of blocks.
function siteLinks(blocks) {
  const found = [];
  Learn.walkInline(blocks, (node) => {
    if (node.type === "link" && node.site !== undefined) found.push(node);
  });
  return found;
}

// Faded practice on a SAT Math page: each Example is followed by a Try it
// before the next Example or the end of its ## section, and every Try it
// shows a worked solution once it is opened. Visible First steps are the
// fading in core sections; under Harder versions the support is a Hint.
function checkPractice(page, add) {
  Learn.sections(page.blocks).forEach((section) => {
    if (section.heading.id === HARDER) {
      Learn.tries(section.blocks).filter((block) => block.first).forEach((block) => {
        add(page.file, block.line, `a **Try it.** under {#${HARDER}} hides its support: write the **First step.** as a **Hint.**`);
      });
    }
    let waiting = null;
    section.blocks.forEach((block) => {
      if (isExample(block)) {
        if (waiting) add(page.file, waiting.line, "this Example needs a **Try it.** after it, before the next Example");
        waiting = block;
      } else if (block.type === "try") {
        waiting = null;
      }
    });
    if (waiting) {
      add(page.file, waiting.line, `this Example needs a **Try it.** after it, before the end of section {#${section.heading.id}}`);
    }
  });
  const all = [];
  const collect = (blocks) => (blocks || []).forEach((block) => {
    if (block.type === "try") all.push(block);
  });
  collect(page.blocks);
  all.forEach((block) => {
    if (!block.solution || !block.solution.length) {
      add(page.file, block.line, "this **Try it.** needs a worked solution after its **Answer.** line");
    }
  });
}

// Returns { errors: [{ file, line, message }], summary }. `today` is a
// YYYY-MM-DD string; a fact cannot be verified after it.
// `routes` ({ lessons, weeks, practice } sets of routes) defaults to
// siteRoutes().
function checkLearn({ tree, catalog, templates, today, routes }) {
  if (!tree.exists) {
    return { errors: [{ file: "", line: 0, message: "the Learn directory does not exist" }], summary: null };
  }
  const { pages, facts, errors } = loadLearn(tree);
  const add = (file, line, message) => errors.push({ file, line, message });
  const now = today || new Date().toISOString().slice(0, 10);

  tree.others.forEach((file) => add(file, 0, `only .md pages and ${FACTS_FILE} belong in the Learn directory`));

  facts.forEach((fact) => {
    if (!isCalendarDate(fact.verified)) {
      add(FACTS_FILE, fact.line, `fact "${fact.id}" needs "verified": "YYYY-MM-DD" (a real date)`);
    } else if (fact.verified > now) {
      add(FACTS_FILE, fact.line, `fact "${fact.id}" is verified on ${fact.verified}, after today`);
    }
    if (!isHttpsUrl(fact.source)) add(FACTS_FILE, fact.line, `fact "${fact.id}" needs an https "source" URL`);
  });

  const expected = expectedPages(catalog);
  let skillPages = 0;
  expected.forEach((want, id) => {
    const page = pages[id];
    if (!page) {
      add(`${id}.md`, 0, `missing: the page for ${want.section} skill "${want.skill}"`);
      return;
    }
    skillPages += 1;
    SKILL_KEYS.forEach((key) => {
      if (page.meta[key] !== want[key]) {
        add(page.file, 1, `front matter ${key} is "${page.meta[key] || ""}"; the catalog says "${want[key]}"`);
      }
    });
    const anchors = Learn.anchors(page.blocks);
    const sections = new Map(Learn.sections(page.blocks).map((section) => [section.heading.id, section]));
    const math = want.section === MATH_SECTION;
    want.subskills.forEach((subskill) => {
      const anchor = slug(subskill);
      const level = anchors.get(anchor);
      if (level === undefined) {
        add(page.file, 0, `no "## … {#${anchor}}" section for subskill "${subskill}"`);
        return;
      }
      if (level !== 2) {
        add(page.file, 0, `{#${anchor}} (subskill "${subskill}") must be on a ## heading`);
        return;
      }
      const { heading, blocks } = sections.get(anchor);
      if (!hasExample(blocks)) {
        add(page.file, heading.line, `section {#${anchor}} needs at least one **Example.** callout`);
      }
      if (math && !Learn.tries(blocks).length) {
        add(page.file, heading.line, `section {#${anchor}} needs at least one **Try it.** problem`);
      }
    });
    if (math) checkPractice(page, add);
  });

  // A prerequisite block is a few quick checks plus where to relearn them.
  Object.values(pages).forEach((page) => {
    const section = Learn.sections(page.blocks).find((entry) => entry.heading.id === PREREQUISITES);
    if (!section) return;
    const count = Learn.tries(section.blocks).length;
    if (count < PREREQUISITE_CHECKS.min || count > PREREQUISITE_CHECKS.max) {
      add(page.file, section.heading.line,
        `{#${PREREQUISITES}} holds ${PREREQUISITE_CHECKS.min}–${PREREQUISITE_CHECKS.max} **Try it.** checks; it has ${count}`);
    }
    if (!siteLinks(section.blocks).some((link) => link.site === "lessons" || link.site === "weeks")) {
      add(page.file, section.heading.line,
        `{#${PREREQUISITES}} links to the lessons.html or weeks.html pages that teach its checks`);
    }
  });

  // Links to expanded lessons and coursework name pages that exist.
  const known = routes || siteRoutes();
  Object.values(pages).forEach((page) => {
    (page.links || []).forEach((link) => {
      if (link.site === undefined) return;
      const set = known[link.site];
      if (set && set.has(link.route)) return;
      const why = {
        lessons: "no such expanded lesson in content/lesson-modules",
        weeks: "no such week of coursework in content/weekly",
        practice: "no such skill in content/catalog.json, or no Desmos routes for that section",
      };
      add(page.file, link.line, `link ${link.site}.html#${link.route}: ${why[link.site] || "unknown page"}`);
    });
  });

  let generalPages = 0;
  Object.values(pages).forEach((page) => {
    if (expected.has(page.id)) return;
    const general = page.id.startsWith(GENERAL_PREFIX) && page.id.split("/").length === 3;
    if (!general) {
      add(page.file, 0, `not the page of any SAT catalog skill; general pages live at ${GENERAL_PREFIX}<slug>.md`);
      return;
    }
    generalPages += 1;
    SKILL_KEYS.forEach((key) => {
      if (page.meta[key] !== undefined) add(page.file, 1, `a general page has no "${key}" in its front matter`);
    });
  });

  // The plan states the bars the Progress page applies.
  const planText = tree.files[PLAN_FILE];
  if (planText !== undefined) {
    const flat = planText.replace(/\s*\n\s*(?:>\s*)?/g, " ");
    planPhrases().forEach((phrase) => {
      if (!flat.includes(phrase)) add(PLAN_FILE, 0, `must say "${phrase}", as src/lib/analytics.js applies it`);
    });
  }

  // Page ids are paths, so they are unique; this guards the front matter too.
  const ids = new Map();
  Object.values(pages).forEach((page) => {
    const id = page.meta.id;
    if (!id) return;
    if (ids.has(id)) add(page.file, 1, `id "${id}" is also used by ${ids.get(id)}`);
    else ids.set(id, page.file);
  });

  // One error per missing section, naming the templates that need it.
  const unresolved = new Map();
  templates.forEach((template) => {
    const id = `${template.sectionKey}/${slug(template.domain || "")}/${slug(template.skill || "")}`;
    const anchor = slug(template.subskill || "");
    const page = pages[id];
    if (page && anchor && Learn.anchors(page.blocks).get(anchor) === 2) return;
    const key = `${id}#${anchor}`;
    if (!unresolved.has(key)) unresolved.set(key, { id, anchor, template, ids: [] });
    unresolved.get(key).ids.push(template.id);
  });
  unresolved.forEach(({ id, anchor, template, ids: templateIds }) => {
    const names = templateIds.slice(0, 4).join(", ") + (templateIds.length > 4 ? ", …" : "");
    add(
      `${id}.md`,
      0,
      `${templateIds.length} template(s) (${names}) of "${template.skill}" / "${template.subskill}" need a ## section {#${anchor}}`,
    );
  });

  errors.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1));
  return {
    errors,
    summary: { skillPages, generalPages, templates: templates.length, facts: facts.size },
  };
}

function main(argv) {
  let root = DEFAULT_ROOT;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--root" && argv[index + 1]) {
      root = path.resolve(argv[index + 1]);
      index += 1;
    } else {
      console.error(`unknown argument ${argv[index]} (use --root <dir>)`);
      process.exit(2);
    }
  }
  const result = checkLearn({ tree: readTree(root), catalog: readCatalog(), templates: satTemplates() });
  const shown = path.relative(process.cwd(), root) || ".";
  if (result.errors.length) {
    console.error(`learn check failed with ${result.errors.length} problem(s) in ${shown}:`);
    result.errors.forEach((error) => console.error(`  ${formatError(root, error)}`));
    process.exit(1);
  }
  const { skillPages, generalPages, templates, facts } = result.summary;
  console.log(
    `learn check passed: ${skillPages} skill pages, ${generalPages} general pages, ` +
    `${templates} templates resolve to a section, ${facts} facts sourced (${shown})`,
  );
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { checkLearn, expectedPages, satTemplates, siteRoutes, isCalendarDate, planPhrases };
