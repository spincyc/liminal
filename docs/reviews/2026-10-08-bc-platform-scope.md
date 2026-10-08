# Cold review: Calculus BC and a common assessment platform

Reviewed against `3555d8109fa1bf8a1f775a8b47504c0e6251a351`, before implementation.
The request has two separable outcomes: a complete Calculus BC preparation
course, and common infrastructure only where SAT, ACT and AP share requirements.
Independent architecture and curriculum reviewers examined those boundaries.

## Decision

Build the BC course and a small shared assessment platform with program
adapters. Preserve each program's content generation, instructional progression,
grading policy and progress model. The useful overlap is ordered assessment
structure, response kinds, student/key projections, numbering, timing metadata
and raw-result aggregation. A new directory of links alone would not satisfy
the infrastructure requirement.

| Concern | Shared mechanism | Policy that remains with the program |
| --- | --- | --- |
| Content supply | An ordered assessment model consumed after selection | SAT seeded templates and exposure avoidance; ACT fixed banks and passage groups; AP authored tests and multipart questions |
| Presentation | Safe student fields, separate answer data, given figures and response space | SAT numeric grid, ACT lettering and essay space, AP calculator parts and handwritten rubric responses |
| Results | Explicit binary, rubric-point and unscored-completion outcomes | SAT numeric comparison and hinted-answer rules; ACT essay completion; AP manually assigned partial credit |
| Structure | Sections, parts, item traversal, numbering and duration summaries | SAT practice routing and breaks; ACT optional sections; AP MC/FR numbering and calculator boundaries |
| Learning | Links between instruction, practice and assessment | SAT remediation/mastery heuristics; ACT domain accuracy; AP course prerequisites, worked models, unit checks and cumulative review |

The existing `core.scoreResponse` and numeric comparison implement SAT/ACT
semantics; `test-engine` and its saved-session contract accept choice, numeric
and essay responses. Mapping AP free response onto an essay would lose rubric
points. Applying SAT mastery windows to AP self-scored work would misstate the
evidence. AP's existing `rawPoints` operates on integer points by subpart, and
its student projection deliberately omits topic/type labels that can reveal
the intended method.

Therefore the migration must keep public renderer shapes, source IDs, template
versions, run codes, content/exposure identities and storage namespaces stable.
The new model must actually drive both SAT/ACT booklets and AP projections and
summaries. Student-safe projections and typed outcomes need parity tests with
all response formats. Existing document-specific print layouts remain valuable.
No framework, dependency, server, universal grading engine or new AP progress
store is justified by the demonstrated overlap.

## BC course design

BC includes the AB foundation, additional integration/differential-equation
applications, parametric and polar/vector work, and sequences and series.
Appending two units to the existing 36-week AB course would not produce a
viable complete first-calculus course. The official ten-unit scope supports a
separate pace. [College Board course overview](https://apcentral.collegeboard.org/courses/ap-calculus-bc)

Use 30 instructional weeks with unit durations **3/2/2/2/3/4/2/3/4/5**, followed
by two cumulative review weeks, a full practice exam in week 33, targeted
remediation, and two investigations/capstones. Users must align this teaching
sequence with their actual examination calendar. Prior AB completion is not a
prerequisite; strong precalculus algebra, functions and trigonometry are.

The dense weeks require extra worked representations and guided-to-independent
practice, especially derivative foundations, FTC/substitution, logistic models,
integral applications and power-series endpoints. A/B/C worksheets should
change the reasoning demanded, not merely the numbers. Later weeks should
continue retrieving earlier calculus. Selected original AB material may be
adapted with BC-specific connections and pacing; introducing a new fragment
hydration framework solely to reduce JSON duplication is not justified.

The May 2027 practice-exam contract is 29 no-calculator MC in 62 minutes,
13 graphing-calculator MC in 38 minutes, two graphing-calculator FR in
30 minutes, and four no-calculator FR in 60 minutes. AP's hybrid delivery
includes handwritten free responses. Liminal provides independent practice,
with separate student/key copies and raw points. [College Board exam format](https://apcentral.collegeboard.org/courses/ap-calculus-bc/exam)

The 42 MC questions are allocated **3/3/3/3/5/7/3/3/5/7** across the ten units,
within the current published MC weight ranges. Mix their topics within
calculator parts. The ranges describe MC content, not a required whole-exam
composition. [College Board weightings](https://apcentral.collegeboard.org/courses/ap-calculus-bc)

Official HTML overviews establish unit scope and format but do not supply a
verified granular BC topic-number list. Use an explicitly editorial detailed
checklist with descriptive identifiers, linked to the official unit overview;
do not invent official CED numbering. The actual examination's AB subscore is
not a recipe for converting Liminal points into an AB subscore. [College Board subscore explanation](https://apstudents.collegeboard.org/about-ap-scores/special-score-structure-calculus-bc)

## Acceptance evidence

- All 36 weeks must include substantive teaching, worked examples, three
  distinct worksheets and complete answers. All ten units need original tests;
  exam preparation must include a complete timed practice form and fresh
  remediation tasks.
- Coverage checks must connect the detailed BC objectives to instruction and
  assessments. Content review must check the substance behind those tags,
  especially convergence hypotheses, endpoint behavior, approximation error,
  polar tracing and calculator use.
- Reviewers solve displayed prompts before inspecting their keys. Automatic
  validation cannot certify mathematical correctness or pedagogical variety.
- Shared-model tests must preserve SAT numeric rules, ACT unscored essays,
  AP partial-credit subparts, numbering, figures and student/key separation.
  No identity or storage migration is needed for this bounded change.
- Validate browser routes, mobile/light/dark states and actual student/key PDFs,
  then run the full repository gate. Sampled agent review is not human approval
  or measured evidence of exam readiness.

Only official HTML overview/format facts were consulted. No College Board
questions, scoring guidelines, equation sheets or CED PDFs were ingested.
