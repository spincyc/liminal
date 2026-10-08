# UI patterns and print review — 2026-10-08

This follow-up starts with daily reading and applies the same design-system
method to coherent sections of Liminal. It follows the earlier shared-header
and test-prep visual cleanup. No question banks, literary selections, grading
rules or progress-storage formats changed.

## Cold-review findings and disposition

| Finding | Change |
| --- | --- |
| Daily reading actions were around 5,640px down a 320px screen; navigation existed only at the bottom. | First/Previous/Next/Last now appear above and below the text, with Print/Download at the top. |
| Daily Grade was 219px wide; weekly/curriculum pathway controls stretched over 600px. | Shared bounded selectors retain 44px interaction height. Daily numeric controls are 68px on desktop and 60px on phones. |
| Weekly work lacked sequence endpoints and repeated heavy control/passage panels. | Shared navigation and quiet utilities; compact tabs and an uncluttered reading surface. Student/key exports remain separate. |
| A single classroom lesson hid its selector; exports were below the guide. | Selector remains visible; multiple selected lessons get sequence controls at both ends; document actions move above the guide. |
| Plan pages varied in disclosure geometry and wrapped short week ranges. | Consistent range/title/indicator rows; short utility controls. Named course tabs remain where their small choice set is useful. |
| Learn subjects were buried in a long index. | Subject jump links and linked subject breadcrumbs, with heading focus. |
| Unstarted skills made Progress exceed 13,000px on phones. | Section links, a collapsed skill map with practiced counts, and remembered disclosure state. |
| Printed time/mode metadata distracted from the reading. | Time estimates move to endnotes/source; independent-reading label is screen-only. Adult/shared guidance remains useful on paper. |
| SAT/ACT problems lacked clear boundaries, and ACT English exposed source annotation markers. | Numbered rules, aligned choices, shared-passage ranges, Computer Modern text and actual underline/point-marker rendering. |

The [design system](../design-system.md) names the page families and records
specific component, interaction, responsive and print contracts. Repository
contributor guidance points to it; static smoke checks require shared assets and
their load order. This is a maintained implementation contract, not a new UI
framework.

## Verification scope

Separate agents cold-reviewed baseline screens, implemented bounded sections,
and reviewed the integrated result. Browser sampling covered all eleven page
entries, including daily Browse/Read, weekly math/reading/AP, classroom lesson
selection, curriculum/high-school/AP plans, reading-level flow, Learn, practice,
Progress and Review. Checks used 1280px and 320px, keyboard navigation, focus
retention, light/dark themes and selected print/export paths. The unchanged
active SAT/ACT shell retains the interaction checks from the earlier review.

Daily tests exercise every sequence position for every supported grade/advanced
key, week transitions, invalid input, student projection safety and printed
metadata. Browser checks exercised both pagination rows, native select focus,
and offline download after opening facilitator notes. Actual Chromium PDFs
covered kindergarten verse (one page), independent Grade 8 prose (two pages),
Grade 6 tabular text (two pages), and the disconnected HTML download. Fonts were
embedded Computer Modern; no screen controls or independent-reading label
appeared. XeLaTeX aloud/independent samples preserved 38 text blocks and six
questions with clear footers and source-note timing.

Weekly and classroom checks covered selection endpoints, named courses,
student/key separation, and print-state restoration. The reading-level sample
completed the check, result and plan flow. Learn checks included subject deep
links and lesson breadcrumbs. Progress checks included empty SAT/ACT states and
a one-answer fixture so the early-use case stays compact after activity begins.

Booklet-specific PDF, TeX and long-content checks are recorded in
[booklet printing](../booklet-printing.md). The release gate is
`node tools/check-all.js` (the implementation of `npm run check`), followed by
`git diff --check`. The final gate passed all 873 tests, content validators,
build and static smoke checks. The existing Progress failed-clear/retry test
retains its assertions; its DOM fixture now supports the native disclosure
operations and matches the real heading/select elements.

Independent follow-up found and closed two integration issues: classroom selects
inherited a custom appearance after their arrow image was reset, and the Lesson
selector's accessible name differed from its visible label. Shared selectors now
explicitly use native appearance and the visible label supplies the name. Final
sampled screen review had no remaining significant findings. The print reviewer
also confirmed the repaired ACT English annotations and all 98/171 question
headings in the full SAT/ACT browser PDFs.

This is sampled visual and interaction verification, not exhaustive accessibility
certification or an editorial re-review of the educational corpus. Print engines
can choose different page breaks. TeX's existing accessible diagram descriptions
remain distinct from the browser's rendered diagrams.
