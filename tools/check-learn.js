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
//   - every SAT template's (skill, subskill) resolves to such a section
//   - every fact has a real YYYY-MM-DD "verified" date and an https source
//   - the SAT Math plan page states the next step's routine bar and the
//     Progress page's gate and mastered bars as src/lib/analytics.js
//     defines them
//
//   node tools/check-learn.js [--root <learn dir>]

const path = require("node:path");

const Learn = require("../src/lib/learn-markup");
const Analytics = require("../src/lib/analytics");
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

// The phrases the plan must contain, built from the live constants, so a
// change to either the page or the code that leaves them apart fails here.
function planPhrases() {
  const { GATE, HARD_BAR, ROUTINE } = Analytics;
  return [
    `${ROUTINE.correct} of your last ${ROUTINE.window} ${ROUTINE.tiers[0]} questions`,
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

const hasExample = (blocks) => blocks.some((block) => block.type === "callout" && block.kind === "example");

// Returns { errors: [{ file, line, message }], summary }. `today` is a
// YYYY-MM-DD string; a fact cannot be verified after it.
function checkLearn({ tree, catalog, templates, today }) {
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
    want.subskills.forEach((subskill) => {
      const anchor = slug(subskill);
      const level = anchors.get(anchor);
      if (level === undefined) {
        add(page.file, 0, `no "## … {#${anchor}}" section for subskill "${subskill}"`);
      } else if (level !== 2) {
        add(page.file, 0, `{#${anchor}} (subskill "${subskill}") must be on a ## heading`);
      } else if (!hasExample(sections.get(anchor).blocks)) {
        const heading = sections.get(anchor).heading;
        add(page.file, heading.line, `section {#${anchor}} needs at least one **Example.** callout`);
      }
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

module.exports = { checkLearn, expectedPages, satTemplates, isCalendarDate, planPhrases };
