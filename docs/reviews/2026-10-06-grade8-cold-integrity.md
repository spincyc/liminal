# Grade 8 cold review: repetition, coverage, and answer cues

Reviewed **8c79a1d4332078455008842acddca3930dfdbc94**, before the ensuing fixes.
This is a source-aware independent review of the initial implementation, not
human editorial approval or a full mathematical proof. The repair verification
appended below covers the subsequent frozen sources. Earlier review conclusions were not read. No production files were edited.

## Scope and reproducibility

Inspected `src/lib/courses/engine.js`, `math.js`, all four Topic generators,
`src/app/course-render.js`, and the CLI's student projection. Generated 129 packets
containing 42,600 questions:

- For each of `cold-integrity-a`, `cold-integrity-b`, and `cold-integrity-c`:
  all 36 lessons together, each of the four topics, and each individual lesson;
  every packet had 10 nights of 20 questions.
- With `cold-integrity-large`: all lessons together and each of lessons 2-9,
  2-11, 3-2, 3-5, and 4-3; each had 30 nights of 100 questions.
- Separately generated all 36 single-lesson drills at 20 nights of 10 questions
  with `cold-integrity-a`, adding 7,200 questions. The same four lessons repeated
  exact items as in the 10-night configuration.

No tested settings threw a generation error. A repeated all-lesson default packet
was byte-for-byte deterministic. The three default all-lesson packets covered all
36 lessons, but a separate coverage search found a reproducible omitted lesson.

Reproduce a cited packet using the reviewed checkout:

```js
const E = require('./src/lib/courses/engine.js');
const course = require('./content/courses/grade-8-math.json');
const templates = E.templatesForCourse(course.id);
const packet = E.generatePacket(course, templates, {
  seed: 'cold-integrity-b', days: 10, count: 20, lessonIds: ['1-3']
});
// Night 1, questions 6 and 9:
console.log(packet[0].questions[5], packet[0].questions[8]);
```

The lane's temporary scripts, immutable source snapshot, aggregate results,
semantic examples, and Chromium screenshot are under `.scratch/cold-integrity/`.
They are disposable verification output, not required inputs to this report.

## High: semantic duplicates bypass the identity check

`identity` serializes the prompt, table, and graph exactly. Reordering a set or a
relation, renaming the same variable, and changing a unit label can therefore
make the same mathematical exercise appear new. Some repeat on the same sheet,
without a warning.

| Seed; selected lesson | Locations | Duplicate mathematical exercise |
| --- | --- | --- |
| `cold-integrity-b`; 1-3 | Night 1, #6 and #9 | `g8-t1-order-and-plot`: the same set `{12.2, 12.[3], 12 3/4, √145}`, reordered. |
| `cold-integrity-b`; 3-1 | Night 1, #4 and #14 | `g8-t3-relation-table`: the same relation `{(−6,−2), (−4,−2), (−5,0), (−3,2)}`, with rows reordered. |
| `cold-integrity-a`; 1-7 | Night 1, #14 and #17 | `g8-t1-negative-power-denominator`: `(1/(m^−5)) × m^−8` versus `(1/(p^−5)) × p^−8`. |
| `cold-integrity-a`; 2-7 | Night 1, #1 and #3 | `g8-t2-compare-table-equation`: A has `(2,8),(4,16),(6,24)` and B has `y = 2x`; only “pages” changes to “cards.” |
| `cold-integrity-a`; Topic 3 | Night 8 #1 and night 9 #17 | The identical relation `{(0,4),(−2,4),(−1,6),(1,8)}`, reordered. |

For the 200-question `cold-integrity-a` drills, a conservative per-design
normalization found 11 additional duplicate occurrences in 1-3, 8 in 1-6, 40 in
1-7, and 37 in 3-1, beyond exact-string repeats. Lesson 2-7 had 35 exact duplicates
plus 80 additional cosmetic duplicates. The all-lesson maximum packet had zero
exact duplicates but 18 additional normalized duplicates. These are sampled
counts, not exhaustive counts of every possible equivalence.

Smallest coherent fix: an explicit per-design semantic identity, computed from
meaningful inputs before display shuffling or cosmetic substitutions. Examples:

