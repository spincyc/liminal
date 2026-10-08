# Course for AP® Physics 1: independent blind review

Date: 2026-10-08. Reviewer: an independent review agent that did not author
the course. The reviewer solved the practice exam and checked the formula
reference itself, and briefed and checked six delegated lanes: four for the
weekly course (weeks 1–9, 10–18, 19–27 and 28–36) and two for the unit tests
(units 1–4 and 5–8). This is an agent review. It is not human editorial
approval, not College Board endorsement, and not measured difficulty or
evidence of student outcomes.

## Verdict

| Severity | Count | Summary |
| --- | ---: | --- |
| Blocking | 1 | The key to `p1-w35-b4` teaches that air drag shortens the approach to terminal speed. Drag lengthens it. The number in the key is right. |
| Should-fix | 6 | Four teaching statements are wrong: a system definition (week 4), the condition for energy conservation (week 31), why real efflux is slower (week 29), and a liquid column drawn without its weight (`p1-w26-f1`). One test premise is impossible (`p1-u2-fr2`(c)). One alt text does not match its drawing (`p1-w16-f2`). |
| Note | 15 | Key-letter balance, distractor notes, unit-test timing, unstated sign conventions, rubric alternatives, significant figures, wording, dependent items, repeated designs, figure geometry and readability, lab-note placement, one EDA without an uncertainty part, formula-reference wording, and low-confidence resemblance. |

The physics is consistently correct. Every blind answer agreed with its key:
266 items in all, including every part of the 20 assessment free-response
questions. Every week matches its scheduled framework topics. All 43 topics
appear in the weeks and are the primary topic of at least one test item. The
formula reference is correct and organized in Liminal's own way.

## Artifacts reviewed

SHA-256 values were recorded before the review began and checked again at
the end. Nothing changed during the review. The course files are identical
at `a2dcc7f` and at `89a378b`, the branch head when the review ended; the
commits in between touch none of the files below.

| File | SHA-256 |
| --- | --- |
| `content/weekly/ap/physics-1.json` | `de4be7e1e4de7f8bd53bed118c5e63d74088a550a413e184e0db719b1c3518f1` |
| `content/ap/assessments/physics-1/practice-exam.json` | `ed98a9e220bfb522407ee393ea8fbaa0b74a035a37724dd90a33f5ac3d82d493` |
| `content/ap/assessments/physics-1/unit-1.json` | `d90b2f5278197d68b7869c370e4b9d7f9f0dde370f22c6513c410ef61459f14e` |
| `content/ap/assessments/physics-1/unit-2.json` | `e05b85c65e8f8baf9e6c66c14bd7c63bb03fcab24e254a067d0d8aba6f5a0c34` |
| `content/ap/assessments/physics-1/unit-3.json` | `8bdd99c06e5d0107d82b2f49d2bb4bd446db10b77a28faeb2969d9f17858b3d5` |
| `content/ap/assessments/physics-1/unit-4.json` | `006beba6728a966d1a5678ed98e1c5ba6d0f664d7f4f28f9b517ecdc1c47de84` |
| `content/ap/assessments/physics-1/unit-5.json` | `940fab6c1c01b068cfee5968dc81bf331b00947bec0e2bb7ae1819e4af7a2ddc` |
| `content/ap/assessments/physics-1/unit-6.json` | `91e8493b9e6c7f0f52b72b5ca73280732ded8eebac1a69c816d2288926e923c6` |
| `content/ap/assessments/physics-1/unit-7.json` | `4d00fdcde1ceb3e7fdbb45b5913261c4586e2d60e0f0b823635da2aaf8a148d0` |
| `content/ap/assessments/physics-1/unit-8.json` | `003f329ea4ab4d95e5f5b94680ade1d201eedf93858bb8a245527389e556bcc3` |
| `content/ap/references/physics-1.json` | `69dc74b97a1c11858f14bca5f11f685ffc677dc89ccde96fc11c18465711b7e8` |
| Weekly figures, 172 SVG: `(cd content/weekly/figures/ap/physics-1 && sha256sum *.svg \| sha256sum)` | `73e2c5a11792387cfb50c56aa38445791ef058a8dd90a38ad1a730c2ed67f020` |
| Assessment figures, 62 SVG: `(cd content/ap/figures/physics-1 && sha256sum *.svg \| sha256sum)` | `d3743d3a3a3765e7febab0b63933b70fb920d0a715e3ff11e587bd2f3ca67b9a` |
| Plan (reference only): `content/ap.json` | `a507bdc527536a2dc64cf01322a3627f3e920c4033d95aa6b161d537eb1eccb7` |

## Method

- **Independence.** No reviewer opened the authors' scratch lanes
  (`.scratch/ap/physics-1/`). Inputs were limited to `AGENTS.md`,
  `docs/weekly-coursework.md`, `docs/ap-courses.md`, the design and unit
  plans (`.scratch/ap-design/design.md`, `units.md`), `content/ap.json` and
  the course files themselves. No College Board documents were used, and no
  network was used.
