---
id: sat-math/algebra/linear-inequalities
title: Linear inequalities
section: sat-math            # skill pages only
domain: Algebra
skill: Linear inequalities
---
# Linear inequalities

Test fixture for `tools/check-learn.js`: it uses every construct the Learn
markup allows. An inequality is solved like an equation, with **one extra
rule**: multiplying or dividing by a *negative* number flips the sign. The
Math section runs {{fact:sat-math-minutes}}; see the
[official structure](https://satsuite.collegeboard.org/sat/whats-on-the-test/structure)
and [linear functions](learn:sat-math/algebra/linear-functions#slope).

## Solve inequalities {#solve-inequalities}

1. Undo addition and subtraction first.
2. Divide by the coefficient of x,
   flipping the sign if it is negative.
3. Check one value from your answer in the original.

> **Rule.** Dividing both sides by a negative number reverses the
> inequality: from −2x > 8 you get x < −4.

> **Example.** Solve 3x − 5 ≤ 7.
>
> ```
> 3x − 5 ≤ 7
>     3x ≤ 12
>      x ≤ 4
> ```
>
> Check x = 0: 3(0) − 5 = −5, and −5 ≤ 7. ✓

> **Example 2.** Solve −2x + 1 > 9.
>
> - Subtract 1: −2x > 8.
> - Divide by −2 and flip: x < −4.

> **Trap.** Forgetting the flip gives x > −4, which is often a choice.

> **Fails when:** the "flip" shortcut is applied to an inequality you only
> *added to*; adding a negative number never flips the sign.

| Operation on both sides | Sign flips? |
| --- | :---: |
| add or subtract any number | no |
| multiply by a positive number | no |
| multiply by a negative number | yes |
| take \|x\| of both sides | not an allowed step |
| compare |x − 3| with 5 | split into two inequalities |

### Powers and fractions {#powers-and-fractions}

When x^2 ≤ 9, x lies between −3 and 3, and x² = 9 has two solutions.
Dividing both sides of 3x ≤ 12 by 3 gives x ≤ 12/3, so x ≤ 4. Typed code
such as `x^2 <= 9` stays as written.

| Expression | Value at x = 2 |
| --- | --- |
| x^3 | 8 |
| (x + 1)/3 | 1 |
| √(x + 7) | 3 |
| x^(3/2) · x^(1/2) | 4 |

> **Example.** Solve (x − 1)/2 > 3.
>
> ```
> (x − 1)/2 > 3
>     x − 1 > 6
>         x > 7
> ```
>
> Multiply by 2, then add 1: x > 7. Check x = 9: (9 − 1)/2 = 4, and 4 > 3.

### A note on notation {#notation}

Write "at most" as ≤ and "fewer than" as <. An open circle on a number
line means the endpoint is excluded; see [the next section](#systems-of-inequalities).

## Systems of inequalities {#systems-of-inequalities}

A point is a solution of a system when it makes **every** inequality true.

> **Example.** Is (2, 3) a solution of y ≤ 2x + 1 and y > −x + 4?
>
> | Inequality | Substitute (2, 3) | True? |
> | --- | --- | --- |
> | y ≤ 2x + 1 | 3 ≤ 5 | yes |
> | y > −x + 4 | 3 > 2 | yes |
>
> Both hold, so (2, 3) is a solution.

> **Desmos.** Type both inequalities; the doubly shaded region is the
> solution set.

> **Check.** Test a point from the shaded region in both inequalities.

> **Note.** A boundary drawn dashed is not part of the solution set.

## Where these show up {#where-these-show-up}

- Word problems with "at least" or "no more than"
- Graphs with a shaded half-plane

```text
5x − 3 ≤ 2x + 9      subtract 2x from both sides; the sign stays because nothing was multiplied
3x − 3 ≤ 9           add 3 to both sides
    3x ≤ 12          divide by 3, a positive number, so the sign stays
     x ≤ 4
```
