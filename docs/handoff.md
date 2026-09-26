# Handoff — 2026-09-26

State of the work at the end of the 2026-09-26 session, and what to do
next. The product-level plan is `roadmap.md` (Next); the review that
drove the day is `reviews/2026-09-26-cold-review.md`. This file adds the
operational detail a new session needs.

## Where things stand

- `main` and `feature/prep` are at the commit that adds this file; the
  site is deployed from `main` by GitHub Actions and the deploy passed.
- The gate (`node tools/check-all.js`) is green, and every SAT template
  passes `node tools/check-families.js --reps 3000`.
- The tests are time-zone sensitive in one place (gate windows must span
  two calendar days). Run `TZ=UTC node --test "test/**/*.test.js"` before
  pushing: CI runs in UTC.

## Work in flight (local branches, not pushed)

Two lanes were stopped before they finished. Their work is saved as one WIP
commit each on a local branch of the `spincyc/liminal` clone in the
`sat/prep` workspace. **The branches exist only in that clone**: removing
the workspace (`wt rm`, `wt sweep`) deletes them. Push them first if the
clone may go.

| Branch | WIP commit | Base | What it holds | State |
| --- | --- | --- | --- | --- |
| `lane/platform` | `ba6c6ba` | `cbb7e6f` | Roadmap items 1 and 6: SAT banks retired (legacy ids read-only, banks, SAT generators and `content/sources/sat-reading-writing` deleted, tools restricted to ACT), `core.js` split, smoke test on the template paths, a `report-content --check`, and a start on `lib/recording.js` | Full gate green at its base; stopped while writing `test/recording.test.js`; not reviewed; no browser check |
| `lane/act-math` | `0e4ad3a` | `b68714f` | ACT Math phase 1: template plumbing (`act-mathematics` in check-families, update-templates, families, instantiate) and 63 ACT Math templates in `src/lib/families/act/` with their registry | All 63 pass `--section act-mathematics`; stopped while writing independent solvers; not reviewed; the site does not serve them |

To resume either: create a worktree on the branch, `git rebase feature/prep`
(expect conflicts in `tools/check-families.js`, `tools/update-templates.js`
and `src/lib/families/shared/instantiate.js` for act-math; platform touches
`app.js`, the views, `core.js` and many tools, all changed since its base),
finish the lane's brief, review the diff as a proposal, run the gate and a
browser pass, then commit coherently on `feature/prep`.

Platform first: it deletes about 80,000 lines of bank data, and ACT Math's
plumbing should land on top of the retired-bank tools. Then, to serve ACT
Math from templates: add `act-mathematics` to the template sections
(`src/lib/progress.js` `TEMPLATE_SECTIONS`, `src/lib/practice.js` set-code
prefixes and Learn sections), make the practice view and Progress handle
an ACT template section (tiers become trusted, so the accuracy-only state
no longer applies to it), check a full 45-question ACT Math set in the
browser, and update the catalog notes, README and AGENTS.md.

## Next, in order

1. **Integrate `lane/platform`** (above). README and `roadmap.md` item 1
   and 6 text change when it lands.
2. **Widen the template fingerprint** (`tools/lib/fingerprint.js`: 8 seeds
   miss rare-draw edits; two versions were bumped by hand today). Add a
   `--rehash` mode to `tools/update-templates.js` that rewrites
   fingerprints under the new definition without bumping versions, run it
   in a commit with no template changes, then fix
   `docs/question-templates.md` ("rebuilt exactly while the version is
   unchanged").
3. **Integrate `lane/act-math`** and switch ACT Math to templates.
4. **ACT honesty in the meantime:** hide or label ACT Science (near-
   duplicate items, no passages); replace "Build a set from 2,300 original
   ACT questions" in the practice view with honest counts and a "checked
   automatically only, not reviewed by a person" note.
5. **A cold read of the new Hard templates.** Every template added or
   re-tiered on 2026-09-26 was answered blind only by its author. A
   read-only review (as in the review record) should classify each Hard
   template as hard-module level or not.
6. **ACT phases 2–4:** passage-set templates and Science, then English
   (slot templates over the authored passages; NO CHANGE at 20–30%), then
   Reading kept as authored sets. Scope in the review record.
7. **Leftover tells under the gate limits:** some Easy and Medium Math
   templates keep the key in a look-alike pair 90–100% of the time
   (`linear-expression-from-equation`, `system-parameter-solution-count`,
   `quadratic-vertex-reading`, `circles-packed-in-square`); several Reading
   and Writing templates have hub scores near 45%. Consider lowering check
   13's template limit once they are fixed.
8. **Split the largest views** (`review.js`, `practice.js`, the test
   screen) once platform lands.
9. **Small items:** the saved test is not in "Download my progress"
   (deferred: restoring would overwrite slots); `inscribed-composite-solids`
   asks for a sphere's surface area without giving 4πr², which is not on
   the SAT reference sheet — decide whether the stem should give it; a few
   invented events still sit in real places in Reading and Writing scenes;
   a cross-tab merge can restore an error-log tag another tab deleted (no
   UI deletes tags today).

## Needs the owner

- **An embedded graphing calculator** needs a Desmos API key.
- **Calibration** (roadmap item 2) needs official scores from real
  students, recorded under Progress → Official scores and shared with
  consent.
- **Two unexplained pushes** of `feature/prep` (09:08 and 09:19 on
  2026-09-26, to `e6e4b7a` and `508d83b`) came from this clone while lanes
  were told not to push. They published only commits already on
  `feature/prep`. Neither stopped lane reported running them.

## How the day's lanes were run

Read-only reviews ran on a detached worktree pinned to the reviewed
commit; implementation lanes each had their own worktree and branch,
exclusive file ownership, and left their work uncommitted with a proposed
commit plan; gate changes that newly failed templates were committed on a
side branch the template lanes started from, and landed after the fixes.
About eight lanes ran at once without hitting the usage limit. Registries
(`content/templates/*.json`) were regenerated only by the coordinator,
after merging.
