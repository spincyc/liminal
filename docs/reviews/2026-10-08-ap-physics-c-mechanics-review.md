# Course for AP® Physics C: Mechanics: independent blind review

Date: 2026-10-08. Reviewer: an independent review agent that did not author
the course. This is an agent review. It is not human editorial approval, not
College Board endorsement, and not measured difficulty or evidence of student
outcomes.

## Verdict

| Severity | Count | Summary |
| --- | ---: | --- |
| Blocking | 2 | No answer key, keyed choice or rubric total is wrong in the blind sample (252 items; 251 agree and the one difference was the reviewer's arithmetic). Two pieces of teaching content give students wrong results: week 24 states an extremum rule that is false in half its cases, and a week 27 graph's axis unit doubles every orbital energy. |
| Should-fix | 12 | Two key or rubric details: one rubric value list and two distractor notes. One design flaw in a unit-test FR. Four impossible or ambiguous setups. Two incorrect justifications in teaching text. Calculus used before it is taught in five places, including one differential-splitting step before Calculus AB week 24. The lab note missing a required clause in three weeks and three unit tests. Five misdrawn figures. One scoring model that credits an altered equation. A formula-reference row with ambiguous axes. A directions template that asks for graph slopes in degrees. |
| Note | 14 | Key-letter balance, unit-test FR timing, low-confidence resemblance echoes, precision and wording slips, repeated designs, figure legibility and alt-text accuracy. |

The calculus-based physics is accurate throughout. Integrals, derivatives,
rotational inertias, torques as cross products, signs and units recompute
correctly; the review ran more than 1,500 scripted numeric checks. Separation of variables first appears
in week 31, after Calculus AB week 24, and is done correctly there. Week 10
verifies exponential drag solutions by substitution instead. Every week matches
its scheduled framework topics. All 41 topics appear in at least one week and
at least one test item.

## Artifacts reviewed

SHA-256 values were recorded before the review began and checked again at the
end. Nothing changed during the review. The course was reviewed as committed in
`7dfae83`; no course file changed in the later commits.

| File | SHA-256 |
| --- | --- |
| `content/weekly/ap/physics-c-mechanics.json` | `2caf4ad6fbd8acc82b576328240d8acd1a1a771df45ab84908cff63efc3c5475` |
| `content/ap/assessments/physics-c-mechanics/practice-exam.json` | `87b1cd1434807a2a6124be3decb13ca3e36f28ae014ac9f763e09c861a847844` |
| `content/ap/assessments/physics-c-mechanics/unit-1.json` | `67d15aedba0443c5574e65e01175bc683cfbe5ca3ac092441805d01f202f242b` |
| `content/ap/assessments/physics-c-mechanics/unit-2.json` | `69db16c5b0fae85ea387580399ab618103bb32b62d0e51feaa7b7fafeb1a5651` |
| `content/ap/assessments/physics-c-mechanics/unit-3.json` | `33b2215bc0ee13382e847d49556612f24d6d140af414632f1db3b14d2b281af7` |
| `content/ap/assessments/physics-c-mechanics/unit-4.json` | `1626ef4705e174d86d562c50bf88278a4620577840e7115ca8e0382fe7f59b20` |
| `content/ap/assessments/physics-c-mechanics/unit-5.json` | `408baeae94a1ec9fd29ae9f18e1052224f15e18e4879b0497e403364f5a81965` |
| `content/ap/assessments/physics-c-mechanics/unit-6.json` | `3040ee26e90b988f01b4d1c7354a650f382b70ea790e4277c290177157e7c5ab` |
| `content/ap/assessments/physics-c-mechanics/unit-7.json` | `f12316ae4ee3c84dc9a2594122d02a03e137684ccc88bdbd5a2f1907ace140d5` |
| `content/ap/references/physics-c-mechanics.json` | `82960765b57f24dba9b6befe634d80f4711eeb525c5beda5a9a7ce1a0c37e4e6` |
| Weekly figures, 193 SVG: `(cd content/weekly/figures/ap/physics-c-mechanics && sha256sum *.svg \| sha256sum)` | `227b49dd6a6a912af63161b7bd23eb80507563461cab947d19c12fb06eb3d897` |
| Assessment figures, 50 SVG: `(cd content/ap/figures/physics-c-mechanics && sha256sum *.svg \| sha256sum)` | `02ca404efa66059b1b4f80146995af46d0a02f593c991ed2cf88e237f997224d` |
| Plan (reference only): `content/ap.json` | `a507bdc527536a2dc64cf01322a3627f3e920c4033d95aa6b161d537eb1eccb7` |

## Method

- **Independence.** The reviewer did not open the authors' scratch lanes
  (`.scratch/ap/physics-c-mechanics/`). Inputs were the repository guidance,
  `docs/weekly-coursework.md`, `docs/ap-courses.md`, the design and unit plans,
  `content/ap.json` and the course files themselves. No College Board
  documents were used, and no network was used.
- **Blind first.** A scratch script printed student-only views through the
  repository's own projections: `studentWorksheet` in `src/lib/weekly.js` and
  `studentCopy` in `src/lib/ap-assessment.js`. The script failed if any key
  field appeared. For three investigation items whose prompts refer to earlier
  tasks, the whole student sheet was printed the same way. All blind answers
  were written to files before any key was revealed.
- **Sample rule (fixed in advance).** For week w and sheet index s (0 = A,
  1 = B, 2 = C), the sampled item was index ((w − 1)·3 + s) mod n: 108 items.
- **Physics computation.** Every blind numeric answer was computed in plain
  Python 3, with units carried by hand. g = 9.8 m/s^2. Least-squares fits were
  used for investigation data, and closed forms for the drag, rotor and
  rocket models.
- **Delegated lanes.** Teaching content, all 193 weekly figures and every
  non-sampled worksheet item (551, keys visible) were split by week into six
  review lanes. They used the same brief and the same no-source rule. They were
  told not to check sampled items or report their answers. Two lanes
  accidentally printed one sampled key each into their own context (`cm-w07-a1`
  and `cm-w13-a1`) and reported nothing from them. The reviewer solved every
  blind item personally. The reviewer re-checked every lane finding against the
  source before adopting it, and set severities on one scale. Answer-changing
  teaching errors are blocking. Wrong justifications of correct results,
  impossible or ambiguous givens, pacing breaks, requirement gaps and misdrawn
  figures are should-fix.
- **Figures.** Every SVG was rasterized with `/usr/bin/chromium --headless
  --screenshot` in two-column galleries, with row height taken from each
  viewBox, and compared with its setup, its alt text and the items using it. 52
  figures were also rendered on a dark background.
- **Read-only gates.** `node tools/check-ap.js --complete` passed (3 courses,
  26 assessments, 2 references). `node tools/check-weekly.js --complete`
  passed.

## Scope completed

| Component | Required | Completed |
| --- | --- | --- |
| Weekly worksheets, blind | 1 item per sheet, 108 | 108 (36 weeks × A/B/C) |
| Practice exam, blind | 42 MC + 4 FR | 42 MC + 4 FR (20 parts, written solutions) |
| Unit tests, blind | every item | all 12 MC and both FR in each of the 7 tests (84 MC, 14 FR, 64 parts) |
| Explanations, examples, day plans | all | 36 weeks: 145 paragraphs, 105 worked examples, 180 day plans; 1,581 scripted numeric checks |
| Rubrics | all FR | all 18 assessment FR (rows sum to parts; items total 10, 12, 10 or 8); all 116 weekly FR rubrics sum |
| Figures | all | 243/243 in light mode (193 weekly, 50 assessment, including 15 answer-only); 52 in dark mode |
| Extra checks after the keys were visible | — | 551 non-sampled worksheet items; key letter against answer text for all 272 MC (0 mismatches); all 126 assessment distractor notes recomputed (2 errors, S3); distractor spacing against rounding; topic coverage (41/41 in weeks and tests); week standards against the plan schedule (36/36); separation-of-variables scan of every field in every week |

## Blind agreement

| Set | Items | Agree | Key error | Ambiguous item | Reviewer error |
| --- | ---: | ---: | ---: | ---: | ---: |
| Weekly sample | 108 | 107 | 0 | 0 | 1 |
| Practice exam MC | 42 | 42 | 0 | 0 | 0 |
| Practice exam FR | 4 (20 parts) | 4 (20) | 0 | 0 | 0 |
| Unit-test MC | 84 | 84 | 0 | 0 | 0 |
| Unit-test FR | 14 (64 parts) | 14 (64) | 0 | 0 | 0 |
| **Total** | **252** | **251** | **0** | **0** | **1** |

- **Reviewer error, `cm-w24-b5`.** The blind formula
  v = √(2gh/(1 + M/2m)) was right, but the scratch script evaluated it as
  √(gh) = 2.71 m/s. The key's 3.8 m/s (3.83) is correct.
- **`cm-pe-fr3`(c).** Two of the key's five 1/v values are one unit high in the
  last digit (S1). The blind values agree within the course's ±1 tolerance, so
  this part counts as agreeing.
- **`cm-pe-fr4`.** The blind solution agreed but flagged the "smooth-walled"
  wording (S8).

## Findings

| ID | Severity | Location | Finding | Evidence | Proposed fix |
| --- | --- | --- | --- | --- | --- |
| B1 | blocking | Week 24 explanation ¶3 (last sentence) and day 3. Related wording in week 8 ¶2 | ¶3 says: "When the torque changes sign, the angular speed is largest at the angle where the net torque is zero." That holds only when the torque changes from aiding the rotation to opposing it. When it changes the other way, the angular speed is least there. Day 3 repeats the rule. Week 8 ¶2 states the linear version ("the greatest speed comes where the force changes sign"); it is limited only by the clause before it. No key depends on the false case, because every item starts from rest. | Counterexample: I = 0.50 kg·m^2, ω_0 = 10 rad/s, τ = −3.0θ + 0.50θ^2 N·m. Then ω^2 = 100 + 4∫τ dθ gives ω = 10.0, 5.29 and 7.57 rad/s at θ = 0, 6 and 8 rad: a minimum at θ = 6 rad, where τ = 0. | ¶3 last sentence: "Where the net torque passes through zero and changes sign, the angular speed has an extreme value: it is greatest where the torque changes from speeding the body up to slowing it down (as for a body released from rest), and least where it changes the other way." Day 3: "…the angular speed is greatest where the net torque changes from speeding the body up to slowing it down." Week 8 ¶2: "…so, for an object moving in +x, the speed is greatest where the force changes from positive to negative." |
| B2 | blocking | Figure `cm-w27-f2` (week 27 explanation) | The vertical axis is titled "energy (units of GMm/R)". The plotted curves are K = R/r, U = −2R/r and E = −R/r, so at r = R the graph reads K = GMm/R and U = −2GMm/R. Week 27 ¶2 correctly gives U = −GMm/r and K = GMm/(2r). A student reading values off the graph learns energies twice too large. The figure also has three legibility problems: the axis name renders as "r/F", the E curve strikes through tick labels 3–6, and the E label sits on its curve. | Polyline coordinates: the axis has 55 px per unit and zero at y = 114.5. At r/R = 1, K is drawn at y = 59.5 (+1), E at 169.5 (−1) and U at 224.5 (−2). | Retitle the axis "energy (units of GMm/(2R))". The curves then match K = GMm/(2r), U = −GMm/r and E = −GMm/(2r) exactly. For legibility: widen the viewBox to `0 0 460 282`, move the tick labels below the frame, and move the E label off its curve. A lane render of this layout is `lane-w25-30/fixcheck/cm-w27-f2-fixed.svg`. |
| S1 | should-fix | `cm-pe-fr3`(c): answer, rubric row 1 and the alt text of key figure `cm-pe-f12`; (d) values | The rubric tells scorers to look for 1/v = 1.25, 2.04, 2.86, 3.68 and 4.52 s/m. From the table, 1/0.808 = 1.238 and 1/0.351 = 2.849. A student who computes correctly writes 1.24 and 2.85, which do not match the row literally. | Recomputed. The least-squares fit of the correct values gives slope 16.42 s/(m·kg), intercept 0.403 s/m, P = 0.597 W and f = 0.240 N. | Replace the list with "1.24, 2.04, 2.85, 3.68 and 4.52 s/m" in the answer, rubric row 1 and the `cm-pe-f12` alt ("from (0.050, 1.24)"). In (d), write "intercept of about 0.40 s/m" and "f ≈ 0.24 N"; the accept ranges stay. |
| S2 | should-fix | `cm-u3-fr1` | The "winch's horizontal pull" F(x) = 40 − 8.0x is negative for x > 5.0 m, so over the last meter the rope would have to push. Part (a) silently includes that −4 J. | ∫ from 5 to 6 of (40 − 8.0x) dx = −4.0 J. | Change the domain and every "6.0 m" to 5.0 m: "for 0 ≤ x ≤ 5.0 m", "from x = 0 to x = 5.0 m", "over the same 5.0 m", "at x = 5.0 m". Then (a) W = 200 − 100 = 100 J. (b) W_f = −(5.88 N)(5.0 m) = −29.4 J (−29 J). (c) ½mv^2 = 70.6 J, v = 8.4 m/s (accept 8.3–8.5). (d) and (e) are unchanged (4.27 m and 8.5 m/s; 173 W), and x = 4.27 m still lies inside the interval. |
| S3 | should-fix | Distractor notes: `cm-pe-mc16` C, `cm-u4-mc05` D | Each note's stated mistake does not produce its distractor. `mc16` C (−50 J) is said to multiply the final force by the displacement, but that gives (−50 N)(0.50 m) = −25 J, choice A's value. `u4-mc05` D (1.2 N) is said to multiply the impulse by the time, but 6.0 N·s × 0.050 s = 0.30. | Recomputed. The other 124 notes reproduce their values. | `cm-pe-mc16` C: "This is the spring's force at x = 0.50 m, −kx^3 = −50 N, reported as the work." `cm-u4-mc05` D: "This divides the impulse by 5.0 s instead of 0.050 s." |
| S4 | should-fix | Formula reference, group "Rotation", the standard-shapes row | The row reads "Thin hoop MR^2; solid disk or cylinder ½MR^2; …", described as "about their symmetry axes". A diameter is also a symmetry axis of a hoop or disk, where the values are ½MR^2 and ¼MR^2. `cm-pe-mc29` (hoop about a diameter) uses MR^2 as its main distractor. | Reference text. | Relation: "Thin hoop MR^2 and solid disk or cylinder ½MR^2, about the central axis perpendicular to the flat face; solid sphere (2/5)MR^2 and thin spherical shell (2/3)MR^2, about a diameter; thin rod (1/12)ML^2 about its center and (1/3)ML^2 about one end, perpendicular to the rod". Meaning: "Rotational inertias of uniform shapes about the stated axes; for any other axis, integrate ∫r^2 dm or use the parallel-axis theorem." |
| S5 | should-fix | Lab note. Weeks 5, 10 and 11: explanation ¶3 or ¶4 and worksheet C directions. Unit tests 1, 4 and 6: Section II directions and the investigation FR (`cm-u1-fr2`, `cm-u4-fr1`, `cm-u6-fr2`) | `docs/ap-courses.md` requires saying, wherever investigations appear, that they do not satisfy the lab requirement, the AP Course Audit or college lab-credit evidence. These places give only the first part. Weeks 14, 17, 23, 26, 30, 32, 35 and 36 and the practice exam include the full note. | Text scan: "Course Audit" appears 0 times in weeks 5, 10 and 11 and in unit tests 1, 4 and 6. | Weeks: end each sentence "…calls for, and it does not count toward the AP Course Audit or college lab credit." (¶4 of week 10: "they do not count"). Unit tests: append ", and they do not count toward the AP Course Audit or college lab credit" to the Section II sentence and to each FR's opening sentence. |
| S6 | should-fix | Week 12 explanation ¶4; `cm-w12-b5` answer and steps | The work–energy derivation writes "F_net dx = m v dv" and integrates each side in its own variable. That is the separation-of-variables move, which Calculus AB teaches in week 24; the substitution behind it is AB week 21. Week 8 ¶3 already does this correctly through d(½v^2)/dx. | Quoted text. The rest of weeks 1–23 has no separation step (scan of every field). | ¶4: "With a = v dv/dx = d(½v^2)/dx (the chain rule), the second law reads F_net = m d(½v^2)/dx; integrating both sides with respect to x from x_i to x_f gives ∫ from x_i to x_f of F_net dx = ½mv_f^2 − ½mv_i^2 by the fundamental theorem." `cm-w12-b5` answer: "F_net = m v dv/dx = m d(½v^2)/dx. Integrating with respect to x from x_i to x_f gives ∫ F_net dx = ½mv_f^2 − ½mv_i^2, which is W_net = ΔK." Steps: "a = (dv/dx)(dx/dt) = v dv/dx, and v dv/dx is the derivative of ½v^2 with respect to x" / "Integrate both sides over x; by the fundamental theorem the right side is the change in ½mv^2." |
| S7 | should-fix | Calculus used before it is taught: `cm-w01-a6`(c) and `cm-w01-c1` (week 1); `cm-w04-c5`; `cm-w09-a6`(b); week 13 ¶2 and `cm-w13-a4` | Each item needs a tool that no earlier week teaches, and Calculus AB reaches it later. Week 1 items find a maximum from a sign change of the derivative (AB weeks 14–15). `cm-w04-c5` differentiates (4000 − 8.0t)^2, which is the chain rule (AB week 9), and minimizes (AB week 16). `cm-w09-a6` uses local linearization, Δg ≈ (dg/dr)h (AB week 13). Week 13 evaluates an integral from ∞ (not in AB at all) without saying why the term at ∞ vanishes. | Searches of the teaching text of earlier weeks; the Calculus AB schedule in `content/ap.json`. All keys are correct. | Week 1 ¶2, append: "The sign of a derivative tells whether a quantity is increasing (positive) or decreasing (negative), so a quantity can be greatest only where its derivative is zero or at an end of the interval: v is greatest where a = dv/dt changes from positive to negative, and you compare that value with the values at the ends." (Checked against a6, 6.4 m/s at 8/3 s, and c1, 9.0 m/s at 3.0 s.) `cm-w04-c5` step 2: "Expand: d^2 = 100t^2 − 64000t + 1.6 × 10^7 (m^2). The distance is smallest when d^2 is smallest, where d(d^2)/dt = 200t − 64000 = 0, so t = 320 s; the derivative changes from negative to positive there." `cm-w09-a6`(b): "For a small change h in r, Δg ≈ (dg/dr)h. Use this with dg/dr at r = R to show…". Week 13 ¶2: "…choosing U = 0 at infinite separation gives U(r) = −∫ from ∞ to r of (−GMm/s^2) ds = GMm[−1/s] from ∞ to r = −GMm/r, because 1/s shrinks to 0 as s grows without bound." `cm-w13-a4` step 1: add "(−5.0/s → 0 as s → ∞)". |
| S8 | should-fix | Impossible or ambiguous setups: `cm-w11-b6`, `cm-w02-c5`, `cm-w10-c6`, `cm-pe-fr4` | **`cm-w11-b6`**: a bob passing the bottom of a 1.5 m pendulum at 3.0 m/s cannot move at 2.4 m/s at 30°. **`cm-w02-c5`**: the return speed assumes the same acceleration on the way down, which the prompt never states. **`cm-w10-c6`**: "locate each time to within ±0.02 s" gives ±0.04 s for an interval, but the key uses ±0.02 s. **`cm-pe-fr4`**: a "smooth-walled" bowl conventionally means frictionless, which contradicts rolling without slipping. | `cm-w11-b6`: the 30° point is 0.201 m up, so v ≤ √(9.0 − 3.94) = 2.25 m/s. The other three are text readings. | **`cm-w11-b6`**: change 2.4 m/s to 2.2 m/s. Then (b) T = 0.50(8.49 + 3.23) = 5.9 N (5.86 N), and rubric row 3 reads "5.9 N (accept 5.8–5.9 N)"; a_t is unchanged. **`cm-w02-c5`**: "A cart rolls up a straight, low-friction ramp, passing the bottom at 3.0 m/s. Its acceleration is a constant 1.5 m/s^2 directed down the ramp, both going up and coming back down." The answer is unchanged. **`cm-w10-c6`**: "The video gives each stack's time over the 0.50 m section to within ±0.02 s." The key is unchanged (8% and 16%). **`cm-pe-fr4`**: "…near the bottom of a spherical bowl of radius R, with enough friction that it never slips, so that…". |
| S9 | should-fix | Wrong justification in teaching text: week 4 ¶3; week 26 ¶3 and the `cm-w26-b6`(a) answer | **Week 4 ¶3** calls any two frames moving at constant velocity relative to each other "inertial frames". Two cars braking identically qualify, and week 7 ¶3 defines inertial frames correctly. **Week 26 ¶3** says the normal force exerts no torque about a fixed point on the floor. Once the ball has moved a distance x, τ_N = Mgx; it cancels gravity's torque. The conclusion, conservation of angular momentum about that point, is right; the `cm-w26-b6` rubric states the cancellation but its answer does not. | Quoted text and the torque about a fixed point P. | **Week 4 ¶3**: "…so they also agree about forces. A frame that is not accelerating is an inertial frame (Newton's laws hold in it), and any frame moving at constant velocity relative to an inertial frame is also inertial." **Week 26 ¶3**: "…Friction acts along the floor through P, so it has no torque about P, and the normal force and gravity are equal, opposite forces on the same vertical line, so their torques about P cancel. The ball's angular momentum about P, Mv_cmR + I_cmω, is therefore conserved while it skids." **`cm-w26-b6`(a)**: "Friction acts in the floor plane through the line of contact (no torque), and the normal force and gravity are equal, opposite and collinear (their torques cancel), so the net torque about that line is zero." |
| S10 | should-fix | Misdrawn figures: `cm-w01-f1`, `cm-w04-f4`, `cm-w18-f2`, `cm-w24-f2`, `cm-w18-f4` | **`cm-w01-f1`**, the course's first teaching figure: the "secant" label sits at the end of the solid tangent line. **`cm-w04-f4`** (answer figure, week 4 Example 3): the heading angle is drawn at 31.6°, against the key's 49° (48.6°). **`cm-w18-f2`** (ballistic pendulum): the swung-up strings are shorter (107 against 130 units) and hang from shifted pivots. **`cm-w24-f2`**: the dashed "hanging" copy of the rod is 63% of the rod's length. **`cm-w18-f4`**: the 12 m/s wreck arrow is longer than both incoming arrows, which were faster; `notToScale` is not set. | Renders and SVG coordinates. | **`cm-w01-f1`**: move the label to `x="165" y="175" text-anchor="end"`. **`cm-w04-f4`**: redraw at 48.6° with the v_WG : v_BW ratio of 0.75 (`lane-w01-06/fixes/make-w04-f4.js`), or at least set `notToScale`. **`cm-w18-f2`**: keep the pivots and the 130-unit strings (`lane-w13-18/cm-w18-f2-fixed.svg`). **`cm-w24-f2`**: change the viewBox to `0 0 320 310` and the copy's polygon to `55,70 65,70 65,300 55,300`. **`cm-w18-f4`**: add `"notToScale": true`. The reviewer applied the `cm-w01-f1` and `cm-w24-f2` changes to scratch copies, rendered them and ran `tools/figure-kit.js check`: both were admitted. The lanes did the same for the other fixes. |
| S11 | should-fix | `cm-w33-b1` (scoring practice) | The model scoring gives the "solving" row to a response whose own quadratic, 4.9t^2 + 12t + 8.0 = 0, has no positive root. The response then changes the sign of 8.0 to force a root. That rewards solving a different equation, against week 33 ¶4's own caution. | Item text and key. | Answer: "0 points. The equation gives gravity the wrong sign, so row 1 is not earned. The response then abandons its own quadratic and solves a different one, so row 2 is not earned, and the final time is wrong. Correct: −8.0 = 12t − 4.9t^2, so t = 3.0 s (2.99 s)." Step for row 2: "When its equation had no positive root, the response changed the equation instead of rechecking its signs; solving a different equation does not earn the solving row." |
| S12 | should-fix | Directions of 36 sheets, weeks 24–36 | The template reads "Give directions and slopes in degrees", but these sheets ask for graph slopes with units: −0.24 s^−1 in `cm-w35-a3`, −0.025 s^−1 in `cm-w35-b3`, −0.12 s^−1 in `cm-w36-b3`, and s^2/kg in week 33. It contradicts the course's convention. | Directions scan: 36 sheets (24a … 36c). | "Give directions and incline angles in degrees, and graph slopes with their units;" |
| N1 | note | Key letters | Every unit test keys exactly 3 of each letter, which a test-wise student can exploit. Weekly MC keys favor B (57 of 146, 39%) over D (21, 14%). The 16 non-sampled MC in weeks 25–30 have no D key. The practice exam's split (A 11, B 10, C 11, D 10) is fine. | Key tally. | Allow 2–4 keys per letter on unit tests. Rebalance some weekly keys, for example `cm-w26-a3`, `cm-w27-b4` and `cm-w29-c5`. |
| N2 | note | Unit-test timing | Each unit test gives 35 minutes to 20–22 free-response points. The exam's suggested times for the same question types total 40–55 minutes (MR 20–25, TBR 25–30, EDA 25–30, QQT 15–20). The MC pace (12 in 25 minutes) matches the exam. | Section data; `content/ap.json` exam note. | Give Section II 45 minutes (70 minutes in all, the plan's maximum). |
| N3 | note (low confidence) | Resemblance screen | No free-response question or investigation matched a released question at medium or high confidence in the reviewer's memory. Low-confidence echoes, structure only: the falling coffee-filter terminal-speed investigation (week 10 sheet C); the ring dropped on a spinning turntable to find I_0 (`cm-u6-fr2`); coins at two radii on a turntable (`cm-u2-fr2`); repelling magnet carts with a force sensor (`cm-pe-fr2`); a ball rolling in a bowl compared with a pendulum (`cm-pe-fr4`); the spool-and-platform torque investigation (week 23 sheet C); and the rod pendulum linearized as T^2d against d^2 (week 30 sheet C). All are common classroom or textbook designs. | Memory only; no source consulted. | A person who can legitimately consult the released questions should check this list. If any match closely, rework the structure, for example a linear-drag investigation with spheres sinking in glycerin in place of the coffee filters. |
| N4 | note | Precision and unit slips in keys | **Units**: `cm-w18-c2` step "hypotenuse 2.0 m (per unit mass)" should be 2.0 m/s; zero answers have no unit in `cm-w19-a6`, `cm-w20-a5`, `cm-w20-b6`, and function answers in `cm-w01-c6`(a), `cm-w05-a6`(a) and `cm-w06-b6`(a). **Arithmetic**: `cm-w14-b1` "1176 − 608 = 568" (568.5 J); week 13 Example 3 "about 4%" (4.6–4.7%); `cm-w30-c4` "39.5/4.06 = 9.71" (4π^2/4.064 = 9.71). `cm-w35-c5`: 124 N is the net average force; the floor exerts 125 N. **Precision**: week 31 Example 1 mixes 2 and 3 significant figures; `cm-w25-b4` −14.7 and `cm-w27-b5` 2.98 × 10^10 come from 2-figure givens; `cm-w33-a5` gives h = 0.60 m but choices 2.80 and 2.90 m (use 0.600 m). | Recomputed. | Correct as indicated. |
| N5 | note | Teaching-text wording | Week 1 Example 2: the drone dips 4.6 m below its launch pad (h < 0 for 2 < t < 4 s); say the pad is on a 6.0 m platform and add 6.0 to h(t). Week 1 ¶3: give the reason for the FTC. Week 2 ¶3 and the reference: t is both the limit and the variable of integration. Week 6 ¶2: wording about the origin. Week 9 ¶2: a missing "that". Week 10 ¶2–3: τ is used before it is defined, and a numeric check is said to confirm the result "for any value of t". Week 15 ¶2: "speeds the object up" holds only for the net force. Week 16 ¶4: "doubles Δp rather than cancelling it". Week 17 ¶2: the boat must start at rest. Week 23 ¶2: "slows the block" should be "holds back the block". Week 30 ¶1: the 0.5% and 5% figures are errors in sin θ; the period errors are 0.2% and 1.7%. Week 32 Example 1: a block "resting at the axis" cannot slide out unless nudged. Week 36 ¶2 and `cm-w36-b6`: say shocks are tuned "usually a little below critical". | Lane reports, re-read by the reviewer. | As described; none changes a key. |
| N6 | note | Rubric and key wording | `cm-w10-b6` rubric row 5 rewards units only. `cm-w19-b6` row 4 calls the error "averaging endpoints"; it averages 0 and the maximum. `cm-w22-b3` choice B can be read as N_L ∝ x. `cm-w23-c7` gives the intercept for the wrong plot. `cm-w24-a5` step: "double" needs "4 × one ball". `cm-w07-c2`(c) reasoning about when a team moves. `cm-w08-a2`(b) wording. `cm-w15-c5`: φ is undefined. `cm-w23-a2`: add "opposite the rotation". `cm-w28-b6`: "ky = mg" should be kΔy. Week 25 Example 3 and `cm-w25-b6` use L for both length and angular momentum. `cm-w25-a4` says the core collapses but treats the whole star. | Lane reports, re-read. | Reword as in the lane reports; none changes a point total. |
| N7 | note | Sign conventions | Week 17 Example 3, `cm-w17-b4` and `cm-w18-b6` key signed values without stating a positive direction (their answers carry words, so they are not ambiguous). The week 24–26 directions drop the counterclockwise-positive default that weeks 19–23 state. | Item and direction text. | Add "Take the walking direction / the throw / the 1.0 kg cart's initial direction as positive", and restore the week 19–23 rotation sentence. |
| N8 | note | Thin coverage | Escape speed is taught in week 14 but not revisited in week 27 (CM.6.6). Week 35 uses an infinite geometric-series sum (not in AB) without stating it. Week 30 day 5 promises a Unit 7 review sheet that does not exist. | Week text. | Week 27 ¶2: "An object escapes if E ≥ 0; at radius r this needs v ≥ √(2GM/r), √2 times the circular-orbit speed." Week 35 ¶3: "(1 + e + e^2 + … = 1/(1 − e) for 0 < e < 1)". Week 30 day 5: "Unit 7 test, after reviewing worksheets from weeks 28–30." |
| N9 | note | Repeated designs within the course | **Week 12 against week 8**: `cm-w12-b6` ≈ `cm-w08-c2` and `cm-w12-b2` ≈ `cm-w08-c3`; week 12 Example 2 reuses week 8 Example 2's 6.0s − 1.5s^2. **Other number swaps**: `cm-w03-a4` ≈ `cm-w03-a1`; `cm-w15-c6` repeats `cm-w15-b2` in parts (a) and (c); `cm-w27-a5` ≈ week 27 Example 2; `cm-w30-b2` ≈ `cm-w30-c5`; `cm-w25-b3` ≈ `cm-w23-b4`; `cm-w31-a5` ≈ week 10 Example 1 (same b = 0.050 kg/s). The review-week reuses (weeks 31–36) are acceptable practice. | Lane comparisons. | Vary the unknowns or the representation. |
| N10 | note | Figure legibility | **Curves through tick labels**: `cm-w13-f2`, `w13-f4`, `w18-f3`, `w25-f2`, `w29-f1`, `f2`, `f3`, `f5`, `f7`, `cm-u7-f2`, `u7-f3`, `u7-f4`. **Axis names past the viewBox** (hidden by `overflow: visible` in the reader but clipped elsewhere): `cm-w05-f1`, `w12-f1`, `f3`, `f4`, `w13-f1`–`f6`, `w28-f3`. **Labels over lines**: `cm-w06-f4`, `w20-f4`, `w21-f1`, `w21-f4`, `w21-f5`, `w21-f6`, `w26-f1`, `w27-f1`, `w34-f3` (the "x" reads as labelling the hypotenuse). **Arrows on lines**: `cm-w05-f1` launch components, `w22-f7` H_x, `w27-f1` v_a. **Arrow lengths against speeds**: `cm-w04-f2`, `w18-f1`. **Geometry**: `cm-w32-f2` draws the string at 35.7° on a 30° ramp; `cm-w09-f4` (key) draws f_k at 0.50 F_g against 0.22. **Missing labels in key figures**: `cm-w03-f8` and `cm-w29-f7`. **Scale**: `cm-w05-f1` has unequal axis scales, so the 50° launch looks like 64°. | Renders. | Offset the labels, widen the viewBoxes (for example 374 → 380 units), and set `notToScale` where arrow lengths are schematic. |
| N11 | note | Alt text | **Describes what is not drawn**: `cm-w11-f4` (a student), `cm-w14-f4` (a force probe), `cm-w25-f6` (a hand), `cm-w36-f1` (a length label). **Omits what is drawn or is inaccurate**: `cm-w12-f2` omits "T = 50 N"; `cm-w22-f4` puts the mast above the hinge, but it is drawn to its left; `cm-w29-f6` gives tick spacing as 0.5 s, but the labels are 1 s apart. **Too little to answer from**: `cm-w01-f3` (for `a5`) and `cm-u7-f1` (no period) leave a screen-reader user unable to answer. **Answer-adjacent**: `cm-w13-f2` gives `b1`'s minimum, and `cm-pe-f3` calls S's rise "steep"; both describe what is drawn, so this is a design choice. | Renders against alt text. | Correct each alt. For `cm-u7-f1`: "a cosine curve of period 2.0 s starting at its maximum; P and R are where it crosses zero, Q is at its minimum and S at its next maximum." |
| N12 | note | Minor inconsistent setups | `cm-w24-b3`: a wheel "from rest" with K = 0.40θ^2 can never start (ω = 2.0θ). Make it "from θ = 1.0 rad to 6.0 rad"; the answers are unchanged. `cm-w09-c2` says the parallel-spring load sits where the bar stays level "as in the figure", but `cm-w09-f3` draws it centered while k_1 ≠ k_2. | Lane checks, re-read. | As described. |
| N13 | note | Notation and boilerplate | `cm-w35-c2` writes "Δt_(n+1)", which the renderer prints literally (its only `_(` in the course); write "Δt_2 = eΔt_1, Δt_3 = eΔt_2, and so on". Investigation directions repeat themselves ("Paper investigation. This is a paper investigation…"). The reference's prefix line "k = 10^3, M = 10^6, m = 10^−3, μ = 10^−6" reuses k, M, m and μ, which are symbols in the same sheet. | Text scan. | Drop the leading "Paper investigation."; write the prefixes as "kilo (k) 10^3, mega (M) 10^6, milli (m) 10^−3, micro (μ) 10^−6". |
| N14 | note | Investigation item dependencies | Several investigation tasks depend on earlier tasks in the same sheet: `cm-w14-c7`, `cm-w23-c6`, `cm-w30-c6`, `cm-w32-c5`, `cm-w35-a5`, `cm-w35-b6`, `cm-w35-c3`, `cm-w36-b5` and `cm-w36-c6`. This is natural for an investigation. `cm-w35-b5` and `cm-w36-b5` restate their parameters, so a student can recover. | Student sheets. | State the needed values where a later task can stand alone, as `cm-w35-b5` does. |

