/* Pure shared navigation. Context comes from the current URL, never storage. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalNavigation = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const PRIMARY = [
    { id: "courses", href: "curriculum.html", label: "Courses" },
    { id: "readings", href: "daily-reading.html", label: "Readings" },
    { id: "ap", href: "ap.html", label: "AP prep" },
    { id: "prep", href: "practice.html", label: "SAT/ACT" },
  ];
  const GRADE_TRACKS = ["common-core-math", "common-core-reading", "singapore-math"];
  const GRADE = /^(?:k|[1-9]|1[0-2])$/;
  const READING_GRADE = /^(?:k|[1-9]|1[0-2]|a[1-4])$/;
  const COURSE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
  const WEEK = /^(?:[1-9]|[12][0-9]|3[0-6])$/;

  function gradeKey(grade) { return Number(grade) === 0 || grade === "k" ? "k" : String(grade); }
  function trackLabel(trackId) {
    return ({ "common-core-math": "Common Core mathematics", "common-core-reading": "Common Core reading", "singapore-math": "Singapore mathematics" })[trackId] || trackId;
  }
  function moduleAt(index, trackId, grade) {
    return index && Array.isArray(index.modules) ? index.modules.find(entry => entry.trackId === trackId && gradeKey(entry.grade) === gradeKey(grade)) || null : null;
  }
  function lessonRoute(trackId, grade, lessonId) {
    return "#" + encodeURIComponent(trackId) + "/" + gradeKey(grade) + (lessonId ? "/" + encodeURIComponent(lessonId) : "");
  }
  // An explicit grade without authored expansion stays on that grade. Only an
  // empty entry route selects the first published module from the index.
  function lessonContext(index, location = {}) {
    const modules = index && Array.isArray(index.modules) ? index.modules : [];
    const query = new URLSearchParams(location.search || "");
    let parts;
    try { parts = String(location.hash || "").replace(/^#/, "").split("/").filter(Boolean).map(decodeURIComponent); }
    catch (_) { return { invalid: true, entry: null, trackId: null, grade: null, lessonId: null }; }
    const requestedId = query.get("course") || query.get("courseId") || query.get("module");
    const alias = modules.find(entry => entry.id === (requestedId || parts[0]) || (entry.legacyIds || []).includes(requestedId || parts[0]));
    if (alias && (requestedId || parts.length <= 2)) {
      return { entry: alias, trackId: alias.trackId, grade: alias.grade, lessonId: query.get("lesson") || parts[1] || null, invalid: false };
    }
    if (!parts.length && !requestedId) {
      const entry = modules[0] || null;
      return { entry, trackId: entry && entry.trackId, grade: entry && entry.grade, lessonId: query.get("lesson") || null, invalid: false };
    }
    if (!requestedId && parts.length >= 2 && parts.length <= 3 && GRADE_TRACKS.includes(parts[0]) && GRADE.test(parts[1])) {
      const grade = parts[1] === "k" ? 0 : Number(parts[1]);
      const entry = moduleAt(index, parts[0], grade);
      return { entry, trackId: parts[0], grade, lessonId: parts[2] || query.get("lesson") || null, invalid: false, unavailable: !entry };
    }
    return { invalid: true, entry: null, trackId: null, grade: null, lessonId: null };
  }
  function legacyLessonHref(index, location) {
    const context = lessonContext(index, location);
    return "lessons.html" + (context.trackId ? lessonRoute(context.trackId, context.grade, context.lessonId) : (location.search || "") + (location.hash || ""));
  }

  function model(location, data = {}) {
    const page = String(location.pathname || "index.html").split("/").pop() || "index.html";
    const parts = String(location.hash || "").replace(/^#/, "").split("/");
    let area = null, track = "common-core-math", key = "k", week = "1", course = null, readingGrade = null;
    if (["curriculum.html", "weeks.html", "high-school.html", "courses.html", "lessons.html"].includes(page)) area = "courses";
    if (["daily-reading.html", "reading-level.html", "library.html"].includes(page)) area = "readings";
    if (["practice.html", "learn.html", "print.html"].includes(page)) area = "prep";
    if (page === "ap.html") area = "ap";

    if (page === "curriculum.html") {
      if (GRADE_TRACKS.includes(parts[0])) track = parts[0];
      if (GRADE.test(parts[1])) key = parts[1];
    } else if (page === "weeks.html") {
      // The available index also describes the page's fallback for an invalid
      // bookmark. Valid direct links do not need the index to be classified.
      const courses = data.weeklyIndex && data.weeklyIndex.courses;
      const selected = courses && (courses.find(item => item.trackId === parts[0] &&
        (item.courseId || (item.grade === 0 ? "k" : String(item.grade))) === parts[1]) ||
        courses.find(item => item.trackId === "common-core-math" && item.grade === 0) || courses[0]);
      if (selected) {
        track = selected.trackId;
        key = selected.courseId || (selected.grade === 0 ? "k" : String(selected.grade));
      } else if (GRADE_TRACKS.includes(parts[0]) && GRADE.test(parts[1]) ||
        ["high-school-math", "ap"].includes(parts[0]) && COURSE.test(parts[1])) {
        track = parts[0]; key = parts[1];
      }
      if (parts.length === 3 && track === parts[0] && key === parts[1] && WEEK.test(parts[2])) week = parts[2];
    } else if (page === "high-school.html") {
      track = "high-school-math";
      const courses = data.highSchool && data.highSchool.courses;
      const selected = courses && (courses.find(item => item.id === parts[0]) || courses[0]);
      key = selected ? selected.id : COURSE.test(parts[0]) ? parts[0] : "algebra";
    } else if (["courses.html", "lessons.html"].includes(page)) {
      const context = lessonContext(data.lessonModules, location);
      if (context.trackId) { track = context.trackId; key = gradeKey(context.grade); }
    }
    else if (page === "daily-reading.html") {
      // #browse/<grade>[/<week>], #<grade>/<week>/<day>, the grade's date,
      // month and reading routes (#<grade>/date/..., /month/..., /reading/...)
      // and #print/.../<grade>,<grade>: the first grade. Without a grade in
      // the address the page shows the remembered grade (data.readingGrade).
      const browse = parts[0] === "browse", print = parts[0] === "print";
      const requested = browse ? parts.length <= 3 ? parts[1] : null : print ? (parts[parts[1] === "date" ? 3 : parts[1] === "night" || parts[1] === "dates" ? 4 : 1] || "").split(",")[0] : parts[0];
      readingGrade = READING_GRADE.test(requested) ? requested : null;
      key = readingGrade || (READING_GRADE.test(data.readingGrade) ? data.readingGrade : "k");
      if (browse && parts.length === 3 && READING_GRADE.test(parts[1]) && WEEK.test(parts[2])) week = parts[2];
      if (READING_GRADE.test(parts[0]) && parts.length === 3 && WEEK.test(parts[1]) && /^[1-5]$/.test(parts[2])) week = parts[1];
    }
    if (["reading-level.html", "library.html"].includes(page) && READING_GRADE.test(data.readingGrade)) key = data.readingGrade;
    if (track === "common-core-reading") area = "readings";
    if (track === "ap") { area = "ap"; course = key; }

    const primary = PRIMARY.map(item => ({ ...item, current: item.id === area ? "true" : null }));
    if (course) primary.find(item => item.id === "ap").href += "#" + course;
    const gradeContext = ["curriculum.html", "weeks.html", "courses.html", "lessons.html", "daily-reading.html"].includes(page) && GRADE_TRACKS.includes(track);
    if (gradeContext && GRADE.test(key)) {
      const mathTrack = track === "common-core-reading" ? "common-core-math" : track;
      primary.find(item => item.id === "courses").href += "#" + mathTrack + "/" + key;
    }
    if (gradeContext && READING_GRADE.test(key) && !(page === "daily-reading.html" && !readingGrade)) {
      primary.find(item => item.id === "readings").href += page === "weeks.html" && area === "readings" ? "#" + key + "/" + week + "/1" : "#browse/" + key;
    }

    let secondary = [];
    if (area === "courses") {
      const named = track === "high-school-math";
      secondary = [
        { id: "plans", label: "Year plans", href: named ? "curriculum.html" : "curriculum.html#" + track + "/" + key,
          current: page === "curriculum.html" ? "page" : null },
        { id: "weeks", label: "Weekly work", href: "weeks.html#" + track + "/" + key + "/" + week,
          current: page === "weeks.html" ? "page" : null },
        { id: "high-school", label: "High school", href: "high-school.html" + (named ? "#" + key : ""),
          current: page === "high-school.html" ? "page" : null },
      ];
    } else if (area === "readings") {
      const advanced = /^a[1-4]$/.test(key), planGrade = advanced ? "k" : key;
      const readingNight = page === "daily-reading.html" && READING_GRADE.test(parts[0]) && parts.length === 3 && WEEK.test(parts[1]) && /^[1-5]$/.test(parts[2]);
      // Without a grade in the address, the page itself resumes the
      // reader's remembered grade.
      const dailyHref = page === "weeks.html" || readingNight ?
        "daily-reading.html#" + key + "/" + week + "/" + (readingNight ? parts[2] : "1") :
        ["reading-level.html", "library.html"].includes(page) || page === "daily-reading.html" && !readingGrade ? "daily-reading.html" : "daily-reading.html#browse/" + key;
      // One vocabulary (docs/daily-reading.md): Nightly readings, Library,
      // Reading level, Year plans, Weekly lessons.
      secondary = [
        { id: "daily", label: "Nightly readings", href: dailyHref, current: page === "daily-reading.html" ? "page" : null },
        { id: "library", label: "Library", href: "library.html", current: page === "library.html" ? "page" : null },
        { id: "level", label: "Reading level", href: "reading-level.html", current: page === "reading-level.html" ? "page" : null },
        { id: "plans", label: "Year plans" + (advanced ? " (K–12)" : ""), href: "curriculum.html#common-core-reading/" + planGrade,
          current: page === "curriculum.html" ? "page" : null },
        { id: "weeks", label: "Weekly lessons" + (advanced ? " (K–12)" : ""), href: "weeks.html#common-core-reading/" + planGrade + "/" + (advanced ? "1" : week),
          current: page === "weeks.html" ? "page" : null },
      ];
    }
    const expansionTrack = area === "readings" ? "common-core-reading" : track;
    const expansion = GRADE.test(key) && moduleAt(data.lessonModules, expansionTrack, key);
    if (expansion && ["courses", "readings"].includes(area)) secondary.splice(area === "courses" ? 2 : secondary.length, 0, {
      id: "lessons", label: "Expanded lessons", href: "lessons.html" + lessonRoute(expansionTrack, key),
      current: ["lessons.html", "courses.html"].includes(page) ? "page" : null,
    });
    return { area, homeCurrent: page === "index.html" ? "page" : null, primary, secondary,
      secondaryLabel: area === "readings" ? "Reading resources" : "Course resources" };
  }
  // The grade key a browser remembers for Nightly readings (localStorage
  // "liminal:readings:v1", untrusted), or null.
  function rememberedReadingGrade(raw) {
    let state = null;
    try { state = JSON.parse(raw); } catch (_) { return null; }
    const grade = state && typeof state === "object" && state.version === 1 ? state.grade : null;
    if (!Number.isInteger(grade) || grade < 0 || grade > 16) return null;
    return grade === 0 ? "k" : grade <= 12 ? String(grade) : "a" + (grade - 12);
  }
  return { PRIMARY, model, rememberedReadingGrade, gradeKey, trackLabel, moduleAt, lessonRoute, lessonContext, legacyLessonHref };
});
