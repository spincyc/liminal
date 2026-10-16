---
id: sat/general/desmos
title: Desmos
---
# Desmos

Bluebook has the Desmos graphing calculator built in, and you may use it on
every Math question. Used well, it turns many algebra problems into
graph-reading problems and can help check sign errors. Used for the first time
on test day, it wastes minutes. Practice with the free version at
[desmos.com/calculator](https://www.desmos.com/calculator), then try the one
inside Bluebook's practice tools so nothing surprises you.

Liminal has no calculator of its own. For a Math set, open
[desmos.com/calculator](https://www.desmos.com/calculator) yourself in
another window and put it side by side with the practice window, so the
question stays in view as it does on test day. After you answer a question
whose type has a Desmos route, its explanation adds one: what to type, what
to read, and when the route fails. See [the practice plan](#practice-protocol).

Start with [Reading graphs](learn:sat/general/reading-graphs) if you need to
separate input from output, slope from intercept, or an endpoint from the
edge of the viewing window. Decide what the answer represents before reading
a calculator coordinate.

The keys you need: `^` for exponents, `/` for fractions (the arrow keys move
you out of an exponent or a denominator), `sqrt` for √, and `abs` or `|`
for absolute value. Each line of the list on the left is its own object; the
colored circle turns it on and off. Clicking a curve shows its key points
and its crossings with other curves as gray dots; click a dot to see its
coordinates.

> **Trap.** Desmos keeps typing inside a fraction's bottom, an exponent or a
> root until you press →. Type `y=x/4-2` and Desmos draws y = x/(4 − 2),
> which is the line y = x/2, so the crossing you click is wrong. Type
> `y=x/4`, press →, then type `-2`. Brackets don't end a fraction:
> `y=(x+3)/4+2` still puts the + 2 under the 4. After `^`, a single number
> ends at the next + or −, so `x^2+3x` is safe, but `x^2(x+4)` puts the
> (x + 4) in the exponent; after `sqrt(`, everything stays under the root.
> Type numbers without commas: Desmos reads `1,050` as two numbers and shows
> an error. Look at what Desmos drew before you trust a crossing.

## Solve an equation by graphing {#solve-by-graphing}

For many equations in one real variable, graph each side of
"left side = right side" and inspect where they cross. The graph suggests
solutions; check them in the original equation.

> **Example.** Solve 2x² − 5x − 1 = 3x − 4.
>
> Type `y=2x^2-5x-1` and `y=3x-4`, then click both intersections: about
> (0.419, −2.743) and (3.581, 6.743). The solutions are x ≈ 0.42 and
> x ≈ 3.58.
>
> Or move everything to one side, `y=2x^2-8x+3`, and click the two
> x-intercepts; they are the same x-values.

This works for equations that are hard by hand: radicals, absolute values,
exponentials, fractions.

> **Fails when.** The choices are exact values (2 ± √10/2, a fraction) and
> Desmos shows decimals. Convert each choice to a decimal to match, and
> don't round too early. It also fails when an intersection is off screen:
> zoom out before deciding there are only one or two.

## Systems {#systems}

Type both equations exactly as given, for example `3x+2y=16` and `5x-2y=8`.
You don't need to solve for y first. Click the intersection. Distinct parallel
lines mean no solution.

> **Fails when.** Lines look as if they overlap. Nearly parallel lines can
> look identical at one zoom, so check algebraically: only equations
> describing the same line have infinitely many solutions. A system with a
> letter such as a or k needs a slider (next section) or algebra.

## Sliders for "what value of k" {#sliders}

Type an equation with a letter other than x or y, such as `y=x^2+kx+9`, and
choose "add slider" for k. Drag the slider and watch the graph change.

> **Example.** For what values of k does y = x² + kx + 9 touch the x-axis at
> exactly one point?
>
> With the slider, the parabola just touches the x-axis at k = 6 and at
> k = −6. The slider shows there are two values, which is the trap in this
> question type.
>
> Confirm with the discriminant: k² − 36 = 0, so k = ±6.

> **Fails when.** The answer isn't a value the slider lands on. A slider
> moves in steps, so a value like k = 2√3 ≈ 3.464 can't be hit exactly, and
> near the answer the graph can look like it touches when it misses by a
> hair. Use the slider to find roughly where the answer is, then confirm
> with algebra.

## Equivalent expressions {#equivalence}

Graph the original expression and a choice. Equivalent expressions draw the
same curve: toggle one off and on to see whether the other is hiding under
it. A table (next section) gives the same check with numbers.

> **Fails when.** Two expressions differ only at a single point, such as a
> value excluded from a rational expression's domain. The graphs look
> identical, so check the excluded values separately. Similar curves can also
> overlap at the current zoom; a few matching points or a visible window do
> not prove an identity. Use algebra to confirm equivalence.

## Tables {#tables}

Choose "table" from the + menu, type x-values, and add a column for any
function you have defined, such as `f(x)`. Tables are good for checking a
model at several inputs, comparing two expressions, and deciding whether
data are linear (constant differences) or exponential (constant ratios),
when the x-values are equally spaced.

> **Fails when.** The x-values are not equally spaced: then compare
> differences per unit of x, not row to row. Matching at sampled inputs alone
> does not prove that two expressions are equivalent.

## Statistics {#statistics}

Store a list and ask for what you need:

```
L=[3,7,7,9,14]
mean(L)      median(L)      stdev(L)      quartile(L,1)
```

Use `stdev` for sample standard deviation and `stdevp` for population standard
deviation; choose the definition the question needs. These tools calculate
summaries but do not replace interpreting the data. See
[one-variable data](learn:sat-math/problem-solving-and-data-analysis/one-variable-data).

> **Fails when.** The data come as a frequency table or a dot plot: a list
> of the distinct values gives the wrong mean and median. Weight them, as in
> `total(V*F)/total(F)` for the mean with values V and counts F, or count to
> the middle by hand for the median. A question about how a change moves
> the mean or median is often faster to reason out.

## Regressions {#regressions}

Put data in a table (columns x₁ and y₁), then type a model with `~`:
`y1~mx1+b` for a line, `y1~ax1^2+bx1+c` for a quadratic, `y1~ab^x1` for an
exponential. Type y1 and x1 as a letter and a digit: Desmos makes them y₁
and x₁ itself, and typing `_` yourself breaks the `~`. Desmos reports the
constants, and later lines can use them: `a*b^7` uses the full values, not
the rounded ones shown. Use it when a question gives data and asks about the
model's slope, intercept or a prediction.

> **Fails when.** The points come from a scatterplot you read by eye: the
> fit is only as good as your readings, so check it against the line drawn.
> A question about the line of best fit shown asks about that line, not one
> you compute. Rounded data give rounded constants; match them to the
> nearest choice.

## Inequalities {#inequalities}

Type inequalities directly, for example `y>2x-3` and `y<=-x+5`. Desmos
shades each one; where the shadings overlap, both hold. Type a point such as
`(3,1)` to see where it falls. Dashed boundaries are not included.

> **Fails when.** A point sits on a boundary line: from the picture alone
> you can't tell whether it counts. Substitute it, and read < or ≤ in the
> inequality itself. Overlapping shades are also hard to see; turn off one
> inequality at a time.

## Vertices, zeros and intercepts {#key-points}

Click a curve and Desmos marks its vertex, its x-intercepts, its
y-intercept and its intersections with other curves. This replaces
completing the square or −b/(2a) when the question asks for the value
directly.

> **Fails when.** The question asks which form of an equation shows the
> vertex, or asks for an expression in terms of a constant. Those are about
> algebraic structure, and a graph of one case doesn't answer them.

## Circles {#circles}

Type a circle equation as given, even expanded, for example
`x^2+y^2+8x-6y=0`. Desmos draws it, so you can read the center and radius
from the grid and check your completing-the-square work. To test a point,
type it too and see whether it falls inside, on, or outside the circle.

> **Fails when.** The center or radius is not a whole number, such as a
> radius of √13: the grid can only suggest it, so complete the square. A
> point very close to the circle needs substituting, not a look.

## When not to use it {#when-not-to-use}

| Situation | Why |
| --- | --- |
| one-step arithmetic or algebra | typing takes longer than thinking |
| answers written in terms of other letters | there is nothing to graph |
| interpretation questions ("what does 45 represent") | it is reading, not computing |
| you already see the method | just do it |

Reach for Desmos when a question has an equation with numbers and asks for a
specific value. Skip it when the question is about meaning or form.

> **Fails when.** The value is exact and the graph gives a decimal you then
> have to match (see [solving by graphing](#solve-by-graphing)), the
> equation has a letter you can't give a number to, or the curves meet off
> screen or so nearly touch that you can't tell one point from two. Then
> finish by hand, and use the graph only to check.

> **Trap.** Desmos starts in radians. For a trigonometry question in
> degrees, switch the angle mode in the settings (the wrench icon), or
> sin 30 will give about −0.99 instead of 0.5.

## Practising with the Desmos drill {#practice-protocol}

Liminal's [Desmos drill](practice.html#desmos/sat-math) is a set drawn only
from SAT Math question types that have a Desmos route, weighted toward the
skills where Desmos solves the question rather than only checks it, with
feedback after each question. Next step offers it when you have not done one
in a week, until you have done four; after that, about every two weeks. You
can start one from that link at any time. Keep desmos.com/calculator open
in its own window beside the practice window.

Before your first drill, spend ten minutes at
[desmos.com/calculator](https://www.desmos.com/calculator) on the keys:
type `y=x/4`, press →, then `-2`, and see how the line differs from the one
you get without →; graph two lines and click their crossing; add a slider;
put three points in a table and fit a line.

For every drill question, decide your route before you type: what you will
graph, and what you will read. After you check your answer, compare your
route with the Desmos route shown under the explanation, and read its "When
it fails" line. Between drills, read one part of this page at a time:

1. Before the first drill: [solving by graphing](#solve-by-graphing) and [systems](#systems).
2. Before the second: [sliders](#sliders) and [key points](#key-points).
3. Before the third: [tables](#tables), [statistics](#statistics) and [regressions](#regressions).
4. Before the fourth: [inequalities](#inequalities) and [circles](#circles). Do this drill at the real test's pace, about a minute and a half a question.

After the first four, keep the habit in every Math set: read the Desmos route
under each explanation, including on questions you got right by hand, and
note which questions you did by hand that would have been faster graphed,
and the reverse.

> **Fails when.** You practise only the drill. It draws only questions that
> have a Desmos route, so it makes Desmos look more useful than it is on a
> real test, where many questions are about meaning or form (see
> [when not to use it](#when-not-to-use)). Mixed sets are the correction. A
> route is a starting point, not a guarantee: its "When it fails" line names
> the cases it misses.
