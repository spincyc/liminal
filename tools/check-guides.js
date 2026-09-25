#!/usr/bin/env node
"use strict";

/**
 * Validates the content/study-guides/ markdown library:
 *   - every relative Markdown link resolves to a file that exists
 *   - every link into the Learn page (learn.html#<pageId>[/<anchor>], written
 *     relative or as the live site's URL) names a page and anchor that exist
 *     in content/learn
 *   - every guide is reachable from content/study-guides/README.md
 *   - no guide is empty or missing a top-level heading
 *
 * The guides are documentation, not question-bank content, so they are checked
 * here rather than by tools/validate-content.js.
 */

const fs = require("fs");
const path = require("path");
const Learn = require("../src/lib/learn-markup");
const { readTree, loadLearn } = require("./build-learn");

const root = path.join(__dirname, "..");
const guidesDir = path.join(root, "content", "study-guides");
const indexFile = path.join(guidesDir, "README.md");

const errors = [];

function listMarkdown(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(full));
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function linkTargets(contents) {
  const found = [];
  const pattern = /\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(contents)) !== null) found.push(match[1].trim());
  return found;
}

// A link into the Learn page: the live site's learn.html, or any relative
// path ending in learn.html. Returns its hash (without "#"), or null.
const LIVE_LEARN = "https://spincyc.github.io/liminal/learn.html";
function learnHash(target) {
  const cut = target.indexOf("#");
  const file = cut < 0 ? target : target.slice(0, cut);
  if (file !== LIVE_LEARN && !/^(?![a-z][a-z0-9+.-]*:)(?:.*\/)?learn\.html$/i.test(file)) return null;
  return cut < 0 ? "" : target.slice(cut + 1);
}

// Relative Markdown links, ignoring images, absolute and anchor-only
// targets, and links into the Learn page (checked by learnLinksIn).
function linksIn(contents) {
  return linkTargets(contents)
    .filter((target) => !/^(https?:|mailto:|#)/.test(target) && learnHash(target) === null)
    .map((target) => target.split("#")[0])
    .filter(Boolean);
}

function learnLinksIn(contents) {
  return linkTargets(contents).filter((target) => learnHash(target) !== null);
}

// The Learn pages, parsed once and only when a guide links to one.
let learnPages = null;
function learnTargetExists(hash) {
  if (!hash) return true;
  if (!learnPages) learnPages = loadLearn(readTree(path.join(root, "content", "learn"))).pages;
  const target = Learn.route(hash, learnPages);
  if (target.view !== "page") return false;
  return !target.anchor || Learn.anchors(learnPages[target.id].blocks).has(target.anchor);
}

if (!fs.existsSync(guidesDir)) {
  console.error("content/study-guides/ directory is missing");
  process.exit(1);
}

const files = listMarkdown(guidesDir).sort();
const reachable = new Set();

for (const file of files) {
  const rel = path.relative(root, file);
  const contents = fs.readFileSync(file, "utf8");

  if (contents.trim().length === 0) {
    errors.push(`${rel}: file is empty`);
    continue;
  }
  if (!/^#\s+\S/m.test(contents)) {
    errors.push(`${rel}: no top-level heading`);
  }

  for (const target of linksIn(contents)) {
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) {
      errors.push(`${rel}: broken link -> ${target}`);
    } else if (resolved.startsWith(guidesDir)) {
      reachable.add(resolved);
    }
  }

  for (const target of learnLinksIn(contents)) {
    if (!learnTargetExists(learnHash(target))) {
      errors.push(`${rel}: broken Learn link -> ${target} (no such page or anchor in content/learn)`);
    }
  }
}

// Reachability from the index, following links transitively.
const seen = new Set([indexFile]);
const queue = [indexFile];
while (queue.length > 0) {
  const current = queue.shift();
  const contents = fs.readFileSync(current, "utf8");
  for (const target of linksIn(contents)) {
    const resolved = path.resolve(path.dirname(current), target);
    if (!resolved.startsWith(guidesDir)) continue;
    if (!resolved.endsWith(".md")) continue;
    if (seen.has(resolved) || !fs.existsSync(resolved)) continue;
    seen.add(resolved);
    queue.push(resolved);
  }
}

for (const file of files) {
  if (!seen.has(file)) {
    errors.push(`${path.relative(root, file)}: not reachable from content/study-guides/README.md`);
  }
}

if (errors.length > 0) {
  console.error(`guides check failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(`guides check passed: ${files.length} files, all links resolve, all reachable`);
