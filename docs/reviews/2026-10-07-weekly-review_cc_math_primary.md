# Common Core mathematics Grades 6–4 independent weekly review

Reviewer: `review_cc_math_primary`, 2026-10-07. Review complete for the fingerprints below. This is independent agent sampling, not human editorial approval, a comprehensive proof of every answer, or evidence of student outcomes. The reviewer did not author or mutate the courses, run author generators, commit, or write build output.

## Final files

| Course | SHA256 |
| --- | --- |
| `content/weekly/common-core-math/6.json` | `05c1f4b847d9d7a9f36bbe97da7dfaa04604369be11375d4c09addc879cf65d3` |
| `content/weekly/common-core-math/5.json` | `238162f274812faea53a4b1a193079ba71dd13c0570e47d0778bc4a0bb71fe35` |
| `content/weekly/common-core-math/4.json` | `2e3b7157c99f0926b9f8d42852f071e69a5c9f8d2ccc8e361ba2f5b80f45dc09` |

Each course contains 36 weeks, 108 worksheets, 648 worksheet items, and 72 worked examples. All six units retain their source-linked skeleton's six-week pacing. Final `validateCourse` calls passed for all three files without invoking a build; an independent pacing/standard-subset and exact-prompt check also passed.

## Actual review scope and sampling

Read all 108 weekly titles, objectives, prerequisite/next connections, daily sequences, and explanations, plus all 1,944 worksheet prompts. Checked all 216 worked examples, including their steps. Compared scope and prerequisites against the three courses in `content/curriculum/common-core-math.json` and the authoring contract in `docs/weekly-coursework.md`.

Independently solved one selected item from each worksheet in every week: 108 per course, 324 total. The reproducible selection is 1-based item index `1 + ((week − 1 + 2 × offset) mod itemCount)`, with A/B/C offsets 0/1/2. For six-item worksheets the sequence cycles through all early and late indices. IDs are `ccmGRADE-wWW-LETTERINDEX`, for example `ccm6-w01-a1`, `ccm6-w01-b3`, and `ccm6-w01-c5`.

Worksheet answers were recorded before selected keys were retrieved, with one disclosed exception: an initial raw-file read exposed Grade 5 week 1 keys. The coordinator independently cold-solved that week's A1/B3/C5, recording `4 + 6/10 + 1/100 + 9/1000`, `9/1000`, and `4.406` before key access. Those displayed prompts exactly match the final course. Thus the initial sampling comprised 321 cold solutions by this reviewer and three independently supplied cold solutions by the coordinator, alongside this reviewer's three non-cold recalculations. All sampled outcomes agree with their keys or stated open-response criteria.

Repairs received targeted rereview and recomputation before fingerprinting. One selected item's givens changed: Grade 5 W16 C2 now gives `2 3/5 × 1 3/4`, independently recomputed as `91/20 = 4 11/20` square meters. That repair check occurred after revised-key exposure and is not claimed as a new cold solution. Other changed sampled prompts clarify assumptions without changing their calculation. The coordinator additionally cold-solved final Grade 5 W16 C1 before its key: “A recipe needs 1 2/3 cups per batch. Find the amount for 1 1/2 batches.” The recorded solution `(5/3) × (3/2) = 5/2 = 2 1/2 cups` agrees, and its prompt matches the fingerprinted canonical file. This supplementary selection supplies cold coverage of Worksheet C in that week while retaining the disclosed warm C2 repair check. There are therefore 325 independently checked worksheet tasks including this extra sample, with final cold coverage of one task per worksheet per week. The supplementary record is `.scratch/weekly/root-cc5-repair-outcomes.json`, also copied into the reviewer scratch evidence.

A separate reviewer-written exact-rational checker recomputed 116 narrowly recognized direct-expression prompts from their displayed operands: Grade 6 27, Grade 5 73, Grade 4 16. All agree. This overlaps the manual sample and models; it is not 116 additional unique reviewed tasks. The parser initially treated unparenthesized printed fraction divisors as ordinary left-associative slash expressions; those false alarms were resolved by grouping fraction tokens and rerunning. It does not interpret arbitrary word problems, geometry, statistical claims, or open-response rubrics.

