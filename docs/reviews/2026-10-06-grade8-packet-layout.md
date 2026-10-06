# Grade 8 combined packet: independent layout and browser review

Date: 2026-10-06. Reviewer: independent cold layout lane (`packet_cold_layout`).
Production code was read-only. No earlier review reports were read. This review
used the actual Courses controls and their static exported HTML, rather than
calling the packet renderer directly. It found no material layout, separation,
or export defect in the final sampled candidate.

The final pass includes the requested change to unruled response space and a
thin border enclosing each student question and its workspace. Earlier ruled
worksheet evidence is retained under the scratch `baseline/` directory and is
superseded by the final evidence below.

## Method and scope

- Served the coordinator's final `dist/` build through an owned local server;
  used an isolated Chromium/ChromeDriver 153.0.8010.52 profile.
- Built practice through **Try it yourself → Make practice**; used the actual
  **Print nightly packet** and **Download packet HTML** buttons. Opened downloaded
  HTML through `file://`, without the local site.
- Printed Letter PDFs at normal scale with CSS page size, backgrounds enabled,
  and browser headers/footers disabled. Audited page text independently of the
  renderer's `data-start-page` annotations, then inspected rasterized pages.
- Covered default Topic 1 practice, selected Night 2, all two nights, duplex,
  single-sided, one-page student/answer sections, odd and even guide/student/
  answer lengths, and dense graph/table examples including a six-column table.
- Checked desktop controls, 390 × 844 phone width, light/dark appearance,
  native Tab/Enter operation, visible focus, and regeneration after selecting
  Night 2, all nights, and answer preview.

This is sampled browser/layout verification, not a mathematical review, human
editorial approval, a physical-printer test, or cross-browser certification.
Duplex conclusions apply to the PDF page order when printed one page per side,
with all pages retained and long-edge binding as the interface instructs.

## Final PDF evidence

Course revision: `a27dbb38c5bd2215`. All page numbers below are physical PDF
pages, starting at 1. `G/S/A` means guide/student worksheets/worked answers.

| Artifact | Replay settings | Pages | Section starts and separator backs |
| --- | --- | ---: | --- |
| `default-duplex.pdf` | Topic 1, 8 questions, 1 night, seed `cold-default` | 18 | Night 1 G/S/A: **1/15/17**; separator **14** |
| `default-offline.pdf` | Actual HTML download of the same default packet | 18 | Same boundaries and text as the print-button PDF |
| `small-all-duplex.pdf` | Lesson 1-1, 1 question, 2 nights, seed `cold-small` | 11 | Night 1 **1/3/5**; Night 2 **7/9/11**; separators **4/6/10** |
| `wide-night2-duplex.pdf` | Lessons 2-8, 3-2, 4-3, 4-6; 8 questions/night; 2 nights; seed `cold-wide-final`; Night 2 only | 23 | Night 2 **1/11/17**; separator **16** |
| `wide-all-duplex.pdf` | Same dense packet; all nights | 47 | Night 1 **1/11/17**; Night 2 **25/35/41**; separators **16/24/40** |
| `wide-all-single.pdf` | Actual HTML download of the same dense packet, single-sided | 44 | Night 1 **1/11/16**; Night 2 **23/33/38**; no separators |
| `phone-keyboard-single.pdf` | Lesson 1-1, 1 question, 1 night, seed `cold-regen`; phone keyboard activation | 4 | Night 1 **1/3/4**; no separators |

Every duplex component begins on an odd PDF page. The small case proves that
an odd answer section receives its own separator before the next night's guide;
the dense case proves the same boundary after a seven-page answer section.
Single-sided output starts every component on a new page and removes exactly
the otherwise required separator backs.

The default form is `COURSE-a27dbb38-7IWFKX`. Dense Night 1 and Night 2 forms are
`COURSE-a27dbb38-1EP0P2G` and `COURSE-a27dbb38-1WPOP1F`. The selected Night 2 copy
keeps the Night 2 form and label. Every guide, student, and answer page within
each night carries that night's matching form.

## Layout and interaction results

- Final student pages have no `.course-work-line` nodes. Every sampled student
  question has an empty workspace node and a visible thin enclosing border.
  Ordinary questions retain substantial blank writing space. Graph questions
  retain space below their graph; the full-width six-column prediction/error
  table and graph retain a large blank area within their enclosing box.
- Authored incomplete tables, coordinate grids, and graph givens remain visible.
  These are mathematical task content. The extra ruled handwriting lines are
  absent in PDF, static HTML, and the phone preview.
