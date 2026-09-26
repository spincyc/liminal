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
it first. Hard questions find a radius from a chord and a height, put a
circle equation in expanded form with a common factor, or mix arcs, sectors
and inscribed angles in degrees and radians.

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

An arc length and a sector area are the same fraction of different wholes:
if a sector's area is 1/6 of the circle's area, its arc is 1/6 of the
circumference. Find the fraction from whichever measure you have, then
apply it to the other.

### Chords and the center {#chords}

The perpendicular from the center to a chord bisects the chord. So the
radius to one end of the chord, half the chord, and the distance from the
center to the chord make a right triangle, with the radius as the
hypotenuse.

When the center isn't given, name its unknown distance from the chord. An
arc that rises h above a chord at its middle puts the center r − h from the
chord, so (r − h)² + (half the chord)² = r².

> **Example.** An arch is an arc of a circle. It spans 16 feet at its base
> and rises 4 feet at its center. What is the radius?
>
> Half the chord is 8. The center is below the base, r − 4 from it.
>
> (r − 4)² + 8² = r², so r² − 8r + 16 + 64 = r². Then 8r = 80 and r = 10.
>
> Check: the center is 6 below the base, and 6² + 8² = 100 = 10².

> **Trap.** Taking half the chord, 8, as the radius, or using r in place of
> r − 4. The center is not on the chord.

With two parallel chords, write the right triangle for each. Their
distances from the center are linked by the gap between the chords, and
both triangles share r², so set the two expressions for r² equal.

For a polygon inside a circle (a square, a regular hexagon, an equilateral
triangle), see [a polygon and a circle](learn:sat-math/geometry-and-trigonometry/area-and-volume#inscribed-figures).

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

If every squared term has the same coefficient, as in
2x² + 2y² − 12x + 4y = 12, divide the whole equation by it first. Only then
complete the squares: x² + y² − 6x + 2y = 6 becomes
(x − 3)² + (y + 1)² = 16, center (3, −1) and radius 4.

> **Example.** Is the point (5, 2) inside that circle?
>
> Its squared distance from (3, −1) is (5 − 3)² + (2 + 1)² = 4 + 9 = 13.
>
> 13 < 16, the radius squared, so the point is inside.

> **Desmos.** Type the equation as given, even in expanded form, for example
> `x^2+y^2+8x-6y=0`. Desmos draws the circle, and you can read the center and
> radius from the grid to check your algebra. See
> [Desmos for circles](learn:sat/general/desmos#circles).

### The tangent line at a point {#tangent-line}

A tangent line is perpendicular to the radius at the point where it
touches. In the xy-plane that fixes its slope: find the center, find the
slope of the radius to the point, and take the negative reciprocal. The line
then passes through the point of tangency, not the center.

> **Example.** The circle (x + 1)² + (y − 2)² = 25 passes through (3, 5).
> Find an equation of the line tangent to the circle at (3, 5).
>
> Center: (−1, 2). Slope of the radius: (5 − 2)/(3 − (−1)) = 3/4.
>
> Tangent slope: the negative reciprocal, −4/3.
>
> Through (3, 5): y − 5 = −(4/3)(x − 3), so y = −(4/3)x + 4 + 5 =
> −(4/3)x + 9.
>
> Check: at x = 3, y = −4 + 9 = 5.

> **Trap.** Using the radius's slope, 3/4, or flipping it without changing
> the sign, 4/3. Either line cuts through the circle. And a line with the
> right slope through the center is parallel to the tangent, not the
> tangent.

> **Fails when.** The radius is horizontal or vertical, so it has no
> negative reciprocal to take. Picture it instead: at (4, 2) on this circle
> the radius is horizontal, so the tangent is the vertical line x = 4.

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

- A radius found from a chord and a height, or from two parallel chords, with the center not given. Use the right triangle from the center to the middle of each chord (see [chords and the center](#chords)).
- A circle equation in general form, possibly with a common factor to divide out, and a question about a point inside or outside. Complete the squares, then compare squared distances with r².
- The line tangent to a circle at a given point: its slope, its equation or its y-intercept. The slope is the negative reciprocal of the radius's slope, and the line passes through the point of tangency (see [the tangent line at a point](#tangent-line)).
- Arcs, sectors and inscribed angles in mixed units. Name the angle first: central or inscribed, degrees or radians. An inscribed angle is half the central angle on the same arc, and s = rθ needs radians.