- Ordering/classification sets: sorted displayed values; relation-table: sorted
  coordinate pairs. Do not sort arbitrary tables globally, since row order can
  matter in other tasks.
- Single-variable exponent designs: numeric exponents/coefficient and operation,
  omitting the variable name. Sort factors for a commutative product, but preserve
  the roles of numerator/denominator or inner/outer powers.
- Production-rate comparison: the two rates, excluding the interchangeable unit
  word. Scientific multiplication can likewise canonicalize its two operands.

Check both per-sheet and packet-wide identities. Do **not** deduplicate by answer:
different equations and graphs can legitimately have the same answer.

## High: advertised default drills knowingly repeat exact items

The engine falls back to an item from an earlier night when its search finds no
new item, increments `reused`, and emits a warning. That is disclosed behavior,
but it does not satisfy a strict no-duplication requirement.

| Single lesson; 200 questions | Exact repeated occurrences, across the three seeds | Distinct pool / observed result |
| --- | ---: | --- |
| 2-7 | 35 / 35 / 35 | 165 exact visible items; only 85 after removing interchangeable unit words. |
| 2-11 | 98 / 98 / 98 | 48 slope-intercept plotting prompts plus 54 equation-from-graph prompts = 102. |
| 3-2 | 4 / 5 / 4 | 28 rule-table-graph prompts plus 168 graph-function-rule prompts = 196. The middle seed found only 195. |
| 3-5 | 83 / 83 / 83 | 45 square-display models plus 72 rental comparisons = 117. |

At 30 × 100, lesson 2-9 repeated 2,706 items; 2-11 repeated 2,898; 3-2 repeated
2,804; and 3-5 repeated 2,883. Exact repeats remained absent within each individual
sheet in the audit.

For strict no-repeat behavior, remove the prior-night fallback and reject the
packet with actionable advice to reduce total questions or select more lessons.
The search is bounded, so say “could not find enough distinct exercises under
these settings” unless capacity is actually established. The 195-of-196 result
shows why a random search failure alone does not prove true exhaustion. Report
which lesson constrained generation; do not suggest changing the seed guarantees
more capacity. A later independent packet currently has no exposure history, so
this guarantee must explicitly apply within a packet.

## Medium: tiny pools silently remove entire practice modes

Even without exact repeats, the sibling-design fallback can replace most of a
lesson's intended variety. With `cold-integrity-a`, 10 nights × 20 questions:

| Lesson | Small design, exact pool and actual selections | Sibling selections |
| --- | --- | ---: |
| 2-8 | `slope-triangles`: 18 of 18 | 182 slope-from-points |
| 2-9 | `graph-y-mx`: 14 of 14 reduced slopes | 186 missing-value problems |
| 2-10 | `intercept-graph`: 18 of 18 graphs | 182 table problems |
| 3-2 | `rule-table-graph`: 28 distinct prompts; 30 selections including reuse | 170 graph-rule problems |
| 4-3 | `write-fit-line`: 15 of 15 prompts | 185 compare-fit problems |

Thus “cycles question designs” is only the initial preference, not a maintained
practice mix. Expand these pools with meaningful, mathematically checked input
variation and additional presentations. Track design exposure across the packet;
if balanced practice is part of the contract, report the constraint instead of
silently substituting almost every later graph-writing task. Strict rejection
alone stops duplicates but does not repair design starvation.

## High: the all-lesson default can omit a selected lesson entirely

```js
E.generatePacket(course, templates, {
  seed: 'cold-coverage-27', days: 10, count: 20
});
```

This produces **zero lesson 2-11 questions among 200 questions**. Other lessons
appear two to nine times. The worksheet resets the lesson shuffle and use counts
on every night; because 20 is less than 36, there is no packet-level coverage
cycle. This was the first omission found in a sequential search of seeds
`cold-coverage-0` through `cold-coverage-27`.

Smallest fix: preserve deterministic lesson scheduling across nights, using a
packet-level cycle or least-used counts. Preserve per-sheet balance while ensuring
that a sufficiently long packet serves every selected lesson. The same principle
applies to design offsets if coverage of all designs is intended.

