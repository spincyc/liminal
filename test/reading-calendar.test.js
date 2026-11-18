"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const C = require("../src/lib/reading-calendar");
const { layoutSet, layout, MONTH_AT } = require("../tools/layout-reading-calendar");
const B = require("../tools/build-daily-reading");

test("holidays fall on their dates in any year", () => {
  assert.deepEqual(C.holidays(2026).map(item => item.date), ["2026-01-01", "2026-04-05", "2026-05-25", "2026-07-04", "2026-09-07", "2026-10-12", "2026-10-31", "2026-11-11", "2026-11-26", "2026-12-25"]);
  assert.deepEqual(C.holidays(2027).map(item => item.date), ["2027-01-01", "2027-03-28", "2027-05-31", "2027-07-04", "2027-09-06", "2027-10-11", "2027-10-31", "2027-11-11", "2027-11-25", "2027-12-25"]);
  // Easter at its earliest and latest dates, and in years people remember.
  assert.deepEqual([1818, 2285, 1943, 2038, 2000, 2024, 2025].map(C.easter), [[3, 22], [3, 22], [4, 25], [4, 25], [4, 23], [3, 31], [4, 20]]);
  assert.deepEqual(C.holidayOn("2026-11-26"), { key: "thanksgiving", name: "Thanksgiving", date: "2026-11-26" });
  assert.equal(C.holidayOn("2026-11-27"), null); assert.equal(C.holidayOn("2026-02-30"), null);
  assert.equal(C.holidayName("christmas"), "Christmas"); assert.deepEqual(C.holidays(0), []);
});
test("every year has 355 sequence days in order, and fixed-date days always break the spans", () => {
  assert.deepEqual(C.BREAKS, [0, 58, 181, 297, 307, 349]);
  for (let year = 1990; year < 2430; year++) {
    let position = 0;
    for (let date = C.formatDate({ year, month: 1, day: 1 }); date && date.startsWith(String(year)); date = C.addDays(date, 1)) {
      const where = C.place(date);
      assert.equal(where.before, position, date);
      if (where.kind === "sequence") { assert.equal(where.position, position); assert.equal(C.dateAt(year, position), date); position++; continue; }
      if (where.kind === "leap" || C.HOLIDAYS.find(item => item.key === where.key).fixed) assert.ok(C.BREAKS.includes(where.before), date);
    }
    assert.equal(position, C.REGULAR, String(year));
    assert.equal(new Set(C.holidays(year).map(item => item.date)).size, 10);
  }
  assert.equal(C.dateAt(2026, 355), null); assert.equal(C.dateAt(10000, 0), null);
});

// A level's calendar with sets of ids: "s<set>-<position>", "s<set>-<holiday>", "s<set>-leap".
function idSets(count) {
  return { sets: Array.from({ length: count }, (_, s) => ({ sequence: Array.from({ length: C.REGULAR }, (_, i) => "s" + s + "-" + i),
    anchors: Object.fromEntries(C.HOLIDAY_KEYS.map(key => [key, "s" + s + "-" + key])), leap: "s" + s + "-leap" })) };
}
test("a date reads its holiday's reading, February 29's, or the next sequence day", () => {
  const calendar = idSets(1);
  assert.equal(C.readingOn(calendar, "2026-12-25"), "s0-christmas"); assert.equal(C.readingOn(calendar, "2027-03-28"), "s0-easter");
  assert.equal(C.readingOn(calendar, "2028-02-29"), "s0-leap"); assert.equal(C.readingOn(calendar, "2026-01-02"), "s0-0");
  assert.equal(C.readingOn(calendar, "2026-12-31"), "s0-354"); assert.equal(C.readingOn(calendar, "2027-02-29"), null);
  // Every day of a year reads a different reading; a leap year reads all 366.
  for (const year of [2026, 2028, 2100, 2400]) {
    const ids = [];
    for (let date = year + "-01-01"; date.startsWith(String(year)); date = C.addDays(date, 1)) ids.push(C.readingOn(calendar, date));
    assert.equal(new Set(ids).size, ids.length); assert.equal(ids.length, C.isLeap(year) ? 366 : 365);
  }
  // One set: every year reads it. Several: years take them in turn from 2026.
  assert.equal(C.readingOn(calendar, "1776-07-04"), "s0-independence-day");
  const three = idSets(3);
  assert.deepEqual([2026, 2027, 2028, 2029, 2025].map(year => C.readingOn(three, year + "-12-25")), ["s0-christmas", "s1-christmas", "s2-christmas", "s0-christmas", "s2-christmas"]);
  assert.deepEqual([2020, 2026, 2027].map(year => C.setOf(year, 3)), [0, 0, 1]); assert.equal(C.setOf(2027, 1), 0);
});

