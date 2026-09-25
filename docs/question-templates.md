# Question templates

SAT practice is built from **templates** (called families in the code): a
template is one question design, a parameterized generator that draws a fresh,
independently verified question each time. A practice run takes **at most one
question per template**, and at most one per scene (topic), so no set shows
the same question twice with new names or numbers.

The fixed banks this replaces did not work that way. Every SAT Math item named
its method in the stem ("Use the slope perpendicular structure for this
case."), and SAT Reading and Writing had one sentence frame per skill filled
from 21 community-project topics; all 52 of its Cross-Text items were the same
question with different names. ACT sections still use their fixed banks.

Templates are written to `docs/difficulty-calibration.md` and carry the real
test's traps as distractors: not-to-scale figures, extraneous roots, answers
supported by only one of two texts, grammatical but illogical transitions.

## Files

Templates follow the catalog: one file per skill, grouped by test, section,
and domain. Difficulty is a field on each template, not a folder, so
recalibrating a template is a one-line change.

```
src/lib/families/
  shared/                      random, notation, figures, instantiate (+ index.js for Node)
  sat/
    math/<domain>/<skill>.js   e.g. sat/math/algebra/linear-functions.js
    reading-writing/<domain>/<skill>.js
```

| Path | Holds |
| --- | --- |
| `src/lib/families/shared/` | Seeded randomness, notation, SVG figure helpers, `instantiate`, and the browser `register` hook |
| `src/lib/families/<test>/<section>/<domain>/<skill>.js` | Every template for one catalog skill, all difficulties |
| `src/lib/families/<test>/<section>/<domain>/common.js` | Helpers and topic banks shared by two or more skills in the domain |
| `src/lib/families/<test>/<section>/index.js` | Node entry point: every template of the section, in catalog order |
| `content/templates/<section>.json` | The template registry: each template's permanent bit |
| `src/lib/template-mask.js` | A set of templates as one number |
| `src/lib/runs.js` | Choosing a run's templates and drawing its questions |
| `tools/lib/families.js` | The ordered source files of each section's browser bundle |
| `tools/check-families.js` | The gate for every template |
| `tools/update-templates.js` | Keeps the registries in step with the templates |

Every file is dependency-free and loads either through `require` or as a plain
browser script. The build concatenates each section's files, in catalog
order, into one bundle (`dist/lib/families/<section>.js`) that the app loads
the first time the section is chosen; its templates register into
`window.LiminalFamilies[sectionKey]`.

## Runs, masks, and codes

Each template owns a permanent bit in its section's registry. A run is the set
of its templates' bits: one number (a BigInt, written in base 36), so "at most
one per template" holds by construction. `runs.chooseTemplates` fills a run by
preferring templates the student has not seen, then the skill used least so
far, then a seeded shuffle; `runs.drawQuestions` draws one question per
template, retrying a template's seed so no two questions share a scene.

A run's code is its mask and its seed, for example `7phl4hfxcdfx66p-bp99wd`;
the report shows it, and `runs.parseRunCode` plus `runs.templatesForMask`
rebuild the same questions in the same order. A question's id is
`<section>:<template>:<seed>`, so any past question can be rebuilt exactly.
The student's history per section is the union of their runs' masks, stored
as one code in `liminal:progress:v2`.

Registry bits are permanent: `node tools/update-templates.js` appends new
templates, marks removed ones retired (their bits stay reserved), and never
renumbers, so a stored mask always means the same templates. The gate runs it
with `--check`.

## How many templates

The gate requires enough templates that the largest real runs never repeat
one: SAT Math at least 22 per difficulty (a module) and 66 in all; SAT Reading
and Writing at least 27 per difficulty (a module at one difficulty), 81 in
all, and 6 per skill. Both require at least 2 templates in every cell of the
skill x difficulty table, so a drill on one skill at one tier never runs
dry. A set asking for more questions than templates match is
capped at the number available, and the setup form says so.

## The family contract

```js
{
  id: "kebab-case-unique",
  sectionKey,                     // "sat-math" (default) or "sat-reading-writing"
  difficulty,                     // "Easy", "Medium", or "Hard" (default)
  domain, skill, subskill,        // exactly as in content/catalog.json
  title: "Human name",            // must never appear in a stem
  recognize: "What the student must see before computing.",
  rubric: { steps, concept, interpretation, distractors, abstraction, synthesis, trap },
                                  // 0-2 each per docs/difficulty-calibration.md; total within the tier's band
  tricks: ["..."],                // at least 2 (1 for Easy) from the vocabulary in tools/check-families.js
  build(t) { return instance; },  // t = S.tools(random): int, pick, shuffle, sign, chance, nonzero, sample
}
```

`build` returns one instance:

| Field | Notes |
| --- | --- |
| `responseType` | `"multiple-choice"` or `"numeric"` (student-produced response) |
| `stimulus` | `null`, or `{ type, content }`: `equations` (one per line), `table` (pipe rows via `S.table`), `text`, `passage`, `paired-passages` ("Text 1" / "Text 2" lines), or `notes` (bulleted student notes) |
| `scene` | The topic, e.g. `cs-urban-birdsong`; required for Reading and Writing, prefixed by domain so scenes never collide |
| `figure` | `null`, or `{ svg, alt, notToScale }` built with `S.svg` and `S.svgParts` |
| `stem` | The question alone, in the real test's register: "In the given system of equations, k is a constant. …" |
| `correct` | Number or display string for multiple choice; number for numeric |
| `wrong` | Multiple choice only: `[value, reason]` pairs, at least 3 surviving de-duplication; each reason names the specific wrong method |
| `explanation`, `steps` (≥ 2), `principles` (≥ 1), `trap`, `hint` | Shown after answering; the hint nudges without naming the method |
| `verify` | `() => boolean` that recomputes the answer **by a different route** than `build` did (substitute back, brute force, determinant, numeric root check) |
| `estimatedSeconds` | Optional; default 105 |

Rules the gate enforces for every template:

- The rubric total falls in the tier's band (Easy 0–3, Medium 4–8, Hard 9–14,
  with two factors at 2 for Hard).
