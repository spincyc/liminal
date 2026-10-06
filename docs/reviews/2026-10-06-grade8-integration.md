# Grade 8 course integration review — 2026-10-06

Historical baseline at `8c79a1d`. A later cold review found defects missed by
this pass, including semantic repetition and oversized graph-legend radicals.
See the [cold-review follow-up](2026-10-06-grade8-cold-followup.md) for corrections
and current verification; the hashes and page counts below describe the old
artifacts.

Scope: the supplied volume's four topics and 36 lessons. Course revision
`5ac28bdd81ef7278` contains 72 original worked examples and 85 parameterized
exercise designs. Topic 1 was aligned with the supplied review pages; the other
topics were aligned with the supplied contents. This does not establish
publisher-specific method fidelity for unscanned lessons or coverage of later
volumes.

## Mathematical review

Independent agents solved displayed samples before opening their keys, then
reviewed explanations and graph data. Their reports state exact seed rules,
source fingerprints, findings, corrections, and sampling limits:

- [All 72 guide examples and lesson prose](2026-10-06-grade8-guides.md).
- [Topic 1, first group](2026-10-06-grade8-topic1a.md).
- [Topic 1, second group](2026-10-06-grade8-topic1b.md).
- [Topic 2](2026-10-06-grade8-topic2.md).
- [Topics 3 and 4](2026-10-06-grade8-topics3-4.md).

The coordinator checked that every final guide/generator/helper fingerprint
appears in the accepted reports. No blocking mathematical findings remain.
Sampling and agent review are not human editorial approval or measured
student difficulty.

## Automated and browser checks

- `node tools/check-all.js`: the complete repository gate, including 679
  passing tests, content checks, build, and static smoke checks. This is the
  same command as `npm run check`; npm was unavailable in this environment.
- `node tools/check-courses.js --reps 3000`: 255,000 generated draws across
  85 designs, full lesson coverage, and a distinct 200-question default packet.
- Mathematical property tests independently recompute displayed quantities,
  substitute solutions, check special cases, and compare Node/browser output.
- Actual Chromium interaction: default 10-night packet, 36 lesson controls,
  selection/empty state, keyboard activation, fresh/replayed packets, worker
  cancellation, and previews. No course storage writes or browser errors.
- All-course print views: 36 student questions with zero solution nodes,
  36 matching worked answers, and 36 guides with 72 examples. Exported HTML
  has no scripts, iframes, or other active content. Student/key form codes match.
- A 390-pixel viewport in dark mode has no horizontal page overflow; printable
  documents retain black text on white. Dedicated print views and downloads
  remain separate from SAT/ACT sessions.
- Direct browser printing, while the answer preview is enabled, contains only
  the selected guides. It opens the collapsed guide for printing and restores
  that state afterward. This corrected an integration-review finding.

## Physical PDF checks

Reproduce the delivered packets with an installed Chromium/ChromeDriver pair:

```sh
node tools/course-packet.js --unit topic-1 --count 20 --days 10 \
  --seed home-2026-10-06 --out .scratch/print/topic-1-practice --pdf
node tools/course-packet.js --unit all --count 36 --days 1 \
  --seed volume-review-2026-10-06 --out .scratch/print/volume-study-guide --pdf
```

| Document | Letter pages | Content |
| --- | ---: | --- |
| Full-volume guide | 39 | 36 lessons, 72 examples |
| Topic 1 student packet | 41 | 200 questions over 10 nights |
| Topic 1 worked key | 57 | 200 matching answers and explanations |
| Full-volume mixed worksheet | 15 | One question from every lesson |
| Full-volume mixed key | 16 | 36 matching answers and explanations |

Every physical student page has its night/page header; no headerless question
continuations or footer-only pages were found. Rendered samples were inspected
for handwriting room, graph placement, exponents, roots, repeating bars,
tables, and readable worked steps. The final student files contain no answer
nodes or hidden solution graphs. All ten Topic 1 sheets generated without
repeat warnings.

Pagination measures typeset rows before assigning page numbers. Dense later
topic questions can require two questions per page; typical Topic 1 pages
hold four to six. Counts depend on the seed, paper settings, and browser.
This verification used Chromium and Letter paper, not every browser/printer.
Renderer consumers must load the course styles before rendering for measured
pagination. Owned test browser/server processes were stopped after checks.

Replay still requires matching source revision and all recorded settings;
form codes alone are insufficient. Question pools are finite, and different
packets do not share an exposure history. Raw scans and generated printouts
stay outside the repository; only original content, generators, tests, and
review records are committed.
