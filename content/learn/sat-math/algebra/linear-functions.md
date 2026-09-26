---
id: sat-math/algebra/linear-functions
title: Linear functions
section: sat-math
domain: Algebra
skill: Linear functions
---
# Linear functions

A linear function changes by the same amount every time its input goes up
by one. Written f(x) = mx + b, the slope m is that constant change and b is
the output when x = 0. Linear functions are part of Algebra, which is
{{fact:sat-math-algebra}} of the Math section. Easy questions ask you to read
a slope or evaluate f(3). Hard ones give the function as a table, a graph or
a sentence and make you build the rule yourself before answering.

## Slope {#slope}

Slope is rise over run between any two points:

```
m = (y₂ − y₁) / (x₂ − x₁)
```

Keep the order the same on top and bottom. In a context, slope is "change in
output per one unit of input", with units: dollars per ticket, meters per
second.

| Lines | Slopes |
| --- | --- |
| Parallel | equal: m₁ = m₂ |
| Perpendicular | negative reciprocals: m₁ · m₂ = −1 |
| Horizontal, y = c | 0 |
| Vertical, x = c | undefined |

> **Example.** A line passes through (−2, 7) and (4, −2). What is its slope?
>
> Rise: −2 − 7 = −9. Run: 4 − (−2) = 6.
>
> m = −9/6 = −3/2. The line falls 3 units for every 2 units to the right.

> **Example.** What is the slope of a line perpendicular to 3x + 4y = 12?
>
> Solve for y: 4y = −3x + 12, so y = −(3/4)x + 3. The slope is −3/4.
>
> Take the negative reciprocal: flip to −4/3, then change the sign: 4/3.
>
> Check: (−3/4) · (4/3) = −1.

> **Trap.** 3/4 is the slope you get if you change the sign but forget to
> flip the fraction; −4/3 is what you get if you flip but forget to change
> the sign. Both are always among the choices.

From a table, use any two rows, then confirm with a third. If x = 1, 3, 7
gives f(x) = 5, 11, 23, the slope is (11 − 5)/(3 − 1) = 3, and
(23 − 11)/(7 − 3) = 3 confirms the table is linear.

## Intercepts {#intercepts}

- The y-intercept is f(0): set x = 0. In f(x) = mx + b it is b.
- The x-intercept is where f(x) = 0: set the output to 0 and solve.
- In standard form Ax + By = C, the x-intercept is C/A and the y-intercept is C/B.

> **Example.** A phone's battery is at 85% and drops 5 percentage points per
> hour of video. Its charge is f(t) = 85 − 5t after t hours. What do the two
> intercepts mean?
>
> f(0) = 85: the charge when the video starts.
>
> Set f(t) = 0: 85 − 5t = 0, so t = 17. The battery is empty after 17 hours
> of video.
>
> The slope −5 is the change in charge per hour: it falls 5 points each hour.

> **Example.** Find both intercepts of 2x − 5y = 20.
>
> x-intercept: set y = 0, so 2x = 20 and x = 10. The point is (10, 0).
>
> y-intercept: set x = 0, so −5y = 20 and y = −4. The point is (0, −4).

A fast first look at a graph-matching question is to check the sign of the
slope (rising or falling) and the sign of the y-intercept (above or below the
origin). That often removes two choices.

> **Fails when.** Two choices share both signs, or the axes use different
> scales, so a steep-looking line has a small slope. Then compare an exact
> point: find where each candidate crosses an axis and check it against the
> graph's labeled values.

## Function notation {#function-notation}

f(3) means "the output when the input is 3". The statement f(2) = 11 is the
point (2, 11) on the graph. Two kinds of question:

- Given an input, find the output: substitute.
- Given an output, find the input: set the rule equal to that output and solve.

> **Example.** For g(x) = 4 − 2x, find g(−3), then find the x with
> g(x) = −6.
>
> g(−3) = 4 − 2(−3) = 4 + 6 = 10.
>
> Set 4 − 2x = −6: subtract 4 to get −2x = −10, so x = 5.

> **Example.** A linear function f has f(2) = 11 and f(6) = 23. What is
> f(10)?
>
> Slope: (23 − 11)/(6 − 2) = 12/4 = 3.
>
> Use a point to find b: 11 = 3(2) + b, so b = 5 and f(x) = 3x + 5.
>
> f(10) = 3(10) + 5 = 35.

> **Trap.** Reading f(2) = 11 as the point (11, 2). The input always comes
> first.

### A rule that holds for every x {#identity}

Some questions give a relation such as f(x + 3) = f(x) + 12 or
f(2x) = 2f(x) + 5 and say it is true for all x. Write f(x) = mx + b, work
out both sides, and match them term by term: the x-terms must agree and the
constants must agree.

