# Information and Ideas: independent sampled review

Reviewer: `/root/review_information`. Review date: 2026-10-03. Scope: all thirteen templates in `src/lib/families/sat/reading-writing/information-and-ideas/central-ideas-and-details.js`; the appended template changes the fingerprint of every sibling. This is sampled agent review, not human editorial approval or measured SAT difficulty.

## Method and coverage

Before reading the content source or answer keys, the reviewer generated 39 displayed questions: three distinct scenes for each of the thirteen templates. The sampler wrote only ID, tier, seed, scene, stimulus, stem, choices, and figure. It omitted keys, hints, explanations, and rationales. The reviewer read the entire displays and wrote answers with short independent reasoning to `blind-answers.json`. Only then did a separate process regenerate the keys and explanations. All 39 independently recorded answers agreed with their keys. `blind-samples.json`, `blind-answers.json`, and `key-comparison.json` preserve that ordering's artifacts; no acceptance is inferred from the automatic comparison alone.

The original diff added the new process bank and template, without removing or changing a line of any existing template (177 additions, 0 removals). Shared instantiation and Information and Ideas helpers were unchanged. Existing-template review therefore assessed sampled answers and the impact of a sibling addition, and did not presume the conservative fingerprint change meant all old content had changed.

| Template | Sample judgment |
| --- | --- |
| `central-idea-stated-claim` | Easy: a single main claim is directly supported by the whole passage; route, temperature, and block details are plausible too-narrow alternatives. The keys are accurate, without requiring external knowledge. |
| `detail-stated-reason-paraphrased` | Easy: locate a stated reason and distinguish adjacent facts or purpose from the asked reason. All three keys are unique. The seed-vault ownership distractor had an inaccurate generic rationale, recorded below for repair. |
| `detail-literary-explicit-fact` | Easy: direct attribution and explicit facts. The distractors confuse speaker/subject, reverse a stated fact, or import an unsupported belief. |
| `central-idea-corrected-belief` | Easy: identify the explicit correction, rather than repeating the belief or one example. All keys and rationales fit the sampled passages. |
| `central-idea-literary-passage` | Medium: combine initial attitude with final conduct; the endpoint is implied by absorbed attention, laughter, or physical closeness. Narrow facts and invented plans are plausible misreadings. |
| `central-idea-author-qualifies-source` | Medium: distinguish the reported claim from a qualified author stance, with overreach distractors. No sampled answer ambiguity; the merchant-study setting required provenance repair below. |
| `detail-finding-versus-expectation` | Easy: retrieve the result stated together in one sentence while separating expectation and an expressly untested mechanism. The mixed result raises attention demands but does not require synthesis across disconnected observations. |
| `central-idea-period-prose` | Medium: interpret a contrast or analogy and avoid converting it into a categorical class rule, an unstated hidden motive, or rejection of a conceded benefit. |
| `central-idea-poem` | Medium: synthesize the poem's turn in attitude; the patch and bridge use concrete imagery to support an inferred broader meaning. The rejected choices preserve isolated facts or the speaker's earlier stance. |
| `central-idea-academic-argument` | Hard: combine sampling, measurement, or evidential limits with concessions to distinguish a partially valid claim from unsupported completeness or certainty. The third sampled argument requires separating existence, frequency, and first occurrence. |
| `detail-academic-finding` | Hard: reconcile multiple groups/conditions and measured versus unmeasured outcomes; scope errors and apparent causal explanations compete plausibly with the keys. |
| `central-idea-narrative-reassessment` | Hard: retain two supported motives or consequences at once. Each sampled key accommodates both a correction to the initial judgment and a remaining concern, while strong distractors erase one side. |
| `detail-next-step-in-process` | Easy: the stem quotes a stage and asks for the following stage. All options describe actual stages, so students must locate sequence position rather than merely recognize a passage fact. The three sampled scenes have one clear next action. |

## Source inspection of the new template

The new template contains twelve five-stage processes. The reviewer inspected every new topic and every stage/choice mapping after the blind phase. Stage anchors appear in passage order, stages are distinct, and each paraphrase identifies its corresponding action. The generated target is limited to indices 0–3; the answer is the next index, and the choices omit only the named stage, leaving one next action and three actions in other positions. Target 0 and target 2 occurred in the initial blind samples. Source inspection covers the remaining target-index branches. The four possible targets per scene are meaningful rather than mere choice reshuffles.

