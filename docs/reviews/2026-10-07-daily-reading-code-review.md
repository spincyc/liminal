# Daily reading platform: independent code review

Reviewer: `code_cold_review`. Date: 2026-10-07. Status: **no outstanding substantive platform findings in the reviewed snapshot**. This is structural and implementation review, not approval of the literary corpus, rights research, age suitability, or teaching quality.

## Scope and evidence

Read the daily-reading contract, builder, read-only checker, pure library, page controller, renderer, HTML/CSS, and tests. Reviewed counts and ordering, progression, source and question references, continuation links, time budgets, text identities, evidence matching, route recovery, asynchronous loading, student exports, source links, print privacy, and mobile/keyboard structure. The later shared-integration review is recorded below.

`/usr/bin/node --test test/daily-reading.test.js | tail` passed **12 tests, 0 failures** after the repair below. Synthetic fixtures cover complete and incomplete grades/corpora, exact hashes, malformed references and dates, time arithmetic, continuations, duplicate selections, bibliographic duplicates, safe rendering, and student projections/downloads. The fixture build confirms that failed admission preserves an existing valid output. Its temporary scratch directories are removed by the tests; this reviewer did not rebuild `dist/`, start a browser/server, commit, or push. JavaScript syntax and `git diff --check` passed.

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

Reviewed only the subsequent diffs in the shared build, full gate, static smoke, home entry, weekly-reading link, and README. No new findings. Independently checked the coordinator's fresh daily-page build against source, script order/syntax, local assets, unique and referenced DOM IDs, and index/source parity. **Zero actual daily-grade files were present**, so real-corpus file parity remains pending; the earlier fixture test covers that comparison with one grade. The weekly link is restricted to Common Core reading and preserves its grade/week with day 1; K/Grade 12 and first/last-week boundary links resolve correctly. README links the contract and distinguishes original-material rights from attributed public-domain texts. Both inventory checks currently run in available-content mode. This does not certify completion: both must use `--complete` before final delivery, requiring 41 original weekly courses/44 views and 13 daily grades/2,340 nights. The coordinator reported the full gate passing; this reviewer did not rerun it or rebuild output.

## Reviewed SHA-256 snapshot

```text
c5d25118a92100e3e1f0ce9b22e1a00bd3ffc70c06456c7c3c1dcda199d5ad16  tools/build-daily-reading.js
812007a168b16a89a88ed2b57b9c7c3a2bad64610764872d0b15a1c15f688099  tools/check-daily-reading.js
b2a8194879527558bbdf35d1ad6138c3af99a2c371905d129350a16242819238  src/lib/daily-reading.js
e4fe9f54139d6410e6d8efb3ae185c72f4a984a788261bf3b48beebc8cbbf3b0  src/daily-reading.html
a0d9f8d842d856b416c34ca5cd96df44cb15d41f8d0e64fe4c17e7a8aa60096c  src/app/daily-reading.js
99a260cb11bae30856306a8f88951dcbb04bb77374aa5ddf3e7a2472baa245c4  src/app/daily-reading-render.js
aedb5ed22020d1d04f5212026355819c2a9e5d1b06e3335bc069dc7a27ddad89  src/styles/daily-reading.css
6e605f8eec06abbc8fcbe768e7d2a643d8fb55aaa84800ccf3a02fd1278f5efe  test/daily-reading.test.js
d01e67d9eef667b0a16eda110a70af0d36ae1af3948a398750e3a6ab6d06dfae  docs/daily-reading.md
eb830c817722f56511680c7d40d10dfeb1b492905bd85d327b7d4999aaa8476f  tools/build.js
d4711f20d40396fc896be759cb44d691bd686948e7f50cdafef7adc686afcdc8  tools/check-all.js
cef557a770870459db123b7c061f74f8fef3ca445129880b9889eb494b89b892  tools/smoke-static.js
edd90b6d16f7164d603aa7915a46e8f90e9a2056a7ea47dd0e7ed9b00286c569  src/index.html
020b205daaa09bd03b21095b0b7f06b08aa34959024e1be4319e9741836af7d6  src/app/weekly.js
d93477ef1494aa13e3a5b0520807129aa6fcd8dc56c04328d13c4cde5f8f0168  README.md
```
