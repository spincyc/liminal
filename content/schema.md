# Question Schema

Canonical banks are JSON arrays in `content/banks/<section-key>.json`. The
validator rejects unknown or missing required values.

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | string | Stable deterministic ID, `<section-key>-NNNN` |
| `test` | string | `SAT` or `ACT` |
| `section` | string | Official top-level section name |
| `sectionKey` | string | Catalog key linking the record to its manifest |
| `domain` | string | Official content/reporting domain |
| `skill` | string | Catalog skill within the domain |
| `subskill` | string | Specific assessed behavior |
| `difficulty` | string | `Easy`, `Medium`, or `Hard` |
| `responseType` | string | `multiple-choice`, `numeric`, or `essay` |
| `stimulus` | object or `null` | Optional passage, notes, table, or scenario belonging to this question alone |
| `passageId` | string or `null` | Links the question to a shared passage in `content/passages/<section-key>.json`. Mutually exclusive with `stimulus` |
| `stem` | string | Complete question or essay task |
| `choices` | array or `null` | Four choices for multiple-choice records |
| `correctAnswer` | number, string, or object | Zero-based choice index, numeric response, or writing guide |
| `hint` | string | Optional help that does not reveal the answer |
| `explanation` | string | Concise explanation shown first |
| `solutionSteps` | string array | Detailed ordered reasoning or writing plan |
| `distractorRationales` | array or `null` | One rationale per incorrect multiple-choice option |
| `strategy` | string | Fast or reliable test-taking approach |
| `trap` | string | Likely misconception |
| `estimatedSeconds` | positive integer | Expected completion time |
| `principles` | string array | Formula, convention, or reading/writing strategy |
| `calculatorPolicy` | string | Catalog-approved policy label |
| `format` | string | More precise format such as `passage`, `table`, or `essay-prompt` |
| `tags` | string array | Cross-cutting labels such as `modeling` |
| `provenance` | object | Original-content declaration, generator, seed, and creation date |
| `contentVersion` | string | Version matching the catalog |
| `reviewStatus` | string | `pending-editorial`, `automated-verified`, or `editorial-reviewed` |
| `verification` | object or `null` | Optional deterministic answer-verification data with `kind`, numeric `inputs`, and recomputed `expected` |

`distractorRationales` contains objects with an `index` and `reason`. It must
cover every incorrect option exactly once and must not include the correct
option.

Essay `correctAnswer` values contain a defensible sample thesis, an outline,
and rubric-aligned review criteria. They are guides, not claims that one
position is uniquely correct.

## Passages

Sections whose real exam builds questions around a shared passage keep those
passages in `content/passages/<section-key>.json`, one record per passage, and
questions point at them with `passageId`. A passage is stored once and
referenced by every question in its set; it is never copied onto the questions.
`tools/build-content.js` stitches the two together when it writes the
browser bundle, so consumers still read `question.stimulus` and see the
passage text. An optional shared `figure` is joined as `question.figure` in
both the browser bundle and Node hydration; it is not duplicated in canonical
questions.

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | string | `<section-key>-pNNN` |
| `sectionKey` | string | Section the passage belongs to |
| `type` | string | Passage kind, constrained per section (see below) |
| `title` | string | Short title shown above the passage |
| `intro` | string | Optional italic lead-in, as the real ACT prints |
| `content` | string | The passage itself; supports paragraph, list, and table blocks |
| `wordCount` | integer | Must equal the word count of `content` |
| `provenance` | object | Original-content declaration |
| `figure` | object, optional | `{ svg, alt, notToScale }`: strict allow-listed SVG, descriptive text, and a boolean scale flag |

The validator enforces the structure of each real exam:

| Section | Passage types | Words | Questions per passage |
| --- | --- | --- | --- |
| `act-reading` | literary-narrative, social-science, humanities, natural-science | 600–950 | 8–12 |
| `act-english` | personal-essay, informative-essay, historical-account, process-narrative | 250–450 | 12–18 |
| `act-science` | data-representation, research-summaries, conflicting-viewpoints | 80–600 | 5 for data, 6 for research/viewpoints |

Every `passageId` must resolve, every passage must be referenced, and a
question in a set must not also carry its own `stimulus`.

Passage figures must parse as XML and survive the same SVG sanitizer used by
the browser without losing content or attributes (renderer-owned root
attributes excepted). Scripts, handlers, links, styles, external references,
foreign elements and malformed markup are rejected during validation.

## Active Science and historical records

`content/banks/act-science.json` contains 80 original authored questions,
`act-science-0576` through `act-science-0655`, in 14 shared passage sets:
4 data representations, 8 research summaries and 2 conflicting viewpoints.
`content/archive/act-science.json` retains the original 575 records byte for
byte, with their IDs and original taxonomy. Runtime bundles include both so
old attempts can resolve; new practice eligibility begins at the catalog's
`activeQuestionIdMin`. Admission and active coverage read only the active bank.

Sections may override catalog-wide `targetPerSection` and `difficultyTargets`
using `targetQuestions` and `difficultyTargets`. The defaults remain 575 and
the original tier counts for unchanged sections. Science's explicit 80-item
target describes its authored inventory; it is not padded to the old target.
Its `archive` policy retains the historical content version, domain and
difficulty targets for separate archived-record validation. Active and archived counts are reported
separately.

The Science generator assembles
`content/sources/act-science/{data,research-a,research-b,viewpoints}.js` without
inventing questions or assigning difficulty. It supplies stable IDs and common
metadata, shuffles distractors with their rationales, and balances answer
positions within each authored tier and across the bank. Questions remain
`automated-verified`; independent agent review is not human editorial approval
or empirical difficulty calibration.

`content/science-reviews.json` has `format: "liminal-science-reviews"`,
`version: 1`, and a `reviews` array. Each record names `questionId`, `author`,
an independent `reviewer`, ISO-date `reviewedAt`, repository `evidence` under
`docs/reviews/`, `method: "independent-agent-blind-solve"`, `verdict: "accepted"`,
the reviewer's final zero-based `answer`, `fingerprintAlgorithm:
"sha256-science-question-v1"`, and `fingerprint`. The SHA-256 digest covers
every final canonical question and shared passage field. A shared passage
change invalidates all its questions' reviews. The reproducibility gate
compares the entire finite authored source output with the canonical files;
there are no additional runtime seeds or question variants. Reviewers solve
displayed questions before seeing their keys and then inspect the instructional
material. The checker validates the recorded evidence's integrity, not the
truth of an editorial judgment, and never creates approval records.
An optional `answerText` preserves the independently chosen option before the
generator's final shuffle; when supplied it must exactly match the choice at
the recorded final `answer` index.

`node tools/check-science.js` requires the passage structure, all catalog
subskills, graph and diagram figures, biology/chemistry/physics/earth-space
context tags, exact domain counts, answer balance, immutable archive,
reproducible generation and current independent answers. It runs in the full
gate and before any build that enables Science practice.

Duplicate detection adapts: two standalone questions are compared on their
stimulus, while two questions in a passage set are compared on stem plus
choices, since sharing the passage is the point.

Run `npm run validate` after authoring and `npm run build` to
refresh the browser-loadable banks. No package installation is required.
