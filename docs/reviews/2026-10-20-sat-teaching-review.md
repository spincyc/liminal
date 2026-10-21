# Independent review of SAT transfer teaching and figures

Reviewer: `/root/review_new_teaching`, independent of `/root/foundation_transfer`, `/root/learn_figures`, and the coordinator. Date: 2026-10-20. Production was read-only; all reviewer-created artifacts are under `.scratch/review-new-teaching/`. No build, source edit, commit, push, or delegation.

## Disposition

No wrong keys, unsupported numerical solutions, figure/data mismatches, new answer leakage, or blocking content defects found in the new teaching. The one small pre-existing generalization identified during review was corrected by the coordinator and rechecked (below). The review is sampled independent agent review, not human editorial approval, measured difficulty, SAT score calibration, or evidence that a student learned the material.

## Review order and coverage

1. Read the key-free 13-problem foundation packet and recorded every independent answer with reasoning in `independent-answers.md` before opening the revised foundation sources or `verify_arithmetic.py`.
2. Compared all 13 with the author keys: all agree. Read all four full revised foundation pages and their diffs, including the five new worked examples, solutions, neighboring method contrasts, prerequisites, and harder sections.
3. Received `.scratch/learn-figures/cold-packet.json` and `.html`. Read only question/figure/caption/alt data; independently rendered the key-free SVGs with Chromium, inspected all nine drawings, and recorded eight unique visual answers before opening revised graph sources or `content/learn/figures.json`. Four are worked-example prompts and four are Try its; the model pair reused on two pages is counted once. The library/club questions existed previously as table data and are now genuinely plotted.
4. Compared final sources, keys and registry with those independent solves: all agree. Audited the coordinator's placement and explanation of the generic triangle-height diagram in area-and-volume.

## Teaching assessment

| Source | Mathematical/instructional finding |
| --- | --- |
| linear-functions.md:254 | The new selection table separates a slope, starting value, later output and input for a requested output, with units. The tank example correctly normalizes unequal input gaps: slope −3, V(0)=40, V(7)=19. The three unhinted tasks change context or asked quantity and explain concrete competing mistakes. |
| nonlinear-functions.md:199 | The new quadratic contrast correctly distinguishes zeros (inputs), extreme value (output), and maximizing/minimizing input. Independent recomputation of the worked example gives zeros 1 and 7, axis 4 and maximum 18. The practice changes from factored maximum to vertex minimum and described intercepts. |
| nonlinear-functions.md:336 | The fixed versus current base contrast is substantive: accounts A/B reach 1300; C reaches 1331. Unequal exponential spacing is handled through b^d; the task's b=2 checks across gaps 2 and 3. The machine task explicitly fixes the loss against purchase price, so $100 is correct and $128 is the competing compound model. |
| one-variable-data.md:214 | The example correctly contrasts participant weights (24) with equal group weights (22). Tasks require frequency weighting, recovering an added group's mean, and solving for a group size, rather than only substituting into the worked example. Disjointness is stated where needed. |
| percentages.md:137 | The reference-amount explanation correctly builds the equation before choosing multiplication/division. Independent recomputation gives original printer price 90 and reverse comparison 25%. The tasks require inverse percent, reverse comparison and updating both part and whole. |
| reading-graphs.md:13,105,218 | Students actually see unequal-scale line plots, endpoint graphs, and observed dots plus a dashed model. The worked explanations connect reading coordinates to the calculation and explain the competing quantity/sign. Captions describe objects or reading process without giving a derived slope, domain, residual or threshold count. |
| two-variable-data.md:212,241 | The new model reading section and actual time-series displays support the stated operations. Threshold language correctly distinguishes strictly above from at least; residual sign and units are correct. |
| area-and-volume.md:68 | Generic diagram appears before the sign example, and its immediately following prose identifies the base, perpendicular height and sloping boundary. It is appropriately marked not to scale and carries no numerical answer. |

The new 13 foundation tasks have no First step or Hint before the answers. Their skill-page context supplies some method cue, so they establish opportunities for independent application within a lesson, not fully unlabeled transfer. The coordinator's separate mixed checks are the relevant evidence for method choice across domains. Existing anchors on all four foundation pages were preserved; all additions precede Harder versions.

## Finding resolved

