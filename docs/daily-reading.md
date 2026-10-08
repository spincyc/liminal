# Daily reading

The daily library supplements the weekly reading courses with 180 new reading
selections per grade: five nights in each of 36 weeks, kindergarten through
Grade 12. It supplies the actual public-domain text, followed by discussion.
Four Advanced levels for readers well past Grade 12 are in preparation; the
schema and tools below already accept them, and each appears in the library
only when its complete 180-night year passes review.
The selections are authentic literary and documentary works, not rewritten
classics or book recommendations. Editorial sequence and estimated time are
teaching judgments, not measured reading levels or a standards certification.

## Time and progression

| Grade | Total reading and discussion | Usual mode |
| --- | --- | --- |
| K | About 10 minutes | Adult read-aloud, with oral response |
| 1–2 | 10–15 minutes | Adult read-aloud or shared reading |
| 3–5 | 15–20 minutes | Shared reading moving toward independence |
| 6–8 | 20–25 minutes | Independent reading, shared support when useful |
| 9–12 | 25–30 minutes | Independent reading and discussion |
| Advanced 1 | 30–35 minutes | Independent reading and discussion |
| Advanced 2 | 30–40 minutes | Independent reading and discussion |
| Advanced 3–4 | 35–45 minutes | Independent reading and discussion |

Each day separates reading and discussion minutes. A short, demanding poem can
need rereading and discussion rather than additional words. A family's actual
pace may differ; these are suggested stopping budgets, not countdowns or
completion quotas. The curriculum progressively increases demands on memory,
syntax, imagery, inference, evidence, and interpretive independence. Every day
identifies its particular challenge and discussion focus. The annual progression
explains the sequence; literary difficulty does not increase mechanically every
night.

Choose coherent whole works or contiguous excerpts at meaningful boundaries.
Longer works may continue across consecutive nights, with a short recap of the
necessary prior situation. Do not divide books into fixed word-count chunks.
No exact selection repeats within or between grades. At least ten bibliographic
sources per grade and, where appropriate, twelve authors keep a single book or
anthology from substituting for a broad reading course. Selection quality takes
precedence over numerical variety. Include narrative, poetry, and documentary
or essay prose, with diverse authors, periods, and forms. There is no minimum
share of documentary or essay prose; the owner decided on 2026-10-07, after a
review measured 3–61% across grades, to keep each grade's current mix.

Do not censor literature that is widely considered exemplary American and
English writing (owner directive, 2026-10-07). Excerpt boundaries follow the
work's own units and the night's time budget. Do not choose them to avoid
period language, prejudice, violence, or other difficult material, and never
drop a work's essential scene for that reason. Historical prejudice is neither
rewritten nor presented as the site's voice. When it helps, a brief context or
content note explains the history or the author's purpose. Notes never tell
readers to skip, soften, or substitute words. Age adjustment governs a grade's
choice of works, reading difficulty, length, and reading mode. It does not
license excising or avoiding passages of a chosen work.

## Levels beyond Grade 12

Advanced 1–4 (in preparation; none is published yet) continue the same
contract for students well past Grade 12.
They are reading levels within this library, not courses, credits, years of
college or certificates. Each level steps further back in English (from
nineteenth-century density to sixteenth-century and glossed Middle English),
further into abstraction, technical science and law, and toward longer
continuous and comparative reading; nightly length rises only modestly. The
K–12 corpus and the Advanced levels complete separately:
`node tools/check-daily-reading.js --complete` requires K–12, and
`--complete-advanced` requires Advanced 1–4.

Printed packets use one fixed two-column style, specified in
[reading packets](reading-packets.md).

## Browsing and reading online

