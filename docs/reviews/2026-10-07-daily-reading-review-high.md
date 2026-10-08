# Independent daily-reading review: Grades 9–12

Final high-band review, 2026-10-07. Reviewer: final high-band review agent (independent of every authoring lane). Corpus files were read-only. This report replaces the interim checkpoint report.

**Status:** all four grades reviewed in full scope. Every hash below was re-checked at the end of the review and was unchanged.

| Grade | SHA-256 reviewed | Blocking | Should-fix | Notes |
| --- | --- | --- | --- | --- |
| 9 | `af8618f4fadacc801ace3dda5493bde0df3a8105c1617f5d67a761fe4a00a55b` | 0 | 7 (5 censorship) | 6 |
| 10 | `9750c27b8383dacf3c3eda018e2b9872c67af0b2699ca08479acf86e03bde2ca` | 1 | 10 (3 censorship) | 5 |
| 11 | `77169cb691c5c3c5078809b1ad27c33231abba36b75471034d7354e8d5a985e5` | 1 | 4 (1 censorship) | 6 |
| 12 | `522db8746e41afb29be4cb5526d6176ba7d6c17d4e2773eab592e0deb00309ed` | 2 | 3 | 5 |

## Scope completed versus the brief

| Brief item | G9 | G10 | G11 | G12 |
| --- | --- | --- | --- | --- |
| 1. Bind SHA-256 | Done | Done | Done (final hash) | Done |
| 2. Fidelity, all 180, own downloads | 180/180 | 176/180 after verified corrections | 175/180 | 178/180 |
| Hashes / evidence re-check | 180/180; 540/540 exact | 180/180; 649/649 exact | 180/180; 582/582 (87 whitespace-only) | 180/180; 540/540 exact |
| 3. Rights and edition, every source | 14/14 | 14/14 | 13/13 | 14/14 |
| 4. Read every prompt and note | 540/540 | 544/544 | 541/541 | 540/540 |
| 5. Blind cold reads (12 prescribed + extra) | 12 + 4 | 12 + 4 | 12 + 3 | 12 + 2 |
| 6. Timing, every night | Done | Done | Done | Done |
| 7. Progression and age fit | Done | Done | Done | Done |
| 8. Novelty (30-word) vs 13 grades + weekly inventory | Done | Done | Done | Done |
| Censorship directive | Done | Done | Done | Done |

**Method.** Witnesses were downloaded independently into `.scratch/daily_reading_corpus/final-review-high/src/`. Sources were Gutenberg, Gutenberg Canada, UNC DocSouth, UPenn Celebration of Women Writers, Poe Society, Wikisource rendered pages, the Whitman Archive TEI on GitHub, and Internet Archive OCR plus page images. The comparison uses my own extractor (`scripts/fidlib.py`, `fid_g9.py` … `fid_g12.py`), not the authors' scripts or block files. Each night must occur contiguously in its witness after whitespace collapse and removal of that source's declared apparatus only. A second pass checks that block boundaries fall on witness breaks.

For Wikisource texts with logged corrections (G10 Washington, Chopin, Wharton, Crane), every corpus/Wikisource word difference was classified against the OCR of the declared dated scan. Samples were then checked on page images. Cold reads used a student-only view, and answers were hash-sealed before notes were opened (`cold/`, `out/answers-sealed.sha256`).

## Grade 9

`node tools/check-daily-reading.js` passes.

| Check | Result |
| --- | --- |
| Fidelity | 180/180. Lazarus scan corrections checked on pp. 217, 220, 221. Austen rejoins after illustrations are declared. |
| Rights/edition | 14/14 confirmed on title matter or catalogue. Disclosed residuals (Poe via Society transcriptions, Old Christmas punctuation repairs, Lazarus corrections) verified as described. |
| Cold reads | 12/12 blind, 36/36 agree. Supplementary Douglass w08-d1, Franklin w20-d4, Washington w26-d3, Crusoe w36-d5: 12/12 agree. |
| Timing | Maximum 149 words per reading minute (w10-d2). Totals 25–29. |
| Prompts | 540 distinct prompts; no templates; no hidden referents. |
| Novelty | Only the accepted overlap (w25-d1 with Grade 8 w35-d1, Ancient Mariner). |
| Progression | Austen 25 nights is the largest source. Genre note: novel 43, poetry 45, memoir 40, literary prose 30, essay 20, introduction 2. |

## Grade 10

The validator passes.

