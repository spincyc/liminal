(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const families = factory(S);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Cross-Text Connections templates (Craft and Structure). Each template
  // is one question design paired with its own bank of topics; every topic
  // is one scene of two short texts.

  const CTC_passage = (one, two) => `Text 1\n${one}\n\nText 2\n${two}`;
  const CTC_split = (content) => {
    const match = /^Text 1\n([\s\S]*?)\n\nText 2\n([\s\S]*)$/.exec(content);
    return match ? [match[1], match[2]] : ["", ""];
  };
  const CTC_BASE = {
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Cross-Text Connections",
  };

  /* ------------------------------------------------------------------ *
   * 1. Allied texts state the same claim in different words.           *
   * ------------------------------------------------------------------ */
  const CTC_SHARED_TOPICS = [
    {
      scene: "cs-bee-dance",
      text1:
        "When a honeybee finds a rich patch of flowers, it returns to the hive and performs a looping “waggle dance.” Filming hundreds of these dances, entomologist Aiko Tanabe found that the angle of each dance matches the direction of the flowers relative to the sun. The dance, in other words, works as a map that tells nestmates where to fly.",
      text2:
        "Biologist Marcus Webb moved feeding dishes to new spots around an apiary and timed the bees that arrived. Bees that had watched a returning forager dance reached a new dish in about half the time taken by bees searching on their own. The dance clearly passes along the location of food, though Webb notes that watchers still rely on scent to find the exact flowers.",
      shared1: "tells nestmates where to fly",
      shared2: "passes along the location of food",
      only1Anchor: "angle of each dance",
      only2Anchor: "rely on scent",
      key: "A honeybee's dance tells other bees where food can be found.",
      only1: "The angle of a bee's dance points toward food relative to the sun.",
      only2: "Bees that watch a dance rely on scent to find the exact flowers.",
      broad: "Honeybees can locate new food only by watching another bee dance.",
      broadWhy: "Text 2 says bees searching on their own also find food, so neither author claims the dance is the only way.",
      why: "Text 1 calls the dance a map that tells nestmates where to fly, and Text 2 says it passes along the location of food",
    },
    {
      scene: "cs-commute-rent",
      text1:
        "Between 2005 and 2015, thousands of families left central Merriton for suburbs where rents were lower. Economist Samira Farouk tracked 900 of these households and found that the savings were largely illusory: the money saved on rent went to fuel, car repairs, and highway tolls. For most families, moving outward did not make housing cheaper once travel was counted.",
      text2:
        "When sociologist Lars Engstrom surveyed long-distance commuters in three cities, most said they had moved outward to save money. Their budgets tell a different story: what they saved on housing, they spent on getting to work. Many also reported spending less time with their children, a cost that no budget records.",
      shared1: "did not make housing cheaper once travel was counted",
      shared2: "what they saved on housing, they spent on getting to work",
      only1Anchor: "car repairs",
      only2Anchor: "less time with their children",
      key: "Moving outward to cut rent often means spending the savings on travel.",
      only1: "Car repairs are among the largest hidden costs of living far from work.",
      only2: "Long commutes leave parents with less time to spend with their children.",
      broad: "Living near one's workplace is always cheaper than living in the suburbs.",
      broadWhy: "Both texts describe what often happens to families who move outward; neither says living close to work is always cheaper.",
      why: "Text 1 says moving outward did not make housing cheaper once travel was counted, and Text 2 says what commuters saved on housing they spent on getting to work",
    },
    {
      scene: "cs-velmora-guild",
      text1:
        "The account books of the weavers' guild in the port of Velmora, kept from 1760 to 1810, record more than prices and fees. Page after page lists payments to members who could not work, and the guild paid for the funerals of members who died poor. The guild, in short, served as a safety net for weavers who fell on hard times.",
      text2:
        "Letters written by Velmora weavers in the 1790s often thank their guild for help. One weaver, laid up for a winter with a broken arm, describes the guild paying a doctor and sending bread to his family. Such letters show that membership offered protection when illness or injury struck.",
      shared1: "safety net for weavers who fell on hard times",
      shared2: "membership offered protection when illness or injury struck",
      only1Anchor: "funerals",
      only2Anchor: "paying a doctor",
      key: "The Velmora weavers' guild aided members who fell into hardship.",
      only1: "The Velmora weavers' guild paid for the funerals of poor members.",
      only2: "The Velmora weavers' guild once paid a doctor to treat a member.",
      broad: "Every guild in Velmora supported its members through illness.",
      broadWhy: "Both texts discuss only the weavers' guild; neither says anything about Velmora's other guilds.",
      why: "Text 1 calls the guild a safety net for weavers who fell on hard times, and Text 2 says membership offered protection when illness or injury struck",
    },
    {
      scene: "cs-salt-road-film",
      text1:
        "Long stretches of Jun Rhee's film The Salt Road pass without a word of dialogue. Rather than slowing the film, these silences are its greatest strength: with no one speaking, viewers take in the cracked salt flats and the shifting light, and the desert comes to feel like a character in its own right.",
      text2:
        "Critics have faulted the ending of The Salt Road as rushed, and fairly so. But the film's finest scenes are its wordless ones. The scrape of boots and the hiss of wind convey the travelers' exhaustion more powerfully than any speech could, and Rhee is wise to let them do so.",
      shared1: "these silences are its greatest strength",
      shared2: "the film's finest scenes are its wordless ones",
      only1Anchor: "like a character",
      only2Anchor: "rushed",
      key: "The Salt Road is at its best in the scenes that have no dialogue.",
      only1: "The Salt Road makes its desert setting feel like a character.",
      only2: "The Salt Road has an ending that feels hurried and unconvincing.",
      broad: "Films with little dialogue are usually better than talkative ones.",
      broadWhy: "Both critics judge one film; neither makes a claim about films in general.",
      why: "Text 1 calls the film's silences its greatest strength, and Text 2 says its finest scenes are the wordless ones",
    },
    {
      scene: "cs-root-fungi",
      text1:
        "Plant ecologist Min-ji Park grew pine seedlings in two kinds of soil: ordinary forest soil and forest soil that had been heated to kill its fungi. After a year, the seedlings in untreated soil stood twice as tall. The fungi, which wrap around pine roots, deliver phosphorus that young trees cannot easily draw from the soil on their own.",
      text2:
        "Mycologist Diego Ferreira tagged phosphorus in the soil of a birch grove and traced it as it moved. The tagged phosphorus traveled through threads of fungi into the birch roots, showing that the fungi carry this nutrient directly to the trees. In exchange, the trees feed the fungi sugars made in their leaves.",
      shared1: "deliver phosphorus",
      shared2: "carry this nutrient directly to the trees",
      only1Anchor: "twice as tall",
      only2Anchor: "feed the fungi sugars",
      key: "Fungi attached to tree roots supply the trees with phosphorus.",
      only1: "Pine seedlings in untreated soil grew twice as tall within a year.",
      only2: "Trees supply the fungi on their roots with sugars from their leaves.",
      broad: "No tree can survive in soil that lacks fungi around its roots.",
      broadWhy: "Text 1's seedlings grew, if more slowly, without fungi, and Text 2 never discusses survival, so neither author claims this.",
      why: "Text 1 says the fungi deliver phosphorus to pine roots, and Text 2 traces phosphorus through fungi directly into birch roots",
    },
    {
      scene: "cs-four-day-week",
      text1:
        "In 2023, thirty firms in the city of Halden cut their workweek from five days to four without cutting pay. Economist Joana Coelho found that the firms' output over the following year matched their output before the change, and employees reported feeling far less tired at the end of each week.",
      text2:
        "Managers at Orrell Tools, a manufacturer that moved to a four-day week, expected production to fall by a fifth. It did not fall at all. Output per hour rose enough to make up for the lost day, partly because the company cut the number of weekly meetings in half.",
      shared1: "output over the following year matched",
      shared2: "It did not fall at all",
      only1Anchor: "less tired",
      only2Anchor: "meetings",
      key: "Moving to a four-day week need not reduce how much a firm produces.",
      only1: "Employees on a four-day week feel less tired at the end of the week.",
      only2: "Cutting meetings helps firms on a four-day week keep up output.",
      broad: "Every kind of business would benefit from adopting a four-day week.",
      broadWhy: "The texts report results from particular firms; neither claims that every business would benefit.",
      why: "Text 1 reports that the Halden firms' output matched their earlier output, and Text 2 reports that Orrell Tools' production did not fall at all",
    },
    {
      scene: "cs-wendle-clock",
      text1:
        "Before 1822, market day in the town of Wendle began whenever traders arrived, usually some time after dawn. That year the town installed a tower clock, and within a decade merchants opened their stalls at its first chime and closed them at its last. The clock gave the whole town a single schedule to live by.",
      text2:
        "Diaries kept in Wendle in the 1830s mention the tower clock constantly. Farmers timed their journeys to reach town before it struck eight, and the schoolmaster began and ended lessons by its bells. For Wendle's residents, the clock had become the shared measure by which each day was arranged.",
      shared1: "single schedule to live by",
      shared2: "shared measure by which each day was arranged",
      only1Anchor: "some time after dawn",
      only2Anchor: "schoolmaster",
      key: "Wendle's clock led residents to arrange their days by a shared time.",
      only1: "Wendle's market once opened at no fixed hour, some time after dawn.",
      only2: "Wendle's schoolmaster began and ended his lessons by the clock's bells.",
      broad: "Public clocks reshaped daily life in every town that installed one.",
      broadWhy: "Both texts describe Wendle alone; neither generalizes to every town with a public clock.",
      why: "Text 1 says the clock gave the town a single schedule, and Text 2 calls it the shared measure by which each day was arranged",
    },
    {
      scene: "cs-evaro-fresco",
      text1:
        "For centuries the frescoes in the chapel of San Evaro were known for their somber browns. When conservator Vera Havel removed layers of darkened varnish in 2019, she uncovered vivid blues and golds beneath. The chapel's gloomy reputation, it turns out, was the work of the varnish, not of the painters.",
      text2:
        "In 1650 a traveling merchant described the chapel of San Evaro in a letter to his sister, praising its “ceiling the color of a summer sky” and its walls “bright as a festival.” The letter is strong evidence that the frescoes were originally painted in brilliant colors.",
      shared1: "uncovered vivid blues and golds",
      shared2: "originally painted in brilliant colors",
      only1Anchor: "in 2019",
      only2Anchor: "letter to his sister",
      key: "The San Evaro frescoes were first painted in bright colors.",
      only1: "Conservators removed the San Evaro frescoes' varnish in 2019.",
      only2: "A merchant described the San Evaro chapel in a letter in 1650.",
      broad: "Nearly all old frescoes have lost their colors beneath varnish.",
      broadWhy: "Both texts concern one chapel; neither says anything about old frescoes in general.",
      why: "Text 1 reports vivid blues and golds beneath the varnish, and Text 2 takes the merchant's letter as evidence that the frescoes were originally brilliant",
    },
    {
      scene: "cs-szendrei-tempo",
      text1:
        "The earliest recording of Magda Szendrei's Second Piano Sonata, made in 1931 by her student Karl Bremen, lasts nineteen minutes; most recordings made since 1990 last twenty-six. Because Bremen studied the sonata with Szendrei herself, his brisk pace is the best guide we have to how she wanted it played, and today's pianists are far slower.",
      text2:
        "Magda Szendrei's manuscript of her Second Piano Sonata, rediscovered in 2012, is covered with metronome markings in her own hand. Measured against those markings, nearly every modern performance drags; the slow movement in particular is often taken at half the speed Szendrei wrote.",
      shared1: "today's pianists are far slower",
      shared2: "nearly every modern performance drags",
      only1Anchor: "her student Karl Bremen",
      only2Anchor: "rediscovered in 2012",
      key: "Pianists today play Szendrei's sonata more slowly than she intended.",
      only1: "One of Szendrei's own students made the sonata's first recording in 1931.",
      only2: "Szendrei's manuscript of the sonata was rediscovered in 2012.",
      broad: "Modern pianists play most twentieth-century music too slowly.",
      broadWhy: "Both texts discuss one sonata; neither makes a claim about twentieth-century music in general.",
      why: "Text 1 says today's pianists are far slower than Szendrei's own student, and Text 2 says nearly every modern performance drags against her markings",
    },
    {
      scene: "cs-library-fines",
      text1:
        "In 2019 the public library of Oakhurst stopped charging fines for overdue books. Within two years, the number of active borrowers rose by 18 percent, and many returning patrons told staff that old fines had kept them away. Library director Elena Brisco adds that most books still came back on time.",
      text2:
        "Librarian Samir Qureshi studied forty public libraries that dropped overdue fines. In most of them borrowing rose, especially among children and families with low incomes, who had been the likeliest to owe fines. Qureshi concludes that fines drive away the very patrons libraries most want to reach.",
      shared1: "old fines had kept them away",
      shared2: "fines drive away the very patrons",
      only1Anchor: "came back on time",
      only2Anchor: "children",
      key: "Overdue fines discourage some people from using public libraries.",
      only1: "Most books are returned on time even when libraries charge no fines.",
      only2: "Children borrow far more books once libraries stop charging fines.",
      broad: "Libraries without fines never have trouble getting books returned.",
      broadWhy: "Text 1 says most books came back on time, not all, and Text 2 does not discuss returns at all.",
      why: "Text 1 reports patrons saying old fines had kept them away, and Text 2 concludes that fines drive patrons away",
    },
  ];

  const ctcSharedClaim = {
    ...CTC_BASE,
    id: "cross-text-shared-claim",
    subskill: "agreement",
    difficulty: "Easy",
    title: "Both texts state the same claim in different words",
    recognize:
      "Both texts make the same point in their own words; the answer is that point, not a detail that only one text mentions.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 0 },
    tricks: ["one-text-only", "too-broad"],
    build(t) {
      const topic = t.pick(CTC_SHARED_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: "Based on the texts, both authors would most likely agree with which statement?",
        correct: topic.key,
        wrong: [
          [topic.only1, "Only Text 1 makes this point; Text 2 never addresses it, so there is no basis for saying its author would agree."],
          [topic.only2, "Only Text 2 makes this point; Text 1 never addresses it, so there is no basis for saying its author would agree."],
          [topic.broad, topic.broadWhy],
        ],
        explanation: `Both texts support this statement: ${topic.why}.`,
        steps: [
          "Note the main claim of Text 1.",
          "Find where Text 2 makes the same claim in different words.",
          "Choose the statement both texts support, rejecting details that appear in only one text.",
        ],
        principles: [
          "An agreement answer must be supported by both texts, not merely stated in one of them.",
        ],
        trap: "Choosing a vivid detail that appears in only one of the two texts.",
        hint: "Check each choice against Text 1, then against Text 2.",
        estimatedSeconds: 60,
        verify: () => {
          const [one, two] = CTC_split(content);
          return one.includes(topic.shared1) && two.includes(topic.shared2) &&
            one.includes(topic.only1Anchor) && !two.includes(topic.only1Anchor) &&
            two.includes(topic.only2Anchor) && !one.includes(topic.only2Anchor);
        },
      };
    },
  };

  /* ------------------------------------------------------------------ *
   * 2. Text 1 describes a difficulty; Text 2 describes what solved a   *
   *    similar one elsewhere.                                          *
   * ------------------------------------------------------------------ */
  const CTC_SOLUTION_TOPICS = [
    {
      scene: "cs-map-archive-mold",
      text1:
        "The Ellery County archive keeps its nineteenth-century survey maps in a basement room, and small spots of mold have begun to appear on them. Last year staff sealed each map in a plastic sleeve, hoping to shut out the damp, but the sleeves trapped moisture against the paper and the mold spread faster.",
      text2:
        "The Bellfort Library faced the same trouble with its basement collection of old charts. Running extra dehumidifiers did little; they could not keep pace with the damp air seeping through cracks in the walls. What worked was sealing those cracks and installing a small fan system to keep air moving. Within a month, humidity fell below 50 percent and no new mold appeared.",
      failAnchor: "plastic sleeve",
      fixAnchor: "sealing those cracks",
      weakAnchor: "extra dehumidifiers",
      key: "Sealing cracks in the walls and installing fans to move the air",
      failed: "Sealing each map in a plastic sleeve to keep out the damp air",
      weak: "Running more dehumidifiers to draw moisture out of the room's air",
      broad: "Moving the archive's entire collection into a new building",
      why: "the Bellfort Library stopped its mold by sealing cracks in the walls and keeping the air moving",
    },
    {
      scene: "cs-kessford-flooding",
      text1:
        "Main Street in the town of Kessford floods after nearly every heavy rain. Two years ago the town widened the storm drains beneath the street, yet the flooding continues, because rainwater pours downhill from the paved parking lots above Main Street faster than any drain can carry it away.",
      text2:
        "The town of Arlow once had a flooding problem much like Kessford's. Raising the curbs along its main road did little, since the water simply spilled over them. Arlow finally replaced the pavement of its hillside parking lots with porous paving and planted strips of rain gardens, which let the water soak into the ground before it could reach the road.",
      failAnchor: "widened the storm drains",
      fixAnchor: "porous paving",
      weakAnchor: "Raising the curbs",
      key: "Resurfacing the uphill parking lots with paving that absorbs rain",
      failed: "Widening the storm drains that run beneath Main Street even further",
      weak: "Raising the curbs along Main Street to hold back the rushing water",
      broad: "Relocating Kessford's downtown businesses to higher ground",
      why: "Arlow stopped its flooding by replacing the pavement of its hillside parking lots with porous paving",
    },
    {
      scene: "cs-lunch-waste",
      text1:
        "Cafeteria workers at Fairhaven Middle School throw away bins of untouched vegetables every day. Last fall the school hung colorful posters about nutrition above the serving line, but a count of discarded food showed no change. Students, the cafeteria manager says, often rush through lunch to get outside.",
      text2:
        "At Birch River Elementary, vegetable waste fell by a third after the school moved recess before lunch instead of after it. Students who had already played arrived at lunch hungry and unhurried, and they ate more of what was on their trays. Serving larger portions of vegetables, tried the year before, had only increased the waste.",
      failAnchor: "posters",
      fixAnchor: "moved recess before lunch",
      weakAnchor: "larger portions",
      key: "Scheduling recess before lunch rather than after it",
      failed: "Hanging more posters about nutrition above the serving line",
      weak: "Serving students larger portions of vegetables at lunch",
      broad: "Removing vegetables from the school lunch menu entirely",
      why: "Birch River cut vegetable waste by a third by moving recess before lunch",
    },
    {
      scene: "cs-orchard-frost",
      text1:
        "Apple growers in the Corrie Valley lose many of their blossoms to frosts that strike on clear, still nights in late spring. Some growers have tried draping cloth over their trees, but the covers tear in the wind and take hours to put on across a large orchard.",
      text2:
        "On frosty spring nights, the coldest air settles close to the ground while a layer of warmer air lies just above it. Growers in the neighboring Corra Valley now run tall fans that pull that warmer air down among the trees, and blossom losses have fallen sharply. Burning oil heaters in the rows, tried earlier, used costly fuel and warmed only the trees nearest them.",
      failAnchor: "draping cloth",
      fixAnchor: "tall fans",
      weakAnchor: "oil heaters",
      key: "Running tall fans that draw warmer air down into the orchard",
      failed: "Draping cloth covers over the trees on cold, clear nights",
      weak: "Burning oil heaters among the rows of trees on frosty nights",
      broad: "Replacing the apple trees with crops that bloom in summer",
      why: "Corra Valley growers cut blossom losses by running fans that pull warmer air down among the trees",
    },
    {
      scene: "cs-theater-radio",
      text1:
        "Audiences at the Grayling Community Theater have dwindled for three seasons. Last year the theater added more performances of each play, hoping that extra dates would suit busy schedules, but most seats stayed empty. A survey found that many residents simply did not know what the theater was staging.",
      text2:
        "The Harbor Street Playhouse revived its audiences by partnering with the local radio station, which aired two-minute scenes from upcoming plays each Friday morning. Printing more posters had brought in few new patrons, but after the broadcasts began, ticket sales doubled within a season.",
      failAnchor: "added more performances",
      fixAnchor: "aired two-minute scenes",
      weakAnchor: "Printing more posters",
      key: "Broadcasting short scenes from upcoming plays on local radio",
      failed: "Adding extra performances of each play to suit busy schedules",
      weak: "Printing and displaying more posters for upcoming plays",
      broad: "Lowering ticket prices for every play the theater stages",
      why: "the Harbor Street Playhouse doubled its ticket sales once the radio station aired scenes from upcoming plays",
    },
    {
      scene: "cs-trail-erosion",
      text1:
        "Hikers on the Oriel Ridge trail have widened it to three times its original width in places, stripping plants from the slopes and letting rain wash the soil away. Rangers posted signs asking hikers to stay on the path, yet erosion continues: where the trail turns to mud, hikers step around the puddles.",
      text2:
        "Rangers in the Tavish Hills faced the same problem on a popular trail. Fining hikers caught off the path had little effect, since rangers could patrol only a few hours a week. Instead, they built a raised boardwalk over the muddiest stretches. With dry footing available, hikers stopped detouring, and plants returned to the trail's edges within two years.",
      failAnchor: "posted signs",
      fixAnchor: "raised boardwalk",
      weakAnchor: "Fining hikers",
      key: "Building a raised boardwalk over the trail's muddiest stretches",
      failed: "Posting additional signs that ask hikers to stay on the trail",
      weak: "Fining any hikers who are caught stepping off the trail",
      broad: "Closing the Oriel Ridge trail to hikers until the slopes recover",
      why: "Tavish Hills rangers stopped hikers from detouring by building a raised boardwalk over the muddiest stretches",
    },
    {
      scene: "cs-clinic-reminders",
      text1:
        "Nearly one in four patients at the Briar Family Clinic misses a scheduled appointment. The clinic began charging a $20 fee for missed visits, but the rate barely changed. Most patients who miss appointments booked them weeks in advance, staff say, and simply forgot.",
      text2:
        "When the Ossery Health Center texted each patient a reminder two days before every appointment, missed visits fell by half. Reminder postcards mailed when appointments were booked, the center's earlier approach, had made little difference, since patients rarely kept them.",
      failAnchor: "charging a $20 fee",
      fixAnchor: "texted each patient a reminder",
      weakAnchor: "Reminder postcards",
      key: "Texting each patient a reminder a couple of days before a visit",
      failed: "Charging patients a larger fee each time they miss a visit",
      weak: "Mailing each patient a reminder postcard when a visit is booked",
      broad: "Refusing to book any appointment more than a day in advance",
      why: "the Ossery Health Center halved missed visits by texting patients a reminder two days ahead",
    },
    {
      scene: "cs-hall-echo",
      text1:
        "The Braddock Choir's new home, a concert hall with bare plaster walls, has a harsh echo that blurs the words of every song. The director has tried having the choir sing more slowly, but the words still run together, as each syllable rebounds from the back of the hall.",
      text2:
        "Singers at the Lisle Music Hall once struggled with a similar echo. Rearranging the seats did nothing to help. The problem eased only when engineers hung heavy fabric panels along the rear wall, where they absorbed the sound that had been bouncing back toward the stage.",
      failAnchor: "sing more slowly",
      fixAnchor: "heavy fabric panels",
      weakAnchor: "Rearranging the seats",
      key: "Hanging heavy fabric panels along the back wall of the hall",
      failed: "Having the choir sing each of its pieces even more slowly",
      weak: "Rearranging the seats so the audience sits nearer the stage",
      broad: "Moving the choir's concerts to a much smaller building",
      why: "the Lisle Music Hall's echo eased once heavy fabric panels on the rear wall absorbed the rebounding sound",
    },
    {
      scene: "cs-harbor-silt",
      text1:
        "Sand carried by a coastal current keeps filling the old harbor of Wexley, and fishing boats now run aground at low tide. The town has paid to dredge the harbor every spring for a decade, but the channel fills again within months.",
      text2:
        "Silt once choked the harbor at Cordel as well. Planting eelgrass near the entrance, a remedy local officials hoped would trap the sand, had no noticeable effect. The harbor stayed open only after the town built a stone breakwater angled to turn the sand-laden current away from the harbor mouth.",
      failAnchor: "dredge the harbor",
      fixAnchor: "stone breakwater",
      weakAnchor: "eelgrass",
      key: "Building a breakwater angled to turn the current aside",
      failed: "Dredging the harbor channel more often than once each spring",
      weak: "Planting beds of eelgrass near the entrance to the harbor",
      broad: "Moving the town's fishing fleet to a harbor on another coast",
      why: "Cordel kept its harbor open only after building a breakwater angled to turn the sand-laden current away",
    },
    {
      scene: "cs-garden-theft",
      text1:
        "Vegetables keep disappearing from the community garden on Elm Street, usually just before they ripen. Last summer the gardeners put up a taller fence around the plots, but produce still vanished overnight, and a neighbor reported seeing people climb over it.",
      text2:
        "The Ravenna Road garden cut its losses to theft by planting a “share bed” beside the gate, a plot whose crops anyone may pick. Security cameras, installed a year earlier, had not deterred anyone. With free produce openly available, the gardeners found, few people bothered to take vegetables from the private plots.",
      failAnchor: "taller fence",
      fixAnchor: "share bed",
      weakAnchor: "Security cameras",
      key: "Planting a bed by the gate whose produce anyone may pick",
      failed: "Building an even taller fence around the garden's plots",
      weak: "Installing security cameras to watch the plots at night",
      broad: "Closing the garden to everyone except registered members",
      why: "the Ravenna Road garden cut its losses by planting a bed by the gate that anyone may harvest",
    },
  ];

  const ctcProblemSolution = {
    ...CTC_BASE,
    id: "cross-text-problem-solution",
    subskill: "response between texts",
    difficulty: "Easy",
    title: "Second text's solution applied to the first text's problem",
    recognize:
      "Text 1 presents a problem and a failed fix; Text 2 reports what worked elsewhere. The answer is the approach Text 2 credits, not one either text reports failing.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 0 },
    tricks: ["one-text-only", "opposite-stance", "too-broad"],
    build(t) {
      const topic = t.pick(CTC_SOLUTION_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: "Based on the texts, which approach would the author of Text 2 most likely recommend for the difficulty described in Text 1?",
        correct: topic.key,
        wrong: [
          [topic.failed, "This is the measure Text 1 says was already tried without success, and Text 2 never endorses it."],
          [topic.weak, "Text 2 mentions this approach only as one that did little, so its author would not recommend it."],
          [topic.broad, "Text 2 never proposes so sweeping a measure; it reports a specific fix that worked."],
        ],
        explanation: `Text 2 reports that ${topic.why}, so its author would most likely recommend the same approach for the problem in Text 1.`,
        steps: [
          "Identify the difficulty in Text 1 and what has already been tried there.",
          "Find the approach Text 2 reports as successful and any it reports as ineffective.",
          "Choose the approach Text 2 credits with solving the similar problem.",
        ],
        principles: [
          "A recommendation attributed to an author must come from what that author presents as effective.",
        ],
        trap: "Picking the measure Text 1 already tried, or one that Text 2 mentions only as a failure.",
        hint: "What does Text 2 say actually worked?",
        estimatedSeconds: 60,
        verify: () => {
          const [one, two] = CTC_split(content);
          return one.includes(topic.failAnchor) && !two.includes(topic.failAnchor) &&
            two.includes(topic.fixAnchor) && !one.includes(topic.fixAnchor) &&
            two.includes(topic.weakAnchor) && !one.includes(topic.weakAnchor);
        },
      };
    },
  };

  /* ------------------------------------------------------------------ *
   * 3. Text 1 generalizes; Text 2 describes a case that does not fit.  *
   * ------------------------------------------------------------------ */
  const CTC_COUNTER_TOPICS = [
    {
      scene: "cs-tolmar-mice",
      text1:
        "Small mammals that colonize islands tend to grow larger than their mainland relatives. With fewer predators to escape and fewer competitors for food, island rodents can afford bigger bodies, and surveys of island mice from many parts of the world have found them heavier than mainland mice. The pattern is one of the most dependable rules in island biology.",
      text2:
        "The deer mice of Tolmar Island are about 20 percent lighter than deer mice on the nearby mainland. Zoologist Colin Baptiste traced the difference to Tolmar's thin, rocky soil, which supports few seed-bearing plants. On Tolmar, it seems, scarce food rather than predators sets the limit on how large the mice can grow.",
      ruleAnchor: "grow larger than their mainland relatives",
      caseAnchor: "Tolmar",
      key: "By pointing out that Tolmar's mice are smaller than their mainland relatives",
      support: "By citing Tolmar's mice as further evidence that island rodents grow larger",
      extreme: "By arguing that island rodents are usually smaller than their mainland kin",
      method: "By questioning whether the surveys in Text 1 weighed enough island mice",
      why: "Text 1 claims that island rodents grow larger than their mainland relatives, but Text 2 describes Tolmar's deer mice, which are lighter than mainland mice",
    },
    {
      scene: "cs-calder-court",
      text1:
        "City dwellers know fewer of their neighbors than people in small towns do. Crowded buildings, frequent moves, and long working hours leave urban residents little chance to form lasting ties with the people next door, and surveys in city after city have found that most residents can name only a handful of neighbors.",
      text2:
        "In the Calder Court apartments, a large complex in the city of Ravensport, residents share a central courtyard, a laundry room, and a vegetable garden. When sociologist Mei Tran surveyed them, the typical resident could name more than twenty neighbors, a higher figure than she recorded in any of the three rural towns she also surveyed.",
      ruleAnchor: "City dwellers know fewer of their neighbors",
      caseAnchor: "Calder Court",
      key: "By noting that Calder Court's residents, though city dwellers, know many neighbors",
      support: "By presenting Calder Court as an example of city residents who know few neighbors",
      extreme: "By claiming that city residents generally know more neighbors than rural residents",
      method: "By arguing that the surveys in Text 1 included too few small-town residents",
      why: "Text 1 claims that city dwellers know fewer neighbors than small-town residents, but Text 2 describes a city complex whose residents know more neighbors than rural residents do",
    },
    {
      scene: "cs-orsa-shrub",
      text1:
        "Plants that survive in deserts share one strategy above all: they store water. Cacti swell their stems with it, aloes pack it into thick leaves, and some desert trees hoard it in swollen trunks. Storing water during rare rains is how desert plants endure the long dry months between them.",
      text2:
        "The Orsa shrub thrives in the Kalvar Desert, where rain may not fall for two years. Yet its leaves are thin and papery, and its stems hold almost no water. Botanist Selin Arda found that its roots reach more than thirty meters down to groundwater, supplying the plant with water even in the driest seasons.",
      ruleAnchor: "they store water",
      caseAnchor: "Orsa",
      key: "By pointing out that the Orsa shrub survives drought without storing water",
      support: "By citing the Orsa shrub as another desert plant that stores water in its stems",
      extreme: "By arguing that most desert plants rely on deep roots rather than stored water",
      method: "By questioning how carefully Text 1 measured the water in desert plants",
      why: "Text 1 claims that desert plants survive by storing water, but Text 2 describes the Orsa shrub, which stores almost none and draws on deep groundwater instead",
    },
    {
      scene: "cs-lessa-wall",
      text1:
        "The stone walls that ring the medieval towns of the Vellan region were built for defense. In an age of frequent raids, a town without walls invited attack, and Vellan towns raised theirs as soon as they could afford the stone.",
      text2:
        "Lessa, a Vellan market town, completed its wall in 1342, nearly a century after the last recorded raid in the region. The town council's accounts list a toll collector at each of its six gates but no guards. Historian Jonas Fell concludes that Lessa's wall served mainly to force merchants through gates where they could be charged tolls.",
      ruleAnchor: "were built for defense",
      caseAnchor: "Lessa",
      key: "By noting that Lessa's wall served mainly to collect tolls, not to defend",
      support: "By citing Lessa's wall as further evidence that Vellan walls were defensive",
      extreme: "By arguing that no town in the Vellan region built its wall for defense",
      method: "By questioning whether Text 1 examined enough Vellan town records",
      why: "Text 1 claims that Vellan town walls were built for defense, but Text 2 describes Lessa's wall, built long after the raids ended to collect tolls",
    },
    {
      scene: "cs-renn-composer",
      text1:
        "Composers at the eighteenth-century Arvelan court wrote for aristocratic patrons. Their symphonies were performed at palace concerts, their dances accompanied court balls, and their livelihoods depended on pleasing the nobles who employed them.",
      text2:
        "Mattias Renn served as a composer at the Arvelan court for a decade. Yet most of his surviving works are songs and marches for the town's street festivals, and his account book records payments from craft guilds, not from nobles. Renn, it seems, wrote chiefly for the townspeople.",
      ruleAnchor: "wrote for aristocratic patrons",
      caseAnchor: "Renn",
      key: "By noting that Renn, though a court composer, wrote mainly for townspeople",
      support: "By treating Renn's career as typical of Arvelan composers who served nobles",
      extreme: "By arguing that Arvelan court composers rarely wrote for aristocratic patrons",
      method: "By questioning how Text 1 dated the symphonies played at palace concerts",
      why: "Text 1 claims that Arvelan court composers wrote for aristocrats, but Text 2 describes Renn, a court composer who wrote chiefly for townspeople",
    },
    {
      scene: "cs-durrow-cinema",
      text1:
        "When household incomes fall, families cut spending on entertainment first. Economists have found this pattern in downturn after downturn: meals out, concert tickets, and trips to the movies are the first expenses to go, long before spending on food or rent declines.",
      text2:
        "In 2009 the mine in the town of Durrow cut its workers' hours by a third. That year, attendance at the Durrow Picture House rose by 30 percent, and its owner reported record sales of cheap afternoon tickets. For many families, a matinee became the one outing they could still afford.",
      ruleAnchor: "cut spending on entertainment first",
      caseAnchor: "Durrow",
      key: "By noting that Durrow's families went to the cinema more after incomes fell",
      support: "By citing Durrow's cinema as an example of entertainment spending falling first",
      extreme: "By arguing that families generally spend more on entertainment when incomes fall",
      method: "By questioning which downturns the economists in Text 1 chose to study",
      why: "Text 1 claims that families cut entertainment first when incomes fall, but Text 2 describes Durrow, where cinema attendance rose after incomes fell",
    },
    {
      scene: "cs-reed-frog",
      text1:
        "Bright colors on a frog are a warning. Poison frogs advertise their toxic skins with vivid reds, yellows, and blues, and predators that have tasted one learn to avoid the rest. Among frogs, vivid coloring is a reliable signal that an animal is poisonous.",
      text2:
        "The scarlet reed frog of the Imbe wetlands is one of the most brightly colored frogs known. Yet when herpetologist Marisa Soler tested its skin, she found no toxins at all. Predators avoid it anyway, apparently because it closely resembles a poisonous frog that shares its wetlands.",
      ruleAnchor: "reliable signal that an animal is poisonous",
      caseAnchor: "scarlet reed frog",
      key: "By pointing out that the scarlet reed frog is brightly colored but harmless",
      support: "By citing the scarlet reed frog as another bright frog with a toxic skin",
      extreme: "By arguing that bright coloring in frogs seldom indicates that they are toxic",
      method: "By questioning how Text 1 tested the skins of brightly colored frogs",
      why: "Text 1 claims that vivid coloring reliably signals a poisonous frog, but Text 2 describes a vividly colored frog with no toxins",
    },
    {
      scene: "cs-oriana-woodcuts",
      text1:
        "Printers in the city of Oriana during the 1500s reserved woodcut illustrations for religious books. Carving a woodcut was costly, and only devotional works sold well enough to repay the expense; almanacs, grammars, and other everyday books were printed as plain text.",
      text2:
        "An almanac printed in Oriana in 1542, now held in the Varr Library, contains forty woodcuts: pictures of farm tools, constellations, and market scenes fill its pages. The book's many surviving copies suggest that it sold widely, pictures and all.",
      ruleAnchor: "reserved woodcut illustrations for religious books",
      caseAnchor: "1542",
      key: "By noting that an Orianan almanac from 1542 is full of woodcut pictures",
      support: "By citing the 1542 almanac as an example of a book printed as plain text",
      extreme: "By arguing that Orianan printers illustrated everyday books as often as religious ones",
      method: "By questioning how Text 1 estimated the cost of carving a woodcut",
      why: "Text 1 claims that Orianan printers illustrated only religious books, but Text 2 describes an almanac, an everyday book, with forty woodcuts",
    },
    {
      scene: "cs-sarro-loach",
      text1:
        "Fish that colonize dark caves lose their eyes over many generations. Eyes are costly to build and maintain, and where there is nothing to see, fish that invest less in them have energy to spare for growth and reproduction. Cave fish around the world show the result: shrunken or missing eyes.",
      text2:
        "The Sarro cave loach has lived in the Sarro caverns for at least 100,000 years, yet it still has large, fully working eyes. Ichthyologist Rui Tavares notes that each spring, floods sweep the loaches out of the caves into sunlit river pools, where they spend several months before returning.",
      ruleAnchor: "lose their eyes over many generations",
      caseAnchor: "Sarro",
      key: "By noting that the Sarro cave loach has kept working eyes despite living in caves",
      support: "By citing the Sarro cave loach as another cave fish whose eyes have shrunk",
      extreme: "By arguing that cave fish generally keep their eyes however long they live in caves",
      method: "By questioning how Text 1 measured the eyes of cave fish around the world",
      why: "Text 1 claims that cave fish lose their eyes over generations, but Text 2 describes a cave fish that has kept working eyes for 100,000 years",
    },
    {
      scene: "cs-lantern-keeper",
      text1:
        "Novelists of the Verran school, writing in the 1880s, relied on all-knowing narrators. Their narrators could enter any character's mind, reveal secrets the characters kept from one another, and comment freely on events, a technique that suited the school's sprawling family sagas.",
      text2:
        "Hanne Ostrova's 1884 novel The Lantern Keeper, one of the most widely read Verran novels, is narrated entirely by a young servant. She knows only what she overhears in the halls, and she often misjudges her employers, leaving readers to piece together what she misses.",
      ruleAnchor: "relied on all-knowing narrators",
      caseAnchor: "Lantern Keeper",
      key: "By noting that The Lantern Keeper's narrator knows only what she overhears",
      support: "By citing The Lantern Keeper as a Verran novel with an all-knowing narrator",
      extreme: "By arguing that Verran novelists generally avoided all-knowing narrators",
      method: "By questioning which Verran novels Text 1 relies on for its claim",
      why: "Text 1 claims that Verran novelists relied on all-knowing narrators, but Text 2 describes a widely read Verran novel narrated by a servant who knows very little",
    },
  ];

  const ctcCounterexample = {
    ...CTC_BASE,
    id: "cross-text-counterexample",
    subskill: "response between texts",
    difficulty: "Medium",
    title: "Second text offers a case that the first text's generalization does not fit",
    recognize:
      "Text 1 states a general pattern; Text 2 describes one case that breaks it. The response is to present that case as an exception, not to reverse the whole pattern.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["opposite-stance", "too-broad"],
    build(t) {
      const topic = t.pick(CTC_COUNTER_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: "Based on the texts, how would the author of Text 2 most likely respond to the generalization in Text 1?",
        correct: topic.key,
        wrong: [
          [topic.support, "The case in Text 2 contradicts the generalization in Text 1; treating it as support reverses what Text 2 shows."],
          [topic.extreme, "Text 2 describes a single exception; one case cannot establish that the opposite pattern holds in general."],
          [topic.method, "Text 2 never discusses how Text 1's evidence was gathered; it responds with a counterexample, not a criticism of methods."],
        ],
        explanation: `${topic.why}, so the author of Text 2 would most likely point to that case as an exception to the generalization.`,
        steps: [
          "State the generalization Text 1 makes.",
          "Identify the specific case in Text 2 and check whether it fits the generalization.",
          "Choose the response that presents the case as an exception without overturning the whole pattern.",
        ],
        principles: [
          "A single counterexample shows that a generalization has exceptions; it does not establish the opposite generalization.",
        ],
        trap: "Treating one exception as proof that the pattern is reversed, or missing that the case contradicts Text 1 at all.",
        hint: "Does the case in Text 2 fit the pattern Text 1 describes?",
        estimatedSeconds: 75,
        verify: () => {
          const [one, two] = CTC_split(content);
          return one.includes(topic.ruleAnchor) && two.includes(topic.caseAnchor) &&
            !one.includes(topic.caseAnchor) && topic.key.includes(topic.caseAnchor) &&
            !topic.method.includes(topic.caseAnchor);
        },
      };
    },
  };

  /* ------------------------------------------------------------------ *
   * 4. Text 1 reports one finding; Text 2 states the broader principle *
   *    (or mechanism) of which it is an instance.                      *
   * ------------------------------------------------------------------ */
  const CTC_EXTEND_TOPICS = [
    {
      scene: "cs-middle-option",
      who: "Yara Pettersen",
      text1:
        "The Brindle Café used to sell coffee in two sizes, small and medium. When it added a large cup priced just above the medium, something odd happened: sales of the large were modest, but sales of the medium rose by 40 percent, while sales of the small fell.",
      text2:
        "Economist Yara Pettersen has documented what she calls the middle-option effect. Offered three versions of a product, many shoppers pick the middle one, which seems a safe compromise between paying too much and settling for too little. She has observed the effect in stores selling televisions, running shoes, and wine, where adding a costly top model reliably boosts sales of the mid-priced one.",
      findingAnchor: "sales of the medium rose by 40 percent",
      principleAnchor: "middle-option effect",
      exampleAnchor: "wine",
      key: "As an example of shoppers treating the middle choice as a safe compromise",
      opposite: "As a case in which shoppers avoided the middle choice they were offered",
      narrow: "As a quirk of coffee buyers that would not appear in other kinds of stores",
      misattributed: "As evidence that wine buyers favor bottles in the middle of a price range",
      why: "Text 2 describes shoppers choosing the middle of three options as a safe compromise, and the café's customers did exactly that once a large size was added",
    },
    {
      scene: "cs-violet-seeds",
      who: "Anders Kallio",
      text1:
        "Botanist Mara Ekholm found that each seed of the woodland violet carries a small, fatty tip. Ants carry the seeds back to their nests, eat the tips, and discard the seeds in their refuse piles, where rich soil helps the seeds sprout far from the parent plant.",
      text2:
        "Many plants pay animals to move their seeds. Ecologist Anders Kallio describes how a food reward attached to a seed, such as a fleshy coating or an oily appendage, leads animals to carry the seed away before eating the reward and leaving the seed behind. He has traced the strategy in thousands of species, including thorn acacias whose seeds are moved by birds.",
      findingAnchor: "fatty tip",
      principleAnchor: "pay animals to move their seeds",
      exampleAnchor: "acacias",
      key: "As an instance of a plant rewarding animals for moving its seeds",
      opposite: "As a case of a plant spreading its seeds without help from animals",
      narrow: "As a strategy peculiar to the woodland violet and its ant visitors",
      misattributed: "As evidence that thorn acacias rely on birds to move their seeds",
      why: "Text 2 describes plants attaching a food reward so that animals carry their seeds away, which is what the violet's fatty tip does with ants",
    },
    {
      scene: "cs-crowd-referees",
      who: "Leila Amani",
      text1:
        "In the 2021 season, matches in the Castra Football League were played in empty stadiums. Analyst Beno Sato compared those matches with the previous five seasons and found that referees' tendency to call more fouls against visiting teams all but disappeared once the crowds were gone.",
      text2:
        "Psychologist Leila Amani argues that people who judge performances are swayed by audience reactions, often without realizing it. In one experiment, gymnastics judges scored identical routines higher when the recording was played with loud cheering than when it was played in silence.",
      findingAnchor: "all but disappeared once the crowds were gone",
      principleAnchor: "swayed by audience reactions",
      exampleAnchor: "gymnastics",
      key: "As an example of officials' judgments being shaped by crowd reactions",
      opposite: "As evidence that officials' judgments are unaffected by crowd reactions",
      narrow: "As a pattern limited to referees in one league during a single season",
      misattributed: "As proof that gymnastics judges reward routines greeted by loud cheers",
      why: "Text 2 argues that judges are swayed by audience reactions, and the referees' bias against visitors vanished when there was no home crowd to react",
    },
    {
      scene: "cs-abbey-chant",
      who: "Pim Aalders",
      text1:
        "Musicologist Helena Nystrom found that the chants composed for the Abbey of Saint Veran in the 1100s are slow and sustained, with few quick notes. In the abbey's stone nave, where a sung note echoes for eight seconds, she observed, faster music blurs into noise, while the slow chants ring out clearly.",
      text2:
        "Architectural historian Pim Aalders argues that musical styles tend to develop to suit the spaces where they are performed. Intricate chamber music, he notes, arose in small, carpeted rooms where quick passages stay distinct, while loud brass music for festivals flourished in town squares, where sound disperses into the open air.",
      findingAnchor: "echoes for eight seconds",
      principleAnchor: "develop to suit the spaces",
      exampleAnchor: "chamber music",
      key: "As an example of music taking a form suited to where it was performed",
      opposite: "As evidence that music develops without regard to where it is performed",
      narrow: "As a feature peculiar to the chants of a single abbey in one century",
      misattributed: "As support for the claim that chamber music arose in small, carpeted rooms",
      why: "Text 2 argues that musical styles develop to suit their performance spaces, and the abbey's slow chants suit its long echo",
    },
    {
      scene: "cs-street-trees",
      who: "Ruth Okonjo",
      text1:
        "On a hot July afternoon, researchers measured air temperatures on every block of the Kingsley district. Blocks lined with mature trees were, on average, 4 degrees Celsius cooler than blocks with no trees, even though the tree-lined blocks had just as much pavement and traffic.",
      text2:
        "Plants cool their surroundings as well as shading them, explains climatologist Ruth Okonjo. Leaves release water vapor through tiny pores, and as that water evaporates it absorbs heat from the air. Okonjo has measured this cooling over farm fields, city parks, and even rooftops planted with grasses.",
      findingAnchor: "4 degrees Celsius cooler",
      principleAnchor: "as that water evaporates it absorbs heat",
      exampleAnchor: "rooftops",
      key: "As an effect of the air cooling as water evaporates from leaves",
      opposite: "As a result that the evaporation of water from leaves cannot explain",
      narrow: "As a cooling effect that would be found only in the Kingsley district",
      misattributed: "As evidence that rooftops planted with grasses cool the air around them",
      why: "Text 2 explains that plants cool the air as water evaporates from their leaves, a mechanism that accounts for the cooler tree-lined blocks",
    },
    {
      scene: "cs-castrel-rumors",
      who: "Ferran Soto",
      text1:
        "During the grain shortage of 1791 in the port of Castrel, rumors that merchants were hoarding flour spread with startling speed. Historian Colette Marchand mapped the rumors' appearance in police reports and found that they spread fastest along the daily routes of the city's water carriers, who delivered water to every neighborhood.",
      text2:
        "In preindustrial cities, argues historian Ferran Soto, news traveled along the paths of workers whose jobs took them across town. Porters, laundresses, and messengers carried reports from one district to the next far faster than printed notices could. In 1750s Valdor, he shows, word of a bread price rise reached the poorest quarters days before the official announcement.",
      findingAnchor: "water carriers",
      principleAnchor: "news traveled along the paths of workers",
      exampleAnchor: "Valdor",
      key: "As an example of news spreading through workers who moved around the city",
      opposite: "As a case in which printed notices spread news faster than workers did",
      narrow: "As a pattern peculiar to Castrel during a single grain shortage",
      misattributed: "As evidence that news of a price rise reached Valdor's poor quarters early",
      why: "Text 2 argues that news traveled along the routes of workers who crossed the city, and Castrel's rumors followed the water carriers' routes",
    },
    {
      scene: "cs-nap-recall",
      who: "Jae-won Seo",
      text1:
        "In a study by psychologist Imogen Sato, two groups of students memorized a list of forty words at noon. One group then napped for an hour; the other stayed awake. The next morning, the students who had napped recalled about 20 percent more words than those who had not.",
      text2:
        "Neuroscientist Jae-won Seo has shown that during deep sleep the brain replays patterns of activity first recorded during learning, strengthening the connections that store new memories. In rats that had just learned a maze, he recorded the same sequence of neural firing repeating again and again as the animals slept.",
      findingAnchor: "recalled about 20 percent more words",
      principleAnchor: "replays patterns of activity",
      exampleAnchor: "maze",
      key: "As an effect of the brain replaying new learning during sleep",
      opposite: "As a finding that conflicts with the idea that sleep strengthens memory",
      narrow: "As a result that applies only to lists of words learned at noon",
      misattributed: "As evidence that rats replay the routes of mazes while they sleep",
      why: "Text 2 shows that the sleeping brain replays and strengthens new learning, which would explain why the nappers recalled more words",
    },
    {
      scene: "cs-skellan-loanwords",
      who: "Ivo Petrakis",
      text1:
        "Linguist Sanne Holm found that the fishing villages of the Skellan coast, which traded for two centuries with sailors from the island of Kest, borrowed dozens of Kestish words for fish, nets, and knots, while the rest of their vocabulary remained almost untouched by Kestish.",
      text2:
        "When two languages come into contact, argues linguist Ivo Petrakis, borrowing concentrates in the specialized vocabulary of whatever activity brings their speakers together. Traders on the Sella River, for instance, took their words for weights and coins from their neighbors' language but kept their own words for family and home.",
      findingAnchor: "words for fish, nets, and knots",
      principleAnchor: "borrowing concentrates in the specialized vocabulary",
      exampleAnchor: "Sella",
      key: "As an example of borrowing concentrated in the vocabulary of a shared trade",
      opposite: "As a case in which everyday words were borrowed more readily than trade words",
      narrow: "As a pattern found only in fishing villages along the Skellan coast",
      misattributed: "As evidence that Sella River traders borrowed their words for coins",
      why: "Text 2 argues that borrowing concentrates in the vocabulary of the activity that brings speakers together, and the Skellan villages borrowed fishing words from the sailors they traded with",
    },
    {
      scene: "cs-quellen-teams",
      who: "Kofi Asante",
      text1:
        "At the software firm Quellen, analyst Petra Szabo compared teams whose members shared an office with teams spread across several cities. Though both kinds of teams used the same tools, the shared-office teams fixed urgent software faults almost twice as fast.",
      text2:
        "Organizational researcher Kofi Asante argues that unplanned encounters, such as an overheard question or a chat by the coffee machine, are how knowledge spreads within groups. He found, for example, that hospital wards where nurses shared a single station caught medication errors sooner than wards where nurses worked at separate stations.",
      findingAnchor: "almost twice as fast",
      principleAnchor: "unplanned encounters",
      exampleAnchor: "nurses",
      key: "As an example of shared space letting knowledge spread by chance contact",
      opposite: "As evidence that chance contact slows the spread of knowledge within groups",
      narrow: "As a pattern that applies only to software teams handling urgent faults",
      misattributed: "As evidence that nurses at a shared station catch medication errors sooner",
      why: "Text 2 argues that knowledge spreads through unplanned encounters in shared spaces, which would explain why the shared-office teams worked faster",
    },
    {
      scene: "cs-miller-tale",
      who: "Mira Adebayo",
      text1:
        "Folklorist Ingeborg Lund collected sixty versions of the tale of the clever miller in the villages of the Aspen valleys. Comparing them, she found that versions told in neighboring villages were nearly identical, while versions from villages far apart differed in their characters, their tricks, and even their endings.",
      text2:
        "Oral stories change a little with each retelling, argues folklorist Mira Adebayo, so differences pile up with distance, much as they do in spoken dialects. She has traced the same gradual drift in the lullabies sung across the Dorran plateau, whose words shift slightly from one valley to the next.",
      findingAnchor: "villages far apart differed",
      principleAnchor: "differences pile up with distance",
      exampleAnchor: "lullabies",
      key: "As an example of stories changing gradually as they pass from place to place",
      opposite: "As evidence that retelling leaves oral stories largely unchanged over distance",
      narrow: "As a pattern found only in tales about millers from the Aspen valleys",
      misattributed: "As evidence that the lullabies of the Dorran plateau vary from valley to valley",
      why: "Text 2 argues that small changes in each retelling pile up with distance, which is the pattern Lund found in the miller tales",
    },
    {
      scene: "cs-hensley-canal",
      who: "Lin Okoro",
      text1:
        "Before the Darrow Canal opened in 1823, Hensley was a farming village of three hundred people. Within a decade of the canal's opening, historian Amos Reyes found, Hensley had become a market town of four thousand, with warehouses, inns, and a weekly livestock fair along the waterfront.",
      text2:
        "New transport routes redraw the map of settlement, argues historian Lin Okoro: towns along a new route grow, while those it bypasses shrink. When the Morrin Railway was built in the 1860s and passed ten miles from the town of Esk, Esk's population fell by half within twenty years as merchants moved to towns on the line.",
      findingAnchor: "market town of four thousand",
      principleAnchor: "towns along a new route grow",
      exampleAnchor: "Esk",
      key: "As an example of a new transport route causing a town along it to grow",
      opposite: "As a case in which a new transport route caused a nearby town to shrink",
      narrow: "As a kind of growth that only canals, and not railways, could bring",
      misattributed: "As evidence that the town of Esk shrank after the railway passed it by",
      why: "Text 2 argues that towns along a new route grow, and Hensley grew into a market town after the canal opened beside it",
    },
  ];

  const ctcExtends = {
    ...CTC_BASE,
    id: "cross-text-extends",
    subskill: "response between texts",
    difficulty: "Medium",
    title: "Second text states the broader pattern behind the first text's finding",
    recognize:
      "Text 1 reports one specific finding; Text 2, without mentioning it, describes a general pattern or mechanism. Text 2's author would see the finding as one more instance of that pattern.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 1, trap: 0 },
    tricks: ["opposite-stance", "too-narrow", "misattributed-view"],
    build(t) {
      const topic = t.pick(CTC_EXTEND_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: `Based on the texts, how would ${topic.who} (Text 2) most likely view the finding described in Text 1?`,
        correct: topic.key,
        wrong: [
          [topic.opposite, "The finding in Text 1 fits the pattern Text 2 describes; this choice treats it as a contradiction."],
          [topic.narrow, "Text 2 describes a pattern that reaches across many settings, so its author would not treat the finding as a one-off."],
          [topic.misattributed, "This is an example Text 2 gives on its own; the finding in Text 1 says nothing about it."],
        ],
        explanation: `${topic.why}, so Text 2's researcher would most likely view the finding as another instance of that pattern.`,
        steps: [
          "Summarize the specific finding in Text 1.",
          "State the general pattern Text 2 describes, setting aside its own examples.",
          "Choose the choice that treats Text 1's finding as one more case of that pattern.",
        ],
        principles: [
          "When one text states a general principle, a specific finding in another text may be read as an instance of it.",
        ],
        trap: "Choosing Text 2's own example, which Text 1's finding does not address, or treating the finding as unique to its case.",
        hint: "Ask what general pattern the finding in Text 1 would illustrate.",
        estimatedSeconds: 75,
        verify: () => {
          const [one, two] = CTC_split(content);
          return two.includes(topic.who) && one.includes(topic.findingAnchor) && !two.includes(topic.findingAnchor) &&
            two.includes(topic.principleAnchor) && two.includes(topic.exampleAnchor) &&
            !one.includes(topic.exampleAnchor) && topic.misattributed.includes(topic.exampleAnchor) &&
            !topic.key.includes(topic.exampleAnchor);
        },
      };
    },
  };

  /* ------------------------------------------------------------------ *
   * 5. Text 1's principle explains the puzzle Text 2 leaves open.      *
   * ------------------------------------------------------------------ */
  const CTC_APPLY_TOPICS = [
    {
      scene: "cs-carn-esh-walls",
      text1:
        "Heavy materials such as stone and packed earth absorb heat slowly and release it slowly. A thick stone wall therefore evens out swings in temperature: through a hot afternoon it soaks up heat without warming much, and at night it gives that heat back. Such walls feel cool not because stone is naturally cold but because they lag behind the air around them.",
      text2:
        "Visitors to the ruined hill fort at Carn Esh often remark that its storerooms, enclosed by stone walls nearly two meters thick, feel chilly at midday in summer even when the air outside is hot. The storerooms once held grain for the fort's defenders. Some guides suggest that the builders dug cold-water channels beneath the floors, though none has ever been found.",
      puzzle: "why the storerooms at Carn Esh feel chilly on hot summer days",
      principleAnchor: "absorb heat slowly",
      guessAnchor: "cold-water channels",
      detailAnchor: "held grain",
      key: "The thick walls take in the day's heat slowly, so the rooms stay cool.",
      guess: "Hidden channels of cold water running beneath the floors keep them cool.",
      ruledOut: "Stone is a naturally cold material, so the walls chill the rooms.",
      detail: "The rooms stay cool because they were once used to store grain.",
      why: "Text 1 explains that thick stone walls absorb heat slowly and so lag behind the air, which accounts for storerooms with two-meter walls feeling cool at midday",
    },
    {
      scene: "cs-tallis-price",
      text1:
        "Shoppers judge whether a price is fair by comparing it with the first price they saw for the same item. That first figure becomes an anchor: prices above it feel like losses, and prices below it feel like bargains. What the item costs at other stores, or what it cost to make, weighs far less in the judgment than the anchor does.",
      text2:
        "When the Tallis Bookshop began selling Nell Castaño's new novel for $18, customers complained that it was overpriced, although it cost $4 less than at other shops in town. Months earlier, the publisher had advertised the novel at $14 during a brief online promotion. The shop's manager suspects that customers simply dislike paying hardcover prices.",
      puzzle: "why Tallis customers complained about the novel's price",
      principleAnchor: "first price they saw",
      guessAnchor: "dislike paying hardcover prices",
      detailAnchor: "$4 less",
      key: "Customers compared the $18 price with the $14 price they had first seen.",
      guess: "Customers dislike paying the prices charged for hardcover books.",
      ruledOut: "Customers judged the price by what it cost the publisher to make the book.",
      detail: "The novel was priced $4 lower at Tallis than at other shops in town.",
      why: "Text 1 says shoppers judge a price against the first price they saw, and Tallis customers had first seen the novel advertised at $14",
    },
    {
      scene: "cs-vessa-doves",
      text1:
        "Animals that evolve where there are no predators often lose their fear of large creatures. Wariness has costs: an animal that flees at every movement spends less time feeding. Where nothing hunts them, less fearful individuals eat more and leave more offspring, so over generations the whole population grows tame. The tameness reflects this history, not any failure of the animals' senses.",
      text2:
        "Hikers on remote Vessa Island are often startled that its ground doves let people approach within arm's length. The island has never had native mammals or snakes, and the doves nest in low shrubs beside the trails. A local naturalist suggests that the doves have simply grown used to the tourists who feed them.",
      puzzle: "why Vessa Island's ground doves let people come so close",
      principleAnchor: "evolve where there are no predators",
      guessAnchor: "grown used to the tourists",
      detailAnchor: "low shrubs",
      key: "The doves evolved without predators, so fearless birds prospered.",
      guess: "The doves have grown used to tourists who regularly feed them.",
      ruledOut: "The doves cannot see well enough to recognize people as a threat.",
      detail: "Nesting beside the trails leaves the doves little room to flee from people.",
      why: "Text 1 says animals that evolve without predators grow tame over generations, and Vessa Island has never had native mammals or snakes",
    },
    {
      scene: "cs-fennet-canal",
      text1:
        "In the 1800s, merchants did not treat every cargo alike when a faster route opened. For goods that spoiled quickly, such as fruit, speed was worth almost any price, and merchants abandoned slow routes at once; for durable goods such as coal, they kept to whichever route was cheapest, however slow.",
      text2:
        "Ledgers from the Fennet Canal show that fruit shipments collapsed in the early 1850s while coal shipments held steady. In 1851 a railway opened alongside the canal, charging higher rates but moving goods in hours rather than days. Historian Paul Ebert is unsure what happened to the fruit trade; he notes that a drought lowered the canal's water in 1853.",
      puzzle: "why fruit shipments on the Fennet Canal collapsed in the early 1850s",
      principleAnchor: "speed was worth almost any price",
      guessAnchor: "drought",
      detailAnchor: "coal shipments held steady",
      key: "Fruit merchants switched to the faster railway, despite its higher rates.",
      guess: "A drought lowered the canal's water too far for fruit barges to pass.",
      ruledOut: "Fruit merchants chose the cheaper route, while coal needed greater speed.",
      detail: "Coal barges filled the canal and crowded out the boats carrying fruit.",
      why: "Text 1 says merchants moved perishable goods to faster routes at almost any price, and a faster though costlier railway opened beside the canal in 1851",
    },
    {
      scene: "cs-orrin-fossils",
      text1:
        "People who are unsure how to act look to what others are doing. A crowd gathered around something signals that it is worth attention, so a crowd tends to draw more people, whatever drew the first ones there. The pull comes from the crowd itself rather than from anything new about the thing being watched.",
      text2:
        "At the Orrin Science Museum, a small case of fossil fish near the entrance went unnoticed for years. Then, one Tuesday, a school group gathered around it, and for the rest of that week lines formed at the case. The curator wonders whether the case's new lighting, installed the week before, finally made the fossils easy to see.",
      puzzle: "why lines suddenly formed at the Orrin Museum's fossil case",
      principleAnchor: "A crowd gathered around something signals",
      guessAnchor: "new lighting",
      detailAnchor: "near the entrance",
      key: "Visitors took the crowd around the case as a sign it was worth seeing.",
      guess: "The new lighting finally made the fossils in the case easy to see.",
      ruledOut: "Visitors, put off by the crowd, came back to the case once it left.",
      detail: "The case stands close to the entrance, where nearly every visitor passes.",
      why: "Text 1 says a crowd signals that something is worth attention and draws more people, and the lines began right after a school group gathered at the case",
    },
    {
      scene: "cs-varne-prices",
      text1:
        "An artist's prices often jump soon after the artist dies, and the reason is supply. While a painter is alive, collectors know that new works may appear at any time; once the painter dies, the number of works becomes fixed, and each grows scarcer as museums take paintings off the market. Critical reputation, by contrast, changes far too slowly to explain such sudden jumps.",
      text2:
        "The landscape painter Ellis Varne sold her work for modest sums throughout her forty-year career. In the two years after her death in 1998, auction prices for her paintings tripled. A dealer who handled her estate credits a museum retrospective of her work, held in 1999, with raising her profile among collectors.",
      puzzle: "why prices for Varne's paintings tripled soon after her death",
      principleAnchor: "the number of works becomes fixed",
      guessAnchor: "retrospective",
      detailAnchor: "modest sums",
      key: "Her death fixed the supply of her paintings, making each scarcer.",
      guess: "A 1999 museum retrospective raised her profile among collectors.",
      ruledOut: "Critics came to regard her work more highly after her death.",
      detail: "Her prices had been modest for so long that they were bound to rise.",
      why: "Text 1 attributes sudden price jumps after an artist's death to the supply of works becoming fixed, and Varne's prices jumped within two years of her death",
    },
    {
      scene: "cs-ossian-wheat",
      text1:
        "Snow is mostly trapped air, and air conducts heat poorly. A thick layer of snow therefore works like a blanket, holding in the warmth stored in the soil beneath it even when the air above falls far below freezing. It is this trapped air, not the moisture that snow adds when it melts, that protects plants buried beneath.",
      text2:
        "Farmers in the Ossian highlands plant winter wheat each autumn. They have noticed that the young wheat survives bitter cold in years with heavy snowfall but often dies in mild winters with little snow. Agronomist Nell Barros is unsure why; she wonders whether snowy winters bring fewer of the insects that feed on wheat.",
      puzzle: "why the Ossian wheat survives best in winters with heavy snow",
      principleAnchor: "trapped air",
      guessAnchor: "fewer of the insects",
      detailAnchor: "each autumn",
      key: "Deep snow traps air that holds the soil's warmth around the wheat.",
      guess: "Snowy winters bring fewer of the insects that feed on the wheat.",
      ruledOut: "Melting snow adds moisture to the soil that the young wheat needs to live.",
      detail: "Wheat planted in autumn has rooted deeply enough by winter to survive.",
      why: "Text 1 says a thick layer of snow traps air that holds in the soil's warmth, which would protect wheat buried under heavy snow",
    },
    {
      scene: "cs-ashcombe-market",
      text1:
        "In medieval villages, markets grew up wherever travelers passed, not wherever lords or priests would have liked them. Traders set up where roads converged or where a river could be crossed, because that was where buyers already were, and a market's site usually reveals the old routes through a place better than any map.",
      text2:
        "Archaeologists excavating the village of Ashcombe were surprised to find its medieval market square at the village's far edge, a quarter mile from the church and manor house. The dig also uncovered the foundations of a vanished stone bridge beside the square. One archaeologist proposes that the lord of the manor moved the market to keep its noise away from his house.",
      puzzle: "why Ashcombe's market square lies at the edge of the village",
      principleAnchor: "wherever travelers passed",
      guessAnchor: "keep its noise away",
      detailAnchor: "church and manor house",
      key: "Traders gathered by the old bridge, where travelers crossed the river.",
      guess: "The lord of the manor moved the market to keep its noise from his house.",
      ruledOut: "The village's priests chose a site far from the church for the market.",
      detail: "Ashcombe's church and manor left no room for a market in the center.",
      why: "Text 1 says markets grew up where travelers passed, such as river crossings, and a vanished bridge stood right beside Ashcombe's square",
    },
    {
      scene: "cs-belcourt-stage",
      text1:
        "Musicians play in time with one another largely by listening. Sound takes about a thirtieth of a second to cross ten meters of stage, so players seated far apart hear each other slightly late, and an ensemble spread too widely tends to drag or split. Rehearsal can reduce the problem, but no amount of practice removes the delay itself.",
      text2:
        "When the Belcourt Orchestra moved to a wide new stage last season, reviewers noticed that the strings and the brass, now seated much farther apart, sometimes fell out of step. Critics praised the new hall's elegant woodwork. The orchestra's manager blames an unfamiliar rehearsal schedule, which he says left the players underprepared.",
      puzzle: "why the Belcourt Orchestra's strings and brass sometimes fell out of step",
      principleAnchor: "hear each other slightly late",
      guessAnchor: "unfamiliar rehearsal schedule",
      detailAnchor: "elegant woodwork",
      key: "Seated farther apart, the players heard one another a moment late.",
      guess: "An unfamiliar rehearsal schedule left the players underprepared.",
      ruledOut: "Seated farther apart, the players could hear one another more clearly.",
      detail: "The new hall's elegant woodwork distracted the players during concerts.",
      why: "Text 1 says players seated far apart hear each other slightly late, and the strings and brass were now seated much farther apart",
    },
    {
      scene: "cs-northgate-polls",
      text1:
        "Whether people vote depends less on enthusiasm than on convenience. Every added step between a citizen and the ballot, such as a longer trip or an unfamiliar location, reduces turnout, and the effect is strongest among voters without cars. Bad weather, by contrast, moves turnout far less than is commonly supposed.",
      text2:
        "In the town of Marburn, turnout in the Northgate neighborhood fell sharply in 2022, while turnout in other neighborhoods held steady despite that day's heavy rain. That year Northgate's polling place moved from the local school to a hall across the river. A reporter for the town paper attributes the drop to Northgate voters' dissatisfaction with the candidates.",
      puzzle: "why turnout in Northgate fell sharply in 2022",
      principleAnchor: "Every added step",
      guessAnchor: "dissatisfaction",
      detailAnchor: "held steady",
      key: "The polling place's move across the river made voting harder.",
      guess: "Northgate's voters were dissatisfied with that year's candidates.",
      ruledOut: "Heavy rain on election day kept many Northgate voters at home.",
      detail: "Turnout in Marburn's other neighborhoods held steady that year.",
      why: "Text 1 says every added step between a voter and the ballot reduces turnout, and Northgate's polling place moved across the river that year",
    },
  ];

  const ctcApplyExplanation = {
    ...CTC_BASE,
    id: "cross-text-apply-explanation",
    subskill: "response between texts",
    difficulty: "Medium",
    title: "First text's principle explains the second text's unexplained observation",
    recognize:
      "Text 1 offers a general explanation; Text 2 reports a puzzle and someone's tentative guess. The author of Text 1 would explain the puzzle with Text 1's principle, not with the guess in Text 2.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["misattributed-view", "opposite-stance", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(CTC_APPLY_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: `Based on the texts, how would the author of Text 1 most likely explain ${topic.puzzle}?`,
        correct: topic.key,
        wrong: [
          [topic.guess, "This is the tentative explanation someone offers in Text 2; nothing in Text 1 points to it."],
          [topic.ruledOut, "This explanation runs against the principle in Text 1, so its author would reject it."],
          [topic.detail, "This rests on a detail from Text 2 that does not account for the observation, and the principle in Text 1 does not involve it."],
        ],
        explanation: `${topic.why}.`,
        steps: [
          "State the principle Text 1 proposes, including anything it rules out.",
          "Find the fact in Text 2 that the principle applies to.",
          "Choose the explanation that applies Text 1's principle, not the guess offered in Text 2.",
        ],
        principles: [
          "A question about how one author would explain something asks for that author's reasoning, not the explanation offered in the other text.",
        ],
        trap: "Choosing the tentative explanation offered in Text 2, which the author of Text 1 never gives.",
        hint: "Which fact in Text 2 does the idea in Text 1 account for?",
        estimatedSeconds: 75,
        verify: () => {
          const [one, two] = CTC_split(content);
          return one.includes(topic.principleAnchor) && !two.includes(topic.principleAnchor) &&
            two.includes(topic.guessAnchor) && !one.includes(topic.guessAnchor) &&
            two.includes(topic.detailAnchor) && topic.key !== topic.guess;
        },
      };
    },
  };

  /* ------------------------------------------------------------------ *
   * Text 2 accepts the observation in Text 1 but doubts the            *
   * explanation.                                                       *
   * ------------------------------------------------------------------ */

  // Each topic is one scene: a study in Text 1 and a second researcher in
  // Text 2 who accepts the observation but doubts the explanation because of
  // something the study did not rule out. The fields are written so every
  // sentence of every text is specific to its topic.
  const METHOD_CHALLENGE_TOPICS = [
    {
      scene: "cs-urban-birdsong",
      field: "ornithologist",
      claimant: "Lena Ortiz",
      critic: "Samuel Achebe",
      finding:
        "found that song sparrows in downtown parks sing at a higher pitch than sparrows in rural fields, and she concludes that the birds shift their songs upward so they can be heard over low-frequency traffic noise",
      evidence: "She recorded more than 400 songs across twelve sites over two breeding seasons.",
      concession: "does not dispute that city sparrows sing higher",
      alternative:
        "notes that downtown parks also have more small trees and buildings, and higher notes may simply travel better among hard, closely spaced surfaces, whether or not traffic is present",
      key: "The pattern Ortiz observed may reflect the physical layout of city parks rather than a response to traffic noise.",
      oneText: "Sparrows in downtown parks sing at a higher pitch than sparrows in rural fields.",
      opposite: "Ortiz's recordings do not show any real difference between city and rural songs.",
      broad: "Traffic noise has no effect on the behavior of any urban bird species.",
    },
    {
      scene: "cs-classroom-plants",
      field: "education researcher",
      claimant: "Dara Whitfield",
      critic: "Kenji Moreau",
      finding:
        "reports that students in classrooms with potted plants scored higher on end-of-term reading tests than students in classrooms without plants, and she argues that the plants improved students' concentration",
      evidence: "Her study compared forty classrooms in six schools.",
      concession: "accepts that the scores differed",
      alternative:
        "points out that teachers chose for themselves whether to bring plants into their rooms, and teachers who take that extra step may differ from their colleagues in other ways that affect reading",
      key: "The difference in scores may stem from how the teachers who chose plants run their classrooms rather than from the plants themselves.",
      oneText: "Classrooms with potted plants had higher end-of-term reading scores.",
      opposite: "Whitfield's study found no difference in reading scores between the two groups of classrooms.",
      broad: "Changes to a classroom's appearance never affect how well students learn.",
    },
    {
      scene: "cs-river-otters",
      field: "wildlife biologist",
      claimant: "Priya Castellanos",
      critic: "Tomas Lindqvist",
      finding:
        "documented that river otters returned to a restored stretch of the Harlan River within three years of a dam's removal, and she credits the dam's removal with bringing the otters back",
      evidence: "Camera traps along the restored stretch recorded otters on 60 percent of nights by the third year.",
      concession: "agrees that the otters are now common along the restored stretch",
      alternative:
        "observes that otter numbers rose during the same years along a neighboring river that still has its dam, which suggests that a regional change, such as cleaner water, may account for both increases",
      key: "The otters' return may have resulted from a change affecting the whole region rather than from the dam's removal.",
      oneText: "Otters now appear along the restored stretch on most nights.",
      opposite: "Otters have not actually returned to the restored stretch of the river.",
      broad: "Removing dams has no benefit for any river species.",
    },
    {
      scene: "cs-ancient-pottery",
      field: "archaeologist",
      claimant: "Miriam Adeyemi",
      critic: "Rafael Quint",
      finding:
        "found fragments of glazed pottery at a hilltop settlement that match pottery made in a coastal town two hundred miles away, and she concludes that the two communities traded directly with each other",
      evidence: "Chemical tests showed that the clay in both sets of fragments came from the same coastal deposit.",
      concession: "accepts that the pottery was made on the coast",
      alternative:
        "notes that goods in the region often passed through several intermediate markets, so the pots could have reached the hilltop through a chain of exchanges without any contact between the two towns",
      key: "The pottery could have reached the settlement indirectly, so it does not by itself show direct trade between the two communities.",
      oneText: "The hilltop pottery was made from clay found on the coast.",
      opposite: "The pottery at the hilltop settlement was produced locally.",
      broad: "Ancient communities in the region never traded with one another.",
    },
    {
      scene: "cs-night-shift-sleep",
      field: "sleep scientist",
      claimant: "Hannah Brooks-Diallo",
      critic: "Victor Salazar",
      finding:
        "reports that nurses who switched from rotating shifts to fixed night shifts slept an hour longer on average, and she argues that a predictable schedule lets the body's internal clock adjust",
      evidence: "Participants wore sleep monitors for a month before and a month after the switch.",
      concession: "does not question the added hour of sleep",
      alternative:
        "points out that the nurses who switched had asked to do so, and people who request night work may already find it easier to sleep during the day than those who do not",
      key: "The longer sleep may reflect the kind of nurses who chose fixed night shifts rather than the effect of the schedule itself.",
      oneText: "Nurses on fixed night shifts slept about an hour longer.",
      opposite: "The nurses slept less after switching to fixed night shifts.",
      broad: "Work schedules have no influence on how long people sleep.",
    },
    {
      scene: "cs-coral-bleaching",
      field: "marine ecologist",
      claimant: "Ana Kealoha",
      critic: "Martin Osei",
      finding:
        "found that corals near a reef's shaded underwater cliffs bleached less during a heat wave than corals on the open reef flat, and she attributes the difference to the shade reducing the corals' exposure to sunlight",
      evidence: "She surveyed 1,200 coral colonies before, during, and after the heat wave.",
      concession: "accepts that the cliff corals bleached less",
      alternative:
        "notes that cooler water rising from deeper areas collects along the cliffs, so the corals there may have experienced lower temperatures as well as less light",
      key: "The corals near the cliffs may have been protected by cooler water as well as by shade, so shade alone may not explain the difference.",
      oneText: "Corals near the shaded cliffs bleached less than corals on the reef flat.",
      opposite: "The corals near the cliffs bleached more severely than those on the reef flat.",
      broad: "Sunlight plays no part in coral bleaching anywhere.",
    },
    {
      scene: "cs-museum-labels",
      field: "museum studies researcher",
      claimant: "Grace Nakamura",
      critic: "Elias Varga",
      finding:
        "reports that visitors spent twice as long at paintings after a museum replaced its brief labels with longer ones describing each artist's life, and she concludes that biographical information draws visitors into artworks",
      evidence: "Staff timed about 3,000 visitors in the gallery before and after the change.",
      concession: "does not dispute that visitors lingered longer",
      alternative:
        "points out that the museum rearranged the gallery and added benches during the same month the labels changed, so visitors may have stayed longer simply because the room became more comfortable",
      key: "Changes made to the gallery at the same time could account for the longer visits, so the labels may not be responsible.",
      oneText: "Visitors spent more time at the paintings after the new labels appeared.",
      opposite: "Visitors spent less time in the gallery after the labels were changed.",
      broad: "Information about artists never affects how people view art.",
    },
    {
      scene: "cs-rooftop-gardens",
      field: "urban planner",
      claimant: "Omar Haddad",
      critic: "Lucia Ferrante",
      finding:
        "found that buildings with rooftop gardens used 15 percent less electricity for summer cooling than similar buildings without them, and he argues that the gardens insulate the roofs",
      evidence: "He compared utility records for 80 office buildings over three summers.",
      concession: "accepts the difference in cooling costs",
      alternative:
        "observes that owners who install rooftop gardens often upgrade windows and air conditioners at the same time, and those upgrades alone could lower cooling costs",
      key: "Other energy upgrades made alongside the gardens could explain the lower cooling costs.",
      oneText: "Buildings with rooftop gardens used less electricity for summer cooling.",
      opposite: "Buildings with rooftop gardens used more electricity for cooling than other buildings.",
      broad: "Rooftop gardens provide no benefits to cities.",
    },
    {
      scene: "cs-language-apps",
      field: "linguist",
      claimant: "Beatriz Ramos",
      critic: "Daniel Okafor",
      finding:
        "reports that adults who practiced Spanish with a phone app for ten minutes a day scored higher on a vocabulary test after six months than adults who did not use the app, and she credits the app's daily reminders",
      evidence: "The study followed 500 adult learners in three cities.",
      concession: "accepts that the app users scored higher",
      alternative:
        "notes that the app users were volunteers who downloaded it on their own, and adults motivated enough to do so might also have studied more in other ways, such as reading or watching films in Spanish",
      key: "The app users' higher scores may reflect their greater motivation to learn rather than the app's reminders.",
      oneText: "Adults who used the app scored higher on the vocabulary test.",
      opposite: "The adults who used the app learned fewer words than those who did not.",
      broad: "Technology cannot help anyone learn a language.",
    },
    {
      scene: "cs-glacier-lichen",
      field: "botanist",
      claimant: "Ingrid Solberg",
      critic: "Arjun Mehta",
      finding:
        "found that lichens grow faster on rocks recently exposed by a retreating glacier than on rocks exposed long ago, and she proposes that the freshly exposed rock releases minerals that lichens use",
      evidence: "She measured lichen patches on 90 boulders at known distances from the ice.",
      concession: "accepts that the lichens near the ice grow faster",
      alternative:
        "points out that rocks near the glacier are also wetter from meltwater for much of the summer, and moisture is known to speed lichen growth",
      key: "The faster growth may be due to extra moisture near the glacier rather than to minerals released by the rock.",
      oneText: "Lichens grow faster on rocks near the retreating glacier.",
      opposite: "Lichens grow more slowly on newly exposed rocks than on older ones.",
      broad: "Minerals in rock have no effect on any plant or lichen.",
    },
  ];

  const lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);

  const methodChallenge = {
    id: "cross-text-method-challenge",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Cross-Text Connections",
    subskill: "response between texts",
    difficulty: "Hard",
    title: "Second text accepts the finding but challenges its explanation",
    recognize:
      "Text 2 agrees with what Text 1 observed but offers another explanation for it; the answer names that alternative, not a rejection of the observation.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 2, trap: 1 },
    tricks: ["one-text-only", "opposite-stance", "too-broad"],
    build(t) {
      const topic = t.pick(METHOD_CHALLENGE_TOPICS);
      const [firstName] = topic.claimant.split(" ");
      const claimantSurname = topic.claimant.split(" ").slice(-1)[0];
      const passage =
        `Text 1\n${firstName === topic.claimant ? topic.claimant : `The ${topic.field} ${topic.claimant}`} ${topic.finding}. ${topic.evidence}\n\n` +
        `Text 2\n${topic.critic} ${topic.concession}. However, ${topic.critic.split(" ").slice(-1)[0]} ${topic.alternative}.`;
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content: passage },
        stem: `Based on the texts, how would ${topic.critic} (Text 2) most likely respond to ${claimantSurname}'s conclusion in Text 1?`,
        correct: `By suggesting that ${lower(topic.key)}`,
        wrong: [
          [`By agreeing that ${lower(topic.oneText).slice(0, -1)}, which shows that ${claimantSurname}'s explanation is correct.`,
            "Text 2 accepts the observation but not the explanation; this choice treats agreement about the data as agreement about the cause."],
          [`By arguing that ${lower(topic.opposite).slice(0, -1)}, so there is no pattern for ${claimantSurname} to explain.`,
            "Text 2 explicitly accepts the observation, so it would not deny that the pattern exists."],
          [`By claiming that ${lower(topic.broad).slice(0, -1)}, whatever ${claimantSurname}'s study appears to show.`,
            "Text 2 questions one explanation for one study; this sweeping claim goes far beyond anything it says."],
        ],
        explanation:
          `${topic.critic} accepts the observation in Text 1 but proposes a different cause for it, so the most likely response is that ${topic.key.charAt(0).toLowerCase()}${topic.key.slice(1)}`,
        steps: [
          "State what Text 1 observed and how it explains the observation.",
          "Find what Text 2 concedes, then what it questions.",
          "Choose the response that keeps the concession and names the alternative explanation.",
        ],
        principles: [
          "A second author can accept a finding while rejecting the explanation offered for it.",
          "A cross-text answer must be consistent with everything the second author says.",
        ],
        trap: "Choosing the choice that repeats the shared observation, as if agreeing about the data meant agreeing about the cause.",
        hint: "Separate what Text 2 accepts from what it questions.",
        verify: () => METHOD_CHALLENGE_TOPICS.includes(topic) && passage.includes(topic.alternative),
      };
    },
  };

  /* ------------------------------------------------------------------ *
   * 6. Texts share several points and differ on one precise point.     *
   * ------------------------------------------------------------------ */
  const CTC_DIFFERENCE_TOPICS = [
    {
      scene: "cs-karro-antelope",
      subject: "the disappearance of the Karro antelope",
      text1:
        "The Karro antelope vanished from the Tessel plain by 1900. Hunting certainly increased after the railway arrived in 1870, but hunters were not the decisive factor. Over the same decades, settlers plowed nearly all of the plain's native grassland, destroying the grasses the antelope depended on. Plowing doomed the herds; hunting merely hastened a decline that was already under way.",
      text2:
        "Between 1872 and 1885, hunters shipped more than 40,000 Karro hides east by rail. Plowing did shrink the antelope's range, but it did not leave the animals without a home: the rocky western third of the Tessel plain was never plowed and could have sustained the herds. What destroyed the Karro was hunters killing them faster than they could breed.",
      anchor1: "Plowing doomed the herds",
      anchor2: "What destroyed the Karro was hunters",
      sharedAnchor1: "settlers plowed",
      sharedAnchor2: "Plowing did shrink",
      oneAnchor: "western",
      view1: "sees plowing as the main cause",
      view2: "sees hunting as the main cause",
      sharedA: "says plowing shrank the herds' range",
      sharedB: "denies that it did",
      oneA: "calls the western plain unfit for the herds",
      oneB: "calls it a possible refuge",
      why: "Text 1 says plowing doomed the herds and hunting only hastened the decline, while Text 2, though it grants that plowing shrank their range, says hunters destroyed the Karro",
    },
    {
      scene: "cs-norvale-home",
      subject: "the reasons young adults in Norvale now leave home later",
      text1:
        "In Norvale, the average age at which young adults move out of their parents' homes rose from 22 to 27 between 1990 and 2020. More young people attend university than before, but that is not the main story. Rents over the same period doubled relative to wages, and young adults simply cannot afford to live on their own until later.",
      text2:
        "Norvale rents have indeed climbed steeply since 1990. Yet young adults who remain in school into their late twenties tend to live with their parents whatever rents they face, and the share of Norvale's 25-year-olds still in school has tripled since 1990. Longer schooling, not rent, explains most of the delay in leaving home.",
      anchor1: "cannot afford to live on their own",
      anchor2: "Longer schooling, not rent",
      sharedAnchor1: "Rents over the same period doubled",
      sharedAnchor2: "rents have indeed climbed steeply",
      oneAnchor: "wages",
      view1: "blames rising rents above all",
      view2: "blames longer schooling above all",
      sharedA: "says Norvale rents have climbed",
      sharedB: "doubts that rents have climbed much",
      oneA: "says wages have lagged behind rents",
      oneB: "says wages have kept pace",
      why: "Text 1 grants that more young people attend university but blames rent above all, while Text 2 grants that rents have climbed but says longer schooling explains most of the delay",
    },
    {
      scene: "cs-harwell-reading-room",
      subject: "the Harwell Library's glass reading room",
      text1:
        "When the Harwell Library opened its glass-walled reading room in 2015, visits doubled within a year. The room floods with daylight, and its clear walls invite passersby to look in and then to come inside. By drawing so many people to its books, the reading room has become the most successful public building in the city.",
      text2:
        "No one disputes that the Harwell's reading room is bright or that it is busy; visits have doubled since it opened. But sunlight streaming through the glass has faded the spines of books near the windows, and staff have had to move rare volumes to the basement. A library that cannot safely display its books has failed at its central task, however popular it has become.",
      anchor1: "most successful public building",
      anchor2: "has failed at its central task",
      sharedAnchor1: "visits doubled within a year",
      sharedAnchor2: "visits have doubled since it opened",
      oneAnchor: "passersby",
      view1: "judges the room by the crowds it draws",
      view2: "judges the room by its care for books",
      sharedA: "reports that visits to the room doubled",
      sharedB: "suggests that visits have fallen",
      oneA: "values the way the room lets passersby look in",
      oneB: "objects to letting passersby look in",
      why: "Text 1 calls the room a success because it draws so many people, while Text 2 accepts that it is busy but judges it a failure because it cannot protect the books",
    },
    {
      scene: "cs-dunmere-pamphlet",
      subject: "the pamphlet The Weaver's Complaint",
      text1:
        "In the winter of 1831, the pamphlet The Weaver's Complaint was read aloud in nearly every tavern in the mill town of Dunmere. By spring the town's weavers had risen against a new round of wage cuts. Carried from tavern to tavern, the pamphlet turned scattered resentment into a shared cause, and it was this that sparked the uprising.",
      text2:
        "Tavern keepers' accounts from Dunmere mention The Weaver's Complaint again and again; clearly it was widely read that winter. Yet the weavers had petitioned the mill owners against wage cuts for three years before it appeared, and the pamphlet borrows much of its language from those petitions. It gave voice to an anger that already existed; it did not create it.",
      anchor1: "sparked the uprising",
      anchor2: "gave voice to an anger that already existed",
      sharedAnchor1: "read aloud in nearly every tavern",
      sharedAnchor2: "clearly it was widely read",
      oneAnchor: "petition",
      view1: "treats the pamphlet as the spark of the uprising",
      view2: "treats the pamphlet as a voice for older anger",
      sharedA: "says the pamphlet was read in nearly every tavern",
      sharedB: "doubts that many weavers ever heard it read",
      oneA: "dismisses the weavers' earlier petitions as unimportant",
      oneB: "treats those petitions as significant",
      why: "Text 1 says the pamphlet sparked the uprising, while Text 2 grants that it was widely read but says it only voiced an anger the weavers' earlier petitions show already existed",
    },
    {
      scene: "cs-brenna-wolves",
      subject: "the return of wolves to the Brenna Valley",
      text1:
        "Since wolves returned to the Brenna Valley in 2008, the elk herd has shrunk by a third, and streamside willows, no longer stripped by grazing elk, have grown back. The recovering willows shade the streams, cooling the water for trout, and shelter songbirds that had nearly disappeared. The wolves' return has been a gift to the valley.",
      text2:
        "Few dispute that the Brenna elk herd is smaller since the wolves came back or that willows are recovering along the streams. But valley ranchers lost more than two hundred calves to wolves last year, and several family ranches have closed. Whatever the benefits to willows and trout, the wolves have cost the valley more than they have given it.",
      anchor1: "a gift to the valley",
      anchor2: "cost the valley more than they have given it",
      sharedAnchor1: "have grown back",
      sharedAnchor2: "willows are recovering",
      oneAnchor: "songbirds",
      view1: "judges the wolves a benefit to the valley overall",
      view2: "judges the wolves a burden on the valley overall",
      sharedA: "reports that the streamside willows are recovering",
      sharedB: "denies that the willows are recovering at all",
      oneA: "says songbirds are returning to the streamside willows",
      oneB: "says songbirds have stayed away from them",
      why: "Text 1 calls the wolves' return a gift to the valley, while Text 2 grants the ecological changes but concludes that the wolves have cost the valley more than they have given",
    },
    {
      scene: "cs-vireaux-brushwork",
      subject: "the rough brushwork in Agathe Vireaux's late paintings",
      text1:
        "In her last decade, the painter Agathe Vireaux abandoned the smooth finish of her early portraits for thick, visible strokes. Her eyesight was failing in those years, but the change was no mere accommodation. Vireaux's letters from the period praise painters who “let the hand show,” and the rough surfaces were a deliberate artistic choice.",
      text2:
        "Vireaux's late canvases are unmistakably rougher than her early ones, and her eyesight did decline sharply after 1920. The broad strokes are best understood as her way of working around that loss: unable to see fine detail, she built her images from large patches of color she could still judge. The rough surfaces were an adaptation, not a program.",
      anchor1: "deliberate artistic choice",
      anchor2: "an adaptation, not a program",
      sharedAnchor1: "eyesight was failing",
      sharedAnchor2: "eyesight did decline",
      oneAnchor: "letters",
      view1: "sees the rough strokes as an artistic choice",
      view2: "sees the rough strokes as a way around poor sight",
      sharedA: "acknowledges that Vireaux's eyesight declined",
      sharedB: "questions whether her eyesight really declined",
      oneA: "takes Vireaux's letters as evidence of her aims",
      oneB: "finds those letters an unreliable guide",
      why: "Text 1 grants that Vireaux's eyesight was failing but calls the rough surfaces a deliberate choice, while Text 2 calls them an adaptation to that failing sight",
    },
    {
      scene: "cs-ferris-texting",
      subject: "the effect of text messaging on the spelling of Ferris students",
      text1:
        "A survey of 600 students in the Ferris school district found that heavy texters use abbreviations such as “gr8” and “l8r” constantly in their messages. The habit is eroding their spelling: teachers across the district report more misspelled words in formal essays than they saw a decade ago.",
      text2:
        "Heavy texters in the Ferris district do abbreviate constantly, as the district's survey found. But when the same students took a formal spelling test, heavy texters scored as well as students who rarely text. Students, it appears, switch easily between the shorthand of their messages and the standard spelling expected in school.",
      anchor1: "The habit is eroding their spelling",
      anchor2: "switch easily",
      sharedAnchor1: "constantly in their messages",
      sharedAnchor2: "do abbreviate constantly",
      oneAnchor: "teachers",
      view1: "thinks texting harms the students' spelling",
      view2: "thinks texting leaves their spelling unharmed",
      sharedA: "reports that the students abbreviate often",
      sharedB: "finds that they rarely use abbreviations",
      oneA: "relies on teachers' reports of essay errors",
      oneB: "dismisses those reports as exaggerated",
      why: "Text 1 says the texting habit is eroding students' spelling, while Text 2 accepts that they abbreviate constantly but finds their formal spelling unharmed",
    },
    {
      scene: "cs-sessel-comet",
      subject: "the water vapor detected at the comet Sessel",
      text1:
        "In 2031 the Ardent probe detected water vapor streaming from the comet Sessel. The finding shows that Sessel holds a large reservoir of ice deep inside, which the Sun's heat is only now beginning to release. Future missions to Sessel should be designed to drill beneath its surface.",
      text2:
        "Ardent's detection of water vapor at Sessel is not in doubt. However, the vapor came only from the comet's sunlit side and faded within weeks, a pattern that fits a thin layer of frost on the surface far better than a deep reservoir. Sessel's interior may well be as dry as rock.",
      anchor1: "large reservoir of ice deep inside",
      anchor2: "thin layer of frost",
      sharedAnchor1: "detected water vapor",
      sharedAnchor2: "detection of water vapor at Sessel is not in doubt",
      oneAnchor: "faded",
      view1: "takes the vapor as a sign of deep interior ice",
      view2: "takes the vapor as a sign of thin surface frost",
      sharedA: "accepts that the Ardent probe detected water vapor",
      sharedB: "doubts that any vapor was really detected",
      oneA: "dismisses the vapor's quick fading as unimportant",
      oneB: "treats that fading as highly revealing",
      why: "Text 1 takes the vapor as proof of a deep ice reservoir, while Text 2 accepts the detection but reads it as a sign of only a thin surface frost",
    },
    {
      scene: "cs-glenmoor-bypass",
      subject: "the closing of shops in downtown Glenmoor",
      text1:
        "Since the Route 9 bypass opened in 2016, traffic through downtown Glenmoor has fallen by half, and eleven shops on Main Street have closed. Those shops depended on drivers who once passed through town and stopped on impulse. By diverting those drivers, the bypass has emptied Glenmoor's downtown.",
      text2:
        "Downtown Glenmoor is certainly quieter than it was before the bypass opened, and several of its shops have closed. Yet similar shops closed at the same rate in nearby towns that have no bypass, as residents everywhere shifted their spending to online stores. The bypass did little to cause Glenmoor's closures; online shopping did.",
      anchor1: "the bypass has emptied Glenmoor's downtown",
      anchor2: "online shopping did",
      sharedAnchor1: "traffic through downtown Glenmoor has fallen",
      sharedAnchor2: "certainly quieter",
      oneAnchor: "nearby towns",
      view1: "blames the closures chiefly on the bypass",
      view2: "blames the closures chiefly on online shopping",
      sharedA: "reports that downtown traffic has dropped",
      sharedB: "claims that downtown traffic has held steady",
      oneA: "dismisses closures in nearby towns as irrelevant",
      oneB: "treats those closures as telling evidence",
      why: "Text 1 blames the bypass for emptying downtown, while Text 2 grants that downtown is quieter but blames online shopping for the closures",
    },
    {
      scene: "cs-drowning-stranger",
      subject: "the lesson of the drowning-stranger case",
      text1:
        "Imagine walking past a pond in which a stranger is drowning. Nearly everyone agrees that you must wade in, even if doing so ruins your shoes. The case shows that we have a duty to help any stranger in serious need whenever the cost to us is small, whether that stranger is at our feet or on the other side of the world.",
      text2:
        "Almost everyone does judge that the passerby must wade into the pond. But the case shows something narrower than it seems to: a duty to rescue someone whose need is directly in front of us. A stranger far away, whose suffering we merely read about, does not make the same claim on us, however small the cost of helping.",
      anchor1: "on the other side of the world",
      anchor2: "something narrower than it seems",
      sharedAnchor1: "Nearly everyone agrees that you must wade in",
      sharedAnchor2: "Almost everyone does judge",
      oneAnchor: "shoes",
      view1: "infers a duty to help strangers near and far",
      view2: "infers a duty to help only strangers nearby",
      sharedA: "says that nearly everyone would wade in",
      sharedB: "doubts that most people would do so",
      oneA: "treats the ruined shoes as a trivial cost",
      oneB: "treats the ruined shoes as a real sacrifice",
      why: "Text 1 draws from the case a duty to help strangers wherever they are, while Text 2 accepts the common judgment but limits the duty to someone directly in front of us",
    },
  ];

  const ctcDifferenceInView = {
    ...CTC_BASE,
    id: "cross-text-difference-in-view",
    subskill: "agreement",
    difficulty: "Hard",
    title: "Texts that share several points and differ on one",
    recognize:
      "Both texts accept the same facts, and Text 2 concedes some of Text 1's points before disagreeing. The difference is the single point each answers differently, attributed to the right text.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 2, trap: 1 },
    tricks: ["misattributed-view", "opposite-stance", "one-text-only"],
    build(t) {
      const topic = t.pick(CTC_DIFFERENCE_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      const key = `Text 1 ${topic.view1}, whereas Text 2 ${topic.view2}.`;
      const swapped = `Text 1 ${topic.view2}, whereas Text 2 ${topic.view1}.`;
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: `Which choice best describes a difference in how the authors of Text 1 and Text 2 view ${topic.subject}?`,
        correct: key,
        wrong: [
          [swapped, "This names the real disagreement but assigns each position to the wrong text."],
          [`Text 1 ${topic.sharedA}, whereas Text 2 ${topic.sharedB}.`,
            "Text 2 explicitly concedes this point before stating its own view, so the texts agree about it."],
          [`Text 1 ${topic.oneA}, whereas Text 2 ${topic.oneB}.`,
            "Only one of the texts discusses this at all, so there is no stated difference between the authors on it."],
        ],
        explanation: `${topic.why}.`,
        steps: [
          "List the points both texts accept, including anything Text 2 concedes.",
          "Find the one point on which the texts take different positions.",
          "Check which text holds which position before choosing.",
        ],
        principles: [
          "A difference between two texts must be a point both address and answer differently; a concession marks agreement, not difference.",
        ],
        trap: "Choosing the right contrast with the two positions reversed, or treating a point that Text 2 concedes as a disagreement.",
        hint: "Note what Text 2 grants before it states its own view.",
        estimatedSeconds: 95,
        verify: () => {
          const [one, two] = CTC_split(content);
          const sorted = (text) => text.replace(/[.,]/g, "").split(/\s+/).sort().join(" ");
          return one.includes(topic.anchor1) && !two.includes(topic.anchor1) &&
            two.includes(topic.anchor2) && !one.includes(topic.anchor2) &&
            one.includes(topic.sharedAnchor1) && two.includes(topic.sharedAnchor2) &&
            one.includes(topic.oneAnchor) !== two.includes(topic.oneAnchor) &&
            key !== swapped && sorted(key) === sorted(swapped);
        },
      };
    },
  };

  /* ------------------------------------------------------------------ *
   * 7. Opposed texts that share a premise one states and the other     *
   *    takes for granted.                                              *
   * ------------------------------------------------------------------ */
  const CTC_COMMON_TOPICS = [
    {
      scene: "cs-aldon-bridge",
      text1:
        "The Aldon Street Bridge should be repaired, not replaced. Inspectors found its steel frame sound; only the concrete deck is crumbling, though it cannot be left as it is much longer. A new deck would cost $4 million, a third of the price of a new bridge, and would preserve a landmark that has carried traffic over the Tane River since 1911.",
      text2:
        "Repairing the Aldon Street Bridge would be a false economy. Its two narrow lanes cannot carry the buses the city plans to route across the river, so a repaired bridge would have to be replaced within a decade anyway. The crumbling deck forces the city's hand now; better to spend the money once, on a bridge built for the city's future.",
      premise1: "cannot be left as it is",
      premise2: "forces the city's hand now",
      thesis1Anchor: "a third of the price",
      thesis2Anchor: "buses",
      key: "The bridge's current condition calls for prompt action by the city.",
      thesis1: "Repairing the bridge would cost far less than building a new one.",
      thesis2: "The bridge is too narrow for the buses the city plans to run.",
      broad: "Bridges built before 1920 should generally be replaced, not repaired.",
      why: "Text 1 says the crumbling deck cannot be left as it is much longer, and Text 2 says the crumbling deck forces the city's hand now; they disagree only about whether to repair or replace",
    },
    {
      scene: "cs-veltan-frog",
      text1:
        "Zoos should expand their breeding programs for the Veltan tree frog. The frog's cloud forest is being cleared so quickly that the species could vanish from the wild within twenty years, and a healthy captive population is the only insurance against losing it entirely.",
      text2:
        "Money spent breeding Veltan tree frogs in zoos would do far more good protecting the cloud forest they come from. Captive frogs are of little use if, when the time comes to release them, no forest remains to receive them. Only protecting that habitat can keep the species alive in the wild.",
      premise1: "being cleared so quickly",
      premise2: "no forest remains to receive them",
      thesis1Anchor: "only insurance",
      thesis2Anchor: "far more good",
      key: "The Veltan tree frog's forest home is at serious risk of disappearing.",
      thesis1: "A captive population is the best protection for the Veltan tree frog.",
      thesis2: "Protecting the frog's forest does more good than breeding it in zoos.",
      broad: "Every endangered frog species should be bred in zoos as a safeguard.",
      why: "Text 1 says the frog's forest is being cleared so quickly the species could vanish, and Text 2's argument assumes the danger that no forest will remain; they disagree only about the remedy",
    },
    {
      scene: "cs-alderan-spelling",
      text1:
        "The printers of sixteenth-century Aldera did more than anyone to fix the spelling of the Alderan language. Before printing, each scribe spelled as he pleased. Printers, needing consistent type and wanting their books to sell across regions, settled on single spellings, and readers soon came to expect them.",
      text2:
        "Credit for standardizing Alderan spelling belongs to the schoolmasters of the 1600s, not to printers. Printed books from the 1500s still spell the same word three or four ways, sometimes on a single page. Only when schools began drilling pupils from a common spelling book did the variation fade.",
      premise1: "each scribe spelled as he pleased",
      premise2: "did the variation fade",
      thesis1Anchor: "Printers, needing consistent type",
      thesis2Anchor: "schoolmasters",
      key: "Alderan spelling varied widely before it eventually became standardized.",
      thesis1: "Printers were chiefly responsible for standardizing Alderan spelling.",
      thesis2: "Schoolmasters were chiefly responsible for standardizing Alderan spelling.",
      broad: "Spelling becomes standard in any language soon after printing arrives.",
      why: "Text 1 says scribes once spelled as they pleased and spelling was later fixed, and Text 2 says the variation eventually faded; they disagree only about who deserves the credit",
    },
    {
      scene: "cs-corran-museum",
      text1:
        "The Corran City Museum should drop its $15 admission fee. When the nearby Hartwell Museum went free, its visitors quickly grew more varied, with far more families from the city's low-income neighborhoods. A public museum exists to serve the whole public, and a fee keeps out exactly the residents who most need it.",
      text2:
        "Making the Corran City Museum free would backfire. Admission fees supply a third of its budget, and without them the museum would have to cut the school programs that bring thousands of students from low-income neighborhoods through its doors each year. Those visits are the museum's most valuable work.",
      premise1: "keeps out exactly the residents who most need it",
      premise2: "Those visits are the museum's most valuable work",
      thesis1Anchor: "Hartwell Museum",
      thesis2Anchor: "a third of its budget",
      key: "Serving low-income residents is central to the museum's purpose.",
      thesis1: "Ending the admission fee would bring the museum more varied visitors.",
      thesis2: "Admission fees are needed to pay for the museum's school programs.",
      broad: "All public museums should be free for every visitor to enter.",
      why: "Text 1 objects to the fee because it keeps out low-income residents, and Text 2 defends the fee because it funds the museum's most valuable work, visits by low-income students",
    },
    {
      scene: "cs-holt-poems",
      text1:
        "Editors of Edda Holt's poems should print the versions that appeared in her first books. Holt revised obsessively in old age, rewriting nearly every early poem, and the later versions, flattened by caution, lose the reckless energy that made her famous.",
      text2:
        "Any edition of Edda Holt must follow her final revisions. Readers may prefer the wilder early versions, but the revised poems are the ones Holt chose, and an editor's duty is to present a poet's work as the poet last wished it to be read.",
      premise1: "rewriting nearly every early poem",
      premise2: "Readers may prefer the wilder early versions",
      thesis1Anchor: "flattened by caution",
      thesis2Anchor: "an editor's duty",
      key: "Holt's revisions changed her early poems in noticeable ways.",
      thesis1: "The early versions of Holt's poems are stronger than her revisions.",
      thesis2: "An editor should present Holt's poems as she last wished them read.",
      broad: "Poets' late revisions usually weaken the poems they rework.",
      why: "Text 1 says Holt rewrote nearly every early poem, and Text 2 contrasts the wilder early versions with the revised ones; they disagree only about which versions an edition should print",
    },
    {
      scene: "cs-veira-telescope",
      text1:
        "The Veira telescope should be built on Mount Kesh. At 4,200 meters, Kesh rises above most of the water vapor in the atmosphere, and water vapor absorbs much of the infrared light that Veira is designed to detect. No other candidate site is as high.",
      text2:
        "Mount Kesh's altitude is tempting, but the Veira telescope belongs on the Hollen Plateau. Kesh is wrapped in cloud one night in three, while the plateau, though lower and somewhat moister, has clear skies on nine nights of ten. A telescope that cannot see the sky collects nothing at all.",
      premise1: "water vapor absorbs much of the infrared light",
      premise2: "though lower and somewhat moister",
      thesis1Anchor: "No other candidate site is as high",
      thesis2Anchor: "Hollen Plateau",
      key: "Humid air is a disadvantage for the telescope's observations.",
      thesis1: "Mount Kesh's height makes it the best site for the telescope.",
      thesis2: "The plateau's clear skies make it the best site for the telescope.",
      broad: "Every telescope should be built at the highest site available.",
      why: "Text 1 says water vapor absorbs the light Veira must detect, and Text 2 concedes the plateau is moister as a drawback it outweighs; they disagree only about which site is better",
    },
    {
      scene: "cs-saint-orla-chapel",
      text1:
        "The ruined chapel at Saint Orla should be rebuilt as it stood in 1400. Surviving drawings record its every arch and window, so a faithful reconstruction is possible, and visitors would at last understand the building its makers intended rather than guessing at it from broken walls.",
      text2:
        "Rebuilding Saint Orla's chapel would erase six centuries of its history. The roofless nave and ivy-covered walls record the chapel's long decline as surely as the old plans record its founding, and visitors deserve to see that whole history, not a replica of a single moment.",
      premise1: "visitors would at last understand",
      premise2: "visitors deserve to see that whole history",
      thesis1Anchor: "rebuilt as it stood in 1400",
      thesis2Anchor: "erase six centuries",
      key: "The chapel's treatment should help visitors grasp its history.",
      thesis1: "The chapel should be rebuilt to look as it did in the year 1400.",
      thesis2: "The ruined chapel should be left as it now stands, ivy and all.",
      broad: "Old buildings should never be altered from their present state.",
      why: "Text 1 argues for rebuilding so visitors can understand the chapel's original form, and Text 2 argues against it so visitors can see its whole history; both judge the options by what visitors will learn of the past",
    },
    {
      scene: "cs-tolland-soda",
      text1:
        "Tolland should tax sugary drinks. Residents' consumption of such drinks has doubled in a decade, with predictable harm to their teeth and health, and when the nearby city of Lowmoor adopted a similar tax, purchases fell by a quarter within a year.",
      text2:
        "A tax on sugary drinks would fall hardest on Tolland's poorest residents, who spend a larger share of their income on groceries. The better way to cut how much sugary soda residents drink is to install free water fountains in the town's schools, parks, and playing fields.",
      premise1: "with predictable harm to their teeth and health",
      premise2: "The better way to cut how much sugary soda residents drink",
      thesis1Anchor: "Lowmoor",
      thesis2Anchor: "water fountains",
      key: "Tolland residents would benefit from drinking less sugary soda.",
      thesis1: "A tax would sharply reduce Tolland residents' purchases of soda.",
      thesis2: "Free water fountains would cut soda drinking more fairly than a tax.",
      broad: "Taxes on food and drink always burden poorer residents the most.",
      why: "Text 1 says residents' rising consumption is harming their health, and Text 2 proposes a better way to cut consumption, which assumes cutting it is worthwhile; they disagree only about the means",
    },
    {
      scene: "cs-tarsan-founders",
      text1:
        "Historians of the Tarsan Republic's founding should rely on its leaders' private letters. The public speeches of 1791 were crafted for effect, hiding every doubt and rivalry; in letters to friends, the founders admitted the fears and quarrels their speeches concealed.",
      text2:
        "The founders' letters are a trap for historians. Written to allies and patrons, they were often meant to be copied and shown around, and so they are as calculated as any speech. The Republic's tax records and court files, never meant for display, reveal far more about how it actually worked.",
      premise1: "speeches of 1791 were crafted for effect",
      premise2: "as calculated as any speech",
      thesis1Anchor: "rely on its leaders' private letters",
      thesis2Anchor: "tax records",
      key: "The founders' public speeches were not a candid record of their views.",
      thesis1: "The founders' private letters reveal doubts their speeches concealed.",
      thesis2: "Tax records and court files are the best sources on the young Republic.",
      broad: "No written source from the Republic's founding can be trusted.",
      why: "Text 1 says the speeches were crafted for effect, and Text 2 dismisses the letters as being as calculated as any speech, which takes for granted that the speeches were calculated",
    },
    {
      scene: "cs-harlen-finch",
      text1:
        "Backyard feeders help the Harlen finch survive the winter. Banding studies show that finches with access to feeders lose less weight in January and are far more likely to be alive in spring than finches that must forage on their own.",
      text2:
        "Backyard feeders do the Harlen finch more harm than good. Finches crowding at a feeder pass infections to one another, and in the winter of 2019 an eye disease spread through feeder flocks and killed thousands of the birds across the region.",
      premise1: "far more likely to be alive in spring",
      premise2: "killed thousands of the birds",
      thesis1Anchor: "lose less weight",
      thesis2Anchor: "infections",
      key: "Feeders influence how many Harlen finches survive winter.",
      thesis1: "Feeders help Harlen finches keep their weight up through winter.",
      thesis2: "Crowding at feeders spreads deadly disease among Harlen finches.",
      broad: "People should stop putting out food for all wild birds in winter.",
      why: "Text 1 says feeders make finches more likely to survive the winter, and Text 2 says feeders led to thousands of deaths; they disagree about the direction of the effect, not about whether feeders affect survival",
    },
  ];

  const ctcCommonGround = {
    ...CTC_BASE,
    id: "cross-text-common-ground",
    subskill: "agreement",
    difficulty: "Hard",
    title: "Opposed texts that share an underlying premise",
    recognize:
      "The texts disagree about what should be done or what is true, but both argue from a shared premise that one states and the other takes for granted. The answer is that premise, not either thesis.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 2, trap: 1 },
    tricks: ["one-text-only", "extreme-language", "too-broad"],
    build(t) {
      const topic = t.pick(CTC_COMMON_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: "Based on the texts, both authors would most likely agree with which statement?",
        correct: topic.key,
        wrong: [
          [topic.thesis1, "This is the position Text 1 argues for; the author of Text 2 argues against it."],
          [topic.thesis2, "This is the position Text 2 argues for; the author of Text 1 would reject it."],
          [topic.broad, "Both texts argue about one particular case; neither makes this sweeping general claim."],
        ],
        explanation: `${topic.why}.`,
        steps: [
          "State each text's main position and notice that they conflict.",
          "Look beneath the disagreement for a point one text states and the other takes for granted.",
          "Choose that shared premise and reject each text's own thesis.",
        ],
        principles: [
          "Authors who disagree about a conclusion can still share assumptions about the facts or about what matters.",
        ],
        trap: "Choosing one author's thesis, which the other author explicitly argues against.",
        hint: "What must the author of Text 2 already believe in order to argue as they do?",
        estimatedSeconds: 95,
        verify: () => {
          const [one, two] = CTC_split(content);
          return one.includes(topic.premise1) && two.includes(topic.premise2) &&
            one.includes(topic.thesis1Anchor) && !two.includes(topic.thesis1Anchor) &&
            two.includes(topic.thesis2Anchor) && !one.includes(topic.thesis2Anchor);
        },
      };
    },
  };

  return [
    ctcSharedClaim,
    ctcProblemSolution,
    ctcCounterexample,
    ctcExtends,
    ctcApplyExplanation,
    methodChallenge,
    ctcDifferenceInView,
    ctcCommonGround,
  ];
});
