"use strict";
// The TeX generator behind printed readings (src/lib/reading-tex.js): every
// character of every published night is typeset as written or refused, the
// engine is chosen by the text, levels start on fresh sheets, and continued
// nights and translations are named in the title block.
const test = require("node:test"), assert = require("node:assert/strict");
const D = require("../src/lib/daily-reading");
const T = require("../src/lib/reading-tex");

// Every published reading, as the build resolves it.
const COURSES = new Map(require("../tools/build-daily-reading").loadDailyReading().courses.map(item => [D.gradeKey(item.grade), item]));
const KEYS = [...COURSES.keys()];
const course = key => COURSES.get(key);

// Every reader-facing string of a night, by field.
function fields(day, source) {
  const note = D.sourceNote(source);
  return [["title", day.title], ["workTitle", day.workTitle], ["author", day.author || source.author], ["translator", source.translator],
    ["context", day.context], ["contentNote", day.contentNote], ["focus", day.focus], ["challenge", day.challenge],
    ...day.blocks.map((block, i) => ["block " + i, block.text]), ...day.questions.map(question => ["prompt " + question.id, question.prompt]),
    ["credit", note.credit], ["rights", note.rights], ["linkText", note.linkText]].filter(([, value]) => value);
}

test("every character in every published reading is typeset faithfully", () => {
  const unsupported = new Map();
  let nights = 0, characters = 0;
  for (const key of KEYS) {
    const data = course(key);
    for (const day of data.days) {
      const source = D.sourceAt(data, day);
      nights++;
      for (const [field, value] of fields(day, source)) for (const character of value) {
        characters++;
        if (!T.support(character)) unsupported.set(character, day.id + " " + field);
      }
      T.nightTeX(T.entry(data, day, T.schoolMeta(data.grade, day)));
    }
  }
  assert.deepEqual([...unsupported].map(([character, where]) => "U+" + character.codePointAt(0).toString(16) + " in " + where), []);
  assert.ok(nights >= 13 * 180 && characters > 1e6, nights + " nights, " + characters + " characters");
});

test("only nights with Greek or Cyrillic need XeLaTeX", () => {
  const xelatex = [];
  for (const key of KEYS) {
    const data = course(key);
    for (const day of data.days) if (T.nightTeX(T.entry(data, day, "x")).engine === "xelatex") xelatex.push(day.id);
  }
  assert.deepEqual(xelatex, ["reading-12-w13-d4"]);
});

test("characters print as LaTeX's own commands, never dropped or replaced", () => {
  const state = T.context();
  assert.equal(T.text("café — “quoted” ½ °C £5", state), "caf\\'e \\textemdash{} \\textquotedblleft{}quoted\\textquotedblright{} \\textonehalf{} \\textdegree{}C \\textsterling{}5");
  // TeX skips spaces after a command name; an empty group keeps the space.
  assert.equal(T.text("Bird?\u201d said Stra\u00dfe", state), "Bird?\\textquotedblright{} said Stra\\ss{}e");
  assert.equal(T.text("a--b ``c'' ----", state), "a-{}-b `{}`c'{}' -{}-{}-{}-");
  assert.equal(T.text("{}$&#%_^~\\<>|", state), "\\{\\}\\$\\&\\#\\%\\_\\textasciicircum{}\\textasciitilde{}\\textbackslash{}\\textless{}\\textgreater{}\\textbar{}");
  assert.equal(T.text("a b", state), "a~b");
  assert.equal(state.script, false);
  assert.equal(T.text("the name (οὐρανός)", state), "the name (\\liminalscript{οὐρανός})");
  assert.equal(state.script, true);
  for (const character of ["­", "​", "中", "\u{1f600}", "́", "−"]) {
    assert.throws(() => T.text("x" + character, T.context("reading-x")), /Cannot typeset U\+[0-9A-F]{4,5} .* in reading-x/, JSON.stringify(character));
  }
  const all = T.characters();
  assert.ok(all.latin.length > 400 && all.script.length > 400);
  for (const character of [...all.latin, ...all.script]) T.text(character, T.context());
});

