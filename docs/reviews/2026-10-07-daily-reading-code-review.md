# Daily reading platform: independent code review

Reviewer: `code_cold_review`. Date: 2026-10-07. Status: **no outstanding substantive platform findings in the reviewed snapshot**. This is structural and implementation review, not approval of the literary corpus, rights research, age suitability, or teaching quality.

## Scope and evidence

Read the daily-reading contract, builder, read-only checker, pure library, page controller, renderer, HTML/CSS, and tests. Reviewed counts and ordering, progression, source and question references, continuation links, time budgets, text identities, evidence matching, route recovery, asynchronous loading, student exports, source links, print privacy, and mobile/keyboard structure. The later shared-integration review is recorded below.

`/usr/bin/node --test test/daily-reading.test.js | tail` passed **15 tests, 0 failures** after the repair and optional-credit follow-up below. Synthetic fixtures cover complete and incomplete grades/corpora, exact hashes, malformed references and dates, time arithmetic, continuations, duplicate selections, bibliographic duplicates, safe rendering, selection-level attribution, and student projections/downloads. The fixture build confirms that failed admission preserves an existing valid output. Its temporary scratch directories are removed by the tests; this reviewer did not rebuild `dist/`, start a browser/server, commit, or push. JavaScript syntax and `git diff --check` passed.

An additional exhaustive check passed **2,340 exact grade/week/day route roundtrips**, first/last-night boundaries, and next/previous inverse links. A separate in-memory harness executed the actual page controller with delayed fetches: neither an older grade's late successful response nor its late failure replaced a newer selected grade. This tests controller behavior with minimal DOM objects, not browser layout or assistive technology.

## Finding and closure

**P3: repeated bibliography records could inflate the ten-source requirement.** Reproduced admission of ten source records with identical bibliography and different IDs, with every ID used. The platform author now rejects duplicate normalized author/title/translator/edition/publication-year/translation-year tuples. IDs, URLs, and rights-review prose cannot make the same bibliographic entry distinct. Inspected the change and reran the regression that varies those irrelevant fields while preserving the same bibliography; finding closed. This check does not establish literary breadth or detect every differently described edition of the same work.

The mobile control review also identified inherited 13px select text. The author set selects to `1rem` and shortened grade options to K/1–12 while retaining full accessible labels. Actual mobile layout and native-control behavior remain browser checks.

## Reviewed guarantees and limits

- Each admitted grade has exactly 180 records in the prescribed week/day order with deterministic day IDs. Complete-corpus admission combines valid grades, grade uniqueness, and 13 records to require every grade K–12 and 2,340 nights. Progression ranges cover weeks 1–36 without gaps or overlaps. Questions and sources resolve, IDs remain unique across the corpus, and every declared source is used.
- Continuations require reciprocal links to the immediately adjacent day, the same source, and non-complete-work declarations. They cannot skip nights or imply an uninterrupted continuation across unrelated sources. This verifies declared relationships, not literary excerpt boundaries or recap quality.
- Positive integer reading/discussion minutes must add to the total and fall within the grade's declared range. The validator does not infer reading speed, difficulty, or appropriate reading mode from the text.
- Text hashes use exact UTF-8 block text joined with two newlines and normalized to NFC, without trimming. Duplicate checks compare whitespace-normalized text within and across grades. Quoted question evidence must occur in that normalized text. These checks do not prove source fidelity, detect all near-duplicates, or establish that a quoted phrase supports an interpretation.
- Bibliographic and rights fields require explicit translator/date pairing, valid dates, US public-domain declarations, basis text, and safe HTTPS source/evidence URLs. Their truth remains a source-research responsibility; declared rights are not legal proof, and authentic editions are not identified merely by their host name.
- The browser validates the index's grade identities and constructs local grade-JSON paths itself rather than trusting an index-supplied path. Route parsing accepts exact bounded forms and safely falls back on malformed links. A request counter protects current rendering and error state from stale fetches. Skip navigation preserves the reading hash; picker changes preserve picker focus.
- Reading blocks and metadata become text nodes. Stanza line breaks are retained, source URLs are checked before becoming links, and facilitator material is inserted only when its disclosure opens. Student downloads use explicit field allowlists and contain the selected text, prompts, and provenance without facilitator notes, quoted answer evidence, or future private fields. The standalone document is rendered separately and contains no application script or embedded course JSON. Source-rights evidence URLs remain provenance, distinct from the withheld question evidence.
- Native print CSS hides facilitator disclosures even after they have been opened, and displays the source attribution separately from the screen disclosure. The code review and serialization tests do not certify actual pagination, print-dialog behavior, or rendered PDF contents. Those require browser/print verification, including long real selections.

## Completion boundary

The actual corpus was still being researched during this review. Final delivery must run the complete daily-reading checker and repository gate after all content arrives, then reconcile the independent fidelity/rights/content reviews. Ten distinct bibliography tuples, three nonempty questions, matching quoted evidence, and passing hashes are admission checks, not substitutes for authentic text, useful questions, suitable excerpts, or an effective annual progression.

## Shared-integration follow-up

