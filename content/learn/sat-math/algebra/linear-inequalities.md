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
to Algebra, which is {{fact:sat-math-algebra}} of the Math section. Easy
questions ask you to solve one inequality. Hard ones ask for the greatest or
least coordinate over a region, work from a shaded graph to points off its
grid, or turn an inequality into a condition on a constant or on another
expression.

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

A compound inequality such as −3 < 2x + 1 ≤ 9 has three parts. Do the same
operation to all three: subtract 1 to get −4 < 2x ≤ 8, then divide by 2 to get
−2 < x ≤ 4.

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

When the x-terms cancel, there is nothing to solve. What is left is a
statement about the constants, and the question is whether it is true (then
every x works) or false (then no x does). For 4(2x + c) ≤ 8x + 6 the
x-terms cancel and leave 4c ≤ 6. The inequality has no solution exactly
when that is false: c > 3/2.

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

### The greatest or least value over a region {#region-corner}

When a question asks for the greatest or least possible x (or y) of a point
in the solution region and gives no other value, neither boundary alone
answers it. The extreme is at the corner where the two boundary lines
cross: past that corner, the line the point must stay above is above the
line it must stay below, so no point fits.

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
> fails when both inequalities are strict (the corner itself is excluded,
> so there is no greatest value) or the boundaries are parallel (there is no
> corner).

When the region comes as a shaded graph, read each boundary's equation from
two grid points, note whether it is solid (≤ or ≥) or dashed (< or >) and
which side is shaded, and then test points algebraically. Points asked about
often lie off the drawn grid, where the picture can't settle it.

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

## What Hard looks like {#hard}

Hard linear-inequality questions rarely need harder algebra. They hide what
is being asked, so you must decide what the question is before you
calculate.

- The greatest or least x or y over the region of two inequalities, with no value given. It is at the corner where the boundaries cross (see [the greatest or least value over a region](#region-corner)).
- A shaded graph and a point off the grid, such as (−18, k): write each boundary's inequality from the graph, then work with it, minding solid against dashed.
- A condition on a constant: the x-terms cancel and what is left must be true for every x or false for all. For the system y ≤ 2x + b and y ≥ 2x + 5, the boundaries are parallel, so there is a solution only when b ≥ 5.
- A range carried to another expression, such as the values of 7 − 2x when 0 < x < 5, where a negative multiplier reverses the order (see [carrying a range](#carrying-a-range)).

A student-produced response here might ask for "one possible value"; any value
in the range earns credit, so pick a simple one and check it. Entry rules are
in [Format and scoring](learn:sat/general/format-and-scoring#student-produced-responses).
