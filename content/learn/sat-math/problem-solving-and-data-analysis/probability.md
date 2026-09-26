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
{{fact:sat-math-psda}} of the Math section. Hard questions use conditional
wording ("given that", "of those who") or give a probability and ask for a
missing count.

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

> **Trap.** Swapping the condition. "The probability that a walker is in
> grade 9" (36/60) is not "the probability that a grade 9 student walks"
> (36/120). Circle the group that is chosen from before you divide.

A reliable cue: the group named right after "given that", "of the" or "among
the" is the denominator.

> **Fails when.** The restriction is phrased elsewhere, as in "A student who
> walks is chosen at random. What is the probability that the student is in
> grade 9?" Here the group is walkers (60), even though no "given" appears.
> Ask "who is being chosen?" and use that group's total.

## What Hard looks like {#hard}

- A conditional question whose data run the other way: percents of one group are given, and the question picks from another. Turn every percent into a count first, then use the new group's total as the denominator.
- A two-way table with unknown cells and a stated probability. Write that probability as (cell) ÷ (the group it is chosen from) with the unknown, solve, then answer the question actually asked, which usually needs a different cell and a different group.
- Items added or removed, as in the marble example: the whole changes too, so write the new probability with the new total.

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
