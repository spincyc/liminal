# Common Core mathematics Grades 12, 11, and 10: independent review

Reviewer: `review_cc_math_high`. Date: 2026-10-07. **Sampled review complete at the hashes below.** No unresolved mathematical or standalone-givens defect was found in the reviewed sample after author repairs. This is sampled independent agent review, not human approval or comprehensive proof.

## Actual coverage

| Course | Weeks read | Worksheet solutions before keys | Worked examples inspected | All worksheet prompts inspected |
| --- | --- | ---: | ---: | ---: |
| Grade 12 | 1–36 | 108 | 72 | 648 |
| Grade 11 | 1–36 | 108 | 72 | 648 |
| Grade 10 | 1–36 | 108 | 72 | 648 |

For each reviewed week and worksheet A/B/C, select zero-based item index `(week + sheetIndex − 1) % 6`, where A/B/C have sheet indices 0/1/2. Thus IDs are `ccm{grade}-w{week padded to two digits}-{letter}{index+1}`. This rotates through all six positions and includes early and late items. Independent answers were recorded before viewing corresponding keys in `.scratch/review_cc_math_high/`: `g12-first-six-independent.json`, `g12-weeks7-18-independent.json`, `g12-weeks19-36-independent.json`, the analogous three Grade 11 files, and `g10-first-six-independent.json`, `g10-weeks7-12-independent.json`, `g10-weeks13-30-independent.json`, and `g10-weeks31-36-independent.json`. Later files also retain independently computed model results.

Read every available title, objective, explanation, prerequisite/next connection, daily plan, worked example, and worksheet prompt. Inspected all selected keys and their steps. All selected mathematical results agree with the independently derived results, allowing equivalent open-response examples. Three Grade 12 sampled prompts needed missing givens clarified rather than different arithmetic answers.

Grades 12 and 11 match all six source-linked units at six weeks apiece, with no unit or standard-reference mismatch. Grade 10 also matches every unit and standard reference at the prescribed six-week pace. Grade 12 preserves its optional advanced scope and reaches complex geometry, conics, vectors/matrices, decision probabilities, Cavalieri reasoning, and a sustained reservoir investigation. Grade 11 remains a core Algebra 2/inference route; its statistical instruction distinguishes random assignment, sampling, nonresponse, model-conditioned tail fractions, and generalization. Grade 10 uses explicit geometric hypotheses, exact construction reasoning, similarity/trigonometry, coordinate geometry, solids, and modeling.

The lessons include calculation, representation changes, domain arguments, counterexamples, construction/proof, data interpretation, and model criticism. Whole lessons are not parameter-only copies. A normalized exact-prompt comparison across examples and worksheets found no duplicates in all three complete courses. This does not prove semantic uniqueness. An initially reported Grade 12 equivalent-exercise concern was a reviewer mistake, explicitly retracted below. The daily plans in Grade 10 remain more templated than the substantive explanations and tasks; topic-specific daily actions would improve teacher usability. This is a nonblocking teaching-usability limitation. Grade 11 now has 180 topic-specific daily actions; all were reread, and a structural diff confirmed that only the daily plans changed from its originally reviewed version. The revised sequencing follows each lesson’s concepts, representations, checks, and applications.

## Findings and repairs

| Course/location | Finding | Status |
| --- | --- | --- |
| Grade 12 week 4 model 2 and C6 | Absolute-value bars split reasoning into fragments such as `As ` / `x` / ` grows...`. | **Confirmed repaired** with `abs(x)` and coherent steps; complete-course model fragment scan clean. |
| Grade 12 week 8 A3 | Reviewer initially misread `π/12` as 75° and falsely reported equivalence. In fact it is 15°, so the original questions differ. | **Finding retracted.** Author retained an optional replacement using the tangent subtraction formula; `tan(π/12)=2−√3` and its denominator justification were checked. |
| Grade 12 weeks 18, 32–35 | Some items depend on earlier context absent from their own worksheet: origin for tangent contacts, reservoir geometry/areas/constraints, demand probabilities/cost assumptions, and a previous cost formula. Sampled examples include W32-C4 and W34-B5. | **Confirmed repaired.** Reread all 33 changed items/models and their keys/steps, including additional author-found dependencies. |
| Grade 12 week 33 C5 | Rotation by 90° lacks direction and center. | **Confirmed repaired:** direction and center explicit; both order results rechecked. |
| Grade 10 week 23 model 1 and B6 | Absolute-value bars split distance reasoning into fragmented steps. | **Confirmed repaired** in canonical Grade 10. |
| Grade 10 week 19 explanation | Center-to-chord-midpoint converse needs a nondiameter qualification; a diameter midpoint is the center itself. | **Confirmed repaired:** nondiameter qualification present. |
| Grade 10 week 23 explanation | Standard parabola derivation needs `p≠0`, so focus is not on directrix. | **Confirmed repaired** in canonical Grade 10. |
| Grade 10 week 26 C4 | Prism “length” does not explicitly give perpendicular height or right-prism status. | **Confirmed repaired:** perpendicular prism height supplied. |
| Grade 10 week 27 model 1 and B3 | Slant-height Pythagorean calculation assumes a right circular cone. | **Confirmed repaired:** right circular cone stated in both prompts. |
| Grade 10 week 13 B3 | Dilation of `y=2x` lacks a center. | **Confirmed repaired:** origin stated. |
| Grade 10 weeks 32, 33, 36 | Counter-draw questions assumed uniform selection without stating it. | **Confirmed repaired:** uniform-draw wording and corresponding probabilities reread and checked. |

Grade 10 week 5 now explicitly previews why three matching sides fix a triangle up to rigid motion before the week 8 SSS treatment; the repaired passage was inspected. Grade 11's author independently repaired the W34-C4 bracket and made sequence assumptions explicit before canonical installation; the final prompts were read and are coherent.

## Verified files and limits

| File | SHA256 | Status |
| --- | --- | --- |
| `content/weekly/common-core-math/11.json` | `83bba63caa4e740a0938ec460d674dcbdc7d785d946189f184cdf4c3b077bf4d` | Complete sampled review. |
| `content/weekly/common-core-math/12.json` | `f1868589bdc2ffd6c4df90e0064a45cb004a449c088c92429e15dd63a997da16` | Complete sampled review plus 33-task repair rereview. |
| `content/weekly/common-core-math/10.json` | `4ca67764e3dd389d8b57b24ee9216265d28d1ef7a8943051b4577f23c3ae2936` | Complete sampled review and confirmed repair rereview. |

Reviewed snapshots and independent-answer files live only in reviewer scratch. All three final structural audits found 36 weeks, 108 worksheets, 648 items, and 72 models per course, with no exact prompt duplicates, mismatched unit/standard references, or short fragmented steps. Grade 12 W32 model 1 now says “all three constraints pass”; the final wording-only change was reconciled against the reviewed version. Subsequent content changes require reconciliation against these hashes. Unsampled answer keys are not claimed independently verified by this reviewer. No subject content, generators, build output, commits, or publication were changed by this reviewer.