## Rubrics

- **Practice exam.** Points per question: FR1 (MR) 2+2+3+2+1 = 10, FR2 (TBR)
  2+2+3+2+2+1 = 12, FR3 (EDA) 2+2+2+2+2 = 10, FR4 (QQT) 2+3+1+2 = 8, for 40
  points. Every rubric row sums to its part.
  - Rows credit setups: Newton's second law in v dv/dx form, impulse as area,
    the linearized relation, and energy with the rolling constraint.
  - Rows credit justifications: third-law pairs, closest approach and greatest
    force, the drift of slope with a weakening battery, and the 7/5 factor.
  - Accept ranges are stated for fitted values.
  - The only issue is S1.
- **Unit tests.** All 14 FR total their type's points (MR 10, TBR 12, EDA 10,
  QQT 8), and every row sums to its part.
  - Each type appears in at least three tests: MR 3, TBR 4, EDA 3, QQT 4.
  - `cm-u4-fr1`(d) accepts either a calibration or a friction explanation.
  - `cm-u5-fr1`(a) correctly expects the axle force to have a tangential
    component, 0.30 N in F's direction at t = 1.0 s.
  - S2 is the only flaw.
- **Weekly.** All 116 FR rubrics sum to their points. N6 lists the wording
  issues; the one row that rewards units only is `cm-w10-b6` row 5.

