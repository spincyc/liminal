# Grade 8 Topic 1 refinement review

Date: 2026-10-06. Reviewer: independent agent `/root/review_topic1a`, distinct from the generator author. Scope: mathematical correctness of seven revised visible templates and their explanations, plus targeted checks of changed ranges. Teaching and print quality are reviewed separately.

**Accepted:** 22 coordinator-seeded draws covering 21 distinct displayed prompts, with no mathematical answer or explanation mismatch. Eight additional targeted branch fixtures matched independently predicted answers. No mathematical blocker remains in this scope.

## Independent method

The reviewer first read only `.scratch/refined-math-topic1/questions.json`, solved all 21 displayed prompts, and recorded each answer and concrete derivation in `reviewer/answers.json` before opening the refined keys or current generator source. The reviewer had previously seen older Topic 1 code; this is fresh display-before-key solving, not a claim of never having seen related source.

The two initial cube-row samples `a` and `b` were identical. The reviewer reported that sampling limitation, then independently solved the coordinator's additional distinct cube-row display and recorded it before opening its separate key. Thus all seven templates have at least three distinct reviewed prompts, even though the supplied draws number 22. No answer was derived by invoking production code. Python serialized the independent derivations; source generation was used only afterward to bind the frozen displays and keys to source bytes.

After recording answers, the reviewer inspected all keys and explanation steps, then the current source. A replay confirmed all 22 prompts, keys, and steps match the initially frozen source. A final grammar-only edit changed “1 zeros” to “1 zero” in the infinite-decimal sample b; replay confirmed this was the only changed sampled text and all 22 keys and explanation steps remained identical. Reversing that single grammar edit reconstructed the exact prior reviewed source hash, so the mathematical range and branch review remains applicable. Independently reasoned boundary expectations were recorded before eight targeted source-fixture executions. The author's 105,000 property draws were not rerun or treated as independent solving evidence.

The original question artifact SHA-256 is `a2adc86c5e8063cd907b36cf75e545719ba94dcd95af9fe2506e6f5ebd28a885`; the extra question artifact SHA-256 is `1b16fd0a2aec01d3d3e9ccb5fb71791fe1ec29bec21f37216a64d335c9badf1a`. Detailed independent work, comparisons, range proofs, and fixture results are in the exclusive transient directory `.scratch/refined-math-topic1/reviewer/`.

## Reproducible sample answers

For each table row, sample ID is `<template-id>/a`, `/b`, or `/c`; reproduce with `template.generate(M.random(seed))`, where `seed` is the exact string `cold-repair-math/a/<template-id>` (substitute `b` or `c`). `M` is `src/lib/courses/math.js`. Brackets here identify repeating digits under an overbar.

| Template ID | Sample a | Sample b | Sample c |
| --- | --- | --- | --- |
| `g8-t1-root-classification` | −√127 only | −√201 only | √39 only |
| `g8-t1-infinite-decimal-classification` | A irrational; B rational | A irrational; B rational | A rational; B irrational |
| `g8-t1-evaluate-roots` | 18; −10 | 9; −2 | 2; 4 |
| `g8-t1-square-cube-categories` | 451 neither; 1331 cube only; 729 both; 100 square only | 169 square only; 12 neither; 1728 cube only; 729 both | 1 both; 121 square only; 343 cube only; 24 neither |
| `g8-t1-cube-edge-context` | 56 cm | 56 cm | 30 cm |
| `g8-t1-cube-face-dimensions` | ³√229 cm by ³√229 cm | ³√133 cm by ³√133 cm | 9 cm by 9 cm |
| `g8-t1-negative-power-denominator` | n^1; n | t^−3; 1/(t^3) | t^3; t^3 |

The extra cube-row sample ID is `g8-t1-cube-edge-context/extra`, using exact seed `cold-repair-extra/0/g8-t1-cube-edge-context`: volume 216 cm³ gives an edge of 6 cm, so 13 cubes make **78 cm**. The duplicate initial samples remain disclosed; they are not counted twice as distinct evidence.

Examples of actual independent derivation:

- `−√127` is irrational because 121 < 127 < 144 and 127 is a nonsquare integer; its sign does not change rationality. Its neighboring candidates √36 = 6, √169 = 13, 1/9, and −7.[4] = −67/9 are rational. Similarly, −√201 is irrational; in sample c, −√144 = −12 is rational while √39 is irrational.
- In the swapped-label decimal sample b, B = 20 + 90/99 = 230/11 is rational. A has infinitely many nonzero digits separated by unbounded zero gaps, ruling out eventual periodicity. Both A/B arrangements are covered.
- 451 lies between 21² and 22² and between 7³ and 8³, so it is neither. 1331 = 11³ is not a square. 729 = 27² = 9³ and 1 = 1² = 1³ are both. The other listed categories were checked against integer squares and cubes in the same way.
- A face of the 229 cm³ cube has two equal positive dimensions ³√229 cm, since 6³ < 229 < 7³. The 133 cm³ case lies between 5³ and 6³; the 729 cm³ case has edge 9 cm. These are lengths in centimeters, not areas or volumes.
- For nonzero n, (1/n^−8) × n^−7 = n^8 × n^−7 = n¹ = n. The key's second form n¹ is equivalent to the independently simplified n and meets the request for no negative exponents. The other exponent answers follow from 5 − 8 = −3 and 5 − 2 = 3.

## Changed-range and branch checks

These are post-source mathematical checks, not additional blind random samples.

| Revised behavior | Independent reason and checked counterexample |
| --- | --- |
| Signed roots and one or two irrational selections | With 1 ≤ d ≤ 2b, b² < b² + d < (b + 1)². Both signs of its square root are irrational; both signs of a perfect-square root are rational. A scripted valid prompt containing −√5, √9, √10, −0.[1], and 1/2 correctly selects −√5 and √10. |
| A/B decimal labels | Both label assignments were independently sampled. A nonzero digit and ever-growing zero gaps cannot become periodic, regardless of the whole-number part or A/B label. |
| Revised root endpoints | √625 = 25 and ³√(−1728) = −12; √4 = 2 and ³√1 = 1. Both targeted endpoint fixtures matched. The principal square root remains nonnegative. |
| Square/cube range | Both-values are 1, 64, and 729. Chosen square-only bases are not cubes; chosen cube-only bases are not squares. The initial neither candidates are nonsquares from 10 through 675. Their only possible cube values are 27, 125, 216, 343, and 512; advancing each by one gives 28, 126, 217, 344, and 513, all neither. These finite-number claims were independently checked with integer powers. |
| Cube-row range | Edge e is 2 through 12 and count c is 2 through 20; length is ce. For e = 2, counts 3, 4, and 20 give length numbers 6, 8, and 40 against volume number 8. Thus the answer's numerical size need not be below the displayed volume. The 20-cube endpoint fixture returns 40 cm. Comparisons of numerical sizes here do not equate length and volume units. |
| Noncube face volumes | For 1 ≤ d ≤ 3e, e³ < e³ + d ≤ e³ + 3e < (e + 1)³. Therefore the radical branch never accidentally reaches another perfect cube. The upper endpoint 1764 lies between 12³ and 13³ and correctly gives ³√1764 cm on both sides. |
| Reciprocal powers | With a,b each 2 through 12, a − b ranges from −10 to 10: 55 input pairs give positive exponents, 11 give zero, and 55 give negative exponents. Targeted cases (a,b) = (2,12), (12,12), and (12,2) correctly produce n^−10 = 1/n^10, n^0 = 1, and n^10. The stated nonzero-base condition is necessary and present. |

The eight targeted fixture predictions and exact scripted RNG inputs were recorded before execution in `reviewer/branch-expectations.json`; results and the initial 22 seeded replays are in `reviewer/source-replay.json`. The final grammar-only replay and source fingerprints are in `reviewer/final-grammar-replay.json`.

## Source binding and limits

| Source | Reviewed SHA-256 |
| --- | --- |
| `src/lib/courses/math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |
| `src/lib/courses/grade8-topic1.js` | `fd6c7c8c79ad96890ba75bc1a84cbfe4633c16a8064acd2af4680c1912b9c317` |

The new canonical `practiceKey` wrapper was inspected for its placement after question generation; it does not alter these mathematical prompts, answers, or steps. This review does not certify the broader scheduling or duplicate-suppression behavior.

All sampled mathematical questions and revised explanations were accepted. The duplicate cube-row sample was rejected as *additional distinct sampling evidence* and replaced by a separately solved example; it was not a wrong question. No sample was rejected for incorrect mathematics.

This is sampled agent review, not human editorial approval, exhaustive draw certification, measured difficulty, or print approval. The source-range checks support the specific mathematical claims above; they do not establish that every potential answer cue is pedagogically resolved. The separate cold pedagogy and UI reviews own those judgments. The reviewer changed only this report and its assigned scratch lane, with no production edits, commits, or pushes.
