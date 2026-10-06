/* Course worksheet selection is independent of exam sessions and progress. */
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(node ? require("./math.js") : root.LiminalCourseMath, function (id) {
    if (id !== "grade-8-math") throw new Error("No generators registered for course: " + id);
    return node
      ? [1, 2, 3, 4].flatMap(n => require("./grade8-topic" + n + ".js"))
      : [1, 2, 3, 4].flatMap(n => root["LiminalGrade8Topic" + n] || []);
  });
  if (node) module.exports = api;
  else root.LiminalCourses = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (M, templatesForCourse) {
  "use strict";
  const MAX_COUNT = 100;
  const MAX_DAYS = 30;
  function lessons(course) { return course.units.flatMap(unit => unit.lessons); }
  function identity(question) {
    // Keep the complete signature to avoid silently treating hash collisions as duplicates.
    return JSON.stringify([question.prompt, question.table || null, question.graph || null]);
  }
  function validateGraph(graph) {
    if (!graph || typeof graph !== "object") throw new Error("Invalid graph");
    for (const key of ["xMin", "xMax", "yMin", "yMax", "xStep", "yStep"]) {
      if (!Number.isFinite(graph[key])) throw new Error("Invalid graph " + key);
    }
    if (graph.xMax <= graph.xMin || graph.yMax <= graph.yMin || graph.xStep <= 0 || graph.yStep <= 0 ||
      (graph.xMax - graph.xMin) / graph.xStep > 100 || (graph.yMax - graph.yMin) / graph.yStep > 100) {
      throw new Error("Invalid graph scale");
    }
    const points = [...(graph.points || []), ...(graph.lines || []).flat()];
    if (points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error("Invalid graph coordinate");
  }
  function validateQuestion(question) {
    for (const key of ["prompt", "answer"]) {
      if (typeof question[key] !== "string" || !question[key].trim()) throw new Error("Missing question " + key);
    }
    if (!Array.isArray(question.steps) || question.steps.length < 1 || question.steps.some(s => typeof s !== "string" || !s.trim())) {
      throw new Error("Missing worked solution steps");
    }
    if (!Number.isInteger(question.workLines) || question.workLines < 1 || question.workLines > 12) throw new Error("Invalid working space");
    if (question.table) {
      const t = question.table;
      if (!Array.isArray(t.headers) || !t.headers.length || !Array.isArray(t.rows) || !t.rows.length ||
        t.rows.some(row => !Array.isArray(row) || row.length !== t.headers.length) ||
        [...t.headers, ...t.rows.flat()].some(value => typeof value !== "string")) throw new Error("Invalid question table");
    }
    if (question.graph) validateGraph(question.graph);
    if (question.answerGraph) validateGraph(question.answerGraph);
    return question;
  }
  function generateWorksheet(course, templates, options) {
    const settings = options || {};
    const allLessons = lessons(course);
    const selected = new Set(settings.lessonIds || allLessons.map(lesson => lesson.id));
    if (!selected.size || [...selected].some(id => !allLessons.some(lesson => lesson.id === id))) throw new Error("Choose valid course lessons");
    const lessonIds = allLessons.filter(lesson => selected.has(lesson.id)).map(lesson => lesson.id);
    const count = settings.count === undefined ? 20 : Number(settings.count);
    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) throw new Error("Choose 1–100 problems per worksheet");
    const seed = String(settings.seed === undefined ? "practice" : settings.seed).trim();
    if (!seed || seed.length > 160) throw new Error("Enter a seed of 1–160 characters");
    const byLesson = new Map(lessonIds.map(id => [id, templates.filter(t => t.lessonId === id)]));
    if ([...byLesson.values()].some(values => !values.length)) throw new Error("A selected lesson has no practice generators");
    const selectedTemplates = [...byLesson.values()].flat();
    if (new Set(selectedTemplates.map(t => t.id)).size !== selectedTemplates.length) throw new Error("Duplicate template IDs");
    const rng = M.random(seed);
    const cycle = rng.shuffle(lessonIds);
    const offsets = new Map(lessonIds.map(id => [id, rng.int(0, byLesson.get(id).length - 1)]));
    const uses = new Map(lessonIds.map(id => [id, 0]));
    const prior = new Set(settings.avoid || []);
    const seen = new Set();
    const questions = [];
    let reused = 0;
    for (let slot = 0; slot < count; slot += 1) {
      const lessonId = cycle[slot % cycle.length];
      const pool = byLesson.get(lessonId);
      const offset = offsets.get(lessonId) + uses.get(lessonId);
      uses.set(lessonId, uses.get(lessonId) + 1);
      let chosen = null;
      let fallback = null;
      // Prefer the next design, then try sibling designs if its finite pool runs out.
      for (let attempt = 0; attempt < 240; attempt += 1) {
        const template = pool[(offset + Math.floor(attempt / 40)) % pool.length];
        const drawSeed = seed + "/" + slot + "/" + template.id + "/" + attempt;
        const raw = validateQuestion(template.generate(M.random(drawSeed)));
        const signature = identity(raw);
        if (seen.has(signature)) continue;
        const entry = { ...raw, id: template.id + ":" + drawSeed, number: slot + 1, templateId: template.id,
          lessonId, skill: template.skill, signature };
        if (!prior.has(signature)) { chosen = entry; break; }
        if (!fallback) fallback = entry;
      }
      if (!chosen && fallback) { chosen = fallback; reused += 1; }
      if (!chosen) throw new Error("The selected lesson has too few distinct exercises for this sheet. Reduce the count or select more lessons.");
      seen.add(chosen.signature);
      questions.push(chosen);
    }
    const version = String(course.revision || course.version);
    const code = "COURSE-" + version.slice(0, 8) + "-" + M.hash(JSON.stringify([course.id, seed, lessonIds, questions.map(q => q.id)])).toUpperCase();
    const warnings = reused ? [`${reused} problem(s) repeat an earlier night in this packet because the selected exercise pool is limited.`] : [];
    return { courseId: course.id, version, seed, code, lessonIds, title: course.title + " practice", questions,
      warnings, identities: [...seen] };
  }
  function generatePacket(course, templates, options) {
    const settings = options || {};
    const days = settings.days === undefined ? 10 : Number(settings.days);
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) throw new Error("Choose 1–30 nights");
    const seed = String(settings.seed === undefined ? "practice" : settings.seed).trim();
    if (!seed || seed.length > 140) throw new Error("Enter a packet seed of 1–140 characters");
    const avoid = new Set(settings.avoid || []);
    const packet = [];
    for (let day = 1; day <= days; day += 1) {
      const sheet = generateWorksheet(course, templates, { ...settings, seed: seed + "/night-" + day, avoid: [...avoid] });
      sheet.packetSeed = seed;
      sheet.day = day;
      sheet.days = days;
      sheet.identities.forEach(id => avoid.add(id));
      packet.push(sheet);
    }
    return packet;
  }
  return { MAX_COUNT, MAX_DAYS, lessons, identity, validateQuestion, validateGraph, templatesForCourse, generateWorksheet, generatePacket };
});
