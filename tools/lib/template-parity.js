"use strict";

const { canonicalJson } = require("./fingerprint");

// Keep the three representations in agreement: Node generators, concatenated
// browser generators, and the labels used without downloading a generator.
function templateParityProblems({ sectionKey, families, nodeFamilies, registry, instantiate, nodeInstantiate }) {
  const errors = [];
  const ids = (entries) => entries.map((entry) => entry.id).sort();
  const browserIds = ids(families);
  const live = (registry.templates || []).filter((entry) => !entry.retired);
  if (new Set(browserIds).size !== browserIds.length) errors.push(`${sectionKey}: duplicate browser template id`);
  if (canonicalJson(browserIds) !== canonicalJson(ids(live))) errors.push(`${sectionKey}: browser template ids differ from active registry`);
  if (canonicalJson(browserIds) !== canonicalJson(ids(nodeFamilies))) errors.push(`${sectionKey}: browser template ids differ from Node`);
  const byId = new Map(live.map((entry) => [entry.id, entry]));
  const nodeById = new Map(nodeFamilies.map((entry) => [entry.id, entry]));
  for (const family of families) {
    const entry = byId.get(family.id);
    const node = nodeById.get(family.id);
    if (!entry || !node) continue;
    for (const field of ["difficulty", "domain", "skill", "subskill"]) {
      if (family[field] !== entry[field] || family[field] !== node[field]) errors.push(`${sectionKey}/${family.id}: ${field} differs between registry, browser and Node`);
    }
    for (const seed of [0, "smoke", `smoke.${family.id}.0`]) {
      const browserRecord = instantiate(family, seed);
      if (browserRecord.verified !== true) errors.push(`${sectionKey}/${family.id}: unverified browser draw (${seed})`);
      if (canonicalJson(browserRecord) !== canonicalJson(nodeInstantiate(node, seed))) errors.push(`${sectionKey}/${family.id}: seeded output differs between browser and Node (${seed})`);
    }
  }
  return errors;
}
module.exports = { templateParityProblems };