## Medium: answer cues and invariant subanswers weaken repeated practice

These are content-level cues, separate from hidden solution leakage.

- **`g8-t4-scatter-outlier`: only the outlier is labeled P, and P is always the
  requested point.** For seed `cold-display-17/g8-t4-scatter-outlier`, P is
  `(3,37)` while six unlabeled points form the rising main trend. Label all
  points comparably, or label none and ask for approximate coordinates. The
  request to describe the trend and explain whether to delete the observation
  still requires worthwhile reasoning.
- **`g8-t4-compare-fit-lines`: the lower-intercept line always wins, and its total
  absolute error is always 4.** Randomizing A/B does not remove the shortcut.
  The residual multiset is always `[-1,-1,0,0,1,1]`; the competing line is always
  3–5 units above it. In the display sample A is `4x+9`, B is `4x+4`, and the
  totals are 30 and 4. Vary the signed displacement and residual magnitudes,
  independently recomputing the requested totals. This matters especially when
  the tiny writing pool leaves 185 comparison problems in the default drill.
- **`g8-t1-infinite-decimal-classification`: A is always rational and B always
  irrational.** Change the assignment of the two descriptions to labels. The
  explicit repetition/nonrepetition rule is necessary mathematical information,
  not itself a leak; the fixed A/B mapping is the avoidable shortcut.
- **`g8-t2-intercept-graph`: the only coordinate label is the requested intercept
  `(0,b)`.** The sample visibly prints `(0,4)`. This is a weaker cue: recognizing
  that it is the initial amount and explaining units remain valid tasks. Label
  another given point comparably or use a readable unit scale without printing
  the sought ordered pair if independent graph reading is intended.

Further limited variety, not a wrong key: `construct-scatter` always produces a
positive approximately linear association; `model-prediction` always asks for an
input inside the observed range; `root-classification` always has exactly one
irrational candidate, the positive nonsquare root. Mix these cases if the
associated classification is meant to be independently practiced. Repeated
mathematical principles such as “association does not prove causation” are valid
learning targets and should not be randomized merely to force different answers.

## Contrary evidence and limits

Eight fresh student payloads used seed `cold-display-17/<templateId>`:
`infinite-decimal-classification`, `root-classification`, `intercept-graph`,
`sketch-filling-rates`, `scatter-outlier`, `compare-fit-lines`, `model-prediction`,
and `relative-frequency-denominators`. Their displayed prompts, tables, and
student graphs were solved before opening those generated keys. All eight
solutions agreed. Source had already been inspected, so this was not a fully
blind mathematical review.

Rendered those eight student samples using installed Chromium with the pinned
renderer. The screenshot confirms the P-only outlier cue and printed intercept.
DOM inspection found eight question nodes, no answer or question-metadata nodes,
and only the given marks on the three supplied graphs. The blank filling grid
had no points or lines in its SVG, accessible label, or title. Its rounded vertical
bound narrows a possible final range but does not reveal the exact answer; the
sample still required calculating `(0,6),(3,9),(6,18),(8,18)`. No material answer
leak was established from blank axis bounds.

The CLI student projection explicitly excludes `answer`, `steps`, `check`,
`templateId`, `signature`, and answer-only point/line data. Student questions do
not print skill labels or per-question lesson titles. Screen-reader coordinates
of **given** graph points are an accessible representation of the problem, not
hidden solution data. This review did not find answer-key contamination of
student output. It did not constitute a PDF pagination review or an exhaustive
proof of all generated mathematics.

## Source fingerprints

SHA-256 at the reviewed commit:

| File under `src/lib/courses/` | SHA-256 |
| --- | --- |
| `engine.js` | `11fbbc8f98f979a4bc6f1754be42a4201295df0d4393bcf9a12d4eeda8e36d97` |
| `math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |
| `grade8-topic1.js` | `804efb7884df2dd0bf30c161696b1128586e2065a9a0c5c0638af6f47e7a8d85` |
| `grade8-topic2.js` | `42f5fda7d1b140a4a209f130eb7741f23140c49cad9ad78fb9bb697dedc8f528` |
| `grade8-topic3.js` | `60d64a447dced01903bdf226b978dac7b289ebed283970bb221372e8391c8b4d` |
| `grade8-topic4.js` | `8690d46d1998815d49c2667a14131aff3584d8efe9953371cab78ecf2e01c5a6` |

`src/app/course-render.js`:
`144a92e05a06697a470567bbee3ac29c4c060878bd6e57cf048ba545eb099efa`.

## Repair verification — frozen revision, 2026-10-06

The findings above describe the original commit. The following verification
supersedes their open/closed status for the source fingerprints below. No new
integrity blocker was found within this review's scope. This is sampled agent
verification, not a guarantee of unlimited unique practice or a renewed full
mathematical/print review.

### Duplicate prevention and practice balance: repaired

Repeated the three original seeds for all lessons, all four topics, and every
single lesson at 10 nights × 20 questions; the original six maximum-size cases;
all 36 single lessons at 20 nights × 10 questions; `cold-coverage-27`; and one
insufficient-coverage case. Of 167 requested packets, 152 completed and returned
38,620 questions. Successful packets contained **zero exact visible duplicates
and zero duplicates under the independent normalizations used in this review**.
Checks compared prompts/tables/graphs and normalized mathematical givens rather
than merely accepting each question's supplied `practiceKey`.

The original reordered-set, reordered-relation, variable-renaming, and unit-word
counterexamples no longer enter a completed packet together. To verify the keys
more directly, generated 5,000 draws from each of seven designs:
`order-and-plot`, `relation-table`, `negative-power-denominator`,
`product-of-powers`, `power-of-product`, `compare-table-equation`, and
`scatter-outlier`. Independent normalization of their displayed/input givens
agreed with key equivalence throughout these 35,000 draws: equivalent tasks did
not get different keys, and a shared key did not merge distinct normalized
givens. This includes changed labels on the same outlier plot. It does not prove
that every conceivable mathematical equivalence is recognized across all 85
designs.

The engine now separately rejects an exact repeated visible item even if its
authored key differs. A synthetic two-night case deliberately changed the key
while repeating the same question; generation rejected the second night. Seed
replay remained deterministic.

`cold-coverage-27` now includes all 36 lessons five or six times and all 85
designs at least once. For every completed audited packet, selected lesson totals
differed by at most one, and design totals within a lesson differed by at most
one. At 200 questions, lessons 2-8, 2-9, 2-10, 3-2, and 4-3 now give exactly 100
questions to each design; the original silent graph/writing starvation is gone.
A 20-question packet selecting all lessons warns that at least 36 total
questions are needed to include them all.

### Finite capacity: explicit rejection, with useful reductions verified

The 15 rejected requests were:

- Lessons 3-1, 3-7, and 4-2 at 200 questions for all three original seeds, plus
  their 20-night × 10-question variants: 12 requests.
- Single-lesson 3,000-question packets for 2-9, 2-11, and 3-2: three requests.

Each error named the limiting lesson and said:
“Could not find enough distinct exercises for lesson … under these settings.
Try fewer questions or nights, or select more lessons.” No packet was returned
with recycled questions or silently substituted sibling designs. The wording
correctly avoids claiming that a bounded search establishes exact exhaustion.
The all-lesson 3,000-question packet and the 3,000-question lesson 3-5 and 4-3
packets completed without detected duplicates.

For `cold-integrity-a`, useful reductions were verified: lesson 3-1 succeeded at
160 questions (10 × 16), 3-7 at 180 (10 × 18), and 4-2 at 150 (10 × 15), adding
490 completed questions to the matrix above. These are reproduced successful
settings, not universal advertised capacities. The remaining narrow-drill limit
is visible behavior, not an undisclosed repeat. Separate packets still do not
share exposure history.

### Avoidable answer cues: repaired in the sampled designs

Generated 100 fresh instances per design using
`cold-refined-cues/<0..99>/<templateId>`:

| Check | Observed result |
| --- | --- |
| Infinite decimal A/B assignment | A rational in 55 samples; B rational in 45. |
| Outlier labeling | All seven points labeled comparably in every sample; each of A–G occurred as the outlier. |
| Fit-line choice | A won 56 times, B 44; the higher-intercept model won 58 times and the lower 42. |
| Fit-line error calculation | Independently recomputed totals from the displayed equations and table; all matched. Winning absolute-error totals included every integer from 2 through 18. |
| Intercept graph | Two points labeled A/B, neither with the requested coordinate printed; unit vertical scale. Both filling and draining examples occurred. |
| Model prediction | 53 interpolation and 47 extrapolation examples. |
| Construct scatter plot | Positive, negative, nonlinear, and no-association data all occurred. |

The original P-only cue, copied intercept coordinate, fixed A/B decimal answer,
lower-intercept shortcut, and constant total error of 4 are therefore closed for
these fingerprints. This follow-up checked source/payload behavior, not a new
browser or PDF rendering pass; the earlier browser findings remain explicitly
bound to the earlier renderer. Broader teaching quality belongs to the separate
pedagogical review.

### Verified source fingerprints

SHA-256 was recorded before testing and rechecked afterward; all files remained
unchanged during this follow-up.

| File | SHA-256 |
| --- | --- |
| `src/lib/courses/engine.js` | `bcb72e4b6ca98677193e4e6ef104de41f4d821b5d6ba3f709b4a8d30de2dc092` |
| `src/lib/courses/math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |
| `src/lib/courses/grade8-topic1.js` | `fd6c7c8c79ad96890ba75bc1a84cbfe4633c16a8064acd2af4680c1912b9c317` |
| `src/lib/courses/grade8-topic2.js` | `84e3fa0313eec7c6376ce1a126ca88472a5b3e4466227339b63d5fd74331032f` |
| `src/lib/courses/grade8-topic3.js` | `209c2af7ea3b2653f348c452467180e2f758f52946c190839df78536de688ea3` |
| `src/lib/courses/grade8-topic4.js` | `5ec6e55807036f31871484407cf081f34baf209c2455c293d5b2ca44c54a56b4` |
| `content/courses/grade-8-math.json` | `3c61ae58c92195a664d50592853ff8f5dda5bb60dd6cec3ea97fe53013cc280d` |

