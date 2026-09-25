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
  //
  // A template's build(t) returns the item's text, `correct`, and `wrong`: a
  // list of [value, reason] pairs, one per modelled mistake. Besides the bank
  // fields the record carries two measurements the families gate reads:
  //   keyEqualDistractors  how many `wrong` entries were dropped because their
  //                        label is the key's. A modelled mistake that lands
  //                        on the key is a defect (its reason calls the key
  //                        wrong, and a spare takes its place), so build must
  //                        redraw instead; the gate requires 0.
  //   choiceFeatures       when build returns `features: { correct: {…},
  //                        wrong: [{…}, …] }` (wrong in the same order as
  //                        `wrong`), the features of each final choice, in
  //                        choice order; null otherwise. Values are short
  //                        strings such as { number: "plural" }. The gate uses
  //                        them to catch a key that is the odd one out.
  // A numeric key is a plain decimal or an exact fraction in lowest terms
  // ("7/3", "-5/2"), where the real answer would be a repeating decimal.
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
      return {
        ...record,
        choices: null,
        correctAnswer: answerKey(raw.correct),
        distractorRationales: null,
        choiceFeatures: null,
        keyEqualDistractors: 0,
      };
    }
    const correctText = label(raw.correct);
    const features = raw.features || null;
    const featuresOf = (entry) => (entry && typeof entry === "object" ? { ...entry } : null);
    const seen = new Set([correctText]);
    const wrong = [];
    let keyEqualDistractors = 0;
    // The first three usable entries become the distractors; entries after
    // them are spares and are never read.
    for (const [index, [value, reason]] of (raw.wrong || []).entries()) {
      if (wrong.length === 3) break;
      const text = label(value);
      if (text === correctText) keyEqualDistractors += 1;
      if (seen.has(text) || BAD_TEXT.test(text)) continue;
      seen.add(text);
      wrong.push({ text, reason, features: features ? featuresOf((features.wrong || [])[index]) : null });
    }
    if (wrong.length < 3) {
      throw new Error(`${family.id} seed ${seed}: only ${wrong.length} distinct distractors`);
    }
    const options = t.shuffle([
      { text: correctText, correct: true, features: features ? featuresOf(features.correct) : null },
      ...wrong,
    ]);
    return {
      ...record,
      choices: options.map((option) => option.text),
      correctAnswer: options.findIndex((option) => option.correct),
      distractorRationales: options
        .map((option, index) => (option.correct ? null : { index, reason: option.reason }))
        .filter(Boolean),
      choiceFeatures: features ? options.map((option) => option.features) : null,
      keyEqualDistractors,
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
