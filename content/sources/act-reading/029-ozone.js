"use strict";

// Fact-check: NASA historical account, including the filtering myth: https://ntrs.nasa.gov/api/citations/20190002263/downloads/20190002263.pdf
// Fact-check: Recovery projection: https://www.unep.org/news-and-stories/press-release/ozone-layer-recovery-track-helping-avoid-global-warming-05degc

module.exports = {
  id: "act-reading-p029",
  type: "natural-science",
  title: "Checking the Ozone Record",
  intro: "This original passage discusses the discovery of Antarctic ozone depletion.",
  content: `The British Antarctic Survey's ozone record began during the International
Geophysical Year of 1957–58. A Dobson spectrophotometer compares ultraviolet
wavelengths to estimate how much ozone lies above the station. Repeating that
measurement does not look dramatic. Its value appears when the measurements from
one season can be placed beside those from many earlier seasons.

In the early 1980s, the spring readings at Halley became disturbingly low. The
team checked the instruments before accepting an atmospheric change. In May 1985,
Joe Farman, Brian Gardiner, and Jonathan Shanklin published evidence of severe
Antarctic springtime depletion. Their long ground record made a change visible
that an isolated low reading could not establish. A low value and a declining
series are different claims, and they need different evidence.

NASA's satellites also detected unusually low ozone. A familiar retelling says
that a computer discarded the readings and nobody noticed until the British paper
appeared. That story has a satisfying shape: a humble instrument succeeds where a
large automated system fails. It is also wrong about the sequence. Satellite
researchers were investigating the anomaly in 1984 and submitted a conference
abstract that December, before the British paper was published.

There were delays, but they were more complicated than an unattended filter.
Processing had fallen behind observation. When the unusual satellite results
became available, researchers sought independent measurements to check them.
Some ground values initially disagreed and were later withdrawn as erroneous;
later measurements supported the satellite result. The satellite estimates also
required changes to assumptions about the vertical distribution of ozone. An
instrument records radiation, and an algorithm translates that record into an
ozone estimate. Both the measurement and that translation deserve scrutiny.

This does not make screening a mistake. It makes a screen a question rather than
a verdict. A value outside a familiar range may indicate faulty hardware, a
limitation in the calculation, or something unfamiliar in the atmosphere. The
word *anomaly* does not decide among those possibilities. Nor does agreement with
one established instrument settle the matter if that instrument's own record is
wrong. Independent checking is a process of comparing evidence, not an instruction
to believe whichever device has been in service longest.

The corrected history changes the lesson. Ground stations and satellites were not
competing witnesses from which science had to choose one winner. The ground series
gave a long record at particular places; satellite maps showed the broad extent of
the depletion. Each could answer a question the other could not answer as well.
The useful contrast is between one observation and a network of checks. A routine
measurement can become crucial without making a newer instrument useless, and a
wide field of view can reveal a pattern without eliminating the need for local
measurements. Removing either contribution would leave a thinner account.

The policy history needs the same care with sequence. Concern about chemicals
that deplete ozone predated the 1985 paper. The Vienna Convention was adopted in
March of that year; the Montreal Protocol followed in 1987. Discovery did not
create international discussion from nothing. It gave that discussion a striking
visible consequence, while scientific work and negotiations continued. Saying that
one paper alone produced a treaty erases the institutions that had already begun
the work, much as the computer story erases the scientists already checking the
satellite result. An event can be decisive without being the sole cause.

Recovery operates on a slower clock. The 2022 international assessment projected
a return to 1980 Antarctic ozone levels around 2066 if current policies continue.
That is a conditional projection, not a date promised by a treaty. Long-lived
chemicals remain after production is curtailed, and annual weather changes the
size of the hole. Continued measurements therefore matter after agreement as
well as before it. Even prompt action buys a slow repair, and a successful policy
still needs observers who keep checking what the atmosphere actually does.`,
  questions: [
    {
      subskill: "main idea",
      family: "central-claim",
      difficulty: "Medium",
      stem: "The passage is chiefly concerned with:",
      key: "how checking the historical record changes a discovery story.",
      wrong: [
        ["why satellite instruments are less reliable than ground ones.", "The passage says the satellite saw the depletion and blames the processing."],
        ["how chlorofluorocarbons destroy ozone in the upper atmosphere.", "The chemistry is mentioned in one clause and never explained."],
        ["why environmental treaties usually fail to be ratified.", "The Montreal Protocol is described as ratified by every country."],
      ],
      why: "The passage corrects a simplified satellite-filter story, explains the complementary observations, and then applies the same caution about sequence to the policy response.",
      steps: [
        "Identify the familiar story the author corrects.",
        "Connect that correction with the later discussion of policy.",
      ],
      hint: "Find the approach the author uses in both the scientific and policy histories.",
    },
    {
      subskill: "locate detail",
      family: "stated-detail",
      difficulty: "Easy",
      stem: "According to the passage, before accepting the low readings as an atmospheric change, the British team:",
      key: "checked the instruments producing the readings.",
      wrong: [
        ["compared its results with a published satellite map.", "The passage describes checking the instruments, not relying on a published satellite map."],
        ["waited until the ozone depletion stopped deepening.", "The passage does not say they waited for depletion to stop."],
        ["abandoned the older station record as unreliable.", "The long ground record is presented as essential evidence."],
      ],
      why: "The second paragraph says the team checked the instruments before accepting an atmospheric change.",
      steps: [
        "Locate the account of the early low readings.",
        "Identify what the team checked before interpreting the change.",
      ],
      hint: "Separate checking a measurement from explaining the atmosphere.",
    },
    {
      subskill: "cause and effect",
      family: "cause-of-an-omission",
      difficulty: "Easy",
      stem: "According to the passage, why were some earlier satellite observations not immediately available for interpretation?",
      key: "Processing had fallen behind the observations.",
      wrong: [
        ["The satellites could measure only Antarctic winter darkness.", "The passage attributes the delay to processing, not a winter-only instrument."],
        ["The entire record was lost when storage equipment changed.", "The observations were retained; no loss of the entire record is described."],
        ["The satellites used wavelengths incapable of detecting ozone.", "The passage says the satellites detected low ozone."],
      ],
      why: "The fourth paragraph names a processing delay before describing validation and calculation issues.",
      steps: [
        "Find the stated reason observations and results were separated in time.",
        "Do not substitute the discarded-data story that the passage rejects.",
      ],
      hint: "The relevant sentence separates observation from processing.",
    },
    {
      subskill: "meaning in context",
      family: "vocabulary-in-context",
      difficulty: "Easy",
      stem: "As it is used in the fifth paragraph, the word *screen* refers to:",
      key: "a check that identifies a value for further scrutiny.",
      wrong: [
        ["the display on which a satellite map is published.", "The paragraph concerns screening a result, not displaying it."],
        ["the atmospheric layer that absorbs ultraviolet light.", "The screen belongs to the evaluation of data, not the atmosphere."],
        ["the surface on which ultraviolet light is projected.", "No projection surface is described in the passage."],
      ],
      why: "The fifth paragraph calls a screen a question rather than a verdict and lists several possible explanations for an unusual value.",
      steps: [
        "Read what the screen flags.",
        "Distinguish a request for checking from a final explanation.",
      ],
      hint: "Ask what happens to an unusual value after it is noticed.",
    },
    {
      subskill: "logical inference",
      family: "supported-inference",
      difficulty: "Medium",
      stem: "The passage implies that disagreement between a satellite result and an established ground instrument should lead researchers to:",
      key: "check the methods and evidence behind both results.",
      wrong: [
        ["accept the older instrument because its record is longer.", "The passage warns that an established instrument can also produce incorrect values."],
        ["accept the satellite because its field of view is wider.", "Wider coverage does not remove the need to validate a measurement."],
        ["discard both results before examining their calculations.", "The passage treats disagreement as a reason to investigate rather than erase evidence."],
      ],
      why: "The fifth paragraph rejects automatic deference to the older device. The earlier ground-data error and the satellite calculation changes show why either side may need examination.",
      steps: [
        "Compare the errors or limitations described for each kind of measurement.",
        "Choose an inference that treats disagreement as evidence to investigate.",
      ],
      hint: "Neither age nor coverage alone establishes reliability.",
    },
    {
      subskill: "function",
      family: "function-of-a-qualification",
      difficulty: "Medium",
      stem: "The remark that \"This does not make screening a mistake\" serves mainly to:",
      key: "distinguish a useful check from an automatic verdict.",
      wrong: [
        ["defend every assumption used by the satellite team.", "The passage says calculation assumptions required scrutiny and revision."],
        ["show that ground instruments never need calibration.", "The British team checked its instruments, and other ground values were erroneous."],
        ["argue that automated calculations should be abandoned.", "The author supports checking and improving calculations, not abandoning them."],
      ],
      why: "The fifth paragraph preserves screening while refusing to let a flag decide whether an instrument or the atmosphere is at fault.",
      steps: [
        "Identify what the sentence retains as useful.",
        "Identify the role that the following sentences refuse to give it.",
      ],
      hint: "The sentence separates a starting point from a conclusion.",
    },
    {
      subskill: "claims and evidence",
      family: "claim-and-support",
      difficulty: "Hard",
      stem: "Which pair of details most directly contradicts the claim that satellite researchers noticed the anomaly only after the British paper?",
      key: "Satellite work was reported in December 1984; the paper appeared in May 1985.",
      wrong: [
        ["The ground record began in 1957–58; the instrument compared ultraviolet wavelengths.", "These details describe ground observations rather than the order of the two reports."],
        ["Some ground values were withdrawn; satellite estimates used an ozone profile.", "Those details explain validation problems but do not date the investigation."],
        ["The Vienna Convention came in March 1985; the Montreal Protocol followed in 1987.", "These are policy dates, not the sequence of the scientific reports."],
      ],
      why: "The passage dates the satellite conference abstract to December 1984 and the British paper to May 1985. The earlier date rules out the claimed after-publication discovery.",
      steps: [
        "Find the two dates for reporting scientific results.",
        "Put them in chronological order.",
        "Compare that order with the claim being tested.",
      ],
      hint: "Use the scientific-report dates rather than the treaty dates.",
      trap: "Choosing the satellite's coverage, which establishes opportunity rather than detection.",
    },
    {
      subskill: "reasoning",
      family: "evaluating-a-case",
      difficulty: "Hard",
      stem: "The passage's criticism of attributing the treaty to one paper rests chiefly on the fact that:",
      key: "international work was already under way before publication.",
      wrong: [
        ["the satellite measurements contradicted the British paper completely.", "The passage describes complementary evidence, not complete contradiction."],
        ["the discovery had no effect on how the public understood ozone.", "The passage credits the discovery with a striking visible consequence."],
        ["the Montreal Protocol preceded all evidence of Antarctic depletion.", "The Protocol is dated 1987, after the 1985 paper."],
      ],
      why: "The passage places the March 1985 Vienna Convention before the May paper. Its argument is that discovery contributed to an existing process rather than creating that process alone.",
      steps: [
        "Compare the Convention date with the publication date.",
        "Distinguish an important contribution from a sole cause.",
        "Reject claims that erase the contribution entirely.",
      ],
      hint: "A cause can matter without being the first event in the sequence.",
      trap: "Assuming the science alone explains the speed, which the passage denies.",
    },
    {
      subskill: "conclusion",
      family: "drawing-a-conclusion",
      difficulty: "Hard",
      stem: "The final paragraph is best understood as making the point that:",
      key: "even prompt action buys a very slow repair.",
      wrong: [
        ["the treaty has failed to reduce atmospheric chlorine.", "Chlorine is reported to have peaked and to be declining."],
        ["the hole is unlikely to close within this century.", "Closure is projected for the 2060s, within the century."],
        ["longer-lived molecules should have been banned first.", "No ranking of substances by lifetime is proposed in the passage."],
      ],
      why: "The final paragraph gives a conditional recovery projection decades after the treaty and says that long-lived chemicals remain. Those separated dates and the stated mechanism support the conclusion that even prompt action brings slow repair.",
      steps: [
        "Compare the policy and projected recovery dates.",
        "Find the physical reason the passage gives for that gap.",
        "Keep the condition attached to the projection.",
      ],
      hint: "Compare the two timescales, then identify why they differ.",
      trap: "Reading a success story as reporting an unqualified success.",
    },
    {
      subskill: "interpret detail",
      family: "detail-interpretation",
      difficulty: "Medium",
      stem: "The passage's description of a low value and a declining series as \"different claims\" indicates that:",
      key: "showing a trend requires comparison across multiple observations.",
      wrong: [
        ["a single low measurement must always be an instrument fault.", "The passage lists several possible explanations for an unusual result."],
        ["a long series guarantees that every individual reading is correct.", "The passage explains why even established records require checking."],
        ["satellites are incapable of detecting changes over successive years.", "The passage describes satellite observations contributing to the evidence."],
      ],
      why: "The second paragraph connects the long ground record with evidence of change. One low reading shows a value at one time; a decline requires comparison.",
      steps: [
        "Identify what can be learned from one value.",
        "Identify the comparison necessary to establish change.",
      ],
      hint: "Distinguish the level of a measurement from its movement over time.",
    },
  ],
};
