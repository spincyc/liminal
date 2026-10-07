# Common Core reading K–3: independent agent review

Reviewer: `review_reading_early`, 2026-10-07. Final review of all four canonical courses is complete at the SHA-256 bindings below. No unresolved errors remain in the reviewed sample after the repairs described here. This is independent agent sampling, not human editorial approval, comprehensive proof, or evidence of student outcomes.

## Actual scope

All four courses have 36 weeks, 108 worksheets, and 72 worked examples. All weekly titles, objectives, explanations, passages, daily plans, prerequisite connections, and worked examples were read. Unit placement was checked against `content/curriculum/common-core-reading.json`; each course follows its six six-week units.

| Course | Canonical tasks / passages | Cold worksheet solutions | Worked models inspected | All-question boundary review |
| --- | ---: | ---: | ---: | ---: |
| K | 648 / 118 | 108 | 72 | 216 |
| 1 | 648 / 122 | 108, including 3 coordinator supplements | 72 | 216 |
| 2 | 660 / 134 | 108 plus 12 folktale extensions | 72 | 222 |
| 3 | 648 / 96 | 108 | 72 | 216 |

The fixed cold selection is item `((week − 1) mod 6) + 1` in each worksheet A, B, and C. IDs use `ccr-k-wNN-aN` for K and `ccr1/ccr2/ccr3-wNN-aN` for Grades 1–3, with the corresponding `b` and `c` letters. This spans early and late question positions. Grade 2 additionally includes A7/A8, B7/B8, and C7/C8 in both weeks 33 and 36. Boundary review covers every question in weeks 1, 6, 7, 12, 13, 18, 19, 24, 25, 30, 31, and 36, including Grade 2's six additional week-36 questions. Boundary counts overlap the cold samples; they are not additional disjoint totals.

Selected prompts and necessary passages were displayed without worksheet answer/steps fields, independent responses recorded, and keys displayed afterward. Worked models were inspected for correctness and teaching coherence; they are not claimed as independently cold-solved. Grade 1 week 1 keys were inadvertently exposed during initial schema inspection, so this reviewer's work there is corroborative. The coordinator independently solved `ccr1-w01-a1`, `ccr1-w01-b1`, and `ccr1-w01-c1` before keys in `.scratch/weekly/root-reading-cold-outcomes.json`. Those answers agree with the final keys. Exact prompts, passage IDs, titles, and texts were bound to the final Grade 1 file in `.scratch/review_reading_early/root-g1-binding.json`.

Response records are under `.scratch/review_reading_early/`: `{g3,g1,g2,k}-checkpoint-solutions.txt`, `g1-final-solutions.txt`, `g2-final-solutions.txt`, `k-final-solutions.txt`, and `g3-later-solutions.txt`. `reviewed-{k,1,2,3}.json` preserves final snapshots; `final-bindings.json` records counts, hashes, and pacing checks. Early checkpoint reviews were followed by canonical inspection and targeted rereview of changed material. The scratch artifacts are transient repository-local evidence.

## Findings and repairs confirmed

- **K:** Week 31 correctly marked newly introduced soft-c `place` as shared reading, but its explanation called the passage an independent opportunity using taught patterns. The final explanation now specifies shared reading and newly modeled soft c.
- **Grade 1:** Early controlled passages assumed unintroduced `puts`, `his`, `lets`, and `go`. Replacements and explicit `his` mapping were confirmed, including the associated comprehension questions. Sorting tasks now state their exact grouping criteria. Week 1 directly practices its capital, word-count, and end-mark objective. Week 28 explicitly prepares `count`/`start` before `counted`/`started`, explains the added syllable, and records supplied-base support.
- **Grade 2:** Word-repair tasks formerly claimed words such as `hope` and `plane` occurred in connected passages where they did not. All 36 now identify standalone printed-word checks. Week 1 `far` and week 2 `way` receive explicit correspondence preparation; every independent passage requires checking and teaching unfamiliar words before assignment. Week 14's vowel-letter count was corrected, and week 24's pocket placement now matches its final illustration description. All 36 A5 keys now explain the actual named word pair. Week 34's alleged `wood`/`would` oral error was replaced with the audibly different `wild`/`would`; weeks 6 and 36 no longer invoke absent sentences. Paired daily plans now name both literary and both information texts. All 36 revised word-study models were reread for exact sounds and meaningful parts. The final A6 wording permits explaining what changes or stays the same, including homophone comparisons; this prompt-only refinement and Day 1 punctuation were diffed before rebinding. Author self-audit repairs to week 4's printed `June` quotation and week 14's within-line rhyme were independently confirmed.
- **Grade 3:** Week 2's absent `rain` reference now names printed `fold`; week 6 asks for a helpful decoding feature of `little` rather than its first feature. The unnecessary week-20 evaporation extension was removed. The final week-23 model now correctly explains that hanging sample mats places them above loose ends and frees the table space the mats occupied. The narrow final change was diffed and reread against the passage.

