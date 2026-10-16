# SAT Math independent template review: Advanced Math, 2026-10-16

- **Reviewer:** `review-20261016-advanced` (independent agent; not the author).
- **Author under review:** `templates-lane-20261016` (author notes:
  `2026-10-16-sat-math-realism-changes.md`).
- **Scope:** the 46 templates in the "Advanced Math (46)" section of the
  templates lane's stale list, at `lane/templates` commit 2928051, against the
  base `feature/sat` at e87395b.
- **Result:** 45 accepted, 1 rejected (`quadratic-context-model`). 195 blind
  solves, 0 blind misses.

This is sampled agent review, not human editorial approval and not empirical
SAT calibration. Tier judgments are editorial opinions against the official
bands described in `docs/difficulty-calibration.md`; nothing here measures
student difficulty.

## Method

1. **Seeds.** Fresh seeds `rv1016-adv.<templateId>.<n>`, n = 0, 1, 2. For all
   46 templates, seeds 0–2 already displayed three distinct questions
   (stimulus, stem, figure and unordered choices differ), so no seed was
   skipped. For the 9 new, re-tiered and changed-draw templates, further seeds
   were solved blind to reach branches the first three missed (for example
   the cube and numeric forms of `expression-substitution`, the
   different-base powers form of `expression-from-combination`, every fact
   family of `quadratic-must-be-true`, the cancelling-x² forms of
   `quadratic-solution-count`, each equation form of `rational-equation-solve`,
   and each ask of `quadratic-context-model`). Those seeds were located with a
   script that printed only the form, never a key; the one seed located by its
   key (`quadratic-solution-count` n = 91, identity form) was read in full view
   only and is not recorded as a solved sample.
2. **Blind view.** The brief's command (`check-families.js --sample` with the
   tier, rationales, key marker, numeric key, explanation and hint stripped).
   Figure alt text was read in the blind view and the SVG text was read from
   the written file.
3. **Answer first.** Each answer was appended to a scratch log before the key
   was looked at; a script then compared the log with the rebuilt key, and the
   full view was read for rationales, explanation, steps and trap.
4. **Unchanged content.** Every template was instantiated on 600 seeds (300
   integer, 300 runtime-shaped) with both the current source and a copy of
   `src/lib/families` extracted from e87395b, comparing response type,
   stimulus, scene, figure, stem, choices, key, rationales, explanation, steps,
   principles, trap, hint and `verified`, plus metadata.
5. **Gate and variety.** `node tools/check-families.js --family <id>` for the 9
   new, re-tiered and changed-draw templates (all pass), distinct displayed
   items over 600 draws, and form/key distributions where a tier or tell
   question needed numbers.
6. **Fragment validation.** `tools/check-template-reviews.js` was copied to
   scratch and narrowed to this fragment: it rebuilds every sample from the
   current source and checks answer agreement, three distinct displayed
   variants, version, recomputed source fingerprint, registry fingerprint,
   tier, names, date and this evidence path.

### Unchanged-content comparison against e87395b (600 records each)

