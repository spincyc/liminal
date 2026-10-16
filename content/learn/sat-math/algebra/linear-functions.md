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
{{fact:sat-math-algebra}} of the Math section.

If graph axes or input/output readings are still uncertain, start with
[Reading graphs](learn:sat/general/reading-graphs#scales).

## Before you start {#before-you-start}

This page uses the slope between two points, the intercepts of
y = mx + b, and function notation. If a check below goes wrong, rebuild it
with [lesson 2-8, slope](lessons.html#common-core-math/8/2-8),
[lesson 2-11, y = mx + b](lessons.html#common-core-math/8/2-11) or
[Algebra, week 7: function notation](weeks.html#high-school-math/algebra/7).

> **Try it.** What is the slope of the line through (0, 6) and (4, −2)?
>
> **Answer.** −2
>
> The rise is −2 − 6 = −8 and the run is 4 − 0 = 4, so the slope is
> −8/4 = −2. Shaky? [Lesson 2-8](lessons.html#common-core-math/8/2-8).

> **Try it.** For y = 5 − 2x, what is y when x = 0, and what is x when
> y = 0?
>
> **Answer.** y = 5 when x = 0, and x = 5/2 when y = 0.
>
> x = 0 gives y = 5 − 0 = 5. y = 0 gives 0 = 5 − 2x, so 2x = 5 and
> x = 5/2. Shaky? [Lesson 2-10](lessons.html#common-core-math/8/2-10) and
> [lesson 2-11](lessons.html#common-core-math/8/2-11).

> **Try it.** If f(x) = 3x − 4, what is f(5)?
>
> **Answer.** 11
>
> Replace x with 5: f(5) = 3(5) − 4 = 15 − 4 = 11. Shaky?
> [Algebra, week 7](weeks.html#high-school-math/algebra/7).

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

> **Try it.** A line passes through (−4, −3) and (2, 1). What is its slope?
>
> **Answer.** 2/3
>
> Rise: 1 − (−3) = 4. Run: 2 − (−4) = 6.
>
> m = 4/6 = 2/3. The line rises 2 units for every 3 units to the right.

> **Example.** What is the slope of a line perpendicular to 3x + 4y = 12?
>
> Solve for y: 4y = −3x + 12, so y = −(3/4)x + 3. The slope is −3/4.
>
> Take the negative reciprocal: flip to −4/3, then change the sign: 4/3.
>
> Check: (−3/4) · (4/3) = −1.

> **Trap.** 3/4 is the slope you get if you change the sign but forget to
> flip the fraction; −4/3 is what you get if you flip but forget to change
> the sign. Both are common distractors.

> **Try it.** What is the slope of a line perpendicular to 5x − 2y = 8?
>
> **First step.** Solve for y: −2y = −5x + 8, so y = (5/2)x − 4. The slope
> is 5/2. Now finish.
>
> **Answer.** −2/5
>
> Take the negative reciprocal: flip to 2/5, then change the sign: −2/5.
>
> Check: (5/2) · (−2/5) = −1.

> **Try it.** Line k is defined by y = 3x − 7. Line j is perpendicular to
> line k and passes through (6, 1). What is the y-coordinate of the
> y-intercept of line j?
>
> **Answer.** 3
>
> Line k has slope 3, so line j has slope −1/3: y = −(1/3)x + b.
>
> Use (6, 1): 1 = −(1/3)(6) + b = −2 + b, so b = 3.

A line parallel to a given line has the same slope. Find that slope, then
use the point the new line passes through to find its intercept.

> **Example.** Line ℓ is defined by 2x + 3y = 12. Line m is parallel to ℓ
> and passes through (6, 1). What is the y-intercept of line m?
>
> Solve for y: 3y = −2x + 12, so ℓ has slope −2/3, and so does m.
>
> Line m: y = −(2/3)x + b. Use (6, 1): 1 = −4 + b, so b = 5. The
> y-intercept is (0, 5).
>
> The traps are 4, line ℓ's own intercept, and −8, from the perpendicular
> slope 3/2.

> **Try it.** Line ℓ passes through (−2, 7) and (4, −5). Line m is parallel
> to ℓ and passes through (3, 2). What is the y-intercept of line m?
>
> **Answer.** (0, 8)
>
> ℓ's slope: (−5 − 7)/(4 − (−2)) = −12/6 = −2, so m is y = −2x + b.
>
> Use (3, 2): 2 = −6 + b, so b = 8.

From a table, use any two rows, then confirm with a third. If x = 1, 3, 7
gives f(x) = 5, 11, 23, the slope is (11 − 5)/(3 − 1) = 3, and
(23 − 11)/(7 − 3) = 3 confirms the table is linear.

> **Try it.** The table shows three values of x and f(x) for a linear
> function f. What is the slope of the graph of y = f(x)?
>
> | x | f(x) |
> | --- | --- |
> | −2 | 9 |
> | 1 | 3 |
> | 7 | −9 |
>
> **Answer.** −2
>
> (3 − 9)/(1 − (−2)) = −6/3 = −2, and (−9 − 3)/(7 − 1) = −12/6 = −2
> confirms it.

### A table with a letter in it {#table-with-a-letter}

When an output is a letter and the inputs are unevenly spaced, each change
in f(x) is the slope times its own gap in x. Write that for two pairs of
rows and solve for the letter.

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

> **Try it.** The table shows three values of x and f(x) for a linear
> function f, where a is a constant. What is f(0)?
>
> | x | f(x) |
> | --- | --- |
> | −1 | a |
> | 3 | 2a |
> | 5 | 20 |
>
> **First step.** From x = −1 to x = 3 the gap is 4 and the change is
> 2a − a = a, so the slope is a/4. Now use the other pair of rows.
>
> **Answer.** 10
>
> From x = 3 to x = 5 the gap is 2, so 20 − 2a = 2(a/4) = a/2. Multiply
> by 2: 40 − 4a = a, so a = 8.
>
> The slope is 8/4 = 2 and f(3) = 16, so f(0) = 16 − 3(2) = 10. Check:
> f(x) = 2x + 10 gives f(−1) = 8 and f(5) = 20.

For a harder version, see
[a yearly change that is a percent of the start](#percent-of-the-start).

## Intercepts {#intercepts}

- The y-intercept is f(0): set x = 0. In f(x) = mx + b it is b.
- The x-intercept is where f(x) = 0: set the output to 0 and solve.
- In standard form Ax + By = C, the x-intercept is C/A when A ≠ 0, and the y-intercept is C/B when B ≠ 0.

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

> **Try it.** A gift card's balance is f(n) = 60 − 4n dollars after n
> coffees are bought with it. What do the two intercepts mean?
>
> **First step.** f(0) = 60: the balance before any coffee is bought. Now
> find and interpret the other intercept.
>
> **Answer.** (0, 60) is the starting balance, $60. (15, 0) means the card
> is empty after 15 coffees.
>
> Set f(n) = 0: 60 − 4n = 0, so n = 15.
>
> The slope −4 is the change in balance per coffee: each one costs $4.

> **Example.** Find both intercepts of 2x − 5y = 20.
>
> x-intercept: set y = 0, so 2x = 20 and x = 10. The point is (10, 0).
>
> y-intercept: set x = 0, so −5y = 20 and y = −4. The point is (0, −4).

> **Try it.** Find both intercepts of 3x + 4y = −24.
>
> **Answer.** (−8, 0) and (0, −6)
>
> x-intercept: set y = 0, so 3x = −24 and x = −8.
>
> y-intercept: set x = 0, so 4y = −24 and y = −6.

A fast first look at a graph-matching question is to check the sign of the
slope (rising or falling) and the sign of the y-intercept (above or below the
origin). That often removes two choices.

> **Fails when.** Two choices share both signs, or the axes use different
> scales, so a steep-looking line has a small slope. Then compare an exact
> point: find where each candidate crosses an axis and check it against the
> graph's labeled values.

For a harder version, see
[an x-intercept limited to one side](#intercept-on-one-side).

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

> **Try it.** For h(x) = 3x + 7, find h(−4), then find the x with
> h(x) = 25.
>
> **Answer.** h(−4) = −5, and h(x) = 25 when x = 6.
>
> h(−4) = 3(−4) + 7 = −12 + 7 = −5.
>
> Set 3x + 7 = 25: subtract 7 to get 3x = 18, so x = 6.

> **Example.** A linear function f has f(2) = 11 and f(6) = 23. What is
> f(10)?
>
> Slope: (23 − 11)/(6 − 2) = 12/4 = 3.
>
> Use a point to find b: 11 = 3(2) + b, so b = 5 and f(x) = 3x + 5.
>
> f(10) = 3(10) + 5 = 35.

> **Try it.** A linear function f has f(−1) = 8 and f(3) = −4. What is
> f(5)?
>
> **First step.** Slope: (−4 − 8)/(3 − (−1)) = −12/4 = −3. Now find b and
> f(5).
>
> **Answer.** −10
>
> Use a point to find b: 8 = −3(−1) + b, so b = 5 and f(x) = −3x + 5.
>
> f(5) = −3(5) + 5 = −10.

> **Trap.** Reading f(2) = 11 as the point (11, 2). The input always comes
> first.

> **Try it.** The function f is defined by f(x) = kx − 4, where k is a
> constant. If f(3) = 11, what is the value of f(−2)?
>
> **Answer.** −14
>
> f(3) = 11 means 3k − 4 = 11, so 3k = 15 and k = 5.
>
> f(−2) = 5(−2) − 4 = −14.

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

> **Try it.** The graph of the linear function f passes through (−1, 1)
> and (2, 7). The function g is defined by g(x) = a · f(x) − 3, where a is a
> constant, and the graph of g passes through (4, 30). What is a?
>
> **First step.** From the graph: f has slope (7 − 1)/(2 − (−1)) = 2, so
> f(x) = 2x + 3. Now write g(4) = 30 as an equation about f.
>
> **Answer.** a = 3
>
> g(4) = 30 means a · f(4) − 3 = 30. Undo the outside change first:
> a · f(4) = 33.
>
> f(4) = 2(4) + 3 = 11, so 11a = 33 and a = 3.
>
> Check: g(x) = 3(2x + 3) − 3 = 6x + 6, and g(4) = 30.

> **Example.** For the linear function f, f(1) = 2 and f(4) = 11. The
> function g is defined by g(x) = f(−2x) + 1. What is the slope of g?
>
> f has slope (11 − 2)/(4 − 1) = 3, so f(x) = 3x − 1.
>
> g(x) = 3(−2x) − 1 + 1 = −6x, so the slope is −6. The slope of f times the
> factor −2.

> **Try it.** For the linear function f, f(1) = 4 and f(5) = 6. The
> function g is defined by g(x) = f(−6x) + 2. What is the slope of the
> graph of y = g(x)?
>
> **Answer.** −3
>
> f has slope (6 − 4)/(5 − 1) = 1/2, so f(x) = (1/2)x + 7/2.
>
> g(x) = (1/2)(−6x) + 7/2 + 2 = −3x + 11/2, so the slope is −3: the slope
> of f times the factor −6.

> **Trap.** Using f's own slope, or dropping the sign of the factor inside
> f. A factor inside f multiplies the slope, sign and all.

For a harder version, see [a rule that holds for every x](#identity).

## Harder versions {#hard}

The harder questions make you build f(x) = mx + b from indirect facts: a
rule that holds for every x, a yearly change set by the starting value, or
an x-intercept that must lie on one side of a value.

### An x-intercept limited to one side {#intercept-on-one-side}

A line with unknown slope m through a fixed point (p, q) meets the x-axis at
x = p − q/m. A condition such as "the x-intercept is greater than 6" is then
an inequality with m in a denominator. Decide the sign of m first:
multiplying by a negative m reverses the inequality, so clearing the
fraction without checking the sign keeps slopes that cannot work.

> **Try it.** In the xy-plane, line ℓ has slope m and passes through the
> point (2, 4). The x-intercept of ℓ is (k, 0), where k > 6. Which of the
> following describes all possible values of m?
>
> - A) m > −1
> - B) −1 < m < 0
> - C) m < −1
> - D) m < 0
>
> **Hint.** From (2, 4), above the x-axis, which way must the line slope to
> meet the axis to the right of x = 6?
>
> **Answer.** B
>
> The line is y − 4 = m(x − 2). Setting y = 0 gives k = 2 − 4/m, and k > 6
> means 4/m < −4.
>
> That needs m < 0: the line must fall to the right. Multiplying by the
> negative m reverses the inequality: 4 > −4m, so m > −1. Together,
> −1 < m < 0. Check m = −1/2: k = 2 + 8 = 10.
>
> Multiplying without reversing gives C; A forgets that m must be negative.

### A yearly change that is a percent of the start {#percent-of-the-start}

"Each year its value falls by 6% of its purchase price" describes a linear
model, not an exponential one: the yearly change is a fixed percent of the
starting value a, so V(t) = a − 0.06at. Write the model in a alone, then use
the value you are given.

> **Try it.** Each year after a machine is bought, its value decreases by
> an amount equal to 8% of its purchase price. Four years after it was
> bought, it is worth $27,200. What was its purchase price?
>
> **First step.** With purchase price a, the value after t years is
> a − 0.08at. After 4 years it is a − 0.32a = 0.68a. Now finish.
>
> **Answer.** $40,000
>
> 0.68a = 27,200, so a = 40,000. Check: the value falls by 3,200 a year,
> and 40,000 − 4(3,200) = 27,200.
>
> Taking 8% of $27,200 as the yearly drop, or 8% of each year's value,
> gives a different, wrong price.

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

> **Try it.** For a linear function f, f(3x) = 3f(x) − 8 for all x, and
> f(2) = 10. What is f(5)?
>
> **First step.** Write f(x) = mx + b. Left side: f(3x) = 3mx + b. Right
> side: 3(mx + b) − 8 = 3mx + 3b − 8. Now match the constants.
>
> **Answer.** 19
>
> The x-terms already agree, so the constants must: b = 3b − 8, which gives
> b = 4.
>
> From f(2) = 10: 2m + 4 = 10, so m = 3 and f(x) = 3x + 4.
>
> f(5) = 15 + 4 = 19. Check the relation at x = 1: f(3) = 13, and
> 3f(1) − 8 = 3(7) − 8 = 13.

> **Fails when.** The relation holds for one value of x only, such as
> "f(2) = 2f(1) + 5". That is a single equation, not an identity, and you
> can't match terms; use it together with the other facts as one equation.

> **Try it.** For a linear function f, f(x + 4) = f(x) − 12 for all x, and
> f(2) = 5. What is f(−3)?
>
> **Answer.** 20
>
> Shifting the input by 4 adds 4m: f(x + 4) = f(x) + 4m. So 4m = −12 and
> m = −3.
>
> From f(2) = 5: −6 + b = 5, so b = 11 and f(x) = −3x + 11.
>
> f(−3) = 9 + 11 = 20.
