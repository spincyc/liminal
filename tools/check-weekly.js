#!/usr/bin/env node
"use strict";

// Read-only admission and inventory; unlike the builder this never writes dist.
const { loadWeekly } = require("./build-weekly");
const { GRADE_TRACKS, NAMED_COURSES, courseKey } = require("../src/lib/weekly");

function inspect({ complete = false, ...options } = {}) {
  const { courses, physicalCourses } = loadWeekly(options);
  const expected = [...GRADE_TRACKS.flatMap(trackId => Array.from({ length: 13 }, (_, grade) => ({ trackId, grade }))),
    ...NAMED_COURSES.map(courseId => ({ trackId: "high-school-math", courseId }))];
  const missing = expected.filter(want => !courses.some(course => course.trackId === want.trackId && courseKey(course) === courseKey(want)));
  if (complete && missing.length) throw new Error("Weekly inventory is incomplete: " + missing.map(c => c.trackId + "/" + courseKey(c)).join(", "));
  const weeks = physicalCourses.flatMap(course => course.weeks);
  const worksheets = weeks.flatMap(week => week.worksheets);
  return { courses: physicalCourses.length, courseViews: courses.length,
    aliasViews: courses.length - physicalCourses.length, weeks: weeks.length, worksheets: worksheets.length,
    items: worksheets.reduce((sum, sheet) => sum + sheet.items.length, 0),
    examples: weeks.reduce((sum, week) => sum + week.examples.length, 0), missing };
}

if (require.main === module) {
  try {
    const report = inspect({ complete: process.argv.includes("--complete") });
    console.log("Weekly coursework: " + report.courses + " original courses, " + report.courseViews + " course views (" + report.aliasViews + " reused views), " + report.weeks + " original weeks, " + report.worksheets + " worksheets, " + report.items + " items, " + report.examples + " worked examples.");
    if (report.missing.length) console.log(report.missing.length + " course views remain outside the available inventory.");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { inspect };
