/* Grade-specific composition; adding a grade never changes the shared engine. */
(function (root) {
  "use strict";
  const node = typeof module === "object" && module.exports;
  const registry = node ? require("../../registry.js") : root.LiminalLessonModuleRegistry;
  const templates = node
    ? [require("./topic-1.js"), require("./topic-2.js"), require("./topic-3.js"), require("./topic-4.js")].flat()
    : [root.LiminalGrade8Topic1, root.LiminalGrade8Topic2, root.LiminalGrade8Topic3, root.LiminalGrade8Topic4].flat();
  const entry = registry.register({ id: "grade-8-math", trackId: "common-core-math", grade: 8 }, templates);
  if (node) module.exports = entry;
})(typeof globalThis !== "undefined" ? globalThis : this);
