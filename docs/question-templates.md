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
| `content/templates/<section>.json` | The template registry: each template's permanent bit, version and fingerprint |
| `src/lib/template-mask.js` | A set of templates as one number |
| `src/lib/runs.js` | Choosing a run's templates and drawing its questions |
| `src/lib/modules.js` | The digital test's module blueprint and template-built forms (booklets) |
| `tools/lib/families.js` | The ordered source files of each section's browser bundle |
| `tools/check-families.js` | The gate for every template |
| `tools/lib/tells.js` | The gate's answer-tell and variety measurements (pure; `test/tells.test.js`) |
| `tools/lib/expr.js` | Reads a choice such as "−3/4", "2√3" or "$1,200" as a number |
| `tools/lib/svg-tree.js` | Parses figure SVG as the browser's DOMParser does, so the gate can run `render.js`'s sanitizer |
| `tools/lib/fingerprint.js` | A template's fingerprint: a hash of what the student sees for seeds `fp-0`…`fp-7` |
| `tools/lib/registry.js` | Registry rules: permanent bits, retirement, versions |
| `tools/update-templates.js` | Keeps the registries in step with the templates |

Every file is dependency-free and loads either through `require` or as a plain
browser script. The build concatenates each section's files, in catalog
order, into one bundle (`dist/lib/families/<section>.js`) that the app loads
the first time the section is chosen; its templates register into
`window.LiminalFamilies[sectionKey]`.

## Runs, masks, and codes

Each template owns a permanent bit in its section's registry. A run is the set
of its templates' bits: one number (a BigInt, written in base 36), so "at most
one per template" holds by construction.

`runs.chooseTemplates(templates, { count, seed, filters, seen, recency, domainWeights })`
fills a run:

- With `recency` (`{ templateId: lastServed }`, a serve counter that only
  grows) it prefers templates never served, then those served least
  recently; without it, templates outside the `seen` history mask come first.
  A lifetime union stops rotating once every template has been seen once;
  recency keeps rotating.
