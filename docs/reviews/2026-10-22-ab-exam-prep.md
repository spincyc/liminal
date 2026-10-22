# Calculus AB exam preparation

Built and reviewed 2026-10-22 against baseline `0a16b27`. The request was
exam-preparation coursework and pages for every AP® course on the site that
lacked them. Calculus BC already had its layer
([BC exam-prep review](2026-10-22-bc-exam-prep.md)); this record covers
Calculus AB. The physics courses follow in their own record. Authors never
verified their own work, and every solver froze answers before seeing a key.
This is agent review, not human editorial approval or evidence of learning
outcomes.

## What was added

| Piece | Count | Where |
| --- | ---: | --- |
| Practice exams B, C, D (May 2027 format) | 3 × (42 MC + 6 FR) | `content/ap/assessments/calculus-ab/practice-exam-{b,c,d}.json` |
| Mixed timed sets (10 no-calculator + 5 calculator MC, primary topics from all 8 units) | 6 × 15 MC | `mixed-1.json` … `mixed-6.json` |
| Free-response workshop: guide + 3-question set per archetype | 8 guides, 24 FR | `fr-*.json` (assessments and guides) |
| Unit reviews, retrieval first | 8 guides | `content/ap/guides/calculus-ab/review-u*.json` |
| Strategy guides | 5 guides | `exam-format`, `calculator-skills`, `free-response-writing`, `memory-sheet`, `practice-exam-method` |
| Review plans | 3 (eight-week, four-week, in-course) | `content/ap.json`, AB `prep` block |
| New multiple choice / free response | 216 / 42 (167 scored parts) | |
| Guide self-checks / worked examples | 148 / 37 | |
| New figures | 54 | `content/ap/figures/calculus-ab/` |

The eight archetypes are BC's minus parametric and vector motion, polar
curves and series, with area and volume limited to AB scope (no arc
length). Practice exams B–D place the archetypes so that every one appears
across forms A–D. Mixed sets are built around easily confused choices:
which derivative rule or existence theorem, which integration move, rate
against accumulation, discs against washers against cross sections.

## Exam facts

A research lane rechecked the AB exam on College Board HTML pages only
(no PDFs) on 2026-10-22. Every count, time and section weight the site
states was confirmed. New and corrected facts:

- **Confirmed and added:** the part weights 35% / 15% / 16.7% / 33.3%, the
  3-hour-10-minute length, and Bluebook's built-in Desmos graphing calculator
  in the calculator parts only, with up to two approved handheld
  calculators (the calculator policy page).
- **Rephrased as Liminal practice conventions:** nine points per
  free-response question and the absence of a formula sheet appear on no
  allowed page, so the exam block, its source note and the guides now say
  so, as BC's already did.

## Process

| Stage | Agents | Outcome |
| --- | ---: | --- |
| Authoring (one lane per document group; each exam form in a multiple-choice half and a free-response half, assembled by the coordinator) | 19 | Every draft passed the real validator in an isolated tree |
| Blind solve, review and repair by a different agent | 13 | Every key agreed with an independent blind solve; one strategy-guide answer was softened to a judgement both readings support |
| Cold pass: second blind solve of every item a verifier changed, page coherence | 1 | All 77 changed items agreed; one rationale quoted the wrong derivative and was corrected; 24 link labels now name their targets as titled |
| Cold pass: final near-duplicate repairs | 1 | 16 items rewritten: three more conjugate limits, separable-equation and inverse-derivative items thinned, and template repeats of BC items replaced |
| Final blind solve of the cold-pass rewrites | 1 | 17 of 17 agreed (16 items and one guide check) |

Verification findings were mostly about originality and teaching, not
keys. Within exam forms, the two halves were written in parallel from one
context palette, so several multiple-choice items repeated a free-response
scenario; each was moved to a new context. Many items were near-duplicates of
the BC layer (which covers every AB topic), of AB unit tests and exam A, or of
the weekly course; they were rewritten. Workshop guides that quoted their own
set's answers were rewritten onto independent examples. Other repairs: a
false vertical-asymptote rule, a squeeze-theorem condition, a degree-mode
value, an over-strict "average velocity only if linear" claim, and rubrics
that did not accept valid alternatives. An automated sweep (word trigrams
with numbers masked) listed candidate pairs for each verifier; pairs below
its threshold were still found by reading, so it guided rather than decided.

## Limits

- Agent review is not human editorial approval. Difficulty, timing and exam
  likeness are editorial judgments with no student pilot.
- Raw points are practice evidence. Nothing here estimates an AP score.
- Separable-equation, inverse-function-derivative and absolute-extremum
  items remain common task types across AB materials; the cold pass thinned
  the new ones, but the types recur by design.
- The week-33 coursework said the exam supplies no formula sheet and that
  free-response questions are worth nine points; it now states both as
  Liminal practice conventions, matching the exam block.