`daily-reading.html` has two views with their own links. **Browse**
(`#browse/<grade>`, and the page's default) shows one grade's year at a
glance: the grades in the library, read from the index so new levels appear
without code; the year's progression stages; and expandable weeks containing
five nights with title, author, work, minutes, reading mode and genre. The
first or most recently read week opens initially; search expands matching
weeks across the full year. Continued readings are
marked "Part 2 of 5" and joined by a rule. Search matches every word against
titles, authors, works and genres, ignoring case and accents, and narrows by
reading mode and genre. Each night links to **Read**
(`#<grade>/<week>/<day>`), the full text with discussion, print and download;
returning to Browse opens its week and marks the night just read. Related
year-plan and weekly-instruction links retain the current K–12 grade/week.
Advanced levels offer explicitly labelled K–12 library links.

Printed readings use bundled Computer Modern Unicode Serif, 10-point body type,
two columns, a centered title and author, and a small footer containing the grade,
week, day, and Liminal. Grade/week/day appear only in the footer when printed.
Reading and Questions have distinct headings and dividers, followed by a compact
Source note. Every grade prints only the complete bibliographic credit (including
any translator), a short US public-domain statement, and a readable source link.
The full edition, transcription, excerpt locator, and rights record remain in
the expandable digital details, also preserved in offline downloads. Long audit
records never compete with a young reader's text on paper. Sections flow across
columns without mandatory page breaks. This applies to browser printing and
downloaded student HTML; the font data and its license
travel in the download, so offline printing needs no installed TeX fonts. Source
attribution, verse indentation, and tables remain in the student copy; facilitator
notes stay out. See [printed reading packets](reading-packets.md) for the matching
TeX packet format.

Browse loads only `content/reading-daily/browse/<grade>.json`, about 40 KB,
which `tools/build-daily-reading.js` builds from each grade with an explicit
allowlist (`browseIndex` in `src/lib/daily-reading.js`): titles, credits,
minutes, mode, genre, continuation and the progression focus. It never
carries the text, questions, facilitator notes or evidence. Opening a night
loads only its week, `content/reading-daily/weeks/<grade>/<week>.json`
(`weekSlice`: that week's five nights, the sources they cite, and the
grade's overview and progression; about 17–100 KB instead of a 0.5–2 MB
grade file). A newer choice cancels a download it supersedes. The complete
grade files are still built and remain the canonical download.
`tools/smoke-static.js` compares every browse and week file with its source.

The reader presents the supplied text without changing its words. In a block
with an even number of underscores, each consecutive pair of the editions'
plain-text `_italics_` marks is shown as emphasis, including across a line or
inside a word (`_un_natural`); a block with an odd number is shown as
written. A paragraph whose lines hold tab-separated columns, such as Wallace's
nightly moth counts (`reading-6-w34-d2`), is shown as a table, keeping its
ditto marks. Both are built from text nodes, never parsed as markup, and the
student download shows them the same way. `{footnote …}` markers are still
shown as written.

## Canonical contract

Each `content/reading-daily/{k,1,...,12,a1,...,a4}.json` is one complete grade
or level. Content is
plain text, with no trusted HTML or UI instructions embedded in reading blocks.

```json
{
  "schemaVersion": 1,
  "grade": 0,
  "title": "Kindergarten daily reading",
  "overview": "An explanation of the year, its modes, and its literary range.",
  "progression": [
    { "weeks": [1, 6], "focus": "...", "rationale": "..." }
  ],
  "sources": [
    {
      "id": "k-author-work",
      "author": "Author or attributed traditional origin",
      "title": "Exact source work or collection",
      "translator": null,
      "edition": "Bibliographic description of the English text used",
      "publicationYear": 1900,
      "translationYear": null,
      "url": "https://primary-source.example/catalogue",
      "textUrl": "https://primary-source.example/transcription",
      "rights": {
        "jurisdiction": "US",
        "status": "public-domain",
        "basis": "Specific publication/translation date and the resulting US basis.",
        "verifiedDate": "2026-10-07",
        "evidenceUrl": "https://primary-source.example/evidence"
      }
    }
  ],
  "days": [
    {
      "id": "reading-k-w01-d1",
      "week": 1,
      "day": 1,
      "title": "Selection title",
      "sourceId": "k-author-work",
      "genre": "poetry",
      "readingMode": "adult-read-aloud",
      "time": { "readingMinutes": 4, "discussionMinutes": 6, "totalMinutes": 10 },
      "challenge": "The concrete reading demand introduced or extended today.",
      "focus": "The literary achievement or documentary purpose/evidence discussed.",
      "context": "Brief original orientation, clearly outside the source text.",
      "contentNote": null,
      "excerpt": {
        "locator": "Poem title, chapter/section and opening/closing words or paragraphs",
        "isCompleteWork": true,
        "continuesFrom": null,
        "continuesTo": null,
        "textHash": "64 lowercase hexadecimal SHA-256 characters"
      },
      "blocks": [ { "type": "stanza", "text": "Original line one\nOriginal line two" } ],
      "questions": [
        {
          "id": "reading-k-w01-d1-q1",
          "prompt": "A pointed question grounded in this selection.",
          "facilitatorNotes": [ "A defensible response and how to guide discussion." ],
          "evidence": [ "An exact phrase or sentence from the selection." ]
        }
      ]
    }
  ]
}
```

`grade` is numeric (0 is kindergarten; 13–16 are Advanced 1–4); the filename
and day-ID grade component use `k` and `a1`–`a4`. Day IDs follow `reading-<grade>-w<two digits>-d<1..5>`. There are exactly
180 ordered day records and exactly one record for each week/day pair. Source
IDs are unique within a grade and all references resolve. `publicationYear`
identifies the publication of the text or edition actually used, not the
electronic release date. Translations must name their translator and date;
`translator` and `translationYear` are null only for original English or a
traditional English text with no translation.

Allowed block types are `paragraph`, `stanza`, and `heading`. Preserve paragraph
boundaries, stanza breaks, and line breaks. No AI paraphrase, fabricated
restoration, silent abridgment, or inserted connective sentence belongs inside
the supplied source. Omit publisher front matter and digitizer boilerplate.
Plain-text transcription conventions may be retained; any normalization beyond
line-wrapping should be documented in the source's `edition` description.

The text follows the declared edition as printed, which includes its
misprints: a wrong letter or word stays, such as *The Waste Land*'s "Heimai".
Letters that are missing because type failed to print are treated
differently. A blank where a letter belongs, such as "w ter" or "said  o
yourself", may be supplied when a later printing of the same text shows the
letter unambiguously. Each supplied letter is declared in the `edition`
description and in that night's `context`, naming the printing consulted.
This rule was set on 2026-10-08, after review found grades handling the two
cases differently.

`textHash` is SHA-256 (UTF-8) of all `blocks[].text` joined with two newline
characters, then Unicode-normalized to NFC. Do not trim, collapse whitespace,
change punctuation, or include metadata when calculating this identity.
Duplicate review also compares whitespace-normalized source text, because
formatting changes do not create a new reading selection.

`isCompleteWork` means the complete individual poem, story, essay, document, or
play, not merely the complete selected passage. `continuesFrom` and
`continuesTo` contain neighboring day IDs only for uninterrupted continued
reading, otherwise null. `locator` states excerpt boundaries explicitly and
must enable another reader to locate the exact passage. Selection titles must
identify excerpts or parts without implying that an entire novel is supplied.

`readingMode` is `adult-read-aloud`, `shared`, or `independent`. All minute
values are positive integers; their sum equals `totalMinutes`. Each selection
has at least three original, text-specific questions, with nonempty facilitator
notes and quoted evidence. Questions should progress from attention to detail
toward interpretation, craft, or evidence evaluation as appropriate. A name
substitution in a generic question is not sufficient. Notes acknowledge
defensible alternatives where the text permits them. The student view and
student exports withhold facilitator notes and sample evidence until requested.

Optional `day.author` names an individual piece's authenticated author when
the source bibliography describes an anthology or editor; the reader otherwise
uses `source.author`. Optional `day.workTitle` gives the individual work's exact
title when it differs usefully from the editorial selection title. Both are
nonempty strings when present. Do not infer anonymous nursery-rhyme authors or
assign an editor as a poem's author. These fields do not create additional
bibliographic sources or inflate the source-diversity count.

## Source research and rights

Use trustworthy primary repositories: digitized editions and their catalogue
records, Project Gutenberg editions with explicit US status, official archives,
or public libraries. Verify the exact English text, including translator and
edition; an ancient original does not make a recent translation public domain.
Project Gutenberg contains some copyrighted works, and its transcriptions may
differ from their print sources, so neither its domain name nor the original
author's death date alone proves the needed edition and rights facts. See its
[permission and edition guidance](https://www.gutenberg.org/policy/permission.html).
The [US Copyright Office duration guidance](https://www.copyright.gov/help/faq/faq-duration.html)
explains why publication history matters. Rights records apply to the United
States; they are not a claim of worldwide public-domain status.

An undated title page does not by itself make the original English text
unidentified. A transcription with its publisher and original-text copyright
leaf, together with the repository's explicit US public-domain determination,
can identify that text without identifying a printing date. Describe it as
"PG transcription of [publisher] text, copyright [year]; printing undated."
Do not call it a dated first edition. The 2026-10-07 source review accepted
Holbrook's [*The Book of Nature Myths*](https://www.gutenberg.org/ebooks/22420)
(copyright 1902), Brown's [*The Book of Saints and Friendly Beasts*](https://www.gutenberg.org/ebooks/28990)
(copyright 1900), and Baldwin's [*Fifty Famous Stories Retold*](https://www.gutenberg.org/ebooks/18442)
(copyright 1896) on these combined
primary leaves and explicit US status. Their selected excerpts still require
complete fidelity checks against the actual transcription, but not a redundant
second-witness collation solely because the printing is undated.

This distinction does not extend to an author's original-publication date
without supporting source front matter. Unknown translators, unresolved
revisions or abridgments, mismatched versions, and actual text corruption
require resolution, full collation, or replacement. Later introductions and
other new material are separate from the underlying text; see the
[Copyright Office's derivative-work guidance](https://www.copyright.gov/circs/circ14.pdf).
Project Gutenberg's [edition and front-matter guidance](https://www.gutenberg.org/policy/permission.html)
likewise does not promise identity with a particular print exemplar.

When the text remains genuinely unidentified, do not invent its print exemplar.
The bounded fallback is to collate **every selected excerpt** against an
identified, dated public-domain primary witness, recording matching words
after documented whitespace normalization. Resolve substantive revision and
translation differences. Describe the source honestly: "PG transcription;
print exemplar unidentified; selected text collated against [dated witness]."
Use the identified text/witness year in `publicationYear`, and record the
witness URL, locator, and explicit rights basis. An original-publication date,
US public-domain label, or spot check alone is insufficient for this fallback.
If the selected words cannot be verified against that witness, use another
source. This 2026-10-07 editorial decision preserves verifiable selected text
without claiming an unsupported relationship to a particular print copy.

Document the publication year and translator explicitly, the US public-domain
basis, a primary evidence URL, and the date checked. Prefer texts published by
1930, verified to have entered the US public domain as of 2026, or qualifying
US federal-government documents. Do not copy modern introductions, editorial
annotations, or illustrations whose separate rights have not been established.

Downloaded source files, parser scripts, research notes, and fidelity results
belong in each curator's assigned `.scratch/daily_reading_corpus/` lane. Only
the selected canonical content and durable methodology/review documentation are
committed. For every selection, compare its supplied text against the downloaded
source after explicitly documented transcription whitespace normalization.
Record failures; do not repair a mismatch by weakening the comparison. A
separate reviewer examines source fidelity, edition/translation rights,
discussion quality, age appropriateness, and progression, recording actual
sampling scope and hashes in `docs/reviews/`.

Independent agent review and structural validation are not human editorial
approval, empirical time measurements, or proof of comprehensive grade-level
text complexity. The review report records these limits and any unresolved
findings directly.
