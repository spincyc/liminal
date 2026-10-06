# Classroom courses

Courses is Liminal's grade-and-subject library, separate from SAT/ACT sessions.
The first course covers the four topics in the supplied Grade 8 volume of
Savvas *enVision+ Common Core Mathematics, Student Edition*: Real Numbers,
Linear Equations, Functions, and Bivariate Data. Its 36 lesson references come
from the supplied contents. Topic 1 practice also follows the objectives and
formats observed in review pages 69–75. The publication year and numbered
volume have not been established. This is not a claim to cover every Grade 8
standard or the later volume.

All teaching prose, worked examples, and generated exercises are original.
Book section/page references help a family choose the corresponding lesson;
commercial project titles do not imply a reproduction of those projects.
Scans, student annotations, and device information are never build inputs or
repository content. The browser needs no textbook images or external service.

## Study and print

Open **Courses** from the landing page. Topic 1 is selected initially. The
Study view reads one selected lesson at a time, with worked reasoning hidden
until requested. Use **Practice this lesson** for a focused set or choose
several lessons for review. The practice builder offers a short set and an
explicit 20-question, 10-night preset. Replay settings are under the advanced
disclosure. Try a worksheet independently, then mark it with the separate
worked answer key. Use a later packet to revisit missed skills.
Problem counts are configurable; a packet is a supply of practice, not a
requirement to finish every page in one sitting.

Every night has three complete alternatives, **Worksheet A**, **B**, and **C**,
each with the configured question count and its own worked answers. They use
the same nightly lesson and exercise-design sequence, with different exercises.
Choose a night, then choose its worksheet; other nights keep their selections.
The summary shows every selected letter and distinguishes the questions selected
for printing from all available questions. A is initially selected for each
night. Changing alternatives hides preview answers; rebuilding resets choices.

Student worksheets, study guides, and worked answers are separate printable
documents. Student downloads contain neither solution data nor hidden answer
graphs. The student and key copies carry matching worksheet identifiers and
question numbers, with the night and worksheet letter on each page. Separate
student and answer exports include the chosen worksheet for every night.
Browser print supports paper or Save as PDF. Course work
does not alter SAT/ACT progress or infer a student's mastery from printing.
Student practice leaves response space unruled, with a thin border around each
problem and its workspace. Graph grids and tables required by the question stay
visible. The space can be used for calculation, a diagram, or a written explanation.
Printing directly from the Courses page prints the selected study guide;
use the packet controls for homework.

After making practice, choose the night and worksheet, then use **Print nightly packet**.
It combines that choice's study guide, student worksheet, and worked answers in
one document, in that order. **Nights to include** can instead include all nights,
each with its own guide/worksheets/answers. The guide includes only lessons that
appear in that night's actual questions, in course order. Review nights can
repeat a lesson's instruction; exercises remain distinct within the generated
packet, including across A/B/C alternatives. Combined packets intentionally include answers, so set those sheets
aside before giving the work to the learner. Separate student-only exports
remain available.

**Double-sided** layout is the default. Measured pages and explicit separator
backs make every component, including the next night's guide, begin on an odd
document page—a fresh physical sheet. Print the whole document on Letter paper
at 100% scale, one page per side, with browser headers/footers off and double-sided
long-edge binding selected in the print dialog. Keep separator backs in the job.
The site cannot set the printer's duplex option. **Single-sided** layout omits
separator backs and starts each component on a new page; choose single-sided
printing for that version. **Download packet HTML** saves the same complete,
static document for offline printing. Changing lessons, quantities, or seed
requires building a fresh packet before exporting again.

The CLI creates the same rendered documents and can write PDFs using an
installed Chromium and ChromeDriver:

```sh
node tools/course-packet.js --course grade-8-math --unit topic-1 \
  --count 20 --days 10 --seed home-1 --out .scratch/print/home-1 --pdf
node tools/course-packet.js --unit topic-1 --count 20 --days 3 \
  --seed home-mixed --worksheets B,C,A --combined --pdf --out .scratch/print/mixed
node tools/course-packet.js --help
```

Add `--combined` to also write `nightly-packet.html` and, with `--pdf`, its PDF.
This uses the same nightly layout and double-sided separation as the web
interface. Add `--single-sided` with `--combined` to omit separator backs.
`--worksheets B` selects B for every night; `--worksheets B,C,A` selects one
letter per night and must match `--days`. The default is A for every night.
All three alternatives are generated before selecting exports. The manifest
records the selected letters, seeds, and form codes for replay.

No browser packages are installed by the tool. Generated outputs belong in
`.scratch/` when used in an agent workspace; download or copy printouts to a
durable personal location before workspace cleanup.

## Data and extension

