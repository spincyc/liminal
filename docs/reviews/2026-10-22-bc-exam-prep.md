# Calculus BC exam preparation and coursework deepening

Built and reviewed 2026-10-22 against baseline `241a65c`. The request was a
full course and test preparation for the AP® Calculus BC Exam. The 36-week
course already existed (see the [BC completion review](2026-10-08-bc-platform-completion.md)),
so this work did two things. It audited and deepened that coursework, and it
added the exam-preparation layer the site lacked. Every step used independent
agents. Authors never verified their own work, and every solver froze answers
before seeing a key. In all, 235 agents ran across five rounds. This is agent review, not human
editorial approval or evidence of learning outcomes.

## What was added

| Piece | Count | Where |
| --- | ---: | --- |
| Practice exams B, C, D (May 2027 format) | 3 × (42 MC + 6 FR) | `content/ap/assessments/calculus-bc/practice-exam-{b,c,d}.json` |
| Mixed timed sets (10 no-calculator + 5 calculator MC, ≥ 7 units each) | 6 × 15 MC | `mixed-1.json` … `mixed-6.json` |
| Free-response workshop: guide + 3-question set per archetype | 11 guides, 33 FR | `fr-*.json` (assessments and guides) |
| Unit reviews, retrieval first | 10 guides | `content/ap/guides/calculus-bc/review-u*.json` |
| Strategy guides | 5 guides | `exam-format`, `calculator-skills`, `free-response-writing`, `memory-sheet`, `practice-exam-method` |
| Review plans | 3 (eight-week, four-week, in-course) | `content/ap.json`, BC `prep` block |
| New multiple choice / free response | 216 / 51 (196 scored parts) | |
| Guide self-checks | 181 | |
| New assessment and guide figures | 84 | `content/ap/figures/calculus-bc/` |
| Coursework: worked examples | 130 → 165 | `content/weekly/ap/calculus-bc.json` |
| Coursework: figures | 48 → 180 | `content/weekly/figures/ap/calculus-bc/` |

