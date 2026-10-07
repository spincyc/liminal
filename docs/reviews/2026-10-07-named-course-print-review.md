# Trigonometry and Calculus browser/export review — 2026-10-07

An independent agent reviewed the final named Trigonometry and Calculus
coursework in Chromium 153. No unresolved presentation or export defect was
found after the mobile selector correction described below. This supplements
the separate content reviews; it does not claim a new full mathematical audit.

## Samples

| Course | Week | Worksheet | Main presentation checks |
| --- | ---: | --- | --- |
| Trigonometry | 8 | B | Angular and linear speed, radius, periods, radians, and measured units |
| Trigonometry | 36 | C | Exponential models, domains, initial values, intervals, sinusoidal construction, and rate arguments |
| Calculus | 20 | B | Cylinder/cone/ladder and other related-rate givens, geometry, rates, and units |
| Calculus | 36 | C | Differential equations, Euler steps, volume models, error bounds, and counterexamples |

Learn and Worksheets bodies were inspected at 320px and 390px, including
long prompts and the end of the worksheet. The named course selector says
**Course** and retains the full course name. Screen and exported headings use
Trigonometry or Calculus with flexible-placement wording, without assigning
either course to a school grade. The supplied formulas, domains, initial
conditions, measurements, and units remain present in the reviewed tasks.

## Mobile finding and closure

The original 74px named-course Week selector clipped the second digit of 36
in Chromium at 320px. The author widened that phone column to 96px. The
reviewer copied the built site into an isolated snapshot, replaced only its
weekly stylesheet with the corrected source, and repeated the browser check.
Both 36 and Trigonometry are fully visible at 320px; Calculus and the 390px
views also pass. Standard kindergarten and Grade 12 selectors with week 36
remain fully legible at both widths. No horizontal page or rich-text overflow
was found in the sampled bodies.

## Print and offline export

Each sample was exported through the real student/key Print and Download
controls. All eight documents produced three-page Letter PDFs. Reopening and
reloading all eight standalone downloads with browser networking disabled
produced another eight PDFs with identical extracted text: 16 PDFs total.

- Printed documents retain the doorway mark, wordmark, named-course identity,
  week, worksheet letter, attribution, and source link.
- Each student document has six prompts and six blank work areas of at least
  38mm. Student HTML contains no solution elements, scripts, inline event
  handlers, iframes, or external stylesheet dependencies. Matching keys have
  six solutions and their steps.
- Fractions, exponential powers, derivative marks, radian notation, and cubic
  measurement units remain legible in inspected PDF pages. Long instructions
  and applied givens wrap without clipping.
- Final exercises remain with their attribution footer. No footer-only final
  page or text outside the checked paper edges was found. First pages,
  selected question/solution pages, and final pages were visually inspected.

The reviewed content SHA-256 values are:

- Trigonometry: `39a982efc9eab037b04bc34c94499ad59778c68e60db5875e870e41982a7df55`
- Calculus: `7f1e881685f8ed6693895769e4ab8641901fa5ce63b232a4aa2df11b3bddc0ee`

The final phone-layout stylesheet SHA-256 is
`a6a5e58194eb2b6514132426f99c00c1c9c7bb32f1a444823e5c40e31928a6b6`.
The final correction affects a screen-width selector layout; print results
were obtained before that screen-only correction. Full implementation hashes,
measurements, HTML downloads, screenshots, PDFs, and text extraction remain
transient review evidence. This lane changed no implementation or content.

These checks sample four of the two courses' 72 weeks and one worksheet per
sample. They do not establish all pagination, other-browser behavior, or
physical-printer output. Nightly-reading corpus review is a separate lane and
is not included here.
