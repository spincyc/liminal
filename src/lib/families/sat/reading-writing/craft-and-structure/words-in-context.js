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
        ["fine-grained", "The proposal left specific locations undecided, the opposite of working out every detail."],
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
      text: "In the wetland food web of Cattail Creek, the great blue heron is a ______ of the leopard frog: herons wade slowly through the shallows, strike with their long bills, and swallow frogs whole.",
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
      text: "Legislators cited the 1848 strike at the Asher mills again and again during the debates over the state's Mill Hours Act of 1850. Historians therefore regard the strike as a ______ of the law, which limited the workday to ten hours.",
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
      scene: "cs-varne-valley-terraces",
      text: "For decades, most historians of the Varne Valley would not even entertain the idea that its stone farming terraces were older than the valley's first written records, since no charter or chronicle mentions them. Then charcoal buried beneath the lowest terrace walls was radiocarbon dated to about 900 BCE.",
      word: "entertain",
      key: "consider",
      everyday: ["amuse", "This is the everyday sense of “entertain,” but refusing to amuse an idea makes no sense; the text is about whether historians would take the possibility seriously."],
      others: [
        ["host", "“Entertain” can mean to receive guests, but an idea is not a guest; the sentence concerns whether historians would think about the possibility."],
        ["observe", "Historians could see the terraces themselves, but no one can observe an idea; the sentence is about treating a possibility as worth thinking about."],
      ],
      why: "Historians would not “entertain” the idea because no written record mentioned the terraces, so the word means consider.",
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
      everyday: ["won wide admiration", "To appreciate usually means to value or admire, but the sale prices show the text is about money, not praise."],
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
      everyday: ["horizontal", "“Flat” most often describes a horizontal surface, but dialogue has no surface; Mbeki means it lacks life and variety."],
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
      text: "Seen through a small backyard telescope, Saturn's rings appear ______, like a single flat disk around the planet. Spacecraft images, however, reveal thousands of separate ringlets divided by narrow gaps.",
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
      literal: ["produced flowers", "Producing flowers is the literal sense of blooming, but a radio cannot do that; the word describes the music opening out and filling the room."],
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
        ["fall to pieces", "By the third week the players listen to one another and enter on time, the reverse of coming apart."],
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
    difficulty: "Easy",
    title: "Figurative expression in descriptive prose",
    recognize:
      "The word or phrase is used figuratively; its literal meaning is offered and does not describe what the text shows.",
    // Easy: the literal sense offered as the lure cannot describe the scene,
    // so one look at the surrounding detail settles the item.
    rubric: { steps: 0, concept: 1, interpretation: 1, distractors: 0, abstraction: 0, synthesis: 0, trap: 1 },
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
        estimatedSeconds: 55,
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
        ["polarized", "“Polarized” would mean respondents split into two opposing camps, but the text says the same respondents held both views at once."],
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
    difficulty: "Medium",
    title: "Near-synonyms where only one fits every detail",
    recognize:
      "The four choices share a general meaning; each wrong one carries a connotation or scope that one detail in the text rules out.",
    // Medium: the keys are everyday words (temporary, partial, limited), and
    // each distractor clashes with one stated detail.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 1 },
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
        seconds: 75,
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
      opposite: ["remove dust from", "Dusting usually means removing dust, but wiping the frame would destroy the prints; the technician adds powder to reveal them."],
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
        trap: `Choosing “${topic.opposite[0]},” the opposite sense of “${topic.word},” which fits the word on its own but not what the text goes on to say.`,
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

  /* ------------------ 9. High-register word for the standing of a claim */

  // Dense academic prose; the blank names how well a claim, inference, or body
  // of evidence stands. The choices are all advanced evaluative words that
  // differ along separate dimensions (strength: tenuous; defensibility:
  // untenable; ambiguity: equivocal; scope: circumscribed; time: provisional;
  // basis: conjectural; genuineness: spurious; surface plausibility: specious;
  // relevance: salient) or in degree, so the precise word is the one whose
  // dimension and degree the details establish. Every key also serves as a
  // distractor in other topics, so "the most impressive word" is no guide.
  const WIC_EVALUATION_WORDS = new Set([
    "equivocal", "tenuous", "untenable", "circumscribed", "provisional", "conjectural",
    "specious", "corroborated", "salient", "incontrovertible", "spurious", "anomalous",
    "anachronistic", "expansive", "superseded", "impugned", "peripheral", "tacit", "emblematic",
  ]);

  const WIC_EVALUATION_TOPICS = [
    {
      scene: "cs-corran-tutoring-evaluation",
      text: "Advocates of expanding the Corran tutoring program cite its 2019 evaluation as proof that the program raises test scores, but the evaluation's own findings are ______. Scores rose at four of the eight participating schools and fell at the other four, and the evaluators conclude that their data are consistent both with a modest benefit and with no benefit at all.",
      clues: ["consistent both with a modest benefit and with no benefit at all"],
      key: "equivocal",
      wrong: [
        ["untenable", "“Untenable” would mean the findings cannot be defended, but nothing calls the data themselves into question; the problem is that they point two ways."],
        ["anomalous", "“Anomalous” would mean the findings depart from an expected pattern, but the text names no expected pattern; it says the results support two readings."],
        ["incontrovertible", "“Incontrovertible” is the advocates' view of the evaluation as proof, but results split four and four that fit both a benefit and none are far from beyond dispute."],
      ],
      why: "Scores rose at half the schools and fell at the other half, and the evaluators say their data fit both a modest benefit and none, so the findings are equivocal: open to more than one interpretation.",
      trap: "Choosing “incontrovertible,” the advocates' view of the evaluation, instead of a word for what the evaluators themselves report.",
      hint: "What do the evaluators say their data are consistent with?",
    },
    {
      scene: "cs-vessaro-ledger-uprising",
      text: "The historian Rosa Menezes's claim that Vessaro's merchants financed the uprising of 1791 rests on a single ledger entry recording a payment “for the cause” to an unnamed recipient. Menezes herself concedes that the phrase could refer to a parish fund or a relief society, so the documentary link between the merchants and the uprising remains ______ at best.",
      clues: ["rests on a single ledger entry", "could refer to a parish fund"],
      key: "tenuous",
      wrong: [
        ["untenable", "“Untenable” would mean the link has been shown to be indefensible, but nothing disproves it; and “at best” introduces the most that can be said for the link, not a word for its collapse."],
        ["corroborated", "A single entry that may refer to something else confirms nothing; a corroborated link would need independent supporting evidence, which the text says is lacking."],
        ["circumscribed", "“Circumscribed” describes a claim limited in scope, but the problem here is how thin the evidence is, not how far the claim extends."],
      ],
      why: "The link rests on one ambiguous entry that Menezes admits could mean something else, so it is tenuous: very weak, though not disproved.",
      trap: "Choosing “untenable,” which goes further than the text: a thinly supported claim is weak, not refuted.",
      hint: "How much evidence supports the link, and does anything contradict it?",
    },
    {
      scene: "cs-velt-basin-salt-beds",
      text: "For much of the twentieth century, textbooks described the salt flats of the Velt Basin as the floor of a single ancient lake that had filled once and then slowly evaporated. That account became ______ when drilling revealed two separate salt beds divided by a thick layer of river gravel, showing that the basin had dried out, flooded again, and dried out a second time.",
      clues: ["filled once", "two separate salt beds"],
      key: "untenable",
      wrong: [
        ["tenuous", "“Tenuous” would mean the account had become thinly supported, but two salt beds separated by gravel directly contradict a lake that filled only once."],
        ["provisional", "“Provisional” describes a view accepted for now while more evidence is awaited, but the drilling did not leave the account awaiting review; it contradicted it."],
        ["corroborated", "Evidence that the basin flooded at least twice contradicts, rather than confirms, a lake that filled once."],
      ],
      why: "An account of a lake that filled only once cannot survive evidence that the basin dried out and flooded again, so it became untenable: impossible to defend.",
      trap: "Choosing “tenuous,” which understates the problem: the drilling does not merely weaken the single-lake account, it contradicts it.",
      hint: "Compare what the textbook account says about the lake with what the drilling showed.",
    },
    {
      scene: "cs-tamsin-bay-marsh-nitrogen",
      text: "The authors of the Tamsin Bay wetlands study are careful to keep their conclusion ______. They report that restored marshes removed more nitrogen from farm runoff than unrestored ones did, but only in the three coastal counties they sampled and only during the growing season, and they explicitly decline to extend the finding to inland wetlands or to the winter months.",
      clues: ["only in the three coastal counties", "decline to extend the finding"],
      key: "circumscribed",
      wrong: [
        ["equivocal", "“Equivocal” would mean the conclusion points two ways, but the authors report a clear result; what they limit is where and when it applies."],
        ["conjectural", "“Conjectural” describes a conclusion resting on guesswork, but this one rests on measurements taken in three counties."],
        ["expansive", "“Expansive” is the reverse of what the authors do: they refuse to extend the finding beyond the places and season they studied."],
      ],
      why: "The authors confine the finding to three counties and one season and refuse to extend it further, so they keep the conclusion circumscribed: restricted in scope.",
      trap: "Choosing “equivocal” because the authors sound cautious, although their caution concerns the reach of a clear result, not its meaning.",
      hint: "What do the words “only” and “decline to extend” do to the authors' conclusion?",
    },
    {
      scene: "cs-orvel-manuscripts-dating",
      text: "The cataloging committee regards the new dating of the Orvel manuscripts as ______. The dates will guide every entry in the catalog for now, but the committee has scheduled a review for 2027, when results from a second laboratory's radiocarbon tests are expected, and it has told catalogers to keep the older dates in a note beside each entry.",
      clues: ["for now", "scheduled a review"],
      key: "provisional",
      wrong: [
        ["incontrovertible", "A committee that schedules a review and keeps the older dates on file does not treat the new ones as beyond dispute."],
        ["circumscribed", "“Circumscribed” would mean the dating applies only within narrow limits, but it guides every entry in the catalog; what is limited is how long it will stand unreviewed."],
        ["spurious", "“Spurious” would mean the committee thinks the dates are false, but it has adopted them to guide the catalog."],
      ],
      why: "The committee uses the new dates for now while planning a review and keeping the old dates at hand, so it regards them as provisional: accepted until they can be confirmed.",
      trap: "Choosing “circumscribed,” which mistakes a limit on how long the dating is trusted for a limit on how widely it applies.",
      hint: "What has the committee arranged for 2027, and why keep the older dates?",
    },
    {
      scene: "cs-danza-portrait",
      text: "No portrait of the composer Aurelio Danza survives from his lifetime, and none of his contemporaries left a description of his appearance. The familiar image of him, stooped and bearded with a quill in hand, derives from a painting made seventy years after his death, and the painter's depiction, however affecting, is entirely ______.",
      clues: ["No portrait", "none of his contemporaries left a description"],
      key: "conjectural",
      wrong: [
        ["anachronistic", "“Anachronistic” would mean the image contains details out of their proper period, but the text faults the painting for resting on no evidence; being painted later does not make an image anachronistic."],
        ["corroborated", "No contemporary described Danza's appearance, so nothing could confirm the painter's depiction."],
        ["equivocal", "“Equivocal” means open to two readings, but the image itself is perfectly clear; the problem is that nothing supports it."],
      ],
      why: "With no portrait and no description to work from, the painter could only imagine Danza's appearance, so the depiction is conjectural: based on guesswork.",
      trap: "Choosing “anachronistic” because the painting came seventy years later, although the text's point is that it rests on no evidence at all.",
      hint: "What evidence of Danza's appearance could the painter have drawn on?",
    },
    {
      scene: "cs-tarn-highway-growth",
      text: "At first glance, the argument that a new highway caused the Tarn Valley's population boom seems persuasive, since towns along the route grew by a third in the decade after it opened. The argument is ______, however: towns in the neighboring valley, which the highway never reached, grew just as quickly over the same decade, and residents of both valleys cite the same reason for moving there, an expanding mining industry.",
      clues: ["seems persuasive", "grew just as quickly"],
      key: "specious",
      wrong: [
        ["incontrovertible", "The argument seems beyond dispute only “at first glance”; “however” introduces evidence that undercuts it."],
        ["equivocal", "“Equivocal” would mean the argument is ambiguous, but it is clear enough; the neighboring valley's equal growth shows that it is wrong."],
        ["circumscribed", "“Circumscribed” would mean the argument is limited in scope, but the problem is that its explanation fails, not that it covers too little."],
      ],
      why: "The argument looks persuasive but fails once the neighboring valley's equal growth and the shared mining cause are considered, so it is specious: plausible on the surface but wrong.",
      trap: "Choosing “incontrovertible,” the impression the argument makes at first glance, rather than what the evidence after “however” shows.",
      hint: "How does the argument seem at first, and what does the evidence after “however” show?",
    },
    {
      scene: "cs-skerra-head-whirlpool",
      text: "Sailors' accounts from the 1850s describe a whirlpool that formed off Skerra Head only during the strongest spring tides, but historians long dismissed the reports as folklore. The accounts have since been ______ by computer models of the local tides, which show that currents at the headland reach whirlpool-forming speeds only under exactly the conditions the sailors described.",
      clues: ["only during the strongest spring tides", "exactly the conditions the sailors described"],
      key: "corroborated",
      wrong: [
        ["superseded", "“Superseded” would mean the models replaced the accounts with something better, but the models agree with the sailors; they confirm the accounts rather than displace them."],
        ["circumscribed", "The models do not narrow the accounts: the sailors already said the whirlpool formed only on the strongest spring tides, and the models match that condition exactly."],
        ["impugned", "“Impugned” would mean the models called the accounts into question, the reverse of what they did."],
      ],
      why: "Tidal models independently match the conditions the sailors reported, so the accounts have been corroborated: confirmed by separate evidence.",
      trap: "Choosing “circumscribed” because the models apply “only under exactly the conditions,” although those were the sailors' own conditions.",
      hint: "Compare what the models show with what the sailors reported.",
    },
    {
      scene: "cs-treaty-drafts-river-clause",
      text: "The two surviving drafts of the treaty differ in dozens of small ways, including spelling, punctuation, and the order in which the witnesses' names appear. For historians trying to explain why the negotiations collapsed, however, only one difference is ______: the later draft omits the clause guaranteeing each side access to the river, the very issue over which the talks broke down.",
      clues: ["dozens of small ways", "the very issue over which the talks broke down"],
      key: "salient",
      wrong: [
        ["peripheral", "“Peripheral” describes the dozens of small differences; the omitted river clause is the one that bears directly on why the talks failed."],
        ["spurious", "“Spurious” would mean the difference is not genuine, but the later draft really does omit the clause."],
        ["tacit", "“Tacit” means understood without being stated, but the missing clause is a documented difference between the drafts, not an unspoken understanding."],
      ],
      why: "Among many trivial differences, only the missing river clause bears on why the talks collapsed, so it is the salient one: the difference that stands out as relevant.",
      trap: "Choosing “tacit” because the clause is missing, which confuses an omission from a document with something understood without being said.",
      hint: "Which difference matters for explaining the collapse, and how does it compare with the others?",
    },
    {
      scene: "cs-pellan-wreck-jars",
      text: "Scholars had long debated whether the ceramic workshop at Pellan sold its wares overseas. The question was settled in 2021, when divers recovered more than four hundred jars bearing the workshop's stamp from a wreck off a distant island, still sealed in the ship's hold beneath cargo labels naming Pellan as their port of origin. The evidence that Pellan's jars traveled overseas is now ______.",
      clues: ["The question was settled", "bearing the workshop's stamp"],
      key: "incontrovertible",
      wrong: [
        ["tenuous", "Four hundred stamped jars under labels naming Pellan are the reverse of thin evidence."],
        ["equivocal", "The stamps and labels leave no room for two readings; the text says the question was settled."],
        ["specious", "“Specious” would mean the evidence only seems convincing, but nothing in the text undercuts it; the question was settled."],
      ],
      why: "Stamped jars and labels naming Pellan, found in a distant wreck, settled a long debate, so the evidence is incontrovertible: impossible to dispute.",
      trap: "Choosing “specious,” which sounds like a verdict on evidence but means convincing only on the surface.",
      hint: "What happened to the scholars' long debate in 2021?",
    },
    {
      scene: "cs-brenholt-weekend-admissions",
      text: "Early analyses of records from Brenholt's hospitals found that patients admitted on weekends died at higher rates than patients admitted on weekdays, and some administrators blamed thinner weekend staffing. A later study showed the association to be ______: weekend patients were, on average, far sicker when they arrived, and once the severity of their illness was taken into account, the difference in death rates disappeared entirely.",
      clues: ["far sicker when they arrived", "disappeared entirely"],
      key: "spurious",
      wrong: [
        ["tenuous", "“Tenuous” would leave a weak but real link between weekend admission and death, but the difference disappeared entirely once severity was considered."],
        ["salient", "“Salient” would mean the association stood out as important, but the later study showed it was not a real effect of weekend admission at all."],
        ["circumscribed", "“Circumscribed” would mean the association held only in a limited set of cases, but it vanished altogether."],
      ],
      why: "The apparent weekend effect vanished once the patients' condition on arrival was considered, so the association was spurious: apparent but not genuine.",
      trap: "Choosing “tenuous,” which implies a real but weak link, when the text says the difference disappeared entirely.",
      hint: "What happened to the difference once the patients' severity was taken into account?",
    },
    {
      scene: "cs-kettle-hills-tree-rings",
      text: "Tree-ring records from the Kettle Hills show a narrow ring, the mark of a dry year, in roughly one year of every eight across four centuries. The rings for 1740 through 1747, however, are ______: eight narrow rings in a row, a run that appears nowhere else in the record and that the researchers attribute to a prolonged drought.",
      clues: ["one year of every eight", "appears nowhere else in the record"],
      key: "anomalous",
      wrong: [
        ["spurious", "“Spurious” would mean the narrow rings are not genuine evidence, but the researchers read them as the record of a real drought."],
        ["equivocal", "Eight narrow rings in a row point clearly to dry years; the text reports no competing reading of them."],
        ["emblematic", "“Emblematic” would make the run typical of the record, but it appears nowhere else."],
      ],
      why: "Narrow rings normally appear about once in eight years, but here eight appear in a row, a run found nowhere else, so these rings are anomalous: departing from the usual pattern.",
      trap: "Choosing “emblematic,” which would make the unusual run typical of the whole record.",
      hint: "How does this run compare with the pattern across the rest of the four centuries?",
    },
  ];

  // Builds a high-register blank item whose trap and hint are specific to the
  // topic, and checks that all four choices come from the template's advanced
  // word list and that every key recurs as a distractor elsewhere in the bank.
  function WIC_registerItem(topic, bank, words, extra) {
    const recurs = (key) => bank.some((other) => other !== topic && other.wrong.some(([word]) => word === key));
    return WIC_blankItem(topic, {
      ...extra,
      trap: topic.trap,
      hint: topic.hint,
      check: () =>
        [topic.key, ...topic.wrong.map(([word]) => word)].every((word) => words.has(word)) &&
        topic.clues.every((clue) => topic.text.includes(clue)) &&
        recurs(topic.key),
    });
  }

  const wicAcademicEvaluation = {
    id: "wic-academic-evaluation",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "precision",
    difficulty: "Hard",
    title: "Advanced word for how well a claim or body of evidence stands",
    recognize:
      "The blank names the standing of a claim or body of evidence; the advanced choices differ in dimension (strength, certainty, scope, genuineness, relevance) and in degree, and the details settle exactly one.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["extreme-language", "opposite-stance", "word-association"],
    build(t) {
      const topic = t.pick(WIC_EVALUATION_TOPICS);
      return WIC_registerItem(topic, WIC_EVALUATION_TOPICS, WIC_EVALUATION_WORDS, {
        steps: [
          "Decide what the blank describes: how strong the evidence is, how certain or ambiguous, how broad, whether it is genuine, or how much it matters.",
          "Find the details that establish that standing and note how far they go.",
          "Choose the word that matches both the dimension and the degree those details establish.",
        ],
        principles: [
          "Advanced evaluative words differ in what they measure: tenuous is about strength, untenable about whether a claim can be defended at all, equivocal about ambiguity, circumscribed about scope, provisional about time.",
          "A word that is right in direction but wrong in degree or dimension is not the precise word.",
        ],
        seconds: 95,
      });
    },
  };

  /* ---------------- 10. High-register word for a scholar's or text's manner */

  // The blank names the manner, scope, or attitude of a scholar, critic, or
  // piece of writing; the details show one quality, and each distractor names
  // a neighboring quality (cautious vs. reserved, thorough vs. narrow, biased
  // vs. combative) that the details do not show, or a quality the text
  // assigns to something else. Every key recurs as a distractor elsewhere.
  const WIC_STANCE_WORDS = new Set([
    "circumspect", "tendentious", "cursory", "exhaustive", "idiosyncratic", "derivative",
    "sanguine", "ambivalent", "polemical", "reticent", "meticulous", "dispassionate",
    "circumscribed", "archaic", "rudimentary", "diffident", "equivocal", "perfunctory", "candid", "pedantic",
  ]);

  const WIC_STANCE_TOPICS = [
    {
      scene: "cs-irrin-ridge-furnace",
      text: "Although her excavation at Irrin Ridge uncovered what may be the oldest glass furnace yet found, the archaeologist Hana Ruiz was notably ______ in announcing it. Her report dates the furnace only to “no later than” the ninth century BCE, describes two ways in which the soil layers above it might have been disturbed, and declines to call the furnace the oldest until a second site has been analyzed.",
      clues: ["describes two ways", "declines to call the furnace the oldest"],
      key: "circumspect",
      wrong: [
        ["sanguine", "A sanguine archaeologist would confidently expect her find to prove the oldest, but Ruiz declines to make that claim."],
        ["cursory", "“Cursory” means hasty and superficial, but a report that details possible disturbances to the soil is careful, not hurried."],
        ["tendentious", "A tendentious report would slant the evidence toward a favored conclusion, but Ruiz's report sets out the ways her own find might mislead."],
      ],
      why: "Ruiz dates the furnace cautiously, sets out how the evidence might mislead, and withholds the claim that it is the oldest, so she was circumspect: careful not to claim more than the evidence allows.",
      trap: "Choosing “sanguine” because the find may be the oldest yet found, although Ruiz refuses to claim that it is.",
      hint: "What does Ruiz's report do with the claim that her furnace is the oldest?",
    },
    {
      scene: "cs-callowmere-railway-report",
      text: "Commissioned by the railway company whose safety record it was meant to assess, the 1887 Callowmere report is plainly ______. It attributes every accident to the carelessness of passengers, omits the inspectors' warnings about worn rails that appear in the company's own files, and closes by recommending that the company's charter be renewed.",
      clues: ["Commissioned by the railway company", "recommending that the company's charter be renewed"],
      key: "tendentious",
      wrong: [
        ["cursory", "A hasty report might miss evidence, but this one leaves out warnings from the company's own files and always blames passengers, a consistent slant rather than mere haste."],
        ["dispassionate", "A report that blames only passengers and recommends renewing its sponsor's charter takes a side; it is not impartial."],
        ["exhaustive", "A report that omits the inspectors' warnings is not complete."],
      ],
      why: "Paid for by the company it judged, the report blames passengers, leaves out unfavorable warnings, and recommends renewal, so it is tendentious: written to promote one side.",
      trap: "Choosing “cursory,” which explains the missing warnings as haste and ignores that every omission favors the company.",
      hint: "Whose interests do all of the report's choices serve?",
    },
    {
      scene: "cs-ostrander-banners-catalog",
      text: "The museum's exhibition catalog devotes forty pages to the Ostrander tapestries but only a single paragraph to the twelve embroidered banners displayed beside them, and that paragraph lists the banners' dimensions without discussing their makers, their imagery, or how the museum acquired them. Reviewers have rightly called the catalog's treatment of the banners ______.",
      clues: ["only a single paragraph", "lists the banners' dimensions"],
      key: "cursory",
      wrong: [
        ["tendentious", "“Tendentious” would mean the catalog argues a slanted case about the banners, but it says almost nothing about them at all."],
        ["meticulous", "Forty careful pages go to the tapestries; the banners get one paragraph of measurements, the reverse of meticulous treatment."],
        ["derivative", "“Derivative” would mean the paragraph was copied from someone else's work, which the text never suggests."],
      ],
      why: "Twelve banners receive one paragraph of dimensions and nothing about their makers, imagery, or history, so the treatment is cursory: hasty and superficial.",
      trap: "Choosing “meticulous,” which describes the catalog's treatment of the tapestries, not of the banners.",
      hint: "How much attention does the catalog give the banners compared with the tapestries?",
    },
    {
      scene: "cs-baltic-rye-prices",
      text: "Petra Holmqvist's history of Baltic grain prices is nothing if not ______. Drawing on the account books of more than three hundred merchant houses, it records the price of rye at every major port in the region for each month from 1650 to 1800, and it devotes a full appendix to reconciling the eleven different units in which merchants measured grain.",
      clues: ["more than three hundred merchant houses", "every major port"],
      key: "exhaustive",
      wrong: [
        ["cursory", "Monthly prices at every port over 150 years, drawn from three hundred merchant houses, are the reverse of a hasty survey."],
        ["idiosyncratic", "“Idiosyncratic” would mean the study follows peculiar methods of the author's own, but the text stresses its completeness, not its oddity."],
        ["circumscribed", "The study's subject is specific, but every detail stresses how completely it covers that subject; “circumscribed” would stress its limits."],
      ],
      why: "Every port, every month, three hundred sources, and an appendix on units: the study is exhaustive, covering its subject completely.",
      trap: "Choosing “circumscribed” because the study concerns one region's grain, although every detail in the text stresses completeness, not limits.",
      hint: "What do the details after “nothing if not” emphasize about the study?",
    },
    {
      scene: "cs-heyer-diary-spelling",
      text: "The eighteenth-century diarist Tomas Heyer spelled by rules that no one else followed: he wrote “night” as “nite” but “light” as “lyght,” and he marked the days of the week with symbols of his own devising. Scholars transcribing the diary must therefore master Heyer's ______ system of notation before they can reliably date its entries.",
      clues: ["rules that no one else followed", "symbols of his own devising"],
      key: "idiosyncratic",
      wrong: [
        ["archaic", "Spellings such as “lyght” look old-fashioned, but the text's point is that the rules were Heyer's alone, not that they belonged to an earlier age."],
        ["derivative", "A system that no one else followed was not copied from others."],
        ["rudimentary", "Nothing suggests the system is crude or undeveloped; the difficulty is that it is peculiar to Heyer."],
      ],
      why: "Heyer followed rules no one else used and invented his own symbols, so his system is idiosyncratic: peculiar to one person.",
      trap: "Choosing “archaic” because of spellings like “lyght,” which look old but are singled out as Heyer's own.",
      hint: "Whose rules did Heyer's spelling follow?",
    },
    {
      scene: "cs-tirel-letters-novel",
      text: "Critics have long praised Anselm Tirel's 1932 novel for its inventive structure: the story is told entirely in letters that are never answered. A recently rediscovered novel by Tirel's teacher, published eleven years earlier, uses the same device, follows a closely similar plot, and even shares the names of two characters, leading some scholars to conclude that Tirel's celebrated book is more ______ than it first appeared.",
      clues: ["published eleven years earlier", "uses the same device"],
      key: "derivative",
      wrong: [
        ["idiosyncratic", "“Idiosyncratic” would make the novel more individual, more peculiar to Tirel, the reverse of what the teacher's earlier book reveals."],
        ["tendentious", "“Tendentious” describes writing slanted toward a cause, but nothing suggests the novel argues for anything; the discovery concerns where its device came from."],
        ["polemical", "“Polemical” describes an aggressive attack on opponents, which has no bearing on a borrowed structure and plot."],
      ],
      why: "The teacher's earlier novel has the same device, a similar plot, and shared names, so Tirel's book is more derivative, drawn from another's work, than it seemed.",
      trap: "Choosing “idiosyncratic,” which fits the novel's reputation for inventiveness but not the evidence that its structure was borrowed.",
      hint: "What does the teacher's earlier novel reveal about where Tirel's device came from?",
    },
    {
      scene: "cs-carvenne-currency-reform",
      text: "Most economists who studied Carvenne's 1993 currency reform expected it to collapse within a year. The reform's chief architect, Ilse Maren, was far more ______: in a memorandum to the cabinet she predicted that inflation would fall below 5 percent within eighteen months, and she offered to resign if it did not.",
      clues: ["expected it to collapse", "offered to resign if it did not"],
      key: "sanguine",
      wrong: [
        ["circumspect", "A circumspect official would hedge her forecast, but Maren staked her post on a precise prediction."],
        ["ambivalent", "“Ambivalent” means torn between opposing views, but Maren's memorandum shows no doubt about the reform."],
        ["diffident", "“Diffident” means lacking self-confidence, the reverse of an official who offers to resign if her forecast fails."],
      ],
      why: "Unlike the pessimistic economists, Maren confidently predicted success and bet her post on it, so she was sanguine: optimistic.",
      trap: "Choosing “circumspect,” a word for careful judgment, although Maren's bold, precise forecast is anything but hedged.",
      hint: "How does Maren's forecast compare with the economists' expectations?",
    },
    {
      scene: "cs-poet-city-letters",
      text: "The poet's letters reveal a deeply ______ attitude toward the city where she spent her last thirty years. She praised its libraries and concert halls as the finest she had ever known, yet in the same letters she described its streets as “a noise I cannot think through” and repeatedly made, and then canceled, plans to leave.",
      clues: ["praised its libraries", "then canceled, plans to leave"],
      key: "ambivalent",
      wrong: [
        ["sanguine", "Her praise of the libraries is warm, but the complaints about the noise and her plans to leave show she was not simply hopeful about the city."],
        ["polemical", "“Polemical” describes an aggressive argument against opponents, but these are private letters expressing mixed feelings, not an attack."],
        ["reticent", "Letters full of praise, complaint, and plans to leave are the reverse of reluctant to reveal feelings."],
      ],
      why: "She praised the city and complained about it in the same letters, and she kept planning and canceling her departure, so her attitude was ambivalent: torn between opposing feelings.",
      trap: "Choosing “sanguine” from her praise of the libraries while ignoring the complaints in the same letters.",
      hint: "What did she keep doing with her plans to leave?",
    },
    {
      scene: "cs-obiora-repatriation-essay",
      text: "Unlike her earlier, measured surveys of the field, Dana Obiora's 2018 essay on returning museum objects to their countries of origin is frankly ______. It names the museum directors she holds responsible for delays, dismisses their public statements as “evasions,” and urges donors to withhold funds until the disputed objects are returned.",
      clues: ["Unlike her earlier, measured surveys", "urges donors to withhold funds"],
      key: "polemical",
      wrong: [
        ["dispassionate", "“Dispassionate” describes her earlier, measured surveys, which “Unlike” sets against this essay."],
        ["equivocal", "An essay that names those responsible and urges donors to act takes a clear position; it is not ambiguous."],
        ["perfunctory", "“Perfunctory” means done with minimal effort or interest, but the essay is forceful and specific."],
      ],
      why: "The essay attacks named directors, dismisses their statements, and calls for pressure on them, so it is polemical: a forceful argument against opponents.",
      trap: "Choosing “dispassionate,” the quality of her earlier work that “Unlike” sets this essay against.",
      hint: "What does “Unlike” tell you about how this essay differs from her earlier work?",
    },
    {
      scene: "cs-brekke-memoir",
      text: "Although the engineer Johan Brekke kept detailed notebooks on every bridge he designed, he was famously ______ about his private life. His four-hundred-page memoir never once mentions his family, and after he retired he declined every request for an interview, answering letters from admirers with a printed card that thanked them for their interest.",
      clues: ["never once mentions his family", "declined every request for an interview"],
      key: "reticent",
      wrong: [
        ["meticulous", "Brekke was meticulous about his bridges, as his notebooks show, but the blank concerns his private life, which he kept to himself."],
        ["candid", "A memoir that never mentions his family and a refusal of every interview are the reverse of frank disclosure."],
        ["sanguine", "“Sanguine” means optimistic, a quality the text never addresses."],
      ],
      why: "Brekke left his family out of his memoir and refused every interview, so he was reticent: unwilling to reveal personal matters.",
      trap: "Choosing “meticulous,” which describes his engineering notebooks, not his reluctance to discuss his private life.",
      hint: "What did Brekke leave out of his memoir, and how did he answer requests to talk?",
    },
    {
      scene: "cs-brunn-altarpiece-restoration",
      text: "Reviewers praised the restorers' ______ work on the Brunn altarpiece. Before removing any varnish, the team photographed each panel under ultraviolet light, logged the position of every earlier repair, and tested each solvent for six months on a hidden strip of the frame, a level of care that, one reviewer wrote, left nothing to chance.",
      clues: ["Reviewers praised", "logged the position of every earlier repair"],
      key: "meticulous",
      wrong: [
        ["pedantic", "“Pedantic” also involves attention to detail, but it is a criticism, fussiness over trivial points, and the reviewers praised the work."],
        ["cursory", "Six months of solvent tests and a log of every repair are the reverse of hasty work."],
        ["idiosyncratic", "“Idiosyncratic” would mean the restorers followed peculiar methods of their own, but the text praises their care, not their originality."],
      ],
      why: "Every step the text lists shows careful attention to detail, which the reviewers praised, so the work was meticulous.",
      trap: "Choosing “pedantic,” which shares the attention to detail but carries a criticism that the reviewers' praise rules out.",
      hint: "Do the reviewers admire or fault the restorers' attention to detail?",
    },
    {
      scene: "cs-vells-flood-history",
      text: "Writing only a year after the flood that destroyed her family's farm, the historian Mara Vells produced an account of the disaster that is remarkably ______. It weighs each of the engineers' decisions against the information they had at the time, credits several officials whom she might easily have blamed, and draws no conclusion where the records are incomplete.",
      clues: ["destroyed her family's farm", "credits several officials"],
      key: "dispassionate",
      wrong: [
        ["polemical", "Her loss might lead a reader to expect an attack, but the account credits officials she could have blamed."],
        ["equivocal", "Declining to judge where records are missing is not ambiguity; the account weighs each decision and credits officials, reaching clear judgments wherever the evidence allows."],
        ["perfunctory", "Weighing every decision against the information available at the time is thorough work, not the minimal effort “perfunctory” implies."],
      ],
      why: "Despite her personal loss, Vells judges the engineers fairly, credits officials, and avoids unsupported conclusions, so the account is dispassionate: free of personal feeling or bias.",
      trap: "Choosing “polemical,” what her personal loss might lead a reader to expect, rather than what the account actually does.",
      hint: "What might her loss have led her to write, and what did she write instead?",
    },
  ];

  const wicAcademicStance = {
    id: "wic-academic-stance",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "precision",
    difficulty: "Hard",
    title: "Advanced word for the manner of a scholar, critic, or text",
    recognize:
      "The blank names a manner, scope, or attitude; the details show one quality, and each advanced distractor names a neighboring quality the details do not show or a quality the text assigns to something else.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["opposite-stance", "true-but-irrelevant", "word-association"],
    build(t) {
      const topic = t.pick(WIC_STANCE_TOPICS);
      return WIC_registerItem(topic, WIC_STANCE_TOPICS, WIC_STANCE_WORDS, {
        steps: [
          "Collect every detail the text gives about the person's or the text's manner, and note what the blank describes (not something nearby).",
          "For each choice, name the quality it denotes and check whether those details show that quality.",
          "Reject words for neighboring qualities (cautious vs. reserved, thorough vs. narrow, slanted vs. combative) and words the text applies to something else.",
        ],
        principles: [
          "Advanced words for manner come in close families; the precise one is the quality the text's details actually demonstrate.",
          "Connotation counts: praise rules out a word that carries criticism even when both describe the same behavior.",
        ],
        seconds: 95,
      });
    },
  };

  /* ------------------------- 11. Word used in an older sense in period prose */

  // Original passages written in a nineteenth- or early twentieth-century
  // style use a word in a sense now old-fashioned (nice = subtle, want =
  // lack, discover = reveal). The modern sense is offered as `modern`; the
  // other distractors are readings the surrounding detail invites and rules
  // out. The passages are original writing, not excerpts, and say so.
  const WIC_PERIOD_STORY = "The following text is from an original story written in a nineteenth-century style.";
  const WIC_PERIOD_ESSAY = "The following text is from an original essay written in an early twentieth-century style.";

  const WIC_PERIOD_TOPICS = [
    {
      scene: "cs-period-comma-in-will",
      header: WIC_PERIOD_STORY,
      text: "Mr. Aldous was not a man to be hurried in matters of judgment. When the two drafts of the will were laid before him, he sat an hour over them with his spectacles pushed high on his forehead, for the question between them was a nice one: the drafts differed in a single comma, and upon that comma depended whether the orchard passed to the nephew or to the parish.",
      word: "nice",
      resolver: "differed in a single comma",
      key: "subtle",
      modern: ["pleasant", "“Nice” now usually means pleasant, but a question that kept a careful man bent over two drafts for an hour was not agreeable; it was fine and difficult to decide."],
      others: [
        ["trivial", "A single comma sounds trivial, but the orchard's fate depended on it, so the question was fine, not unimportant."],
        ["courteous", "People can be courteous, but a question cannot; the text describes how finely the drafts differed."],
      ],
      why: "The drafts differed only by a comma on which much depended, so the question was “nice” in the older sense: subtle, requiring fine judgment.",
    },
    {
      scene: "cs-period-parsonage-wanted",
      header: WIC_PERIOD_STORY,
      text: "The parsonage at Elmstead was small and plainly furnished, yet it wanted nothing that a sensible family could require. There were books enough for the long evenings, a garden that kept the table in beans and apples through the autumn, and a fire that Mrs. Lowther never permitted to die before the household was abed.",
      word: "wanted",
      resolver: "There were books enough",
      key: "lacked",
      modern: ["desired", "“Wanted” now usually means desired, but a house cannot desire anything; the list that follows shows what the parsonage had, not what it wished for."],
      others: [
        ["demanded", "Nothing suggests the house required upkeep or effort; the text lists the comforts it supplied."],
        ["concealed", "The books, garden, and fire are described openly; nothing is hidden."],
      ],
      why: "The sentences that follow list everything the family needed, so the parsonage “wanted,” or lacked, nothing.",
    },
    {
      scene: "cs-period-letter-discover",
      header: WIC_PERIOD_STORY,
      text: "For three weeks Eleanor kept the letter in her workbox and said nothing of it, though her sister's questions grew daily more pointed. She had resolved not to discover its contents to anyone until she had spoken with her father, and she held to that resolution even when Harriet, in a fit of temper, accused her of hiding a secret engagement.",
      word: "discover",
      resolver: "accused her of hiding",
      key: "reveal",
      modern: ["find out", "“Discover” now usually means find out, but Eleanor already knows what the letter says; the question is whether she will tell anyone."],
      others: [
        ["examine", "Eleanor has kept and presumably read the letter; her resolution concerns other people, “to anyone,” not her own reading of it."],
        ["dispute", "Nothing suggests she disagrees with the letter; she refuses to share it, which is why Harriet accuses her of hiding something."],
      ],
      why: "Eleanor says nothing of the letter and is accused of hiding a secret, so she resolved not to “discover,” or reveal, its contents to anyone.",
    },
    {
      scene: "cs-period-captain-sensible",
      header: WIC_PERIOD_STORY,
      text: "Captain Harlowe was sensible of the honor the town meant to do him, and he thanked the committee warmly; but he confessed to his sister that evening that he would rather face another winter at sea than sit through a dinner at which he must hear his own conduct praised for two hours together.",
      word: "sensible",
      resolver: "thanked the committee warmly",
      key: "aware",
      modern: ["reasonable", "“Sensible” now usually means reasonable, but “sensible of the honor” describes his recognition of the town's intention, which he acknowledges by thanking the committee."],
      others: [
        ["unworthy", "His dread of being praised may suggest modesty, but “sensible of” describes his recognition of the honor, not a judgment that he does not deserve it."],
        ["weary", "He dreads the long dinner, but that complaint comes later, to his sister; toward the honor itself he is grateful."],
      ],
      why: "Harlowe recognizes the honor and thanks the committee for it, so he was “sensible,” or aware, of it, even though he dreads the dinner.",
    },
    {
      scene: "cs-period-primrose-conceit",
      header: WIC_PERIOD_ESSAY,
      text: "The old gardeners of the county had a pretty conceit that the first primrose of the year must be picked by a child, or the season would turn sour. No one, I think, quite believed it; yet I have seen a grown farmer stand back from a bank of primroses with his hands behind him until his small daughter could be fetched from the house.",
      word: "conceit",
      resolver: "No one, I think, quite believed it",
      key: "whimsical belief",
      modern: ["vain pride", "“Conceit” now usually means vanity, but the gardeners are not proud of themselves; they share an imaginative belief about primroses."],
      others: [
        ["old grievance", "Nothing in the text is a complaint; it describes a belief about who should pick the first flower."],
        ["mere jest", "No one quite believed it, but the farmer still acts on it, so it is more than a joke."],
      ],
      why: "The gardeners share an imaginative belief that no one quite credits yet many honor, so a “conceit” here is a whimsical belief.",
    },
    {
      scene: "cs-period-surgeon-mean-street",
      header: WIC_PERIOD_STORY,
      text: "The house in which the great surgeon was born stood at the end of a mean street near the tannery, among lodgings let by the week to carters and laborers. Visitors who came to see it after his death were often surprised, having supposed that so distinguished a man must have sprung from a family of some consequence.",
      word: "mean",
      resolver: "a family of some consequence",
      key: "humble",
      modern: ["unkind", "“Mean” now usually means unkind, but a street cannot be unkind; the lodgings for carters and laborers mark it as poor."],
      others: [
        ["average", "“Mean” can name an average, but the visitors' surprise shows the street was lower than they expected of a distinguished man's birthplace, not merely ordinary."],
        ["narrow", "Old streets are often narrow, but the text describes the neighborhood's poverty, not its width."],
      ],
      why: "Weekly lodgings for laborers near a tannery, and visitors' surprise that he had not come from a family of consequence, show the street was “mean,” or humble.",
    },
    {
      scene: "cs-period-doctor-presently",
      header: WIC_PERIOD_STORY,
      text: "The doctor, the maid explained as she showed Thomas into the cold front parlor, was with another patient but would come to him presently. Thomas sat on the edge of a horsehair chair and watched the clock on the mantel; before its hands had moved a quarter of an hour, the door opened and the doctor came in, drying his hands on a towel.",
      word: "presently",
      resolver: "before its hands had moved a quarter of an hour",
      key: "soon",
      modern: ["at this moment", "“Presently” is now often used to mean at present, but the doctor was with another patient and arrived only after Thomas had waited."],
      others: [
        ["in person", "Nothing suggests the doctor might have sent someone else; the text concerns when he would come."],
        ["reluctantly", "The doctor arrives within a quarter of an hour, still drying his hands; nothing shows unwillingness."],
      ],
      why: "The doctor was busy but arrived within a quarter of an hour, so he would come “presently,” or soon.",
    },
    {
      scene: "cs-period-falls-awful",
      header: WIC_PERIOD_ESSAY,
      text: "I had read a great deal about the falls before I saw them, and I expected to be disappointed, as travelers commonly are. I was not. The river, gathering itself at the lip of the gorge, went over with a slow and awful weight, and the roar of it came up through the soles of my boots, so that I stood a long while without speaking, a good deal humbled.",
      word: "awful",
      resolver: "a good deal humbled",
      key: "awe-inspiring",
      modern: ["unpleasant", "“Awful” now usually means very bad, but the writer was not disappointed; the falls left him silent and humbled."],
      others: [
        ["dangerous", "Great falls can be dangerous, but the writer's response is silent wonder, not fear for his safety."],
        ["slow-moving", "“Slow” comes just before the word, but the roar that shakes the ground shows immense force, not a sluggish current."],
      ],
      why: "The writer, expecting disappointment, stood silent and humbled before the falls, so their weight was “awful” in the older sense: awe-inspiring.",
    },
    {
      scene: "cs-period-candid-reader",
      header: WIC_PERIOD_ESSAY,
      text: "I do not ask the reader to agree with every judgment in these pages; I ask only that he be candid. Let him weigh the evidence for the old bridge as fairly as the evidence against it, and set aside for an hour the opinions he formed from the newspapers, and I am content to abide by whatever conclusion he reaches.",
      word: "candid",
      resolver: "as fairly as the evidence against it",
      key: "impartial",
      modern: ["outspoken", "“Candid” now usually means frank, but the writer asks the reader to weigh evidence fairly and set aside prior opinions, not to speak his mind."],
      others: [
        ["patient", "The writer asks for an hour, but the request that follows is to weigh both sides fairly, not simply to take time."],
        ["agreeable", "The writer says outright that he does not ask the reader to agree with him."],
      ],
      why: "The writer asks the reader to weigh evidence on both sides fairly and set aside earlier opinions, so to be “candid” is to be impartial.",
    },
    {
      scene: "cs-period-curious-clock",
      header: WIC_PERIOD_STORY,
      text: "On the mantel stood a clock of curious workmanship, its case carved with vines so fine that one could count the veins of every leaf, and its dial set with small enamel figures of the seasons that turned, one after another, as the hours passed. Old Mr. Pryor would let no one wind it but himself.",
      word: "curious",
      resolver: "count the veins of every leaf",
      key: "intricate",
      modern: ["inquisitive", "“Curious” now usually means eager to know, but workmanship cannot be inquisitive; the description is of finely detailed carving."],
      others: [
        ["costly", "Such a clock may well have been expensive, but the text describes the fineness of the work, not its price."],
        ["ancient", "Mr. Pryor is old, but nothing dates the clock; the description concerns its detailed craftsmanship."],
      ],
      why: "Carving so fine that one can count the veins of every leaf, and turning enamel figures, show workmanship that is “curious” in the older sense: intricate.",
    },
    {
      scene: "cs-period-lieutenant-interest",
      header: WIC_PERIOD_STORY,
      text: "Young Farrant had served eight years as a lieutenant without promotion, for he had no interest at the Admiralty: his father was a country curate who knew no one of consequence, and every captain's berth that fell vacant went to some admiral's nephew or some lord's godson.",
      word: "interest",
      resolver: "knew no one of consequence",
      key: "influence",
      modern: ["curiosity", "“Interest” now usually means curiosity, but Farrant's lack of promotion is explained by his father's lack of connections, not by his own attention."],
      others: [
        ["enthusiasm", "Nothing suggests Farrant was indifferent to the navy; the text blames his lack of connections."],
        ["investment", "“Interest” can mean a financial stake, but the text explains promotion by family connections, not money."],
      ],
      why: "Promotions went to admirals' nephews and lords' godsons, and Farrant's father knew no one of consequence, so he had no “interest,” or influence, at the Admiralty.",
    },
    {
      scene: "cs-period-housemaid-character",
      header: WIC_PERIOD_STORY,
      text: "The new housemaid arrived at Thornbury on a wet Tuesday with one trunk and an excellent character from her last mistress, who wrote that in six years the girl had never broken a dish, told a falsehood, or been late to prayers. Mrs. Pell read the letter twice and engaged her on the spot.",
      word: "character",
      resolver: "Mrs. Pell read the letter twice",
      key: "reference",
      modern: ["personality", "“Character” now usually means personality, but this character was written by her last mistress and read by Mrs. Pell."],
      others: [
        ["wardrobe", "She arrived with one trunk, but the character came “from her last mistress,” who wrote about the girl's conduct."],
        ["education", "Nothing suggests her mistress taught her; the mistress wrote an account of her conduct."],
      ],
      why: "The character came from her last mistress, who wrote about the girl's conduct, and Mrs. Pell read it before hiring her, so it was a reference: a written account of her conduct.",
    },
  ];

  const wicPeriodSense = {
    id: "wic-period-older-sense",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "meaning in context",
    difficulty: "Hard",
    title: "Word used in an older sense in period prose",
    recognize:
      "In prose written in an older style, a familiar word carries a sense now old-fashioned; its modern meaning is offered and does not fit, and the surrounding detail settles the older sense.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["common-meaning", "word-association"],
    build(t) {
      const topic = t.pick(WIC_PERIOD_TOPICS);
      const wrong = [topic.modern, ...topic.others];
      const content = `${topic.header}\n\n${topic.text}`;
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content },
        stem: WIC_meaningStem(topic.word),
        correct: topic.key,
        wrong,
        explanation: topic.why,
        steps: [
          `Set aside the meaning “${topic.word}” usually has today and ask whether it can describe what the text shows.`,
          "Find the detail that shows what the word must mean here, often a sentence or two away.",
          "Choose the sense that detail requires, even if it is unfamiliar.",
        ],
        principles: [
          "Older prose often uses familiar words in senses now old-fashioned; the context, not the modern meaning, decides.",
        ],
        trap: `Choosing “${topic.modern[0]},” the word's usual modern meaning, which the text's details rule out.`,
        hint: "Which detail in the text shows what the word has to mean here?",
        estimatedSeconds: 95,
        // The word occurs once, the settling detail is in the passage, the
        // modern-sense distractor discusses the word itself, and the key is
        // not simply repeated from the passage.
        verify: () =>
          WIC_occurrences(topic.text, topic.word) === 1 &&
          topic.text.includes(topic.resolver) &&
          wrong[0] === topic.modern &&
          WIC_namesWord(topic.modern[1], topic.word) &&
          WIC_occurrences(topic.text, topic.key) === 0 &&
          new Set([topic.key, ...wrong.map(([text]) => text)]).size === 4,
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
    wicAcademicEvaluation,
    wicAcademicStance,
    wicPeriodSense,
  ];
});
