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
solve a system. Hard ones ask how many solutions a system has, make you pick
a constant so that it has none, or hide the system inside a word problem
with two conditions.

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

> **Fails when.** Adding or subtracting doesn't give a multiple of the
> asked expression. For 3x + 2y = 14 and x + 4y = 18, neither the sum
> (4x + 6y = 32) nor the difference (2x − 2y = −4) is a multiple of x + y.
> Solve normally instead (x = 2, y = 4, so x + y = 6). Look for the shortcut
> for five seconds, then move on.

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

## What Hard looks like {#hard}

- A constant chosen so the system has no solution, infinitely many, or exactly one.
- A word problem with two conditions (a total count and a total cost, or a mixture of two concentrations) that you must turn into two equations.
- A graph of two lines with few labels, where you must write both equations before reading the intersection.

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
