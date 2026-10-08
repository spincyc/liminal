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

  function model(location, data = {}) {
    const page = String(location.pathname || "index.html").split("/").pop() || "index.html";
    const parts = String(location.hash || "").replace(/^#/, "").split("/");
    let area = null, track = "common-core-math", key = "k", week = "1", course = null;
    if (["curriculum.html", "weeks.html", "high-school.html", "courses.html"].includes(page)) area = "courses";
    if (["daily-reading.html", "reading-level.html"].includes(page)) area = "readings";
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
    } else if (page === "courses.html") key = "8";
    else if (page === "daily-reading.html") {
      const requested = parts[0] === "browse" ? parts.length === 2 ? parts[1] : null : parts[0];
      key = READING_GRADE.test(requested) ? requested : "k";
      if (READING_GRADE.test(parts[0]) && parts.length === 3 && WEEK.test(parts[1]) && /^[1-5]$/.test(parts[2])) week = parts[1];
    }
    if (track === "common-core-reading") area = "readings";
    if (track === "ap") { area = "ap"; course = key; }

    const primary = PRIMARY.map(item => ({ ...item, current: item.id === area ? "true" : null }));
    if (course) primary.find(item => item.id === "ap").href += "#" + course;
    const gradeContext = ["curriculum.html", "weeks.html", "courses.html", "daily-reading.html"].includes(page) && GRADE_TRACKS.includes(track);
    if (gradeContext && GRADE.test(key)) {
      const mathTrack = track === "common-core-reading" ? "common-core-math" : track;
      primary.find(item => item.id === "courses").href += "#" + mathTrack + "/" + key;
    }
    if (gradeContext && READING_GRADE.test(key)) {
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
        { id: "lessons", label: "Grade 8 lessons", href: "courses.html", current: page === "courses.html" ? "page" : null },
      ];
    } else if (area === "readings") {
      const advanced = /^a[1-4]$/.test(key), planGrade = advanced ? "k" : key;
      const readingNight = page === "daily-reading.html" && READING_GRADE.test(parts[0]) && parts.length === 3 && WEEK.test(parts[1]) && /^[1-5]$/.test(parts[2]);
      const dailyHref = page === "weeks.html" || readingNight ?
        "daily-reading.html#" + key + "/" + week + "/" + (readingNight ? parts[2] : "1") : "daily-reading.html#browse/" + key;
      secondary = [
        { id: "daily", label: "Daily reading", href: dailyHref, current: page === "daily-reading.html" ? "page" : null },
        { id: "level", label: "Reading level", href: "reading-level.html", current: page === "reading-level.html" ? "page" : null },
        { id: "plans", label: "Year plans" + (advanced ? " (K–12)" : ""), href: "curriculum.html#common-core-reading/" + planGrade,
          current: page === "curriculum.html" ? "page" : null },
        { id: "weeks", label: "Weekly work" + (advanced ? " (K–12)" : ""), href: "weeks.html#common-core-reading/" + planGrade + "/" + (advanced ? "1" : week),
          current: page === "weeks.html" ? "page" : null },
      ];
    }
    return { area, homeCurrent: page === "index.html" ? "page" : null, primary, secondary,
      secondaryLabel: area === "readings" ? "Reading resources" : "Course resources" };
  }
  return { PRIMARY, model };
});
