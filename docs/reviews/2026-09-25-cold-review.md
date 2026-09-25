# Cold review — 2026-09-25 (at 71d3394)

**Status:** every defect below was fixed, and every recommendation in the
integration design and the ranked gaps was built, in the commits that follow
71d3394 on 2026-09-25 (see `docs/roadmap.md`, "Done"). This file records what
the review found at the time; line numbers and counts refer to 71d3394.

Five independent read-only reviews: SAT Math templates, SAT Reading and
Writing templates, the app as a study tool (headless Chromium, desktop and
390×844), code, tests and gates, and learning content. Findings marked ✔ were
reproduced a second time. The gate at 71d3394 passed, with 111 tests.

Commands run from the repo root. `sample X s` =
`node tools/check-families.js --sample X --seed s`.

## Verdict

The core is sound: the Bluebook-style shell, the SVG sanitizer, BigInt
masks with a permanent registry, Math keys (no wrong key in ~900
hand-solved items and 70k+ solver-checked instances), and clean, factual R&W
prose. But practice still overstates readiness — the original failure —
through five channels:

1. **Tier inflation.** Math Hard: ~15 of 40 templates are hard-module level
   (16 Medium, 9 mixed). R&W Hard: 10 of 29 (19 play Medium or below). The
   tier is a self-scored rubric; nothing measures it.
   `tools/check-difficulty.js` and `check-shapes.js` read only the old
   banks and are not in `check-all.js`.
2. **Answer tells.** Math: a blind "hub" strategy (the key is the value
   every distractor varies) scores 37% on Hard MC, 42% on Algebra Hard.
   R&W: fixed key phrases (✔ "By suggesting that" is the key 200/200 in
   `cross-text-method-challenge`, never a distractor), transition words that
   are always or never the key, grammar sets where the key is the odd one
   out (enforced by `verify()` in `form-structure-and-sense.js:225-227,
   859-860`), shortest-choice-is-key up to 100% in some templates.
3. **Recording drops hard items.** ✔ Instant-feedback mode records only
   checked answers (`src/app/app.js:943-958`); skipped/unchecked items never
   reach Progress. Hints are not recorded. Legacy fixed-bank attempts (with
   inflated Hard labels) are mixed into Hard accuracy.
4. **Full-length practice uses the discredited bank.** The only full-length
   SAT is the printed booklet, built from `content/banks/sat-*.json`
   (`src/app/print.js:176-194`): 560/575 SAT Math stems name the method.
5. **Mix and variety.** ✔ The picker balances skills, not domains
   (`src/lib/runs.js:64-104`): Math runs are Algebra 26 / Advanced 22 /
   PSDA 31 / Geometry 21% vs the real 35/35/15/15. 73 of 86 R&W
   "templates" are fixed banks of 10–14 items; verbatim repeats reach 16% by
   the 4th full section and 44% by the 8th Hard module.

As a study tool it is a question dispenser: ~48k words of SAT guides are not
shipped; the only shipped learning content (Study tips) has live factual
errors; no diagnostic, mastery map, error log, spaced review, on-screen
module simulation, or pacing data.

## Content defects — SAT Math

