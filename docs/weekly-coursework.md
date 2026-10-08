# Weekly coursework

Weekly coursework extends the source-linked [year plans](curriculum.md). Each
course follows its existing 36-week unit sequence. Common Core math, Common
Core reading, and Singapore math remain separate pathways; the two mathematics
routes are alternatives. High-school assignments and Singapore grade mappings
retain the qualifications in the year plans.

## Authoring contract

One fresh authoring agent owns each grade and pathway. Work begins with Grade
12 and proceeds backward. Independent reviewers check the resulting material;
agent review is not human editorial approval or evidence of student outcomes.
Content is original and self-contained. Public-domain reading excerpts may be
included with an accurate source, author, title, and rights statement. Never
present an invented historical document as an authentic source. Selecting
those excerpts follows the no-censorship rule in
[the daily-reading contract](daily-reading.md#time-and-progression).

Canonical files are `content/weekly/<track>/<grade>.json`, where grade is `k`
or `1`–`12`, or `content/weekly/<track>/<courseId>.json` for a named track
(below). Files contain plain data, never HTML or executable expressions:

```json
{
  "format": "liminal-weekly-course",
  "version": 1,
  "trackId": "common-core-math",
  "grade": 12,
  "author": "authoring-agent-name",
  "weeks": []
}
```

Each week has these fields:

| Field | Contract |
| --- | --- |
| `week` | Integer 1–36, unique and ordered |
| `unitId` | Existing unit whose pacing includes this week |
| `title`, `objective` | Specific to this week's instruction |
| `standards` | Nonempty subset of the unit's existing reference IDs |
| `connection` | `{ before, after }`: concrete prerequisite and next connection |
| `days` | Five strings describing a useful daily teaching/practice sequence |
| `explanation` | At least three substantive paragraphs explaining the concept, representation, method and common error; no generic filler |
| `examples` | At least two `{ prompt, answer, steps }` worked examples; at least three actual reasoning steps each |
| `passages` | Array, empty for math if unnecessary; each `{ id, title, text, kind, attribution, sourceUrl, readingMode }` |
| `worksheets` | Exactly three, IDs `a`, `b`, `c`, each `{ id, title, directions, items }` |

Each worksheet has at least six distinct items. An item has `id` (unique in
the course), `prompt`, `answer`, `steps` (at least two explanatory steps),
`passageIds` (array of local passage IDs), and `skill` (the specific reasoning
assessed). A defensible sample answer and evidence criteria serve as the key
for open responses; do not imply that wording is unique. Examples may also
have `passageIds`. Plain mathematical notation uses explicit grouping,
Unicode minus, and standard function names; do not insert LaTeX delimiters.

### Optional fields

These fields are optional everywhere; a course without them validates,
projects and renders exactly as before. AP courses use them heavily (see
[AP courses](ap-courses.md)).

| Where | Field | Contract |
| --- | --- | --- |
| Week | `figures` | `[{ id, alt, caption?, notToScale? }]`. `id` matches `[a-z0-9][a-z0-9-]*` and is unique in the course; the file is `content/weekly/figures/<track>/<courseKey>/<id>.svg`. `alt` describes the drawing and, for a given figure, never reveals the answer. `notToScale: true` prints "Figure not drawn to scale." |
| Week | `explanationFigureIds` | Figures shown after the explanation in the guide |
| Example or item | `figureIds` | Given figures, shown with the prompt to students |
| Example or item | `answerFigureIds` | Answer-only figures (a completed sketch or free-body diagram), shown only in keys and revealed solutions |
| Example or item | `choices`, `key` | Multiple choice: exactly four distinct, nonempty choices shown as (A)–(D); `key` is `A`–`D` and appears only in keys. `answer` and `steps` remain required |
| Example or item | `points`, `rubric` | Free response: integer `points` 1–20 shown to students as "(n points)"; `rubric` is `[{ points, criterion }]`, each row at least 1 point, summing to `points`, key only. Not allowed with `choices` |
| Worksheet | `calculator` | `none`, `scientific`, `graphing` or `any`, shown as a badge on screen and in print |
| Worksheet | `minutes` | Suggested time, an integer 1–240, shown as a badge |

Figure rules: every declared figure resolves to a file, every file is
declared, every declared figure is referenced in its week, and a figure is
either given or answer-only, never both. A file is admitted only when
`src/app/render.js`'s allow-list keeps it intact (`tools/lib/weekly-figures.js`):
elements `svg, g, line, polyline, polygon, circle, ellipse, rect, path, text,
tspan`; no markers, defs, clip paths, styles, scripts, links, images or
external references (draw arrowheads as polygons); paint only `currentColor`,
`none` or `transparent` (tint with opacity); a positive `viewBox`; at most
12 KB. Draw figures with the figure kit (`tools/lib/figure-kit.js`, CLI
`node tools/figure-kit.js`) and commit only its SVG output. Each course file
is limited to 2.5 MB, both as the source file and as the built file with its
figures inlined.

Value and data tables use pipe rows in prompts, explanations and answers; the
reader and exports render them as tables. The first row is the header; leave
its first cell empty to make the first column row headers:

```text
| t (s) | 0 | 1 | 2 |
| --- | --- | --- | --- |
| x (m) | 0.0 | 1.2 | 4.9 |
```

A pipe needs a space or line edge on both sides to separate cells, so `|x − 3|`
stays an absolute value.

Passage `kind` is `original` or `public-domain`; `readingMode` is
`independent`, `shared`, or `read-aloud`. Original attribution says it was
written for Liminal; its `sourceUrl` is an empty string. Public-domain texts
require a verified HTTPS source and an attribution naming author, work, date,
and public-domain status. Texts, tables, procedures and necessary givens must
be supplied, not assigned to an unspecified external book. Authentic literary
and historical analysis requires authentic sources. Reading passages should
match the intended reader and task, with rich teacher read-alouds distinct
from controlled early decoding. Original text has no fake citations, people,
research findings, historical provenance or quotations attributed to real
people. Short exercises supplement sustained reading; they do not establish
comprehensive grade-band text complexity.

Worksheets A, B, and C are practice supplies, not a requirement to finish all
three in one sitting. Use different tasks and givens, with support gradually
removed and application introduced. Do not repeat an exercise from a guided
example, another worksheet, or another week in the course. Revisit skills with
fresh questions; numerical variants alone do not establish different question
designs. Cross-pathway prerequisite skills necessarily overlap.

Every math answer needs an independent arithmetic/algebra check. Every reading
answer must be supported by its supplied text, with uncertainty and plausible
alternatives handled explicitly. Keep age-appropriate prerequisites and the
existing scope; do not substitute an advanced course for foundational work or
pad broad units with unrelated easy drills.

## Interface and review

The reader shows one selected week, with explanations, worked examples and
worksheet choices. Answer keys are separate from student worksheet exports.
Keep mobile navigation compact, keyboard accessible, and printable with dark
ink and blank work space. Content never enters SAT/ACT progress or the existing
Grade 8 generated-packet inventory.

Validation must check complete week coverage, unit/standard references, required
teaching fields, passage resolution, worksheet quantities, stable IDs, and
duplicate displayed tasks within a course. This is structural admission, not
a claim of semantic proof. Cold review records its actual scope and findings
under `docs/reviews/`, including sampled independent solutions and the limits
of automated duplicate detection.

## Build and navigation

`tools/build-weekly.js` validates available complete courses against the year
plans, emits a small `content/weekly-index.js`/`.json`, and writes one JSON asset
per course with each declared figure's SVG inlined as `svg`, plus standalone
copies under `content/weekly/figures/`. Missing course files are omitted while work is in progress; an
existing incomplete or invalid file fails the build. The index lists grades
12 through kindergarten. The reader fetches only the selected course and guards
against an older request replacing a more recent selection.

Named tracks are listed in the `NAMED_TRACKS` registry of
`src/lib/weekly.js`: `high-school-math` (Algebra, Geometry and Algebra 2 reuse
Common Core grades 9–11; Trigonometry and Calculus are authored) and `ap`
(`calculus-ab`, `physics-1`, `physics-c-mechanics`, all authored). Each has a
plan file (`content/high-school-math.json`, `content/ap.json`) validated by the
same named-plan contract, a plan page used for year-plan links, a context line,
and optionally a trademark notice that the reader footer and every export of
that track carry. The build emits each present plan as a script bundle
(`content/high-school.js` as `LIMINAL_HIGH_SCHOOL`, `content/ap-plan.js` as
`LIMINAL_AP_PLAN`) with a matching `.json`.

The full repository gate requires all 41 original courses and all 44 available
course views, including the three reused named high-school courses. A track
joins this inventory when its registry entry sets `inventory: true`; `ap` stays
out until its three courses land. A missing
course therefore fails release validation even though the standalone builder
can support incomplete inventories during authoring.

Routes use `weeks.html#<track>/<grade>/<week>` (or `<track>/<courseId>/<week>`
for a named track), with `k` for kindergarten and weeks 1–36. The year-plan page links each available week under its unit. Previous
and next controls stay within the selected course. Invalid links recover with
a visible explanation. Browser Back/Forward and native keyboard selectors work
without progress storage.

`src/lib/weekly.js` owns routing, navigation, the named-track registry
(`NAMED_TRACKS`), and explicit student/key projections.
`src/app/weekly-render.js` renders text through the shared safe renderer and
figures through `LiminalRender.renderFigure`. Student projections retain only
question fields (prompt, choices, points, given figure references), the sheet's
calculator policy and minutes, and the passages and given figures they
reference; hidden keys, key letters, rubrics, answer-only figures, worked
models and future teacher-only fields never enter the student export. Downloaded HTML embeds styling and the Liminal mark
for offline printing. Matching week and worksheet labels appear on separate
student and key copies, with blank, unruled working space on student sheets.

```sh
node tools/build-weekly.js
node tools/check-weekly.js --complete
node --test test/weekly*.test.js test/figure-kit.test.js
node tools/check-all.js
```

Duplicate admission compares normalized prompts and their resolved passage
texts within a course, including worked examples. Reference-array order cannot
disguise the same task. Different wording or mathematically equivalent givens
can evade exact comparison; semantic variety and correctness require review.
The test suite checks malformed/incomplete courses, references, unsafe text and
URLs, route boundaries, stale IDs, answer exclusion, and export rendering. A
synthetic AP fixture (`test/fixtures/weekly-ap/`) exercises every optional
field, the figure pipeline and the size budget.
The read-only complete-inventory check additionally requires all thirteen
grades in each of the three pathways; an empty or partial build cannot satisfy
that check.
