"use strict";

// Template registry logic for tools/update-templates.js, kept pure so it is
// tested in Node (test/registry.test.js). A registry is
// { sectionKey, note, templates: [{ id, bit, version, fingerprint, retired? }] }.
//
// Bits are permanent: a new template takes the next bit, a template that
// disappears is retired and keeps its bit, and nothing is renumbered. When a
// live template's fingerprint changes (it builds different questions for the
// fixed seeds), its version goes up by one. A missing version means 1; an
// entry without a fingerprint is fingerprinted at its current version.

const NOTE = "Bit positions are permanent: append new templates, retire removed ones, never renumber. " +
  "A version goes up when the template's fingerprint (what it builds for fixed seeds) changes.";

function registryProblems(registry) {
  const errors = [];
  const ids = new Set();
  const bits = new Set();
  registry.templates.forEach((entry) => {
    if (ids.has(entry.id)) errors.push(`duplicate template id ${entry.id}`);
    if (bits.has(entry.bit)) errors.push(`bit ${entry.bit} is used twice`);
    if (!Number.isInteger(entry.bit) || entry.bit < 0) errors.push(`${entry.id} has an invalid bit`);
    if (entry.version !== undefined && (!Number.isInteger(entry.version) || entry.version < 1)) {
      errors.push(`${entry.id} has an invalid version`);
    }
    ids.add(entry.id);
    bits.add(entry.bit);
  });
  return errors;
}

// Brings `registry` in step with `families`; `fingerprintOf(family)` hashes
// what a family builds. Returns { registry, changes } with a new registry
// object whose entries are in a fixed key order; the input is not modified.
function updateRegistry(registry, families, fingerprintOf) {
  const templates = (registry.templates || []).map((entry) => ({ ...entry }));
  const known = new Map(templates.map((entry) => [entry.id, entry]));
  const live = new Set(families.map((family) => family.id));
  let nextBit = templates.reduce((max, entry) => Math.max(max, entry.bit + 1), 0);
  const changes = [];
  families.forEach((family) => {
    const fingerprint = fingerprintOf(family);
    const entry = known.get(family.id);
    if (!entry) {
      const added = { id: family.id, bit: nextBit, version: 1, fingerprint };
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
    if (!entry.fingerprint) {
      entry.version = entry.version || 1;
      entry.fingerprint = fingerprint;
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
        ...(entry.retired ? { retired: true } : {}),
      })),
    },
    changes,
  };
}

module.exports = { NOTE, registryProblems, updateRegistry };
