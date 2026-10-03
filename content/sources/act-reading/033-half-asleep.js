"use strict";

// Fact-check: Mallard position experiment: https://pubmed.ncbi.nlm.nih.gov/10563490/
// Fact-check: Local sleep after visual stimulation: https://pmc.ncbi.nlm.nih.gov/articles/PMC3125620/

module.exports = {
  id: "act-reading-p033",
  type: "natural-science",
  title: "Half Asleep",
  intro: "This original passage discusses sleep in animals.",
  content: `A mallard sleeping at the edge of a row of mallards often keeps one eye open. This is not a
figure of speech and not merely a matter of dozing lightly. The eye tends to point away from
the group. At the same time, recordings show relatively wake-like activity in the connected
brain hemisphere and the slower waves associated with sleep in the other. In experiments,
birds at the exposed ends spent more of their sleep in this state than birds protected by
neighbours on both sides. Moving a bird towards the middle reduced that proportion; moving
it back towards the edge increased it. The difference was a shift in how sleep was divided,
not an absolute switch between never and always sleeping with one eye open.

Unihemispheric slow-wave sleep has been recorded in dolphins, some other aquatic mammals,
and several kinds of birds. Eared seals provide another example of flexible use: in water
they often sleep with one hemisphere at a time, whereas on land they spend more time
sleeping with both hemispheres together. Such comparisons provide valuable evidence about
what sleep accomplishes. They show that an animal can adjust the form of sleep to its
circumstances instead of simply abandoning sleep whenever stillness is inconvenient.

Keeping part of the brain awake does not make sleep unnecessary. A hemisphere whose sleep
has been experimentally disrupted can show a rebound afterwards, with stronger slow waves
when sleep resumes. Dolphins can also sleep while moving through the water. These findings
challenge the simple immobilisation hypothesis: the claim that sleep serves only to keep
an animal still and out of trouble when it cannot forage. If stillness were the whole
purpose, a dolphin that must keep swimming would have no reason to retain sleep during
that activity. Retaining sleep, together with the compensatory response after disruption,
suggests that sleep performs work beyond preventing movement. It does not settle exactly
what that work is or show that all animals have identical sleep requirements.

One family of explanations concerns maintenance: clearing metabolic products that
accumulate during waking, restoring cellular supplies, and repairing what use damages.
Another concerns information: consolidating what was learned and, in one influential
account, adjusting connections so that the brain can accommodate new learning. These
families overlap. Processing information uses cells, and maintaining those cells may help
them process information. Researchers therefore need experiments that distinguish among
specific predictions, rather than observations that either broad family could explain.
Comparing regions within one animal can help, because many whole-body differences are
held constant while experience or activity varies locally.

A related experiment kept pigeons awake while providing visual stimulation through only
one eye. During later sleep, slow-wave activity increased more in the brain region
receiving that stimulation. The result links local sleep to prior use; it does not by
itself prove that learning rather than cellular maintenance produced the difference.
It challenges a simple housekeeping account in which every region follows a fixed schedule
regardless of what happened while awake. An account that permits local maintenance to
respond to local use, however, remains possible. The observation narrows the explanation
without selecting one complete theory.

The mallard result also suggests a question about life outside the laboratory. If some
birds repeatedly occupy exposed positions, they might repeatedly divide their sleep
differently from birds in sheltered positions. This is a conditional possibility, not
proof that social rank determines where every bird sleeps. The experiment establishes a
response to position; it does not establish how positions are allocated in a wild flock.
Nor does it establish whether repeated exposure has consequences over a season for
learning, immune function, or survival. Answering that question would require following
individual birds over time while distinguishing their sleeping positions from other
differences in their circumstances. A short experiment can reveal a mechanism without
measuring every consequence that mechanism might have.`,
  questions: [
    {
      subskill: "main idea",
      family: "central-claim",
      difficulty: "Medium",
      stem: "The passage presents unihemispheric sleep chiefly as:",
      key: "evidence bearing on what sleep accomplishes.",
      wrong: [
        ["an adaptation unique to marine mammals and birds.", "The passage uses the adaptation to examine sleep function; it does not make a claim of taxonomic exclusivity."],
        ["proof that sleep can be dispensed with when necessary.", "The animals retain sleep while changing its form."],
        ["a defect that arises when animals are kept in groups.", "The passage describes flexible behaviour, not a disorder."],
      ],
      why: "The passage uses flexible sleep patterns, rebound, and the local effects of prior activity to examine what sleep accomplishes. It treats the studies as evidence that constrains explanations.",
      steps: [
        "Find the sentence that states why the phenomenon matters.",
        "Check that the option matches the use made of it in later paragraphs.",
      ],
      hint: "Consider what the author uses the different animal examples to investigate.",
    },
    {
      subskill: "locate detail",
      family: "stated-detail",
      difficulty: "Easy",
      stem: "According to the passage, a mallard at the end of a row tends to keep open the eye that faces:",
      key: "away from the rest of the group.",
      wrong: [
        ["towards the centre of the row.", "The open eye is on the outward-facing side, not the inward one."],
        ["in the direction of the wind.", "Wind direction is not mentioned anywhere in the passage."],
        ["upward, towards the open sky.", "The passage describes a horizontal orientation relative to the group."],
      ],
      why: "The opening paragraph says the open eye tends to point away from the group.",
      steps: [
        "Find the description of the sleeping mallard.",
        "Note the direction the open eye faces.",
      ],
      hint: "Look for the eye direction in the first paragraph.",
    },
    {
      subskill: "cause and effect",
      family: "cause-of-a-behaviour",
      difficulty: "Easy",
      stem: "The passage says the proportion of a mallard’s sleep spent with one eye open decreases when the bird is:",
      key: "moved to the middle of the row.",
      wrong: [
        ["kept awake for several nights running.", "Sleep deprivation is not described as changing the behaviour."],
        ["fitted with an electrode on its skull.", "The electrode records the behaviour; it does not alter it."],
        ["placed in water rather than on land.", "That distinction is described for eared seals, not for mallards."],
      ],
      why: "The passage reports a smaller proportion of unihemispheric sleep when a bird is moved toward the protected middle of the row.",
      steps: [
        "Locate the comparison between exposed and protected positions.",
        "Match the move toward the middle with its effect on the proportion of sleep.",
      ],
      hint: "The difference concerns the amount of this sleep pattern, not its complete disappearance.",
    },
    {
      subskill: "meaning in context",
      family: "vocabulary-in-context",
      difficulty: "Easy",
      stem: "As it is used in the third paragraph, the word *rebound* refers to:",
      key: "deeper sleep taken afterwards to compensate.",
      wrong: [
        ["a return to swimming after a period of rest.", "The term describes later sleep activity, not locomotion."],
        ["a return to the flock after leaving it.", "The term concerns a brain hemisphere, not a bird’s position."],
        ["a rise in alertness in the waking hemisphere.", "The passage describes stronger slow waves when sleep resumes."],
      ],
      why: "The passage describes stronger slow waves when sleep resumes after experimental disruption. Here rebound means compensating later, not returning to swimming or recovering from birth.",
      steps: [
        "Read the clause that follows the word.",
        "Note that it describes the same hemisphere at a later time.",
      ],
      hint: "The sentence explains the term as it introduces it.",
    },
    {
      subskill: "logical inference",
      family: "supported-inference",
      difficulty: "Medium",
      stem: "The passage implies that if sleep served only to immobilise animals, a continuously swimming dolphin would:",
      key: "have no reason to sleep at all.",
      wrong: [
        ["sleep with both hemispheres while moving.", "The hypothesis concerns why sleep exists, not how it is divided."],
        ["show a stronger rebound than other animals.", "Rebound is evidence about cost, not about the hypothesis's prediction."],
        ["forage more often than a resting dolphin.", "Foraging rates are not discussed in the passage."],
      ],
      why: "The passage reasons that if stillness were the whole purpose of sleep, an animal that keeps moving would have no reason to retain sleep during that movement.",
      steps: [
        "State what the hypothesis says sleep is for.",
        "Ask what it predicts for an animal that cannot stay still.",
      ],
      hint: "The passage spells the prediction out before rejecting it.",
    },
    {
      subskill: "comparison",
      family: "contrast-of-explanations",
      difficulty: "Medium",
      stem: "The passage distinguishes two families of explanation for sleep according to whether sleep principally:",
      key: "repairs the brain or reorganises what it holds.",
      wrong: [
        ["occurs at night or is distributed across the day.", "Timing is not the basis on which the families are divided."],
        ["evolved once or arose separately in each group.", "Evolutionary history is not part of the distinction drawn."],
        ["requires stillness or can occur during movement.", "That question belongs to the hypothesis the passage rejects."],
      ],
      why: "The passage sets a maintenance family — \"clearing metabolic products ... restoring cellular supplies\" — against an information family concerned with \"consolidating what was learned\" and adjusting synapses.",
      steps: [
        "Read the two descriptions in the fourth paragraph.",
        "Reduce each to a single verb.",
      ],
      hint: "One family is about substances and the other about content.",
    },
    {
      subskill: "claims and evidence",
      family: "claim-and-support",
      difficulty: "Hard",
      stem: "The pigeon experiment is offered as evidence chiefly because it shows that sleep depth:",
      key: "follows which hemisphere received more visual stimulation.",
      wrong: [
        ["increases after any period of prolonged waking.", "A general effect of waking would not distinguish the two accounts."],
        ["differs between birds at the ends of a row.", "Position effects are discussed separately, in the final paragraph."],
        ["is reduced when only one eye is available.", "The passage reports more slow-wave activity, not less."],
      ],
      why: "The passage supports this conclusion: The pigeon experiment gives the two hemispheres different visual experience during waking. The more stimulated side later shows greater slow-wave activity. This supports local regulation of sleep according to use; it does not by itself isolate learning or exclude maintenance.",
      steps: [
        "Identify what differs between the two hemispheres during waking.",
        "Compare their later slow-wave activity.",
        "Keep the conclusion at the level the experiment measures.",
      ],
      hint: "The design holds the animal constant and varies the hemisphere.",
      trap: "Choosing a general fact about sleep rather than the within-animal comparison.",
    },
    {
      subskill: "reasoning",
      family: "evaluating-an-inference",
      difficulty: "Hard",
      stem: "Which combination of observations supports the passage’s inference that sleep does work beyond immobilising an animal?",
      key: "Dolphins retain sleep during movement, and disrupted sleep can produce compensatory slow waves.",
      wrong: [
        ["Mallards face away from their groups, and their eyes connect with opposite brain hemispheres.", "These observations explain vigilance, but neither addresses sleep during movement or compensation after disruption."],
        ["Eared seals spend time on land, and pigeons receive visual stimulation through one eye.", "These are circumstances of observations, not evidence of retention and compensation."],
        ["Birds occupy different positions, and researchers propose several competing accounts of sleep.", "Variation and disagreement do not by themselves establish the functional inference."],
      ],
      why: "The third paragraph connects sleep during movement with rebound after disruption. Together these observations support a function beyond merely keeping the body still, while leaving the precise function unsettled.",
      steps: [
        "Identify what continued sleep during swimming challenges.",
        "Connect rebound after disruption with a compensatory response.",
        "Choose the pair that supports the limited conclusion without selecting a complete theory.",
      ],
      hint: "The inference combines retention during movement with compensation after disruption.",
      trap: "Taking universality as the premise when the argument rests on cost.",
    },
    {
      subskill: "function",
      family: "function-of-a-detail",
      difficulty: "Medium",
      stem: "The conditional example of birds repeatedly occupying exposed positions serves mainly to:",
      key: "connect a laboratory finding to a possible longer-term consequence.",
      wrong: [
        ["explain why all wild flocks arrange themselves in rows.", "The passage does not establish how positions in wild flocks are allocated."],
        ["prove that dominant birds always sleep more deeply.", "The passage explicitly withholds a conclusion about rank."],
        ["show that the response to position must be learned.", "The passage does not determine whether the response is learned."],
      ],
      why: "The final paragraph extends the position effect into a possible repeated difference in sleep, while making clear that longer-term consequences have not been measured by that experiment.",
      steps: [
        "Separate what the experiment established from the conditional possibility.",
        "Identify the further consequence that would require follow-up observations.",
      ],
      hint: "The paragraph moves from a short experiment to what could happen repeatedly.",
    },
    {
      subskill: "author's purpose",
      family: "purpose-of-a-paragraph",
      difficulty: "Medium",
      stem: "The author closes by describing an unanswered question in order to:",
      key: "mark a possible consequence beyond what the experiment establishes.",
      wrong: [
        ["suggest that the earlier findings are unreliable.", "A limited scope does not make the reported position effect unreliable."],
        ["argue that wild birds should be studied less often.", "The paragraph describes what further study would require."],
        ["show that social rank explains all sleep differences.", "The paragraph explicitly says the experiment does not establish how positions are allocated."],
      ],
      why: "The passage’s conclusion distinguishes the experimentally observed response to position from possible consequences over a season. Following individual birds and accounting for other differences would be necessary to examine those consequences.",
      steps: [
        "Identify what the position experiment already establishes.",
        "Find what additional evidence a claim about seasonal consequences would require.",
      ],
      hint: "The distinction is between a demonstrated mechanism and its possible later consequences.",
    },
    {
      subskill: "interpret detail",
      family: "detail-interpretation",
      difficulty: "Easy",
      stem: "The contrast between eared seals’ sleep in water and on land indicates that their sleep pattern is:",
      key: "adjusted in response to their setting.",
      wrong: [
        ["restricted to animals that never come ashore.", "The same seals use different patterns in water and on land."],
        ["identical wherever an individual happens to rest.", "The passage describes a difference between settings."],
        ["determined mainly by the time of the breeding season.", "The passage does not discuss breeding-season timing."],
      ],
      why: "The passage says eared seals often use one hemisphere at a time in water and spend more time sleeping with both on land. That difference indicates flexibility with setting, not an all-or-nothing requirement.",
      steps: [
        "Compare the described proportions of one-hemisphere and two-hemisphere sleep in water.",
        "Compare those proportions with the same seals’ sleep on land.",
      ],
      hint: "Compare the same animals in the two settings.",
    },
  ],
};
