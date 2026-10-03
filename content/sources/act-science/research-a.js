"use strict";

// Original authored passage sets. The section assembler supplies common metadata.
module.exports = [
  {
    id: "act-science-p005",
    type: "research-summaries",
    title: "Salt, light, and seed germination",
    content: `Students investigated germination of one variety of radish. They counted a seed as germinated when a root at least 2 mm long emerged. All dishes contained the same paper, solution volume, and number of seeds and were maintained at 24°C. Seeds were randomly assigned to dishes.

Experiment 1
The students combined three salt concentrations with two light treatments: 12 hours of light each day or continuous darkness. Each combination had five dishes of 20 seeds. After four days, they counted germinated seeds. The table gives totals across the five dishes, out of 100 seeds per combination.

| Salt concentration (mmol/L) | Germinated with daily light | Germinated in darkness |
| --- | --- | --- |
| 0 | 92 | 88 |
| 40 | 76 | 64 |
| 80 | 44 | 28 |

Experiment 2
Using a new batch, the students kept seeds in 80 mmol/L salt solution in darkness for four days. They then randomly assigned 144 ungerminated seeds to two treatments, each with six dishes of 12 seeds. Seeds were rinsed and placed on fresh paper with either salt-free water or fresh 80 mmol/L salt solution. Both treatments remained in darkness at 24°C. The table gives additional germination during the next four days.

| Solution after transfer | Newly germinated seeds out of 72 |
| --- | --- |
| Salt-free water | 58 |
| 80 mmol/L salt solution | 14 |

Seeds must absorb water before germination. A higher concentration of dissolved substances outside a seed can reduce its water uptake. Failure to germinate within four days does not, by itself, establish that a seed is dead.`,
    questions: [
      {
        domain: "Interpretation of Data",
        skill: "Read data displays",
        subskill: "tables",
        difficulty: "Easy",
        stem: "How many seeds germinated in Experiment 1 at 40 mmol/L salt under continuous darkness?",
        choices: ["64", "76", "28", "88"],
        correctAnswer: 0,
        hint: "Use both the salt-concentration row and the darkness column.",
        explanation: "The 40 mmol/L row and the darkness column intersect at 64 germinated seeds.",
        solutionSteps: ["Locate the 40 mmol/L treatment in Experiment 1.", "Read its darkness entry: 64 seeds."],
        distractorRationales: [
          { index: 1, reason: "76 is the count at 40 mmol/L with daily light." },
          { index: 2, reason: "28 is the darkness count at 80 mmol/L." },
          { index: 3, reason: "88 is the darkness count with no salt." }
        ],
        strategy: "Trace the row and column separately before reading their intersection.",
        trap: "Reading the correct salt row but the wrong light treatment.",
        principles: ["A table value is specified by both its row and its column."],
        estimatedSeconds: 30,
        tags: ["biology", "germination", "table-reading"]
      },
      {
        domain: "Interpretation of Data",
        skill: "Analyze data",
        subskill: "comparison",
        difficulty: "Medium",
        stem: "In Experiment 1, how did the difference between the light and dark germination counts change as salt concentration increased?",
        choices: [
          "It stayed at 4 seeds across all three salt concentrations.",
          "It increased from 4 to 12 to 16 seeds, respectively.",
          "It decreased from 16 to 12 to 4 seeds, respectively.",
          "It increased from 4 to 16 to 28 seeds, respectively."
        ],
        correctAnswer: 1,
        hint: "Subtract the two counts within each row, then compare those differences.",
        explanation: "The light-minus-dark differences are 92 − 88 = 4, 76 − 64 = 12, and 44 − 28 = 16 seeds. The observed light advantage grows over these salt concentrations.",
        solutionSteps: ["At 0 mmol/L, the difference is 4 seeds.", "At 40 and 80 mmol/L, the differences are 12 and 16 seeds, so the gap increases."],
        distractorRationales: [
          { index: 0, reason: "This applies the difference from the no-salt treatment to every treatment." },
          { index: 2, reason: "These are the correct three differences in reversed salt-concentration order." },
          { index: 3, reason: "16 is a decrease within the light column, and 28 is a count; neither is the requested middle-row gap." }
        ],
        strategy: "Calculate one within-row comparison at a time; only then look for a trend.",
        trap: "Comparing counts down a column instead of comparing light and darkness at the same salt concentration.",
        principles: ["An effect can depend on the level of a second experimental factor."],
        estimatedSeconds: 55,
        tags: ["biology", "factorial-design", "differences"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Experimental design",
        subskill: "variables",
        difficulty: "Easy",
        stem: "Which pair lists the two variables deliberately changed in Experiment 1?",
        choices: [
          "Seed variety and salt concentration",
          "Root length and number germinated",
          "Salt concentration and light treatment",
          "Light treatment and solution volume"
        ],
        correctAnswer: 2,
        hint: "Distinguish the assigned treatments from the measured response and the conditions held constant.",
        explanation: "Experiment 1 assigned seeds to different salt concentrations and light treatments. Germination was the response; seed variety and solution volume were held constant.",
        solutionSteps: ["Identify the row treatments: three salt concentrations.", "Identify the second treatment factor: daily light versus darkness."],
        distractorRationales: [
          { index: 0, reason: "Salt concentration varied, but all seeds belonged to one variety." },
          { index: 1, reason: "Root length defined the germination criterion, and germination count was an outcome." },
          { index: 3, reason: "Light treatment varied, but solution volume was held constant." }
        ],
        strategy: "Ask which settings the researchers selected before observing a response.",
        trap: "Calling a measured result an independent variable.",
        principles: ["Independent variables are deliberately manipulated; dependent variables are measured."],
        estimatedSeconds: 40,
        tags: ["biology", "independent-variables", "factorial-design"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Experimental design",
        subskill: "controls",
        difficulty: "Medium",
        stem: "Why did Experiment 2 include seeds transferred to fresh 80 mmol/L salt solution?",
        choices: [
          "To determine whether daily light improves germination after transfer",
          "To compare germination in two radish varieties after transfer",
          "To establish the highest salt concentration that permits germination",
          "To separate salt removal from the effects of transfer and extra time"
        ],
        correctAnswer: 3,
        hint: "Both groups were handled again and observed for four more days. What treatment difference remained?",
        explanation: "Both groups were rinsed, moved to fresh paper and solution, and given four more days. Keeping one group at 80 mmol/L provides a comparison for those shared changes while the other group has salt removed.",
        solutionSteps: ["List the shared procedures: rinsing, transfer, fresh paper, and additional observation time.", "Notice that only the salt-free group had its salt concentration reduced; the fresh-salt group controls for the shared procedures."],
        distractorRationales: [
          { index: 0, reason: "Both groups remained in darkness, so light was not compared." },
          { index: 1, reason: "The experiment used one variety of radish." },
          { index: 2, reason: "Only two concentrations were compared; they do not locate a maximum permissive concentration." }
        ],
        strategy: "Identify what happens to both groups and what happens only to the treatment group.",
        trap: "Attributing all later germination to salt removal without accounting for the additional four days.",
        principles: ["A control group should experience the treatment group's handling and observation schedule."],
        estimatedSeconds: 60,
        tags: ["biology", "controls", "recovery-experiment"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Extend an investigation",
        subskill: "follow-up study",
        difficulty: "Medium",
        stem: "A student proposes that salt delayed germination by reducing water uptake. Which follow-up would most directly test the proposed intermediate effect?",
        choices: [
          "Measure mass gained by matched seeds in 0 and 80 mmol/L solutions before roots emerge.",
          "Measure root lengths of germinated seeds after four days in a single salt-free treatment.",
          "Compare germination of different radish varieties kept at one fixed salt concentration.",
          "Compare germination in salt-free water under daily light and under continuous darkness."
        ],
        correctAnswer: 0,
        hint: "The proposed explanation contains a step between salt exposure and germination. Measure that step.",
        explanation: "Water uptake increases a seed's mass. Comparing early mass gain at two salt concentrations, with other conditions matched and surface water removed consistently, directly tests whether salt reduces uptake before germination.",
        solutionSteps: ["The proposed intermediate effect is reduced water uptake, not merely reduced germination.", "Use seed mass gain as an indicator of uptake and compare the two salt treatments before root growth can complicate the measurement."],
        distractorRationales: [
          { index: 1, reason: "Root length after germination does not measure the proposed early uptake difference, and salt is not varied." },
          { index: 2, reason: "This tests variety differences at one salt level, not salt's effect on water uptake." },
          { index: 3, reason: "This tests a light effect while keeping salt absent and does not measure uptake." }
        ],
        strategy: "Translate a proposed mechanism into a measurable quantity and vary its proposed cause.",
        trap: "Repeating a germination comparison without measuring the mechanism offered to explain it.",
        principles: ["Absorbed water contributes to seed mass.", "Testing an intermediate process can distinguish explanations for the same final outcome."],
        estimatedSeconds: 65,
        tags: ["biology", "background-knowledge", "water-uptake", "mechanism"]
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Evaluate explanations",
        subskill: "claims and evidence",
        difficulty: "Medium",
        stem: "A researcher claims that every seed failing to germinate after four days in 80 mmol/L salt solution has been killed. Which result most directly contradicts this claim?",
        choices: [
          "In Experiment 1, 28 seeds germinated in 80 mmol/L solution in darkness.",
          "In Experiment 2, 58 previously ungerminated seeds germinated after salt removal.",
          "In Experiment 1, daily light produced more germinated seeds than darkness did.",
          "In Experiment 2, each transfer treatment began with the same number of seeds."
        ],
        correctAnswer: 1,
        hint: "Look for a later observation on seeds belonging to the group the claim describes.",
        explanation: "Experiment 2 started with seeds that had not germinated after four days in 80 mmol/L salt. Fifty-eight subsequently germinated after transfer to water, demonstrating that those seeds were alive at transfer.",
        solutionSteps: ["The claim concerns seeds that had not yet germinated, not seeds that germinated during the initial exposure.", "Their later germination is incompatible with the claim that all of them were dead."],
        distractorRationales: [
          { index: 0, reason: "The claim excludes seeds that germinated during the initial four days." },
          { index: 2, reason: "A light-treatment difference does not establish the later viability of initially ungerminated seeds." },
          { index: 3, reason: "Equal group sizes are a design feature, not evidence that any seed survived." }
        ],
        strategy: "Match the evidence to the exact population and time specified by the claim.",
        trap: "Using a favorable result from the wrong group as a counterexample.",
        principles: ["A valid counterexample disproves a claim about every member of a group."],
        estimatedSeconds: 55,
        tags: ["biology", "claims-and-evidence", "viability"]
      }
    ]
  },
  {
    id: "act-science-p006",
    type: "research-summaries",
    title: "Testing insulation sleeves",
    content: `An engineering class tested removable sleeves for keeping water warm. Each trial used an identical lidded metal cup containing 200 g of water initially at 70.0°C. Cups stood on identical pads in a 20.0°C room. A probe measured water temperature through a small opening in the lid. The temperature drop was the initial temperature minus the temperature after 20 minutes. A smaller drop indicates better heat retention under these conditions.

Experiment 1
The class tested two sleeve materials at two thicknesses and also tested a cup without a sleeve. Each condition was tested three times with fresh water, after the cup returned to room temperature. Table 1 lists all three temperature drops.

| Sleeve | Thickness (mm) | Trial 1 drop (°C) | Trial 2 drop (°C) | Trial 3 drop (°C) |
| --- | --- | --- | --- | --- |
| None | 0 | 28.0 | 28.5 | 27.5 |
| Felt | 5 | 18.0 | 19.0 | 17.0 |
| Felt | 10 | 12.0 | 12.5 | 11.5 |
| Cork | 5 | 16.0 | 16.5 | 15.5 |
| Cork | 10 | 11.0 | 11.5 | 10.5 |

Experiment 2
Using only 10 mm cork sleeves, the class compared calm air with air moved by a fan. The same probe was used. Each table entry is the mean of three trials.

| Time (minutes) | Water temperature in calm air (°C) | Water temperature with fan (°C) |
| --- | --- | --- |
| 0 | 70.0 | 70.0 |
| 10 | 64.0 | 59.0 |
| 20 | 59.0 | 51.0 |
| 30 | 55.0 | 45.0 |

Moving air can increase heat transfer between an object's outer surface and its surroundings. No tests were made with different cup shapes, water masses, or room temperatures.`,
    questions: [
      {
        domain: "Interpretation of Data",
        skill: "Read data displays",
        subskill: "tables",
        difficulty: "Easy",
        stem: "What was the water temperature after 20 minutes with the fan in Experiment 2?",
        choices: ["45.0°C", "59.0°C", "51.0°C", "64.0°C"],
        correctAnswer: 2,
        hint: "Find the 20-minute row in the fan column.",
        explanation: "The fan treatment has a mean water temperature of 51.0°C at 20 minutes.",
        solutionSteps: ["Select the fan column in Experiment 2.", "Read the entry at 20 minutes: 51.0°C."],
        distractorRationales: [
          { index: 0, reason: "45.0°C is the fan temperature after 30 minutes." },
          { index: 1, reason: "59.0°C is the calm-air temperature after 20 minutes, and the fan temperature after 10 minutes." },
          { index: 3, reason: "64.0°C is the calm-air temperature after 10 minutes." }
        ],
        strategy: "Check the time and the treatment before reading a temperature.",
        trap: "Following the correct row into the calm-air column.",
        principles: ["Rows and columns jointly identify a measurement."],
        estimatedSeconds: 30,
        tags: ["physics", "thermal-insulation", "table-reading"]
      },
      {
        domain: "Interpretation of Data",
        skill: "Analyze data",
        subskill: "trends",
        difficulty: "Medium",
        stem: "Which description matches the temperature changes during successive 10-minute intervals in Experiment 2?",
        choices: [
          "The drop grows each interval in calm air but shrinks each interval with the fan.",
          "The drop shrinks each interval in calm air but grows each interval with the fan.",
          "The drop stays the same each interval in both calm air and moving air.",
          "The drop shrinks each interval in both calm air and moving air."
        ],
        correctAnswer: 3,
        hint: "Calculate consecutive temperature differences, rather than comparing the temperatures alone.",
        explanation: "In calm air the successive drops are 6, 5, and 4°C. With the fan they are 11, 8, and 6°C. Both sets of drops become smaller.",
        solutionSteps: ["Subtract consecutive calm-air temperatures: 70 − 64 = 6, 64 − 59 = 5, and 59 − 55 = 4°C.", "Do the same for the fan: 11, 8, and 6°C; each sequence decreases."],
        distractorRationales: [
          { index: 0, reason: "The fan description is correct, but the calm-air drops also shrink." },
          { index: 1, reason: "The calm-air description is correct, but the fan drops shrink rather than grow." },
          { index: 2, reason: "Equal time intervals do not imply equal temperature changes; neither series is constant-rate." }
        ],
        strategy: "Build a short list of changes before deciding whether a rate is increasing or decreasing.",
        trap: "Treating falling temperature as evidence that the size of each temperature drop must increase.",
        principles: ["A decreasing quantity can decrease at a slowing rate."],
        estimatedSeconds: 60,
        tags: ["physics", "cooling", "rate-of-change"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Evaluate methods",
        subskill: "precision",
        difficulty: "Medium",
        stem: "Using the range of repeated temperature drops as the measure of repeatability, which sleeved condition in Experiment 1 was least repeatable?",
        choices: ["5 mm felt", "10 mm felt", "5 mm cork", "10 mm cork"],
        correctAnswer: 0,
        hint: "For each condition, subtract its smallest trial result from its largest.",
        explanation: "The 5 mm felt trials span 17.0–19.0°C, a range of 2.0°C. Each other sleeved condition has a range of 1.0°C. The larger spread indicates lower repeatability by the stated measure.",
        solutionSteps: ["Find the 5 mm felt range: 19.0 − 17.0 = 2.0°C.", "Find the other ranges: 1.0°C each; 5 mm felt therefore has the largest trial-to-trial spread."],
        distractorRationales: [
          { index: 1, reason: "The 10 mm felt results have a 1.0°C range, smaller than the 5 mm felt range." },
          { index: 2, reason: "The 5 mm cork results have a 1.0°C range; their average drop does not measure repeatability." },
          { index: 3, reason: "The 10 mm cork results have a 1.0°C range; retaining the most heat is different from having the most variable results." }
        ],
        strategy: "Use spread for repeatability and the mean for typical performance; do not exchange their roles.",
        trap: "Equating the greatest heat loss with the poorest measurement precision.",
        principles: ["Repeated values with a smaller spread are more precise by a spread-based criterion."],
        estimatedSeconds: 60,
        tags: ["physics", "precision", "range"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Evaluate methods",
        subskill: "limitations",
        difficulty: "Medium",
        stem: "A company wants to use the results to predict cooling in a 1,000 g water container of a different shape. Which limitation most directly affects that prediction?",
        choices: [
          "The class tested sleeve materials at two different thicknesses.",
          "Every trial used the same cup shape and only 200 g of water.",
          "The fan and calm-air trials began at the same water temperature.",
          "The class reported each trial as well as some mean temperatures."
        ],
        correctAnswer: 1,
        hint: "Compare the proposed new container with the range of conditions actually tested.",
        explanation: "The prediction changes both water mass and container shape, neither of which was varied. The data therefore do not establish how those changes affect cooling.",
        solutionSteps: ["Identify the new conditions: 1,000 g of water and a different container shape.", "Check whether either condition was studied; both lay outside the experimental comparisons."],
        distractorRationales: [
          { index: 0, reason: "Testing two sleeve thicknesses supplies a comparison; it is not the missing mass-and-shape comparison." },
          { index: 2, reason: "Matching initial temperatures improves the fan comparison and does not address the new container." },
          { index: 3, reason: "Reporting repeated results helps assess variation; the limitation is the untested conditions." }
        ],
        strategy: "Compare the intended use case with the study's actual population and conditions.",
        trap: "Assuming the best material under one setup fixes the cooling behavior of every container.",
        principles: ["Controlled conditions improve internal comparisons but restrict direct generalization to untested conditions."],
        estimatedSeconds: 50,
        tags: ["physics", "engineering", "limitations", "generalization"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Experimental design",
        subskill: "procedures",
        difficulty: "Medium",
        stem: "A repeat of Experiment 2 will test fan speed. Which procedure best separates the effect of fan speed from changes in the surrounding air?",
        choices: [
          "Use a warmer room for each higher speed while keeping the fan distance fixed.",
          "Move the fan nearer for each higher speed while keeping the room temperature fixed.",
          "Hold room temperature and fan distance fixed while changing the fan speed setting.",
          "Hold the fan setting fixed while moving the cup to rooms with different temperatures."
        ],
        correctAnswer: 2,
        hint: "Air movement and the temperature difference can both affect heat transfer.",
        explanation: "Heat transfer depends on the conditions surrounding the cup. Holding room temperature and fan distance constant allows changes in cooling to be associated with the assigned fan-speed setting instead of a simultaneous temperature or position change.",
        solutionSteps: ["The intended cause to vary is fan speed; warmer or cooler surroundings could independently change heat transfer.", "Keep the room and geometry matched while varying only the speed setting, with the remaining original conditions unchanged."],
        distractorRationales: [
          { index: 0, reason: "Increasing room temperature changes the temperature difference at the same time as fan speed." },
          { index: 1, reason: "Changing fan distance changes airflow at the cup independently of the speed setting." },
          { index: 3, reason: "This varies room temperature and never varies the proposed factor, fan speed." }
        ],
        strategy: "List alternative causes of the measured response, then hold them fixed while changing the intended factor.",
        trap: "Changing several conditions to create a larger effect, then attributing that effect to one condition.",
        principles: ["Heat transfers from warmer water toward cooler surroundings.", "A fair comparison isolates the intended independent variable."],
        estimatedSeconds: 60,
        tags: ["physics", "background-knowledge", "heat-transfer", "procedures"]
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Evaluate explanations",
        subskill: "model evaluation",
        difficulty: "Medium",
        stem: "Model P predicts that a 10 mm cork sleeve prevents any effect of moving air on cooling. Model Q predicts that moving air can still increase cooling through or around the sleeve. How do the 30-minute results bear on these models?",
        choices: [
          "They favor P because the water is cooler than its initial temperature in both treatments.",
          "They favor P because both treatments begin with the same sleeve and water temperature.",
          "They favor Q because both treatments remain warmer than the surrounding room air.",
          "They favor Q because the fan treatment ends 10°C cooler than the calm-air treatment."
        ],
        correctAnswer: 3,
        hint: "Identify the specific comparison on which the models disagree.",
        explanation: "At 30 minutes, the fan treatment is at 45°C and calm air at 55°C. That 10°C difference favors Q's prediction that moving air can affect cooling despite the sleeve; P predicts no fan effect.",
        solutionSteps: ["P predicts matching temperatures with and without a fan; Q permits a lower temperature with the fan.", "Compare the endpoints: 45°C versus 55°C, which favors Q over P under these conditions."],
        distractorRationales: [
          { index: 0, reason: "Both models can allow cooling; their disagreement is whether the fan changes it." },
          { index: 1, reason: "Matching initial conditions makes the comparison fair but is not evidence for P's predicted outcome." },
          { index: 2, reason: "Both models can allow water to remain above room temperature; this observation does not distinguish them." }
        ],
        strategy: "Find each model's prediction for the same comparison, then use the observation that separates them.",
        trap: "Choosing a true observation that both models could explain.",
        principles: ["Evidence distinguishes models when their predictions for that evidence differ."],
        estimatedSeconds: 65,
        tags: ["physics", "models", "discriminating-evidence"]
      }
    ]
  },
  {
    id: "act-science-p007",
    type: "research-summaries",
    title: "Dissolving a mineral sample",
    content: `A laboratory investigated how temperature and particle size affect the dissolution of mineral M. Dissolution transfers material from solid particles into the surrounding liquid. All samples came from the same mineral batch. Each trial began with 4.00 g of mineral in 200 mL of fresh solvent and used the same stirring speed. After two minutes, the remaining solid was filtered, dried, and weighed. Dissolved mass was calculated by subtracting the remaining mass from 4.00 g.

Experiment 1
The laboratory tested coarse granules, 2–3 mm across, and fine granules, 0.2–0.3 mm across, at three temperatures. Each entry is the mean dissolved mass from three independent trials. Temperature was maintained throughout each trial. A preliminary test showed that the solvent could dissolve more than 4.00 g at every temperature used.

| Temperature (°C) | Coarse: mass dissolved (g) | Fine: mass dissolved (g) |
| --- | --- | --- |
| 15 | 0.40 | 1.20 |
| 25 | 0.70 | 1.80 |
| 35 | 1.00 | 2.40 |

Experiment 2
To examine trial-to-trial variation, the laboratory repeated the 25°C fine-granule condition on four more independently prepared samples. The original conditions, drying procedure, and balance were retained.

| Repeat trial | Mass dissolved (g) |
| --- | --- |
| A | 1.76 |
| B | 1.84 |
| C | 1.78 |
| D | 1.82 |

Breaking a solid into smaller pieces increases its total exposed surface area without increasing its total mass. Dissolution occurs at surfaces in contact with solvent. The laboratory did not determine how long complete dissolution would take.`,
    questions: [
      {
        domain: "Interpretation of Data",
        skill: "Analyze data",
        subskill: "comparison",
        difficulty: "Medium",
        stem: "At 25°C in Experiment 1, how much more mineral dissolved from the fine granules than from the coarse granules?",
        choices: ["0.60 g", "1.10 g", "1.80 g", "2.50 g"],
        correctAnswer: 1,
        hint: "Compare the two entries at one temperature, using the same measured quantity.",
        explanation: "At 25°C, 1.80 g dissolved from fine granules and 0.70 g from coarse granules. The difference is 1.10 g.",
        solutionSteps: ["Read the 25°C row: fine 1.80 g and coarse 0.70 g.", "Subtract 0.70 g from 1.80 g to obtain 1.10 g."],
        distractorRationales: [
          { index: 0, reason: "0.60 g is the increase for fine granules between adjacent tested temperatures." },
          { index: 2, reason: "1.80 g is the fine-granule dissolved mass, not the difference between sizes." },
          { index: 3, reason: "2.50 g adds the two dissolved masses instead of subtracting them." }
        ],
        strategy: "Underline the comparison word and subtract the corresponding entries from the same row.",
        trap: "Reporting one treatment's amount when the question asks for the difference.",
        principles: ["An absolute difference has the same units as the measurements being compared."],
        estimatedSeconds: 45,
        tags: ["chemistry", "dissolution", "comparison"]
      },
      {
        domain: "Interpretation of Data",
        skill: "Analyze data",
        subskill: "interpolation",
        difficulty: "Medium",
        stem: "If fine-granule dissolved mass changes linearly between 25°C and 35°C, what mass would dissolve after two minutes at 30°C?",
        choices: ["2.10 g", "1.50 g", "2.40 g", "3.60 g"],
        correctAnswer: 0,
        hint: "Locate 30°C relative to the two temperatures that surround it.",
        explanation: "30°C is halfway between 25°C and 35°C. Under the stated linear assumption, the mass is halfway between 1.80 g and 2.40 g: 2.10 g.",
        solutionSteps: ["The temperature rises 5°C out of the 10°C interval, so use half of the mass increase.", "Half of 2.40 − 1.80 = 0.60 g is 0.30 g; adding it to 1.80 g gives 2.10 g."],
        distractorRationales: [
          { index: 1, reason: "1.50 g is the midpoint of the fine-granule masses at 15°C and 25°C, the wrong interval." },
          { index: 2, reason: "2.40 g is the observed mass at 35°C, the upper endpoint." },
          { index: 3, reason: "3.60 g doubles the 25°C mass, although the temperature interval calls for interpolation." }
        ],
        strategy: "Identify the two bracketing entries and use the stated interpolation rule only inside that interval.",
        trap: "Using a nearby measured endpoint rather than the position between endpoints.",
        principles: ["Linear interpolation assigns proportional changes between two measured values."],
        estimatedSeconds: 50,
        tags: ["chemistry", "interpolation", "linear-assumption"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Evaluate methods",
        subskill: "replication",
        difficulty: "Medium",
        stem: "Which feature makes Experiment 2 a stronger check of the reproducibility of the dissolution procedure than weighing one dried sample four times?",
        choices: [
          "It uses one balance for all samples, which removes every possible systematic error.",
          "It measures at one temperature, which establishes the trend at all temperatures.",
          "It reports four results, which makes the mean independent of the chosen samples.",
          "It starts each trial with a new sample, so variation in preparation and dissolution is included."
        ],
        correctAnswer: 3,
        hint: "Consider which parts of the procedure are repeated, rather than only how many numbers are recorded.",
        explanation: "Each independent trial repeats sample preparation, dissolution, filtering, drying, and weighing. Reweighing one dried sample primarily checks the weighing step and cannot reveal variation from the earlier steps.",
        solutionSteps: ["Trace the repeated operations in Experiment 2: the full trial is performed on a new sample.", "Compare this with four readings of one dried sample, which leave the preparation and dissolution history unchanged."],
        distractorRationales: [
          { index: 0, reason: "A shared balance may have a systematic bias; using it repeatedly does not remove that bias." },
          { index: 1, reason: "Repeats at 25°C assess that condition, not the temperature trend across untested conditions." },
          { index: 2, reason: "A mean still depends on the sampled trials; merely recording four numbers is not the essential distinction." }
        ],
        strategy: "Distinguish independently repeated experiments from repeated readings of one experimental outcome.",
        trap: "Counting instrument readings as if each were an independent experimental trial.",
        principles: ["Independent replication captures variation across the repeated procedure."],
        estimatedSeconds: 65,
        tags: ["chemistry", "replication", "experimental-variation"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Extend an investigation",
        subskill: "prediction",
        difficulty: "Medium",
        stem: "At 25°C, a new 4.00 g sample has particles 0.05–0.10 mm across that remain separated during stirring. Assuming the same surface-area effect continues, how should its dissolved mass after two minutes compare with the fine-granule result?",
        choices: [
          "It should be less than 1.80 g because its initial mineral mass is smaller.",
          "It should equal 1.80 g because all samples contain the same mineral mass.",
          "It should exceed 1.80 g because more mineral surface is exposed to solvent.",
          "It should exceed 4.00 g because the solvent can dissolve more than that mass."
        ],
        correctAnswer: 2,
        hint: "Distinguish how much mineral is present from how much surface is exposed during the two minutes.",
        explanation: "The new particles are smaller than the fine granules but have the same total starting mass. Their greater exposed area is expected to increase the amount dissolved in the fixed time, under the stated assumption. The dissolved mass still cannot exceed the 4.00 g initially present.",
        solutionSteps: ["Compare particle sizes: 0.05–0.10 mm is smaller than 0.2–0.3 mm, increasing exposed area for the same total mass.", "Apply the assumed continuing surface-area effect to predict more than 1.80 g dissolved, bounded above by 4.00 g."],
        distractorRationales: [
          { index: 0, reason: "The initial mineral mass remains 4.00 g; smaller particles do not imply less total mass." },
          { index: 1, reason: "Equal starting masses limit the available mineral but do not require equal dissolution rates." },
          { index: 3, reason: "Solvent capacity does not create mineral; no more than the initial 4.00 g can dissolve." }
        ],
        strategy: "Apply the proposed mechanism, then check that the prediction obeys the available-mass limit.",
        trap: "Confusing solvent capacity or particle size with the total mass of mineral supplied.",
        principles: ["Smaller separated particles have greater total exposed surface area at fixed mass.", "The mass dissolved cannot exceed the initial mass of solute."],
        estimatedSeconds: 65,
        tags: ["chemistry", "background-knowledge", "surface-area", "prediction"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Experimental design",
        subskill: "controls",
        difficulty: "Medium",
        stem: "What is the main reason for using the same stirring speed in all trials of Experiment 1?",
        choices: [
          "To guarantee identical dissolved masses at every tested temperature",
          "To prevent stirring differences from explaining the treatment differences",
          "To make the coarse and fine samples have identical exposed surface areas",
          "To make the initial mineral mass equal the solvent's dissolution capacity"
        ],
        correctAnswer: 1,
        hint: "Ask whether a second changing condition could offer another explanation for the observed differences.",
        explanation: "Holding stirring speed constant prevents differences in stirring from becoming an alternative explanation for the changes attributed to temperature or particle size.",
        solutionSteps: ["Temperature and particle size are the factors being compared.", "Keep stirring matched so it does not change alongside either intended factor."],
        distractorRationales: [
          { index: 0, reason: "Matched stirring does not force equal results when temperature or particle size differs." },
          { index: 2, reason: "Particle size determines the surface-area difference; equal stirring does not erase it." },
          { index: 3, reason: "Stirring speed does not equate the 4.00 g sample to the solvent's greater dissolution capacity." }
        ],
        strategy: "For a constant condition, identify the alternative explanation it prevents.",
        trap: "Thinking controlled variables must make the experimental outcomes identical.",
        principles: ["A controlled variable reduces competing explanations for a treatment comparison."],
        estimatedSeconds: 45,
        tags: ["chemistry", "controls", "stirring"]
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Draw conclusions",
        subskill: "generalization",
        difficulty: "Medium",
        stem: "Which conclusion is supported by the two experiments without extending beyond the tested conditions?",
        choices: [
          "At each tested temperature, fine granules dissolved more than coarse granules during the first two minutes.",
          "At each possible temperature, fine granules will completely dissolve in less than two minutes.",
          "At 25°C, every fine-granule trial must dissolve exactly 1.80 g during the first two minutes.",
          "At 35°C, coarse granules will eventually dissolve less total mineral than fine granules will."
        ],
        correctAnswer: 0,
        hint: "Separate the observed two-minute amounts from claims about all trials, all temperatures, or final amounts.",
        explanation: "The fine-granule means exceed the coarse-granule means at 15, 25, and 35°C. The experiments do not establish behavior at every temperature or final dissolved amounts, and the repeat trials show that 1.80 g is not an exact result of every trial.",
        solutionSteps: ["Compare fine and coarse values in all three rows: 1.20 > 0.40, 1.80 > 0.70, and 2.40 > 1.00 g.", "Limit the conclusion to the tested temperatures and the two-minute observation period."],
        distractorRationales: [
          { index: 1, reason: "Untested temperatures are outside the evidence, and none of the fine-granule means equals the full 4.00 g." },
          { index: 2, reason: "The four repeats range from 1.76 to 1.84 g; a mean is not a required value for every trial." },
          { index: 3, reason: "Amounts dissolved after two minutes do not establish the eventual total; complete dissolution times were not measured." }
        ],
        strategy: "Keep the conclusion's temperatures, time period, and level of certainty within those supported by the measurements.",
        trap: "Treating a rate difference as proof of a difference in the final amount that can dissolve.",
        principles: ["A finite-time comparison does not establish the final state of a process.", "A sample mean need not equal any particular trial result."],
        estimatedSeconds: 60,
        tags: ["chemistry", "generalization", "rate-versus-extent"]
      }
    ]
  },
  {
    id: "act-science-p008",
    type: "research-summaries",
    title: "Sediment settling in water columns",
    content: `Researchers studied sediment collected from a stream. They separated the sediment into coarse grains, 0.4–0.6 mm across, and fine grains, 0.04–0.06 mm across. Each trial used a new 2.0 g sample placed near the top of a transparent cylinder containing water at 20°C. No sediment was added after the trial began. The researchers measured the mass that had reached the bottom and reported it as a percentage of the starting mass. Each reported percentage is the mean of three trials.

Experiment 1
Identical cylinders contained 40 cm-deep columns of still water. The researchers compared the two grain-size groups.

| Time after release (seconds) | Coarse sediment settled (%) | Fine sediment settled (%) |
| --- | --- | --- |
| 20 | 80 | 10 |
| 40 | 96 | 28 |
| 60 | 100 | 50 |
| 120 | 100 | 82 |

Experiment 2
Using fine sediment only, the researchers compared two water depths. Cylinders had the same internal diameter. They recorded the earliest observation time when at least 50% of the sediment had settled. Observations were made every 10 seconds, including at time zero.

| Water depth (cm) | First observation with at least 50% settled (seconds) |
| --- | --- |
| 20 | 30 |
| 40 | 60 |

Gravity pulls sediment particles downward. Upward water movement can oppose that settling. The experiments used still water, and the researchers did not observe individual grain paths.`,
    questions: [
      {
        domain: "Interpretation of Data",
        skill: "Translate data",
        subskill: "table to graph",
        difficulty: "Medium",
        stem: "Experiment 1 is graphed with time on the horizontal axis and percentage settled on the vertical axis. Which description correctly identifies the coarse-sediment series?",
        choices: [
          "It begins at 10% at 20 seconds and rises to 82% at 120 seconds.",
          "It begins at 80% at 20 seconds and falls to 0% at 120 seconds.",
          "It reaches 100% at 60 seconds and then continues above 100%.",
          "It reaches 100% at 60 seconds and stays horizontal through 120 seconds."
        ],
        correctAnswer: 3,
        hint: "Match consecutive table entries to the height of the plotted series.",
        explanation: "The coarse-sediment percentages are 80, 96, 100, and 100. The last two points have the same vertical coordinate, so the segment from 60 to 120 seconds is horizontal at 100%.",
        solutionSteps: ["Read the coarse values in time order: 80%, 96%, 100%, 100%.", "Plot the two final values at the same height; the connecting segment is horizontal."],
        distractorRationales: [
          { index: 0, reason: "This describes the fine-sediment series." },
          { index: 1, reason: "The percentage settled rises; this partly confuses settled sediment with sediment remaining above the bottom." },
          { index: 2, reason: "The table remains at 100%, and no added sediment permits a value above the starting mass." }
        ],
        strategy: "Check the first point, last point, and any repeated values before choosing a graph description.",
        trap: "Extending an earlier rising trend after the measured quantity reaches its total possible value.",
        principles: ["Equal vertical-axis values at different times form a horizontal segment."],
        estimatedSeconds: 50,
        tags: ["earth-space-science", "sediment", "table-to-graph"]
      },
      {
        domain: "Interpretation of Data",
        skill: "Analyze data",
        subskill: "trends",
        difficulty: "Medium",
        stem: "For fine sediment in Experiment 1, which listed interval had the greatest average increase in percentage settled per second?",
        choices: ["20–120 seconds", "20–40 seconds", "40–60 seconds", "60–120 seconds"],
        correctAnswer: 2,
        hint: "The intervals do not all have the same duration. Compare each percentage-point gain with its elapsed time.",
        explanation: "The 40–60 second interval gains 22 percentage points in 20 seconds, or 1.1 points per second. The other averages are 0.72, 0.9, and about 0.53 points per second, respectively.",
        solutionSteps: ["The gains over 20–40 and 40–60 seconds are 18 and 22 points over equal 20-second intervals.", "The longer intervals give 72/100 = 0.72 and 32/60 ≈ 0.53 points per second, both below 22/20 = 1.1."],
        distractorRationales: [
          { index: 0, reason: "The 72-point increase is the largest total gain, but it occurs over 100 seconds." },
          { index: 1, reason: "An 18-point gain over 20 seconds is smaller than the 22-point gain over the next 20 seconds." },
          { index: 3, reason: "The 32-point gain exceeds 22 points but takes three times as long." }
        ],
        strategy: "Divide change by elapsed time, or compare equal-length intervals before checking the longer ones.",
        trap: "Choosing the greatest total increase when the question asks for the greatest increase per second.",
        principles: ["Average rate equals change divided by elapsed time."],
        estimatedSeconds: 65,
        tags: ["earth-space-science", "rate", "unequal-intervals"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Experimental design",
        subskill: "variables",
        difficulty: "Easy",
        stem: "Which variable was deliberately changed between the two conditions in Experiment 2?",
        choices: ["Sediment particle size", "Water-column depth", "Water temperature", "Cylinder diameter"],
        correctAnswer: 1,
        hint: "Read the condition labels in Experiment 2 and distinguish them from the measured time.",
        explanation: "Experiment 2 compared depths of 20 and 40 cm. It used only fine sediment and held water temperature and cylinder diameter constant.",
        solutionSteps: ["Identify the two treatments: water depths of 20 and 40 cm.", "Check that particle size, temperature, and diameter were the same in both."],
        distractorRationales: [
          { index: 0, reason: "Only fine sediment was used in Experiment 2; particle size varied in Experiment 1." },
          { index: 2, reason: "The water was held at 20°C for all trials." },
          { index: 3, reason: "The passage explicitly states that the cylinder diameters were the same." }
        ],
        strategy: "Keep the designs of the two experiments separate when identifying a manipulated variable.",
        trap: "Carrying the independent variable from Experiment 1 into Experiment 2.",
        principles: ["Different experiments within a study can manipulate different variables."],
        estimatedSeconds: 35,
        tags: ["earth-space-science", "variables", "two-experiment-design"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Evaluate methods",
        subskill: "precision",
        difficulty: "Medium",
        stem: "For a trial whose first observation of at least 50% settled occurs at 60 seconds, which choice gives the narrowest time interval supported by the 10-second observation schedule for when the threshold was first reached?",
        choices: [
          "It occurred after 50 seconds and no later than 60 seconds.",
          "It occurred at exactly 60 seconds with no timing uncertainty.",
          "It occurred after 60 seconds and no later than 70 seconds.",
          "It occurred at some time from 0 seconds through 60 seconds."
        ],
        correctAnswer: 0,
        hint: "Use both the first observation meeting the threshold and the immediately preceding observation.",
        explanation: "The 50-second observation was below 50%, since 60 seconds was the first observation meeting the threshold. The actual crossing therefore occurred after 50 seconds and at or before 60 seconds. The schedule does not resolve its exact time within that interval.",
        solutionSteps: ["The observation immediately before 60 seconds was at 50 seconds and had not reached the threshold.", "Combine that lower bound with the 60-second observation, which had reached it."],
        distractorRationales: [
          { index: 1, reason: "The recording time need not equal the actual crossing time between observations." },
          { index: 2, reason: "The threshold was already met at 60 seconds, so its first crossing cannot be later." },
          { index: 3, reason: "This broad interval includes the crossing time but is not the narrowest supported interval: the below-threshold observation at 50 seconds rules out all earlier times." }
        ],
        strategy: "Bracket a threshold event using the last failed observation and the first successful one.",
        trap: "Treating a discrete observation time as an exact continuous-event time.",
        principles: ["A sampling interval limits the timing precision of an observed threshold crossing."],
        estimatedSeconds: 60,
        tags: ["earth-space-science", "precision", "sampling-interval"]
      },
      {
        domain: "Scientific Investigation",
        skill: "Extend an investigation",
        subskill: "follow-up study",
        difficulty: "Medium",
        stem: "The researchers want to know whether the difference between coarse and fine sediment changes when water moves upward. Which follow-up provides the most direct comparison?",
        choices: [
          "Compare coarse sediment in shallow moving water with fine sediment in deep still water.",
          "Compare three coarse-sediment samples at different depths, all with upward water movement.",
          "Compare fine sediment in still water at several temperatures, using one fixed water depth.",
          "Test each size group in still and upward-moving water, with depth and temperature matched."
        ],
        correctAnswer: 3,
        hint: "The question concerns whether the effect of one factor depends on a second factor.",
        explanation: "Testing both size groups under both flow conditions allows a coarse-minus-fine comparison in still water and another in upward-moving water. Matching depth and temperature keeps those conditions from confounding the difference between comparisons.",
        solutionSteps: ["The study needs a size comparison under each of two flow conditions, requiring four combinations.", "Hold depth, temperature, starting mass, and other procedures matched while comparing those combinations."],
        distractorRationales: [
          { index: 0, reason: "Size, flow, and depth change together, so their effects cannot be separated." },
          { index: 1, reason: "Only coarse sediment and moving water are included; neither required comparison can be made." },
          { index: 2, reason: "This varies temperature and contains neither coarse sediment nor upward-moving water." }
        ],
        strategy: "When asked whether one effect depends on another factor, include every combination of the two factors.",
        trap: "Comparing only a coarse-moving condition with a fine-still condition and calling the difference a flow effect.",
        principles: ["A factorial design can compare the effect of one variable at each level of another."],
        estimatedSeconds: 65,
        tags: ["earth-space-science", "follow-up-study", "factorial-design"]
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Draw conclusions",
        subskill: "inference",
        difficulty: "Medium",
        stem: "In a new cylinder, an upward water current holds fine grains above the bottom, although the same grains settle in still water. Which interpretation is most consistent with this result and the passage?",
        choices: [
          "The current has removed the downward gravitational force on each grain.",
          "The current has converted the suspended fine grains into dissolved material.",
          "The upward motion of the water can offset the grains' downward settling.",
          "The grains must become less massive whenever the water begins moving."
        ],
        correctAnswer: 2,
        hint: "A grain's motion reflects more than the presence of gravity alone.",
        explanation: "Gravity still acts downward. Upward water movement can oppose the grains' settling enough to keep them above the bottom. Suspension does not by itself show that gravity vanished, that mineral dissolved, or that particle mass changed.",
        solutionSteps: ["Recall that gravity continues to pull sediment downward while moving water can oppose settling.", "Interpret the suspended grains as evidence that upward water motion counteracts settling, without assuming an unobserved material change."],
        distractorRationales: [
          { index: 0, reason: "Changing water movement does not remove gravitational force." },
          { index: 1, reason: "Grains remaining visible above the bottom are suspended particles; lack of settling is not evidence of dissolution." },
          { index: 3, reason: "Water movement can alter particle motion without changing particle mass." }
        ],
        strategy: "Explain the observed motion using the stated forces and flow before proposing an unseen change in the particles.",
        trap: "Assuming an object that is not moving downward is no longer affected by gravity.",
        principles: ["Gravity can act on an object even when other effects prevent downward motion.", "Suspension and dissolution describe different physical states."],
        estimatedSeconds: 60,
        tags: ["earth-space-science", "background-knowledge", "gravity", "suspension"]
      }
    ]
  }
];