Final sampled keys agree with the recorded independent solutions, allowing reasonable supported alternatives on open tasks and phrasing choices. The revised Grade 2 pair-specific answers resolve the original underspecified explanations rather than changing the supplied words.

## Teaching, diversity, and limits

K and Grade 1 distinguish rich adult read-aloud comprehension from controlled or shared word reading and accept oral, pointing, and drawing responses. Neither assumes writing fluency as the route to demonstrating comprehension. K introduces letters cumulatively, explicitly handles the multiple sounds represented by `x` and `qu`, and keeps the excluded final `/l/`, `/r/`, `/x/` words out of its targeted three-phoneme isolation checks. Grade 1 develops short vowels, digraphs and clusters, final-e, vowel teams, two-syllable words, and endings with review and exception preparation.

Grade 2 keeps historical prose and richer original texts as adult read-alouds, with separate prepared word-reading passages. Its prerequisite check and record of support matter: a prepared passage is not evidence of unaided first-time reading. Grade 3 uses accessible independent selections with explicit decoding, morphology, evidence, and comparison instruction. Its later pairs use recurring characters, and its final unit adds a sustained six-chapter original fable with companion texts.

Daily and foundational routines repeat intentionally. Comprehension changes with substantive content: sequencing, supported inference, errors and revisions, paragraph topics, text features, character/narrator distinctions, paired accounts, reasons, and limits of evidence. Repeated structure is not merely a change of names. Illustration descriptions and text diagrams supply the required givens, though they do not substitute for sustained experience interpreting professionally illustrated books. Original classroom observations are labeled invented; fictional events are not offered as historical or scientific evidence.

The short supplied selections do not establish comprehensive grade-band complexity, particularly independent reading at the high end of the grades 2–3 band. This is substantial reading practice, not a certified full ELA course or a mastery assessment. Teaching decisions still depend on the learner's observed reading and recorded assistance. Only the stated samples were independently solved; neither structural checks nor duplicate checks prove semantic correctness of every task.

## Source verification

All 12 canonical Grade 2 fable selections match independently downloaded primary Gutenberg texts after whitespace normalization. Attribution and edition claims were checked against the [Jacobs edition](https://www.gutenberg.org/ebooks/28), its [1894 title page](https://www.gutenberg.org/cache/epub/28/pg28-images.html), and the [Townsend translation](https://www.gutenberg.org/ebooks/21). Townsend's 2008 date is explicitly the Gutenberg release date, not an asserted first publication date. Evidence is `g2-canonical-fables-check.json` and `g2-source-check.json` in the review scratch directory.

The added week-33 complete shoemaker tale and week-36 magpie prose narrative also match the primary texts after whitespace normalization. The [Grimm catalog record](https://www.gutenberg.org/ebooks/2591) and [Jacobs fairy-tale record](https://www.gutenberg.org/ebooks/7439) support their authorship/compiler, 2001/2005 Gutenberg release dates, and public-domain-in-USA status. No unidentified translator is invented. The magpie attribution explicitly discloses omission of the opening verse. Both are adult read-alouds with older vocabulary explained; the magpie's imagined nest explanation is explicitly distinguished from science. Evidence is `g2-folktale-source-check.json`.

## Final SHA-256 bindings

- `content/weekly/common-core-reading/k.json`: `49152033f1277fd39e0d05ac66ff38a99722b3de5641dd6ae5b75ecc9c329feb`
- `content/weekly/common-core-reading/1.json`: `9a1d0ae16f0946061d52c367c359d66bd54c5398c1eb5c27ec71c108da79c288`
- `content/weekly/common-core-reading/2.json`: `cb823b90836a4c4072180e4ee512a16a2a7830d891ed51a8c1cccb3f0e556a46`
- `content/weekly/common-core-reading/3.json`: `12f86c08b94a701d2db4d7fef6641bae57528476a9aac1101c89612f99da8ef3`

Subjects remained read-only for this reviewer. No commits, builds, or distribution writes were performed.
