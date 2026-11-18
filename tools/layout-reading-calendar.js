#!/usr/bin/env node
"use strict";
// Lays out the date calendar (docs/daily-reading.md, "Date calendar") for
// every K–12 level. A reading set is 366 readings per level: one for each of
// the ten holidays, one for February 29, and a sequence of 355 read in order
// on the other days of any year. Every level shares one set of spans per
// set. A run of continued readings sits on consecutive sequence days inside
// one span, so when one level reads a seven-day story, another may read four
// days and then three, or five days and two single readings, and all of them
// start afresh together. Spans always break where a fixed-date day falls
// (C.BREAKS); a moveable holiday may pause a story for a day.
//
//   node tools/layout-reading-calendar.js           report on the layout
//   node tools/layout-reading-calendar.js --write   write it
//
// Each set keeps the readings it has (a reading removed from the corpus
// leaves it); readings in no set fill the first set short of 366, and a new
// set takes exactly 366 more per level. Every set is laid out afresh from its
// readings, deterministically: the same readings always give the same
// calendar. A holiday reads the reading tagged for it (`holiday`), or else a
// stand-in single reading, seasonal to its month when the level has one.
// Within a level a story's runs follow one another (a story begun in an
// earlier set comes first), single readings from different works alternate,
// and a reading with `months` is placed in one of those months when it can.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const D = require("../src/lib/daily-reading");
const C = require("../src/lib/reading-calendar");
const L = require("../src/lib/reading-library");
const { loadDailyReading } = require("./build-daily-reading");
const ROOT = path.resolve(__dirname, "..");
const order = value => crypto.createHash("sha256").update(value).digest("hex");

// The month of each sequence day: the month it falls in most often over a
// 400-year Gregorian cycle.
const MONTH_AT = Array.from({ length: C.REGULAR }, (_, position) => {
  const tally = new Map();
  for (let year = 2000; year < 2400; year++) { const month = Number(C.dateAt(year, position).slice(5, 7)); tally.set(month, (tally.get(month) || 0) + 1); }
  return [...tally].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
});
const HOLIDAY_MONTH = new Map(C.holidays(2026).map(item => [item.key, Number(item.date.slice(5, 7))]));

// A level's readings as units: a continued run, or one reading. Units of one
// work keep their reading order (position in the work, then sequence).
function units(readings) {
  const list = [...readings.values()], byId = new Map(list.map(reading => [reading.id, reading])), out = [];
  for (const reading of list) {
    if (reading.excerpt.continuesFrom && byId.has(reading.excerpt.continuesFrom)) continue;
    const run = [reading];
    while (run[run.length - 1].excerpt.continuesTo) run.push(byId.get(run[run.length - 1].excerpt.continuesTo));
    const months = [...new Set(run.flatMap(item => item.months || []))];
    const range = L.rangeOf(reading.excerpt);
    out.push({ ids: run.map(item => item.id), length: run.length, work: reading.sourceId, months, holiday: run.length === 1 ? reading.holiday || null : null,
      position: range ? range.first * 1e6 + (range.startChar || 0) : 0, sequence: out.length });
  }
  return out;
}

// The holidays' readings and February 29's: a tagged reading, else a
// stand-in single, preferring one seasonal to the holiday's month, then one
// from a work of single readings. Returns them and the units left.
function standalone(grade, all) {
  const anchors = {}, used = new Set(), byWork = new Map();
  for (const unit of all) { if (!byWork.has(unit.work)) byWork.set(unit.work, []); byWork.get(unit.work).push(unit); }
  const singleWork = unit => byWork.get(unit.work).every(item => item.length === 1);
  for (const key of C.HOLIDAY_KEYS) {
    const tagged = all.filter(unit => unit.holiday === key);
    if (tagged.length > 1) throw new Error("Calendar layout: " + D.gradeLabel(grade) + " has " + tagged.length + " readings for " + C.holidayName(key) + " in one set");
    if (tagged.length) { anchors[key] = tagged[0]; used.add(tagged[0]); }
  }
  const pick = (salt, accept) => all.filter(unit => !used.has(unit) && unit.length === 1 && !unit.holiday && accept(unit))
    .sort((a, b) => order(grade + ":" + salt + ":" + a.ids[0]).localeCompare(order(grade + ":" + salt + ":" + b.ids[0])))[0] || null;
  for (const key of C.HOLIDAY_KEYS) {
    if (anchors[key]) continue;
    const month = HOLIDAY_MONTH.get(key);
    const unit = pick(key, item => item.months.includes(month)) || pick(key, item => !item.months.length && singleWork(item)) || pick(key, item => !item.months.length);
    if (!unit) throw new Error("Calendar layout: " + D.gradeLabel(grade) + " has no single reading left for " + C.holidayName(key));
    anchors[key] = unit; used.add(unit);
  }
  const leap = pick("leap", item => item.months.includes(2)) || pick("leap", item => !item.months.length && singleWork(item)) || pick("leap", item => !item.months.length);
  if (!leap) throw new Error("Calendar layout: " + D.gradeLabel(grade) + " has no single reading left for February 29");
  used.add(leap);
  return { anchors: Object.fromEntries(C.HOLIDAY_KEYS.map(key => [key, anchors[key].ids[0]])), leap: leap.ids[0], rest: all.filter(unit => !used.has(unit)) };
}

