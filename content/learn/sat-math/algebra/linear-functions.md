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

## What Hard looks like {#hard}

- The function is described in words or by one fact about how it changes, and you must write the rule before anything else.
- Two representations must be reconciled: a table for one function and a graph or equation for another.
- The question asks about a shifted input, such as f(x + 3) − f(x), which for a linear function is always 3m.

> **Example.** For a linear function f, f(x + 3) = f(x) + 12 for every x,
> and f(0) = −5. What is f(7)?
>
> Raising the input by 3 raises the output by 12, so the slope is 12/3 = 4.
>
> f(0) = −5 gives b = −5, so f(x) = 4x − 5 and f(7) = 28 − 5 = 23.
