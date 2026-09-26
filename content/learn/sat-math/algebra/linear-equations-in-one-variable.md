---
id: sat-math/algebra/linear-equations-in-one-variable
title: Linear equations in one variable
section: sat-math
domain: Algebra
skill: Linear equations in one variable
---
# Linear equations in one variable

A linear equation in one variable has one unknown, and that unknown is never
squared, under a root or in a denominator: 3(x − 4) = 2x + 5 is one. This is
the base skill for all of Algebra, which is {{fact:sat-math-algebra}} of the
Math section. Easy questions ask you to solve. Hard ones give two unknown
constants and a condition on the number of solutions, put the target letter
in two terms of a formula, or make you build the equation for two quantities
that change at once.

## Solve {#solve}

The method, in order:

1. Clear fractions: multiply every term on both sides by the least common denominator.
2. Distribute, and combine like terms on each side.
3. Move the variable terms to one side and the numbers to the other.
4. Divide by the coefficient of the variable.
5. Substitute your answer into the original equation.

Write each step on its own line. Most errors in this skill are sign errors
from doing two steps at once, not gaps in knowledge.

> **Example.** Solve (2x − 1)/3 + x/2 = 4.
>
> The denominators are 3 and 2, so multiply every term by 6:
> 2(2x − 1) + 3x = 24.
>
> Distribute and combine: 4x − 2 + 3x = 24, so 7x − 2 = 24.
>
> Add 2, then divide by 7: 7x = 26, so x = 26/7.
>
> Check: (2 · 26/7 − 1)/3 = (45/7)/3 = 15/7, and (26/7)/2 = 13/7. Their sum
> is 28/7 = 4. As a student-produced response, enter 26/7.

> **Trap.** A negative in front of parentheses multiplies every term inside:
> 5 − 2(x − 3) = 5 − 2x + 6, not 5 − 2x − 6.

Read the last line of the question before you start. If it asks for x + 4 or
2x, the value of x will be sitting among the choices as a trap. Sometimes you
can reach the asked expression directly.

> **Example.** If 3(x + 4) = 27, what is the value of x + 4?
>
> Divide both sides by 3: x + 4 = 9. You never need x itself (x = 5).

> **Fails when.** The asked expression isn't a simple multiple of a piece
> of the equation. If 3x + 4 = 19 and the question asks for 2x + 1, there is
> no one-step route; solve for x (x = 5) and then compute 2(5) + 1 = 11.

> **Example.** If x/3 + x/4 = 14, what is the value of x/12?
>
> Combine the fractions: x/3 + x/4 = 4x/12 + 3x/12 = 7x/12.
>
> So 7x/12 = 14, which means x/12 = 2. (Solving first also works: x = 24,
> and 24/12 = 2. The trap choice is 24.)

With numeric choices, you can backsolve: substitute each choice into the
equation and keep the one that works.

> **Fails when.** The question asks for something other than x (then a
> choice that satisfies the equation is the trap), or the choices are close
> decimals and substitution is slower than solving. Backsolving is a check,
> not a habit.

## Rearranging formulas {#rearranging-formulas}

Some questions give a formula with several letters and ask you to solve for
one of them. Treat every other letter as a fixed number and use the same
steps as above.

> **Example.** An engineer uses S = (m + 4n)/(3t). Solve for n.
>
> Multiply both sides by 3t: 3tS = m + 4n.
>
> Subtract m: 3tS − m = 4n.
>
> Divide by 4: n = (3tS − m)/4.
>
> Check with numbers: m = 2, n = 1, t = 1 gives S = 6/3 = 2, and
> (3 · 1 · 2 − 2)/4 = 1. ✓

When the target letter appears twice, collect both terms on one side and
factor it out before dividing.

> **Example.** Solve kx + 5 = 2x + m for x.
>
> Collect the x terms on the left and the rest on the right: kx − 2x = m − 5.
>
> Factor out x: x(k − 2) = m − 5.
>
> Divide: x = (m − 5)/(k − 2), which needs k ≠ 2.

