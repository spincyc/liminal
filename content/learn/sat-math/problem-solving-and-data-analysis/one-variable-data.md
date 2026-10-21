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
Math section.

## Before you start {#before-you-start}

These checks cover the Grade 6 mean, median and quartiles. If one goes
wrong, rebuild it with
[Grade 6, week 33: mean, median, and center](weeks.html#common-core-math/6/33)
or [Grade 6, week 35: quartiles and box plots](weeks.html#common-core-math/6/35).

> **Try it.** What is the mean of 6, 9, 10, 13 and 17?
>
> **Answer.** 11
>
> The sum is 6 + 9 + 10 + 13 + 17 = 55, and there are 5 values, so the mean
> is 55 ÷ 5 = 11. Shaky? [Grade 6, week 33](weeks.html#common-core-math/6/33).

> **Try it.** What is the median of 14, 8, 21, 10, 17 and 12?
>
> **Answer.** 13
>
> In order: 8, 10, 12, 14, 17, 21. With 6 values, the median is the mean of
> the 3rd and 4th: (12 + 14)/2 = 13. Shaky?
> [Grade 6, week 33](weeks.html#common-core-math/6/33).

> **Try it.** For the data 3, 5, 6, 8, 9, 11, 12, 15, what are the range and
> the interquartile range?
>
> **Answer.** The range is 12 and the interquartile range is 6.
>
> Range: 15 − 3 = 12.
>
> The lower half is 3, 5, 6, 8, so Q1 = (5 + 6)/2 = 5.5. The upper half is
> 9, 11, 12, 15, so Q3 = (11 + 12)/2 = 11.5. The interquartile range is
> 11.5 − 5.5 = 6. Shaky? [Grade 6, week 35](weeks.html#common-core-math/6/35).

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

> **Try it.** Six numbers have a mean of 15. One number is removed, and the
> remaining five have a mean of 14. What number was removed?
>
> **First step.** Sum of all six: 6 × 15 = 90. Now find the sum of the five
> and finish.
>
> **Answer.** 20
>
> Sum of the five: 5 × 14 = 70. The removed number is 90 − 70 = 20.

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

> **Try it.** In a survey, 25 students reported how many pets they have: 6
> have 0 pets, 9 have 1, 7 have 2, and 3 have 3. What are the mean and the
> median?
>
> **Answer.** The mean is 1.28 pets and the median is 1 pet.
>
> Mean: (6 · 0 + 9 · 1 + 7 · 2 + 3 · 3)/25 = (0 + 9 + 14 + 9)/25 = 32/25 =
> 1.28 pets.
>
> Median: with 25 values, it is the 13th. The first 6 values are 0s and the
> next 9 (7th to 15th) are 1s, so the 13th is 1.

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

> **Try it.** The data 10, 12, 12, 14, 52 have mean 100/5 = 20 and median 12.
> What happens to the mean and the median when the 52 is removed?
>
> **Answer.** The mean falls by 8, to 12, and the median stays 12.
>
> New data 10, 12, 12, 14: mean 48/4 = 12, median (12 + 12)/2 = 12.

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

> **Try it.** The 11 scores in a diving contest have a mean of 80 points and
> a median of 84 points. The lowest score was recorded as 29 points but was
> really 62 points. What are the mean and the median after the correction?
>
> **First step.** The sum rises by 62 − 29 = 33 points. Now finish.
>
> **Answer.** The mean is 83 points and the median is 84 points.
>
> The mean rises by 33 ÷ 11 = 3, to 83 points. (Check: 11 × 80 = 880, and
> 913 ÷ 11 = 83.)
>
> The median is the 6th score in order. The corrected score, 62, is still
> below 84, so the 6th score is unchanged: the median stays 84 points.

> **Trap.** Moving the mean by the whole correction, 30 minutes, or moving
> the median with the mean.

> **Fails when.** The corrected value crosses the middle, as when a low
> value is corrected to one above the median. Then the ordered list shifts
> one place, and the median moves to the next value (or to the corrected
> value, if it lands in between). With an even count, the value must stay
> on the same side of both middle values for the median to hold.

### Combining groups {#combining-groups}

To combine group means, turn each into a total (mean × size), add the totals,
and divide by the combined size. Simply averaging the means is generally
wrong when the groups have different sizes.

> **Example.** In one class, 10 students have a mean score of 72. In another,
> 15 students have a mean of 82. What is the mean of all 25?
>
> Totals: 10 × 72 = 720 and 15 × 82 = 1,230. Combined: 1,950.
>
> Mean: 1,950 ÷ 25 = 78, not 77, the average of the two means.

The combined mean always lies between the group means, closer to the larger
group. The distances are in the inverse ratio of the sizes: 78 is 6 from 72
and 4 from 82, and 6 : 4 is 15 : 10. That shortcut finds a missing group
size quickly.

> **Try it.** In one section of a course, 12 students have a mean test score
> of 85. In another, 18 students have a mean of 75. What is the mean score of
> all 30 students?
>
> **First step.** Totals: 12 × 85 = 1,020 and 18 × 75 = 1,350. Now finish.
>
> **Answer.** 79
>
> Combined total: 1,020 + 1,350 = 2,370. Mean: 2,370 ÷ 30 = 79, not 80, the
> average of the two means.
>
> Check with the shortcut: 79 is 6 from 85 and 4 from 75, and 6 : 4 is
> 18 : 12.

> **Fails when.** Some people are in both groups, so a total would count them
> twice, or you are given medians. Medians of groups can't be combined this
> way at all.

The same idea runs backward: if 10 values have mean 50 and 5 more make the
mean of all 15 equal 46, the 5 added total 15 × 46 − 10 × 50 = 190, a mean
of 38.

> **Try it.** The 20 employees at one office have a mean commute of 30
> minutes. After 5 more employees are included, the mean commute of all 25
> is 32 minutes. What is the mean commute, in minutes, of the 5 added
> employees?
>
> **Answer.** 40 minutes
>
> All 25 total 25 × 32 = 800 minutes, and the first 20 total 20 × 30 = 600.
> The 5 added total 800 − 600 = 200 minutes, a mean of 200 ÷ 5 = 40.

### What does each average count? {#choose-the-weight}

A mean represents a total divided by a count. Before combining means,
identify what was counted: people, observations, or groups. Each observation
gets one share of the combined mean; each group gets a share proportional
to its size.

> **Example.** One workshop has 4 participants with a mean age of 18
> years, and another has 12 participants with a mean age of 26 years.
> Everyone attends exactly one workshop. Find the mean age of all
> participants. How would the answer differ if each workshop had 4
> participants with those same means?
>
> For the actual sizes, the age totals are 4(18) = 72 and 12(26) = 312.
> The mean is (72 + 312)/(4 + 12) = 384/16 = 24 years.
>
> With equal sizes of 4, the mean would be
> (4(18) + 4(26))/8 = 22 years, which also equals (18 + 26)/2.
>
> Averaging the two means gives each workshop equal weight. That works
> when their counts are equal, but in the actual groups the mean age 26
> represents three times as many people as the mean age 18.

> **Try it.** A data set has the following frequency table. What is its
> mean?
>
> | Value | Number of observations |
> | --- | --- |
> | 2 | 6 |
> | 5 | 3 |
> | 8 | 1 |
>
> **Answer.** 3.5
>
> There are 6 + 3 + 1 = 10 observations with total
> 2(6) + 5(3) + 8(1) = 35. The mean is 35/10 = 3.5. The unweighted
> mean (2 + 5 + 8)/3 = 5 treats each distinct value as equally frequent.
> Dividing 35 by 3 uses the number of table rows rather than observations.

> **Try it.** A set of 8 measurements has mean 14. Four new measurements
> are added, giving all 12 measurements a mean of 17. What is the mean of
> the four new measurements?
>
> **Answer.** 23
>
> The original total is 8(14) = 112; the combined total is 12(17) = 204.
> The four added measurements total 204 − 112 = 92, so their mean is
> 92/4 = 23. Subtracting the means, 17 − 14 = 3, finds the increase in
> the combined mean rather than the new group's mean.

> **Try it.** A club has 12 junior members with a mean age of 15 years and
> n senior members with a mean age of 25 years. No member is in both
> groups. The mean age of all members is 21 years. How many senior
> members are there?
>
> **Answer.** 18
>
> The juniors' total age is 12(15) = 180. The seniors' total is 25n.
> Thus 180 + 25n = 21(12 + n), giving 4n = 72 and n = 18.
> Check: (180 + 18(25))/30 = 630/30 = 21. Assuming equal group sizes
> would give a mean of 20, contrary to the given combined mean.

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

> **Try it.** The data are 10, 3, 17, 8, x, 14 and 6. Which of the following
> could be the median?
>
> - A) 7
> - B) 9
> - C) 11
> - D) 14
>
> **First step.** In order, the known values are 3, 6, 8, 10, 14, 17. With x
> there are 7 values, so the median is the 4th. Now find what the 4th value
> can be.
>
> **Answer.** B
>
> If x ≤ 8, the 4th value is 8. If x ≥ 10, it is 10. If x is between 8 and
> 10, the median is x itself.
>
> So the median is from 8 to 10, and only 9 fits.

With an even count, the median is the mean of two middle values, so it can
range between two half-way points instead.

> **Try it.** The data are 15, 4, 20, 9, 12 and x. What is the greatest
> possible value of the median?
>
> **Answer.** 13.5
>
> In order, the known values are 4, 9, 12, 15, 20. With x there are 6
> values, so the median is the mean of the 3rd and 4th.
>
> If x ≥ 15, the 3rd and 4th values are 12 and 15, so the median is
> (12 + 15)/2 = 13.5. If x < 15, the 4th value is less than 15 and the 3rd
> is at most 12, so the median is less than 13.5.

> **Fails when.** More than one value is unknown, or x stands for several
> equal values (a count in a frequency table). Then x can push the middle
> more than one place; count positions again.

For harder versions, see
[recover a count before correcting the data](#missing-count-correction) and
[the greatest possible value](#greatest-possible-value).

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

> **Try it.** Data set P is 12, 14, 16, 18, 20 and data set Q is 6, 11, 16,
> 21, 26. Compare the means, ranges and standard deviations.
>
> **Answer.** Both means are 16, the ranges are 8 for P and 20 for Q, and Q
> has the larger standard deviation.
>
> Both sums are 80, so both means are 80/5 = 16.
>
> Ranges: P is 20 − 12 = 8, Q is 26 − 6 = 20.
>
> Each Q value is 2.5 times as far from 16 as the matching P value (10
> against 4, 5 against 2), so Q has the larger standard deviation.

> **Trap.** Thinking that adding 10 points to every score raises the
> standard deviation. The whole list shifts together, so the distances from
> the mean don't change.

Adding or removing one value affects each measure differently: the mean and
standard deviation depend on every value, the median on the middle, the
range on the extremes.

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

> **Try it.** The data are 12, 15, 20, 25 and 38. A sixth value, equal to the
> mean, is added. Which of the following is true about the new data?
>
> - A) The mean is greater than before.
> - B) The median is the same as before.
> - C) The range is less than before.
> - D) The standard deviation is less than before.
>
> **Answer.** D
>
> The mean is 110 ÷ 5 = 22, so 22 is added: 12, 15, 20, 22, 25, 38.
>
> Mean: 132 ÷ 6 = 22, unchanged. Median: from 20 to (20 + 22)/2 = 21.
> Range: still 38 − 12 = 26. The new value is 0 from the mean, so the
> standard deviation decreases.

