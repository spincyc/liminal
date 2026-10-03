"use strict";

module.exports = [
  {
    id: "act-science-p013",
    type: "conflicting-viewpoints",
    title: "What Starts an Autumn Algal Bloom?",
    intro: "The lake observations, hypotheses, and follow-up data below describe an invented investigation.",
    content: `In a shallow freshwater lake, the density of active cells of one algal species increased after autumn winds mixed surface water with deeper water and disturbed bottom sediment. Before mixing, deeper water contained more dissolved phosphorus than surface water. Sediment contained resting cells: living algal cells that were inactive but could become active. The scientists defined a bloom as at least 100 active cells per milliliter after 3 days.

Scientist N: Nutrient hypothesis
The phosphorus brought upward by mixing allows the active algae already in surface water to multiply. Raising dissolved phosphorus from 0.02 to 0.10 mg/L is sufficient to produce a bloom within 3 days, even without added resting cells. Adding resting cells while phosphorus remains at 0.02 mg/L will not produce a bloom.

Scientist C: Cell-supply hypothesis
The small resident population contributes little to a bloom during the first 3 days. Mixing supplies resting cells, which become active and multiply. Adding resting cells is sufficient to produce a bloom within 3 days at either phosphorus concentration. Raising phosphorus without supplying resting cells will not produce a bloom.

Both scientists assume adequate light and the same temperature. They agree that a treatment supplying both elevated phosphorus and resting cells should produce a bloom.

Follow-up study
Surface water was divided among identical jars. All jars initially contained 20 active cells/mL. Each jar received either no resting cells or 100 resting cells/mL, rinsed so they added negligible phosphorus. Resting cells were excluded from active-cell counts. Initial phosphorus concentrations were adjusted as shown. Light, temperature, water volume, and observation time were the same for every jar. Each result is the mean of 5 jars; every individual result was within 3 active cells/mL of its treatment mean.

Treatment | Initial phosphorus (mg/L) | Resting cells added? | Active cells/mL after 3 days
A | 0.02 | No | 24
B | 0.10 | No | 28
C | 0.02 | Yes | 30
D | 0.10 | Yes | 168`,
    questions: [
      {
        domain: "Interpretation of Data",
        skill: "Analyze data",
        subskill: "comparison",
        difficulty: "Easy",
        stem: "In Treatment D, the mean active-cell density increased by how many cells/mL from the beginning of the study to day 3?",
        choices: ["68", "148", "168", "188"],
        correctAnswer: 1,
        hint: "The starting active-cell density is given before the table. Resting cells are not included in that count.",
        explanation: "Every jar began with 20 active cells/mL. Treatment D ended with a mean of 168, so its increase was 168 − 20 = 148 active cells/mL.",
        solutionSteps: [
          "Use the common starting density of 20 active cells/mL and Treatment D's final density of 168.",
          "Subtract the starting density from the final density: 168 − 20 = 148 active cells/mL.",
        ],
        distractorRationales: [
          { index: 0, reason: "Subtracting the 100 added resting cells from 168 mixes a resting-cell count with the requested change in active-cell density." },
          { index: 2, reason: "168 is the final density, not the increase from the initial density of 20." },
          { index: 3, reason: "188 adds the initial and final densities instead of finding their difference." },
        ],
        strategy: "Identify which cell state is being counted, then compare its starting and ending values.",
        trap: "Treating added resting cells as if they were part of the initial active-cell count.",
        principles: ["A change equals the final value minus the initial value.", "Counts of different biological states must not be substituted for one another."],
        estimatedSeconds: 40,
        tags: ["conflicting-viewpoints", "biology", "cell-counts"],
      },
      {
        domain: "Scientific Investigation",
        skill: "Experimental design",
        subskill: "procedures",
        difficulty: "Medium",
        stem: "To determine whether phosphorus affects the activation of resting cells, separately from its effects on later cell division, which additional measurement would be most useful?",
        choices: [
          "The total active-cell density in each jar after 3 days of activation and division",
          "The phosphorus remaining in each jar after 3 days of activation and division",
          "The fraction of resting cells that become active before any cell division at each phosphorus level",
          "The initial number of active cells before resting cells are added at each phosphorus level",
        ],
        correctAnswer: 2,
        hint: "The proposed mechanism concerns a transition between two cell states, not the final size of the population.",
        explanation: "Counting the fraction of resting cells that activate before division begins isolates activation. Comparing that fraction at the two phosphorus levels tests whether phosphorus influences that transition.",
        solutionSteps: [
          "Separate activation of a resting cell from production of additional cells by division.",
          "Choose a measurement made before division can change cell numbers.",
          "Compare the fraction activated at low and high phosphorus with the other conditions held constant.",
        ],
        distractorRationales: [
          { index: 0, reason: "A final active-cell count combines activation and division, so it cannot separate the two processes." },
          { index: 1, reason: "Phosphorus remaining after 3 days can reflect uptake during both activation and division and does not directly count activation." },
          { index: 3, reason: "The initial active-cell count is taken before the resting cells are introduced, so it does not measure their activation." },
        ],
        strategy: "Measure the specific biological process in question before another process can alter the same outcome.",
        trap: "Choosing an easy final count even though several mechanisms contribute to it.",
        principles: ["A measurement that separates processes can distinguish mechanisms that a combined endpoint cannot."],
        estimatedSeconds: 60,
        tags: ["conflicting-viewpoints", "biology", "mechanism-test"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Compare viewpoints",
        subskill: "agreement and disagreement",
        difficulty: "Medium",
        stem: "Suppose a mixing event raises the surface phosphorus concentration to 0.10 mg/L but moves no resting cells upward. Under otherwise suitable conditions, what would the two original hypotheses predict after 3 days?",
        choices: [
          "Both hypotheses predict a bloom.",
          "Neither hypothesis predicts a bloom.",
          "The nutrient hypothesis predicts no bloom; the cell-supply hypothesis predicts a bloom.",
          "The nutrient hypothesis predicts a bloom; the cell-supply hypothesis predicts no bloom.",
        ],
        correctAnswer: 3,
        hint: "Track the two things that ordinary mixing can supply, and note which one this event leaves behind.",
        explanation: "This event supplies elevated phosphorus but no resting cells. That is sufficient under the nutrient hypothesis and insufficient under the cell-supply hypothesis.",
        solutionSteps: [
          "Translate the event into high phosphorus with no added resting cells.",
          "Apply Scientist N's claim that high phosphorus alone is sufficient for a bloom.",
          "Apply Scientist C's claim that resting cells must be supplied for a bloom within 3 days.",
        ],
        distractorRationales: [
          { index: 0, reason: "The cell-supply hypothesis requires added resting cells, which this event does not supply." },
          { index: 1, reason: "The nutrient hypothesis predicts a bloom when phosphorus rises to 0.10 mg/L, even without resting cells." },
          { index: 2, reason: "This reverses the roles assigned to phosphorus and resting cells by the two scientists." },
        ],
        strategy: "Translate an unfamiliar event into the factors named by each hypothesis before comparing predictions.",
        trap: "Assuming that every event described as mixing supplies both proposed causes.",
        principles: ["Two hypotheses can predict different outcomes when an event separates factors that ordinarily occur together."],
        estimatedSeconds: 55,
        tags: ["conflicting-viewpoints", "biology", "separated-causes"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Evaluate explanations",
        subskill: "model evaluation",
        difficulty: "Hard",
        stem: "Which revised explanation best accounts for all four follow-up treatments?",
        choices: [
          "Under the tested conditions, elevated phosphorus and added resting cells were both needed for a bloom within 3 days.",
          "Under the tested conditions, either elevated phosphorus or added resting cells could cause a bloom within 3 days.",
          "Under the tested conditions, added resting cells reduced the response to elevated phosphorus during the first 3 days.",
          "Under the tested conditions, elevated phosphorus prevented added resting cells from contributing to a bloom within 3 days.",
        ],
        correctAnswer: 0,
        hint: "Check each proposed explanation against the single-addition treatments as well as the combined treatment.",
        explanation: "Neither elevated phosphorus alone (B) nor resting cells alone (C) produced a bloom. Their combination (D) did. Both original claims of sufficiency therefore need revision for these conditions.",
        solutionSteps: [
          "Apply the bloom threshold of 100 active cells/mL: only D meets it, even allowing for the stated variation among jars.",
          "Use B to reject the claim that elevated phosphorus alone was sufficient.",
          "Use C to reject the claim that added resting cells alone were sufficient.",
          "Identify the combination present in D and absent from each nonbloom treatment.",
        ],
        distractorRationales: [
          { index: 1, reason: "If either addition were sufficient, B and C would each have reached the bloom threshold; neither did." },
          { index: 2, reason: "Adding resting cells at high phosphorus changed the final density from 28 in B to 168 in D, an increase rather than a reduction." },
          { index: 3, reason: "With resting cells present, high phosphorus produced 168 active cells/mL instead of 30, so it did not prevent the observed bloom." },
        ],
        strategy: "Test a proposed model against the treatments that isolate its parts, not only against a treatment where all proposed causes are present.",
        trap: "Treating a successful combined treatment as proof that either of its components would work alone.",
        principles: ["A factor can be required in a tested system without being sufficient by itself.", "Evidence can require revising both competing models."],
        estimatedSeconds: 85,
        tags: ["conflicting-viewpoints", "biology", "interaction", "necessary-and-sufficient"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Compare viewpoints",
        subskill: "evidence preference",
        difficulty: "Hard",
        stem: "The original hypotheses are next tested using water from a second lake under the same laboratory conditions. Which repeated result would most strongly favor the cell-supply hypothesis over the nutrient hypothesis for that lake?",
        choices: [
          "At 0.10 mg/L phosphorus without added resting cells, the final density reaches 160 active cells/mL.",
          "At 0.02 mg/L phosphorus with added resting cells, the final density reaches 160 active cells/mL.",
          "At 0.10 mg/L phosphorus with added resting cells, the final density reaches 160 active cells/mL.",
          "At 0.02 mg/L phosphorus without added resting cells, the final density remains at 24 active cells/mL.",
        ],
        correctAnswer: 1,
        hint: "Useful distinguishing evidence must agree with one hypothesis and conflict with the other.",
        explanation: "A bloom at low phosphorus after resting cells are added is predicted by Scientist C but rejected by Scientist N. A bloom with both additions, or no bloom with neither addition, would fit both hypotheses.",
        solutionSteps: [
          "Identify the cell-supply prediction that differs from the nutrient prediction: added resting cells can produce a bloom at low phosphorus.",
          "Recognize that 160 active cells/mL meets the bloom definition.",
          "Reject results with both or neither addition as distinguishing evidence because the original hypotheses agree about those cases.",
        ],
        distractorRationales: [
          { index: 0, reason: "A bloom with elevated phosphorus alone favors the nutrient hypothesis, reversing the requested comparison." },
          { index: 2, reason: "Both original hypotheses predict a bloom with both additions, so this result does not favor one over the other." },
          { index: 3, reason: "Both hypotheses predict no bloom when neither proposed cause is supplied, so this result does not distinguish them." },
        ],
        strategy: "Prefer a result on which the hypotheses disagree, then check that its direction favors the requested hypothesis.",
        trap: "Selecting dramatic evidence that both hypotheses already predict.",
        principles: ["Evidence distinguishes models when their predictions differ for the same conditions."],
        estimatedSeconds: 80,
        tags: ["conflicting-viewpoints", "biology", "discriminating-evidence"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Draw conclusions",
        subskill: "inference",
        difficulty: "Medium",
        stem: "Equal volumes from Treatments B and D on day 3 are placed in sealed, illuminated bottles. Assume that only active algae change the oxygen concentration, every active cell has the same photosynthesis and aerobic respiration rates, and photosynthesis exceeds respiration. Before cell densities change, how should the net rate of oxygen accumulation in D compare with that in B?",
        choices: ["It should be one-sixth as great.", "It should be equally great.", "It should be 6 times as great.", "It should be 7 times as great."],
        correctAnswer: 2,
        hint: "First decide what photosynthesis and respiration do to oxygen. Then use the number of active cells in each equal volume.",
        explanation: "Photosynthesis releases oxygen, while aerobic respiration consumes it. With the same positive net production per active cell, oxygen accumulation is proportional to active-cell density: 168/28 = 6.",
        solutionSteps: [
          "Use photosynthesis as an oxygen source and respiration as an oxygen sink; the stated rate ordering gives positive net production.",
          "Read the final active-cell densities: B has 28 cells/mL and D has 168 cells/mL.",
          "Because volumes and per-cell rates are equal, divide 168 by 28 to obtain a rate ratio of 6.",
        ],
        distractorRationales: [
          { index: 0, reason: "One-sixth reverses the comparison: D has more active cells and therefore the greater positive net oxygen production." },
          { index: 1, reason: "Equal rates per cell do not imply equal rates per bottle when the bottles contain different numbers of active cells." },
          { index: 3, reason: "Seven is 168/24, which uses Treatment A's final density instead of Treatment B's." },
        ],
        strategy: "Connect the biological process to the counted organisms, then compare totals using the stated equal per-cell rates.",
        trap: "Confusing a rate per cell with the total rate of a population.",
        principles: ["Photosynthesis produces oxygen and aerobic respiration consumes oxygen.", "Equal contributions per individual make the total contribution proportional to population size."],
        estimatedSeconds: 70,
        tags: ["conflicting-viewpoints", "biology", "background-knowledge", "photosynthesis", "proportional-reasoning"],
      },
    ],
  },
  {
    id: "act-science-p014",
    type: "conflicting-viewpoints",
    title: "Why Do Drying Clay Layers Crack?",
    intro: "Two scientists propose explanations for the results of an invented materials investigation.",
    content: `Wet clay spread in a rigid tray often develops cracks as it dries. In preliminary trials, some layers lifted from their trays before drying had fewer cracks than layers left attached. Two scientists agreed that water loss makes the clay tend to shrink horizontally. They disagreed about what prevents free shrinkage and produces the pulling stress that opens cracks.

Scientist R: Restraint explanation
The tray's base grips the clay and prevents horizontal shrinkage. This external restraint produces cracks. A layer that can slide freely along its base will not crack, even if its top dries before its bottom. A firmly attached layer will crack after sufficient water loss, even if it dries uniformly through its thickness.

Scientist G: Gradient explanation
The top of a layer usually dries and tries to shrink before its wetter lower part. The difference in shrinkage within the layer produces cracks, even on a base that allows sliding. A layer that dries uniformly through its thickness will not crack, even if it is firmly attached to the tray.

Follow-up study
Layers of one clay mixture were prepared with the same area and a thickness of 4 mm. They dried either on a rough base to which the clay adhered or on a coated base along which it could slide. Drying conditions produced either a drier top than bottom or approximately uniform moisture through the thickness. Sensors confirmed these moisture patterns. All layers lost the same total mass of water before their cracks were measured, and their temperatures were equal. The table gives mean total crack length per 100 cm² of original layer area for 5 layers per treatment. Individual measurements differed from their treatment mean by at most 0.2 cm.

Treatment | Base behavior | Moisture pattern during drying | Crack length (cm per 100 cm²)
R | Adhering | Top drier than bottom | 14
S | Sliding | Top drier than bottom | 12
T | Adhering | Uniform through thickness | 2
U | Sliding | Uniform through thickness | 0`,
    questions: [
      {
        domain: "Interpretation of Data",
        skill: "Analyze data",
        subskill: "comparison",
        difficulty: "Medium",
        stem: "When the moisture pattern changed from a drier top to uniform moisture, by how much did mean crack length decrease on each type of base?",
        choices: [
          "2 cm per 100 cm² on the adhering base and 12 cm per 100 cm² on the sliding base",
          "12 cm per 100 cm² on the adhering base and 2 cm per 100 cm² on the sliding base",
          "14 cm per 100 cm² on the adhering base and 12 cm per 100 cm² on the sliding base",
          "12 cm per 100 cm² on the adhering base and 12 cm per 100 cm² on the sliding base",
        ],
        correctAnswer: 3,
        hint: "Make two comparisons, keeping the base behavior the same within each comparison.",
        explanation: "On adhering bases, the decrease was R − T = 14 − 2 = 12. On sliding bases, the decrease was S − U = 12 − 0 = 12. The units are centimeters of crack per 100 cm².",
        solutionSteps: [
          "Compare R and T to hold the adhering base constant: 14 − 2 = 12.",
          "Compare S and U to hold the sliding base constant: 12 − 0 = 12.",
          "Report the two decreases in the same order as the question: adhering, then sliding.",
        ],
        distractorRationales: [
          { index: 0, reason: "The value 2 is the remaining crack length in T, not the decrease from R to T." },
          { index: 1, reason: "The value 2 describes the difference between bases at a fixed moisture pattern, not the decrease from S to U." },
          { index: 2, reason: "The value 14 is R's initial comparison value; the adhering-base decrease must subtract T's value of 2." },
        ],
        strategy: "Pair rows by the condition that must stay constant, then subtract within each pair.",
        trap: "Comparing adjacent rows even when that changes the wrong experimental factor.",
        principles: ["A comparison of one factor requires holding the other factor constant."],
        estimatedSeconds: 55,
        tags: ["conflicting-viewpoints", "chemistry", "materials", "paired-comparisons"],
      },
      {
        domain: "Scientific Investigation",
        skill: "Evaluate methods",
        subskill: "limitations",
        difficulty: "Medium",
        stem: "Suppose the coated base also changed the rate at which water escaped through the bottom of a layer. Why were measurements of moisture through the thickness especially useful?",
        choices: [
          "They checked whether changing the base also changed the internal drying pattern used to compare the explanations.",
          "They ensured that every treatment developed the same crack length despite changes in the base and drying conditions.",
          "They measured how strongly the base gripped the clay without requiring information about the base's surface.",
          "They replaced the need to compare layers at the same total water loss when evaluating the effects of drying.",
        ],
        correctAnswer: 0,
        hint: "A base coating could affect both mechanical sliding and the factor emphasized by the competing explanation.",
        explanation: "If the coating altered water escape, base behavior could become confounded with the moisture gradient. Direct moisture measurements checked whether layers assigned the same drying pattern actually had that pattern.",
        solutionSteps: [
          "Identify the intended base difference: whether clay adheres or slides.",
          "Identify the possible additional effect: a change in the moisture pattern through the layer.",
          "Use moisture measurements to check that this second factor matches the intended treatment rather than changing unnoticed with the coating.",
        ],
        distractorRationales: [
          { index: 1, reason: "Measuring moisture does not force crack lengths to be equal; crack length is the outcome being investigated." },
          { index: 2, reason: "A moisture profile describes water distribution, not the mechanical grip between clay and base." },
          { index: 3, reason: "The distribution of moisture and the total amount of water lost are different properties; measuring one does not make the other irrelevant." },
        ],
        strategy: "Ask whether a treatment changes a rival explanatory factor as well as the intended factor.",
        trap: "Assuming a coating has only the mechanical effect for which it was selected.",
        principles: ["Potential confounding requires checking relevant treatment effects, not merely assigning labels to treatments."],
        estimatedSeconds: 65,
        tags: ["conflicting-viewpoints", "chemistry", "materials", "confounding"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Compare viewpoints",
        subskill: "agreement and disagreement",
        difficulty: "Medium",
        stem: "A new layer dries uniformly on a flexible base that shrinks horizontally with the clay, so the base does not resist the clay's shrinkage. What would the two original explanations predict?",
        choices: [
          "Both predict cracks because water is removed.",
          "Both predict no cracks because their proposed source of restraint is absent.",
          "Only the restraint explanation predicts cracks because clay remains on a base.",
          "Only the gradient explanation predicts cracks because the base can change shape.",
        ],
        correctAnswer: 1,
        hint: "Water loss is shared by both explanations, but each requires a particular obstacle to free shrinkage.",
        explanation: "A base that shrinks with the clay supplies no external resistance, removing Scientist R's proposed cause. Uniform drying removes Scientist G's difference in shrinkage between the top and bottom. Both therefore predict no cracks.",
        solutionSteps: [
          "Under the restraint explanation, ask whether the base prevents horizontal shrinkage; the new base does not.",
          "Under the gradient explanation, ask whether the top and bottom dry differently; they do not.",
          "Conclude that neither proposed source of cracking is present in the new setup.",
        ],
        distractorRationales: [
          { index: 0, reason: "Both explanations require restraint in addition to water loss; neither says freely shrinking clay must crack." },
          { index: 2, reason: "Scientist R attributes cracks to resistance from the base, not merely to contact with any base." },
          { index: 3, reason: "Scientist G requires different drying through the clay thickness, which the new setup explicitly excludes." },
        ],
        strategy: "Translate a new setup into the causal requirements of each explanation instead of matching familiar materials by name.",
        trap: "Treating the presence of a base as equivalent to mechanical restraint.",
        principles: ["Different explanations can converge on a prediction when a setup removes both proposed causes."],
        estimatedSeconds: 60,
        tags: ["conflicting-viewpoints", "chemistry", "materials", "shared-prediction"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Evaluate explanations",
        subskill: "claims and evidence",
        difficulty: "Hard",
        stem: "Which comparison provides the strongest evidence that a difference in moisture through the clay can produce cracks without adhesion to a base?",
        choices: [
          "R versus S: crack length was 14 versus 12 when the top was drier than the bottom.",
          "R versus T: crack length was 14 versus 2 when both layers adhered to their bases.",
          "S versus U: crack length was 12 versus 0 when both layers could slide on their bases.",
          "T versus U: crack length was 2 versus 0 when moisture was uniform through both layers.",
        ],
        correctAnswer: 2,
        hint: "The claim has two requirements: adhesion must be absent, and the moisture pattern must change.",
        explanation: "S and U both allow sliding, so neither has adhesion as the proposed cause. They differ in moisture pattern and in crack length, directly testing cracking associated with uneven drying without adhesion.",
        solutionSteps: [
          "Restrict attention to layers that can slide, because the claim concerns cracking without adhesion.",
          "Find the pair S and U, which differs in moisture pattern while keeping base behavior constant.",
          "Compare their crack lengths: 12 with uneven drying and 0 with uniform drying.",
          "Use that contrast to support the moisture-gradient mechanism without claiming it explains every result.",
        ],
        distractorRationales: [
          { index: 0, reason: "R and S change base behavior while holding the moisture pattern fixed; this comparison does not isolate the effect of moisture pattern." },
          { index: 1, reason: "R and T test moisture pattern with adhesion present, so they do not establish the claimed effect without adhesion." },
          { index: 3, reason: "T and U test base behavior during uniform drying, not a moisture difference through the clay." },
        ],
        strategy: "Translate every condition in the claim into a requirement for the compared treatments.",
        trap: "Choosing the largest raw crack length instead of the comparison that isolates the claimed cause.",
        principles: ["Evidence for a causal claim is stronger when competing conditions are held constant.", "Supporting one mechanism does not establish that it is the only mechanism."],
        estimatedSeconds: 80,
        tags: ["conflicting-viewpoints", "chemistry", "materials", "controlled-evidence"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Draw conclusions",
        subskill: "generalization",
        difficulty: "Medium",
        stem: "Which conclusion is justified by the follow-up results without extending the findings to untested clay layers?",
        choices: [
          "Uniform drying eliminated cracking on both tested base types for this mixture at a thickness of 4 mm.",
          "Uniform drying reduced cracking on both tested base types for this mixture at every possible thickness.",
          "Allowing sliding eliminated cracking under both tested moisture patterns for this mixture at a thickness of 4 mm.",
          "Uniform drying reduced cracking on both tested base types for this mixture at a thickness of 4 mm.",
        ],
        correctAnswer: 3,
        hint: "A supported conclusion must match both the direction of the results and the range of conditions actually tested.",
        explanation: "Uniform drying reduced crack length from 14 to 2 on adhering bases and from 12 to 0 on sliding bases. The study tested only one mixture at 4 mm, and uniform drying did not eliminate cracking on the adhering base.",
        solutionSteps: [
          "Check the result within each base type: uniform drying reduced crack length in both comparisons.",
          "Distinguish reduction from elimination, since T still had cracks.",
          "Limit the conclusion to the tested mixture and thickness instead of assuming the pattern holds at every thickness.",
        ],
        distractorRationales: [
          { index: 0, reason: "Treatment T had 2 cm of cracks per 100 cm², so uniform drying did not eliminate cracking on both bases." },
          { index: 1, reason: "Only 4 mm layers were tested; the results do not establish the response at every thickness." },
          { index: 2, reason: "Treatment S could slide but had 12 cm of cracks per 100 cm², so sliding did not eliminate cracking in both drying conditions." },
        ],
        strategy: "Check the strength of the verb and the scope of the claim separately.",
        trap: "Turning a reduction observed in one tested material into complete prevention or an unrestricted rule.",
        principles: ["A conclusion must match both the observed outcome and the tested conditions."],
        estimatedSeconds: 65,
        tags: ["conflicting-viewpoints", "chemistry", "materials", "scope-of-inference"],
      },
      {
        domain: "Evaluating Scientific Arguments and Models with Evidence",
        skill: "Evaluate explanations",
        subskill: "model evaluation",
        difficulty: "Medium",
        stem: "In another trial, 12 g of mass leaves a drying clay layer. All escaping vapor is collected and condensed into 12 g of liquid water, and no clay minerals leave the tray. How does this result bear on the two explanations?",
        choices: [
          "It supports their shared water-loss premise but does not distinguish their proposed causes of cracking.",
          "It favors the restraint explanation because water changing state requires attachment to a rigid base.",
          "It favors the gradient explanation because collecting water establishes different moisture levels within the clay.",
          "It contradicts both explanations because evaporation should leave the layer's total mass unchanged.",
        ],
        correctAnswer: 0,
        hint: "Separate what the collected water reveals about the lost mass from what it reveals about forces within the clay.",
        explanation: "Evaporation transfers water from the layer to vapor, and condensation returns it to liquid. Recovering the lost mass as water supports the water-loss process accepted by both scientists, but it measures neither adhesion nor moisture differences through the layer.",
        solutionSteps: [
          "Recognize evaporation and condensation as changes of state that transfer water without requiring loss of clay minerals.",
          "Apply mass conservation to the layer plus collected water: 12 g leaving the layer is recovered as 12 g of water.",
          "Note that both explanations accept water loss, while the collection provides no measurement of base restraint or internal moisture pattern.",
        ],
        distractorRationales: [
          { index: 1, reason: "Evaporation can occur whether a layer adheres to a base or slides, so a change of state does not establish external restraint." },
          { index: 2, reason: "The total amount of collected water does not show whether moisture was uniform or different between the top and bottom." },
          { index: 3, reason: "Mass is conserved for the layer and collected water together; the layer alone loses mass as water leaves it." },
        ],
        strategy: "Identify exactly what the measurement establishes, then ask whether the competing explanations disagree about that fact.",
        trap: "Applying conservation of mass to the drying layer alone while ignoring water transferred out of it.",
        principles: ["Evaporation and condensation change water's state.", "Mass conservation includes material transferred between parts of the system.", "Evidence shared by two models need not distinguish them."],
        estimatedSeconds: 70,
        tags: ["conflicting-viewpoints", "chemistry", "materials", "background-knowledge", "phase-change", "mass-conservation"],
      },
    ],
  },
];
