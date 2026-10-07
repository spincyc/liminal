# Named high-school mathematics: independent code review

Reviewer: `code_cold_review`. Date: 2026-10-07. Status: **no outstanding substantive code findings in the reviewed snapshot**. This report extends the implementation review without replacing the earlier weekly/print snapshot.

## Scope and verification

Inspected the named-plan normalizer, weekly loader and inventory checker, weekly and high-school pure libraries, both page controllers, export renderer, HTML/CSS, static-smoke integration, and related tests. Read the plan metadata, alias declarations, scope qualifications, and source/objective registry. This is a code and schema review, not independent mathematical approval of the new course bodies.

`/usr/bin/node --test test/weekly*.test.js | tail` passed **19 tests, 0 failures** after the repair below. The synthetic complete-inventory test exercises 41 canonical course files and 44 views, lazy asset emission, source/alias comparisons, missing-course rejection, and refusal of separately authored alias files. Other tests cover exact routes, invalid names, grade compatibility, source admission, safe text rendering, named student/key exports, unit deep links, unavailable weekly bodies, and print disclosure restoration. Fixture builds write only test scratch directories, which the tests remove; this reviewer did not build `dist/` or start browser/server processes.

An additional read-only exhaustive check passed **1,584 weekly route roundtrips** across all 44 expected views and **39 named-plan unit links** against the normalized current plans. `git diff --check` passed. Browser layout, mobile controls, download behavior, and actual PDF pagination remain coordinator checks.

## Finding and closure

**P3: non-string unit IDs passed named-plan admission.** A JSON unit ID of `['u1']` was coerced by the regular expression into an accepted ID, but the resulting `#trigonometry/u1` link failed strict lookup. Reproduced with a clone of the actual plan data. The engine author added explicit string checks in `normalizeHighSchool` and the pure route constructor, plus negative regressions for the array ID. Inspected the repair and reran all targeted tests; finding closed.

## Reviewed behavior

- Named course IDs survive picker values, routing, fetch identity checks, cache keys, download names, plan links, and worksheet projections. Existing numeric-grade callers and canonical grade strings continue to resolve; Kindergarten uses `k`. Named views do not invent a grade in their heading or exported packet.
- Algebra, Geometry, and Algebra 2 resolve to Common Core mathematics grades 9, 10, and 11. Their normalized units and source references come from those plans. Weekly views remove the top-level grade, supply named identity/title/scope and source metadata, and replace only week 36's `connection.after` with the named plan's next step. Fixture assertions verify every other weekly teaching field and preserve the canonical source's final bridge. The browser receives independently serialized assets; it does not mutate the shared build-time objects.
- The two new physical course files require named identities and their own plan pacing. Canonical alias files are rejected, preventing a second authored copy from drifting. `check-weekly --complete` checks all expected views while counting original weeks/items from the 41 physical courses only; three aliases do not inflate original-content totals.
- Existing allowlisted student projections and text-node rendering remain intact. Named identity adds no teacher field or key to student packets. Export tests still exclude hidden answers and private fields, preserve the full final workspace and footer grouping, and include the flexible-placement context.
- The named plan page presents a fixed conventional course order, compact unit disclosures, bounded unit links, conditional weekly-work links, and a scope/starting-points section. Source labels visibly distinguish editorial objectives from retained official references. Source URLs and dates pass the same strict admission checks. The plan metadata limits selected textbook scope and avoids claims of fixed grade placement, AP equivalence, college credit, or complete official alignment.
- Static smoke checks pin both pages' script order, constrain generated asset paths, and compare the named-plan browser bundle, download, and normalized source. Weekly course bodies remain lazy-loaded.

## Limits and completion boundary

Structural checks cannot establish source truth, public-domain status, mathematical correctness, prerequisite adequacy, or comprehensive standards coverage. External source contents and the new Trigonometry/Calculus weekly bodies require the separate content reviews. The inventory fixture proves checker behavior; it does not claim that all actual files were complete when this review ran. Final integration must run the complete inventory gate and the full repository gate. The named-page browser and print checks remain separate evidence.

## Reviewed SHA-256 snapshot

```text
b4b67aed36d49ac195912c686cc3a1ec7dc47f36fa94d4ea6ac2828e8031d2c7  tools/build-weekly.js
d785571e58fa376010bbce9a422db6251076785e3513b60741c571de7e672de5  tools/check-weekly.js
5886a6677e976611af339b1f5009c94b71376ad60a1d6f0b6a989161d8efa388  tools/smoke-static.js
73bfbd3fd34e9f4c7611a958a8f9820516ec652c2372489bb21a7522e44ae4ad  src/lib/weekly.js
6b2a62c4592fceab314c25f2624d2bf0b80e52055f6cf27457e4e78199c7e5a9  src/lib/high-school.js
9023768930fb4157674531452bcba0eb8f1d41bbb0f0a0f355af3522eaf1c35e  src/app/weekly.js
1a1e428eedc186ee4f61a7a08afc81ad16887f93f43f1b3f20578fae9df50328  src/app/weekly-render.js
1adbdf2550f2329c26067bd06d5d4132384c91d6461d99e8fbd6ff81b5504d49  src/app/high-school.js
0c9598010db8cd0773fb62f477952e320824edc4f12c93a2a69536683fdf7007  src/weeks.html
6aeb316d1f0e1d7f8448b2390eb25bafe43d9e194fb75fac5d5e2c07e63bffef  src/high-school.html
3e7041001fc3b152b38fde6c3618642d7df7828904c85a829d3f58ab5de430be  src/styles/weekly.css
f7b60c5b44797035fcbf5ffa08878b2bf987d4e26257898dc23bc14d3c57fba9  src/styles/high-school.css
03b14229d21ae0bdc2eb1594a0fbc9fc591bb13386b9c103d0bb0f9ab487a0fc  test/weekly.test.js
413dc99b607937e5606e212c6a27dd367fc2916556948c382836d0f7cbeb6338  test/weekly-ui.test.js
1f1b0a042ef4312d834cce18bf76bead0fdd62108b703e55bc3c85c13f8f0f04  content/high-school-math.json
```
