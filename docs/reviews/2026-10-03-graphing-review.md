# SAT and ACT graphing cold review

Reviewed baseline: `f8bfc499d7ee8d40aa508a2e1b992b91ab9f26a2`.
Date: 2026-10-03. Coordination and integration: `/root`.

## Findings and changes

| Finding | Result |
| --- | --- |
| ACT Mathematics had no SVG figures among 575 records; graph-related tasks supplied only text or tables. | Revised 24 existing IDs with 12 graph designs: intersections, slope, line equations, quadratic range and zeros, transformations, intercepts, box plots, bars, histograms, predictions and residuals. |
| ACT Reading's only graph-data question used an ASCII plot. Passage unwrapping and table parsing did not preserve its spatial alignment. | Replaced passage p018's plot with a shared, labeled SVG and complete descriptive data. September remains the unique minimum. |
| Standalone ACT figures were not admitted by the schema; duplicate checks omitted their plotted data. | Applied existing strict SVG validation to optional standalone figures, preserved them during generation, and included descriptive figure data in duplicate checks and the admission audit. |
| Renderer-free HTML and LaTeX booklets silently omitted non-Science figures. | Every figure now has an escaped description fallback. Browser and Node HTML booklets retain sanitized SVG drawings. |
| SAT already covered many line, inequality, curve and scatterplot tasks, but residual questions were table-based and graph reconstruction coverage was narrow. | Added `graph-quadratic-level`, `graph-polynomial-sign-integers` and `residual-plot-reconstruction`, all provisionally Medium. SAT Math now has 200 templates: 48 Easy, 102 Medium, 50 Hard. |
| Graph instruction had no shared starting lesson, omitted scaled point mappings and endpoint examples, and overstated vertex/corner and trend shortcuts. | Added a linked SAT Reading graphs lesson and expanded SAT/ACT graph instruction with original worked examples and limits. |

The ACT graph batch preserves IDs, taxonomy, answer positions and review status.
Its 551 other Mathematics records are unchanged. A full legacy rebuild followed
by the graph revision reproduced the same bank; deterministic label refinements
subsequently passed the revision-idempotence and geometry checks. The Reading
change affects one shared passage and the teaching fields of question 0173.
Neither retired SAT bank nor the Science sources, bank, archive or review manifest
was modified.

## Independent review

- [Nonlinear review](2026-10-03-graphing-nonlinear-review.md): 19 templates,
  69 blind solves, including nine seeds for each new nonlinear design.
- [Data review](2026-10-03-graphing-data-review.md): 12 templates, 58 blind
  solves, including 11 new residual-plot samples and geometric readback of 88 dots.
- [ACT review](2026-10-03-act-graphing-review.md): all 24 revised Math items
  and Reading question 0173 solved before key access; all 25 accepted.

Reviewers recorded responses before viewing keys, then inspected explanations,
hints, traps and plausible competing answers. The final registry and
`content/template-reviews.json` bind their SAT reviews to final source versions.
Conservative source fingerprints require renewed review of all 31 templates in
the two edited files; most sibling definitions have no substantive change.

The review repaired overlapping SAT coordinate labels with A/B markers and a
separate coordinate legend. It corrected singular integer explanations and
“Over 1 year,” a false unequal-scale claim, and gridline rationales on text-only
questions. ACT graphs gained exact coordinate/reference labels, an accurate
scale description and a corrected transformation trap. Final independent
reinspection accepted these corrections.

The coordinator additionally blind-solved both unchanged SAT Reading and Writing
graph templates at `graph-review-0`, `graph-review-1`, and `graph-review-2`.
The recorded zero-based choices were `0, 1, 1` for
`quantitative-graph-complete` and `3, 3, 1` for
`quantitative-graph-reconcile`; all six matched. They exercise declining counts,
a series maximum, first crossover, rates with changing denominators, differences
between groups and a changing weighted average. No question-source change was
needed there; its Learn examples were expanded.

## Verification

The environment has Node 26 and Chromium, but no npm command. The coordinator
ran the package scripts' Node entry points directly, without installing tools.

- The full `tools/check-families.js --reps 3000` pass covered all 363 SAT
  templates with 3,000 integer plus 3,000 runtime-shaped seeds per template.
  After review corrections, the quadratic, scatterplot-reading and two-group
  templates received focused deep passes; final checks cover all templates.
- New mathematical tests reconstruct answers from displayed data and check SVG
  point/line/bar geometry. Validation tests cover unsafe standalone figures,
  figure propagation, duplicate context and booklet fallback behavior.
- Chromium checks used the built app at 1280px and 390px. They covered ACT Math
  residuals, the Reading graph, all three new SAT designs, accessible figure
  names, absence of horizontal overflow, correct answer feedback and restored
  snapshots retaining figures. The new Learn deep link also rendered in dark mode.
- Focused figure galleries checked exact readings, coordinate labels and
  existing graph context. The suspected existing line-label clipping was not
  reproduced, so that source was left unchanged.

- The final `node tools/check-all.js` gate passed, including all 612 tests,
  complete content validation, all 363 source-bound SAT reviews, generation
  checks, the build, static smoke checks, and Learn/study-guide link checks.
- A Chromium PDF export of all 25 revised ACT graph questions retained all
  figures across 10 pages. A rendered page was visually inspected for readable
  labels and intact two-column layout. HTML and LaTeX description fallbacks
  passed unit tests; no LaTeX engine was run.

## Limits

This is sampled independent agent review, not human editorial approval or
empirical difficulty calibration. The ACT batch adds 12 designs with two
variants each, not 24 independent designs. ACT tiers remain unverified. SAT
Medium seeds vary in demand, including simple polynomial count cases. The new
lessons use the existing prose/table format; they are not interactive plotting
lessons.

ACT Science retains its finite inventory of 80 items in 14 passage sets,
including two graph passages and one diagram passage. This pass improves its
teaching material without claiming to rebuild its question coverage. Reading's
single SVG question remains limited graph-and-prose practice. Duplicate checks
use descriptive data and do not prove agreement with SVG geometry or educational
novelty. Description-only booklet fallbacks preserve the information, but cannot
assess visual interpretation in the same way as an actual graph.

Official scope references checked for this review: [College Board Math
specifications](https://satsuite.collegeboard.org/k12-educators/about/alignment/math)
and [ACT Mathematics standards](https://www.act.org/content/act/en/college-and-career-readiness/standards/mathematics-standards.html).
These support the graph/representation scope, not an official frequency or
readiness claim. All added practice data and exercises are original.
