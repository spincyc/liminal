---
id: sat-math/algebra/linear-inequalities
title: Linear inequalities
section: sat-math
domain: Algebra
skill: Linear inequalities
---
# Linear inequalities

An inequality says one quantity is bigger or smaller than another, so its
answer is a range of values, not a single number. Linear inequalities belong
to Algebra, which is {{fact:sat-math-algebra}} of the Math section.

## Before you start {#before-you-start}

This page builds on solving a linear equation, testing a value in an
inequality, and placing a point against a line. If a check below goes
wrong, rebuild it with
[lesson 2-1, solving equations](lessons.html#common-core-math/8/2-1),
[Algebra, week 4: inequalities](weeks.html#high-school-math/algebra/4) or
[lesson 2-11, y = mx + b](lessons.html#common-core-math/8/2-11).

> **Try it.** Solve 7 − 2x = 15.
>
> **Answer.** x = −4
>
> Subtract 7: −2x = 8. Divide by −2: x = −4. Shaky?
> [Lesson 2-1](lessons.html#common-core-math/8/2-1).

> **Try it.** Is x = −3 a solution of 2x + 9 > 4?
>
> **Answer.** No
>
> Substitute: 2(−3) + 9 = 3, and 3 > 4 is false. Shaky?
> [Algebra, week 4](weeks.html#high-school-math/algebra/4).

> **Try it.** Solve −4x < 20.
>
> **Answer.** x > −5
>
> Dividing by a negative number reverses the sign: x > −5. Test x = 0:
> 0 < 20 is true, and 0 is greater than −5. Shaky?
> [Algebra, week 4](weeks.html#high-school-math/algebra/4).

> **Try it.** Is the point (3, 4) above, on or below the line y = 2x − 1?
>
> **Answer.** Below
>
> At x = 3 the line is at y = 2(3) − 1 = 5. The point's y is 4, and
> 4 < 5, so it is below. Shaky?
> [Lesson 2-11](lessons.html#common-core-math/8/2-11).

## Solve inequalities {#solve-inequalities}

Solve an inequality exactly the way you solve a linear equation (see
[solving linear equations](learn:sat-math/algebra/linear-equations-in-one-variable#solve)),
with one extra rule.

> **Rule.** When you multiply or divide both sides by a negative number, flip
> the inequality sign. Adding or subtracting never flips it, even when the
> number you add is negative.

The reason: multiplying by a negative number reverses order. 2 < 5, but
−2 > −5. Circle every negative coefficient before you divide by it.

> **Example.** Solve 7 − 3x ≥ 19.
>
> Subtract 7 from both sides: −3x ≥ 12.
>
> Divide both sides by −3 and flip the sign: x ≤ −4.
>
> Check a value that should work, x = −5: 7 − 3(−5) = 22, and 22 ≥ 19 is
> true. Check one that shouldn't, x = 0: 7 ≥ 19 is false. The answer is
> x ≤ −4.

> **Try it.** Solve 4 − 5x < 34.
>
> **First step.** Subtract 4 from both sides: −5x < 30. Now finish.
>
> **Answer.** x > −6
>
> Divide both sides by −5 and flip the sign: x > −6.
>
> Check a value that should work, x = 0: 4 < 34 is true. Check one that
> shouldn't, x = −7: 4 + 35 = 39, and 39 < 34 is false.

A compound inequality such as −3 < 2x + 1 ≤ 9 has three parts. Do the same
operation to all three: subtract 1 to get −4 < 2x ≤ 8, then divide by 2 to get
−2 < x ≤ 4.

> **Try it.** How many integers x satisfy −7 ≤ 3x − 1 < 11?
>
> **Answer.** 6
>
> Add 1 to all three parts: −6 ≤ 3x < 12. Divide by 3: −2 ≤ x < 4.
>
> The integers are −2, −1, 0, 1, 2 and 3. The end 4 is left out, because
> x < 4 is strict.

### From words to symbols

| Phrase | Symbol |
| --- | --- |
| at least, no less than, a minimum of | ≥ |
| at most, no more than, a maximum of | ≤ |
| more than, exceeds, above | > |
| less than, under, below | < |

"At least" and "at most" get swapped more than any other pair in this skill.
Say the sentence with a number in it: "at least 30" means 30 is allowed, and
so is 31.

> **Example.** A club has $400 for a trip. The bus costs $120, and each
> museum ticket costs $18. What is the greatest number of tickets the club can
> buy?
>
> Let t be the number of tickets. The total cost is at most $400:
> 120 + 18t ≤ 400.
>
> Subtract 120: 18t ≤ 280. Divide by 18: t ≤ 15.55…
>
> Tickets come in whole numbers, so the greatest number is 15. Check both
> neighbors: 120 + 18(15) = 390, which fits; 120 + 18(16) = 408, which does
> not.

> **Trap.** "Greatest number" with ≤ means round down, even when the decimal
> is .9. Rounding to the nearest whole number gives 16 here, which is over
> budget. For "least number" with ≥, round up.

> **Try it.** An elevator can carry at most 1,500 pounds. A worker who
> weighs 200 pounds rides with boxes that weigh 45 pounds each. What is the
> greatest number of boxes the worker can take in one trip?
>
> **First step.** Let b be the number of boxes. The total weight is at most
> 1,500 pounds: 200 + 45b ≤ 1,500. Now solve and decide how to round.
>
> **Answer.** 28 boxes
>
> Subtract 200: 45b ≤ 1,300. Divide by 45: b ≤ 28.88…
>
> Boxes come in whole numbers, so the greatest number is 28. Check both
> neighbors: 200 + 45(28) = 1,460, which fits; 200 + 45(29) = 1,505, which
> does not.

> **Try it.** A club has raised $350 and sells calendars for $12 each. It
> needs at least $2,000 in all. What is the least number of calendars it
> must sell?
>
> **Answer.** 138 calendars
>
> The total is at least $2,000: 350 + 12c ≥ 2,000. Subtract 350:
> 12c ≥ 1,650. Divide by 12: c ≥ 137.5.
>
> "Least number" with ≥ rounds up: 138. Check: 350 + 12(138) = 2,006,
> which meets the goal; 350 + 12(137) = 1,994, which does not.

### Carrying a range to another expression {#carrying-a-range}

Sometimes the question is not "solve for x" but "what values can 5 − 3x
take?" Solve for x, then build the new expression one operation at a time,
doing each operation to every part. Multiplying by a negative number
reverses the order.

> **Example.** If −1 ≤ x < 3, which values can 5 − 3x take?
>
> Multiply every part by −3 and reverse both signs: 3 ≥ −3x > −9.
>
> Add 5 to every part: 8 ≥ 5 − 3x > −4, which reads −4 < 5 − 3x ≤ 8.
>
> Check the ends: x = −1 gives 8, which is allowed; x = 3 gives −4, which is
> not, because x < 3 is strict.

> **Try it.** If 2 < x ≤ 6, which values can 4 − 2x take?
>
> **Answer.** −8 ≤ 4 − 2x < 0
>
> Multiply every part by −2 and reverse both signs: −4 > −2x ≥ −12.
>
> Add 4 to every part: 0 > 4 − 2x ≥ −8, which reads −8 ≤ 4 − 2x < 0.
>
> Check the ends: x = 6 gives −8, which is allowed; x = 2 gives 0, which is
> not, because 2 < x is strict.

When the x-terms cancel, there is nothing to solve. What is left is a
statement about the constants, and the question is whether it is true (then
every x works) or false (then no x does). For 4(2x + c) ≤ 8x + 6 the
x-terms cancel and leave 4c ≤ 6. The inequality has no solution exactly
when that is false: c > 3/2.

> **Try it.** In 3(2x − k) > 6x − 12, k is a constant. For which values of k
> does the inequality have no solution?
>
> **Answer.** k ≥ 4
>
> Distribute: 6x − 3k > 6x − 12. The x-terms cancel and leave −3k > −12.
>
> No x works exactly when that is false: −3k ≤ −12. Divide by −3 and flip
> the sign: k ≥ 4. Check k = 4: −12 > −12 is false.

A student-produced response here might ask for "one possible value"; any value
in the range earns credit, so pick a simple one and check it. Entry rules are
in [Format and scoring](learn:sat/general/format-and-scoring#student-produced-responses).

For a harder version, see [a percent of a growing total](#percent-of-a-growing-total).

## Systems of inequalities {#systems-of-inequalities}

A system of inequalities is a set of conditions that must all be true at
once. Its solution is the region where the shaded areas overlap. A point is a
solution only if it makes every inequality true, so one failure rules it out.

> **Example.** Which of the points (1, 5), (2, 1) and (4, 0) is a solution of
> the system y ≥ 2x − 3 and x + y < 5?
>
> (1, 5): 5 ≥ 2(1) − 3 = −1 is true, but 1 + 5 = 6 < 5 is false. Not a
> solution.
>
> (2, 1): 1 ≥ 2(2) − 3 = 1 is true, because ≥ allows equality, and
> 2 + 1 = 3 < 5 is true. This point is a solution.
>
> (4, 0): 0 ≥ 2(4) − 3 = 5 is false. Not a solution.

> **Try it.** Which of the points (0, 8), (4, 1) and (2, 5) is a solution of
> the system y ≤ −x + 7 and y > x − 3?
>
> **Answer.** (2, 5)
>
> (0, 8): 8 ≤ −0 + 7 = 7 is false. Not a solution.
>
> (4, 1): 1 ≤ −4 + 7 = 3 is true, but 1 > 4 − 3 = 1 is false, because >
> does not allow equality. Not a solution.
>
> (2, 5): 5 ≤ −2 + 7 = 5 is true, because ≤ allows equality, and
> 5 > 2 − 3 = −1 is true. This point is a solution.

Reading a graph: a solid boundary line means points on the line are included
(≤ or ≥); a dashed line means they are not (< or >). A quick rule is "for
y > mx + b shade above the line, for y < mx + b shade below it."

> **Fails when.** The inequality isn't solved for y yet. In −2y > 4x − 6,
> dividing by −2 flips the sign to y < −2x + 3, so the shading is below the
> line, not above. Rewrite first, or test a point that is not on the boundary,
> such as (0, 0): if it makes the inequality true, shade the side that
> contains it.

> **Desmos.** Type each inequality as given, for example `y>=2x-3` and
> `x+y<5`. Desmos shades each one, and the overlap is the solution region.
> Type a point such as `(2,1)` to see where it lands. More in
> [Desmos for inequalities](learn:sat/general/desmos#inequalities).

Word problems with two unknowns and two limits produce a system. A school
sells adult tickets for $8 and student tickets for $5, needs at least $600,
and has at most 100 seats. With a adult and s student tickets:
8a + 5s ≥ 600 and a + s ≤ 100. The conditions a ≥ 0 and s ≥ 0 usually go
unstated, but they are real.

> **Example.** Using that system, does selling 40 adult and 50 student
> tickets meet the goal? And if all 100 seats sell, what is the least number
> of adult tickets that works?
>
> Money: 8(40) + 5(50) = 320 + 250 = 570, and 570 ≥ 600 is false. So no, even
> though the seat condition holds (40 + 50 = 90 ≤ 100).
>
> All seats sold means s = 100 − a. Substitute: 8a + 5(100 − a) ≥ 600, so
> 3a + 500 ≥ 600, so a ≥ 33.3…
>
> "Least number" with ≥ rounds up: 34 adult tickets. Check: 8(34) + 5(66) =
> 272 + 330 = 602, which meets the goal; 33 adult tickets give 599, which
> does not.

> **Try it.** A bakery sells muffins for $3 and loaves for $7. It needs at
> least $430 in sales and can bake at most 100 items, so 3m + 7b ≥ 430 and
> m + b ≤ 100, where m is muffins and b is loaves. Does selling 60 muffins
> and 30 loaves meet both conditions? And if all 100 items sell, what is the
> least number of loaves that works?
>
> **First step.** Money: 3(60) + 7(30) = 180 + 210 = 390, and 390 ≥ 430 is
> false. So no, even though 60 + 30 = 90 ≤ 100. Now find the least number
> of loaves.
>
> **Answer.** No; 33 loaves.
>
> All 100 items sold means m = 100 − b. Substitute: 3(100 − b) + 7b ≥ 430,
> so 300 + 4b ≥ 430 and b ≥ 32.5.
>
> "Least number" with ≥ rounds up: 33 loaves. Check: 3(67) + 7(33) =
> 201 + 231 = 432, which meets the goal; 32 loaves give 3(68) + 7(32) = 428,
> which does not.

Some questions give the context and ask which system represents it. Write
one inequality per condition, pairing each rate with its own quantity, and
read "at least k times as many A as B" as A ≥ kB.

> **Example.** A florist makes small bouquets with 3 roses each and large
> bouquets with 5 roses each. She has at most 120 roses and wants at least
> twice as many small bouquets as large ones. Which system represents this,
> where s is the number of small bouquets and b the number of large ones?
>
> Roses: 3 for each small bouquet and 5 for each large one, and "at most"
> means ≤: 3s + 5b ≤ 120.
>
> The number of small bouquets is at least 2 times the number of large
> ones: s ≥ 2b.
>
> The system is 3s + 5b ≤ 120 and s ≥ 2b. The traps pair 3 with b, write
> b ≥ 2s, or use < for "at most".

> **Try it.** A school sells T-shirts for $12 and hoodies for $30. It wants
> to collect at least $1,500 and to sell at least three times as many
> T-shirts as hoodies. Which system represents this, where x is the number
> of hoodies sold and y is the number of T-shirts sold?
>
> - A) 12x + 30y ≥ 1,500 and y ≥ 3x
> - B) 30x + 12y ≥ 1,500 and y ≥ 3x
> - C) 30x + 12y ≥ 1,500 and x ≥ 3y
> - D) 30x + 12y > 1,500 and y ≥ 3x
>
> **Answer.** B
>
> x counts hoodies at $30 and y counts T-shirts at $12, so the money is
> 30x + 12y, and "at least" includes $1,500 exactly: 30x + 12y ≥ 1,500.
>
> At least three times as many T-shirts as hoodies: y ≥ 3x. A pairs each
> price with the wrong item, C reverses the comparison, and D leaves out a
> total of exactly $1,500.

### Reading the side and the boundary {#boundary-and-side}

When the region comes as a shaded graph, read each boundary's equation from
two grid points, note whether it is solid (≤ or ≥) or dashed (< or >) and
which side is shaded, and then test points algebraically. Points asked about
often lie off the drawn grid, where the picture can't settle it.

> **Example.** A graph has a dashed boundary through (0, 4) and (2, 0),
> shaded on the side containing (0, 0). What inequality does it represent,
> and is (−3, 10) a solution?
>
> The boundary slope is (0 − 4)/(2 − 0) = −2, so its equation is
> y = −2x + 4. At (0, 0), 0 < 4, so the shaded side is below the line.
> The dashed boundary gives y < −2x + 4.
>
> At (−3, 10), the boundary value is −2(−3) + 4 = 10. The point is on
> the boundary, not below it, so it is excluded even if it lies off the
> drawn grid.

> **Try it.** A graph has a solid boundary through (0, −2) and (3, 4),
> shaded on the side containing (0, 0). What inequality does it represent,
> and is (−10, −21) a solution?
>
> **First step.** The boundary slope is (4 − (−2))/(3 − 0) = 2, so its
> equation is y = 2x − 2. Now decide the side and the sign, then test the
> point.
>
> **Answer.** y ≥ 2x − 2; yes, (−10, −21) is a solution.
>
> At (0, 0), 0 > −2, so the shaded side is above the line. The solid
> boundary gives y ≥ 2x − 2.
>
> At (−10, −21), the boundary value is 2(−10) − 2 = −22, and −21 ≥ −22 is
> true. The point is just above the boundary, so it is a solution.

> **Trap.** Using (0, 0) as a test point when the boundary passes through
> it. A boundary point cannot tell you which side to shade. Choose a point
> away from the line. For a vertical boundary x = c, test left versus right
> directly; there is no above/below rule in y.

For a harder version, see
[the greatest or least value over a region](#region-corner).

## Harder versions {#hard}

The harder questions hide what is being asked: how many must be added to
reach a percent of a growing total, or the greatest or least coordinate over
a region.

### A percent of a growing total {#percent-of-a-growing-total}

When the items you add belong to the group whose percent is asked, the
unknown is in both the part and the whole: part + n ≥ P% of (total + n).
Solve, then round in the direction the question needs.

> **Try it.** A club has 60 members, 9 of whom play chess. It will add only
> members who play chess. What is the least number of members it must add
> so that at least 20% of its members play chess?
>
> **First step.** After adding n chess players, 9 + n of the 60 + n members
> play chess: 9 + n ≥ 0.20(60 + n). Now solve and round.
>
> **Answer.** 4
>
> 9 + n ≥ 12 + 0.2n, so 0.8n ≥ 3 and n ≥ 3.75. The least whole number is 4.
>
> Check: 13 of 64 members is about 20.3%, but 12 of 63 is about 19.0%.
> Taking 20% of the current 60 members gives n ≥ 3, the trap answer.

### The greatest or least value over a region {#region-corner}

When a question asks for the greatest or least possible x (or y) of a point
in the solution region, first check whether the region is bounded in that
direction. For two crossing lines with y required to be above one and below
the other, their intersection gives the limiting x-value: past it, the lower
bound exceeds the upper bound. That limit is attained only if the boundary
conditions include a point there.

> **Example.** The point (a, b) lies in the solution region of y ≥ 2x − 4
> and y ≤ −x + 11. What is the greatest possible value of a?
>
> The boundaries cross where 2x − 4 = −x + 11: 3x = 15, so x = 5 and
> y = 6.
>
> For x > 5 the floor 2x − 4 is above the ceiling −x + 11 (at x = 6 they
> are 8 and 5), so nothing fits. The greatest a is 5, at the corner (5, 6).

> **Trap.** Using one boundary's intercept, such as x = 2 where y = 2x − 4
> meets the x-axis, or giving the corner's y-coordinate when x was asked.

> **Fails when.** The region is open in the direction asked. Here y has no
> greatest value: far to the left, −x + 11 is as large as you like. It also
> fails when either inequality is strict (the corner itself is excluded,
> so there is no greatest value) or the boundaries are parallel (there is no
> corner).

> **Try it.** The point (a, b) lies in the solution region of y ≤ 3x + 2
> and y ≥ −x + 14. What is the least possible value of a?
>
> **First step.** The boundaries cross where 3x + 2 = −x + 14: 4x = 12, so
> x = 3 and y = 11. Now decide on which side of x = 3 the region has room.
>
> **Answer.** 3
>
> For x < 3 the floor −x + 14 is above the ceiling 3x + 2 (at x = 2 they
> are 12 and 8), so nothing fits.
>
> Both boundaries are included (≤ and ≥), so the corner (3, 11) is in the
> region, and the least a is 3.
