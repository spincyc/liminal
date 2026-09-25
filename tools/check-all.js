#!/usr/bin/env node
"use strict";

// The full gate: syntax, complete content validation, a fresh build, a smoke
// test of the built site, the study-guide links, and the unit tests.

const { spawnSync } = require("node:child_process");

const checks = [
  ["node", ["--check", "src/app/app.js"]],
  ["node", ["--check", "src/app/print.js"]],
  ["node", ["--check", "src/app/site.js"]],
  ["node", ["--check", "src/lib/core.js"]],
  ["node", ["--check", "src/lib/booklet.js"]],
  ["node", ["--check", "src/lib/template-mask.js"]],
  ["node", ["--check", "src/lib/runs.js"]],
  ["node", ["--check", "src/lib/test-engine.js"]],
  ["node", ["--check", "src/app/render.js"]],
  ["node", ["--check", "src/app/test-shell.js"]],
  ["node", ["tools/validate-content.js", "--complete"]],
  ["node", ["tools/check-answer-positions.js"]],
  ["node", ["tools/update-templates.js", "--check"]],
  ["node", ["tools/check-families.js"]],
  ["node", ["tools/build.js"]],
  ["node", ["tools/smoke-static.js"]],
  ["node", ["tools/check-guides.js"]],
  ["node", ["--test", "test/**/*.test.js"]],
];

for (const [command, args] of checks) {
  console.log(`> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("All checks passed.");
