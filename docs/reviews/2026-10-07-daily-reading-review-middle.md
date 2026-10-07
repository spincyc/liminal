# Independent daily reading review — Grades 6–8

Date: 2026-10-07. Independent agent review of the middle band against
`docs/daily-reading.md`, including the 2026-10-07 no-censorship directive and
the owner's genre-mix decision. The reviewer did not author or edit any corpus
file. This record replaces the interim checkpoint report.

**Outcome: Grade 6 has no fidelity or edition finding, but has six should-fix
items under the later no-censorship directive (end of report). Grades 7 and 8
each have one blocking edition finding, plus should-fix findings listed
below.**

| Grade | File reviewed | SHA-256 |
|---|---|---|
| 6 | `content/reading-daily/6.json` | `94b82b78b6e5bb9803dad274ce533edfe12a9fb75d684e61e3c76387d82fc415` (re-confirmed unchanged at final review) |
| 7 | `content/reading-daily/7.json` | `36ffa4042eed9801994028ba23502f249a76ba61df8b96be249d7163b721ad24` |
| 8 | `content/reading-daily/8.json` | `e40af5b1d1b65b77207cf6da1486a5337681b7a1f37230ca8628a14548f305cb` |

## Scope completed

| Brief item | Grade 7 | Grade 8 |
|---|---|---|
| Bind hash | Done; unchanged through review | Done; unchanged through review |
| Fidelity, all 180, own downloads | 180/180 | 180/180 |
| Witness checks beyond the transcription | Tom Sawyer, Keller, Zitkala-Sa, McKay checked against dated scans | Irving, Doyle, Scott checked against dated scans |
| Text hashes / literal evidence | 180/180; 762/762 | 180/180; 552/553 (one whitespace) |
| Rights and edition, every source | 11/11 checked | 12/12 checked |
| Prompts, all | 540 read | 544 read |
| Cold reads, blind | 19: 12 rotation (4 of them new nights) + 7 new nights | 15: 12 rotation + 3 new Irving nights |
| Timing, every night | Done | Done |
| Progression, age fit, breadth | Done | Done |
| Novelty, 30-word shingles | Against 2,411 records (12 grades + weekly inventory) | Same |
| No-censorship directive | Notes and boundaries scanned | Notes and boundaries scanned |

Grade 6 retains its earlier completed review (36 cold reads), summarized at the
end.

Method: the source files were downloaded independently (Project Gutenberg
text/HTML, Wikisource rendered chapters, the UPenn Keller edition). A
comparator flagged only the declared omissions (page numbers, line numbers,
footnote markers, captions, zero-width markers, and Coleridge's documented
"Sidenote" labels), collapsed whitespace, and required contiguous matches.
Each declared correction was applied only after it was confirmed on page
images.

## Grade 8

| Item | Result |
|---|---|
| Validator | `node tools/check-daily-reading.js` passes |
| Fidelity | 180/180. Dickens, London, Wells, Irving and Wordsworth match their `textUrl` strictly. Austin, Burroughs, Hardy, Johnson and Coleridge match the PG plain-text files, not the HTML their `textUrl` names (S8-2). Scott 18/18 after the 5 declared corrections and 3 relocated footnotes. Doyle 18/18 after 3 caption removals and the 2 declared corrections. |
| Scan checks | Scott: all 5 corrections, the retained "acccomplishment" misprint and the 1820 title page confirmed on the scan. Each footnote follows its citing paragraph. Doyle: p.55 corrections confirmed; 10 further deviations found (S8-1). Irving: 15 differences on 7 pages of the 1864 edition (B8-1). |
| Rights/edition | All PG sources carry explicit US public-domain status and dated front matter matching their records (Austin 1903, Burroughs 1877, Hardy 1919, Johnson 1917, Dickens 1905, Wordsworth 1896, Coleridge 1912). Wikisource title leaves match for London (July 1903), Wells (Heinemann 1895), Scott (1820) and Doyle (Hodder; title page undated). Irving fails (B8-1). |
| Cold reads | 15 blind, 47 answers, all agree with the notes |
| Prompts | Text-specific; no templates or hidden referents beyond N8-2. Scott prompts and notes fit the 1820 wording; every evidence string matches the 1820 text. |
| Timing | Prose 44–119 words per reading minute (none over 140); poems 6–64; nights total 22–25 min |
| Novelty | Only the accepted overlap: w35-d1 shares 2 shingles with reading-9-w25-d1 |
| Breadth | 12 sources and 12 authors; largest share 18 nights (10%). Fiction 90 nights, essay/nature 54, poetry 36 (note only, per owner decision). |

