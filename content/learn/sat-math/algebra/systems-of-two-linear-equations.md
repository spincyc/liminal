---
id: sat-math/algebra/systems-of-two-linear-equations
title: Systems of two linear equations
section: sat-math
domain: Algebra
skill: Systems of two linear equations
---
# Systems of two linear equations

A system is two equations that must both be true. Its solution is the point
where the two lines cross. This skill is part of Algebra,
{{fact:sat-math-algebra}} of the Math section.

## Before you start {#before-you-start}

This page builds on solving an equation with parentheses, checking a point
in an equation, and setting two costs equal. If a check below goes wrong,
rebuild it with
[lesson 2-3, distributing](lessons.html#common-core-math/8/2-3),
[Grade 8, week 16: systems as intersections](weeks.html#common-core-math/8/16)
or [lesson 2-6, comparing plans](lessons.html#common-core-math/8/2-6).

> **Try it.** Solve 3x + 2(x − 4) = 17.
>
> **Answer.** x = 5
>
> Distribute: 3x + 2x − 8 = 17, so 5x − 8 = 17. Add 8: 5x = 25, so x = 5.
> Shaky? [Lesson 2-3](lessons.html#common-core-math/8/2-3).

> **Try it.** Is (2, −1) a solution of both 3x + y = 5 and x − 2y = 4?
>
> **Answer.** Yes
>
> First equation: 3(2) + (−1) = 5. Second: 2 − 2(−1) = 4. Both are true,
> so the point is on both lines. Shaky?
> [Grade 8, week 16](weeks.html#common-core-math/8/16).

> **Try it.** Plan A costs $20 plus $3 per visit. Plan B costs $5 per visit.
> After how many visits do the plans cost the same?
>
> **Answer.** 10 visits
>
> Set the costs equal: 20 + 3v = 5v, so 20 = 2v and v = 10. Each plan then
> costs $50. Shaky? [Lesson 2-6](lessons.html#common-core-math/8/2-6).

## Solve systems {#solve-systems}

Three methods, all correct. Choose by the shape of the equations.

- Substitution: best when one variable is already alone, as in y = 2x − 1.
- Elimination: best when a variable has equal or opposite coefficients, or can be made to.
- Graphing: type both equations into Desmos and click the crossing point.

> **Example.** Solve y = 2x − 1 and 4x + 3y = 37.
>
> Substitute the first into the second: 4x + 3(2x − 1) = 37.
>
> Distribute and combine: 4x + 6x − 3 = 37, so 10x = 40 and x = 4.
>
> Back-substitute: y = 2(4) − 1 = 7. Check in the second equation:
> 4(4) + 3(7) = 16 + 21 = 37. The solution is (4, 7).

> **Try it.** Solve y = 3x + 2 and 5x − 2y = −7.
>
> **First step.** Substitute the first into the second:
> 5x − 2(3x + 2) = −7. Now finish.
>
> **Answer.** (3, 11)
>
> Distribute and combine: 5x − 6x − 4 = −7, so −x = −3 and x = 3.
>
> Back-substitute: y = 3(3) + 2 = 11. Check in the second equation:
> 5(3) − 2(11) = 15 − 22 = −7.

> **Example.** Solve 3x + 2y = 16 and 5x − 2y = 8.
>
> The y coefficients are opposites, so add the equations: 8x = 24, x = 3.
>
> Substitute: 3(3) + 2y = 16, so 2y = 7 and y = 3.5.

> **Try it.** Solve 4x + 3y = −1 and 5x − 3y = 19.
>
> **Answer.** (2, −3)
>
> The y coefficients are opposites, so add the equations: 9x = 18, x = 2.
>
> Substitute: 4(2) + 3y = −1, so 3y = −9 and y = −3.

> **Desmos.** Type both equations exactly as given, for example `3x+2y=16`
> and `5x-2y=8`; you don't need to solve for y. Click the intersection to
> read (3, 3.5). See [Desmos for systems](learn:sat/general/desmos#systems).

> **Try it.** Solve 2x + 3y = 12 and 5x − 6y = 3.
>
> **Hint.** Make the y coefficients opposites first.
>
> **Answer.** (3, 2)
>
> Multiply the first equation by 2: 4x + 6y = 24. Add it to the second:
> 9x = 27, so x = 3.
>
> Substitute: 2(3) + 3y = 12, so y = 2. Check: 5(3) − 6(2) = 3.

Word problems need a model first. In a mixture, one equation counts the
amounts and the other counts what they contain.

> **Example.** A lab mixes a 10% salt solution with a 40% salt solution to
> make 30 liters of a 20% solution. How many liters of the 10% solution does
> it use?
>
> Let x and y be liters of the 10% and 40% solutions. Volume: x + y = 30.
> Salt: 0.10x + 0.40y = 0.20(30) = 6.
>
> Substitute y = 30 − x: 0.10x + 12 − 0.40x = 6, so −0.30x = −6 and x = 20.
>
> Check: 20 liters of 10% and 10 liters of 40% hold 2 + 4 = 6 liters of
> salt, which is 20% of 30.

> **Try it.** A jeweler melts together a 30% silver alloy and a 75% silver
> alloy to make 90 grams of a 60% silver alloy. How many grams of the 30%
> alloy does she use?
>
> **First step.** Let x and y be grams of the 30% and 75% alloys. Amount:
> x + y = 90. Silver: 0.30x + 0.75y = 0.60(90) = 54. Now solve.
>
> **Answer.** 30 grams
>
> Substitute y = 90 − x: 0.30x + 67.5 − 0.75x = 54, so −0.45x = −13.5 and
> x = 30.
>
> Check: 30 grams of 30% and 60 grams of 75% hold 9 + 45 = 54 grams of
> silver, which is 60% of 90.

Sometimes the question asks for a combination such as x + y, not for x and
y. Adding or subtracting the equations can give it directly.

> **Example.** If 2x + 3y = 11 and 4x + 5y = 19, what is x + y?
>
> Subtract the first equation from the second: (4x − 2x) + (5y − 3y) =
> 19 − 11, so 2x + 2y = 8.
>
> Divide by 2: x + y = 4. (Solving fully gives x = 1 and y = 3, which
> agrees.)

> **Try it.** If 7x + 3y = 25 and 2x + 8y = 20, what is the value of
> x − y?
>
> **Answer.** 1
>
> Subtract the second equation from the first: (7x − 2x) + (3y − 8y) =
> 25 − 20, so 5x − 5y = 5.
>
> Divide by 5: x − y = 1. You never need x and y themselves.

> **Fails when.** Plain adding or subtracting doesn't give a multiple of the
> asked expression. For 3x + 2y = 14 and x + 4y = 18, neither the sum
> (4x + 6y = 32) nor the difference (2x − 2y = −4) is a multiple of x + y.
> Try a multiple of one equation: 3 times the first plus the second is
> 10x + 10y = 60, so x + y = 6. To find the 3, ask what p makes the two
> coefficients of p(3x + 2y) + (x + 4y) equal: 3p + 1 = 2p + 4, so p = 3.
> If no small multiple shows up in a few seconds, solve for x and y instead
> (x = 2, y = 4).

### How many solutions?

For a₁x + b₁y = c₁ and a₂x + b₂y = c₂:

| Case | Condition | Graph |
| --- | --- | --- |
| One solution | a₁/a₂ ≠ b₁/b₂ (different slopes) | the lines cross once |
| No solution | a₁/a₂ = b₁/b₂ ≠ c₁/c₂ | parallel lines |
| Infinitely many | a₁/a₂ = b₁/b₂ = c₁/c₂ | the same line twice |

The table assumes its denominators are nonzero. When one is zero, compare
cross-products instead: a₁b₂ ≠ a₂b₁ gives one solution; matching that pair
and both constant pairs gives the same line. Here each equation must
actually define a line, with at least one nonzero variable coefficient.

> **Example.** The system 3x + ky = 12 and 6x + 10y = 7 has no solution. What
> is k?
>
> No solution needs equal slopes, so the x and y coefficient ratios match:
> 3/6 = k/10, which gives k = 5.
>
> Confirm the lines are different: 12/7 is not equal to 3/6. So k = 5.

> **Try it.** The system 4x − ky = 9 and 10x + 15y = 2 has no solution.
> What is k?
>
> **Answer.** k = −6
>
> No solution needs equal coefficient ratios: 4/10 = −k/15, so −k = 6 and
> k = −6.
>
> Confirm the lines are different: 9/2 is not equal to 4/10. So k = −6.

> **Example.** The system 2x − 3y = 8 and −4x + 6y = c has infinitely many
> solutions. What is c?
>
> Infinitely many means the second equation is a multiple of the first.
> −4x + 6y is −2 times 2x − 3y, so c = −2 · 8 = −16.
>
> The traps are 16 (sign error) and 8 (copying the constant).

> **Try it.** The system 2x − 5y = 7 and −6x + 15y = c has infinitely many
> solutions. What is c?
>
> **Answer.** c = −21
>
> −6x + 15y is −3 times 2x − 5y, so c = −3 · 7 = −21.

A useful cue: "for what value of k" with two linear equations points to this
table, so compare coefficient ratios.

> **Fails when.** One of the equations isn't linear (x², √x, xy). Then the
> question is about where a line meets a curve, and the tool is usually the
> discriminant; see [systems of equations](learn:sat-math/advanced-math/systems-of-equations#linear-quadratic-systems).
> For exactly one solution, look for unequal slopes instead. In the
> 3x + ky = 12 example, every k except 5 works; more general parameter
> formulas need their own coefficient comparison.

### Two unknown constants {#two-unknown-constants}

When a system has two letters besides x and y, those letters are the
unknowns. Put both equations in the same form first (x-term, y-term,
constant), then use what the question gives:

- A known solution: substitute it. The system becomes two equations in the constants.
- Infinitely many solutions: one equation is a multiple of the other, and a pair of matching numbers you already know fixes the multiple.
- No solution: the x- and y-coefficients keep that multiple, and the constants break it.

> **Example.** The system ax + by = 7 and bx − ay = 4 has the solution
> (2, 1). What are a and b?
>
> Substitute x = 2 and y = 1: 2a + b = 7 and 2b − a = 4.
>
> From the first, b = 7 − 2a. Then 2(7 − 2a) − a = 4, so 14 − 5a = 4, a = 2
> and b = 3.
>
> Check: 2(2) + 3(1) = 7 and 3(2) − 2(1) = 4.

> **Try it.** The system ax + by = 5 and ax − by = 11 has the solution
> (2, 1). What are a and b?
>
> **First step.** Substitute x = 2 and y = 1: 2a + b = 5 and 2a − b = 11.
> Now solve for a and b.
>
> **Answer.** a = 4 and b = −3
>
> Add the two equations: 4a = 16, so a = 4. Then 2(4) + b = 5, so b = −3.
>
> Check: 4(2) + (−3)(1) = 5 and 4(2) − (−3)(1) = 11.

> **Example.** The system ax + 4y = 10 and 3x + by = 5 has infinitely many
> solutions. What are a and b?
>
> The constants 10 and 5 are both known, so the multiple is 10 ÷ 5 = 2: the
> first equation is 2 times the second.
>
> a = 2 · 3 = 6, and 4 = 2 · b, so b = 2.

> **Try it.** The system 6x + by = 15 and ax − 2y = 5 has infinitely many
> solutions. What are a and b?
>
> **Answer.** a = 2 and b = −6
>
> The constants 15 and 5 are both known, so the multiple is 15 ÷ 5 = 3: the
> first equation is 3 times the second.
>
> 6 = 3 · a, so a = 2, and b = 3 · (−2) = −6.

> **Trap.** Comparing coefficients before the equations are in the same
> form. In 12y = c − ax, the x-term is really +ax on the left: rewrite it as
> ax + 12y = c first.

> **Try it.** The system 2x + 3y = 7 and 12y = c − ax has infinitely many
> solutions. What are a and c?
>
> **Answer.** a = 8 and c = 28
>
> Rewrite the second equation as ax + 12y = c. Its y-coefficient is 4 times
> the first one's, so the whole equation is 4 times the first: a = 4 · 2 = 8
> and c = 4 · 7 = 28.

For a harder version, see
[the same constant in several coefficients](#coupled-coefficients).

## Interpret intersection {#interpret-intersection}

In a context, the intersection is where the two quantities are equal: two
plans cost the same, two tanks hold the same amount, two runners are at the
same place. Its x-coordinate says when (or at what input), and its
y-coordinate says what the shared value is.

> **Example.** Plan A costs $30 a month plus $0.05 per minute. Plan B costs
> $0.15 per minute with no monthly fee. The two cost lines cross at one
> point. What is it, and what does it mean?
>
> Plan A: C = 30 + 0.05m. Plan B: C = 0.15m.
>
> Set them equal: 30 + 0.05m = 0.15m, so 30 = 0.10m and m = 300.
>
> C = 0.15(300) = 45. The point (300, 45) means that at 300 minutes both
> plans cost $45. Below 300 minutes Plan B is cheaper; above it, Plan A is.

> **Try it.** Shop A rents bikes for $12 plus $3 per hour. Shop B charges $5
> per hour with no fee. The two cost lines cross at one point. What is it,
> and what does it mean?
>
> **Answer.** (6, 30): at 6 hours, both shops charge $30.
>
> Shop A: C = 12 + 3h. Shop B: C = 5h.
>
> Set them equal: 12 + 3h = 5h, so 12 = 2h and h = 6. C = 5(6) = 30.
>
> Below 6 hours Shop B is cheaper; above it, Shop A is.

> **Trap.** Answering with the wrong coordinate. If the question asks "how
> much does each plan cost when they are equal", the answer is 45, not 300.
> Circle what is asked before you solve.

When two graphed lines cross between grid points, read each line's equation
from two grid points and solve; don't estimate the crossing.

> **Try it.** Line ℓ passes through (0, 1) and (2, 3). Line m passes through
> (0, 7) and (2, 1). The lines intersect at (a, b). What is the value of a?
>
> **Answer.** 3/2
>
> Line ℓ has slope (3 − 1)/2 = 1, so y = x + 1. Line m has slope
> (1 − 7)/2 = −3, so y = −3x + 7.
>
> Set them equal: x + 1 = −3x + 7, so 4x = 6 and x = 3/2. The crossing is
> (3/2, 5/2), between grid points.

For a harder version, see [where the crossing lands](#crossing-region).

## Harder versions {#hard}

The harder questions put an unknown constant where it does the most work:
in several coefficients at once, or in a line whose crossing must land in a
given quadrant.

### The same constant in several coefficients {#coupled-coefficients}

When the same constant occurs in several coefficients, the scale factor may
not be known at the start. Compare coefficient cross-products, solve for the
constant, and only then find the factor and match the right sides.

> **Example.** The system ax + (a − 4)y = 12 and
> (a + 6)x + ay = b has infinitely many solutions. What is a + b?
>
> Proportional coefficients require a · a = (a − 4)(a + 6).
> Expanding gives a² = a² + 2a − 24, so 2a = 24 and a = 12.
>
> The equations are now 12x + 8y = 12 and 18x + 12y = b. The second
> left side is 3/2 times the first, so b = (3/2)(12) = 18.
> Therefore a + b = 12 + 18 = 30.
>
> Check: dividing the equations by 4 and 6 gives the same line,
> 3x + 2y = 3. If b were any other value, the lines would be distinct.

> **Try it.** The system ax + (a + 3)y = 15 and (a − 2)x + ay = b has
> infinitely many solutions. What is b?
>
> **First step.** Proportional coefficients require a · a = (a + 3)(a − 2).
> Expanding gives a² = a² + a − 6, so a = 6. Now find b.
>
> **Answer.** b = 10
>
> The equations are now 6x + 9y = 15 and 4x + 6y = b. The second left side
> is 2/3 of the first, so b = (2/3)(15) = 10.
>
> Check: dividing the equations by 3 and 2 gives the same line,
> 2x + 3y = 5.

### Where the crossing lands {#crossing-region}

A line y = kx + q passes through (0, q) whatever k is, so changing k turns
it about that point. When a question asks which k puts the crossing with a
fixed line in a given quadrant:

1. Find the part of the fixed line inside that quadrant, using its intercepts.
2. Turn the line about (0, q) from one end of that part to the other. The slopes at the two ends bound k.
3. Leave out an end on an axis, since a strict inequality such as b < 0 excludes it, and a slope equal to the fixed line's, since parallel lines never meet. An end on the y-axis makes the turning line vertical, so k has no limit on that side.

> **Example.** In the xy-plane, the lines y = 2x + 4 and y = kx − 2, where
> k is a constant, intersect at (a, b), where a < 0 and b < 0. What are the
> possible values of k?
>
> The fixed line crosses the axes at (−2, 0) and (0, 4). Its part with
> a < 0 and b < 0 is everything beyond (−2, 0), heading down and left.
>
> From (0, −2), the line to (−2, 0) has slope (0 − (−2))/(−2 − 0) = −1.
> Farther out along the fixed line, the slope approaches the fixed line's
> own slope, 2, which it never reaches.
>
> So −1 < k < 2. Check k = 1: 2x + 4 = x − 2 gives x = −6 and y = −8, both
> negative.
>
> By algebra: 2x + 4 = kx − 2 gives x = 6/(k − 2). Then a < 0 needs k < 2,
> and b = 2x + 4 < 0 needs x < −2, which gives k > −1.

> **Trap.** Including an end. At k = −1 the lines meet at (−2, 0), where
> b = 0, not less than 0; at k = 2 they are parallel. The greatest integer k
> here is 1, not 2.

> **Try it.** In the xy-plane, the lines y = −x + 3 and y = kx + 1, where k
> is a constant, intersect at (a, b), where a > 0 and b > 0. What are the
> possible values of k?
>
> **First step.** The fixed line crosses the axes at (3, 0) and (0, 3), so
> its part with a > 0 and b > 0 is the segment between them, without its
> ends. Now turn y = kx + 1 about (0, 1) from one end to the other.
>
> **Answer.** k > −1/3
>
> From (0, 1), the line to (3, 0) has slope (0 − 1)/(3 − 0) = −1/3. The
> other end, (0, 3), is on the y-axis above (0, 1), so the turning line
> approaches vertical there and k has no upper limit.
>
> So k > −1/3. Check k = 0: −x + 3 = 1 gives x = 2 and y = 1, both
> positive.
>
> By algebra: −x + 3 = kx + 1 gives x = 2/(k + 1). Then a > 0 needs
> k > −1, and b = 3 − x > 0 needs x < 3, which gives k > −1/3.

> **Fails when.** k isn't simply the slope. In kx + y = 3 the slope is −k:
> rewrite it as y = −kx + 3 first. And y = kx − k = k(x − 1) turns about
> (1, 0), not about a point on the y-axis.
