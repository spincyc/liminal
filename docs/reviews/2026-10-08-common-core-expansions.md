# Common Core grade expansions — 2026-10-08

The requested correction is structural: Grade 8 mathematics is a detailed
expansion of that grade's Common Core pathway, not a separate course offering.
Equivalent expansions for other grades will be added to the same structure.
This change reorganizes the existing material; it does not author new grades
or claim full Grade 8 coverage.

## Repository and page organization

- Canonical content is `content/lesson-modules/<track>/<grade>/`, registered in
  its shared catalog. The current entry is `common-core-math/8`, retaining
  `grade-8-math` as its stable legacy ID. Topic mappings connect the four
  expanded topics to parent year-plan units u1–u4. Canonical parent standard
  IDs are validated; the supplied book's detailed IDs remain in
  `sourceStandards`.
- Pure generators are in `src/lib/lesson-modules/`, with explicit per-grade
  registration. The engine no longer contains a Grade 8 lookup branch. The
  builder validates parent identity, unit/standard references, dependency
  order, worked instruction, design coverage, and practice expectations.
- `lessons.html#common-core-math/8[/<lesson>]` names the parent pathway and
  grade, shows the four-topic limitation, and links to the same grade's plan
  and weekly work. Homepage, navigation, plan-unit, and weekly links use the
  published availability index. Explicit unauthored grades remain on their
  requested grade and explain that expanded lessons are unavailable.
- The small index supplies metadata; lesson JSON and generator sources load
  only for the selected module. Synthetic Grade 2 and Grade 7 test fixtures
  exercise adding another grade through metadata and registration. These are
  test fixtures, not published curriculum.
- Legacy `courses.html?lesson=2-1` and course-ID URLs redirect with the lesson
  preserved. The former build/check/packet commands remain compatibility
  wrappers. Canonical packet selection is `tools/lesson-packet.js --track
  common-core-math --grade 8`; the old `--course grade-8-math` still works.

The authoring and extension contract is [Grade lesson expansions](../lesson-modules.md).

## Preservation and review

All 36 lessons, 72 worked examples, readiness checks, bridge tasks, expectations,
and 85 exercise designs remain. A pre-migration snapshot compared 3,400 direct
design draws and 960 packet questions across both practice modes and all four
topics; the mathematical exercises and answers match. Shared math is
byte-identical, and the generator bodies change only their relative imports.
Revision-bound form identifiers change because module metadata and source
paths are part of the fingerprint. The durable parity digest is in
`test/lesson-modules.test.js`.

An independent cold review checked architecture, metadata-only content changes,
loader behavior, grade routing, legacy compatibility, and focused regressions.
It found a Back-to-base-route bug and an omitted renamed-reader script-order
check. Both were fixed and regression-checked; no blockers remained at review
completion. Readiness/bridge requirements were also clarified for future authors.

## Verification

- `node tools/check-all.js` passed, including validation, fresh build, static
  smoke, and all 909 tests. The deeper generator check passed 255,000 draws.
- Real Chromium verified the legacy lesson redirect; lazy loading and worker
  generation; 8-question A/B/C alternatives and B selection; Back/Forward;
  parent plan and week 7 links to topic 2; omission on Grade 7 and Singapore
  pages; an explicit unavailable Grade 7 route; and homepage grouping. The
  browser reported no severe console errors. A 320px dark-mode page had no
  horizontal overflow and native Tab navigation reached the next disclosure.
- The CLI exported offline HTML and real PDFs for lessons 1-1 and 2-1, one night,
  four questions per alternative, all A/B/C, seed `module-migration`, with a
  combined packet. Student sheets contained no active scripts or answer/key
  nodes. PDF text confirmed matching A/B/C form codes and visible grade labels;
  replay metadata included the pathway and grade. Student-page layout was
  visually inspected. The combined 35-page PDF kept all guide, worksheet, and
  answer components on odd starting pages with separator backs as needed.

This is a reorganization and compatibility review, not a new pedagogical
validation of every exercise or a claim that the four topics cover the full
grade. Earlier Grade 8 mathematical, editorial, and print reviews remain the
content baseline.
