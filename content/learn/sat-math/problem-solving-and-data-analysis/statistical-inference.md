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
Math section.

## Before you start {#before-you-start}

These checks cover percents, random samples and square roots. If one goes
wrong, rebuild it with
[Grade 6, week 10: percent of a quantity](weeks.html#common-core-math/6/10),
[Grade 7, week 25: populations and samples](weeks.html#common-core-math/7/25)
or [lesson 1-4, square roots](lessons.html#common-core-math/8/1-4).

> **Try it.** What is 24% of 3,500?
>
> **Answer.** 840
>
> 24% is 0.24, and 0.24 × 3,500 = 840. Shaky?
> [Grade 6, week 10](weeks.html#common-core-math/6/10).

> **Try it.** A principal wants to know what the school's 900 students think
> of a new lunch menu. Which of these samples of 50 students is random?
>
> - A) The first 50 students in the lunch line
> - B) 50 students who volunteer to answer
> - C) 50 students whose names are drawn from a list of all 900
> - D) The 50 students in two homerooms
>
> **Answer.** C
>
> Only C gives every student the same chance of being chosen. The others
> pick students who may think differently from the rest: early eaters,
> people with strong opinions, one part of the school. Shaky?
> [Grade 7, week 25](weeks.html#common-core-math/7/25).

> **Try it.** What is √400 ÷ √100?
>
> **Answer.** 2
>
> √400 = 20 and √100 = 10, so the quotient is 20 ÷ 10 = 2: four times the
> number gives twice the square root. Shaky?
> [Lesson 1-4](lessons.html#common-core-math/8/1-4).

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

> **Try it.** A library with 6,000 members chose 300 members at random, and
> 45 of them said they would use a weekend study room. Estimate the number of
> members who would use the room, and say to whom the result applies.
>
> **First step.** Sample proportion: 45/300 = 0.15. Now finish.
>
> **Answer.** About 900 members; the estimate applies to this library's
> members.
>
> Estimate: 0.15 × 6,000 = 900 members.
>
> The sample was random from this library's members, so the estimate
> applies to them, not to library users in general.

> **Trap.** The choice that generalizes too far ("most teenagers", "students
> nationwide"). The population is set by where the random sample came from.

### Samples from groups of different sizes {#separate-samples}

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

> **Try it.** A college has 3,000 undergraduates and 600 graduate students.
> A random sample of 60 undergraduates has 15 who bike to campus; a random
> sample of 40 graduate students has 18 who do. Estimate the number of
> students at the college who bike to campus.
>
> **First step.** Undergraduates: 15/60 of 3,000 = 750. Now finish.
>
> **Answer.** 1,020 students
>
> Graduate students: 18/40 of 600 = 270. Estimate: 750 + 270 = 1,020.
>
> Pooling gives 33/100 of 3,600 = 1,188, too many: the graduate students,
> sampled at 1 in 15, would count as much as the undergraduates, sampled at
> 1 in 50.

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

> **Try it.** A random sample of the apple trees in an orchard gives a mean
> yield of 180 apples per tree, with a margin of error of 12 apples. Which
> conclusion is supported?
>
> - A) Every tree in the orchard yields between 168 and 192 apples.
> - B) The mean yield of all the trees in the orchard is exactly 180 apples.
> - C) It is plausible that the mean yield of all the trees in the orchard is between 168 and 192 apples.
> - D) Another random sample of trees would certainly have a mean yield of 180 apples.
>
> **Answer.** C
>
> The interval 180 ± 12, from 168 to 192, describes the mean of all the
> trees.
>
> A describes single trees, which vary far more than the mean. B ignores the
> uncertainty. D ignores that different samples give different results.

Separate intervals support a difference between population values. When
intervals overlap, comparing that overlap alone is not a significance test:
a statistically significant difference can still exist. Substantial overlap
can leave equal values plausible; slight overlap needs further analysis.

> **Try it.** Random samples from two towns give a mean commute of 41
> minutes in Town A, with a margin of error of 4 minutes, and 52 minutes in
> Town B, with a margin of error of 3 minutes. Do the results support a
> difference between the towns' mean commutes?
>
> **Answer.** Yes: Town B's mean commute is plausibly greater.
>
> Town A's interval is 41 ± 4, from 37 to 45 minutes. Town B's is 52 ± 3,
> from 49 to 55 minutes. The intervals are separate, so the results support
> Town B having the greater mean commute.

> **Example.** A random sample of a city's 1,000 bus drivers gives a mean
> commute of 24 minutes, with a margin of error of 3 minutes. What is a
> plausible range for the total commuting time of all 1,000 drivers?
>
> The population mean is plausibly between 21 and 27 minutes.
>
> The total is 1,000 times the mean: plausibly between 21,000 and 27,000
> minutes.

