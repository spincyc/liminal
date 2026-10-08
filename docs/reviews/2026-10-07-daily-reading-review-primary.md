# Daily reading independent review: Grades 3–5

Date: 2026-10-07. Reviewer: an independent agent lane (`final-review-primary`), separate from the grade authors. It edited no corpus file. Earlier primary-band checkpoint scratch (`review-primary/`) is prior history only; every result below comes from fresh checks of the final files.

Contract reviewed against: `docs/daily-reading.md`. Grades 5 and 3 were reviewed at SHA-256 `547df876b128f36cd6733356c8b285188cf853b2531b812b239ae4654e8b5cb3`, which includes the 2026-10-07 owner directive against censoring exemplary literature. Grade 4 and the Grade 3 delta check used `c3ec5a9c4c3bf3f026999a2c3e811b7c1d993f87d80da19c4fc0b943baceef42`. That version adds the owner's decision (commit 34963bf) that there is no minimum share of documentary or essay prose, so the genre-share findings below are closed by that decision. The 2026-10-08 delta reviews (end of this report) used `806d2fc9e9e79ece3b297fbf477e2c87c5cad53d08fb090ca27aef45b511d1b2`. It adds the printed-packet style (commit 1af3c69) and the rule that misprints stay as printed while letters lost to failed type may be supplied (commit 785a1ed).

## Status by grade

| Grade | File and SHA-256 reviewed | Status |
| --- | --- | --- |
| 3 | `content/reading-daily/3.json`. Full review at `2586aef3c46d5f5c706a94ca0037faefb14d775098d0a757b9a430e7fd1f8452`; repair (commit 1f23b11) delta-checked at `ec4e467ef52c533ba4cc5dac75f0e34ea4885b262b3d94281cdb7f36c17a7571` | **Reviewed; repair verified**. Most findings are resolved; the few notes that remain are listed in the delta check. Final notes (commit 4b85a2c) confirmed at `76a2527b…` on 2026-10-08. |
| 4 | `content/reading-daily/4.json`, `8e3b05925246a9eb4b09c1165e061b4e4743bf7d7e73d96ecc7c73e6e2f1a477` (commit f6d9518; unchanged from start to finish) | **Reviewed**: full sampled scope; should-fix findings below. Repair delta-reviewed on 2026-10-08 at `f35625c0…`: most findings resolved, but the *Little Men* collation introduced 7 spacing errors (new should-fix). |
| 5 | `content/reading-daily/5.json`, `b359f458a15b0b2cf88b91967add35a61ebc8d63ac4eb4b7d043395430599caa` (unchanged from start to finish) | **Reviewed**: full sampled scope; should-fix findings below. Repair (commit 111fd8b) delta-reviewed on 2026-10-08 at `a11913eb…`: every should-fix finding resolved. |

