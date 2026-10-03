# Runtime cold review — 2026-10-03

Baseline: `306d4e04109d7d92a65f001b3a63e19126e993c4`, following the
[Science rebuild](2026-10-03-science-rebuild.md). `feature/prep` and `main`
initially named that commit. The owner requested independent cold review,
implementation by cold agents, a final cold review, reconciliation and a push to
`main`. This record covers the repaired runtime findings and their verification.
The final independent cold review found no actionable defect in the completed
repair set against that baseline.

The pass does not add content, templates or banks, confer human editorial
approval, or establish empirical calibration. The outstanding human review,
calibration, portable unfinished-work backup, historical reconstruction,
broader browser/accessibility/print coverage and optional maintenance work in
the [handoff](../handoff.md) remain open. The old WIP proposals are untouched
and unmerged.

## Confirmed findings and repair status

All six runtime findings below are P2. The stale current strict-difficulty count
in the handoff is a separate P3 documentation correction.

| Finding | Reproduction and consequence | Repair and acceptance |
| --- | --- | --- |
| Science practice excludes most fresh inventory | Exact whole-set matching for ordinary 10- and 20-question practice can use only the four five-question Data Representation sets. Across 100 seeds, only 20 questions and four passages appear; the 60 questions in six-question Research Summaries and Conflicting Viewpoints sets are excluded. The same preference can repeat the 20 recently seen questions while fresh passages remain. | Repaired in `src/lib/core.js`: follow seeded passage order and recency, retaining passage contiguity and complete context while shortening only the final set. Both sizes now reach all 80 questions and 14 passages across 100 seeds and avoid all 20 recently seen questions. The full/mini form builders retain their separate complete-set rules. Two new regressions fail against the baseline; focused core, Science-runtime, practice and booklet checks pass. |
| Failed progress writes lose in-memory edits on refresh | After a failed storage write, a later refresh from the durable record can discard unsaved marks, plan edits and official-score edits. A visible warning alone does not preserve those changes. | Repaired in `src/lib/progress.js`: retain pending edits by mutable key, including removals, across refresh, export and save recovery without rerunning mutation callbacks. Preserve unrelated cross-tab deletions and let a changed stored epoch supersede pending work. Focused acceptance passes. |
| Failed clear is presented as success | A failed clear write or legacy-backup cleanup can leave saved work behind while the UI claims it was cleared and omits the storage warning. | Failed clear writes preserve current and pending progress; failed legacy cleanup returns `ok: false` even if the current-record reset succeeds. The app retains the shared storage warning, and the Progress view checks the result and offers a truthful retry error. Focused failure/retry and warning-independence checks pass. |
| Stale tabs resurrect cleared sessions | After a session is replaced or completed and its slot is cleared, a stale shell can save into the now-empty slot and revive the old session. Native Chromium also reproduces this with two windows that resumed the same owner. | The session store remembers owners loaded or successfully saved for each store and slot. Their continuing writes require that the slot still holds that owner; a cleared slot is no longer claimable by the old shell. The app stops further saves after ownership is lost. Focused acceptance passes; new-owner claims and failed-first-save recovery remain available. There is no schema change or atomic multi-tab guarantee. |
| A failed report action discards its recovery surface | A network/loading failure after choosing a report action dismisses the report, leaving no retry from that report. | Keep the report open during asynchronous loading, show accessible pending/error status, reject duplicate clicks and allow retry. Action callbacks propagate loading errors and distinguish canceled replacement from success. The previous shell closes only after a replacement starts successfully. Focused and native checks pass for this reproduced failure; additional integration findings are recorded below. |
| A startup render exception leaks shell state | An exception while rendering the shell during startup can leave an inert overlay and installed listeners, obstructing further use despite a usable saved snapshot. | Startup failure removes the failed overlay, timers, listeners and observers, restores focus, and restores inert/overflow state through the mount stack. The app restores its prior shell-open state when replacement startup throws. Focused and native checks pass for this reproduced failure. |

The handoff now says strict difficulty checks pass five available ACT banks;
the reviewer reran the check and obtained 5/5. The earlier dated handoff-review
record's 4/4 result remains unchanged because Science was unavailable then.

## Completed verification

The baseline, focused repairs and final integrated tree passed these checks:

- Baseline `TZ=UTC node tools/check-all.js` passed, including all 41 test files.
- Science mini/full selection checks exercised 2,000 draws for counts, passage
  types, contiguity, reachability of all 80 active questions and archived-ID
  exclusion. Node/browser hydration matched for all 655 current and archived
  Science records.
- Six independent blind Science samples, including all four Hard-labeled
  questions, agreed with their keys. This sampled agent review does not extend
  the rebuild's acceptance into human approval or validate difficulty labels.
- Two complementary 40-question Science LaTeX forms covered all 14 passages
  and compiled to 10 pages each. The 171-question full form compiled to 30
  pages. The checked outputs had no overfull boxes or missing characters;
  this does not establish pagination quality for every form.
- The Science selection repair passed 93 named focused tests across core,
  Science runtime, practice and booklet suites. Its two new regressions fail
  against the baseline. Across 100 seeds, both 10- and 20-question practice
  reach all 80 questions and all 14 passages; with the 20 Data Representation
  questions marked recent, the sample contains none of those recent items.
  Full and mini form selections match the baseline across 100 seeds.
- Progress and progress-I/O suites passed 56 named tests; eight new regressions
  fail against the baseline. Coverage includes pending marks, error tags,
  per-test plan fields and score IDs, including deletions; refresh/export/save
  recovery without callback replay; unrelated cross-tab deletions and new
  stored epochs; failed local replacements and migrations; and failed clear
  writes or legacy cleanup. The store's return shape is unchanged.
