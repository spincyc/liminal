"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Mask = require("../src/lib/template-mask");
const Runs = require("../src/lib/runs");
const Core = require("../src/lib/core");
const Progress = require("../src/lib/progress");
const Practice = require("../src/lib/practice");
const S = require("../src/lib/families/shared");
const { slug: toolSlug } = require("../tools/lib/families");
const catalog = require("../content/catalog.json");
const mathFamilies = require("../src/lib/families/sat/math");
const mathRegistry = require("../content/templates/sat-math.json");
const rwFamilies = require("../src/lib/families/sat/reading-writing");
const rwRegistry = require("../content/templates/sat-reading-writing.json");

const mathTemplates = Runs.catalogTemplates(mathFamilies, mathRegistry);
const rwTemplates = Runs.catalogTemplates(rwFamilies, rwRegistry);
const mathSection = catalog.sections.find((section) => section.key === "sat-math");

test("a template run records what it served and describes itself", () => {
  const run = Practice.buildTemplateRun({
    sectionKey: "sat-math",
    templates: mathTemplates,
    count: 8,
    seed: "k3f9",
    filters: { difficulties: ["Hard"] },
    domainWeights: Practice.domainWeights(mathSection),
    instantiate: S.instantiate,
  });
  assert.equal(run.questions.length, 8);
  assert.ok(run.questions.every((question) => question.difficulty === "Hard"));
  assert.ok(run.questions.every((question) => question.id.startsWith("sat-math:")));
  assert.deepEqual(run.templateIds, run.questions.map((question) => question.templateId));
  assert.equal(run.code, Runs.runCode(run.mask, "k3f9"));
  assert.equal(run.setCode, `math-${run.code}`);
  assert.equal(Mask.size(run.mask), 8);
  assert.deepEqual(run.skipped, []);
});

test("a set code rebuilds the same questions", () => {
  const run = Practice.buildTemplateRun({
    sectionKey: "sat-math", templates: mathTemplates, count: 6, seed: "q1", instantiate: S.instantiate,
  });
  const again = Practice.rebuildRun({ code: run.setCode, templates: mathTemplates, instantiate: S.instantiate });
  assert.deepEqual(again.questions.map((question) => question.id), run.questions.map((question) => question.id));
  assert.equal(again.missing, 0);
  const bare = Practice.rebuildRun({ code: run.code, sectionKey: "sat-math", templates: mathTemplates, instantiate: S.instantiate });
  assert.equal(bare.questions.length, 6);
  const fewer = Practice.rebuildRun({ code: run.setCode, templates: mathTemplates.slice(0, 3), instantiate: S.instantiate });
  assert.equal(fewer.missing + fewer.questions.length, 6);
});

test("set codes name their section and reject anything else", () => {
  assert.equal(Practice.parseSetCode(" RW-5-ab ").sectionKey, "sat-reading-writing");
  assert.equal(Practice.parseSetCode("math-5-ab").seed, "ab");
  assert.equal(Practice.parseSetCode("math-5-ab-01").code, "5-ab-01");
  assert.equal(Practice.parseSetCode("5-ab", "sat-math").sectionKey, "sat-math");
  assert.equal(Practice.parseSetCode("5-ab-01", "sat-math").code, "5-ab-01");
  assert.throws(() => Practice.parseSetCode("5-ab"), SyntaxError);
  assert.throws(() => Practice.parseSetCode("sci-5-ab-1"), SyntaxError);
  assert.throws(() => Practice.parseSetCode("hello"), SyntaxError);
  assert.throws(() => Practice.parseSetCode("math-5-a!b"), SyntaxError);
  assert.equal(Practice.formatSetCode("act-english", "5-ab"), "5-ab");
});

test("a set drawn around seen scenes rebuilds exactly from its code", () => {
  // Reading and Writing templates name scenes. With every first-draw scene
  // marked as seen, each template steers to another attempt, which the code
  // must carry for a retake to match.
  const first = Practice.buildTemplateRun({
    sectionKey: "sat-reading-writing", templates: rwTemplates, count: 8, seed: "sc1", instantiate: S.instantiate,
  });
  const seenScenes = {};
  first.questions.forEach((question) => {
    if (question.scene) seenScenes[question.templateId] = [question.scene];
  });
  assert.ok(Object.keys(seenScenes).length > 0);
  const steered = Practice.buildTemplateRun({
    sectionKey: "sat-reading-writing", templates: rwTemplates, count: 8, seed: "sc1", instantiate: S.instantiate,
    history: { serve: 0, lastServed: {}, scenes: seenScenes, mask: "0" },
  });
  assert.equal(steered.setCode.split("-").length, 4, "rw-<mask>-<seed>-<attempts>");
  assert.notDeepEqual(steered.questions.map((question) => question.id), first.questions.map((question) => question.id));
  const again = Practice.rebuildRun({ code: steered.setCode, templates: rwTemplates, instantiate: S.instantiate });
  assert.deepEqual(again.questions.map((question) => question.id), steered.questions.map((question) => question.id));
  assert.equal(again.setCode, steered.setCode);
});

