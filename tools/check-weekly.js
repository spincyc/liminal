#!/usr/bin/env node
"use strict";

// Read-only admission and inventory; unlike the builder this never writes dist.
const { loadWeekly } = require("./build-weekly");
const { TRACKS } = require("../src/lib/weekly");

function inspect({ complete = false, ...options } = {}) {
  const { courses } = loadWeekly(options);
  const missing = TRACKS.flatMap(trackId => Array.from({ length: 13 }, (_, grade) => ({ trackId, grade })))
    .filter(expected => !courses.some(course => course.trackId === expected.trackId && course.grade === expected.grade));
  if (complete && missing.length) throw new Error("Weekly inventory is incomplete: " + missing.map(c => c.trackId + "/" + (c.grade || "k")).join(", "));
  const weeks = courses.flatMap(course => course.weeks);
  const worksheets = weeks.flatMap(week => week.worksheets);
  return { courses: courses.length, weeks: weeks.length, worksheets: worksheets.length,
    items: worksheets.reduce((sum, sheet) => sum + sheet.items.length, 0),
    examples: weeks.reduce((sum, week) => sum + week.examples.length, 0), missing };
}

if (require.main === module) {
  try {
    const report = inspect({ complete: process.argv.includes("--complete") });
    console.log("Weekly coursework: " + report.courses + " courses, " + report.weeks + " weeks, " + report.worksheets + " worksheets, " + report.items + " items, " + report.examples + " worked examples.");
    if (report.missing.length) console.log(report.missing.length + " courses remain outside the available inventory.");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { inspect };