function levelState(grade, all, begun = new Set()) {
  const works = new Map();
  for (const unit of all) { if (!works.has(unit.work)) works.set(unit.work, []); works.get(unit.work).push(unit); }
  for (const list of works.values()) list.sort((a, b) => a.position - b.position || a.sequence - b.sequence);
  const seasonal = all.filter(unit => unit.months.length);
  const serials = [], fillers = [];
  for (const [work, list] of works) {
    const plain = list.filter(unit => !unit.months.length);
    if (!plain.length) continue;
    (plain.some(unit => unit.length > 1) ? serials : fillers).push({ work, queue: plain, key: (begun.has(work) ? "0" : "1") + order(grade + ":" + work) });
  }
  serials.sort((a, b) => a.key.localeCompare(b.key)); fillers.sort((a, b) => a.key.localeCompare(b.key));
  return { grade, serials, fillers, seasonal, current: 0, filler: 0, placed: [] };
}
const remaining = state => [...state.serials.flatMap(item => item.queue), ...state.fillers.flatMap(item => item.queue), ...state.seasonal];
function currentSerial(state) {
  while (state.current < state.serials.length && !state.serials[state.current].queue.length) state.current++;
  return state.serials[state.current] || null;
}
function desired(state, month) {
  const seasonal = state.seasonal.find(unit => unit.months.includes(month));
  if (seasonal) return seasonal.length;
  const serial = currentSerial(state);
  return serial ? serial.queue[0].length : 1;
}
const take = (queue, unit) => queue.splice(queue.indexOf(unit), 1);

// Choose units filling exactly `size` days, without changing the state.
// Preference: this month's seasonal readings, then the current story,
// then single readings in rotation, then anything that completes the sum.
// A seasonal reading whose months have passed is due too: every reading of
// the set must be placed.
function plan(state, size, month) {
  const chosen = [], used = new Set();
  let left = size;
  const add = unit => { chosen.push(unit); used.add(unit); left -= unit.length; };
  const due = unit => unit.months.includes(month) || unit.months.every(m => m < month);
  for (const unit of state.seasonal) if (due(unit) && unit.length <= left) add(unit);
  let serialIndex = state.current;
  while (left > 0 && serialIndex < state.serials.length) {
    const queue = state.serials[serialIndex].queue.filter(unit => !used.has(unit));
    if (!queue.length) { serialIndex++; continue; }
    if (queue[0].length > left) break;
    add(queue[0]);
  }
  let turn = state.filler, idle = 0;
  while (left > 0 && state.fillers.length && idle < state.fillers.length) {
    const filler = state.fillers[turn % state.fillers.length], next = filler.queue.find(unit => !used.has(unit) && unit.length <= left);
    turn++;
    if (next) { add(next); idle = 0; } else idle++;
  }
  if (left > 0) {
    // Exact completion (a small subset sum over lengths). A work offers only
    // its next units in reading order, so no story's runs are taken out of
    // order; a seasonal reading that is due may complete the span too.
    const groups = [...state.serials, ...state.fillers].map(item => item.queue.filter(unit => !used.has(unit)));
    for (const unit of state.seasonal) if (!used.has(unit) && due(unit)) groups.push([unit]);
    const reach = new Map([[0, []]]);
    for (const queue of groups) {
      const prefixes = [];
      let total = 0;
      for (const unit of queue) { total += unit.length; if (total > left) break; prefixes.push({ total, units: queue.slice(0, prefixes.length + 1) }); }
      if (!prefixes.length) continue;
      for (const [sum, picks] of [...reach]) for (const prefix of prefixes) {
        const next = sum + prefix.total;
        if (next <= left && !reach.has(next)) reach.set(next, [...picks, ...prefix.units]);
      }
      if (reach.has(left)) break;
    }
    if (!reach.has(left)) return null;
    reach.get(left).forEach(add);
  }
  return { chosen, fillerTurn: turn };
}
function commit(state, result) {
  for (const unit of result.chosen) {
    for (const list of [state.seasonal, ...state.serials.map(item => item.queue), ...state.fillers.map(item => item.queue)]) if (list.includes(unit)) { take(list, unit); break; }
    state.placed.push(...unit.ids);
  }
  state.filler = result.fillerTurn;
}

