# Grade 8 packet content and teaching review — 2026-10-06

## Judgment and scope

The supplied-volume course has coherent instruction and substantive variety across its 36 lessons. Its 85 generator designs include calculations, explanations, modeling, representation changes, graph construction, and error identification. The 24 independently checked baseline answers were correct. It is a finite practice library: fresh numbers do not create fresh mathematical designs, and several baseline designs had predictable categorical outcomes or omitted cases explicitly taught in their own guides.

The three actionable findings below were subsequently repaired by a separate author. An additional 34 fresh samples passed independent solving and explanation review. The final generator hashes and exact repair-review seeds appear at the end; the remaining breadth suggestions are optional.

This was a fresh agent review of content and teaching, independent of the original author and without reading prior review conclusions. The initial inspected revision was `4bafffb0640ae522f4ca4b2cfc6f2c58ae72ac60`. Read-only snapshots of the original course, engine, math helper, and four generator files preserved that baseline while another lane worked on packet presentation. No SAT/ACT bank, generated browser bundle, textbook scan, or prior review was read. This review covers the supplied four-topic volume; it does not ask for all Grade 8 standards or a later volume.

The review read every lesson objective, explanation, pitfall, and practice-advice entry, plus all 72 worked examples. It inspected student fields for three independently generated samples of every design, then student prompts and supplied tables/graph coordinates from nights 1, 5, and 10 of four unit packets. Before opening their keys or generator implementations, the reviewer solved 24 selected displayed samples. All 24 agreed with the keys, including the explained reasoning. This is agent sampling, not human editorial approval, classroom usability evidence, or a proof over every seed.

The combined nightly document UI, rendered PDF layout, and removal of solution data from downloadable student files belong to separate review lanes. Here, a student sample means `prompt`, `table`, and `graph`; answer, steps, check data, answer graph, and metadata were withheld. That separation made this a content review but does **not** itself verify a production HTML/PDF sanitizer.

## Reproduction and sample coverage

At the baseline revision, load `content/courses/grade-8-math.json` and `src/lib/courses/engine.js` directly in Node. Obtain the 85 templates with `templatesForCourse(course.id)`.

For the design samples, call `generateWorksheet(course, [template], { lessonIds: [template.lessonId], count: 1, seed })` using each of `packet-cold-teaching-A`, `packet-cold-teaching-B`, and `packet-cold-teaching-C`. Each exact question ID is `<templateId>:<seed>/0/<templateId>/0`; none of these singleton first draws needed a retry. This supplies 255 student samples.

For each unit `topic-1` through `topic-4`, call `generatePacket(course, templates, { lessonIds: unit.lessons.map(l => l.id), count: 20, days: 10, seed: 'packet-cold-teaching-' + unit.id })`. Night seeds append `/night-N`. The report references question numbers starting at 1; the generated draw-seed slot is one less.

| Unit | Lessons | Designs | Generated items | Uses per design across 10 nights | Distinct designs per 20-question night |
| --- | ---: | ---: | ---: | ---: | ---: |
| Real Numbers | 11 | 35 | 200 | 4–9 | 20 |
| Linear Equations | 11 | 22 | 200 | 9–10 | 20 |
| Functions | 7 | 14 | 200 | 14–15 | 14 |
| Bivariate Data | 7 | 14 | 200 | 14–15 | 14 |

All four packets contained 200 distinct practice identities and 200 distinct visible identities, and each covered all of its selected lessons and designs. No packet exhausted a design. Identity checks establish distinct generated items, not distinct solution strategies. Topics 3 and 4 necessarily repeat six designs within each 20-question night. Some of those repeated designs change the decision students make; others only substitute quantities. These limits should remain explicit when describing a ten-night supply of practice.

## Baseline actionable findings

No critical mathematical error was found in the bounded independent check. The following are moderate teaching/diversity defects for repeated independent practice, not incorrect arithmetic keys.

### T1. Break fixed answer-label and category-composition patterns

