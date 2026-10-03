# SAT two-variable data graphing review — 2026-10-03

Reviewer: `/root/review_sat_data`. Authors of this change: `/root/sat_graphs`
(new residual plot template) and `/root` (the teaching corrections below).
Scope: all 12 templates in
`src/lib/families/sat/math/problem-solving-and-data-analysis/two-variable-data.js`.

**Decision: accept all 12 templates at their current provisional tiers.**
The review found no incorrect key or ambiguous answer among 58 independently
solved samples. The new `residual-plot-reconstruction` template is accepted as
Medium. This is sampled independent agent review, not human editorial approval
or measured SAT difficulty.

## Independent method and coverage

Before reading keys, teaching fields, rubric declarations, or build source, the
reviewer generated only displayed fields through `shared.instantiate`: template
identity, difficulty, seed, response type, stem, stimulus, figure, and choices.
Answers and mathematical reasoning were written in the reviewer's exclusive
scratch directory before any key comparison. Multiple-choice answers below are
zero-based indices; numeric answers are values. Every template received at
least three distinct displayed samples, starting with `graph-review-0`,
`graph-review-1`, and `graph-review-2`.

| Template | Tier | Answers for seeds 0 / 1 / 2 | Reasoning and branch coverage |
| --- | --- | --- | --- |
| `best-fit-line-equation` | Easy | 3 / 3 / 3 | Evaluate `0.8(2)+1=2.6`; interpret 0.5 inches/year; interpret the 24-thousand-dollar value at age zero. |
| `scatterplot-shape-and-count` | Easy | 5 / 6 / 3 | Count five points above and six below their fitted lines; recognize a decreasing trend that levels off. Additional seeds cover increasing curved and decreasing linear trends. |
| `scatterplot-fit-reading` | Medium | 0 / 0 / 30 | Compare observed and fitted values: `7−5=2`, `40−30=10`, `80−50=30`; retain hundreds of dollars and Celsius/grid units. Additional seeds cover extrapolation and reconstructing a line equation. |
| `two-group-fit-lines` | Medium | 0 / 3 / 0 | Solve `2.5x=10`; compare `18.5−13=5.5` and `45−33.75=11.25`. |
| `fit-model-choice` | Medium | 1 / 0 / 3 | Distinguish constant differences from ratios; recover the value at zero when the table begins at one. |
| `uneven-table-growth` | Medium | 3 / 0 / 400 | Normalize unequal time gaps; distinguish factors 1.2 and 0.6 from their percent changes; extend a constant increase of 40. |
| `fit-slope-rescaled-units` | Hard | 3600 / 900 / 700 | Apply percentage changes to the full affine prediction, solve for area, then convert hundreds of square feet; the third asks for the area difference. |
| `outlier-removal-fit` | Hard | 1 / 3 / 1 | Reassess slope and endpoint/intercept after removing a distant left point; extra samples cover all four left/right and above/below configurations. |
| `exponential-fit-interpretation` | Medium | 3 / 51 / 27.1 | Use `0.7^3=0.343` for a ratio, `1−0.7^2=0.51` and `1−0.9^3=0.271` for decreases. |
| `fit-slope-unit-rate` | Medium | 2 / 0 / 125 | Convert thousands of dollars per hundred square feet to dollars per square foot; convert 5 mm/day to 3.5 cm/week. |
| `residual-actual-predicted` | Hard | 3 / 3 / 3 | Compare signed deviations from separate predictions; reconstruct all five observed values before selecting the least. |
| `residual-plot-reconstruction` | Medium | 86 / 5 / −1 | Add residual to prediction; reconstruct both values before subtracting in the requested order. |

Additional independent answers, using the same `graph-review-` seed prefix:

- `scatterplot-shape-and-count`: 3→0, 4→2, 5→1, 6→3, 7→5,
  12→2, 13→1.
