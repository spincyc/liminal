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
      scene: "cs-tree-ring-dating",
      passage:
        "Each year, a tree in a temperate climate adds a ring of new wood, and the ring is wide in a wet year and narrow in a dry one. Because weather varies from year to year, trees across a region share the same sequence of wide and narrow rings. Researchers have linked such sequences from living trees, old buildings, and buried logs into a record stretching back centuries. By matching the rings of an old beam to that record, they can identify the year in which its tree was cut.",
      cue: "By matching the rings",
      detail: "dry",
      key: "To describe how tree rings can reveal when a beam was cut",
      argue: "To argue that many old buildings are older than was thought",
      narrow: "To point out that rings are wide in wet years and narrow in dry ones",
      other: "To show how temperate and tropical trees differ",
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
  // key's verb rotates (offers, gives, illustrates, describes, provides,
  // presents) and the distractors use the same verbs, so no phrase marks it.
  const TSP_EXAMPLE_TOPICS = [
    {
      scene: "cs-octopus-texture",
      claim: "Octopuses are famous for changing color, but many can also change the texture of their skin.",
      example: "One common octopus filmed off a rocky shore raised dozens of small bumps along its back until it resembled the barnacle-crusted stone beside it.",
      after: "Such shifts in texture help an octopus disappear against surfaces that color alone could not match.",
      key: "It offers a specific case of an octopus changing the texture of its skin to hide.",
      contra: "It describes an octopus whose behavior runs counter to the claim about texture.",
      main: "It states the general claim about octopus skin that the text then supports.",
      cause: "It gives the reason octopuses are able to change the color of their skin.",
    },
    {
      scene: "cs-shade-coffee-birds",
      claim: "Coffee farms that keep native trees standing over their crops can shelter a surprising variety of birds.",
      example: "On one shade-grown farm in the hills above Sollano, surveyors counted more than 150 bird species among the coffee bushes, nearly as many as in the neighboring forest.",
      after: "Farms that clear the canopy to grow coffee in full sun typically support only a fraction of that number.",
      key: "It gives one example of a coffee farm that shelters many kinds of birds.",
      contra: "It offers a case in which shade trees drove most bird species away from a farm.",
      main: "It introduces the main claim about coffee farms that the text then supports.",
      cause: "It explains why some farmers grow their coffee in full sun instead.",
    },
    {
      scene: "cs-silent-film-pianist",
      claim: "Silent films were rarely watched in silence; most theaters hired musicians to accompany every screening.",
      example: "At the Orpheum in Castleton, the pianist Ida Marsh played beneath each film, shifting from gentle waltzes during courtship scenes to pounding chords during chases.",
      after: "For many viewers, such music shaped the mood of a film as much as the images did.",
      key: "It illustrates the claim with one pianist who played for silent films.",
      contra: "It describes a theater that showed its silent films without any music.",
      main: "It presents the text’s main claim about how silent films were shown.",
      cause: "It offers a reason theaters eventually stopped hiring musicians for films.",
    },
    {
      scene: "cs-marsh-road-timber",
      claim: "Road builders in the ancient world adjusted their methods to the ground they had to cross.",
      example: "Where one Roman road in northern Gaul passed through marshland, its builders laid rafts of timber beneath the gravel so that the road would not sink.",
      after: "On firm, rocky ground, the same builders often set their paving stones almost directly on the bedrock.",
      key: "It describes one instance of builders adapting a road to the ground it crossed.",
      contra: "It gives an example of a road whose builders ignored the ground beneath it.",
      main: "It states the general claim about ancient roads that the text supports.",
      cause: "It explains why Roman roads were built with layers of gravel.",
    },
    {
      scene: "cs-bloodroot-ants",
      claim: "Some plants rely on animals to carry their seeds away from the parent plant.",
      example: "Each seed of the bloodroot, a woodland wildflower, bears a small fatty attachment that ants drag back to their nests, where they eat the attachment and discard the seed.",
      after: "The seed is left in rich, protected soil, well placed to sprout the following spring.",
      key: "It provides one case of a plant whose seeds animals carry off.",
      contra: "It describes a plant that scatters its seeds with no help from animals.",
      main: "It introduces the main claim about seed dispersal that the text then supports.",
      cause: "It explains why ants prefer woodland seeds to other kinds of food.",
    },
    {
      scene: "cs-ballad-variants",
      claim: "Folk songs often change as they pass from one community to another.",
      example: "The ballad ‘Crossing at Marrow Ford’ is sung in one valley as a tale of lost love and in the next valley as a story about a flooded mill.",
      after: "Singers in each place kept the melody but reshaped the words to suit their own concerns.",
      key: "It presents one example of a folk song that changed as it traveled.",
      contra: "It offers a case of a folk song that stays the same wherever it is sung.",
      main: "It states the main claim about folk songs that the text goes on to support.",
      cause: "It explains why mills often flooded in the valleys where the song is sung.",
    },
    {
      scene: "cs-auto-enrollment",
      claim: "The option that people receive by default can strongly shape the choices they make.",
      example: "When the Harlow Company began enrolling new employees in its retirement plan automatically, participation rose from about half of new workers to nearly nine in ten.",
      after: "Employees could still leave the plan by filling out a single form, yet few chose to do so.",
      key: "It offers a specific case of a default option shaping people’s choices.",
      contra: "It describes a case in which a default option had little effect on choices.",
      main: "It presents the general claim about defaults that the text then supports.",
      cause: "It provides the reason the Harlow Company offered its workers a retirement plan.",
    },
    {
      scene: "cs-venetian-glass-secrets",
      claim: "Some European cities went to great lengths to protect the secrets of their most valuable crafts.",
      example: "Glassmakers in Venice were forbidden to leave the republic without permission, and those who left to work abroad could be declared traitors.",
      after: "Such rules kept techniques for making clear glass and colored beads within a small circle of workshops for generations.",
      key: "It gives an example of a city that guarded the secrets of one of its prized crafts.",
      contra: "It describes a city that freely shared its craft techniques with others.",
      main: "It introduces the main claim about craft secrets that the text then supports.",
      cause: "It explains why Venetian glass was valued above other glass.",
    },
    {
      scene: "cs-hummingbird-torpor",
      claim: "Some small birds survive cold nights by letting their bodies cool far below their usual daytime temperature.",
      example: "On freezing nights high in the Andes, certain hummingbirds allow their body temperature to fall below 10°C, then warm themselves again shortly before dawn.",
      after: "By cooling down, a hummingbird can greatly reduce the energy it burns overnight.",
      key: "It illustrates the claim with birds that cool their bodies on cold nights.",
      contra: "It gives an example of birds that keep a steady temperature through cold nights.",
      main: "It states the general claim about small birds that the text then supports.",
      cause: "It explains why hummingbirds need so much energy during the day.",
    },
    {
      scene: "cs-courtyard-house",
      claim: "Traditional houses in hot, dry regions were often designed to stay cool without machinery.",
      example: "In the town of Ardana, the Merin family’s house is built around a shaded courtyard with a shallow pool, and cool air that collects there at night flows through the rooms well into the afternoon.",
      after: "Thick earthen walls also slow the midday heat from reaching the interior.",
      key: "It describes one instance of a house designed to stay cool without machines.",
      contra: "It presents a house whose design makes it hotter than the air outside.",
      main: "It introduces the main claim about traditional houses that the text supports.",
      cause: "It provides the reason the Merin family chose to build their house in Ardana.",
    },
    {
      scene: "cs-poet-revisions",
      claim: "The poet Celia Brandt was known among her friends as a relentless reviser of her own work.",
      example: "Her short poem ‘Winter Orchard’ survives in eleven handwritten drafts, and in each one she rewrote the final line.",
      after: "Even after the poem was published, she kept marking changes in the margins of her own copy.",
      key: "It provides a particular case of Brandt revising one poem again and again.",
      contra: "It describes a poem that Brandt wrote quickly and never changed.",
      main: "It states the main claim about Brandt that the rest of the text supports.",
      cause: "It explains why Brandt so often chose orchards as the subject of her poems.",
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
        "The harbor town of Merrow Bay takes pride in its well-documented beginning.",
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
      scene: "cs-aldren-cold-summer",
      researcher: "Faro",
      passage:
        "Climate historian Ines Faro attributes the unusually cold summer of 1641 in the Aldren highlands to a distant volcanic eruption. Ice cores drilled from a nearby glacier contain a layer of volcanic ash dated to that year, and sulfur from such eruptions is known to dim sunlight for months. The ash layer makes a strong case that an eruption occurred in 1641. Parish records, though, note snow on the high pastures as early as March of that year, and the ice cores place the ash in late spring, after the cold had already begun.",
      grant: "The ash layer makes a strong case",
      gap: "though",
      key: "To evaluate Faro’s explanation of the cold summer of 1641 and raise a problem of timing",
      present: "To outline Faro’s explanation of the cold summer and the ice-core evidence for it",
      argue: "To question whether any volcanic eruption at all occurred in 1641",
      explainGap: "To explain why snow fell on the high Aldren pastures in March of 1641",
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
      scene: "cs-going-to-future",
      passage:
        "Historical linguists use the term grammaticalization for the process by which an ordinary word or phrase takes on a grammatical function. The English construction be going to is a standard illustration. When a speaker says that a friend is going to the market, the construction describes movement toward a place; when the speaker says that it is going to rain, it marks only future time, since nothing is traveling anywhere. The second use appears to have grown out of the first, because a person who sets off in order to do something will, as a rule, do it later. What began as a description of travel thus became, over several centuries, a way of talking about time.",
      quoted: "When a speaker says that a friend is going to the market, the construction describes movement toward a place; when the speaker says that it is going to rain, it marks only future time, since nothing is traveling anywhere.",
      key: "It sets out a contrast between two uses of the construction whose connection the text then traces.",
      wrong: [
        ["It supplies the definition of grammaticalization on which the rest of the text depends.", "The definition comes in the first sentence; the quoted sentence contrasts two uses of one construction."],
        ["It explains how the future use of the construction developed out of the motion use.", "That link is drawn in the following sentence; the quoted sentence only sets the two uses side by side."],
        ["It shows that the two uses of the construction are unrelated despite sharing a form.", "The text says the future use grew out of the motion use, so it treats the two as related, not unrelated."],
      ],
      why: "The quoted sentence places two uses of be going to side by side (movement toward a place, and future time), and the next sentence explains how the second grew out of the first. The sentence sets up the contrast that the rest of the text accounts for.",
    },
    {
      scene: "cs-castleby-wages",
      passage:
        "Wage records from the port of Castleby, which run from 1540 to 1640, seem to show laborers growing steadily richer: the daily wage of a dockhand rose more than fourfold over the century. Economic historian Ilse Marr cautions against reading the figures at face value. During the same period, the crown repeatedly reduced the amount of silver in its coins, so a shilling in 1640 bought far less than a shilling in 1540. Marr therefore converts every wage into the weight of silver it represented before comparing one decade with another. Measured this way, a dockhand’s pay rose only modestly and barely kept pace with the price of bread.",
      quoted: "Marr therefore converts every wage into the weight of silver it represented before comparing one decade with another.",
      key: "It describes a step Marr takes so that wages from different decades can be fairly compared.",
      wrong: [
        ["It reports the finding that leads Marr to doubt that dockhands grew richer.", "Marr’s finding comes in the last sentence; the quoted sentence describes how she prepares the figures, not what they showed."],
        ["It explains why the crown reduced the amount of silver in its coins during the century.", "The text never gives the crown’s reasons; the debasement is mentioned only as the problem Marr’s method is designed to handle."],
        ["It concedes that the wage records overstate how many shillings the dockhands were paid.", "Marr does not dispute the recorded wages; she changes the unit in which they are compared, because a shilling’s value changed."],
      ],
      why: "The sentence before it states the problem (a shilling in 1640 held less silver than one in 1540), and the quoted sentence gives Marr’s remedy: she expresses every wage in silver before comparing decades. It is a methodological step; the result it produces comes only in the final sentence.",
    },
    {
      scene: "cs-arvo-lizard-seeds",
      passage:
        "On the Arvo Islands, a small lizard feeds heavily on the fruit of a native shrub, and ecologist Rafael Duarte argues that the lizard does the shrub a double service: it carries seeds away from the parent plant and improves their chances of sprouting. Seeds recovered from lizard droppings, often found tens of meters from the nearest shrub, sprouted at nearly twice the rate of seeds taken straight from the fruit. It could be, of course, that the lizards simply pick the ripest fruit, whose seeds would sprout well however they were scattered. Duarte tested this possibility directly: seeds from equally ripe fruit, cleaned by hand, sprouted no better than seeds from ordinary fruit. Passage through the lizard itself, it appears, is what makes the difference.",
      quoted: "It could be, of course, that the lizards simply pick the ripest fruit, whose seeds would sprout well however they were scattered.",
      key: "It raises a rival explanation for a finding, one that the next sentence tests and rules out.",
      wrong: [
        ["It acknowledges a weakness in Duarte’s evidence that the text leaves unresolved at the end.", "The weakness is not left standing: the next sentence reports a test that rules it out."],
        ["It offers further evidence that seeds eaten by the lizards sprout more readily than other seeds.", "The sentence proposes another reason for that evidence; the evidence itself comes in the sentence before."],
        ["It restates Duarte’s claim that the lizard helps the shrub in two separate ways.", "Duarte’s two-part claim is stated in the first sentence; the quoted sentence challenges part of the support for it."],
      ],
      why: "The sentence before reports that seeds from droppings sprouted better. The quoted sentence suggests a different reason they might have (the lizards choose ripe fruit), and the next sentence reports Duarte’s test ruling that out. The sentence raises a rival explanation so that the text can dispose of it.",
    },
    {
      scene: "cs-san-lorenz-altarpiece",
      passage:
        "Infrared images of the altarpiece in the church of San Lorenz reveal an underdrawing beneath the paint: loose, rapid strokes that sketch each figure before any color was laid down. Art historian Paola Venn observes that the underdrawings of the painter Jacopo Ferri, known from two signed panels, show exactly this hurried, looping line, and she attributes the altarpiece to him. The resemblance is striking, but it cannot settle the question by itself, since workshops taught their drawing methods to apprentices, and an assistant trained by Ferri could well have drawn the same way. Venn’s attribution is best treated as probable rather than certain, at least until the wooden panel on which the altarpiece is painted can be dated.",
      quoted: "The resemblance is striking, but it cannot settle the question by itself, since workshops taught their drawing methods to apprentices, and an assistant trained by Ferri could well have drawn the same way.",
      key: "It identifies a limit on what the evidence of drawing style can establish.",
      wrong: [
        ["It answers an objection to Venn’s attribution by pointing to how Ferri trained his assistants.", "The sentence raises the possibility of an assistant as a problem for the attribution; nothing in the text answers it."],
        ["It argues that one of Ferri’s assistants most likely painted the altarpiece instead of Ferri.", "The sentence says only that an assistant could have drawn the same way; the text still calls Ferri’s authorship probable."],
        ["It describes the method that revealed the underdrawing beneath the altarpiece’s paint.", "The infrared method is described in the first sentence; the quoted sentence weighs what the resulting evidence shows."],
      ],
      why: "Venn’s attribution rests on a resemblance of drawing style. The quoted sentence grants the resemblance but explains why it is not conclusive (an apprentice could have learned the same style), which is why the final sentence calls the attribution probable rather than certain.",
    },
    {
      scene: "cs-chess-master-recall",
      passage:
        "In a classic line of experiments, chess players looked at a board for a few seconds and then tried to reconstruct it from memory. Masters placed nearly every piece correctly when the position came from a real game, while novices managed only a handful. When the pieces had been scattered at random, however, the masters’ advantage largely disappeared. The masters, then, do not simply have better memories; what they possess is a vast store of familiar patterns into which a real position can be broken. Expertise in such a domain may depend less on raw mental capacity than on knowledge built up through years of practice.",
      quoted: "The masters, then, do not simply have better memories; what they possess is a vast store of familiar patterns into which a real position can be broken.",
      key: "It infers what explains the masters’ advantage from the contrast between the boards.",
      wrong: [
        ["It reports the result showing that the masters’ advantage disappeared on randomly arranged boards.", "That result is reported in the previous sentence; the quoted sentence interprets it."],
        ["It extends the lesson of the experiments from chess to expertise in other fields.", "The broader lesson comes in the final sentence; the quoted sentence is still about the chess masters."],
        ["It questions whether the experiments measured the players’ memory in the first place.", "The sentence accepts the experiments and explains what they reveal about memory; it raises no doubt about them."],
      ],
      why: "The first sentences set up a contrast: masters recalled real positions far better than novices, but not random ones. The quoted sentence infers what explains that contrast (a store of familiar patterns, not a better memory), and the last sentence generalizes it.",
    },
    {
      scene: "cs-two-senses-gene",
      passage:
        "Much confusion in popular writing about heredity comes from treating the word gene as though it had a single meaning. For early geneticists, a gene was whatever factor accounted for a pattern of inheritance, such as a trait that skipped a generation; they could study such factors for decades without knowing what they were made of. For molecular biologists, a gene is a particular stretch of DNA whose sequence can be read. The two senses often pick out the same thing, but not always: a single inherited trait may trace to many stretches of DNA, and one stretch may influence many traits. A report that the gene for some trait has been found is therefore ambiguous until one knows which sense is meant.",
      quoted: "The two senses often pick out the same thing, but not always: a single inherited trait may trace to many stretches of DNA, and one stretch may influence many traits.",
      key: "It shows where the two senses diverge, which grounds the text’s closing warning.",
      wrong: [
        ["It distinguishes the two senses of the term by explaining how each one arose.", "The two senses are introduced in the two preceding sentences; the quoted sentence compares them rather than introducing them."],
        ["It argues that the molecular sense of the term should replace the older sense entirely.", "The text never recommends dropping either sense; it asks only that readers know which one is meant."],
        ["It concedes that the two senses of the term rarely refer to the same thing at all.", "The sentence says the senses often pick out the same thing; it identifies only the cases where they diverge."],
      ],
      why: "After the two senses are defined, the quoted sentence notes that they usually coincide but sometimes do not, with examples. That divergence is exactly why, as the last sentence says, a report of the gene for some trait is ambiguous.",
    },
    {
      scene: "cs-varrow-towers",
      passage:
        "Archaeologist Imre Halász has argued that the stone towers scattered across the Varrow uplands formed a signaling network, passing fire beacons from the coast to the inland capital within a single night. Each tower stands on a summit, and from the top of any one of them at least two others are visible. Plotted on Halász’s maps, the towers look like links in a deliberate chain. Charcoal from the towers’ hearths, however, yields dates spread across nearly four centuries, and several towers that the chain requires were built long after their neighbors had fallen into ruin. Whatever purpose the towers served, they cannot all have been operating at the same time.",
      quoted: "Charcoal from the towers’ hearths, however, yields dates spread across nearly four centuries, and several towers that the chain requires were built long after their neighbors had fallen into ruin.",
      key: "It introduces dating evidence at odds with the idea of a single working chain.",
      wrong: [
        ["It adds evidence that each tower was placed so that at least two others could be seen from it.", "Visibility between towers is described earlier, in support of Halász; the quoted sentence turns to dating evidence that cuts against him."],
        ["It explains why the towers were built on summits rather than in the valleys below.", "The text never explains the choice of summits; the quoted sentence concerns when the towers were built."],
        ["It establishes that the towers were never used to send signals of any kind.", "The text concludes only that the towers were not all in use at once; it leaves open what purpose they served."],
      ],
      why: "Halász’s network requires the towers to work together, and the maps make them look like a chain. The quoted sentence reports hearth dates spread over four centuries, with some towers built after others were ruined, which undercuts simultaneous use; the final sentence draws that conclusion.",
    },
    {
      scene: "cs-lisle-narrators",
      passage:
        "Critics have long praised the novelist Wenna Lisle for narrators who seem to vanish into the minds of her characters, so that a reader can seldom tell where a character’s thoughts end and the narrator’s description begins. That description fits her first four novels, whose narrators almost never offer a judgment of their own, but it does not fit her last two. In ‘The Harrow Road’ and ‘Late Light,’ a narrator repeatedly steps forward to comment on the characters’ folly and even addresses the reader directly. Any account of Lisle’s style must therefore allow for a writer who changed her method late in her career.",
      quoted: "That description fits her first four novels, whose narrators almost never offer a judgment of their own, but it does not fit her last two.",
      key: "It limits the critics’ claim to part of Lisle’s career.",
      wrong: [
        ["It rejects the critics’ praise of Lisle’s narrators as unfounded.", "The sentence says the praise fits her first four novels; it restricts the claim rather than rejecting it."],
        ["It offers examples of narrators who comment openly on the characters’ folly.", "Those examples come in the following sentence, which supports the limit that the quoted sentence sets."],
        ["It explains why Lisle changed her narrative method late in her career.", "The text never gives a reason for the change; it only establishes that the change occurred."],
      ],
      why: "The critics’ praise is stated first. The quoted sentence grants that it fits the first four novels but not the last two, and the next sentence gives evidence from those two. The sentence narrows the scope of the critics’ claim.",
    },
    {
      scene: "cs-dialect-definition",
      passage:
        "A tidy definition holds that two ways of speaking are dialects of one language if their speakers can understand each other and separate languages if they cannot. The definition fits many ordinary cases, but it sorts some well-known ones badly. Speakers of Norwegian and Swedish can usually follow each other’s speech with modest effort, yet the two are counted as separate languages, while several varieties of Chinese whose speakers cannot readily understand one another are routinely called dialects. Such labels, it appears, follow political and cultural boundaries at least as closely as they follow mutual understanding. Linguists seeking a purely linguistic criterion have learned to treat them with caution.",
      quoted: "Speakers of Norwegian and Swedish can usually follow each other’s speech with modest effort, yet the two are counted as separate languages, while several varieties of Chinese whose speakers cannot readily understand one another are routinely called dialects.",
      key: "It gives cases in which the definition stated earlier conflicts with the actual labels.",
      wrong: [
        ["It gives examples that confirm the usefulness of the definition stated at the start of the text.", "These are the cases the definition sorts badly: the labels in them contradict the definition."],
        ["It explains why political boundaries influence which varieties are called languages.", "The political point is made in the next sentence, and even there it is an observation, not an explanation."],
        ["It argues that Norwegian and Swedish should be reclassified as dialects of one language.", "The text proposes no reclassification; it uses the labels to show the definition’s limits."],
      ],
      why: "The text states a definition based on mutual understanding and says it handles some cases badly. The quoted sentence supplies those cases (mutually intelligible varieties called separate languages, and unintelligible ones called dialects), so it serves as counterexamples to the definition.",
    },
    {
      scene: "cs-ambry-baptisms",
      passage:
        "Parish registers from the village of Ambry record a puzzling pattern: in the 1720s, baptisms nearly doubled, yet marriages and burials held steady, and no new houses appear on estate maps of the period. Historian Tobias Rehn resolves the puzzle by looking beyond the village. A chapel built in Ambry in 1719 was the only one within a day’s walk of several upland hamlets, and families from those hamlets began bringing their infants there to be baptized. The registers, in short, measured the reach of a chapel rather than the growth of a village. Rehn’s reading suggests that historians who count baptisms to estimate population should first ask who used the church.",
      quoted: "Parish registers from the village of Ambry record a puzzling pattern: in the 1720s, baptisms nearly doubled, yet marriages and burials held steady, and no new houses appear on estate maps of the period.",
      key: "It presents an anomaly in the records that the text then accounts for.",
      wrong: [
        ["It presents evidence that Ambry’s population grew rapidly during the 1720s.", "The text concludes that the village did not grow; the rise in baptisms reflected families from other hamlets."],
        ["It states the caution about baptism records with which the text concludes.", "That caution comes in the final sentence; the quoted sentence describes the records that prompt it."],
        ["It describes the method Rehn used to explain the rise in baptisms at Ambry.", "Rehn’s explanation begins in the next sentence; the quoted sentence sets out what needed explaining."],
      ],
      why: "The quoted sentence lays out a pattern that does not add up: baptisms doubled while marriages, burials, and houses stayed the same. The following sentences explain it (families from upland hamlets used Ambry’s new chapel). The sentence poses the puzzle that the text resolves.",
    },
    {
      scene: "cs-caching-hippocampus",
      passage:
        "Birds that store food for the winter must later find hundreds or even thousands of hidden caches, and researchers have long suspected that this demand shapes the brain. If it does, species that cache heavily should have a larger hippocampus, a brain region central to spatial memory, than related species that cache little or not at all. Comparisons across several bird families have borne out this expectation: within a family, the caching species generally have a larger hippocampus relative to body size. Because the pattern turns up independently in families that are only distantly related, it is unlikely to be a leftover of a single shared ancestor.",
      quoted: "If it does, species that cache heavily should have a larger hippocampus, a brain region central to spatial memory, than related species that cache little or not at all.",
      key: "It derives a testable prediction from the suspicion described in the sentence before it.",
      wrong: [
        ["It reports the comparative finding that supports the researchers’ suspicion.", "The finding is reported in the next sentence; the quoted sentence says what should be found if the suspicion is right."],
        ["It explains how the hippocampus enables birds to remember where they hid food.", "The sentence names the hippocampus’s general role but offers no account of how it works; its job is to state a prediction."],
        ["It rules out an alternative explanation for the link between caching and brain size.", "The alternative, shared ancestry, is addressed in the final sentence, not in the quoted one."],
      ],
      why: "The first sentence states a suspicion (caching shapes the brain). The quoted sentence turns it into a prediction (caching species should have a larger hippocampus); the next sentence reports that the prediction holds, and the last rules out shared ancestry.",
    },
    {
      scene: "cs-norby-induced-demand",
      passage:
        "When the city of Norby added a lane to its busiest highway, rush-hour delays fell for about a year and then returned to their old level. Transportation economists call this pattern induced demand. A faster road lowers the time cost of each trip, so drivers who once traveled at other hours, took other routes, or stayed home begin to use it, until congestion rises enough to discourage further trips. Widening a road, on this view, changes how many people drive more readily than it changes how long they wait. Planners who expect a new lane to end congestion may be counting on a gain that new drivers will soon absorb.",
      quoted: "A faster road lowers the time cost of each trip, so drivers who once traveled at other hours, took other routes, or stayed home begin to use it, until congestion rises enough to discourage further trips.",
      key: "It explains the process that produces the pattern named in the previous sentence.",
      wrong: [
        ["It presents evidence from Norby that confirms the economists’ account of the pattern.", "The sentence reports nothing observed in Norby; it is a general account of why the pattern occurs."],
        ["It qualifies the idea of induced demand by noting when new trips stop.", "The point at which new trips stop is part of the mechanism the sentence explains, not a restriction on the idea."],
        ["It states the conclusion about road widening that the text draws from the pattern.", "That conclusion comes in the next sentence; the quoted sentence supplies the reasoning behind it."],
      ],
      why: "The first sentence gives the Norby example and the second names the pattern. The quoted sentence explains the mechanism (lower time costs draw new trips until congestion returns), which the last two sentences then apply.",
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
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
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
      scene: "cs-orlen-wool-guild",
      passage:
        "The account books of the Orlen wool guild, kept without a break from 1410 to 1530, offer an unusually direct view of how the medieval wool trade responded to war. Whenever fighting closed the northern sea routes, the books show, the guild’s purchases of raw wool fell within a season, and its members turned instead to buying finished cloth from inland weavers, which could travel overland. The books thus record a trade that adapted quickly rather than one that simply collapsed. They are, however, the records of a single guild in a single port, and the guild’s wealth may have given it a flexibility that smaller merchants lacked.",
      key: "It makes a claim about what a source reveals, supports it with a pattern in the source, and then notes a limit on how widely the pattern applies.",
      wrong: [
        ["It argues that a set of records shows how a trade responded to war, illustrates this with a pattern in them, and then doubts that their figures are accurate.", "The final sentence doubts how far the pattern generalizes (one wealthy guild), not whether the books’ figures are accurate."],
        ["It describes a pattern in a guild’s records, notes that the guild was unusually wealthy, and then argues that all merchants adapted in the same way.", "The text raises the guild’s wealth as a reason the pattern may not hold for smaller merchants; it never claims that all merchants adapted alike."],
        ["It reports how other historians have read a set of records and then uses a pattern in the records to show that their reading is mistaken.", "The claim about what the books reveal is the author’s own; the text does not report or dispute anyone else’s reading."],
      ],
      why: "The text claims that the guild’s books show how the wool trade responded to war, supports the claim with the pattern of purchases, concludes that the trade adapted, and ends by noting that one wealthy guild may not represent smaller merchants.",
    },
    {
      scene: "cs-iversby-letters",
      passage:
        "Scholars who want to date the undated letters of the poet Maren Iversby face an obvious difficulty. Iversby almost never mentioned public events, so the usual method of matching a letter’s contents to the news of the day yields little, and her handwriting barely changed across forty years. The paper she wrote on may succeed where these approaches fail. Iversby bought her writing paper from a single stationer whose watermarks changed every few years, and the stationer’s surviving order books record when each watermark was introduced. Matching a letter’s watermark to those records could place it within a span of three or four years.",
      key: "It identifies a difficulty in dating a writer’s letters, explains why two methods fall short, and proposes a third.",
      wrong: [
        ["It sets out a problem in dating a poet’s correspondence, proposes a method based on her paper, and then explains why that method also fails.", "The paper-based method is offered as the one that may succeed; the methods that fall short are described before it."],
        ["It compares three ways of dating the letters and concludes that none of them can place a letter within a few years.", "The text says the watermark method could place a letter within three or four years; it does not reject all three methods."],
        ["It argues that handwriting is the best guide to dating the letters and then defends that view against a method based on paper.", "The text sets handwriting aside because it barely changed; it favors the watermark method instead."],
      ],
      why: "The text states a problem (the letters are undated), explains why dating by contents and by handwriting fails, and proposes a method based on watermarks and the stationer’s order books.",
    },
    {
      scene: "cs-tarric-word-order",
      passage:
        "Linguists have long disagreed about why the language Tarric shifted, over two centuries, from placing the verb first in a sentence to placing the subject first. One camp credits contact with neighboring Ossic, whose speakers put the subject first and traded heavily with Tarric communities; the other points to a change within Tarric itself, which had begun to lose the verb endings that once marked who did what to whom. Recent work suggests that the two accounts need not compete. The loss of endings made verb-first sentences increasingly ambiguous, and where Tarric speakers traded with Ossic speakers, the subject-first pattern offered a ready remedy; where contact was absent, the shift came decades later and less completely.",
      key: "It presents two competing explanations of a change in a language and argues that they work together.",
      wrong: [
        ["It sets out two rival accounts of a shift in word order and then rejects the one that depends on contact with a neighboring language.", "The text keeps the contact account: trade with Ossic speakers supplied the new pattern where endings had been lost."],
        ["It describes a change in a language, attributes it entirely to the loss of verb endings, and treats contact as a later side effect.", "The text gives contact a real role: the shift came earlier and more completely where Tarric speakers traded with Ossic speakers."],
        ["It explains how one language’s word order spread to another and then argues that the two languages eventually merged.", "The text never says the languages merged; it explains why Tarric changed its word order."],
      ],
      why: "The text opens with two rival explanations (contact with Ossic, loss of verb endings) and then argues that they combine: the lost endings created the need, and contact supplied the remedy where it existed.",
    },
    {
      scene: "cs-kelder-nest-edges",
      passage:
        "Surveys in the Kelder Hills found that songbird nests in small patches of forest failed far more often than nests deep within large forests, and ecologists at first took this as evidence that small patches are poor habitat in themselves. Cameras later placed at the nests told a different story: most failures were caused by raccoons and jays, which thrive along the boundary between forest and farmland but venture only a short way into the trees. The patches were dangerous, in other words, not because they were small but because nearly every nest in them lay close to an edge. Conservation plans that merely add small patches of woodland may therefore do less for these birds than plans that join existing forest into larger, more compact tracts.",
      key: "It reports a finding and its first interpretation, revises that interpretation in light of later evidence, and draws a practical implication.",
      wrong: [
        ["It presents a finding, confirms the original interpretation with evidence from cameras, and recommends adding small patches of woodland.", "The cameras overturned the original interpretation, and the text advises against relying on small patches."],
        ["It presents a finding about songbird nests, reinterprets it in light of new evidence, and concludes that forest size is irrelevant to conservation.", "The text still favors larger, compact tracts; it says size matters because of edges, not that size is irrelevant."],
        ["It compares two conservation plans, reports camera evidence favoring one, and then explains why the other was first proposed.", "The plans come only at the end, as an implication; the text is organized around the nest finding and its reinterpretation."],
      ],
      why: "The text reports that nests in small patches failed more often and the first reading of that finding, then uses camera evidence to reinterpret it (edges, not size), and ends with an implication for conservation plans.",
    },
    {
      scene: "cs-gettier-knowledge",
      passage:
        "Many philosophers once accepted a simple analysis of knowledge: to know something, a person must believe it, the belief must be true, and the person must be justified in holding it. In 1963 the philosopher Edmund Gettier described cases that meet all three conditions yet do not seem to count as knowledge. An older example makes the problem vivid: a person glances at a clock that has stopped but happens to show the correct time, so her belief about the hour is true and reasonably formed, yet she has been lucky rather than informed. Many philosophers responded by adding a fourth condition meant to exclude such luck, though they have disagreed ever since about how to state it.",
      key: "It sets out a definition, presents cases that the definition misclassifies, and then describes an unsettled effort to repair it.",
      wrong: [
        ["It lays out an analysis of knowledge, gives cases it handles badly, and then reports that philosophers abandoned any attempt to define knowledge.", "Philosophers responded by adding a fourth condition; the text describes a repair, not an abandonment."],
        ["It presents a puzzling case of lucky belief, proposes a definition of knowledge to explain it, and then lists objections to that definition.", "The definition comes first, and the lucky case is a counterexample to it, not something the definition was proposed to explain."],
        ["It contrasts two rival definitions of knowledge and then uses a single example to show that the older one is correct.", "The text discusses one definition and a proposed revision, and its example counts against the definition rather than for it."],
      ],
      why: "The text states the three-part analysis, presents cases (Gettier’s and the stopped clock) that satisfy it without being knowledge, and ends with the response of adding a fourth condition, whose wording is still disputed.",
    },
    {
      scene: "cs-faint-young-sun",
      passage:
        "Models of how stars age indicate that the young Sun shone about 30 percent less brightly than it does today, too faintly, by simple calculation, to keep Earth’s oceans from freezing. Yet rocks more than three billion years old record flowing water. Most researchers resolve this puzzle by giving the early atmosphere a stronger greenhouse effect than today’s. Carbon dioxide alone seems not to have been enough, however: ancient soils lack minerals that would have formed under the very high levels the calculations require. Many researchers therefore suspect that methane, produced by early microbes, supplied much of the missing warmth.",
      key: "It poses a puzzle, names the kind of solution most researchers accept, and then uses evidence to narrow which version of it is plausible.",
      wrong: [
        ["It raises a puzzle about the early Earth, notes a widely accepted solution, and then cites evidence that rules out any greenhouse explanation.", "The evidence rules out only a version that relies on carbon dioxide alone; the text still favors a greenhouse explanation involving methane."],
        ["It describes evidence of water on the early Earth and then explains why the young Sun was dimmer than it is today.", "The Sun’s dimness is the starting premise, not something the text explains, and the text goes on to weigh solutions to the puzzle."],
        ["It presents two rival solutions to a puzzle, carbon dioxide and methane, and then concludes that the evidence supports neither.", "The text presents methane as the likelier source of the missing warmth; it does not reject both."],
      ],
      why: "The text sets up a puzzle (a dim young Sun but liquid water), names the accepted kind of solution (a stronger greenhouse effect), and then uses soil evidence to rule out a carbon-dioxide-only version in favor of methane.",
    },
    {
      scene: "cs-vane-weir-poem",
      passage:
        "Readers of Tobias Vane’s poem ‘The Weir’ have generally taken its closing image, a river held motionless behind a dam, as a figure for grief that cannot move forward. The reading is natural, but it passes over the poem’s middle stanzas, in which the speaker watches the weir’s builders at work and admires the patience that lets a valley store water against a dry summer. Read with those stanzas in mind, the still water looks less like paralysis than like provision: something held back on purpose, to be drawn on later. The poem, on this account, is less an elegy than a meditation on how people store up feeling, as they store water, for harder times.",
      key: "It describes a common reading of a poem, points to passages the reading overlooks, and offers an alternative that accounts for them.",
      wrong: [
        ["It summarizes a familiar interpretation of a poem, notes passages the interpretation neglects, and concludes that the poem resists any confident reading.", "The text does reach a confident alternative: the poem is a meditation on storing up feeling."],
        ["It proposes a new reading of a poem, reports that other readers have rejected it, and then defends it by appealing to the poem’s final image.", "The reading attributed to other readers is the older one about grief; the text’s new reading rests on the middle stanzas."],
        ["It traces how the poet revised a poem over time and then argues that its final image is weaker than those in earlier versions.", "The text says nothing about drafts or revisions; it compares two readings of the finished poem."],
      ],
      why: "The text reports the usual reading of the poem’s final image (grief), points to the middle stanzas that reading ignores, and offers a new reading built on them (provision, stored feeling).",
    },
    {
      scene: "cs-price-exceptions",
      passage:
        "Economists generally expect that when the price of a good rises, people will buy less of it. Two kinds of exception have long intrigued them. For some very poor households, a rise in the price of a cheap staple such as rice can increase purchases of it: the higher price leaves too little money for costlier foods, so the family fills the gap with still more rice. For certain luxury goods, by contrast, a higher price can make the good more desirable, because part of what buyers want is to be seen paying a great deal. Neither case overturns the general expectation; each depends on circumstances, extreme poverty or the pursuit of status, that ordinary purchases rarely involve.",
      key: "It states a general expectation, describes two exceptions, and explains why they leave it standing.",
      wrong: [
        ["It sets out a general expectation about prices, describes two cases that violate it, and then concludes that the expectation should be abandoned.", "The final sentence says neither case overturns the expectation, since both depend on rare circumstances."],
        ["It describes two unusual kinds of purchases, explains the cause they share, and then derives a general rule about prices from them.", "The general rule comes first, and the two exceptions have different causes (poverty and status), not a shared one."],
        ["It contrasts how poor and wealthy households respond to prices and then argues that the poor are more sensitive to changes in price.", "The text never compares how sensitive the two groups are; it treats each case as an exception to a general expectation."],
      ],
      why: "The text states the general expectation (higher price, less bought), describes two exceptions (a staple for very poor households, luxury goods), and concludes that both depend on unusual circumstances, so the expectation stands.",
    },
    {
      scene: "cs-semmelweis-clinics",
      passage:
        "In the 1840s, the Vienna General Hospital ran two maternity clinics, and mothers in the clinic staffed by physicians and medical students died of fever far more often than mothers in the clinic staffed by midwives. The physician Ignaz Semmelweis noticed that the students often came to deliveries directly from dissecting corpses, and he suspected that they carried some contaminating matter on their hands. After he required them to wash in a chlorinated lime solution, deaths in their clinic fell sharply. Yet many of his colleagues rejected his conclusion, in part because he could offer no account of what the contaminating matter was or how it caused disease. A correct practice, the episode suggests, may win acceptance only when a theory arrives to explain it.",
      key: "It recounts a puzzling difference, a hypothesis, and a successful test, then draws a lesson from the cool reception the hypothesis met.",
      wrong: [
        ["It narrates a puzzling difference and a hypothesis about its cause, then reports that a test failed to support the hypothesis.", "The handwashing test succeeded (deaths fell sharply); the hypothesis was resisted despite that result."],
        ["It presents a theory of how disease spreads and then describes how the physician’s colleagues designed an experiment to refute it.", "Semmelweis’s difficulty was precisely that he lacked a theory, and the text describes no experiment by his colleagues."],
        ["It describes a successful change in hospital practice, explains the theory behind it, and shows how quickly it spread through Europe.", "The text stresses that the practice was resisted and that no explanatory theory was available at the time."],
      ],
      why: "The text describes the difference between the two clinics, Semmelweis’s hypothesis, and the handwashing test that cut deaths, then explains why colleagues rejected his conclusion and draws a general lesson from that rejection.",
    },
    {
      scene: "cs-vell-glassworks",
      passage:
        "In her study of the glassworks of Vell, economic historian Rosa Adler argues that the industry gathered there because of nearby deposits of unusually pure sand. The deposits were real and prized. But they were exhausted by 1820, and the town’s glassworks went on multiplying for another century, bringing in sand by rail. Adler’s account explains why glassmakers first came to Vell; it cannot explain why they stayed. A likelier answer lies in what the first workshops left behind: a pool of skilled glassblowers, suppliers of molds and furnaces, and buyers who knew where to find them, advantages that no new site could offer.",
      key: "It presents a scholar’s explanation, shows that it accounts for only part of what needs explaining, and proposes an explanation for the rest.",
      wrong: [
        ["It sets out a historian’s account of an industry, shows its limits, and then declares that the industry’s persistence cannot be explained.", "The text does explain the persistence: the skilled workers, suppliers, and buyers that the first workshops left behind."],
        ["It lays out a historian’s explanation, confirms it with evidence about rail shipments, and then applies it to other industries.", "The rail shipments count against Adler’s account (sand was brought in after the local deposits ran out), and no other industries are discussed."],
        ["It proposes that skilled workers drew glassmaking to Vell and then reports a historian’s objection based on the local sand.", "The sand explanation is Adler’s and comes first; the skilled-workforce explanation is the author’s response to it."],
      ],
      why: "The text reports Adler’s explanation (pure sand), shows that it explains the industry’s arrival but not its persistence after the sand ran out, and offers the author’s own explanation for why the glassmakers stayed.",
    },
    {
      scene: "cs-atlantic-cable-1858",
      passage:
        "In August 1858, the first telegraph cable across the Atlantic carried a message of greeting from Queen Victoria to President James Buchanan, though sending its ninety-eight words took many hours. Within weeks the cable fell silent. Its chief electrician, Wildman Whitehouse, had tried to force signals through faster by applying very high voltages, a practice generally thought to have ruined the cable’s already imperfect insulation. When a new cable was laid in 1866, its engineers instead followed the physicist William Thomson in using low voltages and an extremely sensitive receiver. That cable worked, and it carried messages for years.",
      key: "It recounts an early achievement, attributes its quick failure to a method used on it, and then describes a later success that relied on a different method.",
      wrong: [
        ["It traces an early achievement and its quick failure, then shows that the same method, applied more carefully, succeeded in 1866.", "The 1866 cable succeeded with a different method: low voltages and a sensitive receiver, the opposite of Whitehouse’s approach."],
        ["It describes a dispute between two engineers and then shows that the 1858 cable’s brief success proved Whitehouse right.", "The text blames Whitehouse’s high voltages for the failure; nothing in it vindicates his approach."],
        ["It describes the 1866 cable’s success and then looks back to explain why earlier attempts had failed.", "The text proceeds in chronological order, from 1858 to 1866; it does not begin with the later success."],
      ],
      why: "The text recounts the 1858 cable’s achievement, attributes its failure within weeks to Whitehouse’s high voltages, and ends with the 1866 cable, which succeeded by following Thomson’s low-voltage method.",
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
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
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
  ];
});