- In `src/lib/courses/grade8-topic2.js`, `g8-t2-printing-plans` (baseline line 138) always gives Plan B the lower per-pack price and asks which plan is cheaper one pack above the crossing. The answer to that portion is always B. The topic-2 packet uses it nine times; night 1 question 6 uses `7p = 42 + 4p`, while night 10 question 2 uses `4p = 7 + 3p`. Both choose B after the crossing. Swap the roles and vary the requested order relative to the crossing, keeping counts physically meaningful.
- In `src/lib/courses/grade8-topic3.js`, `g8-t3-square-display-model` (line 121) always makes A linear and B quadratic. Across its 14 packet uses, the larger tile count genuinely changes, but the linear/nonlinear classification can be recalled from labels. Night 1 question 11 has A = `8n + 11`, B = `n^2 + 2`; night 10 question 13 has A = `6n`, B = `n^2 + 11`. Vary which design label receives which construction.
- In `src/lib/courses/grade8-topic1.js`, `g8-t1-square-cube-categories` (line 225) always supplies exactly one square-only number, one cube-only number, one both, and one neither, then shuffles them. All six packet uses have that composition. Night 1 question 17 gives `98, 36, 1, 27`; night 10 question 2 gives `121, 729, 146, 343`. Once the pattern is learned, the final classification can be obtained by elimination. Allow repeated categories and omitted categories while keeping the individual numbers unambiguous.

These are structural answer cues across repeated exposure. They are different from a formula or diagram legitimately supplied as a mathematical given.

### T2. Align relative-frequency practice with its stated denominator lesson

`g8-t4-relative-frequency-denominators` in `src/lib/courses/grade8-topic4.js` (line 201) always has a grand total of 100, always asks the morning/outdoor joint percentage, and always follows it with the outdoor percentage within the morning row. The topic-4 packet contains 15 examples. In night 1 question 3, the joint count is 58, so part (a) is simply 58%; night 10 question 19 similarly turns the count 8 into 8%.

A total of 100 is a useful introductory case, but it never tests selecting and using a general grand-total denominator. Moreover, neither design assigned to lesson 4-7 asks a column-conditioned/reversed question. Its guide explicitly explains column conditional frequency and works “among helmet wearers, what fraction commute by bicycle?” The practice therefore misses a distinction that its own instruction identifies as important.

Vary totals and the requested row/column/cell. Include matched reversed conditions so students must identify the named group rather than memorize the location of a denominator. Preserve exact percentages or state a rounding rule.

### T3. Exercise the square-equation cases already taught

Lesson 1-5 explains two, one, and no real solutions, and its first worked example requires isolating the squared term in `3x^2 − 6 = 84`. However, `g8-t1-square-equation` (`src/lib/courses/grade8-topic1.js`, line 252) only generates `x^2 = n` for positive n. The other two designs for this lesson are a cube equation and cube-face dimensions; neither fills this gap. All six square-equation occurrences in the topic-1 packet consequently have two real solutions, from `x^2 = 361` at night 2 question 4 to `x^2 = 625` at night 10 question 9.

Add zero and negative right-hand-side cases and modest equations requiring isolation before a square root. This is alignment with existing teaching, not a request for new units or advanced algebra. Keep the unrestricted real-number equation cases separate from the positive-length restrictions of geometric problems.

## Guide-to-practice baseline review

The table records all 36 lesson checks. “Aligned” means the existing designs exercise the main stated objective; it does not imply that every sentence or possible problem form has its own generator.

