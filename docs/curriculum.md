# K–12 year plans

`curriculum.html` contains 39 original course outlines: Common Core mathematics,
Common Core reading, and a Singapore mathematics pathway, each from kindergarten
through Grade 12. Each outlines 36 teaching weeks, including review and checks.
These are curriculum skeletons, not complete courses or a certification of
standards coverage. Task ideas describe work to author; they are not supplied
assignments. Reading selections, daily instruction, differentiation, complete
assessments, and most practice materials remain to be developed and reviewed.

The landing page leads with Mathematics and Reading. Each subject links to its
year plans; a separate entry identifies the ready-to-study Grade 8 lessons.
`courses.html` remains the lesson reader and worksheet builder. Its current
four-topic scope is described in [classroom courses](classroom-courses.md).
Planning records never enter its course catalog, practice generators, or
SAT/ACT progress records. The home page still loads only its legacy-bookmark
redirect script.

## Reading a plan

Choose a pathway and grade, or **Compare subjects** to see a grade's reading
and alternative mathematics sequences. The initial view is a single compact
unit list. Units start closed; opening one shows its focus and learning goals,
with exact repeats of the focus removed from the displayed goals. Teaching
notes and standards open separately. The original data remains complete.
Within a plan:

- **About this year** holds prerequisites, outcomes, the year thread, and
  weekly routines.
- Each unit has an explicit week range, learning goals, original coursework
  ideas, observable evidence, a bridge forward, and source references.
- Previous/next year links, the full K–12 pathway, and the grade comparison
  make movement across years and subjects explicit.
- **Standards and sources** holds the reference index, showing the units that map each cited expectation and
  links back to the issuing organization's source document.

Daily reading and mathematics continue in parallel; shared contexts should
reinforce their distinct goals. The two math pathways are alternatives, not
two simultaneous required math courses. Week counts are suggested allocations,
not official calendars or a reason to advance before a learner is ready.

Stable deep links use `curriculum.html#<track>/<grade>[/<unit>]`, where the
tracks are `common-core-math`, `common-core-reading`, and `singapore-math`,
and the grade is `k` or `1`–`12`. For example,
`curriculum.html#common-core-math/8/u1`. A grade comparison is
`curriculum.html#grade/8`. Unknown pathways, grades, and units recover with
an explanatory status message. Browser Back and Forward preserve routes.
Each unit offers a shareable link.

**Print plan** expands all unit and source disclosures for printing,
then restores their screen state. Print uses dark ink and visible rules with
background graphics off. The downloadable `content/curriculum.json` contains
the same full planning data and references as the browser; it is not a progress
file or a collection of ready-to-assign worksheets.

## Source and scope policy

Canonical sources, editions, retrieval dates, and locators live with each
track in `content/curriculum/`. Follow their URLs for the full official wording.
The repository stores short planning labels and original instructional
sequences, not copies of official documents or commercial curricula.
Reference counts are counts of this index's records, not comparable counts of
official standards across systems; grouping policies differ by track.

Common Core mathematics has grade-specific K–8 expectations and high-school
domains. The high-school sequence is Liminal's suggested course arrangement,
not an official assignment to Grades 9–12. Mathematical Practices recur across
units. Numbered standards can group their lettered subparts; optional (+)
expectations and optional subparts are identified in the source labels.

Common Core reading includes literature, informational text, foundational
skills through Grade 5, and disciplinary reading in Grades 6–12. High school
uses 9–10 and 11–12 bands; the two year plans revisit and deepen the shared
expectations. Writing and discussion support reading, but this is not a full
ELA writing/language/speaking-and-listening curriculum. Literature's standard
8 is not applicable and is not invented. Early independent decoding and
teacher read-aloud comprehension have different text demands.

The Singapore pathway uses official MOE sources, not a commercial series.
Kindergarten is a numeracy bridge; the primary, secondary, and pre-university
levels retain their source names. US grade labels are editorial navigation,
not age, placement, or qualification equivalences. The selected secondary and
pre-university route is only one of Singapore's pathways. Source notes state
its G3, Additional Mathematics, and H2 scope and prerequisites. Singapore
reference IDs are local indexing aids, not invented official standard codes.

## Data and build

Each `content/curriculum/<track>.json` has:

| Field | Meaning |
| --- | --- |
| `version` | Positive format version; currently 1 |
| `track` | Stable ID, title, subject, description, scope note |
| `sources` | IDs, official URLs, publishers, editions, checked dates, notes |
| `standards` | Reference ID, concise label, source ID, source locator, grade band, kind (`content`, `practice`, `extension`) |
| `courses` | Thirteen grade records, grade 0 for kindergarten |

A course has a stable `id`, `grade`, `title`, source `levelLabel`, `scopeNote`,
`prerequisites`, `outcomes`, `routines`, `yearBridge`, `crossSubject`, `nextStep`,
and ordered `units`. A unit has a stable `id`, `title`, positive integer
`weeks`, `focus`, arrays of `learning`, `standards`, `activities`, `evidence`,
and a `bridge`. Content is plain text; the presentation creates DOM nodes and
never trusts it as HTML. Keep IDs stable when editing titles.

`src/lib/curriculum.js` owns pure routing, pacing, adjacency, and reference
mapping. `src/app/curriculum.js` renders those results. The builder validates
all three tracks, every grade, 36-week totals, duplicate identifiers, required
teaching fields, source links, and reference resolution. Every indexed
reference must appear in at least one unit. That structural check does not
prove that the unit's activities teach the cited expectation; independent
content review must check that meaning and compare the inventory with sources.

`tools/build-curriculum.js` emits `dist/content/curriculum.js` and the matching
downloadable JSON during the normal site build. No external requests, account,
runtime dependencies, or browser storage are needed to view the plans.

## Verification and review

```sh
node tools/build-curriculum.js
node --test test/curriculum.test.js
npm run check
git diff --check
```

The normal gate includes curriculum build validation, local asset and script
order checks, downloadable/bundled data parity, continuous pacing, valid
adjacent grades, deep links, and negative admission cases. Check the actual
browser at phone and desktop sizes, with keyboard navigation, dark mode,
Back/Forward, invalid routes, comparison, standards disclosures, and printing.
Content edits also need a cold review against primary sources, with actual
scope and unresolved limits recorded under `docs/reviews/`.
The [initial source and cold-review report](reviews/2026-10-07-curriculum-skeletons.md)
records coverage, corrected findings, and browser/print verification limits.