// Shared spans that break exactly where fixed-date days fall.
const LENGTHS = [21, 21, 16, 21, 21, 21, 21, 21, 18, 21, 21, 21, 21, 21, 11, 10, 21, 21, 6];
test("spans cover the sequence, cap at the maximum and break at fixed-date days", () => {
  assert.equal(LENGTHS.reduce((a, b) => a + b), C.REGULAR);
  assert.equal(C.checkSpans({ schemaVersion: 2, sets: [LENGTHS] }).sets.length, 1);
  assert.throws(() => C.checkSpans({ schemaVersion: 1, years: [LENGTHS] }), /schema version 2/);
  assert.throws(() => C.checkSpans({ schemaVersion: 2, sets: [[...LENGTHS.slice(0, -1), 5, 1].map((n, i) => i === 0 ? 22 : n)] }), /1-21/);
  assert.throws(() => C.checkSpans({ schemaVersion: 2, sets: [[...LENGTHS, 1]] }), /355/);
  assert.throws(() => C.checkSpans({ schemaVersion: 2, sets: [[21, 21, 17, 20, ...LENGTHS.slice(4)]] }), /after sequence day 58/);
  // A span's dates skip a holiday inside it; a holiday is a span of its own.
  const spans = { schemaVersion: 2, sets: [LENGTHS] };
  assert.deepEqual(C.spanDates(spans, "2026-11-26"), ["2026-11-26"]);
  const around = C.spanDates(spans, "2026-11-25");
  assert.ok(around.includes("2026-11-24") && around.includes("2026-11-27") && !around.includes("2026-11-26"));
  assert.equal(around.length, 21);
});

// Built entries: a three-day run at sequence days 92-94, which Easter 2026
// (April 5, after 93 sequence days) interrupts and Easter 2027 does not.
function builtCalendar() {
  const entry = id => ({ id, title: id, continuesFrom: false, continuesTo: false }), calendar = idSets(1);
  const set = calendar.sets[0];
  set.sequence = set.sequence.map(entry); set.anchors = Object.fromEntries(Object.entries(set.anchors).map(([key, id]) => [key, entry(id)])); set.leap = entry(set.leap);
  for (let i = 92; i <= 94; i++) Object.assign(set.sequence[i], { continuesFrom: i > 92, continuesTo: i < 94 });
  return calendar;
}
test("a story pauses for a moveable holiday and goes on the next day", () => {
  const calendar = builtCalendar();
  assert.equal(C.place("2026-04-05").before, 93); assert.equal(C.place("2027-03-28").before, 85);
  assert.deepEqual(C.runOn(calendar, "2026-04-04"), { part: 1, of: 3, first: "2026-04-04", last: "2026-04-07", previous: null, next: "2026-04-06" });
  assert.deepEqual(C.runOn(calendar, "2026-04-06"), { part: 2, of: 3, first: "2026-04-04", last: "2026-04-07", previous: "2026-04-04", next: "2026-04-07" });
  assert.equal(C.runOn(calendar, "2026-04-05"), null);
  assert.deepEqual(C.runOn(calendar, "2027-04-06"), { part: 2, of: 3, first: "2027-04-05", last: "2027-04-07", previous: "2027-04-05", next: "2027-04-07" });
  const april = C.monthGrid(calendar, { schemaVersion: 2, sets: [LENGTHS] }, "2026-04").weeks.flat().filter(Boolean);
  assert.deepEqual(april.slice(3, 7).map(cell => [cell.run, cell.holiday && cell.holiday.key]), [["start", null], ["single", "easter"], ["middle", null], ["end", null]]);
});
test("months mark holidays, February 29 and span starts; notes say when readings return", () => {
  const calendar = builtCalendar(), spans = { schemaVersion: 2, sets: [LENGTHS] };
  const january = C.monthGrid(calendar, spans, "2026-01"), cells = january.weeks.flat().filter(Boolean);
  assert.deepEqual(cells[0].holiday, { key: "new-year", name: "New Year’s Day" }); assert.equal(cells[0].spanStart, false);
  assert.equal(cells[1].spanStart, true); assert.equal(cells[2].spanStart, false); assert.equal(cells[22].spanStart, true);
  assert.equal(january.set, 1); assert.equal(january.sets, 1); assert.equal(january.weeks[0].filter(cell => cell === null).length, 4);
  const february = C.monthGrid(calendar, spans, "2028-02").weeks.flat().filter(Boolean);
  assert.equal(february.length, 29); assert.equal(february[28].leap, true); assert.equal(february[28].entry.id, "s0-leap");
  assert.equal(C.monthGrid(calendar, spans, "2026-13"), null);
  assert.equal(C.monthNote("2026-11", calendar), "Each day’s reading comes round again next year, on or near the same date; holidays keep readings of their own (Veterans Day, Thanksgiving this month).");
  assert.equal(C.monthNote("2027-06", idSets(2)), "Reading set 2 of 2. Each day’s reading comes round again 2 years later, on or near the same date; holidays keep readings of their own.");
  assert.equal(C.dayNote(calendar, "2026-12-25"), "Christmas · this reading returns on Saturday, December 25, 2027");
  assert.equal(C.dayNote(calendar, "2028-02-29"), "February 29 · this reading returns on Sunday, February 29, 2032");
  assert.equal(C.dayNote(calendar, "2026-04-06"), "this reading returns on Tuesday, April 6, 2027");
  assert.equal(C.monthLabel("2027-01"), "January 2027"); assert.equal(C.monthLabel("0099-12"), "December 99"); assert.equal(C.monthLabel("2027-13"), "");
});
test("the next date of a reading follows its set round the years", () => {
  const one = idSets(1), three = idSets(3);
  assert.equal(C.nextDateOf(one, "s0-0", "2026-11-18"), "2027-01-02");
  assert.equal(C.nextDateOf(one, "s0-easter", "2026-04-06"), "2027-03-28");
  assert.equal(C.nextDateOf(one, "s0-leap", "2026-11-18"), "2028-02-29");
  assert.equal(C.nextDateOf(three, "s1-christmas", "2026-11-18"), "2027-12-25");
  assert.equal(C.nextDateOf(three, "s1-christmas", "2027-12-26"), "2030-12-25");
  // Set 2 of 3 reaches February 29 only in 2036 (2027 + 9).
  assert.equal(C.nextDateOf(three, "s1-leap", "2026-11-18"), "2036-02-29");
  assert.equal(C.nextDateOf(one, "missing", "2026-11-18"), null); assert.equal(C.nextDateOf(one, "s0-0", "nope"), null);
});