| Lesson | Main teaching and practice judgment |
| --- | --- |
| 1-1 | Aligned: both conversion directions, terminating/repeating decimals, aligned-tail subtraction, reduced fractions. |
| 1-2 | Aligned: nested sets, rational/irrational justifications, explicitly described infinite patterns. Natural-number convention is stated. |
| 1-3 | Aligned: integer root bounds, mixed-form ordering/plotting, negative comparisons. |
| 1-4 | Aligned for integer roots and geometry; classification composition needs T1. Fractional-root practice would be optional breadth. |
| 1-5 | Partial: positive square, signed cube, and positive-length cases; T3 covers missing taught square-equation cases. |
| 1-6 | Aligned: products, quotients, powers of powers, equal powers of different bases; nonzero conditions are explicit. |
| 1-7 | Aligned: reciprocals, reciprocal of a negative power, zero exponents, signed substitution. |
| 1-8 | Aligned: large/small one-significant-digit estimates and estimated ratios, including rounding across a power of ten. |
| 1-9 | Aligned: large/small scientific notation and ordinary notation, with internal zeros preserved. |
| 1-10 | Aligned: all four scientific-notation operations with normalization and exact arithmetic. |
| 1-11 | Aligned: multi-step totals/ratios and root-area-perimeter modeling with units. Scenarios remain a limited pair of designs. |
| 2-1 | Aligned: combine like terms directly and through perimeter modeling. |
| 2-2 | Aligned: variables on both sides and equal-savings modeling. |
| 2-3 | Aligned: distribution on both sides and subtraction of a grouped expression. |
| 2-4 | Aligned: fractions and decimal coefficients; fraction clearing is assigned here, where it is taught. |
| 2-5 | Aligned: one/none/infinitely many, plus constructing a parameter for a requested solution type. |
| 2-6 | Aligned cost/equivalence modeling; printing-plan labels need T1. The shelf model explicitly counts items and labels together as pieces. |
| 2-7 | Aligned: table/equation and graph/verbal proportional-rate comparisons; either competitor can win. |
| 2-8 | Aligned: signed rise/run and scaled triangles, with positive and negative slopes. |
| 2-9 | Aligned: graph a proportional equation and reconstruct it from a given point. |
| 2-10 | Aligned: contextual intercepts and extrapolating a linear table backward to input zero. |
| 2-11 | Aligned core: graph from an equation and write an equation from a graph. Reverse predictions occur elsewhere; extra cases here are optional. |
| 3-1 | Aligned: table and discrete-point function tests, including repeated outputs and conflicting inputs. |
| 3-2 | Aligned: equation/table/graph conversions and predictions from a linear graph. |
| 3-3 | Aligned: linear/nonlinear table reasoning and separate comparison of rates and initial outputs. Tables specify the shown-input limitation. |
| 3-4 | Aligned core model construction from initial/rate or two values. Domain explanations are present, though practice need not always ask for them explicitly. |
| 3-5 | Aligned model comparisons; fixed classification labels need T1. The cost comparison has an additional scaffold described below. |
| 3-6 | Aligned: rising/falling/constant intervals in shuffled order and positive rate comparisons. Negative outputs are included. |
| 3-7 | Aligned: cumulative stage times and quantitative sketches for motion and filling. |
| 4-1 | Aligned: positive, negative, curved, absent association, clusters, and unusual points; no-causation and investigate-outlier cautions are sound. |
| 4-2 | Aligned: constructing scatter plots and locating a misplotted point. Choosing axes/scales independently would be optional breadth. |
| 4-3 | Aligned: comparing total absolute vertical errors and finding a proposed model equation. The stated criterion is explained, not presented as the uniquely best fitting method. |
| 4-4 | Aligned: forward/reverse prediction and interpolation/extrapolation. Both classifications occur in source. |
| 4-5 | Aligned modeling limits, with substantial prompting; see scaffold distinction below. |
| 4-6 | Aligned: joint/marginal table reading and completing missing counts. |
| 4-7 | Partial: joint and row conditional frequencies present; T2 addresses general totals and missing column/reversed conditions. |

## Scaffolding, clarity, and optional breadth

The guide explanations distinguish a principal square root from solving a squared equation, negative coefficients from negative exponents, exact notation from approximation, input intervals from output signs, and model prediction from causal inference. Worked examples show operations and checks instead of merely naming a rule. Those are useful instructional features.

Some prompts deliberately guide a decision. `g8-t4-model-realistic-range` asks students to explain why the later result cannot describe a real box count; it tells them the conclusion to explain. The volunteer-model prompt similarly requests caution for a far-out prediction. These are valid guided exercises, but should not be described as wholly uncued assessments of whether a model is sensible. If an independent judgment is desired, ask students to decide whether each prediction is meaningful and justify it, with both valid and invalid cases.

The following would improve breadth but are not required to repair the inspected content:

- `g8-t3-rental-comparison-model` always centers its three requested hours on the exact break-even hour. The labels already swap and students still calculate costs, but all 15 packet uses put the tie in the middle row. Varying the sampled hours would make independent comparison less predictable.
- The no-association scatter examples use intentionally regular grids; line-model comparisons always compare parallel candidates; table linearity checks use equal input steps and increasing functions. These are clear introductory examples. Less regular clouds, different-slope candidates, unequal input intervals, and decreasing/constant cases would test transfer.
- Lesson 3-7 motion wording could specify a straight path directly away from and back toward home to make the intended distance-time model explicit.
- The baseline `compare-fit-lines` key had the awkward wording “Subtract each prediction from y = … from its observed y-value.” The repair also clarified this sentence; three fresh examples of the revised wording passed the follow-up below. This was a wording cleanup, not a wrong residual calculation.