> **Try it.** In a random sample of a city's 20,000 registered voters, 55%
> support a new park, with a margin of error of 3 percentage points. What is
> a plausible range for the number of registered voters in the city who
> support the park?
>
> **Answer.** Between 10,400 and 11,600 voters
>
> The percent of all the city's registered voters is plausibly between 52%
> and 58%.
>
> Of 20,000 voters, that is 0.52 × 20,000 = 10,400 to
> 0.58 × 20,000 = 11,600.

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

> **Try it.** A random sample of 400 of a city's households gives an
> estimate with a margin of error of 6 percentage points. Assume the margin
> of error is inversely proportional to the square root of the sample size.
> What margin would a random sample of 1,600 households give, and how large a
> sample would give a margin of 1.5 points?
>
> **Answer.** 3 points; 6,400 households
>
> 1,600 is 4 times 400, and √4 = 2, so the margin is divided by 2: 3 points.
>
> A margin of 1.5 points is 4 times smaller than 6, so the sample must be
> 4² = 16 times as large: 16 × 400 = 6,400 households.

> **Trap.** Dividing the margin by 4 when the sample is 4 times as large.
> The margin shrinks with the square root: four times the sample halves the
> margin.

> **Fails when.** The two samples come from populations with different
> spreads. The margin also depends on how spread out the values are, so the
> square-root rule compares samples only when the spread is about the same,
> as the question will say. Keep the confidence level the same as well.

For a harder version, planning a survey from a target width, see
[planning a survey](#planning-a-survey).

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

> **Try it.** A teacher asked for volunteers among her students and randomly
> assigned half of the 60 volunteers to study with flashcards and half to
> study with practice quizzes. On the next test, the practice-quiz group
> scored higher on average, and analysis found the difference unlikely to
> be due to chance alone. Which conclusion is appropriate?
>
> - A) Practice quizzes raise test scores for all students at the school.
> - B) Practice quizzes likely caused higher scores among the 60 volunteers.
> - C) Practice quizzes go with higher scores, but no cause can be concluded.
> - D) The result applies to all students at the school, but no cause can be concluded.
>
> **Answer.** B
>
> Random assignment: yes, so the study supports a causal effect for the
> people in it.
>
> Random selection: no, they were volunteers, so the result shouldn't be
> generalized to all students. A generalizes too far; C and D ignore the
> random assignment.

> **Example.** A survey of randomly selected students at one school finds that
> students who eat breakfast have higher average grades. Can you conclude that
> eating breakfast raises grades?
>
> No. The students chose whether to eat breakfast; nobody was randomly
> assigned. The survey shows an association at that school, and something
> else (sleep, schedules, family routines) could explain both.

> **Try it.** A survey of randomly selected adults in a city finds that dog
> owners walk more minutes per day, on average, than adults who don't own
> dogs. Can you conclude that owning a dog makes people walk more?
>
> **Answer.** No. The survey shows an association among the city's adults,
> not a cause.
>
> The adults chose whether to own a dog; nobody was randomly assigned.
> Something else, such as enjoying time outdoors, could explain both. The
> random selection lets the association describe the city's adults, but it
> says nothing about cause.

> **Trap.** Treating a large sample as proof of cause. Size shrinks the
> margin of error, but without random assignment it never licenses a causal
> claim.

For a harder version, see
[four designs, four conclusions](#four-designs).

## Harder versions {#hard}

The hardest questions in this skill combine steps: a survey planned
backward from a target, or both halves of a design.

### Planning a survey {#planning-a-survey}

Work backward from the target: margin, then completed responses, then
invitations.

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

> **Try it.** A pilot survey has 300 completed responses and a margin of
> error of 5 percentage points. Under the inverse-square-root model, how
> many invitations should a new survey send for an interval of total width
> at most 5 points, if the planning model predicts a 70% response rate?
>
> **First step.** Target margin: 5 ÷ 2 = 2.5 points, half the pilot margin.
> Now finish.
>
> **Answer.** 1,715 invitations
>
> Completed responses needed: 300 × (5/2.5)² = 300 × 4 = 1,200.
>
> Invitations: at least 1,200 ÷ 0.70 = 1,714.28…, so round up to 1,715.

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

> **Try it.** A researcher randomly selected 200 adults from a list of all
> the adults living in a city and randomly assigned half of them to drink a
> glass of water before each meal. After 12 weeks, the water group had lost
> more weight on average, and analysis found the difference unlikely to be
> due to chance alone. Which conclusion is appropriate?
>
> - A) Drinking water before meals likely causes more weight loss among the city's adults.
> - B) Drinking water before meals goes with more weight loss among the city's adults, but no cause can be concluded.
> - C) Drinking water before meals likely caused more weight loss among the 200 participants, but the result does not extend to the city's adults.
> - D) Drinking water before meals goes with more weight loss among the 200 participants only.
>
> **Answer.** A
>
> Selection: random, from the city's adults, so the result describes them.
>
> Assignment: random, so the study supports cause. Both halves match the
> top-left cell: cause, for the whole population.

> **Trap.** Letting one design fact answer both questions. Random selection
> says nothing about cause, and random assignment says nothing about whom
> the result describes.