- Inspected the final default worksheet pages 15–16; dense guide examples and
  student pages 11–15, including the six-column table on page 12; and worked
  answer examples. No clipped table, graph, exponent, radical, fraction, or
  question box was observed. Every word in all seven final PDFs stayed within
  the audited Letter print box. This geometric text check supplements, rather
  than replaces, the visual samples.
- Student sections contain no answer blocks, worked-example solutions, or key
  containers. Extracted student PDF pages contain no `Answer:` or `Worked
  example` text. Downloaded combined packets intentionally contain separate
  guides and answer sections. The interface explicitly tells the adult to set
  the answer sheets aside.
- Default guide lesson IDs exactly match the lessons used by its eight displayed
  questions: 1-1, 1-3, 1-4, 1-7, 1-8, 1-9, 1-10, 1-11. The guide does not include
  the three selected Topic 1 lessons absent from that night's questions.
- Downloaded HTML includes no scripts, external stylesheet links, or external
  images. It opens offline and reproduces the print-button PDF's page text and
  section boundaries. The single-sided download also prints correctly offline.
- Phone controls remain within 390 px with no page-level horizontal overflow,
  in both light and dark appearances. The student preview stays ink-on-white;
  the new question enclosure and empty workspace remain usable.
- Tab reaches the print-layout select and print button with a visible 3 px
  focus outline. Native select keys update the layout/help text; Enter on the
  print button opens the complete packet. The final phone keyboard export
  produces the expected four-page single-sided PDF.
- Changing lesson selection hides the stale packet and disables combined export
  buttons. Rebuilding from Night 2/all nights/answer preview into a one-night
  packet resets preview to Night 1, scope to current, and answer preview to off;
  the all-nights choice is disabled. The user's single-sided preference remains.
  No browser console errors were logged during the final UI pass.

A low-impact existing copy issue remains for a one-question packet: the summary
and replay metadata say `1 questions`. It does not affect identity, selection,
printing, or the requested layout and was not treated as a blocker.

## Source binding and artifacts

The reviewed source files below exactly matched their shipped `dist/` copies
where applicable. The source manifest and generator hashes identify the final
course revision used to create the evidence.

| File | SHA-256 |
| --- | --- |
| `src/app/course-render.js` | `3330e46a1f76303bbd00f2f9dc304050b0a03ec40036e4fa823847e871f32f8a` |
| `src/styles/courses.css` | `10a4024a8ea290423991a1345fbc0c57b75a584fe9b560127fa758dd1f36c8cd` |
| `src/app/courses.js` | `276e556ae093654e166579d5040d7604bf6d3147b8d4f2bd87319ecd791bcfcc` |
| `src/courses.html` | `aacd5c9087714091143eec33700ef422067887d6b921ebd9260be475ec7bd220` |
| `src/lib/courses/engine.js` | `cc93715563b62bf124b168033b80eef8a39d9a8da10198ae7aee5ad241e828e6` |
| `content/courses/grade-8-math.json` | `3c61ae58c92195a664d50592853ff8f5dda5bb60dd6cec3ea97fe53013cc280d` |
| `src/lib/courses/grade8-topic1.js` | `918162ffd3e76b23cc04e93f7a5db09cd4da1caaec3bff7c25da8cecbf67259c` |
| `src/lib/courses/grade8-topic2.js` | `739bc8e765f3c329ad80b7476b0272cd1398072d4364838087f8ae6af627d43c` |
| `src/lib/courses/grade8-topic3.js` | `289f4a960eb99e4ece515f8291c46a28f05e2e7ee40c9325894d8efd6def45a2` |
| `src/lib/courses/grade8-topic4.js` | `ffe59902720f53acef07da9faff418048cc554bf4db90584b289d7d77592c42d` |
| `dist/content/courses.js` | `4c2bec69458c86a4858c2901c7320340804ef64a2dccc45ab3693fd50322f83f` |

Final PDFs, downloaded HTML, raster samples, and phone screenshots are retained
in `.scratch/packet-cold-layout/`. Useful visual samples are
`default-duplex-p15.png`, `wide-all-duplex-p11.png`,
`wide-all-duplex-p12.png`, `wide-all-duplex-p13.png`,
`phone-dark-controls.png`, and `phone-dark-blank-preview.png`.
`pdf-section-audit.json`, `final-form-audit.json`,
`final-workspace-audit.json`, `final-regeneration.json`, and
`artifact-sha256.txt` record the detailed evidence. These scratch artifacts
are intentionally uncommitted and remain subject to workspace cleanup.

Only this report was written outside the review's exclusive scratch directory.
No production files, shared build, commits, or pushes were performed by this
reviewer. The owned browser, driver, and server were stopped after review.