Reviewed only the subsequent diffs in the shared build, full gate, static smoke, home entry, weekly-reading link, and README. No new findings. Independently checked the coordinator's fresh daily-page build against source, script order/syntax, local assets, unique and referenced DOM IDs, and index/source parity. **Zero actual daily-grade files were present at that integration check**, so real-corpus file parity was not established; the earlier fixture test covers that comparison with one grade. The weekly link is restricted to Common Core reading and preserves its grade/week with day 1; K/Grade 12 and first/last-week boundary links resolve correctly. README links the contract and distinguishes original-material rights from attributed public-domain texts. Both inventory checks initially ran in available-content mode. The final gate follow-up now passes `--complete` to the weekly checker. Inspected that argument and independently ran the read-only complete weekly checker: 41 originals, 44 views, 1,476 weeks, 4,428 worksheets, 26,628 items, and 2,953 worked examples passed, matching the new README counts. The README links the coordinator's content/browser integration review; this does not extend this reviewer's content approval. Daily admission still runs in available-content mode and must change to `--complete` before final delivery to require 13 grades/2,340 nights. The coordinator reported the full gate passing; this reviewer did not rerun it or rebuild output.

## Optional piece-credit follow-up

Reviewed the later validator, pure-library, renderer, style, and test diffs for optional `day.author` and `day.workTitle`. No new findings. Present values must be nonempty plain-text strings; the student projection explicitly permits only these two additional fields. The reader and standalone download use the individual author when supplied and retain the source-author fallback otherwise. An informative work title can appear separately without repeating the selection/source title. Source bibliography, rights records, selection hashes, source-diversity counting, and withheld facilitator fields remain unchanged. All 15 targeted tests pass, including invalid optional values, anthology attribution, fallback behavior, and exported student-note exclusion. No new browser or corpus evidence is implied.

The final source-policy clarification records the coordinator's source-review distinction between an undated printing and an unidentified text. It permits disclosed original-English texts identified by publisher/copyright front matter together with explicit repository US status, while still requiring every selected excerpt to match the actual transcription. For genuinely unidentified texts, it retains full selected-excerpt collation against an identified dated primary witness, resolution of substantive revision/translation differences, and replacement when verification fails. It forbids invented printing dates and unsupported exemplar relationships. This is a documented research decision with no runtime/schema change; this code review did not independently inspect its cited primary leaves or determine rights. The platform does not verify external witnesses or prove rights; those remain corpus-research and source-review responsibilities.

Final compact-header recheck found no remaining issue. Grade/week/day identity, piece/source attribution, reading mode, and both minute components remain visible with less repeated copy. A proposed removal of the suggested-time qualifier would also have affected standalone downloads; the accepted final wording is `About <total> min · read <reading> + discuss <discussion>`, preserving estimated-time meaning without restoring the longer header. The export regression now requires that qualifier. All 15 targeted tests and whitespace checks pass on the final snapshot below. The platform author reports a one-line timing row without overflow at 320px; this reviewer did not rerun those browser checks.

## Reviewed SHA-256 snapshot

```text
1abc9ed25ee5a447dc0495198e8b7b7e9494973d4e5e5da779e84227e0648b9a  tools/build-daily-reading.js
812007a168b16a89a88ed2b57b9c7c3a2bad64610764872d0b15a1c15f688099  tools/check-daily-reading.js
f253fa48373843ce175a1483f8e16d2dc9056101158d4fbe6b89fecf114ae810  src/lib/daily-reading.js
e05bc6a86febbadaabca7cae5035b9ab87a4986a09d1f943e7d1613a4303bdbb  src/daily-reading.html
a0d9f8d842d856b416c34ca5cd96df44cb15d41f8d0e64fe4c17e7a8aa60096c  src/app/daily-reading.js
a861c09e19a52fdb9b85078d56956bff405189e4f6cce0cb87762184c9e41ccf  src/app/daily-reading-render.js
819d78ace7cf753613205d128646bd02f6de0aa00bfdce4ed91f0652d5ff50c4  src/styles/daily-reading.css
29a936a742e8ab6586d7b49518cf094bb5813b00fff7cbbb7b4eed495e4d60eb  test/daily-reading.test.js
88b0594249c2af12d63f0c8d5a309a6d5557d26c06cb0df07f263de43c0f8cd9  docs/daily-reading.md
eb830c817722f56511680c7d40d10dfeb1b492905bd85d327b7d4999aaa8476f  tools/build.js
f452fdc3ea0396cc3b98551c7435cfc2e75f111c37d614913ed7753df47d59cc  tools/check-all.js
cef557a770870459db123b7c061f74f8fef3ca445129880b9889eb494b89b892  tools/smoke-static.js
edd90b6d16f7164d603aa7915a46e8f90e9a2056a7ea47dd0e7ed9b00286c569  src/index.html
020b205daaa09bd03b21095b0b7f06b08aa34959024e1be4319e9741836af7d6  src/app/weekly.js
eb4f9517ee5008d02745d4d6509dffd73fd0ae03687b3521a6bf979a46281c80  README.md
```
