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
section. Hard questions mix up predicted and actual values, ask for the
meaning of a slope in context, or ask which kind of model (linear or
exponential) fits.

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

> **Desmos.** Put the data in a table (columns x₁ and y₁), then type
> `y_1~mx_1+b`. Desmos reports m, b and r. For an exponential fit, type
> `y_1~ab^{x_1}`. See [Desmos regressions](learn:sat/general/desmos#regressions).

## What Hard looks like {#hard}

- Predicted against actual in the same question, often phrased as "by how much did the model overestimate".
- Interpreting the slope or intercept of a fitted model in context, including recognizing when the intercept means nothing.
- Choosing between a linear and an exponential model from a table or a description.

> **Example.** A model predicts y = 2.1x + 14. For one data point,
> x = 10 and the actual y is 31. By how much does the model overestimate or
> underestimate this point?
>
> Predicted: 2.1(10) + 14 = 35. Actual minus predicted: 31 − 35 = −4.
>
> The model overestimates this point by 4.
