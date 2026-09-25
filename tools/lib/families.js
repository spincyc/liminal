"use strict";

// Where each section's question templates live, in the order the browser
// must run them: the shared helpers, then for each catalog domain its
// common.js (when present) and one file per skill, in catalog order.
// src/lib/families/<test>/<section>/<domain>/<skill>.js

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const FAMILIES = path.join(ROOT, "src", "lib", "families");
const SHARED = ["random", "notation", "figures", "instantiate"].map((name) =>
  path.join(FAMILIES, "shared", `${name}.js`));
const TEMPLATE_SECTIONS = ["sat-math", "sat-reading-writing"];

const slug = (text) => text.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function sectionDirectory(sectionKey) {
  const [test, ...rest] = sectionKey.split("-");
  return path.join(FAMILIES, test, rest.join("-"));
}

function familyFiles(sectionKey) {
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "catalog.json"), "utf8"));
  const section = catalog.sections.find((entry) => entry.key === sectionKey);
  const files = SHARED.slice();
  section.domains.forEach((domain) => {
    const domainDir = path.join(sectionDirectory(sectionKey), slug(domain.name));
    const common = path.join(domainDir, "common.js");
    if (fs.existsSync(common)) files.push(common);
    Object.keys(domain.skills).forEach((skill) => {
      const file = path.join(domainDir, `${slug(skill)}.js`);
      if (fs.existsSync(file)) files.push(file);
    });
  });
  return files;
}

module.exports = { TEMPLATE_SECTIONS, familyFiles, sectionDirectory, slug };
