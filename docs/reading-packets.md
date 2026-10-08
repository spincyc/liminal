# Printed reading packets

`tools/reading-packet.js` typesets nightly readings from `content/reading-daily/`
as printable packets. The owner approved this exact style on 2026-10-07 and asked
that it not drift; `test/reading-packet.test.js` pins it. Change the style only
deliberately, updating this page and the test together.

## The style

- **Engine and font:** XeLaTeX with `fontspec`, main font CMU Serif (Computer
  Modern), `Ligatures=Common` so the source's characters print as they are.
- **Page:** `article` class, 10 pt, two columns, two-sided, US letter; margins
  0.75 in (top 0.75, bottom 0.8), column gap 0.28 in; microtype protrusion.
- **Each night is one paper:**
  1. A centred title block: the selection title (`\LARGE` bold), the author
     (`\large`), then an italic line with grade, week, night, date when given,
     the total minutes and the reading mode.
  2. A centred **Abstract**: the night's focus, then its challenge.
  3. Numbered sections: **Context** (with any content note), **Text**, and
     **Questions for discussion** (the prompts only).
  4. A one-entry reference list: author, title, year, translator when there is
     one, the edition's identifying sentences, the US public-domain statement
     and the source URL.
- **Running heads:** "Liminal Daily Reading" on the outer side and the grade,
  week and night on the inner side, over a 0.4 pt rule. Page numbers restart
  for each night.
- **Pages:** each night starts on a new page, and each grade's packet starts on
  a fresh sheet so duplex packets separate cleanly.
- **Verse:** stanzas keep their lines and indentation, set ragged right.
- **Typography changes made only in print:** straight double quotes become
  curly, because CMU Serif draws ASCII `"` as a closing quote, and paired
  `_underscores_`, a transcription convention, become italics. Wording is
  never changed.
- **Never printed:** facilitator notes and evidence.

## Use

```sh
# The nights for given school dates, all grades K–12:
node tools/reading-packet.js --dates 2026-10-08,2026-10-09,2026-10-12 --out .scratch/packets/oct-8 --pdf
# Specific nights, any grade or Advanced level:
node tools/reading-packet.js --nights k:w7d4,a1:w3d2 --out .scratch/packets/x --pdf
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
