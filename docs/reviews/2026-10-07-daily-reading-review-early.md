# Daily reading independent review: Kindergarten–Grade 2

Date: 2026-10-07. Final-pass reviewer: an independent agent lane (`final-review-early`), separate from the grade authors; it edited no corpus file. This report replaces the interim checkpoint report. That report's evidence is prior history only, and every result below comes from fresh checks of the final files.

Contract reviewed against: `docs/daily-reading.md`, SHA-256 `c3ec5a9c4c3bf3f026999a2c3e811b7c1d993f87d80da19c4fc0b943baceef42`. This version includes the 2026-10-07 owner directives against censoring exemplary literature and keeping each grade's current genre mix. Grade 1 was begun under the earlier version (`547df876…`); the later changes affect only the censorship and genre judgements, which are applied below.

## Files reviewed

| Grade | File | SHA-256 (unchanged from start to end of review) |
| --- | --- | --- |
| K | `content/reading-daily/k.json` | `57257d6130e16e0ab381d3569630cb81859ec24f75f29e26d42079cc0b464a38` |
| 1 | `content/reading-daily/1.json` | `24e2920467f3285cc011337a8cadbbaddeae243f7f2e897b0fba25a3e938dda6` |
| 2 | `content/reading-daily/2.json` | `a037e830fdbce22ccc69dc6e50546b61d40b38a8508d159bcca2b678c7d7afd5` |

`node tools/check-daily-reading.js` passes (13 grades).

## Scope completed versus the brief

Every brief item was completed for all three grades. Each source and witness was downloaded independently, and authors' derived files were not used. Where a text was typed from a scan or follows a dated witness, I compared it word by word with scan OCR. I checked every OCR-flagged difference on page images, and I image-checked a sample of claimed corrections.

| Item | K | 1 | 2 |
| --- | --- | --- | --- |
| Fidelity, all 180 | yes | yes | yes |
| Hashes / evidence quotes | 180/180 · 541/541 | 180/180 · 540/540 | 180/180 · 589/589 |
| Sources checked (catalogue and title or copyright leaf) | 21/21 | 13/13 | 20/20 |
| Prompts read | 541 | 540 | 589 |
| Blind cold reads (rotation plus extras) | 12 + 5 rebuilt nights | 12 | 12 + 2 Sandburg |
| Answers compatible with notes | 51/51 | 36/36 | 43/43 |
| Words per reading minute (median, max) | 26, 114 | 100, 131 | 80, 133 |
| Nights above 140 | 0 | 0 | 0 |
| 30-word overlap with other grades or the weekly inventory | 0 | 0 | 0 |

Rotation nights: weeks 1, 4, …, 34 on weekday `((week−1) mod 5)+1`. Extra blind nights: K W4D2, W8D1, W20D2, W26D4, W32D3; Grade 2 W18D2, W19D3. No notes were seen before answers were saved (`.scratch/…/final-review-early/cold/`).

## Fidelity results

| Grade | Result |
| --- | --- |
| K | **131/180** match their PG or Wikisource transcription exactly. Normalization: NFC and whitespace only, plus the documented omission of illustration markers. **3** more differ only by documented scan corrections (Allingham W11D5 comma; Tailor W21D4 "NO MORE TWIST", W22D2 printed missing stop). The remaining **46** were typed from dated scans (Buckley 15, Greenaway 17, Coleridge 4, Steel 10). **Every word** of all scan-based nights agrees with the scan OCR; every difference is OCR noise, a running head, or a caption. The de la Mare Wikisource text was also diffed against its 1920 Holt scan: words agree. Image samples confirm Steel p. 24 ("playing truant no one can say", the original ending kept), the Tailor's printed "aid" (p. 33), and Greenaway p. 15 |
| 1 | **159/180** match their declared PG or Gutenberg Canada transcription exactly. Normalization adds the documented omission of page numbers and caption nodes. W3D5 keeps a PG footnote anchor `[1]`, which its context acknowledges. **21** deliberately follow dated witnesses (Burgess 1914 ×9, Rabbit 1922 ×7, MWWC 1911 ×5). **Every word** of all 39 witness-source nights agrees with the witness. **5 nights keep 8 PG punctuation or paragraph readings that differ from the declared witness** (G1-S1) |
| 2 | **180/180** match their declared transcription after documented normalization. That includes Pyle's 6 documented corrections, all confirmed on scans, plus three cases: Cox matches PG's *plain-text* file rather than its declared HTML `textUrl` (G2-S2); Grimm's Queen Bee heading is taken from image alt text; and W16D1 keeps a dangling `[A]` anchor. **Against the declared editions:** Richards (1890), Pyle (Harper scan), Grahame (1902) and Farjeon agree. The exception is Grahame W22D1 "wont" (G2-S3). **Andersen fails: its 24 nights are not the 1888 Warne text the record names (G2-B1)** |

