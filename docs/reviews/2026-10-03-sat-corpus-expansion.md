# SAT corpus repair and expansion — 2026-10-03

Baseline: `618d924`. The owner requested a cold SAT corpus review, repairs to
back-to-back repetition, additional Math and Reading/Writing designs with cold
authors and reviewers, and publication after integration.

## What the review established

The baseline had 317 designs: 189 Math and 128 Reading/Writing. Its automated
checks passed, but its domain-by-tier pools could not supply two consecutive
sections with the intended mixes and fresh designs. Representative consecutive
harder sections repeated three Math designs and thirteen Reading/Writing designs.
Reading/Writing's harder second module also borrowed three Medium questions,
producing eleven Hard questions instead of the requested fourteen. This was an
inventory limitation hidden by successful overall question counts.

Different generated IDs could also display identical content. For example,
`central-idea-academic-argument` seeds `2` and `17` displayed the same item but
ordinary accuracy treated them as separate questions. Printed fresh forms did
not consult browser serve history. The runtime repair is documented in the
[independent exposure review](2026-10-03-sat-exposure-review.md).

The review did not establish that every adjacent on-screen test contained
identical questions. Repeated design, repeated topic, and identical displayed
item are different findings and receive different checks.

## Repairs and admission

Cold author agents developed the additions, with the additional Hard designs
delegated individually. Separate reviewers solved displayed samples before
seeing keys, then inspected explanations,
distractors, difficulty and source impact. Fingerprint siblings were included:
an unchanged builder was not automatically accepted just because only its
neighbor changed. The per-lane reports identify authors, reviewers, coverage,
repairs and limits; the admission manifest retains their accepted answers.

The initial expansion targets increased when reviews rejected routine Hard
designs. These existing IDs now carry Medium tiers:

- Math: `probability-after-change`, `graph-which-function`,
  `inscribed-composite-solids`, and `quadratic-must-be-true`.
- Reading/Writing: `sec-nested-genitive-ownership`, `sec-dangling-modifier`,
  `notes-similarity-despite-difference`, `notes-stress-while-noting`,
  `notes-reconcile-findings`, and `transition-elaboration-kind`.

Three new grammar proposals, `sec-joint-separate-possession`,
`sec-infinitive-time-and-voice`, and `sec-reflexive-counterpart-reference`, were
retained at Medium after review. Additional
Hard designs replace lost capacity. Other rejected drafts were substantively
rewritten and re-reviewed; rubric scores were not raised merely to fill a quota.

Other repairs include:

- Shared scene identities for the Tallis program and Mary Rose contexts, so
  selection recognizes the same topic under different designs.
- Unambiguous rowing contrast and a revised survey-inference transition;
  relation-specific phrase choices remove plausible alternative answers.
- More demanding missing-vertex Math branches, exact inequality bounds, and
  complete integer and quadratic-sign explanations.
- Grammar context and punctuation alternatives, including optional apposition,
  restrictive-clause interpretation, temporal scope and source attribution.
- Reading feedback that distinguishes an accurate but irrelevant fact from an
  unsupported claim, and explicit fictional framing for an invented study.
- Study guidance and progress wording that distinguish editorial difficulty
  and first recorded answers from measured readiness or proven first exposure.

## Capacity and limitations

`test/sat-freshness.test.js` requires enough designs in every domain × tier cell
for two consecutive sections on either route. It exercises actual full-test
module seeds, routing and serve history, with harder/harder, easier/easier and
both mixed route pairs. It checks every module's intended mix and rejects
repeated designs, displayed identities and scenes across each pair.

This is a finite corpus with bounded recent history and a bounded draw search.
Narrow skill drills can exhaust their material. Aggregate notices explain reuse;
identical displayed items do not inflate recorded accuracy. Old attempts without
displayed-content identities cannot be retroactively deduplicated across seeds.
Deliberate replay codes reproduce their pinned questions.

These are sampled independent agent judgments, not human editorial approval,
empirical SAT calibration or a score conversion. The app retains official
practice tests as the score gauge and does not predict scaled SAT scores.

## Final verification

The expanded corpus contains 360 designs, an increase of 43. The additions are
32 Hard, 8 Easy and 3 Medium designs; the ten existing Hard-to-Medium retiers
are included in the final totals below.

| Section | Easy | Medium | Hard | Total |
| --- | ---: | ---: | ---: | ---: |
| Math | 48 | 99 | 50 | 197 |
| Reading and Writing | 42 | 75 | 46 | 163 |
| Combined | 90 | 174 | 96 | 360 |

The independent review records describe each lane's new designs, repairs,
source impact, sample coverage and limits:

- [Math](2026-10-03-sat-math-expansion.md)
- [Craft and Structure](2026-10-03-sat-craft-expansion.md)
- [Standard English Conventions](2026-10-03-sat-conventions-expansion.md)
- [Expression of Ideas](2026-10-03-sat-expression-expansion.md)
- [Information and Ideas](2026-10-03-sat-information-expansion.md)

Every final design passed 3,000 integer and 3,000 runtime-shaped seeds:
1,182,000 Math draws and 978,000 Reading/Writing draws, or 2,160,000 draws
covering the final corpus. The final Boundaries explanation correction received
an additional 138,000-draw pass. A subsequent Structure choice-opener correction
received renewed blind review, a 78,000-draw deep pass and a 7,800-draw default
pass; all other R/W source hashes remained unchanged.
These automated gates check structure, declared invariants and statistical
answer-choice tells. The independent displayed-sample reviews address meaning
and difficulty; neither establishes empirical SAT calibration.

The manifest contains 360 current reviews: 208 renewed or new source-bound
records and 152 unchanged records. A 100-full-test stress run exercised 9,800
questions and 99 adjacent pairs with shared history, alternating harder and
easier routes. Every module retained its intended blueprint; adjacent pairs
repeated zero designs, visible identities or scenes. This is measured coverage
of those seeds and routes, not a guarantee against future finite-pool reuse.

Chromium verification completed a 98-question full test with Save and exit,
reload and resume. Its harder route contained 23 Hard R/W questions and 19 Hard
Math questions. Progress export/import preserved all 98 item identities.
Booklet and answer-key opens shared exposure history, reused a pinned code
without double counting within the page, and gave a new code after a reroll.
Learn links and 390-pixel report/progress layouts passed, with no browser errors.
Browser answers used saved keys to exercise the application; that is separate
from the independent blind content reviews.

`TZ=UTC node tools/check-all.js` passes on the integrated tree: content admission,
360 current source-bound reviews, the default family gate, build, static smoke,
Learn/study-guide checks and all 598 unit tests. Node 26.10.0 ran the package
entry point directly because npm was unavailable locally. No dependencies were
installed. GitHub's deployment workflow runs the same gate on Node 24.
