# Outstanding-issues handoff — 2026-10-03

Baseline:
[ac74259](https://github.com/spincyc/liminal/commit/ac74259be5da248d8496b783956f603acbf9a3a8),
published to `main` and `feature/prep`. [CI and Pages deployment
passed](https://github.com/spincyc/liminal/actions/runs/37089005718); published catalog
and template bundles matched the build. The release passed the complete gate, 317
source-bound independent template reviews and 1,902,000 generated SAT checks. See the
[cold-review record](reviews/2026-10-02-cold-review.md) for coverage and limits.

This list supersedes the earlier handoff's active queue. The [old handoff remains in Git
history](https://github.com/spincyc/liminal/blob/ac74259/docs/handoff.md). No
uncontained critical defect or unresolved incorrect active answer was identified by the
completed review. That describes its findings, not a guarantee about every possible
generated question.

A [follow-up cold review on 2026-10-03](reviews/2026-10-03-handoff-review.md)
reproduced and repaired additional runtime and reporting defects. The subsequent
[Science rebuild](reviews/2026-10-03-science-rebuild.md) preserves those repairs and
replaces the withdrawn Science inventory. Its verification is recorded separately
from the earlier release evidence above.

A subsequent [runtime cold review](reviews/2026-10-03-runtime-cold-review.md)
started from `306d4e0` and reproduced six bounded runtime defects. The Science
practice, progress-storage, session-lifecycle and shell/report-recovery repairs
passed focused checks, a complete gate and native rechecks. Three report-recovery
regressions found during integration review are also repaired and pass those
checks. The final independent cold review found no actionable defect in the
completed repair set; that record states its coverage and limits.

## Ranked outstanding work

P1 denotes a substantial missing capability or missing evidence of instructional
quality. P2 denotes a bounded product limitation, verification gap or operational risk.
P3 denotes maintenance or an optional enhancement. Rank gives the suggested order within
those levels; evidence gaps are not asserted software failures. Original rank
numbers are retained; completed item 1 is recorded below.

| Rank | Severity | Outstanding issue | Current status |
| ---: | --- | --- | --- |
| 2 | P1 | Independent human editorial review remains outstanding | Agent review completed; human approval not claimed |
| 3 | P1 | Difficulty and practice targets lack empirical calibration | Editorial tiers only; no scaled-score/readiness prediction |
| 4 | P2 | ACT inventory repeats designs and has unverified tiers | Exercise variants; tiers unused in practice/progress |
| 5 | P2 | Progress export excludes unfinished sessions and essay drafts | Local resume and separate essay download work |
| 6 | P2 | Some historical question details cannot be reconstructed | Outcomes preserved; unverifiable details withheld |
| 7 | P2 | Browser, accessibility, concurrency and print coverage is incomplete | Verification gap; no corresponding open failure established |
| 8 | P2 | Two unreviewed WIP branches exist only in this workspace | Preserved, unmerged and absent from fetched remote refs |
| 9 | P3 | Archived SAT banks and large modules remain | Maintenance backlog; compatibility paths still use banks |
| 10 | P3 | Calculator opens externally instead of being embedded | Optional enhancement; integration requirements need verification |

## P1 — instructional capability and evidence

### 2. Obtain independent human editorial review

All active SAT templates have independent **agent** acceptance, with sample answers
recorded in the manifest. Current inventory is in the [coverage report](content-report.md).
That does not certify every draw or replace an educator's review. All
4,105 retained bank records still await human editorial approval; 2,380 belong to
available ACT banks and the rest are archived. Guide review also has documented sampling
limits.

Next: prioritize active Hard SAT designs, repaired ACT questions and teaching advice. A
qualified independent reader should check unique answer support, distractors, factual
claims, teaching and difficulty, recording exact IDs/seeds and dispositions. Close
reviewed batches through documented coverage and repaired findings; do not bulk-promote
statuses or treat unseen draws as human-approved.

Evidence: [review manifest](../content/template-reviews.json), [audit
log](content-audit.md), [authoring/status rules](content-authoring.md).

### 3. Calibrate difficulty against student results

SAT tiers are editorial judgments. Passing rolling practice targets does not establish
exam readiness; the fixed 60% Module 2 routing rule is a practice approximation. The
original concern about easier questions inflating perceived readiness cannot be settled
by additional generator repetitions.

Next: define a pilot using consented student results and official practice/test scores,
separating first exposure, repeats, hints and question design. Assess whether tiers and
recommendations track those results; justify changes with the evidence. Keep
score-prediction/readiness claims disabled unless separately validated. Official-score
recording already exists; obtaining participants and consent requires owner involvement.

Evidence: [calibration policy](difficulty-calibration.md),
[analytics](../src/lib/analytics.js), [roadmap](roadmap.md).

## P2 — bounded limitations and verification

### 4. Expand distinct ACT designs and assess their tiers

The four other ACT banks each have 575 records, not 575 independent designs. Math has 232
generator shapes; Writing reuses 53 issues; English uses 40 authored passages and
Reading 55. Science has 80 questions across 14 passages. All available catalog
subskills are represented, but presence does not establish depth or calibration.
Strict shape-repetition diagnostics are not represented
as passing.

Next: inventory actual design/scene coverage, expand thin areas and independently review
new material. Evaluate the old ACT Math proposal below before reusing it. Conversion to
templates alone does not make tiers trustworthy. Retain accuracy-only ACT treatment
until justified.

The follow-up review removed remaining ACT tier filters, tier-based Math form selection,
report/Review/booklet labels and Progress breakdowns (including accessible chart text).
The earlier statement that these labels were already unused was too broad.

Evidence: [coverage report](content-report.md), [bank
limitations](content-authoring.md), [bank audit](../tools/audit-questions.js).

### 5. Decide whether unfinished work needs portable backup

`Download my progress` exports the progress record, not either unfinished-session slot.
Those slots contain question snapshots and unfinished essay drafts. A completed essay
remains downloadable in its active report, but progress stores completion only; closing
the report does not create a permanent essay archive. Clearing browser storage can
therefore lose work absent a separate download.

This is a known backup/privacy boundary, not a newly reproduced save/resume bug. If
portable sessions are wanted, specify opt-in draft inclusion and import preview/conflict
handling. Verify that restore cannot silently overwrite a different saved set or test,
and preserve versions, deadlines and ownership checks. Do not silently add essay text to
progress exports.

Follow-up fixes preserve ownership when storage reads fail, keep warnings visible until
each affected record saves successfully, preserve usable snapshots after report/startup
failures, and prevent distinct imported answers from being lost to ID collisions.
Older imported Writing responses are reduced to completion metadata. These repairs do
not make unfinished sessions portable.

The runtime review additionally preserves unsaved mutable progress edits through
refresh and export, reports failed clearing truthfully, and prevents a previously
loaded or saved session owner from reclaiming its cleared slot. Focused regressions
and the integrated gate pass; the final state review found no actionable defect.
Native rechecks also prevent same-owner session resurrection. The final
independent review accepted the complete repair set, as recorded in the
[runtime review](reviews/2026-10-03-runtime-cold-review.md). These guards do not
provide atomic multi-tab transactions.

Entry points: [progress I/O](../src/lib/progress-io.js), [session
store](../src/lib/session-store.js), [draft behavior](../README.md).

### 6. Preserve the limit on historical reconstruction

Old attempts without matching content identity, and old completed modules without
recoverable question snapshots, may lack reliable original details. The repair preserves
outcomes and refuses to attach old response indices to revised choices; it does not
recover missing data.

This is an accepted residual limitation. Recovery requires a verified original snapshot
or archived implementation plus sufficient version/seed information; some records lack
that information. Consider executable version archives only as a separate scoped
feature. Do not rebuild old questions from current sources or rewrite historical
correctness to make details appear available.

Entry points: [identity checks](../src/lib/progress.js), [simulation
snapshots](../src/lib/simulation.js), [Review](../src/app/views/review.js).

### 7. Extend verification where evidence is absent

The release exercised Chromium, a full SAT flow, all response types, save/resume,
imports, Learn and booklets, including mobile width and 200% root text. It did not
establish cross-engine behavior, screen-reader usability, native zoom equivalence,
offline/network-failure handling or OS-level printing. Browser flows used local files;
deployed bundles were subsequently checked for equality. PDF examples do not prove every
generated form paginates correctly.

Next: test the deployed HTTP site in Firefox/WebKit and representative assistive
technology; verify native zoom/printing and storage/network failures. Exercise genuinely
concurrent tabs: localStorage provides no atomic multi-tab transactions, while existing
tests cover particular stale-write and ownership paths. Record reproducible failures
before proposing a storage redesign.

The handoff-review pass added injected failure and DOM adapter regressions, but
socket restrictions prevented native browser acceptance in that session. The later
[Science rebuild](reviews/2026-10-03-science-rebuild.md) exercised the rebuilt site
over local HTTP in Chromium: targeted and timed Science, both feedback modes,
save/reload/resume, archived-history safeguards, keyboard operation, phone width,
dark mode and a 171-question browser PDF. Complementary Science forms covered all
14 passages in Chromium and LaTeX; the full 171-question CLI form also compiled.
This adds native evidence for those flows, while concurrent tabs, assistive
technology, other browser engines and OS-level printing remain unverified.

The subsequent runtime review reproduced storage failures, report/startup recovery
failures and stale-session resurrection, including a native two-window case where
both windows had resumed the same owner. Its Chromium probes used local files,
not HTTP. Native rechecks passed 27 flows plus confirmation and failed-resume
scenarios for the three additional report-recovery defects found during
integration review. This does not close the broader concurrency or
network-coverage gap. The final clean review disposition and evidence limits
are recorded in the
[runtime review](reviews/2026-10-03-runtime-cold-review.md).

Evidence: [review coverage](reviews/2026-10-02-cold-review.md), [browser
regressions](../test/browser-review.test.js), [session-store
tests](../test/session-store.test.js).

### 8. Preserve and reassess the old WIP proposals

These branches/worktrees were deliberately left untouched. As inspected on 2026-10-03,
fetched remote refs contain neither branch. Before deleting the workspace, decide
whether to retain/publish/archive or explicitly discard them. Their old passing checks
are not current acceptance.

| Branch | WIP commit / earlier baseline | Proposal and unfinished work |
| --- | --- | --- |
| `lane/platform` | `ba6c6ba` / `cbb7e6f` | Retire SAT banks, split core, add recording helper and report drift check; recording tests unfinished, no independent/browser acceptance |
| `lane/act-math` | `0e4ad3a` / `b68714f` | 63 ACT Math templates and plumbing; independent solvers unfinished, not reviewed or served |

The table names the earlier proposal baselines, not necessarily each WIP commit's
immediate parent: `ba6c6ba` has parent `83783d2`. These proposals remain untouched
and unmerged by the runtime cold review.

Use `git worktree list` and `git show <commit>` to inspect them. Compare each proposal
with the repaired release and selectively reconcile useful work on the workspace branch.
Expect overlaps in generation, versioning, progress, app and tooling code. The old
advice to merge platform wholesale first is superseded. Neither proposal may undo
current identity safeguards, reviews or validation; require relevant full/deep checks
and browser verification before integration. An old detached review worktree also exists
and is not new work created by this handoff.

## P3 — maintenance and enhancements

### 9. Retire compatibility banks and split modules when useful

Fixed SAT banks and their generators remain; historical IDs/marks still use
compatibility paths. Some app/logic files remain large. These are maintenance items, not
evidence that fresh SAT practice uses retired banks.

Next: define and test historical-ID behavior before deleting data/loaders; reconcile the
platform proposal selectively. Split views/helpers around concrete responsibilities
without changing grading, storage or review semantics. Preserve the full gate and
browser/Node parity checks.

### 10. Evaluate an embedded calculator

The calculator currently opens an external Desmos page. Embedding remains optional.
Before implementation, verify current provider licensing, integration and credential
requirements; obtain owner input where needed. Preserve the working external link until
keyboard, mobile and accessibility behavior is verified. See [calculator
guidance](../content/learn/sat/general/desmos.md).

## Completed work and continuation rules

The former item 1, the unusable Science bank, is replaced by 14 original passage
sets and 80 questions with independent blind agent solutions. Practice, minis,
and booklets use the new IDs; the original 575 IDs and outcomes remain archived.
Full Science forms keep seven complete passage sets. The
[rebuild review](reviews/2026-10-03-science-rebuild.md) records admission,
browser and print evidence, and the remaining human-review and calibration limits.

The runtime cold review found that exact whole-set matching in ordinary 10- and
20-question Science practice excluded all six-question sets, leaving only 20 of
the 80 active questions reachable. Practice now follows seeded passage order and
recency, shortening only the final set while retaining its complete passage.
Both practice sizes reach all 80 questions and 14 passages over 100 seeds; full
and mini form selections remain unchanged across 100 seeds. See the
[runtime review](reviews/2026-10-03-runtime-cold-review.md) for regression evidence.

The former item 9, mathematical-structure collisions in difficulty diagnostics, is
repaired. The signature retains operators, grouping and numeric positions while
normalizing numerical variants. The named compound/absolute-value inequality collision
is covered by regressions; `node tools/check-difficulty.js --strict` now passes all five
available ACT banks. This heuristic result does not calibrate their difficulty or make ACT
tiers suitable for practice. The [follow-up review](reviews/2026-10-03-handoff-review.md)
records the other repairs and verification limits.

Do not reopen these baseline findings without new evidence: Nora/Beth's explicit trait
matching; identified key/domain/teaching errors; eight-seed-only fingerprints; missing
independent SAT acceptance; changed-choice historical grading; late-response acceptance;
essay entry/scoring; missing print answer sheets; deleted-tag resurrection; missing
sphere-area formula; and the named mathematical answer tells. Their repairs are recorded
in the cold review.

Follow [AGENTS.md](../AGENTS.md) and [template review/version
rules](question-templates.md) for implementation. Renew independent reviews after
relevant source changes; never copy generator keys into acceptance records or weaken
gates to reach counts. Run the complete gate in UTC and deep checks after template
changes. Source hashing intentionally includes comments, metadata and sibling templates;
conservative version/review churn is an accepted tradeoff, not an outstanding corruption
defect.

The remaining open items are not closed by these repairs. No human approval or empirical
calibration is conferred by either review.
