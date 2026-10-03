"use strict";

module.exports = [
  {
    "id": "act-science-p009",
    "type": "research-summaries",
    "title": "Oxygen Changes Around an Aquatic Plant",
    "content": "Researchers used changes in dissolved oxygen to study an aquatic plant. They placed a 1.0 g plant cutting in each sealed chamber containing 100 mL of water. All cuttings came from the same stock. Water temperature was held at 22°C, and the initial dissolved oxygen concentration was 6.0 mg/L. Each trial lasted 20 minutes. A positive oxygen change means the final concentration exceeded the initial concentration. Each reported change is the mean of four fresh chambers.\n\nExperiment 1\n\nThe initial dissolved carbon dioxide concentration was 8 mg/L in every chamber. Lamps supplied different light intensities, measured in light units (LU). An intensity of 0 LU indicates darkness. Matched chambers containing water but no plant were tested at every light intensity.\n\nLight intensity (LU) | Oxygen change with plant (mg/L) | Oxygen change without plant (mg/L)\n0 | −0.7 | 0.0\n40 | −0.2 | 0.0\n80 | +0.4 | 0.0\n160 | +1.2 | 0.0\n320 | +1.2 | 0.0\n\nExperiment 2\n\nThe researchers compared two initial carbon dioxide concentrations. For each concentration, one group of plant chambers received 160 LU and another was kept dark. Plant mass, water volume, temperature, initial oxygen concentration, and trial duration were unchanged.\n\nInitial carbon dioxide (mg/L) | Oxygen change at 160 LU (mg/L) | Oxygen change in darkness (mg/L)\n4 | +0.5 | −0.7\n12 | +1.5 | −0.7\n\nIn these trials, photosynthesis was the only process producing oxygen and cellular respiration was the only process consuming oxygen. Photosynthesis required light. Both processes could occur in illuminated plant chambers. Gas exchange with the outside air was prevented.",
    "questions": [
      {
        "domain": "Interpretation of Data",
        "skill": "Analyze data",
        "subskill": "interpolation",
        "difficulty": "Medium",
        "stem": "If oxygen change varied continuously between adjacent light intensities in Experiment 1, which interval must contain a light intensity giving zero oxygen change?",
        "choices": [
          "Between 40 and 80 LU",
          "Between 0 and 40 LU",
          "Between 80 and 160 LU",
          "Between 160 and 320 LU"
        ],
        "correctAnswer": 0,
        "hint": "Locate neighboring measurements on opposite sides of zero.",
        "explanation": "Oxygen change is negative at 40 LU (−0.2 mg/L) and positive at 80 LU (+0.4 mg/L). A continuous change between those measurements must pass through zero.",
        "solutionSteps": [
          "Read the signs of the oxygen changes in the plant column.",
          "Identify the adjacent values −0.2 and +0.4 mg/L, which bracket zero.",
          "Use their light intensities, 40 and 80 LU, as the interval endpoints."
        ],
        "distractorRationales": [
          {
            "index": 1,
            "reason": "Both endpoint changes are negative, so these measurements do not bracket zero."
          },
          {
            "index": 2,
            "reason": "The changes at both 80 and 160 LU are positive."
          },
          {
            "index": 3,
            "reason": "Both measurements are +1.2 mg/L; their equal values do not mean zero change."
          }
        ],
        "strategy": "For a zero crossing, inspect signs before attempting any arithmetic.",
        "trap": "A flat response means the measured change is constant, not necessarily zero.",
        "principles": [
          "A continuous quantity that changes from negative to positive passes through zero between the two measurements."
        ],
        "estimatedSeconds": 55,
        "tags": [
          "biology",
          "gas-exchange",
          "zero-crossing"
        ]
      },
      {
        "domain": "Interpretation of Data",
        "skill": "Analyze data",
        "subskill": "trends",
        "difficulty": "Medium",
        "stem": "For plant chambers in Experiment 1, what happened to oxygen change when light intensity was doubled from 80 to 160 LU and then doubled from 160 to 320 LU?",
        "choices": [
          "It increased by 0.8 mg/L during each doubling.",
          "It doubled during each of the two doublings.",
          "It increased by 0.8 mg/L, then remained constant.",
          "It remained constant, then increased by 0.8 mg/L."
        ],
        "correctAnswer": 2,
        "hint": "Compare the three oxygen changes in sequence, rather than the light intensities alone.",
        "explanation": "The oxygen changes at 80, 160, and 320 LU are +0.4, +1.2, and +1.2 mg/L. The first difference is 0.8 mg/L; the second is zero.",
        "solutionSteps": [
          "Subtract 0.4 from 1.2 for the first doubling: 0.8 mg/L.",
          "Subtract 1.2 from 1.2 for the second doubling: 0.0 mg/L.",
          "Select the description containing an increase followed by a plateau."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "This extends the first increase into a range where the recorded response is unchanged."
          },
          {
            "index": 1,
            "reason": "Doubling the input does not force the output to double; 0.4 to 1.2 is a tripling and 1.2 to 1.2 is no increase."
          },
          {
            "index": 3,
            "reason": "This reverses the order of the increase and the plateau."
          }
        ],
        "strategy": "Write the response sequence first, then compare adjacent values.",
        "trap": "Equal proportional changes in an input can produce different changes in a response.",
        "principles": [
          "An experimental response must be read from the data rather than assumed proportional to the manipulated variable."
        ],
        "estimatedSeconds": 65,
        "tags": [
          "biology",
          "gas-exchange",
          "plateau"
        ]
      },
      {
        "domain": "Scientific Investigation",
        "skill": "Experimental design",
        "subskill": "controls",
        "difficulty": "Easy",
        "stem": "The chambers without plants in Experiment 1 most directly helped the researchers determine whether:",
        "choices": [
          "plant cuttings consumed equal amounts of carbon dioxide.",
          "respiration occurred only at the lowest light intensity.",
          "the plant stock contained several different plant species.",
          "oxygen changed under the test conditions without a plant."
        ],
        "correctAnswer": 3,
        "hint": "Identify the one feature omitted from these otherwise matched chambers.",
        "explanation": "The chambers without plants experienced the same light treatments. Their zero oxygen changes provide a comparison for oxygen changes that might occur in the apparatus and water alone.",
        "solutionSteps": [
          "Note that the control chambers omit the plant but retain the water and light treatment.",
          "Use their measurements to assess oxygen changes that do not require a plant."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "A chamber containing no cutting cannot measure differences in carbon dioxide consumption among cuttings."
          },
          {
            "index": 1,
            "reason": "The controls lack respiring plants and cannot locate the light intensities at which plants respire."
          },
          {
            "index": 2,
            "reason": "Species identification is not tested by measuring oxygen in water without plants."
          }
        ],
        "strategy": "State what is absent from a control and what alternative source of the response it tests.",
        "trap": "A control without the organism cannot measure a biological process within that organism.",
        "principles": [
          "A matched control can reveal a response produced by the apparatus or medium in the absence of the experimental organism."
        ],
        "estimatedSeconds": 45,
        "tags": [
          "biology",
          "gas-exchange",
          "control-group"
        ]
      },
      {
        "domain": "Scientific Investigation",
        "skill": "Extend an investigation",
        "subskill": "follow-up study",
        "difficulty": "Medium",
        "stem": "Which follow-up would best test whether additional carbon dioxide changes the high-light plateau observed in Experiment 1?",
        "choices": [
          "Test plants at 40 and 80 LU with 8 mg/L carbon dioxide, using the original chamber conditions.",
          "Test plants at 160 and 320 LU with either 8 or 16 mg/L carbon dioxide, holding other conditions fixed.",
          "Test water without plants at 160 and 320 LU, raising the temperature for the brighter treatment.",
          "Test plants at 160 LU with 8 mg/L carbon dioxide, using cuttings with two different masses."
        ],
        "correctAnswer": 1,
        "hint": "The follow-up needs the light range where the plateau occurred and a controlled change in carbon dioxide.",
        "explanation": "Testing both plateau light intensities at the original and a higher carbon dioxide concentration would reveal whether the plateau's level or shape changes with carbon dioxide supply. The other conditions must be held fixed.",
        "solutionSteps": [
          "Locate the plateau at 160 and 320 LU in Experiment 1.",
          "Include the original carbon dioxide concentration as a comparison and add a higher concentration.",
          "Keep plant mass, temperature, water volume, and duration the same across these treatments."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "This examines lower light intensities and never changes carbon dioxide, so it cannot test the proposed cause of the high-light response."
          },
          {
            "index": 2,
            "reason": "These chambers lack the plants whose plateau is being studied, and temperature changes with light intensity."
          },
          {
            "index": 3,
            "reason": "This changes plant mass rather than carbon dioxide and includes only one light intensity."
          }
        ],
        "strategy": "Cross the suspected limiting factor with the conditions where the unexplained pattern occurs.",
        "trap": "Repeating the original pattern without changing the proposed cause cannot test that cause.",
        "principles": [
          "A controlled follow-up varies the proposed causal factor while retaining a suitable reference treatment."
        ],
        "estimatedSeconds": 75,
        "tags": [
          "biology",
          "gas-exchange",
          "factorial-design"
        ]
      },
      {
        "domain": "Evaluating Scientific Arguments and Models with Evidence",
        "skill": "Evaluate explanations",
        "subskill": "claims and evidence",
        "difficulty": "Medium",
        "stem": "A student claims that, at 160 LU, initial carbon dioxide concentration has no effect on the plant chambers' oxygen change. Which observation most directly challenges this claim?",
        "choices": [
          "At 8 mg/L carbon dioxide, the changes at 160 and 320 LU were equal.",
          "At 160 LU, the change was +0.5 mg/L with 4 mg/L carbon dioxide and +1.5 mg/L with 12 mg/L.",
          "At 4 and 12 mg/L carbon dioxide, the dark chambers both changed by −0.7 mg/L.",
          "At all tested light intensities, the chambers without plants had a change of 0.0 mg/L."
        ],
        "correctAnswer": 1,
        "hint": "Match the claimed light intensity and compare treatments that differ in carbon dioxide.",
        "explanation": "Experiment 2 holds light intensity at 160 LU while changing the initial carbon dioxide concentration. The reported oxygen changes differ by 1.0 mg/L, contrary to the claim of no effect under those conditions.",
        "solutionSteps": [
          "Restrict the comparison to the 160 LU column of Experiment 2.",
          "Compare +0.5 mg/L at 4 mg/L carbon dioxide with +1.5 mg/L at 12 mg/L.",
          "Recognize that unequal responses challenge the stated no-effect claim."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "This comparison changes light while holding carbon dioxide fixed, so it does not test the student's claim about carbon dioxide."
          },
          {
            "index": 2,
            "reason": "Equal dark responses do not contradict a claim specifically about illuminated chambers."
          },
          {
            "index": 3,
            "reason": "The claim concerns chambers containing plants; controls without plants do not supply the required carbon dioxide comparison."
          }
        ],
        "strategy": "Translate a claim into the exact rows or columns that would test it.",
        "trap": "A result concerning one manipulated variable does not automatically support a claim concerning another.",
        "principles": [
          "Evidence against a no-effect claim requires a response difference in a comparison that changes the claimed factor."
        ],
        "estimatedSeconds": 65,
        "tags": [
          "biology",
          "gas-exchange",
          "claim-testing"
        ]
      },
      {
        "domain": "Evaluating Scientific Arguments and Models with Evidence",
        "skill": "Draw conclusions",
        "subskill": "inference",
        "difficulty": "Medium",
        "stem": "Assume that plants at 12 mg/L carbon dioxide consumed the same amount of oxygen by respiration in light as in darkness. How much oxygen did photosynthesis produce, expressed as a concentration increase, during the 160 LU trial in Experiment 2?",
        "choices": [
          "0.7 mg/L",
          "0.8 mg/L",
          "1.5 mg/L",
          "2.2 mg/L"
        ],
        "correctAnswer": 3,
        "hint": "The observed change includes oxygen production and oxygen consumption at the same time.",
        "explanation": "Cellular respiration consumes oxygen even when photosynthesis is occurring. Under the stated assumption, 0.7 mg/L was consumed during the light trial. Photosynthesis therefore produced 1.5 + 0.7 = 2.2 mg/L, leaving the observed net gain of 1.5 mg/L.",
        "solutionSteps": [
          "Use the dark change of −0.7 mg/L to estimate respiratory consumption as 0.7 mg/L.",
          "Write net oxygen change = photosynthetic production − respiratory consumption.",
          "Add the consumption back to the net gain: 1.5 + 0.7 = 2.2 mg/L."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "This is the estimated oxygen consumption by respiration, not oxygen production by photosynthesis."
          },
          {
            "index": 1,
            "reason": "Subtracting respiratory consumption from the net gain counts that consumption twice; it has already reduced the observed gain."
          },
          {
            "index": 2,
            "reason": "The measured 1.5 mg/L is net change after respiration, not total photosynthetic production."
          }
        ],
        "strategy": "Separate gross production from net change by writing the production-minus-consumption balance.",
        "trap": "An illuminated plant can photosynthesize and respire simultaneously; a net measurement does not isolate either process.",
        "principles": [
          "Photosynthesis produces oxygen, whereas cellular respiration consumes oxygen.",
          "Net accumulation equals total production minus total consumption."
        ],
        "estimatedSeconds": 75,
        "tags": [
          "biology",
          "gas-exchange",
          "background-knowledge",
          "mass-balance"
        ]
      }
    ]
  },
  {
    "id": "act-science-p010",
    "type": "research-summaries",
    "title": "Wire Length, Temperature, and Current",
    "content": "Students investigated the resistance of bare metal wires. They used wires made from one alloy, all with the same diameter. A regulated source maintained 1.20 volts (V) across the tested wire, as checked by a voltmeter connected to its two ends. An ammeter measured current in amperes (A). The resistance of the connecting leads was negligible. Wire resistance R, in ohms (Ω), is related to voltage V and current I by R = V/I.\n\nThe wire was immersed in an electrically insulating bath that held its temperature constant. Students waited for the wire to reach the bath temperature before briefly switching on the current. They then switched off the current and allowed the wire to return to the bath temperature before the next reading. Each table entry is the mean of four readings.\n\nExperiment 1\n\nStudents compared three wire lengths with the bath at 20°C.\n\nWire length (cm) | Current (A)\n20 | 0.60\n40 | 0.30\n60 | 0.20\n\nExperiment 2\n\nStudents used the 20 cm wire from Experiment 1 at four bath temperatures.\n\nTemperature (°C) | Current (A)\n20 | 0.60\n80 | 0.50\n140 | 0.40\n220 | 0.30\n\nTwo models were proposed for heating a wire from 20°C to 220°C. Model A predicts that heating adds the same number of ohms to every wire, regardless of its length. Model B predicts that heating multiplies every wire's resistance by the same factor, regardless of its length. Each model is to be fitted using the 20 cm wire's results. Neither model makes a claim about untested intermediate temperatures.",
    "questions": [
      {
        "domain": "Interpretation of Data",
        "skill": "Read data displays",
        "subskill": "tables",
        "difficulty": "Easy",
        "stem": "Which wire length in Experiment 1 carried a current of 0.30 A?",
        "choices": [
          "20 cm",
          "30 cm",
          "40 cm",
          "60 cm"
        ],
        "correctAnswer": 2,
        "hint": "Find 0.30 in the current column, then read the length from the same row.",
        "explanation": "The Experiment 1 row containing 0.30 A lists a wire length of 40 cm.",
        "solutionSteps": [
          "Locate the 0.30 A measurement in Experiment 1.",
          "Read across that row to obtain 40 cm."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "The 20 cm wire carried 0.60 A, not 0.30 A."
          },
          {
            "index": 1,
            "reason": "A 30 cm wire was not tested; this copies digits from the current without matching the table's units."
          },
          {
            "index": 3,
            "reason": "The 60 cm wire carried 0.20 A."
          }
        ],
        "strategy": "Match the measurement and its unit before reading the associated condition.",
        "trap": "Numbers in different columns represent different physical quantities.",
        "principles": [
          "Each table row links a tested condition to its measured result."
        ],
        "estimatedSeconds": 35,
        "tags": [
          "physics",
          "electric-circuits",
          "table-lookup"
        ]
      },
      {
        "domain": "Interpretation of Data",
        "skill": "Analyze data",
        "subskill": "comparison",
        "difficulty": "Medium",
        "stem": "According to Experiment 2, how did the 20 cm wire's resistance change when its temperature rose from 20°C to 220°C?",
        "choices": [
          "It doubled from 2 Ω to 4 Ω.",
          "It halved from 4 Ω to 2 Ω.",
          "It rose from 0.30 Ω to 0.60 Ω.",
          "It fell from 0.60 Ω to 0.30 Ω."
        ],
        "correctAnswer": 0,
        "hint": "Voltage stayed fixed. Use the relationship between voltage, current, and resistance for each temperature.",
        "explanation": "At 20°C, resistance is 1.20/0.60 = 2 Ω. At 220°C, it is 1.20/0.30 = 4 Ω. With voltage fixed, halving the current corresponds to doubling the resistance.",
        "solutionSteps": [
          "Read 0.60 A at 20°C and 0.30 A at 220°C.",
          "Calculate resistance at each temperature using R = V/I and V = 1.20 V.",
          "Compare 2 Ω with 4 Ω: the resistance doubled."
        ],
        "distractorRationales": [
          {
            "index": 1,
            "reason": "This makes resistance change in the same direction as current, reversing the inverse relationship at fixed voltage."
          },
          {
            "index": 2,
            "reason": "The numbers 0.30 and 0.60 are currents in amperes, not resistances in ohms."
          },
          {
            "index": 3,
            "reason": "This copies the current measurements and assigns them resistance units without using the voltage."
          }
        ],
        "strategy": "When voltage is fixed, compare current ratios and remember that resistance changes inversely.",
        "trap": "A smaller current can signal a larger resistance, even though both are properties measured in the same circuit.",
        "principles": [
          "Ohm's law gives R = V/I.",
          "At constant voltage, resistance and current are inversely related."
        ],
        "estimatedSeconds": 65,
        "tags": [
          "physics",
          "electric-circuits",
          "background-knowledge",
          "ohms-law"
        ]
      },
      {
        "domain": "Scientific Investigation",
        "skill": "Experimental design",
        "subskill": "procedures",
        "difficulty": "Medium",
        "stem": "Why did the students allow each wire to return to the bath temperature before another reading?",
        "choices": [
          "To make each wire acquire the same resistance before it was measured.",
          "To reduce temperature changes left by the preceding current measurement.",
          "To make each tested length carry the same current at the start of a trial.",
          "To remove the voltage difference between the wire's two ends during a trial."
        ],
        "correctAnswer": 1,
        "hint": "The repeated procedure restores a controlled condition between readings.",
        "explanation": "A current measurement could leave the wire at a different temperature. Returning it to the bath temperature helps ensure that the next reading corresponds to the assigned temperature, a variable that Experiment 2 shows affects current.",
        "solutionSteps": [
          "Identify temperature as the condition restored between readings.",
          "Use Experiment 2 to see that a temperature change can alter the current.",
          "Explain the wait as a way to prevent one measurement from changing the next measurement's conditions."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "Different lengths have different resistances even at the same temperature, as shown in Experiment 1."
          },
          {
            "index": 2,
            "reason": "Holding temperature fixed does not make the currents of different wire lengths equal."
          },
          {
            "index": 3,
            "reason": "The source must maintain 1.20 V across the wire during the measurement; eliminating that voltage would prevent the intended trial."
          }
        ],
        "strategy": "Connect a procedural reset to the variable it restores and to the response that variable can affect.",
        "trap": "A controlled temperature does not imply identical electrical behavior for every wire.",
        "principles": [
          "Repeated measurements should begin under the intended controlled conditions rather than under conditions left by a previous trial."
        ],
        "estimatedSeconds": 65,
        "tags": [
          "physics",
          "electric-circuits",
          "temperature-control"
        ]
      },
      {
        "domain": "Scientific Investigation",
        "skill": "Evaluate methods",
        "subskill": "limitations",
        "difficulty": "Medium",
        "stem": "Which feature of the experiments most limits using their results to predict currents in wires made from other materials?",
        "choices": [
          "The current was measured in amperes rather than in milliamperes.",
          "The students checked the voltage at both ends of the tested wire.",
          "The students averaged four readings for each tested condition.",
          "All of the tested wires were made from the same single alloy."
        ],
        "correctAnswer": 3,
        "hint": "Consider which property would differ in the proposed new application but was never varied here.",
        "explanation": "The experiments establish results for one alloy. They provide no comparison among materials, so applying the numerical results to a different material would require an additional assumption or further testing.",
        "solutionSteps": [
          "Identify material as the property changed in the proposed prediction.",
          "Check the methods: all tested wires came from one alloy.",
          "Recognize that repeating measurements within that alloy does not supply evidence about other materials."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "Changing between amperes and milliamperes only changes the reporting scale, not which materials the evidence covers."
          },
          {
            "index": 1,
            "reason": "Checking the applied voltage supports the comparison; it does not restrict the tested materials."
          },
          {
            "index": 2,
            "reason": "Averaging repeated readings can improve the estimate for a condition but is not the reason other materials are unrepresented."
          }
        ],
        "strategy": "Compare the range of tested conditions with the range covered by the proposed prediction.",
        "trap": "More repeated readings do not broaden the set of materials that was tested.",
        "principles": [
          "Generalization beyond a tested material requires evidence or assumptions about how the relevant properties vary among materials."
        ],
        "estimatedSeconds": 55,
        "tags": [
          "physics",
          "electric-circuits",
          "scope-of-evidence"
        ]
      },
      {
        "domain": "Evaluating Scientific Arguments and Models with Evidence",
        "skill": "Evaluate explanations",
        "subskill": "claims and evidence",
        "difficulty": "Medium",
        "stem": "A student proposes that, at 1.20 V, wire length alone determines current for these wires. Which comparison most directly shows that this proposal is incomplete?",
        "choices": [
          "The 20 cm and 40 cm wires at 20°C carried 0.60 A and 0.30 A.",
          "The 40 cm and 60 cm wires at 20°C carried 0.30 A and 0.20 A.",
          "The 20 cm wire at 20°C and 220°C carried 0.60 A and 0.30 A.",
          "The 20 cm wire in both experiments at 20°C carried 0.60 A."
        ],
        "correctAnswer": 2,
        "hint": "To show that length is insufficient, find different currents without changing length.",
        "explanation": "The 20 cm wire carried different currents at two temperatures despite having the same length and applied voltage. Temperature therefore supplies information that a length-only description omits.",
        "solutionSteps": [
          "A length-only proposal predicts the same current whenever wire length and applied voltage match.",
          "Compare the 20 cm wire at 20°C and 220°C in Experiment 2.",
          "The current changes from 0.60 to 0.30 A, contradicting that prediction."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "Both length and current change in this comparison, which is consistent with a length-only description."
          },
          {
            "index": 1,
            "reason": "This again compares different lengths at one temperature and does not reveal an omitted factor."
          },
          {
            "index": 3,
            "reason": "Matching results under matching conditions support repeatability rather than showing that length is insufficient."
          }
        ],
        "strategy": "Challenge a single-factor claim by holding that factor fixed and finding a response change.",
        "trap": "Evidence that one variable matters does not show that no other variable matters.",
        "principles": [
          "A model assigning one response to each input is challenged by different responses at the same input under otherwise relevant conditions."
        ],
        "estimatedSeconds": 60,
        "tags": [
          "physics",
          "electric-circuits",
          "omitted-variable"
        ]
      },
      {
        "domain": "Evaluating Scientific Arguments and Models with Evidence",
        "skill": "Evaluate explanations",
        "subskill": "model evaluation",
        "difficulty": "Hard",
        "stem": "In a new trial, the 40 cm wire at 220°C carried 0.15 A at 1.20 V. After fitting Models A and B to the 20 cm wire, which model agrees with this new result?",
        "choices": [
          "Model B: it predicts 8 Ω for the heated 40 cm wire.",
          "Model A: it predicts 6 Ω for the heated 40 cm wire.",
          "Model A: it predicts 8 Ω for the heated 40 cm wire.",
          "Model B: it predicts 6 Ω for the heated 40 cm wire."
        ],
        "correctAnswer": 0,
        "hint": "First find what heating does to the 20 cm wire's resistance. Apply each model to the 40 cm wire's starting resistance.",
        "explanation": "The 20 cm wire changes from 2 Ω to 4 Ω, an addition of 2 Ω or a multiplication by 2. The 40 cm wire begins at 4 Ω. Model A predicts 6 Ω, while Model B predicts 8 Ω. The new current gives R = 1.20/0.15 = 8 Ω, agreeing with Model B.",
        "solutionSteps": [
          "Calculate the 20 cm wire's resistances: 1.20/0.60 = 2 Ω at 20°C and 1.20/0.30 = 4 Ω at 220°C.",
          "Fit Model A as adding 2 Ω and Model B as multiplying by 2.",
          "The 40 cm wire starts at 1.20/0.30 = 4 Ω, so the models predict 6 Ω and 8 Ω, respectively.",
          "Convert the new measurement to resistance: 1.20/0.15 = 8 Ω, which matches Model B."
        ],
        "distractorRationales": [
          {
            "index": 1,
            "reason": "Model A does predict 6 Ω, but 6 Ω at 1.20 V would give 0.20 A rather than the observed 0.15 A."
          },
          {
            "index": 2,
            "reason": "The measured resistance is 8 Ω, but assigning that prediction to Model A replaces its additive rule with Model B's multiplicative rule."
          },
          {
            "index": 3,
            "reason": "Model B doubles the initial 4 Ω to 8 Ω; 6 Ω is the prediction of the additive model."
          }
        ],
        "strategy": "Calibrate each model on the original case before applying it to the new case.",
        "trap": "Two models can fit one wire equally well and make different predictions for another wire.",
        "principles": [
          "Ohm's law converts a current measurement at known voltage into resistance.",
          "An additive change and a proportional change can agree at one starting value while diverging at another."
        ],
        "estimatedSeconds": 110,
        "tags": [
          "physics",
          "electric-circuits",
          "background-knowledge",
          "competing-models"
        ]
      }
    ]
  },
  {
    "id": "act-science-p011",
    "type": "research-summaries",
    "title": "Enzyme Activity After a pH Change",
    "content": "An enzyme converts a colorless substrate into a yellow product. Researchers used the rate of product formation to measure enzyme activity. All trials used the same enzyme concentration and excess substrate at 30°C. Rates were measured during the first minute after substrate was added, when substrate depletion was negligible. Each reported rate is the mean of five separately prepared samples.\n\nExperiment 1\n\nEnzyme samples were held for 10 minutes in buffers at pH 4, 5, 6, 7, or 8 without substrate. Substrate was then added, and the rate was measured at that same pH. Buffer solutions maintained the stated pH during each measurement. A matching sample without enzyme was tested at every pH and produced no yellow product.\n\npH during pretreatment and measurement | Product formation rate (μmol/min)\n4 | 2\n5 | 6\n6 | 12\n7 | 9\n8 | 3\n\nExperiment 2\n\nFresh enzyme samples received the same 10-minute pretreatment at pH 4, 6, or 8. The researchers then adjusted every sample to pH 6. One minute after adjustment, they added substrate and measured the rate. Final enzyme concentration, substrate concentration, temperature, and solution volume matched those in Experiment 1.\n\npH during pretreatment | pH during measurement | Product formation rate (μmol/min)\n4 | 6 | 11\n6 | 6 | 12\n8 | 6 | 4\n\nThe researchers considered two explanations for the low rate after pH 8 pretreatment. One explanation proposed permanent loss of enzyme activity. The other proposed a change from which the enzyme could recover slowly after return to pH 6. Experiment 2 included only the one-minute waiting period before substrate addition.",
    "questions": [
      {
        "domain": "Interpretation of Data",
        "skill": "Read data displays",
        "subskill": "tables",
        "difficulty": "Easy",
        "stem": "Among the pH values tested in Experiment 1, which produced the greatest rate of product formation?",
        "choices": [
          "pH 5",
          "pH 6",
          "pH 7",
          "pH 8"
        ],
        "correctAnswer": 1,
        "hint": "Find the largest entry in the rate column, then identify its pH.",
        "explanation": "The largest measured rate in Experiment 1 is 12 μmol/min, at pH 6.",
        "solutionSteps": [
          "Compare the measured rates 2, 6, 12, 9, and 3 μmol/min.",
          "Match the greatest value, 12 μmol/min, to pH 6."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "The rate at pH 5 is 6 μmol/min, below the maximum of 12 μmol/min."
          },
          {
            "index": 2,
            "reason": "The rate has already fallen to 9 μmol/min at pH 7."
          },
          {
            "index": 3,
            "reason": "The greatest tested pH is not the pH with the greatest measured rate; the pH 8 rate is 3 μmol/min."
          }
        ],
        "strategy": "Choose the maximum response rather than the maximum input value.",
        "trap": "An enzyme's measured activity need not rise as pH rises.",
        "principles": [
          "The maximum of a response is located by comparing measured response values."
        ],
        "estimatedSeconds": 40,
        "tags": [
          "biology",
          "enzymes",
          "maximum"
        ]
      },
      {
        "domain": "Interpretation of Data",
        "skill": "Analyze data",
        "subskill": "comparison",
        "difficulty": "Medium",
        "stem": "Each decrease of 1 pH unit corresponds to a tenfold increase in hydrogen ion concentration. Compared with the pH 6 sample in Experiment 1, the pH 4 sample had:",
        "choices": [
          "one hundredth the hydrogen ion concentration and one sixth the rate.",
          "one hundredth the hydrogen ion concentration and six times the rate.",
          "one hundred times the hydrogen ion concentration and six times the rate.",
          "one hundred times the hydrogen ion concentration and one sixth the rate."
        ],
        "correctAnswer": 3,
        "hint": "Treat the hydrogen ion comparison and the measured rate comparison as separate steps.",
        "explanation": "Moving from pH 6 to pH 4 is a decrease of two pH units, so hydrogen ion concentration increases by 10 × 10 = 100. The rate falls from 12 to 2 μmol/min; 2/12 is one sixth.",
        "solutionSteps": [
          "A two-unit pH decrease raises hydrogen ion concentration by a factor of 100.",
          "Read the pH 4 and pH 6 rates: 2 and 12 μmol/min.",
          "Form the requested pH 4-to-pH 6 rate ratio, 2/12 = 1/6, and combine the two comparisons."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "The rate comparison is correct, but lower pH means higher, not lower, hydrogen ion concentration."
          },
          {
            "index": 1,
            "reason": "Both comparisons are reversed: pH 4 has more hydrogen ions and a smaller measured rate."
          },
          {
            "index": 2,
            "reason": "The hydrogen ion comparison is correct, but 12/2 compares pH 6 with pH 4 rather than the requested order."
          }
        ],
        "strategy": "Write each comparison in the requested direction before combining them.",
        "trap": "Numerically lower pH indicates greater hydrogen ion concentration; it does not require greater enzyme activity.",
        "principles": [
          "The pH scale is logarithmic: a one-unit decrease corresponds to a tenfold increase in hydrogen ion concentration.",
          "A measured reaction rate must be compared independently of the scale used for pH."
        ],
        "estimatedSeconds": 80,
        "tags": [
          "biology",
          "chemistry",
          "enzymes",
          "background-knowledge",
          "ph-scale"
        ]
      },
      {
        "domain": "Scientific Investigation",
        "skill": "Experimental design",
        "subskill": "controls",
        "difficulty": "Easy",
        "stem": "What was the primary purpose of the samples without enzyme in Experiment 1?",
        "choices": [
          "To check for product formation by substrate and buffer without enzyme.",
          "To find the enzyme concentration that gives the greatest reaction rate.",
          "To make the hydrogen ion concentration equal at every tested pH.",
          "To measure the enzyme's recovery after a change in buffer pH."
        ],
        "correctAnswer": 0,
        "hint": "Consider what a yellow product in a sample without enzyme would mean.",
        "explanation": "The samples without enzyme test whether the substrate and buffer produce yellow product on their own. Their zero rates support using the product formation in enzyme-containing samples as evidence of enzyme activity.",
        "solutionSteps": [
          "Identify the enzyme as the component absent from the control samples.",
          "Recognize that product in those controls would reveal a source of product formation that did not require enzyme."
        ],
        "distractorRationales": [
          {
            "index": 1,
            "reason": "The experiment used a fixed enzyme concentration; samples containing none do not locate an optimum concentration."
          },
          {
            "index": 2,
            "reason": "Different pH values represent different hydrogen ion concentrations; removing enzyme does not make them equal."
          },
          {
            "index": 3,
            "reason": "There is no enzyme in these controls to recover, and recovery was investigated in Experiment 2."
          }
        ],
        "strategy": "Ask which alternative source of the measured product would remain after the enzyme is removed.",
        "trap": "A control can test whether an effect requires enzyme without measuring any property of the missing enzyme.",
        "principles": [
          "A control lacking the proposed cause tests whether the measured effect can occur without that cause."
        ],
        "estimatedSeconds": 45,
        "tags": [
          "biology",
          "enzymes",
          "negative-control"
        ]
      },
      {
        "domain": "Scientific Investigation",
        "skill": "Extend an investigation",
        "subskill": "follow-up study",
        "difficulty": "Medium",
        "stem": "Which follow-up would best distinguish the two explanations for the low rate after pH 8 pretreatment?",
        "choices": [
          "Measure fresh enzyme at pH 4, 6, and 8 after doubling the substrate concentration in every sample.",
          "Repeat the pH 8 pretreatment and measure all samples at pH 8 after waiting for different times.",
          "After pH 8 pretreatment, allow different waiting times at pH 6 before adding substrate and measuring rates.",
          "After pH 8 pretreatment, return all samples to pH 6 and measure them at several different temperatures."
        ],
        "correctAnswer": 2,
        "hint": "The explanations differ in what should happen as time passes after the return to pH 6.",
        "explanation": "A recovery-time study directly tests whether activity returns at pH 6. Samples should share the pH 8 pretreatment and final assay conditions while differing in how long they wait at pH 6 before the assay.",
        "solutionSteps": [
          "Identify slow recovery at pH 6 as the alternative to permanent activity loss.",
          "Vary the time spent at pH 6 after identical pH 8 pretreatment.",
          "Keep the substrate concentration and measurement temperature fixed so any rate differences can be associated with recovery time."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "Fresh samples with extra substrate do not test recovery following pH 8 pretreatment."
          },
          {
            "index": 1,
            "reason": "Keeping the samples at pH 8 never supplies the return to pH 6 under which slow recovery was proposed."
          },
          {
            "index": 3,
            "reason": "Changing assay temperature introduces a different factor and does not directly test whether more recovery time restores activity."
          }
        ],
        "strategy": "Find the condition under which the competing explanations predict different outcomes, then vary that condition alone.",
        "trap": "Taking more measurements under the original low-activity condition does not test recovery under a different condition.",
        "principles": [
          "A discriminating follow-up targets a variable for which competing explanations make different predictions."
        ],
        "estimatedSeconds": 75,
        "tags": [
          "biology",
          "enzymes",
          "recovery-time"
        ]
      },
      {
        "domain": "Evaluating Scientific Arguments and Models with Evidence",
        "skill": "Evaluate explanations",
        "subskill": "claims and evidence",
        "difficulty": "Medium",
        "stem": "A researcher claims that a 10-minute exposure to pH 4 permanently eliminates most of this enzyme's activity. Which result provides the strongest evidence against that claim?",
        "choices": [
          "The enzyme produced 2 μmol/min when both pretreatment and measurement occurred at pH 4.",
          "The enzyme produced 3 μmol/min when both pretreatment and measurement occurred at pH 8.",
          "The enzyme produced 4 μmol/min after pH 8 pretreatment and measurement at pH 6.",
          "The enzyme produced 11 μmol/min after pH 4 pretreatment and measurement at pH 6."
        ],
        "correctAnswer": 3,
        "hint": "Permanent loss should remain evident after the sample is returned to favorable measurement conditions.",
        "explanation": "The pH 4-pretreated enzyme reaches 11 μmol/min after return to pH 6, close to the 12 μmol/min pH 6 reference. Thus, most activity is still available after the pH 4 exposure, contrary to the claim of permanent elimination.",
        "solutionSteps": [
          "Find the treatment named in the claim: 10 minutes at pH 4.",
          "Examine that treatment after measurement conditions are returned to pH 6.",
          "Compare its 11 μmol/min rate with the pH 6 reference rate of 12 μmol/min."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "A low rate while the enzyme remains at pH 4 cannot distinguish temporary suppression from permanent loss."
          },
          {
            "index": 1,
            "reason": "This concerns pH 8 exposure, not the pH 4 exposure in the claim."
          },
          {
            "index": 2,
            "reason": "This also concerns pH 8 pretreatment and supplies no direct evidence about recovery from pH 4."
          }
        ],
        "strategy": "Test a permanence claim using performance after the original condition has been removed.",
        "trap": "Low activity during exposure does not establish that the activity cannot return afterward.",
        "principles": [
          "Recovery after removal of a treatment challenges a claim that the treatment permanently eliminated the recovered function."
        ],
        "estimatedSeconds": 65,
        "tags": [
          "biology",
          "enzymes",
          "reversibility"
        ]
      },
      {
        "domain": "Evaluating Scientific Arguments and Models with Evidence",
        "skill": "Compare viewpoints",
        "subskill": "evidence preference",
        "difficulty": "Medium",
        "stem": "Suppose pH 8-pretreated samples produced 12 μmol/min after waiting 60 minutes at pH 6, with all other conditions unchanged. How would this result affect the two explanations?",
        "choices": [
          "It would favor permanent loss because the enzyme remained slow during the original pH 8 treatment.",
          "It would favor slow recovery because activity returned to the pH 6 reference level after a longer wait.",
          "It would support both explanations because both predict full activity after enough time at pH 6.",
          "It would challenge both explanations because Experiment 2 already showed complete recovery after one minute."
        ],
        "correctAnswer": 1,
        "hint": "Compare the proposed longer-wait result with what each explanation predicts about lost activity.",
        "explanation": "Recovery to 12 μmol/min after 60 minutes fits an activity change that reverses slowly at pH 6. It conflicts with permanent loss. The original one-minute result of 4 μmol/min did not establish what would happen after a longer wait.",
        "solutionSteps": [
          "Compare 12 μmol/min after 60 minutes with the pH 6 reference rate of 12 μmol/min.",
          "Recognize that full recovery is consistent with the slow-recovery explanation.",
          "Reject permanent loss because the activity thought to be lost has returned."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "The original low rate cannot establish permanence when the new measurement shows that activity returns."
          },
          {
            "index": 2,
            "reason": "Permanent loss does not predict recovery of all activity merely after a longer wait."
          },
          {
            "index": 3,
            "reason": "Experiment 2 measured only 4 μmol/min after one minute following pH 8 pretreatment, well below the 12 μmol/min reference."
          }
        ],
        "strategy": "Judge each explanation by its prediction for the new condition, not just its fit to the old result.",
        "trap": "A short observation window can make a slow reversal appear permanent.",
        "principles": [
          "New evidence can distinguish explanations that were both consistent with an earlier, shorter observation."
        ],
        "estimatedSeconds": 70,
        "tags": [
          "biology",
          "enzymes",
          "competing-explanations"
        ]
      }
    ]
  },
  {
    "id": "act-science-p012",
    "type": "research-summaries",
    "title": "Choosing Blades for a Small Wind Turbine",
    "content": "Engineers tested turbine blades in a wind tunnel. Every rotor had three blades, a radius of 15 cm, and the same total mass. All tests used the same generator and electrical load. Wind speed was held at the stated value for one minute before measurements began. Reported values are means of five trials using separately assembled rotors. Sound level was measured at a fixed position 1 m from the rotor.\n\nExperiment 1\n\nThe engineers used straight blades and changed their pitch, the angle of each blade relative to the plane swept by the rotor. They measured electrical power at a wind speed of 6 m/s.\n\nBlade pitch (degrees) | Electrical power (mW)\n10 | 120\n20 | 180\n30 | 150\n40 | 90\n\nExperiment 2\n\nThe engineers compared straight and curved blade shapes, both at a pitch of 20 degrees. Blade material, rotor radius, rotor mass, generator, and electrical load were unchanged. They measured electrical power and sound level at three wind speeds.\n\nWind speed (m/s) | Straight-blade power (mW) | Curved-blade power (mW) | Straight-blade sound (dB) | Curved-blade sound (dB)\n4 | 45 | 60 | 30 | 32\n6 | 180 | 210 | 36 | 40\n8 | 380 | 360 | 45 | 49\n\nFor one installation, the design must produce at least 175 mW while remaining at or below 38 dB when the wind speed is 6 m/s. These are simultaneous requirements. The experiments did not measure performance at wind speeds between the listed values or the best pitch for curved blades.",
    "questions": [
      {
        "domain": "Interpretation of Data",
        "skill": "Analyze data",
        "subskill": "comparison",
        "difficulty": "Medium",
        "stem": "At which tested wind speed did curved blades provide the greatest electrical power advantage over straight blades, and how large was that advantage?",
        "choices": [
          "4 m/s; 15 mW",
          "6 m/s; 390 mW",
          "8 m/s; 20 mW",
          "6 m/s; 30 mW"
        ],
        "correctAnswer": 3,
        "hint": "Subtract straight-blade power from curved-blade power at each wind speed.",
        "explanation": "The curved-minus-straight power differences are 15 mW at 4 m/s, 30 mW at 6 m/s, and −20 mW at 8 m/s. The greatest positive advantage is therefore 30 mW at 6 m/s.",
        "solutionSteps": [
          "Compute 60 − 45 = 15 mW at 4 m/s.",
          "Compute 210 − 180 = 30 mW at 6 m/s and 360 − 380 = −20 mW at 8 m/s.",
          "Select the largest positive difference, 30 mW at 6 m/s."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "Curved blades do have a 15 mW advantage at 4 m/s, but this is smaller than their advantage at 6 m/s."
          },
          {
            "index": 1,
            "reason": "Adding 210 and 180 gives combined power, not the advantage of one design over the other."
          },
          {
            "index": 2,
            "reason": "The 20 mW advantage at 8 m/s belongs to straight blades; curved blades produce less power there."
          }
        ],
        "strategy": "Use the same subtraction order for every row so the sign identifies which design leads.",
        "trap": "A large absolute difference is not necessarily an advantage for the design named in the question.",
        "principles": [
          "A difference between designs must preserve the requested comparison direction."
        ],
        "estimatedSeconds": 65,
        "tags": [
          "physics",
          "engineering-design",
          "wind-energy",
          "signed-difference"
        ]
      },
      {
        "domain": "Interpretation of Data",
        "skill": "Analyze data",
        "subskill": "interpolation",
        "difficulty": "Medium",
        "stem": "Assume that each blade design's power changes linearly between 6 and 8 m/s. At approximately what wind speed would the two designs produce equal electrical power?",
        "choices": [
          "6.4 m/s",
          "7.2 m/s",
          "7.6 m/s",
          "8.4 m/s"
        ],
        "correctAnswer": 1,
        "hint": "The curved-blade advantage changes from +30 mW to −20 mW across a 2 m/s interval.",
        "explanation": "The curved-minus-straight difference falls by 50 mW between 6 and 8 m/s. Reaching zero requires a fall of 30 mW, or 30/50 of the interval. The corresponding speed is 6 + (30/50) × 2 = 7.2 m/s.",
        "solutionSteps": [
          "At 6 m/s, curved blades lead by 210 − 180 = 30 mW.",
          "At 8 m/s, curved blades trail by 360 − 380 = −20 mW, a total difference change of 50 mW.",
          "Zero occurs 30/50 of the way from 6 to 8 m/s, giving 7.2 m/s."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "At 6.4 m/s, only one fifth of the interval has passed; the initial 30 mW lead would have fallen by only 10 mW."
          },
          {
            "index": 2,
            "reason": "At 7.6 m/s, four fifths of the interval has passed; the difference would be −10 mW rather than zero."
          },
          {
            "index": 3,
            "reason": "The sign reversal places the crossing between 6 and 8 m/s, not beyond the upper endpoint."
          }
        ],
        "strategy": "Interpolate the difference between two lines rather than solving for each line separately.",
        "trap": "The crossing need not lie halfway between the measured speeds when the endpoint advantages have different magnitudes.",
        "principles": [
          "The difference of two linear responses is linear over the same interval.",
          "An interpolated value depends on the explicitly assumed behavior between measured points."
        ],
        "estimatedSeconds": 85,
        "tags": [
          "physics",
          "engineering-design",
          "wind-energy",
          "crossover"
        ]
      },
      {
        "domain": "Scientific Investigation",
        "skill": "Experimental design",
        "subskill": "variables",
        "difficulty": "Easy",
        "stem": "For the comparison between blade shapes at 6 m/s in Experiment 2, which variable was deliberately changed?",
        "choices": [
          "The rotor's radius",
          "The blades' pitch",
          "The blades' curvature",
          "The generator's electrical load"
        ],
        "correctAnswer": 2,
        "hint": "Identify what differs between the two designs within the same wind-speed row.",
        "explanation": "The comparison uses straight and curved blade shapes while holding pitch at 20 degrees and keeping radius and electrical load unchanged. Blade curvature is the deliberately changed variable.",
        "solutionSteps": [
          "Restrict attention to the two designs at 6 m/s, so wind speed is fixed.",
          "Use the Experiment 2 methods to distinguish the changed blade shape from the held-constant features."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "Every rotor had the same 15 cm radius."
          },
          {
            "index": 1,
            "reason": "Both blade shapes were tested at a pitch of 20 degrees in Experiment 2."
          },
          {
            "index": 3,
            "reason": "The same electrical load was used for both designs."
          }
        ],
        "strategy": "Read the methods for the specified comparison rather than assuming every variable mentioned was manipulated.",
        "trap": "Pitch changed in Experiment 1 but was controlled in Experiment 2.",
        "principles": [
          "The independent variable is the feature deliberately changed in the particular comparison being analyzed."
        ],
        "estimatedSeconds": 45,
        "tags": [
          "physics",
          "engineering-design",
          "wind-energy",
          "independent-variable"
        ]
      },
      {
        "domain": "Scientific Investigation",
        "skill": "Extend an investigation",
        "subskill": "follow-up study",
        "difficulty": "Medium",
        "stem": "Which study would most directly determine whether 20 degrees is also the best of the four tested pitches for curved blades at 6 m/s?",
        "choices": [
          "Test curved blades at 10, 20, 30, and 40 degrees at 6 m/s, with all other conditions fixed.",
          "Test straight blades at 10, 20, 30, and 40 degrees at 8 m/s, with all other conditions fixed.",
          "Test curved blades at 20 degrees at several wind speeds, keeping their radius and mass fixed.",
          "Test straight and curved blades at 20 degrees at 6 m/s, using different generators for the designs."
        ],
        "correctAnswer": 0,
        "hint": "The new study must vary pitch while using the blade shape and wind speed named in the question.",
        "explanation": "Experiment 1 compares pitches only for straight blades. Repeating those four pitch settings with curved blades at 6 m/s directly tests which setting yields the highest power for that blade shape under the requested condition.",
        "solutionSteps": [
          "Identify the missing comparison: several pitches for curved blades.",
          "Use the same four pitch settings and hold wind speed at 6 m/s.",
          "Keep the remaining apparatus fixed and compare the measured powers."
        ],
        "distractorRationales": [
          {
            "index": 1,
            "reason": "This changes the wind speed and continues to test straight blades, so it does not establish the preferred curved-blade pitch at 6 m/s."
          },
          {
            "index": 2,
            "reason": "Testing only 20 degrees cannot determine whether another pitch would produce more power."
          },
          {
            "index": 3,
            "reason": "This includes only one pitch and changes the generator along with blade shape, introducing a second difference."
          }
        ],
        "strategy": "Retain the target operating condition and vary the design parameter whose optimum is unknown.",
        "trap": "The best setting for one shape cannot be assumed to be best for another without a comparison.",
        "principles": [
          "An optimum among candidate designs is established by comparing those candidates under the intended operating conditions."
        ],
        "estimatedSeconds": 60,
        "tags": [
          "physics",
          "engineering-design",
          "wind-energy",
          "optimization"
        ]
      },
      {
        "domain": "Evaluating Scientific Arguments and Models with Evidence",
        "skill": "Draw conclusions",
        "subskill": "inference",
        "difficulty": "Medium",
        "stem": "Based on Experiment 2, which design meets both requirements for the installation described in the passage?",
        "choices": [
          "Straight blades only: they meet both the power minimum and the sound limit.",
          "Curved blades only: their greater power compensates for their higher sound level.",
          "Both blade shapes: each produces more than the required minimum power.",
          "Neither blade shape: each exceeds the sound limit at the highest tested speed."
        ],
        "correctAnswer": 0,
        "hint": "Check each requirement separately at the installation's specified wind speed.",
        "explanation": "At 6 m/s, straight blades produce 180 mW at 36 dB, satisfying at least 175 mW and at most 38 dB. Curved blades produce 210 mW but reach 40 dB, exceeding the sound limit. Both conditions must be met.",
        "solutionSteps": [
          "Use only the 6 m/s row because that is the required operating condition.",
          "For straight blades, check 180 ≥ 175 mW and 36 ≤ 38 dB.",
          "For curved blades, note that 40 dB exceeds 38 dB despite adequate power.",
          "Choose straight blades only."
        ],
        "distractorRationales": [
          {
            "index": 1,
            "reason": "The requirements are simultaneous constraints; extra power does not compensate for exceeding the sound limit."
          },
          {
            "index": 2,
            "reason": "This checks power alone and ignores the curved blades' failure of the sound requirement."
          },
          {
            "index": 3,
            "reason": "The installation specifies performance at 6 m/s, so results at 8 m/s do not decide this comparison."
          }
        ],
        "strategy": "Treat each design requirement as a separate pass-or-fail check at the stated operating condition.",
        "trap": "The highest-output design may fail another required design constraint.",
        "principles": [
          "A feasible engineering design must satisfy every stated constraint, not just maximize one response."
        ],
        "estimatedSeconds": 70,
        "tags": [
          "physics",
          "engineering-design",
          "wind-energy",
          "design-constraints"
        ]
      },
      {
        "domain": "Evaluating Scientific Arguments and Models with Evidence",
        "skill": "Evaluate explanations",
        "subskill": "claims and evidence",
        "difficulty": "Medium",
        "stem": "A later test at 6 m/s found that mechanical power delivered to the generator was 300 mW with straight blades and 350 mW with curved blades. Electrical powers remained as in Experiment 2. Efficiency is electrical output divided by mechanical input. Do these results support the claim that curved blades give higher conversion efficiency?",
        "choices": [
          "Yes; their electrical output is greater by 30 mW.",
          "Yes; their mechanical input is greater by 50 mW.",
          "No; both convert 60% of the mechanical input.",
          "No; both lose the same 120 mW during conversion."
        ],
        "correctAnswer": 2,
        "hint": "Compare output-to-input ratios rather than output powers alone.",
        "explanation": "The straight-blade ratio is 180/300 = 0.60 and the curved-blade ratio is 210/350 = 0.60. Each converts 60% of the mechanical power entering the generator into electrical power, so the higher output does not show higher conversion efficiency.",
        "solutionSteps": [
          "Read the electrical outputs at 6 m/s: 180 mW and 210 mW.",
          "Divide each output by its corresponding mechanical input: 180/300 and 210/350.",
          "Both ratios equal 0.60, so the results show equal conversion efficiencies."
        ],
        "distractorRationales": [
          {
            "index": 0,
            "reason": "Greater output alone does not establish greater efficiency when the mechanical input also differs."
          },
          {
            "index": 1,
            "reason": "Input power is the denominator of efficiency; a greater input alone is not evidence of a greater output-to-input ratio."
          },
          {
            "index": 3,
            "reason": "The losses are 300 − 180 = 120 mW and 350 − 210 = 140 mW, so the claim of equal losses is false."
          }
        ],
        "strategy": "Normalize the useful output by its corresponding input before comparing conversion performance.",
        "trap": "Power output and conversion efficiency measure different things; more input can produce more output at the same efficiency.",
        "principles": [
          "Energy conversion efficiency is useful output divided by the corresponding input.",
          "Power ratios can be used for efficiency when input and output are measured over the same interval."
        ],
        "estimatedSeconds": 85,
        "tags": [
          "physics",
          "engineering-design",
          "wind-energy",
          "background-knowledge",
          "efficiency"
        ]
      }
    ]
  }
];
