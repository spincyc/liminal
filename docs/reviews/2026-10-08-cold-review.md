# Release cold review — 2026-10-08

Release under review: `origin/main` `6e815fd` → `HEAD` `a20521b` (detached),
71 commits and 139 files, mostly content. The reviewer had no prior context,
worked only in a clean worktree, changed no code or content, and committed
nothing. This is an agent review of code, behaviour, documentation claims and
sampled rendering. It is not human editorial approval, and it does not repeat
the content-fidelity reviews recorded on 2026-10-07/08.

## Scope covered

| Area | What was done |
| --- | --- |
| Guidance and contracts | Read `AGENTS.md`, `README.md`, `docs/curriculum.md`, `docs/weekly-coursework.md`, `docs/high-school-math.md`, `docs/daily-reading.md`, `docs/reading-level.md` and `docs/reading-packets.md`. Skimmed every 2026-10-07/08 record in `docs/reviews/` for status, hashes and open findings. |
| Code review | Read in full: `src/lib/{daily-reading,reading-level,weekly,high-school}.js`, `src/app/{daily-reading,daily-reading-render,reading-level,weekly,weekly-render,high-school}.js`, `tools/{build-daily-reading,check-daily-reading,build-reading-level,check-reading-level,build-weekly,check-weekly,reading-packet}.js`, and the diffs of `tools/{smoke-static,build,check-all}.js`, `src/app/{curriculum,course-render,test-shell}.js`, `src/lib/booklet.js` and all changed HTML. Checked layering, text-only rendering, URL handling, export allowlists, storage parsing, error paths and test coverage. Probed reading-level edge cases directly in Node. |
| Gate | `node tools/check-all.js` (npm not installed). |
| Browser | Headless Chromium 153 with ChromeDriver on port 9581 and `PORT=8181 node tools/serve.js`, driven through the WebDriver HTTP API with Node `fetch`. Viewports were set with device-metrics emulation, colour schemes with media emulation. Details follow. |
| Docs and claims | Checked README and docs counts against the validators and data. Checked trademark and independent-project wording, score-prediction and certification wording, and review-status claims against the review records and current file hashes. |
| Content sampling | Ran all validators. Scanned all 2,340 nights for transcription artefacts. Rendered about 20 nights in the browser and read 8 random verse nights. Built one XeLaTeX packet of 5 nights. |

### Browser checks performed

- **All key pages at 320, 390 and 1280 px, in light and dark.** Pages: index, daily-reading (two nights), reading-level, weeks (two courses), curriculum (a plan and a grade comparison), high-school, courses, practice, learn (deep link) and print. Each page reached its ready state. None had a console error or horizontal page overflow; the overflow probe skips scroll containers. Body colours switched correctly. A text-contrast probe on the new pages, with disclosures open, found no text below WCAG AA in either scheme.
- **Daily reading.**
  - Eight nights across K–12. Each showed its heading, attribution and picker state.
  - Invalid routes recover with a visible message: `13/1/1`, `a1/1/1`, `5/37/1`, `5/1`, `zzz` and `5/1/6`.
  - Previous and Next work at the first and last nights and across a week boundary. The grade picker resets to week 1, day 1.
  - Facilitator notes are absent from the DOM until a note is opened. In print emulation, and in a CDP PDF with every disclosure open, the notes and evidence are hidden. The student download contains no script, no facilitator note and no evidence, and it does carry the trademark notice.
  - Tab order has no trap.
  - Offline loading fails into a visible "Try again" button, and the retry works. A stale-request race (slow Grade 10, then Grade 2) ends on Grade 2.
- **Reading level.**
  - Ran a full placement from Grade 5, with the reading clock faked: pass at 5, pass at 6, then close at 7. The result is Grade 6, week 19, as documented.
  - The night's title is not shown while reading or answering. An empty submit announces the missing answers and focuses question 1.
  - The 12-week plan has 60 nights, 20 stretch nights (1/1/1/1, then 2 per week) and 3 re-checks. Plan links go to the daily library. In print emulation, controls are hidden and the print-only honesty line shows.
  - The plan is restored after a reload. A reload mid-passage shows the restarted-clock notice. Stop discards the check.
  - Erase asks for confirmation, focuses Erase, and clears storage.
  - The tab table probe (`rl-6-b`) fits at 320 px. There is no keyboard trap.
  - Two defects were reproduced (S1, S7) and a UTC-date display error was confirmed (S8).
