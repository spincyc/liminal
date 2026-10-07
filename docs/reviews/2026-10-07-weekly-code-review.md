# Weekly coursework: independent code review

Reviewer: `code_cold_review`. Date: 2026-10-07. Status: **no outstanding substantive code findings in the reviewed snapshot**. This review covers implementation and structural tests, not educational-content approval.

## Scope and evidence

Read the authoring contract, weekly builder, pure routing/projection library, reader, renderer, page, styles, tests, build/smoke integration, and home/course/year-plan entry links. Inspected exact bounded routes and fallback behavior, course identity checks, lazy loading, stale-request guards, keyboard focus behavior, source URL admission, text rendering, student/teacher separation, print rules, and duplicate identities.

`/usr/bin/node --test test/weekly*.test.js | tail` passed **13 tests, 0 failures** after the repairs below. The suite exercises negative schema cases, routing, references, duplicate tasks, source provenance, allowlisted student projections, serialized exports, separated reading views, passage navigation, course qualifications, and fixture builds. Those fixture builds use test scratch directories and remove their temporary outputs; this reviewer did not rebuild `dist/`, start a server, commit, or push. Syntax checks and `git diff --check` also passed.

The reader's request counter prevents stale requests from replacing the current content or error state. Student exports are built from an explicit projection and a separate document: selected prompts and assigned passages remain, while answers, reasoning, guided examples, unassigned passages, and added teacher fields are excluded. Tests inspect serialized HTML, including escaped markup. Native page printing hides teacher keys; separate key exports intentionally include them. Actual browser interaction, print pagination, popup behavior, and mobile layout remain coordinator checks.

Rechecked the compact mobile revision: short grade/week selects, 16px control text, and lazily built Learn/Read/Worksheets tabpanels. Static review covered roles, roving selection, arrow/Home/End handling, and passage links opening Read before targeting text. An additional in-memory harness executed the actual `views()` function with minimal DOM objects: lazy builds, End/ArrowLeft focus changes, native-print passage reveal/restoration, and fallback to Learn when a subsequent week has no passages passed. This checks orchestration, not browser accessibility or layout. Course qualifications are present in both the reader and standalone exports.

## Finding and closure

**P3: reordered passage references bypassed exact duplicate detection.** Identical prompts with the same two passage texts but reversed `passageIds` produced different task identities, even though worksheet passage bodies follow canonical passage order. The engine author now sorts normalized resolved passage texts before forming the identity. Independently inspected the change and reran the regression that rejects `['left', 'right']` versus `['right', 'left']` for an otherwise identical task. Finding closed.

**Native printing after the tab redesign omitted referenced passages.** Lazy hidden Read panels initially stayed absent when printing Learn or Worksheets through the browser. The UI author added `beforeprint` preparation that builds/reveals Read without changing the selected tab, then restores its hidden state after printing. Existing print rules continue to hide answer keys. Inspected and exercised the corrected orchestration; finding closed at code level, with actual print pagination remaining a browser check.

**Coordinator-reported inequality admission false positive: closure verified.** The original broad angle-bracket matcher rejected valid comparisons such as `For 0<x<1, x^2<x; for x>1, x^2>x.` The revised authoring check recognizes syntactically shaped markup, while its regression cases accept those comparisons and continue rejecting representative tags, event attributes, and comments. Escaped/text-node rendering remains the security boundary; this heuristic is not an HTML sanitizer.

An initially suspected encoded-fragment defect was withdrawn after checking the [HTML fragment-selection algorithm](https://html.spec.whatwg.org/multipage/browsing-the-web.html#select-the-indicated-part): it attempts raw-ID matching before percent-decoded matching. The existing export anchors therefore have a valid native target. No repair was required on that evidence.

Home and existing-course pages now link to weekly coursework. Year plans load the lightweight index and route library, offer a start link when that course exists, and connect each unit to its indexed weeks. Full course JSON stays lazy-loaded on the weekly page.

## Limits

The builder intentionally admits an incomplete library while authors work: it validates each available course, not the final count of 39 courses. The new read-only `tools/check-weekly.js --complete` gate separately compares every expected pathway/grade pair; inspected that logic, but final delivery must run it once all courses are present. Course bodies were still being authored during this review; this report does not certify their answers, reading rights, age suitability, standards coverage, or semantic variety.

Duplicate admission compares normalized prompts and resolved passage text. It catches exact repeats across worksheets, examples, and weeks; it does not prove that paraphrases or numerical variants are meaningfully different tasks. Provenance admission checks source syntax and required attribution signals, not historical truth or public-domain status. Structural standards checks resolve references within the planned unit; they do not establish complete instruction or official-source completeness. Independent content review remains necessary.

## Reviewed SHA-256 snapshot

```text
801798a631121ffcdd8086df5e95951fa351bb1b973b03790b20842809a65289  tools/build-weekly.js
6eb6eb09d8336300259d25fc987d4f7ba8eff8e048a254414471f74e7faaa5ae  src/lib/weekly.js
54464dbdf27fdc879e80f68b4469ed357f55f3b36d3a5d337a4733c9e3638fd6  src/app/weekly.js
940576977c9f69b938f4244200e85d00ff5a392eb399883c8ca4b0344d95354d  src/app/weekly-render.js
d941134528839c2435354b1f357ab865450fdfdd804d3d0f0cb7760212e24330  src/weeks.html
e509a94f7462767261b6851ad94094776a01139bee617321fdb0a8475fe17b5d  src/styles/weekly.css
484c03a933c6ba94ac1a10709d2ccbadbf8f2273453f9d88d57f8bccd7538636  test/weekly.test.js
f8b131c6958692af2da6f9f5fe9cc99cc81317e5eaed577fcad5269f0a07f547  test/weekly-ui.test.js
b0b82ec8372f360362bf81fec6acb35c7ee095be170f86b13bf1bb748137ecf0  tools/build.js
5fc724f07b37664310585c9efe1c85dc8943ff532aec4bf0ff34cacd00cae33e  tools/smoke-static.js
3e9fe5b2cdfd0c1137fc265790a429d7f25a18c296e93d935f02afd7085d4417  src/app/curriculum.js
c0501f9c1ae6b76ce76627bb9669fb635a4f9459abe61c60ceacefd7f27bacce  src/curriculum.html
c911336fe2e8429dedc066c2121df91fe76467c2d5380a236ee5ab35bf4aecf9  src/index.html
62a526f138d802fad08020314913d9b6cfa57ca46a72841cf53f18fd2b1d71aa  src/courses.html
71ad829116207a732760009dc80c39f3d047bad624c44a810243ad0bc7b5f8ed  docs/weekly-coursework.md
55566c252bc611ef0711ecb479ff15332672634e8cf130e2bbe77ab1f3062996  tools/check-weekly.js
```
