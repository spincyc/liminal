# SAT exposure and replay repair — 2026-10-03

Baseline: `618d924`. The owner requested repairs after a cold review found
repeated SAT designs and identical visible questions under different seed IDs.
This change repairs runtime identity, history, selection and replay; the corpus
expansion and its independent content reviews are recorded separately.

## Findings and behavior

- Generated attempts now store an identity of the displayed item, independent
  of seed and choice order. Accuracy and mastery reconcile these identities
  before selecting reporting windows. Fixed-bank grading identities remain
  separate. Old attempts keep their recorded outcomes; missing historical
  displayed content cannot be reconstructed reliably enough to infer identities.
- Section history retains 400 recent item identities and 120 scenes, shared
  across templates, on-screen practice and printing. New selection searches
  36 reproducible draws per selected template, preserving the module blueprint
  and reporting reuse if this bounded search cannot find fresh material.
- Save/resume retains a module's used item identities and aggregate reuse
  warnings. The final test report includes those notices without exposing
  question skills or tiers during the session.
- Explicit booklet or answer-key opening/download records exposure once per
  pinned form during that page visit. Viewing solutions counts as exposure even
  if the key is opened first. Passive preparation and subsequent key/booklet
  opens do not increment that form again within the page.
- New run and form codes pin every draw attempt, including zeros. Legacy codes
  retain their prior selection behavior. Codes still depend on the source
  version; the project does not archive executable old template versions.

## Independent runtime review

Authors: `/root/repair_identity`, `/root/repair_selection`, and `/root` for UI
integration. Reviewer: `/root/review_runtime`, in a cold context, inspected the
changed identity, storage, analytics, selection, replay, printing and save/resume
paths and ran focused regression tests.

The reviewer found two additional defects, both repaired:

1. Omitting an all-zero attempt suffix sent new runs through legacy replay.
   A two-template fixture showed that item-versus-scene priorities could change
   the rebuilt question. New codes now pin zero attempts; the regression also
   verifies the old unpinned code's original behavior.
2. A lexical tie-break between equal-time answers could promote an already
   marked repeat ahead of the retained first answer and exclude both. At equal
   timestamps, the retained nonrepeat takes precedence before the stable ID
   tie-break. Earlier marked repeats still preserve evidence of trimmed history.

The reviewer also questioned key-first history recording. Inspection of the
answer key confirmed that it exposes solutions and distractor reasoning;
counting that initial exposure is intentional. A dedicated regression verifies
that opening the question booklet afterward does not count it again.

## Verification and limits

The exact runtime candidate, exported from the baseline plus the selected
runtime files, passed `TZ=UTC node tools/check-all.js`: content admission,
317 unchanged source-bound template reviews, default family checks, build,
static smoke, guides/Learn and 569 unit tests. Node 26.10.0 ran the package
entry point directly because npm was unavailable. This candidate check keeps
the independently authored corpus expansion out of the runtime commit.

Runtime changes do not alter family source dependency closures. This evidence
does not establish empirical SAT difficulty or a score conversion. The finite
corpus and bounded history cannot promise indefinitely unrepeated practice.
