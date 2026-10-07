# Reading level

`reading-level.html` finds a starting point in the
[daily reading library](daily-reading.md) and plans steady steps up from it.
A student calibrates alone with short passages taken from the library itself
and automatically scored multiple-choice questions.

## What it is not

This is a **practice placement within Liminal's daily library**, made from a
few short passages. It is not a standardized test, a Lexile or other text
measure, a measured reading level, or a diagnosis. The library's grade labels
are editorial (see the daily reading contract), so a placement says which
nights are likely to be comfortable, nothing more. Answer keys ship to the
browser with the page, so the check relies on honest use. The page states this
in its header, on the printed plan, and here.

## Files

| Layer | File | Role |
| --- | --- | --- |
| Content | `content/reading-level/probes.json` | Probes and items (data only) |
| Logic | `src/lib/reading-level.js` | Scoring, ladder, placement, plan, re-check, saved-state parsing; tested in `test/reading-level.test.js` |
| Presentation | `src/reading-level.html`, `src/app/reading-level.js`, `src/styles/reading-level.css` | The page |
| Tooling | `tools/build-reading-level.js`, `tools/check-reading-level.js` | Validation and the `dist/content/reading-level.js` bundle |

Script order (pinned by `tools/smoke-static.js`): `content/reading-level.js`,
`lib/reading-level.js`, `app/reading-level.js`.

## Probe set

A **level** is a daily-library grade number. Kindergarten is adult read-aloud
and is not self-calibrated; the ladder runs from Grade 1 up to the highest
level with probes. Nothing assumes 12 is the top: a level 13 or higher needs
only its library year and two probe forms (an optional `levelLabels` entry,
for example `{ "13": "Level 13" }`, names it; the default is "Grade N" through
12 and "Level N" above).

Each level has two **forms**: `a`, used by the first check, and `b`, the
alternate used by re-checks. Choose them from different points of that grade's
year (usually one in the first half and one in the second) and, where the year
allows, of similar kind, so the forms are comparable.

```json
{
  "id": "rl-5-a", "level": 5, "form": "a",
  "dayId": "reading-5-w08-d3", "textHash": "<the night's excerpt.textHash>",
  "intro": "One or two original orienting sentences, outside the source text.",
  "items": [
    { "id": "rl-5-a-1", "skill": "inference", "stem": "…", "options": ["…", "…", "…", "…"],
      "key": 2, "rationale": "One sentence quoting the passage: “…”." }
  ]
}
```

The probe names an existing night by `dayId` **and** its `textHash`. The
passage is never copied or altered; the build resolves it from the grade file
and refuses a hash mismatch. A mismatch means the night changed: reread it and
review every item before updating the hash.

Probe nights must be 80–1,200 words (roughly 100–250 at Grade 1, rising to
500–1,100 at Grade 12), must not continue an earlier night, and should make
sense alone; the `intro` may supply a sentence of orientation. The night's own
`context` is not shown, because it is written for its night (often for an
adult reading aloud). Its `contentNote` is shown. Facilitator notes and
discussion questions never reach the bundle.

The file's `review.status` is `unreviewed` until an independent reviewer has
checked every item, then `independently-reviewed` with a note naming the
review record in `docs/reviews/`.

## Item-writing rules

- Grades 1–2: three items per probe; Grade 3 and up: four.
- Every item is **original**. Never adapt the night's discussion questions or
  facilitator notes; the validator refuses six consecutive words shared with
  them, apart from words quoted from the passage.
- Read the whole passage before writing. Each item is text-dependent,
  answerable from the passage alone (with the `intro`), and has exactly one
  defensible key. No trivia, outside knowledge, or trick wording.
- Four distinct options, all plausible to a reader who misread or skimmed
  (for example the other character's dinner, the everyday sense of a word, the
  writer's concession instead of the claim). The key must not be visibly the
  longest option: the validator refuses a key at least 25% longer than every
  distractor. Spread keys across positions.
- One skill tag: `literal` (stated detail), `vocabulary` (meaning in context),
  `inference`, `structure` (organization, craft, the role of a detail or
  comparison), or `central` (main idea, claim, purpose). Mix them in each form.
- The `rationale` is one sentence that quotes the passage; the validator
  requires at least one quoted phrase found in it.
- Difficulty rises with level: literal and vocabulary items dominate the early
  grades; argument, figurative language and the role of examples dominate the
  later ones.

Authors keep a scratch record of each item's justification (why the key is
right and each distractor wrong). Items need an **independent review** before
the set is described as reviewed: the reviewer answers each item from the
passage before seeing the key, then checks for ambiguity, outside knowledge,
copied wording, cueing and fit to the level. The author does not certify
their own items.

## Method and thresholds

All thresholds are named constants in `src/lib/reading-level.js` with their
reasons beside them.