// Lays out one reading set. `levels`: [{ grade, readings (Map id -> reading,
// exactly 366), begun (works read in earlier sets) }]. Returns the shared
// span lengths and per level { grade, anchors, leap, sequence }.
function layoutSet(levels) {
  const prepared = levels.map(({ grade, readings, begun }) => {
    if (readings.size !== C.SET_SIZE) throw new Error("Calendar layout: " + D.gradeLabel(grade) + " has " + readings.size + " readings for a set of " + C.SET_SIZE);
    const { anchors, leap, rest } = standalone(grade, units(readings));
    return { grade, anchors, leap, state: levelState(grade, rest, begun) };
  });
  const states = prepared.map(level => level.state), breaks = new Set([...C.BREAKS, C.REGULAR]), lengths = [];
  let position = 0;
  while (position < C.REGULAR) {
    let end = position + 1;
    while (!breaks.has(end)) end++;
    const room = Math.min(end - position, C.MAX_SPAN), month = MONTH_AT[position];
    let size = Math.min(room, Math.max(...states.map(state => desired(state, month)))), results = null;
    for (; size >= 1 && !results; size--) {
      const attempt = states.map(state => plan(state, size, month));
      if (attempt.every(Boolean)) results = { size, attempt };
    }
    if (!results) throw new Error("Calendar layout: no common span fits at sequence day " + position + "; a level has run out of single readings");
    states.forEach((state, i) => commit(state, results.attempt[i]));
    lengths.push(results.size); position += results.size;
  }
  for (const state of states) if (remaining(state).length) throw new Error("Calendar layout: readings left over for " + D.gradeLabel(state.grade));
  return { lengths, levels: prepared.map(level => ({ grade: level.grade, anchors: level.anchors, leap: level.leap, sequence: level.state.placed })) };
}

// How often a moveable holiday pauses a story, per level: the average number
// of times a year (over a 400-year cycle) one falls between two parts of a run.
function pauses(lengths, level, readings) {
  const inside = new Set();
  level.sequence.forEach((id, i) => { if (readings.get(id).excerpt.continuesTo) inside.add(i + 1); });
  let count = 0;
  for (let year = 2000; year < 2400; year++) for (const item of C.holidays(year)) {
    const where = C.place(item.date);
    if (!C.HOLIDAYS.find(entry => entry.key === item.key).fixed && inside.has(where.before)) count++;
  }
  return count / 400;
}

