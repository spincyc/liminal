# Grade 8 cold review and library entrance — 2026-10-06

The cold review found real defects in the initial implementation at `8c79a1d`.
The changes below address those findings and add Liminal's module landing page.
The course remains limited to the supplied volume: four topics, 36 lessons,
72 original worked examples, and 85 exercise designs.

## Review and corrections

Three independent reviewers began without reading the earlier review conclusions:

- [Pedagogy and clarity](2026-10-06-grade8-cold-pedagogy.md): all 36 guides,
  72 worked examples, and displayed samples from every exercise design.
- [Repetition, coverage, and answer cues](2026-10-06-grade8-cold-integrity.md):
  broad packet generation, independent normalization of cosmetic variants,
  selection logic, and student-only exports.
- [Web and print experience](2026-10-06-grade8-cold-experience.md): real Chromium
  interactions, actual PDFs, responsive layouts, and keyboard use.

| Finding | Resulting behavior |
| --- | --- |
| Cosmetic variants counted as fresh exercises; exhausted pools repeated earlier questions | Each design identifies its mathematical givens. Both mathematical identities and exact displayed identities must be unique across a packet. Exhausted searches fail with useful guidance. |
| Short nightly sets could omit selected lessons or starve designs | Lesson and design cycles continue across nights. Packets too short to include every selected lesson display a coverage note. |
| Outlier labels, decimal positions, and predictable branches revealed answers | Labels are neutral, positions vary, and classifications and equation solution types include meaningful counterexamples. |
| Some practice assumed untaught reasoning or preceded its lesson | Fraction equations and subtraction align with the appropriate lesson. Model fitting explicitly teaches absolute vertical errors and why signed errors can cancel. |
| Graph-based concepts lacked worked visual explanations | Guides include given plots/tables and separate worked plots/tables. Interactive solutions remain inside closed disclosures. |
| Model comparison provided too little calculation space | Full-width student tables leave prediction/error cells blank, with room for totals and written conclusions. |
| Studying followed a long automatically generated packet | Courses opens directly in a focused lesson reader. “Practice this lesson” narrows selection; the default set is eight questions. A separate preset supplies 20 questions for each of ten nights. |
| Radicals in graph legends grew to several inches | Graph sizing applies only to the plot SVG. Nested mathematical symbols retain their proper dimensions. |
| Answer-key continuation pages lacked identity; guide sections were orphaned | Every student/key page carries night, form, and page identifiers. Measured pagination keeps worked answers together; lesson introductions and short closing advice stay grouped. |

Independent authors and reviewers also renewed mathematical review after generator
changes. Reviewers solved displayed questions before seeing their keys:
[Topic 1](2026-10-06-grade8-topic1-refinements.md),
[Topic 2](2026-10-06-grade8-topic2-refinements.md), and
[Topics 3–4](2026-10-06-grade8-topics3-4-refinements.md).
These reports record exact source hashes, seeds, accepted samples, and their
limits. The final scatter-plot correction also leaves room in the coordinate
frame for the true table value, including when the erroneous point is lower.

## Landing page and navigation

The new `index.html` is a lightweight library entrance with a coordinated
ivory/teal palette, original doorway illustration, clear course and test-prep
modules, and links to study/review tools. It loads neither test banks nor
progress storage. Course availability is explicit; empty grades or subjects
are not presented as existing courses.

Test practice moved intact to `practice.html`. SAT and ACT module links select
the requested test without changing stored progress or unfinished work. Legacy
practice, progress, review, and tips bookmarks redirect with their query and
hash preserved. Module pages link back to the landing page.

## Verification

Final course revision: **`7555e0460210b5e0`**. Final content SHA-256:
`3c61ae58c92195a664d50592853ff8f5dda5bb60dd6cec3ea97fe53013cc280d`.
The individual mathematical review reports bind all four generator sources;
the last Topic 4 source hash is
`c2d66d22bc4107898fc40ba297423a9c9d3534c83f2681ab1bbaeb6b3a2511e2`.

- `node tools/check-all.js` passed: syntax, content admission, existing SAT/ACT
  gates, course validation, fresh build, navigation/static checks, guide links,
  and **693 tests, zero failures**.
