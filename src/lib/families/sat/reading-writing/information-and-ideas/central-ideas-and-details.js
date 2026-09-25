(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/reading-writing/information-and-ideas"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Central Ideas and Details templates (Information and Ideas): the main
  // idea of a text, and the details it states. The helpers every skill file
  // of the domain uses come from common.js.

  const { RW, passage, inOrder, allDistinct, mc } = C;

  /* ------------------------------------------------------------------ */
  /* Central Ideas and Details: main idea stated as a claim, then backed */
  /* ------------------------------------------------------------------ */

  // The text states one claim and supports it with two or three details.
  // `anchor` is part of the claim sentence; `detail` is the sentence the
  // too-narrow choice paraphrases, so both must appear in the passage.
  const STATED_CLAIM_TOPICS = [
    {
      scene: "ii-mangrove-nursery",
      text:
        "Mangrove forests, which grow along tropical coastlines, do more for fisheries than their muddy appearance suggests. The tangled roots that anchor the trees in shallow water shelter young fish from larger predators, and the leaves that fall and decay among those roots feed the small invertebrates that young fish eat. Surveys along one stretch of coast in Belize found several reef fish species to be far more abundant on reefs near mangroves than on similar reefs with no mangroves nearby. For many fish, the mangroves serve as a nursery before the fish move out to the reef as adults.",
      anchor: "serve as a nursery",
      detail: "leaves that fall and decay among those roots feed the small invertebrates",
      key: "Mangroves support reef fish populations by sheltering and feeding young fish before those fish move out to reefs.",
      narrow: "Mangrove leaves that decay among the trees' roots feed small invertebrates living in shallow water.",
      broad: "Coastal forests are the most important habitat for nearly every kind of fish that lives anywhere in the ocean.",
      assoc: "Mangrove roots anchor the trees so firmly that they protect nearby reefs from larger predators.",
    },
    {
      scene: "ii-roman-harbor-concrete",
      text:
        "Much modern concrete begins to crumble within decades when it is exposed to seawater, yet harbor walls built by the ancient Romans have stood in the Mediterranean for about two thousand years. Studies of cores drilled from those walls suggest that the Romans' recipe is the reason. The builders mixed lime with volcanic ash, and when seawater seeped into the hardened material, it reacted with the ash to grow new interlocking crystals. Rather than wearing the concrete down, the sea gradually made it stronger.",
      anchor: "the Romans' recipe is the reason",
      detail: "The builders mixed lime with volcanic ash",
      key: "Roman harbor concrete lasted because its ingredients reacted with seawater in ways that strengthened it.",
      narrow: "Roman builders combined lime with volcanic ash when they prepared concrete for their harbor walls.",
      broad: "Ancient building methods produced structures more durable than any that modern engineers are able to build.",
      assoc: "Researchers drilled cores from Roman harbor walls to learn where the builders obtained their volcanic ash.",
    },
    {
      scene: "ii-rural-library-internet",
      text:
        "In many small towns, the public library has become the main place where residents go online. A survey of rural libraries in one state found that more than half of their visitors came chiefly to use the computers or the building's wireless network rather than to borrow books. Visitors reported using those connections to apply for jobs, complete school assignments, and fill out government forms, tasks that increasingly can be done only online. Some libraries have extended their evening hours so that people can use the network after work.",
      anchor: "the main place where residents go online",
      detail: "fill out government forms",
      key: "Many small-town libraries now serve mainly as places where residents can get access to the internet.",
      narrow: "Some rural library visitors use the library's computers to fill out forms required by the government.",
      broad: "Books have become less important to people everywhere than the internet access that libraries provide.",
      assoc: "Rural libraries added wireless networks and longer evening hours in order to attract more book borrowers.",
    },
    {
      scene: "ii-hummingbird-torpor",
      text:
        "Hummingbirds burn energy faster than almost any other animal, and a cold night without food could starve one. They survive such nights by entering torpor, a state in which body temperature drops sharply and the heart slows. Researchers studying hummingbirds high in the Andes recorded body temperatures as low as 3.3°C in birds that later warmed up and flew off normally. By cutting its energy use through the coldest hours, torpor lets a hummingbird last until it can feed again at dawn.",
      anchor: "They survive such nights by entering torpor",
      detail: "recorded body temperatures as low as 3.3°C",
      key: "Torpor lets hummingbirds survive cold nights without food by sharply reducing the energy they use.",
      narrow: "Some hummingbirds in the Andes were found to have body temperatures as low as 3.3°C during torpor.",
      broad: "All small animals must lower their body temperatures at night in order to survive until morning.",
      assoc: "Hummingbirds feed at dawn because their hearts beat fastest during the coldest hours of the night.",
    },
    {
      scene: "ii-baghdad-paper",
      text:
        "The arrival of papermaking in Baghdad in the late 700s changed how the city's institutions kept and shared written information. The technique had reached the region from China by way of Samarkand. Because paper cost far less than parchment, government offices began keeping more detailed records, merchants could afford written agreements even for small transactions, and copyists could produce books in greater numbers. Within a few decades, the city supported a thriving market for books.",
      anchor: "changed how the city's institutions kept and shared written information",
      detail: "reached the region from China by way of Samarkand",
      key: "Inexpensive paper changed how Baghdad's offices, merchants, and copyists recorded and circulated writing.",
      narrow: "The technique of making paper reached Baghdad from China after passing through the city of Samarkand.",
      broad: "Paper was the single most important invention in the history of every society that adopted it.",
      assoc: "Parchment grew costly in Baghdad because government offices bought most of the supply for their records.",
    },
    {
      scene: "ii-sourdough-community",
      text:
        "A sourdough starter is a living community rather than a single ingredient. The mixture of flour and water hosts wild yeasts, which release the gas that makes bread rise, along with lactic acid bacteria, which produce the acids that give the bread its sour taste. A study of starters from bakers on four continents found that each contained its own mix of these microbes, shaped partly by the flour used and even by the microbes on the baker's hands. As a result, no two starters produce bread with quite the same flavor.",
      anchor: "a living community rather than a single ingredient",
      detail: "lactic acid bacteria, which produce the acids that give the bread its sour taste",
      key: "Each sourdough starter is its own mix of microbes, and that mix shapes the bread it makes.",
      narrow: "The lactic acid bacteria in a sourdough starter produce the acids that give the bread a sour taste.",
      broad: "Every food made from flour depends on wild microbes for its flavor, its texture, and its rise.",
      assoc: "Bakers on four continents rely on the same flour and the same microbes to make their sourdough starters.",
    },
    {
      scene: "ii-street-tree-cooling",
      text:
        "Street trees cool city neighborhoods in two ways. Their canopies block sunlight before it can heat pavement and walls, and their leaves release water vapor, which absorbs heat as it evaporates. On summer afternoons in one study of a desert city, sidewalks beneath dense tree cover were more than 10°C cooler than sidewalks in full sun. The effect lasts into the evening: blocks with many trees also recorded lower nighttime air temperatures than nearby blocks with few trees.",
      anchor: "Street trees cool city neighborhoods in two ways",
      detail: "more than 10°C cooler than sidewalks in full sun",
      key: "Street trees lower temperatures in city neighborhoods by shading surfaces and by releasing water vapor.",
      narrow: "In one desert city, sidewalks under dense tree cover were far cooler than sidewalks in full sun.",
      broad: "Planting trees is the only effective way for cities to reduce the temperatures their residents experience.",
      assoc: "Street trees release most of their water vapor in the evening, when nighttime air temperatures fall.",
    },
    {
      scene: "ii-woodblock-registration",
      text:
        "In eighteenth-century Japan, a simple registration system made full-color woodblock printing practical. Printers cut a separate block for each color, and each block had to line up exactly with the others or the colors would blur together. By carving an L-shaped notch and a straight notch into the same corners of every block, printers could place each sheet of paper in precisely the same position every time. With that method, workshops could turn out richly colored prints in large numbers and sell them cheaply.",
      anchor: "a simple registration system made full-color woodblock printing practical",
      detail: "Printers cut a separate block for each color",
      key: "Carved alignment notches allowed Japanese workshops to produce many full-color woodblock prints cheaply.",
      narrow: "Each color in a Japanese woodblock print required its own block, carved separately from the others.",
      broad: "Japanese printers invented nearly every technique that is used in color printing around the world today.",
      assoc: "Printers carved L-shaped notches into the corners of their prints as a decoration that buyers admired.",
    },
    {
      scene: "ii-salt-marsh-carbon",
      text:
        "Coastal salt marshes store carbon far more effectively than their small area might suggest. Each time the tide floods a marsh, it leaves behind sediment that buries dead roots and stems. Because the waterlogged soil contains little oxygen, the buried plant material decays very slowly, and the carbon it holds can stay locked away for centuries. Measured per hectare, some marshes bury carbon several times faster than mature forests do.",
      anchor: "store carbon far more effectively than their small area might suggest",
      detail: "the waterlogged soil contains little oxygen",
      key: "Salt marshes store large amounts of carbon because tides bury plant material where it decays slowly.",
      narrow: "The soil of a salt marsh contains little oxygen because it is waterlogged for much of the time.",
      broad: "Wetlands are the best tool that people have for addressing nearly every environmental problem on Earth.",
      assoc: "The tides that flood coastal salt marshes carry most of the marshes' carbon out to sea each day.",
    },
    {
      scene: "ii-manuscript-margins",
      text:
        "The margins of many medieval manuscripts reveal how readers actually used their books. Beside the main text, readers wrote corrections, summaries, references to other works, and even complaints about difficult passages. In one surviving copy of a legal handbook, at least four different people added notes over two centuries, each responding to the notes of earlier readers. Such markings show that manuscripts were often working tools, reshaped by each generation that studied them.",
      anchor: "reveal how readers actually used their books",
      detail: "at least four different people added notes over two centuries",
      key: "Notes in the margins of medieval manuscripts show that readers actively used and added to their books.",
      narrow: "One copy of a medieval legal handbook contains notes written by at least four different readers.",
      broad: "Medieval readers treated every book they owned as a flawed text that needed to be corrected.",
      assoc: "Medieval scribes left wide margins so that later readers could write summaries of the main text for others.",
    },
  ];

  const statedClaim = {
    ...RW,
    id: "central-idea-stated-claim",
    skill: "Central Ideas and Details",
    subskill: "main idea",
    difficulty: "Easy",
    title: "Main idea of a text that states its claim and supports it",
    recognize:
      "One sentence makes the claim and the rest supports it; the main idea restates that claim, not one of its supporting details.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["too-narrow", "too-broad", "word-association"],
    build(t) {
      const topic = t.pick(STATED_CLAIM_TOPICS);
      const wrong = [
        [topic.narrow, "This is one of the details the text uses to support its claim, not the claim itself."],
        [topic.broad, "The text makes a claim about one subject; this choice stretches it to a sweeping generalization the text never makes."],
        [topic.assoc, "This reuses words from the text but links them in a way the text never states."],
      ];
      return mc("Easy", topic, {
        stimulus: passage(topic.text),
        stem: "Which choice best states the main idea of the text?",
        correct: topic.key,
        wrong,
        explanation:
          `The text states its claim directly and devotes its remaining sentences to supporting it. The choice that restates that claim is: ${topic.key}`,
        steps: [
          "Find the sentence that every other sentence supports.",
          "Check each choice against that sentence rather than against a single detail.",
          "Reject choices that are narrower than the claim, broader than it, or not stated at all.",
        ],
        principles: [
          "A main idea covers the whole text; a supporting detail covers only part of it.",
          "A choice that uses the text's words can still say something the text does not.",
        ],
        trap: "Choosing a vivid supporting detail because it is clearly true, even though it is only part of the text.",
        hint: "Which sentence do all the others back up?",
        verify: () =>
          topic.text.includes(topic.anchor) && topic.text.includes(topic.detail) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Central Ideas and Details: a reason the text states, paraphrased   */
  /* ------------------------------------------------------------------ */

  // The question asks why something happens; the text states the reason in
  // one place (`reason`), and the key paraphrases it rather than quoting it.
  // `other` is a different fact the text also states, which the
  // true-but-irrelevant choice restates.
  const STATED_REASON_TOPICS = [
    {
      scene: "ii-arctic-fox-coat",
      text:
        "Arctic foxes change color with the seasons. In summer their fur is brown or gray, and in winter it turns white and grows much thicker. The white winter coat lets a fox creep up on lemmings and birds without being noticed against the snow, and its density allows the fox to sleep in the open at temperatures far below freezing. Foxes living along some coasts, where the snow melts quickly, instead keep a bluish-gray coat all year.",
      stem: "According to the text, how does the arctic fox's white winter coat help it hunt?",
      reason: "without being noticed against the snow",
      other: "sleep in the open at temperatures far below freezing",
      key: "It makes the fox hard for its prey to see when the ground is covered in snow.",
      otherChoice: "It is dense enough to keep the fox warm while it sleeps outdoors in the cold.",
      assoc: "It turns brown or gray so that the fox matches the color of plants in summer.",
      outside: "It lets the fox hunt along coasts, where the snow melts quickly in the spring.",
    },
    {
      scene: "ii-amsterdam-canal-houses",
      text:
        "Many old houses along Amsterdam's canals are remarkably narrow, some barely wider than a doorway, yet they extend far back from the street. Historians often explain the design by noting that in the seventeenth century, property there was taxed largely according to the width of its frontage on the canal, so owners who wanted more space built deeper and taller rather than wider. The steep, narrow staircases inside made moving furniture difficult, which is why many houses still have a beam and hook at the top of the facade for hoisting goods through the windows.",
      stem: "According to the text, why did many Amsterdam owners build deep, tall houses rather than wide ones?",
      reason: "taxed largely according to the width of its frontage",
      other: "narrow staircases inside made moving furniture difficult",
      key: "The amount of tax owed depended mostly on how much of the canal a building faced.",
      otherChoice: "Steep, narrow staircases made it hard to carry furniture up to the upper floors.",
      assoc: "The beams and hooks at the top of each facade could lift only narrow loads of goods.",
      outside: "The city wanted owners to fit as many houses as possible along each of its canals.",
    },
    {
      scene: "ii-emperor-penguin-huddle",
      text:
        "During the Antarctic winter, male emperor penguins spend about two months incubating eggs on the ice without eating. To survive the cold, they gather in tight huddles of hundreds or even thousands of birds. The penguins on the outside of a huddle are exposed to the wind, but the group shifts constantly, so each bird spends time both at the sheltered center and at the edge. Researchers have measured temperatures above 20°C inside huddles even when the surrounding air was far below freezing.",
      stem: "According to the text, why does each penguin in a huddle spend some time at its sheltered center?",
      reason: "the group shifts constantly",
      other: "incubating eggs on the ice without eating",
      key: "The huddle keeps moving, so the birds take turns at the middle and the edge.",
      otherChoice: "The penguins go without eating for the two months when they incubate their eggs.",
      assoc: "The sheltered center of the huddle is where the males keep all of their eggs warm.",
      outside: "Researchers move the birds around so that each one can be measured at the center.",
    },
    {
      scene: "ii-olive-oil-bottles",
      text:
        "Many producers of high-quality olive oil sell it in dark glass bottles or metal tins rather than in clear glass. Oil exposed to light develops stale, unpleasant flavors, because light speeds up reactions between the oil and oxygen, and dark containers block much of that light. Clear bottles do let shoppers see the oil's color, which some buyers use to judge quality, but experts note that color says little about how an oil will taste.",
      stem: "According to the text, why do many producers sell olive oil in dark containers?",
      reason: "light speeds up reactions between the oil and oxygen",
      other: "Clear bottles do let shoppers see the oil's color",
      key: "Dark containers limit the light that would otherwise make the oil's flavor go stale.",
      otherChoice: "Clear bottles allow shoppers to see the color of the oil before they buy it.",
      assoc: "The color of a dark bottle tells buyers how the oil inside it is likely to taste.",
      outside: "Metal tins and dark bottles cost less to ship than clear bottles of the same size.",
    },
    {
      scene: "ii-fresnel-lens",
      text:
        "Before the 1820s, lighthouses used mirrors to direct their light, and much of it was lost. The French physicist Augustin Fresnel designed a lens made of many concentric rings of glass, each angled to bend light into a single horizontal beam. Because it was built from thin rings rather than one thick piece of glass, the lens was lighter and absorbed less light than a solid lens of the same size would have. Lighthouses fitted with Fresnel lenses could be seen from more than twenty miles away.",
      stem: "According to the text, why was Fresnel's lens lighter than a solid lens of the same size?",
      reason: "built from thin rings rather than one thick piece of glass",
      other: "bend light into a single horizontal beam",
      key: "It was assembled from narrow bands of glass instead of a single solid block.",
      otherChoice: "It bent the light from the lamp into one beam that traveled out horizontally.",
      assoc: "It used a set of angled mirrors in place of the heavy glass of earlier lenses.",
      outside: "It could be seen by ships at sea from a distance of more than twenty miles.",
    },
    {
      scene: "ii-monarch-milkweed",
      text:
        "Monarch butterflies lay their eggs only on milkweed plants. Milkweed contains bitter chemicals that are toxic to many animals, but monarch caterpillars can eat the leaves without harm and store the chemicals in their bodies. As a result, both the caterpillars and the adult butterflies taste bad to birds. A bird that tries to eat a monarch usually vomits and afterward avoids insects with the monarch's orange-and-black pattern.",
      stem: "According to the text, why do birds tend to avoid monarch butterflies?",
      reason: "store the chemicals in their bodies",
      other: "lay their eggs only on milkweed plants",
      key: "Monarchs carry bitter chemicals from the milkweed that they ate as caterpillars.",
      otherChoice: "Monarchs lay their eggs only on milkweed, a plant that many animals avoid eating.",
      assoc: "Birds are unable to see the orange-and-black pattern on the wings of the monarch.",
      outside: "Adult monarchs fly too quickly and too high for most birds to be able to catch them.",
    },
    {
      scene: "ii-stepwell-stairs",
      text:
        "In the dry regions of western India, builders from about the seventh century onward constructed stepwells, deep stone structures in which long flights of steps lead down to the water. Because rain there falls mostly during a few months of monsoon, the water level in a well rises and falls dramatically over the year, and the steps allowed people to reach the water whatever its level. Many stepwells were also richly carved, and their shaded lower levels served as cool gathering places in the hot season.",
      stem: "According to the text, why did stepwells have long flights of steps?",
      reason: "reach the water whatever its level",
      other: "served as cool gathering places",
      key: "People needed a way to reach water whose level changed greatly over the year.",
      otherChoice: "The shaded lower levels gave people a cool place to gather in the hot season.",
      assoc: "Builders carved the long flights of steps mainly to display their skill with stone.",
      outside: "Steps made it easier for builders to carry heavy stone down into the deep wells.",
    },
    {
      scene: "ii-sleep-word-pairs",
      text:
        "In a study of how sleep affects memory, volunteers learned a list of word pairs in the evening and were tested on them the next morning. Those who slept normally recalled more pairs than those who were kept awake all night. The researchers attribute the difference to activity during deep sleep, when the brain appears to replay recently learned information and strengthen the connections that store it. Volunteers who were kept awake also reported feeling more irritable during the test.",
      stem: "According to the text, why do the researchers think the volunteers who slept recalled more word pairs?",
      reason: "the brain appears to replay recently learned information",
      other: "reported feeling more irritable",
      key: "During deep sleep, the brain seems to rehearse and reinforce what it has just learned.",
      otherChoice: "The volunteers who stayed awake all night felt more irritable when they took the test.",
      assoc: "The volunteers who slept learned the word pairs in the morning rather than the evening.",
      outside: "Those who slept had spent more time studying the list of word pairs before the test began.",
    },
    {
      scene: "ii-seed-vault-site",
      text:
        "The Svalbard Global Seed Vault, built into a mountain on a remote Norwegian island, stores duplicate samples of seeds from gene banks around the world. The site was chosen partly because the surrounding permafrost keeps the rock cold even if the vault's cooling system fails. The mountain also stands well above sea level, so the vault would stay dry even if polar ice melted substantially. Gene banks that deposit seeds in the vault keep ownership of their samples.",
      stem: "According to the text, why was a site high above sea level chosen for the seed vault?",
      reason: "would stay dry even if polar ice melted substantially",
      other: "permafrost keeps the rock cold",
      key: "The height protects the stored seeds from flooding if sea levels rise sharply.",
      otherChoice: "The permafrost keeps the rock around the vault cold if the cooling system fails.",
      assoc: "Gene banks keep ownership of the samples of seeds that they deposit in the vault.",
      outside: "A high site makes the vault easier for gene banks around the world to reach.",
    },
    {
      scene: "ii-bridge-expansion-joints",
      text:
        "Long steel bridges include gaps called expansion joints, often covered by interlocking metal plates that look like the teeth of two combs. Steel expands as it warms and contracts as it cools, and over a long span these changes can add up to more than a meter between a cold winter night and a hot summer day. Without the joints, the stresses would crack the roadway or bend the supports. The metal plates let cars cross the gaps smoothly while still allowing the bridge to move.",
      stem: "According to the text, why do long steel bridges need expansion joints?",
      reason: "Steel expands as it warms and contracts as it cools",
      other: "let cars cross the gaps smoothly",
      key: "They give the bridge room to lengthen and shorten as the temperature rises and falls.",
      otherChoice: "They allow cars and trucks to pass smoothly over the gaps in the roadway.",
      assoc: "They keep the steel of the bridge from warming up on hot summer days.",
      outside: "They make it easier for workers to replace damaged sections of the road surface.",
    },
  ];

  const statedReason = {
    ...RW,
    id: "detail-stated-reason-paraphrased",
    skill: "Central Ideas and Details",
    subskill: "supporting detail",
    difficulty: "Easy",
    title: "Reason stated once in the text and paraphrased in the key",
    recognize:
      "The text states the reason in one sentence; the key says the same thing in different words, while other choices restate a different fact from the text.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["true-but-irrelevant", "word-association"],
    build(t) {
      const topic = t.pick(STATED_REASON_TOPICS);
      const wrong = [
        [topic.otherChoice, "The text does say this, but it explains something else, not what the question asks about."],
        [topic.assoc, "This reuses details from the text but connects them in a way the text never does."],
        [topic.outside, "This may sound reasonable, but the text never gives it as the reason."],
      ];
      return mc("Easy", topic, {
        stimulus: passage(topic.text),
        stem: topic.stem,
        correct: topic.key,
        wrong,
        explanation: `The text gives the reason in one place ("${topic.reason}"). The key restates it in other words: ${topic.key}`,
        steps: [
          "Find the sentence that answers the question's \"why\" or \"how.\"",
          "Restate that sentence in your own words.",
          "Choose the option that matches the restatement, not one that repeats a different true detail.",
        ],
        principles: [
          "A detail question is answered by what the text says, not by what sounds plausible.",
          "A choice can be true according to the text and still not answer the question.",
        ],
        trap: "Picking an accurate detail from the text that answers a different question.",
        hint: "Which sentence in the text explains exactly what the question asks about?",
        verify: () =>
          topic.text.includes(topic.reason) &&
          topic.text.includes(topic.other) &&
          !topic.key.includes(topic.reason) &&
          allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Central Ideas and Details: an explicit fact about one character or  */
  /* object in a literary passage with several characters                */
  /* ------------------------------------------------------------------ */

  // `fact` is the fragment the key restates. `misplaced` is a fragment that
  // is true of someone or something else in the passage, which one
  // distractor wrongly attaches to the subject of the question.
  const LITERARY_FACT_TOPICS = [
    {
      scene: "ii-lit-beekeeper-apprentice",
      subject: "Jonah",
      text:
        "Old Mr. Farrow had kept bees on the hill for fifty years, and he still worked without gloves. His new apprentice, Jonah, wore two pairs and a veil besides, and he flinched every time a bee landed on his sleeve. \"They can tell when you're afraid,\" Mr. Farrow said, which did not help. Still, Jonah had come back every morning for three weeks, and on this morning, for the first time, he lifted a frame out of the hive by himself, holding it up to the light so he could see the golden cells.",
      fact: "Jonah had come back every morning for three weeks",
      misplaced: "had kept bees on the hill for fifty years",
      key: "He has returned to work with the bees every morning for three weeks.",
      misattributed: "He has kept bees on the hill for about fifty years.",
      opposite: "He works with the bees without gloves, just as his teacher does.",
      assoc: "He believes the bees can tell when a beekeeper is afraid of them.",
    },
    {
      scene: "ii-lit-station-sisters",
      subject: "Paula",
      text:
        "Beatriz arrived at the station forty minutes early, as she always did, and sat on the bench nearest the clock. Her sister Paula, who had never caught a train without running for it, was supposed to meet her there. Beatriz checked the departure board, then her ticket, then the board again. At four minutes before departure, Paula appeared at the far end of the platform, coat unbuttoned, a paper bag of oranges in one hand, waving as if nothing were the matter.",
      fact: "had never caught a train without running for it",
      misplaced: "arrived at the station forty minutes early",
      key: "She had never caught a train without having to run for it.",
      misattributed: "She had arrived at the station forty minutes before her train.",
      opposite: "She arrived with her coat buttoned and both of her hands free.",
      assoc: "She had checked the departure board and her ticket several times.",
      assocReason: "Beatriz, not Paula, checked the departure board and her ticket while she waited.",
    },
    {
      scene: "ii-lit-cracked-violin",
      subject: "the violin",
      text:
        "The violin had belonged to Mei's great-grandfather, and it had come out of storage with a crack running down its top. The repairer, a tall woman named Ms. Adair, turned it over slowly under her lamp. She told Mei that the crack could be closed but that the instrument would never sound exactly as it once had. Mei said she did not mind, since she had never heard how it once sounded anyway. Ms. Adair laughed and wrote \"three weeks\" on a tag, which she tied to the scroll.",
      fact: "come out of storage with a crack running down its top",
      misplaced: "had belonged to Mei's great-grandfather",
      key: "It had a crack down its top when it was taken out of storage.",
      misattributed: "It once belonged to the great-grandfather of Ms. Adair.",
      opposite: "It will sound exactly as it once did after the repair is done.",
      assoc: "It was played often by Mei before it was put into storage.",
    },
    {
      scene: "ii-lit-hailstorm-brothers",
      subject: "Luis",
      text:
        "The storm came in from the west in the late afternoon, a gray wall moving over the wheat. Hector's father stood at the edge of the field and said nothing, which was how Hector knew he was worried. Hector's younger brother, Luis, had already run to close the barn doors, as he had been told to do. When the first hail struck the roof of the truck, their father finally turned and walked back toward the house, and Hector followed, looking over his shoulder at the bending stalks.",
      fact: "Luis, had already run to close the barn doors",
      misplaced: "stood at the edge of the field and said nothing",
      key: "He had gone to close the barn doors, as he had been instructed.",
      misattributed: "He stood silently at the edge of the field as the storm came in.",
      opposite: "He stayed in the field to watch the hail strike the wheat stalks.",
      assoc: "He followed his father back to the house, looking over his shoulder.",
    },
    {
      scene: "ii-lit-gallery-seascape",
      subject: "the gray seascape",
      text:
        "Mr. Pell had guarded the museum's east gallery for eleven years. He knew which floorboards creaked and which painting visitors photographed most. His favorite, though, was a small gray seascape in the corner that almost no one stopped to see. Each morning before the doors opened, he stood in front of it for exactly one minute. He had never told anyone why, and when a new guard once asked him about it, he said only that the sea in it looked different every day.",
      fact: "almost no one stopped to see",
      misplaced: "which painting visitors photographed most",
      key: "It is a painting that visitors rarely stop to look at.",
      misattributed: "It is the painting that visitors photograph most often.",
      opposite: "It hangs in the center of the east gallery, near the door.",
      assoc: "It is repainted slightly by the museum staff every day.",
    },
    {
      scene: "ii-lit-county-fair-jam",
      subject: "Grandma Ruth's jam",
      text:
        "For the county fair, Grandma Ruth entered the same two things she entered every year: a jar of blackberry jam and a single enormous tomato. The tomato had never won. The jam had won six times, though she claimed not to care about ribbons. This year her neighbor, Mr. Castellano, entered a tomato of his own, and Ruth spent the week before the fair checking on hers each morning and evening, measuring it with a tailor's tape she kept in her apron pocket.",
      fact: "The jam had won six times",
      misplaced: "The tomato had never won",
      key: "It has won a ribbon at the county fair six times.",
      misattributed: "It has never won a ribbon at the county fair.",
      opposite: "It is entered this year by Mr. Castellano as well.",
      assoc: "It is measured each morning with a tailor's tape.",
    },
    {
      scene: "ii-lit-lost-dog",
      subject: "the dog",
      text:
        "The poster had been on the telephone pole for a month, the photograph faded almost white: a small brown dog with one ear up and one ear down. Every day on the way to school, Anjali read the phone number under it. On the thirty-first day she saw the dog itself, sitting outside the laundromat as if waiting for someone. It let her pick it up. She called the number from the laundromat, then carried the dog the six blocks to the address she was given, though her arms ached, rather than risk setting it down.",
      fact: "It let her pick it up",
      misplaced: "carried the dog the six blocks",
      key: "It allowed Anjali to pick it up outside the laundromat.",
      misattributed: "It walked beside Anjali for the six blocks to its home.",
      misReason: "The passage says Anjali carried the dog the six blocks; the dog did not walk them.",
      opposite: "It had two ears that both stood straight up.",
      assoc: "It had been waiting for Anjali outside her school.",
    },
    {
      scene: "ii-lit-unfinished-boat",
      subject: "the fourth boat",
      text:
        "Samuel had built three boats in his life, and all three still floated. The fourth sat on sawhorses in his garage, half-planked, where it had sat since his wife died two winters ago. His granddaughter Tessa, visiting for the summer, found the plans rolled up on a shelf and spread them across the kitchen table one evening. Samuel looked at them for a long time. The next morning Tessa woke to the sound of a hand plane and found him in the garage in yesterday's clothes.",
      fact: "half-planked, where it had sat since his wife died two winters ago",
      misplaced: "all three still floated",
      key: "It had sat unfinished in Samuel's garage for about two years.",
      misattributed: "It is one of the boats Samuel built that still float today.",
      opposite: "It was designed by Tessa during her visit that summer.",
      assoc: "It was stored on a shelf with its plans rolled up.",
    },
    {
      scene: "ii-lit-understudy",
      subject: "Clara",
      text:
        "For six weeks Maya had rehearsed the role of the queen without ever expecting to play it. She was the understudy; Clara, who had the part, had not missed a performance in years. Then, two hours before the Saturday show, Clara called in with a fever. The director found Maya in the costume shop sewing buttons onto a cape and simply held out the crown. Maya put down her needle. Her hands, she noticed, were perfectly steady.",
      fact: "had not missed a performance in years",
      misplaced: "sewing buttons onto a cape",
      key: "She had not missed a performance in years before she fell ill.",
      misattributed: "She was sewing buttons onto a cape in the costume shop.",
      opposite: "She had rehearsed the role of the queen as the understudy.",
      oppReason: "The passage says this about Maya, the understudy, not about Clara, who had the part.",
      assoc: "She held out the crown to Maya two hours before the show.",
      assocReason: "The director, not Clara, held out the crown to Maya in the costume shop.",
    },
    {
      scene: "ii-lit-ice-fishing",
      subject: "Arvid",
      text:
        "Every January, Arvid and his uncle drove out onto the frozen lake and set up their small wooden fishing shack. His uncle did the drilling; Arvid's job was to keep the stove going. This year, for the first time, his uncle handed him the auger. The ice was thicker than Arvid had expected, and his shoulders burned before he broke through, but when dark water finally welled up into the hole, his uncle clapped him on the back hard enough to make him stagger.",
      fact: "This year, for the first time, his uncle handed him the auger",
      misplaced: "His uncle did the drilling",
      key: "He drilled through the ice himself for the first time this year.",
      misattributed: "He has always done the drilling while his uncle kept the stove going.",
      opposite: "He found the ice on the lake much thinner than he had expected.",
      assoc: "He built the small wooden shack that he and his uncle use each year.",
    },
  ];

  const literaryFact = {
    ...RW,
    id: "detail-literary-explicit-fact",
    skill: "Central Ideas and Details",
    subskill: "supporting detail",
    difficulty: "Easy",
    title: "Explicit fact about one character in a passage with several",
    recognize:
      "The passage states the fact outright; the danger is attaching to this character something the passage says about someone or something else.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["true-but-irrelevant", "opposite-stance", "word-association"],
    build(t) {
      const topic = t.pick(LITERARY_FACT_TOPICS);
      const content = `The following text is from a short story.\n\n${topic.text}`;
      const wrong = [
        [topic.misattributed, topic.misReason || `The passage says this about someone or something other than ${topic.subject}.`],
        [topic.opposite, topic.oppReason || `The passage contradicts this: it states or shows something different about ${topic.subject}.`],
        [topic.assoc, topic.assocReason || "This borrows words and details from the passage but connects them in a way the passage does not."],
      ];
      return mc("Easy", topic, {
        stimulus: passage(content),
        stem: `According to the text, what is true about ${topic.subject}?`,
        correct: topic.key,
        wrong,
        explanation: `The passage states it directly ("${topic.fact}"), so the true statement is: ${topic.key}`,
        steps: [
          `Find every sentence that mentions ${topic.subject}.`,
          "Check each choice against what those sentences actually say.",
          "Reject choices that describe a different character or that the passage contradicts.",
        ],
        principles: [
          "An \"according to the text\" question is answered by a statement the text makes, not by inference.",
          "A detail can be accurate and still belong to the wrong character.",
        ],
        trap: "Choosing a detail that is in the passage but belongs to another character or object.",
        hint: `Reread only the sentences about ${topic.subject}.`,
        verify: () =>
          content.includes(topic.fact) && content.includes(topic.misplaced) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Central Ideas: a text that opens with a belief and then corrects it */
  /* ------------------------------------------------------------------ */

  // `belief`, `turn`, and `correction` are fragments that must occur in that
  // order: the popular belief, the signal that the text is turning against
  // it, and the evidence-backed correction the main idea restates.
  const CORRECTED_BELIEF_TOPICS = [
    {
      scene: "ii-goldfish-memory",
      text:
        "A familiar claim holds that goldfish can remember things for only a few seconds, which supposedly keeps them from growing bored in small bowls. Experiments tell a different story. In one study, goldfish learned to push a lever that released food, and when the lever was set to work for only one hour each day, the fish began gathering near it at the right time. Other goldfish trained to respond to a sound still reacted to it months after the training had ended.",
      belief: "remember things for only a few seconds",
      turn: "Experiments tell a different story",
      correction: "months after the training had ended",
      key: "Contrary to a popular claim, goldfish can learn things and remember them for months.",
      misconception: "Although goldfish can be trained, they remember what they learn for only a few seconds.",
      narrow: "Goldfish in one study gathered near a lever during the single hour each day when it released food.",
      overreach: "Goldfish grow bored in small bowls because they remember far more than people usually think.",
      overReason: "The text mentions boredom only as part of the popular claim; it never says that goldfish grow bored.",
    },
    {
      scene: "ii-great-wall-moon",
      text:
        "A popular claim holds that the Great Wall of China is the only human-made structure visible from the Moon. The idea is appealing, since the wall stretches for thousands of kilometers. But length is not what makes an object visible from far away; width and contrast with the surroundings matter more. Most sections of the wall are less than ten meters wide and built of materials similar in color to the land around them, and astronauts report that the wall is hard to pick out even from low orbit, far closer than the Moon.",
      belief: "the only human-made structure visible from the Moon",
      turn: "But length is not what makes an object visible",
      correction: "hard to pick out even from low orbit",
      key: "The Great Wall cannot be seen from the Moon, since it is narrow and blends in with the color of the land around it.",
      misconception: "Because it stretches for thousands of kilometers, the Great Wall is the only human-made structure visible from the Moon.",
      narrow: "Most sections of the Great Wall of China are less than ten meters wide and similar in color to the land.",
      overreach: "Astronauts in low orbit can probably see most other human-made structures more easily than the Great Wall.",
      overReason: "The text says only that the wall is hard to pick out from low orbit; it says nothing about how visible other structures are.",
    },
    {
      scene: "ii-bat-vision",
      text:
        "The phrase \"blind as a bat\" suggests that bats cannot see, perhaps because many species find their way in the dark by echolocation, listening for the echoes of their own calls. In fact, no bat species is blind. Large fruit bats, which do not echolocate at all, depend heavily on keen night vision to locate ripe fruit, and even species that echolocate use their eyes to navigate over long distances, such as when they return to a roost at dawn.",
      belief: "bats cannot see",
      turn: "In fact, no bat species is blind",
      correction: "use their eyes to navigate",
      key: "Despite a common saying, no bat species is blind, and many bats depend on their eyesight.",
      misconception: "Bats cannot see, which is why so many species find their way in the dark by echolocation.",
      narrow: "Large fruit bats do not use echolocation when they search for ripe fruit at night.",
      overreach: "Bats that echolocate see better at night than large fruit bats, which rely on their eyes instead.",
      overReason: "The text never compares the eyesight of the two kinds of bats; it says fruit bats depend heavily on keen night vision.",
    },
    {
      scene: "ii-medieval-round-earth",
      text:
        "Many people today believe that educated Europeans of the Middle Ages thought the Earth was flat and that Columbus set out to prove otherwise. The belief is understandable, since medieval maps often look strange to modern eyes. Yet scholars of the period routinely described the Earth as a sphere. A thirteenth-century textbook by Johannes de Sacrobosco, titled On the Sphere, explained the Earth's roundness to generations of university students. The dispute over Columbus's voyage concerned the size of the Earth, not its shape.",
      belief: "thought the Earth was flat",
      turn: "Yet scholars of the period routinely described the Earth as a sphere",
      correction: "concerned the size of the Earth, not its shape",
      key: "Educated Europeans in the Middle Ages generally knew that the Earth is a sphere.",
      misconception: "Until Columbus's voyage, educated Europeans of the Middle Ages believed that the Earth was flat.",
      narrow: "A thirteenth-century textbook by Sacrobosco explained the Earth's roundness to generations of university students.",
      overreach: "Medieval maps look strange today because their makers were unsure whether the Earth was round.",
      overReason: "The text says medieval scholars routinely described the Earth as a sphere; it never says mapmakers were unsure of its shape.",
    },
    {
      scene: "ii-knuckle-cracking",
      text:
        "A common warning holds that cracking one's knuckles causes arthritis. The popping sound, which is produced when a gas bubble forms in the fluid of a joint, does seem alarming. But studies comparing habitual knuckle crackers with people who never crack their knuckles have found no difference in their rates of arthritis in the hands. One physician even cracked the knuckles of only his left hand for more than sixty years and found no arthritis in either hand.",
      belief: "cracking one's knuckles causes arthritis",
      turn: "But studies comparing",
      correction: "found no difference in their rates of arthritis",
      key: "Studies have found no link between cracking one's knuckles and developing arthritis in the hands.",
      misconception: "Although it seems harmless at first, cracking one's knuckles eventually causes arthritis in the hands.",
      narrow: "The sound of cracking knuckles is produced when a gas bubble forms in the fluid of a joint.",
      overreach: "Cracking one's knuckles may help keep the joints of the hands free of arthritis over time.",
      overReason: "The studies found no difference in arthritis rates, which does not show that cracking protects the joints.",
    },
    {
      scene: "ii-camel-hump",
      text:
        "Because camels can go for days without drinking, many people assume that their humps are tanks of stored water. A hump actually holds fat, which a camel can break down for energy when food is scarce. The animals' endurance in the desert comes from other adaptations: their kidneys produce highly concentrated urine, and they can tolerate losing a quarter or more of their body water, far more than most mammals could survive.",
      belief: "their humps are tanks of stored water",
      turn: "A hump actually holds fat",
      correction: "comes from other adaptations",
      key: "Camels' humps hold fat, not water; other adaptations let camels go so long without drinking.",
      misconception: "Camels can go for days without drinking because their humps store water for them to use later.",
      narrow: "A camel's kidneys produce highly concentrated urine, which helps the animal conserve water.",
      overreach: "Camels probably could not survive in the desert at all if their humps held no fat.",
      overReason: "The text says the fat supplies energy when food is scarce; it never claims that camels could not survive without it.",
    },
    {
      scene: "ii-lightning-twice",
      text:
        "According to an old saying, lightning never strikes the same place twice. The saying may reflect how rarely any particular spot of open ground is hit. Tall, isolated structures, however, are struck again and again, because lightning tends to follow the shortest path to the ground. The Empire State Building in New York City, for example, is hit roughly twenty to twenty-five times in an average year.",
      belief: "lightning never strikes the same place twice",
      turn: "however, are struck again and again",
      correction: "roughly twenty to twenty-five times",
      key: "Contrary to an old saying, lightning often strikes the same place repeatedly, especially a tall structure.",
      misconception: "Lightning never strikes the same place twice, since any one spot of open ground is rarely hit.",
      narrow: "The Empire State Building is struck by lightning about twenty to twenty-five times in an average year.",
      overreach: "Tall buildings may draw lightning away from the open ground around them and so keep that ground safe.",
      overReason: "The text never says that tall buildings protect the ground nearby; it says only that they are struck again and again.",
    },
    {
      scene: "ii-viking-helmets",
      text:
        "Popular images show Viking warriors in horned helmets. The image dates largely from the nineteenth century, when costume designers for operas based on Norse legends gave singers horned headgear. Archaeologists, however, have found no horned helmets from the Viking Age. The one reasonably complete Viking helmet ever discovered, unearthed in Norway in 1943, is a rounded iron cap with a guard to protect the eyes and nose.",
      belief: "Viking warriors in horned helmets",
      turn: "Archaeologists, however, have found no horned helmets",
      correction: "a rounded iron cap",
      key: "The familiar image of horned Viking helmets comes from nineteenth-century operas, not from archaeological evidence.",
      misconception: "Although few survive, the helmets Viking warriors wore in battle were usually decorated with horns.",
      narrow: "A rounded iron Viking helmet with a guard for the eyes and nose was found in Norway in 1943.",
      overreach: "Viking warriors probably fought without helmets, since only one fairly complete helmet has been found.",
      overReason: "The text says one reasonably complete helmet survives; it never suggests that Vikings fought without helmets.",
    },
    {
      scene: "ii-sugar-hyperactivity",
      text:
        "Many parents are convinced that eating sugar makes children hyperactive. Yet controlled studies, in which neither the children nor the observers knew whether a drink contained sugar, have found no difference in children's behavior. Expectations may explain the belief. In one study, parents who were told that their child had just consumed sugar rated the child as more hyperactive than other parents did, even though every child had actually received a sugar-free drink.",
      belief: "eating sugar makes children hyperactive",
      turn: "Yet controlled studies",
      correction: "found no difference in children's behavior",
      key: "Sugar seems not to make children hyperactive; parents' expectations may explain the belief.",
      misconception: "Eating sugar makes children hyperactive, as many parents have seen for themselves at home.",
      narrow: "In one study, parents were told that their children had just consumed a drink containing sugar.",
      overreach: "Parents who expect hyperactive behavior cause their children to become hyperactive.",
      overReason: "The study showed that expectations changed how parents rated behavior, not that they changed the children's behavior.",
    },
    {
      scene: "ii-tongue-map",
      text:
        "Many textbooks once included a \"tongue map\" showing that sweetness is tasted at the tip of the tongue, bitterness at the back, and sourness and saltiness along the sides. The map traces back to a misreading of a German study published in 1901, which had reported only small differences in sensitivity from one region to another. In fact, taste buds containing receptors for every basic taste are found across the whole tongue.",
      belief: "sweetness is tasted at the tip of the tongue",
      turn: "In fact, taste buds",
      correction: "found across the whole tongue",
      key: "The tongue map is wrong, because receptors for every basic taste are found across the whole tongue.",
      misconception: "Each region of the tongue detects mainly one taste, such as sweetness at the tip or bitterness at the back.",
      narrow: "The tongue map traces back to a misreading of a German study of taste published in 1901.",
      overreach: "The German study of 1901 may have found larger differences in sensitivity than textbooks later reported.",
      overReason: "The text says the 1901 study reported only small differences, so this contradicts it.",
    },
  ];

  const correctedBelief = {
    ...RW,
    id: "central-idea-corrected-belief",
    skill: "Central Ideas and Details",
    subskill: "main idea",
    // Easy: the belief is flagged ("a popular claim holds") and the turn is
    // signposted, so the correction is found on reading. The unsupported
    // choice is sometimes hedged and sometimes not, and the key is sometimes
    // stated flatly, so neither absolutes nor hedges mark it.
    difficulty: "Easy",
    title: "Main idea of a text that corrects a popular belief",
    recognize:
      "The text opens with a belief only to overturn it; the main idea is the correction, not the belief the text spends its first sentence on.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["misattributed-view", "too-narrow", "too-broad"],
    build(t) {
      const topic = t.pick(CORRECTED_BELIEF_TOPICS);
      const wrong = [
        [topic.misconception, "This is the popular belief the text describes in order to correct it; the text argues against it."],
        [topic.narrow, "This is one piece of evidence the text offers, not the point the whole text makes."],
        [topic.overreach, topic.overReason],
      ];
      return mc("Easy", topic, {
        stimulus: passage(topic.text),
        stem: "Which choice best states the main idea of the text?",
        correct: topic.key,
        wrong,
        explanation:
          `The text opens with a widely held belief, then turns against it and supports the correction with evidence. The main idea is the correction: ${topic.key}`,
        steps: [
          "Notice whose view the opening sentence reports: a popular belief, not the author's.",
          "Find the turn (however, yet, in fact) and what the text says after it.",
          "Choose the correction, stated no more strongly than the evidence allows.",
        ],
        principles: [
          "A text can describe a view at length precisely in order to reject it.",
          "The main idea is what the evidence in the text supports, stated at its actual strength.",
        ],
        trap: "Choosing the belief described in the first sentence, as though the text endorsed it.",
        hint: "Does the author agree with the claim in the first sentence?",
        verify: () =>
          inOrder(topic.text, [topic.belief, topic.turn, topic.correction]) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Central Ideas: main idea of an original literary passage            */
  /* ------------------------------------------------------------------ */

  // Each passage turns on a shift in a character. `turn` is the fragment
  // where the shift happens and `detail` the fragment behind the too-narrow
  // choice; both must appear in the passage.
  const LITERARY_MAIN_TOPICS = [
    {
      scene: "ii-lit-piano-recital",
      text:
        "Nadia had practiced the sonata so often that her fingers seemed to know it without her. Still, when she walked onto the stage and saw the rows of strangers, her hands went cold, and she sat for a long moment without touching the keys. Then she noticed her grandmother in the third row, nodding slowly, as she did at home whenever Nadia began to play. Nadia breathed out, placed her hands, and started. By the second page she had stopped hearing the audience at all; there was only the music and, somewhere beyond it, the nodding.",
      turn: "Then she noticed her grandmother",
      detail: "her grandmother in the third row",
      key: "Nadia overcomes her fear onstage when the sight of her grandmother reminds her of playing at home.",
      narrow: "Nadia's grandmother sits in the third row of the audience during Nadia's recital.",
      opposite: "Nadia feels calm and confident onstage because she has practiced the sonata so many times at home.",
      beyond: "Nadia decides that she will never again perform a sonata in front of an audience.",
    },
    {
      scene: "ii-lit-orchard-notebook",
      text:
        "When his aunt left him the orchard, Tomas had planned to sell it by spring. He knew nothing about apples and had a job in the city that he liked well enough. But the lawyer had given him a notebook along with the deed, and in it his aunt had recorded forty years of harvests: the late frost of 1987, the summer the bees failed, the tree she had named after him on the day he was born. Tomas read it at the kitchen table until the light went. In the morning he walked out to find his tree, and he did not call the real estate agent.",
      turn: "But the lawyer had given him a notebook",
      detail: "the tree she had named after him",
      key: "Reading his aunt's record of the orchard leads Tomas to reconsider his plan to sell it.",
      narrow: "Tomas's aunt named one of the trees in her orchard after him on the day that he was born.",
      opposite: "Tomas remains determined to sell the orchard because he knows nothing about growing apples.",
      beyond: "Tomas's aunt had always hoped that he would give up his life in the city to become a farmer.",
    },
    {
      scene: "ii-lit-ferry-father",
      text:
        "I had always thought of my father as a man who was afraid of nothing. On the ferry that morning, though, as the island shrank behind us, he held the rail with both hands and would not look at the water. \"I never learned to swim,\" he said, as if admitting to a crime. I had lived with him for sixteen years and never known. I moved closer, not to comfort him exactly, but so that our shoulders touched, and we watched the mainland grow together.",
      turn: "\"I never learned to swim,\"",
      detail: "he held the rail with both hands",
      key: "The narrator learns of a fear in a father who had seemed fearless and responds with quiet support.",
      narrow: "The narrator's father holds the ferry's rail with both hands as the island shrinks behind them.",
      opposite: "The narrator is embarrassed by the father's fear and moves away from him on the ferry.",
      beyond: "The narrator decides to teach the father how to swim once the two of them have reached the mainland.",
    },
    {
      scene: "ii-lit-bakery-last-day",
      text:
        "On the bakery's last day, Mrs. Okonkwo baked the same six loaves she had baked every morning for thirty-one years. Customers she had not seen in months appeared at the counter, some carrying children who had grown too tall to lift. Each of them wanted to say something, and most said it badly: that the bread had been good, that the town would miss it. She wrapped each loaf in paper and thanked them. Only after the last customer had gone did she sit down on the flour sacks and let herself look at the empty shelves.",
      turn: "Only after the last customer had gone",
      detail: "children who had grown too tall to lift",
      key: "On her bakery's final day, Mrs. Okonkwo keeps her routine for her customers before privately facing the loss.",
      narrow: "Some of the bakery's customers arrive carrying children who have grown too tall to lift.",
      opposite: "Mrs. Okonkwo is relieved that she will no longer have to bake bread early every morning.",
      beyond: "The town's residents hold a celebration to thank Mrs. Okonkwo for her many years of work.",
    },
    {
      scene: "ii-lit-new-glasses",
      text:
        "The optometrist slid the new lenses into place, and Lucia looked out the window of the shop. The blur of green across the street broke apart into separate leaves, each one edged and trembling. She had not known that trees looked like this. All the way home she kept stopping: at a street sign she could suddenly read from half a block away, at the brick pattern of the library, at her own mother's face, which had lines around the eyes Lucia had never seen. She was nine years old, and the world, it turned out, had been sharp all along.",
      turn: "She had not known that trees looked like this",
      detail: "a street sign she could suddenly read from half a block away",
      key: "New glasses let Lucia see details she had never noticed, showing her how much she had been missing.",
      narrow: "After getting her glasses, Lucia can read a street sign from half a block away.",
      opposite: "Lucia is disappointed that her new glasses make familiar places look strange and unfamiliar.",
      beyond: "Lucia realizes that her mother has been hiding serious worries from her for many years.",
    },
    {
      scene: "ii-lit-chess-cousin",
      text:
        "For two years, Dev had lost every game of chess he played against his older cousin Amara. This time, forty moves in, he saw it: if he gave up his knight, her king would have nowhere to go. His hand hovered over the piece. Amara, who had been leaning back in her chair, sat up slowly. Dev made the move and watched her study the board for a long time. Finally she tipped her king over with one finger and looked at him, not with annoyance, as he had half expected, but with something very much like pride.",
      turn: "Finally she tipped her king over",
      detail: "if he gave up his knight",
      key: "Dev finally defeats his older cousin at chess, and she responds to the loss with evident pride in him.",
      narrow: "Dev decides to give up his knight about forty moves into the game against his cousin.",
      opposite: "Amara is angry and embarrassed that her younger cousin has finally defeated her after two years of games.",
      beyond: "Amara let Dev win on purpose so that her younger cousin would not give up playing chess with her.",
    },
    {
      scene: "ii-lit-keeper-letter",
      text:
        "Every autumn the supply boat brought the lighthouse keeper a bundle of mail, most of it notices from the harbor authority. This year, tucked between two of them, was a letter in handwriting he had not seen in twenty years: his brother's. Aldo set it on the table unopened and went up to trim the lamp, as he did every evening. He trimmed it twice. When he came down, he made tea, sat, and turned the envelope over in his hands until the tea had gone cold. Then, carefully, as if it might break, he opened it.",
      turn: "He trimmed it twice",
      detail: "a bundle of mail, most of it notices from the harbor authority",
      key: "Aldo hesitates a long time before opening an unexpected letter from a brother long absent from his life.",
      narrow: "The supply boat brings Aldo a bundle of mail every autumn, most of it from the harbor authority.",
      opposite: "Aldo is too busy with his evening duties at the lighthouse to take any interest in his brother's letter.",
      beyond: "Aldo's brother writes to ask him to leave the lighthouse and return home to their family.",
    },
    {
      scene: "ii-lit-first-snow",
      text:
        "Kwame had seen snow in films, where it fell slowly and politely and made everything look like a greeting card. The real thing, arriving in his second week at the school, came sideways, stung his face, and soaked through the canvas shoes his mother had packed. His roommate lent him a pair of boots two sizes too big. Kwame stuffed the toes with socks, went back out, and stood in the middle of the empty courtyard with his face turned up, letting the snow sting, laughing at nothing.",
      turn: "went back out",
      detail: "a pair of boots two sizes too big",
      key: "Although real snow proves harsher than Kwame expected, he ends up delighting in it.",
      narrow: "Kwame's roommate lends him a pair of boots that are two sizes too big for his feet.",
      opposite: "Kwame is so disappointed by the real snow that he stays indoors for the rest of the day.",
      beyond: "Kwame regrets having left his home to attend a school in a much colder and snowier place.",
    },
    {
      scene: "ii-lit-grandfather-radio",
      text:
        "The radio had not worked since before Iris was born, but her grandfather kept it on the shelf above his workbench. One rainy Saturday she asked if they could fix it. He looked at her for a moment, then took it down and opened the back, and for the rest of the afternoon he showed her how each part worked: the tubes, the coil, the dial that had once found stations across the ocean. They did not fix it that day, or the next. Walking home, Iris realized that she had not really cared whether they did.",
      turn: "Iris realized that she had not really cared",
      detail: "the dial that had once found stations across the ocean",
      key: "Iris discovers that learning from her grandfather matters more to her than repairing the old radio.",
      narrow: "The dial of the grandfather's radio could once find stations from across the ocean.",
      opposite: "Iris is frustrated that she and her grandfather fail to repair the radio despite working on it for two days.",
      beyond: "Iris's grandfather keeps the radio because it reminds him of his own childhood.",
    },
    {
      scene: "ii-lit-pepper-stall",
      text:
        "Every Saturday Rosa's family sold peppers at the market, and every Saturday Rosa counted the hours until she could leave. This morning her father was sick, and her mother handed her the cash box. At first she simply made change. Then an old man asked which peppers were hottest, and Rosa, surprising herself, told him about the small orange ones her father grew along the fence, how he tested them himself, how he laughed when his eyes watered. The man bought three bags. When her mother returned, Rosa did not mention that she had forgotten to check the time.",
      turn: "surprising herself",
      detail: "the small orange ones her father grew along the fence",
      key: "Left in charge of her family's stall, Rosa finds unexpected pleasure in work she usually wants to escape.",
      narrow: "Rosa's father grows small orange peppers along a fence and tests how hot they are himself.",
      opposite: "Rosa continues to count the hours until she can leave the market and go home, as she does every Saturday.",
      beyond: "Rosa decides that she will take over her family's pepper business when she is older.",
    },
  ];

  const literaryMainIdea = {
    ...RW,
    id: "central-idea-literary-passage",
    skill: "Central Ideas and Details",
    subskill: "main idea",
    difficulty: "Medium",
    title: "Main idea of a literary passage built on a character's shift",
    recognize:
      "The passage turns on a change in a character; the main idea names that change, not a vivid detail and not what might happen after the passage ends.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["too-narrow", "opposite-stance", "too-broad"],
    build(t) {
      const topic = t.pick(LITERARY_MAIN_TOPICS);
      const content = `The following text is from a short story.\n\n${topic.text}`;
      const wrong = [
        [topic.narrow, "This detail does appear in the passage, but it is one moment, not what the passage as a whole is about."],
        [topic.opposite, "This misreads the character's feelings; the passage shows the reverse by the end."],
        [topic.beyond, "Nothing in the passage states or shows this; it invents events or motives beyond the text."],
      ];
      return mc("Medium", topic, {
        stimulus: passage(content),
        stem: "Which choice best states the main idea of the text?",
        correct: topic.key,
        wrong,
        explanation:
          `The passage builds to a change in how the character feels or acts, and the choice that names that change is the main idea: ${topic.key}`,
        steps: [
          "Note how the character feels or acts at the start of the passage.",
          "Find the moment where that changes, and how the passage ends.",
          "Choose the statement that covers the whole shift without adding events the passage never shows.",
        ],
        principles: [
          "In a literary passage, the main idea usually lies in how a character changes.",
          "An answer must be supported by the passage, not merely compatible with it.",
        ],
        trap: "Picking a vivid, accurate detail, or reading the character's feelings at the start as their feelings throughout.",
        hint: "How is the character different at the end of the passage from at the beginning?",
        verify: () =>
          content.includes(topic.turn) && content.includes(topic.detail) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Central Ideas: the author accepts a scholar's evidence but narrows  */
  /* the conclusion drawn from it                                        */
  /* ------------------------------------------------------------------ */

  // `claim` is the cited scholar's conclusion, `concession` the author's
  // acceptance of the evidence, and `limit` the author's own qualification,
  // in that order. The main idea is the author's position, not the scholar's.
  const QUALIFIED_SOURCE_TOPICS = [
    {
      scene: "ii-lubeck-merchant-trust",
      text:
        "Historian Ines Marchetti argues that merchants in fourteenth-century Lübeck relied mainly on personal trust rather than on written contracts. As evidence, she points to thousands of surviving letters in which traders send goods to distant partners with no contract at all, only a promise to settle accounts later. The letters are a remarkable source, and they do show how often merchants extended credit on trust. But they come almost entirely from a few wealthy families who traded with relatives and longtime associates. Town court records, by contrast, show a steady stream of disputes over written agreements among smaller traders. Trust may have governed dealings within established networks, but Marchetti's sources cannot tell us how the city's many other merchants did business.",
      claim: "relied mainly on personal trust",
      concession: "they do show how often merchants extended credit on trust",
      limit: "cannot tell us how the city's many other merchants did business",
      key: "Marchetti's letters show how often wealthy families traded on trust, but not how Lübeck's merchants did business in general.",
      source: "Merchants in fourteenth-century Lübeck relied mainly on personal trust rather than written contracts when trading with partners.",
      overreach: "The letters are genuine, but court records show that most of Lübeck's merchants relied on written contracts instead.",
      overReason: "The author says only that the letters cannot tell us how other merchants did business; the text never claims that most merchants used contracts.",
      narrow: "Court records from fourteenth-century Lübeck show that smaller traders often disputed their written agreements.",
    },
    {
      scene: "ii-cave-art-hunting-magic",
      text:
        "An influential view holds that Ice Age cave paintings were a form of hunting magic, made to bring success in the hunt. Its defenders note that the paintings overwhelmingly depict large animals such as bison and horses, which people of the time hunted. That pattern is real, and it suggests that these animals mattered deeply to the painters. Yet bones found at several painted caves show that the people living there ate mostly reindeer, which appear only rarely on the walls. If the paintings were meant to bring success in the hunt, one would expect the animals most often hunted to appear most often. The images may express the animals' importance in some other way.",
      claim: "a form of hunting magic",
      concession: "it suggests that these animals mattered deeply to the painters",
      limit: "express the animals' importance in some other way",
      key: "The painted animals mattered deeply to the painters, but probably not as objects of hunting magic.",
      source: "Ice Age people probably painted bison, horses, and other large animals on cave walls to bring success in hunting them.",
      overreach: "The paintings had nothing to do with hunting, since the painters ate mostly reindeer rather than the animals they painted.",
      overReason: "The author rejects hunting magic but says only that the images may express the animals' importance in some other way, not that they had nothing to do with hunting.",
      narrow: "People living near several painted caves ate mostly reindeer, an animal that rarely appears in the paintings.",
    },
    {
      scene: "ii-tarnford-toll-ledgers",
      text:
        "Historian Miriam Okafor argues that the toll bridge opened at the river town of Tarnford in 1790 made the town's weekly market the busiest in its county. She points to the bridge's toll ledgers, which record steadily rising numbers of carts crossing on market days in the decade after the bridge opened. The ledgers are careful and complete, and they leave no doubt that traffic over the river grew. But the county's other market towns kept no comparable records, so there is no way to know whether their trade grew faster still. Okafor's ledgers show that Tarnford's market prospered; they cannot show that it outgrew its rivals.",
      claim: "made the town's weekly market the busiest in its county",
      concession: "leave no doubt that traffic over the river grew",
      limit: "they cannot show that it outgrew its rivals",
      key: "The ledgers show that Tarnford's market grew but cannot show that it became the busiest market in its county.",
      source: "The toll bridge at Tarnford made the town's weekly market the busiest of all the markets in its county.",
      overreach: "The ledgers show that traffic over the river grew, but trade in the county's other market towns probably grew even faster.",
      overReason: "The author says there is no way to know whether the other towns' trade grew faster; this choice treats that possibility as likely.",
      narrow: "The county's other market towns kept no records comparable to the toll ledgers of Tarnford's bridge.",
    },
    {
      scene: "ii-printing-literacy-france",
      text:
        "Historian Colette Arnaud contends that the printing press caused a rapid rise in literacy across sixteenth-century France. She cites the enormous growth in the number of books printed in Paris and Lyon over the course of the century. That growth is well documented, and it certainly made books cheaper and easier to obtain. Signature records, though, tell a more complicated story. Notarial documents, which the parties and witnesses to an agreement either signed or marked with a cross, show that the share of people able to sign rose only slowly, and mostly in towns. More books were printed, but most of them were bought by people who could already read.",
      claim: "caused a rapid rise in literacy",
      concession: "certainly made books cheaper and easier to obtain",
      limit: "bought by people who could already read",
      key: "Printing made books easier to obtain in France without causing the rapid rise in literacy that Arnaud describes.",
      source: "The printing press caused literacy to rise rapidly throughout France during the sixteenth century.",
      overreach: "The printing press had little effect in France, since most of its books went to people who could already read.",
      overReason: "The author grants that printing made books cheaper and easier to obtain, so the text does not say printing had little effect.",
      narrow: "French notarial documents show whether the parties and witnesses to an agreement signed or made a mark.",
    },
    {
      scene: "ii-community-garden-diets",
      text:
        "Public health researcher Dana Whitcomb argues that community gardens improve the diets of the neighborhoods around them. In her surveys, gardeners reported eating far more vegetables than their neighbors did. The difference is striking, and the gardens clearly benefit the people who tend them. Still, only about one resident in fifty worked a garden plot, and residents who did not garden reported eating no more vegetables after the gardens opened than before. The gardens may nourish their gardeners, but Whitcomb's surveys give little reason to think they have changed what the wider neighborhood eats.",
      claim: "improve the diets of the neighborhoods around them",
      concession: "the gardens clearly benefit the people who tend them",
      limit: "changed what the wider neighborhood eats",
      key: "Gardens help the people who work them; the surveys do not show that they improve the neighborhood's diet.",
      source: "Community gardens improve the diets of residents throughout the neighborhoods in which the gardens are located.",
      overreach: "Community gardens benefit their gardeners, but they have no effect at all on what anyone else nearby eats.",
      overReason: "The author says the surveys give little reason to think the gardens changed the neighborhood's diet, which is weaker than saying they had no effect.",
      narrow: "Only about one resident in fifty in the neighborhoods Whitcomb studied worked a community garden plot.",
    },
    {
      scene: "ii-medieval-english-vineyards",
      text:
        "Some historians have argued that England's climate in the eleventh and twelfth centuries was warmer than it is today. Their evidence is the large number of vineyards recorded in England during that period. The records are genuine, and they do suggest that conditions allowed grapes to ripen. But vineyards depend on demand as well as on weather. Monasteries needed wine for religious services, and importing it was costly and uncertain. Many English vineyards may have been planted despite a marginal climate, not because of an unusually warm one.",
      claim: "was warmer than it is today",
      concession: "they do suggest that conditions allowed grapes to ripen",
      limit: "despite a marginal climate, not because of an unusually warm one",
      key: "Medieval English vineyards show that grapes could ripen there, not that the climate was warmer than today's.",
      source: "England's climate in the eleventh and twelfth centuries was warmer than England's climate is today.",
      overreach: "England's medieval vineyards suggest that its climate then was cooler than today's, since vines grew despite poor conditions.",
      overReason: "The author says vineyards may have been planted despite a marginal climate; that does not show the climate was cooler than today's.",
      narrow: "Monasteries in medieval England needed wine for religious services and found importing it costly.",
    },
    {
      scene: "ii-appalachian-ballad-origins",
      text:
        "Musicologist Amira Haddad argues that a group of ballads sung in the Appalachian Mountains came directly from ballads sung in the Scottish borderlands. She shows that the two traditions share dozens of story lines and many nearly identical verses. Those similarities are too close to be coincidence, and they leave little doubt that the words share an ancestry. The melodies are another matter: many Appalachian versions are sung to tunes found nowhere in Scotland but common in English and Irish collections. The ballads' words may have crossed the ocean from the borderlands, but their music seems to have come from several places.",
      claim: "came directly from ballads sung in the Scottish borderlands",
      concession: "leave little doubt that the words share an ancestry",
      limit: "their music seems to have come from several places",
      key: "The Appalachian ballads' words probably came from the Scottish borderlands, but their melodies seem to have had several sources.",
      source: "A group of Appalachian ballads, words and music alike, probably came from ballads of the Scottish borderlands.",
      overreach: "The Appalachian ballads' melodies came from English and Irish songs rather than from the Scottish borderlands.",
      overReason: "The author says the music seems to have come from several places, not only from English and Irish songs, and this choice leaves out the ballads' words.",
      narrow: "Many Appalachian ballad melodies also appear in collections of English and Irish songs.",
    },
    {
      scene: "ii-brenlow-granary",
      text:
        "Archaeologist Hana Kowalczyk argues that the Bronze Age settlement at Brenlow Moor was governed by a central authority. She points to a large communal granary at the center of the site, which could have held far more grain than any single household needed. The granary is impressive, and it shows that the villagers could organize large projects together. But communal storehouses are also known from villages where decisions were made by councils of households, with no ruler at all. The granary shows cooperation on a large scale; it cannot tell us who, if anyone, was in charge.",
      claim: "was governed by a central authority",
      concession: "it shows that the villagers could organize large projects together",
      limit: "it cannot tell us who, if anyone, was in charge",
      key: "The granary shows that Brenlow Moor's villagers cooperated, not who, if anyone, governed them.",
      source: "A central authority governed the Bronze Age settlement at Brenlow Moor and directed the building of its granary.",
      overreach: "The granary shows that Brenlow Moor was governed by a council of households rather than by a single ruler.",
      overReason: "The author says only that the granary cannot tell us who was in charge; the text never says a council governed the settlement.",
      narrow: "Communal storehouses are also known from villages that were governed by councils of households.",
    },
    {
      scene: "ii-silent-film-audiences",
      text:
        "Film historian Marcus Bell claims that audiences of the 1910s watched silent films in reverent silence, much as people attend concerts today. He points to theater programs of the period that asked patrons not to talk during the picture. The programs are genuine, and they show that theater owners wanted quiet audiences. Newspaper columns from the same years, however, complain constantly about patrons who read the title cards aloud, cheered heroes, and hissed at villains. The programs record what owners hoped for; the complaints suggest what audiences actually did.",
      claim: "watched silent films in reverent silence",
      concession: "they show that theater owners wanted quiet audiences",
      limit: "the complaints suggest what audiences actually did",
      key: "Theater owners of the 1910s wanted silent audiences, but other evidence suggests audiences were often noisy.",
      source: "Audiences of the 1910s watched silent films in reverent silence, much as audiences at concerts listen quietly today.",
      overreach: "The theater programs of the 1910s are unreliable, since newspaper columns show that audiences never obeyed them.",
      overReason: "The author calls the programs genuine records of what owners hoped for and never says that audiences ignored them without exception.",
      narrow: "Some moviegoers of the 1910s read the films' title cards aloud to the people sitting near them.",
    },
    {
      scene: "ii-four-day-workweek",
      text:
        "Management researcher Oskar Lind argues that a four-day workweek raises employee productivity. At the software company he studied, output per hour rose by 12 percent in the year after the company moved to four ten-hour days. The increase is real, and it shows at least that the new schedule did not hurt the company's work. During that same year, however, the company also replaced its project-tracking software, a change that its managers say eliminated many hours of paperwork. Because the schedule and the software arrived together, Lind's study cannot say which one deserves the credit.",
      claim: "raises employee productivity",
      concession: "it shows at least that the new schedule did not hurt the company's work",
      limit: "cannot say which one deserves the credit",
      key: "Productivity rose after the schedule changed, but the study cannot tell whether the schedule was the cause.",
      source: "Moving to a four-day workweek raises the productivity of a company's employees.",
      overreach: "The new project-tracking software, not the four-day schedule, caused the rise in the company's productivity.",
      overReason: "The author says the study cannot tell which change deserves the credit, so it cannot credit the software either.",
      narrow: "The company replaced its project-tracking software in the year after it changed its work schedule.",
    },
  ];

  const qualifiedSource = {
    ...RW,
    id: "central-idea-author-qualifies-source",
    skill: "Central Ideas and Details",
    subskill: "main idea",
    // Medium: the concession and the limit are both signposted ("The letters
    // are genuine, and ...", "But ..."), so the task is holding two marked
    // parts together. The overreach choice accepts the evidence and then
    // claims more than the author does, in the key's own "X, but Y" form.
    difficulty: "Medium",
    title: "Main idea when the author accepts a scholar's evidence but narrows the conclusion",
    recognize:
      "The text reports a claim and its evidence, grants the evidence, and then limits what it shows; the main idea is the author's limited position, neither the reported claim nor a stronger counterclaim.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["misattributed-view", "too-broad", "too-narrow"],
    build(t) {
      const topic = t.pick(QUALIFIED_SOURCE_TOPICS);
      const wrong = [
        [topic.source, "This is the claim the text reports and then limits; the author accepts the evidence offered for it but not the claim itself."],
        [topic.overreach, topic.overReason],
        [topic.narrow, "This is the fact the author uses to limit the claim, not the point of the whole text."],
      ];
      return mc("Medium", topic, {
        stimulus: passage(topic.text),
        stem: "Which choice best states the main idea of the text?",
        correct: topic.key,
        wrong,
        explanation:
          `The text presents a claim and the evidence for it, grants that the evidence is real, then argues that it supports only a narrower point. The author's position is the main idea: ${topic.key}`,
        steps: [
          "Separate the reported claim from the author's own voice.",
          "Note what the author concedes about the evidence.",
          "Find the limit the author places on that evidence, and choose the statement that keeps both the concession and the limit, claiming no more than the author does.",
        ],
        principles: [
          "An author who reports a claim is not necessarily making it.",
          "Doubting that evidence proves a claim is different from asserting the opposite claim.",
        ],
        trap: "Choosing the reported claim because the text presents its evidence fairly, or a choice that turns the author's doubt into a counterclaim.",
        hint: "What does the author grant, and what does the author say the evidence cannot show?",
        verify: () =>
          inOrder(topic.text, [topic.claim, topic.concession, topic.limit]) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Central Ideas and Details: what a study found, told apart from what */
  /* the researchers expected and what they only suspect                 */
  /* ------------------------------------------------------------------ */

  // Every passage has three stages in order: the prediction (`expected`),
  // the result (`found`), and an untested suspicion (`suspect`). The key
  // restates the result with its qualification; the distractors restate the
  // prediction, the suspicion, and the result with a detail reversed.
  const EXPECTED_FOUND_TOPICS = [
    {
      scene: "ii-squirrel-acorn-caches",
      team: "Lindgren and Baptiste",
      text:
        "Ecologists Mara Lindgren and Theo Baptiste expected that gray squirrels would bury more acorns in autumns when acorns were plentiful, since a larger supply would give them more to store. Over six autumns in a Minnesota forest, the number of acorns the squirrels buried did rise with the size of the acorn crop, but only up to a point: in the two largest crops, the squirrels buried about as many acorns as in an average year and simply ate or ignored the rest. The researchers suspect that the time needed to dig each cache limits how many acorns a squirrel can store, but they have not yet measured caching time.",
      expected: "expected that gray squirrels would bury more acorns",
      found: "but only up to a point",
      suspect: "suspect that the time needed to dig each cache limits",
      key: "The number of acorns buried rose with the size of the crop only until the crop became unusually large.",
      prediction: "Squirrels buried more acorns every time the acorn crop grew larger, just as the researchers had expected.",
      suspicion: "The time needed to dig each cache limited how many acorns the squirrels could store during large crops.",
      reversed: "In the two largest crops, the squirrels buried fewer of the acorns than they had buried in an average year.",
    },
    {
      scene: "ii-hard-font-recall",
      team: "Ferreira and Clarke",
      text:
        "Psychologists Nadia Ferreira and Owen Clarke predicted that students would remember more from a passage printed in a hard-to-read font, reasoning that the extra effort of reading would lead students to process the material more deeply. In their experiment, students who read the difficult font did recall more details on a test given immediately afterward, but a week later the two groups' recall was the same. The researchers think the difficult font may simply have slowed students' reading rather than deepening their processing, a possibility they plan to test by timing readers.",
      expected: "predicted that students would remember more",
      found: "but a week later the two groups' recall was the same",
      suspect: "may simply have slowed students' reading",
      key: "Students who read the difficult font recalled more at first, but a week later they recalled no more than the others.",
      prediction: "Reading a hard-to-read font led students to process the passage more deeply than students who read the passage in a clear font.",
      suspicion: "The difficult font improved recall on the first test only because it slowed down the students' reading.",
      reversed: "Students who read the difficult font recalled more details both immediately and a week after reading.",
    },
    {
      scene: "ii-cleaner-wrasse-visits",
      team: "Kahale and Sorokin",
      text:
        "Marine biologists Leilani Kahale and Dmitri Sorokin predicted that reef fish would visit cleaner wrasses, small fish that eat parasites off larger ones, more often on reefs with heavy parasite loads. When they surveyed twelve reefs, visits to cleaning stations were indeed more frequent where parasites were abundant, but only among fish species that stay on a single reef; species that roam between reefs visited at similar rates everywhere. Kahale and Sorokin suspect that roaming fish seek out the best cleaning stations wherever they go, though they have not tracked individual fish to confirm this.",
      expected: "predicted that reef fish would visit cleaner wrasses",
      found: "but only among fish species that stay on a single reef",
      suspect: "suspect that roaming fish seek out the best cleaning stations",
      key: "Visits to cleaning stations rose with parasite abundance only among fish species that remain on one reef.",
      prediction: "Reef fish of every species visited cleaner wrasses more often on the reefs where parasites were abundant.",
      suspicion: "Fish that roam between reefs seek out the best cleaning stations on every reef that they visit.",
      reversed: "Fish that roam between reefs visited cleaning stations more often where parasites were abundant.",
    },
    {
      scene: "ii-farmers-market-signs",
      team: "Kapoor and Obi",
      text:
        "Economists Rhea Kapoor and Samuel Obi expected that shoppers at a farmers market would buy more produce when prices were posted on large, clear signs, since clear prices make comparison easier. Over a summer, they alternated weeks with and without large signs. Total sales did not change, but the pattern of purchases did: with the signs, shoppers spread their spending across more stalls rather than buying mostly from the stalls nearest the entrance. The researchers believe the signs made shoppers less reluctant to ask vendors about prices, though their data include no record of conversations.",
      expected: "expected that shoppers at a farmers market would buy more produce",
      found: "Total sales did not change, but the pattern of purchases did",
      suspect: "believe the signs made shoppers less reluctant to ask vendors",
      key: "The signs changed which stalls shoppers bought from without changing the market's total sales.",
      prediction: "Shoppers bought more produce overall in the weeks when prices were posted on large, clear signs.",
      suspicion: "The large signs made shoppers less reluctant to ask vendors questions about their prices.",
      reversed: "In weeks with the signs, shoppers bought mostly from the stalls nearest the market's entrance.",
    },
    {
      scene: "ii-blackbird-dawn-song",
      team: "Ruiz and Mensah",
      text:
        "Biologists Ana Ruiz and Kofi Mensah hypothesized that artificial light at night causes European blackbirds in cities to begin their dawn song earlier than blackbirds in forests. Recordings confirmed that city birds started singing earlier than forest birds, but the difference was much larger on weekdays than on weekends, even though the streetlights were the same every night. Ruiz and Mensah now suspect that city birds sing early partly to avoid being drowned out by morning traffic, although they have not yet separated the effects of light and noise.",
      expected: "hypothesized that artificial light at night causes",
      found: "the difference was much larger on weekdays than on weekends",
      suspect: "suspect that city birds sing early partly to avoid being drowned out",
      key: "City blackbirds began singing earlier than forest blackbirds, especially on weekdays.",
      prediction: "Artificial light at night causes city blackbirds to begin their dawn song earlier than forest birds.",
      suspicion: "City blackbirds sing early mainly so that morning traffic noise will not drown out their songs.",
      reversed: "City blackbirds began singing earlier on weekends than on weekdays, when streetlights were the same.",
    },
    {
      scene: "ii-grafted-tomato-drought",
      team: "Castillo and Brandt",
      text:
        "Plant scientists Irene Castillo and Hugo Brandt expected that tomato plants grafted onto the roots of a drought-tolerant wild relative would produce more fruit than ungrafted plants during a dry summer. In their field trial, the grafted plants survived the drought far better and lost fewer leaves, but they produced about the same amount of fruit as the ungrafted plants that survived. Castillo and Brandt suspect that the wild roots send signals that slow fruit production in exchange for survival, a mechanism they intend to investigate.",
      expected: "expected that tomato plants grafted onto the roots",
      found: "but they produced about the same amount of fruit",
      suspect: "suspect that the wild roots send signals",
      key: "Grafted plants survived the drought better but produced no more fruit than the ungrafted plants that survived.",
      prediction: "Grafted plants produced more fruit than ungrafted plants did over the course of the dry summer in the field trial.",
      suspicion: "Signals from the wild roots slowed the grafted plants' fruit production in exchange for survival.",
      reversed: "Ungrafted plants lost fewer leaves during the drought than the plants that had been grafted.",
    },
    {
      scene: "ii-museum-audio-guide",
      team: "Tanabe and Jensen",
      text:
        "Museum researchers Yuki Tanabe and Clara Jensen predicted that visitors using a new audio guide would spend more time in the museum overall. Tracking data showed that audio-guide users spent the same total time in the building as other visitors, but they divided it differently, lingering at the objects the guide described and passing quickly through rooms it skipped. Tanabe and Jensen think the guide may lead visitors to treat undescribed objects as unimportant, but they have not interviewed visitors to learn what they concluded.",
      expected: "predicted that visitors using a new audio guide would spend more time",
      found: "spent the same total time in the building as other visitors",
      suspect: "think the guide may lead visitors to treat undescribed objects as unimportant",
      key: "Audio-guide users spent the same total time as others but concentrated it on the objects the guide described.",
      prediction: "Visitors who used the new audio guide spent more total time in the museum than other visitors did.",
      suspicion: "Audio-guide users concluded that the objects the guide did not describe were unimportant.",
      reversed: "Audio-guide users passed more quickly than other visitors through the rooms whose objects the guide described.",
    },
    {
      // Fully invented study (invented lake and researchers); an earlier
      // version credited a real hurricane study of anole lizards to invented
      // names.
      scene: "ii-chickadee-ice-storm",
      team: "Serrano and Hardy",
      text:
        "Biologists Paula Serrano and Neil Hardy expected that after an ice storm struck the forests around Lake Orvel, the surviving black-capped chickadees would be heavier on average than the birds they had banded before the storm, since heavier birds carry larger fat reserves. When the team recaptured banded birds a month later, the survivors did differ from the earlier population, but not in weight: their average weight matched the pre-storm average, while their wings were slightly shorter. The researchers suspect that shorter wings let birds maneuver through ice-laden branches, though they have not tested this directly.",
      expected: "expected that after an ice storm struck",
      found: "but not in weight",
      suspect: "suspect that shorter wings let birds maneuver",
      key: "The surviving chickadees weighed about the same as the earlier population but had slightly shorter wings.",
      prediction: "The surviving chickadees were heavier on average than the birds the researchers had banded before the storm.",
      suspicion: "Shorter wings helped some chickadees survive the storm by letting them maneuver through ice-laden branches.",
      reversed: "The surviving chickadees had slightly longer wings on average than the birds banded before the storm.",
    },
    {
      scene: "ii-remote-work-traffic",
      team: "Siddiqui and Moberg",
      text:
        "Urban economists Farah Siddiqui and Lars Moberg predicted that when a large employer let its staff work from home three days a week, traffic on the main road into the city would fall on those days. Road counters showed that morning rush-hour traffic did fall, but total daily traffic stayed nearly the same, because more cars used the road at midday. The researchers suspect that people working from home made errands they would otherwise have made on weekends, though they lack data on the purpose of each trip.",
      expected: "predicted that when a large employer let its staff work from home",
      found: "but total daily traffic stayed nearly the same",
      suspect: "suspect that people working from home made errands",
      key: "Rush-hour traffic fell on those days, but total daily traffic on the road changed very little.",
      prediction: "Total traffic on the main road fell on the days when the employer's staff worked from home.",
      suspicion: "Staff working from home made midday errands that they would otherwise have made on weekends.",
      reversed: "Midday traffic on the main road fell on the days when the employer's staff worked from home.",
    },
    {
      scene: "ii-merchant-letter-calendars",
      team: "Lang and Ortiz",
      text:
        "Historians Beatrice Lang and Rafael Ortiz expected that letters in a merchant family's archive would be undated or only roughly dated, as is common in private papers from the 1600s. Instead, nearly every letter carried a precise date, but the dates followed two different calendars: letters written in England used the older Julian calendar, while those sent from the Netherlands used the newer Gregorian one. Lang and Ortiz believe that later archivists misread some of these dates and filed letters in the wrong order, but they have not yet checked the full collection.",
      expected: "expected that letters in a merchant family's archive would be undated",
      found: "but the dates followed two different calendars",
      suspect: "believe that later archivists misread some of these dates",
      key: "Nearly all of the letters were precisely dated, though the dates followed two different calendars.",
      prediction: "Most of the letters in the family's archive were undated or were dated only roughly.",
      suspicion: "Later archivists misread some of the dates and filed a number of letters in the wrong order.",
      reversed: "The letters sent from the Netherlands were dated using the older Julian calendar.",
    },
  ];

  const expectedFound = {
    ...RW,
    id: "detail-finding-versus-expectation",
    skill: "Central Ideas and Details",
    subskill: "supporting detail",
    // Medium: prediction, result, and suspicion are each signposted
    // ("expected", "but", "suspect ... have not tested"), so the student
    // sorts three labeled parts rather than synthesizing unmarked ones.
    difficulty: "Medium",
    title: "Result of a study told apart from its prediction and an untested suspicion",
    recognize:
      "The text gives a prediction, a result that qualifies it, and a suspicion not yet tested; only the qualified result is what the study found.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["misattributed-view", "too-broad", "opposite-stance"],
    build(t) {
      const topic = t.pick(EXPECTED_FOUND_TOPICS);
      const wrong = [
        [topic.prediction, "This is what the researchers expected before the study; the result differed from it."],
        [topic.suspicion, "The researchers only suspect this and say they have not yet tested it, so it is not a finding."],
        [topic.reversed, "This contradicts part of the result as the text reports it."],
      ];
      return mc("Medium", topic, {
        stimulus: passage(topic.text),
        stem: `According to the text, what did ${topic.team} find?`,
        correct: topic.key,
        wrong,
        explanation:
          `The text separates three things: what ${topic.team} expected, what they found, and what they suspect but have not tested. Only the second is a finding: ${topic.key}`,
        steps: [
          "Label each part of the text: prediction, result, or untested explanation.",
          "Restate the result with its qualification (\"only up to a point,\" \"but only among\").",
          "Choose the option that matches the qualified result exactly.",
        ],
        principles: [
          "A hypothesis or a suspicion reported in a text is not a finding.",
          "A finding's qualifications are part of the finding; a choice that drops or reverses them is wrong.",
        ],
        trap: "Choosing the prediction or the suspicion, which use the same vocabulary as the result and sound like conclusions.",
        hint: "Which sentence reports what the researchers actually observed?",
        verify: () =>
          inOrder(topic.text, [topic.expected, topic.found, topic.suspect]) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Central Ideas: main idea of an original passage in older prose      */
  /* ------------------------------------------------------------------ */

  // Original passages written in the manner of nineteenth-century fiction and
  // early twentieth-century essays (never excerpts). Each opens with a view,
  // a reputation, or a resolve that the closing sentences qualify or undercut,
  // often through irony and periodic syntax, so the main idea exists only in
  // the synthesis of the two. `anchors` are fragments that must occur in
  // order. Each item carries its own three distractors and reasons: the view
  // taken at face value, a true detail, and an overstated or shifted reading.
  const PERIOD_HEADERS = {
    fiction: "The following text is from an original story written in a nineteenth-century style.",
    essay: "The following text is from an original essay written in an early twentieth-century style.",
  };
  const PERIOD_PROSE_TOPICS = [
    {
      scene: "ii-cid-period-rector-sweetbriar",
      kind: "fiction",
      text:
        "The Reverend Mr. Ashby held that a man’s garden was the plainest index of his mind, and his own, laid out in beds as regular as the pews of his church, was accordingly much admired. One corner alone defied him: a tangle of sweetbriar, planted by his late wife in the first summer of their marriage, which had long since overrun its border. Visitors were invariably conducted to this corner to hear it deplored, and the gardener, who had thrice offered to grub it out, had thrice been told that there was no hurry in the matter. It flourishes still; and Mr. Ashby, who deplores it every June, has never once been known to let it be cut.",
      anchors: ["plainest index of his mind", "planted by his late wife", "no hurry in the matter", "never once been known to let it be cut"],
      key: "Mr. Ashby complains of the overgrown sweetbriar yet will not have it cut, evidently because his late wife planted it.",
      wrong: [
        ["Mr. Ashby is so troubled by the overgrown sweetbriar that he shows it to visitors as a warning against careless gardening.",
         "This takes Mr. Ashby’s complaints at face value and ignores that he has refused, again and again, to let the sweetbriar be cut."],
        ["Mr. Ashby’s garden, laid out in beds as regular as the pews of his church, is much admired by those who see it.",
         "This is a true detail from the opening, but the passage turns on the one corner that breaks that order."],
        ["Since his wife’s death, grief has led Mr. Ashby to neglect the garden that once reflected his orderly mind.",
         "Only one corner is overgrown; the rest of the garden is still laid out in regular beds, so the garden as a whole is not neglected."],
      ],
      why: "The opening says Mr. Ashby’s garden mirrors his orderly mind; the rest of the text shows the one disorder he protects. He deplores the sweetbriar to visitors but tells the gardener there is “no hurry” to remove it, and the text notes that his late wife planted it.",
    },
    {
      scene: "ii-cid-period-telephone-letters",
      kind: "essay",
      text:
        "It is the fashion to lament that the telephone has put an end to the art of letter-writing, and the lament is uttered with a confidence that would be more becoming if the art had ever been general. It was not. For every correspondent whose letters were worth the keeping there were a thousand who wrote because the week required it, and who filled their pages with the weather, the state of their health, and assurances of an early reply. It is these letters that the telephone has abolished; and I confess I cannot find it in me to mourn them. The few who wrote well still write, and write, I suspect, rather better for having fewer rivals.",
      anchors: ["It is the fashion to lament", "if the art had ever been general", "It is these letters that the telephone has abolished", "The few who wrote well still write"],
      key: "The telephone has ended chiefly the dutiful letter, since letter-writing as an art was always practiced by few.",
      wrong: [
        ["The telephone has put an end to letter-writing as an art, a loss the author regrets even though most letters were dull.",
         "This is the fashionable lament that the author questions; the author says the art was never general and does not mourn the lost letters."],
        ["The telephone has had no real effect on letter-writing, since those who wrote well before still write as they always did.",
         "The author says the telephone has abolished the routine weekly letter, so it has had an effect, only not on the few who wrote well."],
        ["Skilled letter writers now write better than ever before, because the telephone has made their letters rare.",
         "The author only suspects that good writers write “rather better” with fewer rivals; this aside is overstated here and is not the point of the whole text."],
      ],
      why: "The author doubts the fashionable lament: letter-writing as an art was never common, and what the telephone abolished was the routine letter written from duty, which the author does not mourn.",
    },
    {
      scene: "ii-cid-period-hallam-anecdotes",
      kind: "fiction",
      text:
        "Mrs. Hallam prided herself upon never giving advice. Advice, she said, was an impertinence, and she had seen too many families divided by it. She contented herself instead with anecdotes: of a cousin who had married in haste, of a neighbour who had let his roof go one winter too many, of a young person, not unlike the one before her, who had come to grief through a fondness for novels. These histories she related without comment, and if her hearers drew a lesson from them, that, she felt, was their affair. It was remarked in the village that no one was so seldom advised, and so thoroughly, as the visitors to Mrs. Hallam’s parlour.",
      anchors: ["prided herself upon never giving advice", "not unlike the one before her", "so seldom advised, and so thoroughly"],
      key: "Though Mrs. Hallam claims never to give advice, her pointed anecdotes counsel her visitors as thoroughly as advice would.",
      wrong: [
        ["Mrs. Hallam avoids giving advice because she has seen it divide families, so she leaves visitors to reach their own conclusions.",
         "This accepts Mrs. Hallam’s account of herself; her anecdotes are aimed at her listeners, and the village’s remark shows that they work as advice."],
        ["Mrs. Hallam tells her visitors stories of a hasty marriage, a neglected roof, and a young person ruined by novels.",
         "These are the anecdotes she tells, a true detail, but the point lies in what the anecdotes do."],
        ["The village regards Mrs. Hallam as an unusually tactful host, since she never tells her guests what they ought to do.",
         "The village’s remark is ironic: her visitors are seldom advised directly but are advised thoroughly all the same."],
      ],
      why: "Mrs. Hallam calls advice an impertinence, yet her anecdotes fit her listeners (a young person “not unlike the one before her”), and the village’s ironic remark that her visitors are “so seldom advised, and so thoroughly” shows that the stories work as advice.",
    },
    {
      scene: "ii-cid-period-railway-country",
      kind: "essay",
      text:
        "The railway, it is said, has brought the country nearer to us; and in one sense it has, for a man may now breakfast in the city and dine among the hills. But he has not seen the country between. He has seen a green smear at the window, a station name, a cutting of raw clay, and a great deal of his newspaper. The walker who covers a tenth part of the distance comes home knowing the name of every stream he crossed and the look of the sky over each parish. I do not propose that we tear up the rails; only that we cease to confuse arriving at a place with having travelled to it.",
      anchors: ["it is said, has brought the country nearer to us", "But he has not seen the country between", "I do not propose that we tear up the rails"],
      key: "Rail travel makes distant places easy to reach but gives travelers little of the knowledge of the land that walking provides.",
      wrong: [
        ["The railway does more harm than good, and travelers who care about the country should give it up and go on foot.",
         "The author explicitly does not propose tearing up the rails; the complaint is about confusing arrival with travel, not about the railway itself."],
        ["By letting a man breakfast in the city and dine in the hills, the railway has brought the country nearer to us.",
         "The author grants this only “in one sense” and then argues that the railway passenger has not actually seen the country."],
        ["Walkers learn the names of streams and parishes because they cover a tenth of the distance that railway passengers do.",
         "The text contrasts what walkers and passengers come to know; it never says the shorter distance is the reason, and this detail is not the main idea."],
      ],
      why: "The author grants that the railway brings places nearer “in one sense” but argues that the passenger sees nothing of the country between, unlike the walker, and closes by distinguishing arriving at a place from traveling to it.",
    },
    {
      scene: "ii-cid-period-captain-sea",
      kind: "fiction",
      text:
        "Captain Brereton, on retiring from the sea, bought a house as far from it as the county allowed, declaring that he had seen enough salt water for three lifetimes. He took up roses, and bees, and a quarrel with the vicar about the churchyard wall. Yet the household observed that the Captain’s walks, which he undertook for his health, invariably ended upon the one hill from which a gray line of sea could be made out on a clear day; and that on such days he came home late, and silent, and uncommonly gentle with the dog.",
      anchors: ["declaring that he had seen enough salt water", "Yet the household observed", "a gray line of sea could be made out"],
      key: "For all his declared weariness of the sea, Captain Brereton’s habits betray a lasting attachment to it.",
      wrong: [
        ["Having tired of the sea after many years, Captain Brereton finds contentment in his roses, his bees, and village affairs.",
         "This accepts the Captain’s declaration and his new pursuits at face value; the “Yet” sentence shows that his walks always end within sight of the sea."],
        ["Captain Brereton regrets his retirement so deeply that he means to return to the sea as soon as his health allows.",
         "Nothing in the text says he plans to return; the passage shows a quiet attachment, not a decision."],
        ["Captain Brereton’s household worries that his long daily walks have grown too tiring for a man of his age.",
         "The household notices where his walks end, not that they tire him; this invents a concern the text never mentions."],
      ],
      why: "The Captain claims to have had enough of the sea and moves far from it, but the “Yet” sentence reveals that his walks always end where the sea can be seen and that such days leave him quiet and gentle.",
    },
    {
      scene: "ii-cid-period-generous-reviewer",
      kind: "essay",
      text:
        "There is a kind of reviewer who is called generous because he has never been known to dislike a book. I would call him something else. Praise is a currency, and like any currency it is worth precisely what it will purchase; the reviewer who scatters it upon every volume that reaches his desk has debased his coin until it will purchase nothing. The author he praises cannot tell whether he has written well, and the reader cannot tell whether to buy. It is the severe critic, oddly enough, whose occasional warmth is prized, for everyone knows that it was not given away.",
      anchors: ["called generous because he has never been known to dislike a book", "Praise is a currency", "whose occasional warmth is prized"],
      key: "A reviewer’s praise has value only when it is given selectively, so praising every book makes it worthless.",
      wrong: [
        ["Reviewers should be severe with every book they read, since any warmth toward an author debases a critic’s judgment.",
         "The author prizes the severe critic’s occasional warmth, so the text does not condemn all praise."],
        ["The reviewer who never dislikes a book is rightly called generous, since authors depend upon his kindness.",
         "This is the view the author sets up to reject (“I would call him something else”)."],
        ["Severe critics are prized by authors and readers because they seldom offer any praise at all.",
         "The text prizes the severe critic’s rare warmth, not the scarcity of praise itself, and the severe critic is an example rather than the main point."],
      ],
      why: "The author rejects calling the indiscriminate reviewer generous: praise, like currency, is worth only what it will buy, so praise given to every book is worthless, while a severe critic’s rare warmth is valued.",
    },
    {
      scene: "ii-cid-period-schoolmaster-glossary",
      kind: "fiction",
      text:
        "Mr. Tolley came to the school at Fenwick resolved to correct the speech of the parish, which he had been told was barbarous. He began with the children, who learned to use his words in his presence and resumed their own at the gate. By the second winter he had begun to ask the old men the names of things he could find in no book—the wind that came before snow, the particular green of a field left fallow—and to write them down. The vicar, calling one evening, found him at work upon a glossary and asked whether the speech of the parish was improving. Mr. Tolley said he believed his own was.",
      anchors: ["resolved to correct the speech of the parish", "resumed their own at the gate", "found him at work upon a glossary", "he believed his own was"],
      key: "Mr. Tolley, who came to Fenwick to correct its speech, comes instead to value that speech and to learn from it.",
      wrong: [
        ["Mr. Tolley succeeds in improving the speech of Fenwick’s children, though the old men of the parish keep their own words.",
         "The children use his words only in his presence and return to their own at the gate, so he has not improved their speech."],
        ["Mr. Tolley asks the old men of the parish for the names of things that he has been unable to find in any book.",
         "This is a true detail, but it is one step in his change of mind rather than the point of the whole passage."],
        ["The vicar doubts that Mr. Tolley, for all his efforts, has made any progress in reforming the speech of the parish.",
         "The vicar simply asks a question; the passage turns on Mr. Tolley’s answer, not on the vicar’s opinion."],
      ],
      why: "Mr. Tolley arrives resolved to correct the parish’s “barbarous” speech, fails with the children, begins collecting the old men’s words, and finally says that it is his own speech that is improving.",
    },
    {
      scene: "ii-cid-period-rainbow-wonder",
      kind: "essay",
      text:
        "It is a common complaint against the man of science that he has taken the wonder out of the world: that the rainbow, once explained, is no more than a trick of light in falling water. The complaint mistakes the nature of wonder. The traveller who took the rainbow for an omen wondered at it for a moment and went about his business; the physicist who knows how each drop divides the sun’s light, and why the arc must stand at just that angle from the eye, has found a thing to wonder at for the rest of his life. Explanation does not dispel the marvel; it multiplies the places where the marvel may be found.",
      anchors: ["taken the wonder out of the world", "The complaint mistakes the nature of wonder", "it multiplies the places where the marvel may be found"],
      key: "Contrary to a common complaint, scientific explanation does not destroy wonder but gives people more to wonder at.",
      wrong: [
        ["Once it was explained as a trick of light in falling water, the rainbow lost much of the wonder it once inspired.",
         "This is the complaint that the author says “mistakes the nature of wonder.”"],
        ["Only those who understand the physics of light are able to feel any lasting wonder at a rainbow.",
         "The author says explanation multiplies wonder, not that it is the only source of wonder; the traveller who took the rainbow for an omen also wondered, if briefly."],
        ["A rainbow’s arc stands at a fixed angle from the observer’s eye because each drop of water divides the sun’s light.",
         "This is a scientific detail the author uses as an example, not the point of the passage."],
      ],
      why: "The author states a common complaint, that explaining the rainbow removes its wonder, and rejects it: the physicist who understands the rainbow has more to wonder at, because explanation multiplies the marvel.",
    },
    {
      scene: "ii-cid-period-clockmaker",
      kind: "fiction",
      text:
        "Old Pettigrew the clockmaker was reputed the most disobliging tradesman in the town. He kept no hours that a customer could rely upon, he would not be hurried, and he had been heard to tell an alderman that his watch was not worth the mending. Yet when the carter’s boy brought in a tin watch that had been his dead father’s, a thing worth perhaps a shilling, Pettigrew kept it a fortnight, returned it going sweetly in a new case, and would take nothing for it but the boy’s promise to wind it every night.",
      anchors: ["reputed the most disobliging tradesman", "his watch was not worth the mending", "Yet when the carter’s boy brought in a tin watch"],
      key: "Pettigrew’s reputation for rudeness hides the generous care he gives a watch that is precious to its owner, whatever its price.",
      wrong: [
        ["Pettigrew’s reputation as the town’s most disobliging tradesman is deserved, since he will not be hurried by anyone.",
         "This accepts the reputation that the “Yet” sentence complicates by showing his care for the boy’s watch."],
        ["Pettigrew once told an alderman that the alderman’s watch was not worth the cost of mending.",
         "This is one example of his gruffness, not the point of the whole passage."],
        ["Pettigrew treats customers of every rank alike, taking the same great care with each one’s watch.",
         "He treats the alderman and the boy very differently; the passage turns on that contrast."],
      ],
      why: "The first sentences establish Pettigrew’s reputation; the “Yet” sentence shows him spending a fortnight on a shilling watch that had belonged to the boy’s father and refusing payment, so the reputation does not tell the whole story.",
    },
    {
      scene: "ii-cid-period-maps-opinion",
      kind: "essay",
      text:
        "We are apt to regard a map as the land itself in small, and to trust it as we trust our eyes. Yet every map is a selection, and a selection is an opinion. The county surveyor of a century ago marked every gentleman’s park and every toll-gate, and left the common lanes, by which half the parish went to market, to be guessed at. The military engineer, surveying the same ground, recorded each ford and hill with care and did not trouble with the parks at all. Neither map was false. Each was a faithful record of what its maker thought worth knowing.",
      anchors: ["We are apt to regard a map as the land itself in small", "every map is a selection", "Neither map was false"],
      key: "A map is not a neutral copy of the land but a faithful record of what its maker considered worth recording.",
      wrong: [
        ["Old county maps cannot be trusted, since their makers deliberately left out the lanes that half the parish used.",
         "The author says “Neither map was false”; the maps are selective, not untrustworthy or deliberately misleading."],
        ["A map is the land itself in small and deserves the same trust that we give to our own eyes.",
         "This is the common assumption that the author sets out to correct."],
        ["Military maps were more accurate than county maps because engineers surveyed the ground with greater care.",
         "The author treats both maps as faithful records of different interests, not one as more accurate than the other."],
      ],
      why: "The author corrects the habit of trusting a map as the land in small: every map selects, as the surveyor’s and the engineer’s maps of the same ground show, and each records what its maker thought worth knowing.",
    },
    {
      scene: "ii-cid-period-cool-reply",
      kind: "fiction",
      text:
        "Henrietta had determined that her reply to Mr. Vane should be cool, and she wrote it four times before it was cool enough. The first draft thanked him too warmly for the books; the second inquired too particularly after his sister’s health; the third, though admirably cold, ran to three pages, which she perceived would never do. The fourth said merely that the books had arrived and that she was obliged to him. She sealed it with satisfaction, and then sat for the better part of an hour considering whether ‘obliged’ was not, after all, too strong a word.",
      anchors: ["determined that her reply to Mr. Vane should be cool", "the third, though admirably cold, ran to three pages", "too strong a word"],
      key: "Henrietta’s painstaking efforts to seem indifferent to Mr. Vane reveal the very interest that she means to hide.",
      wrong: [
        ["Henrietta is indifferent to Mr. Vane and wishes only to thank him briefly and politely for sending her the books.",
         "This accepts the coolness she aims for; four drafts and an hour’s worry over one word show that she is anything but indifferent."],
        ["Henrietta fears that her finished reply is so cold that it will offend Mr. Vane and bring their acquaintance to an end.",
         "Her last worry is that ‘obliged’ is too strong, that is, too warm, not that the letter is too cold."],
        ["Henrietta’s third draft of her reply to Mr. Vane was cold enough in tone but, at three pages, far too long to send.",
         "This is a true detail about one draft, not the point of the whole passage."],
      ],
      why: "Henrietta means to write coolly, but she drafts the letter four times, rejects a cold draft for its length, and then worries for an hour that ‘obliged’ is too strong; her effort betrays the interest she wants to conceal.",
    },
    {
      scene: "ii-cid-period-photograph-painting",
      kind: "essay",
      text:
        "When the photograph first appeared, many predicted the death of painting; what need of the painter’s slow hand, when a machine could fix a likeness in an instant? The prophecy has not been fulfilled, though it has not been entirely mistaken either. The painter of likenesses, who made his living by recording faces for the mantelpiece, has indeed been driven from the field. But painting itself, relieved of the duty of record, has turned to what no lens can supply—the painter’s own way of seeing—and has seldom been more various or more alive.",
      anchors: ["many predicted the death of painting", "has not been entirely mistaken either", "relieved of the duty of record"],
      key: "Photography ended painting’s work of recording likenesses but left painting free to pursue what no camera can supply.",
      wrong: [
        ["The photograph has had little lasting effect on painting, which has continued very much as it was before.",
         "The author says painters of likenesses were driven from the field, so photography did change painting."],
        ["The photograph has brought about the death of painting, just as many predicted when it first appeared.",
         "The author says this prophecy “has not been fulfilled.”"],
        ["Photographs are inferior to paintings because no lens can capture the painter’s own way of seeing.",
         "The author says painting turned to what a lens cannot supply but never ranks photographs below paintings."],
      ],
      why: "The author says the prediction was partly right and partly wrong: photography drove out the painter of likenesses, but painting, freed from recording, turned to the painter’s own way of seeing.",
    },
  ];

  const PERIOD_GUIDE = {
    fiction: {
      steps: [
        "Note how the character is first described: a reputation, a stated resolve, or a claim about himself or herself.",
        "Find the turn (yet, but, a closing remark) and what the character actually does or reveals after it.",
        "Choose the statement that holds both parts together, rejecting a true detail, the first impression taken at face value, and anything the text does not show.",
      ],
      trap: "Accepting the character’s reputation or stated intention at face value when the closing sentences show otherwise.",
      hint: "Compare how the character is first described with what the final sentences show.",
    },
    essay: {
      steps: [
        "Identify the common view the essay reports (“it is said,” “it is the fashion,” “we are apt to”).",
        "Find the author’s own position, including what the author grants to that view.",
        "Choose the statement of the author’s position at its actual strength, neither the reported view nor an overstated version.",
      ],
      trap: "Choosing the view the author reports in order to qualify it, or an overstated version of the author’s own point.",
      hint: "Separate the view the author reports from the position the author takes.",
    },
  };

  const periodProse = {
    ...RW,
    id: "central-idea-period-prose",
    skill: "Central Ideas and Details",
    subskill: "main idea",
    difficulty: "Hard",
    title: "Main idea of an original passage in older literary prose",
    recognize:
      "Older syntax and irony delay the point: the main idea emerges only when the opening view or reputation is weighed against what the closing sentences show.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["too-narrow", "too-broad", "misattributed-view", "opposite-stance"],
    build(t) {
      const topic = t.pick(PERIOD_PROSE_TOPICS);
      const guide = PERIOD_GUIDE[topic.kind];
      const content = `${PERIOD_HEADERS[topic.kind]}\n\n${topic.text}`;
      return mc("Hard", topic, {
        stimulus: passage(content),
        stem: "Which choice best states the main idea of the text?",
        correct: topic.key,
        wrong: topic.wrong,
        explanation: `${topic.why} The main idea is therefore: ${topic.key}`,
        steps: guide.steps,
        principles: [
          "In older prose the point often arrives late, after a qualification or an ironic remark; the main idea must account for it.",
          "A statement of the main idea must be no stronger and no narrower than the text as a whole.",
        ],
        trap: guide.trap,
        hint: guide.hint,
        verify: () =>
          topic.wrong.length === 3 && inOrder(content, topic.anchors) && allDistinct(topic.key, topic.wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Central Ideas: main idea of an original short poem with a turn      */
  /* ------------------------------------------------------------------ */

  // Original poems of 10 to 14 lines (never excerpts), in several forms:
  // blank verse, couplets, ballad quatrains, free verse. Each sets up one
  // view and turns ("But now", "And yet", "Then I learned"), so the main
  // idea needs the lines before and after the turn. The distractors are the
  // view before the turn, a literal image, and an overstated or generalized
  // reading. `lines` keeps the poem's line breaks; stanzas are separated by a
  // blank line.
  const POEM_HEADER = "The following text is from an original poem.";
  const POEM_TOPICS = [
    {
      scene: "ii-cid-poem-darned-sleeve",
      lines:
        "My grandmother’s sweater wore through at the elbow,\nand I, who cannot knit, have darned the hole\nwith wool that almost matches. Anyone\ncan see the patch: a coarse, uneven square,\na lighter blue. I meant at first to hide it,\nto turn the sleeve so no one would remark it.\nBut now I wear it outward. Let them see\nwhere her work ended and where mine began,\nthe place her careful stitches gave, and mine,\nclumsy and willing, took the strain instead.",
      anchors: ["I meant at first to hide it", "But now I wear it outward", "took the strain instead"],
      key: "The speaker comes to wear the clumsy patch openly as a sign of carrying on the grandmother’s work.",
      wrong: [
        ["The speaker wants to hide the clumsy patch so that no one will notice how little skill went into it.",
         "This is what the speaker “meant at first”; the poem turns when the speaker decides to wear the patch outward."],
        ["The speaker regrets never having learned to knit well enough to repair the grandmother’s sweater properly.",
         "The speaker admits to being unable to knit, but the poem expresses acceptance of the clumsy patch, not regret."],
        ["The speaker’s patch is a coarse, uneven square of wool in a lighter blue than the rest of the sweater.",
         "This describes the patch accurately but misses what the speaker comes to feel about it."],
      ],
      why: "At first the speaker meant to hide the uneven patch, but after the turn (“But now I wear it outward”) the speaker displays it as the place where the grandmother’s work ended and the speaker’s began.",
    },
    {
      scene: "ii-cid-poem-lit-windows",
      lines:
        "At two a.m. I thought the city slept\nand I alone was restless in it, kept\nawake by nothing I could name. I stood\nand raised the blind. Across the neighborhood\nwere windows lit—a dozen, maybe more:\na kitchen, then a stairwell, then a floor\nwhere someone paced. I do not know their names\nor what they grieve. And yet those scattered flames\nseemed less like strangers than like company,\na dozen others, sleepless, just like me.",
      anchors: ["I thought the city slept", "Across the neighborhood", "And yet those scattered flames"],
      key: "The speaker’s sense of being alone in sleeplessness gives way to a feeling of kinship with unseen neighbors.",
      wrong: [
        ["Seeing strangers awake in the night makes the speaker feel even more isolated than before.",
         "This reverses the turn: the lit windows seem to the speaker “less like strangers than like company.”"],
        ["The speaker resolves to meet the neighbors whose windows are lit, now that it is clear they share the same trouble.",
         "The speaker does not know their names or what they grieve and never plans to meet them; this adds an intention the poem lacks."],
        ["The speaker notices a kitchen, a stairwell, and a floor where someone paces in the middle of the night.",
         "These are the lit windows the speaker sees, a true detail rather than what the sight comes to mean."],
      ],
      why: "The speaker begins feeling alone in a sleeping city; after the turn (“And yet”), the lit windows seem “less like strangers than like company.”",
    },
    {
      scene: "ii-cid-poem-heron-stillness",
      lines:
        "The heron has not moved since I sat down.\nIt stands in the gray shallows like a post\nthat someone forgot to pull, one leg tucked up,\nits long neck folded into a question mark.\nI have checked my watch four times. I have thought\nof all the things I ought to be doing.\nThen, faster than I can follow, the neck\nunfolds, the beak goes in and comes up silver.\nAll that stillness, I see now, was not rest.\nIt was the work. It was the whole of the work.",
      anchors: ["has not moved since I sat down", "Then, faster than I can follow", "was not rest"],
      key: "The speaker realizes that the heron’s long stillness, which seemed idle, was itself the effort that won its catch.",
      wrong: [
        ["Watching the heron, the speaker concludes that it wasted the whole morning resting before it finally decided to hunt.",
         "This is how the stillness looked before the strike; the speaker then sees that it “was not rest.”"],
        ["The speaker decides to set aside the tasks that need doing in order to spend more time watching birds.",
         "The speaker only thinks of those tasks while waiting; the poem never shows such a decision."],
        ["The poem contrasts the heron’s sudden speed in catching a fish with the slowness of the speaker’s own work.",
         "The strike is fast, but the poem’s point is that the stillness before it was the real work; the speaker’s work is never called slow."],
      ],
      why: "The speaker waits impatiently while the heron stands still; after its sudden catch, the speaker sees that the stillness “was not rest” but “the whole of the work.”",
    },
    {
      scene: "ii-cid-poem-buried-creek",
      lines:
        "In the library’s drawer I found the town\nas it was drawn a hundred years ago:\nthe same main street, the church, the lumberyard,\nand, curving through the place where I was born,\na creek I never knew was there. I walked\nits route that evening. Nothing: parking lots,\na laundromat, a row of shuttered shops.\nBut at the corner where the map’s blue line\nruns under Elm, the pavement dips, and rain\neach spring still gathers there and will not drain.",
      anchors: ["a creek I never knew was there", "Nothing: parking lots", "But at the corner where the map’s blue line"],
      key: "Though the creek on the old map has vanished from view, the speaker finds that it still quietly shapes the town.",
      wrong: [
        ["The speaker is disappointed to find that nothing at all remains of the creek shown on the old map.",
         "This stops at “Nothing”; the final lines show that the creek still makes rain gather at the corner."],
        ["The speaker believes the town should uncover and restore the creek that it paved over long ago.",
         "The speaker never argues for restoring the creek; the poem records what remains of it."],
        ["Comparing the map with the street, the speaker concludes that old maps are unreliable guides to towns.",
         "The map proves accurate about the creek; the dip where the blue line runs under Elm confirms it."],
      ],
      why: "The speaker walks the buried creek’s route and at first finds “Nothing,” but the last lines show rain still gathering where the creek runs under Elm.",
    },
    {
      scene: "ii-cid-poem-frost-roses",
      lines:
        "I came at dawn to mourn the rose\nThe early frost had slain,\nTo count, as every mourner knows,\nWhat will not bloom again.\n\nBut every withered leaf was laced\nWith silver, fine and white,\nAs if the hand that laid it waste\nHad left a gift by night.\n\nI stood there long, and did not know\nWhich thing I came to see:\nThe garden that the frost laid low,\nOr what it left for me.",
      anchors: ["I came at dawn to mourn the rose", "But every withered leaf was laced", "Which thing I came to see"],
      key: "Coming to grieve roses killed by frost, the speaker is surprised to find beauty in the frost itself.",
      wrong: [
        ["Arriving at dawn, the speaker mourns the roses and resents the frost for destroying them before their time.",
         "This is the mood the speaker arrives with; the second stanza finds the frost’s silver a “gift.”"],
        ["The speaker decides that the frost’s silver lace is more beautiful than the roses themselves ever were.",
         "The speaker says only that it is unclear which one drew the speaker there; the poem never ranks the frost above the roses."],
        ["The speaker reflects that every loss in life is eventually followed by a greater gain.",
         "The poem describes one morning’s mixed feelings; it makes no claim about every loss."],
      ],
      why: "The speaker arrives to mourn the frost-killed roses, finds the frost’s silver like “a gift,” and ends unsure which of the two drew the speaker there.",
    },
    {
      scene: "ii-cid-poem-piano-tuner",
      lines:
        "Every October the tuner comes, and kneels\ninside the piano like a man at prayer,\nand works the pins until each string agrees\nwith what his fork insists. I used to think\nhe left it perfect. Then I learned the truth:\nby Christmas, cold and furnace heat have pulled\nthe strings apart again, a little flat,\na little quarrelsome. He knows. He’ll come\nagain next fall, and kneel, and bring them back.\nIt isn’t that he fixes it. He keeps it.",
      anchors: ["I used to think", "Then I learned the truth", "He keeps it"],
      key: "The speaker sees the tuner’s work as care that must be renewed each year, not as a lasting repair.",
      wrong: [
        ["The speaker believes the tuner leaves the piano perfectly in tune from one October to the next.",
         "This is what the speaker “used to think” before learning that the strings drift by Christmas."],
        ["The speaker concludes that the tuner is careless, since the piano falls out of tune within a few months.",
         "The drift comes from cold and furnace heat, and the tuner expects it; the poem honors his return, not his carelessness."],
        ["The speaker realizes that nothing people make can be kept in good order for more than a season.",
         "The poem shows one piano kept in order by yearly care; it makes no claim about everything people make."],
      ],
      why: "The speaker used to think the tuning was permanent, then learned that the strings drift by Christmas; the tuner’s yearly return is upkeep: “It isn’t that he fixes it. He keeps it.”",
    },
    {
      scene: "ii-cid-poem-attic-letters",
      lines:
        "I climbed into the attic for their letters,\nmy great-grandparents’, sure that they would hold\nthe love that books had taught me: vows, and longing,\nand moonlight. What I found instead was prices—\neggs, and coal, and what a plow would cost—\nand weather, and who was sick, and who was well,\nand every letter closing the same way:\nWrite soon. The roof is fixed. The calf is strong.\nI read them all, and put them back, and saw\nthe love was there the whole time, in the coal,\nthe roof, the calf: the vow, the moon, the longing.",
      anchors: ["sure that they would hold", "What I found instead was prices", "the love was there the whole time"],
      key: "The speaker comes to see the letters’ plain news of daily life as an expression of love.",
      wrong: [
        ["The speaker is disappointed that the letters hold no love at all, only news of prices, weather, and health.",
         "This is the speaker’s first reaction; the closing lines find the love “there the whole time” in that news."],
        ["The speaker concludes that the great-grandparents’ marriage was unhappy, since they wrote only about practical matters.",
         "The poem draws the opposite conclusion: the practical news carried their love."],
        ["The speaker decides that love stories in books give a false picture of how people have always loved.",
         "The poem contrasts the letters with what books taught, but it judges neither all books nor all people; it concerns one family’s letters."],
      ],
      why: "Expecting vows and longing, the speaker finds prices, weather, and health, then sees that the love was “there the whole time” in that plain news.",
    },
    {
      scene: "ii-cid-poem-swallows",
      lines:
        "All summer, swallows stitched the evening air\nabove the barn, and I grew used to them\nthe way one grows used to breathing. Now they’re gone.\nThe eaves are empty and the wires are bare,\nand I, who never thought of them at all\nwhile they were here, can think of nothing else.\nHow strange, that a thing must leave before it’s seen,\nthat absence draws the outline presence hid.\nNext spring, when they come back, I mean to watch them\nas if they were already going.",
      anchors: ["grew used to them", "Now they’re gone", "Next spring, when they come back"],
      key: "The speaker notices the swallows only after they leave and resolves to attend to them when they return.",
      wrong: [
        ["The speaker is relieved that the swallows have gone, since their constant motion had become a distraction.",
         "The speaker had grown used to the swallows “the way one grows used to breathing,” not tired of them."],
        ["The speaker fears that the swallows, now gone from the eaves and the wires, will never return to the barn.",
         "The speaker expects them back: “Next spring, when they come back.”"],
        ["The speaker believes that people value only those things that they have lost forever.",
         "The swallows are not lost forever, and the speaker plans to value them while they are present."],
      ],
      why: "The swallows went unnoticed while present; their absence makes the speaker see them, and the speaker plans to watch them next spring “as if they were already going.”",
    },
    {
      scene: "ii-cid-poem-recipe-card",
      lines:
        "My grandmother’s recipe card says “enough”:\nenough flour, enough salt, a little oil,\nbake until it’s right. For years I’ve tried\nto turn it into measures, cups and grams,\na temperature, a time, and every loaf\ncomes out correct and wrong. My mother laughs.\nShe says the card was never meant to teach;\nit only jogged the memory of hands\nthat stood beside her, watching, twenty times.\nMy mother’s hands remember. So on Sunday\nI’ll stand beside my mother, and I’ll watch.",
      anchors: ["For years I’ve tried", "never meant to teach", "I’ll stand beside my mother"],
      key: "The speaker realizes that the grandmother’s bread must be learned by watching someone make it, not from the card.",
      wrong: [
        ["The speaker concludes that written recipes are useless and that all cooking must be learned by watching.",
         "The poem is about one card written as a reminder for people who had watched; it makes no claim about all recipes."],
        ["The speaker has at last converted the grandmother’s recipe into exact measures of cups and grams.",
         "The measured loaves come out “correct and wrong,” so the conversion has not worked."],
        ["The speaker’s mother mocks the speaker for being unable to bake bread as well as the grandmother did.",
         "The mother laughs and explains the card; the poem shows her helping, not mocking."],
      ],
      why: "The speaker’s measured loaves fail; the mother explains that the card only reminded hands that had watched the grandmother, so the speaker will learn by watching the mother.",
    },
    {
      scene: "ii-cid-poem-old-bridge",
      lines:
        "They’ve pulled the old bridge down. The town turned out\nto watch the iron go, and some of us\nwere sorry, and said so, and said the new one,\nconcrete and flat and wide enough for trucks,\nwould never be the same. Of course it won’t.\nBut I remember my grandfather saying\nthe iron bridge was ugly when it came,\na cheap thing thrown across the river’s face,\nand that for years he took the long way round.\nGive it some time. Give it a flood or two,\na few first kisses and a funeral.\nSomebody’s grandchild will be sorry, too.",
      anchors: ["They’ve pulled the old bridge down", "But I remember my grandfather saying", "Somebody’s grandchild will be sorry, too"],
      key: "Since the old bridge was once disliked too, the speaker expects the new one to be loved in time.",
      wrong: [
        ["The speaker agrees with the townspeople that the new concrete bridge will never be loved as the iron one was.",
         "The speaker grants that the new bridge won’t be “the same” but predicts that it too will be missed someday."],
        ["The speaker believes the town was foolish to mourn the old iron bridge, which was ugly from the start.",
         "The speaker never calls the mourning foolish; the grandfather’s old dislike is recalled to show how feelings about a bridge change."],
        ["Years ago, the speaker’s grandfather avoided the iron bridge by taking a longer way around the river.",
         "This is a true detail the speaker recalls, not the point of the whole poem."],
      ],
      why: "The town mourns the old bridge, but the speaker recalls that it too was once disliked and predicts that the new bridge will earn the same attachment in time.",
    },
    {
      scene: "ii-cid-poem-snow-two-streets",
      lines:
        "The snow came down on Mercer Street\nAnd down on Harrow Lane,\nAnd laid the rich man’s iron gate\nBeside the poor man’s pane\n\nIn one white line; and for a night\nThe town was all one town,\nAs though the sky had set things right\nBy simply coming down.\n\nBut morning brought the carts, and men\nWith shovels, and the sun,\nAnd Mercer Street was swept, and then\nThe town was two, not one.",
      anchors: ["The snow came down on Mercer Street", "The town was all one town", "The town was two, not one"],
      key: "A night’s snow makes a divided town look like one town, but the effect vanishes as soon as the morning’s work begins.",
      wrong: [
        ["The snowfall ends the division between the town’s rich and poor streets and unites the people who live on them.",
         "This stops at the second stanza; the third shows the division returning with the morning."],
        ["In one white line, the snow covers both the rich man’s iron gate and the poor man’s windowpane.",
         "This is the image of the first stanza, a detail rather than the point of the whole poem."],
        ["The speaker welcomes the morning sun for melting the snow that had buried the streets of the town.",
         "The morning brings no relief in the poem; with it the town is “two, not one” again."],
      ],
      why: "The first two stanzas show snow making the rich and poor streets one town for a night; the third shows the morning’s shoveling restoring the division.",
    },
  ];

  const poemMainIdea = {
    ...RW,
    id: "central-idea-poem",
    skill: "Central Ideas and Details",
    subskill: "main idea",
    difficulty: "Hard",
    title: "Main idea of an original short poem with a turn",
    recognize:
      "A short poem sets up one view and then turns; the main idea joins what the speaker understands after the turn with what came before, rather than restating one image or the feeling before the turn.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["too-narrow", "too-broad", "opposite-stance"],
    build(t) {
      const topic = t.pick(POEM_TOPICS);
      const content = `${POEM_HEADER}\n\n${topic.lines}`;
      const lineCount = topic.lines.split("\n").filter((line) => line.trim()).length;
      return mc("Hard", topic, {
        stimulus: passage(content),
        stem: "Which choice best states the main idea of the text?",
        correct: topic.key,
        wrong: topic.wrong,
        explanation: `${topic.why} The main idea is therefore: ${topic.key}`,
        steps: [
          "Read the poem through once and note what the speaker thinks or feels at the start.",
          "Find the turn and what the speaker understands after it.",
          "Choose the statement that covers the whole poem, rejecting a single image, the feeling before the turn, and any claim broader than the poem makes.",
        ],
        principles: [
          "A short poem’s main idea usually lies in how its turn changes what came before.",
          "An image can be vivid and accurate and still be only a detail.",
        ],
        trap: "Choosing the speaker’s feeling before the turn, or a vivid image, as though it were the poem’s point.",
        hint: "Find where the poem turns, and ask what the speaker understands after that point.",
        verify: () =>
          topic.wrong.length === 3 && lineCount >= 8 && lineCount <= 16 &&
          inOrder(content, topic.anchors) && allDistinct(topic.key, topic.wrong),
      });
    },
  };

  return [
    statedClaim,
    statedReason,
    literaryFact,
    correctedBelief,
    literaryMainIdea,
    qualifiedSource,
    expectedFound,
    periodProse,
    poemMainIdea,
  ];
});