test("a template with no good draw stays out of the served history", () => {
  const good = mathTemplates.slice(0, 3);
  const broken = { ...mathTemplates[3], family: { ...mathTemplates[3].family, build() { throw new Error("broken"); } } };
  const run = Practice.buildTemplateRun({
    sectionKey: "sat-math", templates: [...good, broken], count: 4, seed: "sk1", instantiate: S.instantiate,
  });
  assert.equal(run.questions.length, 3);
  assert.deepEqual(run.skipped, [{ templateId: broken.id, reason: "throws" }]);
  assert.equal(Mask.size(run.mask), 4, "the code keeps the chosen mask");
  assert.deepEqual(Mask.bits(Mask.fromCode(run.servedMaskCode)).sort((a, b) => a - b),
    good.map((template) => template.bit).sort((a, b) => a - b));
});

test("a code naming a retired template still rebuilds the rest", () => {
  const run = Practice.buildTemplateRun({
    sectionKey: "sat-math", templates: mathTemplates, count: 5, seed: "rt1", instantiate: S.instantiate,
  });
  const retiredId = run.templateIds[0];
  const live = mathTemplates.filter((template) => template.id !== retiredId);
  const again = Practice.rebuildRun({
    code: run.setCode, templates: live, registry: mathRegistry, instantiate: S.instantiate,
  });
  assert.equal(again.missing, 1);
  assert.deepEqual(again.questions.map((question) => question.id).sort(),
    run.questions.filter((question) => question.templateId !== retiredId).map((question) => question.id).sort());
});

test("recency comes from serve numbers, and the old lifetime mask counts as oldest", () => {
  let progress = Progress.empty({ epoch: "e1" });
  const [first, second, third] = mathTemplates;
  progress = Progress.serveTemplates(progress, "sat-math", {
    templateIds: [second.id],
    mask: Mask.toCode(Mask.fromBits([first.bit, second.bit])),
  });
  const recency = Practice.recencyFor(Progress.historyFor(progress, "sat-math"), [first, second, third]);
  assert.deepEqual(recency, { [first.id]: 0, [second.id]: 1 });
});

test("a template mini test keeps sections in order and mixes tiers inside each", () => {
  const blueprint = Core.blueprintById("sat");
  const built = Practice.templateMiniTest({
    blueprint,
    seed: "mini1",
    sections: {
      "sat-reading-writing": { templates: rwTemplates },
      "sat-math": { templates: mathTemplates },
    },
    instantiate: S.instantiate,
  });
  assert.equal(built.questions.length, Core.blueprintTotal(blueprint));
  const sections = built.questions.map((question) => question.sectionKey);
  const firstMath = sections.indexOf("sat-math");
  assert.ok(sections.slice(0, firstMath).every((key) => key === "sat-reading-writing"));
  assert.ok(sections.slice(firstMath).every((key) => key === "sat-math"));
  const tierOrder = { Easy: 0, Medium: 1, Hard: 2 };
  const rwTiers = built.questions.slice(0, firstMath).map((question) => tierOrder[question.difficulty]);
  const sorted = rwTiers.slice().sort((a, b) => a - b);
  assert.notDeepEqual(rwTiers, sorted, "tiers are shuffled, not Easy then Medium then Hard");
  assert.equal(built.runs.length, 6);
  const again = Practice.templateMiniTest({
    blueprint,
    seed: "mini1",
    sections: {
      "sat-reading-writing": { templates: rwTemplates },
      "sat-math": { templates: mathTemplates },
    },
    instantiate: S.instantiate,
  });
  assert.deepEqual(again.questions.map((question) => question.id), built.questions.map((question) => question.id));
});

