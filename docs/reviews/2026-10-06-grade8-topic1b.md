# Grade 8 Topic 1 review: lessons 1-6 through 1-11

Independent reviewer: `review_topic1b` (agent), 2026-10-06.

**Outcome: 57 sampled questions accepted, 0 rejected.** All independently
derived answers agree mathematically with the final keys. No blocking wording
ambiguity or mathematical error in the sampled explanations was found.
This is sampled agent review, not human editorial approval or measured
student difficulty.

## Scope and procedure

The coordinator supplied 19 templates with three displayed samples apiece.
I read the prompts, solved all 57 before opening their keys or generator
source, and recorded an answer and derivation for every sample in
`.scratch/review-topic1b/answers.json`. Simple fraction and context arithmetic
was checked with Python using only numbers in the displayed prompts.
I then compared the answers and individually inspected the key explanations.

During review, the author corrected an estimated-ratio input-range defect.
The only changed displayed sample was `g8-t1-estimated-ratio:review-a`:
the blue count changed from 1,090,000 to 1,220,000. Both round to 1,000,000.
I recorded the refreshed derivation in `changed-answers.json` before opening
the final keys; the original key was already known at that point. The final
solution set and comparison are in `final-answers.json` and `comparison.json`.
Only the final source fingerprints below are accepted by this report.

Subsequent explanation edits in lesson 1-2, number-line input-separation
changes in lesson 1-3, and a `numberLine: true` rendering flag on that lesson's
graphs changed the shared source file's fingerprint. Replaying all 57 exact
sample seeds against the final integrated source confirmed that every prompt,
answer, and ordered explanation step in this review's lessons was unchanged.
`post-wording-replay.json` and `post-numberline-replay.json` record those checks.

After solving and comparing, I inspected the relevant generator branches and
shared arithmetic helpers. In particular, the corrected blue mantissa range
is 100–135 when the intended one-digit coefficient is 1; when it is 2, the
range is 165–235. Those ranges round to the stated coefficients. The earlier
defect did not manifest in the three original sampled ratio questions.
The author's property testing is separate evidence and was not rerun or
counted as independent blind solving here.

## Sample ledger

Every row represents the three full sample IDs formed by adding
`:review-a`, `:review-b`, and `:review-c` to the listed template ID. Columns
A, B, and C record my solved answers in that order. **Every listed sample
is accepted**, including its final explanation. Different minus glyphs,
parentheses around denominators, and equivalent exact fractions/decimals
were compared mathematically rather than as literal strings.

To reproduce a sample, choose the named template from
`require('./src/lib/courses/grade8-topic1.js')`, let `seed` be `review-a`,
`review-b`, or `review-c`, and call
`template.generate(M.random(seed + '/' + template.id))`, where
`M = require('./src/lib/courses/math.js')`.

| Lesson | Template ID | A | B | C |
| --- | --- | --- | --- | --- |
| 1-6 | `g8-t1-product-of-powers` | `m^13` | `t^11` | `p^10` |
| 1-6 | `g8-t1-power-of-power` | `m^-32` | `t^10` | `a^-4` |
| 1-6 | `g8-t1-power-of-product` | `70^4` | `40^-1` | `52^4` |
| 1-6 | `g8-t1-quotient-of-powers` | `a^-2` | `t^-9` | `a^1` |
| 1-7 | `g8-t1-negative-power-reciprocal` | `-12/m^6` | `4/b^8` | `-1/t^6` |
| 1-7 | `g8-t1-negative-power-denominator` | `b^0 = 1` | `t^3` | `p^-2 = 1/p^2` |
| 1-7 | `g8-t1-evaluate-zero-negative-powers` | `632/49` | `349/49` | `89/9` |
| 1-8 | `g8-t1-estimate-large` | `2 × 10^5` | `9 × 10^8` | `8 × 10^9` |
| 1-8 | `g8-t1-estimate-small` | `9 × 10^-4 m` | `4 × 10^-4 m` | `2 × 10^-4 m` |
| 1-8 | `g8-t1-estimated-ratio` | about 200 times | about 20 times | about 100 times |
| 1-9 | `g8-t1-large-scientific-notation` | `7.03 × 10^5` | `4.07 × 10^5` | `2.04 × 10^11` |
| 1-9 | `g8-t1-small-scientific-notation` | `1.17 × 10^-4 mm` | `4.14 × 10^-3 mm` | `2.31 × 10^-7 mm` |
| 1-9 | `g8-t1-scientific-to-decimal` | `0.566` | `87.7` | `46.1` |
| 1-10 | `g8-t1-scientific-product` | `5.529 × 10^5` | `2.646 × 10^-9` | `1.56 × 10^-6` |
| 1-10 | `g8-t1-scientific-quotient` | `2.875 × 10^-5` | `4.5 × 10^-3` | `3.25 × 10^-4` |
| 1-10 | `g8-t1-scientific-sum` | `7.7036 × 10^0` | `6.6061 × 10^5` | `9.57 × 10^-1` |
| 1-10 | `g8-t1-scientific-difference` | `8.844 × 10^4` | `5.786 × 10^-4` | `5.023 × 10^2` |
| 1-11 | `g8-t1-model-storage-comparison` | `5.85 × 10^6 bytes`; 11700 times | `3.9 × 10^5 bytes`; 9.75 times | `1.32 × 10^7 bytes`; 1650 times |
| 1-11 | `g8-t1-model-square-covering` | `720 cm`; `5.4 × 10^3 cm^2` | `496 cm`; `3.844 × 10^3 cm^2` | `1176 cm`; `1.2348 × 10^4 cm^2` |