| Outcome | Templates |
| --- | --- |
| Identical records and metadata | the 37 "source only" templates (every row marked *same* below) |
| Identical records; `difficulty` and `rubric` changed | `absolute-value-cases` (Hard → Medium) |
| Records differ | `expression-substitution` 600/600, `quadratic-must-be-true` 600/600 (also Medium → Hard), `expression-from-combination` 309/600 (the author's notes say 308; the runtime-shaped seed set differs) |
| New | `polynomial-add-subtract`, `polynomial-multiply`, `quadratic-solution-count`, `rational-equation-solve`, `quadratic-context-model` |

No difference was found beyond what the author's notes describe.

## Results

Kind: *same* = identical records to e87395b; *tier* = re-tiered only;
*draws* = changed draws; *new* = new template. Blind answers are choice
letters (A = index 0) or numeric entries, in seed order. Every recorded answer
agrees with its key.

| Template | Tier | Kind | Seeds (n) | Blind answers | Agree | Official band | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| monomial-exponent-rules | Easy | same | 0, 1, 2 | B, B, B | 3/3 | — | |
| quadratic-factor-match | Easy | same | 0, 1, 2 | D, C, B | 3/3 | — | |
| rational-expression-combine | Medium | same | 0, 1, 2 | A, A, C | 3/3 | — | |
| rational-exponent-rewrite | Medium | same | 0, 1, 2 | A, B, D | 3/3 | — | |
| unknown-coefficient-product | Hard | same | 0, 1, 2 | −33, D, C | 3/3 | — | |
| expression-substitution | Hard | draws | 0–8, 12, 13 | B, C, C, C, C, D, A, A, C, 140, 167 | 11/11 | Hard (plain x + 1/x squared ≈ 21% of draws is Medium–Hard) | Split is clean: no powers form remains; every draw is a reciprocal square or cube |
| quadratic-square-root-solve | Easy | same | 0, 1, 2 | 3, C, 9 | 3/3 | — | |
| radical-equation-solve | Easy | same | 0, 1, 2 | 86, B, 80 | 3/3 | — | |
| absolute-value-equation | Medium | same | 0, 1, 2 | D, A, −3 | 3/3 | — | |
| quadratic-irrational-solutions | Medium | same | 0, 1, 2 | B, A, A | 3/3 | — | |
| root-sum-product | Hard | same | 0, 1, 2 | D, 5/2, B | 3/3 | — | |
| extraneous-roots | Medium | same | 0, 1, 2 | 12, D, A | 3/3 | — | |
| factored-polynomial-intercepts | Easy | same | 0, 1, 2 | D, 24, D | 3/3 | — | |
| exponential-model-reading | Easy | same | 0, 1, 2 | D, B, A | 3/3 | — | |
| quadratic-vertex-reading | Easy | same | 0, 1, 2 | 3, D, B | 3/3 | — | |
| projectile-height-model | Medium | same | 0, 1, 2 | 4, 676, C | 3/3 | — | |
| exponential-table-model | Medium | same | 0, 1, 2 | 1, 16384, A | 3/3 | — | Pre-existing: see F5 |
| vertex-from-conditions | Medium | same | 0, 1, 2 | C, D, A | 3/3 | — | Figure text clean |
| exponential-rewrite | Medium | same | 0, 1, 2 | C, C, A | 3/3 | — | n = 1 and 2 differ only in the initial count |
| function-transformation-table | Hard | same | 0, 1, 2 | C, C, C | 3/3 | — | |
| polynomial-factor-remainder | Medium | same | 0, 1, 2 | C, A, C | 3/3 | — | |
| expression-from-combination | Medium | draws | 0, 1, 2, 4, 5, 6, 16, 18, 58 | 1/64, C, C, D, B, A, C, A, C | 9/9 | Medium (agree) | Different-base powers form solved 7 times, including the half-multiple and rearranged variants |
| nonlinear-formula-rearrange | Medium | same | 0, 1, 2 | B, D, C | 3/3 | — | Pre-existing: see F4 |
| common-base-exponent | Medium | same | 0, 1, 2 | −4, B, 5 | 3/3 | — | |
| quadratic-structure-form | Medium | same | 0, 1, 2 | A, D, A | 3/3 | — | |
| rational-equation-structure | Hard | same | 0, 1, 2 | B, C, A | 3/3 | — | |
| absolute-value-cases | Medium | tier | 0–5 | D, D, 6, 8, C, C | 6/6 | Medium (agree) | Records identical to e87395b |
| function-table-evaluate | Medium | same | 0, 1, 2 | 16, C, D | 3/3 | — | |
| polynomial-constant-from-remainder | Medium | same | 0, 1, 2 | D, 10, A | 3/3 | — | |
| exponential-from-words | Medium | same | 0, 1, 2 | D, 15, D | 3/3 | — | |
| graph-which-function | Medium | same | 0, 1, 2 | D, C, C | 3/3 | — | Figure text clean |
| graph-transformation | Medium | same | 0, 1, 2 | C, C, D | 3/3 | — | |
| complex-fraction-equivalence | Hard | same | 0, 1, 2 | 9/4, B, 5/7 | 3/3 | — | |
| radical-parameter-extraneous | Hard | same | 0, 1, 2 | B, D, D | 3/3 | — | |
| quadratic-must-be-true | Hard | draws, tier | 0–7 | C, B, A, A, D, B, D, B | 8/8 | Medium–Hard; Hard accepted (see below) | |
| signed-cube-root-value | Easy | same | 0, 1, 2 | B, A, A | 3/3 | — | |
| quadratic-square-coefficient | Hard | same | 0, 1, 2 | C, 24, B | 3/3 | — | |
| shifted-exponential-recovery | Hard | same | 0, 1, 2 | −6, C, −15 | 3/3 | — | |
| quadratic-zeros-in-interval | Hard | same | 0, 1, 2 | A, 46, C | 3/3 | — | |
| graph-quadratic-level | Medium | same | 0, 1, 2 | 7, −1, −5 | 3/3 | — | |
| graph-polynomial-sign-integers | Medium | same | 0, 1, 2 | −1, 4, −11 | 3/3 | — | |
| polynomial-add-subtract | Easy | new | 0–4, 6, 29, 41 | 1, C, A, B, 2, D, A, D | 8/8 | Easy (agree) | Difference, sum and monomial-times-trinomial forms |
| polynomial-multiply | Medium | new | 0–5, 10, 12, 42 | −9, −11, D, B, A, 3, A, A, C | 9/9 | Easy–Medium to Medium; Medium accepted | Minor: F2 |
| quadratic-solution-count | Medium | new | 0–5, 12, 18, 21, 40 | C, A, A, C, D, B, C, D, B, A | 10/10 | Medium (agree) | Minor: F2 |
| rational-equation-solve | Medium | new | 0–9, 14, 40, 41 | 3, 6, 11, −1, 4, C, B, 11, −7, D, 27, B, B | 13/13 | Easy–Medium to Medium; Medium accepted | Minor: F2, F3 |
| quadratic-context-model | Medium | new | 0–5, 9, 37, 47, 56 | B, C, B, B, B, D, B, 6, C, D | 10/10 | Medium (agree) | **Rejected:** R1, R2 |

(Answers in the rows with ranges are listed in seed order: for
`polynomial-add-subtract` the seeds are 0, 1, 2, 3, 4, 6, 29, 41; for
`rational-equation-solve` they are 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 40, 41.)

Blind misses: none, by the reviewer or by any template.

## Rejection

### quadratic-context-model (new, Medium): rejected

The keys are right on every sampled draw (10/10 blind solves agree) and the
tier is right; two displayed-text defects block acceptance.

- **R1. Wrong wrong-answer rationale in the "choose the price with more items"
  form.** The distractor `D · (P + x1)` is described as "the number of
  tickets at that price", but the number sold at the chosen price is
  `N − D · x1 = D · (P + x2)`; `D · (P + x1)` is the number sold at the
  other, rejected price.
  - Seed `rv1016-adv.quadratic-context-model.9`: the key is $19 (x = 1), and
    the choice 285 says "Gives the number of tickets at that price instead of
    the price". At $19 the theater sells 630 − 15 = 615 tickets; 285 is the
    count at $41.
  - Rationales are shown to the student (test shell, Review, booklets). The
    false rationale appears in 44 of 600 gate-shaped draws (every
    multiple-choice draw of this form that offers that choice).
  - **Fix:** in `revenueItem`'s third branch
    (`src/lib/families/sat/math/advanced-math/nonlinear-functions.js`), use
    `N − D * x1` for that distractor, or keep the value and say it is the
    number sold at the higher price.
- **R2. Ungrammatical stem in the same form.** The stem builds
  `` `Of the ${scene.price}s that give this revenue` ``, which yields "Of the
  price of a boxs" and "Of the price of a baskets" for two of the five scenes.
  - Seed `rv1016-adv.quadratic-context-model.37`: "Of the price of a boxs that
    give this revenue, it will choose the one with more boxes." Seed
    `rv1016-adv.quadratic-context-model.40` shows "price of a baskets".
  - 46 of 600 gate-shaped draws display it. The gate's visible-text check
    (check 15) does not test plurals.
  - **Fix:** give each `PRICE_SCENES` entry a plural (for example `prices:
    "box prices"`, `"basket prices"`), or write "Of the two prices that give
    this revenue".

After a fix, a reviewer other than the author must re-solve fresh seeds of
the corrected form.

Everything else checked out: the pen forms, the price and greatest-revenue
asks, the side-length ask, the vertex steps, the target-area form (the
"longer side" condition makes the key unique), and every other rationale read
(seeds 0, 2, 4, 5, 9, 47, 56).

## Focus templates

- **expression-substitution (Hard).** The split is clean. All 600 draws are
  x ± 1/x forms: squares or cubes, given directly, as x² ± 1 = kx, or as
  x² − kx ± 1 = 0. No powers form remains. The identities, explanations and
  every rationale read are correct, including the cube rationales (k³ ± 3k,
  the "middle terms as 3" and "3(x ± 1/x)²" slips, and the
  x² + 1/x² × (x ± 1/x) slip). The x − 1/x cube is correct:
  x³ − 1/x³ = k³ + 3k. 409 of 600 items are distinct.
  - **Band:** official Hard. Plain "x + 1/x = k, find x² + 1/x²" (about 21% of
    draws) is closer to Medium–Hard. That is within one band.
- **expression-from-combination (Medium).** The new different-base powers form
  (about 35% of draws) rewrites both bases over a common base and reads the
  exponent as a multiple (×2, ×3 or ×1/2) of the given combination. The keys
  were correct in every blind solve, including the half-multiple (12x + 4y and
  6x + 10y) and the rearranged-equation sign-slip variants. No distractor can
  equal the key in value, because B^E = q^(aE) differs from q^E unless a = 1,
  and then its text is the key's text. Linear and same-base forms are
  unchanged in kind.
  - **Band:** official Medium (agree).
- **quadratic-must-be-true (Hard, standard form only).**
  - **Keys.** Every key follows from the stated facts with a written reason:
    c = f(0); b = −2ah; c/a as the product of the roots; the discriminant from
    the number of intercepts. Every distractor is a "could" or "cannot" with a
    genuine counterexample. The counterexamples quoted in rationales were
    checked (for example x² − 2x − 8 and x² − 4x + 1 both have their vertex
    in Quadrant IV).
  - **Band.** By description and key across 600 draws (integer seeds 0–599):
    - 35% (211) are "opens up/down with no x-intercepts", keyed c > 0, c < 0
      or ac > 0. That is one-step c = f(0) reasoning, closer to official
      Medium.
    - 17% (100) are "one intercept on each side of the y-axis", which needs
      c/a < 0.
    - 32% (191) are vertex in a quadrant, keyed ab, b or the discriminant,
      mostly from b = −2ah.
    - 16% (98) are both intercepts positive.
  - **Judgment.** The remaining draws are official Hard, so Hard is
    defensible as the template's label but at the generous end. It is not more
    than one band off.
  - **Minor.** Two of the eight fact descriptions can never produce a draw:
    "opens downward and has two x-intercepts" has no admissible key, and
    "crosses the y-axis below the x-axis…" has no "could" statement. They are
    dead code, not a displayed defect. The "b" reason for upward-opening facts
    states "so a > 0" twice ("It opens upward, so a > 0. … The parabola opens
    upward, so a > 0; therefore …").
- **absolute-value-cases (Medium).** Draws are unchanged. The count forms (zero
  solutions from a false case plus a failed check, an identity |2u| = 2|u|,
  two valid roots) and the sum forms were solved correctly. The explanations
  check nonnegativity properly.
  - **Band:** official Medium (agree; Hard was over-tiered).
  - **Minor.** On seed 4 one rationale says a wrong candidate "passes the
    check", meaning the nonnegativity check only. It is not a solution.
- **polynomial-add-subtract (Easy).** Correct keys, explanations and
  rationales. The two-slip grids (sign of each term; exponents added) are
  plausible.
  - **Band:** official Easy (agree).
- **polynomial-multiply (Medium).** Correct throughout. The four forms are
  difference of product and square, binomial times trinomial, single
  coefficient, and "true for all x, find k".
  - **Band:** the coefficient forms are official Easy–Medium; the k and
    difference forms are Medium. Medium accepted.
- **quadratic-solution-count (Medium).** Correct throughout, including x² terms
  that cancel (zero solutions or one), identities and the "which equation"
  form.
  - **The author's concern.** "Infinitely many" is always offered and is the
    key in 32 of 407 count draws. The only negative-constant equation is
    necessarily the key in "two distinct" which-equation draws (26 of 55),
    because ac < 0 forces two roots. It is a distractor in the other
    which-equation draws, so that choice is the key in 26 of 114 appearances.
    This is legitimate reasoning, not a tell.
  - **Band:** official Medium (agree).
- **rational-equation-solve (Medium).** Correct throughout. Every candidate root
  was checked against the denominators.
  - **Band.** The proportion a/(x + p) = b/(x + q) and ratio
    (x + p)/(x + q) = k forms become linear after one cross-multiplication.
    Together they are about half of all draws (297 of 600) and are official
    Easy–Medium, as the
    author flags. The a/x = (x + b)/c product forms (quadratic, positive
    solution or sum) and the 1/x ± 1/(mx) forms are Medium. Medium is within
    one band. A future Easy sibling for the linear forms would be more
    faithful.
  - **Taxonomy.** The subskill is "radical equations" because the catalog has
    no rational-equation subskill under Nonlinear equations. The author
    documents this, and the Learn section covers it. It still means a student's
    "radical equations" figures include rational equations.

## Other findings (not blocking)

| # | Template | Finding | Frequency (600 gate-shaped draws) | Suggested fix |
| --- | --- | --- | --- | --- |
| F1 | quadratic-must-be-true | Dead fact entries and a doubled "so a > 0" sentence, described above | 0 displayed / every upward-opening b key | Drop the two facts or give them admissible statements; trim the duplicated clause |
| F2 | polynomial-multiply, quadratic-solution-count, rational-equation-solve | A coefficient of one is written out in the teaching text: "−1k = −6", "the −1x that the product also contributes", "x² + 1x − 12", "Solves x² + 1x − 20 = 0". Check 15 covers only the stimulus, stem and choices. | 11 explanations + 7 rationales; 5 explanations; 16 rationales | Format these through `lin` or `lead` |
| F3 | rational-equation-solve | "Collect terms: x = −17, so x = −17." (a redundant clause when the coefficient is 1) | 33 explanations | Skip the "so" clause when the coefficient is 1 |
| F4 | nonlinear-formula-rearrange (pre-existing, unchanged since e87395b) | The stem says "the formula below", but Math renders the stimulus above the stem (`src/app/test-shell.js`) | 315 stems | "the given formula" |
| F5 | exponential-table-model (pre-existing, unchanged) | Choices such as "f(x) = 1(4)^x" write out a coefficient of 1 | 25 draws | Write 4^x |

F4 and F5 predate this change and do not change the verdict for these
identical-content templates: the brief asks for three blind solves plus
confirmation that the content is unchanged. I report them for the owner.
F1–F3 are cosmetic; no key, step or rationale is wrong.

## Tier disagreements

None is more than one official band.

- **quadratic-must-be-true.** Hard is at the generous end: about 35% of its
  draws are Medium-level c = f(0) reasoning.
- **rational-equation-solve.** Its proportion and ratio forms are Easy–Medium.
  This agrees with the author's flag.
- **polynomial-multiply.** Its coefficient forms are Easy–Medium.

## Fragment and validation

- **Fragment:** `.scratch/review-advanced/reviews.json` in the templates
  worktree.
  - It holds 45 accepted records with 185 solved samples, every blind answer
    as given.
  - Integers are numbers, fractions are exact strings, and multiple-choice
    answers are choice indices.
  - `scene` is null for every template here.
  - `templateVersion` and `fingerprint` come from
    `content/templates/sat-math.json`; `difficulty` comes from the source.
- **Validator:** `.scratch/review-advanced/check-fragment.js`, adapted from
  `tools/check-template-reviews.js`.
  - It passes: all 45 records agree with their keys, show three or more
    distinct displayed questions, and match the version, the recomputed and
    registry fingerprints, and the tier.
  - It also requires every listed template to be accepted or named as
    rejected.

## Uncertainty

- **Samples.** Three to thirteen seeds per template cannot exclude rare defects
  in unsampled branches. The 37 identical-content templates rest on unchanged
  records (600 per template, teaching text included) plus three blind solves
  each. Their earlier reviews remain the main editorial evidence for their
  content.
- **Tiers** are judgments against my reading of official SAT bands, not data.
  The quadratic-must-be-true call (Hard, accepted) is the least certain; a
  reasonable reviewer could call the template Medium–Hard and want the
  no-intercept facts moved to a Medium sibling.
- **Figures** were reviewed through alt text and the text labels of the 13
  SVGs the sampled seeds produced (no NaN, undefined or Infinity), not
  rendered pixels.
- **Frequencies** were measured on 600 draws per template: the gate's 300
  integer and 300 runtime-shaped seeds, except the quadratic-must-be-true and
  quadratic-solution-count distributions, which used integer seeds 0–599. Live
  runs use other seeds.

## Pass 2 (after the author's fixes, `lane/templates` 47d553a)

- **Scope:** the same 46 Advanced Math templates, as listed in
  `.scratch/lane/stale-templates-pass2.txt`. The author's pass-2 fixes are
  recorded in `2026-10-16-sat-math-realism-changes.md`, "Pass 2 fixes".
- **Baseline:** fa9b23c. Its `src/lib/families` and
  `content/templates/sat-math.json` are byte-identical to 2928051, the source
  reviewed in pass 1 (`git diff 2928051 fa9b23c` on those paths is empty).
- **Result:** 46 accepted, 0 rejected. The pass-1 rejection of
  `quadratic-context-model` is resolved. 19 fresh blind solves, 0 misses.
- **No tier changes:** no template's `difficulty`, rubric, tricks or other
  metadata changed in this domain.

### Pass 2 method

1. **Comparison.** Every template was instantiated on 600 seeds (300 integer,
   300 runtime-shaped) with the current source and with a copy of fa9b23c's
   `src/lib/families`. The comparison separated the displayed question and
   key (response type, stimulus, scene, figure, stem, choices, key) from the
   rationales and teaching text (explanation, steps, principles, trap, hint,
   `verified`).
2. **Displayed question changed.** Fresh seeds `rv1016b-adv.<id>.<n>` were
   solved blind, answers were logged before keys, and the full judgment was
   repeated. Seeds beyond n = 2 were located by form only, never by key.
3. **Text changed only.** I confirmed the displayed questions were identical,
   then read the changed fields old against new on the changed draws, with at
   least three distinct kinds of change per template where they existed.
4. **Carried forward.** Each pass-1 sample was rebuilt under both fa9b23c and
   the current source. The fragment builder refuses a sample unless the
   displayed question, choice order and key are identical to the one I solved.
5. **Checks.**
   - Family gate: `check-families --family`, all 13 changed templates pass.
   - The author's `test/sat-math-text.test.js` and
     `test/sat-math-realism.test.js` pass.
   - A slip scan over 600 draws of all 46 templates covered every field:
     articles before numbers, cut-off decimals, "below", written-out
     coefficients of one, and repeated clauses.

### Pass 2 comparison against fa9b23c (600 draws each)

| Group | Templates | Displayed question differs | Text only differs |
| --- | --- | --- | --- |
| Displayed question changed | quadratic-context-model | 101 | 15 |
| | quadratic-must-be-true | 319 | 108 |
| | nonlinear-formula-rearrange | 304 | 0 |
| | exponential-table-model | 26 | 0 |
| Text only | quadratic-factor-match | 0 | 78 (steps, explanation) |
| | rational-expression-combine | 0 | 26 (rationales) |
| | absolute-value-equation | 0 | 20 (trap) |
| | exponential-rewrite | 0 | 9 (explanation) |
| | absolute-value-cases | 0 | 45 (rationales) |
| | exponential-from-words | 0 | 12 (rationales) |
| | polynomial-multiply | 0 | 17 (explanation, steps, rationales) |
| | quadratic-solution-count | 0 | 5 (explanation, steps) |
| | rational-equation-solve | 0 | 44 (explanation, steps, rationales) |
| Identical | the other 33 | 0 | 0 |

This matches the author's classification. The counts differ slightly
because the runtime-shaped seed set differs.

### Fresh blind solves (displayed question changed)

| Template | Tier | Version | Seeds (n) | Blind answers | Agree | Band |
| --- | --- | --- | --- | --- | --- | --- |
| quadratic-context-model | Medium | v2 | 0, 1, 2, 11, 16 | C, 16, D, D, D | 5/5 | Medium (agree) |
| quadratic-must-be-true | Hard | v6 | 0, 1, 2, 5, 6, 11 | C, A, A, C, C, D | 6/6 | Medium–Hard; Hard accepted, as in pass 1 |
| nonlinear-formula-rearrange | Medium | v5 | 0, 1, 2 | D, A, C | 3/3 | unchanged |
| exponential-table-model | Medium | v7 | 0, 1, 2, 37, 47 | C, 1, 2, D, A | 5/5 | unchanged |

- **quadratic-context-model.** The pass-1 rejection is resolved.
  - **R1 (count rationale).** In 3,000 draws, 208 offer the count distractor
    of the "choose the price with more items" form. All 208 show
    "N − D · x = value, at that price" with x the chosen increase, and the
    value equals the offered choice. Seed 11: "324 − 12 · 3 = 288" at the
    chosen $18. The best-price count rationale (268 occurrences) also matches
    N − D·x at the vertex.
  - **R2 (stem).** All 507 pick-form stems in 3,000 draws read "Of the two
    prices that give this revenue". No "price of a boxs"-type phrase, plural
    after a count of one, or article slip appears in any field. The new
    "no sales" phrases read correctly in all five scenes (for example "the
    price at which the gym would have no members").
  - Seeds 0 (greatest revenue), 1 (pick, numeric), 2 (best fee), 11 and 16
    (pick, multiple choice) were solved. Their explanations, steps, traps and
    rationales are correct.
- **quadratic-must-be-true.**
  - **Dead entries.** Both are gone: 3,000 draws show exactly six fact
    descriptions, all live.
  - **Doubled sentence.** The doubled "so a > 0" is gone from explanations
    and steps (185 of 600 draws before, 0 now). It remains in "cannot"
    rationales for ab statements, where both the a reason and the b reason
    are joined: 74 of 600 draws. Seed 11, choice B: "It opens upward, so
    a > 0. Let h denote … The parabola opens upward, so a > 0; therefore …".
    This is cosmetic and was non-blocking in pass 1.
    - **Fix:** apply the same a-and-b filter in `reasonFor`'s "cannot" branch.
  - **Checks.** Keys, the "could" counterexamples (for example
    −4x² − 8x + 1 and −4x² − 48x − 143, both with their vertex in Quadrant
    II) and the explanations were re-checked on the solved seeds.
  - **Tier.** No-intercept facts are now 205 of 600 draws (34%), versus 35%
    before. My tier call is unchanged: Hard at the generous end, within one
    band.
- **nonlinear-formula-rearrange.** No stem says "below" in 3,000 draws
  (pass-1 F4); 2,479 say "the given formula" or "the given equation". Keys and
  rationales on seeds 0–2 are correct.
- **exponential-table-model.** No "1(b)^x" anywhere in 3,000 draws (pass-1
  F5). A coefficient of 1 now prints as "f(x) = 3^x" or "f(x) = (0.5)^x" in
  the choices, the explanation and the steps.
  - **Tells.** A choice without a coefficient is offered as a distractor as
    well as the key; seed 37 offers "9^x" and seed 47 offers "2^x". Seed 37's
    key was 3^x and seed 47's was (0.5)^x. The gate passes.
  - The `verify` regex was widened to read the coefficient-free form; the
    gate's `verified` holds on all draws.

### Text-only changes reviewed

All of these are correct, and none changes a displayed question or key.

- **quadratic-factor-match:** "5(2)x − 2x = 8x" replaces "+ (−2)x", and
  "−21x + x" replaces "+ 1x".
- **rational-expression-combine:** "Rewrites 1 as x/(x + 5)" replaces "1x/…".
  The b = 1 minus-sign rationale now reads "to x but not to the constant".
- **absolute-value-equation:** traps print exact fractions. Seed 38: "20/3",
  which I recomputed from the modelled slip |3x − 3| = 10, giving
  13/3 − (−7/3).
- **exponential-rewrite:** "an 87.5% decrease".
- **absolute-value-cases:** "…makes −2x + 2 positive and so passes the sign
  check". I verified on seeds 6, 11, 17 and 54 that the slipped candidate
  does make the right side positive and that the stated sums are right
  (pass-1 note resolved).
- **exponential-from-words:** "about 16.67% per day" replaces "16.6667%".
- **polynomial-multiply:** "−k = −6" and "the −x" replace "−1k" and "−1x"
  (pass-1 F2).
- **quadratic-solution-count:** "x² + x − 12" (F2).
- **rational-equation-solve:** "Collect terms: x = −17." (F3), and
  "x² + x − 20" in rationales (F2).

### Status of pass-1 findings

| Finding | Status |
| --- | --- |
| R1, R2 (quadratic-context-model) | Fixed; see above |
| F1 dead fact entries | Fixed |
| F1 doubled "so a > 0" | Fixed in explanations and steps. Remains in 74/600 "cannot" rationales (cosmetic, non-blocking) |
| F2 coefficient of one ("−1k", "1x") | Fixed in the three named templates. A written multiplier remains in the cross-multiplication step of rational-equation-solve, "5(x + 9) = 1(x − 7)": 29/600 explanations and 11/600 rationales. It is defensible as showing the cross-product. It is optional, non-blocking polish |
| F3 "x = −17, so x = −17" | Fixed |
| F4 "the formula below" | Fixed |
| F5 "1(4)^x" | Fixed |

### Carried-forward samples

- **42 templates** keep their pass-1 samples: 171 samples, all at
  `rv1016-adv.*` seeds.
- **Rebuild check:** every one rebuilds under the current source to the same
  displayed question, choice order and key as under fa9b23c, and agrees with
  the recorded blind answer.
- **Fresh samples instead:** for the 4 templates whose displayed question
  changed, the pass-1 samples are not carried. Only the 19 fresh `rv1016b-adv.*`
  samples are recorded.

### Pass 2 fragment and validation

- **Fragment:** `.scratch/review-advanced/reviews-pass2.json` in the templates
  worktree. It holds 46 accepted records and 190 samples.
- **Record fields:** `templateVersion` and `fingerprint` come from the current
  registry, and `difficulty` from the current source.
- **My validator:** `.scratch/review-advanced/pass2/check-fragment-pass2.js`
  passes. It is adapted from `tools/check-template-reviews.js` and also
  requires fresh seeds for the four changed-display templates and every
  listed template to be accepted or rejected.
- **Repository checker:** run in memory on these 46 records,
  `tools/check-template-reviews.js` (`reviewProblems`) reports 0 problems.
- **Negative test:** a tampered copy (stale version, pass-1 seed on a
  changed-display template, missing record) was refused.

### Pass 2 uncertainty

- **Sampling.** As in pass 1, sampled seeds and scans cannot rule out rare
  defects. The 33 identical templates rest on 600-draw equality, across every
  displayed and teaching field, with the source reviewed in pass 1.
- **Text-only templates.** These rest on displayed-question equality plus the
  changed text read on the draws listed above.

## Pass 3 (after the cold content review, `feature/sat` 4d7c613)

- **Scope:** the 26 Advanced Math templates on
  `.scratch/lane/stale-templates-pass3.txt`. That is every template in
  `equivalent-expressions.js` (15) and `nonlinear-equations.js` (11). The
  author's changes are in `2026-10-16-sat-math-realism-changes.md`, "Pass 3
  fixes".
- **Baseline:** 3f8e23a. Its `src/lib/families` and
  `content/templates/sat-math.json` are identical to 47d553a, the source
  accepted in pass 2. `git diff 47d553a 3f8e23a` on those paths is empty.
- **Result:** 26 accepted, 0 rejected.
  - No displayed question changed, so no new blind solves were needed.
  - 123 pass-2 samples were carried forward, with 0 misses.
  - No tier, rubric or other metadata changed.

### Pass 3 comparison against 3f8e23a (600 draws each)

| Template | Displayed question differs | Text only differs |
| --- | --- | --- |
| expression-substitution | 0 | 408 (hint) |
| quadratic-solution-count | 0 | 56 (trap, hint) |
| rational-equation-solve | 0 | 34 (explanation, steps, rationales) |
| the other 23 | 0 | 0 (every displayed and teaching field) |

This matches the author's classification; the counts differ slightly because
the runtime-shaped seed set differs.

### Changed text reviewed

- **expression-substitution.** When the equation hides x ± 1/x, the hint
  now asks "Can the given equation be written in terms of x + 1/x?" (or
  x − 1/x). I checked it on 3,000 draws.
  - For all 2,029 hidden-form draws, the sign in the hint matches the
    equation. x² − 1 = kx and x² − kx − 1 = 0 hide x − 1/x; the "+ 1" forms
    hide x + 1/x.
  - All 971 draws that give x ± 1/x directly keep "What happens when both
    sides are squared/cubed?", matched to the asked power.
  - Seeds 1, 2, 3 and 5 were read in full. The hint nudges without naming
    the method or the answer.
- **rational-equation-solve.** The cross-multiplied equation drops a
  multiplier of 1 on either side ("5(x + 9) = x − 7", "x + 6 = 2(x − 1)").
  So does the "own denominator" rationale ("5(x − 7) = x + 9"). The
  arithmetic is unchanged and correct on seeds 0, 23, 28 and 39. This
  resolves the pass-2 optional note.
- **quadratic-solution-count.** For a count-form equation already ending in
  "= 0" (298 of 3,000 draws), the trap now reads "Read a, b and c with their
  signs: a discriminant of 0 means one solution, not none, and a negative one
  means none." No other draw gets this trap or hint (0 mismatches). The trap
  is correct.
  - **The hint is new: "What is the sign of b² − 4ac?"** It names the method.
    The family contract in `docs/question-templates.md` says "the hint nudges
    without naming the method". The template's own which-equation form keeps
    a hint that does not name it ("What decides how many times the graph of
    y = ax² + bx + c meets the x-axis?"). This is the only SAT Math hint that
    names b² − 4ac.
  - **Judgment: non-blocking.** No key, step, rationale or explanation is
    wrong. Hints are opened only on request, and a hinted correct answer is
    not counted as correct. The brief's mandatory rejection grounds do not
    cover hint wording.
  - **Suggested fix:** reuse the sibling's wording, or ask "What do the signs
    and sizes of a, b and c tell you about the solutions?"
  - **Minor:** three of the 298 draws are "(x ± n)² = 0". For these the new
    trap ("Read a, b and c") and the older explanation ("Move every term to
    one side: x² − 8x + 16 = 0", seed 155) are roundabout; the direct reading
    is one repeated root. Both are correct. Optional polish.

### Pass 3 checks

- **Gate and text test.** The family gate passes for all three changed
  templates, and the author's `test/sat-math-text.test.js` passes.
- **Carried forward.** All 123 samples in the 26 records were rebuilt under
  3f8e23a and under the current source. Each displays the same question,
  choice order and key, and agrees with the recorded blind answer. The
  samples are the pass-1 `rv1016-adv.*` seeds; for nonlinear-formula-rearrange
  they are the pass-2 `rv1016b-adv.*` seeds.
- **Not in this pass's scope.** The optional quadratic-must-be-true
  rationale trim (pass 2) is not here: its file, `nonlinear-functions.js`, is
  not on the pass-3 list.

### Pass 3 fragment and validation

- **Fragment:** `.scratch/review-advanced/reviews-pass3.json` in the templates
  worktree.
  - It holds 26 accepted records and 123 samples.
  - `templateVersion` and `fingerprint` come from the current registry, and
    `difficulty` from the source.
- **Validation:**
  - My checker, `.scratch/review-advanced/pass3/check-fragment-pass3.js`,
    passes.
  - Run in memory on these 26 records, `tools/check-template-reviews.js`
    (`reviewProblems`) reports 0 problems.
  - A tampered copy, with a stale fingerprint and a missing record, was
    refused.

### Pass 3 uncertainty

As in passes 1 and 2, sampled seeds and scans cannot exclude rare defects.
The 23 identical templates rest on 600-draw equality with the source accepted
in pass 2.

## Pass 4 (coordinator's hint fix, `feature/sat` 2434762)

- **Change:** commit 2434762, by `coordinator-20261016`, re-versions all 11
  templates in `nonlinear-equations.js`.
- **Comparison:** 600 draws per template (300 integer, 300 runtime-shaped)
  against d309339.
  - Every displayed field and key is identical for all 11 templates.
  - The only other difference is the `quadratic-solution-count` hint, in
    56 of 600 draws. Every other teaching field is identical.
- **Hint judgment:** accepted.
  - Over 3,000 draws, all 298 count-form equations already "= 0" now get "What
    decides how many times the graph of y = ax² + bx + c meets the x-axis?".
    That is the which-equation form's hint, and it nudges without naming the
    method.
  - No hint names b² − 4ac or the discriminant. Other count-form equations
    keep "What does the equation look like with every term on one side?".
  - This resolves my pass-3 finding. The gate passes.
- **Records:** 11 accepted, 0 rejected. The 53 pass-3 samples were carried
  forward; each rebuilds to the same question, choice order and key as under
  d309339 and agrees with my recorded answer. Versions and fingerprints come
  from the current registry. `quadratic-solution-count` records
  `author: "coordinator-20261016"`; the other 10 keep
  `templates-lane-20261016`.
- **Fragment:** `.scratch/review-advanced/reviews-pass4.json`.
  - My checker, `.scratch/review-advanced/pass4/check-fragment-pass4.js`,
    passes, and refused a copy with the wrong author.
  - Run in memory on these 11 records, `tools/check-template-reviews.js`
    (`reviewProblems`) reports 0 problems.