- **Weeks.**
  - Six routes: CC math K, CC reading 12/36, Singapore 7, Calculus, the Algebra alias and CC reading 3. All have the correct context labels, links and tabs.
  - Before the key opens, no answer text is in the worksheet DOM. Switching worksheets closes the key. With the key open, print emulation hides answers.
  - The student download has no answers or worked steps. The key download has them. The print popup has no answers and has `opener === null`.
  - Tabs respond to Arrow, Home and End. Passage links open Read and focus the passage. Invalid routes recover. Back works.
  - Native print with Learn selected includes the Read passages, so `beforeprint` fires in CDP `printToPDF`.
- **Curriculum and high school.**
  - Unit deep links work, as do 36 weekly links per plan and the start link. The grade comparison has no weekly links.
  - Invalid routes recover. High-school unit deep links open and focus their unit. The `beforeprint`/`afterprint` disclosure expansion is restored after printing.
  - Every local link target on index returns 200.
- **Practice, learn, print and courses smoke.**
  - Each page loads with no console errors.
  - A full-length SAT started at 320 px: the new shell brand fits, with no overflow.

## Environment

Arch Linux; Node v26.10.0 (CI uses Node 24); Chromium/ChromeDriver
153.0.8010.52; XeLaTeX with CMU fonts and `pdfinfo`/`pdftotext` present. The
local server sends uncompressed files; gzip sizes below are computed with
`gzip -9` as an estimate of GitHub Pages transfer.

## Gate result

`node tools/check-all.js` exit 0 in 38 s: **All checks passed**, 789 tests,
0 failures. The validators report:

- Weekly: 41 original courses and 44 views, 1,476 weeks, 4,428 worksheets, 26,628 items and 2,953 examples. These match the README.
- Daily reading: 13 grades, 2,340 nights, 180 source records and 7,122 questions. Advanced 1–4 are reported as not yet available.
- Reading level: 12 levels, 24 probes and 92 items, with review status `independently-reviewed`. `--complete` also passes.

`git diff --check origin/main..HEAD` flags one blank line at EOF (N10).

## Findings

Severity: **blocking** means fix or explicitly accept before pushing.
**Should-fix** means a real defect or inaccurate claim that is not
release-stopping by itself. A **note** is advisory.