## Teaching content

| Weeks | Topics checked | Result |
| --- | --- | --- |
| 1 (toolkit) | CM.TOOLKIT: derivative as rate, accumulation as area, antiderivatives, units | Correct and well grounded in motion. S7: the extremum test is used but not taught. S10: `cm-w01-f1`. |
| 2–5 (Unit 1) | 1.1–1.5 | Correct. S9 (week 4 ¶3), S7 (`cm-w04-c5`), S8 (`cm-w02-c5`), S10 (`cm-w04-f4`), S5 (week 5). |
| 6–11 (Unit 2) | 2.1–2.10 | Correct. The continuous center of mass in week 6 is prepared by week 1 and taught by slicing. Week 8 builds ½v^2 − ½v_0^2 = (1/m)∫F dx through the chain rule. Week 10 verifies v_T(1 − e^(−t/τ)) by substitution and never separates variables. Issues: S7 (`cm-w09-a6`), S8 (`cm-w10-c6`, `cm-w11-b6`), S5 (weeks 10, 11). |
| 12–15 (Unit 3) | 3.1–3.5 | Correct. Issues: S6 (week 12 ¶4), S7 (week 13's integral from ∞). |
| 16–18 (Unit 4) | 4.1–4.4 | Correct, including the 2D elastic collisions. S10 (`cm-w18-f2`, `f4`). |
| 19–23 (Unit 5) | 5.1–5.6 | Correct. Cross-product signs follow the right-hand rule. Every ∫r^2 dm was recomputed, including nonuniform λ and σ = kr, and the parallel-axis results agree. |
| 24–27 (Unit 6) | 6.1–6.6 | B1 (week 24 ¶3), B2 (`cm-w27-f2`), S9 (week 26 ¶3), S10 (`cm-w24-f2`). Rolling, angular-momentum and orbit calculations are otherwise correct. |
| 28–30 (Unit 7) | 7.1–7.5 | Correct. SHM is defined by d^2x/dt^2 = −ω^2x and checked by substitution; the physical-pendulum fits were recomputed. |
| 31–34 (review, practice exam) | CM.REVIEW | Correct cumulative mechanics. Week 33 reports raw points only. S11 (`cm-w33-b1`). |
| 35–36 (beyond the exam) | CM.SYNTHESIS | Original data. Every fit, residual and model value recomputes, and separation of variables is correct (drag, rotor, rocket). Week 36 sheets are labeled "Beyond the exam … not exam content". |

### Calculus pacing against Calculus AB

| C:M weeks | Calculus used | AB week | Taught in physical context | Separation of variables |
| --- | --- | --- | --- | --- |
| 1 | Rate as derivative, power, sum and second derivatives, symmetric difference, signed area, Riemann and trapezoid sums, antiderivatives with initial values, FTC | 6–8, 10, 18–21 | Yes; the extremum test is not (S7) | none |
| 2–5 | Polynomial and component derivatives and integrals; slope, area and concavity; `cm-w04-c5` chain rule and minimization | 6–7, 11, 15, 18–21; 9, 16 | Yes, except `cm-w04-c5` (S7) | none |
| 6 | ∫λ dx and ∫xλ dx; trapezoid from a table | 18–21 | Yes | none |
| 7–9 | ∫F dt; ∫F dx; a = v dv/dx through d(½v^2)/dx; power rule with negative powers; `cm-w09-a6` linearization | 6–9, 18–21; 13 | Yes, except `cm-w09-a6` (S7) | none |
| 10–11 | d/dt e^(kt); verifying a solution by substitution; ln to solve; a_t = dv/dt | 7–9, 23 | Yes | none (verification only) |
| 12–18 | ∫F dx, ∫P dt, ∫F dt; F = −dU/dx; U″; integral from ∞ | 6–10, 18–21; ∞ not in AB | Yes, except week 13's ∞ limit (S7) | Week 12 ¶4 and `cm-w12-b5` split differentials (S6) |
| 19–24 | ∫α dt, ∫ω dt, ∫r^2 dm, ∫τ dθ (including cos θ); exponential verified in `cm-w23-b5` | 6–8, 18–21, 23 | Yes | none |
| 25–30 | τ = dL/dt; trigonometric derivatives; SHM verified by substitution; d^2U/dx^2; minimizing T(d) | 6–10, 16, 23 | Yes | none |
| 31–36 | Separation of variables (drag, rotor, rocket), logarithms, field integrals, geometric series | 24 and earlier; series not in AB (N8) | Yes | Weeks 31, 35, 36: correct |

## Formula reference

- **Correctness.** Every relation, meaning and unit is correct, and the
  symbols match the course (v_T, b and c for drag, λ, I_cm, r_⊥, a_c, a_t).
  It covers what the course and its tests use: calculus facts, vectors and
  the cross product, the work–energy relations, impulse, rotation, rolling,
  orbits and oscillations. The only defect is S4; N13 notes the prefix line.
- **Organization (memory only).** The reference does not reproduce the
  organization or wording of the College Board equation sheet as the reviewer
  recalls it. It groups relations by the question they answer ("How things
  move", "Why things move: forces", …). Every relation has a plain-language
  meaning and an SI-units column, and the symbol and convention notes are
  Liminal's own. It has no variable-definition list in the College Board
  style, no trigonometric-value table and no conversion-factor table.
- **Overlap.** The calculus group necessarily overlaps any calculus summary
  (power rule, exponentials, sinusoids). It adds the chain rule, the product
  rule, the fundamental theorem and separation of variables.
- **Exam advice.** The introduction tells students that the exam supplies its
  own sheet, arranged differently, and to practise with it.

## Figures

All 243 figures use `currentColor`. They are legible on a dark background
(52 checked), and no given figure's alt text states a keyed answer.

- **Faithful.** The rest of the weekly figures (193) and assessment figures
  (50) match their setups. This includes every plotted investigation fit, the
  energy, impulse and SHM graphs, and the answer-only free-body diagrams.
  `cm-u5-f9` draws the axle force tilted 20° toward F, matching
  0.84 N radial and 0.30 N tangential at t = 1.0 s.
- **Defects.** B2 is the graph that misteaches, S10 lists the misdrawn
  figures, and N10–N11 cover legibility and alt text.
- **Gallery note.** An early gallery script cropped figures taller than about
  0.83 of their width. The reviewer re-rendered all 53 such figures with
  viewBox-based heights, and found nothing beyond N10.

## Conventions, blueprint and claims

- **Conventions.**
  - SI units are given with essentially every numeric answer (exceptions in
    N4), with g = 9.8 m/s^2 throughout.
  - Vector problems state a positive direction, with the exceptions in N7.
  - Geometric angles are in degrees and angular quantities in radians. The
    week 24–36 template's "slopes in degrees" is S12.
  - Givens carry 2–3 significant figures (exceptions in N4).
- **Lab note.** The paper-investigation note is present wherever
  investigations appear. In three weeks and three unit tests it lacks the
  Course Audit and lab-credit clause (S5).
- **Practice exam blueprint.**
  - Section I has 42 MC in 85 minutes, with unit counts 5/9/8/5/5/5/5. Each
    count lies inside its framework weighting.
  - Section II has one each of MR 10, TBR 12, EDA 10 and QQT 8 in 95
    minutes, with the exam's suggested times.
  - Key letters split A 11, B 10, C 11, D 10. The key is the unique longest
    choice in 4 of 42.
  - A calculator of any kind is allowed in both sections.
- **Unit tests.** Each has 12 MC and 2 FR of different types in 60 minutes.
  Every item's primary topic lies in its unit.
- **Claims.**
  - There is no score conversion, prediction, "pass" or "5" wording, and no
    endorsement or "official" claim. Week 33 and every assessment say that raw
    points are a practice tally, not an AP score.
  - The marks appear only as adjectives. The later "AP Course Audit" in the
    same sentence has no ®, matching the plan's `labNote`.
  - `check-ap --complete` verifies the exact disclaimer on the AP pages.
- **Copied material.** No passage, data set or number matches any College
  Board item the reviewer knows of. N3 covers structure only.

## Limits

- This is an agent review: not human editorial approval, not College Board
  endorsement, and not measured difficulty.
- **Resemblance.** The screen relied on the memories of the reviewer and the
  six lanes; no College Board material was consulted or used. A person who
  can legitimately consult the released questions should check the N3 list
  without giving that material to any agent.
- **Coverage.** The reviewer solved one item per worksheet blind. The other
  551 worksheet items were checked by delegated lanes with keys visible, and
  the reviewer adopted only findings re-verified against the source.
- **Rendering.** Figures were checked as standalone SVGs in Chromium with a
  generic sans-serif font. Rendering through the site's sanitizer and scaling,
  print output, phone width, and the formula reference appended to printed
  booklets belong to the print and code reviewers.
- **Facts.** The exam format and the 25% lab-time figure were taken from
  `units.md` and `content/ap.json` as given, not re-verified against College
  Board pages.
- **Numbers.** Numeric verification used closed forms, least-squares fits and
  numerical integration in plain Python. Agreement was required within ±1 in
  the last reported digit.

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.
