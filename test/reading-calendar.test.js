"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const C = require("../src/lib/reading-calendar");
const { layout, merge } = require("../tools/layout-reading-calendar");
const B = require("../tools/build-daily-reading");

test("cycle years repeat every three calendar years from 2026", () => {
  assert.deepEqual([2026, 2027, 2028, 2029, 2025, 2020].map(C.cycleYear), [1, 2, 3, 1, 3, 1]);
});
test("dates map to 366 slots; February 29 is slot 60 and only exists in leap years", () => {
  assert.deepEqual(C.place("2026-01-01"), { date: "2026-01-01", year: 2026, cycle: 1, slot: 1 });
  assert.equal(C.place("2026-03-01").slot, 61); assert.equal(C.place("2028-02-29").slot, 60);
  assert.equal(C.place("2026-12-31").slot, 366); assert.equal(C.place("2027-02-29"), null);
  assert.equal(C.dateOf(2026, 60), null); assert.equal(C.dateOf(2028, 60), "2028-02-29"); assert.equal(C.dateOf(2026, 61), "2026-03-01");
  assert.equal(C.addDays("2026-12-31", 1), "2027-01-01"); assert.equal(C.addDays("2028-03-01", -1), "2028-02-29");
});
test("a level's reading for a date does not recur until the same date three years later", () => {
  const ids = y => Array.from({ length: 366 }, (_, i) => "y" + y + "-" + (i + 1));
  const calendar = { years: [ids(1), ids(2), ids(3)] }, seen = new Map();
  for (let year = 2026; year < 2029; year++) for (let slot = 1; slot <= 366; slot++) {
    const date = C.dateOf(year, slot); if (!date) continue;
    const id = C.readingOn(calendar, date); assert.ok(!seen.has(id), "repeated " + id); seen.set(id, date);
  }
  assert.equal(C.readingOn(calendar, "2029-11-17"), C.readingOn(calendar, "2026-11-17"));
  assert.notEqual(C.readingOn(calendar, "2027-11-17"), C.readingOn(calendar, "2026-11-17"));
});
test("spans cover each year, cap at the maximum and isolate February 29", () => {
  const year = [59, 1, ...Array(15).fill(20), 6];
  assert.equal(year.reduce((a, b) => a + b), 366);
  assert.throws(() => C.checkSpans({ schemaVersion: 1, years: [year, year, year] }), /1-21/);
  const ok = [...Array(2).fill(21), 17, 1, ...Array(14).fill(21), 12];
  assert.equal(ok.reduce((a, b) => a + b), 366);
  assert.equal(C.checkSpans({ schemaVersion: 1, years: [ok, ok, ok] }).years.length, 3);
  const shifted = [...Array(2).fill(21), 18, ...Array(14).fill(21), 12];
  assert.equal(shifted.reduce((a, b) => a + b), 366);
  assert.throws(() => C.checkSpans({ schemaVersion: 1, years: [shifted, ok, ok] }), /February 29/);
  assert.deepEqual(C.spanDates({ years: [ok, ok, ok] }, "2026-02-28"), ["2026-02-12", "2026-02-13", "2026-02-14", "2026-02-15", "2026-02-16", "2026-02-17", "2026-02-18",
    "2026-02-19", "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23", "2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28"]);
});