## Mathematical and pedagogical findings

- Exponent rules and sign scope are explicit. Nonzero assumptions are stated
  for symbolic negative/zero powers and quotients. Substitution in
  `g8-t1-evaluate-zero-negative-powers:review-b` gives
  `6/(-7)^2 + 7(-9)^0 = 6/49 + 7 = 349/49`; the negative value of the base
  does not make its even power negative. The reciprocal questions leave
  negative coefficients in the numerator.
- The reciprocal-product samples cover a zero, a positive, and a negative
  resulting exponent. The zero case is `b^(4-4) = b^0 = 1`; the nonzero
  assumption makes that simplification valid.
- Rounding tasks specify one significant digit. Ratio tasks explicitly round
  each input first, then divide. For the final ratio A sample,
  `233000000 → 200000000`, `1220000 → 1000000`, and the estimated ratio is
  200. No exact quotient of the original counts is incorrectly substituted.
- Scientific notation tasks distinguish exact conversion and arithmetic
  from estimates. Internal zeroes are preserved in `7.03`, `4.07`, and
  `2.04`. Coefficients are normalized, and exact results retain all needed
  digits. For example, `660000 + 610 = 660610 = 6.6061 × 10^5`; adding the
  exponents would be incorrect. Every sampled quotient terminates exactly.
- Contexts give enough information. File counts multiply per-file byte
  amounts; dividing bytes by bytes gives a dimensionless comparison.
  Storage B is `390000 / 40000 = 39/4 = 9.75`, so the key's fraction and
  my decimal are equivalent exact answers. For square-panel C, a side is
  `√1764 = 42 cm`, strip length is `7 × 4 × 42 = 1176 cm`, and combined
  area is `7 × 1764 = 12348 cm^2`. The wording says the panels are separate
  and each receives its own perimeter strip, avoiding a shared-edge issue.
- Some valid expressions have more than one acceptable written form.
  For example, a positive power can be regrouped into another integer-base
  power. The sample keys are correct exemplars; this review does not require
  literal-string matching or establish an exhaustive list of equivalent
  answers. No alternate interpretation changes a sampled numerical result.

## Provenance and limits

Accepted final SHA-256 fingerprints, checked against the files after review:

| File | SHA-256 |
| --- | --- |
| `src/lib/courses/math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |
| `src/lib/courses/grade8-topic1.js` | `804efb7884df2dd0bf30c161696b1128586e2065a9a0c5c0638af6f47e7a8d85` |

The original question snapshot SHA-256 was
`0dad37a252e07800a1a084ba31017ac9f3f9e1b19e70eea186166c629460b5e6`.
The final question snapshot SHA-256 is
`24ab5721e2570a129d1e447eb8b2debaf3aac21062ee88f802b03983381894ea`.
Scratch artifacts are temporary; the sample ledger, derivations,
final source hashes, and disposition in this report are the durable record.

This review covers lessons 1-6 through 1-11, not the earlier lesson branches
in the same source file. Three seeds per template do not prove every
possible output correct or measure grade-level difficulty. The displayed
samples contain no graphs or tables; browser typesetting, screen layout,
and printed-page rendering were not inspected in this lane. The referenced
`docs/classroom-courses.md` was added during review and was read before this
report was finalized; the work follows its independent-sampling protocol.
No production code was changed.
