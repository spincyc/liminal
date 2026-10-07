# Weekly coursework print review — 2026-10-07

An independent agent exercised the weekly reader's actual Print and Download
controls in Chromium 153. After correction and retesting, no unresolved defect
was found in the sampled export and reader-print paths. This is a presentation
and export-integrity review, not mathematical or literary editorial approval.

## Samples and actual PDFs

Each sample used worksheet A and produced separate student and answer PDFs.
The downloaded standalone HTML was then reopened with browser networking
disabled, reloaded, and printed again. Online and offline PDF text matched.

| Course and week | Student pages | Key pages | Reader-print pages |
| --- | ---: | ---: | ---: |
| Common Core math 12, week 5: Arithmetic of rational expressions | 3 | 3 | — |
| Common Core reading 8, week 1: Rank evidence by what it establishes | 4 | 4 | 6 |
| Common Core reading K, week 1: A place for a story | 3 | 3 | 2 |
| Common Core reading 10, week 16: Commands, labels, and mistaken identity | 9 | 9 | 9 |

The final run generated 19 PDFs: eight through the export print windows,
eight from offline downloads, and three from the reader's native print path.
Letter output used background graphics off and browser headers/footers off.
First pages, question pages, long-passage continuations, passage endings,
credits, and final pages were inspected as rasterized PDFs.

## Findings and closure

The first math sample put attribution and its source link alone on a third
page in both student and answer exports. The author moved the export footer
inside the final exercise's existing unbreakable print unit. Retesting with a
fresh page load and browser cache disabled confirmed the last question now
stays with its full workspace or worked solution and the footer. The math
documents still use three pages; the third page is no longer footer-only.
No student workspace was reduced to obtain this result.

## Verified behavior

- Doorway mark, wordmark, course/week/worksheet identification, attribution,
  and source link survive standalone and offline printing. Rational fractions,
  exponents, and domain restrictions in the Grade 12 sample remain legible.
- Student exports contain six prompts and six blank, unruled work areas of
  at least 38mm each. They contain no solution elements, scripts, event-handler
  attributes, or external stylesheet dependencies. Answer exports contain
  the matching six solutions and their steps.
- Reading exports include every passage referenced by the selected worksheet,
  with its complete attribution. PDF text comparisons found the complete
  13,828-character Alice chapter, including its ending and credit; only
  whitespace introduced by PDF line wrapping was ignored.
- Reader printing was tested from Worksheets with its answer disclosure open,
  from Learn with an example-answer disclosure open, and from Read. Actual
  PDF generation fired the application's `beforeprint`/`afterprint` handlers.
  All five Grade 8 texts, both kindergarten texts, and all three Grade 10 texts
  printed. Selected tabs and panel visibility returned to their prior state.
  Worksheet keys and example solutions did not enter these reader PDFs.
- No wholly blank page, footer-only final page, or text outside the checked
  page edges remained in the final 19 PDFs. Long passages break across pages
  without losing text; student questions retain their blank working space.

The final reviewed renderer SHA-256 is
`beb9a03f6980100c0f0db4e2af149b09fdcca7b5e163c792d478d5562f88238a`.
The served renderer matched source before the final run. Scripts, full source
hashes, downloaded HTML, measurements, PDFs, extracted text, and before/after
images were retained as transient evidence in the review lane's scratch
directory. This lane changed no implementation or curriculum data.

These checks sample four courses and one worksheet per course. They do not
establish every week's pagination, physical-printer behavior, or compatibility
with browsers other than the tested Chromium. Native reader printing was
invoked through Chromium's PDF command rather than an operating-system print
dialog. Full repository checks belong to the coordinating lane.