test("the two engines share the packet style and Latin fonts", () => {
  const pdf = T.preamble("pdflatex"), xe = T.preamble("xelatex");
  for (const line of [String.raw`\usepackage[T1]{fontenc}`, String.raw`\usepackage{lmodern}`]) {
    assert.ok(pdf.split("\n").includes(line) && xe.split("\n").includes(line), line);
  }
  assert.doesNotMatch(pdf, /fontspec|FreeSerif/);
  assert.ok(xe.indexOf("fontspec") < xe.indexOf("{fontenc}"), "fontspec loads before T1 so Latin Modern stays the text font");
  assert.equal(pdf.replace(T.FONTS.pdflatex, ""), xe.replace(T.FONTS.xelatex, ""));
  assert.throws(() => T.preamble("lualatex"), /unknown TeX engine/);
});

const source = { id: "s", author: "Ann Author", title: "A Book", translator: null, translationYear: null, publicationYear: 1901, url: "https://example.org/b" };
const night = (id, extra = {}) => ({ id, week: 1, day: 1, title: "Night " + id, sourceId: "s", readingMode: "independent",
  time: { readingMinutes: 10, discussionMinutes: 5, totalMinutes: 15 }, focus: "F.", challenge: "C.", context: "Ctx.", contentNote: null,
  excerpt: { continuesFrom: null, continuesTo: null }, blocks: [{ type: "paragraph", text: "Text." }],
  questions: [{ id: "q1", prompt: "Why?", facilitatorNotes: ["FACILITATOR_SECRET"], evidence: ["EVIDENCE_SECRET"] }], ...extra });

test("levels start on fresh sheets and every night numbers its own pages", () => {
  const levels = [{ nights: [{ day: night("a"), source, meta: "Grade 1 · Thu" }, { day: night("b"), source, meta: "Grade 1 · Fri" }] },
    { nights: [{ day: night("c"), source, meta: "Grade 2 · Thu" }] }];
  const { tex, engine, nights } = T.documentTeX(levels);
  assert.equal(engine, "pdflatex"); assert.equal(nights, 3);
  assert.equal(tex.match(/\\cleardoublepage\n\\typeout\{LIMINAL-LEVEL-START \\the\\value\{page\}\}/g).length, 2);
  assert.equal(tex.match(/^\\clearpage$/gm).length, 1);
  assert.equal(tex.match(/\\edef\\paperstart\{\\the\\value\{page\}\}/g).length, 3);
  assert.ok(tex.includes(String.raw`\renewcommand{\papermeta}{Grade 2 \textperiodcentered{} Thu}`));
  assert.doesNotMatch(tex, /FACILITATOR_SECRET|EVIDENCE_SECRET/);
  assert.equal(T.dayTeX([levels[0].nights[0], levels[1].nights[0]]).tex.match(/LIMINAL-LEVEL-START/g).length, 2);
  assert.equal(T.nightsTeX(levels[0].nights).tex.match(/LIMINAL-LEVEL-START/g).length, 1);
  assert.throws(() => T.documentTeX([]), /at least one level/);
  assert.throws(() => T.nightTeX({ day: night("a"), source, meta: "" }), /footer metadata/);
  assert.equal(tex.match(/LIMINAL-READING-START/g).length, 3);
});

test("the print view's document starts every reading on an odd page, level by level", () => {
  const levels = [{ nights: ["a", "b", "c"].map(id => ({ day: night(id), source, meta: "Grade 1 · " + id })) }, { nights: [{ day: night("d"), source, meta: "Grade 2 · d" }] }];
  const { tex, nights, oddStarts } = T.printTeX(levels);
  assert.equal(nights, 4); assert.equal(oddStarts, true);
  assert.equal(tex.match(/^\\cleardoublepage$/gm).length, 4); assert.doesNotMatch(tex, /^\\clearpage$/m);
  assert.equal(tex.match(/LIMINAL-LEVEL-START/g).length, 2); assert.equal(tex.match(/LIMINAL-READING-START/g).length, 4);
  assert.deepEqual([...tex.matchAll(/\\papermeta\}\{Grade (\d) \\textperiodcentered\{\} (\w)\}/g)].map(match => match[1] + match[2]), ["1a", "1b", "1c", "2d"]);
  // check-pdf holds the typeset document to the same rule, from the log.
  const { inspect } = require("../tools/check-pdf");
  const pdf = new TextEncoder().encode("%PDF-1.5\n%%EOF"), log = pages => "Output written on main.pdf (9 pages)\n" + pages;
  assert.deepEqual(inspect(pdf, log("LIMINAL-LEVEL-START 1\nLIMINAL-READING-START 1\nLIMINAL-READING-START 3\nLIMINAL-LEVEL-START 5\nLIMINAL-READING-START 5"), 2, { nights: 3, oddStarts: true }).problems, []);
  assert.deepEqual(inspect(pdf, log("LIMINAL-LEVEL-START 1\nLIMINAL-READING-START 1\nLIMINAL-READING-START 2"), 1, { nights: 2, oddStarts: true }).problems, ["nights start on even pages 2"]);
  assert.deepEqual(inspect(pdf, log("LIMINAL-LEVEL-START 1\nLIMINAL-READING-START 1\nLIMINAL-READING-START 2"), 1, { nights: 2 }).problems, []);
  assert.deepEqual(inspect(pdf, log("LIMINAL-LEVEL-START 1\nLIMINAL-READING-START 1"), 1, { nights: 2 }).problems, ["2 nights but 1 reading starts"]);
});

