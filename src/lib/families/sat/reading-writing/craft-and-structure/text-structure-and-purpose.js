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
  const TSP_sharedPrefix = (a, b) => {
    let index = 0;
    while (index < a.length && a[index] === b[index]) index += 1;
    return index;
  };
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
  const TSP_EXPLAIN_TOPICS = [
    {
      scene: "cs-sea-ice-salt",
      passage:
        "When seawater begins to freeze, the growing ice crystals cannot hold salt, so most of it is pushed out into tiny pockets of concentrated brine trapped between the crystals. Over the following months, this heavy brine slowly drains downward through channels in the ice and escapes into the ocean below. As a result, ice that has survived a full year is far less salty than ice that formed only weeks earlier, and in some polar regions people have melted old sea ice for drinking water.",
      cue: "As a result",
      detail: "brine",
      key: "To explain how sea ice becomes less salty as it ages",
      argue: "To argue that old sea ice is the best source of drinking water",
      narrow: "To describe the brine pockets that form between ice crystals",
      other: "To compare the saltiness of sea ice in different polar regions",
    },
    {
      scene: "cs-goose-v-formation",
      passage:
        "Migrating geese often fly in a V formation, and the shape saves them energy. As each bird flaps, air spilling off the tips of its wings swirls upward behind it. A goose flying just behind and to the side of another can position itself in this rising air, which gives it a slight lift and lets it flap less often. Because the lead bird gets no such help, geese take turns at the front of the V, sharing the most tiring position over a long flight.",
      cue: "which gives it a slight lift",
      detail: "tips",
      key: "To explain how flying in a V formation helps geese save energy",
      argue: "To argue that geese are more cooperative than other migrating birds",
      narrow: "To describe the air that swirls upward off the tips of a goose’s wings",
      other: "To compare the flight of geese with that of birds that migrate alone",
    },
    {
      scene: "cs-sourdough-leavening",
      passage:
        "A sourdough starter is a paste of flour and water in which wild yeasts and bacteria live together. When a baker mixes some starter into fresh dough, the yeasts feed on sugars in the flour and release carbon dioxide gas. The gas collects in bubbles held in place by the dough’s stretchy gluten, and the loaf rises. Meanwhile, the bacteria produce lactic and acetic acids, which give sourdough bread its sharp, tangy flavor.",
      cue: "release carbon dioxide gas",
      detail: "gluten",
      key: "To explain how a sourdough starter makes bread rise and taste sour",
      argue: "To argue that sourdough is superior to bread made with packaged yeast",
      narrow: "To describe the stretchy gluten that traps gas bubbles in the dough",
      other: "To compare the flavors produced by different kinds of sourdough starter",
    },
    {
      scene: "cs-city-heat-night",
      passage:
        "On summer nights, the center of a large city can be several degrees warmer than the countryside around it. The difference begins during the day, when asphalt, brick, and concrete absorb far more of the sun’s energy than fields and forests do. After sunset, these materials release that stored heat slowly into the air. Tall buildings strengthen the effect by blocking much of the open sky, which would otherwise allow heat to escape upward.",
      cue: "release that stored heat",
      detail: "open sky",
      key: "To explain why city centers often stay warmer than nearby areas at night",
      argue: "To argue that cities should replace asphalt with lighter paving materials",
      narrow: "To describe how tall buildings block much of the open sky above a city",
      other: "To compare summer temperatures in cities of several different sizes",
    },
    {
      scene: "cs-ranked-ballot-count",
      passage:
        "In 2021, the city of Brenmoor began electing its mayor by ranked ballots. Voters list the candidates in order of preference rather than choosing just one. If no candidate is the first choice of more than half the voters, the candidate with the fewest first-choice votes is eliminated, and each ballot that ranked that candidate first is counted instead for the voter’s next choice. The process repeats until one candidate holds a majority.",
      cue: "The process repeats",
      detail: "2021",
      key: "To explain how Brenmoor determines the winner of a ranked-ballot election",
      argue: "To argue that ranked ballots produce fairer results than single-choice ones",
      narrow: "To describe the year, 2021, in which Brenmoor first adopted ranked ballots",
      other: "To compare the candidates who ran in Brenmoor’s first ranked-ballot election",
    },
    {
      scene: "cs-fresco-lime",
      passage:
        "In true fresco, a painter works on fresh, damp lime plaster, applying pigments mixed only with water. The pigments do not simply sit on the surface. As the plaster dries over the following days, the lime in it reacts with carbon dioxide in the air to form calcium carbonate, a hard mineral that grows around the pigment particles and locks them into the wall itself. This is why true frescoes can keep their colors for centuries.",
      cue: "This is why",
      detail: "water",
      key: "To explain how the pigments in a true fresco become part of the wall",
      argue: "To argue that fresco is the most durable of all methods of painting",
      narrow: "To describe the water that fresco painters mix with their powdered pigments",
      other: "To compare the colors of frescoes painted in different centuries",
    },
    {
      scene: "cs-paper-watermarks",
      passage:
        "Early European papermakers formed each sheet by dipping a mold, a wooden frame with a screen of fine wire, into a vat of pulp. To mark their paper, many makers bent wire into a small design, such as a bell or a hand, and sewed it onto the screen. Pulp settled more thinly over the raised wire, so the finished sheet was slightly thinner there. When the sheet was held up to light, the design appeared as a pale shape: a watermark.",
      cue: "so the finished sheet was slightly thinner",
      detail: "bell",
      key: "To explain how early papermakers produced watermarks in their paper",
      argue: "To argue that watermarks are the most reliable way to date old paper",
      narrow: "To describe the designs, such as bells and hands, used in watermarks",
      other: "To compare the paper molds used in several European countries",
    },
    {
      scene: "cs-tree-ring-dating",
      passage:
        "Each year, a tree in a temperate climate adds a ring of new wood, and the ring is wide in a wet year and narrow in a dry one. Because weather varies from year to year, trees across a region share the same sequence of wide and narrow rings. Researchers have linked such sequences from living trees, old buildings, and buried logs into a record stretching back centuries. By matching the rings of an old beam to that record, they can identify the year in which its tree was cut.",
      cue: "By matching the rings",
      detail: "dry",
      key: "To explain how tree rings can reveal when a wooden beam was cut",
      argue: "To argue that many wooden buildings are older than was once thought",
      narrow: "To describe the difference between rings formed in wet and dry years",
      other: "To compare the growth of trees in temperate and tropical climates",
    },
    {
      scene: "cs-pitcher-plant-trap",
      passage:
        "Pitcher plants grow in bogs where the soil holds few nutrients, and they make up the difference by trapping insects. Each plant forms a deep, tube-shaped leaf. Nectar on the leaf’s rim draws insects in, but the rim is slick, especially when damp, and visitors easily slip. Inside, waxy walls give them nothing to grip, and they fall into a pool of fluid at the bottom, where the plant slowly digests them and absorbs their nutrients.",
      cue: "they make up the difference",
      detail: "nectar",
      key: "To explain how pitcher plants capture and digest insects",
      argue: "To argue that pitcher plants could not survive outside of bogs",
      narrow: "To describe the nectar that collects on the rim of each pitcher",
      other: "To compare pitcher plants with other plants that eat insects",
    },
    {
      scene: "cs-violin-sound-post",
      passage:
        "Inside every violin, a small wooden dowel called the sound post stands upright between the instrument’s top and back. It is not glued; it is held in place only by the pressure of the strings pushing down through the bridge. When a string vibrates, the bridge rocks, and the sound post carries those vibrations from the thin top to the back, so the whole body of the violin resonates. Moving the post even a millimeter can noticeably change the instrument’s tone.",
      cue: "carries those vibrations",
      detail: "pressure",
      key: "To explain how the sound post helps a violin’s body resonate",
      argue: "To argue that violin makers should glue the sound post in place",
      narrow: "To describe the pressure that holds the sound post in position",
      other: "To compare the tone of violins made by different craftspeople",
    },
    {
      scene: "cs-stone-arch-keystone",
      passage:
        "A stone arch can stand for centuries without any mortar. Each stone in the curve is cut into a wedge, wider at the top than at the bottom. The weight of the stones above presses each wedge against its neighbors, so the stones squeeze together rather than slipping apart, and the force travels around the curve and down into the supports at either side. The last stone set at the top, the keystone, locks the others in place.",
      cue: "so the stones squeeze together",
      detail: "keystone",
      key: "To explain how a stone arch holds together without mortar",
      argue: "To argue that stone arches are stronger than modern steel beams",
      narrow: "To describe the keystone that is set at the very top of an arch",
      other: "To compare arches built in different centuries and regions",
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
          [topic.argue, "The text lays out how something works and takes no position; nothing in it argues for this claim."],
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
          /^To explain (how|why)\b/.test(topic.key) &&
          choices.slice(1).every((choice) => !/^To explain\b/.test(choice)),
      };
    },
  };

  /* ------------------------------------------- 2. function: specific example */

  // A general claim, then the quoted sentence: one concrete case of it.
  const TSP_EXAMPLE_TOPICS = [
    {
      scene: "cs-octopus-texture",
      claim: "Octopuses are famous for changing color, but many can also change the texture of their skin.",
      example: "One common octopus filmed off a rocky shore raised dozens of small bumps along its back until it resembled the barnacle-crusted stone beside it.",
      after: "Such shifts in texture help an octopus disappear against surfaces that color alone could not match.",
      key: "It offers a specific case of an octopus altering the texture of its skin.",
      contra: "It describes an octopus whose behavior runs counter to the claim about texture.",
      main: "It introduces the main claim about octopus skin that the text then supports.",
      cause: "It explains why octopuses are able to change the color of their skin.",
    },
    {
      scene: "cs-shade-coffee-birds",
      claim: "Coffee farms that keep native trees standing over their crops can shelter a surprising variety of birds.",
      example: "On one shade-grown farm in the hills above Sollano, surveyors counted more than 150 bird species among the coffee bushes, nearly as many as in the neighboring forest.",
      after: "Farms that clear the canopy to grow coffee in full sun typically support only a fraction of that number.",
      key: "It offers a specific case of a coffee farm sheltering many kinds of birds.",
      contra: "It describes a coffee farm where shade trees drove most bird species away.",
      main: "It introduces the main claim about coffee farms that the text then supports.",
      cause: "It explains why some farmers choose to grow their coffee in full sun instead.",
    },
    {
      scene: "cs-silent-film-pianist",
      claim: "Silent films were rarely watched in silence; most theaters hired musicians to accompany every screening.",
      example: "At the Orpheum in Castleton, the pianist Ida Marsh played beneath each film, shifting from gentle waltzes during courtship scenes to pounding chords during chases.",
      after: "For many viewers, such music shaped the mood of a film as much as the images did.",
      key: "It offers a specific case of a musician accompanying silent films.",
      contra: "It describes a theater that showed its silent films without any music.",
      main: "It introduces the main claim about silent films that the text then supports.",
      cause: "It explains why theaters eventually stopped hiring musicians for films.",
    },
    {
      scene: "cs-marsh-road-timber",
      claim: "Road builders in the ancient world adjusted their methods to the ground they had to cross.",
      example: "Where one Roman road in northern Gaul passed through marshland, its builders laid rafts of timber beneath the gravel so that the road would not sink.",
      after: "On firm, rocky ground, the same builders often set their paving stones almost directly on the bedrock.",
      key: "It offers a specific case of builders adapting a road to its terrain.",
      contra: "It describes a road whose builders ignored the ground beneath it.",
      main: "It introduces the main claim about ancient roads that the text then supports.",
      cause: "It explains why Roman roads were built with layers of gravel.",
    },
    {
      scene: "cs-bloodroot-ants",
      claim: "Some plants rely on animals to carry their seeds away from the parent plant.",
      example: "Each seed of the bloodroot, a woodland wildflower, bears a small fatty attachment that ants drag back to their nests, where they eat the attachment and discard the seed.",
      after: "The seed is left in rich, protected soil, well placed to sprout the following spring.",
      key: "It offers a specific case of a plant whose seeds are spread by animals.",
      contra: "It describes a plant that scatters its seeds with no help from animals.",
      main: "It introduces the main claim about seed dispersal that the text then supports.",
      cause: "It explains why ants prefer woodland seeds to other kinds of food.",
    },
    {
      scene: "cs-ballad-variants",
      claim: "Folk songs often change as they pass from one community to another.",
      example: "The ballad ‘Crossing at Marrow Ford’ is sung in one valley as a tale of lost love and in the next valley as a story about a flooded mill.",
      after: "Singers in each place kept the melody but reshaped the words to suit their own concerns.",
      key: "It offers a specific case of a folk song changing as it traveled.",
      contra: "It describes a folk song that stays the same wherever it is sung.",
      main: "It introduces the main claim about folk songs that the text then supports.",
      cause: "It explains why mills often flooded in the valleys where the song is sung.",
    },
    {
      scene: "cs-auto-enrollment",
      claim: "The option that people receive by default can strongly shape the choices they make.",
      example: "When the Harlow Company began enrolling new employees in its retirement plan automatically, participation rose from about half of new workers to nearly nine in ten.",
      after: "Employees could still leave the plan by filling out a single form, yet few chose to do so.",
      key: "It offers a specific case of a default option shaping people’s choices.",
      contra: "It describes a case in which a default option had little effect on choices.",
      main: "It introduces the main claim about default options that the text then supports.",
      cause: "It explains why the Harlow Company offered its employees a retirement plan.",
    },
    {
      scene: "cs-venetian-glass-secrets",
      claim: "Some European cities went to great lengths to protect the secrets of their most valuable crafts.",
      example: "Glassmakers in Venice were forbidden to leave the republic without permission, and those who left to work abroad could be declared traitors.",
      after: "Such rules kept techniques for making clear glass and colored beads within a small circle of workshops for generations.",
      key: "It offers a specific case of a city guarding the secrets of a craft.",
      contra: "It describes a city that freely shared its craft techniques with others.",
      main: "It introduces the main claim about craft secrets that the text then supports.",
      cause: "It explains why Venetian glass was valued more highly than other glass.",
    },
    {
      scene: "cs-hummingbird-torpor",
      claim: "Some small birds survive cold nights by letting their bodies cool far below their usual daytime temperature.",
      example: "On freezing nights high in the Andes, certain hummingbirds allow their body temperature to fall below 10°C, then warm themselves again shortly before dawn.",
      after: "By cooling down, a hummingbird can greatly reduce the energy it burns overnight.",
      key: "It offers a specific case of birds cooling their bodies on cold nights.",
      contra: "It describes birds that keep a steady body temperature through cold nights.",
      main: "It introduces the main claim about small birds that the text then supports.",
      cause: "It explains why hummingbirds need so much energy during the daytime.",
    },
    {
      scene: "cs-courtyard-house",
      claim: "Traditional houses in hot, dry regions were often designed to stay cool without machinery.",
      example: "In the town of Ardana, the Merin family’s house is built around a shaded courtyard with a shallow pool, and cool air that collects there at night flows through the rooms well into the afternoon.",
      after: "Thick earthen walls also slow the midday heat from reaching the interior.",
      key: "It offers a specific case of a house designed to stay cool without machines.",
      contra: "It describes a house whose design makes it hotter than the air outside.",
      main: "It introduces the main claim about traditional houses that the text then supports.",
      cause: "It explains why the Merin family chose to build their house in Ardana.",
    },
    {
      scene: "cs-poet-revisions",
      claim: "The poet Celia Brandt was known among her friends as a relentless reviser of her own work.",
      example: "Her short poem ‘Winter Orchard’ survives in eleven handwritten drafts, and in each one she rewrote the final line.",
      after: "Even after the poem was published, she kept marking changes in the margins of her own copy.",
      key: "It offers a specific case of Brandt revising a poem again and again.",
      contra: "It describes a poem that Brandt wrote quickly and never changed.",
      main: "It introduces the main claim about Brandt that the rest of the text supports.",
      cause: "It explains why Brandt so often chose orchards as the subject of poems.",
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
        explanation: `The first sentence makes a general claim, and the quoted sentence follows with one concrete case of it, so the sentence ${TSP_lower(topic.key).replace(/^it /, "")}`,
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
          /^It offers a specific case\b/.test(topic.key) &&
          ![topic.contra, topic.main, topic.cause].some((choice) => /specific case/.test(choice)),
      };
    },
  };

  /* ------------------------------------------------- 3. function: concession */

  // Claim, evidence, then the quoted concession, then a reassertion that
  // opens with one of TSP_REASSERT.
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
      reject: "It suggests that the attendance gains reported in the study were not real.",
      newTopic: "It introduces a discussion of city schools that the text goes on to develop.",
    },
    {
      scene: "cs-mussel-tanks",
      claim: "Restoring mussel beds could help clear the murky water of the Callow Estuary.",
      evidence: "In a recent experiment, tanks stocked with mussels held water nearly twice as clear after a week as tanks without them, because the mussels filtered out algae as they fed.",
      concession: "The experiment took place in tanks, not in the estuary itself, where tides and currents might weaken the effect.",
      reassert: "Still, the tanks were filled with water drawn directly from the estuary, so the results are a promising sign.",
      key: "It concedes that the tanks differed from the estuary in important ways.",
      support: "It provides additional evidence that mussels clear algae from water.",
      reject: "It indicates that mussels are unlikely to improve the estuary’s water.",
      newTopic: "It introduces the subject of tides, which the rest of the text explores.",
    },
    {
      scene: "cs-selby-merchant-letters",
      claim: "Letters from the port of Selby in the 1700s show that many merchants’ wives managed family businesses while their husbands were at sea.",
      evidence: "The women wrote to suppliers, set prices, and settled debts, often signing contracts in their own names.",
      concession: "To be sure, the surviving letters come almost entirely from wealthy households, which could afford to store papers for generations.",
      reassert: "Nevertheless, the letters make clear that in those households, at least, women ran businesses for months at a time.",
      key: "It acknowledges that the surviving letters may not represent all homes.",
      support: "It gives another example of the business tasks that the women carried out.",
      reject: "It suggests that women in Selby rarely took part in family businesses.",
      newTopic: "It introduces the topic of wealth in Selby, which the text then discusses.",
    },
    {
      scene: "cs-ferrand-recordings",
      claim: "The jazz pianist Odile Ferrand, critics now argue, rarely played a tune the same way twice.",
      evidence: "In the recordings that survive from her club dates in the 1950s, her chords and melodic lines differ noticeably from night to night, even on songs she performed for years.",
      concession: "Only nine of her performances were ever recorded, a tiny fraction of the hundreds she gave.",
      reassert: "But the variety within even those nine is striking enough to support the critics’ view.",
      key: "It acknowledges how small a sample of Ferrand’s playing the recordings are.",
      support: "It adds further evidence that Ferrand changed her chords from night to night.",
      reject: "It indicates that the critics’ view of Ferrand’s playing is mistaken.",
      newTopic: "It introduces the history of jazz recording, which the text then traces.",
    },
    {
      scene: "cs-bike-lane-sales",
      claim: "Protected bike lanes appear to have helped the shops on Harwick Street in the city of Castleford.",
      evidence: "In the year after the lanes opened, sales at the street’s shops rose by 18 percent, and owners reported more customers arriving by bicycle.",
      concession: "Sales also rose over the same year on nearby streets without bike lanes, though by only about 7 percent.",
      reassert: "The much larger gain on Harwick Street, however, suggests that the lanes deserve at least part of the credit.",
      reassertMarker: "however,",
      key: "It acknowledges that sales grew even on streets without new bike lanes.",
      support: "It provides more evidence that shop owners gained customers on bicycles.",
      reject: "It shows that the bike lanes had no effect on sales along Harwick Street.",
      newTopic: "It introduces a debate over street parking that the text goes on to examine.",
    },
    {
      scene: "cs-exoplanet-vapor",
      claim: "Astronomers studying the distant planet Kepra-9b report that its atmosphere contains water vapor.",
      evidence: "As the planet passed in front of its star, starlight filtering through the atmosphere was dimmed at exactly the wavelengths that water vapor absorbs.",
      concession: "Granted, the signal is faint, and no second telescope has yet confirmed it.",
      reassert: "Still, it appeared in each of four separate observations, which makes a chance result unlikely.",
      key: "It concedes that the evidence for water vapor remains weak and unconfirmed.",
      support: "It provides a second line of evidence that the planet contains water vapor.",
      reject: "It indicates that the astronomers have withdrawn their report of water vapor.",
      newTopic: "It introduces the telescope’s design, which the rest of the text describes.",
    },
    {
      scene: "cs-ruiz-translations",
      claim: "Marta Ruiz’s English versions of the poet Ilse Kovac succeed where earlier translations failed: they keep the rolling rhythm of Kovac’s lines.",
      evidence: "Read aloud, Ruiz’s translations move with the same long, rising cadence that readers of the original prize.",
      concession: "Ruiz does sometimes give up the exact meaning of a word to preserve that rhythm.",
      reassert: "Yet for poems whose music is their chief pleasure, that trade seems a sound one.",
      key: "It acknowledges a cost of the approach Ruiz takes in her translations.",
      support: "It provides further evidence that Ruiz preserves the rhythm of Kovac’s lines.",
      reject: "It suggests that Ruiz’s translations are less successful than earlier ones.",
      newTopic: "It introduces a debate about Kovac’s themes that the text then explores.",
    },
    {
      scene: "cs-late-start-sleep",
      claim: "When the Linford school district moved its high school start time from 7:30 to 8:40 a.m., students began getting more sleep.",
      evidence: "In surveys taken before and after the change, students reported sleeping about forty minutes longer on school nights.",
      concession: "Those figures come from students’ own reports, which are not always accurate.",
      reassert: "However, sleep-tracking wristbands worn by a smaller group of students recorded a similar gain.",
      key: "It acknowledges a possible weakness in the source of the sleep data.",
      support: "It provides further evidence that students slept longer after the change.",
      reject: "It indicates that students did not actually sleep longer after the change.",
      newTopic: "It introduces the subject of survey design, which the text then explores.",
    },
    {
      scene: "cs-print-shop-literacy",
      claim: "The spread of print shops through the Low Valley in the 1500s appears to have helped many more people learn to read.",
      evidence: "Over that century, the share of brides and grooms who signed their names in parish marriage registers, rather than marking an X, roughly tripled.",
      concession: "Signing one’s name, of course, is not the same as being able to read a book.",
      reassert: "Even so, the rise in signatures, which followed the arrival of the presses, is hard to explain any other way.",
      key: "It concedes that the evidence may not fully measure the ability to read.",
      support: "It offers more evidence that print shops spread through the Low Valley.",
      reject: "It suggests that fewer people in the Low Valley could read after the 1500s.",
      newTopic: "It introduces the subject of marriage customs, which the text then explores.",
    },
    {
      scene: "cs-timber-towers",
      claim: "Office towers framed in engineered timber can be built much faster than comparable concrete towers.",
      evidence: "Because their wall and floor panels are cut to size in a factory and simply bolted together on site, one eighteen-story timber tower in Oslund rose in under ten weeks.",
      concession: "The timber panels themselves cost more to produce than the equivalent concrete.",
      reassert: "But the savings in labor from such rapid construction can more than offset that higher price.",
      key: "It acknowledges a drawback of engineered timber compared with concrete.",
      support: "It provides further evidence that timber towers can be built quickly.",
      reject: "It indicates that timber towers take longer to build than concrete ones.",
      newTopic: "It introduces the subject of factory work, which the text then examines.",
    },
    {
      scene: "cs-seagrass-carbon",
      claim: "Seagrass meadows store carbon in the seafloor at a remarkable rate.",
      evidence: "In Tesh Bay, sediment cores showed that each hectare of seagrass had buried roughly twice as much carbon per year as a hectare of nearby forest.",
      concession: "The cores came from a single sheltered bay, and meadows on exposed coasts, where storms stir up sediment, may bury far less.",
      reassert: "Still, even a fraction of that rate would make seagrass an important store of carbon.",
      key: "It concedes that the bay studied may not be typical of all seagrass meadows.",
      support: "It provides more evidence that seagrass buries carbon faster than forests.",
      reject: "It indicates that seagrass meadows store little or no carbon in the seafloor.",
      newTopic: "It introduces the effects of storms on coasts, which the text then explores.",
    },
  ];

  const tspFunctionConcession = {
    id: "tsp-function-concession",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "function of a sentence",
    difficulty: "Medium",
    title: "Sentence that concedes a limitation",
    recognize:
      "Between a claim and its restatement, one sentence admits a weakness or a point on the other side; it limits the claim without abandoning it.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
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
        explanation: `The text makes a claim and supports it, then the quoted sentence admits a limitation before the final sentence reasserts the claim. So the sentence ${TSP_lower(topic.key).replace(/^it /, "")}`,
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
            Boolean(marker) && topic.reassert.includes(marker) && /^It (acknowledges|concedes)\b/.test(topic.key);
        },
      };
    },
  };

  /* ----------------------------------------------- 4. literary main purpose */

  // Original prose. `cues` are the details, in order, that establish the
  // attitude the key names.
  const TSP_LITERARY_TOPICS = [
    {
      scene: "cs-lit-grandfather-violin",
      passage:
        "Every Saturday, Nadia carried her grandfather’s violin to her lesson across town, and every Saturday she complained about it. The case was heavy and old-fashioned, its leather handle cracked, and the other students had sleek new cases that fit on their backs. This week, though, the teacher asked her to play the slow tune her grandfather had taught her. As the first notes rose, Nadia noticed the worn patch on the violin’s neck where his thumb had rested for forty years. She played more carefully than she ever had. On the walk home, she carried the case with both arms, close against her chest.",
      cues: ["complained about it", "worn patch", "close against her chest"],
      key: "To portray Nadia’s growing tenderness toward an instrument she once resented",
      narrow: "To describe the sleek cases that the other students use for their violins",
      opposite: "To portray Nadia’s increasing frustration with her grandfather’s heavy old violin",
      broad: "To suggest that young musicians should always learn on older instruments",
    },
    {
      scene: "cs-lit-lighthouse-keeper",
      passage:
        "For thirty-one years, Hollis Brand climbed the ninety steps of the Carrow Point lighthouse each evening to light the lamp. When the coast guard installed an automatic beacon, they let him keep the cottage at the tower’s base. Now, at dusk, he still finds himself reaching for his coat. He watches the beacon blink on by itself, precise and untroubled, and he tells the gulls on the railing that it has never once asked how the sea looked that day. Then he goes inside and leaves the curtains open toward the water.",
      cues: ["still finds himself reaching for his coat", "never once asked", "curtains open toward the water"],
      key: "To portray a retired keeper’s lingering attachment to his former duty",
      narrow: "To describe the automatic beacon that now lights the coast at Carrow Point",
      opposite: "To portray the keeper’s relief at no longer climbing the tower each night",
      broad: "To suggest that new machines always leave older workers feeling unhappy",
    },
    {
      scene: "cs-lit-bakery-dawn",
      passage:
        "At four each morning, before the streetlights on Alder Lane had gone out, Rosa unlocked the bakery and switched on the ovens. She liked this hour best. She knew by the sound of the mixer when the dough was ready and by the smell when the first loaves were done, and she no longer needed the timer her father had hung by the door. When the first customer arrived at six, stamping snow off his boots, the shelves were full, and Rosa, flour to her elbows, allowed herself a small, satisfied nod.",
      cues: ["She liked this hour best", "no longer needed the timer", "satisfied nod"],
      key: "To portray a baker’s quiet pride in the skill she brings to her work",
      narrow: "To describe the timer that Rosa’s father once hung beside the bakery door",
      opposite: "To portray Rosa’s weariness with the early hours that her work requires",
      broad: "To suggest that small family businesses are disappearing from cities",
    },
    {
      scene: "cs-lit-doorframe-marks",
      passage:
        "The movers had taken everything but the kitchen clock, and the apartment echoed when Theo walked through it. He had spent weeks telling his friends how much bigger the new house would be, how he would finally have a room of his own. Now he stood in the kitchen doorway, where pencil lines climbed the frame, each labeled in his mother’s handwriting: Theo, age 4; Theo, age 7; Theo, age 10. He pressed his back against the wood the way he used to, and then, before anyone could see, he took a pencil from his pocket and drew one last line.",
      cues: ["a room of his own", "pencil lines climbed the frame", "drew one last line"],
      key: "To portray a boy’s unexpected attachment to the home he was eager to leave",
      narrow: "To describe the kitchen clock that the movers left behind in the apartment",
      opposite: "To portray a boy’s impatience to leave the apartment for his new house",
      broad: "To suggest that children adjust to new homes more easily than adults do",
    },
    {
      scene: "cs-lit-chess-rival",
      passage:
        "Marisol had lost to Mrs. Delacroix at the Thursday chess club three weeks in a row, and she had come this week determined not to lose a fourth time. For an hour the game went her way. Then Mrs. Delacroix, humming, slid a bishop across the board and left her own queen unprotected. Marisol stared. Taking the queen would cost her the game in five moves; ignoring it would cost her the game in seven. She sat back, and to her own surprise she laughed. “Show me how you saw that,” she said, turning the board around.",
      cues: ["determined not to lose", "she laughed", "Show me how you saw that"],
      key: "To portray a player’s rivalry giving way to admiration for her opponent",
      narrow: "To describe the weekly chess club where Marisol and Mrs. Delacroix usually meet",
      opposite: "To portray Marisol’s growing anger at losing to Mrs. Delacroix yet again",
      broad: "To suggest that chess rewards patience more than it rewards daring",
    },
    {
      scene: "cs-lit-drought-orchard",
      passage:
        "It had not rained in Marlow County since April, and by August the neighbors had begun selling their orchards to a developer from the city. Ada walked her rows each evening with a bucket, giving the youngest trees a little water from the well, which was lower every week. Her son called twice to ask what she was waiting for. She told him the old trees had come through the dry years of 1952 and 1977, and they would come through this. Then she went back out and pressed her palm to the bark of the oldest pear, as if checking a pulse.",
      cues: ["giving the youngest trees a little water", "they would come through this", "checking a pulse"],
      key: "To portray a farmer’s stubborn loyalty to her orchard during a drought",
      narrow: "To describe the well that supplies water to the farms of Marlow County",
      opposite: "To portray Ada’s growing readiness to sell her orchard to the developer",
      broad: "To suggest that farmers are more patient than people who live in cities",
    },
    {
      scene: "cs-lit-conductor-watch",
      passage:
        "Mr. Mensah had punched tickets on the 6:12 to Dorrington for nineteen years, and in that time the train had been late only when the weather gave it no choice. Each morning he set his pocket watch by the station clock and then, out of habit, by the sun on the eastern hills. Passengers teased him about the watch. He did not mind. When the new digital boards announced that the 6:12 was on time, he would glance at the watch anyway, and only then would he nod, as though the train needed his permission to leave.",
      cues: ["set his pocket watch", "He did not mind", "needed his permission"],
      key: "To portray a conductor’s quiet pride in keeping his train on time",
      narrow: "To describe the digital boards that announce the trains at the station",
      opposite: "To portray the conductor’s embarrassment when passengers tease him",
      broad: "To suggest that modern technology has made train travel more reliable",
    },
    {
      scene: "cs-lit-unsent-letter",
      passage:
        "Julian wrote the first line of the letter to his brother on Monday: Dear Eli, it has been too long. By Wednesday he had crossed out “too long” and written “a while,” which sounded less like an accusation. On Thursday he added a paragraph about the garden and then removed it, afraid it would seem as if nothing had changed. Now it was Sunday. The letter lay on the desk, one line and a signature, beside a stamped envelope bearing Eli’s new address, copied carefully from their mother’s note. Julian picked up the pen, set it down, and picked it up again.",
      cues: ["crossed out", "removed it", "picked it up again"],
      key: "To portray a man’s hesitant attempts to reach out to his distant brother",
      narrow: "To describe the garden that Julian considered mentioning in his letter",
      opposite: "To portray Julian’s firm decision never to contact his brother again",
      broad: "To suggest that letters are a better way to communicate than phone calls",
    },
    {
      scene: "cs-lit-museum-guard",
      passage:
        "For eleven years, Walter had guarded Gallery 14, where a small painting of a woman reading by a window hung beside the door. Visitors hurried past it toward the famous landscapes. Walter did not. He knew the exact moment each afternoon when real sunlight from the skylight fell across the painted sunlight in the picture. When the curators announced that the painting would be lent to a museum overseas for a year, Walter nodded politely at the meeting. That evening, after the gallery emptied, he stood before the painting for a long time and wished her a safe trip.",
      cues: ["Walter did not", "exact moment each afternoon", "wished her a safe trip"],
      key: "To portray a guard’s quiet affection for a painting others overlook",
      narrow: "To describe the famous landscapes that draw most visitors to the museum",
      opposite: "To portray the guard’s indifference to the art he spends his days beside",
      broad: "To suggest that museums should display fewer well-known works of art",
    },
    {
      scene: "cs-lit-first-class",
      passage:
        "Ms. Hale had written her first lesson on index cards, numbered one through twelve, and she held them so tightly on the first morning that the corners bent. The thirty faces in front of her gave nothing away. She lost her place on card four. Then a boy in the back asked whether the word “arithmetic” was named after a bug, and the room burst out laughing, and so, before she could stop herself, did she. She set the cards on the desk. For the rest of the hour she did not pick them up again.",
      cues: ["held them so tightly", "lost her place", "did not pick them up again"],
      key: "To portray a new teacher’s nervousness giving way to ease with her class",
      narrow: "To describe the index cards on which Ms. Hale wrote out her first lesson",
      opposite: "To portray Ms. Hale’s growing irritation at the student who interrupted her",
      broad: "To suggest that humor is the most important quality a teacher can have",
    },
    {
      scene: "cs-lit-fog-fisher",
      passage:
        "Old Anselm never argued with the fog. When it rolled into the harbor at Senna before dawn, the younger fishermen checked their radar screens and set out anyway, calling to him that the machines could see what he could not. Anselm only coiled his lines and sat on an overturned crate, listening to the buoy bell. He had lost a boat to fog once, forty years before, and he had not forgotten how quiet the water had been just before. By noon the fog had lifted, and the younger men returned early, tight-lipped, with half-empty nets.",
      cues: ["never argued with the fog", "lost a boat to fog", "half-empty nets"],
      key: "To portray an old fisherman’s hard-earned caution toward the fog",
      narrow: "To describe the radar screens that younger fishermen use at Senna",
      opposite: "To portray Anselm’s envy of the younger fishermen who set out in the fog",
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
        trap: "Choosing the option that matches the character’s feelings at the start of the passage rather than where the details lead.",
        hint: "What does the last thing the character does tell you?",
        estimatedSeconds: 75,
        verify: () =>
          TSP_inOrder(topic.passage, topic.cues) &&
          /^To portray\b/.test(topic.key) &&
          /^To describe\b/.test(topic.narrow) &&
          /^To suggest\b/.test(topic.broad),
      };
    },
  };

  /* ------------------------------------------------ 5. literary structure */

  // Original prose with a clear shape. `markers` appear in the passage in the
  // order the key’s moves describe.
  const TSP_LIT_STRUCTURE_TOPICS = [
    {
      scene: "cs-lit-clock-repair",
      passage:
        "Mateo bent over the stalled mantel clock, his tweezers hovering above a spring no wider than an eyelash. His hand shook, and the spring leapt away onto the bench. He remembered the first clock he had ever opened, at nine years old, in his father’s shop: how he had lost a spring then, too, and how his father, instead of scolding, had simply set a second lamp beside him and said, “Now look again.” Mateo set down the tweezers. He switched on the second lamp, the one he rarely used, and looked again.",
      markers: ["His hand shook", "He remembered", "He switched on the second lamp"],
      key: "It describes a setback during a repair, recalls a lesson from Mateo’s childhood, and then shows him acting on it.",
      ending: "It describes a setback during a repair, recalls a lesson from Mateo’s childhood, and then shows him abandoning the job.",
      order: "It opens with a lesson from Mateo’s childhood and then traces how his skill grew over many years of repairs.",
      never: "It describes a setback during a repair and then shifts to a conversation in which Mateo asks his father for help.",
    },
    {
      scene: "cs-lit-quartet-concert",
      passage:
        "Anjali had been told that the Vell Quartet’s new piece was difficult, even harsh, and she arrived at the concert hall ready to endure it. She had chosen a seat near the aisle. For the first minute, the scraping, stuttering notes seemed to confirm every warning. But then the cello settled onto a single low note and held it, and the violins began, one after another, to circle back toward it, like birds returning to a tree at dusk. By the final movement Anjali had forgotten the aisle entirely. When the hall fell silent, she was the first to stand.",
      markers: ["ready to endure it", "seemed to confirm", "first to stand"],
      key: "It presents Anjali’s low expectations for a concert, seems briefly to confirm them, and then overturns them.",
      ending: "It presents Anjali’s low expectations for a concert, seems briefly to confirm them, and then shows her leaving early.",
      order: "It describes Anjali’s enthusiastic applause and then explains the doubts she had felt before the concert began.",
      never: "It presents Anjali’s low expectations for a concert and then recounts a debate she has with another listener.",
    },
    {
      scene: "cs-lit-attic-trunk",
      passage:
        "The trunk in the attic was painted dark green, its brass corners dented, its lid stenciled with the words S. S. Maribel. Inside lay a folded wool coat, a tin of buttons, and a ledger in which someone had recorded, in brown ink, the price of every meal on a six-week voyage. June turned the pages slowly. She had always thought of her great-grandmother as a name on a family tree. Now she found herself wondering whether the woman had been seasick, whether she had been afraid, and why, of all things, she had kept track of the price of bread.",
      markers: ["painted dark green", "turned the pages slowly", "found herself wondering"],
      key: "It describes the contents of an old trunk and then turns to June’s reflections about the woman who owned it.",
      ending: "It describes the contents of an old trunk and then turns to June’s plans to sell the items she has found.",
      order: "It presents June’s reflections about her great-grandmother and then explains how June came to own the trunk.",
      never: "It describes the contents of an old trunk and then recounts the voyage from the great-grandmother’s point of view.",
    },
    {
      scene: "cs-lit-rope-bridge",
      passage:
        "The first time Noor tried to cross the rope bridge above Callan Gorge, she made it three planks before turning back. The second time, she reached the middle, where the bridge swayed with every gust, and froze there until her brother talked her back to solid ground. That night she lay awake counting the planks from memory: forty-one. On the third morning she did not look at the water or at her brother. She counted aloud, one plank to a breath, and when she said “forty-one,” her boots were on the rock of the far side.",
      markers: ["The first time", "The second time", "That night", "On the third morning"],
      key: "It recounts two failed attempts to cross a bridge, describes a night of preparation, and then a successful crossing.",
      ending: "It recounts two failed attempts to cross a bridge, describes a night of preparation, and then a decision to give up.",
      order: "It describes a successful crossing of a bridge and then explains why Noor had once been so afraid of heights.",
      never: "It recounts two failed attempts to cross a bridge and then describes her brother crossing it to show her how.",
    },
    {
      scene: "cs-lit-garden-party",
      passage:
        "“You must be so proud,” said Mrs. Kell, and Irene agreed that she was. “Engineering, and on scholarship,” said Mr. Abara, and Irene agreed again, passing the lemonade. Everyone at the garden party wanted to talk about her daughter’s acceptance letter, and Irene answered every question. It was only later, rinsing glasses at the kitchen window, that she saw the letter on the counter and understood that in September the house would be quiet, and that the question she had answered all afternoon had never once been the one she was asking herself.",
      markers: ["You must be so proud", "It was only later", "understood that in September"],
      key: "It presents a series of cheerful exchanges at a party and then shifts to Irene’s private realization afterward.",
      ending: "It presents a series of cheerful exchanges at a party and then shifts to an argument between Irene and her daughter.",
      order: "It begins with Irene’s private realization in the kitchen and then flashes back to the party that prompted it.",
      never: "It presents a series of cheerful exchanges at a party and then describes the daughter’s first day at college.",
    },
    {
      scene: "cs-lit-newsstand",
      passage:
        "Every morning Mr. Farrow walked to the corner newsstand, bought the same paper, exchanged the same remark about the weather with Mrs. Ito, and walked home by the same route, past the bakery and the shuttered cinema. He had done so for twenty-two years. On Tuesday the newsstand was gone. In its place was a bare square of pavement, paler than the sidewalk around it, and a notice about new bus shelters. Mr. Farrow stood looking at the pale square for some time. Then, for the first time in twenty-two years, he walked home the long way, past the river.",
      markers: ["Every morning", "On Tuesday", "for the first time in twenty-two years"],
      key: "It establishes a long-standing routine, describes a sudden disruption to it, and then shows a small change in response.",
      ending: "It establishes a long-standing routine, describes a sudden disruption to it, and then shows the old routine quickly restored.",
      order: "It describes a sudden disruption to Mr. Farrow’s day and then explains the history of the neighborhood newsstand.",
      never: "It establishes a long-standing routine and then describes a conversation in which Mrs. Ito explains her departure.",
    },
    {
      scene: "cs-lit-hometown-return",
      passage:
        "When Renata left Fennick at eighteen, she had called it the smallest town in the world: one road, one diner, one traffic light that blinked yellow all night. Twelve years later she drove in on that same road, expecting to find it smaller still. The diner had a new sign. The light still blinked. But at the counter, the owner remembered her order before she had finished sitting down, and a man she did not recognize asked after her father by name. Renata stirred her coffee and thought that a town might be small the way a room is small when it is full of people you know.",
      markers: ["she had called it the smallest town", "Twelve years later", "Renata stirred her coffee"],
      key: "It recalls Renata’s dismissive view of her hometown, describes her return years later, and then shows that view softening.",
      ending: "It recalls Renata’s dismissive view of her hometown, describes her return years later, and then shows that view confirmed.",
      order: "It describes Renata’s return to her hometown and then flashes back to explain why she has decided to stay for good.",
      never: "It recalls Renata’s dismissive view of her hometown and then describes an argument with the diner’s owner about it.",
    },
    {
      scene: "cs-lit-harbor-widening",
      passage:
        "On the dock, a gull worked at a mussel shell, lifting it, dropping it on the planks, lifting it again. Beyond the gull, two boys were untangling a single fishing line between them, arguing cheerfully about whose fault the knot had been. Beyond them, the ferry was backing out of its slip, its horn sounding once across the harbor. And beyond the ferry, the whole town of Casper Reach climbed the hillside in rows of white houses, every window catching the evening light at once, as if the town had been lit for someone arriving by sea.",
      markers: ["a gull worked", "Beyond the gull", "Beyond them", "beyond the ferry"],
      key: "It begins with a small, close detail and then widens its view in stages until it takes in the whole town.",
      ending: "It begins with a small, close detail and then widens its view in stages before returning to the gull at the end.",
      order: "It begins with a view of the whole town and then narrows its focus in stages to a single gull on the dock.",
      never: "It begins with a small, close detail and then shifts to the thoughts of a passenger arriving on the ferry.",
    },
    {
      scene: "cs-lit-packing-sisters",
      passage:
        "Maren packed for the trip three days early. Her suitcase stood by the door, its contents listed on a card taped to the lid: socks, six pairs; sweaters, two; umbrella, one. Her sister Lise packed on the morning of departure, in eleven minutes, throwing in whatever lay nearest, and forgot her toothbrush, as she always did. At the station, Maren produced a spare toothbrush from a side pocket without a word, and Lise took it without a word, and both of them, for once, seemed to understand that this was how it had always worked.",
      markers: ["Maren packed", "Her sister Lise packed", "At the station"],
      key: "It contrasts two sisters’ ways of packing and then shows how their differences fit together.",
      ending: "It contrasts two sisters’ ways of packing and then shows those differences leading to a quarrel.",
      order: "It describes the sisters meeting at the station and then explains how each had spent the morning.",
      never: "It contrasts two sisters’ ways of packing and then describes the trip from the younger sister’s view.",
    },
    {
      scene: "cs-lit-newspaper-kite",
      passage:
        "The kite was already falling when Arun reached the top of the hill. It had been his grandmother’s idea to build it from newspaper and bamboo, the way she had as a girl, and they had spent all of Sunday gluing and trimming while she told him about the rooftop contests of her childhood, when the sky filled with loose kites. Now the paper tore on a fence post. Arun gathered the pieces carefully, already planning, in his grandmother’s voice, the stronger frame they would build next week.",
      markers: ["already falling", "It had been his grandmother’s idea", "Now the paper tore", "next week"],
      key: "It opens as the kite falls, fills in how the kite was made, and then returns to Arun’s plans to build another.",
      ending: "It opens as the kite falls, fills in how the kite was made, and then returns to Arun’s decision to stop flying kites.",
      order: "It describes how Arun and his grandmother built a kite and then shows the kite’s first successful flight.",
      never: "It opens as the kite falls and then describes a rooftop contest that Arun enters with the kite later that day.",
    },
    {
      scene: "cs-lit-snow-street",
      passage:
        "All along Hewitt Street, the snow had closed the schools and stopped the buses, and the neighborhood had gone quiet in the way it did only a few times each winter. Shovels scraped. Someone’s radio played an old waltz. In the third-floor window of number 18, old Mr. Abernathy watched the children below building a lopsided fort, and when their wall collapsed for the second time, he opened the window, leaned out into the cold, and began, loudly and with great authority, to explain the proper angle for packing snow.",
      markers: ["All along Hewitt Street", "Shovels scraped", "In the third-floor window"],
      key: "It describes a snowy street as a whole and then narrows its focus to one resident’s response to the scene.",
      ending: "It describes a snowy street as a whole and then narrows its focus to one resident who ignores the scene.",
      order: "It focuses first on Mr. Abernathy at his window and then widens to describe the whole street he is watching.",
      never: "It describes a snowy street as a whole and then narrows its focus to the children’s argument over the fort.",
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
          [topic.key, topic.ending, topic.order, topic.never].every((choice) => /^It\b/.test(choice)) &&
          TSP_sharedPrefix(topic.key, topic.ending) >= topic.key.length / 2 &&
          TSP_sharedPrefix(topic.key, topic.order) < topic.key.length / 2,
      };
    },
  };

  /* ------------------------------- 6. structure: view, complication, qualify */

  // A widely held view, evidence that complicates it, and a final sentence that
  // keeps part of the view under a condition. `markers` fall in that order.
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
  ];

  // Three parallel wordings; each keeps the key’s final move the same length
  // as its rivals.
  const TSP_QUALIFY_FRAMES = [
    {
      key: (x) => `It states a common view about ${x}, reports evidence that complicates it, and then narrows that view.`,
      reject: (x) => `It states a common view about ${x}, reports evidence that complicates it, and then discards that view.`,
      support: (x) => `It states a common view about ${x}, reports evidence that confirms it, and then extends that view to new cases.`,
      rival: (x) => `It states two rival views about ${x}, weighs the evidence for each, and then declares one of them correct.`,
      limiting: "narrows",
      abandoning: "discards",
    },
    {
      key: (x) => `It outlines an accepted claim about ${x}, reports findings that cast doubt on it, and then limits the claim.`,
      reject: (x) => `It outlines an accepted claim about ${x}, reports findings that cast doubt on it, and then dismisses the claim.`,
      support: (x) => `It outlines an accepted claim about ${x}, reports findings that strengthen it, and then applies it more widely.`,
      rival: (x) => `It outlines a problem in how researchers study ${x}, proposes a new method, and then reports its results.`,
      limiting: "limits",
      abandoning: "dismisses",
    },
    {
      key: (x) => `It introduces a familiar belief about ${x}, describes evidence that challenges it, and then says when it still holds.`,
      reject: (x) => `It introduces a familiar belief about ${x}, describes evidence that challenges it, and then calls it a baseless myth.`,
      support: (x) => `It introduces a familiar belief about ${x}, describes evidence that supports it, and then explains how it arose.`,
      rival: (x) => `It introduces two opposing beliefs about ${x}, describes evidence bearing on each, and then settles the debate.`,
      limiting: "still holds",
      abandoning: "baseless myth",
    },
  ];

  const tspStructureViewComplication = {
    id: "tsp-structure-view-complication",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "author's purpose",
    difficulty: "Hard",
    title: "Structure: common view, complication, qualification",
    recognize:
      "After evidence that cuts against a common view, the final sentence keeps part of the view under a condition; that is a qualification, not a rejection and not a confirmation.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["extreme-language", "opposite-stance"],
    build(t) {
      const topic = t.pick(TSP_QUALIFY_TOPICS);
      const frame = t.pick(TSP_QUALIFY_FRAMES);
      const x = topic.subject;
      const correct = frame.key(x);
      const reject = frame.reject(x);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: topic.passage },
        stem: "Which choice best describes the overall structure of the text?",
        correct,
        wrong: [
          [reject, `The final sentence keeps part of the view (${topic.kept}), so the text narrows the view rather than abandoning it.`],
          [frame.support(x), `The middle of the text does not confirm the view; it reports ${topic.complication}.`],
          [frame.rival(x), "The text opens with one widely held view, not two rival positions or a problem of method, and it never declares a winner."],
        ],
        explanation: `The text states a common view about ${x}, then reports ${topic.complication}, and finally keeps a limited form of the view: ${topic.kept}. That is a qualification, not a rejection.`,
        steps: [
          "Identify the view stated at the start and whose view it is.",
          "Decide whether the middle evidence supports or complicates that view.",
          "Read the last sentence closely: does it discard the view, or keep part of it under a condition?",
          "Choose the description that matches all three moves.",
        ],
        principles: [
          "Evidence against a view often leads an author to qualify it rather than reject it; look for what the final sentence still accepts.",
          "In structure questions, choices that share opening moves are separated by their last move.",
        ],
        trap: "Seeing strong evidence against the view and choosing the option that says the author rejects it, missing the part the final sentence keeps.",
        hint: "What does the last sentence still grant to the original view?",
        estimatedSeconds: 95,
        verify: () =>
          TSP_inOrder(topic.passage, topic.markers) &&
          correct.includes(frame.limiting) && !reject.includes(frame.limiting) &&
          reject.includes(frame.abandoning) && !correct.includes(frame.abandoning) &&
          topic.passage.lastIndexOf(topic.markers[2]) > topic.passage.length / 2,
      };
    },
  };

  /* ---------------------------------------------- 7. function: foil sentence */

  // The quoted sentence (sentence index `foil`) states a view the text later
  // undercuts, starting at `turn`. `actual` is what the text concludes instead.
  const TSP_FOIL_TOPICS = [
    {
      scene: "cs-varden-murals",
      subject: "the age of the Varden murals",
      sentences: [
        "The murals in the chapel at Varden were painted in the 1400s.",
        "Their stiff, gold-backed figures resemble those in other chapels of that century, and a document from 1462 records a payment to a painter for work in the building.",
        "Last year, however, conservators analyzing a sample of the murals’ deep blue background identified a synthetic pigment that was not manufactured anywhere until the early 1700s.",
        "Because the blue lies beneath the gold rather than on top of it, it cannot be a later touch-up: the murals as they now appear must date from the 1700s or after.",
      ],
      foil: 0,
      turn: "however",
      actual: "the murals as they appear today date from the 1700s or later",
    },
    {
      scene: "cs-pell-tortoises",
      subject: "the origin of the Pell Island tortoises",
      sentences: [
        "The giant tortoises of Pell Island are descended from animals that sailors left there in the 1600s as a supply of fresh meat.",
        "Ships’ logs from the period mention such practices on several islands in the region, and the tortoises closely resemble a species found on the mainland.",
        "Yet when geneticists compared DNA from the island and mainland populations, they found differences that would have taken hundreds of thousands of years to accumulate.",
        "The tortoises must have reached Pell long before any ship did, most likely by floating across on their own, as tortoises are known to do.",
      ],
      foil: 0,
      turn: "Yet when geneticists",
      actual: "the tortoises reached the island long before any sailors did",
    },
    {
      scene: "cs-merrow-bay-founding",
      subject: "the founding of Merrow Bay",
      sentences: [
        "The harbor town of Merrow Bay has an unusually well-documented beginning.",
        "It was founded in 1682 by fishing families who had sailed south from the Tarn coast, a date carved above the door of its oldest church.",
        "Excavations beneath the town’s market square last spring, however, uncovered the remains of hearths, grain pits, and iron plow blades.",
        "Radiocarbon dates from the hearths cluster around 1610, which means that a farming community was living on the site some seventy years before the fishermen arrived.",
      ],
      foil: 1,
      turn: "however",
      actual: "farmers were living on the site decades before 1682",
    },
    {
      scene: "cs-salt-road-authorship",
      subject: "who wrote ‘The Salt Road’",
      sentences: [
        "The anonymous 1847 novel ‘The Salt Road’ was written by the essayist Harriet Voss.",
        "Voss’s friends hinted as much in their letters, and the novel’s setting, a fishing village on the Marl estuary, is where she spent her childhood.",
        "But a computer comparison of the novel’s vocabulary with the writing of several possible authors found that its habits of word choice match those of her brother, Edmund, far more closely than hers.",
        "Voss may have shared memories of the village with Edmund, but the novel itself was most likely his.",
      ],
      foil: 0,
      turn: "But a computer comparison",
      actual: "the novel was most likely written by Voss’s brother, Edmund",
    },
    {
      scene: "cs-marsh-thrush-song",
      subject: "how marsh thrushes learn their songs",
      sentences: [
        "In the dense reeds where marsh thrushes nest, a young male hears one adult voice more than any other.",
        "He learns his song from his father.",
        "Researchers at the Fenwick Reserve moved a set of newly hatched chicks into the nests of unrelated pairs.",
        "By their first spring, the fostered males sang neither like their biological fathers nor especially like their foster fathers; their songs matched those of whichever neighboring male sang most often near the nest.",
      ],
      foil: 1,
      turn: "neither like their biological fathers",
      actual: "young males copy whichever nearby male sings most, not their fathers",
    },
    {
      scene: "cs-halvern-stadium",
      subject: "the economic effect of stadiums",
      sentences: [
        "When the city of Halvern opened its new baseball stadium in 2012, local officials predicted a surge in business for the surrounding neighborhood.",
        "The reasoning seemed simple: a stadium brings new spending into the area around it.",
        "Ten years of sales-tax records from Halvern show that restaurants and bars near the stadium did gain customers on game days.",
        "Businesses elsewhere in the city, though, lost nearly as much, as residents shifted their evening spending rather than adding to it, so the stadium moved money around far more than it created it.",
      ],
      foil: 1,
      turn: "though, lost nearly as much",
      actual: "the stadium mostly shifted spending rather than creating it",
    },
    {
      scene: "cs-oskara-temple-builders",
      subject: "who built the temple at Oskara",
      sentences: [
        "The hilltop temple at Oskara was raised by laborers captured in war and forced to work.",
        "Travelers who visited the ruins two centuries later wrote as much, and the sheer size of the temple’s stone blocks seemed to demand a vast, unwilling workforce.",
        "Excavations of the workers’ village at the foot of the hill, however, have revealed bakeries, a brewery, and the skeletons of laborers whose broken bones had been carefully set and allowed to heal.",
        "Several workers were even buried with tools and jars of food for the afterlife, honors rarely granted to captives.",
      ],
      foil: 0,
      turn: "however",
      actual: "the builders were cared for and honored in ways that captives rarely were",
    },
    {
      scene: "cs-castel-quartet-pitch",
      subject: "the pitch Castel intended for his quartets",
      sentences: [
        "When modern ensembles perform the string quartets of Aurelio Castel, they tune to the pitch standard used in concert halls today.",
        "Castel wrote the quartets with that familiar pitch in mind.",
        "His own copies of the scores, however, carry penciled notes asking players to tune noticeably lower, and a tuning fork found among his belongings sounds almost a half step below the modern standard.",
        "Played at Castel’s pitch, the quartets’ highest passages lose their strained brilliance and take on a warmer tone.",
      ],
      foil: 1,
      turn: "however",
      actual: "Castel expected the quartets to be tuned noticeably lower",
    },
    {
      scene: "cs-lake-tarren-shorelines",
      subject: "the history of Lake Tarren",
      sentences: [
        "Lake Tarren, now a white salt flat, has held no water for the past ten thousand years.",
        "Its highest ancient shorelines, etched into the surrounding hills, formed during the last ice age, when the region was far wetter.",
        "Lower down, though, a fainter set of shorelines holds the shells of freshwater snails.",
        "Radiocarbon dating shows the shells to be only about four thousand years old, so the lake must have filled again, at least partly, long after the ice age ended.",
      ],
      foil: 0,
      turn: "Lower down, though",
      actual: "the lake held water again only about four thousand years ago",
    },
    {
      scene: "cs-corvel-remote-work",
      subject: "remote workers’ ties to colleagues",
      sentences: [
        "Employees who switch to working from home gradually drift away from their colleagues.",
        "Without chance meetings in hallways and at lunch, working relationships have little to sustain them.",
        "A two-year study of 900 employees at the Corvel Company, however, found that those who moved to remote work sent more messages to coworkers, joined more small-group video calls, and rated their ties to their teams as slightly stronger than before.",
        "Distance, for these workers, changed the form of their contact more than its amount.",
      ],
      foil: 0,
      turn: "however",
      actual: "the remote workers’ ties held steady or grew slightly stronger",
    },
  ];

  const TSP_FOIL_FRAMES = [
    {
      key: (x) => `It presents a claim about ${x} that the text goes on to dispute.`,
      lure: (x) => `It states the conclusion about ${x} that the text as a whole argues for.`,
      settled: (x) => `It provides background about ${x} that the rest of the text treats as settled.`,
      open: (x) => `It raises a question about ${x} that the text ultimately leaves unanswered.`,
    },
    {
      key: (x) => `It sets out an accepted account of ${x} that later evidence undercuts.`,
      lure: (x) => `It gives the account of ${x} that the evidence in the text is meant to establish.`,
      settled: (x) => `It offers a fact about ${x} that the text relies on without questioning it.`,
      open: (x) => `It poses a puzzle about ${x} that the evidence in the text cannot resolve.`,
    },
  ];

  const tspFunctionFoil = {
    id: "tsp-function-foil",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "function of a sentence",
    difficulty: "Hard",
    title: "Sentence that states a view the text later undercuts",
    recognize:
      "A confident opening statement is not necessarily the author’s claim; if later evidence contradicts it, the sentence sets up an assumption for the text to challenge.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["misattributed-view", "opposite-stance"],
    build(t) {
      const topic = t.pick(TSP_FOIL_TOPICS);
      const frame = t.pick(TSP_FOIL_FRAMES);
      const x = topic.subject;
      const passage = topic.sentences.join(" ");
      const foil = topic.sentences[topic.foil];
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "passage", content: passage },
        stem: `Which choice best describes the function of the sentence “${foil}” in the text as a whole?`,
        correct: frame.key(x),
        wrong: [
          [frame.lure(x), `The text ends by concluding that ${topic.actual}, so this sentence states the view the text disputes, not the one it argues for.`],
          [frame.settled(x), `The text does not accept this as settled: later evidence leads it to conclude that ${topic.actual}.`],
          [frame.open(x), `The sentence makes a claim rather than posing a question, and the text does not leave the matter open: it concludes that ${topic.actual}.`],
        ],
        explanation: `Although the sentence is worded as settled fact, the evidence the text presents afterward leads it to conclude that ${topic.actual}. The sentence therefore sets up a view that the text goes on to challenge.`,
        steps: [
          "Read to the end of the text before judging the quoted sentence.",
          "Find the point where the text turns and state what the later evidence shows.",
          "Compare that conclusion with the quoted sentence: if they conflict, the sentence presents a view the text challenges.",
        ],
        principles: [
          "A sentence’s function depends on how the rest of the text treats it, not on how confidently it is worded.",
          "Distinguish the view a text reports from the view its evidence supports.",
        ],
        trap: "Treating the confident opening statement as the author’s thesis because it is stated as fact and is followed by details that seem to support it.",
        hint: "Does the text’s final sentence agree with the quoted one?",
        estimatedSeconds: 95,
        verify: () => {
          const foilAt = passage.indexOf(foil);
          const turnAt = passage.indexOf(topic.turn, foilAt + foil.length);
          const expectedAt = topic.sentences.slice(0, topic.foil).join(" ").length + (topic.foil ? 1 : 0);
          return foilAt === expectedAt && turnAt > foilAt && topic.foil < topic.sentences.length - 2 &&
            /dispute|undercuts/.test(frame.key(x)) && ![frame.lure(x), frame.settled(x), frame.open(x)].some((choice) => /dispute|undercuts/.test(choice));
        },
      };
    },
  };

  /* ------------------------------------ 8. purpose: evaluate a cited source */

  // A named researcher’s account and evidence, then the author’s brief
  // assessment: `grant` (what the author accepts) comes before `gap` (what the
  // account leaves unexplained).
  const TSP_EVALUATE_TOPICS = [
    {
      scene: "cs-ashby-reading-rooms",
      researcher: "Menon",
      passage:
        "Historian Clara Menon argues that the free reading rooms opened in the mill towns of the Ashby Valley during the 1850s spread literacy among factory workers. Her evidence is impressive: the rooms’ registers list more than six thousand members, most of them mill hands, and the rooms stayed open late so that workers could visit after their shifts. The registers certainly show that workers used the rooms in large numbers. What they cannot show is whether those workers learned to read there or had already learned elsewhere, perhaps in the Sunday schools that were spreading through the valley in the same decade.",
      grant: "The registers certainly show",
      gap: "What they cannot show",
      key: "To assess Menon’s claim about literacy in the Ashby Valley and note what it leaves open",
      present: "To summarize Menon’s claim about literacy in the Ashby Valley and the evidence she offers for it",
      argue: "To show that Menon’s claim about literacy in the Ashby Valley is contradicted by her own evidence",
      explainGap: "To explain why Sunday schools spread through the Ashby Valley during the 1850s",
    },
    {
      scene: "cs-kestle-bridge-bats",
      researcher: "Wren",
      passage:
        "Biologist Tomasz Wren has proposed that the colony of bats roosting under the Kestle Bridge chose the site for its warmth. The concrete crevices where the bats sleep stay about 4°C warmer than nearby tree hollows during cool spring nights, when mothers are raising pups that cannot yet regulate their own body temperature. That account fits the spring well. It is harder to square with the colony’s behavior in July and August, when the crevices become the hottest roosts in the area, yet the bats stay put rather than moving to the cooler hollows a short flight away.",
      grant: "That account fits the spring well",
      gap: "harder to square",
      key: "To assess Wren’s account of the bats’ choice of roost and note what it leaves unexplained",
      present: "To summarize Wren’s account of the bats’ choice of roost and the measurements that support it",
      argue: "To show that Wren’s account of the bats’ choice of roost is contradicted by his own measurements",
      explainGap: "To explain why the bats remain under the bridge during the hottest months of the year",
    },
    {
      scene: "cs-aldren-cold-summer",
      researcher: "Faro",
      passage:
        "Climate historian Ines Faro attributes the unusually cold summer of 1641 in the Aldren highlands to a distant volcanic eruption. Ice cores drilled from a nearby glacier contain a layer of volcanic ash dated to that year, and sulfur from such eruptions is known to dim sunlight for months. The ash layer makes a strong case that an eruption occurred in 1641. Parish records, though, note snow on the high pastures as early as March of that year, and the ice cores place the ash in late spring, after the cold had already begun.",
      grant: "The ash layer makes a strong case",
      gap: "though",
      key: "To assess Faro’s explanation of the cold summer of 1641 and point out a problem of timing",
      present: "To summarize Faro’s explanation of the cold summer of 1641 and the ice-core evidence behind it",
      argue: "To show that Faro’s explanation of the cold summer of 1641 has no support in the ice-core record",
      explainGap: "To explain why snow fell on the high pastures of the Aldren highlands in March 1641",
    },
    {
      scene: "cs-lantern-portrait-fading",
      researcher: "Ueda",
      passage:
        "Conservator Kenzo Ueda believes that the faded blues in the portrait ‘Woman with a Lantern’ were bleached by sunlight from a window beside which the painting hung for almost a century. His evidence is persuasive as far as it goes: the fading is strongest along the painting’s right side, which faced the window, and weakest along the left. But the lower edge of the canvas, which a heavy frame kept shaded for most of that century, has faded nearly as much as the right side.",
      grant: "His evidence is persuasive as far as it goes",
      gap: "But the lower edge",
      key: "To assess Ueda’s explanation of the portrait’s faded blues and note what it cannot explain",
      present: "To summarize Ueda’s explanation of the portrait’s faded blues and the evidence he offers for it",
      argue: "To show that Ueda’s explanation of the portrait’s faded blues is mistaken in every respect",
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
      present: "To summarize Achterberg’s account of Pellington’s growth and the figures he uses to support it",
      argue: "To show that Achterberg’s account of Pellington’s growth is mistaken in every respect",
      explainGap: "To explain why the town of Thorne grew so little after its station opened",
    },
    {
      scene: "cs-brask-vowel",
      researcher: "Vogel",
      passage:
        "Linguist Hana Vogel argues that teenagers in the city of Brask have adopted a new vowel sound from a popular television series set in the capital, where the vowel is common. Her recordings show the sound spreading first among viewers aged thirteen to nineteen, the show’s main audience, beginning the year after its premiere. The timing is suggestive. Still, the series aired across the whole city, while the new vowel has so far appeared almost entirely in a single neighborhood, Lower Brask.",
      grant: "The timing is suggestive",
      gap: "Still,",
      key: "To assess Vogel’s explanation of the new vowel in Brask and note what it leaves unexplained",
      present: "To summarize Vogel’s explanation of the new vowel in Brask and the recordings that support it",
      argue: "To show that Vogel’s explanation of the new vowel in Brask is contradicted by her recordings",
      explainGap: "To explain why the new vowel has spread mainly through the neighborhood of Lower Brask",
    },
    {
      scene: "cs-keel-notebooks",
      researcher: "Hart",
      passage:
        "Scholar Leonie Hart contends that the philosopher Ambrose Keel abandoned his early theory of perception after a critic, Mary Dunmore, attacked it in a widely read letter of 1754. Keel’s next book, published within a year of the letter, omits the theory entirely. Hart’s timeline is careful, and the omission is real. Keel’s private notebooks, however, show him defending the theory against Dunmore’s objections for another decade.",
      grant: "Hart’s timeline is careful, and the omission is real",
      gap: "however",
      key: "To assess Hart’s account of why Keel dropped his theory and note evidence it does not fit",
      present: "To summarize Hart’s account of why Keel dropped his theory and the evidence she cites in support",
      argue: "To show that Hart’s account of why Keel dropped his theory is without any basis at all",
      explainGap: "To explain why Dunmore’s letter of 1754 attracted such a wide readership",
    },
    {
      scene: "cs-morrow-dawn-chorus",
      researcher: "Sandoval",
      passage:
        "Ecologist Felipe Sandoval proposes that songbirds sing most intensely at dawn because the still, cool air of early morning carries sound especially well. In tests at the Morrow Woods reserve, he found that recorded songs played at dawn could be detected about 20 percent farther away than the same songs played at midday. The acoustic advantage he measured is real. But evening air in the reserve is often just as still and cool, and birds there sing far less at dusk than at dawn.",
      grant: "The acoustic advantage he measured is real",
      gap: "But evening air",
      key: "To assess Sandoval’s explanation of the dawn chorus and note what it does not explain",
      present: "To summarize Sandoval’s explanation of the dawn chorus and the sound tests he ran to support it",
      argue: "To show that Sandoval’s explanation of the dawn chorus is contradicted by his own sound tests",
      explainGap: "To explain why the evening air at Morrow Woods is often as still as the morning air",
    },
    {
      scene: "cs-eastgate-gardens",
      researcher: "Quist",
      passage:
        "Sociologist Amara Quist credits the community gardens planted on vacant lots in the Eastgate neighborhood with reducing the number of empty homes there. Across the blocks where gardens were planted in 2016, vacancies fell by a third over the following five years, while they held steady on blocks without gardens. The contrast between the two sets of blocks is striking. City records show, however, that vacancies on the garden blocks had already begun to fall in 2014, two years before the first seeds went into the ground.",
      grant: "The contrast between the two sets of blocks is striking",
      gap: "however",
      key: "To assess Quist’s account of Eastgate’s falling vacancies and point out a problem of timing",
      present: "To summarize Quist’s account of Eastgate’s falling vacancies and the data she presents for it",
      argue: "To show that Quist’s account of Eastgate’s falling vacancies is contradicted by her own data",
      explainGap: "To explain why vacancies on the garden blocks began to fall as early as 2014",
    },
    {
      scene: "cs-oran-weaving-pattern",
      researcher: "Bell",
      passage:
        "Textile historian Joaquín Bell argues that the star-and-ladder weaving pattern spread across the Oran plateau because merchants carried cloth bearing it along the old salt road. The pattern does appear in nearly every town along the road, and the oldest examples come from the road’s eastern end, where Bell believes it began. Bell’s map makes a good case for the towns on the route. It says nothing, however, about Hollin, a village in the mountains two days’ walk from the road, where weavers were making the same pattern at least as early as anyone.",
      grant: "Bell’s map makes a good case",
      gap: "It says nothing, however",
      key: "To assess Bell’s account of the pattern’s spread and note a case it does not explain",
      present: "To summarize Bell’s account of the pattern’s spread and the evidence he has gathered for it",
      argue: "To show that Bell’s account of the pattern’s spread is contradicted by his own map",
      explainGap: "To explain why weavers in Hollin began making the star-and-ladder pattern",
    },
    {
      scene: "cs-lake-sorrel-ice",
      researcher: "Harrow",
      passage:
        "Limnologist Gwen Harrow links the later freeze-up of Lake Sorrel over the past 150 years to rising air temperatures in the region. Records kept by residents show that the lake now freezes, on average, about two weeks later than it did in the 1870s, and regional air temperatures have climbed steadily over the same period. Harrow’s correlation is strong. Lake Vessey, however, lies only twenty miles away, is nearly the same size and depth, and has experienced the same warming, yet its average freeze-up date has scarcely changed.",
      grant: "Harrow’s correlation is strong",
      gap: "however",
      key: "To assess Harrow’s account of Lake Sorrel’s later freezing and note a case it does not explain",
      present: "To summarize Harrow’s account of Lake Sorrel’s later freezing and the records that support it",
      argue: "To show that Harrow’s account of Lake Sorrel’s later freezing is contradicted by her own records",
      explainGap: "To explain why Lake Vessey’s freeze-up date has scarcely changed since the 1870s",
    },
  ];

  const tspPurposeEvaluateSource = {
    id: "tsp-purpose-evaluate-source",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    subskill: "author's purpose",
    difficulty: "Hard",
    title: "Main purpose: weighing a researcher’s account",
    recognize:
      "Most of the text reports a researcher’s view, but the author’s own voice enters at the end to grant part of it and point to what it leaves unexplained; the purpose is the author’s assessment, not the researcher’s claim.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
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
        explanation: `The text first reports ${name}’s account and evidence, then the author grants part of it (“${topic.grant}”) before pointing to something the account leaves unexplained. The main purpose is therefore to assess the account, not simply to present or reject it.`,
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
            topic.key.startsWith(`To assess ${name}’s`) && topic.present.startsWith(`To summarize ${name}’s`) &&
            topic.argue.startsWith(`To show that ${name}’s`) && !topic.explainGap.includes(name);
        },
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
  ];
});