- The stem never names the method, never tells the student to verify, and
  never contains the family title.
- The key is never the odd one out in form: if the other three choices share
  an opening word, the key shares it too.
- Numeric keys are plain decimals that fit the real 5-character answer grid
  (a leading minus is free). `core.js` compares typed answers numerically, so
  a key must be an integer or a terminating decimal, never a fraction string.
- Math: at least 75% of 200 repetitions are distinct, and every family has at
  least two surface forms (a different quantity asked for, or a different
  presentation), so repetitions are not the same question with new numbers.
- Reading and Writing: multiple choice only; every passage (each text of a
  pair) is 25–150 words, the real test's range; every item names a scene and
  a template has at least 8 scenes; the key is the unique longest choice at
  most 40% of the time.
- A `notToScale` figure must be drawn to *suggest a wrong answer*, and that
  answer must be offered, with a reason that says the drawing misled
  (multiple choice), or be named in the trap (numeric).
- Figures use `currentColor`, carry `alt` text, and contain no script.
- Across all families: 20–40% numeric (the real test is about a quarter),
  keys spread across A–D, the longest choice is not usually the key, and at
  least three families use not-to-scale figures.

## Exam tricks to reproduce

The real test's hard items rarely need more work; they punish a reflex.
Families declare which tricks they use, and each trick must be backed by a
distractor that a student falls into by committing it:

| Trick | What the offered wrong answer does |
| --- | --- |
| `not-to-scale-figure` | Reads a length or angle off a drawing labelled not to scale |
| `intermediate-value` | Stops at a quantity computed on the way |
| `wrong-quantity` | Answers a neighbouring question: x instead of 2x, the other root, the radius for the diameter |
| `unit-mismatch` | Given in one unit, asked in another |
| `sign-error` | Loses a sign while rearranging |
| `extraneous-solution` | Keeps a root that fails the original equation |
| `must-vs-could` | Picks what could be true when the question asks what must be |
| `rounding-direction` | Rounds the way arithmetic suggests rather than the way the context requires |
| `percent-base` | Takes a percent of the wrong base |
| `part-vs-whole` | Uses a part where the whole is needed, as in similar-triangle segments |
| `equivalent-form` | Choices are rearrangements; only one is truly equivalent |
| `context-constraint` | Keeps a solution the context forbids |
| `unweighted-average` | Averages averages |
| `reversed-condition` | Answers for the opposite case (infinitely many instead of none) |
| `neighbouring-rule` | Uses the rule next door: area for perimeter, sum for product |
| `too-broad` / `too-narrow` | Claims more than the text supports, or offers a true detail as the main point |
| `true-but-irrelevant` | Accurate, but does not answer the question asked |
| `opposite-stance` | Reverses the author's position |
| `one-text-only` | Supported by only one of two texts |
| `misattributed-view` | Gives the view of someone the author cites as the author's |
| `extreme-language` | Always, never, proves, completely |
| `word-association` / `common-meaning` | Reuses the passage's words in another sense, or the everyday sense the context rules out |
| `grammatical-but-illogical` | Correct grammar, wrong logical relation |
| `comma-splice` / `agreement-attractor` / `dangling-modifier` | The conventions error the choice commits |
| `off-goal` | Accurate notes that do not accomplish the stated goal |

## Commands

```sh
node tools/check-families.js                      # gate, 200 reps per family, both sections
node tools/check-families.js --section sat-math --file algebra/linear-functions
node tools/check-families.js --matrix                     # skill x difficulty coverage
node tools/update-templates.js                    # register new templates
node tools/check-families.js --sample <id> --seed 3 --svg-dir <dir>
```

The reference templates are `system-parameter-solution-count`
(`sat/math/algebra/systems-of-two-linear-equations.js`) and
`cross-text-method-challenge`
(`sat/reading-writing/craft-and-structure/cross-text-connections.js`).
