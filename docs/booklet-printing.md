# SAT and ACT booklet printing

The Booklets page (`src/print.html`, `src/app/print.js`) builds SAT forms from
templates and ACT forms from their existing banks. `src/lib/booklet.js` owns the
shared document structure, question grouping, print layout and TeX serialization.
Content selection, form codes, exposure history and answer keys are independent
of the presentation. The screen setup follows the [design system](design-system.md);
the exported document has no screen navigation.

## Layout

Booklets use letter paper, two columns, a thin column divider and 10pt Computer
Modern text. Every numbered heading has the same full-width black rule directly
below it, in student questions and answer explanations alike. The rule belongs to
the heading itself, so it stays with the label at a column or page boundary; do not
replace it with a flex decoration or a border on the surrounding entry. SAT passages,
tables and diagrams follow that problem's number. Choices share a stable letter
gutter, and mathematics questions include working space; numeric responses retain
their answer line.

ACT English, Reading and Science passages are shared context. A heading identifies
the exact consecutive question range before printing the passage once. The context
has a quiet left rule in HTML; each following question has its own numbered rule.
ACT English uses the practice renderer's annotation parser: marked text is
underlined, reference numbers are superscripts, and insertion points are boxed
numbers. Source brace notation never appears in the rendered passage.

Short HTML problems stay together where possible. Long passages and oversized
questions can continue into another column or page: do not add clipping, fixed
heights or an enclosing unbreakable box. TeX reserves room before starting a
question while allowing longer material to flow. Science table cells wrap within
the column. Browser HTML retains typeset mathematics and sanitized SVG figures.

SAT booklets retain their existing appended answer key, after the student material
and answer sheet; a separate key export is also available. ACT student booklets
contain no keyed answers or explanations and have a separate key document. These
distinctions must survive both opening and downloading an export.

## Fonts and exports

`src/styles/print.css` uses the same Computer Modern Unicode Serif files and four
faces as nightly readings. `tools/build.js` embeds their WOFF2 data using
`tools/lib/reading-fonts.js` and inserts the complete SIL OFL license from
`src/fonts/computer-modern/OFL.txt` into the setup page. The export controller
fetches the built stylesheet once and includes it and the license in every test
and key HTML file. Downloads therefore retain their fonts offline. A failed font
fetch leaves the form available for retry instead of exporting incomplete assets.

The ACT CLI uses the same font helper, license and print structure:

```sh
node tools/build-booklet.js --form act-full-science --seed classroom --out .scratch/booklets --pdf --tex
```

`--pdf` requires an installed Chrome/Chromium. `--tex` emits source for pdfLaTeX;
it uses the TeX installation's native Computer Modern family and does not distribute
the browser font files. Its numbered rules, passage ranges, choice spacing, working
space and ACT annotations follow the HTML hierarchy, including a full-width rule
below every problem number. Diagram descriptions remain
the existing TeX fallback; use HTML-to-PDF for the actual drawings and browser math
typesetting. The CLI supports ACT forms; SAT forms are generated on the Booklets
page. No additional packages or font services are required by the website.

## Verification

The October 2026 layout review checked actual Chromium PDFs for a full 98-question
SAT and 171-question ACT with Science, including Reading and Writing, mathematics
diagrams, English annotations and Science tables. All numbered problems survived;
sampled pages had no clipped content or overlapping columns. Independent inspection
confirmed the corrected ACT annotations. Separate ACT test/key CLI PDFs also
rendered successfully with embedded fonts.

A subsequent rule-consistency review audited every numbered heading in full
`layout26` exports: all 98 SAT questions and 98 appended explanations, all 171 ACT
questions, and every explanation in the separate SAT and ACT keys had a visible
rule. The audit matched PDF text coordinates to actual raster strokes, including
column and page starts. The same checks passed for CLI ACT test/key HTML converted
to PDF, all SAT/ACT TeX question headings, and an SAT PDF at 80% print scale.
Student questions and key explanations now share one heading style; native TeX
uses the same placement. Content models before and after the change were identical.

Synthetic oversized questions and shared passages preserved all 160 paragraph
markers, end markers and choices across printed pages, with all 18 numbered
headings retaining their rules. Offline downloaded
HTML loaded the embedded fonts and license without network access. SAT and ACT
setup controls were checked at 320px without horizontal overflow.

Representative SAT and ACT TeX sources compiled with pdfLaTeX, preserving all
98 and 171 numbered questions with no blank pages or overfull boxes. Inspected
pages confirmed ruled headings, response space, aligned choices and the minimum
space before starting a question. These are sampled layout checks, not a promise
that every future content combination will paginate identically.

Run the focused regression tests with:

```sh
node --test test/booklet.test.js test/print-selection.test.js
```

They cover grouping, heading order, safe annotation rendering, font/license
embedding, export retry behavior and TeX layout. Run the repository's full gate
before release, and repeat actual PDF inspection when changing pagination rules.
