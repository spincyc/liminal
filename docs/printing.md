# Printing and PDFs

Liminal makes PDFs on demand from its canonical sources. A family presses
**Generate PDF** on a nightly reading and their browser typesets it with
WebAssembly TeX. A maintainer runs `tools/reading-packet.js` with a local TeX
installation. Both typeset the same TeX from `src/lib/reading-tex.js`, in the
packet style of [reading packets](reading-packets.md).

## Owner decision, 2026-11-17

- **No PDFs in the repository, and no maintained PDF collection.** Every PDF is
  generated when someone asks for it, from the current sources. `dist/` is build
  output and holds no PDFs; packet output goes under `.scratch/` and is never
  committed.
- **Generation runs on demand**, in the reader's browser (nothing is uploaded),
  or locally with the CLI.
- **The runtime is reused, not republished.** The WebAssembly TeX engines, TeX
  formats, fonts and packages come from the release archive that triptych
  already published, mirrored byte for byte by Colophon's release. Liminal pins
  the bytes; it does not build or publish its own runtime.
- **The engine stays consumer-neutral.** The browser runner and runtime tools
  live in [Colophon](https://github.com/spincyc/colophon) (MIT), a shared
  project with no Liminal or triptych names. Liminal vendors a pinned copy and
  keeps only Liminal-specific work: the TeX generator, the runtime subset,
  page integration, the checks and CI.

## Where the pieces live

| Piece | Location | Origin |
| --- | --- | --- |
| Browser runner (`window.Colophon`) | `src/vendor/colophon/native-tex.js` | Colophon, vendored |
| Node harness, runtime tools, tar reader | `tools/vendor/colophon/` | Colophon, vendored |
| Vendored commit and file hashes | `tools/vendor/colophon.json` | `tools/sync-colophon.js` |
| Reading TeX generator | `src/lib/reading-tex.js` | Liminal |
| Runtime subset manifest | `tools/native-tex/runtime.json` | Liminal, derived |
| Fetch, verify, stage, derive | `tools/native-tex.js` | Liminal |
| Generate PDF control | `src/app/pdf-action.js` (`LiminalPdfAction`) | Liminal |
| Real-engine gate | `tools/check-pdf.js` | Liminal |

**Vendoring.** The engine is vendored from Colophon at the commit recorded in
`tools/vendor/colophon.json`, which also lists each file's SHA-256.
`test/colophon-vendor.test.js` fails if a vendored file differs from that
record. To change the engine, change Colophon, then run
`node tools/sync-colophon.js <colophon checkout>` (the checkout must be clean)
and commit the copies and the record together. Never edit the copies.

## The runtime

`tools/native-tex/runtime.json` is the subset of Colophon's runtime manifest
(`colophon-native-tex-runtime/v1`, runtime `wasmtex-2026-47ff73bab1a2e548`)
that Liminal's documents open. `node tools/native-tex.js derive --full
<colophon>/runtime/<id>.json` typesets every document in
`tools/lib/pdf-corpus.js` against the full runtime with file tracing and keeps
only the files the engines opened. The corpus covers:

- two synthetic nights that put every character the generator accepts into
  every packet field;
- the first and last night of every grade;
- the Greek night `reading-12-w13-d4`, the table night `reading-6-w34-d2` and a
  kindergarten verse night;
- two all-grade days (one pdfLaTeX, one XeLaTeX).

Re-derive it when the packet style or the generator's character set changes;
`tools/check-pdf.js` fails when a document needs a file outside the subset.

| Subset (expanded sizes) | Files | Bytes |
| --- | ---: | ---: |
| Engine files (pdfTeX, XeTeX, dvipdfmx, formats, ICU data) | 14 | 42,593,546 |
| Distinct TeX files (fonts, packages, maps; 190 names) | 139 | 13,713,656 |
| Notices and license records (all of the full runtime's) | 79 | 1,030,869 |
| Distinct files in total (one file is listed twice) | 231 | 57,322,512 |

The full runtime has 3,048 files; the subset keeps 231. A browser downloads only
the files of the engine it uses (see [Engine decision](#engine-decision)).

**Delivery.** The manifest pins one archive, listed at Colophon's release first
and triptych's artifacts release second; whichever URL answers, the archive's
SHA-256 and every member's SHA-256 decide acceptance.

- `node tools/native-tex.js fetch` downloads the archive (98,652,160 bytes),
  keeps only the subset's files, verifies each one, and stores them in
  `${XDG_CACHE_HOME:-~/.cache}/liminal/native-tex/` (override with
  `LIMINAL_NATIVE_TEX_CACHE`). Run it once per machine.
- `tools/build.js` stages the cached files into `dist/native-tex/<id>/`. The
  staged copy holds the files, gzip transports for files that compress by a
  tenth or more, the served `runtime.json`, and an `index.html` license page.
  That page lists every notice and the offer of complete corresponding source,
  and Generate PDF links to it ("Typesetter licenses").
- The build also writes `dist/native-tex/config.js`
  (`window.LiminalNativeTeXRuntime`): the runtime's address and pins, or `null`.
- **Offline or uncached**, the build still succeeds, prints why, writes
  `null`, and the page says "PDF generation is unavailable in this copy of the
  site." `tools/check-pdf.js` then skips with a message.
- **`LIMINAL_REQUIRE_NATIVE_TEX=1`** makes a missing runtime fail the build and
  `check-pdf`. CI sets it, caches the runtime files by the manifest's hash, and
  runs `fetch` before the gate, so a deployed site always has Generate PDF.

## In the browser

In nightly readings, **Generate PDF** is in the reader's **More** menu, beside
the print and download actions. It typesets the reading on screen (a school
night, a calendar date or a reading opened by ID) and saves
`liminal-<reading-id>[-<date>].pdf`. The footer names a school night "Grade 5 ·
Week 3 · Day 2" (`schoolMeta`) and a calendar reading by its date, "Grade 5 ·
Tuesday 17 November 2026" (`printMeta` in `src/lib/daily-reading.js`). A
continued reading's "Part N of M" comes from the grade's browse list, so a run
that crosses a week boundary keeps it. While it runs, progress shows under the
toolbar and the menu item becomes **Cancel PDF**; opening another reading
cancels it. **Print readings for several levels** (`#print/…`) makes one PDF
with `printTeX` for a range of up to 31 dates or a school night: level by
level, each level's readings in date order, every reading on an odd page. Without the runtime both buttons are
disabled and say that PDF generation is unavailable; browser print and the
HTML student download remain.

Other pages can reuse the helper. `LiminalPdfAction.run({ tex, engine,
filename, onProgress, signal })` typesets and saves. `LiminalPdfAction.control({
prepare })` builds the button, progress text and license link, where
`prepare()` returns `{ tex, engine, filename }`. `LiminalReadingTeX.nightTeX`,
`nightsTeX`, `dayTeX` (one level per night, each on a fresh sheet) and
`printTeX` (levels of readings, every reading on a fresh sheet) produce the TeX
and name the engine; `documentTeX(levels, { oddStarts })` underlies them.

The runner fetches only from the site's origin. It verifies every file's size
and SHA-256, runs the engine in a disposable worker, refuses any log with a
missing character or substituted font, and keeps verified runtime files and
the last few PDFs in the browser's Cache API. The typesetter therefore
downloads once per browser, not once per PDF.

## Engine decision

Decided 2026-11-17. The criteria, in order: every character typeset
faithfully, then first-use download size, then compile time.

**Choice: pdfLaTeX with Latin Modern (T1) for every all-Latin document, and
XeLaTeX only for a document that holds Greek or Cyrillic.** Latin text is
emitted as LaTeX's own character commands (from `utf8enc.dfu`, `t1enc.dfu` and
`ts1enc.dfu`), so both engines set Latin identically in the same Latin Modern
Type 1 fonts. Under XeLaTeX, Greek and Cyrillic words are set in FreeSerif,
whose coverage of every letter in all four faces was checked by typesetting
it. Today only `reading-12-w13-d4` (2 of 2,340 nights) needs XeLaTeX.