> **Check.** Pick easy values for the other letters, compute the target from
> the original formula, and see whether your rearranged version gives the
> same value. A wrong rearrangement almost never passes this test.

## Interpret constants {#interpret-constants}

In a context, each number in the equation means something. The constant term
is usually a starting amount, the coefficient of the variable is a rate (an
amount per one unit of the variable), and the other side is a target total.
Say the units out loud: "dollars", "dollars per week", "weeks".

> **Example.** Maya has saved $180 and adds $25 each week. The equation
> 180 + 25w = 530 describes her savings. What does 25 represent, and what
> does the solution represent?
>
> 25 is multiplied by w (weeks), so its units are dollars per week: the
> amount she adds each week.
>
> Solve: 25w = 350, so w = 14. The solution is the number of weeks until
> her savings reach $530.
>
> 180 is the amount she had before week 1; 530 is the savings goal.

> **Trap.** A choice that describes a total ("the total she saves in 14
> weeks") when the question asks about a rate, or the reverse. Check the
> units of the number against the units in the choice.

## No or infinite solutions {#no-or-infinite-solutions}

Simplify both sides to the form ax + b = cx + d. Then:

| Condition | Number of solutions |
| --- | --- |
| a ≠ c | exactly one |
| a = c and b ≠ d | none (the x terms cancel and leave a false statement such as 5 = 9) |
| a = c and b = d | infinitely many (both sides are identical) |

> **Example.** In 4(2x − 3) + k = 8x + 5, k is a constant. For what value of
> k does the equation have infinitely many solutions?
>
> Distribute: 8x − 12 + k = 8x + 5.
>
> The x coefficients already match (8 and 8), so the equation has
> infinitely many solutions when the constants match: −12 + k = 5, so
> k = 17.
>
> For any other k the constants differ and there is no solution. This
> equation can never have exactly one solution.

> **Trap.** "No solution" means no value of x works. It does not mean x = 0,
> and it does not mean the answer is "any number".

## What Hard looks like {#hard}

Hard questions in this skill don't use harder arithmetic. They make you
decide what the question is first:

- Two unknown constants and a condition: no solution, or infinitely many. Multiply out every product, then match the x-coefficients, and match the constants (infinitely many) or make them differ (none). A solution that works for every value of a constant is the x that makes that constant's term vanish.
- A formula whose target letter ends up in two terms, often after you clear a denominator, as in m = (s + 90x)/(10 + x). Gather the target's terms, factor it out, and divide by the whole factor (see [rearranging formulas](#rearranging-formulas)).
- Two quantities that change at once, one of them starting late. Write each in the same time variable, count the late one's change from t minus the delay, and write the comparison the right way round.

> **Example.** In a(x + 2) − x = 5x + b, a and b are constants, and the
> equation has infinitely many solutions. What is b?
>
> Multiply out the left side: ax + 2a − x = (a − 1)x + 2a.
>
> Infinitely many means both sides are the same expression: a − 1 = 5 and
> 2a = b. So a = 6 and b = 12.
>
> Check: 6(x + 2) − x = 5x + 12 for every x.

> **Example.** At 8:00 a.m. a warehouse holds 900 boxes and ships 15 boxes a
> minute. A second warehouse holds 100 boxes, and starting at 8:10 a.m. it
> receives 20 boxes a minute. How many minutes after 8:00 does the first
> warehouse hold twice as many boxes as the second?
>
> First warehouse after t minutes: 900 − 15t. Second, for t ≥ 10:
> 100 + 20(t − 10).
>
> "The first is twice the second": 900 − 15t = 2(100 + 20(t − 10)) =
> 40t − 200. So 1,100 = 55t and t = 20.
>
> Check: at t = 20 the first holds 600 and the second 100 + 20(10) = 300.

> **Trap.** Writing 20t for the second warehouse, which starts its clock 10
> minutes early, or doubling the wrong side. Each slip gives a different,
> offered answer.