**Resolved:** `content/learn/sat-math/problem-solving-and-data-analysis/two-variable-data.md:243–249` now conditions steepest rising/falling comparisons on equal time intervals, distinguishes greatest increase from greatest decrease, and explicitly separates endpoint differences (change) from differences divided by elapsed time (rate) for unequal intervals. This directly closes the reported issue without changing any problem or key. The reviewer made no production edits.

The coordinator also added only an introductory prose paragraph to `sat/general/math-transfer.md:16–23` explaining the continuing on-screen checks. Read the exact diff and checked the named UI heading/button against `src/practice.html:165–173`, the 6 Geometry / 2 each other domain Easy/Medium selection against `src/lib/practice.js:294–336`, and end feedback against `src/app/app.js:727–747`. The prose accurately describes the current full-pool learning check and explicitly distinguishes its focused mix from official SAT domain weights. No new exercise or answer required another blind solve. This review of math-transfer covers this added prose, not a new independent solve of its previously reviewed authored sets.

## Figure correctness and accessibility

Independent numerical audit `check-drawing-data.py` passes for all nine registry entries. It compares every dot with independently read source data and the viewBox/plot coordinate mapping; verifies both model-line endpoints and dashed styling; verifies open/filled endpoint states and actual zero-axis positions; checks equal drawn tick lengths on unequal-unit scale examples; and checks horizontal base, vertical height and right-angle marker for the triangle. Visual inspection confirms actual plots rather than prose or tables standing in for plots.

Each accessible alt gives the axes, units/scales and all observations/endpoints needed to solve without sight. The alts do not include the requested derived slope, domain/range inequalities, residual or threshold counts. The model try's alt gives the line's endpoint at input 10, but reading a displayed endpoint is the underlying datum, not a derived residual; sighted users see the same line endpoint. Source content appears original and self-contained; no external question or drawing is referenced or copied.

The original key-free screenshots used 13px source labels. Author later changed label size to 20px and grid stroke from #ddd to #ccc; numerical geometry/data were audited again against the final registry (the scale-try drawing was resized but its data and equal-tick geometry remain correct). The coordinator is responsible for final Learn responsive/print/browser integration; these scratch screenshots are content/figure inspection rather than production UI validation.

## Verification and limits

- `node tools/check-learn.js | tail -5`: passed, 29 skill pages / 9 general pages / 381 template routes / 31 sourced facts.
- `python3 .scratch/review-new-teaching/check-drawing-data.py`: all nine final drawings agree with independently read values and applicable endpoint/model geometry.
- Four-file prior-anchor comparison against HEAD: preserved. Added diff contains 5 worked examples and 13 Try its; counts describe coverage only.
- `git diff --check`: passed for the working tree at review time.
- Headless Chromium used only on key-free scratch HTML. No production build or full repository gate was run by this reviewer. No empirical student-learning or official-question equivalence claim is supported by this review.

## Reviewed source SHA-256

- `content/learn/sat-math/algebra/linear-functions.md`: `5d9c0ef95c4579870a2c15fedb7c79fb707a665f395712fd289063821506d138`
- `content/learn/sat-math/advanced-math/nonlinear-functions.md`: `798cbc80dd905fe73f0821227e5da36ca97801aa23fd43c826ab7a25f07fd9b0`
- `content/learn/sat-math/problem-solving-and-data-analysis/one-variable-data.md`: `6675d36ef8faa334ca6c691488c26f23fb11f048534397eb74e6faba362a0594`
- `content/learn/sat-math/problem-solving-and-data-analysis/percentages.md`: `cd145027f15366455b9cce7843de7f1d3110652877f7f4b4af49b188047255ce`
- `content/learn/sat/general/reading-graphs.md`: `74711537667224789cdd3b393bf2c9d16c116d390e551a96c7ed3d0747ed45ba`
- `content/learn/sat-math/problem-solving-and-data-analysis/two-variable-data.md`: `d6af7f3d75e177c7c59d7d303dada12785b9a7aa79d928572d0674e56536a645`
- `content/learn/sat-math/geometry-and-trigonometry/area-and-volume.md`: `c9a8a3a9093efe256135487fe1e27065775f87adc1c0a494ac3bbec91c118bcf`
- `content/learn/figures.json`: `eb39dc43d2b68d604e0dadb460a4495cacc7f0ea0546a423a86402782f088c8a`
- `content/learn/sat/general/math-transfer.md`: `72a836445c18ce7f96b78a6bedcf29868dd49a75999e5b95a9c5008d75ae4035`

