/* Exam-specific shape adapters for the shared, pure assessment model.
   Content schemas, numeric comparison, selection and storage stay with their
   owners. These adapters never modify an authored question or generate one. */
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(node ? require("./assessment") : root.LiminalAssessment);
  if (node) module.exports = api;
  else root.LiminalAssessmentAdapters = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Assessment) {
  "use strict";
  const LETTERS = ["A", "B", "C", "D"];
  const list = value => Array.isArray(value) ? value : [];
  function pick(value, fields) {
    return Object.fromEntries(fields.filter(key => value[key] !== undefined).map(key => [key, value[key]]));
  }
  function ids(value, key) { return Array.isArray(value[key]) && value[key].length ? { [key]: value[key].slice() } : {}; }
  function practiceScoring(question) {
    if (question.responseType === "essay") return { kind: "unscored" };
    // Choice-index parsing and SAT grid-entry equivalence remain in core.
    // A generic strict comparison must not silently replace those policies.
    return { kind: "binary", comparison: "adapter" };
  }
  function practiceItem(question) {
    const display = pick(question, ["id", "test", "section", "sectionKey", "responseType", "stem", "choices", "passageId", "calculatorPolicy"]);
    if (question.stimulus !== undefined) display.stimulus = question.stimulus === null ? null
      : pick(question.stimulus, ["type", "title", "intro", "content"]);
    if (question.figure) display.figure = pick(question.figure, ["svg", "alt", "caption", "notToScale"]);
    return { source: question, scoring: practiceScoring(question), display,
      solution: pick(question, ["correctAnswer", "hint", "explanation", "solutionSteps", "distractorRationales", "strategy", "trap", "principles", "domain", "skill", "subskill", "difficulty"]) };
  }
  function practiceForm(form) {
    return { sections: form.map((group, index) => ({ id: String(index), source: group,
      display: { label: group.label, directions: group.directions },
      parts: [{ id: "all", minutes: group.minutes, display: { minutes: group.minutes }, items: group.questions.map(practiceItem) }] })) };
  }
  function practiceStudent(question) { return Assessment.projectItem(practiceItem(question)); }

  function apItem(item) {
    const mc = Array.isArray(item.choices);
    // Structural traversal also runs during authoring validation, before
    // solution fields are admitted. Leave malformed collections for that
    // validator to diagnose rather than throwing while making a model.
    const parts = mc ? null : list(item.parts).map(part => ({
      display: { label: part.label, prompt: part.prompt, points: part.points, ...ids(part, "figureIds") },
      solution: { answer: part.answer, steps: list(part.steps).slice(), rubric: list(part.rubric).map(row => ({ points: row.points, criterion: row.criterion })),
        ...ids(part, "answerFigureIds") },
    }));
    const scoring = mc ? { kind: "binary", key: item.key }
      : { kind: "rubric", parts: list(item.parts).map(part => ({ label: part.label, points: Number.isInteger(part.points) ? part.points : 0 })) };
    return { source: item, numberingGroup: mc ? "mc" : "fr", scoring,
      display: { id: item.id, prompt: item.prompt, ...ids(item, "figureIds"), kind: mc ? "mc" : "fr", points: Assessment.maximum(scoring),
        ...(mc ? { choices: item.choices.slice() } : {}) },
      solution: { topics: list(item.topics).slice(), ...ids(item, "answerFigureIds"),
        ...(mc ? { key: item.key, rationale: item.rationale,
          ...(item.distractorNotes ? { distractorNotes: pick(item.distractorNotes, LETTERS) } : {}) }
          : { ...(item.type ? { type: item.type } : {}), ...(item.context === true ? { context: true } : {}) }) },
      ...(parts ? { parts } : {}) };
  }
  function apDocument(doc) {
    return { sections: (doc && doc.sections || []).map(section => ({ id: section.id, source: section,
      display: { id: section.id, title: section.title, kind: section.kind },
      parts: (section.parts || []).map(part => ({ id: part.id, source: part, minutes: part.minutes,
        display: { id: part.id, ...(part.title ? { title: part.title } : {}), minutes: part.minutes, calculator: part.calculator, directions: part.directions },
        items: (part.items || []).map(apItem) })) })) };
  }

  return { practiceScoring, practiceItem, practiceForm, practiceStudent, apItem, apDocument };
});
