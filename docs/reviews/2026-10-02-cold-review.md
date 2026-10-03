# Whole-product cold review — 2026-10-02

Baseline: `25e176df1a812eba36083f9e45603d2907540f11`. The review began with a
screenshot of the Nora/Beth spelling-bee item, then expanded at the owner's
request to content, teaching, saved progress, test delivery, printing and the
publication gates. Reviewers read an immutable baseline before repairing their
assigned areas. Separate acceptance agents solved current displayed samples
before comparing their chosen answers with the key.

## Screenshot and root cause

The screenshot comes from `evidence-quotation-two-part-claim`, reproducible
at the baseline with seed `77`. C is the uniquely supported answer: the quoted
sentence explicitly supplies both competitiveness and protectiveness. The
problem is instructional quality, not a broken key. Three distractors supply
setting or one trait; the key nearly restates the two-part claim. The question
had previously been labeled Hard and was Medium at this baseline.

The template's verifier checked expected cue strings. A negated quotation
retaining those strings could pass. Six thousand generated draws passed the
structural gate while exposing only ten underlying scenes. Counts, declared
rubric scores and a passing verifier had been treated as stronger quality
evidence than they supplied. This pattern also affected other templates.

All ten scenes were rewritten around actions from which the two traits must
be inferred. The Nora scene now contrasts her competitive handling of the
contest with her response to someone mocking Beth. Distractors distinguish
plausible competing readings. The template remains Medium and was reviewed
independently with the other Information and Ideas templates.

## Material findings and repairs

| Area | Defect and concrete evidence | Result |
| --- | --- | --- |
| SAT algebra | Savings timing and excluded denominators were unclear; integer combinations omitted gcd reduction; some choices exposed the answer through a unique pair. `system-two-constants` did not consistently demand Hard reasoning. | Explicit domains/timelines, balanced distractors, corrected teaching, honest retiers and a coupled-parameter replacement. Permanent independent algebra regressions added. |
| SAT advanced math | Two-pump models printed an unexplained coefficient; vertex choices leaked the sign pair; routine remainder/exponent/vertex work was Hard. Radical and polynomial explanations overstated case counts. | Coherent models, repaired choices, four Medium retiers, demanding parameter branches retained, exact boundary and teaching corrections. |
| SAT geometry | A polygon's drawing revealed its unknown side count. Sphere surface area was required without its absent reference formula. Packing choices exposed a double/half pair. | Rebuilt polygon task with two unknown counts, supplied formula, balanced distractors, honest retiers and substantive similarity/trigonometry reasoning. Added a distinct Easy prism-volume design. |
| SAT data analysis | A below-line residual task could offer only positive residuals; graphs showed impossible percentages or fractional people. Inference and interval teaching overstated conclusions. | Correct keys/signs and graph domains, explicit statistical assumptions, repaired units/mixtures, richer inference tasks and independent displayed-data regressions. |
| SAT Information and Ideas | Literal paraphrase and phrase matching passed as advanced inference/evidence. Some historical or scientific details and comparison scopes were unsupported. | Rewrote weak scene pools, strengthened competing interpretations, corrected context, and added distinct advanced designs after independent review. |
| SAT Craft and Structure | Advanced vocabulary and text-purpose tasks often named their own operation. Paired texts sometimes supported direct repetition rather than synthesis. | Rebuilt vocabulary, structure/function and three cross-text Hard pools; added attribution-sensitive cross-text reasoning; retained Medium labels for routine designs. |
| SAT Expression of Ideas | More than one transition could express the relation; count/rate and comparison scopes drifted; new synthesis could merely repeat a supplied bridge. | Unambiguous relations, accurate teaching, rewritten Hard transitions and synthesis requiring reconciliation of separate evidence. |
| SAT conventions | Thirty-eight literal blank insertions duplicated surrounding text. Tenses and adverb placement admitted valid alternatives; some rationales falsely called grammatical distractors ungrammatical. | Correct insertion boundaries, precise temporal/ownership context, valid rationales, honest Medium retiers and a reviewed nested-ownership design. Clause length alone does not earn Hard. |
| ACT Mathematics | Item 0280 supplied incompatible sine/cosine values; reciprocal and composition shapes had undefined domains; premature rounding changed final answers. Method-naming leads coached the solution. | Valid triples/domains, exact rational and pi answers, single final rounding, honest distractor explanations and removal of coaching. All stable IDs retained. |
| ACT English | Items 0053, 0060, 0063 and 0570 had broken replacements or context; optional punctuation and legitimate grammatical constructions were rejected by rationales. | Context/key and rationale repairs across 139 records, preserving 575 IDs and 40 authored passages. Independent second-reader spot checks supplement the author review. |
| ACT Reading | Passage details, question scope and historical/scientific claims did not always agree. | Full passage/item editorial pass, corrected dependent questions and factual claims, preserved IDs and passage sets. |
| ACT Science | No shared passages across 575 items; all 32 diagram items keyed Sample D, all 28 model-evaluation items keyed Model A. | Practice, minis and booklets refuse this bank, with a clear availability explanation. Records/history remain. A reviewed passage-set replacement is required before reactivation. |
| ACT Writing | Every sample thesis favored conditional adoption; the UI used numeric entry and treated essays as wrong. | Adoption/rejection/trial examples and rotated perspectives; multiline drafting, save/resume/download and rubric self-review. Essays are unscored; progress stores completion, not draft text. |
| Saved results | Changed templates could reconstruct a completed test using new questions. Stable ACT bank IDs could associate old response indices with revised choices. | Completed-module question snapshots and content identity checks preserve original outcomes. Unverifiable old item details are disclosed rather than reconstructed as if unchanged. |
| Timing/progress | Late actions could beat the shell timer; imported repeated attempts and malformed timestamps distorted evidence; cross-tab merges resurrected deleted tags. | Engine deadline guards, capped time, normalized first-answer handling, input checks and deletion-aware merges. |
| Browser/printing | Blocked storage silently fell back to memory; active drill headers disclosed the skill; marked status disappeared. Mobile/200% layouts overlapped; print answer sheets were absent in the TeX path. | Visible storage warning, neutral active headings, correct marks, responsive wrapping, working essay flows and complete answer sheets. |
| Study material | Advice promoted hedging/boring answers as guessing rules, overstated readiness and ACT figure scale, and used obsolete enhanced-ACT counts. | Evidence-based advice, practice-target labels, corrected formula domains and official-format facts. No scaled-score or readiness promises. |
| Tooling | Eight observed seeds missed rare source changes; malformed verification inputs and numerical duplicate choices passed; the full gate omitted bank admission. | Complete source fingerprints, baseline-checked version migration, stricter validation, bank/passages/shape admission and exact browser/Node/registry parity. Only main may deploy. |

