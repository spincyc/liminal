# Grade 8 cold pedagogical review

Date: 2026-10-06. Reviewer: independent `cold_pedagogy` agent. Baseline:
`8c79a1d`. Scope: the supplied volume's four topics and 36 lessons only.
This report does not demand coverage of a later volume or all Grade 8 standards.

## Method and coverage

I read every explanation, objective, worked example, pitfall, and practice
recommendation in `content/courses/grade-8-math.json`: 36 guides and 72 worked
examples. I then inspected three student-only samples of every exercise design:
35 designs in Topic 1, 22 in Topic 2, 14 in Topic 3, and 14 in Topic 4, for 255
samples. Each sample used seed `cold-pedagogy/<template-id>/<n>`, with `n` equal
to 0, 1, or 2. Only `prompt`, `table`, `graph`, and `workLines` were exposed.

The pedagogical observations were written before inspecting generator source
or worksheet keys. I then inspected all four generator sources to distinguish
actual restrictions from coincidences in a three-seed sample. No earlier
review reports were read. The coordinator reported another cold reviewer's
outlier-label finding after my initial observations had been recorded; that
overlap is corroboration, not additional independent coverage.

This is an instructional and editorial review, not a claim that all 255
answers were independently solved and recorded. I checked the 72 guide
examples for mathematical sense and worked arithmetic, and found no incorrect
guide result. Mathematical property testing and rendered PDF inspection are
separate review lanes. No student-performance evidence was collected.

Reproduce a student sample at the baseline with:

```js
const M = require('./src/lib/courses/math.js');
const E = require('./src/lib/courses/engine.js');
const id = 'g8-t4-scatter-outlier';
const t = E.templatesForCourse('grade-8-math').find(t => t.id === id);
const q = t.generate(M.random(`cold-pedagogy/${id}/0`));
console.log({ prompt: q.prompt, table: q.table, graph: q.graph,
  workLines: q.workLines });
```

## Findings requiring correction

P2 means a material answer cue, missing claimed practice outcome, or
instruction/practice mismatch. It does not mean the displayed mathematics is
incorrect. These findings were open at the reviewed baseline; final repair
verification belongs in the disposition below.

### P2-1 — The outlier's unique label gives away its identity

Lesson `4-1`, `g8-t4-scatter-outlier`. All baseline draws put the only label,
`P`, on the exceptional point. For seed `/0`, ordinary points are `(1, 6)`,
`(2, 12)`, `(3, 14)`, `(4, 20)`, `(5, 22)`, and `(6, 28)`; only `(3, 33)` is
labeled. The question asks students to identify the point far from the trend.
They can select the uniquely labeled point without interpreting the data.

Remove the unique-label cue: label every point consistently, or require an
approximate coordinate with no distinguishing label. Preserve the useful
explanation about investigating rather than automatically deleting an outlier.
This concerns irrelevant presentation information, not the mathematical fact
that an outlier looks different from its neighbors.

### P2-2 — Radical signs and decimal names predict classifications

Lesson `1-2`, `g8-t1-root-classification`. Every baseline draw contains one
positive radical with a nonsquare radicand, one negative radical with a perfect
square, a negative repeating decimal, and a fraction. The sole positive radical
is always the sole irrational number. For seed `/0`, the list is `−4.[5]`,
`4`, `−√64`, and `√193`. Choosing the positive radical succeeds without
deciding whether its radicand is a perfect square. Repeated practice can also
reinforce the false idea that the outside sign determines rationality.

Vary the outside signs independently of the radicands' rationality, include
both positive and negative rational roots, and occasionally vary the number of
irrational entries. Keep the request to justify each classification.

The companion `g8-t1-infinite-decimal-classification` always labels the
fixed-block decimal A and the increasing-gap decimal B. The complete answer
is therefore always “A rational; B irrational.” The distinction is worth
teaching, but the names should vary independently of the property. Swapping
the two descriptions and keeping their reasons attached is a bounded repair.

### P2-3 — Lesson 2-5 never practices its one-solution outcome

Guide `2-5` explicitly promises to distinguish one, no, and infinitely many
solutions. Its `g8-t2-classify-solutions` prompt offers all three outcomes,
but the baseline generator always uses equal variable coefficients; only the
constants vary. The result is always no solution or infinitely many solutions.
Its other design, `g8-t2-make-solution-type`, also uses only those two outcomes.

