// Turns a built test form into printable artifacts. The model step is shared
// so the HTML booklet, the answer key, and the LaTeX source always number and
// letter questions identically. Pure: loaded by the build script (ACT forms)
// and by the booklet page, which passes the site's own renderer for figures
// and SAT template forms (see `render` under HTML below).
(function (root, factory) {
  const api = factory(
    typeof module === "object" && module.exports
      ? require("./core.js")
      : root.PracticeCore,
    typeof module === "object" && module.exports ? require("./assessment") : root.LiminalAssessment,
    typeof module === "object" && module.exports ? require("./assessment-adapters") : root.LiminalAssessmentAdapters,
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PracticeBooklet = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (core, Assessment, Adapters) {
  "use strict";

// `options.code`, when given, is the form's rebuild code (SAT template forms,
// lib/modules.js): it is printed on the cover and the key, and the short form
// label is derived from it.
function buildModel(form, blueprint, seed, options) {
  const settings = options || {};
  const assessment = Adapters.practiceForm(form);
  const numbered = Assessment.entries(assessment);
  const totals = Assessment.totals(assessment);
  const sections = assessment.sections.map((section, index) => {
    const group = section.source;
    const questions = numbered.filter(entry => entry.section === section).map(({ item, number }) => {
      const question = item.source;
      const letters = core.answerLetters(blueprint.test, number);
      return {
        number,
        letters,
        question,
        correctLetter:
          question.responseType === "multiple-choice"
            ? letters[question.correctAnswer]
            : null,
      };
    });
    return {
      index,
      label: group.label,
      minutes: group.minutes,
      directions: group.directions,
      questions,
      firstNumber: questions.length ? questions[0].number : null,
      lastNumber: questions.length ? questions[questions.length - 1].number : null,
    };
  });

  return {
    blueprint,
    seed,
    code: settings.code || null,
    // Scoped to the blueprint so one shared seed does not print the same form
    // code on an SAT booklet and an ACT booklet.
    formCode: formCode(settings.code || `${blueprint.id}-${seed}`),
    sections,
    total: totals.items,
    minutes: totals.minutes,
  };
}

// A short, human-quotable label so a printed booklet can be matched back to
// the seed that produced it.
function formCode(seed) {
  let hash = 2166136261;
  String(seed).split("").forEach((character) => {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(-7);
}

// The section after which the one break falls, or null for a form with no
// break (a mini test, one SAT section, one module).
function breakSection(model) {
  const after = model.blueprint.breakAfter;
  return Number.isInteger(after) && after >= 0 && after < model.sections.length - 1
    ? model.sections[after]
    : null;
}

/* ------------------------------------------------------------ stimulus text */

// Stimulus content is plain text. Consecutive pipe-delimited lines are data
// tables and bullet runs are lists; everything else is a paragraph.
function parseBlocks(text) {
  const blocks = [];
  const lines = String(text || "").split("\n");
  let buffer = [];
  let mode = null;

  function flush() {
    if (!buffer.length) return;
    blocks.push({ type: mode, lines: buffer });
    buffer = [];
    mode = null;
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flush();
      return;
    }
    const next = line.includes("|") ? "table" : line.startsWith("•") ? "list" : "text";
    if (mode && next !== mode) flush();
    mode = next;
    buffer.push(line);
  });
  flush();

  return blocks.map((block) => {
    if (block.type === "table") {
      const rows = block.lines
        .filter((line) => !(/^[\s|:-]+$/.test(line) && line.includes("-")))
        .map((line) => {
          const text = line.startsWith("|") && line.endsWith("|") ? line.slice(1, -1) : line;
          return text.split("|").map((cell) => cell.trim());
        });
      if (!rows.length) return { type: "text", text: block.lines.join(" ") };
      return {
        type: "table",
        rows,
      };
    }
    if (block.type === "list") {
      return {
        type: "list",
        items: block.lines.map((line) => line.replace(/^•\s*/, "")),
      };
    }
    return { type: "text", text: block.lines.join(" ") };
  });
}

/* -------------------------------------------------------------------- HTML */

// Content is plain text and is always escaped; quotes too, since some of it
// lands in attributes.
function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function blocksToHtml(text, options) {
  const inline = options && options.inline || escapeHtml;
  return parseBlocks(text)
    .map((block) => {
      if (block.type === "table") {
        const [head, ...body] = block.rows;
        const headHtml = head
          .map((cell) => `<th>${inline(cell)}</th>`)
          .join("");
        const bodyHtml = body
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`,
          )
          .join("");
        return `<table class="data"><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
      }
      if (block.type === "list") {
        return `<ul>${block.items
          .map((item) => `<li>${inline(item)}</li>`)
          .join("")}</ul>`;
      }
      return `<p>${inline(block.text)}</p>`;
    })
    .join("");
}

function repeatedStimulus(question, previous) {
  if (!previous || !question.stimulus || !previous.question.stimulus) return false;
  const before = previous.question;
  if ((question.passageId || before.passageId) && question.passageId !== before.passageId) return false;
  return question.stimulus.content === before.stimulus.content;
}

// A shared passage figure prints with its first question. Separate questions
// without a passage id keep their own figures, even when the SVG is identical.
function repeatedFigure(question, previous) {
  if (!question.passageId || !repeatedStimulus(question, previous)) return false;
  const figure = question.figure;
  const before = previous.question.figure;
  return Boolean(figure && before && figure.svg === before.svg &&
    figure.alt === before.alt && Boolean(figure.notToScale) === Boolean(before.notToScale));
}

function figureDescription(figure) {
  return String(figure.alt || "Figure").trim() || "Figure";
}

function figureFallbackHtml(figure) {
  return `<figure class="lm-figure"><p class="lm-figure-fallback">Diagram description (drawing unavailable): ${escapeHtml(figureDescription(figure))}</p>` +
    (figure.notToScale ? '<figcaption class="lm-figure-note">Note: Figure not drawn to scale.</figcaption>' : "") +
    "</figure>";
}

// How question content becomes HTML. Without `render`, content is escaped
// plain text and stimuli go through parseBlocks above (ACT bank forms). All
// figures retain a text fallback when no renderer is supplied. The booklet
// page passes `render` for figures and SAT template forms, so a booklet shows
// exactly what the practice screen shows (app/render.js: math typesetting,
// real tables, sanitized figures):
//   render.rich(text, question)          block content: stems, choices, explanations
//   render.stimulus(stimulus, question)  a { type, content } stimulus
//   render.figure(figure, question)      a { svg, alt, notToScale } figure
// Each returns markup serialized from escaped text and allow-listed
// elements, never content strings inserted as HTML.
function passageSection(question) {
  return ["act-english", "act-reading", "act-science"].includes(question.sectionKey);
}

// Only consecutive questions with the same passage share a context heading.
// This range is independent of question IDs and retains the printed numbers.
function passageLastNumber(items, index) {
  let last = index;
  while (last + 1 < items.length && repeatedStimulus(items[last + 1].question, items[index])) last += 1;
  return items[last].number;
}

function questionHtml(item, previous, render, lastNumber) {
  const { number, letters } = item;
  const question = Adapters.practiceStudent(item.question);
  const rich = Boolean(render && render.rich);
  const shared = passageSection(question);
  const repeated = repeatedStimulus(question, previous);
  const newPassage = shared && question.stimulus && question.stimulus.content && !repeated;
  const heading = `<h3 class="question-heading entry-heading">Question ${number}</h3>`;
  const parts = [`<article class="q${rich ? " rich" : ""}" id="q${number}">`];
  // SAT passages and figures belong to one problem; its number comes first.
  // ACT passage sets identify their whole range before flowing across columns.
  if (!shared) parts.push(heading);
  if (newPassage) {
    parts.push('<div class="passage-context">');
    parts.push(`<h3 class="passage-label">${lastNumber > number ? `Questions ${number}–${lastNumber} refer` : `Question ${number} refers`} to the following ${question.sectionKey === "act-science" ? "information" : "passage"}.</h3>`);
  }
  if (question.stimulus && question.stimulus.content && !repeated) {
    parts.push(
      `<div class="stimulus ${escapeHtml(question.stimulus.type)}">` +
        (render && render.stimulus
          ? render.stimulus(question.stimulus, question)
          : blocksToHtml(question.stimulus.content)) +
        `</div>`,
    );
  }
  if (question.figure && !repeatedFigure(question, previous)) {
    const figureHtml = render && render.figure
      ? render.figure(question.figure, question)
      : figureFallbackHtml(question.figure);
    if (figureHtml) parts.push(`<div class="figure">${figureHtml}</div>`);
  }
  if (newPassage) parts.push("</div>");
  // Shared ACT context may flow, while a normal stem and its choices stay
  // together. Oversized questions can still fragment instead of clipping.
  if (shared) parts.push('<div class="question-body">', heading);
  parts.push(`<div class="stem"><div class="body">${rich
    ? render.rich(question.stem, question) : escapeHtml(question.stem)}</div></div>`);
  if (question.responseType === "multiple-choice" && question.choices) {
    parts.push(
      `<ol class="choices">${question.choices.map((choice, index) =>
        `<li><span class="letter">${letters[index]}.</span><div class="body">${rich
          ? render.rich(choice, question) : escapeHtml(choice)}</div></li>`).join("")}</ol>`,
    );
  } else if (question.responseType === "numeric") {
    parts.push('<p class="gridin">Student-produced response: <span class="rule"></span></p>');
  }
  if (["sat-math", "act-mathematics"].includes(question.sectionKey)) {
    parts.push('<div class="work-space" aria-hidden="true"></div>');
  }
  if (shared) parts.push("</div>");
  parts.push("</article>");
  return parts.join("");
}

// One row per question: answer bubbles, or a box to write a
// student-produced response in.
function answerSheetHtml(model) {
  return model.sections
    .map((section) => {
      const rows = section.questions
        .map(
          (item) =>
            `<li><span class="asnum">${item.number}</span>` +
            (item.question.responseType === "numeric"
              ? '<span class="write-in"></span>'
              : item.letters
                .map((letter) => `<span class="bubble">${letter}</span>`)
                .join("")) +
            `</li>`,
        )
        .join("");
      return (
        `<div class="as-section"><h3>${escapeHtml(section.label)}</h3>` +
        `<ol class="as-grid">${rows}</ol></div>`
      );
    })
    .join("");
}

// Inline, background-free identity keeps downloaded booklets self-contained.
const BRAND_HTML = '<div class="booklet-brand"><svg viewBox="0 0 28 34" fill="none" aria-hidden="true" focusable="false"><path d="M3 32V15a11 11 0 0 1 22 0v17M10 32V15a4 4 0 0 1 8 0v17" stroke="currentColor" stroke-width="2.5"/><path d="M0 32h28" stroke="currentColor" stroke-width="2.5"/></svg><span>Liminal.</span></div>';

const BOOKLET_CSS = `
@page { size: letter; margin: 0.6in 0.55in 0.7in; }
:root { --ink: #000; --rule: #000; }
* { box-sizing: border-box; }
body {
  margin: 0; color: var(--ink); background: #fff;
  font-family: var(--booklet-serif, "CMU Serif", "Latin Modern Roman", Georgia, serif);
  font-size: 10pt; line-height: 1.3; text-rendering: optimizeLegibility;
}
h1, h2, h3 { font-weight: 700; margin: 0 0 .4em; line-height: 1.2; }
.booklet-brand { display: flex; align-items: center; gap: 6pt; margin-bottom: 10pt; color: #000; font-size: 22pt; font-weight: 400; line-height: 1; letter-spacing: -.06em; }
.booklet-brand svg { flex: none; width: 18pt; height: 22pt; }
/* At least one page, so the test-cover footer sits at its foot. */
.cover { min-height: 9.4in; display: flex; flex-direction: column; break-after: page; }
/* Keys flow normally so an oversized grid can continue onto another page. */
.key-cover { min-height: 0; display: block; }
.cover h1 { font-size: 26pt; letter-spacing: .01em; margin-bottom: .1em; }
.cover .sub { font-size: 12pt; font-style: italic; margin-bottom: 1.6em; }
.meta { border-top: 1.5pt solid var(--ink); border-bottom: .5pt solid var(--rule);
  padding: .6em 0; display: flex; gap: 2em; flex-wrap: wrap; font-size: 9.5pt; }
.meta div { min-width: 1.4in; }
.meta dt { font-variant: small-caps; letter-spacing: .06em; }
.meta dd { margin: 0; font-size: 11pt; }
.directions { margin: 1.4em 0; max-width: 6in; }
.directions li { margin-bottom: .35em; }
.schedule { border-collapse: collapse; margin: 1em 0; font-size: 9.5pt; }
.schedule th, .schedule td { border-bottom: .5pt solid var(--rule); padding: .32em .9em .32em 0; text-align: left; }
.schedule th { font-variant: small-caps; letter-spacing: .05em; font-weight: 700; }
.section-head { break-before: page; break-inside: avoid; break-after: avoid; border-bottom: 1.5pt solid var(--ink);
  padding-bottom: .5em; margin-bottom: .9em; }
.section-head h2 { font-size: 15pt; }
.section-head .timing { font-style: italic; }
.section-head .dirs { margin-top: .5em; font-size: 9.3pt; max-width: 6.6in; }
.questions { column-count: 2; column-gap: .38in; column-rule: .45pt solid #999;
  column-fill: auto; orphans: 3; widows: 3; }
.q { break-inside: avoid; page-break-inside: avoid; margin: 0 0 14pt; }
/* One real block border for every numbered entry, including answer keys.
   Keep the rule attached to its heading across print columns and pages;
   avoid a separately fragmented flex item or generated decoration. */
.entry-heading { display: block; margin: 0 0 7pt; padding-bottom: 4pt;
  border-bottom: .75pt solid #000; font-size: 10pt; font-weight: 700;
  line-height: 1.2; break-inside: avoid; break-after: avoid; }
.passage-context { border-left: .65pt solid #777; padding-left: 8pt; margin: 0 0 12pt;
  box-decoration-break: clone; }
.passage-label { margin: 0 0 8pt; font-size: 9pt; font-style: italic; break-after: avoid; }
.work-space { min-height: .3in; break-before: avoid; }

/* ACT passage sections keep each stem and its choices in question-body.
   Longer context may flow across columns without stranding a section title. */
.q:has(> .question-body) { break-inside: auto; page-break-inside: auto; }
.question-body { break-inside: avoid; page-break-inside: avoid; }
.stem { margin: 0 0 6pt; }
.choices { list-style: none; margin: 0; padding: 0; }
.choices li { display: flex; align-items: baseline; gap: 5pt; margin: 0 0 3pt; }
.choices .letter { flex: 0 0 1.2em; font-weight: 700; }
.choices .body { flex: 1 1 auto; min-width: 0; }

/* Passage and table structure survives printing with backgrounds disabled. */
.stimulus { margin: 0 0 8pt; font-size: inherit; }
.stimulus p { margin: 0 0 .35em; }
.stimulus p:last-child, .stimulus table:last-child { margin-bottom: 0; }
.lm-ul u { text-decoration-thickness: .6pt; text-underline-offset: 2pt; }
.lm-ul-n, .lm-ul-marker { display: inline; margin-inline: 2pt; font-size: 7.5pt; font-weight: 700;
  line-height: 1; vertical-align: super; }
.lm-ul-marker { border: .5pt solid #777; padding: 0 2pt; vertical-align: baseline; }
.stimulus ul { margin: 0 0 .35em 1em; padding: 0; }
table.data { border-collapse: collapse; margin: .35em 0; font-size: 8.8pt; width: 100%; }
table.data th, table.data td { border: .6pt solid var(--rule); padding: .16em .4em; text-align: left; }
table.data th { border-bottom: 1pt solid var(--rule); font-weight: 700; }
.gridin { margin: 8pt 0 0; line-height: 1.8; }
.gridin .rule { display: inline-block; width: 1.4in; border-bottom: .6pt solid var(--ink); }
.stop { text-align: center; font-variant: small-caps; letter-spacing: .12em;
  border-top: 1pt solid var(--ink); margin-top: 1em; padding-top: .5em; column-span: all; }
.answer-sheet { break-before: page; }
.as-wrap { column-count: 3; column-gap: .3in; }
.as-section { break-inside: avoid-column; margin-bottom: .7em; }
.as-section h3 { font-size: 9.5pt; font-variant: small-caps; letter-spacing: .05em;
  border-bottom: .5pt solid var(--rule); }
.as-grid { list-style: none; margin: 0; padding: 0; font-size: 8.4pt; }
.as-grid li { display: flex; align-items: center; gap: .16em; margin-bottom: .09em; }
/* Four labeled sections and 50-answer ACT groups fit below the key title
   without shrinking the type or leaving a title-only first page. */
.key-cover .as-wrap { column-count: 4; }
.key-cover .as-grid { line-height: 1.2; }
.asnum { width: 1.5em; text-align: right; margin-right: .25em; }
.bubble { display: inline-flex; align-items: center; justify-content: center;
  width: 1.28em; height: 1.28em; border: .65pt solid var(--ink); border-radius: 50%;
  font-size: 6.6pt; }
.write-in { display: inline-block; width: 5.4em; height: 1.28em; border: .65pt solid var(--ink); border-radius: 2pt; }
.key-grid { column-count: 5; column-gap: .3in; font-size: 9pt; }
.key-grid li { break-inside: avoid; }
.exp { break-inside: avoid; margin-bottom: 14pt; }
.exp .tag { font-variant: small-caps; letter-spacing: .05em; font-size: 8.4pt; }
/* Rendered explanations run long; kept whole, most would leave half a
   column empty. They may split, but never right after their heading. */
.exp.rich { break-inside: auto; }
.exp.rich h4, .exp.rich .tag { break-after: avoid; }
.exp ol { margin: .2em 0 .2em 1.1em; padding: 0; }
.cover-note { max-width: 6in; margin: 0 0 1em; padding-left: .6em; border-left: 2pt solid var(--rule); font-size: 9.3pt; }
.form-code { margin: 1em 0 0; max-width: 6.4in; font-size: 9pt; }
.form-code dt { font-variant: small-caps; letter-spacing: .06em; }
.form-code dd { margin: 0 0 .3em; }
.form-code code { font-family: "Courier New", Courier, monospace; font-size: 9pt; word-break: break-all; }
.key-part { break-before: page; }
.key-part > h2 { font-size: 15pt; }
/* Content from the site's renderer (app/render.js), for template forms. */
/* Choice letters keep a fixed gutter and follow the first text baseline,
   including choices beginning with a typeset fraction. */
.inline > .lm-rich, .inline > .lm-rich > p:only-child { display: inline; }
.lm-rich > * + *, .lm-stimulus > * + * { margin-top: .35em; }
.lm-rich p, .lm-stimulus p { margin: 0; }
.lm-passage-title { margin: 0; font-size: 9.6pt; font-weight: 700; text-align: center; }
.lm-passage-label { margin: 0; font-weight: 700; }
.lm-list { margin: 0 0 0 1.1em; padding: 0; }
.lm-equations { display: flex; flex-direction: column; align-items: center; gap: .15em; }
.lm-equation { margin: 0; font-variant-numeric: tabular-nums; white-space: pre-wrap; }
.lm-table { margin: .4em auto; border-collapse: collapse; font-size: 9pt; max-width: 100%; }
.lm-table th, .lm-table td { padding: .22em .4em; border: .6pt solid var(--rule); text-align: center; }
.lm-table thead th { border-bottom: 1pt solid var(--rule); font-weight: 700; }
.lm-table tbody th { font-weight: 700; text-align: left; }
.figure { margin: 0 0 .45em; break-inside: avoid; page-break-inside: avoid; }
.lm-figure { break-inside: avoid; display: flex; flex-direction: column; align-items: center; margin: 0; color: var(--ink); }
.lm-figure svg { display: block; width: 100%; height: auto; max-height: 2.6in; overflow: visible; }
/* Authored figures already use currentColor, dash patterns and distinct
   markers. Strengthen their faint grid and region treatments for copying,
   preserving hollow points, unfilled shapes and different series fills. */
.lm-figure [stroke-width="1"] { stroke-width: 1.25; }
.lm-figure [stroke-opacity="0.18"], .lm-figure [stroke-opacity="0.2"],
.lm-figure [stroke-opacity="0.25"] { stroke-opacity: .55; }
.lm-figure [fill-opacity="0.16"] { fill-opacity: .24; }
.lm-figure-note { margin-top: .2em; font-size: 8.4pt; font-style: italic; }
.lm-figure-fallback { padding: .4em; border: .5pt dashed var(--rule); }
/* Typeset Math (renderText with { math: true }), after src/styles/math.css
   with its tokens resolved, since a downloaded booklet carries no other
   stylesheet. Each piece's spoken form (.lm-math-sr) is visually hidden on
   screen and left out of print, or every fraction would print twice. */
.lm-math { font-variant-numeric: lining-nums; }
.lm-math-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0, 0, 0, 0); clip-path: inset(50%); white-space: nowrap; border: 0; }
.lm-math-power { position: relative; top: -.5em; margin-left: .04em; font-size: .8em;
  line-height: 0; vertical-align: baseline; }
.lm-math-power .lm-math-power { font-size: .9em; }
.lm-math-stack { display: inline-flex; max-width: 100%; flex-direction: column; align-items: stretch;
  margin: 0 .1em; font-size: .92em; line-height: 1.2; text-align: center; vertical-align: middle; }
.lm-math-num, .lm-math-den { display: block; padding: 0 .2em; }
.lm-math-num { padding-bottom: .1em; border-bottom: max(1px, .065em) solid currentColor; }
.lm-math-den { padding-top: .12em; }
.lm-math-stack .lm-math-stack { font-size: 1em; }
.lm-math-fence { white-space: nowrap; }
.lm-math-fence > .lm-math-bracket { display: inline-block; transform: scaleY(1.55); transform-origin: 50% 55%; }
.lm-math-radical { display: inline-flex; align-items: stretch; max-width: 100%; }
.lm-math-index { position: relative; top: -.2em; align-self: flex-start; margin-right: -.3em;
  margin-left: .05em; font-size: .8em; line-height: 1; }
.lm-math-sign { flex: none; width: .62em; height: auto; overflow: visible; fill: none;
  stroke: currentColor; stroke-linejoin: round; stroke-width: max(1px, .065em);
  vector-effect: non-scaling-stroke; }
.lm-math-sign path { vector-effect: non-scaling-stroke; }
.lm-math-radicand { align-self: baseline; padding: .1em .12em 0 .06em;
  border-top: max(1px, .065em) solid currentColor; line-height: 1.15; }
@media screen {
  body { background: #d8d4cc; padding: 24px 0; }
  .page { background: #fff; max-width: 7.5in; margin: 0 auto; padding: .5in;
    box-shadow: 0 2px 18px rgba(0,0,0,.22); }
}
@media print {
  .page { padding: 0; max-width: none; }
  .noprint, .lm-math-sr { display: none; }
  /* Section headings already start fresh pages. The spanning end label can
     otherwise spill onto a page of its own after a full question column. */
  .stop { display: none; }
}
`;

function shell(title, body, options) {
  const settings = options || {};
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
${settings.fontLicense ? `<meta name="font-license" content="${escapeHtml(settings.fontLicense)}">` : ""}
<style>${BOOKLET_CSS}\n${settings.styles || ""}</style>
</head><body><div class="page">${body}</div></body></html>
`;
}

// The rebuild code, where the form has one.
function formCodeHtml(model) {
  if (!model.code) return "";
  return `<dl class="form-code">
    <dt>Form code</dt><dd><code>${escapeHtml(model.code)}</code></dd>
    <dd>To rebuild this booklet and its answer key, open Printable booklets and
    paste the code under Rebuild from code.</dd>
  </dl>`;
}

// The answer key grid and the explanations, one section per form section.
function keyParts(model, render) {
  const rich = Boolean(render && render.rich);
  const grid = model.sections
    .map(
      (section) =>
        `<div class="as-section"><h3>${escapeHtml(section.label)}</h3><ol class="as-grid">` +
        section.questions
          .map(
            (item) =>
              `<li><span class="asnum">${item.number}</span> <strong>${
                item.correctLetter || escapeHtml(String(item.question.correctAnswer))
              }</strong></li>`,
          )
          .join("") +
        `</ol></div>`,
    )
    .join("");

  const explanations = model.sections
    .map(
      (section) =>
        `<div class="section-head"><h2>${escapeHtml(section.label)} — explanations</h2></div>` +
        `<div class="questions">` +
        section.questions
          .map((item) => {
            const q = item.question;
            const text = (value) => (rich ? render.rich(value, q) : escapeHtml(value));
            // Rich content is a block; "inline" lets a one-paragraph block
            // sit on the line of its label.
            const li = rich ? '<li class="inline">' : "<li>";
            const steps = (q.solutionSteps || [])
              .map((step) => `${li}${text(step)}</li>`)
              .join("");
            const traps = (q.distractorRationales || [])
              .map(
                (row) =>
                  `${li}${item.letters[row.index]}. ${text(row.reason)}</li>`,
              )
              .join("");
            return `<div class="exp${rich ? " rich" : ""}">
        <h4 class="explanation-heading entry-heading">${item.number}. Correct answer: ${
          item.correctLetter || escapeHtml(String(q.correctAnswer))
        }</h4>
        <p class="tag">${[q.domain, q.skill, core.supportsDifficulty(q.sectionKey) ? q.difficulty : null, q.id].filter(Boolean).map(escapeHtml).join(" · ")}</p>
        ${rich ? `<div>${text(q.explanation)}</div>` : `<p>${text(q.explanation)}</p>`}
        ${steps ? `<ol>${steps}</ol>` : ""}
        ${traps ? `<p class="tag">Why the others fail</p><ul>${traps}</ul>` : ""}
        ${rich ? `<div class="inline"><em>Trap:</em> ${text(q.trap)}</div>` : `<p><em>Trap:</em> ${text(q.trap)}</p>`}
      </div>`;
          })
          .join("") +
        `</div>`,
    )
    .join("");

  return { grid, explanations };
}

// The test booklet: cover, one part per section, the answer sheet, and,
// with `options.key`, the answer key and explanations at the end.
// `options.render`: see questionHtml.
function renderBookletHtml(model, options) {
  const settings = options || {};
  const { blueprint } = model;
  const pause = breakSection(model);
  const schedule = model.sections
    .map(
      (section) =>
        `<tr><td>${escapeHtml(section.label)}</td>` +
        `<td>${section.questions.length} questions</td>` +
        `<td>${section.minutes ? `${section.minutes} minutes` : "—"}</td>` +
        `<td>${section.firstNumber}–${section.lastNumber}</td></tr>`,
    )
    .join("");

  const notes = (blueprint.notes || [])
    .map((note) => `<p class="cover-note">${escapeHtml(note)}</p>`)
    .join("");

  const cover = `<div class="cover">
  ${BRAND_HTML}
  <h1>${escapeHtml(blueprint.label)}</h1>
  <p class="sub">${escapeHtml(blueprint.summary)}</p>${notes}
  <dl class="meta">
    <div><dt>Form</dt><dd>${escapeHtml(model.formCode)}</dd></div>
    <div><dt>Questions</dt><dd>${model.total}</dd></div>
    <div><dt>Testing time</dt><dd>${model.minutes} min</dd></div>
    <div><dt>Sections</dt><dd>${model.sections.length}</dd></div>
  </dl>
  <div class="directions">
    <h3>Directions</h3>
    <ol>
      <li>Work one section at a time and observe each section's time limit. Do not
        move ahead to another section or return to a section once its time expires.</li>
      <li>Mark every answer on the answer sheet at the back of this booklet. Answers
        written in the booklet are not scored.</li>
      <li>There is no penalty for a wrong answer, so answer every question.</li>${pause ? `
      <li>Take one ten-minute break after
        ${escapeHtml(pause.label)}.</li>` : ""}
    </ol>
  </div>
  <table class="schedule">
    <thead><tr><th>Section</th><th>Length</th><th>Time</th><th>Numbers</th></tr></thead>
    <tbody>${schedule}</tbody>
  </table>${formCodeHtml(model)}
  <p style="margin-top:auto;font-size:8.4pt">Original practice content.
  Not affiliated with, endorsed by, or published by the College Board or ACT, Inc.
  Accuracy practice only — this form does not produce a scaled score.</p>
</div>`;

  const sections = model.sections
    .map(
      (section) => `<div class="section-head">
    <h2>${escapeHtml(section.label)}</h2>
    <p class="timing">${section.questions.length} questions · ${section.minutes} minutes ·
      questions ${section.firstNumber}–${section.lastNumber}</p>
    <p class="dirs">${escapeHtml(section.directions)}</p>
  </div>
  <div class="questions">${section.questions.map((item, index) => questionHtml(item, section.questions[index - 1], settings.render, passageLastNumber(section.questions, index))).join("")}
    <p class="stop">End of ${escapeHtml(section.label)}</p>
  </div>`,
    )
    .join("");

  const writeIn = model.sections.some((section) =>
    section.questions.some((item) => item.question.responseType === "numeric"));
  const sheet = `<div class="answer-sheet">
  <h2>Answer sheet — form ${escapeHtml(model.formCode)}</h2>
  <p class="dirs">Fill in one bubble per question${writeIn ? "; write each student-produced response in its box" : ""}. Erase changes completely.</p>
  <div class="as-wrap">${answerSheetHtml(model)}</div>
</div>`;

  let key = "";
  if (settings.key) {
    const parts = keyParts(model, settings.render);
    key = `<div class="key-part">
  <h2>Answer key — form ${escapeHtml(model.formCode)}</h2>
  <p class="dirs">Grade the answer sheet before you read the explanations.
  Score by accuracy only.</p>
  <div class="as-wrap">${parts.grid}</div>
</div>${parts.explanations}`;
  }

  return shell(`${blueprint.label} — form ${model.formCode}`, cover + sections + sheet + key, settings);
}

// The answer key and explanations on their own. `options.render`: see
// questionHtml.
function renderKeyHtml(model, options) {
  const settings = options || {};
  const parts = keyParts(model, settings.render);
  const cover = `<div class="cover key-cover">
  ${BRAND_HTML}
  <h1>Answer key and explanations</h1>
  <p class="sub">${escapeHtml(model.blueprint.label)} — form ${escapeHtml(model.formCode)}</p>
  <div class="as-wrap">${parts.grid}</div>${formCodeHtml(model)}
  <p style="font-size:8.4pt">Score by accuracy only.
  Log every miss with the question id so it can be found again in the app.</p>
</div>`;

  return shell(
    `Answer key — ${model.blueprint.label} — form ${model.formCode}`,
    cover + parts.explanations, settings,
  );
}

/* ------------------------------------------------------------------- LaTeX */

// The banks are plain Unicode text, so every character is mapped to a macro
// that plain pdfLaTeX accepts. Escaping runs before substitution because the
// replacements themselves introduce backslashes and braces.
const TEX_SPECIALS = /[\\{}$&#%_~^]/g;
const TEX_SPECIAL_MAP = {
  "\\": "\\textbackslash{}",
  "{": "\\{",
  "}": "\\}",
  $: "\\$",
  "&": "\\&",
  "#": "\\#",
  "%": "\\%",
  _: "\\_",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};
const TEX_UNICODE = [
  ["\u201C", "``"],
  ["\u201D", "''"],
  ["\u2018", "`"],
  ["\u2019", "'"],
  ["\u2014", "---"],
  ["\u2013", "--"],
  ["\u2212", "$-$"],
  ["\u00B2", "\\textsuperscript{2}"],
  ["\u00B3", "\\textsuperscript{3}"],
  ["\u2075", "\\textsuperscript{5}"],
  ["\u2076", "\\textsuperscript{6}"],
  ["\u2082", "\\textsubscript{2}"],
  ["\u2083", "\\textsubscript{3}"],
  ["\u2084", "\\textsubscript{4}"],
  ["\u27E8", "$\\langle$"],
  ["\u27E9", "$\\rangle$"],
  ["\u2192", "$\\rightarrow$"],
  ["\u2022", "\\textbullet{}"],
  ["\u00B7", "$\\cdot$"],
  ["\u03B8", "$\\theta$"],
  ["\u03A9", "$\\Omega$"],
  ["\u03BC", "$\\mu$"],
  ["\u00B5", "$\\mu$"],
  ["\u00B0", "$^{\\circ}$"],
  ["\u00D7", "$\\times$"],
  ["\u03C0", "$\\pi$"],
  ["\u2113", "$\\ell$"],
  ["\u00B1", "$\\pm$"],
  ["\u2260", "$\\neq$"],
  ["\u2264", "$\\leq$"],
  ["\u2265", "$\\geq$"],
  ["\u00F7", "$\\div$"],
  ["\u2026", "\\ldots{}"],
  // Authored passages carry real names, so the accented Latin letters those
  // need are mapped rather than left to trip the ASCII guard in smoke-static.
  ["\u00E0", "\\`{a}"],
  ["\u00E1", "\\'{a}"],
  ["\u00E2", "\\^{a}"],
  ["\u00E4", "\\\"{a}"],
  ["\u00E3", "\\~{a}"],
  ["\u00E5", "{\\aa}"],
  ["\u00E7", "\\c{c}"],
  ["\u00E8", "\\`{e}"],
  ["\u00E9", "\\'{e}"],
  ["\u00EA", "\\^{e}"],
  ["\u00EB", "\\\"{e}"],
  ["\u00ED", "\\'{i}"],
  ["\u00EE", "\\^{i}"],
  ["\u00EF", "\\\"{i}"],
  ["\u00F1", "\\~{n}"],
  ["\u00F3", "\\'{o}"],
  ["\u00F4", "\\^{o}"],
  ["\u00F6", "\\\"{o}"],
  ["\u00F8", "{\\o}"],
  ["\u00FA", "\\'{u}"],
  ["\u00FB", "\\^{u}"],
  ["\u00FC", "\\\"{u}"],
  ["\u0107", "\\'{c}"],
  ["\u010D", "\\v{c}"],
  ["\u0159", "\\v{r}"],
  ["\u0161", "\\v{s}"],
  ["\u017E", "\\v{z}"],
];

function tex(value) {
  let out = String(value == null ? "" : value).replace(
    TEX_SPECIALS,
    (character) => TEX_SPECIAL_MAP[character],
  );
  // A radical binds to the token that follows it in the source text.
  out = out.replace(/\u221A\s*([0-9]+(?:\.[0-9]+)?|[A-Za-z])/g, "$\\sqrt{$1}$");
  out = out.replace(/\u221A/g, "$\\surd$");
  TEX_UNICODE.forEach(([character, macro]) => {
    out = out.split(character).join(macro);
  });
  return out;
}

// The CLI passes the practice renderer's existing ACT annotation parser.
// Underline words individually so long marked phrases can still line-wrap,
// without requiring a new TeX package.
function inlineTex(text, options) {
  if (!(options && options.parseUnderlines)) return tex(text);
  return options.parseUnderlines(text).map((segment) => {
    if (segment.marker !== undefined) return `\\fbox{\\scriptsize ${segment.marker}}`;
    if (segment.underline !== undefined) {
      const marked = segment.text.split(/(\s+)/).map((word) =>
        /^\s+$/.test(word) ? word : `\\underline{${tex(word)}}`).join("");
      return `${marked}\\textsuperscript{${segment.underline}}`;
    }
    return tex(segment.text);
  }).join("");
}

function blocksToTex(text, options) {
  return parseBlocks(text)
    .map((block) => {
      if (block.type === "table") {
        const columns = Math.max(...block.rows.map((row) => row.length));
        // Science tables have descriptive headers that must wrap inside a
        // booklet column; otherwise a valid table can overlap the next column.
        const wrap = options && options.wrapTables;
        const spec = wrap
          ? `*{${columns}}{>{\\raggedright\\arraybackslash}p{\\dimexpr\\linewidth/${columns}-2\\tabcolsep\\relax}}`
          : "l".repeat(columns);
        const body = block.rows
          .map((row, index) => {
            const cells = row.concat(Array(columns - row.length).fill(""));
            const line = cells.map((cell) => inlineTex(cell, options)).join(" & ");
            return index === 0 ? `${line} \\\\ \\hline` : `${line} \\\\`;
          })
          .join("\n");
        return `\\begin{center}\\small${wrap ? "\\setlength{\\tabcolsep}{3pt}" : ""}\\begin{tabular}{${spec}}\\hline\n${body}\n\\hline\\end{tabular}\\end{center}`;
      }
      if (block.type === "list") {
        return `\\begin{itemize}\\itemsep0pt\n${block.items
          .map((item) => `\\item ${inlineTex(item, options)}`)
          .join("\n")}\n\\end{itemize}`;
      }
      return inlineTex(block.text, options);
    })
    .join("\n\n");
}

function renderTex(model, options) {
  const settings = options || {};
  const { blueprint } = model;
  const body = model.sections
    .map((section) => {
      const questions = section.questions
        .map((item, index) => {
          const q = Adapters.practiceStudent(item.question);
          const before = section.questions[index - 1];
          const repeated = repeatedStimulus(q, before);
          const shared = passageSection(q);
          const parts = [];
          if (!shared) parts.push(`\\question{${item.number}}`);
          if (shared && q.stimulus && q.stimulus.content && !repeated) {
            const last = passageLastNumber(section.questions, index);
            const label = last > item.number ? `Questions ${item.number}--${last} refer` : `Question ${item.number} refers`;
            parts.push(`\\passageheading{${label} to the following ${q.sectionKey === "act-science" ? "information" : "passage"}.}`);
          }
          if (q.stimulus && q.stimulus.content && !repeated) {
            parts.push(
              `\\begin{stimulus}\n${blocksToTex(q.stimulus.content, {
                wrapTables: q.sectionKey === "act-science",
                parseUnderlines: q.sectionKey === "act-english" && settings.parseUnderlines,
              })}\n\\end{stimulus}`,
            );
          }
          if (q.figure && !repeatedFigure(q, before)) {
            parts.push(`\\begin{stimulus}\n\\textbf{Diagram description (drawing unavailable):} ${tex(figureDescription(q.figure))}` +
              (q.figure.notToScale ? "\n\n\\textit{Note: Figure not drawn to scale.}" : "") +
              "\n\\end{stimulus}");
          }
          if (shared) parts.push(`\\question{${item.number}}`);
          parts.push(`${tex(q.stem)}\\par\\nopagebreak[2]`);
          if (q.responseType === "multiple-choice" && q.choices) {
            parts.push(
              "\\begin{choices}\n" +
                q.choices.map((choice, index) => `\\item[${item.letters[index]}.] ${tex(choice)}`).join("\n") +
                "\n\\end{choices}",
            );
          } else if (q.responseType === "numeric") {
            parts.push("\\gridin");
          }
          if (["sat-math", "act-mathematics"].includes(q.sectionKey)) parts.push("\\par\\nopagebreak[2]\\vspace{.3in}");
          parts.push("\\par\\penalty0\\medskip");
          return parts.join("\n");
        })
        .join("\n\n");
      return `\\clearpage
\\normalsize
\\twocolumn[{
\\sectionhead{${tex(section.label)}}{${section.questions.length} questions \\quad ${
        section.minutes
      } minutes \\quad questions ${section.firstNumber}--${section.lastNumber}}{${tex(section.directions)}}
\\vspace{.6em}}]

${questions}

\\par\\medskip\\noindent\\textsc{End of ${tex(section.label)}}`;
    })
    .join("\n\n");

  const schedule = model.sections
    .map(
      (section) =>
        `${tex(section.label)} & ${section.questions.length} & ${section.minutes} min & ${
          section.firstNumber
        }--${section.lastNumber} \\\\`,
    )
    .join("\n");

  const answerSheet = model.sections.flatMap((section) => {
    // Keep headings with their rows without making full sections taller than
    // the page. Balance long sections across chunks of at most 25 answers.
    const chunkCount = Math.max(1, Math.ceil(section.questions.length / 25));
    const chunkSize = Math.ceil(section.questions.length / chunkCount);
    return Array.from({ length: chunkCount }, (unused, index) => {
      const rows = section.questions.slice(index * chunkSize, (index + 1) * chunkSize).map((item) => {
        const response = item.question.responseType === "numeric"
          ? "\\framebox[5.4em]{\\rule{0pt}{1.2em}}"
          : item.letters.map((letter) => `$\\bigcirc$~${tex(letter)}`).join("\\quad ");
        return `\\noindent\\makebox[2em][r]{${item.number}.}\\quad ${response}\\par\\smallskip`;
      }).join("\n");
      const label = section.label + (index ? " (continued)" : "");
      return `\\noindent\\begin{minipage}{\\columnwidth}\n\\subsection*{${tex(label)}}\n${rows}\n\\end{minipage}\\par\\medskip`;
    });
  }).join("\n\\columnbreak\n");

  return `% Generated by tools/build-booklet.js -- do not edit by hand.
% Compiles with pdflatex; no Unicode input is emitted.
\\documentclass[10pt,letterpaper,twocolumn]{article}
\\usepackage[margin=0.55in,top=0.6in,bottom=0.7in]{geometry}
\\usepackage{amsmath,amssymb,enumitem,multicol,fancyhdr,array,xcolor}
\\usepackage[T1]{fontenc}
\\setlength{\\columnsep}{0.38in}
\\setlength{\\columnseprule}{0.4pt}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.35em}
\\pagestyle{fancy}\\fancyhf{}
\\lhead{\\scriptsize\\scshape ${tex(blueprint.label)}}
\\rhead{\\scriptsize Form ${tex(model.formCode)}}
\\cfoot{\\scriptsize\\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

% A ruled number introduces the entire problem, including its context.
% No unbreakable box encloses a long passage or question.
% Reserve a few lines at the start so a heading and stem do not dangle.
\\newcommand{\\question}[1]{\\par
  \\ifdim\\dimexpr\\pagegoal-\\pagetotal\\relax<9\\baselineskip\\newpage\\fi
  \\addvspace{8pt}\\noindent\\textbf{Question #1}\\par\\nobreak
  \\vskip4pt\\hrule height .75pt\\nobreak\\vskip7pt}
\\newcommand{\\passageheading}[1]{\\par\\addvspace{8pt}\\noindent\\textbf{\\textit{#1}}\\par\\nobreak\\smallskip}
\\newenvironment{choices}
  {\\begin{list}{}{\\setlength{\\leftmargin}{1.8em}\\setlength{\\labelwidth}{1.2em}\\setlength{\\labelsep}{.6em}%
   \\setlength{\\itemsep}{3pt}\\setlength{\\parsep}{0pt}\\setlength{\\topsep}{4pt}}}
  {\\end{list}}
\\newenvironment{stimulus}
  {\\begingroup\\setlength{\\fboxsep}{4pt}\\begin{list}{}{\\setlength{\\leftmargin}{0.6em}%
   \\setlength{\\rightmargin}{0pt}\\setlength{\\topsep}{2pt}}\\item[]\\color{black!85}}
  {\\end{list}\\endgroup}
\\newcommand{\\gridin}{\\par\\smallskip{\\footnotesize Student-produced response:~\\rule{1.3in}{0.4pt}}\\par}
\\newcommand{\\sectionhead}[3]{%
  \\noindent{\\Large\\bfseries #1}\\par\\smallskip
  \\noindent\\textit{#2}\\par\\smallskip
  \\noindent\\rule{\\linewidth}{1pt}\\par\\smallskip
  \\noindent\\small #3\\par\\medskip}

\\begin{document}
\\onecolumn
\\thispagestyle{empty}
% The same doorway mark, drawn with standard LaTeX picture primitives.
\\begingroup\\setlength{\\unitlength}{0.65pt}\\thicklines
\\begin{picture}(28,34)
\\put(14,19){\\oval(22,22)[t]}\\put(14,19){\\oval(8,8)[t]}
\\put(3,2){\\line(0,1){17}}\\put(25,2){\\line(0,1){17}}
\\put(10,2){\\line(0,1){17}}\\put(18,2){\\line(0,1){17}}
\\put(0,2){\\line(1,0){28}}
\\end{picture}\\hspace{6pt}{\\LARGE\\rmfamily Liminal.}\\par\\endgroup\\medskip
{\\Huge\\bfseries ${tex(blueprint.label)}}\\par\\medskip
{\\large\\itshape ${tex(blueprint.summary)}}\\par\\bigskip
\\noindent\\rule{\\linewidth}{1.5pt}\\par\\smallskip
\\noindent\\textsc{Form} ${tex(model.formCode)} \\hfill \\textsc{Questions} ${
    model.total
  } \\hfill \\textsc{Testing time} ${model.minutes} minutes\\par\\smallskip
\\noindent\\rule{\\linewidth}{0.4pt}\\par\\bigskip

\\noindent\\textbf{Directions}
\\begin{enumerate}[leftmargin=1.4em,itemsep=2pt]
\\item Work one section at a time and observe each section's time limit.
\\item Mark every answer on the answer sheet at the back of this booklet.
\\item There is no penalty for a wrong answer, so answer every question.${
    breakSection(model) ? `
\\item Take one ten-minute break after ${tex(breakSection(model).label)}.` : ""
  }
\\end{enumerate}
\\bigskip

\\noindent\\begin{tabular}{llll}\\hline
\\textsc{Section} & \\textsc{Length} & \\textsc{Time} & \\textsc{Numbers} \\\\ \\hline
${schedule}
\\hline\\end{tabular}
\\vfill
\\noindent\\footnotesize Original practice content. Not affiliated with, endorsed by,
or published by the College Board or ACT, Inc.\\par

${body}

\\clearpage
\\onecolumn
\\section*{Answer sheet --- form ${tex(model.formCode)}}
\\noindent Fill in one bubble for each multiple-choice question; write each
student-produced response in its box.\\par\\medskip
\\begin{multicols}{3}
${answerSheet}
\\end{multicols}

\\end{document}
`;
}

  return {
    BOOKLET_CSS,
    blocksToHtml,
    blocksToTex,
    breakSection,
    buildModel,
    escapeHtml,
    formCode,
    parseBlocks,
    renderBookletHtml,
    renderKeyHtml,
    renderTex,
    tex,
  };
});
