"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const C = require("../src/lib/reading-calendar");
const { layout } = require("../tools/layout-reading-calendar");
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
function level(grade, shape) {
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
  while (n < 1098) run(1, "poems-" + grade + "-" + (w++ % 7));
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
