# Graphic design implementation and cold review — 2026-10-07

This follows the [initial cold review](2026-10-07-graphic-design.md) and the
owner's instruction to proceed, with particular attention to black-and-white
printing and direct, demanding instruction. The source baseline was
`27922a075d950f4b9c47d0d563ee61fae1d5f0f3`; the initial review was recorded in
`6641e79`. This report describes local implementation, not a deployment.

## Design decisions

The main line is **Learn well. Make room for life.** The About text connects
Liminal to growing up as a time of becoming, and focused study to time for
students and families beyond school. This expresses an aim; it does not claim
measured time savings or promise effortless mastery.

The entrance now leads with subjects, with mathematics and its four available
topics linked directly to lessons. Grade 8 remains visible as curriculum
alignment. SAT/ACT preparation and its progress/review tools have their own
clearly named sections. No unavailable grade or subject is presented as a
working course. The current inventory remains 36 lessons across four Grade 8
topics, alongside test preparation.

At the initial rollout, Home, Courses, Practice, Learn, Print, Progress, and Review shared cream and
green colors, the arch mark, serif headings, restrained controls, and readable
functional text. The test-prep treatment was subsequently revised in the
follow-up below. The assessment shell retains its distinct test interface.
The phone homepage omits the large decorative illustration and reduces the
framing before course selection. The course reader offers immediate lesson
practice; packet quantities and replay controls remain available in disclosures.
Dark lesson graphs now use the page's contrasting ink and grid colors.

The instructional standard is observable: write the steps, align calculations,
label diagrams, check the result, and correct errors. There are no age-themed
mascots or separate childish and adult visual systems. Younger material should
change the amount and complexity of the task while retaining the same care
in presentation. Neat work is a means of making reasoning legible, not an
assessment of a student's worth or an insistence on one handwriting style.

## Original written-work models

Two original SVG pages model long division and solving an equation. The
handwriting is drawn as vector paths; annotations are typed. The work is
embedded in lessons 1-1 and 2-1 and in their printable guides. The equation
also appears on the homepage. These are complete worked examples, with
specific prompts and solutions, rather than decorative imitation worksheets.

The manifest keeps content, course binding, and transcripts separate from
presentation. The build rejects invalid lesson references and SVG features
that would be lost in sanitization. Drawings, captions, and transcripts enter
the course revision. Downloads embed the SVG, so printed guides work offline.
Student-only worksheets contain no models, hidden solutions, or active scripts.

An independent reviewer solved both problems before comparing the work:

- `7/12 = 0.58[3]`: remainders 10, 4, and 4; only the 3 repeats. The visible
  subtraction, bring-down arrows, columns, and recurring bar agree.
- `3x + 6 = 21`: subtract 6 on both sides, divide by 3, obtain `x = 5`, and
  check `3(5) + 6 = 21`. Visible work and transcript agree.

## Cold-review corrections

Two independent review lanes inspected the integrated design and sample
content. Neither reviewer authored those changes. They found:

1. Review tabs overlapped at 320px, including clipped counts. The narrow layout
   now puts labels above counts in equal-width targets.
2. Written-page annotations shrank too far on phones. Interactive lessons now
   offer a full-size original and an expandable typed transcript while keeping
   the complete drawing visible as an overview.

Further populated-screen checks found narrow Progress collisions in score
controls, skill accuracy, pacing, and session history. These layouts were
adjusted using real rendered fixture records, including 240 attempts, eight
sessions, and three-digit Review counts.

## Black-and-white printing

Course documents use black text, borders, and graph strokes on white paper.
Blank workspaces remain unruled. SAT/ACT booklets use dark table rules and
answer bubbles; pale SVG grid strokes are strengthened, with data series still
distinguished by line and marker shape. Learn examples retain visible outlines
when background graphics are disabled. The course PDF CLI now explicitly uses
`printBackground: false`.

The booklet review repaired a title-only answer-key cover. Standalone keys use
four labeled columns without reducing the existing 8.4pt answer type. The
sample full SAT key includes all 98 answers on its first page; the full ACT
with Science key includes all 171. Explanation content is preserved.

PDF review also found orphan end labels and heading-only starts in ACT Reading
and Science. Print omits the redundant end labels. Shared ACT passage context
can flow across columns while each question stem stays with its choices, and
section headings stay with the following content. The sampled ACT test dropped
from 32 to 28 pages with the same passage/question text in the same order. Its
English, Reading, and Science starts now contain substantive work. The sampled
SAT test remains 26 pages. A regression test checks the question/context grouping
for all three ACT passage sections.

