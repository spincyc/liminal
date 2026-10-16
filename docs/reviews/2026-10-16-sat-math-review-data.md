# SAT Math independent review: Problem-Solving and Data Analysis, 2026-10-16

Reviewer: `review-20261016-data` (an independent agent). Author of the change
under review: `templates-lane-20261016`. Source reviewed: branch
`lane/templates` at `2928051`, compared with the base `e87395b`.

This is a **sampled agent review**. It is not human editorial approval, and it
is not an empirical calibration of SAT difficulty. Tier judgements are
editorial opinions against the official Easy / Medium / Hard bands described
in `docs/difficulty-calibration.md`.

## Result

| | Count |
| --- | --- |
| Templates on the list (Problem-Solving and Data Analysis) | 46 |
| Blind solves | 138 (3 per template) |
| Blind answers that agree with the key | 138 |
| Blind misses | 0 (mine 0, template 0) |
| Accepted | 44 |
| Rejected | 2: `data-change-statistics`, `density-cube-edge` |
| Tier disagreements | 1 (`crew-rate-change`), plus one border case (`data-change-median`) |

Both rejections are for explanation text that states something false about
the displayed question. The keys are right in both. Neither defect was
introduced by this change. The displayed content of both templates is
byte-identical to `e87395b`, and both were accepted in the 2026-10-02 review.
They are rejected because the admission rule does not allow a wrong explanation
to be accepted.

## Method

1. **Read first.** I read `docs/question-templates.md`,
   `docs/difficulty-calibration.md` and the author's notes
   (`2026-10-16-sat-math-realism-changes.md`). The notes describe each new
   template's forms and distractors, but not any seed's key. I did **not** read
   the template source or the diff until all 138 blind answers were recorded.
2. **Blind draws.** For each template I used seeds `rv1016-psda.<id>.<n>`,
   n = 0, 1, 2, through the brief's blind filter, which strips the key,
   rationales, explanation and hint. A script compared the displayed stimulus,
   stem, sorted choice set and figure hash. No template needed n ≥ 3 for
   duplicates.
   - **Exposure, and the fix.** Before the blind pipeline was set up, a single
     test command showed the full view of `population-density` seed n = 0,
     key included. That seed was therefore not used. Its samples are
     n = 1, 2, 3.
3. **Blind solving.** I solved each question as a strong test-taker and
   appended the answer to a log before any full view was generated.
   - Multiple choice was recorded as an index, numeric entry as a number.
   - **Figures.** I rendered every figure SVG to PNG with `rsvg-convert` and
     read it from the image: all line graphs, the outlier scatterplots and
     several other scatterplots. For `outlier-removal-fit` I also confirmed the
     direction of each change with the exact least-squares leave-one-out
     formula, using the plotted points.
4. **Key check.** I generated all full views
   (`node tools/check-families.js --sample <id> --seed <seed>`) and compared
   them with the log by script: 138/138 agree.
5. **Unchanged-content check.**
   - I extracted `e87395b` (`src`, `tools`, `content/catalog.json`,
     `content/templates`) into my scratch directory with `git archive`.
   - From that base I ran the same 126 full views for the 42 pre-existing
     templates, and the same 32 figure SVGs.
   - **Result:** every full view is identical, including explanation, steps,
     trap and wrong-answer rationales. The one exception is the tier label in
     the header of the six re-tiered templates. All 32 SVGs are byte-identical.
   - I also read the complete diff of the four edited files
     (`one-variable-data.js`, `ratios-rates-and-units.js`,
     `statistical-inference.js`, `two-variable-data.js`).
     - In the 42 existing templates, the only changes are `difficulty`,
       `rubric` and comments.
     - The new templates are added, and two `return [...]` arrays are
       reordered: `dataChangeMedian` now comes before `displayCenter`, and
       `densityCubeEdge` after `populationDensity`.
     - Neither reordering changes what any template draws.
6. **Deeper review of new and re-tiered templates.**
   - **More seeds.** The four new templates were read on further seeds:
     `line-graph-reading` n = 3–26, `population-density` n = 4–22,
     `crew-rate-change` n = 3–22 and `greatest-value-from-center` n = 3–18.
     The six re-tiered templates were read on n = 3–10.
   - **Gate.** I ran `node tools/check-families.js --family <id>` on all ten.
     All pass.
7. **Text scan.** For all 46 templates I instantiated 600 draws each (300
   integer and 300 runtime-shaped seeds). The scan searched the stem,
   stimulus, choices, explanation, steps, trap, hint and rationales for:
   - cut-off decimals;
   - "1" followed by a plural unit;
   - `NaN`, `undefined` and `[object`.

   Targeted scans then measured the two rejection defects; their counts are
   given below.
8. **Fragment validation.** The records were checked with an adapted copy of
   `tools/check-template-reviews.js`. It instantiates every sample and checks:
   - answer agreement;
   - three distinct displayed variants;
   - the registry version and `source-v1` fingerprint;
   - the source tier.

## Templates

**Columns.**

- **Seeds** gives n in `rv1016-psda.<id>.<n>`.
- **Blind** gives the answers as I recorded them before seeing any key: a
  letter for multiple choice, a number for numeric entry.
