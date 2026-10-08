/* Pure routing and worksheet projections for separately loaded weekly courses. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalWeekly = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const GRADE_TRACKS = ["common-core-math", "common-core-reading", "singapore-math"];
  const AP_DISCLAIMER = "AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.";
  // Named tracks identify courses by ID instead of grade. Each has an
  // editorial plan file; `aliases` reuse a graded course's weeks, and
  // `inventory` puts the track in the release gate's complete inventory.
  const NAMED_TRACKS = {
    "high-school-math": {
      label: "High-school math", planFile: "content/high-school-math.json", planPage: "high-school.html",
      planGlobal: "LIMINAL_HIGH_SCHOOL", planOutput: "high-school", planLabel: "high-school",
      context: "Conventional sequence · flexible placement", inventory: true,
      courses: ["algebra", "geometry", "algebra-2", "trigonometry", "calculus"],
      labels: { algebra: "Algebra", geometry: "Geometry", "algebra-2": "Algebra 2", trigonometry: "Trigonometry", calculus: "Calculus" },
      aliases: { algebra: { trackId: "common-core-math", grade: 9 }, geometry: { trackId: "common-core-math", grade: 10 }, "algebra-2": { trackId: "common-core-math", grade: 11 } },
    },
    ap: {
      label: "Courses for AP® exams", planFile: "content/ap.json", planPage: "ap.html",
      planGlobal: "LIMINAL_AP_PLAN", planOutput: "ap-plan", planLabel: "AP",
      context: "Prepares for the AP® exam · flexible placement", notice: AP_DISCLAIMER,
      // Joins the complete inventory when the three AP courses land.
      inventory: false,
      courses: ["calculus-ab", "physics-1", "physics-c-mechanics"],
      labels: { "calculus-ab": "Calculus AB", "physics-1": "Physics 1", "physics-c-mechanics": "Physics C: Mechanics" },
      aliases: {},
    },
  };
  const NAMED_TRACK_IDS = Object.keys(NAMED_TRACKS);
  const TRACKS = [...GRADE_TRACKS, ...NAMED_TRACK_IDS];
  // The high-school sequence, kept for existing callers; use namedCourses(trackId).
  const NAMED_COURSES = NAMED_TRACKS["high-school-math"].courses;
  const CALCULATOR = { none: "No calculator", scientific: "Scientific calculator", graphing: "Graphing calculator", any: "Any calculator" };
  const CHOICE_LETTERS = ["A", "B", "C", "D"];
  function namedTrack(trackId) { return Object.prototype.hasOwnProperty.call(NAMED_TRACKS, trackId) ? NAMED_TRACKS[trackId] : null; }
  function namedCourses(trackId) { const track = namedTrack(trackId); return track ? track.courses.slice() : []; }
  function gradeLabel(grade) { return grade === 0 ? "Kindergarten" : "Grade " + grade; }
  function gradeKey(grade) { return grade === 0 ? "k" : String(grade); }
  function trackLabel(id) {
    const named = namedTrack(id);
    const labels = { "common-core-math": "Common Core math", "common-core-reading": "Common Core reading", "singapore-math": "Singapore math" };
    return named ? named.label : Object.prototype.hasOwnProperty.call(labels, id) ? labels[id] : "";
  }
  function trackNotice(id) { const named = namedTrack(id); return named && named.notice || ""; }
  function calculatorLabel(policy) { return Object.prototype.hasOwnProperty.call(CALCULATOR, policy) ? CALCULATOR[policy] : ""; }
  function courseKey(course) { return course.courseId || gradeKey(course.grade); }
  function courseLabel(course) {
    if (!course.courseId) return gradeLabel(course.grade);
    const named = namedTrack(course.trackId);
    return course.courseTitle || course.title || named && named.labels[course.courseId] || "";
  }
  // Compact picker label: the registry's short course name, else the full label.
  function courseShortLabel(course) {
    const named = course.courseId && namedTrack(course.trackId);
    return named && Object.prototype.hasOwnProperty.call(named.labels, course.courseId) ? named.labels[course.courseId] : courseLabel(course);
  }
  function courseContext(trackId, grade) {
    const named = namedTrack(trackId);
    if (named) return named.context;
    if (trackId === "singapore-math") return "Editorial grade mapping";
    if (trackId === "common-core-math" && grade === 12) return "Optional advanced pathway";
    if (["common-core-math", "common-core-reading"].includes(trackId) && grade >= 9) return "Suggested sequence";
    return "";
  }
  function validKey(trackId, key) {
    const named = namedTrack(trackId);
    if (named) return typeof key === "string" && named.courses.includes(key);
    return GRADE_TRACKS.includes(trackId) && (Number.isInteger(key) && key >= 0 && key <= 12 || typeof key === "string" && /^(?:k|[1-9]|1[0-2])$/.test(key));
  }
  function route(trackId, key, week = 1) {
    if (!validKey(trackId, key) || !Number.isInteger(week) || week < 1 || week > 36) return "";
    return "#" + trackId + "/" + (typeof key === "number" ? gradeKey(key) : key) + "/" + week;
  }
  // The year-plan page for a course: a named plan page or the curriculum page.
  function planRoute(trackId, key) {
    if (!validKey(trackId, key)) return "";
    const named = namedTrack(trackId);
    return named ? named.planPage + "#" + key : "curriculum.html#" + trackId + "/" + (typeof key === "number" ? gradeKey(key) : key);
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
  function copyFigure(figure) {
    return { id: figure.id, alt: figure.alt, ...(figure.caption ? { caption: figure.caption } : {}),
      ...(figure.notToScale === true ? { notToScale: true } : {}), ...(typeof figure.svg === "string" ? { svg: figure.svg } : {}) };
  }
  // Explicit allowlists protect student exports when future content adds
  // teacher fields. Keys, rubrics and answer-only figures enter keys only.
  function projectItem(item, answers) {
    return { id: item.id, prompt: item.prompt,
      passageIds: item.passageIds.slice(),
      ...(Array.isArray(item.figureIds) && item.figureIds.length ? { figureIds: item.figureIds.slice() } : {}),
      ...(Array.isArray(item.choices) ? { choices: item.choices.slice() } : {}),
      ...(Number.isInteger(item.points) ? { points: item.points } : {}),
      skill: item.skill,
      ...(answers ? { answer: item.answer, steps: item.steps.slice(),
        ...(typeof item.key === "string" ? { key: item.key } : {}),
        ...(Array.isArray(item.rubric) ? { rubric: item.rubric.map(r => ({ points: r.points, criterion: r.criterion })) } : {}),
        ...(Array.isArray(item.answerFigureIds) && item.answerFigureIds.length ? { answerFigureIds: item.answerFigureIds.slice() } : {}) } : {}) };
  }
  function projectWorksheet(course, weekNumber, sheetId, answers) {
    const week = weekAt(course, weekNumber);
    const sheet = worksheetAt(week, sheetId);
    if (!sheet) return null;
    const needed = new Set(sheet.items.flatMap(item => item.passageIds));
    const passages = week.passages.filter(p => needed.has(p.id)).map(p => ({ id: p.id, title: p.title,
      text: p.text, kind: p.kind, attribution: p.attribution, sourceUrl: p.sourceUrl, readingMode: p.readingMode }));
    const items = sheet.items.map(item => projectItem(item, answers));
    const figureIds = new Set(items.flatMap(item => [...(item.figureIds || []), ...(item.answerFigureIds || [])]));
    const figures = (week.figures || []).filter(f => figureIds.has(f.id)).map(copyFigure);
    return { format: answers ? "liminal-weekly-answer-key" : "liminal-weekly-worksheet", version: 1,
      trackId: course.trackId,
      ...(course.courseId ? { courseId: course.courseId, courseTitle: courseLabel(course) } : { grade: course.grade }),
      week: week.week, title: week.title,
      worksheet: { id: sheet.id, title: sheet.title, directions: sheet.directions,
        ...(calculatorLabel(sheet.calculator) ? { calculator: sheet.calculator } : {}),
        ...(Number.isInteger(sheet.minutes) ? { minutes: sheet.minutes } : {}),
        items }, passages, ...(figures.length ? { figures } : {}) };
  }
  function studentWorksheet(course, week, sheet) { return projectWorksheet(course, week, sheet, false); }
  function answerWorksheet(course, week, sheet) { return projectWorksheet(course, week, sheet, true); }
  return { TRACKS, GRADE_TRACKS, NAMED_TRACKS, NAMED_TRACK_IDS, NAMED_COURSES, AP_DISCLAIMER, CALCULATOR, CHOICE_LETTERS,
    namedTrack, namedCourses, gradeLabel, gradeKey, trackLabel, trackNotice, calculatorLabel, courseKey, courseLabel, courseShortLabel, courseContext,
    route, planRoute, resolve, courseAt, weekAt, worksheetAt, navigation, studentWorksheet, answerWorksheet };
});
