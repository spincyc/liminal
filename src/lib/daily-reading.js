/* Pure selection, navigation and student projections for the daily library. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalDailyReading = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  // Grades K–12 are 0–12; Advanced 1–4 (reading levels beyond Grade 12, not
  // courses or credits) are 13–16 with keys a1–a4.
  const GRADES = Object.freeze(Array.from({ length: 17 }, (_, grade) => grade));
  function validGrade(grade) { return Number.isInteger(grade) && grade >= 0 && grade <= 16; }
  function isAdvanced(grade) { return validGrade(grade) && grade > 12; }
  function gradeKey(grade) { return validGrade(grade) ? grade === 0 ? "k" : isAdvanced(grade) ? "a" + (grade - 12) : String(grade) : ""; }
  function gradeLabel(grade) { return validGrade(grade) ? grade === 0 ? "Kindergarten" : isAdvanced(grade) ? "Advanced " + (grade - 12) : "Grade " + grade : ""; }
  function gradeFromKey(key) { const k = String(key); return /^(?:k|[1-9]|1[0-2])$/.test(k) ? k === "k" ? 0 : Number(k) : /^a[1-4]$/.test(k) ? 12 + Number(k.slice(1)) : null; }
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
  // The instruction library covers K–12 only. Advanced reading levels link
  // to that library's entrance, never to an implied equivalent school grade.
  function lessonLinks(grade, week = 1) {
    if (!validGrade(grade) || !validDay(week, 1)) return null;
    const advanced = isAdvanced(grade), key = advanced ? "k" : gradeKey(grade);
    return {
      weekly: { href: "weeks.html#common-core-reading/" + key + "/" + (advanced ? 1 : week),
        label: advanced ? "Related K–12 reading instruction" : gradeLabel(grade) + " reading instruction · Week " + week },
      plan: { href: "curriculum.html#common-core-reading/" + key,
        label: advanced ? "K–12 reading year plans" : gradeLabel(grade) + " reading year plan" },
    };
  }
  function modeLabel(mode) { return { "adult-read-aloud": "Adult reads aloud", shared: "Read together", independent: "Read independently" }[mode] || ""; }
  function minuteRange(grade) { return grade === 0 ? [10, 10] : grade <= 2 ? [10, 15] : grade <= 5 ? [15, 20] : grade <= 8 ? [20, 25] : grade <= 12 ? [25, 30] : grade === 13 ? [30, 35] : grade === 14 ? [30, 40] : [35, 45]; }
  function safeHttps(value) {
    if (typeof value !== "string" || !/^https:\/\/[^/?#]/.test(value) || /[\s\\<>"'\u0000-\u001f\u007f]/.test(value) || /%(?:0[0-9a-f]|1[0-9a-f]|20|7f)/i.test(value)) return false;
    try { const url = new URL(value); return url.protocol === "https:" && !!url.hostname && !url.username && !url.password; } catch { return false; }
  }
  function sourceLabel(source) { return source.author + ", " + source.title + " (" + source.publicationYear + ")" + (source.translator ? "; translated by " + source.translator + " (" + source.translationYear + ")" : ""); }
  // Student printouts need a complete credit and a retrievable source, not the
  // editorial audit trail. Full edition, locator and rights records stay in
  // the digital disclosure and the standalone download's student projection.
  function sourceNote(source) {
    const url = safeHttps(source.url) ? source.url : safeHttps(source.textUrl) ? source.textUrl : null;
    return { credit: sourceLabel(source), rights: "Public domain in the United States.",
      url, linkText: url ? url.replace(/^https:\/\/(?:www\.)?/, "") : null };
  }
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
  // Browsing. A grade's year at a glance lives in a small file of its own,
  // content/reading-daily/browse/<key>.json, built by an explicit allowlist:
  // titles, credits, minutes, mode, genre and continuation only — never the
  // text, questions, facilitator notes or evidence.
  const MODES = Object.freeze(["adult-read-aloud", "shared", "independent"]);
  function browseFile(grade) { return validGrade(grade) ? "content/reading-daily/browse/" + gradeKey(grade) + ".json" : ""; }
  function browseRoute(grade) { return validGrade(grade) ? "#browse/" + gradeKey(grade) : ""; }
  function browseIndex(course) {
    return { schemaVersion: 1, grade: course.grade, title: course.title, overview: course.overview,
      progression: course.progression.map(stage => ({ weeks: [stage.weeks[0], stage.weeks[1]], focus: stage.focus })),
      nights: course.days.map(day => {
        const source = sourceAt(course, day), credit = selectionCredit(day, source);
        return { week: day.week, day: day.day, title: day.title, author: credit.author, work: credit.workTitle || source.title,
          minutes: day.time.totalMinutes, mode: day.readingMode, genre: day.genre,
          continuesFrom: !!day.excerpt.continuesFrom, continuesTo: !!day.excerpt.continuesTo };
      }) };
  }
  // Which view a hash asks for. An empty hash and #browse[/<grade>] browse;
  // anything else is a night, resolved as before.
  function view(index, hash) {
    const raw = String(hash || "").replace(/^#/, ""), parts = raw.split("/");
    if (raw && parts[0] !== "browse") return { view: "read", ...resolve(index, hash) };
    const requested = parts.length === 2 ? gradeAt(index, gradeFromKey(parts[1])) : null;
    const course = requested || (index && index.grades || [])[0] || null;
    return { view: "browse", course, grade: course ? course.grade : null, invalid: parts.length > 2 || parts.length === 2 && !requested };
  }
  function genreLabel(genre) { return String(genre || "").replace(/-/g, " "); }
  function searchable(value) { return String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’‘]/g, "'").toLowerCase(); }
  // The work is shown only when the night's title does not already name it.
  function workLabel(night) { return night.work && !searchable(night.title).includes(searchable(night.work)) ? night.work : null; }
  // Every query word must appear in the title, author, work or genre.
  function filterNights(nights, { query = "", mode = "", genre = "" } = {}) {
    const words = searchable(query).split(/\s+/).filter(Boolean);
    return (nights || []).filter(night => {
      if (mode && night.mode !== mode) return false;
      if (genre && night.genre !== genre) return false;
      const haystack = searchable([night.title, night.author, night.work, genreLabel(night.genre)].join(" "));
      return words.every(word => haystack.includes(word));
    });
  }
  // Continued readings as runs: each night's part and the run's length, or
  // null for a night that stands alone.
  function runs(nights) {
    const parts = [], list = nights || [];
    let start = 0;
    list.forEach((night, i) => {
      if (!(i > 0 && night.continuesFrom && list[i - 1].continuesTo)) start = i;
      parts.push(start);
    });
    return list.map((night, i) => {
      const first = parts[i], length = parts.filter(value => value === first).length;
      return length > 1 ? { part: i - first + 1, of: length } : null;
    });
  }
  function genres(nights) { return [...new Set((nights || []).map(night => night.genre))].sort((a, b) => genreLabel(a).localeCompare(genreLabel(b))); }
  function modes(nights) { return MODES.filter(mode => (nights || []).some(night => night.mode === mode)); }
  function minutesSpan(nights) {
    const values = (nights || []).map(night => night.minutes);
    return values.length ? [Math.min(...values), Math.max(...values)] : null;
  }
  // Reading one night loads only its week: content/reading-daily/weeks/<key>/<week>.json
  // holds that week's five nights and the sources they cite, plus the grade's
  // overview and progression, so the reader treats it as a small course.
  function weekFile(grade, week) { return validGrade(grade) && validDay(week, 1) ? "content/reading-daily/weeks/" + gradeKey(grade) + "/" + week + ".json" : ""; }
  function weekSlice(course, week) {
    const days = (course.days || []).filter(day => day.week === week), cited = new Set(days.map(day => day.sourceId));
    return { schemaVersion: course.schemaVersion, grade: course.grade, title: course.title, overview: course.overview, progression: course.progression,
      week, sources: (course.sources || []).filter(source => cited.has(source.id)), days };
  }
  // Presentation of the supplied text, which never changes its words.
  // A block whose lines hold tab-separated columns (a source table, such as a
  // naturalist's nightly counts) as rows of cells; a row that repeats the
  // first row's opening cell is a repeated header. Null for ordinary text.
  // (src/lib/reading-level.js keeps an identical copy for its passages.)
  function tableRows(text) {
    if (typeof text !== "string" || !text.includes("\t")) return null;
    const lines = text.split("\n").filter(line => line.trim());
    const key = cell => cell.trim().replace(/[.:]+$/, "").toLowerCase();
    const first = key(lines[0].split("\t")[0]);
    return lines.map((line, index) => {
      const cells = line.split("\t");
      return { cells, header: index === 0 || (cells.length > 1 && key(cells[0]) === first) };
    });
  }
  // Paired _underscores_ are the editions' plain-text mark for italics. In a
  // block with an even number of underscores, each consecutive pair encloses
  // emphasis (which may cross a line, or sit inside a word, as in
  // "_un_natural"); a block with an odd number is left exactly as written.
  // Returns the text as segments, without the markers.
  function emphasis(text) {
    const value = String(text), count = (value.match(/_/g) || []).length;
    if (!count || count % 2) return [{ text: value, em: false }];
    return value.split("_").map((part, index) => ({ text: part, em: index % 2 === 1 })).filter(segment => segment.text);
  }
  return { GRADES, validGrade, isAdvanced, gradeKey, gradeLabel, gradeFromKey, validDay, route, gradeAt, resolve, dayAt, sourceAt, progressionAt,
    navigation, lessonLinks, modeLabel, minuteRange, safeHttps, sourceLabel, sourceNote, selectionCredit, studentReading,
    MODES, browseFile, browseRoute, browseIndex, view, genreLabel, workLabel, filterNights, runs, genres, modes, minutesSpan,
    weekFile, weekSlice, tableRows, emphasis };
});
