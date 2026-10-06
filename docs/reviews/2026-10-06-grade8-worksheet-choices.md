# Grade 8 worksheet choices review — 2026-10-06

Accepted within the scope below. No blocking defect was found in the three-full-worksheet model, per-night selection, matching exports, or sampled print output. This review was performed by an agent separate from the implementation authors. It did not change production code, generator mathematics, or editorial approval status.

## Independent engine review

`node --test test/course-engine.test.js test/course-packet-cli.test.js` passed all 22 tests. Additional independent checks used frozen settings, generated nights, and choice maps to verify replay and selection without mutation. Each night supplies A, B, and C with the full requested question count, complete answer/step records, distinct form codes, and the same ordered lesson/template schedule. Advancing that schedule once per night preserves coverage in every chosen packet.

The semantic and visible identity sets span **all alternatives and all nights**. Consequently any selection of one alternative per night is a subset of a globally distinct pool. Checks covered:

- Topic 1 seeds `choices-review-topic1-0` through `choices-review-topic1-99`: every request produced 10 nights × 20 questions × 3 alternatives, with 600 unique semantic identities and 600 unique visible identities.
- `choices-review-topic-1`, `choices-review-topic-2`, `choices-review-topic-3`, and `choices-review-topic-4`: each selected the corresponding complete topic and produced 600 distinct questions. `choices-review-all-lessons` did the same for all 36 lessons.
- `choices-review-mixed-27`: Topic 1, three nights, seven questions per worksheet; all 27 possible A/B/C selections were checked. Each selected packet contained 21 distinct questions and retained the original worksheet/key objects.

The pools are finite. With the single lesson selected, ten nights, twenty questions per worksheet, and seed `choices-capacity-<lesson-id>`, these lessons refused the 600-question request: `1-7`, `2-5`, `2-8`, `2-9`, `3-1`, `3-2`, `3-3`, `3-6`, `3-7`, `4-5`. The other 26 lessons passed that sampled request. Refusal explicitly explains that three full worksheets require more distinct exercises and recommends fewer questions/nights or more lessons. These observations are sampled capacity evidence, not maximum-capacity bounds or an unlimited-generation claim.

## Independent browser and PDF review

Chromium 153.0.8010.52 and ChromeDriver used the actual built Courses page. Its engine, app, renderer, HTML, and CSS were byte-equal to the reviewed sources. The built course revision was `40bfd4e54c690b57`.

For Topic 1, seed `choices-browser-mixed`, three nights, seven questions per worksheet, the interface correctly reported nine complete worksheets/63 available questions and three selected worksheets/21 questions. Selecting B/C/A preserved other nights. Returning A→B→A reproduced the original previews and form identifiers. Changing night or worksheet reset the answer reveal. Editing settings disabled stale exports; rebuilding reset choices to A; immediate cancellation left no active packet. The actual worker also completed the ten-night, twenty-question Topic 1 preset with seed `choices-browser-standard`. The single-lesson `1-7` capacity refusal appeared clearly in the interface and left exports disabled.

Current Night 2/C was printed through a real new-tab export. All-night mixed, single-sided, student-only, and answer-only HTML downloads were opened as static documents and printed to actual PDFs. Every selected worksheet had seven questions. The 21 exported student prompts, 21 answers, and 21 worked step sequences matched the selected B/C/A generator records exactly. Student documents contained no solution elements, answer metadata, or active content. Each nightly guide contained exactly the lessons in that night's questions, in course order. All headers and forms matched their selected alternatives.

| Export | Actual pages | Component start pages | Separator backs |
| --- | ---: | --- | --- |
| Current Night 2/C, duplex | 14 | 1, 11, 13 | None needed |
| All nights B/C/A, duplex | 46 | 1, 13, 15, 17, 27, 29, 31, 43, 45 | 12, 42 |
| All nights B/C/A, single-sided | 44 | 1, 12, 14, 16, 26, 28, 30, 41, 43 | None |
| Student-only B/C/A | 6 | Two pages per night | None |
| Worked answers B/C/A | 6 | Two pages per night | None |

