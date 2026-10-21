# Independent review: bounded intersection parameter repair

Date: 2026-10-20. Author: `/root/repair_hard_variant`. Reviewer: `/root/review_region_repair` (a distinct agent). Scope: the 10 families defined in `src/lib/families/sat/math/algebra/systems-of-two-linear-equations.js`. Production, registry, and review records were read only during this review.

Reviewed source-file SHA-256: `d6e469aac2016c6f69b0bf0edc4aa45b1acdbc57eef585cf1644aaa26dd8cb6a`. Exact per-family `source-v1` fingerprints, current versions and the 39 independently solved samples are recorded in `content/template-reviews.json`. Acceptance attaches only to that source and dependency closure.

## Blind procedure and coverage

The first review input opened was `.scratch/repair-hard-variant/review-blind.json`, containing only displayed target questions. I solved all 12 target samples independently, saving answers and reasoning in `target-blind-solutions.json` before opening the keys or the target implementation. I next generated three fresh displayed samples per unchanged sibling, through `shared.instantiate`, projecting only stem, stimulus, choices, and figure into `sibling-blind.json`. I saved all 27 independent answers and reasoning in `sibling-blind-solutions.json` before opening their keys. Only then did I inspect keys, explanations, distractor rationales, implementation, diff, and the targeted test. All 39 answers agree. `approved-samples.json` records numeric answers as numbers and multiple-choice answers as zero-based indices, with the actual scene value (null for these Math samples).

The 12 target samples include standard-form and slope-intercept presentations, positive and negative coordinate segments, both response types, strict integer and fractional parameter endpoints, and boundary/parallel distractors. They are not a claim of exhaustive branch coverage. The targeted test additionally exercises all 16 combinations of response type, presentation, segment side, and coordinate-bound orientation over 601 seeds. The 27 sibling samples are independent substantive impact review rather than automatic hash refreshes.

| Family | Independently solved | Judgment |
| --- | ---: | --- |
| system-from-context | 3 | Correct count/cost, comparison, and ratio modelling; plausible variable/unit errors. |
| system-intersection-point | 3 | Unique intersections, correct requested coordinates; Easy is appropriate. |
| system-combination-value | 3 | Linear combinations give the requested expressions; Medium appropriate. |
| system-word-totals | 3 | Totals consistent; asks for both counts and derived revenue across samples; plausible intermediate/wrong-quantity distractors. |
| system-parameter-solution-count | 3 | Equal slopes and unequal constants/intercepts correctly distinguish no solution; Medium appropriate. |
| two-plan-crossover | 3 | Table-derived slope/intercept and strict whole-number decisions correct; renting/buying and least/greatest conditions distinguish competing answers. |
| system-graph-two-lines | 3 | Graph-derived equations and intersections correct. I rendered and visually inspected all three SVGs; geometry, tick labels, and alt text agree. |
| system-mixture-blend | 3 | Preserved solute/interest totals and requested quantities correct; concentration and account/alloy alternatives represented. |
| system-two-constants | 3 | Proportional coefficient structure correctly determines a before b; no extra solution or degenerate system in samples; Hard reasonable. |
| system-intersection-region | 12 | Both coordinate bounds constrain an open segment, whose parameter range is bounded; Hard reasonable for the repaired numeric task. |

## Target mathematics and demand

For each numeric target sample, I translated the b cutoff using the fixed line, intersected it with the a cutoff, then found the allowed k interval. Both cutoffs change the integer count: omitting one admits additional integer parameters (and one omitted cutoff often leaves an unbounded family). The task now asks for the count, so finding one feasible k or one endpoint cannot finish it. Strict endpoints matter, including integer endpoints. The demand comes from reconciling the coordinate restrictions with a parameter range and counting in the resulting open interval, using small values; it does not come from large arithmetic. The Hard rubric total 10 is defensible as a provisional editorial judgment, with conceptual structure and abstraction both at 2.

Every sampled MC item has exactly one feasible offered parameter. In every item there is an offered distractor satisfying the a cutoff alone and another satisfying the b cutoff alone, requiring use of both restrictions to eliminate the alternatives. Ordinary nonparallel distractors each fail a coordinate restriction; boundary equality is correctly excluded. Two sampled items also include the fixed line's slope as a third distractor: that gives parallel distinct lines, violating the stated intersection premise. This is a legitimate systems error, with an accurate rationale. On 2026-10-20 the coordinator confirmed that the admission requirement is substantive use of both coordinate cutoffs with an actual counterexample for each cutoff; it does not require every wrong choice to have an actual intersection. The parallel options meet that settled scope. No named solution method occurs in the stem. The region is defined by explicit strict coordinate inequalities and is unambiguous.

The explanation identifies the open segment, computes exact boundary slopes, states that a stays on one side of zero, and gives the correct open k interval and integer count. This is mathematically coherent. Numeric verification reparses displayed equations and scans integers independently of the endpoint-slope calculation; the MC verification checks the key and each distractor. The targeted test reads the displayed restrictions and equations rather than hidden segment data, checks both bounds change numeric counts, and checks each coordinate alone leaves an offered MC distractor.

## Source impact and checks

The inspected production diff changes only the `system-intersection-region` definition and its private helpers. The removed private quadrant/sign helpers have no surviving sibling use. The nine sibling definitions and shared dependencies are unchanged; their source fingerprints change because they share this defining file. This supports the author's separate reported output-identity evidence (104 seeds per sibling), but my admission judgment rests additionally on the fresh blind sampling above, key/explanation comparison, figure inspection, and diff review. No production changes were made by the reviewer.

Checks run, with output bounded through tail:

- `node --test test/system-region-demand.test.js`: 2 tests passed.
- `node tools/check-families.js --family system-intersection-region --reps 3000`: 1/1 family passed, 6000 draws, 5968 distinct displayed items, 3018 MC and 2982 numeric, rubric 10.

These are sampled agent judgments and targeted automated checks, not human editorial approval, empirical SAT calibration, or proof that every future draw is semantically correct. Full project checks, registry updates, review-record admission, commits, and publishing remain with the coordinator.

Verdict: accepted for independent sampled agent review of all 10 families at the fingerprints recorded beside this report. No mathematical, wording, key, explanation, or substantive difficulty blocker found for the reviewed source. The parallel-distractor scope interpretation was settled as documented above.
