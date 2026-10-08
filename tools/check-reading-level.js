#!/usr/bin/env node
"use strict";
// Validates the reading-level probe set. Levels whose probes (or grade files)
// are not written yet are reported, not failed; --complete requires them.
// --cues lists heuristic answer cues for the author's passage-hidden pass.
const { loadProbes, cueReport } = require("./build-reading-level");
function inspect(options = {}) {
  const { data, resolved, levels, missing, pendingGrades } = loadProbes(options);
  const perLevel = levels.map(level => {
    const probes = resolved.filter(entry => entry.probe.level === level);
    return { level, probes: probes.length, items: probes.reduce((sum, entry) => sum + entry.probe.items.length, 0) };
  });
  return { review: data.review.status, levels: perLevel, probes: resolved.length, items: perLevel.reduce((sum, entry) => sum + entry.items, 0), missing, pendingGrades };
}
module.exports = { inspect };
if (require.main === module) {
  try {
    const report = inspect({ complete: process.argv.includes("--complete") });
    console.log("Reading level: " + report.levels.length + " levels, " + report.probes + " probes, " + report.items + " items (review: " + report.review + ").");
    console.log("Items per level: " + report.levels.map(entry => entry.level + "=" + entry.items).join(", ") + ".");
    if (process.argv.includes("--cues")) { const cues = cueReport(loadProbes().resolved); console.log("Cue report (" + cues.length + "):"); cues.forEach(line => console.log("  " + line)); }
    if (report.missing.length) console.log("Levels without probes yet: " + report.missing.join(", ") + (report.pendingGrades.length ? " (grade files not yet available: " + report.pendingGrades.join(", ") + ")" : "") + ".");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