For seed `/0`, the classifier gives `2(x + 9) = 2x + 15`; `/1` gives
`3(x + 7) = 3x + 21`. Source inspection confirms that another seed cannot
produce a one-solution case. Earlier lessons have solve-for-x questions, but
selecting this lesson alone never tests the three-way distinction it names.

Add an unequal-coefficient branch to the same classification design. Require
students to state the simplified equation before classifying it, including the
one-solution value when appropriate. The creation task is useful as it stands.

### P2-4 — Fraction and signed-distribution practice are assigned out of sequence

Guide `2-3` teaches distribution of signed factors. Guide `2-4` first explains
clearing denominators. Nevertheless, `g8-t2-fraction-both-sides` belongs to
`2-3`, and `g8-t2-multistep-subtraction` belongs to `2-4`.

For seed `/0`, a `2-3` sheet can ask `(x − 7)/5 = (x + 0)/7`; the missing
first-step instruction appears in the next guide. Meanwhile, the direct
negative-factor practice `5x − 2(x − 3) − 5 = 28` appears in `2-4`.
The other `2-3` design has positive outside multipliers in every baseline draw.

Swap these two lesson assignments. This keeps the same exercises and design
count while placing the fraction procedure after its explanation and the
negative-factor practice beside the matching lesson. Alternatively, explicitly
teach denominator clearing in `2-3`, but that duplicates the next guide.

### P2-5 — Absolute-error model comparison lacks a worked introduction

Lesson `4-3`, `g8-t4-compare-fit-lines`, asks students to compare “the sums of
absolute vertical errors at all six points.” The guide introduces signed
residuals, and its examples list those residuals, but it neither defines an
absolute vertical error nor demonstrates summing them to compare models.

Seed `/0` compares `y = 2x + 10` and `y = 2x + 6` for outputs `7, 10, 13, 15,
16, 17` at inputs 1 through 6. A student needs twelve predictions and twelve
error magnitudes, followed by two sums; only five work lines are allocated.
The numerical work is valid, but the guide and writing space do not support
the newly required process well.

Add a compact worked comparison table with observed values, two predictions,
and absolute errors. Explain why opposite signed errors must not cancel when
measuring total distance from a line. Supply a matching student work table or
adequate space. A smaller alternative is to ask for a visual/residual
justification already taught in the guide. The independent integrity lane also
identified that the lower-intercept candidate always wins; that is a separate
cue to remove when repairing this design.

## Pedagogical improvements and bounded limitations

These are editorial recommendations, not additional claims of incorrect
mathematics or hard blockers to using the material with a teacher.

| Priority | Evidence | Bounded improvement |
| --- | --- | --- |
| P3 — Worked visual representations | All 72 baseline guide examples are text-only. Graph lessons give coordinate lists and two-way-table lessons describe counts in prose. No guide shows a model slope triangle, interval graph, scatter plot, or completed two-way table. | Add actual examples first in `2-8`, `3-6`/`3-7`, `4-1`/`4-2`, and `4-6`/`4-7`. Show the construction, not only its endpoint coordinates. A completed row-conditional table in `4-7` would also make “each row sums to 100%” visible. |
| P3 — Clusters are promised but not developed | Guide `4-1` names recognizing clusters in its objective, but does not explain a cluster or work through one. The two designs create linear, curved, no-association, or outlier patterns, with no separate-cluster branch. | Add a brief cluster definition and one cluster example/branch, or narrow the objective so it does not advertise an undeveloped subskill. |
| P3 — Sign of output versus direction of change | Guide `3-6` correctly distinguishes increasing from positive and includes a below-zero example. Its baseline graph practice has only nonnegative outputs; the three-stage design always rises, then stays constant, then falls. | Vary stage order and include negative-output graphs so students must inspect change rather than reuse the same positional description. |
| P3 — Incidental arithmetic and calculator guidance | The routine permits a calculator when approximation is requested, but exact exercises include cube roots of `21952` (`g8-t1-cube-edge-context`, `/1`), `12167` (`g8-t1-cube-face-dimensions`, `/0`), and classifying `15625` (`g8-t1-square-cube-categories`, `/2`). | Explicitly allow calculator-assisted root checks while requiring the exact answer and multiplication check, or keep routine exact powers within a smaller reference range. These numbers are mathematically valid; the concern is unnecessary computation obscuring the root concept. |