// Synthetic levels: runs of several lengths, single readings, a seasonal one.
function level(grade, shape, total = 1098) {
  const readings = new Map(); let n = 0;
  const run = (length, work, months) => {
    let previous = null;
    for (let i = 0; i < length; i++) {
      const id = "r" + grade + "-" + n++, reading = { id, sourceId: work, excerpt: { blocks: [n, n], continuesFrom: previous, continuesTo: null }, ...(months ? { months } : {}) };
      if (previous) readings.get(previous).excerpt.continuesTo = id;
      readings.set(id, reading); previous = id;
    }
  };
  shape(run);
  let w = 0;
  while (n < total) run(1, "poems-" + grade + "-" + (w++ % 7));
  return { grade, readings };
}
test("the layout lines up continuous runs across levels inside shared spans", () => {
  const levels = [
    level(0, run => { for (let i = 0; i < 20; i++) run(7, "story-a"); run(1, "carol", [12]); }),
    level(1, run => { for (let i = 0; i < 30; i++) { run(4, "story-b"); run(3, "story-c"); } }),
    level(2, run => { for (let i = 0; i < 10; i++) run(20, "school-long"); for (let i = 0; i < 40; i++) run(5, "story-d"); }),
  ];
  const { spans, calendars } = layout(levels);
  C.checkSpans(spans);
  for (const calendar of calendars) {
    const { readings } = levels.find(item => item.grade === calendar.grade);
    assert.equal(new Set(calendar.years.flat()).size, 1098);
    const courses = [], placed = new Map([[calendar.grade, readings]]);
    B.validateCalendar(spans, [{ key: String(calendar.grade || "k"), data: calendar }], new Map([[calendar.grade, readings]]));
    void courses; void placed;
  }
  // Each work's runs keep reading order across the whole calendar.
  for (const calendar of calendars) {
    const { readings } = levels.find(item => item.grade === calendar.grade), seen = new Map();
    for (const id of calendar.years.flat()) {
      const reading = readings.get(id), position = reading.excerpt.blocks[0];
      assert.ok(!(seen.get(reading.sourceId) > position), "runs of " + reading.sourceId + " out of order");
      seen.set(reading.sourceId, position);
    }
  }
  // The seasonal reading lands in December.
  const k = calendars.find(calendar => calendar.grade === 0), carol = [...levels[0].readings.values()].find(reading => reading.months);
  const year = k.years.findIndex(ids => ids.includes(carol.id)), slot = k.years[year].indexOf(carol.id) + 1;
  assert.equal(C.monthDayOf(slot).month, 12);
});
test("calendar validation refuses a run broken across a span boundary", () => {
  const levels = [level(0, run => { for (let i = 0; i < 10; i++) run(6, "story"); })];
  const { spans, calendars } = layout(levels), calendar = calendars[0];
  const year = calendar.years[0], i = year.findIndex(id => levels[0].readings.get(id).excerpt.continuesTo);
  [year[i], year[i + 1]] = [year[i + 1], year[i]];
  assert.throws(() => B.validateCalendar(spans, [{ key: "k", data: calendar }], new Map([[0, levels[0].readings]])), /continuous run/);
});
test("the calendar is written a cycle year at a time and keeps written years", () => {
  const shapes = [run => { for (let i = 0; i < 20; i++) run(7, "story-a"); }, run => { for (let i = 0; i < 60; i++) { run(4, "story-b"); run(3, "story-c"); } }];
  const full = shapes.map((shape, grade) => level(grade, shape));
  // Year 2 first, from whole runs of a level's stories plus single poems:
  // more readings than one year needs, but not all of them.
  const subset = (readings, stories, poems) => {
    const list = [...readings], story = list.filter(([, r]) => r.sourceId.startsWith("story")), poem = list.filter(([, r]) => r.sourceId.startsWith("poems"));
    return new Map([...story.slice(0, stories), ...poem.slice(0, poems)]);
  };
  const first = [{ grade: 0, readings: subset(full[0].readings, 140, 260) }, { grade: 1, readings: subset(full[1].readings, 280, 200) }];
  const year2 = layout(first, { years: [2] });
  assert.deepEqual(year2.spans.years.map(Boolean), [false, true, false]);
  for (const calendar of year2.calendars) {
    assert.deepEqual(calendar.years.map(Boolean), [false, true, false]);
    B.validateCalendar(year2.spans, [{ key: String(calendar.grade || "k"), data: calendar }], new Map([[calendar.grade, full[calendar.grade].readings]]));
  }
  // A level's calendar must match the spans' written years.
  const wrong = { ...year2.calendars[0], years: [year2.calendars[0].years[1], null, null] };
  assert.throws(() => B.validateCalendar(year2.spans, [{ key: "k", data: wrong }], new Map([[0, full[0].readings]])), /null when they do not/);
  // Then the remaining years from everything not yet placed, exhausting it.
  const rest = full.map(({ grade, readings }) => {
    const placed = new Set(year2.calendars[grade].years.filter(Boolean).flat());
    return { grade, readings: new Map([...readings].filter(([id]) => !placed.has(id))), begun: new Set(["story-a", "story-b", "story-c"]) };
  });
  const later = layout(rest, { years: [3, 1], exhaust: true });
  const done = merge({ spans: year2.spans, calendars: new Map(year2.calendars.map(calendar => [calendar.grade, calendar])) }, later);
  C.checkSpans(done.spans);
  for (const calendar of done.calendars) {
    assert.deepEqual(calendar.years[1], year2.calendars[calendar.grade].years[1]);
    assert.equal(new Set(calendar.years.flat()).size, 1098);
    B.validateCalendar(done.spans, [{ key: String(calendar.grade || "k"), data: calendar }], new Map([[calendar.grade, full[calendar.grade].readings]]));
  }
  // A story begun in year 2 and not finished continues first in year 3.
  const k = done.calendars[0], b = done.calendars[1];
  const unfinished = [...rest[1].readings.values()].some(reading => ["story-b", "story-c"].includes(reading.sourceId));
  assert.ok(unfinished, "fixture: grade 1's stories run past year 2");
  assert.ok(["story-b", "story-c"].includes(full[1].readings.get(b.years[2][0]).sourceId));
  assert.equal(C.nextDateOf({ years: [null, k.years[1], null] }, k.years[1][0], "2026-11-17"), "2027-01-01");
  assert.deepEqual(C.writtenYears({ years: [null, [], null] }), [false, true, false]);
});

