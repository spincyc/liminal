"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const vm = require("node:vm");
const { readTree, loadLearn, buildIndex, bundleSource } = require("../tools/build-learn");
const { checkLearn, satTemplates } = require("../tools/check-learn");
const catalog = require("../content/catalog.json");

// test/fixtures/learn is a complete, passing Learn tree for the real catalog
// and templates: rich hand-written pages plus a minimal page per other skill.
// Each bad case below changes one thing in a copy of it.
const FIXTURES = path.join(__dirname, "fixtures", "learn");
const LINEAR = "sat-math/algebra/linear-inequalities.md";
const CIRCLES = "sat-math/geometry-and-trigonometry/circles.md";
const templates = satTemplates();

const goodTree = () => JSON.parse(JSON.stringify(readTree(FIXTURES)));
const run = (tree, options) => checkLearn(Object.assign({ tree, catalog, templates, today: "2026-09-25" }, options));
const lines = (result) => result.errors
  .map((error) => `${error.file}${error.line ? `:${error.line}` : ""}: ${error.message}`);

function edit(tree, file, from, to) {
  assert.ok(tree.files[file].includes(from), `${file} does not contain ${JSON.stringify(from)}`);
  tree.files[file] = tree.files[file].replace(from, to);
  return tree;
}

function expectError(result, pattern) {
  assert.ok(
    lines(result).some((line) => pattern.test(line)),
    `expected an error matching ${pattern}; got ${JSON.stringify(lines(result), null, 2)}`,
  );
}

test("the fixture tree passes the gate", () => {
  const result = run(goodTree());
  assert.deepEqual(lines(result), []);
  const skills = catalog.sections.filter((section) => section.test === "SAT")
    .reduce((total, section) => total + section.domains
      .reduce((sum, domain) => sum + Object.keys(domain.skills).length, 0), 0);
  assert.equal(result.summary.skillPages, skills);
  assert.equal(result.summary.generalPages, 2);
  assert.equal(result.summary.templates, templates.length);
});

