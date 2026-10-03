# Expression of Ideas expansion and repair — 2026-10-03

## Owned production changes

- src/lib/families/sat/reading-writing/expression-of-ideas/rhetorical-synthesis.js
- src/lib/families/sat/reading-writing/expression-of-ideas/transitions.js
- test/expression-review.test.js
Common helpers were unchanged. Registry, review-manifest and repository integration are recorded in the [corpus report](2026-10-03-sat-corpus-expansion.md).

## Final source hashes

- rhetorical-synthesis.js: cf10c2bc638861f3385f079b052459de79a1c9113281977499c55c46193e05a9
- transitions.js: 92ef90173fd735920e36b10fd756ca373647fd54084aa575a29bc28fd352cfd3

Final capacity: 34 Expression designs: Easy 8, Medium 16, Hard 10. Nine new Hard designs replace the originally requested five plus the capacity lost by four justified retiers. They contain 96 original scenes: six synthesis designs with ten scenes each and three transitions designs with twelve each. Every design was authored by a distinct fork_turns:none child restricted to its own scratch directory; the lane coordinator integrated the authored snippets. These are new reasoning designs, not aliases, reordered choices, or renamed old templates.

## New designs, cold author, and final distinguishing work

1. notes-qualify-measure — synthesis_measurement — infer what a procedure actually measures from controls, calibration, grouping, or altered response options, then delimit the stronger target claim.
2. notes-explain-editorial-choice — synthesis_selection — infer how a selected format or artifact supplies relevant evidence for a purpose; distinguish maker choices, later alterations, access, sequence, and the information concealed by an alternative.
3. notes-revise-explanation — synthesis_hypothesis — connect new evidence to the part of an earlier causal account it changes and the narrower role it preserves. Chronology, interactions, confounding, and decomposition supply the distinction.
4. notes-select-diagnostic-comparison — synthesis_relevance — select comparable baselines against a rival explanation: crossover results, initial versus final rankings, within-group versus pooled comparisons, and interactions.
5. notes-locate-disagreement — synthesis_attribution — infer competing consequences from differing readings of records, chronology, authorship, agency, or evidentiary scope while preserving what the thinkers agree on.
6. notes-explain-apparent-exception — synthesis_conditional_exception — reconstruct the applicable category, route, temporal state, or unit before explaining why an apparently anomalous outcome follows the rules.
7. transition-reference-scope — transition_scope — recover the relevant population, interval, or criterion despite misleading headline descriptions; six similarity and six contrast scenes.
8. transition-evidence-revision — transition_evidence — distinguish inferential consequence, concession, and independent supporting evidence in an argument; four scenes per relation.
9. transition-governing-condition — transition_conditional_argument — infer an unstated first outcome under mandatory conditions, alternatives, or a limited waiver before comparing a simultaneous second case; six similarity and six contrast scenes.

All 96 final passages/notes are 390–880 displayed characters, within the requested 150–900 range. All choices are at most 160 characters. A final inventory audit checked each design's scene count, passage range, maximum choice length, author, rubric and verified status. New transition designs each use at least two key relation categories. Deep checks pass all answer-position, length, lexical-feature, pair, hub, similarity, and phrase-level gates.

## Existing content repairs and honest calibration

- transition-consequence / eoi-con-two-rowing-clubs: replaced dawn-versus-evening practices sharing ferry avoidance with sheltered calm coves versus exposed large waves. Independently reviewed all four allowed correct contrast phrases (However, In contrast, By contrast, On the other hand) and all affected distractor phrases. Seed 17's ambiguity is removed.
- transition-elaboration-kind / eoi-elb-bus-survey: same respondents report 71% willingness and 63% current usage, with unmatched individuals. The final conclusion follows from necessary overlap and limits the claim of additional riders. Therefore and Thus are appropriate keys for this inferential consequence.
- transition-elaboration-kind restatement branches: excluded Thus and Therefore from result distractors, since they could also express an inferential summary. The remaining result distractors are As a result and Consequently; every allowed phrase was reviewed in context rather than treated as universally exclusive by dictionary category.
- transition-contrast-two-subjects / eoi-con-inventor-notebooks: corrected the explanation's “no records” overstatement to few written records and reliance on memory, matching the passage's “rarely wrote anything down.” Source/output inspection confirms this record has one consuming template.
- transition-evidence-revision / eoi-evr-mill-wheel: clarified that the observations reject the wheel explanation while leaving the river proposal viable; they do not prove the river caused the increase or exclude other causes. The passage reports the engineer retaining a proposal, so its result key remains valid.
- transition-evidence-revision concession scenes: added a contextual result-distractor rationale and revised the trap/comment. A result phrase can summarize the earlier counterexample, but it skips the intervening limitation; concession more precisely links that limitation to the conclusion's retained force. This is a bounded best-answer distinction, not a claim that result words cannot introduce inferences. All passages, choices, keys, and phrase pools stayed unchanged in these teaching-only repairs.
- notes-similarity-despite-difference and notes-stress-while-noting: Medium 7 because their explicit clause-role grids often expose the answer by fixed requirements.
- notes-reconcile-findings: Medium 6 because most scenes directly map offsets or denominators to the stated reconciliation. A few stronger cases do not establish a Hard floor for the whole template.
- transition-elaboration-kind: Medium 8 because six local example/addition branches are straightforward, despite stronger inferential siblings. Stronger questions remain intact at Medium.
- notes-explain-apparent-exception: final rubric is 9, with abstraction reduced from 1 to 0. Its concrete cases do not require that extra point to sustain the other assessed reasoning demands.

## Review protocol and coverage