No grade has a blocking finding. Grades 4 and 5 have should-fix findings in two areas: text errors inherited from unvalidated (proofread level 3) transcriptions, and excerpt boundaries that avoid difficult material (the owner's censorship directive). Grade 3's repair resolved its equivalents. All three grades were reviewed by the same method, set out for Grade 5 below. Looking-Glass (Grade 3) was collated against the University of Florida 1899 scan OCR; Pyle (Grade 4) against three Scribner-plate scan OCRs.

## Scope completed (Grade 5) versus the brief

| Brief item | Done | Notes |
| --- | --- | --- |
| Bind hash | Yes | Snapshot taken before any check; hash rechecked at the end |
| Fidelity, all 180 | Yes | Independent downloads of all 12 sources, plus the dated witnesses for Jackson (1891), Alcott (c1896) and Muir (1913). Scan images were used to adjudicate every variant. |
| Rights and edition, every source | Yes | Title or copyright leaf and repository status, checked for each of the 12 sources |
| Prompts, all 540 | Yes | Every prompt and every facilitator note read |
| Cold reads, 12 blind | Yes | Weeks 1, 4, …, 34 with the brief's weekday rule; 36 answers recorded before notes were opened |
| Timing, all 180 | Yes | Words per reading minute for every night |
| Progression and age fit | Yes | All titles, challenges, focuses, contexts and content notes read; excerpt gaps mapped in every prose source |
| Novelty | Yes | 30-word normalized shingles against the 12 other current grade files and the 251 weekly records |
| Beyond the brief | Partly | Visual print collation of 13 level-3 Wikisource pages (all 7 level-3 Naidu poems, Good Hours, 2 Lamb pages) and 3 validated pages (Rose Pogonias, The Snake) |

## Grade 5 results

| Measure | Result |
| --- | --- |
| Validator | `node tools/check-daily-reading.js` passes |
| Structure | 180 nights, 540 questions, 12 sources, 11 authors whose text is used (no Charles Lamb tale is selected) |
| Hashes | 180/180 recomputed `textHash` values match |
| Evidence | 545/545 evidence strings occur literally in their selection |
| Fidelity to declared source | 179/180 contiguous after declared normalization and documented variants. The failure is w35-d5, which omits the printed heading "SONG". 164 matched on the first pass; 8 more needed only declared caption, picture-marker or section-break handling. |
| Documented variants | 8 in total. 4 are confirmed on scans: Alcott "weet" and "buttonholes", Muir "flying", Frost "sun's". 3 Alcott reversals are contradicted by the 1896 scan (w12-d3, w15-d5, w17-d1). The 1887 supplement "mischief, is" agrees with the 1869 reading; the 1887 scan was not viewed. |
| Fidelity to dated print | The Naidu, Good Hours and Lamb Wikisource pages are proofread level 3, not validated. They carry print errors into Grade 5. 13 level-3 pages checked; 6 deviate, affecting 6 nights. The 3 validated pages match print, once the author's documented "sun's" correction is applied. |
| Word-level witness collation | Jackson 12/12 and Muir 20/20 show no word variants beyond OCR noise. Alcott 20/20 matches apart from the flagged spots. |
| Cold reads | 12/12 blind to notes and evidence. 36/36 answers agree with the notes in substance. w01-d1 disclosure: the prior reviewer's answers for that night (not the notes) were glimpsed beforehand. |
| Timing | Prose runs 42–107 words per minute: shared reading peaks at 107 (w01-d1), independent at 104 (w13-d1). Totals are 16–20 minutes. Poems allow 6–9 minutes for 43–362 words. No night exceeds the brief's thresholds. |
| Novelty | 0 overlaps of 30 words or more. The scanner was self-tested on the accepted Grade 8/9 Ancient Mariner overlap and finds it. |

Rights and edition evidence, checked directly. All selections are original English; no translator is needed.

| Source | Evidence checked | Verdict |
| --- | --- | --- |
| Grahame | PG 27805 leaf: Scribner, MCMXIII, "Published October, 1913"; explicit US public domain | Sound |
| Naidu | Wikisource scan title page: Heinemann, London, 1905 | Sound (text errors below) |
| Jackson | IA scan title page: Roberts Brothers, Somerset Street, 1891; ©1886 leaf. PG 9825 explicit US public domain. | Sound |
| Frost, *A Boy's Will* | Scan title page: Holt, New York, 1915 | Sound |
| Frost, *North of Boston* | Scan: Holt 1915; "Second edition, 1915; reprinted … December, 1915" | Sound |
| Dickinson | Scan: Roberts Brothers 1891, ©1891 | Sound |
| Burnett | PG 17396 leaf: Stokes, ©1911, "August, 1911"; explicit US public domain | Sound |
| Alcott | IA NYPL copy: c1896, "visible notice of copyright; stated date is 1896"; the impression is honestly described as undated | Sound (text spots below) |
| Kingsley | PG 677: "Transcribed from the 1889 Macmillan and Co. edition"; explicit US public domain | Sound |
| Nesbit | Indiana TEI: Wells Gardner, 1906, 309 pp.; verso "Copyright, 1906 … PRINTED IN GREAT BRITAIN … LTD." | Rights sound. The verso suggests a later, undated impression (note). |
| Muir | PG 18359 is an undated 14th impression; IA Boston Public Library copy dated 1913. My word-level collation agrees. | Sound |
| Lamb | Scan leaf: Dent/Dutton, "First Edition, February 1906 … Reprinted … January 1908" | Rights sound (text errors below) |

## Findings (Grade 5)

| Grade | Night / source | Severity | Finding | Evidence |
| --- | --- | --- | --- | --- |
| 5 | w35-d5 (Lamb, *Twelfth Night*) | should-fix | The printed heading "SONG" before "Come away, come away, Death" is silently omitted | Proofread p. 228 wikitext `{{c|SONG}}`. Add a `heading` block "SONG" before the song stanza. |
| 5 | w12-d3 (Alcott) | should-fix | "mantelpiece" is not supported by the scan. The 1896 copy breaks "mantel-/piece" at a line end and prints "mantel-piece" mid-line twice elsewhere. | IA littlewomenormeg00alco2, p. 62 and OCR. Restore "mantel-piece". |
| 5 | w15-d5 (Alcott) | should-fix | "with merriment Much elated" lacks a period. The 1896 p. 64 shows a faint period after "riment". | Zoomed scan, leaf 86. Restore "merriment." |
| 5 | w17-d1 (Alcott) | should-fix | "I remain "'Your" drops a damaged punctuation mark visible after "main" on p. 79 | Zoomed scan, leaf 101. Restore "I remain," (the 1869 reading and Gutenberg's) or record the uncertainty. Also correct the `edition` text, which claims five reversals "follow the scan"; only two do. |
| 5 | w03-d5 (Naidu) | should-fix | Reads "pray to the morning lights"; the print reads "pray / to the morning light," | Golden Threshold scan p. 31 |
| 5 | w03-d4 (Naidu) | should-fix | Reads "solemn and still."; the print reads "solemn and still," | Scan p. 30 |
| 5 | w12-d4 (Naidu) | should-fix | Reads "afloat on the tide." and "fingers and feet."; the print has commas after both | Scan p. 39. The source `edition` also claims "original punctuation and wording are retained". Collate all 8 Naidu poems. |
| 5 | w36-d3 (Frost, Good Hours) | should-fix | Three punctuation errors. The print reads "talk," (line 2), "found." (line 10) and "leave," (line 15). | *North of Boston* scan p. 137 (level-3 page) |
| 5 | w31-d1 (Lamb) | should-fix | Keeps known transcription errors: `daughter"s`, `father"s`, "stem" (print: "stern") and "duke" (print: "Duke"). The content note tells students they are retained. | Scan p. 18. Correct to print and remove that sentence from the note. |
| 5 | Lamb, all 20 nights | should-fix | Every page is proofread level 3. A second sampled page (w35-d4) also differs: "exclaimed:" where the print has "exclaimed,", and "O then," where it has "O then;". | Scan p. 224. Collate all 20 selections against the 1908 scan and document the corrections. |
| 5 | w20-d3 (Nesbit) | should-fix | Keeps "We'll male it our great day". The content note admits the typo; PG 1874 reads "make". | Resolve against a dated print witness, document it, and drop that note sentence. |
| 5 | Genre range | closed (owner decision) | Documentary/essay prose is only Muir's memoir: 20/180 nights (11%). The owner decided on 2026-10-07 to keep each grade's current mix, with no minimum share. | Recorded for information only |
| 5 | Content notes, about 30 nights | should-fix (pattern) | Notes moralize beyond history or authorial purpose: "neither is a healthy model of love" (w36-d2), "The violence is brief but wrong" (w34-d2), "not to be copied" (w20-d4), "not an exercise plan for children" (w28-d3), "Do not taste unknown plants" (w29-d4), "not a suggested diet" (w23-d5). | The rewritten contract limits notes to history or the author's purpose. Trim these to context. |
| 5 | Progression, weeks 31–36 | note | The stage is titled "Sustain an independent reading", yet 16/30 nights are shared (weeks 13–24 were 53/60 independent) | Mode tally. Re-label, or explain the return to shared reading for Lamb's older syntax. |
| 5 | Lamb nights | note | All four tales are Mary Lamb's, but `day.author` is unset and the source credits "Charles Lamb and Mary Lamb". Contexts name Mary in only three places. | Set `day.author: "Mary Lamb"` on the 20 nights. Effective author count is 11. |
| 5 | Nesbit edition | note | "1906" rests on Indiana's catalogue; the verso's "PRINTED IN GREAT BRITAIN … LTD." suggests a later impression of the ©1906 text | Describe it as "Wells Gardner text, copyright 1906; printing undated". |
| 5 | Muir sequence | note | Excerpts run out of chronological order (boyhood at w24 and w30 after university at w23 and w29). Contexts label them as separate excerpts. | Locator order |
| 5 | Prompt style | note | Several prompts quote text without quotation marks ("the parenthesis so he thought", "Fit days", "In vain", "Mayhap") | All referents are visible in the text; this is clarity only |

### Censorship directive (Grade 5)

Every gap between excerpts of each prose source was mapped and read. These boundaries or omissions remove difficult material where length does not explain the cut.

