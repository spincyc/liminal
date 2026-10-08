/* Shared assessment mechanics, independent of exam content and pedagogy.
   A model has sections -> parts -> items. Adapters supply explicit display
   and solution payloads, scoring descriptors, and optional source references.
   Source references never enter a projection. This is an in-memory model,
   not a replacement for any persisted document, attempt or session schema. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalAssessment = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function copy(value) {
    if (Array.isArray(value)) return value.map(copy);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copy(item)]));
    return value;
  }
  function hasResponse(value) { return value !== null && value !== undefined && value !== ""; }

  // Numbering groups are adapter policy: SAT/ACT use one sequence; AP uses
  // separate MC and FR sequences, continuous across their calculator parts.
  function entries(model) {
    const counters = new Map();
    const result = [];
    (model.sections || []).forEach(section => (section.parts || []).forEach(part => (part.items || []).forEach(item => {
      const group = item.numberingGroup || "all";
      const number = (counters.get(group) || 0) + 1;
      counters.set(group, number);
      result.push({ section, part, item, number, index: result.length });
    })));
    return result;
  }

  function maximum(scoring) {
    if (scoring.kind === "unscored") return null;
    if (scoring.kind === "binary") return 1;
    if (scoring.kind !== "rubric") throw new RangeError("Unknown assessment scoring kind: " + scoring.kind);
    return (scoring.parts || []).reduce((sum, part) => sum + part.points, 0);
  }

  function schedule(model) {
    return (model.sections || []).flatMap(section => (section.parts || []).map(part => ({
      section, part, items: (part.items || []).length, minutes: Number(part.minutes) || 0,
    })));
  }

  function totals(model) {
    const list = entries(model);
    return { items: list.length, points: list.reduce((sum, entry) => sum + (maximum(entry.item.scoring) || 0), 0),
      minutes: schedule(model).reduce((sum, part) => sum + part.minutes, 0) };
  }

  // Groups are supplied by the adapter (section, unit, etc.). No averaging
  // or cross-program score conversion is implied by these raw point sums.
  function groupTotals(list, groupOf, outcomes) {
    const groups = new Map();
    list.forEach((entry, index) => {
      const key = groupOf(entry);
      const row = groups.get(key) || { key, items: 0, points: 0, ...(outcomes ? { earned: 0 } : {}) };
      row.items += 1;
      row.points += maximum(entry.item.scoring) || 0;
      if (outcomes) row.earned += outcomes[index].earned || 0;
      groups.set(key, row);
    });
    return [...groups.values()];
  }

  // Binary correctness is supplied by the exam adapter when comparison is
  // specialized (SAT numeric entry). Rubric responses are manually awarded
  // integer points by part, never automatically graded written responses.
  function outcome(scoring, response, options = {}) {
    const answered = hasResponse(response);
    if (scoring.kind === "unscored") return { kind: "unscored", answered, correct: null, points: null, earned: null };
    if (scoring.kind === "binary") {
      if (scoring.comparison === "adapter" && !Object.prototype.hasOwnProperty.call(options, "correct")) {
        throw new TypeError("This response requires its program's answer comparison.");
      }
      const correct = answered && (Object.prototype.hasOwnProperty.call(options, "correct") ? options.correct === true : response === scoring.key);
      const hintedCorrect = correct && Boolean(options.hinted);
      return { kind: "binary", answered, correct, hintedCorrect, points: 1, earned: correct && !hintedCorrect ? 1 : 0 };
    }
    const points = maximum(scoring);
    const given = response && typeof response === "object" ? response : {};
    const parts = scoring.parts.map(part => {
      const value = Number(given[part.label]);
      return { label: part.label, points: part.points, earned: Number.isInteger(value) ? Math.max(0, Math.min(part.points, value)) : 0 };
    });
    return { kind: "rubric", answered: scoring.parts.some(part => hasResponse(given[part.label])), correct: null,
      points, earned: parts.reduce((sum, part) => sum + part.earned, 0), parts };
  }

  // Keep the evidence types separate: partial rubric points and completion
  // cannot turn into a binary accuracy or a mastery judgement.
  function summarize(outcomes) {
    const result = { items: outcomes.length, answered: 0, scored: 0, unscored: 0, points: 0, earned: 0,
      binary: { items: 0, correct: 0, hintedCorrect: 0 }, rubric: { items: 0, points: 0, earned: 0 } };
    outcomes.forEach(value => {
      if (value.answered) result.answered += 1;
      if (value.kind === "unscored") { result.unscored += 1; return; }
      result.scored += 1;
      result.points += value.points;
      result.earned += value.earned;
      if (value.kind === "binary") {
        result.binary.items += 1;
        if (value.earned === 1) result.binary.correct += 1;
        if (value.hintedCorrect) result.binary.hintedCorrect += 1;
      } else if (value.kind === "rubric") {
        result.rubric.items += 1;
        result.rubric.points += value.points;
        result.rubric.earned += value.earned;
      }
    });
    return result;
  }

  // Adapters own the allowlists. Never spread a source item here: future
  // teacher fields must remain excluded until intentionally admitted.
  function projectItem(item, key = false) {
    return { ...copy(item.display), ...(key ? copy(item.solution || {}) : {}),
      ...(item.parts ? { parts: item.parts.map(part => projectItem(part, key)) } : {}) };
  }
  function project(model, key = false) {
    const numbered = entries(model);
    let index = 0;
    return { sections: model.sections.map(section => ({ ...copy(section.display),
      parts: section.parts.map(part => ({ ...copy(part.display),
        items: part.items.map(item => ({ number: numbered[index++].number, ...projectItem(item, key) })) })) })) };
  }

  return { entries, maximum, schedule, totals, groupTotals, outcome, summarize, projectItem, project, hasResponse };
});
