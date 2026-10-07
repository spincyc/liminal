#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const Engine = require("../src/lib/courses/engine.js");
const { loadSamples } = require("./build-work-samples.js");

function loadCourses() {
  const directory = path.join(ROOT, "content/courses");
  const catalog = JSON.parse(fs.readFileSync(path.join(directory, "catalog.json"), "utf8"));
  if (catalog.version !== 1 || !Array.isArray(catalog.courses) || !catalog.courses.length) throw new Error("Invalid course catalog");
  const seen = new Set();
  const samples = loadSamples();
  const boundSamples = new Set();
  const courses = catalog.courses.map(entry => {
    if (!/^[a-z0-9-]+$/.test(entry.id) || seen.has(entry.id) || !/^[a-z0-9-]+\.json$/.test(entry.file)) throw new Error("Invalid course entry");
    seen.add(entry.id);
    const source = fs.readFileSync(path.join(directory, entry.file), "utf8");
    const course = JSON.parse(source);
    const expectationSource = course.id === "grade-8-math"
      ? fs.readFileSync(path.join(directory, "grade-8-expectations.json"), "utf8") : null;
    if (expectationSource) course.expectations = JSON.parse(expectationSource);
    if (course.id !== entry.id || course.grade !== entry.grade || course.subject !== entry.subject ||
      !Number.isInteger(course.grade) || course.grade < 0 || course.grade > 12 ||
      !Number.isInteger(course.version) || course.version < 1) throw new Error("Invalid course identity: " + entry.id);
    for (const field of ["title", "subject", "description", "scopeNote"]) {
      if (typeof course[field] !== "string" || !course[field].trim()) throw new Error("Missing course " + field);
    }
    if (!Array.isArray(course.units) || !course.units.length) throw new Error("Course has no units");
    const units = new Set();
    const lessons = new Set();
    for (const unit of course.units) {
      if (!unit.id || !unit.title || units.has(unit.id) || !Array.isArray(unit.lessons) || !unit.lessons.length) throw new Error("Invalid course unit");
      units.add(unit.id);
      for (const lesson of unit.lessons) {
        if (!lesson.id || lessons.has(lesson.id) || !lesson.title || !lesson.objective || !lesson.practiceAdvice) throw new Error("Invalid lesson");
        lessons.add(lesson.id);
        lesson.workSamples = samples.filter(sample => sample.courseId === course.id && sample.lessonId === lesson.id);
        lesson.workSamples.forEach(sample => boundSamples.add(sample.id));
        for (const field of ["explanation", "pitfalls"]) {
          if (!Array.isArray(lesson[field]) || !lesson[field].length || lesson[field].some(text => typeof text !== "string" || !text.trim())) {
            throw new Error("Missing " + field + " in " + lesson.id);
          }
        }
        if (!Array.isArray(lesson.examples) || lesson.examples.length < 2 || lesson.examples.some(e =>
          typeof e.prompt !== "string" || !e.prompt.trim() || typeof e.answer !== "string" || !e.answer.trim() ||
          !Array.isArray(e.steps) || !e.steps.length || e.steps.some(s => typeof s !== "string" || !s.trim()))) {
          throw new Error("Missing worked examples in " + lesson.id);
        }
        for (const example of lesson.examples) {
          try {
            Engine.validateQuestion({ ...example, workLines: 3 });
            Engine.validateQuestion({ ...example, table: example.solutionTable, graph: example.solutionGraph, workLines: 3 });
          }
          catch (error) { throw new Error(`Invalid worked example in ${lesson.id}: ${error.message}`); }
        }
        if (course.id === "grade-8-math") {
          for (const field of ["readiness", "bridge"]) {
            const task = lesson[field];
            if (!task) throw new Error(`Missing ${field} in ${lesson.id}`);
            Engine.validateQuestion({ ...task, workLines: 3 });
          }
          if (typeof lesson.readiness.repair !== "string" || !lesson.readiness.repair.trim() ||
              typeof lesson.bridge.starter !== "string" || !lesson.bridge.starter.trim() ||
              !Array.isArray(lesson.bridge.stepsToComplete) || !lesson.bridge.stepsToComplete.length ||
              lesson.bridge.stepsToComplete.some(text => typeof text !== "string" || !text.trim())) {
            throw new Error(`Missing learning support in ${lesson.id}`);
          }
          const afterExample = lesson.bridge.afterExample === undefined ? 1 : lesson.bridge.afterExample;
          if (!Number.isInteger(afterExample) || afterExample < 1 || afterExample > lesson.examples.length) {
            throw new Error(`Invalid bridge example position in ${lesson.id}`);
          }
        }
      }
    }
    const templates = Engine.templatesForCourse(course.id);
    if (new Set(templates.map(t => t.id)).size !== templates.length) throw new Error("Duplicate course templates");
    for (const template of templates) {
      if (!lessons.has(template.lessonId) || !template.id || !template.skill || typeof template.generate !== "function") {
        throw new Error("Invalid template " + template.id);
      }
      if (expectationSource) {
        const guidance = course.expectations[template.id];
        if (!guidance || ["byHand", "calculator", "showWork", "answerForm", "firstStep", "check"].some(key =>
          typeof guidance[key] !== "string" || !guidance[key].trim())) throw new Error("Missing problem directions: " + template.id);
      }
    }
    if (expectationSource && Object.keys(course.expectations).some(id => !templates.some(t => t.id === id))) {
      throw new Error("Problem directions refer to an unknown template");
    }
    for (const id of lessons) {
      if (!templates.some(t => t.lessonId === id)) throw new Error("No exercises for lesson " + id);
    }
    for (const lesson of Engine.lessons(course)) {
      if (lesson.rebuildOrder !== undefined && (!Array.isArray(lesson.rebuildOrder) ||
          new Set(lesson.rebuildOrder).size !== lesson.rebuildOrder.length ||
          lesson.rebuildOrder.some(id => !templates.some(t => t.id === id && t.lessonId === lesson.id)))) {
        throw new Error("Invalid rebuild order in " + lesson.id);
      }
    }
    // Binding source to the printed revision makes replay limits explicit after edits.
    const hash = crypto.createHash("sha256").update(source);
    if (expectationSource) hash.update(expectationSource);
    hash.update(JSON.stringify(samples.filter(sample => sample.courseId === course.id)));
    const generatorDirectory = path.join(ROOT, "src/lib/courses");
    for (const file of fs.readdirSync(generatorDirectory).filter(f => f.endsWith(".js")).sort()) {
      hash.update(file).update(fs.readFileSync(path.join(generatorDirectory, file)));
    }
    course.revision = hash.digest("hex").slice(0, 16);
    return course;
  });
  if (samples.some(sample => !boundSamples.has(sample.id))) throw new Error("Work sample refers to an unknown course or lesson");
  return { catalog, courses };
}

function build() {
  const data = loadCourses();
  const output = path.join(ROOT, "dist/content");
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, "courses.js"), "/* Original classroom courses. Generated by tools/build-courses.js. */\nwindow.LIMINAL_COURSES = " +
    JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + ";\n");
  console.log("Built " + data.courses.length + " classroom course(s).");
  return data;
}

module.exports = { loadCourses, build };
if (require.main === module) build();
