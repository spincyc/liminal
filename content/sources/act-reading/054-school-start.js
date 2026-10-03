"use strict";

// Fact-check: Sleep and mixed outcome evidence: https://pmc.ncbi.nlm.nih.gov/articles/PMC9665092/

module.exports = {
  id: "act-reading-p054",
  type: "social-science",
  title: "First Bell",
  intro: "This original passage discusses the debate over school start times.",
  content: `The biological finding is not in dispute and has not been for twenty years. Around puberty
the circadian system tends to shift later, often by roughly two hours, though
individuals differ. The tendency commonly shifts back towards earlier timing in
early adulthood. A sixteen-year-old told to be
asleep at ten is being asked to sleep at what their body treats as eight in the evening.
Most cannot. The shift is not a preference, it is not caused by screens, and it appears in
adolescents with no access to electric light at all.

Set against that, a school day beginning at half past seven requires a rising time of about
six, and the arithmetic produces a chronic deficit of one to two hours a night through the
school week, partly repaid at weekends by a sleep pattern that then makes Monday worse.

The intervention follows obviously: start later. Districts that have done so have been
studied more carefully than most education reforms, because the change is sharp, dated, and
applies to everybody at once. Longer school-night sleep is a recurring finding, though its size varies.
Some studies report gains of twenty to forty-five minutes. In some settings the
gain is smaller than the start-time delay because bedtimes also drift later.
Several studies report better attendance and less daytime sleepiness. Some also
report lower teenage crash rates, but crash estimates come from fewer studies
and can be affected by other differences between places or periods.

Academic effects are smaller and less consistent than advocates usually suggest. Some studies
find modest improvements in grades; others find none; the honest summary is that the sleep
case is more consistent than the attainment case, while safety findings warrant
attention without being treated as equally certain. That distinction matters, because
the reform is usually sold on attainment and then evaluated on it.

The reason the change is difficult has almost nothing to do with any of this. A school
district's start times are the visible end of a transport system. Most districts run each bus
on two or three routes in sequence — high school first, then middle, then elementary —
because running them simultaneously would require two or three times the buses and drivers.
Move the high school later and either the elementary schools move earlier, putting the
youngest children at stops in the dark, or the district buys a fleet it does not have.

Around that constraint sits everything else. Athletic practice uses the last daylight of the
afternoon and competes with other districts on a shared schedule. Older students work
shifts. Families with two jobs have arranged childcare around a bell that has not moved in
thirty years, and a change of an hour is not an inconvenience to them but a crisis requiring
a new arrangement they may not be able to make.

None of these is an argument that the start time is correct. They are the reasons a correct
change is expensive, and they explain a pattern that recurs: a district may adopt the reform, encounter
transport costs it cannot sustain, and reverse it. An adoption announcement
alone therefore cannot establish that the change will last. One way to support a lasting change is a state-level requirement
that applies to districts together, which removes the competitive problem in
athletics and forces the transport question to be solved rather than avoided.

The literature's own conclusion is unglamorous. This is not a case where evidence is
contested or where a lobby is suppressing a finding. It is a case where the evidence is
clear, the beneficiaries are children who do not vote, the costs are concentrated, immediate,
and land on a budget line somebody has to defend, and the benefits are diffuse and arrive
later. Reforms with that shape are hard whatever the evidence says, and treating the
difficulty as ignorance is the mistake advocates most often make.`,
  questions: [
    {
      subskill: "main idea",
      family: "central-claim",
      difficulty: "Medium",
      stem: "The passage is chiefly concerned with:",
      key: "why a well-supported reform is nonetheless hard to adopt.",
      wrong: [
        ["how adolescent sleep patterns differ from adults'.", "The biology occupies the opening and is offered as settled."],
        ["whether later start times improve academic results.", "Attainment is one part of the evidence the passage reviews."],
        ["how school districts organise their bus networks.", "Transport is the leading obstacle, not the subject."],
      ],
      why: "The passage sets out the biology and the evidence, then devotes its second half to transport, athletics, childcare, and the shape of the political problem.",
      steps: [
        "Note where the passage stops presenting evidence.",
        "Check that the option covers the closing paragraph.",
      ],
      hint: "The final paragraph names the kind of problem this is.",
    },
    {
      subskill: "locate detail",
      family: "stated-detail",
      difficulty: "Easy",
      stem: "According to the passage, the typical circadian shift discussed at puberty is roughly:",
      key: "two hours in the later direction.",
      wrong: [
        ["two hours in the earlier direction.", "The shift described runs later, not earlier."],
        ["forty-five minutes in either direction.", "That figure is the gain in sleep after a start-time change."],
        ["one hour in the later direction.", "One to two hours is the resulting nightly deficit, not the shift."],
      ],
      why: "The opening paragraph describes a tendency towards later timing, often by roughly two hours, while acknowledging individual differences.",
      steps: [
        "Find the sentence describing the shift.",
        "Distinguish its size from the other figures given later.",
      ],
      hint: "Several numbers appear; take the one attached to the shift itself.",
    },
    {
      subskill: "cause and effect",
      family: "cause-of-a-constraint",
      difficulty: "Easy",
      stem: "The passage says districts run buses on two or three routes in sequence because running them at once would require:",
      key: "several times as many buses and drivers.",
      wrong: [
        ["a change to the state's transport regulations.", "No regulatory obstacle to simultaneous routes is described."],
        ["elementary schools to start in the dark.", "That is a consequence of moving times, not of simultaneous running."],
        ["agreement from neighbouring school districts.", "Inter-district agreement concerns athletics, not bus scheduling."],
      ],
      why: "The passage says districts stagger routes \"because running them simultaneously would require two or three times the buses and drivers.\"",
      steps: [
        "Locate the sentence about sequenced bus routes.",
        "Read the clause after *because*.",
      ],
      hint: "The reason is a multiple of the existing fleet.",
    },
    {
      subskill: "meaning in context",
      family: "vocabulary-in-context",
      difficulty: "Easy",
      stem: "The passage says a change of an hour is \"not an inconvenience\" to some families but a crisis because they:",
      key: "have built childcare around the existing bell.",
      wrong: [
        ["live too far from the school to adjust.", "Distance is not raised as a difficulty for families."],
        ["rely on older children to drive younger ones.", "Teenaged driving appears in the crash statistics, not here."],
        ["cannot afford the cost of the new buses.", "The fleet cost falls on the district, not on households."],
      ],
      why: "The passage says families with two jobs \"have arranged childcare around a bell that has not moved in thirty years,\" and that a change requires \"a new arrangement they may not be able to make.\"",
      steps: [
        "Find the sentence about families with two jobs.",
        "Note what the passage says they have arranged around the bell.",
      ],
      hint: "The difficulty is about what has been built on the current time.",
    },
    {
      subskill: "logical inference",
      family: "supported-inference",
      difficulty: "Medium",
      stem: "In the settings where students gain less extra sleep than the start-time delay, the passage attributes the difference to their tendency to:",
      key: "go to bed later once the change is made.",
      wrong: [
        ["are woken by younger siblings leaving earlier.", "Sibling schedules are not offered as a cause of lost sleep."],
        ["take on additional shifts at outside jobs.", "Student employment is listed among constraints, not as an effect."],
        ["sleep less at weekends than they used to.", "The weekend pattern is described before the reform, not after."],
      ],
      why: "The passage says that in some settings bedtimes also drift later. That can offset part of the later waking time, without implying that every study or every student shows the same pattern.",
      steps: [
        "Find the sentence quantifying the sleep gain.",
        "Read the clause explaining why it is smaller than the delay.",
      ],
      hint: "The explanation is given in the same sentence.",
    },
    {
      subskill: "function",
      family: "function-of-a-qualification",
      difficulty: "Medium",
      stem: "The author's remark that the attainment evidence is less consistent serves mainly to:",
      key: "separate the strong evidence from the weak.",
      wrong: [
        ["argue that the reform should not be adopted.", "The passage treats the change as correct and expensive."],
        ["show that the studies were poorly designed.", "The studies are described as unusually careful."],
        ["explain why districts reverse the change later.", "Reversals are attributed to transport costs, not to grades."],
      ],
      why: "The passage separates a recurring sleep gain from smaller and inconsistent academic effects. The distinction prevents one outcome from being used as evidence of another.",
      steps: [
        "Note the two cases the sentence distinguishes.",
        "Read the sentence that follows about how the reform is sold.",
      ],
      hint: "The remark warns about which case to argue from.",
    },
    {
      subskill: "claims and evidence",
      family: "claim-and-support",
      difficulty: "Hard",
      stem: "Which pair of findings best supports the passage's distinction between the sleep case and the academic case for later starts?",
      key: "Sleep usually increases, while reported grade gains vary across studies.",
      wrong: [
        ["Sleep usually increases, while grades improve in every studied district.", "The passage expressly reports mixed academic results."],
        ["Sleep stays unchanged, while grades improve in every studied district.", "Both halves contradict the reported pattern."],
        ["Sleep stays unchanged, while reported grade gains vary across studies.", "The academic half fits, but the sleep half contradicts the passage."],
      ],
      why: "The passage identifies longer sleep as a recurring finding and describes academic effects as smaller and inconsistent. Combining those results supports treating the two cases separately without ranking crash studies above the sleep evidence.",
      steps: [
        "Find the passage's account of sleep duration.",
        "Compare it with the separate paragraph on academic results.",
        "Choose the option that preserves both findings.",
      ],
      hint: "Keep the pattern in each outcome separate before combining them.",
      trap: "Choosing the most-quoted outcome rather than the most robust one.",
    },
    {
      subskill: "reasoning",
      family: "evaluating-a-position",
      difficulty: "Hard",
      stem: "The passage presents a state-level requirement as one way to support lasting change chiefly because it:",
      key: "applies to every district at the same time.",
      wrong: [
        ["provides the funding for additional buses.", "No funding is attributed to the legislature in the passage."],
        ["is harder for parents to object to publicly.", "Parental objection is not said to be reduced by a mandate."],
        ["comes with evidence districts had not seen.", "The passage denies that the difficulty is one of ignorance."],
      ],
      why: "The passage says a common requirement can address scheduling conflicts between districts and require a coordinated transport response. It offers that as a possible institutional remedy, not a proven explanation of every successful reform.",
      steps: [
        "Find the sentence describing what a mandate accomplishes.",
        "Note both effects it names.",
        "Reject options attributing money or new evidence to the mandate.",
      ],
      hint: "The advantage is that nobody can opt out.",
      trap: "Assuming a successful mandate must have supplied resources.",
    },
    {
      subskill: "synthesize information",
      family: "combining-sections",
      difficulty: "Hard",
      stem: "The account of possible reversals and the closing paragraph together suggest that adoption can fail where:",
      key: "concentrated costs meet diffuse benefits.",
      wrong: [
        ["the biological evidence is challenged by critics.", "The passage says the evidence is not contested."],
        ["parents learn that grades have not improved.", "Reversals are dated to the transport cost in the second year."],
        ["students themselves campaign against the change.", "No student opposition is described anywhere."],
      ],
      why: "The passage describes concentrated transport and scheduling costs alongside benefits spread among students. Together those details explain how an initially adopted policy could prove difficult to sustain.",
      steps: [
        "Note when in the sequence districts reverse the change.",
        "Match that to the description of costs in the final paragraph.",
        "Reject explanations the passage rules out.",
      ],
      hint: "The reversal is dated to a particular year for a reason.",
      trap: "Attributing failure to disputed evidence when the passage insists there is none.",
    },
    {
      subskill: "author's purpose",
      family: "purpose-of-a-paragraph",
      difficulty: "Hard",
      stem: "The final sentence identifies which error on the part of advocates?",
      key: "Treating a political difficulty as a lack of knowledge.",
      wrong: [
        ["Overstating the size of the sleep gain achieved.", "The gain is reported accurately in the passage's own terms."],
        ["Ignoring the needs of families with two jobs.", "Those families are described but no advocate is blamed for them."],
        ["Relying on states rather than on local districts.", "State mandates are credited with the reform's survival."],
      ],
      why: "The passage says reforms of this shape \"are hard whatever the evidence says, and treating the difficulty as ignorance is the mistake advocates most often make.\"",
      steps: [
        "Read the final clause of the passage.",
        "Note the noun it uses for the misdiagnosis.",
        "Reject options describing errors the passage does not attribute to advocates.",
      ],
      hint: "The word the sentence ends on names the error.",
      trap: "Choosing a criticism of the reform when the sentence criticises its supporters' diagnosis.",
    },
    {
      subskill: "interpret detail",
      family: "detail-interpretation",
      difficulty: "Easy",
      stem: "The observation that the shift appears in adolescents with no electric light indicates that it is:",
      key: "not solely a result of screens or electric lighting.",
      wrong: [
        ["stronger where there is no electricity.", "No difference in magnitude between populations is reported."],
        ["hard to measure outside rich countries.", "The passage says it has been measured in every population."],
        ["dependent on the season of the year.", "Seasonal variation is not discussed in the passage."],
      ],
      why: "The passage points to later adolescent timing without electric lighting. That rules out a solely lighting-based explanation; it does not rule out every possible influence of modern habits.",
      steps: [
        "Find the sentence listing what the shift is not.",
        "Note what the final clause is offered to rule out.",
      ],
      hint: "The clause answers a common explanation.",
    },
  ],
};
