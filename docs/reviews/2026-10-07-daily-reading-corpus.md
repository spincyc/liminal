# Daily reading corpus review — 2026-10-07 to 2026-10-08

**Status:** the K–12 corpus is complete and has been reviewed. It holds 13
grades × 180 nights: 2,340 authentic public-domain readings with 7,122
discussion questions from 180 bibliographic source records. Every grade
passed an independent sampled review. Every grade was then repaired, and the
repairs were checked by a delta review. This is agent review, not human
editorial approval. The limits are stated at the end.

The [content contract](../daily-reading.md) governs. It covers:

- authentic supplied text from identified, dated editions
- US rights evidence
- excerpt boundaries and their declaration
- time budgets
- quoted evidence
- canonical text hashes

## Final inventory

| Grade | Nights | Questions | Sources | Authors | Minutes | SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Kindergarten | 180 | 540 | 21 | 13 | 10 | `901e8cd44515f08901cdb8a284b710af6732b17d5f30f4a533299e94690df9d0` |
| Grade 1 | 180 | 552 | 13 | 11 | 10–15 | `f8395faf4ceae5ea63cb9272d769cf53ab20357a4170a44fa9d7174579f09397` |
| Grade 2 | 180 | 554 | 20 | 12 | 10–15 | `22d0525033e81bf78d220cbd56963570cc581f1d89552f746ce683278c1bb014` |
| Grade 3 | 180 | 546 | 13 | 11 | 15–20 | `76a2527bafe14de25a988518b4bc592df3af7c2cdf1b0516674e23141ae75fdd` |
| Grade 4 | 180 | 545 | 12 | 12 | 15–20 | `db32a230bc3b141f8ef35a2e03617c727104a9b554551e6b81e9e83688ed1c61` |
| Grade 5 | 180 | 555 | 12 | 11 | 16–20 | `73a9423c6b3574a0fe59f48970de3cfe68874799bc026eba17224785876d5634` |
| Grade 6 | 180 | 551 | 12 | 12 | 21–25 | `4981671828f52f8cfbd8965e3f8a1104caf883cc48fe61250a943b0fb29ea859` |
| Grade 7 | 180 | 540 | 11 | 11 | 20–25 | `32b5c1ecd5d0b11fa6c5ddcf4c5fb69b6ced15aa3fe71e0512f7d0cfb883ad76` |
| Grade 8 | 180 | 560 | 11 | 11 | 22–25 | `d9758dc9c586791c7812f8e543e3afd935711a04e9cd1861115957593d6a87f3` |
| Grade 9 | 180 | 548 | 14 | 12 | 25–29 | `6db4f7af9a8c60ca6983ab2ede9329182689560366bbe6bb27cd3892f56bbdab` |
| Grade 10 | 180 | 550 | 14 | 14 | 26–30 | `710ac5d497e15a80124f06c800bc61ea5056b2c6e419a420fc1dbaa5393e97fb` |
| Grade 11 | 180 | 541 | 13 | 12 | 25–30 | `8d65322ae9e640de80d870212caf174c691fbae42d9ebca342d3e8ba991ac4de` |
| Grade 12 | 180 | 540 | 14 | 14 | 27–30 | `59b931c279ac318187556c46b8ef8c8bd4f3e8f8e9d5ec1233fd028bf4e5cf60` |

**Gate.** `node tools/check-daily-reading.js --complete` runs in `check-all`.
It enforces:

- complete calendars
- source references
- exact text hashes
- every evidence quote
- continuation reciprocity
- time ranges
- exact-duplicate exclusion across the corpus

**Novelty scan.** A separate 30-word normalized scan compared all 2,340 nights
with each other and with the 251 public-domain weekly passages. It found two
overlaps, and both are accepted:

- Grade 9's Frankenstein night quotes the *Ancient Mariner* stanza that Grade
  8 supplies.
- The two consecutive parts of the cumulative tale *The Old Woman and Her Pig*
  in Kindergarten repeat its growing refrain.

## Owner decisions that shaped the corpus

| Date | Decision |
| --- | --- |
| 2026-10-07 | Final review is **sampled**. Every selection is checked mechanically, every prompt is read, and there are 12 or more blind cold reads per grade, instead of the 36 originally planned. |
| 2026-10-07 | **Do not censor** exemplary American and English literature. Boundaries follow the work's own units and time budget, and notes explain rather than tell readers to skip or soften (contract, "Time and progression"). |
| 2026-10-07 | **No minimum genre share.** Each grade keeps its mix (3–61% documentary or essay prose). |
| 2026-10-08 | **Misprints versus missing type.** A wrong letter stays as printed. A blank where type failed to print may be supplied from a later printing, declared. |

