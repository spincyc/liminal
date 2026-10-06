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

Open **Courses** from the main navigation. Select the course, lessons, problems
per night, nights, and packet seed. Topic 1 is selected initially. Start with
the guide's worked examples, try a worksheet independently, then mark it with
the separate worked answer key. Use a later packet to revisit missed skills.
Problem counts are configurable; a packet is a supply of practice, not a
requirement to finish every page in one sitting.

Student worksheets, study guides, and worked answers are separate printable
documents. Student downloads contain neither solution data nor hidden answer
graphs. The student and key copies carry matching worksheet identifiers and
question numbers. Browser print supports paper or Save as PDF. Course work
does not alter SAT/ACT progress or infer a student's mastery from printing.
Printing directly from the Courses page prints the selected study guide;
use the separate student or answer print buttons for homework packets.

The CLI creates the same rendered documents and can write PDFs using an
installed Chromium and ChromeDriver:

```sh
node tools/course-packet.js --course grade-8-math --unit topic-1 \
  --count 20 --days 10 --seed home-1 --out .scratch/print/home-1 --pdf
node tools/course-packet.js --help
```

No browser packages are installed by the tool. Generated outputs belong in
`.scratch/` when used in an agent workspace; download or copy printouts to a
durable personal location before workspace cleanup.

## Data and extension

`content/courses/catalog.json` lists course IDs, grades (0 for kindergarten,
1–12 thereafter), subjects, titles, and course filenames. Each course declares
its ID, version, scope and source alignment, then units and lessons. A lesson
has a stable ID, objective, explanation paragraphs, at least two worked
examples (`prompt`, `answer`, `steps`), pitfalls, and practice advice. The first
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

Add a course manifest, its original guides, a pure generator module, and a
registration in `templatesForCourse`; load the module on `courses.html` and in
the CLI. Grade and subject selectors derive from available catalog entries.
Do not advertise empty grades/subjects as available courses. More courses can
have different units and lessons without changing the SAT/ACT catalog.

The build validates lesson coverage and generates `dist/content/courses.js`.
Its course revision hashes authored content and classroom generator sources.
Packet replay requires the same seed, lesson selection, problem count, night
count, and revision. Printed worksheet codes identify matching copies; they
are not standalone replay instructions. Keep a downloaded packet when exact
future reproduction matters, since old generator revisions are not bundled.

Generation balances selected lessons and cycles question designs. It rejects
identical visible items within a sheet and tries to avoid items from earlier
nights in the same packet. Finite pools can repeat across nights; exhaustion
produces an explicit warning. Separate packets do not share browser exposure
history. New seeds vary numbers and presentations, not necessarily the
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
links the independent mathematical reviews and records the tested settings.

After generator changes, renew the affected mathematical tests and independent
sample review. After renderer changes, inspect actual student and key PDFs:
page breaks, handwriting space, small exponents, repeating bars, tables,
coordinate labels, answer-only plots, and answer exclusion. Test the Courses
controls, fresh/replayed packets, downloads, keyboard navigation, dark mode,
and phone width. Run the repository-wide gate before committing changes.
