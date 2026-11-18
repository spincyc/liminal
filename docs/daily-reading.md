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

## Date calendar

Families who do not follow the 36-week school schedule can open the reading
for any calendar date, in any year (owner direction, 2026-11-18: the calendar
is not tied to one year). A level's **reading set** is 366 readings
(`src/lib/reading-calendar.js`):

- one for each of ten holidays: New Year's Day, Easter, Memorial Day,
  Independence Day, Labor Day, Columbus Day, Halloween, Veterans Day,
  Thanksgiving and Christmas (`HOLIDAYS`; Easter by the Gregorian computus,
  the Monday and Thursday holidays by their US rules);
- one for February 29, read only in leap years;
- a **sequence** of 355 readings for the other days, read in order from
  January 2 to December 31 with the holidays and February 29 set aside.

Every year has exactly 355 such days, so the same sequence fills any year,
and no reading repeats within a year. The 180 school nights are among a
level's readings; the rest are calendar readings. A level may have several
sets: years take them in turn from 2026 (`setOf`), so with one set every
year reads it, and with three a date's reading returns three years later.
For now each level has one set (owner direction, 2026-11-18: no more than
366 readings per level yet).

All levels share one set of spans per reading set (owner direction,
2026-11-17). A run of continued readings stays on consecutive sequence days
inside one span, so when one level reads a story over seven days, another may
read four days and then three, or five days and two single readings, and every
level starts something new on the same day. The fixed-date days (New Year's
Day, February 29, July 4, Halloween, Veterans Day, Christmas) always fall after
the same number of sequence days (`BREAKS`), so a span always ends there. The
moveable holidays (Easter, Memorial Day, Labor Day, Columbus Day,
Thanksgiving) fall at a different place each year; when one lands inside a
continued story, the story pauses for the holiday and goes on the next day
(about one to two pauses a year per level). A holiday's reading and February
29's stand alone (no `continuesFrom` or `continuesTo`).

A calendar reading may carry `holiday` (one of the keys in `HOLIDAYS`, such
as `"christmas"`) when it is written for that day; it is then read only on
that holiday, and a level has at most one per holiday in each set. A holiday
without a tagged reading reads a stand-in single reading, seasonal to its
month when the level has one, until a fitting reading is written. To add a
holiday reading within the 366, write it and retire one of the level's
weakest calendar readings in the same change (owner direction, 2026-11-18).

`content/reading-daily/calendar/spans.json` holds the spans
(`{ "schemaVersion": 2, "sets": [[lengths…]] }`, each set's lengths summing
to 355) and `calendar/<grade-key>.json` a level's sets
(`{ "schemaVersion": 2, "grade", "sets": [{ "anchors": { "<holiday>": id },
"leap": id, "sequence": [355 ids] }] }`). Every reading of a level is placed
exactly once (`--complete`). `node tools/layout-reading-calendar.js` lays out
every set afresh and reports; `--write` writes it. Each set keeps the readings
it has, readings in no set fill the first set short of 366 (whole runs only),
and a new set takes exactly 366 more per level. Within a level a story's runs
follow one another in reading order (a story begun in an earlier set comes
first), single readings from different works alternate, and a reading with
`months` lands in one of those months when it can. Short runs and single
nights give the shared spans room: a level made only of long runs can leave
another level without the single readings a span needs. The check validates
the committed files rather than recomputing them; regenerate only
deliberately, because a new layout moves readings to different dates.

Calendar readings live in `content/reading-daily/extra/<grade-key>/<work-id>.json`:

```json
{ "schemaVersion": 1, "grade": 5, "work": "<library work id>", "readings": [ … ] }
```

A calendar reading has every field of a school night except `week` and `day`;
its ID is `reading-<grade-key>-<work-id>-<nn>` in reading order, it cites a
range of its library work ([reading library](reading-library.md)), and it may
carry `months` (1–12) when the text is genuinely seasonal, and `holiday` when
it is written for a holiday (see above). Continued readings
link neighbours in the file, at most ten nights in one run. Every rule of this
document applies to them unchanged: authentic text, the grade's time budget,
three or more original text-specific questions with notes and exact evidence,
no duplicates within or between levels.

