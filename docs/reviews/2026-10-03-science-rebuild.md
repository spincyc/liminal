# ACT Science passage-set rebuild — 2026-10-03

Baseline: `92563d3`, including the fixes in the
[handoff review](2026-10-03-handoff-review.md). The owner requested the Science
rebuild, reconciliation with `feature/prep` and `main`, and publication to
`main`. The unrelated old WIP worktrees remain untouched.

## Inventory and compatibility

The replacement has 80 original questions, IDs `act-science-0576`–`0655`, in
14 shared passages: four Data Representation sets with five questions each,
eight Research Summaries sets with six each, and two Conflicting Viewpoints
sets with six each. These are explicitly authored sets, not parameter variants
generated to reach the former 575-item target. The catalog has an exact
80-question target: 34 Interpretation of Data, 22 Scientific Investigation,
and 24 Evaluating Scientific Arguments and Models with Evidence questions.

The old 575 records remain byte-for-byte unchanged in
`content/archive/act-science.json`. Their IDs are never reused. Runtime history
can resolve them, but builders, practice filters, Review, retries and unfinished
saved sessions refuse them. Refused saves retain their contents. Existing
content-identity and snapshot rules still govern historical reconstruction.

Full Science forms use seven complete sets and 40 questions; the Science part
of a mini uses one complete five-question data set. All answers count for
practice accuracy. This is a practice approximation, not an official calibrated
form or simulation of hidden field-test questions. Narrowed drills can use part
of a set while retaining its complete passage. ACT tiers remain excluded from
selection, reporting and mastery judgments.

## Review method

Four author lanes supplied the data, research and viewpoint sets. Separate
reviewers receive displayed passages, figures, stems and choices without keys,
hints or explanations. They record answers and reasoning before inspecting
teaching fields. Accepted solutions are bound to the complete final question
and shared passage in `content/science-reviews.json`; source assembly must also
reproduce the canonical files exactly.

Reviewers solve the authored choice order. The assembler deterministically
shuffles answer positions; the coordinator compares every final passage and
teaching field with the accepted packets, verifies the choice and rationale
permutations, and maps each independently selected exact answer string to its
final index. The manifest retains both that string and the final index.

| Author | Independent reviewer | Passages | Questions |
| --- | --- | --- | ---: |
| `science_data` | `solve_data` | p001–p004 | 20 |
| `science_research_a` | `solve_research_a` | p005–p008 | 24 |
| `science_research_b` | `solve_research_b` | p009–p012 | 24 |
| `science_viewpoints` | `solve_viewpoints` | p013–p014 | 12 |

The independent reader found one overlapping-answer defect in
`act-science-0617`: a broad interval and the intended narrower interval both
contained the settling threshold. The stem now explicitly requests the
narrowest supported interval, and the distractor rationale acknowledges why
the broad interval is true but insufficient. The reviewer reassessed and
accepted the revision; the original blind response was retained.

Data review checked every graph scale and diagram against its table, as well
as interpolation, cumulative counts, force/mass relationships and bounded
conclusions. Experimental review independently checked factorial comparisons,
replication, precision, endpoint observation, light/dark gas corrections,
resistance, pH recovery and design constraints. Viewpoint review checked each
hypothesis against the factorial observations and the limits of its claims.

Independent agent review does not establish human editorial approval or
empirical difficulty. All 80 new records retain `automated-verified` status;
the whole retained inventory of 4,105 bank records still awaits independent
human editorial review. The active ACT inventory is 2,380 records, including
the four other banks' 2,300 exercise variants.

## Verification record

All 80 questions have accepted independent blind solutions and teaching-field
reviews. Exact comparisons preserve their accepted text, shared context and
distractor reasons through final answer shuffling. The Science admission gate
passes with the original archive hash unchanged. Its tier labels are 15 Easy,
61 Medium and 4 Hard; those labels remain unavailable in ACT practice.

The independent code review found no blocking issue. Focused regressions cover
archive eligibility, both legacy saved-set shapes, active save/resume,
historical identity, complete-set selection, passage recency, missing/stale
reviews, incomplete-source refusal, and Node/browser figure hydration parity.
The fresh-build gate exposed a missing invocation of the newly callable content
builder; `tools/build.js` now invokes it and propagates admission failure.
Withdrawal tests now configure a withdrawn section explicitly rather than
assuming that Science must remain unavailable.

The final complete gate, `TZ=UTC node tools/check-all.js`, passed all content
validation and admission checks, Science source/review checks, answer-position
checks, the unchanged 317 SAT template reviews, default family checks, a fresh
build, static smoke, guides/Learn and all 497 tests in 41 files. Node 26.10.0
ran the package entry point directly because npm was unavailable. No SAT
template source changed, so the template-change deep pass was not required.
`git diff --check` also passed.

Print verification uses two complementary 40-question forms covering all 14
passages. Chromium and pdflatex output were inspected for complete tables,
visible graph/diagram labels and question/choice grouping. Science table
columns now wrap, shared figures appear once per passage, and the unit symbols
Ω, μ and µ convert to valid TeX. Both Science forms compile without overfull
boxes. The enabled CLI form `act-full-science`, seed `science-rebuild`, contains
171 questions and compiles to 30 PDF pages without missing characters or
overfull boxes.

HTML and Chromium PDF booklets preserve the SVG diagrams. LaTeX uses a labeled
diagram description and the complete passage data instead of drawing the SVG;
the CLI describes this limitation. These sample checks do not establish layout
quality for every possible form.

Native Chromium acceptance over local HTTP passed 48 checks without JavaScript
errors. Coverage included the 80-item active inventory, targeted practice,
keyboard answering, hints, immediate feedback, the navigator, a 40-question
timed set with end feedback, save/reload/resume (including question 3 with two
prior answers), reports, a 20-question mini with five Science questions, phone
width and dark mode. Old direct and wrapped saved-session formats, including a
mismatched section label, refused archived Science questions while preserving
saved bytes. Due, Missed and Marked retained history without offering archived
questions as new practice.

Visual inspection found a stale ACT inventory headline. It now sums each
section's active target and correctly displays 1,805 questions plus 575 Writing
prompts. Review guidance now refers to an eligible current question. Native
rechecks accepted both changes. The browser's full form contains 171 questions,
including 40 Science questions with 12 tables and one SVG; its 32-page PDF was
inspected for readable Science tables and the force diagram. One Science
section-header-only page remains a pagination inefficiency; no content was lost.

These checks do not establish cross-engine behavior, screen-reader usability,
OS-level printing, genuine concurrent-tab behavior or every possible pagination.
