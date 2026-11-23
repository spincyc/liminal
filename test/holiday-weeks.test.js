"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../src/lib/reading-calendar");
const H = require("../src/lib/holiday-weeks");
const { validateHolidayWeeks } = require("../tools/build-daily-reading");
const { parseArgs, holidayLevels } = require("../tools/reading-packet");

test("seven consecutive dates end on the actual observance in every Gregorian year shape", () => {
  for (let year = 2000; year < 2400; year++) for (const holiday of C.holidays(year)) {
    const dates = H.dates(holiday.key, year);
    assert.equal(dates.length, 7);
    assert.equal(dates[6], holiday.date);
    dates.slice(1).forEach((date, i) => assert.equal(date, C.addDays(dates[i], 1)));
  }
  assert.deepEqual(H.dates("new-year", 2027).filter((_, i) => i === 0 || i === 6), ["2026-12-26", "2027-01-01"]);
  assert.equal(H.dates("thanksgiving", 2026)[6], "2026-11-26");
  assert.equal(H.dates("thanksgiving", 2027)[6], "2027-11-25");
  assert.throws(() => H.dates("new-year", 1), /first supported/);
  assert.throws(() => H.dates("unknown", 2026), /holiday/);
});

function fixture() {
  const lead = ["a", "b", "c", "d", "e", "f"];
  const selections = Object.fromEntries(C.HOLIDAY_KEYS.map(key => [key, { k: [...lead] }]));
  const anchors = Object.fromEntries(C.HOLIDAY_KEYS.map(key => [key, key]));
  const readings = new Map([...lead, ...C.HOLIDAY_KEYS].map(id => [id, { id, sourceId: "book", excerpt: {}, holiday: anchors[id] }]));
  readings.get("a").excerpt.continuesTo = "b";
  readings.get("b").excerpt.continuesFrom = "a";
  return { selections, set: { anchors }, readings };
}

test("holiday weeks admit only complete chains, one grade's readings, and the correct final holiday", () => {
  const { selections, set, readings } = fixture();
  const check = () => validateHolidayWeeks(selections, new Map([[0, { sets: [set] }]]), new Map([[0, readings]]));
  check();
  const built = { anchors: { halloween: { id: "halloween", title: "Hallowe'en" } } };
  assert.deepEqual(H.readingIds("halloween", "k", built, selections), H.readingIds("halloween", "k", set, selections));
  selections.halloween.k = ["b", "c", "d", "e", "f", "a"];
  assert.throws(check, /incomplete continued/);
  selections.halloween.k = ["a", "b", "c", "d", "e", "x"];
  assert.throws(check, /unknown holiday week/);
  selections.halloween.k[5] = "e";
  assert.throws(check, /duplicate/);
  selections.halloween.k[5] = "christmas";
  assert.throws(check, /misplaced holiday/);
  delete selections.halloween;
  assert.throws(check, /every calendar holiday/);
});

test("the holiday CLI resolves the year's anchor, dates, runs and extra sources for the standard packet", () => {
  const { selections, set, readings } = fixture();
  const source = { id: "book", title: "Book" };
  const loaded = { courses: [{ grade: 0, sources: [] }], extras: [{ grade: 0, sources: [source] }],
    calendars: new Map([[0, { sets: [set, { anchors: { halloween: "alternate" } }] }]]),
    readingsByGrade: new Map([[0, readings]]), holidayWeeks: selections };
  readings.set("alternate", { id: "alternate", sourceId: "book", excerpt: {} });
  const options = parseArgs(["--holiday", "halloween", "--year", "2027", "--grades", "k,k", "--out", "path"]);
  const levels = holidayLevels(options, loaded);
  assert.equal(levels.length, 1);
  const nights = levels[0].nights;
  assert.deepEqual(nights.map(n => n.day.id), ["a", "b", "c", "d", "e", "f", "alternate"]);
  assert.deepEqual(nights[1].run, { part: 2, of: 2 });
  assert.ok(nights.every(n => n.source === source));
  assert.equal(nights[6].meta, "Kindergarten · Sunday 31 October 2027");
  for (const args of [["--holiday", "unknown"], ["--holiday", "easter", "--year", "2026.5"], ["--year", "2026"],
    ["--holiday", "halloween", "--grades", "a1"], ["--holiday", "halloween", "--nights", "k:w2d1"]]) {
    assert.throws(() => parseArgs([...args, "--out", "test"]));
  }
});