## Review coverage

Four independent band reviewers, none of them authors, each:

- re-matched every selection against their own downloads or dated witnesses;
- checked every source's edition and rights evidence;
- read every prompt;
- cold-read at least 12 nights per grade blind, before opening the notes;
- measured timing;
- scanned for overlap;
- after the no-censorship directive, examined every excerpt boundary and note
  for avoidance.

After repair, the same reviewers delta-checked each grade. They re-ran the
mechanical checks, cold-read new and restored nights blind, and image-checked
samples of corrections.

| Band | Record | Delta review |
| --- | --- | --- |
| K–2 | [Early review](2026-10-07-daily-reading-review-early.md) | All findings resolved; none new |
| 3–5 | [Primary review](2026-10-07-daily-reading-review-primary.md) | All resolved; Grade 4's spacing regressions from its collation fixed |
| 6–8 | [Middle review](2026-10-07-daily-reading-review-middle.md) | All resolved; one new slip ("lore" for "love") fixed |
| 9–12 | [High review](2026-10-07-daily-reading-review-high.md) | All resolved; new transcription slips fixed |

## What the reviews caught

**Editions that were not what they claimed.** Several Project Gutenberg or
Wikisource texts were dated only by title-page images added later, or did not
match the edition named. Each affected selection was rebuilt against dated
scans, or the source was replaced:

| Work | Problem | Repair |
| --- | --- | --- |
| *Tom Sawyer* | Not the edition claimed | Rebuilt to the 1876 text; 200 differences decided on page images |
| Irving's *Sketch-Book* | Text matches none of the 1819–1864 printings | Dropped from Grade 8 |
| Andersen | Bot-imported, rewritten and Americanized text | Grade 2 re-transcribed from the 1888 Warne scan |
| Pyle's *Robin Hood* | Gutenberg is a later, cut text | Grade 4 rebuilt from three 1883 scans |
| *The Waste Land* | Normalized text, not the 1922 edition | Grade 11 checked line by line against the 1922 facsimile |
| Ida B. Wells | No dated witness found | Replaced by Riis |
| Ewing, *Peter Rabbit* | No dated witness found | Removed |
| Jefferies | Normalized Gutenberg text | Grade 6 collated against the 1879 scan |
| Lamb | Proofread-once transcription | Grade 5 collated against the 1908 scan |
| Little Men | Transcription drift | Grade 4 collated against two 1871 scans |
| Douglass | UNC transcription slips | Grade 9 corrected against the 1845 print |
| Ethan Frome | Blanks where type failed in the 1911 printing | Letters supplied and declared |

**Avoidance boundaries.** Under the no-censorship rule, scenes that had been cut
were restored on the works' own units. Examples include:

- Captain Brown's death and "Poor Peter" in *Cranford*
- Stave Four of *A Christmas Carol*
- the violent scenes and ending of *The Call of the Wild*
- Shimerda's suicide in *My Ántonia*
- the sled crash in *Ethan Frome*
- the killing floor in *The Jungle*
- the cave climax in *Tom Sawyer*
- Perseus, the Argonauts and Theseus in Kingsley
- the original similes in Pyle
- the Three Bears' ending

Notes that told readers not to say a word aloud, or that moralized in the
site's voice, were rewritten as fact.

**Smaller defects** were fixed and logged in each grade's commits. They
included lost lines (*Oedipus*), lost openings (Brown's legends, the
*Velveteen Rabbit*), stray markup and line joins, timing above the reading-rate
ceilings, and undeclared normalizations.

## Limits

- Punctuation was collated in full only where a reviewer or author says so.
  Elsewhere it was sampled, or compared through OCR, which cannot catch every
  mark.
- Page-image checks were samples. Collation through OCR depends on OCR quality.
- Timing figures are editorial estimates, not measured reading times.
- Literary judgment rests on the sampled cold reads, not on reading every
  night closely.
- US rights conclusions rest on the dated editions and repository
  determinations cited in each source record. They are not legal advice and
  make no claim of worldwide public-domain status.
- Independent agent review is not human editorial approval, classroom
  validation or a measured reading level.
