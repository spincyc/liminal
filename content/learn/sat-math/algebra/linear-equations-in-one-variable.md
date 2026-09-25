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
Math section. Easy questions ask you to solve. Hard ones hide the equation in
a context, give you a constant to choose so the equation has no solution or
infinitely many, or ask for an expression such as 2x + 1 instead of x.

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

- A constant to choose so that the equation has no solution or infinitely many solutions.
- An expression to find (x/12, 2x − 1) where a smart first step beats solving for x.
- A context where you must build the equation from a paragraph before solving it.
- Fractions or decimals chosen so that a careless step lands on a listed choice.

> **Example.** If x/3 + x/4 = 14, what is the value of x/12?
>
> Combine the fractions: x/3 + x/4 = 4x/12 + 3x/12 = 7x/12.
>
> So 7x/12 = 14, which means x/12 = 2. (Solving first also works: x = 24,
> and 24/12 = 2. The trap choice is 24.)
