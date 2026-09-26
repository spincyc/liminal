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
  // scene.
  //
  // Choice sets are 2x2 squares over two punctuation decisions (a mark at
  // each of two places, or a mark and a word): each choice shares each
  // feature with exactly one other choice, so no single mark gives the key
  // away, and `features` declares both. Where the topic bank allows, the
  // key's corner changes from scene to scene (a comma in one sentence, a
  // semicolon in the next), so a reflex cannot replace the rule. verify()
  // re-derives the key from what each topic records about the sentence (its
  // clauses, the mark that opened an element, whether a main verb follows)
  // and checks that the choices form a square.

  const { STEM, BLANK, DOMAIN } = C;

  /* ------------------------------------------------------------- helpers */

  const SKILL = "Boundaries";

  const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  const lower = (text) => String(text).toLowerCase();
  const q = (text) => `"${text}"`;

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

  const firstWord = (text) => (text.trim().split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "");

  const SUBORDINATORS = [
    "although", "because", "when", "after", "since", "while", "before", "once", "if", "unless",
    "though", "whereas", "until", "as", "where",
  ];
  const CONJ_ADVERBS = [
    "however", "nevertheless", "consequently", "as a result", "moreover", "furthermore", "in fact",
    "instead", "meanwhile", "in contrast", "for example", "for instance", "similarly",
  ];
  const MARK_NAMES = { ",": "comma", ";": "semicolon", ":": "colon", "—": "dash", ".": "period", ")": "parenthesis", "": "none" };

  // Four [text, features, reason] rows, the key's reason being null, become
  // the instance's correct / wrong / features fields.
  function square(rows) {
    const keyRow = rows.find((row) => row[2] === null);
    const wrongRows = rows.filter((row) => row !== keyRow);
    return {
      correct: keyRow[0],
      wrong: wrongRows.map(([text, , reason]) => [text, reason]),
      features: { correct: keyRow[1], wrong: wrongRows.map(([, features]) => features) },
    };
  }

  // True when four feature records form a 2x2 square: two features with two
  // values each and every combination present once.
  function isSquare(features) {
    const records = [features.correct, ...features.wrong];
    if (records.length !== 4 || records.some((record) => !record)) return false;
    const names = Object.keys(records[0]);
    const sameNames = records.every((record) => Object.keys(record).length === 2 && names.every((name) => name in record));
    const combos = new Set(records.map((record) => names.map((name) => record[name]).join("|")));
    return names.length === 2 && sameNames && combos.size === 4 &&
      names.every((name) => new Set(records.map((record) => record[name])).size === 2);
  }

  // Builds the square for two binary decisions. `options` = [[valueA, valueB]
  // for feature 1, [valueA, valueB] for feature 2]; `render(v1, v2)` is the
  // choice text; `judge(v1, v2)` returns null for the key or a reason.
  function squareOf(names, options, render, judge) {
    const rows = [];
    options[0].forEach((first) => options[1].forEach((second) => {
      rows.push([render(first, second), { [names[0]]: first, [names[1]]: second }, judge(first, second)]);
    }));
    return square(rows);
  }

  // Explanatory text is written with straight quotes for readability here
  // and shown with the curly quotes the rest of the bank uses.
  const curly = (text) => String(text).replace(/"([^"]*)"/g, "“$1”");
  function multipleChoice(topic, choices, rest) {
    const instance = Object.assign({
      responseType: "multiple-choice",
      scene: topic.scene,
      stimulus: { type: "text", content: topic.text },
      stem: STEM,
    }, rest, choices, {
      wrong: choices.wrong.map(([value, reason]) => [value, curly(reason)]),
      explanation: curly(rest.explanation),
      steps: rest.steps.map(curly),
      principles: rest.principles.map(curly),
      trap: curly(rest.trap),
      hint: curly(rest.hint),
    });
    return instance;
  }

  /* ------------------------------------ B1: joining two clauses, or two verbs */

  // Each topic: the blank sits between w1 and w2. Either w2 begins a second
  // independent clause (`c2` = its subject and verb), which "and" can join
  // only with a comma before it; or w2 is a second verb of the same subject
  // (`verbs`), which "and" joins with no comma; or w2 is "that", opening a
  // restrictive clause that describes w1 (`described`), which takes neither
  // a comma nor "and". The three kinds are about equally common, so the
  // key's corner (and its length) changes from scene to scene.
  const JOIN_CLAUSE_TOPICS = [
    {
      scene: "sec-cahokia-mounds",
      text: "Around 1100 CE, Cahokia, near present-day St. Louis, was the largest city in North America north of Mexico. Its central earthwork, Monks Mound, rises about thirty meters above the surrounding ______ base covers more ground than that of the Great Pyramid of Giza.",
      w1: "plain", w2: "its", c1: ["Monks Mound", "rises"], c2: ["base", "covers"],
    },
    {
      scene: "sec-stride-piano",
      text: "Stride piano flourished in Harlem during the 1920s. A stride pianist's left hand leaps back and forth between a low bass note and a chord near the middle of the ______ right hand plays the melody above that steady, bouncing pulse.",
      w1: "keyboard", w2: "the", c1: ["left hand", "leaps"], c2: ["right hand", "plays"],
    },
    {
      scene: "sec-theremin-hands",
      text: "The theremin, invented by the Russian physicist Leon Theremin around 1920, is played without being touched. The player's right hand moves toward and away from a vertical ______ distance between that hand and the antenna controls the pitch.",
      w1: "antenna", w2: "the", c1: ["right hand", "moves"], c2: ["distance", "controls"],
    },
    {
      scene: "sec-naked-mole-rats",
      text: "Naked mole-rats live in underground colonies in East Africa, organized much like colonies of bees or ants. A single queen gives birth to all of the colony's ______ other members dig tunnels, gather roots to eat, and defend the nest.",
      w1: "young", w2: "the", c1: ["queen", "gives"], c2: ["members", "dig"],
    },
    {
      scene: "sec-urushi-lacquer",
      text: "Traditional Japanese lacquerware can take months to finish. A craftsperson brushes a thin coat of lacquer onto a carved wooden ______ coat must then harden in a warm, humid cabinet for a day or more before the next one goes on.",
      w1: "bowl", w2: "each", c1: ["craftsperson", "brushes"], c2: ["coat", "must then harden"],
    },
    {
      scene: "sec-monarch-roosts",
      text: "Each autumn, monarch butterflies from eastern North America fly thousands of kilometers to fir forests in the mountains of central Mexico. Millions of butterflies may cluster in a single ______ weight of so many insects can bend the branches toward the ground.",
      w1: "grove", w2: "the", c1: ["Millions", "may cluster"], c2: ["weight", "can bend"],
    },
    {
      scene: "sec-fog-nets",
      text: "In parts of Chile's coastal desert, rain almost never falls, but thick fog rolls in from the Pacific on many mornings. Villagers stretch fine plastic nets across the ______ of fog collect on the mesh and drip into troughs below.",
      w1: "hillsides", w2: "droplets", c1: ["Villagers", "stretch"], c2: ["droplets", "collect"],
    },
    {
      scene: "sec-sign-language-dance",
      text: "Choreographer Lena Okonjo builds her dances from the handshapes of American Sign Language. In her piece Common Ground, dancers repeat a single sign until it grows into a large, sweeping ______ Deaf audience members often recognize the original word long before hearing viewers do.",
      w1: "motion", w2: "many", c1: ["dancers", "repeat"], c2: ["Deaf audience members", "recognize"],
    },
    {
      scene: "sec-caravanserai",
      text: "Along the trade routes of medieval Persia, merchants stopped each night at walled inns called caravanserais. Camels and horses were kept in the open central ______ slept in small rooms that lined the surrounding walls.",
      w1: "courtyard", w2: "travelers", c1: ["Camels and horses", "were kept"], c2: ["travelers", "slept"],
    },
    {
      scene: "sec-tolan-beaver-dams",
      text: "The ecologist Ines Varga studies how beavers change the streams of the Tolan Valley. Each summer, she walks the length of the valley's main ______ records the height of every dam she finds, from low piles of sticks to walls taller than she is.",
      w1: "creek", w2: "records", subject: "she", verbs: ["walks", "records"],
    },
    {
      scene: "sec-waggle-dance",
      text: "A honeybee colony shares news of food in an unusual way. Worker bees that find a rich patch of flowers fly back to the ______ perform a “waggle dance” that tells other workers the direction and distance of the food.",
      w1: "hive", w2: "perform", subject: "Worker bees", verbs: ["fly", "perform"],
    },
    {
      scene: "sec-powell-expedition",
      text: "In 1869, the geologist John Wesley Powell led nine men down the Green and Colorado Rivers in wooden boats. The expedition mapped hundreds of kilometers of ______ gave many landmarks the names they still carry.",
      w1: "canyon", w2: "gave", subject: "The expedition", verbs: ["mapped", "gave"],
    },
    {
      scene: "sec-harlow-garden-plots",
      text: "The Harlow Community Garden lends small plots to residents who have no yards of their own. Most gardeners plant vegetables in the ______ share their extra harvest with a food bank in the fall.",
      w1: "spring", w2: "share", subject: "Most gardeners", verbs: ["plant", "share"],
    },
    {
      scene: "sec-lindqvist-recordings",
      text: "Before performing a new piece, the pianist Tomas Lindqvist listens to several recordings of ______ writes notes in the margins of his score about each performer's choices.",
      w1: "it", w2: "writes", subject: "the pianist Tomas Lindqvist", verbs: ["listens", "writes"],
    },
    {
      scene: "sec-turtle-hatchlings",
      text: "Sea turtles hatch at night from nests buried in sandy beaches. The hatchlings dig their way up through the ______ crawl toward the brightest part of the horizon, which on an undeveloped beach is usually the moonlit sea.",
      w1: "sand", w2: "crawl", subject: "The hatchlings", verbs: ["dig", "crawl"],
    },
    {
      scene: "sec-portrait-varnish",
      text: "Conservators at the Varden Museum spent a year cleaning a nineteenth-century portrait. They removed a layer of yellowed varnish from the ______ found a signature that no one had noticed for more than a century.",
      w1: "canvas", w2: "found", subject: "They", verbs: ["removed", "found"],
    },
    {
      scene: "sec-autumn-nutrients",
      text: "As days shorten in the fall, many deciduous trees stop producing chlorophyll in their ______ draw nitrogen and other nutrients back into their branches before the leaves drop.",
      w1: "leaves", w2: "draw", subject: "many deciduous trees", verbs: ["stop", "draw"],
    },
    {
      scene: "sec-lyrebird-mound",
      text: "The superb lyrebird of southeastern Australia is famous for its songs. A courting male scratches together a low mound of soil on the forest ______ sings a long medley of calls copied from dozens of other bird species.",
      w1: "floor", w2: "sings", subject: "A courting male", verbs: ["scratches", "sings"],
    },
    {
      scene: "sec-kazumura-lava-tube",
      text: "When the surface of a lava flow cools into a solid crust, molten rock can keep flowing through a tunnel beneath it. On the slopes of Kilauea in Hawaii, cave surveyors have mapped a single lava ______ runs for more than sixty kilometers beneath the forest.",
      w1: "tube", w2: "that", described: "tube",
    },
    {
      scene: "sec-harrison-sea-clock",
      text: "For centuries, sailors could not work out their longitude at sea, because doing so required knowing the exact time at their home port. The English clockmaker John Harrison spent more than thirty years building a ______ could keep accurate time on a rolling, pitching ship.",
      w1: "clock", w2: "that", described: "clock",
    },
    {
      scene: "sec-varden-rain-gauge",
      text: "Before the Varden Observatory bought its first telescope, it served the town as a weather station. Its founder, Margit Lund, designed a brass rain ______ measured each day's rainfall to a tenth of a millimeter.",
      w1: "gauge", w2: "that", described: "rain gauge",
    },
    {
      scene: "sec-hong-kong-bamboo",
      text: "Builders in Hong Kong still wrap even the tallest skyscrapers in bamboo scaffolding during construction. Workers lash the poles together with strips of black ______ can be cut away quickly when the job is finished.",
      w1: "nylon", w2: "that", described: "strips of nylon",
    },
    {
      scene: "sec-elaiosome-seeds",
      text: "Many forest wildflowers depend on ants to plant their seeds. Each seed of a bloodroot or a trillium carries a small, fatty ______ attracts ants, which drag the seed back to their nest, eat the fatty part, and discard the seed in the nest's rich soil.",
      w1: "appendage", w2: "that", described: "appendage",
    },
    {
      scene: "sec-chand-baori-steps",
      text: "In the dry regions of western India, communities once built stepwells, stone structures that reach far down to the water below. At Chand Baori in Rajasthan, visitors look down on about 3,500 narrow ______ zigzag down thirteen stories to a pool at the bottom.",
      w1: "steps", w2: "that", described: "steps",
    },
    {
      scene: "sec-kessel-signal-fires",
      text: "For centuries, shepherds in the Kessel Hills warned one another of approaching storms with signal fires. Each village kept a stack of dry ______ could be carried to the nearest ridge and lit within minutes.",
      w1: "brush", w2: "that", described: "stack of dry brush",
    },
    {
      scene: "sec-dunmore-bell-tower",
      text: "The town hall in Dunmore has rung the same iron bell since 1874. The bell hangs in a wooden ______ was rebuilt twice after lightning strikes, though the bell itself has never cracked.",
      w1: "tower", w2: "that", described: "tower",
    },
    {
      scene: "sec-slime-mold-maze",
      text: "In an experiment published in 2000, researchers placed a slime mold in a small maze with food at two of its exits. The mold first filled the maze with a network of ______ carried nutrients, then withdrew from the dead ends until a single tube joined the food along the shortest route.",
      w1: "tubes", w2: "that", described: "tubes",
    },
  ];

  const joinIndependentClauses = {
    id: "sec-join-independent-clauses",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Easy",
    title: "Comma and “and” at the blank: two clauses, two verbs, or a describing clause",
    recognize:
      "Check what follows the blank: a new subject and verb (a second independent clause, joined by a comma and “and”), just a second verb for the same subject (joined by “and” alone), or a “that” clause describing the noun before the blank (joined by nothing).",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["comma-splice"],
    build(t) {
      const topic = t.pick(JOIN_CLAUSE_TOPICS);
      const { w1, w2 } = topic;
      const kind = topic.c2 ? "clauses" : topic.verbs ? "verbs" : "described";
      const render = (comma, conj) => `${w1}${comma === "yes" ? "," : ""}${conj === "yes" ? " and" : ""} ${w2}`;
      const KEYS = { clauses: ["yes", "yes"], verbs: ["no", "yes"], described: ["no", "no"] };
      const second = {
        clauses: () => `a second independent clause, with its own subject and verb (${topic.c2[0]} ${topic.c2[1]})`,
        verbs: () => `a second verb, ${q(topic.verbs[1])}, for the same subject, ${q(topic.subject)}`,
        described: () => `a clause beginning with "that" that tells which ${topic.described} the sentence means`,
      }[kind]();
      const choices = squareOf(["comma", "conjunction"], [["yes", "no"], ["yes", "no"]], render, (comma, conj) => {
        const text = render(comma, conj);
        if (comma === KEYS[kind][0] && conj === KEYS[kind][1]) return null;
        if (kind === "clauses") {
          if (comma === "yes") return `A comma alone cannot join two independent clauses; "${text}" creates a comma splice.`;
          if (conj === "yes") return `When "and" joins two independent clauses, a comma goes before it; "${text}" leaves the comma out.`;
          return `With no punctuation and no conjunction, "${text}" runs two independent clauses together.`;
        }
        if (kind === "verbs") {
          if (conj === "yes") return `"And" here joins two verbs that share the subject "${topic.subject}", not two clauses, so no comma goes before it.`;
          if (comma === "yes") return `A comma alone cannot link the two verbs "${topic.verbs[0]}" and "${topic.verbs[1]}"; they need "and" to join them.`;
          return `With nothing between them, "${text}" runs the second verb into the words before it.`;
        }
        if (conj === "yes") {
          return `"And" would join the "that" clause to the words before it as if it were a second clause or verb, but it only describes the ${w1}${comma === "yes" ? "; the comma is also wrong" : ""}.`;
        }
        return `A clause beginning with "that" identifies which ${topic.described} the sentence means, so no comma separates it from "${w1}."`;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: {
          clauses: `The words after the blank form ${second}, so the blank joins two independent clauses. A comma followed by "and" joins them: "${choices.correct}".`,
          verbs: `The words after the blank begin ${second}; there is no new subject. "And" joins two verbs of one subject without a comma: "${choices.correct}".`,
          described: `The words after the blank are ${second}; "that" is its subject, and it is part of the same clause. Nothing separates it from the noun it describes: "${choices.correct}".`,
        }[kind],
        steps: [
          "Look at the words right after the blank.",
          "Ask whether they bring a new subject and verb, only a second verb for the subject already named, or a “that” clause describing the noun before the blank.",
          "Two clauses: comma plus “and.” Two verbs of one subject: “and” with no comma. A describing “that” clause: nothing.",
        ],
        principles: [
          "A comma and a coordinating conjunction such as “and” can join two independent clauses; a comma alone cannot.",
          "When “and” joins two verbs that share one subject, no comma goes before it.",
          "A clause beginning with “that” that identifies the noun before it is not set off by a comma.",
        ],
        trap: {
          clauses: "Leaving out the comma before “and,” or keeping the comma but dropping “and,” which creates a comma splice.",
          verbs: "Adding a comma before “and” out of habit, though what follows is only a second verb, not a new clause.",
          described: "Reaching for a comma or “and” because a new verb follows, though the “that” clause only describes the noun before it.",
        }[kind],
        hint: "Does a new subject follow the blank, only a new verb, or a clause that describes the noun before it?",
        estimatedSeconds: 50,
      });
      instance.verify = () => {
        const parts = around(topic.text);
        if (!parts) return false;
        const lead = sentenceLead(parts.before);
        const tail = `${w2}${parts.after}`;
        const structure = {
          clauses: () => lead.includes(topic.c1[0]) && lead.includes(topic.c1[1]) && tail.includes(topic.c2[0]) && tail.includes(topic.c2[1]) &&
            !SUBORDINATORS.includes(firstWord(lead)),
          verbs: () => lead.includes(topic.subject) && lead.includes(` ${topic.verbs[0]} `) && w2 === topic.verbs[1],
          // "that" is the clause's subject: a verb follows it at once.
          described: () => w2 === "that" && /^\s[a-z]+\b/.test(parts.after) && `${lead}${w1}`.endsWith(topic.described.split(" ").pop()) &&
            !/,\s*$/.test(parts.before),
        }[kind]();
        return structure && instance.correct === render(...KEYS[kind]) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------------------ B2: colon before a list */

  // Each topic: a complete clause announcing `count` things ends with w1;
  // the blank covers the colon, the first item (`first`), the mark between
  // the first and second items, and the second item's first word (`next`).
  // Items that contain commas of their own (`complex`) are separated by
  // semicolons; plain items by commas.
  const COLON_LIST_TOPICS = [
    {
      scene: "sec-roman-harbor-concrete",
      text: "Roman engineers built harbor walls from a concrete that has survived in seawater for two thousand years. Their mixture combined three main dry ______ ash, and chunks of volcanic rock.",
      w1: "ingredients", first: "lime", next: "volcanic", count: 3, clause: ["mixture", "combined"],
    },
    {
      scene: "sec-ferrand-trio-album",
      text: "The pianist Odile Ferrand wanted listeners to hear each instrument on her 1962 album clearly, so she kept the group small. The recording features only three ______ bassist, and a drummer.",
      w1: "musicians", first: "Ferrand", next: "a", count: 3, clause: ["recording", "features"],
    },
    {
      scene: "sec-hanok-materials",
      text: "Traditional Korean houses called hanok were designed to stay cool in summer and warm in winter. Their builders relied on three natural ______, and clay mixed with straw.",
      w1: "materials", first: "wood", next: "stone", count: 3, clause: ["builders", "relied"],
    },
    {
      scene: "sec-noh-hayashi",
      text: "Noh, a form of Japanese theater that dates to the fourteenth century, is accompanied by a small ensemble called the hayashi. The ensemble uses up to four ______ shoulder drum, a hip drum, and a stick drum.",
      w1: "instruments", first: "a flute", next: "a", count: 4, clause: ["ensemble", "uses"],
    },
    {
      scene: "sec-huila-coffee-changes",
      text: "Agronomist Lucía Beltrán asked coffee farmers in the Tolan highlands how they were adapting to rising temperatures. Most farmers described the same three ______ to hardier varieties, and moving their plots to higher ground.",
      w1: "changes", first: "planting shade trees", next: "switching", count: 3, clause: ["farmers", "described"],
    },
    {
      scene: "sec-cape-rook-banding",
      text: "Every bird caught at the Cape Rook banding station is measured before it is released. Volunteers record three details about each ______ length of its wing, and the amount of fat visible under its skin.",
      w1: "bird", first: "its weight", next: "the", count: 3, clause: ["Volunteers", "record"],
    },
    {
      scene: "sec-lost-wax-casting",
      text: "Bronze sculptors have used the lost-wax method for more than five thousand years. Sculptor Amara Diallo describes her version of the process in four ______ it in clay, melting the wax out in a kiln, and pouring molten bronze into the hollow.",
      w1: "steps", first: "carving a wax model", next: "coating", count: 4, clause: ["Amara Diallo", "describes"],
    },
    {
      scene: "sec-whistled-languages",
      text: "Whistled languages let speakers communicate across valleys where shouting would not carry. Such languages are still used in at least three ______ Turkish village of Kuşköy, and the mountains of Oaxaca in Mexico.",
      w1: "places", first: "the island of La Gomera", next: "the", count: 3, clause: ["languages", "are still used"],
    },
    {
      scene: "sec-aviation-poster-tour",
      text: "The Hollis Museum's exhibit of early aviation posters has drawn record crowds since it opened in March. The exhibit will travel to three cities next ______, Idaho; and Missoula, Montana.",
      w1: "year", first: "Portland, Oregon", next: "Boise", count: 3, clause: ["exhibit", "will travel"], complex: true,
    },
    {
      scene: "sec-water-conference-panel",
      text: "Organizers of this year's water conference wanted its opening session to cover the whole water cycle. The opening panel brought together three ______ Haddad, a hydrologist; and Lena Park, a climate modeler.",
      w1: "scientists", first: "Ana Ruiz, a geologist", next: "Omar", count: 3, clause: ["panel", "brought"], complex: true,
    },
    {
      scene: "sec-dunmore-film-night",
      text: "The Dunmore Film Festival shows only work by filmmakers who grew up in the valley. This year the festival will open with three short ______ Lights, a drama; and Kite, an animated film.",
      w1: "films", first: "Ice Road, a documentary", next: "Harbor", count: 3, clause: ["festival", "will open"], complex: true,
    },
    {
      scene: "sec-tallis-program-parts",
      text: "The Tallis Street Youth Choir performs music from many traditions. Its spring program has three ______ motet by Heinrich Schütz; and a new piece by the composer Ruth Adebayo.",
      w1: "parts", first: "a Georgian folk song, sung without accompaniment", next: "a", count: 3, clause: ["program", "has"], complex: true,
    },
  ];

  const NUMBER_WORDS = { 2: "two", 3: "three", 4: "four" };

  const colonBeforeList = {
    id: "sec-colon-before-list",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Easy",
    title: "Colon introducing a list, and the marks between its items",
    recognize:
      "A complete clause announces a number of things, so a colon introduces the list; the items are separated by commas, or by semicolons when the items contain commas of their own.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule"],
    build(t) {
      const topic = t.pick(COLON_LIST_TOPICS);
      const { w1, first, next } = topic;
      const complex = Boolean(topic.complex);
      const render = (intro, separator) => `${w1}${intro === "colon" ? ":" : ";"} ${first}${separator === "comma" ? "," : ";"} ${next}`;
      const keySeparator = complex ? "semicolon" : "comma";
      const choices = squareOf(["intro", "separator"], [["colon", "semicolon"], ["comma", "semicolon"]], render, (intro, separator) => {
        const problems = [];
        if (intro === "semicolon") problems.push(`a semicolon must separate two independent clauses, and the list after "${w1}" is not a clause`);
        if (separator !== keySeparator) {
          problems.push(complex
            ? `each item already contains a comma ("${first}"), so a comma between items would blur where one ends; semicolons separate them, as the rest of the list shows`
            : "semicolons separate list items only when the items contain commas of their own; these do not, so commas separate them, as the rest of the list shows");
        }
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const countWord = NUMBER_WORDS[topic.count];
      const instance = multipleChoice(topic, choices, {
        explanation: `The clause ending with "${w1}" is complete and announces ${countWord} items, so a colon introduces them. ${complex
          ? `The items contain commas of their own ("${first}"), so semicolons separate them`
          : "The items are plain, so commas separate them"}: "${choices.correct}".`,
        steps: [
          "Check that the words before the blank form a complete sentence that announces a list.",
          "Introduce the list with a colon, not a semicolon.",
          "Look inside the items: if they contain commas, separate the items with semicolons; otherwise, with commas.",
        ],
        principles: [
          "A colon can introduce a list, but only after an independent clause; a semicolon never introduces a list.",
          "Items in a series are separated by commas, unless the items themselves contain commas; then semicolons separate them.",
        ],
        trap: "Choosing the semicolon because it looks like a stronger comma; a semicolon never introduces a list.",
        hint: "Is the part after the blank a clause of its own, or the items the clause promised? And do the items contain commas?",
        estimatedSeconds: 55,
      });
      instance.verify = () => {
        const parts = around(topic.text);
        if (!parts) return false;
        const lead = sentenceLead(parts.before);
        const announced = new RegExp(`\\b${countWord}\\b`).test(lead);
        const complete = lead.includes(topic.clause[0]) && lead.includes(topic.clause[1]);
        // The rest of the list shows which separator the items use.
        const restUsesSemicolons = /;/.test(parts.after);
        const derived = first.includes(",") ? "semicolon" : "comma";
        return announced && complete && restUsesSemicolons === complex && derived === keySeparator &&
          instance.correct === render("colon", derived) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------------ B3: introductory dependent clause */

  // Two kinds of sentence. "intro": it opens with a dependent clause (`sub`)
  // that ends at the blank, and the main clause (`main`) follows, so a comma
  // joins them; adding "and" would leave the dependent clause without a main
  // clause. "joined": the sentence before the blank is already complete (it
  // merely ends with a dependent clause) and a new independent clause
  // (`main`) follows, so a comma alone would be a splice and the clauses need
  // a comma and a conjunction (`conj`).
  const INTRO_CLAUSE_TOPICS = [
    {
      scene: "sec-great-zimbabwe",
      text: "Great Zimbabwe, a city of stone in southern Africa, was the center of a wealthy trading state from the eleventh to the fifteenth century. Although its builders used no ______ granite walls of its Great Enclosure still stand as high as eleven meters.",
      kind: "intro", sub: "Although", w1: "mortar", w2: "the", main: ["walls", "stand"],
    },
    {
      scene: "sec-transcontinental-railroad",
      text: "The first railroad to cross the United States was completed in May 1869 at Promontory Summit, Utah. Before the line ______ trip from New York to San Francisco could take months by wagon or by ship.",
      kind: "intro", sub: "Before", w1: "opened", w2: "the", main: ["trip", "could take"],
    },
    {
      scene: "sec-teen-museum-guides",
      text: "The Cárdenas Museum trains high school students to lead tours of its galleries on weekends. Since the program began in ______ number of teenagers visiting the museum has more than doubled.",
      kind: "intro", sub: "Since", w1: "2016", w2: "the", main: ["number", "has more than doubled"],
    },
    {
      scene: "sec-okapi",
      text: "The okapi, a forest relative of the giraffe, lives only in the rainforests of the Democratic Republic of the Congo. Although European scientists heard reports of the animal for ______ did not formally describe it until 1901.",
      kind: "intro", sub: "Although", w1: "years", w2: "they", main: ["they", "did not formally describe"],
    },
    {
      scene: "sec-lowe-drafts",
      text: "The poet Idris Lowe kept every draft of his poems in labeled folders, which his family later donated to the public library in the town of Selby. When scholars compared the drafts of his best-known ______ found that he had rewritten its final line more than thirty times.",
      kind: "intro", sub: "When", w1: "poem", w2: "they", main: ["they", "found"],
    },
    {
      scene: "sec-harwell-steam-pumper",
      text: "The town of Harwell relied on volunteers with a hand-pumped wagon to fight fires for nearly thirty years. When the town bought its first steam-powered fire engine in ______ old wagon was sold for scrap.",
      kind: "intro", sub: "When", w1: "1879", w2: "the", main: ["wagon", "was sold"],
    },
    {
      scene: "sec-whale-calls-distance",
      text: "Some whales communicate with calls so low that people can barely hear them. Because low-pitched sounds lose little energy as they travel through deep ______ whales can hear one another's calls across hundreds of kilometers of ocean.",
      kind: "intro", sub: "Because", w1: "water", w2: "some", main: ["whales", "can hear"],
    },
    {
      scene: "sec-varden-old-telescope",
      text: "The Varden Observatory now does most of its research with a computer-controlled telescope. Although its first telescope was built in London in ______ is still used on public nights, when visitors line up to look at the Moon.",
      kind: "intro", sub: "Although", w1: "1864", w2: "it", main: ["it", "is still used"],
    },
    {
      scene: "sec-mauna-kea-air",
      text: "Mauna Kea, a dormant volcano on the island of Hawaii, holds more than a dozen large telescopes on its summit. Because the air above the summit is unusually dry and ______ astronomers there can observe faint objects that would be blurred at most other sites.",
      kind: "intro", sub: "Because", w1: "still", w2: "astronomers", main: ["astronomers", "can observe"],
    },
    {
      scene: "sec-ellisfort-brick-oven",
      text: "The bakery on Main Street in Ellisfort still bakes its bread in a brick oven built in 1902. Although the oven takes three hours to ______ bakers there have refused every offer to replace it with a modern gas model.",
      kind: "intro", sub: "Although", w1: "heat", w2: "the", main: ["bakers", "have refused"],
    },
    {
      scene: "sec-homing-pigeons",
      text: "Homing pigeons can find their way back to their lofts from hundreds of kilometers away. The birds appear to steer by the position of the sun when the sky is ______ on overcast days they seem to rely on Earth's magnetic field instead.",
      kind: "joined", conj: "but", w1: "clear", w2: "on", first: ["birds", "appear"], main: ["they", "seem"],
    },
    {
      scene: "sec-bridge-expansion",
      text: "Engineers attached sensors to the steel Lowell Street Bridge to record how it responds to changes in temperature. The bridge's deck expands by several centimeters as the air warms each ______ it shrinks back again after sunset.",
      kind: "joined", conj: "and", w1: "afternoon", w2: "it", first: ["deck", "expands"], main: ["it", "shrinks"],
    },
    {
      scene: "sec-herbarium-seeds",
      text: "Botanist Esther Oduya tried to germinate seeds taken from dried plant specimens collected in the 1870s. Most of the seeds failed to sprout even after she soaked them for a ______ three species produced healthy seedlings.",
      kind: "joined", conj: "but", w1: "week", w2: "three", first: ["Most", "failed"], main: ["species", "produced"],
    },
    {
      scene: "sec-mailed-ballots",
      text: "Political scientist Aaron Feld compared voter turnout in towns that mailed ballots to every resident with turnout in towns that did not. Turnout was higher where ballots arrived by ______ Feld cautions that the mailed-ballot towns were also wealthier on average.",
      kind: "joined", conj: "but", w1: "mail", w2: "Feld", first: ["Turnout", "was"], main: ["Feld", "cautions"],
    },
    {
      scene: "sec-great-wave-print",
      text: "Katsushika Hokusai's The Great Wave off Kanagawa was published as a woodblock print around 1831. A carved block could be inked and pressed onto paper many times before it wore ______ the print was sold in large numbers at a modest price.",
      kind: "joined", conj: "so", w1: "out", w2: "the", first: ["block", "could be inked"], main: ["print", "was sold"],
    },
  ];

  const introClauseComma = {
    id: "sec-intro-clause-comma",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Easy",
    title: "Where a dependent clause ends",
    recognize:
      "Find where the dependent clause belongs. If the sentence opens with it, a comma joins it to the main clause; if it only ends a complete clause, what follows is a new independent clause that needs a comma and a conjunction.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "comma-splice"],
    build(t) {
      const topic = t.pick(INTRO_CLAUSE_TOPICS);
      const { w1, w2 } = topic;
      const intro = topic.kind === "intro";
      const parts = around(topic.text);
      const lead = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      let choices;
      if (intro) {
        const render = (mark, conj) => `${w1}${mark === "comma" ? "," : ";"}${conj === "yes" ? " and" : ""} ${w2}`;
        choices = squareOf(["mark", "conjunction"], [["comma", "semicolon"], ["yes", "no"]], render, (mark, conj) => {
          const problems = [];
          if (mark === "semicolon") problems.push(`a semicolon must follow an independent clause, but the clause beginning "${topic.sub}" is dependent`);
          if (conj === "yes") problems.push(`"and" would join the dependent clause beginning "${topic.sub}" to the main clause as if both were independent, leaving the "${topic.sub}" clause with nothing to attach to`);
          return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
        });
      } else {
        const render = (mark, conj) => `${w1}${mark === "comma" ? "," : ""}${conj === "yes" ? ` ${topic.conj}` : ""} ${w2}`;
        choices = squareOf(["mark", "conjunction"], [["comma", "none"], ["yes", "no"]], render, (mark, conj) => {
          if (mark === "comma" && conj === "yes") return null;
          if (mark === "comma") return `The words before the blank are already a complete sentence, and a new independent clause follows; a comma alone between them is a comma splice.`;
          if (conj === "yes") return `When "${topic.conj}" joins two independent clauses, a comma goes before it.`;
          return "With no punctuation and no conjunction, two independent clauses run together.";
        });
      }
      const instance = multipleChoice(topic, choices, {
        explanation: intro
          ? `Because it begins with "${topic.sub}", the clause "${lead}" is dependent: it cannot stand alone. A dependent clause that opens a sentence joins the main clause (whose subject and verb are "${topic.main[0]}" and "${topic.main[1]}") with a comma alone: "${choices.correct}".`
          : `"${lead}" is already a complete sentence (its subject and verb are "${topic.first[0]}" and "${topic.first[1]}"); the dependent clause at its end does not change that. A new independent clause follows ("${topic.main[0]} ... ${topic.main[1]}"), so the two need a comma and a conjunction: "${choices.correct}".`,
        steps: [
          "Find the subject and main verb of the sentence that holds the blank.",
          "Decide whether the words before the blank are a dependent clause that opens the sentence or a complete clause that merely ends with one.",
          "Opening dependent clause: a comma alone. Complete clause followed by another: a comma and a conjunction.",
        ],
        principles: [
          "An introductory dependent clause is joined to the main clause with a comma.",
          "Two independent clauses need a comma and a coordinating conjunction (or a semicolon); a comma alone is a comma splice, even when the first clause ends with a dependent clause.",
        ],
        trap: intro
          ? "Seeing a subject and verb on each side and treating the dependent clause as independent."
          : `Adding a comma by reflex after the clause beginning with a subordinating word, though the sentence was already complete and a new clause follows.`,
        hint: "Where does the dependent clause belong: at the start of this sentence, or at the end of a complete one?",
        estimatedSeconds: 55,
      });
      instance.verify = () => {
        if (!parts) return false;
        const sentence = sentenceLead(parts.before);
        const tail = `${w2}${parts.after}`;
        const opensWithSub = SUBORDINATORS.includes(firstWord(sentence));
        const endsWithSub = !opensWithSub && sentence.split(/\s+/).slice(1).some((word) => SUBORDINATORS.includes(lower(word)));
        const kind = opensWithSub ? "intro" : endsWithSub ? "joined" : null;
        const main = tail.includes(topic.main[0]) && tail.includes(topic.main[1]);
        const firstClause = intro || (sentence.includes(topic.first[0]) && sentence.includes(topic.first[1]));
        const key = kind === "intro" ? `${w1}, ${w2}` : `${w1}, ${topic.conj} ${w2}`;
        return kind === topic.kind && main && firstClause && instance.correct === key && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------------ B4: conjunctive adverb between clauses */

  // Each topic: the blank holds w1, a mark, the transition `adv`, a mark,
  // and w2. The choices cross the mark before `adv` (a sentence boundary or
  // a comma) with the mark after it (a comma or a boundary); the boundary is
  // a semicolon or, with capitals, a period (`mark`). Three kinds:
  // "second": two independent clauses, the first opening the passage, and
  //   `adv` begins the second ("; adv," or ". Adv,");
  // "first": two independent clauses after a sentence that the first one
  //   answers, so `adv` ends the first clause (", adv;" or ", adv. W2");
  // "interrupt": `adv` sits between a short subject and its verb (w2), so
  //   commas set it off (", adv,").
  const ADVERB_JOIN_TOPICS = [
    {
      scene: "sec-lowland-pikas",
      text: "Ecologist Maren Holt expected American pikas, small relatives of rabbits that overheat easily, to vanish from the low slopes of the Tolan Range as summers grew ______ found thriving colonies living among cool, ice-filled piles of rock well below the predicted limit.",
      kind: "second", mark: "period", w1: "hotter", adv: "however", w2: "she", c1: ["Maren Holt", "expected"], c2: ["she", "found"],
      link: "contrasts what Holt expected with what she found",
    },
    {
      scene: "sec-panama-canal-locks",
      text: "Ships crossing Panama must pass over land that rises well above sea level at the continental ______ canal uses sets of locks to lift vessels about 26 meters up to Gatun Lake and lower them again on the other side.",
      kind: "second", mark: "semicolon", w1: "divide", adv: "consequently", w2: "the", c1: ["Ships", "must pass"], c2: ["the canal", "uses"],
      link: "presents the locks as a result of the rise in the land",
    },
    {
      scene: "sec-serial-novel",
      text: "Novelist Adaeze Nwosu first published The Salt Road in weekly installments in a city ______ chapter ends with an unresolved question meant to bring readers back the following week.",
      kind: "second", mark: "period", w1: "newspaper", adv: "as a result", w2: "each", c1: ["Adaeze Nwosu", "published"], c2: ["each chapter", "ends"],
      link: "presents the cliffhanger endings as a result of the weekly publication",
    },
    {
      scene: "sec-bilingual-switching",
      text: "Several earlier studies of children who speak two languages had reported that they switch between tasks much faster than children who speak ______ Marco Ricci's far larger study found only a small difference between the two groups.",
      kind: "second", mark: "period", w1: "one", adv: "in contrast", w2: "psychologist", c1: ["studies", "had reported"], c2: ["study", "found"],
      link: "contrasts Ricci's result with the earlier studies",
    },
    {
      scene: "sec-castell-pigments",
      text: "The painter Rhea Castell refuses to buy tubes of prepared ______ grinds her own pigments from minerals she collects on hikes near her studio in the Kessel Hills.",
      kind: "second", mark: "semicolon", w1: "paint", adv: "instead", w2: "she", c1: ["Rhea Castell", "refuses"], c2: ["she", "grinds"],
      link: "presents grinding her own pigments as what she does in place of buying paint",
    },
    {
      scene: "sec-selby-farm-diaries",
      text: "Historian Paul Ashby hoped that nineteenth-century diaries would reveal how farm families in the Selby Valley divided household ______ diaries he found recorded the weather and crop prices far more often than daily chores.",
      kind: "second", mark: "semicolon", w1: "work", adv: "however", w2: "the", c1: ["Paul Ashby", "hoped"], c2: ["the diaries", "recorded"],
      link: "contrasts what Ashby hoped to learn with what the diaries recorded",
    },
    {
      scene: "sec-water-holding-frog",
      text: "Some frogs survive long droughts by burrowing underground and waiting for ______ water-holding frog of Australia's interior can stay buried for more than a year inside a cocoon made of its own shed skin.",
      kind: "second", mark: "period", w1: "rain", adv: "for example", w2: "the", c1: ["Some frogs", "survive"], c2: ["the water-holding frog", "can stay"],
      link: "introduces one frog as an example of the general claim",
    },
    {
      scene: "sec-fringe-lipped-bat",
      text: "Most bats that hunt at night catch insects in the air. The fringe-lipped bat of Central America hunts ______ finds them by homing in on the calls that male frogs make to attract mates.",
      kind: "first", mark: "semicolon", w1: "frogs", adv: "however", w2: "it", c1: ["fringe-lipped bat", "hunts"], c2: ["it", "finds"],
      link: "sets this bat's prey against the insects that most bats catch", rest: "explains how the bat finds its prey",
    },
    {
      scene: "sec-mole-rat-temperature",
      text: "Almost all mammals keep their bodies at a steady temperature, whatever the weather. The naked mole-rat of East Africa is an ______ body temperature rises and falls with the temperature of its underground burrow.",
      kind: "first", mark: "period", w1: "exception", adv: "however", w2: "its", c1: ["naked mole-rat", "is"], c2: ["body temperature", "rises"],
      link: "sets the mole-rat against the mammals described in the first sentence", rest: "describes how the mole-rat is an exception",
    },
    {
      scene: "sec-tomato-fruit",
      text: "In the kitchen, tomatoes are usually treated as vegetables. Botanists classify them as ______ tomato develops from the ovary of a flower and holds the plant's seeds.",
      kind: "first", mark: "period", w1: "fruits", adv: "however", w2: "a", c1: ["Botanists", "classify"], c2: ["tomato", "develops"],
      link: "sets the botanists' view against the kitchen view in the first sentence", rest: "explains why botanists call tomatoes fruits",
    },
    {
      scene: "sec-african-lungfish",
      text: "Fish take the oxygen they need from water, using their gills. The African lungfish can breathe ______ its pond dries up, it burrows into the mud and survives for months by breathing air alone.",
      kind: "first", mark: "semicolon", w1: "air", adv: "however", w2: "when", c1: ["African lungfish", "can breathe"], c2: ["it", "burrows"],
      link: "sets the lungfish against the fish described in the first sentence", rest: "describes how the lungfish uses that ability",
    },
    {
      scene: "sec-hoatzin-leaves",
      text: "Most birds that eat plants feed on seeds, fruit, or nectar. The hoatzin of South American swamps eats mostly ______ in its enlarged crop break down this tough food, much as microbes in a cow's stomach break down grass.",
      kind: "first", mark: "period", w1: "leaves", adv: "in contrast", w2: "bacteria", c1: ["hoatzin", "eats"], c2: ["bacteria", "break down"],
      link: "sets the hoatzin's diet against the diets described in the first sentence", rest: "explains how the bird digests leaves",
    },
    {
      scene: "sec-atlantic-salmon-waters",
      text: "Most fish spend their whole lives in either fresh water or salt water. Atlantic salmon live in ______ hatch in rivers, swim out to the ocean to grow, and return to their home rivers to spawn.",
      kind: "first", mark: "semicolon", w1: "both", adv: "however", w2: "they", c1: ["Atlantic salmon", "live"], c2: ["they", "hatch"],
      link: "sets the salmon against the fish described in the first sentence", rest: "explains how salmon live in both",
    },
    {
      scene: "sec-turkish-van-swims",
      text: "Most cats avoid water whenever they can, and many will struggle hard to escape a bath. The Turkish ______ readily when given the chance, and many owners say it seems to enjoy the water.",
      kind: "interrupt", mark: "semicolon", w1: "Van", adv: "however", w2: "swims", subject: "The Turkish Van",
      link: "sets this breed against the cats described in the first sentence",
    },
    {
      scene: "sec-silent-owls",
      text: "Many predators depend on silence to catch their prey, since a single sound can warn a mouse or a rabbit to flee. ______ almost silently, thanks to the soft, fringed edges of their wing feathers.",
      kind: "interrupt", mark: "period", w1: "Owls", adv: "for example", w2: "fly", subject: "Owls",
      link: "introduces owls as one example of such predators",
    },
    {
      scene: "sec-kessel-glacier-lake",
      text: "Warmer summers have melted much of the Kessel Glacier since 1990, and its front has retreated nearly two kilometers. The lake at its ______ more than doubled in size over the same period, flooding a trail that once ran along its shore.",
      kind: "interrupt", mark: "semicolon", w1: "foot", adv: "consequently", w2: "has", subject: "The lake at its foot",
      link: "presents the lake's growth as a result of the melting",
    },
    {
      scene: "sec-komodo-males",
      text: "Komodo dragons, which live on a handful of islands in eastern Indonesia, are the largest lizards alive today. Adult ______ weigh more than seventy kilograms, and the lizards can bring down deer and even water buffalo.",
      kind: "interrupt", mark: "period", w1: "males", adv: "in fact", w2: "can", subject: "Adult males",
      link: "adds a detail that shows just how large the lizards are",
    },
    {
      scene: "sec-dunmore-bakery-kitchen",
      text: "The Dunmore bakery's front room is crowded with customers from seven in the morning until noon. The ______ busiest in the middle of the night, when the bakers shape and bake the next day's bread.",
      kind: "interrupt", mark: "period", w1: "kitchen", adv: "meanwhile", w2: "is", subject: "The kitchen",
      link: "sets the kitchen's busy hours beside those of the front room",
    },
    {
      scene: "sec-bakers-cooperative",
      text: "The Riverside Bakers' Cooperative, which is owned by the twelve people who work there, lost money in each of its first three years. Its ______ to keep the business open, because the number of regular customers was rising steadily.",
      kind: "interrupt", mark: "semicolon", w1: "members", adv: "nevertheless", w2: "voted", subject: "Its members",
      link: "presents the vote as happening despite the losses",
    },
  ];

  // The key's corner by kind: [mark before adv, mark after it].
  const ADVERB_KEYS = { second: ["boundary", "comma"], first: ["comma", "boundary"], interrupt: ["comma", "comma"] };
  const BOUNDARY = { semicolon: ";", period: "." };

  const conjunctiveAdverbJoin = {
    id: "sec-conjunctive-adverb-join",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Medium",
    title: "Where a transition such as however belongs, and the marks around it",
    recognize:
      "A transition such as however cannot join two independent clauses on its own. Find the clauses: the transition takes a semicolon or period on the side where one clause ends, goes with the clause whose relation it names, and inside a single clause is set off by commas.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["comma-splice", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(ADVERB_JOIN_TOPICS);
      const { w1, adv, w2, kind } = topic;
      const mark = BOUNDARY[topic.mark];
      const markName = topic.mark;
      const parts = around(topic.text);
      // A blank that starts a sentence has nothing before it in that sentence.
      const lead = !parts ? "" : /[.!?]["”]?\s+$/.test(parts.before) ? "" : sentenceLead(parts.before);
      const first = `${lead}${w1}`.trim();
      // A period starts a new sentence, so the word after it is capitalized.
      const render = (before, after) => {
        const opener = before === "boundary" && mark === "." ? cap(adv) : adv;
        const next = after === "boundary" && mark === "." ? cap(w2) : w2;
        return `${w1}${before === "boundary" ? mark : ","} ${opener}${after === "comma" ? "," : mark} ${next}`;
      };
      const both = markName === "period" ? `"${cap(adv)}." would stand alone as a sentence with no subject or verb` : `with a semicolon on each side, "${adv}" is stranded between the two clauses and belongs to neither`;
      const choices = squareOf(["before", "after"], [["boundary", "comma"], ["comma", "boundary"]], render, (before, after) => {
        if (before === ADVERB_KEYS[kind][0] && after === ADVERB_KEYS[kind][1]) return null;
        if (before === "boundary" && after === "boundary") {
          return kind === "interrupt"
            ? cap(`${both}; besides, "${first}" is only the subject of the verb "${w2}," not a clause.`)
            : cap(`${both}.`);
        }
        if (kind === "interrupt") {
          return before === "boundary"
            ? `A ${markName} must follow an independent clause, but "${first}" is only the subject of the verb "${w2}"; the ${markName} would cut the subject off from its verb.`
            : `A ${markName} after "${adv}" would cut the subject, "${first}," off from its verb, "${w2}"; inside a single clause, "${adv}" is set off by a comma on each side.`;
        }
        if (before === "comma" && after === "comma") {
          return `This joins two independent clauses with only commas, a comma splice; "${adv}" is a transition, not a conjunction like "and" or "but."`;
        }
        if (kind === "second") {
          return `This makes "${adv}" end the first clause, linking that clause to something before it; but the first clause opens the passage, and "${adv}" ${topic.link}, so it belongs at the start of the second clause.`;
        }
        return `This makes "${adv}" begin the second clause, setting the second clause against the first; but the second clause ${topic.rest}, and "${adv}" ${topic.link}, so it belongs at the end of the first clause.`;
      });
      const boundaryWords = markName === "period" ? "a period (and a capital letter)" : "a semicolon";
      const explanation = {
        second: `"${first}" and the words after the blank are both independent clauses, and "${adv}" ${topic.link}, so it opens the second clause. A transition cannot join clauses by itself: ${boundaryWords} separates the clauses, and a comma follows the transition: "${choices.correct}".`,
        first: `"${first}" and the words after the blank are both independent clauses. "${cap(adv)}" ${topic.link}, while the second clause ${topic.rest}, so the transition ends the first clause: a comma before it and ${boundaryWords} after it: "${choices.correct}".`,
        interrupt: `"${first}" is the subject of the verb "${w2}"; there is only one clause here, so "${adv}" (which ${topic.link}) interrupts it and is set off by a comma on each side: "${choices.correct}".`,
      }[kind];
      const instance = multipleChoice(topic, choices, {
        explanation,
        steps: [
          "Check whether the words on each side of the blank are independent clauses, or one clause split between its subject and verb.",
          kind === "interrupt"
            ? `Only one clause: "${first}" is the subject of "${w2}".`
            : `Two clauses. Decide which one "${adv}" belongs to: it ${topic.link}.`,
          {
            second: `Put ${boundaryWords} before "${adv}" and a comma after it.`,
            first: `Put a comma before "${adv}" and ${boundaryWords} after it.`,
            interrupt: `Set off "${adv}" with a comma on each side.`,
          }[kind],
        ],
        principles: [
          "Transitions such as however, consequently, and for example do not join clauses; a semicolon or period must still separate the clauses.",
          "A transition goes with the clause whose relation it names: at the start of the second clause, or at the end of the first when it relates that clause to what came before.",
          "Inside a single clause, a transition is set off by a comma on each side.",
        ],
        trap: {
          second: "Treating the transition like and or but and joining the clauses with a comma, which creates a comma splice.",
          first: `Putting the ${markName} before "${adv}" by habit, which sets the second clause against the first although it only explains the first.`,
          interrupt: `Putting a ${markName} before "${adv}" by habit, though the words before it are only a subject.`,
        }[kind],
        hint: `Could the words before the blank stand alone as a sentence? Could the words after it? What does "${adv}" connect to what?`,
        estimatedSeconds: 65,
      });
      instance.verify = () => {
        if (!parts) return false;
        const tail = `${w2}${parts.after}`;
        const clauses = lead.includes(topic.c1 ? topic.c1[0] : "") && lead.includes(topic.c1 ? topic.c1[1] : "") &&
          topic.c2 && tail.includes(topic.c2[0]) && tail.includes(topic.c2[1]) && !SUBORDINATORS.includes(firstWord(lead));
        // "second": the first clause opens the passage, so nothing precedes
        // it for a clause-final transition to link to. "first": a sentence
        // comes before it. "interrupt": the words before the blank are
        // exactly the subject, and a sentence comes before them.
        const structure = {
          second: () => clauses && lead === parts.before,
          first: () => clauses && lead !== parts.before && ["however", "in contrast"].includes(adv),
          interrupt: () => first === topic.subject && lead !== parts.before && /^[a-z]/.test(w2),
        }[kind]();
        return CONJ_ADVERBS.includes(adv) && structure && Boolean(mark) &&
          instance.correct === render(...ADVERB_KEYS[kind]) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------------ B5: colon or nothing before a list */

  // Each topic: a list follows w1. When w1 is a verb or preposition the list
  // completes (`gov`), nothing separates them; when the words before w1 are
  // already a complete clause (`clause`), a colon introduces the list. The
  // choices cross that mark with the mark between the first two items
  // (`first`, then `next`), which is a comma, since the items are plain.
  const GOVERNED_LIST_TOPICS = [
    {
      scene: "sec-andes-seed-bank",
      text: "A community seed bank in the Peruvian Andes stores seeds and tubers of crops that local farmers have grown for centuries. Its collection ______, amaranth, and more than three hundred varieties of potato.",
      w1: "includes", first: "quinoa", next: "kañiwa", gov: "verb",
    },
    {
      scene: "sec-fire-magazine",
      text: "The literary magazine Fire!! lasted for only one issue, published in 1926. That issue featured the work of young Harlem Renaissance writers ______ Bennett, and Wallace Thurman.",
      w1: "such as", first: "Langston Hughes", next: "Gwendolyn", gov: "preposition",
    },
    {
      scene: "sec-carousel-restoration",
      text: "Restoring the 1890s carousel in Riverfront Park took a team of volunteers four years. They ______ horses' cracked glass eyes, and the band organ's paper music rolls.",
      w1: "replaced", first: "rusted brass poles", next: "the", gov: "verb",
    },
    {
      scene: "sec-tallis-choir-program",
      text: "The Tallis Street Youth Choir performs music from many traditions. Its spring program ______ motet by Heinrich Schütz, and a new piece by the composer Ruth Adebayo.",
      w1: "featured", first: "a Georgian folk song", next: "a", gov: "verb",
    },
    {
      scene: "sec-bellamy-marsh-birds",
      text: "Each June, volunteers at Bellamy Marsh count the birds nesting in its reeds and cattails. Last year, the three most common nesting species ______ blackbirds, and swamp sparrows.",
      w1: "were", first: "marsh wrens", next: "red-winged", gov: "verb",
    },
    {
      scene: "sec-kovac-ballet-program",
      text: "Students at the Kovac Ballet School complete a demanding three-year program before auditioning for professional companies. The program ______ lessons in partnering, and a course in human anatomy.",
      w1: "consists of", first: "daily technique classes", next: "weekly", gov: "preposition",
    },
    {
      scene: "sec-east-antarctic-core",
      text: "An ice core drilled at a site in East Antarctica preserves a record of the atmosphere stretching back hundreds of thousands of years. Scientists studying its layers have ______ blown from distant deserts, and tiny bubbles of ancient air.",
      w1: "found", first: "volcanic ash", next: "dust", gov: "verb",
    },
    {
      scene: "sec-brooklyn-rooftop-farms",
      text: "Because most roofs can bear only limited weight, rooftop farms in Brooklyn grow their crops in soil less than a foot deep. The farmers favor hardy, shallow-rooted plants ______, and radishes.",
      w1: "like", first: "salad greens", next: "herbs", gov: "preposition",
    },
    {
      scene: "sec-himalaya-guides",
      text: "Anthropologist Dawa Lhamo interviewed forty mountain guides who lead climbers on the peaks of the Kessel Range. The guides ______ sickness, and inexperienced clients as the greatest dangers they face.",
      w1: "named", first: "sudden weather changes", next: "altitude", gov: "verb",
    },
    {
      scene: "sec-riverside-concert-pieces",
      text: "The Riverside Community Orchestra performs four free concerts each year in the city's parks. Its summer program always includes the same three kinds of ______ waltz, and a piece written by a local student.",
      w1: "pieces", first: "a march", next: "a", clause: ["program", "includes"],
    },
    {
      scene: "sec-kessel-trail-crews",
      text: "Volunteers who repair hiking trails in the Kessel Hills work far from any road, so they carry as little as possible. Each crew brings only three ______ saws, and a first-aid kit.",
      w1: "things", first: "shovels", next: "hand", clause: ["crew", "brings"],
    },
    {
      scene: "sec-harlow-bus-survey",
      text: "Before redesigning its bus network, the town of Harlow surveyed two thousand riders about what they wanted most. Riders ranked three improvements far above all ______ at every stop, and signs showing when the next bus will arrive.",
      w1: "others", first: "more frequent buses", next: "shelters", clause: ["Riders", "ranked"],
    },
    {
      scene: "sec-painting-inspections",
      text: "Each spring, the Varden Museum's conservators inspect every painting in the collection, one gallery at a time. They look for the same four ______, flaking paint, and damage from insects.",
      w1: "problems", first: "cracks", next: "fading", clause: ["They", "look"],
    },
    {
      scene: "sec-dunmore-rye-bread",
      text: "The recipe for the rye bread sold at the Dunmore bakery has not changed since 1890. It calls for only four ______, salt, and a sourdough starter kept alive from the previous day's batch.",
      w1: "ingredients", first: "rye flour", next: "water", clause: ["It", "calls"],
    },
    {
      scene: "sec-oregon-tide-pools",
      text: "Marine biologist Hana Kekumu counted animals in tide pools along the coast near Brisk Harbor every summer for a decade. Her study focused on three ______ black oystercatcher, and the giant green anemone.",
      w1: "species", first: "the ochre sea star", next: "the", clause: ["study", "focused"],
    },
  ];

  // Words that a list completes directly; nothing may separate them.
  const GOVERNORS = ["includes", "included", "such as", "like", "were", "are", "consists of", "featured", "found", "replaced", "named"];

  const noColonAfterVerb = {
    id: "sec-no-colon-after-verb",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Medium",
    title: "Colon or nothing before a list",
    recognize:
      "A colon introduces a list only after a complete clause; when the list completes a verb or a preposition such as “including,” nothing separates them.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(GOVERNED_LIST_TOPICS);
      const { w1, first, next } = topic;
      const governed = Boolean(topic.gov);
      const render = (intro, separator) => `${w1}${intro === "colon" ? ":" : ""} ${first}${separator === "comma" ? "," : ";"} ${next}`;
      const keyIntro = governed ? "none" : "colon";
      const choices = squareOf(["intro", "separator"], [["colon", "none"], ["comma", "semicolon"]], render, (intro, separator) => {
        const problems = [];
        if (intro !== keyIntro) {
          problems.push(governed
            ? `a colon must follow a complete clause, and the words before the list are not complete until the list supplies the object of the ${topic.gov} "${w1}"`
            : `the words before the list already form a complete clause, so without a colon the list runs straight into it`);
        }
        if (separator === "semicolon") problems.push("semicolons separate list items only when the items contain commas of their own; these do not");
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: governed
          ? `The list is the object of the ${topic.gov} "${w1}"; without it, the sentence would be incomplete. Nothing separates a ${topic.gov} from its object, even a list, and the plain items are separated by commas: "${choices.correct}".`
          : `The words before the blank ("... ${w1}") already form a complete clause that announces the list, so a colon introduces it, and the plain items are separated by commas: "${choices.correct}".`,
        steps: [
          `Stop the sentence right after "${w1}" and ask whether it is complete.`,
          governed
            ? `It is not: "${w1}" needs the list to complete it, so no punctuation comes before the list.`
            : "It is: the clause is complete and announces a list, so a colon introduces the list.",
          "Separate the plain items with commas.",
        ],
        principles: [
          "A colon introduces a list only after an independent clause.",
          "No punctuation separates a verb or preposition from its object, even when the object is a list.",
        ],
        trap: governed
          ? "Reaching for a colon because a list follows, even though the list completes the verb or preposition."
          : "Leaving out the colon because many lists follow their verb directly, though here the clause is already complete.",
        hint: `Try stopping the sentence right after "${w1}". Is it complete?`,
        estimatedSeconds: 60,
      });
      instance.verify = () => {
        const parts = around(topic.text);
        if (!parts) return false;
        const lead = sentenceLead(parts.before);
        const derived = GOVERNORS.includes(lower(w1)) ? "none" : "colon";
        const complete = governed || (lead.includes(topic.clause[0]) && lead.includes(topic.clause[1]));
        return complete && derived === keyIntro && !/[:;]/.test(parts.after) &&
          instance.correct === render(derived, "comma") && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B6: nothing between subject and verb */

  // Each topic: a long subject that begins with `head` ends with w1; its
  // verb follows the blank. The choices cross a comma (wrongly) splitting
  // subject from verb with the verb's number; the noun just before the blank
  // often has the other number.
  const CORE_PAIR_TOPICS = [
    {
      scene: "sec-correia-letters",
      text: "The botanist Inês Correia described nearly every plant she collected in long letters to her sister. The bundle of letters that Correia wrote during three expeditions up the Tolan ______ now held by the library of the Varden Museum.",
      head: "bundle", w1: "River", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-mohenjo-daro-drains",
      text: "Mohenjo-daro, a city of the Indus Valley civilization, was laid out on a careful grid more than four thousand years ago. The covered brick drains running beneath the streets of each residential ______ among the earliest known city sewer systems.",
      head: "drains", w1: "district", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-meditation-app-study",
      text: "Meditation apps promise better sleep, but few have been rigorously tested. A study of five thousand adults who used one such app for at least ten minutes a day over six ______ only modest improvements in how long participants slept.",
      head: "study", w1: "months", verbs: { singular: "shows", plural: "show" },
    },
    {
      scene: "sec-apollo-samples",
      text: "Between 1969 and 1972, six Apollo crews landed on the Moon and gathered rocks and soil. The samples that those astronauts brought back to Earth from the lunar ______ still studied by scientists around the world.",
      head: "samples", w1: "surface", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-maple-sap-runs",
      text: "Maple syrup producers in Vermont collect sap for only a few weeks in late winter and early spring. The sap collected on days that follow a freezing night and warm to a few degrees above zero by ______ most of the season's syrup.",
      head: "sap", w1: "afternoon", verbs: { singular: "yields", plural: "yield" },
    },
    {
      scene: "sec-glass-armonica",
      text: "In 1761 Benjamin Franklin invented the glass armonica, an instrument made of nested glass bowls that spin on a rod. The ringing tone produced when a player's wet fingertips touch the rims of the spinning ______ many listeners as almost unearthly.",
      head: "tone", w1: "bowls", verbs: { singular: "strikes", plural: "strike" },
    },
    {
      scene: "sec-alder-bay-light-rail",
      text: "The city of Alder Bay opened its first light-rail line in 2018. Commuters who have switched from driving to the train since the line opened in ______ an average of forty minutes a day.",
      head: "Commuters", w1: "2018", verbs: { singular: "saves", plural: "save" },
    },
    {
      scene: "sec-fossil-feather-color",
      text: "Some fossil birds from northeastern China are preserved in such fine detail that individual feathers are visible. The tiny pigment-bearing structures found inside a single fossil ______ scientists to infer the colors the bird once displayed.",
      head: "structures", w1: "feather", verbs: { singular: "allows", plural: "allow" },
    },
    {
      scene: "sec-kato-volcano-quakes",
      text: "Seismologist Rina Kato compared thousands of small earthquakes recorded beneath Mount Orrin, a volcano near the town of Keld. Her analysis of the quakes that shook the mountain in the months before its ______ that they had been creeping steadily upward.",
      head: "analysis", w1: "eruption", verbs: { singular: "shows", plural: "show" },
    },
    {
      scene: "sec-ship-log-weather",
      text: "Climate scientists are turning to old ships' logbooks for records of past weather at sea. The volunteers who have transcribed the weather readings in thousands of those logs for one online ______ helped scientists fill gaps in the record of past storms.",
      head: "volunteers", w1: "project", verbs: { singular: "has", plural: "have" },
    },
    {
      scene: "sec-philadelphia-boarders",
      text: "Historian Kwame Asante followed the residents of a single street in the mill town of Ashby through census records. The records that Asante traced for that street over the course of a ______ that nearly every household there took in at least one boarder in 1880.",
      head: "records", w1: "century", verbs: { singular: "shows", plural: "show" },
    },
    {
      scene: "sec-ruiz-night-photos",
      text: "Photographer Alma Ruiz spent two winters photographing people who work through the night in the port city of Alder Bay. Her pictures of night-shift workers taken between midnight and ______ lit only by streetlamps and the glow of vending machines.",
      head: "pictures", w1: "dawn", verbs: { singular: "is", plural: "are" },
    },
  ];

  const noCommaSubjectVerb = {
    id: "sec-no-comma-subject-verb",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Medium",
    title: "No punctuation between a long subject and its verb",
    recognize:
      "The blank falls between a long subject and its verb; however long the subject, nothing separates them, and the verb agrees with the subject's head noun, not the noun just before it.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["neighbouring-rule", "agreement-attractor"],
    build(t) {
      const topic = t.pick(CORE_PAIR_TOPICS);
      const { w1, head } = topic;
      const number = nounNumberOf(head);
      const render = (comma, n) => `${w1}${comma === "yes" ? "," : ""} ${topic.verbs[n]}`;
      const choices = squareOf(["comma", "number"], [["yes", "no"], ["singular", "plural"]], render, (comma, n) => {
        const problems = [];
        if (comma === "yes") problems.push("a single comma cannot separate a subject from its verb, however long the subject is");
        if (n !== number) problems.push(`"${topic.verbs[n]}" is ${n}, but the subject's head noun, "${head}", is ${number}`);
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const parts = around(topic.text);
      const lead = parts ? sentenceLead(parts.before) : "";
      const instance = multipleChoice(topic, choices, {
        explanation: `Everything from "${head}" to "${w1}" is the subject, and its head noun, "${head}", is ${number}. Nothing separates a subject from its verb, and the verb agrees with the head noun: "${choices.correct}".`,
        steps: [
          "Find the subject's head noun and follow the subject to its end at the blank.",
          `The head noun is "${head}", which is ${number}; "${w1}" belongs to a phrase describing it.`,
          "Choose the verb that agrees with the head noun, with no punctuation before it.",
        ],
        principles: [
          "No punctuation separates a subject from its verb.",
          "A verb agrees with the head of its subject, not with a noun inside a phrase that describes the subject.",
        ],
        trap: "Adding a comma where a reader would pause for breath after a long subject, or matching the verb to the noun right before it.",
        hint: "Which two parts of the clause does the blank sit between? What is the subject's main noun?",
        estimatedSeconds: 60,
      });
      instance.verify = () => {
        if (!parts) return false;
        const at = lead.indexOf(head);
        // With no opening mark inside the subject, no closing mark is owed.
        const noOpener = at >= 0 && !/[,;:—()]/.test(lead.slice(at));
        return noOpener && /^\s\S/.test(parts.after) &&
          instance.correct === `${w1} ${topic.verbs[number]}` && isSquare(instance.features);
      };
      return instance;
    },
  };

  // Number read off the word (regular plurals end in -s; a few irregular).
  function nounNumberOf(noun) {
    const word = lower(noun);
    if (["sap", "analysis"].includes(word)) return "singular";
    return /[^su]s$/.test(word) ? "plural" : "singular";
  }

  /* ------------------------------------------------ B7: semicolons in a complex series */

  // Each topic: a series whose items contain commas. Usually the blank
  // covers the end of one item (w1), the mark between items, and the next
  // item up to and including its own internal comma: `a` + "," + `b`. With
  // `inside`, it starts inside an item instead: w1 + "," + `a` ends that
  // item, and the mark between items comes before `b`. The key is then
  // ", ... ;" rather than "; ... ,", so neither order is a habit.
  const SERIES_TOPICS = [
    {
      scene: "sec-harmattan-film-festival",
      text: "Founded by filmmaker Chidi Okeke in 2015, the Harmattan Documentary Festival screens short films made by West African students. This fall the festival will travel to three cities: Lagos, Nigeria; ______, Senegal.",
      w1: "Accra", a: "Ghana", b: "and Dakar", inside: true,
    },
    {
      scene: "sec-halcyon-trio",
      text: "The Halcyon Trio has performed chamber music in small towns across Ireland since 2011. Its members are pianist Ana Keane, who founded the group; violinist Tomas Berg, who arranges much of its ______ joined in 2020.",
      w1: "music", a: "and cellist Iris Gao", b: "who",
    },
    {
      scene: "sec-river-sediment",
      text: "Hydrologists compared how much sediment three great rivers carry to the sea: the Mekong, which drains much of mainland Southeast ______ flows through India and Bangladesh; and the Amazon, the largest river on Earth by volume.",
      w1: "Asia", a: "the Ganges", b: "which",
    },
    {
      scene: "sec-urban-history-speakers",
      text: "This year's conference on urban history will feature three keynote speakers: Mariam Haddad, a historian of Cairo; Leo Brandt, an architect from ______ geographer who studies Seoul's street markets.",
      w1: "Berlin", a: "and Sun-mi Park", b: "a",
    },
    {
      scene: "sec-science-fair-prizes",
      text: "The judges at the regional science fair awarded top prizes to three students: Priya Nair, for a study of pollinators in city ______ a solar-powered water filter; and Lucas Moreau, for a model of riverbank erosion.",
      w1: "parks", a: "Daniel Osei", b: "for",
    },
    {
      scene: "sec-trans-saharan-cities",
      text: "For centuries, camel caravans crossing the Sahara linked Sijilmasa, a market town in what is now Morocco; Timbuktu, a center of Islamic scholarship near the Niger ______ capital of the Songhai Empire.",
      w1: "River", a: "and Gao", b: "the",
    },
    {
      scene: "sec-archive-acquisitions",
      text: "The state archive recently acquired three collections: the diaries of Mabel Ortiz, a Texas ______ railroad engineer; and the sketchbooks of Aiko Mori, a botanical illustrator.",
      w1: "rancher", a: "the letters of Harold Finch", b: "a",
    },
    {
      scene: "sec-lighthouse-keepers",
      text: "An exhibit at the maritime museum tells the stories of three nineteenth-century lighthouse keepers who were women: Ida Lewis, of Newport, Rhode Island; Abbie Burgess, of Matinicus ______ Colfax, of Michigan City, Indiana.",
      w1: "Rock", a: "Maine", b: "and Harriet", inside: true,
    },
    {
      scene: "sec-mural-neighborhoods",
      text: "The murals painted for the city's 2022 arts festival each celebrate a single neighborhood. The festival paired each of three muralists with a neighborhood: Rosa Delgado, East Harlem; Jin ______ Bell, Bedford-Stuyvesant.",
      w1: "Kim", a: "Flushing", b: "and Marcus", inside: true,
    },
    {
      scene: "sec-meteor-showers",
      text: "Astronomer Leah Grant's guide for beginning stargazers lists three reliable meteor showers: the Quadrantids, which peak in early January; the ______ Geminids, which peak in December.",
      w1: "Perseids", a: "which peak in August", b: "and the", inside: true,
    },
    {
      scene: "sec-wild-rice-sites",
      text: "Wild rice, a grass that grows in shallow lakes and slow rivers, holds deep cultural importance for the Ojibwe people. A regional seed bank holds wild rice seeds gathered from a lake near Duluth, Minnesota; a marsh near ______ river delta near Marquette, Michigan.",
      w1: "Ashland", a: "Wisconsin", b: "and a", inside: true,
    },
    {
      scene: "sec-working-lives-podcast",
      text: "The first season of the oral history podcast Working Lives featured interviews with Dolores Vega, a retired firefighter; Amos ______ Zahra, a pilot for a cargo airline.",
      w1: "Clarke", a: "a beekeeper in Vermont", b: "and Fatima", inside: true,
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
      "Each item in the series contains a comma of its own, so semicolons separate the items and each item keeps its internal comma. Find where one item ends and the next begins.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(SERIES_TOPICS);
      const { w1, a, b } = topic;
      const inside = Boolean(topic.inside);
      const markOf = (value) => (value === "semicolon" ? ";" : ",");
      const render = (separator, internal) => (inside
        ? `${w1}${markOf(internal)} ${a}${markOf(separator)} ${b}`
        : `${w1}${markOf(separator)} ${a}${markOf(internal)} ${b}`);
      // Where the items meet, and the item whose internal comma is at stake.
      const [ends, starts] = inside ? [a, b] : [w1, a];
      const split = inside ? `${w1} ... ${a}` : `${a.replace(/^and /, "")} ... ${b}`;
      const internalAt = inside ? w1 : a;
      const choices = squareOf(["separator", "internal"], [["semicolon", "comma"], ["comma", "semicolon"]], render, (separator, internal) => {
        const problems = [];
        if (separator === "comma") problems.push(`the items already contain commas, so a comma between "${ends}" and "${starts}" would blur where one item ends and the next begins; the other items are separated by semicolons`);
        if (internal === "semicolon") problems.push(`a semicolon after "${internalAt}" would split the item "${split}" in two; inside an item, a comma is used, as in the other items`);
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: `Every item in the series contains a comma of its own, as the rest of the list shows, so a semicolon separates "${ends}" from the next item, "${starts} ...", and the item "${split}" keeps its internal comma: "${choices.correct}".`,
        steps: [
          "Identify the series and its items.",
          "Notice that each item already contains a comma, and find where the item in the blank ends.",
          "Separate the items with semicolons, and keep the comma inside each item.",
        ],
        principles: [
          "Series items are normally separated by commas, but when the items themselves contain commas, semicolons separate them.",
        ],
        trap: "Choosing a comma between items because series items are usually separated by commas, or putting the semicolon inside an item instead of where the item ends.",
        hint: "Look at the punctuation the passage already uses between the other items, and inside them. Where does the item in the blank end?",
        estimatedSeconds: 60,
      });
      instance.verify = () => {
        const keyed = topic.text.replace(BLANK, instance.correct);
        const semicolons = (keyed.match(/;/g) || []).length;
        // The next item begins with "and" only when it is the last one.
        const key = inside ? `${w1}, ${a}; ${b}` : `${w1}; ${a}, ${b}`;
        return around(topic.text) !== null && semicolons >= 2 && /;/.test(topic.text) &&
          (!inside || /^and\b/.test(b)) && instance.correct === key && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* -------------------------------------- B8: "most of which" versus "most of whom" */

  // Each topic: an independent clause ending with the noun w1; the blank
  // continues with a quantifier `quant` and a pronoun. In "relative" scenes
  // the pronoun is relative, "which" for things or "whom" for people
  // (`kind`), so a comma attaches the dependent clause; the choices cross
  // that mark with which/whom. In "personal" scenes it is "them", which
  // leaves an independent clause, so a semicolon is needed; the choices
  // cross the mark with them/they (after "of", the object form).
  const RELATIVE_QUANTIFIER_TOPICS = [
    {
      scene: "sec-immigrant-postcards",
      text: "In 1998, a historian in Minnesota discovered a trunk containing more than three thousand ______ had been mailed by Swedish immigrants to their families between 1880 and 1910.",
      w1: "postcards", quant: "most", kind: "thing", clause: ["a historian", "discovered"],
    },
    {
      scene: "sec-kanaan-choir",
      text: "Music teacher Leila Kanaan founded a community choir in the basement of a Detroit church in 2012. The choir has since grown to sixty ______ had never performed in public before joining.",
      w1: "singers", quant: "many", kind: "person", clause: ["The choir", "grown"],
    },
    {
      scene: "sec-himalayan-glacial-lakes",
      text: "Glaciers in the Himalayas have been retreating for decades. In the valleys they have left behind, meltwater has filled hundreds of new ______ are held back only by loose ridges of rock and ice.",
      w1: "lakes", quant: "some", kind: "thing", clause: ["meltwater", "has filled"],
    },
    {
      scene: "sec-keld-meteorite",
      text: "Geologist Mara Voss wanted to know whether a meteorite that fell near the town of Keld in 2019 had ever been exposed to water. She cut the meteorite into forty thin ______ contained any trace of water-bearing minerals.",
      w1: "slices", quant: "none", kind: "thing", clause: ["She", "cut"],
    },
    {
      scene: "sec-valle-youth-orchestra",
      text: "Conductor Felipe Arce founded the Valle Youth Orchestra in 2009 to bring classical music to rural Colombia. In its first year, he recruited forty young ______ had never held a stringed instrument.",
      w1: "musicians", quant: "half", kind: "person", clause: ["he", "recruited"],
    },
    {
      scene: "sec-alchichica-crater-lakes",
      text: "Ancient volcanic eruptions left a string of deep craters across the highlands of central Mexico. Several of those craters now hold ______ is home to a small fish found nowhere else on Earth.",
      w1: "lakes", quant: "one", kind: "thing", clause: ["Several", "hold"], pronoun: "personal",
    },
    {
      scene: "sec-nairobi-hackathon",
      text: "Kenya's technology industry has grown quickly since the late 2000s. In 2014, a weekend coding competition held in Nairobi brought together 150 high school ______ later founded technology companies of their own.",
      w1: "students", quant: "several", kind: "person", clause: ["competition", "brought"], pronoun: "personal",
    },
    {
      scene: "sec-cedar-masks-gallery",
      text: "The museum's newest gallery is devoted to the carving traditions of the Pacific Northwest. Visitors to the gallery can see thirty-two carved cedar ______ is displayed beside a recording of the song it once accompanied.",
      w1: "masks", quant: "each", kind: "thing", clause: ["Visitors", "can see"], pronoun: "personal",
    },
    {
      scene: "sec-asthma-breathing-trial",
      text: "Doctors at the hospital in Selby wondered whether breathing exercises could help people with mild asthma. Their clinical trial taught daily exercises to 400 adult ______ used their inhalers less often after six weeks.",
      w1: "patients", quant: "most", kind: "person", clause: ["trial", "taught"],
    },
    {
      scene: "sec-ferry-crew-interviews",
      text: "For an oral history of the island's ferry service, historian Rosa Mendes interviewed thirty former ______ had worked on the ferries for more than twenty years.",
      w1: "crew members", quant: "many", kind: "person", clause: ["Rosa Mendes", "interviewed"], pronoun: "personal",
    },
    {
      scene: "sec-town-band-founders",
      text: "The Brisk Harbor Town Band gave its first concert in 1874. Its founders were eleven local ______ had learned to play brass instruments while serving in the navy.",
      w1: "fishermen", quant: "several", kind: "person", clause: ["founders", "were"], pronoun: "personal",
    },
    {
      scene: "sec-portugal-wreck-coins",
      text: "Divers mapping a shipwreck off the southern coast of Portugal have recovered more than two thousand silver ______ were minted in Mexico City in the 1780s.",
      w1: "coins", quant: "many", kind: "thing", clause: ["Divers", "have recovered"], pronoun: "personal",
    },
  ];

  const relativeVsPronounClause = {
    id: "sec-relative-vs-pronoun-clause",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Medium",
    title: "Relative clause or new clause after a quantifier",
    recognize:
      "“Most of which” (things) and “most of whom” (people) begin dependent clauses, which attach to the main clause with a comma; “most of them” begins an independent clause, which a comma alone cannot join to another.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "comma-splice"],
    build(t) {
      const topic = t.pick(RELATIVE_QUANTIFIER_TOPICS);
      const { w1, quant } = topic;
      const personal = topic.pronoun === "personal";
      const people = topic.kind === "person" ? "people" : "things";
      const needed = personal ? "them" : topic.kind === "person" ? "whom" : "which";
      const keyMark = personal ? "semicolon" : "comma";
      const pronouns = personal ? ["them", "they"] : ["which", "whom"];
      const render = (mark, pronoun) => `${w1}${mark === "comma" ? "," : ";"} ${quant} of ${pronoun}`;
      const choices = squareOf(["mark", "pronoun"], [["comma", "semicolon"], pronouns], render, (mark, pronoun) => {
        const problems = [];
        if (mark !== keyMark) {
          problems.push(personal
            ? `"${quant} of ${pronoun}" begins an independent clause with its own subject, so a comma alone would join two independent clauses, a comma splice`
            : `a semicolon must join two independent clauses, but "${quant} of ${pronoun}" begins a dependent clause, which would be left as a fragment`);
        }
        if (pronoun !== needed) {
          problems.push({
            they: `"they" is a subject pronoun; after "of," the object form "them" is needed`,
            whom: `"whom" refers to people, but the ${w1} are things`,
            which: `"which" refers to things, but the ${w1} are people, so the pronoun is "whom"`,
          }[pronoun]);
        }
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: personal
          ? `"${cap(quant)} of them" makes the words after the blank an independent clause: its subject is "${quant} of them." Two independent clauses cannot be joined by a comma alone, so a semicolon separates them, and after "of" the pronoun takes the object form: "${choices.correct}".`
          : `"${cap(quant)} of ${needed}" begins a dependent clause describing the ${w1}, so it attaches to the main clause with a comma. Because the ${w1} are ${people}, the pronoun is "${needed}": "${choices.correct}".`,
        steps: [
          "Confirm that the words before the blank form an independent clause.",
          personal
            ? `Notice that "${quant} of them" is the subject of a new independent clause, so it needs a semicolon, not a comma.`
            : `Notice that "${quant} of which" or "${quant} of whom" makes the words after the blank a dependent clause, so it attaches with a comma.`,
          personal
            ? "After a preposition such as “of,” use the object form “them,” not “they.”"
            : `Use "whom" for people and "which" for things: the ${w1} are ${people}.`,
        ],
        principles: [
          "Which, whom, and whose begin dependent clauses, even inside phrases such as most of which; a dependent clause attaches with a comma.",
          "Them, it, and they begin independent clauses, even inside phrases such as most of them; such a clause needs a semicolon or period after another clause.",
          "Whom refers to people; which refers to things.",
        ],
        trap: personal
          ? "Choosing a comma because “most of them” sounds like “most of which,” though “them” leaves the clause independent."
          : "Choosing a semicolon because the words after the blank have their own verb, although “of which” or “of whom” makes them dependent.",
        hint: "Is the pronoun after the quantifier a relative pronoun (which, whom) or a personal one (them)? Could the words after the blank stand alone as a sentence?",
        estimatedSeconds: 65,
      });
      instance.verify = () => {
        const parts = around(topic.text);
        if (!parts) return false;
        const lead = sentenceLead(parts.before);
        const clause = lead.includes(topic.clause[0]) && lead.includes(topic.clause[1]) && !SUBORDINATORS.includes(firstWord(lead));
        // The clause after the blank has its own verb but no other subject:
        // the quantifier phrase is its subject.
        const verbFirst = /^\s[a-z]+/.test(parts.after);
        return clause && verbFirst && instance.correct === render(keyMark, needed) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------------------ B9: closing mark must match the opener */

  // Hard. Each topic: right after `head`, a comma, a dash, or an opening
  // parenthesis starts a long nonessential element full of nouns of the
  // other number; it ends with w1, and the sentence's main verb follows the
  // blank. A dash or parenthesis element contains commas of its own, which
  // tempt a closing comma; a comma element is long enough that its opening
  // comma is forgotten, which tempts no closing mark at all. The choices
  // cross the closing mark (the matching one or that tempting one) with the
  // verb's number.
  const CLOSING_MARK_TOPICS = [
    {
      scene: "sec-methuselah-pine",
      text: "Great Basin bristlecone pines survive on dry, windswept slopes where few other trees can grow. The tree known as Methuselah—a bristlecone that, according to ring counts taken in 1957, had already lived for more than 4,700 ______ in the White Mountains of eastern California.",
      head: "Methuselah", subject: "tree", number: "singular", opener: "—", w1: "years", verbs: { singular: "grows", plural: "grow" },
    },
    {
      scene: "sec-varga-graphic-scores",
      text: "Some composers write music that looks nothing like a conventional score. The composer Mira Szabo—whose scores, drawn in colored ink on sheets of paper nearly a meter wide, look more like maps than like ______ performers to decide for themselves how long each shape should last.",
      head: "Mira Szabo", subject: "composer", number: "singular", opener: "—", w1: "music", verbs: { singular: "asks", plural: "ask" },
    },
    {
      scene: "sec-sea-cucumbers",
      text: "Sea cucumbers—soft-bodied animals that, despite their name, are related to sea stars rather than to ______ an important role on coral reefs. As they crawl along the seafloor, they swallow sand, digest the organic matter it contains, and leave cleaner sand behind.",
      head: "Sea cucumbers", subject: "cucumbers", number: "plural", opener: "—", w1: "plants", verbs: { singular: "plays", plural: "play" },
    },
    {
      scene: "sec-hedy-lamarr",
      text: "Hedy Lamarr—a Hollywood star who, during the Second World War, worked with the composer George Antheil on a radio system that hopped rapidly between ______ now honored as a pioneer of wireless communication. The technique, known as frequency hopping, was later adopted in military radios.",
      head: "Hedy Lamarr", subject: "Lamarr", number: "singular", opener: "—", w1: "frequencies", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-new-england-ice-houses",
      text: "Before electric refrigerators, farm families cut blocks of ice from frozen lakes each winter. Nineteenth-century ice houses, buildings in which those blocks were packed in sawdust to last through the ______ still standing on old farms across New England.",
      head: "ice houses", subject: "houses", number: "plural", opener: ",", w1: "summer", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-corner-store-survey",
      text: "Sociologist Denise Albright spent a year visiting corner stores in the city of Harlow. Her survey of these stores, small shops that serve as the closest source of groceries in many of the city's ______ that most of them stock fresh fruit only during the summer months.",
      head: "these stores", subject: "survey", number: "singular", opener: ",", w1: "neighborhoods", verbs: { singular: "shows", plural: "show" },
    },
    {
      scene: "sec-axolotl",
      text: "The axolotl (a salamander that, unlike most of its relatives, keeps its feathery gills throughout its adult ______ in the wild only in a network of canals on the southern edge of Mexico City.",
      head: "The axolotl", subject: "axolotl", number: "singular", opener: "(", w1: "life", verbs: { singular: "survives", plural: "survive" },
    },
    {
      scene: "sec-argo-floats",
      text: "Argo floats (battery-powered instruments that drift with ocean currents and, every ten days, dive to depths of about two thousand ______ temperature and salinity readings to satellites each time they surface. Nearly four thousand of the floats are now spread across the world's oceans.",
      head: "Argo floats", subject: "floats", number: "plural", opener: "(", w1: "meters", verbs: { singular: "sends", plural: "send" },
    },
    {
      scene: "sec-varden-coastal-chart",
      text: "The Varden Museum's oldest map—a chart of the northern coast that, according to the museum's records, was drawn by a ship's pilot in the ______ hundreds of place names that no longer appear on modern maps.",
      head: "map", subject: "map", number: "singular", opener: "—", w1: "1710s", verbs: { singular: "includes", plural: "include" },
    },
    {
      scene: "sec-brisk-harbor-fountains",
      text: "The three public fountains of Brisk Harbor (built in the 1890s and, according to local historians, fed by a single underground ______ still flowing today, though their water is no longer safe to drink.",
      head: "Brisk Harbor", subject: "fountains", number: "plural", opener: "(", w1: "spring", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-tolan-cliff-dwellings",
      text: "Tree-ring dates from their roof beams show when the oldest rooms were built. The cliff dwellings of Tolan Canyon, rooms of stone and mud built in the 1200s by farmers who grew corn and beans on the ______ visible from a trail that follows the canyon floor.",
      head: "Tolan Canyon", subject: "dwellings", number: "plural", opener: ",", w1: "mesa", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-brannock-lens",
      text: "The Brannock lighthouse was switched off in 1990, but its greatest treasure survives. The tower's original lens—a ring of glass prisms that, when lit by a single oil lamp, could send a beam more than thirty ______ on display at the maritime museum in the harbor town below.",
      head: "lens", subject: "lens", number: "singular", opener: "—", w1: "kilometers", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-golden-record-copy",
      text: "Each Voyager spacecraft carries a copy of the Golden Record, a message for anyone who might one day find it. The copy aboard Voyager 1, a gold-plated disk holding greetings in fifty-five languages and music from many ______ now more than twenty billion kilometers from Earth.",
      head: "Voyager 1", subject: "copy", number: "singular", opener: ",", w1: "cultures", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-rosetta-stone-display",
      text: "In 1799, French soldiers rebuilding a fort near the Egyptian town of Rashid uncovered a broken slab of dark rock. The Rosetta Stone, a slab inscribed with the same decree in three different ______ on display at the British Museum in London.",
      head: "The Rosetta Stone", subject: "Stone", number: "singular", opener: ",", w1: "scripts", verbs: { singular: "is", plural: "are" },
    },
    {
      scene: "sec-sea-otter-stones",
      text: "Sea otters, among the few mammals that crack open their food by pounding it against a stone balanced on the ______ to keep a favorite stone for weeks at a time, tucked into a loose pouch of skin under one arm.",
      head: "Sea otters", subject: "otters", number: "plural", opener: ",", w1: "chest", verbs: { singular: "tends", plural: "tend" },
    },
  ];

  const CLOSERS = { "—": "—", "(": ")", ",": "," };
  const OPENER_NAMES = { "—": "dash", "(": "opening parenthesis", ",": "comma" };
  const CLOSER_NAMES = { "—": "dash", "(": "parenthesis", ",": "comma" };

  const closingMarkMatch = {
    id: "sec-closing-mark-match",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Hard",
    title: "Closing a long interruption, and the verb that follows it",
    recognize:
      "A comma, dash, or parenthesis far back opened an interruption full of nouns (and sometimes commas of its own); it must close with the same kind of mark, and the verb after it agrees with the subject before the interruption.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "agreement-attractor"],
    build(t) {
      const topic = t.pick(CLOSING_MARK_TOPICS);
      const { w1, opener } = topic;
      const closer = CLOSERS[opener];
      const { number } = topic;
      // The tempting wrong closer: a comma after a dash or parenthesis
      // (the element's own commas suggest it), nothing after a comma.
      const tempting = opener === "," ? "" : ",";
      // A dash closes with no space before the verb; the others are
      // followed by one.
      const render = (mark, n) => {
        const close = mark === "match" ? closer : tempting;
        return `${w1}${close}${close === "—" ? "" : " "}${topic.verbs[n]}`;
      };
      const choices = squareOf(["closer", "number"], [["match", "mismatch"], ["singular", "plural"]], render, (mark, n) => {
        const problems = [];
        if (mark === "mismatch") {
          problems.push(opener === ","
            ? `the interruption opened with a comma after "${topic.head}", so it must close with a comma before the verb; without one, the verb runs into the interruption`
            : `the interruption opened with ${opener === "(" ? "an" : "a"} ${OPENER_NAMES[opener]} after "${topic.head}", so it must close with a ${CLOSER_NAMES[opener]}; the commas inside it do not change which mark closes it`);
        }
        if (n !== number) problems.push(`"${topic.verbs[n]}" is ${n}, but it must agree with the subject before the interruption, "${topic.subject}", which is ${number}`);
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: `The ${OPENER_NAMES[opener]} after "${topic.head}" opens an interruption that ends with "${w1}"; it closes with a matching ${CLOSER_NAMES[opener]}${opener === "," ? ", however long it is" : ", however many commas it contains"}. The main verb then agrees with the subject before the interruption, "${topic.subject}", which is ${number}: "${choices.correct}".`,
        steps: [
          "Find the subject of the sentence and the mark that opens the interruption after it.",
          `The interruption opened with a ${OPENER_NAMES[opener]}, so it must close with one at the blank.`,
          `Skip the interruption and match the verb to "${topic.subject}", which is ${number}.`,
        ],
        principles: [
          "A nonessential element in the middle of a sentence is set off by a matching pair: two commas, two dashes, or two parentheses.",
          "A verb agrees with its subject, not with the nouns inside an interruption between them.",
        ],
        trap: opener === ","
          ? "Leaving out the closing comma because the interruption is long and its opening comma is far back, or matching the verb to the noun right before the blank."
          : "Closing with a comma because the interruption already contains commas, or matching the verb to the noun right before the blank.",
        hint: "Go back to where the interruption began. What mark opened it, and what is the sentence's subject?",
        estimatedSeconds: 85,
      });
      instance.verify = () => {
        const text = topic.text;
        const blankAt = text.indexOf(BLANK);
        const openText = opener === "(" ? " (" : opener;
        const at = text.indexOf(`${topic.head}${openText}`);
        if (blankAt < 0 || at < 0 || at > blankAt) return false;
        const inside = text.slice(at + topic.head.length + openText.length, blankAt);
        // A dash or parenthesis element contains commas (the lure) but no
        // mark of its own kind; a comma element contains no mark at all, so
        // its opening comma is the only one to match.
        const lured = opener === ","
          ? !/[,;:—()]/.test(inside)
          : /,/.test(inside) && !(opener === "(" ? /[()]/ : /—/).test(inside);
        const before = text.slice(0, at + topic.head.length);
        // The subject's number, read off the word ("lens" is singular).
        const plural = /[^su]s$/.test(topic.subject) && topic.subject !== "lens";
        return lured && lower(before).includes(lower(topic.subject)) && (number === "plural") === plural &&
          instance.correct === render("match", number) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B10: essential or nonessential, decided by context */

  // Hard. Each topic: `head` + `clause` + the main verb span the blank.
  // `candidates` is how many things the context offers that the head could
  // mean; more than one makes the clause essential (no commas), exactly one
  // makes it nonessential (a pair of commas). The choices cross those commas
  // with the main verb's number (`verbs`), which agrees with the head.
  const ESSENTIAL_CLAUSE_TOPICS = [
    {
      scene: "sec-three-exercise-groups",
      text: "Researchers divided 300 adults into three groups: one walked every day, one lifted weights twice a week, and one made no change to its routine. Six months later, the ______ getting an average of forty minutes more sleep each night than those in the other groups.",
      head: "participants", clause: "who had walked every day", verbs: { singular: "was", plural: "were" }, candidates: 3, cue: "three groups",
      note: "Only one of the three groups walked every day, so the clause is needed to say which participants slept longer.",
      misread: "claims that every participant had walked every day",
    },
    {
      scene: "sec-shaded-turtle-nests",
      text: "Biologists tracked 120 loggerhead turtle nests on a Florida beach, some shaded by dune grass and others in open sand. The ______ cooler on average, and the hatchlings that emerged from them were more likely to be male.",
      head: "nests", clause: "where dune grass shaded the sand", verbs: { singular: "was", plural: "were" }, candidates: 2, cue: "some shaded",
      note: "Only some nests were shaded, so the clause is needed to say which nests were cooler.",
      misread: "claims that dune grass shaded every nest",
    },
    {
      scene: "sec-harbor-prize",
      text: "Six novelists are on the shortlist for this year's Harbor Prize, which honors fiction about coastal communities. Most critics agree that the ______ the favorite, largely because of a story set in her grandmother's bakery in Halifax.",
      head: "novelist", clause: "whose first book appeared in 2012", verbs: { singular: "is", plural: "are" }, candidates: 6, cue: "Six novelists",
      note: "Six novelists are on the shortlist, so the clause is needed to identify which one is the favorite.",
      misread: "treats the favorite as already identified, though six novelists are in contention",
    },
    {
      scene: "sec-leeds-nurse-schedules",
      text: "A hospital in the city of Harlow tested a new scheduling system on two of its wards while its other wards kept the old one. Three months into the trial, the ______ reporting fewer missed breaks and less unpaid overtime.",
      head: "nurses", clause: "who worked on the two test wards", verbs: { singular: "was", plural: "were" }, candidates: 2, cue: "other wards",
      note: "The hospital's nurses worked on both test wards and other wards, so the clause is needed to say which nurses reported fewer missed breaks.",
      misread: "claims that all of the hospital's nurses worked on the two test wards",
    },
    {
      scene: "sec-mulched-sorghum-plots",
      text: "Agronomist Nkechi Okafor planted the same variety of sorghum on forty plots but spread crop residue as mulch on only half of them. A week after the last rain, the ______ still moist, while the bare plots had dried out.",
      head: "plots", clause: "where she had spread the mulch", verbs: { singular: "was", plural: "were" }, candidates: 2, cue: "only half",
      note: "Only half of the plots were mulched, so the clause is needed to say which plots stayed moist.",
      misread: "claims that she mulched every plot",
    },
    {
      scene: "sec-debate-club-students",
      text: "When the school started an optional debate club, about a third of its ninth graders signed up. By the end of the year, the ______ scoring higher on a persuasive-writing test than their classmates did.",
      head: "students", clause: "who had joined the club", verbs: { singular: "was", plural: "were" }, candidates: 2, cue: "about a third",
      note: "Only about a third of the ninth graders joined, so the clause is needed to say which students scored higher.",
      misread: "claims that all of the students had joined the club",
    },
    {
      scene: "sec-ghana-swallow-days",
      text: "Ornithologist Kofi Mensah counted barn swallows passing a headland near the fishing town of Keld every day during the spring migration. The ______ by far the busiest, with flocks of more than a thousand birds passing each hour.",
      head: "days", clause: "when the wind blew from the south", verbs: { singular: "was", plural: "were" }, candidates: 60, cue: "every day",
      note: "Mensah counted on every day of the migration, so the clause is needed to say which days were busiest.",
      misread: "claims that the wind blew from the south on every day of the count",
    },
    {
      scene: "sec-vidal-self-portraits",
      text: "The Marlow Museum owns eleven self-portraits by the painter Lucía Vidal. The ______ the only one that has ever been lent to another museum; it traveled to Tokyo in 2018 for a retrospective of her work.",
      head: "self-portrait", clause: "whose frame Vidal carved herself", verbs: { singular: "is", plural: "are" }, candidates: 11, cue: "eleven self-portraits",
      note: "The museum owns eleven self-portraits, so the clause is needed to identify which one has been lent.",
      misread: "treats the self-portrait as already identified, though the museum owns eleven",
    },
    {
      scene: "sec-villa-glass-fragments",
      text: "Archaeologist Carla Benedetti sorted 2,000 glass fragments from a Roman villa by color and thickness, and she noticed that only some of them had edges that had been ground flat. The ______ pieces of windows, not of drinking cups, she concluded.",
      head: "fragments", clause: "whose edges had been ground flat", verbs: { singular: "was", plural: "were" }, candidates: 2000, cue: "2,000 glass fragments",
      note: "Only some of the 2,000 fragments had edges ground flat, so the clause is needed to say which fragments came from windows.",
      misread: "claims that every fragment had its edges ground flat",
    },
    {
      scene: "sec-architect-julia-reyes",
      text: "The Hollis Public Library, completed in 1931, was the first building in the city designed by a woman. Its architect was Julia Reyes. ______ especially proud of the reading room, which is lit entirely by skylights.",
      head: "Reyes", number: "singular", clause: "who had studied under two celebrated architects", verbs: { singular: "was", plural: "were" }, candidates: 1, cue: "Julia Reyes",
      note: "Reyes is already identified by name, so the clause only adds information about her and must be set off by a pair of commas.",
    },
    {
      scene: "sec-grace-hopper",
      text: "In the early 1950s, most computers could be programmed only with long strings of numbers. Grace ______ among the first to build a compiler, a program that translated instructions written in words into code a machine could run.",
      head: "Hopper", clause: "who led a team of programmers at a computer company in Philadelphia", verbs: { singular: "was", plural: "were" }, candidates: 1, cue: "Grace",
      note: "Grace Hopper is identified by name, so the clause only adds information about her and must be set off by a pair of commas.",
    },
    {
      scene: "sec-baikal-endemics",
      text: "Lake Baikal in Siberia is the deepest lake on Earth, plunging more than 1,600 meters. ______ roughly a fifth of all the unfrozen fresh water on the planet's surface.",
      head: "Baikal", clause: "where most of the animal species live nowhere else", verbs: { singular: "has", plural: "have" }, candidates: 1, cue: "Lake Baikal",
      note: "Baikal is a single, named lake, so the clause only adds information about it and must be set off by a pair of commas.",
    },
    {
      scene: "sec-jessup-driftwood",
      text: "For forty years, folk artist Walter Jessup carved shorebirds from driftwood he gathered along North Carolina's Outer Banks. ______ known for giving away nearly every carving he made to friends and neighbors.",
      head: "Jessup", clause: "whose workshop was a converted fishing shack", verbs: { singular: "was", plural: "were" }, candidates: 1, cue: "Walter Jessup",
      note: "Jessup is already identified by name, so the clause only adds information about him and must be set off by a pair of commas.",
    },
    {
      scene: "sec-brandt-sisters-bakery",
      text: "For forty years, the only bakery in the town of Ellisfort was run by two sisters, Greta and Ilse Brandt. The ______ also the town's first licensed pilots, and they sometimes delivered bread by airplane.",
      head: "sisters", clause: "who baked every loaf by hand", verbs: { singular: "was", plural: "were" }, candidates: 1, cue: "Greta and Ilse Brandt",
      note: "The two sisters are already identified by name, so the clause only adds information about them and must be set off by a pair of commas.",
    },
  ];

  const essentialClauseContext = {
    id: "sec-essential-clause-context",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Hard",
    title: "Essential or nonessential clause, decided by context",
    recognize:
      "Whether the clause takes a pair of commas depends on the context: if it is needed to pick out which one is meant, it takes none. Either way, the verb after it agrees with the head noun before it.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["grammatical-but-illogical", "agreement-attractor"],
    build(t) {
      const topic = t.pick(ESSENTIAL_CLAUSE_TOPICS);
      const { head, clause } = topic;
      const essential = topic.candidates > 1;
      const number = topic.number || (/[^su]s$/.test(head) ? "plural" : "singular");
      const render = (commas, n) => (commas === "pair" ? `${head}, ${clause}, ${topic.verbs[n]}` : `${head} ${clause} ${topic.verbs[n]}`);
      const choices = squareOf(["commas", "number"], [["pair", "none"], ["singular", "plural"]], render, (commas, n) => {
        const problems = [];
        if (essential && commas === "pair") problems.push(`the pair of commas makes the clause nonessential, which ${topic.misread}; the context shows the clause is needed to identify which ${head} the sentence means`);
        if (!essential && commas === "none") problems.push(`without commas, the clause would be read as needed to pick out which ${head} is meant, but ${head} ${number === "plural" ? "are" : "is"} already identified`);
        if (n !== number) problems.push(`"${topic.verbs[n]}" is ${n}, but it must agree with "${head}", which is ${number}`);
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: `${topic.note} The verb agrees with "${head}", which is ${number}: "${choices.correct}".`,
        steps: [
          "Identify the clause beginning with who, whose, where, or when.",
          "Ask whether the context has already identified which one the sentence is about, or whether the clause is needed to identify it.",
          "Use no commas for a clause that identifies; use a pair of commas for a clause that only adds information.",
          `Match the verb to "${head}", not to the nouns inside the clause.`,
        ],
        principles: [
          "An essential (restrictive) clause identifies which person or thing is meant and is not set off by commas.",
          "A nonessential clause adds information about someone or something already identified and is set off by a pair of commas.",
          "A verb agrees with the head of its subject, not with nouns inside a clause that describes it.",
        ],
        trap: essential
          ? "Adding a pair of commas because the clause looks like extra description, without checking whether the context needs it to identify the group."
          : "Leaving out the commas because the clause seems important, even though the person or place is already identified by name.",
        hint: "Before the clause, does the reader already know exactly which one the sentence means?",
        estimatedSeconds: 85,
      });
      instance.verify = () => {
        const parts = around(topic.text);
        if (!parts || !parts.before.includes(topic.cue)) return false;
        if (!/^(who|whom|whose|where|when)\b/.test(clause) || clause.includes(",")) return false;
        // A nonessential clause follows a named individual (or named pair);
        // an essential one follows a common noun that the context leaves
        // ambiguous.
        const named = /^[A-Z]/.test(head) || (parts.before.includes(topic.cue) && topic.candidates === 1);
        if (essential ? /^[A-Z]/.test(head) : !named) return false;
        const key = render(essential ? "none" : "pair", number);
        return instance.correct === key && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B11: a transition inside a single clause */

  // Hard. Each topic: the blank's sentence begins with a long subject (from
  // `head`, holding a relative clause with its own verb) that ends with w1
  // ("interrupt"), or with such a subject and its main verb, so that the
  // words before the blank are already a complete clause (`c1`; "clause").
  // The transition `adv` then either interrupts the single clause before its
  // main verb w2, or begins a second clause. The choices cross the mark
  // before `adv` with the mark after it (a comma or a semicolon each). A
  // "clause" sentence opens the passage, so `adv` cannot end its first
  // clause: there is nothing before it to link to. The two kinds are equally
  // common, and both use a range of transitions.
  const INTERRUPTER_TOPICS = [
    {
      scene: "sec-harrow-puffins",
      text: "For decades, observers walking the cliffs of Harrow Island counted about two hundred pairs of nesting puffins each summer. The survey that ecologists conducted by drone in ______ only 120 pairs.",
      head: "The survey", w1: "2021", adv: "however", w2: "found", kind: "interrupt",
    },
    {
      scene: "sec-solar-vaccine-fridge",
      text: "Most vaccines must be kept cold all the way from the factory to the clinic, which is difficult where electricity is unreliable. The solar-powered refrigerator that engineer Amina Yusuf designed for rural ______ vaccines cold for five days without any sunlight.",
      head: "The solar-powered refrigerator", w1: "clinics", adv: "however", w2: "keeps", kind: "interrupt",
    },
    {
      scene: "sec-gorge-bridges",
      text: "The wooden footbridges built across the Kessel Gorge in the 1800s had to be replaced every few decades. The steel bridge that engineers completed across the gorge in ______ in service today after only minor repairs.",
      head: "The steel bridge", w1: "1931", adv: "in contrast", w2: "remains", kind: "interrupt",
    },
    {
      scene: "sec-winter-bee-cluster",
      text: "Honeybees have several ways of surviving cold winters without hibernating. The heat that the bees generate by shivering their flight ______ the center of their cluster above 18 degrees Celsius even when the air outside is below freezing.",
      head: "The heat", w1: "muscles", adv: "for example", w2: "keeps", kind: "interrupt",
    },
    {
      scene: "sec-fairmont-library-app",
      text: "Public libraries have found new ways to reach readers who rarely visit in person. The app that the Fairmont library launched in ______ patrons borrow audiobooks without ever getting a library card.",
      head: "The app", w1: "2019", adv: "for instance", w2: "lets", kind: "interrupt",
    },
    {
      scene: "sec-replanted-marshes",
      text: "Restoring wetlands along the Tolliver River has reduced flooding in the towns downstream. The marshes that volunteers replanted in ______ shelter for several species of migrating ducks.",
      head: "The marshes", w1: "2016", adv: "moreover", w2: "provide", kind: "interrupt",
    },
    {
      scene: "sec-shorter-homework",
      text: "Many teachers in the district doubted that shorter homework assignments would make any difference. The students whose teachers agreed to try the shorter ______ slightly higher grades than their peers by the end of the term.",
      head: "The students", w1: "assignments", adv: "nevertheless", w2: "earned", kind: "interrupt",
    },
    {
      scene: "sec-verhulst-underdrawing",
      text: "For a century, a portrait in the Aldridge Gallery was attributed to a student of the Flemish painter Jan Verhulst. The underdrawing that x-rays revealed beneath the ______ sketches known to be by Verhulst himself.",
      head: "The underdrawing", w1: "paint", adv: "however", w2: "resembles", kind: "interrupt",
    },
    {
      scene: "sec-southern-stream-wolves",
      text: "Along the northern ridge of the park, wildlife cameras recorded wolves only at night. The cameras that rangers mounted beside the southern ______ wolves during daylight as well.",
      head: "The cameras", w1: "stream", adv: "meanwhile", w2: "captured", kind: "interrupt",
    },
    {
      scene: "sec-flour-price-drought",
      text: "A drought in 1846 destroyed much of the wheat harvest in the region around the capital. The price that bakers in the city paid for ______ to nearly three times its usual level within a year.",
      head: "The price", w1: "flour", adv: "consequently", w2: "rose", kind: "interrupt",
    },
    {
      scene: "sec-kessel-footbridge-forecast",
      text: "The engineers who built the first wooden footbridges across the Kessel Gorge in the 1800s expected them to last for a century or ______ most of them had to be replaced within a few decades. Only the steel bridge completed in 1931 has lasted longer.",
      head: "The engineers", w1: "more", adv: "however", w2: "most", kind: "clause", c1: ["engineers", "expected"],
      link: "contrasts the engineers' expectation with what happened",
    },
    {
      scene: "sec-pell-curators-assumption",
      text: "The curators who planned the Pell Museum's 2022 renovation assumed that visitors would use its new touch-screen ______ most visitors relied on printed labels and on conversations with one another. The museum has since added more labels.",
      head: "The curators", w1: "guides", adv: "however", w2: "most", kind: "clause", c1: ["curators", "assumed"],
      link: "contrasts the curators' assumption with what visitors did",
    },
    {
      scene: "sec-homework-expectations",
      text: "The students whose teachers agreed to try shorter homework assignments expected their grades to ______ they earned slightly higher grades than their peers by the end of the term.",
      head: "The students", w1: "fall", adv: "however", w2: "they", kind: "clause", c1: ["students", "expected"],
      link: "contrasts the students' expectation with their results",
    },
    {
      scene: "sec-aldridge-attribution",
      text: "The historian who compiled the Aldridge Gallery's first catalog of portraits in 1911 attributed one of them to a student of the Flemish painter Jan ______ x-rays later revealed an underdrawing in the hand of Verhulst himself.",
      head: "The historian", w1: "Verhulst", adv: "however", w2: "x-rays", kind: "clause", c1: ["historian", "attributed"],
      link: "contrasts the historian's attribution with what the x-rays revealed",
    },
    {
      scene: "sec-selby-valley-canals",
      text: "The farmers who settled the dry western edge of the Selby Valley in the 1870s could not rely on ______ they dug a network of canals to carry water from the river to their fields.",
      head: "The farmers", w1: "rain", adv: "consequently", w2: "they", kind: "clause", c1: ["farmers", "could not rely"],
      link: "presents the canals as a result of the lack of rain",
    },
    {
      scene: "sec-harrow-puffin-diet",
      text: "The puffins that nest on the cliffs of Harrow Island feed their chicks almost entirely on small ______ a single chick may eat hundreds of sand eels in its first weeks in the burrow.",
      head: "The puffins", w1: "fish", adv: "for example", w2: "a", kind: "clause", c1: ["puffins", "feed"],
      link: "introduces one chick's meals as an example of that diet",
    },
    {
      scene: "sec-dunmore-monarch-count",
      text: "The volunteers who counted monarch butterflies at the Dunmore nature preserve in 2023 saw more of them than in any earlier ______ the total was nearly twice the previous record.",
      head: "The volunteers", w1: "year", adv: "in fact", w2: "the", kind: "clause", c1: ["volunteers", "saw"],
      link: "strengthens the first claim with a more striking detail",
    },
    {
      scene: "sec-tolliver-dam-road",
      text: "The dam that engineers completed across the Tolliver River in 1934 flooded the valley's only ______ the villages upstream could be reached only by boat for several years.",
      head: "The dam", w1: "road", adv: "as a result", w2: "the", kind: "clause", c1: ["dam", "flooded"],
      link: "presents the villages' isolation as a result of the flooding",
    },
    {
      scene: "sec-harlow-garden-tomatoes",
      text: "The tomatoes that gardeners at the Harlow Community Garden grew in raised beds last summer ripened by early ______ those planted directly in the ground did not ripen until August.",
      head: "The tomatoes", w1: "July", adv: "in contrast", w2: "those", kind: "clause", c1: ["tomatoes", "ripened"],
      link: "contrasts the tomatoes in the ground with those in raised beds",
    },
    {
      scene: "sec-ellisfort-solar-roofs",
      text: "The solar panels that the town of Ellisfort installed on its school roofs in 2019 supply most of the electricity the schools ______ they produce enough extra power in summer to light the town's parks.",
      head: "The solar panels", w1: "use", adv: "moreover", w2: "they", kind: "clause", c1: ["panels", "supply"],
      link: "adds a second benefit of the panels to the first",
    },
  ];

  const INTERRUPTER_KEYS = { interrupt: ["comma", "comma"], clause: ["semicolon", "comma"] };

  const adverbInterruptsClause = {
    id: "sec-adverb-interrupts-clause",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Hard",
    title: "Transition inside a clause or between two",
    recognize:
      "Decide whether the words before the blank are only a long subject (the transition interrupts one clause and takes a comma on each side) or a complete clause (the transition begins a new clause after a semicolon).",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "comma-splice"],
    build(t) {
      const topic = t.pick(INTERRUPTER_TOPICS);
      const { w1, w2, adv } = topic;
      const interrupt = topic.kind === "interrupt";
      const parts = around(topic.text);
      const lead = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      const markOf = (value) => (value === "comma" ? "," : ";");
      const render = (before, after) => `${w1}${markOf(before)} ${adv}${markOf(after)} ${w2}`;
      const choices = squareOf(["before", "after"], [["comma", "semicolon"], ["comma", "semicolon"]], render, (before, after) => {
        const [keyBefore, keyAfter] = INTERRUPTER_KEYS[topic.kind];
        if (before === keyBefore && after === keyAfter) return null;
        const problems = [];
        if (interrupt) {
          if (before === "semicolon") problems.push(`a semicolon must follow an independent clause, but "${lead}" is only the subject of a sentence whose verb is "${w2}"`);
          if (after === "semicolon") problems.push(`a semicolon after "${adv}" would cut the subject off from its verb, "${w2}"; the words after it are not an independent clause`);
        } else {
          if (before === "semicolon" && after === "semicolon") {
            problems.push(`with a semicolon on each side, "${adv}" is stranded between the two clauses and belongs to neither`);
          } else if (before === "comma" && after === "comma") {
            problems.push(`"${lead}" is already a complete clause (its verb is "${topic.c1[1]}"), and a new clause follows; commas alone around "${adv}" join the two clauses with only a comma, a comma splice`);
          } else {
            problems.push(`this makes "${adv}" end the first clause, linking it to something before it; but this sentence opens the passage, and "${adv}" ${topic.link}, so it begins the second clause`);
          }
        }
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: interrupt
          ? `"${lead}" is the subject of the sentence, and its verb is "${w2}"; the verb inside the descriptive clause does not make these words an independent clause. "${cap(adv)}" interrupts that single clause, so it is set off by a comma on each side: "${choices.correct}".`
          : `"${lead}" is a complete clause: its main verb is "${topic.c1[1]}". A second independent clause follows, and "${adv}" ${topic.link}, so it begins the second clause: a semicolon separates the clauses and a comma follows "${adv}": "${choices.correct}".`,
        steps: [
          "Find the main verb of the words before the blank, looking past any verb inside a who/that/whose clause.",
          interrupt
            ? `There is none: everything before the blank is the subject of "${w2}", so "${adv}" interrupts one clause.`
            : `There is one, "${topic.c1[1]}", so the words before the blank are a complete clause and "${adv}" begins a new one.`,
          interrupt ? `Set off "${adv}" with a comma on each side.` : `Put a semicolon before "${adv}" and a comma after it.`,
        ],
        principles: [
          "A transition that begins a new independent clause takes a semicolon or period before it and a comma after it.",
          "A transition that interrupts a single clause is set off by a comma on each side; a semicolon on either side would cut the subject off from its verb.",
          "A verb inside a relative clause (that, who, whom, whose) is not the main verb.",
        ],
        trap: interrupt
          ? `Choosing "; ${adv}," by reflex, as if the transition joined two clauses, because the long subject contains a verb.`
          : `Choosing ", ${adv}," because the sentence opens with a long subject like one that "${adv}" could interrupt, though its main verb has already appeared.`,
        hint: "What is the main verb of the words before the blank, if there is one?",
        estimatedSeconds: 85,
      });
      instance.verify = () => {
        if (!parts) return false;
        const sentence = sentenceLead(parts.before);
        if (sentence.indexOf(topic.head) !== 0 || /[,;:—()]/.test(sentence)) return false;
        const hasMainVerb = Boolean(topic.c1) && sentence.includes(topic.c1[0]) && sentence.includes(` ${topic.c1[1]} `);
        const kind = hasMainVerb ? "clause" : "interrupt";
        // A clause-kind sentence opens the passage; an interrupted one
        // follows the sentence its transition relates it to.
        const opens = sentence === parts.before;
        return CONJ_ADVERBS.includes(adv) && kind === topic.kind && opens === (kind === "clause") &&
          instance.correct === render(...INTERRUPTER_KEYS[kind]) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B12: opening a supplement to match its end */

  // Medium (relabelled from Hard on 2026-09-26: looking ahead to the
  // closing mark is the one real decision; the noun's number is set by a
  // verb or number word in plain view). Each topic: the blank holds the
  // noun before a supplement (in the right number, `forms`) and the mark
  // that opens the supplement. How the
  // supplement ends decides that mark: a dash later in the sentence, a comma
  // later in the sentence, or the end of the sentence ("end"), where a
  // supplement that is itself a list with commas needs a dash. The noun's
  // number is set by the verb after the supplement or by a number word.
  const SUPPLEMENT_TOPICS = [
    {
      scene: "sec-varne-heron",
      text: "Three species of heron nest in the marshes of the Keld Estuary. The Varne ______ largest and rarest of the three, with gray plumes and a long yellow bill—nests only on small islands that foxes cannot reach.",
      forms: { singular: "heron", plural: "herons" }, number: "singular", ends: "dash", cue: "nests", next: "the",
    },
    {
      scene: "sec-varden-instruments",
      text: "The Varden Museum's collection of navigation tools began with a gift from a retired sea captain in 1901. The collection's two oldest ______ sextant and a chronometer, both made in London around 1790—were restored in 2019.",
      forms: { singular: "instrument", plural: "instruments" }, number: "plural", ends: "dash", cue: "were restored", next: "a",
    },
    {
      scene: "sec-expedition-ship",
      text: "The 1911 expedition to map the Tarn Glacier depended on a single vessel. The expedition's ______ former whaler, refitted with oak planks to withstand the ice—is now a floating museum in the harbor where it was built.",
      forms: { singular: "ship", plural: "ships" }, number: "singular", ends: "dash", cue: "is now", next: "a",
    },
    {
      scene: "sec-festival-founders",
      text: "The Dunmore Harvest Festival began in 1990 as a single afternoon in a church parking lot. Its ______ teacher, a baker, and a retired sea captain—still meet every month to plan the next year's festival.",
      forms: { singular: "founder", plural: "founders" }, number: "plural", ends: "dash", cue: "still meet", next: "a",
    },
    {
      scene: "sec-selby-mill",
      text: "Of the dozens of textile mills that once lined the Selby River, only one survives. The Selby ______ brick building on the river's east bank, now houses a cooperative of weavers who rent studio space on its upper floors.",
      forms: { singular: "mill", plural: "mills" }, number: "singular", ends: "comma", cue: "now houses", next: "a",
    },
    {
      scene: "sec-rahman-studies",
      text: "Transportation researcher Aisha Rahman has published widely, but city planners cite two of her papers most often. Rahman's two best-known ______ survey of bike lanes and a survey of bus routes, have shaped transit planning in several cities.",
      forms: { singular: "study", plural: "studies" }, number: "plural", ends: "comma", cue: "have shaped", next: "a",
    },
    {
      scene: "sec-keld-nesting-beach",
      text: "Loggerhead turtles nest on only one beach on the island of Keld. The ______ narrow strip of sand between two rocky headlands, is closed to visitors from May to October.",
      forms: { singular: "beach", plural: "beaches" }, number: "singular", ends: "comma", cue: "is closed", next: "a",
    },
    {
      scene: "sec-festival-headliners",
      text: "Tickets for this year's chamber music festival sold out within an hour. The festival's two ______ violinist from Lagos and a pianist from Oslo, are performing together for the first time.",
      forms: { singular: "headliner", plural: "headliners" }, number: "plural", ends: "comma", cue: "are performing", next: "a",
    },
    {
      scene: "sec-orrin-core-materials",
      text: "Core samples drilled from the bottom of Lake Orrin surprised the geologists who studied them. The samples contained three unexpected ______ from a distant eruption, pollen from trees that no longer grow in the region, and the shell of a tiny freshwater snail.",
      forms: { singular: "material", plural: "materials" }, number: "plural", ends: "end", cue: "three", next: "ash",
    },
    {
      scene: "sec-summit-team",
      text: "Ten climbers set out from the base camp on Mount Kessel, but storms turned most of them back. In the end, the summit was reached by a single ______ geologist, a botanist, and a photographer.",
      forms: { singular: "team", plural: "teams" }, number: "singular", ends: "end", cue: "a single", next: "a",
    },
    {
      scene: "sec-ashby-first-catalog",
      text: "The first public library in the mill town of Ashby opened in 1889 with fewer than five hundred books. Its first catalog sorted them into just four ______, poetry, travel, and farming.",
      forms: { singular: "subject", plural: "subjects" }, number: "plural", ends: "end", cue: "four", next: "history",
    },
    {
      scene: "sec-keeper-measurements",
      text: "The keeper of the Brannock lighthouse filled forty notebooks between 1851 and 1890. Every winter morning he recorded the same three ______ height of the waves, the temperature of the air, and the thickness of the ice on the rocks.",
      forms: { singular: "measurement", plural: "measurements" }, number: "plural", ends: "end", cue: "three", next: "the",
    },
  ];

  const supplementOpening = {
    id: "sec-supplement-opening-mark",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Medium",
    title: "Opening a supplement to match how it ends",
    recognize:
      "Read past the blank to where the supplement ends. A dash later means it opens with a dash; a comma later means a comma; a list with commas at the end of the sentence needs a single dash. The noun before it agrees with the verb or number word elsewhere in the sentence.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["neighbouring-rule", "agreement-attractor"],
    build(t) {
      const topic = t.pick(SUPPLEMENT_TOPICS);
      const keyMark = topic.ends === "comma" ? "comma" : "dash";
      const render = (mark, n) => `${topic.forms[n]}${mark === "dash" ? "—" : ", "}${topic.next}`;
      const reasonFor = {
        dash: "the supplement closes with a dash later in the sentence, so it must open with one; a comma would leave the pair mismatched",
        comma: "the supplement closes with a comma later in the sentence, so it must open with one; a dash would leave the pair mismatched",
        end: "the supplement runs to the end of the sentence and is itself a list with commas, so a comma before it would blur it into a longer list; a single dash sets it off",
      }[topic.ends];
      const choices = squareOf(["opener", "number"], [["dash", "comma"], ["singular", "plural"]], render, (mark, n) => {
        const problems = [];
        if (mark !== keyMark) problems.push(reasonFor);
        if (n !== topic.number) problems.push(`"${topic.forms[n]}" is ${n}, but ${topic.ends === "end" ? `"${topic.cue}"` : `the verb "${topic.cue}"`} calls for the ${topic.number} "${topic.forms[topic.number]}"`);
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: `${topic.ends === "end"
          ? "The supplement after the blank runs to the end of the sentence and is a list whose items are separated by commas, so a single dash, not a comma, introduces it."
          : `The supplement after the blank closes with a ${keyMark} later in the sentence, so it must open with a ${keyMark}.`} The noun is ${topic.number}, as ${topic.ends === "end" ? `"${topic.cue}"` : `the verb "${topic.cue}"`} shows: "${choices.correct}".`,
        steps: [
          "Read past the blank to find where the supplement ends: a dash, a comma, or the end of the sentence.",
          "Open the supplement with the mark that closes it; before a list that ends the sentence, use a single dash.",
          `Check the noun's number against ${topic.ends === "end" ? "the number word before it" : "the verb after the supplement"}.`,
        ],
        principles: [
          "A supplement in the middle of a sentence is set off by a matching pair of marks: two commas, two dashes, or two parentheses.",
          "A supplement at the end of a sentence is introduced by a single mark; when it is a list whose items are separated by commas, a dash (or colon) keeps it distinct.",
        ],
        trap: topic.ends === "dash"
          ? "Opening with a comma because commas usually set off supplements, without looking ahead to the dash that closes this one."
          : topic.ends === "comma"
            ? "Opening with a dash because the supplement looks long, without looking ahead to the comma that closes it."
            : "Using a comma before the list, which turns the noun before it into one more item in the list.",
        hint: "Where does the supplement after the blank end, and with what mark?",
        estimatedSeconds: 70,
      });
      instance.verify = () => {
        const parts = around(topic.text);
        if (!parts) return false;
        const sentenceRest = parts.after.split(/(?<=[.!?])\s/)[0];
        const dashes = (sentenceRest.match(/—/g) || []).length;
        const commas = (sentenceRest.match(/,/g) || []).length;
        // A dash later closes the supplement; otherwise a verb after a comma
        // (the cue) shows it closes with a comma; otherwise it runs to the
        // end of the sentence as a list, its number set before the blank.
        const ends = dashes === 1 ? "dash"
          : dashes > 0 ? null
            : sentenceRest.includes(topic.cue) ? "comma"
              : parts.before.includes(topic.cue) && commas >= 2 ? "end" : null;
        return ends === topic.ends &&
          instance.correct === render(ends === "comma" ? "comma" : "dash", topic.number) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B13: a descriptor before a name, or an appositive after it */

  // Each topic: the blank covers `left` + mark + `middle` + mark + `right`.
  // "title": a descriptor with no article sits right before a name, which it
  // modifies like a title ("chemist Rosalind Franklin"), so no commas.
  // "title-clause": the same, followed by a clause that adds information
  // about the named person, set off by a comma. "appositive": a name
  // followed by a phrase that renames it, set off by a pair of commas.
  const APPOSITIVE_TOPICS = [
    {
      scene: "sec-franklin-photo-51",
      text: "In 1952, a single X-ray image offered the clearest early evidence of the shape of DNA. British ______ the image with her student Raymond Gosling at King's College London.",
      kind: "title", left: "chemist", middle: "Rosalind Franklin", right: "made",
    },
    {
      scene: "sec-adichie-first-novel",
      text: "Purple Hibiscus follows a teenage girl growing up in the Nigerian city of Enugu. Nigerian ______ the novel in 2003, and her books have since been translated into more than thirty languages.",
      kind: "title", left: "novelist", middle: "Chimamanda Ngozi Adichie", right: "published",
    },
    {
      scene: "sec-ailey-revelations",
      text: "Revelations, a dance set to African American spirituals, has been performed around the world for more than sixty years. American ______ the work in 1960, drawing on memories of his childhood in rural Texas.",
      kind: "title", left: "choreographer", middle: "Alvin Ailey", right: "created",
    },
    {
      scene: "sec-reyes-lund-footbridge",
      text: "The footbridge over the Selby River sways slightly in strong winds, by design. Structural ______ its deck to flex rather than resist, so that gusts would not crack its concrete.",
      kind: "title", left: "engineer", middle: "Tomas Reyes-Lund", right: "designed",
    },
    {
      scene: "sec-kahlo-self-portraits",
      text: "Many of the best-known paintings of the twentieth century are portraits of their own makers. Mexican ______ self-portraits often show her surrounded by plants and animals from her garden, painted more than fifty of them.",
      kind: "title-clause", left: "painter", middle: "Frida Kahlo", right: "whose",
    },
    {
      scene: "sec-katherine-johnson",
      text: "Before electronic computers were reliable, NASA relied on people to calculate spacecraft trajectories by hand. American ______ calculations helped send John Glenn into orbit in 1962, worked at NASA's Langley center for more than thirty years.",
      kind: "title-clause", left: "mathematician", middle: "Katherine Johnson", right: "whose",
    },
    {
      scene: "sec-varga-glassblower",
      text: "The village of Hollis has been known for its glassworks since the 1700s. Hungarian-born ______ vases are sold in galleries across Europe, learned her craft there in a workshop run by her grandfather.",
      kind: "title-clause", left: "glassblower", middle: "Anika Varga", right: "whose",
    },
    {
      scene: "sec-latimer-drafting",
      text: "Alexander Graham Bell's 1876 patent application for the telephone included detailed drawings of his device. American ______ drawings accompanied that application, had taught himself drafting while working at a patent law firm in Boston.",
      kind: "title-clause", left: "draftsman", middle: "Lewis Latimer", right: "whose",
    },
    {
      scene: "sec-kanaan-orchestra-founder",
      text: "The Dunmore Community Orchestra has performed a free concert in the town park every summer since 1998. Leila ______ founded the orchestra with eleven of her former students.",
      kind: "appositive", left: "Kanaan", middle: "a retired music teacher", right: "founded",
    },
    {
      scene: "sec-bessie-coleman-license",
      text: "No flight school in the United States would admit her, so she learned French and sailed to France to learn to fly. Bessie ______ earned her license there in 1921.",
      kind: "appositive", left: "Coleman", middle: "the first African American woman to become a licensed pilot", right: "earned",
    },
    {
      scene: "sec-kariko-mrna",
      text: "For decades, few researchers believed that messenger RNA could be turned into a safe medicine. Katalin ______ the 2023 Nobel Prize in Physiology or Medicine with Drew Weissman for work that made mRNA vaccines possible.",
      kind: "appositive", left: "Karikó", middle: "a biochemist who spent decades studying messenger RNA", right: "shared",
    },
    {
      scene: "sec-mendel-friar",
      text: "Between 1856 and 1863, thousands of pea plants grew in the garden of an abbey in Brno. Gregor ______ bred them to study how traits such as seed color pass from parents to offspring.",
      kind: "appositive", left: "Mendel", middle: "a friar at the abbey", right: "bred",
    },
  ];

  const titleOrAppositive = {
    id: "sec-title-or-appositive",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Medium",
    title: "Descriptor before a name or appositive after it",
    recognize:
      "A descriptor with no article right before a name works like a title (“chemist Rosalind Franklin”) and takes no commas; a phrase or clause after a name that adds information about the named person is set off by commas.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(APPOSITIVE_TOPICS);
      const { left, middle, right, kind } = topic;
      const keyBefore = kind === "appositive" ? "comma" : "none";
      const keyAfter = kind === "title" ? "none" : "comma";
      const render = (before, after) => `${left}${before === "comma" ? "," : ""} ${middle}${after === "comma" ? "," : ""} ${right}`;
      const choices = squareOf(["before", "after"], [["comma", "none"], ["comma", "none"]], render, (before, after) => {
        const problems = [];
        if (before !== keyBefore) {
          problems.push(kind === "appositive"
            ? `"${middle}" renames ${left} and adds information about someone already named, so a comma must open it`
            : `"${left}" has no article and works like a title for ${middle}, so no comma separates it from the name`);
        }
        if (after !== keyAfter) {
          problems.push(kind === "title"
            ? `a comma after ${middle} would separate the subject from its verb, "${right}"`
            : kind === "title-clause"
              ? `the clause beginning "${right}" only adds information about ${middle}, who is already named, so a comma must set it off`
              : `the phrase "${middle}" must be closed by a second comma before the verb, "${right}"`);
        }
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const why = {
        title: `"${left}" has no article and sits right before the name, so it works like a title: "${left} ${middle}" is one unit, and nothing separates it from its verb.`,
        "title-clause": `"${left}" works like a title for ${middle}, so no comma comes between them; the clause beginning "${right}" adds information about a person already named, so a comma sets it off.`,
        appositive: `"${middle}" follows the name and adds information about someone already identified, so a pair of commas sets it off.`,
      }[kind];
      const instance = multipleChoice(topic, choices, {
        explanation: `${why} The answer is "${choices.correct}".`,
        steps: [
          "Find the name and the words that describe the person.",
          "A descriptor with no article right before a name works like a title and takes no comma.",
          "A phrase or clause after a name that only adds information is set off by commas, one on each side if the sentence continues.",
        ],
        principles: [
          "A descriptor used like a title before a name (“novelist Toni Morrison”) is not set off by commas.",
          "A nonessential phrase or clause after a name is set off by a pair of commas; no single comma separates a subject from its verb.",
        ],
        trap: kind === "appositive"
          ? "Leaving out one of the two commas around the phrase that renames the person."
          : "Putting commas around the name as if the descriptor before it were a separate noun phrase.",
        hint: "Is the describing word before the name, with no article, or after it?",
        estimatedSeconds: 60,
      });
      instance.verify = () => {
        const parts = around(topic.text);
        if (!parts) return false;
        const lead = sentenceLead(parts.before);
        // A title-like descriptor has no article before it.
        const noArticle = !/\b(the|a|an)\s*$/i.test(parts.before);
        const derived = /^[A-Z]/.test(left) ? "appositive" : right === "whose" ? "title-clause" : "title";
        return lead.length > 0 && noArticle && derived === kind &&
          instance.correct === render(keyBefore, keyAfter) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B14: commas around a quotation */

  // Each topic: the blank covers `left`, a quotation, and `right`. The
  // quotation is worked into the sentence ("integrated": an object or a
  // phrase after "as", or an essential quotation that picks out one of many,
  // so no commas), ends an introductory clause or a first independent clause
  // ("closes": a comma after it, none before), or renames something already
  // identified ("appositive": a pair of commas). American style puts the
  // comma inside the closing quotation mark.
  const QUOTATION_TOPICS = [
    {
      scene: "sec-haddad-late-landscapes",
      text: "When the painter Otto Sarkis died, many critics dismissed his loose, unfinished-looking late work. The critic Laila Haddad called his late ______ a review that changed how collectors saw them.",
      kind: "integrated", left: "landscapes", quote: "the most daring work of his career", right: "in",
    },
    {
      scene: "sec-marrow-harbor-line",
      text: "The poet Ines Marrow wrote her best-known poem after her brother's death, and readers still quote many of its lines. The ______ the poem and returns, slightly changed, in its final stanza.",
      kind: "integrated", left: "line", quote: "Every harbor keeps its own weather", right: "opens",
    },
    {
      scene: "sec-breathing-bridge",
      text: "The Lowell Street Bridge's steel deck expands and contracts with every change in temperature. Engineers who maintain it often describe the central span ______ hot afternoons, when it lengthens by several centimeters.",
      kind: "integrated", left: "as", quote: "a structure that breathes", right: "on",
    },
    {
      scene: "sec-keep-left-sign",
      text: "The coastal trail at Kessel Point is lined with signs, most of them warnings about loose rock. Hikers who read the ______ usually laugh before they notice that the path really does bend sharply toward the cliff.",
      kind: "integrated", left: "sign", quote: "Keep left or swim", right: "usually",
    },
    {
      scene: "sec-mayors-wall",
      text: "The seawall that Brisk Harbor built in 2015 was controversial from the start. Because the mayor called the ______ residents who had opposed its cost began calling it the Mayor's Wall.",
      kind: "closes", left: "wall", quote: "a gift to our grandchildren", right: "residents",
    },
    {
      scene: "sec-museum-lantern-wing",
      text: "The Varden Museum's new wing is a glass box that glows at night. When the director described the wing ______ the architects who had designed it were delighted.",
      kind: "closes", left: "as", quote: "a lantern for the whole city", right: "the",
    },
    {
      scene: "sec-triumph-of-patience",
      text: "The novelist Clara Ashdown spent eleven years writing her last book. An early review praised the novel ______ and within a month the first printing had sold out.",
      kind: "closes", left: "as", quote: "a triumph of patience", right: "and",
    },
    {
      scene: "sec-album-leftovers",
      text: "The band Hollow Pines recorded its fourth album in a single week in 2009. Although critics dismissed the album ______ record has since sold more than a million copies.",
      kind: "closes", left: "as", quote: "a collection of leftovers", right: "the",
    },
    {
      scene: "sec-slow-and-steady-motto",
      text: "The town of Ellisfort adopted an official motto when it was founded in 1860. The town's ______ is carved above the door of its oldest building.",
      kind: "appositive", left: "motto", quote: "Slow and steady", right: "is",
    },
    {
      scene: "sec-light-did-not-fail",
      text: "On the night of the great storm of 1872, the keeper of the Brannock lighthouse wrote only one sentence in his log. That ______ is now engraved on a plaque at the base of the tower.",
      kind: "appositive", left: "sentence", quote: "The light did not fail", right: "is",
    },
    {
      scene: "sec-six-bridges-slogan",
      text: "The Harlow Marathon, first run in 1981, crosses all six of the city's bridges. The race's official ______ appears on every finisher's medal and on banners along the course.",
      kind: "appositive", left: "slogan", quote: "Six bridges, one city", right: "appears",
    },
    {
      scene: "sec-bloodchild-awards",
      text: "Octavia E. Butler is best known for her novels, but she also wrote a small number of short stories. Her most celebrated short ______ won both the Hugo and the Nebula Awards for best novelette.",
      kind: "appositive", left: "story", quote: "Bloodchild", right: "won",
    },
  ];

  const quotationCommas = {
    id: "sec-quotation-commas",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "within-sentence punctuation",
    difficulty: "Medium",
    title: "Commas around a quotation",
    recognize:
      "A quotation worked into the sentence takes no commas; one that renames something already identified is set off by a pair; a comma after a quotation can also close an introductory clause or come before “and” joining two clauses.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(QUOTATION_TOPICS);
      const { left, quote, right, kind } = topic;
      const keyBefore = kind === "appositive" ? "comma" : "none";
      const keyAfter = kind === "integrated" ? "none" : "comma";
      const render = (before, after) => `${left}${before === "comma" ? "," : ""} “${quote}${after === "comma" ? "," : ""}” ${right}`;
      const choices = squareOf(["before", "after"], [["comma", "none"], ["comma", "none"]], render, (before, after) => {
        const problems = [];
        if (before !== keyBefore) {
          problems.push(kind === "appositive"
            ? `the quotation renames the ${left}, which is already identified (there is only one), so a comma must open it`
            : `the quotation is part of the sentence's structure (${left === "as" ? `it completes "as"` : `it follows "${left}" directly`}), so no comma comes before it`);
        }
        if (after !== keyAfter) {
          problems.push(kind === "integrated"
            ? `nothing after the quotation calls for a comma; it would separate "${right}" from the words it belongs with`
            : kind === "closes"
              ? right === "and"
                ? `the quotation ends the first of two independent clauses joined by "and," so a comma must follow it`
                : "the quotation ends the introductory clause, so a comma must follow it before the main clause"
              : `the quotation that opened with a comma must close with one before "${right}"`);
        }
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const why = {
        integrated: `The quotation is worked into the sentence (${left === "as" ? `it completes "as"` : left === "line" || left === "sign" ? `it picks out which ${left} is meant` : `it is what the critic called the ${left}`}), so no commas set it off.`,
        closes: right === "and"
          ? `The quotation is worked into the first clause, so no comma comes before it; the clause ends with it, and a comma comes before "and," which begins a second independent clause.`
          : `The quotation is worked into the introductory clause, so no comma comes before it; the clause ends with it, so a comma follows it before the main clause.`,
        appositive: `The quotation renames the ${left}, which is already identified, so a pair of commas sets it off.`,
      }[kind];
      const marks = `${keyBefore === "comma" ? "a comma" : "no comma"} before the quotation and ${keyAfter === "comma" ? "a comma" : "no comma"} after it`;
      const instance = multipleChoice(topic, choices, {
        explanation: `${why} So the sentence needs ${marks}.`,
        steps: [
          "Decide whether the quotation is part of the sentence's structure or an extra name for something already identified.",
          "Check what comes right after the quotation: the rest of the same clause, the end of an introductory clause, or “and” before a new clause.",
          "Put commas only where those structures call for them.",
        ],
        principles: [
          "A quotation that is grammatically part of the sentence is not set off by commas.",
          "A quotation that renames something already identified is set off by a pair of commas; in American style, a comma after a quotation goes inside the closing quotation mark.",
        ],
        trap: "Putting a comma before every quotation out of habit, or leaving out the comma that closes an introductory clause because a quotation ends it.",
        hint: "Is the quotation part of the sentence's structure, or an extra name for something already identified? What comes right after it?",
        estimatedSeconds: 65,
      });
      instance.verify = () => {
        const parts = around(topic.text);
        if (!parts) return false;
        const lead = sentenceLead(parts.before);
        const opensWithSub = SUBORDINATORS.includes(firstWord(lead));
        const derived = kind === "appositive" ? "appositive" : opensWithSub || right === "and" ? "closes" : "integrated";
        return derived === kind && instance.correct === render(keyBefore, keyAfter) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B15: which clause "however" belongs to */

  // Hard. Each topic: a first sentence, then two independent clauses with
  // the blank between them: w1 ends the first clause (whose subject and
  // verb are `c1`) and w2 begins the second (`c2`). "However" can grammati-
  // cally end the first clause or begin the second; only the passage's
  // meaning decides. "first": the first clause runs against the sentence
  // before it and the second clause explains it (", however;"). "second":
  // the first clause continues the sentence before it and the second clause
  // runs against it ("; however,"). The choices cross the mark before
  // "however" with the mark after it.
  const HOWEVER_TOPICS = [
    {
      scene: "sec-late-summer-monarchs",
      text: "Most monarch butterflies live only a few weeks as adults. The generation that emerges in late summer is ______ butterflies fly thousands of kilometers south to Mexico and can live for up to eight months.",
      kind: "first", w1: "different", w2: "those", c1: ["generation", "is"], c2: ["butterflies", "fly"],
      against: "the short lives of most monarchs, described in the first sentence", rest: "explains how the late-summer generation is different",
    },
    {
      scene: "sec-camel-hump-fat",
      text: "Many people believe that a camel stores water in its hump. The hump is mostly ______ camel's body breaks it down for energy when food is scarce, and the animal can then go days without eating.",
      kind: "first", w1: "fat", w2: "the", c1: ["hump", "is"], c2: ["body", "breaks"],
      against: "the popular belief that the hump stores water", rest: "explains what the camel does with that fat",
    },
    {
      scene: "sec-bats-see-well",
      text: "The phrase “blind as a bat” suggests that bats cannot see. Most bats see quite ______ species rely on their eyes as well as on echolocation to find their way as the light fades at dusk.",
      kind: "first", w1: "well", w2: "many", c1: ["Most bats", "see"], c2: ["species", "rely"],
      against: "the suggestion in the phrase “blind as a bat”", rest: "gives an example of bats using their eyesight",
    },
    {
      scene: "sec-great-wall-orbit",
      text: "A popular claim holds that the Great Wall of China can be seen with the naked eye from the Moon. Astronauts have found it hard to spot even from low orbit around ______ wall is long but only a few meters wide, and its color blends into the land around it.",
      kind: "first", w1: "Earth", w2: "the", c1: ["Astronauts", "have found"], c2: ["wall", "is"],
      against: "the popular claim in the first sentence", rest: "explains why the wall is hard to spot",
    },
    {
      scene: "sec-equator-penguins",
      text: "Penguins are usually pictured standing on Antarctic ice. Several species live far from the ______ Galápagos penguin, for instance, nests on islands that lie almost exactly on the equator.",
      kind: "first", w1: "ice", w2: "the", c1: ["species", "live"], c2: ["Galápagos penguin", "nests"],
      against: "the usual picture of penguins on Antarctic ice", rest: "gives an example of a penguin living far from the ice",
    },
    {
      scene: "sec-venus-hotter-than-mercury",
      text: "Mercury is the planet closest to the Sun, and its surface bakes during its long days. Venus is the hotter of the ______ thick atmosphere of carbon dioxide traps heat, keeping its surface above 460 degrees Celsius.",
      kind: "first", w1: "two", w2: "its", c1: ["Venus", "is"], c2: ["atmosphere", "traps"],
      against: "the expectation, set up in the first sentence, that the closest planet is the hottest", rest: "explains why Venus is hotter",
    },
    {
      scene: "sec-okapi-relative",
      text: "The okapi lives deep in the rainforests of the Democratic Republic of the Congo. The white stripes on its legs make it look like a relative of the ______ closest living relative is actually the giraffe.",
      kind: "second", w1: "zebra", w2: "its", c1: ["stripes", "make"], c2: ["relative", "is"],
      against: "the resemblance to a zebra that the first clause describes", rest: "simply continues the description of the okapi begun in that sentence",
    },
    {
      scene: "sec-pluto-reclassified",
      text: "Pluto was discovered in 1930 by the astronomer Clyde Tombaugh at the Lowell Observatory in Arizona. For decades it was counted as the solar system's ninth ______ 2006 astronomers reclassified it as a dwarf planet.",
      kind: "second", w1: "planet", w2: "in", c1: ["it", "was counted"], c2: ["astronomers", "reclassified"],
      against: "the decades in which Pluto was counted as a planet", rest: "simply continues the account of Pluto begun in that sentence",
    },
    {
      scene: "sec-hummingbird-weak-legs",
      text: "Hummingbirds are among the most agile fliers in the animal kingdom. They can hover in one spot and even fly ______ legs are so short and weak that the birds can barely walk.",
      kind: "second", w1: "backward", w2: "their", c1: ["They", "can hover"], c2: ["legs", "are"],
      against: "the hummingbirds' skill in the air that the first clause describes", rest: "adds an example of the agility that sentence describes",
    },
    {
      scene: "sec-harlow-branch-hours",
      text: "The Harlow Public Library opened a new branch in the town's east end in 2021. The branch drew large crowds on ______ was nearly empty on weekday mornings, so the library shortened its hours.",
      kind: "second", w1: "weekends", w2: "it", c1: ["branch", "drew"], c2: ["it", "was"],
      against: "the weekend crowds that the first clause describes", rest: "simply continues the story of the new branch begun in that sentence",
    },
    {
      scene: "sec-dunmore-concert-storm",
      text: "The Dunmore Community Orchestra has played a free concert in the town park every July since 1998. In most years the weather has been ______ 2019 a thunderstorm forced the musicians to finish the concert in the school gym.",
      kind: "second", w1: "kind", w2: "in", c1: ["weather", "has been"], c2: ["thunderstorm", "forced"],
      against: "the good weather of most years that the first clause describes", rest: "simply continues the account of the concerts begun in that sentence",
    },
    {
      scene: "sec-sea-turtle-females",
      text: "Sea turtles spend almost their entire lives in the ocean. Males may never touch land again after they ______ must crawl onto sandy beaches every few years to lay their eggs.",
      kind: "second", w1: "hatch", w2: "females", c1: ["Males", "may never touch"], c2: ["females", "must crawl"],
      against: "the males' life at sea that the first clause describes", rest: "gives an example that fits that sentence",
    },
  ];

  const HOWEVER_KEYS = { first: ["comma", "semicolon"], second: ["semicolon", "comma"] };

  const howeverAttachment = {
    id: "sec-however-attachment",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Hard",
    title: "Which clause “however” belongs to",
    recognize:
      "Both sides of the blank are independent clauses, so a semicolon goes on one side of “however” and a comma on the other. Find the contrast the passage makes: if the first clause runs against the sentence before it, “however” ends the first clause; if the second clause runs against the first, “however” begins the second.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "comma-splice"],
    build(t) {
      const topic = t.pick(HOWEVER_TOPICS);
      const { w1, w2, kind } = topic;
      const parts = around(topic.text);
      const first = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      const markOf = (value) => (value === "comma" ? "," : ";");
      const render = (before, after) => `${w1}${markOf(before)} however${markOf(after)} ${w2}`;
      const choices = squareOf(["before", "after"], [["comma", "semicolon"], ["comma", "semicolon"]], render, (before, after) => {
        const [keyBefore, keyAfter] = HOWEVER_KEYS[kind];
        if (before === keyBefore && after === keyAfter) return null;
        if (before === "comma" && after === "comma") {
          return `"${first}" and the words after the blank are both independent clauses; commas alone around "however" join them with only a comma, a comma splice.`;
        }
        if (before === "semicolon" && after === "semicolon") {
          return `With a semicolon on each side, "however" is stranded between the two clauses and belongs to neither.`;
        }
        return kind === "first"
          ? `This makes "however" begin the second clause, setting it against the first; but the second clause ${topic.rest}. The contrast is between the first clause and ${topic.against}, so "however" ends the first clause.`
          : `This makes "however" end the first clause, setting that clause against the sentence before it; but the first clause ${topic.rest}. The contrast is between the second clause and ${topic.against}, so "however" begins the second clause.`;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: kind === "first"
          ? `Both sides of the blank are independent clauses. The contrast runs between "${first}" and ${topic.against}; the second clause ${topic.rest}. So "however" ends the first clause, with a comma before it and a semicolon after it: "${choices.correct}".`
          : `Both sides of the blank are independent clauses. The first clause ${topic.rest}; the contrast runs between the second clause and ${topic.against}. So "however" begins the second clause, with a semicolon before it and a comma after it: "${choices.correct}".`,
        steps: [
          "Check that the words on each side of the blank are independent clauses, so a semicolon must separate them.",
          "Find the contrast: does the first clause run against the sentence before it, or does the second clause run against the first?",
          kind === "first"
            ? "The first clause makes the contrast, so “however” ends it: comma, “however,” semicolon."
            : "The second clause makes the contrast, so “however” begins it: semicolon, “however,” comma.",
        ],
        principles: [
          "A transition such as however cannot join two independent clauses; a semicolon or period must still separate them.",
          "However goes with the clause that makes the contrast: at the start of the second clause, or at the end of the first when that clause contrasts with what came before.",
        ],
        trap: kind === "first"
          ? "Choosing “; however,” by habit, which sets the second clause against the first, though the second clause only explains the first."
          : "Choosing “, however;” because the passage contains a contrast somewhere, without checking that the first clause does not contrast with the sentence before it.",
        hint: "Which two statements actually disagree: the first clause and the sentence before it, or the two clauses on either side of the blank?",
        estimatedSeconds: 85,
      });
      instance.verify = () => {
        if (!parts) return false;
        const lead = sentenceLead(parts.before);
        const tail = `${w2}${parts.after}`;
        // A sentence comes before the two clauses, so "however" has
        // something to relate the first clause to either way.
        return lead !== parts.before && lead.includes(topic.c1[0]) && lead.includes(topic.c1[1]) &&
          tail.includes(topic.c2[0]) && tail.includes(topic.c2[1]) && !SUBORDINATORS.includes(firstWord(lead)) &&
          instance.correct === render(...HOWEVER_KEYS[kind]) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B16: colon before an explaining clause */

  // Medium. Each topic: the blank holds the last word of a long subject
  // (w0, whose number differs from the subject's head, `subject`), the
  // verb, its complement, a mark, and w2. "explain": the words before the
  // mark are an independent clause and the clause after it explains them,
  // so a colon joins them (a comma would be a splice). "intro": the words
  // before the mark are a dependent clause opening with a subordinating
  // word, so a comma joins them to the main clause (a colon must follow an
  // independent clause). The choices cross the mark with the verb's number.
  const COLON_EXPLAIN_TOPICS = [
    {
      scene: "sec-keld-puffin-pattern",
      text: "Ecologists have counted the puffins nesting on three islands off the coast of Keld every June since 1995. The pattern in the counts from all three ______ birds are nesting later each year and raising fewer chicks.",
      kind: "explain", subject: "pattern", w0: "islands", verbs: { singular: "was", plural: "were" }, complement: "clear", w2: "the",
    },
    {
      scene: "sec-harlow-rider-message",
      text: "Before redesigning its bus routes, the town of Harlow asked two thousand riders what they wanted most. The message in the riders' ______ wanted buses that came more often, even if the routes had to be longer.",
      kind: "explain", subject: "message", w0: "answers", verbs: { singular: "was", plural: "were" }, complement: "simple", w2: "they",
    },
    {
      scene: "sec-lowell-bridge-readings",
      text: "Engineers attached sensors to the Lowell Street Bridge to learn how its steel deck responds to heat. The readings from the sensor at the center of the ______ deck grows several centimeters longer on hot afternoons.",
      kind: "explain", subject: "readings", w0: "span", verbs: { singular: "was", plural: "were" }, complement: "striking", w2: "the",
    },
    {
      scene: "sec-varden-dim-archive",
      text: "The Varden Museum keeps its oldest letters in a windowless room where visitors must use small flashlights. The reason for the dim lamps and the closed ______ slowly fades the ink and yellows the paper.",
      kind: "explain", subject: "reason", w0: "doors", verbs: { singular: "is", plural: "are" }, complement: "simple", w2: "light",
    },
    {
      scene: "sec-dunmore-flour-test",
      text: "Each spring, the bakers at the Dunmore bakery try new rye flours in their bread. The results of the single test that they ran this ______ from the valley's own small mill made the lightest loaves.",
      kind: "explain", subject: "results", w0: "spring", verbs: { singular: "was", plural: "were" }, complement: "surprising", w2: "flour",
    },
    {
      scene: "sec-sleeping-glass-frogs",
      text: "Glass frogs have see-through skin on their bellies, yet they are remarkably hard to spot while they sleep. The secret of the sleeping ______ move most of their red blood cells into the liver, which leaves their bodies nearly transparent.",
      kind: "explain", subject: "secret", w0: "frogs", verbs: { singular: "is", plural: "are" }, complement: "simple", w2: "they",
    },
    {
      scene: "sec-keld-puffin-closure",
      text: "Ecologists have counted the puffins nesting on three islands off the coast of Keld every June since 1995. Because the decline in the counts from all three ______ island has been closed to boats during the nesting season since 2020.",
      kind: "intro", sub: "Because", subject: "decline", w0: "islands", verbs: { singular: "was", plural: "were" }, complement: "steady", w2: "each",
    },
    {
      scene: "sec-harlow-eastern-routes",
      text: "The town of Harlow redesigned its bus network in 2022 after a long public debate. Although the number of complaints about the old eastern ______ town replaced those routes with two shorter ones that run more often.",
      kind: "intro", sub: "Although", subject: "number", w0: "routes", verbs: { singular: "was", plural: "were" }, complement: "small", w2: "the",
    },
    {
      scene: "sec-tolan-orchard-frost",
      text: "Frost struck the apple orchards of the Tolan Valley on the last night of April. Because the blossoms on every tree in the lowest ______ most of that year's crop was lost there.",
      kind: "intro", sub: "Because", subject: "blossoms", w0: "orchard", verbs: { singular: "was", plural: "were" }, complement: "already open", w2: "most",
    },
    {
      scene: "sec-kessel-beam-crack",
      text: "Inspectors examine the steel bridge across the Kessel Gorge every spring. When the crack in one of the bridge's main ______ bridge was closed for three months while welders repaired it.",
      kind: "intro", sub: "When", subject: "crack", w0: "beams", verbs: { singular: "was", plural: "were" }, complement: "found", w2: "the",
    },
    {
      scene: "sec-varden-lens-polish",
      text: "The Varden Observatory's old brass telescope was sent to a workshop in 2015 for cleaning. Once the lenses in its long brass ______ telescope went back on display for the observatory's public nights.",
      kind: "intro", sub: "Once", subject: "lenses", w0: "tube", verbs: { singular: "was", plural: "were" }, complement: "polished", w2: "the",
    },
  ];

  const colonExplanation = {
    id: "sec-colon-explanation",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Medium",
    title: "Colon before a clause that explains, or comma after an opening clause",
    recognize:
      "A colon can join a clause that explains or illustrates to an independent clause before it; it cannot follow a dependent clause, which joins the main clause with a comma. The verb before the mark agrees with its subject's head noun, not the noun just before it.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["comma-splice", "agreement-attractor"],
    build(t) {
      const topic = t.pick(COLON_EXPLAIN_TOPICS);
      const explain = topic.kind === "explain";
      const number = nounNumberOf(topic.subject);
      const keyMark = explain ? "colon" : "comma";
      const render = (mark, n) => `${topic.w0} ${topic.verbs[n]} ${topic.complement}${mark === "colon" ? ":" : ","} ${topic.w2}`;
      const parts = around(topic.text);
      const lead = parts ? sentenceLead(parts.before) : "";
      const clause = `${lead}${topic.w0} ${topic.verbs[number]} ${topic.complement}`.trim();
      const choices = squareOf(["mark", "number"], [["colon", "comma"], ["singular", "plural"]], render, (mark, n) => {
        const problems = [];
        if (mark !== keyMark) {
          problems.push(explain
            ? `"${clause}" is an independent clause, and so are the words after the blank; a comma alone between them is a comma splice`
            : `a colon must follow an independent clause, but "${clause}" is a dependent clause that begins with "${topic.sub}"`);
        }
        if (n !== number) problems.push(`"${topic.verbs[n]}" is ${n}, but it must agree with "${topic.subject}", which is ${number}; "${topic.w0}" belongs to a phrase describing it`);
        return problems.length ? cap(`${problems.join("; also, ")}.`) : null;
      });
      const instance = multipleChoice(topic, choices, {
        explanation: `${explain
          ? `"${clause}" is an independent clause, and the clause after the blank explains it, so a colon joins them.`
          : `"${clause}" begins with "${topic.sub}," so it is a dependent clause; it joins the main clause after it with a comma.`} The verb agrees with "${topic.subject}", which is ${number}: "${choices.correct}".`,
        steps: [
          "Find the subject's head noun and its verb; the noun just before the verb belongs to a describing phrase.",
          explain
            ? "The words before the mark are an independent clause, and the words after it explain them: use a colon."
            : `The words before the mark begin with "${topic.sub}," so they are a dependent clause: use a comma.`,
          `Choose the ${number} verb with that mark.`,
        ],
        principles: [
          "A colon can join two independent clauses when the second explains or illustrates the first; a colon never follows a dependent clause.",
          "A dependent clause that opens a sentence joins the main clause with a comma; a comma alone cannot join two independent clauses.",
          "A verb agrees with the head of its subject, not with a noun inside a phrase that describes it.",
        ],
        trap: explain
          ? "Choosing the comma because the pause feels like a comma, which splices two independent clauses."
          : "Choosing the colon because the words after the blank seem to explain, though the clause before the blank is dependent.",
        hint: "Could the words before the blank stand alone as a sentence? And what noun is the verb about?",
        estimatedSeconds: 65,
      });
      instance.verify = () => {
        if (!parts) return false;
        const opensWithSub = SUBORDINATORS.includes(firstWord(lead));
        const headAt = lead.indexOf(` ${topic.subject} `);
        return opensWithSub === !explain && (explain || firstWord(lead) === lower(topic.sub)) &&
          headAt >= 0 && nounNumberOf(topic.w0) !== number && /^\s\S/.test(parts.after) &&
          instance.correct === render(keyMark, number) && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ B17: a sentence boundary, with capitals */

  // Easy. Each topic: the blank joins what comes before w1 to what comes
  // after it, and w2 (written in lower case) begins the second part. The
  // strong joiner offered (`joiner`) is a period, a semicolon, or a comma
  // and "and"; the choices cross it with a plain comma, and a capital with a
  // lower-case w2. "two": both parts are independent clauses (`c1`, `c2`),
  // so the strong joiner is right, with a capital only after a period.
  // "intro": the first part is a dependent clause opening with `sub`, so a
  // plain comma and a lower-case word are right.
  const CAPITALS_TOPICS = [
    {
      scene: "sec-old-faithful-height",
      text: "Old Faithful, in Yellowstone National Park, is one of the most predictable geysers on Earth. It erupts roughly every ninety ______ water can shoot as high as fifty meters into the air.",
      kind: "two", joiner: "period", w1: "minutes", w2: "its", c1: ["It", "erupts"], c2: ["water", "can shoot"],
    },
    {
      scene: "sec-ginkgo-leaf-drop",
      text: "Ginkgo trees line the streets of many cities because they tolerate polluted air. In autumn, a ginkgo's fan-shaped leaves turn bright ______ trees drop nearly all of them within a single day.",
      kind: "two", joiner: "semicolon", w1: "yellow", w2: "many", c1: ["leaves", "turn"], c2: ["trees", "drop"],
    },
    {
      scene: "sec-tardigrade-extremes",
      text: "Tardigrades are animals less than a millimeter long that live in moss, soil, and ponds. They can survive temperatures close to absolute ______ some have even survived exposure to the vacuum of space.",
      kind: "two", joiner: "comma-and", w1: "zero", w2: "some", c1: ["They", "can survive"], c2: ["some", "have even survived"],
    },
    {
      scene: "sec-venus-backward-spin",
      text: "Venus is close to Earth in size, but its days are very different from ours. The planet spins in the opposite direction from most ______ sun rises in the west there and sets in the east.",
      kind: "two", joiner: "period", w1: "planets", w2: "the", c1: ["planet", "spins"], c2: ["sun", "rises"],
    },
    {
      scene: "sec-octopus-three-hearts",
      text: "An octopus's body works very differently from a human's, even at its core. The animal has three ______ pump blood through the gills, and the third pumps it to the rest of the body.",
      kind: "two", joiner: "semicolon", w1: "hearts", w2: "two", c1: ["animal", "has"], c2: ["two", "pump"],
    },
    {
      scene: "sec-kessel-trail-volunteers",
      text: "No road reaches the high trails of the Kessel Hills, and no vehicle can use them. Volunteers repair the trails every ______ carry all of their tools and food in on foot.",
      kind: "two", joiner: "period", w1: "summer", w2: "they", c1: ["Volunteers", "repair"], c2: ["they", "carry"],
    },
    {
      scene: "sec-dunmore-bell-ropes",
      text: "The iron bell in the Dunmore town hall is older than any building on Main Street. It has rung every hour since ______ rope that pulls it has been replaced eleven times.",
      kind: "two", joiner: "period", w1: "1874", w2: "the", c1: ["It", "has rung"], c2: ["rope", "has been replaced"],
    },
    {
      scene: "sec-periodical-cicada-soil",
      text: "Periodical cicadas spend thirteen or seventeen years underground, feeding on sap from tree roots. Once the soil about twenty centimeters down warms to roughly 18 degrees ______ cicadas crawl to the surface by the millions.",
      kind: "intro", joiner: "period", sub: "Once", w1: "Celsius", w2: "the",
    },
    {
      scene: "sec-arctic-fox-coat",
      text: "The arctic fox lives on the tundra and sea ice of the far north. Because its winter coat is thick and pure ______ fox is nearly invisible against the snow while it hunts.",
      kind: "intro", joiner: "period", sub: "Because", w1: "white", w2: "the",
    },
    {
      scene: "sec-harlow-flat-marathon",
      text: "The Harlow Marathon, first run in 1981, draws runners from across the country each spring. Although the race crosses all six of the city's ______ course is almost completely flat.",
      kind: "intro", joiner: "comma-and", sub: "Although", w1: "bridges", w2: "its",
    },
    {
      scene: "sec-kakapo-climbs",
      text: "The kakapo, a parrot found only in New Zealand, is the heaviest parrot in the world. Because it cannot ______ climbs trees with its strong legs and uses its short wings to glide back down.",
      kind: "intro", joiner: "period", sub: "Because", w1: "fly", w2: "it",
    },
    {
      scene: "sec-paved-street-runoff",
      text: "City planners worry about what happens to rain after it lands. When heavy rain falls on a paved ______ water rushes into storm drains instead of soaking into the ground.",
      kind: "intro", joiner: "semicolon", sub: "When", w1: "street", w2: "the",
    },
    {
      scene: "sec-sourdough-starter-rise",
      text: "Sourdough bread rises without any yeast from a store. After a baker mixes the starter into the ______ wild yeast in the starter begins to make the gas that lifts the loaf.",
      kind: "intro", joiner: "comma-and", sub: "After", w1: "dough", w2: "the",
    },
    {
      scene: "sec-monarch-weight-flight",
      text: "Monarch butterflies from eastern North America spend the winter in the mountains of central Mexico. Although monarchs weigh less than a gram ______ can fly more than four thousand kilometers to reach those forests.",
      kind: "intro", joiner: "period", sub: "Although", w1: "each", w2: "they",
    },
  ];

  const JOINERS = { period: ".", semicolon: ";", "comma-and": ", and" };
  const JOINER_NAMES = { period: "a period", semicolon: "a semicolon", "comma-and": "a comma and “and”" };

  const boundaryCapitals = {
    id: "sec-sentence-boundary-capitals",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: SKILL,
    subskill: "sentence boundaries",
    difficulty: "Easy",
    title: "Period, semicolon, or comma and “and,” with capitals",
    recognize:
      "Two independent clauses need a period, a semicolon, or a comma and “and”; a dependent clause that opens a sentence needs only a comma. A capital letter begins a new sentence only after a period.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["comma-splice"],
    build(t) {
      const topic = t.pick(CAPITALS_TOPICS);
      const { w1, w2, kind, joiner } = topic;
      const two = kind === "two";
      const strong = JOINERS[joiner];
      const render = (boundary, capital) => {
        const next = capital === "yes" ? cap(w2) : w2;
        return `${w1}${boundary === "comma" ? "," : strong} ${next}`;
      };
      // The right capital: only a period starts a new sentence.
      const keyBoundary = two ? joiner : "comma";
      const keyCapital = two && joiner === "period" ? "yes" : "no";
      const parts = around(topic.text);
      const lead = parts ? `${sentenceLead(parts.before)}${w1}`.trim() : "";
      const choices = squareOf(["boundary", "capital"], [[joiner, "comma"], ["yes", "no"]], render, (boundary, capital) => {
        if (boundary === keyBoundary && capital === keyCapital) return null;
        const problems = [];
        if (boundary !== keyBoundary) {
          problems.push(two
            ? `"${lead}" and the words after the blank are both independent clauses, and a comma alone between them is a comma splice`
            : joiner === "comma-and"
              ? `"and" would join the dependent clause beginning "${topic.sub}" to the main clause as if both were independent, leaving the "${topic.sub}" clause with nothing to attach to`
              : `${JOINER_NAMES[joiner]} would cut off "${lead}," a dependent clause beginning with "${topic.sub}," as a sentence of its own, a fragment`);
        }
        const after = boundary === "period" ? "a period" : boundary === "semicolon" ? "a semicolon" : "a comma";
        if (capital !== (boundary === "period" ? "yes" : "no")) {
          problems.push(capital === "yes"
            ? `after ${after}, the sentence continues, so "${w2}" is not capitalized`
            : `a period ends the sentence, so the next word, "${cap(w2)}," must begin with a capital letter`);
        }
        return cap(`${problems.join("; also, ")}.`);
      });
      const instance = multipleChoice(topic, choices, {
        explanation: two
          ? `"${lead}" and the words after the blank are both independent clauses, so they need ${JOINER_NAMES[joiner]}${joiner === "period" ? ", and the new sentence begins with a capital letter" : ", and the second clause continues the same sentence in lower case"}: "${choices.correct}".`
          : `"${lead}" begins with "${topic.sub}," so it is a dependent clause that cannot stand alone. It joins the main clause with a comma, and the sentence continues in lower case: "${choices.correct}".`,
        steps: [
          "Check whether the words before the blank could stand alone as a sentence.",
          two
            ? "They can, and so can the words after it: join the two clauses with a period, a semicolon, or a comma and “and.”"
            : `They cannot: "${topic.sub}" makes them a dependent clause, which joins the main clause with a comma alone.`,
          "Capitalize the next word only after a period.",
        ],
        principles: [
          "Two independent clauses are separated by a period or a semicolon, or joined by a comma and a coordinating conjunction such as “and”; a comma alone is a comma splice.",
          "A dependent clause that opens a sentence is joined to the main clause with a comma.",
          "Only a period (or question mark) ends a sentence, so only then does the next word take a capital letter.",
        ],
        trap: two
          ? "Choosing the comma because the two clauses are closely related, which splices them."
          : "Choosing a period or semicolon because the words after the blank could stand alone, though the words before it cannot.",
        hint: "Could the words before the blank stand alone as a sentence? Which mark lets the next word begin with a capital?",
        estimatedSeconds: 50,
      });
      instance.verify = () => {
        if (!parts) return false;
        const sentence = sentenceLead(parts.before);
        const opensWithSub = SUBORDINATORS.includes(firstWord(sentence));
        const structure = two
          ? !opensWithSub && sentence.includes(topic.c1[0]) && sentence.includes(topic.c1[1]) &&
            `${w2}${parts.after}`.includes(topic.c2[0]) && `${w2}${parts.after}`.includes(topic.c2[1])
          : opensWithSub && firstWord(sentence) === lower(topic.sub);
        return structure && /^[a-z]/.test(w2) && Boolean(strong) &&
          instance.correct === render(keyBoundary, keyCapital) && isSquare(instance.features);
      };
      return instance;
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
    titleOrAppositive,
    quotationCommas,
    closingMarkMatch,
    essentialClauseContext,
    adverbInterruptsClause,
    supplementOpening,
    howeverAttachment,
    colonExplanation,
    boundaryCapitals,
  ];
});
