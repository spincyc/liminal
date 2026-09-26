# Cold review — 2026-09-26 (at 7bace28)

**Status:** see "What was done" at the end. This file records what the review
found at the time; line numbers and counts refer to 7bace28.

Six independent read-only reviews of a pinned copy of 7bace28: SAT Math
templates, SAT Reading and Writing templates, the app as a study tool
(headless Chromium, desktop and 390×844), code, tests and gates, learning
content, and the ACT banks. Findings marked ✔ were reproduced a second time
by a different route. The gate at 7bace28 passed, with 293 tests.

## Verdict

The fixes of 2026-09-25 held: 0 wrong keys in 687 hand-solved Math items and
793 blind-answered Reading and Writing items, every Math worked example in
Learn correct, facts sourced, recording complete in both feedback modes, and
tests that route, break, time out and resume correctly. Practice could still
overstate readiness, through channels the earlier review did not reach:

1. **The skill map could be passed by chance.** The gate was 16 of the last
   20 Medium answers, checked after every set: a student right 70% of the
   time met it within 60 Medium answers 82% of the time. Mastered was 3 of
   5 Hard: a student right on 30% of Hard questions reached it within 20
   Hard answers 70% of the time.
2. **Repeats counted as new evidence.** Review re-serves a miss the next day
   exactly as it was, and Retry, Missed review, Marked and Retake serve seen
   questions; on one record Hard accuracy was 37.6% on first encounters and
   42.7% as reported. A drill could fill the gate window in one sitting from
   three designs.
3. **Hard is still inflated.** Math: of 59 Hard templates, 24 play at
   hard-module level, 18 mix a Medium form in, 17 are Medium work. Reading
   and Writing: of 31, 11 hard, 10 mixed, 10 Medium or below; every harder
   Module 2 served all five Expression of Ideas Hard templates, and all three
   Hard Rhetorical Synthesis templates play Easy.
4. **Tells the gate did not measure.** Look-alike pairs (the key one change
   from a distractor: `graph-which-function` 558/558), text hubs
   (`quantitative-table-difference-in-benefit` 85%), the most-similar pair
   (up to 100% in some templates), a Hard conventions key form in 74–100% of
   draws (`sec-dangling-modifier` blind 88%).
5. **ACT is where the SAT banks were.** Difficulty is a label (median steps
   flat across tiers); a 36-question Reading set read about 27 passages
   (18,000 words in 40 minutes); Science is near-duplicate filler; 378 of 575
   Math stems carry a lead sentence, some naming the method; two Math keys
   were wrong; English goal-assessment items are the longest "Yes" 91%.
6. **A saved test could be lost silently** by starting any other set.

## Content defects — SAT Math

| Sev | Where | Defect |
| --- | --- | --- |
| critical ✔ | `successive-percent` "closest to p" | The key was p rounded while a distractor was not; in 6.4% of that form a distractor was nearer (1.4% of all draws) |
| high ✔ | `data-change-statistics` | "unchanged from in the original" in 23% of draws; key echoes the stem 683/683; the two-group form always keys a standard deviation |
| high ✔ | look-alike pairs | Key in a one-change pair: `graph-which-function` 558/558, `quadratic-structure-form` 386/386, `arc-sector-inscribed`, `regular-polygon-angles`, `chord-arc-height`, `circle-equation-complete-square`, `pythagorean-two-step`, `frequency-distribution-probability`, `quadratic-irrational-solutions` |
| high | `absolute-value-cases` | "Infinitely many" is the key 61.5% of the times it is offered |
| high | tiers | The 17 Medium-level and 18 mixed Hard templates listed in the lane report |
| medium | numeric keys | 0 of 49,200 numeric draws have a fraction key; 92% of Hard numeric keys are integers |
| medium | text | "a 80%", "1y", "1 boxes", "1 radians", "x-²", cut-off decimals (158.3333%), non-integer people |
| medium | `outlier-removal-fit`, `interval-mean-scope`, `system-word-totals` | Wrong explanation for a left-end outlier (24%); a fixed key shape; distractors above the stated total |

## Content defects — SAT Reading and Writing

