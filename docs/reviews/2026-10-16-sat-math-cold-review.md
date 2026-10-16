# SAT Math learning-loop changes: cold review — 2026-10-16

Three independent agents reviewed the integrated SAT Math changes cold:
- **Code correctness** at `3695d7c`.
- **The student experience** at `3695d7c`: 37 sets over 14 simulated days of a
  ~530 student, plus a returning student, driven through the real UI in
  headless Chromium.
- **Content** at `f0b9aa1`.

None of them wrote or reviewed the changes. The changes are described in the
[roadmap](../roadmap.md) entry "SAT Math learning loop — 2026-10-16" and the
[template author notes](2026-10-16-sat-math-realism-changes.md). Each finding
below was fixed in a later commit on `feature/sat`, unless the table says
otherwise.

This is agent review with synthetic students, not a study of real learning.

## What the reviews confirmed

- **No crash, dead end or performance problem.** At 20,000 attempts, the
  skill map takes 88 ms and the plan replay 55 ms.
- **Local dates throughout.** Review is correct across midnight and DST.
- **`officialChecks`** validate, merge and round-trip.
- **Every step kind launches.**
- **Text-only rendering.**
- **No ids, skills or tiers before an answer, and no score prediction.**
- **Math correct throughout.** Blind solves agreed with every key or answer:
  - 125 + 69 Learn Try-its;
  - 74 template draws;
  - 40 Desmos routes, followed correctly on live desmos.com.
- **Prerequisite and practice links:** all correct.
- **Verdict on the student experience.** "Plausibly a better path from about
  530." Advanced Math comes from day 1, mixed and timed sets are real,
  Review is capped, and lessons now practise.

## Findings and dispositions

### Code

| Finding | Disposition |
| --- | --- |
| The plan replay ordered official checks by entry time; Progress orders by the date taken | Fixed: one ordering, by date taken |
| The plan was replayed from the capped attempt record, so trimming rewrote it and could raise a false pace alarm | Fixed: a persisted, mergeable `planLedger` checkpoint. The plan is identical with all attempts or only the newest 2,000 |
| Any Review-page set closed the day's Review step | Fixed: only the due set (`step: "review"`) closes it |
| A tab on the old build erases `officialChecks` | Normalise now keeps unknown fields. A tab already open on the old build at deploy can still erase the new field once, and nothing can fix that |
| "Passed over by your diagnostic" appeared with no diagnostic | Fixed: such skills enter as `slipped` |
| Weekly-report print could lose its print class | Fixed: cleared on `afterprint` |
| The calculator opens a second window after a reload | Kept on purpose: the window is detached from the page (`opener = null`) so Desmos cannot reach it. Comment and AGENTS corrected |

### Student experience

| Finding | Disposition |
| --- | --- |
| The weekly report said "On track" while nothing was being learned | Fixed: three learning signals (turn ended below routine at Medium, no target in 21 practice days, flat Medium accuracy) |
| Official checks were prompted only at the target, which a ~530 student rarely reached | Fixed: also prompted when a turn ends on its budget. A low check now returns the skill at the next opening |
| The Desmos drill was offered once, early, and never to a returning student | Fixed: a cadence (weekly until four, then every 14 days), drawn from routes where a graph genuinely solves |
| Non-teaching sets spent the skill budget | Fixed: only a skill's own drills spend it. The budget is now 20 (two drills) so the first pass ends by about week 10 |
| The Review backlog was filled by Hard misses on untaught skills | Fixed: misses are parked until their skill flies, and drilled skills come first. The backlog still grows slowly (recorded limit) |
| The results page led with "Practice what I missed" | Fixed: the next step leads, and the missed set is Review-like |
| False "score isn't moving"; pace text and arithmetic disagreed | Fixed: needs two scores at least 14 days apart with practice between; the text matches the math |
| Contradictory level wording | Fixed: the Easy-stuck flag only when drills never left Easy; clearer counts |
| The lesson offer was suppressed by diagnostic answers | Fixed: offered until the first drill |
| Modules came every ~1.5 days | Fixed: after 7 days, or after 10 sets and 3 days |
| Report jargon and mixed counts | Fixed: plain-English summary, Math-only target count, real dates |

### Content

| Finding | Disposition |
| --- | --- |
| Desmos typing traps (`/`, `^`, `_` need →) and broken regression syntax | Fixed: route display hint and per-route edits |
| Missing greatest/at-most branch in one route | Fixed in that route |
| Thousands commas | Fixed: noted in the routes affected and in the Desmos page |
| Harder-version First steps did the hard part | Fixed: they are hidden Hints, and `check-learn` forbids visible First steps under `{#hard}` |
| An ambiguous "whole numbers" stem (`greatest-value-from-center`) | Fixed: it states its least value. Pass-3 review accepted it |
| Half-Medium Hard templates (`linear-solution-parameter-condition`, `inequality-percent-of-total`) | Fixed: the Medium forms were removed. Pass-3 review judged the first on the Medium–Hard border (within one band) |
| Text slips in seven templates | Fixed; a test now keeps numeric items from naming offered choices |
| Stale plan sentence; Desmos week plan inconsistent with the engine | Fixed |
| Level placement and two-part Try-its in Learn | Fixed |
| A pass-3 hint named the method (b² − 4ac) | Fixed in pass 4 and re-reviewed |

## Re-check on the final build

The same three reviewers re-ran their probes, scenarios and live Desmos
checks at `6479022`. Nothing regressed. The experience reviewer's verdict
became "clearly a better path from ~530". The re-check found more problems,
each fixed afterwards and checked again:

| Finding | Disposition |
| --- | --- |
| **High:** a drill answer is saved before its session exists, so once the record trimmed, the ledger moved past drill answers. Drills then stopped spending budgets and the plan stalled | Fixed: attempts record `setKind`/`setSkill`, and the checkpoint stops before answers without a session. Covered by an app-pattern test that fails without the fix |
| "No target in 21 days" fired with every skill at target; `medium-flat` fired on high plateaus | Fixed: it fires only while a skill is short, and only below 80% |
| Misses stayed parked on a skill that reached its target outside the plan | Fixed: unparked at first flight, first drill or reaching target |
| A merged import dropped unknown fields | Fixed |
| Answers older than the ledger checkpoint, merged in later, don't change the plan | Documented as inherent to the checkpoint |
| Two-drill turns often ended at Easy | Fixed: a turn whose drills never left Easy gets one extra drill. Simulated, 190 of 190 first turns (moderate) and 186 of 190 (slow) reach a Medium drill |
| The radical-equation route ignored cube roots (19% of draws) | Fixed (`cbrt`), confirmed live |
| A `crew-rate-change` rationale omitted a step; a plural slip | Fixed; a recompute test was added, and the pass-5 review accepted it |
| A stale "one-week Desmos plan" phrase; results and summary wording | Fixed |

## Still open

- Tiers remain editorial, and the student model is synthetic.
- The Review backlog still grows slowly: about 90 due by week 12 for a
  simulated moderate learner, with six questions a day. No set size from 6
  to 8 levels it off without taking more than 30% of practice. It is shown
  calmly and never by itself marks the week Needs attention.
- The Desmos drill draws by template, so some draws are question forms
  their route says it does not cover.
- Desmos behaviour was confirmed on desmos.com, not in Bluebook.
- Pre-existing text slips in files these changes did not otherwise touch,
  named in `test/sat-math-text.test.js`.
- The ACT carry-over decision is recorded in the [roadmap](../roadmap.md),
  under "Decided".
