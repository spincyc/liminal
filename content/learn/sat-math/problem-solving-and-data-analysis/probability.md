---
id: sat-math/problem-solving-and-data-analysis/probability
title: Probability
section: sat-math
domain: Problem-Solving and Data Analysis
skill: Probability
---
# Probability

The probability of an event is the fraction of equally likely outcomes in
which it happens. SAT probability questions are mostly about counts in a
table or a description, and the whole skill is choosing the right
denominator. It is part of Problem-Solving and Data Analysis,
{{fact:sat-math-psda}} of the Math section.

## Before you start {#before-you-start}

This page uses probability as a fraction of equally likely outcomes
([Grade 7, week 31](weeks.html#common-core-math/7/31)) and reading a
two-way table ([lesson 4-6](lessons.html#common-core-math/8/4-6) and
[lesson 4-7](lessons.html#common-core-math/8/4-7)). Try these first, and
rebuild any that goes wrong.

> **Try it.** A spinner has 8 equal sections: 3 red and 5 blue. What is the
> probability that it lands on red?
>
> **Answer.** 3/8
>
> 3 of the 8 equally likely sections are red, so the probability is 3/8, or
> 0.375. Shaky? [Grade 7, week 31](weeks.html#common-core-math/7/31).

> **Try it.** The probability that a bus is late is 0.15. What is the
> probability that it is not late?
>
> **Answer.** 0.85
>
> The bus is either late or not, so the two probabilities add to 1:
> 1 − 0.15 = 0.85. Shaky? [Grade 7, week 31](weeks.html#common-core-math/7/31).

> **Try it.** The table shows how 50 students get to school.
>
> | Grade | Bus | Car | Total |
> | --- | --- | --- | --- |
> | Grade 7 | 14 | 6 | 20 |
> | Grade 8 | 18 | 12 | 30 |
> | Total | 32 | 18 | 50 |
>
> How many Grade 8 students ride the bus, and what fraction of the Grade 8
> students is that?
>
> **Answer.** 18, which is 3/5 of the Grade 8 students
>
> The Grade 8 row and the Bus column meet at 18. The group is the Grade 8
> students, 30 in all, so the fraction is 18/30 = 3/5. Shaky?
> [Lesson 4-6](lessons.html#common-core-math/8/4-6) and
> [lesson 4-7](lessons.html#common-core-math/8/4-7).

## Basic probability {#basic-probability}

```
P(event) = favorable outcomes / total outcomes
P(not A) = 1 − P(A)
```

Probabilities run from 0 (impossible) to 1 (certain). For two independent
events, P(A and B) = P(A) · P(B).

> **Example.** A bag holds 4 red, 6 blue and 10 green tiles. One tile is
> drawn at random. Find P(blue) and P(not green).
>
> Total: 4 + 6 + 10 = 20 tiles.
>
> P(blue) = 6/20 = 0.3.
>
> P(not green) = 1 − 10/20 = 1/2.

> **Try it.** A cooler holds 5 vanilla, 9 chocolate and 11 strawberry
> yogurts. One is chosen at random. Find P(chocolate) and P(not strawberry).
>
> **Answer.** P(chocolate) = 9/25 = 0.36 and P(not strawberry) = 14/25 = 0.56
>
> Total: 5 + 9 + 11 = 25 yogurts.
>
> P(chocolate) = 9/25 = 0.36.
>
> P(not strawberry) = 1 − 11/25 = 14/25 = 0.56.

Sometimes you are given the probability and must find a count.

> **Example.** A jar holds 30 marbles, and the probability of drawing a red
> one is 0.4. How many red marbles must be added so that the probability of
> red becomes 0.5?
>
> Red now: 0.4 × 30 = 12.
>
> Add a red marbles: (12 + a)/(30 + a) = 0.5.
>
> Multiply out: 12 + a = 15 + 0.5a, so 0.5a = 3 and a = 6. Check: 18/36 =
> 0.5.

> **Try it.** A bag holds 40 tiles, and the probability of drawing a blue
> tile is 0.25. How many blue tiles must be added so that the probability of
> drawing a blue tile becomes 0.4?
>
> **First step.** Blue now: 0.25 × 40 = 10 tiles. Now add b blue tiles to
> both the blue count and the total, and solve.
>
> **Answer.** 10
>
> (10 + b)/(40 + b) = 0.4, so 10 + b = 16 + 0.4b. Then 0.6b = 6 and b = 10.
>
> Check: 20/50 = 0.4.

> **Trap.** Forgetting that adding marbles changes the total too. (12 + a)/30
> = 0.5 gives a = 3, which is wrong.

## Conditional probability {#conditional-probability}

A conditional probability restricts the group you choose from. "Given that
the student is in grade 9" means: ignore everyone else, and use the grade 9
total as the denominator.

```
P(A given B) = (number in both A and B) / (number in B)
```

A survey of 240 students recorded their grade and whether they walk to
school:

| Grade | Walks | Doesn't walk | Total |
| --- | --- | --- | --- |
| Grade 9 | 36 | 84 | 120 |
| Grade 10 | 24 | 96 | 120 |
| Total | 60 | 180 | 240 |

> **Example.** Using the table above, a student is chosen at random. Find
> P(walks), P(grade 9 and walks), P(walks given grade 9) and P(grade 9 given
> walks).
>
> P(walks) = 60/240 = 0.25. The group is everyone.
>
> P(grade 9 and walks) = 36/240 = 0.15. Still everyone; the numerator is the
> one cell.
>
> P(walks given grade 9) = 36/120 = 0.30. The group is the grade 9 row.
>
> P(grade 9 given walks) = 36/60 = 0.60. The group is the Walks column.
>
> Same numerator, four different answers, because the denominators differ.

> **Try it.** A survey of 200 adults recorded their age and whether they
> prefer to exercise in the morning or the evening:
>
> | Age | Morning | Evening | Total |
> | --- | --- | --- | --- |
> | Under 40 | 24 | 56 | 80 |
> | 40 and over | 48 | 72 | 120 |
> | Total | 72 | 128 | 200 |
>
> Find P(morning given under 40) and P(under 40 given morning).
>
> **First step.** For P(morning given under 40), the group is the Under 40
> row, 80 adults, and 24 of them prefer morning: 24/80 = 0.3. Now find the
> other one.
>
> **Answer.** 0.3 and 1/3
>
> P(under 40 given morning): the group is the Morning column, 72 adults, and
> 24 of them are under 40: 24/72 = 1/3, about 0.33.
>
> Same cell, two groups, two answers.

> **Trap.** Swapping the condition. "The probability that a walker is in
> grade 9" (36/60) is not "the probability that a grade 9 student walks"
> (36/120). Circle the group that is chosen from before you divide.

A reliable cue: the group named right after "given that", "of the" or "among
the" is the denominator.

> **Fails when.** The restriction is phrased elsewhere, as in "A student who
> walks is chosen at random. What is the probability that the student is in
> grade 9?" Here the group is walkers (60), even though no "given" appears.
> Ask "who is being chosen?" and use that group's total.

When a needed cell is missing, find it from the totals first.

> **Example.** In a group of 200 adults, 120 own a bicycle. Of the bicycle
> owners, 45 also own a car, and 110 adults own a car in all. If an adult who
> owns a car is chosen at random, what is the probability that the adult
> does not own a bicycle?
>
> Car owners: 110. Car owners who also own a bicycle: 45.
>
> Car owners without a bicycle: 110 − 45 = 65.
>
> P = 65/110 = 13/22, about 0.59.

> **Try it.** In a group of 300 students, 180 take Spanish. Of the Spanish
> students, 60 also take art, and 140 students take art in all. If a student
> who takes art is chosen at random, what is the probability that the
> student does not take Spanish?
>
> **Answer.** 4/7
>
> Art students: 140. Art students who also take Spanish: 60.
>
> Art students without Spanish: 140 − 60 = 80.
>
> P = 80/140 = 4/7, about 0.57.

For a harder version, see
[percents that run the other way](#reversed-percents).

## Harder versions {#hard}

The harder questions make you build the counts before you divide: from
percents of other groups, or from a stated probability with an unknown.

### Percents that run the other way {#reversed-percents}

When the data give percents of one group and the question chooses from
another, turn every percent into a count first, then divide by the new
group's total.

> **Example.** Of 400 students, 150 play an instrument. Of those, 60% sing in
> the choir; of the other 250, 20% do. If a choir member is chosen at
> random, what is the probability that the student plays an instrument?
>
> Counts first: 0.60 × 150 = 90 choir members play, and 0.20 × 250 = 50
> don't. The choir has 140 members.
>
> The choice is from the choir, so P = 90/140 = 9/14, about 0.64.
>
> The trap is 0.60, the percent of players who sing, which answers the
> question the other way round.

> **Try it.** At a school, 200 students ride the bus and 300 do not. Of the
> bus riders, 30% play a sport; of the other students, 50% do. If a student
> who plays a sport is chosen at random, what is the probability that the
> student rides the bus?
>
> **First step.** Counts first: 0.30 × 200 = 60 bus riders play a sport.
> Now count the other students who play, then choose the group.
>
> **Answer.** 2/7
>
> 0.50 × 300 = 150 of the other students play, so 60 + 150 = 210 students
> play a sport.
>
> The choice is from those 210, so P = 60/210 = 2/7, about 0.29. The trap
> is 0.30, the percent of bus riders who play.

### A probability that fixes a missing count {#missing-count}

A stated probability is (cell) ÷ (the group it is chosen from). With an
unknown cell, write that equation and solve it, as with the marbles above.
Then answer the question actually asked, which usually uses a different
cell and group.

> **Try it.** A box holds red and blue pens, each gel or ballpoint:
>
> | Color | Gel | Ballpoint | Total |
> | --- | --- | --- | --- |
> | Red | 8 | 12 | 20 |
> | Blue | x | 10 | x + 10 |
>
> If a gel pen is chosen at random, the probability that it is blue is 0.6.
> If a blue pen is chosen at random, what is the probability that it is a
> gel pen?
>
> **Hint.** There are 8 + x gel pens. Solve for x first.
>
> **Answer.** 6/11
>
> P(blue given gel) = x/(8 + x) = 0.6, so x = 4.8 + 0.6x, 0.4x = 4.8 and
> x = 12.
>
> Blue pens: 12 + 10 = 22, and 12 of them are gel, so P = 12/22 = 6/11,
> about 0.55. Answering 0.6 again uses the wrong group.
