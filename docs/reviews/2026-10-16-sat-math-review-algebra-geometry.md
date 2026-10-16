# SAT Math independent review: Algebra and Geometry and Trigonometry, 2026-10-16

- **Reviewer:** `review-20261016-algebra-geometry`, an independent agent. It did not author any of the changes.
- **Author under review:** `templates-lane-20261016`. The author's notes are in `2026-10-16-sat-math-realism-changes.md`.
- **Source reviewed:** branch `lane/templates` at `2928051`. The base for comparison is `e87395b`.
- **Scope:** the "Algebra (45)" and "Geometry and Trigonometry (9)" sections of the stale list, 54 templates in all:
  - 8 new templates;
  - 6 re-tiered templates, one of which (`inequality-two-variable-context`) also has changed draws;
  - 40 templates whose source changed but whose output did not.

This is a **sampled agent review**. It is not human editorial approval and not a calibration of SAT difficulty. The tier judgements below are editorial opinions measured against official SAT practice-question style; nobody measured how hard students actually find these questions.

## Outcome

| | Count |
| --- | --- |
| Templates reviewed | 54 |
| Accepted | 52 |
| Rejected | 2 (`inequality-percent-of-total`, `line-intercept-conditions`) |
| Blind solves | 162 (3 per template) |
| Blind answers that agreed with the key | 162 |
| Blind misses | 0 (none mine, none the template's) |
| Tier disagreements | 1 template one band off (`tiered-rate-regime`), still within the admission tolerance; 3 borderline notes |

The accepted records are in the reviewer's fragment, which the coordinator merges into `content/template-reviews.json`.

## Method

1. **Read first.** I read:
   - `docs/question-templates.md`, including "Independent review admission";
   - `docs/difficulty-calibration.md`;
   - the author's notes, including the author's concerns for reviewers.
2. **Chose seeds.** Each template used `rv1016-alg.<id>.<n>` (Algebra) or `rv1016-geo.<id>.<n>` (Geometry), with n = 0, 1 and 2.
   - A script compared stimulus, stem, figure and sorted choices. It printed seeds only, never keys.
   - All 54 templates gave three distinct displayed questions on n = 0–2.
3. **Solved blind.** All 162 displayed questions were generated with the brief's blind pipeline. That pipeline removes the tier, key marker, rationales, explanation and hint.
   - I solved every question as a strong test-taker.
   - I wrote all 162 answers to a file and made a read-only copy (SHA-256 `5649f4a7…`) before generating any full view.
   - Multiple-choice answers are recorded as the choice index; numeric answers as the number or an exact fraction.
4. **Compared.** A script compared the locked answers with the current keys: 162 of 162 agree.
5. **Confirmed unchanged content (identical-output templates).** I extracted the base source with `git archive e87395b src/lib/families`. Each template in my list was then built from the base and current sources on 603 seeds: my 3 review seeds, 300 integer seeds and 300 runtime-shaped seeds. The comparison covered the whole record: stimulus, stem, figure, choices, key, explanation, steps, trap, hint and rationales.
   - **40 templates:** 0 of 603 records differ.
   - **5 re-tiered templates:** 0 of 603 differ; only `difficulty` and the rubric changed.
   - **`inequality-two-variable-context`:** 53 of 603 differ, all in the stem. On 6,000 seeds the only change is "a $8" → "an $8" (shipping fee), and it is correct.
6. **Deeper judgement (new, re-tiered and changed-draw templates).** These templates had more checks:
   - I read the generator source after the blind solves, so that reading it could not bias them.
   - I read 10–22 further full-view seeds per template (n = 3 onward), checking keys, explanations, steps, traps and every wrong-answer rationale by hand.
   - I rendered the figures (`parallel-line-through-point`, `inequality-graph-region`, and all figures from my blind seeds) in headless Chromium and inspected them.
   - I ran `node tools/check-families.js --section sat-math --family <id>`. All ten new or changed templates pass.
   - I scanned 600 draws per template, across all 54, for text slips that check 15 does not catch: "1 of whom are", "a 8%", "+ −", a hyphen used as a minus sign, NaN, doubled spaces, "1x" and "−0". The two hits are reported below.
7. **Validated the fragment.** I adapted `tools/check-template-reviews.js` to check only my fragment against the current source. It checks answer agreement, three distinct displayed variants, version, fingerprint and tier. It passes for all 52 records.

## Rejections

### 1. `inequality-percent-of-total` (Hard, v1): ungrammatical stem in about 8% of draws

- **Seed:** `rv1016-alg.inequality-percent-of-total.10`.
  - Displayed: "A school club has 55 members, **1 of whom are seniors**."
  - Seeds `.18` ("1 of whom are seniors") and `.21` ("1 of which are borrowed from other museums") show the same fault.
- **Extent:** 48 of the gate's 600 draws.
- **Cause:** `X0 = t.int(1, …)` (`linear-inequalities.js:2170`). Every scene's text then puts a plural verb and noun after a count of one.
- **Why it is a defect:** it falls in the class of defect that check 15 rejects ("a count of one with a plural unit"), but check 15 does not detect this phrasing. It breaks the SAT register of the displayed stem.
- **Everything else is sound:**
  - The key, explanation, steps, trap, rationales and tier are correct in every draw I read. That covers 3 blind seeds plus 12 more.
  - My blind answers (A, A, C) were all correct.
  - The tier is Hard; I judge the type official Medium–Hard.
- **Suggested fix:** draw `X0` from 2, or use singular wording when `X0 = 1`. The fix changes the fingerprint, so the template needs a fresh review afterwards.

### 2. `line-intercept-conditions` (re-tiered Hard → Medium, v4): a wrong wrong-answer rationale in about 4% of draws

- **Seed:** `rv1016-alg.line-intercept-conditions.9`. The question: "slope of −1/2 … If b − a = 6, what is the value of a?"
- **The defect:** choice C, "3", has the rationale "Assumes the two intercepts are equal."
  - If a = b, then b − a = 0, which contradicts b − a = 6.
  - The value 3 is (b − a)/2. No coherent wrong assumption produces it when a is asked: assuming a = −b gives a = −3.
- **Extent:** in 24 of the gate's 600 draws, a rationale explains a value that does not follow from it. It occurs only in the difference form (b − a). The sum form, a + b, is correct.
- **Students see this text.** `src/app/views/review.js` and `src/app/test-shell.js` show the rationale to a student who chose that answer.
- **Cause:** `[total / 2, "Assumes the two intercepts are equal."]` (`linear-equations-in-two-variables.js:1788`) is offered for both the sum and the difference forms.
- **History:** the defect predates this change, since the output is identical to `e87395b`. It is in scope because the template was re-tiered.
- **Everything else is sound:**
  - My blind answers (−2, A, −6) were correct.
  - The key, explanation and the other rationales are correct.
  - The Medium tier is acceptable. I judge the type official Medium–Hard.
- **Suggested fix:** offer `total / 2` with this reason only when `useSum` is true. In the difference form, either offer `askB ? total / 2 : −total / 2` with the reason "Assumes the intercepts are opposites (a = −b)", or drop that distractor.

## Per-template results

Each template's seeds are `<prefix>.<id>.0`, `.1` and `.2`. The prefix is `rv1016-alg` for Algebra and `rv1016-geo` for Geometry. Blind answers are in seed order: a letter is a multiple-choice answer, and a number is a numeric entry. "Official band" is my judgement of the College Board band for the question type.

Kinds of change:
- **N:** new template.
- **T:** re-tiered only.
- **T+D:** re-tiered, with changed draws.
- **S:** source changed, but the records are identical to `e87395b` on 603 seeds.

### Algebra

| Template | Kind | Tier | Ver | Blind answers | Agree | Official band | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| linear-equation-solve | S | Easy | 4 | A, 9, B | 3/3 | Easy | Unchanged. |
| linear-equation-context-meaning | S | Easy | 4 | A, D, A | 3/3 | Easy | Unchanged. |
| equation-solution-count | S | Medium | 4 | D, D, 9 | 3/3 | Easy–Medium | Unchanged. The author declined to move it to Easy; within one band. |
| linear-equation-word-model | S | Easy | 3 | D, 17, 3 | 3/3 | Easy | Unchanged. |
| literal-equation-rearrange | S | Medium | 4 | B, D, D | 3/3 | Easy–Medium | Unchanged. Within one band. |
| linear-expression-from-equation | S | Medium | 3 | 60, B, A | 3/3 | Medium | Unchanged. |
| function-value-and-input | S | Easy | 4 | 6, D, 0 | 3/3 | Easy | Unchanged. |
| slope-from-two-points | S | Easy | 4 | 1/2, B, B | 3/3 | Easy | Unchanged. |
| line-intercept-read | S | Easy | 4 | −8, D, A | 3/3 | Easy | Unchanged. |
| function-constant-from-value | S | Medium | 4 | D, −2, 8 | 3/3 | Easy–Medium | Unchanged. |
| perpendicular-line-through-point | S | Medium | 3 | D, A, B | 3/3 | Medium | Unchanged. |
| linear-function-transformation | S | Medium | 4 | B, D, B | 3/3 | Medium | Unchanged. |
| linear-function-identity | S | Hard | 4 | B, 11, D | 3/3 | Hard | Unchanged. |
| point-on-line | S | Easy | 4 | C, C, C | 3/3 | Easy | Unchanged. The three keys are all C by chance; the three questions differ. |
| standard-form-slope | S | Easy | 4 | B, 3/4, C | 3/3 | Easy | Unchanged. |
| two-variable-equation-model | S | Easy | 4 | A, B, C | 3/3 | Easy | Unchanged. |
| linear-graph-context | S | Easy | 4 | C, 470, C | 3/3 | Easy | Unchanged. |
| linear-model-interpretation | S | Medium | 4 | 45, B, A | 3/3 | Easy–Medium | Unchanged. The hours-to-minutes form is Medium. |
| line-point-shift | S | Medium | 4 | 6, C, D | 3/3 | Medium | Unchanged. |
| inequality-allowed-range | S | Easy | 5 | B, D, B | 3/3 | Easy | Unchanged. |
| linear-inequality-solve | S | Easy | 5 | −6, 9, A | 3/3 | Easy | Unchanged. |
| inequality-word-limit | S | Easy | 4 | 22, 22, B | 3/3 | Easy | Unchanged. |
| inequality-system-check | S | Medium | 4 | −3, 5, D | 3/3 | Easy–Medium | Unchanged. |
| inequality-integer-optimization | S | Medium | 5 | 13, 28, 33 | 3/3 | Medium | Unchanged. |
| inequality-region-corner | S | Hard | 6 | B, A, D | 3/3 | Medium–Hard | Unchanged. |
| literal-equation-factor-target | T | Medium | 4 | B, A, C | 3/3 | Medium | Agree with the move from Hard to Medium. Explanations and rationales are correct on 13 seeds, including the sign-flip equivalence in seed .1. |
| linear-equation-unknown-constants | S | Hard | 4 | 1/3, D, −3/2 | 3/3 | Hard | Unchanged. Agree with the author keeping it Hard. |
| linear-equation-two-quantities | T | Medium | 4 | 7, 1974, A | 3/3 | Medium | Agree with the move from Hard to Medium. 13 seeds checked by hand. On 1,500 seeds, every key (including the solution of each "which equation" key) falls after the delayed start, so the delayed model always applies. |
| linear-graph-transform-parameter | S | Medium | 4 | C, C, A | 3/3 | Medium | Unchanged. The figures are clean. |
| linear-table-unknown-entry | T | Medium | 4 | 7/2, C, A | 3/3 | Medium (the intercept and f(3) asks lean Medium–Hard) | Agree with the move from Hard to Medium. 13 seeds checked by hand. Each distractor carries one modelled slip in solving for a, then the correct line from that a. Explanation nit in seed .2: "4 · −3a" needs parentheses. |
| linear-intercept-meaning | S | Easy | 3 | A, B, D | 3/3 | Easy | Unchanged. |
| translated-line-intercept | S | Medium | 3 | A, C, D | 3/3 | Medium | Unchanged. The figures are clean. |
| line-intercept-conditions | T | Medium | 4 | −2, A, −6 | 3/3 | Medium–Hard | **Rejected:** a wrong rationale. See Rejections. |
| inequality-two-variable-context | T+D | Easy | 5 | B, B, A | 3/3 | Easy (the bound form is Easy–Medium) | See "Flagged borderline cases". The only change in draws is the article fix, which is correct. Nit: the bound-form explanation uses x and y, which that stem never defines. |
| inequality-graph-region | T | Medium | 4 | B, B, 19 | 3/3 | Medium | Agree with the move from Hard to Medium. The figures are clean: shading, solid lines and dashed lines are correct on 6 rendered seeds. 15 seeds were checked by hand. |
| inequality-parameter-range | S | Medium | 5 | C, A, 2 | 3/3 | Medium | Unchanged. |
| integer-combination-count | S | Hard | 4 | A, D, B | 3/3 | Medium–Hard | Unchanged. |
| inequality-solution-containment | S | Hard | 2 | 6, 7, A | 3/3 | Hard | Unchanged. |
| linear-solution-parameter-condition | N | Hard | 1 | C, C, D | 3/3 | Medium–Hard | See "Flagged borderline cases". |
| tiered-rate-regime | N | Hard | 1 | 3.25, B, A | 3/3 | **Medium** | Accepted. **Tier disagreement**, one band: see "Flagged borderline cases". |
| parallel-line-through-point | N | Medium | 1 | C, 11, C | 3/3 | Easy–Medium | See "Flagged borderline cases". |
| linear-percent-of-original-rate | N | Hard | 1 | C, 1000, A | 3/3 | Medium–Hard | See "Flagged borderline cases". |
| standard-form-sign-quadrants | N | Hard | 1 | C, D, A | 3/3 | Hard | See "Flagged borderline cases". |
| inequality-system-from-context | N | Medium | 1 | C, B, B | 3/3 | Easy–Medium | See "Flagged borderline cases". |
| inequality-percent-of-total | N | Hard | 1 | A, A, C | 3/3 | Medium–Hard | **Rejected:** stem grammar. See Rejections. |

### Geometry and Trigonometry

| Template | Kind | Tier | Ver | Blind answers | Agree | Official band | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| right-triangle-ratio-read | S | Easy | 4 | B, D, 4/5 | 3/3 | Easy | Unchanged. |
| special-right-triangle | S | Easy | 4 | C, B, C | 3/3 | Easy | Unchanged. |
| pythagorean-two-step | S | Medium | 5 | 720, C, 360 | 3/3 | Medium | Unchanged. The figures are clean and to scale. |
| trig-context-length | S | Medium | 4 | 56.1, D, C | 3/3 | Easy–Medium | Unchanged. |
| trig-similar-cofunction | S | Hard | 4 | B, A, D | 3/3 | Hard | Unchanged. |
| unit-circle-quadrant | S | Medium | 4 | D, A, A | 3/3 | Medium | Unchanged. |
| cofunction-complementary-angles | S | Medium | 3 | C, A, B | 3/3 | Medium | Unchanged. |
| two-observer-elevation | S | Hard | 4 | 35, 22, A | 3/3 | Medium–Hard | Unchanged. The figures are clean. |
| trig-ratio-from-ratio | N | Medium | 1 | B, 24, D | 3/3 | Medium (the side form is Easy–Medium) | See "Flagged borderline cases". |

## Flagged borderline cases

### inequality-two-variable-context (Easy, at the top of the rubric)

**Form shares (600 draws):**

| Form | Share |
| --- | --- |
| "Which inequality represents this situation" | 42% |
| Bound: fix one count, solve and round | 46% |
| "Which combination is possible" | 12% |

**Judgement:**
- The "which inequality" form is official Easy.
- The bound form needs four steps: substitute, subtract, divide, and round in the direction the context requires. Its distractors model wrong methods (rounding up, swapped rates, the fee left out), not arithmetic slips. That form is Easy–Medium.
- Its rubric of 3, with distractors scored 0, is optimistic: I would score the bound form 4.
- This is still within one band, so I accept Easy for the template. If calibration is pursued, I support the author's suggestion to split the bound form into a Medium sibling rather than rescore the template.

### tiered-rate-regime (Hard): tier disagreement

**I judge this type official Medium, so Liminal Hard is one band high.** I accepted it because the admission rule allows a one-band difference.

**Why Medium:**
- A strong student compares the total with the amount at the threshold in a few seconds (for example, 1,425 > 1,200). Then one equation in one piece remains.
- The cyclist scene (always over the threshold) has no real threshold decision at all, because the story says the second speed covers "the rest of the ride".
- The "under the threshold" draws carry a good trap: the piecewise equation when only the first rate applies.
- I would score the rubric 2,1,1,2,0,0,1 = 7. The template's 10 counts both concept and interpretation at 2, which this item does not earn.

**Correctness:**
- The keys, explanations and rationales were correct on all 23 seeds I read.
- `verify` steps the accumulation independently.

**Consequence of moving it:** moving it to Medium would take the Algebra Hard count to 11, below the freshness need of 12 that the author notes. The coordinator should weigh that against this disagreement.

### linear-solution-parameter-condition (Hard)

- **Condition form (55%), "Which describes all values of a for which the solution is less than c?":** Medium–Hard to Hard.
  - The solution must be solved for in terms of a, then the inequality must be reversed when dividing by a negative.
  - The 2×2 choice set (direction × sign) has no tell.
- **Value form (45%), "solution is 8 more than a" or "twice a":** reads as official Medium.
- Hard is acceptable for the template.
- Correctness: 21 seeds checked; all keys, explanations and rationales are correct.

### linear-percent-of-original-rate (Hard)

**Judgement:** Medium–Hard. The model must be written with an unknown starting value, and the percent-of-current-value and compounding slips are both offered. The "start" ask is the lightest form (for example, 1.05a = 4,200), as the author says. Hard is acceptable.

**Correctness:** 17 seeds checked by hand, including the compounding distractor values; all correct.

**Minor nit:** the rationale "Applies a 8% change…" should read "an 8%". It occurs in 3 of 600 draws, in the van scene with the "later" ask (`linear-functions.js:1750`). This text is shown only after answering, and check 15 does not cover rationales. It is not blocking.

### parallel-line-through-point (Medium)

**Judgement:** official Easy–Medium; Medium is fine.

**Coverage:** all four given forms appear across 19 seeds: standard form, slope-intercept form, two points, and a graph. All three asks appear: the y-intercept, the equation, and k.

**Figures:** I rendered 9 graph-form figures. They are clean, with lattice points readable, the ℓ label placed off the axes, and no clipping.

**Distractors:** the perpendicular slope, the reciprocal slope, a sign slip for each form, line ℓ's own intercept, and m's intercept on the way to k. All rationales are correct.

### standard-form-sign-quadrants (Hard)

**Judgement:** official Hard; the tier is right.

**Correctness:** 15 seeds checked by hand across the five equation shapes. Inputs are given either as pairwise products or as single signs. All keys and rationales are correct. `verify` reconstructs the answer from numeric substitutions into the displayed equation.

**Quadrant ask:** all four quadrants are always offered, so there is no tell.

**Wording:** the shorthand "The x-intercept is positive", which the author flagged, is understandable. Official items usually say "the x-coordinate of the x-intercept". I suggest that wording, but this is not blocking.

### inequality-system-from-context (Medium)

**Judgement:** official Easy–Medium; Medium is fine. The strict versus non-strict choices and the reversed ratio make it a careful-reading item.

**Correctness:** 15 seeds checked by hand.
- All five scenes appear.
- Both variable orders appear (x is sometimes the second item in the story).
- Both forms appear: count plus total, and total plus "at least k times as many".
- All keys and rationales are correct.

**Choice set:** the 2×2 error grids have no tell.

### trig-ratio-from-ratio (Medium)

**Judgement:** official Medium. The side form (find a side from a ratio and one side) is Easy–Medium. Medium is fine.

**Correctness:** I checked by hand the 3 blind seeds, 22 further seeds (n = 3–24), and the multiple-choice side-form items among n = 25–90. All keys are correct, including the complementary-angle asks, where sin A = cos B and the tangents are reciprocals.

**Minor wording:** in the side form, the rationale "Subtracts the known leg from the hypotenuse" is used even when that leg was derived from the ratio rather than given. Seed `.18` is an example: hypotenuse PQ = 102 is given, and PR = 90 is derived. The text is imprecise but not wrong, and not blocking.

**Variety:** the 11-60-61 triple recurs often, but variety is otherwise good.

### Also reviewed: re-tiered, not flagged by the author

I agree with every Hard → Medium move:
- literal-equation-factor-target;
- linear-equation-two-quantities;
- linear-table-unknown-entry;
- inequality-graph-region;
- line-intercept-conditions, whose tier is fine; it is rejected only for its rationale.

All five are official Medium, or Medium–Hard at most.

## Uncertainty and limits

- **Independence is partial.** I am the same model family as the author's agents. A blind solve that agrees with the key shows that a strong solver reaches the key from the displayed text. It cannot rule out a blind spot that the author and I share.
- **Tier judgements are opinions.** "Official band" is my reading of College Board practice-question style, not data. Reasonable reviewers could move several Easy–Medium or Medium–Hard rows by one band either way. Only `tiered-rate-regime` sits a full band from my judgement.
- **Coverage is sampled.**
  - Identical-output templates got 3 blind solves each, plus a mechanical record comparison on 603 seeds. Their wrong-answer rationales were not re-audited beyond those seeds.
  - New and re-tiered templates got 10–22 further full-view seeds each, plus a 600-draw text scan.
  - Rare branches can still hide defects. `tools/check-families.js --reps 3000` is the author's deeper pass; I did not rerun it.
- **Reading order.** I read the generator source after the blind solves, not before as the brief lists it. I did this deliberately, so the solves could not be informed by the code.
- **Figures.** I inspected figures by rendering the raw SVG in headless Chromium. The app's sanitizer path is covered by the gate's check 11, not by me.

## Pass 2 (after the author's fixes), 2026-10-16

- **Source reviewed:** `lane/templates` at `47d553a`.
- **Comparison base:** `fa9b23c`. `git diff --quiet 2928051 fa9b23c -- src/lib/families` confirms that its family source is byte-identical to the source I reviewed in pass 1. `src/lib/families/shared` and the catalog are unchanged in this pass.
- **Scope:** my domain's sections of `.scratch/lane/stale-templates-pass2.txt`: 46 Algebra and 9 Geometry and Trigonometry templates, 55 in all.
- **Pass 2 for each template**, classified by my own comparison of 603 draws per template against `fa9b23c` (below):

  | Kind | Count | What pass 2 did |
  | --- | --- | --- |
  | New, or the displayed question changed | 4 | 3 fresh blind solves at `rv1016b-alg.<id>.0–2` and the full judgement |
  | Tier only | 1 | Confirmed identical draws; judged the new tier; carried pass-1 samples |
  | Teaching text or rationales only | 6 | Confirmed identical displayed questions; read the changed text; carried pass-1 samples |
  | Identical draws | 44 | Confirmed identical; carried pass-1 samples |

  My classification matches the author's list.

This is still sampled agent review, not human editorial approval or a calibration of SAT difficulty.

### Pass 2 outcome

| | Count |
| --- | --- |
| Templates reviewed | 55 |
| Accepted | 55 |
| Rejected | 0 |
| Fresh blind solves | 12 |
| Fresh blind answers that agreed with the key | 12 |
| Blind misses | 0 |
| Pass-1 samples carried forward | 51 templates × 3; each still rebuilds to the answer I recorded |

**Tiers:**
- **`tiered-rate-regime` → Medium:** agreed. It matches my pass-1 judgement, and the new rubric (2,1,1,2,0,0,1 = 7) is the one I suggested.
- **New `line-intercept-parameter-range` at Hard:** agreed (official Hard).
- **No other tier changed in my domain.**

### Pass 2 method

1. **Fresh blind solves.** I picked seeds with a script that compares displayed questions only. n = 0–2 gave distinct questions for all four templates.
   - I solved them through the brief's blind pipeline.
   - I locked the 12 answers in a read-only file (SHA-256 `0a9ae815…`) before opening any full view or the new source.
   - I then compared them with the keys: 12 of 12 agree.
2. **Draw comparison.** I extracted `fa9b23c`'s families with `git archive`. For every template on the list, I built the current and base sources on 603 seeds: my 3 pass-1 seeds, 300 integer seeds and 300 runtime-shaped seeds.
   - **Displayed question:** stimulus, stem, figure, choices, response type.
   - **Key:** compared separately.
   - **Teaching text:** rationales, explanation, steps, principles, trap, hint.
   - **Metadata:** also compared.

   The counts are in the table below.
   - For the tier-only template and the 6 text-only templates, I repeated the comparison on 6,000 draws each: 0 displayed or key differences.
   - The pass-1 samples of every carried-forward template are among the identical draws.
3. **Changed text.** For each text-only template, I printed old and new text side by side on 3–8 changed draws and checked each change by hand.
4. **New and changed templates.**
   - I read the new source and the diffs, and 10–20 further full-view seeds of each template, with explanations.
   - I ran `check-families --family` on each: all pass, as do the other changed templates.
   - `node --test test/sat-math-text.test.js` passes (2/2), and `node --test test/sat-math-realism.test.js` passes (5/5).
   - My pass-1 text scan (patterns that check 15 does not catch) on 600 draws of all 55 templates: no hits.
5. **Fragment.** `reviews-pass2.json` holds all 55 accepted records, built by script with:
   - version and fingerprint from the current registry;
   - difficulty from the source;
   - fresh samples for the 4 templates whose displayed question changed or that are new;
   - pass-1 samples for the rest.

   My adapted checker passes all 55. Run against the old pass-1 fragment, it reports every record stale, so the check is not vacuous.

### Pass-1 defects: confirmed fixed

- **`inequality-percent-of-total`, the "1 of whom are" defect.**
  - **Fix:** the starting count is now drawn from 2.
  - **20,000 draws** (10,000 integer and 10,000 runtime-shaped seeds): no "1 of whom" or "1 of which" in any field (stem, choices, rationales, explanation, steps, trap, hint). The least starting count shown is 2.
  - **Judgement:** I read 15 further draws by hand (n = 0–14) across all five scenes and both asks. Keys, explanations and rationales are all correct. The template is accepted at Hard (official Medium–Hard, as in pass 1).
- **`line-intercept-conditions`, the b − a rationale.** I wrote a semantic check that recomputes each distractor in the slope-and-sum form from the slip its rationale names:
  - equal intercepts;
  - opposite intercepts;
  - the other intercept, with or without a lost sign;
  - a lost sign;
  - slope read as b/a, with either intercept reported.

  **Result on 20,000 draws:**
  - 5,299 multiple-choice draws in that form, and 15,897 rationales.
  - **0 mismatches.**
  - "Assumes the two intercepts are equal" never appears in the b − a form.
  - The new "Assumes the two intercepts are opposites (a = −b), so b − a = 2b" appears 837 times, always in the b − a form, always with the right value for the intercept asked. It shows total/2 when b is asked and −total/2 when a is asked; examples are seeds 76, 80 and 118.

  **Judgement:** the key and explanations are correct, including the new shortened step when the coefficient of a is 1. With slope −2 in the b − a form, b − a = a; seed 253 reads "Substitute into b − a = −6: a = −6." The template is accepted at Medium.
- **Pass-1 slips:** all fixed, on the draws I read.

  | Template | Pass-1 slip | Now |
  | --- | --- | --- |
  | linear-percent-of-original-rate | "a 8% change" in a rationale | "an 8% change", via `S.article` (3 of 603 draws) |
  | linear-table-unknown-entry | "4 · −3a" | "4 · (−3a)" |
  | inequality-two-variable-context | Explanations used x and y without defining them | The bound-form and pair-form explanations and first steps now open "Let x be the number of … and y the number of …". The model form, whose stem defines them, is unchanged |
  | standard-form-sign-quadrants | "x-intercept is positive" shorthand | Choices, rationales and steps say "the x-coordinate of the x-intercept" and "the y-coordinate of the y-intercept"; the first step gives the intercepts as points |
  | trig-ratio-from-ratio | "Subtracts the known leg …" when the leg was not given | The slip names its sides ("Finds XZ as XY − YZ instead of using the Pythagorean theorem") and is offered only when that side is the one asked. Checked on 8 draws |

  **Other text changes** are correct. `linear-expression-from-equation`'s "Solve: u = −9, so u = −9" became "Collect the u-terms and the constants: u = −9". `line-intercept-read`'s "…, so y = 8" doubling was removed.

### New template: `line-intercept-parameter-range` (Hard, v1): accepted

**What it asks.**
- **Slope form (60%).** A line has slope m and passes through (p, q). Its x-intercept k = p − q/m must lie to one side of c. The question asks either "which could be m" or "all possible values of m".
- **Intercept form (40%).** A line passes through (p, q) and (0, b), with k = pb/(b − q) ≥ c or > c. The question asks for the greatest integer b.

**My blind solves:**
- `rv1016b-alg.line-intercept-parameter-range.0`: (5, 3), k < −1, so 0 < m < 1/2. Answer B (1/8).
- `.1`: (4, 9), k > 11, so −9/7 < m < 0. Answer A (−6/7).
- `.2`: (4, 2), k > 13, so −2/9 < m < 0. Answer C (−1/6).

All three agree with the key.

**Checked by hand on 20 further seeds (n = 3–22), with explanations for 0, 1, 14 and 22:**
- The algebra is right in both directions. Only one sign of m can work, so the valid set is strictly between 0 and the boundary slope; for b, it is q < b < cq/(c − p).
- Every rationale matches the value it explains:
  - the boundary slope or b, which puts k exactly at c;
  - multiplying by m without deciding its sign;
  - reversing when m must be positive;
  - p + q/m, the lost sign;
  - a slope of 0, which gives no x-intercept;
  - c distributed as cb − q, which gives the greatest integer below q/(c − p).
- `verify` finds each x-intercept by bisection and scans the parameter independently of the formula.

**Judgement.**
- **Tier:** official Hard. The parameter sits in a denominator, and its sign must be decided before the inequality is cleared. The rubric (1,2,1,2,2,1,2 = 11) is plausible.
- **Stem register:** good. The stem names no method, and the gate passes.
- **Variety:** good across points, directions and asks.
- **Coverage limit:** the intercept form only ever asks for k beyond a point to the right (k > c or k ≥ c). That is a variety limit, not a defect.

### `standard-form-sign-quadrants` (Hard, v2): accepted

- **Fresh blind solves:** `rv1016b-alg.standard-form-sign-quadrants.0` (rx − sy = t), answer A; `.1` (intercept signs from pq < 0 and pr < 0), answer D; `.2` (p < 0, q > 0, r < 0), answer C. All agree with the key.
- **Further seeds:** 10 more checked by hand (n = 3–12) across all five equation shapes and all three asks. Every key and rationale is correct.
- **New choices:** the longest is about 100 characters, under the 160 limit.
- **Remaining shorthand, not blocking:** the quadrant-form step still says "a positive y-intercept" ("A line with a negative slope and a positive y-intercept passes through …"). That is ordinary usage in a step, not in a choice.

### Pass 2 per-template results

Columns:
- **Kind:** New, Shown (the displayed question changed), Tier (tier only), Text (teaching text or rationales only), or Same (identical draws).
- **Draws differing:** of 603, against `fa9b23c`, counted as displayed / key / teaching text.
- **Samples:** for the four fresh templates, the fresh blind answers in seed order; otherwise the pass-1 samples, carried forward unchanged, whose answers are in the pass-1 tables.

All 55 are accepted.

| Template | Kind | Tier | Ver | Draws differing (displayed / key / teaching) | Samples |
| --- | --- | --- | --- | --- | --- |
| linear-equation-solve | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-equation-context-meaning | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| equation-solution-count | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-equation-word-model | Same | Easy | 4 | 0 / 0 / 0 | pass 1, carried |
| literal-equation-rearrange | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-expression-from-equation | Text | Medium | 4 | 0 / 0 / 61 | pass 1, carried |
| function-value-and-input | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| slope-from-two-points | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| line-intercept-read | Text | Easy | 5 | 0 / 0 / 14 | pass 1, carried |
| function-constant-from-value | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| perpendicular-line-through-point | Same | Medium | 4 | 0 / 0 / 0 | pass 1, carried |
| linear-function-transformation | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-function-identity | Same | Hard | 5 | 0 / 0 / 0 | pass 1, carried |
| point-on-line | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| standard-form-slope | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| two-variable-equation-model | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-graph-context | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-model-interpretation | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| line-point-shift | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| inequality-allowed-range | Same | Easy | 6 | 0 / 0 / 0 | pass 1, carried |
| linear-inequality-solve | Same | Easy | 6 | 0 / 0 / 0 | pass 1, carried |
| inequality-word-limit | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| inequality-system-check | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| inequality-integer-optimization | Same | Medium | 6 | 0 / 0 / 0 | pass 1, carried |
| inequality-region-corner | Same | Hard | 7 | 0 / 0 / 0 | pass 1, carried |
| literal-equation-factor-target | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-equation-unknown-constants | Same | Hard | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-equation-two-quantities | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-graph-transform-parameter | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| linear-table-unknown-entry | Text | Medium | 5 | 0 / 0 / 224 | pass 1, carried |
| linear-intercept-meaning | Same | Easy | 4 | 0 / 0 / 0 | pass 1, carried |
| translated-line-intercept | Same | Medium | 4 | 0 / 0 / 0 | pass 1, carried |
| line-intercept-conditions | Shown | Medium | 5 | 18 / 5 / 32 | fresh: B, −6, −7 (3/3) |
| inequality-two-variable-context | Text | Easy | 6 | 0 / 0 / 349 | pass 1, carried |
| inequality-graph-region | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| inequality-parameter-range | Same | Medium | 6 | 0 / 0 / 0 | pass 1, carried |
| integer-combination-count | Same | Hard | 5 | 0 / 0 / 0 | pass 1, carried |
| inequality-solution-containment | Same | Hard | 3 | 0 / 0 / 0 | pass 1, carried |
| linear-solution-parameter-condition | Same | Hard | 2 | 0 / 0 / 0 | pass 1, carried |
| tiered-rate-regime | Tier | Medium | 2 | 0 / 0 / 0 | pass 1, carried |
| parallel-line-through-point | Same | Medium | 2 | 0 / 0 / 0 | pass 1, carried |
| linear-percent-of-original-rate | Text | Hard | 2 | 0 / 0 / 3 | pass 1, carried |
| standard-form-sign-quadrants | Shown | Hard | 2 | 306 / 0 / 603 | fresh: A, D, C (3/3) |
| inequality-system-from-context | Same | Medium | 2 | 0 / 0 / 0 | pass 1, carried |
| inequality-percent-of-total | Shown | Hard | 2 | 335 / 136 / 335 | fresh: 30, B, D (3/3) |
| line-intercept-parameter-range | New | Hard | 1 | — | fresh: B, A, C (3/3) |
| right-triangle-ratio-read | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| special-right-triangle | Same | Easy | 5 | 0 / 0 / 0 | pass 1, carried |
| pythagorean-two-step | Same | Medium | 6 | 0 / 0 / 0 | pass 1, carried |
| trig-context-length | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| trig-similar-cofunction | Same | Hard | 5 | 0 / 0 / 0 | pass 1, carried |
| unit-circle-quadrant | Same | Medium | 5 | 0 / 0 / 0 | pass 1, carried |
| cofunction-complementary-angles | Same | Medium | 4 | 0 / 0 / 0 | pass 1, carried |
| two-observer-elevation | Same | Hard | 5 | 0 / 0 / 0 | pass 1, carried |
| trig-ratio-from-ratio | Text | Medium | 2 | 0 / 0 / 89 | pass 1, carried |

### Pass 2 uncertainty

- **Same limits as pass 1:** the reviewer is the same model family as the author, coverage is sampled, and tier calls are editorial opinions.
- **Coverage of the new template:** the Hard tier rests on 3 blind and 20 read seeds. I did not rerun `check-families --reps 3000`; the author reports that it passes.
- **Desmos routes:** I did not check the routes for the changed templates; the author reports them verified.
- **Identical-draw templates:** "identical" means identical on 603 seeds, or 6,000 for the tier-only and text-only templates. The fingerprint changed only because each template's source file changed.

## Pass 3 (after the cold content review), 2026-10-16

- **Source reviewed:** the worktree at `4d7c613`.
- **Comparison base:** `3f8e23a`. Its family source is byte-identical to the `47d553a` source I reviewed in pass 2. `src/lib/families/shared` and the catalog are unchanged in this pass.
- **Scope:** the 32 Algebra and Geometry and Trigonometry templates on `.scratch/lane/stale-templates-pass3.txt`:
  - all of `linear-equations-in-one-variable`, `linear-inequalities` and `right-triangles-and-trigonometry`;
  - my own classification on 603 draws per template agrees with the author's.

  | Kind | Count | What pass 3 did |
  | --- | --- | --- |
  | Displayed question changed | 3 | Fresh blind solves at `rv1016c-alg.<id>.0–2` and the full judgement |
  | Teaching text only | 3 | Confirmed identical displayed questions; read the changed text; carried pass-2 samples |
  | Identical draws | 26 | Confirmed identical; carried pass-2 samples |

This is still sampled agent review, not human editorial approval or a calibration of SAT difficulty.

### Pass 3 outcome

| | Count |
| --- | --- |
| Templates reviewed | 32 |
| Accepted | 32 |
| Rejected | 0 |
| Fresh blind solves | 9 |
| Fresh blind answers that agreed with the key | 9 |
| Blind misses | 0 |
| Pass-2 samples carried forward | 29 templates × 3; each still rebuilds to the answer I recorded |

**Tiers:** no tier changed in my domain. My judgements on the two Hard templates the coordinator asked about are below.

### Pass 3 method

1. **Fresh blind solves.** I chose seeds by comparing displayed questions only; n = 0–2 were distinct for all three templates.
   - I solved them through the brief's blind pipeline.
   - I locked the 9 answers (SHA-256 `f0f6c956…`) before opening any full view or the diff.
   - All 9 agree with the key.
2. **Draw comparison against `3f8e23a`.**
   - **Draws:** 603 per template (the pass-2 sample seeds, 300 integer seeds and 300 runtime-shaped seeds).
   - **Fields:** the displayed question, the key and the teaching text are counted separately; metadata is checked too.
   - **Text-only templates:** repeated on 6,003 draws each; no displayed question or key differs.
   - **Carried samples:** every carried-forward sample rebuilds to an identical displayed question and key.
3. **Changed templates.** I read the diff and 10–12 further full-view seeds of each shown-changed template, with explanations.
   - For the text-only templates, I printed old and new text side by side on 2–4 changed draws and checked them.
   - `check-families --family` passes for all six changed templates.
   - `test/sat-math-text.test.js` (3/3) and `test/sat-math-realism.test.js` (5/5) pass.
   - My text scan, with the same patterns as passes 1 and 2, finds nothing in 600 draws of all 32 templates.
4. **Fragment.** `reviews-pass3.json` holds all 32 records, built by script.
   - Versions and fingerprints come from the current registry, and difficulty from the source.
   - It passes my adapted checker. Against the current source, the pass-2 fragment now reports stale, as expected.

### Fixes confirmed (scans of 10,000 integer plus 10,000 runtime-shaped draws)

- **`linear-solution-parameter-condition`:**
  - Only two forms remain: "which values of a" (5,920 draws) and the new numeric "greatest/least integer a" form (4,080).
  - The "k times a / d more than a" form is gone.
  - Every draw has either u < 0 (the inequality in a must be reversed) or k < 0 (the equation is divided by a negative number when x is collected on the parenthesized side). No draw has neither.
- **`inequality-percent-of-total`:**
  - Only the least form (5,982) and the greatest form (4,018) remain.
  - There is no "which inequality" form.
  - There is still no "1 of whom" in any draw.
- **`inequality-two-variable-context`:**
  - No elevator stem says "is loading"; the worker "will ride in the elevator", so the worker's weight belongs in the model.
  - No bound is written as an improper fraction; 8,216 draws show "quotient ≈ decimal".
- **Text-only fixes:**
  - **`trig-ratio-from-ratio`:** "YZ = √((17k)² − (15k)²) = 8k" in both the explanation and the steps.
  - **Numeric traps:** the traps in `trig-ratio-from-ratio` and `trig-context-length` say "gives a wrong length" instead of naming offered choices.
  - **`inequality-system-from-context`:** names what it counts ("the number of tickets/crates is x + y"), not "items".

  All are correct on the draws I read.

### Judgements on the shown-changed templates

**`linear-solution-parameter-condition` (Hard, v3): accepted. Not Hard in every draw.**
- **Blind solves:**
  - `rv1016c-alg….0`: 3x − 3 = 6(x + 2a), least integer a with x < −9. Answer 3.
  - `….1`: answer A (a < 1).
  - `….2`: answer C (a < −2).

  All three agree with the key.
- **Further seeds:** 12 more (n = 3–14) checked by hand in both forms, including the integer keys 1, 7, −6 and 4. Each integer key is the nearest whole a strictly past the boundary. Explanations, the boundary step and rationales are correct.
- **Tier: Medium–Hard.**
  - **The 60% of draws with u < 0** need a genuine reversal. In the integer form they also need the strict boundary excluded. These are Medium–Hard to Hard.
  - **The 40% with u > 0** have their "trap" (k < 0) only on one solving path. A student who collects x on the side with the larger coefficient never divides by a negative. Example: 6(x + a) = 8x − 18 gives 2x = 6a + 18. That happens in every u > 0 draw where the sides are displayed swapped, for example seed 13, 4x + 14 = 2(x + 2a). Those draws are a two-step linear solve followed by a positive-coefficient inequality, which I judge official Medium. The integer form adds only the boundary step.
  - The template is therefore on the Medium–Hard border. Hard is within one band, so it is acceptable, but not every draw is Hard.
  - **Suggestion** if the author wants every draw Hard: require u < 0 in every draw, or make the u > 0 draws integer-form only.

**`inequality-percent-of-total` (Hard, v3): accepted.**
- **Blind solves:** `….0` C (9), `….1` 18, `….2` D (4). All agree with the key.
- **Further seeds:** 10 more checked by hand (n = 3–12) across all five scenes, both modes and all four relations. Keys, rounding direction, the boundary and every rationale are correct.
- **Tier:** every draw now sets the unknown in both the part and the whole, then rounds in the direction the condition requires. I judge it official Medium–Hard, unchanged from pass 1, so Hard is acceptable.

**`inequality-two-variable-context` (Easy, v7): accepted.**
- **Blind solves:** `….0` 55 (the worker rides; 38b ≤ 2,125), `….1` C, `….2` 9. All agree with the key.
- **Further seeds:** 10 more checked by hand. Combination totals and rationales are correct.
- **Tier:** unchanged from pass 1. The template is Easy; the bound form is Easy–Medium.
- **Nit, not blocking:** "≈" also prints when the quotient is an exact short decimal ("38 ÷ 4 ≈ 9.5", "460 ÷ 8 ≈ 57.5"). That happens in 2,567 of 20,000 draws. "=" would be exact there.

### Pass 3 per-template results

Columns:
- **Kind:** Shown, Text or Same, as in pass 2.
- **Draws differing:** of 603, against `3f8e23a`, counted as displayed / key / teaching text.
- **Samples:** for the three fresh templates, the fresh blind answers in seed order; otherwise the pass-2 samples, carried forward unchanged.

All 32 are accepted.

| Template | Kind | Tier | Ver | Draws differing (displayed / key / teaching) | Samples |
| --- | --- | --- | --- | --- | --- |
| inequality-two-variable-context | Shown | Easy | 7 | 153 / 0 / 275 | fresh `rv1016c-alg`: 55, C, 9 (3/3) |
| linear-solution-parameter-condition | Shown | Hard | 3 | 542 / 519 / 542 | fresh `rv1016c-alg`: 3, A, C (3/3) |
| inequality-percent-of-total | Shown | Hard | 3 | 603 / 530 / 603 | fresh `rv1016c-alg`: C, 18, D (3/3) |
| trig-context-length | Text | Medium | 6 | 0 / 0 / 603 | pass 2, carried |
| inequality-system-from-context | Text | Medium | 3 | 0 / 0 / 359 | pass 2, carried |
| trig-ratio-from-ratio | Text | Medium | 3 | 0 / 0 / 603 | pass 2, carried |
| linear-equation-solve | Same | Easy | 6 | 0 / 0 / 0 | pass 2, carried |
| linear-equation-context-meaning | Same | Easy | 6 | 0 / 0 / 0 | pass 2, carried |
| equation-solution-count | Same | Medium | 6 | 0 / 0 / 0 | pass 2, carried |
| linear-equation-word-model | Same | Easy | 5 | 0 / 0 / 0 | pass 2, carried |
| literal-equation-rearrange | Same | Medium | 6 | 0 / 0 / 0 | pass 2, carried |
| linear-expression-from-equation | Same | Medium | 5 | 0 / 0 / 0 | pass 2, carried |
| inequality-allowed-range | Same | Easy | 7 | 0 / 0 / 0 | pass 2, carried |
| linear-inequality-solve | Same | Easy | 7 | 0 / 0 / 0 | pass 2, carried |
| inequality-word-limit | Same | Easy | 6 | 0 / 0 / 0 | pass 2, carried |
| inequality-system-check | Same | Medium | 6 | 0 / 0 / 0 | pass 2, carried |
| inequality-integer-optimization | Same | Medium | 7 | 0 / 0 / 0 | pass 2, carried |
| inequality-region-corner | Same | Hard | 8 | 0 / 0 / 0 | pass 2, carried |
| right-triangle-ratio-read | Same | Easy | 6 | 0 / 0 / 0 | pass 2, carried |
| special-right-triangle | Same | Easy | 6 | 0 / 0 / 0 | pass 2, carried |
| pythagorean-two-step | Same | Medium | 7 | 0 / 0 / 0 | pass 2, carried |
| trig-similar-cofunction | Same | Hard | 6 | 0 / 0 / 0 | pass 2, carried |
| unit-circle-quadrant | Same | Medium | 6 | 0 / 0 / 0 | pass 2, carried |
| literal-equation-factor-target | Same | Medium | 6 | 0 / 0 / 0 | pass 2, carried |
| linear-equation-unknown-constants | Same | Hard | 6 | 0 / 0 / 0 | pass 2, carried |
| linear-equation-two-quantities | Same | Medium | 6 | 0 / 0 / 0 | pass 2, carried |
| inequality-graph-region | Same | Medium | 6 | 0 / 0 / 0 | pass 2, carried |
| inequality-parameter-range | Same | Medium | 7 | 0 / 0 / 0 | pass 2, carried |
| cofunction-complementary-angles | Same | Medium | 5 | 0 / 0 / 0 | pass 2, carried |
| two-observer-elevation | Same | Hard | 6 | 0 / 0 / 0 | pass 2, carried |
| inequality-solution-containment | Same | Hard | 4 | 0 / 0 / 0 | pass 2, carried |
| tiered-rate-regime | Same | Medium | 3 | 0 / 0 / 0 | pass 2, carried |

### Pass 3 uncertainty

- **Same limits as earlier passes:** the reviewer is the same model family as the author, coverage is sampled, and tier calls are editorial opinions.
- **Not rechecked:** I did not rerun `check-families --reps 3000` or the Desmos verifiers; the author reports that both pass.
- **Desmos route text:** the author notes that the routes for `linear-solution-parameter-condition` and `inequality-percent-of-total` still describe dropped forms. That is for the desmos lane, and it does not affect these templates' admission.

## Pass 4 (coordinator's one-line fix), 2026-10-16

**The change.** Commit `2434762` makes `inequality-two-variable-context` print "=" instead of "≈" when the two-place bound is exact. Its author is `coordinator-20261016`. The change re-versions all 12 templates in `linear-inequalities.js`. The reviewer is still `review-20261016-algebra-geometry`, who is not the author of this change.

**Identical draws.**
- I compared the 12 templates with `d309339` on 2,003 draws each (the pass-3 sample seeds, 1,000 integer seeds and 1,000 runtime-shaped seeds).
- No displayed question or key differs.
- The only differences are the explanation and steps of `inequality-two-variable-context`, in 268 draws. The other 11 templates are identical in every field, as is their metadata.

**The "=" / "≈" choice.**
- On 20,000 draws I recomputed every printed bound with integer arithmetic. A bound is exact when 100 · numerator is divisible by the denominator.
- **Signs:** all 16,432 printed bounds use the right sign, 5,134 "=" and 11,298 "≈", with no mismatches. For example, seed `rv1016c-alg.….2` now reads "x ≤ 38 ÷ 4 = 9.5".
- **Values:** every printed value is within 0.005 of the true quotient.
- **Ties:** three quotients fall exactly halfway, with 5 in the third decimal place. They print the lower neighbour ("791 ÷ 40 ≈ 19.77" for 19.775, "781 ÷ 40 ≈ 19.52" and "711 ÷ 40 ≈ 17.77"). This comes from the floating-point rounding in `round2`. Both neighbours are equally close and "≈" is correct, so this is not blocking.

**Outcome.** All 12 templates are accepted.
- The pass-3 blind samples carry forward unchanged, because the displayed questions are identical.
- `reviews-pass4.json` takes the current registry versions and fingerprints, and its tiers are unchanged.
- `author` is `coordinator-20261016` for `inequality-two-variable-context`. The other 11 records keep `templates-lane-20261016`, since their output is unchanged and the earlier review still covers their content.
- My adapted checker passes all 12 records.
