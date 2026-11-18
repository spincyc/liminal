/* Printed reading packets as TeX: one night, several nights, or one day across
 * several levels, in the fixed packet style of docs/reading-packets.md.
 * Pure and DOM-free, loadable in Node and the browser. tools/reading-packet.js
 * (local TeX) and the page's Generate PDF action (WebAssembly TeX, see
 * docs/printing.md) both typeset what it returns.
 *
 * Every character prints as written or the generator throws. Latin text is
 * set in Latin Modern (T1) through LaTeX's own character commands, so
 * pdfLaTeX needs no input encoding; a document that also holds Greek or
 * Cyrillic is set by XeLaTeX with the same Latin fonts and those words in
 * FreeSerif. Nothing is dropped or replaced, and facilitator notes and
 * evidence never reach print.
 */
(function (root, factory) {
  const api = factory(root.LiminalDailyReading || (typeof require === "function" ? require("./daily-reading") : null));
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalReadingTeX = api;
})(typeof window === "object" ? window : globalThis, function (D) {
  "use strict";

  // The fixed packet style. Changing any of it changes what families print,
  // so test/reading-packet.test.js pins these lines; update
  // docs/reading-packets.md and the test together.
  const STYLE = String.raw`\documentclass[10pt,twocolumn,twoside,letterpaper]{article}
\usepackage[letterpaper,top=0.75in,bottom=0.8in,left=0.75in,right=0.75in,columnsep=0.28in,headsep=0.25in]{geometry}
%FONTS%
\usepackage[protrusion=true]{microtype}
\usepackage{fancyhdr,enumitem}
\usepackage[hidelinks,bookmarks=false,pdfpagelabels=false]{hyperref}
\nofiles
\tracinglostchars=2
\setlength{\parindent}{1.2em}
\setlength{\parskip}{0pt}
\setlist[enumerate]{leftmargin=1.6em,itemsep=1ex}
\makeatletter
\def\cleardoublepage{\clearpage\if@twoside\ifodd\c@page\else\hbox{}\thispagestyle{empty}\newpage\if@twocolumn\hbox{}\newpage\fi\fi\fi}
\renewenvironment{verse}{\let\\\@centercr\list{}{\itemsep\z@\itemindent-1.5em\listparindent\itemindent\rightmargin\leftmargin\advance\leftmargin1.5em\topsep0.6ex\parsep0.9ex}\raggedright\item\relax}{\endlist}
\newcommand{\readingsectionrule}{\vspace{-0.6ex}\noindent\rule{\linewidth}{0.35pt}\par\nobreak\vspace{0.8ex}\@afterindentfalse\@afterheading}
\makeatother
\newcommand{\readingsource}[1]{\par\addvspace{1.5ex}\noindent\begin{minipage}{\linewidth}\footnotesize\raggedright\hrule height0.35pt\vspace{0.8ex}\textbf{Source.} #1\par\end{minipage}\par}
\newcommand{\paperstart}{1}
\newcommand{\papermeta}{}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[C]{\scriptsize \papermeta \quad Liminal \quad\the\numexpr\value{page}-\paperstart+1\relax}
\renewcommand{\headrulewidth}{0pt}
`;
  const FONTS = {
    pdflatex: String.raw`\usepackage[T1]{fontenc}
\usepackage{lmodern}`,
    // fontspec first, so T1 Latin Modern stays the text font; FreeSerif is
    // used only for Greek and Cyrillic words, which never hyphenate. It is
    // named by file, so TeX finds it without a system font installation.
    xelatex: String.raw`\usepackage{fontspec}
\newfontfamily\liminalscriptfont{FreeSerif}[Extension=.otf,UprightFont=*,BoldFont=*Bold,ItalicFont=*Italic,BoldItalicFont=*BoldItalic,HyphenChar=None]
\newcommand{\liminalscript}[1]{{\liminalscriptfont #1}}
\usepackage[T1]{fontenc}
\usepackage{lmodern}`,
  };
  const ENGINES = Object.freeze(Object.keys(FONTS));
  function preamble(engine) {
    if (!FONTS[engine]) throw new Error("unknown TeX engine " + engine);
    return STYLE.replace("%FONTS%", FONTS[engine]);
  }

  // LaTeX's own command for each supported character beyond ASCII, from
  // LaTeX's utf8enc.dfu, t1enc.dfu and ts1enc.dfu (TeX Live 2026), less
  // the invisible ones (soft hyphen, joiners, byte-order mark) and those
  // LaTeX would print as another letter (U+1E9E as SS, CJK brackets).
  // U+2015 HORIZONTAL BAR prints as LaTeX prints it, with the em dash glyph:
  // Latin Modern has no separate bar. tools/check-pdf.js typesets every
  // entry in every font shape the packet uses.
  const LICR_TABLE =
    "100 \\=A|101 \\=a|102 \\u A|103 \\u a|104 \\k A|105 \\k a|106 \\'C|107 \\'c|108 \\^C|109 \\^c|110 \\DJ|111 \\dj|" +
    "112 \\=E|113 \\=e|114 \\u E|115 \\u e|116 \\.E|117 \\.e|118 \\k E|119 \\k e|120 \\.G|121 \\.g|122 \\c G|123 \\c g|" +
    "124 \\^H|125 \\^h|128 \\~I|129 \\~\\i|130 \\.I|131 \\i|132 \\IJ|133 \\ij|134 \\^J|135 \\^\\j|136 \\c K|137 \\c k|" +
    "139 \\'L|141 \\L|142 \\l|143 \\'N|144 \\'n|145 \\c N|146 \\c n|147 \\v N|148 \\v n|150 \\H O|151 \\H o|152 \\OE|" +
    "153 \\oe|154 \\'R|155 \\'r|156 \\c R|157 \\c r|158 \\v R|159 \\v r|160 \\v S|161 \\v s|162 \\c T|163 \\c t|" +
    "164 \\v T|165 \\v t|168 \\~U|169 \\~u|170 \\H U|171 \\H u|172 \\k U|173 \\k u|174 \\^W|175 \\^w|176 \\^Y|177 \\^y|" +
    "178 \\\"Y|179 \\'Z|192 \\textflorin|218 \\textcommabelow S|219 \\textcommabelow s|232 \\=Y|233 \\=y|237 \\j|" +
    "2010 -|2012 \\textendash|2013 \\textendash|2014 \\textemdash|2015 \\textemdash|2016 \\textbardbl|" +
    "2018 \\textquoteleft|2019 \\textquoteright|2020 \\textdagger|2021 \\textdaggerdbl|2022 \\textbullet|" +
    "2026 \\textellipsis|2030 \\textperthousand|2031 \\textpertenthousand|2039 \\guilsinglleft|" +
    "2044 \\textfractionsolidus|2052 \\textdiscount|2103 \\textcelsius|2116 \\textnumero|2117 \\textcircledP|" +
    "2120 \\textservicemark|2122 \\texttrademark|2126 \\textohm|2127 \\textmho|2190 \\textleftarrow|" +
    "2191 \\textuparrow|2192 \\textrightarrow|2193 \\textdownarrow|2329 \\textlangle|2422 \\textblank|" +
    "2423 \\textvisiblespace|a0 ~|a1 \\textexclamdown|a2 \\textcent|a3 \\textsterling|a4 \\textcurrency|" +
    "a5 \\textyen|a6 \\textbrokenbar|a7 \\textsection|a8 \\textasciidieresis|a9 \\textcopyright|" +
    "aa \\textordfeminine|ab \\guillemetleft|ac \\textlnot|ae \\textregistered|af \\textasciimacron|" +
    "b0 \\textdegree|b1 \\textpm|b2 \\texttwosuperior|b3 \\textthreesuperior|b4 \\textasciiacute|b5 \\textmu|" +
    "b6 \\textparagraph|b7 \\textperiodcentered|b8 \\c\\ |b9 \\textonesuperior|ba \\textordmasculine|" +
    "bb \\guillemetright|bc \\textonequarter|bd \\textonehalf|be \\textthreequarters|bf \\textquestiondown|" +
    "c0 \\`A|c1 \\'A|c2 \\^A|c3 \\~A|c4 \\\"A|c5 \\r A|c6 \\AE|c7 \\c C|c8 \\`E|c9 \\'E|ca \\^E|cb \\\"E|cc \\`I|cd \\'I|" +
    "ce \\^I|cf \\\"I|d0 \\DH|d1 \\~N|d2 \\`O|d3 \\'O|d4 \\^O|d5 \\~O|d6 \\\"O|d7 \\texttimes|d8 \\O|d9 \\`U|da \\'U|" +
    "db \\^U|dc \\\"U|dd \\'Y|de \\TH|df \\ss|e0 \\`a|e1 \\'a|e2 \\^a|e3 \\~a|e4 \\\"a|e5 \\r a|e6 \\ae|e7 \\c c|e8 \\`e|" +
    "e9 \\'e|ea \\^e|eb \\\"e|ec \\`\\i|ed \\'\\i|ee \\^\\i|ef \\\"\\i|f0 \\dh|f1 \\~n|f2 \\`o|f3 \\'o|f4 \\^o|f5 \\~o|f6 \\\"o|" +
    "f7 \\textdiv|f8 \\o|f9 \\`u|fa \\'u|fb \\^u|fc \\\"u|fd \\'y|fe \\th|ff \\\"y|10a \\.C|10b \\.c|10c \\v C|10d \\v c|" +
    "10e \\v D|10f \\v d|11a \\v E|11b \\v e|11c \\^G|11d \\^g|11e \\u G|11f \\u g|12a \\=I|12b \\=\\i|12c \\u I|" +
    "12d \\u\\i|12e \\k I|12f \\k i|13a \\'l|13b \\c L|13c \\c l|13d \\v L|13e \\v l|14a \\NG|14b \\ng|14c \\=O|" +
    "14d \\=o|14e \\u O|14f \\u o|15a \\'S|15b \\'s|15c \\^S|15d \\^s|15e \\c S|15f \\c s|16a \\=U|16b \\=u|16c \\u U|" +
    "16d \\u u|16e \\r U|16f \\r u|17a \\'z|17b \\.Z|17c \\.z|17d \\v Z|17e \\v z|1c4 D\\v Z|1c5 D\\v z|1c6 d\\v z|" +
    "1c7 LJ|1c8 Lj|1c9 lj|1ca NJ|1cb Nj|1cc nj|1cd \\v A|1ce \\v a|1cf \\v I|1d0 \\v \\i|1d1 \\v O|1d2 \\v o|" +
    "1d3 \\v U|1d4 \\v u|1e2 \\=\\AE|1e3 \\=\\ae|1e6 \\v G|1e7 \\v g|1e8 \\v K|1e9 \\v k|1ea \\k O|1eb \\k o|1f0 \\v\\j|" +
    "1f4 \\'G|1f5 \\'g|21a \\textcommabelow T|21b \\textcommabelow t|2c6 \\textasciicircum|2c7 \\textasciicaron|" +
    "2d8 \\textasciibreve|2d9 \\.{}|2db \\k{}|2dc \\textasciitilde|2dd \\textacutedbl|e3f \\textbaht|1e02 \\.B|" +
    "1e03 \\.b|1e0d \\d d|1e1e \\.F|1e1f \\.f|1e20 \\=G|1e21 \\=g|1e25 \\d h|1e30 \\'K|1e31 \\'k|1e37 \\d l|" +
    "1e43 \\d m|1e45 \\.n|1e47 \\d n|1e5b \\d r|1e63 \\d s|1e6d \\d t|1e8e \\.Y|1e8f \\.y|1e90 \\^Z|1e91 \\^z|" +
    "1ef2 \\`Y|1ef3 \\`y|201a \\quotesinglbase|201c \\textquotedblleft|201d \\textquotedblright|" +
    "201e \\quotedblbase|203a \\guilsinglright|203b \\textreferencemark|203d \\textinterrobang|" +
    "204e \\textasteriskcentered|20a1 \\textcolonmonetary|20a4 \\textlira|20a6 \\textnaira|20a9 \\textwon|" +
    "20ab \\textdong|20ac \\texteuro|20b1 \\textpeso|211e \\textrecipe|212e \\textestimated|232a \\textrangle|" +
    "25e6 \\textopenbullet|25ef \\textbigcircle|266a \\textmusicalnote|27e8 \\textlangle|27e9 \\textrangle|" +
    "fb00 ff|fb01 fi|fb02 fl|fb03 ffi|fb04 ffl|fb05 st|fb06 st";
  const LICR = new Map(LICR_TABLE.split("|").map(entry => {
    const space = entry.indexOf(" ");
    return [parseInt(entry.slice(0, space), 16), entry.slice(space + 1)];
  }));
  // ASCII characters with a meaning in TeX, or a T1 glyph other than their own.
  const ASCII = { "\\": "\\textbackslash", "{": "\\{", "}": "\\}", $: "\\$", "&": "\\&", "#": "\\#", "%": "\\%", _: "\\_",
    "^": "\\textasciicircum", "~": "\\textasciitilde", "<": "\\textless", ">": "\\textgreater", "|": "\\textbar", '"': "\\textquotedbl" };
  // Greek and Cyrillic that FreeSerif draws in all four faces the packet can
  // ask for (regular, italic, bold, bold italic), measured by typesetting
  // every assigned letter and sign of these blocks with the runtime's
  // FreeSerif. Combining marks are not included: text uses precomposed letters.
  const SCRIPT_RANGES = [[0x375, 0x375], [0x37a, 0x37a], [0x37e, 0x37e], [0x384, 0x38a], [0x38c, 0x38c], [0x38e, 0x3a1],
    [0x3a3, 0x3ce], [0x3d0, 0x3e1], [0x3f0, 0x3ff], [0x1f00, 0x1f15], [0x1f18, 0x1f1d], [0x1f20, 0x1f45], [0x1f48, 0x1f4d],
    [0x1f50, 0x1f57], [0x1f59, 0x1f59], [0x1f5b, 0x1f5b], [0x1f5d, 0x1f5d], [0x1f5f, 0x1f7d], [0x1f80, 0x1fb4], [0x1fb6, 0x1fc4],
    [0x1fc6, 0x1fd3], [0x1fd6, 0x1fdb], [0x1fdd, 0x1fef], [0x1ff2, 0x1ff4], [0x1ff6, 0x1ffe], [0x400, 0x482], [0x48a, 0x4f9]];
  const isScript = code => SCRIPT_RANGES.some(([low, high]) => code >= low && code <= high);
  // Character pairs that T1 fonts join into another glyph (-- is an en dash,
  // '' a closing quote): an empty group keeps each character as written.
  const LIGATURES = new Set(["--", "''", "``", ",,", "!`", "?`"]);

  function describe(character) {
    return "U+" + character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0") + " " + JSON.stringify(character);
  }
  // Whether one character can be typeset, and by which means.
  function support(character) {
    const code = character.codePointAt(0);
    if (character === "\n" || character === "\t" || code >= 0x20 && code < 0x7f) return "latin";
    if (LICR.has(code)) return "latin";
    if (isScript(code)) return "script";
    return null;
  }
  // Every supported character, for coverage documents and tests.
  function characters() {
    const latin = [];
    for (let code = 0x20; code < 0x7f; code++) latin.push(String.fromCharCode(code));
    for (const code of LICR.keys()) latin.push(String.fromCodePoint(code));
    const script = [];
    for (const [low, high] of SCRIPT_RANGES) for (let code = low; code <= high; code++) script.push(String.fromCodePoint(code));
    return { latin, script };
  }

  // A document's typesetting state: whether it needs XeLaTeX for any word,
  // and what it is typesetting (for the error a character would raise).
  function context(where) { return { script: false, where: where || "text" }; }

  // Text as TeX. Spaces and line breaks stay TeX spaces; a run of Greek or
  // Cyrillic is set in the script font. `options.quotes` keeps straight
  // double quotes straight (source tables' ditto marks).
  function text(value, state, options = {}) {
    const out = [];
    let previous = "", run = "";
    // FreeSerif has no small capitals: script words in a small-caps heading
    // are set upright.
    const flush = () => { if (run) { out.push("\\liminalscript{" + (options.upright ? "\\ulcshape\\upshape " : "") + run + "}"); run = ""; previous = ""; } };
    for (const character of String(value)) {
      const kind = support(character);
      if (!kind) throw new Error("Cannot typeset " + describe(character) + " in " + state.where + "; extend src/lib/reading-tex.js for it");
      if (kind === "script") { state.script = true; run += character; continue; }
      flush();
      const code = character.codePointAt(0);
      let tex = code < 0x7f ? ASCII[character] || character : LICR.get(code);
      if (character === '"' && options.quotes) tex = "\\textquotedbl";
      if (LIGATURES.has(previous + tex[0])) out.push("{}");
      // A command name ending in a letter is closed by an empty group, so a
      // following letter cannot join it and a following space still prints
      // (TeX skips every space after a command name).
      out.push(/\\[A-Za-z]+$/.test(tex) ? tex + "{}" : tex);
      previous = tex[tex.length - 1];
    }
    flush();
    return out.join("");
  }

  // Print-only typography, never wording: straight double quotes become
  // curly, as the packet style has always set them, and paired _underscores_,
  // a plain-text transcription convention, become italics.
  const curly = s => String(s).replace(/(^|[\s(\[{\u2014-])"/g, "$1\u201c").replace(/"/g, "\u201d");
  // In a small-caps heading, emphasis is italic: Latin Modern has no italic
  // small capitals, so emphasis leaves small capitals rather than letting
  // LaTeX substitute a slanted shape.
  function inline(value, state, smallcaps = false) {
    return curly(value).split(/_([^_\n]+?)_/).map((part, index) => !(index % 2) ? text(part, state, { upright: smallcaps })
      : smallcaps ? "{\\ulcshape\\itshape " + text(part, state) + "}" : "\\emph{" + text(part, state) + "}").join("");
  }
  const lineStart = s => /^[[*]/.test(s) ? "{}" + s : s;
  function verse(value, state) {
    return value.split("\n").map(line => {
      const [, lead, rest] = line.match(/^(\s*)(.*)$/), indent = lead.replace(/\t/g, "    ").length;
      return (indent ? "\\hspace*{" + (indent * 0.5).toFixed(1) + "em}" : "") + lineStart(inline(rest, state));
    }).join("\\\\\n");
  }
  // A tab-separated source table (D.tableRows) as a tabular. Its cells keep
  // their characters: ditto marks stay straight, not curled into quotes.
  function table(rows, state) {
    const width = Math.max(...rows.map(row => row.cells.length));
    const cell = (value, row) => (row.header ? "\\textit{" : "{") + text(value, state, { quotes: true }) + "}";
    const spec = width > 1 ? "@{}" + "l".repeat(width - 1) + "p{0.4\\linewidth}@{}" : "@{}l@{}";
    const lines = rows.map(row => row.cells.length === 1
      ? "\\multicolumn{" + width + "}{@{}l}{" + cell(row.cells[0], row) + "}\\tabularnewline"
      : Array.from({ length: width }, (_, i) => (i === width - 1 && width > 1 ? "\\raggedright " : "") + cell(row.cells[i] || "", row)).join(" & ") + "\\tabularnewline");
    return "\\par\\smallskip\\noindent{\\small\\begin{tabular}{" + spec + "}\n" + lines.join("\n") + "\n\\end{tabular}}\\par\\smallskip\n";
  }
  function blocks(day, state) {
    const out = [];
    let inVerse = false;
    for (const block of day.blocks) {
      if (block.type === "stanza") {
        if (!inVerse) { out.push("\\begin{verse}"); inVerse = true; }
        out.push(verse(block.text, state) + "\n");
        continue;
      }
      if (inVerse) { out.push("\\end{verse}"); inVerse = false; }
      const rows = block.type === "paragraph" && D.tableRows(block.text);
      if (rows) { out.push(table(rows, state)); continue; }
      out.push(block.type === "heading" ? "\\begin{center}\\textsc{" + inline(block.text, state, true) + "}\\end{center}" : lineStart(inline(block.text, state)) + "\n");
    }
    if (inVerse) out.push("\\end{verse}");
    return out.join("\n");
  }

  const PRINT_MODES = { "adult-read-aloud": "Read aloud by an adult", shared: "Read together" };
  function link(url, label, state) {
    const safe = value => {
      if (!/^[\x21-\x7e]+$/.test(value) || /[{}\\^]/.test(value)) throw new Error("Cannot typeset the source link " + JSON.stringify(value) + " in " + state.where);
      return value.replace(/[%#]/g, "\\$&");
    };
    return "\\href{" + safe(url) + "}{\\nolinkurl{" + safe(label) + "}}";
  }

  // A continued night's place in its run: "Part 2 of 3 · continued from the
  // previous night". `run` ({ part, of }) is optional; without it only the
  // continuation is named.
  function continuation(day, run) {
    const excerpt = day.excerpt || {};
    if (!excerpt.continuesFrom && !excerpt.continuesTo) return null;
    const where = excerpt.continuesFrom ? "continued from the previous night" : "continues the next night";
    return (run && run.of > 1 ? "Part " + run.part + " of " + run.of + " · " : "") + where;
  }
  // The run a night belongs to, from the nights around it (a course's days):
  // follows continuesFrom/continuesTo by id. Null for a night that stands alone.
  function runOf(days, day) {
    const excerpt = day.excerpt || {};
    if (!excerpt.continuesFrom && !excerpt.continuesTo) return null;
    const byId = new Map((days || []).map(item => [item.id, item]));
    let first = day, part = 1, guard = 0;
    while (first.excerpt && first.excerpt.continuesFrom && byId.has(first.excerpt.continuesFrom) && guard++ < 1000) { first = byId.get(first.excerpt.continuesFrom); part++; }
    if (first.excerpt && first.excerpt.continuesFrom) return null;
    let last = day, of = part;
    while (last.excerpt && last.excerpt.continuesTo && byId.has(last.excerpt.continuesTo) && guard++ < 2000) { last = byId.get(last.excerpt.continuesTo); of++; }
    return last.excerpt && last.excerpt.continuesTo ? null : { part, of };
  }

  // One night as one paper: { day, source, meta, run }. `meta` is the
  // footer's description of the night (e.g. "Grade 5 · Week 3 · Day 1"),
  // supplied by the caller; `run` is its place in a continued reading. Only
  // reader-facing fields are used: the titles, credits, text, context,
  // content note, focus, challenge and question prompts.
  function paper(entry, state, { newSheet = false, oddStart = false } = {}) {
    const { day, source, meta } = entry;
    if (!day || !source) throw new Error("a printed night needs its reading and source");
    if (typeof meta !== "string" || !meta.trim()) throw new Error("a printed night needs its footer metadata");
    state.where = day.id;
    // The selection's own title, so each night of a continued work is
    // distinct; the work it comes from is named beneath when the title does not.
    const title = day.title.replace(/\s+—\s+excerpt$/, "");
    const work = D.selectionCredit(day, source).workTitle;
    const fromWork = work && !title.toLowerCase().includes(work.toLowerCase()) ? work : null;
    const continued = continuation(day, entry.run);
    const note = D.sourceNote(source);
    const reference = inline(note.credit, state) + ". " + inline(note.rights, state) + (note.url ? " " + link(note.url, note.linkText, state) : "");
    const estimate = "About " + day.time.totalMinutes + " min · read " + day.time.readingMinutes + " + discuss " + day.time.discussionMinutes;
    return [newSheet || oddStart ? "\\cleardoublepage" : "\\clearpage",
      ...(newSheet ? ["\\typeout{LIMINAL-LEVEL-START \\the\\value{page}}"] : []), "\\typeout{LIMINAL-READING-START \\the\\value{page}}",
      "\\edef\\paperstart{\\the\\value{page}}", "\\setcounter{section}{0}", "\\renewcommand{\\papermeta}{" + text(meta, state) + "}",
      "\\twocolumn[{\\begin{center}",
      "{\\LARGE\\bfseries " + inline(title, state) + "\\par}\\vspace{1.4ex}",
      ...(fromWork ? ["{\\small from \\emph{" + text(fromWork, state) + "}\\par}\\vspace{0.6ex}"] : []),
      "{\\large " + text(day.author || source.author, state) + "\\par}\\vspace{0.8ex}",
      ...(source.translator ? ["{\\small Translated by " + text(source.translator, state) + "\\par}\\vspace{0.6ex}"] : []),
      ...(continued ? ["{\\small " + text(continued, state) + "\\par}"] : []),
      ...(PRINT_MODES[day.readingMode] ? ["{\\small\\itshape " + text(PRINT_MODES[day.readingMode], state) + "\\par}"] : []),
      "\\end{center}", "\\vspace{0.6ex}",
      "\\begin{center}\\begin{minipage}{0.78\\textwidth}\\small", "\\centerline{\\bfseries Abstract}\\vspace{0.6ex}",
      "\\noindent " + inline(day.focus, state) + " " + inline(day.challenge, state), "\\end{minipage}\\end{center}", "\\vspace{1.2ex}}]",
      "\\section{Context}", inline(day.context, state) + (day.contentNote ? "\n\n\\noindent\\textit{Content note.} " + inline(day.contentNote, state) : ""), "",
      "\\section{Text}\\readingsectionrule", blocks(day, state), "",
      "\\section{Questions for discussion}\\readingsectionrule", "\\begin{enumerate}", ...day.questions.map(question => "\\item " + inline(question.prompt, state)), "\\end{enumerate}", "",
      "\\readingsource{" + reference + "\\par\\smallskip\\noindent " + text(estimate, state) + "}", ""].join("\n");
  }

  // A document of levels, each a list of nights. Every level starts on a
  // fresh sheet (an odd page, with a blank verso inserted when needed), so
  // two-sided printing never puts two levels on one sheet; every night starts
  // a new page, or with `oddStarts` a fresh sheet too, and numbers its pages
  // from 1. Returns the TeX source and the engine it needs: pdfLaTeX unless a
  // word needs the script font.
  function documentTeX(levels, { oddStarts = false } = {}) {
    if (!Array.isArray(levels) || !levels.length || levels.some(level => !level || !Array.isArray(level.nights) || !level.nights.length)) {
      throw new Error("a printed document needs at least one level with at least one night");
    }
    const state = context();
    const body = levels.map(level => level.nights.map((entry, i) => paper(entry, state, { newSheet: i === 0, oddStart: oddStarts })).join("\n")).join("\n");
    const engine = state.script ? "xelatex" : "pdflatex";
    return { tex: preamble(engine) + "\\begin{document}\n" + body + "\\end{document}\n", engine, oddStarts: !!oddStarts,
      levels: levels.length, nights: levels.reduce((sum, level) => sum + level.nights.length, 0) };
  }
  const nightTeX = entry => documentTeX([{ nights: [entry] }]);
  const nightsTeX = entries => documentTeX([{ nights: entries }]);
  const dayTeX = entries => documentTeX(entries.map(entry => ({ nights: [entry] })));
  // The print view's document: levels in order, each level's readings in date
  // order, every reading starting on an odd page.
  const printTeX = levels => documentTeX(levels, { oddStarts: true });

  // A night with its source resolved from a course or week slice, and its
  // place in a continued reading when the course holds the whole run.
  function entry(course, day, meta, run) {
    const source = D.sourceAt(course, day);
    if (!source) throw new Error("unresolved source for " + (day && day.id));
    return { day, source, meta, run: run === undefined ? runOf(course.days, day) : run };
  }
  // The footer for a school night, e.g. "Grade 5 · Week 7 · Day 4 · Thu, Oct 8".
  function schoolMeta(grade, day, date) {
    const longDate = date ? new Date(date + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }) : null;
    return D.gradeLabel(grade) + " · Week " + day.week + " · Day " + day.day + (longDate ? " · " + longDate : "");
  }

  return { ENGINES, STYLE, FONTS, preamble, support, characters, text, inline, verse, table, blocks, paper,
    documentTeX, nightTeX, nightsTeX, dayTeX, printTeX, entry, schoolMeta, context, continuation, runOf };
});