# Independent cold solves

Recorded before opening revised Learn sources or any key script. Problems read only from `.scratch/foundation-transfer/blind-problems.json`.

| ID | Independent answer | Reasoning |
| --- | --- | --- |
| linear-1 | $9 starting fee; $6/hour; $33 for 4 hours | C(0)=9; each additional hour adds 6; 9+6(4)=33. |
| linear-2 | x=3 | Change 18→12 over −2→1 gives slope −6/3=−2, consistent with the next interval. f(x)=−2x+14, so 8=−2x+14 gives x=3. |
| linear-3 | f(0)=8 | Rate 12/4=3 per input unit. Moving from x=3 to x=0 subtracts 9 from output 17. |
| quadratic-1 | Minimum −9 at x=−2; zeros −5 and 1 | Nonnegative square is smallest at x+2=0. For zero output, (x+2)^2=9, giving x+2=±3. |
| quadratic-2 | Maximum 16 at x=3; output zero at x=−1 and 7 | Downward opening makes vertex output the maximum. The stated x-intercepts are the zero inputs. |
| growth-1 | b=2; f(3)=64 | a=f(0)=8. 32/8=b^2=4 and b>0, so b=2; the last row checks 8·2^5=256. Thus f(3)=8·8. |
| growth-2 | $100 | Annual loss is 0.20·250=$50 fixed against purchase price. After three years subtract $150. |
| data-1 | 3.5 | Weighted total 2·6+5·3+8·1=35; total observations 10; mean 35/10. |
| data-2 | 23 | Initial total 8·14=112; new total 12·17=204; four added measurements total 92, mean 92/4. |
| data-3 | 18 senior members | 12·15+25n=21(12+n); 4n=72. |
| percent-1 | 120 liters | 84 is 70% of the original, so original=84/0.70. |
| percent-2 | 80% | A=1.25B, so B/A=1/1.25=0.8. |
| percent-3 | 30% | Club becomes 80+10=90; population becomes 250+50=300; 90/300=0.30. |

## Independent visual solves

Solved from `cold-packet.json` descriptive text and independently rendered key-free SVGs (`packet-a.png`, `packet-b.png`) before opening revised graph sources or production figures.json. Caption information is included in the shown material.

| ID | Independent answer | Reasoning |
| --- | --- | --- |
| scale-rate-example | 15 liters/hour | Read (2,90) and (6,150); rise 60 liters over 4 hours. Square counting alone would give 2/2=1 in paper intervals. |
| scale-rate-try | 12 meters/minute | Read (10,120) and (25,300); output 300 halfway between 280 and 320; 180/15=12. |
| endpoint-example | Domain −2 < x ≤ 4; range −1 ≤ y < 5 | Left/top endpoint is open; right/bottom is filled; entire descending segment has no gaps. |
| endpoint-try | Domain −1 ≤ x < 5; range −2 < y ≤ 4 | Left/top endpoint is filled; right/bottom is open. The smaller y is excluded here despite appearing at the right of the graph. |
| model-read-example | Predicted 40 minutes; observed 50; residual +10 minutes | Dashed line joins (0,10) and (10,60), slope 5 and intercept 10. At input 6 it predicts 40; filled dot is at 50; observed minus predicted = +10, model too low. |
| model-read-try | Predicted 100 parts; observed 90; residual −10 parts; model too high | At input 10 the line is on 100 and dot halfway between 80 and 100; 90−100=−10. |
| visitors-line | 2022→2023; three years | Successive changes 3,−6,−9,8,9 thousand. Values strictly above 40 are 42,45,47 in 2018,2019,2023. |
| members-line | May→June; three months | Changes −4,8,2,−8,10. At least 28 includes March=28, April=30, June=32. |

Triangle teaching diagram: CH is vertical to horizontal AB, right-angle marker is at H; b labels base, h labels CH, s labels sloped AC. The not-to-scale note permits its asymmetric drawing and it teaches the intended side/height distinction. No exercise answer is present in its caption or alt.


All independent answers above agree with authored final keys.

Final follow-up: re-ran `node tools/check-learn.js | tail -5` (pass: 29 skill pages, 9 general pages, 381 routes, 31 sourced facts) and `git diff --check` (pass). Final snapshot contains the eight original reviewed files plus the general guide with its added-prose-only scope described above. All nine hashes reconciled immediately before follow-up handoff.
