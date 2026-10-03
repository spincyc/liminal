"use strict";

// Original rounded illustration, not an observational data series. Keep the
// accessible description and plotted coordinates tied to the same values.
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const departures = [0, 1, 2, 3, 4, 3, 1, -2, -4, -3, -2, -1];
const px = (index) => 65 + 46 * index;
const py = (value) => 150 - 24 * value;
const number = (value) => String(value).replace("-", "−");
const figure = {
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 330">
<g fill="none" stroke="currentColor">
<path d="M65 44 V254 H580"/>
${Array.from({ length: 9 }, (_, i) => i - 4).map((value) => `<path d="M59 ${py(value)} H580" stroke-opacity="${value === 0 ? 0.7 : 0.16}"${value === 0 ? ' stroke-dasharray="4 4"' : ""}/>`).join("\n")}
<polyline points="${departures.map((value, i) => `${px(i)},${py(value)}`).join(" ")}" stroke-width="2.5"/>
</g>
<g fill="currentColor">${departures.map((value, i) => `<circle cx="${px(i)}" cy="${py(value)}" r="3.5"/>`).join("")}</g>
<g fill="currentColor" font-family="sans-serif" font-size="13">
<text x="310" y="21" text-anchor="middle">Figure 1. A simplified annual carbon dioxide cycle</text>
${Array.from({ length: 9 }, (_, i) => i - 4).map((value) => `<text x="51" y="${py(value) + 4}" text-anchor="end">${number(value)}</text>`).join("\n")}
${months.map((month, i) => `<text x="${px(i)}" y="278" text-anchor="middle">${month}</text>`).join("\n")}
<text x="310" y="310" text-anchor="middle">Month</text>
<text x="17" y="150" transform="rotate(-90 17 150)" text-anchor="middle">Departure from annual mean (ppm)</text>
</g></svg>`,
  alt: `Figure 1. A simplified illustration of monthly carbon dioxide departures from the annual mean at Mauna Loa, rounded to the nearest part per million (ppm). The horizontal axis is month; the vertical axis is departure in ppm, from −4 to 4 in steps of 1. Points in month order: ${months.map((month, i) => `${month} ${number(departures[i])}`).join("; ")}. Segments connect consecutive months.`,
  notToScale: false,
};

module.exports = {
  id: "act-reading-p018",
  type: "natural-science",
  title: "The Breathing Curve",
  intro: "This original passage discusses the longest continuous record of atmospheric carbon dioxide. The figure is a simplified illustration for this practice passage.",
  figure,
  content: `When Charles David Keeling put an instrument on Mauna Loa in 1958, the question he
was trying to settle was narrow and technical: whether the amount of carbon dioxide in the
air could be measured accurately enough to be compared from one year to the next. Earlier
attempts had produced numbers that scattered wildly, and the general view was that the gas
was too variable to have a meaningful global value at all. Keeling suspected the scatter was
in the instruments and the sampling sites rather than in the air, which is why he chose a
volcano in the middle of an ocean, thousands of kilometres from any continent, and why he built his
own analyser.

Within two years he had two results. The first is the one everybody knows: the amount was
rising, steadily, year over year. The second was stranger and arrived faster. The
concentration did not merely rise. It went up and down within each year, by several parts
per million, on a schedule that repeated.

Figure 1 illustrates monthly departures from the annual mean, rounded to the
nearest part per million. A value of zero means the annual mean, not an absence of
carbon dioxide. The points are a simplified illustration, not a particular year's
measurements.

The explanation is photosynthesis, and it is lopsided for a reason that has nothing to do
with climate. Most of the planet's land is north of the equator; the southern hemisphere is
mostly ocean. When the northern forests and croplands leaf out in spring, they pull carbon
out of the air faster than decay returns it, and the global concentration falls until the
leaves stop working in the autumn. Then respiration and decomposition run without the
counterweight, and it climbs again through the winter. The curve at Mauna Loa is not a
local signal. It is the northern land surface, inhaling and exhaling, measured from the
middle of the Pacific.

That last point did more work than it is usually given credit for. Through the 1960s the
most common objection to the record was that a single mountain could not speak for the
planet. The seasonal cycle answered it. A local contamination — traffic, vegetation on the
slope below, the volcano itself — would not swing in step with the growing season of a
land mass thousands of kilometres away. The wiggle was evidence that the instrument was
sampling the hemisphere.

Since then the wiggle itself has become a subject. The amplitude of the annual swing at
northern stations has grown substantially since the 1960s, by something like a fifth,
which means the seasonal exchange between land and air is larger than it used to be. Three
explanations compete. Warming has lengthened the northern growing season. Higher carbon
dioxide concentrations may themselves be raising plant productivity. Agriculture has
expanded and intensified across the mid-latitudes, and a maize field is a far more vigorous
summer sink than the grassland it replaced. All three are plausible, all three are almost
certainly contributing, and dividing the credit among them has resisted twenty years of
work, because the three run together in time and no station separates them.

Keeling's own trouble was more prosaic. The record has come close to ending several times
for want of funding, most seriously in the 1960s and again in the 1990s, on the reasoning
that the measurement was routine and the interesting science had been done. The reasoning
was mistaken in a way that is easy to state and hard to act on: the value of an unbroken
record is not in any one year of it, and no year of it can be added later.`,
  questions: [
    {
      subskill: "main idea",
      family: "central-claim",
      difficulty: "Medium",
      stem: "The passage is best described as an account of:",
      key: "what one long record established beyond its original question.",
      wrong: [
        ["how a scientist proved that carbon dioxide levels are rising.", "The rise is called the result everybody knows and takes up one sentence."],
        ["why the northern hemisphere holds most of the planet's land.", "The distribution of land is background used to explain the seasonal cycle."],
        ["how funding decisions have damaged long-running measurements.", "Funding appears only at the end, and the record was in fact sustained."],
      ],
      why: "The passage begins with a \"narrow and technical\" question about measurement, then follows the seasonal cycle as evidence of hemispheric sampling, as a subject of study in its own right, and as an argument for continuity.",
      steps: [
        "Note the question the first paragraph says Keeling set out to settle.",
        "Count how much of the passage is about things he was not looking for.",
      ],
      hint: "The first paragraph deliberately understates the project.",
    },
    {
      subskill: "locate detail",
      family: "stated-detail",
      difficulty: "Easy",
      stem: "According to the passage, Keeling chose Mauna Loa as a site because it is:",
      key: "far from any continental land mass.",
      wrong: [
        ["high enough to be above most weather.", "Altitude is not among the reasons the passage gives for the choice."],
        ["close to the equator and its steady air.", "Latitude is discussed for land distribution, not as a criterion for the site."],
        ["a place where earlier readings had been taken.", "Earlier attempts are described as scattered, with no site named."],
      ],
      why: "The passage locates Mauna Loa in the middle of an ocean, thousands of kilometres from a continent. The stated reason is remoteness from continental sources, not its height or a previous set of readings.",
      steps: [
        "Find the clause listing what he chose and what he built.",
        "Take the property of the site that the sentence emphasises.",
      ],
      hint: "The sentence gives a distance.",
    },
    {
      subskill: "integrate graph data",
      family: "reading-a-figure",
      difficulty: "Easy",
      stem: "According to Figure 1, the concentration falls farthest below the annual mean in:",
      key: "September, near the end of summer.",
      wrong: [
        ["May, at the close of the spring.", "May is the highest point on the figure rather than the lowest one."],
        ["December, at the end of the year.", "December is below the mean but by the smallest amount among the months below the mean."],
        ["October, in the middle of autumn.", "October is below the mean but sits one unit above the lowest mark on the plot."],
      ],
      why: "Figure 1 in the passage plots each month as a departure from the annual mean, and the mark at the bottom of the vertical scale stands above the September label on the horizontal axis.",
      steps: [
        "Find the plotted point with the lowest departure from the annual mean.",
        "Read down to the month label beneath that mark.",
      ],
      hint: "Look for the mark nearest the bottom of the plot.",
    },
    {
      subskill: "cause and effect",
      family: "cause-of-a-cycle",
      difficulty: "Medium",
      stem: "The passage attributes the annual fall in concentration through the summer to:",
      key: "northern plants taking up carbon faster than decay returns it.",
      wrong: [
        ["colder ocean water absorbing more gas in those months.", "Ocean uptake is never given as a driver of the seasonal swing in the passage."],
        ["reduced use of fuels for heating during the warm season.", "Human emissions are not offered as the explanation of the seasonal cycle."],
        ["southern hemisphere forests entering their growing season.", "The south is mostly ocean, which the passage gives as the reason for the imbalance."],
      ],
      why: "The passage says that when northern forests and croplands leaf out, \"they pull carbon out of the air faster than decay returns it, and the global concentration falls until the leaves stop working in the autumn.\"",
      steps: [
        "Find the paragraph beginning with the explanation.",
        "Note that it names two processes and says which one is winning.",
      ],
      hint: "Two opposing processes are described; the season decides which is larger.",
    },
    {
      subskill: "interpret detail",
      family: "detail-interpretation",
      difficulty: "Medium",
      stem: "The description of the curve as the northern land surface \"inhaling and exhaling\" is meant to convey that the cycle:",
      key: "reflects a whole hemisphere rather than the site.",
      wrong: [
        ["closely resembles the rhythm of animal respiration.", "Respiration is one process in the account, not the point of the comparison."],
        ["was too small to be measured before Keeling's analyser.", "Instrument quality is discussed for the trend, not for the seasonal swing."],
        ["would be reversed at a station south of the equator.", "The passage says the global concentration falls, not that the sign flips."],
      ],
      why: "The sentences around it say \"the curve at Mauna Loa is not a local signal\" and that it is the northern land surface \"measured from the middle of the Pacific.\"",
      steps: [
        "Read the sentence immediately before the phrase.",
        "Take the contrast it draws between local and hemispheric.",
      ],
      hint: "The sentence before rules out one reading of the curve.",
    },
    {
      subskill: "meaning in context",
      family: "vocabulary-in-context",
      difficulty: "Easy",
      stem: "As it is used in the passage, the word *wiggle* refers to:",
      key: "the yearly rise and fall of the concentration.",
      wrong: [
        ["the scatter in measurements made before 1958.", "That scatter is attributed to instruments and sites, not to a repeating pattern."],
        ["the long-term upward trend across many decades.", "The trend is the other of Keeling's two results and does not repeat."],
        ["the drift of an analyser that needs recalibration.", "No instrument drift is described once the Mauna Loa record begins."],
      ],
      why: "The passage says \"the wiggle was evidence that the instrument was sampling the hemisphere,\" after describing a concentration that \"went up and down within each year, by several parts per million, on a schedule that repeated.\"",
      steps: [
        "Find where the word first appears and what it is said to prove.",
        "Match it to the result described earlier in the passage.",
      ],
      hint: "Two results were reported; only one of them repeats.",
    },
    {
      subskill: "claims and evidence",
      family: "claim-and-support",
      difficulty: "Hard",
      stem: "The passage presents the seasonal cycle as the answer to which objection?",
      key: "That one mountain could not represent the whole planet.",
      wrong: [
        ["That carbon dioxide levels were not in fact rising at all.", "The rise was established by the trend itself, not by the seasonal swing."],
        ["That the analyser Keeling built had never been calibrated.", "Calibration of the instrument is not among the objections described."],
        ["That agriculture had altered the land around the station.", "Farming enters much later, as one explanation for the growing amplitude."],
      ],
      why: "The passage says the common objection was \"that a single mountain could not speak for the planet,\" and that \"the seasonal cycle answered it,\" since local contamination would not swing in step with a distant growing season.",
      steps: [
        "Find the paragraph that names an objection explicitly.",
        "Read the sentence that says what answered it.",
        "Check that the reasoning given fits the objection you chose.",
      ],
      hint: "The objection is stated in one sentence and answered in the next.",
      trap: "Choosing the claim the record is best known for rather than the one the cycle addresses.",
    },
    {
      subskill: "reasoning",
      family: "evaluating-explanations",
      difficulty: "Hard",
      stem: "The passage explains that the three accounts of the growing amplitude have been hard to separate because they:",
      key: "have all been strengthening over the same period.",
      wrong: [
        ["depend on measurements that no station is able to make.", "The difficulty is attributed to the timing of the causes, not to missing instruments."],
        ["are each supported by a different research community.", "No disagreement among groups of researchers is described in the passage."],
        ["contradict one another about what plants actually do.", "The passage says all three are almost certainly contributing at once."],
      ],
      why: "The passage says all three are plausible and probably contributing, and that dividing the credit \"has resisted twenty years of work, because the three run together in time and no station separates them.\"",
      steps: [
        "Locate the sentence giving the reason the question is unresolved.",
        "Note that the obstacle is the correlation among the causes.",
        "Reject options that treat the explanations as rivals rather than as simultaneous.",
      ],
      hint: "The obstacle is stated in a clause beginning with *because*.",
      trap: "Assuming competing explanations must be mutually exclusive.",
    },
    {
      subskill: "author's purpose",
      family: "purpose-of-a-paragraph",
      difficulty: "Medium",
      stem: "The author's purpose in the final paragraph is to:",
      key: "explain why a routine measurement is worth continuing.",
      wrong: [
        ["blame particular agencies for withdrawing their support.", "No agency is named and no blame is assigned in the paragraph."],
        ["show that Keeling's later work was less important.", "The paragraph concerns the record's survival, not a decline in his work."],
        ["argue that the interesting science had indeed been done.", "That is the reasoning the paragraph calls mistaken."],
      ],
      why: "The paragraph reports that funding was nearly withdrawn on the view that the work was routine, and answers that \"the value of an unbroken record is not in any one year of it, and no year of it can be added later.\"",
      steps: [
        "Identify the reasoning the paragraph reports and the verdict it gives on it.",
        "Read the last sentence, which states the principle being defended.",
      ],
      hint: "The paragraph ends with the reason, not with the anecdote.",
    },
    {
      subskill: "logical inference",
      family: "supported-inference",
      difficulty: "Medium",
      stem: "The passage suggests that before 1958 a global figure for carbon dioxide was doubted because:",
      key: "existing measurements disagreed too widely to trust.",
      wrong: [
        ["no instrument could detect the gas at such low levels.", "Detection was possible; the problem the passage names is scatter between results."],
        ["the gas was known to be confined to industrial regions.", "The passage never claims the gas was believed to be regionally confined."],
        ["scientists had not yet agreed on a unit of measurement.", "No dispute about units or scales appears anywhere in the passage."],
      ],
      why: "The first paragraph says earlier attempts \"produced numbers that scattered wildly, and the general view was that the gas was too variable to have a meaningful global value at all.\"",
      steps: [
        "Find the sentence describing the state of the field before Keeling.",
        "Distinguish the scatter in the data from a claim about the air itself.",
      ],
      hint: "Keeling's suspicion tells you what the prevailing view had assumed.",
    },
  ],
};