`content/courses/catalog.json` lists course IDs, grades (0 for kindergarten,
1–12 thereafter), subjects, titles, and course filenames. Each course declares
its ID, version, scope and source alignment, then units and lessons. A lesson
has a stable ID, objective, explanation paragraphs, at least two worked
examples (`prompt`, `answer`, `steps`), pitfalls, and practice advice. Example
`table` and `graph` fields are givens. `solutionTable` and `solutionGraph` are
worked material: the interactive reader puts these inside the answer reveal,
while the printable guide includes the complete worked example. The first
course also carries factual textbook page and standards references. These do
not make new material official publisher content or a standards certification.

`src/lib/courses/` contains pure generators and selection logic. The `math.js`
helper supplies seeded randomness and reduced exact fractions; classroom
changes do not touch SAT family helpers or their review fingerprints. A
template declares `id`, `lessonId`, `skill`, and `generate(rng)`. It returns
plain-text `prompt`, `answer`, ordered `steps`, and `workLines`, with optional
structured table, student graph, or answer-only graph. The renderer typesets
exponents, fractions, and radicals using the existing math renderer. Repeating
decimal strings use `0.[27]` or `2.1[6]`; brackets become an overline in print.
No content field is interpreted as HTML.
The legacy `workLines` field controls the amount of open workspace; it does not
request visible ruling.

Add a course manifest, its original guides, a pure generator module, and a
registration in `templatesForCourse`; load the module on `courses.html` and in
the CLI. Grade and subject selectors derive from available catalog entries.
Do not advertise empty grades/subjects as available courses. More courses can
have different units and lessons without changing the SAT/ACT catalog.

The build validates lesson coverage and generates `dist/content/courses.js`.
Its course revision hashes authored content and classroom generator sources.
Packet replay requires the same seed, lesson selection, problem count, night
count, revision, and worksheet letter for each night. Printed worksheet codes identify matching copies; they
are not standalone replay instructions. Keep a downloaded packet when exact
future reproduction matters, since old generator revisions are not bundled.

`generatePacketChoices` returns nights with three full worksheets each;
`selectPacketWorksheets` projects one existing worksheet and key per night
without regenerating questions. Generation balances selected lessons and cycles
each lesson's designs across nights, sharing that sequence among alternatives.
Every design supplies a `practiceKey` derived from its
mathematical task and givens. It ignores cosmetic changes such as a renamed
variable or reordered unordered relation; it must not depend on the answer
alone. Both these keys and exact visible identities are checked within and
across all alternatives and nights, so mixed selections also stay distinct.
The builder refuses a request when its bounded search cannot
find enough distinct items, with advice to reduce the count/nights or add
lessons. It never fills the gap with repeats or silently replaces an exhausted
design with a sibling. A packet too short to cover all selected lessons shows
a coverage note based on the selected worksheets, not all three alternatives.
Three alternatives require three times the selected number of distinct items.
Topic-sized mixes support the 10-night, 20-question preset; some individual
lessons exhaust their finite design pools at that size. Choose fewer nights or
questions, or include more lessons, when the builder reports this limit.

This is an explicit per-design identity contract, not a proof of all possible
algebraic equivalences between designs. Separate packets do not share browser
exposure history. Replaying a seed intentionally reproduces the same items.
New seeds vary numbers and presentations, not necessarily the
underlying mathematical design. No claim of unlimited independent question
designs or empirical difficulty calibration is made.

## Verification

```sh
node tools/check-courses.js
node tools/check-courses.js --reps 3000
node --test 'test/course*.test.js'
node tools/check-all.js
```

The generation gate checks data shape, complete lesson coverage, valid graph
scales, distinct-item selection, and reproducibility. Mathematical property
tests independently recompute displayed quantities or substitute answers back
into equations. Independent agents solve displayed samples before seeing
keys, then inspect explanations; review reports under `docs/reviews/` record
their actual scope and source hashes. Neither sampling nor automated checks
establish human editorial approval or measured student difficulty.

The initial release's [integration and print review](reviews/2026-10-06-grade8-integration.md)
is a historical baseline. The [cold-review follow-up](reviews/2026-10-06-grade8-cold-followup.md)
records its subsequently discovered defects, corrections, renewed math review,
and final browser/print verification.

After generator changes, renew the affected mathematical tests and independent
sample review. After renderer changes, inspect actual student and key PDFs:
page breaks, handwriting space, small exponents, repeating bars, tables,
coordinate labels, answer-only plots, and answer exclusion. Test the Courses
controls, fresh/replayed packets, downloads, keyboard navigation, dark mode,
and phone width. Run the repository-wide gate before committing changes.

Combined-packet changes additionally require real PDF verification of odd/even
component boundaries, night/form labels, selected-night versus all-night scope,
and single-sided output. The pure page-plan tests check that no physical sheet
is shared by different components; browser pagination must also be checked.
The [nightly packet review](reviews/2026-10-06-grade8-nightly-packets.md)
records the web print integration, cold reviews, and verification limits.
The [worksheet-choice review](reviews/2026-10-06-grade8-worksheet-choices.md)
checks three full alternatives, mixed per-night selection, matching keys,
repeat exclusion, browser controls, and real PDF output.