**Reading.** The clock starts when the passage appears and stops at Done.
Pace is words ÷ that time. The passage stays visible during the questions,
which are untimed. A reload mid-passage restarts the clock.

**One probe's result.**

| Constant | Value | Why |
| --- | --- | --- |
| `STRONG_SHARE` | 75% | 3 of 4, or 3 of 3. Guessing 3 of 4 happens about 5% of the time, 3 of 3 under 2%. |
| `WEAK_BELOW` | 50% | 0–1 of 4 or of 3: not understood well enough to read alone. |
| `COMFORTABLE_WPM_FLOOR` | 40 (Grade 1) rising to 130 (Grade 12) | Deliberately low floors, well under typical silent-reading rates, so only clearly laboured reading holds a student back. Editorial, not norms. Levels above the table use its last value. |
| `MAX_PLAUSIBLE_WPM` | 600 | Faster is not careful first reading; such a probe cannot move a student up. |

A probe is **comfortable** (pass) with strong comprehension, a comfortable
pace, no "too hard" self-rating and a passage not seen before; **close**
(near) when it is not a pass but at least half correct; otherwise **hard**
(weak). The optional self-rating can only hold a student back.

**The ladder.** Start at the chosen level (or the nearest probed level below
it). A pass steps up one probed level; a near result steps down one; a weak
result steps down two when both are untried, and a later pass climbs back one
at a time, so no level between is skipped. Stop when a passed level sits
directly below a level that was not passed, at the top or bottom, or after
`MAX_PROBES` = 5 passages (about 15–35 minutes).

**Placement.** The highest passed level, at a week chosen by the evidence
(`PLACEMENT_WEEK`): week 19 when the next level was close; week 10 when every
answer at the placed level was right at a comfortable pace; otherwise week 1.
If no level passed, the start is the level below the lowest tried and is
**unconfirmed**; at the bottom of the ladder the student reads Grade 1 nights
with an adult (they are written for reading aloud or together), and the page
offers the Kindergarten read-aloud nights for a younger child.

**Plan.** Dated nights on five evenings a week (Monday–Friday or
Sunday–Thursday), for 4, 8 or 12 weeks, starting on the first reading evening
on or after the chosen date. Main-level nights run in library order from the
placement. Stretch nights come from the next level in the library, in its
order from week 1, placed mid-week: 1 a week in the first four weeks, then 2
(`STRETCH_NIGHTS_BY_STAGE`), never more than 2 of 5. When the main level's
year ends, it continues at the stretch level where the stretch nights reached.
Unconfirmed placements get no stretch nights. Each night links to
`daily-reading.html#<level>/<week>/<day>`.

**Re-check.** Due the day after every fourth week's last night
(`RECHECK_EVERY_WEEKS`), and available any time. One probe at the stretch
level, preferring the form not yet seen; if that level has no probes yet, the
next probed level above stands in. A seen passage is a repeat and cannot move
a student up. The decision applies at the student's current place in the plan
(the first night dated after the re-check, assuming earlier nights were read):

| Result | Decision |
| --- | --- |
| Pass at or above the stretch level | Advance: the stretch level becomes the main level, continuing from the stretch nights; stretch starts over at the next level |
| Close | Hold and keep stretching (the share of stretch nights keeps growing) |
| Hard | Hold, back to one stretch night a week |
| Unconfirmed placement | Its own level is re-checked; a pass confirms it and starts stretch nights |

## Storage

`liminal:reading-level:v1` in `localStorage` holds attempts (dates, probe IDs,
answers, reading times, self-ratings), the unfinished passage, and the plan
inputs. No names or personal details are asked for or stored. Every read and
write is wrapped in `try`/`catch`; the saved value is parsed as untrusted, and
anything malformed is dropped. The page offers an erase with confirmation.

## Checks

```sh
node tools/check-reading-level.js              # validates; reports levels without probes
node tools/check-reading-level.js --complete   # also requires every level 1–12 and any higher library level
node --test test/reading-level.test.js
```

`tools/check-all.js` runs the first; the build validates before writing the
bundle, which holds the resolved passages, the items, and each library night's
title and minutes for printed plans (about 200 KB), so the quiz never
downloads a whole grade file.

## Limits

- A few short passages give a coarse estimate. One passage per level per
  sitting cannot separate a hard text from an off day.
- Forms at the same level come from different points of the year and from
  different texts, so they are comparable, not equated.
- Pace floors and placement weeks are editorial choices, not research norms.
- Answer keys and rationales are visible to anyone who opens the bundle.
- A student's reading of the library nights between re-checks is assumed,
  not recorded.
- Kindergarten is not calibrated, and a level without probes is skipped by the
  ladder (a re-check uses the next probed level above it).
