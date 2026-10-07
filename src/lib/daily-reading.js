/* Pure selection, navigation and student projections for the daily library. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalDailyReading = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  function validGrade(grade) { return Number.isInteger(grade) && grade >= 0 && grade <= 12; }
  function gradeKey(grade) { return validGrade(grade) ? grade === 0 ? "k" : String(grade) : ""; }
  function gradeLabel(grade) { return validGrade(grade) ? grade === 0 ? "Kindergarten" : "Grade " + grade : ""; }
  function gradeFromKey(key) { return /^(?:k|[1-9]|1[0-2])$/.test(String(key)) ? key === "k" ? 0 : Number(key) : null; }
  function validDay(week, day) { return Number.isInteger(week) && week >= 1 && week <= 36 && Number.isInteger(day) && day >= 1 && day <= 5; }
  function route(grade, week = 1, day = 1) { return validGrade(grade) && validDay(week, day) ? "#" + gradeKey(grade) + "/" + week + "/" + day : ""; }
  function gradeAt(index, grade) { return (index && index.grades || []).find(item => item.grade === grade) || null; }
  function resolve(index, hash) {
    const raw = String(hash || "").replace(/^#/, ""), parts = raw.split("/");
    const requested = gradeAt(index, gradeFromKey(parts[0]));
    const course = requested || (index && index.grades || [])[0] || null;
    const exact = !!requested && parts.length === 3 && /^(?:[1-9]|[12][0-9]|3[0-6])$/.test(parts[1]) && /^[1-5]$/.test(parts[2]);
    return { course, grade: course ? course.grade : null, week: course ? exact ? Number(parts[1]) : 1 : null,
      day: course ? exact ? Number(parts[2]) : 1 : null, invalid: !!raw && !exact };
  }
  function dayAt(course, week, day) { return course && validDay(week, day) ? (course.days || []).find(item => item.week === week && item.day === day) || null : null; }
  function sourceAt(course, day) { return course && day ? (course.sources || []).find(source => source.id === day.sourceId) || null : null; }
  function progressionAt(course, week) { return (course && course.progression || []).find(item => item.weeks[0] <= week && week <= item.weeks[1]) || null; }
  function adjacent(grade, week, day, delta) {
    if (!validGrade(grade) || !validDay(week, day)) return null;
    const position = (week - 1) * 5 + day - 1 + delta;
    return position >= 0 && position < 180 ? { grade, week: Math.floor(position / 5) + 1, day: position % 5 + 1,
      href: route(grade, Math.floor(position / 5) + 1, position % 5 + 1) } : null;
  }
  function navigation(selected) { return { previous: adjacent(selected.grade, selected.week, selected.day, -1), next: adjacent(selected.grade, selected.week, selected.day, 1) }; }
  function modeLabel(mode) { return { "adult-read-aloud": "Adult reads aloud", shared: "Read together", independent: "Read independently" }[mode] || ""; }
  function minuteRange(grade) { return grade === 0 ? [10, 10] : grade <= 2 ? [10, 15] : grade <= 5 ? [15, 20] : grade <= 8 ? [20, 25] : [25, 30]; }
  function safeHttps(value) {
    if (typeof value !== "string" || !/^https:\/\/[^/?#]/.test(value) || /[\s\\<>"'\u0000-\u001f\u007f]/.test(value) || /%(?:0[0-9a-f]|1[0-9a-f]|20|7f)/i.test(value)) return false;
    try { const url = new URL(value); return url.protocol === "https:" && !!url.hostname && !url.username && !url.password; } catch { return false; }
  }
  function sourceLabel(source) { return source.author + ", " + source.title + " (" + source.publicationYear + ")" + (source.translator ? "; translated by " + source.translator + " (" + source.translationYear + ")" : ""); }
  function selectionCredit(day, source) {
    return { author: day.author || source.author,
      workTitle: day.workTitle && day.workTitle !== day.title && day.workTitle !== source.title ? day.workTitle : null };
  }
  // Explicit allowlists keep facilitator notes, evidence, and future private
  // fields out of downloadable student files, even if a disclosure is open.
  function studentReading(course, week, dayNumber) {
    const day = dayAt(course, week, dayNumber), source = sourceAt(course, day);
    if (!day || !source) return null;
    return { format: "liminal-daily-reading-student", version: 1, grade: course.grade,
      day: { id: day.id, week: day.week, day: day.day, title: day.title, genre: day.genre, readingMode: day.readingMode,
        ...(day.author === undefined ? {} : { author: day.author }), ...(day.workTitle === undefined ? {} : { workTitle: day.workTitle }),
        time: { readingMinutes: day.time.readingMinutes, discussionMinutes: day.time.discussionMinutes, totalMinutes: day.time.totalMinutes },
        context: day.context, contentNote: day.contentNote, focus: day.focus,
        excerpt: { locator: day.excerpt.locator, isCompleteWork: day.excerpt.isCompleteWork, continuesFrom: day.excerpt.continuesFrom, continuesTo: day.excerpt.continuesTo },
        blocks: day.blocks.map(block => ({ type: block.type, text: block.text })),
        questions: day.questions.map(question => ({ id: question.id, prompt: question.prompt })) },
      source: { author: source.author, title: source.title, translator: source.translator, edition: source.edition,
        publicationYear: source.publicationYear, translationYear: source.translationYear, url: safeHttps(source.url) ? source.url : null,
        textUrl: safeHttps(source.textUrl) ? source.textUrl : null,
        rights: { jurisdiction: source.rights.jurisdiction, status: source.rights.status, basis: source.rights.basis,
          verifiedDate: source.rights.verifiedDate, evidenceUrl: safeHttps(source.rights.evidenceUrl) ? source.rights.evidenceUrl : null } } };
  }
  return { validGrade, gradeKey, gradeLabel, gradeFromKey, validDay, route, gradeAt, resolve, dayAt, sourceAt, progressionAt,
    navigation, modeLabel, minuteRange, safeHttps, sourceLabel, selectionCredit, studentReading };
});
