# Grade 8 Topic 1, lessons 1-1 through 1-5: independent sample review

Date: 2026-10-06. Reviewer: independent agent `/root/review_topic1a`, distinct from the generator author. Scope: 16 original generators; 48 initial displayed samples plus four supplemental samples. Three initial ordering samples were superseded, leaving 49 accepted samples bound to final source (three per template, plus one extra set-membership sample).

All 52 displayed samples were independently solved before their respective keys were inspected, and no mathematical answer mismatch was found. The final source is covered by 49 accepted samples, including three revised plotting samples with 12 independently checked coordinates. The revised explanations are mathematically correct. This accepts the sampled mathematical content; it does not certify every possible draw, human editorial approval, or measured classroom difficulty.

## Method and reproducibility

The coordinator supplied immutable displayed questions separately from keys and source fingerprints. The reviewer read only `questions.json`, solved every prompt, and recorded the answer and a concrete derivation for each in `.scratch/review-topic1a/answers.json` **before reading keys, generator source, author tests, or source examples**. Work included explicit decimal subtraction, exact fractions, square/cube arithmetic, set membership, inequality reversal, positive physical lengths, and independently calculated plotting coordinates. Python was used for serialization and numerical square-root coordinates; it did not invoke production code to derive any answer.

Before keys were opened, six revised prompts were inspected and their independent dispositions appended: three decimal-conversion prompts now request overbars, and three face-dimension prompts now describe solid cubes. Their mathematical answers did not change. After key comparison, the three revised classification explanations were inspected; their prompts and keys were unchanged. A later spacing revision changed the ordering generator, so the author supplied three new displayed ordering samples and one previously unsampled irrational membership prompt. These four were solved and recorded in `extra-answers.json` before their keys or the changed implementation were inspected. The reviewer had already seen the older source version: this supplemental review is display-before-key solving, not a claim of never having seen related source. A targeted final replay confirmed the other 45 original prompts and keys were unchanged. No author property tests were used as independent evidence.

For every template in the table, sample IDs are `<template-id>:review-a`, `<template-id>:review-b`, and `<template-id>:review-c`. Reproduction uses `template.generate(M.random('review-a/' + template.id))`, substituting `review-b` or `review-c` as appropriate. `M` is `src/lib/courses/math.js`; the templates are exported by `src/lib/courses/grade8-topic1.js`.

The frozen original questions have SHA-256 `51045cf532b1ad17961e5eb46a5042b94bd7da9f9fb5fb889d7d870fc47274fc`. The revised displayed questions have SHA-256 `402b9e8f0d79d5fa9876f01bd50093cfe8c544f3d46e144b977924870d1a1c2c`. The scratch answers, `comparisons.json`, `extra-answers.json`, and `final-comparisons.json` retain all individual derivations, semantic key comparisons, and graph-coordinate checks. Scratch is transient; the tables below preserve the sample identities and independently derived results in this review.

## Initial independently derived answers

The initial `order-and-plot` row is historical: the final generator uses the replacement samples below. The other 45 prompts and keys were retained. Brackets in these audit tables encode exactly the digits under an overbar; they are not the desired student-facing notation. Exact unsimplified radicals in the keys are accepted because the prompts request exact values without requiring simplified radicals.

| Lesson | Template ID | Seed `review-a` | Seed `review-b` | Seed `review-c` |
| --- | --- | --- | --- | --- |
| 1-1 | `g8-t1-repeat-block-fraction` | 343/33 | −1142/99 | −221/33 |
| 1-1 | `g8-t1-repeat-after-prefix` | 367/45 | 479/90 | 73/45 |
| 1-1 | `g8-t1-fraction-decimal` | 0.4[3] | −3.52 | −0.[15] |
| 1-1 | `g8-t1-terminating-fraction` | −13/40 | −573/1000 | 197/200 |
| 1-2 | `g8-t1-root-classification` | √18 only | √13 only | √250 only |
| 1-2 | `g8-t1-number-set-membership` | rational, real | rational, real | rational, real |
| 1-2 | `g8-t1-infinite-decimal-classification` | A rational; B irrational | A rational; B irrational | A rational; B irrational |
| 1-3 | `g8-t1-root-bounds` | 16 < √282 < 17 | 3 < √12 < 4 | 13 < √179 < 14 |
| 1-3 | `g8-t1-order-and-plot` | 1.[3] < 1.4 < √2 < 1 3/4 | 7.[3] < 7.4 < √60 < 7 3/4 | √65 < 8.[3] < 8.6 < 8 3/4 |
| 1-3 | `g8-t1-negative-root-comparison` | < | > | < |
| 1-4 | `g8-t1-evaluate-roots` | √529=23; ³√(1000)=10 | √676=26; ³√(−512)=−8 | √4=2; ³√(−27)=−3 |
| 1-4 | `g8-t1-square-cube-categories` | 729 both; 9 square only; 125 cube only; 132 neither | 243 neither; 4 square only; 1728 cube only; 729 both | 4096 both; 512 cube only; 162 neither; 100 square only |
| 1-4 | `g8-t1-cube-edge-context` | 120 cm | 78 cm | 174 cm |
| 1-5 | `g8-t1-square-equation` | x=−5√13 or x=5√13 | x=−17 or x=17 | x=−23 or x=23 |
| 1-5 | `g8-t1-cube-equation` | y=2 | y=2 × ³√28 | y=−2 |
| 1-5 | `g8-t1-cube-face-dimensions` | ³√3388 cm by ³√3388 cm | 8 cm by 8 cm | 16 cm by 16 cm |

