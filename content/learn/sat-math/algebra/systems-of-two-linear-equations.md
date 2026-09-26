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
{{fact:sat-math-algebra}} of the Math section. Easy questions ask you to
solve a system. Hard ones make the constants the unknowns, give the lines
only as a graph whose crossing is between grid points, or hide the system
inside a mixture.

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

> **Example.** Solve 3x + 2y = 16 and 5x − 2y = 8.
>
> The y coefficients are opposites, so add the equations: 8x = 24, x = 3.
>
> Substitute: 3(3) + 2y = 16, so 2y = 7 and y = 3.5.

> **Desmos.** Type both equations exactly as given, for example `3x+2y=16`
> and `5x-2y=8`; you don't need to solve for y. Click the intersection to
> read (3, 3.5). See [Desmos for systems](learn:sat/general/desmos#systems).

Sometimes the question asks for a combination such as x + y, not for x and
y. Adding or subtracting the equations can give it directly.

> **Example.** If 2x + 3y = 11 and 4x + 5y = 19, what is x + y?
>
> Subtract the first equation from the second: (4x − 2x) + (5y − 3y) =
> 19 − 11, so 2x + 2y = 8.
>
> Divide by 2: x + y = 4. (Solving fully gives x = 1 and y = 3, which
> agrees.)

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

> **Example.** The system 3x + ky = 12 and 6x + 10y = 7 has no solution. What
> is k?
>
> No solution needs equal slopes, so the x and y coefficient ratios match:
> 3/6 = k/10, which gives k = 5.
>
> Confirm the lines are different: 12/7 is not equal to 3/6. So k = 5.

> **Example.** The system 2x − 3y = 8 and −4x + 6y = c has infinitely many
> solutions. What is c?
>
> Infinitely many means the second equation is a multiple of the first.
> −4x + 6y is −2 times 2x − 3y, so c = −2 · 8 = −16.
>
> The traps are 16 (sign error) and 8 (copying the constant).

A useful cue: "for what value of k" with two linear equations points to this
table, so compare coefficient ratios.

> **Fails when.** One of the equations isn't linear (x², √x, xy). Then the
> question is about where a line meets a curve, and the tool is usually the
> discriminant; see [systems of equations](learn:sat-math/advanced-math/systems-of-equations#linear-quadratic-systems).
> It also fails when the question asks for exactly one solution: then every
> k works except the one that makes the slopes equal.

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

> **Example.** The system ax + 4y = 10 and 3x + by = 5 has infinitely many
> solutions. What are a and b?
>
> The constants 10 and 5 are both known, so the multiple is 10 ÷ 5 = 2: the
> first equation is 2 times the second.
>
> a = 2 · 3 = 6, and 4 = 2 · b, so b = 2.

> **Trap.** Comparing coefficients before the equations are in the same
> form. In 12y = c − ax, the x-term is really +ax on the left: rewrite it as
> ax + 12y = c first.

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

> **Trap.** Answering with the wrong coordinate. If the question asks "how
> much does each plan cost when they are equal", the answer is 45, not 300.
> Circle what is asked before you solve.

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

> **Fails when.** k isn't simply the slope. In kx + y = 3 the slope is −k:
> rewrite it as y = −kx + 3 first. And y = kx − k = k(x − 1) turns about
> (1, 0), not about a point on the y-axis.

## What Hard looks like {#hard}

- Two unknown constants: a known solution to substitute, or a condition (no solution, infinitely many) that fixes a multiple between the equations (see [two unknown constants](#two-unknown-constants)).
- Two graphed lines that cross between grid points. The graph gives only an estimate: read each line's equation from two grid points it passes through, then solve the system exactly.
- A mixture or blend: one equation counts the amounts and the other counts what they contain (salt, copper, value). When something is added, the total changes too.
- A line y = kx + q and a fixed line whose crossing must land in a given quadrant: which k could work, or the greatest or least integer k. The line turns about (0, q), and the ends of the range are left out (see [where the crossing lands](#crossing-region)).

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
