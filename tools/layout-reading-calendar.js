#!/usr/bin/env node
"use strict";
// Lays out the three-year date calendar (docs/daily-reading.md, "Date
// calendar"): every level with its full 1,098 readings gets three cycle
// years of 366 days, and all of those levels share one set of spans. A run
// of continued readings sits on consecutive days inside one span, so when one
// level reads a seven-day story, another may read four days and then three,
// or five days and two single readings, and all of them start afresh together.
//
//   node tools/layout-reading-calendar.js            report what a layout would do
//   node tools/layout-reading-calendar.js --write    write content/reading-daily/calendar/
//
// Deterministic: the same readings always give the same calendar. Within a
// level, a story's runs follow one another; single readings from different
// works alternate between them; a reading with `months` is placed in one of
// those months when it can be.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const D = require("../src/lib/daily-reading");
const C = require("../src/lib/reading-calendar");
const L = require("../src/lib/reading-library");
const { loadDailyReading } = require("./build-daily-reading");
const ROOT = path.resolve(__dirname, "..");
const TOTAL = C.CYCLE * C.SLOTS;
const order = value => crypto.createHash("sha256").update(value).digest("hex");

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
    out.push({ ids: run.map(item => item.id), length: run.length, work: reading.sourceId, months,
      position: range ? range.first * 1e6 + (range.startChar || 0) : 0, sequence: out.length });
  }
  return out;
}

function levelState(grade, readings) {
  const all = units(readings), works = new Map();
  for (const unit of all) { if (!works.has(unit.work)) works.set(unit.work, []); works.get(unit.work).push(unit); }
  for (const list of works.values()) list.sort((a, b) => a.position - b.position || a.sequence - b.sequence);
  const seasonal = all.filter(unit => unit.months.length);
  const serials = [], fillers = [];
  for (const [work, list] of works) {
    const plain = list.filter(unit => !unit.months.length);
    if (!plain.length) continue;
    (plain.some(unit => unit.length > 1) ? serials : fillers).push({ work, queue: plain, key: order(grade + ":" + work) });
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
function plan(state, size, month, cycle) {
  const chosen = [], used = new Set();
  let left = size;
  const add = unit => { chosen.push(unit); used.add(unit); left -= unit.length; };
  // In the last cycle year, a seasonal reading whose months have passed is due now.
  const due = unit => unit.months.includes(month) || (cycle === C.CYCLE && unit.months.every(m => m < month));
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
    // Exact completion from everything left (small subset sum over lengths).
    const pool = remaining(state).filter(unit => !used.has(unit) && unit.length <= left && (!unit.months.length || due(unit)));
    const reach = new Map([[0, []]]);
    for (const unit of pool) {
      for (const [sum, picks] of [...reach]) {
        const next = sum + unit.length;
        if (next <= left && !reach.has(next)) reach.set(next, [...picks, unit]);
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

function layout(levels) {
  const states = levels.map(({ grade, readings }) => levelState(grade, readings));
  const years = [];
  for (let cycle = 1; cycle <= C.CYCLE; cycle++) {
    const lengths = [];
    let slot = 1;
    while (slot <= C.SLOTS) {
      const month = C.monthDayOf(slot).month;
      const boundary = slot < C.LEAP_SLOT ? C.LEAP_SLOT - 1 : slot === C.LEAP_SLOT ? C.LEAP_SLOT : C.SLOTS;
      const room = Math.min(boundary - slot + 1, C.MAX_SPAN);
      let size = slot === C.LEAP_SLOT ? 1 : Math.min(room, Math.max(...states.map(state => desired(state, month))));
      let results = null;
      for (; size >= 1 && !results; size--) {
        const attempt = states.map(state => plan(state, size, month, cycle));
        if (attempt.every(Boolean)) results = { size, attempt };
      }
      if (!results) throw new Error("Calendar layout: no common span fits at cycle year " + cycle + ", slot " + slot + "; a level has run out of single readings");
      states.forEach((state, i) => commit(state, results.attempt[i]));
      lengths.push(results.size);
      slot += results.size;
    }
    years.push(lengths);
  }
  for (const state of states) if (remaining(state).length) throw new Error("Calendar layout: readings left over for " + D.gradeLabel(state.grade));
  const spans = { schemaVersion: 1, years };
  const calendars = states.map(state => ({ schemaVersion: 1, grade: state.grade,
    years: Array.from({ length: C.CYCLE }, (_, y) => state.placed.slice(y * C.SLOTS, (y + 1) * C.SLOTS)) }));
  return { spans, calendars };
}

function run(argv) {
  const write = argv.includes("--write");
  const loaded = loadDailyReading();
  const levels = [], short = [];
  for (const [grade, readings] of loaded.readingsByGrade) {
    if (D.isAdvanced(grade)) continue;
    if (readings.size === TOTAL) levels.push({ grade, readings }); else short.push(D.gradeLabel(grade) + " has " + readings.size + " of " + TOTAL);
  }
  if (short.length) console.log("Not laid out (a level needs exactly " + TOTAL + " readings): " + short.join("; ") + ".");
  if (!levels.length) { console.log("No level is complete; nothing to lay out."); return; }
  if (short.length && write) throw new Error("Every K–12 level must be complete before the shared calendar is written: the spans are shared.");
  const { spans, calendars } = layout(levels);
  const counts = spans.years.flat().reduce((map, n) => map.set(n, (map.get(n) || 0) + 1), new Map());
  console.log("Spans per length: " + [...counts].sort((a, b) => a[0] - b[0]).map(([n, c]) => n + "d×" + c).join(", "));
  if (!write) return;
  const directory = path.join(ROOT, "content/reading-daily/calendar");
  fs.rmSync(directory, { recursive: true, force: true }); fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "spans.json"), JSON.stringify(spans) + "\n");
  for (const calendar of calendars) fs.writeFileSync(path.join(directory, D.gradeKey(calendar.grade) + ".json"), JSON.stringify(calendar, null, 1) + "\n");
  loadDailyReading({ completeCalendar: true });
  console.log("Wrote the calendar for " + calendars.length + " levels and checked it.");
}
module.exports = { units, layout };
if (require.main === module) { try { run(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; } }
