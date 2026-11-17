/* The date calendar for daily reading: any calendar date opens a level's
   reading, and a level's reading for a date does not repeat for three years.

   Three cycle years of 366 slots each (slot 60 is February 29, used only
   in leap years) hold 1,098 distinct readings per level. Every level shares
   one set of spans, so a story that runs over several days in one level
   starts and ends with the spans of every other level. Pure functions,
   loadable in Node and the browser. docs/daily-reading.md is the contract. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalReadingCalendar = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const EPOCH = 2026, CYCLE = 3, SLOTS = 366, LEAP_SLOT = 60, MAX_SPAN = 21;
  const MONTH_DAYS = Object.freeze([31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
  const MONTHS = Object.freeze(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
  function isLeap(year) { return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0); }
  // Cycle year 1, 2 or 3; 2026 is Year 1.
  function cycleYear(year) { return ((year - EPOCH) % CYCLE + CYCLE) % CYCLE + 1; }
  function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > MONTH_DAYS[month - 1] || (month === 2 && day === 29 && !isLeap(year))) return null;
    return { year, month, day };
  }
  function formatDate({ year, month, day }) { return String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0"); }
  // 1-based slot of a month and day in the 366-slot year.
  function slotOf(month, day) {
    let slot = day;
    for (let m = 1; m < month; m++) slot += MONTH_DAYS[m - 1];
    return slot;
  }
  function monthDayOf(slot) {
    if (!Number.isInteger(slot) || slot < 1 || slot > SLOTS) return null;
    let rest = slot;
    for (let m = 1; m <= 12; m++) { if (rest <= MONTH_DAYS[m - 1]) return { month: m, day: rest }; rest -= MONTH_DAYS[m - 1]; }
    return null;
  }
  // Where a date sits: its cycle year and slot.
  function place(value) {
    const date = typeof value === "string" ? parseDate(value) : value;
    if (!date) return null;
    return { date: formatDate(date), year: date.year, cycle: cycleYear(date.year), slot: slotOf(date.month, date.day) };
  }
  function dateOf(year, slot) {
    const md = monthDayOf(slot);
    if (!md || (slot === LEAP_SLOT && !isLeap(year))) return null;
    return formatDate({ year, ...md });
  }
  function addDays(value, delta) {
    const date = parseDate(value);
    if (!date) return null;
    const time = Date.UTC(date.year, date.month - 1, date.day) + delta * 86400000, next = new Date(time);
    return formatDate({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() });
  }
  function today(now = new Date()) { return formatDate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }); }
  function longDate(value) {
    const date = parseDate(value);
    if (!date) return "";
    const weekday = new Date(Date.UTC(date.year, date.month - 1, date.day)).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    return weekday + ", " + MONTHS[date.month - 1] + " " + date.day + ", " + date.year;
  }
  function shortDate(value) {
    const date = parseDate(value);
    if (!date) return "";
    return new Date(Date.UTC(date.year, date.month - 1, date.day)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }
  // The reading id for a date in one level's calendar ({ years: [[366 ids] x3] }).
  function readingOn(calendar, value) {
    const where = place(value);
    if (!where || !calendar || !Array.isArray(calendar.years)) return null;
    const year = calendar.years[where.cycle - 1];
    return year && year[where.slot - 1] || null;
  }
  // Which cycle years a calendar (or the spans) has written: [bool x 3].
  function writtenYears(calendar) {
    return Array.from({ length: CYCLE }, (_, y) => !!(calendar && Array.isArray(calendar.years) && Array.isArray(calendar.years[y])));
  }
  // Spans as [first slot, last slot] per cycle year from their lengths.
  function spanRanges(lengths) {
    let next = 1;
    return lengths.map(length => { const range = [next, next + length - 1]; next += length; return range; });
  }
  function spanAt(spans, cycle, slot) {
    const ranges = spanRanges((spans && spans.years && spans.years[cycle - 1]) || []);
    return ranges.find(([first, last]) => first <= slot && slot <= last) || null;
  }
  // The dates in a given calendar year whose readings belong to one span:
  // a multi-day story's days, the same for every level.
  function spanDates(spans, value) {
    const where = place(value);
    if (!where) return [];
    const range = spanAt(spans, where.cycle, where.slot);
    if (!range) return [];
    const out = [];
    for (let slot = range[0]; slot <= range[1]; slot++) { const date = dateOf(where.year, slot); if (date) out.push(date); }
    return out;
  }
  // Structural check of the shared spans; tools add the readings' checks.
  // The calendar is written a cycle year at a time: a year not written yet
  // is null, in the spans and in every level's calendar alike.
  function checkSpans(spans) {
    if (!spans || spans.schemaVersion !== 1 || !Array.isArray(spans.years) || spans.years.length !== CYCLE) throw new Error("Calendar spans: expected three cycle years");
    if (spans.years.every(lengths => lengths === null)) throw new Error("Calendar spans: no cycle year is written");
    spans.years.forEach((lengths, y) => {
      if (lengths === null) return;
      const where = "Calendar spans year " + (y + 1);
      if (!Array.isArray(lengths) || !lengths.every(n => Number.isInteger(n) && n >= 1 && n <= MAX_SPAN)) throw new Error(where + ": span lengths must be 1-" + MAX_SPAN);
      if (lengths.reduce((a, b) => a + b, 0) !== SLOTS) throw new Error(where + ": spans must cover 366 slots");
      const leap = spanRanges(lengths).find(([first, last]) => first <= LEAP_SLOT && LEAP_SLOT <= last);
      if (!leap || leap[0] !== LEAP_SLOT || leap[1] !== LEAP_SLOT) throw new Error(where + ": February 29 must be a one-day span");
    });
    return spans;
  }
  // ---- Browsing a level's calendar (build output: entries with an id and
  // continuesFrom/continuesTo flags, docs/daily-reading.md) ----
  // The year this date's reading comes round again: three years on, or for
  // February 29 the next leap year in the same cycle year.
  function returnYear(value) {
    const date = parseDate(value);
    if (!date) return null;
    for (let year = date.year + CYCLE; ; year += CYCLE) if (!(date.month === 2 && date.day === 29) || isLeap(year)) return year;
  }
  function cycleNote(value) {
    const where = place(value), back = returnYear(value);
    return where ? "Year " + where.cycle + " of " + CYCLE + " · this date’s reading returns in " + back : "";
  }
  // A continued run around a date: the part, the length, and the run's first
  // and last dates. Runs sit on consecutive dates inside one span, so walking
  // the neighbouring days finds them. Null for a reading that stands alone.
  function runOn(calendar, value) {
    const entry = readingOn(calendar, value);
    if (!entry || typeof entry !== "object" || !(entry.continuesFrom || entry.continuesTo)) return null;
    let first = value, last = value, part = 1, guard = 0;
    while (guard++ < MAX_SPAN) { const before = readingOn(calendar, addDays(first, -1)); if (!(readingOn(calendar, first).continuesFrom && before && before.continuesTo)) break; first = addDays(first, -1); part++; }
    guard = 0;
    while (guard++ < MAX_SPAN) { const after = readingOn(calendar, addDays(last, 1)); if (!(readingOn(calendar, last).continuesTo && after && after.continuesFrom)) break; last = addDays(last, 1); }
    let of = 1;
    for (let date = first; date !== last; date = addDays(date, 1)) of++;
    return { part, of, first, last };
  }
  // The next date, on or after `from`, when a reading id falls: the
  // calendar repeats every three years, so this searches at most three
  // (twelve for February 29) calendar years.
  function nextDateOf(calendar, id, from) {
    const start = parseDate(from);
    if (!start || !calendar || !Array.isArray(calendar.years)) return null;
    for (let cycle = 0; cycle < calendar.years.length; cycle++) {
      if (!Array.isArray(calendar.years[cycle])) continue;
      const slot = calendar.years[cycle].findIndex(entry => (entry && typeof entry === "object" ? entry.id : entry) === id) + 1;
      if (!slot) continue;
      for (let year = start.year; year < start.year + 4 * CYCLE + 1; year++) {
        if (cycleYear(year) !== cycle + 1) continue;
        const date = dateOf(year, slot);
        if (date && date >= formatDate(start)) return date;
      }
    }
    return null;
  }
  // A month of a level's calendar as weeks of seven cells (Sunday first;
  // null pads the first and last week). Each cell holds its date, the entry,
  // where it sits in a continued run (single, start, middle, end) and
  // whether a shared span starts there, so a multi-day story shows as one bar
  // and every level's fresh starts line up.
  function monthGrid(calendar, spans, month) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(month || ""));
    if (!match) return null;
    const year = Number(match[1]), m = Number(match[2]);
    if (m < 1 || m > 12) return null;
    const days = m === 2 && !isLeap(year) ? 28 : MONTH_DAYS[m - 1], cycle = cycleYear(year);
    const starts = new Set(spanRanges((spans && spans.years && spans.years[cycle - 1]) || []).map(([first]) => first));
    const cells = [];
    for (let d = 1; d <= days; d++) {
      const date = formatDate({ year, month: m, day: d }), entry = readingOn(calendar, date), slot = slotOf(m, d);
      const from = !!(entry && entry.continuesFrom), to = !!(entry && entry.continuesTo);
      cells.push({ date, day: d, entry: entry || null, run: from && to ? "middle" : from ? "end" : to ? "start" : "single", spanStart: starts.has(slot) });
    }
    const lead = new Date(Date.UTC(year, m - 1, 1)).getUTCDay(), padded = [...Array(lead).fill(null), ...cells];
    while (padded.length % 7) padded.push(null);
    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    return { year, month: m, label: MONTHS[m - 1] + " " + year, cycle, weeks };
  }
  function addMonths(month, delta) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(month || ""));
    if (!match) return null;
    const index = Number(match[1]) * 12 + Number(match[2]) - 1 + delta;
    return String(Math.floor(index / 12)).padStart(4, "0") + "-" + String(index % 12 + 1).padStart(2, "0");
  }
  return { EPOCH, CYCLE, SLOTS, LEAP_SLOT, MAX_SPAN, MONTH_DAYS, MONTHS, isLeap, cycleYear, writtenYears, parseDate, formatDate, slotOf, monthDayOf, place, dateOf, addDays, today,
    longDate, shortDate, readingOn, spanRanges, spanAt, spanDates, checkSpans, returnYear, cycleNote, runOn, nextDateOf, monthGrid, addMonths };
});
