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
Math section. Hard questions combine groups of different sizes, ask how a
change to the data moves each measure, or ask which medians an unknown value
allows.

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

### Correcting one extreme value {#correcting-an-extreme-value}

When one value is corrected, the sum changes by new − old, so the mean
changes by (new − old) ÷ n: the change is shared among all n values. The
median depends only on the middle of the ordered list, so it stays put as
long as the corrected value stays on the same side of the middle.

> **Example.** The times of the 15 runners in a race have a mean of 44
> minutes and a median of 40 minutes. The slowest time was recorded as 95
> minutes but was really 65 minutes. What are the mean and the median after
> the correction?
>
> The sum falls by 95 − 65 = 30 minutes, so the mean falls by 30 ÷ 15 = 2:
> it becomes 42 minutes. (Check: 15 × 44 = 660, and 630 ÷ 15 = 42.)
>
> The median is the 8th time in order. The corrected time, 65, is still
> above 40, so the 8th time is unchanged: the median stays 40 minutes.

> **Trap.** Moving the mean by the whole correction, 30 minutes, or moving
> the median with the mean. One value's change is spread over every value in
> the mean, and the median depends only on the middle.

> **Fails when.** The corrected value crosses the middle, as when a low
> value is corrected to one above the median. Then the ordered list shifts
> one place, and the median moves to the next value (or to the corrected
> value, if it lands in between). With an even count, the value must stay
> beyond both middle values for the median to hold.

### Combining groups {#combining-groups}

The means of two groups of different sizes can't be averaged. Turn each mean
into a total (mean × size), add the totals, and divide by the combined size.

> **Example.** In one class, 10 students have a mean score of 72. In another,
> 15 students have a mean of 82. What is the mean of all 25?
>
> Totals: 10 × 72 = 720 and 15 × 82 = 1,230. Combined: 1,950.
>
> Mean: 1,950 ÷ 25 = 78, not 77, the average of the two means.

The combined mean always lies between the group means, closer to the larger
group. The distances are in the inverse ratio of the sizes: here 78 is 6
from 72 and 4 from 82, and 6 : 4 is 15 : 10. That shortcut finds a missing
group size quickly.

> **Fails when.** Some people are in both groups, so a total would count them
> twice, or you are given medians. Medians of groups can't be combined this
> way at all.

The same idea runs backward. If 10 values have a mean of 50 and adding 5
more makes the mean of all 15 equal 46, the 5 added values total
15 × 46 − 10 × 50 = 690 − 500 = 190, a mean of 38.

### Which values could be the median {#possible-medians}

When one value, x, is unknown, list the known values in order and see where
the middle position falls. However large or small x is, it can push the
middle only one place.

> **Example.** The data are 12, 5, 9, 20, x, 15 and 7. Which values could the
> median be?
>
> In order, the known values are 5, 7, 9, 12, 15, 20. With x there are 7
> values, so the median is the 4th.
>
> If x ≤ 9, the 4th value is 9. If x ≥ 12, it is 12. If x is between 9 and
> 12, the median is x itself.
>
> So the median can be anything from 9 to 12, and nothing else: not 8, and
> not 15, whatever x is.

With an even count, the median is the mean of two middle values, so it can
range between two half-way points instead.

> **Fails when.** More than one value is unknown, or x stands for several
> equal values (a count in a frequency table). Then x can push the middle
> more than one place; count positions again.

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

- Groups of different sizes with different means: a combined mean, a missing group's mean, or a missing group's size. Work with totals (see [combining groups](#combining-groups)).
- A change to the data, such as adding a value equal to the mean, and a question about which statement is true. Each measure depends on something different: the mean and standard deviation on every value, the median on the middle position, the range on the two extremes.
- A list with one unknown value and a question about which medians are possible (see [which values could be the median](#possible-medians)).
- One extreme value corrected, given only the mean, the median and the count. The mean moves by the correction divided by the count; the median holds unless the value crosses the middle (see [correcting one extreme value](#correcting-an-extreme-value)).

> **Example.** The data are 2, 4, 6, 8 and 20. A sixth value, equal to the
> mean, is added. What happens to the mean, the median, the range and the
> standard deviation?
>
> The mean is 40 ÷ 5 = 8, so 8 is added: 2, 4, 6, 8, 8, 20.
>
> Mean: 48 ÷ 6 = 8, unchanged. Median: from 6 to (6 + 8)/2 = 7. Range: still
> 20 − 2 = 18.
>
> Standard deviation: it decreases. The new value is 0 from the mean, so it
> adds nothing to the spread while making the list longer.
