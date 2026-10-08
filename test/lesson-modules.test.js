"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { loadModules, validateModule, moduleIndex, build } = require("../tools/build-lesson-modules.js");
const { loadCurriculum } = require("../tools/build-curriculum.js");
const Engine = require("../src/lib/lesson-modules/engine.js");
const MathTools = require("../src/lib/lesson-modules/math.js");
const ROOT = path.resolve(__dirname, "..");
const generators = path.join(ROOT, "src/lib/lesson-modules");
const data = loadModules();
const moduleData = data.modules[0];
const templates = Engine.templatesForModule(moduleData.id);
const curriculum = loadCurriculum();
function fixture(t) {
  const scratch = path.join(ROOT, ".scratch/grade-modules-core");
  fs.mkdirSync(scratch, { recursive: true });
  const directory = fs.mkdtempSync(path.join(scratch, "admission-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const options = { directory: path.join(directory, "content"), generatorDirectory: path.join(directory, "generators"),
    output: path.join(directory, "output"), samples: [] };
  fs.cpSync(path.join(ROOT, "content/lesson-modules"), options.directory, { recursive: true });
  fs.cpSync(generators, options.generatorDirectory, { recursive: true });
  return options;
}
function write(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n"); }
function browserLoad(context, directory, scripts) {
  for (const script of scripts) vm.runInContext(fs.readFileSync(path.join(directory, script), "utf8"), context, { filename: script });
}

test("module identity is its declared pathway and grade, with stable legacy IDs and partial scope", () => {
  assert.equal(data.modules.length, 1);
  assert.equal(moduleData.id, "grade-8-math");
  assert.equal(moduleData.trackId, "common-core-math");
  assert.equal(moduleData.grade, 8);
  assert.equal(moduleData.parentCourseId, "ccss-math-8");
  assert.equal(moduleData.units.length, 4);
  assert.equal(Engine.lessons(moduleData).length, 36);
  assert.equal(templates.length, 85);
  assert.match(moduleData.scopeNote, /does not cover the full Grade 8/);
  assert.deepEqual(moduleData.units.map(unit => unit.planUnitIds), [["u1"], ["u2"], ["u3"], ["u4"]]);
  const first = Engine.lessons(moduleData)[0];
  assert.deepEqual(first.standards, ["8.NS.1"]);
  assert.deepEqual(first.sourceStandards, ["8.NS.A.1"]);
  assert.equal(Engine.templatesForCourse, Engine.templatesForModule);
  const index = moduleIndex(data);
  assert.equal(index.modules[0].file, "content/lesson-modules/common-core-math/8/module.json");
  assert.equal(index.modules[0].units[0].lessonIds[0], "1-1");
  assert.ok(!JSON.stringify(index).includes(first.examples[0].prompt), "index must not bundle lesson bodies");
});

test("admission rejects wrong parent identity, standards, units, directions and incomplete lesson support", () => {
  const entry = data.catalog.modules[0];
  for (const [mutate, message] of [
    [module => { module.trackId = "singapore-math"; }, /identity/],
    [module => { module.grade = 7; }, /identity/],
    [module => { module.units[0].lessons[0].standards = ["7.NS.1"]; }, /parent standard/],
    [module => { module.units[0].lessons[0].standards = ["8.NS.A.1"]; }, /parent standard/],
    [module => { module.units[0].lessons[0].standards = ["8.NS.999"]; }, /parent standard/],
    [module => { module.units[0].planUnitIds = ["unknown"]; }, /parent unit/],
    [module => { module.units[0].planUnitIds = ["u5"]; }, /no related lesson standards/],
    [module => { delete module.expectations[templates[0].id]; }, /problem directions/],
    [module => { module.expectations.unknown = module.expectations[templates[0].id]; }, /unknown template/],
    [module => { delete module.units[0].lessons[0].readiness; }, /readiness/],
    [module => { module.units[0].lessons[0].bridge.afterExample = 99; }, /bridge example/],
  ]) {
    const changed = structuredClone(moduleData);
    mutate(changed);
    assert.throws(() => validateModule(changed, entry, templates, curriculum), message);
  }
  assert.throws(() => validateModule(moduleData, entry, templates.slice(1).filter(t => t.lessonId !== "1-1"), curriculum), /unknown template|no exercises/);
  const wrongParent = structuredClone(moduleData);
  wrongParent.trackId = "missing-track";
  assert.throws(() => validateModule(wrongParent, { ...entry, trackId: wrongParent.trackId }, templates, curriculum), /unknown curriculum parent/);
});

test("catalog rejects duplicate parents, paths outside the module and undeclared generator dependencies", t => {
  const options = fixture(t);
  const catalogFile = path.join(options.directory, "catalog.json");
  const original = structuredClone(data.catalog);
  for (const [mutate, message] of [
    [catalog => { catalog.modules.push({ ...catalog.modules[0], id: "different-id" }); }, /duplicate module entry/],
    [catalog => { catalog.modules[0].file = "../other.json"; }, /curriculum parent/],
    [catalog => { catalog.modules[0].generatorSources.splice(2, 1); }, /undeclared or misordered/],
    [catalog => { catalog.modules[0].generatorSources.reverse(); }, /undeclared or misordered/],
  ]) {
    const changed = structuredClone(original);
    mutate(changed);
    write(catalogFile, changed);
    assert.throws(() => loadModules(options), message);
  }
});

test("shared browser engine never auto-loads a grade; explicit scripts register the chosen grade", () => {
  const context = vm.createContext({});
  browserLoad(context, generators, ["math.js", "registry.js", "engine.js"]);
  assert.throws(() => context.LiminalCourses.templatesForModule("grade-8-math"), /No generators registered/);
  const scripts = data.catalog.modules[0].generatorSources.filter(file => !["math.js", "registry.js", "engine.js"].includes(file));
  browserLoad(context, generators, scripts);
  assert.equal(context.LiminalCourses.templatesForModule("grade-8-math").length, 85);
  const options = { lessonIds: ["1-1"], count: 4, seed: "browser-explicit-load", practiceMode: "rebuild" };
  const browser = context.LiminalCourses.generateWorksheet(moduleData, context.LiminalCourses.templatesForModule(moduleData.id), options);
  const node = Engine.generateWorksheet(moduleData, templates, options);
  assert.equal(JSON.stringify(browser), JSON.stringify(node));
  const registry = context.LiminalLessonModuleRegistry;
  assert.equal(registry.forParent("common-core-math", 8).id, moduleData.id);
  assert.equal(registry.forParent("common-core-math", 7), null);
  assert.throws(() => registry.register({ id: "duplicate-parent", trackId: "common-core-math", grade: 8 }, templates), /Duplicate lesson module parent/);
  assert.throws(() => registry.register({ id: moduleData.id, trackId: "common-core-math", grade: 7 }, templates), /Conflicting/);
});

test("a synthetic second grade builds and runs through the same catalog, browser registry and engine", t => {
  const options = fixture(t);
  const key = "common-core-math/2";
  const id = "fixture-grade-2-math";
  const task = { prompt: "Add 2 and 3.", answer: "5", steps: ["Count three after two."] };
  const module = { id, trackId: "common-core-math", grade: 2, version: 1, subject: "Mathematics",
    title: "Synthetic Grade 2 fixture", description: "Admission test fixture, never published.", scopeNote: "One synthetic lesson only.",
    units: [{ id: "adding", title: "Adding", planUnitIds: ["u1"], lessons: [{ id: "adding-1", title: "Add two numbers",
      objective: "Add.", standards: ["2.OA.1"], explanation: ["Combine the counts."], examples: [task, task], pitfalls: ["Keep both counts."],
      practiceAdvice: "Check the sum.", readiness: { ...task, repair: "Count the objects." },
      bridge: { ...task, starter: "Start with two.", stepsToComplete: ["Count three more."] } }] }] };
  const track = curriculum.tracks.find(track => track.track.id === module.trackId);
  module.units[0].planUnitIds = [track.courses.find(course => course.grade === 2).units.find(unit => unit.standards.includes("2.OA.1")).id];
  const directory = path.join(options.directory, key);
  const sourceDirectory = path.join(options.generatorDirectory, key);
  fs.mkdirSync(directory, { recursive: true });
  fs.mkdirSync(sourceDirectory, { recursive: true });
  write(path.join(directory, "module.json"), module);
  write(path.join(directory, "expectations.json"), { "fixture-add": { byHand: "Add by hand.", calculator: "No calculator.", showWork: "Show a sum.", answerForm: "A whole number.", firstStep: "Write both numbers.", check: "Count again." } });
  fs.writeFileSync(path.join(sourceDirectory, "index.js"), `(function(root) {
    const registry = typeof module === "object" && module.exports ? require("../../registry.js") : root.LiminalLessonModuleRegistry;
    const entry = registry.register({ id: "${id}", trackId: "common-core-math", grade: 2 }, [{ id: "fixture-add", lessonId: "adding-1", skill: "Add", generate(rng) {
      const a = rng.int(1, 100), b = rng.int(1, 100);
      return { prompt: a + " + " + b, answer: String(a + b), steps: ["Add the numbers."], workLines: 2, practiceKey: a + ":" + b };
    } }]);
    if (typeof module === "object" && module.exports) module.exports = entry;
  })(globalThis);\n`);
  const catalog = structuredClone(data.catalog);
  catalog.modules.push({ id, trackId: module.trackId, grade: 2, subject: module.subject, title: module.title,
    file: key + "/module.json", expectations: key + "/expectations.json",
    generatorSources: ["math.js", "registry.js", key + "/index.js", "engine.js"] });
  write(path.join(options.directory, "catalog.json"), catalog);
  const built = build(options);
  assert.equal(built.modules.length, 2);
  const indexContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(options.output, "lesson-modules.js"), "utf8"), indexContext);
  const entry = indexContext.window.LIMINAL_LESSON_MODULES.modules.find(entry => entry.grade === 2);
  const generatedModule = JSON.parse(fs.readFileSync(path.join(options.output, "lesson-modules", key, "module.json")));
  assert.equal(generatedModule.id, id);
  const context = vm.createContext({});
  browserLoad(context, options.generatorDirectory, entry.generatorScripts.map(file => file.replace("lib/lesson-modules/", "")));
  assert.throws(() => context.LiminalCourses.templatesForModule("grade-8-math"), /No generators registered/);
  const designs = context.LiminalCourses.templatesForModule(id);
  const nights = context.LiminalCourses.generatePacketChoices(generatedModule, designs, { days: 1, count: 2, seed: "second-grade" });
  assert.equal(nights[0].worksheets.length, 3);
  assert.equal(new Set(nights[0].worksheets.flatMap(sheet => sheet.identities)).size, 6);
  assert.ok(nights[0].worksheets.every(sheet => sheet.questions.every(question => question.expectations.answerForm === "A whole number.")));
  const originalRevision = built.modules[0].revision;
  const secondRevision = built.modules[1].revision;
  fs.appendFileSync(path.join(sourceDirectory, "index.js"), "// A change confined to this fixture grade.\n");
  const changed = loadModules(options);
  assert.equal(changed.modules[0].revision, originalRevision, "unrelated grade sources must not change Grade 8 replay");
  assert.notEqual(changed.modules[1].revision, secondRevision);
});

test("migration preserves legacy generated content, question IDs, seeds and packet schedules", () => {
  // Captured from commit 55434b3 before moving any source. Revision-dependent
  // form codes and worksheet versions intentionally change with source paths.
  const direct = templates.map(template => ({ id: template.id, draws: Array.from({ length: 40 }, (_, i) => template.generate(MathTools.random("module-migration/" + i))) }));
  const packets = [];
  for (const mode of ["review", "rebuild"]) for (const unit of moduleData.units) {
    const nights = Engine.generatePacketChoices(moduleData, templates, { lessonIds: unit.lessons.map(lesson => lesson.id),
      practiceMode: mode, seed: "module-migration", days: 5, count: 8 }).map(night => ({ ...night,
      worksheets: night.worksheets.map(({ code, revision, version, ...sheet }) => sheet) }));
    packets.push({ mode, unit: unit.id, nights });
  }
  const hash = crypto.createHash("sha256").update(JSON.stringify({ direct, packets })).digest("hex");
  assert.equal(hash, "4d1f70105d1a6d28990cca2210a2a97d98231ba05810e9bb6bed1533fcdb5843");
});
