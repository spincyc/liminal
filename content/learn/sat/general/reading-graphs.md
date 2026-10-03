---
id: sat/general/reading-graphs
title: Reading graphs
---
# Reading graphs

A graph connects quantities. Before calculating, name what each axis measures,
read its units and scale, and identify the line or points the question uses.
Then decide whether you need an input, an output, a change, or a set of
possible values. These habits carry across Math graphs and Reading and
Writing data displays.

## Read the scale before the shape {#scales}

Equal distances on a linear axis represent equal changes in value. The two
axes need not use the same step. Count intervals between labeled ticks,
not the number of tick marks, and keep any multiplier such as "thousands."

> **Example.** On a line graph, each horizontal grid interval represents
> 2 hours and each vertical interval represents 30 liters. A line passes
> through (2, 90) and (6, 150). What is its rate of change?
>
> The output rises 150 − 90 = 60 liters while time increases
> 6 − 2 = 4 hours. The rate is 60/4 = 15 liters per hour.
>
> On the page the line rises two squares and runs two squares, but a slope
> of 1 would ignore the different units per square.

A cropped vertical axis does not change the values, but it can make a small
difference look large. If bars end at 48 and 52 on an axis starting at 40,
the second value is 4 greater; it is not 50% greater because its visible
bar is 12 units tall instead of 8.

> **Trap.** Comparing steepness across graphs with different scales, or
> treating the bottom edge of a cropped graph as y = 0. Read labeled
> coordinates before calculating a slope or ratio.

## Match the quantity the question asks for {#inputs-and-outputs}

For a function, (a, b) means f(a) = b. Read the coordinates in that order.

| Task | What to read |
| --- | --- |
| Find f(3) | Start at x = 3 and read the output y |
| Solve f(x) = 3 | Find every point at height y = 3 and report its x-coordinate |
| Find a zero | Find where y = 0 and report x |
| Find the y-intercept | Find where x = 0 and report y, or (0, y) if a point is asked for |
| Find the maximum value | Highest included output y |
| Find where the maximum occurs | Input x at that highest point |

> **Example.** The full graph of f(x) = −(x − 2)² + 9 has vertex (2, 9)
> and passes through (0, 5) and (4, 5). Find f(0), the solutions to
> f(x) = 5, and the maximum value.
>
> f(0) = 5. The horizontal line y = 5 meets the parabola at x = 0 and
> x = 4, so there are two solutions. The maximum value is 9, occurring
> at x = 2. The answer to "maximum value" is not 2.

For a line, slope and intercept answer different questions. In C(t) = 12t + 35,
the slope is 12 cost units per time unit, and the starting cost is 35.
The line's height at a particular t is neither of those in general. See
[slope and intercepts](learn:sat-math/algebra/linear-functions).

> **Fails when.** A visible window shows only part of the graph. A curve
> leaving the screen has not necessarily ended, and another solution may
> lie outside the window. Use arrows, stated restrictions and the equation
> to decide what continues.

## Domain, range and endpoints {#domain-and-range}

The domain contains all allowed inputs, read horizontally. The range
contains all attained outputs, read vertically. An open circle excludes
that point; a filled circle includes it. An arrow means the graph continues.

> **Example.** A graph consists only of a straight segment from an open
> circle at (−2, 5) to a filled circle at (4, −1). Find its domain and range.
>
> The inputs extend from −2, excluded, to 4, included: −2 < x ≤ 4.
>
> The outputs extend from −1, included, to 5, excluded: −1 ≤ y < 5.
> The smallest output comes from the right endpoint, so copying the
> domain's inequality signs in the same order would be wrong.

An open point removes one ordered pair. Its x-value or y-value can still
occur at a different included point elsewhere on a multi-piece graph.

> **Example.** A graph consists of y = x + 1 for −2 ≤ x < 2, together
> with the single filled point (2, 0). What are f(2), the domain and range?
>
> The line has an open endpoint at (2, 3), but the filled point gives
> f(2) = 0. The domain is −2 ≤ x ≤ 2. The line already attains every
> output from −1 through values below 3, including 0, so the range stays
> −1 ≤ y < 3. The excluded output 3 is not supplied by the filled point.