// The calendar as it first goes live: only Year 2 (2027, 2030, ...) written,
// with a three-day run at each end of the year.
function year2Only() {
  const year = Array.from({ length: C.SLOTS }, (_, i) => ({ id: "r2-" + (i + 1), continuesFrom: false, continuesTo: false }));
  for (const [first, last] of [[1, 3], [364, 366]]) for (let slot = first; slot <= last; slot++) Object.assign(year[slot - 1], { continuesFrom: slot > first, continuesTo: slot < last });
  return { schemaVersion: 1, grade: 5, years: [null, year, null] };
}
test("a year not written yet is named, never promised, and points to the nearest date with readings", () => {
  const calendar = year2Only(), written = C.writtenYears(calendar);
  assert.deepEqual(written, [false, true, false]); assert.deepEqual(C.writtenYears([false, true, false]), written); assert.deepEqual(C.writtenYears(null), [false, false, false]);
  assert.equal(C.isWritten(written, "2026-11-18"), false); assert.equal(C.isWritten(calendar, "2027-12-31"), true);
  assert.equal(C.isWritten(written, 2030), true); assert.equal(C.isWritten(written, "2027-02-30"), false);
  // Today, 18 November 2026, is in Year 1: the calendar begins on 1 January 2027.
  assert.deepEqual(C.nearestWritten(written, "2026-11-18"), { before: "2024-12-31", after: "2027-01-01", nearest: "2027-01-01" });
  assert.deepEqual(C.unwritten(written, "2026-11-18"), { year: 2026, heading: "Readings for dates in 2026 are not written yet",
    text: "The date calendar is being written one year at a time. It begins on Friday, January 1, 2027.", dates: ["2027-01-01"], begins: "2027-01-01" });
  // Early 2028 is nearer the end of 2027; the next written date is named too.
  assert.deepEqual(C.unwritten(written, "2028-02-01").dates, ["2027-12-31", "2030-01-01"]);
  assert.match(C.unwritten(written, "2028-02-01").text, /nearest date with a reading is Friday, December 31, 2027, and the next is Tuesday, January 1, 2030\.$/);
  assert.match(C.unwritten(written, "2029-11-18").text, /next date with a reading is Tuesday, January 1, 2030\.$/);
  assert.equal(C.unwritten(written, "2027-06-01"), null); assert.equal(C.unwritten([false, false, false], "2026-06-01"), null);
  assert.equal(C.nearestWritten(written, "2027-06-01").nearest, "2027-06-01"); assert.equal(C.nearestWritten(written, "9999-12-31").after, null);
  assert.equal(C.firstWritten(written), "2027-01-01"); assert.equal(C.firstWritten([false, false, true]), "2028-01-01");
  assert.equal(C.opening(written, "2026-11-18"), "2027-01-01"); assert.equal(C.opening(written, "2027-03-04"), "2027-03-04"); assert.equal(C.opening([false, false, false], "2026-11-18"), null);
  // The cycle note promises a return only for a written date.
  assert.equal(C.cycleNote("2027-03-04", written), "Year 2 of 3 · this date’s reading returns in 2030");
  assert.equal(C.cycleNote("2026-11-18", written), "Year 1 of 3 · not written yet");
  assert.equal(C.monthNote("2027-03", written), "Cycle year 2 of 3. Each date’s reading returns three years later.");
  assert.equal(C.monthNote("2028-03", written), ""); assert.equal(C.monthNote("2028-13", written), "");
  assert.equal(C.monthLabel("2027-01"), "January 2027"); assert.equal(C.monthLabel("0099-12"), "December 99"); assert.equal(C.monthLabel("2027-13"), "");
});
test("runs, spans, months and next dates stop at the edges of a written year", () => {
  const calendar = year2Only(), spans = C.checkSpans({ schemaVersion: 1, years: [null, [3, 21, 21, 14, 1, ...Array(14).fill(21), 9, 3], null] });
  assert.deepEqual(C.runOn(calendar, "2027-01-01"), { part: 1, of: 3, first: "2027-01-01", last: "2027-01-03" });
  assert.deepEqual(C.runOn(calendar, "2027-12-31"), { part: 3, of: 3, first: "2027-12-29", last: "2027-12-31" });
  assert.deepEqual(C.runOn(calendar, "2030-12-29"), { part: 1, of: 3, first: "2030-12-29", last: "2030-12-31" });
  assert.equal(C.runOn(calendar, "2026-12-31"), null); assert.equal(C.runOn(calendar, "2028-01-01"), null);
  assert.equal(C.readingOn(calendar, "2026-11-18"), null);
  assert.deepEqual(C.spanDates(spans, "2027-12-30"), ["2027-12-29", "2027-12-30", "2027-12-31"]); assert.deepEqual(C.spanDates(spans, "2028-01-01"), []);
  const empty = C.monthGrid(calendar, spans, "2026-11").weeks.flat().filter(Boolean);
  assert.ok(empty.every(cell => cell.entry === null && !cell.spanStart && cell.run === "single"));
  assert.deepEqual(C.monthGrid(calendar, spans, "2027-12").weeks.flat().filter(Boolean).slice(-3).map(cell => cell.run), ["start", "middle", "end"]);
  // The next date of a reading skips the years not written.
  assert.equal(C.nextDateOf(calendar, "r2-1", "2026-11-18"), "2027-01-01"); assert.equal(C.nextDateOf(calendar, "r2-1", "2027-01-02"), "2030-01-01");
});
