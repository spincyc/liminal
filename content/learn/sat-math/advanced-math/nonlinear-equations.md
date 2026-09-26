---
id: sat-math/advanced-math/nonlinear-equations
title: Nonlinear equations
section: sat-math
domain: Advanced Math
skill: Nonlinear equations
---
# Nonlinear equations

A nonlinear equation has its variable squared, under a root, inside an
absolute value or in a denominator, so it can have two solutions, one, or
none. This skill is part of Advanced Math, {{fact:sat-math-advanced}} of the
Math section. Easy questions ask you to solve a factorable quadratic. Hard
ones ask for the sum or product of the solutions without the solutions, ask
how many solutions an equation has once denominators or absolute values are
dealt with, or make you check which cases survive.

## Quadratic equations {#quadratic-equations}

Get everything on one side, equal to zero, then choose a method:

| Situation | Method |
| --- | --- |
| It factors with small numbers | factor, set each factor equal to 0 |
| It has the form (something)² = k | take the square root of both sides, keeping ± |
| It doesn't factor nicely | quadratic formula, or Desmos |
| The question asks how many solutions | the discriminant, without solving |

```
x = (−b ± √(b² − 4ac)) / (2a)        discriminant D = b² − 4ac
```

| D | Real solutions |
| --- | --- |
| D > 0 | two |
| D = 0 | exactly one |
| D < 0 | none |

The SAT does not use imaginary numbers, so D < 0 simply means the equation
has no real solution and its graph never touches the x-axis.

> **Example.** Solve x² − 5x − 14 = 0.
>
> Find two numbers with product −14 and sum −5: −7 and 2.
>
> Factor: (x − 7)(x + 2) = 0, so x = 7 or x = −2.
>
> Check x = −2: 4 + 10 − 14 = 0.

> **Example.** Solve 2x² − 4x − 3 = 0.
>
> a = 2, b = −4, c = −3. D = 16 − 4(2)(−3) = 16 + 24 = 40.
>
> x = (4 ± √40)/4. Since √40 = 2√10, this is (4 ± 2√10)/4 = (2 ± √10)/2.
>
> As decimals, x ≈ 2.58 or x ≈ −0.58, which you can confirm in Desmos.

> **Example.** For what values of k does x² + kx + 25 = 0 have exactly one
> real solution?
>
> Exactly one solution means D = 0: k² − 4(1)(25) = 0.
>
> k² = 100, so k = 10 or k = −10. The trap choice lists only 10.

A polynomial already in factored form is solved factor by factor:
x(x − 3)(2x + 5) = 0 gives x = 0, x = 3 and x = −5/2.

For ax² + bx + c = 0, the solutions add to −b/a and multiply to c/a. If a
question asks only for their sum or product, you can skip solving.

> **Fails when.** The equation isn't in the form ax² + bx + c = 0 yet (move
> every term to one side first), or it has no real solutions (then there are
> no real roots to add, even though −b/a is still a number). If the question
> asks for one particular solution, you must solve.

## Radical equations {#radical-equations}

Isolate the root, square both sides, solve, then check every answer in the
original equation. Squaring can create solutions that don't work, called
extraneous solutions, because squaring hides a sign.

> **Example.** Solve √(2x + 7) = x − 4.
>
> The root is already alone. Square both sides: 2x + 7 = x² − 8x + 16.
>
> Move everything to one side: x² − 10x + 9 = 0, so (x − 1)(x − 9) = 0 and
> x = 1 or x = 9.
>
> Check x = 1: √9 = 3, but 1 − 4 = −3. It fails, so it is extraneous.
>
> Check x = 9: √25 = 5 and 9 − 4 = 5. The only solution is x = 9.

Simple rational equations work the same way: multiply by the common
denominator, solve, then throw out any answer that makes a denominator zero.

> **Example.** Solve x/(x − 3) = 3/(x − 3) + 2.
>
> Multiply every term by x − 3: x = 3 + 2(x − 3), so x = 2x − 3 and x = 3.
>
> But x = 3 makes the denominators zero, so the equation has no solution.

### A radical equation with a constant k {#radical-with-a-constant}

A square root is never negative, so √(A) = B holds only where B ≥ 0. When
the equation has a constant k and the question asks when there are exactly
two solutions, both conditions must hold:

- The squared equation, a quadratic, has two real roots: its discriminant is positive.
- Both roots make B ≥ 0. Past some value of k, the smaller root makes B negative and turns extraneous.

> **Example.** The equation √(2x + k) = x − 3, where k is a constant, has
> exactly two real solutions. What is the greatest possible value of k?
>
> Square: 2x + k = x² − 6x + 9, so x² − 8x + 9 − k = 0.
>
> Complete the square: (x − 4)² = 7 + k. Two roots need 7 + k > 0, so
> k > −7, and the roots are 4 ± √(7 + k).
>
> Each root must make x − 3 ≥ 0, so the smaller one needs
> 4 − √(7 + k) ≥ 3. Then √(7 + k) ≤ 1, so k ≤ −6.
>
> Two solutions exactly when −7 < k ≤ −6. The greatest value is −6.
>
> Check k = −6: the roots are 3 and 5. At x = 3, √0 = 0 = 3 − 3; at x = 5,
> √4 = 2 = 5 − 3. Both work.