| ID | Severity | Area | Location | Finding | Evidence | Suggested fix |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | blocking | Review closure (daily reading) | `docs/reviews/2026-10-07-daily-reading-review-early.md:49`; `content/reading-daily/2.json` (SHA-256 `22d05250…`) | Grade 2's **blocking** finding G2-B1 has no recorded independent closure. G2-B1 found that 24 Andersen nights were "not the Paull/Warne 1888 text the record names". Commit `751be76` retyped and collated them, restored whole tales, and replaced 7 nights. No reviewer re-checked the result. The repairs to K (`4752ce8`), Grade 1 (`66774e9`), Grade 4 (`755e993`) and Grade 5 (`111fd8b`) also have no recorded re-check. Grades 3 and 6–12 did receive recorded delta reviews. The project's own definition of blocking is "do not ship as attributed". | None of the current K/1/2/4/5 hashes appears anywhere in `docs/`. The early-band record has no delta section. The primary-band delta check covers Grade 3 only. | Before pushing, record an independent delta review of `2.json`: at least the Andersen nights and the restored tales against the 1888 Warne images. Record a lighter delta check for K, 1, 4 and 5. Alternatively, the owner records explicit acceptance of the author-verified repairs in the review record. |
| S1 | should-fix | Reading level: re-check | `src/lib/reading-level.js:342,345,355,360` (`at.core.level`); `src/app/reading-level.js:84–98` and `207–227` | A re-check crashes once a plan has run past the end of the library, and the student is then stuck. `cursorsOn` returns `plan.after.core === null` when the core year is exhausted and there is no stretch level, for example at Grade 12. Every branch of `applyRecheck` then reads `at.core.level`. The feedback screen offers only "See the decision", which throws on every click and again after a reload. Only clearing site data escapes. | In Node, `applyRecheck({core:{level:12,index:170},stretch:null,weeks:4,…}, {result:"weak"\|"near"\|"pass"}, "2026-11-20")` throws `Cannot read properties of null (reading 'level')`. In the browser, an injected end-of-year Grade 12 plan led through re-check and "See the decision" to `Uncaught TypeError` at `lib/reading-level.js`. After a reload the same screen and error remain. | Handle a null `at.core` in `applyRecheck` with an explicit end-of-library decision. Make `continueAttempt` fail safe by finishing the attempt and showing a message. Offer Stop or Home on the feedback view. Add a regression test. |
| S2 | should-fix | Performance on phones | `src/app/daily-reading.js:44`; `tools/build-daily-reading.js:144` | Opening one night downloads the whole grade file: 0.52–1.95 MB raw, about 145–665 KB gzip. A night is about 12 KB (median; max 25 KB). A superseded grade fetch is not aborted, so it competes with the current one. | The resource timing for `#10/5/2` shows `/content/reading-daily/10.json` at 1,948,443 bytes. With throttling (200 KB/s, 1.5 s latency), switching from Grade 10 to Grade 2 took 10.5 s to show Grade 2. | At build time, emit per-week or per-night JSON plus a small per-grade manifest of titles, minutes, overview and progression. Abort stale fetches with `AbortController`. |
| S3 | should-fix | Rendering: tables | `src/app/daily-reading-render.js:135`; `src/styles/daily-reading.css:26`; `tools/reading-packet.js:63,82`; `tableRows` at `src/lib/reading-level.js:100` | The tab-separated moth table in `reading-6-w34-d2` (Wallace) renders as run-together lines in the nightly reader and the student download, because `pre-line` collapses tabs. The reading-level page renders the same block as a table. In the PDF packet it becomes one run-on paragraph, and its ditto marks `"` turn into opening quotes `“`. | Screenshot at 390 px shows lines like "Dec. 13th 1 Fine; starlight". `pdftotext` of the packet shows "1855 Dec. 13th 1 Fine; starlight “ 14th 75 …". | Move `tableRows` into `lib/daily-reading.js` and use it in the reader, the export and the packet, typeset as a tabular. Leave ditto marks unconverted. |
| S4 | should-fix | Rendering: transcription markup | Content: ~295 nights with `_emphasis_` (e.g. `reading-10-w01-d1` "they _are_ mine"); `{footnote [1. …]}` in `reading-11-w23-d4`, `w26-d4`, `w27-d2`, `w29-d1` | Plain-text transcription markup is shown raw to students in the reader and the student download. The PDF packet already turns `_x_` into italics, so screen and print disagree. The editions declare these conventions as retained, so this is presentation, not fidelity. | The rendered text includes "for they _are_ mine" and "our village {footnote [1. Hannibal, Missouri]} on the west bank". Counts per grade: K 10, 2 2, 4 18, 5 50, 6 46, 7 67, 8 20, 9 15, 10 33, 11 33, 12 1. | In presentation only, render paired underscores as `<em>` built from text nodes, matching the packet. Show `{footnote …}` as a set-off note, or explain the convention in the night's context. |
| S5 | should-fix | Review-status claim (reading level) | `docs/reading-level.md:79–94`; `content/reading-level/probes.json` | The documented rule says "a rebound night whose text changed needs review again before the status is claimed for it". After `236d33a` set `independently-reviewed`, two probe nights were rebound with author-only rereads: `rl-11-b` (Walden whitespace, `cfeca1f`) and `rl-9-a` (Douglass "be"→"he", `a20521b`). Neither the doc nor the review record mentions them. | `git log -- content/reading-level/probes.json`; the diffs change only `textHash` for those probes. The commit messages say the items were reread by the author. | Add the two rebinds to the review record with a reviewer's or the owner's acceptance. Alternatively, narrow the rule to text changes that touch quoted or answer-bearing material, and state that this is the rule. |
| S6 | should-fix | Docs vs content | `docs/daily-reading.md:3–7, 18–22, 57–66`; `docs/reading-packets.md:42` | The docs describe Advanced 1–4 as part of the library ("and then four Advanced levels…"), but no `a1`–`a4` files exist. The packet doc's example `--nights k:w7d4,a1:w3d2` fails. | `ls content/reading-daily` lists only k, 1–12. The gate prints "Advanced levels not yet available". `reading-packet.js --nights a1:w3d2` fails with `ENOENT … a1.json`. | Mark Advanced 1–4 as planned and not yet published, and change the example to a K–12 night. |
| S7 | should-fix | Reading level: repeat protection | `src/app/reading-level.js:51–57, 78–83` | "Stop this check" deletes the whole attempt, and with it the record of which passages were seen. A student can view a probe's feedback, which shows every key and rationale, then stop and restart. The same passage then comes back as fresh (`repeat:false`) and can count as a pass. | In the browser: answer `rl-5-a` (feedback revealed the answers), click Next passage, then Stop, then restart at Grade 5. `current` is `rl-5-a repeat=false`. | Keep a seen-probe log that Stop does not clear (Erase may), and derive `history()` from it. |
| S8 | should-fix | Reading level: dates | `src/app/reading-level.js:279` | "Finished …" shows the UTC calendar date (`finishedAt.slice(0,10)`). Evening checks in the Americas therefore show tomorrow's date. `today()` uses local dates, so the page mixes the two. | With the time zone set to America/Los_Angeles, a finish at 19:30 PDT on 8 Oct displays "Finished Friday, October 9, 2026". | Format the local date of `finishedAt` (as `today()` does), or store a local ISO date. |
| N1 | note | Performance | `tools/build-weekly.js:225`; `src/curriculum.html`, `src/high-school.html` | Weekly course JSON ships pretty-printed: 1.18 MB raw versus 0.98 MB minified for CC reading 12, though gzip differs little (265 KB versus 253 KB). `weekly-index.js` (119 KB, 26 KB gzip) loads on the curriculum and high-school pages only to decide which links to show. Curriculum also loads `curriculum.js` (574 KB, 98 KB gzip). | `dist/` sizes | Minify the course JSON. Consider a per-track or availability-only index. |
| N2 | note | Reading-level plan | `src/lib/reading-level.js:268–280` | Mid-week stretch nights can split a continued reading. In the run above, Grade 6 week 19 day 2 (Cranford ch. IV, "This reading continues next night") was followed by a Grade 7 stretch night, then week 19 day 3. | Plan week 1 in the browser run | Move the stretch slot when the core night has `continuesTo`, or note the split in the plan. |
| N3 | note | Docs accuracy | `docs/reading-level.md:238` | The doc says the bundle is "about 200 KB". The built `dist/content/reading-level.js` is 263,940 bytes (81,703 gzip). | `stat` | Update the figure. |
| N4 | note | Wording | `README.md:59` | "self-scored passages" can read as if the student scores them. The method doc says the questions are scored automatically in the browser. | — | Say "automatically scored". |
| N5 | note | Review records are stale for current code | `docs/reviews/2026-10-07-daily-reading-code-review.md:46–58`; `…high-school-code-review.md` snapshot | The daily-reading code-review hashes no longer match `src/lib/daily-reading.js`, `src/daily-reading.html`, `tools/build-daily-reading.js` or `tools/check-daily-reading.js`, which changed for Advanced-level support (`5e7a8e9`). The high-school snapshot no longer matches `tools/smoke-static.js` or `src/app/weekly.js`. No code-review record existed for the reading-level platform or `tools/reading-packet.js` before this one. Grades 3, 7, 8, 9, 10 and 11 carry author edits made after their recorded delta reviews; commit messages describe each edit. | `sha256sum` against the recorded snapshots | No action is required if this record is accepted as the follow-up. Otherwise, note the changes in the older records. |
| N6 | note | Reading-level design limit | `src/lib/reading-level.js:326–332` | With two forms per level, after two non-passing re-checks at one stretch level every later re-check there is a repeat and can only hold. Advancement then depends on the core year running out. The docs imply this but do not state it. | Code reading | State it in "Limits", or add forms. |
| N7 | note | Reading-level robustness | `src/lib/reading-level.js:191–196` | `placement([])` returns the top level as an unconfirmed start: `Math.min()` is `Infinity`, so `below(levels, Infinity)[0]` is 12. This is reachable only if a finished attempt's probe IDs disappear in a later release, or through edited storage. | In Node: `placement([], [1,2,3,12])` gives `{level:12, confirmed:false}`. | Return no placement and ask for a new check. |
| N8 | note | Gate coverage | `tools/smoke-static.js`; `tools/check-all.js` | Smoke checks `getElementById` targets only for `reading-level.js`. The lookups in daily-reading, weekly and high-school are unchecked, though all resolve today. The gate runs `check-reading-level` without `--complete`, so deleting one level's probes would not fail it. | Code reading | Extend the ID check to the other new controllers. Use `--complete` once the ladder is meant to stay full. |
| N9 | note | Tooling input checks | `tools/reading-packet.js:22–28, 143` | `--grades` values are not validated (a bad value gives a raw `ENOENT`). An impossible date such as `2026-02-30` is silently normalised by `Date.parse` to another night (week 28, day 1). | In Node: `schoolNight("2026-02-30","2025-08-25")` gives `{week:28, day:1}`. | Validate grade keys with the `--nights` pattern, and round-trip dates through `toISOString`. |
| N10 | note | Hygiene | `docs/reviews/2026-10-07-weekly-review_reading_high.md:85` | `git diff --check` reports a new blank line at EOF. | `git diff --check origin/main..HEAD` | Trim it. |
| N11 | note | Test hygiene | `test/` | A gate run leaves empty `.scratch/{daily_reading_platform,science-tooling,weekly-engine}` directories. They are git-ignored. | `ls .scratch` after the gate | Remove the parent directories in the tests' cleanup. |
| N12 | note | Branding (known, out of scope) | Page headers | Headers differ from page to page. Daily-reading and reading-level navs omit Year plans. Weeks and curriculum omit Daily reading. High-school says "Math sequence". Courses, practice, learn and print use the older site header with other subtitles. This is being fixed in another worktree and was not assessed further. | Sweep header text at 390 px | — |

