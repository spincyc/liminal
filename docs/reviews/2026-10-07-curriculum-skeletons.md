# K–12 skeletons: source, cold review, and integration

## Delivered scope

The year-plan library contains 39 original 36-week skeletons, separated from
the existing ready-to-study lesson catalog:

| Track | Year plans | Units | Indexed references |
| --- | ---: | ---: | ---: |
| Common Core mathematics | 13 | 78 | 393 |
| Common Core reading | 13 | 78 | 337 |
| Singapore mathematics | 13 | 104 | 72 |

Mathematics and Reading lead the landing page. The plan browser supports
pathway/grade/unit links, previous and next years, a subjects-together view,
source-to-unit lookup, monochrome printing, and a complete JSON download.
Existing Grade 8 lessons and SAT/ACT practice retain their separate entry points.
The [curriculum documentation](../curriculum.md) owns the schema and scope policy.

## Sources and review method

Separate author agents produced each track using primary sources. Separate
cold reviewer agents then read the completed skeletons and compared them with
the standards or syllabus tables. Authors repaired findings; reviewers checked
the changed records again. These are independent agent reviews, not approval
by a human educator, empirical pacing validation, or a standards certification.

Common Core reviewers independently reconstructed the expected inventories
against the official [Mathematics PDF](https://corestandards.org/wp-content/uploads/2023/09/Math_Standards1.pdf)
and [ELA PDF](https://corestandards.org/wp-content/uploads/2023/09/ELA_Standards1.pdf).
Math has 229 K–8 numbered standards, 156 high-school numbered standards, and
eight practices. Reading has 99 RL, 110 RI, 68 RF parent/subskill, 30 RH, and
30 RST records. No missing, extra, or duplicate IDs were found under those
declared grouping policies. Every K–8 math standard is mapped in its own
grade, and each reading plan maps its applicable grade/bands. Core high-school
math expectations appear by the end of the suggested Grade 11 sequence;
Grade 12 is optional advanced study. Mixed core/(+) parent codes retain their
subpart qualifications.

The Singapore reviewer read all 13 plans and the source tables for NEL,
Primary, G3 Mathematics, G3 Additional Mathematics, and H2. Primary placements
use the 2021 syllabus updated October 2025. Secondary and H2 divisions keep
their actual level/band names; their US grade correspondence and within-band
year allocations are editorial. Current primary-source URLs and printed-page
locators are in the track JSON. The author downloaded the official PDFs;
reviewer requests encountered MOE's JavaScript challenge, so the reviewer
used those downloaded official PDFs/text for the four PDF sources and the
live NEL page for preschool goals. This limitation does not establish a
fresh independent retrieval of every PDF.

## Findings and corrections

| Review lane | Findings repaired and rechecked |
| --- | --- |
| `math_cold_review` | Explicit root, step and absolute-value graphs; function intersections; even/odd functions; arithmetic combinations of models; Grade 2 number-line arithmetic; Grade 3 multiples-of-ten multiplication; Grade 4 generated patterns, prime/composite classification, and tenths-plus-hundredths addition; precise Grade 1 equality language; Grade 6 magnitude-based distances; the Grade 8 similarity prerequisite for slope; optional logarithmic inverses and matrices representing data. |
| `reading_cold_review` | Explicit kindergarten rhyme production and syllable operations; Grade 1 story/information-book explanation; Grade 9–10 historical source dates/origins; Grade 11–12 accurate simplified technical paraphrases; correct mapping of technical categories/hierarchies to the unit that teaches them. |
| `singapore_cold_review` | Secondary 1 significant figures/estimation; primary framework locator; corrected Primary 1 “mixed number” wording; explicit H2 mean-test cases; grouped-data means; three-dimensional trigonometry. |
| `code_cold_review` | Skip-to-content preserves the selected route; admission rejects missing/numeric IDs, malformed source URLs, and invalid dates. Independent code checks found no remaining substantive issue after repair. |

Initial architecture inspection confirmed that outlines should not enter the
course generator catalog: its schema requires actual lessons and generators.
The coordinator also made picker changes preserve keyboard focus and gave
every unit a shareable route. Invalid routes announce their recovery.

Each curriculum reviewer closed the listed findings after targeted re-review.
The final reviewed source hashes are:

| File under `content/curriculum/` | SHA-256 |
| --- | --- |
| `common-core-math.json` | `8613aea09339990b4e397fe4f53d6d82be5491b0dba364957f84519c497c1ebe` |
| `common-core-reading.json` | `c2b87c6d7c756b9635f88eca7807e28cd2aa57ad04986e64e63e673d81a8843d` |
| `singapore-math.json` | `d8ca71db765739b1902d168dce9dd216eb53239372fd511b6e5dcd5c6776219b` |

## Verification

The curriculum unit tests cover all 39 routes, every unit permalink,
continuous weeks 1–36, adjacent grades, peer subjects, source lookup, invalid
route recovery, and malformed-content rejection. Build admission validates
every required field and internal reference. Static smoke checks pin script
order, local assets, and parity between browser data and downloaded JSON.
These checks establish structural consistency; the source reviews above
address inventory and planned learning encounters.

Chromium 153 verification exercised all 39 year routes at desktop width,
unit links and reloads, skip navigation, grade selection, Back/Forward,
three-subject comparison, invalid routes, and the existing Grade 8 reader.
At 390px, the plan and home pages had no horizontal overflow; light and dark
screenshots were inspected. Print verification expanded unit/source details,
restored disclosure state, and generated a 12-page Grade 8 plan on Letter
paper with background graphics disabled. Text extraction and a rendered unit
page confirmed readable goals, activities, evidence, bridges, and references.
This samples one real printed plan; it does not establish identical pagination
for every grade or printer.

The full repository gate passed: 718 tests, zero failures or skips, plus all
content, build, template, and static-site checks. It ran through
`node tools/check-all.js`, the documented equivalent of `npm run check`, because
npm is unavailable in this environment. `git diff --check` also passed.
Build output and browser/print artifacts are transient and are not committed.

## Remaining limits

These skeletons do not supply a complete set of readings, daily lessons,
worksheets, assessments, accommodations, or intervention sequences. The
Grade 12 advanced math survey and parts of high-school geometry are broad;
local readiness and scheduling govern their pace. Reading plans require
legally available, appropriately complex texts and coordination with subject
teachers for disciplinary reading. Alignment at outline level does not prove
instructional quality, effective pacing, or student mastery. Standards labels
are short summaries; the official sources govern the complete expectations.