## Grade 7

| Item | Result |
|---|---|
| Validator | Passes |
| Fidelity | 180/180 contiguous against `textUrl` sources. Keller 21/21 after declared photo-caption omission. |
| Scan checks | Tom Sawyer differs from the American Publishing Company plates (B7-1). Keller and Zitkala-Sa each have one in-selection error (S7-1). McKay's "My Mother" I/II headings confirmed in the 1922 Harcourt scan. Zitkala-Sa's "hard words against him" matches the 1921 print. |
| Rights/edition | All sources PD; dated front matter confirmed: Anne (fourth impression, Sept 1908), Kari (Dutton ©1922), Saki (Lane 1914), Hughes (Knopf 1926), McKay (Harcourt 1922), Cullen (Harper 1925), Yeats (Macmillan, Mar 1919), Keller (Doubleday 1905, ©1902–05). Holmes uses the contract's form exactly ("transcription of New York: Harper & Brothers text, copyright 1892; printing undated") and matches PG 48320's leaf. Tom Sawyer fails (B7-1). |
| Cold reads | 19 blind, 57 answers, all agree. New nights read: Anne XXXVII, Tom IX, X and XXI, Keller XXI, "Blue-Star Woman" part 3, "America's Indian Problem", "Incident", "For Paul Laurence Dunbar", "The Collar-Bone of a Hare", "The Jester". |
| Prompts | Specific and evidence-led. The shortest poems (27–40 words) get substantive questions on paradox, image and form. |
| Timing | Prose 66–162 words per minute; none over 180. Seven nights exceed the overview's own 155 ceiling: w01-d1, w04-d1, w04-d4, w05-d4, w06-d2, w07-d2 (156–157) and w07-d4 (162). Poems 27–393 words with 6–11 reading minutes. Totals 20–25. |
| Novelty | No overlap |
| Breadth | 11 sources and 11 authors. Holmes 24, Tom 22, Keller 21 and Anne 20 nights make 87/180. |

**Front-loading and concentration (owner question).** The four long works
take 48% of the year. No single work exceeds 13%, and sustained novels and
memoir serve day-by-day development, so the concentration is acceptable.
Front-loading Anne (all 20 nights in weeks 1–7) gives an inviting entry, but
weeks 1–6 are the year's heaviest stretch: prose nights average 1,867 words at
137 words per minute, against 1,385 words at 108 in weeks 31–36. Volume falls as
complexity rises, which is defensible. Still, a twelve-year-old meets the most
reading volume at the start of the year. Trimming or splitting the longest Anne
chapters (2,300–2,700 words) would smooth the start (note N7-1).

**Content and age fit.** Tom IX's stabbing, the "half-breed" stereotype and
Anne XXXVII's death and grief are presented complete, with proportionate
explanatory notes, and suit Grade 7. The only content defect is the three
notes that instruct omission (directive table).

## Findings

