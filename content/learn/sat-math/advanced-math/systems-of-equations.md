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
points where the graphs meet, and there can be two, one or none. It belongs
to Advanced Math, {{fact:sat-math-advanced}} of the Math section. For two
lines, see [systems of two linear equations](learn:sat-math/algebra/systems-of-two-linear-equations).
Hard questions ask for a constant that makes a line just touch a parabola
or a circle, or ask how many times a horizontal line meets a graph.

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

The number of intersection points equals the number of real solutions of
that combined quadratic, so the discriminant counts them without solving:
D > 0 means two points, D = 0 means the line just touches the curve (one
point), D < 0 means they never meet.

> **Example.** For what positive value of k does the line y = kx meet the
> parabola y = x² + 4 at exactly one point?
>
> Substitute: x² + 4 = kx, so x² − kx + 4 = 0.
>
> One point means D = 0: k² − 4(1)(4) = 0, so k² = 16 and k = 4 (the
> question asks for the positive value).
>
> Check: x² − 4x + 4 = (x − 2)² = 0 gives the single point (2, 8).

So the cue "line and parabola, exactly one point (or no points)" means: make
one quadratic, then use its discriminant.

> **Fails when.** The line is vertical, such as x = 3. A vertical line meets
> the graph of y = (quadratic in x) exactly once no matter what, and there
> is no quadratic to take a discriminant of. It also fails if you use the
> discriminant of the original parabola instead of the combined equation;
> that tells you about x-intercepts, not intersections with the line.

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

> **Example.** Where do y = x² − 2x and y = −x² + 4 intersect?
>
> Set them equal: x² − 2x = −x² + 4, so 2x² − 2x − 4 = 0, and dividing by
> 2, x² − x − 2 = 0.
>
> Factor: (x − 2)(x + 1) = 0, so x = 2 or x = −1.
>
> y at x = 2: 4 − 4 = 0. y at x = −1: 1 + 2 = 3. The points are (2, 0) and
> (−1, 3). Check (−1, 3) in the second equation: −1 + 4 = 3.

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

A horizontal or vertical tangent needs no algebra. The circle
(x − h)² + (y − k)² = r² has horizontal tangents y = k + r and y = k − r
(through its top and bottom) and vertical tangents x = h + r and x = h − r.

> **Trap.** Giving one value when there are two. A line with a given slope
> can touch a circle on either side, so a tangency question almost always
> has two answers.

> **Desmos.** Type the circle and the line with a slider, such as
> `(x-1)^2+y^2=8` and `y=x+c`, and drag c until the line just touches. Use
> it to find roughly where the answers are, then confirm with the
> discriminant; a line that nearly touches looks the same as one that does.

### Counting solutions from a graph {#counting-from-a-graph}

The solutions of the system y = f(x) and y = k are the points where the
horizontal line y = k meets the graph. Slide that line up and down: the
count can change only at a turning value, where the line touches the graph
at a peak or a valley instead of crossing it.

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

> **Fails when.** The graph shown is only part of the function (it may turn
> again off screen), levels off toward a value it never reaches, or runs
> flat along a line. Read the whole graph and the question's description
> of it before counting.

## What Hard looks like {#hard}

- A line and a parabola with a constant in either one, and a condition: exactly one solution, two, or none. Combine them into one quadratic with every term on one side, then set its discriminant to 0, above 0, or below 0.
- A line and a circle with a constant, and exactly one solution: the line is tangent, which usually gives two values of the constant (see [a line tangent to a circle](#line-circle-tangent)).
- A graphed polynomial and y = k: count where the horizontal line meets the graph, and remember the count changes at the turning values (see [counting solutions from a graph](#counting-from-a-graph)).

> **Example.** The system y = x² − 4x + k and y = 2x − 1 has exactly two
> real solutions. Which values of k are possible?
>
> Set them equal and collect: x² − 6x + (k + 1) = 0.
>
> Two solutions means D > 0: 36 − 4(k + 1) > 0, so 32 − 4k > 0 and k < 8.
>
> Check the edge: at k = 8 the equation is x² − 6x + 9 = (x − 3)² = 0, one
> solution, so 8 itself is excluded.