The packet style keeps its look, still Computer Modern in design. It changed
from CMU Serif (OpenType, XeLaTeX) to Latin Modern (Type 1), because the
runtime has no CMU fonts and pdfLaTeX is a third of XeLaTeX's download.

| Option | Faithful text | First-use download (measured) | One night, compile |
| --- | --- | ---: | ---: |
| **pdfLaTeX, Latin Modern T1** (chosen for Latin) | Every Latin character in the corpus; not Greek or Cyrillic | **7.6 MB** | **0.7–1.3 s** |
| **XeLaTeX, Latin Modern T1 + FreeSerif** (chosen for Greek/Cyrillic) | All of it | **22.9 MB** (19.6 MB after a pdfLaTeX PDF) | **1.4–1.7 s** |
| XeLaTeX for every document | All of it | 22.9 MB for every family | 1.4–1.7 s |
| pdfLaTeX with LGR Greek (Libertinus) | Polytonic accents misplaced or missing | about 7.6 MB | about 1 s |
| XeLaTeX with Latin Modern OpenType throughout | Small capitals unavailable (no LM Caps OpenType in the runtime) | 22.9 MB + fonts | not pursued |
| XeLaTeX with CMU Serif (the old local style) | Not possible: the runtime has no CMU fonts | n/a | n/a |

Measurements, 2026-11-17, runtime `wasmtex-2026-47ff73bab1a2e548` subset:

- **Download** = bytes the browser fetched for its first PDF in a fresh
  profile (Chromium 157, DevTools `encodedDataLength`), including gzip
  transports. Engine files for pdfLaTeX are 4.29 MB on the wire (5.54 MB
  expanded) and its TeX files 3.23 MB (9.06 MB expanded; `pdftex.map` alone is
  5.4 MB expanded). XeLaTeX adds its 3.9 MB format, 10.8 MB of ICU data and
  dvipdfmx.
- **Compile**: Node with the vendored harness against the staged subset (one
  night 0.7 s, a 51-page, 26-night, 13-level document 1.2 s, the Greek night 1.4
  s), and Chromium on localhost (one night 0.8–1.0 s, the Greek night 1.7 s).
  The first PDF over a 25 Mbit/s link took 4.1 s (pdfLaTeX) and 10.1 s
  (XeLaTeX). A later PDF downloads nothing.

Known limits:

- XeTeX's WebAssembly worker has no `runMain`, so `-halt-on-error` is not
  passed. `shell_escape = f` is still set, and the runner rejects any log with
  an error.
- U+2015 HORIZONTAL BAR prints with the em dash glyph, as LaTeX sets it.
- Combining marks, CJK and emoji are refused rather than approximated.

## Checks

- `node tools/check-pdf.js [--out DIR]`, part of `tools/check-all.js`, typesets
  the corpus above with the real engines against `dist/`. It requires a
  complete PDF, every level starting on an odd page, every night on a page of
  its own, and in the print view's document (a week across Christmas for
  three levels) every night on an odd page. It skips without a
  runtime unless `LIMINAL_REQUIRE_NATIVE_TEX=1`.
- `test/reading-tex.test.js` walks every character of every published night,
  and pins engine choice, level starts, continued-night titles and
  translators.
- `test/pdf-action.test.js` covers the page helper against a fake runner. The
  runner itself is tested in Colophon with a fake worker.