The layer appears at `ap.html#calculus-bc/prep`, with guides at
`#calculus-bc/guide/<id>`. The [course contract](../ap-courses.md#exam-preparation)
holds the formats, validator rules and authoring standards.

## Design basis

Three research lanes worked from College Board HTML pages only and from
published learning research:

- **Exam facts.** The May 2027 format already in the repository was
  confirmed: 29 MC in 62 minutes without a calculator, 13 in 38 with one, 2 FR
  in 30 with one, 4 FR in 60 without. Also confirmed: hybrid Bluebook delivery,
  Bluebook's built-in Desmos in the calculator parts, up to two handheld
  calculators, the part shares of the score and the AB subscore. Two statements
  were not on an allowed HTML page: nine points per free-response question, and
  that no formula sheet is supplied. Both are now phrased as Liminal's practice
  conventions. The four calculator capabilities and the three-decimal rule come
  from a withdrawn College Board page, now cited as an archived copy and used
  only as a practice convention.
- **Learning science.** The layer follows several findings:
  - Retrieval before rereading (Rowland 2014; Adesope et al. 2017).
  - Spacing that contracts toward the exam (Cepeda et al. 2008).
  - Interleaved mathematics practice (Rohrer, Dedrick & Stershic 2015;
    Rohrer et al. 2020).
  - Error correction with feedback (Metcalfe 2017).
  - Calibration against predictions (Foster et al. 2017).
  - Reflection alone does not help (Soicher & Gurung 2017).

  Unit reviews therefore open with checks, and each check names the section
  to study when it is missed. Plans revisit every unit at least three times
  and place four full exams about 8, 5 and 3 weeks before the exam and again
  about 10 days before it, with none in the last four days. Mixed sets are
  built around easily confused methods. The practice-exam method routes each
  error cause to a next action.
- **Free-response conventions.** Eleven recurring archetypes, described
  generically, plus a communication checklist: setups, justifications, false
  equalities, units, and consistency with earlier answers. No released
  question, scenario or scoring guideline was opened or imitated.

## Platform

`src/lib/ap-assessment.js`, `tools/check-ap.js`, `tools/build-ap.js`,
`src/app/ap.js`, `src/app/ap-render.js` and `src/styles/ap.css` gained:

- **New assessment kinds.** Practice-exam forms beyond A, `mixed-set` and
  `fr-set`, each with its own blueprint and ID segment.
- **A guide document type.** `liminal-ap-guide` has ten block types. Its checks
  open in place on screen and print their answers at the end.
- **The `prep` block and refs.** Plans and links use validated refs
  (`test:`, `key:`, `guide:`, `unit:`, `week:`), linked only when the target
  exists in the build.
- **Two routes.** The prep page and guide view.

Unit reviews are validator-enforced to open with checks and to point every
check at a section. Guide examples and checks join the duplicate check, and a
prompt-only comparison catches a copied stem without its choices.

The shared renderer now draws a derivative order `f^(4)(x)` as f⁽⁴⁾(x) and
reads it as an order, not as a power. This also corrects existing AB, BC and
Singapore Grade 12 content.

## Coursework audit and repairs

| Stage | Agents | Outcome |
| --- | ---: | --- |
| Blind solve and pedagogy audit, two weeks per lane | 18 | 835 prompts solved before key access; every answer key agreed. Findings: 9 major teaching gaps (methods used before they were taught, a false premise, a misleading prompt), 147 minor, 97 suggestions, 120 figure proposals |
| Repair as validated patch files | 18 | 161 fixes, 145 adopted suggestions, 9 rejections with reasons, 5 deferrals; 35 worked examples and 132 figures added |
| Independent verification of each patch | 18 | 256 new or changed problems re-solved blind, all agreeing; 92 findings (13 major, 79 minor), all fixed by the lane owners |

The coordinator handled the two deferrals the patch format could not: a
redrawn arc-length figure (`bc-w21-f1`) and the week-36 passage sentence that
confused the parameter with a polar angle. Two figure proposals were declined
as low value. One deferral is a follow-up: the AB course shares the original
week 1–2 text, and the same teaching fixes could be mirrored there. That was
outside this BC request.

## Exam-prep authoring and verification

| Stage | Agents | Outcome |
| --- | ---: | --- |
| Authoring (one lane per document; exams split into MC and FR lanes) | 33 | 35 drafts, each passing the real validator in an isolated temporary tree |
| First blind solve, by a different agent | 37 | 663 problems solved; 662 agreed on first comparison (the one disagreement was an ambiguous prompt, rewritten). Findings: 3 critical, 35 major, 148 minor |
| Repair by an author-role agent | 37 | 179 fixed, 2 partly fixed, 5 disputed. All five disputes were right: the assembler's set directions ignored all-no-calculator sets, which the coordinator fixed |
| Cold review: second complete blind solve of every new MC and FR item | 9 | 795 problems re-solved, all agreeing |
| Cold review: guide truth audits, student and teacher pedagogy, code, browser/print, compliance, coursework read | 11 | 1 critical, 21 major, 74 minor findings |

The critical finding was a false rule in the unit 5 review: it said the sign of
dy/dx is the sign of N whenever D keeps one sign. It was corrected.

The major findings were:

- Eight near-duplicates between new items, the weekly course and practice
  exam A.
- Unsourced exam-format claims.
- Multi-unit plan tasks that linked only their first unit, and missing retries
  for units 2, 4 and 8.
- Review promises of routing that the checks did not support, now the `see`
  field.
- Derivative orders rendered as powers.
- A phone reflow failure on long objective IDs.
- Plan disclosures without a visible marker.

## Fixes from the cold review

| Stage | Agents | Outcome |
| --- | ---: | --- |
| Content fixes, one lane per document group | 12 | 64 fixed, 7 partly fixed, 3 rejected with evidence. The rejected items were outside the lane's files; the coordinator applied them |
| Independent verification of every fix | 12 | 202 changed items re-solved blind, all agreeing; 12 follow-up findings, each fixed in a second pass |

The coordinator fixed the platform and the plan:

- **Derivative orders.** They render as orders, with a test.
- **Phone layout.** Long objective IDs wrap at 320 px, and guide tables break
  only between words, scrolling in a focusable region.
- **Prep page.** The plan disclosures have a visible marker, and its timing
  text comes from the exam block and blueprints. Unit-review checks carry
  `see` pointers.
- **Printouts.** Free-response-only sets drop the empty answer sheet.
- **Coverage.** The `--complete` coverage rule counts only the course's own
  unit tests and practice exam A.
- **Plans.** Each multi-unit task was split into one task per page, every unit
  got a retry, the session budgets now fit, and the form notes agree with the
  plans.
- **Facts and sources.** The formula-sheet and calculator wording is sourced,
  with two new source records (the score-structure page and the archived
  calculator guidance).
- **Content between lanes.** The coordinator also fixed the items no lane
  owned: a remaining near-duplicate, the exam directions' "by section only"
  and exam-scoring wording in four workshop guides.

Chromium 155 also printed every AP booklet, old and new, with a blank first
page. The baseline build did the same, so it predates this work. The cause was
the shared heading's keep-with-next rule chained with the section and part
headings. Booklets may now break after their header, and page 1 holds the
header again.

## Release verification

- **Full gate.** `node tools/check-all.js` passes: complete content and
  coverage admission, build, static smoke and all unit tests. That includes
  new tests for the kinds, refs, routes, set blueprints, guide validation,
  guide rendering, the prep controller's stale-load and link rules, and
  derivative-order rendering.
- **Browser.** Chromium 155 through WebDriver, on these routes:
  `#calculus-bc`, `/prep`, `/guide/memory-sheet`, `/guide/fr-series`,
  `/test/fr-polar/key` and `/test/mixed-2`.
  - Every disclosure opened, at 320 and 390 px: no horizontal scroll and no
    overflowing table cell.
  - Plan disclosures show their marker.
  - Dark mode was emulated.
  - Keyboard: a check's answer button flips `aria-expanded` and opens its panel
    with the study pointer.
- **Print.** PDFs of a guide, a set and practice exam C were inspected.
  - The guide printout holds the checks without answers, then "Answers to the
    checks", with no buttons.
  - The student copies contain no key text.
  - After the first-page fix, unit 1, the polar set, practice exam B's key and
    Physics 1 unit 1 each begin on page 1.

## Limits

- Agent review is not human editorial approval. Every key was solved
  independently at least twice, but difficulty, timing and exam likeness are
  editorial judgments with no student pilot.
- Raw points are practice evidence. Nothing here estimates an AP score or the
  AB subscore.
- The prep layer exists only for Calculus BC. The other AP courses have no
  `prep` block yet.
- Browser checks used one Chromium build, emulated dark mode and Chromium's
  PDF output. No physical printer, other engine or assistive technology was
  tested.
