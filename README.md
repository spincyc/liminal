# Liminal

Free, original SAT and ACT practice that runs entirely in the browser.

**Live site:** https://spincyc.github.io/liminal/

Liminal has 4,025 original questions and writing prompts across every current
SAT section and every required or optional ACT section. Each item carries a
hint, a concise explanation, step-by-step solution, a reliable approach, the
common trap, and, for multiple choice, why each wrong option is wrong.

| Section | Items |
| --- | ---: |
| SAT Reading and Writing | 575 |
| SAT Math | 575 |
| ACT English | 575 |
| ACT Mathematics | 575 |
| ACT Reading | 575 |
| ACT Science | 575 |
| ACT Writing | 575 |

## Practice

- **One test at a time.** An SAT | ACT switch in the header scopes every page
  to one test: sections, mini tests, booklets, study tips, progress, and
  review lists.
- **SAT questions from templates.** SAT Math and SAT Reading and Writing are
  generated fresh from question templates, each a distinct question design
  with the real test's traps built in, including figures not drawn to scale.
  A set takes at most one question per template and at most one per topic,
  prefers templates you have not seen, and shows a set code that rebuilds it
  exactly. See [`docs/question-templates.md`](docs/question-templates.md).
- **Digital test mode.** Every set runs in a full-screen test screen modeled
  on the real digital test: a timer you can hide with a five-minute alert, a
  question navigator, Mark for Review, an answer eliminator, a review page
  before you finish, figures, a reference sheet, and a calculator link.
- **Your choice of feedback.** Check each answer as you go, or answer the
  whole set and get a report at the end.
- **Any number of questions,** up to the number of templates that match,
  with quick picks for a real module (22 Math, 27 Reading and Writing), and
  an optional timer at real-test pace.
- **Progress that stays.** Attempts, Hard accuracy on its own, the templates
  you have seen, missed and marked-for-review lists, and an unfinished set you
  can resume after closing the tab.

Accuracy here is not a scaled score. See [`docs/roadmap.md`](docs/roadmap.md)
for what is next.

## Privacy

There are no accounts and no server. Progress is saved in the browser's local
storage on the device you practice on, so it survives closing the tab and
returning later, but it does not follow you between devices and is lost if you
clear the site's data.

## Project layout

Content, code, and presentation are kept apart, so each can change without
touching the others.

| Path | Holds |
| --- | --- |
| [`content/`](content/) | Canonical questions (`banks/`), shared passages, the section catalog and its schema, the authored sources the generators assemble, and the Markdown study guides |
| [`src/`](src/) | The web app: pages, styles, pure logic in `lib/`, and browser UI in `app/` |
| [`tools/`](tools/) | Build, validation, audit, and question-generation scripts |
| [`test/`](test/) | Unit tests (`node:test`) |
| [`docs/`](docs/) | Content authoring rules, difficulty calibration, official test structure, reports, and the roadmap |

The repository has no runtime or development dependencies. Node 22 or newer
runs every tool.

## Develop

```sh
npm run build      # validate content and build the site into dist/
npm run serve      # serve dist/ at http://localhost:8080 (reachable from a phone on the same network)
npm run check      # the full gate: validation, build, smoke test of dist/, guides, unit tests
```

Pushing to `main` runs the same gate in GitHub Actions and deploys `dist/` to
GitHub Pages. Pull requests run the gate without deploying.

Content changes follow [`docs/content-authoring.md`](docs/content-authoring.md)
and the schema in [`content/schema.md`](content/schema.md). Difficulty labels
follow [`docs/difficulty-calibration.md`](docs/difficulty-calibration.md).

## Notice

Independent educational practice. Not affiliated with, endorsed by, or
sponsored by College Board or ACT, Inc. SAT® is a registered trademark of
College Board. ACT® is a registered trademark of ACT, Inc. All questions and
passages here are original.

No license has been chosen yet; until one is, all rights are reserved.
