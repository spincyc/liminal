# Shared worksheet print review

Grade expansions, weekly coursework and AP assessments now share the
Computer Modern typography used by SAT/ACT booklets and daily reading.
Worksheet layout follows the SAT/ACT dimensions: 10pt text, two columns,
ruled question headings and open response space. Authored coursework and
question generation are unchanged.

The implementation and an independent agent review on October 8, 2026 found
no remaining defects in the sampled outputs after the corrections below.

## Print coverage

| Surface | Samples and checks |
| --- | --- |
| Common Core grade expansion | Grade 8 lessons 1-1, 2-1 and 4-2; guide, student, key and combined packets; selected B/C and reserve A/B/C downloads |
| Weekly worksheets | Common Core Grade 1 math, Singapore Grade 4, named high-school coursework, Grade 11 reading and AP Physics C week 36 student/key |
| AP assessments | Calculus AB unit 8 student/key, full Calculus BC exam, Physics C unit 1 with appended reference |
| Worked lessons and references | Physics 1 week 24 and standalone Physics C formula reference |

Actual Chromium PDFs retain numbered rules, writing space, graphs, tables,
calculator directions and required notices. The three short weekly samples
fit on one page each. The Physics C reference finishes on page 5 with its
notes and disclaimer; its appended version finishes on page 12 of the
sample assessment.

Downloaded lesson and weekly HTML includes all four Computer Modern faces
and the complete SIL OFL license. Offline browser checks loaded all four
faces. Student downloads remain separate from keys even after viewing
answers. Phone and desktop checks at 320px and 1280px found no horizontal
page overflow in the sampled views. Native printing restores the original
disclosure state and footer placement afterward.

## Defects corrected

- Replaced boxed print cards and inconsistent fonts with shared worksheet
  components, including worked examples and answer keys.
- Kept question numbers with their rules, and labelled shared passages with
  their exact question ranges.
- Removed footer-only pages in short weekly sheets and AP references.
- Kept short AP free-response introductions together and gave reference
  formulas the full column width instead of three narrow table cells.
- Added measured continuation pages for long lesson prompts, tables and
  solutions. Continuations repeat question labels and table headers while
  retaining ordered solution-step numbers.
- Required fonts before measurement and printing. Cancellation, route changes
  and settings changes cannot restore a stale packet while fonts load.
- Bounded continuation splitting: an indivisible oversized row or figure
  produces an error instead of repeatedly copying its heading.

The long reading sample retained its complete 44,713-character source passage
under normalized text comparison. A separate lesson stress fixture retained
100 prompt markers, 65 table rows and 140 answer steps exactly once in the
appropriate PDFs. The ordinary duplex sample starts guide/student/key at
pages 1/9/13; the long fixture starts at 1/3/9. Actual PDF labels agree with
the page plan. A mixed B/C single-sided packet has no separator backs.

## Validation and limits

`node tools/check-all.js` passed, including the static build checks and all
918 tests with no skips. Real PDF regression tests cover text retention,
continued tables and step numbers, duplex boundaries, student/key separation,
offline assets and rejection of an oversized indivisible row.

This is representative browser and PDF review, not exhaustive pagination
coverage of every generated seed, browser or physical printer. Use Letter
paper at 100% scale with browser headers and footers disabled; combined
duplex packets use long-edge binding and retain their separator backs.