| Night | Severity | What was avoided | Merit-based boundary |
| --- | --- | --- | --- |
| w07-d3 → w07-d4 (*Secret Garden* ch. X) | should-fix | A 203-word gap that begins "She was imperious and Indian" and contains Dickon's first entry into the garden, the chapter's climax. w07-d3 is only 464 words in 9 minutes. w07-d4's context summarizes the cut scene instead. | Extend w07-d3 to the chapter end ("…like as if a body was in a dream.") and link w07-d3 and w07-d4 as continuous |
| w05-d4 (*Secret Garden* ch. X) | should-fix | Starts one paragraph after "…spoken to her as she would have spoken to a native … salaam to his masters" | Begin at "During that week of sunshine, she became more intimate with Ben Weatherstaff." (about 150 words) |
| w25-d2 (*Heroes*, Perseus) | should-fix | Stops inside Part III, "How Perseus Slew the Gorgon", just before the slaying; the context says "No attack occurs in this selection". Perseus gets 2 nights with no deed: Medusa, Andromeda and Polydectes are all absent. | Give Perseus his central deed: the slaying of the Gorgon and/or the rescue of Andromeda |
| w27-d3 → w27-d4 (*Heroes*, Argonauts) | should-fix | A 6,012-word gap removes the fire-breathing bulls, the dragon's-teeth warriors, the winning of the fleece and the flight. The w27-d3 note says "no fighting occurs in this selection"; w27-d4 begins "After obtaining the fleece". | Include the winning of the fleece (Part IV, end), for example in place of the Phaeacian nights w27-d4 to w28-d2 |
| w28-d5 (*Heroes*, Theseus) | should-fix | Opens Part II, "How Theseus Slew the Devourers of Men", and stops before the first devourer; the Minotaur is also absent | Include at least one devourer episode or the Minotaur (Part III) |
| w32-d3 → w32-d4 (Lamb, *As You Like It*) | should-fix | The 863-word gap is exactly the wrestling match ("…had just killed many men…"), where Rosalind and Orlando fall in love. The w32-d4 context says "after an intervening scene". | Give the match its own night, or extend w32-d3 through it |
| w17-d3 → w17-d4 (*Little Women* ch. XI) | should-fix | A 2,032-word gap removes Pip the canary's death from neglect and his funeral, the consequence on which Marmee's lesson rests. The context mentions only "a disastrous dinner". | Include the dinner and Pip's death as a night before w17-d4 |
| w30-d3 (Muir ch. VI) | should-fix (inferred) | Stops at the section break right before Hickory Hill, where Muir digs a 90-foot well and "my life was all but lost in deadly choke-damp". The near-drowning (ch. IV) and the floggings (ch. I) are also absent, while the 20 non-contiguous Muir nights favour invention and nature. | Include the well-digging episode as a night |
| *Secret Garden* opening | note (pattern-based) | The arc begins at ch. VII; the India, cholera, Ayah and "native" chapters (I–IV) are absent. The two micro-gaps above suggest avoidance, but the choice is also budget-consistent. | Consider opening the arc with chapter I |
| *Little Women* ch. VII–VIII; *Willows* ch. III | note (pattern-based) | Amy's palm-striking, Amy's fall through the ice, and the Wild Wood are absent as whole-chapter skips | Weigh them on merit if the arcs are revised |

No Grade 5 note tells readers to skip, soften or substitute words. Elsewhere in Grade 5, period language and violence are kept with context: a servant hitting Peter, Otter cuffing the rabbit, the word "savage" in Kingsley, the beating of Dromio.

## Grade 3 results

Full sampled scope, as for Grade 5: every source downloaded independently; all 180 selections, hashes and evidence strings checked; every prompt and note read; 12 blind cold reads; timing, progression, excerpt-gap and novelty checks.

