#!/usr/bin/env node
"use strict";

const { loadCourses } = require("./build-courses.js");
const M = require("../src/lib/courses/math.js");
const E = require("../src/lib/courses/engine.js");

function check(reps = 300) {
  if (!Number.isInteger(reps) || reps < 1 || reps > 10000) throw new Error("Invalid course sample count");
  const { courses } = loadCourses();
  let designs = 0;
  let draws = 0;
  for (const course of courses) {
    const templates = E.templatesForCourse(course.id);
    const lessons = E.lessons(course);
    for (const template of templates) {
      designs += 1;
      for (let seed = 0; seed < reps; seed += 1) {
        try {
          const question = E.validateQuestion(template.generate(M.random("course-check/" + seed)));
          if (!question.practiceKey) throw new Error("Missing mathematical practice identity");
        }
        catch (error) { throw new Error(template.id + " seed " + seed + ": " + error.message); }
        draws += 1;
      }
    }
    for (const lesson of lessons) {
      const sheet = E.generateWorksheet(course, templates, { lessonIds: [lesson.id], count: 20, seed: "lesson-coverage" });
      if (sheet.questions.length !== 20 || sheet.identities.length !== 20) throw new Error("Lesson drill incomplete");
    }
    const packet = E.generatePacket(course, templates, { lessonIds: course.units[0].lessons.map(l => l.id), count: 20, days: 10, seed: "nightly-practice" });
    if (packet.some(sheet => sheet.warnings.length)) throw new Error("Default ten-night packet exhausted its pool");
    const mixed = E.generatePacket(course, templates, { count: Math.min(100, lessons.length), days: 3, seed: "mixed-coverage" });
    const mixedQuestions = mixed.flatMap(sheet => sheet.questions);
    if (lessons.some(lesson => !mixedQuestions.some(q => q.lessonId === lesson.id))) throw new Error("A mixed packet omitted a selected lesson");
    for (const forms of [packet, mixed]) {
      const items = forms.flatMap(sheet => sheet.questions);
      if (new Set(items.map(E.identity)).size !== items.length || new Set(items.map(E.visibleIdentity)).size !== items.length) throw new Error("Repeated exercise in a course packet");
    }
    console.log(`${course.title}: ${lessons.length} lessons, ${templates.length} designs; default packet has 200 distinct exercises.`);
  }
  console.log(`Course structure and generation passed: ${designs} designs, ${draws} draws. Mathematical and editorial checks run separately.`);
}

module.exports = { check };
if (require.main === module) {
  try {
    const argv = process.argv.slice(2);
    if (argv.length && (argv.length !== 2 || argv[0] !== "--reps")) throw new Error("Usage: node tools/check-courses.js [--reps 3000]");
    check(argv.length ? Number(argv[1]) : 300);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
