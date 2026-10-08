# Printed reading packets

`tools/reading-packet.js` typesets nightly readings from `content/reading-daily/`
as printable packets. The owner approved the research-paper style on 2026-10-07
and refined its print layout on 2026-10-08: Liminal and grade/week/day metadata
appear only in a quiet footer, with a clear break before questions and a compact
source note that does not overwhelm shorter readings.
`test/reading-packet.test.js` pins the style. Change it only deliberately,
updating this page and the test together.

Browser printing and downloaded reading HTML also use Computer Modern text,
two-column reading text, separate reading/questions sections, a compact source
note, and a small footer with the grade, week, day and Liminal.
All works fill columns sequentially: down the left column, then down the right,
then onto the next page. Short works and the final page are not balanced into
equal-height columns. This shared rule also travels with downloaded HTML;
native TeX two-column packets already use this flow. Keep stanza and section
break protections, without using them to balance the overall document.

## The style

- **Engine and font:** XeLaTeX with `fontspec`, main font CMU Serif (Computer
  Modern), `Ligatures=Common` so the source's characters print as they are.
- **Page:** `article` class, 10 pt, two columns, two-sided, US letter; margins
  0.75 in (top 0.75, bottom 0.8), column gap 0.28 in; microtype protrusion.
- **Each night is one paper:**
  1. A centred title block: the selection title (`\LARGE` bold), the author
     (`\large`), then italic adult-read-aloud or shared-reading guidance when
     applicable. "Read independently" appears on screen only.
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
- **Footer:** centred grade, week, day, optional date, "Liminal" and the page
  number, all 7 pt (`\scriptsize`). Page numbers restart for each night.
- **Pages:** each night starts on a new page, and each grade's packet starts on
  a fresh sheet so duplex packets separate cleanly. Sections flow naturally
  through the columns without forced page breaks.
- **Verse:** stanzas keep their lines and indentation, set ragged right.
- **Source tables:** a paragraph of tab-separated columns is set as a small
  tabular (the last column ragged right), with header rows in italics and
  ditto marks left straight rather than curled.
- **Typography changes made only in print:** straight double quotes become
  curly, because CMU Serif draws ASCII `"` as a closing quote, and paired
  `_underscores_`, a transcription convention, become italics. Wording is
  never changed.
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
  `--pdf` needs XeLaTeX, `fontspec`, the CMU fonts and, for `--rotate-backs`,
  `pdfpages`.
- **Printing:** print duplex on the long edge, e.g.
  `lp -o sides=two-sided-long-edge -o media=letter packet.pdf`.
- **Printers that flip backs:** some duplex printers turn back sides upside
  down. `--rotate-backs` writes `packet-duplex.pdf`, with every even page
  pre-rotated 180°, so the backs come out upright. Print that file instead.
