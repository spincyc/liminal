#!/usr/bin/env node
"use strict";
// Typesets nightly readings as printable packets in the fixed Liminal packet
// style (src/lib/reading-tex.js) with a local TeX installation: the same TeX
// the site's Generate PDF action typesets in the browser. docs/reading-packets.md
// is the specification; test/reading-packet.test.js pins it so the style
// cannot drift.
//
//   node tools/reading-packet.js --dates 2026-10-08,2026-10-09,2026-10-12 --out .scratch/packets --pdf
//   node tools/reading-packet.js --nights k:w7d4,5:w12d3 --out .scratch/packets --pdf --rotate-backs
//
// Output is never committed. --pdf needs pdfLaTeX with Latin Modern (lmodern),
// or XeLaTeX with fontspec and FreeSerif when a night holds Greek or Cyrillic,
// and (for --rotate-backs) pdfpages.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const D = require("../src/lib/daily-reading");
const T = require("../src/lib/reading-tex");

// The school calendar: five nights a week, Monday to Friday, 36 weeks from the
// Monday the year starts. Weekends and dates outside the year have no night.
const DEFAULT_START = "2026-08-24";
function schoolNight(date, start = DEFAULT_START) {
  const day = Date.parse(date + "T00:00:00Z"), first = Date.parse(start + "T00:00:00Z");
  const real = (time, text) => Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === text;
  // Date.parse accepts impossible days such as 2026-02-30 (as March 2), so
  // every date must round-trip exactly.
  if (!real(day, date) || !real(first, start) || new Date(first).getUTCDay() !== 1) throw new Error("dates must be real YYYY-MM-DD days and the start a Monday");
  const offset = Math.round((day - first) / 86400000), weekday = new Date(day).getUTCDay();
  const week = Math.floor(offset / 7) + 1;
  return offset < 0 || weekday === 0 || weekday === 6 || week > 36 ? null : { week, day: weekday };
}

// One entry per night for src/lib/reading-tex.js, with its footer line.
function entries(group) {
  return group.nights.map(({ day, date }) => T.entry(group.course, day, T.schoolMeta(group.course.grade, day, date)));
}
// Each grade's packet starts on a fresh sheet so duplex packets separate.
function documentTex(groups) {
  return T.documentTeX(groups.map(group => ({ nights: entries(group) })));
}
// Some duplex printers turn back sides upside down; this wrapper pre-rotates
// every even page by 180 degrees so they come out upright.
function rotatedBacksTex(pdfName, pages) {
  return ["\\documentclass[letterpaper]{article}", "\\usepackage[letterpaper,margin=0pt]{geometry}", "\\usepackage{pdfpages}", "\\begin{document}",
    ...Array.from({ length: pages }, (_, i) => "\\includepdf[pages={" + (i + 1) + "},angle=" + (i % 2 ? 180 : 0) + ",fitpaper=false,noautoscale=true]{" + pdfName + "}"),
    "\\end{document}", ""].join("\n");
}

