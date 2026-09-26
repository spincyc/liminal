---
id: sat-math/algebra/linear-equations-in-two-variables
title: Linear equations in two variables
section: sat-math
domain: Algebra
skill: Linear equations in two variables
---
# Linear equations in two variables

An equation such as 3x + 5y = 60 has two unknowns, so it has many solutions:
every point on its line. Questions in this skill ask you to build such an
equation from a situation, or to read meaning from its graph. It sits in
Algebra, {{fact:sat-math-algebra}} of the Math section. Hard questions are
about the line itself: how far y moves when x moves along it, where an
intercept goes when the line is shifted, or which line has intercepts that
meet a condition.

## Graph interpretation {#graph-interpretation}

A point is on the line exactly when its coordinates make the equation true.
In a context, that means "this combination is possible". Three readings come
up again and again:

- An intercept is what happens when the other quantity is zero.
- The slope is how much y changes when x goes up by 1, with units.
- A point on the line is one combination that meets the condition exactly.

> **Example.** Ana spends exactly $60 on notebooks at $3 each and pens at $5
> each, so 3x + 5y = 60, where x is notebooks and y is pens. What do the
> intercepts mean, is (10, 6) on the line, and what does the slope mean?
>
> x-intercept: set y = 0, so 3x = 60 and x = 20. With no pens she can buy 20
> notebooks. y-intercept: set x = 0, so y = 12. With no notebooks she can buy
> 12 pens.
>
> (10, 6): 3(10) + 5(6) = 30 + 30 = 60. Yes, 10 notebooks and 6 pens cost
> exactly $60.
>
> Slope: solve for y to get y = 12 − (3/5)x. The slope is −3/5: each extra
> notebook means 3/5 of a pen fewer, or 3 fewer pens for every 5 notebooks.

