(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const families = factory(S);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Words in Context templates (Craft and Structure). Each template is one
  // question design paired with its own bank of topics; every topic is one
  // scene.

  /* ------------------------------------------------ Words in Context helpers */

  const WIC_BLANK = "______";
  const WIC_count = (text, needle) => text.split(needle).length - 1;
  const WIC_escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Whole-word (or whole-phrase) occurrences, case-insensitive.
  const WIC_occurrences = (text, phrase) =>
    (text.match(new RegExp(`(^|[^A-Za-z])${WIC_escape(phrase)}(?=[^A-Za-z]|$)`, "gi")) || []).length;
  const WIC_indexOfWord = (text, phrase) => {
    const match = new RegExp(`(^|[^A-Za-z])(${WIC_escape(phrase)})(?=[^A-Za-z]|$)`, "i").exec(text);
    return match ? match.index + match[1].length : -1;
  };
  // The reason for the other-sense distractor must discuss the tested word
  // itself (any inflection), not some other word.
  const WIC_namesWord = (reason, expression) =>
    reason.toLowerCase().includes(expression.split(" ")[0].slice(0, 4).toLowerCase());
  const WIC_BLANK_STEM = "Which choice completes the text with the most logical and precise word or phrase?";
  const WIC_meaningStem = (expression) =>
    `As used in the text, what does the ${/\s/.test(expression) ? "phrase" : "word"} “${expression}” most nearly mean?`;

  // Shared shape of a blank-completion item. `extra` holds the family-specific
  // explanation pieces and a verify check.
  function WIC_blankItem(topic, extra) {
    const wrong = topic.wrong.map(([text, reason]) => [text, reason]);
    return {
      responseType: "multiple-choice",
      scene: topic.scene,
      stimulus: { type: "passage", content: topic.text },
      stem: WIC_BLANK_STEM,
      correct: topic.key,
      wrong,
      explanation: topic.why,
      steps: extra.steps,
      principles: extra.principles,
      trap: extra.trap,
      hint: extra.hint,
      estimatedSeconds: extra.seconds,
      verify: () =>
        WIC_count(topic.text, WIC_BLANK) === 1 &&
        WIC_occurrences(topic.text.replace(WIC_BLANK, " "), topic.key) === 0 &&
        wrong.every(([text]) => text !== topic.key) &&
        new Set(wrong.map(([text]) => text)).size === wrong.length &&
        extra.check(),
    };
  }

  /* ------------------------------------ 1. Blank restated by the next sentence */

  // The sentence after the blank restates or unpacks the missing word, so the
  // answer is stated in one place right next to the question.
  const WIC_RESTATE_TOPICS = [
    {
      scene: "cs-tardigrade-survival",
      text: "Tardigrades, microscopic animals that live in moss and damp soil, are remarkably ______. They can survive being dried out for years, frozen to temperatures near absolute zero, and even exposed to the vacuum of space, then resume normal activity once water returns.",
      clue: "survive being dried out for years",
      key: "resilient",
      wrong: [
        ["fragile", "The next sentence lists extremes that tardigrades survive, the reverse of being easily harmed."],
        ["abundant", "Living in moss and soil says where tardigrades are found, not how many there are; the next sentence is about survival."],
        ["active", "The text says they resume activity only after surviving harsh conditions; the sentence that follows describes endurance, not constant activity."],
      ],
      why: "The sentence after the blank explains it: tardigrades survive drying, freezing, and the vacuum of space, so they are resilient.",
    },
    {
      scene: "cs-port-labor-market",
      text: "Economists describe the labor market in the port city of Idris Bay as unusually ______. Workers there change employers often, and companies typically fill an open position within a few days rather than the several months common elsewhere in the region.",
      clue: "change employers often",
      key: "fluid",
      wrong: [
        ["stagnant", "Frequent job changes and quickly filled openings describe constant movement, the reverse of a market that is not moving."],
        ["seasonal", "A port might suggest seasonal work, but nothing ties the job changes to a time of year; the text describes how often jobs change hands."],
        ["regulated", "The text says nothing about rules governing hiring; it describes how quickly workers and positions change."],
      ],
      why: "The second sentence explains the blank: workers change employers often and positions are filled within days, so the market is fluid, meaning it changes readily.",
    },
    {
      scene: "cs-river-towns-treaty",
      text: "Historians describe the 1612 treaty between the river towns of Asvel and Morren as ______. Within fourteen months of its signing, the two towns were again seizing each other's fishing boats, and the agreement was never formally renewed.",
      clue: "Within fourteen months of its signing",
      key: "short-lived",
      wrong: [
        ["long-lasting", "The treaty collapsed within fourteen months, the reverse of lasting a long time."],
        ["lucrative", "Fishing boats appear in the text as objects of dispute, not as a source of profit from the treaty."],
        ["secret", "Nothing suggests the treaty was hidden; the text is about how quickly it broke down."],
      ],
      why: "The next sentence shows that the treaty collapsed within fourteen months and was never renewed, so it was short-lived.",
    },
    {
      scene: "cs-late-string-quartets",
      text: "The composer Sigrid Solheim's late string quartets are strikingly ______. Where her early symphonies call for more than eighty players and run nearly an hour, these pieces use just four instruments and rarely last longer than twelve minutes.",
      clue: "use just four instruments",
      key: "compact",
      wrong: [
        ["grandiose", "This describes her early symphonies, with eighty players and hour-long running times; the late quartets are contrasted with them."],
        ["dissonant", "Harmony is a musical quality, but the text never mentions it; it compares the size and length of the works."],
        ["popular", "Nothing in the text concerns how audiences received the quartets."],
      ],
      why: "The next sentence contrasts the huge early symphonies with the late quartets' four instruments and short length, so the quartets are compact.",
    },
    {
      scene: "cs-harbor-street-plan",
      text: "The planners' first proposal for the Harbor Street neighborhood was deliberately ______. It set out broad goals, such as more shade and safer crossings, but left the exact locations of parks, bike lanes, and bus stops to be decided with residents at later meetings.",
      clue: "left the exact locations",
      key: "open-ended",
      wrong: [
        ["detailed", "The proposal left specific locations undecided, the opposite of spelling everything out."],
        ["extravagant", "Nothing in the text concerns the proposal's cost; it describes what the plan left undecided."],
        ["unpopular", "The text never reports residents' reactions; it says only that they would help decide the details later."],
      ],
      why: "The next sentence says the plan set broad goals and left exact locations to be decided later, so it was open-ended.",
    },
    {
      scene: "cs-astronomer-notebooks",
      text: "The nineteenth-century astronomer Marit Solvang was ______ in her record keeping. Her notebooks list the time, the weather, and the telescope settings for each of her roughly 9,000 observations, and not a single entry is left incomplete.",
      clue: "not a single entry is left incomplete",
      key: "meticulous",
      wrong: [
        ["careless", "Complete entries for 9,000 observations show great care, the reverse of carelessness."],
        ["secretive", "The text describes how thorough her notebooks are, not whether she hid them from others."],
        ["innovative", "An astronomer might be expected to break new ground, but the notebooks are praised for completeness, not for new methods."],
      ],
      why: "The next sentence says every one of her 9,000 entries is complete, down to the weather and settings, so she was meticulous.",
    },
    {
      scene: "cs-reading-room-daylight",
      text: "The reading room of the Oduya Library is ______ by design. Its architect set skylights along the entire length of the roof and lined the walls with pale limestone, so that on most days daylight reaches every desk without the help of lamps.",
      clue: "daylight reaches every desk",
      key: "luminous",
      wrong: [
        ["cramped", "Nothing in the text concerns the room's size; it describes how light reaches the desks."],
        ["ornate", "Pale limestone and skylights are chosen for light, and the text mentions no decoration."],
        ["silent", "Quiet is often associated with reading rooms, but the text is about daylight, not sound."],
      ],
      why: "The next sentence explains that skylights and pale stone bring daylight to every desk, so the room is luminous.",
    },
    {
      scene: "cs-honeycomb-cells",
      text: "The six-sided cells of a honeycomb are strikingly ______. Bees build them with the thinnest walls that will still hold honey, enclosing the greatest amount of storage space with the least possible amount of wax.",
      clue: "the least possible amount of wax",
      key: "efficient",
      wrong: [
        ["haphazard", "Cells built to a precise six-sided plan with carefully minimal walls are the reverse of haphazard."],
        ["fragile", "Thin walls might suggest weakness, but the text says they still hold honey; its point is how little wax is used."],
        ["decorative", "Honeycombs can look ornamental, but the text describes how much space the wax encloses, not how the cells look."],
      ],
      why: "The next sentence explains that bees enclose the most space with the least wax, so the cells are efficient.",
    },
    {
      scene: "cs-pumice-float",
      text: "Pumice is so ______ that chunks of it can drift on the ocean for months. The rock forms when frothy lava cools almost instantly, trapping countless gas bubbles, so that a typical piece is more air than stone.",
      clue: "more air than stone",
      key: "porous",
      wrong: [
        ["dense", "A rock that is more air than stone and floats for months is the opposite of dense."],
        ["jagged", "Shape does not explain floating; the second sentence explains the trapped gas bubbles, not the rock's edges."],
        ["ancient", "The age of the rock does not explain why it floats; the text focuses on how the bubbles form."],
      ],
      why: "The second sentence explains that pumice is full of trapped gas bubbles, more air than stone, so it is porous, which is why it floats.",
    },
    {
      scene: "cs-shifting-river-mouth",
      text: "The mouth of the Sarn River is strikingly ______. Over the past three centuries, floods have shifted its main channel at least five times, and maps drawn fifty years apart show the river reaching the sea at points miles away from each other.",
      clue: "shifted its main channel at least five times",
      key: "changeable",
      wrong: [
        ["stable", "A channel that has moved at least five times is the reverse of stable."],
        ["shallow", "River mouths are often shallow, but the text describes how the channel moves, not its depth."],
        ["contaminated", "Nothing in the text concerns the water's quality; it describes the channel's shifting location."],
      ],
      why: "The next sentence says floods have moved the main channel at least five times, so the river mouth is changeable.",
    },
    {
      scene: "cs-bilingual-street-signs",
      text: "Visitors to the town of Aberlith often remark that its street signs are fully ______. Every sign gives each place name twice, once in the regional language and once in the national language, and the two versions appear in letters of equal size.",
      clue: "once in the regional language and once in the national language",
      key: "bilingual",
      wrong: [
        ["outdated", "Nothing suggests the signs are old; the text describes the two languages they display."],
        ["decorative", "The text describes what the signs say, not how ornamental they are."],
        ["abbreviated", "Each name is written out in full in both languages, not shortened."],
      ],
      why: "The next sentence says each sign gives every name in two languages, so the signs are bilingual.",
    },
  ];

  const wicRestatementBlank = {
    id: "wic-restatement-blank",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "precision",
    difficulty: "Easy",
    title: "Blank explained by the next sentence",
    recognize:
      "The sentence right after the blank restates or unpacks the missing word; match the word to that explanation.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "word-association"],
    build(t) {
      const topic = t.pick(WIC_RESTATE_TOPICS);
      const blankAt = topic.text.indexOf(WIC_BLANK);
      return WIC_blankItem(topic, {
        steps: [
          "Read the sentence with the blank and ask what kind of word it needs.",
          "Find the sentence that explains or illustrates the blank.",
          "Choose the word that the explanation restates, not a word merely linked to the topic.",
        ],
        principles: ["A sentence that follows a blank often restates or illustrates the missing word."],
        trap: "Choosing a word associated with the subject of the text rather than the word the next sentence actually explains.",
        hint: "What does the sentence after the blank say about the subject?",
        seconds: 55,
        // The restating clue sits after the blank, in a different sentence.
        check: () => {
          const clueAt = topic.text.indexOf(topic.clue);
          return clueAt > blankAt && /[.:]\s/.test(topic.text.slice(blankAt, clueAt));
        },
      });
    },
  };

  /* ------------------------------------------ 2. Word that matches a magnitude */

  // The blank takes a word of degree; the text reports how large the change
  // was, and the key sits at a different point on the scale in each topic.
  // `measure` [before, after] lets verify recompute the size of the change.
  const WIC_MAGNITUDE_TOPICS = [
    {
      scene: "cs-digital-water-meters",
      text: "After Fairlow replaced its old water meters with digital ones, average household water use changed by less than 1 percent. City researchers called the change ______, noting that it fell well within the normal variation from one month to the next.",
      cues: ["less than 1 percent", "within the normal variation"],
      size: "small",
      key: "negligible",
      wrong: [
        ["dramatic", "A change of less than 1 percent that falls within normal monthly variation is tiny, not striking."],
        ["gradual", "The text gives no timeline for the change, only its size, so nothing shows how slowly it happened."],
        ["alarming", "The researchers say the change is within normal variation, so they are not raising an alarm."],
      ],
      why: "A change of less than 1 percent, within normal month-to-month variation, is negligible.",
    },
    {
      scene: "cs-mail-ballot-turnout",
      text: "Voter turnout in Brightwell County jumped from 38 percent in one election to 71 percent in the next, a ______ increase that county officials credited to a new option allowing every registered voter to cast a ballot by mail.",
      cues: ["38 percent", "71 percent"],
      measure: [38, 71],
      size: "large",
      key: "dramatic",
      wrong: [
        ["slight", "Turnout nearly doubled, from 38 to 71 percent, which is far more than a slight rise."],
        ["temporary", "Only two elections are described, so the text gives no evidence about whether turnout later fell."],
        ["predictable", "Nothing indicates that anyone expected the jump; officials explain it only after the fact."],
      ],
      why: "Turnout nearly doubled, from 38 to 71 percent, so the increase was dramatic.",
    },
    {
      scene: "cs-ellisford-population",
      text: "Surviving tax rolls suggest that the market town of Ellisford grew only ______ during the 1700s. The town had about 2,100 residents in 1700 and about 2,300 in 1800, a small gain for an entire century.",
      cues: ["2,100", "2,300"],
      measure: [2100, 2300],
      size: "small",
      key: "modestly",
      wrong: [
        ["explosively", "An increase of about 200 people over a hundred years is small, as the text itself says, not explosive."],
        ["steadily", "Only the figures for 1700 and 1800 are given, so the text cannot show whether growth was even from year to year."],
        ["unexpectedly", "The text never says what anyone expected; it reports only the size of the gain."],
      ],
      why: "Growing from about 2,100 to about 2,300 residents in a century is a small gain, so the town grew modestly.",
    },
    {
      scene: "cs-salt-spray-coating",
      text: "In laboratory tests, a new coating reduced corrosion on steel panels ______. After six months in a salt-spray chamber, the coated panels showed about 90 percent less rust than identical panels that had been left uncoated.",
      cues: ["90 percent less rust"],
      measure: [100, 10],
      size: "large",
      key: "sharply",
      wrong: [
        ["marginally", "A 90 percent reduction in rust is large, not marginal."],
        ["briefly", "The panels were tested for six months, and nothing suggests the coating's effect wore off."],
        ["unevenly", "The text reports a single overall result and says nothing about variation among the panels."],
      ],
      why: "Cutting rust by about 90 percent is a large reduction, so the coating reduced corrosion sharply.",
    },
    {
      scene: "cs-paper-lantern-show",
      text: "Attendance at the Corvin Gallery's exhibition of paper lanterns was ______. About 400,000 people visited during its three-month run, more than the gallery usually welcomes in an entire year.",
      cues: ["400,000", "more than the gallery usually welcomes in an entire year"],
      size: "large",
      key: "extraordinary",
      wrong: [
        ["disappointing", "Drawing more visitors in three months than in a usual year is a success, not a letdown."],
        ["typical", "Attendance exceeded a normal year's total, so it was far from typical."],
        ["seasonal", "The three-month run tells when the exhibition was open, not how large its crowds were."],
      ],
      why: "More people came in three months than usually visit in a year, so attendance was extraordinary.",
    },
    {
      scene: "cs-tessary-bread-price",
      text: "Over the decade, the price of a loaf of bread in the city of Tessary rose ______, from 2.00 to 2.10 marks, even as the average worker's wages nearly doubled.",
      cues: ["from 2.00 to 2.10 marks"],
      measure: [2.0, 2.1],
      size: "small",
      key: "slightly",
      wrong: [
        ["steeply", "A rise from 2.00 to 2.10 marks is only 5 percent, far from steep."],
        ["suddenly", "The text gives prices only at the start and end of the decade, so nothing shows when the rise happened."],
        ["unfairly", "The text reports the change without judging it, and wages rose far faster than the price."],
      ],
      why: "A rise from 2.00 to 2.10 marks over ten years is about 5 percent, so the price rose slightly.",
    },
    {
      scene: "cs-steady-comet",
      text: "Over the four-month observing season, the comet's brightness varied only ______. Measurements from three observatories never strayed more than 2 percent from the average, a far steadier light than astronomers had predicted.",
      cues: ["more than 2 percent from the average"],
      measure: [100, 102],
      size: "small",
      key: "minimally",
      wrong: [
        ["wildly", "Readings that stayed within 2 percent of the average show very little variation."],
        ["periodically", "The text reports how much the brightness varied, not whether it followed a repeating cycle."],
        ["gradually", "The text describes no trend over the season, only the narrow range of the readings."],
      ],
      why: "Readings that never strayed more than 2 percent from the average show that the brightness varied minimally.",
    },
    {
      scene: "cs-cafe-first-song",
      text: "The audience's response to Juno's first song was ______. A few people near the stage clapped politely, but most went on talking over their coffee, and one man at the counter checked his watch.",
      cues: ["A few people near the stage clapped politely", "checked his watch"],
      size: "small",
      key: "lukewarm",
      wrong: [
        ["rapturous", "Polite clapping from a few listeners is far weaker than rapture."],
        ["hostile", "No one objects or jeers; most listeners simply ignore the song, which is indifference, not hostility."],
        ["delayed", "The text describes how strong the response was, not when it came."],
      ],
      why: "A few polite claps while most people keep talking is a weak, half-hearted response, so it was lukewarm.",
    },
    {
      scene: "cs-pembry-bank-panic",
      text: "The bank panic of 1893 struck the mill town of Pembry ______. Within six weeks, four of its five banks had closed, and the textile mill had laid off nearly all of its 900 workers.",
      cues: ["four of its five banks had closed", "nearly all of its 900 workers"],
      measure: [5, 1],
      size: "large",
      key: "severely",
      wrong: [
        ["mildly", "Four of five banks closing and nearly all mill workers losing their jobs is severe, not mild."],
        ["belatedly", "Nothing compares the timing of the town's troubles with events anywhere else."],
        ["briefly", "The text describes only the first six weeks and says nothing about how soon the town recovered."],
      ],
      why: "Losing four of five banks and nearly all mill jobs within six weeks means the panic struck the town severely.",
    },
    {
      scene: "cs-lake-ondine-grebes",
      text: "Removing an invasive reed from the shores of Lake Ondine had a ______ effect on the lake's native birds. Nesting pairs of grebes climbed from 12 to more than 300 within five years of the removal.",
      cues: ["from 12 to more than 300"],
      measure: [12, 300],
      size: "large",
      key: "profound",
      wrong: [
        ["minor", "An increase from 12 to more than 300 nesting pairs is enormous, not minor."],
        ["harmful", "The number of nesting birds rose, so the removal helped them rather than harming them."],
        ["temporary", "The text reports five years of growth and gives no sign of a later decline."],
      ],
      why: "Nesting pairs rose from 12 to more than 300, so the effect was profound.",
    },
    {
      scene: "cs-caffeine-reaction-time",
      text: "In the Marchetti study, participants' reaction times changed ______ after a dose of caffeine, speeding up by an average of 4 milliseconds, a difference the researchers said no one would notice outside a laboratory.",
      cues: ["4 milliseconds", "no one would notice"],
      size: "small",
      key: "imperceptibly",
      wrong: [
        ["markedly", "A 4-millisecond change that no one would notice is tiny, not marked."],
        ["erratically", "The text reports a single average change and says nothing about unpredictable swings."],
        ["permanently", "Nothing in the text concerns how long the effect lasted."],
      ],
      why: "A 4-millisecond change that no one would notice is imperceptible.",
    },
  ];

  const wicMagnitudeBlank = {
    id: "wic-magnitude-blank",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "precision",
    difficulty: "Easy",
    title: "Word of degree matched to the reported size",
    recognize:
      "The blank needs a word of degree; the figures or description in the text set how large the change or response was.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["opposite-stance", "extreme-language"],
    build(t) {
      const topic = t.pick(WIC_MAGNITUDE_TOPICS);
      return WIC_blankItem(topic, {
        steps: [
          "Find the figures or details that show how large the change or response was.",
          "Decide whether they describe something small or large.",
          "Choose the word that matches that size, and reject words about timing or pattern the text never gives.",
        ],
        principles: ["A word of degree must match the size the evidence shows, neither overstating nor understating it."],
        trap: "Choosing a word about when or how the change happened, which the text never describes, instead of how large it was.",
        hint: "How big was the change, according to the numbers or details given?",
        seconds: 55,
        // Recompute the relative size of the change where figures are given,
        // and confirm the cited evidence is in the text.
        check: () => {
          const cuesPresent = topic.cues.every((cue) => topic.text.includes(cue));
          if (!topic.measure) return cuesPresent;
          const [before, after] = topic.measure;
          const change = Math.abs(after - before) / Math.abs(before);
          return cuesPresent && (topic.size === "small" ? change < 0.2 : change > 0.5);
        },
      });
    },
  };

  /* ------------------------------------------- 3. Direction of a relationship */

  // The blank names one side of a relationship (earlier or later, cause or
  // effect, actor or acted-on). The reversed word names the other side.
  const WIC_RELATION_SIDE = {
    ancestor: "first", descendant: "second",
    forerunners: "first", successors: "second",
    cause: "first", symptom: "second", consequence: "second",
    prerequisite: "first", reward: "second",
    predecessor: "first", successor: "second",
    predator: "first", prey: "second",
    origin: "first", culmination: "second",
    precursor: "first", vestige: "second",
    creator: "first", product: "second",
    catalyst: "first", result: "second",
  };

  const WIC_RELATION_TOPICS = [
    {
      scene: "cs-eohippus-ancestor",
      text: "The modern horse descends from Eohippus, a dog-sized animal that lived about 50 million years ago and had several toes on each foot. Unlike this distant ______, today's horses walk on a single hoofed toe.",
      cue: "descends from",
      side: "first",
      key: "ancestor",
      reversed: ["descendant", "Eohippus lived long before modern horses, which descend from it, so it cannot be their descendant."],
      others: [
        ["rival", "The two animals lived 50 million years apart, so they never competed."],
        ["imitator", "Eohippus could not copy an animal that did not yet exist; horses came from it."],
      ],
      why: "The modern horse descends from Eohippus, which lived 50 million years ago, so Eohippus is its ancestor.",
    },
    {
      scene: "cs-brackhaven-shipping-notices",
      text: "Brackhaven's first newspapers were single sheets of shipping news pinned up at the harbor in the 1790s. These notices were the ______ of the town's daily paper, which grew out of them over the next forty years.",
      cue: "grew out of them",
      side: "first",
      key: "forerunners",
      reversed: ["successors", "The daily paper grew out of the notices, so the notices came first and cannot have followed it."],
      others: [
        ["competitors", "The paper developed from the notices rather than competing with them."],
        ["advertisers", "Nothing suggests the notices paid the paper for space; the paper grew out of them."],
      ],
      why: "The daily paper grew out of the harbor notices over forty years, so the notices were its forerunners.",
    },
    {
      scene: "cs-fever-infection",
      text: "Doctors often describe fever as a ______ of infection rather than an illness in itself. When microbes invade, the body raises its own temperature in response, and the fever fades once the infection clears.",
      cue: "in response",
      side: "second",
      key: "symptom",
      reversed: ["cause", "The fever arises in response to invading microbes, so the infection produces the fever, not the other way around."],
      others: [
        ["type", "The text says fever is not an illness in itself, so it is not a kind of infection."],
        ["treatment", "The text says the fever fades once the infection clears, not that anyone uses fever to clear it."],
      ],
      why: "The body raises its temperature in response to infection, so fever is a symptom of infection.",
    },
    {
      scene: "cs-ferro-scales-exam",
      text: "At the Ferro Conservatory, mastering scales is a ______ for the jazz improvisation course: students may not enroll in the course until they have passed a timed scales exam.",
      cue: "may not enroll in the course until",
      side: "first",
      key: "prerequisite",
      reversed: ["reward", "A reward comes after an achievement, but students must pass the scales exam before they can take the course."],
      others: [
        ["substitute", "Scales do not replace the course; students must pass them before taking it."],
        ["distraction", "The school requires scales, which is the opposite of treating them as a hindrance."],
      ],
      why: "Students cannot enroll until they pass the scales exam, so mastering scales is a prerequisite for the course.",
    },
    {
      scene: "cs-palmer-subway-rents",
      text: "Rising rents in the Palmer district were a ______ of the new subway station, not a reason for building it. Planners chose the site years before prices began to climb, and rents rose only after trains started running.",
      cue: "rents rose only after trains started running",
      side: "second",
      key: "consequence",
      reversed: ["cause", "Planners chose the site before rents climbed, and the text rules out rents as a reason for the station."],
      others: [
        ["symbol", "Nothing suggests the rents stand for the station; the text traces a sequence in time."],
        ["centerpiece", "Rents are not a feature of the station itself; they changed after the station opened."],
      ],
      why: "Rents rose only after the trains started running, so they were a consequence of the station.",
    },
    {
      scene: "cs-osk-river-ferry",
      text: "The Mendel Bridge, completed in 1911, replaced a ferry that had carried travelers across the Osk River for nearly a century. The bridge's ______, the ferry, was retired, and its landing was dismantled the following year.",
      cue: "replaced a ferry",
      side: "first",
      key: "predecessor",
      reversed: ["successor", "The ferry ran for a century before the bridge replaced it, so it came before the bridge, not after."],
      others: [
        ["designer", "A ferry cannot design a bridge; the ferry is what the bridge replaced."],
        ["inspiration", "Nothing suggests the ferry gave anyone the idea for the bridge; the bridge simply replaced it."],
      ],
      why: "The bridge replaced the ferry, which had operated for a century before it, so the ferry was the bridge's predecessor.",
    },
    {
      scene: "cs-heron-leopard-frog",
      text: "In the wetland food web of Cattail Creek, the gray heron is a ______ of the leopard frog: herons wade slowly through the shallows, strike with their long bills, and swallow frogs whole.",
      cue: "swallow frogs whole",
      side: "first",
      key: "predator",
      reversed: ["prey", "The heron eats the frog, so the frog is the prey and the heron the hunter."],
      others: [
        ["host", "A host shelters another organism, but the heron eats the frog."],
        ["companion", "Nothing suggests the heron lives peaceably beside the frog; it eats frogs."],
      ],
      why: "Herons strike at and swallow frogs, so the heron is the frog's predator.",
    },
    {
      scene: "cs-amundsen-exile-trilogy",
      text: "Astrid Amundsen's final trilogy, published between 2008 and 2014, is the ______ of themes she first sketched in her debut novel of 1990: the short book's brief scenes of family exile became the trilogy's central subject.",
      cue: "first sketched in her debut novel",
      side: "second",
      key: "culmination",
      reversed: ["origin", "The themes first appeared in the 1990 novel; the trilogy came decades later and developed them."],
      others: [
        ["parody", "Nothing suggests the trilogy mocks the earlier novel; it develops its themes."],
        ["translation", "The text describes the development of themes over two decades, not a version in another language."],
      ],
      why: "Themes sketched in 1990 became the central subject of the later trilogy, so the trilogy is their culmination.",
    },
    {
      scene: "cs-human-tailbone",
      text: "The human tailbone is a ______ of the tails that our distant primate ancestors used for balance. The tail itself disappeared millions of years ago, but a few small bones fused together at the base of the spine remain.",
      cue: "The tail itself disappeared millions of years ago",
      side: "second",
      key: "vestige",
      reversed: ["precursor", "The tails came first and the tailbone is what remains of them, so the tailbone did not come before the tails."],
      others: [
        ["replica", "The tailbone is not a copy of a tail; it is what is left of one."],
        ["weakness", "Nothing suggests the tailbone harms anyone; the text traces what remains of an ancestral tail."],
      ],
      why: "The tail disappeared but a few bones remain, so the tailbone is a vestige of the ancestral tail.",
    },
    {
      scene: "cs-sandstone-canyon",
      text: "The canyon is the ______ of the river, not its source. Over millions of years, the water cut downward through layer after layer of sandstone, carving out the gorge that it now flows through.",
      cue: "the water cut downward",
      side: "second",
      key: "product",
      reversed: ["creator", "The river carved the canyon, so the canyon did not make the river."],
      others: [
        ["rival", "Nothing suggests competition; the text describes the river shaping the canyon."],
        ["tributary", "A tributary is a stream that feeds a river, but the canyon is a gorge, not a stream."],
      ],
      why: "The river carved the canyon over millions of years, so the canyon is the product of the river.",
    },
    {
      scene: "cs-asher-mills-strike",
      text: "Legislators cited the 1848 strike at the Asher mills again and again during the debates over the Factory Act of 1850. Historians therefore regard the strike as a ______ of the law, which limited the workday to ten hours.",
      cue: "Legislators cited the 1848 strike",
      side: "first",
      key: "catalyst",
      reversed: ["result", "The strike took place in 1848, two years before the law, and helped bring it about."],
      others: [
        ["violation", "The strike happened before the law existed, so it could not break it."],
        ["casualty", "Nothing suggests the law ended or harmed the strike; the strike came first."],
      ],
      why: "The 1848 strike came first and was cited repeatedly in the debates over the 1850 law, so it was a catalyst of the law.",
    },
  ];

  const wicRelationBlank = {
    id: "wic-relation-direction-blank",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "precision",
    difficulty: "Easy",
    title: "Word naming the right side of a relationship",
    recognize:
      "The blank names one side of a relationship (earlier or later, cause or effect, hunter or hunted); the text says which side it is.",
    rubric: { steps: 0, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["reversed-condition"],
    build(t) {
      const topic = t.pick(WIC_RELATION_TOPICS);
      const item = WIC_blankItem(
        { ...topic, wrong: [topic.reversed, ...topic.others] },
        {
          steps: [
            "Identify the two things the blank relates.",
            "Use the text to decide which comes first, causes the other, or acts on the other.",
            "Choose the word for that side of the relationship, not its reverse.",
          ],
          principles: ["Relationship words come in pairs (ancestor and descendant, cause and result); the text's order of events decides which one fits."],
          trap: `Choosing “${topic.reversed[0]},” which names the right relationship but points it the wrong way.`,
          hint: "Which of the two things came first or brought about the other?",
          seconds: 55,
          // The key and the reversed choice must name opposite sides, and the
          // key's side must be the one the topic says the blank refers to.
          check: () =>
            topic.text.includes(topic.cue) &&
            WIC_RELATION_SIDE[topic.key] === topic.side &&
            WIC_RELATION_SIDE[topic.reversed[0]] !== undefined &&
            WIC_RELATION_SIDE[topic.reversed[0]] !== topic.side,
        },
      );
      return item;
    },
  };

  /* --------------------------------- 4. Everyday word in a less common sense */

  // `everyday` is the word's usual sense, offered as a distractor; the text
  // uses a less common sense that the surrounding sentences settle.
  const WIC_UNCOMMON_TOPICS = [
    {
      scene: "cs-circumbinary-planets",
      text: "For decades, most astronomers would not even entertain the idea that a planet could orbit two stars at once, since the stars' shifting pull seemed certain to fling it away. Then a survey telescope detected a planet circling the double star Oren-4 on a stable path.",
      word: "entertain",
      key: "consider",
      everyday: ["amuse", "This is the everyday sense of “entertain,” but refusing to amuse an idea makes no sense; the text is about whether astronomers would take the possibility seriously."],
      others: [
        ["host", "“Entertain” can mean to receive guests, but an idea is not a guest; the sentence concerns whether astronomers would think about the possibility."],
        ["observe", "Astronomers observe the sky, but no one can observe an idea; the sentence is about treating a possibility as worth thinking about."],
      ],
      why: "Astronomers would not “entertain” the idea because they thought such a planet would be flung away, so the word means consider.",
    },
    {
      scene: "cs-lung-decline-arrested",
      text: "The new treatment does not cure the lung disease, and damage already done cannot be undone. In a five-year trial, however, it arrested the decline in patients' breathing capacity, which stayed level for most participants instead of worsening each year.",
      word: "arrested",
      key: "halted",
      everyday: ["detained", "Police arrest people by detaining them, but a decline in breathing cannot be taken into custody; the treatment stopped it."],
      others: [
        ["reversed", "The text says damage cannot be undone and breathing capacity stayed level, so the decline was stopped, not reversed."],
        ["attracted", "An “arresting” sight catches the eye, but the treatment did not draw attention to the decline; it stopped it."],
      ],
      why: "Breathing capacity stayed level instead of worsening, so the treatment “arrested,” or halted, the decline.",
    },
    {
      scene: "cs-essay-prize-letter",
      text: "Imani tells everyone that she no longer cares whether she wins the Kessler essay prize. Her hands betray her, though: she has reread the judges' letter so many times that the paper has gone soft along its folds.",
      word: "betray",
      key: "reveal",
      everyday: ["deceive", "Betraying usually means being disloyal or deceiving, but her hands do not trick her; they show what she is hiding."],
      others: [
        ["abandon", "“Betray” can mean to desert, but her hands have not left her; they give her away."],
        ["steady", "Nothing suggests her hands calm her; the worn letter shows how much the prize matters to her."],
      ],
      why: "Her claim not to care is contradicted by the worn letter in her hands, so her hands “betray,” or reveal, her true feelings.",
    },
    {
      scene: "cs-small-survey-sound",
      text: "Critics questioned the survey's small sample, but the economist Reza Halloran argued that its conclusions were sound, noting that three much larger studies conducted later reached nearly the same results.",
      word: "sound",
      key: "valid",
      everyday: ["audible", "“Sound” most often refers to what we hear, but conclusions cannot be heard; Halloran is defending their reliability."],
      others: [
        ["undamaged", "A sound roof or hull is undamaged, but conclusions are not physical objects; the later studies show they were well founded."],
        ["popular", "Halloran's point is that later studies confirmed the results, not that many people liked them."],
      ],
      why: "Halloran defends the conclusions by noting that larger studies confirmed them, so “sound” means valid.",
    },
    {
      scene: "cs-surviving-canvases",
      text: "Because so few of Renzo Bassi's canvases survived the fire that destroyed his studio, those that remain have appreciated enormously: a painting that sold for 800 dollars in 1950 fetched 2 million dollars at auction last spring.",
      word: "appreciated",
      key: "risen in value",
      everyday: ["won admiration", "To appreciate usually means to value or admire, but the sale prices show the text is about money, not praise."],
      others: [
        ["become understood", "“Appreciate” can mean to understand fully, but the auction figures show a rise in price, not in understanding."],
        ["been restored", "The fire explains why the paintings are rare, but nothing says the surviving canvases were repaired."],
      ],
      why: "A painting's price rose from 800 dollars to 2 million, so the canvases have “appreciated,” or risen in value.",
    },
    {
      scene: "cs-rusk-floating-span",
      text: "The engineer Delphine Brightwater's approach to the Rusk River crossing was novel. Rather than building the bridge outward from both banks, as every earlier crew had done, her team assembled the entire span on shore and floated it into place on barges.",
      word: "novel",
      key: "original",
      everyday: ["fictional", "As a noun, a novel is a book of fiction, but the bridge was real; the text stresses that her method was new."],
      others: [
        ["lengthy", "Novels are often long, but the text describes the method as new, not as slow or long."],
        ["risky", "Floating a span on barges might sound dangerous, but the text emphasizes that no earlier crew had done it, not that it was hazardous."],
      ],
      why: "No earlier crew had built a bridge this way, so her approach was “novel,” or original.",
    },
    {
      scene: "cs-selwyn-harbor-master",
      text: "Until 1874, the harbor master of Port Selwyn set docking fees and awarded repair contracts entirely as he wished. That year, the town council created a board of elected auditors to check his power, requiring its approval for any fee increase or contract over 500 dollars.",
      word: "check",
      key: "restrain",
      everyday: ["inspect", "“Check” often means to examine, and auditors do examine records, but requiring the board's approval shows it was created to limit his power."],
      others: [
        ["mark", "A check can be a mark on a list, which has nothing to do with his authority."],
        ["collect", "Docking fees appear in the text, but the auditors approve fee increases rather than collect money."],
      ],
      why: "The board had to approve his fees and contracts after years in which he acted as he wished, so it was created to “check,” or restrain, his power.",
    },
    {
      scene: "cs-serravel-monastery",
      text: "Built on the highest ridge in the valley, the monastery at Serravel commands a view of three villages and the river that links them, which is why the valley's rulers later used its bell tower as a lookout.",
      word: "commands",
      key: "offers",
      everyday: ["orders", "To command usually means to give orders, but a building cannot order a view; its height gives it a wide one."],
      others: [
        ["demands", "“Command” can mean to require, as in commanding a high price, but the monastery does not require anything of the view."],
        ["blocks", "The monastery's height lets people see the villages from it; nothing suggests it hides the view."],
      ],
      why: "From the highest ridge the monastery looks out over three villages, which is why it served as a lookout, so it “commands,” or offers, a view.",
    },
    {
      scene: "cs-tarrow-county-clerks",
      text: "Because Tarrow County employed only two clerks for 40,000 residents, it struggled to discharge its legal duties, and residents sometimes waited half a year for a building permit or a copy of a deed.",
      word: "discharge",
      key: "fulfill",
      everyday: ["release", "To discharge often means to release someone, as from a hospital or a job, but the county is trying to carry out its duties, not free itself of them."],
      others: [
        ["fire", "Discharging a weapon means firing it, which has no connection to legal duties."],
        ["revise", "Nothing suggests the county wanted to change its duties; it lacked the staff to perform them."],
      ],
      why: "With too few clerks, residents waited months for permits, so the county struggled to “discharge,” or fulfill, its duties.",
    },
    {
      scene: "cs-slow-wheat-yield",
      text: "Although the experimental wheat variety grew more slowly than standard wheat, it yielded nearly a third more grain per acre, a result that surprised even the agronomists who had bred it.",
      word: "yielded",
      key: "produced",
      everyday: ["surrendered", "To yield often means to give way or surrender, but the wheat did not give in to anything; it made more grain."],
      others: [
        ["consumed", "The wheat made grain; it did not use it up."],
        ["delayed", "The wheat grew slowly, but “yielded” describes how much grain it made, not a delay."],
      ],
      why: "The wheat gave nearly a third more grain per acre, so “yielded” means produced.",
    },
    {
      scene: "cs-backward-novel-dialogue",
      text: "The critic Adaeze Mbeki praised the novel's daring structure, which tells its story backward, but found its dialogue flat, with characters who speak in the same even tone whether they are grieving, joking, or furious.",
      word: "flat",
      key: "dull",
      everyday: ["level", "“Flat” most often describes a level surface, but dialogue has no surface; Mbeki means it lacks life and variety."],
      others: [
        ["blunt", "“Flat” can mean direct, as in a flat refusal, but Mbeki objects that the dialogue lacks variety of feeling, not that it is too direct."],
        ["quiet", "An even tone need not be quiet; the complaint is that the characters' feeling never changes."],
      ],
      why: "Characters speak in the same even tone whatever they feel, so the dialogue is “flat,” or dull.",
    },
    {
      scene: "cs-early-start-drug",
      text: "When a follow-up study appeared, the researchers qualified their original claim, now saying that the drug slows memory loss only in patients who begin taking it within a year of diagnosis.",
      word: "qualified",
      key: "limited",
      everyday: ["certified", "Qualifying usually means meeting a requirement or being certified, but the researchers narrowed their claim rather than approving it."],
      others: [
        ["abandoned", "The researchers still say the drug slows memory loss for some patients, so they did not give up the claim."],
        ["repeated", "The claim changed so that it applies only to early starters, so it was not simply restated."],
      ],
      why: "The claim now applies only to patients who start within a year, so the researchers “qualified,” or limited, it.",
    },
  ];

  const wicUncommonSense = {
    id: "wic-uncommon-sense",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "meaning in context",
    difficulty: "Medium",
    title: "Familiar word in a less common sense",
    recognize:
      "A familiar word is used in one of its less common senses; the everyday sense is offered and does not fit the sentence.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["common-meaning", "word-association"],
    build(t) {
      const topic = t.pick(WIC_UNCOMMON_TOPICS);
      const wrong = [topic.everyday, ...topic.others];
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.text },
        stem: WIC_meaningStem(topic.word),
        correct: topic.key,
        wrong,
        explanation: topic.why,
        steps: [
          `Reread the sentence with “${topic.word}” and the sentence around it.`,
          "Set aside the word's everyday meaning and ask what the sentence needs.",
          "Substitute each choice for the word and keep the one that makes the text's point.",
        ],
        principles: ["Many common words have less common senses; the surrounding sentences decide which one a writer means."],
        trap: `Choosing “${topic.everyday[0]},” the everyday meaning of “${topic.word},” without testing it in the sentence.`,
        hint: `Replace “${topic.word}” with each choice. Which one keeps the text's point?`,
        estimatedSeconds: 70,
        // The tested word occurs once, the everyday sense is among the choices,
        // and the key is not simply a word lifted from the passage.
        verify: () =>
          WIC_occurrences(topic.text, topic.word) === 1 &&
          wrong[0] === topic.everyday &&
          WIC_namesWord(topic.everyday[1], topic.word) &&
          wrong.every(([text]) => text !== topic.key) &&
          WIC_occurrences(topic.text, topic.key) === 0,
      };
    },
  };

  /* ---------------------------------------- 5. Blank across a contrast */

  // The blank and the tempting wrong word sit on opposite sides of a contrast
  // ("although", "however", "yet", "instead"). `pivot` marks the turn; `lureCue`
  // is the phrase that makes the lure attractive on the other side.
  const WIC_CONTRAST_TOPICS = [
    {
      scene: "cs-spadefoot-toad-rains",
      text: "Although the Couch's spadefoot toad spends most of the year buried motionless in dry soil, it becomes remarkably ______ once summer storms arrive: within hours of the first heavy rain, males dig their way out and fill the night with calls.",
      pivot: "it becomes",
      lureCue: "buried motionless",
      key: "active",
      lure: ["dormant", "Dormancy describes the toad during the dry months; “Although” sets that against what happens after the storms, when the toads emerge and call."],
      others: [
        ["camouflaged", "Being buried might suggest hiding, but after the rain the toads emerge and call loudly, which draws attention."],
        ["solitary", "The text says nothing about the toads keeping apart; males calling through the night suggests the opposite."],
      ],
      why: "“Although” contrasts the toad's motionless dry months with the storm season, when males dig out and call, so it becomes active.",
    },
    {
      scene: "cs-parenna-mobile-banking",
      text: "Many economists assume that remote rural areas are slow to adopt new financial technology. In the highlands of Parenna, however, farmers have been notably ______ users of mobile banking, which spread there faster than it did in the country's capital.",
      pivot: "however",
      lureCue: "slow to adopt",
      key: "eager",
      lure: ["reluctant", "Reluctance matches the economists' assumption, which “however” sets up to be contradicted by the faster spread in the highlands."],
      others: [
        ["wealthy", "The text compares how quickly the service spread, not how much money the farmers have."],
        ["occasional", "Faster spread than in the capital suggests widespread use, not occasional use."],
      ],
      why: "“However” overturns the assumption that rural areas are slow; mobile banking spread faster in the highlands than in the capital, so farmers were eager users.",
    },
    {
      scene: "cs-mereth-weaving-guilds",
      text: "Historians once portrayed the weaving guilds of medieval Mereth as ______ institutions that resisted every new technique. Account books recovered in 1987, however, show guild members investing heavily in new looms and imported dyes.",
      pivot: "however",
      lureCue: "investing heavily in new looms",
      key: "conservative",
      lure: ["innovative", "Investment in new looms is what the account books reveal; the blank describes the older portrayal, which the account books contradict."],
      others: [
        ["profitable", "Account books suggest money, but the blank must match “resisted every new technique,” which concerns attitudes toward change."],
        ["disorganized", "Resisting new techniques is a matter of attitude, not disorder; nothing suggests the guilds were poorly run."],
      ],
      why: "The blank belongs to the old portrayal of guilds that “resisted every new technique,” so the word is conservative; the account books then contradict it.",
    },
    {
      scene: "cs-marchbank-lullabies",
      text: "Though the violinist Oona Marchbank built her reputation on fiery, lightning-fast performances of Romantic concertos, her new recording of lullabies is strikingly ______, with long, soft notes and unhurried tempos throughout.",
      pivot: "her new recording",
      lureCue: "lightning-fast performances",
      key: "restrained",
      lure: ["virtuosic", "Dazzling speed describes the concerto performances that “Though” sets against the new recording, which is slow and soft."],
      others: [
        ["unfinished", "Nothing suggests the recording is incomplete; the text describes its slow, soft style."],
        ["popular", "The text describes how the recording sounds, not how many people have bought or praised it."],
      ],
      why: "“Though” sets her fiery reputation against the lullabies' long, soft notes and unhurried tempos, so the recording is restrained.",
    },
    {
      scene: "cs-diamond-splitting",
      text: "Diamond is the hardest natural material known, yet it is surprisingly ______: a sharp blow struck at just the right angle can split a gem cleanly in two.",
      pivot: "yet",
      lureCue: "hardest natural material",
      key: "brittle",
      lure: ["durable", "Durability fits “hardest natural material,” but “yet” signals a contrast, and the example shows the gem splitting."],
      others: [
        ["valuable", "Diamonds are valuable, but that fact does not explain why a blow can split one."],
        ["transparent", "Diamonds are clear, but clarity has nothing to do with splitting under a blow."],
      ],
      why: "“Yet” contrasts hardness with the example of a gem splitting from one blow, so diamond is brittle.",
    },
    {
      scene: "cs-brother-navy-studio",
      text: "Everyone in the family expected Graciela to be ______ when her older brother left to join the navy. Instead, she spent that afternoon turning his room into a painting studio, humming as she hung her canvases on his walls.",
      pivot: "Instead",
      lureCue: "humming as she hung",
      key: "miserable",
      lure: ["delighted", "Her humming shows delight, but the blank describes what the family expected, and “Instead” marks her actual behavior as the opposite."],
      others: [
        ["artistic", "She does paint, but the blank describes the family's expectation about how she would feel when her brother left."],
        ["forgetful", "Nothing suggests anyone expected her to forget things; the contrast is between expected sadness and her actual cheer."],
      ],
      why: "“Instead” sets her cheerful humming against the family's expectation, so they expected her to be miserable.",
    },
    {
      scene: "cs-koru-ocean-words",
      text: "Although the Koru language has only a few hundred speakers, its vocabulary for ocean conditions is remarkably ______, with separate words for more than forty kinds of swell, current, and tide.",
      pivot: "its vocabulary",
      lureCue: "only a few hundred speakers",
      key: "rich",
      lure: ["limited", "A small number of speakers might suggest a small vocabulary, but “Although” signals the contrast: more than forty separate terms."],
      others: [
        ["ancient", "The text gives no information about how old the words are."],
        ["musical", "The text is about how many ocean terms exist, not how the words sound."],
      ],
      why: "“Although” sets the few speakers against more than forty ocean terms, so the vocabulary is rich.",
    },
    {
      scene: "cs-aldwin-coal-canal",
      text: "Although the Aldwin Canal took eleven years and twice its planned budget to build, it proved ______ once it opened, repaying its investors within a decade by carrying coal from the inland mines to the coast.",
      pivot: "it proved",
      lureCue: "twice its planned budget",
      key: "profitable",
      lure: ["wasteful", "The cost overruns might suggest waste, but “Although” sets them against the canal repaying its investors within a decade."],
      others: [
        ["short-lived", "Nothing indicates the canal closed early; it carried coal long enough to repay its investors."],
        ["dangerous", "The text never mentions accidents or hazards."],
      ],
      why: "“Although” contrasts the costly construction with the canal repaying investors within a decade, so it proved profitable.",
    },
    {
      scene: "cs-saturn-ringlets",
      text: "Seen through a backyard telescope, Saturn's rings appear ______, like a single flat disk around the planet. Spacecraft images, however, reveal thousands of separate ringlets divided by narrow gaps.",
      pivot: "however",
      lureCue: "thousands of separate ringlets",
      key: "continuous",
      lure: ["fragmented", "Separate ringlets are what spacecraft reveal; the blank describes the backyard view, which “however” contrasts with those images."],
      others: [
        ["colorful", "The text says nothing about the rings' colors; it contrasts how whole or divided they look."],
        ["distant", "Saturn is far away, but the comparison to “a single flat disk” concerns whether the rings look unbroken."],
      ],
      why: "From a backyard the rings look like a single disk, which “however” contrasts with the separate ringlets, so they appear continuous.",
    },
    {
      scene: "cs-halvard-tower-atrium",
      text: "From the street, the Halvard Tower looks ______, its narrow windows set deep in heavy walls of dark stone. Inside, though, a glass-roofed atrium rises through all nine floors and fills every office with daylight.",
      pivot: "Inside, though",
      lureCue: "fills every office with daylight",
      key: "forbidding",
      lure: ["airy", "Airiness describes the interior, which “though” sets against the tower's appearance from the street."],
      others: [
        ["ornate", "Narrow windows and plain dark stone suggest severity, and the text mentions no decoration."],
        ["unfinished", "Nothing suggests the building is incomplete; the text contrasts its outside and inside."],
      ],
      why: "Narrow, deep-set windows in heavy dark walls make the outside look forbidding, which “though” contrasts with the bright interior.",
    },
    {
      scene: "cs-sloth-river-swimming",
      text: "Sloths are usually thought of as ______ animals that spend nearly their whole lives hanging motionless from branches. Yet when a sloth drops from a tree into a river, it swims with surprising ease, moving about three times faster in water than it does on land.",
      pivot: "Yet",
      lureCue: "swims with surprising ease",
      key: "sluggish",
      lure: ["agile", "Agility describes the sloth in the water, but the blank describes how sloths are usually thought of, which “Yet” sets against the swimming."],
      others: [
        ["nocturnal", "The text says nothing about when sloths are active."],
        ["territorial", "The usual view concerns how sloths move, not whether they defend an area."],
      ],
      why: "The usual view pictures sloths hanging motionless, so the word is sluggish; “Yet” then contrasts that view with their ease in water.",
    },
  ];

  const wicContrastBlank = {
    id: "wic-contrast-blank",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "precision",
    difficulty: "Medium",
    title: "Blank on one side of a contrast",
    recognize:
      "A contrast word divides the text into two sides; decide which side the blank is on before choosing, because the tempting word fits the other side.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["opposite-stance", "word-association"],
    build(t) {
      const topic = t.pick(WIC_CONTRAST_TOPICS);
      const pivotAt = topic.text.indexOf(topic.pivot);
      const blankAt = topic.text.indexOf(WIC_BLANK);
      const lureAt = topic.text.indexOf(topic.lureCue);
      return WIC_blankItem(
        { ...topic, wrong: [topic.lure, ...topic.others] },
        {
          steps: [
            "Find the word that signals a contrast and the two ideas it sets against each other.",
            "Decide which side of the contrast the blank belongs to.",
            "Choose the word that fits that side, not the side across the contrast.",
          ],
          principles: ["A contrast word means the two sides point in opposite directions; the blank takes the direction of its own side."],
          trap: `Choosing “${topic.lure[0]},” which fits the other side of the contrast.`,
          hint: "Which side of the contrast is the blank on?",
          seconds: 70,
          // The blank and the lure's cue must fall on opposite sides of the pivot.
          check: () =>
            pivotAt >= 0 && lureAt >= 0 && blankAt >= 0 && (blankAt < pivotAt) !== (lureAt < pivotAt),
        },
      );
    },
  };

  /* -------------------------------------- 6. Figurative word in literary prose */

  // `literal` is the word's literal sense, offered as a distractor.
  const WIC_FIGURATIVE_TOPICS = [
    {
      scene: "cs-kitchen-radio-waltz",
      text: "The old radio on the kitchen shelf had been silent for years. When Emeric finally turned the dial, it coughed, crackled, and then bloomed into a waltz so full and warm that his grandmother set down her knife to listen.",
      expression: "bloomed",
      key: "swelled",
      literal: ["flowered", "Flowering is the literal sense of blooming, but a radio cannot produce flowers; the word describes the music opening out."],
      others: [
        ["faded", "The waltz is full and warm enough to stop his grandmother's work, the reverse of fading."],
        ["stalled", "Coughing and crackling might suggest a breakdown, but the radio went on to play a full waltz."],
      ],
      why: "After coughing and crackling, the radio filled the room with a full, warm waltz, so “bloomed” means swelled.",
    },
    {
      scene: "cs-sisters-quiet-argument",
      text: "For weeks the argument between the sisters simmered. Neither raised her voice or slammed a door, but each answered the other in shorter and shorter sentences, and they stopped sharing the car to work.",
      expression: "simmered",
      key: "continued quietly",
      literal: ["cooked over low heat", "Simmering literally means cooking just below a boil, but an argument is not food; the word describes tension that lasts without erupting."],
      others: [
        ["ended abruptly", "The argument lasted for weeks, as the shrinking sentences show, so it did not end suddenly."],
        ["grew louder", "Neither sister raised her voice, so the argument did not become louder."],
      ],
      why: "The argument went on for weeks without raised voices, showing only in shorter sentences, so it “simmered,” or continued quietly.",
    },
    {
      scene: "cs-snow-path-to-barn",
      text: "Overnight the snow had erased the path to the barn, so Ottilie walked by memory, counting fence posts under her breath and stepping where she knew the flat stones lay beneath the drifts.",
      expression: "erased",
      key: "hidden",
      literal: ["rubbed out", "Erasing literally means rubbing out marks, but the snow covered the path without removing it; the stones still lie beneath."],
      others: [
        ["melted", "Snow can melt, but here it is still deep enough to form drifts; it covered the path."],
        ["widened", "Nothing suggests the path grew wider; Ottilie must find it by memory because it cannot be seen."],
      ],
      why: "Ottilie must find the path by memory because the stones lie beneath the drifts, so the snow “erased,” or hid, the path.",
    },
    {
      scene: "cs-orchestra-third-week",
      text: "The first rehearsal was a disaster, with players rushing ahead and dropping out. By the third week, though, the orchestra had begun to knit together: the violins listened for the cellos, and the horns finally entered on time.",
      expression: "knit together",
      key: "work as one",
      literal: ["make garments", "Knitting literally produces clothing, but the orchestra is making music; the phrase describes the players coordinating."],
      others: [
        ["break apart", "By the third week the players listen to one another and enter on time, the reverse of coming apart."],
        ["compete openly", "The sections are listening for each other, not trying to outdo each other."],
      ],
      why: "The violins listen for the cellos and the horns enter on time, so the orchestra began to “knit together,” or work as one.",
    },
    {
      scene: "cs-acceptance-letter-hallway",
      text: "Anouk read the acceptance letter twice, then a third time, standing perfectly still in the hallway, as if the words might evaporate the moment she looked away from the page.",
      expression: "evaporate",
      key: "vanish",
      literal: ["turn to steam", "Evaporating literally means turning into vapor, but printed words cannot do that; the word expresses her fear of losing the news."],
      others: [
        ["grow louder", "Written words make no sound; her fear is that the good news might disappear."],
        ["multiply", "She fears losing the words, not that more of them will appear."],
      ],
      why: "She keeps rereading as though the news might disappear if she looks away, so “evaporate” means vanish.",
    },
    {
      scene: "cs-arcadi-late-landscapes",
      text: "In her essay on the painter Luis Arcadi, the critic Yewande Oyelaran argues that his late landscapes are haunted by the city he fled in 1962: even his emptiest wheat fields contain the gray geometry of rooftops and chimneys.",
      expression: "haunted by",
      key: "persistently marked by",
      literal: ["inhabited by ghosts of", "Haunting literally involves ghosts, but paintings cannot hold spirits; Oyelaran means traces of the city keep appearing."],
      others: [
        ["deliberately hidden from", "The rooftops and chimneys appear in the fields, so the city is present in the paintings, not concealed from them."],
        ["widely exhibited in", "Oyelaran describes what appears in the paintings, not where they have been shown."],
      ],
      why: "Rooftops and chimneys appear even in his emptiest fields, so the landscapes are “haunted by,” or persistently marked by, the city.",
    },
    {
      scene: "cs-route-nine-bus-line",
      text: "The new Route 9 bus line bridged two neighborhoods that the highway had long divided, and residents of Westvale can now reach jobs in Millbrook in twenty minutes instead of an hour.",
      expression: "bridged",
      key: "connected",
      literal: ["built a bridge between", "No bridge was built; a bus line links the neighborhoods, so the word is used figuratively."],
      others: [
        ["separated", "The highway divided the neighborhoods; the bus line did the reverse."],
        ["enlarged", "The bus line changed travel time, not the size of the neighborhoods."],
      ],
      why: "Residents can now travel between the neighborhoods quickly, so the bus line “bridged,” or connected, them.",
    },
    {
      scene: "cs-judges-read-her-name",
      text: "When the judges finally read her name, Keziah's legs turned to water, and she had to grip the back of the chair in front of her before she could rise and walk to the stage.",
      expression: "turned to water",
      key: "grew weak",
      literal: ["became wet", "Legs that literally turned to water would be wet or liquid, but the phrase describes her legs losing their strength."],
      others: [
        ["began to run", "Legs might suggest running, but she has to grip a chair before she can even stand."],
        ["grew restless", "Restlessness would mean fidgeting; needing support to stand shows weakness."],
      ],
      why: "She has to grip a chair before she can rise, so her legs “turned to water,” or grew weak.",
    },
    {
      scene: "cs-city-from-ferry-dawn",
      text: "From the ferry deck, the city at dawn was only a rough sketch of itself: gray outlines of towers, a smudge where the river met the harbor, and streetlights still burning like pinpricks in paper.",
      expression: "sketch",
      key: "hazy version",
      literal: ["pencil drawing", "A sketch is literally a quick drawing, but the city is not drawn; the word describes how vague it looks at dawn."],
      others: [
        ["detailed map", "Outlines and smudges are the opposite of detail."],
        ["brief summary", "“Sketch” can mean a short description, but the text describes what the city looks like, not an account of it."],
      ],
      why: "Only outlines and smudges of the city are visible at dawn, so it is a “sketch,” or hazy version, of itself.",
    },
    {
      scene: "cs-aldmouth-carrick-rivalry",
      text: "The treaty of 1731 did not end the rivalry between the ports of Aldmouth and Carrick; it merely put the rivalry to sleep for a generation, until a dispute over fishing grounds woke it again in 1760.",
      expression: "put the rivalry to sleep",
      key: "made it dormant",
      literal: ["tired it out", "To put a person to sleep can suggest wearing them out, but the rivalry paused and later “woke,” so it was made inactive for a time."],
      others: [
        ["ended it for good", "The text says the treaty did not end the rivalry and that it revived in 1760."],
        ["hid it from view", "Nothing suggests the rivalry was concealed; it stopped for a generation and then resumed."],
      ],
      why: "The rivalry stopped for a generation and then “woke” again, so the treaty made it dormant.",
    },
    {
      scene: "cs-arla-valley-orchards",
      text: "Each spring, melting snowpack in the Tessin Mountains feeds the Arla River. A dry winter, with little snow, can starve the valley's orchards of the water they need by midsummer, when the river drops to a trickle.",
      expression: "starve",
      key: "deprive",
      literal: ["leave hungry", "Starving literally means lacking food, but the orchards lack water; the word means to deprive them of it."],
      others: [
        ["flood", "A dry winter lowers the river, the reverse of flooding the orchards."],
        ["poison", "Nothing in the text suggests the water is harmful; the problem is that there is too little."],
      ],
      why: "A dry winter leaves too little water for the orchards, so it can “starve,” or deprive, them of water.",
    },
    {
      scene: "cs-nadia-crooked-apology",
      text: "Soraya's apology came out crooked, half a joke and half a confession, and her brother stood in the doorway unable to tell which half he was supposed to answer.",
      expression: "crooked",
      key: "muddled",
      literal: ["bent", "Crooked literally means bent out of shape, but an apology has no shape; the word describes how mixed and unclear it was."],
      others: [
        ["dishonest", "“Crooked” can mean dishonest, but the apology is confusing rather than deceitful; half of it is a sincere confession."],
        ["rehearsed", "Nothing suggests Soraya planned the apology; its jumble of joke and confession suggests the opposite."],
      ],
      why: "Half joke and half confession, the apology left her brother unsure how to respond, so it came out “crooked,” or muddled.",
    },
  ];

  const wicFigurative = {
    id: "wic-figurative-meaning",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "meaning in context",
    difficulty: "Medium",
    title: "Figurative expression in descriptive prose",
    recognize:
      "The word or phrase is used figuratively; its literal meaning is offered and does not describe what the text shows.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["common-meaning", "word-association"],
    build(t) {
      const topic = t.pick(WIC_FIGURATIVE_TOPICS);
      const wrong = [topic.literal, ...topic.others];
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.text },
        stem: WIC_meaningStem(topic.expression),
        correct: topic.key,
        wrong,
        explanation: topic.why,
        steps: [
          `Picture what is literally happening where the text says “${topic.expression}.”`,
          "Notice that the literal meaning cannot apply to what is described.",
          "Choose the meaning that the details around the expression support.",
        ],
        principles: ["A figurative expression borrows the image of its literal meaning; the details around it show which quality of that image is meant."],
        trap: `Choosing “${topic.literal[0]},” the literal meaning, which cannot describe what the text shows.`,
        hint: "What do the details right after the expression show is happening?",
        estimatedSeconds: 75,
        // The expression appears exactly once, and the literal-sense choice is
        // offered alongside a key that the passage does not simply repeat.
        verify: () =>
          WIC_occurrences(topic.text, topic.expression) === 1 &&
          wrong[0] === topic.literal &&
          WIC_namesWord(topic.literal[1], topic.expression) &&
          WIC_occurrences(topic.text, topic.key) === 0 &&
          wrong.every(([text]) => text !== topic.key),
      };
    },
  };

  /* ------------------------------------ 7. Near-synonyms; only one is precise */

  // All four choices share a general meaning; `clues` are the details that the
  // precise word must satisfy together.
  const WIC_CONNOTATION_TOPICS = [
    {
      scene: "cs-vesk-glacier-ice-core",
      text: "The research team's estimate of the Vesk Glacier's age is ______. The authors stress that it rests on a single ice core and could shift by several thousand years once cores from other parts of the glacier are analyzed.",
      clues: ["rests on a single ice core", "could shift"],
      key: "provisional",
      wrong: [
        ["doubtful", "“Doubtful” suggests the authors disbelieve their estimate, but they present it as their current best figure, open to revision."],
        ["arbitrary", "An arbitrary figure has no basis, but this one rests on an ice core."],
        ["controversial", "Controversy implies that others dispute the estimate; the text reports only the authors' own caution."],
      ],
      why: "The authors present the estimate as based on one core and likely to change as more cores are studied, so it is provisional: accepted for now, pending revision.",
    },
    {
      scene: "cs-brenford-sales-tax",
      text: "Most respondents to the Brenford survey were ______ about the proposed sales tax. Many said it would help fund the town's schools but worried in the same breath that it would drive shoppers elsewhere, and nearly half gave a different answer when asked the same question a week later.",
      clues: ["help fund the town's schools", "drive shoppers elsewhere", "different answer"],
      key: "ambivalent",
      wrong: [
        ["indifferent", "Indifference means not caring, but respondents voiced real hopes and worries; their difficulty was holding both at once."],
        ["skeptical", "Skepticism captures the worry about shoppers but ignores that the same respondents expected benefits for schools."],
        ["divided", "“Divided” would mean the town split into opposing camps, but the text says individual respondents held both views themselves."],
      ],
      why: "The same respondents both hoped and worried, and many changed their answers, so they were ambivalent: each held mixed feelings.",
    },
    {
      scene: "cs-orlan-traders-watchmen",
      text: "Letters written by the settlement's founders describe their relationship with the neighboring Orlan traders as ______. The two groups exchanged grain and iron tools every autumn, yet each kept armed watchmen posted whenever the other's boats were in the harbor.",
      clues: ["exchanged grain and iron tools every autumn", "armed watchmen"],
      key: "guarded",
      wrong: [
        ["hostile", "Hostility fits the armed watchmen but ignores the regular, peaceful trade."],
        ["cordial", "Cordiality fits the yearly trade but ignores the armed watchmen, which show mistrust."],
        ["sporadic", "The exchanges happened every autumn, a regular pattern, so “sporadic” misdescribes how often they met."],
      ],
      why: "The groups traded every year but never stopped watching each other, so the relationship was guarded: cooperative but cautious.",
    },
    {
      scene: "cs-castellane-second-movement",
      text: "The critic Wen Adair calls the composer Livia Castellane's use of silence ______. In Adair's view, each pause in the second movement is placed with such care that removing any one of them would alter the character of the whole piece.",
      clues: ["placed with such care", "alter the character of the whole piece"],
      key: "deliberate",
      wrong: [
        ["cautious", "Caution implies fear of making a mistake, but Adair praises the pauses as purposeful, not timid."],
        ["rigid", "Rigidity implies a fault, inflexibility, but Adair's view of the pauses is admiring."],
        ["fussy", "Fussiness is excessive attention to trivial details, but Adair says every pause matters to the whole piece."],
      ],
      why: "Each pause is placed with care and matters to the whole, which Adair admires, so the silence is deliberate: intentional and purposeful.",
    },
    {
      scene: "cs-waning-vaccine-antibodies",
      text: "Trials suggest that the new vaccine's protection is ______. Antibody levels in volunteers peaked about a month after the shot and then declined steadily, so that by the end of the first year most volunteers had lost their immunity.",
      clues: ["declined steadily", "lost their immunity"],
      key: "temporary",
      wrong: [
        ["weak", "The text describes how long protection lasts, not how strong it is at its peak."],
        ["partial", "“Partial” would mean it protects only some people or against only some strains, which the text never discusses."],
        ["inconsistent", "Inconsistency would mean results varied among volunteers, but the text describes the same decline for most of them."],
      ],
      why: "Protection peaked and then faded until most volunteers lost it within a year, so it is temporary.",
    },
    {
      scene: "cs-dented-bumper-father",
      text: "When his daughter showed him the dented bumper, Mr. Adeleke was ______. He did not raise his voice or ask whose fault it was; he walked slowly around the car twice, set his coffee on the hood, and asked her to tell him exactly what had happened, from the beginning.",
      clues: ["did not raise his voice", "asked her to tell him exactly what had happened"],
      key: "composed",
      wrong: [
        ["indifferent", "Walking around the car twice and asking for the whole story show that he cares; his calm is controlled, not uninterested."],
        ["furious", "He never raises his voice or blames anyone, so nothing shows anger."],
        ["bewildered", "He asks what happened, but his slow, orderly actions show control rather than confusion."],
      ],
      why: "He stays calm and orderly while attending closely to what happened, so he was composed, not indifferent.",
    },
    {
      scene: "cs-stanwick-mill-closure",
      text: "Economists describe Stanwick's recovery after its paper mill closed as ______. Employment returned to its earlier level within three years, but the new jobs, mostly in warehouses and retail, paid on average 20 percent less than the mill jobs had.",
      clues: ["Employment returned to its earlier level", "20 percent less"],
      key: "partial",
      wrong: [
        ["complete", "Employment did return, but wages stayed 20 percent lower, so the recovery was not complete."],
        ["illusory", "An illusory recovery would be no recovery at all, but employment genuinely returned to its earlier level."],
        ["sluggish", "Three years is not described as slow; the problem the text identifies is lower pay, not speed."],
      ],
      why: "Jobs came back but paid 20 percent less, so the recovery was partial: real in one respect, incomplete in another.",
    },
    {
      scene: "cs-queen-ysolde-salt-tax",
      text: "Historians describe Queen Ysolde's reforms as ______. She abolished the hated salt tax in 1422, but she left untouched the courts and landholding rules that had allowed nobles to impose the tax in the first place.",
      clues: ["abolished the hated salt tax", "left untouched the courts"],
      key: "limited",
      wrong: [
        ["radical", "Abolishing one tax while leaving the underlying system in place is the opposite of a sweeping change."],
        ["cosmetic", "“Cosmetic” implies the changes were merely for show, but abolishing the salt tax was a real change."],
        ["gradual", "The text describes how far the reforms went, not how slowly they were carried out."],
      ],
      why: "She made one real change but left the system behind it intact, so the reforms were limited: genuine but narrow.",
    },
    {
      scene: "cs-karin-vos-portraits",
      text: "The painter Karin Vos's late portraits are notably ______. Where her early canvases crowd every inch with jewelry, drapery, and patterned wallpaper, the late portraits show a single figure against a plain gray wall, rendered with obvious care.",
      clues: ["a single figure against a plain gray wall", "rendered with obvious care"],
      key: "spare",
      wrong: [
        ["empty", "An empty canvas would contain nothing, but each late portrait still shows a carefully painted figure."],
        ["bleak", "“Bleak” suggests despair, but the text describes simplicity of composition, not a gloomy mood."],
        ["unfinished", "“Unfinished” implies the work was abandoned, but the figures are rendered with obvious care, so the plainness is deliberate."],
      ],
      why: "The late portraits hold only a carefully painted figure against a plain wall, so they are spare: deliberately simple.",
    },
    {
      scene: "cs-ardith-beetle-surveys",
      text: "Surveyors were slow to notice the Ardith beetle's decline because it was so ______. Its numbers fell by roughly 3 percent each year for four decades, never dropping sharply enough in any single year to cause alarm, yet the population today is less than a third of its 1980 size.",
      clues: ["roughly 3 percent each year for four decades", "less than a third"],
      rate: 0.03,
      years: 40,
      key: "gradual",
      wrong: [
        ["slight", "Any one year's drop was small, but the total loss, more than two-thirds of the population, is anything but slight."],
        ["sporadic", "The numbers fell every year, not in scattered episodes."],
        ["abrupt", "No single year brought a sharp drop, so the decline was not sudden."],
      ],
      why: "Small yearly drops added up over forty years to a loss of more than two-thirds, so the decline was gradual, not slight.",
    },
    {
      scene: "cs-flood-plan-committee",
      text: "The committee's report on the city's flood-control plan was ______. It identified three weaknesses in the plan, praised its overall goals, and proposed a specific fix for each weakness it found.",
      clues: ["identified three weaknesses", "proposed a specific fix"],
      key: "constructive",
      wrong: [
        ["scathing", "The report praised the plan's goals, so it was not harshly critical."],
        ["lenient", "The report pointed out three weaknesses, so it did not let the plan off easily."],
        ["noncommittal", "The report took clear positions, praising some parts and proposing fixes for others."],
      ],
      why: "The report named weaknesses but praised the goals and offered a fix for each problem, so it was constructive.",
    },
  ];

  const wicConnotationBlank = {
    id: "wic-connotation-blank",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "precision",
    difficulty: "Hard",
    title: "Near-synonyms where only one fits every detail",
    recognize:
      "The four choices share a general meaning; each wrong one carries a connotation or scope that one detail in the text rules out.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["extreme-language", "too-narrow"],
    build(t) {
      const topic = t.pick(WIC_CONNOTATION_TOPICS);
      return WIC_blankItem(topic, {
        steps: [
          "List every detail the text gives about the blank, not just the first one.",
          "For each choice, name what it adds: strength, attitude, or scope.",
          "Keep the word whose meaning fits all the details and adds nothing the text contradicts.",
        ],
        principles: ["Near-synonyms differ in strength, attitude, or scope; the precise word is the one every detail in the text supports."],
        trap: "Choosing a word that fits one detail of the text while ignoring another.",
        hint: "Each wrong choice fits only part of what the text says. Which one fits all of it?",
        seconds: 95,
        // Every clue the key must satisfy is in the text after the blank; where
        // the topic gives a yearly rate, recompute the compounded loss.
        check: () => {
          const blankAt = topic.text.indexOf(WIC_BLANK);
          const cluesAfter = topic.clues.every((clue) => topic.text.indexOf(clue) > blankAt);
          if (!topic.rate) return cluesAfter;
          const remaining = Math.pow(1 - topic.rate, topic.years);
          return cluesAfter && remaining < 1 / 3 && topic.rate < 0.05;
        },
      });
    },
  };

  /* ------------------------------ 8. Word whose two senses are opposites */

  // Each word has two opposite senses (sanction: approve or penalize). The
  // text first makes the wrong sense attractive; a later detail (`resolver`)
  // settles it.
  const WIC_CONTRONYM_TOPICS = [
    {
      scene: "cs-canal-street-market",
      text: "For a decade, vendors had run a Friday market on Ashford's Canal Street without permits, and shopkeepers repeatedly complained to the city council. In 1921 the council finally voted to sanction the market, granting the vendors the right to set up stalls and requiring the city to light the street on market nights.",
      word: "sanction",
      resolver: "granting the vendors the right",
      key: "approve",
      opposite: ["penalize", "“Sanction” can mean to punish, and the complaints make that reading tempting, but the council granted the vendors rights and lit the street for them."],
      others: [
        ["relocate", "Nothing suggests the market was moved; the city agreed to light the same street on market nights."],
        ["investigate", "The council's vote granted rights; it did not open an inquiry."],
      ],
      why: "The vote gave vendors the right to set up stalls and provided lighting, so the council voted to “sanction,” or approve, the market.",
    },
    {
      scene: "cs-courthouse-east-wing",
      text: "The report on the new courthouse attributes its eight-month delay to an oversight by the city's building department. According to the report, the department simply neglected to send the contractor the revised plans for the east wing, so crews built the wing to outdated specifications.",
      word: "oversight",
      resolver: "neglected to send",
      key: "omission",
      opposite: ["supervision", "“Oversight” can mean supervision, which building departments provide, but the report says the department failed to send the plans."],
      others: [
        ["inspection", "Inspections are a building department's job, but the delay came from plans never sent, not from an inspection."],
        ["regulation", "The report blames a missing set of plans, not a rule."],
      ],
      why: "The department neglected to send the revised plans, so the “oversight” was an omission, a failure to act.",
    },
    {
      scene: "cs-gannet-point-lighthouse",
      text: "Salt spray and gales have battered the Gannet Point lighthouse since it was built in 1822. Yet the tower has weathered two centuries of Atlantic storms remarkably well: engineers who inspected it last year found its granite walls nearly as sound as the day they were laid.",
      word: "weathered",
      resolver: "nearly as sound as the day they were laid",
      key: "withstood",
      opposite: ["been worn down by", "Weathered stone is stone worn by exposure, and the battering suggests that sense, but engineers found the walls nearly as sound as when built."],
      others: [
        ["recorded", "Lighthouse keepers may log storms, but the text is about the condition of the tower's walls."],
        ["warned of", "Lighthouses warn ships of danger, but the text is about how the tower itself held up."],
      ],
      why: "The walls are nearly as sound as when they were built, so the tower “weathered,” or withstood, the storms.",
    },
    {
      scene: "cs-window-frame-prints",
      text: "Before the lab could compare the burglar's fingerprints with its records, a technician had to dust the window frame, brushing fine black powder across the glass until the ridges of each print stood out clearly.",
      word: "dust",
      resolver: "brushing fine black powder",
      key: "apply powder to",
      opposite: ["wipe clean", "Dusting usually means removing dust, but wiping the frame would destroy the prints; the technician adds powder to reveal them."],
      others: [
        ["examine closely", "Close examination may follow, but the text describes brushing powder onto the glass."],
        ["seal off", "Sealing off a scene is police work, but the text describes what the technician did to the frame itself."],
      ],
      why: "The technician brushes powder onto the glass to make prints visible, so to “dust” the frame is to apply powder to it.",
    },
    {
      scene: "cs-schooner-mooring-lines",
      text: "With the storm less than an hour away, the crew of the schooner Margaret Ellen worked quickly to make the mooring lines fast, and the ship rode out the night at the dock without drifting so much as a foot.",
      word: "fast",
      resolver: "without drifting so much as a foot",
      key: "secure",
      opposite: ["quick", "“Fast” usually means quick, and the crew was hurrying, but lines that keep a ship from drifting are firmly fixed, not speedy."],
      others: [
        ["loose", "Loose lines would let the ship drift, but it did not move a foot."],
        ["tangled", "Nothing suggests the lines were knotted; what matters is that they held."],
      ],
      why: "The ship did not drift at all overnight, so the crew made the lines “fast,” or secure.",
    },
    {
      scene: "cs-gray-colt-thunder",
      text: "At the first crack of thunder, the gray colt bolted. The stable hands had not yet latched the paddock gate, and it took them until dusk to find the colt grazing calmly at the far end of the valley.",
      word: "bolted",
      resolver: "far end of the valley",
      key: "ran off",
      opposite: ["was locked in", "To bolt a door is to lock it, and the gate is mentioned, but the gate was unlatched and the colt ended up at the far end of the valley."],
      others: [
        ["froze in place", "Freezing is a common reaction to thunder, but the colt was found far away, so it did not stay put."],
        ["reared up", "Rearing is another reaction to fright, but it would not carry the colt to the far end of the valley."],
      ],
      why: "The colt was found at the far end of the valley hours later, so it “bolted,” or ran off.",
    },
    {
      scene: "cs-skerrin-island-dialect",
      text: "Although the dialect spoken on the Skerrin Islands has absorbed many new words over the centuries, it still cleaves to the old grammar, keeping verb endings that mainland speakers dropped long ago.",
      word: "cleaves",
      resolver: "keeping verb endings",
      key: "adheres",
      opposite: ["splits from", "“Cleave” can mean to split, and the talk of change makes that tempting, but the dialect keeps the old verb endings."],
      others: [
        ["borrows", "The dialect absorbed new words, but the grammar in question is its own old grammar, which it keeps."],
        ["simplifies", "Keeping verb endings that other speakers dropped is the reverse of simplifying the grammar."],
      ],
      why: "The dialect keeps verb endings that others dropped, so it “cleaves,” or adheres, to the old grammar.",
    },
    {
      scene: "cs-blue-hollow-mine",
      text: "When the Blue Hollow silver mine closed in 1884, most of the town's fifty families packed their wagons and headed west. By 1890 only six families were left, and they supported themselves by raising sheep on the hills above the empty mine.",
      word: "left",
      resolver: "raising sheep on the hills above the empty mine",
      key: "remaining",
      opposite: ["departed", "“Left” can mean departed, and the families heading west invite that reading, but these six stayed and raised sheep near the mine."],
      others: [
        ["prosperous", "Nothing suggests the six families were rich; they got by raising sheep."],
        ["mining", "The mine had closed six years earlier; the families raised sheep instead."],
      ],
      why: "The six families stayed and raised sheep above the mine, so they were “left,” or remaining, in the town.",
    },
    {
      scene: "cs-dunleigh-harvest-floats",
      text: "In the week before Dunleigh's harvest parade, volunteers trimmed every float. By Saturday morning, paper flowers, ribbons, and strings of small lanterns covered each one so completely that no bare wood could be seen.",
      word: "trimmed",
      resolver: "paper flowers, ribbons, and strings of small lanterns",
      key: "decorated",
      opposite: ["cut back", "Trimming can mean cutting away, but by Saturday the floats were covered with flowers, ribbons, and lanterns, not reduced."],
      others: [
        ["inspected", "Nothing suggests the volunteers were checking the floats for safety or quality."],
        ["repaired", "The text describes additions for display, not fixing damage."],
      ],
      why: "The floats ended up covered with flowers, ribbons, and lanterns, so the volunteers “trimmed,” or decorated, them.",
    },
    {
      scene: "cs-onwuachi-reviews-debut",
      text: "The critic Beatrix Onwuachi tempered her praise for Teo Lindgren's debut novel. She called its opening chapters brilliant, but she found the ending rushed and several minor characters too thinly drawn to be believable.",
      word: "tempered",
      resolver: "found the ending rushed",
      key: "moderated",
      opposite: ["strengthened", "Tempering steel makes it harder, which might suggest intensified praise, but Onwuachi's criticisms of the ending hold her praise back."],
      others: [
        ["withdrew", "She still calls the opening chapters brilliant, so she did not take back her praise."],
        ["repeated", "The text shows her qualifying her praise with criticism, not saying the same thing again."],
      ],
      why: "She balanced praise for the opening with criticism of the ending and characters, so she “tempered,” or moderated, her praise.",
    },
    {
      scene: "cs-brayton-mill-injunction",
      text: "Downstream anglers had long blamed the Brayton textile mill for trout die-offs in the Carrack River. In 2016 a judge enjoined the mill from releasing heated water into the river until an environmental review was complete, and the mill installed cooling ponds within the year.",
      word: "enjoined",
      resolver: "from releasing heated water",
      key: "barred",
      opposite: ["ordered", "“Enjoin” can mean to command, but “enjoined … from releasing” means the judge forbade the release."],
      others: [
        ["permitted", "The mill had to install cooling ponds, so the judge stopped the releases rather than allowing them."],
        ["fined", "The anglers blamed the mill, but the text describes a prohibition, not a penalty."],
      ],
      why: "The judge's order kept the mill from releasing heated water until a review, so “enjoined” means barred.",
    },
    {
      scene: "cs-grandmother-cherry-jam",
      text: "Lia's grandmother had seeded two pounds of cherries before breakfast. By the time Lia came downstairs, the fruit sat halved and glistening in a copper pot, and a chipped bowl beside it was heaped with small, clean pits.",
      word: "seeded",
      resolver: "heaped with small, clean pits",
      key: "pitted",
      opposite: ["planted", "“Seed” can mean to plant seeds, but the cherries are in a pot, and the bowl of pits shows the seeds were taken out."],
      others: [
        ["picked", "Nothing says where the cherries came from; the bowl of pits shows what she did to them."],
        ["washed", "Washing is a common step in cooking, but it would not produce a bowl of pits."],
      ],
      why: "A bowl heaped with pits sits beside the halved cherries, so she “seeded,” or pitted, them.",
    },
  ];

  const wicContronym = {
    id: "wic-opposite-senses",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "meaning in context",
    difficulty: "Hard",
    title: "Word with two opposite senses",
    recognize:
      "The word has two opposite senses; the opening makes the wrong one attractive, and a later detail settles which is meant.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["opposite-stance", "common-meaning", "word-association"],
    build(t) {
      const topic = t.pick(WIC_CONTRONYM_TOPICS);
      const wrong = [topic.opposite, ...topic.others];
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.text },
        stem: WIC_meaningStem(topic.word),
        correct: topic.key,
        wrong,
        explanation: topic.why,
        steps: [
          `Notice that “${topic.word}” can mean two opposite things.`,
          "Read past the word to the detail that shows what actually happened.",
          "Choose the sense that detail requires, even if the opening favored the other one.",
        ],
        principles: ["Some words carry opposite senses; decide between them from what the text says happened, not from the first impression."],
        trap: `Choosing “${topic.opposite[0]},” the opposite sense of “${topic.word},” which the opening of the text makes attractive.`,
        hint: `What does the text say happened after “${topic.word}”?`,
        estimatedSeconds: 90,
        // The word occurs once, the settling detail comes after it, and the
        // opposite sense is among the choices.
        verify: () => {
          const wordAt = WIC_indexOfWord(topic.text, topic.word);
          return WIC_occurrences(topic.text, topic.word) === 1 &&
            topic.text.indexOf(topic.resolver) > wordAt &&
            wrong[0] === topic.opposite &&
            WIC_namesWord(topic.opposite[1], topic.word) &&
            wrong.every(([text]) => text !== topic.key);
        },
      };
    },
  };

  return [
    wicRestatementBlank,
    wicMagnitudeBlank,
    wicRelationBlank,
    wicUncommonSense,
    wicContrastBlank,
    wicFigurative,
    wicConnotationBlank,
    wicContronym,
  ];
});