function parseArgs(argv) {
  const options = { start: DEFAULT_START, grades: D.GRADES.filter(grade => !D.isAdvanced(grade)).map(D.gradeKey), out: null, pdf: false, rotateBacks: false, dates: [], nights: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i], value = () => { if (i + 1 >= argv.length) throw new Error(arg + " needs a value"); return argv[++i]; };
    if (arg === "--dates") options.dates = value().split(",");
    else if (arg === "--nights") options.nights = value().split(",");
    else if (arg === "--grades") {
      options.grades = value().split(",");
      const bad = options.grades.filter(key => D.gradeFromKey(key) === null);
      if (bad.length) throw new Error("unknown grade key " + bad.join(", ") + " (use k, 1–12 or a1–a4)");
    }
    else if (arg === "--start") options.start = value();
    else if (arg === "--out") options.out = value();
    else if (arg === "--pdf") options.pdf = true;
    else if (arg === "--rotate-backs") options.rotateBacks = true;
    else throw new Error("unknown option " + arg);
  }
  if (!options.out || (!options.dates.length && !options.nights.length)) throw new Error("usage: reading-packet.js (--dates YYYY-MM-DD,... | --nights k:w7d4,...) --out DIR [--grades k,1,...] [--start YYYY-MM-DD] [--pdf] [--rotate-backs]");
  return options;
}
function selections(options, load) {
  const groups = new Map();
  const add = (key, week, day, date) => {
    const course = load(key), night = course.days.find(item => item.week === week && item.day === day);
    if (!night) throw new Error("no night " + key + " week " + week + " day " + day);
    if (!groups.has(key)) groups.set(key, { course, nights: [] });
    groups.get(key).nights.push({ day: night, date });
  };
  for (const key of options.grades) for (const date of options.dates) {
    const night = schoolNight(date, options.start);
    if (!night) throw new Error(date + " is not a school night in the year starting " + options.start);
    add(key, night.week, night.day, date);
  }
  for (const spec of options.nights) {
    const match = /^(k|[1-9]|1[0-2]|a[1-4]):w(\d{1,2})d([1-5])$/.exec(spec);
    if (!match) throw new Error("night must look like 5:w12d3, got " + spec);
    add(match[1], Number(match[2]), Number(match[3]), null);
  }
  return [...groups.values()].sort((a, b) => a.course.grade - b.course.grade);
}
// Runs a TeX engine until its cross-references settle (at most three passes;
// the packet style keeps no auxiliary files, so one pass normally suffices).
function typeset(engine, name, out) {
  const result = spawnSync(engine, ["-interaction=nonstopmode", "-halt-on-error", "-no-shell-escape", name], { cwd: out, encoding: "utf8" });
  const log = path.join(out, name.replace(/\.tex$/, ".log"));
  if (result.error) throw new Error(engine + " is not available: " + result.error.message);
  if (result.status !== 0) throw new Error(engine + " failed on " + name + "; see " + log);
  const text = fs.readFileSync(log, "utf8");
  const problem = /^(! .*|Missing character.*|LaTeX Font Warning: Font shape .* undefined.*)$/m.exec(text);
  if (problem) throw new Error(engine + " could not typeset " + name + " faithfully (" + problem[1] + "); see " + log);
}
function run(argv) {
  const options = parseArgs(argv);
  // Courses as the build resolves them, sources attached.
  const courses = require("./build-daily-reading").loadDailyReading().courses;
  const load = key => courses.find(item => D.gradeKey(item.grade) === key) || (() => { throw new Error("grade " + key + " is not published"); })();
  const out = path.resolve(options.out); fs.mkdirSync(out, { recursive: true });
  const { tex, engine } = T.documentTeX(selections(options, load).map(group => ({ nights: entries(group) })));
  fs.writeFileSync(path.join(out, "packet.tex"), tex);
  console.log("Wrote " + path.join(out, "packet.tex") + " (" + engine + ")");
  if (!options.pdf) return;
  typeset(engine, "packet.tex", out);
  console.log("Wrote " + path.join(out, "packet.pdf"));
  if (!options.rotateBacks) return;
  const info = spawnSync("pdfinfo", ["packet.pdf"], { cwd: out, encoding: "utf8" });
  const pages = Number((/Pages:\s+(\d+)/.exec(info.stdout || "") || [])[1]);
  if (!pages) throw new Error("could not count pages with pdfinfo");
  fs.writeFileSync(path.join(out, "packet-duplex.tex"), rotatedBacksTex("packet.pdf", pages));
  typeset("pdflatex", "packet-duplex.tex", out);
  console.log("Wrote " + path.join(out, "packet-duplex.pdf") + " (even pages rotated for duplex printers that flip backs)");
}
module.exports = { DEFAULT_START, schoolNight, entries, documentTex, rotatedBacksTex, parseArgs, selections };
if (require.main === module) { try { run(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; } }
