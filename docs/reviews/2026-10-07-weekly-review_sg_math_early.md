# Singapore mathematics K–3 weekly coursework review

Date: 2026-10-07. Reviewer: `review_sg_math_early`, independent of the authors. **Final review complete for K and Primary 1–3.** This records sampled agent review, not human editorial approval or proof of every answer.

## Scope and reproducible selection

| Course | Weeks inspected | Worksheet solutions | Worked models | Status |
| --- | --- | --- | --- | --- |
| Primary 3 | 1–36 | 108 rotating samples; root W1 supplement | 72 | Complete |
| Primary 2 | 1–36 | 108 rotating samples | 72 | Complete |
| Primary 1 | 1–36 | 108 rotating samples | 72 | Complete |
| K / NEL bridge | 1–36 | 108 rotating samples | 72 | Complete |

Across four courses, inspected 144 weekly teaching sets, 432 selected worksheet tasks and 288 worked models, and scanned 2,592 worksheet prompts. For each course, read all 36 titles, objectives, connections, daily teaching sequences and explanation sets; inspected all 72 models and their reasoning; scanned all 648 worksheet prompts for scope, prerequisites, diversity and complete givens. Solved one item from each worksheet before revealing its key: one-based item index `1 + ((week − 1) mod 6)` in each of A, B and C. Thus both early and late item positions are represented. Compared the independent outcomes with answers and steps, accepting valid alternative open responses. Selected outcomes agree with the final keys.

Primary 3 week 1 keys were inadvertently exposed during initial schema inspection. Its three rotating samples and two models were independently recomputed but were not cold. The coordinator separately cold-solved `sg3-w01-a1`, `sg3-w01-b3` and `sg3-w01-c5`, obtaining 6139, 6020 and 3304. All three prompt strings match the final file and the root outcomes match its keys, closing the worksheet cold-coverage gap. The two W1 models remain candidly identified as non-cold inspections. All other selected worksheet items and models were solved before keys. Additional off-sample checks include repaired items and constrained-feasibility tasks.

Working evidence is in `.scratch/review_sg_math_early/`: `independent-solutions.json`, final-review records, snapshots, `check-numeric.cjs` and `numeric-result.json`. Root supplement: `.scratch/weekly/root-cold-outcomes.json`, row label `sg3`. Scratch evidence is disposable; the selection rule, findings, outcomes and final hashes here are the durable review record.

## Final-file hashes

| File | SHA-256 |
| --- | --- |
| `content/weekly/singapore-math/k.json` | `3d565404633c4a30e65694a18c308824878e17bac3aa0e3f86ebf64a1a782363` |
| `content/weekly/singapore-math/1.json` | `83754b5a12d2efa30a9ba92a1c32319a378bff929de6ed9bcfc84bb9e0bcef73` |
| `content/weekly/singapore-math/2.json` | `29cd36b04dfbebc17286bb20f77c51af56681b83608006491ebe5dcdcd16b482` |
| `content/weekly/singapore-math/3.json` | `32f4112d8aec1f878bc9d1b4ecdcf67c959ee88e0c1ccd1b3913526e8fc88297` |

All four courses match the existing Singapore skeleton’s exact unit pacing and reference subsets.

## Findings and dispositions

- **Primary 2 W5–6 teaching repetition:** the checkpoint reused all three explanations, both models and most task designs with factor substitutions. W6 named fives and tens without teaching their relationship. Final W6–8 teach five/ten pairs, adding a group member and doubling pairs respectively. W11–12 distinguish completing a whole from comparing unit-part sizes; W16–18 distinguish removal, missing-part completion and two-step changes. Re-read all affected teaching, models and prompts; re-solved the final rotating samples and models. Confirmed.
- **K `sg-k-w03-b1`:** asked which two cards join the red square, although only one other square exists. Final prompt correctly asks which two cards form the square group; key and steps agree. Confirmed.
- **Primary 3 `sg3-w11-c3`:** equal bottle levels did not establish equal volumes. Final prompt specifies nine equal-volume divisions numbered zero to nine; mark three represents one third. Confirmed.
- **Primary 3 `sg3-w13-c1`:** initial tank amount was missing. Final prompt explicitly starts empty; one half plus three eighths gives seven eighths. Confirmed.
- **Primary 3 `sg3-w01-c3`:** answer now cleanly states the sole valid numeral, 2508. Confirmed.
- **Primary 1 `sg-p1-w14-c6` and `sg-p1-w29-c1`:** the keys correctly identified impossible constrained constructions, but imperative prompts obscured that feasibility was being tested. Final prompts ask whether construction is possible and require an explanation. Independently verified impossibility: a ten-making pair leaves a non-one-digit third term of ten; no three allowed 10/20/50-cent coins total 100 cents. Confirmed.
- **Primary 1 `sg-p1-w25-b6`:** replaced duration wording “twelve hours and ten minutes” with “ten minutes past twelve”; 12:10 now directly answers the clock-reading prompt. Confirmed.
- Author-initiated changes separately checked: K W8 A3 now selects eight blocks from ten, leaving two, preserving small-collection scope; Primary 3 W9 B5 correctly states that 74 divided by eight and nine both leave remainder two.

No unresolved material finding remains in the four courses within this review’s scope.

## Scope, variety and verification limits

K preserves the NEL play bridge: adult preparation/read-aloud, gesture and home-language responses, optional numeral writing, concrete quantities within ten and separate oral counting through twenty. It teaches matching, re-sorting, conservation, repeated-unit structure, shape attributes, part–whole reasoning and explicit map viewpoints through distinguishable tasks. It does not presume independent reading or formal written arithmetic.

Primary 1 preserves numbers/calculation within 100, multiplication representations within 40, sharing/grouping within 20, five-minute clock readings and half-hour/hour durations, separate cent/whole-dollar money, and one-picture-one-object graphs. All worksheets permit adult reading, pointing/oral answers and adult recording. Primary 3 meaningfully teaches disks, arrays, bars, equal wholes, cent exchanges, metric units, time intervals, area versus perimeter, angle/line relationships and graph scales. Fraction operations use related denominators at most twelve and totals within one whole. Neither course introduces an advanced replacement for the source-linked foundational scope. Daily routines recur, but complete lessons are not merely renamed parameter variants.

Primary 2 preserves numbers within 1000, tables of 2/3/4/5/10, denominators at most twelve, like-fraction operations within one whole, minute clock readings, unit-aware money notation, metric measurement, solid attributes and scaled picture graphs. Concrete groups, complete equal-whole drawings and explicit graph keys support the transitions. Some supported practice frames recur; the redesigned weeks and graph weeks have distinct teaching and reasoning tasks rather than parameter-only whole lessons. Weeks 1–5 match the earlier reviewed checkpoint exactly.

Independent arithmetic scanning recomputed 427 explicit Primary 1 answer/teaching equalities without mismatches. Primary 2 yielded 352 candidates with one chained-expression parsing artifact, manually checked as `268 + 100 + 50 + 7 = 368 + 50 + 7 = 425`. Primary 3 yielded 274 candidates: two were parser artifacts, manually resolved as correct remainder notation and a chained fraction equality. K’s spoken tasks yielded no symbolic-equality candidates. These scans are supplementary and do not verify word-problem semantics or unsampled keys. Manual model and prompt review supplies different evidence from author-run generators.

No subject content, application source or build output was edited. No browser/export review, comprehensive all-key proof, official MOE certification, US placement equivalence or student-outcome claim is made.
