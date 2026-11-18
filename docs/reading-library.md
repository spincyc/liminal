# Reading library

The reading library holds the complete public-domain works that nightly
readings come from. A nightly reading cites a range of blocks in one of these
works instead of carrying its own copy of the text, so every excerpt can be
read in context and checked against the whole work. The owner asked on
2026-11-17 for the full sources to live in the repository, not only the
fragments; nothing is fetched when the site is built.

## Layout

`content/reading-library/<work-id>/` holds exactly two files:

- `text.jsonl`: the complete work, one block per line (UTF-8, LF line ends,
  final newline). Each line is a JSON object with keys in this order:
  `{"type":"heading","level":1,"text":"CHAPTER I"}`,
  `{"type":"paragraph","text":"…"}`, `{"type":"stanza","text":"line\nline"}`.
  `level` (1–3) appears only on headings and is optional. One block per line
  keeps diffs readable and makes a block's position its identity.
- `work.json`: the bibliographic, rights and acquisition record.

`work-id` is lowercase words joined by hyphens,
`<author-surname>-<short-title>-<year>`, for example
`nesbit-railway-children-1906`. A work record describes one edition actually
used. Several grades may draw from one work, but no passage of a work is read
twice anywhere in the corpus (the check compares exact positions).

```json
{
  "schemaVersion": 1,
  "id": "nesbit-railway-children-1906",
  "author": "E. Nesbit",
  "title": "The Railway Children",
  "translator": null,
  "edition": "Exact edition, including every normalisation and emendation",
  "publicationYear": 1906,
  "translationYear": null,
  "url": "https://catalogue-or-landing-page",
  "textUrl": "https://the-transcription-used",
  "rights": { "jurisdiction": "US", "status": "public-domain", "basis": "…",
              "verifiedDate": "2026-11-17", "evidenceUrl": "https://…" },
  "acquisition": { "retrieved": "2026-11-17", "downloadUrl": "https://exact-file",
                   "downloadSha256": "<64 hex>", "method": "How the file became blocks" },
  "scope": { "complete": true, "note": null },
  "text": { "blocks": 812, "sha256": "<64 hex of text.jsonl>" }
}
```

The fields are exactly these. `edition`, `rights` and translator rules are the
same as for nightly sources in [daily reading](daily-reading.md#source-research-and-rights).
`acquisition` records the exact file downloaded and its SHA-256, so the
conversion can be repeated and compared. `scope.complete` is false only when
the whole edition is impractical to hold (a complete-works volume of several
megabytes), when the source is a periodical issue of which only the author's
contribution belongs here (a story instalment in a magazine), or when only part
of the edition has a transcription verified against its printing; the library
then holds every whole individual work used from it, and `scope.note` says
exactly what is included and why. `text` binds the record to
its text: run `node tools/reading-library.js seal <work-id>` after any change.

`scope.collated` (optional) lists the block ranges, `[[first, last], …]`
ascending and merged where they touch, that were checked against the printed
witness when only part of the text was: a transcription whose print exemplar is
unidentified and whose selected excerpts alone were collated (the bounded
fallback in [daily reading](daily-reading.md#source-research-and-rights)), or a
transcription whose collated passages showed errors enough that the unchecked
rest cannot be trusted. Every reading of such a work, school night or calendar
reading, lies inside a listed range, and the build refuses one that does not.
To read new text from the work, collate those blocks against the witness named
in `edition` the same way, apply the witness's readings, extend `collated`,
say so in `edition`, and seal.

## Text conventions

The text follows the edition as printed, with the conventions of nightly
blocks: prose line wrapping joined with single spaces, verse lines and
indentation kept as stanza lines, paired `_underscores_` for the edition's
italics, tab-separated rows for source tables, chapter and section titles as
headings. Leave out digitiser material (Project Gutenberg headers, footers and
licence text, transcriber's notes, page numbers and navigation), modern
introductions, annotations and illustration captions whose rights are not
established. Front matter belongs only when it is the author's own (a
dedication, a preface by the author). Every such choice, and every emended
letter, is stated in `edition` and `acquisition.method`.

### Notes and illustrations

Notes that belong to the work as first published (the author's, the
translator's, or the original publisher's or editor's) stay, in one form: each
note is its own paragraph block `[Footnote <mark>: <text>]` (Project Gutenberg's
form), placed where the transcription places it, after its paragraph, at the
end of the chapter, or at the end of the book; its anchor stays in the text as
the transcription marks it, normally `[<mark>]`. The apparatus of a later
scholarly edition (a modern editor's commentary, collation notes, glossary or
endnotes, such as Turpin's notes to Emerson or the Cambridge Shakespeare's
collations) is left out and declared in `edition`, like a modern introduction.
A night that omits an anchor the library keeps is not a range of the work: it
keeps its own text and names the anchor in `excerpt.inlineReason`. A shared
label such as "FOOTNOTES:" is a paragraph, never a heading, so it stays out of
the contents. Transcriber's notes, illustration markers (`[Illustration]`) and
captions are left out (the checker refuses the markers and a notes heading).

### Several source files

When the transcription spans several files (Wikisource subpages, a multi-part
archive), `acquisition.downloadUrl` names the first or the index page,
`acquisition.method` lists every file in order, and `downloadSha256` is the
SHA-256 of the responses concatenated in that order.

## Citing a range

A reading whose `sourceId` is a library work names its text with
`excerpt.blocks: [first, last]` (inclusive, zero-based line numbers) and
optional `excerpt.startChar` / `excerpt.endChar` (JavaScript string offsets
into the first and last block, for an excerpt that begins or ends inside a
block; otherwise null). Such a reading carries no `blocks` array. The loader
resolves the text, and `excerpt.textHash` must match the resolved text exactly,
so a change to a work that alters any cited passage fails the check. A reading
whose text cannot be one contiguous range of the stored work keeps its inline
`blocks` and says why in `excerpt.inlineReason`.

Grade files list no source records for library works: the loader attaches each
cited work's record, so built files, the reader, downloads and packets see the
same source shape as before.

## Tools

```sh
node tools/reading-library.js check                      # validate every work
node tools/reading-library.js seal <work-id>...          # recompute work.text
node tools/reading-library.js gutenberg in.txt out.jsonl # rough start for PG plain text
node tools/reading-library.js align <grade-key> [--write] [--source <legacy-source-id>]
```

`align` moves a grade from inline excerpts to library ranges: give a legacy
grade source `"library": "<work-id>"`, then `align` locates each of its nights
block by block in that work. A source retires (its record leaves the grade
file) only when every night resolves exactly or declares `inlineReason`.
Downloads, converters and comparison notes belong in the curator's `.scratch`
lane; only the work folders are committed.

## On the site

The build writes `content/reading-library/index.json` (every work with its
levels, genres and number of readings) and, per work, `meta.json` (record,
contents from headings, the readings drawn from it with their ranges) and the
text in chunks that break at headings. `library.html` lists the works with
search and filters (level, genre family, author, period) and opens each work
with its record, its contents from headings, and the text one part at a time,
marking every passage used as a nightly reading with a link to it. Every
nightly reading links back to its passage (`library.html#<work-id>/<reading-id>`);
routes and filters live in `src/lib/reading-library.js`. A reading that keeps
its own text (`excerpt.inlineReason`) is listed with the work's readings but
marks nothing, and its "Read it in the full work" opens the work. Notes in the
`[Footnote <mark>: …]` form are set smaller and muted (`isFootnote`).