Task-local evidence in `.scratch/review_cc_math_primary/` includes original blind prompt/answer records, final sample comparisons, checkpoint and final week snapshots, the coordinator supplement, the independent arithmetic script/results, and `final-manifest.json`. Scratch is disposable; the hashes, selection rule, counts, exception, and findings here are the durable review record.

## Findings and confirmed repairs

| Course | Finding | Final disposition |
| --- | --- | --- |
| Grade 6 W4 A5 | Asked learners to circle a bar that was described but not drawn. | Explicit draw-and-shade instruction supplies the needed construction. |
| Grade 6 W6 C4; W8 B4 | Ambiguous largest-group wording; ratio parts did not specify an actual tile total. | Greatest number of identical groups and seven tiles total are explicit; answers remain 18 groups and 3 green/4 white. |
| Grade 6 W17 C2 | Prompt leaked its answer and step through an assembler delimiter. | Prompt contains only the reflection question; `y = 7` is confined to its key. |
| Grade 6 W15 | Standard tag outside the unit's allowed set. | Replaced with allowed `MP.6`; final reference validation passes. |
| Grade 6 W24 C2; W35–36 | Flow described an empty source tank; standalone worksheets relied on an external quartile convention. | Flow enters an initially empty bucket; directions carry the complete median-of-halves and min/max-whisker convention. |
| Grade 6 W4 C1 | Reused a model's numerical fraction quotient under another interpretation. | Fresh `7/8 ÷ 3/4 = 7/6` batch problem, independently checked. |
| Grade 5 W5; W7 C5; W12 B4 | Fraction-scaling overgeneralization, implicit nonoverlap, and an inconsistent spacing-repair premise. | Positive factor below one is specified; painted regions are nonoverlapping; the plot has an explicit blank quarter-unit tick. |
| Grade 5 W16 C2; W17 C4 | Exact computations repeated another worksheet or a worked example with changed context. | Fresh rectangle dimensions give `4 11/20` square meters; eight shares of `1/9` give `1/72` bag. Both recomputed. |
| Grade 4 W4 B6 | Compensation was requested but the solution showed only standard regrouping. | Key now adds five to form 19,000, then removes five, giving 23,202. |
| Grade 4 W6 C1 | Reused the worked model's 8-by-5 comparison. | Fresh 13-by-4 comparison gives 39 m more, independently checked. |
| Grade 4 W8 B6 | Author's related method audit found its requested estimate absent. | Exact 2,924 and the 2,700 estimate are both supplied and checked. |

Also verified author-disclosed Grade 5 repairs: W7 A4's blank numerator is 5 rather than the complete fraction; W7 C6 has explicit sequential mark locations; W33 B4 uses 2.004 m, which rounds to 2.00 m yet exceeds the limit; W35's first model includes evaluated costs. Standalone Grade 5 rounding and inclusive shape definitions are supplied in the relevant directions.

## Negative findings and limits

No unresolved mathematical discrepancy remains in the sampled answers, checked models, or recognized arithmetic expressions. No exact repeated displayed task remains within any course, including model-to-worksheet comparison. Numerical-signature and direct reading found the repetitions above that literal prompt matching missed; neither method proves every semantic duplication absent.

The courses develop distinct weekly ideas and varied tasks: models, missing quantities, error analysis, counterexamples, constrained choices, data interpretations, and contextual applications. Repetition of skills supports cumulative practice rather than changing only weekly labels. Grade 5 daily sequences retain substantial common phrasing; its mathematical explanations and exercises are substantially more specific, so these daily strings are a teaching scaffold rather than complete daily lesson scripts.

Grade 4 emphasizes like fractional units and the tenths/hundredths special case; Grade 5 confines fraction division to its two permitted forms and explains those models; Grade 6 introduces general fraction division, signed positions without general signed arithmetic, one-step equations, and distribution summaries with explicit conventions. Geometry supplies dimensions or construction instructions and distinguishes perpendicular height, area, surface area, volume, and axis-aligned distance. Checked open tasks accept justified alternatives rather than unique wording.

This review did not independently solve every unsampled worksheet item or verify all instructional claims against the original standards publications anew. It did not run browser, rendering, print-layout, accessibility, or full-repository checks; those belong to integration. These findings apply only to the stated sampled scope and file fingerprints, not to later changed content.