test("every catalog skill needs its page, and pages need a catalog skill", () => {
  const missing = goodTree();
  delete missing.files[CIRCLES];
  const result = run(missing);
  expectError(result, /circles\.md: missing: the page for sat-math skill "Circles"/);
  expectError(result, /circles\.md: \d+ template\(s\) .* of "Circles" \/ "circle measures" need a ## section \{#circle-measures\}/);

  const stray = goodTree();
  stray.files["sat-math/algebra/quadratics.md"] = stray.files[LINEAR]
    .replace("id: sat-math/algebra/linear-inequalities", "id: sat-math/algebra/quadratics");
  stray.others.push("notes.txt");
  const strayResult = run(stray);
  expectError(strayResult, /quadratics\.md: not the page of any SAT catalog skill/);
  expectError(strayResult, /notes\.txt: only \.md pages/);
});

test("front matter must match the catalog and the page's path", () => {
  const result = run(edit(goodTree(), LINEAR, "domain: Algebra", "domain: Advanced Math"));
  expectError(result, /linear-inequalities\.md:1: front matter domain is "Advanced Math"; the catalog says "Algebra"/);
  const moved = run(edit(goodTree(), LINEAR, "id: sat-math/algebra/linear-inequalities", "id: sat-math/algebra/other"));
  expectError(moved, /linear-inequalities\.md:1: front matter id "sat-math\/algebra\/other" must be the page's path/);
  const general = run(edit(goodTree(), "sat/general/test-format.md", "title: Test format", "title: Test format\nskill: Circles"));
  expectError(general, /test-format\.md:1: a general page has no "skill"/);
});

test("each subskill needs one ## section with its anchor and an Example", () => {
  const renamed = run(edit(goodTree(), LINEAR, "{#systems-of-inequalities}", "{#systems}"));
  expectError(renamed, /no "## … \{#systems-of-inequalities\}" section for subskill "systems of inequalities"/);
  expectError(renamed, /template\(s\) .* need a ## section \{#systems-of-inequalities\}/);

  const demoted = run(edit(goodTree(), CIRCLES, "## Circle equations {#circle-equations}", "### Circle equations {#circle-equations}"));
  expectError(demoted, /\{#circle-equations\} \(subskill "circle equations"\) must be on a ## heading/);

  const noExample = run(edit(goodTree(), CIRCLES, "> **Example.** A minimal fixture example for circle measures.",
    "> **Note.** A note is not a worked example."));
  expectError(noExample, /circles\.md:\d+: section \{#circle-measures\} needs at least one \*\*Example\.\*\* callout/);
});

test("a template whose subskill has no section fails", () => {
  const extra = templates.concat([{
    sectionKey: "sat-math",
    id: "made-up-template",
    domain: "Algebra",
    skill: "Linear inequalities",
    subskill: "compound inequalities",
  }]);
  const result = run(goodTree(), { templates: extra });
  expectError(result, /1 template\(s\) \(made-up-template\) of "Linear inequalities" \/ "compound inequalities" need a ## section \{#compound-inequalities\}/);
});

test("facts must be defined, dated, and sourced over https", () => {
  const undefinedFact = run(edit(goodTree(), LINEAR, "{{fact:sat-math-minutes}}", "{{fact:sat-math-hours}}"));
  expectError(undefinedFact, /linear-inequalities\.md:13: \{\{fact:sat-math-hours\}\} is not defined in facts\.json/);

  const bad = goodTree();
  const facts = JSON.parse(bad.factsText);
  facts[0].verified = "2026-02-30";
  facts[1].source = "http://satsuite.collegeboard.org/sat";
  facts.push({ id: "future", value: "x", verified: "2027-01-01", source: "https://satsuite.collegeboard.org/" });
  facts.push({ id: "future", value: "y", verified: "2026-01-01", source: "https://satsuite.collegeboard.org/" });
  bad.factsText = JSON.stringify(facts, null, 2);
  const result = run(bad);
  expectError(result, /facts\.json:\d+: fact "sat-rw-questions" needs "verified": "YYYY-MM-DD"/);
  expectError(result, /facts\.json:\d+: fact "sat-math-minutes" needs an https "source" URL/);
  expectError(result, /facts\.json:\d+: fact "future" is verified on 2027-01-01, after today/);
  expectError(result, /facts\.json:\d+: fact "future" is defined twice/);

  const broken = goodTree();
  broken.factsText = "[ not json";
  expectError(run(broken), /facts\.json:1: not valid JSON/);
});

test("links must reach an existing page and anchor", () => {
  const page = run(edit(goodTree(), LINEAR, "learn:sat-math/algebra/linear-functions#slope", "learn:sat-math/algebra/quadratics"));
  expectError(page, /linear-inequalities\.md:15: link learn:sat-math\/algebra\/quadratics: no such page/);
  const anchor = run(edit(goodTree(), LINEAR, "learn:sat-math/algebra/linear-functions#slope", "learn:sat-math/algebra/linear-functions#gradient"));
  expectError(anchor, /linear-inequalities\.md:15: link learn:sat-math\/algebra\/linear-functions#gradient: that page has no \{#gradient\}/);
  const local = run(edit(goodTree(), LINEAR, "(#systems-of-inequalities)", "(#nowhere)"));
  expectError(local, /link learn:sat-math\/algebra\/linear-inequalities#nowhere: that page has no \{#nowhere\}/);
  const host = run(edit(goodTree(), LINEAR, "https://satsuite.collegeboard.org/sat/whats-on-the-test/structure",
    "https://www.example.com/sat"));
  expectError(host, /linear-inequalities\.md:14: link "https:\/\/www\.example\.com\/sat" is not an https link to an allowed host/);
});

test("markup errors surface with their file and line", () => {
  const tree = goodTree();
  const line = tree.files[LINEAR].split("\n").findIndex((text) => text.startsWith("A point is a solution")) + 1;
  const result = run(edit(tree, LINEAR, "A point is a solution", "A <em>point</em> is a solution"));
  expectError(result, new RegExp(`linear-inequalities\\.md:${line}: raw HTML is not allowed`));
});

test("the bundle lists sections in catalog order with facts filled in and no source lines", () => {
  const loaded = loadLearn(goodTree());
  assert.deepEqual(loaded.errors, []);
  const index = buildIndex(loaded.pages, catalog);
  assert.deepEqual(index.map((group) => group.sectionKey || group.kind), ["sat-reading-writing", "sat-math", "general"]);
  const math = index[1];
  assert.equal(math.title, "Math");
  assert.deepEqual(math.domains.map((domain) => domain.name),
    catalog.sections.find((section) => section.key === "sat-math").domains.map((domain) => domain.name));
  const inequalities = math.domains[0].pages.find((entry) => entry.id === "sat-math/algebra/linear-inequalities");
  assert.deepEqual(inequalities.subskills, [
    { anchor: "solve-inequalities", title: "Solve inequalities" },
    { anchor: "systems-of-inequalities", title: "Systems of inequalities" },
  ]);
  assert.deepEqual(index[2].pages.map((entry) => entry.id), ["sat/general/desmos-basics", "sat/general/test-format"]);

  const context = vm.createContext({ window: {} });
  const source = bundleSource(loaded.pages, index);
  assert.ok(!source.includes('"line"'));
  vm.runInContext(source, context);
  // Plain JSON again, so values from the vm realm compare structurally.
  const bundle = JSON.parse(JSON.stringify(context.window.LIMINAL_LEARN));
  const format = bundle.pages["sat/general/test-format"];
  assert.equal(format.kind, "general");
  assert.deepEqual(format.facts.map((fact) => fact.id), ["sat-rw-questions", "sat-math-minutes"]);
  assert.deepEqual(format.blocks[1].content[1], { type: "fact", id: "sat-rw-questions", text: "54" });
  const skill = bundle.pages["sat-math/algebra/linear-inequalities"];
  assert.equal(skill.section, "sat-math");
  assert.equal(skill.skillSlug, "linear-inequalities");
  assert.equal(skill.file, undefined);
});

test("the Math plan must state the gate and mastered bars the Progress page applies", () => {
  const plan = "sat/general/math-plan.md";
  const tree = goodTree();
  tree.files[plan] = [
    "---", "id: sat/general/math-plan", "title: SAT Math plan", "---", "# SAT Math plan", "",
    "## The gate {#gate}", "",
    "> **Rule.** Move on after 16 of your last 20 Medium questions.", "",
  ].join("\n");
  const result = run(tree);
  expectError(result, /math-plan\.md: must say "24 of your last 30 Medium questions"/);
  expectError(result, /math-plan\.md: must say "10 of your last 15 Hard questions"/);
  // Line breaks and callout markers inside a phrase do not matter.
  expectError(result, /math-plan\.md: must say "8 of your last 10 Easy questions"/);
  edit(tree, plan, "16 of your last 20 Medium questions.", "8 of your last 10 Easy questions, then 24 of your last 30\n> Medium questions, then 10 of\n> your last 15 Hard questions.");
  assert.deepEqual(lines(run(tree)).filter((line) => line.includes("math-plan")), []);
});