| Grade | Night/source | Severity | Finding | Evidence |
|---|---|---|---|---|
| 8 | `irving`, all 18 nights (w13-d2, w14-d2, w15-d2, w16-d2, w17-d2, w18-d2, w19-d4, w20-d4, w21-d4, w22-d4, w23-d4, w24-d4, w31-d2, w31-d5, w32-d3, w33-d1, w33-d4, w35-d5) | **blocking** (B8-1) | `edition`/`publicationYear` call the text the 1864 Putnam Artist's Edition on the strength of a title-page image added to PG 2048. The 2000 etext is a different text state and has no identified exemplar. The new nights are equally affected. Re-source every selection from a dated text (for example, collate against and adopt the 1864 LoC scan, then recheck evidence) or replace the source. | 1864 scan `sketchbookofgeof01irvi`. w19-d4: "Nature seems" vs "nature seemed"; "some times" vs "sometimes"; "suite" vs "suit"; "and occasionally the" vs "or occasionally, the". w13-d2: "eftsoones" vs "eftsoons"; "town crier" vs "town-crier". w23-d4: "Republic" vs "republic"; "graphical description" vs "descriptions"; "Englishman's description" vs "descriptions"; "fancies. But" vs "fancies; but". w31-d5: "cross aisles" vs "cross-aisles"; "simple," vs "simple;"; "Shakespeare" vs "Shakspeare"; "memories," vs "memories;". PG's readings also match neither the 1819, 1834, 1839, 1848, 1849 nor the 1864 printing. |
| 8 | `g8-doyle-lost-world`: w08-d2, w09-d2, w18-d4, w26-d3, w30-d3 | should-fix (S8-1) | Ten readings in selected text depart from the declared 1912 scan; the edition note discloses only two corrections. Correct them and collate the remaining Doyle pages. | w08-d2 "humor" → "humour" (p.30); w09-d2 "color" ×2 → "colour", "vegetation fringed" → "vegetation, fringed" (p.49); w18-d4 "slate-colored" → "slate-coloured" (p.170); w26-d3 same (p.213); w30-d3 "shark-like" → "sharp-like", "gray" → "grey", "dancing and" → "dancing, and" (p.310). Two control pages (pp.20, 284) match. |
| 8 | `8-austin`, `8-burroughs`, `8-hardy`, `8-johnson`, `8-coleridge` | should-fix (S8-2) | `textUrl` names PG HTML, but the text follows `pg<n>.txt` (underscore emphasis, `--`, straight quotes, capitalized first words, Sidenote labels). Point `textUrl` at the `.txt` files. | 51 of 60 selections fail against the HTML, and all 60 pass against PG 51893/35712/3167/17884/29091 `.txt` (Coleridge after its declared removals) |
| 8 | reading-8-w34-d1 `context` | should-fix (S8-3) | "the bracketed sidenotes are the poem's marginal commentary". No brackets appear; the glosses are unmarked paragraphs. | Blocks 1, 5, 9, 12, 15, 19, 22, 25, 28 are glosses with no brackets |
| 8 | `scott`: w28-d1 block 5, w29-d1 block 6, w35-d4 block 11 | should-fix (S8-4) | Scott's "L. T." footnotes sit unmarked mid-narrative and no context identifies them. Add a context cue. | e.g. "The original has Cnichts, by which the Saxons …" |
| 7 | `g7-tom`, all 22 nights | **blocking** (B7-1) | The edition claims the 1884 American Publishing Company text from a title-page image in PG 74 (credited to David Widger). The PG text differs from that publisher's plates, which are identical in the 1876 and 1881 scans. The exemplar is unidentified. Re-source or collate every selection against a dated witness and adopt its readings. | 1876 `adventuresoftoms00twaiiala` pp.171–172 vs w13-d3: "brainracking" / "brain-racking", "today" / "to-day", "sermon" / "sermom", "and the least religious" / "and least religious", "Elysian" / "elysian", "a while" / "awhile", "goodbye" / "good-bye", "ballroom" / "ball-room", "dark-complexioned, black-eyed, black-haired" (unhyphenated in 1876). p.96 vs w10-d2: "Oh, lordy" / "O, lordy"; footnote "owned" / "had owned". 1881 `adventurestomsa01twaigoog` matches 1876. |
| 7 | w31-d1 (Keller); w22-d2 (Zitkala-Sa) | should-fix (S7-1) | In-selection transcription errors against the dated print | w31-d1 "The two stories we so much alike" → "were" (two 1903 Doubleday scans; UPenn itself has "were" at the passage's other occurrence). w22-d2 "My fingers Grey icy cold": the 1921 print (p.74) reads lower-case "grey" (its own misprint for "grew"). |
| 8 | w18-d4-q3 evidence | note (N8-1) | Double space in "Faked, Summerlee!  Clumsily faked!"; the text has one | Literal check |
| 8 | w16-d1 q1–q2 | note (N8-2) | Prompts name "the prior"; the title first appears in w17-d1 | 0 occurrences in w13–w16 Scott text |
| 8 | w28-d3 `challenge` | note (N8-3) | "a overlooked feature" | — |
| 8 | `8-burroughs` edition; `g8-doyle-lost-world` edition | note (N8-4) | The title page reads "Second Edition, corrected, enlarged, and illustrated". Doyle's title page is undated; the year comes from scan-index metadata. | — |
| 8 | Grade 8 breadth | note (N8-5) | 11 of 12 authors are men, and Johnson's six poems omit his poems on race (for example "Fifty Years"). Genre balance is reported as a note only. | — |
| 7 | weeks 1–7 (Anne) | note (N7-1) | Heaviest reading volume falls at the start; seven nights exceed the overview's 155 words/minute | Timing table above |
| 7 | `g7-zitkala-stories` edition; Grade 7 authors | note (N7-2) | The edition string could name Hayworth Publishing House. Eleven authors sits below "where appropriate, twelve". Only 2 essay nights (note only). | — |

## No-censorship directive (2026-10-07)

| Grade | Night/source | Severity | Finding | Current text / evidence |
|---|---|---|---|---|
| 7 | reading-7-w10-d2 `contentNote` | should-fix | The note instructs omission | "… treat both as the setting's prejudice and do not repeat the slur aloud. Tom is also flogged at school." |
| 7 | reading-7-w17-d2 `contentNote` | should-fix | The note instructs omission | "The poem quotes a racial slur shouted at an eight-year-old. Discuss its harm without repeating the word aloud." |
| 7 | reading-7-w22-d3 `contentNote` | should-fix | The note invites omission | "Contains racist mockery and a quoted slur directed at an Indigenous woman. Retain the term for examining the attack; students need not repeat it aloud." |
| 8 | `8-dickens-christmas-carol`, w22-d1 → w23-d1 | should-fix | Stave Four's essential scenes are omitted: Old Joe's shop, the shrouded corpse, the Cratchits mourning Tiny Tim, and the churchyard climax. Ignorance and Want are also omitted. | 4,117-word gap; 1,580-word gap after w21-d1; w23-d1 context summarizes the grave |
| 8 | `g8-london-call-wild` | should-fix | Every major violent scene falls just outside the boundaries: the club beating, Curly's death, the Spitz fight, Dave's death, Thornton's rescue and the drowning, and the novel's ending | Contexts: w08-d1 "begins after the beating"; w10-d1, w15-d3 "outside this excerpt"; w30-d2 "stops before the novel's violent final events". The final 3,911 words are unselected. |
| 8 | `g8-doyle-lost-world`, w26-d3 → w27-d3 | should-fix | Chapters XII–XIV (carnivore pursuit, ape-men capture and executions, the war) are omitted. w25-d3 calls the ape-man encounter "an unsettling encounter". | 17,145-word gap (about 23% of the novel) |
| 8 | `g8-wells-time-machine` | should-fix | The Morlock underworld (ch. IX) and the forest-fire night in which Weena is lost (XII–XIII) are omitted | Gaps of 2,816 and 3,277 words; w36-d1 note "Weena's loss occurred before this excerpt" |
| 7 | `g7-tom` | note | The climax chapters are absent: Joe's threat against the Widow, the cave ordeal, Joe's death (XXIX–XXXI, XXXIII). Avoidance is less evident because ch. IX's murder is included. | Gaps of 8,535 and 4,184 words |

Selected texts are unaltered in both grades. Boundaries cannot prove motive,
but in the four Grade 8 novels the omissions coincide with the darkest scenes
and the contexts announce them. Scott (chapters I–V contiguous, including Isaac
and the anti-Jewish speech), the complete Mariner and Holmes stories, and
Irving's essays show no avoidance.

## Limits

This is sampled independent agent review: 15 and 19 blind cold reads,
full-population mechanical checks, and scan collation of samples only. It is
not human editorial approval, empirical timing, a measured reading level,
comprehensive historical fact-checking, or legal advice. Irving, Tom Sawyer and
Doyle were sample-collated, not fully collated. Holmes, Anne, Saki, Kari,
Hughes, Cullen and Yeats were checked against their transcriptions and dated
front matter, without page-image collation. Working files are in
`.scratch/daily_reading_corpus/final-review-middle/`; they are transient.

## Grade 6 completed review (preserved)

Bound to SHA-256 `94b82b78…fc415`, re-confirmed unchanged. 180 nights, 12
sources and 12 authors, all 540 prompts, all metadata and six progression
stages reviewed. **36 blind cold reads** (weekday `(week−1) mod 5 + 1`), 108
answers, no remaining disagreement; six unclear later referents were repaired
and rechecked; no template sequences.

- **Fidelity.** All 180 hashes and all 540 questions' literal evidence pass.
  149 selections match fresh downloads contiguously, after whitespace
  normalization and declared caption omission. Every remaining source has
  direct coverage: Muir pp.1–6 against the 1894 scan, Tennyson's Blackbird
  against 1900 pp.128–129, and seven Wallace selections matched exactly.
  Selected-text collations for unidentified PG exemplars were author-supplied.
  This is not a full facsimile collation of all 180.
- **Editions (no translations).** Wilde (Nutt, 7th impression, Mar 1910);
  Gaskell (Dent/Dutton 1904); Stevenson (Swanston 1911); Kipling (Century 1910);
  Teasdale (Macmillan 1920 facsimile, PDF p.9 and Arcturus p.98); Clare (Over
  1901); Dunbar (Dodd, Mead 1922); Tennyson (Collins/Methuen 1900 facsimile);
  Robinson (1905 printing of 1897); Jefferies (Smith, Elder 1879); Muir (Century
  1894 facsimile); Wallace (Darwin Online 1869 first edition). US conclusions
  rest on these dated texts and the repositories' explicit determinations.
- **Progression and notes.** The year moves from close observation and irony
  through adventure narrators to Cranford's restraint, Wallace's competing
  explanations and Robinson's compressed argument. Prejudice, violence and
  obsolete science carry specific notes.
- **Timing and novelty.** Prose 45–122 words per minute; nights 21–25 minutes.
  No reuse against 251 weekly records; no cross-grade duplicates at review
  time. The final-band rerun above, against 2,411 records, found no overlap
  involving Grade 6.
- **Withdrawn false positive.** A low-resolution reading of Blackbird's "sing
  me something well" was corrected by a 300 dpi crop; no change was needed.

Grade 6 had no unresolved defect within that scope. The no-censorship
directive post-dates it and is applied separately below.

### Grade 6 no-censorship directive (applied afterwards, same hash)

Scope: all 180 contexts, all 123 content notes, the locators, and the gaps
between consecutive excerpts of every serial source (Wilde, Gaskell, Treasure
Island, The Jungle Book, Jefferies, Muir, Wallace), measured against fresh
downloads. The selected texts are unaltered, and no note tells readers to skip,
soften or substitute words.

| Night / source | Severity | Current text or gap | Merit-based fix |
|---|---|---|---|
| `6-wallace`, w32-d4 boundary | should-fix | The chapter I run is contiguous from w28-d4 through four "Contrasts" sections, then stops exactly before the last one, "Contrasts of Races" (451 words). Nothing else in the run is skipped. | Append the 451 words to w32-d4 (or give them a night), with a context note. In that section Wallace applies his two-region argument to people, using period racial classification that he says differed from "most ethnologists". It suits the grade's competing-explanations focus. |
| `6-gaskell`, w02-d3 → w19-d1 | should-fix | 8,090-word gap: chapter II, "The Captain". Captain Brown, built up over three nights (w02-d1 to d3), dies saving a child from a train, and Miss Brown dies. w19-d1's context mentions only "After Miss Jenkyns's death". | Give chapter II one or two nights. It completes the Brown arc and is Cranford's best-known early episode of restrained grief. |
| `6-gaskell`, w21-d3 → w30-d2 | should-fix | 30,337-word gap that includes chapter VI, "Poor Peter": the son's public flogging by his father, his flight, and his mother's death. Peter's return (in the 6,260-word unselected tail, ch. XV–XVI) is also absent. | Add "Poor Peter" (and ideally the return). The thread is the novel's emotional centre and fits the stage focus on restrained emotional evidence. Light chapters are skipped too, so motive is unclear, but both of Cranford's darkest chapters are out. |
| reading-6-w27-d5 `contentNote` | should-fix | "…That term belongs to Muir's text, not the editorial voice. Do not disturb nests or approach waterfall ledges." | Keep the explanation; delete the imperative. |
| reading-6-w05-d4 `contentNote` | should-fix | "Hans dies by drowning in a storm. The narrative criticizes the pressure placed on him; devotion does not require accepting dangerous demands." | Keep the description and the author's satirical purpose; drop the site's moral. |
| reading-6-w10-d5 `contentNote` | should-fix | "Jim admits treating the replacement apprentice unkindly. Discuss how homesickness explains this behavior without excusing it." | Describe what happens, and let the question carry the judgment. |
| Activity disclaimers: w04-d1, w10-d2, w14-d1, w16-d5, w18-d3, w25-d2, w28-d2, w32-d1, w33-d1, w34-d2, w35-d3 | note | For example "not an activity to repeat", "not guidance to follow", "no drinking instructions are given" | Site-voice behavioural advice rather than history or authorial purpose. Trim wherever the text cannot plausibly be mistaken for instruction. |
| `6-kipling3` | note | "Tiger! Tiger!" is not selected, so the Shere Khan conflict and Mowgli's vow at w14-d3 go unresolved. Rikki-tikki's killings are included, so avoidance is not evident. | Consider completing the Mowgli arc on merit. |
| `6-wallace`, chapter IV | note | The orang-utan chapter (hunting, the orphaned infant) lies in a 17,431-word gap. Collecting by gun appears in w33-d1, so avoidance is not evident. | Optional, on merit. |
| `6-stevenson3` | note | Chapters I–XI are read contiguously and stop at the end of Part II; 77,329 words (three-quarters of the novel) are unselected. Bones's death, Pew's trampling and the murder plot are kept, so this is a budget limit, not avoidance. | None required. |

No finding: Wilde's four selected tales are complete, including the Swallow's,
the Prince's and the Giant's deaths. Jefferies and Muir keep shooting and
trapping in their selected text. All three Kipling stories are complete. The
remaining 120 content notes explain history or authorial purpose.