| Sev | Template / seed | Defect | Fix |
| --- | --- | --- | --- |
| critical (rare) | ✔ `uneven-table-growth` 462 | Key −3200: machine worth −$3,200; 21/2000 keys ≤ 0 | Reject draws whose extended value ≤ 0 |
| high | ✔ `two-estimates-compare` 7 | "likely Main > Oak" vs key "plausible equal" both defensible (z = 2.45); margins random and contradict sample size in 352/1000 | Derive margin from p and n; draw overlap only when gap < larger margin; make that distractor a definite claim |
| high | `rational-exponent-rewrite` 14 | "x³/⁵√(x⁶)" reads as x^(3/5)·√(x⁶) (63/1000) | Parenthesize or typeset the root index |
| high | ✔ `inequality-word-limit` (2/2000 at gate seeds; 37/20000 runtime seeds) | `verify()` false: two correct choices (41 + 37n ≥ 410 and 41n + 37 ≥ 410). App ignores `verified` | Redraw on `!verified` in `runs.drawQuestions`; gate uses runtime-shaped seeds and more reps |
| medium | `extraneous-roots` seed `1mtgncs.extraneous-roots.0` | Throws "only 2 distinct distractors" (3/20000); session fails to start | Fallback distractors; retry on throw |
| medium | `root-sum-product`, `system-constant-from-solution`, `extraneous-roots`; `discriminant-parameter` 7, `monomial-exponent-rules` 84 | Modelled mistake equals key: distractor silently dropped, or trap text names the key as "wrong" | Reject a draw when any modelled mistake equals the key |
| medium | `inequality-integer-optimization` | Device-count limit never binds (202/202); trap teaches ignoring it | Make the limit bind ~half the time |
| medium | `exponential-rewrite` (nonlinear-functions.js:1270/1277), `expression-substitution` 15 (equivalent-expressions.js:917), `slope-from-two-points` (linear-functions.js:247) | Wrong distractor rationales | Fix text |
| medium | `two-way-table-chance` 5, `similar-triangles-parallel`, `expression-substitution` (2²⁰ vs 4¹⁰), `two-way-or-neither` | Free eliminations: probability > 1, area fraction ≥ 1, equal distractors, key is the only reduced fraction | Filter |
| medium | `sample-proportion-estimate` 58 | "Proposal a … c"; "would be expected to are healthy" | Fix casing and phrase |
| medium | `altitude-area` (area-and-volume.js:52,220) seed 4, 67; `similar-triangles-parallel` 2 | Altitude foot past base with no extension (235/788); NaN in 40/2000 SVGs; "to scale" figures contradict lengths (124/203) | Constrain offset; build from lengths; gate scans SVG for NaN |
| medium | `exponential-table-model`, `rational-exponent-rewrite`, `circle-measure-basic`, `unit-circle-quadrant` 5 = 11 | Variety overstated: gate counts reordered choices as distinct | Dedupe on stem + sorted choices |
| low | numeric keys | No repeating-fraction keys (all 109,826 terminate); ±0.001 tolerance (`core.js:443-450`) accepts 2.999 for 3 | Allow fraction keys; tolerance from the answer grid |
| low | lint | "1 hours", "$0.8", "kx + −6y", "4(3)((−7))", ASCII minus; `equation-solution-count` "exactly one" is always x = 0 | Plural and number helpers |

Blind-strategy worst cases: `linear-model-interpretation` 70–73%;
`exponential-table-model` 594/594; `unknown-coefficient-product` "all
values" key = union of two choices 203/203; `circle-equation-features`
798/798; `unit-circle-quadrant` key in the only ± pair 573/899. Nine
templates never put the key at the extreme value: `linear-graph-context`,
`multi-unit-rate`, `percent-change-between-values`,
`fit-slope-rescaled-units`, `margin-and-sample-size`,
`rectilinear-floor-plan`, `triangle-side-bounds`, `pythagorean-two-step`,
`tangent-radius-right-angle`.

Math tiers:
- **Hard → Medium:** linear-expression-from-equation, linear-model-interpretation,
  system-parameter-solution-count, two-plan-crossover,
  inequality-integer-optimization, linear-function-transformation,
  system-square-identity, extraneous-roots, multi-unit-rate,
  uneven-table-growth, sample-inference, average-rate-two-legs,
  percent-mixture-fixed-part, displacement-and-transfer,
  similar-triangles-parallel, angle-chase-not-to-scale.
- **Mixed Medium/Hard forms:** literal-equation-rearrange,
  expression-substitution, function-transformation-table,
  polynomial-factor-remainder, successive-percent, data-change-statistics,
  conditional-two-way, trig-similar-cofunction, scaling-area-volume.
