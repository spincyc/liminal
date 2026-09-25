(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/reading-writing/information-and-ideas"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers shared by the Information and Ideas skill files. Each template
  // is one question design (a reading task, a passage structure, a reasoning
  // move) paired with its own bank of topic records. Every topic is a scene
  // with its own passage and its own four choices, so a run that takes one
  // question per template and one per scene never shows the same design or
  // the same topic twice. Scene ids start with "ii-" so they never collide
  // with other files.

  const RW = { sectionKey: "sat-reading-writing", domain: "Information and Ideas" };
  const SECONDS = { Easy: 55, Medium: 75, Hard: 95 };

  const passage = (content) => ({ type: "passage", content });

  // True when each fragment occurs in the text, each after the one before.
  function inOrder(text, fragments) {
    let from = 0;
    for (const fragment of fragments) {
      const at = text.indexOf(fragment, from);
      if (at < 0) return false;
      from = at + fragment.length;
    }
    return true;
  }

  // The key and the distractors are four different strings.
  const allDistinct = (key, wrong) =>
    new Set([key, ...wrong.map(([text]) => text)]).size === wrong.length + 1;

  // Shared fields of every multiple-choice record.
  function mc(difficulty, topic, fields) {
    return {
      responseType: "multiple-choice",
      scene: topic.scene,
      estimatedSeconds: SECONDS[difficulty],
      ...fields,
    };
  }

  return { RW, passage, inOrder, allDistinct, mc };
});
