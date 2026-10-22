# AP courses

Liminal's courses for AP® exams are 36-week weekly courses for AP® Calculus
AB and BC, AP® Physics 1 and AP® Physics C: Mechanics. This document is the content
contract for their weekly coursework and figures. The general weekly contract
in [weekly coursework](weekly-coursework.md) still applies. Unit tests and
practice exams use their own assessment document type, documented in
[Assessments and the AP pages](#assessments-and-the-ap-pages).

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.

## Identity and files

| Item | Value |
| --- | --- |
| Track | `ap` (registry entry in `src/lib/weekly.js`, `NAMED_TRACKS.ap`) |
| Courses | `calculus-ab`, `calculus-bc`, `physics-1`, `physics-c-mechanics`, in that order |
| Plan | `content/ap.json`, built to `content/ap-plan.js` (`LIMINAL_AP_PLAN`) and `content/ap-plan.json` |
| Weekly course | `content/weekly/ap/<courseId>.json`: `trackId: "ap"`, `courseId`, no `grade` |
| Figures | `content/weekly/figures/ap/<courseId>/<figureId>.svg` |
| Routes | `weeks.html#ap/<courseId>/<week>`; year-plan links go to `ap.html#<courseId>` and `ap.html#<courseId>/<unitId>` |
| Context line | "Prepares for the AP® exam · flexible placement" |
| IDs | items `ab-w05-a3`, figures `ab-w05-f2` (prefixes `ab`, `bc`, `p1`, `cm`) |

`content/ap.json` follows the named-plan contract shared with
`content/high-school-math.json`: `version: 1`; `track { id: "ap", title,
description, scopeNote }`; `sources` (each with `id`, `title`, `publisher`,
`edition`, `note`, an HTTPS `url` and an `accessed` date); `standards` (each
with `id`, `label`, `sourceId`, `locator`, `gradeBand`, and `kind` of
`content`, `editorial-objective`, `practice` or `extension`); and exactly the
four courses, each with `title`, `scopeNote`, `nextStep`, `prerequisites`,
`outcomes` and `units` totalling 36 weeks. A unit has `id` (`u1`, `u2`, …),
`title`, `weeks`, `focus`, `bridge`, `learning`, `standards`, `activities` and
`evidence`. CED topics are standards of kind `content` (`AB.1.2`, `P1.8.4`,
`CM.2.9`); review weeks use editorial objectives. Every standard is mapped by
some unit, and every week's `standards` lie within its unit. Other fields
(exam facts, blueprints, notes) pass through for the plan page.

The AP track is in the release inventory (`inventory: true`), so
`check-weekly --complete` requires all four courses, and the release gate runs
`check-ap --complete`.

BC's granular objectives use descriptive IDs such as
`BC.10.ENDPOINT_TESTS`, with kind `editorial-objective`. They are Liminal's
detailed checklist for the published ten-unit scope, sourced to the official
HTML unit overview; they are not official numbered CED topics. These unit
objectives participate in the same weekly and assessment coverage checks as
the other courses' content references. `BC.REVIEW` and `BC.BEYOND` describe the
editorial final unit and do not serve as assessment topic tags.

BC is a complete first-calculus course with a precalculus prerequisite, not an
AB sequel. Its 30 instructional weeks include the AB foundation, additional
integration and differential-equation work, parametric/polar/vector functions,
and sequences and series. Two review weeks precede the week-33 practice exam;
remediation and investigations follow. Align this teaching sequence with the
learner's actual examination calendar. Selected original AB material is adapted
inside the separately authored BC course; no runtime fragment-hydration system
is introduced. The actual examination's AB subscore is not estimated from
Liminal points.

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
- **Calculator policy:** every AP worksheet sets `calculator`. Calculus uses
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

- Authors and reviewers receive only course/unit/topic scope metadata from
  `content/ap.json` and sourced HTML overview/exam-format facts. BC's detailed
  checklist remains explicitly editorial. Never give them,
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
| `content/ap.json` | Plan metadata for the `ap` track: sources, standards (framework topics `AB.1.2`, `P1.8.4`, `CM.2.9` with kind `content`, plus editorial objectives `AB.REVIEW`, `AB.BEYOND`, `P1.REVIEW`, `P1.SYNTHESIS`, `CM.TOOLKIT`, `CM.REVIEW`, `CM.SYNTHESIS`), and four courses, including the descriptive BC editorial objectives above. Each course has `units` (the named-plan contract plus `unit`, `mcWeight`, `classPeriods`, `test`), a 36-entry `schedule` (`week`, `unitId`, `title`, `standards`, optional `assessment` and `investigation`), the `exam` block (May 2027 format, `sourceId`, `checked`), `blueprints`, and an optional `prep` block ([exam preparation](#exam-preparation)). The weekly build validates it as the named plan and writes `content/ap-plan.js` (`LIMINAL_AP_PLAN`) and `content/ap-plan.json`. |
| `content/ap/assessments/<course>/unit-<n>.json`, `practice-exam.json` | One unit test per framework unit (8 / 10 / 8 / 7) and one practice exam per course; a course with a `prep` block adds `practice-exam-<b…>.json`, `mixed-<n>.json` and `fr-<archetype>.json`. |
| `content/ap/guides/<course>/<id>.json` | Exam-prep guides (`liminal-ap-guide` v1): strategy guides, unit reviews and free-response workshop guides. |
| `content/ap/figures/<course>/<figureId>.svg` | Assessment figures, admitted by `tools/lib/weekly-figures.js` (loss-free sanitizer round trip, `currentColor`, `viewBox`, 12 KB). Kept apart from weekly figures so each build's orphan check owns one directory. |
| `content/ap/references/<course>.json` | Physics formula references (Liminal's own grouping). |
| `src/lib/ap-assessment.js` | AP policy/model (`LiminalAp`): projections, tallies, blueprint and key checks, prep IDs and refs, guide checks, claims lint, routes. Ordering, projection mechanics and typed outcomes use the [shared assessment platform](assessment-platform.md). |
| `tools/check-ap.js` | Validator; `tools/build-ap.js` writes `dist/content/ap.js` (`LIMINAL_AP`: index of assessments, guides and references) and `dist/content/ap/**`. |
| `src/ap.html`, `src/app/ap.js`, `src/app/ap-render.js`, `src/styles/ap.css` | The page. |

### Assessment contract (`liminal-ap-assessment` v1)

```
{ format, version: 1, courseId, id: "unit-<n>" | "practice-exam" | "practice-exam-<b…>" | "mixed-<n>" | "fr-<archetype>",
  kind: "unit-test" | "practice-exam" | "mixed-set" | "fr-set", unitId: "u<n>" (unit tests only),
  title, author, directions,
  figures?: [{ id, alt, caption?, notToScale? }],
  sections: [{ id: "I" | "II", title, kind: "mc" | "fr",
    parts: [{ id: "A" | "B", title?, minutes, calculator, directions, items }] }] }
```

- Multiple choice: `{ id, prompt, choices[4], key: "A"–"D", rationale, distractorNotes?: { <each wrong letter>: text }, topics, figureIds?, answerFigureIds? }`.
- Free response: `{ id, prompt (shared stimulus), type? (physics: MR | TBR | EDA | QQT), context? (calculus: real-world context), topics, figureIds?, answerFigureIds?, parts: [{ label: "a", "b", …, prompt, points, rubric: [{ points, criterion }], answer, steps[≥1], figureIds?, answerFigureIds? }] }`.
- Shared item model: `prompt`, `choices`, `key`, `points`, `rubric`, `answer`, `steps`, `figureIds` and `answerFigureIds` mean what they mean on weekly worksheet items. Multiple choice is worth 1 point; a free-response item is worth the sum of its parts.
- IDs: items `<ab|bc|p1|cm>-<segment>-mcNN` / `-frN`, numbered as printed (multiple choice 1…n across Section I, free response 1…m across Section II); figures `<prefix>-<segment>-fN`. The segment is `u<n>` for unit tests and `pe` for the practice exam; the [exam-preparation kinds](#assessment-kinds-and-ids) add theirs.
- Calculator: Calculus AB/BC parts are `none` or `graphing`; physics parts are `any`.
- Text is plain (no markup, no LaTeX delimiters) and renders through `LiminalRender.renderText` with math typesetting.
- The first topic of an item is its primary topic: it decides the unit in blueprints and tallies.

### Validator rules (`node tools/check-ap.js [--complete]`)

Always:

- Plan: four courses in order; units u1… total 36 weeks; each content unit's references are exactly its course topics/objectives (C:M u1 adds `CM.TOOLKIT`); the last unit is the editorial review unit and holds the practice exam; every reference is mapped; each schedule week's references belong to its unit; every topic appears in a week; each unit's test sits in its last week and the practice exam in week 33; physics units each have a paper-investigation week; physics courses carry the lab note and a reference; course titles read "Course for AP® …"; `notice` is the exact disclaimer; sources have https URLs and accessed dates; the practice-exam `mcByUnit` totals 42 and every unit's share lies inside its framework weighting.
- Each assessment: format, path-matching `courseId`/`id`, kind and `unitId`; IDs as above; four distinct choices; key letter; rationale; distractor notes cover exactly the wrong letters; topics are framework topics or BC editorial unit objectives of the course; physics FR types; parts labeled a, b, c…; rubric rows sum to each part's points; figures declared once, used, present on disk and admissible; given and answer-only figure sets disjoint; alt text does not contain the keyed choice; plain text.
- Blueprint (`LiminalAp.blueprintProblems`): unit tests use `blueprints.unitTest` (AB/BC: I-A 8 none, I-B 4 graphing, II-A 1 graphing FR, II-B 1 none FR, 9 points each; physics: 12 MC and 2 FR of different types worth MR 10, TBR 12, EDA 10, QQT 8; 50–70 minutes in all); each item's primary topic is in the tested unit and no topic is from a later unit. Practice exams match the `exam` block exactly (counts, minutes, calculator per part), the multiple-choice count per unit, 9-point calculus FR with at least two in context, and one physics FR of each type.
- Key balance (`LiminalAp.keyBalance`): each letter keys 15–35% of a test's multiple choice; the key is the unique longest choice in at most 40%.
- Duplicates: no displayed item (normalized prompt, choices in any order, figure drawings, FR part prompts) repeats across any course's unit tests, practice exams, or AP weekly examples and worksheet items (`content/weekly/ap/<course>.json`).
- Claims lint (`LiminalAp.claimProblems`) over the plan, assessments, references, AP weekly files, and the AP page copy: "guarantee" beside an outcome (score, pass, exam, AP, credit, grade, result, success, "a 5"; existence theorems and conservation laws may say "guarantees"), score prediction, "score a 5" and similar, 1–5 scale or scaled-score conversions, "official" (allowed when the sentence names College Board or Bluebook), endorsement or authorization claims, "pass the exam" or college-credit claims, and the mark used as a noun or possessive. A negated sentence passes ("not AP scores", "does not predict"), as does the disclaimer.
- Disclaimer: any page in the pages directory (default `src/`, `--pages dist` after a build) that shows "AP®" or "Advanced Placement" contains the exact disclaimer; `lib/weekly.js`'s `AP_DISCLAIMER` equals it.

With `--complete` (the release gate once the courses land): every unit test, practice exam and physics reference exists; every framework topic or BC editorial unit objective appears in at least one item of the course's own unit tests or practice exam A (exam-prep sets and later forms do not count) and in at least one weekly week; each physics FR type appears in at least three unit tests.

### Projections and scoring

- `LiminalAp.studentCopy(doc)` keeps prompts, choices, points and given figures only (allowlists), plus the answer-sheet model and section maxima. `LiminalAp.keyCopy(doc)` adds keys, rationales, distractor notes, topics, FR types and context, answers, steps, rubrics, answer-only figures, and maxima by unit.
- `LiminalAp.tally(doc)` gives maximum raw points by section and by unit; `rawPoints(doc, responses)` sums earned raw points. There is no score conversion, no weighting into a composite, and no 1–5 estimate anywhere.

### Page behaviour (`ap.html`)

- Routes: `#` all courses; `#<course>` plan; `#<course>/u<n>` plan with that unit open; `#<course>/test/<id>` student copy; `#<course>/test/<id>/key` answer key; `#<course>/reference` (physics); `#<course>/prep` exam preparation and `#<course>/guide/<id>` a guide (courses with a `prep` block). Unknown links fall back with a status message. Weekly work lives at `weeks.html#ap/<course>/<week>`; links appear only when the weekly index has the course.
- The plan reuses the high-school plan pattern (`LiminalHighSchool.pacedUnits`, `high-school.css`): units with goals, coursework, a week list (investigation and test marks), framework topics, and the unit test's student and key links ("in preparation" until the file exists); the exam format with source and date; the physics lab note; a raw-points note pointing to College Board's Bluebook practice; scope, starting points with links to prerequisite plans, and sources.
- Student copy: header with name and date, directions, a sections-and-timing table, each part's calculator badge, numbered items with choices or FR parts, points and blank workspace, then a separate answer sheet (one bubble row per multiple-choice question). Physics booklets append the formula reference. The key is not in the page while a student copy is shown.
- Answer key: multiple-choice key table, rationales with distractor notes and topics, FR scoring guidelines (answer, steps, rubric table per part), and a raw-point tally by section and unit to fill in by hand.
- Print: assessments, keys and references use the [shared worksheet typography and layout](design-system.md#print-contracts), matching SAT/ACT with Computer Modern 10pt, two columns and ruled numbered headings. The route on screen is what prints, so student and key copies are separate printouts. Section II, the answer sheet, the appended reference and the tally start new pages. Break rules keep short items, FR parts and student introductions with their first part when they fit a column; longer solutions continue across columns and pages. Keys retain given and completed part figures in sequence; figures are capped at 75 mm high in print. Reference relations stack each formula, meaning and units across the full column width. Navigation and controls are hidden; the footer with the disclaimer prints at the end. Plans print with every disclosure open.
- Phone (320–390 px) has no horizontal scroll; controls are at least 44 px; dark mode follows `tokens.css`; print is black on white.
- Exam preparation (`#<course>/prep`): how to use it, the review plans (one disclosure each, sessions with linked tasks), the practice-exam forms, mixed sets, the workshop (each archetype's guide and its set), the unit reviews and the strategy guides, each "in preparation" until its file exists, then the exam format. A task or guide link appears only when its page exists in the build.
- Guide (`#<course>/guide/<id>`): kind, title, minutes and number of checks, then each section's blocks. Rules, traps, model wording and worked examples show in full; a check shows its problem with "Show a hint" and "Show answer" buttons (`aria-expanded`, `aria-controls`) that open its panels in place. Print drops the buttons and closed panels, prints the checks as problems, and adds every check's answer at the end, numbered to match, in two columns.
- The footer of `ap.html` carries the exact disclaimer, and the Liminal wordmark stays larger than the marks.

### Limits

Answer keys ship to the browser in the assessment files, as weekly keys do; separation is by route and printout, not secrecy. Physics paper investigations do not replace the hands-on lab work the AP physics courses require and do not satisfy the AP Course Audit. Automated checks do not establish that items are correct, unambiguous or AP-like; blind review does that, and agent review is not human editorial approval.

## Exam preparation

A course may carry an exam-preparation layer for the weeks before the exam,
after its units are taught. All four courses have one: Calculus BC since
2026-10-22, and Calculus AB, Physics 1 and Physics C: Mechanics since a later
pass the same day. It lives on `ap.html#<course>/prep` and is built from three
things the AP page already knows how to show, plus one new document type:

| Piece | Kind | Where |
| --- | --- | --- |
| Practice exams B, C, D | `practice-exam` assessments, the same blueprint as form A (the course's week-33 exam) | `content/ap/assessments/<course>/practice-exam-<b…>.json` |
| Mixed sets | `mixed-set` assessments: one timed Section I mixing every unit | `content/ap/assessments/<course>/mixed-<n>.json` |
| Free-response workshop | `fr-set` assessments, one per question archetype, paired with an `fr-archetype` guide of the same ID | `content/ap/assessments/<course>/fr-<archetype>.json` and `content/ap/guides/<course>/fr-<archetype>.json` |
| Unit reviews | `unit-review` guides, one per content unit | `content/ap/guides/<course>/review-u<n>.json` |
| Strategy guides | `strategy` guides | `content/ap/guides/<course>/<slug>.json` |
| Review plans | data in the course's `prep` block | `content/ap.json` |

### Why it is shaped this way

The layer follows the evidence on preparing for a cumulative, timed
mathematics exam, as summarized for this work on 2026-10-22:

- **Retrieval before rereading.** Practice testing beats restudy (Rowland
  2014; Adesope, Trevisan & Sundararajan 2017), so unit reviews open with
  checks whose answers stay hidden, and only then summarize. A missed check
  names the section to study: a worked example when one models its
  procedure (van Gog & Sweller 2015), otherwise the rules or model
  justifications.
- **Spacing.** The best gap between visits grows with the time left (Cepeda
  et al. 2008), so plans bring each unit back at least three times and put
  full practice exams about 8, 5 and 3 weeks and 10 days before the exam,
  with none in the last four days.
- **Interleaving.** Mixed mathematics practice outperforms blocked practice
  at a delay (Rohrer, Dedrick & Stershic 2015; Rohrer et al. 2020). Mixed
  sets mix units and are built around easily confused choices (which
  integration technique, which series test, which volume method, parametric
  or polar or vector motion; in physics, which conservation law applies,
  force or torque, energy or momentum, differentiate or integrate). Workshop
  sets are blocked by archetype, for learning the archetype; plans pair them
  with mixed work. The physics evidence base is thinner than the
  mathematics one, so these physics choices are applied by analogy.
- **Error analysis that leads to action.** A reflection form alone changes
  nothing (Soicher & Gurung 2017). The practice-exam method guide has the
  student mark confidence, predict a raw total before scoring, redo misses
  cold before reading solutions (Metcalfe 2017), and route each error cause
  to a specific next task.
- **Communication.** Strong students lose free-response points to setups,
  justifications, units and false equalities more than to content. The
  free-response guide and every archetype guide teach those conventions
  with model sentences, and workshop rubrics award them explicitly.

These are design commitments, not measured outcomes for Liminal's
materials.

### The `prep` block

```
prep: { title, summary, steps: [text],
  exams: [{ id: "practice-exam" | "practice-exam-<b…>", label, note }],   // form A first
  mixed: ["mixed-1", "mixed-2", …],
  strategy: [<slug>],                     // not starting review- or fr-
  reviews: ["review-u1", …],              // exactly one per content unit, in order
  workshop: ["fr-<archetype>", …],        // each is a guide and a set
  plans: [{ id, title, summary, sessions: [{ label, title, tasks: [{ text, ref? }] }] }] }
```

A `ref` names a page of the same course: `test:<assessment>` (student
copy), `key:<assessment>`, `guide:<guide>`, `unit:u<n>` (plan with the unit
open) or `week:<1–36>` (weekly coursework). `LiminalAp.refHref` turns it
into a link; the validator requires it to name something the plan lists.
The course's `blueprints` gain `mixedSet` (`parts` of `{ id, questions,
minutes, calculator }` and `minUnits`) and `frSet`. A calculus `frSet` has
`frPoints`, `minutesPerQuestion` and `questions: [least, most]`; a physics
`frSet` has `frTypes` (equal to the practice exam's), `minutesByType` and
`questions`, and each physics set practises one question type.

| Course | Mixed set | Free-response set |
| --- | --- | --- |
| Calculus AB, BC | 10 no-calculator questions in 21 minutes, then 5 graphing-calculator questions in 15 minutes (the exam's per-question pace); primary topics from at least 6 (AB) or 7 (BC) units | 3–4 nine-point questions at 15 minutes each, in parts ordered graphing calculator then none |
| Physics 1, Physics C: Mechanics | 15 questions in 30 minutes with a calculator (the exam's 85 minutes for 42); primary topics from at least 6 (Physics 1) or 5 (C: Mechanics) units | 3–4 questions of one type, paced MR 22, TBR 28, EDA 27 and QQT 18 minutes: inside the suggested times the practice exams print, and summing to the exam's 95 |

The physics pacing and point values are Liminal practice conventions:
College Board's exam pages, checked 2026-10-22, give only the section's 95
minutes and name the four types.

### Assessment kinds and IDs

| Kind | IDs | Item and figure segment | Blueprint |
| --- | --- | --- | --- |
| `unit-test` | `unit-<n>` | `u<n>` | `blueprints.unitTest` |
| `practice-exam` | `practice-exam`, `practice-exam-b`, … | `pe`, `peb`, … | the `exam` block |
| `mixed-set` | `mixed-<n>` | `mixed-<n>` | `blueprints.mixedSet` |
| `fr-set` | `fr-<archetype>` | `fr-<archetype>` | `blueprints.frSet` |

Items are `<prefix>-<segment>-mcNN` or `-frN` (so `bc-peb-mc07`,
`bc-mixed-3-mc12`, `bc-fr-polar-fr2`) and figures `<prefix>-<segment>-fN`.
Only unit tests carry `unitId` and the unit-topic restriction; other kinds
may tag any of the course's unit objectives. Key balance, duplicates,
plain text, claims and figure rules apply to every kind.

### Guide contract (`liminal-ap-guide` v1)

```
{ format: "liminal-ap-guide", version: 1, courseId, id,
  kind: "strategy" | "unit-review" | "fr-archetype", unitId? (unit reviews: u<n>),
  title, author, summary, minutes,
  figures?: [{ id: "<prefix>-<guide id>-g<n>", alt, caption?, notToScale? }],
  sections: [{ id: <slug>, title, blocks: [block] }] }
```

| Block | Fields | Shows |
| --- | --- | --- |
| `text` | `text` | A paragraph |
| `list` | `items`, `ordered?` | A list |
| `table` | `caption?`, `head`, `rows` | A table; every row has one cell per column |
| `rule` | `title`, `text`, `conditions?` | A result to know, with its hypotheses |
| `trap` | `text`, `fix` | A common error and its repair |
| `model` | `prompt?`, `text` | Model wording for a written answer ("Write it like this") |
| `example` | `prompt`, `answer`, `steps`, `figureIds?` | A worked example, shown in full |
| `check` | `id`, `prompt`, `hint?`, `answer`, `steps`, `figureIds?`, `see?` | A self-check: answer hidden behind a button on screen, printed with every other check's answer at the end. `see` names the section of the same guide to study when the check is missed; every unit-review check has one |
| `figure` | `id` | A figure |
| `links` | `items: [{ label, ref }]` | Links to other pages of the course |

Text is plain, as in assessments. Check IDs run `<prefix>-<guide id>-c1`,
`-c2`, … in reading order. Guide figures are `-g<n>` rather than `-f<n>`, so
an archetype's guide and its set, which share one ID, never name the same
figure. A block may carry only its own fields. Guide
examples and checks join the duplicate check, so a review cannot reuse a
test or worksheet item. A unit review has at least four checks and opens
with a section of checks (with text only) before any summary.

### Authoring standards

- **Unit reviews.** Open with recall checks (state a theorem with its
  hypotheses, a formula, a test's conditions) and then four to seven mixed
  problems, including at least one that requires choosing a method; every
  check names, with `see`, the section to study when it is missed. Then
  summarize: rules with hypotheses, traps with fixes, model justifications,
  and one to three worked examples for the procedures the checks test. End
  with links to the weeks and the unit test. Hints give a first step, not
  the method's name when choosing the method is the point.
- **Archetype guides.** What the archetype asks and in which calculator
  part it usually appears, the usual part pattern, what earns each kind of
  point in Liminal's own rubric language (setup, answer, justification,
  units, consistency with earlier parts), model sentences, traps, and a
  short worked model. They describe the archetype generically; they never
  describe or imitate a released question. Calculus archetypes are recurring
  kinds of task (accumulation, tables, motion, …); the physics archetypes are
  the four question types, each guide paired with a four-question set whose
  questions come from four different units, done two at a sitting.
- **Sets and exams.** The weekly and assessment standards above apply: four
  distinct choices with explained distractors, nine-point free response
  with original rubrics that credit reasoning and accept valid alternative
  methods, calculator items that genuinely need the calculator, exact
  values in no-calculator work, three-decimal answers in calculator work.
  Across practice exams A–D every archetype appears at least once; in BC the
  last free-response question of each form is on series. Physics forms keep
  one question of each type in the order MR, TBR, EDA, QQT, and B–D place
  each type on different units from form A and from each other.
- **Strategy guides.** Facts about the exam cite College Board's HTML pages
  with the date checked and are kept to format and policy. Pacing and
  method advice states when it fails. No score prediction, conversion or
  promise; raw points only.

### Exam-prep validator rules

`check-ap` validates the `prep` block (form A first; review guides exactly
one per content unit; distinct guide IDs; mixed sets numbered in order;
blueprints present, with a physics `frSet`'s types and points equal to the
practice exam's and whole minutes for every type; every plan task's `ref`
resolving), every assessment
the block names against its kind's blueprint, and every guide against the
contract above, with figures, duplicates, plain text and the claims lint.
With `--complete`, every assessment and guide the block names must exist.