To write a work's calendar readings, author a compact spec outside the
repository (its format is in the header of `tools/build-extra-readings.js`)
and build the file from it:

```sh
node tools/build-extra-readings.js <spec.js>           # report words, minutes and problems
node tools/build-extra-readings.js <spec.js> --write   # write extra/<grade-key>/<work-id>.json
node tools/check-daily-reading.js --complete
```

The tool numbers the readings and questions, writes each locator from the
resolved text, computes `textHash`, links continued readings both ways, and
refuses evidence missing from the cited text, fewer than three questions,
overlapping ranges, and continued readings that do not start where the
previous one ends (only heading blocks may lie between them, so chapter
headings stay out of the nights). Edit the spec and rebuild rather than
editing the written file by hand.

## Browsing and reading online

The Readings area uses one vocabulary: **Readings** (the area), **Nightly
readings** (`daily-reading.html`), **Library** (`library.html`), **Reading
level**, **Year plans** and **Weekly lessons**. Each view opens with one
breadcrumb (Readings › Grade 5 › Week 3, Day 2) and its document title carries
the same place, so tabs and history stay distinguishable.

Routes of `daily-reading.html` (parsed by `view` in `src/lib/daily-reading.js`;
an unrecognized part falls back to the nearest valid view and says so):

| Route | View |
| --- | --- |
| (none) | Year of the remembered grade, with Tonight |
| `#browse/<grade>[/<week>]` | Year, with that week open |
| `#<grade>/<week>/<day>` | A school night |
| `#<grade>/date[/<YYYY-MM-DD>]` | The reading for a calendar date (default today) |
| `#<grade>/month/<YYYY-MM>` | A month of the date calendar |
| `#<grade>/reading/<reading-id>` | Any reading by ID (school-night IDs redirect to their night) |
| `#print[/date/<YYYY-MM-DD>\|/dates/<first>/<last>\|/night/<week>/<day>][/<grade>,<grade>…]` | Print readings for several levels |

`<grade>` is the grade key (`k`, `1`–`12`, `a1`…). `library.html` has `#<work-id>`,
`#<work-id>/<reading-id>` (the passage marked as current) and `#<work-id>/b<n>`
(a block of the text).

**Year.** One grade's school year as a single column of 36 weeks. Each week's
summary names its works and total minutes; the current week is marked and
opens first, and "Go to week" (with Go or Enter) opens any other. An open week lists five
nights with title, author, minutes, genre and, only when the grade mixes
modes, the reading mode. Continued readings say "Part 2 of 5 · began Week 3,
Day 4". Search matches every word against titles, authors, works and genres,
ignoring case and accents; "Kind" narrows by genre family (Poetry, Stories,
Myth and legend, Nonfiction, Drama, Other: `genreFamily` derives them from the
free-text genres without changing content), and "Reading" by mode when the
grade has more than one. Printing the Year opens every week as a reading log
with a box per night.

**Tonight.** Above the year, a card offers up to three places: tonight's night
in a saved [reading-level plan](reading-level.md) (loaded only when a plan
exists), the last night opened and the one after it, and today's date reading
when the level has a calendar; on a first visit without one, the level's
first night. The page
remembers the grade, the last night and the last date in `localStorage`
(`liminal:readings:v1`, parsed as untrusted data and ignored when storage is
unavailable); nothing leaves the browser.

