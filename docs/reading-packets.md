# Printed reading packets

`src/lib/reading-tex.js` turns nightly readings from `content/reading-daily/`
into TeX in the packet style below. Two things typeset it: the daily reading
page's **Generate PDF** action, in the browser, and `tools/reading-packet.js`,
with a local TeX installation. [Printing](printing.md) covers the in-browser
engine, its runtime, and the owner decision that PDFs are made on demand,
never committed or kept as a collection. The owner approved the research-paper style on 2026-10-07
and refined its print layout on 2026-10-08: Liminal and grade/week/day metadata
appear only in a quiet footer, with a clear break before questions and a compact
source note that does not overwhelm shorter readings.
`test/reading-packet.test.js` and `test/reading-tex.test.js` pin the style.
Change it only deliberately, updating this page and the tests together.

**One format for every age (owner decision, 2026-11-17).** Every grade prints
in this same style, Abstract included; print is not banded by age. A review
proposed single-column 14–16 pt pages without the Abstract for K–2, single
column at 12 pt for 3–5, and no Abstract for 6–12; the owner rejected it
because one shared format makes younger children feel older, part of the same
process as their older peers. Do not propose age-banded print again.

Browser printing and downloaded reading HTML also use Computer Modern text,
two-column reading text, separate reading/questions sections, a compact source
note, and a small footer with the grade, week, day and Liminal.
All works fill columns sequentially: down the left column, then down the right,
then onto the next page. Short works and the final page are not balanced into
equal-height columns. This shared rule also travels with downloaded HTML;
native TeX two-column packets already use this flow. Keep stanza and section
break protections, without using them to balance the overall document.

## The style

- **Engine and font:** Latin Modern (`lmodern`, the Type 1 continuation of
  Computer Modern) in the T1 encoding. pdfLaTeX sets every night whose text is
  Latin; a document holding Greek or Cyrillic is set by XeLaTeX with the same
  Latin fonts and those words in FreeSerif (the only such night today is
  `reading-12-w13-d4`). Until 2026-11-17 packets used XeLaTeX with CMU Serif;
  [Printing](printing.md#engine-decision) records why this changed.
- **Characters:** every character prints as written, through LaTeX's own
  command for it, or generation stops with the character, its code point and
  the night. Nothing is dropped or replaced. `test/reading-tex.test.js` walks
  every character of every published night (titles, credits, context, content
  notes, focus, challenge, text and prompts). Character pairs that T1 fonts
  would join (`--`, `''`, ` `` `, `,,`, `` !` ``, `` ?` ``) are kept apart, so a
  source's `--` prints as two hyphens. U+2015 HORIZONTAL BAR prints with the em
  dash glyph, as LaTeX itself sets it; Latin Modern has no separate bar.
- **Page:** `article` class, 10 pt, two columns, two-sided, US letter; margins
  0.75 in (top 0.75, bottom 0.8), column gap 0.28 in; microtype protrusion.
- **Each night is one paper:**
  1. A centred title block: the selection title (`\LARGE` bold); "from
     *Work*" when the selection's title does not already name its work; the
     author (`\large`); "Translated by …" when there is a translator; for a
     reading continued across nights, its place in the run ("Part 2 of 3 ·
     continued from the previous night"), so no two nights of one work print
     the same title block; then italic adult-read-aloud or shared-reading
     guidance when applicable. "Read independently" appears on screen only.
     On the page, a night's week file holds only its own week, so a run that
     crosses a week boundary prints without "Part N of M"; the packet CLI,
     which loads the whole grade, always names the part.
  2. A centred **Abstract**: the night's focus, then its challenge.
  3. Numbered sections: **Context** (with any content note), **Text**, and
     **Questions for discussion** (the prompts only). Text and questions have
     a thin rule below the heading; discussion prompts have extra spacing.
  4. A compact **Source** note, separated by a thin rule: complete author,
     title, publication year and translation credit; the US public-domain
     statement; and a readable, clickable source URL. The small inline label
     and note use 8 pt type for every grade. The URL omits `https://` and an
     initial `www.` in its printed label, while retaining the full link target.
     `sourceNote` in `src/lib/daily-reading.js` supplies the same brief record to
     browser print and TeX packets. Edition, normalization, locator and
     rights-basis details stay in the digital source disclosure and downloaded
     reading. Total, reading and discussion time estimates appear at the end
     of this note, with no time estimate in the printed title block.
- **Running heads:** none. The title and body contain no grade/week/day metadata
  or Liminal branding.
- **Footer:** centred metadata, "Liminal" and the page number, all 7 pt
  (`\scriptsize`). The caller supplies the metadata: the CLI and the page print
  grade, week and day (the CLI adds the date for `--dates`). Page numbers
  restart for each night.
- **Pages:** each night starts on a new page, and each level (grade) starts on
  a fresh sheet, an odd page with an unnumbered blank verso inserted when
  needed, so duplex packets separate cleanly. Sections flow naturally through
  the columns without forced page breaks.
- **Verse:** stanzas keep their lines and indentation, set ragged right.
- **Source tables:** a paragraph of tab-separated columns is set as a small
  tabular (the last column ragged right), with header rows in italics and
  ditto marks left straight rather than curled.
- **Typography changes made only in print:** straight double quotes become
  curly, as packets have always set them, and paired `_underscores_`, a
  transcription convention, become italics (ordinary italics inside a
  small-capitals heading, since Latin Modern has no italic small capitals).
  Wording is never changed.
- **Never printed:** facilitator notes and evidence.

## Use

```sh
# The nights for given school dates, all grades K–12:
node tools/reading-packet.js --dates 2026-10-08,2026-10-09,2026-10-12 --out .scratch/packets/oct-8 --pdf
# Specific nights (any published grade or level):
node tools/reading-packet.js --nights k:w7d4,9:w12d1 --out .scratch/packets/x --pdf
```

- **The school calendar:** five nights a week, Monday to Friday, 36 weeks
  counted from the Monday given by `--start` (default 2026-08-24). Weekends
  and dates outside the year have no night. `--grades k,3,9` limits the
  grades.
- **Output:** written under the `--out` directory and never committed.
  `--pdf` needs pdfLaTeX with `lmodern` (TeX Live has it), XeLaTeX with
  `fontspec` and the `gnu-freefont` FreeSerif files when a night holds Greek
  or Cyrillic, and `pdfpages` for `--rotate-backs`. The CLI prints the engine
  it chose, and stops on any missing character or substituted font.
- **One night in the browser:** the daily reading page's Generate PDF action
  makes `<reading-id>.pdf` for the night on screen with the same TeX.
- **Printing:** print duplex on the long edge, e.g.
  `lp -o sides=two-sided-long-edge -o media=letter packet.pdf`.
- **Printers that flip backs:** some duplex printers turn back sides upside
  down. `--rotate-backs` writes `packet-duplex.pdf`, with every even page
  pre-rotated 180°, so the backs come out upright. Print that file instead.