Every new design was independently reviewed from displayed questions before keys/source. Full ten-scene or twelve-scene pools were reviewed, including every scene after substantive redesign. Authors were separate from reviewers. Rejected drafts were assessed separately; matching a key was never treated as sufficient Hard admission. Weak direct-summary, explicit-grid, and condition-lookup branches were rewritten, not rescued by inflating their rubric.

The final targeted reviewer cold-solved three distinct scenes from each of the last two repaired designs, including the final novel and festival scenes, before each design's keys. Its final admission incorporates the prior independent reviewers' nine accepted, unchanged scenes per design and an explicit source comparison. Those final records do not claim ten new blind solves. Collectively, every final new scene has independent displayed-question review. Those earlier objections and their dispositions are summarized above.

All 25 existing templates in the two changed source files also have independent sampled evidence: at least three distinct blind scenes per template. The rowing repair has four additional phrase cases; all twelve elaboration scenes and their allowed phrase variants were reviewed. Unchanged older siblings were rebound only after explicit source and generated-output preservation checks. No fresh blind solve is claimed for an unchanged-source impact check.

The accepted samples are published in `content/template-reviews.json`, bound to the final registry versions and source fingerprints. The consolidation check verified all 34 explicit independent acceptances against their current source hashes, regenerated answers and scene identities. It required at least three distinct sampled scenes per template and refused missing or duplicate families. This check supplied no editorial approval itself.

## Independent review lanes

- reviewer-existing-synthesis: 13 original synthesis templates and final source-impact check.
- reviewer-existing-transitions: 11 original transitions, rowing phrase review and final source-impact check.
- reviewer-final-transitions: elaboration Medium, scope Hard, evidence-revision Hard; all 36 scenes and phrase variants; final source-impact check.
- reviewer-governing-condition: all 12 scenes, all 144 phrase combinations, and unchanged 14 prior families; final explanation precision repair confirmed.
- reviewer-admission-synthesis-b: accepted revise-explanation plus preserved diagnostic/exception calibration objections; accepted source-impact check.
- reviewer-admission-synthesis-c: accepted qualify-measure plus preserved attribution/editorial objections; accepted source-impact check.
- reviewer-admission-synthesis-d: accepted diagnostic, nine accepted exception branches, original festival objection; final accepted source-impact check.
- reviewer-admission-synthesis-e: accepted editorial, nine accepted disagreement branches, original novel objection; final accepted source-impact check.
- reviewer-final-repairs: final cold three-scene checks for exception/disagreement and inherited-coverage/source preservation proof.
The final teaching-only follow-up is independently documented in reviewer-existing-transitions/teaching-precision-impact-audit.json, reviewer-final-transitions/teaching-precision-impact.json and teaching-precision-rendered-variants.json, and the governing-condition reviewer's final source-impact rebind. All affected phrase variants retain their accepted contextual relation.
Earlier reviewer-synthesis-a, reviewer-synthesis-b, reviewer-final-synthesis-a, reviewer-final-measurement, reviewer-elaboration, and original withheld transition evidence recorded rejected drafts and resolution history. Their judgments were not converted into automatic approvals.

Verification of final content:
- /usr/bin/node --test test/expression-review.test.js: 7/7 pass after the last teaching-only repairs.
- /usr/bin/node tools/check-families.js --file expression-of-ideas --reps 3000: 34/34 pass, 3,000 integer + 3,000 runtime-shaped seeds per template, 204,000 total draws before the last teaching-only transition repairs.
- After those repairs, /usr/bin/node tools/check-families.js --file expression-of-ideas/transitions --reps 3000: 15/15 pass, 90,000 draws. The nineteen synthesis families are unchanged from the preceding full gate.
- git diff --check for all three owned files: pass.
- All nine author lanes ran their exact 6,000-draw family gates on submitted content. Later coordinator-only teaching precision repairs are covered by the affected final gates and independent reviewer reconfirmation.
Repository-wide admission, freshness and browser verification are recorded in the [corpus report](2026-10-03-sat-corpus-expansion.md).

## Scope and limitations

These are provisional agent editorial difficulty judgments, not human editorial approval, official College Board items, calibrated student difficulty, or evidence of SAT readiness. Reviewers identified plausible lower-edge Hard scenes and disagreements in their reasoning; final reports preserve those distinctions instead of averaging away a clear Medium branch. In particular, revised-explanation gully/gallery, several measurement cases, editorial factory/seed, and a number of diagnostic/conditional cases are lower-edge judgments. Story scope and true-but-incomplete rhetorical alternatives can remain less demanding for some readers than chronology or interaction cases.

Older sibling review is sampled, not exhaustive all-scene review. Existing transition-instance-mid-passage's addition branch, transition-parallel-case's example branch, and some other unselected relation branches were not newly blind-solved; source-preservation and automated structural coverage do not expand that editorial scope. The original notebook explanation imprecision has been corrected. The mill-wheel causal limit is now explicit in its explanation. Result/concession overlap remains a contextual best-answer judgment, now taught with a scope-specific rationale rather than rigid word-category claims. The original findings and their resolutions are summarized above. No new wrong-key or tied-best-answer defect remains in the accepted reviewed material. Automated tell checks cannot establish semantic correctness or empirical difficulty.

## Useful study-guide distinction

A difficult rhetorical question may ask the reader to infer what an observation establishes, what a rule governs, or what a writer's purpose requires before choosing among accurate sentences. Repeating two explicit facts or matching named clause roles is not sufficient Hard evidence. Teach readers to track the relevant unit, comparison baseline, speaker, time, and scope; then distinguish an evidence description from the consequence or rhetorical relationship the prompt asks them to express.
