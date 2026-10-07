# Common Core mathematics K–3 independent review

Completed 2026-10-07 against the canonical hashes below. All reported findings are resolved. This is independent agent sampling, not human approval, classroom validation, or comprehensive proof. The reviewer changed no subject files and ran no builds or commits.

## Actual scope

| Grade | Weeks and teaching plans | Worked models | Worksheet prompts inspected | Cold worksheet selections |
| --- | ---: | ---: | ---: | ---: |
| 3 | 36 | 72 | 648 | 108 |
| 2 | 36 | 72 | 648 | 108 |
| 1 | 36 | 72 | 648 | 108 |
| K | 36 | 72 | 648 | 108 |
| Total | 144 | 288 | 2,592 | 432 |

Read every title, objective, explanatory paragraph, daily plan, connection, model, and worksheet prompt for teaching sequence, self-contained givens, appropriate scope, and semantic repetition. Compared all courses with their source-linked skeletons in `content/curriculum/common-core-math.json`, including precise six-week unit pacing and allowed standard references. Inspected every worked model's answer and steps. Solved selected worksheet items before keys and compared the resulting answers and reasoning; open responses record an admissible example and criteria.

The compact selection rule is A=0, B=1, C=2 with zero-based item index `(week + 2 * sheetIndex - 1) % 6`. It selects one item per worksheet per week and cycles through all six item positions. Replacements were rereviewed against final prompts, with new cold solutions where appropriate.

Two exposure exceptions are explicit. Initial schema inspection exposed this reviewer's week-1 keys for Grades 2, 1, and K. The coordinator independently cold-solved those nine A1/B3/C5 items in `.scratch/weekly/root-cold-outcomes.json`, rows `cc2`, `cc1`, and `cck`. An unsolicited author repair summary exposed Grade 3 W35 B1/C3 outcomes; the coordinator independently cold-solved those two in `.scratch/weekly/root-cc3-repair-outcomes.json`. All eleven supplemental prompts exactly match final canonical prompts and all outcomes agree. Thus 421 selections have this reviewer's cold outcomes and eleven have the coordinator's independent nonauthor cold outcomes. The six initially exposed week-1 models were inspected but are not claimed blind.

## Findings and confirmed repairs

### Grade 3

- Specified a quarter-turn for W2 B5 array rotation and equal sharing in W3 A3/C6 and W6 B2.
- Confirmed W11 A5's correct exchange of 632 into five hundreds, twelve tens, twelve ones before subtracting 278; the answer remains 354.
- Replaced repeated geometry tasks: W17 C1 now compares equal-perimeter designs against a minimum-area constraint, distinct from W34's fixed-area model. W18 B5 sorts attribute cards into rhombi and non-rhombi.
- Replaced repeated fraction tasks: W19 C5 diagnoses a column wrongly called one half; W23 C1 tests stripe counts permitting an exact half; W23 C2 chooses a partition that can name a quarter. Later W35/W36 tasks include thresholds, unit-selection errors, quantified unequal wholes, and complete number-line label audits.
- Clarified “after 0” in W21 A3 and W30 model 1, retained inch units in W30, and confirmed sequential timing in W26 C3/C5.
- Replaced staging connection blanks with concrete links between concepts. All 108 sampled outcomes and 72 models agree with independent reasoning; no outstanding finding remains.

### Grade 2

- Replaced repeated array-error tasks: W27 B3 splits a 2×4 grid and checks recombination; W36 B1 distinguishes column and row equations for the same array.
- W32 B4 asks how many **more** cards and W34 C2 asks for **additional** votes, removing total-versus-increment ambiguity.
- W20 teaching supplies the inch-versus-centimeter benchmark needed to compare equal numerical measurements.
- Revised tasks were independently solved before revised keys. All 108 sampled outcomes and 72 models agree; no outstanding finding remains.

### Grade 1

- W2 C6 now counts the counter in the cup. Daily plans ask specific model questions, and next-week connections identify actual concepts.
- Added explicit questions to W15 A4/B5/C3, W16 A5, W17 A5/A6, W18 B3, and W31 B6; repaired singular tens, bundles, and loose-one wording.
- W30 C4 says unequal **parts**, avoiding the contradiction “unequal halves.” W25 A2 defines a circle precisely; W27 B1 supplies equal squares joined along a full side; W20 C6 supplies aligned starts and end-to-end tiles without gaps or overlaps.
- W21 C2 now corrects a misplaced minute hand instead of repeating a 10:00 reading under a different label.
- All revised prompts and steps were checked; all 108 sampled outcomes and 72 models agree. No outstanding finding remains.