- **Medium → Easy:** linear-equation-word-model, two-variable-equation-model,
  inequality-word-limit, mean-missing-value.
- **Strong Hard designs to copy:** linear-function-identity,
  inequality-region-corner, unknown-coefficient-product ("could be"),
  discriminant-parameter, exponential-rewrite, root-sum-product,
  probability-after-change, weighted-mean-groups, conditional-two-way (hidden
  row), fit-slope-rescaled-units, circle-equation-complete-square,
  unit-circle-quadrant.

Math coverage gaps, highest value first:
1. Graph-based Algebra and Advanced Math (1 of 31 Algebra and 1 of 27
   Advanced templates ever show a graph): "graph of f shown; which could
   define f"; systems from two lines; shaded inequality regions; "for which k
   does f(x) = k have 2 solutions"; g(x) = f(x − 2) + 1 from a graph.
2. Quadratic structure: form that shows vertex/zeros; vertex from −b/2a;
   tangent-line k for parabola or circle (Hard).
3. Unknown constants on both sides: a(x − 3) + 2x = 5x + b infinitely many
   solutions, find a + b; systems with two constants.
4. Exponential models from words: "6% every 2 years" → a(1.06)^(t/2);
   linear vs exponential; monthly-rate rewrite; crossing point.
5. Inscribed and composite figures; chord distance; altitude-to-hypotenuse.
6. Hard one-variable data: "which could be the median"; histograms; spread
   of dot/box plots.
7. Two-variable inequalities and intercept meaning in context.
8. Solving nonlinear formulas; rational equations; common-base exponentials.
9. Density and derived units; chained ratios; "x% of y = z% of w".
10. Scatterplot residuals; linear vs exponential fit.

Every skill has exactly 2 Hard templates; word problems reuse 4–8 settings.

## Content defects — SAT Reading and Writing

| Sev | Template / seed | Defect | Fix |
| --- | --- | --- | --- |
| critical | `sec-adverb-interrupts-clause` 3, 13, 10, 21, 65 | No-comma choice is standard for nevertheless / instead / meanwhile / consequently / similarly in 5 of 12 scenes; explanation teaches a false "must be set off by commas" rule | Make that distractor a one-sided comma, or limit to however / for example / in fact |
| critical | ✔ `wic-figurative-meaning` 10 | Distractor "flowered" is a synonym of "bloomed" in the same figurative sense; key "swelled" | Replace distractor |
| high | `cross-text-common-ground` 9 (D); `sec-pronoun-distant-antecedent` 27; `sec-conjunctive-adverb-join` 1,2,4,7,9,11,14 ("; nevertheless" with no comma); `wic-uncommon-sense` 6; `limits-of-evidence` comet (D); `notes-explain-benefit` seabird A, online-council C; `notes-introduce-to-newcomers` serrat-aqueduct B | Arguable second answers | Rewrite; record a human key review per item |
| high | ✔ `cross-text-method-challenge` and others | Fixed key phrases: "By suggesting that" 200/200 key; "To assess" 11/11; "To explain" 11/11; "It offers a specific case" 11/11; "acknowledges/concedes" 11/11; "By noting" 10/10 | Rotate key wording; give distractors the same openers |
| high | transitions | Afterward, Subsequently, Later, To be sure, Granted, Admittedly: key 100% when shown; Indeed, Earlier, Previously, Before that: never key | Use each word as key and distractor across scenes |
| high | `sva-compound-subject`, `sva-attractor`, `sva-inverted`, `finite-or-nonfinite`, `conjunctive-adverb-join`, `relative-vs-pronoun-clause` | Key is the odd one out (600/600 for SVA; enforced by `verify()`) | Split choices 2+2 by number with tense as a second feature; gate "key alone on a feature" |
| high | 73 of 86 templates | Fixed banks of 10–14 items; gate counts reshuffled choice orders as variety | Count distinct passage + choice sets; track seen (template, scene); grow to 25+ |
| medium | `tsp-function-foil` 100%, `sec-no-colon-after-verb` 100%, `sva-compound-subject` 94%, `finite-or-nonfinite` 84%, `tsp-main-purpose-explain` 76% | Shortest choice is key; C&S longest-is-key only 5% (gate pushed keys short) | Gate shortest-is-key too; both near 25% |
| medium | `tsp-structure-view-complication` 30/30; `tsp-function-foil`; `intro-clause-comma` (always comma); `no-colon-after-verb` (always no mark) | Key form never varies | Add scenes where the reflex is right |
| medium | cross-text-connections.js:1256; method-challenge 30 | `lower()` lowercases proper names only in distractors ("whitfield's") | Lowercase first char; skip names |
| medium | rhetorical-synthesis (hearth-study, seabird-drones) | Distractors add facts not in the notes yet are called "Accurate"; `grounded()` checks numbers only | Check words against notes |
| medium | inferences.js:856, :1212; `sec-parallel-paired` 3; `sva-compound-subject` explanation; `sec-dangling-modifier` 5 | Trap/hint/explanation text misfires or teaches the giveaway | Per-scene text |
| medium | inferences.js:188; cross-text-connections.js:1304 | R&W `verify()` checks structure only; `verified: true` says nothing about the key | Rename; record human review |
| low | `sec-pronoun-distant-antecedent` 2; `sec-dangling-modifier` 16; anole and acacia-ant studies | Factual slips; real studies credited to invented researchers | Correct or fictionalize fully |
| low | `quantitative-table-weakens-trend` 4 | Reversal 1.15 → 1.14 m/s (≈2% of seeds < 1%) | Minimum reversal size |
| low | rhetorical-synthesis; runs.js:127 | Always 5 bullets; question order random, not domain order | Vary 4–8; order by domain in test mode |