The processes are ordinary, original instructional scenarios with sufficient information in the text. The quoted-anchor stem is slightly long but clear. Five-stage lookup fits Easy, and the distractors plausibly test confusing earlier, later, and immediately next actions. The explanation and the before/later rationales correctly describe those relationships. The declared total is 2. A focused gate passed 300 integer plus 300 runtime-shaped seeds, yielding 48 displayed variants and 12 scenes; that structural result is supplementary to the semantic review.

## Findings sent for repair

1. `detail-stated-reason-paraphrased`, seed `cold-information-1`, scene `ii-seed-vault-site`: the ownership choice repeats the final passage sentence accurately. Its assigned generic rationale says the choice connects details in a way the passage never does. The choice is wrong because it does not explain site elevation, not because its statement is unsupported. Recommended a scene-specific rationale override preserving the display.
2. `central-idea-author-qualifies-source`, seed `cold-information-1`, scene `ii-lubeck-merchant-trust`: the passage presents a named historian and specific archival-study assertions about real Lübeck without fictional framing or supporting attribution. A targeted search found no verification of this claimed study; that absence does not prove the named person is fictional. The repository explicitly requires invented researchers to be paired with invented places and studies. Recommended an explicitly fictional study/city with the reasoning preserved.

The new-template author was assigned these two source repairs by the coordinator. Final repair dispositions and renewed review follow below.

## Limited factual spot checks

The sampled torpor passage's approximately 3.3°C figure is consistent with the researchers' report of a 3.26°C minimum in Andean hummingbirds ([University of New Mexico research report](https://news.unm.edu/news/unm-professors-examine-how-hummingbirds-live-in-extreme-climate), [original Biology Letters paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC7532710/)). The sampled vault passage's sea-level and permafrost rationale agrees with the facility's explanation ([Norwegian government description](https://www.regjeringen.no/en/topics/food-fisheries-and-agriculture/svalbard-global-seed-vault/mer-om-det-fysiske-anlegget/id2365142/), [NordGen FAQ](https://seedvault.nordgen.org/Information/Faq)). These are spot checks, not a full factual audit of the unchanged topic banks. Historical and scientific details outside the inspected samples were not independently verified here.

## Final repair review and disposition

Both findings are resolved and all thirteen templates are accepted within this sampled scope. The seed-vault display remains unchanged, and its scene-specific rationale now explicitly recognizes ownership as a stated fact that does not explain elevation. The revised merchant passage opens with a fictional study of the invented port Veldhaven, and all city references and scene identity agree. The logical distinction remains unchanged and the fiction framing does not disclose the answer.

For renewed review, a separate sampler generated three distinct final scenes for each affected template, deliberately including each repaired scene. It saved the six displays without keys or explanations to `repair-blind-samples.json`. The reviewer recorded six answers and reasons in `repair-blind-answers.json` before the separate comparison in `repair-key-comparison.json`. All six matched; the final seed-vault and Veldhaven keys remain uniquely supported. The other renewed samples cover monarch chemical defenses, stepwell access, communal-granary governance, and confounded workweek productivity. Their keys, rationales, and provisional Easy/Medium tiers are sound.

After solving the revised displays, the reviewer inspected the final source diff. The only earlier-content edits are the seed-vault rationale field and fallback override, and the Veldhaven framing/scene/city substitutions. A programmatic comparison of all original blind displays against the final source found exactly one changed display: the old Lübeck scene becomes Veldhaven. All other 38 displayed questions are unchanged, including every new process sample and every other existing sibling sample. Thus no source-impact change to the other accepted answers was silently assumed.

The thirteen acceptance records are published in `content/template-reviews.json`, bound to the final registry version and source fingerprint. The new and two repaired templates name `/root/expand_rw_information_easy`; untouched siblings name `prior-existing-authors`.

Limitations: three-scene coverage does not exhaust the older banks; no measured difficulty or universal semantic correctness is claimed. The new bank's twelve scenes and four target positions were inspected at source level after the blind phase. The author's reported 3,000 integer plus 3,000 runtime-shaped draws for each repaired template are supplementary author verification; the reviewer separately ran the new template's 300-plus-300 focused gate. The coordinator preserved the accepted sample answers in the admission manifest.
