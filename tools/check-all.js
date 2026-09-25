#!/usr/bin/env node
"use strict";

// The full gate: syntax, complete content validation, a fresh build, a smoke
// test of the built site, the study-guide links, and the unit tests.

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

// Every browser script under src/, so a new module is syntax-checked without
// anyone remembering to list it.
function scripts(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return scripts(file);
    return entry.name.endsWith(".js") ? [file] : [];
  });
}

const checks = [
  ...scripts("src").sort().map((file) => ["node", ["--check", file]]),
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