Readability by tier: grade 9.1 / 9.7 / 10.2; Hard WIC keys are everyday
words (spare, temporary, gradual). No pre-1920 prose, no poetry.

R&W tiers:
- **Hard → Medium or lower:** author-qualifies-source, finding-vs-expectation,
  competing-explanations, weakens-causal-claim, quotation-two-part,
  table-difference-in-benefit, wic-connotation, tsp-structure-view-complication,
  tsp-function-foil, tsp-purpose-evaluate-source, cross-text-method-challenge,
  cross-text-difference-in-view, the three Hard transition templates,
  notes-finding-and-significance, notes-result-versus-expectation,
  pronoun-distant-antecedent, verb-tense-frame.
- **Borderline Hard:** limits-of-evidence, notes-similarity-despite-difference,
  closing-mark-match.
- **Medium → Easy:** corrected-belief, controlled-comparison,
  table-change-for-one-group, wic-figurative-meaning, tsp-function-concession,
  cross-text-counterexample, transition-later-step, notes-generalize-category.

Relabeling R&W honestly drops Hard to ~10 templates, below the gate's 27; the
gate must not be weakened, so relabeling and new Hard templates ship together.

R&W coverage gaps, ranked: high-register Hard WIC (tenuous, circumscribed,
equivocal); pre-1920 prose and poetry; graph-based quantitative CoE; Hard SEC
testing two features at once; title vs appositive punctuation; possessive vs
plural; tense and mood; Hard cross-text with partial agreement; harder
rhetorical synthesis (6–8 bullets, audience goals); transitions that all
point one way; punctuating quotations; "comma + and/but" never the key.

## App and code defects

