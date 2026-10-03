#!/usr/bin/env node
"use strict";

// Permanent bits and conservative source versions. Legacy sampled hashes need
// an explicit migration against the unchanged source tree that produced them:
//   node tools/update-templates.js --rehash --baseline <old-source-root>
// The baseline's eight-seed hashes must match the registry. A source difference
// from that baseline bumps the version even if all eight samples still match.
// `--rehash` never suppresses a change to an already migrated source hash.
//   node tools/update-templates.js           # append, retire, re-version
//   node tools/update-templates.js --check   # fail if any registry is stale

const fs = require("node:fs");
const path = require("node:path");
const { SOURCE_ALGORITHM, templateFingerprint, sectionFingerprints, canonicalJson } = require("./lib/fingerprint");
const { registryProblems, updateRegistry } = require("./lib/registry");
const { TEMPLATE_SECTIONS } = require("./lib/families");

const ROOT = path.resolve(__dirname, "..");

function main(args = process.argv.slice(2)) {
  let check = false;
  let rehash = false;
  let baselineRoot = null;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--check") check = true;
    else if (arg === "--rehash") rehash = true;
    else if (arg === "--baseline" && args[index + 1] && !args[index + 1].startsWith("--")) baselineRoot = path.resolve(args[++index]);
    else throw new Error(`Unknown or incomplete option: ${arg}`);
  }
  if (rehash !== Boolean(baselineRoot)) throw new Error("Migration needs both --rehash and --baseline <old-source-root>");
  if (baselineRoot && fs.realpathSync(baselineRoot) === fs.realpathSync(ROOT)) {
    throw new Error("The migration baseline must be a separate unchanged source tree");
  }

  // Prepare every section first. A malformed registry or failed migration must
  // not leave the preceding section half-updated on disk.
  const updates = TEMPLATE_SECTIONS.map((sectionKey) => {
    const file = path.join(ROOT, "content/templates", `${sectionKey}.json`);
    const previous = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8")) : { sectionKey, templates: [] };
    if (previous.sectionKey !== sectionKey) throw new Error(`${file}: wrong sectionKey`);
    const errors = registryProblems(previous);
    if (errors.length) throw new Error(`${sectionKey}: ${errors.join("; ")}`);
    const current = sectionFingerprints(ROOT, sectionKey);
    const baseline = baselineRoot ? sectionFingerprints(baselineRoot, sectionKey) : null;
    const baselineFamilies = new Map((baseline ? baseline.families : []).map((family) => [family.id, family]));
    const result = updateRegistry(previous, current.families,
      (family) => current.fingerprints.get(family.id), {
        algorithm: SOURCE_ALGORITHM,
        rehash,
        baselineOf: (id) => baselineFamilies.has(id) ? {
          source: baseline.fingerprints.get(id),
          legacy: templateFingerprint(baselineFamilies.get(id), baseline.instantiate),
        } : null,
      });
    return { sectionKey, file, ...result, stale: canonicalJson(previous) !== canonicalJson(result.registry) };
  });

  let failed = false;
  for (const { sectionKey, file, registry, changes, stale } of updates) {
    const active = registry.templates.filter((entry) => !entry.retired).length;
    if (check && stale) {
      console.error(`${sectionKey}: registry is stale (${changes.length} template changes); run node tools/update-templates.js`);
      changes.slice(0, 5).forEach((change) => console.error(`  ${change}`));
      failed = true;
    } else if (check) console.log(`${sectionKey}: ${active} templates registered.`);
    else {
      fs.writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
      console.log(`${sectionKey}: ${active} templates; ${changes.length} changes.`);
      changes.slice(0, 5).forEach((change) => console.log(`  ${change}`));
    }
  }
  return failed ? 1 : 0;
}

if (require.main === module) {
  try { process.exitCode = main(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { main };
