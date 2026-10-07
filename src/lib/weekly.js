/* Pure routing and worksheet projections for separately loaded weekly courses. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalWeekly = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const TRACKS = ["common-core-math", "common-core-reading", "singapore-math"];
  function gradeLabel(grade) { return grade === 0 ? "Kindergarten" : "Grade " + grade; }
  function gradeKey(grade) { return grade === 0 ? "k" : String(grade); }
  function trackLabel(id) { return { "common-core-math": "Common Core math", "common-core-reading": "Common Core reading", "singapore-math": "Singapore math" }[id] || ""; }
  function courseContext(trackId, grade) {
    if (trackId === "singapore-math") return "Editorial grade mapping";
    if (trackId === "common-core-math" && grade === 12) return "Optional advanced pathway";
    if (["common-core-math", "common-core-reading"].includes(trackId) && grade >= 9) return "Suggested sequence";
    return "";
  }
  function route(trackId, grade, week = 1) {
    if (!TRACKS.includes(trackId) || !Number.isInteger(grade) || grade < 0 || grade > 12 || !Number.isInteger(week) || week < 1 || week > 36) return "";
    return "#" + trackId + "/" + gradeKey(grade) + "/" + week;
  }
  function courseAt(index, trackId, grade) {
    return (index.courses || []).find(c => c.trackId === trackId && c.grade === grade) || null;
  }
  function resolve(index, hash) {
    const raw = String(hash || "").replace(/^#/, "");
    const parts = raw.split("/");
    const validGrade = /^(?:k|[1-9]|1[0-2])$/.test(parts[1] || "");
    const grade = parts[1] === "k" ? 0 : Number(parts[1]);
    const requested = validGrade && TRACKS.includes(parts[0]) ? courseAt(index, parts[0], grade) : null;
    const course = requested || (index.courses || [])[0] || null;
    const validWeek = /^(?:[1-9]|[12][0-9]|3[0-6])$/.test(parts[2] || "");
    const exact = !!requested && parts.length === 3 && validWeek;
    return { trackId: course ? course.trackId : null, grade: course ? course.grade : null,
      week: course ? (exact ? Number(parts[2]) : 1) : null,
      invalid: !!raw && !exact, course };
  }
  function weekAt(course, week) {
    return course && Number.isInteger(week) ? (course.weeks || []).find(w => w.week === week) || null : null;
  }
  function worksheetAt(week, id) { return week ? (week.worksheets || []).find(s => s.id === id) || null : null; }
  function navigation(index, selected) {
    const course = selected && courseAt(index, selected.trackId, selected.grade);
    const week = course && weekAt(course, selected.week);
    return { previous: week && selected.week > 1 ? route(selected.trackId, selected.grade, selected.week - 1) : null,
      next: week && selected.week < 36 ? route(selected.trackId, selected.grade, selected.week + 1) : null };
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
      trackId: course.trackId, grade: course.grade, week: week.week, title: week.title,
      worksheet: { id: sheet.id, title: sheet.title, directions: sheet.directions,
        items: sheet.items.map(item => ({ id: item.id, prompt: item.prompt,
          passageIds: item.passageIds.slice(), skill: item.skill,
          ...(answers ? { answer: item.answer, steps: item.steps.slice() } : {}) })) }, passages };
  }
  function studentWorksheet(course, week, sheet) { return projectWorksheet(course, week, sheet, false); }
  function answerWorksheet(course, week, sheet) { return projectWorksheet(course, week, sheet, true); }
  return { TRACKS, gradeLabel, gradeKey, trackLabel, courseContext, route, resolve, courseAt, weekAt, worksheetAt, navigation, studentWorksheet, answerWorksheet };
});