PDF text extraction confirmed actual component starts and matching night/letter/form labels. Every duplex component begins on an odd page; no physical sheet is shared between components. Raster inspection of duplex pages 12, 13, and 29 confirmed the labeled separator, student B borders/unruled handwriting space, and answer C typography, exponents, radicals, and complete steps. The separate student export has 21 empty workspaces with thin question borders and no background ruling. Browser screenshots were inspected at desktop and 390-pixel phone width, including a real emulated dark color scheme. No horizontal overflow or console errors occurred. Native worksheet selection accepted keyboard input.

Local evidence is disposable under `.scratch/worksheet-choices-review/`: independent engine script/results; browser script/results; exact-key/dark-mode supplemental results; static HTML, PDFs, extracted text, and screenshots. The owned HTTP server, ChromeDriver/browser processes, and browser profile were stopped/removed after verification.

## Additional implementation and integration evidence

These checks were supplied by the implementation lanes and are distinguished from the independent checks above.

- The UI author used seed `ui-worksheet-choices`, three nights, four questions, and deliberately delayed stylesheet loading after requesting an all-night B/C/A duplex export. Changing the live controls to A/B/A, current-night, single-sided before release did not alter the captured export. Its 31-page PDF retained B/C/A, all-night scope, duplex separators, and matching guide/student/key labels. A separate single-sided PDF had 25 pages and no separator backs. The review inspected that lane's recorded metrics and page checks.
- The coordinator ran the actual CLI with Topic 1, seed `worksheet-choices-home`, three nights, four questions, `--worksheets B,C,A --combined`. The 31-page combined PDF's starts were 1/7/9/11/19/21/23/29/31, with matching forms on every page; the separate student and key PDFs had three pages each. The coordinator also reported the repository-wide gate passing all 705 tests plus build, content, and static checks.

## Reviewed source fingerprints

SHA-256, recorded after the checked build and independent verification:

| Source | SHA-256 |
| --- | --- |
| `src/lib/courses/engine.js` | `44a4ffd6976a4f27ec19429193946686ee3e65f190b8a6f8352b39c71459665c` |
| `src/app/courses.js` | `04743966178f34bfb89aa89d2d1df71e188fa6627471a286e349711025b60482` |
| `src/app/course-render.js` | `91d4e6451a8930bfdae1c36d8f08656a58ec47114b432f4b7d71cc12fc5e0a48` |
| `src/courses.html` | `7d5cc1f213d7deb061de9cf65359516b1768941b912d34e727df5398907a3f2e` |
| `src/styles/courses.css` | `c7198125454794b4ca8354b85c722956e097b9a9baaf0dec784ab8f11dce2de5` |
| `tools/course-packet.js` | `14eb6690713cec93414a25db311ad329f0782dc72dd2a41d5f4b52b3767659e0` |
| `test/course-engine.test.js` | `d81596495583afbdce76c9948d302cafc4332a8c7f0dc345c357078d3eb32d14` |
| `test/course-packet-cli.test.js` | `6211006e58b5eece6763e7a4fc998486e8225c2d438b387942426727f8faedcc` |

The independent mixed duplex PDF SHA-256 was `e926bde992fd32349dd951d0b9b1c3eb86250338d08741a2905ad3667fda98d7`; the matching single-sided PDF was `7b9df1fea9acd38bc7822a07986cbc438e09f75875948adc0d47fbac702428de`. PDF metadata can change on recreation; seeds, settings, revision, worksheet letters, and form labels are the replay evidence.

## Limits

This review covers selection/integration behavior and sampled print layout. It does not re-certify unchanged generator mathematics, test every seed or maximum 30-night/100-question request, prove algebraic equivalence detection beyond the established identity contracts, or establish human editorial approval or measured difficulty. Browser/PDF checks used one Chromium build; no physical printer, other browser engine, or real-device assistive technology was tested. Exact future replay still requires the recorded course revision.