## Review evidence and coverage

The durable acceptance manifest is
[`content/template-reviews.json`](../../content/template-reviews.json). Each
active SAT template records a distinct author/reviewer, source SHA256, version,
tier, review date, and at least three independently chosen answers for distinct
displayed questions. Reading templates additionally require three distinct
scenes. Numeric answers are compared by numerical equivalence. Samples were
recorded by the reviewers; the coordinator only binds registry metadata after
source freeze. The manifest contains 317 accepted templates and 1,228 recorded
independent sample answers. There is deliberately no automatic acceptance
generator.

Authoring lanes were `math_algebra`, `math_advanced`, `math_geometry`,
`math_data`, `rw_information`, `rw_craft`, `rw_expression`, and
`rw_conventions`. Separate acceptance lanes were `final_algebra`,
`final_advanced`, `final_geometry`, `final_data`, `final_information`,
`final_craft`, `final_expression`, and `final_conventions`. Additional authors
worked in scratch and sent proposed scenes to the owning lane; acceptance
reviewers were not the authors of their reviewed scenes.

All 188 baseline Math designs and 120 baseline Reading and Writing designs
were covered. Math's final acceptance includes 47 Algebra, 43 Advanced Math,
39 Geometry and Trigonometry, and 60 Problem-Solving and Data Analysis
templates. Reading and Writing finishes with 38 Information and Ideas, 33 Craft
and Structure, 25 Expression of Ideas and 32 Standard English Conventions
templates. Those Math reviewers independently chose 166, 144, 117, and 206 answers,
respectively. New or substantially rewritten reading pools received additional
scene-by-scene review; the manifest preserves the selected reproducible samples.

ACT Math review inspected all 232 shape functions and independently recomputed
13 high-risk shapes across 1,000 seeds each, plus 52,000 assembly comparisons.
The shape gate exercises 1,200 sequences per shape. English review read all 40
passages and 179 baseline design representatives, with 29 blind selections and
a further 23-item independent acceptance sample across 17 passages. Reading review covered all 55 passages
and 575 stems, keys and rationales, plus 154 blind samples across passage sets.
A separate acceptance reviewer solved 24 Reading questions across ten passages,
including the repaired weakening task, ozone passage and three subskill gaps.
All matched; residual slow-slip, typography and teaching wording was repaired
and rechecked before acceptance.
Sequence, connotation and figurative-language gaps were filled by appropriate
questions or truthful classification, bringing Reading coverage to all 25
catalog subskills. All available ACT banks cover their listed subskills.
Writing review covered all 53 issues, their perspective frames and guidance.
Science review covered its 22 generator frames and the decisive answer-pattern
defects; it did not approve those items for use.