- **Blind first.** Scratch scripts printed student-only views through the
  repository's own projections: `studentWorksheet` in `src/lib/weekly.js`
  and `studentCopy` in `src/lib/ap-assessment.js`. Those views contain no
  keys, rubrics, answers, steps, skills or answer-only figures. Given
  figures were rendered without their alt text for solving. Every lane wrote
  its blind answers to a file before it ran a key view.
- **Sample rule (fixed in advance).** For week w and sheet index s (0 = A,
  1 = B, 2 = C), the sampled item was number ((w − 1)·3 + s) mod n, counted
  from 0. This rotates item positions across the 108 worksheets.
- **Physics computation.** Every numeric answer was recomputed from the
  givens in plain Python 3 or Node (no numpy or sympy), with a units check.
  g = 9.8 m/s^2 throughout; no item in the course uses 10. Linearized data
  were fit by least squares and by two well-separated points on the line.
  Keys could differ by ±1 in the last digit.
- **Delegation.** The reviewer briefed each lane with the same rules and the
  same tools, then rechecked every blocking and should-fix finding against
  the source before recording it. Lane findings that did not hold up were
  dropped.
- **Figures.** Every SVG was rasterized with `/usr/bin/chromium --headless
  --screenshot` in two-column galleries. Each was compared with its item,
  example or explanation and with its alt text. Twenty-six figures were also
  rendered on a dark background.
- **Read-only gates.** `node tools/check-ap.js --complete` passed (exit 0;
  3 courses, 26 assessments, 2 references). `node tools/check-weekly.js
  --complete` passed (exit 0).

## Scope completed

| Component | Required | Completed |
| --- | --- | --- |
| Weekly worksheets, blind | 1 item per sheet, 108 | 108 (36 weeks × A/B/C) |
| Practice exam, blind | 42 MC + 4 FR | 42 MC + 4 FR (16 parts, written solutions) |
| Unit tests, blind | every MC and FR | all 12 MC and both FR in each of the 8 tests (96 MC, 16 FR, 62 parts) |
| Explanations, examples, day plans | all | 36 weeks: 144 paragraphs, 106 worked examples, 180 day plans; every numeric claim recomputed |
| Rubrics | all FR | all 20 assessment FR (rows sum to part points; parts sum to MR 10, TBR 12, EDA 10, QQT 8); all 146 weekly FR rubrics summed and read |
| Figures | all | 234/234 inspected in light mode (172 weekly, 62 assessment); 26 also in dark mode |
| Formula reference | all | 9 groups, 61 rows: every relation, meaning and unit checked |
| Extra checks after the keys were visible | — | All 712 worksheet items read with their keys, with numeric answers recomputed (604 beyond the blind sample, including all 114 items tied to figures). Key letter against answer text for all 175 weekly MC: 0 mismatches. All 138 assessment MC keys checked against their rationales: 0 mismatches. All 414 assessment distractor notes recomputed (11 do not reproduce their choice; N2). Distractor spacing against rounding. Topic coverage: 43/43 topics in weeks and tests. Week standards against the plan schedule: 36/36 match. |

## Blind agreement

| Set | Items | Agree | Key error | Ambiguous item | Reviewer error |
| --- | ---: | ---: | ---: | ---: | ---: |
| Weekly sample | 108 | 108 | 0 | 0 | 0 |
| Practice exam MC | 42 | 42 | 0 | 0 | 0 |
| Practice exam FR | 4 (16 parts) | 4 (16) | 0 | 0 | 0 |
| Unit-test MC | 96 | 96 | 0 | 0 | 0 |
| Unit-test FR | 16 (62 parts) | 16 (62) | 0 | 0 | 0 |
| **Total** | **266** | **266** | **0** | **0** | **0** |

Four agreements need a remark:

- `p1-u2-fr2`(c): the blind answer matched the key (2mg) only because the
  part states its premise. That premise is impossible (S2).
- `p1-u4-fr1`(d): the blind answer was 0.77 kg against the key's 0.74 kg,
  inside the key's accepted range of 0.69–0.82 kg.
- `p1-w29-c3`: the blind slope was 1.09 m against the key's 1.08 m.
- `p1-w35-c3`: the blind answer used ln A against swings, and the key uses
  the line from item c2. Both give 0.775, 0.60 and about 10%.

The blocking error in `p1-w35-b4` is in an item outside the blind sample. It
was found when the lane read every key.

## Findings