## Findings

Severity: **blocking** means do not ship as attributed; **should-fix** means a real contract or factual defect that is quick to correct; **note** means advisory.

| Grade | Night/source | Severity | Finding | Evidence |
| --- | --- | --- | --- | --- |
| 2 | **G2-B1** `sg-andersen`, all 24 nights (W25D1–W35D2) | **blocking** | The supplied Andersen text is not the Paull/Warne 1888 text the record names. The Wikisource pages were bot-imported ("split", 2020) from another transcription and marked proofread within minutes, never matched to their scan. **The Flax (W28D1–D3) is a different, simplified wording.** Scan p. 114 reads "the rain descend", "as if they intended to drown it", "by experiencing evil as well as good, we become wise", "could not collect its thoughts", "contented he remained", "so favoured by fortune", "This was my destiny", and "it is useless to expect impossibilities". The corpus reads "rain fall", "meant to drown it", "by feeling pain as well as good", "could not think", "contented he was", "so fortunate", "the plan for me", and "we must not expect what cannot be". **The Darning-Needle (W26D1–D2)** uses American spellings and altered wording against scan p. 230: "honour/neighbour/behaviour/humour" → "honor/neighbor/behavior/humor"; "laughed quietly" → "laughed, quietly"; "into the sweet or sour" → "into sweet or sour". OCR shows further non-OCR variants in W25D2, W29D3 ("parlour", "thinking"→"to think"), W30D2 ("honour", "peculiar"→"particular"), W31D2, W32D1–D2, W33D2–D3, and W35D2. W28D3 also has "i wonder". **Fix:** re-transcribe all 24 nights from the 1888 page images, or replace them with an identified, dated text. Then recompute hashes and recheck evidence quotes and prompts, which will change for W28 | Scan pages and OCR in `final-review-early/dl2/andersen-scan`; revision history of Page:…/136 and /258 |
| 2 | **G2-S1** `2-pyle-pepper` (`publicationYear`, `edition`, `rights.basis`) | should-fix | Says the witness title page "reads MDCCCLXXXVI" and is "explicitly dated 1886". The cited leaf (`page/n8.jpg`) reads **MCMVI (1906)**; the verso reads "Entered … in the year 1885". Set `publicationYear` to 1906 (the witness actually used) and correct the wording. The text is sound: all six corrections are confirmed on the 1906 images | `dl2/pyle1886.pdf` p. 9; `work/pylepages/n8.jpg` |
| 2 | **G2-S2** `cc-cox-brownies` (`textUrl`) | should-fix | All 18 nights match PG's plain-text file (`pg32210.txt`: "ONE evening", `--` dashes), not the declared HTML (image drop caps, em dashes, lines split by tables). Point `textUrl` at the plain-text file | Fidelity pass `work/fidelity-2b.json` |
| 2 | **G2-S3** `reading-2-w22-d1` (`blocks`); `sg-grahame` (`edition`) | should-fix | "Oh, if you wont be sensible," → "won't" (1902 p. 168 prints *won't*). The corpus also closes the print's spaced contractions ("I 'm" → "I'm"); document that normalization in `edition` | Scan p. 168 |
| 2 | **G2-S4** 8 nights | should-fix | Boundaries that avoid difficult material; see the censorship-directive table | Below |
| 1 | **G1-S1** W5D2, W11D5, W12D2, W22D1, W24D1 (`blocks`) | should-fix | Witness collation was word-only, so PG punctuation survives where the declared witness differs. **W5D2:** "When she had gone, the wilful" → no comma; "so lonely! And he couldn't" → "and"; "you'll catch 'em, and we'll" → no comma (1914 pp. 42–44). **W11D5:** "easy as anything," → "anything." (1922 p. 9). **W12D2:** "burned all night and through" → "night, and"; "picture-books" → "picture books" (1922 pp. 12–13). **W22D1:** "jolly round, red" → "jolly, round, red" (1911 p. 94). **W24D1:** "up to sleep, One of" → "up to sleep." followed by a new paragraph, "One of …" (1911 p. 207). Then collate punctuation fully or state in `edition` that punctuation follows PG | Page images in `work/omwwpages`, `work/vrpages`, `dl/mwwc1911` |
| 1 | **G1-S2** W11D1 (`blocks`, `context`) | should-fix | The work's opening paragraph ("There was once a velveteen rabbit…") is omitted because PG renders its drop capital as an image. The 1922 witness supplies it | `g1-rabbit` edition |
| 1 | **G1-S3** 14 nights | should-fix | Avoidance boundaries; see the censorship-directive table | Below |
| K | **K-S1** `k-coleridge-pretty-lessons` (`publicationYear`, `edition`, `rights`) | should-fix | Claims the title page was "visually verified" as MDCCCLII (1852) and that IA "incorrectly says 1853". The title leaf (PDF p. 6) reads **MDCCCLIII (1853)**, so IA is right. Set 1853 and correct the wording | `dlk/kimg/col6dated-006.png` |
| K | **K-S2** `k-buckley-eyes-no-eyes-1903` (`publicationYear`, `rights.basis`) | should-fix | The title page is undated: "Cassell … London, Toronto, Melbourne and Sydney / Printed in Great Britain", which the record itself says suggests a later printing. `publicationYear` 1903 is only York's catalogue date. The rights basis infers publication before 1931 from Buckley's 1929 death, which does not follow. Cite evidence of the text's first publication (Cassell, c. 1901–03), or a dated witness, and describe the scan as an undated printing of that text | Title leaf `dlk/kimg/eyesnoeyes00buck-n2.jpg` |
| 1 | N1 timing | note | 22 nights run at 120–131 words per reading minute (W3D5, W20D4 ≈131) | `work/mech-1.json` |
| 2 | N2 timing | note | 16 nights run at 120–133 (W29D1 133, W21D2 130, W29D2 130, W28D2 129). Read aloud to a 7-year-old with pauses, nights above about 125 leave no pause time. Consider one more reading minute for W17D5, W20D3, W21D2, W22D5, W28D2, W28D3, W29D1, W29D2, and W30D2 | `work/mech-2.json` |
| K | N3 timing | note | Maximum 114 (W3D5); several 3-minute Potter readings run at 100–109 within the fixed 10-minute total | `work/mech-k.json` |
| 1 | N4 breadth (genre per owner decision: note only) | note | Milne supplies 43 nights (24%); there are 11 authors; documentary prose is 5 nights | — |
| 2 | N5 Farjeon breadth | note | Breadth is genuine: 12 distinct works by 12 authors. The Farjeon series (15 nights, 8%) is split into 9 records for provenance, and the overview says so. The record count of 20 overstates diversity, but there are still ≥10 distinct works | Overview; Punch issue titles verified |
| 1, 2, K | N6 content notes | note | Templated content notes recur (G1: 22 Browne and 16 Brown nights repeat one sentence each). None tells readers to skip or substitute words. Some mildly steer: K W4D4 "explain it simply as a drink … if asked" (say "ale is a kind of beer"); G2 W19D3 "rather than dwelling on the name"; G2 W13D2 q3 "rather than dwelling on punishment". The G2 W18D2 name "Wing Tip the Spick" sounds like a later ethnic slur, and a short factual note would help the adult reader | Note text |
| 2 | N7 `sg-andersen` / `sg-grimm` | note | Andersen's title page is undated; 1888 is the University of Florida catalogue date, so say so in `edition`. Grimm's `evidenceUrl` is a National Gallery of Canada PDF; cite PG's front matter instead ("unabridged republication … Macmillan and Company in 1886"). W16D1's dangling "[A]" anchor should be removed or its footnote supplied | — |
| 1 | N8 small items | note | W26D1/W26D2 skip 65 harmless Pooh words (make the nights contiguous). W26D5/W27D1 omit 58 words for scan damage on 1911 p. 117; they are legible in PG. Locators cite uncommitted "scratch index" block numbers. The W10D5 q3 wording is awkward | — |
| K | N9 | note | The only within-grade overlap of 30+ words is W34D4/W34D5, Old Woman and Her Pig's own cumulative refrain; that is acceptable | Novelty run |

### Censorship directive

Each row cuts at a point that avoids death, punishment, violence, a weapon, a kidnapping plot, period prejudice, or a period medicinal claim, or it drops the scene the work exists to tell. The quoted wording is the corpus's own. Length-driven boundaries at natural breaks, and whole stories or chapters simply not selected, are not listed. **Kindergarten has none:** Three Bears keeps its original ending, Jemima's eggs are eaten, and Peter Rabbit was removed for edition reasons.

| Grade | Night | Current boundary or wording | Merit-based boundary |
| --- | --- | --- | --- |
| 1 | W13D3 (Pooh I) | "The excerpt stops before the later gun incident"; about 1,070 words of the chapter's ending are never read | Continue to the end of Chapter I |
| 1 | W18D1 (Pooh VII) and W18D2 q3, W18D3 q3 | Starts mid-chapter. The 1,170-word opening is omitted: the newcomers' arrival and Rabbit's plan to "capture Baby Roo". The prompts about "original hostility" and "attempted exclusion" depend on it | Begin at the chapter opening |
| 1 | W19D4 (MWWC I) | "the later inherited-punishment tale is not included", although the chapter is "Why His Tail Is Short" | Continue through Grandfather Frog's tale to the chapter end |
| 1 | W19D5 (MWWC III) | "frame scene only, ending before the later imaginary explanation" | Continue through the tale to the chapter end |
| 1 | W23D2 (MWWC XI) | "ends before the book's historical medicinal claim"; this omits the reveal that the bush is witch hazel (about 90 words) | End at the chapter end, with a factual note |
| 1 | W24D5 (Brown, Cuthbert) | "stops before the later punitive episodes"; it omits the "Peace" of the title and its two stories | Read the legend whole |
| 1 | W25D3 (Brown, Blaise) | "Later violent episodes of the full legend are not included" | Continue through the persecution and martyrdom |
| 1 | W30D5 (Brown, Launomar) | "omits earlier threatening and physically harsh scenes" (the theft and the night chase) | Begin at the story's opening |
| 1 | W25D1–D2 (Gerasimus) | Ends at Part I. Part II is omitted: the stolen donkey, the lion falsely blamed, and the deaths of saint and lion | Continue into Part II |
| 1 | W26D3 (Comgall) | "The Swans Episode" only; the title episode with the mice (famine, the stingy prince) is omitted | Include the mice episode |
| 1 | W29D4/D5 (Francis) | About 720 words between the nights, the Wolf of Gubbio, are omitted | Add the wolf episode |
| 1 | W30D4 (Hervé) | The parents' courtship only, which "precedes the child's story" (Hervé's blindness and his father's death) | Continue into Part II |
| 1 | W35D2 (Browne, Merrymind) | "no attack is shown"; about 600 words are omitted (the soldier's explanation, the giant's stone-throwing) | Make W34D5 to W35D2 contiguous |
| 1 | W33D1 (Christmas Cuckoo) | "intervening events not included"; the 2,058-word middle (court, robbery, strong drink) is summarized. The motive may be length | Read contiguously, or record that the cut is for length |
| 2 | W14D1/W14D3 (Hans in Luck) | "Earlier mishaps are not included"; 698 words are omitted (the horse throws Hans, the cow kicks him) | Read the tale contiguously |
| 2 | W15D1 (Three Spinsters) | "the earlier beating scene is not included" | Begin at the tale's opening |
| 2 | W16D1–D2 (Mother Hulda) | "not its harsh opening or later punishment" | The whole tale (stepmother and well; the gold and pitch ending) |
| 2 | W17D1 (Golden Goose) | "begins after his brothers' violent mishaps, which are not supplied" (362 words) | Begin at the opening |
| 2 | W20D3 (Oz) | Chapter II (2,007 words: the landing, the Witch of the East's death, the silver shoes) is skipped between Chapters I and III | Include Chapter II |
| 2 | W36D4 (Oz IX) | Begins after "The Tin Woodman has just saved the Queen", skipping the wildcat beheading | Begin at the chapter opening |
| 2 | W23D2/W23D3 (Reluctant Dragon) | "A second staged round has passed; that intervening scene is not supplied". The 289 omitted words hold, per W23D2's note, "a … paragraph with a racial stereotype" | Make the nights contiguous and add a factual content note |
| 2 | W30D1–D2 (Old Street Lamp) | "The later story contains historical racial stereotyping and is not supplied"; 1,214 words, about 43% of the tale | Complete the tale with a factual note |

## Previously pending witness work (Grade 1): resolved

Burgess's *Old Mother West Wind* now follows the dated 1914 Little, Brown scan; title page and "Illustrated Edition, Published, September, 1914" verified. *Mother West Wind's Children* was collated against the 1911 Little, Brown NYPL scan; I fetched 99 pages and verified the title leaf and verso. *The Velveteen Rabbit* follows Heinemann 1922; title leaf verified, IA `NOT_IN_COPYRIGHT`. For Browne, the 1906 Everyman text is supported by the Dent & Co. imprint and the August 1906 preface; the printing is honestly marked undated. Words match in all four; only the punctuation residues in G1-S1 remain.

## Limits

This is sampled independent agent review. It is not human editorial approval, empirical timing, a measured reading level, or legal advice. Punctuation was image-checked only at OCR-flagged points and in samples; OCR period/comma noise can hide further differences. Blanchan, Bangs and Cox excerpt boundaries were judged from context and coverage, not from every omitted passage. Andersen variants beyond the five image-confirmed nights are reported from OCR. Scratch evidence: `.scratch/daily_reading_corpus/final-review-early/` (uncommitted).

---

## Delta review (2026-10-08)

Same reviewer lane, the same brief and ownership. The record above is unchanged. Contract: `docs/daily-reading.md` `806d2fc9e9e79ece3b297fbf477e2c87c5cad53d08fb090ca27aef45b511d1b2`, which includes the 2026-10-08 misprint rule (785a1ed). The three grade files below did not change during the delta. `node tools/check-daily-reading.js` passes. Novelty against all grades and the weekly inventory shows 0 overlaps of 30+ words for each grade; K's only within-grade overlap is still the Old Woman and Her Pig refrain.

### Delta review (2026-10-08): Kindergarten

SHA-256 `901e8cd44515f08901cdb8a284b710af6732b17d5f30f4a533299e94690df9d0` (commit 4752ce8). The repair changed no reading text: only the Coleridge and Buckley source records and W4D4's `contentNote` changed. Mechanics: 180/180 hashes, 541/541 evidence quotes, continuations valid, maximum 114 words per reading minute, every total 10 minutes.

| Finding | Status | Evidence |
| --- | --- | --- |
| K-S1 Coleridge year | **Resolved** | `publicationYear` 1853; edition and rights cite title page MDCCCLIII and withdraw the 1852 claim |
| K-S2 Buckley year and basis | **Resolved** | `publicationYear` 1902 = first publication of the one-volume text; the scanned printing is honestly marked undated. **Verified myself:** *The English Catalogue of Books* vol. VII (1901–1905; IA `englishcatalogue0007unse`) reads "Buckley (Arabella B.)—Eyes and No Eyes. 48 Clrd. Plates, other Illus. Cr. 8vo. 3s. 6d. … Cassell, Mar. 02". I did not open the vol. X 1920 reissue entry |
| N6 W4D4 ale note | **Resolved** | "ale is a kind of beer, part of this old household scene" |
| N3 timing; N9 refrain overlap | Unchanged notes | — |

Cold reads: none required, since K has no new or restored nights. New note: under the 2026-10-08 rule, the Tailor's printed "aid" (p. 33) and Buckley's missing stops (pp. 11, 17, 18) are failed-type blanks. They *may* be supplied from a later printing if declared; keeping them as printed also complies.

### Delta review (2026-10-08): Grade 1

SHA-256 `f8395faf4ceae5ea63cb9272d769cf53ab20357a4170a44fa9d7174579f09397` (commit 66774e9). There are 32 new or changed texts; 32 old texts were removed or replaced, 17 nights in all were dropped, and the year was resequenced. Mechanics: 180/180 hashes, 552/552 evidence quotes, continuations valid, 9.3–118.5 words per reading minute (none at 120+), totals 10–15. Fidelity: **156/180** match PG exactly. That now includes every Brown legend with its drop-capital opening restored (checked against the PG `cap` divs) and W3D5 without the `[1]` anchor. The other 24 follow dated witnesses. Every word agrees with the witness OCR: Burgess 1914 (9 nights), Rabbit 1922 (8), and MWWC 1911 (7). I fetched 1911 pp. 9–22 and 49–56 myself for the restored tales; only running heads and OCR noise differ.

| Finding | Status | Evidence |
| --- | --- | --- |
| G1-S1 punctuation residues (W5D2, W11D5, W12D2, W22D1, W24D1 of the old file) | **Resolved** | Burgess: no punctuation differences remain against the 1914 OCR at pp. 42–44. Rabbit: "anything." (now W11D3), "night, and" and "picture books" (now W11D5). MWWC: "jolly, round, red" (W22D1); "to sleep." followed by a new paragraph (W24D1). The text matches the page images reviewed on 2026-10-07. The edition fields now state that other punctuation follows PG and was compared only at OCR-flagged points |
| G1-S2 Velveteen opening | **Resolved** | W10D4 begins "There was once a velveteen rabbit…". Image-checked against 1922 p. 1 (PDF p. 15): word for word |
| G1-S3 censorship (14 nights) | **Resolved** | Coverage maps show contiguous text to natural ends: Pooh I through the pop-gun ending (W13D1); Pooh VII from "Nobody seemed to know…" (W17D4); MWWC I, III and XI to chapter ends (W19D3–D5, W20D1–D2, W23D2); Cuthbert, Gerasimus I–II, Blaise, Launomar, Comgall with the mice, Fronto, Rigobert and Francis with Brother Wolf, each from its opening to its end; Christmas Cuckoo and Merrymind contiguous. Hervé was removed as a whole work, a selection choice. Content notes for the restored scenes are factual and do not tell readers to skip |
| N1 timing | **Resolved** | Maximum 118.5 |
| N4 breadth | Note | Pooh, Brown and Browne have 24 nights each and MWWC 23; with OMWW, Burgess has 32 (18%) |
| N6 templated notes | **Largely resolved** | The Browne and Brown boilerplate is gone; one Holbrook sentence recurs 5 times |
| N8 small items | Mostly resolved | Pooh VIII was dropped; the p. 117 lines follow PG, declared; W10D3 (Dog in the Manger) q3 reworded. **Remaining:** 60 locators still cite scratch block indexes (note) |

Blind cold reads (new nights): W19D5, W25D3, W26D2, W29D3, W32D4. 15/15 answers compatible with the notes, which allow alternative readings. All prompts and notes on the other 27 new texts were read; they are text-specific with no factual errors. **No new findings.**

### Delta review (2026-10-08): Grade 2

SHA-256 `22d0525033e81bf78d220cbd56963570cc581f1d89552f746ce683278c1bb014` (commit 751be76). There are 38 new texts, 38 old ones removed (including Cox ×3, Bangs ×2 and Pen and Inkstand ×2), and resequencing. Mechanics: 180/180 hashes, 619/619 evidence quotes, continuations valid, 7.8–122.3 words per reading minute (four nights at 120–122), totals 10–15. Fidelity: **150/180** match their declared transcription exactly. The other 30 are 5 documented Pyle corrections, 1 declared Grahame correction ("won't", W22D3), and 24 Andersen nights now transcribed from the scan.

| Finding | Status | Evidence |
| --- | --- | --- |
| **G2-B1** Andersen not the 1888 text | **Resolved** | `textUrl` is now the Commons DjVu file. The edition says honestly that the Wikisource text was only a draft and that every word was decided on the page images. A word-level diff of all 24 nights against my own OCR of the 1888 scan leaves only OCR noise. Every reading previously shown to be wrong is now as printed: "experiencing evil", "collect its thoughts", "favoured by fortune", "my destiny", "impossibilities", "honour" (8), "neighbour" (5), "into the sweet or sour", "I wonder", "parlour", "peculiar". **Image-checked:** the Flax passage against p. 114 and the Darning-Needle passage against p. 230 match word for word and mark for mark, including the printed "happier that I am now" |
| G2-S1 Pyle year | **Resolved** | 1906, with the leaf n8 (MCMVI) and n9 (1885) evidence quoted |
| G2-S2 Cox `textUrl` | **Resolved** | `pg32210.txt`; all 15 remaining Cox nights match it exactly |
| G2-S3 "won't" and contractions | **Resolved** | Both declared in `edition`; W22D3 prints "won't" |
| G2-S4 censorship (8 nights) | **Resolved** | Coverage maps show Hans in Luck whole (W14D1–D5); Three Spinsters from "There was once a girl who was lazy…" (W15D1); Mother Hulda whole (W16D1–D2); Golden Goose from the opening (W17D1); Oz Chapter II included (W20D3–D4) and Chapter IX from its opening (W36D3); the Dragon contiguous through the second round (W23D5); the Old Street Lamp to its last sentence (W30D3–W31D1). The content notes are factual, for example W30D5 on the 1888 "negroes" passage and W23D5 on Grahame's "Red Indian" and "Oriental" phrases; none tells readers to skip or soften |
| N2 timing | **Resolved** | Maximum 122.3 |
| N6 steering notes; "Spick" | **Resolved** | "rather than dwelling on" removed; W18D2 now notes that "Wing Tip the Spick" is Sandburg's nonsense name |
| N7 Andersen date; Grimm evidence; `[A]` | **Resolved** | Andersen: "title page undated, catalogued 1888". Grimm `evidenceUrl` is now PG's front matter. W16D2 now ends with the book's footnote "[A] In Hesse, when it snows, they say, 'Mother Hulda is making her bed.'" and both contexts explain the mark |

Blind cold reads (new or restored nights): W15D1, W16D2, W20D3, W23D5, W31D1. 17/17 answers compatible with the notes. **No new findings.**

### Delta limits

The OCR-based word diffs cannot see every punctuation difference. Andersen punctuation was image-checked on two pages; the edition reports a full image comparison, which I sampled rather than repeated. Blanchan, Bangs and Cox boundaries were not re-examined beyond context. This remains sampled independent agent review, not human editorial approval, empirical timing, a measured reading level, or legal advice.