- Ties go to the skill used least so far in the run, then a seeded shuffle.
- With `domainWeights` (`{ domain: weight }`, the catalog's domain targets)
  each domain first gets seats in proportion to its weight, by largest
  remainder; a domain short of templates passes its surplus on. Without it a
  Math run came out Algebra 26 / Advanced Math 22 / Problem-Solving 31 /
  Geometry 21%, against the real test's 35/35/15/15.

`runs.drawQuestions(templates, seed, instantiate, idPrefix, { seenScenes, attempts })`
draws one question per template from the seeds `<run seed>.<template>.<attempt>`,
trying attempts 0–35:

- It never serves a draw that throws or whose record has `verified === false`.
- No two questions share a scene, and with `seenScenes`
  (`{ templateId: [scene, …] }`, oldest first) a template avoids scenes the
  student has seen, or else shows the one seen longest ago.
- A template with no good draw is left out. The returned array carries
  non-enumerable `skipped` (`[{ templateId, reason }]`) and `attempts`
  (`{ templateId: attempt }`); read them before copying the array.

A run's code is its mask and its seed, for example `7phl4hfxcdfx66p-bp99wd`.
`runs.runCode(mask, seed, questions.attempts, templates)` appends one base-36
digit per template in bit order when a draw steered around seen scenes;
`runs.parseRunCode(code, templates)` returns `{ mask, seed, attempts? }`, and
`drawQuestions(runs.templatesForMask(templates, mask), seed, instantiate, prefix, { attempts })`
rebuilds the same questions in the same order. A question's id is
`<section>:<template>:<seed>`, so a past question can be rebuilt exactly while
its template's version is unchanged.

Registry entries are `{ id, bit, version, fingerprint, retired? }`. Bits are
permanent: `node tools/update-templates.js` appends new templates at version 1,
marks removed ones retired (their bits stay reserved), and never renumbers, so
a stored mask always means the same templates. The fingerprint hashes what
the student sees (stimulus, figure, stem, choices, key, and the teaching text)
for the seeds `fp-0`…`fp-7`; when it changes, the version goes up by one, so a
stored attempt knows whether it was answered on the question the template
builds today. Tier, skill and other metadata are left out: a relabel is not a
new question. After editing a template, rerun `update-templates` and commit
the registry; the gate runs it with `--check` and fails on a stale entry.

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
| `correct` | Number or display string for multiple choice; for numeric, a number, or an exact fraction string in lowest terms (`S.frac`) where the real answer would be a repeating decimal |
| `wrong` | Multiple choice only: `[value, reason]` pairs, at least 3 surviving de-duplication; each reason names the specific wrong method. A modelled mistake that equals the key must be rejected in `build` by redrawing: the record's `keyEqualDistractors` must be 0 |
| `features` | Optional: `{ correct: {…}, wrong: [{…}, …] }`, `wrong` in the same order as `wrong`, holding short string values such as `{ number: "plural", finite: "yes", mark: "comma" }`. `instantiate` records them as `choiceFeatures` in choice order. Standard English Conventions templates must declare every grammatical feature their choices vary on |
| `explanation`, `steps` (≥ 2), `principles` (≥ 1), `trap`, `hint` | Shown after answering; the hint nudges without naming the method |
| `verify` | `() => boolean` that recomputes the answer, by a different route than `build` where one exists (substitute back, brute force, determinant, numeric root check). Many verifies check only the key, and Reading and Writing verifies check structure, not meaning: `verified` is a guard against broken draws, not a proof that the distractors are wrong |
| `estimatedSeconds` | Optional; default 105 |

Rules the gate enforces. Every template is built on integer seeds 0…reps−1
and on as many runtime-shaped seeds `<base36>.<template>.<attempt>` (reps is
300 by default, so 600 draws); a share is judged once at least 100 draws
qualify. The answer-tell checks exist because a student can learn a template's
habits in a few draws, and a set that can be passed by habit overstates
readiness.

1. Every draw builds, `verified` is true, and `keyEqualDistractors` is 0.
2. Each of A–D is the key in 15–35% of multiple-choice draws.
3. Text choices (averaging at least 3 words): the key is the unique longest
   choice in at most 40% of draws, and the unique shortest in at most 40%.
   Reading and Writing choices shorter than that (a mark, a verb form, a
   transition) are judged the same way by their characters.
4. When all four choices are numbers, the key is the smallest or largest value
   in 15–85% of those draws.
5. Text choices: an opening (first two words, lower-cased) used in at least
   25% of draws is the key in at most 60% of its uses.
6. A choice (ignoring case, spacing and trailing punctuation) offered in at
   least 20% of draws is the key in at most 75% of them.
7. For each declared feature, the key is the only choice with its value in at
   most 40% of draws. Standard English Conventions templates declare features
   on every draw, with the same names on every choice.
8. The blind "hub" strategy scores at most 50% on a template and at most
   32% over each tier's multiple choice, in both sections. The strategy
   never reads the stem: it scores each choice by the numbers, symbols and
   words it shares with the other choices, keeps the two middle values when
   all four are numbers, and guesses among the best-scoring.
9. Items count as distinct when their stimulus, stem or set of choices
   differ; reordering choices is not variety. Math: at least 75% distinct over
   the first 200 draws. Reading and Writing: at least 10 distinct items per
   template.
10. Transitions: every word or phrase offered at least 20 times across the
    skill's templates is the key in 10–60% of its appearances.
11. Figures: no NaN, Infinity or undefined; every SVG parses as XML and passes
    `render.js`'s `sanitizeSvgTree` without losing an element, text or
    attribute (the root's xmlns, role and aria-label excepted, since the
    renderer sets them).
12. Template counts, as in "How many templates".
13. Look-alike pairs: a blind strategy that guesses among the choices that
    look like another choice (one change apart: a negation, a reciprocal, a
    factor of 2, the complement to 90, 100, 180 or 360, a flipped sign, or
    one word or symbol swapped, added or dropped) scores at most 40% on a
    template and at most 32% over each tier's multiple choice, in every
    section. When no choice or every choice has a look-alike, the strategy
    guesses among all four.
14. Most-similar pair (Reading and Writing text choices): a blind strategy
    that guesses between the two choices sharing the most words (by the
    share of their words in common) scores at most 40% on a template and at
    most 30% over each tier. A distractor written by editing the key shares
    most of its words, so write distractors that are as close to one another
    as to the key.
15. Visible text: no "a" before a number read with a vowel sound ("a 80%"),
    no count of one with a plural unit ("1 boxes"), no coefficient of one
    written out ("1y"), no hyphen for a minus before a superscript ("x-²"),
    and no repeating decimal cut off on screen ("0.3333"; use a fraction or a
    rounded value the stem asks for), in the stimulus, stem or choices.

Also enforced:

- Every template declares its `difficulty`; nothing defaults to Hard.
- A "closest to", "approximately", "nearest" or "best approximation" item
  returns `approximates`, the exact value it rounds, and its key is the
  nearest choice to that value with every other choice at least twice as
  far (check 1).
- The rubric total falls in the tier's band (Easy 0–3, Medium 4–8, Hard 9–14,
  with two factors at 2 for Hard).