For a curve, check interior turning points too. On the restricted domain
0 ≤ x ≤ 3, f(x) = (x − 2)² has range 0 ≤ y ≤ 4: the vertex gives 0,
while the endpoints give 4 and 1.

> **Trap.** Using only endpoints to find a curved graph's range, including
> an open endpoint, or assuming the edge of a viewing window is an endpoint.

## Intersections and shaded regions {#solutions}

An intersection satisfies both equations. For f(x) = g(x), report the
x-coordinate unless the question asks for the point or its y-coordinate.
A touch counts as an intersection even when the curves do not cross.

> **Example.** The graphs y = x + 1 and y = (x − 1)² meet where
> x + 1 = x² − 2x + 1. Rearranging gives x(x − 3) = 0.
>
> The solutions for x are 0 and 3. The intersection points are (0, 1)
> and (3, 4); their y-coordinates, 1 and 4, are not the solutions for x.

For inequalities, check both the boundary and the side. Solid boundaries
include equality; dashed ones exclude it. A system needs the overlap of all
conditions. A point on one allowed boundary can still fail another inequality.
See [systems of inequalities](learn:sat-math/algebra/linear-inequalities#systems-of-inequalities)
for worked shaded-region examples.

## Read a model as a model {#data-models}

A scatterplot point is an observation. A fitted line gives a prediction at
the same input. Their vertical difference is the residual:
observed − predicted. A positive residual means the model predicted too low.

> **Example.** A model predicts 26 minutes for a trip of 8 kilometers, but
> the observed trip took 31 minutes. The residual is 31 − 26 = 5 minutes.
> The point lies above the model line. It does not mean the distance was
> 5 kilometers greater, or that the model predicted too high.

Use the plotted line for a prediction and the plotted point for an
observation. When a fitted line is supplied, find its slope from two readable
points on that line, not from two arbitrary observations. Continue with
[scatterplots and residuals](learn:sat-math/problem-solving-and-data-analysis/two-variable-data#scatterplots).

> **Fails when.** You treat an association as a cause or extend a fitted
> trend indefinitely. A good fit in the observed range neither explains
> why the association occurs nor establishes behavior outside that range.

## Use a graph as evidence {#quantitative-evidence}

In a data display, identify the named series and interval before comparing.
"Largest value," "largest increase" and "largest percent increase" can
describe different series. A true number must also support the text's claim.
Work through [quantitative evidence](learn:sat-reading-writing/information-and-ideas/command-of-evidence#quantitative-evidence)
for the accuracy-and-relevance test.

> **Example.** A line graph records annual ridership, in thousands. Route A
> goes from 40 to 50; Route B goes from 15 to 24 over the same interval.
>
> A ends higher and increases more riders: 10,000 versus 9,000. B grows by
> a greater percentage: 9/15 = 60%, compared with A's 10/40 = 25%.
> A statement about "faster percentage growth" needs the latter comparison.

## Practice by the error you made {#practice}

Cover each solution before working an example. Afterward, name the error
precisely and use the corresponding lesson:

| Error | Next lesson |
| --- | --- |
| Read squares instead of axis values; confused rate and starting value | [Linear functions](learn:sat-math/algebra/linear-functions) |
| Swapped a solution's x and y | [Linear systems](learn:sat-math/algebra/systems-of-two-linear-equations) |
| Lost a boundary or shaded the wrong side | [Linear inequalities](learn:sat-math/algebra/linear-inequalities) |
| Shifted or stretched a curve in the wrong direction | [Nonlinear transformations](learn:sat-math/advanced-math/nonlinear-functions#transformations) |
| Read a point when asked for the prediction | [Two-variable data](learn:sat-math/problem-solving-and-data-analysis/two-variable-data) |
| Chose accurate numbers for the wrong claim | [Command of Evidence](learn:sat-reading-writing/information-and-ideas/command-of-evidence#quantitative-evidence) |

Use [Desmos](learn:sat/general/desmos) to check a Math graph after deciding
what the coordinates mean. A calculator can locate points; you still have
to choose which coordinate, unit and restriction answers the question.