When the data are not all given, see [what must be true](#must-be-true).

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

> **Try it.** The five-number summaries of two classes' test scores:
>
> | Summary | Class 1 | Class 2 |
> | --- | --- | --- |
> | minimum | 52 | 48 |
> | Q1 | 64 | 66 |
> | median | 73 | 75 |
> | Q3 | 81 | 80 |
> | maximum | 95 | 92 |
>
> Which class has the greater median, the greater interquartile range and
> the greater range?
>
> **Answer.** Class 2, class 1 and class 2.
>
> Median: class 2, 75 against 73.
>
> IQR: class 1 is 81 − 64 = 17, class 2 is 80 − 66 = 14, so class 1.
>
> Range: class 1 is 95 − 52 = 43, class 2 is 92 − 48 = 44, so class 2,
> barely.

In a histogram, each bar is a count of values in an interval. To find which
interval contains a middle observation, count positions using cumulative
bar heights. For an even total, locate both middle observations: if they
lie in different intervals, the interval containing their average may not
be determined from the histogram alone.

> **Try it.** A histogram of 25 commute times has bars of height 4 for 0 to
> 10 minutes, 7 for 10 to 20 minutes, 9 for 20 to 30 minutes and 5 for 30
> to 40 minutes. Each interval includes its left endpoint but not its right.
> Which interval contains the median?
>
> **Answer.** 20 to 30 minutes
>
> With 25 values, the median is the 13th. The cumulative heights are 4, 11,
> 20 and 25, so the 12th to 20th values are in the third bar, and the 13th
> is between 20 and 30 minutes.

> **Desmos.** For a list, type `L=[4,5,5,6,30]`, then `mean(L)`,
> `median(L)`, `stdev(L)` or `quartile(L,1)`. See
> [Desmos statistics](learn:sat/general/desmos#statistics).

### What must be true {#must-be-true}

Some questions describe a change without listing the data. Reject any choice
that holds for some data sets but not for all.

> **Try it.** A data set has 9 different whole numbers. A tenth value, equal
> to the median of the 9 values, is added. Which of the following must be
> true about the new data set?
>
> - A) The mean is the same as before.
> - B) The median is the same as before.
> - C) The range is greater than before.
> - D) The standard deviation is the same as before.
>
> **Hint.** Try two small data sets: one where the mean equals the median,
> and one with a large value at the top.
>
> **Answer.** B
>
> The old median is the 5th of 9 values. With a copy of it added, the 5th
> and 6th of the 10 values are both that number, so the median is unchanged.
>
> A: for 1, 2, 3, 4, 5, 6, 7, 8, 100, the mean is 136 ÷ 9 ≈ 15.1, and adding
> 5 lowers it. C: the median lies between the extremes, so the range is
> unchanged. D: for 1 to 9, adding 5 (also the mean) shrinks the standard
> deviation.

