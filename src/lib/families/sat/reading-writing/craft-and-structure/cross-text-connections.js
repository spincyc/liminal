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
      key: "Families who move outward to cut their rent often spend the savings on travel.",
      only1: "Car repairs can be among the largest hidden costs of living far from work.",
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
      key: "Fungi growing on tree roots supply those trees with the nutrient phosphorus.",
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
      key: "Fines for overdue books discourage some people from using public libraries.",
      only1: "Most books are returned on time even when libraries charge no fines.",
      only2: "Children often borrow more books once libraries stop charging fines.",
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
      key: "Running tall fans that draw the warmer air down into the orchard",
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
      key: "Broadcasting short scenes from upcoming plays on the local radio station",
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
      key: "Hanging heavy fabric panels along the back wall of the concert hall",
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
      key: "By questioning whether island rodents always grow larger, since Tolmar's mice are lighter than mainland mice",
      support: "By citing Tolmar's mice as further evidence that island rodents grow larger than mainland ones",
      extreme: "By arguing that Text 1 has the rule about island rodents exactly backward",
      method: "By arguing that Text 1 bases the rule about island rodents on too few surveys",
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
      key: "By noting that residents of Calder Court, a city complex, know more neighbors than rural residents do",
      support: "By noting that Calder Court's residents, like most city dwellers, can name only a few neighbors",
      extreme: "By claiming that the pattern Text 1 reports for city dwellers is in fact reversed",
      method: "By claiming that the pattern Text 1 reports for city dwellers rests on weak surveys",
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
      key: "By pointing out that the Orsa shrub endures drought without storing water",
      support: "By citing the Orsa shrub as another desert plant that stores water in its stems",
      extreme: "By noting that most desert plants rely on deep roots rather than on stored water",
      method: "By questioning how carefully Text 1 measured the water held in desert plants",
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
      key: "By presenting Lessa's wall, built mainly to collect tolls, as an exception",
      support: "By presenting Lessa's wall as further evidence that Vellan walls were defensive",
      extreme: "By claiming that the Vellan towns in general built their walls for tolls, not defense",
      method: "By claiming that the Vellan towns in general left too few records to judge their walls",
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
      key: "By noting that Renn, though a court composer, wrote mainly for the townspeople",
      support: "By citing Renn's career as typical of Arvelan composers who wrote for nobles",
      extreme: "By pointing out that Arvelan court composers rarely wrote for aristocratic patrons",
      method: "By questioning how Text 1 dated the symphonies performed at palace concerts",
      why: "Text 1 claims that Arvelan court composers wrote for aristocrats, but Text 2 describes Renn, a court composer who wrote chiefly for townspeople",
    },
    {
      "scene": "cs-durrow-cinema",
      "text1": "When household incomes fall, families cut spending on entertainment first. Economists have found this pattern in downturn after downturn: meals out, concert tickets, and trips to the movies are the first expenses to go, long before spending on food or rent declines.",
      "text2": "In 2009 the mine in the town of Durrow cut its workers' hours by a third. A household survey found that the affected families reduced spending on clothing but increased their total spending on entertainment. Cinema visits replaced costlier outings, yet families went so much more often that even their overall entertainment budgets grew.",
      "ruleAnchor": "cut spending on entertainment first",
      "caseAnchor": "Durrow",
      "key": "By citing Durrow, where entertainment spending rose after families' incomes fell",
      "support": "By noting that Durrow's families, like most, cut spending on entertainment first",
      "extreme": "By arguing that families generally spend more on entertainment when incomes fall",
      "method": "By pointing out that the economists in Text 1 studied only a few downturns",
      "why": "Text 1 claims that families cut entertainment first when incomes fall, but Text 2 reports that affected Durrow families increased total entertainment spending while cutting another expense"
    },
    {
      scene: "cs-reed-frog",
      text1:
        "Bright colors on a frog are a warning. Poison frogs advertise their toxic skins with vivid reds, yellows, and blues, and predators that have tasted one learn to avoid the rest. Among frogs, vivid coloring is a reliable signal that an animal is poisonous.",
      text2:
        "The scarlet reed frog of the Imbe wetlands is one of the most brightly colored frogs known. Yet when herpetologist Marisa Soler tested its skin, she found no toxins at all. Predators avoid it anyway, apparently because it closely resembles a poisonous frog that shares its wetlands.",
      ruleAnchor: "reliable signal that an animal is poisonous",
      caseAnchor: "scarlet reed frog",
      key: "By pointing out that the scarlet reed frog is brightly colored yet has no toxins",
      support: "By pointing out that the scarlet reed frog, like other bright frogs, has a toxic skin",
      extreme: "By noting that bright coloring in frogs seldom indicates that they are poisonous",
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
      key: "By noting that an Orianan almanac printed in 1542 is full of woodcut pictures",
      support: "By presenting the 1542 almanac as an everyday book printed as plain text",
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
      key: "By presenting the Sarro cave loach, which has kept working eyes, as an exception",
      support: "By citing the Sarro cave loach as another cave fish whose eyes have shrunk",
      extreme: "By pointing out that cave fish generally keep their eyes however long they live in caves",
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
      key: "By arguing that The Lantern Keeper, narrated by a servant who knows little, is an exception",
      support: "By noting that The Lantern Keeper, like other Verran novels, has an all-knowing narrator",
      extreme: "By arguing that Verran novelists generally avoided all-knowing narrators",
      method: "By questioning which Verran novels Text 1 relies on for its claim",
      why: "Text 1 claims that Verran novelists relied on all-knowing narrators, but Text 2 describes a widely read Verran novel narrated by a servant who knows very little",
    },
  ];

  const ctcCounterexample = {
    ...CTC_BASE,
    id: "cross-text-counterexample",
    subskill: "response between texts",
    difficulty: "Easy",
    title: "Second text offers a case that the first text's generalization does not fit",
    recognize:
      "Text 1 states a general pattern; Text 2 describes one case that breaks it. The response is to present that case as an exception, not to reverse the whole pattern.",
    rubric: { steps: 0, concept: 1, interpretation: 1, distractors: 0, abstraction: 0, synthesis: 1, trap: 0 },
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
      key: "As a case of shoppers treating the middle option as a safe compromise",
      opposite: "As a sign that the café's customers were avoiding the option in the middle",
      narrow: "As a quirk of the café's customers that would not appear in other stores",
      misattributed: "As evidence that wine buyers favor bottles in the middle of a price range",
      why: "Text 2 describes shoppers choosing the middle of three options as a safe compromise, and the café's customers did exactly that once a large size was added",
    },
    {
      scene: "cs-violet-seeds",
      who: "Anders Kallio",
      text1:
        "In a beech wood near the village of Lenna, botanist Mara Ekholm followed the seeds of the woodland violet, each of which carries a small, fatty tip. Ants carried the seeds back to their nests, ate the tips, and discarded the seeds in refuse piles, where the rich soil helped them sprout far from the parent plant.",
      text2:
        "Many plants pay animals to move their seeds, explains ecologist Anders Kallio. A food reward attached to a seed, such as a fleshy coating or an oily appendage, leads an animal to carry the seed away, eat the reward, and drop or pass the seed somewhere new. The strategy appears in thousands of species, including some acacias, whose seeds hang from bright, fleshy stalks that birds eat.",
      findingAnchor: "fatty tip",
      principleAnchor: "pay animals to move their seeds",
      exampleAnchor: "acacias",
      key: "As an instance of a plant rewarding animals for moving its seeds",
      opposite: "As a sign that the violet's seeds would spread just as well without the ants",
      narrow: "As evidence of a strategy peculiar to the woodland violet and its ants",
      misattributed: "As an example of acacias relying on birds to carry off their seeds",
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
      key: "As evidence that officials' judgments are shaped by crowd reactions",
      opposite: "As an exception showing that referees are not swayed by the crowds around them",
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
      opposite: "As evidence that the abbey's chants would have sounded the same in any building",
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
      key: "As a result, in part, of the air cooling as water evaporates from leaves",
      opposite: "As evidence that shade alone, not evaporation, cooled the tree-lined blocks",
      narrow: "As an effect that would be found only in the Kingsley district",
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
      misattributed: "As evidence that Valdor's poorest quarters heard of a price rise early",
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
      key: "As evidence of the brain strengthening new memories by replaying them in sleep",
      opposite: "As a finding that conflicts with the idea that sleep strengthens memory",
      narrow: "As a result that applies only to lists of words learned at noon",
      misattributed: "As an example of rats replaying the routes of mazes while they sleep",
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
      key: "As a case of borrowing concentrated in the vocabulary of a shared trade",
      opposite: "As an example of everyday words being borrowed more readily than trade words",
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
      key: "As evidence that a shared space lets knowledge spread through chance contact",
      opposite: "As an example of chance contact slowing the spread of knowledge in groups",
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
      misattributed: "As an example of lullabies on the Dorran plateau varying from valley to valley",
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
      key: "As a case of a new transport route causing a town beside it to grow rapidly",
      opposite: "As an exception to the pattern in which new routes help the towns along them",
      narrow: "As evidence of growth that only canals, and not railways, could bring",
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
      key: "The thick walls take in the day's heat slowly, so the rooms stay cool at midday.",
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
      ruledOut: "Customers judged the price by what the book cost the publisher to make.",
      detail: "The novel was priced $4 lower at Tallis than at other shops in town.",
      why: "Text 1 says shoppers judge a price against the first price they saw, and Tallis customers had first seen the novel advertised at $14",
    },
    {
      "scene": "cs-vessa-doves",
      "text1": "Animals that evolve where there are no predators often lose their fear of large creatures. Wariness has costs: an animal that flees at every movement spends less time feeding. Where nothing hunts them, less fearful individuals eat more and leave more offspring, so over generations the whole population grows tame. The tameness reflects this history, not any failure of the animals' senses.",
      "text2": "Hikers on remote Vessa Island are often startled that its ground doves let people approach within arm's length. The island's ecological record indicates that the doves evolved without predators, and they nest in low shrubs beside the trails. A local naturalist suggests that they have simply grown used to the tourists who feed them.",
      "puzzle": "why Vessa Island's ground doves let people come so close",
      "principleAnchor": "evolve where there are no predators",
      "guessAnchor": "grown used to the tourists",
      "detailAnchor": "low shrubs",
      "key": "The doves evolved without predators, so fearless birds prospered.",
      "guess": "The doves have grown used to tourists who regularly feed them.",
      "ruledOut": "The doves cannot see well enough to recognize people as a threat.",
      "detail": "Nesting beside the trails leaves the doves little room to flee from people.",
      "why": "Text 1 explains tameness as an evolved response to an absence of predators, and Text 2 says Vessa’s ecological record indicates that its doves evolved without predators"
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
      key: "Fruit merchants switched to the faster railway despite its higher freight rates.",
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
      guess: "Snowy winters bring fewer of the insects that like to feed on the wheat.",
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
  // something the study did not rule out. Both texts are written out in full
  // so Text 2 does not follow one frame. The choices are written per scene:
  // the key names Text 2's alternative, and the three distractors are real
  // misreadings (the concession read as agreement about the cause, the
  // "however" read as a denial of the data, and a methodological objection
  // Text 2 never raises). Openers rotate across scenes and are shared by
  // keys and distractors, so no opening phrase marks the key.
  const METHOD_CHALLENGE_TOPICS = [
    {
      scene: "cs-urban-birdsong",
      critic: "Samuel Achebe",
      claimant: "Ortiz",
      text1:
        "Ornithologist Lena Ortiz recorded more than 400 songs of song sparrows at twelve sites in and around the city of Brennport over two breeding seasons. Sparrows in the downtown parks sang at a noticeably higher pitch than sparrows in the farmland outside the city. Ortiz concludes that city sparrows shift their songs upward so they can be heard over the low rumble of traffic.",
      text2:
        "Ornithologist Samuel Achebe has no quarrel with Ortiz’s recordings: downtown sparrows do sing higher. What he doubts is her explanation. The downtown parks are crowded with small trees and hard building walls, and high notes carry better than low ones among closely spaced, reflective surfaces. A sparrow in such a park might favor higher notes even at dawn on a holiday, with the streets silent.",
      claimAnchor: "heard over the low rumble of traffic",
      altAnchor: "high notes carry better",
      key: "By arguing that the layout of the parks, rather than traffic noise, may account for the higher songs",
      agree: "By agreeing that the sparrows’ higher songs confirm that they are adjusting to traffic noise",
      deny: "By questioning whether downtown sparrows actually sing at a higher pitch than rural ones",
      critique: "By suggesting that Ortiz may have recorded too few songs to show a reliable difference",
      why: "Achebe accepts Ortiz’s recordings but suggests that the parks’ closely spaced trees and walls, which favor high notes, could explain the higher songs even without traffic",
    },
    {
      scene: "cs-classroom-plants",
      critic: "Kenji Moreau",
      claimant: "Whitfield",
      text1:
        "Education researcher Dara Whitfield compared forty classrooms in six schools in the Linmoor district. Students in classrooms with potted plants scored higher on end-of-term reading tests than students in classrooms without them, and Whitfield argues that the plants improved the students’ concentration.",
      text2:
        "The reading scores in Whitfield’s study are not in question. The plants, however, were never assigned: each teacher decided whether to bring them in. Education researcher Kenji Moreau observes that teachers who go to that trouble may also be the ones who keep quieter rooms, assign more reading, or stay late to help, and any of those habits could raise scores.",
      claimAnchor: "improved the students’ concentration",
      altAnchor: "each teacher decided",
      key: "By pointing out that the teachers who chose plants may differ in ways that affect reading",
      agree: "By pointing out that the higher scores in plant-filled classrooms support Whitfield’s claim",
      deny: "By arguing that the difference in reading scores was too small to count as a real effect",
      critique: "By suggesting that forty classrooms in six schools are too few to support any conclusion",
      why: "Moreau accepts the scores but notes that each teacher chose whether to add plants, so differences among those teachers, not the plants, could explain the results",
    },
    {
      scene: "cs-river-otters",
      critic: "Tomas Lindqvist",
      claimant: "Castellanos",
      text1:
        "Three years after a dam was removed from the Harlan River, wildlife biologist Priya Castellanos found otters on 60 percent of nights along the restored stretch, where camera traps had rarely recorded them before. She credits the dam’s removal with bringing the otters back.",
      text2:
        "Tomas Lindqvist, a biologist who surveys otters on the neighboring Tamsin River, reports a curious parallel. The Tamsin still has its dam, yet otter sightings there climbed over the same three years at nearly the same rate as on the Harlan. Whatever brought the otters back, he argues, is unlikely to be something that happened only on the Harlan; a regional change, such as cleaner water, is the likelier cause.",
      claimAnchor: "credits the dam’s removal",
      altAnchor: "regional change",
      key: "By arguing that a regional change, not the dam’s removal, likely brought back the otters",
      agree: "By noting that otters are now common on the restored stretch, as the dam’s removal would predict",
      deny: "By questioning whether otters have truly returned to the restored stretch of the Harlan River",
      critique: "By suggesting that the camera traps may have recorded the same few otters night after night",
      why: "Lindqvist notes that otters increased just as fast on a river that kept its dam, which points to a regional cause rather than the dam’s removal",
    },
    {
      scene: "cs-ancient-pottery",
      critic: "Rafael Quint",
      claimant: "Adeyemi",
      text1:
        "At a hilltop settlement in the Varro hills, archaeologist Miriam Adeyemi found fragments of glazed pottery whose clay, according to chemical tests, came from a single deposit near the coastal town of Istra, two hundred miles away. Adeyemi concludes that the two communities traded directly with each other.",
      text2:
        "That the hilltop pots were made on the coast is not in dispute; the chemistry settles it. But archaeologist Rafael Quint doubts that the potters and the hill dwellers ever met. In this region, he notes, goods commonly changed hands at several markets along the way, so a pot could travel two hundred miles through a chain of exchanges without any contact between its makers and its final owners.",
      claimAnchor: "traded directly",
      altAnchor: "chain of exchanges",
      key: "By agreeing that the pots came from the coast but doubting that they show direct trade",
      agree: "By concluding that coastal clay in the hilltop pots proves the two towns traded directly",
      deny: "By arguing that the chemical tests misidentified where the hilltop pots were made",
      critique: "By arguing that the chemical tests cannot show when the hilltop pots were made",
      why: "Quint accepts that the pots came from the coast but argues that they could have passed through several markets, so they do not show direct contact between the two communities",
    },
    {
      scene: "cs-night-shift-sleep",
      critic: "Victor Salazar",
      claimant: "Brooks-Diallo",
      text1:
        "Sleep scientist Hannah Brooks-Diallo fitted 120 nurses with sleep monitors for a month before and a month after they switched from rotating shifts to fixed night shifts. After the switch, the nurses slept about an hour longer per day on average. A predictable schedule, she argues, lets the body’s internal clock adjust.",
      text2:
        "Every nurse in Brooks-Diallo’s study had asked to move to fixed night shifts. For sleep scientist Victor Salazar, that detail matters more than the monitors’ readings, which he accepts. People who volunteer for night work, he observes, may be those who already sleep easily during the day, and such nurses might have slept longer after the switch however predictable their schedules were.",
      claimAnchor: "internal clock adjust",
      altAnchor: "had asked to move",
      key: "By suggesting that nurses who chose night shifts may already have slept well by day",
      agree: "By suggesting that a predictable schedule lets nurses’ internal clocks adjust to night work",
      deny: "By questioning whether the sleep monitors accurately recorded how long the nurses slept",
      critique: "By arguing that a month of monitoring after the switch is too short to show a lasting change",
      why: "Salazar accepts the monitors’ readings but notes that the nurses chose night work, so they may have been people who sleep well by day whatever their schedule",
    },
    {
      scene: "cs-coral-bleaching",
      critic: "Martin Osei",
      claimant: "Kealoha",
      text1:
        "During a marine heat wave, marine ecologist Ana Kealoha surveyed 1,200 coral colonies on the Moana reef. Corals growing beside the reef’s shaded underwater cliffs bleached far less than corals on the open reef flat. Kealoha attributes the difference to the shade, which she says reduced the corals’ exposure to intense sunlight.",
      text2:
        "Marine ecologist Martin Osei points to something Kealoha’s survey did not measure: the water temperature at the cliffs. Cooler water welling up from the reef’s deeper channels tends to collect along those cliffs, he notes, so the corals there may have been spared some of the heat as well as some of the light. Shade may have played a part, in his view, but it cannot be credited with the whole difference.",
      claimAnchor: "attributes the difference to the shade",
      altAnchor: "Cooler water welling up",
      key: "By noting that cooler water at the cliffs, and not only shade, may have protected the corals",
      agree: "By agreeing that shade by itself explains why the corals near the cliffs bleached less",
      deny: "By arguing that the corals near the cliffs bleached as severely as those on the reef flat",
      critique: "By questioning whether 1,200 colonies were enough to compare the two parts of the reef",
      why: "Osei accepts that the cliff corals bleached less and allows that shade may have helped, but he notes that cooler water collects at the cliffs, so shade alone cannot explain the difference",
    },
    {
      scene: "cs-museum-labels",
      critic: "Elias Varga",
      claimant: "Nakamura",
      text1:
        "When the Aldermoor Museum replaced the brief labels in its portrait gallery with longer ones describing each artist’s life, staff timed about 3,000 visitors before and after the change. Visitors spent twice as long at each painting afterward, and museum studies researcher Grace Nakamura concludes that biographical information draws visitors into artworks.",
      text2:
        "Museum studies researcher Elias Varga has checked the Aldermoor’s records for the month the new labels went up. That same month, the gallery was rearranged and a row of benches was added along its center. Visitors who can sit, Varga remarks, tend to stay; the doubled viewing times Nakamura reports are real, but they cannot be credited to the labels while the benches remain an equally good explanation.",
      claimAnchor: "biographical information draws visitors",
      altAnchor: "row of benches",
      key: "By claiming that the new benches and layout could explain the longer visits just as well",
      agree: "By claiming that longer labels about artists’ lives draw visitors more deeply into the paintings",
      deny: "By arguing that visitors did not in fact stay longer at the paintings after the labels changed",
      critique: "By suggesting that the staff who timed visitors may have favored paintings with new labels",
      why: "Varga accepts the doubled viewing times but notes that benches were added and the gallery rearranged in the same month, so those changes could explain the longer visits",
    },
    {
      scene: "cs-rooftop-gardens",
      critic: "Lucia Ferrante",
      claimant: "Haddad",
      text1:
        "Urban planner Omar Haddad compared utility records for 80 office buildings in the city of Castellan over three summers. Buildings with rooftop gardens used 15 percent less electricity for cooling than similar buildings without them, and Haddad argues that the gardens insulate the roofs from the summer sun.",
      text2:
        "Urban planner Lucia Ferrante accepts Haddad’s figures but not his reading of them. Owners who install rooftop gardens, she has found, often replace windows and air conditioners in the same renovation. Until those upgrades are separated from the gardens, Ferrante argues, the 15 percent savings cannot be assigned to the gardens’ insulating effect.",
      claimAnchor: "gardens insulate the roofs",
      altAnchor: "replace windows and air conditioners",
      key: "By questioning whether the savings come from the gardens rather than from other upgrades",
      agree: "By agreeing that the gardens’ insulation explains the lower cooling costs Haddad measured",
      deny: "By questioning whether buildings with rooftop gardens actually used less electricity",
      critique: "By arguing that Haddad measured the lower cooling costs over too few summers to trust",
      why: "Ferrante accepts the figures but notes that owners who add gardens often upgrade windows and air conditioners at the same time, and those upgrades could account for the savings",
    },
    {
      scene: "cs-language-apps",
      critic: "Daniel Okafor",
      claimant: "Ramos",
      text1:
        "Linguist Beatriz Ramos followed 500 adults learning Spanish in three cities. After six months, those who practiced with a phone app for ten minutes a day scored higher on a vocabulary test than those who did not use the app, and Ramos credits the app’s daily reminders, which kept learners practicing.",
      text2:
        "Linguist Daniel Okafor finds Ramos’s comparison less telling than it looks. The app users chose to download the app; the comparison group did not. Adults eager enough to do that, he observes, are likely to seek out Spanish in other ways as well, by reading, watching films, or practicing with friends. Their higher scores are no surprise, and they say little about the reminders.",
      claimAnchor: "credits the app’s daily reminders",
      altAnchor: "chose to download",
      key: "By pointing out that the app users’ motivation, not the reminders, could explain their higher scores",
      agree: "By agreeing that the reminders kept the app users practicing and so raised their scores",
      deny: "By pointing out that the app users did not actually score higher than the other adults",
      critique: "By suggesting that a vocabulary test measures too little of what a language learner knows",
      why: "Okafor accepts that the app users scored higher but notes that they chose the app themselves, so their motivation, which likely led them to study in other ways, could explain the gap",
    },
    {
      scene: "cs-glacier-lichen",
      critic: "Arjun Mehta",
      claimant: "Solberg",
      text1:
        "Botanist Ingrid Solberg measured lichen patches on 90 boulders at known distances from the retreating Kalda Glacier. Lichens grew faster on rocks the ice had exposed recently than on rocks exposed long ago, and Solberg proposes that freshly exposed rock releases minerals that the lichens use.",
      text2:
        "Botanist Arjun Mehta has walked the same moraine. Boulders near the ice, he notes, stay damp from meltwater through most of the summer, while those exposed long ago dry out within days of rain, and moisture is well known to speed lichen growth. Solberg’s measurements may be sound, Mehta concludes, but her mineral explanation has a rival that she has not ruled out.",
      claimAnchor: "releases minerals",
      altAnchor: "damp from meltwater",
      key: "By suggesting that meltwater keeping nearby rocks damp may explain the faster growth",
      agree: "By arguing that minerals released by freshly exposed rock speed the lichens’ growth",
      deny: "By questioning whether lichens near the glacier truly grow faster than those farther away",
      critique: "By noting that Solberg’s 90 boulders may not have been spread evenly across the moraine",
      why: "Mehta does not dispute the measurements but notes that rocks near the ice stay damp from meltwater, and moisture speeds lichen growth, so moisture could explain the faster growth",
    },
  ];

  const methodChallenge = {
    id: "cross-text-method-challenge",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Cross-Text Connections",
    subskill: "response between texts",
    difficulty: "Medium",
    title: "Second text accepts the finding but challenges its explanation",
    recognize:
      "Text 2 agrees with what Text 1 observed but offers another explanation for it; the answer names that alternative, not a rejection of the observation or a different complaint about the study.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["opposite-stance", "misattributed-view", "true-but-irrelevant"],
    build(t) {
      const topic = t.pick(METHOD_CHALLENGE_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: `Based on the texts, how would ${topic.critic} (Text 2) most likely respond to ${topic.claimant}’s conclusion in Text 1?`,
        correct: topic.key,
        wrong: [
          [topic.agree, "Text 2 accepts the observation, not the explanation; this choice treats agreement about the data as agreement about the cause."],
          [topic.deny, "Text 2 accepts the observation and the measurements behind it; its doubt concerns only the explanation."],
          [topic.critique, "Text 2 does doubt Text 1's conclusion, but not on this ground; it offers a specific rival explanation that this choice never mentions."],
        ],
        explanation: `${topic.why}.`,
        steps: [
          "State what Text 1 observed and how it explains the observation.",
          "Find what Text 2 accepts, then what it questions and why.",
          "Choose the response that keeps the accepted observation and names Text 2's rival explanation.",
        ],
        principles: [
          "A second author can accept a finding while rejecting the explanation offered for it.",
          "A cross-text answer must be consistent with everything the second author says, including what that author concedes.",
        ],
        trap: "Reading Text 2's concession as agreement with Text 1's explanation, or its doubt as a complaint about how the data were collected.",
        hint: "Separate what Text 2 accepts from what it questions, and look for the reason it gives.",
        estimatedSeconds: 80,
        verify: () => {
          const [one, two] = CTC_split(content);
          const choices = [topic.key, topic.agree, topic.deny, topic.critique];
          return one.includes(topic.claimAnchor) && two.includes(topic.altAnchor) &&
            !one.includes(topic.altAnchor) && two.includes(topic.critic) &&
            new Set(choices).size === 4;
        },
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
      overA: "thinks hunting played no part",
      overB: "thinks plowing played none",
      overWhy: "Text 1 says hunting hastened the decline, and Text 2 grants that plowing shrank the range, so neither denies the other factor a part.",
      sharedSwap: "Text 1 doubts that plowing shrank the herds' range, whereas Text 2 says that it did.",
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
      overA: "thinks longer schooling has no bearing on the delay",
      overB: "thinks rent has no bearing on it",
      overWhy: "Text 1 grants that more young people attend university, and Text 2 says schooling explains most, not all, of the delay, so neither rules the other factor out.",
      sharedSwap: "Text 1 doubts that Norvale rents have climbed much, whereas Text 2 says they have climbed steeply.",
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
      overA: "calls the room flawless",
      overB: "calls it a failure in every respect",
      overWhy: "Text 1 praises the room's success without calling it flawless, and Text 2 grants that it is bright and busy, so neither view is this absolute.",
      sharedSwap: "Text 1 suggests that visits to the room have fallen, whereas Text 2 reports that they doubled.",
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
      view1: "sees the pamphlet as the uprising's spark",
      view2: "sees the pamphlet as voicing older anger",
      sharedA: "says the pamphlet was read in nearly every tavern",
      sharedB: "doubts that many weavers ever heard it read",
      oneA: "dismisses the weavers' earlier petitions as unimportant",
      oneB: "treats those petitions as significant",
      overA: "thinks the weavers had no grievances before the pamphlet appeared",
      overB: "thinks the pamphlet had no effect on the weavers at all",
      overWhy: "Text 1 says the pamphlet turned existing resentment into a cause, and Text 2 says it gave that anger a voice, so neither holds these extreme views.",
      sharedSwap: "Text 1 doubts that many weavers heard the pamphlet read, whereas Text 2 says it was widely read.",
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
      overA: "sees no cost at all in the wolves' return",
      overB: "sees no benefit at all in the wolves' return",
      overWhy: "Text 2 explicitly grants the benefits to willows and trout, and Text 1 never claims the wolves cost nothing, so this overstates both views.",
      sharedSwap: "Text 1 denies that the willows are recovering, whereas Text 2 says that they are.",
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
      view1: "calls the rough strokes deliberate",
      view2: "calls the rough strokes a way around poor sight",
      sharedA: "acknowledges that Vireaux's eyesight declined",
      sharedB: "questions whether her eyesight really declined",
      oneA: "takes Vireaux's letters as evidence of her aims",
      oneB: "finds those letters an unreliable guide",
      overA: "treats the rough strokes as unrelated to her failing sight",
      overB: "treats the late paintings as failures caused by poor sight",
      overWhy: "Text 1 calls the change no mere accommodation, which allows that sight played some part, and Text 2 never calls the late paintings failures.",
      sharedSwap: "Text 1 questions whether Vireaux's eyesight really declined, whereas Text 2 says that it did.",
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
      overA: "thinks texting has ruined every student's spelling",
      overB: "thinks it improves spelling",
      overWhy: "Text 1 says texting is eroding spelling, not that it has ruined everyone's, and Text 2 finds heavy texters spell as well as others, not better.",
      sharedSwap: "Text 1 finds that the students rarely abbreviate, whereas Text 2 says they abbreviate constantly.",
      why: "Text 1 says the texting habit is eroding students' spelling, while Text 2 accepts that they abbreviate constantly but finds their formal spelling unharmed",
    },
    {
      scene: "cs-sessel-comet",
      subject: "the water vapor detected at the comet Sessel",
      text1:
        "In 2021 the Ardent probe detected water vapor streaming from the comet Sessel. The finding shows that Sessel holds a large reservoir of ice deep inside, which the Sun's heat is only now beginning to release. Future missions to Sessel should be designed to drill beneath its surface.",
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
      sharedB: "doubts that any water vapor was really detected at all",
      oneA: "dismisses the vapor's quick fading as unimportant",
      oneB: "treats that fading within weeks as highly revealing",
      overA: "takes the vapor as proof that Sessel is made mostly of ice",
      overB: "takes the vapor as proof that Sessel holds no ice at all",
      overWhy: "Text 1 infers a deep reservoir, not a comet made mostly of ice, and Text 2 attributes the vapor to surface frost, which is itself ice.",
      sharedSwap: "Text 1 doubts that any vapor was really detected, whereas Text 2 accepts the detection.",
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
      sharedA: "reports that traffic through downtown has dropped by half",
      sharedB: "claims that downtown traffic has held steady since 2016",
      oneA: "dismisses closures in nearby towns as irrelevant",
      oneB: "treats those closures as telling evidence",
      overA: "thinks online shopping has hurt no shops in the region",
      overB: "thinks the bypass has had no effect on downtown at all",
      overWhy: "Text 1 never discusses online shopping, and Text 2 grants that downtown is quieter since the bypass opened, so neither holds these views.",
      sharedSwap: "Text 1 claims that downtown traffic has held steady, whereas Text 2 says it has dropped.",
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
      overA: "infers a duty to make any sacrifice for any stranger",
      overB: "infers that we owe strangers no help of any kind",
      overWhy: "Text 1 limits the duty to cases where the cost is small, and Text 2 affirms a duty to rescue someone in front of us, so neither view is this extreme.",
      sharedSwap: "Text 1 doubts that most people would wade in, whereas Text 2 says nearly everyone would.",
      why: "Text 1 draws from the case a duty to help strangers wherever they are, while Text 2 accepts the common judgment but limits the duty to someone directly in front of us",
    },
  ];

  // Which three distractors a draw uses. A pure "swapped positions"
  // distractor makes the key one half of a mirror pair, so a student could
  // guess between the two mirror images without reading. The variants mix
  // that pair with an overstated version of the real disagreement and with a
  // mirror pair made of two distractors, so a mirror pair points to the key
  // no more often than chance.
  const DIFFERENCE_VARIANTS = [
    ["swapped", "shared", "oneText"],
    ["overstated", "shared", "sharedSwap"],
    ["swapped", "overstated", "oneText"],
    ["overstated", "oneText", "shared"],
  ];

  const ctcDifferenceInView = {
    ...CTC_BASE,
    id: "cross-text-difference-in-view",
    subskill: "agreement",
    difficulty: "Medium",
    title: "Texts that share several points and differ on one",
    recognize:
      "Both texts accept the same facts, and Text 2 concedes some of Text 1's points before disagreeing. The difference is the single point each answers differently, attributed to the right text and stated no more strongly than each text states it.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["misattributed-view", "opposite-stance", "one-text-only", "extreme-language"],
    build(t) {
      const topic = t.pick(CTC_DIFFERENCE_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      const key = `Text 1 ${topic.view1}, whereas Text 2 ${topic.view2}.`;
      const swapped = `Text 1 ${topic.view2}, whereas Text 2 ${topic.view1}.`;
      const pool = {
        swapped: [swapped, "This names the real disagreement but assigns each position to the wrong text."],
        shared: [`Text 1 ${topic.sharedA}, whereas Text 2 ${topic.sharedB}.`,
          "Text 2 explicitly concedes this point before stating its own view, so the texts agree about it."],
        sharedSwap: [topic.sharedSwap,
          "Both texts accept this point, so neither author disputes it; this choice invents a disagreement about it."],
        oneText: [`Text 1 ${topic.oneA}, whereas Text 2 ${topic.oneB}.`,
          "Only one of the texts discusses this at all, so there is no stated difference between the authors on it."],
        overstated: [`Text 1 ${topic.overA}, whereas Text 2 ${topic.overB}.`, topic.overWhy],
      };
      const wrong = t.pick(DIFFERENCE_VARIANTS).map((name) => pool[name]);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: `Which choice best describes a difference in how the authors of Text 1 and Text 2 view ${topic.subject}?`,
        correct: key,
        wrong,
        explanation: `${topic.why}.`,
        steps: [
          "List the points both texts accept, including anything Text 2 concedes.",
          "Find the one point on which the texts take different positions.",
          "Check which text holds which position, and that neither position is stated more strongly than the text states it.",
        ],
        principles: [
          "A difference between two texts must be a point both address and answer differently; a concession marks agreement, not difference.",
        ],
        trap: "Choosing the right contrast with the positions reversed or exaggerated, or treating a point that Text 2 concedes as a disagreement.",
        hint: "Note what Text 2 grants before it states its own view.",
        estimatedSeconds: 90,
        verify: () => {
          const [one, two] = CTC_split(content);
          return one.includes(topic.anchor1) && !two.includes(topic.anchor1) &&
            two.includes(topic.anchor2) && !one.includes(topic.anchor2) &&
            one.includes(topic.sharedAnchor1) && two.includes(topic.sharedAnchor2) &&
            one.includes(topic.oneAnchor) !== two.includes(topic.oneAnchor) &&
            key !== swapped && wrong.length === 3;
        },
      };
    },
  };

  // Opposing recommendations rest on a shared premise inferred from how
  // each author uses evidence; no repeated assertion supplies the answer.
  const CTC_COMMON_TOPICS = [
  {
    "scene": "cs-common-map-route-status",
    "text1": "A new walking map of Leth Valley should omit the abandoned ridge paths. Their bridges have collapsed, and a continuous line invites walkers to plan journeys the paths can no longer support. An appendix could record where those routes once ran without giving them the same visual standing as maintained trails.",
    "text2": "Removing the ridge paths from Leth Valley's map would make the old villages appear isolated. Keep those paths, but draw them differently from usable trails. Their importance is precisely that they explain connections among settlements which the present network no longer reveals.",
    "key": "A route's placement and appearance on a map can imply a relationship to the landscape that its location alone does not establish.",
    "wrong": [
      [
        "A map should retain former routes in its main display even when those routes are irrelevant to journeys readers can make today.",
        "Text 2 favors keeping former routes on the main map. Text 1 instead separates them into an appendix to avoid misleading present-day walkers."
      ],
      [
        "A route should be excluded from the main map whenever its physical condition prevents readers from following its original course.",
        "This is Text 1's proposal; Text 2 explicitly favors retaining the routes with a different visual treatment."
      ],
      [
        "A map's historical value depends chiefly on recording routes that once linked villages rather than those that connect them today.",
        "Text 2 identifies a historical use but does not rank historical value this way; Text 1's concern is safe, usable route information."
      ]
    ],
    "anchors": [
      "same visual standing",
      "draw them differently"
    ],
    "why": "Text 1 worries that an undifferentiated line suggests present usability; Text 2 worries that omission suggests historical isolation. Both arguments depend on maps communicating relationships beyond the physical positions of paths, although the authors favor different placements for the old routes."
  },
  {
    "scene": "cs-common-translation-form",
    "text1": "In translating Mara Venn's poem, I retained its broken line lengths but abandoned the end rhymes. Matching both forced the speaker's uncertain admissions into polished declarations. The uneven lines interrupt an otherwise fluent voice; reproducing the rhyme at the cost of that interruption would misrepresent the speaker.",
    "text2": "My translation of Venn uses regular lines. In the new language, her abrupt breaks sound emphatic rather than hesitant, so I place the hesitation in unfinished clauses instead. Readers should encounter a speaker struggling to proceed, not a diagram of where the original printing presses stopped each line.",
    "key": "The effect of a formal feature depends on its relation to the surrounding language, so matching the feature can alter the speaker's character.",
    "wrong": [
      [
        "The poem's irregular line lengths are its most reliable means of conveying uncertainty and should determine the form of a translation.",
        "Text 1 retains uneven lines, but Text 2 finds them emphatic in the new language and relocates hesitation to syntax."
      ],
      [
        "The target language's conventions should determine line lengths, while the original poem should determine the speaker's syntax.",
        "Text 2 alters syntax and Text 1 preserves line lengths; neither adopts this division between target-language form and original syntax."
      ],
      [
        "The speaker's hesitation can be preserved most faithfully by removing formal constraints that make the translated voice sound polished.",
        "Text 1 sacrifices rhyme, but Text 2 retains regular lines. Both adapt particular features; neither treats removal of formal constraints as the general remedy."
      ]
    ],
    "anchors": [
      "polished declarations",
      "emphatic rather than hesitant"
    ],
    "why": "The first translator finds that matching rhyme and line length together changes the voice; the second finds that copying line breaks changes hesitation into emphasis. Their different solutions therefore share an assumption that a feature's function arises from its linguistic context, rather than from its shape alone."
  },
  {
    "scene": "cs-common-potter-stamp-network",
    "text1": "Storage jars from five Tarel villages bear nearly identical stamps, including an off-center notch with no practical use. Such an arbitrary detail is unlikely to recur independently. The jars probably came from one workshop that distributed its products across the valley; their different clays reflect that workshop's varied supplies.",
    "text2": "The Tarel jars' clay recipes match household pottery in their respective villages, favoring local manufacture. Traveling apprentices could have copied a master's stamp, notch included, while learning to make jars from local materials. A repeated mark need not locate all production under one roof.",
    "key": "The stamps' similarity reflects a connection among their makers, even if it does not establish that the jars shared a production site.",
    "wrong": [
      [
        "The jars' different clay recipes provide better evidence of separate workshops than their similar stamps provide of a shared workshop.",
        "That evidential ranking belongs to Text 2; Text 1 explains the clays through varied supplies at a single workshop."
      ],
      [
        "The stamps were copied by apprentices who carried a common design between villages while adapting production to locally available clay.",
        "This is Text 2's proposed mechanism, not one that Text 1 grants; Text 1 instead proposes distribution from one workshop."
      ],
      [
        "The notch identifies a single workshop because details without a practical use are more stable than the materials available to potters.",
        "Text 1 favors one workshop, but Text 2 offers a route for transmitting the arbitrary notch across multiple workshops."
      ]
    ],
    "anchors": [
      "unlikely to recur independently",
      "copied a master's stamp"
    ],
    "why": "Text 1 treats the arbitrary notch as evidence against independent invention. Text 2 explains its recurrence through apprentices carrying a design. Both therefore depend on some connection transmitting the mark, while disagreeing about whether that connection requires a single production site."
  },
  {
    "scene": "cs-common-dune-plant-viability",
    "text1": "The dune lilies moved inland look healthy, but their stored reserves could sustain leaves for several seasons. I would postpone calling the relocation a success until seedlings appear beyond the planted rows. Moving more adults now would enlarge a display whose continued existence might still depend on gardeners.",
    "text2": "Funds should repair the lilies' coastal site instead. Its pollinating moths remain, and young plants emerge there whenever loose sand is stabilized. The inland planting may be useful as insurance, but conserving this lily should not become a permanent schedule of replacing aging specimens.",
    "key": "Conservation success involves a population's capacity to renew itself, not simply the continued presence of the individuals initially protected.",
    "wrong": [
      [
        "Relocated lilies should serve only as insurance because a population outside its original habitat cannot become independent of gardeners.",
        "Text 2 calls the inland population useful insurance, but neither text says it cannot become independent; Text 1 proposes evidence that would show it has."
      ],
      [
        "The lilies' existing reserves are a stronger predictor of their survival than either pollinator access or the appearance of new seedlings.",
        "Text 1 treats reserves as a reason adult appearance can mislead, while Text 2 emphasizes conditions supporting renewal."
      ],
      [
        "Restoring the coastal site should take priority because established moth populations ensure that its adult lilies will survive relocation.",
        "Text 2 favors coastal restoration, but the moths support reproduction there rather than adult survival after relocation; Text 1 does not rank the two sites."
      ]
    ],
    "anchors": [
      "seedlings appear beyond the planted rows",
      "replacing aging specimens"
    ],
    "why": "Text 1 withholds a success judgment despite healthy adults and asks for new seedlings; Text 2 rejects an approach requiring perpetual replacement. The common standard is the population's ability to renew itself, not agreement about which site deserves priority."
  },
  {
    "scene": "cs-common-archive-record-links",
    "text1": "The Velden factory archive should replace workers' names with stable codes before publication. Researchers could then follow a worker between jobs without exposing the illnesses or debts recorded beside each name. Deleting entire entries would protect privacy only by destroying the sequences that make the collection informative.",
    "text2": "Public codes would be useful, but some research needs names: a worker may appear under another employer in a separate archive. Permit approved researchers to consult the originals in a secure room. Posting identities online is unnecessary for linking those records, and would surrender protections the research itself does not require.",
    "key": "Useful connections among records can be preserved without giving the public unrestricted access to the identities behind those records.",
    "wrong": [
      [
        "Stable codes can support the same historical investigations as workers' names, provided the codes remain consistent throughout an archive.",
        "Text 2 identifies cross-archive linkage as a use for which public codes do not replace names."
      ],
      [
        "Research requiring workers' identities should be confined to the factory archive because links to outside records add little historical value.",
        "Text 2's case for secure access depends on the value of external links, while Text 1 does not dismiss that research."
      ],
      [
        "Keeping original records in a secure room offers greater protection for historical sequences than publishing entries with names replaced by codes.",
        "Text 2 proposes secure access as a complement to codes. Neither text establishes this ranking between two ways of preserving sequences."
      ]
    ],
    "anchors": [
      "follow a worker between jobs",
      "unnecessary for linking those records"
    ],
    "why": "Text 1 preserves sequences with public codes while withholding identities. Text 2 retains names for a more demanding linkage task but confines access to approved researchers. Their different access proposals both separate the research value of connections from unrestricted public identification."
  },
  {
    "scene": "cs-common-museum-making-inferences",
    "text1": "Visitors should handle replicas of the Orra clay vessels. Pressing a thumb into a replica's grip reveals why its wall bends inward, a feature photographs flatten into decoration. A durable copy could make that shaping decision intelligible in a way the original, sealed behind glass, rarely does.",
    "text2": "Replicas should accompany, rather than displace, the Orra vessels. On the originals, scraped ridges cross earlier finger marks, revealing the order in which surfaces were finished. A smoothed replica can reproduce the final shape while concealing the sequence of decisions that produced it.",
    "key": "The value of an object's display depends partly on what it allows visitors to infer about the decisions involved in making that object.",
    "wrong": [
      [
        "Handling a replica gives visitors stronger evidence of a vessel's production history than viewing the original behind protective glass.",
        "Text 1 values handling for understanding one shaping decision; Text 2 identifies production evidence that a replica may conceal."
      ],
      [
        "An accurate copy must reproduce each visible surface mark before it can communicate anything useful about a vessel's original design.",
        "Text 1 finds a replica informative through its shape; Text 2 shows that missing marks limit particular inferences, not every useful inference."
      ],
      [
        "The chronological order of finishing techniques is more important to understanding the vessels than the functions of their final shapes.",
        "Text 2 emphasizes sequence and Text 1 emphasizes a shape's function, but neither grants the other's concern lower priority."
      ]
    ],
    "anchors": [
      "that shaping decision intelligible",
      "sequence of decisions"
    ],
    "why": "Text 1 justifies replicas through an inference about why a wall was shaped; Text 2 justifies keeping originals through an inference about the sequence of finishing. Both evaluate displays through access to makers' decisions, though they need different kinds of material evidence."
  },
  {
    "scene": "cs-common-reservoir-useful-supply",
    "text1": "Harrow's annual river inflow looks ample, but most arrives during six stormy weeks. A reservoir would carry that water into the growing season, when present diversions nearly empty the channel. Budget forecasts based on annual inflow conceal the very shortage the reservoir is meant to address.",
    "text2": "Harrow should invest in water reuse before building a reservoir. The largest storms carry sediment that would progressively consume its storage, and wide summer shallows would lose water to evaporation. The river's impressive annual total gives the proposed structure more dependable capacity on paper than these losses permit.",
    "key": "A river's annual inflow cannot by itself establish how much water a proposed system would make reliably available when people need it.",
    "wrong": [
      [
        "A reservoir's benefit should be estimated mainly from the difference between storm-season inflow and growing-season demand for irrigation.",
        "Text 1 emphasizes timing; Text 2 argues that sediment and evaporation would materially limit what that estimate delivers."
      ],
      [
        "Water reuse offers the more reliable supply because it avoids the seasonal mismatch that makes river storage ineffective in this region.",
        "Text 2 favors reuse, but Text 1 argues that river storage would address the mismatch rather than being ineffective because of it."
      ],
      [
        "The region's growing-season shortages show that its annual river inflow is too small to support existing irrigation without new water sources.",
        "Both texts accept substantial annual inflow. Timing and losses, rather than a demonstrated insufficient annual total, drive their arguments."
      ]
    ],
    "anchors": [
      "carry that water into the growing season",
      "these losses permit"
    ],
    "why": "Text 1 translates annual inflow into usefulness through storage across seasons. Text 2 further conditions usefulness on the proposed storage's losses. Neither can judge dependable supply from the annual total alone, although they disagree about whether a reservoir is the right investment."
  },
  {
    "scene": "cs-common-instrument-audible-evidence",
    "text1": "The museum's fragile Neral harp should remain unplayed. Build a working copy from its measurements instead. The tuning chart alone does not explain why its maker paired strings of different thicknesses; hearing the replica's interacting overtones could distinguish explanations that the chart leaves equally plausible.",
    "text2": "A replica is worthwhile, but one carefully monitored session on the Neral harp is also needed. Small differences in aged wood may change which overtones reinforce one another. If a copy sounds unlike the original, an interpretation supported by the copy could explain the reconstruction rather than the maker's instrument.",
    "key": "Audible behavior can help discriminate between interpretations that the instrument's written and physical descriptions leave unresolved.",
    "wrong": [
      [
        "A reconstruction is adequate for testing historical interpretations when its dimensions and tuning match those recorded for the original.",
        "Text 1 relies on a copy, but Text 2 identifies aged material as a possible source of acoustically significant differences."
      ],
      [
        "The original must be played before a replica can reveal anything about why the maker combined strings of different thicknesses.",
        "Text 2 asks for a comparison, but Text 1 explicitly favors learning through a replica without playing the original."
      ],
      [
        "Aged wood is the main determinant of the instrument's overtones, making the surviving tuning chart less useful than measurements of its frame.",
        "Text 2 identifies a possible material effect; neither text establishes its primacy or ranks the chart below frame measurements."
      ]
    ],
    "anchors": [
      "distinguish explanations",
      "explain the reconstruction"
    ],
    "why": "The first author seeks sound that can separate otherwise plausible interpretations. The second worries about whether that sound is evidence about the right object. Both treat audible behavior as constraining interpretation beyond what descriptions alone settle."
  },
  {
    "scene": "cs-common-newspaper-silence",
    "text1": "The Bracken Gazette's failure to mention the mill strike should not outweigh the workers' letters. During the same week, its reports of other disputes also disappear while official notices expand. The editor may have traded coverage for continued access to the authorities who supplied those notices.",
    "text2": "The Gazette's blank advertising columns offer a different explanation. Merchants threatened to withdraw advertisements from papers sympathetic to the strikers, and several did withdraw them. The missing coverage may record commercial pressure rather than an arrangement with officials; counting unreported strikes would miss that distinction.",
    "key": "What the newspaper omits may reveal pressures on its production rather than provide a direct record of which events occurred.",
    "wrong": [
      [
        "The Gazette's dependence on official notices is a stronger explanation for missing strike reports than merchants' advertising decisions.",
        "This favors Text 1's explanation, while Text 2 uses advertising evidence to propose a different source of pressure."
      ],
      [
        "Workers' letters provide a sufficiently complete account of the strike to make the Gazette's reporting choices historically uninformative.",
        "Text 1 defends the letters against an argument from silence, but both texts find the newspaper's omissions informative about institutional pressures."
      ],
      [
        "The absence of strike coverage shows that merchants and government officials coordinated their efforts to influence the Gazette's editor.",
        "The texts propose distinct possible pressures; neither establishes that the two groups coordinated their actions."
      ]
    ],
    "anchors": [
      "traded coverage",
      "commercial pressure"
    ],
    "why": "One author reads silence through possible dependence on official access; the other reads it through advertising pressure. Their rival explanations both treat omission as a product of the newspaper's circumstances, rather than a transparent measure of whether the strike occurred."
  },
  {
    "scene": "cs-common-plankton-sampling-order",
    "text1": "To map plankton around Arven Bay, alternate which station is visited first each day. A ship that always works west to east reaches eastern stations after the afternoon current arrives. Reversing the order on alternate days would keep the map from assigning that current's contribution only to the eastern water.",
    "text2": "Repeatedly visit fewer Arven stations at the same hour instead. The afternoon current varies among days, so simply alternating the route may distribute its effects unevenly. Matching observation times would sacrifice some coverage but make persistent differences among stations easier to identify.",
    "key": "A difference between samples taken at separate stations can reflect when the ship arrived as well as a persistent difference between places.",
    "wrong": [
      [
        "Alternating a ship's route removes the influence of daily currents without reducing how much of the bay a survey can cover.",
        "Text 1 proposes alternation, but Text 2 specifically doubts that it adequately distributes variable current effects."
      ],
      [
        "Reducing the number of stations produces a more representative map because nearby stations respond identically to afternoon currents.",
        "Text 2 accepts less coverage to control timing, not because nearby stations are identical or fewer stations are inherently more representative."
      ],
      [
        "The afternoon current chiefly affects the eastern stations, so those stations should be compared only with one another across days.",
        "Text 1 warns that route timing could falsely assign the current's contribution to the east; neither text establishes that location restriction."
      ]
    ],
    "anchors": [
      "after the afternoon current arrives",
      "persistent differences"
    ],
    "why": "The authors propose different ways of preventing visit time from masquerading as a stable spatial difference. Alternation distributes timing across places, while matched hours hold it more constant. Their disagreement about design presupposes that a station comparison can mix temporal and spatial effects."
  }
];

  const ctcCommonGround = {
    ...CTC_BASE,
    id: "cross-text-common-ground",
    subskill: "agreement",
    difficulty: "Hard",
    title: "Infer a shared premise beneath contrasting arguments",
    recognize: "Compare the role of the evidence in each argument. Infer the premise both arguments require, keeping it narrower than either author's preferred conclusion.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["one-text-only", "too-broad", "misattributed-view"],
    build(t) {
      const topic = t.pick(CTC_COMMON_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: "Based on the texts, both authors would most likely agree with which statement?",
        correct: topic.key,
        wrong: topic.wrong,
        explanation: topic.why,
        steps: ["Identify the conclusion and the reason offered by each author.","Ask what must be true for both sets of reasons to matter, even though the conclusions differ.","Check the proposed shared premise against both arguments without importing one author's preferred explanation or remedy."],
        principles: ["Two arguments can share a standard or assumption while applying it through different evidence and recommendations.","Common ground is a supported intersection, not a compromise between the conclusions or a detail merely absent from one text."],
        trap: "Promoting one author's explanation into common ground, or choosing a plausible generalization that neither argument requires.",
        hint: "What makes each author's evidence relevant, despite their disagreement?",
        estimatedSeconds: 105,
        verify: () => {
          const [one, two] = CTC_split(content);
          const choices = [topic.key, ...topic.wrong.map(([text]) => text)];
          return one.includes(topic.anchors[0]) && two.includes(topic.anchors[1]) &&
            one.length + two.length <= 900 && choices.every((choice) => choice.length <= 160) &&
            topic.wrong.length === 3 && new Set(choices).size === 4;
        },
      };
    },
  };

  // Each response preserves one evidential step but limits a further
  // inference. Rival responses misplace the preserved step or the limit.
  const CTC_PARTIAL_TOPICS = [
  {
    "scene": "cs-partial-manuscript-material-date",
    "critic": "Lea Moss",
    "claimant": "Rao",
    "claim": "conclusion about when the translation was made",
    "text1": "The paper and ink of the oldest surviving Varen translation both match supplies used before 1430. Historian Dev Rao therefore dates the translation itself to that period. Its unusually modern vocabulary, Rao argues, shows that expressions thought to be later inventions were already circulating before 1430.",
    "text2": "Book historian Lea Moss found unmarked sheets and sealed ink jars from the same early supplies in the translator's workshop, which operated into the 1460s. Several accounts written there after 1450 use those materials. The vocabulary dating comes from independently dated letters, rather than from an assumption about this manuscript.",
    "key": "She would distinguish the age of the writing materials from the act of writing, leaving the vocabulary's later chronology unchallenged.",
    "wrong": [
      [
        "She would accept the early date of the writing but question whether the vocabulary appears often enough to establish widespread circulation.",
        "Moss's evidence bears on whether old supplies date the writing at all, not on how frequently the vocabulary appears."
      ],
      [
        "She would use the manuscript's vocabulary to redate its paper and ink, preserving the usual chronology by revising the material analysis.",
        "Her dated accounts demonstrate later use of old materials; she does not dispute the material analysis or claim the materials themselves are later."
      ],
      [
        "She would separate the translation's date from its vocabulary, accepting that early expressions survived in the workshop's later accounts.",
        "The accounts show reuse of old supplies, not early existence of these expressions. This grants Rao's disputed linguistic chronology without evidence."
      ]
    ],
    "anchors": [
      "dates the translation itself",
      "use those materials"
    ],
    "why": "Rao moves from the materials' age to the writing's date and then revises linguistic history. Moss's later accounts on old supplies interrupt the first step. Her independent dating evidence for the vocabulary therefore need not be revised, even if the paper and ink are genuinely early."
  },
  {
    "scene": "cs-partial-tree-cooling-mechanism",
    "critic": "Ana Voss",
    "claimant": "Sen",
    "claim": "explanation for the cooling measured beneath trees",
    "text1": "Sensors under street trees in Belwick recorded cooler afternoon air than sensors over bare pavement. Researcher Imani Sen credits the trees' interception of sunlight. Since cooling increased with canopy cover, Sen proposes choosing dense crowns rather than enlarging the soil beds around trees already planted.",
    "text2": "Ana Voss installed artificial screens matching the trees' shade, yet air beneath them remained warmer. Trees rooted in recently watered beds produced the largest difference; with dry soil, their advantage over the screens nearly vanished. The original sensors were accurate, and the screens blocked the same fraction of incoming sunlight as the crowns.",
    "key": "She would retain the measured cooling while questioning whether shade alone explains it well enough to justify favoring crowns over soil beds.",
    "wrong": [
      [
        "She would accept shade as the source of the trees' extra cooling but question whether the original sensors measured its magnitude accurately.",
        "Voss affirms sensor accuracy and matches shade in her controls; the tree-screen difference varies with soil moisture rather than measurement error."
      ],
      [
        "She would treat the watered trees' extra cooling as support for denser crowns while limiting Sen's explanation to trees growing in moist soil.",
        "Watered trees outperform equally shaded screens. That result raises a mechanism beyond shade; it does not specifically favor denser crowns."
      ],
      [
        "She would prefer screens to tree planting because equal shade isolates the cooling mechanism, while accepting Sen's measurements beneath trees.",
        "Matching shade isolates a difference to investigate, but screens are warmer. Voss does not support preferring them to the cooler trees."
      ]
    ],
    "anchors": [
      "rather than enlarging the soil beds",
      "with dry soil"
    ],
    "why": "Voss retains Sen's observed temperature difference and controls the amount of shade. The remaining advantage depends on soil moisture, so interception of sunlight alone is insufficient to justify prioritizing canopy density over soil conditions."
  },
  {
    "scene": "cs-partial-stage-invention-diffusion",
    "critic": "Clara Vale",
    "claimant": "Orin",
    "claim": "account of the manual's historical importance",
    "text1": "Director Elian Orin calls the 1752 Lantern Manual the invention of coordinated scene changes: its diagrams show scenery moving while actors continue speaking. Theater accounts begin using the manual's term, 'running change,' soon afterward. Orin sees both the technique and its spread as achievements of the manual's author.",
    "text2": "Historian Clara Vale found a 1738 stagehand's diary describing scenery shifted while actors continued speaking. Its sketches resemble the manual's diagrams, although it uses no shared term. After 1752, companies in several cities ordered the manual together with equipment suited to that procedure.",
    "key": "She would associate the manual with organizing and spreading an existing practice, while separating that contribution from inventing the technique.",
    "wrong": [
      [
        "She would attribute the technique's invention to the manual but its later spread to equipment already ordered before the manual appeared.",
        "The diary places the procedure before the manual, whereas the cited equipment orders follow its publication."
      ],
      [
        "She would accept that the technique predates the manual while treating the later shared term as evidence that companies changed only their vocabulary.",
        "The post-publication orders include equipment suited to the procedure, not just adoption of a name."
      ],
      [
        "She would credit the manual with standardizing equipment while treating the diary's different terminology as evidence of a different stage procedure.",
        "The diary describes the procedure and contains similar sketches; absence of the later term does not establish a different technique."
      ]
    ],
    "anchors": [
      "both the technique and its spread",
      "1738 stagehand's diary"
    ],
    "why": "The earlier diary separates the procedure's existence from the manual's publication. The later cross-city orders still support a role for the manual in organizing and spreading that procedure. Vale's evidence preserves a historical contribution while narrowing what kind of contribution it was."
  },
  {
    "scene": "cs-partial-bird-social-learning",
    "critic": "Nora Dell",
    "claimant": "Kess",
    "claim": "interpretation of the juveniles' learning",
    "text1": "Young crescent jays open seed boxes sooner after watching adults do so. Biologist Arun Kess observes that adults often pause beside the catch and interprets those pauses as lessons showing juveniles the required motion. The faster learning, Kess argues, documents deliberate instruction rather than merely learning near other birds.",
    "text2": "Nora Dell gave juveniles boxes adults had handled out of sight. These juveniles learned just as quickly as watchers, whereas untouched boxes took longer. Adult contact left a visible mark on the catch, but juveniles used several different opening motions. Dell also recorded the pauses when no juvenile was nearby.",
    "key": "She would allow adults to facilitate learning while finding that the evidence need not involve either a demonstrated motion or an intended lesson.",
    "wrong": [
      [
        "She would accept that adults demonstrate the required motion while treating their pauses as accidental rather than intentionally instructive.",
        "Juveniles benefit without seeing an adult, and they use different motions. Dell's evidence does not preserve the claim that a required motion was demonstrated."
      ],
      [
        "She would accept deliberate instruction through the marks while questioning whether juveniles can transfer the lesson to untouched boxes.",
        "Marks can draw attention without being deliberately produced as instruction. Transfer to untouched boxes was not the comparison reported."
      ],
      [
        "She would separate the adult pauses from instruction while attributing faster learning to watching successful openings rather than inspecting marked catches.",
        "Juveniles given boxes handled out of sight learn equally quickly, so observation of successful opening is unnecessary in Dell's comparison."
      ]
    ],
    "anchors": [
      "deliberate instruction",
      "handled out of sight"
    ],
    "why": "The adults still influence learning by leaving marked catches. Yet the juveniles need not watch a motion, they do not all copy one, and the pauses also occur without pupils. Combining those findings challenges both components of Kess's teaching interpretation without denying adult-facilitated learning."
  },
  {
    "scene": "cs-partial-charter-capacity-practice",
    "critic": "Mina Holt",
    "claimant": "Daro",
    "claim": "inference from the guild rolls",
    "text1": "After the 1684 Neris charter allowed women to sign workshop contracts, women's names became common in the guild's master rolls. Historian Pavel Daro reads this rise as evidence that large numbers of women immediately began managing independent businesses. The legal reform, he concludes, rapidly transformed daily commercial authority.",
    "text2": "Mina Holt found some women signing contracts without male guarantors under the new charter. Most female names in the master rolls, however, carry an estate symbol: guild clerks retained a dead master's widow as the account holder while an appointed steward ran the shop. Earlier rolls listed those accounts under the deceased husband's name.",
    "key": "She would recognize a new capacity exercised by some women while questioning whether the changed rolls measure a comparable rise in independent management.",
    "wrong": [
      [
        "She would accept the rolls as evidence of expanding female management while attributing that expansion to inheritance rather than the new charter.",
        "Holt's estate entries name account holders whose shops were run by stewards, so they do not establish expanding female management by inheritance."
      ],
      [
        "She would accept that the charter expanded women's legal capacity while treating contracts without guarantors as evidence of earlier independent management.",
        "The contracts are explicitly under the new charter; Holt does not use them to date the practice before the reform."
      ],
      [
        "She would distinguish the rolls from management while interpreting the estate symbol as a restriction that prevented women from signing contracts.",
        "The symbol marks a type of account, not a prohibition. The independently signed contracts show that some women exercised the new capacity."
      ]
    ],
    "anchors": [
      "rapidly transformed daily commercial authority",
      "Earlier rolls listed"
    ],
    "why": "The contracts support both a new legal capacity and its exercise by some women. The master-roll increase also contains an administrative relabeling of estates, however, so it cannot straightforwardly measure the claimed broad transformation in who managed businesses."
  },
  {
    "scene": "cs-partial-borrowed-verbs-grammar",
    "critic": "Sera Lin",
    "claimant": "Marek",
    "claim": "claim of grammatical convergence",
    "text1": "Speakers of coastal Oren increasingly use verbs borrowed from neighboring Talic. Linguist Leon Marek notes that these words describe ordinary actions, not just imported objects. Because such basic verbs belong to the core of a language, he interprets their spread as evidence that Oren grammar is converging with Talic grammar.",
    "text2": "Sera Lin tracked the borrowed verbs in conversations between Oren speakers. Each receives Oren's usual endings for past and future events. Talic instead marks time with separate words placed before verbs; those words do not accompany the loans in Lin's recordings. The imported verbs are frequent even among speakers who cannot converse in Talic.",
    "key": "She would accept extensive vocabulary borrowing while reading the treatment of those words as evidence that Oren retains its own grammatical pattern.",
    "wrong": [
      [
        "She would accept grammatical convergence while limiting it to the borrowed verbs, since speakers attach the endings used by their own language.",
        "Attaching Oren's endings exemplifies continuity with Oren, not adoption of Talic's separate time words."
      ],
      [
        "She would accept borrowing among bilingual speakers while treating the other speakers' use of the verbs as evidence that the words originated in Oren.",
        "Use by people who cannot converse in Talic shows diffusion of the loans; it does not change the stated origin of the words."
      ],
      [
        "She would accept that Oren's old verb endings remain while treating the borrowed action meanings as the grammatical feature supplied by Talic.",
        "The action meanings are lexical content. The contrast Lin supplies concerns how time is grammatically marked, and that remains Oren's pattern."
      ]
    ],
    "anchors": [
      "Oren grammar is converging",
      "separate words placed before verbs"
    ],
    "why": "Marek infers grammatical change from borrowing in basic vocabulary. Lin confirms broad use of those loans but shows that Oren speakers place them in an unchanged Oren time-marking pattern, rather than importing Talic's grammatical device."
  },
  {
    "scene": "cs-partial-transit-chain-access",
    "critic": "Rhea Noor",
    "claimant": "Benn",
    "claim": "assessment of the transit upgrade",
    "text1": "New platform ramps cut wheelchair boarding time on Leston's central line to the average for other passengers. Planner Tomas Benn calls this equalization proof that the upgrade has removed the wheelchair users' access disadvantage across the network. Boarding trials covered every central-line station during daytime service.",
    "text2": "Rhea Noor accompanied wheelchair users making complete journeys. They boarded central-line trains within the reported times, but several destination branches still required steps. An accessible detour was available only before six; riders leaving work later could make the outward journey but not the return. None of these trips required faster boarding.",
    "key": "She would preserve the boarding result but assess network access through complete feasible journeys, including transfers and the timing of return travel.",
    "wrong": [
      [
        "She would preserve the boarding result but treat the remaining disadvantage as evidence that ramps must reduce wheelchair boarding below the average.",
        "Noor states that faster boarding would not solve the observed barriers, which concern branch access and the availability of return routes."
      ],
      [
        "She would accept network-wide access during daytime while limiting Benn's result to commuters whose trips begin after the accessible detour closes.",
        "Some destination branches require steps even in daytime; late return travel can affect a trip that began earlier."
      ],
      [
        "She would accept the central-line result while inferring that the evening detour causes slow transfers because its ramps were omitted from the trials.",
        "The reported problem is the detour's unavailability after six, not slow transfers or an unmeasured ramp's boarding time."
      ]
    ],
    "anchors": [
      "across the network",
      "not the return"
    ],
    "why": "Noor's trips reproduce the boarding improvement, but whole journeys involve other stations and times. The scope of Benn's measurement is therefore narrower than the access conclusion: equal boarding speed cannot establish that complete outward and return routes are feasible."
  },
  {
    "scene": "cs-partial-ash-source-volume",
    "critic": "Evan Kori",
    "claimant": "Rell",
    "claim": "estimate of the eruption's scale",
    "text1": "A thick ash bed in the Dalen basin contains glass chemically matched to Mount Sere's eruption of 820. Geologist Mara Rell takes the bed's unusual thickness as evidence that this eruption expelled far more ash than neighboring volcanoes did. Its single chemical signature, she argues, rules out several small eruptions accumulating there.",
    "text2": "Evan Kori recovered the same glass from thin patches on the basin's slopes. Grain layers in the thick valley bed run sideways into channels cut in older soil, while the slope patches retain the even surface expected when ash falls from above. No later eruption is needed to explain the valley layers' chemical uniformity.",
    "key": "He would retain the common eruption source while questioning whether ash concentrated within the basin measures the amount expelled by that eruption.",
    "wrong": [
      [
        "He would retain the large-volume estimate while interpreting the valley channels as evidence that several eruptions shared the same glass chemistry.",
        "Kori explicitly says no later eruption is needed; the channels suggest redistribution of the same ash, which challenges the thickness-to-volume inference."
      ],
      [
        "He would accept the common source while using thin slope patches to conclude that Mount Sere necessarily expelled less ash than neighboring volcanoes.",
        "Redistribution weakens the estimate from local thickness but does not establish a reversed ranking of total eruption volumes."
      ],
      [
        "He would accept ash redistribution while treating the valley bed's uniform chemistry as stronger evidence of eruption scale than its thickness.",
        "Uniform chemistry identifies a source, not the amount expelled. Replacing thickness with chemistry does not support a volume estimate."
      ]
    ],
    "anchors": [
      "expelled far more ash",
      "run sideways into channels"
    ],
    "why": "Chemical matches and the absence of a required later eruption preserve a common source. Sideways layers in channels, contrasted with intact slope deposits, suggest that the basin concentrated ash after it fell. Source identification can thus remain sound while local thickness fails to establish comparative eruption volume."
  },
  {
    "scene": "cs-partial-narrator-author-stance",
    "critic": "Ada Finch",
    "claimant": "Miro",
    "claim": "reading of the novel's attitude toward rank",
    "text1": "In Livia Rusk's novel The Upper Table, a servant repeatedly calls his master's privileges 'the natural order.' Critic Jon Miro finds no sarcasm in the servant's voice and reads those sincere declarations as the novel's defense of inherited rank. The servant's admiration, Miro argues, supplies its moral center.",
    "text2": "Ada Finch notes that the servant carefully excuses his master's wasted meals, then applies the same reasoning to a hungry child dismissed from the kitchen. The child cannot hear his explanation. The scene ends with the servant praising the household's generosity beside an untouched pile of food the reader has just watched being discarded.",
    "key": "She would allow the servant's praise to be sincere while locating criticism of rank in the contrast between his explanations and the narrated events.",
    "wrong": [
      [
        "She would treat the servant's sincere praise as the novel's position while reading the discarded food as criticism confined to one master's habits.",
        "The repeated reasoning about the hungry child and inherited privilege exposes a larger contradiction than the master's individual wastefulness."
      ],
      [
        "She would locate criticism of rank in the servant's deliberate sarcasm while accepting Miro's view that the servant supplies the novel's moral judgment.",
        "Finch's evidence need not make the servant sarcastic or morally authoritative; the reader can perceive the contradiction that his sincere account misses."
      ],
      [
        "She would separate the servant's view from the novel's while treating the child's inability to hear him as evidence that the servant rejects his own excuse.",
        "The child's inability to hear does not show self-rejection by the servant. He ends by praising generosity, while the events undermine that description."
      ]
    ],
    "anchors": [
      "those sincere declarations",
      "the reader has just watched"
    ],
    "why": "Miro moves from sincerity of a character's speech to endorsement by the novel. Finch places that speech against actions visible to the reader, making critical irony possible without sarcastic intention in the servant. The view attributed to the character need not be the work's moral judgment."
  },
  {
    "scene": "cs-partial-varnish-pigment-history",
    "critic": "Ivo Chen",
    "claimant": "Lera",
    "claim": "claim to have recovered the painting's original colors",
    "text1": "Cleaning yellow varnish from Nella Tor's Harbor Morning revealed blue water where viewers had long seen green. Conservator Eva Lera identifies the removed coating as the source of the color distortion and describes the cleaned painting as a recovery of Tor's original palette, requiring no speculative repainting.",
    "text2": "Ivo Chen analyzed matched blue passages, one long exposed and one formerly under the frame. Both carried equally yellow varnish, but after cleaning the covered passage remained more intense. Pigment particles in the exposed passage had lost a component still present beneath the frame. Chen found no later paint in either sample.",
    "key": "He would credit cleaning with removing one alteration while distinguishing that correction from recovering color also changed within the original pigment.",
    "wrong": [
      [
        "He would credit cleaning with recovering the original palette while explaining the remaining intensity difference through unequal varnish discoloration.",
        "The varnish was equally yellow, and the chemical difference remains after cleaning. Unequal varnish does not explain it."
      ],
      [
        "He would accept the varnish's yellowing while treating the protected passage's stronger blue as evidence that an earlier restorer repainted it.",
        "Chen finds no later paint in either passage, so the protected sample cannot be treated as a known repainting."
      ],
      [
        "He would distinguish the two pigment histories while concluding that the exposed passage, rather than the protected one, preserves the less altered blue.",
        "The exposed pigment has lost a component retained beneath the frame, which points toward greater alteration in the exposed passage."
      ]
    ],
    "anchors": [
      "a recovery of Tor's original palette",
      "lost a component"
    ],
    "why": "The blue emerging after varnish removal supports one correction to the painting's appearance. Equal coatings and a remaining chemical difference isolate another alteration in the original exposed pigment. The cleaning can therefore remove yellowing without restoring every original color, and the absence of later paint rules out the offered repainting account."
  }
];

  const ctcPartialAgreement = {
    ...CTC_BASE,
    id: "cross-text-partial-agreement",
    subskill: "response between texts",
    difficulty: "Hard",
    title: "Map a qualified response onto another argument's inferential steps",
    recognize: "Separate Text 1's observations from the further claims built on them, then determine which link Text 2's evidence changes and which it preserves.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["one-text-only", "too-broad", "misattributed-view"],
    build(t) {
      const topic = t.pick(CTC_PARTIAL_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: `Based on the texts, how would ${topic.critic} (Text 2) most likely respond to ${topic.claimant}'s ${topic.claim} in Text 1?`,
        correct: topic.key,
        wrong: topic.wrong,
        explanation: topic.why,
        steps: ["Separate Text 1's observed finding from its claim about origin, mechanism, scope, or significance.","Determine what Text 2's evidence supports without assuming it rejects the whole argument.","Map that evidence back onto the exact inferential step it limits, preserving the steps that remain supported."],
        principles: ["A finding may remain sound while the explanation, measurement scope, or attribution drawn from it changes.","A response must assign the concession and objection to the correct claims; a reasonable qualification on the wrong claim is still incorrect."],
        trap: "Accepting a qualified-sounding response that shifts the objection to a different inference or attributes a view to the wrong speaker.",
        hint: "Which step connects Text 1's evidence to its conclusion, and what does Text 2 change about that step?",
        estimatedSeconds: 105,
        verify: () => {
          const [one, two] = CTC_split(content);
          const choices = [topic.key, ...topic.wrong.map(([text]) => text)];
          return one.includes(topic.anchors[0]) && two.includes(topic.anchors[1]) &&
            one.length + two.length <= 900 && choices.every((choice) => choice.length <= 160) &&
            topic.wrong.length === 3 && new Set(choices).size === 4;
        },
      };
    },
  };

  // Apply qualified criteria to evidence that supports only part of a
  // second writer's inference. Each scene distinguishes the roles of
  // multiple observations; the alternatives misassign or overextend them.
  const CTC_CONDITION_TOPICS = [
  {
    "scene": "cs-condition-drainage-petitions",
    "author": "Sato",
    "target": "Vale's assessment of the drainage petitions",
    "text1": "Historian Emi Sato cautions that similar petitions need not express independently reached demands. Shared wording can come from a conventional form; a distinctive practical proposal is stronger evidence of coordination. Yet even that proposal establishes dependence only among petitions written after a possible source became available. The first petition may still document a demand reached locally.",
    "text2": "Twelve villages petitioned for a movable gate at the same bend in the river. Martin Vale regards their different wording as evidence of independent agreement. The earliest petition predates a district circular describing that gate; the other eleven followed the circular. All twelve also use the customary opening for petitions, though no standard form mentions movable gates.",
    "conditionAnchor": "after a possible source became available",
    "detailAnchor": "predates a district circular",
    "key": "By treating the first request as possibly local but questioning the independence of the eleven later requests",
    "capitulate": [
      "By treating the varied wording as evidence that each village devised the gate proposal without a common source",
      "Different wording does not eliminate dependence on the circular's distinctive practical proposal."
    ],
    "overreach": [
      "By treating the shared gate proposal as evidence that the circular supplied the demand in every village's petition",
      "The earliest petition predates the circular, so that circular could not have supplied its demand."
    ],
    "ground": [
      "By treating the customary opening as stronger evidence of coordinated demands than the proposed location of the gate",
      "Sato distinguishes conventional wording from a distinctive practical proposal; the opening is the weaker evidence."
    ],
    "misapply": [
      "By treating the early petition's date as evidence that the later villages agreed before the circular reached them",
      "The early date applies to one petition, not to the eleven petitions that followed the circular."
    ],
    "why": "Sato's distinction requires combining the unusual shared proposal with the dates of its possible sources. The earliest petition may be independent of the circular, but eleven later petitions cannot count as eleven independent confirmations merely because their wording differs",
    "rationale": "Separates wording from substantive dependence, then applies a temporal exclusion to only one subset of the evidence. The tempting inference wrongly extends the earliest case's independence to the whole set."
  },
  {
    "scene": "cs-condition-memory-cues",
    "author": "Morgan",
    "target": "Desai's interpretation of the memory experiment",
    "text1": "Psychologist Leah Morgan distinguishes strengthening a memory from improving access to it. Practice can link a fact more closely to the prompt used during study, producing an advantage even weeks later. To argue that the fact itself has become more available, she looks for an advantage with a new prompt as well. Changing the delay while retaining the prompt does not distinguish the two explanations.",
    "text2": "Arun Desai's students practiced historical facts beside portraits. A month later, they recalled more facts than unpracticed students when shown those portraits. Desai calls the delay evidence of stronger memories rather than better prompting. In a second test, unfamiliar descriptions identified the same historical figures, but practiced and unpracticed students recalled equal amounts.",
    "conditionAnchor": "an advantage with a new prompt as well",
    "detailAnchor": "unfamiliar descriptions",
    "key": "By attributing the delayed advantage to better access through the portraits rather than to an advantage across prompts",
    "capitulate": [
      "By accepting the month-long delay as evidence that practice strengthened the facts independently of their study prompts",
      "Morgan explicitly says an advantage with the old prompt can persist; delay alone does not separate the explanations."
    ],
    "overreach": [
      "By concluding that the second test cancels the first result and shows that practicing the facts produced no lasting benefit",
      "The portrait advantage lasted a month. The second test limits its interpretation rather than erasing it."
    ],
    "ground": [
      "By regarding equal recall with new descriptions as evidence that those descriptions preserved the portrait advantage",
      "Equal recall is the absence of the practiced group's advantage, not evidence that it transferred to a new prompt."
    ],
    "misapply": [
      "By proposing a longer delay with the portraits to determine whether the benefit extends beyond the original study prompts",
      "Keeping the original prompts does not test whether the benefit extends to new ones, regardless of the delay."
    ],
    "why": "The advantage survives a delay but disappears when the prompt changes. Morgan allows a lasting improvement in access through a practiced cue, so these findings distinguish a cue-specific benefit from the broader memory improvement Desai claims",
    "rationale": "Combines a delayed result with a cross-prompt comparison, recognizing that persistence and generality are different dimensions of the proposed explanation."
  },
  {
    "scene": "cs-condition-news-provenance",
    "author": "Adeyemi",
    "target": "Cole's conclusion about the expanded news service",
    "text1": "Media scholar Tola Adeyemi distinguishes a variety of opinions from independent evidence. Publishers may disagree while relying on one reporting chain. A shared unusual error can expose that dependence, whereas agreement on a verified fact cannot. Dependence limits how many confirmations the reports supply; it does not by itself show that the publishers' judgments are alike.",
    "text2": "A news service added eight separately owned outlets. Miriam Cole says their conflicting editorials give readers eight independent confirmations of a disputed speech. Each outlet's report contains the same mistranslation of an obscure phrase, traceable to one wire report. Their editorials nevertheless disagree about whether the speaker's policy would work.",
    "conditionAnchor": "A shared unusual error",
    "detailAnchor": "the same mistranslation",
    "key": "By separating the outlets' differing policy judgments from the shared reporting chain behind their accounts of the speech",
    "capitulate": [
      "By accepting the conflicting editorials as evidence that the outlets obtained independent accounts of the disputed speech",
      "Disagreement about policy does not establish independent evidence for what the speaker said."
    ],
    "overreach": [
      "By treating the shared mistranslation as evidence that the outlets' conflicting policy judgments are merely apparent",
      "A shared reporting error establishes dependence in the evidence, not agreement in editorial judgment."
    ],
    "ground": [
      "By treating separate ownership as stronger evidence of independent reporting than a shared error is of dependence",
      "Adeyemi evaluates the reporting chain; different owners can still rely on a common source."
    ],
    "misapply": [
      "By discounting the shared mistranslation because reports must agree on a speech before they can independently confirm it",
      "Agreement on a verified fact may be innocent, but the shared feature here is an unusual error."
    ],
    "why": "The uncommon shared error links the factual reports to one source, so their number overstates independent confirmation. Their policy disagreements concern a different kind of diversity and need not be dismissed",
    "rationale": "Applies a diagnostic exception for shared errors while maintaining the theory's boundary between evidential independence and diversity of judgment."
  },
  {
    "scene": "cs-condition-estate-narration",
    "author": "Bell",
    "target": "Mira's reading of the estate episode",
    "text1": "Critic Owen Bell argues that a narrator's later confirmation of an event does not necessarily endorse a character's explanation of it. A narrative may let a suspicious character describe an act in the language of selfishness, then establish that the act had useful consequences. To infer agreement about motives, readers need more than agreement that the act occurred or helped someone.",
    "text2": "In The East Orchard, Len calls his aunt's gift of land 'a purchase of our gratitude.' The narrator later explains that the land saved the family from eviction but reveals that the aunt gave it anonymously, expecting Len never to discover its source. Critic Ana Mira treats the narrator's account of the rescue as confirmation of Len's assessment of the gift.",
    "conditionAnchor": "agreement about motives",
    "detailAnchor": "expecting Len never to discover its source",
    "key": "By accepting the gift's helpful effect while finding the aunt's expectation at odds with the motive Len assigns her",
    "capitulate": [
      "By reading the family's rescue as confirmation that the aunt successfully purchased the gratitude Len says she wanted",
      "The beneficial effect does not confirm the motive, and the aunt expected her identity to remain unknown."
    ],
    "overreach": [
      "By reading the aunt's anonymity as evidence that Len was mistaken about the land's role in saving the family from eviction",
      "The narrator explicitly confirms the land's helpful effect; anonymity bears on the proposed motive."
    ],
    "ground": [
      "By withholding judgment on the gift's effect because the narrator's account of it differs from Len's account of the aunt",
      "The two accounts concern different aspects of the gift; the effect is confirmed even though the motive is challenged."
    ],
    "misapply": [
      "By accepting Len's explanation of the aunt's motive while treating the narrator's account as a correction of the gift's consequences",
      "The narrator confirms the consequences and supplies evidence against Len's explanation of the motive, not the reverse."
    ],
    "why": "Bell separates a confirmed outcome from a character's explanation of it. The rescue establishes the gift's effect, while the aunt's expectation of remaining unknown undermines the idea that she intended to secure the family's gratitude",
    "rationale": "Separates narration from a character's attributed interpretation and integrates two later details that bear on different parts of the interpretation."
  },
  {
    "scene": "cs-condition-flood-layers",
    "author": "Iqbal",
    "target": "Reed's inference about storm frequency",
    "text1": "Geologist Farah Iqbal notes that a single storm can leave several sediment layers when tributaries deliver material at different times. Distinct mineral mixtures identify different sources, not necessarily different storms. Layer counts become evidence of storm frequency only when another marker separates the episodes; a continuous deposit can instead preserve the sequence of arrivals within one event.",
    "text2": "A lake core contains more mineral bands after a river was connected to two additional tributaries. Geologist Evan Reed infers that storms became more frequent. Each new band matches one of the tributaries' rocks. Pollen tracing a brief seasonal bloom runs continuously across several bands; in older deposits, pauses between flood episodes interrupt that pollen sequence.",
    "conditionAnchor": "another marker separates the episodes",
    "detailAnchor": "runs continuously across several bands",
    "key": "By treating several of the new bands as possible arrivals within one episode rather than as separate additions to the storm count",
    "capitulate": [
      "By taking the bands' distinct mineral mixtures as independent confirmation that the number of storm episodes increased",
      "Distinct mixtures identify sources, and Iqbal explicitly distinguishes sources from separate storms."
    ],
    "overreach": [
      "By concluding that the uninterrupted pollen establishes that storms became less frequent after the tributaries were connected",
      "The pollen challenges counting every band as a storm; it does not establish a decline in overall storm frequency."
    ],
    "ground": [
      "By rejecting the tributary matches because a continuous pollen sequence rules out sediment arriving from different sources",
      "Continuous pollen can accompany successive arrivals from different tributaries within one event."
    ],
    "misapply": [
      "By counting only the bands with new mineral mixtures as separate storms and treating the pollen continuity as irrelevant",
      "A new source mixture does not supply the independent separation of episodes that Iqbal requires."
    ],
    "why": "The added tributaries supply a reason for more mineral bands without more storms. The uninterrupted seasonal pollen supplies evidence against treating several bands as separate episodes, so the apparent increase in storm count is not established",
    "rationale": "Reconciles two proxies with different evidential roles and compares the new deposits with an older interruption pattern, rather than treating each observed band as an event."
  },
  {
    "scene": "cs-condition-market-entry",
    "author": "Tran",
    "target": "Price's assessment of the market reform",
    "text1": "Economist Mai Tran treats new seller registrations as weak evidence of greater competition if existing firms control the entrants. Falling prices can help resolve the question, but only in relation to costs: when costs fall faster than prices, the gap between the two widens. Registration totals and lower prices can therefore both accompany sellers retaining more, rather than less, pricing power.",
    "text2": "After a licensing reform, more food sellers registered and retail prices fell. Julian Price calls the two changes mutually reinforcing evidence of stronger competition. Ownership records link most new sellers to established chains. Wholesale costs fell by more than retail prices, leaving a larger amount per item between what those chains paid and what they charged.",
    "conditionAnchor": "only in relation to costs",
    "detailAnchor": "link most new sellers to established chains",
    "key": "By questioning both measures: the registrations need not add independent rivals, and the price decline masks a wider cost-price gap",
    "capitulate": [
      "By accepting the price decline as confirmation that the new registrations represent independent competitive pressure",
      "The registrations need not represent independent firms, and the wider cost-price gap does not resolve that concern in Price's favor."
    ],
    "overreach": [
      "By concluding that the reform raised consumers' prices because established chains retained more money on each item",
      "Retail prices fell. An increase in the amount retained per item does not reverse that reported decline."
    ],
    "ground": [
      "By taking the wider gap between costs and prices as evidence that the ownership links no longer limit the registration measure",
      "Neither observation cancels the other: both weaken the proposed evidence for stronger competition."
    ],
    "misapply": [
      "By questioning the registration count but treating lower retail prices as evidence that established chains faced tighter margins",
      "Wholesale costs fell by more than retail prices, so margins widened rather than tightened."
    ],
    "why": "The ownership links limit what registrations reveal about independent entry. The cost comparison also reverses the implication Price draws from lower prices: the chains retain more per item, so the two indicators do not reinforce his conclusion",
    "rationale": "Evaluates two apparently convergent indicators under separate qualifications; the apparent corroboration fails for two interdependent reasons without requiring arithmetic."
  },
  {
    "scene": "cs-condition-transit-baseline",
    "author": "Ortega",
    "target": "Dean's assessment of the express bus",
    "text1": "Transport researcher Lucia Ortega distinguishes an observed change from a program's effect. A bus service can prevent car trips that would otherwise have been added as a town grows. Stable traffic is not by itself evidence of either success or failure. The comparison must also address changes shared with places without the service, rather than crediting the bus for a regional shift.",
    "text2": "Riverton added an express bus while new housing brought more commuters. Car journeys remained level, leading planner Simon Dean to call the service ineffective. Similar nearby towns added comparable housing but no buses; their car journeys rose. Fuel prices and remote-working rates changed similarly across the towns, and many new Riverton residents reported commuting by bus.",
    "conditionAnchor": "changes shared with places without the service",
    "detailAnchor": "their car journeys rose",
    "key": "By treating the comparison towns as evidence that level traffic may conceal car journeys prevented by the bus service",
    "capitulate": [
      "By accepting level car traffic as evidence that the bus attracted only people who would otherwise have avoided driving",
      "Level traffic does not identify what the bus passengers would otherwise have done, especially in a growing town."
    ],
    "overreach": [
      "By concluding that the bus caused car journeys to fall in Riverton because they increased in the comparison towns",
      "The comparison supports a reduction relative to an alternative outcome, not an observed fall in Riverton's journeys."
    ],
    "ground": [
      "By attributing Riverton's level traffic to remote working because that change also occurred in the towns without new buses",
      "Remote working changed similarly across towns, yet their traffic trends differed; that shared change does not explain the contrast."
    ],
    "misapply": [
      "By dismissing the comparison towns because a service can count as effective only when traffic falls below its earlier level",
      "Ortega explicitly allows a service to prevent added traffic without producing an observed decline."
    ],
    "why": "Ortega's standard compares the observed result with what could have happened without the service while considering shared changes. Growth and the comparison towns make added traffic a plausible alternative, so stable traffic can be consistent with a beneficial bus effect",
    "rationale": "Requires a counterfactual baseline, distinguishes relative prevention from an observed decline, and uses shared regional changes to evaluate the comparison."
  },
  {
    "scene": "cs-condition-instrument-agreement",
    "author": "Nasser",
    "target": "Wu's claim about the instruments' agreement",
    "text1": "Physicist Amal Nasser argues that agreement between different instruments tests only errors the instruments do not share. Different measuring mechanisms can still inherit an error from a common reference used to set their scales. Agreement after independent calibration is therefore stronger evidence than agreement after merely replacing one kind of detector with another.",
    "text2": "Two laboratories used optical and electrical instruments to estimate a material's expansion. Their results matched, which researcher David Wu says rules out an error in the measurements. Both laboratories had set their scales with rods from the same reference batch. Rechecking that batch against a separately maintained standard revealed a discrepancy in the rods' stated lengths.",
    "conditionAnchor": "errors the instruments do not share",
    "detailAnchor": "rods from the same reference batch",
    "key": "By finding that the different detectors could agree inaccurately through their dependence on a shared calibration reference",
    "capitulate": [
      "By accepting the different detecting mechanisms as evidence that the matched measurements cannot share a systematic error",
      "Different mechanisms do not eliminate an error inherited from a common calibration reference."
    ],
    "overreach": [
      "By concluding that the discrepancy proves both laboratories' estimates err by exactly the same amount and in the same direction",
      "The texts identify a shared source of possible error but do not describe how each instrument translates it into its estimate."
    ],
    "ground": [
      "By treating the separately maintained standard as a reason to prefer the optical estimate over the electrical estimate",
      "The reference check does not distinguish between the laboratories' estimates; both used the questioned batch."
    ],
    "misapply": [
      "By recommending another detector while retaining the reference rods to isolate whether calibration caused the agreement",
      "Retaining the suspect shared reference would preserve the possible common error instead of isolating it."
    ],
    "why": "The instruments differ in detection but share a calibration source, and the independent check questions that source. Their agreement therefore does not rule out a common measurement error, although the texts do not establish its exact effect on each estimate",
    "rationale": "Distinguishes two levels of methodological independence and limits the inference from a newly identified shared error without overclaiming its magnitude or direction."
  },
  {
    "scene": "cs-condition-court-compliance",
    "author": "Mensah",
    "target": "Hart's interpretation of the court records",
    "text1": "Legal historian Kojo Mensah separates a rule's appearance in verdicts from its power to change outcomes. If the new rule and local custom favor the same party, a verdict cannot distinguish obedience to one from obedience to the other. Cases in which they conflict are more revealing, provided later editors have not replaced the judges' original reasons with the new code's language.",
    "text2": "Elena Hart says a new inheritance code quickly displaced local custom because court summaries cite it repeatedly. Most listed cases would give the estate to the same person under either system. One conflicting case favors the heir selected by custom. A later clerk added the code references throughout the summaries; the original judgment in that case gives only a family precedent.",
    "conditionAnchor": "Cases in which they conflict",
    "detailAnchor": "A later clerk added the code references",
    "key": "By favoring the conflicting case's original reasoning over the later code citations as evidence of the court's guiding rule",
    "capitulate": [
      "By treating repeated code references as evidence that judges followed the new rule even when it conflicted with local custom",
      "The references were added later, and the conflicting case actually favors the heir selected by custom."
    ],
    "overreach": [
      "By inferring from the conflicting verdict that judges ignored the code in every case in which it agreed with local custom",
      "A case where the rules agree cannot reveal which rule guided the outcome; the conflicting verdict does not settle all other cases."
    ],
    "ground": [
      "By treating the many matching outcomes as stronger evidence for the code than the single conflicting outcome is for custom",
      "The matching outcomes do not discriminate between the rules, so their number does not make them stronger evidence."
    ],
    "misapply": [
      "By discounting the family precedent because the later code citations explain the original judge's reasons more explicitly",
      "The later citations cannot establish the original judge's reasons; the original judgment expressly invokes a family precedent."
    ],
    "why": "Mensah's test first excludes outcomes compatible with both rules, then asks whether the reasons are original. The conflicting case both follows custom and gives an original family precedent, whereas the repeated code references were supplied later",
    "rationale": "Combines discriminating-case logic with source chronology; a large amount of apparently convergent evidence loses force under both qualifications."
  },
  {
    "scene": "cs-condition-song-variation",
    "author": "Khan",
    "target": "Serrano's explanation of the singer's variations",
    "text1": "Music scholar Leila Khan distinguishes a singer's control of a tradition from the reason a particular performance varies. Returning to an earlier version on request suggests that departures are choices rather than failures of memory. But audience adaptation is a further claim: a singer may choose among stable versions for reasons unrelated to who is listening.",
    "text2": "Mateo Serrano heard a singer lengthen a ballad's farewell at a village gathering and shorten it at a market, attributing the difference to audience taste. In an earlier private rehearsal, she had alternated between those same endings. Asked after the market performance, she reproduced the longer ending without hearing a recording and described both versions as ones she regularly practiced.",
    "conditionAnchor": "audience adaptation is a further claim",
    "detailAnchor": "an earlier private rehearsal",
    "key": "By accepting the singer's control of both endings while finding that the comparisons do not establish why she chose between them",
    "capitulate": [
      "By accepting the singer's ability to reproduce both endings as evidence that she selected each to suit the audience present",
      "Reproduction shows control over the versions, not why one was selected for a particular audience."
    ],
    "overreach": [
      "By concluding that the earlier rehearsal rules out any influence of audience taste on the singer's later choice of ending",
      "The rehearsal provides another context for the versions but does not prove that audiences can never influence their selection."
    ],
    "ground": [
      "By treating the private rehearsal as evidence of faulty memory because the singer used two endings when no audience was present",
      "Alternation alone does not show faulty memory, and her unaided reproduction supports control of both versions."
    ],
    "misapply": [
      "By withholding judgment about the singer's control until a recording shows that the market and village performances were identical",
      "Control does not require identical performances; deliberate variation is precisely what the ability to return to a version can reveal."
    ],
    "why": "Unaided reproduction supports the singer's command of both versions, while their use in an earlier private rehearsal prevents the two public settings from establishing why she chose between them. That leaves audience influence possible without making it demonstrated",
    "rationale": "Separates evidence of intentional variation from evidence of its cause, preserving a possible audience effect while rejecting the stronger explanation."
  }
];


  const ctcConditionApplied = {
    ...CTC_BASE,
    id: "cross-text-condition-applied",
    subskill: "response between texts",
    difficulty: "Hard",
    title: "Qualified criteria applied to a second text's case",
    recognize:
      "Text 1 distinguishes what evidence can establish under particular conditions. Text 2 offers a case whose details support a narrower judgment than its commentator makes. Apply the criteria without transferring support between claims.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["misattributed-view", "extreme-language", "true-but-irrelevant", "opposite-stance"],
    build(t) {
      const topic = t.pick(CTC_CONDITION_TOPICS);
      const content = CTC_passage(topic.text1, topic.text2);
      const wrong = [topic.capitulate, ...t.sample([topic.overreach, topic.ground, topic.misapply], 2)];
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: `Based on the texts, how would ${topic.author} (Text 1) most likely respond to ${topic.target} in Text 2?`,
        correct: topic.key,
        wrong,
        explanation: `${topic.why}.`,
        steps: [
          "Separate Text 1's criteria: what does each observation support, and under what conditions?",
          "Match those criteria to the case's timing, comparisons, or sources, keeping the commentator's inference separate from the observations.",
          "Choose the judgment licensed by that mapping; reject responses that transfer support to a different claim or overstate what the evidence excludes.",
        ],
        principles: [
          "Evidence can support one part of a claim while leaving another part unresolved.",
          "An author's likely response must follow from that author's own stated reasoning.",
        ],
        trap: "Accepting Text 2's own reading of its case, which is what its author says but not what Text 1's author would conclude.",
        hint: "Which claim does each observation support, and which additional conclusion needs evidence the case does not supply?",
        estimatedSeconds: 105,
        verify: () => {
          const [one, two] = CTC_split(content);
          const choices = [topic.key, topic.capitulate[0], topic.overreach[0], topic.ground[0], topic.misapply[0]];
          return one.includes(topic.conditionAnchor) && two.includes(topic.detailAnchor) &&
            !one.includes(topic.detailAnchor) && wrong.length === 3 && new Set(choices).size === 5;
        },
      };
    },
  };

  // The target is a writer's position, not an attributed claim the writer
  // quotes. Both texts distinguish those voices before the positions can be
  // related. Distractors preserve a real claim but assign it to the wrong voice,
  // or carry an agreement beyond the particular grounds the writers share.
  const CTC_VOICE_TOPICS = [
    {
      scene: "cs-voice-volunteer-index",
      one: "The Vell archive's director calls its volunteer index unreliable because uncertain readings appear beside confident ones. That criticism overlooks the index's purpose. Each entry links to a scan and labels doubtful letters; a researcher can therefore check a suggested name without accepting it. The index is useful precisely because its guesses remain distinguishable from the records themselves.",
      two: "Some historians would exclude every transcription not signed by a professional. I would instead ask whether a transcription exposes the evidence behind its decisions. Credentials cannot make an inaccessible reading verifiable, while a tentative reading tied to its source can guide further inquiry. Treating either kind of transcription as a substitute for the source would be a mistake.",
      question: "the first writer's defense of the volunteer index",
      key: "The defense identifies a feature that makes uncertain readings useful without making them authoritative.",
      wrong: [
        ["The defense fails because uncertainty makes volunteer readings unsuitable even as guides to original records.", "That adopts the director's objection and the historians' credential rule, which the writers challenge."],
        ["The defense succeeds because linked scans make a volunteer index an adequate replacement for original records.", "Both writers distinguish a guide from an authoritative substitute; source links do not erase that distinction."],
        ["The defense overlooks a requirement that uncertain readings receive professional approval before researchers can inspect them.", "The second writer replaces a credentials requirement with verifiability, rather than adding professional approval."],
      ],
      why: "Both writers value exposing the source and the uncertainty. The director and some historians favor excluding doubtful volunteer work, but neither writer endorses that position.",
    },
    {
      scene: "cs-voice-restored-fresco",
      one: "A critic of the Merrow fresco restoration says replacing missing faces falsifies the painting. I agree that replacement should never masquerade as surviving paint. But the restorers marked every addition in a diagram and used a visibly different texture. Their work restores the scene's legibility while allowing attentive viewers to distinguish new material from old.",
      two: "Restorers often defend additions by saying viewers need a complete scene. Yet a diagram is rarely present when an image circulates in books, and texture differences vanish in small reproductions. I accept additions that remain unmistakable in those ordinary forms of viewing; a distinction visible only beside the wall cannot reliably preserve the boundary between evidence and reconstruction.",
      question: "the first writer's claim that the restoration preserves a useful distinction between old and new",
      key: "The distinction may work at the wall while failing in reproductions where the additions look original.",
      wrong: [
        ["The distinction cannot matter because replacing a missing face necessarily falsifies every surviving part of a painting.", "That intensifies the critic's view; the second writer permits distinguishable additions."],
        ["The distinction should be abandoned because a complete scene matters more than identifying the surviving paint.", "The second writer explicitly rejects treating completeness as sufficient justification."],
        ["The distinction is secure because any technique that works on the wall also survives ordinary reproduction.", "The second text specifically says diagrams and textures can disappear in reproductions."],
      ],
      why: "The first writer answers the critic by emphasizing distinguishability, not completeness alone. The second writer shares that aim but applies it to reproductions, where the stated safeguards may fail.",
    },
    {
      scene: "cs-voice-poetry-rhythm",
      one: "Lena Voss's translations replace several images in Arlen's poems to preserve their beat. A reviewer calls this betrayal of the words. But the poems' repeated rhythms make their speakers sound trapped in habits, an effect the literal versions lose. Voss's departures can therefore preserve something central to the poems rather than merely make them easier to read.",
      two: "Translators sometimes invoke 'the spirit' of a poem to excuse whatever sounds attractive in the new language. I distrust that defense unless a departure can be tied to a particular effect of the original. Fidelity need not preserve every image, but it must offer more than a claim that the translation is enjoyable on its own.",
      question: "the first writer's justification of Voss's departures from the original images",
      key: "It identifies an effect of the original that can justify a departure from its individual images.",
      wrong: [
        ["It substitutes the translation's independent attractiveness for evidence of what the original poems actually accomplish.", "The first writer links the rhythm to the original speakers' habits, supplying the evidence the second writer requests."],
        ["It establishes that preserving each original image is the only way to maintain the poems' characteristic effect.", "That resembles the reviewer's objection; both writers allow justified departures from images."],
        ["It excuses departures by denying that a translator needs to preserve any identifiable feature of the original.", "The first writer identifies the original rhythmic effect, and the second requires such a connection."],
      ],
      why: "The reviewer equates fidelity with words, while the first writer identifies a specific rhythmic effect. That specific connection meets the second writer's condition for a defensible departure.",
    },
    {
      scene: "cs-voice-trade-pottery",
      one: "A historian treats Istra pottery found inland as proof that coastal potters met inland buyers. Critics object that objects can pass through intermediaries. That objection defeats the claim of direct contact, but not the more modest conclusion that goods moved between the regions. The pottery's secure coastal manufacture still bears on the inland settlement's connections.",
      two: "A museum label describes an imported pot as evidence of a journey by its maker. I would omit that claim: a vessel can travel without its maker. Still, some scholars go too far when they say that such objects tell us nothing about exchange. Establishing that an object crossed regions is already useful, even when its successive owners remain unknown.",
      question: "the first writer's more modest conclusion about the inland pottery",
      key: "It retains a conclusion about the movement of goods while withholding an unsupported claim about particular people.",
      wrong: [
        ["It endorses the direct encounter that the critics reject by treating regional exchange as the same thing as personal contact.", "The first writer explicitly separates the two conclusions, as the second writer does."],
        ["It rejects every conclusion about trade because the vessel's successive owners cannot be identified with certainty.", "That is the excessive skeptical position rejected by the second writer, not the first writer's conclusion."],
        ["It confirms the label's account of a maker's journey while conceding that the buyer's identity remains unknown.", "Neither writer infers that the maker traveled with the object."],
      ],
      why: "Both writers distinguish movement of goods from direct contact between particular people. The stronger historical and museum claims are reported for criticism, not adopted.",
    },
    {
      scene: "cs-voice-school-language",
      one: "A school inspector takes fluent performances in Tessar as proof that the language has recovered. Some critics dismiss those performances as rote learning. That goes too far: pupils answer unfamiliar questions and invent jokes in Tessar. The performances establish flexible command of the language, although they do not reveal which language pupils choose outside school.",
      two: "A language campaign calls high examination scores evidence of a living speech community. I would require evidence of voluntary use between neighbors and across generations. Schools can give pupils a real skill without making it the language of their daily relationships. Nor should the absence of such daily use be confused with an inability to speak it.",
      question: "the first writer's assessment of the pupils' performances",
      key: "It establishes an ability while leaving open the separate question of whether that ability sustains community use.",
      wrong: [
        ["It mistakes examination success for evidence that the language already serves the pupils' daily relationships.", "That is the inspector's overreach, which the first writer avoids by withholding conclusions about outside use."],
        ["It should dismiss the performances as rote because pupils have not been shown to use Tessar outside school.", "The second writer distinguishes lack of daily use from lack of ability, agreeing with the first writer's distinction."],
        ["It understates recovery because flexible command makes evidence of voluntary community use unnecessary.", "The second writer requires voluntary community use to establish recovery, even when skill is real."],
      ],
      why: "The inspector claims recovery and the critics deny ability. The first writer accepts neither inference wholesale. The second writer makes the same distinction between genuine skill and a living community practice.",
    },
    {
      scene: "cs-voice-library-fee",
      one: "The Corran museum's director says admission fees exclude poor families. I accept that concern, but fees currently pay for free school visits, and no replacement funding has been promised. Abolishing the fee immediately could therefore reduce the museum's service to those families. My objection concerns the proposed timing, not the aim of widening access.",
      two: "Campaigners sometimes treat any objection to free admission as indifference to access. That is unfair when an objection identifies a service that would disappear. But a temporary funding problem should prompt a search for replacement income, not become a permanent argument for charging. A plan deserves scrutiny both for whom it includes and for what it displaces.",
      question: "the first writer's objection to immediate abolition of the admission fee",
      key: "It raises a legitimate concern about displaced services, without establishing a permanent case for retaining the fee.",
      wrong: [
        ["It reveals indifference to access because objections to free admission necessarily favor the families already able to pay.", "That repeats the campaigners' position, which the second writer explicitly calls unfair."],
        ["It justifies keeping admission fees permanently because existing services could never be funded in another way.", "Neither writer establishes that replacement income is impossible; the first objection is explicitly about timing."],
        ["It should be withdrawn because benefits to new visitors make the loss of school visits irrelevant to access.", "The second writer requires considering displaced services, including those serving the intended beneficiaries."],
      ],
      why: "Both writers take displaced services seriously. The second adds that this is a reason to address funding, not a permanent defense of fees; the first writer's timing qualification is compatible with that view.",
    },
    {
      scene: "cs-voice-forest-map",
      one: "The Lorn survey omitted privately owned woods. Its critics say that no conclusion drawn from it can be trusted. I would retain its finding that nesting success fell in the public woods actually surveyed, where the same plots were monitored each year. What must be withheld is a claim about every wood in the district.",
      two: "A council report dismisses Lorn's findings as unrepresentative. Yet representativeness concerns where a finding applies, not automatically whether it occurred. Here another difficulty matters: half the monitored public plots changed observers, and the new observers missed many nests in a calibration exercise. Even a conclusion restricted to surveyed woods must confront that measurement problem.",
      question: "the first writer's defense of a conclusion limited to the surveyed woods",
      key: "Restricting the conclusion's scope addresses one objection but leaves a separate problem with the reported trend.",
      wrong: [
        ["Restricting the conclusion's scope resolves every concern because repeated monitoring guarantees accurate nest counts.", "The new observers' missed nests provide a measurement concern despite repeated monitoring."],
        ["The conclusion must be rejected solely because omitted private woods make any local finding impossible to establish.", "The second writer distinguishes representativeness from whether a local result is accurate."],
        ["The conclusion should instead be extended to the private woods because the public plots were monitored annually.", "Annual monitoring neither removes measurement error nor establishes findings for unsurveyed woods."],
      ],
      why: "The first writer rebuts a scope objection by limiting the claim. The second accepts the scope distinction but offers new evidence of measurement error, which the restriction cannot repair.",
    },
    {
      scene: "cs-voice-composer-parts",
      one: "Eight surviving string parts led a conductor to insist that Vennholt's suite requires eight players. An archivist notes that court ensembles often doubled parts. I accept the warning but would not replace eight with any definite larger number: these parts alone tell us neither how often doubling occurred nor whether it occurred at this performance.",
      two: "Reviewers praise a recent performance for using the supposed original group of eight. That certainty is misplaced. Payment records for the premiere list twenty-two string players assigned specifically to this suite, rather than merely employed at court. General knowledge about doubling would not settle the number; these records support a much more specific reconstruction.",
      question: "the first writer's refusal to infer a definite ensemble size from the surviving parts alone",
      key: "The refusal is justified for those parts alone, although a different source permits a more specific conclusion.",
      wrong: [
        ["The refusal conflicts with the payment records because it denies that any source could establish the number of players.", "The first writer limits the refusal to what the parts alone show, not what every possible source could show."],
        ["The refusal should yield to the reviewers because preserving eight parts establishes that eight players performed the suite.", "The second writer rejects the reviewers' inference and supplies payment records for a larger group."],
        ["The refusal proves that a general practice of doubling is sufficient to reconstruct an ensemble of exactly sixteen.", "Both texts distinguish general doubling practice from evidence about this particular performance."],
      ],
      why: "The first writer limits an inference from one source; the second agrees about that source's limits but supplies a different, more decisive source. New evidence need not refute the original caution.",
    },
    {
      scene: "cs-voice-river-dam",
      one: "Otters returned after the Harlan dam was removed. A campaigner calls the timing proof that removal caused the return. A critic instead cites otter gains on the neighboring Tamsin. That comparison weakens the campaigner's certainty, but it cannot establish that removal had no effect; regional improvement and a local benefit could operate together.",
      two: "The Tamsin comparison is sometimes used to dismiss the Harlan restoration as useless. That conclusion outruns the evidence. Yet defenders also note that both rivers might have improved for different reasons and treat this possibility as proof of a Harlan benefit. Identifying a cause compatible with the counts is not the same as demonstrating that it contributed.",
      question: "the first writer's claim that a local benefit remains possible",
      key: "The possibility is consistent with the counts, provided it is not mistaken for evidence that a benefit actually occurred.",
      wrong: [
        ["The claim establishes a local benefit because a cause that remains possible must have contributed to the observed increase.", "That is the defenders' inference criticized by the second writer, not a conclusion warranted by compatibility."],
        ["The claim is ruled out because similar gains on the Tamsin prove that dam removal was useless on the Harlan.", "The second writer explicitly rejects that overconfident dismissal."],
        ["The claim vindicates the campaigner's certainty by showing that the comparison between the rivers contains no useful evidence.", "The first writer accepts that the comparison weakens certainty; neither treats it as useless."],
      ],
      why: "The first writer preserves a possible contribution without claiming proof. The second rejects both confident dismissal and a leap from possibility to actuality, so that qualified position fits.",
    },
    {
      scene: "cs-voice-historical-diary",
      one: "Because Mira Sen's diary contradicts her public speeches, a biographer calls it the unguarded truth. Skeptics reply that Sen knew her papers would be preserved. I accept their caution but not their conclusion that the diary is worthless. Even a calculated private account can reveal which image Sen hoped a later audience would accept.",
      two: "Some editors privilege private writing simply because it was unpublished. Others reject any document shaped for readers. Both approaches confuse purpose with evidentiary value. A diary may be poor evidence for its writer's secret motives yet excellent evidence of an intended self-portrait. Its audience matters most when we decide which question the document can answer.",
      question: "the first writer's proposed use of Sen's diary",
      key: "It assigns the diary an evidentiary role that remains useful even if its account was deliberately shaped for readers.",
      wrong: [
        ["It restores the biographer's claim by treating a planned self-portrait as direct access to the writer's unguarded motives.", "The first writer shifts the question to intended image instead of restoring privileged access to motives."],
        ["It accepts the skeptics' conclusion by denying that writing intended for preservation can answer any historical question.", "Both writers reject blanket dismissal of documents shaped for an audience."],
        ["It establishes that identifying a document's audience makes its contradictions with public speeches disappear.", "Audience informs what the evidence can show; neither writer claims that it removes the contradictions."],
      ],
      why: "Both writers distinguish the document's purpose from its usefulness for a particular question. The first writer neither adopts the biographer's unguarded-truth claim nor the skeptics' blanket dismissal.",
    },
  ];

  const ctcAuthorVersusCitedView = {
    ...CTC_BASE,
    id: "cross-text-author-versus-cited-view",
    subskill: "response between texts",
    difficulty: "Hard",
    title: "Relate the writers’ positions after separating the views they cite",
    recognize: "Identify each writer’s own qualified position separately from quoted or reported claims, then apply the second writer’s reasoning to the first writer’s actual position.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["misattributed-view", "too-broad", "one-text-only"],
    build(t) {
      const topic = t.pick(CTC_VOICE_TOPICS);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content: CTC_passage(topic.one, topic.two) },
        stem: `Based on the texts, how would the writer of Text 2 most likely respond to ${topic.question}?`,
        correct: topic.key,
        wrong: topic.wrong,
        explanation: topic.why,
        steps: [
          "Separate each writer’s position from the claims attributed to a critic, reviewer, or other source.",
          "Identify exactly what the first writer accepts, rejects, or leaves open.",
          "Apply the second writer’s reasoning to that qualified position, keeping the same scope and degree of certainty.",
        ],
        principles: ["A reported claim belongs to its named source unless the writer endorses it.", "Agreement about an observation need not be agreement about what it proves."],
        trap: "Answering for an emphatic view the writer quotes and then limits, instead of for the writer’s own position.",
        hint: "Which claims does each writer report, and which claims does that writer actually accept?",
        estimatedSeconds: 105,
        verify: () => topic.one.length >= 150 && topic.two.length >= 150 && topic.one.length + topic.two.length <= 900 &&
          new Set([topic.key, ...topic.wrong.map(([choice]) => choice)]).size === 4,
      };
    },
  };

  // Begin additional design: cross-evidence-standard.
  // The observations are shared; the object or standard of evaluation is not.
  // These scenes require resolving apparent opposition without importing a
  // factual rebuttal, a new finding, or a condition from one text into another.
  const CTC_STANDARD_TOPICS = [
    {
      "scene": "cs-standard-loom-autonomy",
      "target": "the autonomy of the Veyran looms",
      "one": "The Veyran loom selects among repairs as the cloth changes, rather than repeating a fixed repair sequence. Workers supplied its rules and still assign each pattern; it now completes a run without further messages from them. I would call this a gain in autonomy. The same unexpected knot that once sent an operator to the controls now receives a response determined at the loom.",
      "two": "The loom's responses vary with the cloth, and its operator can leave once a pattern is assigned. Compare an experienced weaver: given the same assignment, she might decide that wasting fine thread on this pattern is unjustified. She too learned her craft from others. What keeps the loom from resembling her is not the source of its instruction or the variety of its repairs.",
      "key": "Text 1 locates autonomy in choosing how an assignment proceeds; Text 2 locates it in being able to reconsider what the assignment calls for.",
      "wrong": [
        [
          "Text 1 treats a wider range of responses as greater autonomy; Text 2 requires that range to extend to interruptions beyond those already encountered.",
          "A broader repertoire is a plausible extension of Text 1's reasoning. But Text 2's weaver does not merely handle an additional interruption: she questions whether to carry out the assigned pattern. Its contrast concerns the assignment's authority, not the breadth of repairs."
        ],
        [
          "Text 1 treats locally selected responses as autonomous; Text 2 distinguishes learned responses from decisions whose rules the decision maker devised.",
          "Text 2 deliberately notes that the experienced weaver also learned from others. The origin of the rules therefore does not separate her from the loom. Her ability to reconsider the assignment does."
        ],
        [
          "Text 1 accepts a division of decisions between people and machines; Text 2 requires production decisions to become independent of other decision makers.",
          "Text 2's weaver still receives an assignment and uses a learned craft. She need not be independent of every other decision maker; she can assess whether the assigned use of the thread is justified. The distractor substitutes complete independence for that specific authority."
        ]
      ],
      "why": "Both texts accept variable, locally selected repairs within a human assignment. Text 1 counts the absence of further direction during execution as increased autonomy. Text 2's weaver also receives instruction but can question the assigned use of material, so its standard concerns authority over the ends of the work rather than additional independence in executing it.",
      "shared": "Both writers accept a human assignment, learned rules, and variable repairs selected without further human messages.",
      "standards": "The unexpected knot tests control within the assignment; the weaver's objection tests whether the assignment itself can be reconsidered."
    },
    {
      "scene": "cs-standard-marsh-recovery",
      "target": "the recovery of the Elvare marsh",
      "one": "Elvare's new reeds slow floodwater and trap sediment without pumps. The old sedges and insects that fed on them remain absent; this is a different plant community. Yet I call the marsh recovered. Restocking every former species while pumps performed the reeds' work would improve the species list but undo the achievement on which my judgment rests.",
      "two": "The new reeds' unassisted water regulation is established. Keeping it, imagine adding every former species but isolating each behind barriers: I would still withhold 'recovered.' Now plant a substitute for the sedges that supports the former insects and restores their other interactions. I would withdraw that objection, although a botanist comparing species lists would still find a mismatch.",
      "key": "Text 1 asks whether the marsh's water functions operate independently; Text 2 asks whether ecological relations return, even with different participants.",
      "wrong": [
        [
          "Text 1 accepts altered membership when former functions return; Text 2 requires membership to match the past as well as former interactions to return.",
          "The first half fits, but the second conflates restored interactions with an exact historical membership. Text 2 rejects the isolated collection despite its matching species list and accepts a substitute plant when the insects' interactions return. The roles and connections, not every earlier participant, must be restored."
        ],
        [
          "Text 1 asks whether the replacement community can sustain itself; Text 2 asks whether it enables the original plant community to reestablish itself.",
          "The new plant is not valued as a temporary step toward the sedges' return. Text 2 would withdraw its objection even while the botanical mismatch remains. Its comparison requires the insects' connections to return, not succession back to the original plant community."
        ],
        [
          "Both writers require restored relations among organisms; Text 1 infers them from water regulation, while Text 2 requires evidence of the relations themselves.",
          "Text 1 explicitly accepts the loss of the sedges and their dependent insects, so it is not inferring restored relations from water regulation. Its pump comparison isolates independent water functions. The two writers apply different standards rather than different evidentiary demands for one shared standard."
        ]
      ],
      "why": "Text 1's pump comparison would reject historical membership without independent water regulation; the current loss of insect connections does not prevent its favorable judgment. Text 2 holds water regulation fixed and compares a complete but isolated collection with a different plant community that restores interactions. That contrast makes ecological connections, rather than an exact membership or its eventual return, the second standard.",
      "shared": "Both writers accept independent water regulation alongside the absence of the former sedges and their dependent insects.",
      "standards": "Use the pumps to isolate Text 1's criterion, then compare Text 2's matching species list without interactions against restored interactions with a mismatching list."
    },
    {
      "scene": "cs-standard-archive-completeness",
      "target": "the completeness of the Neral workshop archive",
      "one": "Neral's digitized workshop archive includes every surviving ledger, with every page linked to its volume and date. There are no ledgers from the years of expansion; the original shelves have the same gap. The project is complete. Sending a researcher to the building would add the experience of handling paper but would not enlarge the record available for consultation.",
      "two": "The website preserves all surviving pages and their dates. Yet a researcher tracing the expansion can see the old wage bill and the new one without following the intervening hiring. Visiting the building cannot fix this. What prevents me from calling the archive complete would remain even if every surviving entry were legible and every link worked perfectly.",
      "key": "Text 1 measures coverage against what remains to be consulted; Text 2 measures it against the sequence that a particular historical inquiry must follow.",
      "wrong": [
        [
          "Text 1 treats equal access to the copies as sufficient; Text 2 asks whether consulting the records requires an experience that the copies cannot provide.",
          "Handling paper is mentioned, but Text 1 treats that difference as irrelevant to the available record, and Text 2 says a visit cannot fix the gap. Its missing resource is the intervening historical sequence, not an experience of the originals."
        ],
        [
          "Text 1 regards preserving each entry's context as sufficient; Text 2 requires researchers to connect entries before the archive's coverage can be judged.",
          "The date and volume links preserve context, and the historian does connect two wage bills. Those links cannot supply records for the missing interval. The issue is which whole must be covered, not whether researchers have yet made connections among the present entries."
        ],
        [
          "Text 1 judges the archive by the work its compilers could finish; Text 2 judges it by the amount of detail that a surviving document makes available.",
          "The first half plausibly captures the project's limit, but Text 2's issue is absent years between two available records. Perfectly detailed surviving entries would not themselves restore that sequence, as its closing qualification emphasizes."
        ]
      ],
      "why": "Neither writer identifies an omitted copy or a defective link. Text 1's counterfactual visit adds no surviving evidence, so completion is measured against the extant collection. Text 2's inquiry must traverse an interval the collection cannot cover, even with perfect access. The reference whole changes from surviving objects to a historical sequence.",
      "shared": "Both writers accept exhaustive copying, preserved dates, missing expansion years, and the inability of an on-site visit to fill those years.",
      "standards": "Compare what the imagined visit would add with what the historian needs between the two wage bills: one test exhausts a collection, the other covers a sequence."
    },
    {
      "scene": "cs-standard-harbor-forecast",
      "target": "the usefulness of the Selen harbor forecast",
      "one": "The new Selen model reduces water-level errors on calm days and near the harbor's closure level. On the historical record, both models would nevertheless have issued exactly the same gate instructions, including the same mistakes. Calling the revision useless would discard a real gain: its estimates describe the recorded water levels more closely even where the gate instructions coincide.",
      "two": "The smaller errors extend to days near the closure level; they are not confined to calm water. Still, replace the old estimates on the gate operator's desk with the new ones and no recorded opening or closure changes. A second revision might slightly enlarge the average error yet prevent one mistaken closure. That revision would improve this operator's forecast in a way the first has not.",
      "key": "Text 1 values closer estimates even when actions stay the same; Text 2 values changes in estimates according to the decisions they would alter.",
      "wrong": [
        [
          "Text 1 evaluates gains throughout the water-level record; Text 2 gives gains near the closure level priority over gains during ordinary conditions.",
          "Both passages establish that errors decrease near the closure level too. Merely restricting the accuracy comparison to difficult days therefore does not explain Text 2's judgment. Its hypothetical second revision instead separates numerical closeness from crossing a consequential decision boundary."
        ],
        [
          "Text 1 evaluates the size of errors in the model's estimates; Text 2 gives the direction of those errors priority over their numerical size.",
          "The direction of a water-level error could affect a closure, making this plausible. But Text 2 does not prefer overestimates or underestimates as such. It favors an altered decision, which depends on the estimate's relation to a threshold, not on error direction alone."
        ],
        [
          "Text 1 evaluates estimates against recorded water levels; Text 2 evaluates whether the improved estimates justify changing the harbor's closure rule.",
          "Text 2 changes the estimates supplied to the existing decision rule and asks whether the resulting instructions change. It does not evaluate a new closure threshold or a revision to the policy itself. The distractor confuses improving a rule's input with replacing the rule."
        ]
      ],
      "why": "The smaller errors occur even near the closure level, so ordinary-versus-extreme conditions cannot explain the assessments. Text 1 counts a closer description of water levels as a gain. Text 2's hypothetical revision may be less close numerically yet better at preventing a mistaken closure: its evaluative target is the decision changed by an estimate.",
      "shared": "Both texts accept smaller errors near and away from the closure level, plus identical gate instructions from the two existing models.",
      "standards": "Use the hypothetical less-accurate revision to distinguish numerical closeness from the consequences of crossing a decision boundary."
    },
    {
      "scene": "cs-standard-ceramic-uniformity",
      "target": "standardization at the Lethrin pottery workshop",
      "one": "Lethrin's potters used different clay mixtures and adjusted firing by sight. Yet their later cups fitted racks made from one drawing: a buyer could mix cups from several potters without sorting them. Earlier cups, made from a shared clay batch, needed separate supports. Standardization had arrived, although neither the mixture nor the judgments at the kiln had become uniform.",
      "two": "The later Lethrin cups could share racks, and their varied mixtures and firing judgments are well documented. Move a finished cup between buyers and it still fits; move a potter's firing instructions to another bench and the change of mixture makes them unreliable. I hesitate to date standardized production from the first exchange. The second exchange would have to work too.",
      "key": "The writers differ on whether interchangeability must extend from finished products to the procedures by which those products are produced.",
      "wrong": [
        [
          "The writers differ on whether a common specification is enough to make the same physical properties recur across products made by different potters.",
          "Both accept recurrence of the relevant external dimensions. Text 2's failed exchange concerns firing instructions, not whether the common specification can produce compatible cups. It extends the object of interchangeability to procedures."
        ],
        [
          "The writers differ on the scale of comparison: Text 1 assesses agreement across potters, while Text 2 assesses consistency within each potter's work.",
          "Both tests concern exchanges across working settings: cups between buyers or firing instructions between benches. Text 2 does not shift to repeated consistency within one potter's work; it changes what must be transferable across settings."
        ],
        [
          "The writers differ on whether varied methods demonstrate skilled adaptation to a common target or demonstrate that the common target is insufficiently exact.",
          "Skilled adaptation is compatible with the account, but Text 2 does not infer an imprecise target from varied procedures. Compatible output is accepted. The disagreement concerns whether a standard target suffices when production instructions are not transferable."
        ]
      ],
      "why": "The common clay of the earlier cups did not make products interchangeable, so Text 1 locates standardization in the later cups' shared fit. Text 2 accepts that achievement but tests a second exchange: instructions between benches. Its additional demand concerns transferable procedures, not tighter dimensions or a different historical phase.",
      "shared": "Both texts accept later cups' common fit, varied mixtures, and firing instructions that depend on individual working conditions.",
      "standards": "Separate exchanging completed cups from exchanging the instructions that produce them; the authors disagree about which exchanges standardization must permit."
    },
    {
      "scene": "cs-standard-musical-originality",
      "target": "the originality of Roven's suite",
      "one": "Every melody in Roven's suite comes from a familiar street song. The ordering is new and creates striking effects, but write each melody on a separate card and every card has an earlier counterpart. Hearing one in a new position does not erase that history. The suite's ingenuity is considerable; my reservation concerns calling its music original.",
      "two": "Lay out Roven's borrowed melodies on cards and none will be new. Now place the final movement first: its formerly uneasy return sounds confident, and the opening loses its later irony. No note need change. The sources of the cards remain plain in either order. The originality I hear vanishes in that rearrangement, though everything named in the inventory survives.",
      "key": "The first writer tests originality in the elements considered separately; the second tests it in effects that depend on how those elements are related.",
      "wrong": [
        [
          "The first writer asks whether the melodies have historical precedents; the second asks whether their presentation makes those precedents hard to recognize.",
          "Historical borrowing matters to Text 1, but the source cards remain recognizable in Text 2's two orders. Its contrast depends on changed relations and effects, not on a presentation that conceals the material's origins."
        ],
        [
          "The first writer separates compositional skill from invention; the second considers the emotional force of a performance sufficient to establish invention.",
          "Text 1 does make the stated separation. Text 2, however, changes only the order while holding the notes and identifiable sources fixed. This isolates compositional relationships, not emotional force in a performance as a sufficient test of invention."
        ],
        [
          "The first writer measures novelty against the source songs; the second measures novelty against the expectations listeners bring to familiar material.",
          "Familiarity helps make the distractor plausible, but Text 2 compares two organizations of the same material, not two sets of listener expectations. Its claimed originality lies in order-dependent relationships even when listeners recognize the sources."
        ]
      ],
      "why": "Both writers accept old melodies and new effects. Text 1's separate-card inventory preserves the relevant unit for its assessment. Text 2 changes the relations among those same cards, losing what it calls original without altering the elements or hiding their sources. That controlled contrast identifies a different unit of evaluation.",
      "shared": "Both texts accept identifiable borrowed melodies and effects produced by their new ordering.",
      "standards": "The inventory stays fixed while the order changes: ask why that leaves Text 1's test unchanged but changes Text 2's assessment."
    },
    {
      "scene": "cs-standard-transit-success",
      "target": "the success of the Orven transit program",
      "one": "Before Orven's bus program opened, two large employers moved beyond the residential district. Both traffic assessments agree that, without the buses, daily car trips would have risen sharply. They rose only slightly, though they still exceeded the earlier total. The program reduced the driving burden in a meaningful sense: it removed most of the additional traffic that the relocations would have generated.",
      "two": "I accept that Orven's buses prevented most of the forecast increase. Residents nevertheless encounter more daily car trips than before the employers moved. Imagine a smaller town with no such avoided increase but fewer cars on its roads than before: it would have achieved the reduction still missing here. A large benefit against the alternative does not settle my assessment.",
      "key": "Text 1 compares observed traffic with the credible outcome without the program; Text 2 compares the resulting traffic burden with the town's earlier burden.",
      "wrong": [
        [
          "Text 1 adjusts the traffic measure for changes in demand; Text 2 asks whether the program reduced the proportion of that demand met through driving.",
          "The relocations change demand, but Text 2 does not use a share of total journeys. Its smaller-town comparison is about fewer cars than before, regardless of how total demand is distributed among forms of travel."
        ],
        [
          "Text 1 judges the program by the traffic prevented by its introduction; Text 2 judges it by how much traffic can be attributed to the employers' moves.",
          "Text 2 accepts the avoided increase and does not try to isolate the employers' causal contribution. Its comparison asks whether the resulting burden is below the prior burden, even in a town without a large avoided increase."
        ],
        [
          "Text 1 treats a favorable forecast comparison as sufficient evidence of success; Text 2 requires the favorable comparison to be confirmed by observed counts.",
          "Both assessments already accept the observed counts and the credible no-program comparison. Text 2 introduces a different baseline, not a demand to replace a forecast with observations. More confirmation of the avoided increase would leave its concern intact."
        ]
      ],
      "why": "Both writers accept an avoided large increase and an actual small increase. Text 1 evaluates the program against the counterfactual without buses. Text 2's smaller-town comparison permits success without a large avoided increase, showing that its baseline is the earlier burden. The issue is the comparison defining reduction, not competing traffic measurements.",
      "shared": "Both writers accept a credible large increase without buses, an observed small increase, and a benefit from the program.",
      "standards": "Contrast the no-program alternative with the earlier traffic total; Text 2's smaller-town example separates those two baselines."
    },
    {
      "scene": "cs-standard-city-independence",
      "target": "the independence of Mereth after its charter",
      "one": "Mereth's charter ended the governor's right to countersign council rules. Grants remained discretionary, and threats to withhold them still stopped expensive proposals. Yet a resident contesting a rule now had to bring the council, not the governor, before the charter court. Mereth had acquired independence in a consequential respect, even when the sums available for its choices had not changed.",
      "two": "The council now defends its rules in court, and the governor cannot cancel them by withholding a signature. Still, a refused canal proposal returned unchanged as soon as a grant was promised. Imagine the council retaining its new legal position but gaining a dependable local income: the difference to that proposal reveals how far Mereth remained from the independence I would recognize.",
      "key": "Text 1 asks who must answer for binding decisions; Text 2 asks whether those decisions can take effect without another authority's discretionary support.",
      "wrong": [
        [
          "Text 1 tracks which institution bears the cost of its decisions; Text 2 tracks which institution has the right to determine how public funds are spent.",
          "The court example concerns responsibility for rules, not the financial cost of decisions. Text 2's income comparison concerns practical dependence even when the council's legal right stays unchanged; it does not relocate formal spending authority."
        ],
        [
          "Text 1 treats a reduction in one kind of dependence as sufficient; Text 2 requires the city to become free of constraints on the policies it can pursue.",
          "Text 2 isolates another authority's discretionary grants by holding the legal position fixed and changing the income source. It does not require freedom from every constraint, such as limited resources or competing local priorities. The distractor overextends the practical criterion."
        ],
        [
          "Text 1 assesses the charter by the decisions it has reassigned; Text 2 assesses it by whether that reassignment is likely to survive changes in funding.",
          "The first half fits. But Text 2's thought experiment preserves the new legal position while changing funding. Its target is the city's capacity to implement choices, not the durability of the legal reassignment under financial pressure."
        ]
      ],
      "why": "The court example makes the council the legally responsible authority even while grant dependence persists. Text 2 holds that legal position constant and changes the source of income, identifying practical capacity to execute policy as its target. The two assessments concern different dimensions of independence, not whether the charter is valid or permanent.",
      "shared": "Both writers accept the end of countersigning, the council's legal responsibility, and the governor's continuing financial influence.",
      "standards": "Read the court example as a test of authoritative responsibility and the income counterfactual as a test of practical capacity."
    },
    {
      "scene": "cs-standard-instrument-replication",
      "target": "the replication of the Torvel vibration experiment",
      "one": "The Torvel vibration curve reappeared in a device with a different linkage. Both teams agree that the new linkage cannot test Torvel's account of a delayed release in the old one. Nevertheless, a pattern once associated with one apparatus has now survived a change in construction. This is a replication worth claiming, even if the old mechanism remains an open question.",
      "two": "The new device reproduces the curve and leaves Torvel's delayed-release account open. If a third device copied Torvel's linkage exactly and drew the same curve, that account might still remain open. I would prefer a modified linkage that disabled the supposed delay and showed whether the curve changed. For the experiment's central question, replication must reach the uncertainty that the unchanged curve leaves behind.",
      "key": "Text 1 counts robustness of a result across constructions; Text 2 seeks a result that can discriminate among accounts of the original construction's behavior.",
      "wrong": [
        [
          "Text 1 values departures from the original apparatus as a test of robustness; Text 2 requires closer reproduction of its construction to test the explanation.",
          "Text 2 says that even an exact copy with the same curve might leave the explanation open. Its preferred modification is valuable because it tests the proposed delay, not because it reproduces the apparatus more closely."
        ],
        [
          "Text 1 tests whether varied constructions yield an equivalent pattern; Text 2 tests whether one construction yields a stable pattern across repeated trials.",
          "The contrast is not between cross-apparatus and repeated-trial stability. Text 2's proposed change intentionally disables a mechanism; what matters is whether that intervention discriminates between explanations, not whether an unchanged apparatus repeats its pattern."
        ],
        [
          "Text 1 accepts an observation independent of its explanation; Text 2 requires the observation to remain valid when that explanation is experimentally removed.",
          "The first half fits. Text 2 does not require the curve to persist after disabling the delay; a changed curve could be informative support for the delay's role. It requires a discriminating test, not preservation of the observation under that test."
        ]
      ],
      "why": "Text 1's replication target is an observed relation robust to a construction change. Text 2 contrasts an exact copy that might settle nothing with a changed linkage that can test a causal account. That comparison makes explanatory discrimination, rather than physical fidelity or mere repeated stability, its relevant target.",
      "shared": "Both texts accept a repeated curve from a different linkage and the unresolved explanation of Torvel's original linkage.",
      "standards": "Compare the evidentiary roles of a different construction, an exact copy, and a modification that disables the proposed cause."
    },
    {
      "scene": "cs-standard-craft-continuity",
      "target": "the survival of the Arveth weaving tradition",
      "one": "Arveth weaving ceased before today's weavers were born. Cloth, notebooks, and film let them reconstruct both its knot sequences and the hand movements that produced them. I regard the tradition as having survived. Had the current weavers learned directly from a former practitioner but changed those distinctive sequences, that uninterrupted instruction would preserve less of what makes the craft Arveth.",
      "two": "Today's Arveth weavers reproduce the recorded knots and movements faithfully. But put an equally accurate notebook between each successive pair of generations, with nobody watching a learner or correcting a hand, and something more than a teaching convenience disappears. Accuracy permits this achievement to count as a reconstruction; I would not let it decide whether the tradition continued through the intervening years.",
      "key": "The first writer prioritizes continuity in the craft's defining features; the second prioritizes continuity in the exchanges through which people pass it on.",
      "wrong": [
        [
          "The first writer judges continuity by the resemblance of finished cloth; the second requires continuity in the bodily skills that produce that resemblance.",
          "The product-versus-process distinction is tempting because Text 2 describes watching and correcting a hand. But both texts accept reconstruction of the hand movements too. Text 2's notebook thought experiment concerns relationships of transmission, even with equal technical accuracy."
        ],
        [
          "The first writer treats a reconstruction as evidence of preserved knowledge; the second requires knowledge to be preserved without changes in teaching method.",
          "Text 2 does not reject every change in teaching method; its imagined notebooks remove the exchanges between learners and practitioners. The specific concern is continuity of such exchanges, not fidelity to one fixed instructional technique."
        ],
        [
          "The first writer values what current practitioners recover from earlier work; the second values what current practitioners add through their own participation.",
          "Participation matters in Text 2, but the thought experiment is about a missing chain of interaction across generations. It does not require current weavers to add innovations. This option turns continuity of transmission into a criterion of contemporary contribution."
        ]
      ],
      "why": "Text 1 imagines direct teaching with altered knot sequences and finds less continuity than in accurate reconstruction. Text 2 imagines equally accurate transmission through notebooks but removes the interpersonal exchanges. Holding accuracy apart from transmission in these comparisons shows that defining craft features and a continuous social practice are the respective targets.",
      "shared": "Both texts accept the historical break and the faithful reconstruction of knots as well as hand movements.",
      "standards": "Compare direct teaching with changed features to accurate records without teaching exchanges; each writer preserves a different element in its test of continuity."
    }
  ];

  const ctcDifferentEvaluationStandards = {
    ...CTC_BASE,
    id: "cross-text-different-evaluation-standards",
    subskill: "response between texts",
    difficulty: "Hard",
    title: "Reconcile assessments by identifying their different evaluative targets",
    recognize: "Establish the observations both writers accept, then identify the object, baseline, or criterion each uses to evaluate them. Different verdicts need not contradict the shared findings.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["one-text-only", "too-broad", "word-association"],
    build(t) {
      const topic = t.pick(CTC_STANDARD_TOPICS);
      const content = CTC_passage(topic.one, topic.two);
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: `Which choice best describes the relationship between the authors' assessments of ${topic.target}?`,
        correct: topic.key,
        wrong: topic.wrong,
        explanation: topic.why,
        steps: [
          topic.shared,
          topic.standards,
          "Check the competing interpretations against both comparisons. A plausible distinction can still assign the wrong target, hold the wrong feature constant, or extend a criterion too far.",
        ],
        principles: [
          "Agreement about observations can coexist with different evaluations when the authors evaluate different things.",
          "A shared evaluative word may carry different reference sets, baselines, or criteria in two arguments.",
        ],
        trap: "Choosing a plausible distinction between the texts without testing what each comparison holds fixed and what change would alter each writer’s verdict.",
        hint: "Which change would matter in each writer’s comparison, and which accepted fact would remain the same?",
        estimatedSeconds: 105,
        verify: () => {
          const [one, two] = CTC_split(content);
          const choices = [topic.key, ...topic.wrong.map(([choice]) => choice)];
          return one === topic.one && two === topic.two && one.length + two.length >= 150 &&
            one.length + two.length <= 900 && topic.wrong.length === 3 && new Set(choices).size === 4 &&
            choices.every((choice) => choice.length > 0 && choice.length <= 160) &&
            topic.wrong.every(([, reason]) => reason.length > 0);
        },
      };
    },
  };
  // End additional design: cross-evidence-standard.

  // Begin additional design: easy-cross-procedure.
  const CTC_DISTINCT_PURPOSE_TOPICS = [
    {
      scene: "cs-purpose-orchard-notebooks",
      one: "An orchard's notebooks contain weather reports, harvest dates, sales, and payments to workers. One historian copies the dates of the last spring frost from each year's entries. Her project asks whether those frosts tended to arrive earlier or later over the period covered by the notebooks.",
      two: "A second historian reads the same orchard notebooks but copies the amounts customers paid for a basket of apples. He arranges these amounts by year to discover how the price of the orchard's apples changed over time.",
      aim1: "compares the timing of spring frosts",
      foil1: "compares the timing of autumn harvests",
      aim2: "tracks the prices charged for apples",
      foil2: "tracks the wages paid to pickers",
      anchor1: "whether those frosts tended to arrive earlier or later",
      anchor2: "how the price of the orchard's apples changed",
      reason1: "The notebooks include harvest dates, but the first historian's stated question concerns spring frosts, not the timing of harvests.",
      reason2: "Payments to workers appear in the notebooks, but the second historian records customers' payments for apples, not workers' wages.",
    },
    {
      scene: "cs-purpose-ferry-tickets",
      one: "A transport museum has boxes of used ferry tickets showing dates, routes, and fares. A researcher groups one summer's tickets by route and counts each group. The aim is to find out which routes carried the most passengers that summer.",
      two: "Another researcher works with tickets from the same museum. She selects tickets for one unchanged journey, takes examples from each decade, and compares their printed prices. Her study follows the rise and fall of the fare over time.",
      aim1: "compares passenger traffic on different routes",
      foil1: "compares passenger fares on different routes",
      aim2: "traces fare changes across several decades",
      foil2: "traces route changes across several decades",
      anchor1: "which routes carried the most passengers",
      anchor2: "the rise and fall of the fare",
      reason1: "The first researcher counts tickets to compare passenger numbers; the fares printed on them are not the subject of that comparison.",
      reason2: "The second researcher deliberately follows an unchanged journey, so the comparison concerns fares rather than alterations to routes.",
    },
    {
      scene: "cs-purpose-harbor-photographs",
      one: "Photographs of the old Brindle harbor show fishing boats beside warehouses and workshops. An architectural historian orders the photographs by date to trace the waterfront's construction history. She notes when buildings first appear and when older buildings disappear.",
      two: "A boat designer studies the same harbor photographs. Looking closely at the vessels, he makes drawings of their hulls and groups boats with similar outlines. His purpose is to compare the different hull shapes used by the harbor's fishing fleet.",
      aim1: "reconstructs changes in the waterfront buildings",
      foil1: "reconstructs changes in the fishing vessels",
      aim2: "compares the shapes of boat hulls",
      foil2: "compares the heights of harbor walls",
      anchor1: "trace the waterfront's construction history",
      anchor2: "compare the different hull shapes",
      reason1: "Boats are visible in the photographs, but the architectural historian records the appearance and disappearance of buildings.",
      reason2: "The designer traces the outlines of boats, not the walls along the harbor, to compare hull shapes.",
    },
    {
      scene: "cs-purpose-recipe-books",
      one: "A collection of handwritten recipe books includes shopping lists, instructions, and occasional comments about family celebrations. A food historian records ingredients described as grown nearby. She uses these entries to identify the foods that cooks could obtain locally.",
      two: "A museum curator examines the same recipe books while preparing an exhibit about kitchens. He marks references to presses, grinders, molds, and other equipment. He wants to establish which tools the books' owners used to prepare their food.",
      aim1: "investigates which ingredients were locally available",
      foil1: "investigates which recipes were most popular",
      aim2: "identifies the kitchen tools cooks used",
      foil2: "identifies the holiday meals cooks served",
      anchor1: "identify the foods that cooks could obtain locally",
      anchor2: "which tools the books' owners used",
      reason1: "The food historian records where ingredients came from; she does not count how often particular recipes were prepared.",
      reason2: "The curator selects references to equipment. Comments about celebrations do not make holiday meals the focus of his project.",
    },
    {
      scene: "cs-purpose-dialect-recordings",
      one: "A language archive holds recorded interviews with residents of several villages. Each recording is labeled with the speaker's village and birthplace. A researcher notes the names speakers give common household objects and maps which terms occur in each village.",
      two: "A second researcher uses those interviews to compare how quickly people speak. She selects a minute of uninterrupted speech from each recording and counts its syllables. She is interested in differences in speech rate across the speakers.",
      aim1: "maps where particular words were used",
      foil1: "maps where particular speakers were born",
      aim2: "compares speakers' rates of speech",
      foil2: "compares speakers' levels of volume",
      anchor1: "maps which terms occur in each village",
      anchor2: "differences in speech rate",
      reason1: "Birthplaces are included on the labels, but the first researcher maps the use of words rather than the origins of speakers.",
      reason2: "Counting syllables within equal periods measures how quickly speakers talk, not how loudly they talk.",
    },
    {
      scene: "cs-purpose-theater-promptbooks",
      one: "The promptbooks for an old theater contain actors' lines and handwritten notes for performances. A director studies the marked pauses and entrances to reconstruct how scenes were timed. Her aim is to recover the pacing of the original productions.",
      two: "A historian examines the same promptbooks for crossed-out lines and replacement phrases. Comparing these changes with the printed scripts, he identifies what dialogue was altered before a play reached the stage. He is documenting revisions to the spoken text.",
      aim1: "reconstructs the pacing of past performances",
      foil1: "reconstructs the scenery of past performances",
      aim2: "identifies changes made to actors' dialogue",
      foil2: "identifies changes made to actors' costumes",
      anchor1: "recover the pacing of the original productions",
      anchor2: "documenting revisions to the spoken text",
      reason1: "The director uses pauses and entrances to study timing. The text does not describe an effort to reconstruct stage scenery.",
      reason2: "The historian compares crossed-out lines and replacement phrases with scripts, so the changes concern dialogue rather than clothing.",
    },
    {
      scene: "cs-purpose-kiln-logs",
      one: "A pottery workshop kept logs listing each kiln load's clay, fuel, temperature, and firing time. An engineer uses the logs to compare the amount of wood burned for loads of equal weight. The project measures how the kiln's fuel consumption changed over the years.",
      two: "A ceramic artist reads the same logs to plan a firing schedule. She groups entries by clay type and compares the recorded hours in the kiln. Her goal is to find the typical firing duration for each kind of clay the workshop used.",
      aim1: "tracks the kiln's consumption of fuel",
      foil1: "tracks the kiln's range of temperatures",
      aim2: "compares firing durations for different clays",
      foil2: "compares firing temperatures for different clays",
      anchor1: "how the kiln's fuel consumption changed",
      anchor2: "the typical firing duration for each kind of clay",
      reason1: "Temperature appears in the logs, but the engineer compares quantities of wood used for equally heavy loads.",
      reason2: "The artist compares hours in the kiln. Although temperatures are available, her stated goal concerns duration.",
    },
    {
      scene: "cs-purpose-newspaper-transit",
      one: "Old newspapers in Bellmere published bus notices listing routes, stops, and departure times. A geographer marks the advertised stops on maps from successive years. She wants to discover how far the bus network extended into the growing town.",
      two: "A transport historian uses the same notices to study service on one route that remained unchanged. For each year, he counts the scheduled departures on a weekday. His question is how frequently buses ran along that route.",
      aim1: "maps the geographical reach of service",
      foil1: "maps the geographical distribution of readers",
      aim2: "compares the number of scheduled departures",
      foil2: "compares the number of advertised stops",
      anchor1: "how far the bus network extended",
      anchor2: "how frequently buses ran along that route",
      reason1: "The geographer plots bus stops to trace the network's extent; the newspapers' readership is not being mapped.",
      reason2: "The historian counts departures on an unchanged route, not stops, to compare the frequency of service.",
    },
    {
      scene: "cs-purpose-garden-plans",
      one: "An estate's garden plans show paths, planting beds, and fountains at several dates. A landscape historian traces each plan's paths onto a separate sheet. The resulting sequence shows how the routes for walking through the garden changed.",
      two: "A botanist works with the same plans and the plant names written inside each bed. She counts the different kinds of plants listed in each period. Her project asks whether the garden's plant collection became more or less varied.",
      aim1: "traces changes in the walking routes",
      foil1: "traces changes in the fountain locations",
      aim2: "compares the variety of plants listed",
      foil2: "compares the size of beds drawn",
      anchor1: "how the routes for walking through the garden changed",
      anchor2: "whether the garden's plant collection became more or less varied",
      reason1: "The historian traces paths. The plans also show fountains, but their locations are not the subject of the sequence.",
      reason2: "The botanist counts kinds of plants, not the dimensions of beds, to assess variety in the collection.",
    },
    {
      scene: "cs-purpose-weather-letters",
      one: "Letters sent by residents of Norwick often mention rain, snow, and storms alongside family news. A climate researcher extracts dated reports of snowfall and places them on a calendar. She wants to establish which months had snow during the years the letters cover.",
      two: "A literary scholar reads the same letters, collecting comparisons such as storms described as angry visitors. He studies the imagery writers used for the weather. His interest is in their choice of figurative language when describing familiar conditions.",
      aim1: "identifies the seasonal timing of snowfall",
      foil1: "identifies the seasonal timing of correspondence",
      aim2: "examines the writers' images of weather",
      foil2: "examines the writers' accounts of relatives",
      anchor1: "which months had snow",
      anchor2: "their choice of figurative language",
      reason1: "The letters supply dates, but the researcher organizes reports of snow rather than studying when people tended to write letters.",
      reason2: "Family news is present, but the scholar collects weather comparisons to study imagery, not descriptions of relatives.",
    },
    {
      scene: "cs-purpose-market-tokens",
      one: "A museum holds metal tokens once issued by stalls at the Darnet market. Most bear a stall name on one side and a value on the other. A local historian catalogs the names to identify the different businesses that operated in the market.",
      two: "A metalworker examines the same tokens under magnification. She records ridges and tool marks left during production, then groups tokens by these features. Her study asks which techniques were used to manufacture them.",
      aim1: "identifies businesses named on the tokens",
      foil1: "identifies values stamped on the tokens",
      aim2: "investigates how the tokens were manufactured",
      foil2: "investigates how the tokens were exchanged",
      anchor1: "identify the different businesses",
      anchor2: "which techniques were used to manufacture them",
      reason1: "Although values are stamped on the tokens, the historian catalogs stall names to identify businesses.",
      reason2: "Ridges and tool marks are evidence of production methods. The metalworker is not studying how customers used the tokens in exchanges.",
    },
    {
      scene: "cs-purpose-river-sound",
      one: "An environmental archive contains recordings made beside the Vey River at marked times throughout one year. An ecologist identifies frog calls in each recording and totals them by month. She wants to find the season when frogs were most vocally active.",
      two: "A sound engineer examines the same recordings for engine noise. He sorts them by hour rather than by month, comparing the number of passing motorboats heard at different times. His report identifies the busiest hours for boat traffic.",
      aim1: "compares frog activity across the seasons",
      foil1: "compares frog activity along the river",
      aim2: "identifies daily patterns in boat traffic",
      foil2: "identifies yearly changes in boat traffic",
      anchor1: "the season when frogs were most vocally active",
      anchor2: "the busiest hours for boat traffic",
      reason1: "The ecologist groups calls by month to compare seasons; the text does not describe a comparison among locations along the river.",
      reason2: "The engineer sorts recordings by hour of day, so the question concerns daily patterns rather than changes from year to year.",
    },
  ];

  const ctcDistinctResearchPurposes = {
    ...CTC_BASE,
    id: "cross-text-distinct-research-purposes",
    subskill: "response between texts",
    difficulty: "Easy",
    title: "Identify two stated purposes for examining the same materials",
    recognize: "Find the stated aim of each project and keep each aim attached to the text that describes it.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["one-text-only"],
    build(t) {
      const topic = t.pick(CTC_DISTINCT_PURPOSE_TOPICS);
      const content = CTC_passage(topic.one, topic.two);
      const describe = (first, second) => `Text 1 ${first}, whereas Text 2 ${second}.`;
      const correct = describe(topic.aim1, topic.aim2);
      const wrong = [
        [describe(topic.aim1, topic.foil2), `This correctly describes the first project but misstates the second. ${topic.reason2}`],
        [describe(topic.foil1, topic.aim2), `This correctly describes the second project but misstates the first. ${topic.reason1}`],
        [describe(topic.foil1, topic.foil2), `${topic.reason1} ${topic.reason2}`],
      ];
      return {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "paired-passages", content },
        stem: "Which choice best describes the difference between the purposes of the two projects?",
        correct,
        wrong,
        explanation: `The projects use the same source material to answer different questions: Text 1 ${topic.aim1}, and Text 2 ${topic.aim2}. The other choices replace at least one stated aim with a different feature of the material.`,
        steps: [
          `Locate the first project's stated aim: “${topic.anchor1}.”`,
          `Locate the second project's stated aim: “${topic.anchor2}.”`,
          "Check both halves of each choice against those aims; material present in a source need not be the subject of either project.",
        ],
        principles: ["Two projects can use the same evidence for different stated purposes.", "A comparison must describe both texts accurately."],
        trap: "Choosing an option that gives one project's actual purpose but substitutes another available detail for the other project's purpose.",
        hint: "Look for what each researcher wants to learn from the material.",
        estimatedSeconds: 55,
        verify: () => topic.one.includes(topic.anchor1) && topic.two.includes(topic.anchor2) &&
          topic.one.length + topic.two.length >= 150 && topic.one.length + topic.two.length <= 900 &&
          new Set([correct, ...wrong.map(([choice]) => choice)]).size === 4,
      };
    },
  };
  // End additional design: easy-cross-procedure.

  return [
    ctcAuthorVersusCitedView,
    ctcSharedClaim,
    ctcProblemSolution,
    ctcCounterexample,
    ctcExtends,
    ctcApplyExplanation,
    methodChallenge,
    ctcDifferenceInView,
    ctcCommonGround,
    ctcPartialAgreement,
    ctcConditionApplied,
    ctcDifferentEvaluationStandards,
    ctcDistinctResearchPurposes,
  ];
});
