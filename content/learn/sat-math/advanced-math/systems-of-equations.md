---
id: sat-math/advanced-math/systems-of-equations
title: Systems of equations
section: sat-math
domain: Advanced Math
skill: Systems of equations
---
# Systems of equations

This skill covers systems where at least one equation is not a line: a line
and a parabola, a line and a circle, or two curves. The solutions are the
points where the graphs meet. A line and a nondegenerate circle or parabola
have at most two intersections; other curves can have more. It belongs
to Advanced Math, {{fact:sat-math-advanced}} of the Math section. For two
lines, see [systems of two linear equations](learn:sat-math/algebra/systems-of-two-linear-equations).

## Before you start {#before-you-start}

This page uses solving a linear system by substitution, solving a quadratic
by factoring, squaring a binomial, and testing a point on a circle. Try
these first. If one goes wrong, rebuild it with
[Grade 8, week 17](weeks.html#common-core-math/8/17),
[Algebra, week 25](weeks.html#high-school-math/algebra/25),
[Algebra, week 20](weeks.html#high-school-math/algebra/20) or
[Geometry, week 22](weeks.html#high-school-math/geometry/22).

> **Try it.** Solve the system y = 2x + 1 and x + y = 7.
>
> **Answer.** x = 2, y = 5
>
> Substitute: x + (2x + 1) = 7, so 3x = 6 and x = 2. Then
> y = 2(2) + 1 = 5. Shaky?
> [Grade 8, week 17](weeks.html#common-core-math/8/17).

> **Try it.** Solve x² − 2x − 8 = 0.
>
> **Answer.** x = 4 or x = −2
>
> Factor: (x − 4)(x + 2) = 0, so x = 4 or x = −2. Shaky?
> [Algebra, week 25](weeks.html#high-school-math/algebra/25).

> **Try it.** Expand (x + 3)².
>
> **Answer.** x² + 6x + 9
>
> (x + 3)(x + 3) = x² + 3x + 3x + 9. Writing only x² + 9 misses the middle
> term. Shaky? [Algebra, week 20](weeks.html#high-school-math/algebra/20).

> **Try it.** Is the point (3, −4) on the circle x² + y² = 25?
>
> **Answer.** Yes
>
> 3² + (−4)² = 9 + 16 = 25, so the point makes the equation true. Shaky?
> [Geometry, week 22](weeks.html#high-school-math/geometry/22).

## Linear-quadratic systems {#linear-quadratic-systems}

The method: substitute the linear equation into the quadratic one. You get a
single quadratic equation in x. Its solutions are the x-coordinates of the
intersection points; put each one back into the linear equation to get y.

> **Example.** Solve the system y = x² − 4x + 5 and y = 2x − 3.
>
> Set the right sides equal: x² − 4x + 5 = 2x − 3.
>
> Move everything to one side: x² − 6x + 8 = 0, so (x − 2)(x − 4) = 0.
>
> x = 2 gives y = 2(2) − 3 = 1. x = 4 gives y = 5.
>
> Check (4, 5) in the parabola: 16 − 16 + 5 = 5. The solutions are (2, 1)
> and (4, 5).

> **Try it.** Solve the system y = x² + 2x − 1 and y = 4x + 2.
>
> **First step.** Set the right sides equal: x² + 2x − 1 = 4x + 2, so
> x² − 2x − 3 = 0. Now solve and find each y.
>
> **Answer.** (3, 14) and (−1, −2)
>
> Factor: (x − 3)(x + 1) = 0, so x = 3 or x = −1.
>
> x = 3 gives y = 4(3) + 2 = 14. x = −1 gives y = −2.
>
> Check (3, 14) in the parabola: 9 + 6 − 1 = 14.

> **Try it.** The point (2, 7) is a solution of the system y = x² + k and
> y = 3x + 1. What is k?
>
> **Answer.** 3
>
> A solution makes both equations true. The line checks: 3(2) + 1 = 7.
>
> The parabola: 7 = 2² + k, so k = 3.

The number of intersection points equals the number of real solutions of
that combined quadratic, so the discriminant counts them without solving:
D > 0 means two points, D = 0 means the line just touches the curve (one
point), D < 0 means they never meet.

> **Fails when.** The line is vertical, such as x = 3. A vertical line meets
> the graph of y = (quadratic in x) exactly once no matter what, and there
> is no quadratic to take a discriminant of. It also fails if you use the
> discriminant of the original parabola instead of the combined equation;
> that tells you about x-intercepts, not intersections with the line.

> **Try it.** How many points do the graphs of y = x² − 4 and y = 2x − 6
> have in common?
>
> **Answer.** 0
>
> Set them equal: x² − 4 = 2x − 6, so x² − 2x + 2 = 0.
>
> D = (−2)² − 4(1)(2) = 4 − 8 = −4. That is negative, so the graphs never
> meet.
>
> The parabola alone crosses the x-axis twice, at x = 2 and x = −2, but
> that answers a different question.

For a harder version, where a constant decides the number of solutions,
see [a constant that sets the count](#discriminant-parameter).

## Nonlinear systems {#nonlinear-systems}

The same idea works for any two curves: get one equation in one variable by
substitution or by adding and subtracting, solve it, then find the other
coordinate.

> **Example.** Solve the system x² + y² = 25 and y = x + 1.
>
> Substitute y = x + 1 into the circle: x² + (x + 1)² = 25.
>
> Expand: x² + x² + 2x + 1 = 25, so 2x² + 2x − 24 = 0, and dividing by 2,
> x² + x − 12 = 0.
>
> Factor: (x + 4)(x − 3) = 0, so x = 3 or x = −4. Then y = 4 or y = −3.
>
> Check (−4, −3) in the circle: 16 + 9 = 25. The line crosses the circle at
> (3, 4) and (−4, −3).

> **Try it.** Solve the system x² + y² = 10 and y = x + 2.
>
> **First step.** Substitute y = x + 2 into the circle:
> x² + (x + 2)² = 10, so 2x² + 4x + 4 = 10. Now solve and find each y.
>
> **Answer.** (1, 3) and (−3, −1)
>
> 2x² + 4x − 6 = 0, and dividing by 2, x² + 2x − 3 = 0.
>
> Factor: (x + 3)(x − 1) = 0, so x = 1 or x = −3. Then y = 3 or y = −1.
>
> Check (−3, −1) in the circle: 9 + 1 = 10.

> **Example.** Where do y = x² − 2x and y = −x² + 4 intersect?
>
> Set them equal: x² − 2x = −x² + 4, so 2x² − 2x − 4 = 0, and dividing by
> 2, x² − x − 2 = 0.
>
> Factor: (x − 2)(x + 1) = 0, so x = 2 or x = −1.
>
> y at x = 2: 4 − 4 = 0. y at x = −1: 1 + 2 = 3. The points are (2, 0) and
> (−1, 3). Check (−1, 3) in the second equation: −1 + 4 = 3.

> **Try it.** Where do y = x² + x − 4 and y = −x² + 3x + 8 intersect?
>
> **Answer.** (3, 8) and (−2, −2)
>
> Set them equal: x² + x − 4 = −x² + 3x + 8, so 2x² − 2x − 12 = 0, and
> dividing by 2, x² − x − 6 = 0.
>
> Factor: (x − 3)(x + 2) = 0, so x = 3 or x = −2.
>
> y at x = 3: 9 + 3 − 4 = 8. y at x = −2: 4 − 2 − 4 = −2. Check (3, 8) in
> the second equation: −9 + 9 + 8 = 8.

> **Desmos.** Type both equations as given, for example `x^2+y^2=25` and
> `y=x+1`, and click each intersection. This is the fastest route when the
> algebra gets messy, and a strong check when it doesn't. See
> [Desmos for systems](learn:sat/general/desmos#systems).

> **Trap.** Stopping after finding x. A question may ask for a y-value, for
> the point, or for the product x · y at one solution. Reread the stem.

### Squares of sums and differences {#square-identities}

When a system gives x² + y² together with x + y, x − y, or xy, the asked
quantity usually follows without finding x or y:

```
(x + y)² = x² + y² + 2xy
(x − y)² = x² + y² − 2xy
```

> **Example.** If x + y = 8 and x² + y² = 50, what is xy? What is (x − y)²?
>
> Square the first equation: (x + y)² = 64, so x² + y² + 2xy = 64.
>
> Replace x² + y² with 50: 50 + 2xy = 64, so 2xy = 14 and xy = 7.
>
> Then (x − y)² = 50 − 2(7) = 36.
>
> Check: x = 7 and y = 1 fit both equations, 7 · 1 = 7, and (7 − 1)² = 36.

> **Trap.** Treating (x + y)² as x² + y², or stopping at 2xy = 14 when the
> question asks for xy.

> **Try it.** If x − y = 3 and x² + y² = 29, what is xy? What is (x + y)²?
>
> **First step.** Square the first equation: (x − y)² = 9, so
> x² + y² − 2xy = 9. Now replace x² + y² and finish.
>
> **Answer.** xy = 10 and (x + y)² = 49
>
> Replace x² + y² with 29: 29 − 2xy = 9, so 2xy = 20 and xy = 10.
>
> Then (x + y)² = 29 + 2(10) = 49.
>
> Check: x = 5 and y = 2 fit both equations, 5 · 2 = 10, and
> (5 + 2)² = 49.

### Counting solutions from a graph {#counting-from-a-graph}

The solutions of the system y = f(x) and y = k are the points where the
horizontal line y = k meets the graph. Slide that line up and down: the
count can change only at a turning value, where the line touches the graph
at a peak or a valley instead of crossing it. Several turning points can
share one height, so count each distinct point of contact once rather than
assuming the total changes by one.

> **Example.** The graph of a polynomial f rises from the lower left to a
> peak at (−2, 5), falls to a valley at (1, −3), and then rises to the upper
> right. For which k does f(x) = k have exactly three solutions?
>
> For k above 5, the line meets only the right-hand rise: one solution.
>
> At k = 5 it touches the peak and crosses the right-hand rise: two.
>
> Between −3 and 5 it crosses all three pieces: three solutions. At
> k = −3 it touches the valley: two. Below −3: one.
>
> So f(x) = k has three solutions exactly when −3 < k < 5.

> **Try it.** The graph of a polynomial g falls from the upper left to a
> valley at (−1, −4), rises to a peak at (2, 6), and then falls to the lower
> right. For which k does g(x) = k have exactly two solutions?
>
> **First step.** For k above 6, the line meets only the left-hand fall:
> one solution. Now slide the line down through each turning value.
>
> **Answer.** k = 6 or k = −4
>
> At k = 6 the line touches the peak and crosses the left-hand fall: two.
>
> Between −4 and 6 it crosses all three pieces: three. At k = −4 it touches
> the valley and crosses the right-hand fall: two. Below −4: one.
>
> So there are exactly two solutions only at the turning values, k = 6 and
> k = −4.

> **Fails when.** The graph shown is only part of the function (it may turn
> again off screen), levels off toward a value it never reaches, or runs
> flat along a line. Read the whole graph and the question's description
> of it before counting.

For a harder version, a line that just touches a circle, see
[a line tangent to a circle](#line-circle-tangent).

## Harder versions {#hard}

The harder questions in this skill put a constant into one equation and ask
which values give exactly one solution, two, or none.

### A constant that sets the count {#discriminant-parameter}

With a constant in either equation, combine them into one quadratic with
every term on one side. Then set its discriminant to 0 for exactly one
solution, above 0 for two, or below 0 for none.

> **Example.** For what positive value of k does the line y = kx meet the
> parabola y = x² + 4 at exactly one point?
>
> Substitute: x² + 4 = kx, so x² − kx + 4 = 0.
>
> One point means D = 0: k² − 4(1)(4) = 0, so k² = 16 and k = 4 (the
> question asks for the positive value).
>
> Check: x² − 4x + 4 = (x − 2)² = 0 gives the single point (2, 8).

> **Try it.** For what positive value of m does the line y = mx + 1 meet the
> parabola y = x² + 2x + 10 at exactly one point?
>
> **First step.** Substitute: x² + 2x + 10 = mx + 1, so
> x² + (2 − m)x + 9 = 0. Now set the discriminant to 0.
>
> **Answer.** m = 8
>
> (2 − m)² − 4(1)(9) = 0, so (2 − m)² = 36 and 2 − m = 6 or 2 − m = −6.
> That gives m = −4 or m = 8; the positive value is 8.
>
> Check: x² − 6x + 9 = (x − 3)² = 0 gives the single point (3, 25).

> **Example.** The system y = x² − 4x + k and y = 2x − 1 has exactly two
> real solutions. Which values of k are possible?
>
> Set them equal and collect: x² − 6x + (k + 1) = 0.
>
> Two solutions means D > 0: 36 − 4(k + 1) > 0, so 32 − 4k > 0 and k < 8.
>
> Check the edge: at k = 8 the equation is x² − 6x + 9 = (x − 3)² = 0, one
> solution, so 8 itself is excluded.

> **Try it.** The system y = −x² + 2x + k and y = 4x + 3 has no real
> solutions. Which values of k are possible?
>
> **Answer.** k < 2
>
> Set them equal and collect: −x² + 2x + k = 4x + 3, so
> x² + 2x + (3 − k) = 0.
>
> No solutions means D < 0: 4 − 4(3 − k) < 0, so 4k − 8 < 0 and k < 2.
>
> Check the edge: at k = 2 the equation is x² + 2x + 1 = (x + 1)² = 0, one
> solution, so 2 itself is excluded.

### A line tangent to a circle {#line-circle-tangent}

A line meets a circle twice, once, or not at all, and "exactly one solution"
means the line is tangent. Substitute the line into the circle to get one
quadratic, then use its discriminant, exactly as with a parabola: D = 0 for
a tangent line, D > 0 for two points, D < 0 for none.

> **Example.** For which values of c does the line y = x + c meet the circle
> (x − 1)² + y² = 8 at exactly one point?
>
> Substitute: (x − 1)² + (x + c)² = 8, so
> x² − 2x + 1 + x² + 2cx + c² = 8, which is
> 2x² + (2c − 2)x + (c² − 7) = 0.
>
> One point means D = 0: (2c − 2)² − 4(2)(c² − 7) = 0. Expand:
> 4c² − 8c + 4 − 8c² + 56 = 0, so −4c² − 8c + 60 = 0, and dividing by −4,
> c² + 2c − 15 = 0.
>
> (c + 5)(c − 3) = 0, so c = 3 or c = −5.
>
> Check c = 3: the quadratic is 2x² + 4x + 2 = 2(x + 1)², so the one point
> is (−1, 2), and (−1 − 1)² + 2² = 8.

> **Try it.** For which values of c does the line y = x + c meet the circle
> (x + 2)² + y² = 18 at exactly one point?
>
> **First step.** Substitute: (x + 2)² + (x + c)² = 18, which collects to
> 2x² + (2c + 4)x + (c² − 14) = 0. Now set the discriminant to 0.
>
> **Answer.** c = 8 or c = −4
>
> (2c + 4)² − 4(2)(c² − 14) = 0. Expand: 4c² + 16c + 16 − 8c² + 112 = 0,
> so −4c² + 16c + 128 = 0, and dividing by −4, c² − 4c − 32 = 0.
>
> (c − 8)(c + 4) = 0, so c = 8 or c = −4.
>
> Check c = 8: the quadratic is 2x² + 20x + 50 = 2(x + 5)², so the one
> point is (−5, 3), and (−5 + 2)² + 3² = 18.

A horizontal or vertical tangent needs no algebra. The circle
(x − h)² + (y − k)² = r² has horizontal tangents y = k + r and y = k − r
(through its top and bottom) and vertical tangents x = h + r and x = h − r.

> **Try it.** Which horizontal lines are tangent to the circle
> (x − 3)² + (y + 1)² = 16?
>
> **Answer.** y = 3 and y = −5
>
> The center is (3, −1) and the radius is 4. The horizontal tangents pass
> through the top and the bottom: y = −1 + 4 = 3 and y = −1 − 4 = −5.

> **Trap.** Giving one value when there are two. A line with a given slope
> can touch a circle on either side, so a tangency question almost always
> has two answers.

> **Desmos.** Type the circle and the line with a slider, such as
> `(x-1)^2+y^2=8` and `y=x+c`, and drag c until the line just touches. Use
> it to find roughly where the answers are, then confirm with the
> discriminant; a line that nearly touches looks the same as one that does.
