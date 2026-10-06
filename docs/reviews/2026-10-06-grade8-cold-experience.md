# Grade 8 cold experience review — 2026-10-06

Read-only review of `8c79a1d4332078455008842acddca3930dfdbc94`, course revision `5ac28bdd81ef7278`. No prior review conclusions were read. The landing page was excluded because a separate replacement was underway. Findings below describe the reviewed revision; subsequent fixes need their own verification.

**Final disposition:** All four findings below were resolved in the independently checked repair pass for course revision `6cf7752c087f325c`. See the final verification section for scope, artifact hashes, and new landing-page assessment. The findings remain as a record of the original revision.

## Findings, strongest first

### 1. High: graph legend radicals expand to several inches

**Reproduction:** Open `.scratch/print/topic-1-practice/worked-answers.pdf`, page 2, Night 1 question 5. Packet seed `home-2026-10-06`; all Topic 1 lessons; 20 questions × 10 nights. The legend's fourth value, √436, has a normal-sized radicand but an enormous radical stretching most of the lower page. The same defect appears for other number-line keys. In print-media DOM measurements the first four affected radical SVGs measured approximately 247 × 494 CSS pixels each.

**Cause and impact:** `src/styles/courses.css:121` selects every SVG below `.course-graph`, including the math renderer's nested `.lm-math-sign` SVG inside `.course-graph-legend`. Its `width: 100%`, `height: auto`, and block display override the math symbol's intended sizing. This corrupts the displayed mathematical notation and greatly increases answer-key page use. Ordinary inline roots outside graph containers are correctly sized.

**Bounded fix:** Scope graph sizing to the direct plot SVG (`.course-graph > svg`), then inspect both the on-screen answer preview and regenerated actual PDFs for crowded number-line legends containing radicals. Recheck pagination afterward before separately treating the footer-only page described below.

**Evidence:** `.scratch/cold-experience/topic-key-page2.png`; `.scratch/cold-experience/export-check/result.json`. The reviewed Topic 1 key has 57 pages; page 46 contains only the independent-project footer (`topic-key-page46.png`). The oversized radicals are a likely contributor to that pagination, not a demonstrated sole cause.

### 2. Medium: studying is placed after the full homework preview

**Reproduction:** Fresh `dist/courses.html` automatically builds the default Topic 1 packet. The collapsed “Read the study guide for selected lessons” control appears at document y = 6,315 px on a 1280-pixel-wide desktop, and y = 11,681 px on a 390 × 844 phone. It follows the entire 20-question Night 1 worksheet. Neither the lesson selector nor the routine offers a direct read-guide jump. The print-view action is earlier, but is presented as a printing action rather than the natural on-screen next step.

The routine explicitly asks the learner to read the explanation before generating a worksheet. Its actual control order makes that difficult to discover. Selecting only current lesson 2-3 works, but the inline guide still starts with the course introduction and all six routine paragraphs before the selected lesson. Those repeat content already presented immediately above.

**Bounded fix:** Put a clear “Study selected lessons” action beside the lesson selection, with the selected guide before the worksheet preview or a direct jump that opens it. Start the inline guide with the selected lesson(s), while retaining the fuller orientation in the standalone printable guide. A single-current-lesson selection should reach that explanation without traversing the prebuilt packet.

**Evidence:** `.scratch/cold-experience/result.json`; `07-phone-study-entry.png`; `10-desktop-selected-guide.png`. Structural locations: `src/courses.html:116` (packet) and `src/courses.html:127` (guide).

### 3. Medium: answer-key continuation pages cannot identify their worksheet

**Reproduction:** In the same Topic 1 worked-answer PDF, page 2 starts directly with question 5; pages 3–5 likewise have no Night 1 label, form code, or page identifier. Every later night restarts numbering at 1, and its continuation pages again have no identification. Only the 10 first pages of the 10 nightly keys contain the matching form identifier; 47 of the 57 PDF pages do not. Student pages, by contrast, repeat their form and page identifiers correctly.

**Impact:** A loose or reordered key page cannot readily be matched to its night, particularly when checking several similar worksheets. This undermines the otherwise useful form-code correspondence between student and key copies.

**Bounded fix:** Give every printed key page a compact night/form/page identifier, with pagination that keeps each question and worked explanation together. Reuse the existing measured-page approach if needed; avoid repeating the full large title block merely to carry the identifier.

**Evidence:** `topic-key-page2.png`; `src/app/course-render.js:353` builds one unpaginated answer-key article with a single header, unlike measured student pages.

### 4. Low: study-guide lesson starts and short closing sections are orphaned

**Reproduction:** `.scratch/print/volume-study-guide/original-study-guide.pdf` page 5 ends with the lesson 1-5 heading and textbook/standards line, while its objective and teaching begin on page 6. The 39-page guide ends with a final page containing only “Practice move,” two lines of advice, and the footer. Other lesson boundaries also continue without a running lesson label.

