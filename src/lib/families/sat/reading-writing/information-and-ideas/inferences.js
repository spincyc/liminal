(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/reading-writing/information-and-ideas"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Inferences templates (Information and Ideas): the conclusion a text
  // supports without stating it. The helpers every skill file of the domain
  // uses come from common.js.

  const { RW, passage, inOrder, allDistinct, mc } = C;

  const BLANK = "______";

  // A text-completion passage ends in exactly one blank.
  const endsInBlank = (text) =>
    text.split(BLANK).length === 2 && /______[.?]?$/.test(text.trim());

  /* ------------------------------------------------------------------ */
  /* Inferences: apply a stated rule or definition to a stated case      */
  /* ------------------------------------------------------------------ */

  // The text states a rule or definition (`rule`) and then describes a case
  // (`case`) that meets its condition; the key applies the rule to the case.
  const RULE_CASE_TOPICS = [
    {
      scene: "ii-tamarack-deciduous",
      about: "the tamarack",
      text:
        "Most conifers, such as pines and spruces, keep their needles through the winter. Botanists call any tree that sheds all of its leaves or needles each autumn deciduous, whatever kind of tree it is. The tamarack, a conifer common in northern bogs, turns golden in October and then drops every one of its needles, standing bare until new ones grow in spring.",
      rule: "call any tree that sheds all of its leaves or needles each autumn deciduous",
      case: "drops every one of its needles",
      key: "Botanists would call it deciduous even though it is a conifer.",
      reversed: "It keeps its needles through the winter, as most conifers do.",
      broad: "Like most conifers, it sheds its needles when autumn comes.",
      unsupported: "It grows only in bogs where pines and spruces cannot survive.",
    },
    {
      scene: "ii-obsidian-igneous",
      about: "obsidian",
      text:
        "Geologists classify rocks by how they form. Igneous rocks form when molten rock cools and hardens, while sedimentary rocks form from layers of particles pressed together over long periods. Obsidian, a smooth black stone prized by ancient toolmakers for its sharp edges, forms when lava from certain volcanoes cools so quickly that crystals have no time to grow.",
      rule: "Igneous rocks form when molten rock cools and hardens",
      case: "forms when lava from certain volcanoes cools",
      key: "It is classified as an igneous rock.",
      reversed: "It is classified as a sedimentary rock.",
      broad: "It is black and glassy, as most igneous rocks are.",
      unsupported: "It is harder than most other igneous rocks.",
    },
    {
      scene: "ii-comet-without-tail",
      about: "Comet Varga at the time of the photographs",
      text:
        "A comet develops a tail only when it comes close enough to the Sun for sunlight to warm its icy nucleus, which then releases streams of gas and dust. Far from the Sun, a comet is simply a frozen chunk of ice and rock. Astronomers recently photographed Comet Varga while it was well beyond the distance at which sunlight could warm its ice, farther from the Sun than Jupiter.",
      rule: "develops a tail only when it comes close enough to the Sun",
      case: "well beyond the distance at which sunlight could warm its ice",
      key: "It had no tail of gas and dust when it was photographed.",
      reversed: "Sunlight had warmed its nucleus enough to release gas and dust.",
      broad: "Like every comet far from the Sun, it had lost all of its ice.",
      unsupported: "It had lost its ice while passing close to Jupiter.",
    },
    {
      scene: "ii-beef-loanword",
      about: "the English word \"beef\"",
      text:
        "Linguists call a word that one language takes from another a loanword. After the Norman Conquest of 1066, French-speaking rulers governed England for centuries, and English took in thousands of French words, many of them concerning law, government, and fine dining. The English word \"beef\" is one example: it developed from the French word \"boeuf\" during this period.",
      rule: "call a word that one language takes from another a loanword",
      case: "it developed from the French word",
      key: "It is a loanword that English took from French.",
      reversed: "It is a word that French took from English after 1066.",
      broad: "Most English food words came from French after 1066.",
      unsupported: "It was first used in England by cattle farmers after 1066.",
    },
    {
      scene: "ii-platypus-mammal",
      about: "the platypus",
      text:
        "Biologists classify an animal as a mammal if it has hair or fur and feeds its young on milk produced by the mother. Most mammals also give birth to live young, but that is not part of the definition. The platypus of eastern Australia has dense brown fur and feeds its young on milk, yet the female lays eggs and keeps them warm for about ten days before they hatch.",
      rule: "classify an animal as a mammal if it has hair or fur and feeds its young on milk",
      case: "has dense brown fur and feeds its young on milk",
      key: "It is a mammal, even though it lays eggs instead of giving birth.",
      reversed: "It cannot be a mammal, since it lays eggs instead of giving birth.",
      broad: "Like most Australian mammals, it keeps its eggs warm for ten days.",
      unsupported: "Like most Australian mammals, it feeds its young only at night.",
    },
    {
      scene: "ii-leap-year-1900",
      about: "the year 1900",
      text:
        "In the Gregorian calendar, a year is a leap year if it is divisible by 4, except that a year divisible by 100 is a leap year only if it is also divisible by 400. The rule keeps the calendar closely aligned with the seasons over the centuries. Under it, 1996 and 2000 were both leap years. The year 1900 is divisible by 4 and by 100, but not by 400.",
      rule: "a year divisible by 100 is a leap year only if it is also divisible by 400",
      case: "The year 1900 is divisible by 4 and by 100, but not by 400",
      key: "It was not a leap year under the Gregorian calendar.",
      reversed: "It was a leap year, since every year divisible by 4 is one.",
      broad: "Like every year divisible by 100, it was not a leap year.",
      unsupported: "Like every year divisible by 400, it was skipped.",
    },
    {
      scene: "ii-argon-unreactive",
      about: "argon",
      text:
        "The noble gases, the elements in the far right column of the periodic table, have full outer shells of electrons, which makes them extremely reluctant to form chemical bonds with other elements. Argon, which makes up almost one percent of Earth's atmosphere, is found in that column, directly below neon and above krypton.",
      rule: "makes them extremely reluctant to form chemical bonds",
      case: "is found in that column",
      key: "It rarely forms chemical bonds with other elements.",
      reversed: "It readily forms bonds with most other elements.",
      broad: "Like every gas in Earth's atmosphere, it has a full outer shell of electrons.",
      unsupported: "It makes up more of Earth's atmosphere than any other gas does.",
    },
    {
      scene: "ii-senate-cloture-vote",
      about: "the cloture vote on the transportation bill",
      text:
        "In the United States Senate, a filibuster, or prolonged debate meant to delay a vote, can be ended by a vote called cloture. For most legislation, cloture requires the support of three-fifths of the full Senate, which means 60 of its 100 members. In one session, a cloture vote on a transportation bill received 57 votes in favor and 43 against.",
      rule: "requires the support of three-fifths of the full Senate",
      case: "received 57 votes in favor",
      key: "It failed to end the filibuster, though most senators voted for it.",
      reversed: "It ended the filibuster because most senators supported it.",
      broad: "Like most cloture votes, it came after weeks of debate.",
      unsupported: "It was the first cloture vote after weeks of debate.",
    },
    {
      scene: "ii-datura-moth-flowers",
      about: "the sacred datura",
      text:
        "Botanists have found that flowers with certain traits are, in most cases, pollinated by moths that fly at night: such flowers are usually white or pale, which makes them easy to see in dim light, and they release their strongest scent after dark. The desert plant known as the sacred datura has large white flowers that open in the evening and give off a sweet fragrance that grows stronger as night falls.",
      rule: "are, in most cases, pollinated by moths that fly at night",
      case: "large white flowers that open in the evening",
      key: "It is probably pollinated by moths that fly at night.",
      reversed: "It is probably pollinated by bees that fly during the day.",
      broad: "Like all white flowers, it opens only in the evening to attract moths.",
      unsupported: "It opens only in the evening because desert days are too hot.",
    },
    {
      scene: "ii-sonnet-structure",
      about: "the poem \"Harbor at Dusk\"",
      text:
        "A sonnet is a poem of exactly fourteen lines. In the form known as the Petrarchan sonnet, the first eight lines present a problem or situation and the final six lines respond to it. The poem \"Harbor at Dusk\" has fourteen lines: eight that describe a fishing fleet struggling through a storm, followed by six that describe the calm that settles over the harbor once the boats are safe.",
      rule: "the first eight lines present a problem or situation and the final six lines respond to it",
      case: "eight that describe a fishing fleet struggling through a storm",
      key: "Its structure follows the pattern of a Petrarchan sonnet.",
      reversed: "It is too long to be considered a sonnet of any kind.",
      broad: "Like all poems about the sea, it is written as a sonnet.",
      unsupported: "It was first written in Italian and later translated.",
    },
  ];

  const ruleToCase = {
    ...RW,
    id: "inference-rule-applied-to-case",
    skill: "Inferences",
    subskill: "logical inference",
    difficulty: "Easy",
    title: "A stated rule applied to the case the text describes",
    recognize:
      "The text gives a rule or definition and then a case that meets its condition; the inference is what the rule says about that case.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["opposite-stance", "too-broad"],
    build(t) {
      const topic = t.pick(RULE_CASE_TOPICS);
      const wrong = [
        [topic.reversed, "This is the opposite of what the rule implies once the case's details are checked against it."],
        [topic.broad, "This rests on a generalization about a whole group that the text never makes and does not support."],
        [topic.unsupported, "The text gives no information that supports this."],
      ];
      return mc("Easy", topic, {
        stimulus: passage(topic.text),
        stem: `Based on the text, what can most reasonably be inferred about ${topic.about}?`,
        correct: topic.key,
        wrong,
        explanation:
          `The text states a rule ("${topic.rule}") and then describes a case that meets its condition ("${topic.case}"). Applying the rule to the case gives: ${topic.key}`,
        steps: [
          "Find the general rule or definition the text states.",
          "Find the specific case and check whether it meets the rule's condition.",
          "Choose what the rule says must follow for that case.",
        ],
        principles: [
          "An inference applies what the text states; it does not add outside facts.",
          "A rule's exceptions and conditions decide the case, not what is usually true.",
        ],
        trap: "Going with what is usually true of the group instead of what the rule says about this case.",
        hint: "Does the case meet the rule's condition?",
        verify: () => inOrder(topic.text, [topic.rule, topic.case]) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Inferences: complete a text by carrying a stated cause forward      */
  /* ------------------------------------------------------------------ */

  // The text states how one thing affects another (`mechanism`), then
  // describes a change to the cause (`change`); the blank asks for the
  // effect. Every choice completes the same final sentence.
  const CAUSE_EFFECT_TOPICS = [
    {
      scene: "ii-beaver-dam-removal",
      text:
        "When beavers build a dam across a stream, water backs up behind it and spreads into a pond, flooding the surrounding low ground and creating wetland habitat for frogs, ducks, and insects. In one mountain valley, ranchers removed a series of old beaver dams so that the land could be drained for grazing. Ecologists surveying the valley a few years later would therefore most likely find ______.",
      mechanism: "flooding the surrounding low ground and creating wetland habitat",
      change: "removed a series of old beaver dams",
      key: "less wetland habitat for frogs, ducks, and insects than before",
      opposite: "more wetland habitat, since the stream could now spread out freely",
      irrelevant: "that the stream had grown colder along its whole length",
      extreme: "that the stream had dried up completely along its whole length",
    },
    {
      scene: "ii-road-salt-cold",
      text:
        "Salt spread on icy roads lowers the temperature at which water freezes, so a salted road can stay free of ice at temperatures a few degrees below 0°C. The effect weakens as the air gets colder, however, and below about −10°C ordinary road salt does little to keep ice from forming. Road crews in a northern city facing an overnight forecast of −18°C therefore ______.",
      mechanism: "below about −10°C ordinary road salt does little",
      change: "an overnight forecast of −18°C",
      key: "cannot count on ordinary road salt alone to keep the roads clear",
      opposite: "can expect ordinary road salt to keep every road free of ice",
      irrelevant: "should expect the salt to warm the air above the roads overnight",
      extreme: "should expect every road in the city to be closed overnight",
    },
    {
      scene: "ii-caffeine-adenosine",
      text:
        "Adenosine is a chemical that builds up in the brain during waking hours and produces the feeling of sleepiness by binding to certain receptors. Caffeine molecules have a similar shape and can occupy those same receptors without activating them, which keeps adenosine from binding. A person who drinks strong coffee late in the evening would therefore most likely ______.",
      mechanism: "which keeps adenosine from binding",
      change: "drinks strong coffee late in the evening",
      key: "have more trouble than usual feeling sleepy at bedtime",
      opposite: "feel sleepier than usual at bedtime",
      irrelevant: "produce less adenosine in the brain the following day",
      extreme: "never again produce adenosine in the brain",
    },
    {
      scene: "ii-legume-rotation",
      text:
        "Bacteria living in small nodules on the roots of beans, peas, and other legumes capture nitrogen from the air and convert it into a form that plants can use. When the legumes die and decompose, much of that nitrogen remains in the soil. A farmer who grows peas in a field one year and corn in the same field the next year can therefore expect the corn to ______.",
      mechanism: "much of that nitrogen remains in the soil",
      change: "grows peas in a field one year and corn in the same field the next year",
      key: "find more usable nitrogen in the soil than after a crop that is not a legume",
      opposite: "find less usable nitrogen in the soil, since the peas will have used it all up",
      irrelevant: "capture nitrogen directly from the air through nodules on its own roots",
      extreme: "need no nitrogen at all from the soil or from the air",
    },
    {
      scene: "ii-tree-ring-drought",
      text:
        "A tree adds one ring of wood to its trunk each year, and the ring's width depends largely on how much water the tree received that year: wet years produce wide rings, and dry years produce narrow ones. A core taken from an old oak in Tennessee shows a band of five very narrow rings formed during the 1570s. This band suggests that the region ______.",
      mechanism: "dry years produce narrow ones",
      change: "a band of five very narrow rings",
      key: "had a series of unusually dry years during the 1570s",
      opposite: "received more rain than usual in each of those five years",
      irrelevant: "had more oak trees during the 1570s than it has today",
      extreme: "received no rain at all in any of those five years",
    },
    {
      scene: "ii-coffee-frost-prices",
      text:
        "The price of a crop generally rises when the supply available for sale falls while demand stays about the same. Brazil grows a large share of the world's coffee, and in 1975 a severe frost destroyed much of the Brazilian crop while worldwide demand for coffee held steady. Coffee buyers around the world in the following year most likely ______.",
      mechanism: "rises when the supply available for sale falls",
      change: "a severe frost destroyed much of the Brazilian crop",
      key: "paid higher prices for coffee than they had paid before the frost",
      opposite: "paid lower prices for coffee, because Brazil had less of it to sell",
      irrelevant: "bought more of their coffee from Brazil than in earlier years",
      extreme: "could not buy any coffee from Brazil or anywhere else in the world",
    },
    {
      scene: "ii-lake-ice-fish",
      text:
        "Ice floats because it is less dense than liquid water, and a layer of ice on a lake's surface insulates the water beneath it from the cold air above. As a result, the water under the ice stays above freezing through the winter, even when the air temperature drops far below zero. Fish living in a lake that freezes over each winter are therefore able to ______.",
      mechanism: "the water under the ice stays above freezing",
      change: "a lake that freezes over each winter",
      key: "survive the winter in the liquid water beneath the ice",
      opposite: "survive the winter only by moving to lakes that do not freeze",
      irrelevant: "make the ice on the lake thicker by staying active all winter",
      extreme: "stay perfectly safe from the cold all winter, however cold the air becomes",
    },
    {
      scene: "ii-dilating-eye-drops",
      text:
        "The pupil of the eye widens in dim light, admitting more light to the retina, and narrows in bright light, admitting less. Certain eye drops used during eye examinations temporarily block the muscle that narrows the pupil. A patient who walks out into bright sunlight while these drops are still in effect is therefore likely to ______.",
      mechanism: "block the muscle that narrows the pupil",
      change: "walks out into bright sunlight",
      key: "find the light uncomfortably bright, because the pupils stay wide",
      opposite: "see more dimly than usual, because the pupils have narrowed",
      irrelevant: "need the drops again before the next eye examination",
      extreme: "never again be able to narrow the pupils in bright light",
    },
    {
      scene: "ii-lichen-sulfur-recovery",
      text:
        "Many lichens absorb water and nutrients directly from the air and have no way to filter out pollutants, so sulfur dioxide in the air damages them quickly. For this reason, the number of lichen species growing in an area tends to fall as its air becomes more polluted. After a coal-burning power plant that released large amounts of sulfur dioxide closed in 1990, forests near the plant most likely ______.",
      mechanism: "the number of lichen species growing in an area tends to fall",
      change: "closed in 1990",
      key: "gained lichen species over the following decades as the air improved",
      opposite: "lost lichen species over the following decades as sulfur dioxide declined",
      irrelevant: "absorbed less water directly from the air after the plant closed",
      extreme: "became completely free of air pollution within a year after the plant closed",
    },
    {
      scene: "ii-closed-car-heat",
      text:
        "Glass lets most visible sunlight pass through, but it blocks much of the infrared radiation that warm objects give off. Sunlight entering a closed car through its windows warms the seats and dashboard, which then give off heat as infrared radiation that the glass keeps inside. On a sunny day, a car parked with its windows closed will therefore ______.",
      mechanism: "infrared radiation that the glass keeps inside",
      change: "parked with its windows closed",
      key: "become warmer inside than the air around it",
      opposite: "stay cooler inside than the air around it does",
      irrelevant: "let less visible sunlight reach its seats and dashboard",
      extreme: "keep heating its seats and dashboard without any limit",
    },
  ];

  const causeEffect = {
    ...RW,
    id: "inference-completion-cause-effect",
    skill: "Inferences",
    subskill: "text completion",
    difficulty: "Easy",
    title: "Completion that carries a stated cause through to its effect",
    recognize:
      "The text explains how one thing affects another and then changes the first; the completion states the effect in the direction the explanation gives.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 0, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "extreme-language", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(CAUSE_EFFECT_TOPICS);
      const wrong = [
        [topic.opposite, "This runs the stated cause and effect in the wrong direction."],
        [topic.irrelevant, "This concerns something the text's explanation does not connect to the change described."],
        [topic.extreme, "The text supports a change in degree, not this absolute outcome."],
      ];
      return mc("Easy", topic, {
        stimulus: passage(topic.text),
        stem: "Which choice most logically completes the text?",
        correct: topic.key,
        wrong,
        explanation:
          `The text explains the mechanism ("${topic.mechanism}") and then describes a case in which the cause changes ("${topic.change}"). Following the mechanism, the text is best completed with "${topic.key}."`,
        steps: [
          "State the cause-and-effect relationship the text explains.",
          "Note what changes in the final situation.",
          "Choose the completion that follows in the direction the explanation predicts, and no further.",
        ],
        principles: [
          "A completion must follow from what the text has already stated.",
          "Choices with all-or-nothing outcomes usually claim more than the text supports.",
        ],
        trap: "Reversing the direction of the effect, or choosing an extreme version of the right idea.",
        hint: "If the cause changes as described, which way does the effect go?",
        verify: () =>
          inOrder(topic.text, [topic.mechanism, topic.change]) && endsInBlank(topic.text) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Inferences: complete the conclusion of a controlled comparison      */
  /* ------------------------------------------------------------------ */

  // Two groups differ in one factor; `held` is the sentence fragment that
  // shows another factor was kept the same, and `result` the outcome. The
  // key draws the conclusion the comparison licenses; one distractor blames
  // the factor the design held constant.
  const EXPERIMENT_TOPICS = [
    {
      scene: "ii-acacia-ants",
      text:
        "Some acacia trees house colonies of ants that swarm and bite animals feeding on the trees' leaves. To test whether the ants protect the trees, ecologist Nadia Okoro removed the ants from ten acacias on the Sella Ridge research farm and left the colonies in place on ten similar trees nearby; goats browsed freely among all twenty. After a year, the trees without ants had lost nearly half of their leaves, while trees with ants had lost less than a tenth. This result suggests that ______.",
      held: "goats browsed freely among all twenty",
      result: "the trees without ants had lost nearly half of their leaves",
      key: "the ants substantially reduce the damage that goats do to these acacias",
      reversed: "the ants cause acacias to lose leaves by feeding on the leaves themselves",
      heldFactor: "the goats may simply have been able to reach the trees without ants more easily",
      broad: "every tree species that hosts ants is fully protected from browsing animals",
    },
    {
      scene: "ii-handwritten-notes",
      text:
        "Psychologists asked sixty students to watch the same recorded lecture. Half took notes by hand and half typed notes on laptops that had no internet access, so that no one could be distracted by other websites. On a test of the lecture's main concepts a week later, the students who wrote by hand scored higher than those who typed, even though the typists had recorded more words. This result suggests that ______.",
      held: "laptops that had no internet access",
      result: "the students who wrote by hand scored higher",
      key: "for these students, writing by hand led to a better grasp of the concepts than typing",
      reversed: "recording more words in one's notes leads to a better understanding of a lecture",
      heldFactor: "the typists were probably distracted by other websites during the lecture",
      broad: "students should never be allowed to use laptops in any class for any purpose",
    },
    {
      scene: "ii-cherry-seeds-birds",
      text:
        "To learn whether passing through a bird's gut helps seeds sprout, botanist Liang Wei planted two sets of seeds from the same wild cherry trees in identical pots of the same soil. One set had been collected from bird droppings; the other had been picked directly from the fruit and cleaned by hand. Seeds from the droppings sprouted at nearly twice the rate of the hand-cleaned seeds. This result suggests that ______.",
      held: "identical pots of the same soil",
      result: "sprouted at nearly twice the rate",
      key: "passing through a bird's digestive system makes cherry seeds more likely to sprout",
      reversed: "cherry seeds sprout best when they are taken directly from the fruit and cleaned",
      heldFactor: "the soil in the pots holding the seeds from droppings was richer in nutrients",
      broad: "most wild plants probably need birds to carry their seeds away in order to reproduce",
    },
    {
      scene: "ii-sweater-price-anchor",
      text:
        "In an experiment, shoppers were shown the same wool sweater priced at $60. For half of them, the sweater hung on a rack beside a $200 coat; for the other half, it hung beside a $25 scarf. All shoppers saw the sweater in the same store, under the same lighting, on the same days. Shoppers who saw the sweater beside the coat were far more likely to describe its price as reasonable. This result suggests that ______.",
      held: "under the same lighting, on the same days",
      result: "far more likely to describe its price as reasonable",
      key: "people's judgments of a price can depend on the prices of the items displayed nearby",
      reversed: "shoppers judged the sweater's price the same way no matter what was displayed beside it",
      heldFactor: "the store's lighting made the sweater look more expensive to some of the shoppers",
      broad: "shoppers always prefer to buy the most expensive item that a store has for sale",
    },
    {
      scene: "ii-coral-tank-temperatures",
      text:
        "Marine biologist Ana Duarte kept fragments of the same coral species in three tanks that were identical except for water temperature, which she held at 26°C, 29°C, and 31°C. After six weeks, only 5 percent of the fragments at 26°C had bleached, compared with 30 percent at 29°C and 80 percent at 31°C. This result suggests that ______.",
      held: "identical except for water temperature",
      result: "compared with 30 percent at 29°C and 80 percent at 31°C",
      key: "for this coral species, warmer water leads to more bleaching",
      reversed: "this coral species bleaches less as the water grows warmer",
      heldFactor: "differences in light between the tanks probably caused the bleaching",
      broad: "every coral species bleaches whenever the water is above 26°C",
    },
    {
      scene: "ii-gesture-word-learning",
      text:
        "Researchers taught two groups of four-year-olds the same ten made-up words for unfamiliar objects. The teacher and the objects were the same for both groups, but for one group the teacher also made a simple hand gesture each time she said a word. A day later, the children who had seen the gestures correctly named about seven of the objects, while the other children named about four. This result suggests that ______.",
      held: "The teacher and the objects were the same for both groups",
      result: "correctly named about seven of the objects",
      key: "pairing gestures with new words can help young children remember those words",
      reversed: "gestures distract young children from the new words that they are hearing",
      heldFactor: "the children who saw gestures probably had a more skillful and patient teacher",
      broad: "children cannot learn any new word unless someone pairs it with a gesture",
    },
    {
      scene: "ii-roundabout-crashes",
      text:
        "Transportation planners in one county replaced the traffic signals at eight intersections with roundabouts, while eight similar intersections nearby kept their signals. Over the next three years, traffic volume at both sets of intersections rose by about the same amount. Crashes causing injury fell by more than half at the roundabouts but changed little at the intersections with signals. This result suggests that ______.",
      held: "rose by about the same amount",
      result: "fell by more than half at the roundabouts",
      key: "replacing the signals with roundabouts reduced injury crashes at those intersections",
      reversed: "replacing the signals with roundabouts made injury crashes there more likely",
      heldFactor: "injury crashes fell because fewer cars traveled through the new roundabouts",
      broad: "roundabouts would prevent all crashes at every kind of intersection anywhere",
    },
    {
      scene: "ii-tablet-reading-sleep",
      text:
        "In a study of evening screen use, volunteers spent the two hours before bed reading the same novel each night: for five nights on a tablet with a bright, light-emitting screen, and for five nights in a printed book under ordinary lamplight. They went to bed at the same time in both conditions. After reading on the tablet, volunteers took about ten minutes longer to fall asleep and felt less alert the next morning. This result suggests that ______.",
      held: "They went to bed at the same time in both conditions",
      result: "took about ten minutes longer to fall asleep",
      key: "a light-emitting screen before bed can make it harder to fall asleep",
      reversed: "reading a printed book before bed delays sleep more than reading on a lit tablet does",
      heldFactor: "the volunteers stayed up later on the nights when they read on the tablet",
      broad: "screens are the main cause of every sleep problem that people experience",
    },
    {
      scene: "ii-earthworm-wheat",
      text:
        "Soil scientist Rosa Ibáñez filled twelve identical containers with the same garden soil and planted the same number of wheat seedlings in each. She added earthworms to six of the containers and none to the other six, and she watered all twelve equally. After ten weeks, the wheat in the containers with earthworms weighed about 20 percent more. This result suggests that ______.",
      held: "watered all twelve equally",
      result: "weighed about 20 percent more",
      key: "adding earthworms to this kind of soil can improve the growth of wheat planted in it",
      reversed: "earthworms compete with wheat for water and slow its growth",
      heldFactor: "the containers with earthworms received more water than the others",
      broad: "any crop will grow faster wherever earthworms are present in soil",
    },
    {
      scene: "ii-dropped-papers-bystanders",
      text:
        "In an experiment, a researcher repeatedly dropped a box of papers on a sidewalk in view of passersby. Sometimes a single pedestrian was nearby; at other times, five or more people were passing at once. The researcher, the box, and the spot on the sidewalk were the same in every trial. A lone passerby helped pick up the papers far more often than any individual in a larger group did. This result suggests that ______.",
      held: "The researcher, the box, and the spot on the sidewalk were the same in every trial",
      result: "A lone passerby helped pick up the papers far more often",
      key: "a person may be less likely to help a stranger when many other people are present",
      reversed: "people are more willing to help a stranger when they are part of a large, busy group",
      heldFactor: "the researcher dropped the box more clumsily when fewer people were nearby",
      broad: "people in busy places never help strangers who need assistance",
    },
  ];

  const experimentComparison = {
    ...RW,
    id: "inference-completion-controlled-comparison",
    skill: "Inferences",
    subskill: "text completion",
    difficulty: "Easy",
    title: "Completion stating what a controlled comparison shows",
    recognize:
      "Two groups differ in one factor while the text holds the others equal; the conclusion credits that one factor, in the direction observed, for the cases studied.",
    // Easy: the text names the factor it held constant, so the held-factor
    // distractor is ruled out by a single lookup.
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["opposite-stance", "too-broad", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(EXPERIMENT_TOPICS);
      const wrong = [
        [topic.reversed, "This draws the opposite conclusion from the one the results support."],
        [topic.heldFactor, "The text says this factor was kept the same for both groups, so it cannot explain the difference."],
        [topic.broad, "One comparison of this kind cannot support a claim this sweeping."],
      ];
      return mc("Easy", topic, {
        stimulus: passage(topic.text),
        stem: "Which choice most logically completes the text?",
        correct: topic.key,
        wrong,
        explanation:
          `The groups differed in one factor while others were held equal ("${topic.held}"), and the outcome differed ("${topic.result}"). The difference is best credited to the factor that varied: ${topic.key}.`,
        steps: [
          "Identify the one factor that differed between the groups.",
          "Note which other factors the text says were the same.",
          "Complete the text with the conclusion that credits the differing factor, in the observed direction, without overgeneralizing.",
        ],
        principles: [
          "A factor held constant across groups cannot explain a difference between them.",
          "A single study supports a claim about what it tested, not about every case.",
        ],
        trap: "Blaming a factor the design deliberately held constant, or turning one result into a universal rule.",
        hint: "What was different between the groups, and what was kept the same?",
        verify: () =>
          inOrder(topic.text, [topic.held, topic.result]) && endsInBlank(topic.text) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Inferences: a character's feeling shown by action, not by words     */
  /* ------------------------------------------------------------------ */

  // The character says or seems one thing (`surface`) and does another
  // (`action`); the key infers the feeling the action reveals. The
  // face-value distractor takes the surface at its word.
  const CHARACTER_ACTION_TOPICS = [
    {
      scene: "ii-lit-leaving-for-college",
      name: "June",
      text:
        "\"It's only four hours away,\" June said, for the third time that week, when her mother asked whether she was ready. She said it again while she packed the car, briskly, as if announcing the weather. Then, while her mother was locking the house, June went back inside alone. She walked through each room once, touched the doorframe of her old bedroom where the marks of her height were penciled, and came back out with her sunglasses already on, though the sky was overcast.",
      surface: "as if announcing the weather",
      action: "touched the doorframe of her old bedroom",
      key: "She hides real sadness about leaving home behind casual words.",
      faceValue: "She is untroubled by leaving home, since it is only four hours away.",
      overreach: "She has decided at the last moment not to leave home after all.",
      misread: "She is more worried about the overcast sky than about leaving home.",
    },
    {
      scene: "ii-lit-silent-coach",
      name: "Coach Varela",
      text:
        "Coach Varela never said much after a game, win or lose. When Deshawn missed the last free throw and the team lost by one point, the coach only nodded at him in the locker room and said, \"Practice at six.\" But at five-thirty the next morning, when Deshawn arrived early to shoot alone, the gym lights were already on, and a rack of balls stood waiting at the free-throw line. The coach sat in the bleachers with a coffee, reading a newspaper, and did not look up.",
      surface: "only nodded at him in the locker room",
      action: "a rack of balls stood waiting at the free-throw line",
      key: "He quietly supports Deshawn even though he shows little emotion.",
      faceValue: "He is indifferent to Deshawn's disappointment over the missed shot.",
      overreach: "He plans to remove Deshawn from the team because of the missed shot.",
      misread: "He would rather read the newspaper than watch his players practice.",
    },
    {
      scene: "ii-lit-neighbor-beans",
      name: "Mrs. Halvorsen",
      text:
        "For years Mrs. Halvorsen had complained about the Nguyens' garden next door: the beans climbing over the fence, the squash vines creeping across the property line. When the Nguyens left for a month to visit relatives, no one asked her to look after it. Yet each evening she was seen crossing the yard with a watering can, and when a storm knocked the bean poles flat, she spent a whole afternoon tying them back up with strips cut from an old apron.",
      surface: "had complained about the Nguyens' garden",
      action: "tying them back up with strips cut from an old apron",
      key: "She cares about the Nguyens' garden more than her complaints would suggest.",
      faceValue: "She hopes the Nguyens' garden will fail while its owners are away.",
      overreach: "She intends to take over the Nguyens' garden permanently when they return.",
      misread: "She was asked by the Nguyens to water their garden while they were away.",
    },
    {
      scene: "ii-lit-leaning-bookshelf",
      name: "Mr. Obi",
      text:
        "Ruth's first bookshelf leaned slightly to the left. Her teacher, Mr. Obi, looked at it for a long while and said only that the joints were strong. That night he took the shelf home. The next day Ruth found it back on her workbench, still leaning, with a small pencil mark on each of the two joints that were out of square. Beside it lay a new board of the same length and a note that said, \"Again. Slowly.\"",
      surface: "said only that the joints were strong",
      action: "a small pencil mark on each of the two joints",
      key: "He sees the shelf's flaws but wants Ruth to build it again herself rather than have him fix it.",
      faceValue: "He is satisfied with Ruth's first bookshelf, as his remark about its strong joints shows.",
      overreach: "He believes that Ruth has no real talent for carpentry and should give it up.",
      misread: "He secretly repaired Ruth's bookshelf at home so that it would stand up straight.",
    },
    {
      scene: "ii-lit-sunday-call",
      name: "Ada",
      text:
        "Every Sunday at noon, Ada's grandmother called and asked the same three questions: Was Ada eating? Was she warm enough? Was she working too hard? Ada, busy with exams, had begun letting the calls go to voicemail. This Sunday, noon came and went, and the phone stayed silent. Ada checked it at twelve-fifteen, and again at twelve-thirty. At one o'clock she called her grandmother herself, and when the old woman answered, Ada found she had no idea what to say.",
      surface: "had begun letting the calls go to voicemail",
      action: "At one o'clock she called her grandmother herself",
      key: "She misses her grandmother's calls now that one has failed to come.",
      faceValue: "She is relieved that her grandmother has finally stopped calling on Sundays.",
      overreach: "She has decided to visit her grandmother every Sunday from now on.",
      misread: "She calls her grandmother to ask whether she is eating and keeping warm.",
    },
    {
      scene: "ii-lit-harbor-lemons",
      name: "Salvatore",
      text:
        "Everyone at the harbor knew that Marco and old Salvatore had not spoken in ten years, not since a quarrel over a mooring that neither would explain. When Salvatore's engine failed a mile offshore one gray morning, it was Marco's boat that appeared out of the mist and threw him a line. Marco towed him to the dock without a word, tied off the rope, and left before Salvatore could climb out. The next morning, a crate of lemons sat on Marco's deck, with no note.",
      surface: "had not spoken in ten years",
      action: "a crate of lemons sat on Marco's deck",
      key: "He wants to thank Marco without breaking the silence between them.",
      faceValue: "He remains too angry at Marco to acknowledge the help he received.",
      overreach: "He has decided to end the quarrel by apologizing to Marco in public.",
      misread: "He had asked Marco in advance to tow his boat back to the harbor.",
    },
    {
      scene: "ii-lit-empty-seat",
      name: "Tobias",
      text:
        "Tobias said he didn't care whether his father came to the concert. \"He'll be working anyway,\" he told his friend, shrugging. But during the first half, Tobias kept glancing at the empty seat at the end of the fourth row, and at the intermission he went out to the lobby and stood by the glass doors, watching the parking lot, until the bell called him back.",
      surface: "said he didn't care whether his father came",
      action: "kept glancing at the empty seat",
      key: "He hopes his father will come to the concert, whatever he says.",
      faceValue: "He is indifferent to whether his father attends the concert.",
      overreach: "He refuses to play in the second half unless his father arrives.",
      misread: "He is waiting in the lobby for his friend to arrive at the concert.",
    },
    {
      scene: "ii-lit-underseasoned-soup",
      name: "Chef Amara",
      text:
        "When the restaurant's first review appeared, calling the soup \"ambitious but underseasoned,\" Chef Amara laughed and said that critics would complain about anything. She pinned the review to the kitchen wall as a joke. For the next week, though, she tasted every pot of soup herself before it left the kitchen, and twice she sent a batch back to the stove with a pinch of salt and a single word: \"More.\"",
      surface: "said that critics would complain about anything",
      action: "she tasted every pot of soup herself",
      key: "She has quietly accepted the critic's complaint that the soup lacked seasoning.",
      faceValue: "She dismisses the review because she thinks critics complain about anything.",
      overreach: "She plans to remove the soup from the restaurant's menu entirely.",
      misread: "She believes that the soup had been too salty before the review appeared.",
    },
    {
      scene: "ii-lit-moving-day-cat",
      name: "Mr. Adeyemi",
      text:
        "The movers had packed everything but the cat, who had vanished the moment the first box was taped. Mr. Adeyemi, who had never liked the animal and said so often, told his daughter that the cat would turn up or it wouldn't. Then he spent an hour on his knees in the empty rooms, shaking a box of treats and calling a name he had always claimed not to remember.",
      surface: "who had never liked the animal and said so often",
      action: "spent an hour on his knees in the empty rooms",
      key: "He is more attached to the cat than he has been willing to admit.",
      faceValue: "He cares less about the cat than about finishing the move on time.",
      overreach: "He has decided to cancel the move if the cat cannot be found.",
      misread: "He has genuinely forgotten the name that the family gave the cat.",
    },
    {
      scene: "ii-lit-honorable-mention",
      name: "Priya",
      text:
        "When the science fair results were posted, Priya's name appeared under \"Honorable Mention,\" below Ellis's, which was listed first. \"It's fine,\" she told her mother at dinner. \"Honestly, the judges barely looked at mine.\" After dinner, she took her display board out of the closet where she had shoved it, laid it on her bedroom floor, and began taking notes on a legal pad under the heading \"Next Year.\"",
      surface: "Honestly, the judges barely looked at mine.",
      action: "began taking notes on a legal pad under the heading",
      key: "She is determined to improve her project for a future competition.",
      faceValue: "She has lost interest in science fairs after this year's disappointing result.",
      overreach: "She plans to ask the judges to reverse their decision about Ellis.",
      misread: "She won first prize at the fair, finishing ahead of her classmate Ellis.",
    },
  ];

  const characterAction = {
    ...RW,
    id: "inference-character-shown-by-action",
    skill: "Inferences",
    subskill: "logical inference",
    difficulty: "Medium",
    title: "Character's feeling inferred from action that contradicts words",
    recognize:
      "What the character says and what the character does point in different directions; the inference follows the action, and goes no further than it.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "extreme-language", "word-association"],
    build(t) {
      const topic = t.pick(CHARACTER_ACTION_TOPICS);
      const content = `The following text is from a short story.\n\n${topic.text}`;
      const wrong = [
        [topic.faceValue, `This takes ${topic.name}'s words or manner at face value and ignores what ${topic.name} actually does.`],
        [topic.overreach, "This goes well beyond what the passage shows; nothing in it indicates such a decision."],
        [topic.misread, "This misreads a detail of the passage and attaches it to the wrong person or purpose."],
      ];
      return mc("Medium", topic, {
        stimulus: passage(content),
        stem: `Based on the text, what can most reasonably be inferred about ${topic.name}?`,
        correct: topic.key,
        wrong,
        explanation:
          `What ${topic.name} says or seems to feel ("${topic.surface}") and what ${topic.name} does ("${topic.action}") point in different directions. The inference follows the action: ${topic.key}`,
        steps: [
          `Note what ${topic.name} says or how ${topic.name} seems.`,
          `Note what ${topic.name} then does.`,
          "Choose the inference the action supports, without adding a decision the passage never shows.",
        ],
        principles: [
          "In fiction, actions often reveal feelings that characters do not state.",
          "A reasonable inference is the least that the details require, not the most they allow.",
        ],
        trap: "Believing the character's words over the character's actions.",
        hint: `Which of ${topic.name}'s actions doesn't fit the impression ${topic.name} gives?`,
        verify: () => inOrder(content, [topic.surface, topic.action]) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Inferences: a finding that tells two proposed explanations apart    */
  /* ------------------------------------------------------------------ */

  // The text names two explanations (`first`, `second`) and then a finding
  // (`finding`) that one explanation predicts and the other does not. The
  // passage never spells out either prediction; the student must derive
  // them. The key draws the modest conclusion; one distractor overclaims
  // that the favored explanation is proven or the only one. The finding
  // favors the first explanation in some scenes and the second in others,
  // so each scene carries its own reasons and trap. Hedged and unhedged
  // wording is spread over keys and distractors alike.
  const COMPETING_EXPLANATION_TOPICS = [
    {
      scene: "ii-zebra-stripes-flies",
      text:
        "Scientists have proposed two explanations for why zebras have stripes. According to the first, the stripes confuse lions and other large predators during a chase. According to the second, the stripes discourage biting flies, which spread disease. A survey of zebra populations across Africa found that stripes are boldest where biting flies are active for most of the year, and that stripe boldness shows no relationship to the number of lions in an area. This finding suggests that ______.",
      first: "the stripes confuse lions",
      second: "the stripes discourage biting flies",
      finding: "shows no relationship to the number of lions",
      key: "the stripes' pattern fits the fly explanation better than it fits the predator explanation",
      reversed: "zebras living among many lions have probably developed bolder stripes than other zebras",
      reversedReason: "The survey found no relationship between stripe boldness and the number of lions, so this contradicts the finding.",
      extreme: "the stripes evolved solely to discourage biting flies and serve zebras in no other way",
      both: "neither biting flies nor predators have influenced the way zebra stripes evolved",
      bothReason: "Stripe boldness tracks where biting flies are active, so the finding does not show that flies had no influence.",
      trap: "Leaping from “stripe boldness tracks biting flies” to “the stripes exist only to repel flies.”",
    },
    {
      scene: "ii-blue-egg-sunscreen",
      text:
        "Two explanations have been offered for why some songbirds lay blue eggs. The first proposes that the blue pigment acts as a sunscreen, shielding the developing chick from harmful ultraviolet light. The second proposes that a bright blue egg signals the female's health to her mate, encouraging him to help feed the chicks. Researchers comparing many species found that eggs laid in deeply shaded nests, where ultraviolet light is weak, are just as blue as eggs laid in nests exposed to open sun. This finding suggests that ______.",
      first: "acts as a sunscreen",
      second: "signals the female's health to her mate",
      finding: "are just as blue as eggs laid in nests exposed to open sun",
      key: "shielding chicks from ultraviolet light is unlikely to be the main reason eggs are blue",
      reversed: "blue eggs are bluest in the nests where ultraviolet light is strongest",
      reversedReason: "Eggs in deeply shaded nests were just as blue as eggs in open sun, so this contradicts the finding.",
      extreme: "blue eggs have been shown to exist only so that females can signal their health to mates",
      both: "egg color probably has no effect on how well songbird chicks survive or are fed",
      bothReason: "The finding concerns only whether egg color tracks sunlight; it says nothing about how chicks survive or are fed.",
      trap: "Taking evidence against the sunscreen explanation as proof that the signaling explanation is correct.",
    },
    {
      scene: "ii-yawning-cooling",
      text:
        "Researchers have proposed two explanations for yawning. One holds that yawning raises the level of oxygen in the blood when it runs low; the other holds that yawning cools the brain by drawing in air and increasing blood flow to the head. In one experiment, volunteers breathing air enriched with extra oxygen yawned just as often as volunteers breathing ordinary air, while volunteers holding cold packs to their foreheads yawned far less often. These results suggest that ______.",
      first: "raises the level of oxygen in the blood",
      second: "cools the brain",
      finding: "yawned just as often as volunteers breathing ordinary air",
      key: "yawning is more closely tied to brain temperature than to oxygen in the blood",
      reversed: "people probably yawn less often when the air they breathe contains extra oxygen",
      reversedReason: "Volunteers breathing oxygen-enriched air yawned just as often as the others, so this contradicts the result.",
      extreme: "brain temperature is the only factor that can cause a person to yawn",
      both: "neither oxygen levels nor temperature has any connection to how often people yawn",
      bothReason: "Cold packs made volunteers yawn far less often, so temperature did show a connection.",
      trap: "Concluding that because cooling reduced yawning, temperature must be the only cause of yawning.",
    },
    {
      scene: "ii-alpine-bronze-spread",
      text:
        "Archaeologists have proposed two explanations for how bronze-making reached a remote valley in the Alps. One holds that local smiths learned the technique through trade, adopting it gradually while keeping their own styles of tools. The other holds that migrant metalworkers arrived and brought both the technique and their own designs with them. Excavations show that the earliest bronze tools in the valley copy the shapes of the stone and copper tools made there for centuries before. This finding suggests that ______.",
      first: "local smiths learned the technique through trade",
      second: "migrant metalworkers arrived",
      finding: "copy the shapes of the stone and copper tools",
      key: "local smiths more likely adopted the technique than newcomers brought it to the valley",
      reversed: "migrant metalworkers brought their own tool designs when they introduced bronze",
      reversedReason: "The earliest bronze tools copy the valley's older local shapes, the opposite of what newcomers with their own designs would produce.",
      extreme: "no one from outside the valley ever had any influence on how its people worked metal",
      both: "the valley's smiths probably had no contact with outside traders before bronze arrived",
      bothReason: "The explanation the finding favors has local smiths learning bronze through trade, which requires contact with outsiders.",
      trap: "Taking the local tool shapes as proof that no outsider ever influenced the valley's metalworking.",
    },
    {
      scene: "ii-loggerhead-magnetic-homing",
      text:
        "Loggerhead sea turtles return as adults to nest on the stretch of coast where they hatched. Some researchers think the turtles find that stretch by remembering its distinctive smell; others think they recognize the particular strength and angle of Earth's magnetic field there. Earth's magnetic field drifts slowly, so the field once associated with a given beach gradually shifts along the coastline. Over two decades, researchers found that the turtles' nesting sites shifted along the coast in step with the drifting field. This finding suggests that ______.",
      first: "by remembering its distinctive smell",
      second: "the particular strength and angle of Earth's magnetic field",
      finding: "shifted along the coast in step with the drifting field",
      key: "turtles probably rely more on magnetic cues than on smell to find their nests",
      reversed: "turtles keep returning to the same nesting sites, whose distinctive smell has stayed the same",
      reversedReason: "The nesting sites moved along the coast with the drifting field, so the turtles did not keep to the same spots.",
      extreme: "magnetism alone guides the turtles, which cannot detect smells of any kind",
      both: "turtles no longer return to the nesting sites near the stretch of coast where they hatched",
      bothReason: "The sites shifted only in step with the field; the text still describes turtles returning to the stretch where they hatched.",
      trap: "Moving from “the nests follow the magnetic field” to “smell plays no part at all.”",
    },
    {
      scene: "ii-island-dialect-vowels",
      text:
        "Linguists have offered two explanations for why the dialect of the island of Varda lost its distinctive vowel sounds during the twentieth century. One credits radio and television, which brought mainland speech into every home. The other credits a new causeway, which let islanders commute daily to jobs on the mainland. Recordings show that the vowels changed first and fastest among islanders who commuted, while islanders who stayed home, and who listened to radio and television just as often, kept the old vowels for decades longer. These recordings suggest that ______.",
      first: "credits radio and television",
      second: "credits a new causeway",
      finding: "kept the old vowels for decades longer",
      key: "daily contact with mainland speakers did more to change the island's vowels than broadcasts did",
      reversed: "the islanders who stayed home changed their vowels first, under the influence of radio and television",
      reversedReason: "The islanders who stayed home kept the old vowels, though they heard just as much radio and television as the commuters.",
      extreme: "broadcast media never have any influence on the way that anyone speaks",
      both: "the islanders who commuted kept the old vowels longer than those who stayed home",
      bothReason: "This reverses the recordings: the commuters changed first, and those who stayed home kept the old vowels.",
      trap: "Concluding from one island's recordings that broadcasting never affects anyone's speech.",
    },
    {
      scene: "ii-web-silk-bands",
      text:
        "Some orb-weaving spiders add thick zigzag bands of silk to their webs. One explanation holds that the bands make webs visible to birds, which then avoid flying through and destroying them; another holds that the bands attract insects by reflecting ultraviolet light. In a field study, webs with bands caught fewer insects than webs without them but were damaged by birds far less often. These findings suggest that ______.",
      first: "make webs visible to birds",
      second: "attract insects by reflecting ultraviolet light",
      finding: "caught fewer insects than webs without them",
      key: "the bands more likely protect webs from birds than attract prey",
      reversed: "the bands help spiders catch more of the insects that fly near their webs",
      reversedReason: "Webs with bands caught fewer insects, so the finding contradicts this.",
      extreme: "the bands have been proven to serve only as a warning to passing birds",
      both: "neither birds nor insects respond in any way to the silk bands on webs",
      bothReason: "Birds damaged banded webs far less often, so birds evidently respond to the bands.",
      trap: "Treating one field study as proof that the bands do nothing except warn birds.",
    },
    {
      scene: "ii-kessara-abandonment",
      text:
        "Historians have proposed two explanations for why residents abandoned the hilltop town of Kessara around 1200 BCE. Some point to an invading army, while others point to a long drought that ruined the farmland around the town. Excavations of the town's final layer found houses emptied of valuables but otherwise intact, with no signs of burning and no weapons or damaged walls. This finding suggests that ______.",
      first: "an invading army",
      second: "a long drought",
      finding: "no signs of burning and no weapons or damaged walls",
      key: "the town was probably not abandoned because of a violent attack",
      reversed: "an invading army destroyed the town before its residents could escape",
      reversedReason: "The final layer shows no burning, weapons, or damaged walls, so it gives no sign of destruction by an army.",
      extreme: "a drought has been shown to be the cause of the town's abandonment",
      both: "the residents left for reasons unrelated to either farming or warfare",
      bothReason: "The finding counts against an attack only; it gives no reason to rule out the drought that ruined the farmland.",
      trap: "Taking evidence against an invasion as proof that the drought explanation is correct.",
    },
    {
      scene: "ii-moth-lamp-orientation",
      text:
        "Why moths gather around artificial lights has long puzzled biologists. One idea is that moths steer by keeping the Moon at a fixed angle and are misled by nearby lamps. Another is that moths instinctively keep their backs turned toward the brightest part of the sky, which normally keeps them level in flight. High-speed cameras showed that moths near a lamp tilted their backs toward it, circling it tightly and even flying upside down when the lamp was below them. These observations suggest that ______.",
      first: "keeping the Moon at a fixed angle",
      second: "keep their backs turned toward the brightest part of the sky",
      finding: "flying upside down when the lamp was below them",
      key: "turning their backs toward light explains the moths' behavior better than Moon steering does",
      reversed: "moths near a lamp probably steer by holding it at a fixed angle, as they do with the Moon",
      reversedReason: "The cameras showed moths tilting their backs toward the lamp, even flying upside down, which fixed-angle steering does not predict.",
      extreme: "moths have no ability to use the Moon or any other light source for navigation",
      both: "artificial lights have little effect on the way moths fly when they are nearby",
      bothReason: "Moths near the lamp circled it tightly and flew upside down, so the light clearly affected their flight.",
      trap: "Concluding that because the back-to-light idea fits, moths cannot use the Moon at all.",
    },
    {
      scene: "ii-skink-blue-tails",
      text:
        "Young skinks of one island species have bright blue tails that fade as the lizards mature. One explanation holds that the blue tail draws predators' attacks away from the head, since a skink can shed its tail and escape. Another holds that the color signals to adult males that a juvenile is not a rival, reducing attacks by adults. On a nearby island where the species has lived for centuries with no predators at all, juveniles still have equally bright blue tails. This finding suggests that ______.",
      first: "draws predators' attacks away from the head",
      second: "signals to adult males that a juvenile is not a rival",
      finding: "juveniles still have equally bright blue tails",
      key: "escaping predators may not be the main reason young skinks have blue tails",
      reversed: "blue tails exist mainly to draw predators' attacks away from young skinks' heads",
      reversedReason: "Juveniles on an island without predators for centuries still have equally bright tails, which counts against this.",
      extreme: "blue tails have been shown to exist only to keep adult males from attacking young skinks",
      both: "juveniles on the island without predators have lost their bright blue tails",
      bothReason: "The text says those juveniles still have equally bright blue tails.",
      trap: "Taking evidence against the predator explanation as proof that the signal to adult males is the reason.",
    },
  ];

  const competingExplanations = {
    ...RW,
    id: "inference-completion-competing-explanations",
    skill: "Inferences",
    subskill: "text completion",
    difficulty: "Medium",
    title: "Completion saying which of two explanations a finding favors",
    recognize:
      "Work out what each explanation predicts before reading the finding; the finding counts against the one whose prediction fails, which does not prove the other.",
    // Medium: the two predictions must be worked out, but the passage sets
    // them side by side and one finding separates them.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "extreme-language", "too-broad"],
    build(t) {
      const topic = t.pick(COMPETING_EXPLANATION_TOPICS);
      const wrong = [
        [topic.reversed, topic.reversedReason],
        [topic.extreme, "The finding weighs against one explanation; it does not prove the other or rule out every other factor."],
        [topic.both, topic.bothReason],
      ];
      return mc("Medium", topic, {
        stimulus: passage(topic.text),
        stem: "Which choice most logically completes the text?",
        correct: topic.key,
        wrong,
        explanation:
          `The finding ("${topic.finding}") is what one explanation would lead you to expect and is hard to reconcile with the other. It therefore favors one explanation without proving it: ${topic.key}.`,
        steps: [
          "State what each explanation would lead you to expect.",
          "Compare the finding with each expectation.",
          "Complete the text with the conclusion the comparison supports, no stronger than one finding allows.",
        ],
        principles: [
          "Evidence discriminates between explanations when they predict different outcomes.",
          "A finding that counts against one explanation does not by itself prove another.",
        ],
        trap: topic.trap,
        hint: "Which explanation would have predicted this result, and which would not?",
        verify: () =>
          inOrder(topic.text, [topic.first, topic.second, topic.finding]) &&
          endsInBlank(topic.text) &&
          allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Inferences: complete "the study does not show that ___" by finding  */
  /* the one claim the stated limitation blocks                          */
  /* ------------------------------------------------------------------ */

  // The study establishes some things and not others. Each distractor is a
  // claim the study DID establish (its supporting fragment is in `shown`),
  // so completing "does not show that ..." with it is false. The key is the
  // claim that the stated limitation (`limit`) leaves unsupported.
  const EVIDENCE_LIMIT_TOPICS = [
    {
      scene: "ii-bumblebee-pesticide-cages",
      text:
        "Ecologist Ruth Amsel exposed bumblebee colonies to a common farm pesticide at the levels found in treated fields and compared them with unexposed colonies. The exposed colonies gathered pollen less efficiently and produced about half as many new queens. All of the colonies in her study, however, were kept in large flight cages containing a single type of flower, whereas wild bumblebees forage across entire landscapes. For that reason, the study does not by itself establish that ______.",
      limit: "were kept in large flight cages",
      shown: ["produced about half as many new queens", "gathered pollen less efficiently", "at the levels found in treated fields"],
      key: "wild bumblebee colonies near treated fields produce fewer queens because of the pesticide",
      scoped: "the pesticide reduced the number of queens produced by the colonies kept in cages",
      secondary: "colonies exposed to the pesticide gathered pollen less efficiently than other colonies",
      existence: "the pesticide can affect bumblebee colonies at levels found in treated fields",
    },
    {
      scene: "ii-park-proximity-mood",
      text:
        "Surveying 4,000 residents of a single city, psychologist Tomás Rivera found that people who lived within a five-minute walk of a park reported better moods, on average, than people who lived farther away, and the pattern held in every age group he surveyed. But residents choose where to live, and people who value outdoor activity may both seek homes near parks and be happier for other reasons. Thus, the survey alone cannot show that ______.",
      limit: "residents choose where to live",
      shown: ["reported better moods, on average", "held in every age group", "within a five-minute walk of a park"],
      key: "living within a short walk of a park is what improves a resident's mood",
      scoped: "residents living near parks reported better moods on average",
      secondary: "the link between parks and mood appeared in every age group",
      existence: "some residents of the city live within a short walk of a park",
    },
    {
      scene: "ii-bronze-age-fish-diet",
      text:
        "By analyzing chemical traces in the bones of twenty-two people buried in a Bronze Age cemetery on the coast of what is now Denmark, archaeologist Sofie Brandt found that most of them had eaten large amounts of fish. Every skeleton she studied came from the cemetery's wealthiest graves, marked by bronze ornaments, because the poorer graves had been destroyed by later plowing. Her results therefore cannot, on their own, show that ______.",
      limit: "Every skeleton she studied came from the cemetery's wealthiest graves",
      shown: ["most of them had eaten large amounts of fish", "By analyzing chemical traces in the bones", "most of them had eaten large amounts of fish"],
      key: "most people in the community, rich and poor alike, ate large amounts of fish",
      scoped: "most of the people buried in the cemetery's wealthiest graves had eaten a lot of fish",
      secondary: "chemical traces in bones can reveal information about what a person ate",
      existence: "at least some people in the community ate large amounts of fish",
    },
    {
      scene: "ii-reading-app-eight-weeks",
      text:
        "Education researcher Grace Tembo gave 300 third graders a reading app to use for fifteen minutes a day. After eight weeks, their scores on a reading-fluency test had risen more than those of a similar group of students who did not use the app. Tembo's study ended at eight weeks, however, and many educational tools produce early gains that fade once the novelty wears off. The study therefore does not by itself show that ______.",
      limit: "Tembo's study ended at eight weeks",
      shown: ["had risen more than those of a similar group", "for fifteen minutes a day", "After eight weeks"],
      key: "the app's benefits for reading fluency will last through a full school year",
      scoped: "students who used the app improved more over eight weeks than similar students",
      secondary: "fifteen minutes a day with the app was enough to produce a measurable gain",
      existence: "the app can raise third graders' fluency scores over a period of weeks",
    },
    {
      scene: "ii-exoplanet-methane-blind",
      text:
        "Using a space telescope, astronomers examined starlight passing through the atmosphere of a distant planet as the planet crossed in front of its star, and they detected clear signatures of water vapor and carbon dioxide. The instrument they used, however, is not sensitive to the wavelengths at which methane absorbs light, so methane would not have appeared in their data whether or not the planet's atmosphere contains it. Their observations therefore do not show that ______.",
      limit: "is not sensitive to the wavelengths at which methane absorbs light",
      shown: ["detected clear signatures of water vapor", "and carbon dioxide", "examined starlight passing through the atmosphere"],
      key: "the planet's atmosphere contains no methane",
      scoped: "the planet's atmosphere contains water vapor",
      secondary: "carbon dioxide is present in the planet's atmosphere",
      existence: "starlight can reveal gases in a planet's atmosphere",
    },
    {
      scene: "ii-wolves-willows-wet-years",
      text:
        "After wolves returned to a national park, ecologist Paulo Mendes found that willow shrubs along the park's streams grew taller than they had in decades. Tracking collars also showed that elk, wary of wolves, spent less time near the streams than they once had. During the same years, however, the park had several unusually wet summers, which could have helped the willows grow even if elk had browsed as much as ever. Mendes's findings therefore do not by themselves establish that ______.",
      limit: "the park had several unusually wet summers",
      shown: ["grew taller than they had in decades", "spent less time near the streams", "After wolves returned"],
      key: "reduced browsing by elk is what allowed the willows to grow taller",
      scoped: "willows along the park's streams grew taller after the wolves returned",
      secondary: "elk spent less time near the park's streams after the wolves returned",
      existence: "willows can grow taller in the park while wolves are present",
    },
    {
      scene: "ii-bilingual-attention-sample",
      text:
        "Psychologist Leah Morgan found that adults who had grown up speaking two languages outperformed adults who spoke one language on a test that required ignoring distracting information, and the bilingual participants also answered more quickly on average. All of the bilingual participants, however, were university students recruited from language departments, while the monolingual participants came from the general public. Morgan's results therefore do not on their own show that ______.",
      limit: "were university students recruited from language departments",
      shown: ["outperformed adults who spoke one language", "answered more quickly on average", "had grown up speaking two languages outperformed"],
      key: "growing up bilingual is what improves a person's ability to ignore distractions",
      scoped: "the bilingual participants scored higher on the test than the monolingual ones",
      secondary: "the bilingual participants answered more quickly on average than the others",
      existence: "some adults who grew up bilingual are skilled at ignoring distracting information",
    },
    {
      scene: "ii-comet-ice-amino-acids",
      text:
        "In a laboratory, chemist Ivan Petrov exposed frozen mixtures of water, ammonia, and methanol to ultraviolet light, imitating the ices found on comets. The mixtures produced several amino acids, the building blocks of proteins, as well as simple sugars. Real comets, however, also contain dust and other ices that were absent from Petrov's mixtures and that could block or alter these reactions. Thus, his results do not by themselves establish that ______.",
      limit: "also contain dust and other ices that were absent",
      shown: ["The mixtures produced several amino acids", "as well as simple sugars", "exposed frozen mixtures"],
      key: "amino acids actually form in the ices of real comets",
      scoped: "ultraviolet light produced amino acids in the frozen laboratory mixtures",
      secondary: "the laboratory mixtures also yielded simple sugars",
      existence: "ultraviolet light can drive amino acid formation under some laboratory conditions",
    },
    {
      scene: "ii-anonymous-sermon-style",
      text:
        "Scholar Hélène Dubois compared the vocabulary of an anonymous medieval sermon with that of sermons known to have been written by the abbot Anselm of Varenne. The anonymous sermon shares many rare words and turns of phrase with Anselm's work, and it quotes the same biblical passages he favored. Dubois notes, however, that Anselm's sermons were widely copied and studied by monks in his region, some of whom imitated his style closely. Her comparison therefore cannot on its own show that ______.",
      limit: "some of whom imitated his style closely",
      shown: ["shares many rare words and turns of phrase", "quotes the same biblical passages he favored", "shares many rare words"],
      key: "the anonymous sermon was written by Anselm himself",
      scoped: "the anonymous sermon shares rare words with Anselm's sermons",
      secondary: "the anonymous sermon quotes biblical passages Anselm favored",
      existence: "the anonymous sermon resembles Anselm's writing in its vocabulary",
    },
    {
      scene: "ii-cassava-steady-rain",
      text:
        "In a field trial, agronomist Kwabena Asante planted a new variety of cassava alongside the standard variety and found that the new variety yielded about 30 percent more roots. The new plants also showed fewer signs of a common leaf disease. The trial, however, took place in a single growing season that happened to have unusually steady rainfall, while farmers in the region often face long dry spells. Therefore, the trial does not by itself show that ______.",
      limit: "happened to have unusually steady rainfall",
      shown: ["yielded about 30 percent more roots", "showed fewer signs of a common leaf disease", "yielded about 30 percent more roots"],
      key: "the new variety will outyield the standard one in seasons with long dry spells",
      scoped: "the new variety produced more roots than the standard variety in the trial",
      secondary: "the new variety showed fewer signs of leaf disease than the standard variety",
      existence: "the new variety can outyield the standard variety under some conditions",
    },
  ];

  const evidenceLimit = {
    ...RW,
    id: "inference-completion-limits-of-evidence",
    skill: "Inferences",
    subskill: "text completion",
    difficulty: "Medium",
    title: "Completion naming the claim a study's limitation leaves unsupported",
    recognize:
      "The blank follows \"does not show that\": the answer is the one claim the stated limitation blocks, and every claim the study did establish is wrong here.",
    // Medium, not Hard: each distractor restates a reported result almost
    // word for word, so the key is the one choice the passage never states;
    // the negation logic is real but takes a single comparison.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "too-narrow"],
    build(t) {
      const topic = t.pick(EVIDENCE_LIMIT_TOPICS);
      const wrong = [
        [topic.scoped, "The study did show this for the cases it examined, so the text cannot say the study fails to show it."],
        [topic.secondary, "This is another result the study reports, so it is something the study does show."],
        [topic.existence, "The study's own results demonstrate this much; the limitation concerns a broader claim."],
      ];
      return mc("Medium", topic, {
        stimulus: passage(topic.text),
        stem: "Which choice most logically completes the text?",
        correct: topic.key,
        wrong,
        explanation:
          `The study established several things, but the limitation the text points out ("${topic.limit}") means it cannot support one broader claim. Completing "does not show that" requires that unsupported claim: ${topic.key}.`,
        steps: [
          "List what the study actually found.",
          "Identify the limitation the text introduces with \"however.\"",
          "Choose the claim that the limitation leaves unsupported; reject any claim the study did establish.",
        ],
        principles: [
          "\"The study does not show X\" is false if the study does show X.",
          "A limitation in who or what was studied blocks conclusions about those who were not studied, or about causes the design could not separate.",
        ],
        trap: "Picking a true finding of the study, overlooking that the sentence says what the study does not show.",
        hint: "Which choice goes beyond what the study could observe, given the limitation?",
        verify: () =>
          topic.text.includes(topic.limit) &&
          topic.shown.every((fragment) => topic.text.split(topic.limit)[0].includes(fragment)) &&
          endsInBlank(topic.text) &&
          allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Inferences: combine a general fact stated early with a case stated  */
  /* at the end, reasoning back to something the text never mentions     */
  /* ------------------------------------------------------------------ */

  // Original self-contained cases require combining records, chronology,
  // conditional effects, or measurement rules. Named anchors are separated
  // in the passage; that structural property alone does not verify the
  // inference. Each scene supplies its reasoning and specific error rationales.
  const SEPARATED_PREMISE_TOPICS = [
    {
      "scene": "ii-inf-separated-selven-ledger",
      "about": "the apparent rise in Selven's timber imports after 1840",
      "text": "Before 1840, Selven's customs ledger recorded a timber shipment when its owner paid the import duty, regardless of when the timber arrived. Unpaid shipments remained in a separate register. A reform required the main ledger to record arrivals immediately, with payment entered later. Historian Leda Orin found that the main ledger's timber entries doubled in 1840, although harbor pilots reported roughly unchanged numbers and sizes of incoming timber vessels. Most of the additional entries correspond to shipments whose owners paid no duty that year.",
      "premise": "recorded a timber shipment when its owner paid the import duty",
      "evidence": "Most of the additional entries correspond to shipments whose owners paid no duty that year",
      "key": "It may chiefly reflect entry into the main ledger of unpaid shipments that the earlier system would have recorded separately.",
      "wrong": [
        [
          "It may reflect merchants dividing similar quantities into smaller shipments to postpone duty payment rather than arrivals.",
          "Vessel numbers and sizes were stable, and the passage connects the additional entries to recording unpaid arrivals, not to merchants splitting shipments."
        ],
        [
          "It suggests that the reform increased duty receipts while leaving the physical volume of timber imports approximately unchanged.",
          "The additional recorded shipments were unpaid that year; entries after the reform no longer establish that duty was received."
        ],
        [
          "It suggests that the harbor pilots omitted vessels carrying timber whose owners had not yet paid the import duty.",
          "Nothing links the pilots' counts to payment; it is the customs ledger, rather than the pilots' reporting, whose inclusion rule changed."
        ]
      ],
      "explanation": "The old main ledger counted payments and left unpaid arrivals elsewhere. The reform moved those arrivals into the main ledger, and most added entries are precisely unpaid shipments. Together with stable vessel traffic, this supports a recording change rather than a comparable increase in physical imports."
    },
    {
      "scene": "ii-inf-separated-meret-glaze",
      "about": "the evidence provided by the surviving Meret bowls",
      "text": "At Meret, potters stamped bowls before firing them; merchants sometimes applied a decorative coating years later. A mineral in that coating broke down when exposed to the temperatures used for firing, so it could survive only if applied afterward. Museum catalogues date a group of bowls to a late workshop because their intact coatings contain this mineral and resemble that workshop's designs. However, their stamps match dies discarded by an earlier workshop, and microscopic examination shows that the stamps were impressed in soft clay rather than copied onto hardened bowls.",
      "premise": "potters stamped bowls before firing them",
      "evidence": "the stamps were impressed in soft clay rather than copied onto hardened bowls",
      "key": "Their manufacture can predate their surviving decoration, so the coating is insufficient to assign them to the later workshop.",
      "wrong": [
        [
          "Their manufacture probably belongs to the later workshop, whose potters copied earlier stamps before applying a traditional decorative coating.",
          "Copying an older stamp design is possible but not established. The coating was applied after firing, so its style cannot by itself identify the bowl’s maker."
        ],
        [
          "Their decoration can predate their manufacture, since the older stamps were added after the mineral coating had already been applied.",
          "Stamps were impressed in soft clay before firing, while the surviving mineral coating had to be applied after firing."
        ],
        [
          "Their manufacture and decoration belong to the early workshop, despite the coating's resemblance to later designs.",
          "The stamp belongs to manufacture, but merchants could add the surviving decoration years later. Neither feature establishes that both stages belonged to the early workshop."
        ]
      ],
      "explanation": "The soft-clay stamp belongs to manufacture before firing; the intact heat-sensitive coating belongs after firing and could have been added years later. The coating’s style therefore cannot by itself date the underlying bowl or identify its maker; a later decoration need not imply a later manufacture."
    },
    {
      "scene": "ii-inf-separated-velin-grass",
      "about": "the result of the Velin grass experiment",
      "text": "In experiments on Velin grass, a root fungus increased growth only when plants received a chemical signal produced by neighboring grass. Researchers could remove that signal from water without removing nutrients or harming the fungus. A new study supplied every pot with identical soil, fungus, and water collected around established grass. Half the pots received untreated water; the others received water from which the signal had been removed. Growth was higher in the first group. A colleague concluded that established grass must therefore have enriched its neighbors' water with additional nutrients.",
      "premise": "a root fungus increased growth only when plants received a chemical signal",
      "evidence": "water from which the signal had been removed",
      "key": "The comparison separates the signal's contribution from nutrient supply, so it does not support the colleague's explanation of the difference.",
      "wrong": [
        [
          "It shows the signal directly promotes growth, with the fungus present but unnecessary to the response.",
          "Every pot contained fungus, so the experiment cannot show that the signal works without it; the earlier result instead describes an interaction."
        ],
        [
          "The comparison suggests the fungus needs nutrients from established grass, regardless of whether the chemical signal remains.",
          "Nutrients were preserved in both groups, while the signal differed; the result does not make the signal dispensable."
        ],
        [
          "The comparison establishes that grass without the fungus would grow equally under both water treatments, since the nutrients were unchanged.",
          "No group lacked fungus. Equal nutrients do not rule out other signal effects in such an untested group."
        ]
      ],
      "explanation": "The early result makes the fungus's growth effect conditional on a signal. The later treatment selectively removes that signal while preserving nutrient supply and the fungus. The resulting difference therefore cannot be attributed to different amounts of added nutrients, nor does it separate the signal from its interaction with the fungus."
    },
    {
      "scene": "ii-inf-separated-arden-petitions",
      "about": "the repeated names in Arden's drainage petitions",
      "text": "Arden's council filed a new drainage petition under the year it first arrived, but attached later endorsements to the original file. A petition that was formally rejected could be submitted again only as a new file. One surviving bundle contains three files dated five years apart, each requesting the same drainage channel and bearing many of the same signatures. A historian treats the files as successive waves of newly recruited supporters. Council minutes, however, record rejection of the proposed channel shortly before each of the last two files was opened.",
      "premise": "attached later endorsements to the original file",
      "evidence": "record rejection of the proposed channel shortly before each of the last two files was opened",
      "key": "They more likely document renewed applications by existing supporters than three distinct expansions of the campaign's following.",
      "wrong": [
        [
          "They more likely record endorsements accumulated on one application than requests renewed after separate council decisions.",
          "Later endorsements stayed in the original file, whereas formal rejection required a new application; the separate files and rejections fit resubmissions."
        ],
        [
          "They indicate that supporters returned after approvals failed to produce construction, rather than after the council rejected their proposals.",
          "The minutes record rejection, not approval followed by nonimplementation; this preserves the idea of persistence but substitutes a different cause."
        ],
        [
          "They indicate that the campaign recruited additional supporters at intervals determined by the council's rules for reopening rejected proposals.",
          "The files' creation can be explained by resubmission, and repeated signatures identify existing supporters; no recruitment increase is established."
        ]
      ],
      "explanation": "Separate files need not mean newly recruited supporters: Arden required a new file after rejection but not for additional endorsements. The recorded rejections just before the new files, together with recurring signatures, support persistence by the same campaigners."
    },
    {
      "scene": "ii-inf-separated-osk-molt",
      "about": "the tagged Osk birds examined in September",
      "text": "In a study of Osk birds, researchers found that the chemical signature of a feather records diet during that feather's growth and remains unchanged afterward. Adults replace their wing feathers in spring and their breast feathers in late summer. River insects and plateau insects leave distinct signatures; birds feeding exclusively in either habitat acquire the corresponding signature. The tagged adults had river signatures in their wing feathers and plateau signatures in their breast feathers. All were captured beside the river in September, after both replacements were complete.",
      "premise": "records diet during that feather's growth and remains unchanged afterward",
      "evidence": "river signatures in their wing feathers and plateau signatures in their breast feathers",
      "key": "Their September location does not identify the habitat in which they obtained the food recorded by their more recently grown feathers.",
      "wrong": [
        [
          "The breast feathers preserve older dietary evidence than the wing feathers, despite their later replacement.",
          "Breast feathers grew later, and signatures are fixed during growth; the contrast cannot reverse the chronology of the dietary records."
        ],
        [
          "Their river capture suggests that the plateau signature reflects a recent change in river insects rather than an earlier difference in the birds' diets.",
          "The passage assigns distinct signatures to the two insect sources and says old feathers retain theirs; capture location does not establish a changed river signature."
        ],
        [
          "Their feather signatures identify a spring plateau diet followed by a late-summer river diet, with their capture confirming the more recent dietary record.",
          "Wing feathers record spring and bear the river signature; breast feathers record late summer and bear the plateau signature. This swaps the two records."
        ]
      ],
      "explanation": "The feathers preserve diets at different growth times, not at capture. The later-grown breast feathers record plateau food even though the birds were beside the river in September. Thus present location cannot substitute for the dietary history encoded in those feathers."
    },
    {
      "scene": "ii-inf-separated-davor-play",
      "about": "the conclusion that Davor's revised ending was performed at the premiere",
      "text": "A theater's rehearsal copies included every change proposed by a playwright, whereas the prompt copy included only changes actually used onstage. The theater sometimes continued rehearsing revisions after a production opened. A surviving rehearsal copy of Davor's play has an ending in which the accused clerk confesses. This ending is absent from the premiere's prompt copy. In a letter written two days after opening, Davor says that the actors have finally agreed to try the confession at their next rehearsal. A critic nevertheless cites the rehearsal copy as evidence of what the first audience saw.",
      "premise": "the prompt copy included only changes actually used onstage",
      "evidence": "the actors have finally agreed to try the confession at their next rehearsal",
      "key": "It confuses a proposed revision with a performed one, despite records that place the revision's trial after opening.",
      "wrong": [
        [
          "It is supported by the rehearsal copy, although the letter indicates that subsequent performances omitted the confession.",
          "The letter schedules the first trial after opening and says nothing about later omission; a rehearsal proposal is not evidence of premiere use."
        ],
        [
          "It identifies an ending used at the premiere but omitted from the prompt copy because that copy recorded only later changes.",
          "The passage gives the prompt copy as the record of changes actually used, not as a record restricted to changes after opening."
        ],
        [
          "It dates the revision too early, but the letter establishes that the confession was performed later in the run.",
          "Agreement to try a revision in rehearsal does not prove any public performance; this substitutes a later unsupported performance claim for the earlier one."
        ]
      ],
      "explanation": "Rehearsal copies record proposals, while prompt copies track onstage use. The premiere's prompt copy lacks the confession, and the post-opening letter places its trial in a future rehearsal. The critic is assigning the proposal the evidentiary status of a performed revision."
    },
    {
      "scene": "ii-inf-separated-naren-bells",
      "about": "the proposed explanation of the Naren survey results",
      "text": "Naren's surveyors compared two bell designs by counting how many listeners reported hearing each bell. A preliminary trial showed that the designs sounded equally loud nearby, but one retained more of its volume at a distance. The later survey used the same number of listeners for each design, and the more distant listeners were assigned disproportionately to the design that carried better. Reports of hearing the bells were equally common in the two groups. The surveyors concluded that their preliminary finding about distance must have been mistaken.",
      "premise": "one retained more of its volume at a distance",
      "evidence": "the more distant listeners were assigned disproportionately to the design that carried better",
      "key": "Equal reporting rates could reflect the better-carrying bell facing greater distances, rather than contradicting its advantage at comparable distances.",
      "wrong": [
        [
          "Equal reporting rates confirm that the better-carrying design loses volume faster at a distance, since it was heard by the more distant listeners.",
          "The first result says the opposite about volume loss; the later comparison mixes design with listener distance and cannot reverse that result."
        ],
        [
          "Equal group sizes remove the effect of listener distance, allowing the surveyors to compare the designs without adjusting for where listeners stood.",
          "Balancing numbers does not balance distances; the design expected to carry better was disproportionately tested farther away."
        ],
        [
          "Equal reporting rates show that nearby listeners preferred the weaker design, offsetting distant listeners' preference for the design that carried better.",
          "The outcome was whether listeners heard a bell, not which design they preferred; assigning preferences cannot explain the recorded comparison."
        ]
      ],
      "explanation": "The preliminary result concerns sound transmission at comparable distances. The later survey systematically assigns a harder listening condition to the better-carrying design. Equal observed hearing rates can reflect opposing effects, rather than refuting the design's advantage at equal distances."
    },
    {
      "scene": "ii-inf-separated-enrel-dormancy",
      "about": "the seedlings in the Enrel seed experiment",
      "text": "In experiments on Enrel seeds, exposure to cold made germination possible but did not itself trigger it; afterward, moisture triggered germination unless the seeds remained in darkness. Researchers buried seeds in cold, damp soil in sealed opaque containers. Several weeks later they opened half the containers in a warm, illuminated room, keeping the soil equally damp in all containers. Seedlings appeared only in the opened containers. An observer attributed the difference to warmth, noting that both groups had experienced the cold treatment.",
      "premise": "moisture triggered germination unless the seeds remained in darkness",
      "evidence": "opened half the containers in a warm, illuminated room",
      "key": "Their emergence is consistent with removal of a light restriction, so the comparison cannot isolate warmth as the cause of the difference.",
      "wrong": [
        [
          "Their emergence shows that warmth replaced the cold requirement, because germination occurred only after the seeds were brought into the illuminated room.",
          "All seeds had already undergone cold exposure; a later warm location does not show that this earlier requirement was dispensable."
        ],
        [
          "Their emergence indicates that opening supplied the first germination requirement, while the earlier cold treatment supplied the necessary moisture.",
          "Moisture was present in every container, and cold enabled later germination; opening changed illumination as well as warmth, not initial moisture availability."
        ],
        [
          "Their emergence establishes that cold and moisture were sufficient together, since those two conditions had been maintained before the containers were opened.",
          "The unopened cold, damp seeds did not germinate; the stated darkness restriction means cold and moisture alone were not sufficient in those containers."
        ]
      ],
      "explanation": "Cold first permits germination, but darkness still blocks moisture's triggering effect. Opening containers changes illumination and warmth together. Because the opening also removes the specified light restriction, the contrast cannot establish that warmth produced the difference."
    },
    {
      "scene": "ii-inf-separated-laren-editions",
      "about": "the edition of the Laren atlas containing both map features",
      "text": "The first edition of the Laren atlas mistakenly placed a village west of a river. For the second edition, the printer corrected that map and replaced a damaged title plate with one bearing an ornamental border. During the third edition's printing, the corrected map plate cracked and was replaced with the first edition's map plate; the bordered title plate remained in use. A collector owns a copy with the western village position and the bordered title. She dates it to the first edition on the basis of the village alone.",
      "premise": "For the second edition, the printer corrected that map",
      "evidence": "the corrected map plate cracked and was replaced with the first edition's map plate",
      "key": "Its older map feature can occur in a later printing, and the title feature identifies the third edition among those described.",
      "wrong": [
        [
          "Its older map feature identifies the first edition, while the ornamental title suggests that the collector has mistaken a map error for a correction.",
          "The title border did not appear until the second edition, and the third reused the first map; the two features jointly fit the third."
        ],
        [
          "Its ornamental title identifies the second edition, while the older village position shows that correcting the map was postponed until a subsequent printing.",
          "The passage explicitly places the correction in the second edition; the error returned when an older plate was reused during the third."
        ],
        [
          "Its mixture of features indicates a copy assembled from separate editions, because the printer used the bordered title only with the corrected map.",
          "The bordered title stayed in use during the third edition, including when the first map plate replaced the cracked corrected plate."
        ]
      ],
      "explanation": "The map error is not confined to the first edition: reuse brought it back during the third. The title border excludes the first, and the uncorrected map excludes the second. Jointly the two features identify the described third-edition printing."
    },
    {
      "scene": "ii-inf-separated-talven-reservoir",
      "about": "the interpretation of the Talven reservoir measurements",
      "text": "In Talven's reservoir, a dye marks water entering through the northern channel and disappears only after prolonged exposure to sunlight. A second marker, introduced through the southern channel, remains detectable in sunlight but disappears after prolonged contact with the reservoir's sediment. Researchers found neither marker in a sheltered bottom sample. They concluded that the water could not have come from either channel. Earlier samples, however, had established that water moves from the sunlit surface to the sheltered bottom, where it remains in contact with sediment.",
      "premise": "disappears only after prolonged exposure to sunlight",
      "evidence": "water moves from the sunlit surface to the sheltered bottom",
      "key": "A water sample can lose either marker along the described route, so their joint absence does not exclude either channel as its source.",
      "wrong": [
        [
          "A sheltered bottom sample should retain the northern marker but lose the southern one, so the results exclude only the northern channel as its source.",
          "The northern marker may have been lost during the earlier sunlit surface stage; shelter at sampling does not restore it."
        ],
        [
          "A sheltered bottom sample should retain the southern marker but lose the northern one, so the results exclude only the southern channel as its source.",
          "The southern marker survives sunlight but disappears during the later sediment contact; the route contains both relevant environments."
        ],
        [
          "A sample lacking both markers shows that the two channel waters mixed, since each marker disappears only after encountering the other channel's water.",
          "Marker loss is caused by sunlight or sediment exposure, not by mixing; either source could lose its marker independently along the route."
        ]
      ],
      "explanation": "The route exposes water successively to sunlight and sediment. Those stages remove different markers, so a source-specific marker can vanish before the sheltered bottom sample is collected. The present absence of both markers is therefore compatible with either source and does not demonstrate mixing."
    }
  ];

  const separatedPremises = {
    ...RW,
    id: "inference-combine-separated-premises",
    skill: "Inferences",
    subskill: "logical inference",
    difficulty: "Hard",
    title: "Inference that joins a fact stated early with a case stated late",
    recognize:
      "Neither the opening fact nor the closing case answers the question alone; combining them points back to something the text never names outright.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["too-narrow", "opposite-stance", "extreme-language"],
    build(t) {
      const topic = t.pick(SEPARATED_PREMISE_TOPICS);
      const wrong = topic.wrong;
      return mc("Hard", topic, {
        stimulus: passage(topic.text),
        stem: `Based on the text, what can most reasonably be inferred about ${topic.about}?`,
        correct: topic.key,
        wrong,
        explanation: topic.explanation ||
          `The text states early on that "${topic.premise}" and later that "${topic.evidence}". Neither fact settles the question alone; together they support: ${topic.key}`,
        steps: [
          "Identify the general fact the text states before it reaches the case.",
          "Identify what the text reports about the case itself.",
          "Combine the two, and reject choices that use only one of them, combine them the wrong way, or claim more than the two together support.",
        ],
        principles: [
          "A reasonable inference must fit every relevant statement in the text, not just the nearest one.",
          "When a detail fits an alternative explanation, check it against the rest of the text before accepting it.",
        ],
        trap: "Seizing on the last sentence, or on a detail that fits an alternative, without checking it against the fact stated earlier in the text, or accepting the right conclusion stated more strongly than the two facts support.",
        hint: "Which general fact stated earlier in the text applies to the case described at the end?",
        verify: () => {
          const start = topic.text.indexOf(topic.premise);
          const end = topic.text.indexOf(topic.evidence);
          return (
            inOrder(topic.text, [topic.premise, topic.evidence]) &&
            end - (start + topic.premise.length) > 60 &&
            wrong.length === 3 &&
            allDistinct(topic.key, wrong)
          );
        },
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Inferences: older prose, where irony or a periodic sentence carries */
  /* the point and the passage never states it                           */
  /* ------------------------------------------------------------------ */

  // Original passages written in the manner of nineteenth-century fiction
  // and early twentieth-century essays; none is an excerpt or a paraphrase
  // of a published work. The inference needs two separated parts of the
  // passage (`anchors`, in order), and the distractors are near misses: a
  // face-value reading of a character's or narrator's words, a view the
  // author reports but questions, an overstatement of what is shown, or a
  // misreading of older syntax. Each item carries its own reasons.
  const PERIOD_HEADERS = {
    story: "The following text is from an original story written in a nineteenth-century style.",
    essay: "The following text is from an original essay written in an early twentieth-century style.",
  };

  const PERIOD_PROSE_TOPICS = [
    {
      scene: "ii-inf-period-pennock-economy",
      kind: "story",
      about: "Mr. Pennock’s remark that the household had never been so well managed",
      text:
        "Mr. Pennock prided himself upon his economy, and he would tell anyone who sat long enough at his table that he had not bought a new coat in eleven years. His wife, who sat at that table oftener than anyone, never contradicted him. It was she who turned the cuffs of the coat each winter, she who sat up by a single candle to mend its lining, and she who had sold, one spring when the accounts would not balance, the little garnet brooch her mother had left her. That summer Mr. Pennock observed to a visitor that the household had never been so well managed.",
      anchors: ["prided himself upon his economy", "sold, one spring when the accounts would not balance"],
      key: "It overlooks how much the household’s thrift has depended on his wife’s work and sacrifice.",
      wrong: [
        ["It is meant as quiet thanks to his wife for selling her brooch to balance the accounts.", "Nothing shows that Mr. Pennock knows of the sale or means to thank anyone; this reads a generosity into the remark that the narrator’s irony undercuts."],
        ["It confirms that his refusal to buy a new coat is what has kept the household solvent.", "This takes Mr. Pennock’s view of himself at face value; the passage shows that his wife’s mending and the sale of her brooch did the real work."],
        ["It shows that his wife has come to resent the economies that he insists upon.", "The wife never contradicts him, and nothing she does is described as resentful; this adds a feeling the passage never shows."],
      ],
      explanation:
        "The first sentence gives Mr. Pennock’s pride in his economy; the middle of the passage shows that it was his wife who turned the cuffs, mended the lining, and sold her brooch when the accounts would not balance. Set beside those facts, his remark that the household was never so well managed ignores who actually managed it.",
      trap: "Taking Mr. Pennock’s pride in his economy at face value instead of weighing it against what his wife has done.",
    },
    {
      scene: "ii-inf-period-dunstable-lodger",
      kind: "story",
      about: "Mrs. Dunstable’s belief about her lodger",
      text:
        "Mrs. Dunstable was persuaded that her new lodger was a gentleman of fortune traveling under an assumed name. He had declined the best bedroom in favor of the attic, at half the rent; he went out every morning at six and came home after dark with ink upon his cuffs; and she had once heard him tell the grocer’s boy that he could not afford the theater. “Such modesty,” said Mrs. Dunstable to her sister, “is the surest mark of a gentleman.” Her sister, who kept a boarding house herself, said nothing.",
      anchors: ["was persuaded that her new lodger was a gentleman of fortune", "could not afford the theater"],
      key: "It rests on details that more plausibly suggest a hard-working man of modest means.",
      wrong: [
        ["It is well founded, since a man of fortune would naturally conceal his wealth.",
         "This adopts Mrs. Dunstable’s reasoning; the cheap attic, the long working days, and his remark about the theater point instead to limited means."],
        ["It is shared by her sister, who keeps a boarding house and knows lodgers well.",
         "Her sister says nothing, and her experience with lodgers makes that silence read as doubt, not agreement."],
        ["It is shaken by her sister’s silence, which she takes as a sign that her sister doubts it.",
         "The sister’s silence does hint at doubt, but the passage never shows Mrs. Dunstable noticing it; her belief is reported without any sign of wavering."],
      ],
      explanation:
        "Mrs. Dunstable reads the attic at half the rent, the long days that end with ink on his cuffs, and his remark that he cannot afford the theater as the modesty of a disguised gentleman. Taken plainly, the same details describe a working man with little money, and her experienced sister’s silence hints at the same doubt.",
      trap: "Adopting Mrs. Dunstable’s interpretation because the passage reports it, instead of weighing the details she interprets.",
    },
    {
      scene: "ii-inf-period-harrowby-schoolmaster",
      kind: "story",
      about: "Mrs. Pell",
      text:
        "The new schoolmaster had been a fortnight in Harrowby before any of the farmers’ wives called upon him, and when at last Mrs. Pell came, she brought a seed-cake and a great many questions, of which the chief was whether he meant to stay the winter. His predecessor, she observed, had not. Nor had the one before him, a young man who had supposed that the roads would be mended by November. The schoolmaster answered that he had already ordered his coal. Mrs. Pell regarded him for some moments in silence, and then said that she would send round a second cake on Sunday.",
      anchors: ["whether he meant to stay the winter", "he had already ordered his coal"],
      key: "She becomes readier to welcome the schoolmaster once she believes he will stay.",
      wrong: [
        ["She suspects that the schoolmaster, like the two men before him, will leave before winter.",
         "That suspicion explains her question, but her promise of a second cake comes only after he says he has ordered his coal, which suggests the suspicion has eased."],
        ["She welcomes the schoolmaster because he has promised her that he will stay through the winter.",
         "He makes no promise; he says only that he has already ordered his coal, which she takes, after a silence, as a sign that he means to stay."],
        ["She regrets having waited a fortnight before calling upon the new schoolmaster.",
         "Nothing in the passage indicates regret; the delay fits her caution about newcomers who do not stay."],
      ],
      explanation:
        "Mrs. Pell’s chief question is whether the schoolmaster will stay the winter, and she notes that the last two did not. Only after he says he has already ordered his coal, a sign that he means to stay, does she promise a second cake. Her welcome depends on his staying.",
      trap: "Reading Mrs. Pell’s opening suspicion as her final attitude, without noticing what changes after he mentions his coal.",
    },
    {
      scene: "ii-inf-period-crane-nephew",
      kind: "story",
      about: "the nephew",
      text:
        "Old Mr. Crane’s nephew arrived at Fellbridge in the very week the doctor was first sent for, and he proved, the housekeeper allowed, the most attentive young man she had ever known. He read aloud to his uncle every evening, though the books were sermons; he walked the dogs, which bit him; and he sat without complaint through dinners at which nothing was served but boiled mutton. When, in March, the old man recovered his health entirely and announced his intention of living to ninety, the nephew discovered that pressing business required his immediate return to London.",
      anchors: ["the very week the doctor was first sent for", "the nephew discovered that pressing business"],
      key: "He appears to have been attentive chiefly because he expected his uncle to die soon.",
      wrong: [
        ["He had grown fond of his uncle but could no longer bear the dull routine at Fellbridge.",
         "He bore the sermons, the dogs, and the mutton all winter; what changes in March is his uncle’s recovery, which is exactly when he leaves."],
        ["He was called back to London by business he had set aside during his uncle’s illness.",
         "This takes the nephew’s excuse at face value, though the narrator has the business become pressing the moment the uncle recovers."],
        ["He had hoped to be named his uncle’s heir and left once the will had been settled in his favor.",
         "The timing does suggest that he hoped to inherit, but nothing says any will was settled; he leaves when his uncle recovers, which points the other way."],
      ],
      explanation:
        "The nephew arrives the week the doctor is first sent for, puts up with sermons, bites, and boiled mutton, and discovers urgent business in London the moment his uncle recovers and plans to live to ninety. The timing at both ends suggests that his attentiveness depended on his expecting his uncle to die.",
      trap: "Accepting the nephew’s excuse of pressing business without noticing when it arises.",
    },
    {
      scene: "ii-inf-period-grange-silver",
      kind: "story",
      about: "Martha’s opinion of Mrs. Lyle",
      text:
        "Martha had been in service at the Grange for thirty years, had seen three mistresses come and go, and had formed a settled opinion of each. Of the present Mrs. Lyle she said nothing at all, which the younger maids took for approval, since Martha was known to speak her mind. Only the cook, who had known her longest, remarked that Martha now polished the silver on Tuesdays, as the late Mrs. Harcourt had always required, and not on Thursdays, as Mrs. Lyle had ordered.",
      anchors: ["which the younger maids took for approval", "and not on Thursdays, as Mrs. Lyle had ordered"],
      key: "It is unfavorable, though Martha shows it through her conduct rather than her words.",
      wrong: [
        ["It is favorable, as her unusual silence on the subject of her new mistress indicates.",
         "This is the younger maids’ reading; the cook, who knows Martha best, points to a quiet disobedience that suggests the opposite."],
        ["It is not yet settled, since Mrs. Lyle has only recently come to the Grange.",
         "Nothing says that Mrs. Lyle has only just arrived, and Martha’s deliberate return to the old routine suggests her mind is made up."],
        ["It is shared by the cook, whose remark shows that she too resents Mrs. Lyle’s orders.",
         "The cook only notices what Martha does; nothing shows the cook’s own opinion of Mrs. Lyle."],
      ],
      explanation:
        "The younger maids take Martha’s silence for approval, but the cook notices that Martha keeps the late mistress’s day for the silver and ignores Mrs. Lyle’s order. From a woman known to speak her mind, silence joined to quiet disobedience signals disapproval.",
      trap: "Adopting the younger maids’ reading of Martha’s silence instead of the cook’s observation.",
    },
    {
      scene: "ii-inf-period-lighthouse-lamp",
      kind: "story",
      about: "the lamp in the upper window",
      text:
        "For three winters the lamp in the upper window of the keeper’s cottage had burned until midnight, and the fishermen, coming home late, had grown used to steering by it as much as by the lighthouse itself. The keeper’s daughter, it was said, sat up reading. When she married and went inland, the window was dark, and that December two boats that had always come home safely ran upon the Skerry rocks. No one blamed the keeper, whose great light had burned faithfully every night; yet the next autumn the village subscribed, without any public discussion of the matter, to keep a lamp burning in that upper window.",
      anchors: ["steering by it as much as by the lighthouse itself", "to keep a lamp burning in that upper window"],
      key: "It had become a guide for the fishermen, though no one had meant it to serve as one.",
      wrong: [
        ["It had been lit each night by the keeper’s daughter so that the fishermen would have a second light to steer by.",
         "The text says that she sat up reading; the fishermen came to steer by her lamp, but nothing suggests she lit it for them."],
        ["It had given the fishermen a surer guide home than the lighthouse’s own great light.",
         "The fishermen steered by it as much as by the lighthouse, not more; this overstates what the text says."],
        ["It had guided the fishermen so well that the village thought the lighthouse itself no longer necessary.",
         "The great light burned faithfully and no one blamed the keeper; the village added a lamp to the lighthouse rather than replacing it."],
      ],
      explanation:
        "The fishermen steered by the lamp as well as by the lighthouse; when it went dark, two boats that had always come home safely were wrecked; and the village then quietly paid to keep a lamp in that window. A lamp lit only for reading had become part of how the boats found their way.",
      trap: "Overstating the lamp’s role, or inventing a purpose for it that the text never suggests.",
    },
    {
      scene: "ii-inf-period-market-statue",
      kind: "essay",
      about: "the author’s view of statues raised to great men",
      text:
        "A town that raises a statue to a great man commonly supposes that it has secured his memory for ever. The event seldom bears this out. Within a generation the bronze figure in the market square has become a place to meet, a perch for pigeons, a landmark by which directions are given, and the name cut into its base is read by strangers only. The man is remembered, if at all, by those who have read his books; the statue is remembered by everyone, and is remembered as a statue.",
      anchors: ["secured his memory for ever", "remembered as a statue"],
      key: "They become familiar landmarks while doing little to preserve the memory of those they honor.",
      wrong: [
        ["They secure the memory of the great men they honor for as long as the bronze endures.",
         "This is what the town supposes when it raises the statue; the author says the event seldom bears it out."],
        ["They are noticed only by strangers, who alone trouble to read the names cut into their bases.",
         "Only strangers read the name, but the author says the statue itself is remembered by everyone."],
        ["They preserve the great man’s memory better than his books do, since everyone remembers the statue.",
         "Everyone remembers the statue “as a statue”; the man himself is remembered, if at all, by those who have read his books."],
      ],
      explanation:
        "The town expects the statue to secure the great man’s memory, but within a generation it serves as a meeting place and a landmark whose inscription only strangers read. The author concludes that the statue is remembered as a statue, while the man is remembered, if at all, through his books.",
      trap: "Taking the town’s expectation for the author’s view, or confusing who reads the name with who notices the statue.",
    },
    {
      scene: "ii-inf-period-hedgerow-naturalist",
      kind: "essay",
      about: "the author’s view of the naturalist of the old school",
      text:
        "The naturalist of the old school walked the hedgerows with a net and a notebook, and what he knew of the moth or the thrush he knew by long and patient watching. His successor works in a laboratory and knows the creature’s organs better than its habits. Neither kind of knowledge, I think, is to be despised; but it is worth observing that the laboratory can tell us how the wing of a bird is made, and cannot tell us why the thrush sings at dusk from one particular bough and from no other.",
      anchors: ["by long and patient watching", "cannot tell us why the thrush sings"],
      key: "His patient watching yielded knowledge of creatures’ habits that a laboratory cannot supply.",
      wrong: [
        ["His knowledge was of greater value than the laboratory worker’s, being drawn from living creatures.",
         "The author says neither kind of knowledge is to be despised; he ranks neither above the other."],
        ["His knowledge, being gained only by watching, was less exact than that of the laboratory worker.",
         "The author ranks neither kind of knowledge above the other, and exactness is never discussed; the laboratory simply answers different questions."],
        ["His methods could answer questions about birdsong that no one has since thought worth asking.",
         "The author says the laboratory cannot answer such questions, not that no one asks them any longer."],
      ],
      explanation:
        "The author credits the old naturalist with knowledge gained by “long and patient watching” and later notes that the laboratory cannot explain why the thrush sings from one bough at dusk, a question of habit. Joined, the two show that the old method supplies knowledge of habits that the laboratory cannot.",
      trap: "Turning the author’s balanced judgment into a ranking of one kind of knowledge above the other.",
    },
    {
      scene: "ii-inf-period-house-restoration",
      kind: "essay",
      about: "the author’s view of restorations like the one described",
      text:
        "When an old house is restored, its owner generally means to return it to what it was, and he begins by stripping away whatever seems to him out of keeping: the sash window let into a Tudor wall, the porch added by some Victorian tenant, the stair rebuilt after a fire. Yet these intrusions are themselves the history of the house. The owner who removes them does not recover the house as it was; he makes a house that existed at no single moment, and that the builders of no age ever saw.",
      anchors: ["means to return it to what it was", "existed at no single moment"],
      key: "They can erase the record of a house’s past and yield a building no earlier age knew.",
      wrong: [
        ["They succeed in returning an old house to the state in which its first builders left it.",
         "This is the owner’s aim; the author argues that the result is a house that existed at no single moment."],
        ["They are justified when the additions removed are recent, like a Victorian tenant’s porch.",
         "The author makes no exception for recent additions; the Victorian porch is one of the intrusions he calls the history of the house."],
        ["They keep a house’s history intact so long as its oldest parts are left untouched.",
         "The author calls the later additions themselves the history of the house; keeping the oldest parts while stripping the rest still erases that history."],
      ],
      explanation:
        "The owner means to return the house to what it was, but the author calls the removed additions the house’s own history and says the result existed at no single moment. The restoration therefore erases the record of the house’s changes and creates a building that no period actually saw.",
      trap: "Taking the restorer’s intention for the result the author describes.",
    },
    {
      scene: "ii-inf-period-modest-neighbor",
      kind: "essay",
      about: "the author’s neighbor",
      text:
        "There is a kind of modesty that is only vanity turned inside out. The man who protests at every compliment that he has done nothing worth remarking, and who will not be easy until the company has contradicted him three times, is not indifferent to praise; he has merely found a way of receiving it thrice over. True modesty is less conspicuous: it accepts a compliment briefly, forgets it, and turns the talk to other things. A neighbor of mine, praised for the address he gave at the harvest supper, spent a quarter of an hour assuring the company that it had been a poor thing, badly delivered.",
      anchors: ["receiving it thrice over", "spent a quarter of an hour assuring the company"],
      key: "His protests were really a way of drawing more praise from the company.",
      wrong: [
        ["He showed the true modesty that accepts a compliment briefly and then forgets it.", "A quarter of an hour of protest is the opposite of accepting a compliment briefly; this applies the author’s account of true modesty to the wrong man."],
        ["His address at the harvest supper was in fact poorly written and badly delivered.", "The passage reports the neighbor’s own verdict on his address; nothing suggests that the author shares it."],
        ["He was indifferent to praise, as his refusal to accept the compliment showed.", "The author argues that such protests show the reverse: the protester is not indifferent to praise."],
      ],
      explanation:
        "The author argues that protesting a compliment until one is contradicted is a way of receiving praise several times over, and contrasts it with true modesty, which accepts praise briefly. The neighbor protested for a quarter of an hour, so by the author’s reasoning he was angling for more praise.",
      trap: "Taking the neighbor’s self-criticism as modesty, when the author has just described such protests as vanity.",
    },
    {
      scene: "ii-inf-period-advice-thanks",
      kind: "essay",
      about: "the advice for which the author has been thanked",
      text:
        "Of all gifts, advice is the one most freely given and least gratefully received, and the reason is not far to seek. We ask for advice, as a rule, only when we have already made up our minds, and what we want is not counsel but company in our decision. The friend who tells us to do what we had resolved upon is thought wise; the friend who tells us otherwise is thought not to understand the case. I have been thanked, in my time, for a great deal of advice, and I cannot recall that any of it altered anyone’s conduct in the smallest degree.",
      anchors: ["already made up our minds", "altered anyone’s conduct in the smallest degree"],
      key: "It most likely endorsed decisions that the people asking had already made for themselves.",
      wrong: [
        ["It was probably wiser than the advice other friends had given the same people.", "The author says advice is thought wise when it agrees with a decision already made; being thanked shows agreement, not superior wisdom."],
        ["It was given only to friends who had not yet made up their minds about what to do.", "The author says people ask for advice, as a rule, only after they have made up their minds, and nothing suggests his case was different."],
        ["It changed the conduct of those who asked for it, which is why they thanked him for it.", "The author says he cannot recall that any of it altered anyone’s conduct in the smallest degree."],
      ],
      explanation:
        "The author says we ask for advice after deciding and think wise the friend who agrees with us; he then adds that the advice he was thanked for never changed anyone’s conduct. Put together, the advice that earned thanks most likely endorsed what people had already resolved to do.",
      trap: "Assuming that thanks reward good advice, when the author says they reward agreement.",
    },
    {
      scene: "ii-inf-period-teapot-collector",
      kind: "essay",
      about: "the collector after twenty years, as the author describes him",
      text:
        "The collector is commonly supposed to love the things he collects, and at the outset no doubt he does. But observe him after twenty years. He will pass by a perfectly beautiful teapot because he has one of that pattern already, and pay a great price for an ugly one because it is wanting from his series. The very teapot that first charmed him, were he to see its like today in a shop window, he might well not stop for.",
      anchors: ["because it is wanting from his series", "he might well not stop for"],
      key: "He values a teapot chiefly for the gap it fills in his series, not its beauty.",
      wrong: [
        ["He has come to prefer ugly teapots to beautiful ones as his taste has changed.",
         "He pays for the ugly teapot because it is missing from his series, not because it is ugly; nothing shows that his taste now favors ugliness."],
        ["He values each teapot for the memory of how he acquired it more than for its beauty.",
         "He does value something other than beauty, but the text names it: the gap a teapot fills in his series, not any memory of buying it."],
        ["He buys teapots chiefly as investments that he expects to rise in value.",
         "The text mentions the high price he pays, not any hope of profit; it explains his purchases by the gaps in his series."],
      ],
      explanation:
        "After twenty years the collector passes up a beautiful teapot whose pattern he already owns and pays heavily for an ugly one that is missing (“wanting”) from his series; he might not even stop for the kind of teapot that first charmed him. What he now values is completing the series, not the beauty of any one piece.",
      trap: "Misreading “wanting from his series” (missing from it), or treating his purchase of an ugly teapot as a change of taste.",
    },
  ];

  const periodProse = {
    ...RW,
    id: "inference-period-prose",
    skill: "Inferences",
    subskill: "logical inference",
    difficulty: "Medium",
    title: "Inference from older prose whose point is carried by irony or structure",
    recognize:
      "Read past the surface statement: a later detail qualifies or undercuts an earlier one, and the inference is what the two together imply, no more.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["misattributed-view", "too-broad", "opposite-stance"],
    build(t) {
      const topic = t.pick(PERIOD_PROSE_TOPICS);
      const content = `${PERIOD_HEADERS[topic.kind]}\n\n${topic.text}`;
      const wrong = topic.wrong;
      return mc("Medium", topic, {
        stimulus: passage(content),
        stem: `Based on the text, what can most reasonably be inferred about ${topic.about}?`,
        correct: topic.key,
        wrong,
        explanation: topic.explanation,
        steps: [
          "Paraphrase each long sentence in plain modern words before judging the choices.",
          "Find the later detail that qualifies, contradicts, or explains the earlier statement.",
          "Choose the inference that both parts support, and reject choices that rest on only one part or go beyond both.",
        ],
        principles: [
          "In older prose the point is often made by irony: the narrator reports a claim and then supplies facts that undercut it.",
          "A view the author reports is not necessarily the author’s view; check whether the passage endorses or questions it.",
        ],
        trap: topic.trap,
        hint: "Which detail later in the passage changes how an earlier statement should be read?",
        verify: () => inOrder(content, topic.anchors) && wrong.length === 3 && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Inferences: a completion whose conclusion holds only within a       */
  /* condition or scope set by an earlier statement                      */
  /* ------------------------------------------------------------------ */

  // Dense expository passages in invented settings (invented places,
  // institutions, and researchers; no real study is described). The last
  // sentence asks for a conclusion, and the key is the one that respects a
  // limit stated earlier: a necessary-but-not-sufficient condition, a
  // measure that counts only part of a group, a base rate, a detection
  // limit, or a lower bound that is not an upper bound. Distractors are the
  // characteristic errors: dropping the limit (overstated), applying the
  // result to the wrong group (scope shift), treating a necessary condition
  // as sufficient (reversed condition), or reasoning from the final
  // statement alone.
  const QUALIFIED_CONCLUSION_TOPICS = [
    {
      "scene": "ii-inf-qualified-veyra-training",
      "text": "A workshop in Veyra reported that its trainees' average score on a practical assessment rose between September and December. All trainees took both assessments, but the published December average included only those who completed the course. Researchers found that the completers had already scored higher than the other trainees in September, and that their own average score was unchanged in December. The workshop's director attributes the published rise to effective instruction. Taken together, the researchers' findings suggest that the published rise ______.",
      "anchors": [
        "included only those who completed the course",
        "their own average score was unchanged"
      ],
      "key": "can be explained by the change in which trainees were counted, without requiring an improvement in the completers' performance",
      "wrong": [
        [
          "demonstrates improvement among the trainees who left, since the performance of those who completed the course was unchanged",
          "The published December average excludes those who left; no improvement in their scores is needed to explain the change in that average."
        ],
        [
          "measures the instruction's benefit for completers accurately, although it cannot establish whether trainees who left received the same benefit",
          "The completers' own average did not rise, so the published change cannot be their measured gain from instruction."
        ],
        [
          "probably understates the instruction's benefit, because the trainees with the lowest initial scores were excluded from the December calculation",
          "Excluding the initially lower-scoring group raises the reported average without showing learning; their later performance is unspecified, so an understated benefit is unsupported."
        ]
      ],
      "explanation": "September's published average includes a lower-scoring group omitted from December. The included group's own average stayed the same. A shift in composition therefore explains the higher published average without demonstrating improvement caused by instruction.",
      "trap": "Treating a difference between differently selected groups as a gain achieved by the same trainees."
    },
    {
      "scene": "ii-inf-qualified-deln-pathogen",
      "text": "Deln's laboratories formerly tested water only when residents reported an unusual taste. They later began testing randomly selected taps, including taps with no reported problem, and the number of detected contamination incidents rose. An audit found that detections at taps with reported taste problems remained stable, while all the additional detections came from the newly tested group. Officials argue that contamination itself must therefore have increased among taps without taste problems. The audit supports the narrower conclusion that ______.",
      "anchors": [
        "including taps with no reported problem",
        "all the additional detections came from the newly tested group"
      ],
      "key": "expanded testing accounts for where the added detections occurred, but the earlier contamination rate in that newly tested group remains unknown",
      "wrong": [
        [
          "expanded testing reveals an increase confined to taps without taste problems, because detections at taps with reported problems did not increase",
          "The earlier program did not measure the newly tested group, so its current detections cannot establish a change from its earlier contamination rate."
        ],
        [
          "stable detections at taps with reported problems establish stable contamination throughout Deln, making the new detections solely an effect of expanded testing",
          "Stability in one monitored group does not establish stability in the previously unmonitored group or throughout Deln."
        ],
        [
          "the new detections indicate that taste problems have become a less reliable warning, because contamination is now being found in additional taps",
          "The new program can discover a preexisting limitation of taste complaints; the audit does not establish that the relationship between taste and contamination changed."
        ]
      ],
      "explanation": "The added detections were possible because a previously untested group entered surveillance. That establishes a change in what the program observed, not whether the group's underlying contamination increased, decreased, or stayed constant.",
      "trap": "Turning a newly observed group into evidence of a historical change that was never measured."
    },
    {
      "scene": "ii-inf-qualified-calven-tools",
      "text": "Calven's surviving estate inventories suggest that iron tools were more common than wooden tools in prosperous households. Excavators found the same predominance of iron among objects recovered from a settlement, and a historian takes the agreement as evidence that prosperous and poorer households owned similar tool collections. Yet the inventories omit poorer households, while experimental burial at the site shows that wooden tools decay much faster than iron ones. Thus, agreement between the two records ______.",
      "anchors": [
        "in prosperous households",
        "wooden tools decay much faster than iron ones"
      ],
      "key": "does not establish similar ownership across wealth levels, since the records omit households and objects in different ways",
      "wrong": [
        [
          "indicates that poorer households preferred iron, although their purchases appear only indirectly in estate inventories",
          "The inventories omit poorer households rather than indirectly documenting their purchases, and selective decay can make excavation finds unrepresentative."
        ],
        [
          "supports equal ownership across wealth levels, because decay affects excavated objects whereas wealth affects only inclusion in the estate inventories",
          "Different sources of selectivity do not cancel each other; neither record supplies an unbiased comparison of ownership by wealth."
        ],
        [
          "shows that inventories exaggerate iron ownership among prosperous households, because excavated wooden tools survive less often than excavated iron tools",
          "Decay affects excavated objects, not the inventories' description of prosperous households; this transfers one record's limitation to the other."
        ]
      ],
      "explanation": "The inventories describe only prosperous households, and excavation overrepresents durable materials. A shared predominance of iron can therefore arise in records with different omissions; it does not supply the missing comparison between richer and poorer households.",
      "trap": "Assuming agreement between two selective records removes each record's distinct limitation."
    },
    {
      "scene": "ii-inf-qualified-orven-release",
      "text": "An experimental capsule opens when its outer film dissolves and its internal latch releases. Either part can keep a capsule closed. In separate tests, a liquid dissolved the film but left the latch engaged, while mild heating released the latch but left the film intact. When both treatments were applied, capsules opened. An engineer concludes that adding more of either treatment alone would produce the same result. The reported tests instead establish that ______.",
      "anchors": [
        "Either part can keep a capsule closed",
        "When both treatments were applied, capsules opened"
      ],
      "key": "the tested treatments removed different barriers to opening, without showing that intensifying either one could remove the other barrier",
      "wrong": [
        [
          "the liquid alone opened the capsules, with heating needed only to demonstrate release of the internal latch",
          "Liquid alone left the latch engaged, and either part can keep a capsule closed; heating was part of successful opening, not merely a measurement."
        ],
        [
          "heating made the liquid dissolve the film, since film dissolution and latch release occurred together only when both treatments were applied",
          "The liquid dissolved the film even in its separate test. The combined outcome does not establish that heating enabled this effect."
        ],
        [
          "neither treatment had an effect on its own, but their interaction created a new process that opened the capsules under combined treatment",
          "Each treatment had its own observed effect, removing a different barrier. Opening together does not erase those separate effects or establish a new process."
        ]
      ],
      "explanation": "Opening requires removal of two barriers. The liquid and heat each removed one under the tested conditions, and the combination removed both. No test shows that a larger amount of one treatment can substitute for the other's effect.",
      "trap": "Treating two complementary effects as evidence that a stronger dose of one can replace the other."
    },
    {
      "scene": "ii-inf-qualified-rendel-dates",
      "text": "A Rendel warehouse stamped each crate with the harvest year of its contents, not the year of shipment. Grain from several harvests was often stored together, and shipping books listed crates under the year they left the warehouse. A sealed shipment recorded in the book for 1718 contains crates stamped 1715 and 1717. A historian dates every journey described in a letter found inside the shipment to 1717, reasoning that the latest stamp dates the letter. The evidence establishes only that the letter ______.",
      "anchors": [
        "the harvest year of its contents, not the year of shipment",
        "recorded in the book for 1718"
      ],
      "key": "was enclosed by the shipment's departure in 1718, while the crates' harvest dates do not date the journeys it describes",
      "wrong": [
        [
          "was written during the 1717 harvest, while the older crates show that its author described journeys undertaken at least two years earlier",
          "Harvest stamps date grain, not letter composition or travel. The older crate supplies no date for the author's journeys."
        ],
        [
          "describes journeys undertaken between 1715 and 1717, while the shipping record shows that the author sent the letter the following year",
          "The crate dates give no travel interval, and enclosure does not establish that the author personally sent the shipment."
        ],
        [
          "was written no earlier than 1717, since the latest harvest stamp supplies the earliest possible date for every object enclosed in the shipment",
          "The harvest stamp dates grain rather than every object shipped beside it. An older letter could have been enclosed with the more recent harvest."
        ]
      ],
      "explanation": "The stamped years identify harvests, whereas the shipping book dates departure. A letter inside the sealed shipment was enclosed by that departure, but neither harvest year dates the letter's described journeys. Dating a container's contents is not necessarily dating every event mentioned by another object inside it.",
      "trap": "Transferring a date from an object's contents to the events described in a different object found beside it."
    },
    {
      "scene": "ii-inf-qualified-sarn-translation",
      "text": "A scholar argues that poet Edrin first encountered the Sarn epic through a translation published in 1880. Edrin's early notebooks paraphrase an episode that translation omits, while his 1886 poem reproduces an unusual mistranslation found only in that edition. A newly discovered library list shows that Edrin could read a different translation containing the omitted episode before 1880. These findings suggest that ______.",
      "anchors": [
        "an episode that translation omits",
        "an unusual mistranslation found only in that edition"
      ],
      "key": "the 1880 edition could explain the later poem's distinctive wording without having been Edrin's first route to the epic",
      "wrong": [
        [
          "the early translation explains the notebook episode and the poem's mistranslation, making the 1880 edition unnecessary",
          "The mistranslation occurs only in the 1880 edition; access to an earlier translation does not explain that distinctive later feature."
        ],
        [
          "the notebooks establish Edrin's knowledge of the epic's original language, although the 1880 translation also influenced his later poem",
          "A different translation containing the episode was available; knowledge of an omitted episode does not require reading the original language."
        ],
        [
          "the later poem establishes that the 1880 edition introduced Edrin to the epic, while the notebooks reflect discoveries made afterward",
          "Evidence of influence on a later poem does not establish first exposure, especially when early notebooks contain material available through another translation."
        ]
      ],
      "explanation": "The distinctive mistranslation supports influence from the 1880 edition on the 1886 poem. But the notebook episode, omitted from that edition and available in an earlier translation, supports an independent route of access. A source used later need not be the source used first.",
      "trap": "Treating a distinctive sign of later influence as proof of first exposure."
    },
    {
      "scene": "ii-inf-qualified-haven-responses",
      "text": "Haven's transit office surveyed passengers who rode buses after a fare reduction. Most respondents said they would have made the same trip by bus at the old fare. The office concludes that the reduction attracted few new riders. A researcher notes that the survey counted trips rather than individual passengers: a commuter could respond on many days, whereas an occasional passenger could respond only on a day they traveled. Consequently, the reported majority ______.",
      "anchors": [
        "made the same trip by bus at the old fare",
        "a commuter could respond on many days"
      ],
      "key": "describes the sampled trips more directly than the mix of individual riders, leaving the share of newly attracted people unresolved",
      "wrong": [
        [
          "describes individual riders accurately because every respondent was a passenger, although it leaves the number of trips made by new riders unresolved",
          "The unit can be a passenger's repeated trip; treating each response as a distinct person reverses which quantity the survey most directly represents."
        ],
        [
          "shows that occasional passengers were unaffected by the fare reduction, since the majority would have used buses even at the old fare",
          "The aggregate majority may disproportionately reflect frequent riders; it does not isolate the counterfactual choices of occasional passengers."
        ],
        [
          "shows that the reduction attracted few additional bus trips, and therefore that it attracted few additional individual passengers to the service",
          "Even if relatively few trips were newly induced, those trips could belong to many occasional new passengers; trip share does not determine person share."
        ]
      ],
      "explanation": "Frequent riders have more opportunities to contribute a response. A majority of trip-level responses therefore need not correspond to a majority of distinct passengers. The survey does not resolve how many people, rather than trips, the lower fare attracted.",
      "trap": "Changing the unit from repeated trips to distinct people while retaining the same proportion."
    },
    {
      "scene": "ii-inf-qualified-veren-streams",
      "text": "In tests on Veren stream water, a filter removed sediment and bacteria without changing dissolved nutrients. A supplement added nitrogen and phosphorus without changing sediment or bacteria. Either treatment alone left algae growth unchanged; together they increased it. Researchers attributed the increase to removal of bacteria that competed for phosphorus. Follow-up tanks kept the bacteria but allowed sediment to settle. Adding nitrogen alone then increased growth; adding phosphorus alone did not. Other conditions were held constant, and some phosphorus remained in every tank. Taken together, the results indicate that ______.",
      "anchors": [
        "a filter removed sediment and bacteria",
        "Follow-up tanks kept the bacteria",
        "some phosphorus remained in every tank"
      ],
      "key": "growth can increase without removing bacteria or adding phosphorus, but these tests do not establish that phosphorus is unnecessary for growth",
      "wrong": [
        [
          "removing bacteria permits algae to use phosphorus, since the original combined treatment increased growth while adding phosphorus by itself did not",
          "The follow-up increase occurs with bacteria still present and no added phosphorus. The original combined treatment alone cannot isolate bacterial removal from sediment removal."
        ],
        [
          "nitrogen explains every growth difference, since it increased growth in the follow-up and was also present in the original combined treatment",
          "The original supplement included nitrogen but did not increase growth alone. The follow-up also changed sediment conditions, so nitrogen by itself is not shown to explain every difference."
        ],
        [
          "phosphorus is unnecessary for growth, since adding nitrogen alone increased growth after sediment settled and adding phosphorus alone did not",
          "All tanks retained some phosphorus. No added phosphorus being needed in this comparison does not establish that algae need none at all."
        ]
      ],
      "explanation": "The follow-up produces increased growth with bacteria present and no added phosphorus, so neither bacterial removal nor phosphorus addition is necessary for that increase. However, every tank contains some phosphorus; the experiment cannot establish that the nutrient itself is dispensable. The nitrogen supplement also failed in the original sediment-filled water, so its effect must be interpreted within the tested conditions.",
      "trap": "Conflating the absence of an added nutrient with the absence of that nutrient, or assigning a bundled treatment result to one unisolated change."
    },
    {
      "scene": "ii-inf-qualified-delmar-repairs",
      "text": "Delmar's railway tried a new inspection on its oldest locomotives and the old inspection on newer ones. The new procedure reported more total faults, mostly cracks. Earlier repair records show that older engines had more cracks but similar numbers of leaks. Engineers then used both procedures on the same age-balanced sample, checking each finding by dismantling the engines. The new procedure detected more of the verified cracks; the old one detected more of the verified leaks. No totals comparing all verified faults were reported. The manager nevertheless cites the original total as evidence that the new procedure should replace the old one entirely. Together, the comparisons ______.",
      "anchors": [
        "older engines had more cracks",
        "the old one detected more of the verified leaks",
        "No totals comparing all verified faults were reported"
      ],
      "key": "support different strengths by fault type, while neither the original survey nor the reported matched results establish overall superiority",
      "wrong": [
        [
          "support replacing the old procedure, since the new one found more cracks in both comparisons and also found more total faults in the original survey",
          "The original total is confounded with engine condition. The matched comparison favors different methods for different faults and supplies no all-fault total."
        ],
        [
          "show that engine age caused the entire original difference, since the methods' opposing advantages in the matched test cancel each other",
          "Advantages for different fault types do not necessarily cancel: their sizes and the proportions of fault types are unreported. Age is not established as the sole cause."
        ],
        [
          "show that the new procedure is more accurate for cracks and less accurate for leaks, so the total number of faults it detects must equal the old one's",
          "Different relative strengths do not establish equal totals. That would require the numbers of each fault type detected by each method, not just their rankings."
        ]
      ],
      "explanation": "The original total mixes inspection method with a preexisting difference in engine condition. The matched, independently verified comparison removes that imbalance and shows an advantage for cracks under the new method but an advantage for leaks under the old one. Those opposing strengths do not identify the larger overall total or prove that the original difference was entirely due to engine age.",
      "trap": "Using an uncontrolled overall total to override a controlled comparison's mixed results, or assuming opposing advantages cancel numerically."
    },
    {
      "scene": "ii-inf-qualified-eskar-seals",
      "text": "Eskar's archive used red seals for documents requiring repayment and blue seals for gifts. A later curator replaced damaged red seals with plain wax but did not replace damaged blue seals. Among documents whose wording is now illegible, intact colored seals are mostly blue; many other documents have plain wax. A cataloguer infers that gifts predominated among the original documents. The curator's practice means that ______.",
      "anchors": [
        "replaced damaged red seals with plain wax",
        "intact colored seals are mostly blue"
      ],
      "key": "the balance among surviving colored seals need not match the original balance of document types, even if every visible color is identified correctly",
      "wrong": [
        [
          "the balance among surviving colored seals understates the original prevalence of gifts, because damaged blue seals were not replaced with another colored seal",
          "Both damaged blue seals and replaced red seals leave the colored-seal count; without their original numbers and damage rates, the direction and size of bias are not established."
        ],
        [
          "plain wax identifies former repayment documents and therefore suffices to reconstruct the original gift-to-repayment ratio",
          "Even if plain replacements restore the count of repayment documents, damaged blue seals were not replaced. Their missing count prevents reconstructing the original ratio."
        ],
        [
          "the visible blue majority establishes that gifts originally predominated, although plain wax obscures which remaining documents required repayment",
          "A visible-color majority excludes red documents moved into the plain-wax category and blue documents whose seals were lost; it does not establish the original proportion."
        ]
      ],
      "explanation": "Document type affected how damaged seals were treated, and the colored-seal count excludes documents no longer carrying color. Correctly identifying remaining colors therefore does not reconstruct the original mix. The record does not provide enough information to calculate the direction or amount of the resulting imbalance.",
      "trap": "Confusing accurate classification of surviving evidence with representative survival of the original evidence."
    },
    {
      "scene": "ii-inf-qualified-norven-ferry",
      "text": "Norven's ferry grants priority boarding to residents holding annual passes; visitors may buy single-trip tickets, but residents may buy them too. An observer counted many single-trip tickets on a morning when few annual-pass holders boarded and concluded that visitors made up most passengers. Ticket records show, however, that annual passes cover only the western dock, which was closed that morning; departures used the eastern dock, where everyone needed a single-trip ticket. Thus the morning's ticket pattern ______.",
      "anchors": [
        "residents may buy them too",
        "where everyone needed a single-trip ticket"
      ],
      "key": "cannot establish the passenger mix, because residents and visitors were required to use the same ticket type at the operating dock",
      "wrong": [
        [
          "establishes that visitors predominated, since annual-pass holders retained priority despite using a dock outside their passes’ coverage",
          "Passes did not cover the operating dock and everyone needed a single-trip ticket; the passage gives no usable type-based distinction between resident and visitor."
        ],
        [
          "establishes that residents predominated, because the dock closure required annual-pass holders to purchase the single-trip tickets counted by the observer",
          "Residents' possible presence explains why single-trip tickets need not mean visitors, but it does not establish how many residents actually traveled."
        ],
        [
          "identifies passengers without annual passes but cannot distinguish resident ticket buyers from visitors, because both groups could buy single-trip tickets",
          "At the eastern dock even annual-pass holders needed single-trip tickets, so that ticket type does not identify passengers lacking passes either."
        ]
      ],
      "explanation": "Even normally, a single-trip ticket is not exclusive to visitors. The closure removes the remaining pass-based distinction because everyone at the eastern dock needs that ticket type. The observed pattern therefore identifies neither residence nor pass ownership and cannot establish a passenger majority.",
      "trap": "Using a normally imperfect category marker after the context has removed its distinguishing power altogether."
    }
  ];

  const qualifiedConclusion = {
    ...RW,
    id: "inference-completion-qualified-conclusion",
    skill: "Inferences",
    subskill: "text completion",
    difficulty: "Hard",
    title: "Completion whose conclusion holds only within a condition stated earlier",
    recognize:
      "Before choosing, find the earlier statement that limits the conclusion: what the measure counts, what is necessary but not sufficient, what a date or a silence can and cannot show.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["too-broad", "reversed-condition", "must-vs-could"],
    build(t) {
      const topic = t.pick(QUALIFIED_CONCLUSION_TOPICS);
      const wrong = topic.wrong;
      return mc("Hard", topic, {
        stimulus: passage(topic.text),
        stem: "Which choice most logically completes the text?",
        correct: topic.key,
        wrong,
        explanation: topic.explanation,
        steps: [
          "Find the earlier statement that limits what the evidence can show: a condition, a scope, a base, or a detection limit.",
          "Apply that limit to the evidence reported later in the text.",
          "Choose the completion that stays inside the limit; reject choices that drop it, move it to another group, or reverse it.",
        ],
        principles: [
          "A necessary condition is not a sufficient one, and a count of part of a group is not a count of the whole.",
          "The strongest-sounding conclusion is often the one that ignores a limit the text has already set.",
        ],
        trap: topic.trap,
        hint: "Which earlier statement limits how far the final sentence can go?",
        verify: () =>
          inOrder(topic.text, topic.anchors) && endsInBlank(topic.text) && wrong.length === 3 && allDistinct(topic.key, wrong),
      });
    },
  };

  // Original experiments require tracing an altered sequence through interacting conditions.
  const COUNTERFACTUAL_TOPICS = [
    {
      "scene": "ii-inf-counterfactual-valen-membrane",
      "text": "Researchers testing a Valen membrane found that it admitted a colorless dye while warm but trapped dye already inside when cooled. Rinsing a cooled membrane removed dye from its surface without removing the trapped dye. A separate experiment showed that illumination turned the dye blue at either temperature; darkness left it colorless. In the usual procedure, researchers warmed a membrane in dye under illumination and then cooled and rinsed it, leaving a blue interior. They now propose keeping the membrane dark during warming, cooling, and rinsing, and illuminating it only afterward. The amount of dye and the duration of each stage would remain unchanged.",
      "anchors": [
        "trapped dye already inside when cooled",
        "illuminating it only afterward"
      ],
      "stem": "Which result would the findings most strongly lead the researchers to predict for the revised procedure?",
      "key": "The interior would turn blue under later illumination, despite dye having been rinsed from the cool membrane's surrounding surface.",
      "wrong": [
        [
          "The interior would remain colorless, because cooling before illumination would prevent the trapped dye from reacting.",
          "Cooling blocks movement across the membrane, not the dye's light response, which occurs at either temperature."
        ],
        [
          "The interior would remain colorless, because the rinse would remove dye that had entered without first turning blue.",
          "The rinse removes surface dye but not trapped interior dye; the passage does not make retention depend on color."
        ],
        [
          "The surface would turn blue after the rinse, because the membrane would expel its dye when illuminated while cool.",
          "Illumination changes color, not permeability. Cooling traps interior dye, and the rinse has removed surface dye."
        ]
      ],
      "explanation": "Dye can enter during the warm stage without illumination. Cooling then retains it through the rinse. Because the chemical color change responds to light at either temperature, the later illumination still turns the interior blue.",
      "trap": "Applying the temperature condition for entering the membrane to the separate reaction of dye already inside it."
    },
    {
      "scene": "ii-inf-counterfactual-leska-learning",
      "text": "In experiments with Leska larvae, scientists paired a particular scent with food. Larvae trained while warm later approached that scent without food. Cool conditions prevented larvae from forming this association, but did not erase an association acquired earlier. Another test showed that larvae could detect the scent while cool, although their movement toward any detected scent was temporarily suppressed. Researchers will compare larvae trained while warm and then cooled with larvae given the same training only while cool. Both groups will subsequently be returned to warmth and tested with the scent but no food, before either receives further training. Their exposure to the scent and food will otherwise be identical.",
      "anchors": [
        "did not erase an association acquired earlier",
        "before either receives further training"
      ],
      "stem": "Which difference between the groups would the findings most strongly predict during the final test?",
      "key": "The first group would approach the scent more readily, since warming restores movement but does not supply the second group's missing association.",
      "wrong": [
        [
          "Both groups would approach the scent similarly, since returning to warmth would restore both movement and learning from the earlier training.",
          "Warmth restores the ability to express an existing association; it cannot retroactively form the association that cool training did not establish."
        ],
        [
          "The second group would approach more readily, since detecting the scent while movement was suppressed would strengthen the food association.",
          "Detection during cool training does not establish the association; the passage explicitly separates sensing from learning and movement."
        ],
        [
          "Neither group would approach the scent, since cooling after food exposure would remove the association even once ordinary movement returned.",
          "Cooling did not erase prior learning in the warm-trained group; its movement can resume without new training."
        ]
      ],
      "explanation": "The first group acquires an association before cooling and retains it while movement is suppressed. The second can sense the training cue but does not learn its relation to food. Rewarming removes the movement restriction in both groups while preserving this difference in acquired learning.",
      "trap": "Treating recovery of the ability to respond as recovery of learning that never occurred."
    },
    {
      "scene": "ii-inf-counterfactual-marel-leaves",
      "text": "In a study of Marel shrubs, drying roots released a signal that caused leaf pores to narrow. Watering stopped further release of the signal, but pores that had already narrowed remained narrow until the leaves cooled at night. The roots' signal required several hours to reach the leaves, allowing researchers to intercept it with a removable filter. In a planned trial, the filter will be installed only after the pores have narrowed. Researchers will then water the roots while keeping the leaves at their daytime temperature overnight. A comparison group will receive the same treatment but experience the usual nighttime cooling. Both groups will begin the trial with equally narrow pores.",
      "anchors": [
        "remained narrow until the leaves cooled at night",
        "keeping the leaves at their daytime temperature overnight"
      ],
      "stem": "Which result would best match the findings during the following morning?",
      "key": "Pores would remain narrower in the warmed group, despite both groups receiving water and having further signals blocked.",
      "wrong": [
        [
          "Both groups' pores would reopen, because watering would remove the original cause before nighttime conditions mattered.",
          "Watering stops new signals but does not reverse narrowing that has already occurred; nighttime cooling still differs between the groups."
        ],
        [
          "Pores would remain narrow in both groups, because filtering the signal would also prevent cooled leaves from reversing the earlier response.",
          "The signal induces narrowing; cooling reverses it without requiring that signal. Blocking new signal delivery does not block cooling's effect."
        ],
        [
          "Pores would reopen earlier in the warmed group, because keeping the leaves warm would compensate for the interrupted signal from the roots.",
          "Warmth does not replace the reversal supplied by cooling. The groups' pores have already narrowed before the filter is installed."
        ]
      ],
      "explanation": "The root signal initiates narrowing, while cooling reverses established narrowing. Interception and watering occur after initiation and are shared by both groups. Only the comparison group receives the reversing condition, so the warmed group retains narrower pores.",
      "trap": "Assuming removal of an initiating cause immediately reverses a response that requires a separate resetting condition."
    },
    {
      "scene": "ii-inf-counterfactual-teren-filter",
      "text": "A Teren recorder learns separate sound components that recur steadily during calibration and suppresses them afterward. Irregular sounds are not learned, and recording does not update the filter. A fresh calibration replaces the stored list, even if conducted in silence. Researchers initially calibrate two devices beside a fan while playing bird calls consisting of regularly repeated whistles and irregular clicks. Before the final recording, they recalibrate only the first device in silence. The fan is then switched off, and both devices record the same whistle-and-click calls without further calibration. The researchers have verified that removing a learned component does not remove other components occurring alongside it.",
      "anchors": [
        "Irregular sounds are not learned",
        "recalibrate only the first device in silence",
        "removing a learned component does not remove other components"
      ],
      "stem": "Which difference between the final recordings would follow most reasonably from these findings?",
      "key": "The first would preserve both whistles and clicks; the second would suppress whistles while preserving the irregular clicks.",
      "wrong": [
        [
          "The first would suppress whistles while preserving clicks; the second would preserve both components because the fan had stopped.",
          "Quiet recalibration clears the first filter; stopping the fan does not clear the second. This reverses which recorder retains the learned whistle filter."
        ],
        [
          "Both would suppress whistles but preserve clicks, since calibration in silence would leave the first filter intact.",
          "Recalibration replaces the stored list even in silence; it does not retain old sounds just because no new sound is learned."
        ],
        [
          "The first would preserve both components; the second would suppress both because the whistles and clicks had occurred together during calibration.",
          "The recorder learns only regularly recurring components and does not remove accompanying components automatically. Irregular clicks are not learned with the whistles."
        ]
      ],
      "explanation": "Initial calibration teaches both recorders the fan and regular whistle, but not the irregular clicks. Quiet recalibration clears only the first recorder’s learned list. Switching off the fan clears neither stored rule, and suppressing whistles does not suppress clicks, so the final recordings differ only in their retention of the whistles.",
      "trap": "Treating a recording as an indivisible sound, or confusing silence during recalibration with silence after calibration."
    },
    {
      "scene": "ii-inf-counterfactual-elsin-enzyme",
      "text": "In an Elsin fermentation study, microorganisms produced an enzyme only while oxygen was available. Once released into the liquid, the enzyme remained active without either oxygen or living microorganisms. Acid temporarily prevented this enzyme from breaking down a starch, but neutralizing the liquid restored that activity. Researchers first allowed microorganisms to grow with oxygen, then acidified the liquid and filtered out all microorganisms; the dissolved enzyme passed through the filter. They plan to add starch after filtration, seal the container against oxygen, and then neutralize the liquid. A colleague predicts that starch breakdown cannot begin unless the researchers add living microorganisms again or reopen the container to air.",
      "anchors": [
        "remained active without either oxygen or living microorganisms",
        "then neutralize the liquid"
      ],
      "stem": "Which prediction is best supported by the study's findings?",
      "key": "Starch breakdown would begin after neutralization, because enzyme made during the oxygenated stage remains in the filtered liquid.",
      "wrong": [
        [
          "Starch breakdown would await new microorganisms, because filtering out the original cells would also remove their earlier contribution.",
          "The enzyme has already been released, passes through the filter, and remains active without living microorganisms."
        ],
        [
          "Starch breakdown would await oxygen, because the enzyme's earlier production in air shows that its later action also requires air.",
          "Oxygen is needed for enzyme production, not for the activity of enzyme already present in the liquid."
        ],
        [
          "Starch breakdown would begin before neutralization, because removing living microorganisms would remove the source of the acid's inhibition.",
          "Acid directly suppresses the enzyme's activity; filtering out microorganisms does not neutralize that acid."
        ]
      ],
      "explanation": "The enzyme was produced before oxygen and microorganisms were removed, and it survives filtration in the liquid. Acid is the remaining reversible restriction on its action. Neutralizing the liquid therefore permits starch breakdown without restarting enzyme production.",
      "trap": "Carrying a requirement for producing an agent forward as though it were also required for that agent's later action."
    },
    {
      "scene": "ii-inf-counterfactual-nelra-route",
      "text": "A laboratory's model delivery vehicle stores a route after completing a trip at a station that transmits a confirmation signal. Temporary roadside arrows can redirect it during a trip, but without confirmation it retains its previously stored route for the next departure. Researchers established that confirmation at the destination records the route actually traveled, including any detours, rather than the route originally planned. Two vehicles that store the same original route will follow identical temporary arrows onto a detour. Both will reach the destination, but its confirmation transmitter will operate for only the second vehicle. The arrows will then be removed before the vehicles make another departure from the same starting point.",
      "anchors": [
        "without confirmation it retains its previously stored route",
        "transmitter will operate for only the second vehicle"
      ],
      "stem": "Which prediction about the vehicles' next trips follows most reasonably from these findings?",
      "key": "On departure, only the second vehicle would follow the detour; the first would use the route stored before either saw the arrows.",
      "wrong": [
        [
          "Both would use the detour, because following the temporary arrows would replace their stored routes before confirmation at the destination.",
          "Following a route and storing it are separate: confirmation is required for the redirected trip to replace the first vehicle's old route."
        ],
        [
          "Both would use the original route, because removal of the arrows would erase the detour even from a confirmed trip's stored record.",
          "Removing arrows removes live directions, not a stored route. The second vehicle receives confirmation for the detour actually traveled."
        ],
        [
          "The first would use the detour and the second the original route, since confirmation would restore the route planned before departure.",
          "Confirmation stores the route actually traveled, including detours, rather than restoring the original plan; this also reverses the first vehicle's unchanged memory."
        ]
      ],
      "explanation": "Both vehicles travel the detour, but only the second receives the signal that stores that experience. The first retains its original route. Removing the arrows leaves each to follow its own stored route, so their next trips diverge despite identical previous travel.",
      "trap": "Treating experience as automatically stored, or treating confirmation as a return to an original plan rather than a record of what occurred."
    },
    {
      "scene": "ii-inf-counterfactual-soven-coating",
      "text": "A liquid coating absorbs colored particles. Ultraviolet exposure hardens exposed coating, fixing its particles. A cleaning solution removes particles only where the coating is still liquid, and does not prevent later hardening. Researchers coat two tiles and add particles uniformly. They cover half the first tile with a sheet that blocks ultraviolet light but lets cleaning solution pass. Both tiles receive enough ultraviolet exposure to harden any unshielded coating, then are cleaned. The sheet is removed, and both tiles receive a second exposure sufficient to harden all remaining liquid. No new particles are added, and each cleaning reaches every part of both tiles.",
      "anchors": [
        "lets cleaning solution pass",
        "then are cleaned",
        "a second exposure sufficient to harden all remaining liquid"
      ],
      "stem": "Which difference between the finished tiles would be most consistent with the findings?",
      "key": "Both would harden throughout; only the initially unshielded half of the first tile would retain color, while the second tile would remain uniformly colored.",
      "wrong": [
        [
          "Both would harden and remain uniformly colored, because the second exposure would fix the same particles in every part of both tiles.",
          "The cleaning removed particles from the first tile’s still-liquid shielded half. Later exposure cannot fix particles that are no longer there."
        ],
        [
          "The first would remain liquid and colorless under its former shield, while its other half and all of the second tile would harden with color retained.",
          "The shielded half loses its particles during cleaning, but the second exposure hardens that half after the shield is removed."
        ],
        [
          "Both would harden throughout; only the initially shielded half of the first tile would retain color, because its sheet protected particles during cleaning.",
          "The sheet blocks light but admits cleaning solution. It leaves its half unfixed during cleaning rather than protecting that half’s particles from removal."
        ]
      ],
      "explanation": "At cleaning, the first tile’s unshielded half and the entire second tile are already hard, so their particles are fixed. The shielded half remains liquid and loses its particles because the sheet admits cleaner. Removing the sheet and exposing again hardens that now-colorless half without restoring particles. Both tiles finish hard, but only the first has an uncolored half.",
      "trap": "Transferring a shield’s protection against one treatment to a different treatment it admits, or treating final hardening as restoration of removed particles."
    },
    {
      "scene": "ii-inf-counterfactual-alden-judgment",
      "text": "An Alden model distinguishes learning, which revises private judgment when evidence changes, from approval-seeking, which alters only public reports. Two groups initially rank proposal C first. The first reads an argument favoring A; the second hears an admired adviser favor A without reasons. Both publicly select A. The model attributes the first group's change to learning and the second's to approval-seeking. Later, only the first group receives evidence overturning the argument for A and establishing B as better than either alternative. The adviser then announces support for B, and both groups publicly select B. Researchers now plan a private ballot inaccessible to the adviser, with no further information or discussion.",
      "anchors": [
        "Two groups initially rank proposal C first",
        "only the first group receives evidence",
        "both groups publicly select B"
      ],
      "stem": "Under the model, which pattern should the researchers predict in the final private ballot?",
      "key": "The first group would favor B and the second would return toward C, despite their latest public agreement on B.",
      "wrong": [
        [
          "Both would favor B, since their public agreement shows that both groups revised their private judgments.",
          "The first group has new evidence favoring B. The second has no reason to revise its initial private preference for C; its public B report still seeks approval."
        ],
        [
          "The first group would favor A and the second C, since removing the adviser leaves the first group's learned judgment and the second's original judgment intact.",
          "This correctly tracks the second group's unchanged private preference but ignores the later evidence that revised the first group's learned judgment from A to B."
        ],
        [
          "The first group would favor B and the second A, since new evidence changes the first group's preference while privacy restores the second's earlier preference.",
          "The second group's earlier public A report was also attributed to approval-seeking. Its original private preference was C, not A."
        ]
      ],
      "explanation": "The first group's private preference moves from C to A through learning, then from A to B when new evidence overturns its earlier reason. The second group's public reports move from A to B with the adviser's preference, while its private C judgment remains unchanged. Removing the audience therefore reveals different private rankings despite two rounds of public agreement.",
      "trap": "Treating either an earlier or the latest public report as a private preference, or forgetting that later evidence can revise a genuinely learned judgment."
    },
    {
      "scene": "ii-inf-counterfactual-varel-transfer",
      "text": "In experiments with Varel plants, a chemical applied to a leaf induced production of a defensive protein there. The chemical itself could not cross a graft joining two plants, but a signal produced in response to it could cross and induce the same protein in an untreated leaf. Once induced, protein production continued for a day without further signal. Researchers plan to treat a leaf below a graft, wait until an untreated leaf above it begins producing the protein, and then remove the grafted connection. They will measure the upper leaf several hours later. A comparison group will have its connection removed just before the lower leaf is treated, with all other conditions unchanged.",
      "anchors": [
        "protein production continued for a day without further signal",
        "removed just before the lower leaf is treated"
      ],
      "stem": "Which result would the findings most strongly lead the researchers to predict?",
      "key": "The upper leaf in the first group would keep producing protein, whereas the comparison group's upper leaf would not be induced by the treatment.",
      "wrong": [
        [
          "Both upper leaves would produce protein, because the applied chemical would remain capable of crossing the gap after the graft was removed.",
          "The chemical cannot cross even an intact graft; the comparison group's severed connection prevents the inducing signal from reaching its upper leaf."
        ],
        [
          "Neither upper leaf would produce protein, because removal of the graft would stop an induced response as well as any new signal arriving.",
          "An induced response continues for a day without more signal; removing the connection does not immediately stop the first group's protein production."
        ],
        [
          "Only the comparison group's upper leaf would produce protein, because cutting before treatment would retain more of the inducing chemical above the graft.",
          "The chemical is applied below the graft after the comparison group's connection is severed; cutting does not place it or its signal in the upper leaf."
        ]
      ],
      "explanation": "The first upper leaf receives the mobile signal and begins a response that persists beyond removal of the connection. The comparison leaf loses the connection before any inducing signal is generated below it. Severing the same path therefore prevents initiation in one group without immediately stopping maintenance in the other.",
      "trap": "Applying a condition required for initiating a response to maintenance of a response that has already begun."
    },
    {
      "scene": "ii-inf-counterfactual-oren-larvae",
      "text": "In Oren's laboratory ponds, small larvae consumed algae in both light and darkness. Larger larvae ate the small larvae only in light and did not eat algae. Over short trials, algae consumption by each small larva was unchanged by the presence of larger larvae, except when a small larva was eaten. Researchers compared tanks beginning with equal numbers of small larvae and equal algae amounts; some tanks also contained larger larvae. With lights on, adding the larger larvae reduced total algae consumption. They now plan to repeat the short comparison in darkness, keeping temperature and initial populations unchanged and measuring algae consumed rather than new algae growth. The larger larvae will remain in the tanks throughout.",
      "anchors": [
        "ate the small larvae only in light",
        "repeat the short comparison in darkness"
      ],
      "stem": "Which outcome would the findings most strongly predict for the comparison in darkness?",
      "key": "Adding larger larvae would no longer reduce algae consumption, since small larvae would keep feeding without being eaten by them.",
      "wrong": [
        [
          "Adding larger larvae would reduce algae consumption further, since darkness would make the small larvae harder to distinguish from algae.",
          "The larger larvae do not eat algae and cease eating small larvae in darkness; the passage supplies no mistaken-prey mechanism."
        ],
        [
          "Adding larger larvae would still reduce algae consumption, since their continued presence would suppress the small larvae's feeding rate.",
          "The trials found no effect of mere presence on each small larva's feeding. The earlier reduction resulted from small larvae being eaten."
        ],
        [
          "Adding larger larvae would increase algae consumption, since larvae unable to catch their usual prey would switch to eating algae.",
          "The larger larvae do not eat algae; darkness removes their predation on small larvae without introducing this alternative food source."
        ]
      ],
      "explanation": "The larger larvae reduced consumption in light by removing algae-eating small larvae, not by changing each survivor's feeding rate. Darkness disables that predation but leaves the small larvae's feeding active. With the same initial small-larva counts, the addition of larger larvae therefore loses its reducing effect during the short trial.",
      "trap": "Carrying an indirect effect into a setting that disables its intermediate cause, or inventing a new direct effect to replace it."
    }
  ];

  const counterfactualInteraction = {
    ...RW,
    id: "inference-counterfactual-interaction",
    skill: "Inferences",
    subskill: "logical inference",
    difficulty: "Hard",
    title: "Prediction after changing one stage of an interacting process",
    recognize: "Identify what a condition establishes and what continues after it changes; carry the altered sequence forward without changing the stated model.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["reversed-condition", "wrong-quantity", "context-constraint"],
    build(t) {
      const topic = t.pick(COUNTERFACTUAL_TOPICS);
      return mc("Hard", topic, {
        stimulus: passage(topic.text),
        stem: topic.stem,
        correct: topic.key,
        wrong: topic.wrong,
        explanation: topic.explanation,
        steps: [
          "Distinguish what each condition changes, including whether its effect persists after the condition ends.",
          "Follow the proposed sequence in order, changing only what the new procedure changes.",
          "Predict the resulting state, rejecting choices that stop at an intermediate stage or transfer a requirement to a different process.",
        ],
        principles: [
          "A condition needed to establish a state is not necessarily needed to maintain or express that state.",
          "Trace an indirect effect through each link: changing a condition can interrupt one link while leaving another active.",
        ],
        trap: topic.trap,
        hint: "What has already happened before the altered condition takes effect, and what still depends on that condition?",
        verify: () => inOrder(topic.text, topic.anchors) && topic.wrong.length === 3 && allDistinct(topic.key, topic.wrong),
      });
    },
  };

  // Original self-contained cases; editorially reviewed before integration.
  const OVERLAPPING_CLASSIFICATION_TOPICS = [
    {
      "scene": "ii-inf-overlap-derven-requests",
      "text": "Derven's archive accepts an unsponsored request only if an individual guarantor signs it, except when the request is a renewal. A renewal may repeat earlier material but may not add items. Expedited requests are handled off site unless they require conservation supervision, which is required only when original objects are consulted. An audit found several accepted, unsponsored, expedited requests that added newly catalogued items to research projects already under way. Each requested consultation was restricted to digital copies, with no access to originals. The register entries omit the guarantors and processing locations, leading a reader to wonder whether the requests qualified for either exception.",
      "anchors": [
        "A renewal may repeat earlier material but may not add items",
        "Each requested consultation was restricted to digital copies"
      ],
      "stem": "Which conclusion about the archive's requests follows logically from the information in the text?",
      "key": "The audited requests needed individual guarantees and off-site handling, despite extending research projects already under way.",
      "wrong": [
        [
          "The audited requests could bypass guarantees as renewals, but their digital-only consultations required off-site handling.",
          "Adding items disqualifies a request from renewal status, even when the larger research project is already under way. The digital-only consultation does support off-site handling."
        ],
        [
          "The audited requests needed guarantees but required on-site conservation supervision because their newly catalogued source items were originals.",
          "The rule concerns consulting originals, not whether digital copies depict originals. These consultations allowed no access to original objects, so the supervision exception is unavailable."
        ],
        [
          "The audited requests could bypass both requirements, because earlier research projects and newly catalogued items supplied separate exemptions.",
          "Neither exception applies: additional items prevent renewal, and digital-only consultation prevents original-object supervision from being required."
        ]
      ],
      "explanation": "An existing project is not enough for renewal: the requests add items, so their absent sponsorship must be replaced by guarantees. Newly catalogued source objects also do not imply consultation of originals, because these requests allow digital copies only. Conservation supervision is therefore not required, leaving expedited off-site handling in force."
    },
    {
      "scene": "ii-inf-overlap-selmar-poets",
      "text": "Selmar's literary festival invites only writers who are local residents or registered visiting delegates, though some residents also register as delegates. Every visiting delegate who is not bilingual must be assigned an interpreter; bilingual delegates may request one but need not do so. Poets and prose writers follow the same registration rules. The program coordinator found several invited poets who were neither local residents nor assigned interpreters. A colleague suggested that the interpreter policy must have been waived for these poets, but the coordinator said their registrations were fully consistent with all the stated rules.",
      "anchors": [
        "local residents or registered visiting delegates",
        "neither local residents nor assigned interpreters"
      ],
      "stem": "Which conclusion is required if the coordinator's statement is accurate?",
      "key": "Some visiting delegates who were poets were bilingual and participated without being assigned interpreters.",
      "wrong": [
        [
          "Some locally resident poets were bilingual and participated without registering as visiting delegates.",
          "The identified poets were not local residents. Rules about the possible overlap of residents and delegates do not establish the existence of this different group."
        ],
        [
          "Some visiting poets were not bilingual but participated without interpreters because they were also local residents.",
          "The interpreter requirement applies to every nonbilingual visiting delegate, including any who also live locally; residence is not an exception."
        ],
        [
          "Some bilingual visiting poets were assigned interpreters even though their registrations did not require them.",
          "Bilingual delegates may request interpreters, but permission to do so does not show that any bilingual poet actually received one."
        ]
      ],
      "explanation": "The identified poets are invited but not residents, so they must be visiting delegates. A nonbilingual delegate must have an interpreter. Since these delegates lack interpreters and no rule was waived, they must be bilingual."
    },
    {
      "scene": "ii-inf-overlap-bren-library",
      "text": "Bren Library divides donated volumes into repaired originals and newly made facsimiles. These categories exhaust the donations, and facsimiles never receive the library's fragile-material designation. A repaired original is certified complete only after rebinding, although rebinding alone does not guarantee certification. Only volumes certified complete may return to the open shelves. A volunteer preparing a display has selected several donated volumes that are designated fragile and have already returned to those shelves. The volunteer has not checked their repair records and wants to infer only what the library's classification and shelving rules make necessary.",
      "anchors": [
        "facsimiles never receive the library's fragile-material designation",
        "designated fragile and have already returned to those shelves"
      ],
      "stem": "Which statement must be true of each volume selected by the volunteer?",
      "key": "It is a repaired original that has been rebound and certified complete, rather than a newly made facsimile.",
      "wrong": [
        [
          "It is a repaired original whose rebinding alone allowed open shelving without completeness certification.",
          "Rebinding is necessary but explicitly not sufficient for certification; open shelving additionally requires that certification."
        ],
        [
          "It is a fragile facsimile whose completeness certification allowed it to bypass the requirement for rebinding.",
          "Facsimiles never receive the fragile-material designation, so the selected fragile donations must be repaired originals."
        ],
        [
          "It is a rebound volume that received its fragile designation because every rebound donation is placed in that category.",
          "The rules connect fragility with exclusion from facsimiles, not rebinding with mandatory fragile designation. The proposed cause reverses the classification relationship."
        ]
      ],
      "explanation": "A fragile donation cannot be a facsimile, so it is a repaired original. Its return to open shelves requires completeness certification, which for repaired originals requires rebinding. The three rules jointly establish its category, repair step, and certification."
    },
    {
      "scene": "ii-inf-overlap-ellin-loans",
      "text": "Ellin's museum prohibits light-sensitive objects in outdoor displays, apart from brief supervised tests. A borrowed object containing paper is classified as light-sensitive unless that component has an approved light-blocking housing. Approval of such a housing requires the object to have undergone restoration, although restoration does not necessarily include a housing or remove light sensitivity. This year's exhibition lists several borrowed objects containing paper that will remain outdoors for the entire season, rather than appear only in supervised tests. Their catalogue entries do not mention restoration or protective housings. A curator wants to determine what the display plan and classification rules together imply about these loans.",
      "anchors": [
        "Approval of such a housing requires the object to have undergone restoration",
        "remain outdoors for the entire season"
      ],
      "stem": "Which conclusion about the exhibition follows from the information in the text?",
      "key": "Some borrowed objects containing paper have undergone restoration and have approved housings around their paper components.",
      "wrong": [
        [
          "Some paper-containing loans remain light-sensitive throughout the season but qualify for outdoor display as supervised tests.",
          "The listed loans remain outdoors for the entire season rather than appearing only in brief tests; the testing exception cannot justify their display."
        ],
        [
          "Some restored paper-containing loans require no protective housings, because restoration by itself removes their light sensitivity.",
          "Restoration alone need not remove sensitivity, and the rule for paper-containing loans requires an approved housing to avoid the light-sensitive classification."
        ],
        [
          "Some paper-containing loans have approved housings without restoration, because seasonal outdoor display supplies a separate approval route.",
          "Display location creates no alternative approval route. Approved housings require restoration, even when a loan is intended for outdoor display."
        ]
      ],
      "explanation": "Season-long display cannot use the brief-test exception, so the listed loans must avoid light-sensitive classification. Because they contain paper, that requires approved housings. Approval in turn requires prior restoration. The same loans establish the overlap of paper components, approved housing, and restoration, none of which can be dropped from that chain."
    },
    {
      "scene": "ii-inf-overlap-varen-entries",
      "text": "Varen's literary prize accepts an entry as eligible only if it is an original composition or an authorized translation. Entries submitted through its translation committee are translations rather than original compositions, but committee submission does not by itself establish authorization. Every authorized translation from an extinct language must have a consultant's signed language report; translations from living languages may qualify without one. The eligibility list includes several committee-submitted entries from extinct languages. Their public catalogue descriptions omit consultant names, and a reader interprets that omission as evidence that these entries received an exception to the report requirement.",
      "anchors": [
        "an original composition or an authorized translation",
        "several committee-submitted entries from extinct languages"
      ],
      "stem": "Assuming the stated requirements were followed, which conclusion is supported?",
      "key": "Some committee-submitted entries have signed language reports despite the public catalogue's omission of consultant names.",
      "wrong": [
        [
          "Some eligible committee submissions lack authorization because their consultants' reports substitute for translation rights.",
          "The rules require an eligible nonoriginal entry to be an authorized translation; a language report is an additional requirement, not a substitute for authorization."
        ],
        [
          "Some eligible translations from living languages have signed reports, since those reports are optional rather than forbidden.",
          "An optional report is possible for those translations, but the text establishes no actual living-language entry with a report."
        ],
        [
          "Some committee submissions qualify as original compositions because their extinct source languages require specialist interpretation.",
          "Committee submissions are explicitly translations rather than original compositions. The need for specialist reports does not reclassify them."
        ]
      ],
      "explanation": "The listed entries are eligible and not original compositions, so they must be authorized translations. Their extinct source languages then require signed consultant reports. The catalogue's missing names cannot negate the reports whose existence follows from the classification and eligibility requirements."
    },
    {
      "scene": "ii-inf-overlap-narel-stalls",
      "text": "At Narel's temporary market, every stall selling prepared food must undergo inspection. An inspected stall without a fixed water connection must use disposable serving equipment, even if it sells something other than food. The heritage courtyard, one of several market locations, permits only stalls that use no disposable serving equipment. Stalls elsewhere may use either kind, and craft stalls are not required to undergo inspection unless they also sell prepared food. Organizers are checking four proposed stall descriptions before assigning locations. They want to reject a description only if the stated combination is incompatible with the market's rules.",
      "anchors": [
        "every stall selling prepared food must undergo inspection",
        "permits only stalls that use no disposable serving equipment"
      ],
      "stem": "Which proposed stall description is incompatible with the rules?",
      "key": "A prepared-food stall in the heritage courtyard that has no fixed water connection.",
      "wrong": [
        [
          "An uninspected craft stall in the courtyard with no fixed water connection.",
          "A craft-only stall need not be inspected. The disposable-equipment requirement applies to inspected stalls without water, so this stall can use reusable equipment."
        ],
        [
          "A prepared-food stall outside the heritage courtyard, inspected and lacking a fixed water connection.",
          "Such a stall must use disposable equipment, which is allowed outside the heritage courtyard."
        ],
        [
          "An inspected craft stall in the heritage courtyard that has a fixed water connection.",
          "With a fixed water connection, inspection does not trigger the disposable-equipment requirement; the stall can comply with the courtyard's restriction."
        ]
      ],
      "explanation": "Prepared-food sales require inspection. Inspection without a water connection requires disposable equipment. The courtyard prohibits that equipment, so the three features in the keyed description cannot coexist even though each appears in a permissible stall elsewhere."
    },
    {
      "scene": "ii-inf-overlap-delor-lectures",
      "text": "Delor's institute archives a lecture only if it has permission to retain a recording or has an approved transcript. For a visiting speaker, recording permission requires a signed release filed with that lecture; a host's invitation does not replace the filed release. Any approved transcript of a lecture delivered in a foreign language must include a translation into the institute's working language. The archive lists foreign-language lectures by visiting speakers whose files contain no signed releases. Staff confirm that these lectures satisfy the usual archiving policy. Nothing in the policy requires every archived lecture to have both a recording and a transcript.",
      "anchors": [
        "permission to retain a recording or has an approved transcript",
        "visiting speakers whose files contain no signed releases"
      ],
      "stem": "Which statement must apply to every lecture in the listed group?",
      "key": "It has an approved transcript with a translation, because the absent release rules out the recording-permission route.",
      "wrong": [
        [
          "It has an approved recording with a translation, because a transcript can substitute for a visiting speaker's signed release.",
          "A transcript is an alternative basis for archiving, not an alternative way to authorize a recording; the release remains necessary for that permission."
        ],
        [
          "It has both a recording and a translated transcript, because foreign-language delivery makes both formats compulsory.",
          "Foreign-language delivery determines what an approved transcript contains; it does not require both formats or override the recording-release rule."
        ],
        [
          "It has a transcript without an approved translation, because the absence of a release exempts visiting speakers from that requirement.",
          "The translation requirement applies to every approved foreign-language transcript. Missing a recording release creates no exception to that separate requirement."
        ]
      ],
      "explanation": "The missing release prevents these visiting speakers' lectures from using recording permission as their basis for archiving. They must instead have approved transcripts. Because the lectures are in foreign languages, those approved transcripts must include translations."
    },
    {
      "scene": "ii-inf-overlap-merin-textiles",
      "text": "Merin's archive keeps every uncatalogued textile in its own storeroom, laid flat; uncatalogued textiles are never lent out. Restored textiles stored flat receive a green restoration tag unless they are on loan to another institution. A tag on a lent textile is temporarily removed to avoid interfering with the borrower's system. During an inventory, staff identify several uncatalogued textiles with no green tags and confirm that the tagging policy has been followed correctly. Their inventory report records catalogue status and tags but does not describe restoration work. A reader wants to infer restoration status from the combination of these records and policies.",
      "anchors": [
        "uncatalogued textiles are never lent out",
        "several uncatalogued textiles with no green tags"
      ],
      "stem": "Which conclusion about the textiles follows from the text?",
      "key": "Some uncatalogued textiles have not been restored, since their storage and loan status leave no exception to tagging restored items.",
      "wrong": [
        [
          "Some uncatalogued textiles have been restored but lack tags because their flat storage makes the loan exception applicable.",
          "The exception concerns being on loan, not lying flat. Uncatalogued textiles are never lent and therefore cannot use that exception."
        ],
        [
          "Some restored textiles in the archive's storeroom lack tags because uncatalogued items are excluded from the restoration policy.",
          "The policy does not exclude uncatalogued items. Those items are stored flat and not lent, so any restored one would require a tag."
        ],
        [
          "Some restored textiles on loan remain tagged because being catalogued rather than uncatalogued cancels the temporary-removal rule.",
          "Tags on lent textiles are removed, and no catalogue-based exception is stated. The inventory provides no example of a tagged loan."
        ]
      ],
      "explanation": "Uncatalogued textiles are flat and never on loan. A restored flat textile would therefore require a green tag, with no loan exception available. The correctly untagged uncatalogued examples establish that some uncatalogued textiles have not been restored."
    },
    {
      "scene": "ii-inf-overlap-varda-seeds",
      "text": "Varda's seed bank admits a collection only if its seeds were gathered from wild plants or the collection holds a valid quarantine certificate. Quarantine certificates in this program are issued only for introduced species. The bank classifies native and introduced species as mutually exclusive categories. Collecting seeds within Varda does not itself establish either wild origin or native status: collectors also work in cultivated gardens containing both categories. Several admitted collections are classified as native, but the public database gives neither their gathering locations nor their quarantine histories. A botanist wants to identify what their admission and native classification together establish without substituting geographic location for collection method.",
      "anchors": [
        "gathered from wild plants or the collection holds a valid quarantine certificate",
        "Several admitted collections are classified as native"
      ],
      "stem": "Which statement must be true of every admitted collection classified as native?",
      "key": "Its seeds were gathered from wild plants, since native status excludes the quarantine route available to introduced species.",
      "wrong": [
        [
          "Its seeds were gathered within Varda, since collection inside the country is what distinguishes native species from introduced ones.",
          "The text explicitly separates gathering location from species classification; a native species could be collected elsewhere."
        ],
        [
          "It passed quarantine before admission, since native classification exempts a collection from the requirement of wild origin.",
          "The alternative admission route requires a valid certificate, which native collections cannot receive. Undergoing quarantine without that certificate supplies no exemption from wild origin."
        ],
        [
          "Its seeds came from a cultivated garden, since native collections would otherwise have been admitted under the introduced-species category.",
          "Wild origin is an admission route, not a species category. It does not convert a native species into an introduced one."
        ]
      ],
      "explanation": "Admission requires wild origin or a valid quarantine certificate. Native status excludes introduced status, while quarantine certificates require introduced status. A native admitted collection therefore cannot have used the certificate route to qualify and must have wild origin; its geographic gathering location remains unspecified."
    },
    {
      "scene": "ii-inf-overlap-lorin-prints",
      "text": "Every print in Lorin's limited-edition series was made either by lithography or from a woodblock. Every woodblock print in the series was individually numbered; lithographs could be numbered or unnumbered. Lithographs made before the workshop installed its own press were produced abroad, although later lithographs were not necessarily domestic. The workshop's dated ledger records physical receipt of several unnumbered prints from the series before the press installation. Their artist signatures are visible, but their printing methods are not recorded. A cataloguer wants a conclusion supported by the production and numbering rules rather than by the fact that the artists signed their work.",
      "anchors": [
        "Every woodblock print in the series was individually numbered",
        "physical receipt of several unnumbered prints"
      ],
      "stem": "Which conclusion does the information in the text support?",
      "key": "Some signed prints in the series are lithographs produced abroad before the workshop installed its own press.",
      "wrong": [
        [
          "Some signed woodblock prints in the series were produced abroad without numbers before the workshop installed its press.",
          "Every woodblock print in this series was numbered, so the unnumbered acquisitions cannot establish an unnumbered woodblock category."
        ],
        [
          "Some numbered lithographs in the series were produced domestically after the workshop installed its own press.",
          "Numbered lithographs and domestic later production are both permitted, but the passage establishes neither their existence nor their overlap."
        ],
        [
          "Some signed prints received before the installation were made afterward, since receipt dates do not determine printing methods.",
          "A print must exist before physical receipt. The missing method field does not allow production after the recorded delivery."
        ]
      ],
      "explanation": "The unnumbered prints cannot be woodblock prints, so the series' exhaustive categories make them lithographs. Physical receipt before the press installation places their production before it as well. Such lithographs were produced abroad, and the passage identifies their visible signatures."
    }
  ];

  function createOverlapClassificationTemplate(C) {
    const { RW, passage, mc, inOrder, allDistinct } = C;
    return {
      ...RW,
      id: "inference-overlapping-classifications",
      skill: "Inferences",
      subskill: "logical inference",
      difficulty: "Hard",
      title: "Hidden overlap or exclusion across differently scoped classifications",
      recognize: "Keep each rule attached to the group it governs, then follow the same objects through the applicable rules to infer an unreported overlap or exclusion.",
      rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
      tricks: ["reversed-condition", "too-broad", "context-constraint"],
      build(t) {
        const topic = t.pick(OVERLAPPING_CLASSIFICATION_TOPICS);
        return mc("Hard", topic, {
          stimulus: passage(topic.text),
          stem: topic.stem,
          correct: topic.key,
          wrong: topic.wrong,
          explanation: topic.explanation,
          steps: [
            "Identify the particular objects or group the question concerns, and keep their stated properties together.",
            "Apply each relevant rule only to its stated group, checking alternatives and exceptions before drawing a conclusion.",
            "Choose what must follow for those same objects; do not reverse a one-way rule or treat a permitted combination as an observed one.",
          ],
          principles: [
            "A rule about one category does not automatically apply to every object that shares one of that category's properties.",
            "Separate facts establish an overlap only when they apply to the same objects, not merely to different possible members of a group.",
          ],
          trap: "Reversing a membership rule, moving an exception to another group, or treating a possible combination as one the evidence establishes.",
          hint: "Follow the same examples through all the rules that apply to them. Which alternative or exception is actually available?",
          verify: () => inOrder(topic.text, topic.anchors) && topic.wrong.length === 3 && allDistinct(topic.key, topic.wrong),
        });
      },
    };
  }

  const overlappingClassifications = createOverlapClassificationTemplate(C);

  return [
    ruleToCase,
    causeEffect,
    experimentComparison,
    characterAction,
    competingExplanations,
    evidenceLimit,
    separatedPremises,
    periodProse,
    qualifiedConclusion,
    counterfactualInteraction,
    overlappingClassifications,
  ];
});
