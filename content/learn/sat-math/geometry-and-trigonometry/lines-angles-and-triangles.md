---
id: sat-math/geometry-and-trigonometry/lines-angles-and-triangles
title: Lines, angles, and triangles
section: sat-math
domain: Geometry and Trigonometry
skill: Lines, angles, and triangles
---
# Lines, angles, and triangles

This skill covers the angle facts from lines crossing, parallel lines cut by
a transversal, triangle angle sums, isosceles triangles, congruent and
similar triangles. It belongs to Geometry and Trigonometry,
{{fact:sat-math-geometry}} of the Math section. Most questions come with a
figure. Label every angle and length you know on your scratch paper before
you compute. Hard questions hide a reversed similarity correspondence or connect the
angles of two regular polygons. A direct altitude-to-hypotenuse proportion
or a single polygon’s angle ratio is Medium.

## Angle relationships {#angle-relationships}

| Fact | Measure |
| --- | --- |
| Angles on a straight line | add to 180° |
| Angles around a point | add to 360° |
| Vertical angles (opposite, where two lines cross) | equal |
| Complementary angles | add to 90° |
| Supplementary angles | add to 180° |

When a transversal crosses two parallel lines, corresponding angles and
alternate interior angles are equal, and same-side interior angles add to
180°. So every angle at the two crossings is one of just two measures, and
those two add to 180°.

> **Fails when.** The lines aren't given as parallel (stated, or marked with
> arrows). Lines that look parallel may not be, and then none of these
> equalities holds. It also fails with two different transversals: each
> transversal makes its own pair of measures.

> **Example.** Lines m and n are parallel, cut by a transversal. Two
> same-side interior angles measure (3x + 10)° and (5x − 30)°. Find both
> angles.
>
> Same-side interior angles are supplementary: (3x + 10) + (5x − 30) = 180.
>
> 8x − 20 = 180, so x = 25. The angles are 85° and 95°, which add to 180°.
>
> If the angles had been alternate interior instead, they would be equal:
> 3x + 10 = 5x − 30 gives x = 20. Name the relationship before you write an
> equation.

The interior angles of a polygon with n sides add to (n − 2) · 180°, so a
pentagon's add to 540°.

### Exterior angles and regular polygons {#exterior-angles}

At each corner of a polygon, the exterior angle is the turn you make walking
around it, and it adds to the interior angle to make 180°. Walking once
around any polygon turns you through 360°, so the exterior angles add to
360°, whatever the number of sides.

In a regular polygon with n sides every exterior angle is 360°/n, so
n = 360 ÷ (one exterior angle). Turn any condition into a statement about
the exterior angle first.

> **Example.** Each interior angle of a regular polygon is 5 times each
> exterior angle. How many sides does it have?
>
> Let the exterior angle be e. Then 5e + e = 180, so e = 30°.
>
> n = 360 ÷ 30 = 12 sides. Check with the interior sum: (12 − 2) · 180 =
> 1,800, and 1,800 ÷ 12 = 150 = 5 · 30.

> **Trap.** Stopping at 30°, which is the angle, not the count, or dividing
> 180 by it, which counts only half the turn.

When neither polygon’s side count is known, a difference between the counts
and a difference between the angles can form a quadratic equation. The
exterior angle depends on the reciprocal of the count, not on its difference.

> **Example.** Regular polygon P has 4 more sides than regular polygon Q.
> Each interior angle of P is 24° greater than each interior angle of Q.
> How many sides does P have?
>
> If Q has n sides, P has n + 4. Their exterior angles are 360/n and
> 360/(n + 4). The larger interior angle has the smaller exterior angle,
> so 360/n − 360/(n + 4) = 24.
>
> Combine the fractions: 1,440/(n(n + 4)) = 24, so n(n + 4) = 60.
> Then n² + 4n − 60 = (n − 6)(n + 10) = 0.
>
> Reject n = −10 because a polygon cannot have a negative number of sides.
> Q has 6 sides, so P has 6 + 4 = 10.

> **Trap.** Dividing 360 by 24 treats the difference as an exterior angle.
> Giving 6 stops at Q’s side count instead of answering about P.

## Similarity {#similarity}

Two triangles are similar when their angles match; two pairs of equal angles
are enough (AA). Similar triangles have proportional sides: every side of one
is k times the matching side of the other, and the angles are unchanged.
Look for a line drawn parallel to one side of a triangle, or two right
triangles that share an angle.

