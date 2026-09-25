---
id: sat-math/problem-solving-and-data-analysis/one-variable-data
title: One-variable data
section: sat-math
domain: Problem-Solving and Data Analysis
skill: One-variable data
---
# One-variable data

One-variable data is a list of values of a single quantity: test scores,
heights, daily rainfall. Questions ask for the center (mean, median), the
spread (range, interquartile range, standard deviation) and the shape, read
from lists, frequency tables, dot plots, histograms and box plots. The skill
is part of Problem-Solving and Data Analysis, {{fact:sat-math-psda}} of the
Math section. Hard questions ask how a change to the data moves each
measure, or give a display from which one measure can't be found at all.

## Mean and median {#mean-and-median}

- Mean: the sum of the values divided by how many there are.
- Median: the middle value once the values are in order. With an even count, it is the mean of the two middle values.

Most mean questions are really sum questions: if n values have mean m,
their sum is n × m.

> **Example.** Five numbers have a mean of 12. One number is removed, and the
> remaining four have a mean of 13. What number was removed?
>
> Sum of all five: 5 × 12 = 60. Sum of the four: 4 × 13 = 52.
>
> The removed number is 60 − 52 = 8.

> **Example.** In a survey, 20 students reported how many books they read
> last month: 3 read 1 book, 5 read 2, 8 read 3, and 4 read 4. Find the mean
> and the median.
>
> Mean: multiply each value by its frequency and divide by the total count,
> not by the number of distinct values. (3 · 1 + 5 · 2 + 8 · 3 + 4 · 4)/20 =
> (3 + 10 + 24 + 16)/20 = 53/20 = 2.65 books.
>
> Median: with 20 values, it is the mean of the 10th and 11th. The first 3
> values are 1s, the next 5 (4th to 8th) are 2s, and the next 8 (9th to 16th)
> are 3s. The 10th and 11th are both 3, so the median is 3.

What happens to each measure when the data change:

| Change to every value | Mean | Median | Range and standard deviation |
| --- | --- | --- | --- |
| add a constant c | increases by c | increases by c | unchanged |
| multiply by k > 0 | multiplied by k | multiplied by k | multiplied by k |

An extreme value (an outlier) pulls the mean toward it but barely moves the
median.

> **Example.** The data 4, 5, 5, 6, 30 have mean 50/5 = 10 and median 5. What
> happens when the 30 is removed?
>
> New data 4, 5, 5, 6: mean 20/4 = 5, median (5 + 5)/2 = 5.
>
> Removing the outlier lowered the mean by 5 and left the median unchanged.

## Spread {#spread}

- Range: maximum minus minimum.
- Interquartile range (IQR): Q3 minus Q1, the spread of the middle half of the data.
- Standard deviation: roughly the typical distance of the values from the mean.

The SAT asks you to compare standard deviations, not compute them. Data
bunched close to the mean have a small standard deviation; data spread far
from it have a large one. Where the center sits doesn't matter.

> **Example.** Class A scored 70, 75, 80, 85, 90 on a quiz and class B scored
> 60, 70, 80, 90, 100. Compare the means, ranges and standard deviations.
>
> Both means are 400/5 = 80.
>
> Ranges: A is 90 − 70 = 20, B is 100 − 60 = 40.
>
> Every B score except the middle one is twice as far from 80 as the matching
> A score, so B has the larger standard deviation (exactly twice A's).

> **Trap.** Thinking that adding 10 points to every score raises the
> standard deviation. The whole list shifts together, so the distances from
> the mean don't change.

## Distributions {#distributions}

A distribution's shape is visible in a dot plot or histogram. In a symmetric
distribution the mean and median are about equal. A long tail pulls the mean
toward it: with a tail to the right, the mean is usually greater than the
median; with a tail to the left, usually less. "The mean chases the tail" is
a good first guess.

> **Fails when.** The data set is small or lumpy (two clusters, gaps), or the
> skew is slight. Then the mean can land on either side of the median.
> Whenever you have the values, compute both instead of guessing from the
> shape.

A box plot shows five numbers: minimum, Q1, median, Q3, maximum. The box
runs from Q1 to Q3, so it holds about the middle half of the data. A box plot
does not show the mean or how many values there are.

The five-number summaries of two box plots of delivery times, in minutes:

| Summary | Store A | Store B |
| --- | --- | --- |
| minimum | 12 | 8 |
| Q1 | 18 | 15 |
| median | 23 | 25 |
| Q3 | 30 | 28 |
| maximum | 41 | 50 |

> **Example.** Using the table above, which store has the greater median,
> the greater interquartile range and the greater range? Can you tell which
> has the greater mean?
>
> Median: B, 25 against 23.
>
> IQR: A is 30 − 18 = 12, B is 28 − 15 = 13, so B, barely.
>
> Range: A is 41 − 12 = 29, B is 50 − 8 = 42, so B.
>
> Mean: it can't be determined. A box plot shows positions, not the values
> needed to add up, so any choice claiming one mean is larger is unsupported.

In a histogram, each bar is a count of values in an interval. To find which
interval holds the median, add bar heights from the left until you pass half
the total.

> **Desmos.** For a list, type `L=[4,5,5,6,30]`, then `mean(L)`,
> `median(L)`, `stdev(L)` or `quartile(L,1)`. See
> [Desmos statistics](learn:sat/general/desmos#statistics).

## What Hard looks like {#hard}

- A change to the data (add a value, remove an outlier, shift every value), and you must say which measures change and which stay the same.
- A display from which a measure can't be found, with a choice that pretends it can.
- A mean worked backward: the missing value that makes a mean come out to a target.

> **Example.** A student's first four test scores are 82, 90, 75 and 88. What
> score on the fifth test makes the mean of all five exactly 85?
>
> Needed sum: 5 × 85 = 425. Current sum: 82 + 90 + 75 + 88 = 335.
>
> The fifth score must be 425 − 335 = 90.
