# Liminal graphic design review

Reviewed 2026-10-07 at `27922a075d950f4b9c47d0d563ee61fae1d5f0f3`.

Liminal has a promising visual foundation for a K–12 learning library: warm
paper, dark green ink, editorial typography, and an open doorway. Its strongest
direction is a place where young people do work they can be proud of. The next
design pass should extend that identity through the learning screens, make
useful information easier to read, and show the quality of thinking and written
work students can aspire to produce.

This is a review and design proposal. It does not implement the recommendations
or establish that the current product saves study time or improves handwriting.

## Governing design requirements

The project owner's brief establishes these requirements for future work:

- Grow toward a full K–12 educational practice site and corpus. The present
  inventory remains narrower and must be described honestly.
- Express youth as a valuable time of becoming. Focused study and lasting
  mastery should leave children and families more room to enjoy that time.
- Welcome younger learners while preserving older learners' sense of belonging,
  including when they revisit foundational material.
- Make the visual environment aspirational for younger learners. Model care,
  precision, and pride in work through examples of well-presented handwritten
  solutions and other finished work.

The specific palette, wording, navigation, and exemplar treatments below are
recommendations. They have not yet been adopted as a design system. The concern
that childish presentation lowers work standards is a design hypothesis;
observing learners would be needed to establish that effect.

## Findings in priority order

### Lesson graphs lose essential contrast in dark mode

**P1, confirmed defect.** In Grade 8 lesson 4-1, Understand Scatter Plots,
the graph's points, axes, and labels remain `#111` against an example surface
of `#1b2b27`. Their contrast is approximately **1.28:1**. The `#444` caption
is approximately **1.52:1**. The grid remains visible while the information
needed to interpret it becomes difficult to see.