**Reading.** A school night, a date and a reading by ID share one reader. A
compact toolbar holds Grade, Week and Day (or Date), Previous and Next, and a
**More** menu: print student copy, print adult copy with discussion help,
download the student copy (HTML), Generate PDF ([printing](printing.md)),
First and Last night, and links to the month and the day print. On phones the toolbar is one row. Under the title a
**Before you read** disclosure gives the time, reading mode, challenge,
discussion focus and any content note; it is open for adult read-aloud and
shared reading. A continued reading says "Part 2 of 3 · continued from Week 3,
Day 1" with links to its neighbours. The questions follow the text under
"Talk about it", with one **Show discussion help** toggle for all facilitator
notes. **Source and rights** holds the full record and the time, and links to
the passage in the library. The bottom bar names its destinations ("‹ Previous:
Week 3, Day 1"). Selector changes keep focus on the selector; the previous
reading stays mounted while the next loads. Changing grade keeps the week and
day, or the date.

**Cross-references**, all computed from built data rather than authored:
the passage in its full library work; the next date the reading falls on in
the date calendar, and for a school night its date; the other readings from
the same work (the nearest six, then all in the library) and the author's other
library works; Year plans and Weekly lessons in the area navigation, which keep
the grade and week; from each Common Core reading unit of the year plan, the
nightly readings for its weeks; and from each weekly reading lesson, that
week's nights.

**Date.** The reader shows the date's reading with the date, the holiday's
name on a holiday, when the reading returns ("Christmas · this reading returns
on Saturday, December 25, 2027", from `dayNote`) and, when the reading is also
a school night, a link to it. Previous and Next move a day; a continued
reading's part links skip a holiday that pauses it. More offers Today, the
month and the day print. A level without a calendar says so and links to its
school year. **Month** shows a level's month as seven columns on wide screens
and a list of days on phones. A bar joins the days of one continued story, a
mark starts each shared span (the days on which every level begins something
new), and a holiday shows its name with an accent rule. The note under the
heading says when readings return and names the month's holidays. The Year
view's calendar link opens at this month.

**Print readings.** Choose a range of calendar dates (From and Through, up to
31 days; one date is a range of one) or a school night, and any levels; the
preview lists what each level prints, date by date with holidays named, or why
it cannot (a level without a date calendar, a last date before the first, a
range longer than a month). A print link without a day opens today's date when
a chosen level has a calendar, otherwise a school night. **Make one PDF**
typesets a single document (`LiminalReadingTeX.printTeX`): level by level in
the order listed, each level's readings in date order, and every reading
starting on an odd page, with a blank verso inserted where needed, so
two-sided printing gives each reading sheets of its own. Footers name a school
night by week and day and a calendar reading by its date. The view loads each
reading's file a few at a time; the largest print (31 days, 13 levels: 403
readings, about 850 pages) typesets in seconds. Without the typesetter the
button is disabled and says so. **Print from this browser** prints each
reading's student copy on a new page; on a two-sided printer a reading may then
share a sheet with the one before it, which the page says.

Printed readings use bundled Computer Modern Unicode Serif, 10-point body type,
two columns, a centered title and author, and a small footer containing the grade,
week, day, and Liminal. Grade/week/day appear only in the footer when printed.
Reading and Questions have distinct headings and dividers, followed by a compact
Source note. Every grade prints the complete bibliographic credit (including
any translator), a short US public-domain statement, a readable source link, and
the suggested reading/discussion time. “Read independently” is omitted from
print; adult/shared reading guidance remains when applicable.
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
A date, a reading by ID and the day print load the level's calendar
(`calendar/<grade-key>.json`, about 100 KB, only for levels the index marks
`calendar: true`) and one reading, `readings/<grade-key>/<reading-id>.json`
(the reading and its source). The library loads its index, then per work its
`meta.json` and one text chunk at a time.
`tools/smoke-static.js` compares every browse and week file with its source,
and checks that reading files and calendars match the index.

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
plain text, with no trusted HTML or UI instructions embedded in reading blocks. Since 2026-11-17 a night normally cites a range of a
[reading library](reading-library.md) work instead of carrying `blocks`, and
the grade's `sources` list holds only records not yet moved into the library;
the loader resolves both, so the example below shows the resolved shape.

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
