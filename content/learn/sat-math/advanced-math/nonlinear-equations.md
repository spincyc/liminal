---
id: sat-math/advanced-math/nonlinear-equations
title: Nonlinear equations
section: sat-math
domain: Advanced Math
skill: Nonlinear equations
---
# Nonlinear equations

A nonlinear equation has its variable squared, under a root, inside an
absolute value or in a denominator. Depending on its form, it may have no
solutions, one or more solutions, or infinitely many. This skill is part of
Advanced Math, {{fact:sat-math-advanced}} of the Math section.

## Before you start {#before-you-start}

This page uses factoring, the zero-product rule, square roots of both
signs, and absolute value as distance. Try these first. If one goes wrong,
rebuild it with
[Algebra, week 21: factoring quadratics](weeks.html#high-school-math/algebra/21),
[Algebra, week 25: solving quadratics by factoring](weeks.html#high-school-math/algebra/25),
[lesson 1-5, equations with square roots](lessons.html#common-core-math/8/1-5) or
[Algebra, week 10: absolute value as distance](weeks.html#high-school-math/algebra/10).

> **Try it.** Factor x² − x − 12.
>
> **Answer.** (x − 4)(x + 3)
>
> Find two numbers with product −12 and sum −1: −4 and 3. Check:
> x² + 3x − 4x − 12 = x² − x − 12. Shaky?
> [Algebra, week 21](weeks.html#high-school-math/algebra/21).

> **Try it.** If (x − 2)(x + 5) = 0, what are the possible values of x?
>
> **Answer.** 2 and −5
>
> A product is 0 only when a factor is 0: x − 2 = 0 gives x = 2, and
> x + 5 = 0 gives x = −5. Shaky?
> [Algebra, week 25](weeks.html#high-school-math/algebra/25).

> **Try it.** Solve x² = 49.
>
> **Answer.** x = 7 or x = −7
>
> 7² = 49 and (−7)² = 49, so both count. Shaky?
> [Lesson 1-5](lessons.html#common-core-math/8/1-5).

> **Try it.** Which numbers are 4 units from 1 on the number line?
>
> **Answer.** 5 and −3
>
> 1 + 4 = 5 and 1 − 4 = −3. These are the solutions of |x − 1| = 4.
> Shaky? [Algebra, week 10](weeks.html#high-school-math/algebra/10).

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

> **Try it.** Solve x² + 2x − 24 = 0.
>
> **First step.** Find two numbers with product −24 and sum 2: 6 and −4.
> Now factor and solve.
>
> **Answer.** x = −6 or x = 4
>
> Factor: (x + 6)(x − 4) = 0, so x = −6 or x = 4.
>
> Check x = 4: 16 + 8 − 24 = 0.

> **Example.** Solve 2x² − 4x − 3 = 0.
>
> a = 2, b = −4, c = −3. D = 16 − 4(2)(−3) = 16 + 24 = 40.
>
> x = (4 ± √40)/4. Since √40 = 2√10, this is (4 ± 2√10)/4 = (2 ± √10)/2.
>
> As decimals, x ≈ 2.58 or x ≈ −0.58, which you can confirm in Desmos.

> **Try it.** Solve 2x² + 6x + 3 = 0.
>
> **Answer.** x = (−3 ± √3)/2
>
> a = 2, b = 6, c = 3. D = 36 − 4(2)(3) = 36 − 24 = 12.
>
> x = (−6 ± √12)/4. Since √12 = 2√3, this is (−6 ± 2√3)/4 = (−3 ± √3)/2.
>
> As decimals, x ≈ −0.63 or x ≈ −2.37.

To count real solutions without solving, move every term to one side first;
the discriminant of that equation decides. A quadratic equal to a line, such
as x² − 3x + 7 = 3x − 2, is the same question: how many points the parabola
and the line share.

> **Example.** How many distinct real solutions does x² − 3x + 7 = 3x − 2
> have?
>
> Move every term to one side: x² − 6x + 9 = 0.
>
> D = (−6)² − 4(1)(9) = 36 − 36 = 0, so there is exactly one real solution,
> x = 3, since x² − 6x + 9 = (x − 3)².
>
> Counting from x² − 3x + 7 = 0 alone, where D = 9 − 28 < 0, gives the trap
> answer, zero.

> **Try it.** How many distinct real solutions does 2x² + 3x − 2 = 7x − 5
> have?
>
> **Answer.** Zero
>
> Move every term to one side: 2x² − 4x + 3 = 0.
>
> D = (−4)² − 4(2)(3) = 16 − 24 = −8, which is negative, so there is no real
> solution. Counting from 2x² + 3x − 2 = 0 alone, where D = 25, would give
> two.

> **Example.** For what values of k does x² + kx + 25 = 0 have exactly one
> real solution?
>
> Exactly one solution means D = 0: k² − 4(1)(25) = 0.
>
> k² = 100, so k = 10 or k = −10. The trap choice lists only 10.

> **Try it.** For what values of k does 4x² + kx + 9 = 0 have exactly one
> real solution?
>
> **Answer.** k = 12 or k = −12
>
> Exactly one solution means D = 0: k² − 4(4)(9) = 0, so k² = 144.
>
> Check k = 12: 4x² + 12x + 9 = (2x + 3)², which is 0 only at x = −3/2.

A polynomial already in factored form is solved factor by factor:
x(x − 3)(2x + 5) = 0 gives x = 0, x = 3 and x = −5/2.

> **Example.** Solve (x − 3)² = 4(x − 3).
>
> Don't divide both sides by x − 3: that throws away the solution that makes
> x − 3 equal to zero.
>
> Move everything to one side and factor out x − 3: (x − 3)(x − 3 − 4) = 0,
> so (x − 3)(x − 7) = 0.
>
> The solutions are x = 3 and x = 7.

> **Try it.** Solve (x + 2)² = 5(x + 2).
>
> **Answer.** x = −2 or x = 3
>
> Move everything to one side and factor out x + 2: (x + 2)(x + 2 − 5) = 0,
> so (x + 2)(x − 3) = 0.
>
> Dividing both sides by x + 2 would have lost x = −2.

For ax² + bx + c = 0, the solutions add to −b/a and multiply to c/a. If a
question asks only for their sum or product, you can skip solving.

> **Fails when.** The equation isn't in the form ax² + bx + c = 0 yet (move
> every term to one side first), or it has no real solutions (then there are
> no real roots to add, even though −b/a is still a number). If the question
> asks for one particular solution, you must solve.

For a harder version, a value built from both solutions such as r² + s², see
[the sum and product of the solutions](#sum-and-product).

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

> **Try it.** Solve √(x + 10) = x − 2.
>
> **First step.** The root is already alone. Square both sides:
> x + 10 = x² − 4x + 4. Now solve, then check each answer.
>
> **Answer.** x = 6
>
> Move everything to one side: x² − 5x − 6 = 0, so (x − 6)(x + 1) = 0 and
> x = 6 or x = −1.
>
> Check x = −1: √9 = 3, but −1 − 2 = −3. It is extraneous.
>
> Check x = 6: √16 = 4 and 6 − 2 = 4. The only solution is x = 6.

Simple rational equations work the same way: multiply by the common
denominator, solve, then throw out any answer that makes a denominator zero.
When each side is a single fraction, cross-multiplying does the same job.

> **Example.** What value of x is the solution to 9/(x − 1) = 6/(x − 3)?
>
> Cross-multiply: 9(x − 3) = 6(x − 1), so 9x − 27 = 6x − 6.
>
> Then 3x = 21 and x = 7. Check: 9/6 = 1.5 and 6/4 = 1.5, and neither
> denominator is zero.

> **Try it.** What value of x is the solution to 4/(x + 2) = 7/(x + 8)?
>
> **Answer.** x = 6
>
> Cross-multiply: 4(x + 8) = 7(x + 2), so 4x + 32 = 7x + 14. Then 3x = 18
> and x = 6.
>
> Check: 4/8 = 0.5 and 7/14 = 0.5.

> **Example.** Solve x/(x − 3) = 3/(x − 3) + 2.
>
> Multiply every term by x − 3: x = 3 + 2(x − 3), so x = 2x − 3 and x = 3.
>
> But x = 3 makes the denominators zero, so the equation has no solution.

> **Try it.** Solve x²/(x − 2) = 4/(x − 2) + 3.
>
> **Answer.** x = 1
>
> Multiply every term by x − 2: x² = 4 + 3(x − 2), so x² − 3x + 2 = 0.
>
> Factor: (x − 1)(x − 2) = 0, so x = 1 or x = 2. But x = 2 makes the
> denominators zero, so it is thrown out.
>
> Check x = 1: 1/(−1) = −1 and 4/(−1) + 3 = −1.

For a harder version, where a constant decides how many solutions survive,
see [a radical equation with a constant k](#radical-with-a-constant).

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

> **Try it.** Solve 2|x + 3| − 5 = 9.
>
> **First step.** Isolate: add 5 to get 2|x + 3| = 14, then divide by 2:
> |x + 3| = 7. Now split into two cases.
>
> **Answer.** x = 4 or x = −10
>
> Case 1: x + 3 = 7, so x = 4. Case 2: x + 3 = −7, so x = −10.
>
> Check x = −10: 2|−7| − 5 = 14 − 5 = 9.

Reading |x − a| = d as "x is d away from a" gives quick answers. |x − 3| = 7
means x is 7 away from 3, so x = 10 or x = −4. If |x − a| = 4 has solutions
3 and 11, then a is the midpoint, 7.

> **Try it.** The equation |x − a| = 6 has solutions −2 and 10. What is the
> value of a?
>
> **Answer.** 4
>
> Both solutions are 6 away from a, so a is their midpoint:
> (−2 + 10)/2 = 4.
>
> Check: |−2 − 4| = 6 and |10 − 4| = 6.

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

> **Try it.** How many solutions does |3x + 2| = x − 2 have?
>
> **First step.** Case 1: 3x + 2 = x − 2, so x = −2. Then x − 2 = −4, which
> is negative, so x = −2 fails. Now try case 2.
>
> **Answer.** None (0 solutions)
>
> Case 2: 3x + 2 = −(x − 2), so 4x = 0 and x = 0. Then x − 2 = −2, which
> is negative, so x = 0 fails too. (Check: |2| = 2, not −2.)
>
> Neither case survives, so the equation has no solutions.

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

> **Try it.** How many solutions does |5 − x| = x − 5 have?
>
> **Answer.** Infinitely many (every x ≥ 5)
>
> The right side is the opposite of the inside: x − 5 = −(5 − x). So the
> equation holds whenever 5 − x ≤ 0, that is, for every x ≥ 5.
>
> Check x = 8: |−3| = 3 and 8 − 5 = 3. Check x = 0: |5| = 5 but
> 0 − 5 = −5, so x = 0 is not a solution.

> **Trap.** Counting two solutions because there are two cases. A case can
> give a candidate that fails the sign check, or give no single number at
> all.

## Harder versions {#hard}

The harder questions turn on which solutions count: a value built from
both solutions, or a constant that decides how many roots survive.

### The sum and product of the solutions {#sum-and-product}

For a value built from both solutions r and s, move every term to one
side, then use r + s = −b/a and rs = c/a: r² + s² = (r + s)² − 2rs.

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

> **Try it.** The solutions of (x + 3)(x − 2) = 4x + 1 are r and s. What is
> r² + s²?
>
> **First step.** Expand and collect: x² + x − 6 = 4x + 1, so
> x² − 3x − 7 = 0. Now use the sum and the product.
>
> **Answer.** 23
>
> r + s = 3 and rs = −7, so r² + s² = (r + s)² − 2rs = 9 + 14 = 23.
>
> Check: the solutions are (3 ± √37)/2, and their squares add to
> 2(9 + 37)/4 = 23.

### A radical equation with a constant k {#radical-with-a-constant}

A square root is never negative, so √(A) = B holds only where B ≥ 0. With
a constant k in the equation, exactly two solutions need both of these:

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

> **Try it.** The equation √(2x + k) = x − 1, where k is a constant, has
> exactly two real solutions. What is the greatest possible value of k?
>
> **First step.** Square: 2x + k = x² − 2x + 1, so x² − 4x + 1 − k = 0.
> Completing the square gives (x − 2)² = 3 + k. Now make both roots work.
>
> **Answer.** −2
>
> Two roots need 3 + k > 0, so k > −3, and the roots are 2 ± √(3 + k).
>
> Each root must make x − 1 ≥ 0, so the smaller one needs
> 2 − √(3 + k) ≥ 1. Then √(3 + k) ≤ 1, so k ≤ −2.
>
> Two solutions exactly when −3 < k ≤ −2. The greatest value is −2.
>
> Check k = −2: the roots are 1 and 3. At x = 1, √0 = 0 = 1 − 1; at x = 3,
> √4 = 2 = 3 − 1.
