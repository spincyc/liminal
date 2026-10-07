# Brand browser and print review — 2026-10-07

An independent agent reviewed the restored doorway mark and Liminal wordmark
in Chromium 153, including real PDF output. This review found no blocking
branding, overlap, or pagination defect in the sampled surfaces. It does not
establish identical behavior in every browser or printer.

## Browser checks

- Home, year plans, courses, practice, Learn, and booklet setup each show the
  doorway and wordmark at 320px and 1280px. None had horizontal document
  overflow. The home footer retains the same identity.
- At 320px, active test, question review, results, and timed break views retain
  the identity without overlapping the title, timer, exit, or navigation.
  Calculator, reference, exit, and primary navigation targets remain at least
  44px tall. The existing compact Directions and timer Hide controls measure
  28px and 26px tall; the branding change does not resize those controls.
- Completing one original sample question reached the results screen. The
  break screen retained its resume control. These checks exercise shell
  presentation; they are not a new assessment-content review.

## Printed artifacts

Chromium generated Letter PDFs with background graphics disabled and browser
headers and footers disabled. Rendered pages were visually inspected.

| Artifact | Result |
| --- | --- |
| Learn: Equivalent expressions | Black doorway and wordmark print above the lesson; navigation is absent and lesson content remains readable. |
| Full SAT booklet and separate key | Branded covers; all 98 key entries fit on the key's first page with its form code. |
| Full ACT booklet with Science and separate key | Branded covers; all 171 key entries fit on the key's first page. |
| Course student worksheets and worked answers | Branded page headers; student export contains no solution elements, serialized answer model, or scripts. |
| Two-night course duplex packet | Actual 50-page PDF matches the measured plan. Guide, worksheet, and answer sections begin on pages 1, 9, 19, 27, 35, and 45. Labeled separator backs occupy pages 8, 26, and 34. All 50 pages retain the identity. |
| LaTeX booklet sample | Installed pdfLaTeX compiled an original one-question sample successfully. The rendered first page contains the doorway and wordmark. |

The course sample used Grade 8 lessons 1-1 and 1-2, 20 problems per worksheet,
two nights, Rebuild mode, and worksheet choices A then B. Its standalone
student document was generated from the stripped student model; the combined
packet deliberately includes separate worked-answer sections.

The browser scripts, measurements, screenshots, PDFs, rasterized pages, and
PDF-text checks were retained as transient evidence in the review lane's
scratch directory. No source or content implementation was changed by this
review. Build and full-repository checks belong to the coordinating lane.
