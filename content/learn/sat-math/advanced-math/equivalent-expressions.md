---
id: sat-math/advanced-math/equivalent-expressions
title: Equivalent expressions
section: sat-math
domain: Advanced Math
skill: Equivalent expressions
---
# Equivalent expressions

Two expressions are equivalent when they give the same value for every
allowed x: (x + 3)² and x² + 6x + 9 are one example. This skill asks you to
expand, factor, combine exponents and simplify fractions without changing
the value. It belongs to Advanced Math, {{fact:sat-math-advanced}} of the
Math section. Hard questions ask you to spot a structure (a difference of
squares in disguise, a rational exponent) or to find constants that make two
expressions match for all x.

## Factoring {#factoring}

Expanding and factoring are the same skill run in opposite directions.
Expand by multiplying every term by every term; factor by recognizing a
pattern.

| Pattern | Factored form |
| --- | --- |
| Common factor | ax + ay = a(x + y) |
| Difference of squares | a² − b² = (a + b)(a − b) |
| Perfect square | a² + 2ab + b² = (a + b)² |
| Perfect square | a² − 2ab + b² = (a − b)² |
| Trinomial | x² + (p + q)x + pq = (x + p)(x + q) |

The difference of squares hides well: 4x² − 9 = (2x + 3)(2x − 3), and
x⁴ − 16 = (x² + 4)(x² − 4) = (x² + 4)(x + 2)(x − 2).

> **Example.** Factor 6x² + x − 12.
>
> Multiply the first and last coefficients: 6 · (−12) = −72. Find two
> numbers with product −72 and sum 1 (the middle coefficient): 9 and −8.
>
> Split the middle term: 6x² + 9x − 8x − 12.
>
> Group: 3x(2x + 3) − 4(2x + 3) = (3x − 4)(2x + 3).
>
> Check by expanding: 6x² + 9x − 8x − 12 = 6x² + x − 12.

With expressions in the answer choices, you can plug in a number: pick x = 3,
evaluate the original, evaluate each choice, and keep the match.

> **Fails when.** Two choices agree at the number you picked. They do more
> often than you'd think at 0, 1 and 2, so use a value like 3 or 5, and test
> survivors with a second value. Also avoid any x that makes a denominator
> zero.

## Exponent rules {#exponent-rules}

| Rule | Example |
| --- | --- |
| xᵃ · xᵇ = xᵃ⁺ᵇ | x² · x³ = x⁵ |
| xᵃ ÷ xᵇ = xᵃ⁻ᵇ | x⁷ ÷ x³ = x⁴ |
| (xᵃ)ᵇ = xᵃᵇ | (x³)² = x⁶ |
| (xy)ᵃ = xᵃyᵃ | (2x)³ = 8x³ |
| x⁰ = 1 for x ≠ 0 | 5⁰ = 1 |
| x⁻ᵃ = 1/xᵃ | x⁻² = 1/x² |

Rational exponents turn roots into powers: the n-th root of x is `x^(1/n)`,
and the n-th root of xᵐ is `x^(m/n)`. So √x is `x^(1/2)` and ∛(x²) is
`x^(2/3)`. Converting both ways is tested directly.

> **Example.** For x > 0, write ⁴√(x³) · √x as a single power of x.
>
> Convert each root: ⁴√(x³) = `x^(3/4)` and √x = `x^(1/2)`.
>
> Same base, so add the exponents: 3/4 + 2/4 = 5/4. The product is
> `x^(5/4)`.

> **Example.** Simplify `(8x^6)^(2/3)`.
>
> Apply the power to each factor: `8^(2/3)` · `x^(6·2/3)`.
>
> `8^(2/3)` is the cube root of 8, squared: 2² = 4. And 6 · 2/3 = 4.
>
> The result is 4x⁴.

> **Trap.** Multiplying exponents when you should add (x² · x³ is x⁵, not
> x⁶), and applying a power to only one factor ((2x)³ is 8x³, not 2x³).

## Rational expressions {#rational-expressions}

A rational expression is a fraction with polynomials on top and bottom.
Simplify by factoring both and cancelling common factors. You can only
cancel factors (things multiplied), never terms (things added).

> **Example.** Simplify (x² − 9)/(x² + 5x + 6).
>
> Factor: (x + 3)(x − 3) over (x + 3)(x + 2).
>
> Cancel the common factor x + 3: the result is (x − 3)/(x + 2).
>
> The original is undefined at x = −3 and x = −2, and those values stay
> excluded even after cancelling.

To add or subtract, use a common denominator, exactly as with number
fractions.

> **Example.** Write 3/(x − 1) + 2/(x + 1) as a single fraction.
>
> The common denominator is (x − 1)(x + 1) = x² − 1.
>
> Numerator: 3(x + 1) + 2(x − 1) = 3x + 3 + 2x − 2 = 5x + 1.
>
> The sum is (5x + 1)/(x² − 1).

Some questions rewrite a fraction as a polynomial plus a remainder:
(x² + 5x + 7)/(x + 2) = x + 3 + 1/(x + 2), because (x + 3)(x + 2) =
x² + 5x + 6, which is 1 less than the numerator.

> **Trap.** (x + 6)/6 is not x + 1. The 6 in the numerator is added, not
> multiplied, so it can't cancel.

> **Desmos.** To test whether two expressions are equivalent, graph both, for
> example `y=(x^2-9)/(x^2+5x+6)` and `y=(x-3)/(x+2)`. Equivalent expressions
> draw the same curve. See [Desmos for equivalence](learn:sat/general/desmos#equivalence).

## What Hard looks like {#hard}

Hard questions ask you to recognize structure before you do algebra.

> **Example.** For all x, (ax − 4)(2x + b) = 6x² + x − 12, where a and b are
> constants. What is a + b?
>
> Expand the left side: 2ax² + abx − 8x − 4b.
>
> Match the x² terms: 2a = 6, so a = 3. Match the constants: −4b = −12, so
> b = 3.
>
> Confirm the middle term: ab − 8 = 9 − 8 = 1, which matches. So a + b = 6.

Other Hard shapes: an expression like 9x⁴ − 25y² that is a difference of
squares ((3x²)² − (5y)²), or a question that asks which form of an expression
shows a particular feature (see [nonlinear functions](learn:sat-math/advanced-math/nonlinear-functions#quadratic-functions)).
