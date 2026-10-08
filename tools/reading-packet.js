#!/usr/bin/env node
"use strict";
// Typesets nightly readings as printable packets in the fixed Liminal packet
// style: a classic two-column TeX article set in Computer Modern (CMU Serif)
// with a title, author and abstract block. docs/reading-packets.md is the
// specification; test/reading-packet.test.js pins it so the style cannot drift.
//
//   node tools/reading-packet.js --dates 2026-10-08,2026-10-09,2026-10-12 --out .scratch/packets --pdf
//   node tools/reading-packet.js --nights k:w7d4,5:w12d3 --out .scratch/packets --pdf --rotate-backs
//
// Output is never committed. --pdf needs XeLaTeX with fontspec, the CMU fonts
// and (for --rotate-backs) pdfpages.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const D = require("../src/lib/daily-reading");
const ROOT = path.resolve(__dirname, "..");

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

// The fixed packet style. Changing any of it changes what families print, so the
// test pins these lines; update docs/reading-packets.md and the test together.
const PREAMBLE = String.raw`\documentclass[10pt,twocolumn,twoside,letterpaper]{article}
\usepackage[letterpaper,top=0.75in,bottom=0.8in,left=0.75in,right=0.75in,columnsep=0.28in,headsep=0.25in]{geometry}
\usepackage{fontspec}
\setmainfont{CMU Serif}[Ligatures=Common]
\setsansfont{CMU Sans Serif}
\setmonofont{CMU Typewriter Text}
\usepackage[protrusion=true]{microtype}
\usepackage{fancyhdr,enumitem}
\usepackage[hidelinks]{hyperref}
\setlength{\parindent}{1.2em}
\setlength{\parskip}{0pt}
\setlist[enumerate]{leftmargin=1.6em,itemsep=0.5ex}
\makeatletter
\def\cleardoublepage{\clearpage\if@twoside\ifodd\c@page\else\hbox{}\thispagestyle{empty}\newpage\if@twocolumn\hbox{}\newpage\fi\fi\fi}
\renewenvironment{verse}{\let\\\@centercr\list{}{\itemsep\z@\itemindent-1.5em\listparindent\itemindent\rightmargin\leftmargin\advance\leftmargin1.5em\topsep0.6ex\parsep0.9ex}\raggedright\item\relax}{\endlist}
\makeatother
\newcommand{\paperstart}{1}
\newcommand{\paperhead}{}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[RE,LO]{\footnotesize \paperhead}
\fancyfoot[C]{\scriptsize Liminal \quad\the\numexpr\value{page}-\paperstart+1\relax}
\renewcommand{\headrulewidth}{0.4pt}
`;

