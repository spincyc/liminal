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

## Before you start {#before-you-start}

These checks cover right-triangle lengths, distance and triangle angles from
Grade 8. If one goes wrong, rebuild it with
[Grade 8, week 32: right-triangle lengths](weeks.html#common-core-math/8/32),
[Grade 8, week 33: distance](weeks.html#common-core-math/8/33) or
[Grade 8, week 29: triangle angles](weeks.html#common-core-math/8/29).

> **Try it.** A right triangle has a hypotenuse of 26 and one leg of 10.
> How long is the other leg?
>
> **Answer.** 24
>
> 10² + b² = 26², so 100 + b² = 676. Then b² = 576 and b = 24. Shaky?
> [Grade 8, week 32](weeks.html#common-core-math/8/32).

> **Try it.** What is the distance between the points (−2, 3) and (3, 15)?
>
> **Answer.** 13
>
> The horizontal gap is 3 − (−2) = 5 and the vertical gap is 15 − 3 = 12,
> so the distance is √(5² + 12²) = √169 = 13. Shaky?
> [Grade 8, week 33](weeks.html#common-core-math/8/33).

> **Try it.** One acute angle of a right triangle measures 35°. What is the
> other acute angle?
>
> **Answer.** 55°
>
> The angles add to 180° and the right angle takes 90°, so the two acute
> angles add to 90°: 90 − 35 = 55. Shaky?
> [Grade 8, week 29](weeks.html#common-core-math/8/29).

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

> **Try it.** A 17-foot wire runs from the top of a pole to a stake in the
> level ground 8 feet from the base of the pole. How tall, in feet, is the
> pole?
>
> **First step.** The wire is the hypotenuse: 8² + h² = 17². Now solve for
> h.
>
> **Answer.** 15
>
> 64 + h² = 289, so h² = 225 and h = 15 feet.

> **Example.** An equilateral triangle has sides of 10. What is its height?
>
> The height splits it into two 30°-60°-90° triangles with hypotenuse 10 and
> short leg 5.
>
> The height is the long leg: 5√3 ≈ 8.66. (Check: 5² + (5√3)² = 25 + 75 =
> 100 = 10².)

> **Try it.** An equilateral triangle has a height of 4√3. What is its
> perimeter?
>
> **Answer.** 24
>
> The height is the long leg of a 30°-60°-90° triangle: x√3 = 4√3, so the
> short leg is x = 4.
>
> The short leg is half a side, so each side is 8 and the perimeter is
> 3 × 8 = 24. Check: 4² + (4√3)² = 16 + 48 = 64 = 8².

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

> **Try it.** Right triangle PQR has its right angle at R, with PR = 7,
> QR = 24 and PQ = 25. Find sin P, cos P, tan P and sin Q.
>
> **First step.** For angle P, the opposite side is QR = 24 and the adjacent
> side is PR = 7. Now write the ratios.
>
> **Answer.** sin P = 24/25, cos P = 7/25, tan P = 24/7 and sin Q = 7/25
>
> sin P = 24/25, cos P = 7/25 and tan P = 24/7.
>
> For angle Q, the opposite side is PR = 7, so sin Q = 7/25, which equals
> cos P.

That last line is a tested fact: the two acute angles of a right triangle add
to 90°, and the side opposite one is adjacent to the other. So
sin x° = cos(90° − x°) and cos x° = sin(90° − x°).

> **Example.** In a right triangle, sin x° = 0.6. What is cos(90° − x°)?
>
> x and 90 − x are complementary, so cos(90° − x°) = sin x° = 0.6. No
> calculation is needed.

> **Try it.** In right triangle ABC, the right angle is at C and
> sin A = 12/13. What is cos B?
>
> **Answer.** 12/13
>
> A and B are the two acute angles, so they add to 90°. The side opposite A
> is the side adjacent to B, so cos B = sin A = 12/13.

Given one ratio, sketch the triangle: the ratio gives two sides, and the
Pythagorean theorem gives the third. Then read any other ratio, for either
acute angle.

> **Example.** In right triangle ABC, the right angle is at C and
> sin A = 20/29. What are tan A and cos B?
>
> sin A = opposite/hypotenuse, so take BC = 20 and AB = 29. The other leg is
> AC = √(29² − 20²) = √(841 − 400) = √441 = 21.
>
> tan A = 20/21. For angle B, the adjacent side is BC = 20, so
> cos B = 20/29, which equals sin A.
>
> The trap leg is 29 − 20 = 9, from subtracting instead of using the
> Pythagorean theorem.

> **Try it.** In right triangle PQR, the right angle is at R and
> cos P = 12/37. What is tan Q?
>
> **First step.** cos P = adjacent/hypotenuse, so take PR = 12 and PQ = 37.
> The other leg is QR = √(37² − 12²). Now finish.
>
> **Answer.** 12/35
>
> QR = √(1,369 − 144) = √1,225 = 35. For angle Q, the opposite side is
> PR = 12 and the adjacent side is QR = 35, so tan Q = 12/35.
>
> tan P = 35/12 is the ratio at the other angle.

> **Example.** For acute angles, sin(2x + 10)° = cos(x + 20)°. What is x?
>
> Sine and cosine are equal for complementary angles:
> (2x + 10) + (x + 20) = 90.
>
> 3x + 30 = 90, so x = 20. Check: sin 50° = cos 40°.

> **Try it.** For acute angles, cos(3x − 5)° = sin(2x + 15)°. What is the
> value of x?
>
> **Answer.** 16
>
> The angles are complementary: (3x − 5) + (2x + 15) = 90, so 5x + 10 = 90
> and x = 16.
>
> Check: 3(16) − 5 = 43 and 2(16) + 15 = 47, and cos 43° = sin 47°.

> **Example.** A ramp makes a 35° angle with the ground and is 20 feet long.
> How high does it rise?
>
> The rise is opposite the 35° angle and the ramp is the hypotenuse:
> sin 35° = h/20.
>
> h = 20 sin 35° ≈ 20 × 0.574 ≈ 11.5 feet.

> **Try it.** From a point on level ground 30 meters from the base of a
> building, the angle of elevation to the top of the building is 52°. To
> the nearest meter, how tall is the building?
>
> **Answer.** 38 meters
>
> The height is opposite the 52° angle and the 30 meters is adjacent, so
> tan 52° = h/30.
>
> h = 30 tan 52° ≈ 30 × 1.280 ≈ 38.4, or 38 meters.

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

> **Try it.** For an angle θ with π < θ < 3π/2, cos θ = −3/5. What is
> tan θ?
>
> **First step.** A reference triangle with adjacent side 3 and hypotenuse 5
> has opposite side 4. Now place θ in its quadrant and give the signs.
>
> **Answer.** 4/3
>
> θ is in Quadrant III, where x and y are both negative, so the point is
> (−3, −4) and tan θ = (−4)/(−3) = 4/3.

For harder versions, which tie two triangles together, see
[one height seen from two places](#two-observers) and
[ratios through similar triangles](#ratios-through-similarity).

## Harder versions {#hard}

The hardest questions in this skill tie two triangles together: two views
of one height, or a ratio carried to a similar triangle of unknown size.

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

> **Try it.** Two hikers on level ground are 40 meters apart, in line with
> the base of a radio mast and on the same side of it. From the nearer
> hiker the angle of elevation to the top of the mast is 60°; from the
> farther hiker it is 30°. How tall is the mast?
>
> **Hint.** Write the height twice, once from each hiker's triangle, with x
> the nearer hiker's distance from the base.
>
> **Answer.** 20√3 meters, about 34.6 meters
>
> Let x be the nearer hiker's distance from the base. Nearer: h = √3 x.
> Farther: h = (x + 40)/√3.
>
> √3 x = (x + 40)/√3. Multiply by √3: 3x = x + 40, so x = 20 and
> h = 20√3 ≈ 34.6 meters.
>
> Check with the farther hiker: (20 + 40)/√3 = 60/√3 = 20√3.

### Ratios through similar triangles {#ratios-through-similarity}

A trig ratio belongs to an angle, not to a triangle. If triangles ABC and
PQR are similar, with angle A matching angle Q, then tan Q = tan A,
whatever the triangles' sizes. Follow the stated matching, which may not be
alphabetical, then compute the ratio in whichever triangle you know.

Indirect size information adds another step: an area ratio is the square
of the corresponding length ratio, while a perimeter ratio equals that
length ratio. A difference between perimeters is neither whole perimeter.

> **Example.** Right triangle ABC has its right angle at C and tan A = 3/4.
> A similar larger triangle has 9 times its area and a perimeter 48 units
> greater. How long is the larger triangle’s hypotenuse?
>
> The sides of ABC have ratio 3 : 4 : 5. The area ratio gives a length
> factor of √9 = 3. If ABC’s perimeter is P, the larger perimeter is 3P,
> so 3P − P = 48 and P = 24.
>
> The ratio parts sum to 12, so ABC’s sides are 6, 8, and 10. The larger
> hypotenuse is 3 × 10 = 30.

> **Trap.** Taking 48 as the larger perimeter, or using the area factor 9
> as the length factor.

> **Try it.** Right triangle ABC has its right angle at C and tan A = 5/12.
> Triangle DEF is similar to triangle ABC, with D, E and F matching A, B
> and C. Triangle DEF has 4 times the area of triangle ABC and a perimeter
> 30 units greater. How long is EF?
>
> **Hint.** tan A = 5/12 fixes the side ratio; the area ratio gives the
> length factor.
>
> **Answer.** 10
>
> tan A = 5/12 gives sides in the ratio 5 : 12 : 13, with BC, the side
> opposite A, as the 5.
>
> The area ratio gives a length factor of √4 = 2, so DEF's perimeter is 2P
> and 2P − P = 30: P = 30. The ratio parts sum to 30, so ABC's sides are 5,
> 12 and 13.
>
> EF matches BC, so EF = 2 × 5 = 10.
