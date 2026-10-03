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
section. Hard questions ask for a predicted change in units the model
doesn't use, how removing one point moves the line of best fit, or what an
exponential model predicts over several units at once.

## Linear models {#linear-models}

A line of best fit, y = mx + b, summarizes a trend. In context:

- The slope m is the predicted change in y for each 1-unit increase in x.
- The intercept b is the predicted y when x = 0, which may be meaningless if 0 is far outside the data.
- "Predicted" means read the line. "Actual" or "observed" means read the data point.
- Residual = actual − predicted. Positive means the point is above the line: the model underestimated.

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

For a difference between two predictions, the intercept cancels, so you
never need it.

> **Fails when.** The question asks for one prediction, not a difference.
> Then the intercept counts: a 1,200-square-foot home is predicted to cost
> 2.5 × 12 + 40 = 70 dollars a month.

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

Estimating a best-fit slope from two points far apart along the trend is
quick and usually close enough to pick among the choices.

> **Fails when.** One of the points you use is an outlier or sits well off
> the trend, or the choices are close together. Then use points on the drawn
> line itself, or run a regression in Desmos.

### Residuals {#residuals}

A residual is actual − predicted: how far a data point sits above the line
of best fit (positive) or below it (negative). Turned around, actual =
predicted + residual.

- "Farthest below the prediction" means the most negative residual.
- "Farthest from the line" means the residual largest in size, ignoring its sign: −3 is farther than 2.5. A residual measures straight up or down to the line.
- The largest residual is not always the largest actual value. A residual compares a point only with its own prediction.

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

> **Fails when.** You conclude that a pattern-free residual plot proves
> the model is true or causal. It is one diagnostic within the observed
> range. A few observations, hidden groups or extrapolation can still make
> predictions unreliable.

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

> **Fails when.** An outlier near the mean x-value mainly shifts the fitted
> line vertically. More generally, removing a point changes both means as
> well as the slope; the intercept and opposite endpoint need not move in
> the directions suggested by a simple pivot picture. Inspect the actual
> data or refit the line when the geometry is unclear.

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

> **Desmos.** Put the data in a table (columns x₁ and y₁), then type
> `y_1~mx_1+b`. Desmos reports m, b and r. For an exponential fit, type
> `y_1~ab^{x_1}`. See [Desmos regressions](learn:sat/general/desmos#regressions).

## What Hard looks like {#hard}

- A line of best fit and a table of residuals, and a question about which point has the greatest actual value or lies farthest below the line. Add each residual to its own prediction; the largest residual doesn't mark the largest value (see [residuals](#residuals)).
- Different percent changes in a model's input and prediction, with the input unknown. The intercept matters: set up both predictions, apply the output percent to the whole prediction, and convert the answer from model units.
- One point removed from a scatterplot and a question about how the new line of best fit compares: its slope, and its value at an end or at x = 0 (see [removing an outlier](#removing-an-outlier)).

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
