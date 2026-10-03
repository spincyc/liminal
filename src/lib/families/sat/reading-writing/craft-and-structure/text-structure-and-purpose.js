(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const families = factory(S);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Text Structure and Purpose templates (Craft and Structure). Each
  // template is one question design paired with its own bank of topics;
  // every topic is one scene.

  const TSP_lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);
  const TSP_inOrder = (text, markers) => {
    let from = -1;
    return markers.every((marker) => {
      const at = text.indexOf(marker, from + 1);
      if (at <= from) return false;
      from = at;
      return true;
    });
  };

  /* ------------------------------------------------ 1. main purpose: explain */

  // Each topic is an informational passage that introduces a phenomenon and
  // walks through how or why it happens. `cue` is the causal link the
  // explanation turns on; `detail` is the one step the too-narrow choice names.
  // The key's verb rotates (explain, describe, show, outline, account for) and
  // the same verbs open distractors elsewhere, so no opening verb marks the
  // key; lengths are balanced so the key is sometimes longest, sometimes
  // shortest.
  const TSP_EXPLAIN_TOPICS = [
    {
      scene: "cs-sea-ice-salt",
      passage:
        "When seawater begins to freeze, the growing ice crystals cannot hold salt, so most of it is pushed out into tiny pockets of concentrated brine trapped between the crystals. Over the following months, this heavy brine slowly drains downward through channels in the ice and escapes into the ocean below. As a result, ice that has survived a full year is far less salty than ice that formed only weeks earlier, and in some polar regions people have melted old sea ice for drinking water.",
      cue: "As a result",
      detail: "brine",
      key: "To explain how sea ice loses much of its salt in the months after it forms",
      argue: "To argue that old sea ice is the best source of drinking water",
      narrow: "To describe the brine pockets trapped between ice crystals",
      other: "To compare sea ice in different polar regions",
    },
    {
      scene: "cs-goose-v-formation",
      passage:
        "Migrating geese often fly in a V formation, and the shape saves them energy. As each bird flaps, air spilling off the tips of its wings swirls upward behind it. A goose flying just behind and to the side of another can position itself in this rising air, which gives it a slight lift and lets it flap less often. Because the lead bird gets no such help, geese take turns at the front of the V, sharing the most tiring position over a long flight.",
      cue: "which gives it a slight lift",
      detail: "tips",
      key: "To describe how flying in a V formation lets geese save energy on long flights",
      argue: "To argue that geese cooperate more than other migrating birds do",
      narrow: "To explain why air swirls upward off the tips of a goose’s wings",
      other: "To compare geese with birds that migrate alone",
    },
    {
      scene: "cs-sourdough-leavening",
      passage:
        "A sourdough starter is a paste of flour and water in which wild yeasts and bacteria live together. When a baker mixes some starter into fresh dough, the yeasts feed on sugars in the flour and release carbon dioxide gas. The gas collects in bubbles held in place by the dough’s stretchy gluten, and the loaf rises. Meanwhile, the bacteria produce lactic and acetic acids, which give sourdough bread its sharp, tangy flavor.",
      cue: "release carbon dioxide gas",
      detail: "gluten",
      key: "To show how the microbes in a sourdough starter make bread rise and taste sour",
      argue: "To argue that sourdough is better than bread made with packaged yeast",
      narrow: "To describe how gluten traps gas bubbles in dough",
      other: "To compare the flavors of different starters",
    },
    {
      scene: "cs-city-heat-night",
      passage:
        "On summer nights, the center of a large city can be several degrees warmer than the countryside around it. The difference begins during the day, when asphalt, brick, and concrete absorb far more of the sun’s energy than fields and forests do. After sunset, these materials release that stored heat slowly into the air. Tall buildings strengthen the effect by blocking much of the open sky, which would otherwise allow heat to escape upward.",
      cue: "release that stored heat",
      detail: "open sky",
      key: "To outline why city centers stay warm at night",
      argue: "To recommend that cities replace asphalt with lighter, cooler paving materials",
      narrow: "To describe how tall buildings block the open sky above a city’s streets",
      other: "To compare summer night temperatures in cities of several different sizes",
    },
    {
      scene: "cs-ranked-ballot-count",
      passage:
        "In 2021, the city of Brenmoor began electing its mayor by ranked ballots. Voters list the candidates in order of preference rather than choosing just one. If no candidate is the first choice of more than half the voters, the candidate with the fewest first-choice votes is eliminated, and each ballot that ranked that candidate first is counted instead for the voter’s next choice. The process repeats until one candidate holds a majority.",
      cue: "The process repeats",
      detail: "2021",
      key: "To describe how Brenmoor’s ranked-ballot count works",
      argue: "To argue that ranked ballots produce fairer results than single-choice ballots",
      narrow: "To note the year, 2021, when Brenmoor began using ranked ballots for mayor",
      other: "To compare the candidates in Brenmoor’s first ranked-ballot mayoral election",
    },
    {
      scene: "cs-fresco-lime",
      passage:
        "In true fresco, a painter works on fresh, damp lime plaster, applying pigments mixed only with water. The pigments do not simply sit on the surface. As the plaster dries over the following days, the lime in it reacts with carbon dioxide in the air to form calcium carbonate, a hard mineral that grows around the pigment particles and locks them into the wall itself. This is why true frescoes can keep their colors for centuries.",
      cue: "This is why",
      detail: "water",
      key: "To show how fresco pigments become part of the wall",
      argue: "To explain why fresco is the most durable of all the methods of painting walls",
      narrow: "To describe the water that fresco painters mix with their powdered pigments",
      other: "To compare the colors of frescoes that were painted in different centuries",
    },
    {
      scene: "cs-paper-watermarks",
      passage:
        "Early European papermakers formed each sheet by dipping a mold, a wooden frame with a screen of fine wire, into a vat of pulp. To mark their paper, many makers bent wire into a small design, such as a bell or a hand, and sewed it onto the screen. Pulp settled more thinly over the raised wire, so the finished sheet was slightly thinner there. When the sheet was held up to light, the design appeared as a pale shape: a watermark.",
      cue: "so the finished sheet was slightly thinner",
      detail: "bell",
      key: "To explain how early papermakers created watermarks",
      argue: "To argue that watermarks are the best way to date old paper",
      narrow: "To describe the bells and hands used as watermark designs",
      other: "To compare paper molds from several countries",
    },
    {
      "scene": "cs-tree-ring-dating",
      "passage": "Many temperate trees add an annual ring of wood. In a region where water limits growth, those rings tend to be wider in wet years and narrower in dry ones, creating a pattern shared by many trees. Researchers have linked such sequences from living trees, old buildings, and buried logs into a record stretching back centuries. If a beam retains the tree’s outermost ring beneath the bark, matching that ring to the record can identify the year the tree was cut.",
      "cue": "matching that ring",
      "detail": "dry",
      "key": "To describe how tree rings can reveal when a beam was cut",
      "argue": "To argue that many old buildings are older than was thought",
      "narrow": "To point out that rings are wide in wet years and narrow in dry ones",
      "other": "To show how temperate and tropical trees differ"
    },
    {
      scene: "cs-pitcher-plant-trap",
      passage:
        "Pitcher plants grow in bogs where the soil holds few nutrients, and they make up the difference by trapping insects. Each plant forms a deep, tube-shaped leaf. Nectar on the leaf’s rim draws insects in, but the rim is slick, especially when damp, and visitors easily slip. Inside, waxy walls give them nothing to grip, and they fall into a pool of fluid at the bottom, where the plant slowly digests them and absorbs their nutrients.",
      cue: "they make up the difference",
      detail: "nectar",
      key: "To outline how pitcher plants capture and digest insects",
      argue: "To argue that pitcher plants could not survive outside bogs",
      narrow: "To describe the nectar on the rim of each pitcher",
      other: "To explain how pitcher plants differ from other plants that eat insects",
    },
    {
      scene: "cs-violin-sound-post",
      passage:
        "Inside every violin, a small wooden dowel called the sound post stands upright between the instrument’s top and back. It is not glued; it is held in place only by the pressure of the strings pushing down through the bridge. When a string vibrates, the bridge rocks, and the sound post carries those vibrations from the thin top to the back, so the whole body of the violin resonates. Moving the post even a millimeter can noticeably change the instrument’s tone.",
      cue: "carries those vibrations",
      detail: "pressure",
      key: "To explain how the sound post helps a violin’s body resonate",
      argue: "To argue that violin makers should glue the sound post in place",
      narrow: "To describe the pressure that holds the sound post upright",
      other: "To compare violins made by different craftspeople",
    },
    {
      scene: "cs-stone-arch-keystone",
      passage:
        "A stone arch can stand for centuries without any mortar. Each stone in the curve is cut into a wedge, wider at the top than at the bottom. The weight of the stones above presses each wedge against its neighbors, so the stones squeeze together rather than slipping apart, and the force travels around the curve and down into the supports at either side. The last stone set at the top, the keystone, locks the others in place.",
      cue: "so the stones squeeze together",
      detail: "keystone",
      key: "To account for how a stone arch holds together without mortar",
      argue: "To argue that stone arches are stronger than modern steel beams",
      narrow: "To describe the keystone set at the very top of an arch",
      other: "To show how arch designs differed across centuries and regions",
    },
  ];

  const tspMainPurposeExplain = {
    id: "tsp-main-purpose-explain",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "author's purpose",
    difficulty: "Easy",
    title: "Main purpose of an explanatory passage",
    recognize:
      "The text introduces a phenomenon and walks through how it happens without taking a side; its purpose is to explain, not to argue, and not to describe one step.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 0 },
    tricks: ["too-narrow", "too-broad"],
    build(t) {
      const topic = t.pick(TSP_EXPLAIN_TOPICS);
      const choices = [topic.key, topic.argue, topic.narrow, topic.other];
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.passage },
        stem: "Which choice best states the main purpose of the text?",
        correct: topic.key,
        wrong: [
          [topic.argue, "The text lays out how something works without taking a side; it never makes or defends this claim."],
          [topic.narrow, "This detail is one step in the text’s explanation, not what the text as a whole sets out to do."],
          [topic.other, "The text never makes this comparison; it traces a single process from start to finish."],
        ],
        explanation: `The text introduces a phenomenon and then walks through the steps that produce it, so its main purpose is ${TSP_lower(topic.key)}.`,
        steps: [
          "Read the first sentence to see what the text is about.",
          "Notice whether the later sentences argue, compare, or lay out causes and steps.",
          "Choose the purpose that covers the whole text, not a single detail within it.",
        ],
        principles: [
          "A main-purpose answer must fit every part of the text, not just one sentence.",
          "A text that explains a process without judging it has an explanatory purpose, not an argumentative one.",
        ],
        trap: "Picking the choice that names a vivid detail from the middle of the text, which is only one step of the explanation.",
        hint: "Ask what the sentences after the first one are doing together.",
        estimatedSeconds: 60,
        verify: () =>
          topic.passage.includes(topic.cue) &&
          topic.passage.toLowerCase().includes(topic.detail.toLowerCase()) &&
          topic.narrow.toLowerCase().includes(topic.detail.toLowerCase()) &&
          new Set(choices).size === 4,
      };
    },
  };

  /* ------------------------------------------- 2. function: specific example */

  // A general claim, then the quoted sentence: one concrete case of it. The
  // key's verb rotates (offers, gives, describes, provides, presents) and the
  // distractors use the same verbs. In some scenes the counter-case shares
  // the key's frame and in others the counter-case and the cause share one,
  // so neither the most alike pair nor the choice most like the others marks
  // the key.
  const TSP_EXAMPLE_TOPICS = [
    {
      scene: "cs-octopus-texture",
      claim: "Octopuses are famous for changing color, but many can also change the texture of their skin.",
      example: "One common octopus filmed off a rocky shore raised dozens of small bumps along its back until it resembled the barnacle-crusted stone beside it.",
      after: "Such shifts in texture help an octopus disappear against surfaces that color alone could not match.",
      key: "It offers a specific case of an octopus changing the texture of its skin to hide.",
      contra: "It describes the behavior of an octopus that runs counter to the claim about skin texture.",
      main: "It states the general claim about octopus skin that the text then supports.",
      cause: "It describes the reason that an octopus is able to change the color of its skin.",
    },
    {
      scene: "cs-shade-coffee-birds",
      claim: "Coffee farms that keep native trees standing over their crops can shelter a surprising variety of birds.",
      example: "On one shade-grown farm in the hills above Sollano, surveyors counted more than 150 bird species among the coffee bushes, nearly as many as in the neighboring forest.",
      after: "Farms that clear the canopy to grow coffee in full sun typically support only a fraction of that number.",
      key: "It gives one example of a coffee farm that shelters a great many kinds of birds.",
      contra: "It gives one example of a coffee farm whose shade trees drove most birds away.",
      main: "It introduces the main claim about shade-grown coffee that the text then supports.",
      cause: "It introduces the reason some farmers grow coffee in full sun, which the text then explains.",
    },
    {
      scene: "cs-silent-film-pianist",
      claim: "Silent films were rarely watched in silence; most theaters hired musicians to accompany every screening.",
      example: "At the Orpheum in Castleton, the pianist Ida Marsh played beneath each film, shifting from gentle waltzes during courtship scenes to pounding chords during chases.",
      after: "For many viewers, such music shaped the mood of a film as much as the images did.",
      key: "It presents one case of a pianist who accompanied silent films at a theater.",
      contra: "It presents one case of a theater that showed silent films without music.",
      main: "It states the text’s main claim about how silent films were shown.",
      cause: "It states why theaters eventually stopped hiring musicians for films.",
    },
    {
      scene: "cs-marsh-road-timber",
      claim: "Road builders in the ancient world adjusted their methods to the ground they had to cross.",
      example: "Where one Roman road in northern Gaul passed through marshland, its builders laid rafts of timber beneath the gravel so that the road would not sink.",
      after: "On firm, rocky ground, the same builders often set their paving stones almost directly on the bedrock.",
      key: "It describes one instance of builders adapting a road to the ground it crossed.",
      contra: "It explains how Roman builders came to ignore the ground beneath their roads.",
      main: "It states the general claim about ancient roads that the text supports.",
      cause: "It explains why Roman roads came to be built with layers of gravel.",
    },
    {
      scene: "cs-bloodroot-ants",
      claim: "Some plants rely on animals to carry their seeds away from the parent plant.",
      example: "Each seed of the bloodroot, a woodland wildflower, bears a small fatty attachment that ants drag back to their nests, where they eat the attachment and discard the seed.",
      after: "The seed is left in rich, protected soil, well placed to sprout the following spring.",
      key: "It provides one case of a plant whose seeds are carried away by animals.",
      contra: "It explains how a plant can scatter its seeds with no help from animals at all.",
      main: "It introduces the main claim about seed dispersal that the text then supports.",
      cause: "It explains why ants prefer woodland seeds to the other food they can find.",
    },
    {
      scene: "cs-ballad-variants",
      claim: "Folk songs often change as they pass from one community to another.",
      example: "The ballad ‘Crossing at Marrow Ford’ is sung in one valley as a tale of lost love and in the next valley as a story about a flooded mill.",
      after: "Singers in each place kept the melody but reshaped the words to suit their own concerns.",
      key: "It presents one example of a folk song that changed as it traveled from valley to valley.",
      contra: "It shows that a folk song can stay the same wherever in the valleys it is sung.",
      main: "It states the main claim about folk songs that the text goes on to support.",
      cause: "It shows why mills often flooded in the valleys where the song is sung.",
    },
    {
      scene: "cs-auto-enrollment",
      claim: "The option that people receive by default can strongly shape the choices they make.",
      example: "When the Harlow Company began enrolling new employees in its retirement plan automatically, participation rose from about half of new workers to nearly nine in ten.",
      after: "Employees could still leave the plan by filling out a single form, yet few chose to do so.",
      key: "It offers a specific case of a default option shaping people’s choices.",
      contra: "It explains that the default option at the Harlow Company had little effect on choices.",
      main: "It presents the general claim about defaults that the text then supports.",
      cause: "It explains why the Harlow Company offered its workers a retirement plan at all.",
    },
    {
      scene: "cs-venetian-glass-secrets",
      claim: "Some European cities went to great lengths to protect the secrets of their most valuable crafts.",
      example: "Glassmakers in Venice were forbidden to leave the republic without permission, and those who left to work abroad could be declared traitors.",
      after: "Such rules kept techniques for making clear glass and colored beads within a small circle of workshops for generations.",
      key: "It gives an example of a city that guarded the secrets of a prized craft.",
      contra: "It gives an example of a city that freely shared the secrets of a prized craft.",
      main: "It introduces the main claim about craft secrets that the text then supports.",
      cause: "It introduces the reason Venetian glass was valued above other glass.",
    },
    {
      scene: "cs-hummingbird-torpor",
      claim: "Some small birds survive cold nights by letting their bodies cool far below their usual daytime temperature.",
      example: "On freezing nights high in the Andes, certain hummingbirds allow their body temperature to fall below 10°C, then warm themselves again shortly before dawn.",
      after: "By cooling down, a hummingbird can greatly reduce the energy it burns overnight.",
      key: "It describes one case of birds that let their bodies cool on cold nights.",
      contra: "It describes one case of birds that keep a steady temperature through cold nights.",
      main: "It states the general claim about small birds that the text then supports.",
      cause: "It states why hummingbirds need so much energy during the day.",
    },
    {
      scene: "cs-courtyard-house",
      claim: "Traditional houses in hot, dry regions were often designed to stay cool without machinery.",
      example: "In the town of Ardana, the Merin family’s house is built around a shaded courtyard with a shallow pool, and cool air that collects there at night flows through the rooms well into the afternoon.",
      after: "Thick earthen walls also slow the midday heat from reaching the interior.",
      key: "It describes one instance of a house designed to stay cool without machines.",
      contra: "It explains how the Merin family’s house came to be hotter than the air outside.",
      main: "It provides the main claim about traditional houses that the text supports.",
      cause: "It explains why the Merin family chose to build their house in the town of Ardana.",
    },
    {
      scene: "cs-poet-revisions",
      claim: "The poet Celia Brandt was known among her friends as a relentless reviser of her own work.",
      example: "Her short poem ‘Winter Orchard’ survives in eleven handwritten drafts, and in each one she rewrote the final line.",
      after: "Even after the poem was published, she kept marking changes in the margins of her own copy.",
      key: "It provides a particular case of Brandt revising one poem again and again.",
      contra: "It provides a particular case of Brandt writing a poem quickly and never changing it.",
      main: "It states the main claim about Brandt that the rest of the text supports.",
      cause: "It states why Brandt so often chose orchards as the subject of her poems.",
    },
  ];

  const tspFunctionExample = {
    id: "tsp-function-example",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "function of a sentence",
    difficulty: "Easy",
    title: "Sentence that illustrates the claim before it",
    recognize:
      "The sentence right after a general claim names one particular case of it; its job is to illustrate that claim, not to state it, dispute it, or explain its cause.",
    rubric: { steps: 0, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["opposite-stance", "too-broad"],
    build(t) {
      const topic = t.pick(TSP_EXAMPLE_TOPICS);
      const passage = [topic.claim, topic.example, topic.after].join(" ");
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: passage },
        stem: `Which choice best describes the function of the sentence “${topic.example}” in the text as a whole?`,
        correct: topic.key,
        wrong: [
          [topic.contra, "The sentence agrees with the claim before it; nothing in it runs counter to that claim."],
          [topic.main, "The general claim comes in the sentence before; this sentence supports that claim rather than introducing it."],
          [topic.cause, "The sentence reports what happened in one case; it offers no explanation of this, and the text never raises it."],
        ],
        explanation: `The first sentence makes a general claim, and the quoted sentence follows with one concrete case of it: ${TSP_lower(topic.key)}`,
        steps: [
          "Identify the general claim in the first sentence.",
          "Check whether the quoted sentence names one particular person, place, or case.",
          "Decide whether that case agrees with the claim, and choose the function that says so.",
        ],
        principles: [
          "A sentence that names one particular case right after a general claim usually illustrates that claim.",
          "The main claim of a short text is usually stated in general terms, not through a single case.",
        ],
        trap: "Choosing the claim-introducing option because the quoted sentence is vivid, even though the claim came first.",
        hint: "Compare how general the first sentence is with how specific the quoted one is.",
        estimatedSeconds: 60,
        verify: () =>
          passage.indexOf(`${topic.claim} ${topic.example}`) === 0 &&
          passage.indexOf(topic.example) === topic.claim.length + 1 &&
          new Set([topic.key, topic.contra, topic.main, topic.cause]).size === 4,
      };
    },
  };

  /* ------------------------------------------------- 3. function: concession */

  // Claim, evidence, then the quoted concession, then a reassertion that
  // opens with one of TSP_REASSERT. The key's verb rotates (acknowledges,
  // concedes, admits, notes, points out), and the rejecting distractor uses
  // the same verbs to concede too much, so the verb alone never gives it away.
  const TSP_REASSERT = ["Even so,", "Still,", "Nevertheless,", "But ", "Yet ", "However,"];
  const TSP_CONCESSION_TOPICS = [
    {
      scene: "cs-four-day-school-week",
      claim: "Rural school districts that moved to a four-day week have seen student attendance improve.",
      evidence: "In a study of twelve such districts, average attendance rose by nearly two percentage points in the first year after the switch.",
      concession: "Admittedly, all twelve districts were small and rural, so the results may not apply to large city systems.",
      reassert: "Even so, for the many rural districts now weighing the change, the findings offer encouraging evidence.",
      key: "It acknowledges a limit on how widely the study’s results can be applied.",
      support: "It offers further evidence that attendance improved after the switch.",
      reject: "It concedes that the attendance gains reported in the study were not real.",
      newTopic: "It notes a concern about city schools that the text goes on to develop.",
    },
    {
      scene: "cs-mussel-tanks",
      claim: "Restoring mussel beds could help clear the murky water of the Callow Estuary.",
      evidence: "In a recent experiment, tanks stocked with mussels held water nearly twice as clear after a week as tanks without them, because the mussels filtered out algae as they fed.",
      concession: "The experiment took place in tanks, not in the estuary itself, where tides and currents might weaken the effect.",
      reassert: "Still, the tanks were filled with water drawn directly from the estuary, so the results are a promising sign.",
      key: "It concedes that the lab tanks differed from the estuary in some important ways.",
      support: "It provides additional evidence that mussels clear algae from the water they filter.",
      reject: "It admits that mussels are unlikely to improve the estuary’s water.",
      newTopic: "It introduces the subject of tides, which the rest of the text explores.",
    },
    {
      scene: "cs-selby-merchant-letters",
      claim: "Letters from the port of Selby in the 1700s show that many merchants’ wives managed family businesses while their husbands were at sea.",
      evidence: "The women wrote to suppliers, set prices, and settled debts, often signing contracts in their own names.",
      concession: "To be sure, the surviving letters come almost entirely from wealthy households, which could afford to store papers for generations.",
      reassert: "Nevertheless, the letters make clear that in those households, at least, women ran businesses for months at a time.",
      key: "It admits that the surviving letters may not represent all households.",
      support: "It gives another example of the business tasks the women carried out.",
      reject: "It acknowledges that women in Selby rarely took part in family businesses.",
      newTopic: "It introduces the topic of wealth in Selby, which the text then discusses.",
    },
    {
      scene: "cs-ferrand-recordings",
      claim: "The jazz pianist Odile Ferrand, critics now argue, rarely played a tune the same way twice.",
      evidence: "In the recordings that survive from her club dates in the 1950s, her chords and melodic lines differ noticeably from night to night, even on songs she performed for years.",
      concession: "Only nine of her performances were ever recorded, a tiny fraction of the hundreds she gave.",
      reassert: "But the variety within even those nine is striking enough to support the critics’ view.",
      key: "It notes how small a sample of Ferrand’s playing the nine surviving recordings are.",
      support: "It adds further evidence that Ferrand changed her chords from night to night.",
      reject: "It concedes that the critics’ view of Ferrand’s playing is mistaken.",
      newTopic: "It introduces the history of jazz recording, which the text then traces.",
    },
    {
      scene: "cs-bike-lane-sales",
      claim: "Protected bike lanes appear to have helped the shops on Harwick Street in the city of Castleford.",
      evidence: "In the year after the lanes opened, sales at the street’s shops rose by 18 percent, and owners reported more customers arriving by bicycle.",
      concession: "Sales also rose over the same year on nearby streets without bike lanes, though by only about 7 percent.",
      reassert: "The much larger gain on Harwick Street, however, suggests that the lanes deserve at least part of the credit.",
      reassertMarker: "however,",
      key: "It points out that sales grew even on streets without new bike lanes.",
      support: "It provides more evidence that shop owners gained customers on bicycles.",
      reject: "It admits that the bike lanes had no effect on sales along Harwick Street.",
      newTopic: "It introduces a debate over street parking that the text goes on to examine.",
    },
    {
      scene: "cs-exoplanet-vapor",
      claim: "Astronomers studying the distant planet Kepra-9b report that its atmosphere contains water vapor.",
      evidence: "As the planet passed in front of its star, starlight filtering through the atmosphere was dimmed at exactly the wavelengths that water vapor absorbs.",
      concession: "Granted, the signal is faint, and no second telescope has yet confirmed it.",
      reassert: "Still, it appeared in each of four separate observations, which makes a chance result unlikely.",
      key: "It concedes that the evidence for water vapor remains faint and unconfirmed.",
      support: "It offers a second line of evidence that the planet has water vapor.",
      reject: "It acknowledges that the astronomers have withdrawn their report.",
      newTopic: "It notes the telescope’s design, which the rest of the text describes.",
    },
    {
      scene: "cs-ruiz-translations",
      claim: "Marta Ruiz’s English versions of the poet Ilse Kovac succeed where earlier translations failed: they keep the rolling rhythm of Kovac’s lines.",
      evidence: "Read aloud, Ruiz’s translations move with the same long, rising cadence that readers of the original prize.",
      concession: "Ruiz does sometimes give up the exact meaning of a word to preserve that rhythm.",
      reassert: "Yet for poems whose music is their chief pleasure, that trade seems a sound one.",
      key: "It acknowledges a real cost of the approach that Ruiz takes in her translations.",
      support: "It provides further evidence that Ruiz keeps the rhythm of Kovac’s lines.",
      reject: "It concedes that Ruiz’s translations are less successful than earlier ones.",
      newTopic: "It introduces a debate about Kovac’s themes that the text then explores.",
    },
    {
      scene: "cs-late-start-sleep",
      claim: "When the Linford school district moved its high school start time from 7:30 to 8:40 a.m., students began getting more sleep.",
      evidence: "In surveys taken before and after the change, students reported sleeping about forty minutes longer on school nights.",
      concession: "Those figures come from students’ own reports, which are not always accurate.",
      reassert: "However, sleep-tracking wristbands worn by a smaller group of students recorded a similar gain.",
      key: "It admits a possible weakness in the source of the sleep figures.",
      support: "It provides further evidence that students slept longer after the change.",
      reject: "It points out that students did not actually sleep longer after the change.",
      newTopic: "It introduces the subject of survey design, which the text then explores.",
    },
    {
      scene: "cs-print-shop-literacy",
      claim: "The spread of print shops through the Low Valley in the 1500s appears to have helped many more people learn to read.",
      evidence: "Over that century, the share of brides and grooms who signed their names in parish marriage registers, rather than marking an X, roughly tripled.",
      concession: "Signing one’s name, of course, is not the same as being able to read a book.",
      reassert: "Even so, the rise in signatures, which followed the arrival of the presses, is hard to explain any other way.",
      key: "It recognizes that the evidence may not fully measure the ability to read.",
      support: "It offers more evidence that print shops spread through the Low Valley.",
      reject: "It notes that the print shops did not help anyone in the valley learn to read.",
      newTopic: "It introduces the subject of marriage customs, which the text then explores.",
    },
    {
      scene: "cs-timber-towers",
      claim: "Office towers framed in engineered timber can be built much faster than comparable concrete towers.",
      evidence: "Because their wall and floor panels are cut to size in a factory and simply bolted together on site, one eighteen-story timber tower in Oslund rose in under ten weeks.",
      concession: "The timber panels themselves cost more to produce than the equivalent concrete.",
      reassert: "But the savings in labor from such rapid construction can more than offset that higher price.",
      key: "It notes a drawback of engineered timber compared with concrete.",
      support: "It provides further evidence that timber towers can be built quickly.",
      reject: "It points out that timber towers take longer to build than concrete ones.",
      newTopic: "It introduces the subject of factory work, which the text then examines.",
    },
    {
      scene: "cs-seagrass-carbon",
      claim: "Seagrass meadows store carbon in the seafloor at a remarkable rate.",
      evidence: "In Tesh Bay, sediment cores showed that each hectare of seagrass had buried roughly twice as much carbon per year as a hectare of nearby forest.",
      concession: "The cores came from a single sheltered bay, and meadows on exposed coasts, where storms stir up sediment, may bury far less.",
      reassert: "Still, even a fraction of that rate would make seagrass an important store of carbon.",
      key: "It points out that the bay studied may not be typical of all meadows.",
      support: "It provides more evidence that seagrass buries carbon faster than forests.",
      reject: "It acknowledges that seagrass meadows store little or no carbon.",
      newTopic: "It introduces the effects of storms on coasts, which the text then explores.",
    },
  ];

  const tspFunctionConcession = {
    id: "tsp-function-concession",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "function of a sentence",
    difficulty: "Easy",
    title: "Sentence that concedes a limitation",
    recognize:
      "Between a claim and its restatement, one sentence admits a weakness or a point on the other side; it limits the claim without abandoning it.",
    // Easy: the concession is usually signposted (Admittedly, Granted, To be
    // sure) and the next sentence reasserts the claim, so one comparison
    // settles it.
    rubric: { steps: 0, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["opposite-stance", "extreme-language", "word-association"],
    build(t) {
      const topic = t.pick(TSP_CONCESSION_TOPICS);
      const passage = [topic.claim, topic.evidence, topic.concession, topic.reassert].join(" ");
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: passage },
        stem: `Which choice best describes the function of the sentence “${topic.concession}” in the text as a whole?`,
        correct: topic.key,
        wrong: [
          [topic.support, "The sentence does not strengthen the claim; it points to a weakness or a fact on the other side."],
          [topic.reject, "The sentence only limits the claim, and the final sentence reasserts it, so the text does not abandon it."],
          [topic.newTopic, "The text never develops this subject; the very next sentence returns to the original claim."],
        ],
        explanation: `The text makes a claim and supports it, then the quoted sentence admits a limitation before the final sentence reasserts the claim: ${TSP_lower(topic.key)}`,
        steps: [
          "State the claim the text makes and the evidence it gives.",
          "Ask whether the quoted sentence helps or complicates that claim.",
          "Check the next sentence: if the author returns to the claim, the quoted sentence concedes a limit rather than rejecting it.",
        ],
        principles: [
          "Authors often concede a limitation and then reaffirm their claim; the concession qualifies the claim without overturning it.",
          "Judge a sentence’s function by how the surrounding sentences treat it.",
        ],
        trap: "Reading the concession as a reversal and choosing the option that says the claim is wrong, even though the next sentence restates it.",
        hint: "Look at what the author does in the very next sentence.",
        estimatedSeconds: 75,
        verify: () => {
          const claimAt = passage.indexOf(topic.claim);
          const concessionAt = passage.indexOf(topic.concession);
          const reassertAt = passage.indexOf(topic.reassert);
          const marker = topic.reassertMarker || TSP_REASSERT.find((opening) => topic.reassert.startsWith(opening));
          return claimAt === 0 && concessionAt > claimAt && reassertAt === concessionAt + topic.concession.length + 1 &&
            Boolean(marker) && topic.reassert.includes(marker) &&
            new Set([topic.key, topic.support, topic.reject, topic.newTopic]).size === 4;
        },
      };
    },
  };

  /* ----------------------------------------------- 4. literary main purpose */

  // Original prose. `cues` are the details, in order, that establish the
  // attitude the key names. The key's verb (portray, convey, depict, show,
  // reveal) rotates and the attitude-reversing and object-naming distractors
  // borrow the same verbs.
  const TSP_LITERARY_TOPICS = [
    {
      scene: "cs-lit-grandfather-violin",
      passage:
        "Every Saturday, Nadia carried her grandfather’s violin to her lesson across town, and every Saturday she complained about it. The case was heavy and old-fashioned, its leather handle cracked, and the other students had sleek new cases that fit on their backs. This week, though, the teacher asked her to play the slow tune her grandfather had taught her. As the first notes rose, Nadia noticed the worn patch on the violin’s neck where his thumb had rested for forty years. She played more carefully than she ever had. On the walk home, she carried the case with both arms, close against her chest.",
      cues: ["complained about it", "worn patch", "close against her chest"],
      key: "To convey Nadia’s growing tenderness toward an instrument she once resented",
      narrow: "To describe the sleek cases that the other students use for their violins",
      opposite: "To portray Nadia’s mounting frustration with her grandfather’s heavy old violin",
      broad: "To suggest that young musicians should learn on older instruments",
    },
    {
      scene: "cs-lit-lighthouse-keeper",
      passage:
        "For thirty-one years, Hollis Brand climbed the ninety steps of the Carrow Point lighthouse each evening to light the lamp. When the coast guard installed an automatic beacon, they let him keep the cottage at the tower’s base. Now, at dusk, he still finds himself reaching for his coat. He watches the beacon blink on by itself, precise and untroubled, and he tells the gulls on the railing that it has never once asked how the sea looked that day. Then he goes inside and leaves the curtains open toward the water.",
      cues: ["still finds himself reaching for his coat", "never once asked", "curtains open toward the water"],
      key: "To portray a retired keeper’s lingering attachment to his former duty",
      narrow: "To depict the automatic beacon that now lights the coast at Carrow Point",
      opposite: "To convey the keeper’s relief at no longer climbing the tower each night",
      broad: "To suggest that new machines always leave older workers unhappy",
    },
    {
      scene: "cs-lit-bakery-dawn",
      passage:
        "At four each morning, before the streetlights on Alder Lane had gone out, Rosa unlocked the bakery and switched on the ovens. She liked this hour best. She knew by the sound of the mixer when the dough was ready and by the smell when the first loaves were done, and she no longer needed the timer her father had hung by the door. When the first customer arrived at six, stamping snow off his boots, the shelves were full, and Rosa, flour to her elbows, allowed herself a small, satisfied nod.",
      cues: ["She liked this hour best", "no longer needed the timer", "satisfied nod"],
      key: "To show a baker’s quiet pride in the skill of her work",
      narrow: "To portray the timer that Rosa’s father once hung beside the bakery door",
      opposite: "To convey Rosa’s weariness with the early hours that her work requires",
      broad: "To suggest that small family businesses are vanishing from cities",
    },
    {
      scene: "cs-lit-doorframe-marks",
      passage:
        "The movers had taken everything but the kitchen clock, and the apartment echoed when Theo walked through it. He had spent weeks telling his friends how much bigger the new house would be, how he would finally have a room of his own. Now he stood in the kitchen doorway, where pencil lines climbed the frame, each labeled in his mother’s handwriting: Theo, age 4; Theo, age 7; Theo, age 10. He pressed his back against the wood the way he used to, and then, before anyone could see, he took a pencil from his pocket and drew one last line.",
      cues: ["a room of his own", "pencil lines climbed the frame", "drew one last line"],
      key: "To depict a boy’s unexpected attachment to the home he was eager to leave",
      narrow: "To describe the kitchen clock that the movers left behind",
      opposite: "To show a boy’s impatience to leave the apartment for his new house",
      broad: "To convey the idea that children adjust to new homes more easily than adults",
    },
    {
      scene: "cs-lit-chess-rival",
      passage:
        "Marisol had lost to Mrs. Delacroix at the Thursday chess club three weeks in a row, and she had come this week determined not to lose a fourth time. For an hour the game went her way. Then Mrs. Delacroix, humming, slid a bishop across the board and left her own queen unprotected. Marisol stared. Taking the queen would cost her the game in five moves; ignoring it would cost her the game in seven. She sat back, and to her own surprise she laughed. “Show me how you saw that,” she said, turning the board around.",
      cues: ["determined not to lose", "she laughed", "Show me how you saw that"],
      key: "To portray a player’s rivalry giving way to real admiration for her opponent",
      narrow: "To describe the weekly chess club where the two players meet",
      opposite: "To depict Marisol’s growing anger at losing to Mrs. Delacroix yet again",
      broad: "To suggest that chess rewards patience more than daring",
    },
    {
      scene: "cs-lit-drought-orchard",
      passage:
        "It had not rained in Marlow County since April, and by August the neighbors had begun selling their orchards to a developer from the city. Ada walked her rows each evening with a bucket, giving the youngest trees a little water from the well, which was lower every week. Her son called twice to ask what she was waiting for. She told him the old trees had come through the dry years of 1952 and 1977, and they would come through this. Then she went back out and pressed her palm to the bark of the oldest pear, as if checking a pulse.",
      cues: ["giving the youngest trees a little water", "they would come through this", "checking a pulse"],
      key: "To convey a farmer’s stubborn loyalty to her orchard during a drought",
      narrow: "To describe the well that supplies water to the farms of Marlow County",
      opposite: "To portray Ada’s growing readiness to sell her orchard to the developer",
      broad: "To suggest that farmers are more patient than city dwellers",
    },
    {
      scene: "cs-lit-conductor-watch",
      passage:
        "Mr. Mensah had punched tickets on the 6:12 to Dorrington for nineteen years, and in that time the train had been late only when the weather gave it no choice. Each morning he set his pocket watch by the station clock and then, out of habit, by the sun on the eastern hills. Passengers teased him about the watch. He did not mind. When the new digital boards announced that the 6:12 was on time, he would glance at the watch anyway, and only then would he nod, as though the train needed his permission to leave.",
      cues: ["set his pocket watch", "He did not mind", "needed his permission"],
      key: "To reveal a conductor’s quiet pride in keeping his train on time",
      narrow: "To describe the digital boards that announce trains at the station",
      opposite: "To portray the conductor’s embarrassment when passengers tease him",
      broad: "To suggest that modern technology has made train travel far more reliable",
    },
    {
      scene: "cs-lit-unsent-letter",
      passage:
        "Julian wrote the first line of the letter to his brother on Monday: Dear Eli, it has been too long. By Wednesday he had crossed out “too long” and written “a while,” which sounded less like an accusation. On Thursday he added a paragraph about the garden and then removed it, afraid it would seem as if nothing had changed. Now it was Sunday. The letter lay on the desk, one line and a signature, beside a stamped envelope bearing Eli’s new address, copied carefully from their mother’s note. Julian picked up the pen, set it down, and picked it up again.",
      cues: ["crossed out", "removed it", "picked it up again"],
      key: "To show a man’s hesitant attempts to reach out to his distant brother",
      narrow: "To describe the garden Julian considered mentioning in his letter",
      opposite: "To convey Julian’s firm decision never to contact his brother again",
      broad: "To suggest that letters communicate better than phone calls",
    },
    {
      scene: "cs-lit-museum-guard",
      passage:
        "For eleven years, Walter had guarded Gallery 14, where a small painting of a woman reading by a window hung beside the door. Visitors hurried past it toward the famous landscapes. Walter did not. He knew the exact moment each afternoon when real sunlight from the skylight fell across the painted sunlight in the picture. When the curators announced that the painting would be lent to a museum overseas for a year, Walter nodded politely at the meeting. That evening, after the gallery emptied, he stood before the painting for a long time and wished her a safe trip.",
      cues: ["Walter did not", "exact moment each afternoon", "wished her a safe trip"],
      key: "To depict a guard’s quiet affection for a painting others overlook",
      narrow: "To portray the famous landscapes that draw most visitors to the museum",
      opposite: "To show the guard’s indifference to the art he spends his days beside",
      broad: "To suggest that museums should display fewer famous works",
    },
    {
      scene: "cs-lit-first-class",
      passage:
        "Ms. Hale had written her first lesson on index cards, numbered one through twelve, and she held them so tightly on the first morning that the corners bent. The thirty faces in front of her gave nothing away. She lost her place on card four. Then a boy in the back asked whether the word “arithmetic” was named after a bug, and the room burst out laughing, and so, before she could stop herself, did she. She set the cards on the desk. For the rest of the hour she did not pick them up again.",
      cues: ["held them so tightly", "lost her place", "did not pick them up again"],
      key: "To convey a new teacher’s nervousness giving way to ease with her class",
      narrow: "To describe the index cards on which Ms. Hale wrote her first lesson",
      opposite: "To depict Ms. Hale’s growing irritation at the student who interrupted",
      broad: "To suggest that humor is the most important quality in a teacher",
    },
    {
      scene: "cs-lit-fog-fisher",
      passage:
        "Old Anselm never argued with the fog. When it rolled into the harbor at Senna before dawn, the younger fishermen checked their radar screens and set out anyway, calling to him that the machines could see what he could not. Anselm only coiled his lines and sat on an overturned crate, listening to the buoy bell. He had lost a boat to fog once, forty years before, and he had not forgotten how quiet the water had been just before. By noon the fog had lifted, and the younger men returned early, tight-lipped, with half-empty nets.",
      cues: ["never argued with the fog", "lost a boat to fog", "half-empty nets"],
      key: "To portray a fisherman’s hard-earned caution toward fog",
      narrow: "To describe the radar screens that the younger fishermen rely on",
      opposite: "To show Anselm’s envy of the younger men who set out in the fog",
      broad: "To suggest that modern tools are useless to people who fish at sea",
    },
  ];

  const tspLiteraryPurpose = {
    id: "tsp-literary-purpose",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "author's purpose",
    difficulty: "Medium",
    title: "Main purpose of a literary passage",
    recognize:
      "A story passage rarely states its point; its purpose is carried by concrete details that reveal how a character feels, often by the change between its first and last details.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["too-narrow", "opposite-stance", "too-broad"],
    build(t) {
      const topic = t.pick(TSP_LITERARY_TOPICS);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.passage },
        stem: "Which choice best states the main purpose of the text?",
        correct: topic.key,
        wrong: [
          [topic.narrow, "This object or setting appears in the text, but only as background to the character; the text is not about it."],
          [topic.opposite, "The concrete details, especially the final one, show the opposite of this attitude."],
          [topic.broad, "The text shows one character in one moment; it makes no general claim of this kind."],
        ],
        explanation: `The details, from “${topic.cues[0]}” to “${topic.cues[topic.cues.length - 1]},” build a single impression of the character, so the main purpose is ${TSP_lower(topic.key)}.`,
        steps: [
          "Notice how the character is shown at the start of the passage.",
          "Follow the concrete actions and objects to the final sentence.",
          "Choose the purpose that names the character’s attitude those details reveal, not a single object or a general lesson.",
        ],
        principles: [
          "In literary passages, a character’s feelings are usually shown through actions and objects rather than stated.",
          "A main-purpose answer for a narrative covers the whole passage, especially where it ends.",
        ],
        trap: "Choosing an option that names an object from the passage or a general lesson, or one that reverses the attitude the details build.",
        hint: "Taken together, what do the character’s actions reveal?",
        estimatedSeconds: 75,
        verify: () =>
          TSP_inOrder(topic.passage, topic.cues) &&
          new Set([topic.key, topic.narrow, topic.opposite, topic.broad]).size === 4,
      };
    },
  };

  /* ------------------------------------------------ 5. literary structure */

  // Original prose with a clear shape. `markers` appear in the passage in the
  // order the key’s moves describe. The wrong-ending choice paraphrases the
  // first moves in its own words rather than repeating the key's, so the key
  // is not simply one half of a pair of look-alike choices.
  const TSP_LIT_STRUCTURE_TOPICS = [
    {
      scene: "cs-lit-clock-repair",
      passage:
        "Mateo bent over the stalled mantel clock, his tweezers hovering above a spring no wider than an eyelash. His hand shook, and the spring leapt away onto the bench. He remembered the first clock he had ever opened, at nine years old, in his father’s shop: how he had lost a spring then, too, and how his father, instead of scolding, had simply set a second lamp beside him and said, “Now look again.” Mateo set down the tweezers. He switched on the second lamp, the one he rarely used, and looked again.",
      markers: ["His hand shook", "He remembered", "He switched on the second lamp"],
      key: "It describes a setback during a repair, recalls a lesson from Mateo’s childhood, and then shows him acting on it.",
      ending: "It presents a mishap at the workbench and a memory of Mateo’s father, then shows Mateo giving up on the repair.",
      order: "It opens with a lesson from Mateo’s childhood and then traces how his skill grew over many years of repairs.",
      never: "It opens on a slipped spring at the workbench and then shifts to a talk in which Mateo asks his father for help.",
    },
    {
      scene: "cs-lit-quartet-concert",
      passage:
        "Anjali had been told that the Vell Quartet’s new piece was difficult, even harsh, and she arrived at the concert hall ready to endure it. She had chosen a seat near the aisle. For the first minute, the scraping, stuttering notes seemed to confirm every warning. But then the cello settled onto a single low note and held it, and the violins began, one after another, to circle back toward it, like birds returning to a tree at dusk. By the final movement Anjali had forgotten the aisle entirely. When the hall fell silent, she was the first to stand.",
      markers: ["ready to endure it", "seemed to confirm", "first to stand"],
      key: "It presents Anjali’s low expectations for a concert, seems briefly to confirm them, and then overturns them.",
      ending: "It sets out Anjali’s dread of a new piece, lets the opening seem to justify it, and then shows her leaving early.",
      order: "It describes Anjali’s enthusiastic applause and then explains the doubts she had felt before the concert began.",
      never: "It sets up Anjali’s doubts about a new piece and then recounts a debate she has with another listener.",
    },
    {
      scene: "cs-lit-attic-trunk",
      passage:
        "The trunk in the attic was painted dark green, its brass corners dented, its lid stenciled with the words S. S. Maribel. Inside lay a folded wool coat, a tin of buttons, and a ledger in which someone had recorded, in brown ink, the price of every meal on a six-week voyage. June turned the pages slowly. She had always thought of her great-grandmother as a name on a family tree. Now she found herself wondering whether the woman had been seasick, whether she had been afraid, and why, of all things, she had kept track of the price of bread.",
      markers: ["painted dark green", "turned the pages slowly", "found herself wondering"],
      key: "It describes the contents of an old trunk and then turns to June’s reflections about the woman who owned it.",
      ending: "It lists what June finds in an old trunk and then turns to her plans to sell the items.",
      order: "It presents June’s reflections about her great-grandmother and then explains how June came to own the trunk.",
      never: "It catalogs what an old trunk holds and then retells the voyage from the great-grandmother’s point of view.",
    },
    {
      scene: "cs-lit-rope-bridge",
      passage:
        "The first time Noor tried to cross the rope bridge above Callan Gorge, she made it three planks before turning back. The second time, she reached the middle, where the bridge swayed with every gust, and froze there until her brother talked her back to solid ground. That night she lay awake counting the planks from memory: forty-one. On the third morning she did not look at the water or at her brother. She counted aloud, one plank to a breath, and when she said “forty-one,” her boots were on the rock of the far side.",
      markers: ["The first time", "The second time", "That night", "On the third morning"],
      key: "It recounts two failed attempts to cross a bridge, describes a night of preparation, and then a successful crossing.",
      ending: "It relates Noor’s two retreats from the bridge and a sleepless night, then shows her deciding to give up.",
      order: "It describes a successful crossing of a bridge and then explains why Noor had once been so afraid of heights.",
      never: "It follows Noor’s first two tries at the bridge and then shows her brother crossing first to demonstrate.",
    },
    {
      scene: "cs-lit-garden-party",
      passage:
        "“You must be so proud,” said Mrs. Kell, and Irene agreed that she was. “Engineering, and on scholarship,” said Mr. Abara, and Irene agreed again, passing the lemonade. Everyone at the garden party wanted to talk about her daughter’s acceptance letter, and Irene answered every question. It was only later, rinsing glasses at the kitchen window, that she saw the letter on the counter and understood that in September the house would be quiet, and that the question she had answered all afternoon had never once been the one she was asking herself.",
      markers: ["You must be so proud", "It was only later", "understood that in September"],
      key: "It presents a series of cheerful exchanges at a party and then shifts to Irene’s private realization afterward.",
      ending: "It opens with friendly remarks from guests and then turns to a quarrel between Irene and her daughter.",
      order: "It begins with Irene’s private realization in the kitchen and then flashes back to the party that prompted it.",
      never: "It moves through the guests’ congratulations and then describes the daughter’s first day at college.",
    },
    {
      scene: "cs-lit-newsstand",
      passage:
        "Every morning Mr. Farrow walked to the corner newsstand, bought the same paper, exchanged the same remark about the weather with Mrs. Ito, and walked home by the same route, past the bakery and the shuttered cinema. He had done so for twenty-two years. On Tuesday the newsstand was gone. In its place was a bare square of pavement, paler than the sidewalk around it, and a notice about new bus shelters. Mr. Farrow stood looking at the pale square for some time. Then, for the first time in twenty-two years, he walked home the long way, past the river.",
      markers: ["Every morning", "On Tuesday", "for the first time in twenty-two years"],
      key: "It establishes a long-standing routine, describes a sudden disruption to it, and then shows a small change in response.",
      ending: "It sets out Mr. Farrow’s unchanging morning habit and its sudden interruption, then shows the old habit quickly restored.",
      order: "It describes a sudden disruption to Mr. Farrow’s day and then explains the history of the neighborhood newsstand.",
      never: "It lays out Mr. Farrow’s daily habit and then gives a conversation in which Mrs. Ito explains her departure.",
    },
    {
      scene: "cs-lit-hometown-return",
      passage:
        "When Renata left Fennick at eighteen, she had called it the smallest town in the world: one road, one diner, one traffic light that blinked yellow all night. Twelve years later she drove in on that same road, expecting to find it smaller still. The diner had a new sign. The light still blinked. But at the counter, the owner remembered her order before she had finished sitting down, and a man she did not recognize asked after her father by name. Renata stirred her coffee and thought that a town might be small the way a room is small when it is full of people you know.",
      markers: ["she had called it the smallest town", "Twelve years later", "Renata stirred her coffee"],
      key: "It recalls Renata’s dismissive view of her hometown, describes her return, and then shows that view softening.",
      ending: "It recounts Renata’s scorn for Fennick and her return twelve years on, then shows that scorn confirmed.",
      order: "It describes Renata’s return to her hometown and then flashes back to explain why she has decided to stay for good.",
      never: "It notes Renata’s early scorn for Fennick and then describes an argument with the diner’s owner about it.",
    },
    {
      scene: "cs-lit-harbor-widening",
      passage:
        "On the dock, a gull worked at a mussel shell, lifting it, dropping it on the planks, lifting it again. Beyond the gull, two boys were untangling a single fishing line between them, arguing cheerfully about whose fault the knot had been. Beyond them, the ferry was backing out of its slip, its horn sounding once across the harbor. And beyond the ferry, the whole town of Casper Reach climbed the hillside in rows of white houses, every window catching the evening light at once, as if the town had been lit for someone arriving by sea.",
      markers: ["a gull worked", "Beyond the gull", "Beyond them", "beyond the ferry"],
      key: "It begins with a small, close detail and then widens its view in stages until it takes in the whole town.",
      ending: "It starts close, with a gull on the dock, widens outward in steps, and then returns to the gull at the end.",
      order: "It begins with a view of the whole town and then narrows its focus in stages to a single gull on the dock.",
      never: "It opens on a gull at work on the dock and then shifts to the thoughts of a passenger arriving on the ferry.",
    },
    {
      scene: "cs-lit-packing-sisters",
      passage:
        "Maren packed for the trip three days early. Her suitcase stood by the door, its contents listed on a card taped to the lid: socks, six pairs; sweaters, two; umbrella, one. Her sister Lise packed on the morning of departure, in eleven minutes, throwing in whatever lay nearest, and forgot her toothbrush, as she always did. At the station, Maren produced a spare toothbrush from a side pocket without a word, and Lise took it without a word, and both of them, for once, seemed to understand that this was how it had always worked.",
      markers: ["Maren packed", "Her sister Lise packed", "At the station"],
      key: "It contrasts two sisters’ ways of packing and then shows how their differences fit together.",
      ending: "It sets Maren’s careful packing against Lise’s haste and then shows the difference leading to a quarrel.",
      order: "It describes the sisters meeting at the station and then explains how each had spent the morning.",
      never: "It sets the sisters’ packing habits side by side and then describes the trip from the younger sister’s view.",
    },
    {
      scene: "cs-lit-newspaper-kite",
      passage:
        "The kite was already falling when Arun reached the top of the hill. It had been his grandmother’s idea to build it from newspaper and bamboo, the way she had as a girl, and they had spent all of Sunday gluing and trimming while she told him about the rooftop contests of her childhood, when the sky filled with loose kites. Now the paper tore on a fence post. Arun gathered the pieces carefully, already planning, in his grandmother’s voice, the stronger frame they would build next week.",
      markers: ["already falling", "It had been his grandmother’s idea", "Now the paper tore", "next week"],
      key: "It opens as the kite falls, fills in how the kite was made, and then returns to Arun’s plans to build another.",
      ending: "It begins with the kite’s fall, goes back to the day it was built, and ends with Arun deciding to stop flying kites.",
      order: "It describes how Arun and his grandmother built a kite and then shows the kite’s first successful flight.",
      never: "It starts with the kite coming down and then describes a rooftop contest that Arun enters with it later that day.",
    },
    {
      scene: "cs-lit-snow-street",
      passage:
        "All along Hewitt Street, the snow had closed the schools and stopped the buses, and the neighborhood had gone quiet in the way it did only a few times each winter. Shovels scraped. Someone’s radio played an old waltz. In the third-floor window of number 18, old Mr. Abernathy watched the children below building a lopsided fort, and when their wall collapsed for the second time, he opened the window, leaned out into the cold, and began, loudly and with great authority, to explain the proper angle for packing snow.",
      markers: ["All along Hewitt Street", "Shovels scraped", "In the third-floor window"],
      key: "It describes a snowy street as a whole and then narrows its focus to one resident’s response to the scene.",
      ending: "It surveys the quiet, snowbound neighborhood and then singles out one resident who ignores what he sees.",
      order: "It focuses first on Mr. Abernathy at his window and then widens to describe the whole street he is watching.",
      never: "It takes in the whole snowbound street and then narrows to the children’s argument over their fort.",
    },
  ];

  const tspLiteraryStructure = {
    id: "tsp-literary-structure",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "author's purpose",
    difficulty: "Medium",
    title: "Overall structure of a narrative passage",
    recognize:
      "Track the passage’s moves in order (scene, memory, return; routine, disruption, response; close view widening) and match every move, especially the last, to the choice.",
    rubric: { steps: 2, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "word-association"],
    build(t) {
      const topic = t.pick(TSP_LIT_STRUCTURE_TOPICS);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.passage },
        stem: "Which choice best describes the overall structure of the text?",
        correct: topic.key,
        wrong: [
          [topic.ending, "The opening moves are right, but the passage does not end this way; this misdescribes its final move."],
          [topic.order, "This puts the passage’s parts in the wrong order or invents a development, so it does not match the sequence in the text."],
          [topic.never, "The passage contains no such development; this choice builds a move out of details mentioned only in passing."],
        ],
        explanation: `Following the passage in order (“${topic.markers[0]}” … “${topic.markers[topic.markers.length - 1]}”) shows its shape: ${TSP_lower(topic.key).replace(/^it /, "it ")}`,
        steps: [
          "Mark where the passage shifts: in time, in focus, or in the character’s view.",
          "Name each part in a few words, in order.",
          "Eliminate choices with a wrong order, a missing part, or a final move that does not happen.",
        ],
        principles: [
          "A structure answer must match every part of the passage in the order the parts occur.",
          "Two structure choices can share their opening moves; the difference is often in how the passage ends.",
        ],
        trap: "Choosing an option whose first moves match the passage without checking that its final move matches too.",
        hint: "Check the last move in each choice against the last sentence of the passage.",
        estimatedSeconds: 75,
        verify: () =>
          TSP_inOrder(topic.passage, topic.markers) &&
          new Set([topic.key, topic.ending, topic.order, topic.never]).size === 4,
      };
    },
  };

  /* ------------------------------- 6. structure: view, complication, qualify */

  // A widely held view, evidence that complicates it, and a final sentence that
  // keeps part of the view under a condition. `markers` fall in that order.
  // Later topics carry a `shape` of their own (reject, extend, adjudicate) and
  // a `summary` of their three moves, so the key is not always "qualify".
  const TSP_QUALIFY_TOPICS = [
    {
      scene: "cs-mixed-age-classrooms",
      subject: "mixed-age classrooms",
      passage:
        "Teachers have long held that placing younger and older children in the same classroom helps the younger ones, who can learn by watching and working alongside more skilled classmates. A study of forty mixed-age classrooms in the Brevard district tested that belief. Younger children gained noticeably in reading and math when they worked with older partners on shared projects. When the same children competed with older classmates on individual assignments, however, they gained no more than peers in single-age classrooms, and some lost confidence. The advantage that teachers have observed, then, seems to depend less on the mix of ages itself than on whether the work invites children to cooperate.",
      markers: ["have long held", "however", "seems to depend"],
      kept: "younger children do gain when they work with older partners",
      complication: "that the gains disappeared when children competed on individual work",
    },
    {
      scene: "cs-feathers-before-flight",
      subject: "why feathers evolved",
      passage:
        "Feathers are so closely associated with flight that for many years scientists assumed they had evolved for that purpose. Fossils found over the past few decades tell a different story. Many small dinosaurs that could not possibly have flown were covered in feathers, some of them simple filaments resembling the down of a chick, others arranged in fans along the arms and tail. Such feathers may first have served to keep the animals warm or to attract mates. Flight still seems to explain the stiff, lopsided feathers found on the wings of later species, but it cannot account for how feathers began.",
      markers: ["assumed they had evolved", "different story", "still seems to explain"],
      kept: "flight explains the stiff wing feathers of later species",
      complication: "that feathered dinosaurs existed that could not fly",
    },
    {
      scene: "cs-canal-railway-freight",
      subject: "the decline of canals",
      passage:
        "In many histories of the industrial era, the arrival of the railway spells the swift end of canal transport: once goods could travel by rail, the story goes, the slow canal barges were abandoned. Shipping records from the Aldmere Canal suggest otherwise. In the three decades after a railway opened alongside it, the canal’s passengers and its cargoes of parcels and perishable food almost vanished, but its tonnage of coal, stone, and timber actually rose. For heavy goods that did not need to arrive quickly, slow and cheap transport by water remained the sensible choice. The railway did end the canal’s role in carrying people and urgent freight; what it did not end was the canal.",
      markers: ["the story goes", "suggest otherwise", "did end the canal’s role"],
      kept: "the railway did take away the canal’s passengers and urgent freight",
      complication: "that the canal’s heavy freight grew after the railway arrived",
    },
    {
      scene: "cs-code-switching",
      subject: "switching between languages",
      passage:
        "Switching between two languages in the middle of a conversation is often taken as a sign that a speaker has not fully mastered either one. Linguists who recorded conversations among bilingual families in the port city of Lisk found a different pattern. Children who were still learning English did switch to Portuguese when they could not find an English word. But the most fluent adults switched more often than anyone, and their switches followed consistent rules, falling at points where the grammars of the two languages lined up. Switching can signal a gap in vocabulary, the researchers concluded, but among skilled speakers it is better understood as a skill in its own right.",
      markers: ["is often taken as a sign", "different pattern", "can signal a gap"],
      kept: "switching can signal a gap in vocabulary among learners",
      complication: "that the most fluent adults switched most often, following rules",
    },
    {
      scene: "cs-street-tree-cooling",
      subject: "how street trees cool cities",
      passage:
        "City planners frequently promote street trees as a way to cool entire neighborhoods during summer heat waves. When researchers placed 200 temperature sensors across the Delmont district, the shade beneath large trees was indeed as much as 5°C cooler than open pavement nearby. Yet the effect faded quickly with distance: half a block from the nearest canopy, the air was barely cooler than in treeless parts of the city. Trees do cool the air, in other words, but mostly where their shade falls, which suggests that they will help most when planted along the sidewalks and bus stops where people actually spend time outdoors.",
      markers: ["frequently promote", "Yet the effect faded", "Trees do cool the air"],
      kept: "trees do cool the air beneath their shade",
      complication: "that the cooling faded within half a block of the canopy",
    },
    {
      scene: "cs-harbor-school-painters",
      subject: "the Harbor School’s painters",
      passage:
        "Painters of the Harbor School are remembered for working outdoors, finishing each canvas in a single session as the light changed around them. Their own letters celebrate painting “before the scene itself.” But when conservators recently examined twenty of the school’s best-known canvases with infrared cameras, they found that most had been reworked long after the first session: skies repainted, figures added, entire boats moved. The painters did begin outdoors, and the quick, broken brushwork that makes their scenes feel spontaneous was usually laid down there. The finished pictures, however, were more often completed in the studio than the painters’ reputation suggests.",
      markers: ["are remembered for working outdoors", "But when conservators", "did begin outdoors"],
      kept: "the painters did begin their canvases outdoors",
      complication: "that most canvases were reworked long after the first session",
    },
    {
      scene: "cs-wolves-willows-beavers",
      subject: "wolves and streamside willows",
      passage:
        "The return of wolves to Stellan Valley is often credited with reviving the streamside willows there: by hunting and frightening elk, the story goes, wolves kept the animals from browsing young shoots, and the willows grew back. A survey of the valley’s streams points to another factor. Willows recovered strongly along streams where beavers had also returned, raising the water table with their dams, but along streams without beavers, the willows remained stunted even where elk were scarce. Wolves may well have helped the willows, but mainly where beavers had already restored the wet soil the shrubs need.",
      markers: ["is often credited", "points to another factor", "may well have helped"],
      kept: "wolves may well have helped the willows",
      complication: "that willows stayed stunted without beavers even where elk were scarce",
    },
    {
      scene: "cs-medieval-harvest-rations",
      subject: "the medieval peasant diet",
      passage:
        "Medieval peasants, it is commonly said, ate meat only on rare feast days, living otherwise on bread, porridge, and vegetables. Records of the food given to laborers at the manor of Wendham in the 1300s complicate that picture. During the autumn harvest and through the winter months, workers received generous rations of mutton, bacon, and salted fish. From spring through midsummer, however, the same records list almost nothing but bread, peas, and ale. The image of a meatless peasant diet may fit the growing season well enough, but it overlooks the months when meat was a regular part of village meals.",
      markers: ["it is commonly said", "complicate that picture", "may fit the growing season"],
      kept: "the meatless picture fits spring and summer",
      complication: "that laborers received generous meat rations at harvest and in winter",
    },
    {
      scene: "cs-open-office-talk",
      subject: "open office floor plans",
      passage:
        "Companies that tear down office walls usually do so in the belief that open floor plans will bring employees together and spark conversation. When one insurance firm in Carlow moved its staff into an open office, researchers used wearable sensors to track who spoke with whom. Quick exchanges between desk neighbors did become more frequent. But longer, face-to-face conversations, the kind in which colleagues work through problems together, fell by nearly half, while emails and instant messages rose. Open offices may encourage brief, casual contact among people who sit close together, but they appear to discourage the sustained discussion their designers hoped to foster.",
      markers: ["in the belief that", "But longer, face-to-face", "may encourage brief"],
      kept: "open offices do encourage brief contact between neighbors",
      complication: "that long face-to-face conversations fell by nearly half",
    },
    {
      scene: "cs-baroque-tempo",
      subject: "tempo in baroque music",
      passage:
        "Performers of baroque music have often been taught to keep a strict, unvarying tempo, on the assumption that musicians of the 1700s treated the beat like a ticking clock. Instruction manuals from that period tell a subtler story. Several advise players to hold back slightly at the ends of phrases and to linger on important notes, and one warns that playing “like a machine” will bore any listener. None, though, recommends the large swings of speed common in later Romantic music; the manuals treat a steady pulse as the foundation on which such small liberties rest. The period’s musicians seem to have kept a steady beat, but not a rigid one.",
      markers: ["on the assumption", "tell a subtler story", "seem to have kept a steady beat"],
      kept: "baroque musicians did keep a steady pulse",
      complication: "that period manuals advise slowing at phrase endings",
    },
    // Texts that reject the view outright: nothing of it survives the evidence.
    {
      scene: "cs-window-glass-flow",
      shape: "reject",
      subject: "uneven panes in old windows",
      passage:
        "It is often said that the panes in old church windows are thicker at the bottom because glass is really a slow-moving liquid that has sagged over the centuries. The explanation does not survive a closer look. Before the 1800s, window glass was commonly made by spinning molten glass into a broad disk, a method that produced panes of uneven thickness, and glaziers did not always set the thick edge at the bottom; some panes were installed thick edge up. Calculations of how fast glass could flow at room temperature, moreover, give times far longer than the age of the universe. The uneven panes record how the glass was made, not how it has aged.",
      markers: ["It is often said", "does not survive a closer look", "record how the glass was made"],
      summary: "it reports that such panes were uneven when they were made and that glass does not measurably flow, and it concludes that the sagging explanation is wrong",
    },
    {
      scene: "cs-bull-red-cape",
      shape: "reject",
      subject: "bulls and the color red",
      passage:
        "The red capes of bullfighters have given rise to a widespread belief that the color red enrages bulls. Cattle, however, see color differently from people. Their eyes lack the type of cone cell that lets humans tell red from green, so a red cloth probably looks to a bull much like a dull brown or gray one. In informal tests, bulls have charged moving cloths of several colors alike while paying little attention to a red cloth held still. What provokes the charge, then, is the motion of the cape; its color plays no part at all.",
      markers: ["widespread belief", "Cattle, however", "its color plays no part"],
      summary: "it explains that bulls cannot distinguish red and reports that they charge moving cloths of any color, and it concludes that color plays no part",
    },
    {
      scene: "cs-tellmark-hoard",
      shape: "reject",
      subject: "the Tellmark coin hoard",
      passage:
        "Residents of Tellmark have long believed that the silver coins found beneath the old mill were buried by soldiers fleeing the siege of 1644. The story suits the hoard’s location near the old siege lines, and it is repeated on the plaque beside the mill. When curators at the county museum cataloged all 312 coins, however, they identified eleven that had been minted between 1690 and 1702. No one could have buried those coins in 1644. Whoever hid the hoard did so more than half a century after the siege, and its link to the fleeing soldiers appears to be local legend rather than history.",
      markers: ["have long believed", "they identified eleven", "local legend rather than history"],
      summary: "it reports coins minted decades after the siege and concludes that the hoard’s link to the fleeing soldiers is legend, not history",
    },
    {
      scene: "cs-wraxby-priory-library",
      shape: "reject",
      subject: "the fate of the Wraxby Priory library",
      passage:
        "According to local tradition, the great library of Wraxby Priory went up in flames in 1540, when the priory was closed and its buildings stripped. The story is told in every guidebook to the ruins. A survey of manuscript collections across Europe, however, has traced forty-six volumes bearing the priory’s shelf marks, several of them annotated by later owners in the 1560s and 1570s. Excavations beneath the library’s foundations, meanwhile, found no layer of ash or charred timber. The library was never burned at all; its books were sold or carried off, one volume at a time.",
      markers: ["According to local tradition", "has traced forty-six volumes", "never burned at all"],
      summary: "it reports surviving volumes and the absence of ash, and it concludes that the library was dispersed rather than burned",
    },
    {
      scene: "cs-hollis-class-size",
      shape: "reject",
      subject: "the rise in Hollis reading scores",
      passage:
        "Officials in the Hollis school district credit the rise in the district’s reading scores over the past five years to smaller classes, which the district introduced in 2019. The explanation has intuitive appeal, and smaller classes are popular with parents and teachers alike. A review of school-level results, though, tells against it. Scores rose just as quickly at the eleven Hollis schools that, lacking space, never reduced their class sizes, and they rose by similar amounts in neighboring districts that made no changes at all. Whatever produced the gains, the evidence gives no reason to attribute them to the smaller classes.",
      markers: ["credit the rise", "tells against it", "no reason to attribute"],
      summary: "it reports that scores rose just as fast where classes stayed large, and it concludes that the gains cannot be credited to smaller classes",
    },
    // Texts that confirm the view and then carry it further.
    {
      scene: "cs-spaced-practice-skills",
      shape: "extend",
      subject: "spaced practice",
      passage:
        "Psychologists have long held that material studied in several spaced sessions is remembered better than the same material crammed into one. A recent study at the Arden Language School confirmed the pattern: students who reviewed new vocabulary across four weekly sessions recalled more of it a month later than students who spent the same total time in a single sitting. The same researchers then followed adult pianists learning a new passage and trainee nurses practicing a bandaging technique, and in both groups spaced practice again produced better performance weeks later. The advantage of spacing, the results suggest, is not confined to memorizing facts; it holds for physical skills as well.",
      markers: ["have long held", "confirmed the pattern", "not confined to memorizing facts"],
      summary: "it reports a study that confirms the view and then finds the same advantage for physical skills, carrying the view beyond memorized facts",
    },
    {
      scene: "cs-pellam-canal-prices",
      shape: "extend",
      subject: "the canal and prices in Pellam",
      passage:
        "Historians of Pellam agree that the opening of the Pellam Canal in 1794 made grain cheaper in the town, since barges could bring wheat from the plains at a fraction of the cost of wagons. Merchants’ account books bear this out: within five years, the price of a bushel of wheat in Pellam had fallen by nearly a third. The same books show that the canal’s effect did not stop at grain. Coal, lime, and building timber, all heavy goods once hauled by wagon, fell in price just as steeply, while light goods such as tea and cloth changed little. Cheap water transport, it appears, lowered the cost of nearly every bulky good the town bought.",
      markers: ["agree that", "bear this out", "did not stop at grain"],
      summary: "it reports account books that confirm the fall in grain prices and then shows the same fall for coal, lime, and timber, carrying the view to other bulky goods",
    },
    {
      scene: "cs-serran-frequent-words",
      shape: "extend",
      subject: "how quickly words change",
      passage:
        "Historical linguists have observed that the words a language uses most often, such as those for “I,” “two,” and “who,” tend to be replaced more slowly over the centuries than rarer words. A team studying written records of the Serran languages, a family spoken in the Merrow highlands, confirmed the pattern: across 800 years of documents, common words were replaced far less often than uncommon ones. The team then looked beyond vocabulary. Irregular verb forms that speakers use constantly, they found, also resisted the regularizing changes that swept away rarer irregular forms. Frequency, the study suggests, protects not only words but grammatical forms.",
      markers: ["have observed", "confirmed the pattern", "not only words but grammatical forms"],
      summary: "it reports records that confirm the view about common words and then finds the same resistance in frequent irregular verbs, carrying the view into grammar",
    },
    {
      scene: "cs-mallory-city-signals",
      shape: "extend",
      subject: "animal signals in noisy cities",
      passage:
        "Biologists have found that many songbirds in noisy cities sing at a higher pitch than birds of the same species in quiet forests, which keeps their songs from being masked by the low rumble of traffic. Recordings made across the city of Mallory support that account: sparrows nesting beside busy roads sang noticeably higher than sparrows in the city’s quiet parks. The researchers also recorded tree frogs in ponds near the same roads, and the frogs, too, called at a higher pitch than frogs in ponds far from traffic. Raising the pitch of a signal to escape traffic noise, it seems, is not a habit of songbirds alone.",
      markers: ["Biologists have found", "support that account", "not a habit of songbirds alone"],
      summary: "it reports recordings that confirm the view for sparrows and then shows frogs doing the same, carrying the view beyond songbirds",
    },
    // Texts that set out two rival views and use evidence to favor one.
    {
      scene: "cs-dunmere-hill-abandonment",
      shape: "adjudicate",
      subject: "why the town of Dunmere was abandoned",
      passage:
        "Archaeologists have offered two explanations for why the hill town of Dunmere was abandoned around 1300. Some argue that a long drought ruined its fields; others contend that the town lost its livelihood when traders began using a new pass through the mountains to the south. Pollen preserved in a nearby bog settles the question in one direction: it shows the town’s barley and flax fields flourishing right up to the years of abandonment, with no sign of a dry spell. Coins found in the town, meanwhile, stop abruptly just after the southern pass came into use. The shift in trade, not a failure of the rains, emptied Dunmere.",
      markers: ["two explanations", "settles the question", "not a failure of the rains"],
      summary: "it sets out two rival explanations, drought and a shift in trade, weighs pollen and coin evidence, and ends by favoring the shift in trade",
    },
    {
      scene: "cs-varro-finch-beaks",
      shape: "adjudicate",
      subject: "the large beaks of the Varro Island finches",
      passage:
        "Two accounts compete to explain why finches on the Varro Islands have unusually large beaks. One holds that big beaks let the birds crack the hard seeds that dominate the islands’ dry scrub. The other notes that a beak sheds body heat, so large beaks may simply help the birds stay cool in the islands’ hot climate. Measurements from all eleven islands favor the first account. Beak size rose and fell with the hardness of the seeds available on each island but showed no relation to the islands’ average temperatures, which differed by several degrees. Diet, rather than heat, appears to have shaped the finches’ beaks.",
      markers: ["Two accounts compete", "favor the first account", "Diet, rather than heat"],
      summary: "it sets out two rival accounts, hard seeds and heat loss, reports that beak size tracks seed hardness but not temperature, and ends by favoring diet",
    },
    {
      scene: "cs-delvin-market-prices",
      shape: "adjudicate",
      subject: "the rise in prices at the Delvin market",
      passage:
        "When prices at the Delvin market rose sharply in 1768, merchants blamed a new duty on imported goods, while the town council blamed the poor harvest of the previous autumn. Records of the market’s weekly prices allow the two explanations to be tested. The prices of local grain, cheese, and turnips, none of which paid the duty, rose by a quarter or more. Imported sugar and pepper, which did pay it, rose by only a few pennies. If the duty had driven prices up, the taxed goods should have risen most; instead, the untaxed local produce did. The failed harvest, not the duty, best accounts for the rise.",
      markers: ["merchants blamed", "allow the two explanations to be tested", "not the duty, best accounts"],
      summary: "it sets out two rival explanations, the new duty and the poor harvest, tests them against price records, and ends by favoring the harvest",
    },
    {
      scene: "cs-hollowmere-vowel",
      shape: "adjudicate",
      subject: "the origin of a vowel in Hollowmere speech",
      passage:
        "Linguists disagree about where the distinctive long vowel heard in the speech of Hollowmere came from. One view traces it to settlers from the Calder coast, where a similar vowel is common, who arrived in the town in the 1850s. The rival view holds that it developed in Hollowmere itself, among children born there. Letters written by the Calder settlers, who often spelled words as they pronounced them, show no sign of the vowel. It first appears in the 1890s, in the letters and school exercises of Hollowmere-born children. The vowel, the evidence indicates, was a local creation rather than an import.",
      markers: ["Linguists disagree", "show no sign of the vowel", "a local creation rather than an import"],
      summary: "it sets out two rival views, import by settlers and local development, reports that the settlers’ letters lack the vowel while local children’s writing has it, and ends by favoring local development",
    },
  ];

  // Three parallel wordings of the four shapes a view-and-evidence text can
  // take. Every topic is offered all four in one wording, so the key is
  // whichever shape the passage has: qualify (most topics), reject, extend,
  // or adjudicate between two views. No wording or final verb marks the key.
  const TSP_SHAPE_FRAMES = [
    {
      qualify: (x) => `It states a common view about ${x}, reports evidence that complicates it, and then narrows that view.`,
      reject: (x) => `It states a common view about ${x}, reports evidence that contradicts it, and then rejects that view.`,
      extend: (x) => `It states a common view about ${x}, reports evidence that confirms it, and then extends that view to new cases.`,
      adjudicate: (x) => `It states two rival views about ${x}, weighs the evidence for each, and then favors one of them.`,
    },
    {
      qualify: (x) => `It outlines an accepted claim about ${x}, reports findings that cast doubt on it, and then limits the claim.`,
      reject: (x) => `It outlines an accepted claim about ${x}, reports findings that refute it, and then dismisses the claim.`,
      extend: (x) => `It outlines an accepted claim about ${x}, reports findings that strengthen it, and then applies it more widely.`,
      adjudicate: (x) => `It outlines two competing claims about ${x}, reports findings that bear on both, and then sides with one.`,
    },
    {
      qualify: (x) => `It introduces a familiar belief about ${x}, describes evidence that challenges it, and then says when it still holds.`,
      reject: (x) => `It introduces a familiar belief about ${x}, describes evidence against it, and then concludes that it is mistaken.`,
      extend: (x) => `It introduces a familiar belief about ${x}, describes evidence that supports it, and then shows it holds more broadly.`,
      adjudicate: (x) => `It introduces two opposing beliefs about ${x}, describes evidence bearing on each, and then settles on one.`,
    },
  ];
  const TSP_SHAPES = ["qualify", "reject", "extend", "adjudicate"];

  // Qualifying topics predate `shape` and `summary`; derive them.
  const TSP_shapeOf = (topic) => topic.shape || "qualify";
  const TSP_summaryOf = (topic) =>
    topic.summary || `it reports ${topic.complication}, yet the final sentence grants that ${topic.kept}`;

  // Why a wrong shape fails, given the passage's real shape.
  function TSP_shapeReason(shape, wrongShape, summary) {
    if (shape === "adjudicate") return `The text does not start from a single common view: ${summary}.`;
    if (wrongShape === "qualify") return `The text does not end by narrowing the view to a condition: ${summary}.`;
    if (wrongShape === "reject") return `The text does not end by rejecting the view outright: ${summary}.`;
    if (wrongShape === "extend") return `The evidence does not simply confirm the view: ${summary}.`;
    return `The text opens with one widely held view, not two rival ones: ${summary}.`;
  }

  const TSP_SHAPE_VERDICT = {
    qualify: "That is a qualification: the view survives, but only under a condition.",
    reject: "That is a rejection: no part of the view survives.",
    extend: "That is an extension: the evidence confirms the view and the text carries it further.",
    adjudicate: "The text begins from two competing views, not one, and ends by favoring one of them.",
  };

  const tspStructureViewComplication = {
    id: "tsp-structure-view-complication",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "author's purpose",
    difficulty: "Medium",
    title: "Structure: a view, the evidence, and what becomes of the view",
    recognize:
      "A text that starts from a view and brings evidence can end in four ways: it narrows the view, rejects it, carries it further, or chooses between two views. The final sentence decides which.",
    // Medium: the three moves are clearly marked, and one careful reading of
    // the final sentence separates the four shapes.
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "too-broad"],
    build(t) {
      const topic = t.pick(TSP_QUALIFY_TOPICS);
      const frame = t.pick(TSP_SHAPE_FRAMES);
      const x = topic.subject;
      const shape = TSP_shapeOf(topic);
      const summary = TSP_summaryOf(topic);
      const correct = frame[shape](x);
      const wrong = TSP_SHAPES.filter((other) => other !== shape)
        .map((other) => [frame[other](x), TSP_shapeReason(shape, other, summary)]);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.passage },
        stem: "Which choice best describes the overall structure of the text?",
        correct,
        wrong,
        explanation: `Taken move by move, ${summary}. ${TSP_SHAPE_VERDICT[shape]}`,
        steps: [
          "Identify the view (or views) stated at the start and whose they are.",
          "Decide whether the middle evidence supports or cuts against that view.",
          "Read the last sentence closely: does it discard the view, keep part of it, carry it further, or choose between two views?",
          "Choose the description that matches all three moves.",
        ],
        principles: [
          "Evidence against a view can lead an author to qualify it or to reject it; the final sentence shows which.",
          "In structure questions, choices that share opening moves are separated by their last move.",
        ],
        trap: "Assuming that evidence against a view always leads to a qualification, or always to a rejection, instead of reading what the final sentence actually does with the view.",
        hint: "What does the last sentence do with the view the text begins from?",
        estimatedSeconds: 85,
        verify: () =>
          TSP_inOrder(topic.passage, topic.markers) &&
          TSP_SHAPES.includes(shape) &&
          topic.passage.lastIndexOf(topic.markers[2]) > topic.passage.length / 2 &&
          new Set([correct, ...wrong.map(([text]) => text)]).size === 4,
      };
    },
  };

  /* ---------------------------------------------- 7. function: foil sentence */

  // A four-sentence text that reports a view and then tests it: the view
  // (attributed to guidebooks, historians, managers, and so on), support that
  // made it seem right, the evidence against it, and what the text concludes.
  // `roles[i]` describes the job of `sentences[i]`. Any sentence can be the
  // quoted one, and the four roles are always the four choices, so the key is
  // sometimes the challenged view, sometimes the support, the counterevidence,
  // or the conclusion; no wording or length marks it.
  const TSP_FOIL_TOPICS = [
    {
      scene: "cs-varden-murals",
      sentences: [
        "Guidebooks to the chapel at Varden date its murals to the 1400s.",
        "The murals’ stiff, gold-backed figures resemble those in other chapels of that century, and a document from 1462 records a payment to a painter for work in the building.",
        "Last year, however, conservators analyzing a sample of the murals’ deep blue background identified a synthetic pigment that was not manufactured anywhere until the early 1700s.",
        "Because the blue lies beneath the gold rather than on top of it, it cannot be a later touch-up: the murals as they now appear must date from the 1700s or after.",
      ],
      roles: [
        "It reports a dating of the murals that the text goes on to challenge.",
        "It gives evidence that seems to support the traditional date of the murals.",
        "It presents a finding that conflicts with the traditional date.",
        "It draws a conclusion about the murals’ age from where the pigment lies.",
      ],
    },
    {
      scene: "cs-pell-tortoises",
      sentences: [
        "Many histories of Pell Island state that its giant tortoises descend from animals that sailors left there in the 1600s as a supply of fresh meat.",
        "Ships’ logs from the period mention such practices on several islands in the region, and the tortoises closely resemble a species found on the mainland.",
        "Yet when geneticists compared DNA from the island and mainland populations, they found differences that would have taken hundreds of thousands of years to accumulate.",
        "The tortoises must have reached Pell long before any ship did, most likely by floating across on their own, as tortoises are known to do.",
      ],
      roles: [
        "It sets out an account of the tortoises’ origin that the text later rejects.",
        "It offers evidence that appears to support the idea that sailors brought the tortoises.",
        "It reports a genetic finding that is hard to reconcile with a 1600s arrival.",
        "It states the explanation of the tortoises’ arrival that the text favors.",
      ],
    },
    {
      scene: "cs-merrow-bay-founding",
      sentences: [
        "Historians and archaeologists have both studied how the harbor town of Merrow Bay began.",
        "According to the town’s own histories, fishing families who sailed south from the Tarn coast in 1682 were the first people ever to settle there, a date carved above the door of its oldest church.",
        "Excavations beneath the town’s market square last spring, however, uncovered the remains of hearths, grain pits, and iron plow blades.",
        "Radiocarbon dates from the hearths cluster around 1610, which means that a farming community was living on the site some seventy years before the fishermen arrived.",
      ],
      roles: [
        "It introduces the subject of the town’s origins, which the rest of the text examines.",
        "It reports a traditional account of the town’s settlement that the text goes on to correct.",
        "It describes discoveries whose significance the following sentence explains.",
        "It establishes that people lived on the site before the date the town’s histories give.",
      ],
    },
    {
      scene: "cs-salt-road-authorship",
      sentences: [
        "Literary historians have generally credited the anonymous 1847 novel ‘The Salt Road’ to the essayist Harriet Voss.",
        "Voss’s friends hinted as much in their letters, and the novel’s setting, a fishing village on the Marl estuary, is where she spent her childhood.",
        "But a computer comparison of the novel’s vocabulary with the writing of several possible authors found that its habits of word choice match those of her brother, Edmund, far more closely than hers.",
        "Voss may have shared memories of the village with Edmund, but the novel itself was most likely his.",
      ],
      roles: [
        "It presents an attribution of the novel that the text goes on to dispute.",
        "It gives reasons why scholars have linked the novel to Harriet Voss.",
        "It reports the analysis that points to a different author.",
        "It offers the text’s conclusion while granting Harriet Voss a possible role.",
      ],
    },
    {
      scene: "cs-marsh-thrush-song",
      sentences: [
        "In the dense reeds where marsh thrushes nest, a young male spends his first weeks within a few meters of his father.",
        "Birdwatchers have long assumed, therefore, that he learns his song from his father.",
        "Researchers at the Fenwick Reserve tested the idea by moving a set of newly hatched chicks into the nests of unrelated pairs.",
        "By their first spring, the fostered males sang neither like their biological fathers nor especially like their foster fathers; their songs matched those of whichever neighboring male sang most often near the nest.",
      ],
      roles: [
        "It describes a circumstance that has made one view of song learning seem natural.",
        "It states an assumption about song learning that the study then puts to the test.",
        "It describes the procedure the researchers used to test that assumption.",
        "It reports the result that undercuts the assumption about fathers.",
      ],
    },
    {
      scene: "cs-halvern-stadium",
      sentences: [
        "When the city of Halvern opened its new baseball stadium in 2012, local officials predicted that it would bring a surge of new spending to the city.",
        "Ten years of sales-tax records from Halvern show that restaurants and bars near the stadium did gain customers on game days.",
        "Businesses elsewhere in the city, though, lost nearly as much, as residents shifted their evening spending rather than adding to it.",
        "The stadium, in other words, moved money around the city far more than it created new spending.",
      ],
      roles: [
        "It presents a prediction that the rest of the text largely rejects.",
        "It concedes that one part of the prediction was borne out.",
        "It reports the finding that offsets the gains made near the stadium.",
        "It sums up the text’s judgment of the stadium’s economic effect.",
      ],
    },
    {
      scene: "cs-oskara-temple-builders",
      sentences: [
        "According to travelers who visited its ruins two centuries later, the hilltop temple at Oskara was raised by laborers captured in war and forced to work.",
        "The sheer size of the temple’s stone blocks seemed to confirm the story, since moving them would have demanded a vast workforce.",
        "Excavations of the workers’ village at the foot of the hill, however, have revealed bakeries, a brewery, and the skeletons of laborers whose broken bones had been carefully set and allowed to heal.",
        "Several workers were even buried with tools and jars of food for the afterlife, honors rarely granted to captives.",
      ],
      roles: [
        "It relays a claim about the temple’s builders that the text calls into question.",
        "It explains why the travelers’ account once seemed persuasive.",
        "It presents evidence that the laborers were fed and cared for.",
        "It adds a detail that further sets the workers apart from captives.",
      ],
    },
    {
      scene: "cs-castel-quartet-pitch",
      sentences: [
        "When modern ensembles perform the string quartets of Aurelio Castel, they tune to the pitch standard used in concert halls today.",
        "Most performers assume that Castel wrote the quartets with that familiar pitch in mind.",
        "His own copies of the scores, however, carry penciled notes asking players to tune noticeably lower, and a tuning fork found among his belongings sounds almost a half step below the modern standard.",
        "Played at Castel’s pitch, the quartets’ highest passages lose their strained brilliance and take on a warmer tone.",
      ],
      roles: [
        "It describes a current performance practice that the text goes on to question.",
        "It states an assumption about Castel’s intentions that underlies the modern tuning.",
        "It presents evidence of the pitch Castel actually intended.",
        "It suggests how the music changes when it is played as Castel intended.",
      ],
    },
    {
      scene: "cs-lake-tarren-shorelines",
      sentences: [
        "Geologists long held that Lake Tarren, now a white salt flat, has held no water for the past ten thousand years.",
        "Its highest ancient shorelines, etched into the surrounding hills, formed during the last ice age, when the region was far wetter.",
        "Lower down, though, a fainter set of shorelines holds the shells of freshwater snails.",
        "Radiocarbon dating shows the shells to be only about four thousand years old, so the lake must have filled again, at least partly, long after the ice age ended.",
      ],
      roles: [
        "It reports a view of the lake’s history that the text goes on to revise.",
        "It gives background on the ice-age shorelines that the text does not dispute.",
        "It introduces physical evidence whose age the next sentence establishes.",
        "It uses dating results to conclude that the lake refilled much later.",
      ],
    },
    {
      scene: "cs-corvel-remote-work",
      sentences: [
        "Many managers believe that employees who switch to working from home gradually drift away from their colleagues.",
        "Without chance meetings in hallways and at lunch, the reasoning goes, working relationships have little to sustain them.",
        "A two-year study of 900 employees at the Corvel Company, however, found that those who moved to remote work sent more messages to coworkers, joined more small-group video calls, and rated their ties to their teams as slightly stronger than before.",
        "Distance, for these workers, changed the form of their contact more than its amount.",
      ],
      roles: [
        "It states a belief about remote workers that a study described later challenges.",
        "It gives the reasoning behind the managers’ belief.",
        "It reports findings at odds with the managers’ belief.",
        "It offers an interpretation of what the study’s findings mean.",
      ],
    },
  ];

  // The first words of a sentence, for pointing to it in a reason.
  const TSP_opening = (sentence) => {
    const words = sentence.split(" ");
    return words.length > 7 ? `${words.slice(0, 7).join(" ")} …` : sentence;
  };

  const tspFunctionFoil = {
    id: "tsp-function-foil",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "function of a sentence",
    difficulty: "Medium",
    title: "Function of a sentence in a text that tests a view",
    recognize:
      "In a text that reports a view and then tests it, each sentence has one job: the view, what made it plausible, the evidence against it, or the conclusion. Place the quoted sentence in that sequence, however confidently it is worded.",
    // Medium: the view is attributed and the turn is marked, but the student
    // must track all four sentences to separate neighboring jobs.
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["misattributed-view", "opposite-stance"],
    build(t) {
      const topic = t.pick(TSP_FOIL_TOPICS);
      const index = t.int(0, topic.sentences.length - 1);
      const passage = topic.sentences.join(" ");
      const quoted = topic.sentences[index];
      const correct = topic.roles[index];
      const wrong = topic.roles
        .map((role, other) => [role, `This is the job of a different sentence (“${TSP_opening(topic.sentences[other])}”), not of the quoted one.`])
        .filter((unused, other) => other !== index);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: passage },
        stem: `Which choice best describes the function of the sentence “${quoted}” in the text as a whole?`,
        correct,
        wrong,
        explanation: `Each sentence of the text has its own job, and only one choice describes the quoted sentence’s: ${TSP_lower(correct)} The other choices describe the jobs of the text’s other sentences.`,
        steps: [
          "Read to the end of the text and name the job of each sentence: the view, its support, the evidence against it, the conclusion.",
          "Locate the quoted sentence in that sequence.",
          "Choose the description of that sentence’s job, not of the one before or after it.",
        ],
        principles: [
          "A sentence’s function depends on how the rest of the text treats it, not on how confidently it is worded.",
          "Distinguish the view a text reports from the view its evidence supports.",
        ],
        trap: "Choosing the job of a neighboring sentence, or treating a confidently stated view as the author’s own claim, instead of placing the quoted sentence in the text’s sequence.",
        hint: "What would the text lose if the quoted sentence were removed?",
        estimatedSeconds: 85,
        verify: () =>
          topic.sentences.length === topic.roles.length &&
          passage.indexOf(quoted) === topic.sentences.slice(0, index).join(" ").length + (index ? 1 : 0) &&
          new Set(topic.roles).size === topic.roles.length,
      };
    },
  };

  /* ------------------------------------ 8. purpose: evaluate a cited source */

  // A named researcher’s account and evidence, then the author’s brief
  // assessment: `grant` (what the author accepts) comes before `gap` (what the
  // account leaves unexplained). The key's verb rotates (assess, evaluate,
  // weigh, grant, point out), and the overstated rejection borrows the same
  // verbs, so a student has to read what each choice says the author concludes.
  const TSP_EVALUATE_TOPICS = [
    {
      scene: "cs-ashby-reading-rooms",
      researcher: "Menon",
      passage:
        "Historian Clara Menon argues that the free reading rooms opened in the mill towns of the Ashby Valley during the 1850s spread literacy among factory workers. Her evidence is impressive: the rooms’ registers list more than six thousand members, most of them mill hands, and the rooms stayed open late so that workers could visit after their shifts. The registers certainly show that workers used the rooms in large numbers. What they cannot show is whether those workers learned to read there or had already learned elsewhere, perhaps in the Sunday schools that were spreading through the valley in the same decade.",
      grant: "The registers certainly show",
      gap: "What they cannot show",
      key: "To weigh Menon’s claim and note what her evidence leaves open",
      present: "To summarize Menon’s claim about literacy in the Ashby Valley and the evidence she offers",
      argue: "To assess Menon’s evidence and show that it contradicts her claim about literacy",
      explainGap: "To explain why Sunday schools spread through the Ashby Valley in the 1850s",
    },
    {
      scene: "cs-kestle-bridge-bats",
      researcher: "Wren",
      passage:
        "Biologist Tomasz Wren has proposed that the colony of bats roosting under the Kestle Bridge chose the site for its warmth. The concrete crevices where the bats sleep stay about 4°C warmer than nearby tree hollows during cool spring nights, when mothers are raising pups that cannot yet regulate their own body temperature. That account fits the spring well. It is harder to square with the colony’s behavior in July and August, when the crevices become the hottest roosts in the area, yet the bats stay put rather than moving to the cooler hollows a short flight away.",
      grant: "That account fits the spring well",
      gap: "harder to square",
      key: "To assess Wren’s account of the bats’ roost and note what it leaves out",
      present: "To describe Wren’s account of the bats’ roost and the measurements that support it",
      argue: "To weigh Wren’s measurements and conclude that they disprove his account",
      explainGap: "To explain why the bats remain under the bridge during the hottest months",
    },
    {
      "scene": "cs-aldren-cold-summer",
      "researcher": "Faro",
      "passage": "Climate historian Ines Faro attributes the unusually cold summer of 1641 in the Aldren highlands to a distant volcanic eruption. Ice cores drilled from a nearby glacier contain a layer of volcanic ash dated to that year, and sulfur from such eruptions is known to dim sunlight for months. The ash layer makes a strong case that an eruption occurred in 1641. Parish records, though, record persistently unusual cold from March onward, with snow lasting far below its normal altitude, and the ice cores place the ash in late spring, after the cold had already begun.",
      "grant": "The ash layer makes a strong case",
      "gap": "though",
      "key": "To evaluate Faro’s explanation of the cold summer of 1641 and raise a problem of timing",
      "present": "To outline Faro’s explanation of the cold summer and the ice-core evidence for it",
      "argue": "To question whether any volcanic eruption at all occurred in 1641",
      "explainGap": "To explain why snow fell on the high Aldren pastures in March of 1641"
    },
    {
      scene: "cs-lantern-portrait-fading",
      researcher: "Ueda",
      passage:
        "Conservator Kenzo Ueda believes that the faded blues in the portrait ‘Woman with a Lantern’ were bleached by sunlight from a window beside which the painting hung for almost a century. His evidence is persuasive as far as it goes: the fading is strongest along the painting’s right side, which faced the window, and weakest along the left. But the lower edge of the canvas, which a heavy frame kept shaded for most of that century, has faded nearly as much as the right side.",
      grant: "His evidence is persuasive as far as it goes",
      gap: "But the lower edge",
      key: "To grant part of Ueda’s explanation while noting what it cannot explain",
      present: "To summarize Ueda’s explanation of the portrait’s faded blues and his evidence for it",
      argue: "To show that Ueda’s explanation of the portrait’s faded blues is mistaken",
      explainGap: "To explain why the shaded lower edge of the portrait has faded so badly",
    },
    {
      scene: "cs-pellington-railway",
      researcher: "Achterberg",
      passage:
        "According to economic historian Pieter Achterberg, the town of Pellington grew because of its railway station. The numbers support him up to a point: Pellington’s population doubled in the decade after the station opened in 1868, and new warehouses clustered near the tracks. Yet Thorne, eight miles down the same line, received a station in the same year and barely grew at all. The station may well have helped Pellington, but it cannot by itself explain why one of the two towns grew and the other did not.",
      grant: "The numbers support him up to a point",
      gap: "Yet Thorne",
      key: "To assess Achterberg’s account of Pellington’s growth and note a case it cannot explain",
      present: "To present Achterberg’s account of Pellington’s growth and the figures behind it",
      argue: "To evaluate Achterberg’s figures and show the station played no role",
      explainGap: "To explain why the town of Thorne grew so little after its station opened",
    },
    {
      scene: "cs-brask-vowel",
      researcher: "Vogel",
      passage:
        "Linguist Hana Vogel argues that teenagers in the city of Brask have adopted a new vowel sound from a popular television series set in the capital, where the vowel is common. Her recordings show the sound spreading first among viewers aged thirteen to nineteen, the show’s main audience, beginning the year after its premiere. The timing is suggestive. Still, the series aired across the whole city, while the new vowel has so far appeared almost entirely in a single neighborhood, Lower Brask.",
      grant: "The timing is suggestive",
      gap: "Still,",
      key: "To evaluate Vogel’s explanation of the new vowel and note what it leaves open",
      present: "To describe Vogel’s explanation of the new vowel and the recordings that support it",
      argue: "To evaluate Vogel’s recordings and show that they contradict her explanation",
      explainGap: "To explain why the new vowel has spread mainly through Lower Brask",
    },
    {
      scene: "cs-keel-notebooks",
      researcher: "Hart",
      passage:
        "Scholar Leonie Hart contends that the philosopher Ambrose Keel abandoned his early theory of perception after a critic, Mary Dunmore, attacked it in a widely read letter of 1754. Keel’s next book, published within a year of the letter, omits the theory entirely. Hart’s timeline is careful, and the omission is real. Keel’s private notebooks, however, show him defending the theory against Dunmore’s objections for another decade.",
      grant: "Hart’s timeline is careful, and the omission is real",
      gap: "however",
      key: "To weigh Hart’s account of Keel’s change of mind against evidence it does not fit",
      present: "To summarize Hart’s account of why Keel dropped his theory and the evidence she cites",
      argue: "To assess Hart’s timeline of Keel’s career and show that it is inaccurate",
      explainGap: "To explain why Dunmore’s letter of 1754 attracted such a wide readership",
    },
    {
      scene: "cs-morrow-dawn-chorus",
      researcher: "Sandoval",
      passage:
        "Ecologist Felipe Sandoval proposes that songbirds sing most intensely at dawn because the still, cool air of early morning carries sound especially well. In tests at the Morrow Woods reserve, he found that recorded songs played at dawn could be detected about 20 percent farther away than the same songs played at midday. The acoustic advantage he measured is real. But evening air in the reserve is often just as still and cool, and birds there sing far less at dusk than at dawn.",
      grant: "The acoustic advantage he measured is real",
      gap: "But evening air",
      key: "To point out a limitation in Sandoval’s explanation of the dawn chorus",
      present: "To outline Sandoval’s explanation of the dawn chorus and the sound tests he ran",
      argue: "To evaluate Sandoval’s sound tests and show that his measurements were flawed",
      explainGap: "To explain why evening air at Morrow Woods is often as still as morning air",
    },
    {
      scene: "cs-eastgate-gardens",
      researcher: "Quist",
      passage:
        "Sociologist Amara Quist credits the community gardens planted on vacant lots in the Eastgate neighborhood with reducing the number of empty homes there. Across the blocks where gardens were planted in 2016, vacancies fell by a third over the following five years, while they held steady on blocks without gardens. The contrast between the two sets of blocks is striking. City records show, however, that vacancies on the garden blocks had already begun to fall in 2014, two years before the first seeds went into the ground.",
      grant: "The contrast between the two sets of blocks is striking",
      gap: "however",
      key: "To assess Quist’s account of the falling vacancies and raise a problem of timing",
      present: "To describe Quist’s account of Eastgate’s falling vacancies and the data she presents",
      argue: "To weigh Quist’s data and conclude that the gardens had no effect on vacancies",
      explainGap: "To explain why vacancies on the garden blocks began to fall as early as 2014",
    },
    {
      scene: "cs-oran-weaving-pattern",
      researcher: "Bell",
      passage:
        "Textile historian Joaquín Bell argues that the star-and-ladder weaving pattern spread across the Oran plateau because merchants carried cloth bearing it along the old salt road. The pattern does appear in nearly every town along the road, and the oldest examples come from the road’s eastern end, where Bell believes it began. Bell’s map makes a good case for the towns on the route. It says nothing, however, about Hollin, a village in the mountains two days’ walk from the road, where weavers were making the same pattern at least as early as anyone.",
      grant: "Bell’s map makes a good case",
      gap: "It says nothing, however",
      key: "To evaluate Bell’s account of the pattern’s spread and note a case it does not explain",
      present: "To summarize Bell’s account of the pattern’s spread and the evidence he has gathered",
      argue: "To question whether merchants on the salt road carried any patterned cloth at all",
      explainGap: "To explain why weavers in Hollin began making the star-and-ladder pattern",
    },
    {
      scene: "cs-lake-sorrel-ice",
      researcher: "Harrow",
      passage:
        "Limnologist Gwen Harrow links the later freeze-up of Lake Sorrel over the past 150 years to rising air temperatures in the region. Records kept by residents show that the lake now freezes, on average, about two weeks later than it did in the 1870s, and regional air temperatures have climbed steadily over the same period. Harrow’s correlation is strong. Lake Vessey, however, lies only twenty miles away, is nearly the same size and depth, and has experienced the same warming, yet its average freeze-up date has scarcely changed.",
      grant: "Harrow’s correlation is strong",
      gap: "however",
      key: "To grant Harrow’s correlation for Lake Sorrel while noting a case it does not explain",
      present: "To present Harrow’s account of Lake Sorrel’s later freezing and the records behind it",
      argue: "To assess Harrow’s records and show that they contradict her account",
      explainGap: "To explain why Lake Vessey’s freeze-up date has scarcely changed since the 1870s",
    },
  ];

  const tspPurposeEvaluateSource = {
    id: "tsp-purpose-evaluate-source",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "author's purpose",
    difficulty: "Medium",
    title: "Main purpose: weighing a researcher’s account",
    recognize:
      "Most of the text reports a researcher’s view, but the author’s own voice enters at the end to grant part of it and point to what it leaves unexplained; the purpose is the author’s assessment, not the researcher’s claim.",
    // Medium: the author's voice enters with a signposted grant ("persuasive
    // as far as it goes") and a turn, so the purpose follows from one contrast.
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["misattributed-view", "extreme-language", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(TSP_EVALUATE_TOPICS);
      const name = topic.researcher;
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.passage },
        stem: "Which choice best states the main purpose of the text?",
        correct: topic.key,
        wrong: [
          [topic.present, `Most of the text does report ${name}’s view, but the author then weighs it and points to something it leaves unexplained; this choice stops before the author’s own contribution.`],
          [topic.argue, `The author grants part of ${name}’s account (“${topic.grant}”), so the text qualifies the account rather than rejecting it outright.`],
          [topic.explainGap, "The text raises this point to show a gap in the account; it never explains it."],
        ],
        explanation: `The text first reports ${name}’s account and evidence, then the author grants part of it (“${topic.grant}”) before pointing to something the account leaves unexplained. The main purpose is therefore ${TSP_lower(topic.key)}, not simply to present the account or to reject it.`,
        steps: [
          "Separate the sentences that report the researcher’s view from the sentences in the author’s own voice.",
          "Note what the author grants and what the author says the account does not cover.",
          "Choose the purpose that includes both the report and the author’s assessment.",
        ],
        principles: [
          "When a text reports someone else’s claim and then comments on it, its purpose usually lies in the comment.",
          "Granting part of a claim while pointing out a gap is an assessment, not a rejection.",
        ],
        trap: "Choosing the summary option because most of the sentences describe the researcher’s work, overlooking the author’s evaluation at the end.",
        hint: "Find the first sentence that gives the author’s own judgment.",
        estimatedSeconds: 95,
        verify: () => {
          const nameAt = topic.passage.indexOf(name);
          const grantAt = topic.passage.indexOf(topic.grant, nameAt);
          const gapAt = topic.passage.indexOf(topic.gap, grantAt + 1);
          return nameAt >= 0 && nameAt < topic.passage.length / 3 && grantAt > nameAt && gapAt > grantAt &&
            topic.key.includes(`${name}’s`) && topic.present.includes(`${name}’s`) &&
            !topic.explainGap.includes(name) &&
            new Set([topic.key, topic.present, topic.argue, topic.explainGap]).size === 4;
        },
      };
    },
  };

  /* ------------------------ 9. function of a sentence in dense academic prose */

  // Hard. Scholarly prose in which the quoted sentence does one precise job
  // among several similar ones: sets up a contrast, states a method, raises a
  // rival explanation, concedes a limit, draws an inference, counterexamples a
  // definition, poses an anomaly, derives a prediction, explains a mechanism.
  // Distractors are the jobs of the neighboring sentences, a stronger version
  // of the right job (rejects for limits), or the reverse relation. Every item
  // is written whole, so key wording, verb, and length vary from item to item.
  const TSP_ACADEMIC_FUNCTION_TOPICS = [
    {
      "scene": "cs-going-to-future",
      "passage": "An account of grammatical change treats English be going to as a travel phrase replaced by a marker of future time. A critic objects that people still say they are going to the market. When the same speaker says a storm is going to arrive, however, the expression need not describe anyone's movement. This contrast undermines neither the survival of the travel use nor the emergence of the grammatical one. What needs revision is the account's suggestion of replacement: a new function can develop while its source remains available. The critic has identified an overstatement of the process, not evidence that no process occurred.",
      "quoted": "When the same speaker says a storm is going to arrive, however, the expression need not describe anyone's movement.",
      "key": "It adds a use that supports grammatical change while helping to correct the claim of replacement.",
      "wrong": [
        [
          "It refutes the critic's claim that the expression retains a meaning connected with travel.",
          "The travel meaning is retained; the quotation establishes an additional use."
        ],
        [
          "It demonstrates that the earlier phrase has disappeared, preserving the original account's description of replacement.",
          "The critic's valid example shows the earlier use persists."
        ],
        [
          "It explains the historical mechanism that first caused a travel expression to acquire its new function.",
          "The quotation illustrates a current contrast, not the historical causal mechanism."
        ]
      ],
      "why": "The quotation supplies the nontravel use. Together with the critic's travel example, it establishes coexistence, supporting grammatical change while correcting the claim that the new use replaced the old."
    },
    {
      "scene": "cs-castleby-wages",
      "passage": "Castleby's dock wages rose from two shillings a day in 1540 to nine in 1640. A local historian reads this as a more than fourfold increase in prosperity. Ilse Marr accepts the wage entries but notes that successive rulers reduced the silver in a shilling. Marr therefore converts every wage into the weight of silver it represented before comparing one decade with another. A critic objects that silver itself can change in purchasing power. Marr accordingly prices bread in the same silver units and compares the two series: wages rose little relative to bread. Her procedure thus has two stages, neither of which requires discarding the original wage entries.",
      "quoted": "Marr therefore converts every wage into the weight of silver it represented before comparing one decade with another.",
      "key": "It corrects one obstacle to comparison, before a separate comparison addresses whether the adjusted wages bought more.",
      "wrong": [
        [
          "It establishes the workers’ purchasing power directly, leaving the later bread-price comparison to illustrate the result.",
          "Silver wages alone do not establish purchasing power; the critic's objection requires the separate comparison with bread."
        ],
        [
          "It replaces unreliable wage entries with a new estimate inferred from the crown’s surviving silver coins.",
          "Marr accepts and converts the original wage figures; she does not replace them with coin-based wage estimates."
        ],
        [
          "It answers the critic’s objection by showing that silver retained a constant purchasing power over the century.",
          "The conversion precedes the objection and does not establish constant purchasing power of silver."
        ]
      ],
      "why": "Conversion addresses the changing silver content of the unit in which wages were recorded. Comparing those converted wages with bread priced in silver then addresses purchasing power; neither operation alone does both jobs."
    },
    {
      "scene": "cs-arvo-lizard-seeds",
      "passage": "Lizards on Arvo carry shrub seeds away and leave seeds that sprout readily. Rafael Duarte attributes both outcomes to gut passage. A critic observes that lizards select ripe fruit, whose seeds might already sprout well. That possibility would explain the germination difference without explaining where the seeds were deposited. Duarte then compared seeds from equally ripe fruit, some passed through lizards and some cleaned by hand; the former still sprouted more often. The result answers the critic on germination, while the original location records remain the evidence for dispersal. A single objection had threatened only one part of the proposed double benefit.",
      "quoted": "That possibility would explain the germination difference without explaining where the seeds were deposited.",
      "key": "It limits the critic's alternative to the claim that the subsequent experiment tests.",
      "wrong": [
        [
          "It accepts the alternative explanation and therefore withdraws the claim that lizards benefit the shrub.",
          "The possibility is considered, then tested; it does not negate dispersal or establish the alternative."
        ],
        [
          "It identifies a flaw in the location records that the subsequent germination experiment is designed to repair.",
          "The location records are not challenged, and the experiment addresses sprouting rather than location."
        ],
        [
          "It combines the critic's account with Duarte's to explain both benefits without requiring a new comparison.",
          "The critic's account leaves dispersal unaddressed, and the germination comparison is still needed."
        ]
      ],
      "why": "The sentence distinguishes germination from dispersal. It marks exactly which causal claim fruit selection could undermine, so the later experiment's result is not mistaken for evidence about both benefits."
    },
    {
      "scene": "cs-san-lorenz-altarpiece",
      "passage": "Paola Venn attributes the San Lorenz altarpiece to Ferri because its underdrawing resembles his signed panels. Her colleague agrees that the resemblance locates the work within Ferri's workshop but calls individual attribution premature. A workshop could teach the same rapid line to an assistant without making the resulting drawing distinguishable by that feature alone. Venn responds that the panel's wood predates the known assistants' employment. That reply narrows the colleague's alternative only if the drawing followed soon after the panel was made; stored wood leaves a gap. Neither the shared technique nor the early wood date independently settles whose hand drew the figures.",
      "quoted": "A workshop could teach the same rapid line to an assistant without making the resulting drawing distinguishable by that feature alone.",
      "key": "It distinguishes evidence of workshop membership from evidence identifying an individual hand.",
      "wrong": [
        [
          "It identifies an assistant's distinctive technique that the later wood date rules out as an alternative.",
          "The technique is shared, and the wood date does not conclusively rule out assistants."
        ],
        [
          "It challenges the observed resemblance so that Venn must support her attribution using chronology alone.",
          "The resemblance is accepted; its ability to identify one hand is limited."
        ],
        [
          "It establishes that the altarpiece was collaborative, allowing both competing attributions to be correct.",
          "Possible shared training does not establish collaboration or two hands."
        ]
      ],
      "why": "The sentence explains the colleague's distinction between workshop and individual evidence. The later wood date is a separate, qualified response, not a reason to erase that distinction."
    },
    {
      "scene": "cs-chess-master-recall",
      "passage": "Chess masters reconstruct real board positions better than novices, yet their advantage shrinks when pieces are arranged randomly. A commentator calls this proof that masters have no memory advantage at all. The comparison instead limits the kind of advantage demonstrated. Familiar configurations allow several pieces to be encoded as a meaningful unit, whereas a random arrangement supplies fewer such units. This explanation locates the observed benefit in acquired knowledge without denying that the benefit is expressed in remembering. It also leaves open whether masters differ on other memory tasks, which the board experiment did not test.",
      "quoted": "Familiar configurations allow several pieces to be encoded as a meaningful unit, whereas a random arrangement supplies fewer such units.",
      "key": "It explains the conditional advantage while limiting the commentator's inference from it.",
      "wrong": [
        [
          "It supplies evidence that masters perform no better than novices on memory tasks outside chess.",
          "The experiment did not test other tasks, and the text explicitly leaves them open."
        ],
        [
          "It attributes the masters' advantage to a general capacity that should work equally well with random positions.",
          "The mechanism depends on familiar meaningful patterns, which random positions lack."
        ],
        [
          "It explains why the experiment's random condition cannot bear on an account of the masters' memory.",
          "The random condition helps identify the role of familiar configurations; it is not dismissed."
        ]
      ],
      "why": "Chunking familiar patterns explains why the advantage depends on the position. It preserves an actual memory benefit while limiting claims about its source and about other tasks."
    },
    {
      "scene": "cs-two-senses-gene",
      "passage": "An early geneticist could use gene for an inherited factor without knowing its material basis; a molecular biologist may use the term for a DNA sequence. A historian calls the second usage simply a more precise name for the first. Yet one inherited trait can involve several sequences, and one sequence can affect several traits. The historian replies that both usages have helped explain inheritance. That shared purpose does not establish a one-to-one match between their objects. The newer account may deepen understanding without merely supplying a physical label for each unit in the older account.",
      "quoted": "Yet one inherited trait can involve several sequences, and one sequence can affect several traits.",
      "key": "It challenges a correspondence that shared explanatory usefulness does not establish.",
      "wrong": [
        [
          "It shows that the older concept explained no inheritance patterns and therefore must be discarded.",
          "The older concept's usefulness is not denied; a simple correspondence is challenged."
        ],
        [
          "It establishes a shared explanatory purpose that the historian later disputes.",
          "The historian invokes the shared purpose; the quotation concerns correspondence between objects."
        ],
        [
          "It resolves the ambiguity by assigning each inherited trait a unique sequence that can now be identified.",
          "The quotation describes many-to-many relationships, the opposite of a unique assignment."
        ]
      ],
      "why": "The many-to-many relation defeats simple relabeling. It leaves room for both concepts to have explanatory value, so the historian's reply does not answer the particular objection."
    },
    {
      "scene": "cs-varrow-towers",
      "passage": "Imre Halász's map links mutually visible Varrow towers into a coastal signaling chain. A critic accepts the sight lines but doubts that a message could have crossed the entire route in one night. Several towers essential to the mapped chain were built only after neighboring towers had fallen into ruin. Halász replies that some adjacent pairs certainly overlapped in use. That reply preserves the possibility of local signaling, but a route assembled from pairs that functioned in different centuries is not a route that functioned at one time. The map's spatial continuity cannot supply the missing temporal continuity.",
      "quoted": "Several towers essential to the mapped chain were built only after neighboring towers had fallen into ruin.",
      "key": "It challenges the full route's timing while allowing the local links mentioned in the reply.",
      "wrong": [
        [
          "It disputes the mapped visibility links and leads Halász to replace them with links between different towers.",
          "The sight lines are accepted; timing, not visibility, is challenged."
        ],
        [
          "It excludes all signaling among the towers, making the later evidence of overlapping pairs contradictory.",
          "Local pairs can have operated even though the complete chain never did."
        ],
        [
          "It establishes a chronology for the whole chain that Halász's reply confirms with dates for individual pairs.",
          "The chronology undermines a simultaneous whole; dates for some pairs do not restore it."
        ]
      ],
      "why": "The sentence targets the coexistence required by the full single-night route. Halász's overlapping pairs answer a weaker question and therefore do not remove the challenge."
    },
    {
      "scene": "cs-lisle-narrators",
      "passage": "Critics describe Wenna Lisle's narrators as disappearing into her characters' minds. Scholar Anne Voss treats this restraint as proof that Lisle rejected narratorial judgment throughout her career. That description fits her first four novels, whose narrators almost never offer a judgment of their own, but it does not fit her last two. In those later books, judgments once embedded in a character's speech reappear as the narrator's own comments, sometimes addressed directly to the reader. This change does not make the early narrators less reticent; it makes their reticence an unsafe basis for Voss's account of Lisle's whole career.",
      "quoted": "That description fits her first four novels, whose narrators almost never offer a judgment of their own, but it does not fit her last two.",
      "key": "It preserves the critics’ observation within a limited period while preparing a challenge to Voss’s broader inference.",
      "wrong": [
        [
          "It rejects the critics’ description of the early novels because the later narrators comment directly on their characters.",
          "Later differences limit generalization; they do not invalidate the description of the early novels."
        ],
        [
          "It accepts Voss’s claim about Lisle’s intentions while explaining why her later narrators failed to carry it out.",
          "The passage challenges Voss's career-wide inference and does not establish an intention that later work failed to fulfill."
        ],
        [
          "It attributes the later narrators’ judgments to characters, thereby extending the account given of the early books.",
          "The passage distinguishes narrator-owned later comments from character speech instead of extending the early pattern."
        ]
      ],
      "why": "The sentence grants the initial description for the first four novels, then points toward later counterevidence. Its role is to limit a true observation before rejecting Voss's generalization from it."
    },
    {
      "scene": "cs-dialect-definition",
      "passage": "A proposed definition makes mutual understanding the test for whether two forms of speech are dialects of one language or separate languages. A critic objects that it would require relabeling familiar cases. Speakers of Norwegian and Swedish can usually follow each other’s speech with modest effort, yet the two are counted as separate languages, while several varieties of Chinese whose speakers cannot readily understand one another are routinely called dialects. A defender replies that inherited labels need not constrain a technical definition. The author grants that reply but notes a different difficulty: understanding varies among speakers and depends on exposure. The counterexamples therefore defeat simple reliance on current names; they do not, by themselves, settle whether a revised linguistic criterion is possible.",
      "quoted": "Speakers of Norwegian and Swedish can usually follow each other’s speech with modest effort, yet the two are counted as separate languages, while several varieties of Chinese whose speakers cannot readily understand one another are routinely called dialects.",
      "key": "It illustrates the critic’s objection, whose force the subsequent reply limits before the author raises a different difficulty.",
      "wrong": [
        [
          "It presents the author’s final objection that levels of understanding vary with speakers’ previous exposure.",
          "That is the author's later difficulty; the quotation concerns conflicts between understanding and conventional names."
        ],
        [
          "It confirms the defender’s claim that inherited names must govern any technical definition of a language.",
          "The defender says the opposite: a technical definition need not preserve inherited labels."
        ],
        [
          "It establishes that no linguistic definition can succeed, a conclusion the author endorses without qualification.",
          "The final sentence explicitly leaves a revised linguistic criterion open."
        ]
      ],
      "why": "The named cases illustrate a critic's complaint about labels. The defender limits what that complaint proves, after which the author introduces variability of understanding as a distinct issue."
    },
    {
      "scene": "cs-ambry-baptisms",
      "passage": "Baptisms in Ambry doubled after its new chapel opened, and a local history treats the increase as rapid population growth. Tobias Rehn notes that nearby hamlets had no chapel and that their families began using Ambry's. Marriages and burials recorded there remained steady, as did the number of houses on estate maps. These records do not count residents directly, but they make the baptism-based estimate harder to sustain. Rehn need not show that Ambry gained no residents; his account requires only that a larger chapel catchment can increase recorded baptisms without a proportional increase in village population.",
      "quoted": "Marriages and burials recorded there remained steady, as did the number of houses on estate maps.",
      "key": "It independently weakens the original estimate without proving that no population growth occurred.",
      "wrong": [
        [
          "It directly counts the village's residents, allowing Rehn to prove that none arrived after the chapel opened.",
          "These are indirect indicators and cannot establish that no residents arrived."
        ],
        [
          "It identifies changes in recordkeeping that explain why the baptism total itself is unreliable.",
          "The baptism count may be accurate; its relation to local population is the issue."
        ],
        [
          "It confirms that the neighboring hamlets experienced the population increase first attributed to Ambry.",
          "The records do not establish a population increase in the hamlets."
        ]
      ],
      "why": "Stable independent indicators weaken the inferred doubling of population. They support questioning proportional growth without proving zero growth or falsifying the baptism count."
    },
    {
      "scene": "cs-caching-hippocampus",
      "passage": "Researchers suspect that storing food favors spatial-memory capacities in birds. One proposes comparing heavy and light caching species within several families. If caching demands matter, heavy cachers should tend to have a larger hippocampus relative to body size than their close relatives. A colleague objects that any single family might inherit both traits from one ancestor. Repeating the comparison across distant families reduces that concern; it does not turn the proposal into a claim that hiding food enlarges an individual bird's brain. The proposed comparison concerns recurring differences among species, not a change within one bird's lifetime.",
      "quoted": "If caching demands matter, heavy cachers should tend to have a larger hippocampus relative to body size than their close relatives.",
      "key": "It states a species-level prediction whose test and scope the later discussion qualifies.",
      "wrong": [
        [
          "It reports the result of the cross-family comparisons and establishes that shared ancestry has been eliminated as a possibility.",
          "It states a prediction, not results; the later design reduces rather than eliminates a concern."
        ],
        [
          "It proposes an individual training effect that the later comparisons test by following birds over their lifetimes.",
          "The prediction compares species, and no lifetime experiment is described."
        ],
        [
          "It supplies the colleague's alternative explanation that larger brains arose before caching behavior.",
          "The prediction follows the researchers' caching hypothesis; the colleague's ancestry concern follows later."
        ]
      ],
      "why": "The conditional statement connects a hypothesis to a measurable species comparison. The subsequent qualifications clarify how that prediction should be tested and what it would not establish."
    },
    {
      "scene": "cs-norby-induced-demand",
      "passage": "When Norby's highway gained a lane, delays fell for a year and then returned. One planner calls the initial relief proof that widening works; another calls the later congestion proof that the added lane never helped. Transportation economist Lina Venn accepts both measurements but questions both interpretations. A faster road lowers the time cost of each trip, so drivers who once traveled at other hours, took other routes, or stayed home begin to use it, until congestion rises enough to discourage further trips. On Venn's account, the original users did benefit while traffic was lower; their experience, however, gave no assurance that those conditions would persist. The city's final traffic count includes journeys absent from the initial count.",
      "quoted": "A faster road lowers the time cost of each trip, so drivers who once traveled at other hours, took other routes, or stayed home begin to use it, until congestion rises enough to discourage further trips.",
      "key": "It supplies a mechanism that reconciles the two measurements while undermining the planners’ opposing interpretations.",
      "wrong": [
        [
          "It endorses the first planner’s explanation of the initial relief while treating the later congestion as unrelated.",
          "The mechanism connects initial relief to later congestion rather than separating them."
        ],
        [
          "It disputes the second planner’s traffic measurement by distinguishing original drivers from newly attracted drivers.",
          "Venn accepts the measurements; she disputes what the planner infers from them."
        ],
        [
          "It sets a condition under which the two planners’ predictions about the lane can both remain correct.",
          "The passage gives competing interpretations of outcomes, and Venn questions both rather than reconciling their correctness."
        ]
      ],
      "why": "The extra trips make initial relief and later congestion compatible. That mechanism defeats both the inference of permanent relief and the inference that no one initially benefited. The measurements are accepted; the planners' interpretations are revised."
    },
    {
      "scene": "cs-tidal-mill-date-stone",
      "passage": "A date stone above Orrin Creek's tidal mill led guides to assign the building to the 1600s. Sofia Brandvold found different mortar around that stone and proposed that the mill itself was younger. Date stones were often moved from demolished buildings and reused, she points out, so a stone can record the age of an earlier structure rather than the one it now adorns. A colleague replies that an old building can also receive a replacement doorway. Brandvold agrees, but points to wheel-pit timbers cut around 1760 and original walls bonded directly into the pit. Her dating therefore rests on the structural evidence as well as the possibility raised by the stone's setting.",
      "quoted": "Date stones were often moved from demolished buildings and reused, she points out, so a stone can record the age of an earlier structure rather than the one it now adorns.",
      "key": "It offers a reason to question the traditional dating without by itself establishing the alternative date defended later.",
      "wrong": [
        [
          "It supplies the decisive construction date that the wheel-pit evidence subsequently confirms by another method.",
          "The reuse principle supplies no construction date; the later timbers and wall relationship support 1760."
        ],
        [
          "It concedes the colleague’s explanation of the doorway while disputing the reliability of the dated timbers.",
          "The principle introduces Brandvold's concern; the colleague's objection comes later, and the timbers are not disputed."
        ],
        [
          "It shows that the guides misread the carved numerals, so no additional evidence is needed to date the mill.",
          "The date can be read correctly yet belong to another structure; additional evidence is explicitly required."
        ]
      ],
      "why": "A reused stone can mislead, but the colleague's reply shows that different doorway mortar alone cannot date the whole building. The quoted principle opens the challenge; the timbers and bonded walls provide the later positive evidence."
    },
    {
      "scene": "cs-bilingual-naming-delay",
      "passage": "Bilingual children sometimes name pictured objects more slowly than monolingual peers. Kaveh Amiri attributes the delay to encountering each individual word less often, while a critic favors a general difficulty in selecting between languages. Words that bilingual children use daily in both languages should therefore show a smaller delay, Amiri argues. Both accounts can explain the original average; only Amiri's account specifically motivates this exposure-based contrast. Finding that contrast would strengthen his explanation without proving that selection never contributes. The proposed test separates predictions more narrowly than the rival slogans about bilingualism suggest.",
      "quoted": "Words that bilingual children use daily in both languages should therefore show a smaller delay, Amiri argues.",
      "key": "It turns one account into a discriminating prediction while leaving open the possibility that the competing process also contributes.",
      "wrong": [
        [
          "It reports evidence that the critic's proposed selection difficulty occurs on every word, including highly familiar ones.",
          "The sentence gives Amiri's prediction, not evidence for the critic."
        ],
        [
          "It restates an observation equally predicted by both accounts and therefore explains why the dispute cannot be tested.",
          "The exposure-based contrast is specifically motivated by Amiri's account and supports a test."
        ],
        [
          "It defines a result that would prove selection has no role in bilingual naming under any circumstances.",
          "The passage expressly limits that inference; support for one process does not exclude every role for the other."
        ]
      ],
      "why": "The prediction targets how exposure should modify the delay. It can favor Amiri's explanation of a particular contrast without making the stronger claim that no selection process ever matters."
    },
    {
      "scene": "cs-varne-heron-trail",
      "passage": "Herons declined along the Varne after a walking trail opened. Local campaigners assign the whole decline to disturbance, while Petra Lund examines two nearby estuaries without new trails. Heron numbers fell by almost the same proportion at both. Lund proposes a regional food shortage; the trail's defenders call the comparison proof that walkers cause no harm. A regional cause could explain the shared trend while a local disturbance still affects particular nests. The comparison challenges the campaigners' exclusive account, but its scale gives no direct test of every smaller effect the defenders deny.",
      "quoted": "Heron numbers fell by almost the same proportion at both.",
      "key": "It challenges an exclusive local cause without establishing the absence of all local harm.",
      "wrong": [
        [
          "It establishes the complete absence of trail disturbance by showing that the estuaries had identical conditions.",
          "Similar trends do not establish identical conditions or absence of every local effect."
        ],
        [
          "It confirms the campaigners' causal claim by reproducing the same disturbance at two other sites.",
          "The comparison sites have no new trails, so the trend challenges that claim."
        ],
        [
          "It directly measures the regional food shortage and determines how much of the Varne decline it caused.",
          "The sentence reports bird counts, not food measurements or an exact causal allocation."
        ]
      ],
      "why": "Declines without trails weaken the claim that a trail explains the whole pattern. The evidence operates at the aggregate level and does not prove that no individual nests are disturbed."
    },
    {
      "scene": "cs-harlow-signature-literacy",
      "passage": "Harlow historians estimate reading ability from marriage signatures. Aline Morel objects to treating that indicator as a direct count. People could learn a signature without reading, while capable readers might be unable to write. A critic takes her objection to mean signature rates must exaggerate literacy. Morel instead compares occupational patterns in the registers with lending-library records, finding broad agreement. This check does not remove the indicator's individual errors, but it suggests that their aggregate effect may be limited. The objection justifies checking the estimate; it does not determine in advance which way the estimate is wrong.",
      "quoted": "People could learn a signature without reading, while capable readers might be unable to write.",
      "key": "It identifies opposing possible errors, motivating a check without supporting the critic's prediction of a particular bias.",
      "wrong": [
        [
          "It establishes that signatures systematically overcount readers, a bias the library comparison later measures.",
          "Errors can go both directions, and broad agreement does not measure a systematic overcount."
        ],
        [
          "It rejects any use of the registers, so the later comparison must derive a new estimate without them.",
          "The registers remain in use and are checked against a second source."
        ],
        [
          "It describes weaknesses in the library records that prevent those records from checking the marriage registers.",
          "The quoted weaknesses concern signatures; library records are introduced later as a check."
        ]
      ],
      "why": "The two mismatches run in opposite directions. They motivate external checking while withholding the directional claim that the critic makes; agreement can reduce aggregate concern without eliminating individual errors."
    },
    {
      "scene": "cs-hive-temperature-thresholds",
      "passage": "Observers of honeybee colonies sometimes take stable brood temperatures as evidence that every bee responds to the same thermal signal. A colleague of biologist Mei Arden instead proposed that one group issues instructions to the rest. Studying hives on the island of Tamsin, biologist Mei Arden found that bees differ in the temperature at which they begin to fan their wings or to cluster for warmth: some respond to small changes, others only to large ones. No distinct directing group appeared in her observations. Because more workers join as the temperature moves farther from its usual level, individual variation can produce a smoothly increasing collective response. The hive's apparent coordination need not imply either identical individual thresholds or centralized instruction.",
      "quoted": "Studying hives on the island of Tamsin, biologist Mei Arden found that bees differ in the temperature at which they begin to fan their wings or to cluster for warmth: some respond to small changes, others only to large ones.",
      "key": "It identifies variation among workers that supports an account of coordination without uniform responses or centralized control.",
      "wrong": [
        [
          "It establishes that workers share a response threshold, supporting the observers’ account of the stable brood temperature.",
          "Arden finds different thresholds, the reverse of the uniform response assumed by the observers."
        ],
        [
          "It describes evidence of a directing group that explains why workers begin responding at different temperatures.",
          "The passage reports no such group; individual thresholds supply the alternative mechanism."
        ],
        [
          "It treats differences among individual workers as evidence against the observed stability of the colony’s temperature.",
          "Variation is used to explain stability at colony level, not to dispute that stability."
        ]
      ],
      "why": "Different individual thresholds let the colony's response increase gradually without identical reactions or a directing group. The sentence provides evidence for that alternative account, not a denial of collective stability."
    },
    {
      "scene": "cs-serra-wreck-jars",
      "passage": "Serra excavators inferred a wine cargo from the shape of sealed jars. Residues instead indicated mostly olive oil. The jars are the tall type that coastal workshops designed for wine. A critic treats that design history as evidence against the residue results; archaeologist Tomas Varga treats it as the fact a reuse account must explain. Containers made for one commodity can later carry another. This possibility reconciles design with residues without identifying the jars' workshop or proving how often reuse occurred. The design evidence survives, but the claim it supports concerns intended use rather than the wreck's actual cargo.",
      "quoted": "The jars are the tall type that coastal workshops designed for wine.",
      "key": "It supplies a design fact that the rival accounts relate differently to the actual contents.",
      "wrong": [
        [
          "It establishes the jars' precise manufacturing site, allowing Varga to explain how they reached the wreck.",
          "A regional design does not identify a particular workshop or the jars' route."
        ],
        [
          "It refutes the first cargo identification independently of the chemical evidence that follows.",
          "The design motivated the first identification; it does not refute it."
        ],
        [
          "It supplies proof that the jars were repeatedly reused, resolving uncertainty about the frequency of that practice.",
          "Design and residues make reuse possible; they do not measure its frequency."
        ]
      ],
      "why": "The quotation is accepted under both interpretations. The critic treats intended use as fixing contents; Varga's reuse possibility preserves the design fact while rejecting that inference."
    },
  ];

  const tspAcademicFunction = {
    id: "tsp-academic-function",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "function of a sentence",
    difficulty: "Hard",
    title: "Function of a sentence in dense academic prose",
    recognize:
      "In scholarly prose each sentence answers the one before and sets up the one after; the quoted sentence’s job is defined by that position, and the wrong choices describe its neighbors or a stronger or reversed version of its job.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["true-but-irrelevant", "extreme-language", "opposite-stance"],
    build(t) {
      const topic = t.pick(TSP_ACADEMIC_FUNCTION_TOPICS);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.passage },
        stem: `Which choice best describes the function of the sentence “${topic.quoted}” in the text as a whole?`,
        correct: topic.key,
        wrong: topic.wrong,
        explanation: topic.why,
        steps: [
          "Summarize the job of each sentence in a few words.",
          "Place the quoted sentence among them: what does it respond to, and what depends on it?",
          "Reject choices that describe a neighboring sentence, overstate the sentence’s job, or reverse its relation to the argument.",
        ],
        principles: [
          "A sentence’s function is defined by its relation to the sentences around it.",
          "Limiting, conceding, and rejecting are different moves; match the strength the text actually uses.",
        ],
        trap: "Choosing the job of the sentence just before or after the quoted one, or a stronger version of the right job, such as rejecting where the text only limits.",
        hint: "How does the sentence right after the quoted one depend on it?",
        estimatedSeconds: 100,
        verify: () =>
          topic.passage.includes(topic.quoted) &&
          topic.wrong.length === 3 &&
          new Set([topic.key, ...topic.wrong.map(([text]) => text)]).size === 4,
      };
    },
  };

  /* --------------------------- 10. overall structure of dense academic prose */

  // Hard. Each passage has its own shape (claim, support, limit; problem,
  // failed methods, proposal; two accounts reconciled; finding reinterpreted;
  // definition, counterexample, repair; a principle and its exceptions ...), so
  // no single form of answer recurs. Each distractor gets exactly one move
  // wrong: the last move, the order, the strength (abandons for revises), or
  // whose view a move expresses. Choices paraphrase the text independently,
  // so the key is never one half of a look-alike pair.
  const TSP_ACADEMIC_STRUCTURE_TOPICS = [
    {
      "scene": "cs-orlen-wool-guild",
      "passage": "The Orlen guild's accounts record a switch from imported wool to inland cloth whenever war closed sea routes. A historian cites this flexibility against the view that war simply destroyed commerce. Her critic notes that poorer traders could not finance the switch. That objection limits the guild's representativeness, but the critic also calls its records worthless for assessing wartime adaptation. Even an exceptional survivor can establish that adaptation occurred; what its books cannot establish is how typical that response was. Neither the historian's broad optimism nor the critic's dismissal follows from the guild's exceptional wealth.",
      "key": "It concedes a historical source's limited reach while defending its narrower value against a critic's wholesale dismissal.",
      "wrong": [
        [
          "It introduces an inference from a source, undermines the source's accuracy, and preserves the inference through independent evidence.",
          "Wealth limits representativeness, not accuracy; no independent evidence restores the inference."
        ],
        [
          "It contrasts two accounts of wartime trade and reconciles them by assigning each to a different period.",
          "The distinction concerns typicality versus existence within the same period, not successive periods."
        ],
        [
          "It accepts an objection to a source and extends that objection to reject any conclusion about adaptation.",
          "The author preserves the narrower conclusion that adaptation occurred."
        ]
      ],
      "why": "The guild supports an existence claim, while its unusual resources limit a claim about typical trade. The author grants that limit but rejects the critic's stronger dismissal of the source."
    },
    {
      "scene": "cs-iversby-letters",
      "passage": "Neither public events nor changing handwriting help date Maren Iversby's letters. A cataloger instead matches their watermarks to a stationer's dated paper orders. Her reviewer objects that old paper can remain unused, an objection often taken to discredit the proposed chronology. Iversby's household accounts, however, record exhausting each purchase before ordering the next. Those accounts do not date individual letters directly; they connect the watermarks to bounded periods of use. The cataloger's three-year ranges may therefore be defensible, although replacing them with exact years would claim more than this reply to the reviewer establishes.",
      "key": "It presents a dating proposal, answers an objection by connecting two sources, and distinguishes the proposal's warranted precision from a stronger claim.",
      "wrong": [
        [
          "It abandons unsuccessful dating methods, accepts a criticism of their replacement, and introduces a source that dates the letters independently.",
          "The household accounts support the watermark method; they neither replace it nor date letters independently."
        ],
        [
          "It presents an uncertain chronology, verifies its exact dates against another source, and attributes earlier errors to unused paper.",
          "Only bounded ranges are defended, and unused paper is a proposed concern, not an established source of error."
        ],
        [
          "It compares two rival chronologies, identifies an assumption they share, and leaves unresolved which one is more precise.",
          "There is one proposed chronology and a reply to an objection, not two rival chronologies."
        ]
      ],
      "why": "The household records answer the storage objection by bounding when each paper supply was used. They defend approximate watermark dates without establishing exact dates."
    },
    {
      "scene": "cs-tarric-word-order",
      "passage": "Tarric began losing verb endings before its speakers traded widely with Ossic speakers, whose sentences normally placed subjects first. A linguist takes that chronology to exclude Ossic influence on Tarric's later shift to subject-first order. Yet communities with equal losses of endings adopted that order decades earlier where trade was frequent. The chronology tells against borrowing as the cause of the lost endings, a claim the contact account need not make. Endings could disappear for internal reasons while contact supplied a response to the resulting ambiguity. The regional comparison bears on that response, not on the initial loss.",
      "key": "It narrows a chronological objection, then uses a comparison to preserve a role for the disputed factor.",
      "wrong": [
        [
          "It challenges an earlier chronology, replaces it with a regional comparison, and attributes both linguistic changes to contact.",
          "The chronology is accepted; contact is preserved for the word-order response, not both changes."
        ],
        [
          "It contrasts two explanations of the same change and treats their independent support as evidence that either is sufficient.",
          "Internal loss and contact explain different linked parts of the process, not independently sufficient alternatives."
        ],
        [
          "It accepts evidence against borrowing and uses regional differences to explain why that evidence applies only to isolated communities.",
          "The chronology is not restricted to isolated communities; its relevance is restricted to the loss of endings."
        ]
      ],
      "why": "The author separates what caused endings to disappear from what supplied a new word order. The chronology challenges only the former contact claim, while regional timing supports the latter."
    },
    {
      "scene": "cs-kelder-nest-edges",
      "passage": "Nest surveys in Kelder found more failures in small woods than in large ones. Camera records linked most failures to predators that stayed near forest edges, prompting one ecologist to call patch size irrelevant. Her colleague notes that nearly all of a small patch lies near an edge. The cameras thus challenge an intrinsic disadvantage of small woods, without removing the observed size relationship. A proposed corridor could connect two patches yet add mostly exposed edges; judging it by connected area alone would repeat, in a favorable direction, the simplification that the camera evidence first unsettled.",
      "key": "It reinterprets an association, limits an inference from that revision, and applies the distinction to a plan.",
      "wrong": [
        [
          "It replaces an unreliable survey with direct observations and uses them to recommend increasing connected forest area.",
          "The surveys remain reliable, and connected area alone is explicitly an inadequate basis for recommendation."
        ],
        [
          "It confirms an intrinsic size effect, introduces an additional cause of failure, and compares remedies for the two causes.",
          "Edges reinterpret the size effect rather than add an independent intrinsic-size cause."
        ],
        [
          "It accepts that size has no relation to failure and explains why a proposed intervention could nevertheless preserve that relation.",
          "The author rejects the claim that size is irrelevant; the intervention illustrates why edge geometry matters."
        ]
      ],
      "why": "Predation explains, rather than erases, the size association. The corridor example applies that causal distinction: connectivity without reduced edge exposure need not improve nesting conditions."
    },
    {
      "scene": "cs-gettier-knowledge",
      "passage": "A stopped clock can accidentally show the correct time when consulted, yielding a justified true belief that many philosophers would hesitate to call knowledge. A critic invokes such cases to say that justification has no place in an account of knowledge. That conclusion exceeds what the cases establish. They show that truth, belief, and justification together are insufficient, not that justification is unnecessary. A proposed condition excluding luck might repair the analysis while retaining its original requirements. Whether such a condition can be stated satisfactorily remains disputed; that dispute does not rescue the critic's inference.",
      "key": "It uses a lucky belief to expose an incomplete analysis, rejects an excessive objection, and considers a possible amendment.",
      "wrong": [
        [
          "It presents a counterexample to a requirement, replaces that requirement with another, and defends the replacement against a critic.",
          "The original requirement is retained as potentially necessary; the new condition would supplement it."
        ],
        [
          "It introduces a disputed definition, gives a case supporting it, and treats disagreement about a revision as evidence for the original.",
          "The case challenges sufficiency, and disagreement does not restore the original definition."
        ],
        [
          "It concedes a critic's objection to justification but rejects the critic's proposed solution because it permits luck.",
          "The author rejects the critic's inference, and the critic offers no repair in the passage."
        ]
      ],
      "why": "The stopped clock challenges the sufficiency of three conditions, not the necessity of each. The possible anti-luck addition respects that distinction, even though its formulation is unresolved."
    },
    {
      "scene": "cs-faint-young-sun",
      "passage": "A dimmer young Sun and geological evidence of ancient liquid water create a puzzle for climate models. One proposed answer invokes high atmospheric carbon dioxide. Soil evidence has been used to limit how much carbon dioxide was present; a commentator treats that limit as a reason to discard a stronger greenhouse effect altogether. Researchers exploring methane accept the soil constraint but do not accept the commentator's conclusion. Their proposal need not dispute the evidence that weakens the carbon-dioxide-only account, since the constraint concerns one warming agent. Whether methane supplied enough warmth remains a separate quantitative question.",
      "key": "It distinguishes a limit on one solution from rejection of its broader approach, preserving an untested alternative.",
      "wrong": [
        [
          "It presents a climatic puzzle, disputes evidence against a proposed solution, and replaces that evidence with an untested calculation.",
          "The soil evidence is accepted; no new calculation replaces it."
        ],
        [
          "It contrasts two solutions, rejects their shared premise, and identifies a question that must be answered before either can be considered.",
          "The shared greenhouse premise is retained, while the methane version needs quantitative evaluation."
        ],
        [
          "It explains why one solution fails and treats the failure as sufficient evidence that its alternative is correct.",
          "Methane remains to be evaluated; the passage expressly denies automatic confirmation."
        ]
      ],
      "why": "The author separates a constraint on carbon dioxide from rejection of all greenhouse warming. Methane preserves the broader approach without being established merely by the first version's weakness."
    },
    {
      "scene": "cs-vane-weir-poem",
      "passage": "Tobias Vane's poem closes with water motionless behind a weir. Readers who find only paralysis in that image seldom discuss the speaker's earlier admiration for builders storing water against drought. A new reading calls the stillness a reserve of feeling for future hardship. One reviewer embraces that reading as proof that grief is absent from the poem. Yet stored feeling can be grief; the earlier stanzas challenge its supposed incapacity to serve the future, not its presence. The revised reading therefore changes what the closing stillness does without necessarily changing what emotion it contains.",
      "key": "It uses overlooked stanzas to reinterpret stillness, then separates that revision from a reviewer's exclusion of grief.",
      "wrong": [
        [
          "It replaces an established interpretation with a rival and then rejects the rival because the poem still concerns grief.",
          "Grief remains compatible with the revised function of stillness, so the rival reading is retained."
        ],
        [
          "It compares readings based on different images and reconciles them by assigning each emotion to a separate stanza.",
          "The reinterpretation concerns the same closing image; emotions are not allocated to different stanzas."
        ],
        [
          "It accepts a reviewer's account of the poem's emotion while disputing the earlier passage offered in its support.",
          "The author accepts the relevance of the earlier passage but rejects the reviewer's exclusion of grief."
        ]
      ],
      "why": "The stored-water context changes the meaning of immobility from useless paralysis to provision. That functional change does not imply that the stored emotion cannot be grief."
    },
    {
      "scene": "cs-price-exceptions",
      "passage": "A price increase may lead a very poor household to buy more of a cheap staple: less money remains for costlier food. A status-conscious buyer may also buy more of a luxury item after its price rises. A commentator treats these patterns as one exception with one explanation, since both reverse the usual price–quantity relationship. But the first involves a tighter budget, whereas the second involves what the price communicates. Grouping them by their visible outcome is useful for describing departures from the usual pattern; using that grouping to predict their response to a change in income would require a further argument.",
      "key": "It identifies a shared departure from a pattern, distinguishes the mechanisms producing it, and limits an inference based on grouping the cases together.",
      "wrong": [
        [
          "It presents two apparent exceptions, supplies a common underlying cause, and questions whether either truly departs from the pattern.",
          "The mechanisms differ, and the observed departures are accepted."
        ],
        [
          "It contrasts two explanations of one buying pattern and uses a predicted income effect to decide between them.",
          "There are two cases with distinct mechanisms; no income-effect test is reported."
        ],
        [
          "It rejects a classification because its members have different causes and proposes regrouping them by income alone.",
          "The classification remains useful descriptively, and no new grouping is proposed."
        ]
      ],
      "why": "A common outcome permits a descriptive category without establishing a common mechanism. The author limits predictions from that category rather than denying its descriptive usefulness."
    },
    {
      "scene": "cs-semmelweis-clinics",
      "passage": "Semmelweis's handwashing intervention reduced deaths in a Vienna maternity clinic, yet his account of contaminating matter met resistance. A history of medicine uses the episode to distinguish an effective procedure from an accepted explanation. Its reviewer calls this distinction an admission that the procedure supplied no evidence for the explanation. But reducing deaths after removing a suspected source can support a causal account without identifying every step of the mechanism. The history's point concerns what persuaded contemporaries, not what the intervention could establish. Calling an explanation unaccepted is not itself an assessment of its evidentiary support.",
      "key": "It introduces a historical distinction, rebuts a reviewer's interpretation, and separates an explanation's reception from its evidentiary support.",
      "wrong": [
        [
          "It introduces a historical success, denies that the intervention tested an explanation, and locates its value solely in improved practice.",
          "The author says the intervention could support a causal account despite incomplete mechanism."
        ],
        [
          "It contrasts two accounts of an intervention and favors the one whose explanation contemporaries eventually accepted.",
          "Later acceptance is not reported or used as a criterion."
        ],
        [
          "It accepts a reviewer's assessment of weak evidence and explains why contemporaries nevertheless endorsed the procedure.",
          "The reviewer is challenged, and resistance rather than endorsement is reported."
        ]
      ],
      "why": "The reviewer converts a claim about historical reception into a denial of evidentiary value. The author rejects that conversion while preserving the history's distinction between efficacy and acceptance."
    },
    {
      "scene": "cs-vell-glassworks",
      "passage": "Rosa Adler traces Vell's glass industry to unusually pure local sand. A critic cites workshops multiplying after the deposits were exhausted as a refutation. Adler replies that the initial workshops trained workers and attracted suppliers, advantages that persisted while sand arrived by rail. The reply preserves a role for the deposits without claiming that imported sand was inferior. It also changes the explanatory task: later growth depends on consequences of the original location, not on the continued availability of the resource that first favored it. The critic's observation rules out persistence of that resource, not persistence of its effects.",
      "key": "It presents a causal account and an objection, then shows how an indirect effect preserves a narrower version of the account.",
      "wrong": [
        [
          "It presents a location theory, accepts evidence refuting it, and replaces natural resources with skilled labor as the cause of the industry's arrival.",
          "Skilled labor follows the initial workshops; it does not replace sand as the cause of arrival."
        ],
        [
          "It presents an objection to a causal account and dismisses it by showing that the original resource remained available locally.",
          "The local deposits were exhausted; their downstream effects remained."
        ],
        [
          "It reconciles rival accounts by arguing that the same immediate cause explains both an industry's arrival and its later growth.",
          "The immediate cause changes from sand availability to accumulated labor and suppliers."
        ]
      ],
      "why": "The response preserves sand's initiating role while shifting the explanation of persistence to its lasting consequences. It neither denies exhaustion nor treats sand as the continuing immediate cause."
    },
    {
      "scene": "cs-atlantic-cable-1858",
      "passage": "The 1858 Atlantic telegraph cable transmitted messages before failing; high voltages probably aggravated flaws in its insulation. The successful 1866 cable used lower voltages and a more sensitive receiver. A commentator describes this as proof that distance had never posed a genuine engineering problem. That reading mistakes the solution's success for the problem's absence. The later system addressed faint signals by improving detection rather than intensifying transmission. Its contrast with the earlier method explains how the difficulty was managed, without showing that the failed engineers had invented the difficulty they faced.",
      "key": "It contrasts two methods and corrects an inference from success by explaining how a persistent difficulty was managed.",
      "wrong": [
        [
          "It contrasts two outcomes, attributes them to the disappearance of an earlier physical obstacle, and corrects an account of who removed it.",
          "The obstacle did not disappear; the receiver and signaling approach managed it differently."
        ],
        [
          "It explains an early failure, presents a later success as evidence that the first diagnosis was wrong, and proposes a new diagnosis.",
          "The high-voltage diagnosis is retained rather than replaced."
        ],
        [
          "It presents a disagreement about a technical obstacle and resolves it by showing that the two systems faced different transmission distances.",
          "The passage describes different methods for the same long-distance problem, not different distances."
        ]
      ],
      "why": "The successful method makes the difficulty manageable; it does not retrospectively erase it. The author uses the method contrast to reject the commentator's inference from success to absence of a problem."
    },
    {
      "scene": "cs-saint-aldo-tower",
      "passage": "Engineers blamed Saint Aldo's lean on uneven clay beneath its foundations. A survey confirmed the unevenness but found that further tilting stopped after a neighboring stream was diverted. One engineer treats that timing as grounds to replace the clay explanation with a water explanation. Yet the stream had kept the clay wet, and its diversion did not remove the uneven layer. The added evidence bears on why movement continued and then slowed; it need not overturn the account of why the tower initially leaned. What looks like a rival cause may instead specify when the original vulnerability produces further movement.",
      "key": "It supports an account, considers an apparent challenge, and recasts that challenge as a condition on the original cause.",
      "wrong": [
        [
          "It confirms an old explanation and uses a later intervention to show that the original cause has been eliminated.",
          "The uneven clay remains after diversion; only its exposure to water changes."
        ],
        [
          "It contrasts explanations of the initial lean and resolves their conflict by concluding that neither addresses later motion.",
          "Clay explains the initial vulnerability; water helps explain later motion."
        ],
        [
          "It rejects the inference drawn from an intervention and therefore dismisses the intervention's timing as irrelevant.",
          "The timing remains relevant to continued movement, though it does not displace the clay account."
        ]
      ],
      "why": "Stream diversion can explain a change in movement by changing the clay's condition. The passage preserves clay as an underlying vulnerability while rejecting the assumption that water must be its rival."
    },
    {
      "scene": "cs-tarn-dialect-towns",
      "passage": "Older villagers have abandoned several features of Tarn speech, a finding often cited as evidence that the dialect is vanishing. Hana Oyelaran recorded those features among younger town speakers. A reviewer calls her evidence proof that traditional village surveys are inaccurate. Oyelaran accepts their transcriptions: her objection concerns what their sampling permits scholars to conclude. Her town recordings do not show that the features have stopped declining in villages, and they do not establish that every feature survives. They make the village pattern an insufficient account of the dialect's distribution, without making that pattern unreal.",
      "key": "It introduces a finding that challenges a generalization, rejects a misdescription of the challenge, and distinguishes the original evidence from its reach.",
      "wrong": [
        [
          "It reports conflicting survey results, resolves the conflict by favoring more accurate recordings, and extends the favored result to the whole dialect.",
          "Both sets can be accurate, and the author explicitly limits broader conclusions."
        ],
        [
          "It introduces a challenge to a decline narrative, grants that the challenge disproves rural decline, and limits it to selected features.",
          "The challenge does not disprove rural decline; it limits generalization from rural samples."
        ],
        [
          "It accepts a criticism of earlier recordings and uses those flawed records to show that newer speech is unrelated to the dialect.",
          "The recordings are accepted, and the town features are part of Tarn speech."
        ]
      ],
      "why": "Urban survival challenges a broad inference from rural decline without falsifying rural observations. The reviewer confuses restricted sampling with inaccurate transcription."
    },
    {
      "scene": "cs-varek-blue-pigment",
      "passage": "Paint at Varek contains mineral grains matching a western deposit and a binder characteristic of eastern workshops. An excavator calls the findings contradictory: the paint cannot have come from both directions. A conservator distinguishes sourcing the mineral from preparing the paint and proposes west-to-east transport before shipment to Varek. This itinerary is not proved merely because it accommodates both results; another workshop could have acquired the eastern binder. But the findings cease to be mutually exclusive once origin is divided into stages. The distinction removes an objection to the itinerary without establishing it as the only one.",
      "key": "It presents an apparent conflict, resolves it by distinguishing stages, and limits what that resolution establishes about a proposed account.",
      "wrong": [
        [
          "It presents two incompatible findings, questions the reliability of one, and therefore keeps the older account provisionally.",
          "Both findings are accepted and made compatible; neither is rejected as unreliable."
        ],
        [
          "It replaces a single-origin account with a multistage route and uses agreement with the evidence to establish that route uniquely.",
          "The passage explicitly preserves an alternative involving acquired binder."
        ],
        [
          "It proposes a route, introduces a rival, and concludes that the evidence again contradicts itself because both remain possible.",
          "Multiple compatible routes do not restore the supposed contradiction between findings."
        ]
      ],
      "why": "Separating mineral source from paint preparation dissolves the excavator's contradiction. That establishes compatibility of the itinerary, not its unique truth."
    },
    {
      "scene": "cs-ostby-school-start",
      "passage": "An association between longer sleep and higher grades may reflect family circumstances affecting both. After Ostby delayed its school day, the same students slept longer and earned somewhat higher grades. An advocate calls the change definitive proof that sleep improves achievement. A critic notes that other school practices changed that year and treats the new evidence as no better than the original association. Following the same students removes some differences between families without removing every competing explanation. The intervention can therefore strengthen the causal case without meeting the advocate's standard of proof or warranting the critic's dismissal.",
      "key": "It weighs opposing assessments of new evidence, separating stronger causal support from conclusive proof.",
      "wrong": [
        [
          "It presents an association, confirms its causal interpretation through an intervention, and dismisses an objection as already controlled for.",
          "Other changes are not controlled for; the author retains uncertainty."
        ],
        [
          "It presents two studies, accepts a confounding factor in both, and concludes that their evidentiary value is equivalent.",
          "The within-student comparison controls some family differences, so the evidence is not equivalent."
        ],
        [
          "It contrasts two causal explanations and favors the one that accounts for differences among families before the intervention.",
          "The author assesses strength of evidence, not which competing cause explains the initial family differences."
        ]
      ],
      "why": "The repeated-student comparison reduces one source of uncertainty but leaves other changes possible. The passage rejects both certainty and the claim that no evidentiary improvement occurred."
    },
    {
      "scene": "cs-kell-market-hall",
      "passage": "Kell's cast-iron market hall survived after a sports-ground proposal promised income for repairs that preservationists had sought for historical reasons. A council member now credits survival wholly to commercial usefulness and calls the earlier preservation campaign irrelevant. Yet that campaign had secured a delay in demolition, during which the reuse plan was developed. Historical importance did not persuade the council to fund repairs; this does not mean arguments about that importance contributed nothing to the outcome. The practical plan explains the final authorization, while the campaign helps explain why an intact building remained available when the council made that decision.",
      "key": "It questions an exclusive account of an outcome by distinguishing the reason for a final decision from an earlier enabling contribution.",
      "wrong": [
        [
          "It contrasts historical and practical arguments and concludes that the historical argument ultimately supplied the funds the practical one could not.",
          "Reuse promised repair income; the campaign supplied time, not funding."
        ],
        [
          "It accepts an exclusive practical explanation but redescribes preservationists as the original authors of the successful reuse plan.",
          "The exclusive explanation is rejected, and the campaign is not credited with authorship of the plan."
        ],
        [
          "It challenges the council's account by showing that historical importance was its stated reason for authorizing repairs.",
          "Historical arguments did not secure repair authorization; they helped delay demolition."
        ]
      ],
      "why": "A reason insufficient for the final funding decision can still causally enable that decision. The campaign's delay and the plan's income make different contributions to survival."
    },
    {
      "scene": "cs-reef-spawning-cues",
      "passage": "Corals exposed to artificial moonlight kept a common spawning schedule; those kept in darkness did not. A researcher infers that moonlight alone coordinates spawning. A second experiment held water temperature constant, and even moonlit colonies lost synchrony. A critic takes that result to erase the first experiment's evidence for a lunar role. Yet the first comparison isolated moonlight against a background of seasonal temperatures; the second changed that background. One cue can matter without being sufficient by itself. The new result limits the researcher's claim while leaving the first experiment's narrower contribution intact.",
      "key": "It uses two comparisons to establish a limited role, rejecting both a stronger inference and a sweeping dismissal.",
      "wrong": [
        [
          "It reports an experiment, replaces its unreliable result with a better controlled one, and favors temperature over moonlight as the sole cue.",
          "The first result remains reliable, and neither cue is endorsed as sufficient alone."
        ],
        [
          "It compares two experiments, attributes their disagreement to measurement error, and calls for a repetition before drawing conclusions.",
          "Different background conditions, not measurement error, account for the results; a limited conclusion is drawn."
        ],
        [
          "It supports a lunar explanation, adds temperature as independent confirmation, and rejects a criticism of the original sufficiency claim.",
          "The temperature result limits, rather than confirms, the claim that moonlight alone is sufficient."
        ]
      ],
      "why": "The comparisons address contribution under seasonal conditions and sufficiency without seasonal change. The author preserves the first result's narrower implication while rejecting both the overclaim and its wholesale dismissal."
    },
  ];

  const tspAcademicStructure = {
    id: "tsp-academic-structure",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "author's purpose",
    difficulty: "Hard",
    title: "Overall structure of dense academic prose",
    recognize:
      "Name each move of the text in order and whose view it expresses; the right description matches every move, and each wrong one misstates exactly one move, its order, or its strength.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "extreme-language", "misattributed-view"],
    build(t) {
      const topic = t.pick(TSP_ACADEMIC_STRUCTURE_TOPICS);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.passage },
        stem: "Which choice best describes the overall structure of the text?",
        correct: topic.key,
        wrong: topic.wrong,
        explanation: topic.why,
        steps: [
          "Mark each move of the text, in order, and note whose view each move expresses.",
          "Check every choice move by move against the text.",
          "Reject a choice if any one move is wrong in content, order, or strength.",
        ],
        principles: [
          "A structure choice is right only if every move, in order, matches the text.",
          "Distinguish the view an author reports from the view the author holds, and a revision from an abandonment.",
        ],
        trap: "Accepting a choice whose first moves match the text without checking its last move, or one that turns the author’s own view into someone else’s.",
        hint: "Summarize each sentence in a few words; which choice gets every move, including the last, right?",
        estimatedSeconds: 100,
        verify: () =>
          topic.wrong.length === 3 &&
          new Set([topic.key, ...topic.wrong.map(([text]) => text)]).size === 4 &&
          [topic.key, ...topic.wrong.map(([text]) => text)].every((choice) => choice.length <= 160),
      };
    },
  };

  /* ----------------- 11. function of a line or sentence in poems and stories */

  // Medium. Original poems and short-story passages, never excerpts of real
  // works, each headed honestly. The quoted line or sentence does a literary
  // job that only the rest of the text reveals: it states a belief the
  // ending overturns, a reading another character corrects, a detail that
  // prepares a later moment, or a repetition that stresses a long wait.
  // Distractors read the line at face value (the turn ignored), describe a
  // neighboring line's job, or supply a motive or event the text lacks.
  const TSP_POEM_HEADER = "The following text is from an original poem.";
  const TSP_STORY_HEADER = "The following text is from an original short story.";
  const TSP_LITERARY_FUNCTION_TOPICS = [
    {
      scene: "cs-litfn-mended-nets",
      header: TSP_POEM_HEADER,
      kind: "line",
      passage:
        "My father mended nets on winter nights,\nhis fingers finding every broken knot\nthe way a reader finds a missing word.\nI sat and watched and never learned the trick.\nNow, when the lamp is low and the house is still,\nI catch myself with nothing in my hands\nstill tying knots, still pulling each one tight,\nas if the net had waited all these years\nfor me to notice I had learned it after all.",
      quoted: "I sat and watched and never learned the trick.",
      key: "It records a belief that the poem’s closing lines reverse.",
      wrong: [
        ["It confirms that the speaker never acquired any of the father’s skill with nets.", "This takes the line at face value; the closing lines show that the speaker did learn, “after all.”"],
        ["It explains how the father was able to find every broken knot in the dark.", "The father’s skill is described in the lines before; the quoted line turns to the speaker."],
        ["It marks the night on which the speaker first began to mend the nets alone.", "The speaker only watches in the quoted line; the knot-tying comes years later and without any net."],
      ],
      why: "The speaker says in the quoted line that the trick was never learned, but the last lines show the speaker’s hands tying knots unprompted, the learning noticed only now. The line sets up a belief that the ending reverses.",
    },
    {
      scene: "cs-litfn-ferry-bridge",
      header: TSP_POEM_HEADER,
      kind: "line",
      passage:
        "The bridge they said would take ten years to build\nrose slowly past my window on the ferry.\nTwo towers first. Then cables. Then a gap\nthe fog closed every morning as we docked.\nI stopped expecting it to meet itself.\nThis spring the gap was gone. I watched a gull\nwalk the whole span from one shore to the other,\nas if it had been told that what is half-made\ncan still, some ordinary morning, arrive.",
      quoted: "I stopped expecting it to meet itself.",
      key: "It marks a lost hope that the next lines show was premature.",
      wrong: [
        ["It reveals the speaker’s relief that the bridge would never be completed.", "Nothing suggests the speaker wanted the bridge left unfinished, and the next lines show it completed."],
        ["It describes the fog that hid the gap between the bridge’s two halves.", "The fog is described in the line before; the quoted line gives the speaker’s response to the long delay."],
        ["It explains why the builders needed ten years to finish the bridge.", "The poem never explains the delay; the quoted line records what the speaker came to expect."],
      ],
      why: "After years of watching an unfinished bridge, the speaker gives up expecting it to close; the next lines (“This spring the gap was gone”) show the bridge finished. The line records a lost hope that events overturn.",
    },
    {
      "scene": "cs-litfn-bread-by-feel",
      "header": "The following text is from an original poem.",
      "kind": "line",
      "passage": "Gran never wrote the bread down. “Flour,” she’d say,\n“until it feels right,” and I would ask how right,\nand she would laugh and press my palms in the dough.\nThe year she died, I made it from a book:\nfour cups, one packet, forty minutes, done.\nThe loaves came out exactly as described.\nI ate them standing up, and did not cry,\nand the next week I threw the book away\nand put my hands in flour until it felt right.",
      "quoted": "The loaves came out exactly as described.",
      "key": "It reports a flawless result that leaves the speaker unsatisfied.",
      "wrong": [
        [
          "It shows that the printed recipe works better than the grandmother’s method.",
          "The loaves match the book, but the speaker then throws the book away; the poem does not rank the recipe higher."
        ],
        [
          "It records the grandmother’s instructions for making the bread.",
          "Her instructions (“until it feels right”) come in the opening lines, not in the quoted one."
        ],
        [
          "It explains why the speaker at last decides to write the recipe down.",
          "The speaker does the reverse: the book is thrown away and the bread made by feel."
        ]
      ],
      "why": "The book’s bread comes out exactly right, yet the speaker eats it without feeling and then abandons the book for the grandmother’s method. The flawless result is what the speaker turns away from."
    },
    {
      scene: "cs-litfn-carrow-light",
      header: TSP_POEM_HEADER,
      kind: "line",
      passage:
        "My mother kept the light at Carrow Point.\nShe climbed the stairs at dusk for thirty years,\nand every ship that passed went on its way\nnot knowing who had wound the lamp for it.\nI used to think that was the saddest part.\nNow I sit up with sick friends through the night,\nor leave a porch light burning for the late,\nand no one ever knows whose hand it was,\nand I have come to think that was the point.",
      quoted: "I used to think that was the saddest part.",
      key: "It states an earlier view of the mother’s work that the speaker’s later acts revise.",
      wrong: [
        ["It expresses the speaker’s lasting grief that the mother’s work went unthanked.", "“Used to” marks the view as past, and the last line says the speaker now sees the namelessness as “the point.”"],
        ["It describes the ships that passed Carrow Point without knowing who kept the light.", "The ships are described in the lines before; the quoted line gives the speaker’s reaction to them."],
        ["It explains why the speaker decided not to become a lighthouse keeper.", "The poem never says what work the speaker chose; it describes small, unseen kindnesses."],
      ],
      why: "The quoted line gives the speaker’s old view that going unknown was sad; the lines after it describe the speaker’s own unseen kindnesses and end “that was the point,” revising the view.",
    },
    {
      scene: "cs-litfn-walked-path",
      header: TSP_POEM_HEADER,
      kind: "line",
      passage:
        "All morning the snow erased the path.\nMy brother shoveled it at six, and again at nine.\nBy noon he gave it up, and I was glad.\nI thought he’d come inside and warm his hands.\nHe took his boots instead and walked it slowly,\npressing each step down from door to gate,\nso that the mailman and the neighbor’s girl\nand anyone who came would find a trail\nalready made, and follow where he’d been.",
      quoted: "By noon he gave it up, and I was glad.",
      key: "It gives a misreading of the brother’s choice that the next lines correct.",
      wrong: [
        ["It shows that the brother had finally stopped trying to keep the path open.", "He stops shoveling, but the next lines show him walking the path so others can follow; he never stops keeping it open."],
        ["It describes the snow that kept erasing the path through the morning.", "The snow is described in the opening line; the quoted line turns to what the brother did and how the speaker felt."],
        ["It explains how the neighbor’s girl was able to find her way to the gate.", "That is the purpose of the brother’s walking, given in the last lines, not of the quoted one."],
      ],
      why: "The speaker thinks the brother has quit and is glad he will rest; instead he walks the path to press a trail for others. The quoted line records the speaker’s misreading that the poem then corrects.",
    },
    {
      "scene": "cs-litfn-attic-violin",
      "header": "The following text is from an original poem.",
      "kind": "line",
      "passage": "In the attic, in a case with broken clasps,\nmy great-aunt’s violin, its strings gone slack.\nNo one in the family plays. We almost sold it.\nBut when I lifted it, the hollow body hummed,\njust once, as if a floorboard’s creak had reached it,\nand in that hum was every room it filled.\nWe put it back. We fixed the clasps. We kept it.",
      "quoted": "No one in the family plays. We almost sold it.",
      "key": "It presents a contemplated sale that the hum in the next lines leads the family to abandon.",
      "wrong": [
        [
          "It shows that the family valued the violin only for the price it would bring.",
          "They considered selling it because no one plays, and the ending shows them keeping it; the poem does not reduce their view to its price."
        ],
        [
          "It describes the moment when the violin’s hollow body began to hum.",
          "The hum comes in the next lines, after the speaker lifts the violin."
        ],
        [
          "It explains why the violin’s strings had been allowed to go slack.",
          "The slack strings are simply described; the quoted line concerns what the family meant to do with the violin."
        ]
      ],
      "why": "The family considers selling the unused violin; its hum evokes the rooms it once filled, and the family repairs and keeps it. The quoted line establishes the possibility that this experience changes."
    },
    {
      scene: "cs-litfn-station-clock",
      header: TSP_STORY_HEADER,
      kind: "sentence",
      passage:
        "Every evening at six, Mr. Oduya wound the clock in the waiting room of Kessa station, though no train had stopped there in eleven years. Long ago the railway company had sent him a letter saying that his post was abolished. He had read it twice and put it in a drawer. The children who cut across the platform on their way home sometimes stopped to watch him climb the ladder, and one of them, a girl with a torn satchel, had begun to arrive at six exactly, as if the clock kept time for her.",
      quoted: "He had read it twice and put it in a drawer.",
      key: "It implies, without saying so, that Mr. Oduya chose to ignore the letter.",
      wrong: [
        ["It shows that Mr. Oduya did not understand what the railway company’s letter said.", "He read it twice; the text suggests he understood it and set it aside, since he goes on winding the clock."],
        ["It explains why no train had stopped at Kessa station for eleven years.", "The text never explains why the trains stopped; the quoted sentence concerns Mr. Oduya’s response to the letter."],
        ["It introduces the girl who begins arriving at the station at six o’clock.", "The girl appears in the final sentence; the quoted sentence is about the letter."],
      ],
      why: "The letter ended his post, yet he read it, put it away, and still winds the clock every evening. The quiet gesture of the drawer implies a decision to ignore the letter rather than stating it.",
    },
    {
      scene: "cs-litfn-borrowed-coat",
      header: TSP_STORY_HEADER,
      kind: "sentence",
      passage:
        "The coat had been her brother’s, and it was too long in the sleeves, so Ines rolled the cuffs twice before she left for the interview. On the tram she kept her hands in the pockets. In the left one she found the stub of a concert ticket from the winter before he left for the coast, and she held it the whole way, turning its soft corners with her thumb. When the director asked why she wanted the post, she heard herself answer in her brother’s steady voice, the one he had used to calm their mother, and she was not afraid.",
      quoted: "In the left one she found the stub of a concert ticket from the winter before he left for the coast, and she held it the whole way, turning its soft corners with her thumb.",
      key: "It shows Ines taking comfort from her brother, preparing for her calm in the interview.",
      wrong: [
        ["It reveals that Ines resents having to wear her brother’s coat to the interview.", "Nothing shows resentment; she holds the stub all the way, and she later speaks in his voice without fear."],
        ["It explains why the sleeves of the coat were too long for Ines.", "The sleeves are mentioned in the first sentence; the quoted sentence concerns what she finds in the pocket."],
        ["It suggests that Ines regrets not going to the concert with her brother.", "The text gives no sign of regret; the stub steadies her rather than troubling her."],
      ],
      why: "Holding her brother’s ticket stub steadies Ines on the way to the interview, and in the interview she speaks in his steady voice without fear. The sentence prepares that moment.",
    },
    {
      scene: "cs-litfn-asker-road",
      header: TSP_STORY_HEADER,
      kind: "sentence",
      passage:
        "When the new road opened, the village of Asker was for the first time two hours from the city instead of a day. The young people went first, then the schoolteacher, then the baker’s son, who had been expected to take over the ovens. Old Katrin, who had argued for the road at every council meeting for thirty years, watched the buses leave the square each morning from her window. She had wanted the road so that the village could reach the world. She had not thought to ask what the world would take from it in return.",
      quoted: "She had wanted the road so that the village could reach the world.",
      key: "It recalls Katrin’s hope for the road, which the last sentence answers.",
      wrong: [
        ["It shows that Katrin now regrets ever having argued for the road.", "The quoted sentence states her hope, and even the last sentence says only that she had not foreseen a cost; neither says she regrets it."],
        ["It explains why the young people were the first to leave the village.", "The text never says why the young left first; the quoted sentence concerns Katrin’s reason for wanting the road."],
        ["It describes the buses that leave the village square each morning.", "The buses are described in the sentence before; the quoted sentence turns to Katrin’s thoughts."],
      ],
      why: "The quoted sentence gives Katrin’s hope that the road would connect Asker to the world; the final sentence answers it with what she had not foreseen, the world taking the village’s people.",
    },
    {
      scene: "cs-litfn-nocturne",
      header: TSP_STORY_HEADER,
      kind: "sentence",
      passage:
        "For two years Tomas practiced the nocturne every afternoon, and for two years Madame Lasky stopped him at the same bar and said, “Again, but listen this time.” He played it louder. He played it slower. He played it with his eyes shut, which only made him miss the notes. On the last day of term he was tired, and his mind was on the snow outside, and he let the bar go by without thinking about it at all. Madame Lasky said nothing, and when he looked up, she was smiling at the window.",
      quoted: "He played it louder.",
      key: "It begins a list of efforts that the ending shows were beside the point.",
      wrong: [
        ["It shows that Madame Lasky wanted the passage played more forcefully.", "She asks him to listen, not to play louder; louder is only his guess, and it does not satisfy her."],
        ["It marks the moment when Tomas finally plays the bar as his teacher wished.", "That happens on the last day of term, when he stops trying; the quoted sentence is one of his failed attempts."],
        ["It suggests that Tomas had misread the notes printed in the score.", "Nothing indicates a misreading of the score; the problem, the ending suggests, was trying too hard."],
      ],
      why: "“He played it louder” is the first of several deliberate attempts that fail; Tomas succeeds only when he stops trying, so the list shows effort that missed what his teacher meant.",
    },
    {
      scene: "cs-litfn-strait-captain",
      header: TSP_STORY_HEADER,
      kind: "sentence",
      passage:
        "Captain Brandt had crossed the strait eleven thousand times, and he liked to say he could do it asleep. The passengers laughed when he said it. The deckhands did not, because they had seen him on foggy nights, standing at the wheelhouse window long after his shift, listening for the bell buoy off Kell Point as if it might tell him something new. Familiarity, they understood, had not made him careless. It had taught him exactly how the water could change.",
      quoted: "The passengers laughed when he said it.",
      key: "It gives a reaction that the deckhands’ view, described next, shows to be shallow.",
      wrong: [
        ["It suggests that the passengers doubted Brandt’s skill as a captain.", "They laugh at a joke; nothing suggests doubt, and the passage is about what the laughter misses, not about suspicion."],
        ["It explains why the deckhands admired Brandt’s long experience.", "The deckhands’ view comes in the following sentences; the quoted sentence gives the passengers’ response."],
        ["It shows that Brandt told the story mainly to calm nervous passengers.", "The text gives no reason for the boast; it contrasts two ways of hearing it."],
      ],
      why: "The passengers take the boast lightly; the deckhands, who have seen Brandt listening on foggy nights, know that his experience made him more careful. The sentence sets up that contrast.",
    },
    {
      scene: "cs-litfn-aunt-letters",
      header: TSP_STORY_HEADER,
      kind: "sentence",
      passage:
        "Each spring Mira’s aunt wrote to her from the coast, and each letter was the same: the peas were in, the gulls were a nuisance, the neighbor’s dog had dug up the tulips again. Mira read them quickly, the way one reads a weather report. It was only after the letters stopped, when she went to the coast to clear the cottage, that she found the garden: forty years of peas and tulips, fenced against dogs, the gulls’ favorite post still standing, every one of those ordinary sentences made visible.",
      quoted: "Mira read them quickly, the way one reads a weather report.",
      key: "It shows a casual view of the letters that the final discovery transforms.",
      wrong: [
        ["It suggests that Mira found her aunt’s letters too long to read with care.", "The letters are short and repetitive; she reads them quickly because they seem routine, not because they are long."],
        ["It describes the subjects that the aunt’s letters covered each spring.", "Those subjects are listed in the first sentence; the quoted sentence describes how Mira read them."],
        ["It explains why Mira’s aunt eventually stopped writing to her.", "The text never gives a reason; the letters stop, and the garden reveals what they had meant."],
      ],
      why: "Mira skims the letters as routine news; in the garden she sees forty years of the life those plain sentences recorded. The sentence gives the view that the final discovery changes.",
    },
    {
      scene: "cs-litfn-surveyor-margin",
      header: TSP_STORY_HEADER,
      kind: "sentence",
      passage:
        "The surveyor Anselm Roth spent nine summers mapping the Varn Hills, and his maps were admired for their accuracy: every stream was placed within a few meters of its true course. He was less proud of them than people supposed. In the margin of his own copy, beside a blank space he had labeled only “marsh,” he wrote the names of the families who had fed him there, the song their children had taught him, and the date a storm had kept him three nights in their barn.",
      quoted: "He was less proud of them than people supposed.",
      key: "It sets Roth’s own view of the maps against their public reputation.",
      wrong: [
        ["It suggests that Roth doubted the accuracy that others praised in his maps.", "Nothing suggests he doubted their accuracy; the margin notes show that what he valued lay elsewhere, in the people he met."],
        ["It explains why Roth labeled one area of his map only as a marsh.", "The label is simply reported in the next sentence; the quoted sentence says nothing about it."],
        ["It describes the admiration that other people felt for Roth’s maps.", "The admiration is described in the sentence before; the quoted sentence sets Roth’s own view against it."],
      ],
      why: "People admire the maps for accuracy, but Roth cares less for them than people think; the margin notes about the families who fed him show what he did value. The sentence introduces that contrast.",
    },
    {
      scene: "cs-litfn-glassworks-broom",
      header: TSP_STORY_HEADER,
      kind: "sentence",
      passage:
        "On her first day at the glassworks, Lena was given a broom. On her second she was given the same broom. For a month she swept the shards from under the benches and watched the blowers turn molten glass on the ends of their pipes, and she began to know, from the sound a pipe made against the rack, whether a piece had come out whole. When at last the master handed her a pipe, her hands already knew where to stand, and the glass, for once, did not seem to be in a hurry.",
      quoted: "On her second she was given the same broom.",
      key: "It stresses, by repetition, a wait that proves to be Lena’s training.",
      wrong: [
        ["It shows that the master of the glassworks doubted Lena’s ability.", "The text gives no reason for the broom; the ending shows that the sweeping taught her, not that she was doubted."],
        ["It explains how Lena learned to tell whether a piece had come out whole.", "That is explained in the following sentence, through the sound of the pipes against the rack."],
        ["It suggests that Lena was about to leave her post at the glassworks.", "Nothing suggests she meant to leave; she keeps sweeping and watching for a month."],
      ],
      why: "The repeated broom stresses how long Lena waits to work the glass, and the ending shows that the month of sweeping and watching had trained her hands and ears.",
    },
  ];

  const tspLiteraryFunction = {
    id: "tsp-literary-function",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "function of a sentence",
    difficulty: "Medium",
    title: "Function of a line or sentence in a poem or story",
    recognize:
      "In a poem or story, a line’s job often shows only later: a belief the ending overturns, a reading someone else corrects, a detail that prepares a later moment. Read to the end, then ask what the quoted line sets up; reject readings that take it at face value or describe a neighboring line.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "true-but-irrelevant", "extreme-language"],
    build(t) {
      const topic = t.pick(TSP_LITERARY_FUNCTION_TOPICS);
      const content = `${topic.header}\n\n${topic.passage}`;
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content },
        stem: `Which choice best describes the function of the ${topic.kind} “${topic.quoted}” in the text as a whole?`,
        correct: topic.key,
        wrong: topic.wrong,
        explanation: topic.why,
        steps: [
          "Read the whole text, noting where it turns: a change of view, a correction, a payoff.",
          "Locate the quoted line and ask what the text does with it afterward.",
          "Reject choices that take the line at face value, describe the line before or after it, or add a motive the text never gives.",
        ],
        principles: [
          "In literary texts a line’s function often depends on what comes after it; read to the end before deciding.",
          "A belief stated early in a poem or story may be there to be overturned.",
        ],
        trap: "Taking the quoted line at face value, as if the text endorsed it, when the ending overturns or reframes it.",
        hint: "What happens later in the text to the view or detail in the quoted line?",
        estimatedSeconds: 105,
        verify: () =>
          [TSP_POEM_HEADER, TSP_STORY_HEADER].includes(topic.header) &&
          topic.passage.includes(topic.quoted) &&
          (topic.kind === "line" ? topic.passage.split("\n").includes(topic.quoted) : !topic.passage.includes("\n")) &&
          topic.wrong.length === 3 &&
          new Set([topic.key, ...topic.wrong.map(([text]) => text)]).size === 4,
      };
    },
  };

  return [
    tspMainPurposeExplain,
    tspFunctionExample,
    tspFunctionConcession,
    tspLiteraryPurpose,
    tspLiteraryStructure,
    tspStructureViewComplication,
    tspFunctionFoil,
    tspPurposeEvaluateSource,
    tspAcademicFunction,
    tspAcademicStructure,
    tspLiteraryFunction,
  ];
});
