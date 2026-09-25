#!/usr/bin/env node
"use strict";

// Builds the deployable site into dist/: the web app from src/, plus the
// browser bundles generated from the canonical content in content/. dist/ is
// build output and is never committed; GitHub Pages deploys it from CI.

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, "src"), DIST, { recursive: true });

// Validates the canonical banks, then writes dist/content/*.js.
require("./build-content");

fs.copyFileSync(
  path.join(ROOT, "content", "guides", "answer-signs.js"),
  path.join(DIST, "content", "answer-signs.js"),
);

// Serve files as they are; GitHub Pages would otherwise run Jekyll.
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");

console.log("Built dist/");