## Supplemental final-source samples

These use `M.random(seed)` directly with numeric seeds, without a template prefix. All four independently derived answers equal the keys; all three ordering graphs have the correct points and `numberLine: true`.

| Template ID | Numeric seed | Independently derived answer | Independent check |
| --- | --- | --- | --- |
| `g8-t1-order-and-plot` | 11 | √67 < 8.[3] < 8.6 < 8 3/4 | √67 ≈ 8.18535277; 8.[3] = 25/3; minimum adjacent gap ≈ 0.14798 |
| `g8-t1-order-and-plot` | 42 | 8.2 < 8.[3] < √72 < 8 3/4 | √72 ≈ 8.48528137; 625/9 < 72 < 1225/16; minimum gap ≈ 0.13333 |
| `g8-t1-order-and-plot` | 314 | 11.2 < 11.[3] < √133 < 11 3/4 | √133 ≈ 11.53256259; 1156/9 < 133 < 2209/16; minimum gap ≈ 0.13333 |
| `g8-t1-number-set-membership` | 1 | real | 20² = 400 < 401 < 441 = 21², so the nonsquare integer 401 has an irrational square root |

## Accepted and rejected examples

- Accepted the negative repeating-decimal conversions: for example, `−11.[53] = −1142/99`, with subtraction of the repeating tails preserving the sign. Also accepted the mixed-prefix conversion `8.1[5] = 367/45`, obtained from `100x − 10x = 734`.
- Accepted the distinction between the single principal root `√529 = 23` and both equation solutions `x² = 529`, namely `−23` and `23`. Accepted the unique negative cube roots, exact nonperfect radicals, and positive face dimensions with centimeters rather than square or cubic centimeters.
- Accepted the infinite-decimal construction: indefinitely increasing zero gaps with infinitely many nonzero digits prevent eventual periodicity. It gives enough information to classify the number; a merely truncated decimal would not.
- Requested revision of the original irrational-root explanation, which jumped from consecutive-square bounds directly to irrationality. The revised explanation explicitly establishes a nonsquare **integer** and applies the theorem that its square root is irrational. All three displayed revised explanations were inspected and accepted; prompts and answers remained unchanged. The analogous membership explanation was also revised to state the integer/nonsquare condition and accepted after independently solving the new √401 sample.
- Rejected the original number-line answer presentation. For `order-and-plot:review-b`, `√60 ≈ 7.7459666924` and `7¾ = 7.75` are correctly ordered, but differ by only `0.0040333076`. On the original 280-unit SVG plotting width over a three-unit range, their point centers differ by about `0.376` SVG units while each circle has radius `3.5`; their same-baseline labels overlap. In `review-a`, `1.4` and `√2` differ by only `1.327` SVG units on that scale. The original raw SVG labels also exposed internal repeat markup such as `7.[3]` instead of the overbar rendered in prose. This is a presentation defect, not an incorrect order or coordinate. The generator revision now excludes differences below 0.12 and supplies `numberLine: true`; all three replacement samples satisfy the spacing requirement and retain distinct exact values. The coordinator also assigned numbered callouts, a typeset legend, and an approximation note to the UI lane. Final visual verification remains that lane's responsibility.

## Source binding

The original supplied Topic 1 fingerprint was `493f7c627e00d65d2c3ce364e1fb256a2b70731febf3e7a10cae750825292926`. The coordinator's first final wording snapshot was `4a3f2fa9a01809d46908f2a0be1ce6c03b66f32252dd16f70a6df2ab4d44305e`. The explanation revision, ordering spacing revision, and number-line metadata were then inspected; the final reviewed bytes were fingerprinted directly:

| Source | SHA-256 |
| --- | --- |
| `src/lib/courses/math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |
| `src/lib/courses/grade8-topic1.js` | `804efb7884df2dd0bf30c161696b1128586e2065a9a0c5c0638af6f47e7a8d85` |

These fingerprints bind the mathematical review to source bytes, not to renderer approval.

## Limits and handoff

This was sampled agent review, not a human approval or an empirical difficulty study. Three seeds per template do not exercise every branch: all three initial number-set membership samples are noninteger rational numbers. The supplemental sample covers the irrational branch, but the natural-number, zero, and negative-integer branches were not independently sampled. Source inspection is not represented as blind solving.

The reviewer did not modify production files, commit, push, or run the author's large property-draw battery. The remaining handoff is UI-lane print/browser verification of the corrected number-line presentation and repository-level integration checks by the coordinator. No mathematical key mismatch or insufficient-data prompt remains in the 49 accepted final-source samples.
