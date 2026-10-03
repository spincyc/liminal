# Content Authoring and Review

## Source of truth

This document covers fixed ACT banks. Active SAT questions come from the
templates described in [`question-templates.md`](question-templates.md).
Canonical bank records live in `content/banks/<section-key>.json`. The catalog in
`content/catalog.json` defines the allowed sections, domains, skills,
subskills, response types, calculator policies, and exact coverage targets.
`content/schema.md` defines every required field.

Files in `dist/content/` are browser-ready derivatives. Never edit them by
hand.

## Add or revise a batch

1. Confirm the current official structure in `docs/official-structure.md`.
2. Choose one section/domain/skill and a coherent batch size.
3. Preserve existing stable IDs. New IDs use `<section-key>-NNNN`.
4. Write original, self-contained material. Do not adapt an identifiable
   official or commercial question.
5. Supply every instructional and metadata field.
6. Run the validator before building browser output:

   ```sh
   npm run validate
   ```

7. Inspect a representative sample across difficulties and formats.
8. Build and run the complete suite:

   ```sh
   npm run build
   npm run check
   npm run report:write
   ```

9. Record accepted, rejected, and awaiting-review counts in
   `docs/content-audit.md`.

The deterministic section generators in `tools/generators/generate-*.js` preserve the
accepted legacy prefix and recreate a complete section from fixed seeds. Their
atomic writer stages output in the target directory before replacing a bank, so
an interrupted process does not leave partial JSON. Regeneration is resumable
because stable inputs produce stable IDs and records.

## Editorial checklist

Automated validation is necessary but insufficient. A reviewer should verify:

- the stem and supplied context support exactly one answer;
- the keyed answer is correct and units, rounding, and accepted numeric form are
  explicit;
- every distractor reflects a plausible, accurately described error;
- the concise explanation and each solution step agree;
- the hint helps without giving away the answer;
- the suggested approach is actually reliable under time pressure;
- the trap and principles are specific to the item;
- invented passages, data, and scenarios are coherent and inclusive;
- no wording closely imitates a published question;
- difficulty and estimated time are reasonable;
- equations, tables, punctuation, and passage formatting render correctly.

Review each response format and every affected domain/difficulty stratum, not
just the first records in a bank. For quantitative items, independently
recompute the result. A declared `verification` object is recomputed by the
validator but does not remove the need for human review.

## Review statuses

- `pending-editorial`: migrated or drafted; basic automated checks may pass.
- `automated-verified`: full automated gates pass; human approval is still
  outstanding.
- `editorial-reviewed`: an independent reviewer completed the checklist and the
  review is recorded in `docs/content-audit.md`.

Do not bulk-change statuses without performing and documenting the review.

## Validation gates

The validator checks required and unknown fields, catalog taxonomy, stable IDs,
content version, response shape, answer keys, distractor coverage, explanation
metadata, provenance, exact duplicates, structural duplicates, 0.90 Jaccard
near duplicates, domain/difficulty coverage, answer-position balance, and
supported mathematical verification records.

Complete mode additionally requires exactly the section's `targetQuestions`,
or the catalog's `targetPerSection` default (575), and exact domain and tier
counts. Science deliberately has 80 authored questions rather than padding a
larger inventory with numerical variants:

```sh
node tools/validate-content.js --complete
```

The generated coverage report records counts, distributions, and remaining
human-review work:

```sh
npm run report
```

## Generator limitations

The current banks use deterministic families with varied invented settings,
parameters, passages, tasks, and distractor logic. Duplicate gates prevent exact
and high-similarity items, but they cannot measure pedagogical novelty,
psychometric calibration, cultural bias, or prose quality. All 4,105 retained
records therefore remain awaiting independent human editorial review. This
includes two retired SAT banks and 575 archived Science questions, retained
for compatibility. The four other ACT banks contain 2,300 exercise
variants, not 2,300 independent question designs. English uses 40 authored
passages, Reading 55, and Mathematics 232 generator shapes. Writing variants
share 53 issues. Repeated settings, parameters and writing perspectives do not
establish new pedagogical designs.

The [2026-10-02 cold review](reviews/2026-10-02-cold-review.md) records agent
review coverage and repairs. Agent review does not satisfy the outstanding
human editorial review or establish empirical difficulty. ACT tiers remain
excluded from practice filtering and readiness judgments. Science's 80 new
questions are independently solved by agents before admission; this does not
close the outstanding human review.

## Science passage sets

`content/sources/act-science/` holds the authored passages and teaching fields.
`node tools/generators/generate-act-science.js` assembles them into the bank and
shared passage file without inventing additional variants. The original IDs
0001–0575 stay unchanged in `content/archive/act-science.json`; new questions
use 0576–0655. The runtime admits only new IDs for practice and refuses archived
saved sessions without deleting them. Historical outcomes and identities retain
their existing meaning.

Every new question belongs to a passage. Figures have a safe SVG, descriptive
alternative text, and complete printable data in the passage. The Science gate
checks structure, coverage, reproducibility, figure safety, and source-bound
independent solutions in `content/science-reviews.json`. A changed question or
passage invalidates its review. Reviewers solve displayed material before seeing
keys, then inspect explanations and distractor rationales. See the
[rebuild review](reviews/2026-10-03-science-rebuild.md) for findings and limits.

`audit-questions.js --admission` checks available banks for answer tells,
concentrated families, exact duplicates and response defects. The stricter
shape-repetition diagnostic remains available with `--strict`; a bank of
parameter variants is not represented as passing a unique-design threshold.
