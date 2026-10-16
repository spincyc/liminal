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
section.

## Before you start {#before-you-start}

This page uses function notation, linear and nonlinear tables, squaring a
binomial, and percent growth. Try these first. If one goes wrong, rebuild it
with [Algebra, week 7: functions](weeks.html#high-school-math/algebra/7),
[lesson 3-3](lessons.html#common-core-math/8/3-3),
[Algebra, week 20](weeks.html#high-school-math/algebra/20) or
[Algebra, week 15: exponential growth](weeks.html#high-school-math/algebra/15).

> **Try it.** If f(x) = x² − 3x, what is f(−2)?
>
> **Answer.** 10
>
> Replace every x with −2: (−2)² − 3(−2) = 4 + 6 = 10. Shaky?
> [Algebra, week 7](weeks.html#high-school-math/algebra/7).

> **Try it.** Does this table show a linear function?
>
> | x | 0 | 1 | 2 | 3 |
> | --- | --- | --- | --- | --- |
> | y | 1 | 4 | 9 | 16 |
>
> **Answer.** No
>
> Each step of 1 in x raises y by 3, then 5, then 7. A linear function
> changes by the same amount at every step. Shaky?
> [Lesson 3-3](lessons.html#common-core-math/8/3-3).

> **Try it.** Expand (x − 3)².
>
> **Answer.** x² − 6x + 9
>
> (x − 3)(x − 3) = x² − 3x − 3x + 9. Writing only x² + 9 misses the middle
> term. Shaky? [Algebra, week 20](weeks.html#high-school-math/algebra/20).

> **Try it.** A savings balance of $500 grows 4% each year. By what number
> is the balance multiplied each year, and what is it after 1 year?
>
> **Answer.** 1.04; $520
>
> Growing 4% keeps all of the balance and adds 4% more: 1 + 0.04 = 1.04.
> After 1 year: 500 · 1.04 = 520. Shaky?
> [Algebra, week 15](weeks.html#high-school-math/algebra/15).

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

> **Try it.** For f(x) = x² − 4x − 12, find the zeros, the vertex, and the
> vertex form.
>
> **First step.** Factor: f(x) = (x + 2)(x − 6), so the zeros are −2 and 6.
> Now find the vertex and the vertex form.
>
> **Answer.** Zeros −2 and 6; vertex (2, −16), a minimum;
> f(x) = (x − 2)² − 16
>
> The vertex is halfway between the zeros, at x = 2, and
> f(2) = 4 − 8 − 12 = −16. It is a minimum because a = 1 > 0.
>
> Check the vertex form by expanding: x² − 4x + 4 − 16 = x² − 4x − 12.

> **Example.** A ball's height, in meters, t seconds after it is thrown is
> h(t) = −5t² + 20t + 1. What is its greatest height, and what does the 1
> mean?
>
> The vertex is at t = −20/(2 · (−5)) = 2 seconds.
>
> h(2) = −20 + 40 + 1 = 21, so the greatest height is 21 meters.
>
> h(0) = 1: the ball was thrown from 1 meter above the ground.

> **Try it.** A ball's height, in feet, t seconds after it is tossed upward
> is h(t) = −16t² + 48t + 5. What is its greatest height, and what does the
> 5 mean?
>
> **Answer.** 41 feet; the ball was released 5 feet above the ground.
>
> The vertex is at t = −48/(2 · (−16)) = 1.5 seconds.
>
> h(1.5) = −36 + 72 + 5 = 41, so the greatest height is 41 feet.
>
> h(0) = 5: the ball left the hand 5 feet above the ground.

> **Desmos.** Type the function, for example `y=x^2-6x+5`, and click the
> curve: Desmos labels the vertex and both zeros. See
> [Desmos key points](learn:sat/general/desmos#key-points).

> **Trap.** Reading the vertex of f(x) = (x − 3)² + 2 as (−3, 2). The form is
> x minus h, so h = 3 and the vertex is (3, 2).

Conditions can point to a form: a vertex or extreme value to
a(x − h)² + k, zeros to a(x − r)(x − s), and two equal outputs to an axis
of symmetry halfway between their inputs. Then one more point fixes a.

> **Example.** A quadratic f has f(1) = f(7), a minimum value of −9, and
> f(0) = 7. What is f(x)?
>
> Equal outputs at 1 and 7 put the axis of symmetry halfway, at x = 4, so
> the vertex is (4, −9) and f(x) = a(x − 4)² − 9.
>
> f(0) = 16a − 9 = 7, so a = 1 and f(x) = (x − 4)² − 9.
>
> Check: f(1) = 9 − 9 = 0 and f(7) = 9 − 9 = 0.

> **Try it.** A quadratic g has g(−2) = g(6), a maximum value of 10, and
> g(0) = 6. What is g(x)?
>
> **Answer.** g(x) = −(x − 2)² + 10
>
> Equal outputs at −2 and 6 put the axis of symmetry halfway, at x = 2, so
> the vertex is (2, 10) and g(x) = a(x − 2)² + 10.
>
> g(0) = 4a + 10 = 6, so a = −1. A negative a confirms that 10 is a
> maximum.
>
> Check: g(−2) = −16 + 10 = −6 and g(6) = −16 + 10 = −6.

### Signs of the constants from a description {#signs-from-the-graph}

Some questions describe a parabola in words and ask which statement must
be true. Turn each fact into a sign:

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

> **Try it.** The graph of f(x) = ax² + bx + c, where a, b and c are
> nonzero, opens upward and has its vertex in Quadrant III. Which must be
> true: b > 0, c > 0, or b² − 4ac < 0?
>
> **Answer.** b > 0
>
> Facts: a > 0; the vertex has h < 0 and k < 0.
>
> b = −2ah is −2 times a positive times a negative, so b > 0 must be true.
>
> The vertex is below the x-axis and the parabola opens upward, so it
> crosses the x-axis twice: b² − 4ac > 0, and "b² − 4ac < 0" cannot be
> true.
>
> c could go either way. f(x) = (x + 1)² − 4 = x² + 2x − 3 fits and has
> c = −3; f(x) = (x + 3)² − 1 = x² + 6x + 8 fits and has c = 8.

For a harder version, see [two zeros in an interval](#zeros-in-an-interval).

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

> **Try it.** A town of 5,000 people doubles in population every 15 years.
> Which function gives the population t years from now?
>
> - A) P(t) = `5000·2^(15t)`
> - B) P(t) = `5000·2^(t/15)`
> - C) P(t) = `5000·15^(t/2)`
> - D) P(t) = `5000·2^t`
>
> **First step.** The starting value is 5,000 and the factor is 2. Now
> decide how many doublings happen in t years.
>
> **Answer.** B
>
> The factor 2 applies once every 15 years, so after t years there have
> been t/15 doublings: P(t) = `5000·2^(t/15)`.
>
> Check: at t = 15, P = 5,000 · 2 = 10,000; at t = 30, P = 5,000 · 4 =
> 20,000. Choice A doubles 15 times a year, and D doubles every year.

> **Example.** A car worth $24,000 loses 15% of its value each year. What is
> it worth after 2 years?
>
> The factor is 1 − 0.15 = 0.85, so V(t) = `24000·0.85^t`.
>
> V(2) = 24,000 · 0.7225 = 17,340 dollars.

> **Trap.** Using 0.15, the part that is lost, as the factor. That would
> leave 15% of the value each year, not 85%.

> **Try it.** A laptop bought for $1,200 loses 25% of its value each year.
> What is it worth after 2 years?
>
> **Answer.** $675
>
> The factor is 1 − 0.25 = 0.75, so V(t) = `1200·0.75^t`.
>
> V(2) = 1,200 · 0.5625 = 675 dollars.

Linear or exponential? In a table with equal steps in x, check differences
and ratios. Constant differences mean linear; constant ratios mean
exponential. For x = 0, 1, 2, 3 and y = 5, 10, 20, 40, the differences
(5, 10, 20) change but every ratio is 2, so the function is exponential:
y = `5·2^x`.

To change the period, raise the base to a power: it applies once per
period, and the percent does not scale with the period.

> **Example.** A population is modeled by P(t) = `800·1.44^t`, with t in
> years. By what percent does it grow every half year?
>
> 1.44 = 1.2², so `1.44^t` = `1.2^(2t)`. In t years there are 2t half-years.
>
> The factor per half year is 1.2: the population grows 20% every half year
> (not 22%, which is half of 44%).

> **Try it.** A sample's mass is modeled by M(t) = `500·0.81^t`, with t in
> hours. By what percent does the mass decrease every half hour?
>
> **Answer.** 10%
>
> 0.81 = 0.9², so `0.81^t` = `0.9^(2t)`. In t hours there are 2t half
> hours.
>
> The factor per half hour is 0.9: the mass decreases 10% every half hour
> (not 9.5%, which is half of 19%).

For a harder version, see [an exponential with a shift](#shifted-exponential).

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

> **Try it.** Describe the graph of p(x) = (x − 3)(x + 1)².
>
> **First step.** Zeros: x = 3 (single factor, the graph crosses) and
> x = −1 (squared factor, the graph touches and turns). Now find the
> y-intercept and the end behavior.
>
> **Answer.** It crosses at x = 3, touches at x = −1, has y-intercept
> (0, −3), and falls to the left and rises to the right.
>
> y-intercept: p(0) = (−3)(1)² = −3.
>
> Expanding would give a leading term x³ with a positive coefficient, so
> the graph falls to the left and rises to the right.

> **Example.** For p(x) = x³ − 2x² + kx + 6, where k is a constant, x − 3 is
> a factor of p(x). What is k?
>
> x − 3 is a factor exactly when p(3) = 0: 27 − 18 + 3k + 6 = 0, so
> 15 + 3k = 0 and k = −5.

> **Try it.** When p(x) = 2x³ + x² + kx − 4 is divided by x − 2, the
> remainder is 10. What is k?
>
> **Answer.** k = −3
>
> The remainder on division by x − 2 is p(2): 16 + 4 + 2k − 4 = 10, so
> 16 + 2k = 10 and k = −3.
>
> Check: p(2) = 16 + 4 − 6 − 4 = 10.

### Transformations {#transformations}

Translations and reflections preserve a graph's shape and size:

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

> **Try it.** The graph of f has its vertex at (−3, 5). Where is the vertex
> of g(x) = f(x − 4) + 1?
>
> **Answer.** (1, 6)
>
> x − 4 inside the function shifts the graph right 4. The +1 outside shifts
> it up 1.
>
> The vertex moves from (−3, 5) to (−3 + 4, 5 + 1) = (1, 6).

> **Trap.** Shifting right for f(x + 3). Inside the parentheses the shift
> goes the opposite way from the sign: f(x + 3) moves left.

For harder versions, see [stretches and reflections](#stretches) and
[a vertex between the rows](#vertex-between-rows).

## Harder versions {#hard}

The harder questions combine facts: where both zeros lie, a shift that
hides an exponential's base, or a graph to rebuild before transforming it.

### Two zeros in an interval {#zeros-in-an-interval}

Both zeros of an upward-opening parabola f lie strictly between p and q
exactly when the discriminant is positive, the vertex is between p and q,
and f(p) > 0 and f(q) > 0.

> **Try it.** For how many integer values of k does f(x) = x² − 4x + k have
> two distinct zeros, both between −1 and 5?
>
> **First step.** Two zeros: 16 − 4k > 0, so k < 4. The vertex is at x = 2,
> between −1 and 5. Now make both ends positive.
>
> **Answer.** 8
>
> f(−1) = 1 + 4 + k = k + 5 > 0 and f(5) = 25 − 20 + k = k + 5 > 0, so
> k > −5.
>
> So −5 < k < 4: k = −4, −3, …, 3, which is 8 values. At k = −5 the zeros
> are −1 and 5, which are not strictly between.

### An exponential with a shift {#shifted-exponential}

In f(x) = a · bˣ + c, the constant c spoils the ratios of the outputs, but
subtracting outputs cancels it. For inputs 1 apart, each difference is b
times the one before, and the first difference from x = 0 is a(b − 1); for
inputs 2 apart, the ratio is b².

> **Try it.** The function f(x) = a · bˣ + c, where a, b and c are constants
> and b > 0, has f(0) = 1, f(1) = 7 and f(2) = 31. What are a, b and c?
>
> **First step.** The differences are 7 − 1 = 6 and 31 − 7 = 24. Now use
> their ratio.
>
> **Answer.** a = 2, b = 4, c = −1
>
> The ratio of the differences is b = 24/6 = 4.
>
> The first difference is a(b − 1) = 3a = 6, so a = 2. Then
> f(0) = a + c = 1 gives c = −1.
>
> Check: f(2) = 2 · 16 − 1 = 31.

> **Try it.** The function f(x) = a · bˣ + c, where a, b and c are constants
> and b > 0, has f(0) = 4, f(2) = 13 and f(4) = 49. What is b?
>
> **Answer.** 2
>
> The differences are 13 − 4 = 9 and 49 − 13 = 36, and their ratio is 4.
>
> The inputs step by 2, so 4 = b², and b = 2. Answering 4 forgets the
> spacing.
>
> Check with a(b² − 1) = 3a = 9: a = 3 and c = 1, so f(4) = 3 · 16 + 1 = 49.

### Stretches and reflections {#stretches}

A multiplier stretches or compresses the graph. For
g(x) = a · f(b(x − h)) + k with a and b nonzero, a point (u, v) on f
becomes (h + u/b, av + k) on g. Solve b(x − h) = u for the new input;
then apply the outside operations to the old output.

> **Example.** A graph of f has a minimum at (2, −3) and passes through
> (0, 1). For g(x) = −2f(3(x − 1)) + 4, where do those points move?
>
> For the minimum's input, solve 3(x − 1) = 2, giving x = 5/3.
> Its output becomes −2(−3) + 4 = 10, so the point moves to (5/3, 10).
> Since multiplying by −2 reverses output order, this is a maximum of g.
>
> The point (0, 1) moves to (1, 2): 3(x − 1) = 0 gives x = 1, and
> −2(1) + 4 = 2.

> **Try it.** A graph of f has a maximum at (4, 2) and passes through
> (0, −6). For g(x) = 3f(2(x + 1)) − 1, where do those points move?
>
> **First step.** For the maximum's input, solve 2(x + 1) = 4, giving
> x = 1. Now find its output, then move the second point.
>
> **Answer.** The maximum moves to (1, 5); (0, −6) moves to (−1, −19).
>
> The output becomes 3(2) − 1 = 5. Multiplying by a positive 3 keeps
> output order, so (1, 5) is still a maximum.
>
> For (0, −6): 2(x + 1) = 0 gives x = −1, and 3(−6) − 1 = −19.

> **Fails when.** You read the constant inside an unfactored expression as
> the shift. In f(3x − 6), factor first: f(3(x − 2)) shifts right 2 after
> horizontally compressing by a factor of 1/3. The shift is not 6.

For a restricted graph, move its endpoints, included or excluded, with the
same mapping; a point outside the stated domain is not on the graph. Review
[domain and range](learn:sat/general/reading-graphs#domain-and-range)
before using a vertex to claim a maximum or minimum.

### A vertex between the rows {#vertex-between-rows}

A table of a quadratic may skip its vertex. Equal outputs put the axis of
symmetry halfway between their inputs, and for inputs 1 apart the
differences of the outputs grow by 2a. Rebuild the vertex form, then move
the vertex.

> **Try it.** The table shows values of a quadratic function f. What is
> the minimum value of g(x) = f(x + 1) − 2?
>
> | x | 1 | 2 | 3 | 4 |
> | --- | --- | --- | --- | --- |
> | f(x) | 2 | 0 | 0 | 2 |
>
> **First step.** Equal outputs at x = 2 and x = 3 put the axis at
> x = 5/2. Now find a from the differences.
>
> **Answer.** −9/4
>
> The differences are −2, 0 and 2, so 2a = 2 and a = 1. Then
> f(x) = (x − 5/2)² + k, and f(2) = 1/4 + k = 0 gives k = −1/4.
>
> The shift moves the vertex left 1 and down 2, so the minimum of g is
> −1/4 − 2 = −9/4. The smallest listed value, 0, would give −2.