> **Example.** In triangle ABC, point D is on AB and point E is on AC, with
> DE parallel to BC. AD = 4, DB = 6 and DE = 5. Find BC.
>
> DE ∥ BC, so triangle ADE is similar to triangle ABC (they share angle A,
> and the parallel lines make the other angles equal).
>
> Match the sides: AD corresponds to AB = 4 + 6 = 10, so k = 10/4 = 2.5.
>
> BC = 2.5 × DE = 2.5 × 5 = 12.5. The trap answer is 7.5, from using DB
> instead of AB.

> **Example.** A 6-foot person casts a 4-foot shadow at the same time that a
> flagpole casts a 22-foot shadow. How tall is the flagpole?
>
> The sun's rays make the same angle, so the triangles are similar:
> 6/4 = h/22.
>
> h = 6 · 22/4 = 33 feet.

### Similar triangles that aren't a parallel cut {#matching-by-angles}

Match similar triangles by their equal angles, never by where they sit on
the page. Two cases come up often.

A segment inside a triangle can cut off a similar triangle without being
parallel to the third side.

> **Example.** In triangle ABC, D is on AB and E is on AC, and angle AED
> has the same measure as angle B. If AD = 6, AE = 4, AB = 12 and BC = 15,
> how long is DE?
>
> The triangles AED and ABC share angle A, and angle E matches angle B, so
> they are similar with E matching B and D matching C.
>
> So AE pairs with AB: the scale factor is 4/12 = 1/3. DE pairs with BC, so
> DE = 15/3 = 5.
>
> AD pairs with AC, so AC = 3 · 6 = 18. The side ratios 4/12, 6/18 and 5/15
> all equal 1/3, which confirms the matching.

> **Fails when.** You use the side-splitter proportion (AD/AB = AE/AC).
> That holds only for a segment parallel to BC. Here DE is not parallel to
> BC, so pair sides by the matching angles instead.

The altitude to the hypotenuse of a right triangle splits it into two
triangles, each similar to the whole triangle and to each other. Matching
their angles gives:

- The altitude squared equals the product of the two pieces of the hypotenuse.
- Each leg squared equals the whole hypotenuse times the piece next to that leg.

> **Example.** In right triangle ABC the right angle is at C, and the
> altitude from C meets the hypotenuse AB at D. If AD = 4 and DB = 9, how
> long is CD, and how long is AC?
>
> Triangles ADC and CDB are similar, so AD/CD = CD/DB and CD² = 4 · 9 = 36.
> CD = 6.
>
> Triangle ADC is similar to triangle ACB, so AD/AC = AC/AB and
> AC² = 4 · 13 = 52. AC = 2√13.
>
> Check with the Pythagorean theorem in triangle ADC: 4² + 6² = 52.

> **Trap.** Trying the Pythagorean theorem alone. With only AD and DB known,
> each right triangle has two unknown sides; similarity is what connects
> them.

## Triangle geometry {#triangle-geometry}

| Fact | |
| --- | --- |
| Angle sum | 180° |
| Exterior angle | equals the sum of the two interior angles not next to it |
| Isosceles triangle | the angles opposite the equal sides are equal |
| Side and angle order | the longest side is opposite the largest angle |
| Triangle inequality | each side is less than the sum of the other two |
| Congruent triangles | SSS, SAS, ASA or AAS guarantee all parts match |

> **Example.** An isosceles triangle has a 40° angle between its two equal
> sides. An exterior angle is formed by extending the base. Find the base
> angles and that exterior angle.
>
> Base angles are equal: 2b + 40 = 180, so each is 70°.
>
> The exterior angle next to a base angle is 180 − 70 = 110°. Check with the
> exterior angle fact: it equals 40 + 70 = 110°.

> **Example.** Two sides of a triangle are 7 and 12. How many whole-number
> lengths are possible for the third side?
>
> The third side must be greater than 12 − 7 = 5 and less than 12 + 7 = 19.
>
> Whole numbers from 6 through 18: 18 − 6 + 1 = 13 lengths.

On the SAT, figures are drawn to scale unless a note says otherwise, so you
can use one to check a result: an angle that looks acute can't be 120°.

> **Fails when.** The figure carries a "not drawn to scale" note, or the
> choices are close together. Estimation only rules out answers that are far
> off; it never picks between 70° and 75°.

## What Hard looks like {#hard}

- A segment across a triangle that makes a marked angle equal to one of the triangle's angles, but is not parallel to the third side. Pair the vertices by the equal angles, not by position.
- Two regular polygons have unknown side counts linked by an additive difference, and their interior angles differ by a given amount. Combine the reciprocal exterior-angle formulas to obtain a quadratic, then reject any impossible side count (see [exterior angles and regular polygons](#exterior-angles)).