An intercept shown on a graph is legitimate data for an intercept-reading task. Likewise, the requested entries already appearing in a complete two-way table are legitimate data for a table-reading task. Neither is a solution leak. Showing `graph` data that the task asks students to interpret is different from revealing a graph that they were asked to construct. All 21 design samples from the seven graph-construction designs had blank student graphs; supplied points appeared in interpretation tasks.

## Independent solutions recorded before key access

All rows below use singleton seed `packet-cold-teaching-A` and the template suffix shown. Full IDs prepend `g8-t<topic>-`.

| Topic | Design suffix | Independently obtained result |
| --- | --- | --- |
| 1 | repeat-block-fraction | `6.[29] = 623/99` |
| 1 | repeat-after-prefix | `1.8[5] = 167/90` |
| 1 | square-cube-categories | 343 cube only; 729 both; 159 neither; 121 square only |
| 1 | product-of-powers | `a^(-13)` |
| 1 | scientific-quotient | `9.4 × 10^(-12)` |
| 1 | model-square-covering | 480 cm strip; `3.6 × 10^3 cm^2` combined area |
| 2 | fraction-both-sides | `x = −11/2` |
| 2 | make-solution-type | any k except 24 |
| 2 | compare-table-equation | B faster by `73/7` cards/minute |
| 2 | slope-points | slope −3 |
| 2 | intercept-table | `(0, −2)`; not proportional |
| 2 | equation-from-graph | `y = (−3/2)x` |
| 3 | relation-table | function; repeated output is allowed |
| 3 | vertical-line-points | not a function: input 0 has outputs −2 and 1 |
| 3 | rule-table-graph | output row 6, 5, 4, 3, 2 |
| 3 | square-display-model | `A = 2n + 6`, `B = n^2 + 3`; 30 versus 147 at n = 12 |
| 3 | rental-comparison-model | costs `(52,51)`, `(58,58)`, `(64,65)` |
| 3 | increasing-decreasing-graph | increase 0–4; decrease 4–8; constant 8–12 |
| 4 | scatter-association | no association; same y-distribution at every x |
| 4 | compare-fit-lines | A error total 9; B error total 57 |
| 4 | write-fit-line | `y = −4x + 29` |
| 4 | inverse-prediction | x = 15; extrapolation |
| 4 | relative-frequency-denominators | 6% joint; 10% within morning |
| 4 | complete-two-way-table | missing entries 16, 15, 36, 67 |

## Source binding and limits

Baseline SHA-256 hashes:

