# Course for AP® Calculus AB: independent blind review

Date: 2026-10-08. Reviewer: an independent review agent that did not author
the course. This is an agent review. It is not human editorial approval, not
College Board endorsement, and not measured difficulty or evidence of student
outcomes.

## Verdict

| Severity | Count | Summary |
| --- | ---: | --- |
| Blocking | 0 | No answer key, rubric or worked example was wrong in the blind sample (268 items, every part agreed). |
| Should-fix | 6 | Three content fixes: a false statement in the week 16 table, the `lim_(…)` notation used in two places, and one inaccurate alt text. Three free-response questions follow the structure of released College Board questions closely (judged from the reviewer's memory). |
| Note | 14 | Rubric wording, near-duplicate designs, key-letter balance, timing consistency, figure readability, boilerplate phrasing. |

The mathematics is consistently correct and well sequenced. Every week matches
its scheduled CED topics. BC-only material appears only in week 36, and it is
labeled there.

## Artifacts reviewed

SHA-256 values were recorded before the review began and checked again at the
end. Nothing changed during the review.

| File | SHA-256 |
| --- | --- |
| `content/weekly/ap/calculus-ab.json` | `1cf9738fe372e9e8e1e6c8b4f9e40faf5f1237265dd60dc6b1497007bc2db4c5` |
| `content/ap/assessments/calculus-ab/practice-exam.json` | `c01a97f2de2362daf115ba38234837c35259e6d1d885b13fbb135fd85db03894` |
| `content/ap/assessments/calculus-ab/unit-1.json` | `999814921cee02a6ccf76b1c17536f235b98b5e01cb96e2aa2e1d31bf59790f0` |
| `content/ap/assessments/calculus-ab/unit-2.json` | `6a87502d9eea548626596b2453390a766c3073971633f0b24ea088a5e240eb56` |
| `content/ap/assessments/calculus-ab/unit-3.json` | `78f849112b6f6578be77c563d56eecab9c44f0766b30d1dcf1799fbb1f348ac3` |
| `content/ap/assessments/calculus-ab/unit-4.json` | `07bb891be5a85534fc57772ebaa88f10ccedd88194c28fd7503010644f9a401c` |
| `content/ap/assessments/calculus-ab/unit-5.json` | `c5671259472691cce068b2ea21efe6b35c80ff1c01c9d273e114fd99e4c09eda` |
| `content/ap/assessments/calculus-ab/unit-6.json` | `0b6d52e4fc0c58032344abaf04cea06a9eca7577deee3e8d2ed2b15295f5de0d` |
| `content/ap/assessments/calculus-ab/unit-7.json` | `0b80f18b3a9cf2aa3f1c124fc582b64a221691766d3e8f1fef3f24b0609ed85a` |
| `content/ap/assessments/calculus-ab/unit-8.json` | `c8f4f433fda711821ce74b925cc24e6034600afcecc2680d0ca7ee0ba1c86a92` |
| Weekly figures, 69 SVG: `(cd content/weekly/figures/ap/calculus-ab && sha256sum *.svg \| sha256sum)` | `74957338091550a8d4cdc0a4061ff8229d3b20b2c986afe72d8cd4f41475e195` |
| Assessment figures, 18 SVG: `(cd content/ap/figures/calculus-ab && sha256sum *.svg \| sha256sum)` | `7fd175e1d2c414fa8193379abb96c05d2c6283c1f2afbb4b0fa8c7a4c74419a2` |
| Plan (reference only): `content/ap.json` | `a507bdc527536a2dc64cf01322a3627f3e920c4033d95aa6b161d537eb1eccb7` |

## Method

- **Independence.** The reviewer did not open the authors' scratch lanes
  (`.scratch/ap/calculus-ab/`). Inputs were limited to the repository guidance,
  `docs/weekly-coursework.md`, `docs/ap-courses.md`, the design and unit plans,
  `content/ap.json` and the course files themselves. No College Board
  documents were used, and no network was used.
- **Blind first.** A scratch script printed student-only views through the
  repository's own projections: `studentWorksheet` in `src/lib/weekly.js` and
  `studentCopy` in `src/lib/ap-assessment.js`. Those views contain no keys,
  rubrics, answers, steps or answer-only figures. All blind answers were
  written to files before any key was revealed.
- **Sample rule (fixed in advance).** For week w and sheet index s (0 = A,
  1 = B, 2 = C), the sampled item was number ((w − 1)·3 + s) mod n. This rotates
  item positions across the 108 worksheets.
- **Calculator items.** Answers came from plain Python 3 (bisection, symmetric
  differences, Simpson's rule) without sympy or numpy. Three-decimal agreement
  was required.
- **Figures.** Every SVG was rasterized with `/usr/bin/chromium --headless
  --screenshot` in two-column galleries and compared against the stated
  functions and the alt text. Four shaded figures were also rendered on a dark
  background.
- **Read-only gates.** `node tools/check-ap.js` passed (AB is valid; physics is
  still pending). `node tools/check-weekly.js` passed.

## Scope completed

| Component | Required | Completed |
| --- | --- | --- |
| Weekly worksheets, blind | 1 item per sheet, 108 | 108 (36 weeks × A/B/C) |
| Practice exam, blind | 42 MC + 6 FR | 42 MC + 6 FR (24 parts, written solutions) |
| Unit tests, blind | ≥ 6 MC + 1 FR each | all 12 MC + both FR in each of the 8 tests (96 MC, 16 FR, 66 parts) |
| Explanations, examples, day plans | all | 36 weeks: 144 paragraphs, 106 worked examples, 180 day plans; every numeric claim recomputed |
| Rubrics | all FR | all 22 assessment FR (rows sum to part points; parts sum to 9); 16 sampled weekly FR rubrics |
| Figures | all | 87/87 inspected in light mode (69 weekly, 18 assessment); 4 also in dark mode |
| Extra checks after the keys were visible | — | 30 worksheet items tied to figures; key letter against answer text for all 271 MC (0 mismatches); all 42 practice-exam distractor notes recomputed (all correct); distractor spacing against rounding; topic coverage (81/81 AB topics in weeks and tests); week standards against the plan schedule (36/36 match) |

## Blind agreement

| Set | Items | Agree | Key error | Ambiguous item | Reviewer error |
| --- | ---: | ---: | ---: | ---: | ---: |
| Weekly sample | 108 | 108 | 0 | 0 | 0 |
| Practice exam MC | 42 | 42 | 0 | 0 | 0 |
| Practice exam FR | 6 (24 parts) | 6 (24) | 0 | 0 | 0 |
| Unit-test MC | 96 | 96 | 0 | 0 | 0 |
| Unit-test FR | 16 (66 parts) | 16 (66) | 0 | 0 | 0 |
| **Total** | **268** | **268** | **0** | **0** | **0** |

One blind answer went further than its key. For `ab-w14-c6`(c) the reviewer
located the minimum exactly (see N9). The key's answer, "could occur at 0 or
3.422", is still correct for the question as worded.

## Findings

| ID | Severity | Location | Finding | Evidence | Proposed fix |
| --- | --- | --- | --- | --- | --- |
| S1 | should-fix | Week 16, explanation ¶1, table row "local maximum" | The row says f″ is negative at a local maximum whenever f″ exists and f′ = 0. That is false. It treats the sufficient condition of the second derivative test as a necessary property. | Row text: `\| local maximum \| changes from + to − \| negative there, if f″ exists and f′ = 0 \|`. Counterexample: f(x) = −x^4 has a local maximum at 0, but f″(0) = 0. | Replace the row with `\| local maximum \| changes from + to − \| not positive there, if it exists; f′ = 0 with f″ < 0 guarantees one \|` |
| S2 | should-fix | Week 13: explanation ¶3–4, examples 2–3, `ab-w13-a4`, `a5`, `a6`, `b2`, `b3`, `b4`, `b6`, `c3`, `c6`. Week 17: example 3, `ab-w17-a6`, `ab-w17-b4`. Unit 4: `ab-u4-mc08`, `ab-u4-fr2`(d) | These lanes write limits as `lim_(x→a) E`: 25 times in week 13, 3 in week 17 and 2 in the Unit 4 test. Every other week, the practice exam and the other seven tests use `lim as x→a of E`. The underscore form looks like LaTeX, displays literally, and breaks the course's notation. | Notation scan per file. Every other file has 0 occurrences. | Replace each `lim_(x→a) ` with `lim as x→a of `. Example: `lim_(x→0) (e^(3x) − 1 − 3x)/x^2` → `lim as x→0 of (e^(3x) − 1 − 3x)/x^2`. Another: `lim_(t→2) (x(t) − 52)/(t − 2)^2` → `lim as t→2 of (x(t) − 52)/(t − 2)^2`. |
| S3 | should-fix | Figure `ab-w04-f1` alt text (week 4, example 2 and the explanation) | The alt says the left branch "stays just below y = 2". In fact r(−5) ≈ 1.29, and the branch crosses the x-axis at (−2, 0). The alt also leaves out the zero at (1, 0). The drawing is correct; the screen-reader description is not. | r(x) = 2(x + 2)(x − 1)/((x − 2)(x + 1)). The rendered figure shows both x-intercepts. | New alt: "Graph of y = r(x) for −5 ≤ x ≤ 6 with dashed vertical lines at x = −1 and x = 2 and a dashed horizontal line at y = 2. Left of x = −1 the curve starts below y = 2 near (−5, 1.3), falls through (−2, 0), and drops steeply as x approaches −1 from the left. Between the dashed vertical lines the curve comes down from the top of the window near x = −1, passes through (0, 2) and (1, 0), and falls steeply as x approaches 2. Right of x = 2 the curve comes down from the top of the window and levels off above y = 2." |
| S4 | should-fix (owner decision; recommended before release) | `ab-pe-fr1` (practice exam, FR 1) | The structure closely matches a widely known released question; from memory, the reviewer believes it is 2013 AP Calculus AB free-response question 1. Both have material arriving at a modeled rate, removal at a constant rate from t = 0, and a given starting amount. Both ask the same four things: a derivative at an instant interpreted with units, the total that arrives, whether the amount is increasing or decreasing at an instant, and the maximum amount with justification. Only (a) and (b) are swapped. Context, function and numbers differ, and no text or data match was found. The owner's rule bans recognizable released FRQ scenarios and close paraphrases. | Part list of `ab-pe-fr1`, compared from memory only. | Rework the structure, not only the numbers. One verified option: start the compactor at t = 2. Ask for the time of fastest arrival (A′ = 0 at t = 10/3, A ≈ 29.430 kg/h) and the average arrival rate (≈ 21.356 kg/h). Ask for the amount at t = 10 (50 + 213.560 − 120 ≈ 143.560 kg) instead of the maximum. Keep 9 points and the calculator, then re-verify the topics and rubric. |
| S5 | should-fix (owner decision; recommended before release) | `ab-u8-fr1` (Unit 8 test, FR 1) | The structure closely matches a released question; from memory, the reviewer believes it is 2019 AP Calculus AB free-response question 1. The entering rate is named E(t) with the form a + b·sin(πt/6), and the leaving rate is named L(t). The parts ask for the total entering over the interval, the average leaving rate over the interval, and the time of the greatest number. The context and numbers differ. | Part list of `ab-u8-fr1`, compared from memory only. | Rename the functions (for example A(t) and D(t)). Give arrivals as a table or as a non-sinusoidal model. Replace the average-leaving-rate part, for example with the first time the garage holds 300 cars. Re-verify numbers and rubric. |
| S6 | should-fix (medium confidence) | `ab-pe-fr6` (practice exam, FR 6) | The curve y^3 − 3xy + x^2 = 3 contains the x^2 and −3xy terms, so the "show that" derivative has numerator 3y − 2x. From memory, that echoes a released implicit-curve question that also asks students to show dy/dx = (3y − 2x)/(…) and then use the second derivative at a point (2004 AB FR 4). The remaining parts (tangent line, vertical tangent, second derivative) match a y^3 − xy curve question (2015 AB FR 6). The genre is common, but the displayed derivative is a recognizable echo. | Item stem and parts, compared from memory only. | Use a curve without the x^2 − 3xy pair. Change at least one task, for example replacing the vertical-tangent part with a horizontal-tangent search or a related rate along the curve. Keep 9 points. |
| N1 | note | `ab-pe-fr3` stem and figure `ab-pe-f4` | The opening sentence ("The continuous function f is defined on the closed interval [−4, 4]. The graph of f consists of …") follows the standard released opener for this genre, and the parts are the standard ones. The figure is also nearly a copy of week 19's `ab-w19-f1`: the same lower semicircle on [−4, 0], then a segment from (0, 0) to (2, 2). | Stem text; figures `ab-pe-f4` and `ab-w19-f1`. | Reword the opener, for example "Let f be the continuous function on −4 ≤ x ≤ 4 whose graph is shown: …". Change the semicircle to a different arc or interval. |
| N2 | note (low confidence) | `ab-u6-fr1` | Its structure resembles a released tank question (2016 AB FR 1, from memory). One flow comes from a table and the other from a formula, with a given starting amount. The final amount is estimated from the table sum plus the formula integral. | Part list. | Change the sequence of parts, for example by replacing (d) with an average-value or Mean Value Theorem part. |
| N3 | note | Boilerplate in FR stems: `ab-pe-fr1`(b), `ab-pe-fr5`(a)–(b), `ab-pe-fr6`, several unit-test FR | The command phrases repeat College Board boilerplate: "Show the computation that leads to your answer, and indicate units of measure"; "Using correct units, interpret/explain the meaning of … in the context of the problem"; "Consider the curve given by". These phrases are not distinctive content, but they read as exam boilerplate. | Text search. | Vary the wording, for example: "Estimate W′(13) from the table. Show the difference quotient and give units." |
| N4 | note | Week 32, explanation ¶3 | The model setup line "Bikes at t = 6: 15 + ∫ from 0 to 6 of (A(t) − D(t)) dt = 59.901." uses functions A and D that appear nowhere in the course. Students cannot check the number, and the line reads like a fragment from another source. | Quoted sentence. | Replace it with: "Grain at t = 6 in Example 3: 60 + ∫ from 0 to 6 of (G(t) − 18) dt ≈ 84.484." (Verified: 60 + 30 − 30cos 2 − 18 ≈ 84.484.) |
| N5 | note | Practice exam MC25 against `ab-w22-b5`; practice exam MC21 against `ab-u6-mc02` | Two pairs share a design and differ only in numbers. MC25 and `ab-w22-b5` both integrate 1/((x + a)^2 + 1) from x = −a to −a + 1 and get π/4. MC21 and `ab-u6-mc02` both use a right sum (k/n)e^(c + kx/n) that becomes ∫ e^x. The weekly contract treats numerical variants as the same design, and the practice exam should be fresh. | Item texts. | Give MC25 a different result (for example π/12, or a logarithm form). Give MC21 a different function family. |
| N6 | note | `ab-u4-fr2`(d) rubric | Both rows require L'Hospital's Rule. A correct factoring solution, x(t) − 52 = (t − 2)^2(2t − 13) → −9, does not literally match either row. | Rubric rows. | Row 1: append "… or factors x(t) − 52 = (t − 2)^2(2t − 13)." Row 2: append "… or evaluates 2t − 13 at t = 2 to get −9." |
| N7 | note | `ab-pe-fr4`(b), `ab-pe-fr6`(d), `ab-u5-fr2`(e), `ab-u7-fr2`(c) keys | These keys justify an over- or underestimate by concavity "near" the point. Strictly, the sign must hold all the way from the point to the estimated input. That is true in every case, so the keys are right, but they could show the stronger sentence. | For example, A″ = A((6 − t)^2 − 12)/144 > 0 for 0 ≤ t ≤ 1. | Add a step, for example in `ab-pe-fr4`(b): "(6 − t)^2 > 12 for 0 ≤ t ≤ 1, so A″ > 0 on the whole interval." |
| N8 | note | `ab-u4-fr1`(d) rubric row 3; `ab-u2-fr2`(d) | Two parts award points for little work. Row 3 of `ab-u4-fr1`(d) gives a point for restating 1.865 m as "the height half a minute later". `ab-u2-fr2`(d) gives 3 points for a routine product-rule value unrelated to the graph of g. | Rubric rows. | Tie the `ab-u4-fr1` point to units or an error-direction reason. Make `ab-u2-fr2`(d) 2 points and move the freed point to the justification in (c). |
| N9 | note | `ab-w14-c6`(c) | The part asks only where the minimum "could occur" (0 or 3.422). On a calculator sheet it can be found: ∫ from 0 to 3.422 of f′ ≈ 0.337 > 0, so the absolute minimum is at x = 0. | Reviewer computation. | Optional: ask "Determine where the absolute minimum occurs" and add a rubric point for the integral comparison. |
| N10 | note | Weekly MC keys; all unit tests | Weekly MC keys favor B: 48 of 133 (36%), with D at 17%. Every unit test has exactly 3 keys per letter, which a test-wise student can exploit. | Key tally. | Rebalance some weekly keys. On unit tests, allow 2–4 keys per letter. |
| N11 | note | Unit tests 1, 2, 6, 7, 8 | These tests give Part B 10 minutes for 4 calculator questions, which is 2.5 minutes each against an exam pace of about 2.9. Units 3–5 give 12 minutes. The same five tests also leave part titles blank, while units 3–5 and the practice exam title them. | Section data. | Use 12 minutes (60 total) and the same part titles in all eight tests. |
| N12 | note | `ab-w31-b2` | The item depends on the answer to the multiple-choice item `ab-w31-b1` ("the differential equation from item 1"). A student who misses b1 cannot do b2. | Item text. | State the equation in b2 ("… using dy/dx = x(2 − y) …"), or keep the dependency and say so in the directions. |
| N13 | note | Figure readability | `ab-w05-f1`: the first hump barely clears y = k (about 2.1 against 2), so two of the three crossings look like a touch. `ab-w09-f1`: the tangent segments lie almost on the curves. Slope fields `ab-w23-f2`, `ab-w24-f1`, `ab-w31-f2`, `ab-w31-f3`, `ab-pe-f3`, `ab-u7-f1` and `ab-u7-f3`: segments on a drawn axis or level line print over tick labels or merge into a dashed line. `ab-w29-f1` and `ab-w29-f2` put the radius label R inside the shaded region, while R names a region in `ab-w32-f1`, `ab-pe-f5` and `ab-u8-f2`. Small overlaps: `ab-w03-f2` (tick 5), `ab-u1-f1` and `ab-w11-f2` (endpoint on the arrowhead), `ab-w27-f2` ("y = x" label over the cubic). 14 figures set superscripts at 11 px, below the 12 px guideline (kit output). `ab-w14-f1` draws the curve over about −0.3 ≤ x ≤ 2.1, though its alt says 0 ≤ x ≤ 2. | Chromium renders in the reviewer's scratch gallery. | Raise the hump in `ab-w05-f1` to about 2.6. Offset the tangent segments. Skip field segments that fall on drawn axes, or move the tick labels. Label the washer radii outside the region. Set kit superscripts to 12 px. |
| N14 | note (for the code reviewer) | `studentWorksheet` in `src/lib/weekly.js` | The student projection includes `skill`. For error-analysis items the skill names the error: `ab-w33-c3` "Include the initial amount", `ab-w33-b2` "Check the form before using L'Hospital's Rule". The reader does not display it today (`src/app/weekly-render.js` never reads `skill`). | Projection code. | Keep `skill` out of any future student-facing display, or drop it from the student projection. |

## Rubrics

- **Practice exam.** Points per question: FR1 2+2+1+4, FR2 3+2+3+1, FR3 2+2+2+3,
  FR4 2+2+4+1, FR5 1+3+3+2, FR6 2+2+2+3. Each question totals 9, for 54
  points. Every rubric row sums to its part. Points go to setups
  (integrals, equations, separation of variables), justifications (sign
  changes, candidates tests, hypotheses of the IVT and MVT), and answers with
  stated tolerances. FR5(c) accepts the Extreme Value Theorem argument as an
  alternative. That is good practice.
- **Unit tests.** All 16 FR total 9 points, and every row sums to its part.
  The only issues are the rubric wording in N6–N8.
- **Weekly sample.** The 16 sampled FR items (`ab-w02-c6`, `w04-c6`, `w05-a6`,
  `w06-c6`, `w08-c6`, `w10-c6`, `w12-c6`, `w14-c6`, `w16-c6`, `w18-c6`,
  `w20-c6`, `w22-c6`, `w24-c6`, `w26-c6`, `w28-c6`, `w32-c6`) sum correctly and
  award points for reasoning.

## Teaching content

| Weeks | Topics checked | Result |
| --- | --- | --- |
| 1–5 (Unit 1) | 1.1–1.16, IVT, unit synthesis | Correct. Every example recomputed. Clear common-error paragraphs. Only issue: S3. |
| 6–8 (Unit 2) | 2.1–2.10 | Correct. Derivation-first progression; trigonometric derivatives derived. |
| 9–10 (Unit 3) | 3.1–3.6 | Correct, including the implicit second derivative (week 10, example 2). |
| 11–13 (Unit 4) | 4.1–4.7 | Correct. S2 (notation) is concentrated in week 13. |
| 14–17 (Unit 5) | 5.1–5.12, semester review | Correct except S1. Optimization examples are justified as absolute extrema. |
| 18–22 (Unit 6) | 6.1–6.10, 6.14 (6.11–6.13 correctly absent) | Correct. Uneven table widths and signed versus total area are stressed. |
| 23–24 (Unit 7) | 7.1–7.4, 7.6–7.8 (7.5 Euler and 7.9 logistic absent) | Correct. Validity intervals of particular solutions are handled well. |
| 25–29 (Unit 8) | 8.1–8.12 (8.13 absent) | Correct. Radii are measured from the axis of revolution, and every volume was verified. |
| 30–34 (review, practice exam) | AB.REVIEW | Correct. Exam pacing is consistent with the plan. Week 32 has N4. |
| 35–36 (beyond the exam) | AB.BEYOND | The week 35 modeling investigation uses original data, and its fit and residual claims check out. Week 36 marks Euler's method, integration by parts, improper integrals and Taylor polynomials as "not AB content" in its titles, day plans, examples and sheet titles. |

Notation is otherwise consistent: Unicode minus signs, `∫ from a to b of`,
`d^2y/dx^2` and pipe tables throughout. A search for BC-only terms (Euler,
logistic, by parts, improper, Taylor, series, partial fractions, polar,
parametric, arc length) found matches only in week 36 and in the phrase
"improper fraction" in week 22. No assessment contains any of them.

## Figures

All 87 figures are geometrically faithful to their stated functions and data.
This includes the slope fields: sign and relative steepness were checked at
grid points for dy/dx = x − y, 2 − y, −xy, x(2 − y), (x + 1)y/2 and x^2(1 − y).
Every figure uses `currentColor`, so the four shaded figures rendered on a
dark background stay legible. Given-figure alt texts do not reveal answers.
The only inaccurate alt text is S3; the readability items are in N13.

## Calculator, timing, blueprint and claims

- **Calculator markers.** Every no-calculator part and sheet in the blind
  sample was solvable by hand. A scan for decimal answers on no-calculator
  sheets found only exact-or-optional decimals, such as 1/(2π) ≈ 0.159. The
  practice exam's Part B and Section II Part A items genuinely need a
  graphing calculator.
- **Practice exam blueprint.** The substance matches `units.md`: Section I has
  29 + 13 MC with unit counts 5/5/3/5/8/8/3/5, and Section II has 2 calculator
  FR + 4 no-calculator FR at 9 points each. Three FR are in context (FR1, FR4,
  FR5); at least two are required. Timings equal the exam's. Key letters
  split A 10, B 13, C 11, D 8, within the 15–35% band.
- **Unit tests.** Each has 8 + 4 MC and 1 + 1 FR in 58–62 minutes, within the
  plan's 50–70.
- **Claims.** The content has no score conversion, no prediction, no "pass" or
  "5", and no endorsement claim. The marks appear only as adjectives
  ("AP® Calculus AB Exam", "not an AP® score"). The exact disclaimer is in the
  footers of `src/ap.html`, `src/index.html` and `src/high-school.html`, and in
  the AP track notice (`src/lib/weekly.js`). Practice materials report raw
  points only.
- **Copied material.** No passage, data set or number matches any College
  Board item the reviewer knows of. The resemblance findings (S4–S6, N1–N3)
  concern structure and boilerplate only.

## Limits

- This is an agent review: not human editorial approval, not College Board
  endorsement, and not measured difficulty.
- The resemblance screen relied on the reviewer's memory of publicly
  released free-response questions. No College Board material was consulted
  or used. A person who can legitimately consult the released questions
  should confirm S4–S6 and N1–N3 without giving that material to any agent.
- The blind sample covered one item per worksheet. 543 worksheet items were
  not independently solved; 30 more were checked after their keys were
  visible.
- Figures were checked as standalone SVGs in Chromium with a generic sans-serif
  font. Rendering through the site's sanitizer and scaling, print output,
  phone width, and whether the disclaimer appears in printed assessment
  booklets belong to the print and code reviewers.
- Exam-format facts were taken from `units.md` and `content/ap.json` as given.
  They were not re-verified against College Board pages.
- Numeric verification used Simpson's rule (2,000–4,000 subintervals),
  bisection and symmetric differences. All agreements hold at three decimals.

## Resolution (2026-10-08)

Repair lanes fixed every finding in the authoring sources, recomputed each
changed number in two independent scripts, and re-ran the lane checks,
`check-ap --complete` and the course assembly. This record keeps the review
as written; the table says what changed.

| ID | Resolution |
| --- | --- |
| S1 | The row now reads "not positive there, if it exists; f′ = 0 with f″ < 0 ensures one" ("ensures", because the claims lint reserves "guarantees"). |
| S2 | All 29 `lim_(x→a)` forms now read `lim as x→a of`; no file contains `lim_(`. |
| S3 | The review's alt text, checked against r(x). |
| S4 | `ab-pe-fr1` is a new design: water spreading into a shallow circular pool, with volume and radius at an instant, the time the edge reaches a drain, an average rate and the times the rate equals it, and when the area grows fastest. |
| S5 | `ab-u8-fr1` is a new design: arrivals 90t·e^(−t/4), departures 10 + 12t; when arrivals are at least 100 per hour, the cars arriving then, the first time the garage holds 300 cars, and a comparison of two times. |
| S6 | `ab-pe-fr6` uses the curve x²y + xy² = 6: the derivative, every horizontal tangent, and related rates along the curve. |
| N1 | New opener and a new graph of f (a quarter circle, then segments); part (d) counts solutions of g(x) = 6. |
| N2 | `ab-u6-fr1` drops the starting amount and the total-drained parts; it now asks for a trapezoid sum, its meaning, the Mean Value Theorem on the table (a Unit 5 topic as cumulative review), a drain time and a rate comparison. |
| N3 | The flagged boilerplate phrases are reworded throughout the course and the tests. |
| N4 | Week 32 now cites its own Example 3 (≈ 84.484). The old line also gave away `ab-w32-b1`(a). |
| N5 | Practice exam MC21 is a Riemann limit that must be refactored before it reads as ∫ from 1 to 3 of dx/x; MC25 is ∫ from 0 to 1 of x³/(x² + 1) dx. |
| N6 | `ab-u4-fr2`(d) credits the factoring route. |
| N7 | The keys now show the concavity sign on the whole interval. |
| N8 | `ab-u4-fr1`(d) row 3 is an over- or underestimate point; `ab-u2-fr2` is now 2 + 2 + 3 + 2, and (d) uses the graph of g. |
| N9 | `ab-w14-c6` gives f, so students can compare candidates before integrals are taught, and asks where the absolute minimum occurs (x = 0). |
| N10 | 13 weekly keys moved off B (weekly MC is now 26% B); unit tests vary 2–4 keys per letter. |
| N11 | Every unit test gives Part B 12 minutes and uses the same part titles. |
| N12 | `ab-w31-b2` states its equation; `ab-w31-b1` now matches its own new slope field so b2 does not give it away. |
| N13 | Every listed figure is redrawn: field segments off the axes, labels moved clear of curves and regions, the week 5 hump raised to 2.614, the week 14 curve drawn on 0 ≤ x ≤ 2. The kit's 11 px superscripts are unchanged (deferred). |
| N14 | Fixed in code: skill labels are key-only (commit 062d4e3). |

## Cold follow-up (2026-10-08)

A second independent agent reviewed the calculus repairs at `afdf948`, using
the repair record above as a list of proposals to verify. The final keyed
records were withheld until solutions were recorded. No College Board
questions, PDFs, or scoring guides were consulted. The repair narrative above
already disclosed some expected results, so this is a targeted independent
recalculation, not a new fully blind review of the entire corpus.

The sample included all 28 assessment items whose student-facing content
changed in `830ae3e`: 11 multiple-choice items and 17 free-response items
with 70 parts. It also included all four parts of `ab-pe-fr4` to check its
concavity repair, and weekly items `ab-w13-a4`, `ab-w13-c6`, `ab-w14-c6`,
`ab-w17-b4`, `ab-w31-b1`, `ab-w31-b2`, and `ab-w32-b1`.
Symbolic work, independent antiderivatives, bisection, and Simpson integration
confirmed the final keyed answers. Two preliminary reviewer slips were
corrected: the midpoint-sum choice in `ab-u6-mc11` and the final trapezoid
in `ab-pe-fr5`(b), whose total is 333 cubic meters.

Key checks on the redesigned questions included:

- `ab-pe-fr1`: V(4) = 48.283137, radius 27.720931, drain time
  9.917252, average escape rate 12.829613, equal-rate times 2.259108 and
  8.964650, and fastest area growth at t = 5.
- `ab-u8-fr1`: arrival-rate endpoints 1.699209 and 7.789838, accumulated
  arrivals 736.218946, first 300-car time 4.211926, and change from t = 6
  to t = 12 of −191.504937 cars.
- `ab-pe-fr6`: the only horizontal tangent is at (∛3, −2∛3);
  at (1, 2), dy/dt = −8 and dA/dt = 2.
- `ab-pe-fr3`: g(0) = 9π/4, g(5) = 9π/4 − 2, and exactly two
  solutions of g(x) = 6.

One scoring issue was corrected: `ab-u2-fr2`(c) required an extra continuity
statement in its third rubric row, although the prompt asks only for a
differentiability decision justified by the one-sided difference-quotient
limits. The row now awards that point for concluding that the unequal limits
1 and 0 imply nondifferentiability. The continuity explanation remains in the
worked key. This change preserves the three-point total.

The notation repair, week 4 alt text, week 16 second-derivative statement,
week 32 example reference, unit-test part titles and calculator timings,
and preservation of correct answers when choices were reordered were also
checked. No further answer-key error was found in this sample.
After the rubric correction, `node tools/check-ap.js --complete` passed
(26 assessments, 402 MC and 60 FR), and `git diff --check` passed.

Limits: this follow-up did not re-review every weekly item or establish
originality against external question banks. Browser and print checks belong
to integration. Fourteen calculus SVGs still contain 11 px superscript spans;
the explicit N13 deferral remains in force. No new evidence of unreadability
was established here, and changing those spans without checking rendered
spacing could introduce collisions. This remains an agent review, not human
editorial approval or measured difficulty.

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.
