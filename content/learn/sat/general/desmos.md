---
id: sat/general/desmos
title: Desmos
---
# Desmos

Bluebook has the Desmos graphing calculator built in, and you may use it on
every Math question. Used well, it turns many algebra problems into
graph-reading problems and removes most sign errors. Used for the first time
on test day, it wastes minutes. Practice with the free version at
[desmos.com/calculator](https://www.desmos.com/calculator), then try the one
inside Bluebook's practice tools so nothing surprises you.

The keys you need: `^` for exponents, `/` for fractions (the arrow keys move
you out of an exponent or a denominator), `sqrt` for √, and `abs` or `|`
for absolute value. Each line of the list on the left is its own object; the
colored circle turns it on and off. Clicking a curve labels its key points
and intersections with coordinates.

## Solve an equation by graphing {#solve-by-graphing}

Any equation "left side = right side" can be solved by graphing each side
and reading where they cross.

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
You don't need to solve for y first. Click the intersection. Parallel lines
mean no solution; one line drawn on top of the other means infinitely many.

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
> identical, so check the excluded values separately.

## Tables {#tables}

Choose "table" from the + menu, type x-values, and add a column for any
function you have defined, such as `f(x)`. Tables are good for checking a
model at several inputs, comparing two expressions, and deciding whether
data are linear (constant differences) or exponential (constant ratios).

## Statistics {#statistics}

Store a list and ask for what you need:

```
L=[3,7,7,9,14]
mean(L)      median(L)      stdev(L)      quartile(L,1)
```

That handles most one-variable data questions mechanically. See
[one-variable data](learn:sat-math/problem-solving-and-data-analysis/one-variable-data).

## Regressions {#regressions}

Put data in a table (columns x₁ and y₁), then type a model with `~`:
`y_1~mx_1+b` for a line, `y_1~ax_1^2+bx_1+c` for a quadratic, `y_1~ab^{x_1}`
for an exponential. Desmos reports the constants. Use it when a question
gives data and asks about the model's slope, intercept or a prediction.

## Inequalities {#inequalities}

Type inequalities directly, for example `y>2x-3` and `y<=-x+5`. Desmos
shades each one; where the shadings overlap, both hold. Type a point such as
`(3,1)` to see where it falls. Dashed boundaries are not included.

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
from the grid and check your completing-the-square work.

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

## A one-week practice plan {#practice-protocol}

Twenty minutes a day at desmos.com/calculator:

1. Typing only: exponents, fractions, roots, absolute values, subscripts.
2. Graph ten equations and click every intercept and vertex.
3. Solve ten systems by graphing.
4. Sliders on ten "what value of k" questions.
5. Tables and equivalence checks.
6. Statistics on lists and one regression.
7. Twenty mixed practice questions, using Desmos even where it is slower, to learn where it isn't worth it.

After that week, note in each practice set which questions you did by hand
that would have been faster graphed, and the reverse.