| Check | Result |
| --- | --- |
| Fidelity | 150/180 match a witness exactly after declared normalization. The other 30 differ from raw Wikisource or Gutenberg only where the source declares a correction. I classified all 120 word-level differences against the dated-scan OCR: Washington 13 nights, Chopin 11, Wharton 2, Crane 1, plus Silas "bit of pork" and Cather's footnote marker. Every corrected reading is supported. Page images confirm: Washington pp. 15 ("knew", "This is not true") and 66 ("ever since"); Wharton pp. 13 ("Hale's") and 76 ("try"); Silas p. 78 ("bit of pork"). Chopin's restored comma ("Why, it seems") is confirmed by OCR. **Four nights still carry text errors**: w05-d4 (blocking), w23-d2, w11-d2, w16-d1. A fifth, w08-d4, has a punctuation error (see Findings). |
| Structure | All boundaries fall on witness breaks. Addams has 10 rejoins around illustrations and Thomas "Tears" has the joined "out"; both are declared. |
| Rights/edition | 14/14. Gutenberg catalogue "Public domain in the USA" confirmed for 1260, 19810, 22423, 16376, 2002 and 1020. Title matter confirmed: Service & Paton 1897, Houghton Mifflin 1918, Selwyn & Blount 1917, Caradoc 1906, Macmillan 1917. IA NOT_IN_COPYRIGHT flags confirmed for Chopin 1899, Wharton 1911, Crane (1896 printing), Silas (1861) and Lowell (1914). UPenn Addams (Macmillan 1912, copyright 1910) and Millay (Kennerley 1924, fourth edition) confirmed. Gilman's Small, Maynard MCMI title page (copyright 1892/1899) confirmed in the scan. The Washington IA item has **no** copyright-status flag, contrary to its rights basis (should-fix). |
| Coordinator checkpoints | Washington 75 / Chopin 34 + comma / Wharton 2 / Crane 1 corrections: verified as above. Addams uses the UPenn 1912 text. Lowell uses the bounded fallback, and 1914 OCR spot checks agree, including "Left-over" and stanza grouping. Gilman (w35-d3..d5) and Awakening XXXIX (4 new questions) were read in full and cold-read. Crane w29-d4 runs at 169 wpm. Punctuation was sampled, not collated. That sampling found "to day" (print "to-day"), "difficulty Most" (print "difficulty. Most") and ", ,". |
| Cold reads | 12/12 blind, 36/36 agree. Supplementary Awakening XXXIX w23-d4, Gilman w35-d5, Browning w30-d2, Washington w08-d4: 14/14 agree. |
| Timing | Maximum 169 wpm (Crane w29-d4, 3,714 words in 22 min). Then Cather w31-d5 at 152. No prose night exceeds 180. Poems 7–42 wpm, leaving rereading time. Totals 26–30. |
| Prompts | 544 distinct prompts and skeletons. The helpers' questions are text-anchored, with no name-swapped templates. The new Gilman and XXXIX questions are strong and open to more than one reading. **All 60 poetry `context` fields end with the same boilerplate sentence** (should-fix). |
| Novelty | No 30-word overlap with any grade or the weekly inventory. |
| Progression/age fit | Jane Eyre I–X and Silas → Awakening/Ethan → Cather, Crane, Gilman, with a parallel poetry strand (Thomas, Browning, EBB, Lowell, Millay). Coherent and age-appropriate. Genre note: novel 90, poetry 60, memoir 27, story 3, with no essay or documentary prose (owner decision: note only). |

## Grade 11

The validator passes on the final hash; only w35-d4 (Riis ch. XX) changed in the last revision.

| Check | Result |
| --- | --- |
| Fidelity | 175/180. **The Waste Land w21-d1..d5 does not reproduce the declared 1922 Boni & Liveright text** (blocking). Whitman matches the Whitman Archive TEI word for word, but line-break joins create run-together words and stray print hyphens (should-fix). All other sources match: Darwin, Emerson, Stein, Twain, Riis, Douglass (UNC), Du Bois (UNC), Sinclair, Prufrock, Walden. |
| Rights/edition | 13/13. Checks covered Gutenberg US labels, UNC NoC-US, Whitman TEI (McKay 1891–92) and Wikisource indexes (Jungle Doubleday 1906, Prufrock Egoist 1917, Walden Ticknor 1854). Also checked: the Twain Osgood 1883 title-page image and Riis Scribner (copyright 1890). |
| Cold reads | 12/12 blind, 36/36 agree. Supplementary Riis w32-d4 and w35-d4 (the revised night) and Waste Land w21-d5: 10/10 agree. |
| Timing | Prose maximum 112 wpm. Lilacs w27-d3 (2,183 words in 18 min) leaves little rereading time (note). |
| Prompts | 541 distinct prompts; notes strong. The one deictic flag (w10-d2 q1) refers to the visible passage. |
| Novelty | No overlap. |
| Progression | Coherent American-voices year. Genre note: essay 50, poetry 42, scientific prose 18, autobiography 18, narrative 18, memoir 16, prose poetry 10, documentary prose 8. |

