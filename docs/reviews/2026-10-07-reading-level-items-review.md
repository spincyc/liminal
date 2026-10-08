# Independent review: reading-level placement items

Review date 2026-10-07. Reviewer: an independent review agent that did not write the items. Everything outside this record and the reviewer's scratch directory was read-only. This is a sampled agent review. It is not psychometric validation, it used no student data, and it is not human editorial approval.

**Current status (re-review, 2026-10-08):** `probes.json` SHA-256 `e87c32f8d140217be85a2f35a0170c9dcfb7a4295b18dd5be3a2596dbad9476f`. No blocking finding remains, and every original blocking and should-fix finding is resolved. Six item-level cue fixes and one stale intro are open; each has validated replacement wording, and none changes a key. `review.status` can move to `independently-reviewed`, preferably in the same change that applies those seven edits. See [Re-review 2026-10-08](#re-review-2026-10-08). The original review follows unchanged.

## Summary

| | |
| --- | --- |
| File reviewed (as briefed) | `content/reading-level/probes.json`, SHA-256 `f918e39b268ea9057d33f709b5f2f8c28db4cdc237607eeccb5a52924a5e3cf9`: 22 probes, 84 items, Grades 1–3 and 5–12 |
| File after Grade 4 was added mid-review | SHA-256 `fb515295caefc6670affc0be0a597958f3b6dc59857416a452a4a76afea6f614`: 24 probes, 92 items. The 22 original probes are unchanged: their stems, options, keys, skills and rationales diff clean, and so do their intros, dayIds and textHashes. Grade 4 (`rl-4-a`, `rl-4-b`) was reviewed with the same method. |
| Passage binding | 24/24 dayIds resolve. Each probe's textHash equals the night's stored hash and the hash recomputed from its blocks. No probe night continues an earlier night. |
| Repository checks | `node tools/check-reading-level.js` passes (12 levels, 24 probes, 92 items, review: unreviewed). `node --test test/reading-level.test.js` passes 29/29. |
| Blind agreement | **92/92**: 84/84 in the original set and 8/8 in Grade 4. Item `rl-4-a-1` was only partly blind (see Method). No key is wrong, and no item has two defensible options. |
| Passage hidden | **92/92**: guessing from the stem and options alone, with no passage, picked every key. That was 55/55 at high confidence, 30/30 at medium and 7/7 at low. For Grades 6–12 it was 56/56. |
| Verdict | 2 blocking, 5 should-fix item findings (6 items), 3 cross-cutting should-fix findings, and notes. **Keep `review.status: unreviewed` until the two blocking items are replaced.** After that, the owner can mark the set reviewed with this record cited and the should-fix items scheduled or accepted. |

No finding asks for any passage to be cut, softened or replaced for its content. Every fix is to an item, an intro or the choice of night. That follows the standing directive not to censor widely recognized American and English literature.

## Method

1. A reviewer script (`.scratch/reading-level-review/view.js`) printed the student view: title, author, intro, content note, the passage resolved from the grade file by dayId with its hash checked, and stems with options in display order. The app does not shuffle options (`src/app/reading-level.js`). Keys, rationales and skills were left out.
2. **Passage-hidden pass first:** I recorded a guess for all 92 items from the stems and options alone (`01-stems-only-guesses.md`).
3. **Blind pass:** I recorded an answer and a one-line textual justification for each item, probe by probe, before revealing any key (`02-blind-answers.md`).
4. Then I revealed the keys and compared them (`compare.js`). I checked every quoted phrase in stems and rationales against the passage, the key-length and key-position cues, absolute and hedging words (`mech.js`, `textstats.js`), each night's discussion questions and facilitator notes, and readability against every night in the same grade (`gradedist.js`).
5. I validated the proposed replacement items below in memory against `validateProbes` (`proposals.js`). All 8 pass. `probes.json` was not edited.

Leak note: Grade 4 appeared after step 4 had begun. An absolute-word scan printed two `rl-4-a-1` options labelled as distractors before that item's blind pass, so `rl-4-a-1` counts as agreeing but not as fully blind.

## Per level

Overlap = an item that asks the same question as one of the night's discussion questions and has the same answer (finding X2).

| Level | Items | Blind agree | Passage-hidden agree | Blocking | Should-fix | Overlap with discussion | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 6 | 6 | 6 | — | — | 1-b-1 | Tags 1-a-2, 1-b-3; forms differ in kind |
| 2 | 6 | 6 | 6 | — | 2-b-3 | 2-a-1, 2-a-3, 2-b-1 | Cross-cue 2-a-2→2-a-1 |
| 3 | 8 | 8 | 8 | 3-b-1 | 3-a (choice of night, X3) | 3-a-1, 3-a-2 | 3-b-3 answered by its own stem; tag 3-a-4 |
| 4 | 8 | 8 (7 fully blind) | 8 | — | 4-a-4 | 4-a-1, 4-a-2, 4-b-1, 4-b-2 | 4-a-3 noun/verb; cross-cue 4-b-1→4-b-3 |
| 5 | 8 | 8 | 8 | — | 5-a-4 | 5-a-4, 5-b-1 | 5-b-1 "Hellen" gloss |
| 6 | 8 | 8 | 8 | — | 6-b-1; ordering against 7 (X3) | 6-a-3, 6-b-3 | Cross-cues 6-a-2→6-a-1, 6-a-4→6-a-2; tags 6-a-2, 6-a-3 |
| 7 | 8 | 8 | 8 | 7-a-4 | — | — | 7-b content note cues 7-b-3/4 (mild); 7-b-3 stem cues 7-b-2; tag 7-a-2 |
| 8 | 8 | 8 | 8 | — | — | 8-b-4 | 8-b-3 answered by its own stem; tag 8-a-3; Fig. 1/2 not shown |
| 9 | 8 | 8 | 8 | — | 9-b-3/9-b-4 | 9-a-3, 9-a-4, 9-b-1, 9-b-3 | — |
| 10 | 8 | 8 | 8 | — | — | 10-a-3, 10-b-1 | 10-a-3 overstatement; 10-b easy items; both forms in first half of year; tag 10-a-2 |
| 11 | 8 | 8 | 8 | — | — | 11-a-1, 11-a-3 | Locator items (X1) |
| 12 | 8 | 8 | 8 | — | — | 12-a-3, 12-b-2 | 12-b is 2.4× longer than 12-a; tag 12-a-3 |
| **Total** | **92** | **92** | **92** | **2** | **5 findings (6 items) + X1–X3** | **25** | |

## Findings

Severity: **blocking** means fix before the set is described as reviewed. **Should-fix** means a real defect or rule breach that leaves the key defensible. **Note** means minor or for the owner to decide. Every replacement wording below passes the repository validator.

### Cross-cutting

| ID | Severity | Finding | Proposed fix |
| --- | --- | --- | --- |
| X1 | should-fix | **Items are largely answerable without the passage.** All 92 keys were reachable from the stem and options. By primary reason: 24 by outside knowledge of famous texts (adult reviewer only, so this does not transfer to students); 18 by word knowledge on vocabulary items with no in-context trap; **20 because the stem or the screen states the answer** (title, intro, content note, a quoted image or definition); **6 from another item in the same probe**; **18 by test-wise elimination**; 6 were lucky low-confidence guesses. Absolute words appear in 1 of 92 keys but 21 of 276 distractors. Hedges appear in 11% of keys against 4% of distractors. The documented guessing rate ("3 of 4 … about 5%", in `docs/reading-level.md` and the `STRONG_SHARE` comment) assumes four live options. With two options eliminated it is about 31%, and with one eliminated about 11%. | Fix the item findings below. Add a passage-hidden pass to the authoring and review rules in `docs/reading-level.md`. Give each vocabulary item an everyday-sense or look-alike trap, as 5-b-2, 9-a-1, 11-a-2, 12-a-1, 12-b-3 and 4-b-4 already do well. Items without such a trap: 1-b-2, 2-a-2, 2-b-2, 3-a-3, 4-a-3, 5-a-2, 6-a-4, 6-b-4, 7-a-3, 7-b-3, 8-a-2, 8-b-3, 10-b-3, 11-b-4. For example, in 10-b-3 replace "Wrote a letter about" with "Widened or opened up". Stop writing absolutes only into distractors. Reword the guessing sentence: "Guessing 3 of 4 among four equally plausible options happens about 5% of the time; it rises sharply when options can be ruled out without reading, so every distractor must be plausible." |
| X2 | should-fix (owner decision) | **25 items ask the same question as one of the night's discussion questions and have the same answer.** The 6-word check passes all of them. Same question and same answer: 1-b-1 (Q1), 2-a-1 (Q1), 2-a-3 (Q3), 2-b-1 (Q1), 3-a-1 (Q2), 3-a-2 (Q1), 4-a-1 (Q1), 4-a-2 (Q2), 4-b-1 (Q2), 4-b-2 (Q1), 5-a-4 (Q3), 5-b-1 (Q1), 6-a-3 (Q2), 6-b-3 (Q2), 8-b-4 (Q3), 9-a-3 (Q1), 9-a-4 (Q2/Q3 notes), 9-b-1 (Q1), 9-b-3 (Q2), 10-a-3 (Q2 states the key), 10-b-1 (Q1), 11-a-1 (Q1), 11-a-3 (Q3), 12-a-3 (Q2), 12-b-2 (Q2). The rule says "never adapt". These items adapt the question's target, not its wording. Practical harm is limited: re-checks use the stretch level, whose plan starts at week 1, while probe nights fall in weeks 3–32. | The owner should choose a reading of "adapt". If it covers the target, rewrite the Grade 5–12 cases where the passage offers other material (5-a-4 below is a worked example), accept overlap at Grades 1–4 where three questions already cover a short passage, and say so in `docs/reading-level.md`. If only wording counts, add that sentence to the doc instead. |
| X3 | should-fix | **Difficulty order has two inversion risks.** (a) The `rl-3-a` night (Comstock, *Compositæ*: "inflorescence", "phalanxes bearing the stigmas", "pollenation") sits at the 96th percentile of Grade 3 nights by a heuristic Flesch-Kincaid estimate and the 99th by share of long words. Both Grade 4 forms sit at the 5th and 13th percentiles of Grade 4, and `rl-5-a` at the 4th of Grade 5. A student can find form 3a harder than Grade 4. (b) The Grade 6 forms (Jefferies, 791 and 677 words of dense periodic description, 75th and 64th percentiles) read harder than both Grade 7 forms (588 and 690 words of plain narrative and memoir, 53rd and 42nd), and 7-a's items are easy (7-a-4 is free; see rl-7-a-4). The ladder assumes difficulty rises monotonically. | For 3a, choose a Grade 3 night near the grade median, keeping the same kind if possible. Otherwise swap the forms so the easier text is the first check. For 6 and 7, choose a Grade 6 form nearer the Grade 6 median, or a denser Grade 7 night. The percentiles are heuristic (crude syllable counts on older prose), so confirm by reading. |

### Item-level

| Probe/item | Severity | Finding | Proposed fix (exact wording) |
| --- | --- | --- | --- |
| rl-3-b-1 | **blocking** | The answer is printed on screen twice. The displayed title is "The Frog — color, eyes, and ears", and the intro says "frogs' colors, eyes, and ears". The key is "One part on color, one on eyes, and one on ears". | Replace (vocabulary; key A): **Stem** "Frogs can change color “to harmonize with their environment.” What does harmonize with mean here?" **A** Blend in with · **B** Sing along with · **C** Hide away from · **D** Feel warm in. **Rationale** "A green leopard frog turned “slate-gray when placed upon slate-colored rock,” matching what was around it." The form then has two vocabulary items. Optionally also replace 3-b-3, whose stem quotes its own definition ("covers the whole eye"). |
| rl-7-a-4 | **blocking** | The answer is printed on screen. The night's content note reads "a debatable claim that the jungle is kinder than the city", and the key is "The jungle is kinder to animals than the city". The key also nearly copies the final sentence. B and D are implausible. | Replace (inference; key A): **Stem** "Why does the narrator tell the goldsmith that Kari “will live more than one hundred and twenty-five years”?" **A** To say the goldsmith will die long before Kari wears gold · **B** To explain why Kari’s tusks have only just begun to grow · **C** To ask for rings strong enough to last that long · **D** To show that Kari is much older than he looks. **Rationale** "He adds, “thou shalt be dead by then, and so there will be no chance of soiling his ivory by buying thy gold.”" |
| rl-2-b-3 | should-fix | The content note says the employers "have died during her long absence", which gives the key ("So much time had passed…"). | Replace (literal; key A): **Stem** "Why did the maid agree to go with the elves?" **A** She had heard that no one should say no to the elves · **B** Her master and mistress told her that she had to go · **C** The elves promised to fill her pockets with gold · **D** She wanted to see the inside of a mountain. **Rationale** "“as she was told that no one ought to refuse the elves anything, she made up her mind to go.”" The form's skill mix becomes literal, vocabulary, literal. |
| rl-4-a-4 | should-fix | The key is the only option that quotes the passage ("Yes, Charlie"). A, B and D are unsupported inventions, and the intro already states the premise. | Keep the stem and the key position (C). **A** The children’s own words are printed in quotation marks · **B** Each child reads one paragraph of the book aloud in turn · **C** The narrator replies to things the children just said · **D** The narrator lists every child’s name at the very start. **Rationale** "The narrator answers remarks we never hear: “Yes, Charlie, it is called the silver fish.”" A is a real trap, because none of the children's words are quoted. |
| rl-5-a-4 | should-fix | This is the night's Q3 ("Why does a discussion of where to plant flowers make Mary anxious?") reworded. The facilitator note gives a different reason (secrecy about the garden she already tends), while the key states "no permission… may not get a place". The key is defensible only because no option names the secret. | Replace (inference; key D): **Stem** "What does Martha show when she says, “I never thought of him not bringin' 'em”?" **A** She had asked Dickon to bring the seeds herself · **B** She did not know that Dickon had come to see Mary · **C** She thinks Dickon forgot to bring the garden tools · **D** She is sure Dickon always does what he says he will. **Rationale** "She explains, “He'd be sure to bring 'em if they was in Yorkshire. He's such a trusty lad.”" Use straight apostrophes as in the passage. |
| rl-6-b-1 | should-fix | The main idea follows from the title ("A hedge becomes a highway") and the intro. C ("the only birds") and D ("cut back to keep birds away") are eliminable without reading. | Keep the stem and key A. **B** The orchard at Wick is as crowded as a busy Eastern market · **C** Finches travel about the fields more than blackbirds do · **D** Birds gather wherever a stream runs beside thick bushes. B and C are true details rather than the main idea, and D overgeneralizes. |
| rl-9-b-3 / rl-9-b-4 | should-fix | Both items test one proposition, that modern languages come before Latin. Item 4's key C states item 3's answer, so one misunderstanding costs two of four items. Item 3 also repeats the night's Q2. | Replace 3 (structure; key A): **Stem** "Why does Franklin point out that “we do not begin with the Greek”?" **A** To show the usual argument for Latin first is inconsistent · **B** To recommend that students begin with Greek before Latin · **C** To explain why he himself never studied any Greek at school · **D** To prove that Greek is an easier language than Latin. **Rationale** "He sees “some inconsistency in our common mode of teaching languages”: Latin comes first to ease the modern tongues, “and yet we do not begin with the Greek.”" |
| rl-10-a-3 | note | The key "By obstacles overcome, not by position reached" drops the passage's "not so much… as". It also repeats the night's Q2 (X2). | If kept, key D becomes "More by obstacles overcome than by position reached". |
| Skill tags | note | Seven items tagged `inference` ask about a stated fact: 1-a-2, 1-b-3, 6-a-2, 7-a-2, 8-a-3, 10-a-2, 12-a-3. 6-a-3 (cause) and 3-a-4 ("according to the author") are tagged `structure` but are closer to literal. `skillSummary` shows these totals to students. | Retag them as `literal`. Every affected form still mixes at least three skills. |
| Cross-item cues | note | One item gives away another: 2-a-2 stem ("not sick, but in distress") → 2-a-1; 6-a-2 stem → 6-a-1; 6-a-4 stem ("vapour") → 6-a-2; 7-b-3 stem ("frail and languid") → 7-b-2; 4-b-1 key ("young bug") → 4-b-3. | Reword the earlier stem when its item is next revised. |
| Stem or screen cues | note | 3-b-3 and 8-b-3 quote their own definitions ("covers the whole eye", "sudden silence"). 7-b's content note ("the narrator's exhaustion") leads to 7-b-3 and 7-b-4. 8-b's content note rules out 8-b-1 A ("not an outdoor-safety guide"). The 8-b and 11-b intros state the main idea that 8-b-1 and 11-b-1 ask for. | Phrase intros as orientation only, not as the gist, for example 8-b: "Mary Austin writes about the high Sierra mountains of California at the start of winter." |
| Locator items at the top levels | note | Item demand barely rises from Grade 8 up. At 9–12, several "central" items are answered by matching the key's words to the one sentence the stem points at: 10-a-1, 10-a-3, 11-a-3 ("part for part"), 11-a-4, 11-b-1 ("most alert"), 12-b-4 ("probable opinion"). Difficulty there comes from the passages. | When revising, paraphrase keys away from the sentence's distinctive words, and prefer the roles of examples and the argument's steps, which the doc names for the later grades. |
| rl-5-b-1 | note | The key's "No Greek" relies on the passage's "Hellen". Nothing on the page says that a Hellen is a Greek. | Add to the intro: "(Hellens are Greeks.)" |
| rl-4-a-3 | note | The stem gives a noun ("called a slink"), but the options are verbs ("To move…"). | Change the stem to "…called a slink. What does it mean to slink?" |
| Content notes for adults | note | The probe shows the night's content note to a student reading alone. Some notes address a facilitator: 2-b says "Explain that magical time is part of the tale", and 3-a says "no dissection activity is required". | Let a probe override `contentNote` (a data and schema change), or accept. |
| Repeat detection | note | A student who already read a probe night in the library, with its discussion, is not flagged as a repeat. Only probe attempts are tracked. | Document this under Limits in `docs/reading-level.md`. |

## Comparability of forms

Readability percentiles compare each probe night with all 180 nights of its own grade, using the heuristic Flesch-Kincaid estimate with the long-word percentile second (`gradedist.js`). They are indicative only.

| Level | Words a / b | Weeks a / b | Kind | Percentile a / b | Verdict |
| --- | --- | --- | --- | --- | --- |
| 1 | 186 / 191 | 9 / 22 | fable / expository science | 72 / 87; long words 29 / 92 | Text in b is harder (Victorian expository vocabulary). Items comparable. Acceptable. |
| 2 | 284 / 344 | 3 / 18 | anecdote / fairy tale | 15 / 81 | b is one long-sentenced paragraph. Items comparable. Acceptable. |
| 3 | 280 / 314 | 10 / 24 | both Comstock | 96 / 37; long words 99 / 71 | **Not comparable.** a is adult botanical prose, and b loses an item to the title cue. See X3 and rl-3-b-1. |
| 4 | 369 / 337 | 12 / 32 | both Morley dialogues | 5 / 13 | Comparable with each other, but both are among the easiest Grade 4 nights (X3). |
| 5 | 466 / 427 | 8 / 27 | novel / myth | 4 / 82; long words 37 / 8 | b's long *and*-chains inflate the formula, and its words are easy. Comparable. |
| 6 | 791 / 677 | 4 / 20 | both Jefferies | 75 / 64 | Comparable. a's items are stronger and b's distractors weaker (6-b-1). |
| 7 | 588 / 690 | 9 / 22 | novel / memoir | 53 / 42 | Comparable texts. a is easier until 7-a-4 is fixed. |
| 8 | 494 / 570 | 6 / 23 | both Austin | 79 / 46 | a is denser description. Acceptable. |
| 9 | 459 / 469 | 11 / 23 | Douglass / Franklin | 16 / 87 | b is harder, with long sentences, and its items 3 and 4 duplicate one point. Fix 9-b-3. |
| 10 | 979 / 830 | 5 / 17 | Washington / Addams | 76 / 99 | b's text is harder but its items are easier: all four are guessable from theme. Both forms come from the first half of the year, against the doc's "usually one in each half". Note. |
| 11 | 547 / 679 | 12 / 28 | Emerson / Thoreau | 31 / 76 (Emerson is conceptually harder) | Comparable. |
| 12 | 462 / 1,099 | 14 / 23 | Plato / Russell | 49 / 68 | b is 2.4× longer and denser, so the form used for re-checks is the harder one. Note; consider a shorter Russell night. |

Item mix: every form mixes at least three skills before any retagging, and the key positions are balanced across the set (A 24, B 22, C 22, D 24 at 92 items). The key is the (tied) longest option in 17 of 92 items, below the 25% expected by chance, and never by more than 11%. No "all of the above" options, no grammatical mismatch apart from 4-a-3, and no misquoted rationale: every quoted phrase in stems and rationales occurs in its passage.

## Difficulty ordering

The text load rises from Grades 1–2 to 3, then dips at 4 and 5a and rises again at 6. It eases at 7 before climbing through 8–12. The most demanding texts are 10-b, 11-a and 12-b. Item demand is roughly flat from Grade 8 upward (see "Locator items at the top levels"). The order would be monotone enough for the ladder after X3 is addressed: a less extreme night for 3a, and either a gentler Grade 6 form or a denser Grade 7 one. Every other step between neighbouring levels looked plausible on reading.

## Library text issues seen in passing (outside item scope)

| Night | Issue |
| --- | --- |
| reading-6-w20-d4 (rl-6-b) | "the end of which comas right up to the apple trees": probably "comes". |
| reading-9-w11-d3 (rl-9-a) | "only when be ceases to be a man": probably "he". |
| reading-5-w08-d3 (rl-5-a) | The underscores in "_could_" display literally. |
| reading-11-w12-d4, reading-11-w28-d5 | Hard line breaks inside paragraphs (30 and 15 in rl-11-a, and "A written\nWord" in rl-11-b) render through `white-space: pre-line` as ragged lines. |
| reading-8-w06-d2 (rl-8-a) | The text cites "(Fig. 1)" and "(Fig. 2)", which are not shown. The items remain answerable. |

## Limits

- One agent reviewer. Agreement with the keys shows that the keys are defensible to a skilled adult reader, not that the items work for students. There is no item analysis, no field data, and no human approval.
- Most of the 24 outside-knowledge hits in the passage-hidden pass depend on adult background and will not transfer to students. The screen, cross-item and elimination cues (44 items) do.
- `rl-4-a-1` was not fully blind. The two Grade 4 probes were reviewed against the 24-probe file (`fb515295…`).
- The readability percentiles come from a heuristic syllable counter applied to nineteenth-century prose. They support, but do not replace, the reading judgments.
- During the review, `content/reading-daily/3.json` had uncommitted changes from another lane. At the final check both Grade 3 probe nights still bound (their hashes matched), and `probes.json` was still `fb515295…`. The Grade 3 percentiles were computed against that working-tree file.
- Not checked: whether passages match their sources (the daily-reading reviews cover that), whether content notes are adequate, the page in a browser, and timing or pace thresholds.
- Reviewer files are in `.scratch/reading-level-review/`: the guesses and answers recorded before the keys were revealed, the view, compare and check scripts, and a snapshot of the 24-probe file. Like all scratch files, they are removed by `wt tidy`.

## Re-review 2026-10-08

This re-review covers the author's repair in commits `38e321f` and `874feb4` (the second commit rebinds the Emerson night after an apparatus fix). The file reviewed is `content/reading-level/probes.json` with SHA-256 `e87c32f8d140217be85a2f35a0170c9dcfb7a4295b18dd5be3a2596dbad9476f` (24 probes, 92 items). I froze a copy in `.scratch/reading-level-review/rereview/` and worked from it. The reviewer, ownership and limits are the same as in the original review.

### Method

1. **Change detection without keys.** I compared stems and options with the reviewed snapshot (`view2.js changes`). 71 items are new or changed: 32 on 8 new nights (3-a, 4-a, 4-b, 5-a, 6-a, 6-b, 10-b, 12-a) and 39 on old nights. 21 items are identical. 19 intros changed, and 10 probes now carry their own content note.
2. **Passage-hidden pass first, on exactly the student's screen.** The screen shows the neutral "Passage" label, the probe intro and the effective content note, then the stems and options, with no title, author or passage. I recorded guesses before reading any new passage or key (`rereview/01-hidden-new-nights.md`, `rereview/02-hidden-old-nights.md`).
3. **Blind pass.** I recorded an answer and a textual justification for all 71 new or changed items before viewing a key (`rereview/03-blind.md`).
4. **Reveal and checks.** I revealed keys and rationales, checked every quoted phrase against its passage (all found), and checked key length and position, absolutes and hedges. I ran `check-reading-level.js --cues` (4 flags, judged below) and the tests (31/31 pass), and checked readability percentiles against the current grade files (`gradedist2.js`).
5. **Proposed fixes validated.** All proposed wording below passes `validateProbes` in memory, and the cue report is clean on the fixed items (`rereview/proposals2.js`). `probes.json` was not edited.

Contamination: on the 16 old nights I remembered the passages from round 1, and I knew the keys of the 21 unchanged items. Three changed items (2-b-3, 7-a-4, 9-b-3) reproduce my own round-1 proposals with small edits. Those 3 are excluded from the blind counts. Because I wrote them, their review is not independent; the author's adoption is the only second reading they have had.

### Results

| | Result |
| --- | --- |
| Hash binding | 24/24 nights resolve and hashes match, including the rebound Emerson night. |
| Blind agreement | **71/71** new or changed items, 68 of them genuinely blind. The 21 unchanged items keep their round-1 agreement. Running total **92/92**. No wrong key, and no item with two defensible options. |
| Passage hidden, as I guessed | 71/71 new or changed items matched (45/45 high confidence, 20/20 medium, 3/3 low, plus 3 of my own proposals). The 32 new-night items were genuinely blind; the other 39 were contaminated by passage memory. |
| Passage hidden, judged for a student | Of all 92 items, judged from the student's screen alone: **39 need the passage** for a grade-level student (29 that I could answer only from adult knowledge of the text or topic, and 10 not guessable at all). **20** are vocabulary items: a student who already knows the word can answer, but every one now has a trap. **6** are figurative items that quote the figure in the stem (1-a-3, 5-b-4, 7-b-4, 8-a-1, 11-a-3, 11-b-2); they test interpretation, not the passage. **27** carry a transferable cue: **6 strong** (should-fix below) and 21 mild (two options weak, or a hint from the note or another item). In round 1, 38 items had screen, cross-item or elimination cues (figurative items excluded), and the title, intros and notes stated answers outright. |
| Key cues | The key is strictly longest in 7 of 92 items (largest ratio 1.07), confirming the author's figure. Key positions are A 24, B 22, C 22, D 24. Absolutes appear in 5 keys and 2 distractors; hedges in 4 keys and 12 distractors. |
| `--cues` | 4 flags, all negligible. 4-b-4's "hedge" is "May" in "May fly", a case-insensitive false positive in the tool. 1-b-1, 9-b-4 and 12-b-2 share only topic words. |

### Original findings: disposition

| Original finding | Status |
| --- | --- |
| rl-3-b-1 (blocking) | **Resolved.** The title is hidden during the quiz and the intro no longer lists the parts. The item is replaced by "prominent", which has an everyday-sense trap. |
| rl-7-a-4 (blocking) | **Resolved.** The probe's content note no longer states the jungle claim, and the item is replaced (my proposal, lightly edited). |
| rl-2-b-3, rl-9-b-3/4 | **Resolved** with my proposals. The 9-b-4 distractor was also revised. |
| rl-4-a-4, rl-5-a-4, rl-6-b-1 | **Resolved** by moving the probes to new nights. The new 5-a-4 has its own cue (S5). |
| X1 (answerable without passage) | **Largely resolved.** The title is hidden, intros orient, probes carry student-facing notes, all 20 vocabulary items have traps, absolutes have moved into keys, and the guessing-rate sentence is reworded in the doc and in `STRONG_SHARE`. The passage-hidden pass is now an authoring and review rule. Six strong cues remain (S1–S6). |
| X2 (discussion overlap) | **Resolved** by the coordinator's decision recorded in `docs/reading-level.md`: no copied wording; the same target is allowed. |
| X3 (ordering inversions) | **Resolved.** Grade 3a is now at the 24th percentile of its grade, Grade 4 at the 47th and 40th, Grade 6 at the 31st and 38th, and Grade 7 at the 53rd and 43rd. Paired forms are within 1.34× of each other's length. |
| Notes | 10-a-3 fixed; skill tags fixed; cross-item cues reduced to 2 mild; 3-b-3 and 8-b-3 replaced; intros orient; top-level locator keys paraphrased; Hellens glossed; adult notes replaced; repeat limit documented. The Grade 10 forms now come from weeks 5 and 34. |

### Remaining findings

There is no blocking finding. Every proposed replacement passes the validator, and none changes a key.

| ID | Item | Severity | Finding | Proposed fix (exact wording) |
| --- | --- | --- | --- | --- |
| S1 | rl-10-b-1 | should-fix | The probe's own content note, "Jim learns that some old friends have died", points to the key ("Many people and places he knew were gone"). The night's own note is generic ("references to death and loss"), so a warning is still needed. | Replace the item (literal; key B). **Stem** "Why, according to Ambrosch, might Leo have run off into the pasture?" **A** He had been sent ahead to open the lane gate · **B** He is sorry Jim is leaving, or jealous of him · **C** He wanted to go hunting up on the Niobrara · **D** He meant to wave goodbye from the windmill. **Rationale** "His brother says, “Maybe he’s sorry to have you go, and maybe he’s jealous.”" The note can then stay as it is. |
| S2 | rl-3-b-4 (unchanged) | should-fix | The stem's word "hiding" leaves B ("…give it away") as the only option about hiding. | **Stem** "Why does the leopard frog at the bottom of the aquarium let its eyelids fall over its eyes?" Keep the options. A ("falling asleep") becomes a real trap. |
| S3 | rl-2-a-2 | should-fix | The stem quotes the defining clause: "People called him Doctor Goldsmith, “for he had studied to be a physician.”" | **Stem** "Goldsmith “had studied to be a phy-si-cian.” What is a physician?" Keep the options. B ("A writer of books") is a nearby-detail trap. |
| S4 | rl-6-a-4 | should-fix | "Three times" in the stem gives away the key ("repeating a thing does not make it true"). | **Stem** "How does the narrator comment on the Catherine Wheel’s view that “Romance is dead”?" Keep the options. |
| S5 | rl-5-a-4 | should-fix | The stem ("deciding to carry the key whenever she goes out") contradicts B ("given up") and C ("give the key back"), which leaves A against D. | Keep A and D (the key). **B** It shows she means to try it in the closed rooms of the house · **C** It shows she wants to make up a game of her own with it. Both are nearby details from the passage. |
| S6 | rl-9-a-4 (unchanged) | should-fix | B ("Hugh helped him earn the money") contradicts the quote in the stem, and C and D are weak. | Keep key A. **B** To repeat the reasons Hugh gave for taking his wages · **C** To show that the shipyard paid its calkers unfairly · **D** To admit that he still owed Master Hugh some money. |
| S7 | rl-11-a | should-fix (trivial) | After the apparatus fix the passage has no bracketed numbers. The probe intro ("Bracketed numbers are reference marks…") and the night's note ("retains… bracketed reference numbers") are now false. | **Intro** "In this section of an 1837 address, Ralph Waldo Emerson discusses the scholar’s education." **contentNote** "This 1837 address uses nineteenth-century gendered language." The Grade 11 library lane should also correct the night's note. |
| N1 | mild cues | note | 21 items have mild cues; none needs a fix on its own. Mild screen hints from intros or notes: 2-a-3 (both money options), 7-a-2 (note: the dog's death), 7-b-2 (illness in intro and note), 8-a-4 (note: "forgotten people"), 10-a-4. Mild cross-item cues: 2-a-1 (item 3's options mention money), 5-b-3 (item 4 mentions the heron), 4-a-1 (4-a-3's "on the stick"). Mild elimination: 1-b-1, 1-b-3, 4-a-4, 4-b-4, 5-a-1, 5-b-1, 6-b-1, 6-b-4, 7-a-4, 8-b-1, 8-b-2, 10-a-2, 10-b-4, 11-b-3. | Revisit these when the items are next edited. |
| N2 | rl-7-a note | note | The probe note drops the night's "threats" (the doc says to keep any warning the night's note gives). | Optional: "The elephant kills a dog in this passage, though the boy tries to stop him; there are threats." |
| N3 | rl-6-b passage | note | The moth table is one paragraph block with 59 tabs. `white-space: pre-line` collapses the tabs, so rows render as lines without columns. Item 2 is also answerable from the prose ("four very wet and dark nights"). | Check legibility in a browser, or give tables their own block type (library and app). |
| N4 | forms | note | Grade 2's forms come from weeks 3 and 18, both in the first half of the year (missed in round 1). Lengths still zigzag across levels: Grade 6 ≈ 910 words, Grades 7–9 459–690, Grade 10 ≈ 980, Grade 11 547–679, Grade 12 ≈ 1,085. Grade 9 (16th vs 87th percentile) and Grade 10 (76th vs 42nd) forms still differ in text demand. | Accept and record, or pick other nights when convenient. |
| N5 | library text | note | These slips persist in probe nights: "when be ceases" (reading-9-w11-d3), "obects" (reading-12-w14-d2, a new probe night), "A written\nWord" (reading-11-w28-d5), "(Fig. 1)/(Fig. 2)" not shown (reading-8-w06-d2). | For the library lanes. |
| N6 | tool | note | `cueReport`'s hedge pattern is case-insensitive, so it matches "May" in "May fly". | Match `may` case-sensitively, or skip a capitalized "May". |

### Difficulty ordering and comparability

Text demand now rises without an obvious inversion between neighbouring levels. Grades 3–7 probe nights sit between the 24th and 53rd percentile of their own grades. Reading them confirms it: Ingelow's Mopsa dialogue (Grade 3a) is about as demanding as Morley's Grade 4 dialogues, so these two levels are level rather than inverted, and Wilde and Wallace at Grade 6 read at about the level of Mukerji and Zitkala-Ša at Grade 7. Item demand is more even than in round 1: the top-level keys are paraphrased, and the new 12-a items ask about the role of the finger example and the concession trap. All 12 pairs of forms are within 1.34× in length, and every grade except 2 draws one form from each half of the year. The differences left in text demand within a grade (N4) are what the doc calls "comparable, not equated".

### Recommendation on `review.status`

No blocking finding remains, so `review.status` can move from `unreviewed` to `independently-reviewed`, with its note citing this record. I recommend applying S1–S7 in the same change. They are wording-only, validated, and leave every key unchanged. Because I wrote that wording, as I did for 2-b-3, 7-a-4 and 9-b-3, the author's check is the only second reading those items get.

### Re-review limits

- One agent reviewer. There is no field data, no item statistics, and no human approval.
- The passage-hidden figures are my guesses plus a judgment of what transfers to students. 29 of my hits came from adult knowledge of canonical texts.
- I did not run the page in a browser (N3), did not check passage fidelity, and did not check the grade files beyond the probe nights.

## Rebind check (2026-10-08)

I re-checked the two probes rebound after the re-review, in the main checkout at `probes.json` SHA-256 `cd941629089117fdc7b5d8b976f36f1cc24e42cee9cc5adcfba730bddf616a24`. This was not blind: I already knew every item and key.

| Probe | Text change since the re-review (`874feb4`..HEAD, word-level diff) | Result |
| --- | --- | --- |
| rl-9-a (reading-9-w11-d3, `a20521b`) | One change: "only when ~~be~~ **he** ceases to be a man". Intro and note are unchanged. The only item change since the re-review is 9-a-4's distractors, which are my S6 wording verbatim. | The hash binds. The corrected sentence is outside every stem, option and rationale quote, and all four keys still follow from the text as written. No new cue: `--cues` raises nothing for this probe. Because I wrote 9-a-4's distractors, that check is not independent. |
| rl-11-b (reading-11-w28-d5, `cfeca1f`) | One change: the stray break in "A written⏎Word" joined to a space. No other line breaks remain inside paragraphs. Intro, note and items are unchanged. | The hash binds. The change is whitespace only, and every quoted rationale phrase still occurs in the passage. All four keys hold, and there is no new cue. |

`check-reading-level.js` passes (review: independently-reviewed), and `test/reading-level.test.js` passes 32/32. Both probes remain reviewed.