// Synthetic levels of `total` readings: runs of several lengths, single
// readings, and whatever `shape` adds.
function level(grade, shape, total = C.SET_SIZE) {
  const readings = new Map(); let n = 0;
  const run = (length, work, extra = {}) => {
    let previous = null;
    for (let i = 0; i < length; i++) {
      const id = "r" + grade + "-" + n++, reading = { id, sourceId: work, excerpt: { blocks: [n, n], continuesFrom: previous, continuesTo: null }, ...extra };
      if (previous) readings.get(previous).excerpt.continuesTo = id;
      readings.set(id, reading); previous = id;
    }
  };
  shape(run);
  let w = 0;
  while (n < total) run(1, "poems-" + grade + "-" + (w++ % 7));
  return { grade, readings };
}
const check = (spans, calendar, readings, options) => B.validateCalendar(spans, [{ key: calendar.grade ? String(calendar.grade) : "k", data: calendar }], new Map([[calendar.grade, readings]]), options);
test("the layout lines up runs across levels in shared spans and gives each holiday a reading", () => {
  const levels = [
    level(0, run => { for (let i = 0; i < 20; i++) run(7, "story-a"); run(1, "carol", { months: [12] }); run(1, "pumpkins", { holiday: "halloween" }); }),
    level(1, run => { for (let i = 0; i < 12; i++) { run(4, "story-b"); run(3, "story-c"); } }),
    level(2, run => { for (let i = 0; i < 4; i++) run(20, "school-long"); for (let i = 0; i < 20; i++) run(5, "story-d"); }),
  ];
  const set = layoutSet(levels), spans = C.checkSpans({ schemaVersion: 2, sets: [set.lengths] });
  for (const placed of set.levels) {
    const { readings } = levels.find(item => item.grade === placed.grade), calendar = { schemaVersion: 2, grade: placed.grade, sets: [{ anchors: placed.anchors, leap: placed.leap, sequence: placed.sequence }] };
    check(spans, calendar, readings, { complete: true });
    // Each work's runs keep reading order.
    const seen = new Map();
    for (const id of placed.sequence) {
      const reading = readings.get(id), position = reading.excerpt.blocks[0];
      assert.ok(!(seen.get(reading.sourceId) > position), "runs of " + reading.sourceId + " out of order"); seen.set(reading.sourceId, position);
    }
  }
  const k = set.levels[0], readings = levels[0].readings;
  assert.equal(readings.get(k.anchors.halloween).sourceId, "pumpkins");
  // The seasonal reading reads on Christmas (a stand-in seasonal to December).
  assert.equal(readings.get(k.anchors.christmas).sourceId, "carol");
  assert.throws(() => layoutSet([level(0, run => { run(1, "a", { holiday: "easter" }); run(1, "b", { holiday: "easter" }); })]), /2 readings for Easter/);
  assert.throws(() => layoutSet([level(0, () => {}, 365)]), /365 readings for a set of 366/);
  void MONTH_AT;
});
test("calendar validation refuses broken runs and misplaced holiday readings", () => {
  const levels = [level(0, run => { for (let i = 0; i < 10; i++) run(6, "story"); run(1, "tree", { holiday: "christmas" }); })], readings = levels[0].readings;
  const set = layoutSet(levels), spans = { schemaVersion: 2, sets: [set.lengths] }, placed = set.levels[0];
  const calendar = () => ({ schemaVersion: 2, grade: 0, sets: [{ anchors: { ...placed.anchors }, leap: placed.leap, sequence: [...placed.sequence] }] });
  check(spans, calendar(), readings, { complete: true });
  const broken = calendar(), list = broken.sets[0].sequence, i = list.findIndex(id => readings.get(id).excerpt.continuesTo);
  [list[i], list[i + 1]] = [list[i + 1], list[i]];
  assert.throws(() => check(spans, broken, readings), /continuous run/);
  const swapped = calendar(), tree = swapped.sets[0].anchors.christmas, other = swapped.sets[0].sequence.find(id => !readings.get(id).excerpt.continuesTo && !readings.get(id).excerpt.continuesFrom);
  swapped.sets[0].anchors.christmas = other; swapped.sets[0].sequence[swapped.sets[0].sequence.indexOf(other)] = tree;
  assert.throws(() => check(spans, swapped, readings), /placed only on that holiday/);
  const missing = calendar(); delete missing.sets[0].anchors.easter;
  assert.throws(() => check(spans, missing, readings), /one reading for each holiday/);
  const short = calendar(); short.sets[0].sequence.pop();
  assert.throws(() => check(spans, short, readings), /355 readings/);
  const twice = calendar(); twice.sets[0].leap = twice.sets[0].sequence.find(id => !readings.get(id).excerpt.continuesTo && !readings.get(id).excerpt.continuesFrom);
  assert.throws(() => check(spans, twice, readings), /placed twice/);
  readings.set("extra", { id: "extra", sourceId: "x", excerpt: {} });
  assert.throws(() => check(spans, calendar(), readings, { complete: true }), /every reading must be placed exactly once/);
  check(spans, calendar(), readings);
});
test("sets keep their readings; readings in no set fill a new set of 366", () => {
  const full = [level(0, run => { for (let i = 0; i < 30; i++) run(7, "story-a"); }, 2 * C.SET_SIZE), level(1, run => { for (let i = 0; i < 40; i++) run(4, "story-b"); }, 2 * C.SET_SIZE)];
  const byGrade = new Map(full.map(item => [item.grade, item.readings]));
  // Readings beyond full sets are refused rather than spread thin.
  assert.throws(() => layout(new Map([[0, new Map([...full[0].readings].slice(0, 400))]])), /34 readings beyond its full sets/);
  const first = layout(byGrade);
  assert.equal(first.spans.sets.length, 2); C.checkSpans(first.spans);
  for (const calendar of first.calendars) check(first.spans, calendar, byGrade.get(calendar.grade), { complete: true });
  // Laid out again from the written calendar, each set keeps its readings.
  const again = layout(byGrade, new Map(first.calendars.map(calendar => [calendar.grade, calendar])));
  assert.deepEqual(again, first);
  const members = calendar => calendar.sets.map(set => new Set([...Object.values(set.anchors), set.leap, ...set.sequence]));
  const moved = layout(byGrade, new Map(first.calendars.map(calendar => [calendar.grade, { ...calendar, sets: [...calendar.sets].reverse() }])));
  assert.deepEqual(members(moved.calendars[0]), members(first.calendars[0]).reverse());
});