**Bounded fix:** Keep each lesson heading, metadata, and first objective/paragraph together. Keep short closing advice with preceding material where practical. Do not force every full lesson into an unbreakable block, which would create larger blank areas.

**Evidence:** `.scratch/cold-experience/guide-page5.png`; `guide-page39.png`; `src/styles/courses.css:198` and `src/app/course-render.js:99`.

## Verified strengths and scope limits

- Tested the built course page at desktop and phone widths, light and dark mode, current-lesson selection (2-3), a two-night four-question packet with seed `cold-experience-2026-10-06`, guide disclosure, answer toggle, and separate student/key/guide print views. Native keyboard Enter operated the guide disclosure; Space operated answer visibility; focus remained visible. No console errors or horizontal page overflow appeared.
- Student preview starts without answer nodes. Turning worked answers on inserted four answers; turning it off removed them. The eight-question student export contained zero `.course-answer` elements, scripts, iframes, objects, or embeds. Direct Courses-page printing while worked answers were shown printed only the selected study guide, with two examples and no student/key packet material.
- Inspected both supplied student HTML exports: 200 Topic 1 questions and 36 volume questions, zero answer nodes, scripts, or embedded documents, and zero identical rendered prompt strings within either packet. This is an exact-repeat check, not a claim that mathematical designs are all distinct.
- Inspected student plot descriptions and blank drawing grids: no answer-only points or solution lines appeared in the reviewed drawing questions. Known points on supplied question graphs remain described accessibly. This is sampled graph-leakage inspection, not a mathematical correctness audit of every question.
- Student PDF samples were clear and provided usable handwriting lines. Row-major question ordering was apparent. Headers carried night, form, version, packet settings, and page numbers. Fractions, mixed numbers, repeating bars, cube roots (including negative radicands), and negative exponents were legible in the sampled student pages. Axes and intervals were labeled. Paper remains black ink on white in dark mode.
- Visually inspected Topic 1 student pages 2 and 4; volume student pages 7, 8, and 15; Topic 1 key pages 2 and 46; volume guide pages 1, 5, and 39, plus live desktop/phone snapshots. Text extraction was used to inspect broader pagination. This does not claim visual inspection of every PDF page or physical-printer verification.

Browser harnesses and screenshots are in `.scratch/cold-experience/`. They used their own ephemeral ports, Chromium profiles, server, and ChromeDriver, all stopped on completion. No production files or builds were changed by this review.


## Final independent repair verification

Rechecked the frozen built `dist/` application and the final `reviewed-*` PDF packets on 2026-10-06, without rebuilding or changing production files. Course revision: `6cf7752c087f325c`; guide content SHA-256: `3c61ae58c92195a664d50592853ff8f5dda5bb60dd6cec3ea97fe53013cc280d`.

| Original finding | Final disposition and evidence |
| --- | --- |
| Oversized graph-legend radicals | **Resolved.** Sampled radical SVGs measure about 7.44 × 15.98 CSS pixels under print media. The final Topic 1 key page 8, Night 2 question 9, shows √321 normally in the legend alongside a mixed number and repeating decimal. Screenshot: `.scratch/cold-experience/final-pdfs/topic-key-page8.png`. |
| Study follows the packet | **Resolved.** Study opens by default with lesson 1-1 visible, two closed example disclosures, and no generated packet. The reading surface begins at y551 on the 1440-pixel desktop and y607 on a 390 × 844 phone; the phone lesson picker starts collapsed. Exactly one lesson is displayed, while all 11 Topic 1 lessons remain selected for navigation. “Practice this lesson” correctly narrows the practice selection to the currently read lesson (tested with 3-7). The repeated full-course orientation is absent from the inline reader. |
| Unidentified continuation key pages | **Resolved.** All 56 Topic 1 key pages and all 18 volume key pages contain night, form, and page identifiers. The same checks pass all 40 Topic 1 and 12 volume student pages. Every page contains substantive content; none is footer-only. Topic 1 key page 2 visibly has the compact repeated header. |
| Orphaned guide starts/advice | **Resolved in the checked artifacts.** Volume guide page 6 now keeps lesson 1-5's title, metadata, objective, and beginning explanation together. Page 57 ends with a complete worked example, checks, practice advice, and footer. No lesson heading is isolated among the last three nonempty text lines of any final guide page. This combines visual samples with page-text inspection rather than claiming visual inspection of every boundary. |

Additional repair checks:

- Solution-only figures remain hidden while their examples are closed: both 3-7 sketches; the completed 4-6 tables; and the 4-3 example 1 absolute-error table. Opening the appropriate disclosure shows the corresponding figure. Given tables in 4-6, supplied observations/graph in 4-3, and given graphs in 3-6 and 4-1 remain visible before reveal. The checks use actual browser visibility, not merely field names.
- The final volume student page 8, question 26, uses a full-width six-column blank calculation table with a graph and writing lines below. Headings and empty cells are legible and fit the page. The large 4-3 worked example, including the six-column solved table, fits intact on volume guide page 48. Screenshots: `final-pdfs/volume-student-page8.png` and `final-pdfs/volume-guide-page48.png`.
- An eight-question 3-7 packet using seed `cold-final-experience-2026-10-06` initially has zero answer nodes; revealing worked answers shows eight. Direct application printing with those answers visible produces only the selected guide and its two worked examples, with neither student worksheets nor the worked-answer packet. The final volume student export still contains zero answer nodes, scripts, or embedded documents.
- No application exception was observed. The only browser console error during the combined pass was the standalone exported document requesting an absent `/favicon.ico` from the temporary review server; this did not affect content or printing.

### New landing-page assessment

Independently inspected the actual new landing page at 1440 × 1000 and 390 × 844, including phone dark mode, the module cards, paper section, resource links, and footer. No material visual or interaction defect was found in this pass. Text remained readable, content stayed within the viewport, and the mobile cards and resource grid retained their hierarchy. Course, SAT, and ACT entry points are distinct; the course card clearly limits its scope to four topics rather than claiming the whole Grade 8 curriculum.

The main call to action is keyboard-operable and lands at `#modules`. Module destinations are `courses.html`, `practice.html?test=SAT#practice`, and `practice.html?test=ACT#practice`. Resource destinations cover SAT Learn, test-prep booklets, Review, Progress, and Study tips. This lane reviewed their labels/destinations and visual presentation; the coordinator separately checked destination application behavior. Screenshots are in `.scratch/cold-experience/final/` and `final-home/`.

### Final artifact identities

SHA-256 values bind this verification to the actual reviewed files. Built `index.html`, `courses.html`, and `app/course-render.js` match their source counterparts listed below.

| File | SHA-256 |
| --- | --- |
| `src/index.html` | `3e19a325e0fbc2fd82ab7217d32d8eee8167d4c211878a3552e7bf81bc873dd4` |
| `src/styles/home.css` | `ed83bf7e0b263429744b340f078d03857c6b015d0b8d69c495e2673195437e60` |
| `src/app/home.js` | `6e4815afee6c8c4210af0bd29605701a0a7128b9b4e888edfe25587d658f9077` |
| `src/courses.html` | `d8bad886611bc3a1947176fa57459cdb12c117eacd3d2bb7e7a8efc9f7f11acc` |
| `src/app/courses.js` | `bc8ced52538ad0f3df0f26a4d64e1bb92cf214ec6be26f78a5e4695e6bcbd71b` |
| `src/app/course-render.js` | `173976d1622170554248127bf1bdc1e8e67f5af978a43bf55c4638e6ce5eb3b0` |
| `src/styles/courses.css` | `9b8a4e0c80503cd2b7e56f0c39d56ef5a0466f0d9aa2108eda10929d825f3f77` |
| `dist/content/courses.js` | `ba98d92218dffe00f2dd3fa2c61bef1f9c5c0e2ebade61d2e352ceffc8f3e280` |

Final PDF files, all under `.scratch/print/`:

| File | Pages | SHA-256 |
| --- | ---: | --- |
| `reviewed-topic-1-practice/student-worksheets.pdf` | 40 | `4033c373ac325ef64ff4b1e29f6bc88519bdcfcef530e74b10cee932fa7269f4` |
| `reviewed-topic-1-practice/original-study-guide.pdf` | 14 | `78ba3bd90e48f30f8f1862598c4661232fac10000ab3357703bd37fee972714e` |
| `reviewed-topic-1-practice/worked-answers.pdf` | 56 | `c8e2c82716a8db12a2a9551edc2f249138036897926cec1088c025ea54722bf9` |
| `reviewed-volume-study-guide/student-worksheets.pdf` | 12 | `6285e1dd080c45f4c0be674de6cdc418ed40ca16fe72f5202052fc437c8d3eb7` |
| `reviewed-volume-study-guide/original-study-guide.pdf` | 57 | `e1edf9601790100986657c672cba2df1d2e7cb02af994a53608addda298bd327` |
| `reviewed-volume-study-guide/worked-answers.pdf` | 18 | `ccc127d2f0f5379ce310c24db9a669b6ff4e9bd6a022b9e0a65e4c3f333920cc` |


Final browser and PDF evidence: `.scratch/cold-experience/final/result.json`, `final/source-hashes.json`, `final-home/result.json`, and `final-pdfs/summary.json`. This lane used its own ephemeral servers, ChromeDriver instances, and Chromium profiles; all owned processes were stopped. No production edits, builds, commits, physical-printer testing, or full mathematical re-review were performed by this verification lane.
