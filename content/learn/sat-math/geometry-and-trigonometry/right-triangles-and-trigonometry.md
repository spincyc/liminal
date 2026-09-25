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
Hard questions hide the right triangle inside another figure or use the link
between the sine and cosine of complementary angles.

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

## What Hard looks like {#hard}

- A right triangle hidden in another figure: a rectangle's diagonal, a radius to a point of tangency, the height of an isosceles triangle, a box's space diagonal.
- A ratio given and a side asked for in a similar triangle.
- The complementary-angle relationship, sometimes written with expressions such as sin(2x + 10)° = cos(x + 20)°.

> **Example.** For acute angles, sin(2x + 10)° = cos(x + 20)°. What is x?
>
> Sine and cosine are equal for complementary angles:
> (2x + 10) + (x + 20) = 90.
>
> 3x + 30 = 90, so x = 20. Check: sin 50° = cos 40°.