test("Learn links use the build's slug rule for every catalog skill", () => {
  for (const section of catalog.sections.filter((entry) => Practice.LEARN_SECTIONS.includes(entry.key))) {
    for (const domain of section.domains) {
      for (const skill of Object.keys(domain.skills)) {
        assert.equal(Practice.slug(skill), toolSlug(skill));
        assert.equal(Practice.learnPageId(section.key, domain.name, skill),
          `${section.key}/${toolSlug(domain.name)}/${toolSlug(skill)}`);
        assert.deepEqual(Practice.findSkill(section, toolSlug(skill)), { domain: domain.name, skill });
      }
    }
  }
  assert.equal(Practice.learnHref({
    sectionKey: "sat-math", domain: "Algebra", skill: "Linear inequalities", subskill: "Solve inequalities",
  }), "learn.html#sat-math/algebra/linear-inequalities/solve-inequalities");
  assert.equal(Practice.learnHref({ sectionKey: "sat-math", domain: "Algebra", skill: "Linear functions" }),
    "learn.html#sat-math/algebra/linear-functions");
  assert.equal(Practice.learnHref({ sectionKey: "act-english", domain: "x", skill: "y" }), null);
  assert.equal(Practice.slug("Problem-Solving & Data Analysis"), "problem-solving-and-data-analysis");
});

test("routes and the practice deep link", () => {
  assert.deepEqual(Practice.parseRoute("#practice/sat-math/linear-functions"),
    { view: "practice", params: ["sat-math", "linear-functions"] });
  assert.deepEqual(Practice.parseRoute(""), { view: null, params: [] });
  assert.deepEqual(Practice.parseRoute("#progress"), { view: "progress", params: [] });
  assert.equal(Practice.practiceHash("sat-math", "Linear functions"), "#practice/sat-math/linear-functions");
});

test("domain weights come from catalog targets", () => {
  assert.deepEqual(Practice.domainWeights(mathSection), Object.fromEntries(
    mathSection.domains.map((domain) => [domain.name, domain.target]),
  ));
  assert.equal(Practice.domainWeights({ domains: [] }), null);
});

test("helpers for review sets, filters, and registries", () => {
  const questions = [
    { id: "a", templateId: "t1" }, { id: "b", templateId: "t1" }, { id: "c" }, { id: "c" },
  ];
  assert.deepEqual(Practice.onePerTemplate(questions).map((question) => question.id), ["a", "c"]);
  assert.deepEqual(Practice.runFilters("targeted", { skills: ["x"] }), { skills: ["x"] });
  assert.deepEqual(Practice.runFilters("adaptive", { skills: ["x"] }, { skill: "Circles" }), { skills: ["Circles"] });
  assert.deepEqual(Practice.runFilters("adaptive", {}, null), {});
  assert.deepEqual(Practice.runFilters("full", { skills: ["x"] }), {});
  assert.deepEqual(Practice.missedTemplateIds([
    { question: { templateId: "t1" }, answered: true, correct: true },
    { question: { templateId: "t2" }, answered: true, correct: false },
    { question: { templateId: "t3" }, answered: false, correct: false },
    { question: { templateId: "t2" }, answered: false, correct: false },
    { question: { id: "bank" }, answered: false, correct: false },
  ]), ["t2", "t3"]);
  assert.deepEqual(Practice.templateVersions({ templates: [{ id: "a", version: 3 }, { id: "b" }] }), { a: 3, b: 1 });
  assert.equal(Practice.templateCount({ templates: [{ id: "a" }, { id: "b", retired: true }] }), 1);
  assert.ok(/^[0-9a-z]+$/.test(Practice.newRunSeed()));
});