### Kindergarten

- W2 C6 specifies 1–5 counters; W9 A1 identifies a circle; W9 C4 now compares shape features; W11 B4 explicitly names the two solid groups.
- W16 A1 no longer supplies the hidden count, and W17 B6 uses opposite operations instead of repeating the same zero-subtraction exercise.
- W20 C2 asks for more eggs. W27 B5/W30 B5 specify initially empty receiving containers and no spilling, making capacity conclusions valid.
- W32 A1/C1/C5, W33 A4, and W36 A6 now involve piece-versus-corner counts, missing-pane/gap repair, a stepped-outline check, and extending a construction. W26 C6 predicts and checks shortening an initially equal strip.
- All repairs, final connections, and replacement samples were checked. All 108 sampled outcomes and 72 models agree; no outstanding finding remains.

## Scope, diversity, and negative findings

Kindergarten distinguishes oral counting through 100 from concrete written quantities through 20, limits scattered sets to ten, keeps joining/separating within ten and dedicated fluency within five, and represents teen quantities as ten individual ones plus extras. K and Grade 1 allow adult reading, pointing, moving objects, drawing, and dictation rather than assuming independent literacy. Grade 2 permits adult reading and concrete support.

Grade 1 develops operations through concrete counting, ten-making, and tens/ones; it uses hours/half-hours, three-category data, and equal halves/fourths. Grade 2 develops modeled computation within 1000, five-minute clocks, money, equal-unit measurement, small arrays, and halves/thirds/fourths. Grade 3 develops group meaning before properties and computation, distinguishes area/perimeter, uses allowed core fraction units and models beyond one, then develops minute-level time, same-unit mass/volume, scaled graphs, fractional ruler positions, and integrated decisions. References and unit pacing pass for all four courses.

No sampled arithmetic error remains. No exact normalized prompt duplicate appears in the final files, including model-to-worksheet comparisons. Semantic review found and repaired the repetitions listed above; text matching alone did not detect them. Skills intentionally recur with new representations, constraints, or integrated reasoning. This review does not prove every task is semantically unique.

An independent parser recomputed 1,050 recognized equality fragments in answers/steps: 597 in Grade 3, 318 in Grade 2, 94 in Grade 1, and 41 in K. Of these, 1,049 compare correctly as plain numeric expressions. The sole flagged fragment truncated Grade 3 W12 B4's explicit unit: “9 × 20 = 18 tens = 180.” Manual unit-aware checking confirms the full statement is correct. The parser checks only its recognized syntax and does not prove all answers or semantics.

## Reproducible evidence

Scratch evidence is under `.scratch/review_cc_math_early/`: `early-solutions.json`, `g3-early-solutions.json`, `g*-07-12-solutions.json`, `g*-13-18-solutions.json`, `g3-19-24-solutions.json`, `g1-final-solutions.json`, `g2-final-solutions.json`, `gk-final-solutions.json`, and `g3-final-solutions.json`. Corresponding `*-blind.json` files preserve prompts before keys. Final solution records cover G1/G2 weeks 7–36, K weeks 19–36, and G3 weeks 25–36. `g*-repair-solutions.json` records changed tasks and supplemental equality checks; diff records show targeted rereview. `audit.cjs`, `final-audit.json`, and `g*-arithmetic-evidence.json` preserve independent structural and numeric checks. Coordinator supplements are identified above.

Worksheet answer keys are sampled, not exhaustively proved. All models and prompt wording were inspected, but no classroom or human usability review is claimed. Source-linked curriculum alignment is to the repository skeleton; this is not a new external standards certification.

## Final canonical fingerprints

| Grade | File | SHA-256 |
| --- | --- | --- |
| 3 | `content/weekly/common-core-math/3.json` | `b489f402162838aca05243e8a3bfb654709647ab87b58e1309e36b1242a5ecaa` |
| 2 | `content/weekly/common-core-math/2.json` | `2a906a76d3a0b6208fe5e11073f044787d12b7bb858732d161ecfd51e03aae11` |
| 1 | `content/weekly/common-core-math/1.json` | `e7ac211dbab0a2bf58124bb9ec29fe4f8f3a12c2bbedb9bdc55622ce7d995f10` |
| K | `content/weekly/common-core-math/k.json` | `0d445394796487d3fc570c1be2f207e9294e43573e04cca7fd47871ff322c21f` |