- Session-store, storage-warning and browser-review suites passed 47 named
  tests, with baseline failures verified for the new regressions. Coverage
  includes an idle replaced owner, an owner rejected before its successor
  clears, two shells that loaded the same owner before either saves, both
  unfinished-session slots, initial-save recovery, the clear button's failure
  and retry, and independence of warnings for different storage records.
- The dialog follow-up passed 52/52 focused shell/browser/storage tests. Its
  shell suite passed all 19 tests; running it against captured pre-follow-up
  source produced nine passes and ten failures. Coverage includes reused
  dialogs, keyboard yielding, six late-conflict variants and both Practice
  and Review wrappers.
- The final resume-feedback repair passed 67 relevant tests, including 12 new
  cases. Eight report-action regressions fail against the pre-repair source:
  both report actions, initial and late replacement conflicts, and archived
  Science or rendering failures. Page callers retain their notification and
  `false` result; retained reports receive their own visible error.
- The fresh build and full admission checks passed with the unchanged 317 SAT
  template acceptances and all 80 Science reviews.
- `node tools/check-difficulty.js --strict` passed all five available ACT bank
  sections. This diagnostic proxy does not measure difficulty or justify
  showing ACT tiers in practice.
- The final `TZ=UTC node tools/check-all.js` run passed all 42 test files. A
  separate in-process run passed all 554 named test cases. `git diff --check`
  also passed.
- Native Chromium rechecks passed 27/27 checks: two-window same-owner stale
  completion, failed report loading followed by retry into an actual linear
  equation practice set, startup cleanup and saved-snapshot resume, essay
  privacy and deadlines, a 22+22-question SAT section flow, and an expired
  break. The tested app and shell bundles matched their source files.
- Native confirmation scenarios also passed: fresh and reused dialogs receive
  focus and accept Cancel; a saved-set conflict introduced during a held bundle
  load preserves the report and exact competing snapshot when canceled,
  re-enables retry and restores opener focus; confirming the retry opens the
  replacement practice.
- Native checks against the final app passed all four failed-resume scenarios:
  initial/late conflicts crossed with archived Science/render failures. Each
  shows an alert while preserving the exact saved bytes and a usable report,
  re-enabling retry and restoring focus. Keep it preserves the saved session;
  a valid Resume opens its saved answer. No uncaught or unhandled events were
  observed.
- The independent final state reviewer found no actionable defect after 109
  focused cases and independent baseline/final probes. The reviewed library
  files are unchanged by the later dialog repairs.
- The final independent acceptance reviewer found no actionable defect in
  launch, resume, report actions, cancellation, error feedback, dialogs,
  locking, cleanup, recording or storage. All 61 focused app/shell/storage
  tests and five supplemental probes passed: diagnostic late-conflict Cancel,
  Resume, confirmation and replacement failure, plus a deferred report-action
  failure after navigating to answer review. `git diff --check` also passed.

The native probes used Chromium with a `file:` origin, scripted activation,
native focus, a real second window and reloads, and simulated clocks. They do
not establish HTTP behavior, physical-keyboard operation, assistive-technology
usability, other browser engines or OS-level printing. The prior Science
rebuild's local-HTTP and visual evidence continues to apply to that recorded
baseline.

## Integration findings and final acceptance

Cold integration reviews found three P2 regressions introduced during report
recovery: two in the first final shell review and a failed-resume feedback gap
in a later cold app review. These are separate integration findings; they do
not invalidate the specific baseline reproductions and checks recorded above.

| Integration finding | Reproduction and consequence | Status |
| --- | --- | --- |
| Report preservation blocks an external dialog | A reused page dialog can remain inert beneath the retained report; the shell can also intercept Escape intended for that external modal. | Repaired by a fresh agent: native dialogs stay usable, the shell yields its shortcuts while an external modal is open, and focus returns to the report opener after its pending disabled state ends. Focused and native regressions pass. |
| A late saved-set conflict closes the report before confirmation | While a report action loads a bundle, a different saved set can appear. Both report-action paths can close the report before the replacement confirmation resolves, losing the recovery surface if replacement is canceled. | Repaired by a fresh agent: report, diagnostic and drill launchers propagate `true` or `Promise<boolean>` outcomes through the Practice and Review wrappers. The report remains open until a confirmed replacement actually starts. Focused and native late-conflict, cancellation and retry regressions pass. |
| Failed Resume it gives no feedback in a retained report | If replacement confirmation selects Resume it but the saved session contains archived Science or its renderer fails, the page notification is suppressed while the report is open. The retained report therefore gives no visible explanation. | Repaired by a fresh agent: route resume errors to the retained report's error handler, while page callers keep their notification and `false` result. Tests cover both report actions, initial/late conflicts, both failure causes, preserved saved bytes, retry/focus recovery and successful valid resume. Focused and native checks pass. |

The first four follow-up regressions failed before these repairs; the expanded
suite and final integrated/native checks pass as recorded above. All nine
findings, six baseline and three integration, are repaired. The final independent
cold review accepted the completed repair set without further actionable
findings. This disposition applies to the reviewed paths and checks, within the
evidence limits recorded above.

Publication to `main` is authorized by the owner. The latest fetch still has
`origin/main` at the `306d4e0` reconciliation baseline, with no upstream conflict.

No content, template source or template fingerprint changed. Existing review
admission still passes, so renewed template acceptance and the template-change
deep pass are not required for this runtime-only diff.

The review did not establish a defect requiring the old platform proposal's
optional report-drift gate: the current report matches. The WIP table in the
handoff retains `cbb7e6f` as the earlier platform baseline and clarifies that
`ba6c6ba` has immediate parent `83783d2`; this is an ancestry clarification,
not evidence that the earlier baseline was wrong or that the proposal is ready
to merge.
