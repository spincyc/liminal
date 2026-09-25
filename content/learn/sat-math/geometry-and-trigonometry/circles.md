---
id: sat-math/geometry-and-trigonometry/circles
title: Circles
section: sat-math
domain: Geometry and Trigonometry
skill: Circles
---
# Circles

Circle questions cover arcs, sectors and angles in a circle, the equation of
a circle in the xy-plane, and radian measure with the unit circle. They
belong to Geometry and Trigonometry, {{fact:sat-math-geometry}} of the Math
section. The radius is the key length in almost every circle problem: find
it first. Hard questions put a circle equation in expanded form, mix degrees
and radians, or ask for a sine or cosine of an angle bigger than 90°.

## Circle measures {#circle-measures}

| Quantity | Formula |
| --- | --- |
| Circumference | C = 2πr = πd |
| Area | A = πr² |
| Arc length for a central angle of θ degrees | (θ/360) · 2πr |
| Sector area for a central angle of θ degrees | (θ/360) · πr² |

Both arc and sector are "the fraction of the circle" times the whole.

- A central angle has the same measure as its arc.
- An inscribed angle (vertex on the circle) is half its arc, so an angle inscribed in a semicircle is 90°.
- A tangent line is perpendicular to the radius at the point where it touches.

> **Example.** A circle has radius 6. A sector has a central angle of 120°.
> Find the sector's area and its arc length.
>
> Fraction of the circle: 120/360 = 1/3.
>
> Sector area: (1/3) · π · 6² = 12π. Arc length: (1/3) · 2π · 6 = 4π.

> **Example.** A tangent line touches a circle of radius 5 at point P. A
> point Q on the tangent line is 12 units from P. How far is Q from the
> center O?
>
> The radius OP is perpendicular to the tangent, so triangle OPQ has a right
> angle at P.
>
> OQ = √(5² + 12²) = √169 = 13.

> **Trap.** Using the diameter where the radius belongs. If a question gives
> the diameter, halve it before using πr².

## Circle equations {#circle-equations}

```
(x − h)² + (y − k)² = r²        center (h, k), radius r
```

Watch the signs: (x − 3)² + (y + 2)² = 25 has center (3, −2) and radius 5,
not center (−3, 2) and not radius 25.

When the equation is expanded, complete the square in x and in y to find the
center and radius.

> **Example.** A circle has equation x² + y² + 8x − 6y = 0. Find its center
> and radius.
>
> Group: (x² + 8x) + (y² − 6y) = 0.
>
> Complete each square by adding (8/2)² = 16 and (−6/2)² = 9 to both sides:
> (x² + 8x + 16) + (y² − 6y + 9) = 25.
>
> So (x + 4)² + (y − 3)² = 25: center (−4, 3), radius 5.

> **Example.** Write the equation of the circle with center (2, −1) that
> passes through (5, 3).
>
> The radius is the distance between the points: √((5 − 2)² + (3 − (−1))²) =
> √(9 + 16) = 5.
>
> Equation: (x − 2)² + (y + 1)² = 25.

A point is inside the circle when its distance from the center is less than
r, on the circle when it equals r, and outside when it is greater.

> **Desmos.** Type the equation as given, even in expanded form, for example
> `x^2+y^2+8x-6y=0`. Desmos draws the circle, and you can read the center and
> radius from the grid to check your algebra. See
> [Desmos for circles](learn:sat/general/desmos#circles).

## Radians and the unit circle {#radians-and-the-unit-circle}

A radian measures an angle by arc length: an angle of 1 radian cuts off an
arc as long as the radius. A full turn is 2π radians, so π radians = 180°.

- Degrees to radians: multiply by π/180. Radians to degrees: multiply by 180/π.
- Arc length with θ in radians: s = rθ.
- 30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2, 180° = π.

The unit circle is the circle of radius 1 centered at the origin. For any
angle θ measured counterclockwise from the positive x-axis, the point where
its ray meets the unit circle is (cos θ, sin θ). That defines sine and
cosine for every angle, not just acute ones. For an angle beyond 90°, use the
acute reference angle to its nearest x-axis and give the sign by the
quadrant: x (cosine) is negative on the left, y (sine) is negative below.

> **Example.** Find sin(5π/6) and cos(2π/3).
>
> 5π/6 is 150°. Its reference angle is 180° − 150° = 30°, and 150° is in the
> upper left, where y is positive. So sin(5π/6) = sin 30° = 1/2.
>
> 2π/3 is 120°. Its reference angle is 60°, and 120° is in the upper left,
> where x is negative. So cos(2π/3) = −cos 60° = −1/2.

> **Example.** An arc on a circle of radius 9 has a central angle of 2π/3
> radians. How long is the arc?
>
> s = rθ = 9 · 2π/3 = 6π.
>
> Check in degrees: 2π/3 is 120°, which is a third of the circle, and a third
> of the circumference 18π is 6π.

> **Trap.** Mixing units. An angle written with π is almost always in
> radians; set Desmos to match, and don't put a radian angle into the
> degree formula (θ/360) · 2πr.

## What Hard looks like {#hard}

- An expanded circle equation where completing the square is the first step.
- A tangent or inscribed angle that creates a right triangle you must notice.
- A radian angle beyond π/2, where the sign of sine or cosine comes from the unit circle.
- A change to an equation, such as replacing 25 with 36, and a question about what happens to the graph (the radius grows from 5 to 6; the center stays put).