// The sets to lay out: each set's readings still in the corpus, readings in
// no set filling the first set short of 366, then new sets of exactly 366.
function pools(readingsByGrade, old) {
  const grades = [...readingsByGrade.keys()].filter(grade => !D.isAdvanced(grade)).sort((a, b) => a - b);
  const kept = grades.map(grade => {
    const calendar = old.get(grade), readings = readingsByGrade.get(grade);
    const sets = calendar && calendar.schemaVersion === 2 && Array.isArray(calendar.sets) ? calendar.sets : [];
    return sets.map(set => [...C.HOLIDAY_KEYS.map(key => set.anchors && set.anchors[key]), set.leap, ...(set.sequence || [])].filter(id => readings.has(id)));
  });
  const count = Math.max(0, ...kept.map(sets => sets.length));
  const problems = [], out = [];
  grades.forEach((grade, g) => {
    const readings = readingsByGrade.get(grade), sets = Array.from({ length: count }, (_, s) => new Set(kept[g][s] || []));
    const placed = new Set(sets.flatMap(set => [...set]));
    // Readings in no set, as whole runs in corpus order; a set takes whole
    // runs only, so no story is split between sets.
    const free = [];
    for (const [id, reading] of readings) {
      if (placed.has(id)) continue;
      const from = reading.excerpt.continuesFrom;
      if (from && free.length && free.at(-1).at(-1) === from) free.at(-1).push(id); else free.push([id]);
    }
    const fill = set => { for (let i = 0; i < free.length && set.size < C.SET_SIZE;) { if (set.size + free[i].length <= C.SET_SIZE) free.splice(i, 1)[0].forEach(id => set.add(id)); else i++; } };
    sets.forEach(fill);
    while (free.flat().length >= C.SET_SIZE) { const set = new Set(); fill(set); sets.push(set); if (set.size < C.SET_SIZE) break; }
    if (free.length) problems.push(D.gradeLabel(grade) + " has " + free.flat().length + " readings beyond its full sets (a new set needs exactly " + C.SET_SIZE + ")");
    sets.forEach((set, s) => { if (set.size !== C.SET_SIZE) problems.push(D.gradeLabel(grade) + " set " + (s + 1) + " has " + set.size + " of " + C.SET_SIZE + " readings"); });
    out.push({ grade, readings, sets });
  });
  const total = Math.max(0, ...out.map(level => level.sets.length));
  for (const level of out) if (level.sets.length !== total) problems.push(D.gradeLabel(level.grade) + " has " + level.sets.length + " sets; every K–12 level needs " + total + " (the spans are shared)");
  return { levels: out, count: total, problems };
}

function layout(readingsByGrade, old = new Map()) {
  const { levels, count, problems } = pools(readingsByGrade, old);
  if (problems.length) throw new Error("Calendar layout: " + problems.join("; ") + ".");
  if (!count) throw new Error("Calendar layout: no readings to lay out");
  const spans = { schemaVersion: 2, sets: [] }, calendars = levels.map(level => ({ schemaVersion: 2, grade: level.grade, sets: [] }));
  for (let s = 0; s < count; s++) {
    const set = layoutSet(levels.map(level => {
      const begun = new Set(level.sets.slice(0, s).flatMap(ids => [...ids]).map(id => level.readings.get(id).sourceId));
      return { grade: level.grade, readings: new Map([...level.readings].filter(([id]) => level.sets[s].has(id))), begun };
    }));
    spans.sets.push(set.lengths);
    set.levels.forEach((level, i) => calendars[i].sets.push({ anchors: level.anchors, leap: level.leap, sequence: level.sequence }));
  }
  return { spans, calendars };
}

function run(argv) {
  const write = argv.includes("--write");
  const loaded = loadDailyReading({ checkCalendar: false });
  const { spans, calendars } = layout(loaded.readingsByGrade, loaded.calendars);
  const counts = spans.sets.flat().reduce((map, n) => map.set(n, (map.get(n) || 0) + 1), new Map());
  console.log("Reading sets: " + spans.sets.length + ". Spans per length: " + [...counts].sort((a, b) => a[0] - b[0]).map(([n, c]) => n + "d×" + c).join(", "));
  console.log("Stories paused by a moveable holiday, per year on average: " + calendars.map(calendar => D.gradeKey(calendar.grade).toUpperCase() + " "
    + (calendar.sets.reduce((sum, set, s) => sum + pauses(spans.sets[s], set, loaded.readingsByGrade.get(calendar.grade)), 0) / calendar.sets.length).toFixed(1)).join(", "));
  if (!write) return;
  const directory = path.join(ROOT, "content/reading-daily/calendar");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "spans.json"), JSON.stringify(spans) + "\n");
  for (const calendar of calendars) fs.writeFileSync(path.join(directory, D.gradeKey(calendar.grade) + ".json"), JSON.stringify(calendar, null, 1) + "\n");
  loadDailyReading({ complete: true });
  console.log("Wrote " + spans.sets.length + " reading set" + (spans.sets.length > 1 ? "s" : "") + " for " + calendars.length + " levels and checked the calendar.");
}
module.exports = { units, layoutSet, layout, pools, MONTH_AT };
if (require.main === module) { try { run(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; } }
