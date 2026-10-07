#!/usr/bin/env node
"use strict";
const { loadDailyReading } = require("./build-daily-reading");
const D = require("../src/lib/daily-reading");
function inspect(options = {}) {
  const { courses } = loadDailyReading(options), days = courses.flatMap(course => course.days);
  return { grades: courses.length, nights: days.length, sources: courses.reduce((sum, course) => sum + course.sources.length, 0),
    questions: days.reduce((sum, day) => sum + day.questions.length, 0),
    missing: D.GRADES.filter(grade => !courses.some(course => course.grade === grade)) };
}
module.exports = { inspect };
if (require.main === module) {
  try {
    const report = inspect({ complete: process.argv.includes("--complete"), completeAdvanced: process.argv.includes("--complete-advanced") });
    console.log("Daily reading: " + report.grades + " grades, " + report.nights + " nights, " + report.sources + " source records, " + report.questions + " discussion questions.");
    const absent = (advanced, label) => { const list = report.missing.filter(grade => D.isAdvanced(grade) === advanced); if (list.length) console.log(label + " not yet available: " + list.map(grade => grade === 0 ? "K" : advanced ? D.gradeLabel(grade) : grade).join(", ") + "."); };
    absent(false, "Grades"); absent(true, "Advanced levels");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