- **Kind** is one of:
  - **same**: identical content, and only the file changed;
  - **retier**: re-tiered, with identical draws;
  - **new**: a new template.
- **Band** is my judgement of the official SAT band.

| Template | Tier | Kind | Seeds | Blind | Agree | Band | Verdict and notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| proportional-rate-scaling | Easy | same | 0, 1, 2 | A, 17, B | 3/3 | Easy | Accepted. |
| ratio-share-of-total | Easy | same | 0, 1, 2 | C, D, D | 3/3 | Easy | Accepted. |
| rate-unit-conversion | Easy | same | 0, 1, 2 | 32, C, C | 3/3 | Easy | Accepted. |
| ratio-after-change | Medium | same | 0, 1, 2 | C, 91, A | 3/3 | Medium | Accepted. |
| multi-unit-rate | Medium | same | 0, 1, 2 | D, 15, A | 3/3 | Medium | Accepted. |
| average-rate-two-legs | Medium | same | 0, 1, 2 | 35, C, C | 3/3 | Medium | Accepted. |
| list-mean-or-median | Easy | same | 0, 1, 2 | B, A, B | 3/3 | Easy | Accepted. |
| box-plot-summary | Easy | same | 0, 1, 2 | D, B, B | 3/3 | Easy | Accepted. |
| data-display-center | Medium | same | 0, 1, 2 | C, D, D | 3/3 | Easy–Medium | Accepted. |
| mean-missing-value | Easy | same | 0, 1, 2 | B, C, 626 | 3/3 | Easy | Accepted. |
| weighted-mean-groups | Medium | same | 0, 1, 2 | 33, B, 89 | 3/3 | Medium | Accepted. Minor (pre-existing): the trap prints the averaged-means slip as a cut-off decimal ("4.3333") in 11/600 draws. |
| data-change-statistics | Medium | retier | 0, 1, 2 | A, A, A | 3/3 | Medium (agree) | **Rejected**: the explanation and step 3 are false in some draws. See below. |
| best-fit-line-equation | Easy | same | 0, 1, 2 | 26.2, D, B | 3/3 | Easy | Accepted. |
| scatterplot-shape-and-count | Easy | same | 0, 1, 2 | C, 7, 8 | 3/3 | Easy | Accepted. |
| scatterplot-fit-reading | Medium | same | 0, 1, 2 | 3, 6, 15 | 3/3 | Easy–Medium | Accepted. Minor: when gridlines are 1 unit apart (seed 0), the trap reads "3 grid squares from the line, but each square is 1 unit". |
| two-group-fit-lines | Medium | same | 0, 1, 2 | A, C, D | 3/3 | Medium | Accepted. |
| uneven-table-growth | Medium | same | 0, 1, 2 | 10000, 50, A | 3/3 | Medium | Accepted. Minor: the trap shows a cut-off decimal ("745,833.3333") in 3/600 draws. |
| fit-slope-rescaled-units | Hard | same | 0, 1, 2 | 2100, D, 1680 | 3/3 | Hard | Accepted. |
| sampling-method-choice | Easy | same | 0, 1, 2 | A, C, C | 3/3 | Easy | Accepted. |
| margin-and-sample-size | Easy | same | 0, 1, 2 | 67.3, 22, A | 3/3 | Easy | Accepted. |
| sample-proportion-estimate | Medium | same | 0, 1, 2 | 222, 2482, A | 3/3 | Easy–Medium | Accepted. |
| mark-recapture-estimate | Medium | same | 0, 1, 2 | 1392, 3303, D | 3/3 | Medium | Accepted. |
| sample-inference | Medium | same | 0, 1, 2 | B, D, C | 3/3 | Medium | Accepted. |
| two-estimates-compare | Medium | same | 0, 1, 2 | C, C, B | 3/3 | Medium | Accepted. |
| average-rate-required-leg | Medium | retier | 0, 1, 2 | D, D, C | 3/3 | Medium (agree) | Accepted. Minor (pre-existing) display issue, covered under "Minor defects". |
| density-cube-edge | Hard | same | 0, 1, 2 | 1536, B, A | 3/3 | Hard | **Rejected** (pre-existing): in kg/m³ draws the explanation prints false equations. See below. |
| combined-work-rate | Medium | same | 0, 1, 2 | D, D, C | 3/3 | Medium | Accepted. Minor: seed 0's explanation ends "the whole job takes 18 = 18 minutes". |
| data-change-median | Easy | retier | 0, 1, 2 | A, 4, B | 3/3 | Easy–Medium (border) | Accepted, discussed under "Tier judgements". |
| histogram-class-intervals | Medium | same | 0, 1, 2 | D, B, A | 3/3 | Medium | Accepted. Minor: seed 2 reads "the median is value number 14 and 15". |
| compare-spread-plots | Medium | same | 0, 1, 2 | A, A, B | 3/3 | Medium | Accepted. |
| could-be-median | Medium | retier | 0, 1, 2 | C, 397, D | 3/3 | Medium (agree) | Accepted. The explanation's case split is correct for both even and odd counts. |
| fit-model-choice | Medium | same | 0, 1, 2 | D, B, D | 3/3 | Medium | Accepted. Minor: steps and rationales list ratios such as "1.3333" (20/600 draws). |
| outlier-removal-fit | Hard | same | 0, 1, 2 | A, A, B | 3/3 | Hard | Accepted. All three keys agree with an exact leave-one-out regression on the plotted points. |
| exponential-fit-interpretation | Medium | same | 0, 1, 2 | C, 78.4, B | 3/3 | Medium | Accepted. |
| interval-mean-scope | Medium | same | 0, 1, 2 | D, B, D | 3/3 | Medium | Accepted. |
| stratified-sample-total | Medium | retier | 0, 1, 2 | D, A, 448 | 3/3 | Medium (agree) | Accepted. Minor rationale wording, covered under "Minor defects". |
| extreme-value-correction | Hard | same | 0, 1, 2 | A, 34, 37 | 3/3 | Hard | Accepted. |
| fit-slope-unit-rate | Medium | same | 0, 1, 2 | B, D, B | 3/3 | Medium | Accepted. |
| residual-actual-predicted | Medium | retier | 0, 1, 2 | C, A, D | 3/3 | Medium (agree) | Accepted. |
| experiment-scope-grid | Hard | same | 0, 1, 2 | B, C, C | 3/3 | Medium–Hard | Accepted. |
| margin-sample-size-scaling | Hard | same | 0, 1, 2 | 8334, 54300, B | 3/3 | Hard | Accepted. |
| residual-plot-reconstruction | Medium | same | 0, 1, 2 | 64, 12, 38 | 3/3 | Medium | Accepted. |
| population-density | Medium | new | 1, 2, 3 | D, C, A | 3/3 | Medium (agree) | Accepted. Seed 0 was not used (see Method). Minor: a rationale reads "1 kilometers" in 4/600 draws. |
| crew-rate-change | Hard | new | 0, 1, 2 | C, 2, 8 | 3/3 | Medium, lean (**disagree**, one band) | Accepted with the tier disagreement and minor text defects below. |
| greatest-value-from-center | Hard | new | 0, 1, 2 | A, D, 133 | 3/3 | Hard (agree) | Accepted. |
| line-graph-reading | Easy | new | 0, 1, 2 | C, 300, D | 3/3 | Easy (agree) | Accepted. The figure is assessed below. |

