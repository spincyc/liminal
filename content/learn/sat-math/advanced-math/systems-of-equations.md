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
Hard questions ask how many intersection points there are, or for a
constant that makes a line just touch a curve.

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

## What Hard looks like {#hard}

- A constant chosen so that a line and a curve meet once, twice or never.
- A question about all the solutions at once, such as the sum of the x-values.
- A system given as graphs with only a few labeled points.

> **Example.** The system y = x² − 7 and y = 3x + 3 has two solutions,
> (x₁, y₁) and (x₂, y₂). What is x₁ + x₂?
>
> Combine: x² − 7 = 3x + 3, so x² − 3x − 10 = 0.
>
> Its solutions add to −b/a = 3. (Factoring confirms it: (x − 5)(x + 2) = 0
> gives x = 5 and x = −2, and 5 + (−2) = 3.)
