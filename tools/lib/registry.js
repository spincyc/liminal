"use strict";

// Template registry logic for tools/update-templates.js, kept pure so it is
// tested in Node (test/registry.test.js). A registry is
// { sectionKey, note, templates: [{ id, bit, version, fingerprint, retired? }] }.
//
// Bits are permanent: a new template takes the next bit, a template that
// disappears is retired and keeps its bit, and nothing is renumbered. When a
// live template's source fingerprint changes, its version goes up by one.
// Legacy sampled fingerprints migrate only against explicit baseline evidence.
// A missing version means 1; an entry without a fingerprint is initialized at
// its current version.

const NOTE = "Bit positions are permanent: append new templates, retire removed ones, never renumber. " +
  "A version goes up when its source fingerprint changes, including shared dependencies. " +
  "Source hashing conservatively includes comments, metadata and sibling templates in the same file.";

function registryProblems(registry) {
  const errors = [];
  if (!registry || !Array.isArray(registry.templates)) return ["registry needs a templates array"];
  const ids = new Set();
  const bits = new Set();
  registry.templates.forEach((entry) => {
    if (!entry || typeof entry !== "object") {
      errors.push("registry entry must be an object");
      return;
    }
    if (typeof entry.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) errors.push("invalid template id");
    if (ids.has(entry.id)) errors.push(`duplicate template id ${entry.id}`);
    if (bits.has(entry.bit)) errors.push(`bit ${entry.bit} is used twice`);
    if (!Number.isSafeInteger(entry.bit) || entry.bit < 0) errors.push(`${entry.id} has an invalid bit`);
    if (entry.version !== undefined && (!Number.isSafeInteger(entry.version) || entry.version < 1)) {
      errors.push(`${entry.id} has an invalid version`);
    }
    if (entry.fingerprint !== undefined && (typeof entry.fingerprint !== "string" || !entry.fingerprint)) {
      errors.push(`${entry.id} has an invalid fingerprint`);
    }
    if (entry.fingerprintAlgorithm !== undefined && entry.fingerprintAlgorithm !== "source-v1") {
      errors.push(`${entry.id} has an unknown fingerprint algorithm`);
    }
    if (entry.fingerprintAlgorithm === "source-v1" && !/^[0-9a-f]{64}$/.test(entry.fingerprint || "")) {
      errors.push(`${entry.id} has an invalid source fingerprint`);
    }
    ids.add(entry.id);
    bits.add(entry.bit);
  });
  return errors;
}

// Brings `registry` in step with `families`; `fingerprintOf(family)` hashes
// what a family builds. Returns { registry, changes } with a new registry
// object whose entries are in a fixed key order; the input is not modified.
function updateRegistry(registry, families, fingerprintOf, options = {}) {
  const errors = registryProblems(registry);
  const ids = families.map((family) => family.id);
  if (new Set(ids).size !== ids.length) errors.push("duplicate live template id");
  if (ids.some((id) => typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) errors.push("invalid live template id");
  if (errors.length) throw new Error(errors.join("; "));
  const templates = (registry.templates || []).map((entry) => ({ ...entry }));
  const known = new Map(templates.map((entry) => [entry.id, entry]));
  const live = new Set(families.map((family) => family.id));
  let nextBit = templates.reduce((max, entry) => Math.max(max, entry.bit + 1), 0);
  const changes = [];
  families.forEach((family) => {
    const fingerprint = fingerprintOf(family);
    if (options.algorithm && !/^[0-9a-f]{64}$/.test(fingerprint || "")) throw new Error(`${family.id}: invalid source fingerprint`);
    const entry = known.get(family.id);
    if (!entry) {
      const added = { id: family.id, bit: nextBit, version: 1, fingerprint,
        ...(options.algorithm ? { fingerprintAlgorithm: options.algorithm } : {}) };
      templates.push(added);
      known.set(family.id, added);
      changes.push(`+ ${family.id} (bit ${nextBit})`);
      nextBit += 1;
      return;
    }
    if (entry.retired) {
      delete entry.retired;
      changes.push(`restored ${family.id}`);
    }
    if (entry.fingerprint && options.algorithm && entry.fingerprintAlgorithm !== options.algorithm) {
      if (!options.rehash || typeof options.baselineOf !== "function") {
        throw new Error(`${family.id}: legacy fingerprint needs --rehash --baseline <unchanged source tree>`);
      }
      const baseline = options.baselineOf(family.id);
      if (!baseline || baseline.legacy !== entry.fingerprint) {
        throw new Error(`${family.id}: baseline does not match the stored legacy fingerprint`);
      }
      entry.version = (entry.version || 1) + (baseline.source !== fingerprint ? 1 : 0);
      entry.fingerprint = fingerprint;
      entry.fingerprintAlgorithm = options.algorithm;
      changes.push(`${family.id}: migrated fingerprint${baseline.source !== fingerprint ? "; source changed" : ""} (version ${entry.version})`);
    } else if (!entry.fingerprint) {
      entry.version = entry.version || 1;
      entry.fingerprint = fingerprint;
      if (options.algorithm) entry.fingerprintAlgorithm = options.algorithm;
      changes.push(`fingerprinted ${family.id} (version ${entry.version})`);
    } else if (entry.fingerprint !== fingerprint) {
      entry.version = (entry.version || 1) + 1;
      entry.fingerprint = fingerprint;
      changes.push(`${family.id} builds different questions: version ${entry.version}`);
    }
  });
  templates.forEach((entry) => {
    if (!live.has(entry.id) && !entry.retired) {
      entry.retired = true;
      changes.push(`retired ${entry.id} (bit ${entry.bit} stays reserved)`);
    }
  });
  return {
    registry: {
      sectionKey: registry.sectionKey,
      note: NOTE,
      templates: templates.map((entry) => ({
        id: entry.id,
        bit: entry.bit,
        version: entry.version || 1,
        ...(entry.fingerprint ? { fingerprint: entry.fingerprint } : {}),
        ...(entry.fingerprintAlgorithm ? { fingerprintAlgorithm: entry.fingerprintAlgorithm } : {}),
        ...(entry.retired ? { retired: true } : {}),
      })),
    },
    changes,
  };
}

module.exports = { NOTE, registryProblems, updateRegistry };