## Rejections

### data-change-statistics (Medium, v5): the explanation is false in some draws

- **Example: seed `rv1016-psda.data-change-statistics.1`.** The key, A ("The
  data for Section 2 have the greater standard deviation"), is correct.
  - The explanation says Section 2 "has 4 values at the extremes (6 and 10)
    and only 4 at the center".
  - Step 3 says "Section 2 puts more of its values at the extremes and fewer
    at the center".
  - Section 1 also has 4 values at 6 and 10, so step 3 is false. Section 2's
    spread comes from its 10 values at 7 and 9, against Section 1's 2.
- **Measured over 3,000 draws (integer seeds 0–1499 and 1,500
  runtime-shaped seeds).**
  - **Symmetric two-column branch.** 115 of 690 draws (17%) have a
    greater-SD set that does not have strictly more values at the extremes
    and strictly fewer at the center.
    - In 15 of them the extreme counts are equal.
    - In 100 of them the greater-SD set has as many or more values at the
      center. Examples: seed `98` has columns 1, 7, 7, 7, 1 against
      3, 4, 9, 4, 3, and seed `42` has 1, 8, 3, 8, 1 against 4, 5, 3, 5, 4.
  - **Mirror branch.** 15 of 675 draws (2%) say the higher-mean set "puts
    more of its values at the high end" when its high-end and low-end counts
    are equal. Example: seed `24`, frequencies 2, 5, 2, 1, 6. The weighted
    statement is true; the count statement is not.
- **Code:** the `statsCompareSpread` function in `one-variable-data.js`. Both
  the explanation template and the steps make this count comparison.
- **Suggested fix**, either of:
  - retry (`return null`) unless the greater-SD set has strictly more values
    at the extremes and strictly fewer at the center (and, in the mirror
    branch, strictly more values at the high end); or
  - rewrite the explanation to compare the distances from the center
    directly. For seed 1 that reads: "Section 2 has 10 values 1 away and
    4 values 2 away; Section 1 has 2 and 4."
- **Tier:** Medium is right; the retier itself is sound.

### density-cube-edge (Hard, v4): false equations in the explanation (pre-existing)

- **Where it occurs.** In draws whose density is in kilograms per cubic
  meter, the explanation and steps 1–2 round the material volume in cubic
  meters to four decimal places, but present it as exact. For example:
  - seed `9`: "… = 0.008 cubic meter, which is 0.008 × 1,000,000 = 7,992
    cubic centimeters";
  - seed `rv1016-psda.density-cube-edge.4`: "1.184 ÷ 500 = 0.0024 cubic meter,
    which is 0.0024 × 1,000,000 = 2,368 cubic centimeters".
- **How often.** 164 of 600 draws (27%). My three blind seeds were all
  grams-per-cubic-centimeter draws, so they do not show it. The text scan
  found it.
- **Code:** `ratios-rates-and-units.js` line 1525, `num(tidy(materialVolume / 1e6))`.
  - The "cube root of the volume in cubic meters" rationale (line 1530)
    rounds the same way.
- **Suggested fix:** print the exact value. The volume is a whole number of
  cubic centimeters, so `materialVolume / 1e6` has at most six decimal places
  (0.002368). Alternatively, convert the mass to grams and the density to
  g/cm³ first, as the other branch does.
- **Tier:** Hard is consistent with the 2026-10-02 review.
- The content is identical to `e87395b`.

## Tier judgements

**Re-tiers.** I agree with all six:

- **`average-rate-required-leg` (Medium).** Total time from the average,
  then subtract and divide. Upper Medium.
- **`data-change-statistics` (Medium).**
- **`could-be-median` (Medium).**
- **`residual-actual-predicted` (Medium).**
- **`stratified-sample-total` (Medium).**
- **`data-change-median` (Easy).** This one sits on the Easy–Medium border.
  - The list form is Easy: remove a value, or add a constant, and say which
    statistic changes.
  - The frequency-table form, where you rebuild the counts, total them,
    locate positions 20–21 and accumulate, has three or four mechanical
    steps.
  - The add-the-mean list form needs a 9-value mean first.
  - I accept Easy (rubric 3, the top of the band), but would not object to
    Medium.

**New templates.**

- **`population-density` (Medium): agree.** The square-mile form, with
  1.6² and the direction of the conversion, is official Medium. The
  rectangle-in-meters form is Easy–Medium.
- **`line-graph-reading` (Easy): agree.** One reading, then a comparison or a
  subtraction.
- **`greatest-value-from-center` (Hard): agree.** It is an optimization under
  a fixed total, with the median capping the upper half; this is the official
  Hard style.
- **`crew-rate-change` (Hard): disagree, by one band.**
  - **The forms are Medium.** The "after the change" and "whole job" forms
    take three short steps: total worker-units, subtract the part done, divide
    by the new crew. The most common error is stopping at, or adding, the
    intermediate quantity. That is the Medium definition in
    `docs/difficulty-calibration.md`.
  - **Inconsistency in the corpus.** This corpus's Medium
    `combined-work-rate` asks the harder version: unequal rates, with one
    worker alone first. Labelling the identical-worker version Hard inverts
    the two.
  - **The "add" form is nearer Hard.** It asks how many workers to add to
    finish k units early, and needs the time left as well as the work left.
  - **Why accepted.** The rubric (9) is at the Hard floor, and the label is
    at most one band off, so I accept it. I record the disagreement.
  - **Constraint on any relabel.** If the author relabels it Medium, the
    Ratios, rates and units Hard cell then holds only `density-cube-edge`.
    A replacement Hard template would be needed first.

## The line graph figure (`line-graph-reading`)

I read 27 rendered seeds, covering all five scenes and all three forms.

- **Official style.** The figure reads like an official SAT line graph.
  - The axes are drawn, the vertical axis is titled with units ("Recycled
    material (tons)", "Visitors (thousands)") and the horizontal axis is
    titled ("Year", "Month", "Week").
  - Every time has a tick and a label. Light horizontal gridlines are labelled
    at the left, and each value is a dot joined by straight segments.
- **No ambiguity.** Every plotted value sits exactly on a gridline, and the
  alt text lists the values in order. I found no ambiguous reading.
- **Two observations, neither a defect.**
  - **Skipped labels.** With more than 12 gridlines, only every other
    gridline is labelled. Examples: tons from 0 to 650 labelled every 100;
    robotics-club members from 0 to 30 labelled every 4, with gridlines every
    2. Values on the unlabelled gridlines (350, 450, 14, 22) must be read as
    midpoints. This is still unambiguous, since the gridlines are evenly
    spaced and official graphs do the same.
  - **Top of the axis.** The axis then ends at an unlabelled top gridline
    (650, or 30).
- **Keys.**
  - **Greatest change:** the template rejects ties, so the key is unique.
  - **"More than / fewer than" count:** a point always sits exactly on the
    level, and the strict reading is the key.
  - **Change between two times:** the key is the absolute difference, and the
    stem names the direction.
- **No title.** The figure has no title above the graph. Official graphs
  sometimes have one; it is not needed here.
- **Not checked.** I rendered the figures with `rsvg-convert`, not in the app.
  I did not check dark mode or 390 px width. The figure uses `currentColor`
  and the same helpers as the other data charts.

## Minor defects (not grounds for rejection)

**In new templates.**

- **`crew-rate-change`.**
  - **Plural slip.** The "add" form's explanation says "To finish 1 hours
    early" or "1 days early" in 59/600 draws (seeds 11, 13, 18, 19).
    Fix: use `plural(early, crew.unit, crew.units)` there, as the stem already
    does.
  - **Punctuation.** In the "after the change" form, three rationales built by
    `correction()` have no final period. Example, seed 8: "Ignores the change
    in the crew and uses the 6 days left on the original plan".
  - **Wording when the crew shrinks.** When workers leave (seeds 7, 9, 21),
    the scaled-the-wrong-way rationale still says "more volunteers take less
    time, not more".
  - **Hint.** "Measure the job in painter-days" comes close to naming the
    method.
- **`population-density`.** The divided-by-the-length-alone rationale says
  "1 kilometers" when the length is 1,000 m, in 4/600 draws. Fix: use
  `S.plural`.

**In re-tiered templates (pre-existing).**

- **`average-rate-required-leg`.** The trap gives the distance-weighted slip
  to four decimal places in 155/600 draws: seed 4 shows "22.3333", and 6/600
  draws show a cut-off repeating decimal. Fix: round to a tenth, or say
  "about".
- **`stratified-sample-total`.** The rationale "Scales each group's sample by
  the other group's size" does not describe how that distractor is computed.
  - The value is each group's sample count times the other group's
    population-to-sample ratio. Seed 1: 21 × 3,510/90 + 15 × 390/30 = 1,014.
  - Read literally, the rationale gives 2,522.
  - Suggested wording: "Scales each group's sample count by the other group's
    ratio of group size to sample size".

**In identical-content templates (pre-existing).** These are listed in the
table above.

## Honest uncertainty

- **What the tiers rest on.** Tier judgements come from my knowledge of
  official SAT items, not from measured student performance. The border cases
  are `data-change-median`, `crew-rate-change`, `data-display-center`,
  `sample-proportion-estimate`, `scatterplot-fit-reading` and
  `experiment-scope-grid`. Reasonable reviewers could differ on them by a band.
- **How deep the review went.**
  - **Identical-content templates.** I reviewed these at the depth the brief
    requires: three blind solves, the explanations of those three seeds, an
    unchanged-content check against `e87395b`, and an automated text scan.
  - **The scan is not an audit.** It is pattern-based (decimals, plurals,
    broken values), not a reading of every explanation. Other pre-existing
    prose defects may remain undetected, as `density-cube-edge` did on its
    three blind seeds.
  - **The rejections are pre-existing.** Both rejected defects predate this
    change and survived the 2026-10-02 review. I may be applying a stricter
    standard to explanation arithmetic than earlier reviewers did. I think
    the standard is right: a student who checks "0.008 × 1,000,000 = 7,992"
    is misled.
- **Blind integrity.**
  - All 138 recorded answers were blind.
  - One full view (`population-density` n = 0) was exposed before the blind
    pipeline existed; that seed was excluded.
  - I had read the author's notes, which describe the forms and distractors,
    before solving.
- **Answers read from figures.** These are read from rendered PNGs at the
  resolution an SVG gives, not from the app.
- **What was not run.** I did not run the full `check-all.js` gate. That gate
  belongs to the templates lane, and other reviewers share this worktree.

## Admission records

The 44 accepted records are in the reviewer's fragment, to be merged into
`content/template-reviews.json` by the coordinator.

- **Shape:** the `reviewer`, `author`, `method`, `reviewedAt` and `evidence`
  fields are as above. Each record has three samples with `scene: null`, and
  the registry version and `source-v1` fingerprint.
- **Validation:** an adapted copy of `tools/check-template-reviews.js` checks
  only this fragment against current source and passes.
- **Not recorded:** `data-change-statistics` (v5) and `density-cube-edge`
  (v4). Each needs a fix and a fresh independent review.

## Pass 2 (`lane/templates` at `47d553a`)

The author fixed both pass-1 rejections and the wording slips listed above,
and rebuilt `crew-rate-change`. Pass 2 re-reviews all 46 Problem-Solving and
Data Analysis templates on `.scratch/lane/stale-templates-pass2.txt`.

The baseline for "identical" is `fa9b23c`. Its families source is identical
to `2928051`, the source reviewed in pass 1: `git diff 2928051 fa9b23c --
src/lib/families tools/lib content/templates` is empty.

### Result

| | Count |
| --- | --- |
| Templates | 46 |
| Accepted | 46 |
| Rejected | 0 |
| Fresh blind solves | 9, all agreeing with the key |
| Blind misses | 0 |
| Pass-1 blind samples carried forward | 129, on 43 templates |

### Method

- **Fresh blind solves.** I solved the three templates whose question or
  verdict changed on fresh seeds `rv1016b-psda.<id>.<n>`, n = 0, 1, 2. Each
  answer was recorded before its full view was generated, using the same
  blind filter as pass 1.
  - All three `density-cube-edge` draws use kilograms per cubic meter, the
    case that pass 1 rejected.
  - I read the pass-2 diff only after these nine answers were recorded.
- **Field-by-field comparison.**
  - **Draws.** Each template was instantiated on 603 seeds from `fa9b23c`
    and from `47d553a`, in separate processes: 300 integer seeds, 300
    runtime-shaped seeds and my three pass-1 seeds.
  - **Fields compared.** Response type, stimulus, stem, figure, choices, key,
    rationales, explanation, steps, principles, trap, hint, strategy,
    difficulty and `verified`.
- **Targeted scans.** Each scan rechecks one fix from the displayed text, as
  described below.
- **Text scan.** I reran the pass-1 text scan: 600 draws of every template.
- **Gates and tests.**
  - `check-families --family` passes for the three changed templates.
  - `test/sat-math-realism.test.js` passes 5/5.

### Templates by kind

| Kind | Templates | Displayed question and key | Verdict |
| --- | --- | --- | --- |
| Identical draws (33) | Every template on the list not named below | Every field identical on all 603 draws per template | Accepted; pass-1 samples carried forward |
| Teaching text or rationale only (10) | `ratio-after-change`, `weighted-mean-groups`, `scatterplot-fit-reading`, `uneven-table-growth`, `average-rate-required-leg`, `combined-work-rate`, `histogram-class-intervals`, `fit-model-choice`, `stratified-sample-total`, `population-density` | Identical on all 603 draws; only the listed text differs | Accepted; pass-1 samples carried forward |
| Teaching text only, rejected in pass 1 | `density-cube-edge` | Identical; explanation, steps and one rationale differ (316 of 603 draws) | Accepted on three fresh blind solves |
| Displayed question changed | `data-change-statistics` (30/603 displayed, 145 teaching) and `crew-rate-change` (603/603) | Changed | Accepted on three fresh blind solves |

**`outlier-removal-fit`, observation only.** One runtime-shaped seed
(`hhdi.outlier-removal-fit.5`) throws "no parameters met the constraints".
It throws identically in both versions, so the defect is pre-existing.
`drawQuestions` never serves a throwing draw.

**The ten text-only templates.** I read the before and after text on at least
three changed draws of each. Every new text is correct.

| Template | What changed |
| --- | --- |
| `ratio-after-change` | "k" for a share of one, and no factor of 1 in the cross-multiplied equation: "8k = 8(3k − 8)" and "2(9k) = 3(k + 35)", checked |
| `weighted-mean-groups` | The trap gives "about 4.33" |
| `uneven-table-growth` | The trap gives "about 19,416.67" |
| `average-rate-required-leg` | The trap gives "about 13.74" |
| `scatterplot-fit-reading` | With 1-unit gridlines, the trap reads "The difference is the vertical distance between the point and the line, 4 grid squares here" |
| `combined-work-rate` | "takes 21 minutes" |
| `histogram-class-intervals` | "the mean of values number 20 and 21" |
| `fit-model-choice` | Ratios read "about 0.958" or "about 1.333"; exact ratios stay exact |
| `stratified-sample-total` | The rationale now names "the other group's ratio of group size to sample size", which matches the computation |
| `population-density` | "1 kilometer" |

### Fresh blind solves

| Template | Tier | Seeds | Blind | Agree |
| --- | --- | --- | --- | --- |
| crew-rate-change | Hard | `rv1016b-psda.crew-rate-change.0–2` | C, A, A | 3/3 |
| data-change-statistics | Medium | `rv1016b-psda.data-change-statistics.0–2` | B, C, D | 3/3 |
| density-cube-edge | Hard | `rv1016b-psda.density-cube-edge.0–2` | 5400, B, 21600 | 3/3 |

### data-change-statistics: the false explanations are gone

- **Draws scanned.** 5,000: 2,500 integer seeds and 2,500 runtime-shaped
  seeds. Of these, 2,232 are table draws (1,118 symmetric, 1,114 mirror) and
  2,768 are statements in words.
- **What was checked, from the displayed table alone.**
  - **Symmetric draws:**
    - the means are equal;
    - the key names the set with the larger SD, computed from the table;
    - step 3 equals the expected sentence, with both sets' counts;
    - those counts show strictly more values at the extremes and strictly
      fewer at the center.
  - **Mirror draws:**
    - the SDs are equal;
    - the key names the set with the higher mean;
    - that set has strictly more values at the high end than at the low end,
      and the explanation quotes its high-end count.
- **Result:** 0 failures.
- **The new explanation is correct.** It gives both sets' counts, for example
  "Clinic Q has 8 values at the extremes (5 and 25) and 6 at the center,
  while Clinic P has 4 at the extremes and 12 at the center".
- **The new filter cannot pick the wrong set.** It keeps a draw only when the
  greater-SD set has more values at the extremes and fewer at the center. Then
  that set's sum of squared distances, which is 8 × outer + 2 × inner in
  units of the step squared, is also the larger: equal totals give a
  difference of 6 × (difference in outer) + (difference in center), which is
  positive.
- **The statements-in-words form** is unchanged and correct. I checked it on
  fresh seeds 0 and 1: adding a value equal to the median keeps the range;
  the mean "can" move.
- **Tier:** Medium.

### density-cube-edge: every printed equation is exact

- **Fresh draws.** All three fresh blind draws are kilograms per cubic meter.
  Their explanations print, for example, "47.25 ÷ 2,000 = 0.023625 cubic
  meters, which is 0.023625 × 1,000,000 = 23,625 cubic centimeters".
- **The scan.** It covers 3,000 draws and checks every arithmetic chain
  ("a op b [op c] = d", with × ÷ + −, squares and cubes) in the explanation,
  steps, trap and rationales. It also checks every "(p/q)s³ = V, so s³ = W"
  and "s³ = W, so s = e" against the arithmetic.
  - **Result:** 11,432 chains and 9,000 cube checks, 0 inexact.
  - **The scan can find the defect.** The same scanner run on `fa9b23c` flags
    692 inexact chains in 600 draws.
- **Tier:** Hard.

### crew-rate-change (Hard, v2): rebuilt, accepted, tier agreed

- **Two forms remain, equally often.**
  - **"How many must join"** asks for the work left over the time left, less
    the crew already working.
  - **"For how long did the original crew work before the others joined"**
    is n·d + (n + k)(D − early − d) = n·D.
- **Keys.** An independent solver reads only the stem and brute-forces the
  joining time. It agrees with the key on all 4,000 draws: 1,996 "join" and
  2,004 "before". Every choice is a whole number.
- **The rationales on the three fresh seeds are correct.**
  - Seed 0, choice A = 6: 2(11 − d) = 5 × 2.
  - Seed 0, choice B = 10: the planned finish, 13.
  - Seed 0, choice D = 3: the hours after the change.
- **Tier: agree that it is Hard, at the lower end.**
  - **"Before" form:** two-phase work with the switching time as the unknown,
    plus the trap of planned versus actual finish. This is an official-Hard
    setup.
  - **"Join" form:** upper Medium.
  - Together they support Hard and the rubric (11). My pass-1 disagreement is
    resolved.
- **Minor, not grounds for rejection.** When one machine or pump is added
  (557 of the 2,004 "before" draws), two rationales still use the plural.
  Seeds 6 and 8 show it: "the extra pumps", "the added pumps' work".
- The pass-1 slips are fixed: "1 day early" and similar, missing periods, the
  shrinking-crew wording, and a hint that named the method.

### Remaining text-scan hits

The text scan finds no cut-off repeating decimal and no count of one with a
plural noun. The remaining long-decimal hits are exact values:

- "1.5625 = 1.25²" (`uneven-table-growth`);
- "0.064125 cubic meters" (`density-cube-edge`);
- "2.4 × 0.001 = 0.0024" (`fit-slope-unit-rate`).

### Pass-2 admission records

- **Records:** the reviewer's fragment holds 46 records, one per template on
  this list.
  - **Fresh samples:** `crew-rate-change`, `data-change-statistics` and
    `density-cube-edge`.
  - **Carried forward:** the pass-1 blind samples for the other 43.
- **Current values:** `templateVersion` and `fingerprint` come from the
  current registry, and `difficulty` from the source. All 46 versions match
  the pass-2 list.
- **Validation.** The adapted copy of `tools/check-template-reviews.js`
  passes. It confirms that all 138 samples rebuild to their recorded answers,
  each template has three distinct displayed questions, and the version,
  fingerprint and tier are current.

### Pass-2 uncertainty

- **Identical-draw templates.** Equality is shown on 603 draws per template,
  across every displayed and teaching field. It is not shown for all seeds.
  The diff of the four edited files touches none of these templates' code.
- **Tiers.** The tier for `crew-rate-change` is still an editorial judgement.
  A reviewer who treats the "join" form as Medium could call the template
  Medium–Hard.

## Pass 3 (`feature/sat` at `4d7c613`)

A cold content review followed pass 2, and the author changed two
`problem-solving-and-data-analysis` files in response: `ratios-rates-and-units.js`
and `one-variable-data.js`. Pass 3 re-reviews the 23 Problem-Solving and Data
Analysis templates from those files on `.scratch/lane/stale-templates-pass3.txt`.

The baseline for "identical" is `3f8e23a`. Its families source is identical
to `47d553a`, the source reviewed in pass 2.

### Result

| | Count |
| --- | --- |
| Templates | 23 |
| Accepted | 23 |
| Rejected | 0 |
| Fresh blind solves | 6, all agreeing with the key |
| Blind misses | 0 |
| Tier changes | None |

### Method

- **Fresh blind solves.** I solved the two templates whose displayed
  questions changed on fresh seeds `rv1016c-psda.<id>.<n>`, n = 0, 1, 2,
  using the pass-1 blind filter.
  - Each answer was recorded before its full view was generated.
  - I read the pass-3 diff only after these six answers were recorded.
- **Field-by-field comparison.**
  - **Draws.** All 23 templates were instantiated on 603–606 seeds from
    `3f8e23a` and from `4d7c613`, in separate processes: 300 integer seeds,
    300 runtime-shaped seeds and my recorded seeds.
  - **Fields compared.** The displayed question, key, rationales,
    explanation, steps, principles, trap, hint, strategy, difficulty and
    `verified`.
- **Scans.**
  - **Stem-only scans** check `greatest-value-from-center` and
    `population-density` from the displayed text alone. Run on `3f8e23a`, the
    same scans flag the old defects: 1,555 draws whose least allowed value is
    unstated, and 321 non-whole count choices.
  - **The pass-2 equation-exactness scan** found 0 inexact chains in 2,000
    draws each of the four changed templates.
  - **The pass-1 text scan** found no hits for any of those four.
- **Gates and tests.**
  - `check-families --family` passes for the four changed templates.
  - `test/sat-math-text.test.js` and `test/sat-math-realism.test.js` pass 8/8.

### Fresh blind solves

| Template | Tier | Seeds | Blind | Agree |
| --- | --- | --- | --- | --- |
| greatest-value-from-center | Hard | `rv1016c-psda.greatest-value-from-center.0–2` | 88, A, A | 3/3 |
| population-density | Medium | `rv1016c-psda.population-density.0–2` | 7500, 50, D | 3/3 |

### greatest-value-from-center (Hard, v3): the ambiguity is gone

- **The scan.** It covers 4,000 draws, roughly 800 for each of the five
  scenes. It parses each stem's least allowed value and computes the key from
  the stem alone.
  - **The five scenes and their least values:**
    - "different positive integers": 1;
    - "different nonnegative integers": 0;
    - "a whole number of points, possibly 0": 0;
    - "at least 15 minutes each day": 15;
    - committee ages "at least 18 years old": 18.
  - **Result:**
    - every stem states its least allowed value;
    - no stem says only "whole numbers";
    - all 4,000 keys agree with the stem-only computation, including 1,004
      greatest-range draws.
- **The merged rationale is correct.** It appears with repeats allowed and
  5 values. There, starting the smaller values one too high and forcing all
  the values to differ both give the largest value minus 2. All 205 merged
  rationales sit on exactly that value.
  - Example, seed 7: 49, "Reads 'at least 15' as 'more than 15' … ; making
    the other values all different … gives the same number".
- **The explanation and steps now name the least value used.** For example,
  "starting from 0, the least value allowed: 0, 1, 2 below the median".
  - For distinct values, the trap now says "the next integers".
- **Tier:** Hard, unchanged.

### population-density (Medium, v3): only whole-number wrong counts

- **The scan.** It covers 4,000 draws, of which 757 ask for the count
  (425 multiple choice).
  - **Whole numbers:** every count choice is a whole number.
  - **Keys:** every key equals density × converted area, recomputed from the
    stem.
  - **Rationales:** each one recomputes exactly to its choice. The formulas
    are:
    - the area left unconverted;
    - the 1.6 length factor;
    - the wrong direction;
    - dividing by 1.6 again;
    - multiplying by 1.6 again (new);
    - stopping at the converted area (new).
- **Example, seed 16:**
  - Key 14,250 = 285 × 50.
  - New slip "Stops at the converted area, 50 square miles, without
    multiplying by the density".
  - 36,480 = 285 × 128.
  - 22,800 = 285 × 80.
- **Draws that changed.** 61 draws changed only because the larger slip set
  shifts the redraws. The number-form traps no longer mention offered
  choices.
- **Tier:** Medium, unchanged.

### Text only: the displayed question and key are identical on all draws

- **`multi-unit-rate` (v6).** The trap now reads "gives a wrong count"
  instead of "gives an offered but wrong count".
  - This changed 112 of 603 draws: 65 multiple choice and 47 numeric.
  - No numeric draw mentions choices anywhere.
- **`crew-rate-change` (v3).** In the "how many must join" form, the step now
  reads: "Time left on the plan: 9 − 2 = 7 hours; to finish 4 hours early:
  7 − 4 = 3 hours." The crew needed is then its own step.
  - This changed 317 of 606 draws.
  - Every printed chain is exact (16,417 checked).
- **Samples.** Both templates carry forward their recorded samples:
  - `multi-unit-rate`: pass-1 seeds;
  - `crew-rate-change`: pass-2 seeds `rv1016b-psda.crew-rate-change.0–2`.

### Identical draws (19)

Every field is identical between `3f8e23a` and `4d7c613` on all 603 or 606
draws of each template. The pass-3 diff of the two files touches none of
their code. The recorded samples carry forward:

- the pass-2 seeds for `data-change-statistics` and `density-cube-edge`;
- the pass-1 seeds for the other 17.

The 19 templates:

- `proportional-rate-scaling`, `ratio-share-of-total`, `rate-unit-conversion`
- `ratio-after-change`, `average-rate-two-legs`
- `list-mean-or-median`, `box-plot-summary`, `data-display-center`,
  `mean-missing-value`, `weighted-mean-groups`
- `data-change-statistics`, `average-rate-required-leg`, `density-cube-edge`
- `combined-work-rate`, `data-change-median`, `histogram-class-intervals`
- `compare-spread-plots`, `could-be-median`, `extreme-value-correction`

### Pass-3 admission records

- **Records:** the reviewer's fragment holds 23 records, one per template on
  the pass-3 list.
  - **Fresh samples:** `greatest-value-from-center` and `population-density`.
  - **Carried forward:** the other 21 keep their samples from the pass-2
    fragment.
- **Current values:** version and fingerprint come from the current registry,
  and difficulty from the source. All 23 versions match the pass-3 list.
- **Validation.** The adapted checker passes. It confirms that all 69 samples
  rebuild to their recorded answers, each template has three distinct
  displayed questions, and the version, fingerprint and tier are current.

### Pass-3 uncertainty

- **Identical-draw templates.** Equality is shown on about 600 draws per
  template, not proven for all seeds.
- **The new blind seeds miss the changed scenes.** None of the three new
  `greatest-value-from-center` blind seeds drew the nonnegative-integers or
  basketball scenes. Those scenes and the merged rationale were checked by the
  4,000-draw scan and by reading full views (seeds 4, 7 and 8), not by blind
  solving.
