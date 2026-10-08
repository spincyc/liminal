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
`lib/daily-reading.js`, `lib/reading-level.js`, `app/reading-level.js`.

## Probe set

A **level** is a daily-library grade number. Kindergarten is adult read-aloud
and is not self-calibrated; the ladder runs from Grade 1 up to the highest
level with probes. Nothing assumes 12 is the top: a higher library level,
such as Advanced 1 (13), needs only its library year and two probe forms.
Names and route keys come from the daily library (`gradeLabel`, `gradeKey` in
`src/lib/daily-reading.js`); an optional `levelLabels` entry in the probe file
overrides a name.

Each level has two **forms**: `a`, used by the first check, and `b`, the
alternate used by re-checks. Choose them from different points of that grade's
year (usually one in the first half and one in the second), of similar length
(within about 1.5 times), near the middle of that grade's text demand, and,
where the year allows, of similar kind, so the forms are comparable and the
ladder's difficulty rises from level to level. Choose nights for measurement
(length, self-containment, comparable forms), never to avoid difficult
content; see the daily library's policy in `docs/daily-reading.md`.

```json
{
  "id": "rl-5-a", "level": 5, "form": "a",
  "dayId": "reading-5-w08-d3", "textHash": "<the night's excerpt.textHash>",
  "intro": "One or two original orienting sentences, outside the source text.",
  "contentNote": "Optional student-facing note replacing the night's own (null: none).",
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
adult reading aloud). Its `contentNote` is shown unless the probe supplies its
own student-facing `contentNote` (or `null`). Facilitator notes and
discussion questions never reach the bundle.

The file's `review.status` is `unreviewed` until an independent reviewer has
checked every item, then `independently-reviewed` with a note naming the
review record in `docs/reviews/`.

**Current status: `independently-reviewed`** (2026-10-08). One independent
review agent, not the author, answered all 92 items from the passages before
seeing the keys, and also guessed every item with the passage hidden, on the
committed set. It found two blocking items and wider cueing; after the repair
pass it re-reviewed the changed set and found no blocking item
(`docs/reviews/2026-10-07-reading-level-items-review.md`, "Re-review
2026-10-08"). Its final edits S1–S7 (10-b-1; the stems of 3-b-4, 2-a-2 and
6-a-4; options in 5-a-4 and 9-a-4; the 11-a intro and note) were written by
the reviewer and checked by the author against each passage, so those
wordings had one reading each, not a blind one. As with 2-b-3, 7-a-4 and 9-b-3
from the first round, reviewer-written items have had no independent blind
review. This status means agent review of the items' keys, wording and cues.
It is not item statistics or field testing with students, not evidence of
grade-level difficulty, and not human editorial approval. Any later change to
an item, or a rebound night whose text changed, needs review again before the
status is claimed for it.

## Item-writing rules

- Grades 1–2: three items per probe; Grade 3 and up: four.
- Every item is **original**. Items must not copy or closely paraphrase the
  night's discussion questions or facilitator notes; the validator refuses six
  consecutive words shared with them, apart from words quoted from the passage.
  An item may target the same point as a discussion question, because the
  ladder never credits a passage the student has already seen (coordinator
  decision, 2026-10-08, after the independent item review found 25 items
  sharing a question's target but not its wording).
- Read the whole passage before writing. Each item is text-dependent,
  answerable from the passage alone (with the `intro`), and has exactly one
  defensible key. No trivia, outside knowledge, or trick wording.
- Four distinct options, all plausible to a reader who misread or skimmed
  (for example the other character's dinner, the everyday sense of a word, the
  writer's concession instead of the claim). Distractors are text-dependent:
  details from the wrong place in the passage, a reversal, or a misreading,
  not inventions anyone can rule out without reading. The key must not be
  visibly the longest option: the validator refuses a key at least 25% longer
  than every distractor. Spread keys across positions.
- Every vocabulary item has a trap: the word's everyday sense or a look-alike
  word (current as "now", industrious as "factory", intimates as "close
  friends"), or a nearby detail of the passage that describes the thing
  rather than the word.
- Do not put absolutes (always, never, only, all) only in distractors, or
  hedges (some, usually, more) only in keys.
- No item may give away another: check each stem against the other keys of
  the same probe.
- Nothing on screen may state an answer. The quiz shows the passage under a
  neutral label ("Passage"); the night's title, author and source appear only
  after the questions. The `intro` orients (who, where, when) without stating
  the main idea, and an item may not ask what the intro or content note says;
  the validator refuses a key that repeats four consecutive words of either.
  A probe's optional `contentNote` replaces the night's note with a
  student-facing one (the night's notes are often written for an adult);
  `null` shows none. Keep any content warning the night's note gives.
- One skill tag: `literal` (stated detail), `vocabulary` (meaning in context),
  `inference`, `structure` (organization, craft, the role of a detail or
  comparison), or `central` (main idea, claim, purpose). Mix them in each form.
- The `rationale` is one sentence that quotes the passage; the validator
  requires at least one quoted phrase found in it.
- Difficulty rises with level: literal and vocabulary items dominate the early
  grades; argument, figurative language and the role of examples dominate the
  later ones.

**Passage-hidden pass.** Before an item is final, read only its stem, its
options and what the screen shows (intro and content note), and ask whether
the key can be picked without the passage: from the stem's own wording, from
another item, from implausible or absolute distractors, or from length.
Rewrite any item that can. `node tools/check-reading-level.js --cues` lists
heuristic cues (absolutes only in distractors, hedges only in keys, key words
shared with the intro or with another item's stem) to start that pass; each
needs judgment, and the list never fails the gate.

Authors keep a scratch record of each item's justification (why the key is
right and each distractor wrong). Items need an **independent review** before
the set is described as reviewed: the reviewer answers each item from the
passage before seeing the key, also guesses every item with the passage
hidden, then checks for ambiguity, outside knowledge, copied wording, cueing
and fit to the level. The author does not certify
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
| `STRONG_SHARE` | 75% | 3 of 4, or 3 of 3. Guessing 3 of 4 among four equally plausible options happens about 5% of the time (3 of 3, under 2%); it rises sharply when options can be ruled out without reading (about 11% with one ruled out per item, 31% with two), so every distractor must be plausible. |
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
(`STRETCH_NIGHTS_BY_STAGE`), never more than 2 of 5. A stretch night never
comes between a main-level night and the night that continues it: it moves
later in that week, or is skipped that week if no slot remains. When the main
level's year ends, it continues at the stretch level where the stretch nights
reached; past the last night of the top level the plan simply ends.
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
| Past the end of the top level | The plan is marked complete ("top of the library"): nothing higher to schedule and no further re-checks |

If a decision cannot be applied, the re-check is closed and the plan stays as
it was; a saved screen that cannot be shown is set aside and the page returns
home, keeping the plan and the seen-passage log. A finished check whose
passages no longer exist gives no starting point and asks for a new check.

## Storage

`liminal:reading-level:v1` in `localStorage` holds attempts (dates, probe IDs,
answers, reading times, self-ratings), the unfinished passage, the plan
inputs, and a log of every passage shown (`seen`). Stopping a check discards
its answers but not the log, so a passage whose answers were revealed always
counts as a repeat; only Erase clears it. Dates shown on the page are the
viewer's local dates. No names or personal details are asked for or stored. Every read and
write is wrapped in `try`/`catch`; the saved value is parsed as untrusted, and
anything malformed is dropped. The page offers an erase with confirmation.

## Checks

```sh
node tools/check-reading-level.js              # validates; reports levels without probes
node tools/check-reading-level.js --complete   # also requires every level 1–12 and any higher library level (e.g. Advanced 1–4)
node --test test/reading-level.test.js
```

`tools/check-all.js` runs the first; the build validates before writing the
bundle, which holds the resolved passages, the items, and each library night's
title, minutes and continuation flag for printed plans (about 270 KB, about
85 KB compressed), so the quiz never downloads a whole grade file.

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
- Only passages shown by this page count as repeats. A student who already
  read a probe's night in the library, with its discussion, is not flagged.
- Each level has two forms. After both have been seen at a stretch level
  (for example the first check and one re-check that did not pass), every
  later re-check there is a repeat, which can hold but not advance. Advancing
  past that level then waits for the main level's year to run out, when the
  plan continues at the stretch level anyway. More forms per level would
  remove this limit.
- Readability comparisons used to choose forms are heuristic (syllable
  counts on older prose) and were checked by reading, not measured.
