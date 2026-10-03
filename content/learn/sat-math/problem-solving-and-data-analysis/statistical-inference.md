---
id: sat-math/problem-solving-and-data-analysis/statistical-inference
title: Statistical inference
section: sat-math
domain: Problem-Solving and Data Analysis
skill: Statistical inference
---
# Statistical inference

Inference questions ask what a study's results allow you to conclude: about
which group, with how much uncertainty, and whether one thing causes
another. There is little calculation. The work is reading the study's
design carefully and refusing any conclusion it doesn't support. The skill
belongs to Problem-Solving and Data Analysis, {{fact:sat-math-psda}} of the
Math section. Hard questions combine separately drawn samples, distinguish
selection from assignment, or plan a survey to meet an interval-width target
while accounting for nonresponses.

## Samples and populations {#samples-and-populations}

A sample is the group actually measured; the population is the larger group
you want to know about. A result from a random sample can be extended to the
population it was drawn from, and no further. A sample of volunteers, or of
people who happened to be nearby, can be biased, so its results don't
generalize reliably even to its own population.

> **Example.** A school of 4,000 students chose 250 students at random, and
> 60 of them said they would prefer a later start time. Estimate the number
> of students at the school who would prefer a later start, and say to whom
> the result applies.
>
> Sample proportion: 60/250 = 0.24.
>
> Estimate for the school: 0.24 × 4,000 = 960 students.
>
> The sample was random from this school, so the estimate applies to this
> school's students, not to all high school students in the state.

> **Trap.** The choice that generalizes too far ("most teenagers", "students
> nationwide"). The population is set by where the random sample came from.

When each of two groups is sampled separately, each sample describes only
its own group. Estimate each group from its own sample, then add. Pooling
the samples into one fraction works only when both groups were sampled at
the same rate.

> **Example.** A town has 2,000 households north of its river and 500 south
> of it. A random sample of 50 northern households has 10 with a garden; a
> random sample of 50 southern households has 30. Estimate the number of
> households in the town with a garden.
>
> North: 10/50 of 2,000 = 400. South: 30/50 of 500 = 300.
>
> Estimate: 400 + 300 = 700 households.
>
> Pooling gives 40/100 of 2,500 = 1,000, far too many: the south, sampled at
> 1 in 10, would count as much as the north, sampled at 1 in 40.

> **Fails when.** Pooling is right only when the groups were sampled at the
> same rate (the same fraction of each group). Check the rates before
> combining.

## Margin of error {#margin-of-error}

A survey reports an estimate plus or minus a margin of error. The interval
from (estimate − margin) to (estimate + margin) is a range of plausible
values for the population value. Two facts are tested:

- Larger random samples generally give smaller margins of error.
- The margin describes random sampling error only. It does not fix a biased sample.

> **Example.** A random sample of commuters in a city gives a mean commute of
> 24 minutes with a margin of error of 3 minutes. Which conclusion is
> supported?
>
> A) Every commuter in the city travels between 21 and 27 minutes.
>
> B) It is plausible that the mean commute of all commuters in the city is
> between 21 and 27 minutes.
>
> C) The mean commute of all commuters in the city is exactly 24 minutes.
>
> D) A second sample would certainly have a mean of 24 minutes.
>
> B is supported: the interval 24 ± 3 describes the population mean.
>
> A describes individual commutes, which vary far more than the mean. C
> ignores the uncertainty. D ignores that different samples give different
> results.

Separate intervals support a difference between population values. When
intervals overlap, comparing that overlap alone is not a significance test:
a statistically significant difference can still exist. Substantial overlap
can leave equal values plausible; slight overlap needs further analysis.

### Margin of error and sample size {#margin-and-sample-size}

A question may tell you to assume that the margin of error is inversely
proportional to the square root of the sample size. Then margin × √n stays
the same, so the margin changes by the square root of the change in n:

| Sample size multiplied by | Margin of error multiplied by |
| --- | --- |
| 4 | 1/2 |
| 9 | 1/3 |
| 1/4 | 2 |

Running it backward, a margin k times smaller needs a sample k² times as
large.

> **Example.** A random sample of 250 of a state's licensed anglers gives an
> estimate with a margin of error of 5 percentage points. Assume the margin
> of error is inversely proportional to the square root of the sample size.
> What margin would a random sample of 1,000 anglers give, and how large a
> sample would give a margin of 1 point?
>
> 1,000 is 4 times 250, and √4 = 2, so the margin is divided by 2: 2.5
> points.
>
> A margin of 1 point is 5 times smaller, so the sample must be 5² = 25
> times as large: 25 × 250 = 6,250 anglers.

