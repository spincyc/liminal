/* Pure registration only: each environment owns loading the declared sources. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LiminalLessonModuleRegistry = root.LiminalLessonModuleRegistry || factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const entries = new Map();
  const parents = new Map();
  function register(metadata, templates) {
    if (!metadata || typeof metadata.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.id) ||
        typeof metadata.trackId !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.trackId) ||
        !Number.isInteger(metadata.grade) || metadata.grade < 0 || metadata.grade > 12 ||
        !Array.isArray(templates) || !templates.length ||
        new Set(templates.map(t => t.id)).size !== templates.length ||
        templates.some(t => !t.id || !t.lessonId || !t.skill || typeof t.generate !== "function")) {
      throw new Error("Invalid lesson module registration");
    }
    const key = metadata.trackId + "/" + metadata.grade;
    const existing = entries.get(metadata.id);
    if (existing) {
      if (existing.trackId !== metadata.trackId || existing.grade !== metadata.grade ||
          existing.templates.length !== templates.length || existing.templates.some((t, i) => t !== templates[i])) {
        throw new Error("Conflicting lesson module registration: " + metadata.id);
      }
      return existing;
    }
    if (parents.has(key)) throw new Error("Duplicate lesson module parent: " + key);
    const entry = Object.freeze({ id: metadata.id, trackId: metadata.trackId, grade: metadata.grade,
      templates: Object.freeze(templates.slice()) });
    entries.set(metadata.id, entry);
    parents.set(key, entry);
    return entry;
  }
  function get(id) {
    const entry = entries.get(id);
    if (!entry) throw new Error("No generators registered for lesson module: " + id);
    return entry;
  }
  function forParent(trackId, grade) { return parents.get(trackId + "/" + grade) || null; }
  function templatesForModule(id) { return get(id).templates; }
  return { register, get, forParent, templatesForModule };
});
