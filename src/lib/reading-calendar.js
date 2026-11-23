/* The date calendar for daily reading: any date of any year opens a level's
   reading. Ten holidays keep readings of their own (New Year's Day, Easter,
   Memorial Day, Independence Day, Labor Day, Columbus Day, Halloween,
   Veterans Day, Thanksgiving and Christmas), February 29 has its own reading
   for leap years, and the other 355 days of every year read one sequence in
   order, so the calendar fits any year without being tied to one.

   Fixed-date days (New Year's Day, February 29, July 4, Halloween, Veterans
   Day, Christmas) always fall after the same number of sequence days, so the
   shared spans always break there. A moveable holiday (Easter, Memorial Day,
   Labor Day, Columbus Day, Thanksgiving) falls at a different place each
   year: when it lands inside a continued story, the story pauses for the
   holiday and goes on the next day.

   A level may have several reading sets of 366 readings; years take them in
   turn from 2026. Every level shares one set of spans per set. Pure
   functions, loadable in Node and the browser. docs/daily-reading.md is the
   contract. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalReadingCalendar = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const EPOCH = 2026, REGULAR = 355, SET_SIZE = 366, MAX_SPAN = 21;
  const MONTH_DAYS = Object.freeze([31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
  const MONTHS = Object.freeze(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
  function isLeap(year) { return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0); }
  function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > MONTH_DAYS[month - 1] || (month === 2 && day === 29 && !isLeap(year))) return null;
    return { year, month, day };
  }
  function formatDate({ year, month, day }) { return String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0"); }
  // A Date at UTC midnight of a parsed date. setUTCFullYear, because
  // Date.UTC reads years 0-99 as 1900-1999.
  function utc({ year, month, day }) { const date = new Date(0); date.setUTCFullYear(year, month - 1, day); return date; }
  // Dates run from 0001-01-01 to 9999-12-31; a step past either end is null.
  function addDays(value, delta) {
    const date = parseDate(value);
    if (!date) return null;
    const next = new Date(utc(date).getTime() + delta * 86400000), year = next.getUTCFullYear();
    return year < 1 || year > 9999 ? null : formatDate({ year, month: next.getUTCMonth() + 1, day: next.getUTCDate() });
  }
  function today(now = new Date()) { return formatDate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }); }
  function longDate(value) {
    const date = parseDate(value);
    if (!date) return "";
    const weekday = utc(date).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    return weekday + ", " + MONTHS[date.month - 1] + " " + date.day + ", " + date.year;
  }
  function shortDate(value) {
    const date = parseDate(value);
    if (!date) return "";
    return utc(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }
  // 0-based day of the year, and back.
  function dayIndex({ year, month, day }) {
    let index = day - 1;
    for (let m = 1; m < month; m++) index += m === 2 && !isLeap(year) ? 28 : MONTH_DAYS[m - 1];
    return index;
  }
  function dateOfIndex(year, index) {
    let rest = index;
    for (let month = 1; month <= 12; month++) {
      const days = month === 2 && !isLeap(year) ? 28 : MONTH_DAYS[month - 1];
      if (rest < days) return formatDate({ year, month, day: rest + 1 });
      rest -= days;
    }
    return null;
  }

  // ---- Holidays ----
  function weekdayOf(year, month, day) { return utc({ year, month, day }).getUTCDay(); } // 0 is Sunday
  function nthWeekday(year, month, weekday, n) { return 1 + (weekday - weekdayOf(year, month, 1) + 7) % 7 + 7 * (n - 1); }
  function lastWeekday(year, month, weekday) { const days = MONTH_DAYS[month - 1]; return days - (weekdayOf(year, month, days) - weekday + 7) % 7; }
  // Western Easter for a Gregorian year (the anonymous computus of Meeus,
  // Jones and Butcher): [month, day].
  function easter(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = h + l - 7 * m + 114;
    return [Math.floor(n / 31), n % 31 + 1];
  }
  // In date order. `fixed` holidays fall on the same date every year.
  const HOLIDAYS = Object.freeze([
    { key: "new-year", name: "New Year’s Day", fixed: true, rule: () => [1, 1] },
    { key: "easter", name: "Easter", fixed: false, rule: easter },
    { key: "memorial-day", name: "Memorial Day", fixed: false, rule: year => [5, lastWeekday(year, 5, 1)] },
    { key: "independence-day", name: "Independence Day", fixed: true, rule: () => [7, 4] },
    { key: "labor-day", name: "Labor Day", fixed: false, rule: year => [9, nthWeekday(year, 9, 1, 1)] },
    { key: "columbus-day", name: "Columbus Day", fixed: false, rule: year => [10, nthWeekday(year, 10, 1, 2)] },
    { key: "halloween", name: "Halloween", fixed: true, rule: () => [10, 31] },
    { key: "veterans-day", name: "Veterans Day", fixed: true, rule: () => [11, 11] },
    { key: "thanksgiving", name: "Thanksgiving", fixed: false, rule: year => [11, nthWeekday(year, 11, 4, 4)] },
    { key: "christmas", name: "Christmas", fixed: true, rule: () => [12, 25] },
  ].map(item => Object.freeze(item)));
  const HOLIDAY_KEYS = Object.freeze(HOLIDAYS.map(item => item.key));
  function holidayName(key) { const item = HOLIDAYS.find(entry => entry.key === key); return item ? item.name : ""; }
  // A year's holidays in date order: { key, name, date }.
  function holidays(year) {
    if (!Number.isInteger(year) || year < 1 || year > 9999) return [];
    return HOLIDAYS.map(({ key, name, rule }) => { const [month, day] = rule(year); return { key, name, date: formatDate({ year, month, day }) }; });
  }
  function holidayOn(value) {
    const date = parseDate(value);
    if (!date) return null;
    const here = formatDate(date);
    return holidays(date.year).find(item => item.date === here) || null;
  }
  // The days outside the sequence in a year (its holidays and any
  // February 29), as sorted day indexes.
  function setAside(year) {
    const out = holidays(year).map(item => dayIndex(parseDate(item.date)));
    if (isLeap(year)) out.push(59);
    return out.sort((a, b) => a - b);
  }

  // ---- Where a date sits ----
  // Its year's set (0-based, of `count` sets) and what it reads: a holiday's
  // own reading, February 29's, or the sequence day `position` (0-354).
  // `before` counts the sequence days before it in its year.
  function setOf(year, count = 1) { return count >= 1 ? ((year - EPOCH) % count + count) % count : 0; }
  function place(value, count = 1) {
    const date = parseDate(value);
    if (!date) return null;
    const index = dayIndex(date), aside = setAside(date.year), before = index - aside.filter(n => n < index).length;
    const base = { date: formatDate(date), year: date.year, set: setOf(date.year, count), before };
    const holiday = holidays(date.year).find(item => item.date === base.date);
    if (holiday) return { ...base, kind: "holiday", key: holiday.key, name: holiday.name };
    if (date.month === 2 && date.day === 29) return { ...base, kind: "leap" };
    return { ...base, kind: "sequence", position: before };
  }
  // The date of a sequence day in a year.
  function dateAt(year, position) {
    if (!Number.isInteger(year) || year < 1 || year > 9999 || !Number.isInteger(position) || position < 0 || position >= REGULAR) return null;
    let index = position;
    for (const n of setAside(year)) if (n <= index) index++;
    return dateOfIndex(year, index);
  }
  // Fixed-date days fall after the same number of sequence days every year,
  // so the shared spans always break there.
  const BREAKS = Object.freeze([...new Set([...HOLIDAYS.filter(item => item.fixed).map(item => place(holidays(2000).find(entry => entry.key === item.key).date).before),
    place("2000-02-29").before])].sort((a, b) => a - b));

  // ---- A level's calendar ----
  // { sets: [{ sequence: [355], anchors: { <holiday key>: … }, leap }] },
  // ids in the source files and entries ({ id, title, continuesFrom,
  // continuesTo, … }) in the built ones.
  function setFor(calendar, year) {
    const sets = calendar && Array.isArray(calendar.sets) ? calendar.sets : [];
    return sets.length ? sets[setOf(year, sets.length)] || null : null;
  }
  function setCount(calendar) { return calendar && Array.isArray(calendar.sets) ? calendar.sets.length : 0; }
  function readingOn(calendar, value) {
    const where = place(value), set = where && setFor(calendar, where.year);
    if (!set) return null;
    const entry = where.kind === "holiday" ? set.anchors && set.anchors[where.key] : where.kind === "leap" ? set.leap : Array.isArray(set.sequence) ? set.sequence[where.position] : null;
    return entry || null;
  }
  const idOf = entry => entry && typeof entry === "object" ? entry.id : entry;

  // ---- Spans: { schemaVersion: 2, sets: [[lengths]] }, shared by every level ----
  // [first, last] sequence positions per span.
  function spanRanges(lengths) {
    let next = 0;
    return (lengths || []).map(length => { const range = [next, next + length - 1]; next += length; return range; });
  }
  function spanAt(spans, set, position) {
    const lengths = spans && Array.isArray(spans.sets) ? spans.sets[set] : null;
    return spanRanges(lengths).find(([first, last]) => first <= position && position <= last) || null;
  }
  // The dates in a date's year whose readings belong to its span (a holiday
  // or February 29 is a span of its own).
  function spanDates(spans, value) {
    const where = place(value, spans && Array.isArray(spans.sets) ? spans.sets.length : 1);
    if (!where) return [];
    if (where.kind !== "sequence") return [where.date];
    const range = spanAt(spans, where.set, where.position);
    if (!range) return [];
    const out = [];
    for (let position = range[0]; position <= range[1]; position++) out.push(dateAt(where.year, position));
    return out;
  }
  // Structural check of the shared spans; tools add the readings' checks.
  function checkSpans(spans) {
    if (!spans || spans.schemaVersion !== 2 || !Array.isArray(spans.sets) || !spans.sets.length) throw new Error("Calendar spans: expected schema version 2 with at least one reading set");
    spans.sets.forEach((lengths, s) => {
      const where = "Calendar spans set " + (s + 1);
      if (!Array.isArray(lengths) || !lengths.every(n => Number.isInteger(n) && n >= 1 && n <= MAX_SPAN)) throw new Error(where + ": span lengths must be 1-" + MAX_SPAN);
      if (lengths.reduce((a, b) => a + b, 0) !== REGULAR) throw new Error(where + ": spans must cover the " + REGULAR + " sequence days");
      const starts = new Set(spanRanges(lengths).map(([first]) => first));
      for (const position of BREAKS) if (!starts.has(position)) throw new Error(where + ": a span must start after sequence day " + position + " (a fixed-date holiday or February 29 falls there)");
    });
    return spans;
  }

  // ---- Browsing a level's calendar (built entries) ----
  // A continued run around a date: the part, the length, the run's first and
  // last dates, and the dates of the parts either side (null at its ends).
  // A run stays inside one span of the sequence; a moveable holiday inside
  // it pauses it for a day. Null for a reading that stands alone.
  function runOn(calendar, value) {
    const where = place(value), set = where && setFor(calendar, where.year);
    if (!set || where.kind !== "sequence" || !Array.isArray(set.sequence)) return null;
    const list = set.sequence, at = list[where.position];
    if (!at || typeof at !== "object" || !(at.continuesFrom || at.continuesTo)) return null;
    let first = where.position, last = where.position;
    while (first > 0 && list[first].continuesFrom && list[first - 1] && list[first - 1].continuesTo) first--;
    while (last < list.length - 1 && list[last].continuesTo && list[last + 1] && list[last + 1].continuesFrom) last++;
    const part = where.position - first + 1, of = last - first + 1;
    return { part, of, first: dateAt(where.year, first), last: dateAt(where.year, last),
      previous: part > 1 ? dateAt(where.year, where.position - 1) : null, next: part < of ? dateAt(where.year, where.position + 1) : null };
  }
  // The next date, on or after `from`, when a reading id falls.
  function nextDateOf(calendar, id, from) {
    const start = parseDate(from), count = setCount(calendar);
    if (!start || !count) return null;
    const begin = formatDate(start);
    for (let s = 0; s < count; s++) {
      const set = calendar.sets[s];
      if (!set) continue;
      const position = Array.isArray(set.sequence) ? set.sequence.findIndex(entry => idOf(entry) === id) : -1;
      const key = set.anchors ? HOLIDAY_KEYS.find(k => idOf(set.anchors[k]) === id) : null, leap = idOf(set.leap) === id;
      if (position < 0 && !key && !leap) continue;
      // February 29 can be eight years away, and a set comes round every `count` years.
      for (let year = start.year; year <= Math.min(9999, start.year + 8 * count + 8); year++) {
        if (setOf(year, count) !== s) continue;
        const date = position >= 0 ? dateAt(year, position) : key ? holidays(year).find(item => item.key === key).date : isLeap(year) ? formatDate({ year, month: 2, day: 29 }) : null;
        if (date && date >= begin) return date;
      }
    }
    return null;
  }
  // When a date's reading comes round again, as a phrase for the date view:
  // "Christmas · this reading returns on Saturday, December 25, 2027".
  function dayNote(calendar, value) {
    const where = place(value, setCount(calendar) || 1), entry = readingOn(calendar, value);
    if (!where || !entry) return "";
    const next = nextDateOf(calendar, idOf(entry), addDays(where.date, 1));
    return [where.kind === "holiday" ? where.name : where.kind === "leap" ? "February 29" : null,
      next ? "this reading returns on " + longDate(next) : null].filter(Boolean).join(" · ");
  }
  // The note under a month's heading.
  function monthNote(month, calendar) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(month || "")), count = setCount(calendar);
    if (!match || !count) return "";
    const year = Number(match[1]), names = holidays(year).filter(item => Number(item.date.slice(5, 7)) === Number(match[2])).map(item => item.name);
    const round = count === 1 ? "Each day’s reading comes round again next year, on or near the same date"
      : "Reading set " + (setOf(year, count) + 1) + " of " + count + ". Each day’s reading comes round again " + count + " years later, on or near the same date";
    return round + "; holidays keep readings of their own" + (names.length ? " (" + names.join(", ") + " this month)" : "") + ".";
  }
  // A month of a level's calendar as weeks of seven cells (Sunday first;
  // null pads the first and last week). Each cell holds its date, the entry,
  // where it sits in a continued run (single, start, middle, end), whether a
  // shared span starts there (every level begins something new), and the
  // holiday on that date, if any.
  function monthGrid(calendar, spans, month) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(month || ""));
    if (!match) return null;
    const year = Number(match[1]), m = Number(match[2]);
    if (year < 1 || m < 1 || m > 12) return null;
    const count = setCount(calendar) || 1, set = setOf(year, count), days = m === 2 && !isLeap(year) ? 28 : MONTH_DAYS[m - 1];
    const starts = new Set(spanRanges(spans && Array.isArray(spans.sets) ? spans.sets[set] : []).map(([first]) => first));
    const cells = [];
    for (let d = 1; d <= days; d++) {
      const date = formatDate({ year, month: m, day: d }), where = place(date, count), entry = readingOn(calendar, date);
      const from = !!(entry && entry.continuesFrom), to = !!(entry && entry.continuesTo);
      cells.push({ date, day: d, entry: entry || null, run: from && to ? "middle" : from ? "end" : to ? "start" : "single",
        spanStart: where.kind === "sequence" && starts.has(where.position), holiday: where.kind === "holiday" ? { key: where.key, name: where.name } : null, leap: where.kind === "leap" });
    }
    const lead = utc({ year, month: m, day: 1 }).getUTCDay(), padded = [...Array(lead).fill(null), ...cells];
    while (padded.length % 7) padded.push(null);
    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    return { year, month: m, label: MONTHS[m - 1] + " " + year, set: set + 1, sets: count, weeks };
  }
  // "January 2027" for "2027-01".
  function monthLabel(month) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(month || ""));
    return match && Number(match[2]) >= 1 && Number(match[2]) <= 12 ? MONTHS[Number(match[2]) - 1] + " " + Number(match[1]) : "";
  }
  function addMonths(month, delta) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(month || ""));
    if (!match) return null;
    const index = Number(match[1]) * 12 + Number(match[2]) - 1 + delta;
    if (index < 12 || index >= 10000 * 12) return null;
    return String(Math.floor(index / 12)).padStart(4, "0") + "-" + String(index % 12 + 1).padStart(2, "0");
  }
  return { EPOCH, REGULAR, SET_SIZE, MAX_SPAN, MONTH_DAYS, MONTHS, HOLIDAYS, HOLIDAY_KEYS, BREAKS, isLeap, parseDate, formatDate, addDays, today, longDate, shortDate,
    easter, holidays, holidayOn, holidayName, setOf, place, dateAt, setFor, setCount, readingOn, spanRanges, spanAt, spanDates, checkSpans,
    runOn, nextDateOf, dayNote, monthNote, monthGrid, monthLabel, addMonths };
});
