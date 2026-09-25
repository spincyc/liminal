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
questions ask you to solve one inequality. Hard ones make you turn a situation
into a system of inequalities, match a shaded graph to its system, or find the
greatest or least whole number that still works.

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

Hard linear-inequality questions rarely need harder algebra. They hide the
setup, so you must decide what the question is before you calculate.

- A situation with two limits (money and time, weight and count) that you must write as a system before anything else.
- A shaded graph and four systems to match it. Check one feature at a time: boundary slopes, intercepts, solid or dashed, which side is shaded.
- A constant to choose. For the system y ≤ 2x + b and y ≥ 2x + 5, the boundaries are parallel, so there is a solution only when the upper line is at or above the lower one: b ≥ 5. Any b < 5 gives no solution.
- A whole-number answer. Solve, round in the direction the inequality allows, and check the neighbor on the other side.

A student-produced response here might ask for "one possible value"; any value
in the range earns credit, so pick a simple one and check it. Entry rules are
in [Format and scoring](learn:sat/general/format-and-scoring#student-produced-responses).