- `node tools/check-courses.js --reps 3000` passed **255,000 generated draws**
  across all 85 designs at the final source state.
- The integrity repair matrix verified all 36 single-lesson 200-question
  presets at three seeds, including the expanded small pools. Completed
  packets had no detected mathematical or exact visible repeats and balanced
  design use. Oversized narrow drills failed explicitly. The final graph-bound
  adjustment leaves mathematical identities unchanged.
- The pedagogy reviewer verified 501 assertions on worked visual mathematics
  and given/solution placement. Renewed independent sample solutions accepted
  the repaired generators. The last bounds-only adjustment received a further
  independent replay of all 84 accepted Topics 3–4 samples and 2,000 bound checks.
- Real Chromium navigation covered SAT/ACT module links, home return, four
  legacy routes, preserved local state, study-first entry, solution reveals,
  focused practice, student/key/guide print views, direct page printing,
  keyboard operation, dark mode, and 320/390-pixel widths. No severe console
  errors occurred. The landing page was separately reviewed with JavaScript
  disabled and at desktop, tablet, and phone sizes.
- Static student exports contained 236 questions and **zero answer nodes or
  active scripts/embedded documents**. Each student and key PDF page had its
  night/form/page identifiers; form sets matched. Guide exports contained all
  72 worked examples. Final page counts and text checks passed after regeneration.

The experience review's visual evidence is bound to revision `6cf7752c087f325c`,
before the last scatter-plot frame correction. The renderer, styling, and guide
content stayed unchanged afterward. Root regenerated the files below at the
final revision and rechecked page counts, identifiers, and answer exclusion.
These files supersede the earlier artifacts and PDF hashes in that report.

| Final artifact under `.scratch/print/` | Pages | SHA-256 |
| --- | ---: | --- |
| `reviewed-topic-1-practice/original-study-guide.pdf` | 14 | `5a8e4e7f55a2168ccb0ba8626b0f2731e24ecb301c08c7380338ac709e52029f` |
| `reviewed-topic-1-practice/student-worksheets.pdf` | 40 | `d931b4c57e44664dfbeab6d63a4d90b8764be197863151ee64ef776d4ddb73c2` |
| `reviewed-topic-1-practice/worked-answers.pdf` | 56 | `cbf6ab1c785bb9c9b671c1ef6c538d7ffca717d37642772bd0f11aafcfabb56e` |
| `reviewed-volume-study-guide/original-study-guide.pdf` | 57 | `fa8be859fa107c4e287c70a93397add180b51d5526562a23414487a2dffbc915` |
| `reviewed-volume-study-guide/student-worksheets.pdf` | 12 | `ba860dee3d36273ed31e61805b37fb86e3e3168d1be6373197c522a43088bea9` |
| `reviewed-volume-study-guide/worked-answers.pdf` | 18 | `5e3e30d8810dbeaaef160c1b2b10584e70787a7610f070e6b0e3dd14ee828103` |

Topic 1 uses `home-2026-10-06`, 20 questions × 10 nights, all 11 Topic 1 lessons.
The volume guide uses all 36 lessons with a separate 36-question review sheet,
seed `volume-review-2026-10-06`. Each directory also contains offline HTML and
a replay manifest. Local evidence is in `.scratch/cold-check-all.log`,
`.scratch/cold-deep-courses.log`, `.scratch/cold-final-browser/`, and
`.scratch/print/reviewed-verification.json`, alongside the individual reviewers'
evidence directories.

## Limits

These are independent agent reviews, mathematical checks, and sampled visual
inspections. They are not human educator approval, observed student outcomes,
or physical-printer testing. Browser PDFs were reviewed in Chromium; not every
PDF page received visual inspection.

Uniqueness is enforced within one packet, using explicit design identities and
visible content. Separate packets do not remember prior exposure, and the
identity contract is not a proof of every possible algebraic equivalence
between different designs. Oversized narrow drills may exhaust their finite
pools; they fail rather than fill the remaining pages with repeats.

Generated files under `.scratch/` are disposable workspace output. Save the
PDFs elsewhere before workspace cleanup. Source, tests, and review reports are
committed; textbook scans and student work are excluded. Nothing was physically
printed or published as part of this review.