test("a skill drill takes several seeds per template, never the same item twice", () => {
  const drill = Practice.buildDrill({
    sectionKey: "sat-math", templates: mathTemplates, skill: "Circles", difficulty: "Hard", count: 10, seed: "d1",
    instantiate: S.instantiate,
  });
  // Counted from the live templates, so growing a skill does not break the test.
  const cell = mathTemplates.filter((entry) => entry.skill === "Circles" && entry.difficulty === "Hard").length;
  assert.ok(cell >= 2, "a drill cell holds at least two templates");
  assert.equal(drill.templates, cell);
  assert.equal(drill.questions.length, 10);
  assert.ok(drill.questions.every((question) => question.skill === "Circles" && question.difficulty === "Hard"));
  assert.equal(new Set(drill.questions.map((question) => question.id)).size, 10);
  assert.equal(new Set(drill.questions.map(Practice.itemKey)).size, 10, "every item distinct");
  // Round by round, so the templates alternate rather than bunch: no
  // template is used more than once more than any other.
  const counts = {};
  drill.questions.forEach((question) => { counts[question.templateId] = (counts[question.templateId] || 0) + 1; });
  assert.equal(Object.keys(counts).length, Math.min(cell, 10));
  assert.ok(Math.max(...Object.values(counts)) - Math.min(...Object.values(counts)) <= 1);
  assert.equal(drill.served.length, Math.ceil(10 / cell));
  drill.served.forEach((round) => {
    assert.ok(round.templateIds.length >= 1 && round.templateIds.length <= cell);
    assert.ok(round.mask && round.mask !== "0");
  });
  // Rebuildable from ids, like any generated question.
  const [first] = drill.questions;
  const parsed = Progress.parseQuestionId(first.id);
  const template = mathTemplates.find((entry) => entry.id === parsed.templateId);
  assert.equal(S.instantiate(template.family, parsed.seed).stem, first.stem);
  // The same seed gives the same drill.
  const again = Practice.buildDrill({
    sectionKey: "sat-math", templates: mathTemplates, skill: "Circles", difficulty: "Hard", count: 10, seed: "d1",
    instantiate: S.instantiate,
  });
  assert.deepEqual(again.questions.map((question) => question.id), drill.questions.map((question) => question.id));
});

test("a drill shows scenes new to the student first", () => {
  const options = {
    sectionKey: "sat-reading-writing", templates: rwTemplates, skill: "Words in Context", difficulty: "Hard",
    count: 8, seed: "w", instantiate: S.instantiate,
  };
  const first = Practice.buildDrill(options);
  const scenes = first.questions.map((question) => question.scene).filter(Boolean);
  assert.equal(new Set(scenes).size, scenes.length, "no scene twice in one drill");
  let progress = Progress.empty();
  first.served.forEach((round) => { progress = Progress.serveTemplates(progress, "sat-reading-writing", round); });
  const second = Practice.buildDrill({ ...options, seed: "x", history: Progress.historyFor(progress, "sat-reading-writing") });
  const again = second.questions.filter((question) => scenes.includes(question.scene));
  assert.deepEqual(again.map((question) => question.scene), [], "the next drill moves on to unseen scenes");
});

test("a drill covers every tier when none is chosen, and is empty when nothing matches", () => {
  const all = Practice.buildDrill({
    sectionKey: "sat-math", templates: mathTemplates, skill: "Circles", count: 12, seed: "e", instantiate: S.instantiate,
  });
  assert.equal(all.templates, mathTemplates.filter((entry) => entry.skill === "Circles").length);
  assert.deepEqual([...new Set(all.questions.map((question) => question.difficulty))].sort(), ["Easy", "Hard", "Medium"]);
  const none = Practice.buildDrill({
    sectionKey: "sat-math", templates: mathTemplates, skill: "Not a skill", count: 5, instantiate: S.instantiate,
  });
  assert.deepEqual(none, { questions: [], templates: 0, served: [] });
});

test("a module run keeps the module's order and names every template it chose", () => {
  const run = Practice.buildModuleRun({
    sectionKey: "sat-math", module: "h", templates: mathTemplates, seed: "mod1", instantiate: S.instantiate,
  });
  assert.equal(run.spec.size, 22);
  assert.equal(run.questions.length, 22);
  assert.deepEqual(run.chosenIds, run.templateIds);
  const tiers = run.questions.map((question) => ["Easy", "Medium", "Hard"].indexOf(question.difficulty));
  assert.deepEqual(tiers, tiers.slice().sort((a, b) => a - b), "Math runs Easy to Hard");
  assert.equal(run.setCode, `math-${run.code}`);
  // Its set code rebuilds the same questions as a practice set.
  const again = Practice.rebuildRun({ code: run.setCode, templates: mathTemplates, instantiate: S.instantiate });
  assert.deepEqual(again.questions.map((question) => question.id).sort(), run.questions.map((question) => question.id).sort());
  // Excluded templates and avoided scenes stay out.
  const next = Practice.buildModuleRun({
    sectionKey: "sat-math", module: "e", templates: mathTemplates, seed: "mod2", exclude: run.chosenIds,
    instantiate: S.instantiate,
  });
  assert.deepEqual(next.chosenIds.filter((id) => run.chosenIds.includes(id)), []);
});
