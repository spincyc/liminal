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
section. Hard questions pin a quadratic down from indirect conditions,
rewrite an exponential for a new period, or build one function from another
function's table or graph.

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

### Signs of the constants from a description {#signs-from-the-graph}

Some questions describe a parabola in words and ask which statement about
a, b, c, h or k must be true. Turn each part of the description into a sign:

| Description | What it forces |
| --- | --- |
| opens up, or down | a > 0, or a < 0 |
| vertex (h, k) in a quadrant | the signs of h and k |
| y-intercept above, or below, the x-axis | c = f(0) > 0, or c < 0 |
| two x-intercepts, one, or none | b² − 4ac > 0, = 0, or < 0; in vertex form, two exactly when a and k have opposite signs |
| both zeros positive | their sum −b/a > 0 and their product c/a > 0 |
| zeros on opposite sides of the y-axis | their product c/a < 0 |

For b, use h = −b/(2a), which gives b = −2ah. Then decide each statement:
"must" if the facts force it, "cannot" if the facts rule it out, and
"could" if one parabola that fits makes it true and another makes it false.

> **Example.** The graph of f(x) = ax² + bx + c, where a, b and c are
> nonzero, opens downward and has its vertex in Quadrant II. Which must be
> true: b > 0, c > 0, or b² − 4ac > 0?
>
> Facts: a < 0; the vertex has h < 0 and k > 0.
>
> b = −2ah is −2 times a negative times a negative, so b < 0: "b > 0"
> cannot be true.
>
> The vertex is above the x-axis and the parabola opens downward, so it
> crosses the x-axis twice: b² − 4ac > 0 must be true.
>
> c could go either way. f(x) = −(x + 1)² + 4 = −x² − 2x + 3 fits and has
> c = 3; f(x) = −(x + 3)² + 1 = −x² − 6x − 8 fits and has c = −8.

> **Trap.** Deciding from one sketch. "c > 0" holds for the first parabola
> above but not the second, and both fit. Before calling a statement
> "must", try to build a parabola that fits the description and breaks it.

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

- A quadratic pinned down by indirect conditions. A vertex points to a(x − h)² + k, zeros to a(x − r)(x − s), and two inputs with equal outputs to an axis of symmetry halfway between them. Choose the form first, then let one more point fix a.
- A parabola described in words and statements about the signs of a, b, c, h and k: which must, could or cannot be true. Turn each fact into a sign, and test a "must" by trying to build a counterexample (see [signs of the constants](#signs-from-the-graph)).
- An exponential rewritten for a different period. The base applies once per period, so a new period raises the base to a power; the percent never scales along with the period.
- A function built from another one given as a table or a graph, such as g(x) = f(x − 2) + 3. Find the input f actually receives (inside changes go opposite to their sign), read f there, and apply the outside change last.
- Factor and remainder conditions. x − a is a factor exactly when p(a) = 0, and the remainder on division by x − a is p(a). Only a stated zero forces a factor.
- A graph matched to its definition. Test each candidate against every feature: its zeros and whether the graph crosses or touches there, the y-intercept, the end behavior, and any level it approaches.

> **Example.** A quadratic f has f(1) = f(7), a minimum value of −9, and
> f(0) = 7. What is f(x)?
>
> Equal outputs at 1 and 7 put the axis of symmetry halfway, at x = 4, so
> the vertex is (4, −9) and f(x) = a(x − 4)² − 9.
>
> f(0) = 16a − 9 = 7, so a = 1 and f(x) = (x − 4)² − 9.
>
> Check: f(1) = 9 − 9 = 0 and f(7) = 9 − 9 = 0.

> **Example.** A population is modeled by P(t) = `800·1.44^t`, with t in
> years. By what percent does it grow every half year?
>
> 1.44 = 1.2², so `1.44^t` = `1.2^(2t)`. In t years there are 2t half-years.
>
> The factor per half year is 1.2: the population grows 20% every half year
> (not 22%, which is half of 44%).