- `scatterplot-fit-reading`: 9→5, 14→3.
- `outlier-removal-fit`: 3→3, 4→1, 5→3, 6→0, 7→1.
- `residual-plot-reconstruction`: 3→48, 4→−11, 5→−6, 6→78,
  7→103, 9→62, 12→5, 14→22.

These are 58 solves: 11 for the new residual template and 47 for siblings.
No answer was copied from a generated key. The coordinator records these
responses in `content/template-reviews.json`; the reviewer's handoff file is
`.scratch/review-sat-data/samples.json`. The scratch directory also retains
pre-comparison reasoning, displayed samples, key comparisons, and geometry
results for this session.

## Graph, teaching, and difficulty findings

The new plot distinguishes residual `r` from observed output `y` and explicitly
defines the sign convention. Samples cover positive and negative model slopes,
positive and negative residuals, single reconstruction, differences with both
signs, and a positive observed difference despite a negative model slope.
For example, seed 12 gives observed values 49 at `x=8` and 54 at `x=9`, so
the requested difference is 5 even though the fitted line decreases.

The residual graph's axes include negative values and readable integer ticks;
its alt text lists coordinates without supplying the computed answer. Chromium
rendering of the first three residual and first three outlier figures showed
legible axes and points matching the descriptions. An independent SVG readback
inferred both scales from the displayed tick labels and confirmed all 88 dots
in the 11 reviewed residual plots against the alt text. The generic phrase
“linear model” is appropriate: these randomly generated residuals need not sum
to zero, and the stem does not claim that the model is an ordinary least-squares
fit.

Medium is justified by reading one representation, evaluating another, and
combining signed quantities. The difference form adds a comparison but does not
require discovering an unstated model. The unchanged Hard designs demand
percentage modeling with an intercept, outlier influence, or distinguishing
residual rank from observed-value rank. The Easy designs remain direct
interpretation/counting tasks. These judgments do not establish empirical
calibration.

The sampled choices had one supported answer each. Rounded scatter coordinates
preserved the relevant above/below classifications and overall trends. The
review checked units, irregular table intervals, and the difference between a
remaining fraction and percent decrease. Teaching arithmetic and residual
signs agreed with the independent solutions.

Two existing teaching issues found during review were corrected by `/root`:

1. `scatterplot-fit-reading`, seed 14, said the axes used “different scales”
   when both were one unit per square. The correction explains conversion to
   axis units and the equal-scale exception.
2. `two-group-fit-lines`, seeds 0 and 2, referred to gridlines in text-only
   questions. The correction describes an incorrect input in the model's
   stated units, or names the actual incorrect `x`, as appropriate.

The reviewer reinspected the changed teaching and source branches. The changes
alter no parameters, displayed questions, choices, graph coordinates, or keys;
all 58 displayed-sample snapshots and recorded responses were compared again
and remained unchanged. The other nine existing templates have no direct
source changes. Their renewed review is required because the shared defining
file conservatively changes every sibling's source fingerprint.

## Verification and limits

The focused command was:

```sh
set -o pipefail
/usr/bin/node tools/check-families.js --section sat-math \
  --file problem-solving-and-data-analysis/two-variable-data --reps 3000 \
  2>&1 | tail -20
```

All **12/12 template rows passed** at 3,000 integer plus 3,000 runtime-shaped
seeds each (72,000 draws). The command exited 1 solely for the section-wide
minimum of three not-to-scale templates: selecting this one file provides
zero. That aggregate result is a selection limitation, not a whole-section
pass. The full file pass preceded the final teaching-only corrections; the
coordinator runs the affected-template checks again and owns whole-repository
verification, registry fingerprints, and review-manifest integration.

Coverage is sampled, not exhaustive. The reviewer visually inspected six
rendered figures, used figure alt text for other graph solves, and independently
checked every reviewed new plot's SVG coordinates. The review does not claim
full browser workflow, phone-width, print, dark-mode, every generated context,
or real-student difficulty validation.
