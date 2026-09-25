"use strict";

// A template's fingerprint: a short hash of the questions it builds for a
// fixed set of seeds. Question ids and run codes store only a template id
// and a seed, so any edit that changes what a seed builds changes what an old
// id or code rebuilds; the registry (tools/update-templates.js) bumps the
// template's version when its fingerprint changes, so stored attempts can
// tell which version they were answered on.
//
// Only what the student sees counts: the question, its choices and key, and
// the teaching text. Metadata (tier, skill, tags, timing) and the gate's own
// measurements are left out, so relabeling a template or adding a record field
// does not mark every stored attempt as answered on an older version. A seed
// whose build throws contributes its error message.

const crypto = require("node:crypto");

const FINGERPRINT_SEEDS = Array.from({ length: 8 }, (unused, index) => `fp-${index}`);
const VISIBLE_FIELDS = [
  "responseType", "scene", "stimulus", "figure", "stem", "choices", "correctAnswer",
  "hint", "explanation", "solutionSteps", "principles", "strategy", "trap", "distractorRationales",
];

// JSON with object keys sorted, so the hash does not depend on the order in
// which a template happens to assemble its record.
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry === undefined ? null : entry)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined && typeof value[key] !== "function")
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

function fingerprintRecords(records) {
  return crypto.createHash("sha256").update(canonicalJson(records)).digest("hex").slice(0, 16);
}

function templateFingerprint(family, instantiate) {
  const records = FINGERPRINT_SEEDS.map((seed) => {
    try {
      const record = instantiate(family, seed);
      return Object.fromEntries(VISIBLE_FIELDS.map((field) => [field, record[field]]));
    } catch (error) {
      return { error: String(error && error.message ? error.message : error) };
    }
  });
  return fingerprintRecords(records);
}

module.exports = { FINGERPRINT_SEEDS, VISIBLE_FIELDS, canonicalJson, fingerprintRecords, templateFingerprint };
