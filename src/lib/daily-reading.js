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
  // A school-night route. An unknown grade falls back to `fallbackGrade`
  // (the remembered one) when the index has it, else the first grade.
  function resolve(index, hash, fallbackGrade = null) {
    const raw = String(hash || "").replace(/^#/, ""), parts = raw.split("/");
    const requested = gradeAt(index, gradeFromKey(parts[0]));
    const course = requested || gradeAt(index, fallbackGrade) || (index && index.grades || [])[0] || null;
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
  function navigation(selected) {
    const { grade, week, day } = selected || {}, valid = validGrade(grade) && validDay(week, day);
    return {
      first: valid && (week !== 1 || day !== 1) ? adjacent(grade, 1, 1, 0) : null,
      previous: adjacent(grade, week, day, -1), next: adjacent(grade, week, day, 1),
      last: valid && (week !== 36 || day !== 5) ? adjacent(grade, 36, 5, 0) : null,
    };
  }
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
    return day && source ? studentPacket(course.grade, day, source) : null;
  }
  // The same projection for any one reading: a school night or a calendar
  // reading (which has no week or day), with its resolved source record.
  function studentPacket(grade, day, source) {
    if (!validGrade(grade) || !day || !source) return null;
    return { format: "liminal-daily-reading-student", version: 1, grade,
      day: { id: day.id, ...(day.week ? { week: day.week, day: day.day } : {}), title: day.title, genre: day.genre, readingMode: day.readingMode,
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
  function browseRoute(grade, week = null) { return validGrade(grade) ? "#browse/" + gradeKey(grade) + (validDay(week, 1) ? "/" + week : "") : ""; }
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
  // Which view a hash asks for (docs/daily-reading.md, "Routes"):
  //   (empty)                      the Year view of the remembered grade, with Tonight
  //   #browse/<grade>[/<week>]     a grade's year, optionally opened at a week
  //   #<grade>/<week>/<day>        a school night
  //   #<grade>/date[/<YYYY-MM-DD>] the date calendar's reading for a date (today by default)
  //   #<grade>/month/<YYYY-MM>     a month of a grade's date calendar
  //   #<grade>/reading/<id>        any one reading by its id
  //   #print[/date/<YYYY-MM-DD> | /night/<week>/<day>][/<grade>,<grade>...]
  // `options.grade` is the remembered grade for an empty hash; `options.today`
  // is the date a date route without a valid date falls back to.
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/, ISO_MONTH = /^\d{4}-(?:0[1-9]|1[0-2])$/;
  // A real calendar date, years 0001-9999 (the same rule as
  // reading-calendar's parseDate). setUTCFullYear, because Date.UTC reads
  // years 0-99 as 1900-1999.
  function validDate(value) {
    if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
    const [y, m, d] = value.split("-").map(Number), date = new Date(0);
    date.setUTCFullYear(y, m - 1, d);
    return y >= 1 && date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  }
  // Whether a typed date should open: a complete, valid date that differs
  // from the one shown, and, while the reader is still typing into the
  // field, only on an explicit commit (Enter or leaving the field). The
  // picker's own choice commits at once.
  function dateCommit({ value, current = null, typing = false, explicit = false } = {}) {
    if (!validDate(value) || value === current) return null;
    return typing && !explicit ? null : value;
  }
  function validReadingId(grade, id) { return validGrade(grade) && typeof id === "string" && id.length <= 120 && new RegExp("^reading-" + gradeKey(grade) + "-[a-z0-9]+(?:-[a-z0-9]+)*$").test(id); }
  function view(index, hash, options = {}) {
    const raw = String(hash || "").replace(/^#/, ""), parts = raw.split("/"), grades = index && index.grades || [];
    const fallback = gradeAt(index, options.grade) || grades[0] || null, today = validDate(options.today) ? options.today : null;
    const anyToday = list => list.some(grade => calendarHas(index, grade, today));
    const at = course => ({ course, grade: course ? course.grade : null });
    if (!raw) return { view: "browse", ...at(fallback), week: null, home: true, invalid: false };
    if (parts[0] === "browse") {
      const requested = parts.length >= 2 ? gradeAt(index, gradeFromKey(parts[1])) : null;
      const week = parts.length === 3 && /^(?:[1-9]|[12][0-9]|3[0-6])$/.test(parts[2]) ? Number(parts[2]) : null;
      return { view: "browse", ...at(requested || fallback), week, home: false,
        invalid: parts.length > 3 || parts.length >= 2 && !requested || parts.length === 3 && !week };
    }
    if (parts[0] === "print") {
      let date = null, until = null, week = null, day = null, rest = parts.slice(1), invalid = false;
      if (rest[0] === "date") { date = validDate(rest[1]) ? rest[1] : today; invalid = !validDate(rest[1]); rest = rest.slice(2); }
      else if (rest[0] === "dates") {
        // A range of dates; an unusable one falls back to its first date.
        const ok = validDate(rest[2]) && printDates(rest[1], rest[2]).length > 0;
        date = validDate(rest[1]) ? rest[1] : today; until = ok ? rest[2] : null; invalid = !ok; rest = rest.slice(3);
      }
      else if (rest[0] === "night") {
        const ok = rest.length >= 3 && validDay(Number(rest[1]), Number(rest[2])) && /^\d+$/.test(rest[1] + rest[2]);
        week = ok ? Number(rest[1]) : 1; day = ok ? Number(rest[2]) : 1; invalid = !ok; rest = rest.slice(3);
      }
      const keys = rest.length === 1 ? rest[0].split(",") : [], chosen = keys.map(gradeFromKey).filter(grade => gradeAt(index, grade));
      if (rest.length > 1 || keys.length !== chosen.length) invalid = true;
      // No day given: today's date when a chosen level (or the remembered
      // one) has a reading for it, otherwise the first school night.
      if (!date && week === null) {
        if (anyToday(chosen.length ? chosen : fallback ? [fallback.grade] : [])) date = today; else { week = 1; day = 1; }
      }
      if (until === date) until = null;
      return { view: "print", course: null, grade: null, date, until, week, day, grades: [...new Set(chosen)].sort((x, y) => x - y), invalid };
    }
    const requested = gradeAt(index, gradeFromKey(parts[0]));
    if (requested && parts[1] === "date" && parts.length <= 3) {
      const given = parts.length === 3 ? parts[2] : null;
      return { view: "date", ...at(requested), date: validDate(given) ? given : today, invalid: given !== null && !validDate(given) };
    }
    if (requested && parts[1] === "month" && parts.length === 3) {
      const month = ISO_MONTH.test(parts[2]) ? parts[2] : today ? today.slice(0, 7) : null;
      return { view: "month", ...at(requested), month, invalid: !ISO_MONTH.test(parts[2]) };
    }
    if (requested && parts[1] === "reading" && parts.length === 3 && validReadingId(requested.grade, parts[2])) {
      // A school night's id opens the night itself; one naming no real night
      // (week 37) is an unrecognized link, not a reload.
      const night = /-w(\d\d)-d(\d)$/.exec(parts[2]);
      if (night) {
        const week = Number(night[1]), day = Number(night[2]), ok = validDay(week, day);
        return { view: "read", ...at(requested), week: ok ? week : 1, day: ok ? day : 1, redirect: ok, invalid: !ok };
      }
      return { view: "reading", ...at(requested), id: parts[2], invalid: false };
    }
    return { view: "read", ...resolve(index, hash, options.grade) };
  }
  function dateRoute(grade, date) { return validGrade(grade) && validDate(date) ? "#" + gradeKey(grade) + "/date/" + date : ""; }
  function monthRoute(grade, month) { return validGrade(grade) && ISO_MONTH.test(String(month)) ? "#" + gradeKey(grade) + "/month/" + month : ""; }
  function readingRoute(grade, id) { return validReadingId(grade, id) ? "#" + gradeKey(grade) + "/reading/" + id : ""; }
  function printRoute({ date = null, until = null, week = null, day = null, grades = [] } = {}) {
    const keys = grades.filter(validGrade).map(gradeKey).join(",");
    const what = validDate(date) && validDate(until) && until !== date ? "/dates/" + date + "/" + until
      : validDate(date) ? "/date/" + date : validDay(week, day) ? "/night/" + week + "/" + day : "";
    return "#print" + what + (keys ? "/" + keys : "");
  }
  // Built files a view loads. Paths come from validated grades and ids only.
  function readingFile(grade, id) { return validReadingId(grade, id) ? "content/reading-daily/readings/" + gradeKey(grade) + "/" + id + ".json" : ""; }
  function calendarFile(grade) { return validGrade(grade) ? "content/reading-daily/calendar/" + gradeKey(grade) + ".json" : ""; }
  const SPANS_FILE = "content/reading-daily/calendar/spans.json";
  function hasCalendar(index, grade) { const course = gradeAt(index, grade); return !!(course && course.calendar); }
  // Whether a level's date calendar has a reading for a date: every date of
  // years 0001-9999 has one once the level has a calendar.
  function calendarHas(index, grade, date) { return hasCalendar(index, grade) && validDate(date); }
  // A school night's place, as people say it.
  function nightLabel(week, day) { return validDay(week, day) ? "Week " + week + ", Day " + day : ""; }
  // Tab and history titles: the most specific part first, then the grade.
  function documentTitle(parts) { return parts.filter(Boolean).join(" · ") + " — Liminal"; }
  // What an adult needs before the text: time, mode, the night's challenge
  // and discussion focus, and any content note. `challenge` is adult guidance
  // that student projections do not carry; pass the full reading to show it.
  function beforeYouRead(day) {
    if (!day || !day.time) return [];
    return [["Time", "About " + day.time.totalMinutes + " min: read " + day.time.readingMinutes + ", discuss " + day.time.discussionMinutes],
      ["Reading", modeLabel(day.readingMode)], ["Challenge", day.challenge], ["Discussion focus", day.focus], ["Content note", day.contentNote]]
      .filter(([, text]) => typeof text === "string" && text.trim()).map(([label, text]) => ({ label, text }));
  }
  // Continued school nights: the run's part and length and links to the
  // neighbouring parts, from the grade's browse nights (which cross weeks).
  function continuation(grade, nights, week, day) {
    const list = nights || [], i = list.findIndex(night => night.week === week && night.day === day), part = i >= 0 ? runs(list)[i] : null;
    if (!part) return null;
    const link = night => night && { label: nightLabel(night.week, night.day), href: route(grade, night.week, night.day) };
    return { part: part.part, of: part.of, from: part.part > 1 ? link(list[i - 1]) : null, to: part.part < part.of ? link(list[i + 1]) : null };
  }

  // Remembered place: the last grade and reading opened in this browser, so
  // a return visit offers to continue. Stored as untrusted JSON and parsed
  // with an allowlist; nothing else is kept.
  const STORAGE_KEY = "liminal:readings:v1";
  function parseRemembered(raw) {
    let value;
    try { value = JSON.parse(String(raw)); } catch { return null; }
    if (!value || typeof value !== "object" || value.version !== 1 || !validGrade(value.grade)) return null;
    const out = { version: 1, grade: value.grade, night: null, date: null };
    const night = value.night;
    if (night && typeof night === "object" && validGrade(night.grade) && validDay(night.week, night.day)) out.night = { grade: night.grade, week: night.week, day: night.day };
    if (value.date && typeof value.date === "object" && validGrade(value.date.grade) && validDate(value.date.date)) out.date = { grade: value.date.grade, date: value.date.date };
    return out;
  }
  // The state after opening a view (selected = a view() result).
  function remember(state, selected) {
    if (!selected || !validGrade(selected.grade)) return state;
    const next = { version: 1, grade: selected.grade, night: state && state.night || null, date: state && state.date || null };
    if (selected.view === "read" && validDay(selected.week, selected.day)) next.night = { grade: selected.grade, week: selected.week, day: selected.day };
    if (selected.view === "date" && validDate(selected.date)) next.date = { grade: selected.grade, date: selected.date };
    return next;
  }
  // The Tonight card: where to continue the school year, the plan's night for
  // today (when the reading-level plan has one), and today's date reading.
  // `planNight` is { level, week, day, date } or null; `nights` are the
  // remembered grade's browse nights, for titles. Every entry links to a
  // reading that exists.
  function tonight({ index, state = null, planNight = null, today, nights = null } = {}) {
    const entries = [], title = (grade, week, day) => {
      const night = state && state.night && grade === state.night.grade && (nights || []).find(item => item.week === week && item.day === day);
      return night ? night.title : null;
    };
    if (planNight && gradeAt(index, planNight.level) && validDay(planNight.week, planNight.day)) {
      entries.push({ kind: "plan", grade: planNight.level, label: (planNight.date === today ? "Tonight in your plan" : "Next in your plan") + ": " + gradeLabel(planNight.level) + ", " + nightLabel(planNight.week, planNight.day),
        href: route(planNight.level, planNight.week, planNight.day), title: title(planNight.level, planNight.week, planNight.day) });
    }
    const last = state && state.night;
    if (last && gradeAt(index, last.grade)) {
      const next = adjacent(last.grade, last.week, last.day, 1);
      entries.push({ kind: "continue", grade: last.grade, label: "Last opened: " + gradeLabel(last.grade) + ", " + nightLabel(last.week, last.day),
        href: route(last.grade, last.week, last.day), title: title(last.grade, last.week, last.day),
        next: next && { label: "Next: " + nightLabel(next.week, next.day), href: next.href, title: title(next.grade, next.week, next.day) } });
    }
    const grade = state && gradeAt(index, state.grade) ? state.grade : (index && index.grades && index.grades[0] || {}).grade;
    // Today's date reading; a level without a calendar offers the start of
    // its school year instead, unless the card already has a place.
    if (validGrade(grade) && calendarHas(index, grade, today)) entries.push({ kind: "date", grade, label: "Today’s reading: " + gradeLabel(grade), href: dateRoute(grade, today) });
    else if (validGrade(grade) && !entries.length) entries.push({ kind: "start", grade, label: "Start the " + gradeLabel(grade) + " school year: " + nightLabel(1, 1), href: route(grade, 1, 1) });
    return entries;
  }
  // The multi-level print: what each chosen level prints for a range of
  // dates (one date is a range of one) or a school night, and the footer that
  // names each reading. A level without a date calendar cannot print a date;
  // it says so instead of printing nothing. `formatDate` names a date in the
  // footer; footers follow the packets' "Grade 5 · Week 3 · Day 2".
  // Printed footers. A school night's matches reading-tex's schoolMeta
  // ("Grade 5 · Week 3 · Day 2"); a calendar reading has no week or day, so
  // it names its date ("Grade 5 · Tuesday 17 November 2026"), and a reading
  // opened by id names itself a calendar reading.
  const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function longDate(date) {
    if (!validDate(date)) return null;
    const [year, month, day] = date.split("-").map(Number), at = new Date(0);
    at.setUTCFullYear(year, month - 1, day);
    const weekday = at.getUTCDay();
    return WEEKDAY_NAMES[weekday] + " " + day + " " + MONTH_NAMES[month - 1] + " " + year;
  }
  function printMeta(grade, { date = null, week = null, day = null } = {}) {
    if (!validGrade(grade)) return null;
    if (validDate(date)) return gradeLabel(grade) + " · " + longDate(date);
    if (validDay(week, day)) return gradeLabel(grade) + " · Week " + week + " · Day " + day;
    return gradeLabel(grade) + " · Calendar reading";
  }
  // Each level's `nights` are in date order: [{ date, footer }] for dates,
  // [{ week, day, footer }] for a school night.
  function printPlan(index, { date = null, until = null, week = null, day = null, grades = [], formatDate = null } = {}) {
    const dates = validDate(date) ? printDates(date, until || date) : [], problem = validDate(date) ? printRangeProblem(date, until) : null;
    return grades.filter(grade => gradeAt(index, grade)).map(grade => {
      const level = { grade, label: gradeLabel(grade) };
      if (validDate(date)) {
        if (!hasCalendar(index, grade)) return { ...level, available: false, reason: "The date calendar for " + gradeLabel(grade) + " is not available yet." };
        if (problem) return { ...level, available: false, reason: problem };
        return { ...level, available: true, nights: dates.map(when => ({ date: when, footer: formatDate ? gradeLabel(grade) + " · " + formatDate(when) : printMeta(grade, { date: when }) })) };
      }
      return validDay(week, day)
        ? { ...level, available: true, nights: [{ week, day, footer: printMeta(grade, { week, day }) }] }
        : { ...level, available: false, reason: "Choose a date or a school night." };
    });
  }
  // A print takes at most a month of dates.
  const MAX_PRINT_DAYS = 31;
  function nextDate(date) {
    const [year, month, day] = date.split("-").map(Number), at = new Date(0);
    at.setUTCFullYear(year, month - 1, day + 1);
    const next = at.getUTCFullYear();
    return next > 9999 ? null : String(next).padStart(4, "0") + "-" + String(at.getUTCMonth() + 1).padStart(2, "0") + "-" + String(at.getUTCDate()).padStart(2, "0");
  }
  // Every date from `date` to `until` (inclusive) in order: [] when either is
  // not a date, `until` comes first, or the range is longer than a print takes.
  function printDates(date, until = date) {
    if (!validDate(date) || !validDate(until || date) || (until || date) < date) return [];
    const dates = [];
    for (let at = date; at && at <= (until || date) && dates.length <= MAX_PRINT_DAYS; at = nextDate(at)) dates.push(at);
    return dates.length > MAX_PRINT_DAYS ? [] : dates;
  }
  // Why a range of dates cannot print, or null when it can.
  function printRangeProblem(date, until = null) {
    if (!validDate(date)) return "Choose a date.";
    if (until !== null && until !== "" && !validDate(until)) return "Choose a last date.";
    if (until && until < date) return "The last date comes before the first; choose a last date on or after it.";
    return printDates(date, until || date).length ? null : "Choose at most " + MAX_PRINT_DAYS + " days.";
  }
  function printFilename({ date = null, until = null, week = null, day = null, grades = [] } = {}) {
    const what = validDate(date) && validDate(until) && until !== date ? date + "-to-" + until : validDate(date) ? date : validDay(week, day) ? "w" + week + "d" + day : "day";
    return "liminal-readings-" + what + "-" + grades.filter(validGrade).map(gradeKey).join("-") + ".pdf";
  }
  // Genre families. The corpus records 50-odd free-text genres; browsing
  // groups them into a few families people recognise. Order matters: the
  // first rule that matches wins ("science fiction" is a story, "historical
  // narrative" nonfiction, "prose poetry" poetry).
  const GENRE_FAMILIES = Object.freeze(["Poetry", "Stories", "Myth and legend", "Nonfiction", "Drama", "Other"]);
  const FAMILY_RULES = [
    ["Drama", /\b(?:drama|play|scene|dialogue in verse)\b/],
    ["Poetry", /\b(?:poetry|poems?|verse|ballads?|rhymes?|songs?|sonnets?|lyric)\b/],
    ["Stories", /\b(?:science fiction)\b/],
    ["Myth and legend", /\b(?:myths?|legends?|fables?|folk ?tales?|fairy|epic|sagas?)\b/],
    ["Nonfiction", /\b(?:essays?|memoir|autobiography|biography|nonfiction|non-fiction|informational|documentary|documents?|scientific|science writing|nature (?:prose|writing)|dialogue|devotional|letters?|speech|sermon|introduction|historical|history|journal|diary|report)\b/],
    ["Stories", /\b(?:fiction|stor(?:y|ies)|novel|tales?|narrative|prose|anecdote|fantasy|adventure)\b/],
  ];
  function genreFamily(genre) {
    const value = searchable(genre).replace(/[-_]+/g, " ");
    const rule = FAMILY_RULES.find(([, pattern]) => pattern.test(value));
    return rule ? rule[0] : "Other";
  }
  function genreFamilies(nights) { const used = new Set((nights || []).map(night => genreFamily(night.genre))); return GENRE_FAMILIES.filter(family => used.has(family)); }
  // A week of the year at a glance: its works (in order, without repeats),
  // and its minutes.
  function weekSummary(nights, week) {
    const list = (nights || []).filter(night => night.week === week), works = [];
    for (const night of list) { const name = night.work || night.title; if (!works.includes(name)) works.push(name); }
    return { works, minutes: list.reduce((sum, night) => sum + night.minutes, 0), span: minutesSpan(list) };
  }
  function genreLabel(genre) { return String(genre || "").replace(/-/g, " "); }
  function searchable(value) { return String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’‘]/g, "'").toLowerCase(); }
  // The work is shown only when the night's title does not already name it.
  function workLabel(night) { return night.work && !searchable(night.title).includes(searchable(night.work)) ? night.work : null; }
  // Every query word must appear in the title, author, work or genre.
  function filterNights(nights, { query = "", mode = "", genre = "", family = "" } = {}) {
    const words = searchable(query).split(/\s+/).filter(Boolean);
    return (nights || []).filter(night => {
      if (mode && night.mode !== mode) return false;
      if (genre && night.genre !== genre) return false;
      if (family && genreFamily(night.genre) !== family) return false;
      const haystack = searchable([night.title, night.author, night.work, genreLabel(night.genre), genreFamily(night.genre)].join(" "));
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
    navigation, lessonLinks, modeLabel, minuteRange, safeHttps, sourceLabel, sourceNote, selectionCredit, studentReading, studentPacket,
    MODES, browseFile, browseRoute, browseIndex, view, validDate, validReadingId, dateRoute, monthRoute, readingRoute, printRoute,
    readingFile, calendarFile, SPANS_FILE, hasCalendar, calendarHas, nightLabel, documentTitle, beforeYouRead, continuation,
    STORAGE_KEY, parseRemembered, remember, tonight, dateCommit, printPlan, printMeta, printFilename, printDates, printRangeProblem, MAX_PRINT_DAYS, GENRE_FAMILIES, genreFamily, genreFamilies, weekSummary,
    genreLabel, workLabel, filterNights, runs, genres, modes, minutesSpan, weekFile, weekSlice, tableRows, emphasis };
});