test("continued nights print their own title, the work, and their place in the run", () => {
  const data = course("k");
  const titles = ["reading-k-w03-d5", "reading-k-w04-d1", "reading-k-w04-d2"].map(id => {
    const day = data.days.find(item => item.id === id), tex = T.nightTeX(T.entry(data, day, "K")).tex;
    return /\{\\LARGE\\bfseries ([^\n]*)\\par\}/.exec(tex)[1] + " | " + /\\vspace\{1\.4ex\}\n([^\n]*)/.exec(tex)[1] + " | " + (/\{\\small (Part [^\n]*)\\par\}/.exec(tex) || [])[1];
  });
  assert.deepEqual(titles, [
    "The Three Bears, part 1: three bowls of porridge | {\\small from \\emph{The Story of the Three Bears}\\par}\\vspace{0.6ex} | Part 1 of 3 \\textperiodcentered{} continues the next night",
    "The Three Bears, part 2: a pattern leaves clues | {\\small from \\emph{The Story of the Three Bears}\\par}\\vspace{0.6ex} | Part 2 of 3 \\textperiodcentered{} continued from the previous night",
    "The Three Bears, part 3: following the evidence upstairs | {\\small from \\emph{The Story of the Three Bears}\\par}\\vspace{0.6ex} | Part 3 of 3 \\textperiodcentered{} continued from the previous night",
  ]);
  // Every continued night in every grade has a distinct printed title within its run.
  for (const key of KEYS) {
    const all = course(key), seen = new Map();
    for (const day of all.days) {
      const run = T.runOf(all.days, day);
      if (!run) continue;
      const printed = /\{\\LARGE\\bfseries ([^\n]*)\\par\}/.exec(T.nightTeX(T.entry(all, day, "x")).tex)[1];
      assert.ok(!seen.has(printed) || seen.get(printed) === day.id, key + ": " + day.id + " repeats " + seen.get(printed) + "'s title " + printed);
      seen.set(printed, day.id);
    }
  }
  const alone = T.nightTeX({ day: night("a"), source, meta: "m" }).tex;
  assert.doesNotMatch(alone, /Part \d|continue/);
});

test("a translator is named with the author in the title block", () => {
  const translated = T.nightTeX({ day: night("a"), source: { ...source, translator: "T. Translator", translationYear: 1905 }, meta: "m" }).tex;
  assert.match(translated, /\{\\large Ann Author\\par\}\\vspace\{0\.8ex\}\n\{\\small Translated by T\. Translator\\par\}/);
  assert.doesNotMatch(T.nightTeX({ day: night("a"), source, meta: "m" }).tex, /Translated by/);
});

test("emphasis in a small-capitals heading is italic, never a substituted shape", () => {
  const tex = T.blocks({ blocks: [{ type: "heading", text: "A _CAROL_ for οὐρανός" }] }, T.context());
  assert.equal(tex, "\\begin{center}\\textsc{A {\\ulcshape\\itshape CAROL} for \\liminalscript{\\ulcshape\\upshape οὐρανός}}\\end{center}");
});

test("source links must be plain ASCII URLs", () => {
  const linked = T.nightTeX({ day: night("a"), source: { ...source, url: "https://example.org/a%41b#c" }, meta: "m" }).tex;
  assert.ok(linked.includes(String.raw`\href{https://example.org/a\%41b\#c}{\nolinkurl{example.org/a\%41b\#c}}`));
  assert.throws(() => T.nightTeX({ day: night("a"), source: { ...source, url: "https://example.org/{x}" }, meta: "m" }), /source link/);
});
