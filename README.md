# Liminal

Free, original SAT and ACT practice that runs entirely in the browser.

**Live site:** https://spincyc.github.io/liminal/

Liminal is a study tool as well as a question bank: it teaches each SAT skill,
drills it, tests it the way the digital SAT does, and brings back what you
missed until you can do it.

SAT questions are generated fresh from question templates: 172 for SAT Math and
110 for SAT Reading and Writing, each a distinct question design with the real
test's traps built in. ACT sections draw from 575 original items each. Every
question carries a hint, an explanation, a step-by-step solution, the reliable
approach, the common trap, and, for multiple choice, why each wrong option is
wrong.

| Section | Source | Easy / Medium / Hard |
| --- | --- | --- |
| SAT Reading and Writing | 110 templates | 34 / 45 / 31 |
| SAT Math | 172 templates | 44 / 68 / 60 |
| ACT English, Mathematics, Reading, Science, Writing | 575 items each | |

## Honest practice

An earlier version of this site overstated readiness: a student whose practice
pointed to about 700 in SAT Math scored about 500 on the real test. Its "Hard"
questions were easy and named their own method, and skipped questions were
never recorded. Liminal is now built to keep practice honest:

- **Hard means hard-module difficulty**, judged question design by question
  design against [`docs/difficulty-calibration.md`](docs/difficulty-calibration.md),
  not bigger numbers.
- **No answer tells.** The gate fails any template whose key can be picked
  without solving: the longest or shortest choice, an extreme or middle
  value, a fixed opening phrase, a word that is always or never right, the
  odd one out, or a choice every distractor varies. A student who never reads
  the question scores near chance.
- **Every answer counts, once.** A blank counts as wrong, a correct answer
  after a hint is shown apart, a second answer to a question you have seen
  (as when Review brings a miss back) is left out of accuracy, and Hard
  accuracy is reported on its own.
- **No score estimates.** Accuracy here is not a scaled score. Official
  practice tests in [Bluebook](https://bluebook.collegeboard.org/) are the
  score gauge.

## Study

- **Learn.** One original lesson per SAT skill, with worked examples, the
  traps, and when each shortcut fails, linked from every question's
  explanation and from Progress; plus pages on format and scoring, pacing,
  the error log, Desmos, and a SAT Math plan for a student around 500.
- **Practice.** A set of any size, by domain, skill and difficulty, with
  feedback after each question or at the end and an optional real-pace timer.
  **Drill one skill** gives new numbers or a new context on every repeat.
  A set takes at most one question per template and per topic, prefers what
  you have seen least recently, follows the real test's domain weights, and
  has a code that retakes it exactly.
- **Take a test.** One SAT module (27 Reading and Writing questions in 32
  minutes, or 22 Math in 35), one section (Module 1, then a harder or easier
  Module 2 by how Module 1 went), or the full-length SAT with a 10-minute
  break. Timed per module, checked at the end, resumable after a reload, and
  reported by module, domain and difficulty. Module 2 routing is a fixed
  practice rule, since the real one is not published.
- **Digital test mode.** Every set runs in a full-screen test screen modeled
  on the real digital test: a timer you can hide with a five-minute alert, a
  question navigator, Mark for Review, an answer eliminator, a review page,
  typeset math, figures, a reference sheet, and a calculator link. Exit saves
  the set to finish later unless you discard it.
- **Review that brings mistakes back.** A missed question returns the next
  day, then after 3, 7 and 21 days each time you get it right; from the
  second return you get a fresh version built the same way, so you practise
  the method rather than remember an answer. The error log shows each miss
  with its passage or figure and both answers; tag why you missed it
  (content, process, careless, time) and write the rule you will remember.
- **Progress that tells you what to do next.** A 20-question "Start here"
  diagnostic per SAT section, a skill map with practice states (24 of a
  skill's last 30 Medium questions, then 10 of the last 15 Hard, each
  question counted once), pacing against real-test
  pace, a history of sets with an accuracy trend, a plan with your test date
  and weekly goal, and the next skill to work on. Record your official
  Bluebook practice-test and SAT scores there too: each sits beside your
  Liminal accuracy in the four weeks before it, and is never converted.
- **Printable booklets.** SAT booklets are built from templates to the
  digital test's module structure: a full-length test, one section, or one
  module, with an answer sheet, the key and explanations, and a form code
  that rebuilds the booklet. ACT booklets draw from the ACT banks.
- **One test at a time.** An SAT | ACT switch in the header scopes every page.

See [`docs/roadmap.md`](docs/roadmap.md) for what is next.

## Privacy

There are no accounts and no server. Progress is saved in the browser's local
storage on the device you practice on, so it survives closing the tab and
returning later. It does not follow you between devices and is lost if you
clear the site's data, so the Progress page can download it as a file and
restore it on another browser.

## Project layout

Content, code, and presentation are kept apart, so each can change without
touching the others.

| Path | Holds |
| --- | --- |
| [`content/`](content/) | The section catalog and its schema, the template registries (`templates/`), the SAT Learn pages (`learn/`), the ACT banks and passages, the authored sources the generators assemble, and the Markdown study guides |
| [`src/`](src/) | The web app: pages, styles, pure logic in `lib/` (including the SAT question templates in `lib/families/`), and browser UI in `app/` |
| [`tools/`](tools/) | Build, validation, audit, and question-generation scripts |
| [`test/`](test/) | Unit tests (`node:test`) |
| [`docs/`](docs/) | Content authoring rules, difficulty calibration, official test structure, reports, and the roadmap |

The repository has no runtime or development dependencies. Node 22 or newer
runs every tool.

## Develop

```sh
npm run build      # validate content and build the site into dist/
npm run serve      # serve dist/ at http://localhost:8080 (reachable from a phone on the same network)
npm run check      # the full gate: validation, templates, build, smoke test of dist/, guides, Learn pages, unit tests
npm run check:families -- --reps 3000   # a deeper pass over every template
npm run templates  # register new templates and re-version changed ones
```

Pushing to `main` runs the same gate in GitHub Actions and deploys `dist/` to
GitHub Pages. Pull requests run the gate without deploying.

SAT question templates follow [`docs/question-templates.md`](docs/question-templates.md);
ACT bank changes follow [`docs/content-authoring.md`](docs/content-authoring.md)
and the schema in [`content/schema.md`](content/schema.md). Difficulty labels
follow [`docs/difficulty-calibration.md`](docs/difficulty-calibration.md).
Learn pages follow the rules in [`AGENTS.md`](AGENTS.md).

## Notice

Independent educational practice. Not affiliated with, endorsed by, or
sponsored by College Board or ACT, Inc. SAT® is a registered trademark of
College Board. ACT® is a registered trademark of ACT, Inc. All questions and
passages here are original.

No license has been chosen yet; until one is, all rights are reserved.
