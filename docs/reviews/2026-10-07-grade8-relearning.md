# Grade 8 relearning review — 2026-10-07

This cold review followed the initial course, nightly-packet, and worksheet-choice
reviews. Its focus was a learner who did not understand the first presentation.
The changes address the instructional and printing problems below; they do not
establish measured learning gains or teacher approval.

## Findings and changes

| Finding | Resulting behavior |
| --- | --- |
| Full examples led directly to independent practice, with no prerequisite check or intermediate task. | All 36 lessons now have an actionable readiness check/repair and a partially completed task. The task follows a relevant worked example. |
| Random starting designs could introduce a complicated format first. | Rebuild mode starts in course/authored order, with explicit starting orders for five lessons. Each guided problem is followed by a fresh independent problem of the same design. |
| Generic “show your work” directions left calculator use and expected evidence unclear. | All 85 designs have authored hand-work, calculator, shown-work, and answer-form directions. Guided items also include a first step and a way to check the reasoning. |
| Large single-lesson requests could exhaust finite design pools. | A five-night focused preset supplies 120 distinct exercises across 15 A/B/C worksheets; topic review supplies 600 across 30 worksheets. All alternatives can be exported as reserves with separate keys. |
| Layout did not explain the work expected within each problem. | Cards include directions, unruled work space, and final-answer space. Compact pairs share a row; graphs and long tables use full width. Graph labels are spaced for reading. |
| Checking could stop at matching a number. | Worked-key directions ask the learner to locate the first differing step, explain the correction, redo the problem, and later retry the same design on an unused alternative. |

The routine uses short attempts, feedback, a fresh retry, and later mixed review.
It draws on the explicit instruction, guided practice, feedback, and cumulative
review recommendations in the IES [elementary/middle-school intervention guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/2/Published),
and the spacing and worked-example recommendations in [Organizing Instruction
and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1).
Applying those recommendations here is an instructional design judgment, not
evidence that this particular course has been experimentally validated.

## Independent content review

The readiness/bridge author and expectations author reviewed each other's work.
The independent task reviewer extracted only displayed prompts and task starters,
saved solutions before opening the keys, and then inspected all steps and repairs.
All 72 new tasks and the two revised worked examples had matching answers.
An ambiguous reference in lesson 1-5 was changed to name the numbers 6 and −6.

A separate review read all 85 expectation entries against all four generator
sources, including their random branches. It found one incorrect use of
“whole-number” where clearing decimals could leave negative integers; that was
corrected. Sixteen representative existing generator samples were also solved
before opening their keys, with no disagreements. Generator mathematics was
not changed by this work.

A final sequencing audit compared all 36 tasks with the preceding worked
examples. Eleven tasks now follow Example 2: 1-1, 1-6, 1-7, 1-10, 1-11, 2-5,
2-10, 3-3, 3-4, 3-5, and 3-7. The other 25 follow Example 1. This avoids asking
the learner to finish a method before seeing its relevant worked model. The
position is authored metadata, validated against the lesson's example count.

## Generation and interaction verification

- The deep course check passed 255,000 generated draws. Both practice modes
  passed focused 8-question × 5-night × A/B/C checks for every lesson and
  20-question × 10-night × A/B/C checks for every topic.
- Additional engine checks covered 240 preset cases, 120 balance configurations
  including odd counts, and 12 comparisons preserving the existing mixed-review
  sequence and form-code behavior with a fixed revision.
- Engine tests cover guided/independent pairing, authored order, odd final
  questions, actual lesson coverage, replay, and duplicate exclusion across
  all alternatives and nights. CLI tests cover mode validation, reserve
  selection, manifest settings, and removal of solution data from student input.
- The UI author exercised the actual built page and worker with 31 assertions
  at desktop width and at a true 390-pixel viewport in dark mode. Checks included
  presets, B/C selections, stale-export invalidation, asynchronous export
  snapshots, fresh seeds, and student/key reserve downloads.
- Native keyboard testing used ArrowDown, Tab, Space, and Enter. The real reserve
  print tab contained 120 questions, every A/B/C alternative, five-night labels,
  and no scripts or solution sections.
- The repository-wide `node tools/check-all.js` gate passed, including build,
  content, static checks, and all 58 test files. No tests were skipped.

The uniqueness contract compares both mathematical task/givens identities and
visible identities within a generated packet. New seeds can overlap earlier
packets, and there are 85 underlying designs, not 600 fundamentally different
methods. Finite pools fail explicitly instead of recycling questions.

## Print review

