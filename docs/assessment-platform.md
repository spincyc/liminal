# Shared assessment platform

SAT, ACT and every course for AP® exams use the pure assessment model in
`src/lib/assessment.js` through `src/lib/assessment-adapters.js`. It shares
ordered assessment structure, student/key projection mechanics and typed
outcomes. It does not replace their authored content schemas, generators,
session snapshots, progress storage or teaching sequences.

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.

## Boundary and consumers

The [October 8, 2026 cold review](reviews/2026-10-08-bc-platform-scope.md)
decided to share assessment mechanics
while retaining program policies. The existing common needs are substantial:
sections with timing, ordered questions, student copies, separate worked keys,
and outcomes. Their pedagogy and delivery differ: SAT template practice has
practice routing and skill gates, ACT uses fixed banks with unscored Writing,
and the AP coursework uses authored weekly instruction and handwritten
free-response work. A common directory alone would not resolve duplicated
mechanics; a universal session or mastery engine would misrepresent them.

| Consumer | Shared behavior | Policy kept by its owner |
| --- | --- | --- |
| `booklet.buildModel` | `practiceForm`, ordered entries and total testing minutes | Original questions, run/form codes, SAT/ACT answer letters and continuous numbering |
| SAT/ACT HTML and TeX student questions | `practiceStudent` through the common item projection | Existing passage grouping, math/figure rendering, response space and print layout |
| `test-engine.summary` | Typed binary/unscored outcomes and summary counts | `core.scoreResponse`, hint policy, timing, existing report shape and essay privacy |
| `ap-assessment.entries`, `counts`, `tally` | `apDocument`, ordering, maxima and grouped point totals | Separate MC/FR numbering, primary-topic unit attribution |
| `ap-assessment.studentCopy`, `keyCopy` | Recursive common projection | AP document formats, answer-sheet model, given/answer figure filtering |
| `ap-assessment.rawPoints` | Binary and multipart rubric outcomes; section/unit totals | Letter responses, manually awarded integer FR points, raw points only |

The SAT/ACT booklet model still contains the original question objects for its
key renderer and identity-sensitive callers. Student rendering projects the
question before handing it to any text, passage or figure rendering callback.
The existing SAT option to append the answer key is intentional; ACT student
booklets retain their separate key export. AP student and key routes remain
separate. No student projection exposes solutions through hidden data.

## In-memory model

Models contain `sections`, each with `parts`, each with `items`. Sections and
parts have explicit `display` payloads; parts also have `minutes`. An item has:

- `display`: fields its adapter explicitly admits to a student copy.
- `solution`: fields added only to a key copy.
- `parts`, when present: recursively projected subparts, preserving their
  labels, prompts, point values and separate scoring guidelines.
- `scoring`: a typed response descriptor, independent of display fields.
- `numberingGroup`: an optional numbering sequence; AP uses `mc` and `fr`,
  while SAT/ACT use the default continuous sequence.
- `source`: the unchanged authored record, when the adapter needs to restore
  an existing public model. This field never enters a projection.

`entries(model)` returns each item with its section, part, global index and
printed number. `schedule(model)` describes its ordered parts without changing
their calculator rules, sequence or clocks. `totals` and `groupTotals` sum
item counts and raw maxima. `project` and `projectItem` copy only the admitted
display/solution payloads and recursively handle subparts; they never spread
the source record. Adapters own the allowlists, including nested stimulus,
figure and rubric fields. Adding a future teacher-only field therefore does
not automatically add it to student output.

These models are not storage or interchange formats. Source documents remain
validated by their current tools before adaptation. No model is written to
progress or unfinished-session storage.

## Outcomes and limits

`outcome(scoring, response, options)` supports three distinct evidence types:

| Kind | Meaning | Result |
| --- | --- | --- |
| `binary` | One objective question | One possible point; a correct answer after a hint remains separately identified |
| `rubric` | Manually awarded points for named subparts | Integer points capped separately at each part's maximum; invalid or missing points earn zero |
| `unscored` | Completion, such as an ACT Writing draft | No earned or maximum score and no Boolean correctness |

SAT/ACT binary descriptors require their program's comparison result. The
engine continues to call `core.scoreResponse`, preserving choice-index
validation and the SAT numeric grid's exact fraction and decimal rules. The
common kernel refuses to replace that comparison with generic equality.
AP multiple choice compares its recorded letter with its authored key.
Rubric outcomes never infer a grade from written prose or a final answer.
An unscored outcome records whether a response exists, never the response text.

`summarize` retains separate binary and rubric counts. It does not convert
partial rubric points or essay completion into binary accuracy, apply section
weights, predict scores, or infer mastery. AP reports continue to show raw
points by section and unit; their instruction and assessment rubrics retain
the reasoning criteria needed for self-checking or instructor marking.

## Compatibility and extension

The platform leaves `core.js`, family sources and template registries unchanged.
SAT seeds, masks, run codes, question IDs and source fingerprints remain owned
by their existing modules. The fixed-bank `q1` content identity and generated
`vi1` visible identity continue to have different purposes and algorithms.
Do not replace either with AP/weekly duplicate detection.

All existing storage keys and schemas remain unchanged, including progress v3,
separate unfinished-set/test slots, cross-tab ownership, frozen module question
snapshots and draft redaction. Existing hint, repeat, legacy-item and mastery
denominators remain intact. AP pages gain no interactive session or progress
record from this refactor. A future such feature needs an explicit response,
privacy and persistence design; treating multipart FR as an essay would lose
its scoring semantics.

Calculus BC joins the AP adapter without a new scoring engine. Its topic IDs
are Liminal editorial objectives `BC.<unit>.<UPPERCASE_SLUG>` for units 1–10,
not invented official granular topic numbers. `ap-assessment.isAssessmentTopic`
distinguishes these from legacy numbered AB/physics content references;
review/beyond-course objectives are excluded. Both calculus courses retain
their no-calculator/graphing-calculator parts, nine-point FR questions and
context requirements, without a physics formula reference.

Browser pages load `assessment.js`, then `assessment-adapters.js`, before
their booklet, engine or AP consumer. The same modules load in Node without
a DOM. Script order is enforced in static smoke tests and exercised in the
platform test's browser VM.

## Verification

Run the focused checks with:

```sh
node --test test/assessment-platform.test.js test/ap-assessment.test.js test/ap-render.test.js test/booklet.test.js test/test-engine.test.js test/session-store.test.js test/print-selection.test.js
node tools/update-templates.js --check
```

Tests cover numbering and original source identity, mixed evidence types,
numeric-comparison ownership, future solution-field exclusion at each nesting
level, mutation isolation, student renderer callbacks and real browser-script
consumers. Existing engine/session tests retain resume, wall-clock, discard,
essay and hint behavior; booklet tests retain print and passage contracts.

During this extraction, comparison with commit `3555d81` matched all 26 existing
AP documents' projections, tallies, numbering and raw grading. Twelve sampled
SAT/ACT HTML, key and TeX exports were byte-identical, and mixed
choice/numeric/essay reports and serialized snapshots matched before and after
the extraction with and without a hint. Template registry verification remained
unchanged. These comparisons establish compatibility for their tested scope;
they do not certify content correctness or measured exam difficulty.

Run the repository-wide gate before release. For changes to document output,
retain the actual PDF checks described in [booklet printing](booklet-printing.md)
and [AP courses](ap-courses.md), including handwritten response space and
student/key separation. The platform adds no universal print layout.

The [completion review](reviews/2026-10-08-bc-platform-completion.md) records
independent content/code findings, browser checks, actual PDFs and release gates.