> **Trap.** Dividing the margin by 4 when the sample is 4 times as large.
> The margin shrinks with the square root: four times the sample halves the
> margin.

> **Fails when.** The two samples come from populations with different
> spreads. The margin also depends on how spread out the values are, so the
> square-root rule compares samples only when the spread is about the same,
> as the question will say. Keep the confidence level the same as well.

## Study design {#study-design}

Two separate questions decide what a study can conclude:

| Design feature | What it allows |
| --- | --- |
| Random selection from a population | generalizing the result to that population |
| Random assignment to treatment groups | supporting a causal conclusion when the difference exceeds what chance plausibly explains |

A study can have both, one or neither. Check each separately. Random
assignment alone does not establish an effect: even a randomized study can
show a difference caused by chance.

> **Example.** A researcher recruited 200 volunteers at a gym and randomly
> assigned half to a new stretching routine and half to their usual workout.
> After 8 weeks, the stretching group had greater flexibility on average,
> and analysis found the difference unlikely to be due to chance alone.
> What can be concluded?
>
> Random assignment: yes, so the routine likely caused the greater
> flexibility for the people in the study.
>
> Random selection: no, they were gym volunteers, so the result shouldn't be
> generalized to all adults, or even to all gym members.
>
> Supported conclusion: the study supports a causal effect among its
> participants. Generalizing beyond them needs additional evidence.

> **Example.** A survey of randomly selected students at one school finds that
> students who eat breakfast have higher average grades. Can you conclude that
> eating breakfast raises grades?
>
> No. The students chose whether to eat breakfast; nobody was randomly
> assigned. The survey shows an association at that school, and something
> else (sleep, schedules, family routines) could explain both.

> **Trap.** Treating a large sample as proof of cause. Size shrinks the
> margin of error, but without random assignment it never licenses a causal
> claim.

### Four designs, four conclusions {#four-designs}

For a study with convincing evidence of a difference, put the design
questions together:

| Participants | Treatment randomly assigned | Treatment not randomly assigned |
| --- | --- | --- |
| randomly selected from a population | cause, for the whole population | association only, for the whole population |
| not randomly selected (volunteers, one convenient group) | causal inference within the study; no population generalization | association within the study; no population generalization |

A choice has two halves, what the study shows and whom it describes. Keep
the one whose halves both match the cell.

> **Example.** A researcher chose 80 of a county's farms at random and asked
> each farmer whether they rotate their crops. The farms that rotate crops
> had higher average yields. Which conclusion is appropriate?
>
> Selection: random, from the county's farms, so the result describes the
> county's farms.
>
> Assignment: none. The farmers chose whether to rotate, so the study shows
> only an association.
>
> Conclusion: among the county's farms, rotating crops goes with higher
> yields, but the study doesn't show that rotating causes them.

> **Trap.** Letting one design fact answer both questions. Random selection
> says nothing about cause, and random assignment says nothing about whom
> the result describes.

## What Hard looks like {#hard}

- A study to sort into one of the four designs, with choices that pair "shows cause" or "shows only an association" with "applies to the population" or "cannot be generalized to the whole population". Settle each half separately (see [four designs](#four-designs)).
- Planning a survey with a target total interval width and a response rate. Halve the width to get the margin, use inverse-square-root scaling for completed responses, then divide by the response rate and round invitations up.

- Samples taken separately from groups of different sizes. Estimate each group from its own sample and add; pooling the samples weights the groups wrongly (see [samples and populations](#samples-and-populations)).

> **Example.** A pilot survey has 400 completed responses and a margin
> of error of 4 percentage points. Under the inverse-square-root model,
> how many invitations should a new survey send for an interval of total
> width at most 4 points, if the planning model predicts a 60% response rate?
>
> Target margin: 4 ÷ 2 = 2 points, half the pilot margin.
>
> Completed responses needed: 400 × (4/2)² = 1,600.
>
> Invitations: at least 1,600 ÷ 0.60 = 2,666.666…, so round up to 2,667.
> Sending 1,600 invitations would confuse responses with invitations.

> **Example.** A random sample of a city's 1,000 bus drivers gives a mean
> commute of 24 minutes, with a margin of error of 3 minutes. What is a
> plausible range for the total commuting time of all 1,000 drivers?
>
> The population mean is plausibly between 21 and 27 minutes.
>
> The total is 1,000 times the mean: plausibly between 21,000 and 27,000
> minutes.
