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
      key: "Botanists would classify it as deciduous even though it is a conifer.",
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
      broad: "Most igneous rocks are probably black and glassy, as it is.",
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
      broad: "Most English words about food probably came from French too.",
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
      key: "It did not end the filibuster, even though most senators voted for it.",
      reversed: "It ended the filibuster because most senators supported it.",
      broad: "Like most cloture votes, it failed to end a filibuster.",
      unsupported: "It was the first cloture vote held that session.",
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
      reversed: "turtles keep returning to nesting sites whose distinctive smell has stayed the same",
      reversedReason: "The nesting sites moved along the coast with the drifting field, so the turtles did not keep to the same spots.",
      extreme: "turtles rely on magnetic cues alone and cannot detect smells of any kind",
      both: "turtles no longer return to nest near the stretch of coast where they hatched",
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
      reversed: "radio and television were probably the main cause of the change in the island's vowels",
      reversedReason: "Islanders who heard just as much radio and television but stayed home kept the old vowels, which counts against this.",
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
      extreme: "blue tails have been shown to stop adult males from ever attacking juveniles",
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
      key: "A fire probably swept through the area shortly before nearly all of the trees began to grow.",
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
      key: "They were probably introduced to the valley later than rice and bananas were.",
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
      key: "They faced a greater risk than usual of dying if they froze during that winter.",
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
      premise: "required every silver piece sold in the city to bear two stamps",
      evidence: "but no city mark",
      key: "It was probably made on commission for a patron outside Velmar, not for sale in the city.",
      partial: "It probably failed the guild's test of purity, so it never received the city mark.",
      partialReason: "Pieces that failed the test were melted down, so a surviving cup is unlikely to have failed it.",
      reversed: "It was probably tested by the guild's inspectors and found to be pure.",
      reversedReason: "Inspectors added the city mark once a piece passed the test, so a cup found pure would carry the city mark that this cup lacks.",
      unsupported: "It was probably made by some other smith who copied Verhaegen's mark.",
      // The key rests on the sale rule and the commissions sentence; the
      // melting-down sentence only rules out the partial choice.
      explanation:
        "The guild required the city mark only on pieces sold in Velmar, and records show that Velmar smiths also made pieces on commission for patrons in other cities. A cup with Verhaegen's own mark but no city mark fits a piece made for such a patron. It cannot be a piece that failed the purity test, because failed pieces were melted down.",
    },
    {
      scene: "ii-scarlet-mountain-sage",
      about: "the mountain sage",
      text:
        "Honeybees cannot see the color red, though they are highly sensitive to ultraviolet light, which is invisible to people. Many flowers that look plain to us have ultraviolet patterns that guide bees to their nectar. Hummingbirds, by contrast, see red well, and many flowers pollinated mainly by hummingbirds are bright red. A botanist studying a mountain sage with scarlet flowers found that the flowers have no ultraviolet patterns and are rarely visited by bees.",
      premise: "Honeybees cannot see the color red",
      evidence: "have no ultraviolet patterns and are rarely visited by bees",
      key: "It is probably pollinated mainly by hummingbirds instead of bees.",
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
        explanation: topic.explanation ||
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
        trap: "Seizing on the last sentence, or on a detail that fits an alternative, without checking it against the fact stated earlier in the text.",
        hint: "Which general fact stated earlier in the text applies to the case described at the end?",
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
        ["It is well founded, since a man of fortune would naturally conceal his wealth.", "This adopts Mrs. Dunstable’s reasoning; the cheap attic, the long working days, and his remark about the theater point instead to limited means."],
        ["It is shared by her sister, who keeps a boarding house and knows lodgers well.", "Her sister says nothing, and her experience with lodgers makes that silence read as doubt, not agreement."],
        ["It arose because the lodger told her that he was traveling under an assumed name.", "Nothing shows that the lodger claimed anything; the belief is Mrs. Dunstable’s own conclusion from his habits."],
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
        ["She suspects that the schoolmaster, like the two men before him, will leave before winter.", "That suspicion explains her question, but her promise of a second cake comes only after he says he has ordered his coal, which suggests the suspicion has eased."],
        ["She hopes to learn from the schoolmaster whether the roads will be mended by November.", "The hope about the roads belonged to an earlier schoolmaster; Mrs. Pell never asks about them."],
        ["She regrets having waited a fortnight before calling upon the new schoolmaster.", "Nothing in the passage indicates regret; the delay fits her caution about newcomers who do not stay."],
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
        ["He had grown fond of his uncle but could no longer bear the dull routine at Fellbridge.", "He bore the sermons, the dogs, and the mutton all winter; what changes in March is his uncle’s recovery, which is exactly when he leaves."],
        ["He was called back to London by business he had set aside during his uncle’s illness.", "This takes the nephew’s excuse at face value, though the narrator has the business become pressing the moment the uncle recovers."],
        ["He left because the housekeeper had begun to suspect the true reason for his visit.", "The housekeeper only praises his attentiveness; nothing shows that she suspects him."],
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
        ["It is favorable, as her unusual silence on the subject of her new mistress indicates.", "This is the younger maids’ reading; the cook, who knows Martha best, points to a quiet disobedience that suggests the opposite."],
        ["It is not yet settled, since Mrs. Lyle has only recently come to the Grange.", "Nothing says that Mrs. Lyle has only just arrived, and Martha’s deliberate return to the old routine suggests her mind is made up."],
        ["It has led her to resolve to leave the Grange rather than obey Mrs. Lyle.", "Martha quietly keeps the old routine; nothing indicates that she means to leave her place."],
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
        ["It had been lit each night by the keeper’s daughter as a signal to one of the fishermen.", "The text says that she sat up reading; nothing suggests the lamp was a signal to anyone."],
        ["It had given the fishermen a surer guide home than the lighthouse’s own great light.", "The fishermen steered by it as much as by the lighthouse, not more; this overstates what the text says."],
        ["It was blamed by the village for the wrecks, since the keeper had failed to tend it.", "The text says that no one blamed the keeper, and the lamp was his daughter’s reading light, not one of his duties."],
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
        ["They secure the memory of the great men they honor for as long as the bronze endures.", "This is what the town supposes when it raises the statue; the author says the event seldom bears it out."],
        ["They are noticed only by strangers, who alone trouble to read the names cut into their bases.", "Only strangers read the name, but the author says the statue itself is remembered by everyone."],
        ["They should give way to public editions of the great man’s books, by which he is remembered.", "The author observes that the man is remembered through his books but proposes nothing about replacing statues."],
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
        ["His knowledge was of greater value than the laboratory worker’s, being drawn from living creatures.", "The author says neither kind of knowledge is to be despised; he ranks neither above the other."],
        ["He understood better than the laboratory worker how the wing of a bird is made.", "The author assigns knowledge of how a wing is made to the laboratory, not to the hedgerow."],
        ["His methods could answer questions about birdsong that no one has since thought worth asking.", "The author says the laboratory cannot answer such questions, not that no one asks them any longer."],
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
        ["They succeed in returning an old house to the state in which its first builders left it.", "This is the owner’s aim; the author argues that the result is a house that existed at no single moment."],
        ["They are justified when the additions removed are recent, like a Victorian tenant’s porch.", "The author makes no exception for recent additions; the Victorian porch is one of the intrusions he calls the history of the house."],
        ["They fail chiefly because modern workmen cannot match the skill of the original builders.", "The author objects to what restorers remove, not to the quality of their work; workmanship is never mentioned."],
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
        ["He has come to prefer ugly teapots to beautiful ones as his taste has changed.", "He pays for the ugly teapot because it is missing from his series, not because it is ugly; nothing shows that his taste now favors ugliness."],
        ["He loves his teapots more deeply now than he did when he first began collecting.", "The author suggests the reverse: the collector might not even stop for the kind of teapot that first charmed him."],
        ["He buys teapots chiefly as investments that he expects to rise in value.", "The text mentions the high price he pays, not any hope of profit; it explains his purchases by the gaps in his series."],
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
    difficulty: "Hard",
    title: "Inference from older prose whose point is carried by irony or structure",
    recognize:
      "Read past the surface statement: a later detail qualifies or undercuts an earlier one, and the inference is what the two together imply, no more.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["misattributed-view", "too-broad", "opposite-stance"],
    build(t) {
      const topic = t.pick(PERIOD_PROSE_TOPICS);
      const content = `${PERIOD_HEADERS[topic.kind]}\n\n${topic.text}`;
      const wrong = topic.wrong;
      return mc("Hard", topic, {
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
      scene: "ii-inf-qual-morlaix-hearth-rolls",
      text:
        "Historians of the duchy of Morlaix have long relied on its hearth-tax rolls, which list every household required to pay the tax. Because the tax fell only on households that owned their dwellings, tenants and servants appear in the rolls only if they later acquired property. Examining the rolls, historian Elise Varnier found that the number of households listed rose by about a third between 1620 and 1660. Taken together, these points indicate that the rise Varnier documented reflects ______.",
      anchors: ["fell only on households that owned their dwellings", "rose by about a third"],
      key: "an increase in property-owning households, which need not mean the population grew",
      wrong: [
        ["growth of about a third in the duchy’s total population over those four decades", "The rolls count only households that owned their dwellings, so a rise in listed households need not mean the whole population grew, let alone by a third."],
        ["a decline in the number of tenants and servants living in the duchy after 1620", "Some tenants may have become owners, but the rolls never list tenants who remained tenants, so no decline among them can be read from the rolls."],
        ["an increase in the number of households that the tax collectors failed to record", "Households the collectors failed to record could not raise the number listed; nothing suggests the rolls grew less complete."],
      ],
      explanation:
        "The rolls list only households that owned their dwellings (second sentence), so the one-third rise Varnier found (third sentence) is a rise in owner households. Whether the duchy’s total population changed is a separate question the rolls cannot answer.",
      trap: "Treating a count of property-owning households as a count of everyone in the duchy.",
    },
    {
      scene: "ii-inf-qual-lenby-flood",
      text:
        "Studying a century of records for the Ossery River, hydrologist Tomas Adeyemi found that the river overtops its banks at the town of Lenby only when two conditions coincide: more than 60 millimeters of rain falling upstream in a single day, and a high tide at the river’s mouth strong enough to slow the river’s outflow. Tides of that strength, his records show, occur on about four days in a typical month. If forecasters in Lenby learn that 75 millimeters of rain fell upstream today, they can conclude that ______.",
      anchors: ["only when two conditions coincide", "75 millimeters of rain fell upstream"],
      key: "Lenby could flood, but only if a strong high tide coincides with the rain",
      wrong: [
        ["Lenby will flood, since more than 60 millimeters of rain has fallen upstream", "Heavy upstream rain is necessary for a flood but not enough by itself; Adeyemi found that a strong high tide must coincide with it."],
        ["Lenby cannot flood today, since tides strong enough to slow the river are rare", "Such tides come about four days a month: uncommon, not impossible, so a flood remains possible."],
        ["Lenby is about four times as likely to flood as on a day with less rain", "The figure of four days a month describes how often strong tides occur; the text supports no comparison of this kind."],
      ],
      explanation:
        "Adeyemi’s finding makes heavy upstream rain necessary but not sufficient: a strong high tide must coincide with it. Today’s 75 millimeters meets the first condition, so a flood is possible, but whether it happens depends on the tide.",
      trap: "Treating heavy rain, which a flood requires, as if it were enough to cause one by itself.",
    },
    {
      scene: "ii-inf-qual-carrow-beetles",
      text:
        "On the island of Carrow, a ground beetle forages only at night during summer, when daytime surface temperatures exceed what it can tolerate; in the cooler months of spring and autumn, the same beetles forage by day. The owls that live on the island hunt only after dark. Ecologist Ines Galvão found that ground beetles made up nearly half of the owls’ prey in summer but almost none of it in spring and autumn. Galvão’s observations suggest that the owls’ seasonal change in diet reflects ______.",
      anchors: ["the same beetles forage by day", "hunt only after dark"],
      key: "the beetles’ shift to foraging by day, when the owls do not hunt, in the cooler months",
      wrong: [
        ["a steep decline in the number of beetles living on the island during spring and autumn", "The text explains the change through when the beetles are active and gives no evidence that their numbers fall."],
        ["the owls’ habit of hunting beetles by day during the island’s cooler months", "The owls hunt only after dark, so they cannot be taking beetles by day in any season."],
        ["the beetles’ inability to tolerate the island’s night temperatures in summer", "It is daytime heat that the beetles cannot tolerate in summer, which is why they forage at night then."],
      ],
      explanation:
        "The beetles forage at night only in summer and by day in spring and autumn (first sentence), and the owls hunt only after dark (second). The owls therefore meet foraging beetles mainly in summer, which accounts for the change in diet without any change in beetle numbers.",
      trap: "Reaching for a change in how many beetles there are, when the text explains a change in when they are active.",
    },
    {
      scene: "ii-inf-qual-harl-marsh-frog",
      text:
        "Surveyors checking whether a rare frog still lives in Harl Marsh use automated recorders that detect the male’s distinctive mating call. Only males call, and they do so only on nights when the air temperature stays above 12°C. Last year the recorders ran on thirty nights, all in early spring, when night temperatures in the marsh never rose above 9°C, and they detected no calls. The survey’s result therefore ______.",
      anchors: ["only on nights when the air temperature stays above 12°C", "never rose above 9°C"],
      key: "is no evidence that the frog is absent, since the nights were too cold for males to call",
      wrong: [
        ["shows that no males of the species were present in the marsh during the survey", "Males call only above 12°C, and every survey night was colder, so the recorders would have heard nothing even if males were present."],
        ["shows that the marsh still supports females of the species but no longer supports males", "The recorders cannot detect females at all, and the males’ silence is explained by the cold, so the survey shows nothing about either sex."],
        ["indicates that the frog is absent from the marsh in early spring but not in summer", "The survey gives no evidence of absence in any season, and it says nothing about summer."],
      ],
      explanation:
        "Only males call, and only above 12°C (second sentence); every survey night stayed at or below 9°C (third). The recorders would have heard nothing whether or not frogs were present, so the silence is no evidence either way.",
      trap: "Reading silence on nights too cold for calling as proof that no frogs were there.",
    },
    {
      scene: "ii-inf-qual-ormsby-coin",
      text:
        "Beneath the stone floor of a medieval farmhouse at Ormsby, archaeologists found a coin from a mint that began operating in 1340. Because the stones lay undisturbed on top of the coin, the coin must have been dropped before the floor was laid. Historian Wen Liao notes that coins of this kind stayed in circulation for up to a century after they were struck, and that the mint went on striking them for several decades. Taken together, these points indicate that the floor was laid ______.",
      anchors: ["began operating in 1340", "stayed in circulation for up to a century"],
      key: "no earlier than 1340, though possibly many decades after that year",
      wrong: [
        ["in or shortly after 1340, the year the mint began striking its coins", "The coin gives only the earliest possible date; such coins circulated for up to a century, so it could have been dropped long after 1340."],
        ["before 1340, since the coin was found lying beneath the floor’s stones", "The coin lies beneath the floor, so it was dropped first, and a coin struck in 1340 or later cannot have been dropped before 1340."],
        ["no later than about 1440, when coins struck in 1340 left circulation", "The mint struck these coins for decades after 1340, and each could circulate for a century, so the text sets no such upper limit."],
      ],
      explanation:
        "The coin was dropped before the floor was laid (second sentence) and cannot have been struck before 1340 (first), so the floor is no earlier than 1340. Because such coins were struck for decades and circulated for up to a century (third), the floor could be much later.",
      trap: "Treating the coin’s earliest possible date as the date the floor was laid.",
    },
    {
      scene: "ii-inf-qual-brennau-fires",
      text:
        "In the city of Brennau, about 80 percent of homes are heated with gas and 20 percent with oil. Fire inspector Sara Lind reviewed the 500 home fires in Brennau over the past decade that were traced to heating equipment and found that 250 began in gas-heated homes and 250 in oil-heated homes. Lind’s figures indicate that, over the decade, any single oil-heated home in Brennau was ______.",
      anchors: ["80 percent of homes are heated with gas", "250 began in gas-heated homes"],
      key: "about four times as likely to have a heating fire as a gas-heated home was",
      wrong: [
        ["just as likely to have a heating fire as a gas-heated home, at 250 fires each", "The fires were split evenly, but gas-heated homes outnumber oil-heated ones four to one, so the chance for a single home is not equal."],
        ["less likely to have a heating fire, since gas heats most of the city’s homes", "Gas’s 250 fires are spread over four times as many homes, which makes a single gas-heated home less likely, not more likely, to have one."],
        ["about twice as likely to have a heating fire, since oil heats a fifth of homes", "Oil’s 250 fires fall on a fifth of the homes and gas’s 250 on four-fifths, a ratio of four to one, not two to one."],
      ],
      explanation:
        "Equal numbers of fires, 250 each, came from very unequal numbers of homes, 20 percent versus 80 percent. Oil-heated homes had as many fires among a quarter as many homes, so their rate per home was about four times that of gas-heated homes.",
      trap: "Comparing the raw counts of fires without accounting for how many homes use each fuel.",
    },
    {
      scene: "ii-inf-qual-tallis-irrigation",
      text:
        "A survey of farms in the Tallis Valley found that farms using a new drip irrigation system produced higher yields than farms without it. Agricultural economist Petra Holm points out, however, that almost every farm that adopted the system lies on the valley’s river terraces, whose soils are deeper and richer than those of the hillside farms. Comparing terrace farms with one another, Holm found no difference in yield between those that used the system and those that did not. Holm’s findings suggest that the valley-wide difference in yields ______.",
      anchors: ["lies on the valley’s river terraces", "found no difference in yield"],
      key: "reflects where the adopting farms are located more than any effect of the system",
      wrong: [
        ["shows that the system raises yields on hillside farms though not on terrace farms", "Almost no hillside farms used the system, so the survey offers no evidence about its effect there."],
        ["would disappear if every hillside farm in the valley adopted the system", "The evidence suggests the system itself adds little, so hillside farms adopting it would not close a gap that comes from their poorer soil."],
        ["shows that the system lowers yields on the valley’s deeper, richer soils", "Holm found no difference among terrace farms, which is not the same as finding lower yields with the system."],
      ],
      explanation:
        "The farms using the system are almost all terrace farms with better soil (second sentence), and among terrace farms the system made no difference (third). The valley-wide gap is therefore better explained by location and soil than by the irrigation system.",
      trap: "Crediting the irrigation system with a difference that the farms’ locations explain.",
    },
    {
      scene: "ii-inf-qual-arlen-testing",
      text:
        "Health officials in the province of Arlen report that recorded cases of a lung infection doubled between 2010 and 2020. In 2014, Arlen’s hospitals began testing every patient with breathing difficulties for the infection; before then, only patients with severe symptoms had been tested. Epidemiologist Omar Reyes found that the number of severe cases recorded each year, which were tested throughout the decade, stayed roughly constant. Reyes’s findings suggest that the doubling in recorded cases ______.",
      anchors: ["began testing every patient with breathing difficulties", "stayed roughly constant"],
      key: "largely reflects the counting of milder cases that the earlier testing missed",
      wrong: [
        ["shows that the infection became about twice as common in Arlen over the decade", "Recorded cases doubled partly because far more patients were tested after 2014; with severe cases steady, the records do not show that infections doubled."],
        ["shows that the infection itself became milder after hospitals changed their testing", "Milder cases make up more of the record because they began to be counted, not because the infection changed."],
        ["was caused by a rise in severe cases that followed the change in testing", "Reyes found that severe cases stayed roughly constant, so they cannot account for the doubling."],
      ],
      explanation:
        "Testing widened in 2014 from severe cases only to every patient with breathing difficulties (second sentence), while severe cases, tested all along, held steady (third). The added cases are therefore mostly milder ones that the old testing never counted.",
      trap: "Reading a rise in recorded cases as a rise in actual cases, despite the change in who was tested.",
    },
    {
      scene: "ii-inf-qual-dorran-factory",
      text:
        "Between 1900 and 1950, the share of Dorran’s workers who were employed in factories fell from 40 percent to 25 percent. Over the same period, historian Ana Kellett notes, the city’s total workforce tripled, largely because Dorran absorbed several neighboring towns. Kellett’s figures indicate that between 1900 and 1950, the number of factory workers in Dorran ______.",
      anchors: ["fell from 40 percent to 25 percent", "total workforce tripled"],
      key: "increased, even though factory work made up a smaller share of all jobs",
      wrong: [
        ["fell by more than a third, since their share dropped from 40 to 25 percent", "Those figures are shares of a workforce that tripled; 25 percent of the larger workforce is more workers than 40 percent of the original one."],
        ["tripled, keeping pace with the growth of the city’s workforce as a whole", "Factory workers fell as a share of the workforce, so their number grew more slowly than the workforce did."],
        ["stayed about the same while other kinds of employment grew rapidly", "A quarter of three times the workforce is nearly double 40 percent of the original workforce, so the number did not stay the same."],
      ],
      explanation:
        "In 1900 factory workers were 40 percent of the workforce; in 1950 they were 25 percent of a workforce three times as large, or 75 percent of the 1900 total. Their number nearly doubled even as their share fell.",
      trap: "Treating a falling share as a falling number when the whole it is a share of has grown.",
    },
    {
      scene: "ii-inf-qual-westmere-furniture",
      text:
        "The furniture that survives from eighteenth-century homes in the county of Westmere is made overwhelmingly of oak and walnut. Probate inventories from the period, which list the contents of each household at its owner’s death, record far more pine furniture than oak or walnut. Historian Clara Ives explains that pine, being cheap and soft, was seldom repaired when it broke and was often burned as firewood. Ives’s explanation implies that the surviving furniture ______.",
      anchors: ["record far more pine furniture", "often burned as firewood"],
      key: "overrepresents the costlier woods relative to what households owned",
      wrong: [
        ["shows that Westmere households generally preferred oak and walnut to pine", "The inventories show that households owned more pine; the surviving pieces reflect what lasted, not what people preferred."],
        ["proves that the probate inventories misrecorded what the furniture was made of", "Ives’s explanation reconciles the inventories with the surviving pieces; it gives no reason to doubt the inventories."],
        ["was mostly made of pine that was later covered with oak or walnut veneers", "Nothing in the text mentions veneers; this invents a way to reconcile the evidence."],
      ],
      explanation:
        "The inventories show that pine furniture was the most common (second sentence), but pine was seldom repaired and often burned (third), so little of it survived. The surviving pieces therefore overstate how much oak and walnut households owned.",
      trap: "Treating the pieces that happened to survive as a fair sample of what households owned.",
    },
    {
      scene: "ii-inf-qual-varnia-citizenship",
      text:
        "Under the Republic of Varnia’s citizenship law of 1921, a child born abroad became a Varnian citizen at birth if either parent was a Varnian citizen, unless that parent had lived outside Varnia for more than ten continuous years before the birth. Legal historian Petr Halas notes that the poet Liesl Orvanek was born abroad in 1930 to a Varnian father and a mother who was not Varnian, and that her father had left Varnia in 1918 and did not return until 1946. Under the 1921 law, then, Orvanek ______.",
      anchors: ["unless that parent had lived outside Varnia for more than ten continuous years", "had left Varnia in 1918"],
      key: "did not become a Varnian citizen at birth, as her father had been abroad too long",
      wrong: [
        ["became a Varnian citizen at birth, since her father was a Varnian citizen", "The law’s exception applies: her father had lived abroad for twelve years before her birth, more than the ten allowed."],
        ["became a Varnian citizen at birth through her mother rather than through her father", "Her mother was not a Varnian citizen, so she could pass on no Varnian citizenship."],
        ["lost her Varnian citizenship when her father returned to Varnia in 1946", "She never held Varnian citizenship under the 1921 law, and the law says nothing about losing it when a parent returns."],
      ],
      explanation:
        "Orvanek’s father was Varnian, which would ordinarily make her a citizen at birth, but he had lived abroad from 1918 until after her birth in 1930, twelve years, which triggers the law’s exception. Her mother was not Varnian, so no parent could pass on citizenship.",
      trap: "Applying the law’s main rule and overlooking its exception for parents long abroad.",
    },
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
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 2, synthesis: 0, trap: 2 },
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
  ];
});