| Sev | Where | Defect |
| --- | --- | --- |
| high ✔ | tiers | 10 Hard templates play Medium or below; a harder-route section served 8.0 such items, 7.7 mixed, 7.3 hard |
| high ✔ | Rhetorical Synthesis Hard | All three play Easy ("Although [difference], [similarity with both]" finds the key 95%) |
| high ✔ | conventions habits | `sec-dangling-modifier` name + finite verb 88–93%; `sec-adverb-interrupts-clause` 74%; `sec-closing-mark-match` comma choices free; `sec-relative-vs-pronoun-clause` and `sec-conjunctive-adverb-join` one key form 100% |
| high ✔ | `evidence-poem-quotation` | The key is the latest quotation 92% |
| high ✔ | thin Hard cells | 23–30 distinct items in Central Ideas, Text Structure, Transitions, Command of Evidence Hard; 60–70% repeats by the third Hard drill |
| medium ✔ | tells | Most-similar pair and text hub up to 100%; Likewise/Similarly never the key in `transition-instead-or-despite`; readability grade 9.5 / 10.2 / 10.5 by tier |
| low | text | A reversed rationale (boundaries.js:1490), "every year" for Old Faithful, a real finding credited to an invented researcher, invented researchers in real places |

## App and code defects

| Sev | Defect |
| --- | --- |
| high ✔ | Repeats counted in accuracy and the gate (above) |
| high ✔ | The gate met by chance and by massed drill (above) |
| high ✔ | Starting any set overwrote a saved test in `liminal:session:v1`, with no prompt |
| high ✔ | The set report counted a hinted answer as correct ("2 of 2, 100%" while History said 50%) |
| high ✔ | After the diagnostic, Next focus and Recommended next named different skills; 20 questions over 19 skills cannot fill a skill map |
| medium ✔ | A correct answer after a hint never entered Review, Missed or the error log |
| medium ✔ | A section test showed as three History rows and a full test as five; the test row kept its old tiers |
| medium | Discard recorded nothing; Save and exit paused a test module's clock indefinitely |
| medium | The full-length report mixed both sections in one headline |
| medium | One plan and weekly goal shared by SAT and ACT |
| medium | The template fingerprint covers 8 seeds, so a rare-seed edit keeps its version |
| low | Rules written in the error log never came back; Review sets could take two versions of one design; pacing tables overflowed at 200% text; skill-map rows had no row headers; a missing difficulty defaulted to Hard in three places (22 templates relied on it) |

Gates: the smoke test still exercised the retired SAT banks; check-all gated
them; check-difficulty and audit-questions (which would catch the ACT
defects) did not run.

## Learning content

All ~95 Math worked examples correct, all 30 facts verified. Defects: "every
question is worth the same" (contradicts College Board's scoring page);
Hard and Medium templates testing ideas no page taught (about 30, listed in
the lane report, from scaling identities to line–circle tangency, which the
template explained with a formula outside the SAT's scope); Math pacing
checkpoints that did not add up; no count of official practice tests (8,
Practice Tests 4–11) and plans that scheduled them late; drill thresholds,
redo schedules and an unverifiable College Board quote that disagreed with
the app; an ambiguous pronoun example; missing Boundaries rules; no literary
worked examples; ACT English and Math blueprints from the legacy test.

## ACT

Scope for templates, in order: Math (about 100 templates, 55 adapted from
SAT Math), then passage-set infrastructure and Science (about 24 set
templates), then English (slot generators over authored passages), then
Reading (authored passages kept as fixed sets). Interim: stop using ACT
tiers, draw whole passages, fix the wrong keys, and label the content as
checked automatically only.

## What was done (2026-09-26)

Everything in the tables above except what `docs/roadmap.md` lists under
Next: the retirement of the SAT banks and the `core.js` split (in
progress), ACT templates (ACT Math in progress), a widened fingerprint, and
the calculator. In brief:

- **Honest evidence.** Gate 24 of the last 30 Medium, Mastered 10 of the
  last 15 Hard, each window over two days and two designs, each question
  counted once at its first answer; repeats left out of accuracy; a hint
  makes a miss; Hard accuracy on each design's first appearance; ACT skills
  by accuracy only.
- **Gates.** Look-alike pairs (check 13), most-similar pairs and text hubs
  (checks 14 and 8), short-choice length by characters, visible text slips
  (check 15), approximation keys, declared tiers; the Learn gate checks the
  Math plan states the app's bars.
- **Templates.** Re-tiered and rebuilt by five template lanes (Math:
  Algebra and Advanced; Problem-Solving and Geometry; Reading and Writing:
  Information and Ideas; Craft and Structure with Expression of Ideas;
  Conventions), with 36 new templates, most of them Hard designs; the
  wrong key fixed; every template passes at 3,000 reps. The authors
  answered their own new items blind (about 570 items, no disagreements),
  which is not an independent check.
- **App.** One next step on every page; official scores beside recent
  accuracy; highlights, notes and a line reader; protected tests, recorded
  discards and wall-clock modules; per-section reports; Review rules;
  per-test plans; one History point per test.
- **Learn.** About 50 new taught recognitions with worked examples, the
  Boundaries rules, literary examples, corrected scoring, pacing, plans and
  ACT blueprints.
- **ACT.** Whole passages, integer keys, accuracy only.
