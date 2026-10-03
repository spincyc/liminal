# Handoff cold review — 2026-10-03

Baseline: `fb4dd90` (`docs/handoff.md` after the published `ac74259` release).
The owner requested an independent cold review and implementation of fixes.
This pass checked the handoff's bounded runtime, diagnostic and reporting
claims. It did not attempt to replace human editorial review, recruit students
for calibration, author a Science bank, merge the old WIP proposals or embed a
calculator. Those remain separate work.

## Reproduced defects and repairs

| Finding | Reproduction and consequence | Repair and regression coverage |
| --- | --- | --- |
| Unverified ACT tiers still affected practice | Relabeling identical ACT Math records changed mini/booklet selections. ACT reports showed Hard accuracy and tier breakdowns; filters, Review, booklet keys and Progress chart text also exposed the labels. The generic ACT report described SAT module adaptivity. | One explicit section policy excludes ACT tiers from these paths. Tests compare identical questions before/after relabeling, retain SAT behavior, and inspect rendered and accessible feedback. The score caveat now makes no ACT adaptivity claim. |
| Mathematical structures collided | ACT Math 0076 and 0136 both became `inequalities\|many integers x satisfy 3x`; normalization discarded operators and number positions, yet failed to abstract attached coefficients. | Local diagnostic tokenization preserves structure and normalizes coefficients/operator spelling. Regressions distinguish absolute values, inequalities, grouping, powers and numeric positions, while matching same-design numerical variants. |
| Failed storage reads bypassed ownership | With a successor save present, an injected `getItem` exception made guarded save/clear treat the slot as empty. A failed `removeItem` was reported as successful. | Mutations fail when ownership cannot be read; removal and legacy-slot migration report failure accurately. Tests preserve successor bytes under read/removal failures. This does not provide atomic cross-tab transactions. |
| Storage recovery hid unrelated unsaved data | Fail progress and set saves, then recover only one. The shared warning disappeared while the other record was still unsaved. | Track unresolved progress/set/test failures separately. Tests exercise both recovery orders. |
| Usable snapshots were deleted after display failure | A valid saved set/test could be cleared when its screen failed to open; completed-test snapshots were cleared before the combined report opened. | Keep usable saved data on startup/report errors and allow retry. Clear completed-test storage only after its report successfully opens. |
| Malformed snapshots reached runtime code | A simulation index of `"0"` passed validation but incremented to `"01"`; malformed question entries could pass engine restore and then crash summary/discard. | Require the expected numeric index and usable question snapshots at restore; regressions reject malformed records before runtime consumption. This is not a complete content-admission audit of saved data. |
| Imported answers could be silently lost | Different responses sharing an ID, question and timestamp collapsed as one. A third independent legacy import could reuse the same renamed ID and disappear. | Preserve distinct outcomes through collision-safe deterministic renaming, retain error-tag associations, and keep repeated imports idempotent. |
| Older Writing responses leaked into progress downloads | Newly recorded essays were redacted, but historical/imported responses could retain draft text and be exported again. | Normalize/migrate known Writing answers to unscored completion metadata and apply normalization at export. Ordinary scored responses remain intact; unfinished-session drafts remain separate. |
| Some ACT symbols broke LaTeX output | The revised selection exposed `log₃` in ACT Math 0235 to the full-form smoke check. An audit of printable fields also found unmapped subscript 2/4 and vector angle brackets. | Convert those symbols to semantic LaTeX macros. Exact-output and active-bank coverage regressions pass; the 131-question ACT `smoke` form compiles with `pdflatex` to a 22-page PDF. This does not prove pagination quality for every form. |

## Verification and limits

The baseline and final integrated complete gates passed. Final checks:

- `TZ=UTC node tools/check-all.js`: passed content admission, registries, all
  317 source-bound reviews, default family checks, fresh build, static smoke,
  guides/Learn and all 39 test files. Node 26.10.0 ran the package's entry point
  directly because npm was unavailable.
- `TZ=UTC node tools/check-difficulty.js --strict`: 4/4 available bank sections
  passed; this is still an advisory proxy check, not calibration evidence.
- Focused DOM/storage regressions passed, including 15 browser-adapter,
  six injected-storage/startup and three ACT-view tests. New ACT-view tests
  also failed against the original view sources.
- The ACT full form with seed `smoke` compiled with `pdflatex`: 131 questions,
  22 pages, no missing-character errors. The first integrated gate exposed
  the missing-symbol conversion; the repair preserves the ASCII gate.
- `git diff --check`: passed.

Science remained unavailable in builders, the shared launcher and both legacy
saved-session formats; refused Science resumes preserved their saved contents.
Replay codes accept SAT sections only. Historical content-identity and snapshot
checks continue to withhold unverifiable details while preserving outcomes.

No question bank, catalog, template source, template version or acceptance manifest
changed. The family source dependency closures exclude the modified runtime files;
renewed blind template review and the template-change deep pass are therefore not
required. Mechanical difficulty results remain diagnostic proxies, not empirical
calibration. The earlier agent acceptance does not become human approval.

Native browser verification was unavailable in this session. An HTTP server failed
at socket creation with `EPERM`, and Chromium failed at crashpad socket setup.
Firefox was installed, but no geckodriver was available. DOM adapters and injected
storage failures do not establish HTTP, genuine concurrent-tab, screen-reader,
native zoom, mobile layout or OS printing behavior. The prior review's native
browser evidence applies to its baseline only.

The old `lane/platform`, `lane/act-math` and detached review worktrees were inspected
for identity only and left untouched. These fixes were integrated on `feature/prep`;
no push or deployment was requested.
