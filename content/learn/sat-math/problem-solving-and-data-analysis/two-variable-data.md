---
id: sat-math/problem-solving-and-data-analysis/two-variable-data
title: Two-variable data
section: sat-math
domain: Problem-Solving and Data Analysis
skill: Two-variable data
---
# Two-variable data

Two-variable data pairs two measurements for each item, such as hours
studied and quiz score for each student, and plots them as a scatterplot.
Questions ask you to describe the trend, read a line or curve of best fit,
make predictions and judge how far to trust them. This skill is part of
Problem-Solving and Data Analysis, {{fact:sat-math-psda}} of the Math
section.

## Before you start {#before-you-start}

This page uses a rate between two points and a prediction from a line
(Grade 8), and growth by a constant percent (Algebra). If a check goes
wrong, rebuild it with [lesson 2-8, slope](lessons.html#common-core-math/8/2-8),
[lesson 4-4, predictions from a linear model](lessons.html#common-core-math/8/4-4)
or [Algebra, week 15: exponential growth](weeks.html#high-school-math/algebra/15).

> **Try it.** A plant was 10 centimeters tall 2 weeks after planting and 22
> centimeters tall 6 weeks after planting. At what rate, in centimeters per
> week, did it grow?
>
> **Answer.** 3 centimeters per week
>
> The height rose 22 − 10 = 12 centimeters in 6 − 2 = 4 weeks, so the rate
> is 12/4 = 3 centimeters per week. Shaky?
> [Lesson 2-8](lessons.html#common-core-math/8/2-8).

> **Try it.** A trend line for a scatterplot is y = 2x + 15. What value of y
> does it predict when x = 8?
>
> **Answer.** 31
>
> y = 2(8) + 15 = 16 + 15 = 31. Shaky?
> [Lesson 4-4](lessons.html#common-core-math/8/4-4).

> **Try it.** A town of 2,000 people grows by 10% each year. What is its
> population after 2 years?
>
> **Answer.** 2,420
>
> Growing by 10% multiplies by 1.1 each year: 2,000 × 1.1 = 2,200, then
> 2,200 × 1.1 = 2,420. Adding 200 twice gives 2,400, which misses the growth
> on the first year's 200. Shaky?
> [Algebra, week 15](weeks.html#high-school-math/algebra/15).

## Linear models {#linear-models}

A line of best fit, y = mx + b, summarizes a trend. In context:

- The slope m is the predicted change in y for each 1-unit increase in x.
- The intercept b is the predicted y when x = 0, which may be meaningless if 0 is far outside the data.
- "Predicted" means read the line. "Actual" or "observed" means read the data point.
- Residual = actual − predicted, so actual = predicted + residual. Positive means the point is above the line: the model underestimated.

> **Example.** For a group of students, the line of best fit relating hours
> studied, x, to quiz score, y, is y = 4.5x + 52. Interpret the slope,
> predict the score for 6 hours, and compare it with a student who studied
> 6 hours and scored 85.
>
> Slope: each additional hour of study is associated with a predicted
> increase of 4.5 points.
>
> Prediction: 4.5(6) + 52 = 27 + 52 = 79.
>
> Residual: 85 − 79 = 6. The student scored 6 points above the prediction,
> so the model underestimated her score by 6.

> **Try it.** For a group of used cars, the line of best fit relating age in
> years, x, to value in thousands of dollars, y, is y = −1.8x + 24. Interpret
> the slope, predict the value of a 5-year-old car, and compare it with a
> 5-year-old car worth $13,500.
>
> **First step.** Slope: each additional year of age is associated with a
> predicted decrease of 1.8 thousand dollars, or $1,800, in value. Now make
> the prediction and compare.
>
> **Answer.** The prediction is $15,000; the car is worth $1,500 less than
> predicted, so the model overestimated its value.
>
> Prediction: −1.8(5) + 24 = −9 + 24 = 15, or $15,000.
>
> Residual: 13.5 − 15 = −1.5. The car is worth $1,500 less than the
> prediction.

> **Trap.** "Associated with" is not "causes". The line describes a trend in
> these students; it doesn't show that studying one more hour would raise a
> particular student's score by 4.5. Causal claims need a randomized
> experiment (see [study design](learn:sat-math/problem-solving-and-data-analysis/statistical-inference#study-design)).

Not every trend is a line. If equal steps in x multiply y by about the same
factor, an exponential model fits better; if they add about the same amount,
a linear one does (see [exponential functions](learn:sat-math/advanced-math/nonlinear-functions#exponential-functions)).

> **Example.** A town's population was 5,000, 5,500, 6,050 and 6,655 in four
> consecutive years. Linear or exponential?
>
> Differences: 500, 550, 605. Not constant.
>
> Ratios: 5,500/5,000 = 1.1, 6,050/5,500 = 1.1, 6,655/6,050 = 1.1. Constant,
> so the population grows 10% a year: P = `5000·1.1^t`.

> **Try it.** The number of fish in a lake was 3,200, 2,400, 1,800 and 1,350
> in four consecutive years. Linear or exponential?
>
> **Answer.** Exponential: the number falls 25% a year.
>
> Differences: −800, −600, −450. Not constant.
>
> Ratios: 2,400/3,200 = 0.75, 1,800/2,400 = 0.75, 1,350/1,800 = 0.75.
> Constant, so each year's count is 75% of the year before:
> F = `3200·0.75^t`.

### A slope in other units {#slope-in-other-units}

A model's slope is in the model's own units: thousands of dollars per
hundred square feet, say. When a question asks about a difference in other
units, convert the change in x into the model's units, multiply by the
slope, and convert the change in y into the units asked for.

> **Example.** A line of best fit for some homes is y = 2.5x + 40, where y is
> the predicted monthly heating cost in dollars and x is the floor area in
> hundreds of square feet. Two homes differ in floor area by 600 square
> feet. By how much do their predicted heating costs differ over a year?
>
> 600 square feet is 6 hundred square feet. The predicted monthly
> difference is 2.5 × 6 = 15 dollars.
>
> Over 12 months: 15 × 12 = 180 dollars.

> **Try it.** A line of best fit for some apartments is y = 3.2x + 25, where
> y is the predicted monthly electricity cost in dollars and x is the floor
> area in hundreds of square feet. Two apartments differ in floor area by 500
> square feet. By how much do their predicted electricity costs differ over a
> year?
>
> **First step.** 500 square feet is 5 hundred square feet. Now finish.
>
> **Answer.** $192
>
> The predicted monthly difference is 3.2 × 5 = 16 dollars.
>
> Over 12 months: 16 × 12 = 192 dollars.

For a difference between two predictions, the intercept cancels, so you
never need it.

> **Fails when.** The question asks for one prediction, not a difference.
> Then the intercept counts: a 1,200-square-foot home is predicted to cost
> 2.5 × 12 + 40 = 70 dollars a month.

For a harder version, with percent changes in a model's input and
prediction, see [percent changes within a model](#percent-changes-in-a-model).

## Scatterplots {#scatterplots}

Describe a scatterplot by its direction (positive: y tends to rise as x
rises; negative: y tends to fall), its form (linear or curved) and its
strength (points close to a line or widely scattered). A point far from the
pattern is an outlier.

The table below lists daily high temperature and lemonade sales at a stand.

| Temperature (°F) | 60 | 65 | 70 | 75 | 80 | 85 |
| --- | --- | --- | --- | --- | --- | --- |
| Cups sold | 120 | 135 | 155 | 170 | 190 | 200 |

> **Example.** Using the table above, estimate the slope of a line of best
> fit, and predict sales on a 72°F day.
>
> The association is positive and close to linear. Use the ends: from
> (60, 120) to (85, 200), the slope is (200 − 120)/(85 − 60) = 80/25 = 3.2
> cups per degree.
>
> Prediction at 72°F: 120 + 3.2(72 − 60) = 120 + 38.4 ≈ 158 cups.
>
> A prediction for a 110°F day would be an extrapolation far outside the
> data (60°F to 85°F), so it is much less reliable.

> **Try it.** A theater tried a different ticket price on each of six
> nights.
>
> | Price (dollars) | 10 | 12 | 14 | 16 | 18 | 20 |
> | --- | --- | --- | --- | --- | --- | --- |
> | Tickets sold | 410 | 380 | 345 | 320 | 290 | 260 |
>
> Estimate the slope of a line of best fit, and predict sales at a price of
> $15.
>
> **First step.** The association is negative and close to linear. Use the
> ends, (10, 410) and (20, 260). Now find the slope and the prediction.
>
> **Answer.** About −15 tickets per dollar; about 335 tickets.
>
> Slope: (260 − 410)/(20 − 10) = −150/10 = −15 tickets per dollar.
>
> Prediction at $15: 410 − 15(15 − 10) = 410 − 75 = 335 tickets.

Estimating a best-fit slope from two points far apart along the trend is
quick and usually close enough to pick among the choices.

> **Fails when.** One of the points you use is an outlier or sits well off
> the trend, or the choices are close together. Then use points on the drawn
> line itself, or run a regression in Desmos.

### Line graphs over time {#line-graphs}

A line graph joins one value for each time with segments. The change
between two times is the later value minus the earlier one, and the
steepest segment, up or down, is the greatest change between consecutive
times. Read each value from the gridlines, not from how long a segment
looks.

> **Example.** A line graph shows a library's visitors, in thousands, each
> year from 2018 to 2023. The plotted values are:
>
> | Year | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 |
> | --- | --- | --- | --- | --- | --- | --- |
> | Visitors (thousands) | 42 | 45 | 39 | 30 | 38 | 47 |
>
> Between which two consecutive years did visits increase the most, and in
> how many of the years were there more than 40 thousand visitors?
>
> Changes: +3, −6, −9, +8 and +9. The greatest increase, +9, is from 2022
> to 2023. The −9 from 2020 to 2021 is just as steep, but it is a decrease.
>
> More than 40: 42, 45 and 47, so 3 years. A value of exactly 40 would not
> count as "more than".

> **Try it.** A line graph shows the members of a running club at the start
> of each month:
>
> | Month | Jan | Feb | Mar | Apr | May | Jun |
> | --- | --- | --- | --- | --- | --- | --- |
> | Members | 24 | 20 | 28 | 30 | 22 | 32 |
>
> Between which two consecutive months did membership increase the most,
> and in how many of the months were there at least 28 members?
>
> **Answer.** From May to June; 3 months.
>
> Changes: −4, +8, +2, −8 and +10. The greatest increase is +10, from May
> to June.
>
> At least 28: 28, 30 and 32, so 3 months. "At least" includes the 28.

### Residuals {#residuals}

A residual compares a point only with its own prediction:

- "Farthest below the prediction" means the most negative residual.
- "Farthest from the line" means the residual largest in size, ignoring its sign: −3 is farther than 2.5. A residual measures straight up or down to the line.
- The largest residual is not always the largest actual value.

For some puppies, a line of best fit is y = 0.8x + 3, where y is the
predicted weight in pounds and x is the age in weeks. The table gives three
puppies' ages and residuals.

| Puppy | Age (weeks) | Residual (pounds) |
| --- | --- | --- |
| Ace | 5 | 2.5 |
| Bo | 10 | −1 |
| Cy | 12 | −3 |

> **Example.** Using the table above, which puppy weighs the most, and which
> is farthest from the line?
>
> Predictions: Ace 0.8(5) + 3 = 7, Bo 0.8(10) + 3 = 11, Cy 0.8(12) + 3 =
> 12.6.
>
> Actual weights, predicted + residual: Ace 7 + 2.5 = 9.5, Bo 11 − 1 = 10,
> Cy 12.6 − 3 = 9.6. Bo weighs the most, though Ace has the largest
> residual.
>
> Farthest from the line: Cy, 3 pounds below it, more than Ace's 2.5 above.

> **Try it.** For some small businesses, a line of best fit is
> y = 1.5x + 20, where y is the predicted monthly revenue in thousands of
> dollars and x is the number of employees.
>
> | Business | Employees | Residual (thousands of dollars) |
> | --- | --- | --- |
> | P | 4 | 5 |
> | Q | 10 | −1 |
> | R | 12 | −3.5 |
>
> Which business has the greatest actual revenue, and which is farthest from
> the line?
>
> **First step.** Predictions: P 1.5(4) + 20 = 26, Q 1.5(10) + 20 = 35,
> R 1.5(12) + 20 = 38. Now finish.
>
> **Answer.** R has the greatest revenue; P is farthest from the line.
>
> Actual revenues, predicted + residual: P 26 + 5 = 31, Q 35 − 1 = 34,
> R 38 − 3.5 = 34.5. R has the greatest revenue, though its residual is the
> most negative.
>
> Farthest from the line: P, 5 above it, more than R's 3.5 below.

> **Trap.** Subtracting a residual from the prediction. A positive residual
> means the actual value is more than predicted, so add it: Ace is 9.5
> pounds, not 4.5.

### Reading a residual plot {#residual-pattern}

A residual plot keeps x on the horizontal axis but replaces the original y
with actual − predicted. Its reference line is residual = 0. Points above
and below zero without a clear pattern are consistent with the proposed
model; a systematic curve suggests that the model misses part of the trend.

> **Example.** At x = 1, 2, 3, 4 and 5, a linear model has residuals
> 4, −1, −6, −1 and 4. Does a sum of zero show that the fit has no problem?
>
> No. The model predicts too low at the ends and too high in the middle.
> The residuals sum to zero but form a curved pattern. A curved model is
> worth investigating; positive and negative errors canceling does not
> establish a suitable fit.

> **Try it.** A linear model is y = 3x + 10. At x = 2, 4, 6, 8 and 10, its
> residuals are −5, 2, 6, 2 and −5. Does the model predict too high or too
> low at the ends, and what was the observed value of y at x = 6?
>
> **Answer.** Too high at the ends; the observed value at x = 6 was 34.
>
> At the ends the residuals are negative, so the actual values are less
> than predicted: the model predicts too high there and too low in the
> middle. The curved pattern suggests a curved model.
>
> At x = 6 the prediction is 3(6) + 10 = 28, and actual = predicted +
> residual = 28 + 6 = 34.

> **Fails when.** You conclude that a pattern-free residual plot proves
> the model is true or causal. It is one diagnostic within the observed
> range. A few observations, hidden groups or extrapolation can still make
> predictions unreliable.

### Exponential fits over several units {#exponential-over-several-units}

In y = a · bˣ, each increase of 1 in x multiplies the prediction by b. Over k
units it is multiplied by bᵏ, so the percent change over k units is bᵏ − 1,
not k times the one-unit percent.

> **Example.** A model for a count of bacteria is y = 200(1.2)ˣ, with x in
> hours. By what percent does the predicted count grow every 3 hours?
>
> 1.2³ = 1.728, so every 3 hours the prediction is multiplied by 1.728: an
> increase of 72.8%.
>
> The trap is 60%, three times 20%, which ignores that each hour's growth
> builds on the last.

> **Try it.** A model for the value of a machine is y = 40,000(0.9)ˣ, with x
> in years. By what percent does the predicted value decrease every 2 years?
>
> **Answer.** 19%
>
> 0.9² = 0.81, so every 2 years the prediction is multiplied by 0.81: a
> decrease of 1 − 0.81 = 0.19, or 19%. Twice 10% would give 20%.

> **Desmos.** Put the data in a table (columns x₁ and y₁), then type
> `y_1~mx_1+b`. Desmos reports m, b and r. For an exponential fit, type
> `y_1~ab^{x_1}`. See [Desmos regressions](learn:sat/general/desmos#regressions).

For a harder version of scatterplot questions, see
[removing an outlier](#removing-an-outlier).

## Harder versions {#hard}

The hardest questions in this skill make you work through the model: from
a removed point to a new line, or from percents to the model's units.

### Removing an outlier {#removing-an-outlier}

A point far from the trend pulls the line of best fit toward it, most
strongly when it sits near one end of the data. Remove it and that end of
the line swings back, which turns the whole line: the slope changes, and the
other end may move the opposite way. Check the positions of the remaining
points: this is not a universal rule for every outlier.

> **Example.** Five points, (1, 3), (3, 5), (5, 7), (7, 9), and (9, 11),
> lie on y = x + 2. A sixth point, (9, 3), lies well below that trend.
> With all six points, the least-squares line is y = 0.5x + 3.5.
>
> Removing (9, 3) restores y = x + 2: the slope increases from 0.5 to 1,
> and the y-intercept decreases from 3.5 to 2.

> **Try it.** Five points, (0, 10), (2, 14), (4, 18), (6, 22) and (8, 26),
> lie on y = 2x + 10. A sixth point, (0, 2), lies well below that trend. If
> (0, 2) is removed, how does the line of best fit change?
>
> - A) The slope increases, and the y-intercept increases.
> - B) The slope increases, and the y-intercept decreases.
> - C) The slope decreases, and the y-intercept increases.
> - D) The slope decreases, and the y-intercept decreases.
>
> **Hint.** Which end of the line does (0, 2) pull, and which way?
>
> **Answer.** C
>
> (0, 2) sits at the left end, below the trend, so it pulls the left end of
> the line down and tilts the line steeper. With all six points, the
> least-squares line is y = 2.5x + 7.
>
> Removing (0, 2) restores y = 2x + 10: the slope decreases from 2.5 to 2,
> and the y-intercept increases from 7 to 10.

> **Fails when.** An outlier near the mean x-value mainly shifts the fitted
> line vertically. More generally, removing a point changes both means as
> well as the slope; the intercept and opposite endpoint need not move in
> the directions suggested by a simple pivot picture. Inspect the actual
> data or refit the line when the geometry is unclear.

### Percent changes within a model {#percent-changes-in-a-model}

When a question gives percent changes in both a model's input and its
prediction, apply the output percent to the whole prediction, intercept
included, then convert the answer from model units.

> **Example.** A model for apartment rents is y = 2x + 12, with x in
> hundreds of square feet and y in hundreds of dollars. Apartment B has 50%
> more floor area than A and a predicted rent 25% higher. Find A's area.
>
> Let A's area be x model units. Then B's is 1.5x, so
> 2(1.5x) + 12 = 1.25(2x + 12).
>
> Thus 3x + 12 = 2.5x + 15, giving x = 6. A has 600 square feet.
>
> Check: the predicted rents are 24 and 30 model units; 30 is 25% above 24.
> Applying the rent percent only to 2x would ignore the intercept.

> **Try it.** A model for monthly heating costs is y = 4x + 30, where x is
> the floor area in hundreds of square feet and y is the predicted cost in
> dollars. Home B has 50% more floor area than home A and a predicted cost
> 20% higher. What is home A's floor area, in square feet?
>
> **First step.** Let A's area be x model units. Then B's is 1.5x, so
> 4(1.5x) + 30 = 1.2(4x + 30). Now solve and convert.
>
> **Answer.** 500 square feet
>
> 6x + 30 = 4.8x + 36, so 1.2x = 6 and x = 5. A has 5 hundred, or 500,
> square feet.
>
> Check: the predicted costs are 4(5) + 30 = 50 and 4(7.5) + 30 = 60
> dollars; 60 is 20% above 50.
