"use strict";
// Pins the printed packet style (docs/reading-packets.md). If one of these
// fails, the packets families print would change: update the doc and this test
// together, deliberately.
const test = require("node:test"), assert = require("node:assert/strict");
const P = require("../tools/reading-packet");
const T = require("../src/lib/reading-tex");
const PREAMBLE = T.preamble("pdflatex");

test("packet style is the fixed two-column Computer Modern article", () => {
  for (const line of [
    String.raw`\documentclass[10pt,twocolumn,twoside,letterpaper]{article}`,
    String.raw`\usepackage[letterpaper,top=0.75in,bottom=0.8in,left=0.75in,right=0.75in,columnsep=0.28in,headsep=0.25in]{geometry}`,
    // Latin Modern, the Type 1 continuation of Computer Modern, in both engines
    // (2026-11-17, docs/printing.md); it was CMU Serif under XeLaTeX before.
    String.raw`\usepackage[T1]{fontenc}`,
    String.raw`\usepackage{lmodern}`,
    String.raw`\usepackage[protrusion=true]{microtype}`,
    String.raw`\setlength{\parindent}{1.2em}`,
    String.raw`\fancyfoot[C]{\scriptsize \papermeta \quad Liminal \quad\the\numexpr\value{page}-\paperstart+1\relax}`,
    String.raw`\renewcommand{\headrulewidth}{0pt}`,
    String.raw`\setlist[enumerate]{leftmargin=1.6em,itemsep=1ex}`,
  ]) assert.ok(PREAMBLE.split("\n").includes(line), "missing style line: " + line);
  assert.doesNotMatch(PREAMBLE, /\\fancyhead\[/, "metadata no longer prints in a running head");
  assert.ok(PREAMBLE.includes(String.raw`\rule{\linewidth}{0.35pt}`), "section separators remain visible");
  assert.ok(PREAMBLE.includes(String.raw`\footnotesize\raggedright\hrule height0.35pt\vspace{0.8ex}\textbf{Source.}`), "source note has a small label and legible 8-point text");
  const branding = PREAMBLE.split("\n").filter(line => line.includes("Liminal"));
  assert.equal(branding.length, 1, "brand appears only once in the page style");
  assert.ok(branding[0].startsWith(String.raw`\fancyfoot[C]`), "brand appears only in the footer");
  for (const engine of T.ENGINES) assert.ok(T.preamble(engine).includes(String.raw`\def\cleardoublepage{\clearpage\if@twoside\ifodd\c@page\else\hbox{}\thispagestyle{empty}\newpage`), "blank versos stay unnumbered: " + engine);
});

const course = {
  grade: 5,
  sources: [{ id: "s", author: "Ann Author", title: "A Book & Its {Notes}", translator: null, translationYear: null, publicationYear: 1901,
    edition: "London: Example Press for the Society of Illustrative Fixtures, 1901, second impression. Long normalization notes that should not print in the reference.", url: "https://example.org/b#1" }],
};
const day = {
  id: "reading-5-w07-d4", week: 7, day: 4, title: "A night — excerpt", sourceId: "s", readingMode: "shared",
  time: { readingMinutes: 12, discussionMinutes: 6, totalMinutes: 18 }, challenge: "Track the turn.", focus: "Notice the change.",
  context: "Before the scene.", contentNote: null,
  blocks: [{ type: "heading", text: "I" }, { type: "stanza", text: "First \"line\" here\n  indented _word_ line" }, { type: "paragraph", text: "[Bracket] 50% of $5 & more." }],
  questions: [{ id: "q1", prompt: "What changes?", facilitatorNotes: ["FACILITATOR_SECRET"], evidence: ["EVIDENCE_SECRET"] }],
};

// One night through the CLI's path: a group of one night, as a whole document.
const paper = (data, night, date = null) => P.documentTex([{ course: data, nights: [{ day: night, date }] }]).tex;

test("a night renders as one paper with a compact source credit, never editorial or facilitator notes", () => {
  const tex = paper(course, day, "2026-10-08");
  const order = [String.raw`\cleardoublepage`, String.raw`{\LARGE\bfseries A night\par}`, String.raw`{\large Ann Author\par}`,
    String.raw`{\small\itshape Read together\par}`,
    String.raw`\centerline{\bfseries Abstract}`, "Notice the change. Track the turn.", String.raw`\section{Context}`,
    String.raw`\section{Text}\readingsectionrule`, String.raw`\section{Questions for discussion}\readingsectionrule`,
    String.raw`\readingsource{Ann Author, A Book \& Its \{Notes\} (1901). Public domain in the United States.`];
  let at = -1;
  for (const piece of order) { const next = tex.indexOf(piece); assert.ok(next > at, "out of order or missing: " + piece); at = next; }
  assert.doesNotMatch(tex, /FACILITATOR_SECRET|EVIDENCE_SECRET|normalization notes|Example Press|Endnotes|thebibliography/);
  assert.ok(tex.includes(String.raw`\renewcommand{\papermeta}{Grade 5 \textperiodcentered{} Week 7 \textperiodcentered{} Day 4 \textperiodcentered{} Thu, Oct 8}`));
  assert.doesNotMatch(tex.slice(tex.indexOf(String.raw`\twocolumn`)), /Grade 5|Week 7|Day 4|Thu, Oct 8/, "metadata stays out of the title and body");
  assert.ok(tex.includes(String.raw`\href{https://example.org/b\#1}{\nolinkurl{example.org/b\#1}}`));
  const estimate = "About 18 min \\textperiodcentered{} read 12 + discuss 6";
  assert.equal(tex.indexOf(estimate), tex.lastIndexOf(estimate), "print estimates appear only once");
  assert.ok(tex.indexOf(estimate) > tex.indexOf(String.raw`\readingsource{`), "print estimates stay in the source note");
  const independent = paper(course, { ...day, readingMode: "independent" });
  assert.doesNotMatch(independent, /read independently/i);
  assert.ok(independent.includes(estimate));
  assert.ok(paper(course, { ...day, readingMode: "adult-read-aloud" }).includes(String.raw`{\small\itshape Read aloud by an adult\par}`));
  const translated = paper({ ...course, sources: [{ ...course.sources[0], translator: "T. Translator", translationYear: 1905 }] }, day);
  assert.ok(translated.includes(String.raw`Ann Author, A Book \& Its \{Notes\} (1901); translated by T. Translator (1905). Public domain in the United States.`));
  assert.ok(translated.includes(String.raw`{\small Translated by T. Translator\par}`), "the translator is named with the author");
  assert.ok(tex.includes(String.raw`\begin{verse}` + "\nFirst " + String.raw`\textquotedblleft{}line\textquotedblright{} here\\` + "\n" + String.raw`\hspace*{1.0em}indented \emph{word} line`));
  assert.ok(tex.includes(String.raw`{}[Bracket] 50\% of \$5 \& more.`));
  const two = P.documentTex([{ course, nights: [{ day, date: null }, { day, date: null }] }]).tex;
  assert.equal(two.match(/^\\cleardoublepage$/gm).length, 1, "only a level's first night starts a fresh sheet");
  assert.equal(two.match(/^\\clearpage$/gm).length, 1, "later nights start a new page");
});

test("school nights run Monday to Friday for 36 weeks from a Monday start", () => {
  assert.deepEqual(P.schoolNight("2026-10-08"), { week: 7, day: 4 });
  assert.deepEqual(P.schoolNight("2026-10-12"), { week: 8, day: 1 });
  assert.deepEqual(P.schoolNight("2026-08-24"), { week: 1, day: 1 });
  for (const date of ["2026-10-10", "2026-10-11", "2026-08-21", "2027-05-03"]) assert.equal(P.schoolNight(date), null, date);
  assert.throws(() => P.schoolNight("2026-10-08", "2026-08-25"), /Monday/);
});

test("duplex wrapper rotates only back pages", () => {
  const tex = P.rotatedBacksTex("packet.pdf", 3);
  assert.match(tex, /pages=\{1\},angle=0/); assert.match(tex, /pages=\{2\},angle=180/); assert.match(tex, /pages=\{3\},angle=0/);
});

test("source tables print as a tabular with straight ditto marks", () => {
  const tex = T.blocks({ blocks: [{ type: "paragraph", text: "Date\tNo.\tRemarks.\n1855\nDec. 13th\t1\tFine; starlight\n\" 14th\t75\tFog & rain" }] }, T.context());
  assert.match(tex, /\\begin\{tabular\}\{@\{\}llp\{0\.4\\linewidth\}@\{\}\}/);
  assert.match(tex, /\\multicolumn\{3\}\{@\{\}l\}\{\{1855\}\}\\tabularnewline/);
  assert.ok(tex.includes(String.raw`{\textquotedbl{} 14th} & {75} & \raggedright {Fog \& rain}\tabularnewline`));
  assert.doesNotMatch(tex, /“/);
});

test("impossible dates and unknown grades are refused", () => {
  assert.throws(() => P.schoolNight("2026-02-30"), /real YYYY-MM-DD/);
  assert.throws(() => P.parseArgs(["--dates", "2026-10-08", "--grades", "k,13", "--out", "x"]), /unknown grade key 13/);
  assert.equal(P.parseArgs(["--dates", "2026-10-08", "--grades", "k,a1", "--out", "x"]).grades.length, 2);
});
