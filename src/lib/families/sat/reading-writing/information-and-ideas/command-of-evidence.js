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
      // A group's change, in one of two wordings drawn per choice, so the
      // key's wording never marks it.
      const change = (g, v1, v2) => (t.chance(0.5)
        ? `${cap1(topic.of(g))} ${verb} from ${say(v1)} in ${y1} to ${say(v2)} in ${y2}.`
        : `In ${y1}, ${topic.of(g)} was ${say(v1)}; by ${y2}, it had ${rose ? "risen" : "fallen"} to ${say(v2)}.`);
      const higher = rose ? "higher" : "lower";
      // Every choice is drawn in one of two wordings (see balancedDraw).
      const { correct, wrong } = balancedDraw(t, () => {
        const correct = change(topic.focus, g1, g2);
        // The cross-year comparison names the claim's group and both years,
        // as the key does, but sets that group against a different one.
        const crossed = [
          t.chance(0.5)
            ? `In ${y2}, ${name(topic.focus)}'s ${topic.measure} (${say(g2)}) was ${higher} than ${name(h)}'s figure for ${y1} (${say(h1)}).`
            : `${cap1(name(topic.focus))}'s ${y2} figure (${say(g2)}) was ${higher} than ${name(h)}'s ${y1} figure (${say(h1)}).`,
          `True, but this sets ${topic.focus} in ${y2} against ${h} in ${y1}; it does not compare ${topic.focus} with itself over time.`,
        ];
        const optional = t.shuffle([
          [t.chance(0.5)
            ? `In ${y2}, ${name(topic.focus)} had the ${rose ? "highest" : "lowest"} ${topic.measure} of the three ${topic.plural}.`
            : `Of the three ${topic.plural}, ${name(topic.focus)} had the ${rose ? "highest" : "lowest"} ${topic.measure} in ${y2}.`,
            `True, but a ${y2} ranking says nothing about how ${topic.focus} changed since ${y1}.`],
          [change(h, h1, h2),
            `True, but this describes ${h}, not ${topic.focus}, the group the claim is about.`],
          [t.chance(0.5)
            ? `In ${y1}, ${name(topic.focus)} had a ${higher} ${topic.measure} than ${name(h)} did.`
            : `${cap1(name(topic.focus))} had a ${higher} ${topic.measure} than ${name(h)} did in ${y1}.`,
            `True, but comparing two groups in ${y1} says nothing about change over time.`],
        ]).slice(0, 2);
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
      key: "Phosphorus levels in Lake Maren have not risen since 2005, even as the blooms grew.",
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
      key: "Skeletons of wealthy Romans hold no more lead than those of poor Romans of the same period.",
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
      neither: "“My mother mended nets beside the open door / and hummed the tunes her mother used to hum.”",
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
      aOnly: "“Dario tried to read on the fire escape, but the drilling and the horns below drove him back inside within minutes.”",
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
      cues: ["I loved each crooked stair", "will not / miss climbing them with buckets"],
      key: "“I loved each crooked stair and will not / miss climbing them with buckets when it rained.”",
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
      aOnly: "“Dr. Haas expected every experiment to be repeated five times; anything less, he told Leila, was a rumor, not a result.”",
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
      bOnly: "“The lamps in the other houses went out one by one, yet Hollis worked on in his barn every night that winter.”",
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
      aOnly: "“The carts collide, the vendors bellow out their prices, / and no one walks in anything resembling a line.”",
      bOnly: "“The baker knows my name and saves a loaf; / the flower seller always stops to ask for news.”",
      neither: "“By nine the stalls are empty, and the square / is swept by two old men with brooms of bundled straw.”",
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
      bOnly: "“Beth's hands began to shake before her turn, but Nora squeezed them and whispered that she would be fine.”",
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
      aOnly: "“Mr. Lindqvist let us choose our own lab partners, but he sent a student out for removing his goggles even for a moment.”",
      bOnly: "“Mr. Lindqvist began each class with a riddle about the elements and gave extra credit to whoever solved it first.”",
      neither: "“The chemistry lab was in the basement, and its shelves held jars of powders whose names I never learned.”",
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
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["too-narrow", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(TWO_PART_QUOTATION_TOPICS);
      const wrong = [
        [topic.aOnly, `This shows only the first part of the claim ("${topic.partA}") and nothing of the second.`],
        [topic.bOnly, `This shows only the second part of the claim ("${topic.partB}") and nothing of the first.`],
        [topic.neither, "This concerns the same subject but shows neither quality the claim names."],
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
      const both = (X, Y) => (t.chance(0.5)
        ? `With ${topic.factor}, ${topic.measure} was ${show(value[X[0]][1])} ${X[1]} and ${show(value[Y[0]][1])} ${Y[1]}; without ${topic.pronoun}, ${show(value[X[0]][0])} and ${show(value[Y[0]][0])}.`
        : `${cap1(X[1])}, ${topic.measure} went from ${show(value[X[0]][0])} without ${topic.factor} to ${show(value[X[0]][1])} with ${topic.pronoun}; ${Y[1]}, from ${show(value[Y[0]][0])} to ${show(value[Y[0]][1])}.`);
      // Names both of the claim's settings and both conditions, as the key
      // does, but sets the treated value in one against the untreated value
      // in the other.
      const crossed = () => [
        t.chance(0.5)
          ? `${cap1(topic.measure)} ${A[1]} with ${topic.factor} (${show(value[A[0]][1])}) was higher than ${topic.measure} ${B[1]} without ${topic.pronoun} (${show(value[B[0]][0])}).`
          : `${cap1(A[1])} with ${topic.factor}, ${topic.measure} (${show(value[A[0]][1])}) topped the ${show(value[B[0]][0])} measured ${B[1]} without ${topic.pronoun}.`,
        `True, but this sets a value with ${topic.factor} against a value without it; it does not show how much ${topic.factor} changed either setting.`,
      ];
      const { correct, wrong } = balancedDraw(t, () => ({
        correct: both(A, B),
        wrong: [
          crossed(),
          [both(A, C), `True, but it compares the gains for ${A[0]} and ${C[0]}, not for the two settings the claim names (${A[0]} and ${B[0]}).`],
          t.chance(0.5)
            ? [`With ${topic.factor}, ${topic.measure} was ${show(value[A[0]][1])} ${A[1]}, higher than ${show(value[B[0]][1])} ${B[1]} or ${show(value[C[0]][1])} ${C[1]}.`,
              "True, but a high value with the treatment does not show a large improvement; the values without it are needed too."]
            : [`Without ${topic.factor}, ${topic.measure} was ${show(value[B[0]][0])} ${B[1]} but only ${show(value[A[0]][0])} ${A[1]}.`,
              "True, but these starting values alone say nothing about how much the treatment helped in either setting."],
        ],
      }));
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
        trap: "Choosing a statement that names both settings but compares a value with the treatment to a value without it, or one that reports only the treated values.",
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
  /* Command of Evidence: the finding that tells a hypothesis apart from */
  /* a named rival explanation of the same observation                  */
  /* ------------------------------------------------------------------ */

  // The text reports an observation, a researcher's hypothesis, and a rival
  // account that explains the same observation. Support (or weakening) has
  // to discriminate between the two: the key is a finding the two accounts
  // predict differently. `both` is a finding both accounts predict (it
  // sounds like support but cannot favor either), `opposite` favors the
  // other side, and `aside` is true background or a finding about a
  // neighbouring case that bears on neither. Every researcher, place, and
  // study here is invented.
  const DISCRIMINATING_TOPICS = [
    {
      scene: "ii-df-orvanne-silt",
      name: "Varga",
      mode: "support",
      text:
        "Sediment cores from Lake Orvanne, a small lake high in a mountain valley, show that the layers of silt settling on its floor each year grew several times thicker over the twentieth century. Geologist Ilse Varga attributes the change to the retreat of the glacier that feeds the lake: as the ice withdrew, she argues, it exposed rock it had ground into fine powder, which meltwater then carried into the lake. A competing account holds that logging on the forested slopes above the lake, which expanded during the same decades, loosened soil that rainstorms washed downhill.",
      anchors: ["attributes the change to the retreat of the glacier", "logging on the forested slopes"],
      key: "Most of the silt in the thicker layers is finely ground rock, with little of the organic matter found in forest soils.",
      keyWhy: "Rock ground by the glacier and soil from logged slopes would leave different material behind; silt that is mostly ground rock with little forest organic matter is what Varga's account predicts and the logging account does not.",
      both: ["The layers began to thicken during the same decades in which the glacier retreated and logging expanded.",
        "Both accounts predict thickening in those decades, since both events happened then, so the timing cannot favor Varga's."],
      opposite: ["The thicker layers contain abundant fragments of bark, needles, and charcoal mixed in with the silt.",
        "Bark, needles, and charcoal point to material washed off the forested slopes, which favors the logging account."],
      aside: ["Several other glaciers in the same mountain range retreated at similar rates during the twentieth century.",
        "This concerns other glaciers; it says nothing about where the silt in Lake Orvanne came from."],
    },
    {
      scene: "ii-df-tessel-song",
      name: "Stell",
      mode: "support",
      text:
        "On the Tessel Islands, males of a small songbird sing a song with fewer notes than the song of the same species on the nearby mainland. Ornithologist Anouk Stell proposes that the difference arose through learning: because the islands were settled by only a few birds, young males there copied a small number of tutors, and details lost in copying were never restored. Other researchers suggest instead that the islands' dense forests, which muffle long and complex songs, favored birds whose shorter songs carry well through foliage.",
      anchors: ["the difference arose through learning", "dense forests"],
      key: "Island males living in open grassland sing the same short song as island males living in dense forest.",
      keyWhy: "If dense forest were what shortened the song, island birds in open grassland would have no reason to sing it; the same short song in open country points to a song inherited from a few tutors, as Stell proposes.",
      both: ["Across the islands, recorded songs consistently contain fewer notes than recordings of mainland songs.",
        "This is the difference both accounts set out to explain, so it cannot favor one of them."],
      opposite: ["On the mainland, males living in dense forest also sing noticeably shorter songs than males in open country.",
        "Shorter songs in mainland forests, where there was no small founding group, favor the idea that dense vegetation shortens songs."],
      aside: ["Young males of this species learn their songs by listening to adult males during their first spring.",
        "Birds could learn whichever song the forest favors, so the fact that songs are learned fits both accounts and favors neither."],
    },
    {
      scene: "ii-df-vell-hoards",
      name: "Halloran",
      mode: "support",
      text:
        "Archaeologists have recovered an unusual number of coin hoards in the Vell valley that were buried during the 1140s and never retrieved by their owners. Historian Marek Halloran argues that the hoards reflect a decade of war: owners hid their savings as armies approached and then died or fled before they could return. A rival interpretation holds that the 1140s were simply prosperous, so that more coins were in circulation, more were buried for safekeeping, and more were eventually forgotten.",
      anchors: ["reflect a decade of war", "simply prosperous"],
      key: "The 1140s hoards cluster along the roads that chronicles say armies used, unlike hoards from other decades.",
      keyWhy: "War would leave unretrieved hoards where armies passed, while prosperity would spread them wherever people lived; hoards concentrated along army routes fit Halloran's account and not the rival one.",
      both: ["More coins minted in the 1140s have been found in the valley than coins minted in any other decade.",
        "Both a war and a boom in circulating coins would leave many 1140s coins in the ground, so this favors neither account."],
      opposite: ["Tax records show that the valley's markets handled far more trade in the 1140s than in the decades around it.",
        "Busier markets are what the prosperity account predicts, so this favors the rival interpretation."],
      aside: ["Chronicles describe fighting between rival lords in a neighboring valley during the 1140s.",
        "Fighting in another valley does not show that owners in the Vell valley fled or died before recovering their coins."],
    },
    {
      scene: "ii-df-halden-fireflies",
      name: "Okafor",
      mode: "support",
      text:
        "In the suburbs of Halden, fireflies have become scarce within about fifty meters of streetlights. Ecologist Tamsin Okafor attributes the decline to the lights themselves, arguing that artificial light drowns out the flashes fireflies use to find mates, so that fewer pairs form and fewer eggs are laid. Some residents point instead to the closely mown lawns that surround most of Halden's streetlights, which offer none of the damp leaf litter where firefly larvae live and feed.",
      anchors: ["attributes the decline to the lights themselves", "closely mown lawns"],
      key: "Fireflies returned where streetlights were shielded from the ground but lawns were still mown.",
      keyWhy: "Shielding removes the light while leaving the lawns unchanged, so a recovery under those conditions implicates the light, as Okafor argues, rather than the lawns.",
      both: ["Fireflies are several times more numerous a hundred meters from a streetlight than right beside one.",
        "Near a streetlight there is both more light and more mown lawn, so this pattern fits both explanations."],
      opposite: ["Fireflies are just as scarce in closely mown parks that have no lights as they are beside streetlights.",
        "Scarcity on mown ground with no lights favors the lawn explanation over Okafor's."],
      aside: ["Females of many firefly species answer a male's flash with a flash of their own after a set delay.",
        "This describes how fireflies signal in general; it does not show whether light or lawns caused the decline in Halden."],
    },
    {
      scene: "ii-df-carrowby-vowel",
      name: "Nwosu",
      mode: "weaken",
      text:
        "In the coastal town of Carrowby, younger residents pronounce the vowel in words such as boat and road farther forward in the mouth than older residents do. Linguist Petra Nwosu argues that the new pronunciation was introduced by families who moved to Carrowby from a northern city in the 1980s, where the forward vowel is common, and that it then spread to their neighbors' children. Other linguists contend that the change began within Carrowby itself, as many sound changes do, and spread among teenagers regardless of family background.",
      anchors: ["introduced by families who moved to Carrowby", "began within Carrowby itself"],
      key: "Recordings from the 1970s show some local teenagers already using the forward vowel before those families arrived.",
      keyWhy: "If local teenagers used the forward vowel before the northern families arrived, the families cannot have introduced it; this fits the view that the change began in Carrowby itself.",
      both: ["Residents under thirty use the forward vowel far more often than residents over sixty do.",
        "Both accounts explain why younger residents use the new vowel, so this does not weaken Nwosu's argument."],
      opposite: ["The forward vowel is most common in the neighborhoods where the northern families settled.",
        "A concentration where the families settled is what Nwosu's argument predicts, so this supports rather than weakens it."],
      aside: ["Residents of the northern city also differ from Carrowby residents in how they pronounce several consonants.",
        "Differences in consonants say nothing about where Carrowby's new vowel came from."],
    },
    {
      scene: "ii-df-maresh-glaze",
      name: "Adeyemi",
      mode: "support",
      text:
        "Excavations at Tel Maresh, an inland settlement, have uncovered fragments of pottery coated in a bright blue glaze, a finish otherwise known mainly from workshops on the coast two hundred kilometers away. Archaeologist Yusuf Adeyemi argues that potters at Tel Maresh made the vessels themselves after learning the coastal technique. Others maintain that the vessels were made on the coast and reached the settlement through trade, as many luxury goods of the period did.",
      anchors: ["made the vessels themselves", "reached the settlement through trade"],
      key: "The clay of the blue-glazed fragments matches clay beds beside Tel Maresh, not those near the coast.",
      keyWhy: "Vessels made at Tel Maresh would be built from local clay, while traded vessels would carry coastal clay; a match to the local clay beds favors Adeyemi's account.",
      both: ["The blue-glazed fragments were found scattered among ordinary pottery in the settlement's household refuse.",
        "Vessels made locally and vessels bought from the coast would both end up broken in household refuse, so this favors neither."],
      opposite: ["Several fragments bear a maker's stamp identical to stamps found at one of the coastal workshops.",
        "A coastal workshop's stamp suggests the vessels were made there and traded inland, which favors the rival account."],
      aside: ["Blue glazes of this kind can be fired only in kilns that reach unusually high temperatures.",
        "Without evidence of such kilns at Tel Maresh, a fact about what the glaze requires favors neither account."],
    },
    {
      scene: "ii-df-brannock-tea",
      name: "Marsh",
      mode: "weaken",
      text:
        "During the 1850s, the price of imported tea in the port of Brannock fell by about half. Economic historian Lena Marsh argues that the decline resulted from faster sailing ships, which shortened voyages and so reduced the wages, provisions, and insurance that each cargo required. Another explanation points instead to the government's decision in 1853 to abolish the tariff it had long charged on imported tea.",
      anchors: ["resulted from faster sailing ships", "abolish the tariff"],
      key: "Brannock's tea price fell sharply in the month the tariff ended and barely moved in the other years.",
      keyWhy: "Faster ships entered service gradually and would have lowered prices over many years; a drop concentrated in the month the tariff ended points to the tariff instead, which weakens Marsh's argument.",
      both: ["Tea sold in Brannock at the end of the decade cost roughly half of what it had cost in 1850.",
        "This restates the decline that both explanations account for, so it does not weaken Marsh's argument."],
      opposite: ["Untaxed goods carried on the same routes, such as spices, also fell by about half in price during the 1850s.",
        "Goods with no tariff to remove fell just as much, which points to cheaper shipping and so supports Marsh's argument."],
      aside: ["Tea became the most popular drink among Brannock's dockworkers over the course of the 1850s.",
        "How popular tea became says nothing about whether shipping costs or the tariff drove its price down."],
    },
    {
      scene: "ii-df-sorrel-coral",
      name: "Ferris",
      mode: "support",
      text:
        "During a marine heat wave, corals growing near the mouth of the Sorrel River bleached far less than corals elsewhere in the same lagoon. Marine biologist Adaeze Ferris proposes that the river's cloudy, sediment-laden water shaded the nearby corals, reducing the intense sunlight that, together with heat, triggers bleaching. An alternative hypothesis holds that the corals near the river mouth belong to a heat-tolerant strain that would resist bleaching wherever it grew.",
      anchors: ["shaded the nearby corals", "heat-tolerant strain"],
      key: "Corals moved from the river mouth to clear parts of the lagoon bleached as often as the local corals.",
      keyWhy: "A truly heat-tolerant strain should resist bleaching even in clear water; corals that lost their advantage once moved away from the river's cloudy water point to shading, as Ferris proposes.",
      both: ["Corals near the river mouth had also bleached less than other corals during an earlier heat wave.",
        "Both the river's shade and a heat-tolerant strain would have protected those corals in earlier heat waves too, so this favors neither."],
      opposite: ["Corals from the river mouth that were raised in tanks of clear water still resisted bleaching when heated.",
        "Resisting bleaching without the river's shade favors the heat-tolerant strain over Ferris's explanation."],
      aside: ["Many reef-building corals get much of their food from algae that live inside their tissues.",
        "This is true of corals in general and does not distinguish shading from inherited heat tolerance."],
    },
    {
      scene: "ii-df-ashwick-otters",
      name: "Calloway",
      mode: "weaken",
      text:
        "After decades of scarcity, river otters became common again along the Ashwick River between 2000 and 2015. Ecologist Rhys Calloway attributes the recovery to cleaner water: as factories upstream reduced their discharges, he argues, fish populations grew and could support more otters. Others credit a ban on trapping otters that the regional government imposed in 1999, just before the recovery began.",
      anchors: ["attributes the recovery to cleaner water", "a ban on trapping otters"],
      key: "Otter numbers began rising in the first two years of the ban, before water quality measurably improved.",
      keyWhy: "If otters increased before the water or the fish recovered, cleaner water cannot explain the start of the recovery, while the trapping ban can; this weakens Calloway's argument.",
      both: ["More otters were counted along the Ashwick in 2015 than in any survey the region had made since the 1950s.",
        "This restates the recovery that both explanations account for, so it does not weaken Calloway's argument."],
      opposite: ["Fish counts in the Ashwick doubled in the years just before otter numbers along the river began to rise.",
        "More fish arriving just before more otters is what Calloway's argument predicts, so this supports it."],
      aside: ["River otters also eat crayfish and frogs, especially in winter, when fish are harder to catch.",
        "Otters still depend largely on fish, so a varied winter diet does not show that cleaner water played no part."],
    },
    {
      scene: "ii-df-pellham-cycling",
      name: "Ivers",
      mode: "support",
      text:
        "The share of Pellham residents who commute by bicycle doubled between 2016 and 2022. Transportation researcher Hana Ivers credits the network of protected bike lanes that the city built during those years. Others note that fuel prices climbed steeply over the same period and argue that rising costs, not the new lanes, pushed commuters out of their cars and onto bicycles.",
      anchors: ["credits the network of protected bike lanes", "fuel prices climbed steeply"],
      key: "Cycling rose mainly on the routes that gained protected lanes and barely changed elsewhere.",
      keyWhy: "Rising fuel prices would push commuters onto bicycles on every route, while new lanes would draw riders mainly where they were built; growth concentrated on those routes favors Ivers's account.",
      both: ["Twice as many Pellham residents cycled to work in 2022 as in 2016, according to a city survey.",
        "This restates the increase that both explanations account for, so it favors neither."],
      opposite: ["Bus ridership in Pellham rose over the same years by about the same percentage as cycling did.",
        "Commuters leaving their cars for buses as well as bicycles points to fuel costs rather than bike lanes."],
      aside: ["Protected bike lanes cost less per kilometer to build than most other kinds of road improvements.",
        "The cost of building the lanes says nothing about whether they caused the increase in cycling."],
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
      "Two accounts explain the same observation, so evidence bears on one only if the two predict it differently; a finding both accounts expect, however agreeable it sounds, supports neither.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
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
          `Choose the finding that ${support ? `only ${topic.name}'s explanation predicts` : `the rival explanation predicts and ${topic.name}'s does not`}.`,
        ],
        principles: [
          "Evidence favors one explanation over another only when the two predict different results.",
          "A restatement of the observation both explanations were built to explain is not evidence for either.",
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
        [["Each night at ten I leave the kitchen light", "and sit beside the radio to hear"],
          "This shows the speaker’s nightly habit of listening but not why the forecast matters to the speaker."],
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
      claim: "In the poem, the speaker is more stirred by the last runner’s arrival than by the winner’s finish.",
      key: ["that I was shouting louder than I’d shouted", "for anyone that morning, and she ran."],
      why: "Shouting “louder than I’d shouted / for anyone that morning,” the winner included, shows the last runner moving the speaker more than the winner did.",
      near: [
        [["The winner crossed at nine, and we all cheered,", "and cameras flashed, and then the crowd went home."],
          "This shows the crowd celebrating the winner, not the speaker’s stronger response to the last runner."],
        [["I stayed. A woman came around the bend"],
          "This shows the last runner arriving but not how the speaker responds to her compared with the winner."],
        [["By four the barriers were being stacked,"],
          "This marks how long after the race the runner arrives, not how the speaker feels about her arrival."],
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
      claim: "In the poem, the speaker suggests that the town’s silence about the plow driver is a kind of tribute to how well he does his job.",
      key: ["No one will mention him at breakfast,", "which is the only thanks the work allows."],
      why: "Calling the town’s silence “the only thanks the work allows” presents that silence as the tribute a job done well earns.",
      near: [
        [["and by the time the town wakes there is nothing", "to show that anything was ever wrong:"],
          "This shows how thoroughly the driver works, but not how the town responds to his work."],
        [["its orange light sliding across the ceilings,"],
          "This shows the plow passing in the night, not the town’s silence or what that silence means."],
        [["the road is black and ordinary and wet."],
          "This describes the cleared road, not the town’s silence about the driver."],
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
      claim: "In the poem, the speaker comes to see that the city’s brightness, not any real loss, had kept the stars from view.",
      key: ["They had not gone. Our own light was the veil."],
      why: "“They had not gone” rejects the idea that the stars were lost, and “Our own light was the veil” names the city’s brightness as what hid them.",
      near: [
        [["For years I told my daughter there were stars", "the way you tell a child there once were wolves:"],
          "This shows the speaker’s earlier belief that the stars were gone, the view the poem’s ending corrects."],
        [["Then the storm took the power, block by block,", "the towers first, the streetlights, then our own,"],
          "This describes the blackout but says nothing about the stars or why they had been unseen."],
        [["and there they were above the roof, so thick", "they looked like frost upon a darkened pane."],
          "This shows the stars appearing in the dark but not the speaker’s realization that they had been there all along, hidden by the city’s light."],
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
      claim: "In the poem, the speaker’s plan to remake the garden gives way to a sense of kinship with its previous owner.",
      key: ["Instead I find I’m keeping someone’s order,", "watering what she chose, as if we’d met."],
      why: "“Instead” marks the abandoned plan, and tending “what she chose, as if we’d met” shows the kinship that replaces it.",
      near: [
        [["I meant to dig it all and start again."],
          "This states the speaker’s original plan, not the change of heart that replaces it."],
        [["a rose is trained with patience up the wall", "by hands that left no name among the deeds."],
          "This shows the previous owner’s care for the garden, not the speaker’s sense of connection to her."],
        [["The garden that I bought came with a stranger:"],
          "This notes the previous owner’s presence as a stranger’s, the opposite of the kinship the speaker comes to feel."],
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
    difficulty: "Hard",
    title: "Quotation from a poem that illustrates an interpretive claim",
    recognize:
      "The claim interprets the poem, often as a change or a two-part attitude; the right lines enact that interpretation, usually without repeating its words, while lines from before the turn or lines that echo its vocabulary show only part of it.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["too-narrow", "word-association", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(POEM_TOPICS);
      const poem = topic.poem.join("\n");
      const content = `The following text is from an original poem.\n\n${poem}\n\n${topic.claim}`;
      const correct = quoteLines(topic.key);
      const wrong = topic.near.map(([lines, reason]) => [quoteLines(lines), reason]);
      // Every quotation must be consecutive lines of the poem as printed.
      const inPoem = (text) => poem.includes(text.slice(1, -1).split(" / ").join("\n"));
      return mc("Hard", topic, {
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

  /* ------------------------------------------------------------------ */
  /* Command of Evidence (quantitative, Hard): reconcile a graph with a  */
  /* claim about timing, every group, or growth against level            */
  /* ------------------------------------------------------------------ */

  // Each frame is an invented data set and a claim that the graph only
  // partly fits. Every offered choice is a true reading of the graph, so
  // accuracy never decides; what decides is whether the reading bears on
  // the claim as stated. Kinds:
  //   timing (line): the claim says an event made a measure move one way in
  //     both series. Series A does; series B keeps moving the other way
  //     after the event. The key reports B after the event. Offered
  //     instead: B moving the "wrong" way before the event (the same look,
  //     the wrong period), A after the event (supports), A before it, or
  //     the two series' levels.
  //   every (bar, before/after): the claim says a program helped every
  //     group. The key is the group that got worse. Offered instead: the
  //     group with the worst level after the program (which still
  //     improved), a comparison of one group's after value with another's
  //     before value, and the largest improvement.
  //   growth (line): the claim concedes that A is still below B but says A
  //     grew more over the whole period. The key gives both series' start
  //     and end values. Offered instead: the same four-value comparison
  //     over the first half only (when A was flat), the final levels alone,
  //     and A's growth alone.
  const GRAPH_RECONCILE_FRAMES = [
    {
      scene: "ii-g2-kell-dam",
      kind: "timing",
      dir: -1,
      title: "Salmon returning to spawn in two rivers",
      xLabel: "Year",
      yLabel: "Salmon counted (thousands)",
      yMin: 0, yMax: 24, yStep: 2,
      categories: ["2006", "2009", "2012", "2015", "2018", "2021"],
      event: 2,
      series: ["Ash River", "Birch River"],
      target: "Pell’s claim",
      text: "The Kell Dam, completed in 2012, blocks part of the watershed that feeds two rivers where salmon spawn. Fisheries biologist Nora Pell claims that the dam caused the number of salmon returning to spawn to decline in both the Ash River and the Birch River.",
      measure: "the salmon count",
      be: "was",
      in: ["in the Ash River", "in the Birch River"],
      unit: " thousand",
    },
    {
      scene: "ii-g2-marlow-drink-tax",
      kind: "timing",
      dir: -1,
      title: "Sugary drinks sold in Marlow, by type of store",
      xLabel: "Year",
      yLabel: "Drinks sold (thousands of liters)",
      yMin: 0, yMax: 60, yStep: 5,
      categories: ["2014", "2016", "2018", "2020", "2022", "2024"],
      event: 2,
      series: ["Supermarkets", "Corner shops"],
      target: "Haddad’s claim",
      text: "In 2018, the city of Marlow began taxing sugary drinks. Economist Farid Haddad claims that the tax caused sales of sugary drinks to fall at both of the city’s main kinds of retailers, supermarkets and corner shops.",
      measure: "sugary drink sales",
      be: "were",
      in: ["at supermarkets", "at corner shops"],
      unit: " thousand liters",
    },
    {
      scene: "ii-g2-highway-cameras",
      kind: "timing",
      dir: -1,
      title: "Crashes per year on two highways",
      xLabel: "Year",
      yLabel: "Crashes per year",
      yMin: 0, yMax: 60, yStep: 5,
      categories: ["2009", "2012", "2015", "2018", "2021", "2024"],
      event: 2,
      series: ["Route 3", "Route 17"],
      target: "the report’s claim",
      text: "In 2015, the state installed speed cameras along two rural highways, Route 3 and Route 17. A report from the state’s transportation office claims that the cameras caused the number of crashes to drop on both highways.",
      measure: "the number of crashes",
      be: "was",
      in: ["on Route 3", "on Route 17"],
      unit: "",
    },
    {
      scene: "ii-g2-wexley-butterflies",
      kind: "timing",
      dir: 1,
      title: "Butterflies counted per survey in Wexley",
      xLabel: "Year",
      yLabel: "Butterflies per survey",
      yMin: 0, yMax: 40, yStep: 4,
      categories: ["2010", "2013", "2016", "2019", "2022", "2025"],
      event: 2,
      series: ["Meadows", "Roadsides"],
      target: "Ruiz’s claim",
      text: "In 2016, the town of Wexley stopped spraying pesticides on public land. Ecologist Marisol Ruiz claims that the change caused the number of butterflies to increase both in the town’s meadows and along its roadsides.",
      measure: "the butterfly count",
      be: "was",
      in: ["in the meadows", "along the roadsides"],
      unit: "",
    },
    {
      scene: "ii-g2-school-gardens",
      kind: "every",
      chart: "bar",
      dir: 1,
      title: "Students eating vegetables daily, before and after a garden program",
      xLabel: "School",
      yLabel: "Students eating vegetables daily (%)",
      yMin: 0, yMax: 60, yStep: 5,
      categories: ["Ardmore", "Bexley", "Corrin", "Delway"],
      series: ["Before program", "After program"],
      target: "Obuya’s claim",
      text: "A nonprofit started gardens at four middle schools and surveyed students about their eating habits before and after the program. The nonprofit’s director, Grace Obuya, claims that the program increased the share of students who eat vegetables daily at every one of the four schools.",
      measure: "the share of students eating vegetables daily",
      at: (g) => `at ${g}`,
      unit: "%",
      plural: "schools",
      when: ["before the program", "after the program"],
    },
    {
      scene: "ii-g2-doverton-signals",
      kind: "every",
      chart: "bar",
      dir: -1,
      title: "Average wait at four intersections, before and after new signals",
      xLabel: "Intersection (cross street)",
      yLabel: "Average wait (seconds)",
      yMin: 0, yMax: 60, yStep: 5,
      categories: ["Oak", "Pine", "Elm", "Cedar"],
      series: ["Before new signals", "After new signals"],
      target: "Carrow’s claim",
      text: "The city of Doverton replaced the traffic signals at four intersections along Main Street with signals that adjust their timing to traffic. City engineer Luis Carrow claims that the new signals shortened the average wait for drivers at every one of the four intersections.",
      measure: "the average wait",
      at: (g) => `at ${g} Street`,
      unit: " seconds",
      plural: "intersections",
      when: ["before the new signals", "after the new signals"],
    },
    {
      scene: "ii-g2-nurse-mentoring",
      kind: "every",
      chart: "bar",
      dir: 1,
      title: "New nurses staying at least two years, before and after mentoring",
      xLabel: "Hospital",
      yLabel: "New nurses staying two years (%)",
      yMin: 0, yMax: 100, yStep: 10,
      categories: ["Kingsley", "Larkin", "Mercy", "Norwood"],
      series: ["Before mentoring", "After mentoring"],
      target: "Reyes’s claim",
      text: "Four hospitals in one regional network began pairing each newly hired nurse with an experienced mentor. Nursing director Alma Reyes claims that the mentoring program raised the share of new nurses who stayed at least two years at every hospital in the network.",
      measure: "the share of new nurses staying two years",
      at: (g) => `at ${g}`,
      unit: "%",
      plural: "hospitals",
      when: ["before mentoring", "after mentoring"],
    },
    {
      scene: "ii-g2-rooftop-solar",
      kind: "growth",
      title: "Homes with rooftop solar in two towns",
      xLabel: "Year",
      yLabel: "Homes with rooftop solar (hundreds)",
      yMin: 0, yMax: 24, yStep: 2,
      categories: ["2016", "2018", "2020", "2022", "2024"],
      series: ["Rennick", "Aldport"],
      target: "Nair’s claim",
      text: "Energy analyst Priya Nair compared rooftop solar adoption in two neighboring towns. She claims that although Rennick still had fewer homes with rooftop solar than Aldport did in 2024, the number in Rennick grew by more than the number in Aldport between 2016 and 2024.",
      names: ["Rennick’s total", "Aldport’s total"],
      unit: " hundred homes",
    },
    {
      scene: "ii-g2-calder-evening-programs",
      kind: "growth",
      title: "Students enrolled in two evening programs at Calder Community College",
      xLabel: "Year",
      yLabel: "Students enrolled",
      yMin: 0, yMax: 120, yStep: 10,
      categories: ["2015", "2017", "2019", "2021", "2023"],
      series: ["Welding", "Nursing"],
      target: "Beck’s claim",
      text: "At Calder Community College, the evening welding program has long enrolled fewer students than the evening nursing program. Program coordinator Tomas Beck claims that although welding still enrolled fewer students than nursing did in 2023, welding enrollment grew by more than nursing enrollment between 2015 and 2023.",
      names: ["welding enrollment", "nursing enrollment"],
      unit: " students",
    },
    {
      scene: "ii-g2-rural-chargers",
      kind: "growth",
      title: "Public chargers for electric vehicles per 100,000 residents",
      xLabel: "Year",
      yLabel: "Chargers per 100,000 residents",
      yMin: 0, yMax: 60, yStep: 5,
      categories: ["2016", "2018", "2020", "2022", "2024"],
      series: ["Rural counties", "Urban counties"],
      target: "Whitlock’s claim",
      text: "Transportation researcher Dana Whitlock tracked public charging stations for electric vehicles in one state. She claims that although rural counties still had fewer chargers per 100,000 residents than urban counties did in 2024, the rural rate grew by more than the urban rate from 2016 to 2024.",
      names: ["the rural rate", "the urban rate"],
      unit: "",
    },
  ];

  function reconcileData(t, frame) {
    const { yMin, yMax, yStep: st } = frame;
    const n = frame.categories.length;
    const r6 = (v) => Math.round(v * 1e6) / 1e6;
    const inRange = (line) => line.every((v) => v > yMin && v <= yMax);
    // A walk of n values starting at `start`, moving `sign` by 1-`most` steps
    // at each index in `moving` and staying put otherwise.
    for (let attempt = 0; attempt < 300; attempt += 1) {
      if (frame.kind === "timing") {
        const e = frame.event;
        const d = frame.dir;
        // A moves against the claim before the event and with it after;
        // B moves against the claim throughout.
        const a = [gridPick(t, yMin + st, yMax - st, st)];
        const b = [gridPick(t, yMin + st, yMax - st, st)];
        for (let index = 1; index < n; index += 1) {
          a.push(r6(a[index - 1] + (index <= e ? -d : d) * t.int(1, 2) * st));
          b.push(r6(b[index - 1] - d * t.int(1, 2) * st));
        }
        const ok = inRange(a) && inRange(b) && a.every((v, i) => v !== b[i]) && a[n - 1] !== b[n - 1];
        if (ok) return { values: [a, b], roles: { e } };
      } else if (frame.kind === "every") {
        // Built as if higher were better, then flipped about the middle of
        // the axis when the claim is that the program lowered the measure.
        const d = frame.dir;
        const [key, worst, best, cross] = t.shuffle([...Array(n).keys()]);
        const up = (v, k) => r6(v + k * st);
        const before = Array(n);
        const after = Array(n);
        before[key] = gridPick(t, yMin + 5 * st, yMax - 2 * st, st);
        after[key] = up(before[key], -t.int(1, 2));
        after[cross] = up(before[key], -t.int(1, 2));
        before[cross] = up(after[cross], -t.int(1, 2));
        after[worst] = up(Math.min(after[key], after[cross]), -t.int(1, 2));
        before[worst] = up(after[worst], -t.int(1, 2));
        before[best] = gridPick(t, yMin + st, yMax - 4 * st, st);
        after[best] = up(before[best], t.int(3, 4));
        const flip = (v) => (d > 0 ? v : r6(yMin + yMax - v));
        const b = before.map(flip);
        const a = after.map(flip);
        const change = (index) => d * (a[index] - b[index]);
        const others = [worst, best, cross];
        const ok = inRange(b) && inRange(a) &&
          change(key) < 0 && others.every((index) => change(index) > 0) &&
          others.every((index) => index === best || change(index) < change(best)) &&
          d * (a[worst] - a[key]) < 0 &&
          others.every((index) => index === worst || d * (a[index] - a[worst]) > 0) &&
          d * (a[cross] - b[key]) < 0 && new Set(a).size === n;
        if (ok) return { values: [b, a], roles: { key, worst, best, cross } };
      } else {
        // growth: A flat for the first half, then climbing past B's gain
        // while staying below B.
        const mid = 2;
        const b = [gridPick(t, yMin + 3 * st, yMax - 8 * st, st)];
        for (let index = 1; index < n; index += 1) b.push(r6(b[index - 1] + t.int(1, 2) * st));
        const gainB = b[n - 1] - b[0];
        const gainA = r6(gainB + t.int(1, 3) * st);
        const start = r6(b[0] - gainA + gainB - t.int(1, 3) * st);
        const late = n - 1 - mid;
        const a = [start, start, start];
        let left = gainA;
        for (let index = mid + 1; index < n; index += 1) {
          const stepUp = index === n - 1 ? left : r6(Math.max(st, Math.round(left / (n - index) / st) * st));
          a.push(r6(a[index - 1] + stepUp));
          left = r6(left - stepUp);
        }
        const ok = late > 0 && inRange(a) && inRange(b) && a[n - 1] < b[n - 1] && a[0] < b[0] &&
          a[n - 1] - a[0] > gainB && a[mid] === a[0] && b[mid] > b[0] && a.every((v, i) => v !== b[i]);
        if (ok) return { values: [a, b], roles: { mid } };
      }
    }
    throw new Error(`${frame.scene}: could not draw graph values`);
  }

  const graphReconcile = {
    ...RW,
    id: "quantitative-graph-reconcile",
    skill: "Command of Evidence",
    subskill: "quantitative evidence",
    difficulty: "Hard",
    title: "Graph data that bear on a claim's exact terms",
    recognize:
      "Every choice reads the graph correctly, so pin down the claim's exact terms first (which period, which groups, a change or a level) and keep only the reading that meets or breaks those terms.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["true-but-irrelevant", "too-narrow", "wrong-quantity"],
    build(t) {
      const frame = t.pick(GRAPH_RECONCILE_FRAMES);
      const { values, roles } = reconcileData(t, frame);
      const [A, B] = values;
      const cats = frame.categories;
      const figure = frameChart(frame, values);
      const u = (v) => `${v}${frame.unit}`;
      const n = cats.length;
      let draw;
      let why;
      let stem;
      if (frame.kind === "timing") {
        const e = roles.e;
        const last = n - 1;
        const series = [A, B];
        // One series between two years, worded either as a comparison or as
        // a change, whichever is drawn.
        const move = (s, i, j) => {
          const line = series[s];
          const place = frame.in[s];
          if (t.chance(0.5)) {
            const verb = line[j] > line[i] ? "rose" : "fell";
            return `${cap1(frame.measure)} ${place} ${verb} from ${u(line[i])} in ${cats[i]} to ${u(line[j])} in ${cats[j]}.`;
          }
          const word = line[j] > line[i] ? "higher" : "lower";
          return `${cap1(place)}, ${frame.measure} ${frame.be} ${word} in ${cats[j]} (${u(line[j])}) than in ${cats[i]} (${u(line[i])}).`;
        };
        const want = frame.dir < 0 ? "fell" : "rose";
        draw = () => ({
          correct: move(1, e, last),
          wrong: [
            [move(1, 0, e), `True, and it looks like the key, but it describes ${frame.series[1]} before ${cats[e]}; the claim concerns what happened after the event.`],
            ...t.shuffle([
              [move(0, e, last), `True, but ${frame.series[0]} ${want} after ${cats[e]}, as the claim says, so this supports rather than weakens it.`],
              [move(0, 0, e), `True, but this describes ${frame.series[0]} before ${cats[e]}, which the claim does not address.`],
              [`In ${cats[last]}, ${frame.measure} ${frame.in[1]} (${u(B[last])}) ${frame.be} ${B[last] > A[last] ? "higher" : "lower"} than ${frame.in[0]} (${u(A[last])}).`,
                "True, but comparing the two series’ levels in one year says nothing about whether either moved as the claim says after the event."],
            ]).slice(0, 2),
          ],
        });
        why = `The claim says the event made ${frame.measure} ${want === "fell" ? "fall" : "rise"} in both series after ${cats[e]}. ${frame.series[1]} did the opposite after ${cats[e]}, going from ${u(B[e])} to ${u(B[last])}, which contradicts the claim for that series.`;
        stem = `Which choice best describes data from the graph that weaken ${frame.target}?`;
      } else if (frame.kind === "every") {
        const { key, worst, best, cross } = roles;
        const better = frame.dir > 0 ? "higher" : "lower";
        const worse = frame.dir > 0 ? "lower" : "higher";
        const [pre, post] = frame.when;
        draw = () => ({
          correct: t.chance(0.5)
            ? `${cap1(frame.at(cats[key]))}, ${frame.measure} was ${B[key] > A[key] ? "higher" : "lower"} ${post} (${u(B[key])}) than ${pre} (${u(A[key])}).`
            : `${cap1(frame.measure)} ${frame.at(cats[key])} went from ${u(A[key])} ${pre} to ${u(B[key])} ${post}.`,
          wrong: [
            [`${cap1(post)}, ${frame.measure} was ${worse} ${frame.at(cats[worst])} (${u(B[worst])}) than at any of the other ${frame.plural}.`,
              `True, but ${cats[worst]} still improved, from ${u(A[worst])} to ${u(B[worst])}; a poor level after the program is not a failure to improve.`],
            [frame.measure.length < 24 && t.chance(0.5)
              ? `${cap1(frame.measure)} ${frame.at(cats[cross])} ${post} (${u(B[cross])}) was ${worse} than ${frame.measure} ${frame.at(cats[key])} ${pre} (${u(A[key])}).`
              : `${cap1(post)}, ${frame.measure} ${frame.at(cats[cross])} (${u(B[cross])}) was ${worse} than it had been ${frame.at(cats[key])} ${pre} (${u(A[key])}).`,
              `True, but this sets one group’s value after the program against a different group’s value before it; ${cats[cross]} itself improved.`],
            [`${cap1(frame.measure)} ${frame.at(cats[best])} went from ${u(A[best])} ${pre} to ${u(B[best])} ${post}.`,
              `True, but ${cats[best]} improved, as the claim says, so this supports rather than weakens it.`],
          ],
        });
        why = `The claim is that every one of the ${frame.plural} improved. ${cap1(frame.at(cats[key]))}, ${frame.measure} got ${worse} instead, going from ${u(A[key])} to ${u(B[key])}, so the claim fails for that group.`;
        stem = `Which choice best describes data from the graph that weaken ${frame.target}?`;
      } else {
        const { mid } = roles;
        const last = n - 1;
        const [nA, nB] = frame.names;
        // "from 4 to 18 hundred homes" or "from 4 hundred homes to 18 hundred
        // homes": both wordings occur in every role, so length says nothing.
        const span = (x, y, compact = t.chance(0.5)) => (compact ? `from ${x} to ${u(y)}` : `from ${u(x)} to ${u(y)}`);
        // A from i to j and B from iB to j (iB differs only in the
        // mismatched-span near miss, always worded compactly to stay
        // within the choice length limit).
        const pair = (i, j, iB = i) => {
          const compact = iB === i ? undefined : true;
          const flat = A[j] === A[i];
          const later = iB === i ? "" : `from ${cats[iB]} to ${cats[j]} `;
          return t.chance(0.5)
            ? `From ${cats[i]} to ${cats[j]}, ${nA} ${flat ? `stayed at ${u(A[i])}` : `rose ${span(A[i], A[j], compact)}`}, while ${later}${nB} rose ${span(B[iB], B[j], compact)}.`
            : `${cap1(nA)} ${flat ? `stayed at ${u(A[i])}` : `went ${span(A[i], A[j], compact)}`} between ${cats[i]} and ${cats[j]}, while ${nB} went ${span(B[iB], B[j], compact)}${iB === i ? "" : ` between ${cats[iB]} and ${cats[j]}`}.`;
        };
        // The third near miss lacks one piece of the comparison: B over the
        // same span (A's whole-period growth set against B's growth from
        // `mid` only), B's starting value (A's growth with B's final level),
        // or B altogether.
        const third = () => {
          if (t.chance(0.5)) {
            return [pair(0, last, mid),
              `True, but it sets ${frame.series[0]}’s growth over the whole period against ${frame.series[1]}’s growth from ${cats[mid]} only, so it cannot show which grew more from ${cats[0]} to ${cats[last]}.`];
          }
          return t.chance(0.5)
            ? [`${cap1(nA)} rose ${span(A[0], A[last])} between ${cats[0]} and ${cats[last]}, when it was still below ${nB} of ${u(B[last])}.`,
              `True, but without ${frame.series[1]}’s ${cats[0]} value this cannot show that ${frame.series[0]} grew by more; it supports only the concession about levels.`]
            : [`${cap1(nA)} rose ${span(A[0], A[last])} between ${cats[0]} and ${cats[last]}.`,
              `True, but without ${frame.series[1]}’s values this does not show that ${frame.series[0]} grew by more.`];
        };
        draw = () => ({
          correct: pair(0, last),
          wrong: [
            [pair(0, mid), `True, but this covers only ${cats[0]} to ${cats[mid]}, when ${frame.series[0]} did not grow at all; the claim concerns the whole period.`],
            [t.chance(0.5)
              ? `In ${cats[last]}, ${nA} (${u(A[last])}) was still lower than ${nB} (${u(B[last])}).`
              : `${cap1(nA)} was still lower than ${nB} in ${cats[last]}: ${u(A[last])} compared with ${u(B[last])}.`,
              "True, but this supports only the claim’s concession about levels, not its main point about growth."],
            third(),
          ],
        });
        why = `The claim’s main point is that ${frame.series[0]} grew by more than ${frame.series[1]} over the whole period. ${frame.series[0]} gained ${Math.round((A[last] - A[0]) * 1e6) / 1e6} (from ${u(A[0])} to ${u(A[last])}) while ${frame.series[1]} gained ${Math.round((B[last] - B[0]) * 1e6) / 1e6} (from ${u(B[0])} to ${u(B[last])}), and ${frame.series[0]} still ended lower, exactly as the claim says.`;
        stem = `Which choice most effectively uses data from the graph to support ${frame.target}?`;
      }
      const { correct, wrong } = balancedDraw(t, draw);
      return mc("Hard", frame, {
        stimulus: passage(frame.text),
        figure,
        stem,
        correct,
        wrong,
        explanation: `${why} The choice that shows this is: ${correct}`,
        steps: [
          "Break the claim into its exact terms: which series or groups, which period, and whether it concerns a change or a level.",
          "Note that every choice is a correct reading of the graph, so accuracy cannot decide.",
          "Keep the one reading that meets (or breaks) the claim on those terms; reject readings of the wrong period, the wrong group, or a level instead of a change.",
        ],
        principles: [
          "Data bear on a claim only on the claim’s own terms: its period, its groups, and whether it is about change or level.",
          "A comparison across groups or years that the claim does not make can look relevant without bearing on it.",
        ],
        trap: "Choosing an accurate reading that looks like the key but covers the wrong period, sets one group against another, or reports a level instead of a change.",
        hint: "Which exact period, groups, and kind of comparison does the claim commit to?",
        verify: () => {
          const read = C.readChartAlt(figure.alt);
          const lineA = cats.map((c) => read[frame.series[0]][c]);
          const lineB = cats.map((c) => read[frame.series[1]][c]);
          if (lineA.concat(lineB).some((v) => !Number.isFinite(v))) return false;
          const nums = (text) => (text.match(/\d+(\.\d+)?/g) || []).map(Number);
          const has = (text, list) => list.every((v) => nums(text).includes(v));
          const last = n - 1;
          if (frame.kind === "timing") {
            const e = roles.e;
            const d = frame.dir;
            return d * (lineA[last] - lineA[e]) > 0 && d * (lineB[last] - lineB[e]) < 0 &&
              d * (lineB[e] - lineB[0]) < 0 && has(correct, [lineB[e], lineB[last]]) && allDistinct(correct, wrong);
          }
          if (frame.kind === "every") {
            const d = frame.dir;
            const helped = cats.map((c, i) => d * (lineB[i] - lineA[i]) > 0);
            return helped.filter((h) => !h).length === 1 && !helped[roles.key] && helped[roles.worst] &&
              has(correct, [lineA[roles.key], lineB[roles.key]]) && allDistinct(correct, wrong);
          }
          return lineA[last] < lineB[last] && lineA[last] - lineA[0] > lineB[last] - lineB[0] &&
            lineA[roles.mid] - lineA[0] <= lineB[roles.mid] - lineB[0] &&
            has(correct, [lineA[0], lineA[last], lineB[0], lineB[last]]) && allDistinct(correct, wrong);
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
    graphComplete,
    discriminatingFinding,
    poemQuotation,
    graphReconcile,
  ];
});