## Grade 12

The validator passes.

| Check | Result |
| --- | --- |
| Fidelity | 178/180. w33-d3 and w33-d4 each omit a verse line (blocking). w03-d5 drops a printed section break. |
| Rights/edition | 14/14. |
| Cold reads | 12/12 blind, 36/36 agree. Supplementary Donne w09-d3 and Oedipus w33-d4: 6/6 agree. |
| Timing | Maximum 136 wpm. Totals 27–30. |
| Prompts | 540 distinct prompts; no templates. |
| Novelty | No overlap. |
| Progression | A demanding capstone. Genre note: essay 55, poetry 40, short fiction 25, fiction 25, drama 25, dialogue 10. |

## Findings

Each correction to block text needs `excerpt.textHash` recomputed.

| Grade | Night / source | Severity | Finding | Evidence |
| --- | --- | --- | --- | --- |
| 10 | reading-10-w05-d4, block 0 and `excerpt.locator` (Washington ch. IV) | blocking | The text begins " the end of my first year at Hampton I was confronted with another difficulty Most of the students…". The drop-cap word "AT" is lost (a leading space remains) and the period after "difficulty" is missing. The locator repeats the defect. | 1901 Doubleday p. 63 (IA upfromslaveryaut00wash_0 image n78): "AT the end of my first year at Hampton I was confronted with another difficulty. Most". Wikisource has a drop-initial span plus "T the end of first year…". |
| 11 | reading-11-w21-d1..d5 (The Waste Land) | blocking | The text is not the declared 1922 Boni & Liveright edition. The corpus has "w[a]ter" (an editorial bracket), "IT'S" ×5, "don't", "won't" and "all right". Other variants: "O keep the Dog", "smooths", "to-night" and "Der-Heimat zu". The w21-d1 content note claims fragments are "as Eliot wrote them". | IA wasteland01elio images n25–n27 read "The hot w ter at ten.", "HURRY UP PLEASE ITS TIME", "dont", "wont". The OCR also reads "Oh keep the Dog", "smoothes", "profusion;", "tonight", "Der Heimat zu,". Re-transcribe from the facsimile, or re-declare a different edition. |
| 12 | reading-12-w33-d3 (Murray, Oedipus) | blocking | Missing line: "From thee in great peril fell peace upon my heart," | PG27673 line 2632 (bare text outside the `iN` span). |
| 12 | reading-12-w33-d4 | blocking | Missing first line of the Leader's speech: "O fallen, fallen in ghastly case,". | PG27673 line 2744. |
| 10 | reading-10-w23-d2, block 51 (Awakening XXXIII) | should-fix | "I always knew him—that is, , it is only of late…": a stray comma left after the Wikisource dittography was removed. | 1899 Stone p. 260 (IA awakeningthe00choprich image n273): "that is, it is only". |
| 10 | reading-10-w11-d2, blocks 2 and 10 (Addams) | should-fix | "our self- government" and "came to Hull- House" carry stray spaces after the hyphen. | UPenn 1912 transcription: "self-government", "Hull-House". |
| 10 | reading-10-w16-d1, block 1 (Silas IV) | should-fix | "during the owners absence" is a Gutenberg Canada error, retained without being declared. | 1861 Blackwood p. 72 (IA image n81): "owner's". Correct it and log it beside "bit of pork". |
| 10 | reading-10-w08-d4, block 0 (Atlanta) | should-fix | "We have with us to day…". | 1901 OCR: "to-day". |
| 10 | reading-10-w09-d4 `title` | should-fix | "A London Thoroughfare.  2 a.M." has a casing bug and a double space. | PG1020 and 1914 OCR: "A London Thoroughfare. 2 A.M." The double space also appears in w33-d4 "The Precinct.  Rochester". |
| 10 | 60 poetry nights, `context` | should-fix | Template: every poem context ends "Suggested reading time includes repeated oral reading, annotation of the named features, and testing an alternative interpretation; a first silent pass will be shorter." It is a timing rationale addressed to adults, shown to students. No other high-band grade has it. | e.g. w03-d1, w30-d2, w36-d5. Move it to facilitator guidance or delete it. |
| 10 | Washington source `rights.basis` | should-fix | Says "The dated Internet Archive scan is marked NOT_IN_COPYRIGHT." The item carries no copyright-status field (unlike the Chopin, Wharton and Crane items). PD status is unaffected (1901). | IA metadata for upfromslaveryaut00wash_0. Reword to rest on the 1901 date. |
| 10 | Cather, Ethan Frome, Awakening | should-fix | Censorship directive. | See the directive table. |
| 11 | Whitman nights | should-fix | `<lb/>` turnovers were joined without a space. This creates 20 run-together words: w04-d1 "large-sized,flickering", "studded,breaking"; w06-d3 "chaste,matured"; w23-d5 ×6; w25-d1 "batteries,cavalry"; w28-d1 "stars,dart"; w28-d4 ×9 (e.g. "river,half", "have!the"). Print hyphenation also shows mid-line: perma-nently, return-ing, hence-forward (w23-d5); care-fully (w24-d3); mid-night (w25-d1); fall-ings, tumultu-ously, day-break (w26-d5); chim-neys, feast-ings, trans-parent, unfal-teringly (w27-d3); accouche-ment (w28-d4). | Whitman Archive TEI ppp.00707. Use TEI `reg` for split words; insert a space at a bare `<lb/>` except after an em dash. |
| 11 | Emerson, 18 nights | should-fix | 181 editorial note references "[n]" in student text, e.g. w18-d4 "chancery,[457]". | PG16643 apparatus; delete and declare. |
| 11 | Darwin, Emerson, Stein | should-fix | Gutenberg hard wraps are kept inside paragraph blocks: Darwin 81/81, Emerson 93/93, Stein 141/167. The app's `white-space: pre-line` shows them as broken lines, and Stein's prose poems look lineated. | `src/styles/daily-reading.css`; join the wraps with spaces. |
| 11 | Sinclair | should-fix | Censorship directive. | See the directive table. |
| 12 | reading-12-w03-d5 (Eveline) | should-fix | The printed section break (row of dots) is silently removed. | 1917 Huebsch p. 47. |
| 12 | reading-12-w34-d4 | should-fix | "0 villain" (zero) is a Gutenberg error, retained without being declared. | PG49008 line 2588. |
| 12 | reading-12-w08-d3 `challenge` | should-fix | "a imagined" should be "an imagined". | — |
| 9 | Douglass nights | should-fix | Censorship directive. | See the directive table. |
| 9 | reading-9-w24-d2 `context` | should-fix | "This printing omits several notes present in other editions" is inaccurate. The 1914 printing has footnotes [1]–[4]; the selection omits them. | PG40196 markers. |
| 9 | reading-9-w27-d2 `excerpt.locator` | should-fix | Leaks "christmas1886.txt, source blocks 178–208" and has an unbalanced quote. | — |
| 10 | Washington question set and framing | note | Eight prompts use a "does this prove a universal claim?" frame: w02-d3 q2, w05-d1 q3, w05-d3 q1, w05-d4 q3, w05-d5 q3, w08-d2 q3, w08-d3 q3, w08-d5 q2. The shared content note says his judgments are "claims to examine, not conclusions supplied by the course", and the w08-d4 context steers ("not as a settled statement of what justice requires"). Each item is defensible, but the stance is one-directional. | Consider prompts that reconstruct his reasoning on its own terms. |
| 10 | reading-10-w35-d3 q3 note | note | Cites the "gnawed bedstead", which appears only in part 3 (w35-d5). Part 1 has the heavy bed "through the wars". | — |
| 10 | Red Badge (9 nights) | note | Ends at ch. IX (Jim's death, which is included). The title wound (ch. XII) and Henry's return are absent, so the novel's ironic arc is unresolved. Scope, not censorship. | Gap analysis. |
| 10 | reading-10-w16-d1 q1/q2 evidence | note | Evidence quotes "a hundred and twenty" and "mist" are too thin to anchor the claims. | — |
| 10 | Genre balance | note | No essay or documentary prose (owner decision; note only). | — |
| 11 | reading-11-w35-d1 `contentNote` | note | "the discussion examines it rather than repeating it" is borderline steering. Reword as a plain warning. | — |
| 11 | reading-11-w20-d3; w16-d3 | note | The Du Bois German line is made a separate block though the witness runs it in-paragraph. Two w16-d3 blocks end with a stray "\n". | UNC Souls. |
| 11 | Sinclair; Stein | note | A verse quotation is typed as a paragraph. Stein's title page names only "1914"; the imprint could name Claire Marie. | — |
| 11 | reading-11-w27-d3 (Lilacs) | note | 2,183 words in 18 minutes leaves almost no time to reread a long elegy. | — |
| 11 | Riis | note | Ethnic chapters V–XIII are absent, but the selection is a defensible argument spine. w36-d5 keeps the Italian-mother stereotype, so this is not avoidance. | Gap analysis. |
| 11 / 9 | Bondage ch. V–VI; Narrative | note | Aunt Esther and Demby are absent from both grades. Fix this in G9 (directive table). | — |
| 9 | Washington `edition`; w06-d4 note; late-year plateau; Frankenstein underscores; w13-d4 locator | note | As reported at the checkpoint: undeclared footnote removal, an over-cautious content note, Character Building's lower merit, `_italic_` markers, odd paragraph numbering. | — |
| 12 | Internal locators; w14-d5; Hopkins turnovers; w22-d5; Milton 1890 | note | As reported at the checkpoint. | — |

## Censorship-directive table (owner directive, `docs/daily-reading.md`, 2026-10-07)

The motive is undocumented except where the corpus states it (G9 w02-d5). The flags below rest on the shape of each selection: otherwise continuous runs stop, or skip, exactly at the violent, sexual or slur-bearing scenes. The flags hold even if the omissions were unintended, because each scene is essential on literary merit.

| Grade | Night | Current boundary | Material avoided | Merit-based boundary |
| --- | --- | --- | --- | --- |
| 9 | reading-9-w02-d5 | Stops before Demby's killing (the context says so) | Ch. IV killing | Continue through "…stained with his brother's blood." |
| 9 | reading-9-w02-d1 | Mid-Ch. I | Aunt Hester's whipping | To the end of Ch. I ("…the bloody scenes that often occurred on the plantation."), or split across two nights. |
| 9 | reading-9-w05-d1 | 284 words | Auld's prohibition (with the slur) and "the pathway from slavery to freedom" | Through "…at whatever cost of trouble, to learn how to read." |
| 9 | (Ch. VII absent) | — | Learning to read, *The Columbian Orator* | Replace w05-d4 with Ch. VII from "I LIVED in Master Hugh's family about seven years." |
| 9 | reading-9-w02-d2 | Ends at the field horn | Mr. Severe and the songs passage | To "…prompted by the same emotion." |
| 9 | reading-9-w11-d2/d3 | — | Gardner shipyard assault | Optional. |
| 10 | Cather Book I: between w28-d2 and w28-d3, and between w28-d5 and w31-d1 | Book I runs through chs. I–VII, IX, XI–XIII and XVII. The w31-d1 context only reports "Mr. Shimerda has died by suicide". | Ch. VIII (Pavel and Peter's wolves story, 2,601 words) and chs. XIV–XVI (the suicide's discovery, inquest and crossroads burial, 5,746 words): the darkest and most essential episodes of Book I. Book II ch. VII (Blind d'Arnault) and ch. XV (Wick Cutter's assault) are also absent (note). | Replace w28-d4 (XI–XII) or w28-d5 (XIII) with ch. VIII. Replace w31-d2 (Book II ch. II) with ch. XIV (2,246 words); add ch. XVI (1,167) if a further night can be freed. |
| 10 | Ethan Frome (w23-d5 … w29-d3) | Nine continuous nights, prologue to ch. V, then stop | Chs. VI–IX and the Epilogue (16,170 words). This includes the sled run into the elm, a suicide attempt and the event the frame narrator is investigating. The w23-d5 context names "a disabling accident" that students never read. | Replace w26-d3 (ch. II) and w29-d3 (ch. V) with ch. IX from "They had reached the top of School House Hill" to the chapter end (2,535 words) and the Epilogue (1,702 words). |
| 10 | Awakening, between w23-d1 and w23-d2 | Ch. XXVI, then XXXIII | Chs. XXVII–XXVIII (Arobin's kiss, "the first kiss of her life to which her nature had really responded"; 720 words), the only depiction of the affair. w23-d4 relies on it ("To-day it is Arobin"). Adèle's childbirth (XXXVII) is summarized in context (note). | Append XXVII–XXVIII to w23-d1: about 2,700 words; add 2 reading minutes. |
| 11 | Sinclair, between w08-d2 and w29-d5; w35-d5 | Ch. 3 absent; w35-d5 stops before the end of ch. 9 | The killing-floor tour (ch. 3), and the closing passage of ch. 9 from "There was another interesting set of statistics…" to "…Durham's Pure Leaf Lard!" (the tank-room deaths): the novel's most famous scenes | Replace e.g. w31-d4 or w30-d3 with the ch. 3 tour. Extend w35-d5 to the end of ch. 9. |
| 9 | Wheatley (8 poems) | — | "On Being Brought from Africa to America" is not selected though it is in the witness | Note only. If it was excluded for its language, an 8-line night pairs well with "To the University of Cambridge". |
| 9–12 | All other excerpted works | — | Gap analysis covered Frankenstein, Crusoe, Austen, Franklin, Jane Eyre (red-room, flogging, Helen's death included) and Silas (Molly's opium death included). It also covered Washington, Addams, Gilman (complete), Red Badge (Jim's death included), Riis, Douglass's *My Bondage* (Auld slur included), Conrad, Hamlet, Turn of the Screw, Woolf and Dubliners. | No flag. Boundaries are length- or scope-driven. |

No note in Grades 9–12 tells readers to skip, soften or substitute words.

## Limits

- **Nature of the review.** This is a sampled independent agent review: mechanical checks on every selection, 12 prescribed blind cold reads per grade plus supplements, and a full read of prompts and notes. It is not human editorial approval, empirical timing, a measured reading level, or legal advice.
- **Fidelity basis.** Fidelity is judged against the downloaded transcriptions. The scan-backed G10 sources were collated word-level against IA OCR, which is noisy, and verified on page images only by sample (nine G10 pages; plus Lazarus pp. 217/220/221, Dubliners p. 47 and Waste Land n25–n27). Punctuation was not fully collated in any grade.
- **Unavailable witnesses.**
  - The Whitman Archive website is behind Cloudflare, so its GitHub TEI was used.
  - The UVA Waste Land TEI returned an empty response, so the IA facsimile OCR and images were used instead.
  - The first IA download of the Ethan Frome OCR failed with HTTP 500; it was later fetched from the item's storage server.
- **No scans used.** Jane Eyre, Cather, Thomas, Browning and EBB were checked against their Gutenberg transcriptions of the stated editions, not against scans.
- **Rights.** US rights conclusions rest on publication dates and repository statements.

Scratch evidence is in `.scratch/daily_reading_corpus/final-review-high/`:

- `out/fid_g*_report.txt`, `out/fid_g10_diffs.txt`, `out/ocr_verify_g10.txt` and `out/ocr_collate_g10.txt`
- `src/g10/scans/` (page images)
- `cold/`
- `scripts/`

## Delta review (2026-10-08)

This section records a review of the repaired files against the findings above. The original record above is unchanged.

**Hashes reviewed and re-checked at the end:**

| Grade | Repair commit | New SHA-256 |
| --- | --- | --- |
| 9 | `04ca013` | `7dbd8002e4c3d53609ec8da6c2ff82e3322135b03d659281a3a5d9bd0b74999e` |
| 10 | `1fee84a` | `5054038f2911a80b3b76d2b39eceb50c32482d929ca24bc2cac17debf10fb514` |
| 11 | `874feb4` | `d6271649e9fc68d8f3e5562be0c6f1aeccdb37ddac178a6f56116d3eea7a6f3a` |
| 12 | `73a5f73` | `59b931c279ac318187556c46b8ef8c8bd4f3e8f8e9d5ec1233fd028bf4e5cf60` |

**Method.**

- The validator passes.
- These checks were re-run on all 720 nights:
  - textHash and evidence quotes;
  - prompt-template scan and typo scan;
  - 30-word novelty against all grades and the weekly inventory;
  - timing;
  - leading/trailing whitespace, doubled punctuation and mid-sentence line breaks.
- Fidelity was re-run on every night with the same extractors. The streams were adjusted only for each source's newly declared normalizations: Whitman TEI `reg` for turnover-split words, Emerson `[n]` removal and joined wraps.
- **Blind cold reads.** I read 17 new or restored nights blind (4–5 per grade), plus one G12 night I had seen before. Answers were sealed before notes were opened (`dl/cold/`).
- **Page images.**
  - Waste Land: n15, n16, n21 and n44, plus n25–n27 from the original review.
  - Ethan Frome: 1911 pp. 180, 185 and 193.
  - Oedipus: 1917 pp. 73 and 76.
  - Plato: 1901 p. 219.
  - Douglass: 1845 pp. 7 and 32.

### Grade 9 — `7dbd8002…`

The checks show:

- fidelity 180/180;
- hashes 180/180, with 556/556 evidence quotes exact;
- 548 distinct prompts;
- novelty: only the accepted Ancient Mariner overlap, now with Grade 8 w34-d5;
- maximum 149 wpm;
- blind cold reads w02-d1, w02-d2, w02-d5, w05-d1: 20/20 agree.

| Finding | Status |
| --- | --- |
| w02-d5 Demby killing | Resolved; continues through "…stained with his brother's blood." |
| w02-d1 Aunt Hester | Resolved; runs to the end of Ch. I. |
| w05-d1 prohibition and "pathway" | Resolved. It now ends at "…gained from my master". The continuation is in the G9 weekly course, week 36. |
| w02-d2 Mr. Severe and the songs | Resolved. It ends before the week-16 weekly paragraph. |
| Ch. VII not added | **Accepted.** The weekly inventory holds Ch. VII complete (G12 week 4) and in parts (G12 week 15; G9 week 33; G8 weeks 25–36). Any Ch. VII night would break the 30-word novelty rule, and the scene is taught in the program. |
| w11-d2/d3 shipyard assault (optional) | Not taken up; remains optional. |
| w24-d2 context; w27-d2 locator | Resolved. |
| Notes from 2026-10-07 | Unchanged; they remain notes. |

**New findings: should-fix.** These are transcription errors from the UNC source, retained without being declared. The Douglass `edition` declares only "spelling and punctuation retained". The 1845 scan is IA narrativeoflifeo1845doug.

- **w02-d1, last block:** "be commenced to lay on the heavy cowskin" should be "he commenced" (1845 p. 7, image checked). This text was newly added by the repair.
- **w02-d4:** "not dreaming that be had been conversing" should be "he had" (1845 OCR).
- **w11-d3:** "only when be ceases to be a man" should be "he ceases" (1845 OCR).
- **w05-d1, block 0 and locator:** "My new mistress. proved" should be "My new mistress proved" (1845 p. 32, image checked). The content note "The source transcription's punctuation is retained" should then go.
- **w02-d2, block 7:** the two-line song "“I am going away to the Great House Farm! / O, yea! O, yea! O!”" is merged into prose. The source edition says quoted verse keeps its lines, and the UNC TEI marks it `lg`. Split it into a stanza block.

### Grade 10 — `5054038f…`

The checks show:

- fidelity: 148 nights match a witness exactly; every differing word was classified against the dated-scan OCR;
- hashes 180/180, with 653/653 evidence quotes exact;
- 550 distinct prompts;
- novelty 0;
- maximum 169 wpm (Crane w29-d4); among new nights, Cather w31-d2 is highest at 159 wpm (3,505 words in 22 min);
- blind cold reads w28-d3 (Cather VIII), w31-d1 (XIV), w29-d2 (Ethan IX), w29-d3 (Epilogue), w23-d1 (Awakening XXVI–XXVIII): 20/20 agree.

| Finding | Status |
| --- | --- |
| Blocking: w05-d4 "AT" and "difficulty." | Resolved in the block and locator. |
| w23-d2 ", ," | Resolved. |
| w11-d2 "self- government", "Hull- House" | Resolved; Addams is now 12/12. |
| w16-d1 "owners" | Text resolved ("owner's"). **Remaining should-fix:** the Silas `edition` still lists only "bit of pork" and says "No other wording is altered"; log "owners" → "owner's" (1861 p. 72). |
| w08-d4 "to day"; w09-d4 title | Resolved ("to-day"; "A London Thoroughfare. 2 A.M."). |
| Poetry timing boilerplate (60 contexts) | Resolved; 0 remain. |
| Washington `rights.basis` | Resolved; now says the IA record has no status field. |
| Washington framing (note) | Resolved. The content note now says "reconstructs his reasoning and then weighs it". All eight prompts now ask for his argument first and evaluation second. |
| Censorship: Cather | Resolved. Ch. VIII is in w28-d3; chs. XIV and XV–XVI are in w31-d1 and w31-d2; Book I is now complete except chs. X, XIII, XVIII and XIX. Book II is cut to chs. VIII–IX and XIV, so Blind d'Arnault (ch. VII) and Wick Cutter (ch. XV) remain absent (note, as before). |
| Censorship: Ethan Frome | Resolved. Ch. IX from "They had reached the top of School House Hill" is in w29-d2, and the Epilogue is in w29-d3. The old ch. II (part 1) and ch. V nights were dropped; the w26-d3 context bridges the gap. |
| Censorship: Awakening | Resolved; XXVII–XXVIII are appended to w23-d1 (2,698 words in 18 min). |
| Notes: w35-d3 gnawed bedstead; w16-d1 evidence | Resolved. |
| Notes: Red Badge scope; genre balance | Unchanged; still notes. |

**Ethan Frome emendations: meets the contract, with two fixes.**

The page images show the 1911 first printing has physically missing type in four places:

- p. 180: "said  o yourself";
- p. 185: "und r";
- p. 193: "fo  her" and "con idering".

The corpus supplies "so", "under", "for" and "considering". Each reading is unambiguous, and the change is declared in `edition`. That makes it a documented normalization, not a "fabricated restoration" (`docs/daily-reading.md`). The quotation-mark correction (`go;" and`) also matches the print, p. 193.

- **Should-fix:** the `edition` says the emendations are "listed with each night", but neither w29-d2 nor w29-d3 lists them. Add them to those locators, or change the claim.
- **Note:** name the later printing consulted.
- **Note on consistency:** G11 keeps the 1922 Waste Land's missing letter ("w ter"), while G10 supplies Ethan's. Both are declared, but the corpus should state one convention.
- **Note:** the Epilogue's section ornament, which marks the move to the next morning, is omitted as declared. Grade 12 now reproduces Eveline's equivalent break; consider reproducing this one too.

**New finding: should-fix.**

- **reading-10-w28-d3 `context`:** "Jim and Ántonia first met the Russian bachelors Peter and Pavel on a visit to their farm (Chapter IV)". The visit is in Book I ch. V, which is in w25-d5, and "Pavel was not at home" on that visit. Suggested wording: "…first visited Peter at the Russians' farm (Chapter V); Pavel was away."

### Grade 11 — `d6271649…`

The checks show:

- fidelity 174/180 against the witnesses as extracted; all six differences are accounted for (details below);
- hashes 180/180, with 589 evidence quotes exact and 1 whitespace-only (w14-d2 q2, a verse line break);
- 541 distinct prompts;
- novelty 0;
- maximum 112 wpm;
- blind cold reads w29-d5 (Jungle ch. III), w36-d3 (end of ch. IX), w21-d2 and w21-d3 (Waste Land): 12/12 agree.

The six differences:

- **Waste Land, 5 nights:** these fail only against the noisy OCR stream. Collated line by line against the facsimile, all 439 lines are found. The 9 lines my letter-match flagged are all OCR noise (accents, italics, small capitals).
- **Sinclair w31-d1:** fails only because of a Wikisource `wst-gap` spacer in "Dom. Namai. Heim."

| Finding | Status |
| --- | --- |
| Blocking: Waste Land edition | **Resolved.** The text was re-sourced from the facsimile. Page images confirm "Od' und leer" (p. 13), "Der Heimai zu," (p. 12), "carvèd" (p. 18), "mount in" (p. 41) and "w ter" / "ITS" / "dont" / "wont" (pp. 22–24). The corpus now has 5× "HURRY UP PLEASE ITS TIME", "alright", "tonight", "smoothes" and "Oh keep the Dog", and no "IT'S" or "[a]". The w21-d1 content note now says "as printed in the 1922 edition, including its misprints". |
| Whitman run-together words and print hyphens | Resolved. 14/14 match the TEI with `reg` used for turnover splits and a space at `<lb/>` except after an em dash. No run-together words remain. |
| Emerson "[n]" | Resolved: 0 remain, and the removal is declared. |
| Hard wraps (Darwin, Emerson, Stein) | Resolved for those sources. **New should-fix:** Walden keeps four stray mid-sentence breaks that the review missed on 2026-10-07: w22-d5 block 1 "With \nrespect", w23-d3 block 3 "his \nthoughts?", w28-d5 block 0 "A written \nWord", w30-d4 block 0 "stand \naloof". Join them with a space. |
| Censorship: Jungle | Resolved. The ch. III hog-killing tour, including "the hog-squeal of the universe", is now w29-d5; the end of ch. IX through "…Durham's Pure Leaf Lard!" is now w36-d3. The cattle killing-beds pages of ch. III remain absent; this is length-driven (note). |
| Notes | Resolved: w35-d1 content note, Du Bois blocks, Sinclair verse now a stanza, Lilacs now 20 reading minutes. Unchanged: Stein imprint (Claire Marie not named) and Riis. |

### Grade 12 — `59b931c2…`

The checks show:

- fidelity 178/180, where the two differences are the declared corrections ("O villain"; the Eveline dot row);
- the other checks are unchanged;
- cold reads w03-d5, w33-d3, w34-d4 (blind) and w33-d4 (not blind): 12/12 agree.

| Finding | Status |
| --- | --- |
| Blocking: w33-d3 missing line | Resolved. The 1917 Allen print, p. 73, confirms "From thee in great peril fell peace upon my heart," at the outer margin, as placed. |
| Blocking: w33-d4 missing line | Resolved. The 1917 print, p. 76, confirms "O fallen, fallen in ghastly case,". |
| w03-d5 Eveline break | Resolved: a row of nine spaced periods, declared in `edition`. |
| w34-d4 "0 villain" | Resolved and logged in `edition`. |
| w08-d3 "a imagined" | Resolved. |
| "obects" (w14-d2) | Confirmed as printed: Colonial Press 1901 p. 219, Commons djvu page 329. Wikisource marks it [sic]. It is covered by the Plato `edition`'s "apparent source transcription errors are retained". Optional note: a [sic]-style gloss in the context would help students. |
| Notes from 2026-10-07 | Unchanged; they remain notes. |

### Delta limits

- **Sampling.** Image checks were sampled. Punctuation was still not fully collated.
- **Douglass check.** The 1845 OCR collation was word-level only, and OCR noise is heavy. Further UNC-only errors of the "be/he" kind may remain beyond the three found by targeted search.
- **Waste Land check.** The line collation compared letters only; punctuation was checked only on the imaged pages.
- **Reveals.** One G12 cold read (w33-d4) was not blind.
- **Not checked.** The 2026-10-08 commits also touched `content/reading-level/probes.json` (G11) and other grades. Those files are outside this band and were not reviewed.