| Sev | Defect | Evidence | Fix |
| --- | --- | --- | --- |
| high | ✔ Instant mode records only checked answers; skipped/unchecked items vanish | app.js:943-958; test-shell.js:1279-1294 | In `onFinish`, record every item not already recorded |
| high | Editing a template silently changes what old ids and run codes rebuild | a probe: one extra `t.random()` changes the stem an old id rebuilds | Template `version` in registry and id; fixture test hashing `instantiate(family, fixedSeeds)` |
| high | SAT booklets from fixed banks (560/575 Math stems name the method) | print.js:176-194 | Build from template runs, or hide SAT booklets |
| medium | Runtime ignores `verified`; gate seeds 0–199 only | instantiate.js:73; runs.js:191-208; check-families.js:300 | Retry in `drawQuestions`; runtime-shaped seeds |
| medium | 224 of 271 Math verifies never check distractors; some tautological (percentages.js:441,462) | code review | Generic distractor re-evaluation; correct docs |
| medium | Exit discards the set; end mode records nothing, no resume | app.js:962-964; test-shell.js:445-446 | Record or offer resume on exit |
| medium | Start silently blocked when count > field max (Circles Hard max 2; Missed 18) | index.html:85-93; app.js:620,636,663-667 | Clamp the field when max changes |
| medium | Hints not recorded | app.js:988-1006; test-engine.js:396 drops `hinted` | Store `hinted`; report hinted-correct apart |
| medium | Missed/Marked ignore filters but show "1 filter on" | app.js:498-505 | Apply or hide filters |
| medium | Two tabs overwrite each other's progress | app.js:89,128-139 | Merge append-only attempts; `storage` listener |
| medium | "Prefer unseen" is a lifetime union; after 4 Hard sets each shares 2–4 of 10 templates with the last | runs.js:144-184 | Prefer least recently served |
| medium | Legacy fixed-bank attempts in Hard accuracy | app.js:1072-1078; core.js:374-392,460-501 | Tag `source`; separate legacy |
| low-med | Marked list only grows | app.js:948-951 | Mirror mark state |
| low | Resume crashes on bad snapshot | test-shell.js:405-424; app.js:972-976 | Catch, discard, message |
| low | Mixed-section pace uses first question's section (mini test 23:42 vs 27:21) | test-engine.js:344-347 | Sum per question |
| low | `scoreResponse` scores null/"" as correct when key is A | core.js:452-458 | Require a response |
| low | `summarizeProgress` counts unresolvable attempts only in the denominator | core.js:470-494 | Filter both |
| low | Set code shown; nothing accepts it | test-shell.js:1634; runs.js:136-145 | Add rebuild entry or drop claim |
| low | Mini test runs Easy→Medium→Hard per section; RW directions and calculator mixed | app.js:766-773, 812-827 | Shuffle within section; section boundary |
| low | 1–1.4 MB legacy banks load on every SAT section change | app.js:245,1065,1283; index.html:331 | Lazy-load for legacy ids only |
| low | Focus falls to body after Hint/Check | test-shell.js:1464-1465 | Keep focus |
| low | Raw math notation (^ in ~3%, slash fractions ~14%) | render.js | Typeset ^, a/b, √ with the existing `frac()` |
| low | Reload pauses a timed set | test-engine.js:403-411,450 | Count wall time for timed sets |
| low | Header overflows at 200% text; no dark mode | tokens.css:8 | Wrap header; dark tokens |
| low | Booklet `escapeHtml` doesn't escape quotes | booklet.js:115-120,161 | Escape quotes |
| low | Every keystroke saves full question objects | test-shell.js:1160; app.js:906-913 | Store ids; debounce |

Architecture before feature growth: `src/lib/progress.js` (attempt schema v3
with templateId, runCode, hinted, timeMs, feedback, source; injected storage;
migrations; tests); `src/lib/practice.js` (buildTemplateRun, templateMiniTest,
runFilters); one skill-accuracy model (today three: core.summarizeProgress,
app.weakestSkill, core.recommendQuestion; thresholds duplicated); a lib state
machine for modules/review/break; one text renderer shared by booklet and
shell; split `test-shell.createShell` (lines 384–1919); move DIRECTIONS,
SPR_RULES and the reference sheet to `content/`.

