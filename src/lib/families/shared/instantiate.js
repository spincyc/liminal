// Turns a template (family) and a seed into a question record, and registers
// templates in the browser by section.
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const deps = node
    ? {
    ...require("./random"),
    ...require("./notation"),
    }
    : root.LiminalFamilyShared || {};
  const api = factory(deps);
  if (node) module.exports = api;
  else root.LiminalFamilyShared = Object.assign(root.LiminalFamilyShared || {}, api);
})(typeof self !== "undefined" ? self : this, function (deps) {
  "use strict";

  const { rng, tools, label, answerKey } = deps;

  /* ----------------------------------------------------------- instantiate */

  const BAD_TEXT = /undefined|NaN|Infinity|\[object /;

  // Sections a family can belong to; a family names one with `sectionKey`
  // (default "sat-math") and a tier with `difficulty` (default "Hard").
  const SECTIONS = {
    "sat-math": { test: "SAT", section: "Math", calculatorPolicy: "allowed" },
    "sat-reading-writing": {
      test: "SAT",
      section: "Reading and Writing",
      calculatorPolicy: "not-applicable",
    },
  };

  // Turns one family plus a seed into a question record shaped like the
  // canonical bank schema (content/schema.md), minus the bank-level fields
  // (id, provenance, contentVersion, reviewStatus) that the bank generator owns.
  function instantiate(family, seed) {
    const random = rng(`${family.id}|${seed}`);
    const t = tools(random);
    const raw = family.build(t);
    const sectionKey = family.sectionKey || "sat-math";
    const section = SECTIONS[sectionKey];
    const record = {
      familyId: family.id,
      templateId: family.id,
      scene: raw.scene || null,
      seed: String(seed),
      test: section.test,
      section: section.section,
      sectionKey,
      domain: family.domain,
      skill: family.skill,
      subskill: family.subskill,
      difficulty: family.difficulty || "Hard",
      responseType: raw.responseType,
      stimulus: raw.stimulus || null,
      figure: raw.figure || null,
      stem: raw.stem,
      hint: raw.hint,
      explanation: raw.explanation,
      solutionSteps: raw.steps,
      principles: raw.principles,
      strategy: raw.strategy || family.recognize,
      trap: raw.trap,
      estimatedSeconds: raw.estimatedSeconds || 105,
      calculatorPolicy: section.calculatorPolicy,
      format: raw.figure ? "figure" : raw.stimulus ? raw.stimulus.type : "standard",
      // One template per family; a run takes at most one of each template and,
      // when a scene is named, at most one of each scene.
      tags: ["generated", `template:${family.id}`]
        .concat(raw.scene ? [`scene:${raw.scene}`] : [])
        .concat(raw.tags || []),
      verified: Boolean(raw.verify()),
    };
    if (raw.responseType === "numeric") {
      return { ...record, choices: null, correctAnswer: answerKey(raw.correct), distractorRationales: null };
    }
    const correctText = label(raw.correct);
    const seen = new Set([correctText]);
    const wrong = [];
    for (const [value, reason] of raw.wrong || []) {
      const text = label(value);
      if (seen.has(text) || BAD_TEXT.test(text)) continue;
      seen.add(text);
      wrong.push({ text, reason });
      if (wrong.length === 3) break;
    }
    if (wrong.length < 3) {
      throw new Error(`${family.id} seed ${seed}: only ${wrong.length} distinct distractors`);
    }
    const options = t.shuffle([{ text: correctText, correct: true }, ...wrong]);
    return {
      ...record,
      choices: options.map((option) => option.text),
      correctAnswer: options.findIndex((option) => option.correct),
      distractorRationales: options
        .map((option, index) => (option.correct ? null : { index, reason: option.reason }))
        .filter(Boolean),
    };
  }

  // Browser registry: template files call register(families), and the app
  // reads window.LiminalFamilies[sectionKey].
  function register(families) {
    const root = typeof self !== "undefined" ? self : globalThis;
    const registry = (root.LiminalFamilies = root.LiminalFamilies || {});
    families.forEach((family) => {
      const key = family.sectionKey || "sat-math";
      (registry[key] = registry[key] || []).push(family);
    });
  }

  return { BAD_TEXT, SECTIONS, instantiate, register };
});