### Final pool expansion and fit-line workspace — superseding follow-up

The subsequent frozen change expands only `vertical-line-points`,
`sketch-filling-rates`, and `correct-scatter-point`, and adds an unfilled working
table to `compare-fit-lines`. The first three ordinary-drill limitations above
are now closed: each of lessons 3-1, 3-7, and 4-2 completed 200 questions for all
three original seeds in both configurations (10 × 20 and 20 × 10). These 18
packets contained 3,600 questions with zero exact or independently normalized
duplicates and exactly 100 questions from each design. All given graph points
were inside the displayed bounds. Combined with the unchanged designs' earlier
results, every one of the 36 ordinary 200-question lesson presets has passed
three seeds in this review.

Compared 100 fit-line instances with their immediately preceding version. The
practice key, prompt, graph, answer, steps, and six observed coordinate pairs were
unchanged. Every newly added prediction/error cell was blank; the totals row
contained only labels, dashes, and blank error totals. The workspace adds no
solution numbers and does not create a new identity for the same mathematical
task. The initial local assertion assumed six table rows; it was corrected to
account for the intended seventh totals row, then all 100 comparisons passed.

At 3,000 questions, these three narrow lessons still reject with the same
lesson-specific, actionable error rather than recycle items. The overall claim
remains distinct practice **within one generated packet**, subject to finite
capacity; no cross-packet exposure history is implied. No open integrity blocker
remains in the reviewed changes. Print layout of the wider working table remains
outside this follow-up's scope.

The engine and all other fingerprints in the preceding table are unchanged.
The final Topic 3 and Topic 4 fingerprints supersede that table's corresponding
entries:

| File | Final SHA-256 |
| --- | --- |
| `src/lib/courses/grade8-topic3.js` | `a9f8e90452a82cbe3fb72111c213b5a31f9d8ae1c6b286a085fe08dcbb9fbab2` |
| `src/lib/courses/grade8-topic4.js` | `6a1d57b4f95b0fd76ed9c6c773d7d739ead469e7b080806dc683d65ecb2e1355` |
