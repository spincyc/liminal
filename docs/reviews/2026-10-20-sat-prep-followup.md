# SAT Math preparation follow-up

Date: 2026-10-20. This supersedes the unresolved teaching and workflow gaps
in [the first transfer revision](2026-10-20-sat-transfer-teaching.md).

## What the domain report supports

The reported pattern supports a Math-first rebuild with Geometry and
Trigonometry introduced early, continued work across the other Math domains,
and Reading and Writing maintenance. It does not establish which individual
skills, misconceptions or pacing problems caused the score. The materials
therefore teach competing methods and use independent practice to expose
more specific gaps, rather than assigning topic mastery from domain bands.

## Changes in the ordinary practice flow

Fresh Math plans open Algebra and Geometry together. Track B alternates
Geometry with Advanced Math instead of postponing all geometry until after
the Advanced Math skills. The topical stages remain available for diagnostic
placement. An `orderFrom` checkpoint preserves a returning student's current
flight, budget and historical replay while applying the new order to future
openings. Full and trimmed histories, reloads, imports and other-tab changes
were checked independently.

Broad SAT recommendations prioritize Math while a Math turn remains;
explicit Reading and Writing selections still work. Practice and Progress
keep the current lesson available after drills and during other next steps.
The visible Learn, then check region connects teaching with continuing
practice and retains Reading and Writing maintenance links.

The fresh 12-question check draws from existing generated designs: six
Geometry questions and two each from Algebra, Advanced Math and data, half
Easy and half Medium. It uses distinct designs and visible questions within
the check, shared serve history and fresh seeds, with feedback at the end
and no timer. The normal shell withholds hints in end-feedback mode. Missing
or exhausted pools report shortfall/reuse; a shortened check still replays
exactly from its code. The focus is a learning mix, not a test-module
blueprint or scaled-score estimate. Checks use the normal saved-set slot,
replacement confirmation, resume, attempt recording, review and lesson links.
They do not spend a skill's drill budget.

## Teaching and visual presentation

Four additional lessons add five worked contrasts and 13 unhinted exercises:
linear functions distinguish rate, starting amount and requested value;
nonlinear functions distinguish roots, extreme outputs, their inputs and
fixed versus compounded change; data teaches weighting through totals;
percentages identify the reference amount before calculating.

Nine original SVG drawings replace prose-only graph instruction with actual
unequal axis scales, open and filled endpoints, observations versus model
predictions and time series. The geometry lesson includes a triangle showing
base, sloping side and perpendicular height. Accessible descriptions carry
the plotted data without derived answers. Drawings render from validated
data through the shared SVG allowlist and DOM nodes, with no trusted HTML
or external assets. Phone, dark-mode and printed figures were inspected.

The Learn figure construct is a standalone `{{figure:id}}` block, also
usable inside examples, problems, hints and answers. Its data registry is
`content/learn/figures.json`. Undefined references, executable or unsupported
SVG, duplicate attributes and invalid explicit viewports fail validation.
Printed questions retain their figures; opened answers still print only in
the collected key.

The `system-intersection-region` template now requires two substantive
coordinate restrictions rather than an often-redundant quadrant condition.
Numeric questions count integers in the resulting open parameter interval;
MC distractors test either restriction alone. The obsolete Desmos route was
removed because it described the replaced sign/least/greatest variant.
All ten templates sharing the changed source file received renewed
independent sampled review and conservative version bumps; the nine siblings
retain their previous output behavior.

## Independent review and verification

- [Content review](2026-10-20-sat-teaching-review.md): all 13 foundation
  exercises and eight unique visual prompts independently solved before
  keys; five worked examples and all nine drawings inspected. A claim about
  steepness and total change was corrected to distinguish equal and unequal
  time intervals.
- [Template review](2026-10-20-sat-region-review.md): 39 blind solutions
  across all ten fingerprint-affected families agreed with their keys.
  The changed family's strict bounds and both-condition demand were checked
  over 6,000 draws and all 16 presentation/condition combinations.
- [Runtime review](2026-10-20-sat-runtime-review.md): 356 focused tests plus
  independent probes covering 1,500 legacy-plan comparisons, 96 cross-tab
  migration comparisons and 500 sequential transfer runs. Missing replay-code
  persistence, a figure-validation loophole and within-check visible
  duplication were found, fixed and independently retested.
- Full repository gate: `node tools/check-all.js`, the documented npm-free
  equivalent, passed all 1,025 tests, content and review admission, build,
  static smoke checks and Learn links. The full `--reps 3000` template pass
  also passed: 218 Math and 163 Reading and Writing templates, each with
  3,000 integer and 3,000 runtime-shaped seeds (2,286,000 draws).
- Chromium/ChromeDriver: 24 rendered states at 1280px and 320px in light and
  dark themes; no page overflow, clipped SVG labels or browser errors.
  Keyboard Enter launched the real transfer check. A response survived Save
  and exit, reload and resume. Finishing recorded all 12 attempts, preserved
  the replay code in the report and storage, and cleared the saved-set slot.
  SAT-only controls stayed hidden for ACT.
- Three actual PDFs retained plotted figures and separate answer keys with
  screen controls omitted. Graph and geometry pages were visually sampled;
  unopened and opened answers followed the same print contract.

## Evidence limits

The changes address the missing early geometry, continuing independent
practice, visible lesson route and visual instruction. They do not establish
a score gain or empirically calibrate the generated questions. Unfamiliar
official questions and a later official test remain necessary checks of
transfer. The design uses worked-example/problem alternation and combined
graphical/verbal explanations, consistent with the
[IES practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1); that guide
does not evaluate this site or predict an individual student's SAT outcome.