- The stem never names the method, never tells the student to verify, and
  never contains the family title.
- The key is never the odd one out in form: if the other three choices share
  an opening word, the key shares it too.
- Numeric keys are a plain decimal or a lowest-terms fraction that fits the
  real 5-character answer grid (a leading minus is free).
- Math: every family has at least two surface forms (a different quantity
  asked for, or a different presentation).
- Reading and Writing: multiple choice only; every passage (each text of a
  pair) is 25–150 words, the real test's range; every item names a scene and
  a template has at least 8 scenes.
- A `notToScale` figure must be drawn to *suggest a wrong answer*, and that
  answer must be offered, with a reason that says the drawing misled
  (multiple choice), or be named in the trap (numeric).
- Figures use `currentColor`, carry `alt` text that does not give the answer
  away, and contain no script.
- Across all families: 20–40% numeric (the real test is about a quarter),
  key positions 18–32%, the longest choice is the key at most 40% of the
  time, and at least three families use not-to-scale figures.

## Building choices without tells

The gate measures tells; these construction patterns avoid them.

- **Errors on a grid.** Build distractors from two independent mistakes
  (each alone, then both), so every choice differs from two others by one
  change and no choice is the one the others vary around.
- **Keys anywhere in order.** Offer slips on both sides of the key, so the
  key is sometimes the smallest or largest value (`spreadRank` and
  `packRanked` with `balance` in the Problem-Solving and Geometry
  `common.js`; `spreadAround` and `spreadWithMirror` in Algebra's). Offer a
  decoy ± pair when the key's negation is a likely slip.
- **Statement grids.** For "which is true" items, cross two claims with their
  negations (`statementGrid`), so each choice has the same shape and length.
- **Two decisions in grammar.** Standard English Conventions choice sets are
  2×2 squares over two grammatical decisions (number × tense, mark × verb
  form), declared as `features`, so the key is never alone on one feature.
- **Transitions.** Each Transitions template mixes at least two key relations
  across its scenes, so every word is sometimes right and sometimes wrong.
- **Rhetorical Synthesis.** Choices are grounded word by word against the
  notes (`ungroundedWords` in `expression-of-ideas/common.js`, with per-topic
  `allow` lists), so no distractor adds a fact the notes lack.
- **Edit the distractors from each other, not only from the key.** In
  Reading and Writing, a distractor that is the key with one phrase changed
  puts the key in the most-similar pair (check 14) and at the hub (check
  8). Give each distractor a sibling: two wrong answers that share a frame,
  and the key sharing a frame with one of them.
- **Pair the distractors too.** A slip that is one change from the key
  (the negation, the reciprocal, double) leaves the key in a look-alike
  pair; give a distractor its own look-alike, or offer slips of the slip,
  so pairs do not single out the key (check 13). Helpers: `balanceTwins`
  (Geometry `common.js`) keeps a slip that halves, doubles, negates or
  complements the key in only a share of draws; `pairBalanced` (Advanced
  Math `common.js`) picks choice sets whose informative pairs sit on the key
  about as often as off it.
- **No cut-off decimals.** `looksCutOff` (Problem-Solving `common.js`)
  rejects a value whose printed form would look like a repeating decimal
  cut off on screen (check 15); redraw instead.
- **Redraw, don't drop.** A modelled mistake that lands on the key, or two
  choices with the same value, redraws the instance.

Figures: Math graphs use the coordinate-plane helpers `S.plane` in
`shared/figures.js` (grid, axes, lines, segments, clipped curves, points,
shaded half-planes, labels); data displays use the helpers in the
Problem-Solving `common.js`; Reading and Writing bar and line graphs come
from `information-and-ideas/common.js`, whose `verify()` reads the values
back from the alt text (`readChartAlt`). Alt text describes the figure
without giving the answer away. Shared text uses the notation helpers
(`S.plural`, `S.money`, `S.grouped`, `S.article`).

Reading and Writing passages written in an older style, and original poems,
open with an honest header ("The following text is from an original story
written in a nineteenth-century style."). Invented researchers appear only
with invented places and studies; a real person, place or finding must be
accurate.

## Writing math

The test screen, booklets and Learn pages typeset Math text
(`LiminalRender.renderText(text, { math: true })`, styled by
`src/styles/math.css`). Write exponents as `x^2`, `x^(3/5)` and `(0.95)^t`;
fractions as `a/b` and `(x + 1)/(x − 2)`; roots as `√7`, `√(x + 4)` and
`⁵√(x⁶)`. `1/2x` stays plain text, so write `(1/2)x` or `1/(2x)`; bare
products such as `rs/2` stay plain too, so write `(rs)/2`. Minus is U+2212
(`−`), never a hyphen. Units (`km/h`) and segment ratios (`PT/PR`) are not
typeset.

## Modules and forms

`src/lib/modules.js` holds a practice approximation of the digital SAT's
module structure; the real routing rules are not published, so every screen
that uses it says so.

| Module | Math (22) Easy/Medium/Hard | Reading and Writing (27) Easy/Medium/Hard |
| --- | --- | --- |
| Module 1 | 7 / 8 / 7 | 9 / 9 / 9 |
| Module 2, harder | 2 / 8 / 12 | 3 / 10 / 14 |
| Module 2, easier | 9 / 10 / 3 | 11 / 12 / 4 |

Domain counts per module: Math — Algebra 8, Advanced Math 8, Problem-Solving
and Data Analysis 3, Geometry and Trigonometry 3; Reading and Writing — Craft
and Structure 8, Information and Ideas 7, Standard English Conventions 7,
Expression of Ideas 5. Modules are 32 minutes (Reading and Writing) and 35
minutes (Math), with a 10-minute break between sections. The domain × tier
cells are split by controlled rounding, pinned in `test/modules.test.js`.
Each cell fills from its own tier first (least-used skill, then the seed); a
short cell borrows from the nearest tier in its domain (Medium borrows Hard
before Easy, so a short module errs harder), never across domains, and every
shortfall is reported. A form never repeats a template across its modules.
Reading and Writing groups questions by domain in the official order (Craft
and Structure, Information and Ideas, Standard English Conventions,
Expression of Ideas), Easy to Hard within each group; Math runs Easy, Medium,
Hard with a seeded shuffle inside each tier.

A booklet's form code is `<slots>-<seed>-<mask>.<mask>…-<check>`: the module
slots (`r`/`m` for the section, `1`/`h`/`e` for the module), a base-36 seed,
one registry-bit mask per module, and four check digits over the ordered
`id@version` list. It rebuilds the same templates after new ones are added;
a retired template is reported as missing, and a relabel, a version bump or
a typo changes the check digits, so the page warns that the booklet may
differ.

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
node tools/check-families.js                  # the gate: 300 integer + 300 runtime-shaped seeds per template
node tools/check-families.js --reps 3000      # a deeper pass for rare defects (about 70 s)
node tools/check-families.js --section sat-math --file algebra/linear-functions
node tools/check-families.js --family <id>
node tools/check-families.js --tells          # every measurement, one row per template
node tools/check-families.js --json <file>    # the same, machine-readable
node tools/check-families.js --matrix         # skill x difficulty coverage
node tools/check-families.js --sample <id> --seed 3 --svg-dir <dir>
node tools/update-templates.js                # register new templates, re-version changed ones
```

The reference templates are `linear-function-identity`
(`sat/math/algebra/linear-functions.js`), `graph-which-function`
(`sat/math/advanced-math/nonlinear-functions.js`), and
`inference-combine-separated-premises`
(`sat/reading-writing/information-and-ideas/inferences.js`).