| Measure | Result |
| --- | --- |
| Validator | Passes |
| Structure | 180 nights, 540 questions, 13 sources, 11 authors |
| Hashes | 180/180 match |
| Evidence | 540/540 occur literally |
| Fidelity to declared source | 180/180 contiguous after declared normalization: page numbers, captions, navigation, and image-only initial letters restored from alt text. The four Looking-Glass selections that differ from Kellscraft (w25-d2, w25-d3, w25-d4, w28-d4) differ only by the author's documented scan repairs. One undeclared omission: the Rackham *Alice* chapter-title sidenotes (e.g., "The Queen's Croquet-Ground") are dropped, while some selections keep "CHAPTER VIII"-style headings (note). |
| Looking-Glass collation | All 20 nights collated word for word against the UF 1899 scan OCR (UF00086461): no word variants beyond OCR noise, which also confirms the documented word repairs. Punctuation was not repaired everywhere; see the findings. The 1899 misprints "I afraid I'm" and "borogroves" are printed in that edition and are correctly retained. |
| Cold reads | 12/12 blind to notes and evidence (the coordinator's message had quoted w07-d2 metadata). 36/36 answers agree with the notes in substance. |
| Timing | Prose runs 13–98 words per minute (the low values are short Comstock passages). Shared reading peaks at 98 (w17-d1); adult read-aloud at 94 (w32-d3, 1,320 words in 14 minutes). Totals are 15–20 minutes. No night exceeds the thresholds. |
| Modes | 151 shared, 18 adult read-aloud, 11 independent (mostly short poems or Comstock, plus late Fauntleroy scenes). This suits the start of the 3–5 band. |
| Novelty | 0 overlaps of 30 words or more against the 12 other current grade files and the 251 weekly records |

Rights and edition evidence, checked directly. Every selection is original English. All ten Gutenberg items are explicitly "Public domain in the USA".

| Source | Evidence | Verdict |
| --- | --- | --- |
| Blake | PG 1934 leaf: London, R. Brimley Johnson; Guildford, A. C. Curtis; MDCCCCI | Sound |
| Montgomery | Gutenberg Canada header: Toronto, McClelland, Goodchild & Stewart, 1916 (first edition) | Sound |
| Barbauld | UPenn transcription: London, J. Johnson, MDCCLXXXI | Sound |
| Comstock | PG leaf: sixth edition, Comstock Publishing 1916; ©1911 | Sound |
| Kipling | PG leaf: Doubleday, Page 1912; ©1912 | Sound |
| Nesbit | Dover bibliographical note (PG page image f003): "an unabridged republication of the work originally published by Harper & Brothers, New York, in 1900" | Rights sound; the text is identified by the publisher's leaf. Not collated with a 1900 copy (note). |
| Carroll, *Alice* | UF METS: Heinemann/Doubleday, "ca. 1916", copyright 1907 | Sound. publicationYear 1916 is a catalogue estimate; the identified edition year is 1907 (note). |
| Carroll, *Looking-Glass* | UF scan and METS: Mansfield & Wessels, "COPYRIGHT, 1899", catalogued [1899] | Rights sound. The Kellscraft carrier is a hobbyist transcription (findings). |
| Ingelow | PG leaf: Little, Brown 1919, Author's Edition | Sound |
| Roberts | PG leaf: L. C. Page; published May 1902; tenth impression July 1907 | Sound |
| Hawthorne | PG leaf: Duffield, MCMX; ©1910 | Sound |
| Burnett (May; October) | *St. Nicholas* XIII (Century), May 1886 and October 1886 mastheads, ©1886 | Sound |

**Genre balance, stated plainly.** The year has 75 fantasy nights (42%), 35 poetry (19%), 15 realistic animal stories, 15 myth retellings, 15 Fauntleroy and 4 Kipling. Documentary or essay prose is only 21 nights (12%): 19 Comstock nature-study passages and 2 Barbauld prose hymns, averaging about 230 words, the shortest readings of the year. Carroll alone supplies 40 nights (22%). This satisfies the contract's bare requirement that documentary prose appear, but it does **not** meet the brief's narrative/poetry/documentary-or-essay expectation for an 8-year-old's year, or the user's request for "an essay or article" read with a documentary eye. Documentary and essay prose should reach about a quarter of the year, in connected runs rather than isolated 100–300-word paragraphs. Examples: longer Comstock sequences, Burroughs's *Squirrels and Other Fur-Bearers* (1900), Buckley's *The Fairy-Land of Science* (1879). Trimming the Carroll and fantasy share would make room. *Superseded:* the owner then decided (2026-10-07, commit 34963bf) to keep each grade's current mix with no minimum share, so this is recorded rather than required.

## Findings (Grade 3)

| Grade | Night / source | Severity | Finding | Evidence |
| --- | --- | --- | --- | --- |
| 3 | w28-d3 (*Looking-Glass*) | should-fix | Kellscraft errors not repaired: "you ask l" (print: "ask!"); "high wall-such" (print: "wall— such"); "'How old are you? "Alice" (print: "'How old are you?'" Alice) | UF 1899 OCR and scan |
| 3 | w27-d2 (*Looking-Glass*, The Walrus and the Carpenter) | should-fix | "They said, ,it would be grand!'" (print: "They said, 'it would be grand!'") | UF OCR |
| 3 | w28-d4, w26-d5, w28-d2 (*Looking-Glass*) | should-fix | A stray `'` before "Ah, you should see 'em"; "Dash :" (print: "Dash:"); "take 'em away ." (stray space) | UF OCR |
| 3 | *Looking-Glass*, all 20 nights | should-fix | The author repaired six Kellscraft errors, but punctuation was never collated in full; the carrier is a hobbyist OCR transcription | Collate all 20 against the UF scan, character by character, and record the corrections in `edition`. |
| 3 | Comstock, 19 nights, plus about 15 other content notes | should-fix (pattern) | The same disclaimer ("not an instruction to handle wild animals or taste plants") is repeated on every Comstock night. Others: "not activities to imitate" (w08-d1), "not a model for real-life safety" (w12-d2), "do not imitate them" (w13-d3). | Same contract basis as the Grade 5 pattern finding |
| 3 | Genre range | closed (owner decision) | See the genre verdict above. The owner decided to keep each grade's current mix, with no minimum share. | Genre tally |
| 3 | Nesbit "part 1–5" titles | note | The Ice Dragon has three internal gaps (426, 417 and 413 words), and the Book of Beasts, Deliverers and Dragon Tamers each have one (66, 290 and 493 words). "Part N" implies continuous coverage. | Gap map. Title these as excerpts, or close the gaps. |
| 3 | *Alice* sidenotes | note | Printed chapter titles are omitted without declaration; "CHAPTER" headings are kept inconsistently | PG 28885 `sidenote` elements |
| 3 | Fauntleroy | note | Jumps from the May 1886 chapter VII to mid-chapter XIV, so the claimant plot is absent. Contexts bridge the gap; the choice looks budget-driven. | Locators |
| 3 | w19-d4 notes | note | Missing spaces: "is150–200", "range200–300", "with200", "The22-inch" | Notes text |
| 3 | w05-d2 content note | note | Locates "a caricature of Irish pronunciation in 'Hi-ber-ni-an'". The joke is "ating" for "eating"; "Hi-ber-ni-an" names the Mariner as Irish. | Selection text |
| 3 | Authors | note | 11 distinct authors, against the contract's "where appropriate, twelve" | Source list |

### Censorship directive (Grade 3)

| Night | Severity | What was avoided | Merit-based boundary |
| --- | --- | --- | --- |
| w07-d2 → w07-d3 (Roberts, "The Moonlight Trails") | should-fix | The context says "This passage stops before they set them." The next 1,155 words are the story's climax: the snares are set, the boy finds the rabbits dead in them ("the cruel marks of the noose"), weeps, and breaks the snares ("We won't snare any more rabbits, Andy"). w07-d2 ends on the sentence foreshadowing this. The 980-word gap before w07-d2, introducing the boy as "fiercely intolerant" of cruelty (drowned kittens, crushed snakes), is also cut. | Complete the story: run w07-d2 through "…philosophically followed the penitent." over two nights, and restore the boy's introduction |
| w08-d3 (Roberts, "The Homesickness of Kehonka") | should-fix | The content note says the "fatal predation ending … is not included here" | Include the story's ending as a night |
| w09-d2 → w09-d3 (Roberts, "In Panoply of Spears") | should-fix | "After an omitted encounter with a dog": the 615 words where a dog attacks the porcupine and the farmer tries to club it. w09-d2 is only 316 words in 6 minutes. | Extend w09-d2 through the dog encounter |
| w17-d2 → w17-d3 (*Mopsa*) | should-fix | 532 words of Lady Betty's history: spurred and beaten at a jump, "she fell and broke both her forelegs. Then they shot her." w17-d3's context calls it "an earlier, unselected scene". | Include it at the end of w17-d2 or the start of w17-d3 |
| w17-d3 → w17-d4 (*Mopsa*) | should-fix | "After an omitted dangerous episode on the river": 863 words in which a raven kills and eats one of Jack's four fairies, a plot consequence of Jack's own mistake | Restore it as an adult read-aloud night |
| w07-d4; w09-d5 (Roberts) | note (pattern-based) | "The Lord of the Air" stops before the eagle's capture (7,322 words omitted). A content note says the porcupine story's "later violent events" are outside the excerpt. Across the four Roberts stories, the predation and death that define the genre are consistently cut. | If Roberts stays, let each story reach its own ending |
| w31-d1 content note | note | "Pause if the child is distressed." This is not an instruction to skip or substitute words, but it invites interruption of a central scene. | Replace with context about Hawthorne's purpose |

No Grade 3 note tells readers to skip, soften or substitute words. Elsewhere Grade 3 keeps difficult material with context: the Walrus eating the oysters, dragons swallowing people, Blake's "Turk" and "heathen", the bear's death in a trap reported in w08-d5.

### Grade 3 repair: delta check (`ec4e467e…`)

The repair is commit 1f23b11; its change log is `.scratch/daily_reading_corpus/3/final/repair/changes.txt`.

| Check | Result |
| --- | --- |
| Mechanical re-run | Validator passes. Hashes 180/180. Evidence 557/557 literal. Every selection still matches its declared source, apart from the intended Looking-Glass corrections toward the 1899 print. |
| Looking-Glass | All 43 logged corrections (`glass-corrections-2.json`) target the defects found earlier. Five were checked on UF page images: p. 53 "To talk of many things;", p. 54 "'Do you admire the view?" with no closing quote, and on p. 78 "subject"—(" and "'How old are you?'" Alice. "ask!", "high wall -- such" and "'it would be grand!'" now read correctly. Word-level collation against the UF OCR improved (257 → 253 difference spans, all toward print), with no regressions. |
| Blind cold reads | w07-d4, w08-d4 and w17-d4, read before notes and evidence: 10/10 answers agree. Disclosure: I had seen their source text, but no notes, while mapping gaps earlier. |
| Timing | New and extended nights run 55–87 words per minute, totals 16–20 minutes |
| Novelty | Grade 4's scan against this file: 0 overlaps |

Status of the earlier Grade 3 findings:

| Finding | Status |
| --- | --- |
| Looking-Glass punctuation (w28-d3, w27-d2, w28-d4, w26-d5, w28-d2) and full collation | **Resolved** (sample verified on images) |
| Moonlight Trails: snares and the boy's change of heart; introduction | **Resolved**: introduction restored (w07-d2); snaring (w07-d4) and the ending (w07-d5) added |
| Kehonka's fatal ending | **Resolved** (w08-d4) |
| Dog encounter (In Panoply of Spears) and the story's ending | **Resolved** (w09-d2 extended; w09-d5 ending added) |
| Mopsa: Lady Betty; the raven kills a fairy | **Resolved** (w17-d3 extended; w17-d4 added) |
| Lord of the Air ending | **Resolved by removal**: the story is no longer read |
| Comstock boilerplate and other moralizing | **Largely resolved**. Four remain: w11-d2 "not recommended ways to treat children", w13-d1 "not medical advice", w13-d4 "not an activity to copy", w19-d2 "not as local gardening advice". |
| w31-d1 "Pause if the child is distressed" | **Resolved**: now gives Hawthorne's purpose |
| Nesbit "part N" titles; *Alice* sidenotes and headings; w19-d4 spacing; w05-d2 note | **Resolved**. Headings and sidenotes are now uniformly omitted and declared in `edition`. |
| Kehonka egg-taking passage (587 words after w08-d1) | **Remains, accepted as a note.** It is expository (taking the eggs; clipping the goslings' wings) and the context summarizes it. Restoring it would push w08-d1 to about 1,270 words, so the slot reason is credible. |
| Fauntleroy chapter VII → XIV jump | **Remains, note** (budget-driven, not avoidance) |
| New, minor | w07-d2 and w07-d4 run across Roberts's section breaks and omit the printed numerals "II." and "III.", which `edition` does not declare (note). Authors remain 11 (note). |

## Grade 4 results

Full sampled scope, as for Grade 5: every source downloaded independently; all 180 selections, hashes and evidence strings checked; every prompt and note read; 12 blind cold reads; timing, progression, excerpt-gap and novelty checks.

| Measure | Result |
| --- | --- |
| Validator | Passes |
| Structure | 180 nights, 543 questions (w06-d4, w18-d2 and w27-d4 have four), 12 sources, 12 authors. Translation: Heidi, Elisabeth P. Stork (1915), named. |
| Hashes | 180/180 match |
| Evidence | 543/543 literal |
| Fidelity, Gutenberg and Wikisource sources (148 nights) | 125 exact. The other 23 differ only by declared or documented changes: Larcom's 1889-scan corrections; Little Men's restored 1871 word division, "at the head" and the omitted caption; Nesbit's printed asterism. Every Larcom selection was collated against both 1889 OCRs (LC and BPL). Disagreements with both are only line-end and page-break hyphenation, which `edition` declares will follow Gutenberg. |
| Fidelity, Pyle (20 nights) | Independent three-witness collation (UC 1883, Harvard 1883, NYPL 1892). The selection disagrees with all three OCRs only at about 30 spans where marginal side-notes interleave with the text line. These match the author's 25 "INSPECTED" words. Page images of pp. 26, 166 and 168 confirm the text: six full sentences on p. 166 match verbatim. Two defects: see findings. |
| Fidelity, Harper (12 poems) | Matches the 1895 scan (HathiTrust Emory copy, UPenn-hosted PDF). The text layer and page images of pp. 25–26 and 33–34 agree. |
| Fidelity to print beyond declared sources | Little Men's Wikisource pages are proofread level 3. The 1871 Roberts Brothers scan (IA littlemenlifeatp01alco) shows transcription errors (findings). |
| Cold reads | 12/12 blind, before notes and evidence. 36/36 answers agree. |
| Timing | Shared reading peaks at 128 words per minute (w15-d4) and independent at 125 (w21-d3), both under the thresholds. Totals are 15–20 minutes. Poems allow 5–8 minutes. |
| Modes | 115 shared, 65 independent. Independent first readings begin in week 12 and dominate from week 17 except for older prose. |
| Novelty | 0 overlaps of 30 words or more against the 12 other current grade files (including Grade 3 `ec4e467e…`) and the 251 weekly records |

Rights and edition evidence, checked directly. All nine Gutenberg items are explicitly "Public domain in the USA".

| Source | Evidence | Verdict |
| --- | --- | --- |
| Spyri, *Heidi* (tr. Stork) | PG 20781 explicit US public domain; Lippincott 1919 Gift Edition; translation ©1915 | Sound |
| Dodge | PG 28856: Century 1906 title, ©1883 | Sound |
| Kingsley, *Madam How* | PG 1697 identifies the 1889 Macmillan edition | Sound |
| Seton | PG 27887: Doubleday, Page 1923, ©1913 | Sound |
| Larcom | IA LC deposit copy (stamped 1889) and BPL copy; ©1889 | Sound |
| Pyle | IA UC and Harvard copies dated MDCCCLXXXIII; NYPL c1883; all catalogued NOT_IN_COPYRIGHT | Sound |
| Nesbit, *Five Children* | PG 17314: Dodd, Mead, October 1905 | Sound |
| Alcott, *Little Men* | Wikisource index of the Roberts Brothers 1871 djvu; IA 1871 copy | Rights sound (text errors below) |
| Longfellow; Hemans; Morley | PG 1365 (Household Edition 1902); PG 66785 (Nimmo 1875); PG 18790 (Ginn 1903) | Sound |
| Harper | Scan title leaf: Philadelphia, 1895, ©1895 | Sound |

The two antisemitic similes are kept verbatim: "As a Jew takes each one of a bag of silver angels" (w03-d2) and "Now thou old Jew!" (w06-d3). Both content notes explain them as the 1883 narrator's or character's period prejudice, "not the site's view", and do not tell readers to skip or substitute; the w03-d2 note invites readers to say why the stereotype is unfair. **These comply with the contract.** The newly restored crowd attack in w27-d4 (13+7 minutes; four questions) is described accurately in its content note, without softening.

## Findings (Grade 4)

| Grade | Night / source | Severity | Finding | Evidence |
| --- | --- | --- | --- | --- |
| 4 | w03-d1 (Pyle) | should-fix | Block 9 is a stray paragraph containing only `"` between "…a right merry soul withal." and "But hearken…". It is build debris from removing the p. 26 running head. | UC scan p. 26 opens directly with "But hearken". Delete the block. |
| 4 | w18-d4 (Pyle) | should-fix | Reads "the overplus of church gains", but all three witnesses print "ot" (UC 1883 and NYPL 1892 page images; Harvard OCR). This is an undocumented emendation, while `edition` says "the printed text otherwise stands" and keeps the printed "drank;". | UC leaf 198 and NYPL leaf 198 (printed p. 168). Document the emendation in `edition`, or restore "ot" for consistency. |
| 4 | w11-d3 (*Little Men*) | should-fix | Reads "just around the corner, and Mrs. Bhaer close by to fill". The 1871 print has "just round the corner, and Mrs. Bhaer close by, to fill". | IA littlemenlifeatp01alco, printed p. 9 |
| 4 | w25-d4 (*Little Men*) | should-fix | Reads "The were pounded up with a little pestle"; the 1871 print has "They were". | Same copy, printed p. 80 |
| 4 | *Little Men*, all 20 nights | should-fix | The Wikisource pages are proofread level 3 (only 2 of the 77 pages in the four chapters used are validated). The author checked word division against the scan, not full wording or punctuation. The 1871 OCR also suggests "apple-pie" for "apple pie" (w25-d3). | Collate all 20 selections against the 1871 scan and record the corrections |
| 4 | Content notes, 17 nights | should-fix (pattern) | The same disclaimer pattern that Grade 3 removed: "not a safe way to communicate" (w03-d5), "not advice for teaching" (w04-d5), "activities to imitate" (w05-d4), "do not imitate digging" (w09-d2), "not an instruction to reproduce" (w11-d5), and others (w12-d5, w13-d1, w15-d5, w21-d2, w21-d4, w21-d5, w22-d2, w23-d4, w23-d5, w25-d2, w28-d2, w31-d3). The w03-d2 note also adds "discuss the difference between understanding a character's choice and recommending it". | The contract limits notes to history or the author's purpose. Trim these. |
| 4 | w11-d4 content note | note (borderline) | "Explain its historical usage without asking children to repeat it" (the printed "Negro melody"). The text is kept verbatim and the note does not tell readers to skip or substitute while reading, but the clause verges on the directive's concern. | Delete the clause |
| 4 | Timing | note | Several shared nights run at 116–128 words per minute (Heidi week 1, Nesbit weeks 9/15, *Little Men* week 11, Pyle w27-d3/d4). That is under the 140 threshold but demanding for Grade 4. | Word counts |
| 4 | Heidi arc | note | The 20 nights end at Clara's arrival (w23-d5). The novel's resolution (Peter wrecks the chair; Clara walks) and the sleepwalking "ghost" chapter that sends Heidi home are absent. This is consistent with the budget; no avoidance wording. | Gap map |

### Censorship directive (Grade 4)

| Night | Severity | What was avoided | Merit-based boundary |
| --- | --- | --- | --- |
| w09-d4 → w09-d5 (Nesbit, *Five Children and It*) | should-fix | The context says "the servants also failed to recognize the transformed children … That encounter is not included here." The 519-word gap is the comic climax of the beauty wish and ends with Martha's slur, "Go along with you, you nasty little Eye-talian monkey." w09-d5 is 689 words in 7 minutes, so length does not explain the cut. | Begin w09-d5 at "'Thank goodness, we're home!' said Jane…" (about 1,200 words in 10 minutes) |
| w25-d5 (*Little Men* ch. V) | should-fix | The content note says the excerpt ends "before a later mishap in the full chapter". The cut 517 words are the chapter's comic climax and resolution: Kit the dog gulps the hot cakes ("I am glad to say that they were very hot, and burned him"), Daisy shakes him and shuts him in the coal-bin, then a "truly delightful supper". w25-d5 is only 603 words in 7 minutes. | Extend w25-d5 to the chapter end |
| *Five Children*, chapter III | note (pattern-based) | The whole "Being Wanted" chapter is absent, including its stereotyped gypsies trying to take the baby. The chapter-level choice is budget-consistent. | Weigh on merit if the arc is revised |
| Pyle w27-d4 | resolved | The crowd attack and rescue are now included, with an accurate content note | — |

No Grade 4 note tells readers to skip, soften or substitute words (w11-d4 is the borderline case above). Period language is kept elsewhere with context: Pyle's similes and "Saxon face", "gypsy" in Dodge (w19-d4), "Negro melody" in *Little Men*, and Seton's and Larcom's period terms.

## Limits

This is sampled independent agent review: mechanical checks over every selection and 12 blind cold reads per grade. It is not human editorial approval, empirical timing, a measured reading level, or legal advice. Print collation covered the dated witnesses named above and 16 sampled Wikisource pages, not every level-3 page; the Lamb tales were sampled on only 2 pages. Jackson punctuation was not collated independently; only words were. For Grade 3, Looking-Glass was collated against UF OCR at word level, and punctuation was checked only where pattern scans flagged anomalies. Nesbit, Montgomery, Barbauld and the other Grade 3 sources were checked against their declared transcriptions, not against separate print witnesses. The Grade 3 repair was delta-checked: mechanical checks in full, five Looking-Glass corrections on page images, and three cold reads. For Grade 4, Pyle was collated against three OCR witnesses, with page images for pp. 26, 166 and 168 only. *Little Men* was collated against a second 1871 copy's OCR plus three page images, not in full. Heidi, Dodge, Kingsley, Seton, Nesbit, Longfellow, Hemans and Morley were checked against their declared Gutenberg transcriptions only. The Harper PDF was downloaded over TLS anchored on the server's AIA-fetched InCommon intermediate, because the emSign root is absent from the local trust store; its content was cross-checked against its own page images. Retained working evidence (downloads, scan crops, answers, scripts) is transient scratch in `.scratch/daily_reading_corpus/final-review-primary/`.

## Delta review (2026-10-08)

On 2026-10-08 the same reviewer lane, using the same brief, checked the repaired Grades 5 and 4 and the final Grade 3 notes against the findings above. That record above is unchanged. Contract: `806d2fc9…` (commit 785a1ed). For each grade the check covered: snapshot and hash, validator, recomputed hashes and evidence, a field diff against the reviewed snapshot, fidelity re-runs, a pattern scan of every note, context and prompt, timing and novelty. For Grades 4 and 5 it also covered blind cold reads of new or restored nights, witness collation, and page-image checks of the corrections.

### Grade 5 delta review (`a11913eb…`, commit 111fd8b)

SHA-256 `a11913ebbc6532de998573ba15ea34f4b659b576e3b9923c97a0fe36ee7fa686`, unchanged throughout the check.

| Check | Result |
| --- | --- |
| Validator and structure | Passes. 180 nights, 555 questions, 12 sources. All 21 Lamb nights carry `author: "Mary Lamb"`. |
| Hashes; evidence | 180/180; 588/588 literal |
| Fidelity to declared sources | Every night matches its source after declared normalization, except the documented corrections toward print. Naidu has 5 (w03-d4, w03-d5, w12-d4); *Good Hours* 3 (w36-d3); Alcott "mantel-piece", "merriment." and "I remain," are restored. Nesbit has 2 corrections against the dated Macmillan 1905 printing: w10-d3 "he" and w20-d3 "make", both confirmed in that copy's OCR. In Lamb, every difference from the Wikisource transcription is one of the 98 logged corrections. |
| Lamb against print | The 21 Lamb nights were collated independently, word by word, against the Internet Archive OCR of the 1908 scan (talesfromshakesp1908lamb). Of 233 difference spans, all are OCR noise, running heads, illustration captions or the Æ ligature; none is a word variant. Page images of pp. 20, 75, 196, 228 and 230 match the corrected text, including the SONG heading on p. 228. |
| Contract rule of 785a1ed | Alcott "weet" (w16-d1): on p. 68 of the 1896 scan the word starts its line flush, with no blank, so it is a misprint. Keeping it as printed is correct. |
| Notes | 0 notes tell readers to skip, soften or substitute words; 0 moralizing disclaimers remain |
| Timing | Prose 42–107 words per minute; totals 16–20 minutes; no night exceeds the thresholds |
| Novelty | 0 overlaps of 30 words or more |
| Blind cold reads | 5 restored nights, read before notes and evidence: w25-d3, w28-d2, w17-d3, w30-d4 and w32-d4. All 20 answers agree with the notes in substance. Disclosure: I had seen the source text of the Pip and well passages while mapping gaps. |

| Finding (2026-10-07) | Status |
| --- | --- |
| w35-d5 SONG heading | **Resolved** (heading block; p. 228 image) |
| Alcott w12-d3, w15-d5, w17-d1, and the `edition` claim | **Resolved**: Gutenberg readings restored; `edition` rewritten |
| Naidu w03-d5, w03-d4, w12-d4; collate all poems | **Resolved**: all 8 poems first selected were collated; 5 corrections. Cradle-Song and Alabaster were dropped, so Naidu now has 6 nights. |
| *Good Hours* w36-d3 | **Resolved** |
| w31-d1 Lamb errors and the note admitting them | **Resolved**; the night has no content note now |
| Lamb, all nights | **Resolved**: 98 corrections; my independent collation and image sample found none remaining |
| Nesbit w20-d3 "male" (and w10-d3 "ha") | **Resolved** against Macmillan 1905 |
| Moralizing content notes (about 30) | **Resolved** |
| Progression, weeks 31–36 | **Resolved**: the stage now reads "Return to shared reading for older prose", with 17 of 30 nights shared |
| Lamb authorship | **Resolved**: Mary Lamb credited, with Lamb's 1807 letter cited in `edition` |
| Nesbit edition date | **Resolved**: "copyright 1906; printing undated" |
| Prompt quotation style | **Resolved**: quoted phrases now have quotation marks |
| Muir sequence | **Remains (note)**: order unchanged; contexts label the excerpts |
| Genre range | Closed (owner decision) |

| Censorship-directive finding | Status |
| --- | --- |
| *Secret Garden* w07-d3 → w07-d4 | **Resolved**: w07-d3 runs to the chapter end, continuous with w07-d4 |
| *Secret Garden* w05-d4 | **Resolved**: begins "During that week of sunshine" |
| Perseus | **Resolved**: w25-d3 has the slaying of Medusa, her sisters' pursuit and Atlas. Andromeda and Polydectes remain absent (note). |
| Argonauts | **Resolved**: w27-d3 → w28-d2 runs continuously through the bulls, the dragon's-teeth warriors, Medeia and the fleece. The Phaeacian nights were dropped. Part V, with Medeia's crime, is not included, and the w28-d2 context says so. That is a part boundary, so it is not avoidance. |
| Theseus | **Resolved**: w28-d5 includes Periphetes the club-bearer |
| *As You Like It* wrestling | **Resolved**: w32-d4 has the match, and w32-d3 → w32-d5 are linked as continuous |
| Pip | **Resolved**: w17-d3 |
| Muir's well | **Resolved**: w30-d4. The near-drowning (ch. IV) and the floggings (ch. I) remain absent (note). |
| *Secret Garden* opening; *Little Women* ch. VII–VIII; *Willows* ch. III | **Remain (notes)**, unchanged |

New findings, both minor:

| Night | Severity | Finding |
| --- | --- | --- |
| w17-d3 context | note | Says Mother "stayed in her room after the girls spoiled her breakfast". In chapter XI she has already said she will stay in her room all day before the tray goes up, and she quietly eats her own provisions. Reword to keep the order of events. |
| w25-d3 | note | "wrapped the head in the goat-skin" has no antecedent. Part II, where Athené gives it, is omitted, and the context names only the hat, the shield and Herpé. Add the goat-skin to the context. |

Could not check: there was only one OCR witness for Lamb. Punctuation was compared on the five page images and nowhere else. The Nesbit Macmillan readings were checked in OCR, not on page images. The cold reads were five agent reads, not child readers.

### Grade 4 delta review (`f35625c0…`)

SHA-256 `f35625c00576cdd50ff95b466b23f5393deb3387487d3f94526c537c662973c2`, unchanged throughout the check. Compared with `8e3b0592…`, 39 nights and 2 source records changed.

| Check | Result |
| --- | --- |
| Validator and structure | Passes. 180 nights, 545 questions (w09-d5 and w25-d5 now have four), 12 sources. |
| Hashes; evidence | 180/180; 545/545 literal |
| Fidelity to declared sources | 120 of the 148 Gutenberg and Wikisource nights match exactly. The rest differ only by declared changes: Larcom's 1889-scan corrections, Nesbit's asterism, and the *Little Men* corrections, which were checked against print below. The restored Nesbit night w09-d5 matches Gutenberg 17314 exactly. |
| Pyle | Three-witness collation re-run (UC 1883, Harvard 1883, NYPL 1892). It finds 32 spans that disagree with all three OCRs, all of the known side-note interleaving kind. The w03-d1 stray paragraph is gone. w18-d4 restores "ot", which `edition` now declares, together with "drank;", as printed misprints. That matches the contract rule of 785a1ed. |
| *Little Men* against print | Re-collated against the two 1871 OCRs (LC littlemenlifeatp01alco, UC littlemenlifeatp00alcoiala). Page images of 14 pages: 6, 9, 18, 41, 47, 67, 69, 70, 71, 72, 74, 82, 86 and 87. The corrections seen on them match print, for example "laughing,—", "flying off; but", "just round the corner", "half wild", "all sorts of things", "can I really", "This was taking them" and "Uncle Fritz in his persuasive way". Both OCRs also support the corrections sampled off those pages, such as "These are Tommy Bang's", "looked out clean clothes" and "didn't have enough". The retained misprints "lowed" and "coriopsis" follow the 785a1ed rule. Defects are listed below. |
| Notes | The 17 notes named in the review were trimmed, and the w11-d4 "without asking children to repeat it" clause is gone. 5 residual phrases are listed below. |
| Timing | Unchanged ceiling of 128 words per minute (w15-d4). The restored w09-d5 runs at 121 and w25-d5 at 110; totals are 15–20 minutes. |
| Novelty | 0 overlaps |
| Blind cold reads | 5 nights read before notes and evidence: w09-d5, w25-d5, w11-d4, w17-d3 and w03-d1. All 17 answers agree in substance. Disclosure: I had cold-read the first ~600 words of w25-d5 on 2026-10-07, and saw its ending on the page images. I had seen w11-d4 and w17-d3 diff fragments, and w09-d5's context and content note, before reading. |

| Finding (2026-10-07) | Status |
| --- | --- |
| w03-d1 stray `"` paragraph | **Resolved** |
| w18-d4 "ot" | **Resolved**: printed "ot" restored and declared |
| w11-d3 "just round the corner … close by, to fill" | **Resolved** |
| w25-d4 "The were" | **Resolved** ("They were") |
| *Little Men*, collate all 20 nights | **Partly resolved**. The log lists 179 corrections, and those sampled are right. But the collation ignored word spaces, so it introduced 7 spacing errors and missed 5 word-division differences (new findings 1–2). |
| Moralizing content notes (17 named) | **Resolved for the 17 named**. Five residual phrases follow the same pattern (new finding 3); four were present at the original review, which did not name them. |
| w11-d4 clause | **Resolved**. The new wording is slightly ambiguous (new finding 4). |
| Timing | **Remains (note)**, unchanged |
| Heidi arc | **Remains (note)**, unchanged |

| Censorship-directive finding | Status |
| --- | --- |
| w09-d4 → w09-d5 servants scene | **Resolved**: w09-d5 now begins "'Thank goodness, we're home!'", continuous with w09-d4 (transcript paragraphs 93–137, 138–182) to the chapter end. Martha's slur is verbatim, and the content note gives history only. |
| w25-d5 chapter V ending | **Resolved**: Kit's theft, the burn ("I am glad to say …"), the coal-bin and the supper run to "a sunbeam." q4 asks readers to weigh the narrator's joke. |
| *Five Children* chapter III | **Remains (note)**, unchanged |

New findings:

| # | Night | Severity | Finding | Evidence |
| --- | --- | --- | --- | --- |
| 1 | w11-d1, w11-d5, w17-d4, w25-d1, w25-d2, w25-d4 (*Little Men*) | should-fix | 7 spacing errors introduced by the repair: "Tommy Bangs;come up" (print "Bangs; come up"), "order prevailed;and nothing" ("prevailed; and"), "not halfa s fond" ("half as fond"), "little Rob,w ho kept" ("Rob, who kept"), "\"OAunty! please" ("O Aunty! please"), "\"OAunty, it's" ("O Aunty, it's") and "this one time,and after" ("time, and after"). The cause is in `.scratch/daily_reading_corpus/4/final/alcott-1871-corrections.json`: its diffs ignore spaces. For example, "Oh aunty" → "O Aunty" was applied as replacing "ha" with "A". | Page images pp. 18, 47, 67, 72 and 82; p. 4 from both 1871 OCRs. Fix the spaces, then re-collate with spaces significant. |
| 2 | w17-d2, w17-d3, w25-d2, w25-d4, w25-d5 (*Little Men*) | should-fix (minor) | 5 word-division readings differ from print, missed because spaces were ignored, although `edition` says printed word division is adopted: "anything" (print "any thing", p. 35), "some time" ("sometime", p. 41), "anything she liked" ("any thing", p. 71), "anyone might envy" ("any one", p. 81) and, in the restored text, "another bowlful of batter" ("bowl full", p. 87; Wikisource's reading). Also w25-d1 has "today" where p. 69 hyphenates "to-/day" at a line end; the other nights print "to-day" (consistency note). | Images pp. 41, 71 and 87; pp. 35 and 81 from both OCRs |
| 3 | w14-d4, w34-d3 content notes; w03-d1 content note; w01-d4 q1 and w09-d5 q2 facilitator notes | note (residual pattern) | "Those recollections are not suggested activities"; "that historical practice is not suggested here. Observe wildlife without feeding or disturbing it"; "readers can discuss authority without endorsing threats"; "Do not treat threatened punishment as necessary care"; "without treating any real appearance as ugly" | Trim to history or the author's purpose, as with the 17 already trimmed |
| 4 | w11-d4 content note | note | "uses a dated racial term, then the usual name, to identify a kind of melody" reads as if the text used two terms; it uses one ("negro melody", lower-case as printed) | Reword as "the usual name at the time" |

Could not check: images for most *Little Men* pages. Elsewhere the check relied on two 1871 OCRs agreeing, which cannot settle hyphens at line ends (for example "rolling-/pin" on p. 74). Pyle nights the repair left unchanged were not re-imaged. The cold reads were five agent reads.

### Grade 3 final notes (`76a2527b…`, commit 4b85a2c)

SHA-256 `76a2527bafe14de25a988518b4bc592df3af7c2cdf1b0516674e23141ae75fdd`. Compared with `ec4e467e…`, no text block changed. Four notes and one source `edition` changed.

| Check | Result |
| --- | --- |
| Validator; hashes; evidence | Passes; 180/180; 557/557 literal (546 questions) |
| Fidelity | Unchanged from the delta check: no text changed |
| Novelty | 0 overlaps |
| Contract rule of 785a1ed | The 1899 misprints "I afraid I'm" and "borogroves" are retained as printed; no letters are supplied |

| Remaining item from the delta check | Status |
| --- | --- |
| w11-d2 "not recommended ways to treat children" | **Resolved**: now "An adult shakes Lionel and calls him naughty." |
| w13-d1 "not medical advice" | **Resolved**: now states the events only |
| w13-d4 "not an activity to copy" | **Resolved**: now states the events only |
| w19-d2 "not as local gardening advice" | **Resolved**: the context now describes Comstock's contrast and the cover crop |
| Roberts "II." / "III." numerals | **Resolved**: declared in `edition` for w07-d2 and w07-d4 |
| Kehonka egg-taking passage | Remains, accepted (note) |
| Fauntleroy chapter VII → XIV | Remains (note) |
| 11 authors | Remains (note) |

A pattern scan of every Grade 3 note, context and prompt finds no wording that tells readers to skip, soften or substitute, and no remaining safety disclaimers. Grade 3 is confirmed.

### Limits of the delta review

This is still sampled independent agent review. It is not human editorial approval, empirical timing, a measured reading level, or legal advice. Page images covered 5 Lamb pages, 14 *Little Men* pages and one *Little Women* page. Elsewhere it relied on OCR agreement and the authors' logs. Scratch evidence for these checks is in `.scratch/daily_reading_corpus/final-review-primary/`: `g5d2-*`, `g4d2-*`, `g4d2dl/`, `g5d2dl/`, and the two collation scripts `g4d2_lmglue.py` and `g4d2_spacediff.py`. Every network request used the User-Agent `LiminalCurriculumResearch/1.0`.
