# Singapore Primary 6, 5 and 4 weekly coursework: independent review

Status: completed independent agent review of the three canonical files below. This is sampled agent review, not human editorial approval, standards certification or a comprehensive semantic proof.

## Reviewed artifacts

| File | SHA256 |
| --- | --- |
| `content/weekly/singapore-math/6.json` | `4b7b4dc956fdda77eae2db8c549de980e557a60af983cc131513e74b81b4f741` |
| `content/weekly/singapore-math/5.json` | `08077478fc3a2e45e0debee92925234f3aff986f502aff36749d720775931433` |
| `content/weekly/singapore-math/4.json` | `2b417725729f8a9a8095726f4b4954cbdc5b405075cadcd8071ed7eecda41d60` |

Review began with Primary 6 and proceeded backward through available checkpoints. Later complete files received the remaining review and targeted comparison against those snapshots. The reviewer did not author or modify the subject files.

## Actual scope and reproducible selection

For each course, read all 36 titles, objectives, prerequisite/next connections, daily sequences and explanation sets; inspect all 72 worked examples for mathematical correctness and teaching coherence; inspect all 648 worksheet prompts for supplied givens and variation. Independently solve at least one worksheet task per A/B/C sheet per week before opening its key, then compare the key and steps. The baseline is 108 selected tasks per course, 324 across the lane, plus additional revision checks and two supplemental samples. All baseline numerical results agreed with independently derived outcomes; open tasks accepted valid alternatives.

The compact baseline selection rule is zero-based item index `(week − 1 + 2 × worksheetIndex) mod itemCount`, with A/B/C indices 0/1/2. This rotates through early and late question positions. IDs have the form `sgN-wWW-aI`, with the corresponding sheet letter and one-based item number.

P4 W16 C2 and P5 W12 C4 were revised after their prior keys had been seen; those revisions received targeted recalculation rather than a claim of fresh blind review. Additional cold samples `sg4-w16-c4` and `sg5-w12-c6` preserve fresh coverage of those sheets. Other changed P5 prompts were extracted without keys, independently solved, then compared, including all 42 changed worksheet/model prompts in the final revision. All final changed models, answers and reasoning were reread.

Task-local evidence is under `.scratch/review_sg_math_primary/`: checkpoint snapshots; `*-independent-solutions.json`; `selected-*.json`; `g5-revision-prompts.json`; `g5-revision-independent-solutions.json`; and `extra-independent-solutions.json`. The durable selection rule above allows recreation without those disposable scratch records.

Independent recomputation used separately written prompt parsers, not author generators: 90 P4 arithmetic/rounding/fraction-of-set tasks, 40 P5 expression and contextual arithmetic tasks, and 7 P6 simple expressions. All 137 matched. Scripts are `recompute.cjs` and `recompute-p5-contexts.cjs`, with exact prompt/outcome records in `*-automated-compared.json` and `g5-contexts-compared.json`. These narrowly recognized patterns do not verify geometry, prose or every answer.

Exact unit allocation and standard references matched `content/curriculum/singapore-math.json` for all 108 weeks. Scope checks retained standard Primary 4–6 distinctions, including P4 arithmetic and fractional units, P5 rates and forward volume calculation, and P6 proper-fraction division, whole-number ratio, simple algebra and inverse volume. These are Singapore primary navigation labels, not US placement equivalences.

## Findings and confirmed repairs

- **P5 worksheet diversity:** checkpoint A/B/C repeated the same six designs with numerical changes. The author replaced three B and three C tasks in every week: 216 replacements adding constructions, comparisons, constrained decisions, tables and reasoning. All final prompt sets were inspected. Some fluency designs still recur, but entire worksheets are no longer numerical copies.
- **P5 ambiguous digit:** W1 A2 originally asked for the value of 4 in 420406. It now specifies the hundred-thousands digit.
- **P5 repeated exercises:** W12 A6/C4 reused the same rectangle. C4 now tests a distinct coverage constraint. Same-givens repetitions in W24, W26 and W29 received fresh dimensions while preserving varied reasoning tasks. The changed questions and keys were independently rechecked; W34 related angle revisions were also checked.
- **P5 false correction premise:** W9 A4 originally presented exact division 9 ÷ 3 as though a remainder had been discarded. Final A4 uses 7 ÷ 3 and B4 uses 10 ÷ 3, both with correctly interpreted fractional shares. W24 model 2 now explicitly explains rotation invariance.
- **P6 model reasoning:** generic objective restatements were replaced in all 72 model introductions with given-specific representations. W19/20 whole-circle final steps now check magnitude or containing-square area; additional ratio, percentage, substitution, volume and average models received substantive reasoning. All final models were reread.
- **P6 geometry givens:** W26 C6 now names the cuboid height explicitly; W29 B3 states that its diagonal lies inside the quadrilateral. The final crossing-lines model specifies its triangle rays.
- **P4 division explanation:** W8 now says every group can receive another object when the remainder exceeds the divisor; both worked division models show place-value exchanges and zero quotient positions explicitly.
- **P4 graph interpretation:** W34 C2 now asks for the increase in recorded volume, rather than inferring the total amount added from two readings.
- **P4 conservative scope edits:** revised W16 conversion examples and W23 exact quotients were rereviewed, including the changed selected item and a supplemental cold sample.

## Negative findings and limits

No unresolved sampled arithmetic error, worked-model arithmetic error, absent essential figure or pacing mismatch was found in the bound files. Concrete pieces, equal-unit bars, rectangular partitions and cubic layers generally connect explicitly to symbolic operations. Open responses include examples or criteria rather than implying a unique wording. Geometry supplies dimensions, attachment relationships or grid descriptions; percentage reference wholes and rate units remain explicit.

The comparison used the repository's source-linked year-plan skeleton. Direct retrieval of the MOE primary PDF was blocked by an anti-bot page, so fresh official-source verification is not claimed. Text descriptions make tasks self-contained but do not provide the same experience as manipulating physical models or viewing drawn figures. Repeated fluency structures and recurring daily routines remain. Prompt inspection and duplicate gates do not establish exhaustive pairwise semantic uniqueness, and sampled review does not certify every unsampled key. No browser, print or distribution build was run by this reviewer; those integration checks belong to the coordinator.