const escape = s => String(s).replace(/\\/g, "\u0000").replace(/([{}$&#%_])/g, "\\$1")
  .replace(/\^/g, "\\^{}").replace(/~/g, "\\textasciitilde{}").replace(/\u0000/g, "\\textbackslash{}");
// Print-only typography, never wording: straight double quotes become curly
// (CMU Serif draws ASCII " as a closing quote) and paired _underscores_, a
// plain-text transcription convention, become italics.
const curly = s => String(s).replace(/(^|[\s(\[{\u2014-])"/g, "$1\u201c").replace(/"/g, "\u201d");
const inline = s => escape(curly(s)).replace(/\\_([^_\n]+?)\\_/g, "\\emph{$1}");
const lineStart = s => /^[[*]/.test(s) ? "{}" + s : s;
function verse(text) {
  return text.split("\n").map(line => {
    const [, lead, rest] = line.match(/^(\s*)(.*)$/), indent = lead.replace(/\t/g, "    ").length;
    return (indent ? "\\hspace*{" + (indent * 0.5).toFixed(1) + "em}" : "") + lineStart(inline(rest));
  }).join("\\\\\n");
}
// A tab-separated source table (D.tableRows) as a tabular. Its cells keep
// their characters: ditto marks stay straight, not curled into quotes.
function table(rows) {
  const width = Math.max(...rows.map(row => row.cells.length));
  const cell = (text, row) => (row.header ? "\\textit{" : "{") + escape(text).replace(/"/g, "\\textquotedbl{}") + "}";
  const spec = width > 1 ? "@{}" + "l".repeat(width - 1) + "p{0.4\\linewidth}@{}" : "@{}l@{}";
  const lines = rows.map(row => row.cells.length === 1
    ? "\\multicolumn{" + width + "}{@{}l}{" + cell(row.cells[0], row) + "}\\tabularnewline"
    : Array.from({ length: width }, (_, i) => (i === width - 1 && width > 1 ? "\\raggedright " : "") + cell(row.cells[i] || "", row)).join(" & ") + "\\tabularnewline");
  return "\\par\\smallskip\\noindent{\\small\\begin{tabular}{" + spec + "}\n" + lines.join("\n") + "\n\\end{tabular}}\\par\\smallskip\n";
}
function blocks(day) {
  const out = [];
  let inVerse = false;
  for (const block of day.blocks) {
    if (block.type === "stanza") {
      if (!inVerse) { out.push("\\begin{verse}"); inVerse = true; }
      out.push(verse(block.text) + "\n");
      continue;
    }
    if (inVerse) { out.push("\\end{verse}"); inVerse = false; }
    const rows = block.type === "paragraph" && D.tableRows(block.text);
    if (rows) { out.push(table(rows)); continue; }
    out.push(block.type === "heading" ? "\\begin{center}\\textsc{" + inline(block.text) + "}\\end{center}" : lineStart(inline(block.text)) + "\n");
  }
  if (inVerse) out.push("\\end{verse}");
  return out.join("\n");
}
// The edition's identifying sentences, without its long normalization notes.
function shortEdition(edition) {
  let out = "";
  for (const sentence of edition.split(/(?<=[.;])\s+/)) {
    if (out.length >= 70 || out.length + sentence.length > 260) break;
    out += (out ? " " : "") + sentence;
  }
  return (out || edition.slice(0, 200)).replace(/;$/, ".");
}
const MODES = { "adult-read-aloud": "read aloud by an adult", shared: "read together", independent: "read independently" };
const longDate = date => new Date(date + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

// One night as one paper. Only reader-facing fields are used: the text,
// context, content note, focus, challenge and question prompts; facilitator
// notes and evidence never reach a packet.
function paper(course, day, { date = null, newSheet = false } = {}) {
  const source = course.sources.find(item => item.id === day.sourceId);
  if (!source) throw new Error("unresolved source for " + day.id);
  const where = D.gradeLabel(course.grade) + " · Week " + day.week + ", Night " + day.day + (date ? " · " + longDate(date) : "");
  const title = day.workTitle || day.title.replace(/\s+—\s+excerpt$/, "");
  const reference = escape(source.author) + ", \\emph{" + inline(source.title) + "} (" + source.publicationYear + ")" +
    (source.translator ? ", translated by " + escape(source.translator) + " (" + source.translationYear + ")" : "") + ". " +
    inline(shortEdition(source.edition)) + " Public domain in the United States. \\url{" + source.url.replace(/[%#]/g, "\\$&") + "}";
  return [newSheet ? "\\cleardoublepage" : "\\clearpage",
    "\\edef\\paperstart{\\the\\value{page}}", "\\setcounter{section}{0}", "\\renewcommand{\\paperhead}{" + escape(where) + "}",
    "\\twocolumn[{\\begin{center}",
    "{\\LARGE\\bfseries " + inline(title) + "\\par}\\vspace{1.4ex}",
    "{\\large " + escape(day.author || source.author) + "\\par}\\vspace{0.8ex}",
    "{\\small\\itshape " + escape(where + " · about " + day.time.totalMinutes + " minutes, " + MODES[day.readingMode]) + "\\par}",
    "\\end{center}", "\\vspace{0.6ex}",
    "\\begin{center}\\begin{minipage}{0.78\\textwidth}\\small", "\\centerline{\\bfseries Abstract}\\vspace{0.6ex}",
    "\\noindent " + inline(day.focus) + " " + inline(day.challenge), "\\end{minipage}\\end{center}", "\\vspace{1.2ex}}]",
    "\\section{Context}", inline(day.context) + (day.contentNote ? "\n\n\\noindent\\textit{Content note.} " + inline(day.contentNote) : ""), "",
    "\\section{Text}", blocks(day), "",
    "\\section{Questions for discussion}", "\\begin{enumerate}", ...day.questions.map(question => "\\item " + inline(question.prompt)), "\\end{enumerate}", "",
    "\\begin{thebibliography}{1}\\footnotesize", "\\bibitem{src} " + reference, "\\end{thebibliography}", ""].join("\n");
}
// Each grade's packet starts on a fresh sheet so duplex packets separate.
function documentTex(groups) {
  return PREAMBLE + "\\begin{document}\n" + groups.map(({ course, nights }) =>
    nights.map(({ day, date }, i) => paper(course, day, { date, newSheet: i === 0 })).join("\n")).join("\n") + "\\end{document}\n";
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
function run(argv) {
  const options = parseArgs(argv);
  const load = key => JSON.parse(fs.readFileSync(path.join(ROOT, "content/reading-daily", key + ".json"), "utf8"));
  const out = path.resolve(options.out); fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "packet.tex"), documentTex(selections(options, load)));
  console.log("Wrote " + path.join(out, "packet.tex"));
  if (!options.pdf) return;
  const xelatex = name => { for (let pass = 0; pass < 2; pass++) {
    const result = spawnSync("xelatex", ["-interaction=nonstopmode", "-halt-on-error", name], { cwd: out, encoding: "utf8" });
    if (result.status !== 0) throw new Error("xelatex failed on " + name + "; see " + path.join(out, name.replace(/\.tex$/, ".log")));
  } };
  xelatex("packet.tex");
  console.log("Wrote " + path.join(out, "packet.pdf"));
  if (!options.rotateBacks) return;
  const info = spawnSync("pdfinfo", ["packet.pdf"], { cwd: out, encoding: "utf8" });
  const pages = Number((/Pages:\s+(\d+)/.exec(info.stdout || "") || [])[1]);
  if (!pages) throw new Error("could not count pages with pdfinfo");
  fs.writeFileSync(path.join(out, "packet-duplex.tex"), rotatedBacksTex("packet.pdf", pages));
  xelatex("packet-duplex.tex");
  console.log("Wrote " + path.join(out, "packet-duplex.pdf") + " (even pages rotated for duplex printers that flip backs)");
}
module.exports = { PREAMBLE, DEFAULT_START, schoolNight, escape, inline, verse, table, blocks, shortEdition, paper, documentTex, rotatedBacksTex, parseArgs, selections };
if (require.main === module) { try { run(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; } }
