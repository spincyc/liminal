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
Algebra, {{fact:sat-math-algebra}} of the Math section.

## Before you start {#before-you-start}

This page uses three skills from Grade 8: the slope between two points,
the slope and y-intercept of y = mx + b, and solving a two-step equation.
Try these first. If one goes wrong, rebuild it with
[lesson 2-8, slope](lessons.html#common-core-math/8/2-8),
[lesson 2-11, y = mx + b](lessons.html#common-core-math/8/2-11) or
[lesson 2-1, solving equations](lessons.html#common-core-math/8/2-1).

> **Try it.** What is the slope of the line through (1, 2) and (4, 11)?
>
> **Answer.** 3
>
> The rise is 11 − 2 = 9 and the run is 4 − 1 = 3, so the slope is
> 9/3 = 3. Shaky? [Lesson 2-8](lessons.html#common-core-math/8/2-8).

> **Try it.** For y = −2x + 7, what are the slope and the y-intercept?
>
> **Answer.** The slope is −2 and the y-intercept is (0, 7).
>
> In y = mx + b, m is the slope and b is the value of y at x = 0:
> y = −2(0) + 7 = 7. Shaky?
> [Lesson 2-10](lessons.html#common-core-math/8/2-10) and
> [lesson 2-11](lessons.html#common-core-math/8/2-11).

> **Try it.** If 4x + 3y = 24 and x = 3, what is y?
>
> **Answer.** y = 4
>
> Substitute: 4(3) + 3y = 24, so 12 + 3y = 24. Subtract 12: 3y = 12, so
> y = 4. Shaky? [Lesson 2-1](lessons.html#common-core-math/8/2-1).

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

> **Try it.** A club spends exactly $48 on snacks at $4 a bag and drinks at
> $6 a bottle, so 4x + 6y = 48, where x is bags and y is bottles. What does
> the y-intercept mean, is (6, 4) on the line, and what does the slope mean?
>
> **First step.** Solve for y: 6y = 48 − 4x, so y = 8 − (2/3)x. Now read
> the y-intercept and the slope in context, and test the point.
>
> **Answer.** (0, 8): with no snacks, 8 bottles. (6, 4) is on the line. The
> slope is −2/3: 2 fewer bottles for every 3 more bags.
>
> y-intercept: x = 0 gives y = 8, so with no snacks the club can buy 8
> bottles.
>
> (6, 4): 4(6) + 6(4) = 24 + 24 = 48, so 6 bags and 4 bottles cost exactly
> $48.
>
> Slope: −2/3 in y = 8 − (2/3)x. Each extra bag means 2/3 of a bottle
> fewer.

> **Trap.** Choosing an interpretation that swaps the variables ("each extra
> pen costs 3 notebooks"). Write out which letter is which before reading
> the choices.

When the graph has no equation, pick two points the grid makes easy to read,
find the slope, and use an intercept. Then answer the question from the
equation, not from eyeballing the picture.

### Slope from standard form {#standard-form-slope}

For B ≠ 0, solving Ax + By = C for y gives y = (−A/B)x + C/B. So the slope is −A/B:
the x-coefficient over the y-coefficient, with the sign changed.

> **Example.** What is the slope of the graph of 4x − 10y = 30?
>
> Shortcut: −A/B = −4/(−10) = 2/5.
>
> By solving: −10y = −4x + 30, so y = (2/5)x − 3. The slope is 2/5.

> **Try it.** What is the slope of the graph of 6x + 9y = 45?
>
> **Answer.** −2/3
>
> Shortcut: −A/B = −6/9 = −2/3.
>
> By solving: 9y = −6x + 45, so y = −(2/3)x + 5.

> **Fails when.** The x-term and the y-term are not on the same side. In
> 2x = 3y + 6, A is 2 but B is not 3: rewrite it as 2x − 3y = 6 first, and
> the slope is −2/(−3) = 2/3, not −2/3.
> If B = 0 and A ≠ 0, the line is vertical and its slope is undefined.

> **Try it.** What is the slope of the graph of 8x = 2y + 10?
>
> **Answer.** 4
>
> The terms are on opposite sides, so solve for y: 2y = 8x − 10, and
> y = 4x − 5. Reading −8/2 = −4 straight from the equation gives the wrong
> sign.

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

> **Try it.** The points (a, b) and (a + 6, b + t) both lie on the graph of
> 2x − 3y = 9. What is t?
>
> **Hint.** Find the slope first, then use Δy = m · Δx.
>
> **Answer.** t = 4
>
> The slope is −2/(−3) = 2/3. Moving 6 right means Δx = 6, so
> Δy = (2/3)(6) = 4.
>
> Check by subtracting: 2(a + 6) − 3(b + t) = 9 and 2a − 3b = 9 leave
> 12 − 3t = 0, so t = 4.

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

> **Try it.** A line passes through (0, 4) and (2, 0). It is translated 2
> units up. What is the x-intercept of the new line?
>
> **Answer.** (3, 0)
>
> The slope is (0 − 4)/(2 − 0) = −2, so the line is y = −2x + 4. Moving it
> 2 up gives y = −2x + 6.
>
> Set y = 0: 2x = 6, so x = 3. The x-intercept moved 1 unit, from 2 to 3,
> not 2 units.

> **Trap.** Moving the x-intercept by the size of the vertical shift, or
> replacing y with y + d to move a line up. Up d means y − d inside the
> equation.

For a harder version of graph interpretation, where only the signs of the
constants are known, see [which quadrants a line passes through](#signs-and-quadrants).

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

> **Try it.** A fundraiser sold shirts at $15 and hats at $9 and took in
> $1,230. Write an equation, then find the number of hats sold if 40 shirts
> were sold.
>
> **First step.** Let s be shirts and h be hats. Each term is dollars:
> 15s + 9h = 1,230. Now substitute and solve.
>
> **Answer.** 70 hats
>
> Substitute s = 40: 15(40) + 9h = 1,230, so 600 + 9h = 1,230.
>
> Subtract 600: 9h = 630, so h = 70.

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

> **Try it.** One gym charges a $60 joining fee plus $25 per month. Another
> charges $40 per month and no joining fee. Write each total cost as an
> equation in m, the number of months. After how many months are the totals
> equal, and which gym costs less for a full year?
>
> **Answer.** 4 months ($160 at each); for a year the first gym costs less.
>
> First gym: C = 60 + 25m. Second gym: C = 40m.
>
> Equal totals: 60 + 25m = 40m, so 60 = 15m and m = 4. Check:
> 60 + 25(4) = 160 and 40(4) = 160.
>
> For 12 months: 60 + 25(12) = 360 against 40(12) = 480.

> **Check.** Before choosing a model, test it with a number you can reason
> about without algebra. If 0 guests should cost $150, the equation must
> give C = 150 at g = 0.

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

> **Try it.** A line has slope −2, x-intercept (a, 0) and y-intercept
> (0, b), and a + b = 9. What is b?
>
> **Answer.** b = 6
>
> The slope is −b/a = −2, so b = 2a.
>
> Substitute: a + 2a = 9, so a = 3 and b = 6.
>
> Check: from (3, 0) to (0, 6) the slope is (6 − 0)/(0 − 3) = −2.

> **Example.** Which equation has x-intercept (6, 0) and y-intercept
> (0, −4)?
>
> x/6 + y/(−4) = 1. Multiply by 12: 2x − 3y = 12.
>
> Check: x = 6, y = 0 gives 12; x = 0, y = −4 gives 12.

> **Try it.** Which equation has x-intercept (−5, 0) and y-intercept (0, 2)?
>
> - A) 2x + 5y = 10
> - B) −2x + 5y = 10
> - C) 5x − 2y = 10
> - D) 5x + 2y = −10
>
> **Answer.** B
>
> x/(−5) + y/2 = 1. Multiply by 10: −2x + 5y = 10.
>
> Check: x = −5, y = 0 gives 10; x = 0, y = 2 gives 10. Choice A gives −10
> at (−5, 0), and C and D give −25 there.

> **Trap.** Taking the slope as b/a. The run from (a, 0) to (0, b) is −a,
> so the slope is −b/a: same steepness, opposite tilt.

> **Fails when.** The line passes through the origin (both intercepts are 0)
> or is horizontal or vertical (one intercept is missing). Then there is no
> x/a + y/b form; use slope and a point instead.

For a harder version of equation modeling, counting the whole-number
combinations that reach an exact total, see
[whole-number solutions](#whole-number-solutions).

## Harder versions {#hard}

The hardest questions in this skill test the line itself: which
whole-number points lie on it, or which quadrants it can pass through when
only the signs of its constants are known.

### Which quadrants a line passes through {#signs-and-quadrants}

For ax + by = c with b ≠ 0, the slope is −a/b and the y-intercept is c/b.
When only the signs of the constants are known, find the sign of each; the
pair of signs decides the quadrant the line misses:

| Slope | y-intercept | Misses |
| --- | --- | --- |
| positive | positive | Quadrant IV |
| positive | negative | Quadrant II |
| negative | positive | Quadrant III |
| negative | negative | Quadrant I |

> **Try it.** In the xy-plane, the graph of ax + by = c is a line, where a,
> b and c are constants with ab > 0 and bc < 0. Which quadrant does the line
> not pass through?
>
> **Hint.** Find the signs of the slope, −a/b, and of the y-intercept, c/b.
>
> **Answer.** Quadrant I
>
> ab > 0 means a and b have the same sign, so the slope −a/b is negative.
> bc < 0 means b and c have opposite signs, so the y-intercept c/b is
> negative. A falling line through a negative y-intercept misses
> Quadrant I.
>
> Check with a = 1, b = 1 and c = −2: the line y = −x − 2 passes through
> Quadrants II, III and IV only.

### Whole-number solutions {#whole-number-solutions}

When x and y count things, only whole-number points on the line count. To
list them all for ax + by = c:

1. Find the greatest common divisor of a and b. If it does not divide c, there are no whole-number solutions. Otherwise divide all three coefficients by it.
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

> **Try it.** A florist spends exactly $120 on roses at $4 each and lilies
> at $6 each, buying at least one of each. How many combinations of rose and
> lily counts are possible?
>
> **Hint.** Write the cost equation, divide out the common factor, and find
> one whole-number solution to step from.
>
> **Answer.** 9
>
> Let x be roses and y lilies: 4x + 6y = 120. Divide by 2: 2x + 3y = 60. One
> solution is x = 0, y = 20.
>
> The step is 3 in x and −2 in y: (0, 20), (3, 18), (6, 16), …, (30, 0).
> Those are x = 0, 3, 6, …, 30, which is 30/3 + 1 = 11 points.
>
> At least one of each rules out (0, 20) and (30, 0), leaving 9.
>
> Check (12, 12): 4(12) + 6(12) = 48 + 72 = 120.

> **Trap.** Stepping by the original coefficients. From 6x + 8y, a step of
> 8 in x and 6 in y skips every other solution, (4, 9) and (12, 3) here.
> Divide out the common factor first. And count both ends: from x = 4 to
> x = 12 in steps of 4 is 3 values, not 8 ÷ 4 = 2.
