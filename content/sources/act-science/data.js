"use strict";

// Original, fixed passage sets. All measurements below are invented for practice.
module.exports = [
  {
    id: "act-science-p001",
    type: "data-representation",
    title: "Winter Soil Temperatures",
    intro: "The sites and measurements in this passage are invented for this practice set.",
    content: `A field team recorded soil temperatures at two nearby sites at the same time on a winter morning. Both sites had the same soil type and similar slopes. One site had bare soil; the other had a 15 cm layer of snow. Depth was measured downward from the soil surface, not from the top of the snow. The sensors had been left in place overnight.

The table and Figure 1 show the readings. In the figure, the horizontal axis is depth and the vertical axis is temperature. Solid and dashed segments connect adjacent readings; they do not represent additional measurements. For estimates between measured depths, assume temperature changes linearly along each segment.

| Depth below soil surface (cm) | Bare-site temperature (°C) | Snow-site temperature (°C) |
| --- | --- | --- |
| 0 | −8 | −1 |
| 5 | −6 | 0 |
| 10 | −4 | 1 |
| 20 | −1 | 2 |
| 40 | 2 | 3 |

At normal atmospheric pressure, pure water's freezing temperature is 0°C. A temperature equal to 0°C is neither above nor below that value. These measurements describe this morning only; the team did not measure temperatures during the preceding days.`,
    figure: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 365">
<g fill="none" stroke="currentColor" stroke-width="1">
<path d="M65 42 V290 H525"/>
<path d="M65 114 H525" stroke-dasharray="3 4"/>
<path d="M65 290 H59 M65 246 H59 M65 202 H59 M65 158 H59 M65 114 H59 M65 70 H59"/>
<path d="M65 290 V296 M122.5 290 V296 M180 290 V296 M295 290 V296 M525 290 V296"/>
<polyline points="65,290 122.5,246 180,202 295,136 525,70" stroke-width="2.5"/>
<polyline points="65,136 122.5,114 180,92 295,70 525,48" stroke-width="2.5" stroke-dasharray="8 5"/>
</g>
<g fill="currentColor">
<circle cx="65" cy="290" r="3.5"/><circle cx="122.5" cy="246" r="3.5"/><circle cx="180" cy="202" r="3.5"/><circle cx="295" cy="136" r="3.5"/><circle cx="525" cy="70" r="3.5"/>
<rect x="61.5" y="132.5" width="7" height="7"/><rect x="119" y="110.5" width="7" height="7"/><rect x="176.5" y="88.5" width="7" height="7"/><rect x="291.5" y="66.5" width="7" height="7"/><rect x="521.5" y="44.5" width="7" height="7"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="13">
<text x="290" y="20" text-anchor="middle">Figure 1. Temperature by soil depth</text>
<text x="50" y="294" text-anchor="end">−8</text><text x="50" y="250" text-anchor="end">−6</text><text x="50" y="206" text-anchor="end">−4</text><text x="50" y="162" text-anchor="end">−2</text><text x="50" y="118" text-anchor="end">0</text><text x="50" y="74" text-anchor="end">2</text>
<text x="18" y="175" transform="rotate(-90 18 175)" text-anchor="middle">Temperature (°C)</text>
<text x="65" y="313" text-anchor="middle">0</text><text x="122.5" y="313" text-anchor="middle">5</text><text x="180" y="313" text-anchor="middle">10</text><text x="295" y="313" text-anchor="middle">20</text><text x="525" y="313" text-anchor="middle">40</text>
<text x="300" y="335" text-anchor="middle">Depth below soil surface (cm)</text>
<text x="115" y="357">Solid, circles: bare site</text><text x="315" y="357">Dashed, squares: snow site</text>
</g></svg>`,
      alt: "Figure 1 is a line graph of soil temperature in degrees Celsius against depth below the soil surface in centimeters. At depths 0, 5, 10, 20, and 40 cm, the bare-site solid line with circles has values −8, −6, −4, −1, and 2°C; the snow-site dashed line with squares has values −1, 0, 1, 2, and 3°C. Straight segments connect adjacent points.",
      notToScale: false,
    },
    questions: [
      {
        domain: "Interpretation of Data", skill: "Read data displays", subskill: "graphs", difficulty: "Easy",
        stem: "In Figure 1, what temperature is represented by the solid-line point at a depth of 10 cm?",
        choices: ["−6°C", "−4°C", "−1°C", "1°C"], correctAnswer: 1,
        hint: "Each line represents a different site, and depth is measured from the soil surface.",
        explanation: "The solid line represents the bare site. Its point at 10 cm corresponds to −4°C.",
        solutionSteps: ["Identify the solid line as the bare-site series.", "At 10 cm on the depth axis, read the point's temperature as −4°C."],
        distractorRationales: [{ index: 0, reason: "−6°C is the bare-site reading at 5 cm, not 10 cm." }, { index: 2, reason: "−1°C is the bare-site reading at 20 cm; it also occurs at the snow site's surface." }, { index: 3, reason: "1°C is the snow-site reading at 10 cm, on the dashed line." }],
        strategy: "Identify the series before reading a coordinate; keep the horizontal and vertical units separate.",
        trap: "Reading the right depth on the other site's line.", principles: ["A plotted point pairs one horizontal-axis value with one vertical-axis value."], estimatedSeconds: 35, tags: ["earth-space-science", "graph-reading"],
      },
      {
        domain: "Interpretation of Data", skill: "Translate data", subskill: "graph to text", difficulty: "Medium",
        stem: "Which description matches the relationship between the two lines as measured depth increases from 0 to 40 cm?",
        choices: ["Both sites become warmer, while their temperature difference becomes larger.", "Both sites become colder, while their temperature difference becomes smaller.", "The bare site becomes warmer, while the snow site becomes colder.", "Both sites become warmer, while their temperature difference becomes smaller."], correctAnswer: 3,
        hint: "The direction of each line and the distance between the lines describe different features.",
        explanation: "Both lines rise with depth. The snow site is 7°C warmer at 0 cm but only 1°C warmer at 40 cm, with progressively smaller differences at the intervening depths.",
        solutionSteps: ["Read each series from left to right: both temperatures increase.", "Compare the vertical separations: 7, 6, 5, 3, and 1°C.", "The matching description combines warming at both sites with a narrowing difference."],
        distractorRationales: [{ index: 0, reason: "Both sites warm, but their difference falls from 7°C to 1°C rather than increasing." }, { index: 1, reason: "The difference narrows, but both lines rise toward higher temperatures rather than colder ones." }, { index: 2, reason: "The snow-site line also rises, from −1°C to 3°C." }],
        strategy: "Check each clause of a graph description against the plotted series, including the relationship between them.",
        trap: "Treating two increasing series as evidence that their difference must also increase.", principles: ["The trend in a difference can oppose the trend in both measured quantities."], estimatedSeconds: 55, tags: ["earth-space-science", "multiple-series"],
      },
      {
        domain: "Interpretation of Data", skill: "Analyze data", subskill: "interpolation", difficulty: "Medium",
        stem: "At approximately what depth does the bare-site line reach 0°C?",
        choices: ["27 cm", "23 cm", "33 cm", "40 cm"], correctAnswer: 0,
        hint: "The connected points specify estimates between depths; they are not extra sensor readings.",
        explanation: "Between 20 and 40 cm, the bare-site temperature rises from −1°C to 2°C. Reaching 0°C requires one third of that 3°C rise, so the depth is about 20 + 20/3 = 27 cm.",
        solutionSteps: ["Locate the segment whose temperatures lie on opposite sides of 0°C: 20 to 40 cm.", "The total temperature rise is 3°C, and 0°C is 1°C above its lower endpoint.", "Move one third of the 20 cm depth interval beyond 20 cm to obtain approximately 27 cm."],
        distractorRationales: [{ index: 1, reason: "23 cm adds the 3°C temperature change to a depth, mixing units and not locating the zero crossing." }, { index: 2, reason: "33 cm moves two thirds of the way across the interval; 0°C is only one third of the temperature rise from −1°C." }, { index: 3, reason: "40 cm is the endpoint where the bare-site temperature is already 2°C." }],
        strategy: "Use the fraction of the temperature interval to find the same fraction of the corresponding depth interval.",
        trap: "Using the distance from 0°C to the upper temperature as the fraction measured from the lower depth.", principles: ["Linear interpolation preserves fractional position between two measured points."], estimatedSeconds: 65, tags: ["earth-space-science", "interpolation"],
      },
      {
        domain: "Interpretation of Data", skill: "Analyze data", subskill: "comparison", difficulty: "Medium",
        stem: "What is the shallowest listed depth at which the snow-site temperature is above pure water's normal freezing temperature while the bare-site temperature is below it?",
        choices: ["0 cm", "5 cm", "10 cm", "20 cm"], correctAnswer: 2,
        hint: "A reading exactly at the freezing temperature does not satisfy either strict comparison.",
        explanation: "Pure water freezes at 0°C under the stated pressure. At 10 cm, the snow site is at 1°C and the bare site is at −4°C. At the shallower listed depths, the snow site is at −1°C or exactly 0°C.",
        solutionSteps: ["Use 0°C as the freezing reference, distinguishing above from equal to it.", "At 0 and 5 cm the snow site is not above that reference.", "At 10 cm the snow-site value is positive and the bare-site value negative; 20 cm also qualifies but is deeper."],
        distractorRationales: [{ index: 0, reason: "Both site temperatures are below 0°C at the surface." }, { index: 1, reason: "The snow-site value at 5 cm equals 0°C; it is not above the freezing temperature." }, { index: 3, reason: "20 cm satisfies the temperature conditions, but the shallower depth of 10 cm already does so." }],
        strategy: "Translate the scientific reference into a numerical threshold, then find the first row satisfying both conditions.",
        trap: "Counting a value on a threshold as above it, or overlooking the word shallowest.", principles: ["Pure water's normal freezing temperature is 0°C.", "A conjunction requires both conditions to hold for the same observation."], estimatedSeconds: 55, tags: ["earth-space-science", "background-knowledge", "phase-change"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence", skill: "Evaluate explanations", subskill: "model evaluation", difficulty: "Medium",
        stem: "A proposed model states that the snow-site temperature equals the bare-site temperature plus one constant value at every measured depth. Which pair of observations is sufficient to show that this model does not fit the readings?",
        choices: ["The bare site is −8°C at 0 cm and −6°C at 5 cm.", "The site differences are 7°C at 0 cm and 1°C at 40 cm.", "The snow site is warmer than the bare site at both 5 and 10 cm.", "The bare site is below 0°C at both 10 and 20 cm."], correctAnswer: 1,
        hint: "The model concerns the relationship between sites, rather than either site's temperature alone.",
        explanation: "Adding one constant would produce the same temperature difference at every depth. The measured differences of 7°C and 1°C are unequal, so no single constant fits both observations.",
        solutionSteps: ["Identify the model's requirement: snow-site minus bare-site temperature must be constant.", "At 0 cm that difference is −1 − (−8) = 7°C; at 40 cm it is 3 − 2 = 1°C.", "These unequal differences contradict the requirement."],
        distractorRationales: [{ index: 0, reason: "A site's temperature can change with depth while its difference from another site stays constant." }, { index: 2, reason: "Being warmer at both depths is consistent with a positive constant difference and does not by itself contradict the model." }, { index: 3, reason: "The signs of two bare-site readings do not establish whether the between-site difference is constant." }],
        strategy: "Turn the model into a quantity that must remain unchanged, then compare that quantity at two conditions.",
        trap: "Rejecting a constant difference because the individual measurements change.", principles: ["A constant-offset model requires equal differences across observations."], estimatedSeconds: 60, tags: ["earth-space-science", "model-evaluation"],
      },
    ],
  },
  {
    id: "act-science-p002",
    type: "data-representation",
    title: "Solubility of Two Solids",
    intro: "Solids R and S and all measurements are invented for this practice set.",
    content: `A laboratory measured the solubility of two solids, R and S, in water. Solubility here means the greatest mass of a solid that can remain dissolved at equilibrium in 100 g of water at a specified temperature. A solution containing that mass is saturated. The solids were tested separately; no container held both R and S.

Each measurement used 100 g of water. Containers were covered to prevent evaporation, and the water mass remained constant. The table gives the mass dissolved after equilibrium was reached. Any undissolved solid was excluded from that mass.

| Temperature (°C) | Solubility of R (g per 100 g water) | Solubility of S (g per 100 g water) |
| --- | --- | --- |
| 20 | 18 | 42 |
| 30 | 26 | 43 |
| 40 | 36 | 44 |
| 50 | 48 | 45 |
| 60 | 62 | 46 |

In a cooling test, each saturated solution was first separated from any undissolved solid at its starting temperature. The solution was then cooled without losing water and allowed to reach equilibrium again. Dissolved solid in excess of the solubility at the final temperature formed crystals. Neither solid reacted chemically with the water. The mass of a solution includes both its water and its dissolved solid.`,
    questions: [
      {
        domain: "Interpretation of Data", skill: "Read data displays", subskill: "tables", difficulty: "Medium",
        stem: "Excluding any undissolved solid, what is the total mass of a saturated R solution prepared with 100 g of water at 40°C?",
        choices: ["36 g", "100 g", "136 g", "144 g"], correctAnswer: 2,
        hint: "A solution contains a solvent as well as the material dissolved in it.",
        explanation: "At 40°C, 36 g of R can dissolve in 100 g of water. Conservation of mass gives a solution mass of 100 + 36 = 136 g.",
        solutionSteps: ["Read R's solubility at 40°C as 36 g per 100 g of water.", "Add the dissolved solid's mass to the water's mass: 36 + 100 = 136 g."],
        distractorRationales: [{ index: 0, reason: "36 g counts the dissolved R but leaves out the 100 g of water." }, { index: 1, reason: "100 g counts only the water and omits the dissolved solid." }, { index: 3, reason: "144 g adds the 44 g solubility of S at 40°C, using the wrong solid." }],
        strategy: "Identify whether a table reports a component or a total before calculating the requested mass.",
        trap: "Treating grams per 100 g of water as grams per 100 g of solution.", principles: ["The mass of a solution equals the combined masses of its solvent and dissolved solute."], estimatedSeconds: 45, tags: ["chemistry", "background-knowledge", "conservation-of-mass"],
      },
      {
        domain: "Interpretation of Data", skill: "Analyze data", subskill: "trends", difficulty: "Medium",
        stem: "Across successive 10°C temperature increases in the table, how do the increases in the two solubilities change?",
        choices: ["R's increases become larger; S's increases stay the same.", "R's increases stay the same; S's increases become larger.", "R's increases become smaller; S's increases stay the same.", "R's increases stay the same; S's increases become smaller."], correctAnswer: 0,
        hint: "A solubility and the amount by which that solubility changes are different quantities.",
        explanation: "R increases by 8, 10, 12, and 14 g per 100 g water across the four intervals. S increases by 1 g per 100 g water in each interval.",
        solutionSteps: ["Compare adjacent R entries to obtain changes of 8, 10, 12, and 14.", "Compare adjacent S entries to obtain changes of 1, 1, 1, and 1.", "R's increments grow, whereas S's increments are constant."],
        distractorRationales: [{ index: 1, reason: "This reverses the patterns: R has changing increments, and S has constant increments." }, { index: 2, reason: "R's increments rise from 8 to 14 rather than becoming smaller." }, { index: 3, reason: "R's increments are not constant, and S's increments do not decrease." }],
        strategy: "For a question about how changes behave, compare adjacent differences over equal intervals.",
        trap: "Seeing that both solubilities increase and assuming that both increase at a constant rate.", principles: ["Equal input intervals allow direct comparison of successive output changes."], estimatedSeconds: 55, tags: ["chemistry", "changing-rate"],
      },
      {
        domain: "Interpretation of Data", skill: "Translate data", subskill: "table to graph", difficulty: "Easy",
        stem: "A graph places temperature (°C) on the horizontal axis and solubility (g per 100 g water) on the vertical axis. Which point belongs to the plotted S data?",
        choices: ["(45, 50)", "(40, 36)", "(60, 45)", "(50, 45)"], correctAnswer: 3,
        hint: "The two coordinates have different quantities and units.",
        explanation: "S has a solubility of 45 g per 100 g water at 50°C. With temperature first, that measurement is the point (50, 45).",
        solutionSteps: ["Use the temperature as the first coordinate and S's solubility as the second.", "The 50°C row gives S = 45, producing (50, 45)."],
        distractorRationales: [{ index: 0, reason: "This reverses the coordinates of S's 50°C measurement." }, { index: 1, reason: "The point (40, 36) represents R, not S." }, { index: 2, reason: "S's value at 60°C is 46; 45 belongs to the 50°C row." }],
        strategy: "Assign each axis to its column, then carry both values from a single row into the ordered pair.",
        trap: "Reversing axes or combining entries from different rows.", principles: ["An ordered pair lists the horizontal coordinate before the vertical coordinate."], estimatedSeconds: 40, tags: ["chemistry", "representations"],
      },
      {
        domain: "Interpretation of Data", skill: "Analyze data", subskill: "comparison", difficulty: "Medium",
        stem: "Separate saturated solutions of R and S, each made with 100 g of water, are cooled from 60°C to 30°C as described. How much greater is the mass of R crystals formed than the mass of S crystals formed?",
        choices: ["20 g", "33 g", "36 g", "39 g"], correctAnswer: 1,
        hint: "The crystals are material that was dissolved before cooling but no longer remains dissolved afterward.",
        explanation: "R forms 62 − 26 = 36 g of crystals, while S forms 46 − 43 = 3 g. The difference in crystal masses is 36 − 3 = 33 g.",
        solutionSteps: ["Find R's decrease in dissolved mass: 62 − 26 = 36 g.", "Find S's decrease in dissolved mass: 46 − 43 = 3 g.", "Subtract the two crystal masses: 36 − 3 = 33 g."],
        distractorRationales: [{ index: 0, reason: "20 g is the difference in crystal masses for cooling from 50°C to 30°C, using the wrong starting row." }, { index: 2, reason: "36 g is R's crystal mass alone, before subtracting S's crystal mass." }, { index: 3, reason: "39 g adds the two crystal masses instead of finding how much greater one is than the other." }],
        strategy: "Compute the change for each solid separately before comparing the changes.",
        trap: "Comparing final solubilities instead of the masses that leave solution.", principles: ["With no water loss, crystallized mass equals initial dissolved mass minus final dissolved mass."], estimatedSeconds: 70, tags: ["chemistry", "difference-of-changes"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence", skill: "Evaluate explanations", subskill: "claims and evidence", difficulty: "Medium",
        stem: "A student claims that cooling either saturated solution from 60°C to 20°C removes at least half of its initially dissolved solid as crystals. Which assessment is supported by the table?",
        choices: ["Supported, because both solids have lower solubility at 20°C than at 60°C.", "Supported, because R loses 44 g of the 62 g initially dissolved at 60°C.", "Not supported, because R retains 18 g of the 62 g initially dissolved at 60°C.", "Not supported, because S retains 42 g of the 46 g initially dissolved at 60°C."], correctAnswer: 3,
        hint: "The claim applies to each solid and specifies a fraction of the initial dissolved amount.",
        explanation: "S loses only 46 − 42 = 4 g, which is less than half of 46 g. R does lose more than half, but the claim concerns both solids, so S is a counterexample.",
        solutionSteps: ["For R, compare the 44 g crystallized with half of its initial 62 g: 31 g.", "For S, compare the 4 g crystallized with half of its initial 46 g: 23 g.", "Only R meets the stated threshold; the claim for either solution is therefore not supported."],
        distractorRationales: [{ index: 0, reason: "A decrease in solubility establishes some crystallization, not that at least half crystallizes." }, { index: 1, reason: "R meets the threshold, but evidence about R alone does not establish the claim about S." }, { index: 2, reason: "Retaining 18 g means R loses 44 g, more than half its initial mass; R does not contradict the claim." }],
        strategy: "Test a quantitative claim separately for every case it includes, using the stated initial amount as the fraction's base.",
        trap: "Using one successful example to support a claim covering two different materials.", principles: ["One counterexample defeats a claim that applies to every included case.", "The fraction removed uses the initial amount as its denominator."], estimatedSeconds: 70, tags: ["chemistry", "claims-and-evidence"],
      },
    ],
  },
  {
    id: "act-science-p003",
    type: "data-representation",
    title: "Forces on Two Carts",
    intro: "The carts and all numerical measurements are invented for this practice set.",
    content: `Two carts moved to the right on a horizontal track. A device applied a constant rightward force F to each cart during a trial. A brake exerted a constant leftward opposing force while each cart moved. Figure 1 shows only the horizontal forces; the vertical forces balanced. Cart A had a mass of 1.0 kg and an opposing force of 0.2 N. Cart B had a mass of 2.0 kg and an opposing force of 0.4 N.

| Cart | Mass (kg) | Rightward force | Leftward force (N) |
| --- | --- | --- | --- |
| A | 1.0 | F | 0.2 |
| B | 2.0 | F | 0.4 |

The following table gives the measured rightward accelerations. For estimates between tested forces, treat the acceleration values as connected by straight segments.

| Applied force F (N) | Cart A acceleration (m/s²) | Cart B acceleration (m/s²) |
| --- | --- | --- |
| 0.6 | 0.4 | 0.1 |
| 1.0 | 0.8 | 0.3 |
| 1.4 | 1.2 | 0.5 |
| 1.8 | 1.6 | 0.7 |
| 2.2 | 2.0 | 0.9 |

Newton's second law relates acceleration to net force: acceleration = net force / mass. For these horizontal forces, rightward net force equals the applied rightward force minus the leftward opposing force. Force is measured in newtons (N); 1 N equals 1 kg·m/s².`,
    figure: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 290">
<g fill="none" stroke="currentColor" stroke-width="2">
<rect x="222" y="57" width="136" height="60" rx="5"/><circle cx="247" cy="124" r="7"/><circle cx="334" cy="124" r="7"/>
<path d="M222 85 H120 M120 85 L131 78 M120 85 L131 92 M358 85 H490 M490 85 L479 78 M490 85 L479 92 M85 134 H510"/>
<rect x="222" y="184" width="136" height="60" rx="5"/><circle cx="247" cy="251" r="7"/><circle cx="334" cy="251" r="7"/>
<path d="M222 212 H120 M120 212 L131 205 M120 212 L131 219 M358 212 H490 M490 212 L479 205 M490 212 L479 219 M85 261 H510"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="14" text-anchor="middle">
<text x="290" y="22">Figure 1. Horizontal forces (arrows not to scale)</text>
<text x="290" y="83">Cart A</text><text x="290" y="103">1.0 kg</text><text x="157" y="68">0.2 N</text><text x="425" y="68">F</text>
<text x="290" y="210">Cart B</text><text x="290" y="230">2.0 kg</text><text x="157" y="195">0.4 N</text><text x="425" y="195">F</text>
<text x="290" y="282">Both carts move to the right.</text>
</g></svg>`,
      alt: "Figure 1 shows two carts on a horizontal track, both moving right. Cart A has mass 1.0 kg, a rightward arrow labeled F, and a leftward arrow labeled 0.2 N. Cart B has mass 2.0 kg, a rightward arrow labeled F, and a leftward arrow labeled 0.4 N. Arrow lengths do not represent force magnitudes. Only horizontal forces are shown.",
      notToScale: true,
    },
    questions: [
      {
        domain: "Interpretation of Data", skill: "Read data displays", subskill: "diagrams", difficulty: "Easy",
        stem: "For a trial with F = 1.4 N, which pair gives the two horizontal forces shown on Cart B in Figure 1?",
        choices: ["1.4 N rightward and 0.4 N leftward", "1.4 N rightward and 0.2 N leftward", "0.4 N rightward and 1.4 N leftward", "1.0 N rightward and 0.4 N leftward"], correctAnswer: 0,
        hint: "An arrow's label and direction provide different parts of its meaning.",
        explanation: "Cart B's rightward arrow is labeled F, which is 1.4 N in this trial. Its leftward arrow is labeled 0.4 N.",
        solutionSteps: ["Select Cart B's force diagram and substitute 1.4 N for F.", "Read the opposing arrow as a 0.4 N force pointing left."],
        distractorRationales: [{ index: 1, reason: "0.2 N is Cart A's opposing force; Cart B's is 0.4 N." }, { index: 2, reason: "This reverses the directions of the applied and opposing forces." }, { index: 3, reason: "1.0 N is Cart B's net force in this trial, not the applied force represented by the rightward arrow." }],
        strategy: "Match the labeled object, then read each force's label and arrow direction separately.",
        trap: "Replacing an individual force with the net force, or using the other cart's label.", principles: ["A force arrow indicates direction, while its numerical label gives magnitude.", "Not-to-scale arrow lengths do not establish force ratios."], estimatedSeconds: 40, tags: ["physics", "force-diagram"],
      },
      {
        domain: "Interpretation of Data", skill: "Read data displays", subskill: "tables", difficulty: "Easy",
        stem: "At an applied force of 1.8 N, how much greater is Cart A's acceleration than Cart B's?",
        choices: ["0.4 m/s²", "0.7 m/s²", "0.9 m/s²", "2.3 m/s²"], correctAnswer: 2,
        hint: "The comparison concerns accelerations recorded under the same applied force.",
        explanation: "At 1.8 N, the table gives accelerations of 1.6 m/s² for A and 0.7 m/s² for B. Their difference is 0.9 m/s².",
        solutionSteps: ["Read both acceleration values from the 1.8 N row: 1.6 and 0.7 m/s².", "Subtract B's acceleration from A's: 1.6 − 0.7 = 0.9 m/s²."],
        distractorRationales: [{ index: 0, reason: "0.4 m/s² is the increase in Cart A's acceleration between neighboring force rows, not the between-cart difference in this row." }, { index: 1, reason: "0.7 m/s² is Cart B's acceleration alone." }, { index: 3, reason: "2.3 m/s² is the sum of the two accelerations, not their difference." }],
        strategy: "Keep the experimental condition fixed when comparing columns of a table.",
        trap: "Comparing neighboring rows or reporting one cart's acceleration instead of the requested difference.", principles: ["A difference between two measurements must compare like quantities under the specified conditions."], estimatedSeconds: 40, tags: ["physics", "table-comparison"],
      },
      {
        domain: "Interpretation of Data", skill: "Translate data", subskill: "table to graph", difficulty: "Medium",
        stem: "A student graphs Cart A's acceleration vertically against applied force horizontally, using equally spaced numerical scales. Which description fits the points from the table?",
        choices: ["A straight line rising 0.2 m/s² for each 0.4 N increase in force.", "A straight line rising 0.4 m/s² for each 0.4 N increase in force.", "A curve rising by successively larger amounts for each 0.4 N increase in force.", "A curve rising by successively smaller amounts for each 0.4 N increase in force."], correctAnswer: 1,
        hint: "Equal spacing on an axis represents equal changes in the labeled quantity.",
        explanation: "Each 0.4 N increase in applied force accompanies a 0.4 m/s² increase in Cart A's acceleration. Equal rises for equal horizontal changes produce a straight line.",
        solutionSteps: ["Compare consecutive force entries: each step is 0.4 N.", "Compare Cart A's consecutive accelerations: each step is 0.4 m/s².", "Plotting a constant vertical change for a constant horizontal change gives a straight line with the stated rise."],
        distractorRationales: [{ index: 0, reason: "A rise of 0.2 m/s² per force step describes Cart B, not Cart A." }, { index: 2, reason: "Cart A's acceleration increments are constant; they do not get larger." }, { index: 3, reason: "Cart A's acceleration increments are constant; they do not get smaller." }],
        strategy: "Compare changes across equally spaced input values to determine whether the plotted slope stays constant.",
        trap: "Assuming that any increasing measurements form a curve, or taking the increments from the other series.", principles: ["Constant output changes over equal input changes produce a straight-line graph."], estimatedSeconds: 55, tags: ["physics", "representations"],
      },
      {
        domain: "Interpretation of Data", skill: "Analyze data", subskill: "interpolation", difficulty: "Medium",
        stem: "Approximately what applied force would give Cart B an acceleration of 0.6 m/s² under the tested conditions?",
        choices: ["1.0 N", "1.4 N", "1.8 N", "1.6 N"], correctAnswer: 3,
        hint: "The requested acceleration falls within the range measured for Cart B.",
        explanation: "Cart B accelerates at 0.5 m/s² under 1.4 N and 0.7 m/s² under 1.8 N. The requested acceleration is halfway between those values, so the corresponding force is halfway between 1.4 and 1.8 N: 1.6 N.",
        solutionSteps: ["Find the Cart B readings on either side of 0.6 m/s²: 0.5 and 0.7 m/s².", "Use the stated straight-segment estimate; 0.6 is halfway between these accelerations.", "The midpoint of their force values is 1.6 N."],
        distractorRationales: [{ index: 0, reason: "1.0 N gives Cart B 0.3 m/s². It also results from adding the opposing force to 0.6 while ignoring B's 2.0 kg mass." }, { index: 1, reason: "1.4 N is the lower neighboring force and gives 0.5 m/s², not 0.6 m/s²." }, { index: 2, reason: "1.8 N is the upper neighboring force and gives 0.7 m/s², not 0.6 m/s²." }],
        strategy: "Bracket the requested output within one series and use its fractional position to estimate the input.",
        trap: "Choosing the nearest listed force instead of estimating between the bracketing measurements.", principles: ["On a straight segment, the midpoint in one coordinate corresponds to the midpoint in the other."], estimatedSeconds: 55, tags: ["physics", "interpolation"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence", skill: "Evaluate explanations", subskill: "model evaluation", difficulty: "Medium",
        stem: "A student predicts that reducing Cart B's opposing force to 0.2 N, without changing its mass, will make its acceleration equal to Cart A's at F = 1.4 N. Does Newton's second law support the prediction, and what acceleration does it give for the modified Cart B?",
        choices: ["No; 0.6 m/s².", "No; 0.7 m/s².", "Yes; 1.2 m/s².", "Yes; 1.4 m/s²."], correctAnswer: 0,
        hint: "The modified brake changes only one property of Cart B.",
        explanation: "The modified Cart B has a net force of 1.4 − 0.2 = 1.2 N. Dividing by its unchanged mass of 2.0 kg gives 0.6 m/s², less than Cart A's 1.2 m/s². Equal opposing forces do not remove the mass difference.",
        solutionSteps: ["For modified Cart B, subtract the new opposing force: 1.4 − 0.2 = 1.2 N.", "Apply acceleration = net force / mass: 1.2 / 2.0 = 0.6 m/s².", "Compare this with Cart A's table value of 1.2 m/s² at the same applied force; the accelerations are unequal."],
        distractorRationales: [{ index: 1, reason: "0.7 m/s² divides the applied force by mass without subtracting the remaining 0.2 N opposing force." }, { index: 2, reason: "1.2 m/s² treats Cart B as if it had Cart A's 1.0 kg mass, or mistakes its net force for its acceleration." }, { index: 3, reason: "1.4 m/s² uses the applied force's numerical value as the acceleration, ignoring both opposition and mass; it also differs from A's 1.2 m/s²." }],
        strategy: "Apply the physical model to the modified condition before comparing its prediction with the reference cart.",
        trap: "Assuming equal forces imply equal accelerations even when masses differ.", principles: ["Newton's second law gives acceleration as net force divided by mass.", "Oppositely directed forces subtract when finding net force."], estimatedSeconds: 75, tags: ["physics", "background-knowledge", "newtons-second-law"],
      },
    ],
  },
  {
    id: "act-science-p004",
    type: "data-representation",
    title: "Seed Germination in Salty Water",
    intro: "The seed study and all measurements are invented for this practice set.",
    content: `A team placed 40 seeds from one seed lot in each of four covered dishes. Each dish received the same volume of water containing a different salt concentration. Temperature, light, and the type of paper supporting the seeds were the same in every dish. The solutions were replenished at their assigned concentrations to keep the paper wet.

A seed was counted as germinated once a root became visible. The table shows cumulative counts: a seed that germinated on day 2 remained included in the counts on days 4 and 6. Each seed was counted only once within a day's total. The study ended after day 6.

| Salt concentration (g/L) | Seeds germinated by day 2 | Seeds germinated by day 4 | Seeds germinated by day 6 |
| --- | --- | --- | --- |
| 0 | 8 | 24 | 36 |
| 2 | 2 | 20 | 34 |
| 4 | 2 | 10 | 24 |
| 6 | 0 | 2 | 10 |

Figure 1 plots the counts for the 0, 4, and 6 g/L dishes. The 2 g/L dish is included only in the table. Connecting lines help identify the series and do not show the exact germination time of individual seeds.

Seeds must take up water before germination. For the initial water movement considered here, treat seed membranes as permeable to water but not to the dissolved salt. Across such a membrane, net water movement tends toward the side with the higher concentration of dissolved particles. Assume that adding salt raised the dissolved-particle concentration outside each seed without changing the initial concentration inside it.`,
    figure: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 365">
<g fill="none" stroke="currentColor" stroke-width="1">
<path d="M75 45 V285 H525"/>
<path d="M75 45 H525 M75 105 H525 M75 165 H525 M75 225 H525" stroke-dasharray="2 5"/>
<path d="M145 285 V291 M320 285 V291 M495 285 V291"/>
<polyline points="145,237 320,141 495,69" stroke-width="2.5"/>
<polyline points="145,273 320,225 495,141" stroke-width="2.5" stroke-dasharray="9 5"/>
<polyline points="145,285 320,273 495,225" stroke-width="2.5" stroke-dasharray="2 5"/>
</g>
<g fill="currentColor">
<circle cx="145" cy="237" r="3.5"/><circle cx="320" cy="141" r="3.5"/><circle cx="495" cy="69" r="3.5"/>
<rect x="141.5" y="269.5" width="7" height="7"/><rect x="316.5" y="221.5" width="7" height="7"/><rect x="491.5" y="137.5" width="7" height="7"/>
<polygon points="145,281 141,289 149,289"/><polygon points="320,269 316,277 324,277"/><polygon points="495,221 491,229 499,229"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="13">
<text x="290" y="20" text-anchor="middle">Figure 1. Cumulative germination</text>
<text x="60" y="289" text-anchor="end">0</text><text x="60" y="229" text-anchor="end">10</text><text x="60" y="169" text-anchor="end">20</text><text x="60" y="109" text-anchor="end">30</text><text x="60" y="49" text-anchor="end">40</text>
<text x="20" y="165" transform="rotate(-90 20 165)" text-anchor="middle">Seeds germinated (count)</text>
<text x="145" y="310" text-anchor="middle">2</text><text x="320" y="310" text-anchor="middle">4</text><text x="495" y="310" text-anchor="middle">6</text>
<text x="305" y="331" text-anchor="middle">Time (days)</text>
<text x="65" y="356">Solid, circles: 0 g/L</text><text x="242" y="356">Dashed, squares: 4 g/L</text><text x="432" y="356">Dotted: 6 g/L</text>
</g></svg>`,
      alt: "Figure 1 plots cumulative numbers of germinated seeds against time in days. At days 2, 4, and 6, the 0 g/L salt dish has counts 8, 24, and 36, shown by a solid line with circles; the 4 g/L dish has counts 2, 10, and 24, shown by a dashed line with squares; and the 6 g/L dish has counts 0, 2, and 10, shown by a dotted line with triangles. Each dish began with 40 seeds. The vertical axis spans 0 to 40 seeds.",
      notToScale: false,
    },
    questions: [
      {
        domain: "Interpretation of Data", skill: "Read data displays", subskill: "tables", difficulty: "Easy",
        stem: "How many seeds in the 2 g/L dish had germinated by day 4?",
        choices: ["2", "20", "24", "34"], correctAnswer: 1,
        hint: "The graph omits one of the dishes that appears in the table.",
        explanation: "The table's 2 g/L row gives 20 seeds in the day 4 column.",
        solutionSteps: ["Locate the 2 g/L salt-concentration row.", "Read across to the cumulative count for day 4: 20 seeds."],
        distractorRationales: [{ index: 0, reason: "2 is the 2 g/L dish's count on day 2, not day 4." }, { index: 2, reason: "24 is the day 4 count for the 0 g/L dish, not the 2 g/L dish." }, { index: 3, reason: "34 is the 2 g/L dish's count on day 6, not day 4." }],
        strategy: "Use both the treatment label and the time label to identify a table entry.",
        trap: "Using the right day with the wrong treatment or the right treatment with the wrong day.", principles: ["A two-way table entry is specified by both its row and its column."], estimatedSeconds: 35, tags: ["biology", "table-reading"],
      },
      {
        domain: "Interpretation of Data", skill: "Analyze data", subskill: "trends", difficulty: "Medium",
        stem: "Which dish had the largest number of seeds newly germinate after the day 2 count and by the day 4 count?",
        choices: ["The 0 g/L dish", "The 4 g/L dish", "The 6 g/L dish", "The 2 g/L dish"], correctAnswer: 3,
        hint: "The table reports cumulative totals, so later counts still include seeds counted earlier.",
        explanation: "The increases from day 2 to day 4 are 16, 18, 8, and 2 seeds for the 0, 2, 4, and 6 g/L dishes, respectively. The 2 g/L dish has the largest increase even though the 0 g/L dish has the largest total on day 4.",
        solutionSteps: ["Subtract each dish's day 2 count from its day 4 count.", "Obtain increases of 24 − 8 = 16, 20 − 2 = 18, 10 − 2 = 8, and 2 − 0 = 2.", "Compare those increases; 18 is the greatest, for the 2 g/L dish."],
        distractorRationales: [{ index: 0, reason: "The 0 g/L dish has the largest total on day 4, but its increase of 16 is smaller than the 2 g/L dish's increase of 18." }, { index: 1, reason: "The 4 g/L dish adds 8 seeds; a large proportional increase from its small day 2 count is not the largest number of new seeds." }, { index: 2, reason: "The 6 g/L dish rises from zero to 2, but that is the smallest numerical increase." }],
        strategy: "Convert cumulative counts to interval counts before comparing growth during a specified interval.",
        trap: "Comparing proportional growth or a final total when the question asks for the number newly added.", principles: ["An interval increase equals the later cumulative total minus the earlier cumulative total."], estimatedSeconds: 60, tags: ["biology", "cumulative-data"],
      },
      {
        domain: "Interpretation of Data", skill: "Translate data", subskill: "graph to text", difficulty: "Medium",
        stem: "From day 2 to day 4 and then from day 4 to day 6, how does the vertical separation between the 0 g/L and 4 g/L lines in Figure 1 change?",
        choices: ["It first increases, then decreases.", "It first decreases, then increases.", "It increases during both intervals.", "It decreases during both intervals."], correctAnswer: 0,
        hint: "The separation is the difference between counts on the same day, not the slope of either line alone.",
        explanation: "The 0 g/L minus 4 g/L differences are 6 seeds on day 2, 14 on day 4, and 12 on day 6. The gap therefore widens first and then narrows.",
        solutionSteps: ["Read the two series at each shared time.", "Find differences of 8 − 2 = 6, 24 − 10 = 14, and 36 − 24 = 12 seeds.", "Compare the sequence of differences: 6 to 14 is an increase, and 14 to 12 is a decrease."],
        distractorRationales: [{ index: 1, reason: "This reverses the order of the gap's changes." }, { index: 2, reason: "Both counts keep increasing, but the gap shrinks from 14 to 12 seeds during the second interval." }, { index: 3, reason: "The gap grows from 6 to 14 seeds during the first interval." }],
        strategy: "For a relationship between two lines, compare their same-time differences rather than following either line by itself.",
        trap: "Assuming that increasing cumulative counts require an increasing difference between treatments.", principles: ["The separation between two plotted series depends on both series' changes."], estimatedSeconds: 60, tags: ["biology", "multiple-series"],
      },
      {
        domain: "Interpretation of Data", skill: "Analyze data", subskill: "comparison", difficulty: "Medium",
        stem: "Under the membrane assumption in the passage, which treatment would most strongly oppose initial water entry into seeds, and what was its germination count by day 6?",
        choices: ["0 g/L; 36 seeds", "2 g/L; 34 seeds", "6 g/L; 10 seeds", "4 g/L; 24 seeds"], correctAnswer: 2,
        hint: "The water-movement description concerns dissolved particles on the two sides of a membrane.",
        explanation: "A higher dissolved-particle concentration outside a seed reduces the tendency for water to enter it. The 6 g/L treatment has the highest outside concentration, and its day 6 count is 10 seeds.",
        solutionSteps: ["Use the membrane principle: raising the outside dissolved-particle concentration opposes inward water movement.", "Select 6 g/L as the highest tested salt concentration.", "Read that treatment's day 6 count as 10 seeds."],
        distractorRationales: [{ index: 0, reason: "The 0 g/L treatment has the lowest added-salt concentration, so it least opposes water entry under the given assumptions." }, { index: 1, reason: "The 2 g/L treatment has the stated count, but its concentration is lower than those of two other treatments." }, { index: 3, reason: "The 4 g/L treatment has the stated count, but the 6 g/L treatment has a still higher outside dissolved-particle concentration." }],
        strategy: "Apply the biological principle to identify a treatment, then use that same treatment's observations.",
        trap: "Reversing the direction of osmosis or selecting the largest germination count as the strongest opposition to water entry.", principles: ["Osmosis is net water movement across a suitable membrane toward higher dissolved-particle concentration.", "Under equal initial internal conditions, greater external salt concentration more strongly opposes water entry."], estimatedSeconds: 60, tags: ["biology", "background-knowledge", "osmosis"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence", skill: "Draw conclusions", subskill: "generalization", difficulty: "Medium",
        stem: "Which conclusion about the seeds that had not germinated by day 6 is best supported by the study?",
        choices: ["Lower counts at day 6 show that salt killed every seed still ungerminated.", "Smaller early increases at high salt show that waiting would erase all treatment differences.", "Counts through day 6 leave unresolved whether the remaining seeds could germinate later.", "Similar early counts establish that all treatments would eventually yield equal germination totals."], correctAnswer: 2,
        hint: "The observation period ended on a specified day.",
        explanation: "The study records germination only through day 6. An ungerminated seed might be delayed or unable to germinate; the counts do not distinguish these possibilities or establish later treatment totals.",
        solutionSteps: ["Identify the study's endpoint and measured outcome: visible-root germination through day 6.", "Recognize that no later germination or seed-viability measurements are given.", "Limit the conclusion to the uncertainty about whether the remaining seeds could germinate later."],
        distractorRationales: [{ index: 0, reason: "Failure to germinate by one deadline does not establish death; the study did not measure viability." }, { index: 1, reason: "The data do not extend beyond day 6 and cannot establish that later waiting eliminates treatment differences." }, { index: 3, reason: "Early counts do not establish a common eventual total, and the measured totals still differ at day 6." }],
        strategy: "Separate the measured outcome and observation period from claims about an unmeasured mechanism or later time.",
        trap: "Treating not yet observed as impossible, or extending an early trend to an unmeasured endpoint.", principles: ["An observation deadline limits conclusions about delayed outcomes.", "Lack of observed germination is not by itself a measurement of seed death."], estimatedSeconds: 55, tags: ["biology", "evidence-limits"],
      },
    ],
  },
];
