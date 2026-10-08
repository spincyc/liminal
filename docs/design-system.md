# Liminal design system

Liminal uses a restrained editorial style: warm paper, green ink, serif reading
titles, system sans-serif controls, thin rules and generous text spacing. The
content is the main event. The small shared wordmark is the only screen brand
header. Aesthetic direction alone is insufficient: the contracts below define
which controls each page needs, where they belong, and how they behave.

This is a **design system**, with **design tokens**, a **component and pattern
library**, and **page template contracts**. The terminology follows the
[GOV.UK distinction between styles, components and patterns](https://design-system.service.gov.uk/)
and [Atomic Design's templates and concrete pages](https://atomicdesign.bradfrost.com/chapter-2/).
These sources inform the structure; Liminal retains its own palette and native,
dependency-free implementation.

## Shared foundations

- `src/styles/tokens.css` owns palette, typography, spacing fundamentals, target
  size, focus treatment and print colors. Do not invent section-specific copies.
- `tools/lib/site-header.js` and `styles/brand.css` own the single compact header.
  Courses, Readings, AP prep and SAT/ACT remain visible at phone width. Contextual
  links retain the selected grade/course where that destination supports it.
- `styles/reader-controls.css` owns compact selectors, sequence controls and
  document actions. Load after section styles. `app/reader-controls.js` renders
  shared navigation and action groups; pure modules supply destinations.
- Screen controls use system sans-serif; sustained reading uses the serif face.
  Screen colors follow light/dark preferences. Printed content is black on white.
- Keep interactive targets at least 44 CSS pixels tall; compact means reducing
  unnecessary width, padding and competing panels. This exceeds the base size
  in [WCAG 2.2's target-size criterion](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
  Preserve visible focus, native labels, keyboard operation and text zoom.

## Page inventory and contracts

| Template | Concrete pages/states | Required arrangement |
| --- | --- | --- |
| Library | `index.html`, daily Browse, Learn index | Small page title, brief purpose, grouped destinations or search, browsable results. Secondary explanation is a disclosure. No document pagination until a document is open. |
| Sequential reader | daily Read, weekly Learn/Read, selected classroom lessons | Compact selectors; sequence navigation and quiet document actions above content; title/metadata; readable body; sequence navigation below. |
| Plan browser | `curriculum.html`, `high-school.html`, AP course plans | Compact pathway/course selection; short scope statement; consistent expandable unit rows with week ranges; links into weekly work. Compare and Print are utilities. |
| Lesson and packet workspace | `lessons.html`, weekly Worksheets | Explicit selection scope; reader preview; student print/download near the preview's top. Answer keys remain a separate disclosure/document. Packet setup stays separate from the active lesson. |
| Assessment/check | reading-level check, AP student/key documents, SAT/ACT active test shell | Clear start, progress and completion; task-specific Next/Submit controls. Never introduce First/Last that could skip assessment state. Student and key routes remain distinguishable. |
| Practice and progress | `practice.html` setup, progress, review, study tips | Coherent test-prep navigation beneath the shared header; one primary task per region; optional setup and secondary explanation in disclosures. Active test uses its established assessment palette and tools. |
| Reference lesson | Learn lesson | Back-to-library/context links, bounded reading measure, in-page section navigation, examples and practice links. Topic documents have no artificial chronological order. |
| Printable document | daily HTML/TeX, SAT/ACT books, classroom/weekly/AP sheets | Shared Computer Modern typography and two-column worksheets; no screen navigation. Protect student/key separation and preserve complete text, math and figures. See print contracts below. |

Every new page or substantially changed state must choose one of these templates,
name any justified exception in its section documentation, and reuse its shared
parts. A page can have several templates across distinct states.

## Components and interaction patterns

### Compact selector row

Use `.reader-selectors` on a form or group with native, visibly labelled selects.
Numeric selectors use 4.25rem width (3.75rem at phone widths), rather than filling
the reading column. Named pathways/courses use `.reader-select-wide` on their
label: natural width capped at 18rem, wrapping into a full row on small screens.
At 400px and below, numeric labels sit above their controls so Grade/Week/Day
remain on one row. Long choices retain their complete accessible option text.
Changing a selector keeps focus on that selector and announces the new content.

For daily and weekly readers, put selectors, sequence navigation and document
actions in one persistent `.reader-toolbar`, in that order. It uses inline labels,
2.75rem numeric selects, and the same 16px type, unboxed surface, 44px targets and
hover treatment for every control. Let the groups wrap naturally on phones; keep
each numeric label beside its value. The wider, boxed selector variant above is
for forms and packet setup outside a reading toolbar.

### Sequence navigation

Use `LiminalReaderControls.navigation({ label, first, previous, next, last })`.
Each destination is `{ href, label }`, or `{ run, label }` for an in-page selection
whose state cannot be encoded in a link. The label gives the destination's
context; visible labels are always First, Previous, Next and Last. `null`
destinations render disabled, non-focusable text. Optional `index: { href, label }`
adds a return-to-index link where the surrounding template does not have one.

Render identical sequence scope above and below the document, with distinct
navigation landmark labels identifying top/bottom. Daily navigation stays in the
chosen grade's 180 nights; weekly navigation stays in the chosen course's 36
weeks; classroom navigation stays in the explicitly selected lesson set. Never
wrap the last item into another grade/course. A classroom selection containing
only one lesson keeps the lesson selector visible and omits its empty pagination.
Daily and weekly readers keep the top toolbar outside the changing document.
Pass its existing navigation node as the second argument to `navigation` so
active links retain identity. Top pagination preserves the invoked control's
focus and viewport position; bottom pagination returns to the complete top
strip and the corresponding control. If the control becomes unavailable at an
endpoint, `focusNavigation` selects an available direction without scrolling.
Selector changes preserve picker focus. Other document entry routes can focus
the heading with `preventScroll` while bringing the toolbar into view. Classroom
lesson pagination focuses its new heading. Do not make the bars sticky.

Keep the previous document mounted during an asynchronous transition, mark its
region busy, and disable its document actions until the current selection is
ready. A newer route supersedes the pending request. Announce loading without
inserting a status block that displaces an existing toolbar.

### Document actions

Use `.reader-actions` or `LiminalReaderControls.actions([{ label, run }])`.
Print and Download are native buttons styled as quiet text utilities. Links are
reserved for real destinations. The group is not an ARIA toolbar: ordinary Tab
navigation works, without an invented arrow-key interaction. `.reader-toolbar`
groups a reader’s location, sequence and actions; `.reader-bar` groups sequence
and actions where selection belongs in separate setup. Both wrap on phones.

Label the document when scope could be ambiguous: Print worked lesson, Print student
sheet, Download key. Do not promise a download the page cannot generate. Weekly
Learn prints explanations and complete worked examples; Read prints the supplied
texts. Worksheet downloads contain the selected student sheet. Generate exports from explicit student projections, never by
copying the live DOM after an answer disclosure has been opened.

### Plan rows and progressive disclosure

Unit summaries align a week-range column, flexible title, and trailing expansion
indicator. Keep week ranges together; let titles wrap. Course tabs remain useful
when there are a few named courses; large grade/pathway sets use compact selects.
Use disclosures for provenance, facilitator guidance, optional configuration and
long explanations. Primary navigation and the next required action stay visible.

Long indexes expose subject/section jumps near the top. Learn subject links focus
the destination heading and work as deep links. Progress links reach Plan,
Scores (SAT), Skill map, Pacing, History and Saved progress. Its skill map defaults
closed with total/practiced counts, including after a first answer; opening it
is explicit and the choice survives rerendering. The Skill map jump opens it.
Printing expands the map and its state explanation, then restores the screen.

## Print contracts

Daily readings use the bundled Computer Modern Unicode Serif, 10pt body text,
two columns and a centered title/author. Reading, Questions and the compact Source
note have distinct hierarchy and rules. Grade/week/day and Liminal appear only
in the small footer. Suppress “Read independently.” Retain helpful adult/shared
reading guidance. Time estimates belong in the endnotes/source area, including
the digital reader, rather than the title block. Full provenance remains in a
digital disclosure. Font data and license travel in offline HTML and TeX packets.
See [reading packets](reading-packets.md).

SAT/ACT books use the same Computer Modern family, with numbered problem
boundaries, stable question/choice gutters, clear shared-passage ranges and
deliberate response space. Keep a short problem together where possible; permit
long material to flow across pages without clipping. Student questions and answer
keys remain distinct. A multi-question passage is context for its labelled range,
not an unnumbered part of the following problem. See [booklet printing](booklet-printing.md).

Grade expansions, every weekly pathway, and AP student/key documents use the
same printed worksheet components in `styles/worksheet-print.css`. The type and
question layout follow SAT/ACT booklets: bundled Computer Modern Unicode Serif,
10pt body at 1.3 line height, Letter paper with .6in top, .55in side and .7in
bottom margins, two columns with a .38in gap and thin divider. Content fills the
left column before the right. A centered title and compact metadata precede
the problems; every numbered heading carries a black rule directly below it.
Use open response space, stable choice gutters, and small footers instead of
boxed question cards. Keys use the same numbered heading component.

`print.css` owns the four font faces shared with SAT/ACT. Worksheet pages load it
and the common print stylesheet after their section styles. The build embeds the
font bytes and full SIL OFL license; standalone HTML and CLI exports must carry
both and wait for fonts before measuring or printing. Reuse `worksheet-document`,
`worksheet-heading`, `worksheet-title`, `worksheet-meta`, `worksheet-columns`,
`worksheet-problem`, `worksheet-number`, and `worksheet-footer` alongside local
classes. Section CSS owns instructional structures and pagination, not a second
font or question-heading design.

Preserve required diagrams, tables, calculator directions, points, response
space, source and trademark notices, and explicit student/key projections.
Long material may continue across columns/pages; no clipping or fixed-height
containers may discard content. Measured combined packets must count their
actual printed pages and retain duplex separator backs. These layout contracts
also apply to worked guides and keys, without exposing solutions in a student
worksheet.

## Review and maintenance

Review concrete rendered states, not only isolated controls. For UI changes:

1. Cold-read a representative first, middle and last document; include the
   longest title/choice, a named course, an empty result and an opened disclosure.
2. Inspect at 1280px and 320px, light/dark, keyboard-only, and increased text size.
   Check horizontal overflow, focus order, labels, wrapped controls and readable
   text measure. Controls must remain discoverable before a long document.
3. Exercise route changes, back/forward, top and bottom pagination, and download
   after opening facilitator/key details. Inspect actual student output.
4. Render actual PDFs for print changes: a short reading/problem, long prose,
   verse/table or diagram, and a page boundary. Check embedded fonts, continuation,
   headings, answer space and footers. A print-media screenshot alone cannot
   verify pagination.
5. Run the repository's full gate. Static smoke checks enforce shared assets and
   script order; navigation unit tests cover sequence boundaries. Record the
   sampled browser/print states and any limits in the change review.

The first cold review found buried daily/weekly navigation, wide numeric selects,
hidden single-lesson controls and inconsistent plan rows. These concrete findings
set the contracts above. Independent review is evidence about sampled states, not
a claim of exhaustive accessibility conformance or user-tested learning outcomes.
