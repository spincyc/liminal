# AP courses

Liminal's courses for AP® exams are 36-week weekly courses for AP® Calculus
AB, AP® Physics 1 and AP® Physics C: Mechanics. This document is the content
contract for their weekly coursework and figures. The general weekly contract
in [weekly coursework](weekly-coursework.md) still applies. Unit tests and
practice exams use their own assessment document type, documented in
[Assessments and the AP pages](#assessments-and-the-ap-pages).

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.

## Identity and files

| Item | Value |
| --- | --- |
| Track | `ap` (registry entry in `src/lib/weekly.js`, `NAMED_TRACKS.ap`) |
| Courses | `calculus-ab`, `physics-1`, `physics-c-mechanics`, in that order |
| Plan | `content/ap.json`, built to `content/ap-plan.js` (`LIMINAL_AP_PLAN`) and `content/ap-plan.json` |
| Weekly course | `content/weekly/ap/<courseId>.json`: `trackId: "ap"`, `courseId`, no `grade` |
| Figures | `content/weekly/figures/ap/<courseId>/<figureId>.svg` |
| Routes | `weeks.html#ap/<courseId>/<week>`; year-plan links go to `ap.html#<courseId>` and `ap.html#<courseId>/<unitId>` |
| Context line | "Prepares for the AP® exam · flexible placement" |
| IDs | items `ab-w05-a3`, figures `ab-w05-f2` (prefixes `ab`, `p1`, `cm`) |

`content/ap.json` follows the named-plan contract shared with
`content/high-school-math.json`: `version: 1`; `track { id: "ap", title,
description, scopeNote }`; `sources` (each with `id`, `title`, `publisher`,
`edition`, `note`, an HTTPS `url` and an `accessed` date); `standards` (each
with `id`, `label`, `sourceId`, `locator`, `gradeBand`, and `kind` of
`content`, `editorial-objective`, `practice` or `extension`); and exactly the
three courses, each with `title`, `scopeNote`, `nextStep`, `prerequisites`,
`outcomes` and `units` totalling 36 weeks. A unit has `id` (`u1`, `u2`, …),
`title`, `weeks`, `focus`, `bridge`, `learning`, `standards`, `activities` and
`evidence`. CED topics are standards of kind `content` (`AB.1.2`, `P1.8.4`,
`CM.2.9`); review weeks use editorial objectives. Every standard is mapped by
some unit, and every week's `standards` lie within its unit. Other fields
(exam facts, blueprints, notes) pass through for the plan page.

The AP track is outside the release inventory (`inventory: false`) until all
three courses land; then set `inventory: true` so `check-weekly --complete`
requires them.

## Weekly fields used by AP courses

All are optional fields of the weekly contract; the
[field table](weekly-coursework.md#optional-fields) is canonical.

- **Figures:** declare each figure on its week as `{ id, alt, caption?,
  notToScale? }` and reference it from `figureIds` (given, shown to students),
  `answerFigureIds` (key only: completed sketches, free-body diagrams, graphs
  students draw) or the week's `explanationFigureIds`. Alt text describes what
  is drawn; for a given figure it must not reveal the answer.
- **Multiple choice:** exactly four `choices` and a `key` letter `A`–`D`;
  `answer` and `steps` still explain the correct choice. Distractors differ
  from the key by more than rounding.
- **Free response:** `points` and an original `rubric` of
  `{ points, criterion }` rows summing to `points`. Rubrics award points for
  reasoning, not only final answers. Students see the point value; the rubric
  appears only in keys.
- **Calculator policy:** every AP worksheet sets `calculator`. Calculus AB uses
  `none` or `graphing`, matching the exam's split. Physics uses `any`
  (four-function, scientific or graphing, as on the exam). `scientific` is
  available for sheets that need only that.
- **Suggested time:** `minutes` on each sheet, sized for the items and the
  exam's pace.
- **Tables:** data and value tables are pipe tables in item or explanation
  text (see the weekly contract).

Student views and exports never contain keys, rubrics, answers, steps or
answer-only figures; `test/weekly-ap.test.js` and `test/weekly-ui.test.js`
enforce this.

## Figures

Make figures with the figure kit (`tools/lib/figure-kit.js`, tooling only)
from a script in your scratch directory, and commit only the SVG files:

```js
const K = require("<repo>/tools/lib/figure-kit");
const G = K.graph({ xMin: 0, xMax: 6, yMin: -2, yMax: 8, xName: "t (s)", yName: "v (m/s)" });
K.save("content/weekly/figures/ap/physics-1/p1-w03-f1.svg",
  K.svg(G.width, G.height, G.grid(), G.axes(), G.piecewise([[0, 0], [2, 6], [6, 6]])));
```

Or put `module.exports = K => ({ "p1-w03-f1": … })` in a spec file and run
`node tools/figure-kit.js build <spec.js> content/weekly/figures/ap/physics-1`.
`node tools/figure-kit.js check <file|dir>` admits existing files, and
`node tools/figure-kit.js gallery <dir>` renders a sample of every primitive.

| Group | Kit functions |
| --- | --- |
| Graphs (data coordinates) | `graph()` returning `grid`, `axes`, `curve`, `piecewise`, `segment`, `point`, `label`, `vline`, `hline`, `arrow`, `tangent`, `area` (between curves), `riemann` (`left`, `right`, `mid`, `trap`), `slopeField`; `piText` for radian ticks; `timeGraph()` for position, velocity and acceleration against time; `numberLine()`; `blankGrid()` for student plots |
| Mechanics (pixels) | `block`, `incline` (returns block position and slope directions for forces), `spring`, `pulley`, `rope`, `pendulum`, `fbd`, `vector`, `components`, `circularMotion`, `disk`, `rod`, `curvedArrow` (torque, rotation), `angleArc`, `dimension`, `ground`, `ceiling`, `wall`, `hatch` |
| Fluids and energy | `container` (with a floating or submerged object), `pipe` (narrowing flow), `barChart` (energy or momentum bars, blank columns allowed) |
| Low level | `svg`, `line`, `polyline`, `polygon`, `circle`, `rect`, `path`, `text` (`F_N`, `v_{0x}`, `x^2` sub/superscripts), `arrow`, `head`, `group` |

Admission (`tools/lib/weekly-figures.js`, run by the build) requires a
loss-free round trip through the renderer's allow-list, `currentColor` paint,
a positive `viewBox`, at most 12 KB per file, and the reference rules in the
weekly contract. Keep labels at least 12 px, mark figures that are not to
scale with `notToScale`, and inspect every figure as rendered (light and dark,
and printed) before committing. A course file, with its figures inlined, stays
within 2.5 MB.

## Conventions

State these in sheet directions where they matter:

- **Units:** SI throughout; every numeric physics answer carries a unit.
- **Gravity:** g = 9.8 m/s², or 10 m/s² only when an item says so.
- **Signs:** every vector problem states its positive direction.
- **Significant figures:** givens carry 2–3 significant figures; answers carry
  the givens' precision; keys accept ±1 in the last digit.
- **Calculus:** angles in radians; exact answers in no-calculator work; three
  decimal places in calculator work.
- **Notation:** plain-text math per the weekly contract (Unicode minus,
  `x^2`, no LaTeX).
- **Physics C: Mechanics** assumes calculus is studied alongside it: week 1 is
  a calculus toolkit, and later weeks teach the calculus they need in physical
  context before AB covers it.

## Sources and claims

- Authors and reviewers receive only `.scratch/ap-design/ced-topics.json`
  (unit and topic titles, weightings) and exam-format facts. Never give them,
  or quote, College Board course and exam description PDFs, released or
  sample questions, scoring guidelines, or equation sheets. College Board does
  not permit its copyrighted content to be used with generative AI.
- All items, data, contexts, rubrics and the physics formula references are
  original. No close paraphrases of released questions and no recognizable
  released free-response scenarios or data.
- No score predictions, no 1–5 conversions, and no "pass" or "5" promises.
  Practice materials report raw points only, labeled as practice.
- Never claim a Liminal course is an authorized AP course (that requires the
  AP Course Audit) or that it earns credit.
- The official AP physics courses require 25% of instructional time in
  hands-on lab work. Liminal's paper investigations do not satisfy that
  requirement, the AP Course Audit, or college lab-credit evidence; say so
  wherever investigations appear.
- Use the marks only to refer to the exams: as adjectives, never possessive or
  plural, with ® on first use, smaller than the Liminal name, and titles that
  identify Liminal as the source ("Course for AP® Calculus AB"). Every page
  and export that uses the marks carries the exact disclaimer above. The
  weekly reader adds it to its footer whenever AP courses are listed, and
  every AP worksheet export carries it.

## Assessments and the AP pages

### Files

| Path | Holds |
| --- | --- |
| `content/ap.json` | Plan metadata for the `ap` track: sources, standards (framework topics `AB.1.2`, `P1.8.4`, `CM.2.9` with kind `content`, plus editorial objectives `AB.REVIEW`, `AB.BEYOND`, `P1.REVIEW`, `P1.SYNTHESIS`, `CM.TOOLKIT`, `CM.REVIEW`, `CM.SYNTHESIS`), and three courses. Each course has `units` (the named-plan contract plus `unit`, `mcWeight`, `classPeriods`, `test`), a 36-entry `schedule` (`week`, `unitId`, `title`, `standards`, optional `assessment` and `investigation`), the `exam` block (May 2027 format, `sourceId`, `checked`), and `blueprints`. The weekly build validates it as the named plan and writes `content/ap-plan.js` (`LIMINAL_AP_PLAN`) and `content/ap-plan.json`. |
| `content/ap/assessments/<course>/unit-<n>.json`, `practice-exam.json` | One unit test per framework unit (8 / 8 / 7) and one practice exam per course. |
| `content/ap/figures/<course>/<figureId>.svg` | Assessment figures, admitted by `tools/lib/weekly-figures.js` (loss-free sanitizer round trip, `currentColor`, `viewBox`, 12 KB). Kept apart from weekly figures so each build's orphan check owns one directory. |
| `content/ap/references/<course>.json` | Physics formula references (Liminal's own grouping). |
| `src/lib/ap-assessment.js` | Pure model (`LiminalAp`): projections, tallies, blueprint and key checks, claims lint, routes. |
| `tools/check-ap.js` | Validator; `tools/build-ap.js` writes `dist/content/ap.js` (`LIMINAL_AP`: index of assessments and references) and `dist/content/ap/**`. |
| `src/ap.html`, `src/app/ap.js`, `src/app/ap-render.js`, `src/styles/ap.css` | The page. |

### Assessment contract (`liminal-ap-assessment` v1)

```
{ format, version: 1, courseId, id: "unit-<n>" | "practice-exam",
  kind: "unit-test" | "practice-exam", unitId: "u<n>" (unit tests only),
  title, author, directions,
  figures?: [{ id, alt, caption?, notToScale? }],
  sections: [{ id: "I" | "II", title, kind: "mc" | "fr",
    parts: [{ id: "A" | "B", title?, minutes, calculator, directions, items }] }] }
```

- Multiple choice: `{ id, prompt, choices[4], key: "A"–"D", rationale, distractorNotes?: { <each wrong letter>: text }, topics, figureIds?, answerFigureIds? }`.
- Free response: `{ id, prompt (shared stimulus), type? (physics: MR | TBR | EDA | QQT), context? (Calculus AB: real-world context), topics, figureIds?, answerFigureIds?, parts: [{ label: "a", "b", …, prompt, points, rubric: [{ points, criterion }], answer, steps[≥1], figureIds?, answerFigureIds? }] }`.
- Shared item model: `prompt`, `choices`, `key`, `points`, `rubric`, `answer`, `steps`, `figureIds` and `answerFigureIds` mean what they mean on weekly worksheet items. Multiple choice is worth 1 point; a free-response item is worth the sum of its parts.
- IDs: items `<ab|p1|cm>-<u<n>|pe>-mcNN` / `-frN`, numbered as printed (multiple choice 1…n across Section I, free response 1…m across Section II); figures `<prefix>-<u<n>|pe>-fN`.
- Calculator: Calculus AB parts are `none` or `graphing`; physics parts are `any`.
- Text is plain (no markup, no LaTeX delimiters) and renders through `LiminalRender.renderText` with math typesetting.
- The first topic of an item is its primary topic: it decides the unit in blueprints and tallies.

### Validator rules (`node tools/check-ap.js [--complete]`)

Always:

- Plan: three courses in order; units u1… total 36 weeks; each content unit's references are exactly its framework topics (C:M u1 adds `CM.TOOLKIT`); the last unit is the editorial review unit and holds the practice exam; every reference is mapped; each schedule week's references belong to its unit; every topic appears in a week; each unit's test sits in its last week and the practice exam in week 33; physics units each have a paper-investigation week; physics courses carry the lab note and a reference; course titles read "Course for AP® …"; `notice` is the exact disclaimer; sources have https URLs and accessed dates; the practice-exam `mcByUnit` totals 42 and every unit's share lies inside its framework weighting.
- Each assessment: format, path-matching `courseId`/`id`, kind and `unitId`; IDs as above; four distinct choices; key letter; rationale; distractor notes cover exactly the wrong letters; topics are framework topics of the course; physics FR types; parts labeled a, b, c…; rubric rows sum to each part's points; figures declared once, used, present on disk and admissible; given and answer-only figure sets disjoint; alt text does not contain the keyed choice; plain text.
- Blueprint (`LiminalAp.blueprintProblems`): unit tests use `blueprints.unitTest` (AB: I-A 8 none, I-B 4 graphing, II-A 1 graphing FR, II-B 1 none FR, 9 points each; physics: 12 MC and 2 FR of different types worth MR 10, TBR 12, EDA 10, QQT 8; 50–70 minutes in all); each item's primary topic is in the tested unit and no topic is from a later unit. Practice exams match the `exam` block exactly (counts, minutes, calculator per part), the multiple-choice count per unit, 9-point AB FR with at least two in context, and one physics FR of each type.
- Key balance (`LiminalAp.keyBalance`): each letter keys 15–35% of a test's multiple choice; the key is the unique longest choice in at most 40%.
- Duplicates: no displayed item (normalized prompt, choices in any order, figure drawings, FR part prompts) repeats across any course's unit tests, practice exams, or AP weekly examples and worksheet items (`content/weekly/ap/<course>.json`).
- Claims lint (`LiminalAp.claimProblems`) over the plan, assessments, references, AP weekly files, and the AP page copy: "guarantee" beside an outcome (score, pass, exam, AP, credit, grade, result, success, "a 5"; existence theorems and conservation laws may say "guarantees"), score prediction, "score a 5" and similar, 1–5 scale or scaled-score conversions, "official" (allowed when the sentence names College Board or Bluebook), endorsement or authorization claims, "pass the exam" or college-credit claims, and the mark used as a noun or possessive. A negated sentence passes ("not AP scores", "does not predict"), as does the disclaimer.
- Disclaimer: any page in the pages directory (default `src/`, `--pages dist` after a build) that shows "AP®" or "Advanced Placement" contains the exact disclaimer; `lib/weekly.js`'s `AP_DISCLAIMER` equals it.

With `--complete` (the release gate once the courses land): every unit test, practice exam and physics reference exists; every framework topic appears in at least one test item and in at least one weekly week; each physics FR type appears in at least three unit tests.

### Projections and scoring

- `LiminalAp.studentCopy(doc)` keeps prompts, choices, points and given figures only (allowlists), plus the answer-sheet model and section maxima. `LiminalAp.keyCopy(doc)` adds keys, rationales, distractor notes, topics, FR types and context, answers, steps, rubrics, answer-only figures, and maxima by unit.
- `LiminalAp.tally(doc)` gives maximum raw points by section and by unit; `rawPoints(doc, responses)` sums earned raw points. There is no score conversion, no weighting into a composite, and no 1–5 estimate anywhere.

### Page behaviour (`ap.html`)

- Routes: `#` all courses; `#<course>` plan; `#<course>/u<n>` plan with that unit open; `#<course>/test/<id>` student copy; `#<course>/test/<id>/key` answer key; `#<course>/reference` (physics). Unknown links fall back with a status message. Weekly work lives at `weeks.html#ap/<course>/<week>`; links appear only when the weekly index has the course.
- The plan reuses the high-school plan pattern (`LiminalHighSchool.pacedUnits`, `high-school.css`): units with goals, coursework, a week list (investigation and test marks), framework topics, and the unit test's student and key links ("in preparation" until the file exists); the exam format with source and date; the physics lab note; a raw-points note pointing to College Board's Bluebook practice; scope, starting points with links to prerequisite plans, and sources.
- Student copy: header with name and date, directions, a sections-and-timing table, each part's calculator badge, numbered items with choices or FR parts, points and blank workspace, then a separate answer sheet (one bubble row per multiple-choice question). Physics booklets append the formula reference. The key is not in the page while a student copy is shown.
- Answer key: multiple-choice key table, rationales with distractor notes and topics, FR scoring guidelines (answer, steps, rubric table per part), and a raw-point tally by section and unit to fill in by hand.
- Print: the route on screen is what prints, so student and key copies are separate printouts. Section II, the answer sheet, the appended reference and the tally start new pages; items and FR parts do not split; navigation and controls are hidden; the footer with the disclaimer prints at the end. Plans print with every disclosure open.
- Phone (320–390 px) has no horizontal scroll; controls are at least 44 px; dark mode follows `tokens.css`; print is black on white.
- The footer of `ap.html` carries the exact disclaimer, and the Liminal wordmark stays larger than the marks.

### Limits

Answer keys ship to the browser in the assessment files, as weekly keys do; separation is by route and printout, not secrecy. Physics paper investigations do not replace the hands-on lab work the AP physics courses require and do not satisfy the AP Course Audit. Automated checks do not establish that items are correct, unambiguous or AP-like; blind review does that, and agent review is not human editorial approval.