Stale docs and copy: README SAT rows (575/575, "4,025 questions", "set code
that rebuilds it"); setup lede "1,150 original SAT questions"
(app.js:189-199); question-templates.md "verify by a different route"; roadmap
"27 types … Hard math reps mode"; AGENTS.md read list omits
question-templates.md and content step 1 would regenerate the discredited SAT
banks; schema.md and content-authoring.md describe banks only; study guides
cite "4,025 items" and "575 per section".

## Learning content

Not shipped: `tools/build.js` copies only src/, banks and answer-signs.js.

Live errors in Study tips (`content/guides/answer-signs.js`):
- ✔ :298 "no negative signs allowed in the SAT grid on many items" — negatives
  are allowed (5 chars positive, 6 with minus). Source:
  https://satsuite.collegeboard.org/media/pdf/sat-practice-test-5-digital.pdf
- ✔ :662 ACT Math "five choices (A–E)", "questions 50–60", "question 58" — the
  enhanced ACT has 45 questions, 50 min, 4 choices.
  https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/act-exam-sections-and-structure.html
- ACT English "36 s/question", Reading "52 s" — 42 s and 67 s.
- ✔ :178 "The SAT prizes concision" — concision is not an SAT testing point
  (Assessment Framework, Appendix B:
  https://satsuite.collegeboard.org/media/pdf/assessment-framework-for-digital-sat-suite.pdf).

Guide errors: ✔ `sat/math/03-problem-solving-and-data-analysis.md:184` "add
a constant: median same" (it rises by the constant); concision/DELETE taught
as SAT (05-grammar-reference:3, 509-511, 543-547, 571; 05-universal:539-557;
04:271-272); parallelism, comparisons, who/whom, fewer/less taught though not
official, verb finiteness barely covered; catalog FSS subskill "parallel
structure" is not official and "possessives and plurals" is missing;
complex numbers listed as tested (formula-reference:260-270, 12-week:334);
"practice estimates within 20–30 points" (01:230-232) has no basis and
contradicts the no-estimate decision; mixed-number "31/2" rule is paper-grid
legacy; WIC/Transitions per-module counts wrong; trig "almost entirely
right-triangle" (unit circle is tested); concordance rows; ACT New York July
and score-release lag. Time-sensitive facts in 01, 03, 08 lack
verify-before-relying notes.

Pedagogy: content is downplayed for a ~500 student (04:60-76; 07:369-372;
diagnostic-routing:47); contradictory heuristics (adv-math 226/252 vs
algebra 343); missing worked examples for Transitions, TSP, Cross-Text,
quantitative CoE, nonlinear systems; drill volumes exceed template caps;
plans never name official Bluebook practice tests or say Liminal accuracy is
not a score. Coverage gaps: absolute value, box plots, unit circle, verb
finiteness, two-way-table probability, rearranging formulas.

Answer tells on Liminal items barely beat chance in aggregate (Math middle
value 67% vs 50% chance; RW most-hedged 34% vs 25%), so tells do not explain
the 700 → 500 gap; tier inflation and recording do.

Integration design: one page per catalog skill at
`content/learn/<sectionKey>/<domain-slug>/<skill-slug>.md` (19 Math, 10 RW)
plus `content/learn/sat/general/`; `facts.json` for time-sensitive numbers
with verified date and source; pure `src/lib/learn-markup.js` (safe subset:
headings with ids, lists, pipe tables, typed callouts "Fails when" /
"Example" / "Verify", no HTML or images, links only to learn ids or
collegeboard.org/act.org/desmos.com); `src/app/learn.js` renders via
textContent; `tools/build-learn.js` → `dist/content/learn-sat.js`;
`tools/check-learn.js` gate: every catalog skill has exactly one page,
every subskill anchor exists, every template's (skill, subskill) resolves,
required sections, facts sourced, no ACT-only rules on SAT pages. Links from
Progress rows, each explanation, and "Practice this skill" on each page.
