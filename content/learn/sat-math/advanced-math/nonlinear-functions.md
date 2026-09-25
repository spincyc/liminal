---
id: sat-math/advanced-math/nonlinear-functions
title: Nonlinear functions
section: sat-math
domain: Advanced Math
skill: Nonlinear functions
---
# Nonlinear functions

A nonlinear function doesn't change at a constant rate: a quadratic rises
and falls around a vertex, an exponential grows by a constant factor, a
polynomial can turn several times. This skill asks you to read these
functions from equations, tables and graphs, and to interpret them in
context. It is part of Advanced Math, {{fact:sat-math-advanced}} of the Math
section. Hard questions ask which form of a function displays a feature, or
make you translate a sentence such as "triples every 4 hours" into a rule.

## Quadratic functions {#quadratic-functions}

Each form of a quadratic shows one feature as a constant:

| Form | Equation | Shows |
| --- | --- | --- |
| Standard | f(x) = ax² + bx + c | the y-intercept, c |
| Factored | f(x) = a(x − r)(x − s) | the zeros, r and s |
| Vertex | f(x) = a(x − h)² + k | the vertex (h, k), the maximum or minimum |

If a > 0 the parabola opens up and the vertex is a minimum; if a < 0 it opens
down and the vertex is a maximum. The vertex's x-coordinate is −b/(2a), and
it is also halfway between the two zeros, because a parabola is symmetric.

> **Example.** For f(x) = x² − 6x + 5, find the zeros, the vertex, and the
> vertex form.
>
> Factor: f(x) = (x − 1)(x − 5), so the zeros are 1 and 5.
>
> The vertex is halfway between them, at x = 3, and f(3) = 9 − 18 + 5 = −4.
> The vertex is (3, −4), a minimum because a = 1 > 0.
>
> Vertex form: f(x) = (x − 3)² − 4. Check by expanding: x² − 6x + 9 − 4 =
> x² − 6x + 5.

> **Example.** A ball's height, in meters, t seconds after it is thrown is
> h(t) = −5t² + 20t + 1. What is its greatest height, and what does the 1
> mean?
>
> The vertex is at t = −20/(2 · (−5)) = 2 seconds.
>
> h(2) = −20 + 40 + 1 = 21, so the greatest height is 21 meters.
>
> h(0) = 1: the ball was thrown from 1 meter above the ground.

> **Desmos.** Type the function, for example `y=x^2-6x+5`, and click the
> curve: Desmos labels the vertex and both zeros. See
> [Desmos key points](learn:sat/general/desmos#key-points).

> **Trap.** Reading the vertex of f(x) = (x − 3)² + 2 as (−3, 2). The form is
> x minus h, so h = 3 and the vertex is (3, 2).

## Exponential functions {#exponential-functions}

An exponential function has the form f(x) = a · bˣ, where a is the starting
value (the value at x = 0) and b is the factor for each step. If b > 1 it
grows; if 0 < b < 1 it decays. A percent change r per step gives b = 1 + r
for growth and b = 1 − r for decay.

| Description | Factor per step |
| --- | --- |
| grows 8% per year | 1.08 |
| shrinks 8% per year | 0.92 |
| doubles each period | 2 |
| halves each period | 0.5 |
| triples every 5 years | 3 per 5 years, written `3^(t/5)` |

> **Example.** A culture starts with 200 bacteria and triples every 4 hours.
> Which function gives the population after t hours?
>
> Start: a = 200. The factor is 3, but it applies once every 4 hours, so the
> number of tripling steps after t hours is t/4.
>
> P(t) = `200·3^(t/4)`. Check: at t = 4, P = 200 · 3 = 600; at t = 8,
> P = 200 · 9 = 1,800.
>
> The trap choices invert the exponent (`3^(4t)`), ignore the interval
> (`3^t`), or swap the numbers (`4^(t/3)`).

> **Example.** A car worth $24,000 loses 15% of its value each year. What is
> it worth after 2 years?
>
> The factor is 1 − 0.15 = 0.85, so V(t) = `24000·0.85^t`.
>
> V(2) = 24,000 · 0.7225 = 17,340 dollars.

> **Trap.** Using 0.15, the part that is lost, as the factor. That would
> leave 15% of the value each year, not 85%.

Linear or exponential? In a table with equal steps in x, check differences
and ratios. Constant differences mean linear; constant ratios mean
exponential. For x = 0, 1, 2, 3 and y = 5, 10, 20, 40, the differences
(5, 10, 20) change but every ratio is 2, so the function is exponential:
y = `5·2^x`.

## Polynomial functions {#polynomial-functions}

For a polynomial p, these all say the same thing:

- (x − a) is a factor of p(x).
- p(a) = 0, so a is a zero (a root, a solution of p(x) = 0).
- The graph crosses or touches the x-axis at (a, 0).

When p(x) is divided by x − a, the remainder is p(a). A zero that comes from
a squared factor, like (x − 1)², makes the graph touch the x-axis and turn
back; a zero from a single factor makes it cross.

> **Example.** Describe the graph of p(x) = (x + 2)(x − 1)².
>
> Zeros: x = −2 (single factor, the graph crosses) and x = 1 (squared factor,
> the graph touches and turns).
>
> y-intercept: p(0) = (2)(1) = 2.
>
> Expanding would give a leading term x³ with a positive coefficient, so the
> graph falls to the left and rises to the right.

Transformations move a graph without changing its shape:

| New function | Effect on the graph of f |
| --- | --- |
| f(x) + k | up k |
| f(x) − k | down k |
| f(x − h) | right h |
| f(x + h) | left h |
| −f(x) | reflect over the x-axis |
| f(−x) | reflect over the y-axis |

> **Example.** The graph of f has its vertex at (1, 4). Where is the vertex of
> g(x) = f(x + 3) − 2?
>
> x + 3 inside the function shifts the graph left 3. The −2 outside shifts it
> down 2.
>
> The vertex moves from (1, 4) to (1 − 3, 4 − 2) = (−2, 2).

> **Trap.** Shifting right for f(x + 3). Inside the parentheses the shift
> goes the opposite way from the sign: f(x + 3) moves left.

## What Hard looks like {#hard}

- Choosing the form of a function that shows a feature (a maximum, an initial value, a rate per month) as a constant.
- Interpreting a constant in context: in h(t) = −4.9(t − 3)² + 50, the 50 is the greatest height and the 3 is when it happens.
- Rewriting an exponential for a different time step.

> **Example.** A population is modeled by P(t) = `800·1.44^t`, with t in
> years. By what percent does it grow every half year?
>
> 1.44 = 1.2², so `1.44^t` = `1.2^(2t)`. In t years there are 2t half-years.
>
> The factor per half year is 1.2: the population grows 20% every half year
> (not 22%, which is half of 44%).
