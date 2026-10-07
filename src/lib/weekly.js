/* Pure routing and worksheet projections for separately loaded weekly courses. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalWeekly = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const GRADE_TRACKS = ["common-core-math", "common-core-reading", "singapore-math"];
  const TRACKS = [...GRADE_TRACKS, "high-school-math"];
  const NAMED_COURSES = ["algebra", "geometry", "algebra-2", "trigonometry", "calculus"];
  const NAMED_LABELS = { algebra: "Algebra", geometry: "Geometry", "algebra-2": "Algebra 2", trigonometry: "Trigonometry", calculus: "Calculus" };
  function gradeLabel(grade) { return grade === 0 ? "Kindergarten" : "Grade " + grade; }
  function gradeKey(grade) { return grade === 0 ? "k" : String(grade); }
  function trackLabel(id) { return { "common-core-math": "Common Core math", "common-core-reading": "Common Core reading", "singapore-math": "Singapore math", "high-school-math": "High-school math" }[id] || ""; }
  function courseKey(course) { return course.courseId || gradeKey(course.grade); }
  function courseLabel(course) {
    return course.courseId ? course.courseTitle || course.title || NAMED_LABELS[course.courseId] || "" : gradeLabel(course.grade);
  }
  function courseContext(trackId, grade) {
    if (trackId === "high-school-math") return "Conventional sequence · flexible placement";
    if (trackId === "singapore-math") return "Editorial grade mapping";
    if (trackId === "common-core-math" && grade === 12) return "Optional advanced pathway";
    if (["common-core-math", "common-core-reading"].includes(trackId) && grade >= 9) return "Suggested sequence";
    return "";
  }
  function validKey(trackId, key) {
    if (trackId === "high-school-math") return typeof key === "string" && NAMED_COURSES.includes(key);
    return GRADE_TRACKS.includes(trackId) && (Number.isInteger(key) && key >= 0 && key <= 12 || typeof key === "string" && /^(?:k|[1-9]|1[0-2])$/.test(key));
  }
  function route(trackId, key, week = 1) {
    if (!validKey(trackId, key) || !Number.isInteger(week) || week < 1 || week > 36) return "";
    return "#" + trackId + "/" + (typeof key === "number" ? gradeKey(key) : key) + "/" + week;
  }
  function courseAt(index, trackId, key) {
    if (!validKey(trackId, key)) return null;
    const normalized = typeof key === "number" ? gradeKey(key) : key;
    return (index.courses || []).find(c => c.trackId === trackId && courseKey(c) === normalized) || null;
  }
  function resolve(index, hash) {
    const raw = String(hash || "").replace(/^#/, "");
    const parts = raw.split("/");
    const requested = courseAt(index, parts[0], parts[1]);
    const course = requested || (index.courses || [])[0] || null;
    const validWeek = /^(?:[1-9]|[12][0-9]|3[0-6])$/.test(parts[2] || "");
    const exact = !!requested && parts.length === 3 && validWeek;
    return { trackId: course ? course.trackId : null, grade: course && Number.isInteger(course.grade) ? course.grade : null,
      courseId: course && course.courseId || null,
      week: course ? (exact ? Number(parts[2]) : 1) : null,
      invalid: !!raw && !exact, course };
  }
  function weekAt(course, week) {
    return course && Number.isInteger(week) ? (course.weeks || []).find(w => w.week === week) || null : null;
  }
  function worksheetAt(week, id) { return week ? (week.worksheets || []).find(s => s.id === id) || null : null; }
  function navigation(index, selected) {
    const course = selected && courseAt(index, selected.trackId, selected.courseId || selected.grade);
    const week = course && weekAt(course, selected.week);
    return { previous: week && selected.week > 1 ? route(selected.trackId, courseKey(course), selected.week - 1) : null,
      next: week && selected.week < 36 ? route(selected.trackId, courseKey(course), selected.week + 1) : null };
  }
  // Explicit allowlists protect student exports when future content adds teacher fields.
  function projectWorksheet(course, weekNumber, sheetId, answers) {
    const week = weekAt(course, weekNumber);
    const sheet = worksheetAt(week, sheetId);
    if (!sheet) return null;
    const needed = new Set(sheet.items.flatMap(item => item.passageIds));
    const passages = week.passages.filter(p => needed.has(p.id)).map(p => ({ id: p.id, title: p.title,
      text: p.text, kind: p.kind, attribution: p.attribution, sourceUrl: p.sourceUrl, readingMode: p.readingMode }));
    return { format: answers ? "liminal-weekly-answer-key" : "liminal-weekly-worksheet", version: 1,
      trackId: course.trackId,
      ...(course.courseId ? { courseId: course.courseId, courseTitle: courseLabel(course) } : { grade: course.grade }),
      week: week.week, title: week.title,
      worksheet: { id: sheet.id, title: sheet.title, directions: sheet.directions,
        items: sheet.items.map(item => ({ id: item.id, prompt: item.prompt,
          passageIds: item.passageIds.slice(), skill: item.skill,
          ...(answers ? { answer: item.answer, steps: item.steps.slice() } : {}) })) }, passages };
  }
  function studentWorksheet(course, week, sheet) { return projectWorksheet(course, week, sheet, false); }
  function answerWorksheet(course, week, sheet) { return projectWorksheet(course, week, sheet, true); }
  return { TRACKS, GRADE_TRACKS, NAMED_COURSES, gradeLabel, gradeKey, trackLabel, courseKey, courseLabel, courseContext, route, resolve, courseAt, weekAt, worksheetAt, navigation, studentWorksheet, answerWorksheet };
});
