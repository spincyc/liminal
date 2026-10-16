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
it first.

## Before you start {#before-you-start}

These checks cover circle measures from Grade 7, distance from Grade 8 and
completing the square from Algebra. If one goes wrong, rebuild it with
[Grade 7, week 22: circles](weeks.html#common-core-math/7/22),
[Grade 8, week 33: distance](weeks.html#common-core-math/8/33) or
[Algebra, week 23: completing the square](weeks.html#high-school-math/algebra/23).

> **Try it.** A circle has a diameter of 10. What are its circumference and
> its area, in terms of π?
>
> **Answer.** The circumference is 10π and the area is 25π.
>
> The radius is half the diameter, 5. Circumference: πd = 10π. Area:
> πr² = π · 5² = 25π. Shaky?
> [Grade 7, week 22](weeks.html#common-core-math/7/22).

> **Try it.** What is the distance between the points (1, −2) and (4, 2)?
>
> **Answer.** 5
>
> The horizontal gap is 4 − 1 = 3 and the vertical gap is 2 − (−2) = 4, so
> the distance is √(3² + 4²) = √25 = 5. Shaky?
> [Grade 8, week 33](weeks.html#common-core-math/8/33).

> **Try it.** What number must be added to x² + 10x to make a perfect
> square?
>
> **Answer.** 25
>
> Half of 10 is 5, and 5² = 25: x² + 10x + 25 = (x + 5)². Shaky?
> [Algebra, week 23](weeks.html#high-school-math/algebra/23).

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

> **Try it.** A circle has radius 10. A sector has a central angle of 72°.
> Find the sector's area and its arc length.
>
> **First step.** Fraction of the circle: 72/360 = 1/5. Now apply it to the
> area and to the circumference.
>
> **Answer.** The area is 20π and the arc length is 4π.
>
> Sector area: (1/5) · π · 10² = 20π. Arc length: (1/5) · 2π · 10 = 4π.

> **Example.** A tangent line touches a circle of radius 5 at point P. A
> point Q on the tangent line is 12 units from P. How far is Q from the
> center O?
>
> The radius OP is perpendicular to the tangent, so triangle OPQ has a right
> angle at P.
>
> OQ = √(5² + 12²) = √169 = 13.

> **Try it.** A line is tangent to a circle with center O at point T. Point
> P on the line is 15 units from T and 17 units from O. What is the radius
> of the circle?
>
> **Answer.** 8
>
> The radius OT is perpendicular to the tangent, so triangle OTP has a right
> angle at T, with hypotenuse OP = 17.
>
> OT = √(17² − 15²) = √(289 − 225) = √64 = 8.

> **Trap.** Using the diameter where the radius belongs. If a question gives
> the diameter, halve it before using πr².

An arc and its sector are the same fraction of different wholes: a sector
with 1/6 of the circle's area has 1/6 of the circumference as its arc. Find
the fraction from whichever measure you have, then apply it to the other.

> **Try it.** A sector of a circle with radius 12 has an arc length of 6π.
> What is the area of the sector?
>
> **Answer.** 36π
>
> The circumference is 2π · 12 = 24π, so the arc is 6π/24π = 1/4 of it.
>
> The sector is 1/4 of the circle's area: (1/4) · π · 12² = 36π.

### Chords and the center {#chords}

The perpendicular from the center to a chord bisects the chord. So the
radius to one end of the chord, half the chord, and the distance from the
center to the chord make a right triangle, with the radius as the
hypotenuse.

> **Try it.** A chord of a circle with radius 13 is 5 units from the center.
> How long is the chord?
>
> **Answer.** 24
>
> The distance 5 and half the chord are the legs, and the radius 13 is the
> hypotenuse: half the chord is √(13² − 5²) = √144 = 12.
>
> The chord is 2 × 12 = 24.

For a polygon inside a circle (a square, a regular hexagon, an equilateral
triangle), see [a polygon and a circle](learn:sat-math/geometry-and-trigonometry/area-and-volume#inscribed-figures).
For a harder version, where the center's distance from the chord is
unknown, see [when the center isn't given](#center-not-given).

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

> **Try it.** A circle has equation x² + y² − 10x + 4y = 7. Find its center
> and radius.
>
> **First step.** Group: (x² − 10x) + (y² + 4y) = 7. Now complete each
> square, adding the same amounts to both sides.
>
> **Answer.** Center (5, −2), radius 6
>
> Add (−10/2)² = 25 and (4/2)² = 4 to both sides:
> (x² − 10x + 25) + (y² + 4y + 4) = 7 + 25 + 4 = 36.
>
> So (x − 5)² + (y + 2)² = 36: center (5, −2), radius 6.

> **Example.** Write the equation of the circle with center (2, −1) that
> passes through (5, 3).
>
> The radius is the distance between the points: √((5 − 2)² + (3 − (−1))²) =
> √(9 + 16) = 5.
>
> Equation: (x − 2)² + (y + 1)² = 25.

> **Try it.** Which equation describes the circle with center (−3, 1) that
> passes through (3, 9)?
>
> - A) (x − 3)² + (y + 1)² = 100
> - B) (x + 3)² + (y − 1)² = 100
> - C) (x + 3)² + (y − 1)² = 10
> - D) (x − 3)² + (y − 9)² = 100
>
> **Answer.** B
>
> The radius is the distance between the points:
> √((3 − (−3))² + (9 − 1)²) = √(36 + 64) = 10, so r² = 100.
>
> Center (−3, 1) gives (x + 3)² + (y − 1)² = 100. A flips the signs of the
> center, C uses 10 where r² belongs, and D centers the circle on the point.

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

> **Try it.** A circle has equation 3x² + 3y² + 12x − 6y = 21. Is the point
> (0, 3) inside, on, or outside the circle?
>
> **Answer.** Inside
>
> Divide by 3: x² + y² + 4x − 2y = 7. Complete the squares:
> (x + 2)² + (y − 1)² = 7 + 4 + 1 = 12, center (−2, 1).
>
> The squared distance from (0, 3) to the center is
> (0 + 2)² + (3 − 1)² = 4 + 4 = 8, and 8 < 12, so the point is inside.

> **Desmos.** Type the equation as given, even in expanded form, for example
> `x^2+y^2+8x-6y=0`. Desmos draws the circle, and you can read the center and
> radius from the grid to check your algebra. See
> [Desmos for circles](learn:sat/general/desmos#circles).

For a harder version, the line tangent to a circle at a given point, see
[the tangent line at a point](#tangent-line).

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

> **Try it.** Find cos(3π/4) and sin(5π/3).
>
> **First step.** 3π/4 is 135°. Its reference angle is 180° − 135° = 45°.
> Now give cos(3π/4) its sign, then do sin(5π/3) the same way.
>
> **Answer.** cos(3π/4) = −√2/2 and sin(5π/3) = −√3/2
>
> 135° is in the upper left, where x is negative, so
> cos(3π/4) = −cos 45° = −√2/2.
>
> 5π/3 is 300°. Its reference angle is 360° − 300° = 60°, and 300° is in
> the lower right, where y is negative. So sin(5π/3) = −sin 60° = −√3/2.

> **Example.** An arc on a circle of radius 9 has a central angle of 2π/3
> radians. How long is the arc?
>
> s = rθ = 9 · 2π/3 = 6π.
>
> Check in degrees: 2π/3 is 120°, which is a third of the circle, and a third
> of the circumference 18π is 6π.

> **Try it.** An arc on a circle of radius 12 has a central angle of 5π/6
> radians. How long is the arc?
>
> **Answer.** 10π
>
> s = rθ = 12 · 5π/6 = 10π.
>
> Check in degrees: 5π/6 is 150°, and (150/360) · 24π = 10π.

> **Trap.** Mixing units. An angle written with π is almost always in
> radians; set Desmos to match, and don't put a radian angle into the
> degree formula (θ/360) · 2πr.

## Harder versions {#hard}

The hardest circle questions give the key fact indirectly: a radius through
a chord when the center isn't shown, or a tangent line through the radius
it meets.

### When the center isn't given {#center-not-given}

Name the center's unknown distance from the chord. An arc that rises h
above a chord at its middle puts the center r − h from the chord, so
(r − h)² + (half the chord)² = r².

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

> **Try it.** An arch is an arc of a circle. It spans 24 feet at its base
> and rises 8 feet at its center. What is the radius, in feet?
>
> **First step.** Half the chord is 12, and the center is r − 8 below the
> base: (r − 8)² + 12² = r². Now solve for r.
>
> **Answer.** 13
>
> r² − 16r + 64 + 144 = r², so 16r = 208 and r = 13.
>
> Check: the center is 13 − 8 = 5 below the base, and 5² + 12² = 169 = 13².

With two parallel chords, write the right triangle for each. Their
distances from the center are linked by the gap between the chords, and
both triangles share r², so set the two expressions for r² equal.

> **Try it.** Two parallel chords of a circle have lengths 48 and 14. They
> are on the same side of the center, 17 units apart. What is the radius of
> the circle?
>
> **Hint.** The longer chord is closer to the center. Call its distance from
> the center d.
>
> **Answer.** 25
>
> The other chord is d + 17 from the center. Half the chords are 24 and 7,
> so r² = d² + 24² and r² = (d + 17)² + 7².
>
> Set them equal: d² + 576 = d² + 34d + 289 + 49, so 34d = 238 and d = 7.
>
> r² = 7² + 24² = 625, so r = 25. Check the other chord:
> 24² + 7² = 625 too.

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

> **Try it.** The circle (x − 2)² + (y + 3)² = 25 passes through (5, 1).
> What is the y-intercept of the line tangent to the circle at (5, 1)?
>
> **First step.** Center: (2, −3). Slope of the radius:
> (1 − (−3))/(5 − 2) = 4/3. Now find the tangent's slope and its equation.
>
> **Answer.** 19/4
>
> Tangent slope: the negative reciprocal, −3/4.
>
> Through (5, 1): y − 1 = −(3/4)(x − 5), so y = −(3/4)x + 15/4 + 1 =
> −(3/4)x + 19/4. The y-intercept is 19/4, or (0, 19/4).