I do not treat every repeated task structure or fixed principle as answer
leakage. The causal-inference questions correctly retain the same caution:
association alone never establishes causation. Comparing prices immediately
before, at, and after a crossing is a useful scaffold even when its sequence
is deliberate. Numerical variants should be described honestly as practice
of those designs, not independent new reasoning tasks.

## Strengths and negative findings

- All 36 guides have a clear objective, worked examples, specific pitfalls,
  and advice connected to the skill. The text is mostly concise and suitable
  for a student who has the expected arithmetic prerequisites.
- The explanations correctly distinguish principal square roots from the
  solutions of a squared equation, repeating decimals from approximations,
  negative exponents from negative values, and changing a quantity from
  changing its units. They explicitly protect against several common errors.
- Equation guides use equality-preserving operations and original-equation
  checks. Modeling guides explain input restrictions, units, estimation,
  extrapolation, and the limits of causal conclusions.
- The course includes explanation, counterexample, error-correction, model
  construction, and parameter-creation tasks. It is not solely numerical
  substitution. No exact whole-question collision between a worked example
  and the 255 inspected student samples was observed. This sampled finding is
  not an exhaustive collision proof over every possible seed.
- Several apparent answer patterns in the three-seed sample were **not**
  generator defects. Source inspection confirms that the winner in
  `g8-t3-square-display-model`, the faster interval in
  `g8-t3-compare-increasing-intervals`, interpolation versus extrapolation in
  `g8-t4-inverse-prediction`, and the group comparison/association conclusion
  in `g8-t4-compare-conditional-frequencies` all vary already.
- Default packet size should be treated as an adjustable supply of homework.
  Problems vary substantially in work: a single conversion and a multi-stage
  graph/model task are not interchangeable units of time. No reliable nightly
  duration or measured difficulty can be inferred from the problem count.

## Baseline fingerprints