Runtime, browser, tooling and study-guide lanes reviewed their respective
baseline code/content. `final_runtime` independently checked the repaired
runtime and versioning boundaries. General Learn and guides received an all-file
targeted review with close reading of high-risk material; this is not a claim
that every guide sentence received two independent editorial reads.

Actual Chromium verification covered a full 98-question SAT flow, save/resume,
late deadlines, MC/numeric/essay input, hints, elimination, annotations,
line reader, Review, progress import/export, all 36 Learn routes, and SAT/ACT
booklet downloads. Desktop, 390px mobile, dark mode and 200% root text were
inspected. PDF/TeX checks verified answer sheets and a 131-question ACT core
form. Browser checks used local files; no cross-engine, screen-reader or
OS-level printing audit is claimed.

## Admission policy and limits

`source-v1` hashes each complete defining file, its static local dependencies
and shared generation code. This intentionally bumps versions for metadata,
comments and sibling-template edits too. It replaces the old eight-seed
fingerprint policy. Migration verifies old hashes against the immutable
baseline and compares complete baseline/current source before deciding versions.

`check-template-reviews.js` rejects missing or stale acceptance, reused scenes,
answer mismatches and author/reviewer identity collisions. It cannot establish
that an agent actually reasoned independently or that an answer is semantically
unique; the review process supplies that evidence. A generator's `verify()`
must return literal synchronous true, but remains an internal consistency check.

Existing answer-tell thresholds were not weakened. Fixed ACT banks are
exercise variants: their admission checks retain response, exact duplicate,
family concentration and blind-answer checks, while the separate strict
shape-repetition diagnostic is not presented as passing. Retired SAT banks
and unavailable Science retain schema checks without being advertised as
current practice. No review status was bulk-promoted to human approval.

Difficulty is provisional editorial judgment. Finite seeded tests, agent
reviews and structural checks cannot prove all generated draws are sound,
measure SAT difficulty, or establish student readiness. Independent human
editorial review and consented student-data calibration remain outstanding.
Older saved records without sufficient identity/snapshots can preserve their
scores but cannot reliably recover detailed historical questions.

## Final release validation

- `TZ=UTC node tools/check-all.js` passed: complete retained-record schema,
  all four available-bank admissions, authored passages, 232 ACT Math shapes,
  answer positions, registries, 317 review records, default template checks,
  fresh build, static smoke, guide/Learn checks and all 37 test files.
- Both complete SAT sections passed `--reps 3000`: 189 Math and 128 Reading
  and Writing templates, 1,902,000 draws across integer and runtime seed shapes.
  The final source passes both the default and deeper sample sizes. The first
  integrated run exposed two near-threshold choice-length biases; concise
  choice repairs and renewed independent review resolved them without changing
  thresholds.
- All 308 baseline registry bits are preserved; nine new designs were appended.
  Legacy fingerprints were verified against the baseline during source-based
  migration. Current browser, Node and registry inventories/records agree.
- All available ACT banks retain their stable IDs and exact record/domain
  targets. No bank status was promoted to human editorial approval.
- `git diff --check` passed. Browser and PDF coverage and its limits are
  described above; test/browser processes were stopped after verification.

Local tools ran under Node 26.10.0, using the `check-all.js` entry point directly
because npm was not on this workspace's PATH. CI runs the same entry point via
`npm run check` on Node 24. GitHub Actions records the release's CI/deployment
outcome separately from these local results.

## Official references checked

- [College Board Assessment Framework v3.01](https://satsuite.collegeboard.org/media/pdf/assessment-framework-for-digital-sat-suite.pdf): module structure/order, domains and total-pair passage length using standardized six-character words.
- [College Board Bluebook directions](https://satsuite.collegeboard.org/media/pdf/english-sat-test-directions-bb.pdf): numeric entry and supplied Math reference sheet.
- [ACT enhanced design framework, February 2026](https://www.act.org/content/dam/act/unsecured/documents/R2519-Design-Framework-for-the-ACT-Enhancements-2026-02.pdf): scored/pretest counts, optional paired Reading sets and Science background knowledge.
- [Preparing for the ACT](https://www.act.org/content/dam/act/unsecured/documents/Preparing-for-the-ACT-e.pdf): geometry drawing directions.

These references informed format and teaching corrections. No official test
question was copied or adapted into the original question pools.
