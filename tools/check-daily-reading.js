#!/usr/bin/env node
"use strict";
const { loadDailyReading } = require("./build-daily-reading");
function inspect(options = {}) {
  const { courses } = loadDailyReading(options), days = courses.flatMap(course => course.days);
  return { grades: courses.length, nights: days.length, sources: courses.reduce((sum, course) => sum + course.sources.length, 0),
    questions: days.reduce((sum, day) => sum + day.questions.length, 0),
    missing: Array.from({ length: 13 }, (_, grade) => grade).filter(grade => !courses.some(course => course.grade === grade)) };
}
module.exports = { inspect };
if (require.main === module) {
  try {
    const report = inspect({ complete: process.argv.includes("--complete") });
    console.log("Daily reading: " + report.grades + " grades, " + report.nights + " nights, " + report.sources + " source records, " + report.questions + " discussion questions.");
    if (report.missing.length) console.log("Grades not yet available: " + report.missing.map(grade => grade === 0 ? "K" : grade).join(", ") + ".");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