| File | SHA-256 at `8c79a1d` |
| --- | --- |
| `content/courses/grade-8-math.json` | `41af33dd51ab91d891008ad778abb096638c6a7eeb106592bb7dc80d971e9497` |
| `src/lib/courses/grade8-topic1.js` | `804efb7884df2dd0bf30c161696b1128586e2065a9a0c5c0638af6f47e7a8d85` |
| `src/lib/courses/grade8-topic2.js` | `42f5fda7d1b140a4a209f130eb7741f23140c49cad9ad78fb9bb697dedc8f528` |
| `src/lib/courses/grade8-topic3.js` | `60d64a447dced01903bdf226b978dac7b289ebed283970bb221372e8391c8b4d` |
| `src/lib/courses/grade8-topic4.js` | `8690d46d1998815d49c2667a14131aff3584d8efe9953371cab78ecf2e01c5a6` |
| `src/lib/courses/math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |
| `src/lib/courses/engine.js` | `11fbbc8f98f979a4bc6f1754be42a4201295df0d4393bcf9a12d4eeda8e36d97` |

## Disposition

The findings above describe the baseline. No production changes were made by
this reviewer. Repair review below distinguishes verified mathematics from
presentation still awaiting correction.

### First repair pass: guide mathematics and Topic 1

Guide source SHA-256:
`3ae603d31d46752c087a0fb74c0c5bf5f6e9fb36165e388ecd102a8a879bef1b`.
Topic 1 source SHA-256:
`b9bdbab109d6a698637ead940b58621b32414b06f581698a149b398e36382b4c`.

- **P2-2 corrected.** Three fresh student-only samples of each of the seven
  visibly changed Topic 1 designs were inspected with seed
  `cold-pedagogy-repair/<template-id>/<0,1,2>`. A separate display-only probe of
  1,000 classification draws found all four combinations of radical sign and
  rationality: 722 negative irrational, 760 negative rational, 785 positive
  irrational, and 733 positive rational entries. There were 493 draws with one
  irrational entry and 507 with two. The decimal rational label was A in 514
  draws and B in 486. These counts confirm that the specific baseline cues are
  removed; they are not empirical difficulty measurements.
- **Exact-root arithmetic burden improved.** The same 1,000-seed probe of
  root evaluation, cube-row context, and cube-face context found no perfect
  integer cube root above 12. Three samples of the expanded reciprocal-power
  design remained straightforward uses of the stated exponent rules. The
  revised routine also starts with 6–8 short or 3–4 longer problems and permits
  calculator checking of large products after choosing a method. This
  addresses the original workload recommendation without claiming a fixed
  completion time.
- **All added guide visual data checked.** I independently verified all 27
  graphs and 17 tables across 40 examples in 21 lessons. The checks reconstruct
  points from the stated data, evaluate model lines and verbal endpoints,
  compare slope-triangle ratios, recompute table entries and totals, and check
  graph containment and scales. My separate script passed 501 assertions; I
  did not use the author's verification script as the proof. This establishes
  the checked data, not their physical appearance in a browser or PDF.
- **The two changed example answers are correct.** Before opening their
  revised answer and step strings, I recorded the negative association,
  clusters at x = 1–2 / y = 10–12 and x = 7–8 / y = 2–4, and possible outlier
  `(5, 13)` in `4-1.2`. For `4-3.1`, I recomputed A's residuals as
  `1, −1, 0, −1, 1, 0` and B's as `−2, −4, −3, −4, −2, −3`, giving absolute
  error totals 4 and 18. The new explanations properly define absolute error,
  explain why signed errors must not cancel, and limit the claim to the two
  compared models. Cluster vocabulary is now explained as well.
- **New presentation defect found; not yet accepted.** The first visual repair
  renders every example table and graph before the interactive worked-solution
  disclosure. Some are completed solution artifacts: `4-3.1` already prints
  both error totals, `4-6.2` fills the very cell called unknown, `3-7.2` shows
  the requested sketch, and `4-1.2` labels its exceptional point “Possible
  outlier.” This prevents a genuine try-first experience. Consequently the two
  changed examples were not fully blind, even though I independently
  recomputed their results before reading answer/steps. The coordinator and
  authors received a field-by-field inventory. Keep genuine data and graphs
  in the prompt, put completed solution tables/graphs inside the disclosure,
  and remove answer-identifying labels from stimulus figures. Final placement
  and worksheet changes for Topics 2–4 remain to be verified.

Scratch evidence for this pass is under `.scratch/cold-pedagogy/`, including
`repair-blind-observations.md`, `verify-guide-visuals.py`,
`guide-visuals-verification-v1.json`, and
`topic1-countercue-verification.json`. The baseline and repair hashes above
make the reviewed states identifiable without retaining transient files.

### Second repair pass: disclosure placement and Topics 2–4

The guide placement defect above is corrected in source
`3c61ae58c92195a664d50592853ff8f5dda5bb60dd6cec3ea97fe53013cc280d`.
The data now distinguishes given tables/graphs from
`solutionTable`/`solutionGraph`. The renderer puts solution visuals inside the
interactive disclosure. I inspected every added visual's placement and
independently reran the 501 numerical/data assertions against the moved fields.
The final guide has 9 given tables, 13 given graphs, 14 solution tables, and 16
solution graphs; some examples have both a raw and completed view. In
particular, the error totals and completed sketches are hidden, missing
frequency-table entries remain unknown in the prompt, and the outlier no longer
has an answer label. The two changed examples retain the correct mathematics
recorded above. Physical browser/PDF rendering remains a separate check.

Topic 1's final source is
`fd6c7c8c79ad96890ba75bc1a84cbfe4633c16a8064acd2af4680c1912b9c317`.
Compared with the first repair hash, its only change is singular “zero” when
there is one zero in a decimal gap. I inspected that complete diff and replayed
the affected sample; it changes no mathematical property.

Topics 2–4 were inspected at these frozen source hashes:

| Source | SHA-256 |
| --- | --- |
| `grade8-topic2.js` | `84e3fa0313eec7c6376ce1a126ca88472a5b3e4466227339b63d5fd74331032f` |
| `grade8-topic3.js` | `209c2af7ea3b2653f348c452467180e2f758f52946c190839df78536de688ea3` |
| `grade8-topic4.js` | `5ec6e55807036f31871484407cf081f34baf209c2455c293d5b2ca44c54a56b4` |

I inspected 21 fresh student-only samples across the seven directly relevant
designs, with the same `cold-pedagogy-repair/<template-id>/<0,1,2>` seed rule.
Additional display-derived probes used `cold-pedagogy-repair-probe/<n>` for
`n = 0…999` on classification, outlier, fit-comparison, scatter-association,
and interval designs. These check the reported branches and cues; dedicated
mathematical reviewers separately assess the complete changed template set.

| Finding | Disposition and evidence |
| --- | --- |
| P2-1: uniquely labeled outlier | Corrected. All seven points have labels; the exceptional label varies. Independent coordinate-based selection across 1,000 samples found each of A–G as the outlier, 135–152 times each. Both trend direction and exceptional-point direction vary. |
| P2-2: sign/name classification cues | Corrected and retained through the final Topic 1 grammar-only change, as verified above. |
| P2-3: missing one-solution branch | Corrected. Deriving the result from the displayed equations gave one solution in 354, no solution in 354, and infinitely many in 292 of 1,000 draws. Probe seed 0 gives `5(x − 4) = 7x − 10`, with the single solution `x = −5`. |
| P2-4: lesson sequencing | Corrected. The fraction design now belongs to `2-4`; the signed-subtraction design belongs to `2-3`. |
| P2-5: absolute-error method and workspace | The guide now teaches and demonstrates the method. The lower-intercept cue is also corrected: the lower line won 502 probes and the higher line 498; A won 482 and B 518. Winning error totals varied from 2 through 20. At this frozen Topic 4 hash the student table still had only x/y columns and five work lines; the final handoff below resolves the remaining workspace issue. |
| P3: worked visual examples | Corrected within this review's data/placement scope. The guides now contain the requested representations, including slope triangles, interval graphs, scatter plots, and a completed row-relative-frequency table. |
| P3: undeveloped clusters | Corrected. The guide defines and demonstrates clusters; 193 of 1,000 scatter-association draws used the new separated-cluster branch. Probe seed 6 gives clusters at x = 1–2 / y = 5–7 and x = 6–7 / y = 22–24, supporting a positive overall association. |
| P3: positive versus increasing | Corrected. All six permutations of increase/constant/decrease occurred in the probe, and 620 of 1,000 graphs included negative output values. |
| P3: incidental exact-root arithmetic | Corrected by the bounded root ranges and clearer study routine described above. |

### Final disposition

**All five P2 findings and four P3 recommendations in this review are resolved
within the stated sampled scope. No open pedagogical finding remains.**

The final fit-comparison design provides six columns: input, observed output,
A's prediction/error, and B's prediction/error, plus a total row. I checked
1,000 draws with 8,000 assertions: displayed observations match graph points,
all four computed cells per observation remain blank, and only the two error
totals are writable in the total row. Its answer calculation and the varied
winner/error evidence above are unchanged. I also visually inspected the UI
reviewer's actual student PDF image, `wide-table/page2.png`: the table occupies
the full page width, the columns and writing rows are usable, and the graph and
reasoning space remain on the same page. That closes P2-5's writing-space
concern; it is one inspected PDF page, not a full print audit.

Final reviewed sources:

| Source | SHA-256 |
| --- | --- |
| `content/courses/grade-8-math.json` | `3c61ae58c92195a664d50592853ff8f5dda5bb60dd6cec3ea97fe53013cc280d` |
| `src/lib/courses/grade8-topic1.js` | `fd6c7c8c79ad96890ba75bc1a84cbfe4633c16a8064acd2af4680c1912b9c317` |
| `src/lib/courses/grade8-topic2.js` | `84e3fa0313eec7c6376ce1a126ca88472a5b3e4466227339b63d5fd74331032f` |
| `src/lib/courses/grade8-topic3.js` | `a9f8e90452a82cbe3fb72111c213b5a31f9d8ae1c6b286a085fe08dcbb9fbab2` |
| `src/lib/courses/grade8-topic4.js` | `6a1d57b4f95b0fd76ed9c6c773d7d739ead469e7b080806dc683d65ecb2e1355` |

I inspected the complete final source differences from the second pass.
Besides the fit work table, they expand the plotted-function and filling-rate
number pools and allow the erroneous scatter point to lie above or below its
correct position. They do not change the previously verified classification,
assignment, fit-calculation, cluster, or interval findings. Supplemental blind
mathematical review of those additional variants belongs to the mathematical
review lane. This report does not substitute for packet-uniqueness checks,
broader browser/PDF inspection, or classroom observation.

No production edits or commits were made by this reviewer. Review whitespace
checks passed. The final conclusions remain agent editorial judgments, not
human classroom approval or measured student difficulty.