Chromium 153 generated actual Letter PDFs with background graphics disabled,
then `pdftoppm -gray` rendered representative pages for visual inspection:

- Two-lesson guide: seven pages, including both written-work models, fractions,
  repeating bars, readiness tasks, and typed reasoning.
- Lesson 2-1 student worksheet B: eight questions across four pages, with clear
  borders, instructions, and blank working areas.
- Lesson 2-9 graph worksheets and matching key: six and five pages, with
  readable coordinate labels, intact grids, and answer-only plots in the key.
- Two-night combined packet for lessons 1-1 and 2-1: 24 duplex-layout pages.
  Actual PDF components start on pages 1/9/11 and 13/21/23, matching the measured
  page plan. Every component starts on a fresh physical sheet. The same packet
  has 21 pages without separator backs in single-sided layout.
- Full SAT and ACT-with-Science question booklets, matching standalone keys,
  and a seven-page Learn lesson on linear equations. Grayscale inspection
  covered key covers, mathematical notation, diagrams, tables, and answer sheets.

## Verification and limits

The browser checks cover real Worker-based practice generation, direct lesson
links, worksheet switching, answer concealment after switching, actual HTML
downloads, and static offline printing. Design review covered 1440px desktop,
768px tablet, 320/390px phones, and light/dark modes across the main pages.
The independent sample lane also checked course-revision changes and rejection
of unknown lesson bindings. The repository-wide `node tools/check-all.js`
validation, build, static smoke tests, and test suite passed; npm was not
installed, so the underlying Node entry point was used.

This is browser/PDF verification, not a physical-printer trial or a classroom
study. Toner quality and printer settings still affect output. There are only
two authored written-work models; the broader corpus needs additional reviewed
examples across subjects and ages. No claim is made that these changes have
measured effects on handwriting, mastery, or study time. The useful next review
is observation of students and parents using the material, including readers
who use enlarged text or assistive technology.

## Follow-up: retain the test-prep finish

After deployment, the owner found that the visual unification reduced the
polish of test prep. Comparison with `27922a0` showed that the combined changes
to color, heading type, card depth, control shape, and onboarding grouping had
flattened the working interface. Sharing a brand does not require every task
to use the same surface treatment.

`styles/test-prep.css` now applies only to the three test-prep entry pages,
identified by `data-area="test-prep"`: Practice (including Progress, Review,
and Tips), Learn, and Booklets. It restores neutral surfaces, blue actions,
bold sans-serif headings, rounded controls, subtle card shadows, and distinct
onboarding steps. The arch and serif wordmark remain shared with the warm
library and course pages; their brand colors are independent of action colors.
The distinction follows the task, not the student's age.

The stylesheet is scoped to screen media and the outer application. It retains
the assessment shell's fixed light interface, the larger Learn reading measure
and line spacing, 44px targets, seven-link phone navigation, stacked Review
counts, and responsive Progress tables. No content, scoring, navigation logic,
or generated booklet styles change.

Browser verification covered 320, 390, 768, and 1440px in light and dark modes.
Populated screens used 240 generated attempts, eight sessions, and 130
Due/Missed/Marked counts; their controls and table values did not clip or cause
page overflow. A live practice session retained its original colors and
controls, including saving, reloading, and resuming. Printing the same Learn
lesson with backgrounds disabled produced seven pages whose extracted text
and layout exactly matched the previous print proof. The full repository
gate and an independent design review were repeated for this refinement.

## Follow-up: complete the identity across pages and exports

The original doorway and serif wordmark now also appear on year plans, the
homepage footer, the active test and break screens, and printable course
guides, worksheets, worked keys, and duplex separator backs. The favicon uses
the doorway in place of the older blue letter. `styles/brand.css` keeps static
page headers consistent and retains a black-ink header on Learn printouts.
Progress, Review, and Tips inherit the Practice header. Test-prep surfaces and
controls retain their separate treatment described above.

Downloaded SAT/ACT booklets and answer keys embed the monochrome doorway and
wordmark, without an external image or background-printing requirement. The
optional ACT LaTeX export draws the doorway using standard picture primitives.
Course exports likewise embed the SVG; their compact brand and document label
share a row so the label remains near the material it identifies. The test
shell's identity is noninteractive: its existing Exit control continues to
govern saving or discarding a session.

The targeted booklet, shell recovery, and packet CLI suite passed 82 tests.
Booklet figure checks distinguish instructional figures from the decorative
brand SVG while retaining their sanitizer assertions. A sample LaTeX booklet
compiled with the installed `pdflatex`, and its cover was visually inspected.
These checks alone do not establish browser layout or duplex pagination;
those require browser and PDF review after integration.
