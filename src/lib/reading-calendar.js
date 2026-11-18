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
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > MONTH_DAYS[month - 1] || (month === 2 && day === 29 && !isLeap(year))) return null;
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
  // The reading id for a date in one level's calendar ({ years: [[366 ids] x3] }).
  function readingOn(calendar, value) {
    const where = place(value);
    if (!where || !calendar || !Array.isArray(calendar.years)) return null;
    const year = calendar.years[where.cycle - 1];
    return year && year[where.slot - 1] || null;
  }
  // Which cycle years are written: [bool x 3], from a level's calendar or the
  // spans ({ years }, a year not written being null) or from the index's
  // calendarYears ([bool x 3]).
  function writtenYears(source) {
    const years = Array.isArray(source) ? source : source && Array.isArray(source.years) ? source.years : [];
    return Array.from({ length: CYCLE }, (_, y) => years[y] === true || Array.isArray(years[y]));
  }
  // Whether the date calendar has readings for a date (or a year): whether
  // its cycle year is written.
  function isWritten(written, value) {
    const year = typeof value === "number" ? value : (parseDate(value) || {}).year;
    return Number.isInteger(year) && year >= 1 && year <= 9999 && writtenYears(written)[cycleYear(year) - 1];
  }
  // The dates with readings nearest a date. A written date is its own; for
  // one in a year not written yet, the last day of the closest written year
  // before it and the first day of the closest after it (null past 0001 or
  // 9999), and the nearer of the two (the later on a tie). Null when the
  // date is invalid or nothing is written.
  function nearestWritten(written, value) {
    const date = parseDate(value), years = writtenYears(written);
    if (!date || !years.some(Boolean)) return null;
    const here = formatDate(date), on = year => years[cycleYear(year) - 1];
    if (on(date.year)) return { before: here, after: here, nearest: here };
    let before = null, after = null;
    for (let year = date.year - 1; !before && year >= Math.max(1, date.year - CYCLE); year--) if (on(year)) before = formatDate({ year, month: 12, day: 31 });
    for (let year = date.year + 1; !after && year <= Math.min(9999, date.year + CYCLE); year++) if (on(year)) after = formatDate({ year, month: 1, day: 1 });
    const gap = (from, to) => Math.round((utc(parseDate(to)) - utc(parseDate(from))) / 86400000);
    const nearest = !before ? after : !after ? before : gap(before, here) < gap(here, after) ? before : after;
    return nearest ? { before, after, nearest } : null;
  }
  // The first date with readings from 2026, the calendar's first year, on.
  function firstWritten(written) {
    const years = writtenYears(written);
    for (let year = EPOCH; year < EPOCH + CYCLE; year++) if (years[cycleYear(year) - 1]) return formatDate({ year, month: 1, day: 1 });
    return null;
  }
  // What to say for a date whose cycle year is not written yet, and where to
  // go instead (docs/daily-reading.md, "Date"). Before the first written
  // year from 2026 on, the calendar begins there; otherwise the nearest date
  // with a reading is named, and the next one too when the nearest is
  // earlier. `dates` are those dates in order, the first the one to offer
  // first. Null for a written or invalid date, or when nothing is written.
  function unwritten(written, value) {
    const date = parseDate(value), near = nearestWritten(written, value);
    if (!date || !near || near.nearest === formatDate(date)) return null;
    const start = firstWritten(written), begins = start && date.year >= EPOCH && formatDate(date) < start ? start : null;
    const dates = begins ? [begins] : near.nearest === near.before && near.after ? [near.before, near.after] : [near.nearest];
    const where = begins ? "It begins on " + longDate(begins) + "."
      : dates.length > 1 ? "The nearest date with a reading is " + longDate(dates[0]) + ", and the next is " + longDate(dates[1]) + "."
      : (near.nearest === near.after ? "The next date with a reading is " : "The nearest date with a reading is ") + longDate(near.nearest) + ".";
    return { year: date.year, heading: "Readings for dates in " + date.year + " are not written yet",
      text: "The date calendar is being written one year at a time. " + where, dates, begins };
  }
  // Where the date calendar opens on `today`: today when its year is
  // written, otherwise where the calendar begins or the nearest date with a
  // reading. Null when nothing is written.
  function opening(written, today) {
    if (isWritten(written, today)) return formatDate(parseDate(today));
    const note = unwritten(written, today);
    return note ? note.dates[0] : null;
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
  // A date's place in the cycle. Given the written years, it promises a
  // return only for a written date (whose return year, the same cycle year,
  // is written too).
  function cycleNote(value, written) {
    const where = place(value);
    if (!where) return "";
    if (written !== undefined && !isWritten(written, value)) return "Year " + where.cycle + " of " + CYCLE + " · not written yet";
    return "Year " + where.cycle + " of " + CYCLE + " · this date’s reading returns in " + returnYear(value);
  }
  // The note under a month's heading; empty for a month not written yet,
  // whose page says so instead.
  function monthNote(month, written) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(month || ""));
    if (!match || !isWritten(written, Number(match[1]))) return "";
    return "Cycle year " + cycleYear(Number(match[1])) + " of " + CYCLE + ". Each date’s reading returns three years later.";
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
    const lead = utc({ year, month: m, day: 1 }).getUTCDay(), padded = [...Array(lead).fill(null), ...cells];
    while (padded.length % 7) padded.push(null);
    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    return { year, month: m, label: MONTHS[m - 1] + " " + year, cycle, weeks };
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
  return { EPOCH, CYCLE, SLOTS, LEAP_SLOT, MAX_SPAN, MONTH_DAYS, MONTHS, isLeap, cycleYear, writtenYears, isWritten, nearestWritten, firstWritten, unwritten, opening,
    parseDate, formatDate, slotOf, monthDayOf, place, dateOf, addDays, today,
    longDate, shortDate, readingOn, spanRanges, spanAt, spanDates, checkSpans, returnYear, cycleNote, monthNote, runOn, nextDateOf, monthGrid, monthLabel, addMonths };
});
