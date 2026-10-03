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

  // `count` grid values in [low, high], sorted ascending, with every gap
  // between neighbours at least `minGap` (plus one grid step, so snapping to
  // the grid cannot close a gap below it). Gaps are drawn as a random split
  // of the slack, so the values are spread without rejection sampling.
  function spacedSorted(t, count, low, high, step, minGap) {
    const gap = minGap + step;
    const slack = high - low - gap * (count - 1);
    if (slack < 0) throw new Error("spacedSorted: range too small");
    const cuts = Array.from({ length: count }, () => t.random() * slack).sort((p, q) => p - q);
    const snap = (value) => Math.round(Math.round((value - low) / step) * step * 1e6) / 1e6 + low;
    return cuts.map((cut, index) => Math.min(high, snap(low + cut + index * gap)));
  }

  // Draws a template's choices (each worded at random by `draw`) until the
  // key's length rank among the four matches a rank picked uniformly first,
  // so the key is the longest choice about a quarter of the time and the
  // shortest about a quarter, and length carries no information. A draw in
  // which the three distractors share an opening word the key lacks is
  // never used, so the key is never the odd one out in form. `draw` returns
  // { correct, wrong } and may itself reject a draw by returning null.
  function balancedDraw(t, draw, tries = 40) {
    const target = t.int(0, 3);
    const opening = (text) => text.split(" ")[0].toLowerCase();
    let fallback = null;
    for (let attempt = 0; attempt < tries + 300; attempt += 1) {
      if (attempt >= tries && fallback) break;
      const drawn = draw();
      if (!drawn) continue;
      const openers = drawn.wrong.slice(0, 3).map(([text]) => opening(text));
      if (new Set(openers).size === 1 && openers[0] !== opening(drawn.correct)) continue;
      fallback = fallback || drawn;
      const key = drawn.correct.length;
      const lengths = drawn.wrong.slice(0, 3).map(([text]) => text.length);
      const shorter = lengths.filter((length) => length < key).length;
      const ties = lengths.filter((length) => length === key).length;
      if (attempt < tries && shorter === target && !ties) return drawn;
    }
    if (!fallback) throw new Error("balancedDraw: no usable draw");
    return fallback;
  }

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
      key: "“When the Pruitt boy came in short of money for wire, Grandpa rang up half the price and told him to forget the rest.”",
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
      assoc: "“The school's telescope was a modest instrument, older than the students who crowded around it.”",
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
      rows: ["Barn hive", "Orchard hive", "Creek hive", "Meadow hive"],
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
      a: { low: 70, high: 120, step: 1, say: (row, v) => `${row}, whose plants grew to an average height of ${v} cm` },
      b: { low: 3, high: 7.9, step: 0.1, say: (row, v) => `${row}, which yielded ${v} tons per hectare` },
      extreme: "highest",
      statement: "According to the table, the variety with the greatest grain yield was ______.",
    },
    {
      scene: "ii-tq-market-shoppers",
      intro: "A county survey recorded the number of vendors at four farmers markets and the average number of shoppers each market drew per week.",
      headers: ["Market", "Vendors", "Average weekly shoppers"],
      rows: ["Ashby", "Brookside", "Carver Square", "Delmont"],
      a: { low: 12, high: 60, step: 1, say: (row, v) => `${row}, where a total of ${v} vendors sold their goods` },
      b: { low: 400, high: 2400, step: 10, say: (row, v) => `${row}, which drew an average of ${v} shoppers` },
      extreme: "lowest",
      statement: "According to the table, the market that drew the fewest shoppers per week was ______.",
    },
    {
      scene: "ii-tq-exhibit-visits",
      intro: "A museum compared four of its temporary exhibits, recording how many objects each displayed and how many minutes visitors spent in each, on average.",
      headers: ["Exhibit", "Objects displayed", "Average visit (minutes)"],
      rows: ["Ancient Coins", "Arctic Journeys", "Glass and Light", "Paper Kites"],
      a: { low: 40, high: 220, step: 1, say: (row, v) => `${row}, which put a total of ${v} objects on display` },
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
      key: "In full sun, white-shelled snails stay several degrees cooler than dark-shelled snails do.",
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
      key: "Young valley trees bent by hand each day grow shorter and thicker than trees left unbent.",
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
      contrary: "Ants keep walking along the path normally after a section of it is wiped with a chemical solvent.",
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
      key: "Pink-flowering hydrangeas begin to produce blue flowers within a season after aluminum is added to their soil.",
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
      claim: "claims that ridership on Route 9 rose substantially between 2019 and 2023",
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
      claim: "argues that Lakeside Middle School's recycling rate increased sharply between 2018 and 2022",
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
      claim: "claims that the number of herons at Otter Slough grew substantially between 2012 and 2022",
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
      claim: "claims that blight declined substantially in River Orchard between 2018 and 2022",
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
      claim: "claims that the number of library cardholders per 1,000 residents in Northgate increased substantially between 2015 and 2020",
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
      claim: "argues that fine-particle pollution downtown dropped substantially between 2016 and 2021",
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
      claim: "claims that enrollment in Korean at the college increased substantially between 2012 and 2022",
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
      claim: "argues that coral cover in the reef's shallow zone declined substantially between 2014 and 2019",
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
      claim: "claims that bicycle commuting in Brenton grew substantially between 2008 and 2018",
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
      claim: "claims that waiting times at Clinic B fell substantially between 2019 and 2022",
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
    difficulty: "Easy",
    title: "Data supporting a claim about one group's change over time",
    recognize:
      "The claim is about a change for one group, so the evidence must give that group's values in both years; every other choice is true but answers a different comparison.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
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
      const name = topic.name || ((g) => g);
      const verb = rose ? "rose" : "fell";
      // A group's change, in one of two wordings. The key's wording is drawn;
      // the other group's change always takes the other wording, so the two
      // changes are not the closest pair of choices by construction.
      const change = (g, v1, v2, plain) => (plain
        ? `${cap1(topic.of(g))} ${verb} from ${say(v1)} in ${y1} to ${say(v2)} in ${y2}.`
        : `In ${y1}, ${topic.of(g)} was ${say(v1)}; by ${y2}, it had ${rose ? "risen" : "fallen"} to ${say(v2)}.`);
      const higher = rose ? "higher" : "lower";
      // Every choice is drawn in one of two wordings (see balancedDraw).
      const { correct, wrong } = balancedDraw(t, () => {
        const plain = t.chance(0.5);
        const correct = change(topic.focus, g1, g2, plain);
        // The cross-year comparison names the claim's group and both years,
        // as the key does, but sets that group against a different one.
        const crossed = [
          t.chance(0.5)
            ? `In ${y2}, ${name(topic.focus)}'s ${topic.measure} (${say(g2)}) was ${higher} than ${name(h)}'s figure for ${y1} (${say(h1)}).`
            : `${cap1(name(topic.focus))}'s ${y2} figure (${say(g2)}) was ${higher} than ${name(h)}'s ${y1} figure (${say(h1)}).`,
          `True, but this sets ${topic.focus} in ${y2} against ${h} in ${y1}; it does not compare ${topic.focus} with itself over time.`,
        ];
        // Two of these join it. The one-year comparisons come in a matched
        // pair (the same sentence for each year), so the two closest choices
        // are often two distractors rather than the key and its neighbour.
        const early = t.chance(0.5);
        const sameYear = (y) => (early
          ? `In ${y}, ${name(topic.focus)} had a ${higher} ${topic.measure} than ${name(h)} did.`
          : `${cap1(name(topic.focus))} had a ${higher} ${topic.measure} than ${name(h)} did in ${y}.`);
        const ranking = [t.chance(0.5)
          ? `In ${y2}, ${name(topic.focus)} had the ${rose ? "highest" : "lowest"} ${topic.measure} of the three ${topic.plural}.`
          : `Of the three ${topic.plural}, ${name(topic.focus)} had the ${rose ? "highest" : "lowest"} ${topic.measure} in ${y2}.`,
          `True, but a ${y2} ranking says nothing about how ${topic.focus} changed since ${y1}.`];
        const other = [change(h, h1, h2, !plain),
          `True, but this describes ${h}, not ${topic.focus}, the group the claim is about.`];
        const first = [sameYear(y1), `True, but comparing two groups in ${y1} says nothing about change over time.`];
        const second = [sameYear(y2), `True, but comparing two groups in ${y2} says nothing about how ${topic.focus} changed since ${y1}.`];
        const optional = t.pick([[ranking, first], [other, first], [first, second], [other, second]]);
        return { correct, wrong: [crossed, ...optional] };
      });
      return mc("Easy", topic, {
        stimulus: { type: "table", content },
        stem: `Which choice most effectively uses data from the table to support ${topic.surname}'s claim?`,
        correct,
        wrong,
        explanation:
          `The claim is that ${topic.focus} changed substantially between ${y1} and ${y2}. Only a choice giving ${topic.focus}'s own values in both years shows that change: ${correct}`,
        steps: [
          "Identify the group and the kind of comparison the claim makes (a change over time).",
          "Find that group's values in both years.",
          "Choose the statement that reports that change; true statements about other comparisons do not support the claim.",
        ],
        principles: [
          "Evidence for a change needs values at two times for the same group.",
          "Every choice in a data question may be true; the question is which one supports this claim.",
        ],
        trap: "Choosing a true statement that names the right group and both years but compares that group with a different one.",
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
            sign * (f2 - o1) > 0 &&
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
      y: { header: "Average walking speed (m/s)", name: "the average walking speed", low: 1.0, high: 1.8, step: 0.01 },
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
      // Neighbouring values differ by at least a tenth of the column's range,
      // so the reversal is plain to see (never 1.15 against 1.14).
      const span = topic.y.high - topic.y.low;
      const sorted = spacedSorted(t, 5, topic.y.low, topic.y.high, topic.y.step, span * 0.1);
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
      // Each comparison is worded from either end ("lower at A than at B" or
      // "higher at B than at A"), drawn per choice, so "higher" and "lower"
      // never mark which choices run against the hypothesis.
      const compare = (series, name, decimals, i, j) => {
        if (t.chance(0.35)) {
          const [from, to] = i < j ? [i, j] : [j, i];
          const verb = series[to] > series[from] ? "rose" : "fell";
          return `${cap1(name)} ${verb} from ${fmt(series[from], decimals)} ${topic.x.at(levels[from])} to ${fmt(series[to], decimals)} ${topic.x.at(levels[to])}.`;
        }
        const [first, second] = t.chance(0.5) ? [i, j] : [j, i];
        const word = series[first] > series[second] ? "higher" : "lower";
        return `${cap1(name)} was ${word} ${topic.x.at(levels[first])} (${fmt(series[first], decimals)}) than ${topic.x.at(levels[second])} (${fmt(series[second], decimals)}).`;
      };
      const others = [1, 2, 3, 4].filter((j) => j !== k);
      const j = t.pick(others);
      const { correct, wrong } = balancedDraw(t, () => ({
        correct: compare(y, topic.y.name, yd, k, k - 1),
        wrong: [
          [compare(z, topic.z.name, zd, k, k - 1),
            `True, but this concerns ${topic.z.name}, which the hypothesis says nothing about.`],
          [compare(y, topic.y.name, yd, 4, 0),
            "True, but this comparison fits the hypothesis, so it supports rather than weakens it."],
          [compare(y, topic.y.name, yd, j, j - 1),
            "True, but this pair of rows moves the way the hypothesis predicts, so it supports the hypothesis."],
        ],
      }));
      return mc("Medium", topic, {
        stimulus: { type: "table", content },
        stem: `Which choice best describes data from the table that weaken ${topic.surname}'s hypothesis?`,
        correct,
        wrong,
        explanation:
          `The hypothesis predicts that ${topic.y.name} will be ${along} at each successive row of the table. From the ${fmt(levels[k - 1])} row to the ${fmt(levels[k])} row it is ${against} instead, which runs against the prediction: ${correct}`,
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
            Math.abs(ys[k] - ys[k - 1]) >= span * 0.1 &&
            fits(ys[0], ys[4]) && fits(ys[j - 1], ys[j]) &&
            !fits(zs[k - 1], zs[k]) &&
            correct.includes(fmt(ys[k], yd)) && correct.includes(fmt(ys[k - 1], yd)) &&
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
      key: "Corn bunting numbers had already fallen by half before most farmers in the region began sowing in autumn.",
      supports: "Corn buntings nesting in autumn-sown fields raised far fewer chicks than those nesting in spring-sown fields.",
      neutral: "On most farms, corn bunting numbers began to fall within a year or two after the switch to autumn sowing.",
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
      key: "Attendance rose by a similar share in those same years at a nearby museum that kept charging its usual fee.",
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
      key: "Annual phosphorus input to Lake Maren has not increased since 2005, even as blooms grew.",
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
      neutral: "Late arrivals fell by a similar amount among older and younger students after the change.",
      neutralReason: "A drop across every age group is what the later start would be expected to produce, so this is consistent with Moreau's argument.",
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
      neutral: "The beach at Porth Aven has lost roughly the same amount of sand in every year since the wall was built.",
      neutralReason: "Steady loss after the wall went up is the pattern the argument rests on, so this fits it rather than weakening it.",
      irrelevant: "The seawall has protected the town's buildings from flooding during every major storm since 2008.",
    },
    {
      scene: "ii-roman-lead-elite",
      target: "the historians' argument",
      text:
        "Some historians have argued that lead poisoning contributed to the decline of the Roman elite. Wealthy Romans, they note, drank water carried through lead pipes and sweetened their wine with a syrup boiled down in lead pots, and ancient writers described ailments among the elite, such as gout, that can result from lead poisoning.",
      pattern: "drank water carried through lead pipes",
      claim: "lead poisoning contributed to the decline of the Roman elite",
      key: "Remains show that wealthy Romans' lead exposure was too low to produce the cited ailments.",
      supports: "Lead levels in the bones of wealthy Romans rose over the same centuries in which the elite declined.",
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
      key: "In 2016 Millbrook also stopped charging a fee to register a business, a fee that many existing owners had avoided.",
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
      neutral: "Downtown asthma visits fell by about the same share among younger children as among teenagers.",
      neutralReason: "A decline shared by every age group is consistent with cleaner downtown air, so this does not weaken the conclusion.",
      irrelevant: "Diesel trucks cost less to operate than gasoline trucks that can carry the same loads.",
    },
    {
      scene: "ii-linden-music-math",
      target: "Grant's argument",
      text:
        "At Linden Middle School, students who took music lessons scored higher on math tests than students who did not. Education writer Paula Grant argues that learning music strengthens the mental skills used in mathematics, so the lessons themselves raised the students' math scores.",
      pattern: "scored higher on math tests than students who did not",
      claim: "the lessons themselves raised the students' math scores",
      key: "Students taking music had higher math scores than their classmates before lessons began.",
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
    difficulty: "Medium",
    title: "Finding that would most directly weaken a causal claim",
    recognize:
      "The claim reads cause into a pattern; it is weakened most directly by the effect appearing without the cause, before the cause, or through another route, or by the groups differing before the cause arrived.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["opposite-stance", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(WEAKEN_CLAIM_TOPICS);
      const wrong = [
        [topic.supports, "This would strengthen the claim, not weaken it."],
        [topic.neutral, topic.neutralReason],
        [topic.irrelevant, "This may be true, but it concerns a different question and leaves the causal claim untouched."],
      ];
      return mc("Medium", topic, {
        stimulus: passage(topic.text),
        stem: `Which finding, if true, would most directly weaken ${topic.target}?`,
        correct: topic.key,
        wrong,
        explanation:
          `The claim ("${topic.claim}") infers a cause from a pattern. It is weakened most directly by evidence that the effect occurred without that cause or before it, or that something else accounts for it: ${topic.key}`,
        steps: [
          "State the claim as \"X caused Y\" and note the pattern it rests on.",
          "Ask what would show Y happening without X or before X, or something other than X producing Y.",
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
      cues: ["green light dancing on the swell", "closed above better sailors' heads"],
      key: "“The green light dancing on the swell / has closed above better sailors' heads.”",
      aOnly: "“At dawn the water blushes rose and gold, / and gulls ride shining on its gentle, rolling back.”",
      bOnly: "“Three boats went out in March and two came home; / the village keeps the third one in its prayers.”",
      neither: "“The harbor lamps lead every sailor home; / their steady rows lie gold upon the foam.”",
      neitherReason: "The gold lights offer beauty and guidance, but the lines supply no danger.",
    },
    {
      scene: "ii-q2-city-overwhelmed-fascinated",
      work: "story",
      text:
        "In a short story, a teenager named Dario moves from a small town to a large city. The story portrays Dario as both overwhelmed by the city's noise and fascinated by its variety.",
      partA: "overwhelmed by the city's noise",
      partB: "fascinated by its variety",
      cues: ["palms over his ears","stopping nonetheless at each unfamiliar doorway"],
      key: "“Dario walked with his palms over his ears, stopping nonetheless at each unfamiliar doorway until his mother had to call him back.”",
      aOnly: "“Dario tried to read on the fire escape, but the drilling and the horns below drove him back inside within minutes.”",
      bOnly: "“Dario spent his first Saturday riding the subway to the end of every line, just to see what was there.”",
      neither: "“Dario followed his mother past the unfamiliar doorways, keeping his eyes on her coat and counting the blocks until they reached home.”",
      neitherReason: "Following his mother and counting blocks do not show either sensitivity to noise or curiosity about the city’s variety.",
    },
    {
      scene: "ii-q2-house-affection-relief",
      work: "poem",
      text:
        "In a poem, the speaker describes an old family house that has recently been sold. The speaker expresses both affection for the house and relief at no longer having to care for it.",
      partA: "affection for the house",
      partB: "relief at no longer having to care for it",
      cues: ["took the worn brass knocker for my shelf","slept through rain without a bucket"],
      key: "“I took the worn brass knocker for my shelf / and slept through rain without a bucket by the bed.”",
      aOnly: "“The kitchen held the warmth of forty winters; / I knew its every creak the way I knew my name.”",
      bOnly: "“No more the gutters choked with autumn leaves, / no more the furnace groaning through the night.”",
      neither: "“I left the brass knocker shining on the door / and checked the roof again before the buyers came.”",
      neitherReason: "Preparing the house for its buyers need not show affection or relief from its demands.",
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
      aOnly: "“Dr. Haas expected every experiment to be repeated five times; anything less, he told Leila, was a rumor, not a result.”",
      bOnly: "“When a student's funding ran out, Dr. Haas quietly paid her rent out of his own pocket for the rest of the term.”",
      neither: "“Dr. Haas defended the laboratory’s reputation at the meeting, then told Leila that her failed experiment was her own affair.”",
      neitherReason: "Defending the laboratory’s reputation is not loyalty to Leila; dismissing her problem does not establish demanding instruction.",
    },
    {
      scene: "ii-q2-snow-peaceful-isolating",
      work: "poem",
      text:
        "In a poem, the speaker describes the first heavy snowfall of the winter in a small town. The speaker presents the snow as both peaceful and isolating.",
      partA: "peaceful",
      partB: "isolating",
      cues: ["No engines trouble the white afternoon","path to your door has vanished"],
      key: "“No engines trouble the white afternoon; / the path to your door has vanished with the road.”",
      aOnly: "“The snow comes down as softly as a sigh, / and every branch lies still beneath its weight.”",
      bOnly: "“The roads are closed; the telephone is dead; / the nearest neighbor's house has disappeared.”",
      neither: "“Our neighbors gather by the stranded bus, / their voices carrying across the crusted snow.”",
      neitherReason: "The stranded bus suggests disruption, while gathered neighbors suggest contact rather than peaceful isolation.",
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
      bOnly: "“The lamps in the other houses went out one by one, yet Hollis worked on in his barn every night that winter.”",
      neither: "“Hollis displayed the bent wing above his bench and told each visitor the machine would have flown if the wind had held.”",
      neitherReason: "Excusing the failure is not acknowledging it, and displaying the wing does not show renewed work.",
    },
    {
      scene: "ii-q2-market-chaotic-welcoming",
      work: "poem",
      text:
        "In a poem, the speaker describes a crowded outdoor market in the city where she lives. The speaker portrays the busy market as both chaotic and welcoming.",
      partA: "chaotic",
      partB: "welcoming",
      cues: ["Through shouting, shoving, spilled and rolling fruit", "a dozen hands reach out to offer tastes"],
      key: "“Through shouting, shoving, spilled and rolling fruit, / a dozen hands reach out to offer tastes.”",
      aOnly: "“The carts collide, the vendors bellow out their prices, / and no one walks in anything resembling a line.”",
      bOnly: "“The baker knows my name and saves a loaf; / the flower seller always stops to ask for news.”",
      neither: "“At dawn the vendors call across the square; / I pass their lowered shutters on my way.”",
      neitherReason: "Calling across a square with lowered shutters does not establish disorder or an invitation to the speaker.",
    },
    {
      scene: "ii-q2-sister-competitive-protective",
      work: "story",
      text:
        "In a short story, two sisters, Nora and Beth, compete against each other in a county spelling bee. The story portrays Nora as both competitive with her sister and protective of her.",
      partA: "competitive with her sister",
      partB: "protective of her",
      cues: ["covered her practice cards","took the chair between Beth and the boys"],
      key: "“Nora covered her practice cards when Beth leaned over, then took the chair between Beth and the boys mimicking her stammer.”",
      aOnly: "“Each time Beth spelled another word, Nora pressed her pencil harder against her own tally, until its point snapped in two.”",
      bOnly: "“At Beth’s first hesitation Nora began applauding, loudly enough to drown out the chuckles from the row behind her sister.”",
      neither: "“Beth kept her practice cards hidden from Nora, who watched the boys copying Beth’s stammer and said nothing to stop them.”",
      neitherReason: "Beth, rather than Nora, withholds her preparation; Nora’s silence also supplies no protection against the mockery.",
    },
    {
      scene: "ii-q2-river-fondness-sadness",
      work: "poem",
      text:
        "In a poem, the speaker returns to a river where he swam as a child. The speaker expresses both fondness for his memories of the river and sadness at how it has changed.",
      partA: "fondness for his memories of the river",
      partB: "sadness at how it has changed",
      cues: ["still can name the stones we made our islands","above the water’s oily skin"],
      key: "“I still can name the stones we made our islands; / I mouth their names above the water’s oily skin.”",
      aOnly: "“I remember summers when we raced from bank to bank / and our laughter carried all the way to the mill.”",
      bOnly: "“A factory drains its gray water into the bend now, / and no one I know will swim there anymore.”",
      neither: "“The children name the stones beyond the bridge; / I hurry past before their game is done.”",
      neitherReason: "The children’s game does not establish the speaker’s own cherished memories or sadness at a change.",
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
      aOnly: "“Mr. Lindqvist let us choose our own lab partners, but he sent a student out for removing his goggles even for a moment.”",
      bOnly: "“Mr. Lindqvist began each class with a riddle about the elements and gave extra credit to whoever solved it first.”",
      neither: "“Mr. Lindqvist made a joke of my cracked goggles, then waved me toward a burner while he finished setting out the jars.”",
      neitherReason: "The joke may be playful, but allowing cracked goggles near a burner contradicts strict safety.",
    },
  ];

  const twoPartQuotation = {
    ...RW,
    id: "evidence-quotation-two-part-claim",
    skill: "Command of Evidence",
    subskill: "textual evidence",
    difficulty: "Medium",
    title: "Quotation that illustrates both halves of a two-part claim",
    recognize:
      "The claim joins two qualities with \"both ... and\"; two choices each show one half vividly, and only the answer shows both at once.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["too-narrow", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(TWO_PART_QUOTATION_TOPICS);
      const wrong = [
        [topic.aOnly, `This shows only the first part of the claim ("${topic.partA}") and nothing of the second.`],
        [topic.bOnly, `This shows only the second part of the claim ("${topic.partB}") and nothing of the first.`],
        [topic.neither, topic.neitherReason || "This concerns the same subject but does not establish both qualities the claim names."],
      ];
      return mc("Medium", topic, {
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
  // Every choice is true. The key gives A's and B's four values; two others
  // give the same kind of data for the wrong pairs (A and C, C and B), and
  // the last gives A's treated value against the untreated values, the
  // treated values alone (A is highest, which looks like support), or the
  // untreated values alone.
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
    difficulty: "Medium",
    title: "Data showing a treatment helped more in one setting than another",
    recognize:
      "The claim compares two improvements, so the evidence must give both settings' values with and without the treatment; a high treated value alone, a treated value set against an untreated one, or the right comparison for the wrong setting does not support it.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
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
      // Both settings' values with and without the treatment, in one of two
      // wordings drawn per choice.
      const both = (X, Y, listed = t.chance(0.5)) => (listed
        ? `With ${topic.factor}, ${topic.measure} was ${show(value[X[0]][1])} ${X[1]} and ${show(value[Y[0]][1])} ${Y[1]}; without ${topic.pronoun}, ${show(value[X[0]][0])} and ${show(value[Y[0]][0])}.`
        : `${cap1(X[1])}, ${topic.measure} went from ${show(value[X[0]][0])} without ${topic.factor} to ${show(value[X[0]][1])} with ${topic.pronoun}; ${Y[1]}, from ${show(value[Y[0]][0])} to ${show(value[Y[0]][1])}.`);
      const treated = () => [`With ${topic.factor}, ${topic.measure} was ${show(value[A[0]][1])} ${A[1]}, higher than ${show(value[B[0]][1])} ${B[1]} or ${show(value[C[0]][1])} ${C[1]}.`,
        "True, but a high value with the treatment does not show a large improvement; the values without it are needed too."];
      const untreated = () => [`Without ${topic.factor}, ${topic.measure} was ${show(value[A[0]][0])} ${A[1]}, ${show(value[B[0]][0])} ${B[1]}, and ${show(value[C[0]][0])} ${C[1]}.`,
        "True, but these starting values alone say nothing about how much the treatment helped in either setting."];
      // Names the claim's settings and both conditions, as the key does, but
      // sets the treated value in A against the untreated values in B and C
      // (both, so it shares values with every choice alike).
      const crossed = () => [`${cap1(A[1])} with ${topic.factor}, ${topic.measure} (${show(value[A[0]][1])}) topped the ${show(value[B[0]][0])} ${B[1]} and ${show(value[C[0]][0])} ${C[1]} without ${topic.pronoun}.`,
        `True, but this sets a value with ${topic.factor} against values without it; it does not show how much ${topic.factor} changed either setting.`];
      // The right comparison for the wrong pair of settings, either pair.
      const wrongPair = (X, Y, listed) => [both(X, Y, listed),
        `True, but it compares the gains for ${X[0]} and ${Y[0]}, not for the two settings the claim names (${A[0]} and ${B[0]}).`];
      // Both wrong pairs are offered, so the key is one of three choices of
      // the same form and shares values with each of the others alike. The
      // wrong pairs share a wording; the key takes the other wording in about
      // a third of draws, which makes the two closest choices two
      // distractors about as often as chance would.
      const fourth = t.int(0, 2);
      const unlike = t.chance(0.35);
      const { correct, wrong } = balancedDraw(t, () => {
        const listed = t.chance(0.5);
        return {
          correct: both(A, B, unlike ? !listed : listed),
          wrong: [wrongPair(A, C, listed), wrongPair(C, B, listed), [crossed, treated, untreated][fourth]()],
        };
      });
      return mc("Medium", topic, {
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
        trap: "Choosing the right comparison for the wrong pair of settings, a value with the treatment set against values without it, or the treated values alone.",
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
            row(A[0])[2] > row(B[0])[1] &&
            [row(A[0])[1], row(A[0])[2], row(B[0])[1], row(B[0])[2]].every((v) => correct.includes(show(v))) &&
            allDistinct(correct, wrong)
          );
        },
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence (quantitative): a claim about a percent change  */
  /* or a rate, among true statements about levels and counts            */
  /* ------------------------------------------------------------------ */

  // Four groups in a table, in one of two kinds of frame. Every choice is
  // true of the table; only the key bears on the claim's own terms.
  //   percent: values in three years. The claim is that group A grew by a
  //     larger percentage than group B over the whole period, although B
  //     grew by more. The key gives A's and B's first and last values.
  //     Offered instead: the same two groups over the first decade (when A
  //     also gained more outright, the choice a student comparing gains
  //     rather than percentages wants), over the last decade (when B grew
  //     by the larger percentage), and the other two groups over a decade.
  //   rate: one year's base and count. The claim is that the rate was
  //     higher for A than for B, although B had the larger count. The key
  //     gives both groups' counts and bases. Offered instead: the same
  //     comparison for A with C and for C with B, and three groups' counts
  //     (B's the largest) or three groups' sizes.
  // The distractors do not all share the key's series and period: each
  // shares as much with the others as with the key (the 2026-09-26 cold
  // review found the key was the choice every distractor was built around).
  const RATE_PERCENT_FRAMES = [
    {
      scene: "ii-tq5-language-enrollment",
      kind: "percent",
      intro: "The table shows enrollment in four language courses in the Brookfield school district.",
      headerFor: "Language",
      unitHeader: "students",
      years: [2004, 2014, 2024],
      groups: ["Japanese", "Spanish", "French", "German"],
      person: "Curriculum director Ana Soto",
      surname: "Soto",
      of: (g) => `enrollment in ${g}`,
      unit: " students",
      baseRange: [30, 80],
    },
    {
      scene: "ii-tq5-museum-visits",
      kind: "percent",
      intro: "The table shows annual visits, in thousands, to four museums in the city of Harwell.",
      headerFor: "Museum",
      unitHeader: "thousands of visits",
      years: [2003, 2013, 2023],
      groups: ["Glass Museum", "Art Museum", "Rail Museum", "Maritime Museum"],
      person: "Tourism analyst Priya Menon",
      surname: "Menon",
      of: (g) => `visits to the ${g}`,
      unit: " thousand",
      baseRange: [12, 30],
    },
    {
      scene: "ii-tq5-seabird-pairs",
      kind: "percent",
      intro: "The table shows the number of nesting pairs of four seabird species counted on Skerra Island.",
      headerFor: "Species",
      unitHeader: "nesting pairs",
      years: [2001, 2011, 2021],
      groups: ["Puffin", "Kittiwake", "Razorbill", "Fulmar"],
      person: "Ornithologist Ewan Blythe",
      surname: "Blythe",
      of: (g) => `the number of ${g.toLowerCase()} pairs`,
      unit: " pairs",
      baseRange: [40, 110],
    },
    {
      scene: "ii-tq5-ebook-loans",
      kind: "percent",
      intro: "The table shows e-book loans, in thousands, at four branches of the Corran public library.",
      headerFor: "Branch",
      unitHeader: "thousands of loans",
      years: [2005, 2015, 2025],
      groups: ["Hillcrest", "Central", "Eastgate", "Riverside"],
      person: "Library director Grace Oyelowo",
      surname: "Oyelowo",
      of: (g) => `e-book loans at ${g}`,
      unit: " thousand",
      baseRange: [8, 25],
    },
    {
      scene: "ii-tq5-solar-jobs",
      kind: "percent",
      intro: "The table shows the number of people employed by solar installation firms in four counties.",
      headerFor: "County",
      unitHeader: "workers",
      years: [2002, 2012, 2022],
      groups: ["Pell County", "Ardis County", "Morrow County", "Tane County"],
      person: "Labor economist Mateo Ferraz",
      surname: "Ferraz",
      of: (g) => `solar employment in ${g}`,
      unit: " workers",
      baseRange: [60, 150],
    },
    {
      scene: "ii-tq5-organic-farmland",
      kind: "percent",
      intro: "The table shows organic farmland, in thousands of hectares, in four provinces.",
      headerFor: "Province",
      unitHeader: "thousands of hectares",
      years: [2000, 2010, 2020],
      groups: ["Arvon", "Belmark", "Coster", "Dunmore"],
      person: "Agricultural geographer Lise Varga",
      surname: "Varga",
      of: (g) => `organic farmland in ${g}`,
      unit: " thousand hectares",
      baseRange: [10, 28],
    },
    {
      scene: "ii-tq6-hospital-infections",
      kind: "rate",
      intro: "The table shows the number of patients treated and the number of infections recorded at four hospitals in one year.",
      headers: ["Hospital", "Patients treated", "Infections recorded"],
      groups: ["St. Brendan", "Northfield", "Harbor View", "Lakeside"],
      person: "Epidemiologist Hana Ruiz",
      surname: "Ruiz",
      claim: (A, B) => `the rate of infection among patients was higher at ${A} than at ${B}, even though ${B} recorded more infections`,
      pair: (g, c, b) => `${g} recorded ${c} infections among ${b} patients`,
      pairTail: (g, c, b) => `${g}, ${c} among ${b}`,
      counts: (g, c) => `${g} recorded ${c} infections`,
      bases: (g, b) => `${g} treated ${b} patients`,
      per: 1000,
      base: [2, 6],
    },
    {
      scene: "ii-tq6-orchard-blight",
      kind: "rate",
      intro: "The table shows the number of trees and the number of trees with blight in four orchards owned by one farm.",
      headers: ["Orchard", "Trees", "Trees with blight"],
      groups: ["Hillside", "Valley", "Ridge", "Creek"],
      person: "Plant pathologist Tomas Brandt",
      surname: "Brandt",
      claim: (A, B) => `a larger share of trees had blight in the ${A} orchard than in the ${B} orchard, even though the ${B} orchard had more trees with blight`,
      pair: (g, c, b) => `the ${g} orchard had ${c} trees with blight out of ${b}`,
      pairTail: (g, c, b) => `the ${g} orchard, ${c} out of ${b}`,
      counts: (g, c) => `the ${g} orchard had ${c} trees with blight`,
      bases: (g, b) => `the ${g} orchard had ${b} trees`,
      per: 100,
      base: [3, 9],
    },
    {
      scene: "ii-tq6-library-cards",
      kind: "rate",
      intro: "The table shows the number of residents and the number of library cards issued in four neighborhoods of one city in one year.",
      headers: ["Neighborhood", "Residents", "Cards issued"],
      groups: ["Elm Park", "Westbrook", "Oakdale", "Fairview"],
      person: "City librarian Mei Tanaka",
      surname: "Tanaka",
      claim: (A, B) => `cards were issued at a higher rate per resident in ${A} than in ${B}, even though more cards were issued in ${B}`,
      pair: (g, c, b) => `${g} was issued ${c} cards for ${b} residents`,
      pairTail: (g, c, b) => `${g}, ${c} for ${b}`,
      counts: (g, c) => `${g} was issued ${c} cards`,
      bases: (g, b) => `${g} had ${b} residents`,
      per: 1000,
      base: [4, 12],
    },
    {
      scene: "ii-tq6-bicycle-commuters",
      kind: "rate",
      intro: "The table shows the number of workers and the number of workers who commute by bicycle in four towns.",
      headers: ["Town", "Workers", "Bicycle commuters"],
      groups: ["Ashby", "Brookton", "Carlow", "Dunmere"],
      person: "Urban planner Selin Arat",
      surname: "Arat",
      claim: (A, B) => `a larger share of workers commute by bicycle in ${A} than in ${B}, even though ${B} has more bicycle commuters`,
      pair: (g, c, b) => `${g} has ${c} bicycle commuters among ${b} workers`,
      pairTail: (g, c, b) => `${g}, ${c} among ${b}`,
      counts: (g, c) => `${g} has ${c} bicycle commuters`,
      bases: (g, b) => `${g} has ${b} workers`,
      per: 100,
      base: [2, 8],
    },
    {
      scene: "ii-tq6-science-fair",
      kind: "rate",
      intro: "The table shows the number of students and the number of science fair entrants at four high schools in one district.",
      headers: ["School", "Students", "Science fair entrants"],
      groups: ["Adams High", "Baxter High", "Carver High", "Delmont High"],
      person: "Science coordinator Omar Haddad",
      surname: "Haddad",
      claim: (A, B) => `a larger share of students entered the science fair at ${A} than at ${B}, even though ${B} had more entrants`,
      pair: (g, c, b) => `${g} had ${c} entrants among ${b} students`,
      pairTail: (g, c, b) => `${g}, ${c} among ${b}`,
      counts: (g, c) => `${g} had ${c} entrants`,
      bases: (g, b) => `${g} had ${b} students`,
      per: 100,
      base: [3, 9],
    },
    {
      scene: "ii-tq6-warehouse-injuries",
      kind: "rate",
      intro: "The table shows the number of workers and the number of injuries reported at four warehouses owned by one company in one year.",
      headers: ["Warehouse", "Workers", "Injuries reported"],
      groups: ["Fenwick", "Galloway", "Harlow", "Ingram"],
      person: "Safety inspector Nadia Kowal",
      surname: "Kowal",
      claim: (A, B) => `the injury rate among workers was higher at the ${A} warehouse than at the ${B} warehouse, even though the ${B} warehouse reported more injuries`,
      pair: (g, c, b) => `${g} reported ${c} injuries among ${b} workers`,
      pairTail: (g, c, b) => `${g}, ${c} among ${b}`,
      counts: (g, c) => `${g} reported ${c} injuries`,
      bases: (g, b) => `${g} had ${b} workers`,
      per: 100,
      base: [2, 7],
    },
  ];

  // Percent frames: A small and growing fast early, B large and growing
  // more in absolute terms but by a smaller percentage over the whole
  // period, and by a larger percentage over the last decade. C and D are
  // other groups of middling size. Values are whole numbers.
  function percentValues(t, frame) {
    const [low, high] = frame.baseRange;
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const a0 = t.int(low, high);
      const a2 = Math.round(a0 * (2.2 + t.int(0, 8) * 0.25));
      const a1 = Math.round(a0 + (a2 - a0) * (0.7 + t.int(0, 3) * 0.05));
      const b0 = Math.round(a0 * (4 + t.int(0, 8) * 0.5));
      const b2 = Math.round(b0 * (1.25 + t.int(0, 6) * 0.05));
      const b1 = Math.round(b0 + (b2 - b0) * (0.05 + t.int(0, 4) * 0.05));
      const c0 = Math.round(a0 * (1.5 + t.int(0, 6) * 0.25));
      const c1 = Math.round(c0 * (1.05 + t.int(0, 6) * 0.05));
      const c2 = Math.round(c1 * (1.05 + t.int(0, 8) * 0.05));
      const d0 = Math.round(a0 * (2 + t.int(0, 6) * 0.25));
      const d1 = Math.round(d0 * (0.9 + t.int(0, 6) * 0.05));
      const d2 = Math.round(d1 * (0.95 + t.int(0, 8) * 0.05));
      const rows = { A: [a0, a1, a2], B: [b0, b1, b2], C: [c0, c1, c2], D: [d0, d1, d2] };
      const all = [].concat(...Object.values(rows));
      const pct = (x, y) => (y - x) / x;
      const ok = new Set(all).size === all.length &&
        pct(a0, a2) > pct(b0, b2) + 0.4 && b2 - b0 > (a2 - a0) * 1.2 &&
        pct(b1, b2) > pct(a1, a2) + 0.05 && b2 > a2 * 1.5 &&
        c2 !== c1 && d2 !== d1;
      if (ok) return rows;
    }
    throw new Error(`${frame.scene}: could not draw values`);
  }

  // Rate frames: A's rate well above B's, B's count well above A's; C and D
  // arranged so the offered statements about counts and bases are true.
  function rateValues(t, frame) {
    const per = frame.per;
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const kA = t.int(2, 6);
      const kB = kA * t.int(3, 5) + t.int(0, 2);
      const rA = t.int(frame.base[0] + 2, frame.base[1] + 3);
      const rB = t.int(Math.max(1, Math.ceil(rA * 0.35)), Math.floor(rA * 0.65));
      const kC = t.int(Math.max(2, kA - 1), kB - 2);
      const kD = t.int(2, kB - 2);
      const rC = t.int(frame.base[0], frame.base[1]);
      const rD = t.int(frame.base[0], frame.base[1]);
      const unit = per === 100 ? 100 : 1000;
      const row = (k, r) => [k * unit, (k * unit * r) / per];
      const rows = { A: row(kA, rA), B: row(kB, rB), C: row(kC, rC), D: row(kD, rD) };
      const [bA, cA] = rows.A;
      const [bB, cB] = rows.B;
      const [bC, cC] = rows.C;
      const [bD] = rows.D;
      const all = [].concat(...Object.values(rows));
      const ok = Number.isInteger(cA) && Number.isInteger(cB) && Number.isInteger(cC) && Number.isInteger(rows.D[1]) &&
        new Set(all).size === all.length &&
        cA / bA > (cB / bB) * 1.3 && cB > cA * 1.3 && cB > cC && bB > bD && bB > bC;
      if (ok) return rows;
    }
    throw new Error(`${frame.scene}: could not draw values`);
  }

  const ratePercent = {
    ...RW,
    id: "quantitative-rate-versus-count",
    skill: "Command of Evidence",
    subskill: "quantitative evidence",
    difficulty: "Medium",
    title: "Table data that support a claim about a rate or a percent change",
    recognize:
      "The claim is about a percent change or a rate, not a count or a level: find the two values (start and end, or count and base) for each group the claim names, and check the ratio; larger counts, larger gains, and the wrong years can all look like support.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["percent-base", "true-but-irrelevant", "wrong-quantity"],
    build(t) {
      const frame = t.pick(RATE_PERCENT_FRAMES);
      const [A, B, C, D] = [0, 1, 2, 3].map((i) => frame.groups[i]);
      const g = S.grouped;
      let content;
      let draw;
      let why;
      let check;
      if (frame.kind === "percent") {
        const rows = percentValues(t, frame);
        const [y0, y1, y2] = frame.years;
        const order = t.shuffle(["A", "B", "C", "D"]);
        const name = { A, B, C, D };
        content = `${S.table(
          [frame.headerFor, `${y0} (${frame.unitHeader})`, `${y1} (${frame.unitHeader})`, `${y2} (${frame.unitHeader})`],
          order.map((k) => [name[k], g(rows[k][0]), g(rows[k][1]), g(rows[k][2])]),
        )}\n\n${frame.intro} ${frame.person} claims that between ${y0} and ${y2}, ${frame.of(A)} grew by a larger percentage than ${frame.of(B)} did, even though ${frame.of(B)} grew by more.`;
        const u = (v) => `${g(v)}${frame.unit}`;
        // Two groups over a span, in one of two wordings; the unit is given
        // once per group, with its later value, and the verb is neutral,
        // since the other groups may fall.
        const two = (p, q, i, j, listed, labelP = name[p], labelQ = name[q]) => (listed
          ? `From ${frame.years[i]} to ${frame.years[j]}, ${frame.of(labelP)} went from ${g(rows[p][i])} to ${u(rows[p][j])}; ${frame.of(labelQ)}, from ${g(rows[q][i])} to ${u(rows[q][j])}.`
          : `${cap1(frame.of(labelP))} went from ${g(rows[p][i])} in ${frame.years[i]} to ${u(rows[p][j])} in ${frame.years[j]}; ${frame.of(labelQ)}, from ${g(rows[q][i])} to ${u(rows[q][j])}.`);
        // Cross two independent row-reading mistakes. Every option names the
        // right groups and period, so the values themselves must be checked.
        draw = () => {
          const listed = t.chance(0.5);
          const make = (p, q) => two(p, q, 0, 2, listed, A, B);
          return {
            correct: make("A", "B"),
            wrong: [
              [make("A", "D"), `This assigns ${D}’s values to ${B}; check the row for ${B}.`],
              [make("C", "B"), `This assigns ${C}’s values to ${A}; check the row for ${A}.`],
              [make("C", "D"), `This uses ${C} and ${D}’s values under the names ${A} and ${B}.`],
            ],
          };
        };
        const pctText = (k) => `${Math.round(((rows[k][2] - rows[k][0]) / rows[k][0]) * 100)} percent`;
        why = `The claim compares percent changes from ${y0} to ${y2}. ${cap1(frame.of(A))} rose from ${u(rows.A[0])} to ${u(rows.A[2])}, about ${pctText("A")}, while ${frame.of(B)} rose from ${u(rows.B[0])} to ${u(rows.B[2])}, about ${pctText("B")}, a larger gain in absolute terms but a smaller one in percent.`;
        check = (correct) => {
          const { rows: body } = readTable(content);
          const row = (label) => body.find((r) => r[0] === label);
          const [, a0, , a2] = row(A);
          const [, b0, b1, b2] = row(B);
          const [, , a1] = row(A);
          return (a2 - a0) / a0 > (b2 - b0) / b0 && b2 - b0 > a2 - a0 && (b2 - b1) / b1 > (a2 - a1) / a1 &&
            [a0, a2, b0, b2].every((v) => correct.includes(g(v)));
        };
      } else {
        const rows = rateValues(t, frame);
        const order = t.shuffle(["A", "B", "C", "D"]);
        const name = { A, B, C, D };
        content = `${S.table(frame.headers, order.map((k) => [name[k], g(rows[k][0]), g(rows[k][1])]))}\n\n${frame.intro} ${frame.person} claims that ${frame.claim(A, B)}.`;
        // Each choice uses the same group labels and supplies a complete
        // pair of rates. Crossed row substitutions require checking the data.
        const pairIn = (p, q, listed, labelP = name[p], labelQ = name[q]) => (listed
          ? `${cap1(frame.pair(labelP, g(rows[p][1]), g(rows[p][0])))}, while ${frame.pair(labelQ, g(rows[q][1]), g(rows[q][0]))}.`
          : `${cap1(frame.pair(labelP, g(rows[p][1]), g(rows[p][0])))}; ${frame.pairTail(labelQ, g(rows[q][1]), g(rows[q][0]))}.`);
        draw = () => {
          const listed = t.chance(0.5);
          const make = (p, q) => pairIn(p, q, listed, A, B);
          return {
            correct: make("A", "B"),
            wrong: [
              [make("A", "D"), `This assigns ${D}’s count and base to ${B}; check the actual row.`],
              [make("C", "B"), `This assigns ${C}’s count and base to ${A}; check the actual row.`],
              [make("C", "D"), `This substitutes ${C} and ${D}’s data for both groups the claim names.`],
            ],
          };
        };
        const rate = (k) => (rows[k][1] / rows[k][0]) * frame.per;
        const perWord = frame.per === 100 ? "100" : "1,000";
        why = `The claim compares rates, not counts. ${A} had ${g(rows.A[1])} out of ${g(rows.A[0])}, about ${Math.round(rate("A") * 10) / 10} per ${perWord}, while ${B} had ${g(rows.B[1])} out of ${g(rows.B[0])}, about ${Math.round(rate("B") * 10) / 10} per ${perWord}: a larger count but a lower rate.`;
        check = (correct) => {
          const { rows: body } = readTable(content);
          const row = (label) => body.find((r) => r[0] === label);
          const [, bA, cA] = row(A);
          const [, bB, cB] = row(B);
          return cA / bA > cB / bB && cB > cA && [bA, cA, bB, cB].every((v) => correct.includes(g(v)));
        };
      }
      const { correct, wrong } = balancedDraw(t, draw);
      return mc("Medium", frame, {
        stimulus: { type: "table", content },
        stem: `Which choice most effectively uses data from the table to support ${frame.surname}'s claim?`,
        correct,
        wrong,
        explanation: `${why} The choice that shows this is: ${correct}`,
        steps: [
          "Decide what the claim compares: a percent change (the gain relative to the start) or a rate (a count relative to its base), and for which two groups over which years.",
          "For each choice, check all four values against the table: a choice can name the right groups while borrowing another row’s values.",
          "Compute the two percent changes or rates and confirm that they come out as the claim says; larger counts, larger gains, and other years do not decide it.",
        ],
        principles: [
          "A percent change divides the gain by the starting value, so a small group can grow by a larger percentage while gaining less.",
          "A rate divides a count by its base; the group with more events can have the lower rate.",
        ],
        trap: "Accepting the correct group labels without checking that the values come from those groups, or comparing counts instead of rates.",
        hint: "What must be divided by what to test the claim, and does the choice give you both numbers for each group?",
        verify: () => check(correct) && allDistinct(correct, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence: the finding that tells a hypothesis apart from */
  /* a named rival explanation of the same observation                  */
  /* ------------------------------------------------------------------ */

  // The text reports an observation, a researcher's hypothesis, and a rival
  // account that explains the same observation. Support (or weakening) has
  // to discriminate between the two: the key is a finding the two accounts
  // predict differently. Other choices retain a confounded comparison,
  // favor the rival, or use a tempting but nondiscriminating proxy. Every
  // researcher, place, and study here is invented; reasons are scene-specific.
  const DISCRIMINATING_TOPICS = [
    {
      scene: "ii-df-orvanne-silt",
      name: "Varga",
      mode: "support",
      text:
        "Sediment cores from Lake Orvanne, a small lake high in a mountain valley, show that the layers of silt settling on its floor each year grew several times thicker over the twentieth century. Geologist Ilse Varga attributes the change to the retreat of the glacier that feeds the lake: as the ice withdrew, she argues, it exposed rock it had ground into fine powder, which meltwater then carried into the lake. A competing account holds that logging on the forested slopes above the lake, which expanded during the same decades, loosened soil that rainstorms washed downhill.",
      anchors: ["attributes the change to the retreat of the glacier", "logging on the forested slopes"],
      key: "Sediment rose in unlogged streams after upstream ice retreated, but stayed steady in logged streams whose upstream ice remained unchanged.",
      keyWhy: "The comparison separates logging from retreat: the increase follows retreat without logging, whereas logging without retreat produces little increase.",
      both: ["Streams below both retreating ice and logged slopes gained more sediment than streams whose upstream ice and forest both remained unchanged.","Both proposed causes differ between these groups, so the comparison cannot isolate retreat from logging."],
      opposite: ["Sediment rose in logged streams with unchanged upstream ice, but stayed steady in unlogged streams after upstream ice retreated.","This matched contrast associates added sediment with logging, the rival explanation."],
      aside: ["Streams draining the most newly exposed rock supplied the most sediment, but also drained the largest areas of newly logged forest.","The two exposures still coincide, so their association with sediment cannot select one explanation."],
    },
    {
      scene: "ii-df-tessel-song",
      name: "Stell",
      mode: "support",
      text:
        "On the Tessel Islands, males of a small songbird sing a song with fewer notes than the song of the same species on the nearby mainland. Ornithologist Anouk Stell proposes that the difference arose through learning: because the islands were settled by only a few birds, young males there copied a small number of tutors, and details lost in copying were never restored. Other researchers suggest instead that the islands' dense forests, which muffle long and complex songs, favored an inherited tendency toward shorter songs, which carry well through foliage.",
      anchors: ["the difference arose through learning", "dense forests"],
      key: "In identical open aviaries, island and mainland nestlings copied whichever population’s song they heard, regardless of their own origin.",
      keyWhy: "Holding habitat constant while crossing the birds’ origin with the tutoring song isolates transmission through learning from an inherited island preference.",
      both: ["In identical open aviaries, island and mainland nestlings raised by adults from their own populations reproduced those adults’ songs.","Origin and tutoring remain paired; either inherited differences or copying could produce this result."],
      opposite: ["In identical open aviaries, island nestlings sang short songs and mainland nestlings sang long ones, regardless of their tutors’ origin.","Persistence by origin despite identical tutoring favors an inherited difference rather than lost details in copying."],
      aside: ["Island males in dense forest sang fewer notes than mainland males in grassland, even when recorded at the same time of day.","Time of day is controlled, but habitat and population history still differ together."],
    },
    {
      scene: "ii-df-vell-hoards",
      name: "Halloran",
      mode: "support",
      text:
        "Archaeologists have recovered an unusual number of coin hoards in the Vell valley that were buried during the 1140s and never retrieved by their owners. Historian Marek Halloran argues that the hoards reflect a decade of war: owners hid their savings as armies approached and then died or fled before they could return. A rival interpretation holds that the 1140s were simply prosperous, so that more coins were in circulation, more were buried for safekeeping, and more were eventually forgotten.",
      anchors: ["reflect a decade of war", "simply prosperous"],
      key: "For equally wealthy districts, 1140s hoards per inhabited site rose along army routes but stayed stable away from those routes.",
      keyWhy: "Equal prosperity indicators and adjustment for inhabited sites leave the wartime route as the important difference; the within-decade contrast supports war-related abandonment.",
      both: ["Districts along army routes held more 1140s hoards but also had more inhabited sites and higher tax receipts than other districts.","Army routes, population, and prosperity vary together, so the raw hoard count does not discriminate."],
      opposite: ["For equally wealthy districts, 1140s hoards per inhabited site rose equally along army routes and in areas armies never entered.","A rise unrelated to armies’ routes weakens the proposed war-specific explanation and is compatible with broader prosperity."],
      aside: ["Districts along army routes held more coins per hoard, but those coins’ mint dates ranged across several earlier decades.","Hoard size and mint dates do not establish why 1140s owners failed to retrieve their savings."],
    },
    {
      scene: "ii-df-halden-fireflies",
      name: "Okafor",
      mode: "support",
      text:
        "In the suburbs of Halden, fireflies have become scarce within about fifty meters of streetlights. Ecologist Tamsin Okafor attributes the decline to the lights themselves, arguing that artificial light drowns out the flashes fireflies use to find mates, so that fewer pairs form and fewer eggs are laid. Some residents point instead to the closely mown lawns that surround most of Halden's streetlights, which offer none of the damp leaf litter where firefly larvae live and feed.",
      anchors: ["attributes the decline to the lights themselves", "closely mown lawns"],
      key: "With mowing unchanged, shielding restored mating and later larval counts; leaf litter under exposed lamps aided larval survival but not mating.",
      keyWhy: "The key separates the proposed mechanisms: restoring signaling changes reproduction even with lawns fixed; improved larval habitat alone does not restore mating.",
      both: ["Shielding lamps and adding leaf litter together improved mating and later larval counts compared with plots that received neither change.","Both potential causes changed together, so the improvement does not isolate light from habitat."],
      opposite: ["With lighting unchanged, leaf litter restored mating and later larval counts; shielding lamps over bare lawns changed neither measure.","The recovery follows habitat restoration without light removal, while shielding alone fails, favoring the rival."],
      aside: ["Exposed lamps over short lawns had fewer mating pairs nearby than dimmer lamps over tall grass, even at equal temperatures.","This repeats the original confounding of light and lawn conditions."],
    },
    {
      scene: "ii-df-carrowby-vowel",
      name: "Nwosu",
      mode: "weaken",
      text:
        "In the coastal town of Carrowby, younger residents pronounce the vowel in words such as boat and road farther forward in the mouth than older residents do. Linguist Petra Nwosu argues that the new pronunciation was introduced by families who moved to Carrowby from a northern city in the 1980s, where the forward vowel is common, and that it then spread to their neighbors' children. Other linguists contend that the change began within Carrowby itself, as many sound changes do, and spread among teenagers regardless of family background.",
      anchors: ["introduced by families who moved to Carrowby", "began within Carrowby itself"],
      key: "Locally born teenagers used the vowel before the newcomers arrived; its later spread tracked school friendships more than neighboring homes.",
      keyWhy: "Use before the proposed introduction undermines the claimed origin, while spread through school networks fits a local peer-driven change.",
      both: ["Older residents retained the earlier vowel after the arrivals, while younger residents increasingly used the new vowel in formal and casual speech.","Both proposed pathways can produce a generational difference and wider use of the new vowel."],
      opposite: ["Recordings first show the vowel among newcomers’ children; local classmates adopted it later, fastest among those with more newcomer friends.","The sequence and network match introduction by the newcomers, supporting the argument that must be weakened."],
      aside: ["The vowel later spread fastest on streets where northern families settled, but those streets also contained the town’s largest school.","This association remains compatible with the newcomers’ influence; the school confound prevents it from establishing the rival origin."],
    },
    {
      scene: "ii-df-maresh-glaze",
      name: "Adeyemi",
      mode: "support",
      text:
        "Excavations at Tel Maresh, an inland settlement, have uncovered fragments of pottery coated in a bright blue glaze, a finish otherwise known mainly from workshops on the coast two hundred kilometers away. Archaeologist Yusuf Adeyemi argues that potters at Tel Maresh made the vessels themselves after learning the coastal technique. Others maintain that the vessels were made on the coast and reached the settlement through trade, as many luxury goods of the period did.",
      anchors: ["made the vessels themselves", "reached the settlement through trade"],
      key: "Blue-glazed kiln waste at Tel Maresh matches local household fragments; coastal kiln waste differs, although vessels were traded.",
      keyWhy: "Kiln waste provides evidence of manufacture rather than merely clay provenance or use. Its match to household vessels supports local production despite evidence of trade.",
      both: ["Inland blue-glazed vessels match coastal ones in shape and chemistry; inland unglazed pottery differs in both despite using similar clay.","Copied technique and imported finished vessels can both produce this resemblance; the local unglazed comparison does not locate manufacture."],
      opposite: ["Blue-glazed pieces fused to coastal kiln supports match inland household fragments chemically; inland kiln waste differs, despite similar tools.","Production waste matching the household vessels occurs on the coast, favoring imported finished vessels."],
      aside: ["Blue-glazed vessels use inland clay and coastal pigments, but records show that both raw clay and finished vessels traveled between the regions.","Because raw clay was traded, clay origin alone cannot locate manufacture; coastal workshops could have used inland clay."],
    },
    {
      scene: "ii-df-brannock-tea",
      name: "Marsh",
      mode: "weaken",
      text:
        "During the 1850s, the price of imported tea in the port of Brannock fell by about half. Economic historian Lena Marsh argues that the decline resulted from faster sailing ships, which shortened voyages and so reduced the wages, provisions, and insurance that each cargo required. Another explanation points instead to the government's decision in 1853 to abolish the tariff it had long charged on imported tea.",
      anchors: ["resulted from faster sailing ships", "abolish the tariff"],
      key: "Warehoused tea prices fell when the tariff ended; fresh tea shipped on faster vessels showed no further reduction relative to that landed stock.",
      keyWhy: "Already landed stock could not benefit from shorter voyages; its price shift at tariff removal, with no added advantage for new shipments, favors the tariff account.",
      both: ["Fresh tea prices fell while voyages shortened and the tariff ended; average prices of all imported drinks also declined over the same period.","Both candidate causes coincide for the new shipments; the broader decline still fails to separate their contributions."],
      opposite: ["Tea shipped on faster vessels became cheaper before the tariff ended; older ships’ tea stayed costly until those ships were replaced.","The difference follows shipping technology before tariff removal, supporting the argument that must be weakened."],
      aside: ["Tea became cheaper relative to untaxed spices on the same ships, but the spices’ warehouse insurance costs increased substantially that year.","The uncontrolled storage cost can explain the difference, so this is less direct than isolating already landed tea."],
    },
    {
      scene: "ii-df-sorrel-coral",
      name: "Ferris",
      mode: "support",
      text:
        "During a marine heat wave, corals growing near the mouth of the Sorrel River bleached far less than corals elsewhere in the same lagoon. Marine biologist Adaeze Ferris proposes that the river's cloudy, sediment-laden water shaded the nearby corals, reducing the intense sunlight that, together with heat, triggers bleaching. An alternative hypothesis holds that the corals near the river mouth belong to a heat-tolerant strain that would resist bleaching wherever it grew.",
      anchors: ["shaded the nearby corals", "heat-tolerant strain"],
      key: "With temperature and chemistry held equal, both coral populations bleached alike in clear tanks and benefited equally from filtered sunlight.",
      keyWhy: "Crossing origin with shade while controlling temperature and chemistry isolates protection from reduced light rather than an inherited advantage of river-mouth corals.",
      both: ["With temperature and chemistry held equal, river-mouth corals in shaded tanks bleached less than lagoon corals in clear tanks.","Origin and shade still change together, so either explanation predicts the difference."],
      opposite: ["With temperature and chemistry held equal, river-mouth corals resisted bleaching in clear and shaded tanks; neither population benefited from shade.","Protection follows origin rather than shade, favoring inherited tolerance."],
      aside: ["Both coral populations bleached less in river-water tanks, but those tanks were also cooler and shadier than the comparison tanks.","River water, temperature, and shade vary together, so the result does not isolate the proposed light mechanism."],
    },
    {
      scene: "ii-df-ashwick-otters",
      name: "Calloway",
      mode: "weaken",
      text:
        "After decades of scarcity, river otters became common again along the Ashwick River between 2000 and 2015. Ecologist Rhys Calloway attributes the recovery to cleaner water: as factories upstream reduced their discharges, he argues, fish populations grew and could support more otters. Others credit a ban on trapping otters that the regional government imposed in 1999, just before the recovery began.",
      anchors: ["attributes the recovery to cleaner water", "a ban on trapping otters"],
      key: "After the ban, otters recovered without more fish; cleaned reaches gained fish but no greater otter recovery than uncleaned reaches.",
      keyWhy: "Recovery without improved food supply, and no extra response where fish increased, undermine the proposed cleaner-water-to-fish-to-otter mechanism.",
      both: ["After the ban, otters recovered fastest where factory discharge fell most and fish counts exceeded those in reaches that stayed polluted.","Trapping and pollution changes overlap; this can fit the cleaner-water mechanism and therefore does not directly weaken it."],
      opposite: ["After the ban, otters remained scarce in polluted reaches; in cleaned reaches, fish recovered first and otters increased afterward.","The sequence and location support the proposed food-supply pathway, which the stem asks to weaken."],
      aside: ["After the ban, otters ate more frogs where fish stayed scarce, but bred less successfully there than where fish populations recovered.","Diet flexibility alone does not refute food limitation; lower breeding success where fish are scarce is compatible with it."],
    },
    {
      scene: "ii-df-pellham-cycling",
      name: "Ivers",
      mode: "support",
      text:
        "The share of Pellham residents who commute by bicycle doubled between 2016 and 2022. Transportation researcher Hana Ivers credits the network of protected bike lanes that the city built during those years. Others note that fuel prices climbed steeply over the same period and argue that rising costs, not the new lanes, pushed commuters out of their cars and onto bicycles.",
      anchors: ["credits the network of protected bike lanes", "fuel prices climbed steeply"],
      key: "With fuel costs and workplaces unchanged, cycling rose on protected routes but stayed steady on comparable routes without new lanes.",
      keyWhy: "Holding fuel costs and commuting circumstances constant leaves new protection as the distinguishing change, directly separating the lane explanation from the fuel-cost explanation.",
      both: ["Cycling rose among commuters facing higher fuel costs on protected routes; those with unchanged costs on unprotected routes kept driving.","Both fuel costs and lane availability differ between the groups, so this supports either account."],
      opposite: ["On newly protected routes, cycling rose only among commuters facing higher fuel costs; those with unchanged costs continued driving.","The change tracks fuel costs even where lane access is shared, favoring the rival explanation."],
      aside: ["Most new bicycle commuters used protected routes, but those routes had also served most of the city’s workplaces before the change.","Routes serving most workplaces would attract riders under either explanation; the distribution lacks a matched comparison."],
    },
  ];

  const discriminatingFinding = {
    ...RW,
    id: "evidence-discriminating-finding",
    skill: "Command of Evidence",
    subskill: "textual evidence",
    difficulty: "Hard",
    title: "Finding that favors one of two rival explanations",
    recognize:
      "Two accounts explain the same observation, so evidence bears on one only if the two predict it differently; a finding predicted equally well by both does not distinguish them. Check what each comparison holds constant.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["true-but-irrelevant", "opposite-stance"],
    build(t) {
      const topic = t.pick(DISCRIMINATING_TOPICS);
      const support = topic.mode === "support";
      const wrong = [topic.both, topic.opposite, topic.aside];
      return mc("Hard", topic, {
        stimulus: passage(topic.text),
        stem: `Which finding, if true, would most directly ${support ? "support" : "weaken"} ${topic.name}'s ${support ? "hypothesis" : "argument"}?`,
        correct: topic.key,
        wrong,
        explanation: topic.keyWhy,
        steps: [
          `State ${topic.name}'s explanation and the rival explanation of the same observation.`,
          "For each finding, ask which explanation would predict it; a finding both would predict cannot decide between them.",
          `Choose the finding that ${support ? `is more expected under ${topic.name}'s explanation with the rival factor controlled` : `fits the rival explanation better than ${topic.name}'s`}.`,
        ],
        principles: [
          "Evidence favors one explanation over another when it is more expected under that explanation; comparisons must separate the proposed causes.",
          "Restating the shared observation does not distinguish the rival explanations.",
        ],
        trap: support
          ? `Choosing a finding that agrees with ${topic.name}'s explanation but that the rival explanation predicts just as well.`
          : `Choosing the finding that best fits ${topic.name}'s explanation, which supports the argument the question asks you to weaken.`,
        hint: "What would you expect to find if one explanation were right and the other wrong?",
        verify: () => inOrder(topic.text, topic.anchors) && ["support", "weaken"].includes(topic.mode) && allDistinct(topic.key, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence: the quotation from a poem that illustrates an  */
  /* interpretive claim about it                                         */
  /* ------------------------------------------------------------------ */

  // Each topic is an original short poem, a claim about it, and four
  // quotations from it (`key` and `near`, each a list of consecutive lines).
  // The key rarely repeats the claim's words; the near misses do: one shows
  // the moment before the poem's turn, one only half of a two-part claim,
  // and one shares the claim's image or vocabulary but not its point. The
  // whole poem is shown, so each quotation can be read in context.
  const POEM_TOPICS = [
    {
      scene: "ii-pq-marine-forecast",
      poem: [
        "Each night at ten I leave the kitchen light",
        "and sit beside the radio to hear",
        "the forecast for the boats: the wind by region,",
        "the swell, the fog banks moving on the shoals.",
        "I live four hundred miles from any coast.",
        "I have never owned a boat or cast a net.",
        "I do not need the weather; I need the voice",
        "that reads it out as if no storm could hurry it.",
      ],
      claim: "In the poem, the speaker suggests that the forecast matters to the speaker for the comfort of its delivery rather than for its information.",
      key: ["I do not need the weather; I need the voice"],
      why: "Setting aside “the weather” while saying “I need the voice” shows that the forecast’s information is useless to the speaker and its delivery is what the speaker seeks.",
      near: [
        [["I live four hundred miles from any coast.", "I have never owned a boat or cast a net."],
          "This shows only that the forecast’s information is of no use to the speaker, not what the speaker values in it instead."],
        [["the forecast for the boats: the wind by region,", "the swell, the fog banks moving on the shoals."],
          "This lists what the forecast reports, its information, rather than what draws the speaker to it."],
        [["that reads it out as if no storm could hurry it."],
          "This describes the calm of the reading voice but not that the forecast’s information is of no use to the speaker; the line before it makes that contrast."],
      ],
    },
    {
      scene: "ii-pq-quiet-supper",
      poem: [
        "At supper no one mentioned what had happened.",
        "We passed the bread. The radio stayed off.",
        "The clock above the stove took up the talking,",
        "and rain kept up its business on the glass.",
        "My brother studied the salt as if it might speak.",
        "When my mother rose, she touched my shoulder",
        "the way you steady a cup about to spill,",
        "and that was all the speech there was, and I had heard it.",
      ],
      claim: "In the poem, the speaker suggests that the mother’s touch conveys what no one at the table says aloud.",
      key: ["the way you steady a cup about to spill,", "and that was all the speech there was, and I had heard it."],
      why: "Calling the touch “all the speech there was” and saying “I had heard it” presents the gesture as the message the family never speaks.",
      near: [
        [["At supper no one mentioned what had happened."],
          "This shows only the silence at the table, not anything that conveys what goes unsaid."],
        [["When my mother rose, she touched my shoulder"],
          "This shows the touch itself but not that it communicates anything; the lines after it make that point."],
        [["The clock above the stove took up the talking,"],
          "This echoes the idea of talking, but it is the clock’s ticking that fills the silence, not the mother’s touch."],
      ],
    },
    {
      scene: "ii-pq-pear-pruning",
      poem: [
        "All morning my grandfather cut the pear trees back,",
        "and I stood in the snow and counted what fell:",
        "the reaching limbs, the ones that bore last year,",
        "a whole green summer stacked beside the fence.",
        "The saw went back and forth like something breathing.",
        "I thought he meant to punish them. He laughed",
        "and showed me where the new wood waited, blunt",
        "as a thumb beneath the bark, and said it needed room.",
      ],
      claim: "In the poem, the speaker at first mistakes the pruning for a kind of harm but learns that it prepares the trees for new growth.",
      key: ["I thought he meant to punish them. He laughed", "and showed me where the new wood waited, blunt"],
      why: "“I thought he meant to punish them” is the mistaken view, and the grandfather’s showing “where the new wood waited” is the lesson that corrects it, so these lines hold both halves of the claim.",
      near: [
        [["the reaching limbs, the ones that bore last year,", "a whole green summer stacked beside the fence."],
          "This dwells on what the pruning removed but says nothing of the new growth the speaker learns about."],
        [["as a thumb beneath the bark, and said it needed room."],
          "This gives the grandfather’s reason for pruning but not the speaker’s earlier misunderstanding of it."],
        [["and I stood in the snow and counted what fell:"],
          "This shows the speaker watching the branches fall, not whether the speaker took the pruning as harm or as preparation."],
      ],
    },
    {
      scene: "ii-pq-ferry-bridge",
      poem: [
        "The ferry took eleven minutes, more in fog,",
        "and in that time you learned the pilot’s name,",
        "whose daughter married, which gull stole the bread.",
        "We leaned on the rail and watched the city come.",
        "The bridge is faster. I can’t argue that.",
        "It lifts me over water I don’t see",
        "and sets me down before I’ve finished thinking,",
        "four minutes, door to door, and no one speaks.",
      ],
      claim: "In the poem, the speaker suggests that the bridge’s speed, whatever its advantages, has cost travelers something.",
      key: ["It lifts me over water I don’t see", "and sets me down before I’ve finished thinking,"],
      why: "Being set down “before I’ve finished thinking,” over water the speaker no longer sees, ties the bridge’s speed directly to what the crossing has lost.",
      near: [
        [["The bridge is faster. I can’t argue that."],
          "This grants the bridge its advantage but shows nothing that its speed has cost."],
        [["and in that time you learned the pilot’s name,", "whose daughter married, which gull stole the bread."],
          "This recalls what the slow ferry offered, but it describes the ferry, not what the bridge’s speed takes away."],
        [["The ferry took eleven minutes, more in fog,"],
          "This gives the ferry’s travel time, which sets up the comparison but shows no cost of the bridge’s speed."],
      ],
    },
    {
      scene: "ii-pq-last-runner",
      poem: [
        "The winner crossed at nine, and we all cheered,",
        "and cameras flashed, and then the crowd went home.",
        "By four the barriers were being stacked,",
        "the paper cups swept up along the curb.",
        "I stayed. A woman came around the bend",
        "at something less than walking, and I found",
        "that I was shouting louder than I’d shouted",
        "for anyone that morning, and she ran.",
      ],
      claim: "In the poem, the speaker suggests that most spectators lost interest in the race as soon as the winner had finished.",
      key: ["The winner crossed at nine, and we all cheered,", "and cameras flashed, and then the crowd went home."],
      why: "The crowd cheers the winner at nine “and then” goes home, leaving before the race is over, which shows the spectators’ interest ending with the winner’s finish.",
      near: [
        [["I stayed. A woman came around the bend"],
          "This shows the speaker staying on, the exception to the crowd, not the spectators losing interest."],
        [["at something less than walking, and I found", "that I was shouting louder than I’d shouted"],
          "This shows the speaker’s excitement at the last runner, not the rest of the crowd’s response to the race."],
        [["for anyone that morning, and she ran."],
          "This describes the last runner finding the strength to run, not what the other spectators did."],
      ],
    },
    {
      scene: "ii-pq-snowplow",
      poem: [
        "Somewhere past two, the plow comes down our street,",
        "its orange light sliding across the ceilings,",
        "the scrape of the blade the only sound for miles,",
        "and by the time the town wakes there is nothing",
        "to show that anything was ever wrong:",
        "the road is black and ordinary and wet.",
        "No one will mention him at breakfast,",
        "which is the only thanks the work allows.",
      ],
      claim: "In the poem, the speaker emphasizes that the plow driver’s work leaves the waking town no sign that there was ever a storm.",
      key: ["and by the time the town wakes there is nothing", "to show that anything was ever wrong:"],
      why: "“By the time the town wakes there is nothing / to show that anything was ever wrong” says both that the town is waking and that the storm has left no trace.",
      near: [
        [["Somewhere past two, the plow comes down our street,", "its orange light sliding across the ceilings,"],
          "This gives the hour and the look of the plow passing, not what the town finds when it wakes."],
        [["the scrape of the blade the only sound for miles,"],
          "This describes the plow at work in the night, not the absence of any sign of the storm by morning."],
        [["No one will mention him at breakfast,", "which is the only thanks the work allows."],
          "This concerns how the town treats the driver, not whether any sign of the storm remains."],
      ],
    },
    {
      scene: "ii-pq-city-stars",
      poem: [
        "For years I told my daughter there were stars",
        "the way you tell a child there once were wolves:",
        "a thing the city long ago used up.",
        "Then the storm took the power, block by block,",
        "the towers first, the streetlights, then our own,",
        "and there they were above the roof, so thick",
        "they looked like frost upon a darkened pane.",
        "They had not gone. Our own light was the veil.",
      ],
      claim: "In the poem, the speaker at first regards the stars as something the city has destroyed for good.",
      key: ["the way you tell a child there once were wolves:", "a thing the city long ago used up."],
      why: "Speaking of the stars “the way you tell a child there once were wolves,” as “a thing the city long ago used up,” treats them as gone for good; these lines report what the speaker told the daughter for years, before the blackout.",
      near: [
        [["Then the storm took the power, block by block,", "the towers first, the streetlights, then our own,"],
          "This describes the blackout, not what the speaker had believed about the stars."],
        [["and there they were above the roof, so thick", "they looked like frost upon a darkened pane."],
          "This shows the stars appearing, which begins to overturn the speaker’s earlier belief rather than showing it."],
        [["They had not gone. Our own light was the veil."],
          "This is the speaker’s later realization, which rejects the view the claim describes."],
      ],
    },
    {
      scene: "ii-pq-milestone",
      poem: [
        "Old stone, that told the miles to Ashby town",
        "when coaches rattled by with news and mail,",
        "thy letters now are lichen, and thy crown",
        "is worn by weather to a rounded tale.",
        "",
        "No coachman reads thee now; the turnpike road",
        "is grass, and swifter journeys pass thee by.",
        "The very hands that raised thee, and that strode",
        "past thee a thousand mornings, lie hard by.",
        "",
        "Yet still the drover, halting in the rain,",
        "leans on thee while his cattle drink their fill;",
        "thy words are gone, thy uses yet remain,",
        "and what thou canst not tell, thou servest still.",
      ],
      claim: "In the poem, the speaker suggests that the milestone has found a humbler use in place of the purpose it has lost.",
      key: ["Yet still the drover, halting in the rain,", "leans on thee while his cattle drink their fill;"],
      why: "The drover leaning on the stone in the rain is the humbler use it now serves, introduced by “Yet” after the loss of its old purpose.",
      near: [
        [["Old stone, that told the miles to Ashby town", "when coaches rattled by with news and mail,"],
          "This recalls the purpose the milestone once served, not the humbler use that has replaced it."],
        [["No coachman reads thee now; the turnpike road", "is grass, and swifter journeys pass thee by."],
          "This shows that the milestone has lost its purpose but not that it has found another."],
        [["The very hands that raised thee, and that strode", "past thee a thousand mornings, lie hard by."],
          "This mourns the people who built and passed the stone, not any use the stone still has."],
      ],
    },
    {
      scene: "ii-pq-inherited-garden",
      poem: [
        "The garden that I bought came with a stranger:",
        "bulbs I did not plant come up in March,",
        "a rose is trained with patience up the wall",
        "by hands that left no name among the deeds.",
        "Her labels, faded, lean along the border.",
        "I meant to dig it all and start again.",
        "Instead I find I’m keeping someone’s order,",
        "watering what she chose, as if we’d met.",
      ],
      claim: "In the poem, the speaker finds evidence of the previous owner’s patient, unrecorded work in the garden.",
      key: ["a rose is trained with patience up the wall", "by hands that left no name among the deeds."],
      why: "A rose “trained with patience” shows the previous owner’s careful work, and “hands that left no name among the deeds” shows that the work went unrecorded.",
      near: [
        [["The garden that I bought came with a stranger:"],
          "This says the garden came with traces of someone else but shows nothing of that person’s patient work."],
        [["Her labels, faded, lean along the border."],
          "Faded labels show that someone once named the plants, but not the patient, unrecorded work the claim describes."],
        [["I meant to dig it all and start again.", "Instead I find I’m keeping someone’s order,", "watering what she chose, as if we’d met."],
          "These lines show the speaker’s change of plan and tending of what the previous owner planted, not the patient work she did."],
      ],
    },
    {
      scene: "ii-pq-city-from-train",
      poem: [
        "The city never sleeps, the posters say,",
        "and it is true: at four the bakeries glow,",
        "the trains still breathe beneath the avenue,",
        "a man is hosing down the fish-shop floor.",
        "I love it as you love a friend who talks",
        "through every silence you have ever needed,",
        "and so I love it best from the train window",
        "as it pulls out, the lights going small and kind.",
      ],
      claim: "In the poem, the speaker suggests that the city is easiest to love from a distance.",
      key: ["and so I love it best from the train window", "as it pulls out, the lights going small and kind."],
      why: "Loving the city “best” as the train pulls away, when its lights go “small and kind,” ties the speaker’s affection to distance.",
      near: [
        [["I love it as you love a friend who talks", "through every silence you have ever needed,"],
          "This shows that the speaker’s love is mixed with weariness, but not that distance makes the city easier to love."],
        [["and it is true: at four the bakeries glow,", "the trains still breathe beneath the avenue,"],
          "This celebrates the city’s round-the-clock life up close, not affection that depends on distance."],
        [["The city never sleeps, the posters say,"],
          "This repeats a slogan about the city rather than the speaker’s own feeling about it."],
      ],
    },
  ];

  // A quotation: consecutive lines joined with " / ", without the trailing
  // comma, colon, or semicolon a mid-sentence line ends with.
  const quoteLines = (lines) => `“${lines.join(" / ").replace(/[,:;]$/, "")}”`;

  const poemQuotation = {
    ...RW,
    id: "evidence-poem-quotation",
    skill: "Command of Evidence",
    subskill: "textual evidence",
    // Medium (relabeled from Hard after the 2026-09-26 cold review found it
    // played Medium): the poems are accessible and the whole poem is shown.
    // The key was the latest of the four quotations in 9 of 10 poems; claims
    // now reach earlier lines too, so it is the latest in about half.
    difficulty: "Medium",
    title: "Quotation from a poem that illustrates an interpretive claim",
    recognize:
      "The claim interprets the poem, often as a change or a two-part attitude; the right lines enact that interpretation, usually without repeating its words, while lines from before the turn or lines that echo its vocabulary show only part of it.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["too-narrow", "word-association", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(POEM_TOPICS);
      const poem = topic.poem.join("\n");
      const content = `The following text is from an original poem.\n\n${poem}\n\n${topic.claim}`;
      const correct = quoteLines(topic.key);
      const wrong = topic.near.map(([lines, reason]) => [quoteLines(lines), reason]);
      // Every quotation must be consecutive lines of the poem as printed.
      const inPoem = (text) => poem.includes(text.slice(1, -1).split(" / ").join("\n"));
      return mc("Medium", topic, {
        stimulus: passage(content),
        stem: "Which quotation from the poem most effectively illustrates the claim?",
        correct,
        wrong,
        explanation: topic.why,
        steps: [
          "Restate the claim in your own words, noting every part of it (a change, or two attitudes at once).",
          "Locate each quotation in the poem and read what comes before and after it.",
          "Choose the lines that show all of the claim, not only its setup or one of its parts.",
        ],
        principles: [
          "A quotation illustrates a claim only if it shows what the claim says, not merely the subject the claim is about.",
          "When a claim describes a change, lines from before the turn show only the starting point.",
        ],
        trap: "Choosing lines that repeat the claim’s subject or words, or that show only the attitude the speaker starts with.",
        hint: "Which lines would you point to if you had to prove every part of the claim?",
        verify: () =>
          [correct, ...wrong.map(([text]) => text)].every(inPoem) &&
          content.includes(topic.claim) &&
          allDistinct(correct, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence: the quotation from an original novel or play   */
  /* excerpt that illustrates a two-part claim                           */
  /* ------------------------------------------------------------------ */

  // Each topic is an original excerpt (never from a published work) with an
  // honest header, a two-part interpretive claim, and four quotations that
  // are exact passages of the excerpt: `key` shows both parts, usually
  // without the claim's words, and each near miss shows one part vividly,
  // belongs to another speaker, or echoes the claim's subject without its
  // point. The key sits early, in the middle, or last in the excerpt (the
  // 2026-09-26 cold review found the poem template's key was the latest
  // quotation 92% of the time), and it is the longest quotation in only
  // some scenes. Quotation marks inside a quotation become single quotes.
  const EXCERPT_HEADERS = {
    novel: "The following text is from an original novel.",
    play: "The following text is from an original play.",
  };
  const EXCERPT_TOPICS = [
    {
      scene: "ii-q3-novel-ferry-captain",
      kind: "novel",
      lines: [
        "Captain Oduya had run the river ferry for thirty years and still checked the ropes twice before every crossing. “The river doesn’t care how long you’ve known it,” he told the new deckhand, who had laughed at the second check. That afternoon, when a boy’s hat blew over the rail, the captain brought the ferry about at half speed, tied a line around his own waist, and leaned out to hook the hat from the water. He handed it back without a word and returned to the wheel, frowning at his watch.",
      ],
      claim: "In the novel, the narrator portrays Captain Oduya as both unfailingly cautious and quietly kind.",
      key: "tied a line around his own waist, and leaned out to hook the hat from the water",
      near: [
        ["still checked the ropes twice before every crossing",
         "This shows his caution but nothing of his kindness."],
        ["“The river doesn’t care how long you’ve known it,” he told the new deckhand, who had laughed at the second check",
         "His warning to the deckhand expresses caution, not kindness."],
        ["He handed it back without a word and returned to the wheel, frowning at his watch",
         "Returning the hat is kind, but these words show nothing of his caution, and frowning at his watch suggests impatience rather than care."],
      ],
      why: "Tying a line around his own waist shows his caution even in the middle of a rescue, and leaning out to hook a boy’s hat from the water shows a kindness he never speaks of.",
    },
    {
      scene: "ii-q3-play-marguerite-house",
      kind: "play",
      lines: [
        "MARGUERITE: You may have the house, Jules, and everything in it. I never cared for it.",
        "JULES: You grew up in it.",
        "MARGUERITE: So did the damp. (She slips a small photograph from the mantel into her coat.) I’ll want nothing else.",
        "JULES: Not even the piano? You played it every night.",
        "MARGUERITE: Every night Father made me. Sell it. (At the door, she stops and touches the frame lightly, as if it were a sleeping animal she did not want to wake, then goes out.)",
      ],
      claim: "In the play, Marguerite is presented as professing indifference to the family house while revealing an attachment to it.",
      key: "(She slips a small photograph from the mantel into her coat.) I’ll want nothing else.",
      near: [
        ["You may have the house, Jules, and everything in it. I never cared for it.",
         "This shows her professed indifference but nothing of her attachment."],
        ["Every night Father made me. Sell it.",
         "This dismisses the piano and shows only her indifference, not any attachment."],
        ["(At the door, she stops and touches the frame lightly, as if it were a sleeping animal she did not want to wake, then goes out.)",
         "This gesture reveals attachment, but she professes nothing here; the claim needs both her words and what she reveals."],
      ],
      why: "Slipping the photograph into her coat reveals an attachment, while “I’ll want nothing else,” said in the same breath, keeps up her profession of indifference.",
    },
    {
      scene: "ii-q3-novel-rival-bakery",
      kind: "novel",
      lines: [
        "For eleven years Ines had sold her bread a penny cheaper than the Bellamy shop across the square, and she had never once set foot inside it. Each morning at five she unlocked her door and pretended not to watch the lights come on across the square. When the old man fell ill that winter and his windows stayed dark, she lowered her prices by another penny and left a basket of rolls, unsigned, on his step each night. “Somebody has to keep his customers from forgetting where he is,” she told her assistant, scowling.",
      ],
      claim: "In the novel, Ines is portrayed as both fiercely competitive with the Bellamy shop and secretly generous toward its owner.",
      key: "she lowered her prices by another penny and left a basket of rolls, unsigned, on his step each night",
      near: [
        ["For eleven years Ines had sold her bread a penny cheaper than the Bellamy shop across the square, and she had never once set foot inside it",
         "This shows her rivalry but nothing of her generosity."],
        ["Each morning at five she unlocked her door and pretended not to watch the lights come on across the square",
         "This shows her attention to her rival, not generosity toward him."],
        ["“Somebody has to keep his customers from forgetting where he is,” she told her assistant, scowling",
         "Her remark shows concern for Bellamy’s business, which cuts against competing with him; it does not show her rivalry."],
      ],
      why: "Lowering her prices while her rival is ill shows her competitiveness, and leaving him a basket of rolls, unsigned, shows a generosity she keeps secret.",
    },
    {
      scene: "ii-q3-play-lighthouse-sisters",
      kind: "play",
      lines: [
        "ROSA: They’re automating the light in March. After that, no keeper.",
        "ELENA: Good. Forty years of climbing those stairs in the dark, in every kind of weather. Let a machine do it for a change.",
        "ROSA: You’ll have nothing to do.",
        "ELENA: I’ll sleep through a whole night for once. (She goes to the window and counts the flashes under her breath.) Three, four. It’s running slow again.",
        "ROSA: It isn’t yours to worry about anymore. Let the machine do it.",
      ],
      claim: "In the play, Elena is portrayed as welcoming the end of her duties as keeper while remaining unable to set them aside.",
      key: "I’ll sleep through a whole night for once. (She goes to the window and counts the flashes under her breath.)",
      near: [
        ["Good. Forty years of climbing those stairs in the dark, in every kind of weather. Let a machine do it for a change.",
         "This shows Elena welcoming the change but not her inability to let her duties go."],
        ["Three, four. It’s running slow again.",
         "This shows her still minding the light but nothing of her welcoming the end of her duties."],
        ["It isn’t yours to worry about anymore. Let the machine do it.",
         "Rosa says this, not Elena; it names the duty Elena cannot set aside without showing Elena herself."],
      ],
      why: "Looking forward to sleeping through the night shows Elena welcoming the end of her duties, and counting the flashes under her breath, in the same moment, shows that she cannot set them aside.",
    },
    {
      scene: "ii-q3-novel-violin-teacher",
      kind: "novel",
      lines: [
        "Mr. Castellan never praised a student aloud. When Lucia played the sonata through without a single error, he said only, “Again, and this time listen to it.” She played it again. Afterward, while she packed her violin, he wrote the date on the first page of her music without a word, beside the dates of the few students who had played it well before her. On her way out she heard him scold the next student for rushing the opening bars. He did not look up when she said goodbye.",
      ],
      claim: "In the novel, Mr. Castellan is portrayed as both sparing with open praise and proud of Lucia’s playing.",
      key: "he wrote the date on the first page of her music without a word, beside the dates of the few students who had played it well before her",
      near: [
        ["he said only, “Again, and this time listen to it.”",
         "This shows how sparing he is with praise, but not that he is proud of her playing."],
        ["she heard him scold the next student for rushing the opening bars",
         "This shows how demanding he is with another student, not his pride in Lucia."],
        ["He did not look up when she said goodbye.",
         "This shows his reserve but nothing of his pride in her playing."],
      ],
      why: "Writing the date “without a word” shows that he keeps his praise unspoken, and placing her among “the few students who had played it well” shows his pride in her playing.",
    },
    {
      scene: "ii-q3-novel-string-drawer",
      kind: "novel",
      lines: [
        "Aunt Wilhelmina saved everything: string, jar lids, the backs of envelopes, the stubs of candles too short to light. My brothers mocked the drawer in which she kept the string, sorted by length, and I confess I laughed with them. But in the winter the mill closed, the drawer we had laughed at supplied the twine that tied our boots, and her jar of pennies bought the coal. She never once reminded us of our laughter; she only asked, each evening, whether anyone had found a piece of string.",
      ],
      claim: "In the novel, the narrator suggests that Aunt Wilhelmina’s thrift, which the family had found ridiculous, proved essential to them in hard times.",
      key: "the drawer we had laughed at supplied the twine that tied our boots",
      near: [
        ["Aunt Wilhelmina saved everything: string, jar lids, the backs of envelopes, the stubs of candles too short to light",
         "This shows how thrifty she was but not that her thrift proved essential."],
        ["My brothers mocked the drawer in which she kept the string, sorted by length, and I confess I laughed with them",
         "This shows the family finding her thrift ridiculous but not that it later proved essential."],
        ["She never once reminded us of our laughter; she only asked, each evening, whether anyone had found a piece of string",
         "This recalls the family’s laughter and her continued saving, but it does not show her thrift sustaining them in the hard winter."],
      ],
      why: "“The drawer we had laughed at” recalls the family’s ridicule, and its twine tying their boots in the winter the mill closed shows her thrift carrying them through hard times.",
    },
    {
      scene: "ii-q3-play-chef-kitchen",
      kind: "play",
      lines: [
        "GUS: Thirty years at this stove, and not one night off. Tomorrow it’s yours, if you want it.",
        "DANA: I’ll change the menu, you know. Nobody orders the liver anymore.",
        "GUS: Change whatever you like. It’s your kitchen now. (He picks up his knife roll, puts it down, then unrolls it and starts sharpening.) This one pulls to the left, so you have to lean into it and keep it on the stone longer than you think.",
        "DANA: Gus. Go home.",
        "GUS: (still sharpening) In a minute.",
      ],
      claim: "In the play, Gus says that he is ready to hand over his kitchen, but his actions show that he cannot yet let it go.",
      key: "It’s your kitchen now. (He picks up his knife roll, puts it down, then unrolls it and starts sharpening.)",
      near: [
        ["Thirty years at this stove, and not one night off. Tomorrow it’s yours, if you want it.",
         "Gus says he is handing over the kitchen, but nothing here shows that he cannot let it go."],
        ["This one pulls to the left, so you have to lean into it and keep it on the stone longer than you think.",
         "Advice about a knife shows his lingering care for the kitchen, but not his saying that he is ready to leave it."],
        ["(still sharpening) In a minute.",
         "This shows him lingering, but not his claim to be ready to hand the kitchen over."],
      ],
      why: "“It’s your kitchen now” is Gus saying he is ready, and picking up his knife roll only to unroll it and start sharpening shows that he cannot yet let the kitchen go.",
    },
    {
      scene: "ii-q3-novel-parish-maps",
      kind: "novel",
      lines: [
        "Tobias measured every lane in the parish twice, once walking and once with a surveyor’s chain, and redrew any sheet on which a single hedge was out of place. The maps filled three cabinets in his study. When the county surveyor asked to borrow them for the new road, Tobias said he supposed so, if the man wanted them, and went back to inking the exact bend of a stream with a single-hair brush. The maps were returned a year later, unopened, and he did not notice.",
      ],
      claim: "In the novel, the narrator portrays Tobias as both meticulous in his mapmaking and indifferent to whether anyone uses his maps.",
      key: "Tobias said he supposed so, if the man wanted them, and went back to inking the exact bend of a stream with a single-hair brush",
      near: [
        ["Tobias measured every lane in the parish twice, once walking and once with a surveyor’s chain, and redrew any sheet on which a single hedge was out of place",
         "This shows his meticulous work but nothing about whether he cares if anyone uses the maps."],
        ["The maps filled three cabinets in his study.",
         "This shows how many maps he made, not how carefully he made them or how little he cared about their use."],
        ["The maps were returned a year later, unopened, and he did not notice.",
         "This shows his indifference to the maps’ use but not his meticulousness."],
      ],
      why: "His offhand “he supposed so, if the man wanted them” shows indifference to whether the maps are used, and going straight back to inking the exact bend of a stream with a single-hair brush shows how meticulous he is.",
    },
    {
      scene: "ii-q3-novel-mountain-letter",
      kind: "novel",
      lines: [
        "Hana wrote to her sister every Sunday from the mountain school. This week she described the snow, which had reached the classroom windows, and the goat that had eaten a page of the headmaster’s ledger. “You would laugh to see me in three sweaters,” she wrote, “and you would be the only one laughing, since no one here has spoken to me since Tuesday.” She drew a small goat at the bottom of the page and signed her name with a flourish.",
      ],
      claim: "In the novel, Hana’s letter to her sister is portrayed as both cheerful in tone and revealing of her loneliness.",
      key: "and you would be the only one laughing, since no one here has spoken to me since Tuesday.",
      near: [
        ["This week she described the snow, which had reached the classroom windows, and the goat that had eaten a page of the headmaster’s ledger.",
         "This shows the letter’s cheerful news but nothing of Hana’s loneliness."],
        ["You would laugh to see me in three sweaters,",
         "This joke shows the letter’s cheerful tone but not the loneliness that the next words reveal."],
        ["She drew a small goat at the bottom of the page and signed her name with a flourish.",
         "This shows her cheerful manner, not her loneliness."],
      ],
      why: "The joking “you would be the only one laughing” keeps the letter’s cheerful tone, and “no one here has spoken to me since Tuesday” reveals how lonely she is.",
    },
    {
      scene: "ii-q3-play-mayor-bridge",
      kind: "play",
      lines: [
        "MAYOR: The bridge will be finished by June. I don’t care who gets the credit.",
        "AIDE: The newspaper wants a photograph with Mayor Holt. He started the project.",
        "MAYOR: Of course. Invite him. (Pause.) Put him on the left, where the sun will be in his eyes.",
        "AIDE: Should I mention him in the speech?",
        "MAYOR: Mention the engineers. Mention the weather. (Pause.) Mention the engineers again, and the weather twice.",
      ],
      claim: "In the play, the Mayor claims to be above petty rivalry while showing that she resents her predecessor’s share of the credit.",
      key: "Of course. Invite him. (Pause.) Put him on the left, where the sun will be in his eyes.",
      near: [
        ["The bridge will be finished by June. I don’t care who gets the credit.",
         "This is the Mayor’s claim to be above rivalry, with no sign yet of her resentment."],
        ["The newspaper wants a photograph with Mayor Holt. He started the project.",
         "The aide says this; it explains Holt’s claim to credit but shows nothing of the Mayor’s attitude."],
        ["Mention the engineers. Mention the weather. (Pause.) Mention the engineers again, and the weather twice.",
         "Leaving Holt out of the speech hints at resentment, but these words show nothing of her claim to be above rivalry."],
      ],
      why: "“Of course. Invite him” keeps up her show of generosity, while placing Holt where the sun will be in his eyes reveals the petty resentment beneath it.",
    },
    {
      scene: "ii-q3-novel-new-neighbors",
      kind: "novel",
      lines: [
        "Mrs. Adebayo locked her gate on moving day and left stew on the newcomers’ step that evening. She told her son that she did not care to know people who played music at such hours. When their moving van blocked the lane, she watched from behind her curtain for an hour. Two days later she sent over a second pot, larger than the first, with a note asking whether they needed anything else.",
      ],
      claim: "In the novel, Mrs. Adebayo is portrayed as both wary of her new neighbors and unable to resist helping them.",
      key: "Mrs. Adebayo locked her gate on moving day and left stew on the newcomers’ step that evening.",
      near: [
        ["She told her son that she did not care to know people who played music at such hours.",
         "This shows her wariness of the neighbors but not her helping them."],
        ["When their moving van blocked the lane, she watched from behind her curtain for an hour.",
         "Watching from behind the curtain shows wariness, not help."],
        ["Two days later she sent over a second pot, larger than the first, with a note asking whether they needed anything else.",
         "This shows her helping the neighbors but not her wariness of them."],
      ],
      why: "Locking her gate the day the family arrives shows her wariness, and leaving stew on their step that same evening shows that she cannot resist helping them.",
    },
    {
      scene: "ii-q3-play-old-actor",
      kind: "play",
      lines: [
        "NINA: The neighbors say you were wonderful on the stage.",
        "VICTOR: The neighbors are very kind, and very deaf.",
        "NINA: Forty years. You must miss it.",
        "VICTOR: I miss nothing. Other men’s words, other men’s coats. (He sits, then stands again, then turns toward the window as though a thousand faces waited there.) Not for a moment, my dear.",
      ],
      claim: "In the play, Victor insists that he does not miss performing even as he performs his denial.",
      key: "(He sits, then stands again, then turns toward the window as though a thousand faces waited there.) Not for a moment, my dear.",
      near: [
        ["The neighbors are very kind, and very deaf.",
         "This joke deflects Nina’s praise; it neither denies missing the stage nor shows him performing."],
        ["Forty years. You must miss it.",
         "Nina says this, not Victor; it raises the question without showing his denial or his performance."],
        ["I miss nothing. Other men’s words, other men’s coats.",
         "This states his denial but shows nothing of his performing it."],
      ],
      why: "Turning to the window “as though a thousand faces waited there” shows Victor performing, and “Not for a moment, my dear” is the denial he performs.",
    },
    {
      scene: "ii-q3-novel-acceptance-letter",
      kind: "novel",
      lines: [
        "When the acceptance letter came, Dmitri read it once in the doorway and again on the stairs. He read it a third time aloud to the empty kitchen, grinning, and then folded it away before his parents came home. At dinner he mentioned it in the flat voice he used for grades, and when his mother cried out, he shrugged and asked for the salt. Later his sister heard him humming in his room, which he had not done in years.",
      ],
      claim: "In the novel, Dmitri is portrayed as both elated by his acceptance and determined to keep that elation from his family.",
      key: "He read it a third time aloud to the empty kitchen, grinning, and then folded it away before his parents came home.",
      near: [
        ["When the acceptance letter came, Dmitri read it once in the doorway and again on the stairs.",
         "Rereading the letter hints at his excitement, but nothing here shows him hiding it."],
        ["At dinner he mentioned it in the flat voice he used for grades, and when his mother cried out, he shrugged and asked for the salt.",
         "This shows him hiding his feelings but not the elation he hides."],
        ["Later his sister heard him humming in his room, which he had not done in years.",
         "This shows his happiness but not that he is trying to keep it from his family."],
      ],
      why: "Grinning as he reads the letter aloud to an empty kitchen shows his elation, and folding it away before his parents come home shows him keeping it from them.",
    },
    {
      scene: "ii-q3-novel-flower-show",
      kind: "novel",
      lines: [
        "Mr. Pryce told anyone who asked that the village flower show was a contest of vanity, and that he entered only to keep the vicar company. He said it again on the morning of the show, loudly, at the gate: a contest of vanity. He had, however, been up since four, washing each leaf of his begonia with milk and a soft brush. When the judges pinned a blue ribbon to his pot, he said that they were plainly short of better entries, and did not take his hand off the ribbon for the rest of the afternoon.",
      ],
      claim: "In the novel, Mr. Pryce is portrayed as publicly dismissive of the flower show but privately eager to succeed in it.",
      key: "he said that they were plainly short of better entries, and did not take his hand off the ribbon for the rest of the afternoon",
      near: [
        ["Mr. Pryce told anyone who asked that the village flower show was a contest of vanity",
         "This shows his public dismissal of the show but not his eagerness to succeed."],
        ["He said it again on the morning of the show, loudly, at the gate: a contest of vanity.",
         "This repeats his public dismissal without any sign of his eagerness."],
        ["He had, however, been up since four, washing each leaf of his begonia with milk and a soft brush.",
         "This shows his eagerness to succeed but not his public dismissal of the show."],
      ],
      why: "Dismissing his win as the judges’ lack of better entries keeps up his public scorn, while keeping his hand on the ribbon all afternoon shows how much the success means to him.",
    },
  ];

  // A quotation as a choice: in double quotation marks, with any quotation
  // marks it contains turned to single ones.
  const quoteExcerpt = (text) => `“${text.replace(/“/g, "‘").replace(/”/g, "’")}”`;

  const excerptQuotation = {
    ...RW,
    id: "evidence-excerpt-quotation",
    skill: "Command of Evidence",
    subskill: "textual evidence",
    difficulty: "Medium",
    title: "Quotation from a novel or play excerpt that illustrates a two-part claim",
    recognize:
      "Split the claim into its two parts and test each quotation in context: the answer shows both at once, often without the claim's words, while the others show one part, belong to another speaker, or only echo the claim.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["too-narrow", "misattributed-view", "word-association"],
    build(t) {
      const topic = t.pick(EXCERPT_TOPICS);
      const excerpt = topic.lines.join("\n");
      const content = `${EXCERPT_HEADERS[topic.kind]}\n\n${excerpt}\n\n${topic.claim}`;
      const correct = quoteExcerpt(topic.key);
      const wrong = topic.near.map(([text, reason]) => [quoteExcerpt(text), reason]);
      return mc("Medium", topic, {
        stimulus: passage(content),
        stem: `Which quotation from the ${topic.kind === "play" ? "play" : "novel"} most effectively illustrates the claim?`,
        correct,
        wrong,
        explanation: topic.why,
        steps: [
          "Split the claim into its two parts and restate each in your own words.",
          "Find each quotation in the excerpt and read it in context: who speaks, and what the stage direction or surrounding sentence shows.",
          "Choose the quotation that shows both parts at once; reject one that shows a single part, belongs to another speaker, or only repeats the claim's subject.",
        ],
        principles: [
          "Evidence for a two-part claim must show both parts.",
          "A line spoken by another character, or a line that shares the claim's words, can look like support without showing the claim.",
        ],
        trap: "Choosing the most vivid illustration of one part of the claim, or a line whose words echo the claim.",
        hint: "Which lines would you point to if you had to prove both halves of the claim at once?",
        verify: () =>
          [topic.key, ...topic.near.map(([text]) => text)].every((text) => excerpt.includes(text)) &&
          topic.near.length === 3 && content.includes(topic.claim) && allDistinct(correct, wrong),
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Command of Evidence (quantitative): complete a statement with data  */
  /* read from a bar or line graph                                       */
  /* ------------------------------------------------------------------ */

  // A value on the chart grid in [low, high].
  const gridPick = (t, low, high, step) => Math.round((low + t.int(0, Math.round((high - low) / step)) * step) * 1e6) / 1e6;

  // Each frame is one invented data set (fresh values each draw) and one
  // statement the data must complete. Kinds:
  //   exception: in a two-year bar graph every category moves one way but
  //     one; the key is that category. Offered instead: a category that
  //     moved the usual way, a category read with the legend reversed, and
  //     a same-year comparison of two categories.
  //   gain: with/without bars; the key has the largest (or smallest) gain.
  //     Offered instead: the category with the highest (lowest) treated
  //     value, the runner-up gain, and a misread bar.
  //   crossing: two lines; the key is the first year the rising line is
  //     above the other. Offered instead: an earlier year (still below), a
  //     later year (above, but not first), and the year before the crossing
  //     read with the lines swapped.
  //   peak: two lines; the key is the year the named line is highest.
  //     Offered instead: the other line's peak read as this line's, the year
  //     after the peak, and the first year.
  const GRAPH_COMPLETE_FRAMES = [
    {
      scene: "ii-g1-plover-marshes",
      kind: "exception",
      moves: "fell",
      chart: "bar",
      title: "Nesting pairs of plovers at four marshes, 2014 and 2022",
      xLabel: "Marsh",
      yLabel: "Nesting pairs",
      yMin: 0, yMax: 60, yStep: 5,
      categories: ["Alder", "Brinley", "Cress", "Dunlin"],
      series: ["2014", "2022"],
      plural: "marshes",
      text: "Volunteers with the Selby Coast Bird Survey counted nesting pairs of plovers at four marshes in 2014 and again in 2022. Between the two surveys, the number of pairs rose at three of the marshes, but at one marsh it fell: ______",
      item: (c, a, b) => `${c}, where the count ${b < a ? "fell" : "rose"} from ${a} pairs in 2014 to ${b} pairs in 2022`,
      item2: (c, a, b) => `${c}, whose count ${b < a ? "fell" : "rose"} from ${a} to ${b} nesting pairs between 2014 and 2022`,
      level: (l, m, less) => `${l}, which had ${less ? "fewer" : "more"} nesting pairs in 2022 than ${m} did`,
    },
    {
      scene: "ii-g1-branch-visits",
      kind: "exception",
      moves: "rose",
      chart: "bar",
      title: "Average weekly visits to four library branches, 2019 and 2023",
      xLabel: "Library branch",
      yLabel: "Weekly visits (hundreds)",
      yMin: 0, yMax: 24, yStep: 2,
      categories: ["Central", "Eastgate", "Hillcrest", "Northside"],
      series: ["2019", "2023"],
      plural: "branches",
      text: "The Tolland library system recorded the average number of weekly visits to each of its four branches in 2019 and 2023. Visits declined at three of the branches over that period, and only one branch drew more visitors in 2023 than in 2019: ______",
      item: (c, a, b) => `${c}, where weekly visits ${b < a ? "fell" : "rose"} from ${a} hundred in 2019 to ${b} hundred in 2023`,
      item2: (c, a, b) => `${c}, whose weekly visits ${b < a ? "fell" : "rose"} from ${a} hundred to ${b} hundred between 2019 and 2023`,
      level: (l, m, less) => `${l}, which drew ${less ? "fewer" : "more"} weekly visits in 2023 than ${m} did`,
    },
    {
      scene: "ii-g1-city-parks",
      kind: "exception",
      moves: "fell",
      chart: "bar",
      title: "Average daily visitors to four parks, 2015 and 2023",
      xLabel: "Park",
      yLabel: "Daily visitors (hundreds)",
      yMin: 0, yMax: 24, yStep: 2,
      categories: ["Elm", "Fairview", "Grove", "Harbor"],
      series: ["2015", "2023"],
      plural: "parks",
      text: "Staff of the Renton parks department estimated the average number of daily visitors to four city parks in 2015 and in 2023. Most of the parks grew busier over those years, but one park drew fewer visitors in 2023 than it had in 2015: ______",
      item: (c, a, b) => `${c} Park, where daily visitors ${b < a ? "fell" : "rose"} from ${a} hundred in 2015 to ${b} hundred in 2023`,
      item2: (c, a, b) => `${c} Park, whose daily visitors ${b < a ? "fell" : "rose"} from ${a} hundred to ${b} hundred between 2015 and 2023`,
      level: (l, m, less) => `${l} Park, which drew ${less ? "fewer" : "more"} daily visitors in 2023 than ${m} Park did`,
    },
    {
      scene: "ii-g1-cover-crop-yields",
      kind: "gain",
      extreme: "largest",
      chart: "bar",
      title: "Yield of four crops with and without a winter cover crop",
      xLabel: "Crop",
      yLabel: "Yield (kg per plot)",
      yMin: 0, yMax: 60, yStep: 5,
      categories: ["Cabbage", "Corn", "Potatoes", "Squash"],
      series: ["Without cover crop", "With cover crop"],
      text: "At the Hollins research farm, agronomists sowed clover as a winter cover crop on some plots and left others bare, then grew four crops on every plot the next summer and weighed each harvest. The cover crop raised the yield of all four crops, but the gain was greatest for ______",
      item: (c, a, b) => `${c.toLowerCase()}, whose yield rose from ${a} to ${b} kilograms per plot`,
      item2: (c, a, b) => `${c.toLowerCase()}, which yielded ${a} kilograms per plot without the cover crop and ${b} with it`,
      top: (c, b) => `${c.toLowerCase()}, which had the highest yield after the cover crop (${b} kilograms per plot)`,
    },
    {
      scene: "ii-g1-summer-reading",
      kind: "gain",
      extreme: "smallest",
      chart: "bar",
      title: "Books read per student over the summer, before and after a reading program",
      xLabel: "School",
      yLabel: "Books read per student",
      yMin: 0, yMax: 24, yStep: 2,
      categories: ["Adams", "Brook", "Carver", "Dale"],
      series: ["Before program", "After program"],
      text: "After four elementary schools in the Pell district began a summer reading program, the average number of books each student read over the summer rose at every school. The increase was far smaller at one school, however: ______",
      item: (c, a, b) => `${c}, where the average rose from ${a} to ${b} books per student`,
      item2: (c, a, b) => `${c}, where students read an average of ${a} books before the program and ${b} after it`,
      top: (c, b) => `${c}, where students read the fewest books after the program began (${b} per student)`,
    },
    {
      scene: "ii-g1-lake-temperatures",
      kind: "crossing",
      chart: "line",
      title: "Average July surface temperature of two lakes",
      xLabel: "Year",
      yLabel: "Temperature (°C)",
      yMin: 10, yMax: 26, yStep: 2,
      categories: ["2000", "2005", "2010", "2015", "2020"],
      series: ["South lake", "North lake"],
      text: "Limnologists measured the average July surface temperature of two neighboring lakes every five years. In 2000 the north lake was the warmer of the two, but the south lake warmed faster and was first the warmer lake in ______",
      item: (y, a, b) => `${y}, when the south lake averaged ${a}°C and the north lake ${b}°C`,
      item2: (y, a, b) => `${y}, when the north lake averaged ${b}°C and the south lake ${a}°C`,
    },
    {
      scene: "ii-g1-ebook-loans",
      kind: "crossing",
      chart: "line",
      title: "Monthly loans of e-books and print books",
      xLabel: "Year",
      yLabel: "Monthly loans (thousands)",
      yMin: 0, yMax: 40, yStep: 4,
      categories: ["2008", "2012", "2016", "2020", "2024"],
      series: ["E-books", "Print books"],
      text: "The Marren regional library network tracked its monthly loans of print books and e-books. Print loans far outnumbered e-book loans in 2008, but e-book loans grew quickly and first exceeded print loans in ______",
      item: (y, a, b) => `${y}, when the network lent ${a} thousand e-books and ${b} thousand print books a month`,
      item2: (y, a, b) => `${y}, when monthly loans were ${b} thousand print books and ${a} thousand e-books`,
    },
    {
      scene: "ii-g1-owl-counts",
      kind: "crossing",
      chart: "line",
      title: "Barn owls and tawny owls counted on the Kestle reserve",
      xLabel: "Year",
      yLabel: "Owls counted",
      yMin: 0, yMax: 40, yStep: 4,
      categories: ["2004", "2008", "2012", "2016", "2020"],
      series: ["Barn owls", "Tawny owls"],
      text: "Each spring, the Kestle Woodland Trust counts the barn owls and tawny owls on its reserve. Tawny owls outnumbered barn owls in the first counts, but after nest boxes were put up, barn owls first outnumbered tawny owls in ______",
      item: (y, a, b) => `${y}, when the count found ${a} barn owls and ${b} tawny owls`,
      item2: (y, a, b) => `${y}, when the count found ${b} tawny owls and ${a} barn owls`,
    },
    {
      scene: "ii-g1-harbor-ferry",
      kind: "peak",
      chart: "line",
      title: "Average daily riders on a harbor ferry and a bus route",
      xLabel: "Year",
      yLabel: "Daily riders (hundreds)",
      yMin: 0, yMax: 30, yStep: 3,
      categories: ["2012", "2014", "2016", "2018", "2020"],
      series: ["Ferry", "Bus"],
      text: "The Brask transit agency recorded average daily ridership on its harbor ferry and on the bus route that runs beside it. Ferry ridership climbed for several years and then declined; it was highest in ______",
      item: (y, v) => `${y}, when the ferry carried an average of ${v} hundred riders a day`,
      item2: (y, v) => `${y}, when average daily ferry ridership was ${v} hundred`,
    },
    {
      scene: "ii-g1-museum-attendance",
      kind: "peak",
      chart: "line",
      title: "Annual attendance at two museums in Arlen",
      xLabel: "Year",
      yLabel: "Visitors (thousands)",
      yMin: 0, yMax: 60, yStep: 5,
      categories: ["2015", "2017", "2019", "2021", "2023"],
      series: ["Science museum", "Art museum"],
      text: "Two museums in the city of Arlen report their annual attendance every other year. Attendance at the science museum rose to a high point and then fell off; the science museum drew its largest crowd in ______",
      item: (y, v) => `${y}, when the science museum drew ${v} thousand visitors`,
      item2: (y, v) => `${y}, when attendance at the science museum reached ${v} thousand`,
    },
  ];

  // Values for each kind, redrawn until every constraint that makes the key
  // unique holds. Returns { values: [seriesA[], seriesB[]], roles }.
  function graphCompleteData(t, frame) {
    const { yMin, yMax, yStep: st } = frame;
    const n = frame.categories.length;
    const grid = (low, high) => gridPick(t, Math.max(low, yMin), Math.min(high, yMax), st);
    // A "gain" draw succeeds only about one time in twenty, so allow many
    // attempts; 200 left about one seed in 12,000 without a graph.
    for (let attempt = 0; attempt < 2000; attempt += 1) {
      if (frame.kind === "exception") {
        // `moves` is how the exception moves; the other three move the other way.
        const odd = frame.moves === "fell" ? -1 : 1;
        const key = t.int(0, n - 1);
        const first = [];
        const second = [];
        for (let index = 0; index < n; index += 1) {
          const sign = index === key ? odd : -odd;
          const from = sign > 0 ? grid(yMin + st, yMax - 2 * st) : grid(yMin + 3 * st, yMax);
          const room = sign > 0 ? (yMax - from) / st : (from - yMin - st) / st;
          const size = t.int(2, Math.max(2, Math.min(6, Math.floor(room))));
          first.push(from);
          second.push(Math.round((from + sign * size * st) * 1e6) / 1e6);
        }
        const others = t.shuffle([...Array(n).keys()].filter((index) => index !== key));
        const [swap, usual, level] = others;
        const ok = second.every((v) => v > yMin && v <= yMax) && second[level] !== second[usual];
        if (ok) return { values: [first, second], roles: { key, swap, usual, level } };
      } else if (frame.kind === "gain") {
        // Roles first, then values: the key has the extreme gain, the
        // runner-up the next, and `top` the extreme treated value although
        // its gain is neither; `misread` is read one step past the key.
        const largest = frame.extreme === "largest";
        const [key, runner, top, misread] = t.shuffle([...Array(n).keys()]);
        const steps = t.sample([1, 2, 3, 4, 5, 6, 7], 4).sort((p, q) => q - p);
        const gains = Array(n);
        const ranked = largest ? steps : steps.slice().reverse();
        gains[key] = ranked[0] * st;
        gains[runner] = ranked[1] * st;
        [gains[top], gains[misread]] = t.shuffle([ranked[2] * st, ranked[3] * st]);
        const second = Array(n);
        second[top] = largest ? gridPick(t, yMax - 2 * st, yMax, st) : gridPick(t, yMin + gains[top] + st, yMin + gains[top] + 3 * st, st);
        const rest = [key, runner, misread];
        const pool = [];
        for (let v = yMin + st; v <= yMax; v = Math.round((v + st) * 1e6) / 1e6) {
          if (largest ? v < second[top] : v > second[top]) pool.push(v);
        }
        t.sample(pool, 3).forEach((v, index) => { second[rest[index]] = v; });
        const first = second.map((v, index) => Math.round((v - gains[index]) * 1e6) / 1e6);
        const apparent = largest ? gains[key] + st : gains[key] - st;
        const wrongFrom = Math.round((second[misread] - apparent) * 1e6) / 1e6;
        const ok =
          second.every((v) => v !== undefined && v <= yMax) && first.every((v) => v > yMin) &&
          gains[key] >= 2 * st && wrongFrom > yMin && wrongFrom !== first[misread] && apparent > 0;
        if (ok) return { values: [first, second], roles: { key, runner, top, misread, wrongFrom } };
      } else if (frame.kind === "crossing") {
        const cross = t.int(2, 3);
        const other = [];
        const rising = [];
        let level = grid(yMin + 3 * st, yMax - 4 * st);
        for (let index = 0; index < n; index += 1) {
          level = Math.round((level + t.int(-1, 1) * st) * 1e6) / 1e6;
          other.push(level);
          const gap = t.int(1, 3) * st;
          rising.push(Math.round((index < cross ? level - gap : level + gap) * 1e6) / 1e6);
        }
        const values = [rising, other];
        const ok = values.every((line) => line.every((v) => v >= yMin && v <= yMax)) &&
          rising[0] < rising[n - 1];
        if (ok) return { values, roles: { cross } };
      } else {
        // peak: the named line peaks at p, the other line at q != p.
        // Falls by one or two grid steps per year on each side of the peak.
        const hill = (peak) => {
          const line = Array(n);
          line[peak] = grid(yMin + 5 * st, yMax);
          for (let index = peak - 1; index >= 0; index -= 1) line[index] = Math.round((line[index + 1] - t.int(1, 2) * st) * 1e6) / 1e6;
          for (let index = peak + 1; index < n; index += 1) line[index] = Math.round((line[index - 1] - t.int(1, 2) * st) * 1e6) / 1e6;
          return line;
        };
        const p = t.int(1, 3);
        const q = t.pick([0, 1, 2, 3, 4].filter((index) => index !== p && Math.abs(index - p) >= 1));
        const named = hill(p);
        const other = hill(q);
        const strict = (line, peak) => line.every((v, index) =>
          index === peak || v < line[peak]) &&
          line.every((v, index) => index === 0 || (index <= peak ? line[index] > line[index - 1] : line[index] < line[index - 1]));
        const ok = [named, other].every((line) => line.every((v) => v > yMin && v <= yMax)) &&
          strict(named, p) && strict(other, q) && other[q] !== named[p] && other[q] !== named[q];
        if (ok) return { values: [named, other], roles: { p, q } };
      }
    }
    throw new Error(`${frame.scene}: could not draw graph values`);
  }

  function frameChart(frame, values) {
    const spec = {
      title: frame.title,
      xLabel: frame.xLabel,
      yLabel: frame.yLabel,
      yMin: frame.yMin,
      yMax: frame.yMax,
      yStep: frame.yStep,
      categories: frame.categories,
      series: frame.series.map((name, index) => ({ name, values: values[index] })),
    };
    return frame.chart === "bar" ? C.barChart(spec) : C.lineChart(spec);
  }

  const graphComplete = {
    ...RW,
    id: "quantitative-graph-complete",
    skill: "Command of Evidence",
    subskill: "quantitative evidence",
    difficulty: "Medium",
    title: "Statement completed with data read from a graph",
    recognize:
      "Work out exactly what the statement needs (an exception, the largest change, a first crossing, a peak), then read those values from the graph, checking the legend; true readings of other bars or years do not complete it.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["true-but-irrelevant", "wrong-quantity"],
    build(t) {
      const frame = t.pick(GRAPH_COMPLETE_FRAMES);
      const { values, roles } = graphCompleteData(t, frame);
      const [A, B] = values;
      const cats = frame.categories;
      const figure = frameChart(frame, values);
      // Each choice is worded one of two ways (item or item2), drawn per
      // choice, so balancedDraw can vary the key's length rank.
      const say = (...args) => (t.chance(0.5) ? frame.item : frame.item2)(...args);
      let draw;
      let why;
      if (frame.kind === "exception") {
        const { key, swap, usual, level } = roles;
        const usualMove = frame.moves === "fell" ? "rose" : "fell";
        const less = B[level] < B[usual];
        draw = () => ({
          correct: say(cats[key], A[key], B[key]),
          wrong: [
            [say(cats[usual], A[usual], B[usual]),
              `True, but at ${cats[usual]} the value ${usualMove}, like most of the ${frame.plural}; it is not the exception.`],
            [say(cats[swap], B[swap], A[swap]),
              `This reads the ${cats[swap]} bars with the legend reversed: the graph shows ${A[swap]} in ${frame.series[0]} and ${B[swap]} in ${frame.series[1]}, so the value ${usualMove}.`],
            [frame.level(cats[level], cats[usual], less),
              `True, but this compares two of the ${frame.plural} in ${frame.series[1]}; it does not show that ${cats[level]}’s own value ${frame.moves}.`],
          ],
        });
        why = `Of the four ${frame.plural}, only ${cats[key]} ${frame.moves} between ${frame.series[0]} and ${frame.series[1]} (from ${A[key]} to ${B[key]}), so it is the one the statement describes.`;
      } else if (frame.kind === "gain") {
        const { key, runner, top, misread, wrongFrom } = roles;
        const gain = (index) => Math.round((B[index] - A[index]) * 1e6) / 1e6;
        const most = frame.extreme === "largest";
        draw = () => ({
          correct: say(cats[key], A[key], B[key]),
          wrong: [
            [frame.top(cats[top], B[top]),
              `True, but this is the ${most ? "highest" : "lowest"} value ${frame.series[1].toLowerCase()}, not the ${frame.extreme} gain: ${cats[top]} rose by ${gain(top)}, while ${cats[key]} rose by ${gain(key)}.`],
            [say(cats[runner], A[runner], B[runner]),
              `True, but ${cats[runner]}’s gain of ${gain(runner)} is ${most ? "smaller" : "larger"} than ${cats[key]}’s gain of ${gain(key)}.`],
            [say(cats[misread], wrongFrom, B[misread]),
              `This misreads the ${frame.series[0].toLowerCase()} bar for ${cats[misread]}: the graph shows ${A[misread]}, not ${wrongFrom}, so its gain was ${gain(misread)}.`],
          ],
        });
        why = `The statement is about the size of each gain (the second bar minus the first). ${cats[key]} gained ${gain(key)}, the ${frame.extreme} of the four.`;
      } else if (frame.kind === "crossing") {
        const { cross } = roles;
        const before = t.int(0, cross - 2);
        const later = t.int(cross + 1, cats.length - 1);
        draw = () => ({
          correct: say(cats[cross], A[cross], B[cross]),
          wrong: [
            [say(cats[before], A[before], B[before]),
              `True, but in ${cats[before]} the ${frame.series[0].toLowerCase()} line was still below the ${frame.series[1].toLowerCase()} line.`],
            [say(cats[later], A[later], B[later]),
              `True, and the ${frame.series[0].toLowerCase()} line is above in ${cats[later]}, but it had already crossed in ${cats[cross]}; ${cats[later]} is not the first year.`],
            [say(cats[cross - 1], B[cross - 1], A[cross - 1]),
              `This swaps the two lines in ${cats[cross - 1]}: the graph shows ${A[cross - 1]} for ${frame.series[0].toLowerCase()} and ${B[cross - 1]} for ${frame.series[1].toLowerCase()}, so the crossing had not yet happened.`],
          ],
        });
        why = `The ${frame.series[0].toLowerCase()} line is below the other line through ${cats[cross - 1]} and first rises above it in ${cats[cross]} (${A[cross]} against ${B[cross]}).`;
      } else {
        const { p, q } = roles;
        const after = p + 1;
        const spare = [0, cats.length - 1, 1, 2, 3].find((index) => ![p, q, after].includes(index));
        draw = () => ({
          correct: say(cats[p], A[p]),
          wrong: [
            [say(cats[q], B[q]),
              `This reads the ${frame.series[1].toLowerCase()} line, which peaks in ${cats[q]}; the ${frame.series[0].toLowerCase()} line is at ${A[q]} that year.`],
            [say(cats[after], A[after]),
              `True, but ${cats[after]} comes after the peak; the value had already fallen from ${A[p]}.`],
            [say(cats[spare], A[spare]),
              `True, but in ${cats[spare]} the ${frame.series[0].toLowerCase()} line was lower than at its peak of ${A[p]} in ${cats[p]}.`],
          ],
        });
        why = `The ${frame.series[0].toLowerCase()} line reaches its highest point, ${A[p]}, in ${cats[p]} and is lower in every other year.`;
      }
      const { correct, wrong } = balancedDraw(t, draw);
      const content = frame.text;
      return mc("Medium", frame, {
        stimulus: passage(content),
        figure,
        stem: "Which choice most effectively uses data from the graph to complete the statement?",
        correct,
        wrong,
        explanation: `${why} The statement is completed by: ${correct}.`,
        steps: [
          "Decide what the statement needs: which category, year, or change would make it true.",
          "Read the needed values from the graph, matching each bar or line to the legend.",
          "Choose the option whose data make the statement true; true readings of other bars or years do not.",
        ],
        principles: [
          "An accurate reading of the graph still fails if it does not complete the statement.",
          "Check the legend before comparing bars or lines; reversing two series reverses every comparison.",
        ],
        trap: "Choosing an accurate reading of the wrong bar or year, or a reading made with the legend reversed.",
        hint: "What would have to be true of the data for the statement to be correct?",
        verify: () => {
          const read = C.readChartAlt(figure.alt);
          const lineA = cats.map((c) => read[frame.series[0]][c]);
          const lineB = cats.map((c) => read[frame.series[1]][c]);
          if (lineA.some((v) => !Number.isFinite(v)) || lineB.some((v) => !Number.isFinite(v))) return false;
          const nums = (text) => (text.match(/\d+(\.\d+)?/g) || []).map(Number);
          const has = (text, list) => list.every((v) => nums(text).includes(v));
          let keyOk;
          if (frame.kind === "exception") {
            const moved = cats.map((c, i) => Math.sign(lineB[i] - lineA[i]));
            const odd = frame.moves === "fell" ? -1 : 1;
            keyOk = moved.filter((m) => m === odd).length === 1 && moved[roles.key] === odd &&
              moved.every((m) => m !== 0) && has(correct, [lineA[roles.key], lineB[roles.key]]);
          } else if (frame.kind === "gain") {
            const gains = cats.map((c, i) => lineB[i] - lineA[i]);
            const target = frame.extreme === "largest" ? Math.max(...gains) : Math.min(...gains);
            keyOk = gains.every((g) => g > 0) && gains.filter((g) => g === target).length === 1 &&
              gains[roles.key] === target && has(correct, [lineA[roles.key], lineB[roles.key]]);
          } else if (frame.kind === "crossing") {
            const first = lineA.findIndex((v, i) => v > lineB[i]);
            keyOk = first === roles.cross && lineA.every((v, i) => v !== lineB[i]) &&
              lineA.slice(first).every((v, i) => v > lineB[first + i]) &&
              has(correct, [lineA[first], lineB[first]]);
          } else {
            const top = Math.max(...lineA);
            keyOk = lineA.filter((v) => v === top).length === 1 && lineA.indexOf(top) === roles.p &&
              lineA.slice(roles.p + 1).every((v, i) => v < lineA[roles.p + i]) && has(correct, [top]);
          }
          return keyOk && content.includes("______") && allDistinct(correct, wrong);
        },
      });
    },
  };

  /* Integrate chart comparisons with conditions in the text. */

  const GRAPH_RECONCILE_FRAMES = [
    {
      "scene": "ii-g2-dam-comparison-trend",
      "kind": "dam",
      "title": "Salmon returning to two rivers",
      "xLabel": "Year",
      "yLabel": "Salmon counted (thousands)",
      "yMin": 0,
      "yMax": 40,
      "yStep": 5,
      "categories": [
        "2006",
        "2009",
        "2012",
        "2015",
        "2018"
      ],
      "series": [
        "Ash River",
        "Birch River"
      ],
      "values": [
        [
          10,
          15,
          20,
          20,
          20
        ],
        [
          20,
          25,
          30,
          35,
          40
        ]
      ],
      "text": "The Kell Dam began operating on the Ash River just after the 2012 salmon count. The nearby Birch River remained undammed. Fisheries biologist Nora Pell treats Birch as a comparison for regional conditions affecting both rivers. A colleague argues that the dam could not have reduced salmon returns because Ash's count never fell. Pell responds that a harmful effect could instead appear as growth that would otherwise have occurred. The graph shows counts collected by the same method in both rivers.",
      "stem": "Which choice best uses the graph to support Pell's response?",
      "correct": "Both rivers gained 10 thousand fish before 2012; afterward, Ash stopped growing while Birch gained another 10 thousand.",
      "wrong": [
        [
          "Ash had fewer fish than Birch in every year, so its lower final count reflects the same difference present before construction.",
          "Ash was already lower, but the gap widened from 10 to 20 thousand after the dam. Treating that changing gap as unchanged misses the evidence."
        ],
        [
          "Ash's count doubled before 2012 and then held steady, so its earlier growth offsets any effect the dam had after construction.",
          "Growth before construction cannot offset a later loss relative to the undammed comparison river."
        ],
        [
          "Birch gained 20 thousand fish over the full period, so the dam's effect on Ash must equal Birch's entire increase over that period.",
          "Half of Birch's increase occurred before construction. The relevant divergence is the additional 10 thousand after 2012."
        ]
      ],
      "explanation": "Before 2012, both rivers gained 10 thousand fish. After 2012, Birch gained another 10 thousand while Ash stayed at 20 thousand. Thus a stable observed count is compatible with a loss of expected growth. This supports Pell's response without proving that the dam was the only cause.",
      "hint": "What happened to the difference between the rivers before and after the dam began operating?"
    },
    {
      "scene": "ii-g2-retail-composition",
      "kind": "retail",
      "chart": "bar",
      "title": "Customers buying a sugary drink",
      "xLabel": "Survey year",
      "yLabel": "Customers buying a drink (%)",
      "yMin": 0,
      "yMax": 80,
      "yStep": 10,
      "categories": [
        "2018",
        "2022"
      ],
      "series": [
        "Supermarkets",
        "Corner shops"
      ],
      "values": [
        [
          60,
          50
        ],
        [
          20,
          10
        ]
      ],
      "text": "Marlow introduced a sugary-drink tax after a 2018 customer survey. The graph shows the share of surveyed customers buying a sugary drink at each store type. Supermarket customers made up one-fourth of the 2018 sample but three-fourths of the equally large 2022 sample; everyone else used corner shops. Analyst Farid Haddad notes that the overall purchasing share rose from 30% to 40%. He takes this as evidence that purchasing became more common within the store types after the tax.",
      "stem": "Which choice best uses the graph and sampling information to evaluate Haddad's inference?",
      "correct": "Purchasing fell in each store type; the overall rise reflects greater representation of the type with the higher purchasing share.",
      "wrong": [
        [
          "Purchasing rose within supermarkets; their greater representation therefore explains why the overall share increased after the tax.",
          "Supermarket purchasing fell from 60% to 50%; the shift toward supermarkets, rather than a within-type increase, raises the pooled share."
        ],
        [
          "Purchasing fell within both store types; equal total sample sizes therefore require the overall purchasing share to have fallen too.",
          "Equal sample sizes do not imply equal composition. Weighting the two types gives 30% in 2018 and 40% in 2022."
        ],
        [
          "Purchasing rose within corner shops; their smaller representation therefore conceals part of the increase in the overall share.",
          "The corner-shop share fell from 20% to 10%, and that lower-purchasing group became less represented."
        ]
      ],
      "explanation": "Both store types show a decline of 10 percentage points. However, the sample shifts toward supermarkets, where the purchasing share is higher in both years. The weighted overall shares are 30% and 40%, so the pooled increase cannot support Haddad's claim about increases within store types.",
      "hint": "Does the overall share describe the same mixture of store types in both surveys?"
    },
    {
      "scene": "ii-g2-highway-traffic-exposure",
      "kind": "traffic",
      "title": "Annual crashes on two highways",
      "xLabel": "Year",
      "yLabel": "Crashes",
      "yMin": 0,
      "yMax": 60,
      "yStep": 5,
      "categories": [
        "2016",
        "2020",
        "2024"
      ],
      "series": [
        "Route 3",
        "Route 17"
      ],
      "values": [
        [
          30,
          20,
          15
        ],
        [
          45,
          35,
          25
        ]
      ],
      "text": "A transportation report compares crashes on two highways before and after speed cameras were installed in 2017. Between 2016 and 2024, annual vehicle travel on Route 3 fell by half because a bypass opened, while annual vehicle travel on Route 17 was unchanged. The report claims that Route 3 had the greater improvement in safety, defined as a reduction in crashes per mile traveled, because its crash count fell by a larger percentage. The graph gives the crash counts.",
      "stem": "Which choice most directly challenges the report's use of the crash counts?",
      "correct": "Route 3's crashes and travel both halved, leaving its rate unchanged; Route 17's falling count with unchanged travel lowered its rate.",
      "wrong": [
        [
          "Route 3 ended with fewer crashes, so its crash rate was lower than Route 17's even though the highways' travel totals are unspecified.",
          "Counts cannot establish the relative crash rates when the two highways' travel totals are not given."
        ],
        [
          "Route 17 lost 20 crashes while Route 3 lost 15, so Route 17's final crash rate must be lower regardless of the miles traveled.",
          "The larger decrease in raw crashes does not establish a lower final rate. The two highways' absolute travel totals are unspecified."
        ],
        [
          "Route 3's count fell by half while Route 17's fell by less, so adjusting for the bypass strengthens the reported safety advantage.",
          "The bypass reduces the denominator by the same fraction as Route 3's crash count, eliminating the claimed rate decrease."
        ]
      ],
      "explanation": "A crash rate divides crashes by miles traveled. On Route 3, halving both quantities leaves the rate unchanged. Route 17's count falls while its travel is unchanged, so its rate falls. The larger percentage decrease in Route 3's raw count therefore does not show the greater safety improvement.",
      "hint": "Which quantity must remain comparable for a change in crashes to measure a change in safety?"
    },
    {
      "scene": "ii-g2-butterfly-mowing-interaction",
      "kind": "mowing",
      "chart": "bar",
      "title": "Butterflies in plots with two mowing schedules",
      "xLabel": "Habitat and mowing schedule",
      "yLabel": "Butterflies per survey",
      "yMin": 0,
      "yMax": 60,
      "yStep": 10,
      "categories": [
        "Meadow cut",
        "Meadow uncut",
        "Verge cut",
        "Verge uncut"
      ],
      "series": [
        "Sprayed",
        "Unsprayed"
      ],
      "values": [
        [
          10,
          20,
          20,
          30
        ],
        [
          20,
          40,
          30,
          50
        ]
      ],
      "text": "Ecologist Marisol Ruiz randomly assigned otherwise similar plots within each of four habitat-and-mowing groups to receive pesticide or remain unsprayed. Equal areas were surveyed with equal effort. Ruiz proposes that leaving vegetation uncut increases the benefit of withholding pesticide, measured as the additional butterflies in unsprayed plots, and that this pattern occurs in both meadows and roadside verges. She distinguishes that benefit from the number of butterflies a habitat supports regardless of pesticide use.",
      "stem": "Which choice most effectively uses the graph to support Ruiz's proposal?",
      "correct": "The unsprayed advantage is 10 in cut plots and 20 in uncut plots in both habitats, despite differences in their sprayed counts.",
      "wrong": [
        [
          "The unsprayed advantage is greatest on uncut verges because their count of 50 exceeds the count of 40 in uncut meadows.",
          "This compares unsprayed levels, not the unsprayed-minus-sprayed advantage. That advantage is 20 in both uncut habitats."
        ],
        [
          "The unsprayed advantage is greater on verges because their sprayed counts exceed meadow counts under both mowing schedules.",
          "Higher sprayed counts describe the habitat baseline. The pesticide contrast is equal across habitats at each mowing schedule."
        ],
        [
          "The unsprayed advantage is independent of mowing because unsprayed counts exceed sprayed counts in all four groups.",
          "A positive advantage everywhere does not make its magnitude equal: it doubles from 10 in cut plots to 20 in uncut plots."
        ]
      ],
      "explanation": "Compare sprayed and unsprayed plots within each habitat-and-mowing group. The differences are 10, 20, 10, and 20 butterflies. Thus uncut vegetation doubles the advantage associated with withholding pesticide in each habitat, although the habitats' baseline counts differ.",
      "hint": "Does the proposal concern the tallest bars, or the distance between each pair of bars?"
    },
    {
      "scene": "ii-g2-gardens-bundled-lessons",
      "kind": "gardens",
      "chart": "bar",
      "title": "Students eating vegetables daily",
      "xLabel": "School",
      "yLabel": "Students (%)",
      "yMin": 0,
      "yMax": 80,
      "yStep": 10,
      "categories": [
        "Alder",
        "Birch",
        "Cedar",
        "Dale"
      ],
      "series": [
        "Before",
        "After"
      ],
      "values": [
        [
          20,
          40,
          20,
          40
        ],
        [
          40,
          60,
          30,
          50
        ]
      ],
      "text": "Four schools introduced gardens. Alder and Birch also introduced nutrition lessons; Cedar and Dale did not. The graph shows daily vegetable consumption in the same student cohorts before and after the changes. Schools chose their own programs. Director Grace Obuya argues that, because Alder and Birch had higher final consumption than the schools with matching initial consumption, their gardens must have been more effective. A reviewer objects that the comparison does not isolate differences in the gardens' effects.",
      "stem": "Which choice best uses the graph and program information to support the reviewer's objection?",
      "correct": "At each initial level, the school with lessons gained 20 points while its counterpart gained 10, leaving lessons as a competing explanation.",
      "wrong": [
        [
          "At each initial level, the school with lessons ended 10 points higher, establishing that lessons alone caused the extra improvement.",
          "The pattern is compatible with a lesson effect but does not establish one: schools chose their own bundled programs."
        ],
        [
          "The schools that began at 40% ended above those that began at 20%, establishing that initial consumption explains all differences in gains.",
          "Both starting levels contain a 20-point gain and a 10-point gain. Initial consumption therefore does not explain the gain differences."
        ],
        [
          "Every school improved after introducing a garden, ruling out the extra lessons as an explanation for differences between the schools.",
          "Improvement everywhere does not rule out lessons contributing to the larger gains at Alder and Birch."
        ]
      ],
      "explanation": "Alder and Cedar both began at 20%, but gained 20 and 10 points, respectively; Birch and Dale both began at 40% and show the same gain contrast. The larger gains coincide with the additional lessons. Because the programs were bundled and self-selected, the chart cannot attribute the extra gains specifically to superior gardens or specifically to lessons.",
      "hint": "Which other feature changes along with the gains in the matched school comparisons?"
    },
    {
      "scene": "ii-g2-signals-observation-mix",
      "kind": "signals",
      "chart": "bar",
      "title": "Average waiting time at Doverton signals",
      "xLabel": "Signal system",
      "yLabel": "Average wait (seconds)",
      "yMin": 0,
      "yMax": 60,
      "yStep": 5,
      "categories": [
        "Old",
        "New"
      ],
      "series": [
        "Off-peak",
        "Peak"
      ],
      "values": [
        [
          10,
          15
        ],
        [
          50,
          55
        ]
      ],
      "text": "Doverton engineers measured driver waiting times before and after replacing traffic signals. Peak-hour observations formed three-fourths of the old-system sample but only one-fourth of the equally large new-system sample. All other observations were off-peak. The pooled average wait fell from 40 to 25 seconds. An engineer cites that decline as evidence that the new signals shortened waits under comparable traffic conditions. The graph separates the observations by traffic period.",
      "stem": "Which choice most effectively uses the graph to assess the engineer's evidence?",
      "correct": "Each traffic period shows a 5-second increase; the lower pooled wait comes from observing more drivers during the less congested period.",
      "wrong": [
        [
          "Each traffic period shows a 5-second increase; the pooled decline therefore implies that the two samples contained different total numbers of drivers.",
          "The total sample sizes are equal. Different proportions of peak and off-peak observations are sufficient to reverse the pooled result."
        ],
        [
          "The peak wait rose to 55 seconds while the off-peak wait was only 15, so the new signals shortened waits mainly for off-peak drivers.",
          "The off-peak wait rose from 10 to 15 seconds. Being lower than the peak wait is not an improvement from its own previous level."
        ],
        [
          "The off-peak wait rose by a larger percentage than the peak wait, so the pooled decline establishes an improvement for peak-hour drivers.",
          "Both waits rose. Comparing their percentage increases cannot turn the peak-hour increase into an improvement."
        ]
      ],
      "explanation": "Within both traffic periods, the new-system wait is 5 seconds longer. The samples' changing composition produces the pooled decline: 10/4 + 3(50)/4 = 40, while 3(15)/4 + 55/4 = 25. That decline does not show shorter waits under comparable traffic conditions.",
      "hint": "Which comparison holds the traffic period constant?"
    },
    {
      "scene": "ii-g2-nurse-survivor-denominator",
      "kind": "nurses",
      "chart": "bar",
      "title": "Nurses remaining from two original hiring cohorts",
      "xLabel": "Months after hiring",
      "yLabel": "Original cohort remaining (%)",
      "yMin": 0,
      "yMax": 100,
      "yStep": 10,
      "categories": [
        "0",
        "6",
        "12",
        "24"
      ],
      "series": [
        "Mentored",
        "Unmentored"
      ],
      "values": [
        [
          100,
          80,
          60,
          40
        ],
        [
          100,
          60,
          40,
          20
        ]
      ],
      "text": "A hospital followed two equally large cohorts of newly hired nurses, one mentored and one unmentored. No nurses joined either cohort after hiring. The graph expresses the number remaining as a percentage of each original cohort. A reviewer claims that, among nurses still employed at 12 months, the fraction leaving during the second year was the same in both cohorts: each plotted share declined by 20 percentage points between months 12 and 24. The study was observational, so comparisons alone cannot establish a mentoring effect.",
      "stem": "Which choice best uses the graph to evaluate the reviewer's claim about second-year departures?",
      "correct": "The same number left each cohort, but that number was one-third of the mentored nurses remaining and one-half of the unmentored nurses remaining.",
      "wrong": [
        [
          "The same number left each cohort, and equal original cohort sizes make that number the same fraction of the nurses present at month 12.",
          "Equal original sizes do not mean equal sizes at month 12: 60% and 40% of the original cohorts remain."
        ],
        [
          "Twice as many mentored nurses remained at month 24, so their second-year departure fraction was half the unmentored fraction.",
          "The final two-to-one ratio does not determine departure fractions, which use the different month-12 populations as denominators."
        ],
        [
          "Mentored nurses had the lower second-year departure fraction, so the graph establishes that mentoring caused the difference between cohorts.",
          "The lower fraction is supported, but causal attribution is not established by this observational comparison."
        ]
      ],
      "explanation": "Both cohorts lose 20% of their equally large original memberships during the second year. However, 60% of the mentored cohort and 40% of the unmentored cohort remained at month 12. Thus the departure fractions among those still present are 20/60, or one-third, and 20/40, or one-half. This refutes equality without establishing causation.",
      "hint": "Which nurses are included in the population named in the reviewer's claim?"
    },
    {
      "scene": "ii-g2-solar-growing-housing-stock",
      "kind": "solar",
      "title": "Homes with rooftop solar in two towns",
      "xLabel": "Year",
      "yLabel": "Homes with solar (hundreds)",
      "yMin": 0,
      "yMax": 8,
      "yStep": 1,
      "categories": [
        "2016",
        "2020",
        "2024"
      ],
      "series": [
        "Rennick",
        "Aldport"
      ],
      "values": [
        [
          2,
          3,
          4
        ],
        [
          4,
          5,
          6
        ]
      ],
      "text": "In 2016, Rennick and Aldport each had 1,000 homes. By 2024, Rennick had 2,000 homes and Aldport still had 1,000. The graph shows how many homes had rooftop solar. Analyst Priya Nair claims that Rennick was catching up in the share of homes with solar: its solar-home count doubled, whereas Aldport's increased by only half. Nair defines catching up as narrowing the difference between the towns' solar-adoption percentages, rather than between their counts.",
      "stem": "Which choice best uses the graph and housing totals to assess Nair's claim?",
      "correct": "Rennick's share stayed at 20% while Aldport's rose from 40% to 60%, widening the gap despite Rennick's faster count growth.",
      "wrong": [
        [
          "Each town added 200 solar homes, leaving the difference in their counts unchanged and therefore leaving their adoption-percentage gap unchanged.",
          "Equal additions preserve the count gap, but Rennick's doubling housing stock changes the denominator of its adoption percentage."
        ],
        [
          "Rennick's count doubled while Aldport's grew by half, narrowing the adoption-percentage gap even after accounting for the towns' housing totals.",
          "Rennick's total housing also doubled, keeping its adoption percentage fixed rather than raising it faster than Aldport's."
        ],
        [
          "Rennick reached two-thirds of Aldport's solar-home count, so its adoption percentage also reached two-thirds of Aldport's by 2024.",
          "Rennick has twice as many homes overall in 2024; its 20% adoption rate is one-third, not two-thirds, of Aldport's 60% rate."
        ]
      ],
      "explanation": "The graph's hundreds correspond to 200 and 400 solar homes in Rennick and 400 and 600 in Aldport. Divide by total housing in each town and year: Rennick stays at 20%, whereas Aldport rises from 40% to 60%. The adoption-percentage gap grows from 20 to 40 points even though Rennick's solar count grows faster proportionally.",
      "hint": "Does the total number of homes stay fixed as the solar-home counts change?"
    },
    {
      "scene": "ii-g2-teaching-retention-transfer",
      "kind": "teaching",
      "chart": "bar",
      "title": "Correct answers after two teaching approaches",
      "xLabel": "Test timing and problem type",
      "yLabel": "Correct answers (%)",
      "yMin": 0,
      "yMax": 100,
      "yStep": 10,
      "categories": [
        "Familiar now",
        "Familiar later",
        "New now",
        "New later"
      ],
      "series": [
        "Lecture",
        "Workshop"
      ],
      "values": [
        [
          80,
          60,
          70,
          40
        ],
        [
          80,
          80,
          70,
          60
        ]
      ],
      "text": "Students were randomly assigned to a lecture or workshop covering the same material. Separate matched groups took tests immediately or one month later. Familiar problems used practiced formats; new problems required applying the material in unpracticed formats. The four tests were designed to be comparable within each problem type. Researcher Tomas Beck proposes that the workshop improved retention rather than initial learning and that its benefit extended beyond practiced formats. The graph reports the average percentages correct.",
      "stem": "Which choice best uses the graph to support both parts of Beck's proposal?",
      "correct": "The approaches tied immediately for each problem type, but the workshop's delayed advantage was 20 points for both familiar and new problems.",
      "wrong": [
        [
          "The workshop scored 80% on both familiar tests and 60% on the delayed new test, showing equal retention across the two problem types.",
          "The workshop loses 10 points on new problems but none on familiar problems; equal retention across types is not the proposed or observed pattern."
        ],
        [
          "The workshop's advantage on delayed familiar problems was 20 points, indicating that its initial-learning advantage survived for a month.",
          "The immediate familiar scores are equal. The later advantage therefore cannot be described as an observed initial advantage that persisted."
        ],
        [
          "The workshop scored higher on delayed familiar than delayed new problems, indicating that its retention advantage was limited to practiced formats.",
          "Compare workshop with lecture within each type: it has a 20-point delayed advantage on new problems as well as familiar ones."
        ]
      ],
      "explanation": "Immediate scores are equal between approaches for both familiar and new problems. A month later, workshop scores exceed lecture scores by 20 points within each problem type. This supports a benefit in retention rather than measured initial learning, and the advantage on new problems shows that the benefit extends beyond practiced formats.",
      "hint": "Which comparisons separate initial performance from later performance, and practiced formats from new ones?"
    },
    {
      "scene": "ii-g2-fungi-nutrient-limitation",
      "kind": "fungi",
      "chart": "bar",
      "title": "Seedling growth with and without a root fungus",
      "xLabel": "Nitrogen supply and root access",
      "yLabel": "Mean growth (centimeters)",
      "yMin": 0,
      "yMax": 50,
      "yStep": 10,
      "categories": [
        "Low, open",
        "Low, mesh",
        "High, open",
        "High, mesh"
      ],
      "series": [
        "No fungus",
        "Fungus"
      ],
      "values": [
        [
          10,
          10,
          40,
          40
        ],
        [
          30,
          10,
          40,
          40
        ]
      ],
      "text": "Researchers randomly assigned seedlings to low or high nitrogen supplies, with or without a root fungus. Half of each group grew across mesh that blocked root-fungus contact but allowed dissolved chemicals to pass; the rest had open access. Other conditions were held constant. Researchers interpret the fungus's benefit as requiring both scarce nitrogen and direct contact, rather than a growth signal carried by dissolved chemicals. They also argue that the mesh did not simply suppress growth on its own. The graph shows mean growth after eight weeks.",
      "stem": "Which choice best uses the graph and mesh design to support the researchers' interpretation?",
      "correct": "Without fungus, mesh leaves growth unchanged; the fungal advantage requires low nitrogen and open contact despite chemical passage through mesh.",
      "wrong": [
        [
          "Without fungus, mesh leaves growth unchanged; the high-nitrogen groups' greater growth therefore shows a fungal benefit with either form of access.",
          "At high nitrogen the groups with and without fungus both grow 40 centimeters, so their high growth cannot be attributed to a fungal advantage."
        ],
        [
          "With fungus, mesh lowers low-nitrogen growth from 30 to 10 centimeters; the lost benefit therefore supports a chemical signal blocked by the mesh.",
          "The mesh blocks contact but explicitly permits dissolved chemicals to pass. A signal prevented from passing is not a supported explanation."
        ],
        [
          "With fungus, mesh lowers low-nitrogen growth but leaves high-nitrogen growth unchanged; the mesh therefore suppresses growth independently of fungus.",
          "Without fungus, open and mesh groups have equal growth at each nitrogen supply. The data do not show the mesh independently suppressing growth."
        ]
      ],
      "explanation": "Without fungus, growth is 10 centimeters at low nitrogen and 40 at high nitrogen regardless of mesh, so the mesh alone does not explain the pattern. Fungus adds 20 centimeters only with low nitrogen and open access; its advantage disappears either behind mesh or at high nitrogen. Since dissolved chemicals pass through mesh, this favors an advantage requiring both scarce nitrogen and direct contact over the proposed dissolved-signal account.",
      "hint": "Which comparisons distinguish a contact requirement from an effect of the mesh itself?"
    }
  ];

  // Original quantitative scenes pair a chart with information needed to
  // interpret it: exposure, sample composition, comparison trends, assignment,
  // or the scope of an experimental prediction. Arithmetic alone is not the
  // task; each key states what the combined evidence supports.
  function reconcileSupports(frame, A, B) {
    const close = (x, y) => Math.abs(x - y) < 1e-9;
    switch (frame.kind) {
      case "dam":
        return A[2] - A[0] === B[2] - B[0] && A[4] === A[2] && B[4] > B[2] &&
          B[4] - A[4] > B[2] - A[2];
      case "retail":
        return A[1] < A[0] && B[1] < B[0] && A.every((x, i) => x > B[i]) &&
          close((A[0] + 3 * B[0]) / 4, 30) && close((3 * A[1] + B[1]) / 4, 40);
      case "traffic":
        return close(A[2] / A[0], 1 / 2) && B[2] < B[0] &&
          close((A[2] / (1 / 2)) / A[0], 1) && B[2] / B[0] < 1;
      case "mowing":
        return B[0] - A[0] === 10 && B[1] - A[1] === 20 &&
          B[2] - A[2] === 10 && B[3] - A[3] === 20 && A[0] !== A[2];
      case "gardens":
        return A[0] === A[2] && A[1] === A[3] &&
          B[0] - A[0] === 20 && B[1] - A[1] === 20 &&
          B[2] - A[2] === 10 && B[3] - A[3] === 10;
      case "signals":
        return A[1] - A[0] === 5 && B[1] - B[0] === 5 &&
          close((A[0] + 3 * B[0]) / 4, 40) && close((3 * A[1] + B[1]) / 4, 25);
      case "nurses":
        return A[0] === 100 && B[0] === 100 && A[2] - A[3] === B[2] - B[3] &&
          close((A[2] - A[3]) / A[2], 1 / 3) && close((B[2] - B[3]) / B[2], 1 / 2);
      case "solar":
        return A[0] / 10 === A[2] / 20 && B[2] / 10 > B[0] / 10 &&
          (B[2] / 10 - A[2] / 20) > (B[0] / 10 - A[0] / 10);
      case "teaching":
        return A[0] === B[0] && A[2] === B[2] &&
          B[1] - A[1] === 20 && B[3] - A[3] === 20 && A[1] < A[0] && A[3] < A[2];
      case "fungi":
        return A[0] === A[1] && A[2] === A[3] && B[0] - A[0] === 20 &&
          B[1] === A[1] && B[2] === A[2] && B[3] === A[3];
      default:
        return false;
    }
  }

  const graphReconcile = {
    ...RW,
    id: "quantitative-graph-reconcile",
    skill: "Command of Evidence",
    subskill: "quantitative evidence",
    difficulty: "Hard",
    title: "Integrate graph comparisons with a claim's conditions",
    recognize: "Use the passage to identify the relevant comparison, denominator, or study restriction before judging what the graph supports.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["wrong-quantity", "context-constraint", "percent-base", "too-broad"],
    build(t) {
      const frame = t.pick(GRAPH_RECONCILE_FRAMES);
      const figure = frameChart(frame, frame.values);
      return mc("Hard", frame, {
        stimulus: passage(frame.text),
        figure,
        stem: frame.stem,
        correct: frame.correct,
        wrong: frame.wrong,
        explanation: frame.explanation,
        steps: [
          "Identify exactly which comparison the claim makes and what the passage says about the groups, measurement, or study design.",
          "Compare the relevant chart values while holding the appropriate conditions or denominators constant.",
          "Select the conclusion supported by both sources; reject a true count or endpoint used to justify a different claim.",
        ],
        principles: [
          "A count, a percentage, and a change relative to a comparison group answer different questions.",
          "A chart's pattern supports a claim only within the passage's measurement and study-design limits.",
        ],
        trap: "Substituting the largest bar or raw change for the passage's actual comparison, or treating a compatible pattern as proof of a unique cause.",
        hint: frame.hint,
        verify: () => {
          const read = C.readChartAlt(figure.alt);
          const values = frame.series.map((name) => frame.categories.map((category) => (read[name] || {})[category]));
          return values.flat().every(Number.isFinite) &&
            values.every((line, s) => line.every((value, i) => value === frame.values[s][i])) &&
            reconcileSupports(frame, values[0], values[1]) && allDistinct(frame.correct, frame.wrong);
        },
      });
    },
  };

  // Original self-contained cases; editorially reviewed before integration.
  const MECHANISM_PATHWAY_TOPICS = [
    {
      "scene": "ii-pathway-seed-product",
      "text": "In a hypothetical seed study, growers who use treatment T report faster germination, but they also select seeds carefully. Researchers randomly divide one seed batch between T and an untreated control; T still accelerates germination. T increases enzyme E, which releases compound C from stored material. One account says C triggers germination; another says T acts directly and the enzyme change is incidental. A follow-up uses an inhibitor that prevents E from releasing C without changing seed viability or the action of supplied C. All groups receive the same handling. Researchers can also supply C directly after adding the inhibitor.",
      "anchors": [
        "randomly divide one seed batch",
        "the enzyme change is incidental",
        "supply C directly"
      ],
      "stem": "Which follow-up result would most strongly support the account that T works through the release of C?",
      "key": "Blocking E removes T's advantage; supplying C then speeds germination equally in treated and untreated seeds despite the block.",
      "wrong": [
        [
          "Blocking E slows both seed groups equally; T retains its advantage, and supplying C leaves the gap between the groups unchanged.",
          "Equal slowing leaves the treatment advantage intact when the proposed intermediate is blocked, which does not support its necessity."
        ],
        [
          "Supplying C speeds both seed groups equally; T retains its advantage even when E is blocked and no C has been supplied.",
          "The treatment still works without released or supplied C; the added compound's separate effect does not establish that it mediates T."
        ],
        [
          "T produces more E in faster-germinating seeds; blocking E slows germination, but supplying C fails to restore it in either group.",
          "The association is compatible with both accounts, and failure of downstream rescue does not identify C as the missing cause of germination."
        ]
      ],
      "explanation": "Random assignment has already separated T from growers' seed selection. Losing its advantage when C cannot be released, then restoring germination by supplying C despite that block, places C between T and the response. The direct-effect account does not predict the loss and rescue together."
    },
    {
      "scene": "ii-pathway-bud-signal",
      "text": "In an invented plant experiment, a warm sleeve around a stem is followed by earlier opening of its upper buds. A randomized trial on matched branches reproduces the effect, so gardeners' choice of branches cannot by itself explain it. Warming also produces signal S below the buds. The proposed explanation is that S travels upward and triggers opening; a rival says warmth reaches the buds directly and S is incidental. A selective trap removes S below the buds without changing their temperature. Applied above the trap, synthetic S remains active. The follow-up measures opening with and without the sleeve, trap, and synthetic signal.",
      "anchors": [
        "randomized trial on matched branches",
        "without changing their temperature",
        "Applied above the trap"
      ],
      "stem": "Which finding would most directly weaken the proposed explanation that the sleeve's effect depends on S reaching the buds?",
      "key": "Bud opening is accelerated by the sleeve even after S is fully trapped, and by synthetic S supplied separately to unsleeved branches.",
      "wrong": [
        [
          "Trapping S removes the sleeve's advantage; synthetic S above the trap restores earlier opening on both sleeved and unsleeved branches.",
          "Loss of the treatment effect and rescue beyond the trap support the proposed intermediate pathway."
        ],
        [
          "With the trap in place, sleeved buds open later than usual; synthetic S applied above the trap restores their earlier opening time.",
          "Blocking the signal removes the acceleration and restoring it beyond the block rescues the response, consistent with the pathway."
        ],
        [
          "With the trap in place, sleeved and unsleeved buds open together; synthetic S above the trap advances both to the usual sleeved timing.",
          "An intermediate can trigger a response without the upstream treatment. This pattern supports rather than weakens dependence on S."
        ]
      ],
      "explanation": "A supplied signal can affect buds without being necessary for the sleeve's effect. Continued acceleration after S has been selectively removed directly contradicts that necessity; the separate response to synthetic S does not repair the proposed causal link."
    },
    {
      "scene": "ii-pathway-clay-ventilation",
      "text": "A hypothetical workshop study finds that ventilated drying cabinets produce stronger clay tiles. Because skilled workers favor those cabinets, researchers randomly assign tiles from one mixture to ventilated and still cabinets. The strength difference remains. Ventilation lowers water vapor around the tiles. One explanation is that lower vapor allows a strengthening bond to form; another is that moving air changes the tile surface directly. Follow-up equipment holds vapor at the still cabinet's level without altering airflow or temperature. A separate device removes vapor without moving air. Neither device contacts the clay, and tile moisture loss is measured independently of final strength.",
      "anchors": [
        "randomly assign tiles from one mixture",
        "without altering airflow or temperature",
        "removes vapor without moving air"
      ],
      "stem": "Which result would most strongly support lower vapor, rather than airflow itself, as the link to greater strength?",
      "key": "Holding vapor high removes ventilation's strength advantage; removing vapor from still cabinets produces the same strength as dry ventilated ones.",
      "wrong": [
        [
          "Holding vapor high leaves ventilation's strength advantage intact; removing vapor from still cabinets also increases their tiles' strength.",
          "Lower vapor may help, but ventilation retaining its effect when vapor stays high leaves an independent airflow effect."
        ],
        [
          "Removing vapor strengthens tiles in both cabinet types; ventilated tiles remain stronger when the two types reach the same low vapor level.",
          "A difference that remains at the same low vapor level points to something ventilation supplies beyond vapor removal."
        ],
        [
          "Removing vapor strengthens tiles only in ventilated cabinets; ventilated tiles remain stronger when the two types reach the same low vapor level.",
          "The proposed intermediate alone fails to reproduce the effect without airflow; ventilation retains a benefit at matched vapor levels."
        ]
      ],
      "explanation": "Random assignment removes worker selection as the explanation for the initial effect. Preventing the vapor change removes the strength gain, while reproducing that change without airflow recreates it. Both comparisons are needed to distinguish the proposed intermediate from a direct airflow effect."
    },
    {
      "scene": "ii-pathway-filter-pores",
      "text": "In a fictional materials study, filters treated with charge Q remove more dye from water. Factories using Q buy higher-grade filters, but a trial assigning Q randomly within one grade still finds an advantage. Q opens microscopic pores; it may instead remove dye by attracting it directly. A reversible brace keeps pores shut without changing charge or exposed surface chemistry. A second procedure opens the pores without Q. Both procedures leave the water's flow rate unchanged. Investigators test untreated and charged filters under each procedure and measure dye removed, not merely the number of visible pores.",
      "anchors": [
        "assigning Q randomly within one grade",
        "without changing charge",
        "opens the pores without Q"
      ],
      "stem": "Which pattern would provide the strongest evidence that opened pores mediate Q's effect on dye removal?",
      "key": "The brace eliminates Q's benefit, and opening pores without Q brings uncharged filters up to the performance of unbraced charged filters.",
      "wrong": [
        [
          "The brace leaves Q's benefit unchanged, although opening pores without Q improves uncharged filters relative to their untreated state.",
          "Opening pores can have an effect of its own while the charge benefit survives pore closure; this does not make pores its mediator."
        ],
        [
          "Bracing lowers removal for both charged and uncharged filters but preserves their difference; opening uncharged pores does little.",
          "The charge benefit persists with pores shut, and opening pores without charge does not reproduce it."
        ],
        [
          "Bracing lowers removal for both charged and uncharged filters but preserves their difference; opening uncharged pores improves removal.",
          "Pores can improve removal independently, but the charge advantage remains when its proposed pore-opening route is blocked."
        ]
      ],
      "explanation": "The brace isolates pore opening from charge; loss of the charge benefit makes the opening relevant. Recreating performance by opening uncharged pores supplies the complementary bypass evidence. Correlated pores alone cannot distinguish the two accounts."
    },
    {
      "scene": "ii-pathway-fermentation-acid",
      "text": "In an invented fermentation process, adding nutrient N causes a dissolved pigment to settle. Producers who use N also incubate mixtures longer. Randomized batches incubated for equal periods confirm an N effect. N increases acid A, leading to a proposal that A precipitates the pigment; an alternative says N changes the pigment directly. A selective scavenger removes A without binding N or pigment. It is active before N is added and throughout the settling observation, removing A as it forms. In separate rescue batches, investigators remove the scavenger before supplying A. Controls receive matching handling. The follow-up compares settled pigment after N alone, N with continuous A removal, and supplied A without N.",
      "anchors": [
        "incubated for equal periods",
        "throughout the settling observation",
        "supplied A without N"
      ],
      "stem": "Which result would most directly challenge the claim that N precipitates pigment by producing A?",
      "key": "Removing A leaves N-induced settling unchanged, while supplying A to batches without N causes additional settling of its own.",
      "wrong": [
        [
          "Removing A prevents settling after N, while adding A afterward restores settling to the level reached by N without scavenging.",
          "Preventing the proposed intermediate and rescuing with it supports the claimed pathway."
        ],
        [
          "Supplying A without N reproduces N's settling effect, while removing A from N-treated batches sharply reduces the amount settled.",
          "The intermediate working independently, together with blocking its production pathway's effect, supports mediation."
        ],
        [
          "N raises A before pigment settles, and the selective removal of A delays settling until investigators supply replacement acid.",
          "Temporal ordering plus selective prevention and rescue is consistent with the proposed acid-mediated explanation."
        ]
      ],
      "explanation": "Acid having its own effect does not show that it carries N's effect. If N still works after that acid is removed without changing N or pigment, the proposed required link is missing while the effect remains."
    },
    {
      "scene": "ii-pathway-nest-vibration",
      "text": "A hypothetical insect study links playback of a low tone to faster egg development. Nest owners choosing noisy sites may differ, so researchers randomly assign playback to nests of the same species. Eggs still develop faster with the tone. Adult insects respond by vibrating the nest, which raises egg temperature. The researchers propose that this warming, not the sound reaching the eggs, explains the result. A support prevents nest vibration while leaving sound transmission unchanged. A small heater can reproduce the earlier egg temperature without playback; it does not move the nest. Food supply and adult contact remain equal across groups.",
      "anchors": [
        "randomly assign playback",
        "leaving sound transmission unchanged",
        "without playback"
      ],
      "stem": "Which outcome would best support the proposed warming pathway?",
      "key": "Sound loses its benefit when the nest is held still; warming silent nests to the earlier egg temperature reproduces the faster development.",
      "wrong": [
        [
          "With vibration prevented, playback still speeds development; adding heat without playback produces a similar increase in the rate.",
          "Heat can accelerate development independently, but continued playback benefit without vibration contradicts the proposed route."
        ],
        [
          "With vibration prevented, playback still speeds development; adding heat without playback produces no comparable increase in the rate.",
          "The response survives removal of the proposed warming change, and heat alone fails to reproduce it, favoring a role for playback beyond warming."
        ],
        [
          "Matching the earlier temperature helps only nests receiving playback; heated nests without playback remain slower despite equal adult contact.",
          "Equal temperatures failing to reproduce the effect without sound points to a role for playback beyond the proposed warming."
        ]
      ],
      "explanation": "The vibration support separates sound from its proposed thermal consequence. Losing the playback effect there, then recreating it through heat alone, links the response to warming rather than merely showing that sound and warm eggs occur together."
    },
    {
      "scene": "ii-pathway-ink-crosslinks",
      "text": "In a hypothetical printing study, a light pulse improves an ink's resistance to abrasion. Printers selecting that light also use thicker ink. Random assignment of equally thick layers confirms the light effect. The pulse joins molecules into links L, which might cause the resistance; light might also harden a separate ingredient directly. A compound prevents L from forming without absorbing the light or changing the separate ingredient. Another procedure produces L without illumination. Both procedures preserve layer thickness, and the abrasion test can detect further improvement throughout the observed range.",
      "anchors": [
        "equally thick layers",
        "without absorbing the light",
        "produces L without illumination"
      ],
      "stem": "Which result would most strongly weaken the account that the light pulse improves resistance through L?",
      "key": "Illuminated layers gain the same resistance even without L, and separately manufactured links can increase resistance in layers kept dark.",
      "wrong": [
        [
          "Preventing L removes the light's improvement, and producing L without illumination gives the resistance found after an ordinary pulse.",
          "The prevention and bypass results jointly support the proposed role of L."
        ],
        [
          "Producing L separately restores resistance after the blocker removes the pulse's effect; dark layers also gain resistance from those links.",
          "Independent links rescue the blocked treatment and can work without the upstream light, which is consistent with mediation."
        ],
        [
          "Producing L separately restores resistance after the blocker removes the pulse's effect; untreated dark layers keep their original resistance.",
          "The blocked effect and downstream rescue fit the proposed pathway; dark layers receiving neither intervention provide a stable baseline."
        ]
      ],
      "explanation": "The key keeps the light effect intact while preventing its claimed intermediate, with measurement range and other ingredients controlled. L being independently useful cannot establish that the pulse works through L."
    },
    {
      "scene": "ii-pathway-fabric-weave",
      "text": "A fictional textile study finds that steam-treated fabric leaks less water. Mills using steam also weave tightly, but randomly steaming pieces cut from one roll still reduces leakage. Steam shortens the threads and narrows the gaps. Researchers propose that gap size explains the effect; a rival says steam changes the fibers' water-repelling surface. A frame prevents thread shortening while leaving steam exposure unchanged. Mechanical adjustment can narrow an unsteamed piece's gaps to the usual steamed size without altering its fibers. Follow-up pieces have the same thickness and are tested at the same water pressure.",
      "anchors": [
        "pieces cut from one roll",
        "leaving steam exposure unchanged",
        "without altering its fibers"
      ],
      "stem": "Which finding would most strongly favor the gap-size explanation over the surface explanation?",
      "key": "Framed steaming no longer reduces leakage, whereas narrowing unsteamed gaps reduces it to the level found in freely steamed pieces.",
      "wrong": [
        [
          "Framed steaming still reduces leakage, and narrowing unsteamed gaps also reduces leakage without bringing it as low as in steamed pieces.",
          "The steam effect survives prevention of shrinking, leaving a contribution beyond the proposed gap change."
        ],
        [
          "Freely steamed pieces have narrower gaps and leak less, while framed steaming reduces leakage despite leaving the original gaps intact.",
          "The original correlation does not outweigh the effect remaining when the proposed intermediate change is prevented."
        ],
        [
          "Narrowing gaps reduces leakage only after steam exposure, while framed steaming performs as well as steaming pieces that can shrink freely.",
          "This associates protection with steam independently of narrowing and does not favor gap size as the intervening cause."
        ]
      ],
      "explanation": "The frame lets steam act without narrowing, testing whether narrowing is needed. Mechanical adjustment supplies narrowing without steam, testing whether it can reproduce the protection. The paired results discriminate between the two linked changes."
    },
    {
      "scene": "ii-pathway-memory-links",
      "text": "In an invented memory experiment, learners using a diagram recall more paired names. Those choosing diagrams may be more attentive, but random assignment with equal study time still yields an advantage. Investigators propose that the diagram creates links between neighboring pairs rather than merely drawing attention to each name. A masking procedure prevents learners from seeing neighboring pairs together while preserving each name's visibility and total viewing time. Separate tests confirm that the proposed neighbor links do not form under the mask, while recognition of individual names stays unchanged. A separate exercise teaches the neighbor links without displaying a diagram. Follow-up recall tests rearrange all names, so the original screen positions cannot serve as cues.",
      "anchors": [
        "random assignment with equal study time",
        "preserving each name's visibility",
        "original screen positions cannot serve as cues"
      ],
      "stem": "Which follow-up finding would most directly weaken the proposed explanation involving neighbor links?",
      "key": "The full diagram advantage survives masking, while the separate link exercise improves recall equally for diagram and plain-list learners.",
      "wrong": [
        [
          "Masking eliminates the diagram advantage, while the link exercise raises plain-list recall to the level of unmasked diagram recall.",
          "The mask removes the proposed opportunity and teaching the links bypasses it, supporting the explanation."
        ],
        [
          "Diagram learners recall more neighbor links; their recall advantage disappears with masking and returns after the separate link exercise.",
          "These findings combine the predicted association, loss, and restoration of the proposed intermediate."
        ],
        [
          "The link exercise improves plain-list recall, while diagram learners lose their advantage when masking prevents the neighbor links from forming.",
          "Independent benefit from the links together with loss of diagram benefit when they cannot form supports the pathway."
        ]
      ],
      "explanation": "Equal random assignment has already addressed the learners' initial attention differences. If the diagram retains its advantage when the proposed links cannot form, those links do not explain that advantage merely because teaching them can separately improve recall."
    },
    {
      "scene": "ii-pathway-panel-cavity",
      "text": "A hypothetical acoustic panel absorbs more sound after its outer sheet is softened. Installers choosing softened panels also leave wider wall gaps, but randomized panels with equal gaps retain the difference. Softening lets the sheet vibrate and compress air in a sealed inner cavity. One account attributes absorption to that compression; another to energy lost in the softened sheet itself. A vent prevents cavity compression without changing the sheet's measured vibration or softness. A small internal driver can reproduce the compression pattern behind a rigid sheet. All tests use the same sound frequencies and compare absorbed energy.",
      "anchors": [
        "randomized panels with equal gaps",
        "without changing the sheet's measured vibration",
        "behind a rigid sheet"
      ],
      "stem": "Which result would best support cavity compression as the intermediate responsible for the softer panel's advantage?",
      "key": "Venting removes the softer panel's advantage, while reproducing compression behind a rigid sheet yields the original higher absorption.",
      "wrong": [
        [
          "Venting leaves the softer panel's advantage intact, although the internal driver also improves absorption behind a rigid sheet.",
          "Compression can contribute independently without mediating the softness advantage, which survives its prevention."
        ],
        [
          "Soft panels vibrate more and absorb more energy; venting reduces compression without reducing their advantage over rigid panels.",
          "The observed softness effect remains when the proposed intermediate is removed; the original association is not decisive."
        ],
        [
          "The internal driver improves absorption only with a softened sheet, and vented soft panels retain their original absorption level.",
          "The effect remains linked to the softened sheet even without compression and cannot be recreated through compression behind a rigid sheet."
        ]
      ],
      "explanation": "The vent breaks the proposed path from vibration to compression while preserving the potential direct sheet effect. Losing the advantage there and reproducing it with compression behind a rigid sheet favor the intermediate explanation together."
    }
  ];

  function createMechanismPathwayTemplate(C) {
    const { RW, passage, inOrder, allDistinct, mc } = C;
    return {
      ...RW,
      id: "evidence-mechanism-conditional-intervention",
      skill: "Command of Evidence",
      subskill: "textual evidence",
      difficulty: "Hard",
      title: "Evidence distinguishing an intermediate pathway from a direct effect",
      recognize: "A controlled trial can establish an effect without identifying its route. Evaluate both selective prevention of a proposed intermediate and reproduction of the response by supplying that intermediate independently.",
      rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
      tricks: ["too-broad", "reversed-condition", "true-but-irrelevant"],
      build(t) {
        const topic = t.pick(MECHANISM_PATHWAY_TOPICS);
        return mc("Hard", topic, {
          stimulus: passage(topic.text), stem: topic.stem, correct: topic.key, wrong: topic.wrong,
          explanation: topic.explanation,
          steps: [
            "Separate the evidence that the treatment has an effect from the claim about the intermediate carrying it.",
            "Track what remains possible when the intermediate is selectively prevented, and what supplying it independently can show.",
            "Evaluate the complete pattern against the requested support or challenge; an intermediate's separate benefit does not show it is necessary for the treatment.",
          ],
          principles: [
            "Controlling selection into a treatment does not by itself identify the mechanism of a resulting effect.",
            "An intermediate may reproduce an effect without carrying the original treatment's effect; selective blocking and bypass evidence answer different questions.",
          ],
          trap: "Treating a downstream intervention's separate benefit as proof of mediation, or overlooking that the treatment still works when the claimed pathway is blocked.",
          hint: "Which route is still available in each follow-up condition, and does the treatment's advantage disappear or persist?",
          verify: () => inOrder(topic.text, topic.anchors) && topic.wrong.length === 3 && allDistinct(topic.key, topic.wrong),
        });
      },
    };
  }

  const mechanismConditionalIntervention = createMechanismPathwayTemplate(C);

  return [
    quotationTrait,
    extremeValue,
    supportsMechanism,
    groupChange,
    counterexample,
    weakensClaim,
    twoPartQuotation,
    benefitDifference,
    ratePercent,
    graphComplete,
    discriminatingFinding,
    poemQuotation,
    excerptQuotation,
    graphReconcile,
    mechanismConditionalIntervention,
  ];
});
