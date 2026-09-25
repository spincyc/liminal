(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/reading-writing/standard-english-conventions"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Boundaries templates (Standard English Conventions). Each family is one
  // question design paired with its own bank of topics; every topic is one
  // scene. The families parse the separator out of each rendered choice and
  // judge it against the kind of unit on each side of the blank.

  const { STEM, BLANK, DOMAIN } = C;

  /* ------------------------------------------------------------- helpers */

  const SKILL = "Boundaries";

  const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Splits a passage at its one blank.
  function around(passage) {
    const index = passage.indexOf(BLANK);
    if (index < 0 || passage.indexOf(BLANK, index + 1) >= 0) return null;
    return { before: passage.slice(0, index), after: passage.slice(index + BLANK.length) };
  }

  // The sentence that holds the blank, up to the blank.
  function sentenceLead(before) {
    const parts = before.split(/(?<=[.!?])\s+(?=[A-Z“"])/);
    return parts[parts.length - 1];
  }

  // The rest of the blank's sentence after the blank.
  function sentenceTail(after) {
    const match = after.match(/^[\s\S]*?[.!?](?=\s|$)/);
    return match ? match[0] : after;
  }

  // What a choice puts between two fixed words: between("water; it", "water", "it") -> ";".
  function between(choice, left, right) {
    if (!choice.startsWith(left)) return null;
    const rest = choice.slice(left.length);
    if (rest.length < right.length) return null;
    const tail = rest.slice(rest.length - right.length);
    if (tail.toLowerCase() !== right.toLowerCase()) return null;
    return rest.slice(0, rest.length - right.length).trim();
  }

  const firstWord = (text) => (text.trim().split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "");

  const SUBORDINATORS = [
    "although", "because", "when", "after", "since", "while", "before", "once", "if", "unless",
    "though", "whereas", "until", "as",
  ];
  const COORDINATORS = ["and", "but", "or", "nor", "for", "so", "yet"];
  const CONJ_ADVERBS = [
    "however", "nevertheless", "consequently", "as a result", "moreover", "furthermore", "in fact",
    "instead", "meanwhile", "in contrast", "for example", "for instance", "similarly",
  ];
  // Words that a list or object completes directly; nothing may separate them.
  const GOVERNORS = [
    "includes", "included", "including", "such as", "like", "were", "are", "consists of", "contain",
    "contains", "featured", "found", "replaced", "required", "named",
  ];
  const NUMBER_WORDS = { 2: "two", 3: "three", 4: "four" };

  // What standard conventions allow between two units, by the kind of unit on
  // each side. verify() applies these to the separator parsed out of each
  // rendered choice, independently of how build() assembled the key.
  const JOIN = {
    independentIndependent: (mark) => mark === ";" || mark === "." || /^, (and|but|or|nor|for|so|yet)$/.test(mark),
    dependentIndependent: (mark) => mark === ",",
    clauseList: (mark) => mark === ":" || mark === "—",
    governorObject: (mark) => mark === "",
    seriesWithCommas: (mark) => mark === ";",
  };

  // True when the key passes `legal` and every distractor fails it.
  const onlyKey = (choices, legal) => legal(choices[0]) && choices.slice(1).every((choice) => !legal(choice));

  // Explanatory text is written with straight quotes for readability here
  // and shown with the curly quotes the rest of the bank uses.
  const curly = (text) => String(text).replace(/"([^"]*)"/g, "“$1”");
  const multipleChoice = (topic, passage, correct, wrong, rest) => Object.assign({
    responseType: "multiple-choice",
    scene: topic.scene,
    stimulus: { type: "text", content: passage },
    stem: STEM,
    correct,
  }, rest, {
    wrong: wrong.map(([value, reason]) => [value, curly(reason)]),
    explanation: curly(rest.explanation),
    steps: rest.steps.map(curly),
    principles: rest.principles.map(curly),
    trap: curly(rest.trap),
    hint: curly(rest.hint),
  });

  /* ------------------------------------------------ B1: two independent clauses */

  // Each topic: two independent clauses with nothing joining them. The blank
  // holds the last word of the first (w1) and the first word of the second
  // (w2); c1 and c2 are each clause's subject and verb as they appear.
  const JOIN_CLAUSE_TOPICS = [
    {
      scene: "sec-cahokia-mounds",
      text: "Around 1100 CE, Cahokia, near present-day St. Louis, was the largest city in North America north of Mexico. Its central earthwork, Monks Mound, rises about thirty meters above the surrounding ______ base covers more ground than that of the Great Pyramid of Giza.",
      w1: "plain", w2: "its", mark: ";", c1: ["Monks Mound", "rises"], c2: ["base", "covers"],
    },
    {
      scene: "sec-stride-piano",
      text: "Stride piano flourished in Harlem during the 1920s. A stride pianist's left hand leaps back and forth between a low bass note and a chord near the middle of the ______ right hand plays the melody above that steady, bouncing pulse.",
      w1: "keyboard", w2: "the", mark: ".", c1: ["left hand", "leaps"], c2: ["right hand", "plays"],
    },
    {
      scene: "sec-theremin-hands",
      text: "The theremin, invented by the Russian physicist Leon Theremin around 1920, is played without being touched. The player's right hand moves toward and away from a vertical ______ distance between that hand and the antenna controls the pitch.",
      w1: "antenna", w2: "the", mark: ".", c1: ["right hand", "moves"], c2: ["distance", "controls"],
    },
    {
      scene: "sec-naked-mole-rats",
      text: "Naked mole-rats live in underground colonies in East Africa, organized much like colonies of bees or ants. A single queen gives birth to all of the colony's ______ other members dig tunnels, gather roots to eat, and defend the nest.",
      w1: "young", w2: "the", mark: ";", c1: ["queen", "gives"], c2: ["members", "dig"],
    },
    {
      scene: "sec-seoul-renters",
      text: "Economist Park Hyun-woo surveyed 1,500 renters in Seoul about how they chose where to live. Most renters ranked a short commute above every other ______ than one in ten listed the size of the apartment first.",
      w1: "factor", w2: "fewer", mark: ".", c1: ["Most renters", "ranked"], c2: ["one in ten", "listed"],
    },
    {
      scene: "sec-urushi-lacquer",
      text: "Traditional Japanese lacquerware can take months to finish. A craftsperson brushes a thin coat of lacquer onto a carved wooden ______ coat must then harden in a warm, humid cabinet for a day or more before the next one goes on.",
      w1: "bowl", w2: "each", mark: ";", c1: ["craftsperson", "brushes"], c2: ["coat", "must then harden"],
    },
    {
      scene: "sec-wood-fired-stoneware",
      text: "The ceramicist Tomasz Wierzba fires his stoneware in a wood-burning kiln for four days at a time. Ash from the burning wood settles on the pots and melts in the intense ______ glaze that forms is different on every piece.",
      w1: "heat", w2: "the", mark: ".", c1: ["Ash", "settles"], c2: ["glaze", "is"],
    },
    {
      scene: "sec-monarch-roosts",
      text: "Each autumn, monarch butterflies from eastern North America fly thousands of kilometers to fir forests in the mountains of central Mexico. Millions of butterflies may cluster in a single ______ weight of so many insects can bend the branches toward the ground.",
      w1: "grove", w2: "the", mark: ";", c1: ["Millions", "may cluster"], c2: ["weight", "can bend"],
    },
    {
      scene: "sec-vendor-loans",
      text: "Economist Beatriz Llamas studied a program that offered small loans to street vendors in Lima, Peru. Vendors who received the loans did not earn much more than other ______ did report feeling more secure during weeks when sales were slow.",
      w1: "vendors", w2: "they", mark: ";", c1: ["Vendors", "did not earn"], c2: ["they", "did report"],
    },
    {
      scene: "sec-fog-nets",
      text: "In parts of Chile's coastal desert, rain almost never falls, but thick fog rolls in from the Pacific on many mornings. Villagers stretch fine plastic nets across the ______ of fog collect on the mesh and drip into troughs below.",
      w1: "hillsides", w2: "droplets", mark: ".", c1: ["Villagers", "stretch"], c2: ["droplets", "collect"],
    },
    {
      scene: "sec-sign-language-dance",
      text: "Choreographer Lena Okonjo builds her dances from the handshapes of American Sign Language. In her piece Common Ground, dancers repeat a single sign until it grows into a large, sweeping ______ Deaf audience members often recognize the original word long before hearing viewers do.",
      w1: "motion", w2: "many", mark: ";", c1: ["dancers", "repeat"], c2: ["Deaf audience members", "recognize"],
    },
    {
      scene: "sec-caravanserai",
      text: "Along the trade routes of medieval Persia, merchants stopped each night at walled inns called caravanserais. Camels and horses were kept in the open central ______ slept in small rooms that lined the surrounding walls.",
      w1: "courtyard", w2: "travelers", mark: ";", c1: ["Camels and horses", "were kept"], c2: ["travelers", "slept"],
    },
  ];

  const joinIndependentClauses = {
    id: "sec-join-independent-clauses",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Easy",
    title: "Separating two independent clauses",
    recognize:
      "Both sides of the blank can stand alone as sentences and nothing joins them, so only a semicolon or a period works.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["comma-splice"],
    build(t) {
      const topic = t.pick(JOIN_CLAUSE_TOPICS);
      const { w1, w2 } = topic;
      const passage = topic.text;
      const key = topic.mark === "." ? `${w1}. ${cap(w2)}` : `${w1}; ${w2}`;
      const comma = `${w1}, ${w2}`;
      const fused = `${w1} ${w2}`;
      const bareAnd = `${w1} and ${w2}`;
      const parts = around(passage);
      const first = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      const second = parts ? `${w2}${sentenceTail(parts.after)}`.replace(/[.]$/, "") : "";
      const markName = topic.mark === "." ? "period" : "semicolon";
      return multipleChoice(topic, passage, key, [
        [comma, `A comma alone cannot join two independent clauses; "${comma}" creates a comma splice.`],
        [fused, `With no punctuation at all, "${fused}" runs two independent clauses together.`],
        [bareAnd, `When "and" joins two independent clauses, a comma must come before it; "${bareAnd}" leaves the comma out.`],
      ], {
        explanation:
          `"${first}" and "${second}" are both independent clauses: each has its own subject and verb (${topic.c1[0]} ${topic.c1[1]}; ${topic.c2[0]} ${topic.c2[1]}). With no conjunction between them, they must be separated by a ${markName}: "${key}".`,
        steps: [
          "Find the subject and verb before the blank and the subject and verb after it.",
          "Both sides could stand alone as sentences, so the blank sits between two independent clauses.",
          "Choose the choice that separates them with a semicolon or a period.",
        ],
        principles: [
          "Two independent clauses can be joined by a semicolon, separated by a period, or joined by a comma followed by a coordinating conjunction such as and or but.",
          "A comma alone between two independent clauses is a comma splice.",
        ],
        trap: "Choosing the comma because the two clauses are closely related; a comma alone cannot join them however closely related they are.",
        hint: "Check whether the words on each side of the blank could each stand alone as a sentence.",
        estimatedSeconds: 50,
        verify: () => {
          if (!parts) return false;
          const lead = sentenceLead(parts.before);
          const tail = `${w2}${sentenceTail(parts.after)}`;
          const clauses = lead.includes(topic.c1[0]) && lead.includes(topic.c1[1]) &&
            tail.includes(topic.c2[0]) && tail.includes(topic.c2[1]);
          const unjoined = !SUBORDINATORS.includes(firstWord(lead)) &&
            !SUBORDINATORS.includes(w2.toLowerCase()) && !COORDINATORS.includes(w2.toLowerCase());
          const legal = (choice) => {
            const mark = between(choice, w1, w2);
            if (mark === null || !JOIN.independentIndependent(mark)) return false;
            return mark !== "." || choice.endsWith(cap(w2));
          };
          return clauses && unjoined && onlyKey([key, comma, fused, bareAnd], legal);
        },
      });
    },
  };

  /* ------------------------------------------------ B2: colon before a list */

  // Each topic: a complete clause announcing `count` things (ending in w1),
  // then the list, whose first word is w2.
  const COLON_LIST_TOPICS = [
    {
      scene: "sec-kalaat-rug-dyes",
      text: "Weavers in the mountain village of Kalaat still color their wool with plant dyes, just as their grandparents did. Their rugs use only two ______ from madder root and blue from indigo.",
      w1: "dyes", w2: "red", count: 2, clause: ["rugs", "use"],
    },
    {
      scene: "sec-roman-harbor-concrete",
      text: "Roman engineers built harbor walls from a concrete that has survived in seawater for two thousand years. Their mixture combined three main dry ______, volcanic ash, and chunks of volcanic rock.",
      w1: "ingredients", w2: "lime", count: 3, clause: ["mixture", "combined"],
    },
    {
      scene: "sec-ferrand-trio-album",
      text: "The pianist Odile Ferrand wanted listeners to hear each instrument on her 1962 album clearly, so she kept the group small. The recording features only three ______, a bassist, and a drummer.",
      w1: "musicians", w2: "Ferrand", count: 3, clause: ["recording", "features"],
    },
    {
      scene: "sec-hanok-materials",
      text: "Traditional Korean houses called hanok were designed to stay cool in summer and warm in winter. Their builders relied on three natural ______, stone, and clay mixed with straw.",
      w1: "materials", w2: "wood", count: 3, clause: ["builders", "relied"],
    },
    {
      scene: "sec-phoenix-heat-blocks",
      text: "In 2022, urban planner Tariq Mansour mapped summer temperatures block by block across Phoenix, Arizona. The hottest blocks shared two ______ asphalt parking lots and almost no tree cover.",
      w1: "features", w2: "large", count: 2, clause: ["blocks", "shared"],
    },
    {
      scene: "sec-noh-hayashi",
      text: "Noh, a form of Japanese theater that dates to the fourteenth century, is accompanied by a small ensemble called the hayashi. The ensemble uses up to four ______ flute, a shoulder drum, a hip drum, and a stick drum.",
      w1: "instruments", w2: "a", count: 4, clause: ["ensemble", "uses"],
    },
    {
      scene: "sec-huila-coffee-changes",
      text: "Agronomist Lucía Beltrán asked coffee farmers in Colombia's Huila region how they were adapting to rising temperatures. Most farmers described the same three ______ shade trees, switching to hardier varieties, and moving their plots to higher ground.",
      w1: "changes", w2: "planting", count: 3, clause: ["farmers", "described"],
    },
    {
      scene: "sec-cape-rook-banding",
      text: "Every bird caught at the Cape Rook banding station is measured before it is released. Volunteers record three details about each ______ weight, the length of its wing, and the amount of fat visible under its skin.",
      w1: "bird", w2: "its", count: 3, clause: ["Volunteers", "record"],
    },
    {
      scene: "sec-harlow-bus-survey",
      text: "Before redesigning its bus network, the town of Harlow surveyed two thousand riders about what they wanted most. Riders ranked two improvements far above all ______ frequent buses and shelters at every stop.",
      w1: "others", w2: "more", count: 2, clause: ["Riders", "ranked"],
    },
    {
      scene: "sec-lost-wax-casting",
      text: "Bronze sculptors have used the lost-wax method for more than five thousand years. Sculptor Amara Diallo describes her version of the process in four ______ a wax model, coating it in clay, melting the wax out in a kiln, and pouring molten bronze into the hollow.",
      w1: "steps", w2: "carving", count: 4, clause: ["Amara Diallo", "describes"],
    },
    {
      scene: "sec-whistled-languages",
      text: "Whistled languages let speakers communicate across valleys where shouting would not carry. Linguist Pablo Serrano has recorded whistled speech in three ______ Canary Island of La Gomera, the Turkish village of Kuşköy, and the mountains of Oaxaca in Mexico.",
      w1: "places", w2: "the", count: 3, clause: ["Pablo Serrano", "has recorded"],
    },
    {
      scene: "sec-oregon-tide-pools",
      text: "Marine biologist Hana Kekumu counted animals in tide pools along the Oregon coast every summer for a decade. Her study focused on two ______ ochre sea star and the black oystercatcher.",
      w1: "predators", w2: "the", count: 2, clause: ["study", "focused"],
    },
  ];

  const colonBeforeList = {
    id: "sec-colon-before-list",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Easy",
    title: "Colon introducing an announced list",
    recognize:
      "A complete clause announces a number of things and the list follows; a colon introduces it.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule"],
    build(t) {
      const topic = t.pick(COLON_LIST_TOPICS);
      const { w1, w2 } = topic;
      const passage = topic.text;
      const key = `${w1}: ${w2}`;
      const semicolon = `${w1}; ${w2}`;
      const period = `${w1}. ${cap(w2)}`;
      const none = `${w1} ${w2}`;
      const parts = around(passage);
      const clause = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      const countWord = NUMBER_WORDS[topic.count];
      return multipleChoice(topic, passage, key, [
        [semicolon, `A semicolon must separate two independent clauses, but the list after "${w1}" is not a clause.`],
        [period, `A period would leave the list beginning "${cap(w2)}" as a fragment with no subject or verb.`],
        [none, `Without punctuation, the list runs straight into the clause, as if "${none}" were a single phrase.`],
      ], {
        explanation:
          `"${clause}" is a complete independent clause that promises a list of ${countWord} items, and the words after the blank supply them. A colon introduces a list that follows a complete clause: "${key}".`,
        steps: [
          "Read the words before the blank and check that they form a complete sentence on their own.",
          "Notice that the clause announces a number of things and the words after the blank list exactly those things.",
          "Choose the colon, which introduces a list after a complete clause.",
        ],
        principles: [
          "A colon can introduce a list, an example, or an explanation, but only after an independent clause.",
          "A semicolon needs an independent clause on both sides, so it cannot introduce a list.",
        ],
        trap: "Choosing the semicolon because it looks like a stronger comma; a semicolon never introduces a list.",
        hint: "Is the part after the blank a clause of its own, or the items that the clause before it promised?",
        estimatedSeconds: 50,
        verify: () => {
          if (!parts) return false;
          const lead = sentenceLead(parts.before);
          const list = `${w2}${sentenceTail(parts.after)}`.trim().replace(/[.]$/, "");
          const items = list.includes(",") ? list.split(/,\s*(?:and\s+)?/) : list.split(/\s+and\s+/);
          const announced = new RegExp(`\\b${countWord}\\b`).test(lead);
          const complete = lead.includes(topic.clause[0]) && lead.includes(topic.clause[1]) &&
            !GOVERNORS.includes(w1.toLowerCase());
          const legal = (choice) => {
            const mark = between(choice, w1, w2);
            return mark !== null && JOIN.clauseList(mark);
          };
          return items.length === topic.count && announced && complete &&
            onlyKey([key, semicolon, period, none], legal);
        },
      });
    },
  };

  /* ------------------------------------------ B3: introductory dependent clause */

  // Each topic: a sentence opening with the subordinator `sub`; the
  // introductory clause ends with w1 and the main clause begins with w2.
  const INTRO_CLAUSE_TOPICS = [
    {
      scene: "sec-homing-pigeons",
      text: "Homing pigeons can find their way back to their lofts from hundreds of kilometers away. When the sky is ______ birds appear to steer by the position of the sun, but on overcast days they seem to rely on Earth's magnetic field.",
      sub: "When", w1: "clear", w2: "the", main: ["birds", "appear"],
    },
    {
      scene: "sec-great-zimbabwe",
      text: "Great Zimbabwe, a city of stone in southern Africa, was the center of a wealthy trading state from the eleventh to the fifteenth century. Although its builders used no ______ granite walls of its Great Enclosure still stand as high as eleven meters.",
      sub: "Although", w1: "mortar", w2: "the", main: ["walls", "stand"],
    },
    {
      scene: "sec-tanaka-half-speed",
      text: "Violinist Mei Tanaka learns every new concerto slowly, practicing it at half speed for several weeks. Once she can play each passage cleanly at that ______ raises the tempo a little each day until she reaches full speed.",
      sub: "Once", w1: "pace", w2: "she", main: ["she", "raises"],
    },
    {
      scene: "sec-mailed-ballots",
      text: "Political scientist Aaron Feld compared voter turnout in towns that mailed ballots to every resident with turnout in towns that did not. Because the mailed-ballot towns were also wealthier on ______ cautions against crediting the ballots alone for their higher turnout.",
      sub: "Because", w1: "average", w2: "Feld", main: ["Feld", "cautions"],
    },
    {
      scene: "sec-transcontinental-railroad",
      text: "The first railroad to cross the United States was completed in May 1869 at Promontory Summit, Utah. Before the line ______ trip from New York to San Francisco could take months by wagon or by ship.",
      sub: "Before", w1: "opened", w2: "the", main: ["trip", "could take"],
    },
    {
      scene: "sec-great-wave-print",
      text: "Katsushika Hokusai's The Great Wave off Kanagawa was published as a woodblock print around 1831. Because a carved woodblock could be inked and pressed onto paper many ______ print was sold in large numbers at a modest price.",
      sub: "Because", w1: "times", w2: "the", main: ["print", "was sold"],
    },
    {
      scene: "sec-linwood-rain-gardens",
      text: "The city of Linwood pays homeowners to replace part of their lawns with rain gardens planted with native grasses. Unless a garden covers at least ten square ______ city will not pay for it.",
      sub: "Unless", w1: "meters", w2: "the", main: ["city", "will not pay"],
    },
    {
      scene: "sec-teen-museum-guides",
      text: "The Cárdenas Museum trains high school students to lead tours of its galleries on weekends. Since the program began in ______ number of teenagers visiting the museum has more than doubled.",
      sub: "Since", w1: "2016", w2: "the", main: ["number", "has more than doubled"],
    },
    {
      scene: "sec-okapi",
      text: "The okapi, a forest relative of the giraffe, lives only in the rainforests of the Democratic Republic of the Congo. Although European scientists heard reports of the animal for ______ did not formally describe it until 1901.",
      sub: "Although", w1: "years", w2: "they", main: ["they", "did not formally describe"],
    },
    {
      scene: "sec-lowe-drafts",
      text: "The poet Idris Lowe kept every draft of his poems in labeled folders, which his family later donated to a library in Cardiff. When scholars compared the drafts of his best-known ______ found that he had rewritten its final line more than thirty times.",
      sub: "When", w1: "poem", w2: "they", main: ["they", "found"],
    },
    {
      scene: "sec-bridge-expansion",
      text: "Engineers attached sensors to a steel bridge in Minneapolis to record how it responds to changes in temperature. As the air warms each ______ steel deck expands by several centimeters.",
      sub: "As", w1: "afternoon", w2: "the", main: ["deck", "expands"],
    },
    {
      scene: "sec-herbarium-seeds",
      text: "Botanist Esther Oduya tried to germinate seeds taken from dried plant specimens collected in the 1870s. Although most of the seeds failed to ______ species produced healthy seedlings.",
      sub: "Although", w1: "sprout", w2: "three", main: ["species", "produced"],
    },
  ];

  const introClauseComma = {
    id: "sec-intro-clause-comma",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Easy",
    title: "Comma after an introductory dependent clause",
    recognize:
      "The sentence opens with a subordinating word, so the first part is dependent and joins the main clause with a comma.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule"],
    build(t) {
      const topic = t.pick(INTRO_CLAUSE_TOPICS);
      const { w1, w2, sub } = topic;
      const passage = topic.text;
      const key = `${w1}, ${w2}`;
      const semicolon = `${w1}; ${w2}`;
      const period = `${w1}. ${cap(w2)}`;
      const colon = `${w1}: ${w2}`;
      const parts = around(passage);
      const intro = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      return multipleChoice(topic, passage, key, [
        [semicolon, `A semicolon must join two independent clauses, but the clause beginning "${sub}" is dependent.`],
        [period, `A period would leave "${intro}" standing alone as a fragment.`],
        [colon, `A colon must follow an independent clause, and the clause beginning "${sub}" cannot stand alone.`],
      ], {
        explanation:
          `Because it begins with "${sub}", the clause "${intro}" is dependent: it cannot stand alone. A dependent clause that opens a sentence is joined to the main clause, whose subject and verb are "${topic.main[0]}" and "${topic.main[1]}", with a comma: "${key}".`,
        steps: [
          "Look at the first word of the sentence that contains the blank.",
          `A subordinating word such as "${sub.toLowerCase()}" makes the first part a dependent clause.`,
          "Join the dependent clause to the main clause with a comma.",
        ],
        principles: [
          "An introductory dependent clause is followed by a comma, not a semicolon, colon, or period.",
          "Semicolons and colons must follow an independent clause.",
        ],
        trap: "Seeing a subject and verb on each side and treating the sentence as two independent clauses, which leads to the semicolon or period.",
        hint: "Reread the first word of the sentence. Could the part before the blank stand alone?",
        estimatedSeconds: 50,
        verify: () => {
          if (!parts) return false;
          const lead = sentenceLead(parts.before);
          const tail = `${w2}${sentenceTail(parts.after)}`;
          const dependent = firstWord(lead) === sub.toLowerCase() && SUBORDINATORS.includes(firstWord(lead));
          const main = tail.includes(topic.main[0]) && tail.includes(topic.main[1]);
          const legal = (choice) => {
            const mark = between(choice, w1, w2);
            return mark !== null && JOIN.dependentIndependent(mark);
          };
          return dependent && main && onlyKey([key, semicolon, period, colon], legal);
        },
      });
    },
  };

  /* ------------------------------------------ B4: conjunctive adverb between clauses */

  // Each topic: two independent clauses; the second opens with the transition
  // `adv`. w1 ends the first clause; c1 and c2 are subject and verb of each.
  const ADVERB_JOIN_TOPICS = [
    {
      scene: "sec-lowland-pikas",
      text: "American pikas, small relatives of rabbits, can overheat after a few hours in warm air. Ecologist Dana Whitcomb expected pikas to vanish from low-elevation slopes in Nevada as summers grew ______ she found thriving colonies living among cool, ice-filled piles of rock well below the predicted limit.",
      w1: "hotter", adv: "however", c1: ["Dana Whitcomb", "expected"], c2: ["she", "found"],
    },
    {
      scene: "sec-panama-canal-locks",
      text: "Ships crossing Panama must pass over land that rises well above sea level at the continental ______ the canal uses sets of locks to lift vessels about 26 meters up to Gatun Lake and lower them again on the other side.",
      w1: "divide", adv: "consequently", c1: ["Ships", "must pass"], c2: ["the canal", "uses"],
    },
    {
      scene: "sec-serial-novel",
      text: "Novelist Adaeze Nwosu first published The Salt Road in weekly installments in a Lagos ______ each chapter ends with an unresolved question meant to bring readers back the following week.",
      w1: "newspaper", adv: "as a result", c1: ["Adaeze Nwosu", "published"], c2: ["each chapter", "ends"],
    },
    {
      scene: "sec-bilingual-switching",
      text: "Psychologist Marco Ricci tested whether bilingual children switch between tasks more quickly than children who speak one language. Several earlier studies had reported a large advantage for bilingual ______ Ricci's much larger study found only a small difference between the two groups.",
      w1: "children", adv: "in contrast", c1: ["studies", "had reported"], c2: ["study", "found"],
    },
    {
      scene: "sec-norwood-street-trees",
      text: "Between 2010 and 2020, the city of Norwood planted ten thousand trees along its streets. The trees shade sidewalks and cool the air around ______ they absorb rainwater that would otherwise overwhelm storm drains.",
      w1: "them", adv: "moreover", c1: ["The trees", "shade"], c2: ["they", "absorb"],
    },
    {
      scene: "sec-castell-pigments",
      text: "The painter Rhea Castell refuses to buy tubes of prepared ______ she grinds her own pigments from minerals she collects on hikes near her studio in New Mexico.",
      w1: "paint", adv: "instead", c1: ["Rhea Castell", "refuses"], c2: ["she", "grinds"],
    },
    {
      scene: "sec-kakapo-breeding",
      text: "The kakapo, a flightless parrot found only in New Zealand, breeds only in years when rimu trees produce heavy crops of ______ the birds may go two to four years without nesting at all.",
      w1: "fruit", adv: "as a result", c1: ["kakapo", "breeds"], c2: ["the birds", "may go"],
    },
    {
      scene: "sec-ohio-farm-diaries",
      text: "Historian Paul Ashby hoped that nineteenth-century diaries would reveal how Ohio farm families divided household ______ the diaries he found recorded the weather and crop prices far more often than daily chores.",
      w1: "work", adv: "however", c1: ["Paul Ashby", "hoped"], c2: ["the diaries", "recorded"],
    },
    {
      scene: "sec-octopus-escapes",
      text: "Octopuses can solve surprisingly complex problems. In aquarium experiments, several have learned to unscrew the lids of glass ______ a few have escaped their tanks at night to raid neighboring ones for food.",
      w1: "jars", adv: "in fact", c1: ["several", "have learned"], c2: ["a few", "have escaped"],
    },
    {
      scene: "sec-water-holding-frog",
      text: "Some frogs survive long droughts by burrowing underground and waiting for ______ the water-holding frog of Australia's interior can stay buried for more than a year inside a cocoon made of its own shed skin.",
      w1: "rain", adv: "for example", c1: ["Some frogs", "survive"], c2: ["the water-holding frog", "can stay"],
    },
    {
      scene: "sec-bakers-cooperative",
      text: "The Riverside Bakers' Cooperative, which is owned by the twelve people who work there, lost money in each of its first three ______ its members voted to keep the business open because the number of regular customers was rising steadily.",
      w1: "years", adv: "nevertheless", c1: ["Cooperative", "lost"], c2: ["its members", "voted"],
    },
    {
      scene: "sec-protected-bike-lanes",
      text: "Transportation researcher Aisha Rahman studied protected bike lanes, which are separated from traffic by curbs or posts, in twelve North American cities. The lanes cut injuries among cyclists by nearly ______ the number of people cycling to work rose in every city that built them.",
      w1: "half", adv: "furthermore", c1: ["The lanes", "cut"], c2: ["the number", "rose"],
    },
  ];

  const conjunctiveAdverbJoin = {
    id: "sec-conjunctive-adverb-join",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Medium",
    title: "Semicolon before a transition that opens a second clause",
    recognize:
      "A transition such as however cannot join two independent clauses on its own; a semicolon goes before it and a comma after it.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["comma-splice", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(ADVERB_JOIN_TOPICS);
      const { w1, adv } = topic;
      const passage = topic.text;
      const key = `${w1}; ${adv},`;
      const splice = `${w1}, ${adv},`;
      const noTrailing = `${w1}; ${adv}`;
      const runOn = `${w1} ${adv},`;
      const parts = around(passage);
      const first = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      const second = parts ? sentenceTail(parts.after).trim().replace(/[.]$/, "") : "";
      return multipleChoice(topic, passage, key, [
        [splice, `A comma before "${adv}" creates a comma splice; a transition such as "${adv}" cannot join two independent clauses the way "and" or "but" can.`],
        [noTrailing, `The semicolon is right, but a transition such as "${adv}" that opens a clause must be followed by a comma.`],
        [runOn, `With no punctuation before "${adv}", the two independent clauses run together.`],
      ], {
        explanation:
          `"${first}" and "${second}" are both independent clauses, and "${adv}" is a transition, not a conjunction, so it cannot join them. A semicolon goes before "${adv}" and a comma after it: "${key}".`,
        steps: [
          "Check the words before the blank: they form an independent clause.",
          `Check the words after "${adv}": they form a second independent clause with its own subject and verb.`,
          `Because "${adv}" is a transition rather than a conjunction, separate the clauses with a semicolon and set off "${adv}" with a comma.`,
        ],
        principles: [
          "Transitions such as however, consequently, and for example do not join clauses; a semicolon or period must still separate the clauses.",
          "A transition that opens a clause is followed by a comma.",
        ],
        trap: "Treating the transition like and or but and joining the clauses with a comma, which creates a comma splice.",
        hint: `Could the words after "${adv}" stand alone as a sentence? If so, what does a transition need around it?`,
        estimatedSeconds: 65,
        verify: () => {
          if (!parts) return false;
          const lead = sentenceLead(parts.before);
          const clauses = lead.includes(topic.c1[0]) && lead.includes(topic.c1[1]) &&
            parts.after.includes(topic.c2[0]) && parts.after.includes(topic.c2[1]) &&
            !SUBORDINATORS.includes(firstWord(lead));
          const pattern = new RegExp(`^${escapeRe(w1)}([;,.]?) (${escapeRe(adv)})(,?)$`, "i");
          const legal = (choice) => {
            const match = choice.match(pattern);
            if (!match) return false;
            const [, before, word, after] = match;
            return JOIN.independentIndependent(before) && after === "," && (before !== "." || word === cap(adv));
          };
          return CONJ_ADVERBS.includes(adv) && clauses && onlyKey([key, splice, noTrailing, runOn], legal);
        },
      });
    },
  };

  /* ------------------------------------------ B5: no colon after a verb or preposition */

  // Each topic: a list or object that completes the verb or preposition
  // `w1`; w2 is the first word of that object.
  const GOVERNED_LIST_TOPICS = [
    {
      scene: "sec-andes-seed-bank",
      text: "A community seed bank in the Peruvian Andes stores seeds and tubers of crops that local farmers have grown for centuries. Its collection ______, kañiwa, amaranth, and more than three hundred varieties of potato.",
      w1: "includes", w2: "quinoa", gov: "verb",
    },
    {
      scene: "sec-fire-magazine",
      text: "The literary magazine Fire!! lasted for only one issue, published in 1926. That issue featured the work of young Harlem Renaissance writers ______ Hughes, Gwendolyn Bennett, and Wallace Thurman.",
      w1: "such as", w2: "Langston", gov: "preposition",
    },
    {
      scene: "sec-carousel-restoration",
      text: "Restoring the 1890s carousel in Riverfront Park took a team of volunteers four years. They ______ rusted brass poles, the horses' cracked glass eyes, and the band organ's paper music rolls.",
      w1: "replaced", w2: "the", gov: "verb",
    },
    {
      scene: "sec-messenger-mercury",
      text: "NASA's MESSENGER spacecraft, which orbited Mercury from 2011 to 2015, sent back several surprises, ______ ice in permanently shadowed craters near the planet's poles and bright, shallow pits known as hollows.",
      w1: "including", w2: "water", gov: "preposition",
    },
    {
      scene: "sec-tallis-choir-program",
      text: "The Tallis Street Youth Choir performs music from many traditions. Its spring program ______ Georgian folk song, a motet by Heinrich Schütz, and a new piece by the composer Ruth Adebayo.",
      w1: "featured", w2: "a", gov: "verb",
    },
    {
      scene: "sec-lewis-latimer",
      text: "Lewis Latimer, the son of parents who had escaped slavery, taught himself mechanical drawing while working at a patent law firm. His contributions to technology ______ patent drawings for Alexander Graham Bell's telephone and an improved method of making carbon filaments for light bulbs.",
      w1: "included", w2: "the", gov: "verb",
    },
    {
      scene: "sec-bellamy-marsh-birds",
      text: "Each June, volunteers at Bellamy Marsh count the birds nesting in its reeds and cattails. Last year, the three most common nesting species ______ wrens, red-winged blackbirds, and swamp sparrows.",
      w1: "were", w2: "marsh", gov: "verb",
    },
    {
      scene: "sec-kovac-ballet-program",
      text: "Students at the Kovac Ballet School complete a demanding three-year program before auditioning for professional companies. The program ______ technique classes, weekly lessons in partnering, and a course in human anatomy.",
      w1: "consists of", w2: "daily", gov: "verb",
    },
    {
      scene: "sec-east-antarctic-core",
      text: "An ice core drilled at a site in East Antarctica preserves a record of the atmosphere stretching back hundreds of thousands of years. Scientists studying its layers have ______ ash, dust blown from distant deserts, and tiny bubbles of ancient air.",
      w1: "found", w2: "volcanic", gov: "verb",
    },
    {
      scene: "sec-brooklyn-rooftop-farms",
      text: "Because most roofs can bear only limited weight, rooftop farms in Brooklyn grow their crops in soil less than a foot deep. The farmers favor hardy, shallow-rooted plants ______ greens, herbs, and radishes.",
      w1: "like", w2: "salad", gov: "preposition",
    },
    {
      scene: "sec-highway-typeface",
      text: "Typographer Naomi Sato spent three years designing a new typeface for highway signs. The state transportation agency ______ that stay readable at night, in heavy rain, and at speeds above 100 kilometers per hour.",
      w1: "required", w2: "letterforms", gov: "verb",
    },
    {
      scene: "sec-himalaya-guides",
      text: "Anthropologist Dawa Lhamo interviewed forty mountain guides who lead climbers on Himalayan peaks. The guides ______ weather changes, altitude sickness, and inexperienced clients as the greatest dangers they face.",
      w1: "named", w2: "sudden", gov: "verb",
    },
  ];

  const noColonAfterVerb = {
    id: "sec-no-colon-after-verb",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Medium",
    title: "No punctuation between a verb or preposition and its list",
    recognize:
      "The list completes a verb or a preposition such as including, so nothing may separate them, even though a list follows.",
    rubric: { steps: 1, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(GOVERNED_LIST_TOPICS);
      const { w1, w2, gov } = topic;
      const passage = topic.text;
      const key = `${w1} ${w2}`;
      const colon = `${w1}: ${w2}`;
      const semicolon = `${w1}; ${w2}`;
      const comma = `${w1}, ${w2}`;
      return multipleChoice(topic, passage, key, [
        [colon, `A colon must follow a complete independent clause, and the clause is not complete until the words after "${w1}" supply its object.`],
        [semicolon, `A semicolon separates two independent clauses; it cannot come between "${w1}" and the words that complete it.`],
        [comma, `A comma cannot separate the ${gov} "${w1}" from the object that completes it.`],
      ], {
        explanation:
          `The words after the blank are the object of the ${gov} "${w1}"; without them, the sentence would be incomplete. No punctuation belongs between a ${gov} and its object, even when the object is a list: "${key}".`,
        steps: [
          `Find the word that the list follows: "${w1}", a ${gov}.`,
          "Ask whether the words before the list could stand alone as a sentence; here they cannot, because the list completes them.",
          "Choose the option with no punctuation between the governing word and the list.",
        ],
        principles: [
          "A colon introduces a list only after a complete independent clause.",
          "No punctuation separates a verb or preposition from its object.",
        ],
        trap: "Reaching for a colon because a list follows, even though the list completes the verb or preposition.",
        hint: `Try stopping the sentence right after "${w1}". Is it complete?`,
        estimatedSeconds: 60,
        verify: () => {
          const parts = around(passage);
          if (!parts) return false;
          const object = `${w2}${sentenceTail(parts.after)}`.trim();
          const lead = sentenceLead(parts.before);
          const legal = (choice) => {
            const mark = between(choice, w1, w2);
            return mark !== null && JOIN.governorObject(mark);
          };
          return GOVERNORS.includes(w1.toLowerCase()) && object.split(/\s+/).length >= 3 &&
            !/[:;]\s*$/.test(lead) && onlyKey([key, colon, semicolon, comma], legal);
        },
      });
    },
  };

  /* ------------------------------------ B6: nothing between subject and verb, or verb and object */

  // Each topic: position "subject-verb" (w1 ends a long subject that begins
  // with `head`; w2 is its verb) or "verb-object" (w1 is the verb; w2 begins
  // its object).
  const CORE_PAIR_TOPICS = [
    {
      scene: "sec-correia-letters",
      text: "The botanist Inês Correia described nearly every plant she collected in long letters to her sister. The bundle of letters that Correia wrote during three expeditions up the ______ now held by a university library in Lisbon.",
      position: "subject-verb", head: "The bundle of letters", w1: "Amazon", w2: "is",
    },
    {
      scene: "sec-mohenjo-daro-drains",
      text: "Mohenjo-daro, a city of the Indus Valley civilization, was laid out on a careful grid more than four thousand years ago. The covered brick drains running beneath the streets of its residential ______ among the earliest known city sewer systems.",
      position: "subject-verb", head: "The covered brick drains", w1: "districts", w2: "are",
    },
    {
      scene: "sec-meditation-app-study",
      text: "Meditation apps promise better sleep, but few have been rigorously tested. A study of five thousand adults who used one such app for at least ten minutes a day over six ______ only modest improvements in how long participants slept.",
      position: "subject-verb", head: "A study of five thousand adults", w1: "months", w2: "found",
    },
    {
      scene: "sec-apollo-samples",
      text: "Between 1969 and 1972, six Apollo crews landed on the Moon and gathered rocks and soil. The samples that those astronauts brought back to Earth from the six landing ______ still studied by scientists around the world.",
      position: "subject-verb", head: "The samples", w1: "sites", w2: "are",
    },
    {
      scene: "sec-maple-sap-runs",
      text: "Maple syrup producers in Vermont collect sap for only a few weeks in late winter and early spring. The sap collected on days that follow a freezing night and warm to a few degrees above zero by ______ most of the season's syrup.",
      position: "subject-verb", head: "The sap", w1: "afternoon", w2: "yields",
    },
    {
      scene: "sec-glass-armonica",
      text: "In 1761 Benjamin Franklin invented the glass armonica, an instrument made of nested glass bowls that spin on a rod. The ringing tone produced when a player's wet fingertips touch the rims of the spinning ______ many listeners as almost unearthly.",
      position: "subject-verb", head: "The ringing tone", w1: "bowls", w2: "strikes",
    },
    {
      scene: "sec-alder-bay-light-rail",
      text: "The city of Alder Bay opened its first light-rail line in 2018. Commuters who switched from driving to the train during the line's first year of ______ an average of forty minutes a day.",
      position: "subject-verb", head: "Commuters", w1: "service", w2: "saved",
    },
    {
      scene: "sec-fossil-feather-color",
      text: "Some fossil birds from northeastern China are preserved in such fine detail that individual feathers are visible. The tiny pigment-bearing structures found inside those fossil ______ scientists to infer the colors the birds once displayed.",
      position: "subject-verb", head: "The tiny pigment-bearing structures", w1: "feathers", w2: "allow",
    },
    {
      scene: "sec-kato-volcano-quakes",
      text: "Seismologist Rina Kato compared thousands of small earthquakes recorded beneath a volcano in central Japan. Her analysis ______ the quakes had been creeping upward for months before the volcano erupted.",
      position: "verb-object", head: "Her analysis", w1: "showed", w2: "that",
    },
    {
      scene: "sec-ship-log-weather",
      text: "Climate scientists are turning to old ships' logbooks for records of past weather at sea. Volunteers for one online project ______ of wind and temperature readings recorded by sailors in the nineteenth century.",
      position: "verb-object", head: "Volunteers", w1: "transcribed", w2: "millions",
    },
    {
      scene: "sec-philadelphia-boarders",
      text: "Historian Kwame Asante traced the residents of a single Philadelphia street through a century of census records. He ______ nearly every household on the street in 1880 had taken in at least one boarder.",
      position: "verb-object", head: "He", w1: "discovered", w2: "that",
    },
    {
      scene: "sec-ruiz-night-photos",
      text: "Photographer Alma Ruiz spent two winters photographing bus drivers, nurses, and bakers in Chicago between midnight and dawn. For the series, she ______ photography entirely, relying instead on the glow of streetlamps and vending machines.",
      position: "verb-object", head: "she", w1: "avoided", w2: "flash",
    },
  ];

  const noCommaSubjectVerb = {
    id: "sec-no-comma-subject-verb",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Medium",
    title: "No punctuation inside the core of a clause",
    recognize:
      "The blank falls between a long subject and its verb, or between a verb and its object; however long the subject, nothing separates them.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(CORE_PAIR_TOPICS);
      const { w1, w2, position } = topic;
      const passage = topic.text;
      const key = `${w1} ${w2}`;
      const comma = `${w1}, ${w2}`;
      const semicolon = `${w1}; ${w2}`;
      const dash = `${w1}—${w2}`;
      const parts = around(passage);
      const lead = parts ? sentenceLead(parts.before) : "";
      const subject = `${lead.slice(Math.max(0, lead.indexOf(topic.head)))}${w1}`.trim();
      const subjectVerb = position === "subject-verb";
      const pair = subjectVerb ? "a subject from its verb" : "a verb from its object";
      return multipleChoice(topic, passage, key, [
        [comma, `A single comma cannot separate ${pair}; the length of the ${subjectVerb ? "subject" : "sentence"} does not change that.`],
        [semicolon, `A semicolon must separate two independent clauses, but "${w1}" and "${w2}" belong to the same clause.`],
        [dash, `A single dash cannot separate ${pair}; a dash here breaks the core of the clause.`],
      ], {
        explanation: subjectVerb
          ? `The subject of the sentence is "${subject}", and its verb is "${w2}". Nothing should separate a subject from its verb, however long the subject is: "${key}".`
          : `"${w1}" is the verb, and the words beginning "${w2}" are its object, telling what was ${w1}. Nothing should separate a verb from its object: "${key}".`,
        steps: [
          subjectVerb ? "Find the subject's main noun and follow the subject to its end." : "Find the verb just before the blank.",
          subjectVerb ? `Identify "${w2}" as the verb that goes with that subject.` : `Identify the words after the blank as what the verb "${w1}" acts on.`,
          "Choose the option with no punctuation between these two parts of the clause.",
        ],
        principles: [
          "No punctuation separates a subject from its verb or a verb from its object.",
          "A long subject may invite a pause in speech, but a pause is not a reason for a comma.",
        ],
        trap: "Adding a comma where a reader would pause for breath after a long stretch of words.",
        hint: "Which two parts of the clause does the blank sit between?",
        estimatedSeconds: 60,
        verify: () => {
          if (!parts) return false;
          const at = lead.indexOf(topic.head);
          if (at < 0) return false;
          const stretch = lead.slice(at);
          // With no opening mark inside the stretch, no closing mark is owed at the blank.
          const noOpener = !/[,;:—()]/.test(stretch);
          const verbFirst = subjectVerb ? !/\s/.test(w2) : !/\s/.test(w1);
          const legal = (choice) => {
            const mark = between(choice, w1, w2);
            return mark !== null && JOIN.governorObject(mark);
          };
          return noOpener && verbFirst && onlyKey([key, comma, semicolon, dash], legal);
        },
      });
    },
  };

  /* ------------------------------------------------ B7: semicolons in a complex series */

  // Each topic: a series of three items, each containing a comma. The blank
  // is at the first separator (w2 begins item 2) or the second (w2 is "and").
  const SERIES_TOPICS = [
    {
      scene: "sec-harmattan-film-festival",
      text: "Founded by filmmaker Chidi Okeke in 2015, the Harmattan Documentary Festival screens short films made by West African students. This fall the festival will travel to three cities: Lagos, ______, Ghana; and Dakar, Senegal.",
      w1: "Nigeria", w2: "Accra", items: ["Lagos, Nigeria", "Accra, Ghana", "Dakar, Senegal"],
    },
    {
      scene: "sec-halcyon-trio",
      text: "The Halcyon Trio has performed chamber music in small towns across Ireland since 2011. Its members are pianist Ana Keane, who founded the group; violinist Tomas Berg, who arranges much of its ______ cellist Iris Gao, who joined in 2020.",
      w1: "music", w2: "and",
      items: ["pianist Ana Keane, who founded the group", "violinist Tomas Berg, who arranges much of its music", "cellist Iris Gao, who joined in 2020"],
    },
    {
      scene: "sec-river-sediment",
      text: "Hydrologists compared how much sediment three great rivers carry to the sea: the Mekong, which drains much of mainland Southeast ______ Ganges, which flows through India and Bangladesh; and the Amazon, the largest river on Earth by volume.",
      w1: "Asia", w2: "the",
      items: ["the Mekong, which drains much of mainland Southeast Asia", "the Ganges, which flows through India and Bangladesh", "the Amazon, the largest river on Earth by volume"],
    },
    {
      scene: "sec-urban-history-speakers",
      text: "This year's conference on urban history will feature three keynote speakers: Mariam Haddad, a historian of Cairo; Leo Brandt, an architect from ______ Sun-mi Park, a geographer who studies Seoul's street markets.",
      w1: "Berlin", w2: "and",
      items: ["Mariam Haddad, a historian of Cairo", "Leo Brandt, an architect from Berlin", "Sun-mi Park, a geographer who studies Seoul's street markets"],
    },
    {
      scene: "sec-science-fair-prizes",
      text: "The judges at the regional science fair awarded top prizes to three students: Priya Nair, for a study of pollinators in city ______ Osei, for a solar-powered water filter; and Lucas Moreau, for a model of riverbank erosion.",
      w1: "parks", w2: "Daniel",
      items: ["Priya Nair, for a study of pollinators in city parks", "Daniel Osei, for a solar-powered water filter", "Lucas Moreau, for a model of riverbank erosion"],
    },
    {
      scene: "sec-trans-saharan-cities",
      text: "For centuries, camel caravans crossing the Sahara linked Sijilmasa, a market town in what is now Morocco; Timbuktu, a center of Islamic scholarship near the Niger ______ Gao, the capital of the Songhai Empire.",
      w1: "River", w2: "and",
      items: ["Sijilmasa, a market town in what is now Morocco", "Timbuktu, a center of Islamic scholarship near the Niger River", "Gao, the capital of the Songhai Empire"],
    },
    {
      scene: "sec-archive-acquisitions",
      text: "The state archive recently acquired three collections: the diaries of Mabel Ortiz, a Texas ______ letters of Harold Finch, a railroad engineer; and the sketchbooks of Aiko Mori, a botanical illustrator.",
      w1: "rancher", w2: "the",
      items: ["the diaries of Mabel Ortiz, a Texas rancher", "the letters of Harold Finch, a railroad engineer", "the sketchbooks of Aiko Mori, a botanical illustrator"],
    },
    {
      scene: "sec-lighthouse-keepers",
      text: "An exhibit at the maritime museum tells the stories of three nineteenth-century lighthouse keepers who were women: Ida Lewis, of Newport, Rhode Island; Abbie Burgess, of Matinicus Rock, ______ Harriet Colfax, of Michigan City, Indiana.",
      w1: "Maine", w2: "and",
      items: ["Ida Lewis, of Newport, Rhode Island", "Abbie Burgess, of Matinicus Rock, Maine", "Harriet Colfax, of Michigan City, Indiana"],
    },
    {
      scene: "sec-mural-neighborhoods",
      text: "The murals painted for the city's 2022 arts festival each celebrate a single neighborhood. The festival paired each of three muralists with a neighborhood: Rosa Delgado, East ______ Kim, Flushing; and Marcus Bell, Bedford-Stuyvesant.",
      w1: "Harlem", w2: "Jin",
      items: ["Rosa Delgado, East Harlem", "Jin Kim, Flushing", "Marcus Bell, Bedford-Stuyvesant"],
    },
    {
      scene: "sec-meteor-showers",
      text: "Astronomer Leah Grant's guide for beginning stargazers lists three reliable meteor showers: the Quadrantids, which peak in early January; the Perseids, which peak in ______ Geminids, which peak in December.",
      w1: "August", w2: "and the",
      items: ["the Quadrantids, which peak in early January", "the Perseids, which peak in August", "the Geminids, which peak in December"],
    },
    {
      scene: "sec-wild-rice-sites",
      text: "Wild rice, a grass that grows in shallow lakes and slow rivers, holds deep cultural importance for the Ojibwe people. Botanist Ravi Menon collected its seeds from a lake near Duluth, ______ marsh near Ashland, Wisconsin; and a river delta near Marquette, Michigan.",
      w1: "Minnesota", w2: "a",
      items: ["a lake near Duluth, Minnesota", "a marsh near Ashland, Wisconsin", "a river delta near Marquette, Michigan"],
    },
    {
      scene: "sec-working-lives-podcast",
      text: "The first season of the oral history podcast Working Lives featured interviews with Dolores Vega, a retired firefighter; Amos Clarke, a beekeeper in ______ Fatima Zahra, a pilot for a cargo airline.",
      w1: "Vermont", w2: "and",
      items: ["Dolores Vega, a retired firefighter", "Amos Clarke, a beekeeper in Vermont", "Fatima Zahra, a pilot for a cargo airline"],
    },
  ];

  const seriesSemicolons = {
    id: "sec-series-semicolons",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Medium",
    title: "Semicolons separating series items that contain commas",
    recognize:
      "Each item in the series already contains a comma, so the items themselves must be separated by semicolons.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(SERIES_TOPICS);
      const { w1, w2, items } = topic;
      const passage = topic.text;
      const key = `${w1}; ${w2}`;
      const comma = `${w1}, ${w2}`;
      const colon = `${w1}: ${w2}`;
      const none = `${w1} ${w2}`;
      return multipleChoice(topic, passage, key, [
        [comma, `Because the items already contain commas ("${items[0]}"), a comma here would blur where one item ends and the next begins.`],
        [colon, "A colon introduces a list or an explanation; it cannot separate one item in a series from the next."],
        [none, `With no punctuation, "${none}" runs two items of the series together.`],
      ], {
        explanation:
          `The series has three items, and each contains its own comma: "${items[0]}"; "${items[1]}"; "${items[2]}". When items contain commas, semicolons separate the items: "${key}".`,
        steps: [
          "Identify the series and its three items.",
          "Notice that each item already contains a comma.",
          "Use semicolons between the items so the reader can tell them apart.",
        ],
        principles: [
          "Series items are normally separated by commas, but when the items themselves contain commas, semicolons separate them.",
        ],
        trap: "Choosing a comma because series items are usually separated by commas, without noticing that each item contains one already.",
        hint: "Look at the punctuation the passage already uses between the other items.",
        estimatedSeconds: 60,
        verify: () => {
          const keyed = passage.replace(BLANK, key);
          const series = `${items[0]}; ${items[1]}; and ${items[2]}`;
          const legal = (choice) => {
            const mark = between(choice, w1, w2);
            return mark !== null && JOIN.seriesWithCommas(mark);
          };
          return items.every((entry) => entry.includes(",")) && keyed.includes(series) &&
            onlyKey([key, comma, colon, none], legal);
        },
      });
    },
  };

  /* -------------------------------------- B8: "most of which" versus "most of them" */

  // Each topic: an independent clause ending with the noun w1; the blank
  // continues with a quantifier `q` and "which"/"whom", depending on whether
  // w1 names things or people (`kind`).
  const RELATIVE_QUANTIFIER_TOPICS = [
    {
      scene: "sec-immigrant-postcards",
      text: "In 1998, a historian in Minnesota discovered a trunk containing more than three thousand ______ had been mailed by Swedish immigrants to their families between 1880 and 1910.",
      w1: "postcards", q: "most", rel: "which", kind: "thing", clause: ["a historian", "discovered"],
    },
    {
      scene: "sec-kanaan-choir",
      text: "Music teacher Leila Kanaan founded a community choir in the basement of a Detroit church in 2012. The choir has since grown to sixty ______ had never performed in public before joining.",
      w1: "singers", q: "many", rel: "whom", kind: "person", clause: ["The choir", "grown"],
    },
    {
      scene: "sec-himalayan-glacial-lakes",
      text: "Glaciers in the Himalayas have been retreating for decades. In the valleys they have left behind, meltwater has filled hundreds of new ______ are held back only by loose ridges of rock and ice.",
      w1: "lakes", q: "some", rel: "which", kind: "thing", clause: ["meltwater", "has filled"],
    },
    {
      scene: "sec-namibian-meteorite",
      text: "Geologist Mara Voss wanted to know whether a meteorite that fell in Namibia in 2019 had ever been exposed to water. She cut the meteorite into forty thin ______ contained any trace of water-bearing minerals.",
      w1: "slices", q: "none", rel: "which", kind: "thing", clause: ["She", "cut"],
    },
    {
      scene: "sec-beaumont-notebooks",
      text: "The poet Clara Beaumont, who died in 1987, wrote most of her poems by hand before typing them. She left behind twenty-two ______ are now kept at a university library in Montreal.",
      w1: "notebooks", q: "all", rel: "which", kind: "thing", clause: ["She", "left"],
    },
    {
      scene: "sec-valle-youth-orchestra",
      text: "Conductor Felipe Arce founded the Valle Youth Orchestra in 2009 to bring classical music to rural Colombia. In its first year, he recruited forty young ______ had never held a stringed instrument.",
      w1: "musicians", q: "half", rel: "whom", kind: "person", clause: ["he", "recruited"],
    },
    {
      scene: "sec-alchichica-crater-lakes",
      text: "Ancient volcanic eruptions left a string of deep craters across the highlands of central Mexico. Several of those craters now hold ______ is home to a small fish found nowhere else on Earth.",
      w1: "lakes", q: "one", rel: "which", kind: "thing", clause: ["Several", "hold"],
    },
    {
      scene: "sec-silent-comedy-reels",
      text: "Film preservationists searching a barn in rural Ontario found a 1927 silent comedy that had been considered lost. The film survived on nine metal ______ were too badly rusted to open.",
      w1: "reels", q: "two", rel: "which", kind: "thing", clause: ["The film", "survived"],
    },
    {
      scene: "sec-nairobi-hackathon",
      text: "Kenya's technology industry has grown quickly since the late 2000s. In 2014, a weekend coding competition held in Nairobi brought together 150 high school ______ later founded technology companies of their own.",
      w1: "students", q: "several", rel: "whom", kind: "person", clause: ["competition", "brought"],
    },
    {
      scene: "sec-cedar-masks-gallery",
      text: "The museum's newest gallery is devoted to the carving traditions of the Pacific Northwest. Visitors to the gallery can see thirty-two carved cedar ______ is displayed beside a recording of the song it once accompanied.",
      w1: "masks", q: "each", rel: "which", kind: "thing", clause: ["Visitors", "can see"],
    },
    {
      scene: "sec-asthma-breathing-trial",
      text: "Doctors in Glasgow wondered whether breathing exercises could help people with mild asthma. Their clinical trial taught daily exercises to 400 adult ______ used their inhalers less often after six weeks.",
      w1: "patients", q: "most", rel: "whom", kind: "person", clause: ["trial", "taught"],
    },
    {
      scene: "sec-portugal-wreck-coins",
      text: "Divers mapping a shipwreck off the southern coast of Portugal have recovered more than two thousand silver ______ were minted in Mexico City in the 1780s.",
      w1: "coins", q: "many", rel: "which", kind: "thing", clause: ["Divers", "have recovered"],
    },
  ];

  const relativeVsPronounClause = {
    id: "sec-relative-vs-pronoun-clause",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Medium",
    title: "Relative clause versus a second independent clause",
    recognize:
      "“Most of which” begins a dependent clause that attaches with a comma; “most of them” begins an independent clause that a comma cannot attach.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["comma-splice", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(RELATIVE_QUANTIFIER_TOPICS);
      const { w1, q, rel } = topic;
      const passage = topic.text;
      const key = `${w1}, ${q} of ${rel}`;
      const splice = `${w1}, ${q} of them`;
      const semicolon = `${w1}; ${q} of ${rel}`;
      const period = `${w1}. ${cap(q)} of ${rel}`;
      return multipleChoice(topic, passage, key, [
        [splice, `"${cap(q)} of them" begins an independent clause, so joining it to the first clause with only a comma creates a comma splice.`],
        [semicolon, `A semicolon must join two independent clauses, but "${q} of ${rel}" begins a dependent clause.`],
        [period, `A period would leave "${cap(q)} of ${rel} ..." as a fragment: a dependent clause cannot stand alone.`],
      ], {
        explanation:
          `"${cap(q)} of ${rel}" begins a dependent clause that describes the ${w1}, so it attaches to the main clause with a comma: "${key}". With "them" in place of "${rel}", the words after the blank would be an independent clause, and a comma alone could not join it.`,
        steps: [
          "Confirm that the words before the blank form an independent clause.",
          `Decide whether "${q} of ${rel}" or "${q} of them" makes the words after the blank dependent or independent.`,
          "Attach a dependent relative clause with a comma; never use a semicolon or period before it.",
        ],
        principles: [
          "Which, whom, and whose begin dependent clauses, even inside phrases such as most of which.",
          "Personal pronouns such as them begin independent clauses, which cannot be joined to another clause with a comma alone.",
        ],
        trap: `Choosing "${q} of them" because it sounds natural in speech, which produces a comma splice.`,
        hint: "Which choice makes the words after the blank unable to stand alone as a sentence?",
        estimatedSeconds: 65,
        verify: () => {
          const parts = around(passage);
          if (!parts) return false;
          const lead = sentenceLead(parts.before);
          const clause = lead.includes(topic.clause[0]) && lead.includes(topic.clause[1]) &&
            !SUBORDINATORS.includes(firstWord(lead));
          const fits = (topic.kind === "person") === (rel === "whom");
          const pattern = new RegExp(`^${escapeRe(w1)}([,;.]) (${escapeRe(q)}) of (which|whom|them)$`, "i");
          const legal = (choice) => {
            const match = choice.match(pattern);
            if (!match) return false;
            const [, mark, , pronoun] = match;
            const dependent = pronoun === "which" || pronoun === "whom";
            return dependent ? JOIN.dependentIndependent(mark) : JOIN.independentIndependent(mark);
          };
          return clause && fits && onlyKey([key, splice, semicolon, period], legal);
        },
      });
    },
  };

  /* ------------------------------------------------ B9: closing mark must match the opener */

  const CLOSERS = { "—": "—", ",": ",", "(": ")" };
  const OPENER_NAMES = { "—": "dash", ",": "comma", "(": "parenthesis" };
  const CLOSER_NAMES = { "—": "dash", ",": "comma", "(": "closing parenthesis" };
  const MARK_PATTERNS = { "—": /—/, ",": /,/, "(": /[()]/ };

  // Each topic: `head` followed immediately by `opener` starts a nonessential
  // element that ends with w1; w2 is the main verb (or the word before it).
  const CLOSING_MARK_TOPICS = [
    {
      scene: "sec-methuselah-pine",
      text: "Great Basin bristlecone pines survive on dry, windswept slopes where few other trees can grow. The tree known as Methuselah—a bristlecone that, according to ring counts taken in 1957, had already lived for more than 4,700 ______ in the White Mountains of eastern California.",
      head: "Methuselah", opener: "—", w1: "years", w2: "grows",
    },
    {
      scene: "sec-varga-graphic-scores",
      text: "Some composers write music that looks nothing like a conventional score. The composer Ines Varga—whose scores, drawn in colored ink on sheets of paper nearly a meter wide, look more like maps than like ______ performers to decide for themselves how long each shape should last.",
      head: "Ines Varga", opener: "—", w1: "music", w2: "asks",
    },
    {
      scene: "sec-sea-cucumbers",
      text: "Sea cucumbers—soft-bodied animals that, despite their name, are related to sea stars rather than to ______ an important role on coral reefs. As they crawl along the seafloor, they swallow sand, digest the organic matter it contains, and leave cleaner sand behind.",
      head: "Sea cucumbers", opener: "—", w1: "plants", w2: "play",
    },
    {
      scene: "sec-hedy-lamarr",
      text: "Hedy Lamarr—a Hollywood star who, during the Second World War, worked with the composer George Antheil on a radio system that hopped rapidly between ______ a patent for the invention in 1942. The technique, known as frequency hopping, was later adopted in military communications.",
      head: "Hedy Lamarr", opener: "—", w1: "frequencies", w2: "received",
    },
    {
      scene: "sec-new-england-ice-houses",
      text: "Nineteenth-century ice houses—buildings in which, long before electric refrigerators existed, blocks of lake ice were packed in sawdust to last through the ______ still be found on old farms across New England.",
      head: "ice houses", opener: "—", w1: "summer", w2: "can",
    },
    {
      scene: "sec-corner-store-survey",
      text: "Sociologist Denise Albright spent a year visiting corner stores in Baltimore. Her survey of these stores—small shops that, in many city neighborhoods, serve as the closest source of ______ that most stocked fresh fruit only during the summer months.",
      head: "these stores", opener: "—", w1: "groceries", w2: "found",
    },
    {
      scene: "sec-octavia-butler",
      text: "Science fiction writers usually send their characters into the future, but some send them into the past. Octavia E. Butler, whose 1979 novel Kindred transports a Black woman from 1970s California to a plantation in antebellum ______ up in Pasadena, California.",
      head: "Octavia E. Butler", opener: ",", w1: "Maryland", w2: "grew",
    },
    {
      scene: "sec-kaminski-primes",
      text: "Mathematician Sofia Kaminski, who spent two decades trying to prove a conjecture about the gaps between prime ______ published her proof in 2021. Several independent teams have since checked its more than two hundred pages.",
      head: "Sofia Kaminski", opener: ",", w1: "numbers", w2: "finally",
    },
    {
      scene: "sec-amazon-river-dolphin",
      text: "The Amazon river dolphin, which often turns pinker as it ages because of scarring and blood vessels close to the ______ fish in forests that flood during the rainy season. Unlike most dolphins, it can turn its head to steer around submerged tree trunks.",
      head: "The Amazon river dolphin", opener: ",", w1: "skin", w2: "hunts",
    },
    {
      scene: "sec-soto-linocuts",
      text: "The printmaker Elena Soto, who carves her designs into blocks of linoleum rather than ______ each edition by hand on a press she built herself. Her prints of desert plants have been shown in galleries across the Southwest.",
      head: "Elena Soto", opener: ",", w1: "wood", w2: "prints",
    },
    {
      scene: "sec-axolotl",
      text: "The axolotl (a salamander that keeps its feathery gills and other juvenile features throughout its adult ______ in the wild only in a network of canals on the southern edge of Mexico City.",
      head: "The axolotl", opener: "(", w1: "life", w2: "survives",
    },
    {
      scene: "sec-argo-floats",
      text: "Argo floats (battery-powered instruments that drift with ocean currents and dive to depths of about two thousand meters every ten ______ temperature and salinity readings to satellites each time they surface. Nearly four thousand of the floats are now spread across the world's oceans.",
      head: "Argo floats", opener: "(", w1: "days", w2: "send",
    },
  ];

  const closingMarkMatch = {
    id: "sec-closing-mark-match",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Hard",
    title: "Closing a nonessential element with its matching mark",
    recognize:
      "A dash, comma, or parenthesis earlier in the sentence opened an interruption that ends at the blank; it must close with the same mark.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(CLOSING_MARK_TOPICS);
      const { w1, w2, opener, head } = topic;
      const passage = topic.text;
      const closer = CLOSERS[opener];
      const render = (mark) => (mark === "—" ? `${w1}—${w2}` : mark === "" ? `${w1} ${w2}` : `${w1}${mark} ${w2}`);
      const key = render(closer);
      const reasons = {
        ",": opener === "—"
          ? `A comma cannot close an element that opened with a dash after "${head}"; the commas inside the element do not change which mark closes it.`
          : `A comma cannot close an element that opened with a parenthesis after "${head}".`,
        "—": `A dash cannot close an element that opened with a ${OPENER_NAMES[opener]} after "${head}".`,
        ";": `A semicolon must separate two independent clauses; here it would cut the subject off from its verb.`,
        "": `With no closing mark, the element that opened after "${head}" never ends and runs into the rest of the sentence.`,
      };
      const wrongMarks = opener === "—" ? [",", ";", ""] : opener === "," ? ["—", ";", ""] : [",", "—", ""];
      const wrong = wrongMarks.map((mark) => [render(mark), reasons[mark]]);
      return multipleChoice(topic, passage, key, wrong, {
        explanation:
          `The ${OPENER_NAMES[opener]} after "${head}" opens a nonessential element that ends with "${w1}". An element opened with a ${OPENER_NAMES[opener]} must close with a matching ${CLOSER_NAMES[opener]}, so the correct choice is "${key}".`,
        steps: [
          "Find the subject of the sentence and the verb that belongs to it.",
          `Notice the ${OPENER_NAMES[opener]} right after "${head}", which opens an interruption between them.`,
          "Close the interruption at the blank with the same kind of mark that opened it.",
        ],
        principles: [
          "A nonessential element in the middle of a sentence is set off by a matching pair: two commas, two dashes, or two parentheses.",
          "Commas inside a nonessential element do not change the mark that must close it.",
        ],
        trap: opener === "—"
          ? "Choosing the comma because the element already contains commas, which makes a comma look like the natural closing mark."
          : "Leaving out the closing mark because the interruption is long and its opening mark is far from the blank.",
        hint: "Go back to where the interruption began. What mark opened it?",
        estimatedSeconds: 80,
        verify: () => {
          const blankAt = passage.indexOf(BLANK);
          const openText = opener === "(" ? " (" : opener;
          const at = passage.indexOf(`${head}${openText}`);
          if (blankAt < 0 || at < 0 || at > blankAt) return false;
          const inside = passage.slice(at + head.length + openText.length, blankAt);
          if (MARK_PATTERNS[opener].test(inside)) return false;
          const legal = (choice) => between(choice, w1, w2) === CLOSERS[opener];
          return onlyKey([key, ...wrong.map(([text]) => text)], legal);
        },
      });
    },
  };

  /* ------------------------------------ B10: essential or nonessential, decided by context */

  // Each topic: `head` + `clause` + `verb` span the blank. `candidates` is how
  // many things the context gives that the head could refer to; more than one
  // makes the clause essential. `cue` is the context words that settle it.
  const ESSENTIAL_CLAUSE_TOPICS = [
    {
      scene: "sec-three-exercise-groups",
      text: "Researchers divided 300 adults into three groups: one walked every day, one lifted weights twice a week, and one made no change to its routine. Six months later, the ______ an average of forty minutes longer each night than those in the other groups.",
      head: "participants", clause: "who had walked every day", verb: "slept", candidates: 3, cue: "three groups",
      note: "Only one of the three groups walked every day, so the clause is needed to say which participants slept longer.",
      misread: "claims that every participant had walked every day",
    },
    {
      scene: "sec-shaded-turtle-nests",
      text: "Biologists tracked 120 loggerhead turtle nests on a Florida beach, some shaded by dune grass and others in open sand. Hatchlings from ______ about a week later on average and were more likely to be male.",
      head: "nests", clause: "where dune grass shaded the sand", verb: "emerged", candidates: 2, cue: "some shaded",
      note: "Only some nests were shaded, so the clause is needed to say which nests produced the later hatchlings.",
      misread: "claims that dune grass shaded every nest",
    },
    {
      scene: "sec-harbor-prize",
      text: "Six novelists were shortlisted for this year's Harbor Prize, which honors fiction about coastal communities. In the end, the ______ the prize for a story set in her grandmother's bakery in Halifax.",
      head: "novelist", clause: "whose first book had appeared in 2012", verb: "won", candidates: 6, cue: "Six novelists",
      note: "Six novelists were shortlisted, so the clause is needed to identify which one won.",
      misread: "treats the winner as already identified, though six novelists were in contention",
    },
    {
      scene: "sec-leeds-nurse-schedules",
      text: "A hospital in Leeds tested a new scheduling system on two of its wards while its other wards kept the old one. After three months, ______ fewer missed breaks and less unpaid overtime.",
      head: "nurses", clause: "who worked on the two test wards", verb: "reported", candidates: 2, cue: "other wards",
      note: "The hospital's nurses worked on both test wards and other wards, so the clause is needed to say which nurses reported fewer missed breaks.",
      misread: "claims that all of the hospital's nurses worked on the two test wards",
    },
    {
      scene: "sec-mulched-sorghum-plots",
      text: "Agronomist Nkechi Okafor planted the same variety of sorghum on forty plots but spread crop residue as mulch on only half of them. ______ 20 percent more grain during the dry season than the bare plots did.",
      head: "Plots", clause: "where she had spread the mulch", verb: "produced", candidates: 2, cue: "only half",
      note: "Only half of the plots were mulched, so the clause is needed to say which plots produced more grain.",
      misread: "claims that she mulched every plot",
    },
    {
      scene: "sec-debate-club-students",
      text: "When the school started an optional debate club, about a third of its ninth graders signed up. By the end of the year, ______ higher on a persuasive-writing test than their classmates did.",
      head: "students", clause: "who had joined the club", verb: "scored", candidates: 2, cue: "about a third",
      note: "Only about a third of the ninth graders joined, so the clause is needed to say which students scored higher.",
      misread: "claims that all of the students had joined the club",
    },
    {
      scene: "sec-ghana-swallow-days",
      text: "Ornithologist Kofi Mensah counted barn swallows passing a headland on the coast of Ghana every day during the spring migration. ______ the largest flocks, sometimes more than a thousand birds an hour.",
      head: "Days", clause: "when the wind blew from the south", verb: "brought", candidates: 60, cue: "every day",
      note: "Mensah counted on every day of the migration, so the clause is needed to say which days brought the largest flocks.",
      misread: "claims that the wind blew from the south on every day of the count",
    },
    {
      scene: "sec-vidal-self-portraits",
      text: "The Marlow Museum owns eleven self-portraits by the painter Lucía Vidal. The ______ the only one that has ever been lent to another museum; it traveled to Tokyo in 2018 for a retrospective of her work.",
      head: "self-portrait", clause: "whose frame Vidal carved herself", verb: "is", candidates: 11, cue: "eleven self-portraits",
      note: "The museum owns eleven self-portraits, so the clause is needed to identify which one has been lent.",
      misread: "treats the self-portrait as already identified, though the museum owns eleven",
    },
    {
      scene: "sec-villa-glass-fragments",
      text: "Archaeologist Carla Benedetti sorted 2,000 glass fragments from a Roman villa by color and thickness. ______ out to come from windows rather than from drinking cups.",
      head: "Fragments", clause: "whose edges had been ground flat", verb: "turned", candidates: 2000, cue: "2,000 glass fragments",
      note: "Benedetti sorted 2,000 fragments, so the clause is needed to say which fragments came from windows.",
      misread: "claims that every fragment had its edges ground flat",
    },
    {
      scene: "sec-architect-julia-reyes",
      text: "The Hollis Public Library, completed in 1931, was the first building in the city designed by a woman. Its architect was Julia Reyes. ______ a reading room lit entirely by skylights so that patrons would not need lamps during the day.",
      head: "Reyes", clause: "who had trained in Paris", verb: "designed", candidates: 1, cue: "Julia Reyes",
      note: "Reyes is already identified by name, so the clause only adds information about her and must be set off by a pair of commas.",
    },
    {
      scene: "sec-grace-hopper",
      text: "In the early 1950s, most computers could be programmed only with long strings of numbers. Grace ______ one of the first compilers, a program that translated instructions written in words into code a machine could run.",
      head: "Hopper", clause: "who had earned a doctorate in mathematics from Yale", verb: "built", candidates: 1, cue: "Grace",
      note: "Grace Hopper is identified by name, so the clause only adds information about her and must be set off by a pair of commas.",
    },
    {
      scene: "sec-baikal-endemics",
      text: "Lake Baikal in Siberia is the deepest lake on Earth, plunging more than 1,600 meters. ______ roughly a fifth of all the unfrozen fresh water on the planet's surface.",
      head: "Baikal", clause: "where most of the animal species live nowhere else", verb: "holds", candidates: 1, cue: "Lake Baikal",
      note: "Baikal is a single, named lake, so the clause only adds information about it and must be set off by a pair of commas.",
    },
    {
      scene: "sec-jessup-driftwood",
      text: "For forty years, folk artist Walter Jessup carved shorebirds from driftwood he gathered along North Carolina's Outer Banks. ______ away nearly every carving he made to friends and neighbors.",
      head: "Jessup", clause: "whose workshop was a converted fishing shack", verb: "gave", candidates: 1, cue: "Walter Jessup",
      note: "Jessup is already identified by name, so the clause only adds information about him and must be set off by a pair of commas.",
    },
  ];

  const commaCount = (text) => (text.match(/,/g) || []).length;

  const essentialClauseContext = {
    id: "sec-essential-clause-context",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Hard",
    title: "Essential or nonessential clause, decided by context",
    recognize:
      "Whether the clause takes a pair of commas depends on the context: if it is needed to pick out which one is meant, it takes none.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "equivalent-form"],
    build(t) {
      const topic = t.pick(ESSENTIAL_CLAUSE_TOPICS);
      const { head, clause, verb } = topic;
      const passage = topic.text;
      const essential = topic.candidates > 1;
      const bare = `${head} ${clause} ${verb}`;
      const paired = `${head}, ${clause}, ${verb}`;
      const openOnly = `${head}, ${clause} ${verb}`;
      const closeOnly = `${head} ${clause}, ${verb}`;
      const key = essential ? bare : paired;
      const wrong = [
        essential
          ? [paired, `The pair of commas makes the clause nonessential, which ${topic.misread}; the context shows the clause is needed to identify which ${head.toLowerCase()} the sentence means.`]
          : [bare, `Without commas, the clause would be read as essential, as if it were needed to pick out which ${head} is meant; ${head} is already identified, so the added information needs a pair of commas.`],
        [openOnly, `A comma after "${head}" opens an element that is never closed; the clause needs either no commas or a pair.`],
        [closeOnly, `A single comma before "${verb}" separates the subject from its verb.`],
      ];
      return multipleChoice(topic, passage, key, wrong, {
        explanation: essential
          ? `${topic.note} A clause that identifies which one is meant is essential and takes no commas: "${key}".`
          : `${topic.note} The correct choice is "${key}".`,
        steps: [
          "Identify the clause beginning with who, whose, where, or when.",
          "Ask whether the context has already identified which one the sentence is about, or whether the clause is needed to identify it.",
          "Use no commas for a clause that identifies; use a pair of commas for a clause that only adds information.",
        ],
        principles: [
          "An essential (restrictive) clause identifies which person or thing is meant and is not set off by commas.",
          "A nonessential clause adds information about someone or something already identified and is set off by a pair of commas.",
        ],
        trap: essential
          ? "Adding a pair of commas because the clause looks like extra description, without checking whether the context needs it to identify the group."
          : "Leaving out the commas because the clause seems important, even though the person or place is already identified by name.",
        hint: "Before the clause, does the reader already know exactly which one the sentence means?",
        estimatedSeconds: 80,
        verify: () => {
          const parts = around(passage);
          if (!parts || !parts.before.includes(topic.cue)) return false;
          if (!/^(who|whom|whose|where|when)\b/.test(clause) || clause.includes(",")) return false;
          const expected = topic.candidates > 1 ? 0 : 2;
          // A nonessential clause follows a named individual; an essential one
          // follows a common noun that the context leaves ambiguous.
          const named = topic.cue.endsWith(head) || parts.before.trimEnd().endsWith(topic.cue);
          const common = head === head.toLowerCase() || /(^|[.!?,]\s*)$/.test(parts.before);
          if (expected === 2 ? !named : named || !common) return false;
          const legal = (choice) => choice.startsWith(head) && choice.endsWith(verb) &&
            choice.replace(/,/g, "").replace(/\s+/g, " ") === bare && commaCount(choice) === expected &&
            (expected === 0 || (choice.indexOf(`${head},`) === 0 && choice.endsWith(`, ${verb}`)));
          return onlyKey([key, ...wrong.map(([text]) => text)], legal);
        },
      });
    },
  };

  /* ------------------------------------ B11: a transition inside a single clause */

  // Each topic: the blank's sentence has a long subject (starting with
  // `head`, often holding a relative clause with its own verb) ending with
  // w1; the transition `adv` interrupts before the main verb w2.
  const INTERRUPTER_TOPICS = [
    {
      scene: "sec-harrow-puffins",
      text: "For decades, observers walking the cliffs of Harrow Island counted about two hundred pairs of nesting puffins each summer. The survey that ecologists conducted by drone in ______ only 120 pairs.",
      head: "The survey", w1: "2021", adv: "however", w2: "found",
    },
    {
      scene: "sec-solar-vaccine-fridge",
      text: "Most vaccines must be kept cold all the way from the factory to the clinic, which is difficult where electricity is unreliable. The solar-powered refrigerator that engineer Amina Yusuf designed for rural ______ vaccines cold for five days without any sunlight.",
      head: "The solar-powered refrigerator", w1: "clinics", adv: "however", w2: "keeps",
    },
    {
      scene: "sec-gorge-bridges",
      text: "The wooden footbridges built across the Kessel Gorge in the 1800s had to be replaced every few decades. The steel bridge that engineers completed across the gorge in ______ in service today after only minor repairs.",
      head: "The steel bridge", w1: "1931", adv: "in contrast", w2: "remains",
    },
    {
      scene: "sec-winter-bee-cluster",
      text: "Honeybees have several ways of surviving cold winters without hibernating. The heat that the bees generate by shivering their flight ______ the center of their cluster above 18 degrees Celsius even when the air outside is below freezing.",
      head: "The heat", w1: "muscles", adv: "for example", w2: "keeps",
    },
    {
      scene: "sec-fairmont-library-app",
      text: "Public libraries have found new ways to reach readers who rarely visit in person. The app that the Fairmont library launched in ______ patrons borrow audiobooks without ever getting a library card.",
      head: "The app", w1: "2019", adv: "for instance", w2: "lets",
    },
    {
      scene: "sec-replanted-marshes",
      text: "Restoring wetlands along the Tolliver River has reduced flooding in the towns downstream. The marshes that volunteers replanted in ______ shelter for several species of migrating ducks.",
      head: "The marshes", w1: "2016", adv: "moreover", w2: "provide",
    },
    {
      scene: "sec-shorter-homework",
      text: "Many teachers in the district doubted that shorter homework assignments would make any difference. The students whose teachers agreed to try the shorter ______ slightly higher grades than their peers by the end of the term.",
      head: "The students", w1: "assignments", adv: "nevertheless", w2: "earned",
    },
    {
      scene: "sec-verhulst-underdrawing",
      text: "For a century, a portrait in the Aldridge Gallery was attributed to a student of the Flemish painter Jan Verhulst. The underdrawing that x-rays revealed beneath the ______ sketches known to be by Verhulst himself.",
      head: "The underdrawing", w1: "paint", adv: "however", w2: "resembles",
    },
    {
      scene: "sec-southern-stream-wolves",
      text: "Along the northern ridge of the park, wildlife cameras recorded wolves only at night. The cameras that rangers mounted beside the southern ______ wolves during daylight as well.",
      head: "The cameras", w1: "stream", adv: "meanwhile", w2: "captured",
    },
    {
      scene: "sec-flour-price-drought",
      text: "A drought in 1846 destroyed much of the wheat harvest in the region around the capital. The price that bakers in the city paid for ______ to nearly three times its usual level within a year.",
      head: "The price", w1: "flour", adv: "consequently", w2: "rose",
    },
    {
      scene: "sec-seagrass-recovery",
      text: "Along one stretch of the Australian coast, corals that had survived earlier heat waves bleached less during a severe heat wave in 2016. The seagrass meadows that researchers monitored along the same ______ faster if they had endured a hot summer before.",
      head: "The seagrass meadows", w1: "stretch", adv: "similarly", w2: "recovered",
    },
    {
      scene: "sec-touchscreen-guides",
      text: "The Pell Museum expected most visitors to use the touch-screen guides it installed in 2022. The visitors whom researchers observed in the galleries that ______ on printed labels and on conversations with one another.",
      head: "The visitors", w1: "year", adv: "instead", w2: "relied",
    },
  ];

  const adverbInterruptsClause = {
    id: "sec-adverb-interrupts-clause",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Hard",
    title: "Transition interrupting a single clause",
    recognize:
      "The words before the blank are only a long subject, not a clause, so the transition interrupts one clause and takes a pair of commas.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(INTERRUPTER_TOPICS);
      const { w1, w2, adv, head } = topic;
      const passage = topic.text;
      const key = `${w1}, ${adv}, ${w2}`;
      const semicolon = `${w1}; ${adv}, ${w2}`;
      const period = `${w1}. ${cap(adv)}, ${w2}`;
      const none = `${w1} ${adv} ${w2}`;
      const parts = around(passage);
      const subject = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      return multipleChoice(topic, passage, key, [
        [semicolon, `A semicolon must follow an independent clause, but "${subject}" is only the subject of a sentence whose verb is "${w2}".`],
        [period, `A period would leave "${subject}" as a fragment and give "${w2}" no subject.`],
        [none, `A transition that interrupts a clause, as "${adv}" does here, must be set off by a pair of commas.`],
      ], {
        explanation:
          `"${subject}" is the subject of the sentence, and its verb is "${w2}"; the verb inside the descriptive clause does not make these words an independent clause. "${cap(adv)}" interrupts that single clause, so it is set off by a pair of commas: "${key}".`,
        steps: [
          "Find the main verb of the sentence that contains the blank.",
          `Notice that everything before the blank is the subject of "${w2}", even though it contains a verb of its own inside a descriptive clause.`,
          `Because "${adv}" sits inside one clause, set it off with a comma on each side.`,
        ],
        principles: [
          "A transition that begins a new independent clause takes a semicolon or period before it; a transition that interrupts one clause takes a pair of commas.",
          "A verb inside a relative clause (that, who, whom, whose) does not make the subject an independent clause.",
        ],
        trap: `Choosing "; ${adv}," by reflex, as if the transition joined two clauses, because the long subject contains a verb.`,
        hint: "What is the main verb of this sentence, and what is its subject?",
        estimatedSeconds: 80,
        verify: () => {
          if (!parts) return false;
          const lead = sentenceLead(parts.before);
          if (lead.indexOf(head) !== 0) return false;
          const subjectOnly = !/[,;:—()]/.test(lead);
          const verbFollows = /^\s\S/.test(parts.after) && !/\s/.test(w2);
          const pattern = new RegExp(`^${escapeRe(w1)}([,;.]?) (${escapeRe(adv)})(,?) ${escapeRe(w2)}$`, "i");
          const legal = (choice) => {
            const match = choice.match(pattern);
            return Boolean(match) && match[1] === "," && match[3] === ",";
          };
          return CONJ_ADVERBS.includes(adv) && subjectOnly && verbFollows &&
            onlyKey([key, semicolon, period, none], legal);
        },
      });
    },
  };

  return [
    joinIndependentClauses,
    colonBeforeList,
    introClauseComma,
    conjunctiveAdverbJoin,
    noColonAfterVerb,
    noCommaSubjectVerb,
    seriesSemicolons,
    relativeVsPronounClause,
    closingMarkMatch,
    essentialClauseContext,
    adverbInterruptsClause,
  ];
});
