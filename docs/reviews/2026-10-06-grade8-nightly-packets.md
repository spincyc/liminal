# Nightly packets and fresh cold review — 2026-10-06

The web interface now combines each night's study guide, student worksheets,
and worked answers into one printable document. This follows the user's request
for a single print job whose parts can be separated without one section starting
on the reverse of another section's last sheet.

## Resulting behavior

After generating practice, choose **Night to preview**, then **Print nightly
packet**. The scope defaults to that night; **Nights to include** can select all
generated nights. An all-night document orders Night 1 guide/worksheets/answers,
then Night 2 guide/worksheets/answers, and so on. Guides cover the lessons found
in the actual questions for that night, deduplicated in course order. Repeated
review lessons can reuse the same instruction while exercises stay distinct
within the generated packet.

Double-sided layout is the default. The renderer measures actual typeset pages,
including study-guide blocks, then inserts labeled separator backs after odd
length components when another component follows. Every component starts on an
odd document page. This works across night boundaries and does not depend on a
browser interpreting `break-before: right`. There is no trailing separator after
the last answer page. A single-sided option omits separator backs while retaining
new-page component boundaries.

The print view and downloaded HTML are complete static documents, with the same
page plan. Separate student-only, answer-only, and guide exports remain available.
Combined documents deliberately contain worked answers; the interface tells the
parent to set those sheets aside. Student sections contain only their intended
questions, givens, and writing space.

At the user's request, student response areas are open blank space rather than
ruled lines. A thin border encloses each problem and its workspace, including
full-width table questions. Graph grids and mathematical tables remain when
needed by the task. Existing space hints still reserve room for calculations,
drawings, or prose; removing the ruling does not collapse the workspace.

Print the entire document on Letter paper at 100% scale, one page per side, with
browser headers/footers disabled. For double-sided packets, select long-edge
duplex printing and keep the separator backs. The website controls document
pagination, not the printer driver. Printing selected PDF pages, changing scale
or paper size, or using multiple pages per side can defeat the planned sheet
boundaries.

`tools/course-packet.js --combined` exports the same layout as an additional
`nightly-packet.html` and, with `--pdf`, PDF. `--single-sided` with `--combined`
selects the compact single-sided layout. The manifest records the print mode.

## Cold review and repairs

Two fresh reviewers received self-contained briefs without the previous review
conclusions. The [teaching review](2026-10-06-grade8-packet-teaching.md) inspected
all 36 guides, student samples from all 85 designs, and practice across nights.
The [layout review](2026-10-06-grade8-packet-layout.md) used the actual new web
controls, downloaded documents, and Chromium PDFs.

The content review identified predictable answers in several designs and gaps
between two guides and their corresponding practice. Bounded repairs vary plan
assignments and comparisons, linear versus nonlinear model assignments,
square/cube classification multiplicities, and percentage denominators and
conditions. Squared-variable equations now exercise the positive, zero, negative,
and isolation cases already taught. The model-fit key also received a wording
clarification. The teaching report records renewed independent solutions and
source hashes; these checks do not constitute human educator approval.

## Verification

Final course revision: **`a27dbb38c5bd2215`**. Full repository gate
`node tools/check-all.js` passed, including syntax, content, fresh build, static
navigation checks, and **700 tests with zero failures**. The generator author
also passed 255,000 draws across 85 designs and eighteen 200-question packets
across the six affected lessons. Independent teaching review accepted all 34
fresh repair samples after recording solutions before key access.

The pure print-plan tests verify 300 two-night plans with varied component
lengths: no physical sheet has two component owners, and single-sided plans
have no padding. They also cover actual-question lesson scope, invalid section
data, mixed odd/even lengths, and omission of a final separator. The CLI tests
cover combined artifact manifests and print-mode flags.

Real Chromium checks through the web controls covered the default packet,
selected Night 2, all nights, odd student and answer lengths, dense graphs and
tables, and single-sided layout. The final dense case includes the six-column
model-error table: 47 duplex pages versus 44 single-sided pages, with component
starts at 1/11/17 and 25/35/41. A two-night one-question case has starts
1/3/5 and 7/9/11. Downloaded HTML prints offline without scripts or linked
assets. Final student sections have empty workspace nodes and no ruled-line
nodes; raster inspection confirms thin complete borders and no clipping.
Phone/dark/keyboard use and resetting controls after regeneration also passed.
The independent layout report records exact cases and sampling limits.

The renderer's all-lesson stress PDF contains all 36 guides and 36 questions:
105 pages, with guide/student/answer starts at 1/73/89. Paired illustrations
are laid out side by side to keep complete worked examples legible inside
Letter pages. Oversized indivisible future guide content fails with a clear
error instead of silently changing page parity.

Root independently exported the same two-night, eight-question Topic 1 packet
in both modes (`home-nightly-2026-10-06`). Actual PDF text extraction matched
the component page plan; no student/answer physical sheet was shared. Separate
student artifacts contained 16 blank workspace nodes, zero ruling nodes, and
zero answer nodes. Combined artifacts contained no active elements.

| Artifact under `.scratch/print/` | Pages | Component starts | PDF SHA-256 |
| --- | ---: | --- | --- |
| `nightly-home-packets/nightly-packet.pdf` | 35 | 1/15/17; 19/31/33 | `e055aef067717b43a0703ff9de6b19b4433aaa364de1083aa2e88abce3545f94` |
| `nightly-home-single-sided/nightly-packet.pdf` | 34 | 1/14/16; 18/30/32 | `65cb96ddef430b1d99378a6caadc1333dede082ca08ecf9b0353b4dcdc78f1ef` |

The double-sided sample has one separator back, page 14. Both directories
include static HTML, separate component documents, and replay manifests.
Root evidence is in `.scratch/nightly-integration/`, each artifact directory's
`nightly-verification.json`, and `.scratch/nightly-check-all.log`. Author and
reviewer evidence remains in their separately named scratch directories.

Final presentation/planning SHA-256 bindings:

| Source | SHA-256 |
| --- | --- |
| `src/app/course-render.js` | `3330e46a1f76303bbd00f2f9dc304050b0a03ec40036e4fa823847e871f32f8a` |
| `src/styles/courses.css` | `10a4024a8ea290423991a1345fbc0c57b75a584fe9b560127fa758dd1f36c8cd` |
| `src/lib/courses/engine.js` | `cc93715563b62bf124b168033b80eef8a39d9a8da10198ae7aee5ad241e828e6` |
| `src/app/courses.js` | `276e556ae093654e166579d5040d7604bf6d3147b8d4f2bd87319ecd791bcfcc` |
| `src/courses.html` | `aacd5c9087714091143eec33700ef422067887d6b921ebd9260be475ec7bd220` |

## Boundaries

This work retains the supplied four-topic volume, original content, 36 guides,
72 worked examples, and 85 parameterized designs. Question variants are not
85 new designs every night. Exact and canonical mathematical identities are
checked within a generated packet; different packets do not share exposure
history. This remains practice material, not an uncued assessment system or
empirically calibrated curriculum.

PDFs and screenshots are browser evidence, not physical-printer tests. Local
print artifacts under `.scratch/` should be saved elsewhere before workspace
cleanup. Nothing was physically printed, pushed, or published.