> **Trap.** Choosing an interpretation that swaps the variables ("each extra
> pen costs 3 notebooks"). Write out which letter is which before reading
> the choices.

When the graph has no equation, pick two points the grid makes easy to read,
find the slope, and use an intercept. Then answer the question from the
equation, not from eyeballing the picture.

### Slope from standard form {#standard-form-slope}

Solving Ax + By = C for y gives y = (−A/B)x + C/B. So the slope is −A/B:
the x-coefficient over the y-coefficient, with the sign changed.

> **Example.** What is the slope of the graph of 4x − 10y = 30?
>
> Shortcut: −A/B = −4/(−10) = 2/5.
>
> By solving: −10y = −4x + 30, so y = (2/5)x − 3. The slope is 2/5.

> **Fails when.** The x-term and the y-term are not on the same side. In
> 2x = 3y + 6, A is 2 but B is not 3: rewrite it as 2x − 3y = 6 first, and
> the slope is −2/(−3) = 2/3, not −2/3.

### Moving along a line {#moving-along-a-line}

Along a line, y changes by the slope times the change in x:
Δy = m · Δx. That holds from any point, so when a question starts from an
unknown point (s, t) on the line, you never need s, t, or the constant.

> **Example.** The points (p, q) and (p − 4, q + k) both lie on the graph of
> 5x + 2y = 17. What is k?
>
> The slope is −5/2. Moving 4 left means Δx = −4, so
> Δy = (−5/2)(−4) = 10 and k = 10.
>
> Check by subtracting: 5(p − 4) + 2(q + k) = 17 and 5p + 2q = 17 leave
> −20 + 2k = 0, so k = 10 again.

> **Trap.** Using the coefficients themselves as the step. In 5x + 2y = 17
> a step of 5 in x and 2 in y does not stay on the line; a step of 2 in x
> and −5 in y does.

### Translating a line {#translating-a-line}

Moving a line up or down by d changes its y-intercept by d, but its
x-intercept moves by d divided by the slope, and in the direction the
slope decides. Don't guess that direction: write the new equation, then set
y = 0.

- In y = mx + b form, moving up d gives y = mx + b + d.
- In Ax + By = C form, moving up d replaces y with y − d, so C changes by B · d.

> **Example.** A line passes through (0, 3) and (4, 0). It is translated 6
> units down. What is the x-intercept of the new line?
>
> The line is y = −(3/4)x + 3. Moving it 6 down gives y = −(3/4)x − 3.
>
> Set y = 0: (3/4)x = −3, so x = −4. The x-intercept moved from 4 to −4,
> which is 8 units, not 6.
>
> In standard form: 3x + 4y = 12 becomes 3x + 4(y + 6) = 12, or
> 3x + 4y = −12, and y = 0 gives x = −4 again.

> **Trap.** Moving the x-intercept by the size of the vertical shift, or
> replacing y with y + d to move a line up. Up d means y − d inside the
> equation.

## Equation modeling {#equation-modeling}

Translate one piece at a time. Every term must have the same units as the
total.

| Words | Math |
| --- | --- |
| is, was, will be, totals | = |
| per, for each | multiply the rate by the count |
| more than, increased by | + |
| less than, decreased by | − (order reverses: "5 less than x" is x − 5) |
| twice, double | × 2 |

> **Example.** A theater sold adult tickets at $12 and child tickets at $7
> and took in $1,020. Write an equation, then find the number of child
> tickets if 50 adult tickets were sold.
>
> Let a be adult tickets and c be child tickets. Each term is dollars:
> 12a + 7c = 1,020.
>
> Substitute a = 50: 12(50) + 7c = 1,020, so 600 + 7c = 1,020.
>
> Subtract 600: 7c = 420, so c = 60.

> **Example.** A caterer charges a setup fee of $150 plus $22 per guest. A
> second caterer charges $40 per guest and no setup fee. Write each total
> cost as an equation in g, the number of guests, and find when the costs
> are equal.
>
> First caterer: C = 150 + 22g. Second caterer: C = 40g.
>
> Equal costs: 150 + 22g = 40g, so 150 = 18g and g = 8.33…
>
> At 8 guests the second caterer is cheaper (320 against 326); at 9 guests
> the first is (348 against 360).

> **Check.** Before choosing a model, test it with a number you can reason
> about without algebra. If 0 guests should cost $150, the equation must
> give C = 150 at g = 0.

### Whole-number solutions {#whole-number-solutions}

When x and y count things, only whole-number points on the line count. To
list them all for ax + by = c:

1. Divide the equation by any factor that a, b and c share.
2. Find one solution: try x = 0, 1, 2, ... (or y) until the other variable comes out whole.
3. Step from it: add the new y-coefficient to x and take the new x-coefficient from y, or the reverse. No smaller step stays on whole numbers.
4. Keep stepping both ways until a count would drop below what is allowed: 0 if "none" is allowed, 1 if the question says "at least one of each".

> **Example.** A bakery packs an order of exactly 96 muffins into boxes of 6
> and boxes of 8, filling every box. How many combinations of box counts
> are possible if at least one box of each size is used? What if one size
> may be left out?
>
> Let x be the boxes of 6 and y the boxes of 8: 6x + 8y = 96. Divide by 2:
> 3x + 4y = 48.
>
> One solution: x = 0 gives y = 12. The step is 4 in x and 3 in y: (0, 12),
> (4, 9), (8, 6), (12, 3), (16, 0).
>
> With at least one of each, (0, 12) and (16, 0) are out: 3 combinations.
> With one size allowed to be missing: 5.
>
> Check (8, 6): 6(8) + 8(6) = 48 + 48 = 96.

> **Trap.** Stepping by the original coefficients. From 6x + 8y, a step of
> 8 in x and 6 in y skips every other solution, (4, 9) and (12, 3) here.
> Divide out the common factor first. And count both ends: from x = 4 to
> x = 12 in steps of 4 is 3 values, not 8 ÷ 4 = 2.

### A line from its intercepts {#line-from-intercepts}

Call the intercepts (a, 0) and (0, b). Two facts turn a condition on them
into an equation in one letter:

- The slope between them is (b − 0)/(0 − a) = −b/a.
- The line is x/a + y/b = 1, for nonzero a and b. Clearing the fractions puts b with x and a with y: bx + ay = ab.

> **Example.** A line has slope 3, x-intercept (a, 0) and y-intercept
> (0, b), and a − b = 8. What is b?
>
> The slope is −b/a = 3, so b = −3a.
>
> Substitute: a − (−3a) = 8, so 4a = 8, a = 2 and b = −6.
>
> Check: from (2, 0) to (0, −6) the slope is (−6 − 0)/(0 − 2) = 3.

> **Example.** Which equation has x-intercept (6, 0) and y-intercept
> (0, −4)?
>
> x/6 + y/(−4) = 1. Multiply by 12: 2x − 3y = 12.
>
> Check: x = 6, y = 0 gives 12; x = 0, y = −4 gives 12.

> **Trap.** Taking the slope as b/a. The run from (a, 0) to (0, b) is −a,
> so the slope is −b/a: same steepness, opposite tilt.

> **Fails when.** The line passes through the origin (both intercepts are 0)
> or is horizontal or vertical (one intercept is missing). Then there is no
> x/a + y/b form; use slope and a point instead.

## What Hard looks like {#hard}

Hard questions in this skill test the line itself rather than a story:

- A point (s, t) on a line such as 2x + 7y = 11 and a question about another point on it. Use Δy = m · Δx; the start and the constant drop out (see [moving along a line](#moving-along-a-line)).
- A graphed line moved up, down, left or right, and a question about its new intercept or equation. Write the moved equation before setting a variable to 0 (see [translating a line](#translating-a-line)).
- A line known only through its intercepts: a slope and a sum of intercepts, a ratio of intercepts and a point, or intercepts written with a constant k (see [a line from its intercepts](#line-from-intercepts)).
- A story whose two counts must be whole numbers: how many combinations reach an exact total, or the greatest or least possible count. Step from one solution, and read whether "none" of one kind is allowed (see [whole-number solutions](#whole-number-solutions)).