| ID | Severity | Location | Finding | Evidence | Proposed fix |
| --- | --- | --- | --- | --- | --- |
| B1 | blocking | `p1-w35-b4` (week 35, sheet B), answer and step 2 | The key says that drag shortens the approach to terminal speed and that the real filter reaches it "sooner" than a drag-free filter. Drag lowers the acceleration below g, so it lengthens the approach. The answer also contradicts itself: "sooner, within 0.3 m" is set against a drag-free 6.2 cm. The number, 0.062 m, is right. | Answer: "since even a drag-free filter reaches the terminal speed within a few centimeters, the real filter (which reaches it sooner, within 0.3 m) is moving steadily…". Step 2: "Drag only shortens the approach to terminal speed". With F = cv^2 and v_t = 1.12 m/s, the distance to reach 1.1 m/s is (v_t^2/2g)·ln[1/(1 − v^2/v_t^2)] = 0.214 m, against 0.062 m without drag. | Answer: "About 0.062 m (6.2 cm). Drag makes the filter's acceleration smaller than g, so 0.062 m is only a lower bound: the real filter takes longer to approach 1.1 m/s (about 0.2 m with quadratic drag), consistent with the video's 0.3 m. That still ends long before the last 1.0 m of the 2.0 m drop begins, so the speed timed there is the terminal speed." Step 2: "Drag reduces the acceleration below g, so the approach takes longer than without drag, not shorter. The video shows that it ends within 0.3 m, well before the timed last meter begins at 1.0 m." |
| S1 | should-fix | Week 4, example 3 (key A) | The system is "the truck and the car together", which leaves the cable out. The key still calls the cable's pull on the car internal. Its own step 1 rule ("both interacting objects are in the system") makes that force external. Item `p1-w04-c6` handles the string correctly. | Prompt: "Take the system to be the truck and the car together." Step 2: "The cable joins truck and car, both in the system, so its pull on the car is internal (its partners act within the system too)." | Prompt: "Take the system to be the truck, the cable and the car together. Which force is internal to this system?" Step 2: "The cable and the car are both in the system, so the cable's pull on the car is internal; its third-law partner, the car's pull on the cable, also acts within the system." The key stays A. |
| S2 | should-fix | `p1-u2-fr2`(c) (Unit 2 test, FR 2) | The premise is impossible. On the frictionless vertical track in the stem, the block cannot have the same speed at the bottom as at the top, because v_bottom^2 = v^2 + 4gR. A student who notices this gets 6mg, not 2mg. | Stem: "Friction is negligible." Part (c): "At the bottom of the track the block has the same speed v." | Part (c): "A second, identical block passes the bottom of the track with the same speed v. Without deriving a new equation in full, explain in words why the normal force on it at the bottom is greater than the normal force on the first block at the top, and state how much greater it is." Rubric row 3: "States that the normal force on the second block at the bottom exceeds that on the first block at the top by 2mg." The key stays 2mg and needs no Unit 3 energy. |
| S3 | should-fix | Figure `p1-w26-f1` (week 26, explanation figure for ¶3) | The figure is captioned "A column of liquid in equilibrium" but draws only P_0A down and PA up. The column's weight is missing, so the drawn forces cannot balance unless P = P_0. The paragraph beside it and item `p1-w26-b7` correctly include the weight. Week 19 names "leaving out the object's own weight" as a common error. | Rendered figure. Alt: "A downward arrow labeled P_0A acts on the top of the column and an upward arrow labeled PA acts on its bottom." | Add a downward arrow labeled ρAhg from the column's center. New alt: "An open container of liquid of density ρ. A dashed rectangle marks a column of liquid from the surface down to a depth h, with area A at its bottom. A downward arrow labeled P_0A acts on the top of the column, a downward arrow labeled ρAhg (its weight) acts at its center, and an upward arrow labeled PA acts on its bottom." |
| S4 | should-fix | Figure `p1-w16-f2` alt text (week 16 explanation and example 2) | The alt says the block hangs "from two strings", but the drawing has one string. Screen-reader users get a different apparatus. | The SVG has a single vertical string and a single dashed string to the swung block. | New alt: "A ballistic pendulum: a block hangs at rest from a single string; a small projectile approaches it horizontally from the left with velocity v; a dashed outline shows the block after it has swung up to a height h above its starting position." |
| S5 | should-fix | Week 31, explanation ¶1, second sentence | The sentence makes energy conservation depend on there being no conversion to internal energy. Total energy is conserved either way; what stays constant only without such conversion is the mechanical energy K + U. The equation in the same sentence is right. | "Energy is conserved for a system when no external work is done on it and no mechanical energy becomes internal energy; otherwise W_ext = ΔK + ΔU + ΔE_int keeps track of the difference." | "The mechanical energy K + U of a system stays constant when no external work is done on it and no mechanical energy becomes internal energy; in general, W_ext = ΔK + ΔU + ΔE_int keeps track of every change, so the total energy of a system on which no external work is done is always constant." |
| S6 | should-fix | Week 29, explanation ¶3, second sentence | The sentence gives the wrong cause. The jet's narrowing just outside a hole reduces the flow rate (the effective area), not the jet speed; viscosity is what makes the speed a few percent low. | "Viscosity and the way the jet narrows just outside a hole make real efflux speeds several percent below √(2gh)". The week's own data give a speed ratio of √(1.09/1.20) = 0.95, which is consistent with viscosity alone. | "Viscosity at the hole makes real efflux speeds a few percent below √(2gh); the jet's narrowing just outside the hole reduces the flow rate, not the speed. A measured slope smaller than 4y tells you by how much." |
| N1 | note | Weekly MC keys; unit tests | Weekly MC keys favor B: 74 of 175 (42%), with D at 14%. Weeks 10–18 key B in 29 of 48 items and D in none. Unit tests 1, 2, 5, 6, 7 and 8 key exactly 3 of each letter, which a test-wise student can exploit (the same pattern as the Calculus AB review's N10). | Key tally (scripted). | Reorder choices in about 20 weekly items, mostly weeks 10–27, moving B keys to A and D, and re-check that each answer text names its new letter. On unit tests, allow 2–4 keys per letter. |
| N2 | note | Distractor notes: `p1-pe-mc25` D, `p1-pe-mc38` C and D, `p1-u1-mc04` C, `p1-u3-mc09` C, `p1-u4-mc03` D, `p1-u4-mc07` C, `p1-u5-mc08` A, `p1-u5-mc11` B, `p1-u8-mc01` B, `p1-u8-mc03` C | Eleven notes do not reproduce the number in their choice. Every key is right, and every distractor is still wrong by more than rounding. | Examples: `p1-u4-mc07` C is 24 m/s, but "divides the ball's momentum by the ball's mass" gives 120 m/s. `p1-pe-mc38` C is 1.8 × 10^3 kg/m^3, but mass × volume is 1.8 × 10^−3. `p1-pe-mc25` D is 150 m/s = 30 × 2.0/0.40, but "inverts the mass ratio" gives 120 m/s. `p1-u1-mc04` C is −49 m/s, but the note gives +49 m/s. | Make each choice match its note, or the note match its choice. `p1-u4-mc07` C → "120 m/s" with the note "Gives the cannon the ball's speed: equal velocities instead of equal momenta". `p1-u1-mc04` C → "+49 m/s". `p1-u3-mc09` C → "0.10". `p1-u4-mc03` D → "2.0 m/s". `p1-pe-mc25` D note → "Uses the full 2.0 kg and inverts the mass ratio: (30)(2.0/0.40)". `p1-pe-mc38` C note → "Multiplies 1.2 kg by 1.5 L and attaches 10^3"; D note → "Divides 1.5 L by 1.2 kg and reports 1.25 × 10^3". `p1-u8-mc01` B note → "Computes 250 g/93 cm^3 = 2.7 g/cm^3 and labels it kg/m^3". `p1-u5-mc11` B note → "Multiplies τ by I (9.6) and stops". `p1-u5-mc08` A note → "Assumes I grows in proportion to the distance to the far end". `p1-u8-mc03` C note → "Compares 10 m with a 1 m depth, with no atmosphere". |
| N3 | note | Unit tests 1, 3, 5 and 7, Section II | Free-response pairs worth 22 points (MR or EDA with TBR) get 36 minutes (units 1, 3, 5) or 40 minutes (unit 7), about 1.6–1.8 minutes per point. The exam allows about 2.4 (95 minutes for 40 points), and `units.md` budgets 45–55 minutes for MR plus TBR. | Section minutes: every test has 24 min for Part I; Section II has 36, 36, 36, 36, 36, 36, 40, 40 min. | Section II: 46 minutes in units 1, 3, 5 and 7 (70 in all, the blueprint's ceiling). Use 40 minutes in units 2, 4 and 6, matching unit 8. |
| N4 | note | `p1-w09-c7`; `p1-w16-b2`; week 16 example 3 | Signed answers with no positive direction stated in the item or its sheet directions. The course convention requires one. | `p1-w09-c7` key "+6.0 N, 0 and −4.5 N". `p1-w16-b2` key "0.50 kg cart: −1.0 m/s". Example 3 answer "−0.30 m/s (it rebounds)". In all, 43 of 108 sheet directions state a positive direction; other vector items state it in the prompt. | `p1-w09-c7`: add "Take the direction of motion (+x) as positive." Week 16 sheet B directions: add "Take the first cart's initial direction as positive." Example 3: "… Taking the 0.20 kg glider's initial direction as positive, find both velocities after the collision." |
| N5 | note | Rubrics: `p1-u1-fr1`(d), `p1-u3-fr1`(d), `p1-u4-fr1`(a), `p1-u5-fr2`(e), `p1-pe-fr3`(e) | Some rows shut out valid methods or state a weak reason. `u1-fr1`(d) asks students to use the graph but requires an equation. `u3-fr1`(d) credits only energy for the trip down. `u4-fr1`(a) says leveling stops friction changing the speeds, when leveling removes gravity's component along the track. `u5-fr2`(e) writes x = 3.0 + M/m without the 1.0 m factor and does not say that a plank of 50 kg or more lets the painter reach the end. `pe-fr3`(e) accepts only dissipation as the reason for the low k. The ball's ignored rise of x while the spring expands also lowers k, since ½kx^2 = mg(h + x). | Rubric rows (quoted in the lane files). | `u1-fr1`(d) row 2: append "…or reads the crossing time from an accurately drawn graph with cart 2's line". `u3-fr1`(d) row 2: append "…or a = g(sin θ − μ_k cos θ) with v^2 = 2ad". `u4-fr1`(a) row 2: "Levels the track (a cart at rest does not drift) so gravity has no component along it, and measures speeds just before and after the collision so friction has little effect." `u5-fr2`(e) step: "x = 3.0 m + (1.0 m)(M/m); if M ≥ m = 50 kg, the painter can stand at the end without tipping". `pe-fr3`(e): append "…or because the model ignores the ball's rise of x while the spring expands". |
| N6 | note | `p1-u5-mc04`, `p1-u5-mc05`, `p1-u5-mc09` | Three-figure keys and choices come from two-figure givens, against the stated convention. | `p1-u5-mc04` key 15.8 m/s^2 from 2.5 m and 0.40 rev/s. `p1-u5-mc05` 10.4 N·m from 40 N and 0.30 m. `p1-u5-mc09` choices 157, 255 and 206 N from 12 kg, 30 kg, 3.0 m and 1.0 m. | Give the data three figures ("2.50 m … 0.400 revolution per second"; "40.0 N … 0.300 m"; "12.0 kg … 3.00 m … 30.0 kg … 1.00 m"); the keys are unchanged. |
| N7 | note | Wording: week 19 ¶2; `p1-w34-a7` (D); `p1-u3-fr2` stem; `p1-pe-mc21` stem; `p1-u6-mc07` | Several statements are loose. Zero net torque about one axis means zero about every axis only when the net force is also zero. Week 19 sits in an equilibrium method, so it is safe in context, but `p1-w34-a7`'s keyed "zero about any axis" is offered as the condition for rotational equilibrium alone. A fan mounted on a cart is part of the cart, so with "the cart alone as the system" the external force comes from the air. A car cannot speed up with friction neglected, since the road's static friction drives it. `p1-u6-mc07` choice B does not fit the stem's grammar. | Quoted texts. | Week 19 ¶2: "When the net force is zero, a net torque of zero about one axis means zero about every axis, so…". `p1-w34-a7` (D): "The net torque on it is zero". `p1-u3-fr2`: "Air pushed by a fan mounted on the cart exerts a horizontal force on the cart that depends on…". `p1-pe-mc21`: "Neglecting rolling resistance and air resistance". `p1-u6-mc07` stem: "How do her angular velocity and rotational kinetic energy change?"; choice B: "ω is unchanged; K is three times as large". |
| N8 | note | `p1-w32-a4` step 1; week 34 ¶2 | `p1-w32-a4` takes the slope from data values while calling them points on the line, against week 32 ¶2's advice. Week 34 ¶2 says its sheets follow "the areas that practice exams most often expose", which nothing supports, and the week offers nothing for weaknesses in Units 1–4. | Step 1: "Using two well-separated points on the line: slope ≈ (0.145 − 0.055) m / (0.032 − 0.012) kg". | Step 1: "Two well-separated points on the best-fit line, for example (0.012 kg, 0.0545 m) and (0.032 kg, 0.145 m): slope ≈ 4.5 m/kg." Week 34 ¶2 first sentence: "Sheets A–C cover Units 5–8 and problems that link units; for a weakness in Units 1–4, use the sheets of weeks 30–31 you have not yet done." |
| N9 | note | `p1-w19-b2`, `p1-w24-c2` | Each item depends on the item before it. The 40 kg plank mass appears only in `b1` (and not in figure `p1-w19-f4`), and `c2` uses `c1`'s data table. | `b2`: "For the plank shown, how far along the plank can the 75 kg person walk…". `c2`: "Using the cart-and-spring timing data from the previous item…". | `b2`: "For the 40 kg uniform plank shown, …" (key unchanged, 4.8 m). `c2`: move the table into a week passage, as the investigation sheets do, or name item 1 explicitly. |
| N10 | note | `p1-w06-a3` against `p1-w09-a7`; unit tests against weekly items | Two weekly items share their givens: a puck slows from 12 to 8.0 m/s over 20 m, and only the mass and the method differ. Several unit-test MC are numerical variants of weekly items, for example `p1-u6-mc04` and `p1-w21-b2` (braking angle), `p1-u6-mc03` and `p1-w21-b1` (work by torque through revolutions), `p1-u1-mc10` and week 2 example 3 (crosswind), and `p1-u5-mc11` and `p1-w20-a1`. The practice exam is fresh; its closest relatives are different designs. | Scripted similarity scan, then reading. | `p1-w09-a7`: "slides 15 m and slows from 9.0 to 6.0 m/s" (friction work −11 J, force 0.75 N). Optionally vary the unit-test designs, for example by asking for the time to stop instead of the angle. |
| N11 | note | Figure geometry: `p1-pe-f4`, `p1-w12-f3`, `p1-w28-f3`, `p1-u5-f3`, `p1-w20-f4`, `p1-w35-f4` | The drawings disagree with their setups in small ways. `p1-pe-f4` draws the roller's handle angled upward while F is horizontal. A light handle pinned at the axle can pull only along its length, so a careful student may doubt the stem. `p1-w12-f3` draws the cable at about 21° on a 25° ramp, although the alt and the solutions say it is parallel. `p1-w28-f3` is plainly not to scale but lacks `notToScale`. The key force diagram `p1-u5-f3` draws the same tension at different lengths on the block and on the pulley. `p1-w20-f4` has the hanging block overlapping the flywheel rim. In `p1-w35-f4` the "1.0 m" label reads as a height. | Chromium renders. | Draw the handle horizontal, or label the arrow "F (horizontal pull)" and say the handle is held level. Redraw the cable parallel to the ramp. Set `notToScale: true` on `p1-w28-f3`. Draw each tension at one length in all three diagrams. Move the block clear of the rim. Place the label along the string. |
| N12 | note | Figure readability (cosmetic) | Axis names are clipped at the right edge: "x (m)" in `p1-w09-f2`, `p1-w09-f5` and `p1-w09-f6`, and "M (kg)" in `p1-w32-f3`. Curves run over zero-crossing tick labels in `p1-pe-f6`, `p1-pe-f8`, `p1-u7-f2` and `p1-u7-f4`. Labels touch lines in `p1-w02-f1`, `p1-w03-f5`, `p1-w08-f1`, `p1-w09-f3`, `p1-w22-f1`, `p1-w22-f3`, `p1-w23-f1`, `p1-w27-f2`, `p1-w31-f1`, `p1-w36-f2`, `p1-u1-f1`, `p1-u6-f2`, `p1-u7-f6` and `p1-u8-f4`. Twenty figures in weeks 10–18 set sub- and superscripts at 11 px, below the 12 px guideline (kit output). | Chromium renders in the lane galleries. | Widen the kit's right margin for axis names; offset tick labels from curve crossings; nudge the labels; set kit sub- and superscripts to 12 px. |
| N13 | note | Weeks 20, 22 and 25, explanation ¶4 | The lab-time statement is appended to the "Common errors" paragraph, where it reads as one of the errors. Weeks 3, 8, 12, 16 and 29 place it better. | ¶4 ends "…ignoring a friction torque when data show it. College Board's AP® Physics 1 course framework calls for at least 25 percent…". | Make the statement its own short paragraph, or move it to the day 4 plan line. |
| N14 | note | `p1-u6-fr1` (Unit 6 test, EDA) | The question has no uncertainty or error-source part. The other EDA questions (`p1-u1-fr2`, `p1-u4-fr1`, `p1-u8-fr1`, `p1-pe-fr3`) each have one. | Part list (a)–(e). | Add to (a): "…and identify one source of experimental uncertainty and how it would shift β", keeping 10 points. |
| N15 | note (low confidence) | Resemblance and boilerplate: `p1-pe-fr3`, `p1-u1-fr2`, `p1-u4-fr1`, `p1-u5-fr2`, `p1-u6-fr1`, `p1-u8-fr1`, week 35 sheet B; part (a) of `p1-u2-fr1` and `p1-u5-fr1` | No free-response question or investigation matched a specific released question the reviewer could recall with medium or high confidence (see "Resemblance screen"). The items listed use common lab or textbook genres that released questions also use: a vertical spring launcher with h against x^2, a horizontal launch from varied heights with x^2 against h, an unknown cart mass from sticking collisions, a plank on two supports with support forces graphed against position, rolling down a ramp to find β, pressure against depth, and stacked coffee filters. Of these, the coffee-filter drag lab felt most familiar, as a possible AP Physics C: Mechanics question, with low-to-medium confidence. The force-diagram direction "Draw relative lengths of arrows reasonably" echoes exam boilerplate. | Part lists, compared from memory only. | No change is required. For more distance, rework the structure: in `p1-pe-fr3`, have the launch speed measured by a photogate and plot v against x (slope √(k/m)); in `p1-u5-fr2`, find the painter's mass from a measured F_B at a given x instead of graphing; in week 35 sheet B, vary the drop height instead of the stack size. Vary the force-diagram wording, for example "Draw each force as an arrow from the dot, longer arrows for larger forces." |

## Rubrics

- **Practice exam.** Points per question: FR1 (MR) 2+3+2+3, FR2 (TBR)
  3+3+3+3, FR3 (EDA) 2+3+2+2+1, FR4 (QQT) 3+3+2. That is 40 points, and
  82 with the multiple choice. Every rubric row sums to its part. Points go
  to diagrams (forces at their points of application, friction direction),
  setups (translational and rotational second law, torque about the hinge,
  energy with both kinetic terms), linearization and slope meaning, stated
  tolerances (for example 2.7–2.9 m/s and 3.6–3.9 × 10^2 N/m), and claim
  evaluations tied to the derived expression. FR3(e) is 1 point for both
  the static k and a reason; see N5.
- **Unit tests.** Each test has two different FR types:

  | Test | FR 1 | FR 2 |
  | --- | --- | --- |
  | Unit 1 | TBR 3+3+3+3 | EDA 3+2+2+3 |
  | Unit 2 | MR 3+2+3+2 | QQT 2+3+3 |
  | Unit 3 | MR 2+3+2+3 | TBR 3+3+3+3 |
  | Unit 4 | EDA 3+2+2+3 | QQT 3+3+2 |
  | Unit 5 | MR 3+3+2+2 | TBR 2+3+3+2+2 |
  | Unit 6 | EDA 3+2+2+2+1 | QQT 2+3+3 |
  | Unit 7 | MR 2+3+2+3 | TBR 3+3+3+3 |
  | Unit 8 | EDA 2+3+3+2 | QQT 3+3+2 |

  Each type appears four times. Every row sums to its part. The rubrics
  credit reasoning and often accept equivalent methods ("about a stated
  axis", "or an equivalent method"). The exceptions are in N5. Each item is
  genuinely its type: the TBR items move between graphs, bar charts,
  diagrams and equations; the EDA items have a procedure, a linearization, a
  plot and a slope interpretation (`p1-u6-fr1` lacks an uncertainty part,
  N14); the QQT items pair a derivation with a reasoned claim evaluation.
- **Weekly.** All 146 free-response rubrics sum to their points. Those read
  in full reward setups, sign conventions and justifications, not only
  final values.

## Teaching content

| Weeks | Topics checked | Result |
| --- | --- | --- |
| 1–3 (Unit 1) | 1.1–1.5; ramp investigation (d against t^2, slope 0.42 m/s^2) | Correct; signs and positive directions stated throughout. |
| 4–8 (Unit 2) | 2.1–2.9; spring data (18.6 N/m); air-table circular-motion investigation | Correct except S1. |
| 9–13 (Unit 3) | 3.1–3.5; week 12 release-height investigation (fraction kept 0.80–0.84) | Correct. N4 (`p1-w09-c7`), N10 (`p1-w09-a7`), N11 (`p1-w12-f3`). W_c = −ΔU, system choice for U_g, and ΔE_int = f_k × path length are handled well. |
| 14–16 (Unit 4) | 4.1–4.4; week 16 sticking-collision investigation (m_A = 0.250 kg, v_i = 0.80 m/s) | Correct. S4 (alt text) and N4 (week 16 signs). |
| 17–20 (Unit 5) | 5.1–5.6; flywheel τ against α investigation | Correct; radians and a stated counterclockwise-positive sense throughout. N7 (week 19 ¶2), N9 (`p1-w19-b2`), N13. |
| 21–23 (Unit 6) | 6.1–6.6; spinning-stool investigation (L = 10.0 kg·m^2/s) | Correct, including the skidding ball reaching (5/7)v_0 and every orbital value. |
| 24–25 (Unit 7) | 7.1–7.4; pendulum investigation (g = 9.81 m/s^2 from the slope; the intercept matches the bob radius) | Correct. N9 (`p1-w24-c2`). |
| 26–29 (Unit 8) | 8.1–8.4; draining-bottle investigation (slope 1.09 against an ideal 1.20) | Correct except S3 (figure) and S6 (¶3 wording). |
| 30–34 (review, practice exam) | P1.REVIEW | Correct except S5 (week 31 ¶1). Week 33 matches the exam format exactly (42 MC in 85 min; 4 FR in 95 min; MR 10, TBR 12, EDA 10, QQT 8). N7 (`p1-w34-a7`), N8. |
| 35–36 (synthesis) | P1.SYNTHESIS | Correct except B1. Week 35 says that drag beyond "it opposes motion" is not exam content. Week 36 sheet C (electric force, hydrogen model) is labeled "Beyond the exam … not exam content". Household-materials tasks carry safety notes. |

Every week's standards match the plan schedule in `content/ap.json`.
Investigation data are internally consistent and reproduce their intended
constants. The notation is plain text with Unicode minus signs and `x^2`
throughout. There are no LaTeX remnants, no ASCII minus signs on numbers,
and no use of g = 10.

## Figures

All 234 figures are faithful to their stated setups and data, except S3
(the missing weight) and the geometry notes in N11. The graphs were checked
at their stated points, and their slopes and areas against the keys. That
includes the cosine position graphs, the F–x and K–x graphs, the energy bar
charts and the best-fit key graphs. Every figure uses `currentColor`, and
the 26 rendered on a dark background stay legible. Given-figure alt texts
do not reveal answers. The only inaccurate alt text is S4. `notToScale` is
set wherever a schematic is not drawn to scale, except `p1-w28-f3` (N11).
The readability items are in N12.

## Formula reference

`content/ap/references/physics-1.json` has 61 rows in nine groups.
Each row gives the relation, its meaning in words and its SI units. Every
relation is correct. That includes the conditions stated with them, for
example "f_s ≤ μ_sF_N", "W_ext = ΔK + ΔU + ΔE_int" with ΔE_int = f_k d,
"τΔt = ΔL", "P = P_0 + ρgh" (gauge pressure named), and Torricelli's
v = √(2gh). The symbols match the course: F_N, f_k, U_s, ΔU_g, U_G = −Gm_1m_2/r,
F_b, ΔE_int, r_⊥ and K_rot.

**Organization.** From memory only, the reviewer judges the reference to be
Liminal's own arrangement. Its groups are named by the question they answer
("How is it moving?", "Why does the motion change?", "Where does the energy
go?"). Every row has a plain-language meaning and a units column. It has
its own short geometry group, and no prefix or trigonometric-value tables.
The reviewer recalls College Board's equation sheet as topic-labeled tables
of bare equations with a shared symbol legend, constants and prefixes,
trigonometric values, and a geometry box. The reference's notes say it is
not a copy and tell students to practice with College Board's own sheet.

Three wording notes do not affect correctness:

- The rotational-inertia row introduces "Common shapes about a central
  axis" but includes a rod about its end. Suggested wording: "…rod about a
  perpendicular axis through its center (1/12)ML^2 or through one end
  (1/3)ML^2".
- Bernoulli's meaning, "where a fluid moves faster or higher, its pressure
  is lower", holds only with the other quantity unchanged. Suggested
  wording: "at the same height, faster flow means lower pressure; at the
  same speed, higher means lower".
- "Use sine when it starts at x = 0" should add "moving in the +x
  direction".

## Physics conventions, timing, blueprint and claims

- **Units and significant figures.** Every numeric answer in the keys
  carries an SI unit. Sheet directions ask for 2–3 significant figures on
  98 of 108 sheets. The exceptions are N6.
- **Signs.** Vector problems state a positive direction in their sheet
  directions (43 sheets) or in the prompt. The exceptions are N4. Rotation
  problems state counterclockwise as positive.
- **Angles.** Geometric angles are in degrees; angular quantities are in
  radians, with rpm converted explicitly (weeks 17 and 21).
- **Calculator.** All 108 sheets and all assessment parts are `any`. Sheets
  suggest 20–35 minutes.
- **Lab note.** The statement that paper investigations do not replace
  hands-on lab work, the AP® Course Audit or college lab credit appears in
  every investigation week (3, 8, 12, 16, 20, 22, 25, 29). It is also in
  the data-task weeks, in weeks 32, 35 and 36, in the practice exam's
  Section II directions, and in the unit-test directions. N13 covers its
  placement in three weeks.
- **Practice exam blueprint.** Section I has 42 MC in 85 minutes, with unit
  counts 5/8/8/5/5/3/3/5. Section II has 4 FR in 95 minutes, one of each
  type, worth 10/12/10/8. The suggested times per question match the plan.
  Key letters split A 10, B 11, C 10, D 11. The key is the unique longest
  choice in 3 of 42.
- **Unit tests.** Each has 12 MC and 2 FR in 60–64 minutes, within the
  plan's 50–70. Topics stay within the tested unit; the only earlier-unit
  topics used are P1.2.8 and P1.4.3 in Unit 7. Timing is in N3 and balance
  in N1.
- **Claims.** There is no score conversion, no prediction, no "pass" or
  "5", and no endorsement claim. Tallies are labeled "practice tallies, not
  AP® scores". "Official" appears once, in "For official practice in the
  digital format, use College Board's Bluebook practice tests". The marks
  appear only as adjectives with ®. The disclaimer check in
  `tools/check-ap.js` passed.

## Resemblance screen

The screen relied only on the reviewer's and the lanes' memory of publicly
released free-response questions. No College Board material was consulted
or used. All 20 assessment free-response questions and every weekly
investigation and free-response design were compared with the questions the
reviewers could recall.

No question's structure could be tied to a specific released question with
medium or high confidence. No data set or number matched one the reviewers
know. Several items use genres that released questions also use; N15 lists
them with possible structural reworks. This result reflects weaker recall
of specific physics questions, not proof of distance. A person who can
legitimately consult the released questions should check N15's items,
especially `p1-pe-fr3`, `p1-u1-fr2`, `p1-u4-fr1` and `p1-u5-fr2`, without
giving that material to any agent.

## Limits

- This is an agent review: not human editorial approval, not College Board
  endorsement, and not measured difficulty.
- Six delegated lanes and the reviewer did the work. The lanes used the
  same rules, tools and blind-first discipline. The reviewer rechecked every
  blocking and should-fix finding against the source but did not re-solve
  every lane's items.
- The blind sample covered one item per worksheet. The other 604 worksheet
  items were checked only after their keys were visible.
- The resemblance screen is memory only (see above).
- Figures were checked as standalone SVGs in Chromium with a generic
  sans-serif font. Rendering through the site's sanitizer and scaling, print
  output, phone width, and whether the disclaimer and formula reference
  appear in printed booklets belong to the print and code reviewers.
- Exam-format facts were taken from `units.md` and `content/ap.json` as
  given. They were not re-verified against College Board pages.

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.