### Checked with no finding

- **Text-only rendering.** New controllers build content with `textContent` and DOM APIs. The `outerHTML` and `document.write` calls serialise DOM built from text nodes. No content is assigned through `innerHTML`.
- **URLs.** Links built from content pass `safeHttps` or an `https:` test, and the build validators reject unsafe URLs. Fetch paths come from validated keys, never from content.
- **Exports.** Student exports are allowlist projections. No facilitator notes, evidence, answers or steps appeared in student files, popups or print output.
- **Layering.** The `src/lib` modules are pure and DOM-free; `reading-level.js` only mentions `localStorage` in a comment. Presentation calls into lib for every decision.
- **Storage.** `liminal:reading-level:v1` is parsed as untrusted, bounded and versioned, and every access is wrapped in try/catch.
- **Claims.**
  - Trademark and independent-project wording is present in the README notice, every new page footer, and the daily and weekly exports.
  - No new text claims score prediction, certification, Lexile equivalence, AP equivalence or credit.
  - The README and doc counts for weekly coursework, daily reading (180 nights per grade, 10–30 minutes), the reading-level probes (92 items, keys 24/23/22/23) and the 21 high-school objectives match the data.
  - Weekly content is unchanged since the weekly integration review (`124e6e9`).

## Content sampling

The validators pass. A scan of all 2,340 nights found:

- the S3 table, and the S4 underscore and footnote markup;
- 1,836 blocks with `--` dashes and 23 with asterisks. Both are period or transcription conventions, for example Milne's "BANG!!!???***!!!" and Eliot's `****` section rules.
- no stray HTML, entities, control characters, U+FFFD or digitiser boilerplate;
- three U+2015/U+00A0 instances in Grade 12. They are in Conrad and in Hamlet's lacuna "And either … the devil", and appear intentional.

Eight random verse nights kept their lines and indentation. About 20 nights
rendered cleanly at 390 px apart from S3 and S4.

The 5-night XeLaTeX packet compiled to 12 pages with 0 overfull-box warnings.
It includes the 84-block Hamlet night. It shares S3 and S4 (`{footnote …}`
prints raw).

## Limits

- **Content fidelity was not re-reviewed.** No source witnesses or page images were consulted. B1 concerns recorded review closure, not a fidelity defect that this review found.
- **Device coverage.** Browser checks used headless Chromium with emulated viewports and colour schemes only. There was no Safari or Firefox, no real phone, no screen reader, no real print dialog (print was checked through emulation and CDP `printToPDF`), and no visual inspection of every page.
- **Transfer sizes.** Gzip sizes are local estimates. GitHub Pages compression and caching were not measured.
- **Reading-level timing.** The reading clock was faked to reach realistic pace bands. A real student's timing, item quality and placement accuracy were not assessed.
- **Code-review depth.** Code review covered the new modules listed above. Pre-existing practice, test-shell and booklet code was smoke-tested only, apart from the brand diffs.
- **Leftovers.** The local `dist/`, which the gate builds and git ignores, was removed after the review.