- Shifting the input, f(x + h), adds mh to the output, so the relation fixes the slope: f(x + 3) = f(x) + 12 means 3m = 12.
- Scaling the input, f(kx), leaves the constant b alone, so the relation fixes the intercept instead.

> **Example.** For a linear function f, f(2x) = 2f(x) + 5 for all x, and
> f(3) = 1. What is f(−1)?
>
> Left side: f(2x) = 2mx + b. Right side: 2(mx + b) + 5 = 2mx + 2b + 5.
>
> The x-terms already agree, so the constants must: b = 2b + 5, which gives
> b = −5.
>
> From f(3) = 1: 3m − 5 = 1, so m = 2 and f(x) = 2x − 5.
>
> f(−1) = −2 − 5 = −7. Check the relation at x = 1: f(2) = −1, and
> 2f(1) + 5 = 2(−3) + 5 = −1.

> **Trap.** Reading the 5 in the relation as the y-intercept. The relation
> says b = 2b + 5, so b is −5, and it says nothing about the slope, which
> comes from the one given value.

> **Fails when.** The relation holds for one value of x only, such as
> "f(2) = 2f(1) + 5". That is a single equation, not an identity, and you
> can't match terms; use it together with the other facts as one equation.

### Functions built from another function {#built-from-f}

When g is defined from f, as in g(x) = f(x − 4) + 1 or g(x) = a · f(x) − 3,
a fact about g is a fact about f at some input. Work in this order:

1. Get f's rule, or read the value you need from its table or graph.
2. For a value of g, find the input f actually receives, then apply the outside change.
3. For a constant in g, write the given point of g as an equation about f, undo the outside change first, then solve.

| Change | What happens to the line |
| --- | --- |
| f(x) + c | moves up c; slope unchanged |
| a · f(x) | every output times a, so the slope and the y-intercept are both times a |
| f(x − h) | moves right h (inside changes go the opposite way from the sign) |
| f(kx) | slope times k, sign included |

> **Example.** The graph of the linear function f passes through (1, 5) and
> (3, 1). The function g is defined by g(x) = f(x − k), where k is a
> constant, and the graph of g passes through (6, 3). What is k?
>
> From the graph: f has slope (1 − 5)/(3 − 1) = −2, so f(x) = −2x + 7.
>
> g(6) = 3 means f(6 − k) = 3. Solve −2(6 − k) + 7 = 3: −12 + 2k + 7 = 3,
> so 2k = 8 and k = 4.
>
> Check: f(2) = 3, and moving the graph 4 right carries (2, 3) to (6, 3).

> **Example.** For the linear function f, f(1) = 2 and f(4) = 11. The
> function g is defined by g(x) = f(−2x) + 1. What is the slope of g?
>
> f has slope (11 − 2)/(4 − 1) = 3, so f(x) = 3x − 1.
>
> g(x) = 3(−2x) − 1 + 1 = −6x, so the slope is −6. The slope of f times the
> factor −2.

> **Trap.** Using f's own slope, or dropping the sign of the factor inside
> f. A factor inside f multiplies the slope, sign and all.

## What Hard looks like {#hard}

Hard questions in this skill give you only part of the function and make you
build the rule first:

- A relation that is true for all x, such as f(4x) = 4f(x) + 6 or f(x + 2) = f(x) − 10, plus one value. Match terms to get one coefficient, and let the value give the other (see [a rule that holds for every x](#identity)).
- A function g built from a graphed f, as in g(x) = a · f(x) + 2 or g(x) = f(x + k) − 3, with a point on g. Undo the outside change, read f off the graph, then solve for the constant (see [functions built from another function](#built-from-f)).
- A table whose inputs are unevenly spaced and whose outputs include a letter, such as f(2) = a, f(4) = 2a, f(9) = 18. Each change in f(x) is the slope times its own gap in x, so write that for both pairs of rows and solve for the letter.

> **Example.** For the linear function f, f(−2) = a, f(1) = 3a and
> f(3) = 26, where a is a constant. What is f(0)?
>
> From x = −2 to x = 1 the gap in x is 3 and the change is 3a − a = 2a, so
> the slope is 2a/3.
>
> From x = 1 to x = 3 the gap is 2, so the change 26 − 3a is 2 times the
> slope: 26 − 3a = 4a/3. Multiply by 3: 78 − 9a = 4a, so a = 6.
>
> The slope is 2(6)/3 = 4 and f(1) = 18, so f(0) = 18 − 4 = 14. Check:
> f(x) = 4x + 14 gives f(−2) = 6 and f(3) = 26.

> **Trap.** Treating the rows as equally spaced, or assuming f(x) = kx
> because the outputs are a and 3a. Neither is given; only the slope is
> the same everywhere.
