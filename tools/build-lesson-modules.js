#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const Engine = require("../src/lib/lesson-modules/engine.js");
const { loadSamples } = require("./build-work-samples.js");
const { loadCurriculum } = require("./build-curriculum.js");
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const directions = ["byHand", "calculator", "showWork", "answerForm", "firstStep", "check"];
function assert(condition, message) { if (!condition) throw new Error("Lesson modules: " + message); }
function text(value) { return typeof value === "string" && Boolean(value.trim()); }
function identifier(value) { return typeof value === "string" && slug.test(value); }
function strings(value) { return Array.isArray(value) && value.length > 0 && value.every(text); }
function unique(value) { return new Set(value).size === value.length; }
function sourcePath(directory, file, extension) {
  assert(typeof file === "string" && new RegExp("^[a-z0-9-]+(?:/[a-z0-9-]+)*\\." + extension + "$").test(file), "invalid source path: " + file);
  const resolved = path.resolve(directory, file);
  const base = fs.realpathSync(directory) + path.sep;
  assert(fs.realpathSync(resolved).startsWith(base), "source escapes its directory: " + file);
  return resolved;
}
function validateModule(module, entry, templates, curriculum) {
  assert(module.id === entry.id && module.trackId === entry.trackId && module.grade === entry.grade &&
    module.subject === entry.subject && module.title === entry.title && Number.isInteger(module.version) && module.version > 0,
  "invalid module identity: " + entry.id);
  const track = curriculum.tracks.find(track => track.track.id === module.trackId);
  const parent = track && track.courses.find(course => course.grade === module.grade);
  assert(parent && track.track.subject === module.subject, "unknown curriculum parent: " + module.trackId + "/" + module.grade);
  const parentStandards = new Set(parent.units.flatMap(unit => unit.standards));
  const trackStandards = new Set(track.standards.map(standard => standard.id));
  for (const field of ["title", "subject", "description", "scopeNote"]) assert(text(module[field]), "missing module " + field);
  assert(Array.isArray(module.units) && module.units.length, "module has no units");
  const units = new Set();
  const lessons = new Set();
  for (const unit of module.units) {
    assert(identifier(unit.id) && text(unit.title) && !units.has(unit.id) && Array.isArray(unit.lessons) && unit.lessons.length,
      "invalid module unit");
    units.add(unit.id);
    assert(strings(unit.planUnitIds) && unique(unit.planUnitIds) && unit.planUnitIds.every(id => parent.units.some(unit => unit.id === id)),
      "invalid parent unit mapping: " + unit.id);
    for (const lesson of unit.lessons) {
      assert(identifier(lesson.id) && !lessons.has(lesson.id) && text(lesson.title) && text(lesson.objective) && text(lesson.practiceAdvice), "invalid lesson");
      lessons.add(lesson.id);
      assert(strings(lesson.standards) && unique(lesson.standards) && lesson.standards.every(id => trackStandards.has(id) && parentStandards.has(id)),
        "unknown parent standard in " + lesson.id);
      for (const field of ["explanation", "pitfalls"]) assert(strings(lesson[field]), "missing " + field + " in " + lesson.id);
      assert(Array.isArray(lesson.examples) && lesson.examples.length >= 2, "missing worked examples in " + lesson.id);
      for (const example of lesson.examples) {
        Engine.validateQuestion({ ...example, workLines: 3 });
        Engine.validateQuestion({ ...example, table: example.solutionTable, graph: example.solutionGraph, workLines: 3 });
      }
      for (const field of ["readiness", "bridge"]) {
        assert(lesson[field], "missing " + field + " in " + lesson.id);
        Engine.validateQuestion({ ...lesson[field], workLines: 3 });
      }
      assert(text(lesson.readiness.repair) && text(lesson.bridge.starter) && strings(lesson.bridge.stepsToComplete),
        "missing learning support in " + lesson.id);
      const afterExample = lesson.bridge.afterExample === undefined ? 1 : lesson.bridge.afterExample;
      assert(Number.isInteger(afterExample) && afterExample >= 1 && afterExample <= lesson.examples.length,
        "invalid bridge example position in " + lesson.id);
    }
    const standards = new Set(unit.lessons.flatMap(lesson => lesson.standards));
    assert(unit.planUnitIds.every(id => parent.units.find(unit => unit.id === id).standards.some(id => standards.has(id))),
      "parent unit has no related lesson standards: " + unit.id);
  }
  assert(Array.isArray(templates) && templates.length && unique(templates.map(template => template.id)), "missing or duplicate module templates");
  assert(module.expectations && typeof module.expectations === "object" && !Array.isArray(module.expectations), "missing problem directions");
  for (const template of templates) {
    assert(lessons.has(template.lessonId) && text(template.id) && text(template.skill) && typeof template.generate === "function",
      "invalid template " + template.id);
    const guidance = module.expectations[template.id];
    assert(guidance && directions.every(key => text(guidance[key])), "missing problem directions: " + template.id);
  }
  assert(Object.keys(module.expectations).every(id => templates.some(template => template.id === id)), "problem directions refer to an unknown template");
  for (const lesson of Engine.lessons(module)) {
    assert(templates.some(template => template.lessonId === lesson.id), "no exercises for lesson " + lesson.id);
    assert(lesson.rebuildOrder === undefined || (Array.isArray(lesson.rebuildOrder) && unique(lesson.rebuildOrder) &&
      lesson.rebuildOrder.every(id => templates.some(template => template.id === id && template.lessonId === lesson.id))),
    "invalid rebuild order in " + lesson.id);
  }
  return { track, parent };
}
function loadModules(options = {}) {
  const directory = options.directory || path.join(ROOT, "content/lesson-modules");
  const generatorDirectory = options.generatorDirectory || path.join(ROOT, "src/lib/lesson-modules");
  const curriculum = options.curriculum || loadCurriculum();
  const samples = options.samples || loadSamples();
  const catalog = JSON.parse(fs.readFileSync(path.join(directory, "catalog.json"), "utf8"));
  assert(catalog.version === 1 && Array.isArray(catalog.modules), "invalid catalog");
  const ids = new Set();
  const parents = new Set();
  const boundSamples = new Set();
  const modules = catalog.modules.map(entry => {
    const key = entry.trackId + "/" + entry.grade;
    assert(identifier(entry.id) && identifier(entry.trackId) && Number.isInteger(entry.grade) && entry.grade >= 0 && entry.grade <= 12 &&
      !ids.has(entry.id) && !parents.has(key), "invalid or duplicate module entry: " + key);
    ids.add(entry.id);
    parents.add(key);
    assert(entry.file === key + "/module.json" && entry.expectations === key + "/expectations.json", "module sources must live under their curriculum parent");
    assert(strings(entry.generatorSources) && unique(entry.generatorSources) &&
      ["math.js", "registry.js", key + "/index.js", "engine.js"].every(file => entry.generatorSources.includes(file)), "missing generator source declarations");
    const source = fs.readFileSync(sourcePath(directory, entry.file, "json"), "utf8");
    const expectationSource = fs.readFileSync(sourcePath(directory, entry.expectations, "json"), "utf8");
    const module = JSON.parse(source);
    module.expectations = JSON.parse(expectationSource);
    const generatorSources = entry.generatorSources.map(file => {
      const resolved = sourcePath(generatorDirectory, file, "js");
      return { file, path: resolved, text: fs.readFileSync(resolved, "utf8") };
    });
    for (const [index, source] of generatorSources.entries()) {
      // Literal local dependencies are also browser prerequisites. Requiring
      // each source prevents a Node-only import from hiding an omitted script
      // or leaving part of the generator outside the revision fingerprint.
      for (const match of source.text.matchAll(/require\((["'])(\.{1,2}\/[^"']+)\1\)/g)) {
        const dependency = path.resolve(path.dirname(source.path), match[2]);
        assert(generatorSources.slice(0, index).some(source => source.path === dependency),
          "undeclared or misordered generator dependency: " + source.file + " -> " + match[2]);
      }
    }
    for (const source of generatorSources) require(source.path);
    const registry = require(path.join(generatorDirectory, "registry.js"));
    const registered = registry.get(entry.id);
    assert(registered.trackId === entry.trackId && registered.grade === entry.grade, "generator parent does not match catalog: " + entry.id);
    const { track, parent } = validateModule(module, entry, registered.templates, curriculum);
    for (const lesson of Engine.lessons(module)) {
      lesson.workSamples = samples.filter(sample => sample.courseId === module.id && sample.lessonId === lesson.id);
      lesson.workSamples.forEach(sample => boundSamples.add(sample.id));
    }
    module.trackTitle = track.track.title;
    module.parentCourseId = parent.id;
    module.generatorScripts = entry.generatorSources.map(file => "lib/lesson-modules/" + file);
    // Bind replay to this module's declared sources, not unrelated grades.
    const hash = crypto.createHash("sha256").update(source).update(expectationSource).update(JSON.stringify(entry));
    hash.update(JSON.stringify(samples.filter(sample => sample.courseId === module.id)));
    for (const source of generatorSources) hash.update(source.file).update(source.text);
    module.revision = hash.digest("hex").slice(0, 16);
    return module;
  });
  assert(samples.every(sample => boundSamples.has(sample.id)), "work sample refers to an unknown module or lesson");
  return { catalog, modules };
}
function moduleIndex(data) {
  return { version: data.catalog.version, modules: data.modules.map(module => {
    const entry = data.catalog.modules.find(entry => entry.id === module.id);
    return { id: module.id, trackId: module.trackId, trackTitle: module.trackTitle, grade: module.grade,
      subject: module.subject, title: module.title, scopeNote: module.scopeNote, revision: module.revision,
      parentCourseId: module.parentCourseId, file: "content/lesson-modules/" + entry.file,
      generatorScripts: module.generatorScripts,
      units: module.units.map(unit => ({ id: unit.id, title: unit.title, planUnitIds: unit.planUnitIds,
        lessonIds: unit.lessons.map(lesson => lesson.id) })) };
  }) };
}
function build(options = {}) {
  const data = loadModules(options);
  const output = options.output || path.join(ROOT, "dist/content");
  fs.mkdirSync(output, { recursive: true });
  for (const module of data.modules) {
    const entry = data.catalog.modules.find(entry => entry.id === module.id);
    const file = path.join(output, "lesson-modules", entry.file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(module) + "\n");
  }
  const json = JSON.stringify(moduleIndex(data)).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  fs.writeFileSync(path.join(output, "lesson-modules.js"), "/* Generated grade lesson module index. */\nwindow.LIMINAL_LESSON_MODULES = " + json + ";\n");
  console.log("Built " + data.modules.length + " grade lesson module(s).");
  return data;
}
module.exports = { loadModules, validateModule, moduleIndex, build };
if (require.main === module) build();