| Source | SHA-256 |
| --- | --- |
| `content/courses/grade-8-math.json` | `3c61ae58c92195a664d50592853ff8f5dda5bb60dd6cec3ea97fe53013cc280d` |
| `src/lib/courses/engine.js` | `bcb72e4b6ca98677193e4e6ef104de41f4d821b5d6ba3f709b4a8d30de2dc092` |
| `src/lib/courses/math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |
| `src/lib/courses/grade8-topic1.js` | `fd6c7c8c79ad96890ba75bc1a84cbfe4633c16a8064acd2af4680c1912b9c317` |
| `src/lib/courses/grade8-topic2.js` | `84e3fa0313eec7c6376ce1a126ca88472a5b3e4466227339b63d5fd74331032f` |
| `src/lib/courses/grade8-topic3.js` | `a9f8e90452a82cbe3fb72111c213b5a31f9d8ae1c6b286a085fe08dcbb9fbab2` |
| `src/lib/courses/grade8-topic4.js` | `c2d66d22bc4107898fc40ba297423a9c9d3534c83f2681ab1bbaeb6b3a2511e2` |

The reviewer generated samples and inspected their data but did not run a production build, repository-wide gate, browser session, or PDF review. No claim about visual legibility, page breaks, workload duration, student difficulty, or full official-standard coverage follows from this report. Generated variants and guide prose remain original material aligned to the supplied contents; source alignment was taken from the repository's declared scope rather than independently certified against a publisher's complete book.

## Repair follow-up

T1–T3 are resolved in the generator sources bound below. A separate author supplied 34 fresh, branch-selected student samples. The reviewer read only their prompts, tables, and given graphs, recorded independent solutions for all 34, and only then opened the keys, explanations, and modified source diff. All 34 matched, including all table cells, exact fractional percentages, and solution-set classifications. No further material correctness or clarity defect was found in that check.

The source changes now:

- vary square/cube category composition, including omitted categories, repeated categories, zero, and all-four-in-one-category cases;
- vary positive, zero, and negative square-equation targets, both directly and after isolating the squared term;
- swap printing-plan roles and ask for a comparison below or above the crossing;
- swap linear/nonlinear tile-model labels and ask either about total tiles or the extra tiles for an increase in size;
- vary the grand total, queried cell, and row/column condition in relative-frequency problems;
- state the residual subtraction more clearly in the line-model explanation.

These repairs add meaningful decisions within existing designs and align practice with the guides. They do not increase the design count beyond 85 or remove the repetition limits documented above. The existing guides remain unchanged. The rental table's middle-row crossing and the other explicitly optional breadth suggestions remain optional; they are not unresolved correctness findings.

To reproduce the repair samples, load the final template through `engine.templatesForCourse('grade-8-math')`, select its `templateId`, and call `template.generate(math.random(seed))`. Each seed is `variety-blind-final/<templateId>/<suffix>` using a suffix in the table. These were deliberately selected to cover branches, not a claim about random-branch frequencies. The reviewer independently replayed all 34 against the final source and confirmed that both the displayed fields and later keys matched the supplied samples.

| Template ID | Exact seed suffixes, in sample order | Independently solved evidence |
| --- | --- | --- |
| `g8-t1-square-cube-categories` | `0/41`, `1/0`, `2/0`, `3/440`, `4/432` | Sample 1: 49 square only, 106 neither, 0 both, 8 cube only. Samples 2–3 omit categories and repeat others. Sample 4: 729, 64, 1, 0 all both. Sample 5: 71, 105, 102, 70 all neither. |
| `g8-t1-square-equation` | `0/25`, `1/5`, `2/4`, `3/0`, `4/20`, `5/25`, `6/35`, `7/1` | Direct results: ±16, ±√395, 0, no real solution. After isolation: ±19, ±√545, 0, no real solution. In particular, `4x^2 − 11 = −15` gives `x^2 = −1`. |
| `g8-t2-printing-plans` | `0/1`, `1/0`, `2/2`, `3/3` | Crossings 5, 12, 9, 13 packs. At the requested 6, 13, 8, 12 packs, cheaper plans are A, B, A, B, respectively. |
| `g8-t3-square-display-model` | `0/11`, `1/1`, `2/119`, `3/0`, `4/1`, `5/132` | Total comparisons: A 112 vs B 39; A 67 vs B 121; 12 each. Growth comparisons: A 23 vs B 6; A 3 vs B 5; 5 each. Every displayed table was also completed and checked. |
| `g8-t4-relative-frequency-denominators` | `0/20`, `1/17`, `2/2`, `3/8`, `4/11`, `5/5`, `6/12`, `7/15` | All four interior cells, with both row and column conditions. Percentage pairs: (24, 60), (70/3, 1050/29), (55/2, 110/3), (310/7, 1550/19), (65/3, 130/3), (40/9, 400/47), (100/7, 25), (100/11, 250/11). Every listed number is a percentage, not a proportion. |
| `g8-t4-compare-fit-lines` | `0/0`, `1/0`, `2/0` | Absolute-error totals (A, B): (25, 3), (57, 7), (8, 36). Revised explanation correctly subtracts predicted from observed y. |

The reviewer verified the final source hashes locally; no additional production build or broad gate was run by this review lane. The repair author separately reported targeted tests, a deep generation check, and packet-capacity checks; integration owns verification of those reports and the repository-wide gate.

| Final reviewed generator source | SHA-256 |
| --- | --- |
| `src/lib/courses/grade8-topic1.js` | `918162ffd3e76b23cc04e93f7a5db09cd4da1caaec3bff7c25da8cecbf67259c` |
| `src/lib/courses/grade8-topic2.js` | `739bc8e765f3c329ad80b7476b0272cd1398072d4364838087f8ae6af627d43c` |
| `src/lib/courses/grade8-topic3.js` | `289f4a960eb99e4ece515f8291c46a28f05e2e7ee40c9325894d8efd6def45a2` |
| `src/lib/courses/grade8-topic4.js` | `ffe59902720f53acef07da9faff418048cc554bf4db90584b289d7d77592c42d` |

The final course JSON and math helper retained their baseline hashes. The engine changed for the separate packet work; direct repair samples use its unchanged template registration plus `math.random`, not a claim that this lane reviewed the new packet-document behavior.
