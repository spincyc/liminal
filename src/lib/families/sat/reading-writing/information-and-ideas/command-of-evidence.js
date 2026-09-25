(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/reading-writing/information-and-ideas"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Command of Evidence templates (Information and Ideas): the quotation,
  // finding, or table data that supports or weakens a claim. The helpers
  // every skill file of the domain uses come from common.js.

  const { RW, passage, inOrder, allDistinct, mc } = C;

  const lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);
  const cap1 = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  /* ---------------------------------------------- quantitative helpers */

  // 1234.5 -> "1,234.5" with a fixed number of decimals.
  function fmt(value, decimals = 0) {
    const [whole, part] = value.toFixed(decimals).split(".");
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return part ? `${grouped}.${part}` : grouped;
  }

  // A value in [low, high] on a grid of `step`, drawn with the family's rng.
  function gridValue(t, low, high, step) {
    const count = Math.floor((high - low) / step + 1e-9);
    return Math.round((low + t.int(0, count) * step) * 1e6) / 1e6;
  }

  // `count` distinct grid values in [low, high], sorted ascending.
  function distinctSorted(t, count, low, high, step) {
    const seen = new Set();
    let guard = 0;
    while (seen.size < count && guard < 1000) {
      seen.add(gridValue(t, low, high, step));
      guard += 1;
    }
    return [...seen].sort((a, b) => a - b);
  }

  const decimalsOf = (step) => (String(step).split(".")[1] || "").length;

  // Reads a pipe table back out of a stimulus: header cells and body rows,
  // each body cell parsed as a number where it is one. Verification works
  // from this rendered text, not from the values build() used.
  function readTable(content) {
    const lines = content.split("\n").filter((line) => line.includes(" | "));
    const [header, ...body] = lines.map((line) => line.split(" | ").map((cell) => cell.trim()));
    const rows = body.map((cells) =>
      cells.map((cell, index) => (index === 0 ? cell : Number(cell.replace(/[,$%]/g, "")))),
    );
    return { header, rows };
  }

  /* ------------------------------------------------------------------ */
  /* Command of Evidence: the quotation that illustrates a one-part claim */
  /* ------------------------------------------------------------------ */

  // The text makes one claim about a character or scene (`trait` is the
  // phrase naming it). The key quotation shows it; `cue` is the part of the
  // key that does, and no distractor may contain it. The distractors show a
  // different trait, the same trait in another character, or reuse the
  // claim's word in another sense.
  const QUOTATION_TRAIT_TOPICS = [
    {
      scene: "ii-q-impatient-cook",
      work: "story",
      text:
        "In a short story, a young cook named Felix spends his first week in a busy restaurant kitchen under an experienced chef, Mrs. Laine. In the story, Felix is portrayed as impatient, eager to skip ahead to the parts of the job he finds exciting.",
      trait: "portrayed as impatient",
      cue: "wondering why anyone needed to wait for onions",
      key: "“Felix tapped his knife on the board as the onions softened, wondering why anyone needed to wait for onions.”",
      otherTrait: "“Felix checked each order ticket twice before he dared to call it out to the cooks on the line.”",
      otherCharacter: "“Mrs. Laine never raised her voice, even when three plates came back to the kitchen at once.”",
      assoc: "“The dinner rush arrived all at once, and for three hours the whole kitchen seemed to move faster than any clock.”",
    },
    {
      scene: "ii-q-generous-shopkeeper",
      work: "story",
      text:
        "In a short story, the narrator describes summers spent at her grandfather's hardware store in a small farming town. The narrator portrays her grandfather as generous toward his customers, often at his own expense.",
      trait: "generous toward his customers",
      cue: "rang up half the price",
      key: "“When the Pruitt boy came in short of money for wire, Grandpa rang up half the price and said the rest could wait.”",
      otherTrait: "“Grandpa unlocked the store at six every morning, a full hour before any customer came, and swept the aisles himself.”",
      otherCharacter: "“Mrs. Ortega from the bakery brought rolls over every Saturday and would never take a penny for them.”",
      assoc: "“The store carried a generous supply of everything a farm could need, from seed to nails to lantern oil.”",
    },
    {
      scene: "ii-q-isolated-lighthouse",
      work: "poem",
      text:
        "In a poem, the speaker describes a lighthouse on a remote island. Throughout the poem, the speaker emphasizes the lighthouse's isolation, portraying it as cut off from the world around it.",
      trait: "emphasizes the lighthouse's isolation",
      cue: "the nearest light is forty miles of sea",
      key: "“No boat has tied up at its stair in years; / the nearest light is forty miles of sea.”",
      otherTrait: "“Built by hands that trusted stone to hold, / it wears the storms of each December well.”",
      otherCharacter: "“The village gathers on the harbor wall / each evening when the fishing boats come home.”",
      assoc: "“Its beam goes out alone across the dark / and every sailor knows it by its turn.”",
    },
    {
      scene: "ii-q-curious-niece",
      work: "story",
      text:
        "In a short story, seven-year-old Ines spends an afternoon in her aunt's pottery studio. In the story, Ines is portrayed as curious about how things work, eager to understand the processes she sees around her.",
      trait: "curious about how things work",
      cue: "asked her aunt why the clay turned hard",
      key: "“Ines crouched by the kiln and asked her aunt why the clay turned hard in the heat instead of melting.”",
      otherTrait: "“Ines sat very still on the stool by the window, holding the cup her aunt had given her as if it might break.”",
      otherCharacter: "“Her aunt worked the wheel with half-closed eyes, as though she could feel the bowl's shape before she saw it.”",
      assoc: "“The studio was crowded with strange tools whose uses no visitor could have guessed.”",
    },
    {
      scene: "ii-q-proud-farmer",
      work: "story",
      text:
        "In a short story, an elderly farmer named Wendell refuses an offer to sell his land to a developer. In the story, Wendell is portrayed as proud of the work he has done on the farm over the course of his life.",
      trait: "proud of the work he has done",
      cue: "naming each field he had cleared by hand",
      key: "“Wendell walked the fence line with the visitor, proudly naming each field he had cleared by hand and the year he'd done it.”",
      otherTrait: "“Wendell kept the developer's letter unopened on the kitchen table for a week, then used it to start the stove.”",
      otherCharacter: "“His daughter had moved to the city years ago and wrote to him every month about her work at the hospital.”",
      assoc: "“The farm's old barn stood taller than any building for miles, its roof proud against the evening sky.”",
    },
    {
      scene: "ii-q-anxious-flyer",
      work: "story",
      text:
        "In a short story, a young man named Kofi prepares for his first airplane flight, a trip overseas to visit his cousins. In the story, Kofi is portrayed as anxious about the journey, unable to stop worrying about what might go wrong.",
      trait: "portrayed as anxious about the journey",
      cue: "then his passport again",
      key: "“Kofi checked his passport, then his ticket, then his passport again, and still his hands would not stop shaking.”",
      otherTrait: "“Kofi had wrapped the gifts for his cousins in newspaper and carefully tied each one with a different color of string.”",
      otherCharacter: "“His mother, who had flown many times, slept soundly through the whole drive to the airport.”",
      assoc: "“The departure board clicked and flickered, updating its restless list of flights every few seconds.”",
    },
    {
      scene: "ii-q-autumn-delight",
      work: "poem",
      text:
        "In a poem, the speaker walks through a city park in late autumn. The speaker expresses delight in the changes that the season has brought to the park, taking pleasure in each new sight.",
      trait: "expresses delight in the changes",
      cue: "I laugh to see the maples burning gold",
      key: "“I laugh to see the maples burning gold / and kick the bright leaves up to watch them fall.”",
      otherTrait: "“The summer crowds have gone; the benches wait, / and every fountain in the park is dry.”",
      otherCharacter: "“An old man sweeps the path and does not look / at trees he's watched turn color fifty years.”",
      assoc: "“The season turns its pages one by one, / as every season has, and always will.”",
    },
    {
      scene: "ii-q-resourceful-sailor",
      work: "story",
      text:
        "In a short story, a sailor named Oona is stranded for three days on a small island after a storm damages her boat. In the story, Oona is portrayed as resourceful, able to make good use of whatever she finds.",
      trait: "portrayed as resourceful",
      cue: "bent a spoon into a hook",
      key: "“Oona tore a strip from her sail to patch the hull and bent a spoon into a hook for fishing.”",
      otherTrait: "“Oona sat on the sand that first night and let herself cry, just once, before she finally slept.”",
      otherCharacter: "“Her father, a fisherman all his life, had always told her that the sea gives back whatever it takes.”",
      assoc: "“The island's only other visitors were the gulls, which watched her from the rocks as if waiting for something.”",
    },
    {
      scene: "ii-q-modest-astronomer",
      work: "story",
      text:
        "In a short story, a celebrated astronomer, Dr. Ferreira, returns to give a lecture at the small school where she once taught. In the story, Dr. Ferreira is portrayed as modest about her many achievements.",
      trait: "portrayed as modest",
      cue: "most of the credit belonged to her students",
      key: "“Dr. Ferreira waved a hand at the list of her awards and said most of the credit belonged to her students.”",
      otherTrait: "“Dr. Ferreira spoke about the rings of Saturn with such excitement that she forgot all about the notes in her hand.”",
      otherCharacter: "“The principal had read every one of her articles and kept them in a folder in his desk drawer.”",
      assoc: "“The school's telescope was a modest instrument, older than any of the students in the room.”",
    },
    {
      scene: "ii-q-determined-runner",
      work: "story",
      text:
        "In a short story, a high school runner named Callum trains for a regional race after recovering from an injury. In the story, Callum is portrayed as determined to regain the speed he had before he was hurt.",
      trait: "portrayed as determined",
      cue: "he ran it once more than the day before",
      key: "“Every morning before school, Callum ran the hill behind the water tower, and every morning he ran it once more than the day before.”",
      otherTrait: "“Callum joked with his teammates on the bus to meets, but he never said a word to them about the injury.”",
      otherCharacter: "“Coach Ramos kept a notebook of every runner's times and studied it late into the night.”",
      assoc: "“The course wound through the hills along a route determined by the old logging roads.”",
    },
  ];

  const quotationTrait = {
    ...RW,
    id: "evidence-quotation-single-claim",
    skill: "Command of Evidence",
    subskill: "textual evidence",
    difficulty: "Easy",
    title: "Quotation that illustrates a one-part claim about a literary work",
    recognize:
      "The claim names one quality of one character or scene; the right quotation shows that quality in that character, not a different quality or another character.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["word-association", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(QUOTATION_TRAIT_TOPICS);
      const wrong = [
        [topic.otherTrait, "This concerns the right subject but shows a different quality from the one the claim names."],
        [topic.otherCharacter, "This shows something about a different character or subject, not the one the claim is about."],
        [topic.assoc, "This echoes the claim's vocabulary or mood but does not show the quality the claim names."],
      ];
      return mc("Easy", topic, {
        stimulus: passage(topic.text),
        stem: `Which quotation from the ${topic.work} most effectively illustrates the claim?`,
        correct: topic.key,
        wrong,
        explanation:
          `The claim singles out one quality ("${topic.trait}"). Only the key shows that quality in the subject the claim names ("${topic.cue}"); the others show a different quality, a different subject, or only echo the claim's words.`,
        steps: [
          "Pin down exactly what the claim says and about whom.",
          "For each quotation, ask whether it shows that quality in that subject.",
          "Reject quotations that only share a word or a mood with the claim.",
        ],
        principles: [
          "Evidence must show the specific quality claimed, in the specific subject claimed.",
          "A quotation that repeats a word from the claim may use it in another sense.",
        ],
        trap: "Picking a quotation because it repeats a word from the claim.",
        hint: "Which quotation would convince a reader of this exact claim about this exact subject?",
        verify: () =>
          topic.text.includes(topic.trait) &&
          topic.key.includes(topic.cue) &&
          wrong.every(([text]) => !text.includes(topic.cue)) &&
          allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence (quantitative): complete a statement with the   */
  /* row that is highest or lowest in the column the statement names     */
  /* ------------------------------------------------------------------ */

  // Two numeric columns. The statement asks for the extreme of column B;
  // one distractor names the extreme of column A (the wrong column), one
  // the runner-up in column B, and one the opposite extreme of column B.
  // Values are drawn fresh each time, so verify() re-reads the table.
  const EXTREME_VALUE_TOPICS = [
    {
      scene: "ii-tq-river-trout",
      intro: "An ecologist surveyed four sites along the Tamsin River in July, recording each site's average water temperature and the number of trout she counted there.",
      headers: ["Site", "Average water temperature (°C)", "Trout counted"],
      rows: ["Alder Ford", "Beacon Pool", "Cutler Bend", "Dunmore Falls"],
      a: { low: 14, high: 21.9, step: 0.1, say: (row, v) => `${row}, where the water averaged ${v}°C` },
      b: { low: 12, high: 60, step: 1, say: (row, v) => `${row}, where ${v} trout were counted` },
      extreme: "highest",
      statement: "Of the four sites, the one where the ecologist counted the most trout was ______.",
    },
    {
      scene: "ii-tq-garden-donations",
      intro: "A city report lists four community gardens, the number of plots rented at each last year, and the pounds of produce each garden donated to food banks.",
      headers: ["Garden", "Plots rented", "Produce donated (pounds)"],
      rows: ["Elm Street", "Harbor View", "Juniper Park", "Mill Pond"],
      a: { low: 20, high: 80, step: 1, say: (row, v) => `${row}, which rented out ${v} plots` },
      b: { low: 300, high: 1500, step: 10, say: (row, v) => `${row}, which donated ${v} pounds` },
      extreme: "highest",
      statement: "According to the table, the garden that donated the most produce was ______.",
    },
    {
      scene: "ii-tq-solar-panel-prices",
      intro: "An engineering class tested four solar panel models, recording each panel's efficiency and the price the manufacturer charges for it.",
      headers: ["Model", "Efficiency (%)", "Price ($)"],
      rows: ["Model P", "Model Q", "Model R", "Model S"],
      a: { low: 15, high: 23.9, step: 0.1, say: (row, v) => `${row}, with an efficiency of ${v}%` },
      b: { low: 180, high: 420, step: 5, say: (row, v) => `${row}, with a price of $${v}` },
      extreme: "lowest",
      statement: "According to the table, the least expensive of the four panels was ______.",
    },
    {
      scene: "ii-tq-turbine-sites",
      intro: "A utility estimated how much electricity a wind turbine would generate in a year at each of four proposed sites and recorded each site's distance from the nearest town.",
      headers: ["Site", "Distance to nearest town (km)", "Estimated output (MWh)"],
      rows: ["Crow Ridge", "Fenwick Flats", "Gale Point", "Holloway Hill"],
      a: { low: 3, high: 40, step: 1, say: (row, v) => `${row}, which lies ${v} km from the nearest town` },
      b: { low: 2000, high: 6800, step: 50, say: (row, v) => `${row}, with an estimated output of ${v} MWh` },
      extreme: "highest",
      statement: "According to the table, the site where a turbine would generate the most electricity is ______.",
    },
    {
      scene: "ii-tq-hiking-trails",
      intro: "A park service recorded the length of four hiking trails and the average number of hikers who used each trail per month over the past year.",
      headers: ["Trail", "Length (km)", "Average monthly hikers"],
      rows: ["Birch Loop", "Canyon Rim", "Falls Path", "Summit Trail"],
      a: { low: 2, high: 14.9, step: 0.1, say: (row, v) => `${row}, which is ${v} km long` },
      b: { low: 150, high: 900, step: 5, say: (row, v) => `${row}, with an average of ${v} hikers a month` },
      extreme: "lowest",
      statement: "According to the table, the trail used by the fewest hikers each month, on average, was ______.",
    },
    {
      scene: "ii-tq-beehive-honey",
      intro: "A beekeeper recorded how many frames of brood each of her four hives contained in midsummer and how much honey each hive produced over the season.",
      headers: ["Hive", "Frames of brood", "Honey produced (kg)"],
      rows: ["Hive 1", "Hive 2", "Hive 3", "Hive 4"],
      a: { low: 4, high: 12, step: 1, say: (row, v) => `${row}, which had ${v} frames of brood` },
      b: { low: 18, high: 45.9, step: 0.1, say: (row, v) => `${row}, which produced ${v} kg of honey` },
      extreme: "highest",
      statement: "According to the table, the hive that produced the most honey was ______.",
    },
    {
      scene: "ii-tq-podcast-downloads",
      intro: "A student radio station tracked four of its podcast series, recording each series' average episode length and its total number of downloads.",
      headers: ["Series", "Average episode length (minutes)", "Total downloads"],
      rows: ["Campus Beat", "Deep Field", "Night Shift", "Open Mic"],
      a: { low: 12, high: 58, step: 1, say: (row, v) => `${row}, whose episodes average ${v} minutes` },
      b: { low: 1200, high: 9800, step: 10, say: (row, v) => `${row}, with ${v} total downloads` },
      extreme: "highest",
      statement: "According to the table, the station's most downloaded series was ______.",
    },
    {
      scene: "ii-tq-wheat-yields",
      intro: "An agronomist grew four wheat varieties in test plots, measuring each variety's average plant height and its grain yield.",
      headers: ["Variety", "Average height (cm)", "Yield (tons per hectare)"],
      rows: ["Amber", "Bolt", "Cobalt", "Dune"],
      a: { low: 70, high: 120, step: 1, say: (row, v) => `${row}, which grew to an average of ${v} cm` },
      b: { low: 3, high: 7.9, step: 0.1, say: (row, v) => `${row}, which yielded ${v} tons per hectare` },
      extreme: "highest",
      statement: "According to the table, the variety with the greatest grain yield was ______.",
    },
    {
      scene: "ii-tq-market-shoppers",
      intro: "A county survey recorded the number of vendors at four farmers markets and the average number of shoppers each market drew per week.",
      headers: ["Market", "Vendors", "Average weekly shoppers"],
      rows: ["Ashby", "Brookside", "Carver Square", "Delmont"],
      a: { low: 12, high: 60, step: 1, say: (row, v) => `${row}, which had ${v} vendors` },
      b: { low: 400, high: 2400, step: 10, say: (row, v) => `${row}, which drew an average of ${v} shoppers` },
      extreme: "lowest",
      statement: "According to the table, the market that drew the fewest shoppers per week was ______.",
    },
    {
      scene: "ii-tq-exhibit-visits",
      intro: "A museum compared four of its temporary exhibits, recording how many objects each displayed and how many minutes visitors spent in each, on average.",
      headers: ["Exhibit", "Objects displayed", "Average visit (minutes)"],
      rows: ["Ancient Coins", "Arctic Journeys", "Glass and Light", "Paper Kites"],
      a: { low: 40, high: 220, step: 1, say: (row, v) => `${row}, which displayed ${v} objects` },
      b: { low: 6, high: 35, step: 1, say: (row, v) => `${row}, where visitors spent ${v} minutes on average` },
      extreme: "highest",
      statement: "According to the table, the exhibit in which visitors spent the most time was ______.",
    },
  ];

  const extremeValue = {
    ...RW,
    id: "quantitative-table-extreme-value",
    skill: "Command of Evidence",
    subskill: "quantitative evidence",
    difficulty: "Easy",
    title: "Statement completed with the extreme row of the named column",
    recognize:
      "Find the column the statement is about, then the highest or lowest value in that column; the other numeric column is a decoy.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["true-but-irrelevant", "reversed-condition", "wrong-quantity"],
    build(t) {
      const topic = t.pick(EXTREME_VALUE_TOPICS);
      const high = topic.extreme === "highest";
      const [key, second, other, opposite] = t.shuffle(topic.rows.slice());
      // Column B ranks: key first, then second, then other, then opposite.
      const bSorted = distinctSorted(t, 4, topic.b.low, topic.b.high, topic.b.step);
      const bOrder = high ? bSorted.slice().reverse() : bSorted;
      const bValue = { [key]: bOrder[0], [second]: bOrder[1], [other]: bOrder[2], [opposite]: bOrder[3] };
      // Column A: `other` holds the extreme in the same direction.
      const aSorted = distinctSorted(t, 4, topic.a.low, topic.a.high, topic.a.step);
      const aOrder = high ? aSorted.slice().reverse() : aSorted;
      const aRest = t.shuffle(aOrder.slice(1));
      const aValue = { [other]: aOrder[0], [key]: aRest[0], [second]: aRest[1], [opposite]: aRest[2] };
      const aShow = (row) => fmt(aValue[row], decimalsOf(topic.a.step));
      const bShow = (row) => fmt(bValue[row], decimalsOf(topic.b.step));
      const table = S.table(topic.headers, topic.rows.map((row) => [row, aShow(row), bShow(row)]));
      const content = `${table}\n\n${topic.intro} ${topic.statement}`;
      const correct = topic.b.say(key, bShow(key));
      const wrong = [
        [topic.a.say(other, aShow(other)), `This is the ${topic.extreme} value in the wrong column ("${topic.headers[1]}"), not in the column the statement is about.`],
        [topic.b.say(second, bShow(second)), `This is the second-${topic.extreme} value in the column, not the ${topic.extreme}.`],
        [topic.b.say(opposite, bShow(opposite)), `This is the ${high ? "lowest" : "highest"} value in the column, the reverse of what the statement asks for.`],
      ];
      return mc("Easy", topic, {
        stimulus: { type: "table", content },
        stem: "Which choice most effectively uses data from the table to complete the statement?",
        correct,
        wrong,
        explanation:
          `The statement is about the "${topic.headers[2]}" column. Its ${topic.extreme} value belongs to ${key} (${bShow(key)}), so the statement is completed by "${correct}."`,
        steps: [
          "Identify which column the statement is about.",
          `Scan that column for its ${topic.extreme} value.`,
          "Choose the option naming that row and that value.",
        ],
        principles: [
          "Match the statement's measure to the column before reading any numbers.",
          "A true number from the wrong column does not complete the statement.",
        ],
        trap: "Reading the extreme value from the other numeric column.",
        hint: "Which column does the statement describe?",
        verify: () => {
          const { rows } = readTable(content);
          const byB = rows.slice().sort((p, q) => (high ? q[2] - p[2] : p[2] - q[2]));
          const byA = rows.slice().sort((p, q) => (high ? q[1] - p[1] : p[1] - q[1]));
          return (
            rows.length === 4 &&
            byB[0][0] === key && byB[1][0] === second && byB[3][0] === opposite &&
            byA[0][0] === other && other !== key &&
            new Set(rows.map((row) => row[2])).size === 4 &&
            correct.includes(bShow(key)) &&
            allDistinct(correct, wrong)
          );
        },
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence: the finding that would support a proposed      */
  /* mechanism, not merely repeat the observation it explains            */
  /* ------------------------------------------------------------------ */

  // The text reports an observation (`observation`) and a hypothesis about
  // its cause (`hypothesis`). The key is a finding that tests that cause;
  // `restated` merely repeats the observation, `contrary` would count
  // against the hypothesis, and `rival` points to a different cause or to
  // something the hypothesis does not concern.
  const SUPPORT_MECHANISM_TOPICS = [
    {
      scene: "ii-desert-snail-shells",
      name: "Farouk",
      text:
        "Snails of one desert species have shells that range from nearly white to dark brown. Biologist Omar Farouk observed that white-shelled snails are far more common in the open, sunny parts of the desert, while dark-shelled snails are more common under shrubs. He hypothesizes that white shells reflect more sunlight and so keep snails from overheating in exposed areas.",
      observation: "white-shelled snails are far more common in the open",
      hypothesis: "white shells reflect more sunlight and so keep snails from overheating",
      key: "In full sun, white-shelled snails' bodies stay several degrees cooler than dark-shelled snails' bodies.",
      restated: "White-shelled snails greatly outnumber dark-shelled snails in the open, sunny parts of the desert.",
      contrary: "In full sun, white-shelled and dark-shelled snails of this species reach exactly the same body temperatures.",
      rival: "Birds that hunt in the shade beneath shrubs spot white-shelled snails more easily than dark ones.",
      rivalReason: "This points to predators, a different explanation for where the snails live, and says nothing about overheating.",
    },
    {
      scene: "ii-city-great-tits-boldness",
      name: "Novak",
      text:
        "Great tits living in cities approach unfamiliar objects more readily than great tits living in forests. Ecologist Hana Novak hypothesizes that city life favors bold birds because bold individuals are quicker to exploit new sources of food, such as bird feeders and discarded scraps, and so are more likely to survive and raise young.",
      observation: "approach unfamiliar objects more readily",
      hypothesis: "bold individuals are quicker to exploit new sources of food",
      key: "Among city great tits, the boldest birds find new feeders sooner and raise more chicks than others.",
      restated: "Great tits in cities approach unfamiliar objects more readily than great tits in forests do.",
      contrary: "In cities, bold and cautious great tits find new feeders equally quickly and raise just as many chicks.",
      rival: "Great tits in forests spend more of each day searching for insects than great tits in cities do.",
      rivalReason: "This compares how forest and city birds forage but does not connect boldness to success in the city.",
    },
    {
      scene: "ii-windswept-ridge-trees",
      name: "Yoon",
      text:
        "Trees growing on windy ridgetops are often shorter and have thicker trunks than trees of the same species growing in sheltered valleys. Botanist Clara Yoon hypothesizes that the wind itself causes the difference: she proposes that the repeated bending of a young tree's trunk by the wind triggers the tree to grow thicker and shorter.",
      observation: "are often shorter and have thicker trunks",
      hypothesis: "the repeated bending of a young tree's trunk by the wind triggers the tree",
      key: "Young valley trees bent back and forth by hand each day grow shorter and thicker than unbent trees.",
      restated: "Trees on windy ridgetops are shorter and thicker than trees of the same species in sheltered valleys.",
      contrary: "Young trees that are bent back and forth each day grow just as tall and thin as trees left alone.",
      rival: "Soil on the ridgetops holds fewer nutrients than valley soil, which slows the growth of many trees.",
      rivalReason: "This offers a different cause, poor soil, rather than supporting the idea that bending is responsible.",
    },
    {
      scene: "ii-ant-chemical-trail",
      name: "Asante",
      text:
        "Ants of one species return from a food source to their nest along a single narrow path. Entomologist Daniel Asante hypothesizes that the ants follow a chemical trail laid down by earlier ants rather than using landmarks, such as rocks and plants, to find their way.",
      observation: "along a single narrow path",
      hypothesis: "follow a chemical trail laid down by earlier ants",
      key: "Ants stop and wander at any section of the path that has been wiped with a solvent that removes chemicals.",
      restated: "Ants returning to the nest from a food source travel along a single, narrow path each time.",
      contrary: "Ants keep walking along the path normally even after a section of it has been wiped with a chemical solvent.",
      rival: "Ants lose their way when the rocks and plants beside the path are moved to new positions.",
      rivalReason: "This would support the landmark explanation that the hypothesis rejects.",
    },
    {
      scene: "ii-music-tempo-shoppers",
      name: "Chowdhury",
      text:
        "Supermarket shoppers in one study spent more time in the store on days when slow music played over the speakers than on days with fast music. Marketing researcher Lina Chowdhury hypothesizes that the tempo of background music influences how fast shoppers walk through the aisles.",
      observation: "spent more time in the store on days when slow music played",
      hypothesis: "the tempo of background music influences how fast shoppers walk",
      key: "Shoppers walked the aisles at a slower pace on slow-music days than on fast-music days.",
      restated: "Shoppers spent more time in the store on days with slow music than on days with fast music.",
      contrary: "Shoppers' walking pace through the aisles was the same no matter what tempo the music had.",
      rival: "When asked about the store's atmosphere, most shoppers said that they preferred the fast music.",
      rivalReason: "Shoppers' stated preferences say nothing about whether the music changed how fast they walked.",
    },
    {
      scene: "ii-iguana-behavioral-fever",
      name: "Torres",
      text:
        "When desert iguanas are infected with certain bacteria, they move to warmer spots and raise their body temperatures by about two degrees, much as mammals develop fevers. Physiologist Rafael Torres hypothesizes that this \"behavioral fever\" helps the lizards survive infection.",
      observation: "they move to warmer spots and raise their body temperatures",
      hypothesis: "helps the lizards survive infection",
      key: "Infected iguanas kept too cool to warm up died more often than infected iguanas that could warm up.",
      restated: "Iguanas infected with certain bacteria seek out warmer spots than healthy iguanas usually choose.",
      contrary: "Infected iguanas that were kept at cooler temperatures survived just as often as those allowed to warm up.",
      rival: "Healthy desert iguanas prefer warmer spots in the afternoon than they do in the early morning.",
      rivalReason: "This concerns healthy lizards' daily habits, not whether warming helps infected lizards survive.",
    },
    {
      scene: "ii-london-coffeehouse-news",
      name: "Lang",
      text:
        "In seventeenth-century London, coffeehouses multiplied rapidly, and many became places where merchants gathered. Historian Peter Lang hypothesizes that coffeehouses spread partly because they served as centers of commercial news, where merchants could learn the latest shipping reports and prices.",
      observation: "coffeehouses multiplied rapidly",
      hypothesis: "served as centers of commercial news",
      key: "Merchants' letters of the period often mention visiting coffeehouses to learn shipping news.",
      restated: "The number of coffeehouses in London grew rapidly over the course of the seventeenth century.",
      contrary: "Coffeehouses that offered shipping news drew no more merchants than coffeehouses that did not.",
      rival: "Coffee cost more in London during the period than it did in most other European cities.",
      rivalReason: "The price of coffee says nothing about whether coffeehouses spread because they offered commercial news.",
    },
    {
      scene: "ii-maple-sap-freeze-thaw",
      name: "Tremblay",
      text:
        "Sugar maple sap flows most heavily in early spring. Forester Jean Tremblay hypothesizes that sap flow depends on the daily cycle of freezing nights and thawing days, which changes the pressure inside the tree's trunk and pushes sap outward.",
      observation: "flows most heavily in early spring",
      hypothesis: "the daily cycle of freezing nights and thawing days",
      key: "Sap flow drops sharply during spring stretches when temperatures stay above freezing both day and night.",
      restated: "Maple sap flows more heavily in early spring than it does during any other season of the year.",
      contrary: "Sap flows just as heavily during warm spells without freezing nights as during freeze-thaw cycles.",
      rival: "Maple trees that grow in colder regions produce sap containing a noticeably higher concentration of sugar.",
      rivalReason: "This concerns how sweet the sap is, not what makes it flow.",
    },
    {
      scene: "ii-library-fine-free",
      name: "Carter",
      text:
        "After a city library stopped charging fines for overdue books, the number of active cardholders rose by 15 percent within a year. Librarian Monique Carter hypothesizes that fines had been keeping residents who owed money from returning to the library at all.",
      observation: "the number of active cardholders rose by 15 percent",
      hypothesis: "fines had been keeping residents who owed money from returning",
      key: "Many of the new active cardholders were residents whose accounts had been blocked for unpaid fines.",
      restated: "The number of active cardholders rose in the year after the library stopped charging fines.",
      contrary: "Residents who had owed fines returned to the library at the same low rate after the change.",
      rival: "The library's collection of new books also grew by 15 percent in the year after fines ended.",
      rivalReason: "This points to a different possible reason for the rise and says nothing about residents who had owed fines.",
    },
    {
      scene: "ii-hydrangea-aluminum",
      name: "Park",
      text:
        "Gardeners have long noticed that the flowers of bigleaf hydrangeas are blue in some gardens and pink in others. Horticulturist Ellen Park hypothesizes that the color depends on how much aluminum the plant can absorb from the soil, with more aluminum producing blue flowers.",
      observation: "are blue in some gardens and pink in others",
      hypothesis: "depends on how much aluminum the plant can absorb",
      key: "Pink-flowering hydrangeas begin to produce blue flowers after aluminum is added to their soil.",
      restated: "Bigleaf hydrangeas produce blue flowers in some gardens and pink flowers in other gardens.",
      contrary: "Adding aluminum to the soil around pink-flowering hydrangeas does not change the color of their flowers.",
      rival: "Blue hydrangeas are more popular than pink hydrangeas among the gardeners who grow them.",
      rivalReason: "Gardeners' preferences have nothing to do with what causes the flowers' color.",
    },
  ];

  const supportsMechanism = {
    ...RW,
    id: "evidence-finding-supports-mechanism",
    skill: "Command of Evidence",
    subskill: "textual evidence",
    difficulty: "Medium",
    title: "Finding that would support the cause a hypothesis proposes",
    recognize:
      "The hypothesis names a cause for an observation; support has to test that cause, and restating the observation it explains does not.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["true-but-irrelevant", "opposite-stance", "word-association"],
    build(t) {
      const topic = t.pick(SUPPORT_MECHANISM_TOPICS);
      const wrong = [
        [topic.restated, "This only restates the observation the hypothesis is meant to explain; it does not test the proposed cause."],
        [topic.contrary, "This would count against the hypothesis, not support it."],
        [topic.rival, topic.rivalReason],
      ];
      return mc("Medium", topic, {
        stimulus: passage(topic.text),
        stem: `Which finding, if true, would most directly support ${topic.name}'s hypothesis?`,
        correct: topic.key,
        wrong,
        explanation:
          `${topic.name} proposes a specific cause ("${topic.hypothesis}"). The finding that tests that cause directly is: ${topic.key}`,
        steps: [
          "Separate the observation from the hypothesis that explains it.",
          "Ask what else would have to be true if the proposed cause were real.",
          "Choose the finding that checks that consequence, not one that repeats the observation.",
        ],
        principles: [
          "An observation cannot be evidence for one explanation of itself over another.",
          "The strongest support tests the specific mechanism a hypothesis proposes.",
        ],
        trap: "Choosing the finding that restates the observation, since it sounds like agreement with the researcher.",
        hint: "What would you expect to see if the proposed cause were really at work?",
        verify: () =>
          inOrder(topic.text, [topic.observation, topic.hypothesis]) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence (quantitative): support a claim about one       */
  /* group's change over time, when every choice is true of the table   */
  /* ------------------------------------------------------------------ */

  // Three groups measured in two years. The claim is that one named group
  // rose (or fell) substantially. Every choice is a true statement about
  // the table; only the key describes that group's change. The others give
  // the group's level in one year, another group's change, or a comparison
  // between groups in the first year.
  const GROUP_CHANGE_TOPICS = [
    {
      scene: "ii-tq2-route-ridership",
      intro: "The table shows average weekday ridership on three bus routes in the city of Easton.",
      claimant: "Transit planner Rosa Delgado",
      surname: "Delgado",
      claim: "claims that ridership on Route 9 rose substantially after the city began running Route 9 buses every ten minutes in 2021",
      headerFor: "Route",
      measureHeader: "Average weekday riders",
      groups: ["Route 4", "Route 9", "Route 12"],
      focus: "Route 9",
      plural: "routes",
      years: [2019, 2023],
      direction: "rose",
      range: [1200, 4800, 10],
      of: (g) => `${g}'s average weekday ridership`,
      measure: "average weekday ridership",
      show: (v) => v,
    },
    {
      scene: "ii-tq2-school-recycling",
      intro: "The table shows the percentage of each school's waste that was recycled at three middle schools in one district.",
      claimant: "Environmental educator Tom Reyes",
      surname: "Reyes",
      claim: "argues that Lakeside Middle School's recycling rate increased sharply after its students started a sorting program in 2019",
      headerFor: "School",
      measureHeader: "Waste recycled (%)",
      groups: ["Hawthorne Middle", "Lakeside Middle", "Pinecrest Middle"],
      focus: "Lakeside Middle",
      plural: "schools",
      years: [2018, 2022],
      direction: "rose",
      range: [12, 70, 1],
      of: (g) => `${g}'s recycling rate`,
      measure: "recycling rate",
      show: (v) => `${v}%`,
    },
    {
      scene: "ii-tq2-heron-wetlands",
      intro: "The table shows the number of great blue herons counted during an annual survey of three wetlands.",
      claimant: "Biologist Anika Rao",
      surname: "Rao",
      claim: "claims that the number of herons at Otter Slough grew substantially after the wetland was restored in 2015",
      headerFor: "Wetland",
      measureHeader: "Herons counted",
      groups: ["Cold Spring Marsh", "Otter Slough", "Reed Hollow"],
      focus: "Otter Slough",
      plural: "wetlands",
      years: [2012, 2022],
      direction: "rose",
      range: [8, 90, 1],
      of: (g) => `the heron count at ${g}`,
      measure: "heron count",
      show: (v) => v,
    },
    {
      scene: "ii-tq2-orchard-blight",
      intro: "The table shows the percentage of trees showing signs of fire blight in three orchards owned by one farm.",
      claimant: "Plant pathologist Luis Ortega",
      surname: "Ortega",
      claim: "claims that blight declined substantially in River Orchard after workers began pruning infected branches there in 2019",
      headerFor: "Orchard",
      measureHeader: "Trees showing blight (%)",
      groups: ["North Orchard", "River Orchard", "West Orchard"],
      focus: "River Orchard",
      plural: "orchards",
      years: [2018, 2022],
      direction: "fell",
      range: [5, 60, 1],
      of: (g) => `the share of trees showing blight in ${g}`,
      measure: "share of trees showing blight",
      show: (v) => `${v}%`,
    },
    {
      scene: "ii-tq2-library-cardholders",
      intro: "The table shows the number of library cardholders per 1,000 residents in three neighborhoods of a city.",
      claimant: "City librarian Grace Kim",
      surname: "Kim",
      claim: "claims that library use in Northgate increased substantially after a branch library opened there in 2017",
      headerFor: "Neighborhood",
      measureHeader: "Cardholders per 1,000 residents",
      groups: ["Eastside", "Northgate", "Riverside"],
      focus: "Northgate",
      plural: "neighborhoods",
      years: [2015, 2020],
      direction: "rose",
      range: [120, 480, 1],
      of: (g) => `the number of cardholders per 1,000 residents in ${g}`,
      measure: "number of cardholders per 1,000 residents",
      show: (v) => v,
    },
    {
      scene: "ii-tq2-downtown-particulates",
      intro: "The table shows the average level of fine particles in the air, in micrograms per cubic meter, at three monitoring stations in one city.",
      claimant: "Air quality analyst Jonas Weber",
      surname: "Weber",
      claim: "argues that fine-particle pollution downtown dropped substantially after the city switched its downtown buses to electric power in 2017",
      headerFor: "Station",
      measureHeader: "Fine particles (µg/m³)",
      groups: ["Airport", "Central", "Harbor"],
      focus: "Central",
      plural: "stations",
      years: [2016, 2021],
      direction: "fell",
      range: [8, 30, 0.1],
      of: (g) => `the fine-particle level at the ${g} station`,
      measure: "fine-particle level",
      show: (v) => v,
      name: (g) => `the ${g} station`,
    },
    {
      scene: "ii-tq2-language-enrollment",
      intro: "The table shows enrollment in three language programs at Halvorsen College.",
      claimant: "Program director Mei Lin",
      surname: "Lin",
      claim: "claims that enrollment in Korean at the college increased substantially after the college hired two new Korean instructors in 2015",
      headerFor: "Language",
      measureHeader: "Students enrolled",
      groups: ["German", "Italian", "Korean"],
      focus: "Korean",
      plural: "languages",
      years: [2012, 2022],
      direction: "rose",
      range: [40, 320, 1],
      of: (g) => `enrollment in ${g}`,
      measure: "enrollment",
      show: (v) => `${v} students`,
    },
    {
      scene: "ii-tq2-reef-coral-cover",
      intro: "The table shows the percentage of the seafloor covered by living coral in three zones of one reef.",
      claimant: "Marine ecologist Talia Moana",
      surname: "Moana",
      claim: "argues that coral cover in the reef's shallow zone declined substantially after a marine heat wave in 2016",
      headerFor: "Zone",
      measureHeader: "Coral cover (%)",
      groups: ["Deep zone", "Middle zone", "Shallow zone"],
      focus: "Shallow zone",
      plural: "zones",
      years: [2014, 2019],
      direction: "fell",
      range: [10, 60, 1],
      of: (g) => `coral cover in the ${lower(g)}`,
      measure: "coral cover",
      show: (v) => `${v}%`,
      name: (g) => `the ${lower(g)}`,
    },
    {
      scene: "ii-tq2-bike-commuting",
      intro: "The table shows the percentage of commuters who biked to work in three cities in the same region.",
      claimant: "Urban planner Ines Duarte",
      surname: "Duarte",
      claim: "claims that bicycle commuting in Brenton grew substantially after the city built a network of protected bike lanes in 2011",
      headerFor: "City",
      measureHeader: "Commuters biking to work (%)",
      groups: ["Aldport", "Brenton", "Calloway"],
      focus: "Brenton",
      plural: "cities",
      years: [2008, 2018],
      direction: "rose",
      range: [1, 14, 0.1],
      of: (g) => `the share of commuters biking to work in ${g}`,
      measure: "share of commuters biking to work",
      show: (v) => `${v}%`,
    },
    {
      scene: "ii-tq2-clinic-waits",
      intro: "The table shows the average time, in minutes, that patients waited to be seen at three clinics in one health network.",
      claimant: "Health administrator Omar Siddiqui",
      surname: "Siddiqui",
      claim: "claims that waiting times at Clinic B fell substantially after the clinic introduced online check-in in 2020",
      headerFor: "Clinic",
      measureHeader: "Average wait (minutes)",
      groups: ["Clinic A", "Clinic B", "Clinic C"],
      focus: "Clinic B",
      plural: "clinics",
      years: [2019, 2022],
      direction: "fell",
      range: [12, 75, 1],
      of: (g) => `the average wait at ${g}`,
      measure: "average wait",
      show: (v) => `${v} minutes`,
    },
  ];

  // Values for a group that rose, then reflected for a group that fell so
  // the same constraints hold in the claimed direction.
  function groupChangeValues(t, topic) {
    const [low, high, step] = topic.range;
    const span = high - low;
    const snap = (v) => Math.round(Math.round((v - low) / step) * step * 1e6) / 1e6 + low;
    const draw = (from, to) => snap(from + t.random() * (to - from));
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const g1 = draw(low + span * 0.25, low + span * 0.45);
      const g2 = draw(g1 + span * 0.3, Math.min(high, g1 + span * 0.5));
      const h1 = draw(Math.max(low, g1 - span * 0.2), g1 - span * 0.05);
      const h2 = draw(h1 + span * 0.03, h1 + span * 0.12);
      const i1 = draw(low + span * 0.2, low + span * 0.7);
      const i2 = draw(Math.max(low, i1 - span * 0.1), Math.min(g2 - span * 0.08, i1 + span * 0.1));
      const values = [g1, g2, h1, h2, i1, i2];
      const ok =
        values.every((v) => v >= low && v <= high) &&
        g2 > g1 && h2 > h1 && h1 < g1 && h2 < g2 && i2 < g2 && new Set(values).size === 6;
      if (!ok) continue;
      const flip = (v) => (topic.direction === "fell" ? Math.round((low + high - v) * 1e6) / 1e6 : v);
      return values.map(flip);
    }
    throw new Error(`${topic.scene}: could not draw values`);
  }

  const groupChange = {
    ...RW,
    id: "quantitative-table-change-for-one-group",
    skill: "Command of Evidence",
    subskill: "quantitative evidence",
    difficulty: "Medium",
    title: "Data supporting a claim about one group's change over time",
    recognize:
      "The claim is about a change for one group, so the evidence must give that group's values in both years; every other choice is true but answers a different comparison.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["true-but-irrelevant", "wrong-quantity"],
    build(t) {
      const topic = t.pick(GROUP_CHANGE_TOPICS);
      const rose = topic.direction === "rose";
      const [g1, g2, h1, h2, i1, i2] = groupChangeValues(t, topic);
      const others = topic.groups.filter((g) => g !== topic.focus);
      const [h, i] = t.shuffle(others);
      const value = { [topic.focus]: [g1, g2], [h]: [h1, h2], [i]: [i1, i2] };
      const decimals = decimalsOf(topic.range[2]);
      const cell = (v) => fmt(v, decimals);
      const say = (v) => topic.show(cell(v));
      const [y1, y2] = topic.years;
      const table = S.table(
        [topic.headerFor, `${topic.measureHeader}, ${y1}`, `${topic.measureHeader}, ${y2}`],
        topic.groups.map((g) => [g, cell(value[g][0]), cell(value[g][1])]),
      );
      const text = `${topic.intro} ${topic.claimant} ${topic.claim}.`;
      const content = `${table}\n\n${text}`;
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
      const name = topic.name || ((g) => g);
      const verb = rose ? "rose" : "fell";
      const correct = `${cap(topic.of(topic.focus))} ${verb} from ${say(g1)} in ${y1} to ${say(g2)} in ${y2}.`;
      const wrong = [
        [`${cap(name(topic.focus))} had the ${rose ? "highest" : "lowest"} ${topic.measure} of the three ${topic.plural} in ${y2}.`,
          `True, but a ${y2} ranking says nothing about how ${topic.focus} changed since ${y1}.`],
        [`${cap(topic.of(h))} ${verb} from ${say(h1)} in ${y1} to ${say(h2)} in ${y2}.`,
          `True, but this describes ${h}, not ${topic.focus}, the group the claim is about.`],
        [`In ${y1}, ${name(topic.focus)} had a ${rose ? "higher" : "lower"} ${topic.measure} than ${name(h)} did.`,
          `True, but comparing two groups in ${y1} says nothing about change over time.`],
      ];
      return mc("Medium", topic, {
        stimulus: { type: "table", content },
        stem: `Which choice most effectively uses data from the table to support ${topic.surname}'s claim?`,
        correct,
        wrong,
        explanation:
          `The claim is that ${topic.focus} changed substantially between ${y1} and ${y2}. Only a choice giving ${topic.focus}'s values in both years shows that change: ${correct}`,
        steps: [
          "Identify the group and the kind of comparison the claim makes (a change over time).",
          "Find that group's values in both years.",
          "Choose the statement that reports that change; true statements about other comparisons do not support the claim.",
        ],
        principles: [
          "Evidence for a change needs values at two times for the same group.",
          "Every choice in a data question may be true; the question is which one supports this claim.",
        ],
        trap: "Choosing a true statement about the right group that compares the wrong things, such as its rank in a single year.",
        hint: "What kind of comparison does the claim make, and for which group?",
        verify: () => {
          const { rows } = readTable(content);
          const row = (g) => rows.find((r) => r[0] === g);
          const [, f1, f2] = row(topic.focus);
          const [, o1, o2] = row(h);
          const second = rows.map((r) => r[2]);
          const sign = rose ? 1 : -1;
          const span = topic.range[1] - topic.range[0];
          return (
            sign * (f2 - f1) >= span * 0.25 &&
            sign * f2 === Math.max(...second.map((v) => sign * v)) &&
            sign * (o2 - o1) > 0 &&
            sign * (f1 - o1) > 0 &&
            correct.includes(say(f1)) && correct.includes(say(f2)) &&
            allDistinct(correct, wrong)
          );
        },
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence (quantitative): the data that weaken a trend    */
  /* hypothesis, among true statements that support it or concern the   */
  /* wrong column                                                        */
  /* ------------------------------------------------------------------ */

  // Five levels of X with two measured columns. The hypothesis says the
  // first column (Y) rises (or falls) as X increases. The data follow it
  // except between one adjacent pair of levels. The key reports that pair.
  // One distractor reports the same kind of reversal in the other column
  // (Z), which the hypothesis does not concern; two report comparisons in Y
  // that fit the hypothesis.
  const COUNTEREXAMPLE_TOPICS = [
    {
      scene: "ii-tq4-highway-lichens",
      person: "Ecologist Mara Jensen",
      surname: "Jensen",
      hypothesis: "hypothesizes that the number of lichen species growing on trees increases with distance from a highway",
      intro: "Jensen counted lichen species on trees at five distances from a highway and also measured the trees' average height.",
      x: { header: "Distance from highway (m)", levels: [25, 100, 200, 400, 800], at: (x) => `at ${fmt(x)} m from the highway` },
      y: { header: "Lichen species per tree", name: "the number of lichen species per tree", low: 2, high: 16, step: 1 },
      z: { header: "Average tree height (m)", name: "the average tree height", low: 8, high: 20, step: 0.1 },
      direction: 1,
    },
    {
      scene: "ii-tq4-elevation-leaf-area",
      person: "Botanist Julien Moreau",
      surname: "Moreau",
      hypothesis: "hypothesizes that the leaves of a mountain shrub get smaller as elevation increases",
      intro: "Moreau measured the shrub's average leaf area and the number of shrubs per plot at five elevations.",
      x: { header: "Elevation (m)", levels: [600, 1000, 1400, 1800, 2200], at: (x) => `at ${fmt(x)} m` },
      y: { header: "Average leaf area (cm²)", name: "the average leaf area", low: 18, high: 80, step: 1 },
      z: { header: "Shrubs per plot", name: "the number of shrubs per plot", low: 5, high: 40, step: 1 },
      direction: -1,
    },
    {
      scene: "ii-tq4-practice-recital",
      person: "Music teacher Hannah Cole",
      surname: "Cole",
      hypothesis: "hypothesizes that students who practice more hours each week earn higher recital scores",
      intro: "Cole grouped her students by weekly practice time and recorded each group's average recital score and average number of pieces learned.",
      x: { header: "Weekly practice (hours)", levels: [2, 4, 6, 8, 10], at: (x) => `for students practicing ${x} hours a week` },
      y: { header: "Average recital score", name: "the average recital score", low: 50, high: 96, step: 1 },
      z: { header: "Average pieces learned", name: "the average number of pieces learned", low: 2, high: 14, step: 1 },
      direction: 1,
    },
    {
      scene: "ii-tq4-inland-rainfall",
      person: "Climatologist Rafael Souza",
      surname: "Souza",
      hypothesis: "hypothesizes that annual rainfall in the region decreases with distance from the coast",
      intro: "Souza compiled the average annual rainfall and average July temperature at five weather stations at different distances inland.",
      x: { header: "Distance inland (km)", levels: [5, 25, 50, 100, 150], at: (x) => `${x} km inland` },
      y: { header: "Annual rainfall (mm)", name: "annual rainfall", low: 400, high: 1600, step: 10 },
      z: { header: "July temperature (°C)", name: "the July temperature", low: 18, high: 31, step: 0.1 },
      direction: -1,
    },
    {
      scene: "ii-tq4-city-walking-speed",
      person: "Psychologist Nadia Ibrahim",
      surname: "Ibrahim",
      hypothesis: "hypothesizes that people walk faster in cities with larger populations",
      intro: "Ibrahim timed pedestrians in five cities of different sizes and also recorded each city's number of parks per 10,000 residents.",
      x: { header: "City population", levels: [20000, 80000, 250000, 600000, 1500000], at: (x) => `in the city of ${fmt(x)}` },
      y: { header: "Average walking speed (m/s)", name: "the average walking speed", low: 1.1, high: 1.6, step: 0.01 },
      z: { header: "Parks per 10,000 residents", name: "the number of parks per 10,000 residents", low: 1, high: 6, step: 0.1 },
      direction: 1,
    },
    {
      scene: "ii-tq4-cricket-chirps",
      person: "Entomologist Owen Park",
      surname: "Park",
      hypothesis: "hypothesizes that snowy tree crickets chirp more often at higher temperatures",
      intro: "Park recorded the chirping rate and body length of crickets kept at five air temperatures.",
      x: { header: "Air temperature (°C)", levels: [14, 18, 22, 26, 30], at: (x) => `at ${x}°C` },
      y: { header: "Chirps per minute", name: "the chirping rate", low: 40, high: 180, step: 1 },
      z: { header: "Average body length (mm)", name: "the average body length", low: 13, high: 25, step: 0.1 },
      direction: 1,
    },
    {
      scene: "ii-tq4-latitude-clutch-size",
      person: "Ornithologist Lucia Ferrer",
      surname: "Ferrer",
      hypothesis: "hypothesizes that songbirds of one family lay larger clutches of eggs at higher latitudes",
      intro: "Ferrer compiled the average clutch size and average wing length for populations at five latitudes.",
      x: { header: "Latitude (°N)", levels: [10, 20, 30, 40, 50], at: (x) => `at ${x}°N` },
      y: { header: "Average clutch size (eggs)", name: "the average clutch size", low: 2, high: 6.5, step: 0.1 },
      z: { header: "Average wing length (mm)", name: "the average wing length", low: 60, high: 92, step: 1 },
      direction: 1,
    },
    {
      scene: "ii-tq4-ticket-prices",
      person: "Theater manager Diego Alvarez",
      surname: "Alvarez",
      hypothesis: "hypothesizes that fewer tickets are sold per show as the ticket price rises",
      intro: "Alvarez tried five ticket prices over a season and recorded the average number of tickets sold per show and the average audience rating.",
      x: { header: "Ticket price ($)", levels: [10, 15, 20, 25, 30], at: (x) => `at a price of $${x}` },
      y: { header: "Tickets sold per show", name: "the number of tickets sold per show", low: 80, high: 400, step: 1 },
      z: { header: "Average rating (out of 5)", name: "the average rating", low: 3, high: 4.9, step: 0.1 },
      direction: -1,
    },
    {
      scene: "ii-tq4-nitrogen-height",
      person: "Agronomist Chen Wei",
      surname: "Chen",
      hypothesis: "hypothesizes that corn plants grow taller as more nitrogen fertilizer is applied",
      intro: "Chen applied five amounts of nitrogen to test plots and recorded the average plant height and number of leaves per plant.",
      x: { header: "Nitrogen applied (kg/ha)", levels: [0, 40, 80, 120, 160], at: (x) => `with ${x} kg/ha of nitrogen` },
      y: { header: "Average plant height (cm)", name: "the average plant height", low: 40, high: 110, step: 1 },
      z: { header: "Leaves per plant", name: "the number of leaves per plant", low: 8, high: 20, step: 1 },
      direction: 1,
    },
    {
      scene: "ii-tq4-sleep-reaction-time",
      person: "Sleep researcher Amara Obi",
      surname: "Obi",
      hypothesis: "hypothesizes that people's reaction times get shorter as they get more sleep",
      intro: "Obi measured reaction times and daily caffeine intake for volunteers who had slept for different numbers of hours.",
      x: { header: "Hours of sleep", levels: [4, 5, 6, 7, 8], at: (x) => `after ${x} hours of sleep` },
      y: { header: "Average reaction time (ms)", name: "the average reaction time", low: 250, high: 420, step: 1 },
      z: { header: "Average caffeine intake (mg)", name: "the average caffeine intake", low: 50, high: 250, step: 1 },
      direction: -1,
    },
  ];

  const counterexample = {
    ...RW,
    id: "quantitative-table-weakens-trend",
    skill: "Command of Evidence",
    subskill: "quantitative evidence",
    difficulty: "Medium",
    title: "Data that weaken a hypothesis about a trend",
    recognize:
      "Look for the adjacent pair of rows where the hypothesized column moves the wrong way; the same reversal in the other column does not bear on the hypothesis.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "wrong-quantity", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(COUNTEREXAMPLE_TOPICS);
      const up = topic.direction === 1;
      const levels = topic.x.levels;
      // Y follows the hypothesis except that rows k-1 and k are swapped.
      const sorted = distinctSorted(t, 5, topic.y.low, topic.y.high, topic.y.step);
      const y = up ? sorted.slice() : sorted.slice().reverse();
      const k = t.int(1, 3);
      [y[k - 1], y[k]] = [y[k], y[k - 1]];
      // Z moves the same "wrong" way between those rows, otherwise at random.
      const z = t.shuffle(distinctSorted(t, 5, topic.z.low, topic.z.high, topic.z.step));
      if (up ? z[k] > z[k - 1] : z[k] < z[k - 1]) [z[k - 1], z[k]] = [z[k], z[k - 1]];
      const yd = decimalsOf(topic.y.step);
      const zd = decimalsOf(topic.z.step);
      const table = S.table(
        [topic.x.header, topic.y.header, topic.z.header],
        levels.map((x, index) => [fmt(x), fmt(y[index], yd), fmt(z[index], zd)]),
      );
      const content = `${table}\n\n${topic.person} ${topic.hypothesis}. ${topic.intro}`;
      const against = up ? "lower" : "higher";
      const along = up ? "higher" : "lower";
      const compare = (series, name, decimals, word, i, j) =>
        `${cap1(name)} was ${word} ${topic.x.at(levels[i])} (${fmt(series[i], decimals)}) than ${topic.x.at(levels[j])} (${fmt(series[j], decimals)}).`;
      const others = [1, 2, 3, 4].filter((j) => j !== k);
      const j = t.pick(others);
      const correct = compare(y, topic.y.name, yd, against, k, k - 1);
      const wrong = [
        [compare(z, topic.z.name, zd, against, k, k - 1),
          `True, but this concerns ${topic.z.name}, which the hypothesis says nothing about.`],
        [compare(y, topic.y.name, yd, along, 4, 0),
          "True, but this comparison fits the hypothesis, so it supports rather than weakens it."],
        [compare(y, topic.y.name, yd, along, j, j - 1),
          "True, but this pair of rows moves the way the hypothesis predicts, so it supports the hypothesis."],
      ];
      return mc("Medium", topic, {
        stimulus: { type: "table", content },
        stem: `Which choice best describes data from the table that weaken ${topic.surname}'s hypothesis?`,
        correct,
        wrong,
        explanation:
          `The hypothesis predicts that ${topic.y.name} will be ${along} at each successive row of the table. Between the two adjacent rows in the key it is ${against} instead, which runs against the prediction: ${correct}`,
        steps: [
          "Identify which column the hypothesis is about and which way it predicts that column will move.",
          "Scan adjacent rows of that column for a step in the opposite direction.",
          "Choose the statement reporting that step; reject statements that fit the prediction or concern the other column.",
        ],
        principles: [
          "Data weaken a hypothesis when they differ from what it predicts.",
          "A pattern in a column the hypothesis does not mention neither supports nor weakens it.",
        ],
        trap: "Choosing the reversal in the other column, which looks exactly like the key but concerns a different measure.",
        hint: "Where does the column the hypothesis names move the wrong way?",
        verify: () => {
          const { rows } = readTable(content);
          const ys = rows.map((row) => row[1]);
          const zs = rows.map((row) => row[2]);
          const fits = (a, b) => (up ? b > a : b < a);
          const breaks = [1, 2, 3, 4].filter((i) => !fits(ys[i - 1], ys[i]));
          return (
            breaks.length === 1 && breaks[0] === k &&
            fits(ys[0], ys[4]) && fits(ys[j - 1], ys[j]) &&
            !fits(zs[k - 1], zs[k]) &&
            correct.includes(`(${fmt(ys[k], yd)})`) &&
            allDistinct(correct, wrong)
          );
        },
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence: the finding that would most directly weaken a  */
  /* causal claim built on a before-and-after or side-by-side pattern    */
  /* ------------------------------------------------------------------ */

  // `pattern` is the observed pattern and `claim` the causal conclusion
  // drawn from it. The key shows the effect without the proposed cause (or
  // the cause's group already different), which breaks the causal link.
  // `supports` strengthens the claim, `neutral` fits it or leaves it
  // untouched while sounding relevant, and `irrelevant` concerns something
  // else about the same subject.
  const WEAKEN_CLAIM_TOPICS = [
    {
      scene: "ii-corn-bunting-sowing",
      target: "Kemper's argument",
      text:
        "Across one region of farmland, populations of a ground-nesting bird, the corn bunting, fell by about 60 percent between 1990 and 2010. Over the same period, farmers increasingly switched from sowing grain in spring to sowing it in autumn, which means that fields are harvested earlier the following summer. Ecologist Ruth Kemper argues that the switch to autumn sowing caused the decline, because earlier harvests destroy nests before the chicks are old enough to leave them.",
      pattern: "fell by about 60 percent between 1990 and 2010",
      claim: "argues that the switch to autumn sowing caused the decline",
      key: "Corn bunting numbers fell just as steeply on farms that kept sowing in spring as on farms that switched.",
      supports: "Corn buntings nesting in autumn-sown fields raised far fewer chicks than those nesting in spring-sown fields.",
      neutral: "On most farms, corn bunting numbers began to fall a year or two after the switch to autumn sowing.",
      neutralReason: "A decline that follows the switch is what Kemper's argument predicts, so this fits it rather than weakening it.",
      irrelevant: "Autumn-sown grain produces larger harvests in the region than grain that is sown in the spring.",
    },
    {
      scene: "ii-harlow-free-admission",
      target: "the director's conclusion",
      text:
        "In 2015, the Harlow City Museum dropped its admission fee, and annual attendance rose from 210,000 to 340,000 over the next two years. The museum's director concludes that the fee had been keeping many residents away and that eliminating it was responsible for the increase. She now urges other museums in the region to follow Harlow's example.",
      pattern: "rose from 210,000 to 340,000",
      claim: "eliminating it was responsible for the increase",
      key: "Attendance rose by a similar share in those years at a nearby museum that kept charging its usual fee.",
      supports: "Many first-time visitors surveyed after 2015 said that the old fee had kept them from visiting before.",
      neutral: "Attendance rose only slightly in the first months after the fee was dropped and then climbed steadily.",
      neutralReason: "Word of a change can take time to spread, so a slow start is consistent with the director's conclusion.",
      irrelevant: "The museum's gift shop earned less money per visitor in the years after the admission fee was dropped.",
    },
    {
      scene: "ii-lake-maren-phosphorus",
      target: "Idowu's explanation",
      text:
        "Algae blooms in Lake Maren have grown larger and more frequent since 2005. Hydrologist Samuel Idowu attributes the change to fertilizer washing into the lake from nearby farms, which expanded their planted area during the same period. Fertilizer supplies phosphorus, a nutrient that algae need in order to grow, and Idowu argues that the added phosphorus has fueled the blooms.",
      pattern: "have grown larger and more frequent since 2005",
      claim: "attributes the change to fertilizer washing into the lake",
      key: "Phosphorus levels in Lake Maren's water have not risen since 2005, even as the blooms have grown.",
      supports: "Streams flowing into the lake from farm fields have carried more phosphorus since 2005 than before.",
      neutral: "Some of the species of algae that grow in Lake Maren need less phosphorus than other species do.",
      neutralReason: "Differences among algae species do not bear on whether added phosphorus has fueled the blooms.",
      irrelevant: "The farms near Lake Maren have switched to crops that need less water than the crops they once grew.",
    },
    {
      scene: "ii-westbrook-start-time",
      target: "Moreau's argument",
      text:
        "After Westbrook High School moved its start time from 7:30 to 8:45 a.m., the number of students arriving late fell by 40 percent. Principal Dana Moreau credits the later start, arguing that students who get more sleep find it easier to arrive on time. She has recommended the same change to the district's other high schools.",
      pattern: "the number of students arriving late fell by 40 percent",
      claim: "credits the later start",
      key: "In the same semester, Westbrook began giving an after-school detention to every student who arrived late.",
      supports: "Westbrook students reported sleeping about forty minutes more each night after the change than before it.",
      neutral: "Late arrivals fell more among older students than among younger students after the change.",
      neutralReason: "This describes who benefited most; it is consistent with the later start being the cause.",
      irrelevant: "Moving the start time required Westbrook to end its school day later in the afternoon.",
    },
    {
      scene: "ii-porth-aven-seawall",
      target: "Stan's argument",
      text:
        "After the town of Porth Aven built a concrete seawall in 2008, its beach narrowed steadily, losing about a meter of sand each year. Geologist Mirela Stan argues that the seawall caused the loss: waves striking the wall rebound with enough force to carry sand away from the beach. The town is now debating whether to take the wall down.",
      pattern: "losing about a meter of sand each year",
      claim: "argues that the seawall caused the loss",
      key: "Beaches along the same coast with no seawalls lost sand at the same rate during the same years.",
      supports: "Sand loss has been greatest directly in front of the wall and smaller along the beach beyond its ends.",
      neutral: "The seawall at Porth Aven is both taller and longer than most other seawalls along that coast.",
      neutralReason: "How the wall compares in size with other walls does not show whether it caused the sand loss.",
      irrelevant: "The seawall has protected the town's buildings from flooding during every major storm since 2008.",
    },
    {
      scene: "ii-roman-lead-elite",
      target: "the historians' argument",
      text:
        "Some historians have argued that lead poisoning contributed to the decline of the Roman elite. Wealthy Romans, they note, drank water carried through lead pipes and sweetened their wine with a syrup boiled down in lead pots, and ancient writers described ailments among the elite, such as gout, that can result from lead poisoning.",
      pattern: "drank water carried through lead pipes",
      claim: "lead poisoning contributed to the decline of the Roman elite",
      key: "Skeletons of wealthy Romans contain no more lead than skeletons of poor Romans from the same period.",
      supports: "Skeletons of wealthy Romans contain far more lead than skeletons of poor Romans from the same period.",
      neutral: "Roman writers also recommended the lead-sweetened syrup as a remedy for several minor illnesses.",
      neutralReason: "If anything, this points to even more lead exposure, so it does not weaken the argument.",
      irrelevant: "Roman engineers built aqueducts that carried water across great distances to the cities.",
    },
    {
      scene: "ii-suburban-bee-lawns",
      target: "Beltrán's argument",
      text:
        "In one suburban county, the number of native bee species recorded each summer fell by nearly a third between 2000 and 2020. During the same years, many homeowners replaced flower beds with lawns. Entomologist Jorge Beltrán argues that the loss of flowering plants in yards reduced the food available to bees and caused the decline.",
      pattern: "fell by nearly a third between 2000 and 2020",
      claim: "argues that the loss of flowering plants in yards",
      key: "The decline was just as steep in the county's nature preserves, where the flowering plants did not change.",
      supports: "Bee species declined most in the neighborhoods where the largest number of flower beds were replaced with lawns.",
      neutral: "Most of the lawns in the county were planted during the first half of the twenty-year period.",
      neutralReason: "When the lawns were planted does not show that they had no effect on the bees.",
      irrelevant: "A lawn requires more water each summer than a flower bed of the same size does.",
    },
    {
      scene: "ii-millbrook-broadband",
      target: "Nasser's conclusion",
      text:
        "After the town of Millbrook installed high-speed internet service in 2016, the number of small businesses registered in the town rose by 25 percent over four years. Economist Tariq Nasser concludes that the new service encouraged residents to start businesses that they could not previously have run from Millbrook.",
      pattern: "rose by 25 percent over four years",
      claim: "concludes that the new service encouraged residents to start businesses",
      key: "Small businesses increased by a similar percentage in nearby towns that did not get high-speed service.",
      supports: "Most of the new businesses in Millbrook sell their goods or services mainly through the internet.",
      neutral: "Few new businesses were registered in Millbrook during the first year after the service arrived.",
      neutralReason: "Starting a business takes time, so a slow first year is consistent with Nasser's conclusion.",
      irrelevant: "Many Millbrook residents use the new service mainly to stream films and television shows.",
    },
    {
      scene: "ii-carden-diesel-asthma",
      target: "the officials' conclusion",
      text:
        "Hospital visits for childhood asthma in the city of Carden fell by 20 percent in the five years after the city banned diesel trucks from its downtown streets. City health officials credit the ban, noting that diesel exhaust contains fine particles known to irritate the airways.",
      pattern: "fell by 20 percent in the five years",
      claim: "City health officials credit the ban",
      key: "Childhood asthma visits fell by a similar amount in outlying areas that the trucks still passed through.",
      supports: "Levels of fine particles in the downtown air dropped sharply as soon as the ban on diesel trucks took effect.",
      neutral: "Asthma visits fell slowly at first and then more quickly in the later years of the period.",
      neutralReason: "A gradual decline is consistent with the ban being the cause; it does not weaken the conclusion.",
      irrelevant: "Diesel trucks cost less to operate than gasoline trucks that can carry the same loads.",
    },
    {
      scene: "ii-linden-music-math",
      target: "Grant's argument",
      text:
        "At Linden Middle School, students who took music lessons scored higher on math tests than students who did not. Education writer Paula Grant argues that learning music strengthens the mental skills used in mathematics, so the lessons themselves raised the students' math scores.",
      pattern: "scored higher on math tests than students who did not",
      claim: "the lessons themselves raised the students' math scores",
      key: "The students who took lessons already had higher math scores than their classmates before the lessons began.",
      supports: "Students' math scores rose steadily the longer they continued taking their music lessons.",
      neutral: "Students who took piano lessons and students who took violin lessons had similar math scores.",
      neutralReason: "Similar results across instruments are consistent with Grant's argument and do not weaken it.",
      irrelevant: "Many of the students who took music lessons also joined the school orchestra that year.",
    },
  ];

  const weakensClaim = {
    ...RW,
    id: "evidence-finding-weakens-causal-claim",
    skill: "Command of Evidence",
    subskill: "textual evidence",
    difficulty: "Hard",
    title: "Finding that would most directly weaken a causal claim",
    recognize:
      "The claim reads cause into a pattern; it is weakened most directly by the effect appearing without the cause, or by the groups differing before the cause arrived.",
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(WEAKEN_CLAIM_TOPICS);
      const wrong = [
        [topic.supports, "This would strengthen the claim, not weaken it."],
        [topic.neutral, topic.neutralReason],
        [topic.irrelevant, "This may be true, but it concerns a different question and leaves the causal claim untouched."],
      ];
      return mc("Hard", topic, {
        stimulus: passage(topic.text),
        stem: `Which finding, if true, would most directly weaken ${topic.target}?`,
        correct: topic.key,
        wrong,
        explanation:
          `The claim ("${topic.claim}") infers a cause from a pattern. It is weakened most directly by evidence that the effect occurred without that cause, or that something else accounts for it: ${topic.key}`,
        steps: [
          "State the claim as \"X caused Y\" and note the pattern it rests on.",
          "Ask what would show Y happening without X, or X's group already different.",
          "Choose that finding; reject findings that support the claim or leave it untouched.",
        ],
        principles: [
          "A before-and-after pattern supports a cause only if nothing else could explain the change.",
          "A comparison case in which the effect appears without the cause undercuts a causal claim directly.",
        ],
        trap: "Choosing a finding that sounds skeptical or technical but is actually consistent with the claim.",
        hint: "If the proposed cause were not responsible, what would you expect to see elsewhere?",
        verify: () =>
          topic.text.includes(topic.pattern) && topic.text.includes(topic.claim) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence: the quotation that illustrates both halves of  */
  /* a two-part claim                                                    */
  /* ------------------------------------------------------------------ */

  // The claim has two parts (`partA`, `partB`). The key shows both; `cues`
  // are the phrases in the key that show each part. Two distractors each
  // show one part vividly, and one concerns the subject but shows neither.
  const TWO_PART_QUOTATION_TOPICS = [
    {
      scene: "ii-q2-sea-beautiful-dangerous",
      work: "poem",
      text:
        "In a poem, the speaker reflects on the ocean beside the fishing village where she grew up. In the poem, the speaker portrays the sea as both beautiful and dangerous.",
      partA: "beautiful",
      partB: "dangerous",
      cues: ["green light that dances on the swell", "closed above the heads of better sailors"],
      key: "“The same green light that dances on the swell / has closed above the heads of better sailors.”",
      aOnly: "“At dawn the water blushes rose and gold, / and gulls ride shining on its gentle back.”",
      bOnly: "“Three boats went out in March and two came home; / the village keeps the third one in its prayers.”",
      neither: "“My mother mended nets beside the door / and hummed the tunes her mother used to hum.”",
    },
    {
      scene: "ii-q2-city-overwhelmed-fascinated",
      work: "story",
      text:
        "In a short story, a teenager named Dario moves from a small town to a large city. The story portrays Dario as both overwhelmed by the city's noise and fascinated by its variety.",
      partA: "overwhelmed by the city's noise",
      partB: "fascinated by its variety",
      cues: ["The horns and sirens made Dario's head ache", "could not stop turning to look"],
      key: "“The horns and sirens made Dario's head ache, yet he could not stop turning to look at every storefront he passed.”",
      aOnly: "“At night the traffic never stopped, and Dario lay awake for hours with his pillow folded tightly over both of his ears.”",
      bOnly: "“Dario spent his first Saturday riding the subway to the end of every line, just to see what was there.”",
      neither: "“His mother had found an apartment near her new job, three floors above a laundromat on Pike Street.”",
    },
    {
      scene: "ii-q2-house-affection-relief",
      work: "poem",
      text:
        "In a poem, the speaker describes an old family house that has recently been sold. The speaker expresses both affection for the house and relief at no longer having to care for it.",
      partA: "affection for the house",
      partB: "relief at no longer having to care for it",
      cues: ["I loved each crooked stair", "I will not / miss climbing them with buckets"],
      key: "“I loved each crooked stair, but I will not / miss climbing them with buckets when it rained.”",
      aOnly: "“The kitchen held the warmth of forty winters; / I knew its every creak the way I knew my name.”",
      bOnly: "“No more the gutters choked with autumn leaves, / no more the furnace groaning through the night.”",
      neither: "“The buyers are a couple from the city / who plan to paint the shutters blue by May.”",
    },
    {
      scene: "ii-q2-demanding-loyal-mentor",
      work: "story",
      text:
        "In a short story, a graduate student named Leila works in the laboratory of a famous chemist, Dr. Haas. The story portrays Dr. Haas as demanding of his students but also deeply loyal to them.",
      partA: "demanding of his students",
      partB: "deeply loyal to them",
      cues: ["covered in red ink three times", "argued for an hour with the editor"],
      key: "“Dr. Haas returned Leila's draft covered in red ink three times, then argued for an hour with the editor who rejected it.”",
      aOnly: "“Dr. Haas expected every experiment to be repeated at least five times before he would even glance at the results.”",
      bOnly: "“When a student's funding ran out, Dr. Haas quietly paid her rent out of his own pocket for the rest of the term.”",
      neither: "“The laboratory was on the top floor, and its tall windows looked out over the river, the rail yards, and the old mills.”",
    },
    {
      scene: "ii-q2-snow-peaceful-isolating",
      work: "poem",
      text:
        "In a poem, the speaker describes the first heavy snowfall of the winter in a small town. The speaker presents the snow as both peaceful and isolating.",
      partA: "peaceful",
      partB: "isolating",
      cues: ["The whole town hushes under white", "no voice but mine for miles around"],
      key: "“The whole town hushes under white, and I / can hear no voice but mine for miles around.”",
      aOnly: "“The snow comes down as softly as a sigh, / and every branch lies still beneath its weight.”",
      bOnly: "“The roads are closed; the telephone is dead; / the nearest neighbor's house has disappeared.”",
      neither: "“The children build their forts along the ditch / and pelt each other till their mittens freeze.”",
    },
    {
      scene: "ii-q2-inventor-aware-persistent",
      work: "story",
      text:
        "In a short story, an inventor named Hollis spends years building a flying machine that never leaves the ground. The story portrays Hollis as both aware of his repeated failures and unwilling to give up.",
      partA: "aware of his repeated failures",
      partB: "unwilling to give up",
      cues: ["entered the date of the ninth crash in his notebook", "began sketching a new wing"],
      key: "“Hollis entered the date of the ninth crash in his notebook, beneath the other eight, and began sketching a new wing.”",
      aOnly: "“Hollis knew that the townspeople laughed at him behind his back, and he knew perfectly well that they had every reason to.”",
      bOnly: "“Hollis worked in his barn every night that winter, long after the lamps in the other houses had gone out.”",
      neither: "“The machine's frame was made of ash wood and wire, covered with canvas that his sister had sewn.”",
    },
    {
      scene: "ii-q2-market-chaotic-welcoming",
      work: "poem",
      text:
        "In a poem, the speaker describes a crowded outdoor market in the city where she lives. The speaker portrays the market as both chaotic and welcoming.",
      partA: "chaotic",
      partB: "welcoming",
      cues: ["Through shouting, shoving, spilled and rolling fruit", "a dozen hands reach out to offer tastes"],
      key: "“Through shouting, shoving, spilled and rolling fruit, / a dozen hands reach out to offer tastes.”",
      aOnly: "“The carts collide, the vendors shout their prices, / and no one walks in anything resembling a line.”",
      bOnly: "“The baker knows my name and saves a loaf; / the flower seller always asks for news.”",
      neither: "“By nine the stalls are empty, and the square / is swept by men with brooms of bundled straw.”",
    },
    {
      scene: "ii-q2-sister-competitive-protective",
      work: "story",
      text:
        "In a short story, two sisters, Nora and Beth, compete against each other in a county spelling bee. The story portrays Nora as both competitive with her sister and protective of her.",
      partA: "competitive with her sister",
      partB: "protective of her",
      cues: ["Nora wanted badly to beat Beth", "glared at him until he looked away"],
      key: "“Nora wanted badly to beat Beth, but when a boy laughed at Beth's mistake, Nora glared at him until he looked away.”",
      aOnly: "“Nora studied the word list every night, determined that this year her own name, not Beth's, would be the last one called.”",
      bOnly: "“When Beth's hands began to shake before her turn, Nora squeezed them and whispered that she would be fine.”",
      neither: "“The gymnasium smelled of floor polish, and the judges sat at a folding table beneath the old scoreboard.”",
    },
    {
      scene: "ii-q2-river-fondness-sadness",
      work: "poem",
      text:
        "In a poem, the speaker returns to a river where he swam as a child. The speaker expresses both fondness for his memories of the river and sadness at how it has changed.",
      partA: "fondness for his memories of the river",
      partB: "sadness at how it has changed",
      cues: ["Here I once dove for stones in water clear as glass", "now weeds choke the shallows"],
      key: "“Here I once dove for stones in water clear as glass; / now weeds choke the shallows where the stones once lay.”",
      aOnly: "“I remember summers when we raced from bank to bank / and our laughter carried all the way to the mill.”",
      bOnly: "“A factory drains its gray water into the bend now, / and no one I know will swim there anymore.”",
      neither: "“The bridge was built in nineteen twelve / of stone cut from the quarry on the hill.”",
    },
    {
      scene: "ii-q2-teacher-strict-playful",
      work: "story",
      text:
        "In a short story, the narrator remembers a high school chemistry teacher, Mr. Lindqvist. The narrator portrays Mr. Lindqvist as both strict about safety and playful in his teaching.",
      partA: "strict about safety",
      partB: "playful in his teaching",
      cues: ["would not light a burner until every goggle was on", "ask us to guess the secret"],
      key: "“Mr. Lindqvist would not light a burner until every goggle was on, but then he'd turn the flame green and ask us to guess the secret.”",
      aOnly: "“Mr. Lindqvist sent a student out of the lab for removing his goggles for even a moment during an experiment.”",
      bOnly: "“Mr. Lindqvist began each class with a riddle about the elements and gave extra credit to whoever solved it first.”",
      neither: "“The chemistry lab was in the basement, and its shelves held jars of powders whose names I never learned.”",
    },
  ];

  const twoPartQuotation = {
    ...RW,
    id: "evidence-quotation-two-part-claim",
    skill: "Command of Evidence",
    subskill: "textual evidence",
    difficulty: "Hard",
    title: "Quotation that illustrates both halves of a two-part claim",
    recognize:
      "The claim joins two qualities with \"both ... and\"; two choices each show one half vividly, and only the answer shows both at once.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["too-narrow", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(TWO_PART_QUOTATION_TOPICS);
      const wrong = [
        [topic.aOnly, `This shows only the first part of the claim ("${topic.partA}") and nothing of the second.`],
        [topic.bOnly, `This shows only the second part of the claim ("${topic.partB}") and nothing of the first.`],
        [topic.neither, "This concerns the same subject but shows neither quality the claim names."],
      ];
      return mc("Hard", topic, {
        stimulus: passage(topic.text),
        stem: `Which quotation from the ${topic.work} most effectively illustrates the claim?`,
        correct: topic.key,
        wrong,
        explanation:
          `The claim has two parts: "${topic.partA}" and "${topic.partB}." The key shows the first ("${topic.cues[0]}") and the second ("${topic.cues[1]}"); each of the other strong-sounding choices shows only one.`,
        steps: [
          "Split the claim into its two parts.",
          "Mark which part, if any, each quotation shows.",
          "Choose the only quotation that shows both parts.",
        ],
        principles: [
          "Evidence for a two-part claim must support both parts.",
          "A vivid illustration of half a claim is still only half the evidence.",
        ],
        trap: "Choosing the most striking quotation, which illustrates only one half of the claim.",
        hint: "Check each quotation against both halves of the claim, separately.",
        verify: () =>
          topic.text.includes(topic.partA) &&
          topic.text.includes(topic.partB) &&
          topic.cues.every((cue) => topic.key.includes(cue)) &&
          wrong.every(([text]) => !topic.cues.some((cue) => text.includes(cue))) &&
          allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence (quantitative): a claim that a treatment helped  */
  /* more in one setting than another, which only a comparison of the    */
  /* two differences supports                                            */
  /* ------------------------------------------------------------------ */

  // Three settings, each measured with and without a treatment. The claim
  // is that the treatment's benefit was larger in setting A than in B.
  // Every choice is true. The key gives A's and B's four values; the others
  // give the same kind of data for A and the wrong setting, the treated
  // values alone (A is highest, which looks like support), or the untreated
  // values alone.
  const BENEFIT_TOPICS = [
    {
      scene: "ii-tq3-compost-soils",
      person: "Agronomist Beatriz Salgado",
      surname: "Salgado",
      intro: "grew tomatoes in plots of three soil types, adding compost to half of the plots of each type, and recorded the average yield per plot",
      headers: ["Soil type", "Without compost (kg)", "With compost (kg)"],
      settings: [["Clay", "in clay"], ["Loam", "in loam"], ["Sand", "in sand"]],
      factor: "compost",
      pronoun: "it",
      measure: "the average yield",
      unit: " kg",
      base: [30, 44],
      scale: 1,
    },
    {
      scene: "ii-tq3-tutoring-schools",
      person: "Education researcher Kwame Boateng",
      surname: "Boateng",
      intro: "compared end-of-year math scores at three schools for students who did and did not attend an after-school tutoring program",
      headers: ["School", "Without tutoring", "With tutoring"],
      settings: [["Adams", "at Adams"], ["Baker", "at Baker"], ["Carver", "at Carver"]],
      factor: "tutoring",
      pronoun: "it",
      measure: "the average score",
      unit: "",
      base: [60, 72],
      scale: 1,
    },
    {
      scene: "ii-tq3-drip-irrigation",
      person: "Horticulturist Aiko Tanaka",
      surname: "Tanaka",
      intro: "grew three crops with and without drip irrigation and recorded the average harvest per plant, in grams",
      headers: ["Crop", "Without drip irrigation (g)", "With drip irrigation (g)"],
      settings: [["Tomatoes", "for tomatoes"], ["Peppers", "for peppers"], ["Beans", "for beans"]],
      factor: "drip irrigation",
      pronoun: "it",
      measure: "the average harvest",
      unit: " g",
      base: [40, 56],
      scale: 10,
    },
    {
      scene: "ii-tq3-reminder-app",
      person: "Pharmacist Elena Petrova",
      surname: "Petrova",
      intro: "tracked the percentage of medication doses taken on time by patients in three age groups who did and did not use a reminder app",
      headers: ["Age group", "Without app (%)", "With app (%)"],
      settings: [["18 to 34", "for ages 18 to 34"], ["35 to 54", "for ages 35 to 54"], ["55 and older", "for ages 55 and up"]],
      factor: "the app",
      pronoun: "it",
      measure: "the share of doses taken on time",
      unit: "%",
      base: [55, 68],
      scale: 1,
    },
    {
      scene: "ii-tq3-orchard-mulch",
      person: "Soil scientist Grant Oduya",
      surname: "Oduya",
      intro: "measured midsummer soil moisture under trees with and without mulch in three orchards",
      headers: ["Orchard", "Without mulch (%)", "With mulch (%)"],
      settings: [["Hillside", "in the hillside orchard"], ["Terrace", "in the terrace orchard"], ["Valley", "in the valley orchard"]],
      factor: "mulch",
      pronoun: "it",
      measure: "soil moisture",
      unit: "%",
      base: [12, 20],
      scale: 1,
    },
    {
      scene: "ii-tq3-wildflower-strips",
      person: "Entomologist Sofia Marquez",
      surname: "Marquez",
      intro: "counted pumpkins per plot on three farms in fields with and without strips of wildflowers planted beside them to attract pollinators",
      headers: ["Farm", "Without wildflower strips", "With wildflower strips"],
      settings: [["Ash Farm", "on Ash Farm"], ["Birch Farm", "on Birch Farm"], ["Cedar Farm", "on Cedar Farm"]],
      factor: "wildflower strips",
      pronoun: "them",
      measure: "the number of pumpkins per plot",
      unit: "",
      base: [20, 32],
      scale: 1,
    },
    {
      scene: "ii-tq3-peer-feedback",
      person: "Teacher Marcus Hale",
      surname: "Hale",
      intro: "compared average essay scores, out of 100, for students in three grades who did and did not receive feedback on drafts from classmates",
      headers: ["Grade", "Without peer feedback", "With peer feedback"],
      settings: [["Grade 9", "in grade 9"], ["Grade 10", "in grade 10"], ["Grade 11", "in grade 11"]],
      factor: "peer feedback",
      pronoun: "it",
      measure: "the average essay score",
      unit: "",
      base: [60, 72],
      scale: 1,
    },
    {
      scene: "ii-tq3-seed-coating",
      person: "Botanist Irene Lowe",
      surname: "Lowe",
      intro: "planted clover seeds with and without a new protective coating in three types of soil and recorded the percentage that germinated",
      headers: ["Soil", "Without coating (%)", "With coating (%)"],
      settings: [["Silt", "in silt"], ["Peat", "in peat"], ["Gravel", "in gravel"]],
      factor: "the coating",
      pronoun: "it",
      measure: "the germination rate",
      unit: "%",
      base: [48, 62],
      scale: 1,
    },
    {
      scene: "ii-tq3-bus-lanes",
      person: "Transit analyst Leo Brandt",
      surname: "Brandt",
      intro: "measured average bus speeds, in kilometers per hour, on stretches of three routes with and without dedicated bus lanes",
      headers: ["Route", "Without bus lane (km/h)", "With bus lane (km/h)"],
      settings: [["Route 2", "on Route 2"], ["Route 5", "on Route 5"], ["Route 8", "on Route 8"]],
      factor: "a bus lane",
      pronoun: "one",
      measure: "the average speed",
      unit: " km/h",
      base: [12, 18],
      scale: 1,
    },
    {
      scene: "ii-tq3-shade-coffee-birds",
      person: "Ecologist Paula Nuñez",
      surname: "Nuñez",
      intro: "counted bird species on plots of coffee grown with and without shade trees at three farms at different elevations",
      headers: ["Farm", "Without shade trees", "With shade trees"],
      settings: [["Lowland", "at the lowland farm"], ["Midland", "at the midland farm"], ["Upland", "at the upland farm"]],
      factor: "shade trees",
      pronoun: "them",
      measure: "the number of bird species",
      unit: "",
      base: [10, 18],
      scale: 1,
    },
  ];

  const benefitDifference = {
    ...RW,
    id: "quantitative-table-difference-in-benefit",
    skill: "Command of Evidence",
    subskill: "quantitative evidence",
    difficulty: "Hard",
    title: "Data showing a treatment helped more in one setting than another",
    recognize:
      "The claim compares two improvements, so the evidence must give both settings' values with and without the treatment; a high treated value alone, or the right comparison for the wrong setting, does not support it.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["true-but-irrelevant", "wrong-quantity"],
    build(t) {
      const topic = t.pick(BENEFIT_TOPICS);
      const [A, B, C] = t.shuffle(topic.settings.slice());
      const k = topic.scale;
      // Untreated B above untreated A; B's benefit small; A's benefit large
      // enough that treated A also tops treated B; C in between.
      const uA = t.int(topic.base[0], topic.base[1]) * k;
      const uB = uA + t.int(2, 6) * k;
      const dB = t.int(2, 6) * k;
      const dA = dB + (uB - uA) + t.int(3, 8) * k;
      const uC = uA + t.int(-3, 1) * k;
      const dC = t.int(2, 5) * k;
      const value = {
        [A[0]]: [uA, uA + dA],
        [B[0]]: [uB, uB + dB],
        [C[0]]: [uC, uC + dC],
      };
      const show = (v) => `${fmt(v)}${topic.unit}`;
      const showGain = (d) => (topic.unit === "%" ? `${fmt(d)} percentage points` : show(d));
      const table = S.table(topic.headers, topic.settings.map(([label]) => [label, fmt(value[label][0]), fmt(value[label][1])]));
      const claim = `${topic.surname} claims that ${topic.factor} raised ${topic.measure} more ${A[1]} than ${B[1]}.`;
      const content = `${table}\n\n${topic.person} ${topic.intro}. ${claim}`;
      const both = (X, Y) =>
        `With ${topic.factor}, ${topic.measure} was ${show(value[X[0]][1])} ${X[1]} and ${show(value[Y[0]][1])} ${Y[1]}; without ${topic.pronoun}, ${show(value[X[0]][0])} and ${show(value[Y[0]][0])}.`;
      const correct = both(A, B);
      const wrong = [
        [both(A, C), `True, but it compares the gains for ${A[0]} and ${C[0]}, not for the two settings the claim names (${A[0]} and ${B[0]}).`],
        [`With ${topic.factor}, ${topic.measure} was ${show(value[A[0]][1])} ${A[1]}, higher than ${show(value[B[0]][1])} ${B[1]} or ${show(value[C[0]][1])} ${C[1]}.`,
          "True, but a high value with the treatment does not show a large improvement; the values without it are needed too."],
        [`Without ${topic.factor}, ${topic.measure} was ${show(value[B[0]][0])} ${B[1]} but only ${show(value[A[0]][0])} ${A[1]}.`,
          "True, but these starting values alone say nothing about how much the treatment helped in either setting."],
      ];
      return mc("Hard", topic, {
        stimulus: { type: "table", content },
        stem: `Which choice most effectively uses data from the table to support ${topic.surname}'s claim?`,
        correct,
        wrong,
        explanation:
          `The claim compares two improvements. ${cap1(A[1])}, ${topic.factor} raised ${topic.measure} by ${showGain(dA)}; ${B[1]}, by only ${showGain(dB)}. Only the choice giving both settings' values with and without ${topic.factor} shows this: ${correct}`,
        steps: [
          "Recognize that the claim is about the size of an improvement in two named settings.",
          "For each named setting, the improvement is the value with the treatment minus the value without it.",
          "Choose the statement that gives all four values for those two settings, and check that the first improvement is larger.",
        ],
        principles: [
          "\"Helped more\" is a comparison of differences, not of final values.",
          "Data about the right comparison in the wrong setting does not support a claim about a specific setting.",
        ],
        trap: "Choosing the statement that the treated value was highest in the first setting, which ignores where each setting started.",
        hint: "How much did the treatment change the value in each of the two settings the claim names?",
        verify: () => {
          const { rows } = readTable(content);
          const row = (label) => rows.find((r) => r[0] === label);
          const gain = (label) => row(label)[2] - row(label)[1];
          return (
            gain(A[0]) > gain(B[0]) &&
            gain(A[0]) > gain(C[0]) &&
            row(A[0])[2] > row(B[0])[2] && row(A[0])[2] > row(C[0])[2] &&
            row(B[0])[1] > row(A[0])[1] &&
            [row(A[0])[1], row(A[0])[2], row(B[0])[1], row(B[0])[2]].every((v) => correct.includes(show(v))) &&
            allDistinct(correct, wrong)
          );
        },
      });
    },
  };

  return [
    quotationTrait,
    extremeValue,
    supportsMechanism,
    groupChange,
    counterexample,
    weakensClaim,
    twoPartQuotation,
    benefitDifference,
  ];
});
