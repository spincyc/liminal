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
      key: "It is a deciduous tree, even though it is a conifer.",
      reversed: "It keeps its needles through the winter, as most conifers do.",
      broad: "Like most conifers, it turns golden and loses its needles in autumn.",
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
      broad: "Like all igneous rocks, it is black and glassy.",
      unsupported: "It is harder than any other kind of rock.",
    },
    {
      scene: "ii-comet-without-tail",
      about: "Comet Varga at the time of the photographs",
      text:
        "A comet develops a tail only when it comes close enough to the Sun for sunlight to warm its icy nucleus, which then releases streams of gas and dust. Far from the Sun, a comet is simply a frozen chunk of ice and rock. Astronomers recently photographed Comet Varga while it was well beyond the distance at which sunlight could warm its ice, farther from the Sun than Jupiter.",
      rule: "develops a tail only when it comes close enough to the Sun",
      case: "well beyond the distance at which sunlight could warm its ice",
      key: "It did not have a tail of gas and dust.",
      reversed: "It had a long tail of gas and dust.",
      broad: "It is the only comet ever photographed without a tail.",
      unsupported: "It was moving toward Jupiter at great speed.",
    },
    {
      scene: "ii-beef-loanword",
      about: "the English word \"beef\"",
      text:
        "Linguists call a word that one language takes from another a loanword. After the Norman Conquest of 1066, French-speaking rulers governed England for centuries, and English took in thousands of French words, many of them concerning law, government, and fine dining. The English word \"beef\" is one example: it developed from the French word \"boeuf\" during this period.",
      rule: "call a word that one language takes from another a loanword",
      case: "it developed from the French word",
      key: "It is a loanword that English took from French.",
      reversed: "It is a word that French speakers took from English.",
      broad: "Like all English words about food, it came from French.",
      unsupported: "It was first used by farmers who raised cattle.",
    },
    {
      scene: "ii-platypus-mammal",
      about: "the platypus",
      text:
        "Biologists classify an animal as a mammal if it has hair or fur and feeds its young on milk produced by the mother. Most mammals also give birth to live young, but that is not part of the definition. The platypus of eastern Australia has dense brown fur and feeds its young on milk, yet the female lays eggs and keeps them warm for about ten days before they hatch.",
      rule: "classify an animal as a mammal if it has hair or fur and feeds its young on milk",
      case: "has dense brown fur and feeds its young on milk",
      key: "It is a mammal even though it lays eggs.",
      reversed: "It cannot be a mammal because it lays eggs.",
      broad: "Like most Australian mammals, it lays eggs instead of giving birth.",
      unsupported: "It feeds its young on milk only after they leave the nest.",
    },
    {
      scene: "ii-leap-year-1900",
      about: "the year 1900",
      text:
        "In the Gregorian calendar, a year is a leap year if it is divisible by 4, except that a year divisible by 100 is a leap year only if it is also divisible by 400. The rule keeps the calendar closely aligned with the seasons over the centuries. Under it, 1996 and 2000 were both leap years. The year 1900 is divisible by 4 and by 100, but not by 400.",
      rule: "a year divisible by 100 is a leap year only if it is also divisible by 400",
      case: "The year 1900 is divisible by 4 and by 100, but not by 400",
      key: "It was not a leap year under the Gregorian calendar.",
      reversed: "It was a leap year because it is divisible by 4.",
      broad: "Like every year divisible by 100, it was not a leap year.",
      unsupported: "It was the first year of the Gregorian calendar.",
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
      broad: "Like every gas in Earth's atmosphere, it rarely forms bonds.",
      unsupported: "It is the most common gas in Earth's atmosphere.",
    },
    {
      scene: "ii-senate-cloture-vote",
      about: "the cloture vote on the transportation bill",
      text:
        "In the United States Senate, a filibuster, or prolonged debate meant to delay a vote, can be ended by a vote called cloture. For most legislation, cloture requires the support of three-fifths of the full Senate, which means 60 of its 100 members. In one session, a cloture vote on a transportation bill received 57 votes in favor and 43 against.",
      rule: "requires the support of three-fifths of the full Senate",
      case: "received 57 votes in favor",
      key: "It did not end the filibuster on the bill.",
      reversed: "It ended the filibuster because most senators supported it.",
      broad: "Like most cloture votes, it failed to end a filibuster.",
      unsupported: "It was the first cloture vote held that session.",
    },
    {
      scene: "ii-datura-moth-flowers",
      about: "the sacred datura",
      text:
        "Flowers pollinated by moths at night tend to share certain traits: they are usually white or pale, which makes them easy to see in dim light, and they release their strongest scent after dark. The desert plant known as the sacred datura has large white flowers that open in the evening and give off a sweet fragrance that grows stronger as night falls.",
      rule: "Flowers pollinated by moths at night tend to share certain traits",
      case: "large white flowers that open in the evening",
      key: "It is probably pollinated by moths that fly at night.",
      reversed: "It is probably pollinated by bees that fly during the day.",
      broad: "Like all white flowers, it is pollinated by night-flying moths.",
      unsupported: "It grows only in deserts where moths are common.",
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
      opposite: "more wetland habitat, since the stream could spread out freely",
      irrelevant: "that the ranchers' cattle had grown larger than before",
      extreme: "that no frogs, ducks, or insects remained anywhere in the region",
    },
    {
      scene: "ii-road-salt-cold",
      text:
        "Salt spread on icy roads lowers the temperature at which water freezes, so a salted road can stay free of ice at temperatures a few degrees below 0°C. The effect weakens as the air gets colder, however, and below about −10°C ordinary road salt does little to keep ice from forming. Road crews in a northern city facing an overnight forecast of −18°C therefore ______.",
      mechanism: "below about −10°C ordinary road salt does little",
      change: "an overnight forecast of −18°C",
      key: "cannot count on ordinary road salt alone to keep the roads clear",
      opposite: "can expect ordinary road salt to keep every road free of ice",
      irrelevant: "should expect the salt to make water freeze at a higher temperature",
      extreme: "will be unable to keep traffic moving on any road in the city",
    },
    {
      scene: "ii-caffeine-adenosine",
      text:
        "Adenosine is a chemical that builds up in the brain during waking hours and produces the feeling of sleepiness by binding to certain receptors. Caffeine molecules have a similar shape and can occupy those same receptors without activating them, which keeps adenosine from binding. A person who drinks strong coffee late in the evening would therefore most likely ______.",
      mechanism: "which keeps adenosine from binding",
      change: "drinks strong coffee late in the evening",
      key: "feel less sleepy than usual at bedtime",
      opposite: "feel sleepier than usual at bedtime",
      irrelevant: "produce less adenosine the following day",
      extreme: "never again feel the effects of adenosine",
    },
    {
      scene: "ii-legume-rotation",
      text:
        "Bacteria living in small nodules on the roots of beans, peas, and other legumes capture nitrogen from the air and convert it into a form that plants can use. When the legumes die and decompose, much of that nitrogen remains in the soil. A farmer who grows peas in a field one year and corn in the same field the next year can therefore expect the corn to ______.",
      mechanism: "much of that nitrogen remains in the soil",
      change: "grows peas in a field one year and corn in the same field the next year",
      key: "find more usable nitrogen in the soil than it would after a crop that is not a legume",
      opposite: "find less usable nitrogen in the soil, since the peas will have used it all up",
      irrelevant: "develop nodules on its own roots that capture nitrogen directly from the air",
      extreme: "need no water, sunlight, or other nutrients at all during the growing season",
    },
    {
      scene: "ii-tree-ring-drought",
      text:
        "A tree adds one ring of wood to its trunk each year, and the ring's width depends largely on how much water the tree received that year: wet years produce wide rings, and dry years produce narrow ones. A core taken from an old oak in Tennessee shows a band of five very narrow rings formed during the 1570s. This band suggests that the region ______.",
      mechanism: "dry years produce narrow ones",
      change: "a band of five very narrow rings",
      key: "had a series of unusually dry years during the 1570s",
      opposite: "had a series of unusually wet years during the 1570s",
      irrelevant: "had more oak trees in the 1570s than it has today",
      extreme: "received no rain at all during those five years",
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
      extreme: "could not find any coffee to buy anywhere in the world",
    },
    {
      scene: "ii-lake-ice-fish",
      text:
        "Ice floats because it is less dense than liquid water, and a layer of ice on a lake's surface insulates the water beneath it from the cold air above. As a result, the water under the ice stays above freezing through the winter, even when the air temperature drops far below zero. Fish living in a lake that freezes over each winter are therefore able to ______.",
      mechanism: "the water under the ice stays above freezing",
      change: "a lake that freezes over each winter",
      key: "survive the winter in the liquid water beneath the ice",
      opposite: "survive the winter only by moving to lakes that do not freeze",
      irrelevant: "make the ice above them less dense by swimming beneath it",
      extreme: "stay equally active at every depth all year without any change",
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
      extreme: "lose the ability to see clearly in dim light permanently",
    },
    {
      scene: "ii-lichen-sulfur-recovery",
      text:
        "Many lichens absorb water and nutrients directly from the air and have no way to filter out pollutants, so sulfur dioxide in the air damages them quickly. For this reason, the number of lichen species growing in an area tends to fall as its air becomes more polluted. After a coal-burning power plant that released large amounts of sulfur dioxide closed in 1990, forests near the plant most likely ______.",
      mechanism: "the number of lichen species growing in an area tends to fall",
      change: "closed in 1990",
      key: "gained lichen species over the following decades as the air improved",
      opposite: "lost lichen species over the following decades as sulfur dioxide declined",
      irrelevant: "absorbed less water directly from the air than they had before",
      extreme: "became completely free of every kind of air pollution within a year",
    },
    {
      scene: "ii-closed-car-heat",
      text:
        "Glass lets most visible sunlight pass through, but it blocks much of the infrared radiation that warm objects give off. Sunlight entering a closed car through its windows warms the seats and dashboard, which then give off heat as infrared radiation that the glass keeps inside. On a sunny day, a car parked with its windows closed will therefore ______.",
      mechanism: "infrared radiation that the glass keeps inside",
      change: "parked with its windows closed",
      key: "become warmer inside than the air around it",
      opposite: "stay cooler inside than the air around it",
      irrelevant: "let less visible light reach its seats",
      extreme: "keep heating up without any limit at all",
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
        "Acacia trees in parts of East Africa house colonies of ants that swarm and bite animals feeding on the trees' leaves. To test whether the ants protect the trees, ecologist Mercy Wanjiru removed the ants from ten acacias and left the colonies in place on ten similar trees nearby; goats browsed freely among all twenty. After a year, the trees without ants had lost nearly half of their leaves, while trees with ants had lost less than a tenth. This result suggests that ______.",
      held: "goats browsed freely among all twenty",
      result: "the trees without ants had lost nearly half of their leaves",
      key: "the ants substantially reduce the damage that browsing animals do to acacias",
      reversed: "the ants cause acacias to lose leaves by feeding on the leaves themselves",
      heldFactor: "goats could reach the trees without ants more easily than they could reach the others",
      broad: "every tree species that hosts ants is fully protected from browsing animals",
    },
    {
      scene: "ii-handwritten-notes",
      text:
        "Psychologists asked sixty students to watch the same recorded lecture. Half took notes by hand and half typed notes on laptops that had no internet access, so that no one could be distracted by other websites. On a test of the lecture's main concepts a week later, the students who wrote by hand scored higher than those who typed, even though the typists had recorded more words. This result suggests that ______.",
      held: "laptops that had no internet access",
      result: "the students who wrote by hand scored higher",
      key: "writing notes by hand may help students understand concepts better than typing does",
      reversed: "recording more words in one's notes leads to a better understanding of a lecture",
      heldFactor: "the students who typed were distracted by the websites they visited during the lecture",
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
      broad: "all plants depend on birds to carry their seeds if they are to reproduce successfully at all",
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
      heldFactor: "differences in light between the tanks caused the bleaching",
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
      heldFactor: "the children who saw the gestures happened to have a more skillful teacher than the others",
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
      key: "reading on a light-emitting screen before bed can make it harder to fall asleep",
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
      key: "earthworms can improve the growth of wheat in this kind of soil",
      reversed: "earthworms compete with wheat for water and slow its growth",
      heldFactor: "the containers with earthworms received more water than the others",
      broad: "any crop will grow faster wherever earthworms are present in soil",
    },
    {
      scene: "ii-dropped-papers-bystanders",
      text:
        "In an experiment, a researcher dropped a box of papers on a sidewalk in view of passersby. Sometimes a single pedestrian was nearby; at other times, five or more people were passing at once. The same researcher dropped the same box at the same spot and time of day throughout the study. A lone passerby helped pick up the papers far more often than any individual in a larger group did. This result suggests that ______.",
      held: "at the same spot and time of day",
      result: "A lone passerby helped pick up the papers far more often",
      key: "a person may be less likely to help when many other people are present",
      reversed: "people are more willing to help a stranger when they are part of a large group",
      heldFactor: "the researcher dropped the box more clumsily when fewer people were nearby",
      broad: "people in busy places never help strangers who need assistance",
    },
  ];

  const experimentComparison = {
    ...RW,
    id: "inference-completion-controlled-comparison",
    skill: "Inferences",
    subskill: "text completion",
    difficulty: "Medium",
    title: "Completion stating what a controlled comparison shows",
    recognize:
      "Two groups differ in one factor while the text holds the others equal; the conclusion credits that one factor, in the direction observed, for the cases studied.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "too-broad", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(EXPERIMENT_TOPICS);
      const wrong = [
        [topic.reversed, "This draws the opposite conclusion from the one the results support."],
        [topic.heldFactor, "The text says this factor was kept the same for both groups, so it cannot explain the difference."],
        [topic.broad, "One comparison of this kind cannot support a claim this sweeping."],
      ];
      return mc("Medium", topic, {
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
      surface: "\"It's only four hours away,\"",
      action: "touched the doorframe of her old bedroom",
      key: "She is more affected by leaving home than her words suggest.",
      faceValue: "She is untroubled by leaving home, since it is only four hours away.",
      overreach: "She has decided at the last moment not to leave home after all.",
      misread: "She is worried that the overcast weather will make the drive difficult.",
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
      key: "He wants Ruth to find and correct her own mistakes rather than simply be told about them.",
      faceValue: "He is entirely satisfied with Ruth's first bookshelf because its joints are strong.",
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
      key: "She values her grandmother's calls more than her recent behavior suggested.",
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
      key: "She takes the review's criticism more seriously than she admits.",
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
      faceValue: "He does not care whether the cat is found before the family moves.",
      overreach: "He has decided to cancel the move if the cat cannot be found.",
      misread: "He has genuinely forgotten the name that the family gave the cat.",
    },
    {
      scene: "ii-lit-honorable-mention",
      name: "Priya",
      text:
        "When the science fair results were posted, Priya's name appeared under \"Honorable Mention,\" below Ellis's, which was listed first. \"It's fine,\" she told her mother at dinner. \"Honestly, the judges barely looked at mine.\" After dinner, she took her display board out of the closet where she had shoved it, laid it on her bedroom floor, and began taking notes on a legal pad under the heading \"Next Year.\"",
      surface: "\"It's fine,\" she told her mother",
      action: "began taking notes on a legal pad under the heading",
      key: "She is determined to improve her project for a future competition.",
      faceValue: "She has lost all interest in science fairs after this year's result.",
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
        hint: `What does ${topic.name} do that doesn't match what ${topic.name} says?`,
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
  // that the favored explanation is proven or the only one.
  const COMPETING_EXPLANATION_TOPICS = [
    {
      scene: "ii-zebra-stripes-flies",
      text:
        "Scientists have proposed two explanations for why zebras have stripes. According to the first, the stripes confuse lions and other large predators during a chase. According to the second, the stripes discourage biting flies, which spread disease. A survey of zebra populations across Africa found that stripes are boldest where biting flies are active for most of the year, and that stripe boldness shows no relationship to the number of lions in an area. This finding suggests that ______.",
      first: "the stripes confuse lions",
      second: "the stripes discourage biting flies",
      finding: "shows no relationship to the number of lions",
      key: "the fly explanation fits the pattern of zebra stripes better than the predator explanation does",
      reversed: "zebras living among many lions have developed bolder stripes than zebras living elsewhere",
      extreme: "the stripes evolved solely to discourage biting flies and serve no other purpose for zebras at all",
      both: "neither flies nor predators have had any influence on how zebra stripes evolved",
    },
    {
      scene: "ii-blue-egg-sunscreen",
      text:
        "Two explanations have been offered for why some songbirds lay blue eggs. The first proposes that the blue pigment acts as a sunscreen, shielding the developing chick from harmful ultraviolet light. The second proposes that a bright blue egg signals the female's health to her mate, encouraging him to help feed the chicks. Researchers comparing many species found that eggs laid in deeply shaded nests, where ultraviolet light is weak, are just as blue as eggs laid in nests exposed to open sun. This finding suggests that ______.",
      first: "acts as a sunscreen",
      second: "signals the female's health to her mate",
      finding: "are just as blue as eggs laid in nests exposed to open sun",
      key: "protection from ultraviolet light is unlikely to be the main reason for the eggs' blue color",
      reversed: "blue eggs are bluest in the nests where ultraviolet light is strongest",
      extreme: "blue eggs have been shown to exist only so that a female can signal her good health to her mate",
      both: "egg color has no effect on how well songbird chicks survive or are fed",
    },
    {
      scene: "ii-yawning-cooling",
      text:
        "Researchers have proposed two explanations for yawning. One holds that yawning raises the level of oxygen in the blood when it runs low; the other holds that yawning cools the brain by drawing in air and increasing blood flow to the head. In one experiment, volunteers breathing air enriched with extra oxygen yawned just as often as volunteers breathing ordinary air, while volunteers holding cold packs to their foreheads yawned far less often. These results suggest that ______.",
      first: "raises the level of oxygen in the blood",
      second: "cools the brain",
      finding: "yawned just as often as volunteers breathing ordinary air",
      key: "yawning is more likely related to brain temperature than to oxygen in the blood",
      reversed: "people yawn less often when the air they breathe contains extra oxygen",
      extreme: "brain temperature is the only factor that can cause a person to yawn",
      both: "neither oxygen levels nor temperature has any connection to how often people yawn",
    },
    {
      scene: "ii-alpine-bronze-spread",
      text:
        "Archaeologists have proposed two explanations for how bronze-making reached a remote valley in the Alps. One holds that local smiths learned the technique through trade, adopting it gradually while keeping their own styles of tools. The other holds that migrant metalworkers arrived and brought both the technique and their own designs with them. Excavations show that the earliest bronze tools in the valley copy the shapes of the stone and copper tools made there for centuries before. This finding suggests that ______.",
      first: "local smiths learned the technique through trade",
      second: "migrant metalworkers arrived",
      finding: "copy the shapes of the stone and copper tools",
      key: "local smiths more likely adopted the technique than newcomers brought it to the valley",
      reversed: "migrant metalworkers most likely introduced their own tool designs to the valley",
      extreme: "no one from outside the valley ever had any influence on how its people worked metal",
      both: "the valley's smiths most likely had no contact with any outside traders before bronze arrived",
    },
    {
      scene: "ii-loggerhead-magnetic-homing",
      text:
        "Loggerhead sea turtles return as adults to nest on the stretch of coast where they hatched. Some researchers think the turtles find that stretch by remembering its distinctive smell; others think they recognize the particular strength and angle of Earth's magnetic field there. Earth's magnetic field drifts slowly, so the field once associated with a given beach gradually shifts along the coastline. Over two decades, researchers found that the turtles' nesting sites shifted along the coast in step with the drifting field. This finding suggests that ______.",
      first: "by remembering its distinctive smell",
      second: "the particular strength and angle of Earth's magnetic field",
      finding: "shifted along the coast in step with the drifting field",
      key: "turtles likely rely more on magnetic cues than on smell to find their way back to nest",
      reversed: "turtles keep returning to nesting sites whose distinctive smell has stayed the same",
      extreme: "turtles rely on magnetic cues alone and are unable to detect smells of any kind",
      both: "turtles no longer return to nest near the stretch of coast where they hatched",
    },
    {
      scene: "ii-island-dialect-vowels",
      text:
        "Linguists have offered two explanations for why the dialect of the island of Varda lost its distinctive vowel sounds during the twentieth century. One credits radio and television, which brought mainland speech into every home. The other credits a new causeway, which let islanders commute daily to jobs on the mainland. Recordings show that the vowels changed first and fastest among islanders who commuted, while islanders who stayed home, and who listened to radio and television just as often, kept the old vowels for decades longer. These recordings suggest that ______.",
      first: "credits radio and television",
      second: "credits a new causeway",
      finding: "kept the old vowels for decades longer",
      key: "daily contact with mainland speakers did more to change the vowels than broadcasts did",
      reversed: "radio and television were the main cause of the change in the vowels spoken on the island",
      extreme: "broadcast media never have any influence on the way that anyone speaks",
      both: "the islanders who commuted kept the old vowels longer than those who stayed home",
    },
    {
      scene: "ii-web-silk-bands",
      text:
        "Some orb-weaving spiders add thick zigzag bands of silk to their webs. One explanation holds that the bands make webs visible to birds, which then avoid flying through and destroying them; another holds that the bands attract insects by reflecting ultraviolet light. In a field study, webs with bands caught fewer insects than webs without them but were damaged by birds far less often. These findings suggest that ______.",
      first: "make webs visible to birds",
      second: "attract insects by reflecting ultraviolet light",
      finding: "caught fewer insects than webs without them",
      key: "the bands are more likely to protect webs from birds than to attract prey",
      reversed: "the bands help spiders catch more of the insects that fly near their webs",
      extreme: "the bands have been proven to serve only as a warning to birds",
      both: "neither birds nor insects respond in any way to the silk bands on webs",
    },
    {
      scene: "ii-kessara-abandonment",
      text:
        "Historians have proposed two explanations for why residents abandoned the hilltop town of Kessara around 1200 BCE. Some point to an invading army, while others point to a long drought that ruined the farmland around the town. Excavations of the town's final layer found houses emptied of valuables but otherwise intact, with no signs of burning and no weapons or damaged walls. This finding suggests that ______.",
      first: "an invading army",
      second: "a long drought",
      finding: "no signs of burning and no weapons or damaged walls",
      key: "the town was probably not abandoned because of a violent attack",
      reversed: "an invading army destroyed the town before residents could escape",
      extreme: "a drought has been shown to be the cause of the town's abandonment",
      both: "the residents left for reasons unrelated to either farming or warfare",
    },
    {
      scene: "ii-moth-lamp-orientation",
      text:
        "Why moths gather around artificial lights has long puzzled biologists. One idea is that moths steer by keeping the Moon at a fixed angle and are misled by nearby lamps. Another is that moths instinctively keep their backs turned toward the brightest part of the sky, which normally keeps them level in flight. High-speed cameras showed that moths near a lamp tilted their backs toward it, circling it tightly and even flying upside down when the lamp was below them. These observations suggest that ______.",
      first: "keeping the Moon at a fixed angle",
      second: "keep their backs turned toward the brightest part of the sky",
      finding: "flying upside down when the lamp was below them",
      key: "turning their backs toward light explains the moths' behavior better than Moon steering does",
      reversed: "moths near a lamp steer by holding it at a fixed angle, just as they do with the Moon",
      extreme: "moths have no ability to use the Moon or any other light source for navigation",
      both: "artificial lights have little effect on the way moths fly when they are nearby",
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
      extreme: "blue tails have been shown to stop adult males from ever attacking juveniles",
      both: "juveniles on the island without predators have lost their bright blue tails",
    },
  ];

  const competingExplanations = {
    ...RW,
    id: "inference-completion-competing-explanations",
    skill: "Inferences",
    subskill: "text completion",
    difficulty: "Hard",
    title: "Completion saying which of two explanations a finding favors",
    recognize:
      "Work out what each explanation predicts before reading the finding; the finding counts against the one whose prediction fails, which does not prove the other.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "extreme-language", "too-broad"],
    build(t) {
      const topic = t.pick(COMPETING_EXPLANATION_TOPICS);
      const wrong = [
        [topic.reversed, "This matches the explanation the finding counts against, or contradicts the finding itself."],
        [topic.extreme, "The finding weighs against one explanation; it does not prove the other or rule out every other factor."],
        [topic.both, "The finding bears on the two explanations differently; this choice contradicts or ignores what was found."],
      ];
      return mc("Hard", topic, {
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
        trap: "Leaping from \"this finding fits the second explanation\" to \"the second explanation is proven and the only one.\"",
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
      key: "living near a park is what improves a resident's mood",
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
      scoped: "most of the people buried in the wealthiest graves had eaten a lot of fish",
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
      existence: "willows along the streams can grow taller while wolves live in the park",
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
      scoped: "ultraviolet light can produce amino acids from ices like those on comets",
      secondary: "the frozen laboratory mixtures also produced simple sugars",
      existence: "amino acids can form in a mixture that remains frozen",
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
    difficulty: "Hard",
    title: "Completion naming the claim a study's limitation leaves unsupported",
    recognize:
      "The blank follows \"does not show that\": the answer is the one claim the stated limitation blocks, and every claim the study did establish is wrong here.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["reversed-condition", "too-narrow"],
    build(t) {
      const topic = t.pick(EVIDENCE_LIMIT_TOPICS);
      const wrong = [
        [topic.scoped, "The study did show this for the cases it examined, so the text cannot say the study fails to show it."],
        [topic.secondary, "This is another result the study reports, so it is something the study does show."],
        [topic.existence, "The study's own results demonstrate this much; the limitation concerns a broader claim."],
      ];
      return mc("Hard", topic, {
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

  // `premise` is stated early and `evidence` at the end, with at least a
  // sentence between them. The key needs both; `partial` uses only one of
  // them (often leaning on the intervening sentence), `reversed` runs the
  // reasoning the wrong way, and `unsupported` has no basis in the text.
  const SEPARATED_PREMISE_TOPICS = [
    {
      scene: "ii-jack-pine-fire-stand",
      about: "the stand of jack pines in northern Ontario",
      text:
        "The cones of the jack pine are sealed shut with a resin that melts only at the high temperatures reached during a forest fire, so the trees release most of their seeds only after a fire has passed through. Jack pine seedlings grow quickly in full sun but poorly in shade, and the trees rarely live more than 150 years. Researchers who counted the growth rings of the trees in one stand in northern Ontario found that nearly all of them had begun growing within two or three years of one another, around 1911.",
      premise: "release most of their seeds only after a fire",
      evidence: "had begun growing within two or three years of one another",
      key: "A fire probably swept through the area shortly before the trees began to grow.",
      partial: "Logging probably cleared the area around 1911, letting sunlight reach young trees.",
      partialReason: "The sunlight detail fits, but without a fire the sealed cones would not have released the seeds.",
      reversed: "The trees probably began growing in the shade of older jack pines in the stand.",
      unsupported: "The trees probably grew from seeds that people planted in the area around 1911.",
    },
    {
      scene: "ii-norway-enamel-england-bone",
      about: "the woman whose tooth enamel matches water from Norway",
      text:
        "The chemical makeup of tooth enamel is fixed in childhood and reflects the water a person drank while the teeth were forming. Bone, by contrast, is continually rebuilt and reflects where a person lived during roughly the last decade of life. At a medieval cemetery in southern England, most of the people buried there show the local chemical signature in both teeth and bone. One woman's bones also match the local water, but her tooth enamel matches water from a region of Norway.",
      premise: "fixed in childhood",
      evidence: "her tooth enamel matches water from a region of Norway",
      key: "She probably spent her childhood in Norway and her last years in southern England.",
      partial: "She probably lived in Norway all her life and was brought to England only for burial.",
      partialReason: "This uses the enamel but ignores her bones, which show that she lived near the cemetery late in life.",
      reversed: "She probably grew up in southern England and moved to Norway later in her life.",
      unsupported: "She probably lived near the cemetery for her whole life, like most people buried there.",
      unsupportedReason: "Her enamel shows that she drank Norwegian water as a child, so she did not spend her whole life near the cemetery.",
    },
    {
      scene: "ii-sparrow-late-tutor",
      about: "the laboratory-raised sparrows",
      text:
        "Young white-crowned sparrows learn their songs by listening to adult males during a sensitive period that ends when the birds are about fifty days old; after that, they cannot learn a new song. Each population of the species sings its own dialect, which young birds normally pick up from the adults around them. In one study, researchers raised sparrows from a single population in a laboratory, where they heard no adult sparrows except in recordings of a different population's dialect, played to them only between the ages of sixty and ninety days.",
      premise: "a sensitive period that ends when the birds are about fifty days old",
      evidence: "only between the ages of sixty and ninety days",
      key: "They most likely did not learn the dialect that was played to them in the recordings.",
      partial: "They most likely learned to sing the dialect that was played to them in the recordings.",
      partialReason: "This ignores the timing: the recordings began after the period in which the birds could learn a song.",
      reversed: "They most likely sang the dialect of the population from which they themselves came.",
      reversedReason: "The birds never heard adults of their own population, so nothing suggests they learned that dialect.",
      unsupported: "They most likely learned the recorded dialect more quickly than wild sparrows would.",
    },
    {
      scene: "ii-fabriano-watermark-letter",
      about: "the letter signed \"your brother\"",
      text:
        "Paper made in European mills from the 1300s onward often carries a watermark, a faint design pressed into each sheet as it is made. Because a mill replaced its molds every few years, a particular watermark can usually be dated to a short span of years. Paper was expensive, and studies of dated documents suggest that it was rarely stored for long before being used. A letter in a Florentine archive, signed only \"your brother,\" is written on paper bearing a watermark that a mill in Fabriano used only between 1452 and 1458.",
      premise: "can usually be dated to a short span of years",
      evidence: "used only between 1452 and 1458",
      key: "It was probably written during the 1450s or not long afterward.",
      partial: "It could just as easily have been written a century after its paper was made.",
      partialReason: "This ignores the text's point that paper was rarely stored for long before being used.",
      reversed: "It was probably written before 1452, when the mill began using the watermark.",
      unsupported: "It was probably written by a papermaker who worked at the mill in Fabriano.",
    },
    {
      scene: "ii-lake-serin-barley-pollen",
      about: "barley farming near Lake Serin",
      text:
        "Each major eruption of the volcano Mount Kora spread a layer of ash with a distinctive chemical makeup across the surrounding region, and geologists have dated each layer precisely. Sediment on the bottom of a lake builds up in order, with older material lying beneath younger material. In a core drilled from nearby Lake Serin, a layer of ash from Kora's eruption of 3,400 years ago lies about 30 centimeters above the lake's oldest sediment. Pollen from domesticated barley appears in the sediment above that ash but nowhere below it.",
      premise: "older material lying beneath younger material",
      evidence: "appears in the sediment above that ash but nowhere below it",
      key: "It probably began near the lake no earlier than about 3,400 years ago.",
      partial: "It probably began at about the same time that the lake itself first formed.",
      partialReason: "The ash lies 30 centimeters above the lake's oldest sediment, so the lake is older than the ash and the barley.",
      reversed: "It probably began near the lake long before Kora's eruption 3,400 years ago.",
      unsupported: "It was probably ended for good by the ash from Kora's eruption.",
    },
    {
      scene: "ii-talomi-food-loanwords",
      about: "potatoes in the Talomi-speaking valley",
      text:
        "Languages often take their words for new foods from the people who introduce those foods. In the Talomi language, spoken in a remote river valley, the words for potato, maize, and tomato closely resemble the Spanish words, while the words for rice and banana resemble Portuguese words. Historical records show that Portuguese traders visited the valley in the 1500s, and that Spanish missionaries first arrived in the 1600s and remained for two centuries.",
      premise: "take their words for new foods from the people who introduce those foods",
      evidence: "Spanish missionaries first arrived in the 1600s",
      key: "They were probably introduced to the valley later than rice was.",
      partial: "They were probably grown in the valley before any outsiders arrived.",
      partialReason: "A borrowed word for a food points to outsiders introducing it, which this ignores.",
      reversed: "They were probably introduced by the Portuguese traders of the 1500s.",
      unsupported: "They were probably the first food that Spanish speakers brought to the valley.",
    },
    {
      scene: "ii-tessa-cluster-lifetimes",
      about: "the stars of the cluster Tessa-7",
      text:
        "A star's color depends on the temperature of its surface: the hottest stars glow blue-white, stars like the Sun look yellow, and the coolest stars look red. Among stars that are still fusing hydrogen in their cores, hotter stars are also more massive, and more massive stars burn through their fuel far faster, so they have much shorter lives. Astronomers studying the young cluster Tessa-7 found both blue-white and yellow stars there, all still fusing hydrogen in their cores.",
      premise: "the hottest stars glow blue-white",
      evidence: "found both blue-white and yellow stars there",
      key: "Its blue-white stars will probably run out of fuel before its yellow stars do.",
      partial: "Its blue-white stars have probably existed for longer than its yellow stars have.",
      partialReason: "This confuses how long a star will last with how long it has already existed.",
      reversed: "Its yellow stars are probably more massive than its blue-white stars are.",
      unsupported: "All of its stars will probably stop fusing hydrogen at about the same time.",
    },
    {
      scene: "ii-wood-frog-glycogen",
      about: "the wood frogs that entered winter after the drought",
      text:
        "Wood frogs survive winter frozen solid: as ice forms in their bodies, their livers flood their blood with glucose, which keeps the cells themselves from freezing. Frogs that cannot raise their glucose levels enough die when frozen. The liver can make this glucose only from glycogen, an energy store the frog builds up by feeding in late summer and autumn. After a summer drought in which insects were scarce, biologists found that many wood frogs entered winter with unusually small glycogen stores.",
      premise: "their livers flood their blood with glucose",
      evidence: "entered winter with unusually small glycogen stores",
      key: "They were at greater risk than usual of dying if they froze that winter.",
      partial: "They were protected from freezing because glucose keeps their cells from freezing.",
      partialReason: "This ignores that glucose comes from glycogen, which these frogs lacked.",
      reversed: "They probably produced more glucose than usual to make up for the drought.",
      unsupported: "They probably spent the winter in deep water, where they would not freeze.",
    },
    {
      scene: "ii-velmar-silver-cup",
      about: "the silver cup",
      text:
        "In the city of Velmar during the 1400s, the silversmiths' guild required every silver piece sold in the city to bear two stamps: the maker's personal mark and the city's mark, which guild inspectors added only after testing the metal's purity. Pieces that failed the test were melted down. Records show that some Velmar smiths also made pieces on commission for patrons in other cities. A silver cup now in a private collection bears the personal mark of the Velmar silversmith Joos Verhaegen but no city mark.",
      premise: "added only after testing the metal's purity",
      evidence: "but no city mark",
      key: "It was probably made for a patron outside Velmar rather than for sale in the city.",
      partial: "It probably failed the guild's test of purity, so it never received the city mark.",
      partialReason: "Pieces that failed the test were melted down, so a surviving cup is unlikely to have failed it.",
      reversed: "It was probably tested by the guild's inspectors and found to be pure.",
      unsupported: "It was probably made by some other smith who copied Verhaegen's mark.",
    },
    {
      scene: "ii-scarlet-mountain-sage",
      about: "the mountain sage",
      text:
        "Honeybees cannot see the color red, though they are highly sensitive to ultraviolet light, which is invisible to people. Many flowers that look plain to us have ultraviolet patterns that guide bees to their nectar. Hummingbirds, by contrast, see red well, and many flowers pollinated mainly by hummingbirds are bright red. A botanist studying a mountain sage with scarlet flowers found that the flowers have no ultraviolet patterns and are rarely visited by bees.",
      premise: "Honeybees cannot see the color red",
      evidence: "have no ultraviolet patterns and are rarely visited by bees",
      key: "It is probably pollinated mainly by hummingbirds rather than by bees.",
      partial: "Its scarlet color probably helps bees find their way to its nectar.",
      partialReason: "The text says honeybees cannot see red, so the flower's color would not guide them.",
      reversed: "It probably attracts bees with ultraviolet patterns that people cannot see.",
      unsupported: "Its nectar is probably harmful to the bees that try to feed on it.",
    },
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
    tricks: ["too-narrow", "opposite-stance"],
    build(t) {
      const topic = t.pick(SEPARATED_PREMISE_TOPICS);
      const wrong = [
        [topic.partial, topic.partialReason],
        [topic.reversed, topic.reversedReason || "This runs against what the text states; combining its facts leads the other way."],
        [topic.unsupported, topic.unsupportedReason || "Nothing in the text supports this; it adds a possibility the text gives no reason to believe."],
      ];
      return mc("Hard", topic, {
        stimulus: passage(topic.text),
        stem: `Based on the text, what can most reasonably be inferred about ${topic.about}?`,
        correct: topic.key,
        wrong,
        explanation:
          `The text states early on that "${topic.premise}" and later that "${topic.evidence}". Neither fact settles the question alone; together they support: ${topic.key}`,
        steps: [
          "Identify the general fact the text states before it reaches the case.",
          "Identify what the text reports about the case itself.",
          "Combine the two, and reject choices that use only one of them or that the text contradicts.",
        ],
        principles: [
          "A reasonable inference must fit every relevant statement in the text, not just the nearest one.",
          "When a detail fits an alternative explanation, check it against the rest of the text before accepting it.",
        ],
        trap: "Seizing on the last sentence, or on a detail that fits an alternative, without checking it against the fact stated at the start.",
        hint: "What does the first sentence tell you that the last sentence does not?",
        verify: () => {
          const start = topic.text.indexOf(topic.premise);
          const end = topic.text.indexOf(topic.evidence);
          return (
            inOrder(topic.text, [topic.premise, topic.evidence]) &&
            end - (start + topic.premise.length) > 60 &&
            allDistinct(topic.key, wrong)
          );
        },
      });
    },
  };

  return [
    ruleToCase,
    causeEffect,
    experimentComparison,
    characterAction,
    competingExplanations,
    evidenceLimit,
    separatedPremises,
  ];
});
