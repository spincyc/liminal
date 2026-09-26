---
id: sat-math/geometry-and-trigonometry/right-triangles-and-trigonometry
title: Right triangles and trigonometry
section: sat-math
domain: Geometry and Trigonometry
skill: Right triangles and trigonometry
---
# Right triangles and trigonometry

A right triangle has one 90° angle; the side across from it is the
hypotenuse. This skill covers the Pythagorean theorem, the special right
triangles and the trigonometric ratios sine, cosine and tangent. It belongs
to Geometry and Trigonometry, {{fact:sat-math-geometry}} of the Math
section. SAT trigonometry also reaches radians and the unit circle, which are
on the [Circles page](learn:sat-math/geometry-and-trigonometry/circles).
Hard questions give two angles of elevation to one height, carry a trig
ratio through a pair of similar triangles, or ask for a ratio of an angle
past 90°.

## Pythagorean theorem {#pythagorean-theorem}

```
a² + b² = c²        (c is the hypotenuse, the side across from the right angle)
```

The reference sheet gives the theorem and the two special right triangles:

| Triangle | Side ratio |
| --- | --- |
| 45°-45°-90° | x : x : x√2 |
| 30°-60°-90° | x : x√3 : 2x (short leg, long leg, hypotenuse) |

> **Example.** A 13-foot ladder leans against a wall with its foot 5 feet
> from the wall. How high up the wall does it reach?
>
> The ladder is the hypotenuse: 5² + h² = 13², so 25 + h² = 169.
>
> h² = 144, so h = 12 feet.

> **Example.** An equilateral triangle has sides of 10. What is its height?
>
> The height splits it into two 30°-60°-90° triangles with hypotenuse 10 and
> short leg 5.
>
> The height is the long leg: 5√3 ≈ 8.66. (Check: 5² + (5√3)² = 25 + 75 =
> 100 = 10².)

Common whole-number right triangles, called Pythagorean triples, save time:
3-4-5, 5-12-13, 8-15-17, 7-24-25, and their multiples such as 6-8-10.

> **Fails when.** The largest number of the triple isn't the hypotenuse in
> your triangle. If a leg is 5 and the hypotenuse is 12, the other leg is
> √(144 − 25) = √119, not 13. Check which side is across from the right
> angle before matching a triple.

The distance between two points is the Pythagorean theorem in disguise: the
horizontal and vertical gaps are the legs. From (1, 2) to (7, 10), the legs
are 6 and 8, so the distance is 10.

## Trigonometric ratios {#trigonometric-ratios}

For an acute angle A in a right triangle:

```
sin A = opposite / hypotenuse
cos A = adjacent / hypotenuse
tan A = opposite / adjacent
```

These ratios depend only on the angle, because any two right triangles with
the same acute angle are similar. That is why a table or a calculator can
give sin 35° for every triangle at once.

> **Example.** Right triangle ABC has its right angle at C, with BC = 8,
> AC = 15 and AB = 17. Find sin A, cos A, tan A and cos B.
>
> For angle A, the opposite side is BC = 8 and the adjacent side is AC = 15.
>
> sin A = 8/17, cos A = 15/17, tan A = 8/15.
>
> For angle B, the adjacent side is BC = 8, so cos B = 8/17, which equals
> sin A.

That last line is a tested fact: the two acute angles of a right triangle add
to 90°, and the side opposite one is adjacent to the other. So
sin x° = cos(90° − x°) and cos x° = sin(90° − x°).

> **Example.** In a right triangle, sin x° = 0.6. What is cos(90° − x°)?
>
> x and 90 − x are complementary, so cos(90° − x°) = sin x° = 0.6. No
> calculation is needed.

> **Example.** A ramp makes a 35° angle with the ground and is 20 feet long.
> How high does it rise?
>
> The rise is opposite the 35° angle and the ramp is the hypotenuse:
> sin 35° = h/20.
>
> h = 20 sin 35° ≈ 20 × 0.574 ≈ 11.5 feet.

| Angle | sin | cos | tan |
| --- | --- | --- | --- |
| 30° | 1/2 | √3/2 | √3/3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |

These come straight from the special right triangles, so you can rebuild the
table from the reference sheet.

> **Trap.** A calculator in the wrong angle mode. Desmos defaults to radians;
> switch it to degrees (in the settings) for an angle given in degrees, or
> you'll get sin 35 ≈ −0.43 instead of 0.574.

### One height seen from two places {#two-observers}

Two people on level ground in line with a tower see its top at different
angles of elevation, and you know only the distance between them. Neither
right triangle can be solved alone: each has the height and one distance
unknown. Write the height twice, once from each triangle, and solve the
pair.

> **Example.** Two points on level ground are 20 meters apart, in line with
> the base of a tower and on the same side of it. From the nearer point the
> angle of elevation to the top is 60°; from the farther point it is 30°.
> How tall is the tower?
>
> Let x be the nearer point's distance from the base and h the height.
>
> Nearer: tan 60° = h/x, so h = √3 x. Farther: tan 30° = h/(x + 20), so
> h = (x + 20)/√3.
>
> Set them equal: √3 x = (x + 20)/√3. Multiply by √3: 3x = x + 20, so x = 10
> and h = 10√3 ≈ 17.3 meters.
>
> Check with the farther point: (10 + 20)/√3 = 30/√3 = 10√3.

> **Trap.** Using 20 as the distance from either point to the tower. It is
> the gap between the two points.

### Ratios through similar triangles {#ratios-through-similarity}

A trig ratio belongs to an angle, not to a triangle. If triangle ABC is
similar to triangle PQR, with angle A matching angle Q, then tan Q = tan A,
whatever the triangles' sizes. Follow the stated matching, which may not be
alphabetical, then compute the ratio in whichever triangle you know.

### Angles past 90° {#angles-past-90}

For an angle drawn from the positive x-axis, the right-triangle ratios give
the size and the quadrant gives the sign: cosine (x) is negative in
Quadrants II and III, sine (y) in III and IV, and tangent is y over x. The
unit circle and radians are on the
[Circles page](learn:sat-math/geometry-and-trigonometry/circles#radians-and-the-unit-circle).

> **Example.** For an angle θ with π/2 < θ < π, sin θ = 5/13. What is
> tan θ?
>
> A reference triangle with opposite 5 and hypotenuse 13 has adjacent
> side 12.
>
> θ is in Quadrant II, where x is negative, so the point is (−12, 5) and
> tan θ = 5/(−12) = −5/12.

## What Hard looks like {#hard}

- Two angles of elevation to one height, with only the distance between the observers known. Write the height from each triangle and solve the pair (see [one height seen from two places](#two-observers)).
- A trig ratio of an angle in one triangle found from a similar triangle, with the vertices matched in a stated, non-alphabetical order (see [ratios through similar triangles](#ratios-through-similarity)).
- A ratio of an angle past 90°, or the angle of a point such as (−√3, 1): the reference triangle gives the size and the quadrant gives the sign (see [angles past 90°](#angles-past-90)).

The complementary-angle link is Medium, but it hides in Hard questions too.

> **Example.** For acute angles, sin(2x + 10)° = cos(x + 20)°. What is x?
>
> Sine and cosine are equal for complementary angles:
> (2x + 10) + (x + 20) = 90.
>
> 3x + 30 = 90, so x = 20. Check: sin 50° = cos 40°.