## Harder versions {#hard}

The hardest questions in this skill hide part of the data: an unknown
count in a frequency table, or the values that make one value as large as
possible.

### The greatest possible value {#greatest-possible-value}

To make one value as large as possible with a fixed mean and median, use
the total (mean × count) and make every other value as small as the rules
allow: the values below the median as small as possible, then the median,
then each value above it no less than the median, or one more than the value
before if the values must be different. Read the least allowed value from
the question: positive integers start at 1, but whole numbers start at 0.

> **Try it.** A data set consists of 5 different positive integers. The
> mean is 12 and the median is 9. What is the greatest possible value of the
> largest number?
>
> **Hint.** Use the total, 5 × 12, and make every other value as small as
> the rules allow.
>
> **Answer.** 38
>
> The total is 5 × 12 = 60. The median is the 3rd value, 9, and the 1st and
> 2nd are as small as possible: 1 and 2.
>
> The 4th value must be greater than 9, so at least 10. Then the largest is
> 60 − (1 + 2 + 9 + 10) = 38. Check: 1, 2, 9, 10, 38 has mean 60 ÷ 5 = 12
> and median 9.
>
> Ignoring "different" (1, 1, 9, 9) gives 40.

> **Try it.** A data set consists of 7 different whole numbers. The mean is
> 9 and the median is 5. What is the greatest possible value of the largest
> number?
>
> **Hint.** Whole numbers start at 0.
>
> **Answer.** 42
>
> The total is 7 × 9 = 63. The median is the 4th value, 5. The three below
> it are as small as possible: 0, 1 and 2. The two above it, before the
> largest, are as small as possible while different: 6 and 7.
>
> The largest is 63 − (0 + 1 + 2 + 5 + 6 + 7) = 42. Check: 0, 1, 2, 5, 6,
> 7, 42 has mean 63 ÷ 7 = 9 and median 5. Starting at 1 (1, 2, 3) gives 39.

