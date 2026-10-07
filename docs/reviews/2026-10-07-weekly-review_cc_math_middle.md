# Common Core mathematics Grades 9–7 weekly review

Reviewer: `review_cc_math_middle`, independent author-separated agent review, 2026-10-07. All three assigned courses are complete at the file identities below. This is sampled agent verification, not human editorial approval or comprehensive mathematical proof.

| Course | Current scope | Cold worksheet solutions | Models inspected | Final SHA-256 |
| --- | --- | --- | --- | --- |
| Grade 9 | All 36 weeks, 108 worksheets, 648 task prompts | 108 | 72 | `01692dc750d0321d1b9e881959cc0b3947719f43280fd85bb843184294d7a0f9` |
| Grade 8 | All 36 weeks, 108 worksheets, 648 task prompts | 108, including 3 by coordinator | 72 | `b7089d65f9eef64765b6bbe8d7c83d2ba9d5ca352291a4dfc34a8d7ffe7af31e` |
| Grade 7 | All 36 weeks, 108 worksheets, 648 task prompts | 108 | 72 | `2c323c1abecc17bd6f535402b25c6236e35054613dfc574e79e5d8a0cc4034b2` |

Final canonical paths are `content/weekly/common-core-math/{9,8,7}.json`. Every title, objective, explanation, daily plan, and prerequisite/next-step connection in all three courses was read against `docs/weekly-coursework.md` and the corresponding source-linked skeleton in `content/curriculum/common-core-math.json`. Their six six-week unit boundaries and standards references match. Grade 9 remains a suggested Algebra 1 placement rather than a Common Core grade mandate.

## Reproducible sampling

For each week and each worksheet A/B/C, select one-based item index `1 + ((week − 1 + offset) mod 6)`, with offsets A=0, B=2, C=4. This cycles through early and late items. Solve the displayed givens before opening the key, then compare answer and reasoning. Every worked model was inspected; Grade 9 and Grade 7 model outcomes were independently derived before their keys.

Grade 8 week 1 was accidentally displayed with keys before this reviewer sampled it, so that inspection is explicitly unblinded. The coordinator independently cold-solved W1 A1/B3/C5 before seeing keys and recorded the prompts and outcomes in `.scratch/weekly/root-cold-outcomes.json`, label `cc8`. These are the same selected IDs and givens: rational −7/12, −41/33, and irrationality from infinitely many ones with unbounded zero gaps. All three supplemental prompts exactly match the final canonical file. Grade 8's two W1 models remain unblinded inspections; later models were solved before their keys.

Prompt extracts, independent outcomes, selected IDs, and structural diagnostics are recorded under `.scratch/review_cc_math_middle/`: `g{7,8,9}-checkpoint-{prompts,solutions}.json`, `g{7,8,9}-final-solutions.json`, and `g{7,8,9}-audit.json`. These scratch records are reproducibility aids and are disposable; this report records durable scope and file identities.

## Findings and confirmed repairs

No sampled author answer-key error was found. Findings were sent directly to authors and coordinator; reviewers did not modify subject files.

- Grade 9 W11 C6 originally asked why summing a dependent system lost information even though its sum was equivalent. The repaired task uses independent equations `x+y=4` and `2x−y=5`; `(3,0)` satisfies their sum `3x=9` but violates the originals. The correction and all 36 specific course bridges were confirmed.
- Grade 7 W1's diver emerging three meters above the water became a lift moving relative to ground. W25 now defines simple random sampling by equal probability for every same-size group, distinguishing this from equal individual inclusion. W34 C3 now supplies its own token identities and colors; its replacement-draw probability is 4/9. All three repairs were confirmed in the final hashed file.
- Grade 8 W15 inferred stopping and actual speed from distance from a dock without a path assumption. The staged repair now supplies movement along one straight route, with the explanation similarly qualified. W18 C4 now says 14 total items, removing ambiguity over whether 14 counts muffins alone. Both repairs were confirmed in the final canonical file.
- Grade 8's original generic, grammatically broken daily-plan template was replaced with 180 skill-specific days; every day plan and all 36 connections were read. W11/W30 now treat horizontal slope zero separately from nondegenerate AA triangles. W30 C1 no longer supplies an incompatible exact 32° angle with hypotenuse 10/opposite leg 5.3; its unnamed shared angle makes the exact scaled leg 13.25 coherent. These repairs were confirmed, along with explicit ordering of points in W30 C2 and the author's added unit, rounding, and map-axis details.

A reviewer slip in the initial Grade 7 W29 model-2 notes was corrected during comparison: the median of B = 4,5,6,7,8 is 6, as the author correctly states. It is not an author defect.

## Scope, diversity, and limits

All inspected courses use substantive explanation, calculation, modeling, representation, counterexample, error analysis, and justification tasks. No parameter-only whole-week replication was found. Exact whitespace/case-normalized displayed prompt comparisons across examples and exercises found no duplicates in all three final courses. A broader punctuation-stripping diagnostic falsely flagged Grade 7 W5 A1/A2 because it erased deliberately different parentheses; this was rejected by reading the actual tasks.

Grade 8 supplies coherent transformation sequences, similarity assumptions, a textual Pythagorean area proof and converse argument, and exact/rounded volume tasks with radius, diameter, and perpendicular height distinguished. Grade 7 geometry supplies needed heights, slice directions, and exposed-face assumptions. Sampling lessons distinguish estimates, variability, and bias; probability tasks distinguish replacement and elementary outcomes. The final expected-point exercises are a small probability application. Grade 9 supplies domain restrictions, exact-versus-rounded distinctions, population-SD and quartile conventions, small-data least-squares/correlation formulas, residual signs, and causal-design limits. Independent checks of its final models recovered regression slope 0.5, intercept 1.5, and correlation 0.5 from the displayed three-point dataset.

Unsampled worksheet keys have not all received independent semantic proof. Automated pacing, reference, and duplicate checks do not provide that proof. Browser/build integration belongs to the coordinator. This reviewer changed no subject files and ran no builds or commits.