The coordinator generated actual Letter PDFs through Chromium using the shared
renderer. Samples cover all 85 designs, all 36 lesson guides, mixed B/C choices,
separate student/key output, and single-/double-sided combined packets. Text
extraction verified page counts, component starts, and night/letter labels.
Every double-sided component begins on an odd page.

An independent renderer/build reviewer inspected seven student pages and one
guide page, checked text bounds on all 58 student pages, inspected static export
answer exclusion, sampled 1,500 graphs, and rejected seven malformed schema
mutations. Review found a two-way table inheriting narrow numeric-column widths
and single-question sheets receiving paired-task instructions. Both were fixed.
The coordinator also corrected overlapping dense graph labels and a worked-key
fragmentation overflow that otherwise shifted later double-sided sections.
Final raster checks covered the corrected table, dense grid, six-column error
table, guided/independent pair, worked key, and partially completed guide task.

The final course revision is `c0ff391fcec5db77`. The mixed fixtures select
lessons 1-1 and 1-3, four questions per night, two nights, B/C, rebuild mode,
and seed `cold-review-rebuild`. Topic fixtures select the whole corresponding
topic, twice as many questions as lessons, one night/A, rebuild mode, and seed
`cold-guide/topic-N`. The all-design fixtures draw one item per design using
`cold-layout/<design-id>` and show every item with support to stress the layout;
that synthetic fixture is not a recommended student assignment.

| Fixture | Actual pages | Component starts |
| --- | ---: | --- |
| `mixed-student` | 4 | Separate export |
| `mixed-key` | 3 | Separate export |
| `mixed-duplex` | 24 | 1, 9, 11, 13, 21, 23 |
| `mixed-single` | 21 | 1, 8, 10, 11, 18, 20 |
| `all-designs-student` | 58 | Separate export |
| `all-designs-key` | 41 | Separate export |
| `topic-1-duplex` | 52 | 1, 35, 47 |
| `topic-2-duplex` | 68 | 1, 41, 57 |
| `topic-3-duplex` | 51 | 1, 29, 41 |
| `topic-4-duplex` | 51 | 1, 29, 41 |

All 373 pages matched the measured plan and retained document headers. Final
browser checks confirmed all 36 bridge positions in both interactive and
printable guides, plus independent directions for a one-question sheet. The
coordinator also kept lesson introductions with their first learning task.

## Source fingerprints

SHA-256 of the integrated sources after verification:

| Source | SHA-256 |
| --- | --- |
| `content/courses/grade-8-math.json` | `2ca98a30f429b20cd5ff0c86bded4f104b6ae7e7c0dfb6cd729e243bd084ca96` |
| `content/courses/grade-8-expectations.json` | `21c119909532d0f6d894975d5b7379e9c5e1152a87ad0244d91010bd062e04d4` |
| `src/lib/courses/engine.js` | `9c9946abb8f9656f04a7a364485b1c5d8f14cb80c9e5589ca1d83d8e9a5179c7` |
| `src/app/course-render.js` | `bd319761f74af9cc1f04671eb417c63c5ad262d63dab6e6ad623e10e47badac2` |
| `src/styles/courses.css` | `fbcf27351f7733809cba4ad4e4ff2c9698665bd1462a82b1774168c43ab36299` |
| `src/app/courses.js` | `9d60e95a7db787084c932835c25092b270532463a6a25ee34eb1658709f52cd5` |
| `src/courses.html` | `5f7410d5ce633cc2737df8e65bf908ce0161881a49134b36b04314fc3cedd624` |
| `tools/build-courses.js` | `4e941ec77d1d7d2e5818bd112bb43577a6141e2ec30ad03aec2cac802a0a183c` |
| `tools/course-packet.js` | `f55c43ace20ddf00ed633901007e48742d1ec9123e8c2de5ec4bb30bf6432b73` |

The independent blind-solve review accepted manifest
`4280ab976c23a20a470ec94bf480f4cfaa268f3f86e581964783988500e40549`;
the only later content change added the eleven `afterExample` positions from
the sequencing audit. Answers, prompts, and reasoning did not change.
The initial UI checks used revision `e8252fa99059ca72`; final print and guide
sequence checks used the final revision above. These are agent reviews with
separate authors/reviewers where stated, not human editorial sign-off.

## Limits

Browser checks used Chromium 153.0.8010.52. Physical printing, other browser
engines, assistive technology, and trials with students were not performed.
The standalone CLI PDF run could not open its localhost listener in this sandbox
(`EPERM`); CLI argument/projection tests, actual UI exports, and shared-renderer
PDF printing passed. The OS printer dialog was not automated. Sampled capacity
and layout checks are not proof for every seed or maximum-size request.