The source is [courses.css](../../src/styles/courses.css), lines 238–249:
graph colors are hard-coded independently of the dark palette at lines 265–280.
Reproduce by selecting lesson 4-1 with a dark system appearance and inspecting
Worked example 1. Use semantic screen colors or an explicitly light diagram
surface, and retain separate ink-on-white export styles. Normal text needs
4.5:1 contrast; essential graphical objects need 3:1. See W3C's
[text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [graphical contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

The light “Start here” panel at line 224 remains readable in dark lessons, but
its abrupt white surface is a smaller visual-consistency issue.

### The identity changes across the learning experience

**High design priority.** Home presents an arch, a light serif wordmark,
cream surfaces, green ink, and restrained rectangular buttons. Courses keeps
much of that palette but changes the wordmark. Practice, Learn, Progress, and
Booklets switch to a small bold sans-serif brand, blue pill buttons, gray
backgrounds, and nested rounded cards.

Evidence: [home.css](../../src/styles/home.css), lines 3–17 and 32–34;
[courses.css](../../src/styles/courses.css), lines 2–23;
[tokens.css](../../src/styles/tokens.css), lines 9–39 and 54–64;
[app.css](../../src/styles/app.css), lines 149–157 and 303 onward.

The transition makes the library and its tools feel separately designed.
Establish one wordmark, navigation hierarchy, type scale, and family of controls
for the outer product. Carry the warm reading language into SAT Learn and
practice setup. An active test can retain its deliberately sparse task layout;
its concentration and readable mathematics are strengths.

### Practical information is visually subordinate

**High design priority.** The homepage headline reaches 68px while topic lists,
feature lists, and scope notes use about 11px. Intermediate-width card labels
reach 9px. On phone widths the three principles use 10px, and course topics and
metadata use 11px. These values come from [home.css](../../src/styles/home.css),
lines 40–43, 94–107, 163, 187, and 238–239.

The issue is the hierarchy between a large promise and small information needed
to choose. Use approximately 16–18px for core reading and 13–14px for supporting
functional labels as initial design targets; allow more space and wrapping.
These are proposed type sizes, not WCAG minimum font sizes. The sampled home
muted-text color has adequate contrast against its paper background; making
all secondary text darker would not address the size problem by itself.

On a 390px-wide capture, the homepage's first screen is almost entirely the
hero and illustration. The course's first screen is mostly introduction,
selection, tabs, and lesson framing. The first actual task begins near its
bottom. Bring a clear learning destination forward on Home and compress
repeated course framing once a lesson is chosen. Preserve the helpful mobile
collapse of the lesson picker.

### Quality of written work is described more than demonstrated

**High strategic priority.** Worked examples currently present typeset prose
steps and answers. They explain the method but do not consistently model the
page a student might produce. The homepage's paper preview is a decorative
sheet with a generic graph and promotional text.

Evidence: [course-render.js](../../src/app/course-render.js), lines 145–160;
[index.html](../../src/index.html), lines 107–111. In lesson 1-1, for example,
the explanation narrates long division without showing the complete spatial
arrangement of the division and its repeating remainder.

Add carefully authored, mathematically checked handwritten exemplars alongside
the explanations. Use an actual readable excerpt in the homepage paper section.
The exemplar should communicate the standard through its own composition:

- One meaningful step per line; aligned equations or place values.
- Clearly distinguished digits, variables, signs, and fraction bars.
- Labeled diagrams, consistent scales, units, and a clearly identified answer.
- Brief annotations explaining a choice and a final check where useful.
- Occasional deliberate corrections showing how revision can remain legible.

For lesson 1-1, show the division bracket, aligned subtraction, brought-down
zeros, and the repeated remainder that justifies the recurring decimal. For a
linear equation, show aligned equal signs and the same operation on both sides.
Later subjects can model a labeled scientific drawing or a revised paragraph.

Use attainable, readable handwriting with some human variation. Keep normal
interface text typeset, provide an equivalent accessible explanation, and make
the exemplar large enough to inspect. A script font applied to every paragraph
would not teach the spatial organization of work.

The student-facing standard can be **“Make your thinking easy to follow.”**
That supports penmanship and organization while allowing typed work and other
accessible ways to communicate. Mathematical understanding and beautiful
handwriting must remain distinct judgments.

### The current entrance needs a structure that can grow

**Before corpus expansion.** The Grade 8, SAT, and ACT cards describe today's
inventory accurately. Repeating that arrangement across grades and subjects
would turn the entrance into a long catalog. The generic “Review” and “Your
progress” links also lead specifically to test-prep tools, which may suggest
broader course support than exists.

Evidence: [index.html](../../src/index.html), lines 75–103 and 118–121;
[courses.html](../../src/courses.html), lines 50–57.

Use a stable subject/topic library with grade filters and a distinct test-prep
destination. Show the available inventory. Give returning learners a direct
route back to their work when that capability exists. Keep grade alignment
visible as curriculum information, while letting an older learner revisit a
foundational topic without entering a younger-looking environment.

Within study pages, separate the immediate learner action from packet
management. “Try it yourself” currently leads into choices about approaches,
nights, worksheet counts, and A/B/C alternatives. A short practice action can
lead visually; printing and assignment controls can remain available in a
secondary area. Keep necessary explanations next to the decisions they inform.

## Visual direction across ages

The shared identity should suggest a well-made book and a thoughtful working
space. Keep the arch, ivory paper, deep green ink, serif display headings, and
clear sans-serif reading text. Use restrained accent colors to distinguish
subjects and actions, without assigning prestige or maturity to particular
colors. Let instructional drawings and finished work supply much of the visual
interest within lessons.

Younger learners can receive shorter instructions, larger controls, concrete
examples, more guidance, and more working space within the same identity.
Older learners can receive denser navigation and more independent work.
Difficulty and support should adapt to the task; visual dignity should remain
constant. Friendliness can come from specific encouragement and helpful
examples, with a clear place to begin and a reasonable point to finish.

The present tone sometimes repeats “a little” and soft promotional phrases.
Use direct, respectful instructions where students need to act: “Try this
example,” “Show your reasoning,” or “Check your work.” The invitation is to
careful, achievable work.

## Proposed brand language

**Homepage headline**

> Learn well. Make room for life.

**Supporting copy**

> Clear lessons and focused practice, designed to build lasting understanding
> and leave more room for curiosity, friendships, and time together.

Retain the concrete supporting line: “Free, original materials. No account
needed.” Describe the currently available courses and test practice nearby.

**Explanation of the name**

> Growing up is a time of becoming, full of discoveries worth making time for.
> Liminal is built on the belief that study should develop lasting understanding
> and leave room for the rest of life, so young people and their families can
> enjoy these years together.

This makes room for mastery as a means to confidence and independence. It avoids
turning childhood into a race toward adulthood or promising measured time
savings that the product has not established. Keep this fuller explanation on
an About surface; routine learning screens should use concrete language.

## Recommended next pass

1. Repair diagram contrast and inspect instructional figures in both themes.
2. Establish the shared brand, typography, controls, and navigation across Home,
   Courses, Learn, and practice setup. Increase small functional text.
3. Prototype one complete lesson with a handwritten exemplar, a clear immediate
   practice action, and secondary packet controls.
4. Exercise the same design with early-elementary, middle-school, and
   high-school material before expanding the whole corpus interface.
5. Observe representative learners and caregivers finding a lesson, following
   an exemplar, and producing their own work. Check clarity and belonging as
   well as visual preference. Do not assume improved penmanship from appearance
   alone.

## Review evidence and limits

The source was built successfully with `node tools/build.js`. Desktop Chromium
captures covered Home, Courses, the practice builder, SAT practice setup, an
active math question, Learn, empty Progress, and Booklets. Independent review
covered brand/information hierarchy and 390px-wide mobile captures of Home,
Courses, and SAT setup in light and dark appearances. The coordinator inspected
the principal screenshots and independently recalculated the graph contrast.
The two reviewers were agents, not human educators or research participants.

The deployed site and remote Git refs were unreachable from this environment;
findings concern the named local revision. Captures used file URLs and isolated
browser profiles. Scratch-only page fixtures selected UI states without changing
production files. Some scrolling captures showed compositor artifacts and were
discarded in favor of stationary full-height captures. Phone-size findings use
the final screenshot layout and source CSS; initial Chromium viewport metrics
were inconsistent with the final narrow capture.

This was a sampled visual review, not a complete accessibility audit, a new
mathematical content audit, physical-device testing, or a print-layout audit.
The source locations and reproduction steps above remain the durable evidence.