### Recover a count before correcting the data {#missing-count-correction}

When a frequency table has an unknown count, use the mean to find the count
first. Then put the corrected observation in its new position.

> **Example.** A table lists appointment durations of 32, 36, 40, 44, and 48
> minutes, with frequencies 2, 3, x, 2, and 1. The original mean is 39
> minutes. The appointment recorded as 48 minutes should be 32 minutes. What
> is the corrected median?
>
> The original total is 308 + 40x and the count is 8 + x, so
> 39(8 + x) = 308 + 40x. Solving gives x = 4 and a count of 12.
>
> After the correction, 32 occurs three times and 36 occurs three times.
> The 6th observation is 36 and the 7th is 40, so the corrected median is
> (36 + 40)/2 = 38 minutes.

> **Try it.** A table lists the times students spent on an assignment: 20,
> 25, 30, 35 and 40 minutes, with frequencies 2, 2, x, 2 and 1. The mean time
> is 29 minutes. The time recorded as 40 minutes should be 20 minutes. What
> is the corrected median?
>
> **Hint.** Use the mean to find x first: the total is 29 times the count.
>
> **Answer.** 27.5 minutes
>
> The original total is 200 + 30x minutes and the count is 7 + x, so 29(7 +
> x) = 200 + 30x.
>
> 203 + 29x = 200 + 30x, so x = 3 and the count is 10.
>
> After the correction, 20 occurs 3 times, 25 twice, 30 three times and 35
> twice. The 5th time is 25 and the 6th is 30, so the corrected median is
> (25 + 30)/2 = 27.5 minutes. Before the correction it was 30 minutes.
