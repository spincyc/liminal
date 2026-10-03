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
      "scene": "cs-waning-vaccine-antibodies",
      "text": "In a trial in the invented region of Selwin, the new vaccine's protection was ______. It greatly reduced infections during the first months after vaccination, but that advantage declined steadily; by the end of the first year, infection rates in vaccinated and unvaccinated groups were nearly identical.",
      "clues": [
        "greatly reduced infections",
        "nearly identical"
      ],
      "key": "temporary",
      "wrong": [
        [
          "weak",
          "The vaccine greatly reduced early infections; the problem is how long that benefit lasted."
        ],
        [
          "inconsistent",
          "Protection declined steadily, not unpredictably from one measurement to the next."
        ],
        [
          "partial",
          "Partial describes incomplete protection at a given time; the decisive contrast here is early protection followed by its disappearance."
        ]
      ],
      "why": "Strong early protection that fades over the year is temporary. It is not merely weak or partial throughout, and its steady loss does not show erratic performance."
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
    // Medium (relabelled from Hard, 2026-09-26): a cold review found that the
    // settling detail states the needed sense plainly, so a careful reading
    // decides it; the trap is real, but no structure has to be worked out.
    difficulty: "Medium",
    title: "Word with two opposite senses",
    recognize:
      "The word has two opposite senses; the opening makes the wrong one attractive, and a later detail settles which is meant.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
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
      "scene": "cs-corran-tutoring-evaluation",
      "text": "Advocates and critics of the Corran tutoring program cite the same evaluation. Four schools improved and four declined; importantly, the evaluators' calculations allowed for differences in enrollment and measurement error. After those adjustments, the range of effects compatible with the results still included both a modest benefit and none. The advocates call the program effective, while the critics call it ineffective. The evaluation itself is more ______ than either group's summary, even though neither side questions the accuracy of the recorded scores.",
      "clues": [
        "range of effects compatible with the results",
        "included both a modest benefit and none"
      ],
      "key": "equivocal",
      "wrong": [
        [
          "anomalous",
          "The dispute concerns which effects fit the data, not whether the pattern departs from an established expectation."
        ],
        [
          "untenable",
          "Both sides accept the recorded scores; uncertainty about their implication does not make the findings indefensible."
        ],
        [
          "incontrovertible",
          "The compatible effects include a benefit and none, so the evaluation cannot decisively settle effectiveness."
        ]
      ],
      "why": "The measurements can be accurate while their implication remains ambiguous. Equivocal captures the evaluation's failure to distinguish a benefit from none; the results are neither indefensible nor decisive.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-vessaro-ledger-uprising",
      "text": "A Vessaro merchant's ledger lists a payment 'for the cause' to a recipient identified only by initials. Historian Rosa Menezes found those initials on an uprising committee's membership list; a parish treasurer active in the same year used them too. Other accounts establish that the merchant paid for charitable work, but none records a political donation. Menezes has therefore not abandoned her proposed link between the merchant and the uprising, although she acknowledges that, compared with his documented charitable ties, it is ______.",
      "clues": [
        "a parish treasurer active in the same year used them too",
        "none records a political donation"
      ],
      "key": "tenuous",
      "wrong": [
        [
          "circumscribed",
          "The issue is the strength of the documentary connection, not the range of a supported claim."
        ],
        [
          "corroborated",
          "The matching initials also identify a parish treasurer, so they do not independently confirm political support."
        ],
        [
          "untenable",
          "The political identification remains possible; competing evidence weakens it without disproving it."
        ]
      ],
      "why": "The initials supply some support, but the competing parish identification prevents confirmation. Tenuous describes the weak documentary link without declaring it untenable or merely narrow in scope.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-velt-basin-salt-beds",
      "text": "The prevailing account of the Velt Basin allowed several fluctuations in an ancient lake's depth but held that the basin remained submerged until its final drying. A newly drilled core contains two salt beds separated by gravel. Gravel alone would not settle the matter, since rivers can deposit it underwater. The layer also contains rooted tree stumps whose growth rings span decades, preserved upright where the trees grew. In light of that combination, the claim of uninterrupted submergence has become ______, even if other parts of the lake's history remain disputed.",
      "clues": [
        "rooted tree stumps whose growth rings span decades",
        "claim of uninterrupted submergence"
      ],
      "key": "untenable",
      "wrong": [
        [
          "corroborated",
          "Trees growing in place require exposed land and contradict uninterrupted submergence."
        ],
        [
          "tenuous",
          "The key evidence directly conflicts with uninterrupted submergence instead of merely leaving it weakly supported."
        ],
        [
          "provisional",
          "The passage does not retain uninterrupted submergence pending confirmation; the rooted trees contradict it."
        ]
      ],
      "why": "Gravel alone is inconclusive, but trees growing in place require an interval of exposed land. Together the details make uninterrupted submergence untenable, rather than merely provisionally accepted or weakly supported.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-tamsin-bay-marsh-nitrogen",
      "text": "The Tamsin Bay team repeated its nitrogen measurements over six growing seasons and obtained nearly identical results: restored marshes removed more nitrogen than unrestored ones. Reviewers consequently treated the measured contrast as secure. The authors nevertheless kept their conclusion ______. Their proposed follow-up did not repeat those measurements; it tested winter runoff and inland wetlands, neither represented in the three coastal counties studied. The team's confidence in the contrast was therefore greater than its willingness to apply that contrast elsewhere.",
      "clues": [
        "neither represented in the three coastal counties studied",
        "willingness to apply that contrast elsewhere"
      ],
      "key": "circumscribed",
      "wrong": [
        [
          "conjectural",
          "Six seasons of measurements support the result; the authors restrict its reach rather than offer a guess."
        ],
        [
          "equivocal",
          "The repeated local contrast is secure; what remains untested is its application to other places and seasons."
        ],
        [
          "expansive",
          "The authors leave inland wetlands and winter to a follow-up instead of extending their present conclusion."
        ]
      ],
      "why": "Repeated results make the local finding secure, but untested seasons and habitats limit its scope. Circumscribed describes the conclusion's reach, rather than making it conjectural or equivocal.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-orvel-manuscripts-dating",
      "text": "Two laboratories disagree about the Orvel manuscripts' dates. The cataloging committee has adopted the first laboratory's dates for every manuscript rather than splitting the collection between incompatible chronologies. Yet each entry retains the older date in a note, and the committee has reserved funds to revise the whole catalog after new tests. Its treatment of the adopted chronology is therefore ______: applying it consistently does not mean the committee has settled the dispute that prompted the further tests.",
      "clues": [
        "reserved funds to revise the whole catalog",
        "applying it consistently does not mean"
      ],
      "key": "provisional",
      "wrong": [
        [
          "spurious",
          "The committee uses the dates as its working chronology, rather than treating them as false."
        ],
        [
          "incontrovertible",
          "Planned tests and revision show that the dispute remains open."
        ],
        [
          "circumscribed",
          "The dates apply to every manuscript; the qualification concerns their temporary status, not restricted scope."
        ]
      ],
      "why": "The chronology currently governs all entries, but the planned revision keeps its status temporary. Provisional concerns that status; circumscribed would confuse temporal caution with a restriction to part of the collection.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-danza-portrait",
      "text": "The familiar portrait of Aurelio Danza was painted seventy years after the composer's death. Its quill, clothing, and furniture agree with securely dated objects from his lifetime, and conservators found no alterations. None of those correspondences, however, supplies evidence about the face: no lifetime portrait or description of Danza's appearance survives, and the painter left no record of another source. The painting can thus be historically careful in its setting while remaining ______ in its portrayal of Danza himself.",
      "clues": [
        "no lifetime portrait or description",
        "historically careful in its setting"
      ],
      "key": "conjectural",
      "wrong": [
        [
          "equivocal",
          "The problem is lack of evidence for the likeness, not evidence supporting competing interpretations."
        ],
        [
          "corroborated",
          "Matching period objects verifies the setting but supplies no independent support for the face."
        ],
        [
          "anachronistic",
          "The setting matches objects from Danza's lifetime; a later painting need not contain out-of-period details."
        ]
      ],
      "why": "Accurate period objects establish the setting, not Danza's appearance. Conjectural identifies the unsupported likeness; anachronistic would incorrectly fault the period details.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-tarn-highway-growth",
      "text": "A report credits the Tarn Valley's new highway with its entire population increase, citing rapid growth after the road opened. Towns in an adjacent valley beyond the route grew equally fast, and households in both valleys named the same expanding mine as their reason for moving. The highway may still have affected where individual families settled. Nevertheless, treating the timing of Tarn's growth as sufficient evidence for the report's exclusive causal claim is ______: the neighboring valley supplies a competing explanation that the report never addresses.",
      "clues": [
        "entire population increase",
        "competing explanation that the report never addresses"
      ],
      "key": "specious",
      "wrong": [
        [
          "equivocal",
          "The report's exclusive claim is clear, not ambiguous; its apparent proof overlooks a competing explanation."
        ],
        [
          "incontrovertible",
          "The neighboring valley's growth directly challenges the report's claim to have isolated the cause."
        ],
        [
          "circumscribed",
          "The report claims the entire increase, whereas the narrower claim about settlement locations is explicitly distinguished from it."
        ]
      ],
      "why": "The tempting timing argument omits an evident competing cause. Specious describes that misleading argument, not proof that the highway had no effect; the text explicitly preserves a possible narrower role.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-skerra-head-whirlpool",
      "text": "Sailors described a whirlpool off Skerra Head during the strongest spring tides, but their explanation invoked a submerged sea creature. Historians dismissed both the explanation and the reported event. A recent tidal model, developed without using those accounts as inputs, produces rotating currents at the headland only under the tidal conditions the sailors recorded. The sailors' account of when the whirlpool occurred has therefore been ______, although the creature has found no place in the model and the historical explanation remains rejected.",
      "clues": [
        "developed without using those accounts as inputs",
        "only under the tidal conditions the sailors recorded"
      ],
      "key": "corroborated",
      "wrong": [
        [
          "superseded",
          "A replacement explanation does not replace the timing account, which the model supports."
        ],
        [
          "circumscribed",
          "The model reproduces the sailors' timing condition instead of restricting it to a smaller set of tides."
        ],
        [
          "impugned",
          "The sea-creature explanation is rejected, but the blank specifically asks about the observed timing, which is supported."
        ]
      ],
      "why": "The independent model supports the timing of the event, not the sailors' explanation for it. Corroborated identifies that support; the accurate observation has not been superseded merely because its explanation was rejected.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-treaty-drafts-river-clause",
      "text": "Two drafts of the Asvel treaty differ in spelling, punctuation, and the order of witnesses. A clause granting access to the river appears in one draft but not the other. Earlier scholars cataloged all these differences without ranking them. Newly opened negotiating minutes show that both delegations had accepted the wording of every provision except river access before talks failed. For explaining that failure, the omitted clause is therefore especially ______, even though it occupies less space than several differences the catalog records first.",
      "clues": [
        "every provision except river access",
        "For explaining that failure"
      ],
      "key": "salient",
      "wrong": [
        [
          "peripheral",
          "The minutes identify river access as the sole unresolved issue, so the small omission is central to explaining failure."
        ],
        [
          "spurious",
          "The omission appears in the surviving drafts; the new minutes establish its significance rather than its falsity."
        ],
        [
          "tacit",
          "The blank describes a documented difference in written clauses, not an understanding left unspoken."
        ]
      ],
      "why": "The negotiating minutes connect the small omission to the unresolved issue. Salient identifies explanatory relevance, which neither the size nor the catalog order of a difference determines.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-pellan-wreck-jars",
      "text": "Excavators at Pellan found little local clay in jars bearing the town's workshop stamp, prompting doubts that those workshops had manufactured the vessels. A wreck far offshore later yielded four hundred jars with the same stamp; their sealed cargo labels identify both the Pellan workshop that dispatched them and the island buyer. Whether the workshops imported unfinished jars is unresolved. The narrower claim that jars were shipped overseas from Pellan, however, now rests on ______ evidence, even if the route by which they first reached Pellan remains uncertain.",
      "clues": [
        "identify both the Pellan workshop that dispatched them and the island buyer",
        "route by which they first reached Pellan"
      ],
      "key": "incontrovertible",
      "wrong": [
        [
          "specious",
          "The manufacturing uncertainty does not undercut the labels and offshore location establishing shipment."
        ],
        [
          "equivocal",
          "The cargo labels identify dispatch and destination directly; the ambiguity concerns where the jars were made."
        ],
        [
          "tenuous",
          "The claim about shipment has both documentary and physical support, unlike the unresolved manufacturing question."
        ]
      ],
      "why": "The local-clay puzzle leaves manufacturing unresolved, but dispatch labels and an offshore cargo directly establish overseas shipment. The evidence for that narrower claim is incontrovertible; uncertainty about manufacturing does not weaken it.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-brenholt-weekend-admissions",
      "text": "Brenholt's hospital records accurately showed higher mortality among weekend admissions, although physicians disagreed about what the figures meant. Administrators attributed the excess to weekend staffing. Patients arriving on weekends were also substantially sicker. When researchers compared equally ill patients receiving the same treatments, mortality was indistinguishable across admission days. Thus the report treated the apparent independent association between admission day and mortality as ______, without disputing either the original counts or the possibility that staffing mattered in other ways.",
      "clues": [
        "compared equally ill patients",
        "mortality was indistinguishable"
      ],
      "key": "spurious",
      "wrong": [
        [
          "circumscribed",
          "The adjusted association is not confined to a stated subgroup; it disappears in the comparisons described."
        ],
        [
          "tenuous",
          "This would describe a weakly supported link, whereas the adjusted comparisons show no link at all; the raw difference is a different claim."
        ],
        [
          "salient",
          "The original counts attracted attention, but the blank evaluates the independent association after illness severity is accounted for."
        ]
      ],
      "why": "The raw counts remain accurate, but adjustment removes the apparent independent link between admission day and death. That independent association is spurious, rather than a genuine association merely weakened or limited to some patients.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-kettle-hills-tree-rings",
      "text": "In the moisture-sensitive pines of the Kettle Hills, narrow rings generally occur about once every eight years. Every ring from 1740 through 1747 is narrow, and the same sequence appears in wood from three separate valleys. Replication has persuaded researchers that the sequence records a regional drought rather than damaged samples. Relative to the four-century record surrounding it, however, this well-attested sequence remains ______: no other interval contains more than three successive narrow rings.",
      "clues": [
        "same sequence appears in wood from three separate valleys",
        "no other interval contains more than three"
      ],
      "key": "anomalous",
      "wrong": [
        [
          "spurious",
          "Independent samples establish that the sequence is genuine; it is its rarity within the record that needs describing."
        ],
        [
          "equivocal",
          "The replicated sequence is interpreted as drought, and the contrast with other intervals establishes an unusual pattern, not ambiguous evidence."
        ],
        [
          "emblematic",
          "No other interval contains more than three narrow rings, so this eight-ring sequence does not typify the record."
        ]
      ],
      "why": "Independent samples establish that the sequence is real, while the longer record establishes that it is exceptional. Anomalous describes its departure from the background pattern without calling the evidence spurious.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
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
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
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
  // assigns to something else. Every key recurs as a distractor elsewhere,
  // and the pool of thirty words is wide enough that a student cannot learn
  // it from a few drills.
  const WIC_STANCE_WORDS = new Set([
    "circumspect", "tendentious", "cursory", "exhaustive", "idiosyncratic", "derivative",
    "sanguine", "ambivalent", "polemical", "reticent", "meticulous", "dispassionate",
    "circumscribed", "archaic", "rudimentary", "diffident", "equivocal", "perfunctory", "candid", "pedantic",
    "laconic", "effusive", "hagiographic", "parochial", "eclectic", "credulous", "sardonic", "deferential",
    "desultory", "scrupulous",
  ]);

  const WIC_STANCE_TOPICS = [
    {
      "scene": "cs-irrin-ridge-furnace",
      "text": "The Irrin Ridge furnace would become the oldest known glass furnace if Hana Ruiz's preferred dating is confirmed. Her public announcement itemizes the evidence for that date as confidently as it lists two disturbances that might have mixed the soil layers. The press office called the discovery decisive; Ruiz withheld that description pending analysis of a second site, while insisting that her own measurements were accurate. Her stance toward the priority claim, rather than toward the quality of those measurements, is best described as ______.",
      "clues": [
        "withheld that description pending analysis",
        "rather than toward the quality"
      ],
      "key": "circumspect",
      "wrong": [
        [
          "diffident",
          "Ruiz defends her measurements confidently; her restraint concerns the conclusion they warrant, not her competence."
        ],
        [
          "reticent",
          "She publicly itemizes both supporting and adverse evidence; she is not reluctant to discuss the claim."
        ],
        [
          "tendentious",
          "She includes disturbances that could undermine her preferred date instead of suppressing them."
        ]
      ],
      "why": "Ruiz distinguishes sound measurements from a still-vulnerable priority claim and openly weighs objections. Circumspect names this deliberate caution, rather than self-doubt, silence, or partisan slant.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-callowmere-railway-report",
      "text": "The Callowmere railway report prints inspectors' warnings, accident totals, and testimony from injured passengers. Its sponsor advertises that completeness as proof of neutrality. In the analysis, however, every warning is discounted on a different convenient ground, every collision is attributed to passengers, and no adverse evidence is permitted to affect the recommendation to renew the company's charter. The report's reasoning is ______ even if its appendices are comprehensive: the selection operates among interpretations rather than among documents.",
      "clues": [
        "no adverse evidence is permitted to affect",
        "selection operates among interpretations"
      ],
      "key": "tendentious",
      "wrong": [
        [
          "exhaustive",
          "Comprehensive appendices concern documentary coverage; the blank targets reasoning that discounts adverse evidence."
        ],
        [
          "dispassionate",
          "Adverse evidence is systematically denied any influence over the recommendation, which defeats neutrality."
        ],
        [
          "cursory",
          "The report considers documents at length but always dismisses adverse implications; consistent slant, not superficiality, is the problem."
        ]
      ],
      "why": "Tendentious names reasoning systematically slanted toward the sponsor. Complete appendices do not make its interpretation dispassionate; the repeated pattern also goes beyond merely cursory work.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-ostrander-banners-catalog",
      "text": "The exhibition catalog devotes forty pages to the Ostrander tapestries and one paragraph to the twelve banners beside them. Reviewers did not object merely to unequal space: the short paragraph gives accurate dimensions but omits the banners' makers, imagery, and acquisition history, although all three are documented in the museum's files. The treatment of the banners is consequently ______. Its economy would have been defensible had it distilled that information instead of passing over it.",
      "clues": [
        "although all three are documented",
        "distilled that information instead of passing over it"
      ],
      "key": "cursory",
      "wrong": [
        [
          "laconic",
          "Brief expression could convey the essential information; the objection here is that essential available information is omitted."
        ],
        [
          "tendentious",
          "The omissions make the treatment superficial, but the passage identifies no favored cause or interpretation toward which it is slanted."
        ],
        [
          "meticulous",
          "Accurate dimensions do not compensate for overlooking all three central documented subjects."
        ]
      ],
      "why": "Cursory describes superficial treatment, not brevity alone. The final distinction between distilling and omitting information rules out the merely stylistic laconic.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-baltic-rye-prices",
      "text": "Petra Holmqvist's study excludes wheat, barley, and ports outside the Baltic, restrictions its introduction defends at length. Within the announced subject of Baltic rye prices, however, its coverage is ______: no major port or month between 1650 and 1800 is omitted, and an appendix reconciles all eleven measures found in the records. One reviewer objects to the choice of subject while conceding that the book leaves no gap inside it. The two judgments concern different aspects of the same book.",
      "clues": [
        "no major port or month",
        "Within the announced subject"
      ],
      "key": "exhaustive",
      "wrong": [
        [
          "circumscribed",
          "The topic is restricted, but the blank describes the completeness of coverage within it."
        ],
        [
          "cursory",
          "Every major port and month is represented, with measures reconciled, rather than treated superficially."
        ],
        [
          "idiosyncratic",
          "The text establishes systematic completeness, not peculiar personal rules."
        ]
      ],
      "why": "Exhaustive concerns completeness within a defined subject. Circumscribed fits the boundaries of that subject, but the blank explicitly targets how fully its contents are covered.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-heyer-diary-spelling",
      "text": "Transcribers first assumed that Tomas Heyer's unfamiliar spellings belonged to his century. Contemporary dictionaries and neighbors' letters, however, use none of his combinations: 'nite' sits beside 'lyght,' and weekday symbols recur nowhere outside his notebooks. Those symbols form a consistent, elaborate system that specialists can learn. The difficulty is thus not simply that Heyer's notation is old or undeveloped, but that it is ______; familiarity with ordinary period usage does not supply its rules.",
      "clues": [
        "recur nowhere outside his notebooks",
        "consistent, elaborate system"
      ],
      "key": "idiosyncratic",
      "wrong": [
        [
          "rudimentary",
          "The symbols form an elaborate system, not a basic undeveloped one."
        ],
        [
          "derivative",
          "No corresponding rules were found in contemporary sources from which he might have borrowed."
        ],
        [
          "archaic",
          "Ordinary writing from the same century does not share his system, so age does not account for its peculiarities."
        ]
      ],
      "why": "The system is elaborate, so not rudimentary, and differs from contemporary usage, so age alone does not explain it. Idiosyncratic identifies rules peculiar to Heyer rather than a standard inherited convention.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-tirel-letters-novel",
      "text": "Anselm Tirel's novel is often praised for never answering any of the letters through which its story unfolds. His teacher's earlier novel uses that device, follows the same sequence of misunderstandings, and names two characters identically. Tirel's defenders note that his ending is different and that his prose is recognizably his own. The discovery nevertheless makes the book's celebrated narrative design appear more ______; originality at the level of sentences does not explain the correspondences at the level in question.",
      "clues": [
        "same sequence of misunderstandings",
        "celebrated narrative design"
      ],
      "key": "derivative",
      "wrong": [
        [
          "polemical",
          "The discovery concerns dependence on a predecessor, not combative argument."
        ],
        [
          "idiosyncratic",
          "His prose may be distinctive, but the targeted design closely matches the teacher's work."
        ],
        [
          "tendentious",
          "The similarities concern narrative design, not an argument slanted to promote a cause."
        ]
      ],
      "why": "Derivative describes the design's dependence on an earlier model. Distinctive prose and a new ending do not eliminate that dependence; the passage distinguishes design from sentence-level individuality.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-carvenne-currency-reform",
      "text": "Ilse Maren's memorandum on Carvenne's currency reform lists the same possible failures as the economists who predict its collapse. She also proposes a reserve fund in case several occur together. Asked why she still backed the reform, she pointed to earlier recoveries and forecast falling inflation even under the less favorable projections. The reserve reflects caution about consequences; her judgment of the reform's prospects nevertheless remains ______, in contrast with the pessimism of colleagues who accept the same risk estimates.",
      "clues": [
        "forecast falling inflation even under the less favorable projections",
        "judgment of the reform's prospects"
      ],
      "key": "sanguine",
      "wrong": [
        [
          "diffident",
          "Maren backs the reform and offers a positive forecast, rather than doubting her own judgment."
        ],
        [
          "ambivalent",
          "Recognizing risks is compatible with her clear expectation of success; she is not torn between opposing judgments."
        ],
        [
          "circumspect",
          "The reserve fund is cautious, but the blank concerns her favorable forecast even under adverse projections."
        ]
      ],
      "why": "The contingency fund is cautious, but the blank targets her expectation of success even under adverse conditions. Sanguine captures that optimism without denying her preparation for risk.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-poet-city-letters",
      "text": "In the same letters, a poet celebrates her city's libraries and describes its noise as intolerable. These are not successive stages from disillusionment to enthusiasm: praise and complaint persist across thirty years. Nor do her canceled departures simply reflect financial constraints; she could afford to move and repeatedly chose to remain, only to plan another departure. Her attachment to the city is ______, even in the letters in which her plans for the following year are most definite.",
      "clues": [
        "praise and complaint persist",
        "canceled departures"
      ],
      "key": "ambivalent",
      "wrong": [
        [
          "reticent",
          "Her letters repeatedly express both praise and complaint in detail rather than keeping feelings private."
        ],
        [
          "sanguine",
          "Praise for the libraries does not erase persistent aversion to the noise or repeated plans to leave."
        ],
        [
          "polemical",
          "The private letters express opposing feelings, rather than mounting an aggressive argument against opponents."
        ]
      ],
      "why": "Ambivalent describes simultaneous attraction and aversion. Her detailed expression of both feelings rules out reticence, while selecting only the praise or complaint would miss the sustained conflict.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-obiora-repatriation-essay",
      "text": "Dana Obiora's essay carefully distinguishes uncertain provenance from documented theft and reproduces evidence favorable to museums as fully as evidence against them. Its argumentative manner, however, is unmistakably ______. Obiora addresses named directors as opponents, quotes their statements in order to attack their reasoning, and asks donors to put pressure on them. A reviewer who praised the essay's evidentiary fairness nevertheless warned readers not to mistake that fairness for neutrality in the dispute.",
      "clues": [
        "addresses named directors as opponents",
        "evidentiary fairness"
      ],
      "key": "polemical",
      "wrong": [
        [
          "reticent",
          "Obiora names her opponents, quotes their arguments, and calls for pressure openly; she does not keep her position to herself."
        ],
        [
          "dispassionate",
          "Careful evidence is compatible with a combative manner; the attacks and call for pressure determine the blank."
        ],
        [
          "equivocal",
          "The treatment of disputed provenance is nuanced, but the essay's position toward the directors is unambiguous."
        ]
      ],
      "why": "Polemical describes the essay's combative public argument. Its fair evidence does not make its argumentative manner neutral, and its attacks and call for pressure are both explicit.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-brekke-memoir",
      "text": "Johan Brekke's memoir recounts his engineering mistakes without excuses and describes future bridge projects with unreserved confidence. Reviewers consequently called its author both candid and sanguine. An editor preparing a family biography found a different pattern: Brekke's children appear only in a dedication, correspondence requests received printed acknowledgments, and passages about his marriage were removed before publication. Despite the memoir's openness elsewhere, Brekke's treatment of his private life remained ______.",
      "clues": [
        "passages about his marriage were removed",
        "openness elsewhere"
      ],
      "key": "reticent",
      "wrong": [
        [
          "candid",
          "His frankness about engineering mistakes does not extend to the family passages he removed."
        ],
        [
          "sanguine",
          "Optimism describes his professional forecasts, not the suppression of private material."
        ],
        [
          "meticulous",
          "Careful engineering records are a different feature from his unwillingness to discuss his family."
        ]
      ],
      "why": "Brekke's candor concerns professional mistakes, and his optimism concerns future projects. Omission and removal of family material show reticence specifically about private life, the blank's target.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-brunn-altarpiece-restoration",
      "text": "The Brunn restorers spent six months testing solvents and logged every previous repair before removing varnish. Their final treatment altered far fewer areas than another team's faster proposal would have altered, yet reviewers praised the extensive preliminary work. Hidden repairs changed which solvents could safely touch each panel, so details that initially seemed peripheral determined the treatment. The reviewers' description of the work as ______ recognizes that relation between attention and consequence, rather than praising detail irrespective of its use.",
      "clues": [
        "details that initially seemed peripheral determined the treatment",
        "relation between attention and consequence"
      ],
      "key": "meticulous",
      "wrong": [
        [
          "pedantic",
          "The details determine which solvents can safely be used, so the care is consequential rather than trivial."
        ],
        [
          "idiosyncratic",
          "The reviewers praise attention to evidence, not an unusual personal system."
        ],
        [
          "cursory",
          "Six months of tests and records of every repair are the opposite of superficial examination."
        ]
      ],
      "why": "Meticulous identifies useful, careful attention. Pedantic would fault attention to inconsequential detail, but the passage shows why these details controlled safe treatment.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-vells-flood-history",
      "text": "Mara Vells condemns several engineering decisions in her history of the flood that destroyed her family's farm. Yet her account also exonerates an official she had publicly blamed, reproduces records favorable to him, and declines to assign responsibility where documents are missing. A reviewer calls the method ______, despite the severe judgments it sometimes produces. Vells retained the corrections even after her family urged her to soften the passages favorable to the officials.",
      "clues": [
        "exonerates an official she had publicly blamed",
        "records favorable to him"
      ],
      "key": "dispassionate",
      "wrong": [
        [
          "perfunctory",
          "Vells tests decisions against records and makes corrections despite family objections, rather than going through the motions."
        ],
        [
          "polemical",
          "Some conclusions condemn, but the evidence-led method also exonerates an earlier target rather than sustaining an attack."
        ],
        [
          "equivocal",
          "Vells gives definite judgments where evidence permits them; withholding unsupported judgments does not make the method ambiguous."
        ]
      ],
      "why": "Dispassionate describes evidence-led assessment despite personal loss. Condemnation does not make the method polemical, and withholding conclusions only where documents fail does not make all its judgments equivocal.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-dahl-ice-journal",
      "text": "Ivar Dahl supplied relatives with long, intimate accounts of his crossing of the Varn ice cap. His expedition journal recorded every day's coordinates and supplies just as reliably, but its narrative entries were ______. Eleven days of storms received only 'Wind. Waited.' A later editor found no missing pages or reluctance to disclose the episode: Dahl described it at length elsewhere. Readers hoping for that longer account must therefore turn from the complete journal to the family correspondence.",
      "clues": [
        "no missing pages or reluctance to disclose",
        "narrative entries"
      ],
      "key": "laconic",
      "wrong": [
        [
          "reticent",
          "The long personal account shows willingness to disclose; the journal is brief rather than guarded."
        ],
        [
          "cursory",
          "Daily coordinates and supplies were reliably recorded, so brevity does not establish superficial coverage."
        ],
        [
          "effusive",
          "The journal's two-word entry contrasts with, rather than shares, the letters' abundance."
        ]
      ],
      "why": "Laconic names the journal's compressed expression. The separate evidence of full disclosure and reliable record keeping rules out reserve and superficiality.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-berg-letters-pear-tree",
      "text": "Anna Berg's letters use the same plain vocabulary as her famously spare novels, yet their manner surprised critics when the Kell Library published them. Even a short note lavishes praise on a pear tree as 'the most generous creature alive' and sends repeated declarations of affection to its recipient. Some letters are thirty pages, others half a page; both groups are ______. Editors who printed only the shortest notes found that their readers were just as surprised by Berg's voice.",
      "clues": [
        "both groups",
        "repeated declarations of affection"
      ],
      "key": "effusive",
      "wrong": [
        [
          "candid",
          "The text establishes abundant emotion, not frank disclosure of potentially uncomfortable truths."
        ],
        [
          "laconic",
          "Some letters are short, but even those overflow with affection rather than using restrained expression."
        ],
        [
          "reticent",
          "The novels' restraint does not characterize letters that repeatedly declare affection."
        ]
      ],
      "why": "Effusive describes overflowing expression of feeling shared by both short and long letters. Neither plain diction nor occasional brevity makes the letters reserved.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-ruiz-first-biography",
      "text": "Clara Ruiz's first biographer includes her temper, professional quarrels, and the lawsuit that nearly ended her career. Inclusion alone, however, has not persuaded later scholars that the portrait is balanced. Every angry outburst becomes righteous impatience; each quarrel demonstrates courage; the lawsuit proves that lesser colleagues envied her. The resulting account is ______ even where its reported events are accurate. Its idealization operates through interpretation, not simply through leaving inconvenient events out.",
      "clues": [
        "Every angry outburst becomes righteous impatience",
        "idealization operates through interpretation"
      ],
      "key": "hagiographic",
      "wrong": [
        [
          "exhaustive",
          "Including unfavorable events does not establish comprehensive coverage, and the blank concerns the consistently idealizing account."
        ],
        [
          "sardonic",
          "The interpretations turn faults into virtues sincerely, rather than mocking Ruiz."
        ],
        [
          "dispassionate",
          "Recasting every difficulty as virtue shows admiration determining interpretation rather than detached assessment."
        ]
      ],
      "why": "Hagiographic describes turning every difficulty into proof of virtue. Listing unfavorable events does not make their consistently reverent interpretation dispassionate or mocking.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-harlow-strike-history",
      "text": "The Harlow Historical Society's strike history accurately reproduces every surviving local factory ledger. Its authors claim that no external context is needed: walkouts in six neighboring towns and the arrival of organizers from Kell are mentioned only in a footnote dismissing their relevance. A reviewer accepts the book's local accuracy but calls its explanatory outlook ______. The criticism concerns which connections the authors consider worth understanding, not the care with which they transcribe the evidence they selected.",
      "clues": [
        "claim that no external context is needed",
        "explanatory outlook"
      ],
      "key": "parochial",
      "wrong": [
        [
          "hagiographic",
          "The criticism concerns the authors' narrow local outlook, not reverential idealization of a person."
        ],
        [
          "eclectic",
          "The authors reject outside context rather than draw on a broad variety of sources or traditions."
        ],
        [
          "exhaustive",
          "The transcription of local ledgers may be complete, but the blank asks about an outlook that dismisses neighboring events."
        ]
      ],
      "why": "Parochial identifies the narrow local outlook despite accurate detailed transcription. Exhaustive could describe the local ledgers, but not the explanatory scope the blank asks about.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-veen-ostby-library",
      "text": "Rosa Veen's Ostby library has a reading room modeled on a medieval vault, stairs adapted from an ocean liner, and a garden patterned after a Japanese moss court. A critic faults the building for borrowing, while another praises its unity. Both nevertheless call Veen's selection of sources ______. That agreement concerns the range from which she chose, not whether she copied carelessly or transformed each model into an original part of the finished design.",
      "clues": [
        "range from which she chose",
        "not whether she copied carelessly"
      ],
      "key": "eclectic",
      "wrong": [
        [
          "derivative",
          "One critic faults borrowing, but the blank isolates the breadth of the sources, on which both critics agree."
        ],
        [
          "archaic",
          "The medieval vault is only one source; the ocean liner and Japanese garden defeat a description restricted to an old period style."
        ],
        [
          "parochial",
          "Sources from different places and periods show breadth, the opposite of a narrow local horizon."
        ]
      ],
      "why": "Eclectic describes choosing from varied traditions. The text separates that shared judgment about range from the disputed judgment that the result is derivative.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-marsh-keswa-travels",
      "text": "Hugo Marsh checked river depths repeatedly and corrected several errors in earlier maps of the Keswa. His treatment of testimony followed a different standard. A guide's claim that giants built a village entered the book without qualification, as did a fisherman's report of three-hundred-year-old eels. Marsh's later editor verified the depth measurements but described the traveler's response to informants as ______. Precision about things he could measure had not led him to test the things he was told.",
      "clues": [
        "entered the book without qualification",
        "response to informants"
      ],
      "key": "credulous",
      "wrong": [
        [
          "circumspect",
          "Repeated measurements are careful, but he does not critically evaluate the informants targeted by the blank."
        ],
        [
          "sanguine",
          "Acceptance of unsupported stories is not the same as expecting favorable outcomes."
        ],
        [
          "desultory",
          "The passage contrasts standards of evidence, not disconnected or irregular effort."
        ]
      ],
      "why": "The blank concerns Marsh's acceptance of unsupported testimony, not his careful measurements. Credulous captures that readiness to believe; neither optimism nor irregular effort explains it.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-moreau-bridge-paint",
      "text": "At a hearing about the Varne Bridge, engineer Ilse Moreau agreed that protective coatings were useful after damaged steel was repaired. The council instead proposed concealing the damage with decorative blue paint. Moreau's response was ______: 'An excellent idea. Rust is well known to be afraid of blue.' The secretary entered the first sentence as an endorsement; Moreau later insisted that the second sentence, not her views about properly prepared coatings, supplied the meaning of the remark.",
      "clues": [
        "concealing the damage with decorative blue paint",
        "secretary entered the first sentence as an endorsement"
      ],
      "key": "sardonic",
      "wrong": [
        [
          "sanguine",
          "Her apparent praise is undone by the absurd claim that rust fears a color."
        ],
        [
          "effusive",
          "The first sentence alone sounds approving, but the second turns it into mockery."
        ],
        [
          "credulous",
          "She distinguishes protective treatment from concealing damage; her ironic remark does not accept the cosmetic plan."
        ]
      ],
      "why": "The absurd second sentence turns apparent praise into mockery of this cosmetic proposal. Sardonic describes her tone; her support for real protective treatment does not make the remark sincere approval.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-serra-brenn-rehearsal",
      "text": "Paolo Serra disagreed openly with Lotte Brenn about the tempo of her suite and demonstrated his alternative at rehearsal. When she rejected it, he used her marking without resentment, explaining that the composer should decide the final version. His memoir describes the exchange in detail, including his continued preference for his own tempo. Serra's behavior was therefore ______ without being silent agreement: he distinguished having a judgment from claiming the authority to impose it.",
      "clues": [
        "composer should decide the final version",
        "without being silent agreement"
      ],
      "key": "deferential",
      "wrong": [
        [
          "diffident",
          "Serra states and demonstrates his judgment confidently; yielding final authority does not establish insecurity."
        ],
        [
          "candid",
          "The memoir is frank, but the blank targets his conduct in accepting Brenn's authority, not his disclosure of the disagreement."
        ],
        [
          "polemical",
          "He explains a disagreement but accepts the composer's final decision without turning it into a combative dispute."
        ]
      ],
      "why": "Deferential describes respect for Brenn's final authority despite a firmly expressed disagreement. The text distinguishes deference from self-doubt or unspoken assent.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-flood-committee-inquiry",
      "text": "The flood committee produced careful maps of one district and a detailed account of a single drainage tunnel. Neither project belonged to an agreed plan. Meetings repeatedly shifted from drains to river walls and back; a citywide survey was begun, abandoned, then restarted with incompatible forms. Calling the inquiry ______ does not deny the quality of its isolated results. The chair could present those results but could not say which remaining districts would be investigated next.",
      "clues": [
        "Neither project belonged to an agreed plan",
        "which remaining districts"
      ],
      "key": "desultory",
      "wrong": [
        [
          "deferential",
          "Nothing identifies an authority whose judgment the committee follows."
        ],
        [
          "scrupulous",
          "Some isolated results are careful, but the inquiry as a whole lacks a consistent plan and abandons incompatible work."
        ],
        [
          "exhaustive",
          "Several disconnected projects and no plan for remaining districts do not make complete coverage."
        ]
      ],
      "why": "Desultory describes disconnected, inconsistent effort. Individual careful results do not establish a scrupulous or exhaustive inquiry as a whole, and nothing indicates deference to authority.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
    },
    {
      "scene": "cs-aberg-letter-correction",
      "text": "Nils Aberg discovered that he had dated a Vasko letter one year too early. The error looked small, but it placed the letter before the inheritance dispute it actually answered and reversed a later biographer's account of Vasko's motives. Aberg reprinted it, notified every library holding the edition, and explained his own mistake. Scholars called him ______ rather than pedantic: his insistence on an exact date repaired an interpretation instead of protecting a trivial point for its own sake.",
      "clues": [
        "reversed a later biographer's account",
        "repaired an interpretation"
      ],
      "key": "scrupulous",
      "wrong": [
        [
          "pedantic",
          "The date materially changes interpretation of motives; correcting it is not fussiness over an inconsequential detail."
        ],
        [
          "idiosyncratic",
          "The passage justifies his thorough correction by its scholarly consequences, not by unusual personal conventions."
        ],
        [
          "cursory",
          "Reprinting, notifying libraries, and acknowledging the mistake show more than superficial treatment."
        ]
      ],
      "why": "Scrupulous names conscientious attention to an error with material consequences. The explanation of those consequences rules out pedantic, even though both can involve insistence on detail.",
      "trap": "Transferring a description of one claim, feature, or speaker to the different one the blank asks about.",
      "hint": "Which particular claim or quality is being evaluated, and which details bear directly on it?"
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
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
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
    difficulty: "Medium",
    title: "Word used in an older sense in period prose",
    recognize:
      "In prose written in an older style, a familiar word carries a sense now old-fashioned; its modern meaning is offered and does not fit, and the surrounding detail settles the older sense.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
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

  // Begin additional design: meaning-constraints.
  /* ----------------------- Meaning constrained by referent and later outcome */

  // Original scenes juxtapose real, neighboring senses in one discourse.
  // Their later consequences distinguish the sense attached to the target.
  // Structural checks do not establish linguistic meaning or difficulty.
  const WIC_SEPARATED_CONSTRAINT_TOPICS = [
    {
      "scene": "cs-constraints-pottery-dates",
      "text": "In the catalog of the fictional Lorn excavation, pottery dates and timber dates placed the same workshop in different centuries. The editors accommodated this discrepancy while preparing a revised chronology. Their preliminary work had uncovered copied numerals, and several entries now bore corrected dates. In the published chart, however, the workshop appeared as two adjoining bands, each marked with the symbol of a dating method. A reader following either symbol through the chart could construct a continuous sequence, although the two sequences assigned different ages to the workshop's foundation.",
      "word": "accommodated",
      "object": "this discrepancy",
      "consequence": "the workshop appeared as two adjoining bands",
      "key": "made allowance for",
      "wrong": [
        [
          "brought into agreement",
          "The corrected entries make reconciliation plausible. But the target discrepancy concerns the workshop, whose two method-based sequences still assign different ages to its foundation. The chart accommodates both estimates rather than harmonizing them."
        ],
        [
          "explained away",
          "Finding copied numerals explains why some entries needed correction. The two surviving sequences do not establish that such errors explain the disagreement between the workshop's pottery and timber dates."
        ],
        [
          "compensated for the effects of",
          "An offset or correction could compensate for biased estimates. Here each dating method still yields its own sequence and age for the foundation; the revision makes room for both instead of canceling their disagreement."
        ]
      ],
      "why": "The editors correct some entries, but the particular discrepancy named by accommodated remains in the workshop's two distinct ages. The new chart permits readers to follow either dating sequence. Accommodated therefore means made allowance for: the format can represent the unresolved discrepancy without reconciling it or correcting its effects.",
      "steps": [
        "Identify the discrepancy attached to accommodated: two dating methods assign different ages to the same workshop.",
        "Distinguish the nearby corrections to individual entries from what the revised chart does with that workshop.",
        "Trace both symbols through the final chart: each remains a continuous sequence with a different foundation date, requiring a sense that allows disagreement to persist."
      ],
      "trap": "Transferring an actual correction made elsewhere in the catalog to the unresolved disagreement that the target verb describes.",
      "hint": "Follow the workshop's two estimates through the revision, separately from the corrected entries."
    },
    {
      "scene": "cs-constraints-freight-agreement",
      "text": "Three shipping bulletins from the fictional ports of Merrow and Vey initially appeared to corroborate a fall in freight prices. A historian discounted their agreement after comparing the tables. Alongside different local commentaries, all three printed the same unusual sequence of rates and the same misplaced footnote. Her estimate of the size of the fall eventually rested on merchants' dated invoices. When explaining why merchants in both ports began demanding lower charges, however, she used the bulletins' matching tables to establish which quotations had circulated across the region.",
      "word": "discounted",
      "object": "their agreement",
      "consequence": "she used the bulletins' matching tables to establish which quotations had circulated",
      "key": "treated as less conclusive",
      "wrong": [
        [
          "dismissed as irrelevant",
          "The historian bases the price estimate on invoices, which makes exclusion tempting. Yet she uses the matching tables to support a claim about circulated quotations: their agreement still contributes to her explanation, in a more limited role."
        ],
        [
          "judged to be factually false",
          "The shared footnote suggests dependence among reports, not that their quoted rates are false. The historian can use the agreement to trace circulation without treating three dependent reports as independent confirmation of the price change."
        ],
        [
          "regarded as already explained",
          "The repeated features suggest a common source, but the force of discounted concerns how much the agreement establishes. The subsequent use of invoices and the bulletins for different claims shows a reassessment of evidence rather than merely an explanation of its origin."
        ]
      ],
      "why": "The same misplaced footnote makes the agreement less persuasive as independent corroboration of a price fall. Its later use to establish circulation shows that it has not become worthless or false. Discounted means treated as less conclusive: the historian limits what the agreement can establish while still using it for a different inference.",
      "steps": [
        "Infer why the shared unusual ordering and misplaced footnote matter despite the bulletins' different local commentaries.",
        "Compare the two later claims: invoices support the price estimate, while matching bulletin tables support the circulation account.",
        "Choose a reduction in evidential force rather than total exclusion, factual rejection, or a statement solely about origins."
      ],
      "trap": "Treating evidence that is inadequate for one inference as evidence that has been rejected for every purpose.",
      "hint": "What does the agreement cease to establish on its own, and what can it still establish?"
    },
    {
      "scene": "cs-constraints-migration-model",
      "text": "After restoring damaged observations from the fictional Veyra marsh, an ecology team built a simulation of animals moving between feeding sites. Its first successful run recovered the two peaks in nightly activity that had prompted the project. The model used measured travel times and food supplies as inputs, with its rules fixed before another team unsealed the nightly timing records. In the later comparison, simulated animals clustered at two times separated by almost the same interval as the peaks on the observation sheets, although the total number of visits differed.",
      "word": "recovered",
      "object": "the two peaks in nightly activity",
      "consequence": "simulated animals clustered at two times separated by almost the same interval",
      "key": "reproduced",
      "wrong": [
        [
          "retrieved",
          "Restoring damaged observations is a real earlier action, but the run uses travel times and food supplies while the timing records remain sealed. It generates a corresponding pattern rather than obtaining those records again."
        ],
        [
          "corrected",
          "The different visit totals might suggest a revision of the observations. The object of recovered is the two-peak pattern, however, and the comparison matches that pattern rather than identifying and repairing an error in it."
        ],
        [
          "discovered",
          "The peaks already prompted the project. The run independently produces their spacing under fixed rules; it does not mark the first identification of the observed pattern."
        ]
      ],
      "why": "Recovered refers to the two-peak pattern, not the restored sheets or the total number of visits. The pattern was already known, its timing records were withheld while the model's rules were fixed, and the later output matched its spacing. Those facts together make reproduced the precise sense.",
      "steps": [
        "Keep the restored observations, the known two-peak pattern, and the simulated visit totals distinct.",
        "Check which information was available when the model's rules were fixed and which was unsealed afterward.",
        "Use the later match in spacing to identify reproduction of a pattern, rather than retrieval, correction, or first discovery."
      ],
      "trap": "Applying the earlier record-restoration activity to what the simulation accomplishes, or mistaking a fresh reproduction for an initial discovery.",
      "hint": "Track what was known before the run and exactly which feature matches in the later comparison."
    },
    {
      "scene": "cs-constraints-bell-economy",
      "text": "Readers of the fictional novel The Bell Road often praise its elaborate descriptions of shops, but a critic locates its economy in the recurring market bell. An early ringing interrupts a father just before he answers his son's question. Much later, a witness dates an encounter by recalling two extra strokes; readers have heard those strokes during the festival from which the suspect returned early. In the last chapter, the adult son hears the bell while deciding how to answer the same question from his own child. Between these scenes lie inventories of fabrics, tools, and fruit.",
      "word": "economy",
      "object": "the recurring market bell",
      "consequence": "the adult son hears the bell while deciding how to answer the same question",
      "key": "efficient reuse of narrative material",
      "wrong": [
        [
          "restraint in the quantity of description",
          "The target is the critic's judgment about the recurring bell. The surrounding inventories and elaborate shops make the novel descriptively abundant; the bell's return matters because one element does several kinds of narrative work, not because description is scarce."
        ],
        [
          "selective withholding of narrative information",
          "The first ringing does delay an answer, so withholding is genuinely present. Later appearances help establish an encounter's date and connect the son's choice to his father's, which makes that single function too narrow an account of the bell's economy."
        ],
        [
          "simplification of the story's causal structure",
          "The bell links events across different times and connects an investigation with a family dilemma. These uses add relationships; they do not reduce the plot to a simpler chain of causes."
        ]
      ],
      "why": "The bell delays a disclosure, helps locate an encounter in time, and links two generations' choices. The critic's economy concerns how much work this recurring element performs. The novel's abundant description and the bell's varied functions distinguish efficient reuse from sparseness, withholding alone, or a simplified plot.",
      "steps": [
        "Identify what the critic calls economical: the handling of the recurring bell rather than the novel's general descriptive style.",
        "Connect the bell's separated appearances to the different tasks they perform in disclosure, timing, and the family parallel.",
        "Choose efficient use of one element for several purposes, rather than a reduction in description or a single local effect."
      ],
      "trap": "Taking economy to mean less material, or choosing the true effect of the bell's first appearance as if it explained the whole recurring device.",
      "hint": "Compare what the same detail accomplishes at each of its separated appearances."
    },
    {
      "scene": "cs-constraints-weather-signals",
      "text": "Two teams studying the fictional Talven basin disagreed about whether warming triggered an afternoon wind shift or followed it. A new station instrument resolved the event that each team had interpreted as evidence for its account. Its record yielded a temperature curve and a wind curve, each with a recognizable onset where the old display had shown a single broad disturbance. The clocks governing the two channels could differ by several seconds, however, and the apparent gap between the onsets lay inside that margin. Both teams added the new curves to their reports.",
      "word": "resolved",
      "object": "the event",
      "consequence": "the apparent gap between the onsets lay inside that margin",
      "key": "distinguished its component changes",
      "wrong": [
        [
          "identified its underlying cause",
          "The teams' competing explanations make causal resolution tempting. But channel-clock uncertainty is greater than the apparent gap, so separating the temperature and wind onsets does not determine which initiated the other."
        ],
        [
          "established its precise timing",
          "Each onset can be recognized on its own curve, but the clocks may differ by several seconds. Recognizable components do not amount to precisely synchronized timing of the overall event."
        ],
        [
          "reconciled its competing interpretations",
          "Both teams include the new curves, but inclusion is not agreement. The unresolved ordering still permits both accounts; the instrument has clarified the components rather than harmonized the explanations."
        ]
      ],
      "why": "The instrument turns one broad disturbance into separately recognizable temperature and wind changes. The later clock margin prevents that improvement from fixing exact relative timing or causal order. Resolved therefore describes distinguishing the event's components, while the explanatory dispute remains open.",
      "steps": [
        "Identify the new information in the instrument's record: two recognizable onsets instead of one broad disturbance.",
        "Compare the apparent gap with the possible difference between the channel clocks.",
        "Separate improved differentiation of components from precise timing, causal explanation, and agreement between investigators."
      ],
      "trap": "Assuming that making separate parts of a phenomenon visible also settles how those parts are causally related.",
      "hint": "Which uncertainty does having two curves remove, and which uncertainty does the clock margin preserve?"
    },
    {
      "scene": "cs-constraints-dance-experiments",
      "text": "The fictional choreographer Mara Venn left diagrams for dances in which performers chose routes while following a shared pulse. Her students took up these experiments in a production whose opening followed one diagram closely enough for its numbered paths to appear in the program. Later rounds used the same paths but let each dancer's turn alter the pulse heard by the others. A phrase completed in unison during the opening spread across several beats in one round and compressed in the next, depending on which dancer first changed direction.",
      "word": "took up",
      "object": "these experiments",
      "consequence": "spread across several beats in one round and compressed in the next",
      "key": "continued the line of inquiry",
      "wrong": [
        [
          "recreated the procedure",
          "The opening does reconstruct a notebook procedure, so this reading has real support in part of the performance. But the target refers to the students' treatment of the experiments across the production, including later tests of a changed relation between route and pulse."
        ],
        [
          "adopted an established solution",
          "A notebook diagram supplies the opening, but the subsequent rounds vary the rule and produce different outcomes. The experiments serve as an inquiry to pursue, not a settled procedure simply applied to achieve a known result."
        ],
        [
          "challenged the guiding principle",
          "The later rounds alter how the pulse is generated, but they continue to explore the relation between collective timing and individual routes. Their varied outcomes do not by themselves make the production an objection to that underlying inquiry."
        ]
      ],
      "why": "The faithful opening gives reconstruction a foothold, while the later reciprocal changes between movement and pulse extend the problem the notebooks explored. Taken across the production, took up means continued the line of inquiry. The students use an earlier procedure as the starting point for new trials, rather than merely reproduce it or treat it as a settled answer.",
      "steps": [
        "Distinguish the production as a whole from its closely reconstructed opening.",
        "Compare the opening's fixed pulse with later rounds in which turns change the pulse and the same phrase has variable timing.",
        "Identify continued investigation of a relation, rather than faithful reconstruction alone, application of a settled solution, or rejection of the inquiry."
      ],
      "trap": "Allowing one faithfully reconstructed part of a work to determine a phrase that describes the work's broader engagement with its source.",
      "hint": "What remains the subject of exploration when the students move from the opening to the later rounds?"
    },
    {
      "scene": "cs-constraints-hall-reflection",
      "text": "For a concert celebrating the fictional Arven Hall, a program displayed drawings of the building beside an account of its restoration. A reviewer wrote that the pacing of the commissioned score reflected the hall. The composer had retained the melody from an early draft but altered the intervals between entries after rehearsals beneath its stone vault. When the piece moved to a carpeted room, the conductor shortened those intervals: there the preceding notes faded before the next players were due to enter, leaving gaps that had been filled by lingering sound at Arven.",
      "word": "reflected",
      "object": "the hall",
      "consequence": "leaving gaps that had been filled by lingering sound at Arven",
      "key": "bore the influence of",
      "wrong": [
        [
          "offered a likeness of",
          "The program's drawings represent the hall, and a commemorative score could also portray it. But the later room comparison ties the pacing to sound decay, showing the hall's effect on the work rather than a musical imitation of its appearance."
        ],
        [
          "expressed an appraisal of",
          "The concert celebrates a restoration, which supplies an evaluative context. The specific pacing, however, changes to fit how long notes persist in different rooms; that consequence does not identify a favorable or unfavorable judgment about the building."
        ],
        [
          "established a correspondence with",
          "The program associates music and architecture, but the draft, rehearsal, and changed-room sequence establish a direction of influence. The pacing responds to the hall's acoustics rather than merely being placed in a suggestive relation with the building."
        ]
      ],
      "why": "Reflected concerns the score's pacing, not the program's drawings or the occasion's praise. Rehearsals changed the spacing between entries, and the carpeted-room performance exposes what those spaces had accommodated: the original hall's lingering sound. The pacing thus bore the influence of the hall rather than portraying or appraising it.",
      "steps": [
        "Locate the subject of reflected: the pacing, rather than the melody, illustrations, or commemorative occasion.",
        "Link the change after rehearsals with what happens to the same intervals in the carpeted room.",
        "Infer influence from the acoustic setting, distinguishing that relation from resemblance, appraisal, or association alone."
      ],
      "trap": "Transferring the program's representational or commemorative function to a musical feature whose form arises from the performance setting.",
      "hint": "Why do the same intervals work differently in the two rooms, and what does that reveal about their origin?"
    },
    {
      "scene": "cs-constraints-arbitrary-cycle",
      "text": "An analyst studying a fictional six-part percussion work chose an arbitrary starting point for comparing performances. At the beginning of each performance, software had shuffled the instruments assigned to the six parts; the analyst transcribed each performance after this assignment was fixed. She arranged its parts around a circle and began her list with whichever part appeared first in the recording notes. A colleague began with the loudest part instead. Their lists differed, but each adjacent pair appeared in the same order, including the pair formed by the last and first entries.",
      "word": "arbitrary",
      "object": "starting point",
      "consequence": "each adjacent pair appeared in the same order",
      "key": "freely selectable without altering the relationships",
      "wrong": [
        [
          "determined by a process of random selection",
          "The instruments are randomly assigned before analysis, but the starting point comes from the notes or the colleague's loudness criterion. The invariant circular relationships explain why either choice is permissible; they do not make either choice a random draw."
        ],
        [
          "chosen without a defensible reason or method",
          "Each analyst has an explicit method for choosing a first entry. The circular pair relationships survive either method, making the selection nonbinding for the comparison rather than unjustified."
        ],
        [
          "provisionally adopted pending a more accurate choice",
          "The two lists begin differently yet preserve every adjacent pair, including the closing pair. That result makes a uniquely accurate beginning unnecessary for the stated comparison, rather than something still to be determined."
        ]
      ],
      "why": "Arbitrary modifies the analyst's starting point, not the earlier randomized instrument assignment. Both analysts use definite selection rules, and moving the first entry preserves the circular relationships they compare. The starting point is therefore freely selectable without altering those relationships, rather than random, unsupported, or awaiting correction.",
      "steps": [
        "Separate the software's random assignment from the analyst's later choice of where a circular list begins.",
        "Compare the two analysts' choices and include the last-to-first pair when tracking preserved relationships.",
        "Infer that the freedom lies in choosing any beginning that leaves the relevant structure intact, not in choosing unpredictably or without reason."
      ],
      "trap": "Treating arbitrary as random because an earlier stage is randomized, or treating a nonunique convention as a defective choice.",
      "hint": "What changes between the two lists, and what remains invariant when the closing pair is included?"
    },
    {
      "scene": "cs-constraints-effective-string",
      "text": "In a fictional instrument workshop, an engineer praised a new clamp for its reliable tuning and noted that it changed a string's effective length. A ruler still showed the same distance between the string's two end supports. The clamp gripped the string partway along that distance. Moving it toward one support and plucking the intervening segment raised the note. An otherwise identical string, mounted between supports matching that shorter span, gave the same note at the same tension. A diagram in the manual nevertheless labeled the full support-to-support distance as the standard length.",
      "word": "effective",
      "object": "length",
      "consequence": "mounted between supports matching that shorter span, gave the same note",
      "key": "operative under the stated conditions",
      "wrong": [
        [
          "optimal under the stated conditions",
          "The clamp's reliable tuning supports a judgment of success, but effective modifies length. Different clamp positions produce different matching notes; the passage identifies the span that functions, not one length judged best."
        ],
        [
          "measured between the fixed supports",
          "The ruler measures the full support-to-support span, which stays fixed. The clamp changes the length relevant to the note, as the comparison with the shorter second string demonstrates."
        ],
        [
          "defined between the fixed supports",
          "The manual explicitly uses the full span as its standard. The acoustic comparison instead singles out the span affected by the clamp, so effective is not naming the reference convention."
        ]
      ],
      "why": "The ruler's total span and the manual's standard stay fixed, while moving the clamp changes the note. A separately mounted string matching the shortened span gives the same note under the same tension. Effective therefore identifies the length operative in the behavior being studied, not a successful design, measured total, or reference standard.",
      "steps": [
        "Identify what effective modifies: a length, rather than the clamp's overall success.",
        "Connect the moving clamp's effect with the comparison string at equal tension.",
        "Distinguish the functionally active span from the fixed physical distance and the manual's labeling convention."
      ],
      "trap": "Transferring the praise of a successful device to an adjective that instead identifies which physical span governs its behavior.",
      "hint": "Which length changes with the note, and which two lengths remain fixed by measurement or convention?"
    },
    {
      "scene": "cs-constraints-critical-currency",
      "text": "An essay about the fictional painter Sera Noll divided her works into 'enclosed' and 'exposed' periods, a distinction that soon gained currency. The essay received an award and became a standard entry on course reading lists. A later catalogue used the two labels to argue that several paintings assigned to the enclosed period share the exposed period's handling of space. Another critic organized a review around the labels while proposing that the apparent division arose from changes in available canvases rather than a change in Noll's intentions.",
      "word": "currency",
      "object": "a distinction",
      "consequence": "Another critic organized a review around the labels",
      "key": "use as a shared critical vocabulary",
      "wrong": [
        [
          "acceptance as historical fact",
          "The award and reading-list status make acceptance plausible. Yet later writers use the distinction while contesting its boundaries or explanation; their use shows that it has entered discussion without establishing consensus that it is historically correct."
        ],
        [
          "precision in classifying the paintings",
          "The catalogue challenges how particular paintings fit the two categories, and the review offers a different basis for the division. Reusing the labels does not demonstrate that their application has become more precise."
        ],
        [
          "usefulness for classifying the paintings",
          "The terminology provides a shared point around which critics organize arguments. The catalogue uses it to expose works that complicate the grouping, so circulation of the terms does not itself demonstrate their usefulness for assigning paintings to periods."
        ]
      ],
      "why": "The prize and course lists establish prominence, but the later catalogue and review show what circulates: a pair of labels that writers can use while challenging the original division. Currency therefore means widespread use as a point of reference, not settled agreement about the claim or greater precision in applying it.",
      "steps": [
        "Identify what gains currency: the period distinction, not simply the prizewinning essay or the painter's reputation.",
        "Compare the later writers' use of the labels with what they dispute about the division.",
        "Distinguish a framework's circulation in debate from agreement that its historical claims are correct or that its categories work reliably."
      ],
      "trap": "Treating prominence and repeated citation as agreement, even when the later uses turn the same vocabulary against the original interpretation.",
      "hint": "What do the later writers share with the original essay, and what do they continue to dispute?"
    }
  ];

  const wicSeparatedConstraints = {
    id: "wic-separated-context-constraints",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "meaning in context",
    difficulty: "Hard",
    title: "Familiar expression constrained by its referent and later consequences",
    recognize:
      "Identify the particular object or feature the expression describes, then reconcile its role with separated evidence about what changes or remains invariant. Nearby activities support neighboring senses, and a true description of another feature can still misread the target expression.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["word-association", "common-meaning", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(WIC_SEPARATED_CONSTRAINT_TOPICS);
      const wrong = topic.wrong.map(([text, reason]) => [text, reason]);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.text },
        stem: WIC_meaningStem(topic.word),
        correct: topic.key,
        wrong,
        explanation: topic.why,
        steps: topic.steps,
        principles: [
          "A familiar expression can have several abstract senses. Its grammatical referent and the consequences described later must support the same reading.",
          "A nearby activity can suggest a real meaning of a word without being the activity that the word describes in this sentence.",
        ],
        trap: topic.trap,
        hint: topic.hint,
        estimatedSeconds: 110,
        // These are structural guards. Choosing the uniquely appropriate sense
        // and judging difficulty still require independent editorial reading.
        verify: () =>
          WIC_occurrences(topic.text, topic.word) === 1 &&
          WIC_occurrences(topic.text, topic.key) === 0 &&
          topic.text.includes(topic.object) &&
          topic.text.includes(topic.consequence) &&
          topic.text.indexOf(topic.consequence) > WIC_indexOfWord(topic.text, topic.word) + topic.word.length + topic.object.length &&
          topic.text.length >= 150 && topic.text.length <= 900 &&
          new Set([topic.key, ...wrong.map(([text]) => text)]).size === 4,
      };
    },
  };
  // End additional design: meaning-constraints.

  // Begin additional design: precision-relational.
  /* ------------------------- Precise relation beneath surface similarity */

  // Original scenarios contrast a conspicuous resemblance or difference with
  // a relation that emerges only after origin, function, or influence is traced.
  // These checks establish the authored shape, not the semantic uniqueness of
  // the key; the complete finite bank still needs independent editorial review.
  const WIC_LATENT_RELATION_TOPICS = [
    {
      "scene": "cs-latent-folding-supports",
      "text": "A shelter designer and a stage designer first exchanged work at an autumn fair. Both had used a catalogue of individual hinges, and afterward the stage designer adopted the shelter's locking device. A review of their spring prototypes, however, found three ribs carrying weight to a single foot in each; the catalogue pictured joints separately, and the prototypes used different locks. Although the final stage plainly bears the shelter's influence, the development of this load-bearing arrangement was ______.",
      "clues": [
        "first exchanged work at an autumn fair",
        "spring prototypes",
        "catalogue pictured joints separately"
      ],
      "key": "convergent",
      "wrong": [
        [
          "derivative",
          "The stage's final locking device does come from the shelter, and both use a hinge catalogue. But the blank concerns the assembled load-bearing arrangement: both spring prototypes already contain it before the autumn exchange, and the catalogue supplies only individual joints."
        ],
        [
          "collaborative",
          "The designers eventually exchange work, making collaboration a plausible account of their finished products. The load-bearing arrangement is already present in each spring prototype, so that later exchange cannot account for its development."
        ],
        [
          "cumulative",
          "The finished stage accumulates an additional feature when it adopts the shelter's lock. The blank instead compares how the same arrangement appears in two earlier prototypes; that is not one design growing by successive additions from the other."
        ]
      ],
      "why": "Convergent describes separate developments arriving at a similar result. Three facts must be combined: the shared arrangement is already in the spring prototypes, exchange begins in autumn, and the common catalogue supplies joints rather than assembled frames. The later borrowing is real but concerns a different feature.",
      "steps": [
        "Identify the feature named by the blank: the load-bearing arrangement, rather than the final lock or the individual hinges.",
        "Place the spring prototypes before the autumn exchange, then check whether the common catalogue supplied their arrangement.",
        "Distinguish separate arrival at a similar frame from the later borrowing and accumulated features of the finished stage."
      ],
      "trap": "Transferring genuine evidence of borrowing in one feature to the origin of a different feature that existed earlier.",
      "hint": "Which shared feature was already present at each stage of the timeline?"
    },
    {
      "scene": "cs-latent-workshop-records",
      "text": "An archivist finds two annual registers for Bellam's one-person workshops. Apart from a small code, both record just receipts and stall numbers, but one organizes entries under artisans' names and the other under crafts. When the market moved, stall numbers were reassigned, which seems to frustrate a history of individual careers. That code beside each entry comes from a license issued once to an artisan and carried to any new stall. For tracing changes in the work practiced by named artisans, the registers are ______.",
      "clues": [
        "one organizes entries under artisans' names",
        "the other under crafts",
        "issued once to an artisan and carried to any new stall"
      ],
      "key": "complementary",
      "wrong": [
        [
          "redundant",
          "The repeated receipts and stall numbers make the registers look duplicative. The task requires connecting a named artisan with a craft over time, and the two organizational schemes supply different parts of that connection."
        ],
        [
          "incompatible",
          "Reassigned stall numbers initially make matching the records seem unreliable. The license code follows the artisan rather than the stall, providing a stable connection between the registers and across years."
        ],
        [
          "interchangeable",
          "Either register may suffice for some questions about receipts. For named artisans' occupational changes, substituting one for the other loses either the names or the crafts needed for the reconstruction."
        ]
      ],
      "why": "Complementary means supplying different contributions that work together. Names and crafts come from separate registers, while the persistent license code makes it possible to connect those contributions despite changing stall numbers. Repetition of receipts does not make the records redundant for this particular task.",
      "steps": [
        "Determine which information identifies an artisan and which identifies the artisan's craft.",
        "Test the two possible links: stall numbers change, but license codes follow the same artisans.",
        "Judge the registers' combined usefulness for the stated task, rather than their repeated financial information or their changing addresses."
      ],
      "trap": "Stopping at either the duplicated columns or the changed stall numbers without checking the stable identifier and the task.",
      "hint": "Which label follows a person, and which follows a place?"
    },
    {
      "scene": "cs-latent-marsh-feedback",
      "text": "In a marsh simulation, tanks planted densely acquire deeper sediment than sparsely planted tanks after identical tides. The designers initially regard sediment as a record of the starting vegetation. In a second trial, all tanks begin with equal stands; a screen removes sediment from the incoming water of half the tanks while preserving its speed and chemistry. Months later, new shoots are scarcer in those screened tanks. Taken together, the trials indicate that the causal relationship between vegetation and accumulated sediment is ______.",
      "clues": [
        "densely acquire deeper sediment",
        "all tanks begin with equal stands",
        "new shoots are scarcer in those screened tanks"
      ],
      "key": "reciprocal",
      "wrong": [
        [
          "sequential",
          "The first trial places vegetation before sediment accumulation, so a one-way sequence is tempting. The second trial changes sediment supply while holding the starting vegetation constant and finds a later vegetation difference, adding influence in the reverse direction."
        ],
        [
          "proportional",
          "Denser vegetation accompanies deeper sediment in the first trial, but neither trial establishes a fixed ratio between them. The second trial is informative about direction of influence, not the size of a proportional response."
        ],
        [
          "incidental",
          "Shared tides or favorable starting conditions could initially make the two quantities appear merely associated. The two controlled comparisons separately vary vegetation and sediment supply, connecting each with a change in the other."
        ]
      ],
      "why": "Reciprocal means involving influence in both directions. The first comparison links different starting vegetation to different sediment accumulation. The second begins with equal vegetation and isolates sediment supply, after which vegetation differs. Neither result alone establishes the full relation; together they show both directions.",
      "steps": [
        "Identify what differs at the start of the first trial and what differs afterward.",
        "In the second trial, hold the equal starting stands and unchanged water conditions in view when interpreting the later shoots.",
        "Combine the two inferred directions of influence, without assuming they have equal strength or a fixed ratio."
      ],
      "trap": "Treating the second trial as another observation of the original sequence instead of an intervention on the original outcome.",
      "hint": "Which factor is varied first in each trial, and which is measured later?"
    },
    {
      "scene": "cs-latent-score-architecture",
      "text": "An early notation gives each musical section a number and tells performers to proceed to the next number. A later notation gives each section a symbol and marks the permitted destinations from it. In its first published score, each nonfinal symbol has just one destination, and a performance follows the old score's sequence. A second score uses the same notation but offers two destinations at some symbols, so different performances can take different routes. Despite the first demonstration's resemblance to the old method, the later notation ______ it.",
      "clues": [
        "each nonfinal symbol has just one destination",
        "same notation but offers two destinations"
      ],
      "key": "generalizes",
      "wrong": [
        [
          "transcribes",
          "The first score could look like the old sequence rewritten in symbols. But the second uses the very same rules to permit alternative routes, which the fixed numerical sequence cannot express."
        ],
        [
          "supersedes",
          "A broader notation might eventually replace the earlier one, but the text establishes its expressive scope, not the earlier method's abandonment or obsolescence. A fixed sequence still works within the later rules."
        ],
        [
          "reconciles",
          "The scores display fixed and branching routes, but there are not two incompatible old prescriptions that the later notation brings into agreement. One set of rules accommodates the old form and additional forms."
        ]
      ],
      "why": "Generalizes means extending a method to a broader range while retaining its earlier cases. A single permitted destination produces the old fixed sequence; multiple permitted destinations produce branching routes. The first score alone suggests transcription, but the second reveals the broader structure of the notation.",
      "steps": [
        "Identify what the old method can express: one fixed next section at each point.",
        "Compare the later rule's use in the first score with its use in the second; the rule stays the same while the number of permitted destinations changes.",
        "Choose the relation between a method and a broader method that includes its fixed-sequence case."
      ],
      "trap": "Treating the first demonstration as the entire capacity of a notation, or assuming broader capacity proves replacement of an older method.",
      "hint": "What stays constant between the later notation's two scores, and what new possibility appears?"
    },
    {
      "scene": "cs-latent-transcription-tools",
      "text": "An archive's restoration and transcription teams exchange work throughout a project. Restorers clean each day's recordings with a sound profile fixed at the month's start, then send the files to transcribers. At month's end, annotations from those transcripts are used to construct the next profile. The two teams therefore contribute to one another's work over the life of the project. Within the production of any single day's files and transcripts, however, their dependence on the other's current output is ______.",
      "clues": [
        "sound profile fixed at the month's start",
        "send the files to transcribers",
        "construct the next profile"
      ],
      "key": "asymmetric",
      "wrong": [
        [
          "reciprocal",
          "Over successive months the teams do contribute to one another's work. The blank narrows the comparison to current daily outputs: today's transcription uses today's restored files, while today's restoration uses a profile already fixed before those transcripts exist."
        ],
        [
          "symmetrical",
          "Both teams contribute to the project, but their immediate requirements are not mirror images. One needs the other's current output, whereas the other's current work uses an earlier profile."
        ],
        [
          "negligible",
          "The fixed sound profile makes daily restoration possible before that day's transcripts are produced. It does not remove the transcribers' need for that day's restored recordings."
        ]
      ],
      "why": "Asymmetric means differing according to direction. Current transcripts require current restored files, but current restoration uses a profile fixed earlier. The relationship can be reciprocal across months while remaining unequal in its dependence on current output within a day; the time scale specified by the blank controls the answer.",
      "steps": [
        "Distinguish the daily production cycle from the monthly profile-update cycle.",
        "For each team, locate the particular version of the other team's work that it uses: current files or an earlier profile derived from previous annotations.",
        "Evaluate dependence on current daily output, while preserving the broader mutual contribution described in the passage."
      ],
      "trap": "Carrying a true description of the month-to-month collaboration into a question about dependence within one day's production.",
      "hint": "Which inputs are already available when a new day's work begins?"
    },
    {
      "scene": "cs-latent-restoration-trajectories",
      "text": "Two enclosed restoration plots begin a trial with equal plant cover and equal numbers of viable seeds. In one, the seeds lie near the surface; in the other, they lie beneath a layer that blocks the light these seeds require for germination. The census counts seeds at every depth, and laboratory viability tests expose them to light. Both plots contain plants that die after setting seed, but collection trays remove all newly shed seeds during the trial. All seeds receiving light germinate during the next growing season. With the soil undisturbed, the initially matching census totals therefore conceal ______ developments during that first replacement generation.",
      "clues": [
        "laboratory viability tests expose them to light",
        "die after setting seed",
        "remove all newly shed seeds"
      ],
      "key": "divergent",
      "wrong": [
        [
          "parallel",
          "The initial cover and the laboratory counts match. Those counts do not establish that the viable seeds can germinate in place: only one plot's existing reserve receives the required light, and new seed cannot replenish either reserve."
        ],
        [
          "cyclical",
          "The plants normally set seed before dying, suggesting repeated replacement. The trays intercept that new seed, and the buried reserve remains unavailable under the specified undisturbed conditions, so the usual cycle cannot explain both plots."
        ],
        [
          "compensatory",
          "An equal buried reserve might seem capable of making up for lost adult plants. Viability under laboratory light does not make those seeds available beneath the opaque layer, and the passage supplies no counterbalancing source of replacement."
        ]
      ],
      "why": "Divergent means developing along different paths. Existing adults will die in both plots, and their new seeds are removed. Replacement must therefore come from the reserves already present. Only the surface reserve has the required light, so equal laboratory viability and initial cover do not imply equal replacement in the generation immediately following the original plants.",
      "steps": [
        "Separate being viable under laboratory conditions from being able to germinate at the seed's actual depth.",
        "Account for adult death and the removal of new seed: the starting reserves are the remaining source of replacement.",
        "Compare access to those reserves to infer how cover develops in the first replacement generation, rather than extending the initial equality forward."
      ],
      "trap": "Treating a total that combines accessible and inaccessible reserves as a measure of usable replacement capacity.",
      "hint": "After the original adults die, which counted seeds can actually supply their replacements under the trial's conditions?"
    },
    {
      "scene": "cs-latent-exhibition-catalogues",
      "text": "Two catalogues describe an exhibition from different administrative perspectives. The first lists works whose owners signed loan agreements and kept their works available; every such work passed the selection panel. The second lists works the panel selected that remained available for display. Some selected works were withdrawn, but every owner who left a work available signed an agreement. Although selection and lending are different acts, the two catalogues' coverage is ______.",
      "clues": [
        "every such work passed the selection panel",
        "every owner who left a work available signed an agreement"
      ],
      "key": "coextensive",
      "wrong": [
        [
          "intersecting",
          "Both catalogues do share works, but merely intersecting understates the two inclusion rules. Each catalogue's eligible works also satisfy the other's conditions, so their coverage has the same extent."
        ],
        [
          "hierarchical",
          "Selection and lending are different administrative acts, but that does not put one catalogue's coverage above or within a larger coverage. The stated rules give both the same set of works."
        ],
        [
          "complementary",
          "The catalogues might contain different administrative details, but the blank concerns which works they cover. Neither covers works missing from the other under the stated conditions."
        ]
      ],
      "why": "Coextensive means having the same extent or coverage. An agreed loan belongs to the selected, available works, and every selected work still available has an agreement. Following both inclusion rules establishes equal coverage despite the different organizing purposes.",
      "steps": [
        "Check whether every work with a loan agreement meets the second catalogue's conditions.",
        "Check the reverse direction: every selected work still available has an agreement.",
        "Choose the precise relation between two coverages when neither includes an additional work."
      ],
      "trap": "Assuming that different administrative criteria must produce different sets of works, or checking inclusion in only one direction.",
      "hint": "Could a work satisfy either catalogue's final conditions without satisfying the other's?"
    },
    {
      "scene": "cs-latent-rating-scales",
      "text": "Two panels award exhibition designs scores from one to ten. The first ranks ease of navigation; the second ranks how strongly a design disrupts visitors' expectations. Their scores occasionally match, but a wide, predictable route can earn the first panel's highest score and the second's lowest. Neither panel assigns a value to the other's objective, and the brief provides no rule for trading one objective against the other. As measures of a single overall merit, the scores are ______.",
      "clues": [
        "Neither panel assigns a value to the other's objective",
        "no rule for trading one objective against the other"
      ],
      "key": "incommensurable",
      "wrong": [
        [
          "interchangeable",
          "The matching numerical range does not give the scores the same meaning. Substituting a navigation score for a disruption score would change the quality being measured."
        ],
        [
          "contradictory",
          "A design can be easy to navigate and weak at disrupting expectations without any contradiction. The panels measure different qualities rather than make incompatible claims about one quality."
        ],
        [
          "complementary",
          "The scores provide different information, but the blank asks about a single measure of overall merit. Without a shared yardstick or a trade-off rule, the two values cannot complete such a measure merely by being put together."
        ]
      ],
      "why": "Incommensurable means lacking a common basis for measurement or comparison. The identical scales disguise different objectives, and no rule translates performance on one into performance on the other. The scores therefore cannot directly express a single overall merit.",
      "steps": [
        "Identify what each score measures, rather than comparing only the numbers printed on the scales.",
        "Use the absence of a common objective or trade-off rule to assess whether the scores can measure one overall quality.",
        "Choose the term for measures lacking that common basis, without treating different judgments as a logical contradiction."
      ],
      "trap": "Mistaking identical numerical ranges for a shared measure, or treating different evaluation criteria as contradictory claims.",
      "hint": "Would the same number from the two panels mean the same achievement?"
    },
    {
      "scene": "cs-latent-transport-balances",
      "text": "A town considers two timetable changes for a factory's workers: moving the last ferry from 5:40 p.m. to 6:10 p.m. and the last shuttle to its dock from 5:10 p.m. to 5:50 p.m. Shifts end at 5:30 p.m. Walking from the factory to the dock takes forty-five minutes; the shuttle takes fifteen. A planning exercise assumes that services run on time and that these are the workers' only ways to reach the dock. For enabling the workers to cross after their shift, the effects of the two changes would be ______.",
      "clues": [
        "Shifts end at 5:30 p.m.",
        "forty-five minutes; the shuttle takes fifteen",
        "only ways to reach the dock"
      ],
      "key": "synergistic",
      "wrong": [
        [
          "cumulative",
          "A cumulative account treats the total benefit as independent gains added together. Here either change alone still leaves these workers unable to catch a ferry; only their combination creates an opportunity to cross."
        ],
        [
          "substitutive",
          "This would make one change an alternative way to obtain the other's benefit. But the later ferry still leaves before a worker can walk to it, and the later shuttle reaches the dock after the old last ferry, so neither change substitutes for the other."
        ],
        [
          "sequential",
          "The shuttle trip must precede the ferry trip, making sequence relevant to the journey. The blank concerns the changes' effects on the ability to cross: the timing constraints make their combined effect exceed what either change produces alone."
        ]
      ],
      "why": "Synergistic describes effects that produce more together than their separate contributions would yield. After a 5:30 finish, walking gets a worker to the dock at 6:15, too late even for the proposed ferry. The proposed 5:50 shuttle arrives at 6:05, too late for the old ferry but in time for the proposed one. Either change alone permits no crossing for these workers; together they permit one.",
      "steps": [
        "Test the later ferry with the old shuttle schedule: the shuttle leaves before the shift ends, and walking reaches the dock at 6:15.",
        "Test the later shuttle with the old ferry schedule: the shuttle arrives at 6:05, after the 5:40 sailing.",
        "Combine the proposed schedules: a 6:05 arrival permits boarding at 6:10. Choose the relation for a joint effect greater than the separate effects added together."
      ],
      "trap": "Judging the timetable changes separately as two ordinary service extensions, or describing the order of the journey instead of the interaction of their effects.",
      "hint": "What happens under each change alone, and then under both together?"
    },
    {
      "scene": "cs-latent-editorial-criteria",
      "text": "Two editors initially accept the same manuscripts, suggesting that they apply much the same standard. One actually evaluates factual accuracy, the other narrative coherence. A later batch includes an accurate but disjointed account and a coherent account with factual errors; each editor accepts the account the other rejects. Both accept a third manuscript satisfying both criteria. Taken together, these decisions indicate that the standards are ______.",
      "clues": [
        "each editor accepts the account the other rejects",
        "Both accept a third manuscript satisfying both criteria"
      ],
      "key": "orthogonal",
      "wrong": [
        [
          "discordant",
          "The editors disagree about two manuscripts, but their standards need not conflict: the third manuscript meets both. Disagreement in particular decisions does not make the standards opposed."
        ],
        [
          "redundant",
          "The first batch produces the same selections, but the later batch demonstrates that either standard can be met without the other. One check therefore cannot replace the other."
        ],
        [
          "convergent",
          "The initial matching selections are not evidence that the standards are developing toward a common criterion. The later cases expose two separate dimensions of judgment."
        ]
      ],
      "why": "Orthogonal can describe dimensions that vary independently. Accuracy can be present without coherence, coherence without accuracy, or both together. Those combinations explain why the initial agreement and later disagreements do not make the standards identical or opposed.",
      "steps": [
        "Separate the editors' selections from the criteria that generate those selections.",
        "Use the later manuscripts to establish that either criterion can be met without the other, and that both can also be met.",
        "Choose the relation for independent dimensions, rather than identical or conflicting requirements."
      ],
      "trap": "Mistaking agreement on some outcomes for identical standards, or disagreement on other outcomes for inherently opposing standards.",
      "hint": "Can a manuscript meet either standard alone as well as both together?"
    }
  ];

  const wicLatentRelationship = {
    id: "wic-latent-relationship",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "precision",
    difficulty: "Hard",
    title: "Precise relation beneath surface similarity",
    recognize: "Identify the dimension the blank compares, then combine the evidence about origin, function, membership, or influence. Similar appearances or initial outcomes can conceal different relationships, and different appearances can conceal the same underlying relationship.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["word-association", "true-but-irrelevant", "grammatical-but-illogical"],
    build(t) {
      const topic = t.pick(WIC_LATENT_RELATION_TOPICS);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.text },
        stem: "Which choice completes the text with the most logical and precise word or phrase?",
        correct: topic.key,
        wrong: topic.wrong.map(([word, reason]) => [word, reason]),
        explanation: topic.why,
        steps: topic.steps,
        principles: [
          "A relation must be evaluated on the dimension the text specifies: shared appearance, shared origin, shared function, and mutual influence are different claims.",
          "An early match or a visible difference cannot by itself determine a relationship; trace the additional conditions that each candidate word would require.",
        ],
        trap: topic.trap,
        hint: topic.hint,
        estimatedSeconds: 105,
        verify: () =>
          topic.text.split("______").length === 2 &&
          topic.text.length >= 150 && topic.text.length <= 900 &&
          topic.clues.length >= 2 && topic.clues.every((clue) => topic.text.includes(clue)) &&
          topic.wrong.length === 3 &&
          new Set([topic.key, ...topic.wrong.map(([word]) => word)]).size === 4 &&
          !new RegExp(`\\b${topic.key}\\b`, "i").test(topic.text) &&
          topic.steps.length >= 3 &&
          topic.wrong.every(([word, reason]) => word.length > 0 && reason.length > 40),
      };
    },
  };
  // End additional design: precision-relational.

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
    wicSeparatedConstraints,
    wicLatentRelationship,
  ];
});
