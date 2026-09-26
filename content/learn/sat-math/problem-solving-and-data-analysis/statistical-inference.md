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
Math section. Hard questions offer four reasonable-sounding conclusions of
which only one respects both the sampling and the assignment.

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

When two groups' intervals overlap, the data don't establish that the two
population values differ.

## Study design {#study-design}

Two separate questions decide what a study can conclude:

| Design feature | What it allows |
| --- | --- |
| Random selection from a population | generalizing the result to that population |
| Random assignment to treatment groups | concluding that the treatment caused the difference |

A study can have both, one or neither. Check each separately.

> **Example.** A researcher recruited 200 volunteers at a gym and randomly
> assigned half to a new stretching routine and half to their usual workout.
> After 8 weeks, the stretching group had greater flexibility on average.
> What can be concluded?
>
> Random assignment: yes, so the routine likely caused the greater
> flexibility for the people in the study.
>
> Random selection: no, they were gym volunteers, so the result shouldn't be
> generalized to all adults, or even to all gym members.
>
> Supported conclusion: for people similar to these volunteers, the routine
> likely improves flexibility.

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

## What Hard looks like {#hard}

- Four conclusions that differ only in scope ("these students", "this school", "all students") or strength ("caused", "is associated with").
- A study with random assignment but no random selection, or the reverse, where you must apply exactly the right half of the table.
- A margin-of-error question asking what would shrink the margin (a larger random sample) or what the interval means.