> **Trap.** Stopping at the discriminant, or answering −7. At k = −7 the two
> roots merge into one solution, x = 4. And at k = −5 the roots are 4 ± √2;
> the smaller, about 2.6, makes x − 3 negative, so only one solution is
> left.

## Absolute value {#absolute-value}

The absolute value |A| is the distance of A from 0, so it is never
negative. To solve an absolute value equation, isolate the absolute value
first, then split into two cases:

- If |A| = c with c > 0, then A = c or A = −c: two equations to solve.
- If |A| = 0, then A = 0: one equation.
- If |A| = c with c < 0, there is no solution.

> **Example.** Solve 3|2x − 5| + 4 = 19.
>
> Isolate: subtract 4 to get 3|2x − 5| = 15, then divide by 3: |2x − 5| = 5.
>
> Case 1: 2x − 5 = 5, so x = 5. Case 2: 2x − 5 = −5, so x = 0.
>
> Check x = 0: 3|−5| + 4 = 15 + 4 = 19. The solutions are 0 and 5.

> **Trap.** Splitting before isolating. Writing 2x − 5 = 19 or
> 2x − 5 = −19 from the original equation gives wrong answers, because the
> 3 and the 4 are outside the bars.

Reading |x − a| = d as "x is d away from a" gives quick answers. |x − 3| = 7
means x is 7 away from 3, so x = 10 or x = −4. If |x − a| = 4 has solutions
3 and 11, then a is the midpoint, 7.

> **Desmos.** Type the left side as `y=3|2x-5|+4` and the right side as
> `y=19`, then click the two intersections. Desmos reads the bars as absolute
> value. See [Desmos for solving by graphing](learn:sat/general/desmos#solve-by-graphing).

### When the other side has x {#absolute-value-with-x}

An absolute value is never negative, so |A| = B, where B contains x, can hold
only where B ≥ 0. Solve both cases, A = B and A = −B, then keep only the
candidates that make B nonnegative.

> **Example.** How many solutions does |x − 4| = 2x + 1 have?
>
> Case 1: x − 4 = 2x + 1, so x = −5. Then 2x + 1 = −9, which is negative,
> so x = −5 fails. (Check: |−9| = 9, not −9.)
>
> Case 2: x − 4 = −(2x + 1), so 3x = 3 and x = 1. Then 2x + 1 = 3, and
> |1 − 4| = 3. It works.
>
> One solution: x = 1.

Two special shapes:

- |A| = |B|: then A = B or A = −B. Both sides are absolute values, so no candidate needs the sign check.
- |A| = −A: this holds for every x that makes A ≤ 0, so there are infinitely many solutions. |A| = A holds for every x that makes A ≥ 0.

> **Example.** How many solutions does |2x − 6| = 6 − 2x have?
>
> The right side is the opposite of the inside: 6 − 2x = −(2x − 6). So the
> equation holds whenever 2x − 6 ≤ 0, that is, for every x ≤ 3.
>
> Infinitely many. Check x = 0: |−6| = 6 and 6 − 0 = 6. Check x = 5: |4| = 4
> but 6 − 10 = −4, so x = 5 is not a solution.

> **Trap.** Counting two solutions because there are two cases. A case can
> give a candidate that fails the sign check, or give no single number at
> all.

## What Hard looks like {#hard}

Hard nonlinear equations reward seeing structure first:

- The sum, product, or sum of squares of the solutions, after the equation is rearranged. Move every term to one side first, then use −b/a and c/a; r² + s² = (r + s)² − 2rs.
- A rational equation whose count of solutions depends on what clearing the denominator leaves: two roots, one root that the original excludes, an identity, or a false statement.
- An absolute value equal to an expression in x, where each case must pass the sign check (see [when the other side has x](#absolute-value-with-x)).
- A radical equation with a constant k, or the sum of its solutions. Each root of the squared equation must make the side without the root nonnegative, so a k that gives the quadratic two roots can still leave one solution (see [a radical equation with a constant k](#radical-with-a-constant)).

> **Example.** The solutions of (x + 2)(x − 5) = 3x − 4 are r and s. What is
> r² + s²?
>
> Don't read −2 and 5 off the factors: the right side isn't 0. Expand and
> collect: x² − 3x − 10 = 3x − 4, so x² − 6x − 6 = 0.
>
> r + s = 6 and rs = −6, so r² + s² = (r + s)² − 2rs = 36 + 12 = 48.
>
> Check: the solutions are 3 ± √15, and (3 + √15)² + (3 − √15)² =
> 2(9 + 15) = 48.

> **Example.** Solve (x − 3)² = 4(x − 3).
>
> Don't divide both sides by x − 3: that throws away the solution that makes
> x − 3 equal to zero.
>
> Move everything to one side and factor out x − 3: (x − 3)(x − 3 − 4) = 0,
> so (x − 3)(x − 7) = 0.
>
> The solutions are x = 3 and x = 7.
